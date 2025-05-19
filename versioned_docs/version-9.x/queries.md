# 데이터베이스: 쿼리 빌더 (Database: Query Builder)

- [소개](#introduction)
- [데이터베이스 쿼리 실행](#running-database-queries)
    - [결과 조각(chunk) 단위로 처리하기](#chunking-results)
    - [결과를 지연(lazy) 스트리밍으로 처리하기](#streaming-results-lazily)
    - [집계 함수 사용](#aggregates)
- [Select 구문](#select-statements)
- [Raw 표현식](#raw-expressions)
- [조인(Join)](#joins)
- [유니온(Union)](#unions)
- [기본 Where 구문](#basic-where-clauses)
    - [Where 구문](#where-clauses)
    - [Or Where 구문](#or-where-clauses)
    - [Where Not 구문](#where-not-clauses)
    - [JSON Where 구문](#json-where-clauses)
    - [추가 Where 구문](#additional-where-clauses)
    - [논리 그룹화](#logical-grouping)
- [고급 Where 구문](#advanced-where-clauses)
    - [Where Exists 구문](#where-exists-clauses)
    - [서브쿼리 Where 구문](#subquery-where-clauses)
    - [전체 텍스트 Where 구문](#full-text-where-clauses)
- [정렬, 그룹화, Limit & Offset](#ordering-grouping-limit-and-offset)
    - [정렬](#ordering)
    - [그룹화](#grouping)
    - [Limit & Offset](#limit-and-offset)
- [조건부 구문](#conditional-clauses)
- [Insert 구문](#insert-statements)
    - [Upserts](#upserts)
- [Update 구문](#update-statements)
    - [JSON 컬럼 업데이트](#updating-json-columns)
    - [증가 및 감소](#increment-and-decrement)
- [Delete 구문](#delete-statements)
- [비관적 잠금](#pessimistic-locking)
- [디버깅](#debugging)

<a name="introduction"></a>
## 소개

라라벨의 데이터베이스 쿼리 빌더는 데이터베이스 쿼리를 쉽고 유연하게 생성 및 실행할 수 있는 편리한 인터페이스를 제공합니다. 이 빌더는 애플리케이션에서 대부분의 데이터베이스 작업을 수행하는 데 사용할 수 있으며, 라라벨이 지원하는 모든 데이터베이스 시스템과 완벽하게 호환됩니다.

라라벨 쿼리 빌더는 PDO 파라미터 바인딩을 사용하여 SQL 인젝션 공격으로부터 애플리케이션을 안전하게 보호합니다. 별도로 쿼리 빌더에 전달하는 문자열 값을 정리(clean)하거나 필터링(sanitize)할 필요는 없습니다.

> [!WARNING]
> PDO는 컬럼 이름 바인딩을 지원하지 않습니다. 따라서, 쿼리에서 참조하는 컬럼 이름(특히 "order by" 컬럼명 등)에 사용자의 입력값이 사용되도록 허용해서는 안 됩니다.

<a name="running-database-queries"></a>
## 데이터베이스 쿼리 실행

<a name="retrieving-all-rows-from-a-table"></a>
#### 테이블에서 모든 행 조회하기

쿼리를 시작하기 위해 `DB` 파사드가 제공하는 `table` 메서드를 사용할 수 있습니다. `table` 메서드는 지정한 테이블에 대한 쿼리 빌더 인스턴스를 반환하므로, 다양한 제약 조건을 체이닝하여 쿼리를 작성하고 마지막에 `get` 메서드를 통해 결과를 조회할 수 있습니다.

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    /**
     * 애플리케이션의 모든 사용자 목록을 보여줍니다.
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

`get` 메서드는 쿼리 결과를 담은 `Illuminate\Support\Collection` 인스턴스를 반환합니다. 여기서 각 결과는 PHP의 `stdClass` 객체로 표현됩니다. 각 컬럼의 값은 객체의 속성(property)으로 접근할 수 있습니다.

```
use Illuminate\Support\Facades\DB;

$users = DB::table('users')->get();

foreach ($users as $user) {
    echo $user->name;
}
```

> [!NOTE]
> 라라벨의 컬렉션은 데이터를 매핑하고 축소(reduce)하는 데 매우 강력한 다양한 메서드를 제공합니다. 컬렉션에 대한 자세한 내용은 [컬렉션 문서](/docs/9.x/collections)를 참고하세요.

<a name="retrieving-a-single-row-column-from-a-table"></a>
#### 테이블에서 단일 행 또는 컬럼 조회하기

데이터베이스 테이블에서 단일 행만 조회하고 싶다면, `DB` 파사드의 `first` 메서드를 사용할 수 있습니다. 이 메서드는 하나의 `stdClass` 객체를 반환합니다.

```
$user = DB::table('users')->where('name', 'John')->first();

return $user->email;
```

전체 행이 필요하지 않고 레코드에서 단일 값을 추출하고 싶다면, `value` 메서드를 사용할 수 있습니다. 이 메서드는 해당 컬럼의 값을 바로 반환합니다.

```
$email = DB::table('users')->where('name', 'John')->value('email');
```

`id` 컬럼 값을 기준으로 한 행을 조회하려면, `find` 메서드를 사용할 수 있습니다.

```
$user = DB::table('users')->find(3);
```

<a name="retrieving-a-list-of-column-values"></a>
#### 컬럼 값의 목록 조회하기

단일 컬럼의 값만을 `Illuminate\Support\Collection` 인스턴스로 조회하고 싶다면, `pluck` 메서드를 사용할 수 있습니다. 다음 예에서는 사용자들의 직함(title)만을 컬렉션으로 가져옵니다.

```
use Illuminate\Support\Facades\DB;

$titles = DB::table('users')->pluck('title');

foreach ($titles as $title) {
    echo $title;
}
```

`pluck` 메서드의 두 번째 인자로 결과 컬렉션의 키로 사용할 컬럼명을 지정할 수도 있습니다.

```
$titles = DB::table('users')->pluck('title', 'name');

foreach ($titles as $name => $title) {
    echo $title;
}
```

<a name="chunking-results"></a>
### 결과 조각(chunk) 단위로 처리하기

수천 개 이상의 데이터베이스 레코드를 한 번에 처리해야 한다면, `DB` 파사드의 `chunk` 메서드를 사용하는 것이 좋습니다. 이 메서드는 한 번에 일정량의 결과를 가져와서, 각 청크를 클로저(익명 함수)에 전달하면서 처리할 수 있도록 해줍니다. 아래 예시는 `users` 테이블을 100개씩 조각내어 순차적으로 처리합니다.

```
use Illuminate\Support\Facades\DB;

DB::table('users')->orderBy('id')->chunk(100, function ($users) {
    foreach ($users as $user) {
        //
    }
});
```

클로저에서 `false`를 반환하면, 이후 청크 처리는 중단됩니다.

```
DB::table('users')->orderBy('id')->chunk(100, function ($users) {
    // 레코드 처리...

    return false;
});
```

청크 처리를 하면서 동시에 데이터베이스 레코드를 업데이트할 경우, 의도치 않게 참조 대상이 변경될 수 있습니다. 이처럼 청크 처리 중에 레코드를 수정할 계획이라면 `chunkById` 메서드를 사용하는 것이 가장 안전합니다. 이 메서드는 자동으로 기본 키를 기준으로 페이지네이션 처리하여 레코드를 나눕니다.

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

> [!WARNING]
> 청크 콜백 내부에서 레코드를 업데이트하거나 삭제할 때, 기본 키 또는 외래 키의 변경은 청크 쿼리에 영향을 미칠 수 있습니다. 이로 인해 일부 레코드가 청크 결과에서 누락되는 등의 문제가 발생할 수 있습니다.

<a name="streaming-results-lazily"></a>
### 결과를 지연(lazy) 스트리밍으로 처리하기

`lazy` 메서드는 [chunk 메서드](#chunking-results)처럼 쿼리를 일정 단위로 실행한다는 점에서 유사하지만, 각 청크를 콜백으로 전달하는 대신 [`LazyCollection`](/docs/9.x/collections#lazy-collections) 인스턴스를 반환하여 데이터 스트림처럼 다룰 수 있습니다.

```php
use Illuminate\Support\Facades\DB;

DB::table('users')->orderBy('id')->lazy()->each(function ($user) {
    //
});
```

마찬가지로, 반복 도중에 조회한 레코드를 업데이트할 계획이라면 `lazyById` 또는 `lazyByIdDesc` 메서드를 사용하는 것이 가장 좋습니다. 이 메서드들은 레코드의 기본 키를 기준으로 자동으로 페이지네이션을 처리합니다.

```php
DB::table('users')->where('active', false)
    ->lazyById()->each(function ($user) {
        DB::table('users')
            ->where('id', $user->id)
            ->update(['active' => true]);
    });
```

> [!WARNING]
> 반복 도중에 레코드를 업데이트하거나 삭제할 경우, 기본 키 또는 외래 키의 변경은 청크 쿼리에 영향을 줄 수 있습니다. 그로 인해 일부 레코드가 결과에 포함되지 않을 수 있습니다.

<a name="aggregates"></a>
### 집계 함수 사용

쿼리 빌더는 `count`, `max`, `min`, `avg`, `sum` 과 같은 다양한 집계 함수 메서드를 제공합니다. 쿼리를 원하는 조건으로 작성한 뒤, 이러한 메서드를 호출할 수 있습니다.

```
use Illuminate\Support\Facades\DB;

$users = DB::table('users')->count();

$price = DB::table('orders')->max('price');
```

물론, 집계 메서드는 다른 조건과 함께 조합하여 더욱 세밀하게 원하는 값을 구할 수도 있습니다.

```
$price = DB::table('orders')
                ->where('finalized', 1)
                ->avg('price');
```

<a name="determining-if-records-exist"></a>
#### 레코드 존재 여부 확인

쿼리의 조건에 맞는 레코드가 존재하는지 확인할 때 굳이 `count` 메서드를 쓸 필요 없이, `exists` 및 `doesntExist` 메서드를 사용할 수 있습니다.

```
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

항상 테이블의 모든 컬럼을 조회할 필요는 없습니다. `select` 메서드를 사용하면 쿼리의 "select" 절에 원하는 컬럼만을 지정할 수 있습니다.

```
use Illuminate\Support\Facades\DB;

$users = DB::table('users')
            ->select('name', 'email as user_email')
            ->get();
```

특정 컬럼의 중복을 제거하고 싶다면 `distinct` 메서드를 사용할 수 있습니다.

```
$users = DB::table('users')->distinct()->get();
```

이미 쿼리 빌더 인스턴스를 가지고 있고, 기존 select 절에 컬럼을 추가하고 싶다면 `addSelect` 메서드를 사용할 수 있습니다.

```
$query = DB::table('users')->select('name');

$users = $query->addSelect('age')->get();
```

<a name="raw-expressions"></a>
## Raw 표현식

때때로 쿼리에 임의의 문자열을 삽입해야 할 때가 있습니다. 이럴 때는 `DB` 파사드의 `raw` 메서드를 사용하여 Raw 문자열 표현식을 만들 수 있습니다.

```
$users = DB::table('users')
             ->select(DB::raw('count(*) as user_count, status'))
             ->where('status', '<>', 1)
             ->groupBy('status')
             ->get();
```

> [!WARNING]
> Raw 구문은 쿼리에 문자열 그대로 삽입되므로 SQL 인젝션 취약점을 방지할 수 있도록 매우 주의해서 사용해야 합니다.

<a name="raw-methods"></a>
### Raw 메서드

`DB::raw` 대신, Raw 표현식을 쿼리의 다양한 부분에 삽입할 수 있는 다음 메서드들을 사용할 수도 있습니다.  
**주의: Raw 표현식을 이용한 쿼리는 라라벨이 SQL 인젝션에 대한 보안을 완전히 보장할 수 없습니다.**

<a name="selectraw"></a>
#### `selectRaw`

`selectRaw` 메서드는 `addSelect(DB::raw(/* ... */))` 대신에 사용할 수 있습니다. 두 번째 인자로 바인딩 배열을 옵션으로 전달할 수 있습니다.

```
$orders = DB::table('orders')
                ->selectRaw('price * ? as price_with_tax', [1.0825])
                ->get();
```

<a name="whereraw-orwhereraw"></a>
#### `whereRaw / orWhereRaw`

`whereRaw`와 `orWhereRaw` 메서드는 쿼리에 Raw "where" 절을 삽입할 때 사용합니다. 마찬가지로 두 번째 인자로 바인딩 배열을 옵션으로 전달할 수 있습니다.

```
$orders = DB::table('orders')
                ->whereRaw('price > IF(state = "TX", ?, 100)', [200])
                ->get();
```

<a name="havingraw-orhavingraw"></a>
#### `havingRaw / orHavingRaw`

`havingRaw`와 `orHavingRaw` 메서드를 사용하면 "having" 절의 값으로 직접 Raw 문자열을 전달할 수 있습니다. 이 메서드들 역시 옵션으로 바인딩 배열을 두 번째 인자로 전달합니다.

```
$orders = DB::table('orders')
                ->select('department', DB::raw('SUM(price) as total_sales'))
                ->groupBy('department')
                ->havingRaw('SUM(price) > ?', [2500])
                ->get();
```

<a name="orderbyraw"></a>
#### `orderByRaw`

`orderByRaw` 메서드를 사용하면 "order by" 절의 값으로 Raw 문자열을 전달할 수 있습니다.

```
$orders = DB::table('orders')
                ->orderByRaw('updated_at - created_at DESC')
                ->get();
```

<a name="groupbyraw"></a>
### `groupByRaw`

`groupByRaw` 메서드는 `group by` 절의 값으로 Raw 문자열을 지정할 때 사용합니다.

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

쿼리 빌더를 이용해 쿼리에 조인(join)절도 추가할 수 있습니다. 기본적인 "inner join"을 수행하려면 쿼리 빌더 인스턴스에 `join` 메서드를 사용하면 됩니다. 첫 번째 인자는 조인할 테이블 이름, 나머지 인자들은 조인 조건을 지정합니다. 한 쿼리에서 여러 테이블을 조인할 수도 있습니다.

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

"inner join"이 아닌 "left join" 또는 "right join"을 하고 싶다면, `leftJoin` 또는 `rightJoin` 메서드를 사용할 수 있습니다. 이들 메서드의 시그니처는 `join`과 동일합니다.

```
$users = DB::table('users')
            ->leftJoin('posts', 'users.id', '=', 'posts.user_id')
            ->get();

$users = DB::table('users')
            ->rightJoin('posts', 'users.id', '=', 'posts.user_id')
            ->get();
```

<a name="cross-join-clause"></a>
#### 크로스 조인(Cross Join) 절

"크로스 조인"을 수행하려면 `crossJoin` 메서드를 사용하세요. 크로스 조인은 첫 번째 테이블과 조인된 테이블의 카테시안 곱을 생성합니다.

```
$sizes = DB::table('sizes')
            ->crossJoin('colors')
            ->get();
```

<a name="advanced-join-clauses"></a>
#### 고급 조인 구문

더 복잡한 조인 절을 작성하고 싶다면, `join` 메서드의 두 번째 인자로 클로저를 전달하면 됩니다. 이 클로저는 `Illuminate\Database\Query\JoinClause` 인스턴스를 받아, 조인 조건을 더욱 세밀하게 지정할 수 있습니다.

```
DB::table('users')
        ->join('contacts', function ($join) {
            $join->on('users.id', '=', 'contacts.user_id')->orOn(/* ... */);
        })
        ->get();
```

조인에서 "where" 조건으로 값을 비교하고 싶다면, `JoinClause` 인스턴스가 제공하는 `where` 및 `orWhere` 메서드를 사용할 수 있습니다. 이 메서드들은 두 컬럼 간 비교가 아니라, 컬럼과 값의 비교를 수행합니다.

```
DB::table('users')
        ->join('contacts', function ($join) {
            $join->on('users.id', '=', 'contacts.user_id')
                 ->where('contacts.user_id', '>', 5);
        })
        ->get();
```

<a name="subquery-joins"></a>
#### 서브쿼리 조인(Subquery Joins)

`joinSub`, `leftJoinSub`, `rightJoinSub` 메서드를 사용하면 쿼리를 서브쿼리와 조인할 수 있습니다. 각 메서드는 세 가지 인자를 받는데, 첫 번째는 서브쿼리, 두 번째는 테이블 별칭(alias), 세 번째는 관련 컬럼을 정의하는 클로저입니다. 아래 예제는 각 사용자 레코드에 해당 사용자의 최신 게시글의 `created_at` 타임스탬프를 함께 조회합니다.

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
## 유니온(Union)

쿼리 빌더는 두 개 이상의 쿼리를 "유니온(union)"으로 합치는 편리한 메서드도 제공합니다. 예를 들어, 처음에 쿼리를 만들고, `union` 메서드를 이용해 다른 쿼리와 합칠 수 있습니다.

```
use Illuminate\Support\Facades\DB;

$first = DB::table('users')
            ->whereNull('first_name');

$users = DB::table('users')
            ->whereNull('last_name')
            ->union($first)
            ->get();
```

`union` 메서드 외에도, `unionAll` 메서드가 제공됩니다. `unionAll`로 합쳐진 쿼리의 결과는 중복 값이 제거되지 않으며, 시그니처는 `union`과 동일합니다.

<a name="basic-where-clauses"></a>
## 기본 Where 구문

<a name="where-clauses"></a>
### Where 구문

쿼리 빌더의 `where` 메서드를 사용하면 쿼리에 "where" 절을 추가할 수 있습니다. 가장 기본적인 사용법은 세 개의 인자를 받는데, 첫 번째는 컬럼명, 두 번째는 연산자(데이터베이스에서 지원하는 연산자), 세 번째는 컬럼과 비교할 값입니다.

아래 예제는 `votes` 컬럼이 `100`이고, `age` 컬럼이 `35`를 초과하는 사용자를 조회합니다.

```
$users = DB::table('users')
                ->where('votes', '=', 100)
                ->where('age', '>', 35)
                ->get();
```

편의를 위해 컬럼이 `=`와 같은지 확인하고 싶다면, 두 번째 인자로 값을 바로 전달할 수 있습니다. 라라벨은 내부적으로 `=` 연산자를 자동으로 사용합니다.

```
$users = DB::table('users')->where('votes', 100)->get();
```

이미 설명한 것처럼, 데이터베이스가 지원하는 어떤 연산자도 사용할 수 있습니다.

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

또한, 조건의 배열을 `where` 함수에 전달할 수 있습니다. 배열의 각 요소는 기본적으로 `where` 메서드에 전달되는 세 개의 인자가 하나의 배열로 담깁니다.

```
$users = DB::table('users')->where([
    ['status', '=', '1'],
    ['subscribed', '<>', '1'],
])->get();
```

> [!WARNING]
> PDO는 컬럼명 바인딩을 지원하지 않습니다. 그러므로 쿼리에서 참조하는 컬럼명(특히 "order by" 컬럼 등)에 사용자의 입력값을 직접 반영해서는 안 됩니다.

<a name="or-where-clauses"></a>
### Or Where 구문

여러 개의 `where` 메서드를 체이닝하면, 조건들은 `and` 연산자로 연결됩니다. 하지만, `or`로 조건을 연결하려면 `orWhere` 메서드를 사용하면 됩니다. `orWhere`는 `where`와 동일한 인자를 받습니다.

```
$users = DB::table('users')
                    ->where('votes', '>', 100)
                    ->orWhere('name', 'John')
                    ->get();
```

만약 `or` 조건을 괄호로 묶어 그룹화해야 한다면, 첫 번째 인자로 클로저를 전달할 수 있습니다.

```
$users = DB::table('users')
            ->where('votes', '>', 100)
            ->orWhere(function($query) {
                $query->where('name', 'Abigail')
                      ->where('votes', '>', 50);
            })
            ->get();
```

위 코드는 아래와 같은 SQL을 생성합니다.

```sql
select * from users where votes > 100 or (name = 'Abigail' and votes > 50)
```

> [!WARNING]
> 예기치 않은 동작을 방지하기 위해, `orWhere`를 사용할 때는 반드시 괄호로 묶어 그룹을 지어야 합니다. 글로벌 스코프가 적용된 경우 특히 주의가 필요합니다.

<a name="where-not-clauses"></a>
### Where Not 구문

`whereNot`과 `orWhereNot` 메서드는 지정한 조건 그룹을 부정(negate)하는 데 사용할 수 있습니다. 예를 들어, 아래 쿼리는 세일 품목이거나 가격이 10 미만인 상품을 결과에서 제외합니다.

```
$products = DB::table('products')
                ->whereNot(function ($query) {
                    $query->where('clearance', true)
                          ->orWhere('price', '<', 10);
                })
                ->get();
```

<a name="json-where-clauses"></a>
### JSON Where 구문

라라벨은 JSON 컬럼 타입을 지원하는 데이터베이스(MySQL 5.7+, PostgreSQL, SQL Server 2016, SQLite 3.39.0 이상(및 [JSON1 확장](https://www.sqlite.org/json1.html) 설치 필요))에서 JSON 컬럼에 대한 쿼리도 지원합니다. JSON 컬럼을 쿼리하려면 `->` 연산자를 사용하면 됩니다.

```
$users = DB::table('users')
                ->where('preferences->dining->meal', 'salad')
                ->get();
```

JSON 배열 내 값을 쿼리하려면 `whereJsonContains`를 사용할 수 있습니다. 이 기능은 SQLite 3.38.0 미만 버전에서는 지원되지 않습니다.

```
$users = DB::table('users')
                ->whereJsonContains('options->languages', 'en')
                ->get();
```

애플리케이션에서 MySQL 또는 PostgreSQL을 사용한다면, `whereJsonContains`에 값의 배열도 전달할 수 있습니다.

```
$users = DB::table('users')
                ->whereJsonContains('options->languages', ['en', 'de'])
                ->get();
```

JSON 배열의 길이를 조건으로 쿼리하려면 `whereJsonLength` 메서드를 사용할 수 있습니다.

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

`whereNotBetween` 메서드는 특정 컬럼의 값이 두 값의 범위 밖에 있는지 확인합니다.

```
$users = DB::table('users')
                    ->whereNotBetween('votes', [1, 100])
                    ->get();
```

**whereBetweenColumns / whereNotBetweenColumns / orWhereBetweenColumns / orWhereNotBetweenColumns**

`whereBetweenColumns` 메서드는 해당 행에서 두 컬럼의 값 사이에 특정 컬럼의 값이 포함되는지 확인합니다.

```
$patients = DB::table('patients')
                       ->whereBetweenColumns('weight', ['minimum_allowed_weight', 'maximum_allowed_weight'])
                       ->get();
```

`whereNotBetweenColumns` 메서드는 해당 행에서 두 컬럼의 값의 범위 밖에 특정 컬럼의 값이 있는지 확인합니다.

```
$patients = DB::table('patients')
                       ->whereNotBetweenColumns('weight', ['minimum_allowed_weight', 'maximum_allowed_weight'])
                       ->get();
```

**whereIn / whereNotIn / orWhereIn / orWhereNotIn**

`whereIn` 메서드는 주어진 컬럼의 값이 지정한 배열 안에 포함되어 있는지 확인합니다.

```
$users = DB::table('users')
                    ->whereIn('id', [1, 2, 3])
                    ->get();
```

`whereNotIn` 메서드는 주어진 컬럼의 값이 해당 배열에 포함되어 있지 않은지 확인합니다.

```
$users = DB::table('users')
                    ->whereNotIn('id', [1, 2, 3])
                    ->get();
```

또한 `whereIn` 메서드의 두 번째 인수로 쿼리 객체를 전달할 수도 있습니다.

```
$activeUsers = DB::table('users')->select('id')->where('is_active', 1);

$users = DB::table('comments')
                    ->whereIn('user_id', $activeUsers)
                    ->get();
```

위 예시 코드에서 생성되는 SQL은 다음과 같습니다.

```sql
select * from comments where user_id in (
    select id
    from users
    where is_active = 1
)
```

> [!WARNING]
> 쿼리에 많은 수의 정수로 이루어진 배열을 바인딩해야 할 때, `whereIntegerInRaw` 또는 `whereIntegerNotInRaw` 메서드를 사용하면 메모리 사용량을 크게 줄일 수 있습니다.

**whereNull / whereNotNull / orWhereNull / orWhereNotNull**

`whereNull` 메서드는 주어진 컬럼의 값이 `NULL`인지 확인합니다.

```
$users = DB::table('users')
                ->whereNull('updated_at')
                ->get();
```

`whereNotNull` 메서드는 해당 컬럼의 값이 `NULL`이 아닌지 확인합니다.

```
$users = DB::table('users')
                ->whereNotNull('updated_at')
                ->get();
```

**whereDate / whereMonth / whereDay / whereYear / whereTime**

`whereDate` 메서드는 컬럼의 값을 특정 날짜와 비교할 수 있습니다.

```
$users = DB::table('users')
                ->whereDate('created_at', '2016-12-31')
                ->get();
```

`whereMonth` 메서드는 컬럼의 값을 특정 월과 비교할 때 사용합니다.

```
$users = DB::table('users')
                ->whereMonth('created_at', '12')
                ->get();
```

`whereDay` 메서드는 컬럼의 값을 달의 특정 일(day)과 비교할 때 사용합니다.

```
$users = DB::table('users')
                ->whereDay('created_at', '31')
                ->get();
```

`whereYear` 메서드는 컬럼의 값을 특정 연도와 비교할 때 사용합니다.

```
$users = DB::table('users')
                ->whereYear('created_at', '2016')
                ->get();
```

`whereTime` 메서드는 컬럼의 값을 특정 시간과 비교할 때 사용합니다.

```
$users = DB::table('users')
                ->whereTime('created_at', '=', '11:20:45')
                ->get();
```

**whereColumn / orWhereColumn**

`whereColumn` 메서드는 두 컬럼의 값이 같은지 비교하는 데 사용할 수 있습니다.

```
$users = DB::table('users')
                ->whereColumn('first_name', 'last_name')
                ->get();
```

비교 연산자를 함께 전달하여 사용할 수도 있습니다.

```
$users = DB::table('users')
                ->whereColumn('updated_at', '>', 'created_at')
                ->get();
```

또한 여러 컬럼 비교를 위한 배열을 전달할 수 있습니다. 이 조건들은 모두 and 연산자로 연결됩니다.

```
$users = DB::table('users')
                ->whereColumn([
                    ['first_name', '=', 'last_name'],
                    ['updated_at', '>', 'created_at'],
                ])->get();
```

<a name="logical-grouping"></a>
### 논리적 그룹화

쿼리에서 원하는 논리적인 그룹화를 만들기 위해 여러 개의 "where" 절을 괄호로 묶어야 할 때가 있습니다. 특히, `orWhere` 메서드를 사용할 때는 원하지 않는 쿼리 동작을 방지하기 위해 항상 괄호로 묶어주는 것이 좋습니다. 이를 위해 `where` 메서드에 클로저를 전달할 수 있습니다.

```
$users = DB::table('users')
           ->where('name', '=', 'John')
           ->where(function ($query) {
               $query->where('votes', '>', 100)
                     ->orWhere('title', '=', 'Admin');
           })
           ->get();
```

이처럼, `where` 메서드에 클로저를 전달하면 쿼리 빌더는 괄호 그룹을 시작하게 됩니다. 클로저에는 쿼리 빌더 인스턴스가 전달되며, 괄호 그룹 내에 포함시킬 조건을 정의할 수 있습니다. 위의 예시 코드는 다음과 같은 SQL을 생성합니다.

```sql
select * from users where name = 'John' and (votes > 100 or title = 'Admin')
```

> [!WARNING]
> 글로벌 스코프가 적용될 때 예기치 않은 동작을 방지하기 위해 `orWhere` 호출은 항상 묶어주는 습관을 들이세요.

<a name="advanced-where-clauses"></a>
### 고급 Where 절

<a name="where-exists-clauses"></a>
### Where Exists 절

`whereExists` 메서드는 "where exists" SQL 절을 쓸 수 있게 해줍니다. 이 메서드는 클로저를 인수로 받아서, 클로저 내에서 "exists" 절 안에 들어갈 쿼리를 정의할 수 있습니다.

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

때로는 서브쿼리의 결과와 특정 값을 비교하는 "where" 절이 필요할 수 있습니다. 이 경우, `where` 메서드에 클로저와 값을 함께 전달하면 됩니다. 예를 들어, 다음 쿼리는 특정 타입의 최근 "membership"을 가진 모든 사용자를 가져옵니다.

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

또 다른 예로, 컬럼 값을 서브쿼리의 결과와 비교하고 싶다면, 컬럼명, 연산자, 클로저를 `where` 메서드에 전달하면 됩니다. 다음 쿼리는 수입(income) 기록 중 금액이 평균보다 작은 모든 레코드를 조회합니다.

```
use App\Models\Income;

$incomes = Income::where('amount', '<', function ($query) {
    $query->selectRaw('avg(i.amount)')->from('incomes as i');
})->get();
```

<a name="full-text-where-clauses"></a>
### 전문(Full Text) Where 절

> [!WARNING]
> 전문(Full Text) where 절은 현재 MySQL과 PostgreSQL에서만 지원됩니다.

`whereFullText` 및 `orWhereFullText` 메서드는 [전문 인덱스](/docs/9.x/migrations#available-index-types)가 설정되어 있는 컬럼에 대해 전문 "where" 절을 쿼리에 추가할 수 있습니다. 이 메서드들은 실제 데이터베이스에 맞게 적절한 SQL로 변환됩니다. 예를 들어 MySQL을 사용할 경우 `MATCH AGAINST` 절이 생성됩니다.

```
$users = DB::table('users')
           ->whereFullText('bio', 'web developer')
           ->get();
```

<a name="ordering-grouping-limit-and-offset"></a>
## 정렬, 그룹화, 개수 제한, 오프셋

<a name="ordering"></a>
### 정렬(Ordering)

<a name="orderby"></a>
#### `orderBy` 메서드

`orderBy` 메서드는 쿼리 결과를 지정한 컬럼 기준으로 정렬할 수 있게 해줍니다. 첫 번째 인수는 정렬할 컬럼명, 두 번째 인수는 정렬 방향(`asc` 또는 `desc`)을 지정합니다.

```
$users = DB::table('users')
                ->orderBy('name', 'desc')
                ->get();
```

여러 컬럼 기준으로 정렬하려면 `orderBy`를 여러 번 호출하면 됩니다.

```
$users = DB::table('users')
                ->orderBy('name', 'desc')
                ->orderBy('email', 'asc')
                ->get();
```

<a name="latest-oldest"></a>
#### `latest` & `oldest` 메서드

`latest` 및 `oldest` 메서드를 사용하면 날짜 기준으로 쉽게 결과를 정렬할 수 있습니다. 기본적으로 테이블의 `created_at` 컬럼을 기준으로 정렬됩니다. 원하는 컬럼명을 직접 지정할 수도 있습니다.

```
$user = DB::table('users')
                ->latest()
                ->first();
```

<a name="random-ordering"></a>
#### 무작위 정렬

`inRandomOrder` 메서드를 사용하면 쿼리 결과를 무작위로 정렬할 수 있습니다. 예를 들어, 임의의 사용자를 반환할때 활용할 수 있습니다.

```
$randomUser = DB::table('users')
                ->inRandomOrder()
                ->first();
```

<a name="removing-existing-orderings"></a>
#### 기존 정렬 제거

`reorder` 메서드는 쿼리에 적용되어 있던 모든 "order by" 절을 제거합니다.

```
$query = DB::table('users')->orderBy('name');

$unorderedUsers = $query->reorder()->get();
```

`reorder` 메서드 호출 시 컬럼명과 정렬 방향을 전달하면 기존의 모든 "order by" 를 제거하고 새로운 기준으로 정렬할 수 있습니다.

```
$query = DB::table('users')->orderBy('name');

$usersOrderedByEmail = $query->reorder('email', 'desc')->get();
```

<a name="grouping"></a>
### 그룹화(Grouping)

<a name="groupby-having"></a>
#### `groupBy` & `having` 메서드

예상하셨겠지만, `groupBy`와 `having` 메서드를 이용하여 쿼리 결과를 그룹화할 수 있습니다. `having` 메서드의 시그니처는 `where`와 유사합니다.

```
$users = DB::table('users')
                ->groupBy('account_id')
                ->having('account_id', '>', 100)
                ->get();
```

결과를 특정 범위로 필터링하고 싶을 때에는 `havingBetween` 메서드를 사용할 수 있습니다.

```
$report = DB::table('orders')
                ->selectRaw('count(id) as number_of_orders, customer_id')
                ->groupBy('customer_id')
                ->havingBetween('number_of_orders', [5, 15])
                ->get();
```

`groupBy` 메서드에 여러 인수를 전달하여 여러 컬럼 기준으로 그룹화할 수도 있습니다.

```
$users = DB::table('users')
                ->groupBy('first_name', 'status')
                ->having('account_id', '>', 100)
                ->get();
```

보다 고급의 `having` 구문을 작성하려면 [`havingRaw`](#raw-methods) 메서드를 참고하세요.

<a name="limit-and-offset"></a>
### 개수 제한, 오프셋(Limit & Offset)

<a name="skip-take"></a>
#### `skip` & `take` 메서드

`skip` 및 `take` 메서드를 사용하면 결과의 시작 위치(오프셋)와 반한 개수를 제한할 수 있습니다.

```
$users = DB::table('users')->skip(10)->take(5)->get();
```

다른 방법으로, `limit`과 `offset` 메서드도 사용할 수 있습니다. 이 두 메서드는 각각 `take` 및 `skip`과 동일한 기능을 합니다.

```
$users = DB::table('users')
                ->offset(10)
                ->limit(5)
                ->get();
```

<a name="conditional-clauses"></a>
## 조건부 절(Conditional Clauses)

특정 조건에 따라 쿼리에 일부 절만 적용하고 싶을 때가 있습니다. 예를 들어, 입력값이 있을 때만 `where` 구문을 적용하고 싶을 수 있습니다. 이럴 때는 `when` 메서드를 사용하세요.

```
$role = $request->input('role');

$users = DB::table('users')
                ->when($role, function ($query, $role) {
                    $query->where('role_id', $role);
                })
                ->get();
```

`when` 메서드는 첫 번째 인수(condition)가 `true`일 때만 전달된 클로저를 실행합니다. `false`면 클로저는 실행되지 않습니다. 위 예시에서는, 요청에 `role` 필드가 존재하고 값이 `true`일 때만 클로저가 실행되어 쿼리에 조건이 추가됩니다.

또한 `when` 메서드의 세 번째 인수로 또 다른 클로저를 전달할 수 있습니다. 이 클로저는 첫 번째 인수가 `false`일 때 실행됩니다. 이 기능을 활용해 쿼리의 기본 정렬 방식을 지정할 수 있습니다.

```
$sortByVotes = $request->input('sort_by_votes');

$users = DB::table('users')
                ->when($sortByVotes, function ($query, $sortByVotes) {
                    $query->orderBy('votes');
                }, function ($query) {
                    $query->orderBy('name');
                })
                ->get();
```

<a name="insert-statements"></a>
## Insert 구문

쿼리 빌더는 테이블에 레코드를 추가할 때 사용할 수 있는 `insert` 메서드도 제공합니다. `insert` 메서드는 컬럼명과 값을 갖는 배열을 인수로 받습니다.

```
DB::table('users')->insert([
    'email' => 'kayla@example.com',
    'votes' => 0
]);
```

여러 레코드를 한 번에 추가하려면, 배열의 배열을 전달하면 됩니다. 각 배열은 하나의 레코드를 의미합니다.

```
DB::table('users')->insert([
    ['email' => 'picard@example.com', 'votes' => 0],
    ['email' => 'janeway@example.com', 'votes' => 0],
]);
```

`insertOrIgnore` 메서드는 레코드를 추가하는 중에 발생하는 일부 에러를 무시합니다. 이 메서드를 사용할 때는 중복 레코드 오류는 무시되며 그 밖의 다른 오류도 데이터베이스 엔진에 따라 무시될 수 있다는 점에 유의해야 합니다. 예를 들어, `insertOrIgnore`는 [MySQL의 strict mode를 우회](https://dev.mysql.com/doc/refman/en/sql-mode.html#ignore-effect-on-execution)합니다.

```
DB::table('users')->insertOrIgnore([
    ['id' => 1, 'email' => 'sisko@example.com'],
    ['id' => 2, 'email' => 'archer@example.com'],
]);
```

`insertUsing` 메서드는 서브쿼리에서 조회한 데이터를 이용해 새로운 레코드를 테이블에 추가할 수 있습니다.

```
DB::table('pruned_users')->insertUsing([
    'id', 'name', 'email', 'email_verified_at'
], DB::table('users')->select(
    'id', 'name', 'email', 'email_verified_at'
)->where('updated_at', '<=', now()->subMonth()));
```

<a name="auto-incrementing-ids"></a>
#### 자동 증가 ID

테이블에 자동 증가되는 id 컬럼이 있다면, `insertGetId` 메서드를 사용하여 레코드를 추가하면서 생성된 ID 값을 바로 받아올 수 있습니다.

```
$id = DB::table('users')->insertGetId(
    ['email' => 'john@example.com', 'votes' => 0]
);
```

> [!WARNING]
> PostgreSQL에서 `insertGetId` 메서드를 사용할 경우, 자동 증가 컬럼명이 반드시 `id`여야 합니다. 만약 다른 "시퀀스"에서 ID 값을 얻고 싶다면, 해당 컬럼명을 두 번째 인수로 넘길 수 있습니다.

<a name="upserts"></a>
### Upserts

`upsert` 메서드는 존재하지 않는 레코드는 추가하고, 이미 존재하는 레코드는 새로운 값으로 갱신(업데이트)합니다. 첫 번째 인수로는 삽입 또는 업데이트할 값들을, 두 번째 인수에는 해당 테이블에서 레코드를 고유하게 식별할 컬럼(들)을 배열로, 세 번째 인수에는 레코드가 이미 존재할 경우 업데이트할 컬럼(들)을 배열로 전달합니다.

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

위 예시에서, 라라벨은 두 개의 레코드를 추가 시도합니다. 만약 `departure`와 `destination` 컬럼이 동일한 레코드가 이미 존재하면, 해당 레코드의 `price` 컬럼만 업데이트됩니다.

> [!WARNING]
> SQL Server를 제외한 모든 데이터베이스에서는 `upsert` 메서드의 두 번째 인수로 넘긴 컬럼에 "primary" 또는 "unique" 인덱스가 있어야 합니다. 또한, MySQL 데이터베이스 드라이버는 `upsert` 메서드의 두 번째 인수를 무시하고, 테이블의 "primary" 및 "unique" 인덱스를 이용해 기존 레코드를 판단합니다.

<a name="update-statements"></a>
## Update 구문

레코드를 추가(insert)하는 것 외에도, 쿼리 빌더를 통해 기존 레코드를 수정(update)할 수도 있습니다. `update` 메서드는 `insert`와 마찬가지로 컬럼과 값이 쌍으로 들어있는 배열을 인수로 받고, 영향받은 행(row)의 개수를 반환합니다. `where` 절을 이용해 업데이트 대상을 제한할 수 있습니다.

```
$affected = DB::table('users')
              ->where('id', 1)
              ->update(['votes' => 1]);
```

<a name="update-or-insert"></a>
#### Update Or Insert

때로는 DB에서 특정 조건을 만족하는 레코드가 있으면 업데이트하고, 없다면 새로 추가해야 할 때가 있습니다. 이럴 때는 `updateOrInsert` 메서드를 사용할 수 있습니다. 이 메서드는 두 개의 인수를 받는데, 첫 번째는 레코드를 찾을 조건을, 두 번째는 업데이트할 컬럼과 값의 배열입니다.

`updateOrInsert`는 첫 번째 조건에 맞는 레코드를 찾으려고 시도합니다. 있으면 두 번째 인수의 값으로 업데이트하고, 없으면 두 인수를 합친 속성으로 새 레코드를 추가합니다.

```
DB::table('users')
    ->updateOrInsert(
        ['email' => 'john@example.com', 'name' => 'John'],
        ['votes' => '2']
    );
```

<a name="updating-json-columns"></a>
### JSON 컬럼 업데이트

JSON 컬럼을 업데이트할 때는 `->` 표기법을 사용하여 JSON 객체 안의 특정 키를 업데이트할 수 있습니다. 이 기능은 MySQL 5.7+ 또는 PostgreSQL 9.5+에서 지원합니다.

```
$affected = DB::table('users')
              ->where('id', 1)
              ->update(['options->enabled' => true]);
```

<a name="increment-and-decrement"></a>
### 증가(Increment) 및 감소(Decrement)

쿼리 빌더는 지정한 컬럼의 값을 증가시키거나 감소시키는 메서드도 제공합니다. 이 두 메서드는 최소한 하나의 인수(대상 컬럼명)를 받으며, 두 번째 인수로 값의 증가 또는 감소량을 지정할 수 있습니다.

```
DB::table('users')->increment('votes');

DB::table('users')->increment('votes', 5);

DB::table('users')->decrement('votes');

DB::table('users')->decrement('votes', 5);
```

필요하다면, 증가 또는 감소 연산과 동시에 추가적으로 다른 컬럼도 수정할 수 있습니다.

```
DB::table('users')->increment('votes', 1, ['name' => 'John']);
```

또한 `incrementEach`와 `decrementEach` 메서드를 이용하여 여러 컬럼을 한 번에 증가 또는 감소시킬 수 있습니다.

```
DB::table('users')->incrementEach([
    'votes' => 5,
    'balance' => 100,
]);
```

<a name="delete-statements"></a>

## 삭제(DELETE) 쿼리

쿼리 빌더의 `delete` 메서드는 테이블에서 레코드를 삭제할 때 사용할 수 있습니다. `delete` 메서드는 영향을 받은 행(row)의 개수를 반환합니다. `delete` 메서드를 호출하기 전에 "where" 절을 추가하여 삭제 대상을 제한할 수도 있습니다.

```
$deleted = DB::table('users')->delete();

$deleted = DB::table('users')->where('votes', '>', 100)->delete();
```

만약 전체 테이블의 모든 레코드를 삭제하고, 자동 증가 ID도 0으로 초기화하고 싶다면, `truncate` 메서드를 사용할 수 있습니다.

```
DB::table('users')->truncate();
```

<a name="table-truncation-and-postgresql"></a>
#### 테이블 트렁케이트 및 PostgreSQL

PostgreSQL 데이터베이스에서 트렁케이트(truncate) 작업을 수행하면, `CASCADE` 동작이 적용됩니다. 즉, 다른 테이블과 외래 키로 연관된 모든 레코드도 함께 삭제됩니다.

<a name="pessimistic-locking"></a>
## 비관적 잠금(Pessimistic Locking)

쿼리 빌더에는 `select` 문을 실행할 때 "비관적 잠금"을 적용할 수 있는 여러 메서드가 포함되어 있습니다. "공유 잠금(shared lock)"을 적용하여 쿼리를 실행하고자 한다면 `sharedLock` 메서드를 사용할 수 있습니다. 공유 잠금은 트랜잭션이 커밋될 때까지 선택된 행들이 수정되지 않도록 보호합니다.

```
DB::table('users')
        ->where('votes', '>', 100)
        ->sharedLock()
        ->get();
```

또는, `lockForUpdate` 메서드를 사용할 수도 있습니다. "for update" 잠금은 선택된 레코드가 수정되거나, 다른 트랜잭션에서 공유 잠금으로 선택되는 것을 모두 막아줍니다.

```
DB::table('users')
        ->where('votes', '>', 100)
        ->lockForUpdate()
        ->get();
```

<a name="debugging"></a>
## 디버깅

쿼리를 작성하는 동안, `dd` 및 `dump` 메서드를 사용해 현재 쿼리 바인딩과 SQL을 출력해 볼 수 있습니다. `dd` 메서드는 디버그 정보를 화면에 출력하고, 코드 실행을 즉시 중단합니다. 반면, `dump` 메서드는 디버그 정보만 출력하고 요청 처리는 계속 진행됩니다.

```
DB::table('users')->where('votes', '>', 100)->dd();

DB::table('users')->where('votes', '>', 100)->dump();
```