# 라우팅 (Routing)

- [기본 라우팅](#basic-routing)
    - [기본 라우트 파일](#the-default-route-files)
    - [리디렉션 라우트](#redirect-routes)
    - [뷰 라우트](#view-routes)
    - [라우트 목록 확인](#listing-your-routes)
    - [라우팅 커스터마이징](#routing-customization)
- [라우트 매개변수](#route-parameters)
    - [필수 매개변수](#required-parameters)
    - [선택 매개변수](#parameters-optional-parameters)
    - [정규 표현식 제약](#parameters-regular-expression-constraints)
- [이름 있는 라우트](#named-routes)
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
- [폴백(Fallback) 라우트](#fallback-routes)
- [요청 속도 제한](#rate-limiting)
    - [속도 제한자 정의](#defining-rate-limiters)
    - [라우트에 속도 제한자 연결](#attaching-rate-limiters-to-routes)
- [폼 메서드 스푸핑](#form-method-spoofing)
- [현재 라우트 접근하기](#accessing-the-current-route)
- [교차 출처 리소스 공유(CORS)](#cors)
- [라우트 캐시](#route-caching)

<a name="basic-routing"></a>
## 기본 라우팅

가장 기본적인 라라벨 라우트는 URI와 클로저(익명함수)를 받으며, 복잡한 라우팅 설정 파일 없이도 매우 간단하게 라우트와 동작을 정의할 수 있는 직관적인 방식을 제공합니다.

```php
use Illuminate\Support\Facades\Route;

Route::get('/greeting', function () {
    return 'Hello World';
});
```

<a name="the-default-route-files"></a>
### 기본 라우트 파일

모든 라라벨 라우트는 `routes` 디렉터리에 위치한 라우트 파일들에서 정의됩니다. 이 파일들은 애플리케이션의 `bootstrap/app.php` 파일에 지정된 설정에 따라 라라벨이 자동으로 로드합니다. `routes/web.php` 파일은 웹 인터페이스를 위한 라우트를 정의합니다. 이러한 라우트에는 세션 상태나 CSRF 보호와 같은 기능을 제공하는 `web` [미들웨어 그룹](/docs/12.x/middleware#laravels-default-middleware-groups)이 자동으로 지정됩니다.

대부분의 애플리케이션에서는 `routes/web.php` 파일에 라우트를 정의하며 개발을 시작합니다. 이 파일에 정의된 라우트는 브라우저에서 해당 라우트의 URL로 접속하여 접근할 수 있습니다. 예를 들어, 아래와 같은 라우트는 브라우저에서 `http://example.com/user`로 접속하면 실행됩니다.

```php
use App\Http\Controllers\UserController;

Route::get('/user', [UserController::class, 'index']);
```

<a name="api-routes"></a>
#### API 라우트

애플리케이션에서 상태가 없는(stateless) API도 제공하고 싶다면, `install:api` Artisan 명령어를 사용하여 API 라우팅을 간편하게 활성화할 수 있습니다.

```shell
php artisan install:api
```

`install:api` 명령어는 [Laravel Sanctum](/docs/12.x/sanctum)을 설치하여, 서드파티 API 소비자, SPA, 모바일 앱 등에서 사용할 수 있는 안전하면서도 간단한 API 토큰 인증 가드를 제공합니다. 이 명령어를 실행하면 `routes/api.php` 파일도 함께 생성됩니다.

```php
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
```

`routes/api.php`의 라우트는 상태를 유지하지 않으며, `api` [미들웨어 그룹](/docs/12.x/middleware#laravels-default-middleware-groups)이 자동으로 지정됩니다. 아울러, `/api` URI 접두사도 자동으로 적용되므로 라우트마다 붙일 필요가 없습니다. 접두사를 변경하려면 애플리케이션의 `bootstrap/app.php` 파일에서 직접 수정할 수 있습니다.

```php
->withRouting(
    api: __DIR__.'/../routes/api.php',
    apiPrefix: 'api/admin',
    // ...
)
```

<a name="available-router-methods"></a>
#### 사용 가능한 라우터 메서드

라우터는 모든 HTTP 동사에 대응하는 라우트를 등록할 수 있도록 다양한 메서드를 제공합니다.

```php
Route::get($uri, $callback);
Route::post($uri, $callback);
Route::put($uri, $callback);
Route::patch($uri, $callback);
Route::delete($uri, $callback);
Route::options($uri, $callback);
```

경우에 따라 한 라우트가 여러 HTTP 동사에 반응하도록 하고 싶다면 `match` 메서드를 사용하세요. 또는 `any` 메서드를 사용하면 모든 HTTP 동사에 반응하는 라우트도 등록할 수 있습니다.

```php
Route::match(['get', 'post'], '/', function () {
    // ...
});

Route::any('/', function () {
    // ...
});
```

> [!NOTE]
> 같은 URI를 공유하는 여러 라우트를 정의할 경우, `get`, `post`, `put`, `patch`, `delete`, `options` 메서드를 이용한 라우트를 `any`, `match`, `redirect` 메서드를 사용한 라우트보다 먼저 정의해야 합니다. 이렇게 해야 클라이언트의 요청이 올바른 라우트에 매칭됩니다.

<a name="dependency-injection"></a>
#### 의존성 주입

라우트의 콜백 시그니처에 타입힌트로 필요한 의존성을 선언할 수 있습니다. 라라벨 [서비스 컨테이너](/docs/12.x/container)가 해당 의존성을 자동으로 주입합니다. 예를 들어, `Illuminate\Http\Request` 클래스를 타입힌트하면 현재 HTTP 요청 객체가 자동으로 주입됩니다.

```php
use Illuminate\Http\Request;

Route::get('/users', function (Request $request) {
    // ...
});
```

<a name="csrf-protection"></a>
#### CSRF 보호

`web` 라우트 파일에 정의한 `POST`, `PUT`, `PATCH`, `DELETE` 라우트를 대상으로 하는 모든 HTML 폼에는 CSRF 토큰 필드가 반드시 포함되어야 합니다. 그렇지 않으면 요청이 거부됩니다. CSRF 보호에 대한 자세한 설명은 [CSRF 문서](/docs/12.x/csrf)를 참고하세요.

```blade
<form method="POST" action="/profile">
    @csrf
    ...
</form>
```

<a name="redirect-routes"></a>
### 리디렉션 라우트

다른 URI로 리디렉션하는 라우트를 정의하고자 한다면, `Route::redirect` 메서드를 사용할 수 있습니다. 이 메서드를 사용하면 단순 리디렉션의 경우 별도의 컨트롤러나 전체 라우트를 정의할 필요 없이 간편하게 처리할 수 있습니다.

```php
Route::redirect('/here', '/there');
```

기본적으로 `Route::redirect`는 `302` 상태 코드를 반환합니다. 세 번째 매개변수로 상태 코드를 지정하여 원하는 상태 코드로 변경할 수 있습니다.

```php
Route::redirect('/here', '/there', 301);
```

또는 `Route::permanentRedirect` 메서드를 사용하면 `301` 상태 코드의 영구 리디렉션을 반환합니다.

```php
Route::permanentRedirect('/here', '/there');
```

> [!WARNING]
> 리디렉션 라우트에서 라우트 매개변수를 사용할 때, Laravel에서 예약된 `destination` 및 `status` 파라미터는 사용할 수 없습니다.

<a name="view-routes"></a>
### 뷰 라우트

라우트에서 단순히 [뷰](/docs/12.x/views)만 반환하면 충분한 경우, `Route::view` 메서드를 쓸 수 있습니다. 이 메서드는 `redirect` 메서드처럼 전체 라우트나 컨트롤러를 따로 만들 필요 없이 쉽게 사용할 수 있습니다. 첫 번째 인수로 URI, 두 번째 인수로 뷰 이름을 전달하면 됩니다. 또한, 세 번째 선택 인수로 뷰에 전달할 데이터를 배열 형태로 제공할 수 있습니다.

```php
Route::view('/welcome', 'welcome');

Route::view('/welcome', 'welcome', ['name' => 'Taylor']);
```

> [!WARNING]
> 뷰 라우트에서 라우트 매개변수를 사용할 때, Laravel에서 예약된 `view`, `data`, `status`, `headers` 매개변수는 사용할 수 없습니다.

<a name="listing-your-routes"></a>
### 라우트 목록 확인

`route:list` Artisan 명령어를 사용하면 애플리케이션에 정의된 모든 라우트를 한눈에 확인할 수 있습니다.

```shell
php artisan route:list
```

기본적으로 이 명령어 출력에는 각 라우트에 할당된 미들웨어가 표시되지 않습니다. 하지만 명령어에 `-v` 옵션을 추가하면 라우트의 미들웨어와 미들웨어 그룹 이름도 함께 표기됩니다.

```shell
php artisan route:list -v

# 미들웨어 그룹까지 전체 보기
php artisan route:list -vv
```

특정 URI로 시작하는 라우트만 보고 싶다면, 아래와 같이 `--path` 옵션을 사용할 수 있습니다.

```shell
php artisan route:list --path=api
```

서드파티 패키지에서 정의된 라우트를 숨기고 싶다면, `route:list` 실행 시 `--except-vendor` 옵션을 주면 됩니다.

```shell
php artisan route:list --except-vendor
```

반대로, 서드파티 패키지에서 정의된 라우트만 보고 싶을 때는 `--only-vendor` 옵션을 사용할 수 있습니다.

```shell
php artisan route:list --only-vendor
```

<a name="routing-customization"></a>
### 라우팅 커스터마이징

기본적으로 애플리케이션의 라우트는 `bootstrap/app.php` 파일에서 설정 및 로드가 이루어집니다.

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

그러나 때로는 애플리케이션의 일부 라우트만 별도의 파일로 분리해 정의하고 싶을 수 있습니다. 이럴 때는 `withRouting` 메서드에 `then` 클로저를 전달하여 추가적인 라우트를 등록할 수 있습니다. 이 클로저 안에서 필요에 따라 라우트를 직접 등록할 수 있습니다.

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

또는 라우트 등록을 완전히 직접 제어하고 싶다면, `withRouting`에 `using` 클로저를 넘기면 됩니다. 이 인수를 전달하면 프레임워크에서 HTTP 라우트를 전혀 등록하지 않으며, 모든 라우트를 직접 수동으로 등록해야 합니다.

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
## 라우트 매개변수

<a name="required-parameters"></a>
### 필수 매개변수

때때로 URI의 일부 구간을 매개변수로 받아야 할 때가 있습니다. 예를 들어, 사용자의 ID를 URL로부터 받아와야 하는 경우, 라우트 매개변수를 다음처럼 정의할 수 있습니다.

```php
Route::get('/user/{id}', function (string $id) {
    return 'User '.$id;
});
```

필요하다면 여러 개의 라우트 매개변수도 정의할 수 있습니다.

```php
Route::get('/posts/{post}/comments/{comment}', function (string $postId, string $commentId) {
    // ...
});
```

라우트 매개변수는 항상 `{}` 중괄호로 감싸서 표시하며, 매개변수 이름에는 알파벳 문자와 밑줄(`_`)만 사용할 수 있습니다. 매개변수값은 정의된 순서에 맞게 라우트 콜백이나 컨트롤러에 주입됩니다. 콜백이나 컨트롤러 함수 내 매개변수 이름과 라우트 매개변수 이름이 정확히 일치하지 않아도 됩니다.

<a name="parameters-and-dependency-injection"></a>
#### 매개변수와 의존성 주입

라우트에서 서비스 컨테이너가 자동 주입해줄 의존성이 있을 경우, 먼저 의존성을 선언하고 그 다음에 라우트 매개변수를 나열하세요.

```php
use Illuminate\Http\Request;

Route::get('/user/{id}', function (Request $request, string $id) {
    return 'User '.$id;
});
```

<a name="parameters-optional-parameters"></a>
### 선택 매개변수

가끔은 URI에 특정 라우트 매개변수가 항상 존재하지 않을 수 있습니다. 이럴 때는 매개변수 이름 뒤에 `?`를 붙여서 선택 매개변수로 지정할 수 있습니다. 이 때 함수의 해당 변수에도 기본값을 반드시 지정해야 합니다.

```php
Route::get('/user/{name?}', function (?string $name = null) {
    return $name;
});

Route::get('/user/{name?}', function (?string $name = 'John') {
    return $name;
});
```

<a name="parameters-regular-expression-constraints"></a>
### 정규 표현식 제약

라우트 인스턴스에서 `where` 메서드를 사용하여 라우트 매개변수의 형식을 정규 표현식으로 제한할 수 있습니다. 이 메서드는 매개변수 이름과, 해당 매개변수에 적용할 정규 표현식을 받습니다.

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

자주 사용되는 정규식 패턴의 경우, 패턴 제약을 빠르게 추가할 수 있는 헬퍼 메서드들도 제공합니다.

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

들어오는 요청이 지정한 패턴 제약과 일치하지 않으면, 404 HTTP 응답이 반환됩니다.

<a name="parameters-global-constraints"></a>
#### 전역 제약

특정 라우트 매개변수에 항상 특정 정규 표현식 제약을 적용하고 싶다면 `pattern` 메서드를 사용할 수 있습니다. 이 패턴 정의는 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에 추가합니다.

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

이렇게 패턴을 등록하면, 해당 매개변수 이름을 사용하는 모든 라우트에 자동으로 적용됩니다.

```php
Route::get('/user/{id}', function (string $id) {
    // {id}가 숫자인 경우에만 실행됨
});
```

<a name="parameters-encoded-forward-slashes"></a>
#### 인코딩된 슬래시(`/`) 문자

라라벨 라우팅 컴포넌트는 라우트 매개변수 값에 `/`(슬래시)를 제외한 모든 문자를 허용합니다. 슬래시도 매개변수의 일부로 허용하려면 `where` 메서드의 정규식을 사용하여 명시적으로 허용해주어야 합니다.

```php
Route::get('/search/{search}', function (string $search) {
    return $search;
})->where('search', '.*');
```

> [!WARNING]
> 인코딩된 슬래시(`/`)는 반드시 라우트의 마지막 구간에서만 사용할 수 있습니다.

<a name="named-routes"></a>
## 이름 있는 라우트

이름 있는 라우트(named route)를 활용하면 특정 라우트로의 URL이나 리디렉션을 간편하게 만들 수 있습니다. 라우트 정의 마지막에 `name` 메서드를 연결해서 라우트에 이름을 붙이면 됩니다.

```php
Route::get('/user/profile', function () {
    // ...
})->name('profile');
```

컨트롤러 액션에도 라우트 이름을 붙일 수 있습니다.

```php
Route::get(
    '/user/profile',
    [UserProfileController::class, 'show']
)->name('profile');
```

> [!WARNING]
> 라우트의 이름은 반드시 고유해야 합니다.

<a name="generating-urls-to-named-routes"></a>
#### 이름 있는 라우트로 URL 생성하기

라우트에 이름을 지정했다면, 이후 URL을 만들거나 리디렉션할 때 `route` 및 `redirect` 헬퍼 함수를 사용할 수 있습니다.

```php
// URL 생성...
$url = route('profile');

// 리디렉션 생성...
return redirect()->route('profile');

return to_route('profile');
```

이름 있는 라우트가 매개변수를 정의한다면, 매개변수를 두 번째 인수로 배열 형태로 넘기면 됩니다. 전달한 매개변수는 자동으로 바른 위치에 치환되어 URL이 생성됩니다.

```php
Route::get('/user/{id}/profile', function (string $id) {
    // ...
})->name('profile');

$url = route('profile', ['id' => 1]);
```

추가적인 매개변수를 배열에 포함하면, 키/값 쌍이 URL의 쿼리스트링에 자동으로 붙습니다.

```php
Route::get('/user/{id}/profile', function (string $id) {
    // ...
})->name('profile');

$url = route('profile', ['id' => 1, 'photos' => 'yes']);

// /user/1/profile?photos=yes
```

> [!NOTE]
> 현재 로케일 등 요청 전반에 걸쳐 URL 매개변수의 기본값을 지정하고 싶을 때는 [URL::defaults 메서드](/docs/12.x/urls#default-values)를 사용할 수 있습니다.

<a name="inspecting-the-current-route"></a>
#### 현재 라우트 검사하기

현재 요청이 특정 이름의 라우트에 매핑되었는지 확인하려면, Route 인스턴스의 `named` 메서드를 사용할 수 있습니다. 예를 들어, 라우트 미들웨어에서 현재 라우트 이름을 확인하는 방식입니다.

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

라우트 그룹을 사용하면 특정 라우트 속성(예: 미들웨어 등)을 여러 라우트에 반복적으로 지정하지 않고 한꺼번에 공유할 수 있습니다.

중첩 그룹의 경우, 부모 그룹의 속성과 적절히 합쳐지도록 설계되어 있습니다. 미들웨어와 `where` 조건은 병합되고, 접두사(prefix)와 라우트 이름(name)은 추가되는 방식입니다. 네임스페이스 구분자, URI 접두사의 슬래시 등도 자동으로 올바르게 붙여줍니다.

<a name="route-group-middleware"></a>
### 미들웨어

[미들웨어](/docs/12.x/middleware)를 그룹 내 모든 라우트에 부여하고 싶을 때는, 그룹 정의 전에 `middleware` 메서드를 사용하면 됩니다. 배열에 나열된 순서대로 미들웨어가 실행됩니다.

```php
Route::middleware(['first', 'second'])->group(function () {
    Route::get('/', function () {
        // first & second 미들웨어가 적용됨
    });

    Route::get('/user/profile', function () {
        // first & second 미들웨어가 적용됨
    });
});
```

<a name="route-group-controllers"></a>
### 컨트롤러

여러 라우트가 동일한 [컨트롤러](/docs/12.x/controllers)를 사용할 경우, `controller` 메서드로 그룹에 공통 컨트롤러를 지정할 수 있습니다. 이 때 각 라우트 정의에서는 컨트롤러 메서드명만 지정하면 됩니다.

```php
use App\Http\Controllers\OrderController;

Route::controller(OrderController::class)->group(function () {
    Route::get('/orders/{id}', 'show');
    Route::post('/orders', 'store');
});
```

<a name="route-group-subdomain-routing"></a>
### 서브도메인 라우팅

라우트 그룹은 서브도메인 라우팅에도 활용할 수 있습니다. 서브도메인 역시 라우트 매개변수처럼 사용할 수 있으므로, 서브도메인의 일부를 라우트나 컨트롤러에서 사용할 수 있습니다. 서브도메인은 그룹 정의 전에 `domain` 메서드로 지정합니다.

```php
Route::domain('{account}.example.com')->group(function () {
    Route::get('/user/{id}', function (string $account, string $id) {
        // ...
    });
});
```

> [!WARNING]
> 서브도메인 라우트가 정상적으로 동작하려면, 루트 도메인 라우트보다 먼저 등록해야 합니다. 그래야 루트 도메인 라우트가 동일 URI 경로를 덮어써서 서브도메인 라우트가 가려지는 일이 발생하지 않습니다.

<a name="route-group-prefixes"></a>
### 라우트 접두사

`prefix` 메서드를 사용하면 그룹 내 모든 라우트에 지정한 URI 접두사를 붙일 수 있습니다. 예를 들어, 관리용(admin) 라우트에 따라오는 모든 URI에 접두사를 붙이려 할 때 사용할 수 있습니다.

```php
Route::prefix('admin')->group(function () {
    Route::get('/users', function () {
        // "/admin/users" URL에 매칭됨
    });
});
```

<a name="route-group-name-prefixes"></a>

### 라우트 이름 접두사

`name` 메서드를 사용하면 그룹 내의 모든 라우트 이름 앞에 지정한 문자열을 접두사로 붙일 수 있습니다. 예를 들어, 그룹 내 모든 라우트의 이름 앞에 `admin`을 붙이려면 다음과 같이 할 수 있습니다. 전달한 문자열이 라우트 이름에 정확히 지정한 대로 접두사로 붙으므로, 반드시 접두사 끝에 마침표(`.`)를 포함시켜 주세요.

```php
Route::name('admin.')->group(function () {
    Route::get('/users', function () {
        // Route assigned name "admin.users"...
    })->name('users');
});
```

<a name="route-model-binding"></a>
## 라우트 모델 바인딩

라우트나 컨트롤러 액션에 모델 ID를 주입할 때, 일반적으로 해당 ID에 맞는 모델을 데이터베이스에서 조회하게 됩니다. 라라벨의 라우트 모델 바인딩을 사용하면 모델 인스턴스를 라우트로 자동으로 주입받을 수 있어 훨씬 편리합니다. 예를 들어, 단순히 사용자의 ID만 주입받는 대신, 주어진 ID와 일치하는 전체 `User` 모델 인스턴스 자체를 바로 사용할 수 있습니다.

<a name="implicit-binding"></a>
### 암묵적(Implicit) 바인딩

라라벨은 라우트나 컨트롤러 액션의 타입힌트된 변수명이 라우트 세그먼트 이름과 일치하면, 해당 Eloquent 모델을 자동으로 resolve(주입)합니다. 예시는 아래와 같습니다.

```php
use App\Models\User;

Route::get('/users/{user}', function (User $user) {
    return $user->email;
});
```

여기서 `$user` 변수가 `App\Models\User` Eloquent 모델로 타입힌트되고, 변수명과 `{user}` URI 세그먼트가 일치하므로, 라라벨은 요청 URI의 값과 일치하는 ID를 가진 모델 인스턴스를 자동으로 주입해줍니다. 만약 해당 모델 인스턴스를 데이터베이스에서 찾지 못하면, 자동으로 404 HTTP 응답이 발생합니다.

물론 암묵적 바인딩은 컨트롤러 메서드에서도 사용할 수 있습니다. 이때도 `{user}` URI 세그먼트와 컨트롤러의 `$user` 변수명이 일치해야 하며, 타입힌트 역시 `App\Models\User`이어야 합니다.

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
#### Soft Delete된 모델

기본적으로 암묵적 모델 바인딩은 [소프트 삭제](/docs/12.x/eloquent#soft-deleting)된 모델을 조회하지 않습니다. 하지만, 라우트 정의에 `withTrashed` 메서드를 체이닝하면 소프트 삭제된 모델도 조회할 수 있습니다.

```php
use App\Models\User;

Route::get('/users/{user}', function (User $user) {
    return $user->email;
})->withTrashed();
```

<a name="customizing-the-default-key-name"></a>
#### 바인딩 키 커스터마이징

특정 상황에서는 `id` 컬럼이 아닌 다른 컬럼으로 Eloquent 모델을 resolve하고 싶을 수 있습니다. 이럴 때는 라우트 파라미터 정의에서 콜론(`:`) 뒤에 컬럼명을 지정할 수 있습니다.

```php
use App\Models\Post;

Route::get('/posts/{post:slug}', function (Post $post) {
    return $post;
});
```

항상 특정 모델 클래스에서 `id`가 아닌 다른 DB 컬럼을 모델 바인딩의 기본 키로 사용하려면, Eloquent 모델에서 `getRouteKeyName` 메서드를 오버라이드하세요.

```php
/**
 * Get the route key for the model.
 */
public function getRouteKeyName(): string
{
    return 'slug';
}
```

<a name="implicit-model-binding-scoping"></a>
#### 커스텀 키와 스코프 바인딩

하나의 라우트 정의에서 여러 Eloquent 모델을 암묵적으로 바인딩할 때, 두 번째 Eloquent 모델이 앞선 모델의 하위(자식)임을 보장하는 것이 좋을 수 있습니다. 예를 들어, 아래 예시는 특정 유저의 블로그 포스트를 슬러그로 조회하는 라우트입니다.

```php
use App\Models\Post;
use App\Models\User;

Route::get('/users/{user}/posts/{post:slug}', function (User $user, Post $post) {
    return $post;
});
```

이렇게 중첩된 라우트 파라미터에 커스텀 키가 사용된 경우, 라라벨은 자동으로 앞선 모델의 연관관계를 추론하여(일반적으로 파라미터명 복수형 시도. 여기서는 `User` 모델의 `posts` 관계) 중첩된 모델 조회 시 이를 활용해 쿼리를 스코프(scope)합니다.

만약 커스텀 키를 사용하지 않아도 자식 바인딩에 스코프를 강제하고 싶다면, 라우트 정의 시 `scopeBindings` 메서드를 호출하면 됩니다.

```php
use App\Models\Post;
use App\Models\User;

Route::get('/users/{user}/posts/{post}', function (User $user, Post $post) {
    return $post;
})->scopeBindings();
```

또는 라우트 그룹 전체에 대해 스코프 바인딩을 적용할 수도 있습니다.

```php
Route::scopeBindings()->group(function () {
    Route::get('/users/{user}/posts/{post}', function (User $user, Post $post) {
        return $post;
    });
});
```

반대로, `withoutScopedBindings` 메서드를 호출하면 바인딩의 스코프 동작을 비활성화할 수 있습니다.

```php
Route::get('/users/{user}/posts/{post:slug}', function (User $user, Post $post) {
    return $post;
})->withoutScopedBindings();
```

<a name="customizing-missing-model-behavior"></a>
#### 모델을 찾지 못했을 때의 동작 커스터마이즈

기본적으로 암묵적으로 바인딩되는 모델을 데이터베이스에서 찾지 못하면, 라라벨은 404 HTTP 응답을 반환합니다. 그러나 라우트 정의 시 `missing` 메서드를 사용하여 이런 상황에서의 동작을 원하는 대로 지정할 수 있습니다. `missing` 메서드는 클로저를 인자로 받아, 바인딩된 모델을 찾지 못한 경우 이 클로저가 실행됩니다.

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

PHP 8.1에서는 [Enum(열거형)](https://www.php.net/manual/en/language.enumerations.backed.php) 기능이 도입되었습니다. 이 기능을 잘 활용할 수 있도록, 라라벨에서도 라우트 정의에서 [문자열 기반 Enum](https://www.php.net/manual/en/language.enumerations.backed.php) 타입힌트를 사용하면 해당 세그먼트가 Enum 값 중 하나에 해당할 때만 라우트가 실행됩니다. 그렇지 않으면 404 HTTP 응답이 자동으로 반환됩니다. 예를 들어 다음과 같은 Enum이 있을 때,

```php
<?php

namespace App\Enums;

enum Category: string
{
    case Fruits = 'fruits';
    case People = 'people';
}
```

`{category}` 라우트 세그먼트가 `fruits` 또는 `people`일 때만 해당 라우트가 호출됩니다. 그 외의 값이면 404 응답이 반환됩니다.

```php
use App\Enums\Category;
use Illuminate\Support\Facades\Route;

Route::get('/categories/{category}', function (Category $category) {
    return $category->value;
});
```

<a name="explicit-binding"></a>
### 명시적(Explicit) 바인딩

라라벨의 관례 기반(암묵적) 모델 바인딩을 꼭 사용할 필요는 없습니다. 파라미터가 어떤 모델과 매핑될지 명시적으로 사용할 수도 있습니다. 명시적 바인딩을 등록하려면, 라우터의 `model` 메서드를 통해 특정 파라미터에 매핑될 클래스를 지정하세요. 이 코드는 `AppServiceProvider` 클래스의 `boot` 메서드 내에서 정의하면 됩니다.

```php
use App\Models\User;
use Illuminate\Support\Facades\Route;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Route::model('user', User::class);
}
```

그 다음, `{user}` 파라미터가 포함된 라우트를 정의합니다.

```php
use App\Models\User;

Route::get('/users/{user}', function (User $user) {
    // ...
});
```

이제 `{user}` 파라미터가 항상 `App\Models\User` 모델에 바인딩됩니다. 예를 들어 `users/1`로 요청이 들어오면, ID가 1인 `User` 인스턴스가 주입됩니다.

DB에서 해당 모델을 찾지 못하면, 자동으로 404 HTTP 응답이 반환됩니다.

<a name="customizing-the-resolution-logic"></a>
#### 바인딩 로직의 커스터마이즈

모델 바인딩 로직을 직접 정의하고 싶다면, `Route::bind` 메서드를 사용할 수 있습니다. 이때 전달하는 클로저는 URI 세그먼트의 값을 받아야 하며, 라우트에 주입할 클래스 인스턴스를 반환해야 합니다. 이 설정 역시 애플리케이션의 `AppServiceProvider`의 `boot` 메서드에서 하면 됩니다.

```php
use App\Models\User;
use Illuminate\Support\Facades\Route;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Route::bind('user', function (string $value) {
        return User::where('name', $value)->firstOrFail();
    });
}
```

또 다른 방법으로, Eloquent 모델에서 `resolveRouteBinding` 메서드를 오버라이드할 수도 있습니다. 이 메서드는 URI 세그먼트 값을 받아, 라우트에 주입할 인스턴스를 반환해야 합니다.

```php
/**
 * Retrieve the model for a bound value.
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

[암묵적 바인딩 스코프](#implicit-model-binding-scoping)를 사용하는 라우트라면, `resolveChildRouteBinding` 메서드는 부모 모델의 자식 바인딩을 resolve하는 데 사용됩니다.

```php
/**
 * Retrieve the child model for a bound value.
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
## Fallback 라우트

`Route::fallback` 메서드를 사용하면, 들어오는 요청이 다른 어떤 라우트와도 일치하지 않을 때 실행되는 라우트를 정의할 수 있습니다. 일반적으로 처리되지 않은 요청은 애플리케이션의 예외 핸들러를 통해 자동으로 "404" 페이지로 렌더링됩니다. 다만, `fallback` 라우트는 `routes/web.php`에 정의하는 것이 일반적이기 때문에, `web` 미들웨어 그룹의 모든 미들웨어가 적용됩니다. 필요에 따라 이 라우트에 추가 미들웨어를 붙이는 것도 가능합니다.

```php
Route::fallback(function () {
    // ...
});
```

<a name="rate-limiting"></a>
## Rate Limiting(요청 제한)

<a name="defining-rate-limiters"></a>
### 요청 제한 정책(Rate Limiter) 정의

라라벨은 강력하면서도 유연한 요청 제한(Rate Limiting) 서비스를 제공합니다. 이 기능을 이용해 특정 라우트 또는 라우트 그룹에 들어오는 트래픽 양을 제한할 수 있습니다. 먼저, 애플리케이션에 맞는 Rate Limiter 설정을 정의해야 합니다.

Rate Limiter는 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드 내에서 정의할 수 있습니다.

```php
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

/**
 * Bootstrap any application services.
 */
protected function boot(): void
{
    RateLimiter::for('api', function (Request $request) {
        return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
    });
}
```

Rate Limiter는 `RateLimiter` 파사드의 `for` 메서드로 정의합니다. `for` 메서드는 어떤 이름의 Rate Limiter에 어떤 제한 정책을 적용할지 결정하는 클로저를 인자로 받으며, 이 클로저는 제한 구성을 반환해야 합니다. 제한 구성은 `Illuminate\Cache\RateLimiting\Limit` 클래스의 인스턴스이며, 이 클래스의 "빌더" 메서드를 사용해 다양한 제한을 쉽게 지정할 수 있습니다. Rate Limiter 이름은 원하는 문자열로 자유롭게 지정 가능합니다.

```php
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

/**
 * Bootstrap any application services.
 */
protected function boot(): void
{
    RateLimiter::for('global', function (Request $request) {
        return Limit::perMinute(1000);
    });
}
```

요청이 제한을 초과하면, 라라벨이 자동으로 429 HTTP 상태코드의 응답을 반환합니다. 만약 제한 초과 시 반환할 응답을 직접 정의하고 싶다면, `response` 메서드를 사용할 수 있습니다.

```php
RateLimiter::for('global', function (Request $request) {
    return Limit::perMinute(1000)->response(function (Request $request, array $headers) {
        return response('Custom response...', 429, $headers);
    });
});
```

Rate Limiter의 콜백은 들어오는 HTTP 요청 인스턴스를 전달받으므로, 요청 정보나 인증된 사용자 정보를 활용해 동적으로 제한 정책을 적용할 수도 있습니다.

```php
RateLimiter::for('uploads', function (Request $request) {
    return $request->user()->vipCustomer()
        ? Limit::none()
        : Limit::perMinute(100);
});
```

<a name="segmenting-rate-limits"></a>
#### 요청 제한 구간 나누기(Segmenting Rate Limits)

어떤 경우에는 임의의 값을 기준으로 제한 구간을 분리하고 싶을 수 있습니다. 예를 들어, 각 IP 주소별로 특정 라우트에 분당 100회 접근을 허용하려면, 제한 정책을 만들 때 `by` 메서드를 사용하세요.

```php
RateLimiter::for('uploads', function (Request $request) {
    return $request->user()->vipCustomer()
        ? Limit::none()
        : Limit::perMinute(100)->by($request->ip());
});
```

또 다른 예시로, 인증된 사용자에 대해서는 사용자 ID별로 분당 100회, 비회원 IP별로는 분당 10회로 제한할 수 있습니다.

```php
RateLimiter::for('uploads', function (Request $request) {
    return $request->user()
        ? Limit::perMinute(100)->by($request->user()->id)
        : Limit::perMinute(10)->by($request->ip());
});
```

<a name="multiple-rate-limits"></a>
#### 다중 요청 제한(Multiple Rate Limits)

필요하다면, 배열 형태로 여러 개의 Rate Limit을 반환할 수도 있습니다. 배열에 정의된 각 Rate Limit이 해당 라우트에 순차적으로 적용됩니다.

```php
RateLimiter::for('login', function (Request $request) {
    return [
        Limit::perMinute(500),
        Limit::perMinute(3)->by($request->input('email')),
    ];
});
```

동일한 `by` 값으로 여러 개의 제한을 적용할 때는 각 `by` 값이 유일해야 합니다. 가장 쉬운 방법은 `by` 메서드의 값에 접두사를 붙이는 것입니다.

```php
RateLimiter::for('uploads', function (Request $request) {
    return [
        Limit::perMinute(10)->by('minute:'.$request->user()->id),
        Limit::perDay(1000)->by('day:'.$request->user()->id),
    ];
});
```

<a name="attaching-rate-limiters-to-routes"></a>
### 라우트에 Rate Limiter 적용하기

Rate Limiter는 [throttle 미들웨어](/docs/12.x/middleware)를 통해 라우트 또는 라우트 그룹에 적용할 수 있습니다. `throttle` 미들웨어에는 적용하고자 하는 Rate Limiter의 이름을 넘겨주면 됩니다.

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
#### Redis를 사용하는 경우의 요청 제한

기본적으로 `throttle` 미들웨어는 `Illuminate\Routing\Middleware\ThrottleRequests` 클래스에 매핑되어 있습니다. 하지만 애플리케이션의 캐시 드라이버로 Redis를 사용하는 경우, 라라벨이 Redis로 요청 제한을 관리하도록 지정할 수 있습니다. 이를 위해 `bootstrap/app.php` 파일에서 `throttleWithRedis` 메서드를 사용하세요. 이 메서드는 `throttle` 미들웨어를 `Illuminate\Routing\Middleware\ThrottleRequestsWithRedis` 미들웨어 클래스로 등록합니다.

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->throttleWithRedis();
    // ...
})
```

<a name="form-method-spoofing"></a>
## 폼 메서드 속이기(Form Method Spoofing)

HTML 폼은 기본적으로 `PUT`, `PATCH`, `DELETE`와 같은 HTTP 메서드를 지원하지 않습니다. 그래서 HTML 폼에서 `PUT`, `PATCH`, `DELETE` 메서드가 필요한 라우트를 호출할 때는 폼 내부에 숨겨진 `_method` 필드를 추가해야 합니다. 이 필드에 넣은 값이 실제 HTTP 요청의 메서드로 간주됩니다.

```blade
<form action="/example" method="POST">
    <input type="hidden" name="_method" value="PUT">
    <input type="hidden" name="_token" value="{{ csrf_token() }}">
</form>
```

더 간편하게는, [Blade 디렉티브](/docs/12.x/blade)인 `@method`를 사용해 `_method` 입력 필드를 생성할 수 있습니다.

```blade
<form action="/example" method="POST">
    @method('PUT')
    @csrf
</form>
```

<a name="accessing-the-current-route"></a>
## 현재 라우트 정보 접근하기

`Route` 파사드의 `current`, `currentRouteName`, `currentRouteAction` 메서드를 이용해 현재 요청을 처리하는 라우트의 정보를 얻을 수 있습니다.

```php
use Illuminate\Support\Facades\Route;

$route = Route::current(); // Illuminate\Routing\Route
$name = Route::currentRouteName(); // string
$action = Route::currentRouteAction(); // string
```

더 많은 메서드와 사용법은 [Route 파사드의 실제 클래스 API 문서](https://api.laravel.com/docs/12.x/Illuminate/Routing/Router.html)와 [Route 인스턴스 API 문서](https://api.laravel.com/docs/12.x/Illuminate/Routing/Route.html)에서 확인할 수 있습니다.

<a name="cors"></a>
## CORS(Cross-Origin Resource Sharing)

라라벨은 CORS `OPTIONS` HTTP 요청에 대해, 여러분이 설정한 값으로 자동 응답할 수 있습니다. 이러한 `OPTIONS` 요청은 애플리케이션의 글로벌 미들웨어 스택에 기본 포함된 `HandleCors` [미들웨어](/docs/12.x/middleware)가 알아서 처리합니다.

때로는 애플리케이션의 CORS 구성 값을 직접 커스터마이즈해야 할 수도 있습니다. 이 경우 `config:publish` Artisan 명령어를 사용해 `cors` 설정 파일을 게시하세요.

```shell
php artisan config:publish cors
```

이 명령어를 실행하면, 애플리케이션의 `config` 디렉터리에 `cors.php` 설정 파일이 생성됩니다.

> [!NOTE]
> CORS 및 CORS 헤더에 대한 더 자세한 정보는 [MDN 웹 문서의 CORS 안내](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#The_HTTP_response_headers)를 참고하세요.

<a name="route-caching"></a>
## 라우트 캐싱

애플리케이션을 프로덕션 환경에 배포할 때는 라라벨의 라우트 캐시 기능을 꼭 활용하세요. 라우트 캐시를 사용하면 애플리케이션의 모든 라우트를 등록하는 데 소요되는 시간이 크게 줄어듭니다. 라우트 캐시를 생성하려면 `route:cache` Artisan 명령어를 실행하세요.

```shell
php artisan route:cache
```

이 명령을 실행하면, 모든 요청에 매번 캐시된 라우트 파일이 로딩됩니다. 새로운 라우트를 추가했을 경우, 반드시 라우트 캐시를 새로 생성해야 함을 기억하세요. 따라서 이 명령어는 프로젝트 배포 과정에서만 실행하는 것이 좋습니다.

라우트 캐시는 `route:clear` 명령어로 삭제할 수 있습니다.

```shell
php artisan route:clear
```