# 라라벨 Folio (Laravel Folio)

- [소개](#introduction)
- [설치](#installation)
    - [페이지 경로 / URI](#page-paths-uris)
    - [서브도메인 라우팅](#subdomain-routing)
- [라우트 생성하기](#creating-routes)
    - [중첩 라우트](#nested-routes)
    - [인덱스 라우트](#index-routes)
- [라우트 파라미터](#route-parameters)
- [라우트 모델 바인딩](#route-model-binding)
    - [소프트 삭제 모델](#soft-deleted-models)
- [렌더링 훅](#render-hooks)
- [네임드 라우트](#named-routes)
- [미들웨어](#middleware)
- [라우트 캐싱](#route-caching)

<a name="introduction"></a>
## 소개

[Laravel Folio](https://github.com/laravel/folio)는 라라벨 애플리케이션에서 라우팅을 훨씬 간편하게 만들어주는 강력한 페이지 기반 라우터입니다. Folio를 사용하면, 라우트를 생성하는 일이 애플리케이션의 `resources/views/pages` 디렉터리에 Blade 템플릿 파일을 생성하는 것만큼이나 쉬워집니다.

예를 들어, `/greeting` URL로 접속 가능한 페이지를 만들고 싶다면, 애플리케이션의 `resources/views/pages` 디렉터리에 `greeting.blade.php` 파일을 생성하면 됩니다:

```php
<div>
    Hello World
</div>
```

<a name="installation"></a>
## 설치

가장 먼저, Composer 패키지 관리자를 사용하여 프로젝트에 Folio를 설치합니다:

```bash
composer require laravel/folio
```

Folio 설치가 끝나면, `folio:install` 아티즌 명령어를 실행할 수 있습니다. 이 명령어는 Folio의 서비스 프로바이더를 애플리케이션에 설치해줍니다. 이 서비스 프로바이더는 Folio가 라우트/페이지를 검색할 디렉터리를 등록합니다:

```bash
php artisan folio:install
```

<a name="page-paths-uris"></a>
### 페이지 경로 / URI

기본적으로 Folio는 애플리케이션의 `resources/views/pages` 디렉터리에서 페이지를 제공합니다. 하지만 Folio 서비스 프로바이더의 `boot` 메서드에서 이 디렉터리를 원하는 대로 커스텀할 수 있습니다.

예를 들어, 하나의 라라벨 애플리케이션에서 여러 Folio 경로를 지정해야 할 때가 있습니다. 애플리케이션의 "admin" 영역은 별도의 Folio 페이지 디렉터리를 사용하고, 일반 페이지들은 또 다른 디렉터리를 사용하도록 구성할 수 있습니다.

이럴 때는 `Folio::path`와 `Folio::uri` 메서드를 활용하면 됩니다. `path` 메서드는 Folio가 HTTP 요청을 처리할 때 페이지를 탐색할 디렉터리를 등록하고, `uri` 메서드는 해당 디렉터리의 페이지에 대한 "기준 URI"를 지정합니다:

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

요청의 서브도메인에 따라 페이지를 라우팅할 수도 있습니다. 예를 들어, `admin.example.com`에서 들어오는 요청을 나머지 Folio 페이지들과는 다른 페이지 디렉터리로 라우팅하고 싶을 때가 있습니다. 이럴 때는 `Folio::path` 메서드 뒤에 `domain` 메서드를 호출하여 설정할 수 있습니다:

```php
use Laravel\Folio\Folio;

Folio::domain('admin.example.com')
    ->path(resource_path('views/pages/admin'));
```

또한, `domain` 메서드를 이용하면 도메인 또는 서브도메인의 일부분을 파라미터로 캡처할 수 있습니다. 이렇게 캡처된 파라미터는 페이지 템플릿에서 사용할 수 있습니다:

```php
use Laravel\Folio\Folio;

Folio::domain('{account}.example.com')
    ->path(resource_path('views/pages/admin'));
```

<a name="creating-routes"></a>
## 라우트 생성하기

Folio 라우트는 Folio에 마운트된 디렉터리 중 한 곳에 Blade 템플릿을 생성함으로써 만들 수 있습니다. 기본적으로 Folio는 `resources/views/pages` 디렉터리를 마운트하지만, 필요에 따라 Folio 서비스 프로바이더의 `boot` 메서드에서 디렉터리를 변경할 수 있습니다.

Blade 템플릿을 Folio에 마운트된 디렉터리에 만들어두기만 하면, 바로 브라우저에서 해당 페이지에 접속할 수 있습니다. 예를 들어 `pages/schedule.blade.php`에 페이지를 만들었다면, 웹 브라우저에서 `http://example.com/schedule`로 접속 가능합니다.

Folio에서 관리하는 모든 페이지/라우트 목록을 빠르게 확인하려면, 아래 아티즌 명령어를 실행하면 됩니다:

```bash
php artisan folio:list
```

<a name="nested-routes"></a>
### 중첩 라우트

Folio의 디렉터리 안에 하위 디렉터리를 생성하면 중첩된 라우트를 만들 수 있습니다. 예를 들어 `/user/profile` 경로로 접속되는 페이지를 만들려면, `pages/user` 디렉터리 내에 `profile.blade.php` 템플릿을 생성하면 됩니다:

```bash
php artisan make:folio user/profile

# pages/user/profile.blade.php → /user/profile
```

<a name="index-routes"></a>
### 인덱스 라우트

특정 디렉터리의 "인덱스" 역할을 하는 페이지를 만들고 싶을 때가 있습니다. Folio 디렉터리 안에 `index.blade.php` 템플릿을 두면, 해당 디렉터리의 루트로 들어온 모든 요청이 그 페이지로 라우팅됩니다:

```bash
php artisan make:folio index
# pages/index.blade.php → /

php artisan make:folio users/index
# pages/users/index.blade.php → /users
```

<a name="route-parameters"></a>
## 라우트 파라미터

실제 서비스에서는 요청된 URL의 특정 부분을 페이지에 전달해 활용해야 하는 경우가 많습니다. 예를 들어, 어떤 사용자의 프로필을 표시할 때 해당 사용자의 "ID" 값이 필요할 수 있습니다. 이를 위해, 페이지 파일 이름의 일부를 대괄호로 감싸 파라미터를 정의할 수 있습니다:

```bash
php artisan make:folio "users/[id]"

# pages/users/[id].blade.php → /users/1
```

이렇게 캡처된 값은 Blade 템플릿 안에서 변수로 바로 사용할 수 있습니다:

```html
<div>
    User {{ $id }}
</div>
```

여러 개의 URL 세그먼트를 캡처하려면, 대괄호 안 파라미터 앞에 점 세 개 `...`를 붙이면 됩니다:

```bash
php artisan make:folio "users/[...ids]"

# pages/users/[...ids].blade.php → /users/1/2/3
```

여러 세그먼트를 캡처할 경우, 이 값들은 배열로 페이지에 주입됩니다:

```html
<ul>
    @foreach ($ids as $id)
        <li>User {{ $id }}</li>
    @endforeach
</ul>
```

<a name="route-model-binding"></a>
## 라우트 모델 바인딩

페이지 템플릿 파일 이름의 와일드카드 세그먼트가 애플리케이션의 Eloquent 모델과 일치한다면, Folio는 라라벨의 라우트 모델 바인딩 기능을 자동으로 활용하여 해당 모델 인스턴스를 페이지에 주입합니다:

```bash
php artisan make:folio "users/[User]"

# pages/users/[User].blade.php → /users/1
```

이렇게 바인딩된 모델은 Blade 템플릿에서 변수로 접근할 수 있으며, 변수 이름은 "카멜 케이스"로 변환되어 전달됩니다:

```html
<div>
    User {{ $user->id }}
</div>
```

#### 바인딩 키 커스터마이징

간혹, Eloquent 모델을 `id` 컬럼이 아닌 다른 컬럼을 기준으로 바인딩하고 싶을 때가 있습니다. 이럴 때는 파일 이름에서 사용할 컬럼을 지정할 수 있습니다. 예를 들어 `[Post:slug].blade.php`와 같이 파일 이름을 만들면, `id` 대신 `slug` 컬럼으로 모델을 찾습니다.

Windows 환경에서는 모델명과 키를 구분할 때 `:` 대신 `-`(하이픈)을 사용해야 합니다: `[Post-slug].blade.php`

#### 모델 위치

기본적으로 Folio는 애플리케이션의 `app/Models` 디렉터리에서 모델을 검색합니다. 하지만 필요하다면 템플릿 파일 이름에 전체 네임스페이스가 포함된 모델 클래스를 지정할 수 있습니다:

```bash
php artisan make:folio "users/[.App.Models.User]"

# pages/users/[.App.Models.User].blade.php → /users/1
```

<a name="soft-deleted-models"></a>
### 소프트 삭제 모델

기본 설정에서는 소프트 삭제된 모델은 암시적 모델 바인딩 시 조회되지 않습니다. 하지만, Folio 페이지의 템플릿 내에서 `withTrashed` 함수를 호출하면 소프트 삭제 모델도 조회할 수 있습니다:

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
## 렌더링 훅

Folio는 기본적으로 페이지의 Blade 템플릿 내용을 요청에 대한 응답으로 반환합니다. 하지만 템플릿 내에서 `render` 함수를 호출하면 응답을 자유롭게 커스터마이즈할 수 있습니다.

`render` 함수는 클로저(익명 함수)를 인자로 받으며, 이 클로저에는 Folio가 렌더링하는 `View` 인스턴스가 전달됩니다. 이를 활용해 뷰에 추가 데이터를 전달하거나, 응답 전체를 커스터마이즈할 수 있습니다. 또한 라우트 파라미터나 모델 바인딩 값도 함께 전달됩니다:

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

특정 페이지의 라우트에 이름을 지정하고 싶다면, `name` 함수를 사용할 수 있습니다:

```php
<?php

use function Laravel\Folio\name;

name('users.index');
```

라라벨의 네임드 라우트와 마찬가지로, 이름이 지정된 Folio 페이지에 대해 `route` 함수를 사용해서 해당 페이지의 URL을 손쉽게 생성할 수 있습니다:

```php
<a href="{{ route('users.index') }}">
    All Users
</a>
```

페이지에 파라미터가 필요하다면, 값을 배열로 전달하면 됩니다:

```php
route('users.show', ['user' => $user]);
```

<a name="middleware"></a>
## 미들웨어

특정 페이지에만 미들웨어를 적용하고 싶을 때는, 해당 페이지의 템플릿 안에서 `middleware` 함수를 호출하면 됩니다:

```php
<?php

use function Laravel\Folio\{middleware};

middleware(['auth', 'verified']);

?>

<div>
    Dashboard
</div>
```

또는 여러 페이지에 미들웨어를 한 번에 적용하고 싶다면, `Folio::path` 메서드 체이닝 후 `middleware` 메서드를 사용할 수 있습니다.

미들웨어를 적용할 페이지를 지정하려면, 적용 대상 페이지의 URL 패턴을 배열의 키(key)로 지정하면 됩니다. 여기에서 `*` 기호는 와일드카드로 사용할 수 있습니다:

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

미들웨어 배열에는 클로저를 포함하여 인라인(익명) 미들웨어를 바로 정의할 수도 있습니다:

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

Folio를 사용할 때에는 반드시 [라라벨의 라우트 캐싱 기능](/docs/10.x/routing#route-caching)을 활용하는 것이 좋습니다. Folio는 `route:cache` 아티즌 명령어를 감지하여, Folio 페이지 정의와 라우트 이름이 최대 성능을 위해 적절하게 캐시될 수 있도록 합니다.
