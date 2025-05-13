# 라라벨 Folio (Laravel Folio)

- [소개](#introduction)
- [설치](#installation)
    - [페이지 경로 / URI](#page-paths-uris)
    - [서브도메인 라우팅](#subdomain-routing)
- [라우트 생성](#creating-routes)
    - [중첩 라우트](#nested-routes)
    - [인덱스 라우트](#index-routes)
- [라우트 파라미터](#route-parameters)
- [라우트 모델 바인딩](#route-model-binding)
    - [소프트 삭제된 모델](#soft-deleted-models)
- [렌더 훅](#render-hooks)
- [네임드 라우트](#named-routes)
- [미들웨어](#middleware)
- [라우트 캐싱](#route-caching)

<a name="introduction"></a>
## 소개

[Laravel Folio](https://github.com/laravel/folio)는 라라벨 애플리케이션에서 라우팅을 더욱 간편하게 만들어주는 강력한 페이지 기반 라우터입니다. Folio를 사용하면, 라우트를 생성하는 일이 애플리케이션의 `resources/views/pages` 디렉터리 안에 Blade 템플릿 파일을 추가하는 것만큼 쉬워집니다.

예를 들어 `/greeting` URL로 접근할 수 있는 페이지를 만들고 싶다면, 애플리케이션의 `resources/views/pages` 디렉터리에 `greeting.blade.php` 파일을 생성하면 됩니다:

```php
<div>
    Hello World
</div>
```

<a name="installation"></a>
## 설치

Folio를 프로젝트에 설치하려면 먼저 Composer 패키지 매니저를 사용해 패키지를 추가합니다:

```shell
composer require laravel/folio
```

설치가 완료되면 `folio:install` 아티즌 명령어를 실행할 수 있습니다. 이 명령어는 Folio의 서비스 프로바이더를 애플리케이션에 등록해줍니다. 이 서비스 프로바이더는 Folio가 라우트/페이지를 탐색할 디렉터리를 등록합니다:

```shell
php artisan folio:install
```

<a name="page-paths-uris"></a>
### 페이지 경로 / URI

기본적으로 Folio는 애플리케이션의 `resources/views/pages` 디렉터리에서 페이지를 제공합니다. 하지만 필요하다면 Folio 서비스 프로바이더의 `boot` 메서드에서 이 디렉터리를 원하는 대로 변경할 수 있습니다.

예를 들어, 하나의 라라벨 애플리케이션 내에서 Folio 경로를 여러 개 지정하고 싶을 때도 있습니다. 예를 들어, "admin" 영역을 위한 Folio 전용 디렉터리와, 나머지 페이지를 위한 별도의 디렉터리를 사용하고자 할 수 있습니다.

이런 경우 `Folio::path`와 `Folio::uri` 메서드를 사용할 수 있습니다. `path` 메서드는 Folio가 HTTP 요청을 처리할 때 스캔할 디렉터리를 등록하며, `uri` 메서드는 해당 디렉터리의 "기본 URI"를 지정합니다:

```php
use Laravel\Folio\Folio;

Folio::path(resource_path('views/pages/guest'))->uri('/');

Folio::path(resource_path('views/pages/admin'))
    ->uri('/admin')
    ->middleware([
        '*' => [
            'auth',
            'verified',

            // ...
        ],
    ]);
```

<a name="subdomain-routing"></a>
### 서브도메인 라우팅

요청이 들어오는 도메인(서브도메인)에 따라 Folio 페이지를 라우팅할 수 있습니다. 예를 들어, `admin.example.com`에서 들어오는 요청을 Folio의 다른 페이지 디렉터리로 라우팅하고 싶다면, `Folio::path` 호출 후에 `domain` 메서드를 사용할 수 있습니다:

```php
use Laravel\Folio\Folio;

Folio::domain('admin.example.com')
    ->path(resource_path('views/pages/admin'));
```

`domain` 메서드를 이용하면 도메인이나 서브도메인의 일부를 파라미터로 캡처할 수도 있습니다. 이렇게 캡처된 파라미터는 페이지 템플릿에 주입됩니다:

```php
use Laravel\Folio\Folio;

Folio::domain('{account}.example.com')
    ->path(resource_path('views/pages/admin'));
```

<a name="creating-routes"></a>
## 라우트 생성

Folio 라우트는 Folio로 마운트된 디렉터리 안에 Blade 템플릿을 만들어서 생성할 수 있습니다. 기본적으로 Folio는 `resources/views/pages` 디렉터리를 마운트하지만, 이 디렉터리는 Folio 서비스 프로바이더의 `boot` 메서드에서 변경 가능합니다.

Blade 템플릿을 Folio의 마운트 디렉터리에 추가하기만 하면, 즉시 브라우저에서 해당 경로로 접근할 수 있습니다. 예를 들어, `pages/schedule.blade.php`에 페이지를 만들면 브라우저에서 `http://example.com/schedule`로 접근할 수 있습니다.

모든 Folio 페이지/라우트 목록을 빠르게 확인하고 싶다면, `folio:list` 아티즌 명령어를 실행할 수 있습니다:

```shell
php artisan folio:list
```

<a name="nested-routes"></a>
### 중첩 라우트

Folio의 디렉터리 안에 하위 디렉터리를 추가함으로써 중첩 라우트를 만들 수 있습니다. 예를 들어 `/user/profile` 경로로 접근 가능한 페이지를 만들려면, `pages/user` 디렉터리에 `profile.blade.php` 템플릿을 생성하면 됩니다:

```shell
php artisan folio:page user/profile

# pages/user/profile.blade.php → /user/profile
```

<a name="index-routes"></a>
### 인덱스 라우트

특정 디렉터리의 "인덱스" 역할을 하는 페이지를 만들고 싶을 때도 있습니다. Folio 디렉터리에 `index.blade.php` 템플릿을 추가하면, 해당 디렉터리의 루트로 들어오는 요청은 그 페이지로 라우팅됩니다:

```shell
php artisan folio:page index
# pages/index.blade.php → /

php artisan folio:page users/index
# pages/users/index.blade.php → /users
```

<a name="route-parameters"></a>
## 라우트 파라미터

종종 요청 경로의 일부를 페이지에서 받아서 사용해야 할 때가 있습니다. 예를 들어, 어떤 사용자의 프로필 ID 값에 따라 다른 결과를 보여주고 싶다면, 페이지 파일명 일부에 대괄호를 사용하면 해당 URL 세그먼트가 자동으로 변수로 주입됩니다:

```shell
php artisan folio:page "users/[id]"

# pages/users/[id].blade.php → /users/1
```

캡처된 세그먼트는 Blade 템플릿에서 변수로 바로 사용할 수 있습니다:

```html
<div>
    User {{ $id }}
</div>
```

여러 세그먼트를 한 번에 캡처하고 싶을 때는, 대괄호 안 변수명 앞에 점 세 개(`...`)를 붙이면 됩니다:

```shell
php artisan folio:page "users/[...ids]"

# pages/users/[...ids].blade.php → /users/1/2/3
```

여러 세그먼트를 캡처하면, 해당 변수는 배열로 전달되어 페이지에서 사용할 수 있습니다:

```html
<ul>
    @foreach ($ids as $id)
        <li>User {{ $id }}</li>
    @endforeach
</ul>
```

<a name="route-model-binding"></a>
## 라우트 모델 바인딩

페이지 템플릿 파일명에서 와일드카드 세그먼트가 애플리케이션의 Eloquent 모델명과 일치한다면, Folio는 라라벨의 라우트 모델 바인딩 기능을 활용해 자동으로 Eloquent 모델 인스턴스를 주입해줍니다:

```shell
php artisan folio:page "users/[User]"

# pages/users/[User].blade.php → /users/1
```

캡처된 모델은 Blade 템플릿에서 변수로 받아 사용할 수 있습니다. 이때 변수명은 "카멜 케이스"로 변환됩니다:

```html
<div>
    User {{ $user->id }}
</div>
```

#### 키(column) 변경하기

모델 바인딩에서 기본적으로는 `id` 컬럼을 사용하지만, 다른 컬럼을 사용하고 싶다면 템플릿 파일명에 컬럼명을 명시할 수 있습니다. 예를 들어 `[Post:slug].blade.php` 파일처럼, `:` 뒤에 컬럼명을 입력하면 해당 컬럼으로 바인딩이 시도됩니다.

Windows 환경에서는, 모델명과 키 사이를 `-`로 구분해 `[Post-slug].blade.php` 형식을 사용해야 합니다.

#### 모델 위치 지정

기본적으로 Folio는 애플리케이션의 `app/Models` 디렉터리에서 모델을 검색합니다. 만약 다른 위치의 모델을 바인딩하고 싶다면, 파일명에 전체 네임스페이스를 포함해서 사용할 수 있습니다:

```shell
php artisan folio:page "users/[.App.Models.User]"

# pages/users/[.App.Models.User].blade.php → /users/1
```

<a name="soft-deleted-models"></a>
### 소프트 삭제된 모델

기본적으로, 암묵적 모델 바인딩 시 소프트 삭제된(soft deleted) 모델은 조회되지 않습니다. 하지만 필요하다면, 페이지 템플릿 내에서 `withTrashed` 함수를 사용해 소프트 삭제된 모델도 함께 불러올 수 있습니다:

```php
<?php

use function Laravel\Folio\{withTrashed};

withTrashed();

?>

<div>
    User {{ $user->id }}
</div>
```

<a name="render-hooks"></a>
## 렌더 훅

기본적으로 Folio는 페이지 Blade 템플릿의 내용을 그대로 HTTP 응답으로 반환합니다. 하지만 페이지의 응답을 커스터마이즈하고 싶을 때는, 템플릿 내에서 `render` 함수를 사용할 수 있습니다.

`render` 함수는 클로저를 인자로 받으며, Folio가 렌더링 중인 `View` 인스턴스와 추가적으로 전달된 라우트 파라미터나 모델 바인딩 데이터 등을 클로저의 인자로 받아 처리할 수 있습니다. 이렇게 하면 뷰에 추가 데이터를 전달하거나 응답 전체를 자유롭게 커스터마이징할 수 있습니다:

```php
<?php

use App\Models\Post;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

use function Laravel\Folio\render;

render(function (View $view, Post $post) {
    if (! Auth::user()->can('view', $post)) {
        return response('Unauthorized', 403);
    }

    return $view->with('photos', $post->author->photos);
}); ?>

<div>
    {{ $post->content }}
</div>

<div>
    This author has also taken {{ count($photos) }} photos.
</div>
```

<a name="named-routes"></a>
## 네임드 라우트

특정 페이지 라우트에 이름을 지정하고 싶다면, `name` 함수를 사용하면 됩니다:

```php
<?php

use function Laravel\Folio\name;

name('users.index');
```

라라벨의 네임드 라우트와 마찬가지로, 이름이 지정된 Folio 페이지에 대한 URL은 `route` 함수를 이용해 생성할 수 있습니다:

```php
<a href="{{ route('users.index') }}">
    All Users
</a>
```

만약 해당 페이지에 파라미터가 필요하다면, 파라미터의 값을 배열로 넘기기만 하면 됩니다:

```php
route('users.show', ['user' => $user]);
```

<a name="middleware"></a>
## 미들웨어

개별 페이지에 미들웨어를 적용하고 싶다면, 해당 페이지의 템플릿 내에서 `middleware` 함수를 사용할 수 있습니다:

```php
<?php

use function Laravel\Folio\{middleware};

middleware(['auth', 'verified']);

?>

<div>
    Dashboard
</div>
```

또는, 여러 페이지에 공통으로 미들웨어를 적용하고 싶을 때는, `Folio::path` 메서드 이후에 `middleware` 메서드를 체이닝해서 사용하면 됩니다.

적용할 페이지를 지정하기 위해, 미들웨어 배열의 키로 적용할 페이지의 URL 패턴을 사용할 수 있습니다. 이때 `*` 문자를 와일드카드로 사용할 수 있습니다:

```php
use Laravel\Folio\Folio;

Folio::path(resource_path('views/pages'))->middleware([
    'admin/*' => [
        'auth',
        'verified',

        // ...
    ],
]);
```

익명 미들웨어를 직접 배열에 클로저 형태로 추가해 인라인으로 정의하는 것도 가능합니다:

```php
use Closure;
use Illuminate\Http\Request;
use Laravel\Folio\Folio;

Folio::path(resource_path('views/pages'))->middleware([
    'admin/*' => [
        'auth',
        'verified',

        function (Request $request, Closure $next) {
            // ...

            return $next($request);
        },
    ],
]);
```

<a name="route-caching"></a>
## 라우트 캐싱

Folio를 사용할 때는 [라라벨의 라우트 캐싱 기능](/docs/routing#route-caching)을 적극 활용하는 것이 좋습니다. Folio는 `route:cache` 아티즌 명령어가 실행될 때 Folio 페이지 정의와 라우트 이름 또한 올바르게 캐싱하여 최고의 성능을 보장합니다.
