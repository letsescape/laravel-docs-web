# 데이터베이스: 페이지네이션 (Database: Pagination)

- [소개](#introduction)
- [기본 사용법](#basic-usage)
    - [쿼리 빌더 결과 페이지네이션](#paginating-query-builder-results)
    - [Eloquent 결과 페이지네이션](#paginating-eloquent-results)
    - [커서 페이지네이션](#cursor-pagination)
    - [페이지네이터 수동 생성](#manually-creating-a-paginator)
    - [페이지네이션 URL 커스터마이징](#customizing-pagination-urls)
- [페이지네이션 결과 표시](#displaying-pagination-results)
    - [페이지네이션 링크 창 조정](#adjusting-the-pagination-link-window)
    - [결과 JSON 변환](#converting-results-to-json)
- [페이지네이션 뷰 커스터마이징](#customizing-the-pagination-view)
    - [부트스트랩 사용](#using-bootstrap)
- [Paginator 및 LengthAwarePaginator 인스턴스 메서드](#paginator-instance-methods)
- [Cursor Paginator 인스턴스 메서드](#cursor-paginator-instance-methods)

<a name="introduction"></a>
## 소개

다른 프레임워크에서는 페이지네이션 기능을 구현하는 것이 번거롭고 복잡하게 느껴질 수 있습니다. 라라벨에서는 더 쉽고 직관적으로 페이지네이션을 이용할 수 있도록 설계되었습니다. 라라벨의 페이지네이터는 [쿼리 빌더](/docs/11.x/queries)나 [Eloquent ORM](/docs/11.x/eloquent)과 통합되어, 별도의 설정 없이도 데이터베이스 레코드를 간편하게 페이지네이션할 수 있습니다.

기본적으로 페이지네이터가 생성하는 HTML은 [Tailwind CSS 프레임워크](https://tailwindcss.com/)에 호환되도록 제공됩니다. 또한, 부트스트랩 기반의 페이지네이션도 지원합니다.

<a name="tailwind-jit"></a>
#### Tailwind JIT

라라벨 기본의 Tailwind 페이지네이션 뷰와 Tailwind JIT 엔진을 함께 사용한다면, 애플리케이션의 `tailwind.config.js` 파일의 `content` 항목에 라라벨 페이지네이션 뷰 경로가 포함되어 Tailwind 클래스가 제거되지 않도록 반드시 설정해야 합니다.

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

아이템을 페이지네이션하는 방법에는 여러 가지가 있습니다. 가장 간단한 방법은 [쿼리 빌더](/docs/11.x/queries)나 [Eloquent 쿼리](/docs/11.x/eloquent)에 `paginate` 메서드를 사용하는 것입니다. `paginate` 메서드는 현재 사용자가 보고 있는 페이지에 따라 쿼리의 "limit"과 "offset"을 자동으로 지정해줍니다. 기본적으로 현재 페이지는 HTTP 요청의 쿼리 스트링 중 `page` 인자의 값으로 감지됩니다. 이 값은 라라벨이 자동으로 인식하고, 페이지네이터가 생성하는 링크에도 자동으로 추가해줍니다.

이 예제에서는 `paginate` 메서드에 "한 페이지에 보여줄 항목 수"만 인수로 전달하면 됩니다. 아래 코드에서는 한 페이지에 `15`개 항목을 보여주도록 지정하였습니다.

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * 모든 애플리케이션 사용자 표시
     */
    public function index(): View
    {
        return view('user.index', [
            'users' => DB::table('users')->paginate(15)
        ]);
    }
}
```

<a name="simple-pagination"></a>
#### 단순 페이지네이션

`paginate` 메서드는 쿼리에서 검색된 전체 레코드 수를 먼저 카운트한 뒤, 해당 레코드를 데이터베이스에서 조회합니다. 이렇게 하는 이유는 전체 페이지 수를 알기 위함입니다. 하지만, 애플리케이션의 화면상에서 전체 페이지 수를 보여줄 필요가 없다면, 이 카운트 쿼리는 불필요합니다.

따라서, 단순히 "다음"과 "이전" 링크만 UI에 표시하고 싶을 때는, 보다 효율적으로 한 번의 쿼리만 실행하는 `simplePaginate` 메서드를 사용하면 됩니다.

```
$users = DB::table('users')->simplePaginate(15);
```

<a name="paginating-eloquent-results"></a>
### Eloquent 결과 페이지네이션

[Eloquent](/docs/11.x/eloquent) 쿼리에도 페이지네이션을 적용할 수 있습니다. 예를 들어, `App\Models\User` 모델을 페이지네이션 하면서 한 페이지에 15개씩 표시하도록 할 수 있습니다. 보시는 것처럼 쿼리 빌더와 almost 동일한 방법으로 사용할 수 있습니다.

```
use App\Models\User;

$users = User::paginate(15);
```

물론, 쿼리에 `where` 절 등 다른 조건을 지정한 뒤에 `paginate` 메서드를 호출해도 됩니다.

```
$users = User::where('votes', '>', 100)->paginate(15);
```

Eloquent 모델을 페이지네이션할 때도 `simplePaginate` 메서드를 사용할 수 있습니다.

```
$users = User::where('votes', '>', 100)->simplePaginate(15);
```

마찬가지로, Eloquent 모델에 커서 페이지네이션을 적용하려면 `cursorPaginate` 메서드를 사용할 수 있습니다.

```
$users = User::where('votes', '>', 100)->cursorPaginate(15);
```

<a name="multiple-paginator-instances-per-page"></a>
#### 한 화면에 여러 페이지네이터 사용하기

경우에 따라, 한 화면에 서로 다른 두 개의 페이지네이터를 한 번에 사용하고 싶을 때가 있습니다. 하지만, 두 인스턴스 모두 현재 페이지 번호를 `page` 쿼리 문자열 파라미터에 저장한다면 서로 충돌이 발생할 수 있습니다. 이러한 충돌을 방지하고자, `paginate`, `simplePaginate`, `cursorPaginate` 메서드의 세 번째 인수로 원하는 쿼리 문자열 파라미터명을 직접 지정할 수 있습니다.

```
use App\Models\User;

$users = User::where('votes', '>', 100)->paginate(
    $perPage = 15, $columns = ['*'], $pageName = 'users'
);
```

<a name="cursor-pagination"></a>
### 커서 페이지네이션

`paginate`와 `simplePaginate`는 SQL의 "offset" 절을 사용해 쿼리를 생성하지만, 커서 페이지네이션은 정렬된 컬럼의 값을 비교하는 "where" 절을 활용해 훨씬 효율적으로 데이터를 조회합니다. 이런 방식은 대용량 데이터셋이나 "무한 스크롤" UI에서 특히 뛰어난 성능을 보입니다.

일반적인 오프셋 기반 페이지네이션은 페이지 번호를 쿼리 스트링에 포함시키지만, 커서 기반 페이지네이션은 "커서" 문자열이 쿼리스트링으로 전달됩니다. 커서는 다음 페이지네이션 조회의 시작 위치 및 방향 정보를 담은 인코딩된 문자열입니다.

```nothing
http://localhost/users?cursor=eyJpZCI6MTUsIl9wb2ludHNUb05leHRJdGVtcyI6dHJ1ZX0
```

커서 기반 페이지네이터 인스턴스는 쿼리 빌더의 `cursorPaginate` 메서드로 생성할 수 있습니다. 이 메서드는 `Illuminate\Pagination\CursorPaginator` 인스턴스를 반환합니다.

```
$users = DB::table('users')->orderBy('id')->cursorPaginate(15);
```

커서 페이지네이터 인스턴스를 조회한 뒤에는 [`paginate`, `simplePaginate`와 마찬가지로 페이지네이션 결과](#displaying-pagination-results)를 표시할 수 있습니다. 인스턴스가 제공하는 다양한 메서드는 [커서 페이지네이터 인스턴스 메서드 문서](#cursor-paginator-instance-methods)에서 확인할 수 있습니다.

> [!WARNING]  
> 커서 페이지네이션을 사용하려면 쿼리에 반드시 "order by" 절이 포함되어야 합니다. 또한, 정렬에 사용되는 컬럼은 페이징할 테이블에 속한 컬럼이어야만 합니다.

<a name="cursor-vs-offset-pagination"></a>
#### 커서 페이지네이션 vs 오프셋 페이지네이션

오프셋 페이지네이션과 커서 페이지네이션의 차이를 이해하기 위해 아래 예시 SQL 쿼리를 비교해보겠습니다. 두 쿼리 모두 `users` 테이블을 `id`컬럼 기준으로 정렬한 후, 두 번째 페이지의 결과를 보여줍니다.

```sql
# 오프셋 페이지네이션 예시...
select * from users order by id asc limit 15 offset 15;

# 커서 페이지네이션 예시...
select * from users where id > 15 order by id asc limit 15;
```

커서 페이지네이션 쿼리는 오프셋 방식에 비해 다음과 같은 장점이 있습니다.

- 데이터가 많을수록 "order by" 컬럼에 인덱스가 있다면 훨씬 더 빠른 성능을 보여줍니다. "offset" 절은 해당 오프셋 이전의 모든 데이터를 일일이 스캔하기 때문입니다.
- 데이터에 잦은 쓰기가 발생할 경우, 오프셋 페이지네이션은 사용자가 보고 있는 페이지에 레코드가 추가 또는 삭제될 때 일부 데이터를 건너뛰거나 중복해서 표시할 수 있습니다.

하지만, 커서 페이지네이션에는 다음과 같은 제한사항도 존재합니다.

- `simplePaginate`와 마찬가지로, 커서 페이지네이션에서는 "다음"과 "이전" 링크만 생성할 수 있고, 페이지 번호가 있는 링크는 만들 수 없습니다.
- 정렬 기준으로 적어도 하나의 고유(unique) 컬럼 또는 컬럼 조합이 필요합니다. `null`이 포함된 컬럼은 지원하지 않습니다.
- "order by" 절에 쿼리 expression을 사용할 경우 별칭(alias)을 지정하고 "select" 절에도 반드시 포함시켜야 합니다.
- 파라미터가 포함된 쿼리 expression은 지원하지 않습니다.

<a name="manually-creating-a-paginator"></a>
### 페이지네이터 수동 생성

경우에 따라 이미 메모리에 로드되어 있는 배열 데이터로 직접 페이지네이터 인스턴스를 만들고 싶을 때도 있습니다. 이 경우, 필요에 따라 `Illuminate\Pagination\Paginator`, `Illuminate\Pagination\LengthAwarePaginator`, `Illuminate\Pagination\CursorPaginator` 중 하나를 직접 생성하면 됩니다.

`Paginator`와 `CursorPaginator`는 전체 레코드 개수를 알 필요가 없지만, 그렇기 때문에 마지막 페이지의 인덱스를 반환해주는 메서드는 제공하지 않습니다. 반면, `LengthAwarePaginator`는 거의 동일한 인수를 받지만, 전체 레코드 수를 반드시 전달해주어야 합니다.

요약하자면, `Paginator`는 쿼리 빌더의 `simplePaginate`와, `CursorPaginator`는 `cursorPaginate`와, `LengthAwarePaginator`는 `paginate`와 각각 대응됩니다.

> [!WARNING]  
> 페이지네이터 인스턴스를 수동으로 생성할 때는 결과 배열을 직접 "슬라이싱(slicing)"해서 전달해야 합니다. 슬라이싱 방법을 잘 모른다면 [array_slice](https://secure.php.net/manual/en/function.array-slice.php) PHP 함수를 참고하세요.

<a name="customizing-pagination-urls"></a>
### 페이지네이션 URL 커스터마이징

기본적으로 페이지네이터가 생성한 링크는 현재 요청의 URI를 그대로 사용합니다. 하지만, 페이지네이터의 `withPath` 메서드를 사용하면 페이지네이션 링크에 사용될 URI를 직접 지정할 수 있습니다. 예를 들어, 페이지네이터가 `http://example.com/admin/users?page=N`와 같은 링크를 생성하도록 하고 싶을 때는 `/admin/users`를 `withPath` 메서드에 전달하면 됩니다.

```
use App\Models\User;

Route::get('/users', function () {
    $users = User::paginate(15);

    $users->withPath('/admin/users');

    // ...
});
```

<a name="appending-query-string-values"></a>
#### 쿼리 문자열 값 추가하기

페이지네이션 링크의 쿼리 문자열에 값을 추가하고 싶다면 `appends` 메서드를 사용할 수 있습니다. 예를 들어, 모든 페이지네이션 링크에 `sort=votes` 가 추가되길 원한다면 아래와 같이 호출하면 됩니다.

```
use App\Models\User;

Route::get('/users', function () {
    $users = User::paginate(15);

    $users->appends(['sort' => 'votes']);

    // ...
});
```

만약 현재 요청의 쿼리 문자열 값을 모두 페이지네이션 링크에 추가하고 싶다면 `withQueryString` 메서드를 사용할 수 있습니다.

```
$users = User::paginate(15)->withQueryString();
```

<a name="appending-hash-fragments"></a>
#### 해시 프래그먼트 추가하기

페이지네이터가 생성한 URL에 "해시 프래그먼트"를 추가하고 싶다면 `fragment` 메서드를 사용할 수 있습니다. 예를 들어, 모든 페이지네이션 링크 끝에 `#users`를 붙이고 싶다면 다음과 같이 작성하면 됩니다.

```
$users = User::paginate(15)->fragment('users');
```

<a name="displaying-pagination-results"></a>
## 페이지네이션 결과 표시

`paginate` 메서드는 `Illuminate\Pagination\LengthAwarePaginator` 인스턴스를 반환하고, `simplePaginate`는 `Illuminate\Pagination\Paginator` 인스턴스를, `cursorPaginate`는 `Illuminate\Pagination\CursorPaginator` 인스턴스를 반환합니다.

이 객체들은 여러 헬퍼 메서드를 제공하며, 반복(iterable) 객체이기 때문에 배열처럼 루프를 돌릴 수도 있습니다. 즉, 결과를 간단히 표시하고 페이지 링크까지 렌더링하려면 [Blade](/docs/11.x/blade)에서 다음과 같이 사용할 수 있습니다.

```blade
<div class="container">
    @foreach ($users as $user)
        {{ $user->name }}
    @endforeach
</div>

{{ $users->links() }}
```

`links` 메서드는 결과 집합의 나머지 페이지로 이동할 수 있는 링크들을 렌더링합니다. 각 링크에는 올바른 `page` 쿼리 문자열 변수가 이미 포함되어 있습니다. 참고로, `links` 메서드가 생성하는 HTML은 [Tailwind CSS 프레임워크](https://tailwindcss.com)와 호환됩니다.

<a name="adjusting-the-pagination-link-window"></a>
### 페이지네이션 링크 창 조정

페이지네이터가 페이지네이션 링크를 표시할 때는, 현재 페이지 번호와 함께 그 앞뒤로 각각 3개씩의 링크가 기본적으로 표시됩니다. `onEachSide` 메서드를 사용하면 현재 페이지 주변의 슬라이딩 윈도우(중간 영역)에서 양쪽에 몇 개의 페이지 링크를 더 노출할지 제어할 수 있습니다.

```blade
{{ $users->onEachSide(5)->links() }}
```

<a name="converting-results-to-json"></a>
### 결과 JSON 변환

라라벨의 페이지네이터 클래스는 `Illuminate\Contracts\Support\Jsonable` 인터페이스를 구현하며, `toJson` 메서드를 제공합니다. 따라서 페이지네이션 결과를 아주 쉽게 JSON으로 변환할 수 있습니다. 또한, 라우트나 컨트롤러에서 페이지네이터 인스턴스를 반환하면 자동으로 JSON 데이터로 응답됩니다.

```
use App\Models\User;

Route::get('/users', function () {
    return User::paginate();
});
```

이때 반환되는 JSON에는 `total`, `current_page`, `last_page` 등 다양한 메타 정보가 포함됩니다. 실제 레코드들은 JSON의 `data` 키를 통해 조회할 수 있습니다. 아래는 라우트에서 페이지네이터 인스턴스를 반환했을 때 생성되는 JSON의 예시입니다.

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
## 페이지네이션 뷰 커스터마이징

기본적으로 페이지네이션 링크를 표시하는 뷰는 [Tailwind CSS](https://tailwindcss.com) 프레임워크와 호환되도록 제공됩니다. 하지만 Tailwind를 사용하지 않거나, 커스텀 뷰를 만들고 싶다면, `links` 메서드를 호출할 때 첫 번째 인수로 원하는 뷰 파일명을 지정할 수 있습니다.

```blade
{{ $paginator->links('view.name') }}

<!-- 뷰로 추가 데이터 전달하기 -->
{{ $paginator->links('view.name', ['foo' => 'bar']) }}
```

그러나, 페이지네이션 뷰를 커스터마이징하는 가장 쉬운 방법은 `vendor:publish` 명령어로 뷰 파일들을 프로젝트의 `resources/views/vendor` 디렉터리로 내보내는 것입니다.

```shell
php artisan vendor:publish --tag=laravel-pagination
```

이 명령어를 실행하면, 애플리케이션의 `resources/views/vendor/pagination` 디렉터리에 뷰 파일들이 생성됩니다. 이 중 `tailwind.blade.php` 파일이 기본 페이지네이션 뷰의 역할을 하므로, 파일을 수정해 HTML을 직접 커스터마이징할 수 있습니다.

만약 기본 페이지네이션 뷰 파일을 다른 파일로 지정하고 싶다면, `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 페이지네이터의 `defaultView` 및 `defaultSimpleView` 메서드를 호출하면 됩니다.

```
<?php

namespace App\Providers;

use Illuminate\Pagination\Paginator;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * 애플리케이션 서비스 부트스트랩
     */
    public function boot(): void
    {
        Paginator::defaultView('view-name');

        Paginator::defaultSimpleView('view-name');
    }
}
```

<a name="using-bootstrap"></a>
### 부트스트랩 사용

라라벨은 [Bootstrap CSS](https://getbootstrap.com/)로 만들어진 페이지네이션 뷰도 내장하고 있습니다. Tailwind 대신 이러한 부트스트랩 뷰를 사용하려면, `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 페이지네이터의 `useBootstrapFour` 또는 `useBootstrapFive` 메서드를 호출하면 됩니다.

```
use Illuminate\Pagination\Paginator;

/**
 * 애플리케이션 서비스 부트스트랩
 */
public function boot(): void
{
    Paginator::useBootstrapFive();
    Paginator::useBootstrapFour();
}
```

<a name="paginator-instance-methods"></a>
## Paginator / LengthAwarePaginator 인스턴스 메서드

각 페이지네이터 인스턴스는 아래와 같은 메서드를 통해 추가적인 페이지네이션 정보를 제공합니다.

<div class="overflow-auto">

| 메서드 | 설명 |
| --- | --- |
| `$paginator->count()` | 현재 페이지의 아이템 개수를 반환합니다. |
| `$paginator->currentPage()` | 현재 페이지 번호를 반환합니다. |
| `$paginator->firstItem()` | 결과 집합에서 첫 번째 아이템의 번호를 반환합니다. |
| `$paginator->getOptions()` | 페이지네이터 옵션을 반환합니다. |
| `$paginator->getUrlRange($start, $end)` | 지정한 범위의 페이지네이션 URL들을 생성합니다. |
| `$paginator->hasPages()` | 여러 페이지로 나누어질 만큼 충분한 아이템이 있는지 판별합니다. |
| `$paginator->hasMorePages()` | 데이터 저장소에 더 많은 아이템이 존재하는지 판별합니다. |
| `$paginator->items()` | 현재 페이지의 아이템들을 반환합니다. |
| `$paginator->lastItem()` | 결과 집합에서 마지막 아이템의 번호를 반환합니다. |
| `$paginator->lastPage()` | 마지막 페이지의 번호를 반환합니다. (`simplePaginate`에서는 사용 불가) |
| `$paginator->nextPageUrl()` | 다음 페이지의 URL을 반환합니다. |
| `$paginator->onFirstPage()` | 첫 페이지 여부를 판별합니다. |
| `$paginator->perPage()` | 한 페이지에 보여줄 아이템 수를 반환합니다. |
| `$paginator->previousPageUrl()` | 이전 페이지의 URL을 반환합니다. |
| `$paginator->total()` | 전체 일치하는 아이템의 개수를 반환합니다. (`simplePaginate`에서는 사용 불가) |
| `$paginator->url($page)` | 지정한 페이지 번호의 URL을 반환합니다. |
| `$paginator->getPageName()` | 페이지 정보를 저장하는 쿼리 문자열 변수명을 반환합니다. |
| `$paginator->setPageName($name)` | 페이지 정보를 저장하는 쿼리 문자열 변수명을 설정합니다. |
| `$paginator->through($callback)` | 각 아이템에 콜백을 적용해 변환합니다. |

</div>

<a name="cursor-paginator-instance-methods"></a>
## Cursor Paginator 인스턴스 메서드

Cursor 페이지네이터 인스턴스는 다음과 같은 메서드를 통해 추가적인 페이지네이션 정보를 제공합니다.

<div class="overflow-auto">

| 메서드                          | 설명                                                         |
| ------------------------------- | ------------------------------------------------------------ |
| `$paginator->count()`           | 현재 페이지의 아이템 개수를 반환합니다.                      |
| `$paginator->cursor()`          | 현재 커서 인스턴스를 반환합니다.                             |
| `$paginator->getOptions()`      | 페이지네이터 옵션을 반환합니다.                              |
| `$paginator->hasPages()`        | 여러 페이지로 나누어질 만큼 충분한 아이템이 있는지 판별합니다.|
| `$paginator->hasMorePages()`    | 데이터 저장소에 추가 아이템이 존재하는지 판별합니다.          |
| `$paginator->getCursorName()`   | 커서 정보를 저장하는 쿼리 문자열 변수명을 반환합니다.         |
| `$paginator->items()`           | 현재 페이지의 아이템들을 반환합니다.                          |
| `$paginator->nextCursor()`      | 다음 아이템 집합의 커서 인스턴스를 반환합니다.                |
| `$paginator->nextPageUrl()`     | 다음 페이지의 URL을 반환합니다.                               |
| `$paginator->onFirstPage()`     | 첫 페이지 여부를 판별합니다.                                  |
| `$paginator->onLastPage()`      | 마지막 페이지 여부를 판별합니다.                              |
| `$paginator->perPage()`         | 한 페이지에 보여줄 아이템 수를 반환합니다.                    |
| `$paginator->previousCursor()`  | 이전 아이템 집합의 커서 인스턴스를 반환합니다.                |
| `$paginator->previousPageUrl()` | 이전 페이지의 URL을 반환합니다.                               |
| `$paginator->setCursorName()`   | 커서 정보를 저장하는 쿼리 문자열 변수명을 설정합니다.         |
| `$paginator->url($cursor)`      | 지정한 커서 인스턴스의 URL을 반환합니다.                      |

</div>
