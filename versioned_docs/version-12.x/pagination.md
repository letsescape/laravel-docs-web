# 데이터베이스: 페이지네이션 (Database: Pagination)

- [소개](#introduction)
- [기본 사용법](#basic-usage)
    - [쿼리 빌더 결과 페이지네이션](#paginating-query-builder-results)
    - [Eloquent 결과 페이지네이션](#paginating-eloquent-results)
    - [커서 페이지네이션](#cursor-pagination)
    - [페이지네이터 인스턴스 수동 생성](#manually-creating-a-paginator)
    - [페이지네이션 URL 커스터마이징](#customizing-pagination-urls)
- [페이지네이션 결과 출력](#displaying-pagination-results)
    - [페이지네이션 링크 윈도우 조정](#adjusting-the-pagination-link-window)
    - [결과를 JSON으로 변환하기](#converting-results-to-json)
- [페이지네이션 뷰 커스터마이징](#customizing-the-pagination-view)
    - [Bootstrap 사용하기](#using-bootstrap)
- [Paginator 및 LengthAwarePaginator 인스턴스 메서드](#paginator-instance-methods)
- [CursorPaginator 인스턴스 메서드](#cursor-paginator-instance-methods)

<a name="introduction"></a>
## 소개

다른 프레임워크에서 페이지네이션을 구현하는 일은 매우 번거로울 수 있습니다. 라라벨의 페이지네이션 방식이 여러분에게 신선한 경험이 되길 바랍니다. 라라벨의 페이지네이터는 [쿼리 빌더](/docs/queries)와 [Eloquent ORM](/docs/eloquent)에 통합되어 있으며, 별도의 설정 없이도 데이터베이스 레코드의 편리하고 간단한 페이지네이션 기능을 제공합니다.

기본적으로 페이지네이터가 생성하는 HTML은 [Tailwind CSS 프레임워크](https://tailwindcss.com/)와 호환됩니다. 하지만, Bootstrap 기반 페이지네이션도 지원됩니다.

<a name="tailwind"></a>
#### Tailwind

라라벨의 기본 Tailwind 페이지네이션 뷰를 Tailwind 4.x와 함께 사용하는 경우, 애플리케이션의 `resources/css/app.css` 파일이 이미 라라벨의 페이지네이션 뷰를 `@source`로 올바르게 설정하도록 구성되어 있습니다:

```css
@import 'tailwindcss';

@source '../../vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php';
```

<a name="basic-usage"></a>
## 기본 사용법

<a name="paginating-query-builder-results"></a>
### 쿼리 빌더 결과 페이지네이션

아이템을 페이지네이트하는 방법에는 여러 가지가 있습니다. 가장 간단한 방법은 [쿼리 빌더](/docs/queries)나 [Eloquent 쿼리](/docs/eloquent)에서 `paginate` 메서드를 사용하는 것입니다. `paginate` 메서드는 사용자가 보고 있는 현재 페이지에 따라 쿼리의 "limit"과 "offset"을 자동으로 설정합니다. 기본적으로, 현재 페이지는 HTTP 요청의 `page` 쿼리 문자열 인수의 값으로 감지되며, 라라벨이 이 값을 자동으로 읽어 들이고, 페이지네이터가 생성하는 링크에도 자동으로 추가됩니다.

아래 예시에서는 `paginate` 메서드에 "한 페이지당 보여줄 아이템의 개수"만 인수로 전달합니다. 이번에는 한 페이지에 `15`개의 아이템을 출력하도록 지정해 보겠습니다:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * Show all application users.
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

`paginate` 메서드는 쿼리로 매칭되는 레코드의 총 개수를 데이터베이스에서 조회한 뒤, 해당 레코드를 가져옵니다. 이는 페이지네이터가 전체 페이지 수를 알 수 있도록 하기 위함입니다. 그러나, 만약 UI에서 전체 페이지 수를 표시할 필요가 없다면 굳이 총 레코드 개수를 조회할 필요가 없습니다.

따라서, UI에 단순하게 "다음"과 "이전" 링크만 보여주고 싶다면 `simplePaginate` 메서드를 사용하여 더 효율적으로 쿼리를 수행할 수 있습니다:

```php
$users = DB::table('users')->simplePaginate(15);
```

<a name="paginating-eloquent-results"></a>
### Eloquent 결과 페이지네이션

[Eloquent](/docs/eloquent) 쿼리도 페이지네이터를 활용할 수 있습니다. 다음 예시에서는 `App\Models\User` 모델의 레코드를 페이지네이션하며, 한 페이지에 15개의 레코드를 보여주도록 설정합니다. 쿼리 빌더 결과를 페이지네이션하는 방식과 거의 동일한 문법으로 사용할 수 있습니다:

```php
use App\Models\User;

$users = User::paginate(15);
```

물론, `where` 절 등 추가적인 쿼리 조건을 지정한 후에 `paginate` 메서드를 호출할 수도 있습니다:

```php
$users = User::where('votes', '>', 100)->paginate(15);
```

Eloquent 모델을 페이지네이션할 때도 `simplePaginate` 메서드를 사용할 수 있습니다:

```php
$users = User::where('votes', '>', 100)->simplePaginate(15);
```

마찬가지로, `cursorPaginate` 메서드를 사용하여 Eloquent 모델에서 커서 기반 페이지네이션을 적용할 수 있습니다:

```php
$users = User::where('votes', '>', 100)->cursorPaginate(15);
```

<a name="multiple-paginator-instances-per-page"></a>
#### 한 화면에 여러 페이지네이터 인스턴스 사용

때로는 하나의 화면(페이지)에 서로 다른 두 개의 페이지네이터를 따로 렌더링해야 할 수 있습니다. 그런데 두 페이지네이터가 모두 `page` 쿼리 문자열 파라미터를 사용하게 되면, 각각의 현재 페이지가 혼동되어 겹치는 문제가 발생할 수 있습니다. 이 경우, `paginate`, `simplePaginate`, `cursorPaginate` 메서드의 세 번째 인자에 원하는 쿼리 문자열 파라미터명을 직접 지정해 충돌을 해결할 수 있습니다:

```php
use App\Models\User;

$users = User::where('votes', '>', 100)->paginate(
    $perPage = 15, $columns = ['*'], $pageName = 'users'
);
```

<a name="cursor-pagination"></a>
### 커서 페이지네이션

`paginate`와 `simplePaginate`는 SQL의 "offset" 절을 이용하여 쿼리를 만듭니다. 반면 커서 기반 페이지네이션은 쿼리에서 정렬된 컬럼의 값을 비교하는 "where" 절을 조합하여 동작하므로, 라라벨의 모든 페이지네이션 방식 중 가장 효율적인 데이터베이스 성능을 보여줍니다. 커서 페이지네이션은 특히 대용량 데이터셋이나 "무한 스크롤" UI에 적합합니다.

오프셋 기반 페이지네이션은 생성되는 URL의 쿼리 문자열에 페이지 번호를 포함시키지만, 커서 기반 페이지네이션은 쿼리 문자열에 "cursor"라는 인코딩된 문자열을 포함시킵니다. 커서는 다음 페이지네이션 쿼리가 어디서부터 시작되어야 하는지, 어떤 방향으로 페이지를 이동해야 하는지에 대한 정보를 담고 있습니다:

```text
http://localhost/users?cursor=eyJpZCI6MTUsIl9wb2ludHNUb05leHRJdGVtcyI6dHJ1ZX0
```

쿼리 빌더에서 `cursorPaginate` 메서드를 사용하면 커서 기반 페이지네이터 인스턴스를 만들 수 있습니다. 이 메서드는 `Illuminate\Pagination\CursorPaginator` 인스턴스를 반환합니다:

```php
$users = DB::table('users')->orderBy('id')->cursorPaginate(15);
```

커서 페이지네이터 인스턴스를 가져온 후에는, 일반적인 `paginate` 및 `simplePaginate`와 동일하게 [페이지네이션 결과를 출력](#displaying-pagination-results)할 수 있습니다. 커서 페이지네이터가 제공하는 인스턴스 메서드에 대해서는 [커서 페이지네이터 인스턴스 메서드 문서](#cursor-paginator-instance-methods)를 참고하세요.

> [!WARNING]
> 커서 페이지네이션을 사용하려면 쿼리에 반드시 "order by" 절이 포함되어 있어야 합니다. 또한, 쿼리에서 정렬하는 컬럼들은 반드시 페이지네이션 대상 테이블에 속해야 합니다.

<a name="cursor-vs-offset-pagination"></a>
#### 커서 페이지네이션과 오프셋 페이지네이션 비교

오프셋 페이지네이션과 커서 페이지네이션의 차이를 예시 SQL 쿼리로 설명합니다. 아래 두 쿼리는 모두 `id`로 정렬된 `users` 테이블에서 "두 번째 페이지"의 결과를 출력합니다:

```sql
# 오프셋 페이지네이션...
select * from users order by id asc limit 15 offset 15;

# 커서 페이지네이션...
select * from users where id > 15 order by id asc limit 15;
```

커서 페이지네이션이 오프셋 방식에 비해 제공하는 주요 장점은 다음과 같습니다:

- 대용량 데이터셋에서는 "order by" 컬럼에 인덱스가 있을 경우 커서 페이지네이션이 훨씬 빠르게 동작합니다. 이는 "offset" 절이 이전의 모든 데이터를 반복적으로 탐색하기 때문입니다.
- 데이터가 자주 변경(추가/삭제)되는 환경에서는, 오프셋 페이지네이션은 사용자가 보고 있는 페이지에서 레코드가 새로 추가되거나 삭제된 경우 일부 레코드를 건너뛰거나 중복해서 보여줄 수 있습니다.

하지만, 커서 페이지네이션에는 아래와 같은 제약사항도 있습니다:

- `simplePaginate`처럼, 커서 페이지네이션도 "다음"과 "이전" 링크만 생성할 수 있으며, 페이지 번호가 포함된 링크는 지원하지 않습니다.
- 정렬 기준이 반드시 유일한 컬럼 한 개 또는 유일한 컬럼 조합이어야 합니다. `null` 값이 포함된 컬럼은 지원되지 않습니다.
- "order by" 절에 쿼리 식(expression)을 사용할 수 있으나, 별칭을 지정하고 "select" 절에도 추가해야 합니다.
- 파라미터를 가진 쿼리 식(expression)은 지원하지 않습니다.

<a name="manually-creating-a-paginator"></a>
### 페이지네이터 인스턴스 수동 생성

이미 메모리에 존재하는 아이템 배열로 직접 페이지네이션 인스턴스를 만들어야 하는 경우가 있습니다. 필요에 따라 `Illuminate\Pagination\Paginator`, `Illuminate\Pagination\LengthAwarePaginator`, `Illuminate\Pagination\CursorPaginator` 중 하나의 인스턴스를 직접 생성할 수 있습니다.

`Paginator`와 `CursorPaginator` 클래스는 결과 집합의 전체 아이템 개수를 알 필요가 없습니다. 하지만 이러한 이유로, 이 클래스들은 마지막 페이지의 인덱스를 반환하는 메서드를 가지고 있지 않습니다. `LengthAwarePaginator`는 거의 동일한 인자를 받지만, 전체 아이템 개수(count)를 반드시 전달해야 합니다.

즉, `Paginator`는 쿼리 빌더의 `simplePaginate`와, `CursorPaginator`는 `cursorPaginate`와, 그리고 `LengthAwarePaginator`는 `paginate` 메서드와 각각 매칭됩니다.

> [!WARNING]
> 페이지네이터 인스턴스를 직접 생성할 때는, paginator에 전달할 결과 배열을 직접 "슬라이싱(slicing)" 해야 합니다. 방법이 궁금하다면 [array_slice](https://secure.php.net/manual/en/function.array-slice.php) PHP 함수 문서를 참고하세요.

<a name="customizing-pagination-urls"></a>
### 페이지네이션 URL 커스터마이징

기본적으로 페이지네이터가 생성하는 링크는 현재 요청의 URI를 그대로 사용합니다. 하지만, 페이지네이터의 `withPath` 메서드를 사용하면 링크 생성 시 사용할 URI를 수정할 수 있습니다. 예를 들어, 페이지네이터가 `http://example.com/admin/users?page=N` 형태의 링크를 생성하도록 하려면, `withPath` 메서드에 `/admin/users`를 전달하면 됩니다:

```php
use App\Models\User;

Route::get('/users', function () {
    $users = User::paginate(15);

    $users->withPath('/admin/users');

    // ...
});
```

<a name="appending-query-string-values"></a>
#### 쿼리 문자열 값 추가

페이지네이션 링크의 쿼리 문자열에 파라미터를 추가하려면 `appends` 메서드를 사용하면 됩니다. 예를 들어, 모든 페이지네이션 링크에 `sort=votes`를 추가하려면 다음과 같이 `appends`를 호출하면 됩니다:

```php
use App\Models\User;

Route::get('/users', function () {
    $users = User::paginate(15);

    $users->appends(['sort' => 'votes']);

    // ...
});
```

현재 요청의 모든 쿼리 문자열 값을 페이지네이션 링크에 추가하고 싶다면 `withQueryString` 메서드를 사용하면 됩니다:

```php
$users = User::paginate(15)->withQueryString();
```

<a name="appending-hash-fragments"></a>
#### 해시 프래그먼트 추가

페이지네이터가 생성하는 URL 끝에 "해시 프래그먼트"를 추가하려면 `fragment` 메서드를 사용할 수 있습니다. 예를 들어, 모든 페이지네이션 링크 끝에 `#users`를 붙이려면 다음처럼 작성합니다:

```php
$users = User::paginate(15)->fragment('users');
```

<a name="displaying-pagination-results"></a>
## 페이지네이션 결과 출력

`paginate` 메서드를 호출하면 `Illuminate\Pagination\LengthAwarePaginator` 인스턴스를, `simplePaginate` 메서드를 사용할 경우에는 `Illuminate\Pagination\Paginator` 인스턴스를 받게 됩니다. 마지막으로, `cursorPaginate` 메서드를 호출하면 `Illuminate\Pagination\CursorPaginator` 인스턴스를 얻게 됩니다.

이 객체들은 결과 집합에 대한 여러 메서드를 제공합니다. 또한, 페이지네이터 인스턴스는 반복자(iterator)이기 때문에 배열처럼 반복문으로 순회할 수 있습니다. 따라서 결과를 가져온 뒤, [Blade](/docs/blade)를 사용하여 결과와 페이지 링크를 쉽게 출력할 수 있습니다:

```blade
<div class="container">
    @foreach ($users as $user)
        {{ $user->name }}
    @endforeach
</div>

{{ $users->links() }}
```

`links` 메서드는 결과 집합의 나머지 페이지들로 이동할 수 있는 링크들을 렌더링합니다. 각각의 링크에는 이미 올바른 `page` 쿼리 문자열 변수가 포함되어 있습니다. 참고로, `links` 메서드가 생성하는 HTML은 [Tailwind CSS 프레임워크](https://tailwindcss.com)와 호환됩니다.

<a name="adjusting-the-pagination-link-window"></a>
### 페이지네이션 링크 윈도우 조정

페이지네이터가 페이지네이션 링크를 출력할 때, 현재 페이지 번호와 함께 이전/다음 세 페이지의 링크도 기본적으로 표시됩니다. `onEachSide` 메서드를 사용하면, 현재 페이지 양옆으로 몇 개의 추가 링크를 표시할지 수치를 직접 지정할 수 있습니다:

```blade
{{ $users->onEachSide(5)->links() }}
```

<a name="converting-results-to-json"></a>
### 결과를 JSON으로 변환하기

라라벨 페이지네이터 클래스들은 `Illuminate\Contracts\Support\Jsonable` 인터페이스를 구현하고 있으며, `toJson` 메서드를 제공합니다. 따라서 페이지네이션 결과를 매우 쉽게 JSON으로 변환할 수 있습니다. 라우트나 컨트롤러 액션에서 페이지네이터 인스턴스를 반환하면 자동으로 JSON으로 변환됩니다:

```php
use App\Models\User;

Route::get('/users', function () {
    return User::paginate();
});
```

페이지네이터가 반환하는 JSON에는 `total`, `current_page`, `last_page` 등과 같은 메타 정보가 포함됩니다. 실제 결과 레코드는 JSON 배열에서 `data` 키 아래에 저장되어 있습니다. 아래는 라우트에서 페이지네이터 인스턴스를 반환하여 생성되는 JSON 예시입니다:

```json
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

기본적으로, 페이지네이션 링크를 출력하는 뷰는 [Tailwind CSS](https://tailwindcss.com) 프레임워크와 호환되도록 만들어져 있습니다. 하지만 Tailwind를 사용하지 않는다면, 페이지네이션 링크를 렌더링할 커스텀 뷰를 직접 지정할 수 있습니다. 페이지네이터 인스턴스의 `links` 메서드에 첫 번째 인자로 뷰 이름을 넘기면 됩니다:

```blade
{{ $paginator->links('view.name') }}

<!-- 뷰에 추가 데이터를 전달하는 경우... -->
{{ $paginator->links('view.name', ['foo' => 'bar']) }}
```

하지만 가장 쉬운 커스터마이징 방법은, `vendor:publish` 명령어를 사용하여 페이지네이션 뷰를 `resources/views/vendor` 디렉터리로 내보내 직접 수정하는 것입니다:

```shell
php artisan vendor:publish --tag=laravel-pagination
```

이 명령을 실행하면 애플리케이션의 `resources/views/vendor/pagination` 디렉터리에 뷰 파일들이 복사됩니다. 이 중 `tailwind.blade.php` 파일이 기본 페이지네이션 뷰에 해당합니다. HTML을 원하는 대로 수정할 수 있습니다.

기본 페이지네이션 뷰 파일을 변경하고 싶다면, `App\Providers\AppServiceProvider`의 `boot` 메서드에서 페이지네이터의 `defaultView` 및 `defaultSimpleView` 메서드를 호출하면 됩니다:

```php
<?php

namespace App\Providers;

use Illuminate\Pagination\Paginator;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Paginator::defaultView('view-name');

        Paginator::defaultSimpleView('view-name');
    }
}
```

<a name="using-bootstrap"></a>
### Bootstrap 사용하기

라라벨은 [Bootstrap CSS](https://getbootstrap.com/)로 제작된 페이지네이션 뷰도 기본 제공합니다. 이 뷰를 기본 Tailwind 뷰 대신 사용하려면, `App\Providers\AppServiceProvider`의 `boot` 메서드에서 페이지네이터의 `useBootstrapFour`, `useBootstrapFive` 메서드를 호출하면 됩니다:

```php
use Illuminate\Pagination\Paginator;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Paginator::useBootstrapFive();
    Paginator::useBootstrapFour();
}
```

<a name="paginator-instance-methods"></a>
## Paginator / LengthAwarePaginator 인스턴스 메서드

각 페이지네이터 인스턴스는 아래 메서드를 통해 다양한 페이지네이션 정보를 제공합니다:

<div class="overflow-auto">

| 메서드 | 설명 |
| --- | --- |
| `$paginator->count()` | 현재 페이지의 아이템 개수를 반환합니다. |
| `$paginator->currentPage()` | 현재 페이지 번호를 반환합니다. |
| `$paginator->firstItem()` | 결과 집합에서 첫 번째 아이템의 인덱스를 반환합니다. |
| `$paginator->getOptions()` | 페이지네이터 옵션을 가져옵니다. |
| `$paginator->getUrlRange($start, $end)` | 지정한 범위의 페이지네이션 URL을 생성합니다. |
| `$paginator->hasPages()` | 여러 페이지로 나눌 만큼 충분한 아이템이 있는지 확인합니다. |
| `$paginator->hasMorePages()` | 데이터 저장소에 더 많은 아이템이 있는지 확인합니다. |
| `$paginator->items()` | 현재 페이지의 아이템들을 반환합니다. |
| `$paginator->lastItem()` | 결과 집합에서 마지막 아이템의 인덱스를 반환합니다. |
| `$paginator->lastPage()` | 마지막 페이지 번호를 반환합니다. (`simplePaginate` 사용 시에는 제공되지 않습니다.) |
| `$paginator->nextPageUrl()` | 다음 페이지의 URL을 반환합니다. |
| `$paginator->onFirstPage()` | 페이지네이터가 첫 페이지에 있는지 확인합니다. |
| `$paginator->onLastPage()` | 페이지네이터가 마지막 페이지에 있는지 확인합니다. |
| `$paginator->perPage()` | 한 페이지에 표시할 아이템 개수를 반환합니다. |
| `$paginator->previousPageUrl()` | 이전 페이지의 URL을 반환합니다. |
| `$paginator->total()` | 데이터 저장소에 매칭되는 전체 아이템 수를 반환합니다. (`simplePaginate`에서는 제공되지 않습니다.) |
| `$paginator->url($page)` | 지정한 페이지 번호의 URL을 반환합니다. |
| `$paginator->getPageName()` | 쿼리 문자열에 사용되는 페이지 변수명을 반환합니다. |
| `$paginator->setPageName($name)` | 쿼리 문자열에 사용되는 페이지 변수명을 설정합니다. |
| `$paginator->through($callback)` | 각 아이템을 콜백을 사용해 변환합니다. |

</div>

<a name="cursor-paginator-instance-methods"></a>
## CursorPaginator 인스턴스 메서드

각 커서 페이지네이터 인스턴스는 다음과 같은 메서드로 추가 정보를 제공합니다:

<div class="overflow-auto">

| 메서드                          | 설명                                                      |
| ------------------------------- | --------------------------------------------------------- |
| `$paginator->count()`           | 현재 페이지의 아이템 개수를 반환합니다.                    |
| `$paginator->cursor()`          | 현재 커서 인스턴스를 반환합니다.                          |
| `$paginator->getOptions()`      | 페이지네이터 옵션을 반환합니다.                           |
| `$paginator->hasPages()`        | 여러 페이지로 나눌 만큼 충분한 아이템이 있는지 확인합니다. |
| `$paginator->hasMorePages()`    | 데이터 저장소에 더 많은 아이템이 있는지 확인합니다.        |
| `$paginator->getCursorName()`   | 쿼리 문자열에 사용되는 커서 변수명을 반환합니다.           |
| `$paginator->items()`           | 현재 페이지의 아이템들을 반환합니다.                      |
| `$paginator->nextCursor()`      | 다음 아이템 집합에 대한 커서 인스턴스를 반환합니다.         |
| `$paginator->nextPageUrl()`     | 다음 페이지의 URL을 반환합니다.                            |
| `$paginator->onFirstPage()`     | 페이지네이터가 첫 페이지에 있는지 확인합니다.               |
| `$paginator->onLastPage()`      | 페이지네이터가 마지막 페이지에 있는지 확인합니다.           |
| `$paginator->perPage()`         | 한 페이지에 표시할 아이템 개수를 반환합니다.                |
| `$paginator->previousCursor()`  | 이전 아이템 집합에 대한 커서 인스턴스를 반환합니다.         |
| `$paginator->previousPageUrl()` | 이전 페이지의 URL을 반환합니다.                            |
| `$paginator->setCursorName()`   | 쿼리 문자열에 사용되는 커서 변수명을 설정합니다.            |
| `$paginator->url($cursor)`      | 지정한 커서 인스턴스의 URL을 반환합니다.                   |

</div>
