# 데이터베이스: 페이지네이션 (Database: Pagination)

- [소개](#introduction)
- [기본 사용법](#basic-usage)
    - [쿼리 빌더 결과 페이지네이션](#paginating-query-builder-results)
    - [Eloquent 결과 페이지네이션](#paginating-eloquent-results)
    - [커서 페이지네이션](#cursor-pagination)
    - [수동으로 페이지네이터 인스턴스 생성하기](#manually-creating-a-paginator)
    - [페이지네이션 URL 커스터마이즈](#customizing-pagination-urls)
- [페이지네이션 결과 표시](#displaying-pagination-results)
    - [페이지네이션 링크 창 조정](#adjusting-the-pagination-link-window)
    - [결과를 JSON으로 변환](#converting-results-to-json)
- [페이지네이션 뷰 커스터마이즈](#customizing-the-pagination-view)
    - [Bootstrap 사용하기](#using-bootstrap)
- [Paginator 및 LengthAwarePaginator 인스턴스 메서드](#paginator-instance-methods)
- [Cursor Paginator 인스턴스 메서드](#cursor-paginator-instance-methods)

<a name="introduction"></a>
## 소개

다른 프레임워크에서는 페이지네이션 기능이 번거로울 수 있지만, 라라벨에서는 매우 간편하게 처리할 수 있도록 설계되어 있습니다. 라라벨의 페이지네이터는 [쿼리 빌더](/docs/10.x/queries) 및 [Eloquent ORM](/docs/10.x/eloquent)과 통합되어 있으므로, 별도의 복잡한 설정 없이도 데이터베이스 레코드에 대해 쉽고 편리하게 페이지네이션 기능을 사용할 수 있습니다.

기본적으로 페이지네이터가 만들어내는 HTML은 [Tailwind CSS 프레임워크](https://tailwindcss.com/)와 호환됩니다. 물론, Bootstrap 스타일의 페이지네이션 뷰도 지원됩니다.

<a name="tailwind-jit"></a>
#### Tailwind JIT

라라벨의 기본 Tailwind 페이지네이션 뷰와 Tailwind JIT 엔진을 함께 사용 중이라면, 애플리케이션의 `tailwind.config.js` 파일의 `content` 키에 라라벨 페이지네이션 뷰 파일 경로가 포함되어 있는지 반드시 확인하세요. 이렇게 해야 Tailwind 클래스가 제대로 남아있고, 삭제되지 않습니다.

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

페이지네이션을 적용하는 방법은 여러 가지가 있지만, [쿼리 빌더](/docs/10.x/queries)나 [Eloquent 쿼리](/docs/10.x/eloquent)에서 `paginate` 메서드를 사용하는 것이 가장 간단합니다. `paginate` 메서드는 현재 사용자가 보고 있는 페이지에 맞춰 SQL 쿼리의 "limit"과 "offset"을 자동으로 적용해줍니다. 기본적으로, 현재 페이지 정보는 HTTP 요청의 쿼리 스트링 `page` 인수의 값으로 인식하며, 라라벨이 이 값을 자동으로 감지하고 페이지네이터가 생성하는 링크에도 자동으로 포함시켜줍니다.

아래 예시에서는 `paginate` 메서드에 "한 페이지에 표시할 항목 수"만 인수로 넘깁니다. 여기서는 한 페이지에 15개씩 보여주도록 지정했습니다.

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * 모든 애플리케이션 사용자 보여주기
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
#### 간단한 페이지네이션

`paginate` 메서드는 실제 데이터를 가져오기 전에 쿼리에 부합하는 레코드의 전체 개수를 카운트합니다. 이는 페이지네이터가 전체 페이지 수를 계산하는 데 필요합니다. 그러나 UI에서 전체 페이지 수를 보여줄 필요가 없다면, 이 카운트 쿼리는 불필요합니다.

따라서, 애플리케이션에서 "다음", "이전" 링크만 간단히 표시하면 되는 경우, 보다 효율적으로 동작하는 `simplePaginate` 메서드를 사용할 수 있습니다.

```
$users = DB::table('users')->simplePaginate(15);
```

<a name="paginating-eloquent-results"></a>
### Eloquent 결과 페이지네이션

[Eloquent](/docs/10.x/eloquent) 쿼리도 마찬가지로 페이지네이션할 수 있습니다. 아래 예시에서는 `App\Models\User` 모델을 가져오는 쿼리를 15개씩 페이지네이션하는데, 쿼리 빌더를 사용할 때와 문법이 거의 똑같습니다.

```
use App\Models\User;

$users = User::paginate(15);
```

물론, `where`절과 같은 추가 조건을 쿼리에 적용한 뒤에 `paginate` 메서드를 호출해도 됩니다.

```
$users = User::where('votes', '>', 100)->paginate(15);
```

또한, Eloquent 모델을 페이지네이션할 때도 `simplePaginate` 메서드를 사용할 수 있습니다.

```
$users = User::where('votes', '>', 100)->simplePaginate(15);
```

마찬가지로, Eloquent 모델에 대해 커서 페이지네이션을 원한다면 `cursorPaginate` 메서드를 사용할 수 있습니다.

```
$users = User::where('votes', '>', 100)->cursorPaginate(15);
```

<a name="multiple-paginator-instances-per-page"></a>
#### 한 페이지에서 여러 Paginator 인스턴스 사용

때로는 하나의 화면(페이지)에서 서로 다른 페이지네이터 두 개를 동시에 표시해야 할 때가 있습니다. 그런데 두 페이지네이터 인스턴스가 모두 쿼리 스트링의 `page` 파라미터를 사용한다면 서로 충돌이 생깁니다. 이런 경우에는 `paginate`, `simplePaginate`, `cursorPaginate` 메서드의 세 번째 인수로 쿼리 스트링에 사용할 파라미터 이름을 직접 지정해주면 충돌을 해결할 수 있습니다.

```
use App\Models\User;

$users = User::where('votes', '>', 100)->paginate(
    $perPage = 15, $columns = ['*'], $pageName = 'users'
);
```

<a name="cursor-pagination"></a>
### 커서 페이지네이션

`paginate`와 `simplePaginate`는 SQL의 "offset" 절을 사용하지만, 커서 페이지네이션은 쿼리에서 정렬(column) 기준으로 값을 비교하는 "where" 조건을 조합하여 데이터를 가져옵니다. 이 방식은 라라벨의 모든 페이지네이션 방식 중에서 데이터베이스 처리 성능이 가장 뛰어나며, 대용량 데이터셋 또는 "무한 스크롤" UI에 적합합니다.

offset 기반 페이지네이션은 링크에 페이지 번호가 쿼리 스트링에 포함됩니다. 반면에 커서 기반 페이지네이션은 "cursor"라는 문자열이 쿼리 스트링에 들어갑니다. 이 커서는 다음 데이터 쿼리를 어디서부터 시작할지와, 어느 방향으로 가져올지를 인코딩한 문자열입니다.

```nothing
http://localhost/users?cursor=eyJpZCI6MTUsIl9wb2ludHNUb05leHRJdGVtcyI6dHJ1ZX0
```

쿼리 빌더에서 `cursorPaginate` 메서드를 호출하면 커서 기반 페이지네이터 인스턴스를 만들 수 있습니다. 반환 타입은 `Illuminate\Pagination\CursorPaginator`입니다.

```
$users = DB::table('users')->orderBy('id')->cursorPaginate(15);
```

커서 페이지네이터 인스턴스를 가져왔으면, [페이지네이션 결과 표시하기](#displaying-pagination-results)에서 설명한 것처럼 일반 페이지네이터처럼 결과를 출력하면 됩니다. 커서 페이지네이터의 인스턴스 메서드 사용법은 [cursor paginator 인스턴스 메서드 문서](#cursor-paginator-instance-methods)를 참고하세요.

> [!NOTE]
> 커서 페이지네이션을 사용하려면 쿼리에 반드시 "order by" 절이 포함되어야 합니다. 또한 정렬에 사용되는 컬럼(들)은 반드시 페이지네이션 대상 테이블에 속해야 합니다.

<a name="cursor-vs-offset-pagination"></a>
#### 커서 방식과 오프셋 방식 페이지네이션 비교

offset 페이지네이션과 커서 페이지네이션의 차이를 이해하기 위해 예시 SQL 쿼리를 살펴보겠습니다. 아래 두 쿼리는 `users` 테이블을 `id` 컬럼으로 정렬하여 "두 번째 페이지"의 결과를 보여줍니다.

```sql
# 오프셋 페이지네이션...
select * from users order by id asc limit 15 offset 15;

# 커서 페이지네이션...
select * from users where id > 15 order by id asc limit 15;
```

커서 페이지네이션은 오프셋 방식과 비교해 다음과 같은 장점이 있습니다.

- 대용량 데이터셋에서 "order by" 컬럼이 인덱싱되어 있다면 커서 방식이 훨씬 더 좋은 성능을 냅니다. (offset 절은 앞쪽 데이터 전부를 일일이 스캔해야 하기 때문입니다.)
- 데이터가 자주 삽입/삭제되는 경우(offset 방식에서는 보여지는 페이지에 변화가 생길 수 있는데) 커서 방식은 레코드 누락이나 중복노출 위험이 적습니다.

단, 커서 페이지네이션에는 아래와 같은 제약이 있습니다.

- `simplePaginate`와 마찬가지로 "다음" 및 "이전" 링크만 지원하며, 페이지 번호 별 링크는 만들 수 없습니다.
- 정렬 기준이 반드시 하나 이상의 유니크한 컬럼(또는 유니크 컬럼 조합)이어야 하며, `null` 값이 있는 컬럼은 사용할 수 없습니다.
- "order by" 절에서 쿼리 식(expression)은 반드시 별칭을 붙이고 "select" 절에 포함시켜야 지원됩니다.
- 파라미터가 들어가는 쿼리 식은 지원되지 않습니다.

<a name="manually-creating-a-paginator"></a>
### 수동으로 페이지네이터 인스턴스 생성하기

이미 메모리에 배열로 가지고 있는 데이터에 대해서도 직접 페이지네이터 인스턴스를 만들어 사용할 수 있습니다. 상황에 따라 `Illuminate\Pagination\Paginator`, `Illuminate\Pagination\LengthAwarePaginator`, `Illuminate\Pagination\CursorPaginator` 중 적절한 클래스를 생성해 사용하면 됩니다.

`Paginator`와 `CursorPaginator` 클래스는 전체 아이템 수를 알 필요가 없어서, 마지막 페이지 번호를 알 수 있는 메서드를 제공하지 않습니다. `LengthAwarePaginator` 클래스는 `Paginator`와 거의 동일한 인수를 받지만, 전체 결과셋 아이템의 개수를 인수로 반드시 넘겨주어야 합니다.

즉, 각각의 클래스는 쿼리 빌더 메서드와 다음과 같이 대응됩니다:

- `Paginator`: `simplePaginate`와 동일
- `CursorPaginator`: `cursorPaginate`와 동일
- `LengthAwarePaginator`: `paginate`와 동일

> [!NOTE]
> 수동으로 페이지네이터 인스턴스를 생성할 때는, 페이지네이터에 넘겨주는 결과 배열을 직접 "슬라이스(slice)"해서 전달해야 합니다. 관련된 PHP 함수로 [array_slice](https://secure.php.net/manual/en/function.array-slice.php)를 참고하세요.

<a name="customizing-pagination-urls"></a>
### 페이지네이션 URL 커스터마이즈

기본적으로 페이지네이터가 생성하는 링크는 현재 요청의 URI를 따릅니다. 하지만, 페이지네이터의 `withPath` 메서드를 이용하면 URL 구조를 원하는 대로 지정할 수 있습니다. 예를 들어, 페이지네이션 링크가 `http://example.com/admin/users?page=N` 형식이 되길 원한다면, `withPath`에 `/admin/users`를 넘기면 됩니다.

```
use App\Models\User;

Route::get('/users', function () {
    $users = User::paginate(15);

    $users->withPath('/admin/users');

    // ...
});
```

<a name="appending-query-string-values"></a>
#### 쿼리 스트링 값 추가하기

`appends` 메서드를 사용하면 페이지네이션 링크에 쿼리 스트링 파라미터를 추가로 붙일 수 있습니다. 예를 들어, 각 링크에 `sort=votes`를 추가하고 싶다면 아래처럼 사용할 수 있습니다.

```
use App\Models\User;

Route::get('/users', function () {
    $users = User::paginate(15);

    $users->appends(['sort' => 'votes']);

    // ...
});
```

현재 요청에 포함된 모든 쿼리 스트링 파라미터를 그대로 페이지네이션 링크에 유지하려면 `withQueryString` 메서드를 사용할 수 있습니다.

```
$users = User::paginate(15)->withQueryString();
```

<a name="appending-hash-fragments"></a>
#### 해시 프래그먼트 붙이기

페이지네이션 링크 끝에 "해시 프래그먼트"(`#users` 등)를 붙이고 싶다면, `fragment` 메서드를 사용할 수 있습니다. 예를 들어, 모든 페이지네이션 링크 끝에 `#users`를 붙이려면 다음과 같이 작성합니다.

```
$users = User::paginate(15)->fragment('users');
```

<a name="displaying-pagination-results"></a>
## 페이지네이션 결과 표시

`paginate` 메서드를 호출하면 `Illuminate\Pagination\LengthAwarePaginator` 인스턴스를 받을 수 있고, `simplePaginate`는 `Illuminate\Pagination\Paginator` 인스턴스를, `cursorPaginate`는 `Illuminate\Pagination\CursorPaginator` 인스턴스를 반환합니다.

이러한 객체들은 결과셋과 관련된 여러 편리한 메서드를 제공하며, 배열처럼 반복 처리할 수도 있습니다. 따라서 결과를 조회한 뒤, [Blade](/docs/10.x/blade)에서 아래와 같이 결과와 페이지 링크를 쉽게 표시할 수 있습니다.

```blade
<div class="container">
    @foreach ($users as $user)
        {{ $user->name }}
    @endforeach
</div>

{{ $users->links() }}
```

`links` 메서드는 전체 페이지 링크를 자동으로 렌더링해줍니다. 각 링크에는 적절한 쿼리 스트링(`page` 파라미터 등)이 이미 포함됩니다. 이 메서드가 만들어내는 HTML은 [Tailwind CSS 프레임워크](https://tailwindcss.com)와 호환됩니다.

<a name="adjusting-the-pagination-link-window"></a>
### 페이지네이션 링크 창 조정

페이지네이터가 페이지 링크 목록을 보여줄 때, 현재 페이지 앞뒤로 각각 3개씩의 페이지 링크를 함께 출력합니다. `onEachSide` 메서드를 사용하면 현재 페이지 기준으로 양쪽에 표시할 추가 링크 개수를 조절할 수 있습니다.

```blade
{{ $users->onEachSide(5)->links() }}
```

<a name="converting-results-to-json"></a>
### 결과를 JSON으로 변환

라라벨 페이지네이터 클래스들은 `Illuminate\Contracts\Support\Jsonable` 인터페이스를 구현하므로, `toJson` 메서드를 호출하여 결과를 손쉽게 JSON으로 바꿀 수 있습니다. 페이지네이터 인스턴스를 라우트나 컨트롤러에서 직접 반환하면, 자동으로 JSON으로 변환되어 응답됩니다.

```
use App\Models\User;

Route::get('/users', function () {
    return User::paginate();
});
```

페이지네이터에서 만들어진 JSON 객체에는 전체 개수(`total`), 현재 페이지(`current_page`), 마지막 페이지(`last_page`) 등 다양한 메타 정보가 포함됩니다. 각 레코드들은 JSON 배열의 `data` 키에 들어가 있습니다. 아래는 페이지네이터를 라우트에서 반환했을 때 만들어지는 JSON 예시입니다.

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

기본적으로, 페이지네이션 링크를 보여주는 뷰 파일은 [Tailwind CSS](https://tailwindcss.com) 프레임워크에 맞게 설계되어 있습니다. 만약 Tailwind를 사용하지 않는다면, 자신만의 뷰 파일을 별도로 만들어서 페이지네이션 링크를 렌더링할 수 있습니다. 페이지네이터 인스턴스의 `links` 메서드에 첫 번째 인수로 뷰 이름을 넘기면 지정한 뷰가 사용됩니다.

```blade
{{ $paginator->links('view.name') }}

<!-- 추가 데이터를 뷰로 전달할 수도 있습니다. -->
{{ $paginator->links('view.name', ['foo' => 'bar']) }}
```

하지만 페이지네이션 뷰를 직접 커스터마이즈하는 가장 간편한 방법은, 뷰 파일을 프로젝트의 `resources/views/vendor` 디렉터리로 복사하는 것입니다. 이를 위해 아래 Artisan 명령어를 사용할 수 있습니다.

```shell
php artisan vendor:publish --tag=laravel-pagination
```

이 명령을 실행하면 뷰 파일들이 `resources/views/vendor/pagination` 폴더에 생성됩니다. 이 중 `tailwind.blade.php` 파일이 기본 페이지네이션 뷰이며, 이 파일을 수정해 HTML 구조나 클래스를 마음대로 바꿀 수 있습니다.

다른 파일을 기본 페이지네이션 뷰로 지정하고 싶다면, `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 `defaultView`와 `defaultSimpleView` 메서드를 호출해 변경해줄 수 있습니다.

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
### Bootstrap 사용하기

라라벨은 [Bootstrap CSS](https://getbootstrap.com/)로 구현된 페이지네이션 뷰도 기본으로 제공합니다. Tailwind 대신 Bootstrap 스타일의 뷰를 사용하려면, `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 `useBootstrapFour` 또는 `useBootstrapFive` 메서드를 호출하면 됩니다.

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

각 페이지네이터 인스턴스는 아래와 같은 메서드로 추가적인 페이지네이션 정보를 제공합니다.

메서드  |  설명
-------  |  -----------
`$paginator->count()`  |  현재 페이지의 아이템 개수를 가져옵니다.
`$paginator->currentPage()`  |  현재 페이지 번호를 반환합니다.
`$paginator->firstItem()`  |  결과에서 첫 번째 아이템의 번호를 가져옵니다.
`$paginator->getOptions()`  |  페이지네이터 옵션을 가져옵니다.
`$paginator->getUrlRange($start, $end)`  |  지정한 구간의 페이지네이션 URL 배열을 만듭니다.
`$paginator->hasPages()`  |  여러 페이지로 나눌 만큼 충분한 아이템이 있는지 확인합니다.
`$paginator->hasMorePages()`  |  아직 남은 아이템이 더 있는지 확인합니다.
`$paginator->items()`  |  현재 페이지의 아이템들을 가져옵니다.
`$paginator->lastItem()`  |  결과에서 마지막 아이템의 번호를 가져옵니다.
`$paginator->lastPage()`  |  마지막 페이지 번호를 반환합니다. (`simplePaginate` 사용 시에는 사용할 수 없습니다.)
`$paginator->nextPageUrl()`  |  다음 페이지로 이동하는 URL을 반환합니다.
`$paginator->onFirstPage()`  |  첫 번째 페이지인지 확인합니다.
`$paginator->perPage()`  |  한 페이지에 표시되는 아이템 개수입니다.
`$paginator->previousPageUrl()`  |  이전 페이지로 이동하는 URL을 반환합니다.
`$paginator->total()`  |  전체 아이템의 개수를 반환합니다. (`simplePaginate` 사용 시에는 사용할 수 없습니다.)
`$paginator->url($page)`  |  지정한 페이지 번호의 URL을 가져옵니다.
`$paginator->getPageName()`  |  페이지 정보를 저장하는 쿼리 스트링 변수명을 가져옵니다.
`$paginator->setPageName($name)`  |  페이지 정보를 저장하는 쿼리 스트링 변수명을 설정합니다.
`$paginator->through($callback)`  |  각 아이템에 콜백 함수를 적용하여 변환합니다.

<a name="cursor-paginator-instance-methods"></a>
## Cursor Paginator 인스턴스 메서드

커서 페이지네이터 인스턴스 역시 아래와 같은 메서드를 통해 상세 정보를 제공합니다.

메서드  |  설명
-------  |  -----------
`$paginator->count()`  |  현재 페이지의 아이템 개수를 가져옵니다.
`$paginator->cursor()`  |  현재 커서 인스턴스를 반환합니다.
`$paginator->getOptions()`  |  페이지네이터 옵션을 가져옵니다.
`$paginator->hasPages()`  |  여러 페이지로 나눌 만큼 충분한 아이템이 있는지 확인합니다.
`$paginator->hasMorePages()`  |  아직 남은 아이템이 더 있는지 확인합니다.
`$paginator->getCursorName()`  |  커서를 저장하는 쿼리 스트링 변수명을 가져옵니다.
`$paginator->items()`  |  현재 페이지의 아이템들을 가져옵니다.
`$paginator->nextCursor()`  |  다음 아이템 셋의 커서 인스턴스를 반환합니다.
`$paginator->nextPageUrl()`  |  다음 페이지로 이동하는 URL을 반환합니다.
`$paginator->onFirstPage()`  |  첫 번째 페이지인지 확인합니다.
`$paginator->onLastPage()`  |  마지막 페이지인지 확인합니다.
`$paginator->perPage()`  |  한 페이지에 표시되는 아이템 개수입니다.
`$paginator->previousCursor()`  |  이전 아이템 셋의 커서 인스턴스를 반환합니다.
`$paginator->previousPageUrl()`  |  이전 페이지로 이동하는 URL을 반환합니다.
`$paginator->setCursorName()`  |  커서를 저장하는 쿼리 스트링 변수명을 설정합니다.
`$paginator->url($cursor)`  |  지정한 커서 인스턴스의 URL을 가져옵니다.
