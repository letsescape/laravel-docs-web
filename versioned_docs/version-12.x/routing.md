# 라우팅 (Routing)

- [기본 라우팅](#basic-routing)
    - [기본 라우트 파일](#the-default-route-files)
    - [리다이렉트 라우트](#redirect-routes)
    - [뷰 라우트](#view-routes)
    - [라우트 목록 확인하기](#listing-your-routes)
    - [라우팅 커스터마이즈](#routing-customization)
- [라우트 파라미터](#route-parameters)
    - [필수 파라미터](#required-parameters)
    - [선택적 파라미터](#parameters-optional-parameters)
    - [정규 표현식 제약 조건](#parameters-regular-expression-constraints)
- [네임드 라우트](#named-routes)
- [라우트 그룹](#route-groups)
    - [미들웨어](#route-group-middleware)
    - [컨트롤러](#route-group-controllers)
    - [서브도메인 라우팅](#route-group-subdomain-routing)
    - [라우트 접두사](#route-group-prefixes)
    - [라우트 이름 접두사](#route-group-name-prefixes)
- [라우트 모델 바인딩](#route-model-binding)
    - [암묵적 바인딩](#implicit-binding)
    - [암묵적 Enum 바인딩](#implicit-enum-binding)
    - [명시적 바인딩](#explicit-binding)
- [폴백 라우트](#fallback-routes)
- [요청 제한 (Rate Limiting)](#rate-limiting)
    - [요청 제한자 정의하기](#defining-rate-limiters)
    - [라우트에 요청 제한자 적용](#attaching-rate-limiters-to-routes)
- [폼 메서드 스푸핑](#form-method-spoofing)
- [현재 라우트 확인하기](#accessing-the-current-route)
- [CORS (교차 출처 리소스 공유)](#cors)
- [라우트 캐싱](#route-caching)

<a name="basic-routing"></a>
## 기본 라우팅

라라벨의 가장 기본적인 라우트는 URI와 클로저(익명 함수)를 전달받아, 복잡한 라우팅 설정 파일 없이도 아주 간단하고 직관적으로 라우트와 동작을 정의할 수 있습니다.

```php
use Illuminate\Support\Facades\Route;

Route::get('/greeting', function () {
    return 'Hello World';
});
```

<a name="the-default-route-files"></a>
### 기본 라우트 파일

라라벨에서 사용하는 모든 라우트는 `routes` 디렉토리에 위치한 라우트 파일에 정의되어 있습니다. 이 파일들은 애플리케이션의 `bootstrap/app.php` 파일에 설정된 구성에 따라 자동으로 로드됩니다. `routes/web.php` 파일은 웹 인터페이스용 라우트를 정의하는 용도로 사용되며, 이 파일에 정의된 라우트는 `web` [미들웨어 그룹](/docs/middleware#laravels-default-middleware-groups)에 할당되어 세션 상태 관리, CSRF 보호 등 다양한 웹 관련 기능을 제공합니다.

대부분의 애플리케이션에서는 먼저 `routes/web.php` 파일에 라우트를 정의하는 것부터 시작합니다. 이렇게 정의된 라우트는 웹 브라우저에서 라우트의 URL로 접근할 수 있습니다. 예를 들어, 아래 라우트에 정의된 경로는 브라우저에서 `http://example.com/user`로 접근할 수 있습니다.

```php
use App\Http\Controllers\UserController;

Route::get('/user', [UserController::class, 'index']);
```

<a name="api-routes"></a>
#### API 라우트

애플리케이션에서 상태를 저장하지 않는(stateless) API 서비스도 제공해야 한다면, `install:api` Artisan 명령어로 API 라우팅을 활성화할 수 있습니다.

```shell
php artisan install:api
```

`install:api` 명령어는 [Laravel Sanctum](/docs/sanctum)을 설치합니다. Sanctum은 서드파티 API 소비자, SPA, 모바일 애플리케이션 등에서 사용할 수 있는 간단하고 강력한 API 토큰 인증 가드를 제공합니다. 또한 이 명령어로 `routes/api.php` 파일도 생성됩니다.

```php
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
```

`routes/api.php`에 정의된 라우트는 상태를 저장하지 않으며, `api` [미들웨어 그룹](/docs/middleware#laravels-default-middleware-groups)에 할당됩니다. 추가로, 이 파일에 정의된 모든 라우트는 자동으로 `/api` URI 접두사가 적용되므로, 별도로 직접 적용할 필요가 없습니다. 접두사는 애플리케이션의 `bootstrap/app.php` 파일을 수정하여 변경할 수 있습니다.

```php
->withRouting(
    api: __DIR__.'/../routes/api.php',
    apiPrefix: 'api/admin',
    // ...
)
```

<a name="available-router-methods"></a>
#### 라우터 메서드 종류

라우터에서는 모든 HTTP 메서드에 대응하는 라우트를 등록할 수 있습니다.

```php
Route::get($uri, $callback);
Route::post($uri, $callback);
Route::put($uri, $callback);
Route::patch($uri, $callback);
Route::delete($uri, $callback);
Route::options($uri, $callback);
```

여러 HTTP 메서드에 동시에 대응하는 라우트를 등록하고 싶을 때는 `match` 메서드를 사용할 수 있습니다. 또는, `any` 메서드로 모든 HTTP 메서드에 대응하는 라우트를 등록할 수도 있습니다.

```php
Route::match(['get', 'post'], '/', function () {
    // ...
});

Route::any('/', function () {
    // ...
});
```

> [!NOTE]
> 동일한 URI에 대해 여러 라우트를 정의할 때는, `get`, `post`, `put`, `patch`, `delete`, `options` 메서드를 사용하는 라우트를 먼저 정의한 뒤, `any`, `match`, `redirect` 메서드를 사용하는 라우트를 나중에 정의해야 합니다. 이렇게 하면 들어오는 요청이 올바른 라우트와 일치하게 됩니다.

<a name="dependency-injection"></a>
#### 의존성 주입

라우트의 콜백 함수(클로저) 시그니처에 필요한 의존성을 타입 힌트로 지정하면, 라라벨의 [서비스 컨테이너](/docs/container)가 자동으로 해당 의존성을 해결(resolving)해 콜백에 주입해줍니다. 예를 들어, `Illuminate\Http\Request` 클래스를 타입 힌트로 지정하면 현재 HTTP 요청(Request)이 자동으로 주입됩니다.

```php
use Illuminate\Http\Request;

Route::get('/users', function (Request $request) {
    // ...
});
```

<a name="csrf-protection"></a>
#### CSRF 보호

`web` 라우트 파일에 정의된 `POST`, `PUT`, `PATCH`, `DELETE` 라우트를 대상으로 하는 모든 HTML 폼에는 반드시 CSRF 토큰 필드가 포함되어야 합니다. 그렇지 않으면 요청이 거부됩니다. CSRF 보호에 대한 더 자세한 내용은 [CSRF 문서](/docs/csrf)를 참고하세요.

```blade
<form method="POST" action="/profile">
    @csrf
    ...
</form>
```

<a name="redirect-routes"></a>
### 리다이렉트 라우트

다른 URI로 리다이렉트하는 라우트를 정의하려면 `Route::redirect` 메서드를 사용할 수 있습니다. 이 메서드로 간단하게 리다이렉트 라우트를 만들 수 있어, 별도의 전체 라우트나 컨트롤러를 정의할 필요 없이 바로 사용 가능합니다.

```php
Route::redirect('/here', '/there');
```

기본적으로 `Route::redirect`는 `302` 상태 코드를 반환합니다. 세 번째 인자를 사용해 상태 코드를 변경할 수도 있습니다.

```php
Route::redirect('/here', '/there', 301);
```

또는, `Route::permanentRedirect` 메서드를 사용하면 `301` 상태 코드로 리다이렉트할 수 있습니다.

```php
Route::permanentRedirect('/here', '/there');
```

> [!WARNING]
> 리다이렉트 라우트에서 라우트 파라미터를 사용할 때, 아래 파라미터명은 라라벨에서 예약되어 있으므로 사용할 수 없습니다: `destination`, `status`.

<a name="view-routes"></a>
### 뷰 라우트

라우트가 단순히 [뷰](/docs/views)만 반환하면 되는 경우, `Route::view` 메서드를 사용할 수 있습니다. 이 메서드도 redirect처럼 간단하게 라우트를 정의할 수 있으며, 전체 라우트나 컨트롤러를 별도로 작성할 필요가 없습니다. `view` 메서드는 첫 번째 인자로 URI, 두 번째 인자로 뷰 이름을 받고, 세 번째 인자로 뷰에 전달할 데이터를 배열로(optional) 넘길 수 있습니다.

```php
Route::view('/welcome', 'welcome');

Route::view('/welcome', 'welcome', ['name' => 'Taylor']);
```

> [!WARNING]
> 뷰 라우트에서 라우트 파라미터를 사용할 때, 아래 파라미터명은 라라벨에서 예약되어 있으므로 사용할 수 없습니다: `view`, `data`, `status`, `headers`.

<a name="listing-your-routes"></a>
### 라우트 목록 확인하기

`route:list` Artisan 명령어를 사용하면 애플리케이션에 정의된 모든 라우트의 목록을 한눈에 확인할 수 있습니다.

```shell
php artisan route:list
```

기본적으로는 각 라우트에 할당된 미들웨어가 `route:list` 출력에 표시되지 않습니다. 그러나 명령어에 `-v` 옵션을 추가하면 라우트 미들웨어 및 미들웨어 그룹 이름도 함께 표시할 수 있습니다.

```shell
php artisan route:list -v

# 미들웨어 그룹을 펼쳐서 보여줍니다...
php artisan route:list -vv
```

특정 URI로 시작하는 라우트만 보고 싶으면, `--path` 옵션을 활용하면 됩니다.

```shell
php artisan route:list --path=api
```

또한, `route:list` 명령어 실행 시 `--except-vendor` 옵션을 추가하면, 써드파티 패키지에서 정의한 라우트는 숨기고, 프로젝트 자체에서 정의한 라우트만 볼 수 있습니다.

```shell
php artisan route:list --except-vendor
```

반대로 `--only-vendor` 옵션을 사용하면, 써드파티 패키지에서 정의한 라우트만 따로 확인할 수 있습니다.

```shell
php artisan route:list --only-vendor
```

<a name="routing-customization"></a>
### 라우팅 커스터마이즈

기본적으로 애플리케이션의 라우트는 `bootstrap/app.php` 파일에서 구성하고 로드됩니다.

```php
<?php

use Illuminate\Foundation\Application;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )->create();
```

하지만, 필요하다면 특정 라우트 집합을 위한 새로운 파일을 별도로 정의할 수 있습니다. 이럴 땐, `withRouting` 메서드에 `then` 클로저를 전달하면 됩니다. 이 클로저 내부에서 추가로 필요한 라우트를 등록할 수 있습니다.

```php
use Illuminate\Support\Facades\Route;

->withRouting(
    web: __DIR__.'/../routes/web.php',
    commands: __DIR__.'/../routes/console.php',
    health: '/up',
    then: function () {
        Route::middleware('api')
            ->prefix('webhooks')
            ->name('webhooks.')
            ->group(base_path('routes/webhooks.php'));
    },
)
```

혹은, 라라벨 프레임워크가 HTTP 라우트를 전혀 등록하지 않도록 하고, 모든 라우트의 등록을 직접 제어하고 싶을 때는 `withRouting` 메서드에 `using` 클로저를 전달할 수 있습니다. 이 인자를 사용하면 프레임워크가 라우트를 자동으로 등록하지 않으므로, 반드시 모든 라우트를 직접 등록해야 합니다.

```php
use Illuminate\Support\Facades\Route;

->withRouting(
    commands: __DIR__.'/../routes/console.php',
    using: function () {
        Route::middleware('api')
            ->prefix('api')
            ->group(base_path('routes/api.php'));

        Route::middleware('web')
            ->group(base_path('routes/web.php'));
    },
)
```

<a name="route-parameters"></a>
## 라우트 파라미터

<a name="required-parameters"></a>
### 필수 파라미터

때로는 라우트에서 URI의 일부 구간 값을 받아 처리해야 할 때가 있습니다. 예를 들어, URL에서 사용자의 ID를 받아와야 할 수도 있겠죠. 이런 경우 라우트 파라미터를 정의해 사용할 수 있습니다.

```php
Route::get('/user/{id}', function (string $id) {
    return 'User '.$id;
});
```

필요한 만큼 여러 개의 라우트 파라미터를 정의할 수도 있습니다.

```php
Route::get('/posts/{post}/comments/{comment}', function (string $postId, string $commentId) {
    // ...
});
```

라우트 파라미터는 항상 `{}` 중괄호로 감싸고, 이름에는 알파벳 문자만 사용할 수 있습니다. 파라미터 이름에 밑줄(`_`)도 사용할 수 있습니다. 라우트 파라미터의 값은 정의된 순서대로 콜백 함수나 컨트롤러에 주입되며, 인자의 이름은 일치하지 않아도 됩니다.

<a name="parameters-and-dependency-injection"></a>
#### 파라미터와 의존성 주입

라우트에서 서비스 컨테이너의 의존성 자동 주입도 사용하고 싶다면, 의존성을 먼저, 라우트 파라미터는 그 뒤에 나열해야 합니다.

```php
use Illuminate\Http\Request;

Route::get('/user/{id}', function (Request $request, string $id) {
    return 'User '.$id;
});
```

<a name="parameters-optional-parameters"></a>
### 선택적 파라미터

경우에 따라, 라우트 파라미터를 URI에서 반드시 받을 필요 없이 선택적으로 처리해야 할 때가 있습니다. 이럴 때는 파라미터 이름 뒤에 `?` 기호를 붙여주면 됩니다. 또한, 콜백 함수에서 해당 변수의 기본값을 지정해줘야 합니다.

```php
Route::get('/user/{name?}', function (?string $name = null) {
    return $name;
});

Route::get('/user/{name?}', function (?string $name = 'John') {
    return $name;
});
```

<a name="parameters-regular-expression-constraints"></a>
### 정규 표현식 제약 조건

`where` 메서드를 사용해 라우트 파라미터 값의 형식을 정규 표현식으로 제한할 수 있습니다. 이 메서드는 파라미터 이름과 적용할 정규 표현식을 인자로 받습니다.

```php
Route::get('/user/{name}', function (string $name) {
    // ...
})->where('name', '[A-Za-z]+');

Route::get('/user/{id}', function (string $id) {
    // ...
})->where('id', '[0-9]+');

Route::get('/user/{id}/{name}', function (string $id, string $name) {
    // ...
})->where(['id' => '[0-9]+', 'name' => '[a-z]+']);
```

자주 사용하는 정규 표현식 패턴은 헬퍼 메서드로 간단하게 추가할 수 있습니다.

```php
Route::get('/user/{id}/{name}', function (string $id, string $name) {
    // ...
})->whereNumber('id')->whereAlpha('name');

Route::get('/user/{name}', function (string $name) {
    // ...
})->whereAlphaNumeric('name');

Route::get('/user/{id}', function (string $id) {
    // ...
})->whereUuid('id');

Route::get('/user/{id}', function (string $id) {
    // ...
})->whereUlid('id');

Route::get('/category/{category}', function (string $category) {
    // ...
})->whereIn('category', ['movie', 'song', 'painting']);

Route::get('/category/{category}', function (string $category) {
    // ...
})->whereIn('category', CategoryEnum::cases());
```

요청된 값이 라우트 패턴 제약 조건과 일치하지 않으면, 404 HTTP 응답이 반환됩니다.

<a name="parameters-global-constraints"></a>
#### 전역 제약 조건

특정 라우트 파라미터에 항상 동일한 정규 표현식 제약 조건을 적용하고 싶을 때는, `pattern` 메서드를 사용할 수 있습니다. 이런 패턴은 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 정의해야 합니다.

```php
use Illuminate\Support\Facades\Route;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Route::pattern('id', '[0-9]+');
}
```

이렇게 패턴이 등록되면, 해당 파라미터 이름을 사용하는 모든 라우트에 자동으로 적용됩니다.

```php
Route::get('/user/{id}', function (string $id) {
    // {id} 값이 숫자인 경우에만 실행됨...
});
```

<a name="parameters-encoded-forward-slashes"></a>
#### 인코딩된 슬래시(/) 처리

라라벨의 라우팅 컴포넌트는 슬래시(`/`)를 제외한 모든 문자를 라우트 파라미터 값에 허용합니다. 만약 슬래시(`/`)도 파라미터로 인식하고 싶다면, 반드시 `where` 조건의 정규 표현식에서 이를 허용해야 합니다.

```php
Route::get('/search/{search}', function (string $search) {
    return $search;
})->where('search', '.*');
```

> [!WARNING]
> 인코딩된 슬래시(`/`)는 반드시 라우트의 마지막 세그먼트(즉, 가장 끝 파라미터)에서만 사용할 수 있습니다.

<a name="named-routes"></a>
## 네임드 라우트

네임드 라우트(named route)를 사용하면, 특정 라우트에 대해 URL이나 리다이렉트를 아주 쉽게 생성할 수 있습니다. 라우트 정의에서 `name` 메서드를 체이닝해 사용하면 됩니다.

```php
Route::get('/user/profile', function () {
    // ...
})->name('profile');
```

컨트롤러 액션에 대해서도 라우트 이름을 지정할 수 있습니다.

```php
Route::get(
    '/user/profile',
    [UserProfileController::class, 'show']
)->name('profile');
```

> [!WARNING]
> 라우트 이름은 반드시 고유해야 합니다.

<a name="generating-urls-to-named-routes"></a>
#### 네임드 라우트로 URL 생성하기

라우트에 이름을 지정했다면, 라라벨의 `route` 또는 `redirect` 헬퍼 함수를 사용해 해당 라우트로의 URL이나 리다이렉트를 쉽게 생성할 수 있습니다.

```php
// URL 생성하기...
$url = route('profile');

// 리다이렉트 생성하기...
return redirect()->route('profile');

return to_route('profile');
```

네임드 라우트에 파라미터가 필요한 경우, `route` 함수의 두 번째 인자로 파라미터 배열을 전달하면 됩니다. 전달한 파라미터는 URL 내에서 자동으로 올바른 위치에 들어갑니다.

```php
Route::get('/user/{id}/profile', function (string $id) {
    // ...
})->name('profile');

$url = route('profile', ['id' => 1]);
```

추가 파라미터를 배열에 더 전달하면, 그 키-값 쌍들이 생성되는 URL의 쿼리스트링에 자동으로 추가됩니다.

```php
Route::get('/user/{id}/profile', function (string $id) {
    // ...
})->name('profile');

$url = route('profile', ['id' => 1, 'photos' => 'yes']);

// /user/1/profile?photos=yes
```

> [!NOTE]
> 예를 들어 현재 로케일 등, 요청 전역에서 기본값을 적용하고 싶다면 [URL::defaults 메서드](/docs/urls#default-values)를 사용할 수 있습니다.

<a name="inspecting-the-current-route"></a>
#### 현재 라우트 정보 확인하기

현재의 요청이 특정 네임드 라우트로 라우팅되었는지 확인하고 싶다면, Route 인스턴스의 `named` 메서드를 사용할 수 있습니다. 예를 들어, 미들웨어에서 현재 라우트의 이름을 검사하려면 다음처럼 하면 됩니다.

```php
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Handle an incoming request.
 *
 * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
 */
public function handle(Request $request, Closure $next): Response
{
    if ($request->route()->named('profile')) {
        // ...
    }

    return $next($request);
}
```

<a name="route-groups"></a>
## 라우트 그룹

라우트 그룹을 사용하면, 미들웨어 등 라우트 속성을 여러 라우트에 공통적으로 적용할 때, 각각의 라우트마다 개별적으로 속성을 지정할 필요 없이 그룹 전체에 한 번에 지정할 수 있습니다.

중첩된 그룹이 있을 경우, 상위 그룹의 특성이 자동으로 하위 그룹과 병합 또는 조합됩니다. 미들웨어와 `where` 조건은 병합되어 적용되고, 이름(name)과 접두사(prefix)는 이어붙여집니다. 네임스페이스 구분자 및 URI의 슬래시(`/`) 등도 자동으로 올바르게 추가됩니다.

<a name="route-group-middleware"></a>
### 미들웨어

[미들웨어](/docs/middleware)를 그룹 내 모든 라우트에 적용하려면, 그룹 정의 전에 `middleware` 메서드를 사용하면 됩니다. 배열에 나열한 순서대로 미들웨어가 실행됩니다.

```php
Route::middleware(['first', 'second'])->group(function () {
    Route::get('/', function () {
        // first, second 미들웨어가 모두 적용됨...
    });

    Route::get('/user/profile', function () {
        // first, second 미들웨어가 모두 적용됨...
    });
});
```

<a name="route-group-controllers"></a>
### 컨트롤러

그룹 내 모든 라우트에서 동일한 [컨트롤러](/docs/controllers)를 사용하는 경우에는, `controller` 메서드로 공통 컨트롤러를 미리 지정할 수 있습니다. 그러면 각 라우트에서는 호출할 컨트롤러 메서드만 작성하면 됩니다.

```php
use App\Http\Controllers\OrderController;

Route::controller(OrderController::class)->group(function () {
    Route::get('/orders/{id}', 'show');
    Route::post('/orders', 'store');
});
```

<a name="route-group-subdomain-routing"></a>
### 서브도메인 라우팅

라우트 그룹은 서브도메인 라우팅에도 사용할 수 있습니다. 서브도메인에도 라우트 파라미터를 지정할 수 있어, 서브도메인의 일부 값을 라우트 또는 컨트롤러에서 활용할 수 있습니다. 서브도메인은 `domain` 메서드로 그룹 정의 전에 지정합니다.

```php
Route::domain('{account}.example.com')->group(function () {
    Route::get('/user/{id}', function (string $account, string $id) {
        // ...
    });
});
```

> [!WARNING]
> 서브도메인 라우트가 정상적으로 동작하게 하려면, 반드시 루트 도메인 라우트보다 먼저 서브도메인 라우트를 등록해야 합니다. 그렇지 않으면 동일한 URI 경로를 가진 루트 도메인 라우트가 서브도메인 라우트를 덮어쓸 수 있습니다.

<a name="route-group-prefixes"></a>
### 라우트 접두사

`prefix` 메서드를 사용하면, 그룹 내 모든 라우트 경로에 특정 URI 접두사를 자동으로 추가할 수 있습니다. 예를 들어, 그룹 내 모든 라우트에 `admin` 접두사를 붙이고 싶다면 다음과 같이 합니다.

```php
Route::prefix('admin')->group(function () {
    Route::get('/users', function () {
        // "/admin/users" URL과 매칭됨
    });
});
```

<a name="route-group-name-prefixes"></a>

### 라우트 이름 프리픽스

`name` 메서드를 사용하면 그룹 내 모든 라우트 이름에 지정한 문자열을 접두어로 붙일 수 있습니다. 예를 들어, 그룹에 속한 모든 라우트 이름 앞에 `admin`을 붙이고 싶을 때 사용할 수 있습니다. 이때 지정한 접두어가 해당 라우트 이름 앞에 정확히 추가되므로, 보통 끝에 `.` 문자를 반드시 포함해서 작성해야 합니다.

```php
Route::name('admin.')->group(function () {
    Route::get('/users', function () {
        // 이 라우트는 "admin.users"라는 이름이 할당됩니다...
    })->name('users');
});
```

<a name="route-model-binding"></a>
## 라우트 모델 바인딩

모델의 ID 값을 라우트나 컨트롤러 액션에 주입할 때, 일반적으로 해당 ID에 해당하는 모델을 데이터베이스에서 조회합니다. 라라벨의 라우트 모델 바인딩은 이러한 과정을 자동으로 처리하여 모델 인스턴스를 직접 라우트에 주입하는 편리한 방법을 제공합니다. 예를 들어, 사용자의 ID만 주입하는 대신, 해당 ID와 일치하는 전체 `User` 모델 인스턴스를 직접 주입받을 수 있습니다.

<a name="implicit-binding"></a>
### 암묵적(Implicit) 바인딩

라라벨은 라우트 또는 컨트롤러 액션에서 타입힌트가 지정된 변수명이 라우트 세그먼트 이름과 일치할 경우, 해당 Eloquent 모델을 자동으로 해결합니다. 예시는 다음과 같습니다.

```php
use App\Models\User;

Route::get('/users/{user}', function (User $user) {
    return $user->email;
});
```

위 예제처럼 `$user` 변수가 `App\Models\User` Eloquent 모델로 타입힌트 되고, 변수명이 `{user}` URI 세그먼트와 일치하므로, 라라벨은 요청 URI에서 받은 값과 일치하는 ID를 가진 모델 인스턴스를 자동으로 주입합니다. 만약 데이터베이스에서 일치하는 모델 인스턴스를 찾을 수 없는 경우, 404 HTTP 응답이 자동으로 반환됩니다.

물론, 암묵적 바인딩은 컨트롤러 메서드에서도 사용할 수 있습니다. 여기서도 `{user}` URI 세그먼트가 컨트롤러의 `$user` 변수명과 같고, 타입힌트로 `App\Models\User`가 지정되어 있습니다.

```php
use App\Http\Controllers\UserController;
use App\Models\User;

// 라우트 정의...
Route::get('/users/{user}', [UserController::class, 'show']);

// 컨트롤러 메서드 정의...
public function show(User $user)
{
    return view('user.profile', ['user' => $user]);
}
```

<a name="implicit-soft-deleted-models"></a>
#### Soft Delete된 모델 바인딩

일반적으로 암묵적 모델 바인딩은 [소프트 삭제](/docs/eloquent#soft-deleting)된 모델을 가져오지 않습니다. 그러나, 라우트 정의에 `withTrashed` 메서드를 체이닝하면 이런 모델도 바인딩할 수 있습니다.

```php
use App\Models\User;

Route::get('/users/{user}', function (User $user) {
    return $user->email;
})->withTrashed();
```

<a name="customizing-the-default-key-name"></a>
#### 기본 키 이름 커스터마이징

경우에 따라 모델을 조회할 때 `id`가 아닌 다른 컬럼을 사용하고 싶을 수 있습니다. 이럴 때에는 라우트 파라미터 정의에서 사용할 컬럼명을 지정할 수 있습니다.

```php
use App\Models\Post;

Route::get('/posts/{post:slug}', function (Post $post) {
    return $post;
});
```

특정 모델 클래스가 항상 `id`가 아닌 다른 데이터베이스 컬럼으로 모델을 바인딩하도록 하고 싶다면, 해당 Eloquent 모델에서 `getRouteKeyName` 메서드를 오버라이드하면 됩니다.

```php
/**
 * 모델의 라우트 키를 반환합니다.
 */
public function getRouteKeyName(): string
{
    return 'slug';
}
```

<a name="implicit-model-binding-scoping"></a>
#### 커스텀 키와 범위(Scoping)

하나의 라우트 정의에서 여러 Eloquent 모델을 암묵적으로 바인딩할 때, 두 번째 모델이 항상 그 앞의(부모) Eloquent 모델의 자식임을 강제하고 싶을 수 있습니다. 예를 들어, 특정 사용자의 블로그 포스트를 슬러그로 찾는 라우트의 경우:

```php
use App\Models\Post;
use App\Models\User;

Route::get('/users/{user}/posts/{post:slug}', function (User $user, Post $post) {
    return $post;
});
```

이렇게 커스텀 키가 지정된 중첩된 라우트 파라미터에 암묵적 바인딩을 사용할 때, 라라벨은 해당 부모 모델의 관계명을 추론해서 자식 모델을 검색하도록 쿼리를 자동 범위 지정합니다. 위 예시에서는 `User` 모델에 `posts`라는(라우트 파라미터의 복수형) 관계가 있다고 간주해서 해당 관계를 이용해 `Post` 모델을 가져옵니다.

원한다면, 커스텀 키를 사용하지 않는 경우에도 "자식" 바인딩에 범위를 강제할 수 있습니다. 라우트 정의 시 `scopeBindings` 메서드를 호출하면 됩니다.

```php
use App\Models\Post;
use App\Models\User;

Route::get('/users/{user}/posts/{post}', function (User $user, Post $post) {
    return $post;
})->scopeBindings();
```

또는, 라우트 그룹 전체에도 범위 지정 바인딩을 적용할 수 있습니다.

```php
Route::scopeBindings()->group(function () {
    Route::get('/users/{user}/posts/{post}', function (User $user, Post $post) {
        return $post;
    });
});
```

반대로, `withoutScopedBindings` 메서드를 호출해서 범위 지정 바인딩을 비활성화할 수도 있습니다.

```php
Route::get('/users/{user}/posts/{post:slug}', function (User $user, Post $post) {
    return $post;
})->withoutScopedBindings();
```

<a name="customizing-missing-model-behavior"></a>
#### 모델 조회 실패 시 동작 커스터마이징

암묵적으로 바인딩된 모델을 찾지 못하면 일반적으로 404 HTTP 응답이 생성됩니다. 하지만, 라우트 정의 시 `missing` 메서드를 사용해서 이 동작을 직접 정의할 수 있습니다. `missing` 메서드는 모델을 찾을 수 없을 때 호출될 클로저를 받습니다.

```php
use App\Http\Controllers\LocationsController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

Route::get('/locations/{location:slug}', [LocationsController::class, 'show'])
    ->name('locations.view')
    ->missing(function (Request $request) {
        return Redirect::route('locations.index');
    });
```

<a name="implicit-enum-binding"></a>
### 암묵적 Enum 바인딩

PHP 8.1부터는 [열거형(Enums)](https://www.php.net/manual/en/language.enumerations.backed.php)이 지원됩니다. 이 기능에 맞춰, 라라벨에서는 라우트에서 [string-backed Enum](https://www.php.net/manual/en/language.enumerations.backed.php)을 타입힌트로 사용할 수 있으며, 해당 세그먼트 값이 유효한 Enum 값일 때만 라우트가 실행됩니다. 그렇지 않으면 404 HTTP 응답이 자동으로 반환됩니다. 예를 들어 아래와 같은 Enum이 있다고 가정해보겠습니다.

```php
<?php

namespace App\Enums;

enum Category: string
{
    case Fruits = 'fruits';
    case People = 'people';
}
```

`{category}` 라우트 세그먼트가 `fruits` 또는 `people`인 경우에만 실행되는 라우트를 아래처럼 정의할 수 있습니다. 그 외의 값이면 라라벨이 자동으로 404 HTTP 응답을 반환합니다.

```php
use App\Enums\Category;
use Illuminate\Support\Facades\Route;

Route::get('/categories/{category}', function (Category $category) {
    return $category->value;
});
```

<a name="explicit-binding"></a>
### 명시적(Explicit) 바인딩

라라벨의 암묵적/컨벤션 기반 모델 바인딩만 사용해야 하는 것은 아닙니다. 라우트 파라미터가 어떤 모델에 매칭되는지 명시적으로 지정할 수도 있습니다. 명시적 바인딩을 등록하려면, 라우터의 `model` 메서드를 사용해 파라미터명에 해당하는 클래스를 지정합니다. 이러한 명시적 모델 바인딩은 `AppServiceProvider`의 `boot` 메서드에서 미리 정의해두어야 합니다.

```php
use App\Models\User;
use Illuminate\Support\Facades\Route;

/**
 * 애플리케이션 서비스 부트스트랩
 */
public function boot(): void
{
    Route::model('user', User::class);
}
```

그 다음 `{user}` 파라미터가 포함된 라우트를 정의합니다.

```php
use App\Models\User;

Route::get('/users/{user}', function (User $user) {
    // ...
});
```

이제 모든 `{user}` 파라미터는 `App\Models\User` 모델과 바인딩되며, 해당 ID의 인스턴스가 라우트에 주입됩니다. 예를 들어, `users/1` 경로로 요청하면 데이터베이스에서 ID가 1인 `User` 인스턴스가 주입됩니다.

만약 일치하는 모델 인스턴스가 데이터베이스에 없으면, 404 HTTP 응답이 자동으로 반환됩니다.

<a name="customizing-the-resolution-logic"></a>
#### 모델 바인딩 해결(Resolution) 로직 커스터마이징

직접 모델 바인딩 로직을 정의하고 싶다면 `Route::bind` 메서드를 사용할 수 있습니다. 이 메서드에 전달한 클로저는 URI 세그먼트의 값을 받아, 라우트에 주입될 모델 인스턴스를 반환해야 합니다. 이 설정도 애플리케이션의 `AppServiceProvider`의 `boot` 메서드에서 진행해야 합니다.

```php
use App\Models\User;
use Illuminate\Support\Facades\Route;

/**
 * 애플리케이션 서비스 부트스트랩
 */
public function boot(): void
{
    Route::bind('user', function (string $value) {
        return User::where('name', $value)->firstOrFail();
    });
}
```

또는, Eloquent 모델에서 `resolveRouteBinding` 메서드를 오버라이드하는 방식도 사용할 수 있습니다. 이 메서드는 URI 세그먼트 값을 받아, 라우트에 주입할 인스턴스를 반환해야 합니다.

```php
/**
 * 바인딩된 값에 해당하는 모델 조회.
 *
 * @param  mixed  $value
 * @param  string|null  $field
 * @return \Illuminate\Database\Eloquent\Model|null
 */
public function resolveRouteBinding($value, $field = null)
{
    return $this->where('name', $value)->firstOrFail();
}
```

라우트가 [암묵적 바인딩 범위(scoping)](#implicit-model-binding-scoping)를 활용한다면, `resolveChildRouteBinding` 메서드가 사용되어 부모 모델의 자식 바인딩이 해결됩니다.

```php
/**
 * 바인딩된 값에 해당하는 자식 모델 조회.
 *
 * @param  string  $childType
 * @param  mixed  $value
 * @param  string|null  $field
 * @return \Illuminate\Database\Eloquent\Model|null
 */
public function resolveChildRouteBinding($childType, $value, $field)
{
    return parent::resolveChildRouteBinding($childType, $value, $field);
}
```

<a name="fallback-routes"></a>
## 폴백 라우트

`Route::fallback` 메서드를 사용하여, 들어오는 요청이 다른 라우트와 일치하지 않을 때 실행되는 라우트를 정의할 수 있습니다. 일반적으로 핸들링되지 않은 요청은 애플리케이션의 예외 핸들러를 통해 "404" 페이지가 자동으로 렌더링됩니다. 하지만, 보통 `routes/web.php` 파일에 `fallback` 라우트를 정의하면, 해당 라우트에는 `web` 미들웨어 그룹 내의 모든 미들웨어가 적용됩니다. 필요한 경우 이 라우트에 추가적인 미들웨어도 자유롭게 지정할 수 있습니다.

```php
Route::fallback(function () {
    // ...
});
```

<a name="rate-limiting"></a>
## 요청 속도 제한(Rate Limiting)

<a name="defining-rate-limiters"></a>
### 속도 제한기(rate limiter) 정의하기

라라벨은 강력하고 커스터마이즈 가능한 속도 제한 서비스를 제공하여 특정 라우트 혹은 라우트 그룹에 대한 트래픽을 제한할 수 있습니다. 우선, 애플리케이션 사용 목적에 맞는 속도 제한기 설정을 정의해야 합니다.

속도 제한기는 보통 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 정의합니다.

```php
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

/**
 * 애플리케이션 서비스 부트스트랩
 */
protected function boot(): void
{
    RateLimiter::for('api', function (Request $request) {
        return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
    });
}
```

속도 제한기는 `RateLimiter` 파사드의 `for` 메서드로 정의하며, 여기에는 제한기 이름과 해당 라우트에 적용할 제한 설정을 반환하는 클로저를 전달합니다. 제한 설정은 `Illuminate\Cache\RateLimiting\Limit` 클래스의 인스턴스이며, 여러 "빌더" 메서드를 활용해 제한 규칙을 빠르게 정의할 수 있습니다. 제한기 이름은 원하는 임의의 문자열로 지정할 수 있습니다.

```php
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

/**
 * 애플리케이션 서비스 부트스트랩
 */
protected function boot(): void
{
    RateLimiter::for('global', function (Request $request) {
        return Limit::perMinute(1000);
    });
}
```

요청이 지정된 속도 제한을 초과하면, 라라벨이 자동으로 429 HTTP 상태 코드와 함께 응답을 반환합니다. 속도 제한을 초과했을 때 반환되는 응답을 직접 지정하고 싶다면, `response` 메서드를 사용할 수 있습니다.

```php
RateLimiter::for('global', function (Request $request) {
    return Limit::perMinute(1000)->response(function (Request $request, array $headers) {
        return response('Custom response...', 429, $headers);
    });
});
```

속도 제한기 콜백은 들어오는 HTTP 요청 인스턴스를 받으므로, 요청한 사용자나 요청의 특성에 따라 동적으로 제한 규칙을 생성할 수 있습니다.

```php
RateLimiter::for('uploads', function (Request $request) {
    return $request->user()->vipCustomer()
        ? Limit::none()
        : Limit::perMinute(100);
});
```

<a name="segmenting-rate-limits"></a>
#### 속도 제한 세분화하기(Segmenting)

경우에 따라 IP 주소 등 임의의 값을 기준으로 제한을 세분화하고 싶을 수 있습니다. 예를 들어, 특정 라우트에 대해 IP별로 분당 100회의 접근만 허용하고 싶을 때, 제한 규칙을 만드는 시점에 `by` 메서드를 사용할 수 있습니다.

```php
RateLimiter::for('uploads', function (Request $request) {
    return $request->user()->vipCustomer()
        ? Limit::none()
        : Limit::perMinute(100)->by($request->ip());
});
```

다른 예시로, 인증 사용자는 사용자별로 분당 100회, 비회원(게스트)은 IP별로 분당 10회 이용을 허용하고 싶다면 아래처럼 할 수 있습니다.

```php
RateLimiter::for('uploads', function (Request $request) {
    return $request->user()
        ? Limit::perMinute(100)->by($request->user()->id)
        : Limit::perMinute(10)->by($request->ip());
});
```

<a name="multiple-rate-limits"></a>
#### 다중 속도 제한 적용

필요할 경우, 하나의 제한기 설정에서 여러 개의 제한 규칙을 배열로 반환할 수 있습니다. 이럴 때 각 규칙은 반환된 순서대로 평가되어 라우트에 적용됩니다.

```php
RateLimiter::for('login', function (Request $request) {
    return [
        Limit::perMinute(500),
        Limit::perMinute(3)->by($request->input('email')),
    ];
});
```

같은 기준 값(`by` 값)으로 구분하는 여러 제한을 동시에 적용할 때에는 각 `by` 값이 유일해야 함에 유의해야 합니다. 이를 위해 `by` 값에 접두어를 붙이는 방식이 가장 쉽고 안전합니다.

```php
RateLimiter::for('uploads', function (Request $request) {
    return [
        Limit::perMinute(10)->by('minute:'.$request->user()->id),
        Limit::perDay(1000)->by('day:'.$request->user()->id),
    ];
});
```

<a name="attaching-rate-limiters-to-routes"></a>
### 라우트에 속도 제한기 적용하기

속도 제한기는 `throttle` [미들웨어](/docs/middleware)를 이용해 라우트 또는 라우트 그룹에 추가할 수 있습니다. 이때 `throttle` 미들웨어에는 사용할 제한기 이름을 지정합니다.

```php
Route::middleware(['throttle:uploads'])->group(function () {
    Route::post('/audio', function () {
        // ...
    });

    Route::post('/video', function () {
        // ...
    });
});
```

<a name="throttling-with-redis"></a>
#### Redis를 이용한 속도 제한

기본적으로, `throttle` 미들웨어는 `Illuminate\Routing\Middleware\ThrottleRequests` 클래스에 매핑되어 있습니다. 하지만 애플리케이션의 캐시 드라이버로 Redis를 사용하는 경우, 라라벨이 Redis 기반의 속도 제한을 사용하도록 할 수도 있습니다. 이를 위해 애플리케이션의 `bootstrap/app.php` 파일에서 `throttleWithRedis` 메서드를 호출합니다. 이 메서드는 `throttle` 미들웨어를 `Illuminate\Routing\Middleware\ThrottleRequestsWithRedis` 클래스에 매핑해줍니다.

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->throttleWithRedis();
    // ...
})
```

<a name="form-method-spoofing"></a>
## 폼 메서드 속임수(Form Method Spoofing)

HTML 폼은 기본적으로 `PUT`, `PATCH`, `DELETE` 액션을 지원하지 않습니다. 따라서, HTML 폼에서 `PUT`, `PATCH`, `DELETE` 라우트를 호출하려면 `hidden` 타입의 `_method` 필드를 추가해야 합니다. 폼에서 전송된 `_method` 필드의 값이 실제 HTTP 요청 메서드로 사용됩니다.

```blade
<form action="/example" method="POST">
    <input type="hidden" name="_method" value="PUT">
    <input type="hidden" name="_token" value="{{ csrf_token() }}">
</form>
```

좀 더 편리하게, [Blade 지시어](/docs/blade)인 `@method`를 사용하면 `_method` input 필드를 자동으로 생성할 수 있습니다.

```blade
<form action="/example" method="POST">
    @method('PUT')
    @csrf
</form>
```

<a name="accessing-the-current-route"></a>
## 현재 라우트 정보 접근하기

`Route` 파사드의 `current`, `currentRouteName`, `currentRouteAction` 메서드를 사용하면 현재 요청을 처리하고 있는 라우트 정보를 얻을 수 있습니다.

```php
use Illuminate\Support\Facades\Route;

$route = Route::current(); // Illuminate\Routing\Route
$name = Route::currentRouteName(); // string
$action = Route::currentRouteAction(); // string
```

이 외에도 라우터 및 라우트 클래스에서 사용할 수 있는 모든 메서드는 라라벨 [Route 파사드의 기반 클래스 문서](https://api.laravel.com/docs/Illuminate/Routing/Router.html)와 [Route 인스턴스 문서](https://api.laravel.com/docs/Illuminate/Routing/Route.html)를 참고하세요.

<a name="cors"></a>
## 교차 출처 리소스 공유(CORS)

라라벨은 CORS의 `OPTIONS` HTTP 요청에 대해 미리 설정한 값으로 자동 응답할 수 있습니다. 이러한 `OPTIONS` 요청은 애플리케이션 전체의 글로벌 미들웨어 스택에 기본 포함된 `HandleCors` [미들웨어](/docs/middleware)가 자동 처리합니다.

애플리케이션의 CORS 설정 값을 직접 커스터마이즈하고 싶을 때는, Artisan 명령어인 `config:publish`를 통해 `cors` 설정 파일을 퍼블리시할 수 있습니다.

```shell
php artisan config:publish cors
```

해당 명령을 실행하면 애플리케이션의 `config` 디렉토리에 `cors.php` 설정 파일이 생성됩니다.

> [!NOTE]
> CORS와 CORS 헤더에 대한 자세한 내용은 [MDN 웹 문서의 CORS 설명](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#The_HTTP_response_headers)을 참고하시기 바랍니다.

<a name="route-caching"></a>
## 라우트 캐싱

애플리케이션을 운영 환경에 배포할 때는 라라벨의 라우트 캐싱 기능을 적극 활용하는 것이 좋습니다. 라우트 캐시를 사용하면 전체 라우트 등록 시간이 크게 단축됩니다. 라우트 캐시를 생성하려면 `route:cache` Artisan 명령어를 실행하세요.

```shell
php artisan route:cache
```

명령 실행 이후부터는 모든 요청에 대해 캐시된 라우트 파일이 로드됩니다. 새로운 라우트를 추가했다면 반드시 라우트 캐시를 새로 생성해야 한다는 점을 기억하세요. 따라서 `route:cache` 명령어는 주로 프로젝트 배포 과정에서만 실행하는 것이 좋습니다.

라우트 캐시는 `route:clear` 명령어로 삭제할 수 있습니다.

```shell
php artisan route:clear
```