# 데이터베이스: 쿼리 빌더 (Database: Query Builder)

- [소개](#introduction)
- [데이터베이스 쿼리 실행](#running-database-queries)
    - [결과를 청크 단위로 가져오기](#chunking-results)
    - [결과를 지연(래지(lazy)) 방식으로 스트리밍하기](#streaming-results-lazily)
    - [집계 함수 사용](#aggregates)
- [SELECT 문](#select-statements)
- [Raw 표현식](#raw-expressions)
- [조인(Join)](#joins)
- [유니온(Union)](#unions)
- [기본 Where 절](#basic-where-clauses)
    - [Where 절](#where-clauses)
    - [Or Where 절](#or-where-clauses)
    - [Where Not 절](#where-not-clauses)
    - [Where Any / All 절](#where-any-all-clauses)
    - [JSON Where 절](#json-where-clauses)
    - [기타 Where 절](#additional-where-clauses)
    - [논리적 그룹화](#logical-grouping)
- [고급 Where 절](#advanced-where-clauses)
    - [Where Exists 절](#where-exists-clauses)
    - [서브쿼리 Where 절](#subquery-where-clauses)
    - [풀텍스트(Full Text) Where 절](#full-text-where-clauses)
- [정렬, 그룹화, Limit 및 Offset](#ordering-grouping-limit-and-offset)
    - [정렬](#ordering)
    - [그룹화](#grouping)
    - [Limit 및 Offset](#limit-and-offset)
- [조건부 절](#conditional-clauses)
- [INSERT 문](#insert-statements)
    - [Upsert](#upserts)
- [UPDATE 문](#update-statements)
    - [JSON 컬럼 업데이트](#updating-json-columns)
    - [증가 및 감소(Incremnet / Decrement)](#increment-and-decrement)
- [DELETE 문](#delete-statements)
- [비관적 잠금(Pessimistic Locking)](#pessimistic-locking)
- [디버깅](#debugging)

<a name="introduction"></a>
## 소개

라라벨의 데이터베이스 쿼리 빌더는 데이터베이스 쿼리를 쉽고 유연하게 생성하고 실행할 수 있는 편리한 인터페이스를 제공합니다. 이를 통해 애플리케이션 내에서 대부분의 데이터베이스 작업을 수행할 수 있으며, 라라벨에서 지원하는 모든 데이터베이스 시스템과 완벽하게 호환됩니다.

라라벨 쿼리 빌더는 PDO 파라미터 바인딩 방식을 사용하여, SQL 인젝션 공격으로부터 애플리케이션을 안전하게 보호합니다. 쿼리 빌더에 전달되는 문자열은 별도로 정리(clean)하거나 정제(sanitize)할 필요가 없습니다.

> [!WARNING]
> PDO는 컬럼명 바인딩을 지원하지 않습니다. 따라서 쿼리에서 참조하는 컬럼명(특히 "order by"에 사용되는 컬럼명 등)에 사용자 입력이 직접 사용되지 않도록 절대 주의해야 합니다.

<a name="running-database-queries"></a>
## 데이터베이스 쿼리 실행

<a name="retrieving-all-rows-from-a-table"></a>
#### 테이블에서 모든 행 가져오기

쿼리의 시작은 `DB` 파사드가 제공하는 `table` 메서드를 사용할 수 있습니다. `table` 메서드는 지정한 테이블에 대한 유연한(fluent) 쿼리 빌더 인스턴스를 반환하며, 여기에 다양한 조건을 메서드 체이닝으로 추가하여 마지막에는 `get` 메서드를 호출해 결과를 조회할 수 있습니다.

```
<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * 애플리케이션의 모든 사용자를 나열합니다.
     */
    public function index(): View
    {
        $users = DB::table('users')->get();

        return view('user.index', ['users' => $users]);
    }
}
```

`get` 메서드는 쿼리 결과를 담은 `Illuminate\Support\Collection` 인스턴스를 반환하며, 각 결과는 PHP의 `stdClass` 객체로 표현됩니다. 각 컬럼의 값은 해당 객체의 속성으로 접근할 수 있습니다.

```
use Illuminate\Support\Facades\DB;

$users = DB::table('users')->get();

foreach ($users as $user) {
    echo $user->name;
}
```

> [!NOTE]
> 라라벨의 컬렉션은 데이터 매핑이나 집계 작업에 매우 강력한 다양한 메서드를 제공합니다. 자세한 내용은 [컬렉션 문서](/docs/10.x/collections)를 참고해 주세요.

<a name="retrieving-a-single-row-column-from-a-table"></a>
#### 테이블에서 단일 행 또는 컬럼 값 가져오기

데이터베이스 테이블에서 한 행만 조회하고 싶다면, `DB` 파사드의 `first` 메서드를 사용할 수 있습니다. 이 메서드는 단일 `stdClass` 객체를 반환합니다.

```
$user = DB::table('users')->where('name', 'John')->first();

return $user->email;
```

전체 행이 아니라 컬럼의 값 하나만 필요하다면, `value` 메서드로 원하는 값을 바로 추출할 수 있습니다. 이 메서드는 해당 컬럼의 값을 직접 반환합니다.

```
$email = DB::table('users')->where('name', 'John')->value('email');
```

특정 행을 `id` 컬럼 값으로 조회하려면, `find` 메서드를 사용합니다.

```
$user = DB::table('users')->find(3);
```

<a name="retrieving-a-list-of-column-values"></a>
#### 컬럼 값 목록 가져오기

특정 컬럼 값만을 담은 `Illuminate\Support\Collection` 인스턴스를 얻고 싶다면, `pluck` 메서드를 사용할 수 있습니다. 예를 들어 사용자들의 타이틀만 컬렉션으로 가져올 경우 아래와 같이 사용합니다.

```
use Illuminate\Support\Facades\DB;

$titles = DB::table('users')->pluck('title');

foreach ($titles as $title) {
    echo $title;
}
```

또한 `pluck` 메서드에 두 번째 인자를 전달하면, 결과 컬렉션의 키로 사용할 컬럼을 지정할 수도 있습니다.

```
$titles = DB::table('users')->pluck('title', 'name');

foreach ($titles as $name => $title) {
    echo $title;
}
```

<a name="chunking-results"></a>
### 결과를 청크 단위로 가져오기

수천 건이 넘는 대용량 레코드를 다루어야 한다면, `DB` 파사드가 제공하는 `chunk` 메서드 사용을 고려해보세요. 이 메서드는 매번 적은 수의 결과만 가져와서, 각 청크를 콜백에 전달하며 반복 처리하게 해줍니다. 예를 들어 아래는 `users` 테이블을 한 번에 100건씩 청크 단위로 조회하는 예시입니다.

```
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

DB::table('users')->orderBy('id')->chunk(100, function (Collection $users) {
    foreach ($users as $user) {
        // ...
    }
});
```

콜백에서 `false`를 반환하면, 이후 청크 처리가 중단됩니다.

```
DB::table('users')->orderBy('id')->chunk(100, function (Collection $users) {
    // 레코드 처리...

    return false;
});
```

청크로 결과를 처리하면서 레코드를 갱신(업데이트)하는 경우, 갱신으로 인해 청크 결과가 예기치 않게 달라질 수 있습니다. 만약 청크 처리 도중에 레코드를 갱신할 계획이라면, `chunkById` 메서드를 사용하는 것이 가장 안전합니다. 이 메서드는 기본키를 기준으로 자동으로 페이지네이션하여 결과를 나눕니다.

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

> [!NOTE]
> 청크 콜백 내부에서 레코드를 업데이트하거나 삭제할 때, 기본키나 외래키 값이 변경되면 청크 쿼리에 영향을 줄 수 있습니다. 그 결과, 일부 레코드가 결과에서 누락될 수 있습니다.

<a name="streaming-results-lazily"></a>
### 결과를 지연(래지) 방식으로 스트리밍하기

`lazy` 메서드는 [위에서 설명한 `chunk` 메서드](#chunking-results)와 비슷하게 쿼리를 청크 단위로 실행합니다. 하지만, 각 청크를 콜백에 넘기는 대신 `lazy()` 메서드는 하나의 [`LazyCollection`](/docs/10.x/collections#lazy-collections)으로 결과를 반환하여, 연속된 데이터 스트림 형태로 처리할 수 있게 해줍니다.

```php
use Illuminate\Support\Facades\DB;

DB::table('users')->orderBy('id')->lazy()->each(function (object $user) {
    // ...
});
```

이번에도, 레코드를 순회하면서 동시에 갱신할 계획이 있다면, `lazyById` 또는 `lazyByIdDesc` 메서드를 사용해야 가장 안전합니다. 이 메서드들 역시 기본키를 기준으로 결과를 자동 페이지네이션합니다.

```php
DB::table('users')->where('active', false)
    ->lazyById()->each(function (object $user) {
        DB::table('users')
            ->where('id', $user->id)
            ->update(['active' => true]);
    });
```

> [!NOTE]
> 지연 컬렉션을 순회하면서 레코드를 업데이트하거나 삭제하면, 기본키나 외래키 값의 변경으로 인해 청크 쿼리가 달라질 수 있습니다. 그에 따라, 일부 레코드가 결과에서 누락될 수 있습니다.

<a name="aggregates"></a>
### 집계 함수 사용

쿼리 빌더는 `count`, `max`, `min`, `avg`, `sum` 등 다양한 집계(aggregate) 메서드도 제공합니다. 쿼리를 만든 후 이러한 메서드를 호출하면 해당 집계 결과를 바로 조회할 수 있습니다.

```
use Illuminate\Support\Facades\DB;

$users = DB::table('users')->count();

$price = DB::table('orders')->max('price');
```

물론 이러한 메서드들은 다른 조건문과 함께 조합하여 원하는 집계 범위를 세밀하게 조정할 수도 있습니다.

```
$price = DB::table('orders')
                ->where('finalized', 1)
                ->avg('price');
```

<a name="determining-if-records-exist"></a>
#### 레코드 존재 여부 판단하기

쿼리에 일치하는 레코드가 하나라도 있는지 확인할 때는, 굳이 `count` 메서드를 사용하지 않고 `exists` 또는 `doesntExist` 메서드를 사용할 수 있습니다.

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

데이터베이스 테이블의 모든 컬럼을 반드시 선택할 필요는 없습니다. `select` 메서드를 사용해 쿼리에 원하는 컬럼만 선택하는 SELECT 절을 지정할 수 있습니다.

```
use Illuminate\Support\Facades\DB;

$users = DB::table('users')
            ->select('name', 'email as user_email')
            ->get();
```

`distinct` 메서드는 쿼리가 중복을 제거한 결과만 반환하도록 강제합니다.

```
$users = DB::table('users')->distinct()->get();
```

이미 쿼리 빌더 인스턴스가 있고, 이후에 컬럼을 추가로 SELECT 절에 포함하고 싶다면 `addSelect` 메서드를 사용할 수 있습니다.

```
$query = DB::table('users')->select('name');

$users = $query->addSelect('age')->get();
```

<a name="raw-expressions"></a>
## Raw 표현식

경우에 따라 쿼리에 임의의 문자열을 삽입해야 할 때가 있습니다. 이럴 때는 `DB` 파사드가 제공하는 `raw` 메서드를 사용해 raw 문자열 표현식을 만들 수 있습니다.

```
$users = DB::table('users')
             ->select(DB::raw('count(*) as user_count, status'))
             ->where('status', '<>', 1)
             ->groupBy('status')
             ->get();
```

> [!NOTE]
> Raw 구문은 문자열로 쿼리에 직접 삽입되므로, 반드시 SQL 인젝션 취약점이 발생하지 않도록 세심한 주의를 기울여야 합니다.

<a name="raw-methods"></a>
### Raw 메서드

`DB::raw` 메서드를 사용하는 대신, 쿼리의 다양한 부분에 raw 표현식을 삽입할 수 있는 다음과 같은 메서드들을 활용할 수도 있습니다. **참고: 라라벨은 raw 표현식을 사용하는 쿼리에 대해서는 SQL 인젝션 방어를 보장하지 않습니다.**

<a name="selectraw"></a>
#### `selectRaw`

`selectRaw` 메서드는 `addSelect(DB::raw(/* ... */))` 대신 사용할 수 있습니다. 이 메서드는 두 번째 인자로 바인딩 배열도 선택적으로 받을 수 있습니다.

```
$orders = DB::table('orders')
                ->selectRaw('price * ? as price_with_tax', [1.0825])
                ->get();
```

<a name="whereraw-orwhereraw"></a>
#### `whereRaw / orWhereRaw`

`whereRaw`와 `orWhereRaw`는 쿼리에 raw "where" 절을 삽입하는 데 사용할 수 있습니다. 이 메서드들 역시 두 번째 인자로 바인딩 배열을 전달할 수 있습니다.

```
$orders = DB::table('orders')
                ->whereRaw('price > IF(state = "TX", ?, 100)', [200])
                ->get();
```

<a name="havingraw-orhavingraw"></a>
#### `havingRaw / orHavingRaw`

`havingRaw`와 `orHavingRaw` 메서드는 "having" 절에 raw 문자열을 사용할 수 있도록 해줍니다. 두 번째 인자로 바인딩 배열을 선택적으로 전달할 수 있습니다.

```
$orders = DB::table('orders')
                ->select('department', DB::raw('SUM(price) as total_sales'))
                ->groupBy('department')
                ->havingRaw('SUM(price) > ?', [2500])
                ->get();
```

<a name="orderbyraw"></a>
#### `orderByRaw`

`orderByRaw` 메서드는 "order by" 절에 raw 문자열을 사용할 수 있습니다.

```
$orders = DB::table('orders')
                ->orderByRaw('updated_at - created_at DESC')
                ->get();
```

<a name="groupbyraw"></a>
### `groupByRaw`

`groupByRaw` 메서드는 `group by` 절에 raw 문자열을 사용할 수 있도록 해줍니다.

```
$orders = DB::table('orders')
                ->select('city', 'state')
                ->groupByRaw('city, state')
                ->get();
```

<a name="joins"></a>
## 조인(Join)

<a name="inner-join-clause"></a>
#### Inner Join 절

쿼리 빌더에서는 쿼리에 조인 절을 추가할 수도 있습니다. 가장 기본적인 "inner join"은, 쿼리 빌더 인스턴스에서 `join` 메서드를 사용해 수행할 수 있습니다. 첫 번째 인자는 조인할 테이블명, 나머지 인자들은 조인의 컬럼 조건을 지정합니다. 한 번에 여러 테이블을 조인하는 것도 가능합니다.

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

"inner join" 대신 "left join"이나 "right join"을 하고 싶다면, 각각 `leftJoin`, `rightJoin` 메서드를 사용하세요. 이들 메서드는 `join` 메서드와 사용 방식이 동일합니다.

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

"cross join"을 수행하려면, `crossJoin` 메서드를 사용할 수 있습니다. Cross join은 두 테이블 간의 데카르트 곱(모든 조합)을 생성합니다.

```
$sizes = DB::table('sizes')
            ->crossJoin('colors')
            ->get();
```

<a name="advanced-join-clauses"></a>
#### 고급 Join 절

더 복잡한 조인 조건을 지정해야 할 경우, 두 번째 인자로 클로저(Closure)를 `join` 메서드에 전달할 수 있습니다. 이 클로저에는 `Illuminate\Database\Query\JoinClause` 인스턴스가 전달되며, 이 객체를 통해 조인 조건을 더욱 세밀하게 정의할 수 있습니다.

```
DB::table('users')
        ->join('contacts', function (JoinClause $join) {
            $join->on('users.id', '=', 'contacts.user_id')->orOn(/* ... */);
        })
        ->get();
```

조인에 "where" 절을 추가하고 싶은 경우, `JoinClause` 인스턴스가 제공하는 `where` 및 `orWhere` 메서드를 사용할 수 있습니다. 이때는 두 컬럼을 비교하는 대신, 컬럼과 값을 비교합니다.

```
DB::table('users')
        ->join('contacts', function (JoinClause $join) {
            $join->on('users.id', '=', 'contacts.user_id')
                 ->where('contacts.user_id', '>', 5);
        })
        ->get();
```

<a name="subquery-joins"></a>
#### 서브쿼리 조인(Subquery Join)

`joinSub`, `leftJoinSub`, `rightJoinSub` 메서드를 사용하면 서브쿼리를 조인 대상으로 사용할 수 있습니다. 각 메서드는 세 가지 인자를 받습니다: 서브쿼리, 테이블 별칭, 그리고 관련 컬럼을 정의하는 클로저입니다. 예로, 각 사용자의 가장 최근 게시글의 `created_at` 정보를 함께 포함하는 사용자 목록을 조회할 수 있습니다.

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
#### Lateral Join

> [!NOTE]
> Lateral join은 현재 PostgreSQL, MySQL >= 8.0.14, SQL Server에서만 지원됩니다.

`joinLateral`과 `leftJoinLateral` 메서드를 사용하면, 서브쿼리와 함께 "lateral join"을 수행할 수 있습니다. 각 메서드는 두 개의 인자를 받으며, 하나는 서브쿼리, 다른 하나는 서브쿼리의 테이블 별칭입니다. 조인 조건은 서브쿼리 내부의 `where` 절에서 지정해야 합니다. Lateral join은 각 행마다 평가되며, 서브쿼리 외부의 컬럼도 참조할 수 있습니다.

예를 들어 사용자의 최근 세 개 블로그 게시물을 함께 조회하고 싶다면, 아래와 같이 구현할 수 있습니다. 각 사용자는 가장 최근 게시글 최대 3건까지 별도의 행으로 나열됩니다. 조인 조건은 서브쿼리의 `whereColumn`을 통해 현재 사용자의 행을 참조해 지정합니다.

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
## 유니온(Union)

쿼리 빌더는 여러 쿼리를 "유니온"하여 하나로 합치는 간편한 방법도 제공합니다. 예를 들어, 최초의 쿼리를 만든 후 `union` 메서드로 다른 쿼리들과 결합할 수 있습니다.

```
use Illuminate\Support\Facades\DB;

$first = DB::table('users')
            ->whereNull('first_name');

$users = DB::table('users')
            ->whereNull('last_name')
            ->union($first)
            ->get();
```

`union` 외에도, `unionAll` 메서드를 사용할 수 있습니다. `unionAll`로 결합된 쿼리는 중복 결과가 제거되지 않습니다. `unionAll` 메서드의 사용법은 `union`과 동일합니다.

<a name="basic-where-clauses"></a>
## 기본 Where 절

<a name="where-clauses"></a>
### Where 절

쿼리 빌더의 `where` 메서드를 사용해 쿼리에 "where" 조건을 추가할 수 있습니다. `where`의 가장 기본적인 사용법은 세 인자를 필요로 합니다. 첫 번째 인자는 컬럼명, 두 번째는 데이터베이스에서 지원하는 비교 연산자, 세 번째 인자는 컬럼과 비교할 값입니다.

예를 들어, 다음 쿼리는 `votes` 컬럼 값이 `100`과 같고, `age` 컬럼 값은 `35`보다 큰 사용자만 조회합니다.

```
$users = DB::table('users')
                ->where('votes', '=', 100)
                ->where('age', '>', 35)
                ->get();
```

만일 어떤 컬럼이 특정 값과 같은지(=) 확인하고 싶을 때는, 두 번째 인자에 값을 바로 넣으면 라라벨이 자동으로 `=` 연산자를 사용합니다.

```
$users = DB::table('users')->where('votes', 100)->get();
```

앞서 언급한 것처럼, 데이터베이스가 지원하는 모든 연산자를 사용할 수 있습니다.

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

또한 조건 배열을 `where` 함수에 전달할 수도 있습니다. 이 배열의 각 요소는, 보통 `where` 메서드의 세 인자로 전달하는 구조(컬럼명, 연산자, 값)를 각각 담아야 합니다.

```
$users = DB::table('users')->where([
    ['status', '=', '1'],
    ['subscribed', '<>', '1'],
])->get();
```

> [!NOTE]
> PDO는 컬럼명 바인딩을 지원하지 않습니다. 쿼리에서 참조하는 컬럼명, 특히 "order by" 컬럼에 사용자가 입력한 값이 직접 사용되면 안 됩니다.

<a name="or-where-clauses"></a>
### Or Where 절

여러 번 `where` 메서드를 체이닝할 때, 기본적으로 각 조건은 `and` 연산자로 결합됩니다. 하지만 `orWhere` 메서드를 사용하면 조건을 `or` 연산자로 결합할 수 있습니다. `orWhere`의 인자 역시 `where` 메서드와 동일하게 전달하면 됩니다.

```
$users = DB::table('users')
                    ->where('votes', '>', 100)
                    ->orWhere('name', 'John')
                    ->get();
```

만약 괄호로 묶인(or 그룹핑된) 조건을 만들고 싶다면, `orWhere`의 첫 번째 인자로 클로저를 전달할 수 있습니다.

```
$users = DB::table('users')
            ->where('votes', '>', 100)
            ->orWhere(function (Builder $query) {
                $query->where('name', 'Abigail')
                      ->where('votes', '>', 50);
            })
            ->get();
```

위의 예시는 아래와 같은 SQL을 생성합니다.

```sql
select * from users where votes > 100 or (name = 'Abigail' and votes > 50)
```

> [!NOTE]
> 전역 스코프가 적용될 때 예기치 않은 결과를 방지하려면 `orWhere` 호출은 항상 괄호로 그룹핑하는 것이 좋습니다.

<a name="where-not-clauses"></a>

### whereNot 절

`whereNot` 및 `orWhereNot` 메서드를 사용하면 지정한 쿼리 제약 조건 그룹을 반전시킬 수 있습니다. 예를 들어, 아래 쿼리는 할인 상품이거나 가격이 10 미만인 제품을 제외합니다.

```
$products = DB::table('products')
                ->whereNot(function (Builder $query) {
                    $query->where('clearance', true)
                          ->orWhere('price', '<', 10);
                })
                ->get();
```

<a name="where-any-all-clauses"></a>
### whereAny / whereAll 절

특정한 쿼리 조건을 여러 컬럼에 적용해야 할 때가 있습니다. 예를 들어, 주어진 컬럼 목록 중 하나라도 특정 값과 `LIKE` 비교를 만족하는 모든 레코드를 조회하고 싶을 수 있습니다. 이럴 때는 `whereAny` 메서드를 사용할 수 있습니다.

```
$users = DB::table('users')
            ->where('active', true)
            ->whereAny([
                'name',
                'email',
                'phone',
            ], 'LIKE', 'Example%')
            ->get();
```

위의 쿼리는 아래와 같은 SQL을 생성합니다.

```sql
SELECT *
FROM users
WHERE active = true AND (
    name LIKE 'Example%' OR
    email LIKE 'Example%' OR
    phone LIKE 'Example%'
)
```

마찬가지로, `whereAll` 메서드를 사용하면 전달한 모든 컬럼이 지정된 조건과 모두 일치하는 레코드를 조회할 수 있습니다.

```
$posts = DB::table('posts')
            ->where('published', true)
            ->whereAll([
                'title',
                'content',
            ], 'LIKE', '%Laravel%')
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

<a name="json-where-clauses"></a>
### JSON where 절

라라벨은 JSON 컬럼 타입을 지원하는 데이터베이스(MySQL 5.7+, PostgreSQL, SQL Server 2016, SQLite 3.39.0([JSON1 확장](https://www.sqlite.org/json1.html) 필요))에서 JSON 컬럼을 조회할 수 있습니다. JSON 컬럼을 조회하려면 `->` 연산자를 사용하세요.

```
$users = DB::table('users')
                ->where('preferences->dining->meal', 'salad')
                ->get();
```

`whereJsonContains`를 사용하면 JSON 배열을 조회할 수 있습니다.

```
$users = DB::table('users')
                ->whereJsonContains('options->languages', 'en')
                ->get();
```

애플리케이션에서 MySQL 또는 PostgreSQL을 사용한다면, `whereJsonContains` 메서드에 값의 배열을 전달할 수도 있습니다.

```
$users = DB::table('users')
                ->whereJsonContains('options->languages', ['en', 'de'])
                ->get();
```

JSON 배열의 길이로 조회하려면 `whereJsonLength` 메서드를 사용할 수 있습니다.

```
$users = DB::table('users')
                ->whereJsonLength('options->languages', 0)
                ->get();

$users = DB::table('users')
                ->whereJsonLength('options->languages', '>', 1)
                ->get();
```

<a name="additional-where-clauses"></a>
### 추가 where 절

**whereBetween / orWhereBetween**

`whereBetween` 메서드는 컬럼의 값이 두 값 사이에 있는지 확인합니다.

```
$users = DB::table('users')
           ->whereBetween('votes', [1, 100])
           ->get();
```

**whereNotBetween / orWhereNotBetween**

`whereNotBetween` 메서드는 컬럼의 값이 지정한 두 값의 범위 밖에 있는지 확인합니다.

```
$users = DB::table('users')
                    ->whereNotBetween('votes', [1, 100])
                    ->get();
```

**whereBetweenColumns / whereNotBetweenColumns / orWhereBetweenColumns / orWhereNotBetweenColumns**

`whereBetweenColumns` 메서드는 컬럼의 값이 해당 행에서 두 컬럼 값 사이에 있는지 확인합니다.

```
$patients = DB::table('patients')
                       ->whereBetweenColumns('weight', ['minimum_allowed_weight', 'maximum_allowed_weight'])
                       ->get();
```

`whereNotBetweenColumns` 메서드는 컬럼의 값이 해당 행에서 두 컬럼 값 범위 밖에 있는지 확인합니다.

```
$patients = DB::table('patients')
                       ->whereNotBetweenColumns('weight', ['minimum_allowed_weight', 'maximum_allowed_weight'])
                       ->get();
```

**whereIn / whereNotIn / orWhereIn / orWhereNotIn**

`whereIn` 메서드는 지정한 컬럼 값이 주어진 배열 안에 포함되는지 확인합니다.

```
$users = DB::table('users')
                    ->whereIn('id', [1, 2, 3])
                    ->get();
```

`whereNotIn` 메서드는 지정한 컬럼 값이 주어진 배열에 포함되지 않는지 확인합니다.

```
$users = DB::table('users')
                    ->whereNotIn('id', [1, 2, 3])
                    ->get();
```

`whereIn` 메서드의 두 번째 인자로 쿼리 객체를 전달할 수도 있습니다.

```
$activeUsers = DB::table('users')->select('id')->where('is_active', 1);

$users = DB::table('comments')
                    ->whereIn('user_id', $activeUsers)
                    ->get();
```

위 예제는 다음과 같은 SQL을 생성합니다.

```sql
select * from comments where user_id in (
    select id
    from users
    where is_active = 1
)
```

> [!NOTE]
> 쿼리에 매우 많은 정수 배열을 바인딩할 경우, `whereIntegerInRaw` 또는 `whereIntegerNotInRaw` 메서드를 사용해 메모리 사용량을 크게 줄일 수 있습니다.

**whereNull / whereNotNull / orWhereNull / orWhereNotNull**

`whereNull` 메서드는 지정한 컬럼의 값이 `NULL` 인지 확인합니다.

```
$users = DB::table('users')
                ->whereNull('updated_at')
                ->get();
```

`whereNotNull` 메서드는 컬럼의 값이 `NULL` 이 아닌지 확인합니다.

```
$users = DB::table('users')
                ->whereNotNull('updated_at')
                ->get();
```

**whereDate / whereMonth / whereDay / whereYear / whereTime**

`whereDate` 메서드는 컬럼의 값을 특정 날짜와 비교할 때 사용할 수 있습니다.

```
$users = DB::table('users')
                ->whereDate('created_at', '2016-12-31')
                ->get();
```

`whereMonth` 메서드는 컬럼의 값을 특정 월과 비교할 때 사용할 수 있습니다.

```
$users = DB::table('users')
                ->whereMonth('created_at', '12')
                ->get();
```

`whereDay` 메서드는 컬럼의 값을 특정 일과 비교할 때 사용할 수 있습니다.

```
$users = DB::table('users')
                ->whereDay('created_at', '31')
                ->get();
```

`whereYear` 메서드는 컬럼의 값을 특정 연도와 비교할 때 사용할 수 있습니다.

```
$users = DB::table('users')
                ->whereYear('created_at', '2016')
                ->get();
```

`whereTime` 메서드는 컬럼의 값을 특정 시간과 비교할 때 사용할 수 있습니다.

```
$users = DB::table('users')
                ->whereTime('created_at', '=', '11:20:45')
                ->get();
```

**whereColumn / orWhereColumn**

`whereColumn` 메서드는 두 컬럼의 값이 같은지 확인할 수 있습니다.

```
$users = DB::table('users')
                ->whereColumn('first_name', 'last_name')
                ->get();
```

비교 연산자를 함께 전달할 수도 있습니다.

```
$users = DB::table('users')
                ->whereColumn('updated_at', '>', 'created_at')
                ->get();
```

컬럼 비교의 배열을 `whereColumn`에 전달할 수도 있습니다. 이 조건들은 `and` 연산자로 연결됩니다.

```
$users = DB::table('users')
                ->whereColumn([
                    ['first_name', '=', 'last_name'],
                    ['updated_at', '>', 'created_at'],
                ])->get();
```

<a name="logical-grouping"></a>
### 논리 그룹화

쿼리에서 여러 개의 "where" 절을 괄호로 묶어 논리적으로 그룹핑해야 하는 경우가 있습니다. 특히, `orWhere` 메서드를 사용할 때는 항상 괄호로 묶는 것이 예기치 않은 쿼리 동작을 방지하는 데 좋습니다. 이를 위해 `where` 메서드에 클로저를 전달하면 됩니다.

```
$users = DB::table('users')
           ->where('name', '=', 'John')
           ->where(function (Builder $query) {
               $query->where('votes', '>', 100)
                     ->orWhere('title', '=', 'Admin');
           })
           ->get();
```

위처럼 `where` 메서드에 클로저를 전달하면 쿼리 빌더가 제약 조건 그룹을 시작하게 됩니다. 클로저는 쿼리 빌더 인스턴스를 받아, 괄호 그룹 안에 들어가야 할 조건들을 추가할 수 있습니다. 위 예제는 아래와 같은 SQL을 생성합니다.

```sql
select * from users where name = 'John' and (votes > 100 or title = 'Admin')
```

> [!NOTE]
> 전역 스코프가 적용될 때 예기치 않은 동작을 방지하려면 항상 `orWhere` 호출을 그룹핑해야 합니다.

<a name="advanced-where-clauses"></a>
### 고급 where 절

<a name="where-exists-clauses"></a>
### whereExists 절

`whereExists` 메서드를 사용하면 "where exists" SQL 절을 작성할 수 있습니다. 이 메서드는 클로저를 받아, 클로저 안에서 "exists" 절에 들어갈 쿼리를 정의할 수 있습니다.

```
$users = DB::table('users')
           ->whereExists(function (Builder $query) {
               $query->select(DB::raw(1))
                     ->from('orders')
                     ->whereColumn('orders.user_id', 'users.id');
           })
           ->get();
```

또는, 클로저 대신 쿼리 객체를 `whereExists` 메서드에 직접 전달할 수도 있습니다.

```
$orders = DB::table('orders')
                ->select(DB::raw(1))
                ->whereColumn('orders.user_id', 'users.id');

$users = DB::table('users')
                    ->whereExists($orders)
                    ->get();
```

위 두 예제는 다음과 같은 SQL을 생성합니다.

```sql
select * from users
where exists (
    select 1
    from orders
    where orders.user_id = users.id
)
```

<a name="subquery-where-clauses"></a>
### 서브쿼리 where 절

때로는 "where" 절에서 서브쿼리의 결과를 주어진 값과 비교해야 할 수 있습니다. 이럴 때는 클로저와 값을 `where` 메서드에 전달하면 됩니다. 예를 들어, 아래 쿼리는 최근 "membership"이 특정 타입인 사용자를 모두 조회합니다.

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

또는, 컬럼을 서브쿼리의 결과와 비교하는 "where" 절이 필요할 수도 있습니다. 이럴 때는 컬럼, 연산자, 클로저를 차례로 `where` 메서드에 전달하면 됩니다. 아래 예제는 금액이 평균보다 적은 모든 수입 레코드를 조회합니다.

```
use App\Models\Income;
use Illuminate\Database\Query\Builder;

$incomes = Income::where('amount', '<', function (Builder $query) {
    $query->selectRaw('avg(i.amount)')->from('incomes as i');
})->get();
```

<a name="full-text-where-clauses"></a>
### 전체 텍스트 where 절

> [!NOTE]
> 전체 텍스트 where 절은 현재 MySQL과 PostgreSQL에서 지원됩니다.

`whereFullText` 및 `orWhereFullText` 메서드를 사용하면 [전체 텍스트 인덱스](/docs/10.x/migrations#available-index-types)가 설정된 컬럼에 대해 전체 텍스트 기반의 "where" 절을 쿼리에 추가할 수 있습니다. 이 메서드는 라라벨이 사용 중인 데이터베이스 시스템에 맞게 적절한 SQL로 변환해줍니다. 예를 들어, MySQL에서는 `MATCH AGAINST` 절로 변환됩니다.

```
$users = DB::table('users')
           ->whereFullText('bio', 'web developer')
           ->get();
```

<a name="ordering-grouping-limit-and-offset"></a>
## 정렬, 그룹화, 제한 및 오프셋

<a name="ordering"></a>
### 정렬

<a name="orderby"></a>
#### orderBy 메서드

`orderBy` 메서드는 쿼리 결과를 지정한 컬럼으로 정렬할 수 있습니다. 첫 번째 인자는 정렬에 사용할 컬럼명, 두 번째 인자는 정렬 방향(`asc` 또는 `desc`)입니다.

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
#### latest 및 oldest 메서드

`latest`와 `oldest` 메서드를 사용하면 날짜 기준으로 손쉽게 결과를 정렬할 수 있습니다. 기본적으로 테이블의 `created_at` 컬럼을 기준으로 정렬합니다. 또는 정렬 기준이 될 컬럼명을 직접 전달할 수도 있습니다.

```
$user = DB::table('users')
                ->latest()
                ->first();
```

<a name="random-ordering"></a>
#### 랜덤 정렬

`inRandomOrder` 메서드를 사용하면 쿼리 결과를 무작위로 정렬할 수 있습니다. 예를 들어, 무작위 사용자 한 명을 가져오려면 다음과 같이 작성할 수 있습니다.

```
$randomUser = DB::table('users')
                ->inRandomOrder()
                ->first();
```

<a name="removing-existing-orderings"></a>
#### 기존 정렬 조건 제거

`reorder` 메서드는 이전에 적용된 모든 "order by" 절을 제거합니다.

```
$query = DB::table('users')->orderBy('name');

$unorderedUsers = $query->reorder()->get();
```

`reorder` 호출 시 컬럼명과 방향을 전달하면 기존 모든 "order by" 절이 제거되고 새롭게 정렬 조건이 적용됩니다.

```
$query = DB::table('users')->orderBy('name');

$usersOrderedByEmail = $query->reorder('email', 'desc')->get();
```

<a name="grouping"></a>
### 그룹화

<a name="groupby-having"></a>
#### groupBy 및 having 메서드

예상하신 대로, `groupBy`와 `having` 메서드를 사용해 쿼리 결과를 그룹화할 수 있습니다. `having` 메서드의 사용법은 `where` 메서드와 유사합니다.

```
$users = DB::table('users')
                ->groupBy('account_id')
                ->having('account_id', '>', 100)
                ->get();
```

`havingBetween` 메서드를 사용하면 결과를 특정 범위로 필터링할 수 있습니다.

```
$report = DB::table('orders')
                ->selectRaw('count(id) as number_of_orders, customer_id')
                ->groupBy('customer_id')
                ->havingBetween('number_of_orders', [5, 15])
                ->get();
```

`groupBy`에 여러 인자를 전달해서 여러 컬럼으로 그룹화할 수도 있습니다.

```
$users = DB::table('users')
                ->groupBy('first_name', 'status')
                ->having('account_id', '>', 100)
                ->get();
```

더 고급 `having` 문을 작성하려면 [`havingRaw`](#raw-methods) 메서드를 참고하세요.

<a name="limit-and-offset"></a>
### Limit 및 Offset

<a name="skip-take"></a>
#### skip 및 take 메서드

`skip` 및 `take` 메서드를 사용하면 쿼리에서 반환되는 결과 개수를 제한하거나, 일정 개수만큼 결과를 건너뛸 수 있습니다.

```
$users = DB::table('users')->skip(10)->take(5)->get();
```

또는, `limit`과 `offset` 메서드를 사용할 수도 있습니다. 두 메서드는 각각 `take`와 `skip` 메서드와 기능적으로 동일합니다.

```
$users = DB::table('users')
                ->offset(10)
                ->limit(5)
                ->get();
```

<a name="conditional-clauses"></a>
## 조건부 절

때로는 쿼리의 일부 절을 다른 조건에 따라 적용하고 싶을 때가 있습니다. 예를 들어, 들어오는 HTTP 요청에 입력값이 있을 때만 `where` 조건을 추가하고 싶을 수 있습니다. 이럴 때는 `when` 메서드를 사용할 수 있습니다.

```
$role = $request->string('role');

$users = DB::table('users')
                ->when($role, function (Builder $query, string $role) {
                    $query->where('role_id', $role);
                })
                ->get();
```

`when` 메서드는 첫 번째 인자가 `true`일 때만 주어진 클로저를 실행합니다. 첫 번째 인자가 `false`일 경우, 클로저는 실행되지 않습니다. 위의 예시에서 `when` 메서드에 전달된 클로저는, 요청에서 `role` 필드가 존재하고 `true`로 평가될 때만 실행됩니다.

`when` 메서드의 세 번째 인자로 또 다른 클로저를 전달할 수 있습니다. 이 클로저는 첫 번째 인자가 `false`일 때만 실행됩니다. 아래 예시는 이 기능을 이용해 쿼리의 기본 정렬 방식을 동적으로 지정하는 방법을 보여줍니다.

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
## Insert 문

쿼리 빌더는 레코드를 데이터베이스 테이블에 삽입할 수 있는 `insert` 메서드도 제공합니다. `insert` 메서드는 컬럼명과 값의 배열을 인수로 받습니다.

```
DB::table('users')->insert([
    'email' => 'kayla@example.com',
    'votes' => 0
]);
```

여러 레코드를 한 번에 삽입하고 싶을 때는 배열 안에 여러 배열(각각이 하나의 레코드에 해당)을 전달하세요.

```
DB::table('users')->insert([
    ['email' => 'picard@example.com', 'votes' => 0],
    ['email' => 'janeway@example.com', 'votes' => 0],
]);
```

`insertOrIgnore` 메서드는 레코드를 삽입할 때 발생하는 오류를 무시합니다. 이 메서드를 사용할 때는, 중복 레코드로 인한 오류 외에도 데이터베이스 엔진에 따라 다른 종류의 오류도 무시될 수 있음을 유념해야 합니다. 예를 들어, `insertOrIgnore`는 [MySQL의 strict 모드](https://dev.mysql.com/doc/refman/en/sql-mode.html#ignore-effect-on-execution)를 우회합니다.

```
DB::table('users')->insertOrIgnore([
    ['id' => 1, 'email' => 'sisko@example.com'],
    ['id' => 2, 'email' => 'archer@example.com'],
]);
```

`insertUsing` 메서드는 서브쿼리를 사용해 삽입할 데이터를 지정하면서 새로운 레코드를 테이블에 삽입할 수 있습니다.

```
DB::table('pruned_users')->insertUsing([
    'id', 'name', 'email', 'email_verified_at'
], DB::table('users')->select(
    'id', 'name', 'email', 'email_verified_at'
)->where('updated_at', '<=', now()->subMonth()));
```

<a name="auto-incrementing-ids"></a>

#### 자동 증가 ID

테이블에 자동 증가 id가 있는 경우, `insertGetId` 메서드를 사용하여 레코드를 삽입하고 삽입된 ID 값을 바로 가져올 수 있습니다.

```
$id = DB::table('users')->insertGetId(
    ['email' => 'john@example.com', 'votes' => 0]
);
```

> [!WARNING]
> PostgreSQL을 사용하는 경우 `insertGetId` 메서드는 자동 증가 컬럼의 이름이 반드시 `id`여야 합니다. 만약 다른 "시퀀스"에서 ID를 가져오고 싶다면, `insertGetId` 메서드의 두 번째 인수로 컬럼명을 전달할 수 있습니다.

<a name="upserts"></a>
### 업서트(Upserts)

`upsert` 메서드는 존재하지 않는 레코드는 삽입하고, 이미 존재하는 레코드는 여러분이 지정한 새로운 값으로 업데이트합니다. 이 메서드의 첫 번째 인수는 삽입하거나 업데이트할 값들의 배열입니다. 두 번째 인수는 테이블 내에서 레코드를 고유하게 식별할 컬럼들을 지정합니다. 마지막 세 번째 인수는 일치하는 레코드가 이미 데이터베이스에 있을 경우 업데이트할 컬럼 배열입니다.

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

위 예시에서, 라라벨은 두 개의 레코드를 삽입하려 시도합니다. 만약 `departure`와 `destination` 컬럼 값이 동일한 레코드가 이미 존재한다면, 해당 레코드의 `price` 컬럼이 업데이트됩니다.

> [!WARNING]
> SQL Server를 제외한 모든 데이터베이스는 `upsert` 메서드의 두 번째 인수로 지정된 컬럼에 "primary" 또는 "unique" 인덱스가 설정되어 있어야 합니다. 또한, MySQL 데이터베이스 드라이버는 `upsert` 메서드의 두 번째 인수를 무시하며, 항상 테이블의 "primary"와 "unique" 인덱스를 기반으로 기존 레코드 존재 여부를 확인합니다.

<a name="update-statements"></a>
## 업데이트(UPDATE) 문

쿼리 빌더는 레코드를 삽입하는 것 외에도, `update` 메서드를 사용하여 기존 레코드를 업데이트할 수 있습니다. `update` 메서드는 `insert` 메서드와 마찬가지로, 업데이트할 컬럼과 값을 키-값 쌍의 배열 형태로 받습니다. `update` 메서드는 영향을 받은 행(row)의 개수를 반환합니다. `where` 절을 사용하여 `update` 쿼리에 조건을 추가할 수 있습니다.

```
$affected = DB::table('users')
              ->where('id', 1)
              ->update(['votes' => 1]);
```

<a name="update-or-insert"></a>
#### 업데이트 또는 삽입

때때로 데이터베이스에 기존 레코드가 있으면 업데이트하고, 없으면 새로 생성하고 싶을 때가 있습니다. 이럴 때는 `updateOrInsert` 메서드를 사용할 수 있습니다. `updateOrInsert` 메서드는 두 개의 인수를 받습니다. 첫 번째는 레코드를 찾기 위한 조건의 배열, 두 번째는 업데이트할 컬럼과 값 쌍의 배열입니다.

`updateOrInsert` 메서드는 첫 번째 인수로 전달한 컬럼과 값 조합을 기준으로 데이터베이스에서 일치하는 레코드를 찾으려 시도합니다. 레코드가 존재한다면 두 번째 인수의 값으로 업데이트하고, 찾을 수 없다면 두 인수의 값을 합친 속성으로 새 레코드를 삽입합니다.

```
DB::table('users')
    ->updateOrInsert(
        ['email' => 'john@example.com', 'name' => 'John'],
        ['votes' => '2']
    );
```

<a name="updating-json-columns"></a>
### JSON 컬럼 업데이트

JSON 컬럼을 업데이트할 때는 `->` 문법을 사용하여 JSON 객체 내의 키를 업데이트할 수 있습니다. 이 기능은 MySQL 5.7+와 PostgreSQL 9.5+에서 지원됩니다.

```
$affected = DB::table('users')
              ->where('id', 1)
              ->update(['options->enabled' => true]);
```

<a name="increment-and-decrement"></a>
### 증가 및 감소

쿼리 빌더는 특정 컬럼의 값을 쉽게 증가(increment)하거나 감소(decrement)시키는 메서드도 제공합니다. 이 메서드들은 최소 한 개의 인수로 조작할 컬럼명을 받습니다. 두 번째 인수로 컬럼 값을 얼마나 증가/감소할지 지정할 수도 있습니다.

```
DB::table('users')->increment('votes');

DB::table('users')->increment('votes', 5);

DB::table('users')->decrement('votes');

DB::table('users')->decrement('votes', 5);
```

필요하다면 증가 또는 감소 작업 중에 추가로 업데이트할 컬럼을 지정할 수도 있습니다.

```
DB::table('users')->increment('votes', 1, ['name' => 'John']);
```

또한, `incrementEach`와 `decrementEach` 메서드를 사용하여 한 번에 여러 컬럼을 증가/감소시킬 수도 있습니다.

```
DB::table('users')->incrementEach([
    'votes' => 5,
    'balance' => 100,
]);
```

<a name="delete-statements"></a>
## 삭제(DELETE) 문

쿼리 빌더의 `delete` 메서드로 테이블에서 레코드를 삭제할 수 있습니다. `delete` 메서드는 영향을 받은 행(row)의 수를 반환합니다. `delete` 메서드 호출 전에 "where" 절을 추가해 삭제 대상을 제한할 수 있습니다.

```
$deleted = DB::table('users')->delete();

$deleted = DB::table('users')->where('votes', '>', 100)->delete();
```

테이블의 모든 레코드를 삭제하고, 자동 증가 ID도 0으로 초기화하려면 `truncate` 메서드를 사용할 수 있습니다.

```
DB::table('users')->truncate();
```

<a name="table-truncation-and-postgresql"></a>
#### 테이블 잘라내기(Truncation)와 PostgreSQL

PostgreSQL 데이터베이스를 잘라내기(truncate)할 때는 `CASCADE` 동작이 적용됩니다. 즉, 외래 키로 연결된 다른 테이블의 관련 레코드까지 모두 삭제됩니다.

<a name="pessimistic-locking"></a>
## 비관적 잠금(Pessimistic Locking)

쿼리 빌더는 `select` 문을 실행할 때 "비관적 잠금"을 구현하는 데 도움이 되는 여러 함수도 제공합니다. "공유 잠금(shared lock)"이 필요할 때는 `sharedLock` 메서드를 호출할 수 있습니다. 공유 잠금은 선택된 행이 트랜잭션이 커밋될 때까지 변경되지 않도록 방지합니다.

```
DB::table('users')
        ->where('votes', '>', 100)
        ->sharedLock()
        ->get();
```

또는, `lockForUpdate` 메서드를 사용할 수도 있습니다. "for update" 잠금은 선택된 레코드가 변경되거나, 다른 공유 잠금과 함께 다시 선택되는 것을 방지합니다.

```
DB::table('users')
        ->where('votes', '>', 100)
        ->lockForUpdate()
        ->get();
```

<a name="debugging"></a>
## 디버깅(Debugging)

쿼리를 작성하는 도중 `dd`와 `dump` 메서드를 사용해 현재 쿼리의 바인딩 정보와 SQL을 확인할 수 있습니다. `dd` 메서드는 디버그 정보를 출력하고 요청 실행을 중단합니다. 반면, `dump` 메서드는 디버그 정보만 출력하고 요청을 계속 이어갑니다.

```
DB::table('users')->where('votes', '>', 100)->dd();

DB::table('users')->where('votes', '>', 100)->dump();
```

또한, 쿼리에서 바인딩된 파라미터가 실제 값으로 치환된 SQL을 출력하고 싶다면, `dumpRawSql`과 `ddRawSql` 메서드를 사용할 수 있습니다.

```
DB::table('users')->where('votes', '>', 100)->dumpRawSql();

DB::table('users')->where('votes', '>', 100)->ddRawSql();
```