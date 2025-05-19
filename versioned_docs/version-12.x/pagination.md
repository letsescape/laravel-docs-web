# 데이터베이스: 페이지네이션 (Database: Pagination)

- [소개](#introduction)
- [기본 사용법](#basic-usage)
    - [쿼리 빌더 결과 페이지네이션](#paginating-query-builder-results)
    - [Eloquent 결과 페이지네이션](#paginating-eloquent-results)
    - [커서 페이지네이션](#cursor-pagination)
    - [페이지네이터 수동 생성](#manually-creating-a-paginator)
    - [페이지네이션 URL 커스터마이징](#customizing-pagination-urls)
- [페이지네이션 결과 표시](#displaying-pagination-results)
    - [페이지네이션 링크 윈도우 조정](#adjusting-the-pagination-link-window)
    - [결과를 JSON으로 변환](#converting-results-to-json)
- [페이지네이션 뷰 커스터마이징](#customizing-the-pagination-view)
    - [Bootstrap 사용하기](#using-bootstrap)
- [Paginator 및 LengthAwarePaginator 인스턴스 메서드](#paginator-instance-methods)
- [CursorPaginator 인스턴스 메서드](#cursor-paginator-instance-methods)

<a name="introduction"></a>
## 소개

다른 프레임워크에서는 페이지네이션이 매우 번거로울 수 있습니다. 라라벨이 제공하는 페이지네이션 방식이 여러분에게 신선함을 줄 수 있기를 바랍니다. 라라벨의 페이지네이터는 [쿼리 빌더](/docs/12.x/queries) 및 [Eloquent ORM](/docs/12.x/eloquent)과 통합되어, 데이터베이스 레코드의 페이지네이션을 별도의 설정 없이 편리하고 쉽게 제공합니다.

기본적으로 페이지네이터가 생성하는 HTML은 [Tailwind CSS 프레임워크](https://tailwindcss.com/)와 호환됩니다. 물론 Bootstrap 기반의 페이지네이션도 지원합니다.

<a name="tailwind"></a>
#### Tailwind

라라벨의 기본 Tailwind 페이지네이션 뷰를 Tailwind 4.x와 함께 사용하는 경우, 애플리케이션의 `resources/css/app.css` 파일은 이미 라라벨의 페이지네이션 뷰를 `@source`로 참조하도록 알맞게 구성되어 있습니다:

```css
@import 'tailwindcss';

@source '../../vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php';
```

<a name="basic-usage"></a>
## 기본 사용법

<a name="paginating-query-builder-results"></a>
### 쿼리 빌더 결과 페이지네이션

여러 가지 방식으로 아이템들을 페이지네이션할 수 있습니다. 가장 간단한 방법은 [쿼리 빌더](/docs/12.x/queries)나 [Eloquent 쿼리](/docs/12.x/eloquent)에서 `paginate` 메서드를 사용하는 것입니다. 이 `paginate` 메서드는 현재 사용자가 보고 있는 페이지에 따라 쿼리의 "limit"과 "offset"을 자동으로 처리해줍니다. 기본적으로 현재 페이지는 HTTP 요청의 쿼리 문자열에서 `page` 인수 값을 통해 감지합니다. 이 값은 라라벨이 자동으로 파악하며, 페이지네이터가 생성하는 링크에도 자동으로 추가됩니다.

아래 예시처럼, `paginate` 메서드에는 각 페이지에 보여주고 싶은 아이템 개수 하나만 전달하면 됩니다. 예를 들어 한 페이지에 `15`개씩 표시하도록 설정할 수 있습니다:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * 모든 애플리케이션 사용자를 표시합니다.
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

`paginate` 메서드는 쿼리 결과와 일치하는 전체 레코드 개수를 먼저 계산한 후, 해당되는 레코드만 데이터베이스에서 가져옵니다. 이렇게 하는 이유는 페이지네이터가 전체 페이지 수를 파악해야 하기 때문입니다. 하지만, 애플리케이션 UI에서 전체 페이지 수를 표시할 계획이 없다면 레코드 개수 쿼리는 불필요할 수 있습니다.

따라서 UI 상에서 "다음"과 "이전" 링크만 간단히 보여주고 싶을 때는, `simplePaginate` 메서드를 사용해 더 효율적으로 한 번의 쿼리만 수행할 수 있습니다:

```php
$users = DB::table('users')->simplePaginate(15);
```

<a name="paginating-eloquent-results"></a>
### Eloquent 결과 페이지네이션

[Eloquent](/docs/12.x/eloquent) 쿼리에도 페이지네이션을 적용할 수 있습니다. 아래 예제에서는 `App\Models\User` 모델에 대해서 1페이지에 15개 레코드를 보여주도록 설정합니다. 쿼리 빌더의 페이지네이션과 거의 동일한 문법을 사용합니다:

```php
use App\Models\User;

$users = User::paginate(15);
```

물론, 쿼리에 `where` 등 다른 조건을 추가한 후 `paginate`를 호출하는 것도 가능합니다:

```php
$users = User::where('votes', '>', 100)->paginate(15);
```

Eloquent 모델에서도 `simplePaginate` 메서드 사용이 가능합니다:

```php
$users = User::where('votes', '>', 100)->simplePaginate(15);
```

마찬가지로, `cursorPaginate` 메서드를 사용해 Eloquent 모델에서 커서 기반 페이지네이션도 구현할 수 있습니다:

```php
$users = User::where('votes', '>', 100)->cursorPaginate(15);
```

<a name="multiple-paginator-instances-per-page"></a>
#### 한 화면에 여러 페이지네이터 인스턴스 사용

간혹 하나의 화면에서 두 개 이상의 서로 다른 페이지네이터를 렌더링해야 할 때가 있습니다. 둘 다 현재 페이지 정보를 `page` 쿼리 문자열 파라미터로 저장하면, 두 페이지네이터가 서로 충돌할 수 있습니다. 이를 해결하려면, `paginate`, `simplePaginate`, `cursorPaginate` 메서드의 세 번째 인수로 페이지네이터의 현재 페이지를 저장할 쿼리 문자열 파라미터 이름을 각각 지정하면 됩니다:

```php
use App\Models\User;

$users = User::where('votes', '>', 100)->paginate(
    $perPage = 15, $columns = ['*'], $pageName = 'users'
);
```

<a name="cursor-pagination"></a>
### 커서 페이지네이션

`paginate`와 `simplePaginate`는 SQL의 "offset" 절을 사용해서 쿼리를 생성하나, 커서 페이지네이션은 쿼리 내 정렬된 컬럼의 값을 비교하는 "where" 절을 만들어, 라라벨 페이지네이션 방식 중 가장 효율적인 데이터베이스 성능을 제공합니다. 이 방법은 대용량 데이터셋과 "무한" 스크롤 인터페이스에 특히 적합합니다.

offset 기반 페이지네이션과 달리, 커서 기반 페이지네이션은 페이지 번호 대신 "커서" 문자열이 쿼리 문자열에 담깁니다. 커서는 다음 페이지네이션 시작 위치와 방향을 인코딩한 문자열입니다:

```text
http://localhost/users?cursor=eyJpZCI6MTUsIl9wb2ludHNUb05leHRJdGVtcyI6dHJ1ZX0
```

쿼리 빌더의 `cursorPaginate` 메서드를 통해 커서 기반 페이지네이터 인스턴스를 생성할 수 있습니다. 이 메서드는 `Illuminate\Pagination\CursorPaginator` 인스턴스를 반환합니다:

```php
$users = DB::table('users')->orderBy('id')->cursorPaginate(15);
```

커서 페이지네이터 인스턴스를 얻었다면, [페이지네이션 결과 표시](#displaying-pagination-results)에서와 동일하게 결과를 표시할 수 있습니다. 커서 페이지네이터가 제공하는 인스턴스 메서드에 대한 정보는 [커서 페이지네이터 인스턴스 메서드](#cursor-paginator-instance-methods) 문서를 참고하세요.

> [!WARNING]
> 커서 페이지네이션을 사용하려면 쿼리 내에 "order by" 절이 반드시 포함되어야 합니다. 또한, 쿼리에서 정렬하는 컬럼들은 꼭 페이지네이션하려는 테이블에 존재해야 합니다.

<a name="cursor-vs-offset-pagination"></a>
#### 커서 페이지네이션 vs. 오프셋 페이지네이션

커서 페이지네이션과 오프셋 페이지네이션의 차이를 이해하기 위해, 각각의 SQL 쿼리 예시를 살펴보겠습니다. 둘 다 `users` 테이블을 `id` 기준으로 정렬하며, "두 번째 페이지"의 결과를 보여줍니다:

```sql
# 오프셋 페이지네이션...
select * from users order by id asc limit 15 offset 15;

# 커서 페이지네이션...
select * from users where id > 15 order by id asc limit 15;
```

커서 페이지네이션 쿼리는 오프셋 페이지네이션에 비해 아래와 같은 장점이 있습니다:

- 매우 큰 데이터셋에서, 정렬 컬럼에 인덱스가 적용되어 있다면 커서 방식이 훨씬 좋은 성능을 냅니다. 이는 "offset" 절이 이전의 모든 데이터를 일일이 스캔하기 때문입니다.
- 데이터셋에 신규 데이터가 빈번히 추가되거나 삭제될 때, 오프셋 기반 페이지네이션은 현재 사용자가 보는 페이지에서 레코드가 누락되거나 중복 표시될 수 있습니다.

반면, 커서 페이지네이션에는 다음과 같은 제한점도 있습니다:

- `simplePaginate`처럼 커서 페이지네이션은 "이전", "다음" 링크만 제공되며, 페이지 번호 기반 링크는 생성할 수 없습니다.
- 정렬 기준은 반드시 하나 이상의 고유 컬럼(혹은 컬럼 조합)을 포함해야 합니다. null 값이 포함된 컬럼은 지원하지 않습니다.
- "order by"에 쿼리 식(expression)을 사용할 경우, 반드시 별칭(alias)으로 지정하고 "select" 문에도 해당 컬럼을 추가해야 지원됩니다.
- 파라미터가 포함된 쿼리 표현식(order by 절)은 지원하지 않습니다.

<a name="manually-creating-a-paginator"></a>
### 페이지네이터 수동 생성

간혹 여러분이 메모리 안에 이미 가지고 있는 아이템 배열로 페이지네이터 인스턴스를 직접 생성하고 싶을 수 있습니다. 이런 경우에는, 필요에 따라 `Illuminate\Pagination\Paginator`, `Illuminate\Pagination\LengthAwarePaginator`, `Illuminate\Pagination\CursorPaginator` 인스턴스를 생성할 수 있습니다.

`Paginator`와 `CursorPaginator` 클래스는 전체 아이템 개수를 알 필요가 없습니다. 하지만 그만큼, 마지막 페이지의 인덱스 값을 얻을 수 있는 메서드는 제공하지 않습니다. 반면, `LengthAwarePaginator`는 전체 아이템 개수(total)를 인수로 반드시 받아야 하며, 사용법은 `Paginator`와 거의 동일합니다.

정리하면, `Paginator`는 쿼리 빌더의 `simplePaginate`, `CursorPaginator`는 `cursorPaginate`, `LengthAwarePaginator`는 `paginate`와 각각 대응됩니다.

> [!WARNING]
> 수동으로 페이지네이터 인스턴스를 만들 때는, 반환할 배열 데이터를 직접 "슬라이스(slice)"해서 페이지에 맞게 잘라서 전달해야 합니다. 어떻게 슬라이스해야 할지 모르겠다면, [array_slice](https://secure.php.net/manual/en/function.array-slice.php) PHP 함수를 참고해 보세요.

<a name="customizing-pagination-urls"></a>
### 페이지네이션 URL 커스터마이징

기본적으로 페이지네이터가 생성하는 링크는 현재 요청의 URI를 기준으로 합니다. 하지만, 페이지네이터의 `withPath` 메서드를 사용하면 원하는 URI로 링크를 커스터마이즈할 수 있습니다. 예를 들어 페이지네이터가 `http://example.com/admin/users?page=N`과 같은 링크를 만들도록 하려면, 아래와 같이 `/admin/users`를 `withPath`에 전달하면 됩니다:

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

페이지네이션 링크에 쿼리 문자열을 추가하고 싶다면, `appends` 메서드를 사용할 수 있습니다. 예를 들어 각각의 페이지네이션 링크에 `sort=votes`를 추가하려면, 다음과 같이 `appends`를 호출합니다:

```php
use App\Models\User;

Route::get('/users', function () {
    $users = User::paginate(15);

    $users->appends(['sort' => 'votes']);

    // ...
});
```

현재 요청의 모든 쿼리 문자열을 페이지네이션 링크에 추가하려면, `withQueryString` 메서드를 사용할 수 있습니다:

```php
$users = User::paginate(15)->withQueryString();
```

<a name="appending-hash-fragments"></a>
#### 해시 프래그먼트 추가

페이지네이터가 생성하는 URL 뒤에 "해시 프래그먼트"를 덧붙이려면, `fragment` 메서드를 사용할 수 있습니다. 예를 들어, 각 페이지네이션 링크 끝에 `#users`를 추가하려면 아래처럼 작성합니다:

```php
$users = User::paginate(15)->fragment('users');
```

<a name="displaying-pagination-results"></a>
## 페이지네이션 결과 표시

`paginate` 메서드를 호출하면 `Illuminate\Pagination\LengthAwarePaginator` 인스턴스가 반환되고, `simplePaginate`를 호출하면 `Illuminate\Pagination\Paginator` 인스턴스가 반환됩니다. 마지막으로 `cursorPaginate`를 사용하면 `Illuminate\Pagination\CursorPaginator`를 얻을 수 있습니다.

이 객체들은 결과 셋에 대한 여러 유용한 메서드를 제공합니다. 또한 페이지네이터 인스턴스는 반복자(Iterator)이기 때문에 배열처럼 `foreach`로 순회할 수 있습니다. 데이터를 조회하고 나면, 다음과 같이 [Blade](/docs/12.x/blade)에서 결과와 페이지 링크를 표시할 수 있습니다:

```blade
<div class="container">
    @foreach ($users as $user)
        {{ $user->name }}
    @endforeach
</div>

{{ $users->links() }}
```

`links` 메서드는 나머지 페이지에 대한 링크를 렌더링합니다. 각 링크에는 자동으로 올바른 `page` 쿼리 문자열 변수가 포함되어 있습니다. 참고로, `links` 메서드가 출력하는 HTML은 [Tailwind CSS 프레임워크](https://tailwindcss.com)와 호환됩니다.

<a name="adjusting-the-pagination-link-window"></a>
### 페이지네이션 링크 윈도우 조정

페이지네이터가 페이지 링크를 표시할 때, 현재 페이지 번호와 함께 그 전후로 세 개의 페이지 링크가 기본적으로 나타납니다. `onEachSide` 메서드를 사용하면, 현재 페이지 양 옆에 표시되는 추가 링크 개수를 직접 지정할 수 있습니다:

```blade
{{ $users->onEachSide(5)->links() }}
```

<a name="converting-results-to-json"></a>
### 결과를 JSON으로 변환

라라벨의 페이지네이터 클래스는 `Illuminate\Contracts\Support\Jsonable` 인터페이스를 구현하며, `toJson` 메서드를 제공합니다. 따라서 페이지네이션 결과를 매우 쉽게 JSON으로 변환할 수 있습니다. 라우트나 컨트롤러 액션에서 페이지네이터 인스턴스를 그대로 반환해도 JSON으로 자동 변환됩니다:

```php
use App\Models\User;

Route::get('/users', function () {
    return User::paginate();
});
```

이렇게 반환된 JSON에는 `total`, `current_page`, `last_page` 등의 메타 정보와 결과 레코드가 `data` 키 아래 배열로 포함됩니다. 아래는 페이지네이터 인스턴스를 반환했을 때 생성되는 JSON 예시입니다:

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

기본적으로 페이지네이션 링크를 렌더링하는 뷰는 [Tailwind CSS](https://tailwindcss.com) 프레임워크와 호환되도록 구성되어 있습니다. 하지만 Tailwind를 사용하지 않는 경우, 직접 페이지네이션 뷰를 정의해서 사용할 수 있습니다. 페이지네이터 인스턴스의 `links` 메서드 호출 시, 첫 번째 인수로 뷰 이름을 전달하여 사용할 수 있습니다:

```blade
{{ $paginator->links('view.name') }}

<!-- 뷰로 추가 데이터 전달하기... -->
{{ $paginator->links('view.name', ['foo' => 'bar']) }}
```

하지만 페이지네이션 뷰를 쉽게 커스터마이징하는 가장 간단한 방법은, `vendor:publish` 명령어를 사용해 뷰 파일을 자신의 `resources/views/vendor` 디렉터리로 내보내는 것입니다:

```shell
php artisan vendor:publish --tag=laravel-pagination
```

이 명령어를 실행하면, 애플리케이션의 `resources/views/vendor/pagination` 디렉터리에 관련 뷰 파일이 복사됩니다. 이중 `tailwind.blade.php` 파일이 기본 페이지네이션 뷰입니다. 직접 원하는 대로 HTML을 수정할 수 있습니다.

만약 다른 파일을 기본 페이지네이션 뷰로 지정하고 싶다면, `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드 내에서 페이지네이터의 `defaultView` 및 `defaultSimpleView` 메서드를 호출하면 됩니다:

```php
<?php

namespace App\Providers;

use Illuminate\Pagination\Paginator;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * 애플리케이션 서비스 부트스트랩.
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

라라벨은 [Bootstrap CSS](https://getbootstrap.com/)로 만든 페이지네이션 뷰도 기본 제공합니다. 기본 Tailwind 뷰 대신 Bootstrap 기반 뷰를 사용하려면, `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 페이지네이터의 `useBootstrapFour` 또는 `useBootstrapFive` 메서드를 호출하면 됩니다:

```php
use Illuminate\Pagination\Paginator;

/**
 * 애플리케이션 서비스 부트스트랩.
 */
public function boot(): void
{
    Paginator::useBootstrapFive();
    Paginator::useBootstrapFour();
}
```

<a name="paginator-instance-methods"></a>
## Paginator / LengthAwarePaginator 인스턴스 메서드

각 페이지네이터 인스턴스는 아래와 같은 메서드를 통해 추가적인 페이지네이션 정보를 제공합니다:

<div class="overflow-auto">

| 메서드 | 설명 |
| --- | --- |
| `$paginator->count()` | 현재 페이지의 아이템 개수를 반환합니다. |
| `$paginator->currentPage()` | 현재 페이지 번호를 반환합니다. |
| `$paginator->firstItem()` | 결과 중 첫 번째 아이템의 번호를 반환합니다. |
| `$paginator->getOptions()` | 페이지네이터 옵션을 반환합니다. |
| `$paginator->getUrlRange($start, $end)` | 특정 범위의 페이지네이션 URL을 생성합니다. |
| `$paginator->hasPages()` | 여러 페이지로 나눌 만큼 충분한 아이템이 있는지 확인합니다. |
| `$paginator->hasMorePages()` | 데이터 저장소에 추가 아이템이 있는지 확인합니다. |
| `$paginator->items()` | 현재 페이지의 아이템을 반환합니다. |
| `$paginator->lastItem()` | 결과 중 마지막 아이템의 번호를 반환합니다. |
| `$paginator->lastPage()` | 마지막 페이지 번호를 반환합니다. (`simplePaginate` 사용할 때는 불가) |
| `$paginator->nextPageUrl()` | 다음 페이지의 URL을 반환합니다. |
| `$paginator->onFirstPage()` | 첫 번째 페이지에 있는지 확인합니다. |
| `$paginator->onLastPage()` | 마지막 페이지에 있는지 확인합니다. |
| `$paginator->perPage()` | 페이지당 표시할 아이템 개수를 반환합니다. |
| `$paginator->previousPageUrl()` | 이전 페이지의 URL을 반환합니다. |
| `$paginator->total()` | 데이터 저장소 내 일치하는 전체 아이템 개수를 반환합니다. (`simplePaginate` 사용할 때는 불가) |
| `$paginator->url($page)` | 특정 페이지 번호에 대한 URL을 반환합니다. |
| `$paginator->getPageName()` | 페이지 번호를 저장하는 쿼리 문자열 변수명을 반환합니다. |
| `$paginator->setPageName($name)` | 페이지 번호를 저장할 쿼리 문자열 변수명을 설정합니다. |
| `$paginator->through($callback)` | 각 아이템에 콜백을 적용해 변환합니다. |

</div>

<a name="cursor-paginator-instance-methods"></a>
## CursorPaginator 인스턴스 메서드

각 커서 페이지네이터 인스턴스는 아래 메서드를 통해 추가적인 페이지네이션 정보를 제공합니다:

<div class="overflow-auto">

| 메서드                          | 설명                                                        |
| ------------------------------- | ----------------------------------------------------------- |
| `$paginator->count()`           | 현재 페이지의 아이템 개수를 반환합니다.                        |
| `$paginator->cursor()`          | 현재 커서 인스턴스를 반환합니다.                              |
| `$paginator->getOptions()`      | 페이지네이터 옵션을 반환합니다.                              |
| `$paginator->hasPages()`        | 여러 페이지로 나눌 만큼 충분한 아이템이 있는지 확인합니다.      |
| `$paginator->hasMorePages()`    | 데이터 저장소에 추가 아이템이 있는지 확인합니다.               |
| `$paginator->getCursorName()`   | 커서를 저장하는 쿼리 문자열 변수명을 반환합니다.               |
| `$paginator->items()`           | 현재 페이지의 아이템을 반환합니다.                             |
| `$paginator->nextCursor()`      | 다음 아이템 셋에 대한 커서 인스턴스를 반환합니다.              |
| `$paginator->nextPageUrl()`     | 다음 페이지의 URL을 반환합니다.                               |
| `$paginator->onFirstPage()`     | 첫 번째 페이지에 있는지 확인합니다.                            |
| `$paginator->onLastPage()`      | 마지막 페이지에 있는지 확인합니다.                             |
| `$paginator->perPage()`         | 페이지당 표시할 아이템 개수를 반환합니다.                      |
| `$paginator->previousCursor()`  | 이전 아이템 셋에 대한 커서 인스턴스를 반환합니다.              |
| `$paginator->previousPageUrl()` | 이전 페이지의 URL을 반환합니다.                               |
| `$paginator->setCursorName()`   | 커서를 저장할 쿼리 문자열 변수명을 설정합니다.                |
| `$paginator->url($cursor)`      | 특정 커서 인스턴스에 대한 URL을 반환합니다.                   |

</div>
