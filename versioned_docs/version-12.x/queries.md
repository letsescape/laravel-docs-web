# 데이터베이스: 쿼리 빌더 (Database: Query Builder)

- [소개](#introduction)
- [데이터베이스 쿼리 실행](#running-database-queries)
    - [결과 청크 처리](#chunking-results)
    - [결과를 지연 스트리밍하기](#streaming-results-lazily)
    - [집계 함수](#aggregates)
- [Select 구문](#select-statements)
- [Raw 표현식](#raw-expressions)
- [조인(Joins)](#joins)
- [유니언(Union)](#unions)
- [기본 Where 구문](#basic-where-clauses)
    - [Where 구문](#where-clauses)
    - [Or Where 구문](#or-where-clauses)
    - [Where Not 구문](#where-not-clauses)
    - [Where Any / All / None 구문](#where-any-all-none-clauses)
    - [JSON Where 구문](#json-where-clauses)
    - [추가 Where 구문](#additional-where-clauses)
    - [논리적 그룹화](#logical-grouping)
- [고급 Where 구문](#advanced-where-clauses)
    - [Where Exists 구문](#where-exists-clauses)
    - [서브쿼리 Where 구문](#subquery-where-clauses)
    - [전문 검색 Where 구문](#full-text-where-clauses)
- [정렬, 그룹화, Limit 및 Offset](#ordering-grouping-limit-and-offset)
    - [정렬](#ordering)
    - [그룹화](#grouping)
    - [Limit 및 Offset](#limit-and-offset)
- [조건부 구문](#conditional-clauses)
- [Insert 구문](#insert-statements)
    - [업서트(Upsert)](#upserts)
- [Update 구문](#update-statements)
    - [JSON 컬럼 업데이트](#updating-json-columns)
    - [증가 및 감소](#increment-and-decrement)
- [Delete 구문](#delete-statements)
- [비관적 락](#pessimistic-locking)
- [재사용 가능한 쿼리 구성 요소](#reusable-query-components)
- [디버깅](#debugging)

<a name="introduction"></a>
## 소개

Laravel의 데이터베이스 쿼리 빌더는 데이터베이스 쿼리를 편리하게 생성하고 실행할 수 있는 유연한 인터페이스를 제공합니다. 애플리케이션에서 대부분의 데이터베이스 작업에 사용할 수 있으며, 라라벨이 지원하는 모든 데이터베이스 시스템과 완벽하게 호환됩니다.

라라벨 쿼리 빌더는 SQL 인젝션 공격으로부터 애플리케이션을 보호하기 위해 PDO의 파라미터 바인딩을 사용합니다. 쿼리 빌더에 전달되는 문자열을 쿼리 바인딩으로 사용할 때는 별도로 정리(clean)하거나, 값을 직접 소독(sanitize)할 필요가 없습니다.

> [!WARNING]
> PDO는 컬럼명 바인딩을 지원하지 않습니다. 따라서, 쿼리에서 참조하는 컬럼명(특히 "order by"에 사용되는 컬럼명 등)에 사용자의 입력을 직접 사용할 수 있도록 해서는 안 됩니다.

<a name="running-database-queries"></a>
## 데이터베이스 쿼리 실행

<a name="retrieving-all-rows-from-a-table"></a>
#### 테이블에서 모든 행 조회하기

쿼리를 시작할 때는 `DB` 파사드에서 제공하는 `table` 메서드를 사용할 수 있습니다. `table` 메서드는 지정한 테이블의 유연한 쿼리 빌더 인스턴스를 반환하므로, 여기에 여러 제약 조건을 체이닝(체인 형태로 연결)해서 마지막에 `get` 메서드를 호출해 결과를 가져올 수 있습니다.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * 애플리케이션의 모든 사용자 목록을 표시합니다.
     */
    public function index(): View
    {
        $users = DB::table('users')->get();

        return view('user.index', ['users' => $users]);
    }
}
```

`get` 메서드는 쿼리 결과가 들어 있는 `Illuminate\Support\Collection` 인스턴스를 반환하며, 각각의 결과는 PHP의 `stdClass` 객체 인스턴스입니다. 각 컬럼의 값을 객체의 속성(property)으로 접근할 수 있습니다.

```php
use Illuminate\Support\Facades\DB;

$users = DB::table('users')->get();

foreach ($users as $user) {
    echo $user->name;
}
```

> [!NOTE]
> 라라벨의 컬렉션은 데이터 매핑, 축소 등 매우 강력한 다양한 메서드를 제공합니다. 라라벨 컬렉션에 대한 자세한 정보는 [컬렉션 문서](/docs/12.x/collections)를 참고하세요.

<a name="retrieving-a-single-row-column-from-a-table"></a>
#### 테이블에서 하나의 행 또는 컬럼 값 조회하기

만약 테이블에서 한 개의 행만 조회할 필요가 있다면, `DB` 파사드의 `first` 메서드를 사용할 수 있습니다. 이 메서드는 하나의 `stdClass` 객체를 반환합니다.

```php
$user = DB::table('users')->where('name', 'John')->first();

return $user->email;
```

특정 행을 조회하되, 해당하는 행이 없을 경우 `Illuminate\Database\RecordNotFoundException` 예외를 발생시키고 싶다면 `firstOrFail` 메서드를 사용할 수 있습니다. 만약 `RecordNotFoundException`이 잡히지 않으면, 클라이언트에게 404 HTTP 응답이 자동으로 반환됩니다.

```php
$user = DB::table('users')->where('name', 'John')->firstOrFail();
```

전체 행이 필요 없다면, `value` 메서드를 이용해 레코드의 특정 컬럼 값만 뽑아올 수 있습니다. 이 메서드는 지정한 컬럼의 값만 바로 반환합니다.

```php
$email = DB::table('users')->where('name', 'John')->value('email');
```

특정 행을 `id` 컬럼 값으로 조회하려면 `find` 메서드를 사용하십시오.

```php
$user = DB::table('users')->find(3);
```

<a name="retrieving-a-list-of-column-values"></a>
#### 컬럼 값 목록 조회하기

특정 컬럼의 값만 모은 `Illuminate\Support\Collection` 인스턴스를 얻고 싶을 때는 `pluck` 메서드를 사용하면 됩니다. 아래 예제에서는 사용자 직함(title)만 모은 컬렉션을 가져옵니다.

```php
use Illuminate\Support\Facades\DB;

$titles = DB::table('users')->pluck('title');

foreach ($titles as $title) {
    echo $title;
}
```

`pluck` 메서드에 두 번째 인수를 제공하면 결과 컬렉션에서 사용될 키를 지정할 수 있습니다.

```php
$titles = DB::table('users')->pluck('title', 'name');

foreach ($titles as $name => $title) {
    echo $title;
}
```

<a name="chunking-results"></a>
### 결과 청크 처리

수천 개의 데이터베이스 레코드를 처리해야 하는 경우, `DB` 파사드에서 제공하는 `chunk` 메서드를 사용하는 것이 좋습니다. 이 메서드는 한 번에 소량의 결과만 조회하여, 각 청크를 클로저(익명 함수)로 넘겨서 처리할 수 있도록 합니다. 예를 들어, 한 번에 100개씩 `users` 테이블 전체를 가져오려면 다음과 같이 하면 됩니다.

```php
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

DB::table('users')->orderBy('id')->chunk(100, function (Collection $users) {
    foreach ($users as $user) {
        // ...
    }
});
```

클로저에서 `false`를 반환하면, 이후의 청크 처리가 중단됩니다.

```php
DB::table('users')->orderBy('id')->chunk(100, function (Collection $users) {
    // 레코드를 처리합니다...

    return false;
});
```

청크 처리 중에 데이터베이스 레코드를 업데이트하는 경우, 결과 집합이 예기치 않게 변경될 수 있으니 주의해야 합니다. 청크로 가져온 레코드를 업데이트할 계획이라면, 항상 `chunkById` 메서드를 사용하는 것이 가장 안전합니다. 이 메서드는 레코드의 기본 키(primary key)를 기준으로 자동으로 페이지네이션(분할 조회)합니다.

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

`chunkById` 및 `lazyById` 메서드는 쿼리에 자체적으로 "where" 조건을 추가하므로, 보통 본인의 조건은 [논리적으로 그룹화](#logical-grouping)해서 클로저 안에서 작성해야 합니다.

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
> 청크 콜백 내에서 레코드를 업데이트하거나 삭제할 때, 기본 키(primary key) 또는 외래 키가 변경되면 청크 쿼리에 영향을 줄 수 있습니다. 이로 인해 일부 레코드가 청크 결과에 빠질 수 있으니 각별히 주의해야 합니다.

<a name="streaming-results-lazily"></a>
### 결과를 지연 스트리밍하기

`lazy` 메서드는 [chunk 메서드](#chunking-results)와 비슷하게 쿼리를 청크 단위로 실행하지만, 각 청크를 콜백에 전달하는 대신 [LazyCollection](/docs/12.x/collections#lazy-collections)을 반환합니다. 이를 통해 결과를 하나의 스트림처럼 순차적으로 다룰 수 있습니다.

```php
use Illuminate\Support\Facades\DB;

DB::table('users')->orderBy('id')->lazy()->each(function (object $user) {
    // ...
});
```

청크 결과를 순회하며 바로 레코드를 업데이트하려는 경우에는, `lazyById` 또는 `lazyByIdDesc` 메서드를 사용하는 것이 더 안전합니다. 이 메서드는 레코드의 기본 키를 기준으로 자동으로 페이지네이션을 처리해 줍니다.

```php
DB::table('users')->where('active', false)
    ->lazyById()->each(function (object $user) {
        DB::table('users')
            ->where('id', $user->id)
            ->update(['active' => true]);
    });
```

> [!WARNING]
> 레코드를 순회하면서 업데이트하거나 삭제할 경우, 기본 키 또는 외래 키의 변경이 청크 쿼리에 영향을 줄 수 있습니다. 이로 인해 일부 레코드가 결과에서 누락될 수 있으니 주의하세요.

<a name="aggregates"></a>
### 집계 함수

쿼리 빌더는 `count`, `max`, `min`, `avg`, `sum`과 같은 다양한 집계(aggregate) 값을 조회하는 메서드들도 제공합니다. 쿼리를 구성한 후, 이러한 집계 메서드를 호출하면 됩니다.

```php
use Illuminate\Support\Facades\DB;

$users = DB::table('users')->count();

$price = DB::table('orders')->max('price');
```

물론, 집계 메서드는 다른 조건절들과 조합해서 집계 대상을 세밀하게 지정할 수도 있습니다.

```php
$price = DB::table('orders')
    ->where('finalized', 1)
    ->avg('price');
```

<a name="determining-if-records-exist"></a>
#### 레코드 존재 여부 판단하기

특정 조건을 만족하는 레코드가 존재하는지 확인하기 위해 굳이 `count` 메서드를 사용하지 않아도 됩니다. 대신 `exists`와 `doesntExist` 메서드를 사용할 수 있습니다.

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

반드시 테이블의 모든 컬럼을 선택(select)할 필요는 없습니다. 쿼리에서 `select` 메서드를 사용해, 원하는 컬럼만 골라서 조회할 수 있습니다.

```php
use Illuminate\Support\Facades\DB;

$users = DB::table('users')
    ->select('name', 'email as user_email')
    ->get();
```

`distinct` 메서드를 사용하면, 중복 없이(distinct) 결과를 반환하도록 쿼리를 강제할 수 있습니다.

```php
$users = DB::table('users')->distinct()->get();
```

이미 쿼리 빌더 인스턴스가 있는 상태에서 기존 select 절에 컬럼을 더 추가하고 싶다면, `addSelect` 메서드를 사용할 수 있습니다.

```php
$query = DB::table('users')->select('name');

$users = $query->addSelect('age')->get();
```

<a name="raw-expressions"></a>
## Raw 표현식

때때로 쿼리에 임의의 문자열을 삽입해야 할 때가 있습니다. 이럴 때는 `DB` 파사드가 제공하는 `raw` 메서드를 사용하여 raw(가공되지 않은) 문자열 표현식을 만들 수 있습니다.

```php
$users = DB::table('users')
    ->select(DB::raw('count(*) as user_count, status'))
    ->where('status', '<>', 1)
    ->groupBy('status')
    ->get();
```

> [!WARNING]
> Raw 구문은 쿼리에 문자열 형태 그대로 삽입됩니다. SQL 인젝션 취약점이 생길 수 있으니 각별히 주의해서 사용해야 합니다.

<a name="raw-methods"></a>
### Raw 메서드 모음

`DB::raw` 메서드를 직접 사용하는 대신, 쿼리의 다양한 부분에 raw 표현식을 삽입하는 다음의 메서드들도 활용할 수 있습니다. **하지만, raw 표현식이 삽입된 쿼리는 라라벨이 SQL 인젝션으로부터 완전히 보호된다고 보장할 수 없습니다.**

<a name="selectraw"></a>
#### `selectRaw`

`selectRaw` 메서드는 `addSelect(DB::raw(/* ... */))` 대신 사용할 수 있습니다. 두 번째 인자로 바인딩 값을 배열로 전달하는 것도 가능합니다.

```php
$orders = DB::table('orders')
    ->selectRaw('price * ? as price_with_tax', [1.0825])
    ->get();
```

<a name="whereraw-orwhereraw"></a>
#### `whereRaw / orWhereRaw`

`whereRaw`와 `orWhereRaw` 메서드는 쿼리에 raw "where" 절을 삽입할 때 사용할 수 있습니다. 두 번째 인자로 바인딩 값을 배열로 전달할 수 있습니다.

```php
$orders = DB::table('orders')
    ->whereRaw('price > IF(state = "TX", ?, 100)', [200])
    ->get();
```

<a name="havingraw-orhavingraw"></a>
#### `havingRaw / orHavingRaw`

`havingRaw`와 `orHavingRaw` 메서드는 "having" 절에서 raw 문자열을 사용할 수 있게 해줍니다. 두 번째 인자에 바인딩 값 배열도 전달할 수 있습니다.

```php
$orders = DB::table('orders')
    ->select('department', DB::raw('SUM(price) as total_sales'))
    ->groupBy('department')
    ->havingRaw('SUM(price) > ?', [2500])
    ->get();
```

<a name="orderbyraw"></a>
#### `orderByRaw`

`orderByRaw` 메서드는 "order by" 절에 raw 문자열을 지정하고자 할 때 사용합니다.

```php
$orders = DB::table('orders')
    ->orderByRaw('updated_at - created_at DESC')
    ->get();
```

<a name="groupbyraw"></a>
### `groupByRaw`

`groupByRaw` 메서드는 `group by` 절에 raw 문자열을 전달하고자 할 때 사용합니다.

```php
$orders = DB::table('orders')
    ->select('city', 'state')
    ->groupByRaw('city, state')
    ->get();
```

<a name="joins"></a>
## 조인(Joins)

<a name="inner-join-clause"></a>
#### Inner Join 절

쿼리 빌더를 사용해 쿼리에 조인(join) 절을 추가할 수 있습니다. 기본적인 "inner join"을 수행하려면, 쿼리 빌더 인스턴스의 `join` 메서드를 사용하면 됩니다. `join` 메서드의 첫 번째 인자는 조인할 테이블명이고, 남은 인자들은 조인의 컬럼 제약 조건을 지정합니다. 한 쿼리에서 여러 테이블을 조인하는 것도 가능합니다.

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

"inner join" 대신 "left join"이나 "right join"을 수행하고 싶다면, `leftJoin` 또는 `rightJoin` 메서드를 사용하십시오. 이 메서드들의 사용법은 `join` 메서드와 동일합니다.

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

"cross join"을 수행할 때는 `crossJoin` 메서드를 사용할 수 있습니다. cross join은 첫 번째 테이블과 조인 대상 테이블 사이에 데카르트 곱(모든 조합)을 생성합니다.

```php
$sizes = DB::table('sizes')
    ->crossJoin('colors')
    ->get();
```

<a name="advanced-join-clauses"></a>
#### 고급 Join 절

더 복잡한 조건의 조인을 지정하고자 할 경우, `join` 메서드의 두 번째 인자로 클로저를 전달할 수 있습니다. 이 클로저는 `Illuminate\Database\Query\JoinClause` 인스턴스를 받아와서, "join" 절의 다양한 제약 조건을 지정할 수 있습니다.

```php
DB::table('users')
    ->join('contacts', function (JoinClause $join) {
        $join->on('users.id', '=', 'contacts.user_id')->orOn(/* ... */);
    })
    ->get();
```

조인에 "where" 조건을 추가하고 싶다면, `JoinClause` 인스턴스가 제공하는 `where`와 `orWhere` 메서드를 사용할 수 있습니다. 이 메서드들은 두 컬럼을 비교하는 대신, 컬럼과 값을 비교합니다.

```php
DB::table('users')
    ->join('contacts', function (JoinClause $join) {
        $join->on('users.id', '=', 'contacts.user_id')
            ->where('contacts.user_id', '>', 5);
    })
    ->get();
```

<a name="subquery-joins"></a>
#### 서브쿼리 Join

`joinSub`, `leftJoinSub`, `rightJoinSub` 메서드를 이용하면 쿼리에 서브쿼리를 조인할 수 있습니다. 각 메서드는 세 개의 매개변수를 받으며, 서브쿼리, 테이블 별칭, 그리고 연관 컬럼을 정의하는 클로저를 전달해야 합니다. 아래 예제에서는, 최근 게시글이 등록된 시각(created_at)을 포함시켜 사용자 컬렉션을 조회합니다.

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
> Lateral join은 PostgreSQL, MySQL >= 8.0.14, SQL Server에서만 지원됩니다.

`joinLateral`, `leftJoinLateral` 메서드를 이용해 서브쿼리와 함께 "lateral join"을 수행할 수 있습니다. 각 메서드는 두 개의 인자를 받으며, 첫 번째는 서브쿼리, 두 번째는 테이블 별칭입니다. 조인 조건은 서브쿼리의 `where` 절에서 지정합니다. Lateral join은 각 행마다 평가되며, 서브쿼리 밖 컬럼도 참조할 수 있습니다.

다음 예제에서는 각 사용자의 최근 블로그 포스트 3개까지 결과로 가져옵니다. 각 사용자는 본인의 최근 게시글 개수만큼(최대 3개) 결과 행을 가질 수 있습니다. 조인 조건은 서브쿼리 내에서 `whereColumn`을 사용해 현재 사용자 행을 참조합니다.

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
## 유니언(Union)

쿼리 빌더는 여러 쿼리를 "union"으로 합치는 간편한 방법도 제공합니다. 예를 들어, 먼저 첫 번째 쿼리를 만들고, `union` 메서드를 사용해 추가 쿼리를 결합할 수 있습니다.

```php
use Illuminate\Support\Facades\DB;

$first = DB::table('users')
    ->whereNull('first_name');

$users = DB::table('users')
    ->whereNull('last_name')
    ->union($first)
    ->get();
```

`union` 메서드 외에도 `unionAll` 메서드가 있습니다. `unionAll`을 통해 결합하면 중복 결과가 제거되지 않습니다. `unionAll`의 시그니처(매개변수 형식)는 `union`과 동일합니다.

<a name="basic-where-clauses"></a>
## 기본 Where 구문

<a name="where-clauses"></a>
### Where 구문

쿼리 빌더의 `where` 메서드를 사용해 쿼리에 "where" 조건을 추가할 수 있습니다. 기본적인 `where` 메서드는 세 개의 인자를 받는데, 첫 번째는 컬럼명, 두 번째는 데이터베이스에서 지원하는 연산자(operator), 세 번째는 컬럼과 비교할 값입니다.

예를 들어, 아래 쿼리는 `votes` 컬럼이 `100`과 같고, `age` 컬럼이 `35`보다 큰 사용자를 조회합니다.

```php
$users = DB::table('users')
    ->where('votes', '=', 100)
    ->where('age', '>', 35)
    ->get();
```

이 값이 `=` 인지 확인하는 경우에는 값만 두 번째 인자로 전달하면 되고, 라라벨이 자동으로 `=` 연산자를 사용합니다.

```php
$users = DB::table('users')->where('votes', 100)->get();
```

앞서 언급한 것처럼, 데이터베이스에서 지원하는 모든 연산자를 사용할 수 있습니다.

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

세 개의 인자 대신, 조건 배열을 한 번에 전달할 수도 있습니다. 배열의 각 요소는 일반적인 `where` 메서드에서 전달하는 세 개의 인자가 들어 있는 배열입니다.

```php
$users = DB::table('users')->where([
    ['status', '=', '1'],
    ['subscribed', '<>', '1'],
])->get();
```

> [!WARNING]
> PDO는 컬럼명 바인딩을 지원하지 않습니다. 따라서, 쿼리에서 참조하는 컬럼명(특히 "order by"에 사용되는 컬럼명 등)에 사용자의 입력을 직접 사용할 수 있도록 해서는 안 됩니다.

> [!WARNING]
> MySQL과 MariaDB에서는 문자열과 숫자를 비교할 때 문자열을 자동으로 정수형으로 변환합니다. 이 변환 과정에서 숫자가 아닌 문자열은 `0`으로 변환되고, 예상과 다른 결과가 나타날 수 있습니다. 예를 들어, 테이블의 `secret` 컬럼 값이 `aaa`이고, `User::where('secret', 0)`처럼 쿼리를 실행하면 해당 행이 반환됩니다. 이를 방지하려면, 쿼리에서 사용할 모든 값의 타입을 미리 적절하게 맞추어야 합니다.

<a name="or-where-clauses"></a>
### Or Where 구문

`where` 메서드를 여러 번 체이닝하면 각 "where" 절이 `and` 조건으로 연결됩니다. 그러나, 쿼리에서 조건을 `or`로 연결하고 싶다면, `orWhere` 메서드를 사용하면 됩니다. `orWhere`는 `where`와 같은 인자를 받습니다.

```php
$users = DB::table('users')
    ->where('votes', '>', 100)
    ->orWhere('name', 'John')
    ->get();
```

"or" 조건을 괄호로 묶어서 그룹핑하고 싶을 때는, `orWhere`의 첫 번째 인자로 클로저를 전달하면 됩니다.

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

위 예제를 SQL로 나타내면 아래와 같습니다.

```sql
select * from users where votes > 100 or (name = 'Abigail' and votes > 50)
```

> [!WARNING]
> 예상치 못한 동작을 방지하려면, 전역 스코프가 적용될 때는 반드시 `orWhere` 호출을 그룹화해 주어야 합니다.

<a name="where-not-clauses"></a>

### Where Not 절

`whereNot` 및 `orWhereNot` 메서드는 주어진 쿼리 조건 그룹을 반대로 적용(부정)하는 데 사용할 수 있습니다. 예를 들어, 아래의 쿼리는 할인 중이거나 가격이 10 미만인 상품을 제외합니다.

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

여러 컬럼에 동일한 쿼리 조건을 적용해야 할 때가 있습니다. 예를 들어, 특정 목록 내의 컬럼 중 하나라도 지정한 값과 `LIKE` 조건이 일치하는 모든 레코드를 조회하고 싶을 수 있습니다. 이럴 때는 `whereAny` 메서드를 사용할 수 있습니다.

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

위 쿼리는 다음과 같은 SQL을 생성합니다.

```sql
SELECT *
FROM users
WHERE active = true AND (
    name LIKE 'Example%' OR
    email LIKE 'Example%' OR
    phone LIKE 'Example%'
)
```

마찬가지로, `whereAll` 메서드는 지정한 모든 컬럼이 특정 조건과 일치하는 레코드를 조회할 때 사용할 수 있습니다.

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

`whereNone` 메서드는 지정한 컬럼 중 어느 것도 특정 조건에 일치하지 않는 레코드를 조회할 때 사용할 수 있습니다.

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

Laravel은 JSON 컬럼 타입을 지원하는 데이터베이스에서 JSON 컬럼 쿼리도 지원합니다. 현재 지원되는 데이터베이스는 MariaDB 10.3+, MySQL 8.0+, PostgreSQL 12.0+, SQL Server 2017+, SQLite 3.39.0+ 등입니다. JSON 컬럼을 쿼리하려면 `->` 연산자를 사용하세요.

```php
$users = DB::table('users')
    ->where('preferences->dining->meal', 'salad')
    ->get();
```

`whereJsonContains`를 사용하면 JSON 배열을 조회할 수 있습니다.

```php
$users = DB::table('users')
    ->whereJsonContains('options->languages', 'en')
    ->get();
```

만약 MariaDB, MySQL, PostgreSQL 데이터베이스를 사용하고 있다면, `whereJsonContains` 메서드에 값의 배열도 전달할 수 있습니다.

```php
$users = DB::table('users')
    ->whereJsonContains('options->languages', ['en', 'de'])
    ->get();
```

`whereJsonLength` 메서드를 사용하면 JSON 배열의 길이를 조건으로 쿼리할 수 있습니다.

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

`whereLike` 메서드는 패턴 매칭을 위한 "LIKE" 절을 쿼리에 추가할 수 있습니다. 이 메서드들은 데이터베이스의 종류와 상관없이 문자열 매칭 쿼리를 수행할 수 있으며, 대소문자 구분 여부도 직접 제어할 수 있습니다. 기본적으로 문자열 매칭은 대소문자를 구분하지 않습니다.

```php
$users = DB::table('users')
    ->whereLike('name', '%John%')
    ->get();
```

`caseSensitive` 인수를 통해 대소문자를 구분하는 검색도 가능합니다.

```php
$users = DB::table('users')
    ->whereLike('name', '%John%', caseSensitive: true)
    ->get();
```

`orWhereLike` 메서드는 "or" 절과 함께 LIKE 조건을 추가합니다.

```php
$users = DB::table('users')
    ->where('votes', '>', 100)
    ->orWhereLike('name', '%John%')
    ->get();
```

`whereNotLike` 메서드는 "NOT LIKE" 절을 쿼리에 추가합니다.

```php
$users = DB::table('users')
    ->whereNotLike('name', '%John%')
    ->get();
```

마찬가지로, `orWhereNotLike`을 사용하면 "or"와 함께 NOT LIKE 조건을 추가할 수 있습니다.

```php
$users = DB::table('users')
    ->where('votes', '>', 100)
    ->orWhereNotLike('name', '%John%')
    ->get();
```

> [!WARNING]
> `whereLike`의 대소문자 구분 검색 옵션은 현재 SQL Server에서는 지원되지 않습니다.

**whereIn / whereNotIn / orWhereIn / orWhereNotIn**

`whereIn` 메서드는 지정한 컬럼 값이 주어진 배열 안에 포함되어 있는지 확인합니다.

```php
$users = DB::table('users')
    ->whereIn('id', [1, 2, 3])
    ->get();
```

`whereNotIn` 메서드는 해당 컬럼 값이 주어진 배열에 없는지를 확인합니다.

```php
$users = DB::table('users')
    ->whereNotIn('id', [1, 2, 3])
    ->get();
```

`whereIn` 메서드의 두 번째 인수로 쿼리 객체를 전달할 수도 있습니다.

```php
$activeUsers = DB::table('users')->select('id')->where('is_active', 1);

$users = DB::table('comments')
    ->whereIn('user_id', $activeUsers)
    ->get();
```

위 예시는 다음과 같은 SQL을 생성합니다.

```sql
select * from comments where user_id in (
    select id
    from users
    where is_active = 1
)
```

> [!WARNING]
> 쿼리에 많은 수의 정수형 데이터 바인딩을 추가해야 할 경우에는, `whereIntegerInRaw` 또는 `whereIntegerNotInRaw` 메서드를 사용하면 메모리 사용량을 크게 줄일 수 있습니다.

**whereBetween / orWhereBetween**

`whereBetween` 메서드는 컬럼 값이 두 값 사이에 있는지 확인합니다.

```php
$users = DB::table('users')
    ->whereBetween('votes', [1, 100])
    ->get();
```

**whereNotBetween / orWhereNotBetween**

`whereNotBetween` 메서드는 컬럼 값이 두 값의 범위를 벗어났는지 확인합니다.

```php
$users = DB::table('users')
    ->whereNotBetween('votes', [1, 100])
    ->get();
```

**whereBetweenColumns / whereNotBetweenColumns / orWhereBetweenColumns / orWhereNotBetweenColumns**

`whereBetweenColumns` 메서드는 한 컬럼의 값이 같은 행의 다른 두 컬럼 값 사이에 있는지 확인합니다.

```php
$patients = DB::table('patients')
    ->whereBetweenColumns('weight', ['minimum_allowed_weight', 'maximum_allowed_weight'])
    ->get();
```

`whereNotBetweenColumns` 메서드는 한 컬럼의 값이 같은 행의 두 컬럼 값의 범위를 벗어났는지 확인합니다.

```php
$patients = DB::table('patients')
    ->whereNotBetweenColumns('weight', ['minimum_allowed_weight', 'maximum_allowed_weight'])
    ->get();
```

**whereNull / whereNotNull / orWhereNull / orWhereNotNull**

`whereNull` 메서드는 지정한 컬럼의 값이 `NULL`인지 확인합니다.

```php
$users = DB::table('users')
    ->whereNull('updated_at')
    ->get();
```

`whereNotNull` 메서드는 해당 컬럼 값이 `NULL`이 아닌지 확인합니다.

```php
$users = DB::table('users')
    ->whereNotNull('updated_at')
    ->get();
```

**whereDate / whereMonth / whereDay / whereYear / whereTime**

`whereDate` 메서드는 컬럼 값을 날짜와 비교하는 데 사용할 수 있습니다.

```php
$users = DB::table('users')
    ->whereDate('created_at', '2016-12-31')
    ->get();
```

`whereMonth` 메서드는 컬럼 값을 특정한 월(month)과 비교할 때 사용할 수 있습니다.

```php
$users = DB::table('users')
    ->whereMonth('created_at', '12')
    ->get();
```

`whereDay` 메서드는 컬럼 값을 특정한 일(day)과 비교할 때 사용할 수 있습니다.

```php
$users = DB::table('users')
    ->whereDay('created_at', '31')
    ->get();
```

`whereYear` 메서드는 컬럼 값을 특정한 연도와 비교할 때 사용할 수 있습니다.

```php
$users = DB::table('users')
    ->whereYear('created_at', '2016')
    ->get();
```

`whereTime` 메서드는 컬럼 값을 특정 시각과 비교할 때 사용할 수 있습니다.

```php
$users = DB::table('users')
    ->whereTime('created_at', '=', '11:20:45')
    ->get();
```

**wherePast / whereFuture / whereToday / whereBeforeToday / whereAfterToday**

`wherePast`와 `whereFuture` 메서드는 컬럼 값이 과거인지 미래인지 판단하는 데 사용할 수 있습니다.

```php
$invoices = DB::table('invoices')
    ->wherePast('due_at')
    ->get();

$invoices = DB::table('invoices')
    ->whereFuture('due_at')
    ->get();
```

`whereNowOrPast` 및 `whereNowOrFuture`는 현재 날짜와 시간을 포함해서 과거나 미래인지를 판단할 수 있습니다.

```php
$invoices = DB::table('invoices')
    ->whereNowOrPast('due_at')
    ->get();

$invoices = DB::table('invoices')
    ->whereNowOrFuture('due_at')
    ->get();
```

`whereToday`, `whereBeforeToday`, `whereAfterToday` 메서드는 각각 컬럼 값이 오늘, 오늘 이전, 오늘 이후인지 판단하는 데 사용할 수 있습니다.

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

마찬가지로, `whereTodayOrBefore`, `whereTodayOrAfter` 메서드는 오늘을 포함하여 오늘 이전/이후인 컬럼 값을 판단하는 데 사용할 수 있습니다.

```php
$invoices = DB::table('invoices')
    ->whereTodayOrBefore('due_at')
    ->get();

$invoices = DB::table('invoices')
    ->whereTodayOrAfter('due_at')
    ->get();
```

**whereColumn / orWhereColumn**

`whereColumn` 메서드는 두 컬럼의 값이 같은지 비교할 때 사용할 수 있습니다.

```php
$users = DB::table('users')
    ->whereColumn('first_name', 'last_name')
    ->get();
```

또한, 비교 연산자를 함께 전달할 수도 있습니다.

```php
$users = DB::table('users')
    ->whereColumn('updated_at', '>', 'created_at')
    ->get();
```

컬럼 비교를 배열로 전달하면, 조건들은 모두 `and`로 결합됩니다.

```php
$users = DB::table('users')
    ->whereColumn([
        ['first_name', '=', 'last_name'],
        ['updated_at', '>', 'created_at'],
    ])->get();
```

<a name="logical-grouping"></a>
### 논리적 그룹화

하나의 쿼리 내에서 여러 개의 "where" 조건을 괄호로 묶어 논리적으로 그룹화해야 할 때가 있습니다. 실제로, 예기치 않은 쿼리 동작을 방지하기 위해서는 `orWhere` 메서드 사용 시 항상 괄호로 grouping하는 것이 좋습니다. 이를 위해 `where` 메서드에 클로저를 전달할 수 있습니다.

```php
$users = DB::table('users')
    ->where('name', '=', 'John')
    ->where(function (Builder $query) {
        $query->where('votes', '>', 100)
            ->orWhere('title', '=', 'Admin');
    })
    ->get();
```

위 예시처럼, `where` 메서드에 클로저를 전달하면 쿼리 빌더는 괄호 그룹 내에 제한 조건 그룹을 생성합니다. 클로저에는 쿼리 빌더 인스턴스가 전달되므로, 괄호 그룹 내에 들어갈 조건을 자유롭게 지정할 수 있습니다. 위 코드는 다음과 같은 SQL을 생성합니다.

```sql
select * from users where name = 'John' and (votes > 100 or title = 'Admin')
```

> [!WARNING]
> 글로벌 스코프가 적용된 상황에서 예기치 않은 동작을 방지하기 위해, 항상 `orWhere`는 그룹으로 묶어서 사용하는 것이 좋습니다.

<a name="advanced-where-clauses"></a>
## 고급 Where 절

<a name="where-exists-clauses"></a>
### Where Exists 절

`whereExists` 메서드를 사용하면 "where exists" SQL 절을 작성할 수 있습니다. `whereExists`는 클로저를 인수로 받아 쿼리 빌더 인스턴스를 전달하며, "exists" 절 내부에 들어갈 쿼리를 정의할 수 있습니다.

```php
$users = DB::table('users')
    ->whereExists(function (Builder $query) {
        $query->select(DB::raw(1))
            ->from('orders')
            ->whereColumn('orders.user_id', 'users.id');
    })
    ->get();
```

또는 클로저 대신 쿼리 객체를 `whereExists`에 바로 전달할 수도 있습니다.

```php
$orders = DB::table('orders')
    ->select(DB::raw(1))
    ->whereColumn('orders.user_id', 'users.id');

$users = DB::table('users')
    ->whereExists($orders)
    ->get();
```

위 두 예시 모두 아래와 같은 SQL을 생성합니다.

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

경우에 따라 서브쿼리 결과와 특정 값을 비교하는 "where" 조건이 필요할 수 있습니다. 이럴 때는 `where` 메서드에 클로저와 비교 값을 함께 전달하면 됩니다. 아래 예시는 'membership' 테이블에서 주어진 타입의 최근 멤버십이 있는 사용자를 모두 조회합니다.

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

또는, 컬럼 값을 서브쿼리 결과와 직접 비교하는 조건도 만들 수 있습니다. 아래 예시는 amount가 평균값보다 작은 경우의 모든 수입 기록을 조회합니다.

```php
use App\Models\Income;
use Illuminate\Database\Query\Builder;

$incomes = Income::where('amount', '<', function (Builder $query) {
    $query->selectRaw('avg(i.amount)')->from('incomes as i');
})->get();
```

<a name="full-text-where-clauses"></a>
### 전문(Full Text) Where 절

> [!WARNING]
> 전문(Full Text) Where 절은 현재 MariaDB, MySQL, PostgreSQL에서만 지원됩니다.

`whereFullText` 및 `orWhereFullText` 메서드는 [Full Text 인덱스](/docs/12.x/migrations#available-index-types)가 적용된 컬럼에 대해 쿼리에 전문 검색을 위한 "where" 절을 추가합니다. 이 메서드들은 Laravel이 사용하는 데이터베이스에 맞는 적절한 SQL로 자동 변환되며, MariaDB나 MySQL을 사용하는 경우에는 `MATCH AGAINST` 절이 생성됩니다.

```php
$users = DB::table('users')
    ->whereFullText('bio', 'web developer')
    ->get();
```

<a name="ordering-grouping-limit-and-offset"></a>
## 정렬, 그룹화, Limit, Offset

<a name="ordering"></a>
### 정렬

<a name="orderby"></a>
#### `orderBy` 메서드

`orderBy` 메서드는 지정한 컬럼을 기준으로 쿼리 결과를 정렬합니다. 첫 번째 인자로 정렬할 컬럼 이름, 두 번째 인자로 오름차순(`asc`) 또는 내림차순(`desc`)을 지정할 수 있습니다.

```php
$users = DB::table('users')
    ->orderBy('name', 'desc')
    ->get();
```

여러 개의 컬럼을 기준으로 순차적으로 정렬하고 싶다면, `orderBy`를 여러 번 호출하면 됩니다.

```php
$users = DB::table('users')
    ->orderBy('name', 'desc')
    ->orderBy('email', 'asc')
    ->get();
```

<a name="latest-oldest"></a>
#### `latest` 및 `oldest` 메서드

`latest`와 `oldest` 메서드를 사용하면 날짜 기준으로 손쉽게 결과를 정렬할 수 있습니다. 기본적으로 테이블의 `created_at` 컬럼을 기준으로 정렬하며, 정렬할 다른 컬럼명을 인자로 전달할 수도 있습니다.

```php
$user = DB::table('users')
    ->latest()
    ->first();
```

<a name="random-ordering"></a>
#### 무작위 정렬

`inRandomOrder` 메서드를 사용하면 쿼리 결과를 무작위로 정렬할 수 있습니다. 예를 들어, 임의의 사용자를 한 명 조회하고 싶다면 다음과 같이 할 수 있습니다.

```php
$randomUser = DB::table('users')
    ->inRandomOrder()
    ->first();
```

<a name="removing-existing-orderings"></a>
#### 기존 정렬 기준 제거

`reorder` 메서드는 쿼리에 미리 적용된 모든 "order by" 절을 제거합니다.

```php
$query = DB::table('users')->orderBy('name');

$unorderedUsers = $query->reorder()->get();
```

`reorder` 메서드에 컬럼과 정렬 방향을 함께 전달하면, 기존의 모든 "order by" 절을 제거하고 완전히 새로운 정렬 기준을 적용합니다.

```php
$query = DB::table('users')->orderBy('name');

$usersOrderedByEmail = $query->reorder('email', 'desc')->get();
```

<a name="grouping"></a>

### 그룹화

<a name="groupby-having"></a>
#### `groupBy` 및 `having` 메서드

예상하듯이, `groupBy`와 `having` 메서드를 사용하여 쿼리 결과를 그룹화할 수 있습니다. `having` 메서드의 시그니처는 `where` 메서드와 유사합니다.

```php
$users = DB::table('users')
    ->groupBy('account_id')
    ->having('account_id', '>', 100)
    ->get();
```

`havingBetween` 메서드를 사용하면 지정한 범위 내의 결과만 필터링할 수 있습니다.

```php
$report = DB::table('orders')
    ->selectRaw('count(id) as number_of_orders, customer_id')
    ->groupBy('customer_id')
    ->havingBetween('number_of_orders', [5, 15])
    ->get();
```

`groupBy` 메서드에 여러 인수를 전달하여 여러 컬럼으로 그룹화할 수도 있습니다.

```php
$users = DB::table('users')
    ->groupBy('first_name', 'status')
    ->having('account_id', '>', 100)
    ->get();
```

더 복잡한 `having` 조건을 작성하려면 [havingRaw](#raw-methods) 메서드 문서를 참고하세요.

<a name="limit-and-offset"></a>
### Limit 및 Offset

<a name="skip-take"></a>
#### `skip` 및 `take` 메서드

`skip`과 `take` 메서드를 활용하면 쿼리에서 반환되는 결과의 수를 제한하거나 특정 개수만큼 결과를 건너뛸 수 있습니다.

```php
$users = DB::table('users')->skip(10)->take(5)->get();
```

또는, `limit`과 `offset` 메서드를 사용할 수도 있습니다. 이 메서드들은 각각 `take`와 `skip` 메서드와 기능적으로 동일합니다.

```php
$users = DB::table('users')
    ->offset(10)
    ->limit(5)
    ->get();
```

<a name="conditional-clauses"></a>
## 조건부 절(Conditional Clauses)

때로는 어떤 조건에 따라 쿼리의 특정 조건문을 적용하고 싶을 수 있습니다. 예를 들어, HTTP 요청에서 특정 입력값이 있을 때에만 `where` 조건을 추가하는 경우가 있습니다. 이런 경우 `when` 메서드를 사용할 수 있습니다.

```php
$role = $request->input('role');

$users = DB::table('users')
    ->when($role, function (Builder $query, string $role) {
        $query->where('role_id', $role);
    })
    ->get();
```

`when` 메서드는 첫 번째 인수가 `true`로 평가될 때만 두 번째 인수로 전달한 클로저를 실행합니다. 만약 첫 번째 인수가 `false`라면, 클로저는 실행되지 않습니다. 위의 예시에서 `when`에 전달한 클로저는 요청에서 `role` 필드가 존재하고 `true`로 평가될 때에만 실행됩니다.

또한 세 번째 인수로 클로저를 하나 더 전달할 수 있습니다. 이 클로저는 첫 번째 인수가 `false`일 때에만 실행됩니다. 다음은 이 기능을 활용하여 쿼리의 기본 정렬 기준을 설정하는 예시입니다.

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
## Insert 문

쿼리 빌더는 데이터베이스 테이블에 레코드를 삽입할 수 있는 `insert` 메서드도 제공합니다. `insert` 메서드는 컬럼명과 값으로 이루어진 배열을 받습니다.

```php
DB::table('users')->insert([
    'email' => 'kayla@example.com',
    'votes' => 0
]);
```

여러 레코드를 한 번에 삽입하려면 배열 안에 여러 개의 배열을 전달하면 됩니다. 각 배열은 테이블에 삽입할 하나의 레코드를 나타냅니다.

```php
DB::table('users')->insert([
    ['email' => 'picard@example.com', 'votes' => 0],
    ['email' => 'janeway@example.com', 'votes' => 0],
]);
```

`insertOrIgnore` 메서드는 레코드를 삽입할 때 오류를 무시합니다. 즉, 이 메서드를 사용할 경우, 중복 레코드 오류 같은 것은 무시되고, 데이터베이스 엔진 종류에 따라 다른 유형의 오류도 무시될 수 있습니다. 예를 들어, `insertOrIgnore`는 [MySQL의 strict mode를 우회](https://dev.mysql.com/doc/refman/en/sql-mode.html#ignore-effect-on-execution)합니다.

```php
DB::table('users')->insertOrIgnore([
    ['id' => 1, 'email' => 'sisko@example.com'],
    ['id' => 2, 'email' => 'archer@example.com'],
]);
```

`insertUsing` 메서드는 하위 쿼리에서 가져온 데이터를 사용하여 새로운 레코드를 테이블에 삽입할 때 사용합니다.

```php
DB::table('pruned_users')->insertUsing([
    'id', 'name', 'email', 'email_verified_at'
], DB::table('users')->select(
    'id', 'name', 'email', 'email_verified_at'
)->where('updated_at', '<=', now()->subMonth()));
```

<a name="auto-incrementing-ids"></a>
#### 자동 증가 ID

테이블에 자동 증가 id 컬럼이 있다면, `insertGetId` 메서드로 레코드를 삽입하고 해당 id 값을 바로 조회할 수 있습니다.

```php
$id = DB::table('users')->insertGetId(
    ['email' => 'john@example.com', 'votes' => 0]
);
```

> [!WARNING]
> PostgreSQL을 사용할 때 `insertGetId` 메서드는 자동 증가 컬럼명이 반드시 `id`여야 합니다. 만약 다른 "시퀀스"에서 id를 가져오고 싶다면, `insertGetId`의 두 번째 파라미터로 컬럼 이름을 전달해야 합니다.

<a name="upserts"></a>
### 업서트(Upserts)

`upsert` 메서드는 존재하지 않는 레코드를 삽입하고, 이미 존재하는 레코드는 지정한 값으로 업데이트합니다. 첫 번째 인수는 삽입 또는 갱신할 값들을 나타내며, 두 번째 인수는 테이블 내에서 레코드를 고유하게 식별하는 컬럼(들)을 지정합니다. 세 번째 인수는 해당 레코드가 이미 있는 경우 업데이트해야 할 컬럼 목록입니다.

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

위의 예시에서, Laravel은 두 개의 레코드를 삽입하려고 시도합니다. 만약 동일한 `departure`와 `destination` 값을 가진 레코드가 이미 존재하면, 해당 레코드의 `price` 컬럼만 업데이트됩니다.

> [!WARNING]
> SQL Server를 제외한 모든 데이터베이스는 `upsert` 메서드의 두 번째 인수로 전달된 컬럼에 "primary" 또는 "unique" 인덱스가 존재해야 합니다. 또한 MariaDB와 MySQL의 드라이버는 `upsert` 메서드의 두 번째 인수를 무시하고, 해당 테이블의 "primary" 및 "unique" 인덱스를 이용하여 기존 레코드를 탐지합니다.

<a name="update-statements"></a>
## Update 문

쿼리 빌더는 데이터베이스에 레코드를 삽입하는 것뿐만 아니라, 기존 레코드를 `update` 메서드로 갱신할 수도 있습니다. `update` 메서드 역시 갱신할 컬럼과 값으로 이루어진 배열을 받으며, 처리된 레코드 수를 반환합니다. `where` 조건을 추가해 특정 레코드만 업데이트할 수도 있습니다.

```php
$affected = DB::table('users')
    ->where('id', 1)
    ->update(['votes' => 1]);
```

<a name="update-or-insert"></a>
#### Update 또는 Insert

경우에 따라, 데이터베이스에 기존 레코드가 있으면 업데이트하고, 없으면 새로 생성하고 싶을 수 있습니다. 이런 상황에서는 `updateOrInsert` 메서드를 사용하면 됩니다. 이 메서드는 두 개의 인수를 받는데, 첫 번째는 레코드를 찾을 조건의 배열, 두 번째는 갱신할 컬럼과 값의 배열입니다.

`updateOrInsert`는 첫 번째 인수로 지정한 조건을 만족하는 데이터베이스 레코드를 찾으려고 시도합니다. 레코드가 있으면 두 번째 인수의 값으로 업데이트하고, 찾지 못하면 두 인수의 속성을 합쳐 새로운 레코드를 삽입합니다.

```php
DB::table('users')
    ->updateOrInsert(
        ['email' => 'john@example.com', 'name' => 'John'],
        ['votes' => '2']
    );
```

`updateOrInsert` 메서드에 클로저를 전달하여, 레코드가 존재하는지 여부에 따라 데이터베이스에 삽입 또는 업데이트할 속성을 동적으로 지정할 수도 있습니다.

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

JSON 컬럼을 업데이트할 때는 `'->'` 문법을 사용하여 JSON 객체의 특정 키를 업데이트할 수 있습니다. 이 기능은 MariaDB 10.3+, MySQL 5.7+, PostgreSQL 9.5+에서 지원됩니다.

```php
$affected = DB::table('users')
    ->where('id', 1)
    ->update(['options->enabled' => true]);
```

<a name="increment-and-decrement"></a>
### 증가 및 감소(Increment and Decrement)

쿼리 빌더는 지정한 컬럼의 값을 증가시키거나 감소시키는 편리한 메서드도 제공합니다. 이 두 메서드는 최소한 한 가지 인수(수정할 컬럼명)를 필요로 합니다. 두 번째 인수로 컬럼을 얼마만큼 증가 또는 감소시킬지도 지정할 수 있습니다.

```php
DB::table('users')->increment('votes');

DB::table('users')->increment('votes', 5);

DB::table('users')->decrement('votes');

DB::table('users')->decrement('votes', 5);
```

필요하다면 증가 또는 감소 작업을 하면서 동시에 다른 컬럼도 업데이트할 수 있습니다.

```php
DB::table('users')->increment('votes', 1, ['name' => 'John']);
```

또한 `incrementEach`와 `decrementEach` 메서드를 활용하면 여러 컬럼을 한 번에 증가 또는 감소시킬 수 있습니다.

```php
DB::table('users')->incrementEach([
    'votes' => 5,
    'balance' => 100,
]);
```

<a name="delete-statements"></a>
## Delete 문

쿼리 빌더의 `delete` 메서드를 사용하여 테이블에서 레코드를 삭제할 수 있습니다. `delete` 메서드는 삭제 처리된 레코드 수를 반환합니다. `delete` 실행 이전에 "where" 구문을 추가해 특정 레코드만 삭제할 수도 있습니다.

```php
$deleted = DB::table('users')->delete();

$deleted = DB::table('users')->where('votes', '>', 100)->delete();
```

<a name="pessimistic-locking"></a>
## 비관적 잠금(Pessimistic Locking)

쿼리 빌더에는 `select` 문 실행 시 "비관적 잠금"을 구현할 수 있도록 도와주는 함수도 포함되어 있습니다. "공유 잠금(shared lock)"을 실행하려면 `sharedLock` 메서드를 호출하면 됩니다. 공유 잠금은 트랜잭션이 커밋될 때까지 선택된 행이 수정되지 못하도록 방지합니다.

```php
DB::table('users')
    ->where('votes', '>', 100)
    ->sharedLock()
    ->get();
```

또한, `lockForUpdate` 메서드를 사용할 수도 있습니다. "for update" 잠금은 선택된 레코드가 수정되거나, 다른 공유 잠금(select with shared lock)으로 조회되는 것을 방지합니다.

```php
DB::table('users')
    ->where('votes', '>', 100)
    ->lockForUpdate()
    ->get();
```

필수 사항은 아니지만, 비관적 잠금은 [트랜잭션](/docs/12.x/database#database-transactions) 내부에 래핑하는 것이 좋습니다. 이렇게 하면 데이터 조회 이후 트랜잭션이 완전히 끝날 때까지 데이터가 변경되지 않게 보장할 수 있습니다. 만약 트랜잭션 처리에 실패하면, 변경 사항은 자동으로 롤백되고 잠금 또한 해제됩니다.

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

애플리케이션 전반에서 반복되는 쿼리 로직이 있다면, 쿼리 빌더의 `tap` 및 `pipe` 메서드를 사용하여 해당 로직을 재사용 가능한 객체로 분리할 수 있습니다. 예를 들어, 다음과 같이 두 가지 서로 다른 쿼리가 있다고 가정해 보겠습니다.

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

여기서 공통적으로 쓰이는 destination 필터링 로직을 하나의 재사용 가능한 객체로 추출할 수 있습니다.

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

그런 다음, 쿼리 빌더의 `tap` 메서드를 이용해 해당 객체의 로직을 쿼리에 적용할 수 있습니다.

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
#### 쿼리 파이프(Query Pipes)

`tap` 메서드는 항상 쿼리 빌더 인스턴스를 반환합니다. 만약 쿼리를 실행하고 다른 값을 반환하는 객체로 분리하고 싶다면, `pipe` 메서드를 사용할 수 있습니다.

다음은 애플리케이션에서 공통적으로 사용되는 [페이지네이션](/docs/12.x/pagination) 로직이 담긴 쿼리 객체의 예시입니다. `DestinationFilter`와 달리, `Paginate` 객체는 쿼리 조건을 추가하는 대신 쿼리를 실행하여 페이지네이터 인스턴스를 반환합니다.

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

쿼리 빌더의 `pipe` 메서드를 활용하면, 이 객체를 적용하여 공통 페이지네이션 로직을 재사용할 수 있습니다.

```php
$flights = DB::table('flights')
    ->tap(new DestinationFilter($destination))
    ->pipe(new Paginate);
```

<a name="debugging"></a>
## 디버깅

쿼리를 작성하는 동안 `dd`와 `dump` 메서드를 활용해 현재 쿼리의 바인딩 값과 SQL을 확인할 수 있습니다. `dd` 메서드는 디버그 정보를 표시하고 요청 실행을 중단하며, `dump` 메서드는 디버그 정보를 표시는 하지만 요청 실행을 계속 진행합니다.

```php
DB::table('users')->where('votes', '>', 100)->dd();

DB::table('users')->where('votes', '>', 100)->dump();
```

`dumpRawSql` 및 `ddRawSql` 메서드는 쿼리의 SQL 및 모든 파라미터 바인딩을 실제 값으로 치환하여 출력합니다.

```php
DB::table('users')->where('votes', '>', 100)->dumpRawSql();

DB::table('users')->where('votes', '>', 100)->ddRawSql();
```