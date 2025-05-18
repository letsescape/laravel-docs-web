# 데이터베이스: 페이지네이션 (Database: Pagination)

- [소개](#introduction)
- [기본 사용법](#basic-usage)
    - [쿼리 빌더 결과 페이지네이션](#paginating-query-builder-results)
    - [Eloquent 결과 페이지네이션](#paginating-eloquent-results)
    - [커서 페이지네이션](#cursor-pagination)
    - [페이지네이터를 수동으로 생성하기](#manually-creating-a-paginator)
    - [페이지네이션 URL 커스터마이징](#customizing-pagination-urls)
- [페이지네이션 결과 표시하기](#displaying-pagination-results)
    - [페이지네이션 링크 범위 조정](#adjusting-the-pagination-link-window)
    - [결과를 JSON으로 변환하기](#converting-results-to-json)
- [페이지네이션 뷰 커스터마이징](#customizing-the-pagination-view)
    - [Bootstrap 사용하기](#using-bootstrap)
- [Paginator 및 LengthAwarePaginator 인스턴스 메서드](#paginator-instance-methods)
- [Cursor Paginator 인스턴스 메서드](#cursor-paginator-instance-methods)

<a name="introduction"></a>
## 소개

다른 프레임워크들에서는 페이지네이션이 상당히 번거로울 수 있습니다. 라라벨은 더 쉽고 편리한 페이지네이션 방식을 제공합니다. 라라벨의 페이지네이터는 [쿼리 빌더](/docs/8.x/queries)와 [Eloquent ORM](/docs/8.x/eloquent) 모두에 통합되어 있어, 별도의 설정 없이도 데이터베이스 레코드를 쉽게 페이지네이션할 수 있습니다.

기본적으로, 페이지네이터가 생성하는 HTML은 [Tailwind CSS 프레임워크](https://tailwindcss.com/)와 호환됩니다. 또한 Bootstrap 기반의 페이지네이션 뷰도 지원됩니다.

<a name="tailwind-jit"></a>
#### Tailwind JIT

라라벨의 기본 Tailwind 페이지네이션 뷰와 Tailwind JIT 엔진을 같이 사용하는 경우, 애플리케이션의 `tailwind.config.js` 파일의 `content` 설정에 라라벨의 페이지네이션 뷰 경로가 포함되어야 해당 뷰에 사용된 Tailwind 클래스가 제거되지 않습니다:

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

아이템을 페이지네이션하는 방법에는 여러 가지가 있습니다. 가장 간단한 방법은 [쿼리 빌더](/docs/8.x/queries)나 [Eloquent 쿼리](/docs/8.x/eloquent)에서 `paginate` 메서드를 사용하는 것입니다. `paginate` 메서드는 사용자가 보고 있는 현재 페이지를 기준으로 쿼리의 "limit"과 "offset"을 자동으로 설정해줍니다. 기본적으로, 현재 페이지는 HTTP 요청의 쿼리 스트링에서 `page` 인수의 값을 통해 감지합니다. 이 값은 라라벨에서 자동으로 감지하며, 페이지네이터가 생성하는 링크에도 자동으로 포함됩니다.

아래 예시에서는, `paginate` 메서드에 페이지당 보여주고 싶은 수만 인수로 전달하면 됩니다. 여기에서는 한 페이지에 `15`개의 아이템을 보여주도록 지정합니다:

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
#### 간단한 페이지네이션(Simple Pagination)

`paginate` 메서드는 쿼리에서 전체 레코드 수를 먼저 카운트한 후, 실제 데이터를 데이터베이스에서 가져옵니다. 이렇게 전체 페이지 수를 알 수 있게 됩니다. 하지만, 만약 애플리케이션 UI에서 전체 페이지 수를 보여줄 계획이 없다면 전체 레코드 카운트는 불필요할 수 있습니다.

이런 경우, 단순히 "다음"과 "이전" 링크만 필요하다면, `simplePaginate` 메서드를 사용해 더 효율적으로 쿼리를 수행할 수 있습니다:

```
$users = DB::table('users')->simplePaginate(15);
```

<a name="paginating-eloquent-results"></a>
### Eloquent 결과 페이지네이션

[Eloquent](/docs/8.x/eloquent) 쿼리에 대해서도 페이지네이션을 적용할 수 있습니다. 아래 예시에서는 `App\Models\User` 모델에 대해 페이지당 15개의 레코드를 보여주도록 페이지네이션을 적용합니다. 쿼리 빌더에서 사용하는 방식과 거의 동일합니다:

```
use App\Models\User;

$users = User::paginate(15);
```

또한, 쿼리에 `where` 조건과 같은 제약을 추가한 후에도 `paginate` 메서드를 사용할 수 있습니다:

```
$users = User::where('votes', '>', 100)->paginate(15);
```

Eloquent 모델에서도 마찬가지로 `simplePaginate` 메서드를 사용할 수 있습니다:

```
$users = User::where('votes', '>', 100)->simplePaginate(15);
```

그리고 Eloquent 모델에 대해 `cursorPaginate` 메서드를 사용할 수도 있습니다:

```
$users = User::where('votes', '>', 100)->cursorPaginate(15);
```

<a name="multiple-paginator-instances-per-page"></a>
#### 한 페이지에 여러 개의 페이지네이터 인스턴스 사용하기

때때로 하나의 화면에서 서로 다른 두 개의 페이지네이터를 동시에 렌더링해야 할 수 있습니다. 그러나 두 인스턴스 모두 `page` 쿼리 스트링 파라미터를 사용하면 충돌이 발생할 수 있습니다. 이럴 때는 `paginate`, `simplePaginate`, `cursorPaginate` 메서드의 세 번째 인수에 원하는 쿼리 파라미터 이름을 지정해 충돌을 방지할 수 있습니다:

```
use App\Models\User;

$users = User::where('votes', '>', 100)->paginate(
    $perPage = 15, $columns = ['*'], $pageName = 'users'
);
```

<a name="cursor-pagination"></a>
### 커서 페이지네이션(Cursor Pagination)

`paginate`와 `simplePaginate`는 SQL의 "offset" 구문을 사용해 쿼리를 생성하지만, 커서 페이지네이션은 쿼리에 정렬 컬럼 값을 활용해서 "where" 구문으로 조건을 걸어 데이터를 효율적으로 가져옵니다. 이 방식은 특히 대규모 데이터셋이나 "무한 스크롤" UI에서 성능이 매우 뛰어납니다.

오프셋 기반 페이지네이션은 URL 쿼리 스트링에 페이지 번호를 포함하지만, 커서 기반 페이지네이션은 쿼리 스트링에 "cursor"라는 문자열을 포함시킵니다. 커서는 다음 쿼리가 어디에서 시작할지, 어떤 방향으로 페이지를 넘길지에 대한 정보를 담고 있는 인코딩된 문자열입니다:

```nothing
http://localhost/users?cursor=eyJpZCI6MTUsIl9wb2ludHNUb05leHRJdGVtcyI6dHJ1ZX0
```

쿼리 빌더의 `cursorPaginate` 메서드를 사용해 커서 기반 페이지네이터 인스턴스를 생성할 수 있습니다. 이 메서드는 `Illuminate\Pagination\CursorPaginator` 인스턴스를 반환합니다:

```
$users = DB::table('users')->orderBy('id')->cursorPaginate(15);
```

커서 페이지네이터 인스턴스를 얻은 후에는, [페이지네이션 결과 표시](#displaying-pagination-results) 섹션에서 소개하는 것과 같은 방식으로 결과를 보여줄 수 있습니다. 커서 페이지네이터에서 제공하는 인스턴스 메서드에 대한 자세한 정보는 [Cursor Paginator 인스턴스 메서드](#cursor-paginator-instance-methods) 문서를 참고하세요.

> [!NOTE]
> 커서 페이지네이션을 사용하려면, 반드시 쿼리에 "order by" 구문이 포함되어야 합니다.

<a name="cursor-vs-offset-pagination"></a>
#### 커서 페이지네이션 vs 오프셋 페이지네이션

커서 페이지네이션과 오프셋 페이지네이션의 차이를 예시 SQL 쿼리를 통해 살펴보겠습니다. 아래 두 쿼리는 모두 `id` 컬럼으로 정렬된 `users` 테이블의 "두 번째 페이지" 결과를 가져옵니다:

```sql
# 오프셋 페이지네이션(Offset Pagination)...
select * from users order by id asc limit 15 offset 15;

# 커서 페이지네이션(Cursor Pagination)...
select * from users where id > 15 order by id asc limit 15;
```

커서 페이지네이션 쿼리는 오프셋 페이지네이션에 비해 다음과 같은 장점이 있습니다:

- 대규모 데이터셋에서, 정렬 기준 컬럼에 인덱스가 있다면 커서 페이지네이션이 더 나은 성능을 보입니다. "offset" 구문은 이전에 일치한 모든 데이터를 스캔하기 때문입니다.
- 데이터셋에 삽입/삭제가 잦은 경우, 오프셋 페이지네이션은 사용자가 보고 있는 페이지에서 레코드를 건너뛰거나 중복으로 보이게 할 수 있습니다.

단, 커서 페이지네이션에는 다음과 같은 한계가 있습니다:

- `simplePaginate`처럼, 커서 페이지네이션은 "다음"과 "이전" 링크만 지원하고, 페이지 번호가 있는 링크는 지원하지 않습니다.
- 정렬 기준이 적어도 하나의 유니크 컬럼(또는 유니크 컬럼들의 조합)에 기반해야 합니다. null 값이 포함된 컬럼은 사용할 수 없습니다.
- "order by"에 사용된 쿼리 표현식은 반드시 alias로 지정해서 "select" 구문에도 추가되어야 지원됩니다.

<a name="manually-creating-a-paginator"></a>
### 페이지네이터를 수동으로 생성하기

이미 메모리 상에 존재하는 배열을 페이지네이션할 필요가 있을 때, 페이지네이션 인스턴스를 직접 생성할 수 있습니다. 필요에 따라 `Illuminate\Pagination\Paginator`, `Illuminate\Pagination\LengthAwarePaginator`, `Illuminate\Pagination\CursorPaginator` 중 하나를 사용할 수 있습니다.

`Paginator`와 `CursorPaginator` 클래스는 전체 결과 개수를 알 필요는 없습니다. 대신, 이 클래스들은 마지막 페이지의 인덱스를 조회하는 메서드를 제공하지 않습니다. 반면, `LengthAwarePaginator`는 전체 결과 개수도 인수로 받아야 합니다.

정리하면, `Paginator`는 쿼리 빌더의 `simplePaginate`와, `CursorPaginator`는 `cursorPaginate`와, `LengthAwarePaginator`는 `paginate`와 각각 대응됩니다.

> [!NOTE]
> 페이지네이터 인스턴스를 수동으로 생성할 때, 넘겨주는 배열을 직접 "슬라이스(slice)"해주어야 합니다. 방법을 잘 모르겠다면 [array_slice](https://secure.php.net/manual/en/function.array-slice.php) PHP 함수를 참고하세요.

<a name="customizing-pagination-urls"></a>
### 페이지네이션 URL 커스터마이징

기본적으로 페이지네이터가 생성하는 링크는 현재 요청의 URI를 기반으로 합니다. 하지만, 페이지네이터의 `withPath` 메서드를 이용하면 링크가 생성될 때 사용할 URI를 원하는 대로 지정할 수 있습니다. 예를 들어, `http://example.com/admin/users?page=N`과 같은 링크를 만들고 싶다면 `withPath` 메서드에 `/admin/users`를 전달하세요:

```
use App\Models\User;

Route::get('/users', function () {
    $users = User::paginate(15);

    $users->withPath('/admin/users');

    //
});
```

<a name="appending-query-string-values"></a>
#### 쿼리 스트링 값 추가(Appending Query String Values)

`appends` 메서드를 사용하면, 페이지네이션 링크의 쿼리 스트링에 원하는 값을 추가할 수 있습니다. 예를 들어, 각 페이지네이션 링크에 `sort=votes`를 추가하려면 아래와 같이 호출합니다:

```
use App\Models\User;

Route::get('/users', function () {
    $users = User::paginate(15);

    $users->appends(['sort' => 'votes']);

    //
});
```

현재 요청의 모든 쿼리 스트링 값을 페이지네이션 링크에 추가하려면 `withQueryString` 메서드를 사용할 수 있습니다:

```
$users = User::paginate(15)->withQueryString();
```

<a name="appending-hash-fragments"></a>
#### 해시 프래그먼트 추가(Appending Hash Fragments)

페이지네이터가 생성한 URL에 "해시 프래그먼트"를 추가할 필요가 있다면, `fragment` 메서드를 사용할 수 있습니다. 예를 들어, 각 페이지네이션 링크 마지막에 `#users`를 추가하려면 다음과 같이 하면 됩니다:

```
$users = User::paginate(15)->fragment('users');
```

<a name="displaying-pagination-results"></a>
## 페이지네이션 결과 표시하기

`paginate` 메서드를 사용하면 `Illuminate\Pagination\LengthAwarePaginator` 인스턴스가, `simplePaginate` 메서드를 사용하면 `Illuminate\Pagination\Paginator` 인스턴스가, `cursorPaginate` 메서드를 사용하면 `Illuminate\Pagination\CursorPaginator` 인스턴스가 반환됩니다.

이 객체들은 각각 결과셋과 관련된 다양한 메서드를 제공합니다. 이외에도, 배열처럼 반복(loop)할 수 있으므로 데이터를 바로 출력하거나, [Blade](/docs/8.x/blade)를 이용해 쉽게 렌더링할 수 있습니다:

```html
<div class="container">
    @foreach ($users as $user)
        {{ $user->name }}
    @endforeach
</div>

{{ $users->links() }}
```

`links` 메서드는 결과셋의 나머지 페이지로 이동할 수 있는 링크들을 렌더링합니다. 각 링크에는 이미 올바른 `page` 쿼리 스트링 변수가 포함되어 있습니다. 참고로, `links` 메서드가 생성하는 HTML은 [Tailwind CSS 프레임워크](https://tailwindcss.com)와 호환됩니다.

<a name="adjusting-the-pagination-link-window"></a>
### 페이지네이션 링크 범위 조정

페이지네이터가 렌더링하는 페이지네이션 링크는 현재 페이지 번호와, 그 앞뒤로 기본 3개씩의 페이지 링크를 보여줍니다. `onEachSide` 메서드를 사용하면, 현재 페이지 주변에 몇 개의 추가 링크를 표시할지 조정할 수 있습니다:

```
{{ $users->onEachSide(5)->links() }}
```

<a name="converting-results-to-json"></a>
### 결과를 JSON으로 변환하기

라라벨의 페이지네이터 클래스들은 `Illuminate\Contracts\Support\Jsonable` 인터페이스를 구현하고 있어 `toJson` 메서드를 사용할 수 있습니다. 페이지네이션 결과를 JSON으로 변환하는 것이 매우 쉽습니다. 또한 페이지네이터 인스턴스를 라우트나 컨트롤러 액션에서 리턴하면, 자동으로 JSON으로 변환됩니다:

```
use App\Models\User;

Route::get('/users', function () {
    return User::paginate();
});
```

페이지네이터가 생성하는 JSON에는 `total`, `current_page`, `last_page` 등 다양한 메타 정보가 포함됩니다. 실제 레코드들은 JSON 배열의 `data` 키를 통해 사용할 수 있습니다. 아래는 라우트에서 페이지네이터 인스턴스를 그대로 반환했을 때 생성되는 JSON 예시입니다:

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

기본적으로, 페이지네이션 링크를 렌더링하는 뷰는 [Tailwind CSS](https://tailwindcss.com) 프레임워크와 호환되게 되어 있습니다. Tailwind를 사용하지 않는다면 원하는 뷰 파일을 만들어 링크 렌더링 방식을 직접 정의할 수도 있습니다. 페이지네이터 인스턴스에서 `links` 메서드 호출 시 첫 번째 인수로 뷰 이름을 전달하면 적용됩니다:

```
{{ $paginator->links('view.name') }}

// 뷰로 추가 데이터 전달...
{{ $paginator->links('view.name', ['foo' => 'bar']) }}
```

하지만 가장 쉬운 커스터마이징 방법은 아래 `vendor:publish` 명령어로 뷰 파일을 내 애플리케이션의 `resources/views/vendor` 디렉토리로 내보내 직접 수정하는 것입니다:

```
php artisan vendor:publish --tag=laravel-pagination
```

이 명령을 실행하면, 페이지네이션 뷰가 `resources/views/vendor/pagination` 폴더에 복사됩니다. 이 디렉토리의 `tailwind.blade.php` 파일이 기본 페이지네이션 뷰이므로, 이 파일을 수정하면 원하는 HTML로 커스터마이징할 수 있습니다.

기본 페이지네이션 뷰를 다른 파일로 변경하려면, `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 페이지네이터의 `defaultView`와 `defaultSimpleView` 메서드를 호출하세요:

```
<?php

namespace App\Providers;

use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\Blade;
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

라라벨에는 [Bootstrap CSS](https://getbootstrap.com/)를 사용해 만들어진 페이지네이션 뷰도 기본 포함되어 있습니다. Tailwind가 아닌 Bootstrap 기반 뷰를 사용하려면, 역시 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 페이지네이터의 `useBootstrap` 메서드를 호출하세요:

```
use Illuminate\Pagination\Paginator;

/**
 * Bootstrap any application services.
 *
 * @return void
 */
public function boot()
{
    Paginator::useBootstrap();
}
```

<a name="paginator-instance-methods"></a>
## Paginator / LengthAwarePaginator 인스턴스 메서드

각 페이지네이터 인스턴스는 아래 메서드들을 통해 추가적인 페이지네이션 정보를 제공합니다:

메서드  |  설명
-------  |  -----------
`$paginator->count()`  |  현재 페이지에 포함된 아이템 수를 가져옵니다.
`$paginator->currentPage()`  |  현재 페이지 번호를 가져옵니다.
`$paginator->firstItem()`  |  결과 중 첫 번째 아이템의 번호를 가져옵니다.
`$paginator->getOptions()`  |  페이지네이터 옵션 값을 가져옵니다.
`$paginator->getUrlRange($start, $end)`  |  지정한 범위의 페이지네이션 URL을 생성합니다.
`$paginator->hasPages()`  |  여러 페이지로 나눌 수 있는 충분한 아이템이 있는지 확인합니다.
`$paginator->hasMorePages()`  |  데이터 저장소에 다음 페이지가 존재하는지 확인합니다.
`$paginator->items()`  |  현재 페이지의 아이템들을 가져옵니다.
`$paginator->lastItem()`  |  결과 중 마지막 아이템의 번호를 가져옵니다.
`$paginator->lastPage()`  |  마지막 페이지의 페이지 번호를 가져옵니다. (`simplePaginate`에서는 사용할 수 없습니다.)
`$paginator->nextPageUrl()`  |  다음 페이지로 이동하는 URL을 가져옵니다.
`$paginator->onFirstPage()`  |  현재 페이지가 첫 번째 페이지인지 확인합니다.
`$paginator->perPage()`  |  한 페이지에 표시할 아이템 수를 가져옵니다.
`$paginator->previousPageUrl()`  |  이전 페이지로 이동하는 URL을 가져옵니다.
`$paginator->total()`  |  데이터 저장소에서 일치하는 전체 아이템 수를 가져옵니다. (`simplePaginate`에서는 사용할 수 없습니다.)
`$paginator->url($page)`  |  지정한 페이지 번호에 대한 URL을 가져옵니다.
`$paginator->getPageName()`  |  페이지 정보를 저장하는 쿼리 스트링 변수명을 가져옵니다.
`$paginator->setPageName($name)`  |  페이지 정보를 저장할 쿼리 스트링 변수명을 설정합니다.

<a name="cursor-paginator-instance-methods"></a>
## Cursor Paginator 인스턴스 메서드

각 커서 페이지네이터 인스턴스는 다음과 같은 추가 메서드를 제공합니다:

메서드  |  설명
-------  |  -----------
`$paginator->count()`  |  현재 페이지에 포함된 아이템 수를 가져옵니다.
`$paginator->cursor()`  |  현재 커서 인스턴스를 가져옵니다.
`$paginator->getOptions()`  |  페이지네이터 옵션 값을 가져옵니다.
`$paginator->hasPages()`  |  여러 페이지로 나눌 수 있는 충분한 아이템이 있는지 확인합니다.
`$paginator->hasMorePages()`  |  데이터 저장소에 다음 페이지가 존재하는지 확인합니다.
`$paginator->getCursorName()`  |  커서를 저장하는 쿼리 스트링 변수명을 가져옵니다.
`$paginator->items()`  |  현재 페이지의 아이템들을 가져옵니다.
`$paginator->nextCursor()`  |  다음 아이템 셋에 대한 커서 인스턴스를 가져옵니다.
`$paginator->nextPageUrl()`  |  다음 페이지로 이동하는 URL을 가져옵니다.
`$paginator->onFirstPage()`  |  현재 페이지가 첫 번째 페이지인지 확인합니다.
`$paginator->perPage()`  |  한 페이지에 표시할 아이템 수를 가져옵니다.
`$paginator->previousCursor()`  |  이전 아이템 셋에 대한 커서 인스턴스를 가져옵니다.
`$paginator->previousPageUrl()`  |  이전 페이지로 이동하는 URL을 가져옵니다.
`$paginator->setCursorName()`  |  커서를 저장할 쿼리 스트링 변수명을 설정합니다.
`$paginator->url($cursor)`  |  지정한 커서 인스턴스에 대한 URL을 가져옵니다.
