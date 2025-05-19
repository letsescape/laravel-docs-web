# 데이터베이스: 쿼리 빌더 (Database: Query Builder)

- [소개](#introduction)
- [데이터베이스 쿼리 실행](#running-database-queries)
    - [결과를 청크로 분할하기](#chunking-results)
    - [지연 스트리밍으로 결과 처리하기](#streaming-results-lazily)
    - [집계 함수](#aggregates)
- [SELECT 문](#select-statements)
- [Raw 표현식](#raw-expressions)
- [조인(Joins)](#joins)
- [UNION 연산](#unions)
- [기본 WHERE 절](#basic-where-clauses)
    - [Where 절](#where-clauses)
    - [Or Where 절](#or-where-clauses)
    - [Where Not 절](#where-not-clauses)
    - [Where Any / All / None 절](#where-any-all-none-clauses)
    - [JSON Where 절](#json-where-clauses)
    - [추가적인 Where 절](#additional-where-clauses)
    - [논리적 그룹핑](#logical-grouping)
- [고급 WHERE 절](#advanced-where-clauses)
    - [Where Exists 절](#where-exists-clauses)
    - [서브쿼리 Where 절](#subquery-where-clauses)
    - [전체 텍스트 Where 절](#full-text-where-clauses)
- [정렬, 그룹핑, LIMIT 및 OFFSET](#ordering-grouping-limit-and-offset)
    - [정렬](#ordering)
    - [그룹핑](#grouping)
    - [Limit 및 Offset](#limit-and-offset)
- [조건부 절](#conditional-clauses)
- [INSERT 문](#insert-statements)
    - [Upsert](#upserts)
- [UPDATE 문](#update-statements)
    - [JSON 컬럼 업데이트](#updating-json-columns)
    - [증가 및 감소](#increment-and-decrement)
- [DELETE 문](#delete-statements)
- [비관적 잠금](#pessimistic-locking)
- [디버깅](#debugging)

<a name="introduction"></a>
## 소개

라라벨의 데이터베이스 쿼리 빌더는 데이터베이스 쿼리를 쉽고 유연하게 작성하고 실행할 수 있는 직관적인 인터페이스를 제공합니다. 이 기능을 이용하면 애플리케이션에서 대부분의 데이터베이스 작업을 수행할 수 있으며, 라라벨이 지원하는 모든 데이터베이스 시스템과 완벽하게 호환됩니다.

라라벨 쿼리 빌더는 SQL 인젝션 공격을 방지하기 위해 PDO의 파라미터 바인딩을 사용합니다. 따라서 쿼리 빌더의 바인딩에 전달되는 문자열을 따로 정제(clean)하거나 필터링(sanitize)할 필요가 없습니다.

> [!WARNING]  
> PDO는 컬럼명 바인딩을 지원하지 않습니다. 따라서 쿼리에서 참조하는 컬럼명, 특히 "order by" 대상 컬럼명을 사용자 입력 값에 따라 결정하는 일은 절대 피해야 합니다.

<a name="running-database-queries"></a>
## 데이터베이스 쿼리 실행

<a name="retrieving-all-rows-from-a-table"></a>
#### 테이블의 모든 행 가져오기

쿼리를 시작하려면 `DB` 파사드의 `table` 메서드를 사용할 수 있습니다. `table` 메서드는 지정한 테이블에 대한 유연한(체이닝 가능한) 쿼리 빌더 인스턴스를 반환하며, 여기에 다양한 제약 조건을 추가한 후 최종적으로 `get` 메서드를 호출하여 결과를 조회할 수 있습니다.

```
<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * 애플리케이션의 모든 사용자 리스트를 보여줍니다.
     */
    public function index(): View
    {
        $users = DB::table('users')->get();

        return view('user.index', ['users' => $users]);
    }
}
```

`get` 메서드는 쿼리 결과가 담긴 `Illuminate\Support\Collection` 인스턴스를 반환합니다. 컬렉션의 각 결과는 PHP `stdClass` 객체로 표현됩니다. 각 컬럼의 값은 객체의 속성처럼 접근할 수 있습니다.

```
use Illuminate\Support\Facades\DB;

$users = DB::table('users')->get();

foreach ($users as $user) {
    echo $user->name;
}
```

> [!NOTE]  
> 라라벨 컬렉션은 데이터 매핑 및 변환(map/reduce)을 비롯해 매우 강력한 메서드를 다양하게 제공합니다. 더 자세한 내용은 [컬렉션 문서](/docs/11.x/collections)를 참고하시기 바랍니다.

<a name="retrieving-a-single-row-column-from-a-table"></a>
#### 테이블에서 하나의 행 또는 컬럼 값 가져오기

데이터베이스 테이블에서 하나의 행만 가져오고 싶은 경우, `DB` 파사드의 `first` 메서드를 사용할 수 있습니다. 이 메서드는 단일 `stdClass` 객체를 반환합니다.

```
$user = DB::table('users')->where('name', 'John')->first();

return $user->email;
```

특정 조건에 맞는 행을 조회하되, 만약 결과가 없다면 `Illuminate\Database\RecordNotFoundException` 예외를 발생시키고 싶을 때는 `firstOrFail` 메서드를 사용할 수 있습니다. 이 예외가 잡히지 않을 경우, 라라벨은 자동으로 404 HTTP 응답을 반환합니다.

```
$user = DB::table('users')->where('name', 'John')->firstOrFail();
```

전체 행이 아닌 한 개의 값을 가져오고 싶다면 `value` 메서드를 사용하면 됩니다. 이 메서드는 지정한 컬럼의 값을 직접 반환합니다.

```
$email = DB::table('users')->where('name', 'John')->value('email');
```

테이블의 `id` 컬럼 값으로 행을 조회하고자 할 때는 `find` 메서드를 이용합니다.

```
$user = DB::table('users')->find(3);
```

<a name="retrieving-a-list-of-column-values"></a>
#### 특정 컬럼 값의 리스트 가져오기

특정 컬럼 값들의 리스트만 담긴 `Illuminate\Support\Collection` 인스턴스를 얻고 싶다면, `pluck` 메서드를 사용할 수 있습니다. 예시에서는 사용자들의 직함(title) 컬렉션을 가져옵니다.

```
use Illuminate\Support\Facades\DB;

$titles = DB::table('users')->pluck('title');

foreach ($titles as $title) {
    echo $title;
}
```

결과 컬렉션의 키로 사용할 컬럼을 두 번째 인자로 지정할 수도 있습니다.

```
$titles = DB::table('users')->pluck('title', 'name');

foreach ($titles as $name => $title) {
    echo $title;
}
```

<a name="chunking-results"></a>
### 결과를 청크로 분할하기

수천 개의 데이터베이스 레코드를 처리해야 한다면, `DB` 파사드에서 제공하는 `chunk` 메서드를 사용하는 것이 좋습니다. 이 메서드는 결과를 일정 크기(chunk) 단위로 나누어 한 번에 하나씩 클로저에 전달하여 처리합니다. 예를 들어, `users` 테이블 전체를 한 번에 100개씩 청크로 가져오려면 다음과 같습니다.

```
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

DB::table('users')->orderBy('id')->chunk(100, function (Collection $users) {
    foreach ($users as $user) {
        // ...
    }
});
```

클로저에서 `false`를 반환하면, 이후의 청크 처리가 즉시 중단됩니다.

```
DB::table('users')->orderBy('id')->chunk(100, function (Collection $users) {
    // 레코드를 처리...

    return false;
});
```

청크로 데이터를 가져오면서 동시에 레코드를 업데이트할 계획이라면, 예상치 못한 방식으로 청크 결과가 바뀔 수 있습니다. 이 경우에는 항상 `chunkById` 메서드의 사용을 권장합니다. 이 메서드가 자동으로 기본키 기준으로 페이지네이션을 처리해주기 때문입니다.

```
DB::table('users')->where('active', false)
    ->chunkById(100, function (Collection $users) {
        foreach ($users as $user) {
            DB::table('users')
                ->where('id', $user->id)
                ->update(['active' => true]);
        }
    });
```

`chunkById`와 `lazyById` 메서드는 쿼리 실행 시 자체적으로 "where" 조건을 추가합니다. 따라서 직접 조건문을 추가할 때는 [논리적 그룹핑](#logical-grouping)이 필요합니다.

```php
DB::table('users')->where(function ($query) {
    $query->where('credits', 1)->orWhere('credits', 2);
})->chunkById(100, function (Collection $users) {
    foreach ($users as $user) {
        DB::table('users')
            ->where('id', $user->id)
            ->update(['credits' => 3]);
    }
});
```

> [!WARNING]  
> 청크 콜백 안에서 레코드를 업데이트하거나 삭제할 때, 기본키(primary key) 또는 외래키(foreign key) 값이 변경되면 청크 쿼리의 결과에 영향을 줄 수 있습니다. 이로 인해 일부 레코드가 누락될 수 있다는 점에 유의해야 합니다.

<a name="streaming-results-lazily"></a>
### 지연 스트리밍으로 결과 처리하기

`lazy` 메서드는 [chunk 메서드](#chunking-results)처럼 쿼리를 청크 단위로 실행한다는 점에서 유사합니다. 하지만 각각의 청크를 콜백 함수로 넘기는 대신, `lazy()` 메서드는 [`LazyCollection`](/docs/11.x/collections#lazy-collections)을 반환하여 결과를 하나의 스트림처럼 다룰 수 있습니다.

```php
use Illuminate\Support\Facades\DB;

DB::table('users')->orderBy('id')->lazy()->each(function (object $user) {
    // ...
});
```

마찬가지로, 스트리밍 처리 중 조회한 레코드를 업데이트할 계획이라면 `lazyById` 또는 `lazyByIdDesc` 메서드의 사용을 권장합니다. 이 메서드들은 자동으로 기본키 기준 페이지네이션을 처리합니다.

```php
DB::table('users')->where('active', false)
    ->lazyById()->each(function (object $user) {
        DB::table('users')
            ->where('id', $user->id)
            ->update(['active' => true]);
    });
```

> [!WARNING]  
> 반복 도중에 레코드를 업데이트하거나 삭제할 때, 기본키 또는 외래키 값이 바뀌면 청크 쿼리 결과에 영향을 줄 수 있습니다. 이로 인해 일부 레코드가 결과에서 제외될 수 있습니다.

<a name="aggregates"></a>
### 집계 함수

쿼리 빌더는 `count`, `max`, `min`, `avg`, `sum` 등 다양한 집계 함수를 제공합니다. 쿼리를 작성한 후 이러한 집계 메서드를 호출할 수 있습니다.

```
use Illuminate\Support\Facades\DB;

$users = DB::table('users')->count();

$price = DB::table('orders')->max('price');
```

물론, 집계 메서드는 다른 절과 함께 사용할 수 있어 계산 방식을 세밀하게 제어할 수 있습니다.

```
$price = DB::table('orders')
    ->where('finalized', 1)
    ->avg('price');
```

<a name="determining-if-records-exist"></a>
#### 레코드 존재 여부 판단하기

쿼리 조건에 맞는 레코드가 하나라도 존재하는지 확인할 때는 `count` 대신 `exists` 또는 `doesntExist` 메서드를 사용할 수 있습니다.

```
if (DB::table('orders')->where('finalized', 1)->exists()) {
    // ...
}

if (DB::table('orders')->where('finalized', 1)->doesntExist()) {
    // ...
}
```

<a name="select-statements"></a>
## SELECT 문

<a name="specifying-a-select-clause"></a>
#### SELECT 절 지정하기

항상 모든 컬럼을 조회할 필요는 없습니다. `select` 메서드를 사용하면 쿼리의 SELECT 절을 원하는 컬럼으로 맞춤 지정할 수 있습니다.

```
use Illuminate\Support\Facades\DB;

$users = DB::table('users')
    ->select('name', 'email as user_email')
    ->get();
```

`distinct` 메서드를 사용하면 쿼리 결과에서 중복 레코드를 제거할 수 있습니다.

```
$users = DB::table('users')->distinct()->get();
```

이미 쿼리 빌더 인스턴스를 가지고 있고 기존 SELECT 절에 컬럼을 추가하고 싶다면, `addSelect` 메서드를 사용할 수 있습니다.

```
$query = DB::table('users')->select('name');

$users = $query->addSelect('age')->get();
```

<a name="raw-expressions"></a>
## Raw 표현식

가끔 쿼리에 임의의 문자열을 삽입해야 할 때가 있습니다. 이럴 때는 `DB` 파사드의 `raw` 메서드를 활용하여 Raw 문자열 표현식을 생성할 수 있습니다.

```
$users = DB::table('users')
    ->select(DB::raw('count(*) as user_count, status'))
    ->where('status', '<>', 1)
    ->groupBy('status')
    ->get();
```

> [!WARNING]  
> Raw 구문은 쿼리에 문자열 그대로 삽입되므로, SQL 인젝션 취약점이 발생하지 않도록 각별히 주의해야 합니다.

<a name="raw-methods"></a>
### Raw 메서드

`DB::raw` 메서드 대신 다음과 같은 메서드들을 이용해 쿼리의 여러 부분에 raw 표현식을 삽입할 수 있습니다. **주의: Raw 표현식이 들어가는 쿼리는 라라벨이 SQL 인젝션을 방지해줄 수 없으므로 사용 시 각별한 주의가 필요합니다.**

<a name="selectraw"></a>
#### `selectRaw`

`selectRaw` 메서드는 `addSelect(DB::raw(/* ... */))` 대신 사용할 수 있습니다. 두 번째 인자로 바인딩 배열을 선택적으로 넘겨줄 수 있습니다.

```
$orders = DB::table('orders')
    ->selectRaw('price * ? as price_with_tax', [1.0825])
    ->get();
```

<a name="whereraw-orwhereraw"></a>
#### `whereRaw / orWhereRaw`

`whereRaw`와 `orWhereRaw` 메서드는 쿼리에 Raw "where" 절을 추가할 때 사용합니다. 두 번째 인자로 바인딩 배열을 넘길 수 있습니다.

```
$orders = DB::table('orders')
    ->whereRaw('price > IF(state = "TX", ?, 100)', [200])
    ->get();
```

<a name="havingraw-orhavingraw"></a>
#### `havingRaw / orHavingRaw`

`havingRaw`와 `orHavingRaw` 메서드는 "having" 절에 Raw 문자열을 값으로 지정하는 데 사용합니다. 두 번째 인자로 바인딩 배열을 넣을 수 있습니다.

```
$orders = DB::table('orders')
    ->select('department', DB::raw('SUM(price) as total_sales'))
    ->groupBy('department')
    ->havingRaw('SUM(price) > ?', [2500])
    ->get();
```

<a name="orderbyraw"></a>
#### `orderByRaw`

`orderByRaw` 메서드는 "order by" 절에 Raw 문자열을 지정할 때 활용합니다.

```
$orders = DB::table('orders')
    ->orderByRaw('updated_at - created_at DESC')
    ->get();
```

<a name="groupbyraw"></a>
### `groupByRaw`

`groupByRaw` 메서드는 `group by` 절에 Raw 문자열을 사용할 때 쓰입니다.

```
$orders = DB::table('orders')
    ->select('city', 'state')
    ->groupByRaw('city, state')
    ->get();
```

<a name="joins"></a>
## 조인(Joins)

<a name="inner-join-clause"></a>
#### Inner Join 절

쿼리 빌더는 쿼리에 조인 절을 추가하는 것도 지원합니다. 가장 기본적인 "inner join"을 수행하려면 `join` 메서드를 사용합니다. `join`의 첫 번째 인자는 조인할 테이블명이고, 나머지 인자들은 조인 조건(컬럼 제약 조건)을 지정합니다. 하나의 쿼리에서 여러 테이블을 조인할 수도 있습니다.

```
use Illuminate\Support\Facades\DB;

$users = DB::table('users')
    ->join('contacts', 'users.id', '=', 'contacts.user_id')
    ->join('orders', 'users.id', '=', 'orders.user_id')
    ->select('users.*', 'contacts.phone', 'orders.price')
    ->get();
```

<a name="left-join-right-join-clause"></a>
#### Left Join / Right Join 절

"inner join" 대신 "left join" 또는 "right join"을 사용하려면 `leftJoin` 또는 `rightJoin` 메서드를 사용하면 됩니다. 이 메서드들은 `join` 메서드와 동일한 인자를 받습니다.

```
$users = DB::table('users')
    ->leftJoin('posts', 'users.id', '=', 'posts.user_id')
    ->get();

$users = DB::table('users')
    ->rightJoin('posts', 'users.id', '=', 'posts.user_id')
    ->get();
```

<a name="cross-join-clause"></a>
#### Cross Join 절

"cross join"을 수행하려면 `crossJoin` 메서드를 사용할 수 있습니다. 크로스 조인은 첫 번째 테이블과 조인 대상 테이블의 데카르트 곱(cartesian product)을 만듭니다.

```
$sizes = DB::table('sizes')
    ->crossJoin('colors')
    ->get();
```

<a name="advanced-join-clauses"></a>
#### 고급 조인 절

더 복잡한 조인 조건을 명시하고 싶다면, `join` 메서드의 두 번째 인자에 클로저를 전달할 수 있습니다. 이 클로저는 `Illuminate\Database\Query\JoinClause` 인스턴스를 인자로 받아, 조인 절의 제약을 세부적으로 지정할 수 있습니다.

```
DB::table('users')
    ->join('contacts', function (JoinClause $join) {
        $join->on('users.id', '=', 'contacts.user_id')->orOn(/* ... */);
    })
    ->get();
```

조인에서 `where` 절을 사용하려면, `JoinClause` 인스턴스에서 제공하는 `where`와 `orWhere` 메서드를 사용하면 됩니다. 이때 두 컬럼을 비교하는 대신, 컬럼과 값의 비교를 하게 됩니다.

```
DB::table('users')
    ->join('contacts', function (JoinClause $join) {
        $join->on('users.id', '=', 'contacts.user_id')
            ->where('contacts.user_id', '>', 5);
    })
    ->get();
```

<a name="subquery-joins"></a>
#### 서브쿼리 조인

`joinSub`, `leftJoinSub`, `rightJoinSub` 메서드를 이용해 쿼리에 서브쿼리를 조인할 수 있습니다. 이 메서드들은 서브쿼리, 테이블 별칭, 관련 컬럼을 정의하는 클로저를 세 개의 인자로 받습니다. 아래 예시에서는 각 사용자 레코드에 해당 사용자의 최근에 발행한 블로그 포스트의 `created_at` 타임스탬프도 포함해서 조회합니다.

```
$latestPosts = DB::table('posts')
    ->select('user_id', DB::raw('MAX(created_at) as last_post_created_at'))
    ->where('is_published', true)
    ->groupBy('user_id');

$users = DB::table('users')
    ->joinSub($latestPosts, 'latest_posts', function (JoinClause $join) {
        $join->on('users.id', '=', 'latest_posts.user_id');
    })->get();
```

<a name="lateral-joins"></a>
#### Lateral 조인

> [!WARNING]  
> Lateral 조인은 현재 PostgreSQL, MySQL >= 8.0.14, 그리고 SQL Server에서만 지원됩니다.

`joinLateral` 및 `leftJoinLateral` 메서드를 사용하여 서브쿼리와 "lateral join"을 수행할 수 있습니다. 이 메서드들은 서브쿼리와 테이블 별칭 두 개의 인자를 받습니다. 조인 조건은 서브쿼리 내부의 `where` 절에서 지정해야 하며, lateral 조인은 각 행마다 서브쿼리를 평가할 수 있어, 서브쿼리 외부의 컬럼을 참조할 수 있습니다.

아래는 사용자별로 최근 세 개의 블로그 포스트를 함께 조회하는 예시입니다. 각 사용자는 최근 포스트가 최대 3개까지 결과로 나올 수 있으며, 조인 조건은 서브쿼리 내부의 `whereColumn` 절을 사용해 현재 사용자 행을 참조합니다.

```
$latestPosts = DB::table('posts')
    ->select('id as post_id', 'title as post_title', 'created_at as post_created_at')
    ->whereColumn('user_id', 'users.id')
    ->orderBy('created_at', 'desc')
    ->limit(3);

$users = DB::table('users')
    ->joinLateral($latestPosts, 'latest_posts')
    ->get();
```

<a name="unions"></a>
## UNION 연산

쿼리 빌더는 여러 쿼리를 "union"으로 결합하는 간편한 방법도 제공합니다. 예를 들어, 하나의 쿼리를 만들고, `union` 메서드를 이용해 다른 쿼리들과 결합할 수 있습니다.

```
use Illuminate\Support\Facades\DB;

$first = DB::table('users')
    ->whereNull('first_name');

$users = DB::table('users')
    ->whereNull('last_name')
    ->union($first)
    ->get();
```

`union` 메서드 외에도 쿼리 빌더는 `unionAll` 메서드를 제공합니다. `unionAll`로 결합된 쿼리는 중복 결과가 제거되지 않습니다. `unionAll`의 사용법은 `union`과 동일합니다.

<a name="basic-where-clauses"></a>
## 기본 WHERE 절

<a name="where-clauses"></a>
### Where 절

쿼리 빌더의 `where` 메서드를 사용해 쿼리에 "where" 절을 추가할 수 있습니다. 가장 기본적인 형태의 `where`는 세 개의 인자를 받습니다. 첫 번째 인자는 컬럼 이름, 두 번째는 데이터베이스에서 지원하는 연산자(예: =, >, < 등), 세 번째는 비교 대상 값입니다.

아래 예시는 `votes` 컬럼 값이 `100`이고 `age` 컬럼 값이 `35`보다 큰 사용자들을 조회합니다.

```
$users = DB::table('users')
    ->where('votes', '=', 100)
    ->where('age', '>', 35)
    ->get();
```

더 간단하게, 특정 컬럼이 주어진 값과 `=` 비교만 하고 싶은 경우에는 값을 두 번째 인자로만 넘겨도 됩니다. 라라벨은 자동으로 `=` 연산자를 사용합니다.

```
$users = DB::table('users')->where('votes', 100)->get();
```

이 외에도 데이터베이스가 지원하는 모든 연산자를 사용할 수 있습니다.

```
$users = DB::table('users')
    ->where('votes', '>=', 100)
    ->get();

$users = DB::table('users')
    ->where('votes', '<>', 100)
    ->get();

$users = DB::table('users')
    ->where('name', 'like', 'T%')
    ->get();
```

또한, 여러 조건을 배열 형태로 전달할 수도 있습니다. 배열의 각 요소는 일반적인 `where` 메서드에 전달하는 세 개의 인자를 포함한 배열이어야 합니다.

```
$users = DB::table('users')->where([
    ['status', '=', '1'],
    ['subscribed', '<>', '1'],
])->get();
```

> [!WARNING]  
> PDO는 컬럼명 바인딩을 지원하지 않습니다. 따라서 쿼리에서 참조하는 컬럼명, 특히 "order by" 컬럼명을 사용자 입력 값에 따라 결정하면 안 됩니다.

> [!WARNING]
> MySQL 및 MariaDB는 문자열과 숫자 비교 시, 문자열을 자동으로 정수로 변환합니다. 이 과정에서 숫자가 아닌 문자열은 `0`으로 변환되기 때문에 예기치 않은 결과가 나올 수 있습니다. 예를 들어, 테이블의 `secret` 컬럼 값이 `aaa`이고, `User::where('secret', 0)` 쿼리를 실행하면 해당 행이 조회됩니다. 이를 방지하려면 쿼리 조건에 사용하는 값의 타입을 반드시 적절하게 변환해주어야 합니다.

<a name="or-where-clauses"></a>
### Or Where 절

여러 번 `where` 메서드를 체이닝할 경우, 각각의 where 절은 `and` 연산자로 연결됩니다. 하지만, `or` 연산자로 연결하고 싶다면 `orWhere` 메서드를 사용할 수 있습니다. `orWhere` 메서드는 `where` 메서드와 동일한 인자를 받습니다.

```
$users = DB::table('users')
    ->where('votes', '>', 100)
    ->orWhere('name', 'John')
    ->get();
```

`or` 조건을 괄호로 감싸서 그룹화하고 싶다면, 첫 번째 인자로 클로저를 전달하면 됩니다.

```
$users = DB::table('users')
    ->where('votes', '>', 100)
    ->orWhere(function (Builder $query) {
        $query->where('name', 'Abigail')
            ->where('votes', '>', 50);
        })
    ->get();
```

위의 예시는 다음 SQL을 생성합니다.

```sql
select * from users where votes > 100 or (name = 'Abigail' and votes > 50)
```

> [!WARNING]  
> 예기치 않은 동작을 방지하기 위해 `orWhere`를 사용할 때는 항상 그룹핑(괄호 묶기)을 해주는 것이 좋습니다. 이는 글로벌 스코프가 적용될 때 의도하지 않은 쿼리가 될 수 있기 때문입니다.

<a name="where-not-clauses"></a>

### Where Not 절

`whereNot` 및 `orWhereNot` 메서드를 사용하면 특정 쿼리 제약 조건 그룹을 부정(negate)할 수 있습니다. 예를 들어, 아래 쿼리는 할인(clearance) 상품이거나 가격이 10 미만인 상품을 제외하고 가져옵니다.

```
$products = DB::table('products')
    ->whereNot(function (Builder $query) {
        $query->where('clearance', true)
            ->orWhere('price', '<', 10);
        })
    ->get();
```

<a name="where-any-all-none-clauses"></a>
### Where Any / All / None 절

가끔 여러 컬럼에 동일한 쿼리 제약 조건을 적용하고 싶을 때가 있습니다. 예를 들어, 지정한 컬럼 목록 중 어느 한 컬럼이라도 특정 값과 `LIKE` 조건을 만족하는 모든 레코드를 검색하고 싶을 수 있습니다. 이럴 때는 `whereAny` 메서드를 사용하면 됩니다.

```
$users = DB::table('users')
    ->where('active', true)
    ->whereAny([
        'name',
        'email',
        'phone',
    ], 'like', 'Example%')
    ->get();
```

위 쿼리는 다음과 같은 SQL을 생성하게 됩니다.

```sql
SELECT *
FROM users
WHERE active = true AND (
    name LIKE 'Example%' OR
    email LIKE 'Example%' OR
    phone LIKE 'Example%'
)
```

이와 비슷하게, `whereAll` 메서드는 지정한 컬럼 모두가 특정 조건을 만족할 때 레코드를 조회할 수 있습니다.

```
$posts = DB::table('posts')
    ->where('published', true)
    ->whereAll([
        'title',
        'content',
    ], 'like', '%Laravel%')
    ->get();
```

위 쿼리는 다음과 같은 SQL을 생성합니다.

```sql
SELECT *
FROM posts
WHERE published = true AND (
    title LIKE '%Laravel%' AND
    content LIKE '%Laravel%'
)
```

또한, `whereNone` 메서드를 사용하면 지정한 컬럼들 중 어느 것도 특정 조건에 일치하지 않는 레코드를 조회할 수 있습니다.

```
$posts = DB::table('albums')
    ->where('published', true)
    ->whereNone([
        'title',
        'lyrics',
        'tags',
    ], 'like', '%explicit%')
    ->get();
```

위 쿼리는 다음과 같은 SQL을 생성합니다.

```sql
SELECT *
FROM albums
WHERE published = true AND NOT (
    title LIKE '%explicit%' OR
    lyrics LIKE '%explicit%' OR
    tags LIKE '%explicit%'
)
```

<a name="json-where-clauses"></a>
### JSON Where 절

라라벨은 JSON 컬럼 타입을 지원하는 데이터베이스에 대해 JSON 컬럼 쿼리도 지원합니다. 현재 MariaDB 10.3+, MySQL 8.0+, PostgreSQL 12.0+, SQL Server 2017+, SQLite 3.39.0+에서 지원합니다. JSON 컬럼에 대해 쿼리하려면 `->` 연산자를 사용합니다.

```
$users = DB::table('users')
    ->where('preferences->dining->meal', 'salad')
    ->get();
```

`whereJsonContains`를 사용하면 JSON 배열을 쿼리할 수 있습니다.

```
$users = DB::table('users')
    ->whereJsonContains('options->languages', 'en')
    ->get();
```

MariaDB, MySQL, PostgreSQL 데이터베이스를 사용하는 경우, `whereJsonContains`에 값의 배열을 전달할 수도 있습니다.

```
$users = DB::table('users')
    ->whereJsonContains('options->languages', ['en', 'de'])
    ->get();
```

`whereJsonLength` 메서드를 사용하면 JSON 배열의 길이에 따라 쿼리를 작성할 수 있습니다.

```
$users = DB::table('users')
    ->whereJsonLength('options->languages', 0)
    ->get();

$users = DB::table('users')
    ->whereJsonLength('options->languages', '>', 1)
    ->get();
```

<a name="additional-where-clauses"></a>
### 기타 Where 절

**whereLike / orWhereLike / whereNotLike / orWhereNotLike**

`whereLike` 메서드를 사용하면 쿼리에 문자열 패턴 매칭을 위한 "LIKE" 절을 추가할 수 있습니다. 이 메서드는 데이터베이스에 종속적이지 않은 방법으로 문자열 검색 쿼리를 작성할 수 있게 해주며, 대소문자 구분 여부를 설정할 수 있습니다. 기본적으로 문자열 매칭은 대소문자를 구분하지 않습니다.

```
$users = DB::table('users')
    ->whereLike('name', '%John%')
    ->get();
```

`caseSensitive` 인수를 사용하면 대소문자를 구분하는 검색도 가능합니다.

```
$users = DB::table('users')
    ->whereLike('name', '%John%', caseSensitive: true)
    ->get();
```

`orWhereLike` 메서드는 "or" 조건으로 LIKE 절을 추가할 수 있습니다.

```
$users = DB::table('users')
    ->where('votes', '>', 100)
    ->orWhereLike('name', '%John%')
    ->get();
```

`whereNotLike` 메서드는 쿼리에 "NOT LIKE" 절을 추가할 수 있습니다.

```
$users = DB::table('users')
    ->whereNotLike('name', '%John%')
    ->get();
```

마찬가지로, `orWhereNotLike`를 사용하면 "or" 조건과 함께 NOT LIKE 절을 추가할 수 있습니다.

```
$users = DB::table('users')
    ->where('votes', '>', 100)
    ->orWhereNotLike('name', '%John%')
    ->get();
```

> [!WARNING]
> `whereLike`의 대소문자 구분 옵션은 현재 SQL Server에서는 지원되지 않습니다.

**whereIn / whereNotIn / orWhereIn / orWhereNotIn**

`whereIn` 메서드는 지정한 컬럼의 값이 주어진 배열 내에 포함되는지 확인합니다.

```
$users = DB::table('users')
    ->whereIn('id', [1, 2, 3])
    ->get();
```

`whereNotIn` 메서드는 지정한 컬럼의 값이 배열에 포함되지 않은 경우를 확인합니다.

```
$users = DB::table('users')
    ->whereNotIn('id', [1, 2, 3])
    ->get();
```

또한, `whereIn` 메서드의 두 번째 인수로 쿼리 객체를 전달할 수도 있습니다.

```
$activeUsers = DB::table('users')->select('id')->where('is_active', 1);

$users = DB::table('comments')
    ->whereIn('user_id', $activeUsers)
    ->get();
```

위 예제는 아래와 같은 SQL을 생성합니다.

```sql
select * from comments where user_id in (
    select id
    from users
    where is_active = 1
)
```

> [!WARNING]  
> 쿼리에 대용량의 정수 배열을 바인딩하려는 경우, `whereIntegerInRaw` 또는 `whereIntegerNotInRaw` 메서드를 사용하면 메모리 사용량을 크게 줄일 수 있습니다.

**whereBetween / orWhereBetween**

`whereBetween` 메서드는 컬럼의 값이 두 값 사이에 있는지 확인합니다.

```
$users = DB::table('users')
    ->whereBetween('votes', [1, 100])
    ->get();
```

**whereNotBetween / orWhereNotBetween**

`whereNotBetween` 메서드는 컬럼의 값이 두 값의 범위 바깥에 있는지 확인합니다.

```
$users = DB::table('users')
    ->whereNotBetween('votes', [1, 100])
    ->get();
```

**whereBetweenColumns / whereNotBetweenColumns / orWhereBetweenColumns / orWhereNotBetweenColumns**

`whereBetweenColumns` 메서드는 동일한 테이블 행 내에서 컬럼의 값이 두 다른 컬럼의 값 사이에 있는지 확인합니다.

```
$patients = DB::table('patients')
    ->whereBetweenColumns('weight', ['minimum_allowed_weight', 'maximum_allowed_weight'])
    ->get();
```

`whereNotBetweenColumns` 메서드는 컬럼의 값이 두 다른 컬럼 값의 범위 바깥에 있는지 확인합니다.

```
$patients = DB::table('patients')
    ->whereNotBetweenColumns('weight', ['minimum_allowed_weight', 'maximum_allowed_weight'])
    ->get();
```

**whereNull / whereNotNull / orWhereNull / orWhereNotNull**

`whereNull` 메서드는 지정한 컬럼의 값이 `NULL`인지 확인합니다.

```
$users = DB::table('users')
    ->whereNull('updated_at')
    ->get();
```

`whereNotNull` 메서드는 컬럼 값이 `NULL`이 아님을 확인합니다.

```
$users = DB::table('users')
    ->whereNotNull('updated_at')
    ->get();
```

**whereDate / whereMonth / whereDay / whereYear / whereTime**

`whereDate` 메서드는 컬럼 값이 특정 날짜와 같은지 비교할 때 사용합니다.

```
$users = DB::table('users')
    ->whereDate('created_at', '2016-12-31')
    ->get();
```

`whereMonth` 메서드는 컬럼 값이 특정 월과 같은지 비교할 때 사용합니다.

```
$users = DB::table('users')
    ->whereMonth('created_at', '12')
    ->get();
```

`whereDay` 메서드는 컬럼 값이 특정 일과 같은지 비교할 때 사용합니다.

```
$users = DB::table('users')
    ->whereDay('created_at', '31')
    ->get();
```

`whereYear` 메서드는 컬럼 값이 특정 연도와 같은지 비교할 때 사용합니다.

```
$users = DB::table('users')
    ->whereYear('created_at', '2016')
    ->get();
```

`whereTime` 메서드는 컬럼 값이 특정 시간과 같은지 비교할 때 사용합니다.

```
$users = DB::table('users')
    ->whereTime('created_at', '=', '11:20:45')
    ->get();
```

**wherePast / whereFuture / whereToday / whereBeforeToday / whereAfterToday**

`wherePast`와 `whereFuture` 메서드는 컬럼 값이 과거인지, 미래인지 판단하는 데 사용합니다.

```
$invoices = DB::table('invoices')
    ->wherePast('due_at')
    ->get();

$invoices = DB::table('invoices')
    ->whereFuture('due_at')
    ->get();
```

`whereNowOrPast`와 `whereNowOrFuture` 메서드는 현재 날짜와 시간을 포함해 과거 또는 미래까지 판단할 수 있습니다.

```
$invoices = DB::table('invoices')
    ->whereNowOrPast('due_at')
    ->get();

$invoices = DB::table('invoices')
    ->whereNowOrFuture('due_at')
    ->get();
```

`whereToday`, `whereBeforeToday`, `whereAfterToday` 메서드는 각각 오늘, 오늘 이전, 오늘 이후인지를 판단할 수 있습니다.

```
$invoices = DB::table('invoices')
    ->whereToday('due_at')
    ->get();

$invoices = DB::table('invoices')
    ->whereBeforeToday('due_at')
    ->get();

$invoices = DB::table('invoices')
    ->whereAfterToday('due_at')
    ->get();
```

마찬가지로, `whereTodayOrBefore`와 `whereTodayOrAfter` 메서드를 사용해 '오늘과 그 이전', 또는 '오늘과 그 이후'를 포함한 조건으로 판단할 수도 있습니다.

```
$invoices = DB::table('invoices')
    ->whereTodayOrBefore('due_at')
    ->get();

$invoices = DB::table('invoices')
    ->whereTodayOrAfter('due_at')
    ->get();
```

**whereColumn / orWhereColumn**

`whereColumn` 메서드는 두 컬럼의 값이 같은지 비교할 때 사용합니다.

```
$users = DB::table('users')
    ->whereColumn('first_name', 'last_name')
    ->get();
```

또한, `whereColumn` 메서드에는 비교 연산자를 함께 전달할 수도 있습니다.

```
$users = DB::table('users')
    ->whereColumn('updated_at', '>', 'created_at')
    ->get();
```

또한, 컬럼 비교 조건 배열을 전달할 수도 있습니다. 이 경우 조건들은 `and`로 결합됩니다.

```
$users = DB::table('users')
    ->whereColumn([
        ['first_name', '=', 'last_name'],
        ['updated_at', '>', 'created_at'],
    ])->get();
```

<a name="logical-grouping"></a>
### 논리 그룹화

여러 "where" 절을 괄호로 묶어 쿼리의 논리적 그룹화를 구현하고 싶을 때가 있습니다. 실제로, 원치 않는 쿼리 결과를 피하기 위해서는 `orWhere` 메서드 호출을 반드시 괄호로 그룹화해 사용하는 것이 좋습니다. 이를 위해 `where` 메서드에 클로저(익명 함수)를 전달하면 됩니다.

```
$users = DB::table('users')
    ->where('name', '=', 'John')
    ->where(function (Builder $query) {
        $query->where('votes', '>', 100)
            ->orWhere('title', '=', 'Admin');
    })
    ->get();
```

위 코드와 같이, `where` 메서드에 클로저를 전달하면 쿼리 빌더가 제약 조건 그룹을 괄호로 묶어서 생성하게 됩니다. 클로저는 쿼리 빌더 인스턴스를 인자로 받아 이 그룹 내에서 추가적인 조건을 지정할 수 있습니다. 위 예시는 다음과 같은 SQL을 생성합니다.

```sql
select * from users where name = 'John' and (votes > 100 or title = 'Admin')
```

> [!WARNING]  
> 글로벌 스코프가 적용될 때 원치 않는 동작을 방지하려면 항상 `orWhere` 호출을 괄호로 그룹화해야 합니다.

<a name="advanced-where-clauses"></a>
## 고급 Where 절

<a name="where-exists-clauses"></a>
### Where Exists 절

`whereExists` 메서드를 사용하면 "where exists" SQL 절을 작성할 수 있습니다. `whereExists` 메서드는 쿼리 빌더 인스턴스를 받는 클로저를 인자로 받아, "exists" 조건 안에 사용될 쿼리를 정의할 수 있습니다.

```
$users = DB::table('users')
    ->whereExists(function (Builder $query) {
        $query->select(DB::raw(1))
            ->from('orders')
            ->whereColumn('orders.user_id', 'users.id');
    })
    ->get();
```

또는, 클로저 대신 쿼리 객체를 `whereExists`에 직접 전달할 수도 있습니다.

```
$orders = DB::table('orders')
    ->select(DB::raw(1))
    ->whereColumn('orders.user_id', 'users.id');

$users = DB::table('users')
    ->whereExists($orders)
    ->get();
```

위 두 예제는 아래와 같은 SQL을 생성합니다.

```sql
select * from users
where exists (
    select 1
    from orders
    where orders.user_id = users.id
)
```

<a name="subquery-where-clauses"></a>
### 서브쿼리 Where 절

때로는 서브쿼리의 결과와 특정 값을 비교하는 "where" 절이 필요할 수 있습니다. 이 경우 클로저와 값을 `where` 메서드에 함께 전달하면 됩니다. 예를 들어, 아래 쿼리는 지정한 타입의 최근 "membership"을 가진 모든 사용자를 조회합니다.

```
use App\Models\User;
use Illuminate\Database\Query\Builder;

$users = User::where(function (Builder $query) {
    $query->select('type')
        ->from('membership')
        ->whereColumn('membership.user_id', 'users.id')
        ->orderByDesc('membership.start_date')
        ->limit(1);
}, 'Pro')->get();
```

또는, 컬럼 값을 서브쿼리 결과와 비교해야 할 때에는 컬럼명, 연산자, 클로저를 `where`에 전달하면 됩니다. 예를 들어, 아래 쿼리는 금액(amount)이 평균보다 적은 모든 수입 레코드를 조회합니다.

```
use App\Models\Income;
use Illuminate\Database\Query\Builder;

$incomes = Income::where('amount', '<', function (Builder $query) {
    $query->selectRaw('avg(i.amount)')->from('incomes as i');
})->get();
```

<a name="full-text-where-clauses"></a>
### 전문 검색(Full Text) Where 절

> [!WARNING]  
> MariaDB, MySQL, PostgreSQL에서만 전문 검색 Where 절을 지원합니다.

`whereFullText` 및 `orWhereFullText` 메서드는 [전문 인덱스](/docs/11.x/migrations#available-index-types)가 적용된 컬럼에 대해 전문 검색 "where" 절을 추가할 수 있게 해줍니다. 이 메서드들은 라라벨이 사용하는 데이터베이스에 맞는 적절한 SQL 구문으로 자동 변환됩니다. 예를 들어 MariaDB 또는 MySQL을 사용할 때는 `MATCH AGAINST` 구문을 생성합니다.

```
$users = DB::table('users')
    ->whereFullText('bio', 'web developer')
    ->get();
```

<a name="ordering-grouping-limit-and-offset"></a>
## 정렬, 그룹화, Limit, Offset

<a name="ordering"></a>
### 정렬(Ordering)

<a name="orderby"></a>
#### `orderBy` 메서드

`orderBy` 메서드는 결과를 지정한 컬럼으로 정렬할 수 있습니다. 첫 번째 인자는 정렬하려는 컬럼명, 두 번째 인자는 정렬 방향(`asc` 또는 `desc`)입니다.

```
$users = DB::table('users')
    ->orderBy('name', 'desc')
    ->get();
```

여러 컬럼으로 정렬하려면 `orderBy`를 여러 번 호출하면 됩니다.

```
$users = DB::table('users')
    ->orderBy('name', 'desc')
    ->orderBy('email', 'asc')
    ->get();
```

<a name="latest-oldest"></a>
#### `latest` 및 `oldest` 메서드

`latest`와 `oldest` 메서드를 사용하면 날짜 기준으로 쉽게 정렬할 수 있습니다. 기본적으로 테이블의 `created_at` 컬럼으로 정렬됩니다. 원하는 정렬 기준 컬럼명을 직접 지정할 수도 있습니다.

```
$user = DB::table('users')
    ->latest()
    ->first();
```

<a name="random-ordering"></a>
#### 무작위 정렬

`inRandomOrder` 메서드를 사용하면 쿼리 결과를 무작위 순서로 정렬할 수 있습니다. 예를 들어, 임의의 사용자를 가져오고 싶을 때 사용할 수 있습니다.

```
$randomUser = DB::table('users')
    ->inRandomOrder()
    ->first();
```

<a name="removing-existing-orderings"></a>
#### 기존 정렬 제거

`reorder` 메서드는 이전에 적용된 모든 "order by" 절을 제거합니다.

```
$query = DB::table('users')->orderBy('name');

$unorderedUsers = $query->reorder()->get();
```

`reorder` 호출 시 컬럼명과 정렬 방향을 함께 전달할 수도 있습니다. 이 경우 기존의 모든 정렬 조건이 제거되고, 새로운 정렬만 적용됩니다.

```
$query = DB::table('users')->orderBy('name');

$usersOrderedByEmail = $query->reorder('email', 'desc')->get();
```

<a name="grouping"></a>

### 그룹화

<a name="groupby-having"></a>
#### `groupBy` 및 `having` 메서드

예상하신 대로, `groupBy`와 `having` 메서드를 사용하여 쿼리 결과를 그룹화할 수 있습니다. `having` 메서드의 시그니처는 `where` 메서드와 유사합니다.

```
$users = DB::table('users')
    ->groupBy('account_id')
    ->having('account_id', '>', 100)
    ->get();
```

`havingBetween` 메서드를 사용하면 지정한 범위 내의 결과만 필터링할 수 있습니다.

```
$report = DB::table('orders')
    ->selectRaw('count(id) as number_of_orders, customer_id')
    ->groupBy('customer_id')
    ->havingBetween('number_of_orders', [5, 15])
    ->get();
```

`groupBy` 메서드에 여러 개의 인수를 전달하여, 여러 컬럼을 기준으로 그룹화할 수도 있습니다.

```
$users = DB::table('users')
    ->groupBy('first_name', 'status')
    ->having('account_id', '>', 100)
    ->get();
```

보다 고급스러운 `having` 조건이 필요하다면 [`havingRaw`](#raw-methods) 메서드를 참고하십시오.

<a name="limit-and-offset"></a>
### Limit 및 Offset

<a name="skip-take"></a>
#### `skip` 및 `take` 메서드

쿼리에서 반환되는 결과 개수를 제한하거나, 특정 개수만큼 건너뛰고 싶을 때는 `skip`과 `take` 메서드를 사용할 수 있습니다.

```
$users = DB::table('users')->skip(10)->take(5)->get();
```

또는, `limit`과 `offset` 메서드를 사용할 수도 있습니다. 이 두 메서드는 각각 `take`, `skip` 메서드와 동일하게 동작합니다.

```
$users = DB::table('users')
    ->offset(10)
    ->limit(5)
    ->get();
```

<a name="conditional-clauses"></a>
## 조건부 절(Conditional Clauses)

경우에 따라, 특정 조건에 따라 쿼리의 일부 절을 적용하고 싶을 때가 있습니다. 예를 들어, 들어오는 HTTP 요청에 특정 입력 값이 존재할 때만 `where` 절을 추가하고 싶은 경우가 있습니다. 이런 상황에서는 `when` 메서드를 사용할 수 있습니다.

```
$role = $request->input('role');

$users = DB::table('users')
    ->when($role, function (Builder $query, string $role) {
        $query->where('role_id', $role);
    })
    ->get();
```

`when` 메서드는 첫 번째 인수가 `true`로 평가될 때만 전달된 클로저를 실행합니다. 만약 첫 번째 인수가 `false`라면 클로저는 실행되지 않습니다. 즉, 위 예시에서 `when` 메서드에 전달된 클로저는 요청에 전달된 `role` 필드가 존재하고, 그 값이 `true`로 평가될 때만 실행됩니다.

또한 `when` 메서드에 세 번째 인수로 또 다른 클로저를 전달할 수 있습니다. 이 클로저는 첫 번째 인수가 `false`로 평가될 때만 실행됩니다. 아래 예시는 이 기능을 활용해 쿼리의 기본 정렬 기준을 설정하는 방법을 보여줍니다.

```
$sortByVotes = $request->boolean('sort_by_votes');

$users = DB::table('users')
    ->when($sortByVotes, function (Builder $query, bool $sortByVotes) {
        $query->orderBy('votes');
    }, function (Builder $query) {
        $query->orderBy('name');
    })
    ->get();
```

<a name="insert-statements"></a>
## Insert 구문

쿼리 빌더는 데이터베이스 테이블에 레코드를 삽입할 수 있는 `insert` 메서드를 제공합니다. `insert` 메서드는 컬럼명과 값의 배열을 인수로 받습니다.

```
DB::table('users')->insert([
    'email' => 'kayla@example.com',
    'votes' => 0
]);
```

여러 레코드를 한 번에 삽입하려면, 다차원 배열을 전달합니다. 각각의 배열은 테이블에 삽입할 하나의 레코드를 나타냅니다.

```
DB::table('users')->insert([
    ['email' => 'picard@example.com', 'votes' => 0],
    ['email' => 'janeway@example.com', 'votes' => 0],
]);
```

`insertOrIgnore` 메서드는 레코드를 데이터베이스에 삽입할 때 발생하는 오류를 무시합니다. 이 메서드를 사용할 때는, 중복 레코드 오류뿐만 아니라, 데이터베이스 엔진에 따라 다른 종류의 오류들도 무시될 수 있다는 점을 유의해야 합니다. 예를 들어, `insertOrIgnore`는 [MySQL의 strict mode를 무시합니다](https://dev.mysql.com/doc/refman/en/sql-mode.html#ignore-effect-on-execution).

```
DB::table('users')->insertOrIgnore([
    ['id' => 1, 'email' => 'sisko@example.com'],
    ['id' => 2, 'email' => 'archer@example.com'],
]);
```

`insertUsing` 메서드는 하위 쿼리의 결과를 이용해 새로운 레코드를 테이블에 삽입할 때 사용합니다.

```
DB::table('pruned_users')->insertUsing([
    'id', 'name', 'email', 'email_verified_at'
], DB::table('users')->select(
    'id', 'name', 'email', 'email_verified_at'
)->where('updated_at', '<=', now()->subMonth()));
```

<a name="auto-incrementing-ids"></a>
#### 자동 증가 ID

테이블에 자동 증가되는 id가 있다면, `insertGetId` 메서드를 사용하여 레코드를 삽입한 후 해당 ID를 바로 가져올 수 있습니다.

```
$id = DB::table('users')->insertGetId(
    ['email' => 'john@example.com', 'votes' => 0]
);
```

> [!WARNING]  
> PostgreSQL을 사용할 경우 `insertGetId` 메서드는 자동 증가 컬럼명이 반드시 `id`이어야 합니다. 다른 "시퀀스"로부터 ID 값을 가져오고 싶다면, 두 번째 매개변수로 컬럼명을 전달하십시오.

<a name="upserts"></a>
### Upserts

`upsert` 메서드는 존재하지 않는 레코드는 새로 삽입하고, 이미 존재하는 레코드는 새로운 값으로 업데이트할 때 사용합니다. 첫 번째 인수는 삽입 또는 업데이트할 값들의 배열이고, 두 번째 인수는 해당 테이블에서 레코드를 고유하게 식별할 수 있는 컬럼(들)입니다. 세 번째 인수는 일치하는 레코드가 이미 데이터베이스에 존재할 때 업데이트할 컬럼들의 배열입니다.

```
DB::table('flights')->upsert(
    [
        ['departure' => 'Oakland', 'destination' => 'San Diego', 'price' => 99],
        ['departure' => 'Chicago', 'destination' => 'New York', 'price' => 150]
    ],
    ['departure', 'destination'],
    ['price']
);
```

위 예시에서 라라벨은 두 개의 레코드를 삽입하려 시도합니다. 만약 같은 `departure`와 `destination` 컬럼 값을 가진 레코드가 이미 있다면, 해당 레코드의 `price` 컬럼만 업데이트됩니다.

> [!WARNING]  
> SQL Server를 제외한 모든 데이터베이스에서는 `upsert` 메서드의 두 번째 인수 컬럼에 "primary" 또는 "unique" 인덱스가 반드시 있어야 합니다. 또한, MariaDB와 MySQL 드라이버는 `upsert`의 두 번째 인수를 무시하고, 항상 테이블의 "primary" 또는 "unique" 인덱스를 사용해 기존 레코드를 판별합니다.

<a name="update-statements"></a>
## Update 구문

쿼리 빌더를 사용하면 레코드를 삽입할 뿐만 아니라, 기존 레코드를 업데이트할 수도 있습니다. `update` 메서드는 `insert` 메서드와 유사하게, 컬럼-값 쌍을 담은 배열을 받아 해당 컬럼을 업데이트합니다. `update` 메서드는 영향을 받은 행(row)의 수를 반환합니다. 또한 `where` 절을 이용해 `update` 쿼리를 제한할 수도 있습니다.

```
$affected = DB::table('users')
    ->where('id', 1)
    ->update(['votes' => 1]);
```

<a name="update-or-insert"></a>
#### Update 또는 Insert

때때로, 데이터베이스에 일치하는 레코드가 존재하면 업데이트하고, 없으면 새로 생성하고 싶을 수 있습니다. 이럴 때는 `updateOrInsert` 메서드를 사용할 수 있습니다. 이 메서드는 두 개의 인수를 받습니다: 첫 번째는 레코드를 찾기 위한 조건의 배열, 두 번째는 업데이트할 컬럼-값 쌍의 배열입니다.

`updateOrInsert` 메서드는 첫 번째 인수에 주어진 컬럼·값 쌍을 사용해 일치하는 레코드를 찾으려 시도합니다. 해당 레코드가 있으면 두 번째 인수의 값으로 업데이트하며, 레코드가 없으면 두 인수를 합친 속성으로 새 레코드를 삽입합니다.

```
DB::table('users')
    ->updateOrInsert(
        ['email' => 'john@example.com', 'name' => 'John'],
        ['votes' => '2']
    );
```

또한, `updateOrInsert` 메서드에 클로저를 전달하여, 레코드 존재 여부에 따라 업데이트나 삽입할 속성을 동적으로 지정할 수 있습니다.

```php
DB::table('users')->updateOrInsert(
    ['user_id' => $user_id],
    fn ($exists) => $exists ? [
        'name' => $data['name'],
        'email' => $data['email'],
    ] : [
        'name' => $data['name'],
        'email' => $data['email'],
        'marketable' => true,
    ],
);
```

<a name="updating-json-columns"></a>
### JSON 컬럼 업데이트

JSON 컬럼을 업데이트할 때는 `->` 구문을 사용하여 JSON 객체 내의 특정 키를 업데이트해야 합니다. 이 동작은 MariaDB 10.3+, MySQL 5.7+, PostgreSQL 9.5+에서 지원됩니다.

```
$affected = DB::table('users')
    ->where('id', 1)
    ->update(['options->enabled' => true]);
```

<a name="increment-and-decrement"></a>
### 증가 및 감소

쿼리 빌더는 특정 컬럼의 값을 쉽고 간편하게 늘리거나 줄이는 메서드를 제공합니다. 두 메서드 모두 최소 한 개의 인수(변경할 컬럼명)를 받으며, 두 번째 인수로 얼마만큼 증가 또는 감소시킬지 지정할 수 있습니다.

```
DB::table('users')->increment('votes');

DB::table('users')->increment('votes', 5);

DB::table('users')->decrement('votes');

DB::table('users')->decrement('votes', 5);
```

필요하다면, 증가 또는 감소 연산 과정에서 추가로 업데이트할 컬럼을 배열로 지정할 수도 있습니다.

```
DB::table('users')->increment('votes', 1, ['name' => 'John']);
```

또한, `incrementEach`와 `decrementEach` 메서드를 사용해 여러 컬럼을 한 번에 증가 또는 감소시킬 수 있습니다.

```
DB::table('users')->incrementEach([
    'votes' => 5,
    'balance' => 100,
]);
```

<a name="delete-statements"></a>
## Delete 구문

쿼리 빌더의 `delete` 메서드는 테이블에서 레코드를 삭제하는 데 사용합니다. `delete` 메서드는 영향을 받은 행의 수를 반환합니다. `delete`를 호출하기 전에 "where" 절을 추가해 삭제 대상을 제한할 수 있습니다.

```
$deleted = DB::table('users')->delete();

$deleted = DB::table('users')->where('votes', '>', 100)->delete();
```

<a name="pessimistic-locking"></a>
## 비관적 잠금(Pessimistic Locking)

쿼리 빌더에는 `select` 구문 실행 시 "비관적 잠금(pessimistic locking)"을 적용할 수 있는 메서드들도 포함되어 있습니다. "공유 잠금(shared lock)"을 적용하려면 `sharedLock` 메서드를 사용하세요. 이 잠금은 트랜잭션이 커밋될 때까지 선택된 행이 수정되는 것을 방지합니다.

```
DB::table('users')
    ->where('votes', '>', 100)
    ->sharedLock()
    ->get();
```

또는, `lockForUpdate` 메서드를 사용할 수도 있습니다. "for update" 잠금은 선택된 레코드가 다른 공유 잠금과 함께 선택되지 않도록 하고, 동시에 수정도 할 수 없게 만듭니다.

```
DB::table('users')
    ->where('votes', '>', 100)
    ->lockForUpdate()
    ->get();
```

반드시 따라야 하는 것은 아니지만, 비관적 잠금은 [트랜잭션](/docs/11.x/database#database-transactions) 내에서 사용하는 것을 권장합니다. 이렇게 하면 전체 작업이 끝날 때까지 데이터가 변경되지 않게 보호할 수 있고, 오류 발생 시 트랜잭션이 롤백되어 잠금도 자동으로 해제됩니다.

```
DB::transaction(function () {
    $sender = DB::table('users')
        ->lockForUpdate()
        ->find(1);

    $receiver = DB::table('users')
        ->lockForUpdate()
        ->find(2);

    if ($sender->balance < 100) {
        throw new RuntimeException('Balance too low.');
    }
    
    DB::table('users')
        ->where('id', $sender->id)
        ->update([
            'balance' => $sender->balance - 100
        ]);

    DB::table('users')
        ->where('id', $receiver->id)
        ->update([
            'balance' => $receiver->balance + 100
        ]);
});
```

<a name="debugging"></a>
## 디버깅

쿼리를 만드는 도중, `dd` 및 `dump` 메서드를 사용해 현재 쿼리의 바인딩값과 SQL을 즉시 확인할 수 있습니다. `dd` 메서드는 디버깅 정보를 출력하고 곧바로 요청 실행을 종료합니다. `dump`는 정보를 출력한 후에도 요청 실행이 계속됩니다.

```
DB::table('users')->where('votes', '>', 100)->dd();

DB::table('users')->where('votes', '>', 100)->dump();
```

`dumpRawSql`과 `ddRawSql` 메서드는 쿼리의 SQL 문과 모든 파라미터 바인딩이 실제 값으로 치환된 결과를 출력합니다.

```
DB::table('users')->where('votes', '>', 100)->dumpRawSql();

DB::table('users')->where('votes', '>', 100)->ddRawSql();
```