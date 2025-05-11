# 데이터베이스: 쿼리 빌더 (Database: Query Builder)

- [소개](#introduction)
- [데이터베이스 쿼리 실행](#running-database-queries)
    - [결과 청크 처리](#chunking-results)
    - [결과를 지연 스트리밍으로 처리](#streaming-results-lazily)
    - [집계 함수](#aggregates)
- [Select 구문](#select-statements)
- [Raw 표현식](#raw-expressions)
- [조인(Join)](#joins)
- [유니온(Union)](#unions)
- [기본 Where 절](#basic-where-clauses)
    - [Where 절](#where-clauses)
    - [Or Where 절](#or-where-clauses)
    - [Where Not 절](#where-not-clauses)
    - [Where Any / All / None 절](#where-any-all-none-clauses)
    - [JSON Where 절](#json-where-clauses)
    - [추가 Where 절](#additional-where-clauses)
    - [논리적 그룹화](#logical-grouping)
- [고급 Where 절](#advanced-where-clauses)
    - [Where Exists 절](#where-exists-clauses)
    - [서브쿼리 Where 절](#subquery-where-clauses)
    - [전문 검색(Full Text) Where 절](#full-text-where-clauses)
- [정렬, 그룹화, Limit 및 Offset](#ordering-grouping-limit-and-offset)
    - [정렬](#ordering)
    - [그룹화](#grouping)
    - [Limit 및 Offset](#limit-and-offset)
- [조건부 절](#conditional-clauses)
- [Insert 구문](#insert-statements)
    - [Upsert](#upserts)
- [Update 구문](#update-statements)
    - [JSON 컬럼 업데이트](#updating-json-columns)
    - [증가 및 감소](#increment-and-decrement)
- [Delete 구문](#delete-statements)
- [비관적 잠금](#pessimistic-locking)
- [재사용 가능한 쿼리 컴포넌트](#reusable-query-components)
- [디버깅](#debugging)

<a name="introduction"></a>
## 소개

라라벨의 데이터베이스 쿼리 빌더는 데이터베이스 쿼리를 작성하고 실행할 수 있는 편리하고 유연한 인터페이스를 제공합니다. 애플리케이션의 대부분 데이터베이스 작업에 사용할 수 있으며, 라라벨이 지원하는 모든 데이터베이스 시스템과 완벽하게 호환됩니다.

라라벨 쿼리 빌더는 PDO 파라미터 바인딩을 사용하여 SQL 인젝션 공격으로부터 애플리케이션을 보호합니다. 따라서 쿼리 빌더에 바인딩 값으로 전달되는 문자열을 별도로 정제하거나 세척할 필요가 없습니다.

> [!WARNING]
> PDO는 컬럼명 바인딩을 지원하지 않습니다. 따라서 쿼리에서 참조하는 컬럼명(특히 "order by"에 사용할 컬럼명 등)에는 사용자 입력값이 직접 사용되지 않도록 반드시 주의해야 합니다.

<a name="running-database-queries"></a>
## 데이터베이스 쿼리 실행

<a name="retrieving-all-rows-from-a-table"></a>
#### 테이블에서 모든 행 조회하기

`DB` 파사드의 `table` 메서드를 사용해 쿼리를 시작할 수 있습니다. `table` 메서드는 지정된 테이블에 대한 유연한 쿼리 빌더 인스턴스를 반환하므로, 쿼리에 다양한 제약 조건을 체이닝으로 추가하고, 마지막에 `get` 메서드로 쿼리 결과를 조회할 수 있습니다.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * 애플리케이션의 전체 사용자 목록을 보여줍니다.
     */
    public function index(): View
    {
        $users = DB::table('users')->get();

        return view('user.index', ['users' => $users]);
    }
}
```

`get` 메서드는 쿼리 결과를 담고 있는 `Illuminate\Support\Collection` 인스턴스를 반환하며, 각각의 결과는 PHP `stdClass` 객체입니다. 객체의 속성으로 각 컬럼 값을 접근할 수 있습니다.

```php
use Illuminate\Support\Facades\DB;

$users = DB::table('users')->get();

foreach ($users as $user) {
    echo $user->name;
}
```

> [!NOTE]
> 라라벨의 컬렉션은 데이터를 매핑하거나 집계할 수 있는 매우 강력한 다양한 메서드를 제공합니다. 라라벨 컬렉션에 대한 자세한 내용은 [컬렉션 문서](/docs/collections)를 참고하세요.

<a name="retrieving-a-single-row-column-from-a-table"></a>
#### 테이블에서 단일 행/컬럼 조회하기

데이터베이스 테이블에서 단일 행만 조회하고 싶을 때에는 `DB` 파사드의 `first` 메서드를 사용할 수 있습니다. 이 메서드는 하나의 `stdClass` 객체를 반환합니다.

```php
$user = DB::table('users')->where('name', 'John')->first();

return $user->email;
```

만약 일치하는 행이 없을 때 `Illuminate\Database\RecordNotFoundException` 예외를 던지도록 하려면 `firstOrFail` 메서드를 사용할 수 있습니다. 이 예외를 따로 처리하지 않으면 404 HTTP 응답이 클라이언트로 자동 전송됩니다.

```php
$user = DB::table('users')->where('name', 'John')->firstOrFail();
```

전체 행이 아니라 특정 컬럼 값만 필요하다면 `value` 메서드를 사용해 하나의 값을 바로 추출할 수 있습니다. 이 메서드는 해당 컬럼 값을 직접 반환합니다.

```php
$email = DB::table('users')->where('name', 'John')->value('email');
```

`id` 컬럼 값을 기준으로 단일 행을 조회하려면 `find` 메서드를 사용하면 됩니다.

```php
$user = DB::table('users')->find(3);
```

<a name="retrieving-a-list-of-column-values"></a>
#### 특정 컬럼 값 목록 조회하기

특정 컬럼의 값만 추출해 `Illuminate\Support\Collection` 인스턴스에 담아 받고 싶을 때에는 `pluck` 메서드를 사용할 수 있습니다. 다음 예시에서는 사용자들의 `title` 값을 컬렉션으로 조회합니다.

```php
use Illuminate\Support\Facades\DB;

$titles = DB::table('users')->pluck('title');

foreach ($titles as $title) {
    echo $title;
}
```

`pluck` 메서드에 두 번째 인자를 전달해 반환 컬렉션의 키로 사용할 컬럼을 지정할 수도 있습니다.

```php
$titles = DB::table('users')->pluck('title', 'name');

foreach ($titles as $name => $title) {
    echo $title;
}
```

<a name="chunking-results"></a>
### 결과 청크 처리

수천 건 이상의 레코드를 다뤄야 한다면, `DB` 파사드의 `chunk` 메서드 사용을 고려해 보시기 바랍니다. 이 메서드는 결과를 일정 크기(청크)로 나누어 한 번에 처리할 수 있도록 클로저에 전달합니다. 예를 들어, `users` 테이블 전체를 한 번에 100건씩 청크 단위로 조회하려면 다음과 같이 작성할 수 있습니다.

```php
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

DB::table('users')->orderBy('id')->chunk(100, function (Collection $users) {
    foreach ($users as $user) {
        // ...
    }
});
```

클로저에서 `false`를 반환하면 이후 청크 처리가 중단됩니다.

```php
DB::table('users')->orderBy('id')->chunk(100, function (Collection $users) {
    // 레코드 처리...

    return false;
});
```

청크 처리 중에 레코드를 업데이트할 경우, 청크 결과가 예기치 않게 바뀔 수 있습니다. 만약 조회 중인 레코드를 업데이트할 계획이라면 `chunkById` 메서드를 사용하는 것이 더 안전합니다. 이 메서드는 기본키 값을 기준으로 결과를 자동으로 페이지네이션 처리합니다.

```php
DB::table('users')->where('active', false)
    ->chunkById(100, function (Collection $users) {
        foreach ($users as $user) {
            DB::table('users')
                ->where('id', $user->id)
                ->update(['active' => true]);
        }
    });
```

`chunkById`와 `lazyById` 같은 메서드는 쿼리에 추가적인 "where" 조건을 자동으로 붙이므로, 직접 조건을 적용할 때는 [논리적 그룹화](#logical-grouping)를 클로저 내에서 처리하는 것이 좋습니다.

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
> 청크 콜백 내에서 레코드를 업데이트하거나 삭제할 때, 기본키나 외래키를 변경하면 청크 쿼리에 영향을 줄 수 있습니다. 이로 인해 일부 레코드가 청크 결과에 포함되지 않을 수 있으니 주의해야 합니다.

<a name="streaming-results-lazily"></a>
### 결과를 지연 스트리밍으로 처리

`lazy` 메서드는 [chunk 메서드](#chunking-results)와 유사하게 쿼리를 청크 단위로 실행합니다. 다만, 각 청크를 콜백에 넘기는 대신, `lazy()` 메서드는 [LazyCollection](/docs/collections#lazy-collections)을 반환하므로 하나의 스트림처럼 결과를 다룰 수 있습니다.

```php
use Illuminate\Support\Facades\DB;

DB::table('users')->orderBy('id')->lazy()->each(function (object $user) {
    // ...
});
```

마찬가지로, 반복하면서 조회한 레코드를 수정해야 한다면 `lazyById` 또는 `lazyByIdDesc` 메서드를 사용하는 것이 좋습니다. 이 방법 역시 기본키를 기준으로 자동으로 페이지네이션합니다.

```php
DB::table('users')->where('active', false)
    ->lazyById()->each(function (object $user) {
        DB::table('users')
            ->where('id', $user->id)
            ->update(['active' => true]);
    });
```

> [!WARNING]
> 반복(iterate) 중 레코드를 업데이트하거나 삭제할 때 기본키 또는 외래키가 변경되면 청크 쿼리에 영향을 줄 수 있습니다. 이로 인해 일부 레코드가 결과에 포함되지 않을 수 있으니 주의해야 합니다.

<a name="aggregates"></a>
### 집계 함수

쿼리 빌더는 `count`, `max`, `min`, `avg`, `sum`과 같은 다양한 집계 함수 메서드도 제공합니다. 쿼리를 구성한 뒤 이 메서드들을 호출하면 됩니다.

```php
use Illuminate\Support\Facades\DB;

$users = DB::table('users')->count();

$price = DB::table('orders')->max('price');
```

물론, 해당 메서드들을 다른 절과 조합해 집계 값을 원하는 대로 산출할 수 있습니다.

```php
$price = DB::table('orders')
    ->where('finalized', 1)
    ->avg('price');
```

<a name="determining-if-records-exist"></a>
#### 레코드 존재 여부 확인하기

쿼리의 제약 조건에 맞는 레코드가 존재하는지 단순히 확인하고 싶다면 `count` 대신 `exists`나 `doesntExist` 메서드를 사용할 수 있습니다.

```php
if (DB::table('orders')->where('finalized', 1)->exists()) {
    // ...
}

if (DB::table('orders')->where('finalized', 1)->doesntExist()) {
    // ...
}
```

<a name="select-statements"></a>
## Select 구문

<a name="specifying-a-select-clause"></a>
#### Select 절 지정하기

데이터베이스 테이블의 전체 컬럼을 모두 선택하고 싶지 않을 경우, `select` 메서드를 사용해 원하는 컬럼만 지정할 수 있습니다.

```php
use Illuminate\Support\Facades\DB;

$users = DB::table('users')
    ->select('name', 'email as user_email')
    ->get();
```

`distinct` 메서드를 사용하면 중복된 결과 없이 유니크한 결과만 반환하도록 할 수 있습니다.

```php
$users = DB::table('users')->distinct()->get();
```

이미 쿼리 빌더 인스턴스가 있을 때 기존 select 절에 컬럼을 추가하고 싶다면 `addSelect` 메서드를 사용할 수 있습니다.

```php
$query = DB::table('users')->select('name');

$users = $query->addSelect('age')->get();
```

<a name="raw-expressions"></a>
## Raw 표현식

때때로 쿼리에 임의의 문자열을 직접 삽입해야 할 수도 있습니다. 이럴 때는 `DB` 파사드의 `raw` 메서드를 사용해 raw 문자열 표현식을 만들 수 있습니다.

```php
$users = DB::table('users')
    ->select(DB::raw('count(*) as user_count, status'))
    ->where('status', '<>', 1)
    ->groupBy('status')
    ->get();
```

> [!WARNING]
> Raw 문장은 쿼리에 직접 문자열로 삽입되므로, SQL 인젝션 취약점이 발생하지 않도록 각별히 주의해야 합니다.

<a name="raw-methods"></a>
### Raw 관련 메서드

`DB::raw` 메서드 대신 아래와 같은 메서드들을 활용해 쿼리의 여러 부분에 raw 표현식을 삽입할 수도 있습니다. **참고로, raw 표현식을 사용하는 쿼리는 라라벨이 SQL 인젝션 보호를 보장해줄 수 없습니다.**

<a name="selectraw"></a>
#### `selectRaw`

`selectRaw` 메서드는 `addSelect(DB::raw(/* ... */))` 대신 사용할 수 있습니다. 이 메서드는 두 번째 인자로 바인딩 배열을 옵션으로 받을 수 있습니다.

```php
$orders = DB::table('orders')
    ->selectRaw('price * ? as price_with_tax', [1.0825])
    ->get();
```

<a name="whereraw-orwhereraw"></a>
#### `whereRaw / orWhereRaw`

`whereRaw` 및 `orWhereRaw` 메서드는 쿼리에 raw "where" 절을 삽입할 때 사용합니다. 두 번째 인자로 바인딩 배열을 옵션으로 받을 수 있습니다.

```php
$orders = DB::table('orders')
    ->whereRaw('price > IF(state = "TX", ?, 100)', [200])
    ->get();
```

<a name="havingraw-orhavingraw"></a>
#### `havingRaw / orHavingRaw`

`havingRaw` 및 `orHavingRaw` 메서드는 "having" 절에 raw 문자열을 지정할 때 사용합니다. 역시 두 번째 인자로 바인딩 배열을 넣을 수 있습니다.

```php
$orders = DB::table('orders')
    ->select('department', DB::raw('SUM(price) as total_sales'))
    ->groupBy('department')
    ->havingRaw('SUM(price) > ?', [2500])
    ->get();
```

<a name="orderbyraw"></a>
#### `orderByRaw`

`orderByRaw` 메서드는 "order by" 절에 raw 문자열을 사용할 때 활용합니다.

```php
$orders = DB::table('orders')
    ->orderByRaw('updated_at - created_at DESC')
    ->get();
```

<a name="groupbyraw"></a>
### `groupByRaw`

`groupByRaw` 메서드는 `group by` 절에 raw 문자열을 사용할 때 사용할 수 있습니다.

```php
$orders = DB::table('orders')
    ->select('city', 'state')
    ->groupByRaw('city, state')
    ->get();
```

<a name="joins"></a>
## 조인(Join)

<a name="inner-join-clause"></a>
#### Inner Join 절

쿼리 빌더를 활용해 쿼리에 조인 절을 추가할 수도 있습니다. 기본적인 "inner join"을 하려면 쿼리 빌더 인스턴스에서 `join` 메서드를 사용합니다. 첫 번째 인자는 조인할 테이블명, 나머지 인자들은 조인 조건(컬럼명 등)을 지정합니다. 하나의 쿼리에서 여러 테이블을 조인할 수도 있습니다.

```php
use Illuminate\Support\Facades\DB;

$users = DB::table('users')
    ->join('contacts', 'users.id', '=', 'contacts.user_id')
    ->join('orders', 'users.id', '=', 'orders.user_id')
    ->select('users.*', 'contacts.phone', 'orders.price')
    ->get();
```

<a name="left-join-right-join-clause"></a>
#### Left Join / Right Join 절

"inner join" 대신 "left join" 또는 "right join"을 원한다면 `leftJoin` 또는 `rightJoin` 메서드를 사용하면 됩니다. 이 메서드들의 시그니처는 `join`과 동일합니다.

```php
$users = DB::table('users')
    ->leftJoin('posts', 'users.id', '=', 'posts.user_id')
    ->get();

$users = DB::table('users')
    ->rightJoin('posts', 'users.id', '=', 'posts.user_id')
    ->get();
```

<a name="cross-join-clause"></a>
#### Cross Join 절

"cross join"을 수행하고 싶다면 `crossJoin` 메서드를 사용할 수 있습니다. Cross join은 두 테이블의 데카르트 곱을 생성합니다.

```php
$sizes = DB::table('sizes')
    ->crossJoin('colors')
    ->get();
```

<a name="advanced-join-clauses"></a>
#### 고급 Join 절

더 복잡한 조인 조건이 필요하다면, `join` 메서드의 두 번째 인자로 클로저를 전달할 수 있습니다. 이 클로저는 `Illuminate\Database\Query\JoinClause` 인스턴스를 인자로 받아, 조인 조건을 다양하게 지정할 수 있습니다.

```php
DB::table('users')
    ->join('contacts', function (JoinClause $join) {
        $join->on('users.id', '=', 'contacts.user_id')->orOn(/* ... */);
    })
    ->get();
```

조인 내에서 "where" 절을 사용하려면, `JoinClause` 인스턴스가 제공하는 `where` 및 `orWhere` 메서드를 활용할 수 있습니다. 이때 두 컬럼의 값을 비교하는 대신 컬럼과 값을 비교하게 됩니다.

```php
DB::table('users')
    ->join('contacts', function (JoinClause $join) {
        $join->on('users.id', '=', 'contacts.user_id')
            ->where('contacts.user_id', '>', 5);
    })
    ->get();
```

<a name="subquery-joins"></a>
#### 서브쿼리 조인

`joinSub`, `leftJoinSub`, `rightJoinSub` 메서드를 활용해 쿼리에 서브쿼리를 조인할 수 있습니다. 각 메서드는 세 개의 인자를 받으며, 서브쿼리, 테이블 별칭, 그리고 관련 컬럼을 지정하는 클로저입니다. 예를 들어, 각 사용자 레코드에 해당 사용자의 가장 최근 블로그 게시물의 `created_at` 타임스탬프를 포함해서 조회하고자 할 때 사용할 수 있습니다.

```php
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
#### Lateral Join

> [!WARNING]
> Lateral join은 현재 PostgreSQL, MySQL >= 8.0.14, SQL Server에서 지원됩니다.

`joinLateral` 및 `leftJoinLateral` 메서드를 사용하면 서브쿼리와 "lateral join"을 수행할 수 있습니다. 각 메서드는 두 개의 인자를 받으며, 서브쿼리와 테이블 별칭을 지정합니다. 조인 조건은 서브쿼리 내의 `where` 절에서 지정해야 합니다. Lateral join은 각 행마다 평가되므로, 서브쿼리 밖의 컬럼에도 접근할 수 있습니다.

아래 예시에서는, 각 사용자별로 가장 최근 블로그 게시물 3개까지 조회하여, 각 사용자가 최대 3개의 결과 레코드를 가질 수 있습니다. 조인 조건은 서브쿼리 내 `whereColumn` 구문에서 지정합니다.

```php
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
## 유니온(Union)

쿼리 빌더는 두 개 이상의 쿼리를 "union" 하도록 만드는 편리한 메서드도 제공합니다. 예를 들어, 하나의 쿼리를 먼저 정의하고, `union` 메서드로 추가 쿼리와 결합할 수 있습니다.

```php
use Illuminate\Support\Facades\DB;

$first = DB::table('users')
    ->whereNull('first_name');

$users = DB::table('users')
    ->whereNull('last_name')
    ->union($first)
    ->get();
```

`union` 메서드 외에, 쿼리를 합칠 때 중복 결과를 제거하지 않고 모두 반환하고 싶다면 `unionAll` 메서드를 사용할 수 있습니다. `unionAll` 메서드의 사용법은 `union`과 동일합니다.

<a name="basic-where-clauses"></a>
## 기본 Where 절

<a name="where-clauses"></a>
### Where 절

쿼리 빌더의 `where` 메서드를 사용해 쿼리에 "where" 조건을 추가할 수 있습니다. 가장 기본적인 `where` 호출은 세 개의 인수를 받으며, 첫 번째는 컬럼명, 두 번째는 연산자(각 데이터베이스에서 지원하는 연산자), 세 번째는 비교할 값입니다.

예를 들어, 다음 쿼리는 `votes` 컬럼 값이 `100`이고 `age` 컬럼 값이 `35`를 초과하는 사용자만을 조회합니다.

```php
$users = DB::table('users')
    ->where('votes', '=', 100)
    ->where('age', '>', 35)
    ->get();
```

간단하게 컬럼 값이 `=`일 경우에는 두 번째 인자로 값만 전달해도 됩니다. 라라벨은 `=` 연산자가 쓰인 것으로 간주합니다.

```php
$users = DB::table('users')->where('votes', 100)->get();
```

앞서 언급한 것처럼, 데이터베이스에서 지원하는 다양한 연산자를 사용할 수 있습니다.

```php
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

또한, `where` 함수에 여러 조건의 배열을 전달할 수도 있습니다. 배열의 각 요소는 일반적으로 `where` 메서드에 전달하는 세 개의 인자로 이루어진 배열입니다.

```php
$users = DB::table('users')->where([
    ['status', '=', '1'],
    ['subscribed', '<>', '1'],
])->get();
```

> [!WARNING]
> PDO는 컬럼명 바인딩을 지원하지 않습니다. 따라서 쿼리에서 참조하는 컬럼명(특히 "order by"에 사용할 컬럼명 등)에는 사용자 입력값이 직접 사용되지 않도록 반드시 주의해야 합니다.

> [!WARNING]
> MySQL과 MariaDB는 문자열과 숫자를 비교할 때 문자열을 자동으로 정수로 변환합니다. 이 과정에서 숫자가 아닌 문자열은 `0`으로 변환되므로, 예상치 못한 결과가 나올 수 있습니다. 예를 들어, 테이블의 `secret` 컬럼에 `aaa`라는 값이 있고, `User::where('secret', 0)`을 실행하면 해당 레코드가 반환됩니다. 이런 상황을 피하려면 쿼리 조건에 사용되는 모든 값이 올바른 타입으로 변환되었는지 반드시 확인하세요.

<a name="or-where-clauses"></a>
### Or Where 절

`where` 메서드를 체이닝할 때 여러 조건은 기본적으로 `and` 연산자로 연결됩니다. 하지만, `or` 연산자를 사용해 조건을 추가하려면 `orWhere` 메서드를 사용합니다. 이 메서드는 `where`와 동일한 인자를 받습니다.

```php
$users = DB::table('users')
    ->where('votes', '>', 100)
    ->orWhere('name', 'John')
    ->get();
```

"or" 조건을 괄호로 그룹핑하고 싶다면, 첫 번째 인자로 클로저를 전달할 수 있습니다.

```php
use Illuminate\Database\Query\Builder; 

$users = DB::table('users')
    ->where('votes', '>', 100)
    ->orWhere(function (Builder $query) {
        $query->where('name', 'Abigail')
            ->where('votes', '>', 50);
        })
    ->get();
```

위 예시는 다음과 같은 SQL을 생성합니다.

```sql
select * from users where votes > 100 or (name = 'Abigail' and votes > 50)
```

> [!WARNING]
> 글로벌 스코프가 적용될 때 예상치 못한 동작을 방지하려면 항상 `orWhere` 호출을 그룹화하는 것이 좋습니다.

<a name="where-not-clauses"></a>

### Where Not 절

`whereNot` 및 `orWhereNot` 메서드는 특정 조건 그룹을 부정(negate)하고자 할 때 사용합니다. 예를 들어, 다음 쿼리는 '할인(clearance)' 중이거나 가격이 10보다 작은 상품을 제외하여 조회합니다.

```php
$products = DB::table('products')
    ->whereNot(function (Builder $query) {
        $query->where('clearance', true)
            ->orWhere('price', '<', 10);
        })
    ->get();
```

<a name="where-any-all-none-clauses"></a>
### Where Any / All / None 절

여러 컬럼에 동일한 조건을 한 번에 적용해야 할 때가 있습니다. 예를 들어, 주어진 컬럼 목록 중 어느 하나라도 지정한 값과 `LIKE`로 일치하는 레코드를 모두 조회하고 싶을 수 있습니다. 이럴 때 `whereAny` 메서드를 사용할 수 있습니다.

```php
$users = DB::table('users')
    ->where('active', true)
    ->whereAny([
        'name',
        'email',
        'phone',
    ], 'like', 'Example%')
    ->get();
```

위의 쿼리는 다음과 같은 SQL을 생성합니다.

```sql
SELECT *
FROM users
WHERE active = true AND (
    name LIKE 'Example%' OR
    email LIKE 'Example%' OR
    phone LIKE 'Example%'
)
```

이와 비슷하게, `whereAll` 메서드는 주어진 모든 컬럼이 조건과 일치하는 레코드를 조회할 때 사용할 수 있습니다.

```php
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

`whereNone` 메서드는 주어진 컬럼 중 어느 것도 조건과 일치하지 않는 레코드를 조회할 때 사용할 수 있습니다.

```php
$posts = DB::table('albums')
    ->where('published', true)
    ->whereNone([
        'title',
        'lyrics',
        'tags',
    ], 'like', '%explicit%')
    ->get();
```

위의 쿼리는 다음과 같은 SQL을 생성합니다.

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

라라벨은 JSON 컬럼 타입을 지원하는 데이터베이스에서도 JSON 컬럼을 대상으로 쿼리를 작성할 수 있습니다. 현재 MariaDB 10.3+, MySQL 8.0+, PostgreSQL 12.0+, SQL Server 2017+, SQLite 3.39.0+가 지원됩니다. JSON 컬럼을 쿼리하기 위해서는 `->` 연산자를 사용합니다.

```php
$users = DB::table('users')
    ->where('preferences->dining->meal', 'salad')
    ->get();
```

`whereJsonContains` 메서드를 사용하면 JSON 배열에서 값을 검색할 수 있습니다.

```php
$users = DB::table('users')
    ->whereJsonContains('options->languages', 'en')
    ->get();
```

MariaDB, MySQL, PostgreSQL 데이터베이스를 사용하는 경우에는 값의 배열도 전달할 수 있습니다.

```php
$users = DB::table('users')
    ->whereJsonContains('options->languages', ['en', 'de'])
    ->get();
```

`whereJsonLength` 메서드를 이용하면 JSON 배열의 길이를 기준으로 쿼리를 작성할 수 있습니다.

```php
$users = DB::table('users')
    ->whereJsonLength('options->languages', 0)
    ->get();

$users = DB::table('users')
    ->whereJsonLength('options->languages', '>', 1)
    ->get();
```

<a name="additional-where-clauses"></a>
### 추가 Where 절

**whereLike / orWhereLike / whereNotLike / orWhereNotLike**

`whereLike` 메서드를 사용하면 문자열 패턴 매칭을 위한 "LIKE" 절을 쿼리에 추가할 수 있습니다. 이 메서드는 데이터베이스에 종속적이지 않게 문자열 매칭 쿼리를 작성할 수 있으며, 대소문자 민감성도 설정할 수 있습니다. 기본적으로는 대소문자를 구분하지 않습니다.

```php
$users = DB::table('users')
    ->whereLike('name', '%John%')
    ->get();
```

`caseSensitive` 인수를 사용하면 대소문자를 구분하는 검색도 가능합니다.

```php
$users = DB::table('users')
    ->whereLike('name', '%John%', caseSensitive: true)
    ->get();
```

`orWhereLike` 메서드를 사용하면 "or" 조건과 함께 LIKE 절을 추가할 수 있습니다.

```php
$users = DB::table('users')
    ->where('votes', '>', 100)
    ->orWhereLike('name', '%John%')
    ->get();
```

`whereNotLike` 메서드는 "NOT LIKE" 조건을 쿼리에 추가할 때 사용합니다.

```php
$users = DB::table('users')
    ->whereNotLike('name', '%John%')
    ->get();
```

마찬가지로, `orWhereNotLike` 메서드를 사용하면 "or"와 함께 NOT LIKE 조건을 추가할 수 있습니다.

```php
$users = DB::table('users')
    ->where('votes', '>', 100)
    ->orWhereNotLike('name', '%John%')
    ->get();
```

> [!WARNING]
> `whereLike`의 대소문자 구분 옵션은 현재 SQL Server에서는 지원되지 않습니다.

**whereIn / whereNotIn / orWhereIn / orWhereNotIn**

`whereIn` 메서드는 지정한 컬럼의 값이 전달된 배열에 포함되어 있는지 확인합니다.

```php
$users = DB::table('users')
    ->whereIn('id', [1, 2, 3])
    ->get();
```

`whereNotIn` 메서드는 컬럼의 값이 전달된 배열에 포함되지 않은 경우를 확인합니다.

```php
$users = DB::table('users')
    ->whereNotIn('id', [1, 2, 3])
    ->get();
```

또한, `whereIn`의 두 번째 인수로 쿼리 객체를 전달할 수도 있습니다.

```php
$activeUsers = DB::table('users')->select('id')->where('is_active', 1);

$users = DB::table('comments')
    ->whereIn('user_id', $activeUsers)
    ->get();
```

위 예제는 다음 SQL을 생성합니다.

```sql
select * from comments where user_id in (
    select id
    from users
    where is_active = 1
)
```

> [!WARNING]
> 대량의 정수 바인딩 배열을 쿼리에 추가해야 한다면, `whereIntegerInRaw` 또는 `whereIntegerNotInRaw` 메서드를 사용하면 메모리 사용량을 크게 줄일 수 있습니다.

**whereBetween / orWhereBetween**

`whereBetween` 메서드는 컬럼의 값이 두 값 사이에 있는지 확인합니다.

```php
$users = DB::table('users')
    ->whereBetween('votes', [1, 100])
    ->get();
```

**whereNotBetween / orWhereNotBetween**

`whereNotBetween` 메서드는 컬럼의 값이 두 값의 범위 밖에 있는지 확인합니다.

```php
$users = DB::table('users')
    ->whereNotBetween('votes', [1, 100])
    ->get();
```

**whereBetweenColumns / whereNotBetweenColumns / orWhereBetweenColumns / orWhereNotBetweenColumns**

`whereBetweenColumns` 메서드는 컬럼의 값이 같은 행의 두 다른 컬럼 값 사이에 있는지 확인합니다.

```php
$patients = DB::table('patients')
    ->whereBetweenColumns('weight', ['minimum_allowed_weight', 'maximum_allowed_weight'])
    ->get();
```

`whereNotBetweenColumns` 메서드는 컬럼의 값이 같은 행의 두 다른 컬럼 값의 범위 밖에 있는지 확인합니다.

```php
$patients = DB::table('patients')
    ->whereNotBetweenColumns('weight', ['minimum_allowed_weight', 'maximum_allowed_weight'])
    ->get();
```

**whereNull / whereNotNull / orWhereNull / orWhereNotNull**

`whereNull` 메서드는 특정 컬럼 값이 `NULL`인지 확인합니다.

```php
$users = DB::table('users')
    ->whereNull('updated_at')
    ->get();
```

`whereNotNull` 메서드는 컬럼 값이 `NULL`이 아닌 경우를 확인합니다.

```php
$users = DB::table('users')
    ->whereNotNull('updated_at')
    ->get();
```

**whereDate / whereMonth / whereDay / whereYear / whereTime**

`whereDate` 메서드는 컬럼 값을 특정 날짜와 비교할 때 사용할 수 있습니다.

```php
$users = DB::table('users')
    ->whereDate('created_at', '2016-12-31')
    ->get();
```

`whereMonth` 메서드는 컬럼 값을 특정 월과 비교합니다.

```php
$users = DB::table('users')
    ->whereMonth('created_at', '12')
    ->get();
```

`whereDay` 메서드는 컬럼 값을 특정 일(day of month)과 비교합니다.

```php
$users = DB::table('users')
    ->whereDay('created_at', '31')
    ->get();
```

`whereYear` 메서드는 컬럼 값을 특정 연도와 비교합니다.

```php
$users = DB::table('users')
    ->whereYear('created_at', '2016')
    ->get();
```

`whereTime` 메서드는 컬럼 값을 특정 시간과 비교합니다.

```php
$users = DB::table('users')
    ->whereTime('created_at', '=', '11:20:45')
    ->get();
```

**wherePast / whereFuture / whereToday / whereBeforeToday / whereAfterToday**

`wherePast` 및 `whereFuture` 메서드는 컬럼 값이 과거인지, 미래인지 확인할 때 사용할 수 있습니다.

```php
$invoices = DB::table('invoices')
    ->wherePast('due_at')
    ->get();

$invoices = DB::table('invoices')
    ->whereFuture('due_at')
    ->get();
```

`whereNowOrPast` 및 `whereNowOrFuture` 메서드는 현재 날짜와 시간을 포함해서 과거 또는 미래에 해당하는지 확인합니다.

```php
$invoices = DB::table('invoices')
    ->whereNowOrPast('due_at')
    ->get();

$invoices = DB::table('invoices')
    ->whereNowOrFuture('due_at')
    ->get();
```

`whereToday`, `whereBeforeToday`, `whereAfterToday` 메서드는 각각 컬럼 값이 오늘 또는 오늘 이전, 오늘 이후에 해당하는지 판별합니다.

```php
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

마찬가지로, `whereTodayOrBefore`, `whereTodayOrAfter` 메서드는 오늘을 포함해서 오늘 이전 또는 이후에 해당하는지 확인할 수 있습니다.

```php
$invoices = DB::table('invoices')
    ->whereTodayOrBefore('due_at')
    ->get();

$invoices = DB::table('invoices')
    ->whereTodayOrAfter('due_at')
    ->get();
```

**whereColumn / orWhereColumn**

`whereColumn` 메서드는 두 컬럼의 값이 같은지 비교할 때 사용합니다.

```php
$users = DB::table('users')
    ->whereColumn('first_name', 'last_name')
    ->get();
```

비교 연산자를 추가로 지정할 수도 있습니다.

```php
$users = DB::table('users')
    ->whereColumn('updated_at', '>', 'created_at')
    ->get();
```

배열 형태로 여러 컬럼을 한 번에 비교할 수도 있습니다. 이 조건들은 `and` 연산자로 결합됩니다.

```php
$users = DB::table('users')
    ->whereColumn([
        ['first_name', '=', 'last_name'],
        ['updated_at', '>', 'created_at'],
    ])->get();
```

<a name="logical-grouping"></a>
### 논리 그룹화

여러 개의 "where" 절을 괄호로 묶어 논리 그룹을 만들어야 할 때가 있습니다. 특히 `orWhere` 메서드를 호출할 때는 예기치 않은 쿼리 동작을 방지하기 위해 항상 괄호로 그룹화하는 것이 좋습니다. 이를 위해서는 `where` 메서드에 클로저를 전달하면 됩니다.

```php
$users = DB::table('users')
    ->where('name', '=', 'John')
    ->where(function (Builder $query) {
        $query->where('votes', '>', 100)
            ->orWhere('title', '=', 'Admin');
    })
    ->get();
```

위와 같이 클로저를 `where` 메서드에 전달하면, 쿼리 빌더는 괄호로 묶인 조건 그룹을 생성합니다. 클로저에는 쿼리 빌더 인스턴스가 전달되며 이 인스턴스를 사용해서 괄호 안에 들어갈 조건들을 지정할 수 있습니다. 위 예제는 다음과 같은 SQL을 생성합니다.

```sql
select * from users where name = 'John' and (votes > 100 or title = 'Admin')
```

> [!WARNING]
> 예기치 않은 동작을 방지하기 위해 전역 스코프가 적용되는 경우에는 항상 `orWhere`를 그룹화하여 사용하는 것이 좋습니다.

<a name="advanced-where-clauses"></a>
## 고급 Where 절

<a name="where-exists-clauses"></a>
### Where Exists 절

`whereExists` 메서드는 SQL의 "where exists" 절을 작성할 때 사용할 수 있습니다. 이 메서드는 클로저를 인수로 받으며, 클로저에는 쿼리 빌더 인스턴스가 전달되어 "exists" 절 내부에 들어갈 쿼리를 정의할 수 있습니다.

```php
$users = DB::table('users')
    ->whereExists(function (Builder $query) {
        $query->select(DB::raw(1))
            ->from('orders')
            ->whereColumn('orders.user_id', 'users.id');
    })
    ->get();
```

또는 클로저 대신 쿼리 객체를 직접 `whereExists`에 전달할 수도 있습니다.

```php
$orders = DB::table('orders')
    ->select(DB::raw(1))
    ->whereColumn('orders.user_id', 'users.id');

$users = DB::table('users')
    ->whereExists($orders)
    ->get();
```

위 두 예제는 모두 다음과 같은 SQL을 생성합니다.

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

특정 값과 서브쿼리의 결과를 비교하는 "where" 절을 작성해야 할 때가 있습니다. 이럴 때는 클로저와 값을 함께 `where` 메서드에 전달하면 됩니다. 예를 들어, 아래 쿼리는 최근 가입("membership")의 타입이 특정 값인 사용자를 모두 조회합니다.

```php
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

또는, 컬럼의 값을 서브쿼리의 결과와 비교하는 "where" 절을 구성할 수도 있습니다. 아래 쿼리는 금액이 평균보다 작은 소득 내역을 조회합니다.

```php
use App\Models\Income;
use Illuminate\Database\Query\Builder;

$incomes = Income::where('amount', '<', function (Builder $query) {
    $query->selectRaw('avg(i.amount)')->from('incomes as i');
})->get();
```

<a name="full-text-where-clauses"></a>
### 전체 텍스트(Full Text) Where 절

> [!WARNING]
> 전체 텍스트(Full text) where 절은 현재 MariaDB, MySQL, PostgreSQL에서만 지원됩니다.

`whereFullText` 및 `orWhereFullText` 메서드는 [전체 텍스트 인덱스](/docs/migrations#available-index-types)가 지정된 컬럼에 대해 전체 텍스트 "where" 절을 쿼리에 추가할 때 사용할 수 있습니다. 이 메서드는 라라벨이 내부적으로 데이터베이스에 맞는 SQL 형태로 변환해줍니다. 예를 들어, MariaDB나 MySQL 환경에서는 `MATCH AGAINST` 절이 생성됩니다.

```php
$users = DB::table('users')
    ->whereFullText('bio', 'web developer')
    ->get();
```

<a name="ordering-grouping-limit-and-offset"></a>
## 정렬, 그룹화, Limit과 Offset

<a name="ordering"></a>
### 정렬

<a name="orderby"></a>
#### `orderBy` 메서드

`orderBy` 메서드는 쿼리 결과를 특정 컬럼 기준으로 정렬할 수 있습니다. 첫 번째 인수는 정렬할 컬럼 이름이고, 두 번째 인수는 정렬 방향이며 `asc`(오름차순) 또는 `desc`(내림차순) 중 하나입니다.

```php
$users = DB::table('users')
    ->orderBy('name', 'desc')
    ->get();
```

여러 컬럼 기준으로 정렬하고 싶다면 `orderBy` 메서드를 여러 번 호출하면 됩니다.

```php
$users = DB::table('users')
    ->orderBy('name', 'desc')
    ->orderBy('email', 'asc')
    ->get();
```

<a name="latest-oldest"></a>
#### `latest` 및 `oldest` 메서드

`latest` 및 `oldest` 메서드는 날짜 기준으로 결과를 손쉽게 정렬할 수 있도록 도와줍니다. 기본적으로는 테이블의 `created_at` 컬럼을 기준으로 정렬되지만, 원하는 컬럼 이름을 인수로 전달할 수도 있습니다.

```php
$user = DB::table('users')
    ->latest()
    ->first();
```

<a name="random-ordering"></a>
#### 무작위 정렬

`inRandomOrder` 메서드를 사용하면 쿼리 결과를 무작위로 정렬할 수 있습니다. 예를 들어, 임의의 사용자를 하나 조회하고자 할 때 사용할 수 있습니다.

```php
$randomUser = DB::table('users')
    ->inRandomOrder()
    ->first();
```

<a name="removing-existing-orderings"></a>
#### 기존 정렬 조건 제거

`reorder` 메서드는 쿼리에 미리 적용된 모든 "order by" 조건을 제거합니다.

```php
$query = DB::table('users')->orderBy('name');

$unorderedUsers = $query->reorder()->get();
```

`reorder` 메서드 호출 시 컬럼과 정렬 방향을 지정하면 기존의 모든 "order by" 절을 제거하고, 새롭게 지정한 정렬만 적용됩니다.

```php
$query = DB::table('users')->orderBy('name');

$usersOrderedByEmail = $query->reorder('email', 'desc')->get();
```

<a name="grouping"></a>

### 그룹화

<a name="groupby-having"></a>
#### `groupBy` 및 `having` 메서드

예상하신 것처럼, `groupBy` 및 `having` 메서드를 사용하여 쿼리 결과를 그룹화할 수 있습니다. `having` 메서드의 시그니처는 `where` 메서드와 유사합니다.

```php
$users = DB::table('users')
    ->groupBy('account_id')
    ->having('account_id', '>', 100)
    ->get();
```

`havingBetween` 메서드를 사용하면 특정 범위 내의 결과만 필터링할 수 있습니다.

```php
$report = DB::table('orders')
    ->selectRaw('count(id) as number_of_orders, customer_id')
    ->groupBy('customer_id')
    ->havingBetween('number_of_orders', [5, 15])
    ->get();
```

`groupBy` 메서드에 여러 인수를 전달하여 여러 컬럼을 기준으로 그룹화할 수도 있습니다.

```php
$users = DB::table('users')
    ->groupBy('first_name', 'status')
    ->having('account_id', '>', 100)
    ->get();
```

보다 고급스러운 `having` 구문을 작성하려면 [havingRaw](#raw-methods) 메서드도 참고하시기 바랍니다.

<a name="limit-and-offset"></a>
### Limit 및 Offset

<a name="skip-take"></a>
#### `skip` 및 `take` 메서드

`skip`과 `take` 메서드를 사용하여 쿼리 결과에서 반환되는 데이터 개수를 제한하거나, 특정 개수만큼 건너뛸 수 있습니다.

```php
$users = DB::table('users')->skip(10)->take(5)->get();
```

또는, `limit` 및 `offset` 메서드를 사용할 수도 있습니다. 이 두 메서드는 각각 `take`와 `skip`과 동일하게 동작합니다.

```php
$users = DB::table('users')
    ->offset(10)
    ->limit(5)
    ->get();
```

<a name="conditional-clauses"></a>
## 조건부 절

경우에 따라, 특정 쿼리 절을 어떤 조건 하에서만 추가하고 싶을 때가 있습니다. 예를 들어, 받은 HTTP 요청에서 특정 입력값이 있을 때만 `where` 구문을 추가하고 싶을 수 있습니다. 이럴 때는 `when` 메서드를 사용할 수 있습니다.

```php
$role = $request->input('role');

$users = DB::table('users')
    ->when($role, function (Builder $query, string $role) {
        $query->where('role_id', $role);
    })
    ->get();
```

`when` 메서드는 첫 번째 인수가 `true`일 때만 주어진 클로저를 실행합니다. 첫 번째 인수가 `false`라면 클로저는 실행되지 않습니다. 위의 예시에서, `when` 메서드에 전달된 클로저는 요청에 `role` 필드가 존재하고 값이 `true`로 평가될 때만 실행됩니다.

`when` 메서드에 세 번째 인수로 또 다른 클로저를 전달할 수도 있습니다. 이 클로저는 첫 번째 인수가 `false`로 평가될 때만 실행됩니다. 다음 예시처럼, 이 값을 이용해 기본 정렬 방식을 지정할 수 있습니다.

```php
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
## 삽입(Insert) 구문

쿼리 빌더는 데이터베이스 테이블에 레코드를 삽입할 수 있는 `insert` 메서드도 제공합니다. 이 메서드는 컬럼명과 값이 담긴 배열을 인수로 받습니다.

```php
DB::table('users')->insert([
    'email' => 'kayla@example.com',
    'votes' => 0
]);
```

여러 레코드를 한 번에 저장하려면, 다차원 배열을 전달하면 됩니다. 각 배열이 테이블에 삽입될 한 개의 레코드를 의미합니다.

```php
DB::table('users')->insert([
    ['email' => 'picard@example.com', 'votes' => 0],
    ['email' => 'janeway@example.com', 'votes' => 0],
]);
```

`insertOrIgnore` 메서드는 레코드를 삽입하다가 오류가 발생해도 오류를 무시하고 계속 진행합니다. 이 메서드를 사용할 때는, 중복 레코드 오류와 일부 데이터베이스 엔진에서 발생할 수 있는 기타 오류들도 무시된다는 점에 유의해야 합니다. 예를 들어, `insertOrIgnore`는 [MySQL의 strict 모드](https://dev.mysql.com/doc/refman/en/sql-mode.html#ignore-effect-on-execution)를 우회합니다.

```php
DB::table('users')->insertOrIgnore([
    ['id' => 1, 'email' => 'sisko@example.com'],
    ['id' => 2, 'email' => 'archer@example.com'],
]);
```

`insertUsing` 메서드는 서브쿼리를 사용해서 삽입될 데이터를 결정하고, 테이블에 새로운 레코드를 삽입합니다.

```php
DB::table('pruned_users')->insertUsing([
    'id', 'name', 'email', 'email_verified_at'
], DB::table('users')->select(
    'id', 'name', 'email', 'email_verified_at'
)->where('updated_at', '<=', now()->subMonth()));
```

<a name="auto-incrementing-ids"></a>
#### 자동 증가 ID

테이블에 자동 증가 ID 컬럼이 있을 경우, `insertGetId` 메서드를 사용해서 레코드를 삽입하고, 삽입된 ID 값을 바로 조회할 수 있습니다.

```php
$id = DB::table('users')->insertGetId(
    ['email' => 'john@example.com', 'votes' => 0]
);
```

> [!WARNING]
> PostgreSQL을 사용할 경우, `insertGetId` 메서드는 자동 증가 컬럼명이 반드시 `id`여야 ID를 가져올 수 있습니다. 다른 "시퀀스"에서 ID를 조회하고 싶다면, 두 번째 인수로 컬럼명을 전달하면 됩니다.

<a name="upserts"></a>
### Upsert

`upsert` 메서드는 존재하지 않는 레코드는 새로 삽입하고, 이미 존재하는 레코드는 지정한 값으로 업데이트해 줍니다. 첫 번째 인수는 삽입 또는 갱신할 값의 배열, 두 번째 인수는 해당 테이블에서 레코드를 고유하게 식별할 컬럼(들)의 배열, 세 번째 인수는 이미 존재하는 레코드가 있으면 갱신할 컬럼명 배열입니다.

```php
DB::table('flights')->upsert(
    [
        ['departure' => 'Oakland', 'destination' => 'San Diego', 'price' => 99],
        ['departure' => 'Chicago', 'destination' => 'New York', 'price' => 150]
    ],
    ['departure', 'destination'],
    ['price']
);
```

위의 예시에서, 라라벨은 두 개의 레코드를 삽입을 시도합니다. 만약 동일한 `departure` 및 `destination` 컬럼 값을 갖는 레코드가 이미 존재하면, 그 레코드의 `price` 컬럼 값만 업데이트됩니다.

> [!WARNING]
> SQL Server를 제외한 모든 데이터베이스에서는, `upsert` 메서드의 두 번째 인수에 지정된 컬럼에 "primary" 혹은 "unique" 인덱스가 반드시 있어야 합니다. 또한, MariaDB 및 MySQL 드라이버는 `upsert` 메서드의 두 번째 인수를 무시하고 항상 테이블의 "primary" 및 "unique" 인덱스를 이용해 기존 레코드를 판별합니다.

<a name="update-statements"></a>
## 갱신(Update) 구문

쿼리 빌더는 레코드 삽입 외에도, 기존 레코드를 변경할 수 있는 `update` 메서드를 제공합니다. `update` 메서드는 `insert`와 마찬가지로, 갱신할 컬럼명과 값의 쌍을 담은 배열을 받으며, 갱신된 행(row)의 개수를 반환합니다. `where` 구문과 함께 사용해 업데이트 범위를 제한할 수도 있습니다.

```php
$affected = DB::table('users')
    ->where('id', 1)
    ->update(['votes' => 1]);
```

<a name="update-or-insert"></a>
#### 갱신 또는 삽입(Update or Insert)

때로는, 조건에 맞는 레코드가 있다면 갱신하고, 없다면 새로 생성해야 할 수 있습니다. 이럴 때는 `updateOrInsert` 메서드를 사용합니다. 이 메서드는 두 개의 인수를 받으며, 첫 번째는 레코드를 찾을 때 사용할 조건 배열, 두 번째는 갱신할 컬럼명과 값의 쌍 배열입니다.

`updateOrInsert` 메서드는 첫 번째 인수의 컬럼명-값 조건으로 레코드를 찾고, 일치하는 레코드가 있으면 두 번째 인수의 값으로 갱신하고, 없으면 두 인수를 합친 속성 값으로 새 레코드를 만듭니다.

```php
DB::table('users')
    ->updateOrInsert(
        ['email' => 'john@example.com', 'name' => 'John'],
        ['votes' => '2']
    );
```

또한, `updateOrInsert` 메서드에 클로저를 전달하여, 조건에 따라 동적으로 삽입하거나 갱신하는 속성을 지정할 수 있습니다.

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
### JSON 컬럼 갱신

JSON 컬럼을 갱신할 때는, 적절한 키를 업데이트할 수 있도록 `->` 구문을 사용해야 합니다. 이 기능은 MariaDB 10.3+, MySQL 5.7+, PostgreSQL 9.5+에서 사용할 수 있습니다.

```php
$affected = DB::table('users')
    ->where('id', 1)
    ->update(['options->enabled' => true]);
```

<a name="increment-and-decrement"></a>
### 증가 및 감소

쿼리 빌더는 지정한 컬럼의 값을 손쉽게 증가시키거나 감소시킬 수 있는 메서드도 제공합니다. 이 두 메서드 모두 최소 한 개의 인수(값을 변경할 컬럼명)를 필요로 하고, 두 번째 인수로 얼마만큼 증가/감소 시킬 것인지를 지정할 수도 있습니다.

```php
DB::table('users')->increment('votes');

DB::table('users')->increment('votes', 5);

DB::table('users')->decrement('votes');

DB::table('users')->decrement('votes', 5);
```

필요하다면, 증가/감소와 동시에 다른 컬럼 값을 같이 변경할 수도 있습니다.

```php
DB::table('users')->increment('votes', 1, ['name' => 'John']);
```

또한, `incrementEach` 및 `decrementEach` 메서드를 사용하면 여러 컬럼의 값을 한 번에 증가/감소시킬 수 있습니다.

```php
DB::table('users')->incrementEach([
    'votes' => 5,
    'balance' => 100,
]);
```

<a name="delete-statements"></a>
## 삭제(Delete) 구문

쿼리 빌더의 `delete` 메서드는 테이블에서 레코드를 삭제할 수 있습니다. `delete` 메서드는 삭제된 행(row) 수를 반환합니다. 삭제 쿼리도 호출하기 전에 `where` 등으로 대상을 제한할 수 있습니다.

```php
$deleted = DB::table('users')->delete();

$deleted = DB::table('users')->where('votes', '>', 100)->delete();
```

<a name="pessimistic-locking"></a>
## 비관적 잠금(Pessimistic Locking)

쿼리 빌더에는 `select` 쿼리를 실행할 때 "비관적 잠금"을 활용하는 몇 가지 메서드가 있습니다. "공유 잠금(shared lock)"을 사용하려면 `sharedLock` 메서드를 호출합니다. 공유 잠금은 트랜잭션이 커밋될 때까지 선택된 행이 수정되는 것을 막아줍니다.

```php
DB::table('users')
    ->where('votes', '>', 100)
    ->sharedLock()
    ->get();
```

또는, `lockForUpdate` 메서드를 사용할 수도 있습니다. "for update" 잠금은 선택된 레코드가 다른 공유 잠금이나 수정 쿼리에 의해 변경되지 못하도록 막아줍니다.

```php
DB::table('users')
    ->where('votes', '>', 100)
    ->lockForUpdate()
    ->get();
```

꼭 필수는 아니지만, 비관적 잠금 사용 시에는 해당 쿼리를 [트랜잭션](/docs/database#database-transactions) 내에서 감싸는 것이 권장됩니다. 이렇게 하면 쿼리가 끝날 때까지 데이터가 안전하게 보호되며, 에러가 발생하면 트랜잭션이 자동으로 롤백되고 잠금도 해제됩니다.

```php
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

<a name="reusable-query-components"></a>
## 재사용 가능한 쿼리 컴포넌트

애플리케이션에서 반복적으로 사용하는 쿼리 로직이 있다면, 쿼리 빌더의 `tap` 또는 `pipe` 메서드를 활용해 재사용 가능한 객체로 뽑아낼 수 있습니다. 예를 들어, 다음과 같은 쿼리가 있다고 가정해봅시다.

```php
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

$destination = $request->query('destination');

DB::table('flights')
    ->when($destination, function (Builder $query, string $destination) {
        $query->where('destination', $destination);
    })
    ->orderByDesc('price')
    ->get();

// ...

$destination = $request->query('destination');

DB::table('flights')
    ->when($destination, function (Builder $query, string $destination) {
        $query->where('destination', $destination);
    })
    ->where('user', $request->user()->id)
    ->orderBy('destination')
    ->get();
```

이처럼 목적지에 대한 필터링 로직이 여러 곳에 반복된다면, 해당 부분을 재사용 객체로 추출할 수 있습니다.

```php
<?php

namespace App\Scopes;

use Illuminate\Database\Query\Builder;

class DestinationFilter
{
    public function __construct(
        private ?string $destination,
    ) {
        //
    }

    public function __invoke(Builder $query): void
    {
        $query->when($this->destination, function (Builder $query) {
            $query->where('destination', $this->destination);
        });
    }
}
```

이제 쿼리 빌더의 `tap` 메서드를 사용해서, 추출한 객체를 쿼리에 바로 적용할 수 있습니다.

```php
use App\Scopes\DestinationFilter;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

DB::table('flights')
    ->when($destination, function (Builder $query, string $destination) { // [tl! remove]
        $query->where('destination', $destination); // [tl! remove]
    }) // [tl! remove]
    ->tap(new DestinationFilter($destination)) // [tl! add]
    ->orderByDesc('price')
    ->get();

// ...

DB::table('flights')
    ->when($destination, function (Builder $query, string $destination) { // [tl! remove]
        $query->where('destination', $destination); // [tl! remove]
    }) // [tl! remove]
    ->tap(new DestinationFilter($destination)) // [tl! add]
    ->where('user', $request->user()->id)
    ->orderBy('destination')
    ->get();
```

<a name="query-pipes"></a>
#### Query 파이프

`tap` 메서드는 항상 쿼리 빌더 인스턴스를 반환합니다. 쿼리를 실행하여 다른 값을 반환하는 객체로 추출하고 싶다면, 대신 `pipe` 메서드를 사용할 수 있습니다.

다음은 애플리케이션 내에서 공통으로 사용되는 [페이지네이션](/docs/pagination) 로직을 담고 있는 쿼리 객체 예시입니다. 이 객체는 `DestinationFilter`처럼 쿼리 조건을 추가하지 않고, 쿼리를 실행하여 페이지네이터 인스턴스를 반환합니다.

```php
<?php

namespace App\Scopes;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Query\Builder;

class Paginate
{
    public function __construct(
        private string $sortBy = 'timestamp',
        private string $sortDirection = 'desc',
        private string $perPage = 25,
    ) {
        //
    }

    public function __invoke(Builder $query): LengthAwarePaginator
    {
        return $query->orderBy($this->sortBy, $this->sortDirection)
            ->paginate($this->perPage, pageName: 'p');
    }
}
```

쿼리 빌더의 `pipe` 메서드를 사용하여, 공용 페이지네이션 로직을 손쉽게 적용할 수 있습니다.

```php
$flights = DB::table('flights')
    ->tap(new DestinationFilter($destination))
    ->pipe(new Paginate);
```

<a name="debugging"></a>
## 디버깅

쿼리를 작성하는 과정에서, `dd` 및 `dump` 메서드를 사용해 현재 쿼리의 바인딩 값과 SQL을 출력해볼 수 있습니다. `dd` 메서드는 디버그 정보를 출력하고 요청 실행을 중단하며, `dump` 메서드는 출력 후에도 요청을 계속 처리합니다.

```php
DB::table('users')->where('votes', '>', 100)->dd();

DB::table('users')->where('votes', '>', 100)->dump();
```

`dumpRawSql` 및 `ddRawSql` 메서드는 쿼리의 SQL에 모든 파라미터 바인딩 값이 치환된 형태로 출력해 줍니다.

```php
DB::table('users')->where('votes', '>', 100)->dumpRawSql();

DB::table('users')->where('votes', '>', 100)->ddRawSql();
```