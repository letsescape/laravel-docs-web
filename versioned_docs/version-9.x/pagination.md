# 데이터베이스: 페이지네이션 (Database: Pagination)

- [소개](#introduction)
- [기본 사용법](#basic-usage)
    - [쿼리 빌더 결과 페이지네이션](#paginating-query-builder-results)
    - [Eloquent 결과 페이지네이션](#paginating-eloquent-results)
    - [커서 페이지네이션](#cursor-pagination)
    - [페이지네이터 수동 생성](#manually-creating-a-paginator)
    - [페이지네이션 URL 커스터마이즈](#customizing-pagination-urls)
- [페이지네이션 결과 표시](#displaying-pagination-results)
    - [페이지네이션 링크 윈도우 조정](#adjusting-the-pagination-link-window)
    - [결과를 JSON으로 변환하기](#converting-results-to-json)
- [페이지네이션 뷰 커스터마이즈](#customizing-the-pagination-view)
    - [Bootstrap 사용하기](#using-bootstrap)
- [Paginator 및 LengthAwarePaginator 인스턴스 메서드](#paginator-instance-methods)
- [Cursor Paginator 인스턴스 메서드](#cursor-paginator-instance-methods)

<a name="introduction"></a>
## 소개

다른 프레임워크에서는 페이지네이션 기능을 구현하는 것이 매우 번거로울 수 있습니다. 라라벨에서는 페이지네이션이 더 쉽고 편리하게 느껴지시길 바랍니다. 라라벨의 페이지네이터는 [쿼리 빌더](/docs/9.x/queries) 및 [Eloquent ORM](/docs/9.x/eloquent)에 통합되어 있으며, 별도의 설정 없이도 손쉽게 데이터베이스 레코드를 페이지 단위로 나눠 보여줄 수 있습니다.

기본적으로 페이지네이터가 생성하는 HTML은 [Tailwind CSS 프레임워크](https://tailwindcss.com/)와 호환됩니다. 다만, Bootstrap 기반의 페이지네이션도 지원합니다.

<a name="tailwind-jit"></a>
#### Tailwind JIT

라라벨의 기본 Tailwind 페이지네이션 뷰와 Tailwind의 JIT(Just-In-Time) 엔진을 함께 사용하는 경우, Tailwind 클래스가 삭제되지 않도록 애플리케이션의 `tailwind.config.js` 파일의 `content` 키에 라라벨의 페이지네이션 뷰 경로가 반드시 포함되어 있는지 확인해야 합니다.

```js
content: [
    './resources/**/*.blade.php',
    './resources/**/*.js',
    './resources/**/*.vue',
    './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
],
```

<a name="basic-usage"></a>
## 기본 사용법

<a name="paginating-query-builder-results"></a>
### 쿼리 빌더 결과 페이지네이션

아이템을 페이지네이션하는 방법에는 여러 가지가 있습니다. 가장 간단한 방법은 [쿼리 빌더](/docs/9.x/queries)나 [Eloquent 쿼리](/docs/9.x/eloquent)에 `paginate` 메서드를 사용하는 것입니다. `paginate` 메서드는 사용자가 보고 있는 현재 페이지 정보에 따라 쿼리의 "limit" 및 "offset"을 자동으로 설정합니다. 기본적으로 현재 페이지는 HTTP 요청의 쿼리스트링에서 `page` 인수의 값으로 감지됩니다. 이 값은 라라벨에서 자동으로 감지하며, 페이지네이터가 생성하는 링크에도 자동으로 삽입됩니다.

아래 예시에서는 `paginate` 메서드에 "한 페이지당 몇 개의 항목을 표시할지"를 나타내는 인수만 전달합니다. 여기서는 한 페이지에 `15`개 항목을 보여주도록 지정했습니다.

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    /**
     * Show all application users.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return view('user.index', [
            'users' => DB::table('users')->paginate(15)
        ]);
    }
}
```

<a name="simple-pagination"></a>
#### 단순 페이지네이션

`paginate` 메서드는 데이터베이스에 쿼리를 실행하기 전에, 조건에 일치하는 전체 레코드 개수를 먼저 계산합니다. 이렇게 하면 전체 페이지 수를 알 수 있습니다. 하지만, 만약 UI에서 전체 페이지 수를 보여줄 필요가 없다면, 이 추가 쿼리는 불필요할 수 있습니다.

따라서 애플리케이션의 UI에 단순히 "다음"과 "이전" 링크만 표시하면 된다면, 보다 효율적인 단일 쿼리를 수행하는 `simplePaginate` 메서드를 사용할 수 있습니다.

```
$users = DB::table('users')->simplePaginate(15);
```

<a name="paginating-eloquent-results"></a>
### Eloquent 결과 페이지네이션

[Eloquent](/docs/9.x/eloquent) 쿼리도 같은 방식으로 페이지네이션할 수 있습니다. 아래 예시에서는 `App\Models\User` 모델을 한 페이지에 15개씩, 페이지네이션하여 보여줍니다. 쿼리 빌더로 페이지네이션하는 것과 거의 동일한 문법을 따릅니다.

```
use App\Models\User;

$users = User::paginate(15);
```

물론, 쿼리에 `where` 등 다른 조건을 추가한 뒤에 `paginate` 메서드를 호출할 수도 있습니다.

```
$users = User::where('votes', '>', 100)->paginate(15);
```

Eloquent 모델을 페이지네이션할 때도 `simplePaginate` 메서드를 사용할 수 있습니다.

```
$users = User::where('votes', '>', 100)->simplePaginate(15);
```

마찬가지로, `cursorPaginate` 메서드를 사용해 Eloquent 모델에 커서 페이지네이션을 적용할 수도 있습니다.

```
$users = User::where('votes', '>', 100)->cursorPaginate(15);
```

<a name="multiple-paginator-instances-per-page"></a>
#### 한 화면에 여러 페이지네이터 인스턴스 사용

때로는 하나의 화면에서 서로 다른 두 개의 페이지네이션을 동시에 표시해야 할 수 있습니다. 이때 두 페이지네이터가 모두 `page` 쿼리스트링 파라미터를 사용한다면 충돌이 발생합니다. 이러한 상황에서는 `paginate`, `simplePaginate`, `cursorPaginate` 메서드의 세 번째 인수로 각 페이지네이터가 사용할 쿼리스트링 파라미터 이름을 지정해 충돌을 방지할 수 있습니다.

```
use App\Models\User;

$users = User::where('votes', '>', 100)->paginate(
    $perPage = 15, $columns = ['*'], $pageName = 'users'
);
```

<a name="cursor-pagination"></a>
### 커서 페이지네이션

`paginate`와 `simplePaginate`는 SQL의 "offset" 절을 사용하는 반면, 커서 페이지네이션은 쿼리에서 정렬된 컬럼의 값들을 반복적으로 비교하는 "where" 절을 만들어 데이터베이스 효율을 극대화합니다. 커서 페이지네이션은 특히 대용량 데이터셋이나 "무한 스크롤"과 같은 UI에 매우 적합합니다.

오프셋 기반 페이지네이션과 달리, 커서 기반 페이지네이션에서는 페이지네이터가 생성하는 URL 쿼리스트링에 "페이지 번호" 대신 "커서"라는 문자열이 들어갑니다. 이 커서란 다음 페이지네이션이 어디서부터 시작하면 될지, 또 어느 방향으로 페이지네이션해야 할지를 담고 있는 인코딩된 문자열입니다.

```nothing
http://localhost/users?cursor=eyJpZCI6MTUsIl9wb2ludHNUb05leHRJdGVtcyI6dHJ1ZX0
```

쿼리 빌더에서 `cursorPaginate` 메서드를 사용해 커서 기반 페이지네이터 인스턴스를 생성할 수 있습니다. 이 메서드는 `Illuminate\Pagination\CursorPaginator` 인스턴스를 반환합니다.

```
$users = DB::table('users')->orderBy('id')->cursorPaginate(15);
```

커서 페이지네이터 인스턴스를 얻었다면, `paginate` 및 `simplePaginate`와 마찬가지로 [페이지네이션 결과 표시](#displaying-pagination-results) 방식을 사용할 수 있습니다. 커서 페이지네이터의 더 많은 인스턴스 메서드들은 [커서 페이지네이터 인스턴스 메서드 문서](#cursor-paginator-instance-methods)에서 추가로 확인할 수 있습니다.

> [!WARNING]
> 커서 페이지네이션을 제대로 동작시키려면 쿼리에 반드시 "order by" 절이 포함되어야 합니다.

<a name="cursor-vs-offset-pagination"></a>
#### 커서 페이지네이션 vs. 오프셋 페이지네이션

오프셋 페이지네이션과 커서 페이지네이션의 차이를 이해하기 위해, 예시 SQL 쿼리를 살펴보겠습니다. 아래 두 쿼리는 모두 `users` 테이블을 `id`로 정렬한 뒤 "두 번째 페이지"의 결과를 보여줍니다.

```sql
# 오프셋 페이지네이션...
select * from users order by id asc limit 15 offset 15;

# 커서 페이지네이션...
select * from users where id > 15 order by id asc limit 15;
```

커서 페이지네이션 방식은 오프셋 방식에 비해 다음과 같은 장점이 있습니다.

- 데이터셋이 매우 클 경우, "order by" 컬럼에 인덱스가 걸려 있으면 커서 방식이 훨씬 더 뛰어난 성능을 보입니다. 반면 offset 방식은 이전의 모든 데이터를 한 번씩 훑고 넘어가기 때문입니다.
- 데이터가 자주 변경되는 환경(즉, insert 또는 delete가 자주 발생할 때)에서는, offset 페이지네이션은 레코드를 건너뛰거나 중복을 보여줄 수 있습니다.

하지만, 커서 페이지네이션에도 한계가 있습니다.

- `simplePaginate`처럼 커서 페이지네이션은 "다음" 또는 "이전" 링크만 지원하며, 페이지 번호로 직접 이동하는 링크는 생성할 수 없습니다.
- 정렬을 위해 반드시 하나 이상의 고유 컬럼, 또는 컬럼 조합이 필요합니다. null 값이 포함된 컬럼은 지원되지 않습니다.
- "order by" 절에 쿼리 식을 사용하는 경우, 반드시 별칭(alias)이 지정되고 "select" 절에도 그 컬럼이 추가되어야 지원됩니다.
- "order by" 절에 파라미터가 들어가는 쿼리 식은 지원되지 않습니다.

<a name="manually-creating-a-paginator"></a>
### 페이지네이터 수동 생성

어떤 경우에는, 이미 메모리에 배열로 가지고 있는 데이터를 직접 넘겨서 페이지네이션 인스턴스를 수동으로 생성하고 싶을 때가 있습니다. 이런 경우, 필요에 따라 `Illuminate\Pagination\Paginator`, `Illuminate\Pagination\LengthAwarePaginator`, 또는 `Illuminate\Pagination\CursorPaginator` 중 하나의 인스턴스를 직접 생성하면 됩니다.

`Paginator`와 `CursorPaginator` 클래스는 결과 집합의 전체 아이템 수를 알 필요가 없습니다. 대신, 이 클래스들은 마지막 페이지의 인덱스(location)는 구할 수 없습니다. 반면, `LengthAwarePaginator`는 `Paginator`와 거의 동일한 인자를 받지만, 전체 아이템 수를 반드시 인수로 넘겨주어야 합니다.

정리하자면 `Paginator`는 쿼리 빌더의 `simplePaginate`, `CursorPaginator`는 `cursorPaginate`, `LengthAwarePaginator`는 `paginate`와 대응된다고 볼 수 있습니다.

> [!WARNING]
> 페이지네이터 인스턴스를 수동으로 생성할 때는 반드시 페이지네이션 할 배열을 직접 "slice"해서 넘겨주어야 합니다. 만약 정확한 방법을 잘 모르겠다면, PHP의 [array_slice](https://secure.php.net/manual/en/function.array-slice.php) 함수를 참고하세요.

<a name="customizing-pagination-urls"></a>
### 페이지네이션 URL 커스터마이즈

기본적으로 페이지네이터가 생성하는 링크는 현재 요청의 URI와 동일하게 맞춰집니다. 하지만 페이지네이터의 `withPath` 메서드를 활용하면, 링크를 생성할 때 사용할 URI를 직접 지정할 수 있습니다. 예를 들어, 페이지네이터가 `http://example.com/admin/users?page=N`과 같은 링크를 만들길 원한다면, `withPath` 메서드에 `/admin/users`를 전달하면 됩니다.

```
use App\Models\User;

Route::get('/users', function () {
    $users = User::paginate(15);

    $users->withPath('/admin/users');

    //
});
```

<a name="appending-query-string-values"></a>
#### 쿼리스트링 값 추가하기

페이지네이션 링크의 쿼리스트링 끝에 값을 추가할 때는 `appends` 메서드를 사용합니다. 예를 들어, 모든 페이지네이션 링크에 `sort=votes`를 추가하고 싶다면, 아래와 같이 `appends`를 사용하면 됩니다.

```
use App\Models\User;

Route::get('/users', function () {
    $users = User::paginate(15);

    $users->appends(['sort' => 'votes']);

    //
});
```

만약 현재 요청의 모든 쿼리스트링 값을 페이지네이션 링크에 자동으로 추가하고 싶으면, `withQueryString` 메서드를 사용할 수 있습니다.

```
$users = User::paginate(15)->withQueryString();
```

<a name="appending-hash-fragments"></a>
#### 해시 프래그먼트 추가하기

페이지네이터가 생성하는 각 링크에 "해시 프래그먼트"를 추가해야 할 경우에는 `fragment` 메서드를 사용할 수 있습니다. 예시로, 모든 페이지네이션 링크 끝에 `#users`를 붙이려면 다음과 같이 작성합니다.

```
$users = User::paginate(15)->fragment('users');
```

<a name="displaying-pagination-results"></a>
## 페이지네이션 결과 표시

`paginate` 메서드를 사용하면 `Illuminate\Pagination\LengthAwarePaginator` 인스턴스를, `simplePaginate`는 `Illuminate\Pagination\Paginator` 인스턴스를, 그리고 `cursorPaginate`는 `Illuminate\Pagination\CursorPaginator` 인스턴스를 반환합니다.

이 객체들은 결과셋의 여러가지 정보를 조회하는 다양한 메서드를 제공합니다. 또한 페이지네이터 인스턴스는 반복자(iterator)이기 때문에 배열처럼 반복문으로 순회할 수 있습니다. 결과를 받아온 후에는 [Blade](/docs/9.x/blade)를 사용해 결과를 출력하고 페이지 링크를 렌더링할 수 있습니다.

```blade
<div class="container">
    @foreach ($users as $user)
        {{ $user->name }}
    @endforeach
</div>

{{ $users->links() }}
```

`links` 메서드는 결과 집합의 나머지 페이지로 이동할 수 있는 링크들을 렌더링합니다. 각각의 링크에는 올바른 `page` 쿼리스트링 변수가 이미 담겨 있습니다. 참고로, `links` 메서드가 만들어내는 HTML은 [Tailwind CSS 프레임워크](https://tailwindcss.com)와 호환됩니다.

<a name="adjusting-the-pagination-link-window"></a>
### 페이지네이션 링크 윈도우 조정

페이지네이터가 페이지 링크를 표시할 때, 현재 페이지 번호와 함께 앞뒤 각각 3개의 추가 링크가 기본적으로 표시됩니다. `onEachSide` 메서드를 사용하면, 현재 페이지 기준으로 양쪽에 몇 개의 추가 링크를 보여줄지 조정할 수 있습니다.

```blade
{{ $users->onEachSide(5)->links() }}
```

<a name="converting-results-to-json"></a>
### 결과를 JSON으로 변환하기

라라벨의 페이지네이터 클래스들은 `Illuminate\Contracts\Support\Jsonable` 인터페이스를 구현하고 있어, `toJson` 메서드로 쉽게 페이지네이션 결과를 JSON으로 변환할 수 있습니다. 또한, 페이지네이터 인스턴스를 라우트나 컨트롤러에서 반환하게 되면 자동으로 JSON으로 전환됩니다.

```
use App\Models\User;

Route::get('/users', function () {
    return User::paginate();
});
```

페이지네이터가 반환하는 JSON은 `total`, `current_page`, `last_page` 등 메타 정보도 함께 담고 있습니다. 실제 결과 레코드들은 JSON 배열의 `data` 키 아래에 위치합니다. 아래는 라우트에서 페이지네이터 인스턴스를 반환했을 때 생성되는 JSON 예시입니다.

```
{
   "total": 50,
   "per_page": 15,
   "current_page": 1,
   "last_page": 4,
   "first_page_url": "http://laravel.app?page=1",
   "last_page_url": "http://laravel.app?page=4",
   "next_page_url": "http://laravel.app?page=2",
   "prev_page_url": null,
   "path": "http://laravel.app",
   "from": 1,
   "to": 15,
   "data":[
        {
            // Record...
        },
        {
            // Record...
        }
   ]
}
```

<a name="customizing-the-pagination-view"></a>
## 페이지네이션 뷰 커스터마이즈

기본적으로 페이지네이션 링크를 표시하는 뷰는 [Tailwind CSS](https://tailwindcss.com) 프레임워크와 호환되도록 설계되어 있습니다. 하지만 Tailwind를 사용하지 않는 경우, 직접 만든 뷰 파일로 링크를 렌더링하도록 뷰 이름을 지정할 수 있습니다. 페이지네이터 인스턴스의 `links` 메서드에 뷰 이름을 첫 번째 인수로 전달하면 됩니다.

```blade
{{ $paginator->links('view.name') }}

<!-- 뷰로 추가 데이터를 넘기려면... -->
{{ $paginator->links('view.name', ['foo' => 'bar']) }}
```

하지만 페이지네이션 뷰를 커스터마이즈하는 가장 쉬운 방법은, `vendor:publish` 명령어로 기본 페이지네이션 뷰 파일을 `resources/views/vendor` 디렉터리 아래로 복사하는 것입니다.

```shell
php artisan vendor:publish --tag=laravel-pagination
```

이 명령은 애플리케이션의 `resources/views/vendor/pagination` 디렉터리에 뷰 파일들을 복사합니다. 이 디렉터리의 `tailwind.blade.php` 파일이 기본 페이지네이션 뷰입니다. 이 파일을 원하는 대로 수정해 페이지네이션 HTML을 바꿀 수 있습니다.

기본적으로 사용할 페이지네이션 뷰 파일을 바꾸고 싶다면, `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 페이지네이터의 `defaultView`와 `defaultSimpleView` 메서드를 호출해 지정할 수 있습니다.

```
<?php

namespace App\Providers;

use Illuminate\Pagination\Paginator;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        Paginator::defaultView('view-name');

        Paginator::defaultSimpleView('view-name');
    }
}
```

<a name="using-bootstrap"></a>
### Bootstrap 사용하기

라라벨에는 [Bootstrap CSS](https://getbootstrap.com/)를 기반으로 만든 페이지네이션 뷰도 포함되어 있습니다. 기본 Tailwind 뷰 대신 이를 사용하려면, `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 페이지네이터의 `useBootstrapFour` 또는 `useBootstrapFive` 메서드를 호출하면 됩니다.

```
use Illuminate\Pagination\Paginator;

/**
 * Bootstrap any application services.
 *
 * @return void
 */
public function boot()
{
    Paginator::useBootstrapFive();
    Paginator::useBootstrapFour();
}
```

<a name="paginator-instance-methods"></a>
## Paginator / LengthAwarePaginator 인스턴스 메서드

각 페이지네이터 인스턴스는 다음과 같은 메서드들을 통해 추가적인 페이지네이션 정보를 제공합니다.

메서드  |  설명
-------  |  -----------
`$paginator->count()`  |  현재 페이지에 포함된 아이템 개수를 반환합니다.
`$paginator->currentPage()`  |  현재 페이지 번호를 반환합니다.
`$paginator->firstItem()`  |  결과셋에서 첫 번째 아이템의 번호(인덱스)를 반환합니다.
`$paginator->getOptions()`  |  페이지네이터의 옵션들을 반환합니다.
`$paginator->getUrlRange($start, $end)`  |  지정한 범위의 페이지에 대한 URL들을 생성합니다.
`$paginator->hasPages()`  |  여러 페이지로 나눠질 만큼 충분한 데이터가 있는지 확인합니다.
`$paginator->hasMorePages()`  |  아직 더 보여줄 수 있는 데이터가 남았는지 확인합니다.
`$paginator->items()`  |  현재 페이지에 포함된 아이템들을 반환합니다.
`$paginator->lastItem()`  |  결과셋에서 마지막 아이템의 번호(인덱스)를 반환합니다.
`$paginator->lastPage()`  |  마지막 페이지의 번호를 반환합니다. (`simplePaginate` 사용 시에는 제공되지 않습니다.)
`$paginator->nextPageUrl()`  |  다음 페이지의 URL을 반환합니다.
`$paginator->onFirstPage()`  |  현재 페이지가 첫 번째 페이지인지 확인합니다.
`$paginator->perPage()`  |  페이지당 표시할 아이템 개수를 반환합니다.
`$paginator->previousPageUrl()`  |  이전 페이지의 URL을 반환합니다.
`$paginator->total()`  |  전체 매칭되는 아이템 수를 반환합니다. (`simplePaginate` 사용 시에는 제공되지 않습니다.)
`$paginator->url($page)`  |  주어진 페이지 번호에 대한 URL을 반환합니다.
`$paginator->getPageName()`  |  페이지 정보를 저장하는 쿼리스트링 변수 이름을 반환합니다.
`$paginator->setPageName($name)`  |  페이지 정보를 저장하는 쿼리스트링 변수 이름을 지정합니다.

<a name="cursor-paginator-instance-methods"></a>
## Cursor Paginator 인스턴스 메서드

각 커서 페이지네이터 인스턴스는 다음과 같은 메서드로 추가적인 페이지네이션 정보를 제공합니다.

메서드  |  설명
-------  |  -----------
`$paginator->count()`  |  현재 페이지에 포함된 아이템 개수를 반환합니다.
`$paginator->cursor()`  |  현재 커서 인스턴스를 반환합니다.
`$paginator->getOptions()`  |  페이지네이터의 옵션들을 반환합니다.
`$paginator->hasPages()`  |  여러 페이지로 나눠질 만큼 충분한 데이터가 있는지 확인합니다.
`$paginator->hasMorePages()`  |  아직 더 보여줄 수 있는 데이터가 남았는지 확인합니다.
`$paginator->getCursorName()`  |  커서 정보를 저장하는 쿼리스트링 변수 이름을 반환합니다.
`$paginator->items()`  |  현재 페이지에 포함된 아이템들을 반환합니다.
`$paginator->nextCursor()`  |  다음 데이터 집합의 커서 인스턴스를 반환합니다.
`$paginator->nextPageUrl()`  |  다음 페이지의 URL을 반환합니다.
`$paginator->onFirstPage()`  |  현재 페이지가 첫 번째 페이지인지 확인합니다.
`$paginator->onLastPage()`  |  현재 페이지가 마지막 페이지인지 확인합니다.
`$paginator->perPage()`  |  페이지당 표시할 아이템 개수를 반환합니다.
`$paginator->previousCursor()`  |  이전 데이터 집합의 커서 인스턴스를 반환합니다.
`$paginator->previousPageUrl()`  |  이전 페이지의 URL을 반환합니다.
`$paginator->setCursorName()`  |  커서 정보를 저장하는 쿼리스트링 변수 이름을 지정합니다.
`$paginator->url($cursor)`  |  특정 커서 인스턴스에 대한 URL을 반환합니다.
