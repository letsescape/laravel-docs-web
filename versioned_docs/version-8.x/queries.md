# 데이터베이스: 쿼리 빌더 (Database: Query Builder)

- [소개](#introduction)
- [데이터베이스 쿼리 실행](#running-database-queries)
    - [결과 청킹 처리](#chunking-results)
    - [게으르게 결과 스트리밍하기](#streaming-results-lazily)
    - [집계 함수 사용](#aggregates)
- [SELECT 문](#select-statements)
- [Raw 표현식](#raw-expressions)
- [조인(Joins)](#joins)
- [UNION](#unions)
- [기본 WHERE 절](#basic-where-clauses)
    - [WHERE 절](#where-clauses)
    - [OR WHERE 절](#or-where-clauses)
    - [JSON WHERE 절](#json-where-clauses)
    - [추가 WHERE 절](#additional-where-clauses)
    - [논리적 그룹핑](#logical-grouping)
- [고급 WHERE 절](#advanced-where-clauses)
    - [WHERE EXISTS 절](#where-exists-clauses)
    - [하위 쿼리 WHERE 절](#subquery-where-clauses)
- [정렬, 그룹핑, LIMIT & OFFSET](#ordering-grouping-limit-and-offset)
    - [정렬](#ordering)
    - [그룹핑](#grouping)
    - [LIMIT & OFFSET](#limit-and-offset)
- [조건부 절](#conditional-clauses)
- [INSERT 문](#insert-statements)
    - [UPSERT](#upserts)
- [UPDATE 문](#update-statements)
    - [JSON 컬럼 업데이트](#updating-json-columns)
    - [INCREMENT & DECREMENT](#increment-and-decrement)
- [DELETE 문](#delete-statements)
- [비관적 잠금](#pessimistic-locking)
- [디버깅](#debugging)

<a name="introduction"></a>
## 소개

라라벨의 데이터베이스 쿼리 빌더는 데이터베이스 쿼리를 쉽고 유연하게 작성하고 실행할 수 있는 편리한 인터페이스를 제공합니다. 이 빌더는 애플리케이션에서 대부분의 데이터베이스 작업을 수행할 수 있게 해주며, 라라벨이 지원하는 모든 데이터베이스 시스템과 완벽하게 호환됩니다.

라라벨 쿼리 빌더는 PDO의 파라미터 바인딩을 활용하여, SQL 인젝션 공격으로부터 애플리케이션을 안전하게 보호합니다. 쿼리 빌더에 전달되는 문자열을 따로 정제(clean)하거나 필터링(sanitize)할 필요가 없습니다.

> [!NOTE]
> PDO는 컬럼명 바인딩을 지원하지 않습니다. 따라서 쿼리에서 참조되는 컬럼명(특히 "order by"처럼) 자체를 사용자 입력에 따라 동적으로 결정하게 해서는 안 됩니다.

<a name="running-database-queries"></a>
## 데이터베이스 쿼리 실행

<a name="retrieving-all-rows-from-a-table"></a>
#### 테이블의 모든 행 조회하기

`DB` 파사드에서 제공하는 `table` 메서드를 사용해 쿼리를 시작할 수 있습니다. `table` 메서드는 지정된 테이블에 대한 쿼리 빌더 인스턴스를 반환하며, 이 인스턴스에 연이어 다양한 조건을 체이닝하여 쿼리를 세밀하게 구성한 다음, 최종적으로 `get` 메서드를 통해 결과를 조회합니다.

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    /**
     * 애플리케이션의 모든 사용자를 목록으로 보여줍니다.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $users = DB::table('users')->get();

        return view('user.index', ['users' => $users]);
    }
}
```

`get` 메서드는 쿼리 결과가 담긴 `Illuminate\Support\Collection` 인스턴스를 반환하며, 각각의 결과는 PHP의 `stdClass` 객체로 표현됩니다. 각 컬럼 값은 객체의 속성처럼 접근할 수 있습니다.

```
use Illuminate\Support\Facades\DB;

$users = DB::table('users')->get();

foreach ($users as $user) {
    echo $user->name;
}
```

> [!TIP]
> 라라벨의 컬렉션은 데이터 맵핑, 축소 등 매우 강력한 메서드를 다양하게 제공합니다. 컬렉션에 관한 더 자세한 정보는 [컬렉션 문서](/docs/8.x/collections)를 참고하세요.

<a name="retrieving-a-single-row-column-from-a-table"></a>
#### 테이블에서 단일 행/컬럼 조회하기

데이터베이스 테이블에서 오직 한 행만 필요하다면, `DB` 파사드의 `first` 메서드를 사용할 수 있습니다. 이 메서드는 단일 `stdClass` 객체를 반환합니다.

```
$user = DB::table('users')->where('name', 'John')->first();

return $user->email;
```

전체 행이 아니라 특정 컬럼 값만 필요하다면, `value` 메서드를 활용하여 한 개의 값을 바로 추출할 수 있습니다. 이 메서드는 지정한 컬럼의 값을 직접 반환합니다.

```
$email = DB::table('users')->where('name', 'John')->value('email');
```

특정 `id` 컬럼 값에 해당하는 단일 행을 조회해야 한다면, `find` 메서드를 사용합니다.

```
$user = DB::table('users')->find(3);
```

<a name="retrieving-a-list-of-column-values"></a>
#### 컬럼 값 목록 조회하기

특정 컬럼의 값만 쭉 뽑아서 `Illuminate\Support\Collection` 형태로 받고 싶을 때는, `pluck` 메서드를 사용합니다. 아래 예시에서는 모든 사용자의 `title`만 추출해 컬렉션으로 가져옵니다.

```
use Illuminate\Support\Facades\DB;

$titles = DB::table('users')->pluck('title');

foreach ($titles as $title) {
    echo $title;
}
```

`pluck` 메서드의 두 번째 인자로, 결과 컬렉션이 key로 사용할 컬럼명을 지정할 수도 있습니다.

```
$titles = DB::table('users')->pluck('title', 'name');

foreach ($titles as $name => $title) {
    echo $title;
}
```

<a name="chunking-results"></a>
### 결과 청킹 처리

수천 건에 이르는 데이터베이스 레코드를 다루어야 한다면, `DB` 파사드에서 제공하는 `chunk` 메서드의 사용을 고려해 보세요. 이 메서드는 한 번에 소량의 결과만 읽어들여 콜백에 전달하여 데이터를 처리하므로, 메모리 자원을 효율적으로 사용할 수 있습니다. 예를 들어, `users` 테이블 전체를 100개씩 청크로 나누어 처리할 수 있습니다.

```
use Illuminate\Support\Facades\DB;

DB::table('users')->orderBy('id')->chunk(100, function ($users) {
    foreach ($users as $user) {
        //
    }
});
```

콜백에서 `false`를 반환하면 이후 청크 처리가 중단됩니다.

```
DB::table('users')->orderBy('id')->chunk(100, function ($users) {
    // 레코드 처리 ...

    return false;
});
```

청킹 처리 중 레코드의 값을 동시에 업데이트해야 한다면, 청크 결과가 예상치 못하게 변경될 수 있습니다. 이럴 때는 `chunkById` 메서드 사용을 권장합니다. 이 메서드는 레코드의 기본 키(primary key)를 기준으로 자동으로 페이지네이션하여 청크를 가져옵니다.

```
DB::table('users')->where('active', false)
    ->chunkById(100, function ($users) {
        foreach ($users as $user) {
            DB::table('users')
                ->where('id', $user->id)
                ->update(['active' => true]);
        }
    });
```

> [!NOTE]
> 청크 콜백 내에서 기본 키나 외래 키 값을 변경 또는 삭제하는 경우, 쿼리 결과에 영향을 줄 수 있으니 주의해야 합니다. 이로 인해 일부 레코드가 결과에서 누락될 수 있습니다.

<a name="streaming-results-lazily"></a>
### 게으르게 결과 스트리밍하기

`lazy` 메서드는 [chunk 메서드](#chunking-results)와 유사하게, 쿼리를 청크 단위로 실행합니다. 차이점은 각 청크를 콜백에 직접 넘기는 대신, `lazy()`는 [LazyCollection](/docs/8.x/collections#lazy-collections) 을 반환하여 결과를 하나의 스트림처럼 순회할 수 있다는 점입니다.

```php
use Illuminate\Support\Facades\DB;

DB::table('users')->orderBy('id')->lazy()->each(function ($user) {
    //
});
```

마찬가지로, 레코드를 순회하며 동시에 수정하려는 경우에는 `lazyById` 또는 `lazyByIdDesc` 등의 메서드를 쓰는 것이 좋습니다. 이들은 기본 키 값을 기반으로 자동으로 페이지네이션합니다.

```php
DB::table('users')->where('active', false)
    ->lazyById()->each(function ($user) {
        DB::table('users')
            ->where('id', $user->id)
            ->update(['active' => true]);
    });
```

> [!NOTE]
> 순회 중 기본 키나 외래 키를 수정하거나 삭제하면, 이후 실행되는 청크 쿼리에 영향을 줄 수 있으니 주의해야 합니다. 이로 인해 일부 레코드가 누락될 수 있습니다.

<a name="aggregates"></a>
### 집계 함수 사용

쿼리 빌더는 `count`, `max`, `min`, `avg`, `sum` 등 다양한 집계 함수도 제공합니다. 쿼리 빌더로 쿼리를 작성한 뒤, 이런 집계 메서드를 호출할 수 있습니다.

```
use Illuminate\Support\Facades\DB;

$users = DB::table('users')->count();

$price = DB::table('orders')->max('price');
```

물론, 이 메서드들은 다른 조건과도 조합해 사용할 수 있습니다. 예를 들어, 특정 조건을 만족하는 데이터에만 집계합 동작하도록 만들 수 있습니다.

```
$price = DB::table('orders')
                ->where('finalized', 1)
                ->avg('price');
```

<a name="determining-if-records-exist"></a>
#### 레코드 존재 여부 판별하기

쿼리 조건을 만족하는 레코드가 실제로 존재하는지 확인하고 싶다면, 단순히 `count` 메서드를 사용하는 대신 `exists` 또는 `doesntExist` 메서드를 사용할 수 있습니다.

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

모든 컬럼이 아니라 필요한 컬럼만 선택해서 조회하고 싶을 때는, `select` 메서드로 원하는 SELECT 절을 지정할 수 있습니다.

```
use Illuminate\Support\Facades\DB;

$users = DB::table('users')
            ->select('name', 'email as user_email')
            ->get();
```

`distinct` 메서드를 이용하면, 쿼리 결과를 중복 없이 반환하도록 강제할 수 있습니다.

```
$users = DB::table('users')->distinct()->get();
```

이미 쿼리 빌더 인스턴스를 만들어 두었을 때, 기존 select 절에 컬럼을 추가하려면 `addSelect` 메서드를 사용합니다.

```
$query = DB::table('users')->select('name');

$users = $query->addSelect('age')->get();
```

<a name="raw-expressions"></a>
## Raw 표현식

쿼리 내에 임의의 문자(문자열)를 삽입해야 할 때가 있습니다. 이럴 때는 `DB` 파사드의 `raw` 메서드를 사용해서 raw 문자열 표현식을 만들 수 있습니다.

```
$users = DB::table('users')
             ->select(DB::raw('count(*) as user_count, status'))
             ->where('status', '<>', 1)
             ->groupBy('status')
             ->get();
```

> [!NOTE]
> Raw 구문은 쿼리에 문자열 그대로 삽입되므로, SQL 인젝션 문제가 발생하지 않도록 각별히 주의해야 합니다.

<a name="raw-methods"></a>
### Raw 메서드

`DB::raw`를 사용하는 대신, 아래와 같은 메서드들 역시 쿼리의 다양한 위치에 raw 표현식을 삽입할 수 있습니다. **주의: raw 표현식을 사용하는 쿼리는 라라벨이 SQL 인젝션으로부터 보호해준다고 보장할 수 없습니다.**

<a name="selectraw"></a>
#### `selectRaw`

`selectRaw` 메서드는 `addSelect(DB::raw(...))` 대신 사용할 수 있습니다. 이 메서드는 두 번째 인자로 바인딩 배열을 받습니다(선택 옵션).

```
$orders = DB::table('orders')
                ->selectRaw('price * ? as price_with_tax', [1.0825])
                ->get();
```

<a name="whereraw-orwhereraw"></a>
#### `whereRaw / orWhereRaw`

`whereRaw` 및 `orWhereRaw` 메서드는 쿼리에 raw "where" 절을 삽입할 수 있습니다. 이들 역시 선택적으로 두 번째 인자에 바인딩 값을 배열로 넘길 수 있습니다.

```
$orders = DB::table('orders')
                ->whereRaw('price > IF(state = "TX", ?, 100)', [200])
                ->get();
```

<a name="havingraw-orhavingraw"></a>
#### `havingRaw / orHavingRaw`

`havingRaw` 및 `orHavingRaw` 메서드는 "having" 절에 raw 문자열을 사용할 수 있으며, 선택적으로 바인딩 배열을 인자로 받을 수 있습니다.

```
$orders = DB::table('orders')
                ->select('department', DB::raw('SUM(price) as total_sales'))
                ->groupBy('department')
                ->havingRaw('SUM(price) > ?', [2500])
                ->get();
```

<a name="orderbyraw"></a>
#### `orderByRaw`

`orderByRaw` 메서드는 "order by" 절에 raw 문자열을 사용할 때 쓸 수 있습니다.

```
$orders = DB::table('orders')
                ->orderByRaw('updated_at - created_at DESC')
                ->get();
```

<a name="groupbyraw"></a>
### `groupByRaw`

`groupByRaw` 메서드는 `group by` 절에 raw 문자열을 전달하는 데 사용합니다.

```
$orders = DB::table('orders')
                ->select('city', 'state')
                ->groupByRaw('city, state')
                ->get();
```

<a name="joins"></a>
## 조인(Joins)

<a name="inner-join-clause"></a>
#### INNER JOIN 절

쿼리 빌더에서는 쿼리에 조인(join) 절을 추가할 수도 있습니다. 기본적인 "inner join"을 수행하려면, 쿼리 빌더 인스턴스의 `join` 메서드를 사용하면 됩니다. 첫 번째 인자로는 조인할 테이블명을 넘기고, 나머지 인자들은 조인 조건으로 사용할 컬럼 제약 조건을 지정합니다. 한 번의 쿼리에서 여러 테이블을 조인할 수 있습니다.

```
use Illuminate\Support\Facades\DB;

$users = DB::table('users')
            ->join('contacts', 'users.id', '=', 'contacts.user_id')
            ->join('orders', 'users.id', '=', 'orders.user_id')
            ->select('users.*', 'contacts.phone', 'orders.price')
            ->get();
```

<a name="left-join-right-join-clause"></a>
#### LEFT JOIN / RIGHT JOIN 절

"inner join" 대신 "left join"이나 "right join"을 원한다면, 각각 `leftJoin`과 `rightJoin` 메서드를 사용하면 됩니다. 이 메서드들은 `join` 메서드와 시그니처가 같습니다.

```
$users = DB::table('users')
            ->leftJoin('posts', 'users.id', '=', 'posts.user_id')
            ->get();

$users = DB::table('users')
            ->rightJoin('posts', 'users.id', '=', 'posts.user_id')
            ->get();
```

<a name="cross-join-clause"></a>
#### CROSS JOIN 절

"cross join"을 수행하려면 `crossJoin` 메서드를 사용하세요. 크로스 조인은 첫 번째 테이블과 두 번째 테이블의 카테시안 곱을 생성합니다.

```
$sizes = DB::table('sizes')
            ->crossJoin('colors')
            ->get();
```

<a name="advanced-join-clauses"></a>
#### 고급 JOIN 절

더 복잡한 조인 조건이 필요하다면, `join` 메서드의 두 번째 인자로 클로저를 전달할 수 있습니다. 이 클로저는 `Illuminate\Database\Query\JoinClause` 인스턴스를 인자로 받아, 조인 절에 다양한 조건을 추가할 수 있습니다.

```
DB::table('users')
        ->join('contacts', function ($join) {
            $join->on('users.id', '=', 'contacts.user_id')->orOn(...);
        })
        ->get();
```

조인에서 단지 두 컬럼 비교가 아닌, 특정 컬럼 값과 어떤 값을 비교하고 싶은 경우, `JoinClause` 인스턴스의 `where`와 `orWhere` 메서드를 사용할 수 있습니다.

```
DB::table('users')
        ->join('contacts', function ($join) {
            $join->on('users.id', '=', 'contacts.user_id')
                 ->where('contacts.user_id', '>', 5);
        })
        ->get();
```

<a name="subquery-joins"></a>
#### 하위 쿼리 조인(Subquery Joins)

`joinSub`, `leftJoinSub`, `rightJoinSub` 메서드를 사용하면 하위 쿼리(서브쿼리)를 조인할 수 있습니다. 각 메서드는 (1) 하위 쿼리 객체, (2) 하위 쿼리별 테이블 별칭(alias), (3) 관련 컬럼을 지정하는 클로저의 세 인자를 받습니다. 아래 예시는 각 사용자마다, 해당 사용자의 가장 최근 게시글의 `created_at` 타임스탬프도 함께 가져오는 쿼리입니다.

```
$latestPosts = DB::table('posts')
                   ->select('user_id', DB::raw('MAX(created_at) as last_post_created_at'))
                   ->where('is_published', true)
                   ->groupBy('user_id');

$users = DB::table('users')
        ->joinSub($latestPosts, 'latest_posts', function ($join) {
            $join->on('users.id', '=', 'latest_posts.user_id');
        })->get();
```

<a name="unions"></a>
## UNION

쿼리 빌더는 여러 쿼리 결과를 "union"으로 합치는 편리한 메서드도 제공합니다. 예를 들어, 우선 하나의 쿼리를 만들고, `union` 메서드로 다른 쿼리와 합칠 수 있습니다.

```
use Illuminate\Support\Facades\DB;

$first = DB::table('users')
            ->whereNull('first_name');

$users = DB::table('users')
            ->whereNull('last_name')
            ->union($first)
            ->get();
```

`union` 메서드 외에도, `unionAll` 메서드가 있습니다. `unionAll`로 합치는 경우에는, 중복 레코드가 제거되지 않고 모두 포함됩니다. `unionAll`은 `union`과 동일한 시그니처를 가집니다.

<a name="basic-where-clauses"></a>
## 기본 WHERE 절

<a name="where-clauses"></a>
### WHERE 절

쿼리 빌더의 `where` 메서드를 사용하여 쿼리에 "where" 절을 추가할 수 있습니다. 가장 기본적인 `where` 호출은 세 개의 인자를 사용합니다. 첫 번째는 컬럼명, 두 번째는 연산자(데이터베이스에서 지원하는 모든 연산자 가능), 세 번째는 컬럼과 비교할 값입니다.

예를 들어, 다음 쿼리는 `votes` 컬럼이 100이고 `age` 컬럼이 35초과인 사용자만 조회합니다.

```
$users = DB::table('users')
                ->where('votes', '=', 100)
                ->where('age', '>', 35)
                ->get();
```

간편하게, 컬럼이 `=` 인지 비교하고 싶다면, `where`의 두 번째 인자에 값을 바로 넘기면 됩니다. 라라벨은 자동으로 `=` 연산자를 사용합니다.

```
$users = DB::table('users')->where('votes', 100)->get();
```

앞서 말한 바와 같이, 데이터베이스가 지원하는 모든 연산자를 연산자로 사용할 수 있습니다.

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

`where` 메서드에 조건들의 배열을 넘겨 여러 조건을 한 번에 추가할 수도 있습니다. 배열의 각 요소는 `where`에 기본적으로 전달하는 세 인자(컬럼, 연산자, 값)를 담은 배열이어야 합니다.

```
$users = DB::table('users')->where([
    ['status', '=', '1'],
    ['subscribed', '<>', '1'],
])->get();
```

> [!NOTE]
> PDO는 컬럼명 바인딩을 지원하지 않습니다. 따라서 쿼리에서 참조되는 컬럼명(특히 "order by"처럼)을 사용자 입력에 따라 동적으로 지정해서는 절대 안 됩니다.

<a name="or-where-clauses"></a>
### OR WHERE 절

쿼리 빌더의 `where` 메서드를 연달아 호출할 경우, 각 "where" 절은 기본적으로 `and` 연산자로 연결됩니다. 반면, `or` 연산자로 연결하고 싶다면, `orWhere` 메서드를 활용하면 됩니다. `orWhere`도 `where`와 동일한 인자를 받습니다.

```
$users = DB::table('users')
                    ->where('votes', '>', 100)
                    ->orWhere('name', 'John')
                    ->get();
```

괄호로 감싼 "or" 조건을 그룹화하고 싶으면, `orWhere`의 첫 인자로 클로저를 넘기면 됩니다.

```
$users = DB::table('users')
            ->where('votes', '>', 100)
            ->orWhere(function($query) {
                $query->where('name', 'Abigail')
                      ->where('votes', '>', 50);
            })
            ->get();
```

위 예제에서 실제 생성되는 SQL은 다음과 같습니다.

```sql
select * from users where votes > 100 or (name = 'Abigail' and votes > 50)
```

> [!NOTE]
> 글로벌 스코프가 적용된 경우 예기치 않은 동작을 피하기 위해, 항상 `orWhere`는 그룹화해서 사용하는 것이 좋습니다.

<a name="json-where-clauses"></a>
### JSON WHERE 절

라라벨을 이용하면, JSON 컬럼 타입을 지원하는 데이터베이스(현재 MySQL 5.7+, PostgreSQL, SQL Server 2016, SQLite 3.9.0 [JSON1 익스텐션 필요](https://www.sqlite.org/json1.html) 등)에서 JSON 컬럼에 조건을 달 수 있습니다. 이때는 `->` 연산자를 사용합니다.

```
$users = DB::table('users')
                ->where('preferences->dining->meal', 'salad')
                ->get();
```

JSON 배열의 값을 조건으로 조회하고 싶다면, `whereJsonContains`를 사용할 수 있습니다. 이 기능은 SQLite에서는 지원하지 않습니다.

```
$users = DB::table('users')
                ->whereJsonContains('options->languages', 'en')
                ->get();
```

만약 MySQL 또는 PostgreSQL을 사용한다면, 여러 값을 배열로 전달할 수도 있습니다.

```
$users = DB::table('users')
                ->whereJsonContains('options->languages', ['en', 'de'])
                ->get();
```

JSON 배열의 길이가 특정 값인지 조건을 걸 때는 `whereJsonLength` 메서드를 사용합니다.

```
$users = DB::table('users')
                ->whereJsonLength('options->languages', 0)
                ->get();

$users = DB::table('users')
                ->whereJsonLength('options->languages', '>', 1)
                ->get();
```

<a name="additional-where-clauses"></a>

### 추가적인 Where 절

**whereBetween / orWhereBetween**

`whereBetween` 메서드는 특정 컬럼의 값이 두 값 사이에 있는지 확인합니다.

```
$users = DB::table('users')
           ->whereBetween('votes', [1, 100])
           ->get();
```

**whereNotBetween / orWhereNotBetween**

`whereNotBetween` 메서드는 특정 컬럼의 값이 두 값의 범위를 벗어나는지 확인합니다.

```
$users = DB::table('users')
                    ->whereNotBetween('votes', [1, 100])
                    ->get();
```

**whereIn / whereNotIn / orWhereIn / orWhereNotIn**

`whereIn` 메서드는 주어진 컬럼의 값이 지정한 배열 내에 존재하는지 확인합니다.

```
$users = DB::table('users')
                    ->whereIn('id', [1, 2, 3])
                    ->get();
```

`whereNotIn` 메서드는 주어진 컬럼의 값이 지정한 배열 내에 존재하지 않는지 확인합니다.

```
$users = DB::table('users')
                    ->whereNotIn('id', [1, 2, 3])
                    ->get();
```

> [!NOTE]
> 쿼리에 매우 큰 정수 배열을 바인딩해야 하는 경우, `whereIntegerInRaw` 또는 `whereIntegerNotInRaw` 메서드를 사용하면 메모리 사용량을 크게 줄일 수 있습니다.

**whereNull / whereNotNull / orWhereNull / orWhereNotNull**

`whereNull` 메서드는 주어진 컬럼의 값이 `NULL`인지 확인합니다.

```
$users = DB::table('users')
                ->whereNull('updated_at')
                ->get();
```

`whereNotNull` 메서드는 컬럼의 값이 `NULL`이 아님을 확인합니다.

```
$users = DB::table('users')
                ->whereNotNull('updated_at')
                ->get();
```

**whereDate / whereMonth / whereDay / whereYear / whereTime**

`whereDate` 메서드는 컬럼의 값을 날짜와 비교할 때 사용할 수 있습니다.

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

`whereDay` 메서드는 컬럼의 값을 특정 일(day)과 비교할 때 사용할 수 있습니다.

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

`whereColumn` 메서드는 두 컬럼의 값이 같은지 확인할 때 사용할 수 있습니다.

```
$users = DB::table('users')
                ->whereColumn('first_name', 'last_name')
                ->get();
```

비교 연산자를 `whereColumn` 메서드에 전달할 수도 있습니다.

```
$users = DB::table('users')
                ->whereColumn('updated_at', '>', 'created_at')
                ->get();
```

또한 배열 형태로 여러 컬럼 간의 비교를 전달할 수도 있습니다. 이 조건들은 `and` 연산자로 묶여 집니다.

```
$users = DB::table('users')
                ->whereColumn([
                    ['first_name', '=', 'last_name'],
                    ['updated_at', '>', 'created_at'],
                ])->get();
```

<a name="logical-grouping"></a>
### 논리적 그룹핑

가끔 쿼리에서 원하는 논리적 그룹핑을 만들기 위해 여러 개의 "where" 절을 괄호로 묶어야 할 때가 있습니다. 특히, `orWhere` 메서드를 사용할 때는 예기치 않은 쿼리 동작을 방지하기 위해 항상 괄호로 묶는 것이 좋습니다. 이를 위해 `where` 메서드에 클로저를 전달할 수 있습니다.

```
$users = DB::table('users')
           ->where('name', '=', 'John')
           ->where(function ($query) {
               $query->where('votes', '>', 100)
                     ->orWhere('title', '=', 'Admin');
           })
           ->get();
```

위 예시에서처럼, `where` 메서드에 클로저를 전달하면 쿼리 빌더가 하나의 제약 그룹을 시작합니다. 클로저는 쿼리 빌더 인스턴스를 전달받으며, 이 인스턴스를 통해 괄호로 감쌀 조건들을 추가할 수 있습니다. 위의 예제는 아래와 같은 SQL을 생성합니다.

```sql
select * from users where name = 'John' and (votes > 100 or title = 'Admin')
```

> [!NOTE]
> `orWhere` 호출 시에는 항상 그룹핑을 해주어야 글로벌 스코프가 적용될 때 예기치 않은 동작을 피할 수 있습니다.

<a name="advanced-where-clauses"></a>
### 고급 Where 절

<a name="where-exists-clauses"></a>
### Where Exists 절

`whereExists` 메서드를 사용하면 "where exists" SQL 절을 작성할 수 있습니다. 이 메서드는 클로저를 인자로 받아, 해당 클로저에서 쿼리 빌더 인스턴스를 이용해 "exists" 절 안에 들어갈 쿼리를 정의할 수 있습니다.

```
$users = DB::table('users')
           ->whereExists(function ($query) {
               $query->select(DB::raw(1))
                     ->from('orders')
                     ->whereColumn('orders.user_id', 'users.id');
           })
           ->get();
```

위 쿼리는 다음과 같은 SQL을 생성합니다.

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

특정 값과 서브쿼리의 결과를 비교하는 "where" 절을 만들어야 할 때가 있습니다. 이럴 때는 `where` 메서드에 클로저와 비교 값을 함께 전달하면 됩니다. 예를 들어, 다음 쿼리는 지정한 타입의 최근 "membership"을 가진 모든 사용자를 조회합니다.

```
use App\Models\User;

$users = User::where(function ($query) {
    $query->select('type')
        ->from('membership')
        ->whereColumn('membership.user_id', 'users.id')
        ->orderByDesc('membership.start_date')
        ->limit(1);
}, 'Pro')->get();
```

또한, 컬럼을 서브쿼리 결과와 비교하는 "where" 절을 만들어야 할 수도 있습니다. 이 경우, 컬럼명과 연산자, 그리고 클로저를 `where` 메서드에 전달합니다. 아래 예시는 `amount` 값이 평균보다 작은 모든 소득 레코드를 조회하는 예시입니다.

```
use App\Models\Income;

$incomes = Income::where('amount', '<', function ($query) {
    $query->selectRaw('avg(i.amount)')->from('incomes as i');
})->get();
```

<a name="ordering-grouping-limit-and-offset"></a>
## 정렬, 그룹핑, 제한 및 오프셋

<a name="ordering"></a>
### 정렬

<a name="orderby"></a>
#### orderBy 메서드

`orderBy` 메서드는 쿼리 결과를 지정한 컬럼으로 정렬할 수 있게 해줍니다. 첫 번째 인자는 정렬할 컬럼명이고, 두 번째 인자로 정렬 방향(`asc` 또는 `desc`)을 지정합니다.

```
$users = DB::table('users')
                ->orderBy('name', 'desc')
                ->get();
```

여러 컬럼을 기준으로 정렬하려면 `orderBy`를 여러 번 연속해서 호출하면 됩니다.

```
$users = DB::table('users')
                ->orderBy('name', 'desc')
                ->orderBy('email', 'asc')
                ->get();
```

<a name="latest-oldest"></a>
#### latest 및 oldest 메서드

`latest`와 `oldest` 메서드를 사용하면 날짜 기준으로 손쉽게 결과를 정렬할 수 있습니다. 기본적으로는 테이블의 `created_at` 컬럼을 기준으로 정렬하지만, 원하는 컬럼명을 인자로 지정할 수도 있습니다.

```
$user = DB::table('users')
                ->latest()
                ->first();
```

<a name="random-ordering"></a>
#### 무작위 정렬

`inRandomOrder` 메서드를 사용하면 쿼리 결과를 무작위로 정렬할 수 있습니다. 예를 들어, 임의의 유저 한 명을 뽑고 싶을 때 사용할 수 있습니다.

```
$randomUser = DB::table('users')
                ->inRandomOrder()
                ->first();
```

<a name="removing-existing-orderings"></a>
#### 기존 정렬 조건 제거

`reorder` 메서드를 사용하면 해당 쿼리에 적용된 모든 "order by" 절을 제거할 수 있습니다.

```
$query = DB::table('users')->orderBy('name');

$unorderedUsers = $query->reorder()->get();
```

`reorder` 메서드 호출 시 정렬 컬럼과 방향을 인자로 전달하면, 기존 "order by" 절을 모두 제거하고 새로운 정렬 조건을 적용할 수 있습니다.

```
$query = DB::table('users')->orderBy('name');

$usersOrderedByEmail = $query->reorder('email', 'desc')->get();
```

<a name="grouping"></a>
### 그룹핑

<a name="groupby-having"></a>
#### groupBy 및 having 메서드

기대할 수 있듯, `groupBy`와 `having` 메서드를 이용해 쿼리 결과를 그룹핑할 수 있습니다. `having` 메서드는 `where`와 유사한 시그니처를 가집니다.

```
$users = DB::table('users')
                ->groupBy('account_id')
                ->having('account_id', '>', 100)
                ->get();
```

`havingBetween` 메서드를 사용해 지정한 범위 내의 결과만 필터링할 수도 있습니다.

```
$report = DB::table('orders')
                ->selectRaw('count(id) as number_of_orders, customer_id')
                ->groupBy('customer_id')
                ->havingBetween('number_of_orders', [5, 15])
                ->get();
```

여러 인자를 `groupBy`에 전달해 여러 컬럼으로 그룹핑할 수도 있습니다.

```
$users = DB::table('users')
                ->groupBy('first_name', 'status')
                ->having('account_id', '>', 100)
                ->get();
```

더 복잡한 `having` 쿼리를 작성하려면 [`havingRaw`](#raw-methods) 문서를 참고하세요.

<a name="limit-and-offset"></a>
### Limit 및 Offset

<a name="skip-take"></a>
#### skip 및 take 메서드

쿼리에서 결과 개수를 제한하거나, 앞의 일부 결과를 건너뛰고 싶을 때 `skip`과 `take` 메서드를 사용할 수 있습니다.

```
$users = DB::table('users')->skip(10)->take(5)->get();
```

대신 `limit`과 `offset` 메서드를 사용할 수도 있습니다. 이 두 메서드는 각각 `take`와 `skip`과 동일한 기능을 합니다.

```
$users = DB::table('users')
                ->offset(10)
                ->limit(5)
                ->get();
```

<a name="conditional-clauses"></a>
## 조건부 쿼리 절

특정 조건에 따라 쿼리 절을 동적으로 추가해야 할 때가 있습니다. 예를 들어, 입력값이 요청에 있다면 `where` 절을 적용하고 없으면 무시하고 싶을 때, `when` 메서드를 사용할 수 있습니다.

```
$role = $request->input('role');

$users = DB::table('users')
                ->when($role, function ($query, $role) {
                    return $query->where('role_id', $role);
                })
                ->get();
```

`when` 메서드는 첫 번째 인자가 `true`로 평가될 때만 전달된 클로저를 실행합니다. 만약 첫 번째 인자가 `false`라면 클로저가 실행되지 않습니다. 위 예시에서는 요청에 `role` 필드가 존재하고 true로 평가될 때만 해당 클로저가 동작합니다.

추가로, 세 번째 인자로 또 다른 클로저를 전달할 수 있습니다. 이 클로저는 첫 번째 인자가 `false`로 평가될 때만 실행됩니다. 이 기능은 쿼리 기본 정렬을 설정할 때도 사용할 수 있습니다.

```
$sortByVotes = $request->input('sort_by_votes');

$users = DB::table('users')
                ->when($sortByVotes, function ($query, $sortByVotes) {
                    return $query->orderBy('votes');
                }, function ($query) {
                    return $query->orderBy('name');
                })
                ->get();
```

<a name="insert-statements"></a>
## Insert 구문

쿼리 빌더에서는 데이터를 데이터베이스 테이블에 삽입할 때 사용할 수 있는 `insert` 메서드를 제공합니다. 이 메서드는 컬럼명과 값들이 담긴 배열을 인자로 받습니다.

```
DB::table('users')->insert([
    'email' => 'kayla@example.com',
    'votes' => 0
]);
```

배열의 배열을 전달하여 여러 레코드를 한 번에 삽입할 수도 있습니다. 각 배열이 하나의 레코드를 의미합니다.

```
DB::table('users')->insert([
    ['email' => 'picard@example.com', 'votes' => 0],
    ['email' => 'janeway@example.com', 'votes' => 0],
]);
```

`insertOrIgnore` 메서드를 사용하면 데이터베이스에 레코드를 삽입하는 과정에서 오류를 무시할 수 있습니다.

```
DB::table('users')->insertOrIgnore([
    ['id' => 1, 'email' => 'sisko@example.com'],
    ['id' => 2, 'email' => 'archer@example.com'],
]);
```

> [!NOTE]
> `insertOrIgnore`는 중복 레코드뿐만 아니라 데이터베이스 엔진에 따라 다른 유형의 오류도 무시할 수 있습니다. 예를 들어, MySQL의 스트릭트 모드를 [무시](https://dev.mysql.com/doc/refman/en/sql-mode.html#ignore-effect-on-execution)합니다.

<a name="auto-incrementing-ids"></a>
#### 자동 증가 ID

테이블에 자동 증가 id 컬럼이 있다면, `insertGetId` 메서드를 사용해 레코드를 삽입한 후 해당 ID 값을 즉시 조회할 수 있습니다.

```
$id = DB::table('users')->insertGetId(
    ['email' => 'john@example.com', 'votes' => 0]
);
```

> [!NOTE]
> PostgreSQL을 사용할 경우, `insertGetId` 메서드는 자동 증가 컬럼의 이름이 반드시 `id`여야 한다고 가정합니다. 다른 "sequence"에서 ID를 조회하고 싶다면, 두 번째 인자로 컬럼명을 지정하면 됩니다.

<a name="upserts"></a>
### 업서트(Upsert)

`upsert` 메서드를 사용하면 존재하지 않는 레코드는 삽입하고, 이미 존재하는 레코드는 지정한 새로운 값으로 업데이트할 수 있습니다. 첫 번째 인자는 삽입 또는 업데이트하고자 하는 값들의 배열이고, 두 번째 인자는 테이블에서 레코드를 고유하게 식별하는 컬럼(들)의 배열, 세 번째 인자는 이미 존재하는 레코드가 있을 때 업데이트할 컬럼들의 배열입니다.

```
DB::table('flights')->upsert([
    ['departure' => 'Oakland', 'destination' => 'San Diego', 'price' => 99],
    ['departure' => 'Chicago', 'destination' => 'New York', 'price' => 150]
], ['departure', 'destination'], ['price']);
```

위 예시에서는 두 개의 레코드를 삽입하려고 시도합니다. 만약 같은 `departure`와 `destination` 값을 가진 레코드가 이미 존재하면, 해당 레코드의 `price` 컬럼만 업데이트됩니다.

> [!NOTE]
> SQL Server를 제외한 모든 데이터베이스에서는 `upsert` 메서드 두 번째 인자로 전달된 컬럼들이 "primary"나 "unique" 인덱스를 가져야 합니다. 또한, MySQL 드라이버는 `upsert` 메서드의 두 번째 인자를 무시하고 테이블의 "primary" 및 "unique" 인덱스만을 이용해 기존 레코드를 판별합니다.

<a name="update-statements"></a>
## Update 구문

데이터를 삽입하는 것 외에도, 쿼리 빌더에서는 기존 레코드를 업데이트할 수 있는 `update` 메서드를 제공합니다. 이 메서드는 수정할 컬럼과 값의 배열을 받으며, 업데이트된 행의 수를 반환합니다. `where` 절을 사용해 원하는 레코드만 업데이트할 수도 있습니다.

```
$affected = DB::table('users')
              ->where('id', 1)
              ->update(['votes' => 1]);
```

<a name="update-or-insert"></a>
#### Update Or Insert

DB에서 기존 레코드를 업데이트하거나, 일치하는 레코드가 없으면 새로 생성하고 싶을 때는 `updateOrInsert` 메서드를 사용할 수 있습니다. 이 메서드는 첫 번째 인자로 조건이 담긴 배열, 두 번째 인자로 수정할 컬럼과 값의 배열을 받습니다.

`updateOrInsert`는 첫 번째 인자로 전달한 컬럼-값 쌍을 이용해 레코드를 찾습니다. 만약 레코드가 존재하면 두 번째 인자의 값을 이용해 업데이트되고, 찾을 수 없다면 두 인자를 합쳐서 새 레코드를 삽입합니다.

```
DB::table('users')
    ->updateOrInsert(
        ['email' => 'john@example.com', 'name' => 'John'],
        ['votes' => '2']
    );
```

<a name="updating-json-columns"></a>
### JSON 컬럼 업데이트

JSON 컬럼을 업데이트할 때에는, JSON 객체 내부의 특정 키를 수정하기 위해 `->` 문법을 사용할 수 있습니다. 이 기능은 MySQL 5.7+ 및 PostgreSQL 9.5+에서 지원합니다.

```
$affected = DB::table('users')
              ->where('id', 1)
              ->update(['options->enabled' => true]);
```

<a name="increment-and-decrement"></a>
### 증가 및 감소

쿼리 빌더에서는 지정한 컬럼의 값을 간편하게 증가시키거나 감소시키는 기능도 지원합니다. 두 메서드 모두 첫 번째 인자는 수정할 컬럼이고, 두 번째 인자로 증가/감소 수치를 지정할 수 있습니다(생략 시 1).

```
DB::table('users')->increment('votes');

DB::table('users')->increment('votes', 5);

DB::table('users')->decrement('votes');

DB::table('users')->decrement('votes', 5);
```

이와 동시에, 추가로 다른 컬럼도 함께 업데이트할 수 있습니다.

```
DB::table('users')->increment('votes', 1, ['name' => 'John']);
```

<a name="delete-statements"></a>
## Delete 구문

쿼리 빌더의 `delete` 메서드를 사용하면 테이블의 레코드를 삭제할 수 있습니다. 이 메서드는 삭제된 행의 개수를 반환합니다. 삭제할 대상을 지정하려면 "where" 절과 함께 사용할 수도 있습니다.

```
$deleted = DB::table('users')->delete();

$deleted = DB::table('users')->where('votes', '>', 100)->delete();
```

테이블의 모든 레코드를 삭제하고 자동 증가 ID도 0으로 초기화하려면 `truncate` 메서드를 사용할 수 있습니다.

```
DB::table('users')->truncate();
```

<a name="table-truncation-and-postgresql"></a>
#### 테이블 Truncate & PostgreSQL

PostgreSQL 데이터베이스를 트렁케이트할 때는 `CASCADE` 동작이 자동으로 적용됩니다. 즉, 외래 키가 연결된 하위 테이블의 레코드도 함께 삭제됩니다.

<a name="pessimistic-locking"></a>
## 비관적 잠금(Pessimistic Locking)

쿼리 빌더에서는 `select` 구문을 실행할 때 "비관적 잠금"을 사용할 수 있도록 도와주는 몇 가지 메서드를 제공합니다. "공유 잠금(shared lock)"을 걸려면 `sharedLock` 메서드를 사용하세요. 공유 잠금은 현재 트랜잭션이 커밋될 때까지 선택된 행이 수정되는 것을 막습니다.

```
DB::table('users')
        ->where('votes', '>', 100)
        ->sharedLock()
        ->get();
```

또는, `lockForUpdate` 메서드를 사용할 수도 있습니다. "for update" 잠금은 선택한 레코드가 수정되거나, 다른 트랜잭션에서 또 다른 공유 잠금으로 선택되는 것을 모두 방지합니다.

```
DB::table('users')
        ->where('votes', '>', 100)
        ->lockForUpdate()
        ->get();
```

<a name="debugging"></a>
## 디버깅

쿼리를 작성하는 도중에 쿼리 바인딩 및 SQL을 바로 확인하고 싶을 때는 `dd` 및 `dump` 메서드를 사용할 수 있습니다. `dd`는 디버깅 정보를 보여주고 실행을 즉시 중지하며, `dump`는 디버깅 정보만 출력하고 실행을 이어갑니다.

```
DB::table('users')->where('votes', '>', 100)->dd();

DB::table('users')->where('votes', '>', 100)->dump();
```