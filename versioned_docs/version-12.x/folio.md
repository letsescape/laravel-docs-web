# 라라벨 폴리오 (Laravel Folio)

- [소개](#introduction)
- [설치](#installation)
    - [페이지 경로 / URI](#page-paths-uris)
    - [서브도메인 라우팅](#subdomain-routing)
- [라우트 생성하기](#creating-routes)
    - [중첩 라우트](#nested-routes)
    - [인덱스 라우트](#index-routes)
- [라우트 파라미터](#route-parameters)
- [라우트 모델 바인딩](#route-model-binding)
    - [소프트 삭제된 모델](#soft-deleted-models)
- [렌더링 후크](#render-hooks)
- [이름이 있는 라우트](#named-routes)
- [미들웨어](#middleware)
- [라우트 캐시](#route-caching)

<a name="introduction"></a>
## 소개

[라라벨 Folio](https://github.com/laravel/folio)는 라라벨 애플리케이션에서 라우팅을 보다 쉽게 만들어주는 강력한 페이지 기반 라우터입니다. Folio를 사용하면, 간단히 애플리케이션의 `resources/views/pages` 디렉터리에 Blade 템플릿을 생성하는 것만으로 라우트를 정의할 수 있습니다.

예를 들어, `/greeting` URL로 접근 가능한 페이지를 만들고 싶다면, 애플리케이션의 `resources/views/pages` 디렉터리에 `greeting.blade.php` 파일을 생성하면 됩니다.

```php
<div>
    Hello World
</div>
```

<a name="installation"></a>
## 설치

Folio를 시작하려면 Composer 패키지 매니저를 통해 Folio를 프로젝트에 설치합니다.

```shell
composer require laravel/folio
```

설치가 완료되면 `folio:install` 아티즌 명령어를 실행하여 Folio의 서비스 프로바이더를 애플리케이션에 등록할 수 있습니다. 이 서비스 프로바이더는 Folio가 라우트와 페이지를 탐색할 디렉터리를 등록합니다.

```shell
php artisan folio:install
```

<a name="page-paths-uris"></a>
### 페이지 경로 / URI

기본적으로 Folio는 애플리케이션의 `resources/views/pages` 디렉터리에서 페이지를 제공합니다. 필요에 따라 이 디렉터리들은 Folio 서비스 프로바이더의 `boot` 메서드에서 커스터마이즈할 수 있습니다.

예를 들어, 같은 라라벨 애플리케이션 내에서 여러 Folio 경로를 지정하고 싶은 경우가 있습니다. "admin" 영역용 Folio 페이지 디렉터리와, 일반 사용자용 Folio 페이지 디렉터리를 분리해 관리하고 싶을 때가 그렇습니다.

이럴 때는 `Folio::path`와 `Folio::uri` 메서드를 사용할 수 있습니다. `path` 메서드는 Folio가 HTTP 요청을 라우팅할 때 탐색할 디렉터리를 등록하며, `uri` 메서드는 해당 디렉터리로 매핑되는 "기본 URI"를 지정합니다.

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

요청이 들어오는 서브도메인에 따라 다른 페이지 디렉터리로 라우팅할 수도 있습니다. 예를 들어, `admin.example.com`에서 오는 요청만 다른 Folio 페이지 디렉터리로 라우팅하려는 경우, `Folio::path` 메서드 호출 이후에 `domain` 메서드를 체이닝하여 사용할 수 있습니다.

```php
use Laravel\Folio\Folio;

Folio::domain('admin.example.com')
    ->path(resource_path('views/pages/admin'));
```

또한, `domain` 메서드는 도메인 또는 서브도메인의 일부를 파라미터로 캡처하여 사용할 수 있습니다. 이 파라미터는 페이지 템플릿에 전달됩니다.

```php
use Laravel\Folio\Folio;

Folio::domain('{account}.example.com')
    ->path(resource_path('views/pages/admin'));
```

<a name="creating-routes"></a>
## 라우트 생성하기

Folio의 라우트는 Folio가 마운트된 디렉터리 중 하나에 Blade 템플릿 파일을 추가하는 것만으로 생성할 수 있습니다. 기본적으로 Folio는 `resources/views/pages` 디렉터리를 마운트하지만, Folio 서비스 프로바이더의 `boot` 메서드에서 이 디렉터리들을 변경할 수 있습니다.

Folio가 마운트된 디렉터리에 Blade 템플릿이 저장되면, 곧바로 브라우저를 통해 접근할 수 있습니다. 예를 들어 `pages/schedule.blade.php` 파일은 `http://example.com/schedule` 경로에서 바로 확인할 수 있습니다.

현재 Folio에 등록된 모든 페이지/라우트를 빠르게 확인하려면 `folio:list` 아티즌 명령어를 사용할 수 있습니다.

```shell
php artisan folio:list
```

<a name="nested-routes"></a>
### 중첩 라우트

Folio의 디렉터리 내에 추가로 디렉터리를 생성해서 중첩 라우트를 만들 수 있습니다. 예를 들어 `/user/profile` 주소에서 접근 가능한 페이지를 만들려면, `pages/user` 디렉터리에 `profile.blade.php` 템플릿을 생성하시기 바랍니다.

```shell
php artisan folio:page user/profile

# pages/user/profile.blade.php → /user/profile
```

<a name="index-routes"></a>
### 인덱스 라우트

특정 디렉터리의 "인덱스" 역할을 하는 페이지를 만들고 싶은 경우, 해당 Folio 디렉터리에 `index.blade.php` 템플릿을 추가하면 됩니다. 이렇게 하면 디렉터리의 루트로 접속했을 때 이 페이지가 라우팅됩니다.

```shell
php artisan folio:page index
# pages/index.blade.php → /

php artisan folio:page users/index
# pages/users/index.blade.php → /users
```

<a name="route-parameters"></a>
## 라우트 파라미터

URL로 들어오는 요청 경로의 일부를 페이지로 전달받아 활용해야 할 때가 많습니다. 예를 들어, 특정 사용자의 프로필 페이지라면 해당 사용자의 "ID" 정보를 URL에서 얻어와야 하겠죠. 이를 위해 페이지 파일명 일부를 대괄호로 감싸주면 Folio가 해당 구간을 자동으로 파라미터로 인식해 Blade 템플릿에 전달합니다.

```shell
php artisan folio:page "users/[id]"

# pages/users/[id].blade.php → /users/1
```

이렇게 캡처된 값은 Blade 템플릿 변수로 바로 사용할 수 있습니다.

```html
<div>
    User {{ $id }}
</div>
```

여러 구간을 한 번에 캡처하고 싶다면 대괄호 앞에 점 세 개 `...`를 붙이면 됩니다.

```shell
php artisan folio:page "users/[...ids]"

# pages/users/[...ids].blade.php → /users/1/2/3
```

여러 구간을 캡처하면, 캡처된 값이 배열로 페이지에 주입됩니다.

```html
<ul>
    @foreach ($ids as $id)
        <li>User {{ $id }}</li>
    @endforeach
</ul>
```

<a name="route-model-binding"></a>
## 라우트 모델 바인딩

페이지 템플릿 파일명에 와일드카드 구간이 애플리케이션의 Eloquent 모델명과 일치할 경우, Folio는 라라벨의 라우트 모델 바인딩 기능을 이용해 해당 모델 인스턴스를 찾아 페이지에 자동으로 주입합니다.

```shell
php artisan folio:page "users/[User]"

# pages/users/[User].blade.php → /users/1
```

이렇게 주입된 모델 인스턴스는 Blade 템플릿에서 변수로 바로 사용할 수 있으며, 변수명은 카멜케이스로 변환됩니다.

```html
<div>
    User {{ $user->id }}
</div>
```

#### 바인딩 키 커스터마이즈하기

경우에 따라 Eloquent 모델을 `id`가 아닌 다른 컬럼으로 바인딩하고 싶을 수 있습니다. 이럴 때는 파일명에 사용할 컬럼명을 명시해주면 됩니다. 예를 들어 `[Post:slug].blade.php` 파일의 경우, Folio는 `slug` 컬럼으로 모델을 찾습니다.

Windows 환경에서는 모델명과 키 구분에 콜론 대신 하이픈 `-`을 사용하십시오: `[Post-slug].blade.php`.

#### 모델 위치 지정

기본적으로 Folio는 애플리케이션의 `app/Models` 디렉터리에서 모델을 찾습니다. 다른 위치의 모델을 사용하려면 템플릿 파일명에 전체 네임스페이스(class)를 함께 지정할 수 있습니다.

```shell
php artisan folio:page "users/[.App.Models.User]"

# pages/users/[.App.Models.User].blade.php → /users/1
```

<a name="soft-deleted-models"></a>
### 소프트 삭제된 모델

기본적으로, 소프트 삭제된(soft deleted) 모델은 암묵적(implicit) 모델 바인딩시 조회되지 않습니다. 하지만 필요할 경우, 페이지 템플릿 내에서 `withTrashed` 함수를 호출하여 소프트 삭제된 모델까지 조회하도록 Folio에 명령할 수 있습니다.

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
## 렌더링 후크

기본적으로 Folio는 페이지의 Blade 템플릿 내용을 그대로 해당 요청에 대한 응답으로 반환합니다. 그러나, 필요하다면 템플릿 내에서 `render` 함수를 호출해 응답을 직접 커스터마이즈할 수도 있습니다.

`render` 함수는 클로저를 인수로 받으며, 이 클로저에는 Folio가 렌더링 중인 `View` 인스턴스가 전달됩니다. 이를 통해 추가 데이터를 뷰에 전달하거나 전체 응답을 자유롭게 정의할 수 있습니다. 또한, 전달되는 인수에는 라우트 파라미터나 모델 바인딩 결과도 함께 제공됩니다.

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
## 이름이 있는 라우트

특정 페이지의 라우트에 이름을 지정하려면 `name` 함수를 사용할 수 있습니다.

```php
<?php

use function Laravel\Folio\name;

name('users.index');
```

라라벨의 이름이 있는 라우트처럼, `route` 함수를 사용해 이름이 할당된 Folio 페이지의 URL을 손쉽게 생성할 수 있습니다.

```php
<a href="{{ route('users.index') }}">
    All Users
</a>
```

페이지에 파라미터가 있다면, 그 값들을 `route` 함수에 배열로 전달하면 됩니다.

```php
route('users.show', ['user' => $user]);
```

<a name="middleware"></a>
## 미들웨어

특정 페이지에만 미들웨어를 적용하고 싶은 경우, 해당 페이지의 템플릿 내에서 `middleware` 함수를 호출하면 됩니다.

```php
<?php

use function Laravel\Folio\{middleware};

middleware(['auth', 'verified']);

?>

<div>
    Dashboard
</div>
```

여러 페이지에 한 번에 미들웨어를 할당하고 싶을 때는 `Folio::path` 메서드 이후에 `middleware` 메서드를 체이닝해 사용하면 됩니다.

적용 대상을 명시적으로 지정하려면, 미들웨어 배열의 키에 각 페이지의 URL 패턴을 지정하세요. 이때 `*` 문자를 와일드카드로 사용할 수 있습니다.

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

미들웨어 배열에 클로저(익명 함수)를 포함시켜 인라인 미들웨어도 정의할 수 있습니다.

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
## 라우트 캐시

Folio를 사용할 때는 반드시 [라라벨의 라우트 캐시 기능](/docs/12.x/routing#route-caching)을 적극 활용하는 것이 좋습니다. Folio는 `route:cache` 아티즌 명령어를 감지하여, Folio 페이지 정의와 라우트 이름이 올바르게 캐싱되도록 하여 최대 성능을 제공합니다.
