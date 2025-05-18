# 라우팅 (Routing)

- [기본 라우팅](#basic-routing)
    - [기본 라우트 파일](#the-default-route-files)
    - [리다이렉트 라우트](#redirect-routes)
    - [뷰 라우트](#view-routes)
    - [라우트 목록 확인](#listing-your-routes)
    - [라우팅 커스터마이징](#routing-customization)
- [라우트 파라미터](#route-parameters)
    - [필수 파라미터](#required-parameters)
    - [옵션 파라미터](#parameters-optional-parameters)
    - [정규 표현식 제약](#parameters-regular-expression-constraints)
- [네임드(이름 있는) 라우트](#named-routes)
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
- [요청 제한(Rate Limiting)](#rate-limiting)
    - [요청 제한자 정의](#defining-rate-limiters)
    - [라우트에 요청 제한자 적용](#attaching-rate-limiters-to-routes)
- [폼 메서드 속이기(Method Spoofing)](#form-method-spoofing)
- [현재 라우트 정보 확인](#accessing-the-current-route)
- [CORS(교차 출처 리소스 공유)](#cors)
- [라우트 캐시](#route-caching)

<a name="basic-routing"></a>
## 기본 라우팅

가장 간단한 라라벨 라우트는 URI와 클로저(익명 함수)를 받아 복잡한 라우팅 설정 파일 없이도 매우 간결하고 직관적으로 라우트와 동작을 정의할 수 있습니다.

```
use Illuminate\Support\Facades\Route;

Route::get('/greeting', function () {
    return 'Hello World';
});
```

<a name="the-default-route-files"></a>
### 기본 라우트 파일

라라벨에서 사용하는 모든 라우트는 `routes` 디렉터리 내에 있는 라우트 파일들에 정의되어 있습니다. 이 파일들은 애플리케이션의 `bootstrap/app.php` 파일에 지정된 설정에 따라 라라벨이 자동으로 불러옵니다. `routes/web.php` 파일은 웹 인터페이스를 위한 라우트를 정의합니다. 이 파일의 라우트들은 `web` [미들웨어 그룹](/docs/11.x/middleware#laravels-default-middleware-groups)에 자동으로 할당되어, 세션 상태, CSRF 보호와 같은 기능을 제공합니다.

대부분의 애플리케이션에서는 `routes/web.php` 파일에서 라우트를 먼저 정의하게 됩니다. `web.php`에 정의한 라우트는 해당 URL을 브라우저에 입력해서 접근할 수 있습니다. 예를 들어, 아래의 라우트는 브라우저에서 `http://example.com/user`로 접속하면 확인할 수 있습니다.

```
use App\Http\Controllers\UserController;

Route::get('/user', [UserController::class, 'index']);
```

<a name="api-routes"></a>
#### API 라우트

애플리케이션이 무상태 API도 제공해야 한다면, `install:api` 아티즌 명령어로 API 라우팅을 활성화할 수 있습니다.

```shell
php artisan install:api
```

`install:api` 명령어는 [Laravel Sanctum](/docs/11.x/sanctum)을 설치합니다. Sanctum은 써드파티 API 소비자, SPA, 모바일 앱 등에 사용할 수 있는 강력하면서도 간편한 API 토큰 인증 방식(가드)을 제공합니다. 또한, 이 명령어를 실행하면 `routes/api.php` 파일이 생성됩니다.

```
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
```

`routes/api.php`에 정의된 라우트는 무상태(stateless)로 동작하며, `api` [미들웨어 그룹](/docs/11.x/middleware#laravels-default-middleware-groups)에 할당됩니다. 또한, 이 파일에 정의된 모든 라우트에는 `/api` URI 접두사가 자동으로 적용되므로, 직접 모든 라우트에 일일이 접두사를 붙이지 않아도 됩니다. 이 접두사는 애플리케이션의 `bootstrap/app.php` 파일을 수정하여 변경할 수 있습니다.

```
->withRouting(
    api: __DIR__.'/../routes/api.php',
    apiPrefix: 'api/admin',
    // ...
)
```

<a name="available-router-methods"></a>
#### 라우터에서 제공하는 메서드

라우터는 모든 HTTP HTTP 동사(버브)에 응답하는 라우트를 등록할 수 있습니다.

```
Route::get($uri, $callback);
Route::post($uri, $callback);
Route::put($uri, $callback);
Route::patch($uri, $callback);
Route::delete($uri, $callback);
Route::options($uri, $callback);
```

경우에 따라 여러 HTTP 메서드에 동시에 응답하는 라우트를 등록해야 할 수도 있습니다. 이럴 때는 `match` 메서드를 사용하면 됩니다. 또는, 모든 HTTP 메서드에 응답하는 라우트를 `any` 메서드로 등록할 수도 있습니다.

```
Route::match(['get', 'post'], '/', function () {
    // ...
});

Route::any('/', function () {
    // ...
});
```

> [!NOTE]  
> 동일한 URI를 사용하는 여러 라우트를 정의할 때는, `get`, `post`, `put`, `patch`, `delete`, `options` 메서드를 사용하는 라우트가 `any`, `match`, `redirect` 메서드를 사용하는 라우트보다 먼저 정의되어야 합니다. 이렇게 하면 들어오는 요청이 올바른 라우트와 매칭됩니다.

<a name="dependency-injection"></a>
#### 의존성 주입

라우트의 콜백에서 필요한 의존성을 타입힌트 하면, 라라벨 [서비스 컨테이너](/docs/11.x/container)가 자동으로 해당 의존성을 해결(주입)해줍니다. 예를 들어, 현재 HTTP 요청 정보를 자동으로 전달받으려면 `Illuminate\Http\Request` 클래스를 타입힌트하면 됩니다.

```
use Illuminate\Http\Request;

Route::get('/users', function (Request $request) {
    // ...
});
```

<a name="csrf-protection"></a>
#### CSRF 보호

`web` 라우트 파일에 정의된 `POST`, `PUT`, `PATCH`, `DELETE`용 HTML 폼은 반드시 CSRF 토큰 필드를 포함해야 합니다. 그렇지 않으면 요청이 거부됩니다. CSRF 보호에 관한 상세 내용은 [CSRF 문서](/docs/11.x/csrf)에서 확인할 수 있습니다.

```
<form method="POST" action="/profile">
    @csrf
    ...
</form>
```

<a name="redirect-routes"></a>
### 리다이렉트 라우트

다른 URI로 리다이렉트 하는 라우트를 정의하려면 `Route::redirect` 메서드를 사용할 수 있습니다. 이 메서드를 사용하면 단순한 리다이렉트 처리를 위해 전체 라우트 또는 컨트롤러를 따로 정의하지 않아도 됩니다.

```
Route::redirect('/here', '/there');
```

기본적으로 `Route::redirect`는 `302` 상태 코드를 반환합니다. 선택적으로 세 번째 인자를 사용해 상태 코드를 지정할 수 있습니다.

```
Route::redirect('/here', '/there', 301);
```

또는, `Route::permanentRedirect` 메서드를 사용하면 `301` 상태 코드(영구 리다이렉트)를 반환합니다.

```
Route::permanentRedirect('/here', '/there');
```

> [!WARNING]  
> 리다이렉트 라우트에서 라우트 파라미터를 사용할 때, `destination`, `status` 파라미터명은 라라벨에서 예약어이므로 사용할 수 없습니다.

<a name="view-routes"></a>
### 뷰 라우트

라우트가 단순히 [뷰](/docs/11.x/views)만 반환해야 한다면, `Route::view` 메서드를 사용할 수 있습니다. `redirect` 메서드처럼, 전체 라우트나 컨트롤러를 따로 구현하지 않아도 되는 간단한 단축 방법입니다. `view` 메서드는 첫 번째 인수로 URI, 두 번째 인수로 뷰 이름을 받고, 선택적으로 세 번째 인수로 뷰에 전달할 데이터를 배열로 전달할 수 있습니다.

```
Route::view('/welcome', 'welcome');

Route::view('/welcome', 'welcome', ['name' => 'Taylor']);
```

> [!WARNING]  
> 뷰 라우트에서 라우트 파라미터를 사용할 때, `view`, `data`, `status`, `headers` 파라미터명은 라라벨에서 예약어이므로 사용할 수 없습니다.

<a name="listing-your-routes"></a>
### 라우트 목록 확인

`route:list` 아티즌 명령어로 애플리케이션에 정의된 모든 라우트를 한눈에 볼 수 있습니다.

```shell
php artisan route:list
```

기본적으로 각 라우트에 할당된 미들웨어는 `route:list` 출력에 표시되지 않습니다. 하지만, 명령어에 `-v` 옵션을 추가하면 라우트 미들웨어와 미들웨어 그룹 이름을 함께 표시할 수 있습니다.

```shell
php artisan route:list -v

# 미들웨어 그룹까지 확장해서 확인하려면...
php artisan route:list -vv
```

또한, 라라벨에게 특정 URI로 시작하는 라우트만 표시하도록 할 수도 있습니다.

```shell
php artisan route:list --path=api
```

그리고, 써드파티 패키지에서 정의한 라우트를 목록에서 숨기려면 `--except-vendor` 옵션을 사용할 수 있습니다.

```shell
php artisan route:list --except-vendor
```

반대로, 써드파티 패키지에서 정의한 라우트만 표기하려면 `--only-vendor` 옵션을 사용할 수 있습니다.

```shell
php artisan route:list --only-vendor
```

<a name="routing-customization"></a>
### 라우팅 커스터마이징

기본적으로 애플리케이션의 라우트는 `bootstrap/app.php` 파일에서 자동으로 설정, 로드됩니다.

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

하지만 때때로, 일부 라우트를 별도의 파일에 완전히 새로 정의하고 싶을 수도 있습니다. 이럴 때는 `withRouting` 메서드에 `then` 클로저를 전달할 수 있습니다. 이 클로저 내부에서 필요한 추가 라우트를 등록할 수 있습니다.

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

또는, `withRouting`에 `using` 클로저를 전달해서 라우트 등록을 완전히 수동으로 제어할 수도 있습니다. 이 옵션을 사용하면 프레임워크가 HTTP 라우트를 자동으로 등록하지 않으며, 모든 라우트를 직접 등록해야 합니다.

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

경우에 따라, URI의 일부 구간을 라우트 파라미터로 받아와야 할 때가 있습니다. 예를 들어, URL에서 사용자의 ID 값을 받아와야 한다면 다음처럼 라우트 파라미터를 정의할 수 있습니다.

```
Route::get('/user/{id}', function (string $id) {
    return 'User '.$id;
});
```

라우트에 필요한 만큼 여러 개의 파라미터를 정의할 수 있습니다.

```
Route::get('/posts/{post}/comments/{comment}', function (string $postId, string $commentId) {
    // ...
});
```

라우트 파라미터는 항상 `{}` 중괄호로 감싸서 표기하며, 영문 알파벳 문자로 이루어져야 합니다. 파라미터 이름에는 언더스코어(`_`)도 사용할 수 있습니다. 라우트 파라미터는 등록한 순서대로 콜백이나 컨트롤러에 전달됩니다. 즉, 콜백/컨트롤러의 인자 이름과 라우트 파라미터 이름이 꼭 일치하지 않아도 됩니다.

<a name="parameters-and-dependency-injection"></a>
#### 파라미터와 의존성 주입

라우트 콜백에서 라라벨 서비스 컨테이너가 자동으로 주입해야 하는 의존성이 있다면, 해당 의존성을 먼저 표기하고, 라우트 파라미터를 그 뒤에 나열해야 합니다.

```
use Illuminate\Http\Request;

Route::get('/user/{id}', function (Request $request, string $id) {
    return 'User '.$id;
});
```

<a name="parameters-optional-parameters"></a>
### 옵션 파라미터

가끔은 라우트 파라미터가 항상 있을 필요가 없는 경우도 있습니다. 이런 경우, 파라미터 이름 뒤에 `?`를 붙여 옵션 파라미터로 만들 수 있습니다. 그리고 콜백에서 해당 변수에 기본값을 꼭 지정해줘야 합니다.

```
Route::get('/user/{name?}', function (?string $name = null) {
    return $name;
});

Route::get('/user/{name?}', function (?string $name = 'John') {
    return $name;
});
```

<a name="parameters-regular-expression-constraints"></a>
### 정규 표현식 제약

라우트 인스턴스의 `where` 메서드를 사용하여 라우트 파라미터의 형식을 정규 표현식으로 제약할 수 있습니다. `where` 메서드는 파라미터명과 정규식 패턴을 인수로 받습니다.

```
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

자주 사용되는 정규 표현식 패턴은 헬퍼 메서드로 간단히 지정할 수도 있습니다.

```
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

들어오는 요청이 라우트 패턴 제약 조건과 일치하지 않으면, 404 HTTP 응답이 반환됩니다.

<a name="parameters-global-constraints"></a>
#### 전역 제약

라우트 파라미터에 항상 특정 정규 표현식을 전역적으로 적용하고 싶다면, `pattern` 메서드를 사용할 수 있습니다. 이 패턴은 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 정의하면 됩니다.

```
use Illuminate\Support\Facades\Route;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Route::pattern('id', '[0-9]+');
}
```

이렇게 패턴을 지정하면 해당 파라미터명을 사용하는 모든 라우트에 자동으로 제약이 적용됩니다.

```
Route::get('/user/{id}', function (string $id) {
    // {id}가 숫자인 경우에만 실행됨...
});
```

<a name="parameters-encoded-forward-slashes"></a>
#### 인코딩된 슬래시(`/`) 허용

라라벨 라우팅 컴포넌트는 기본적으로 라우트 파라미터 값에 `/`를 제외한 모든 문자를 허용합니다. 만약 파라미터 값에 `/`를 허용하려면, `where` 메서드의 정규식 조건으로 명시적으로 허용해주어야 합니다.

```
Route::get('/search/{search}', function (string $search) {
    return $search;
})->where('search', '.*');
```

> [!WARNING]  
> 인코딩된 슬래시는 항상 라우트 마지막 구간(세그먼트)에서만 사용할 수 있습니다.

<a name="named-routes"></a>
## 네임드(이름 있는) 라우트

이름이 있는 라우트를 등록하면 해당 라우트에 대해 URL이나 리다이렉트를 간편하게 생성할 수 있습니다. 라우트 등록 시 `name` 메서드를 체이닝하여 라우트의 이름을 지정할 수 있습니다.

```
Route::get('/user/profile', function () {
    // ...
})->name('profile');
```

또한, 컨트롤러 액션 라우트에도 라우트 이름을 지정할 수 있습니다.

```
Route::get(
    '/user/profile',
    [UserProfileController::class, 'show']
)->name('profile');
```

> [!WARNING]  
> 라우트 이름은 반드시 고유해야 합니다.

<a name="generating-urls-to-named-routes"></a>
#### 네임드 라우트로 URL 생성

라우트에 이름을 지정했다면, 라라벨의 `route`, `redirect` 헬퍼 함수를 통해 해당 이름으로 URL이나 리다이렉트를 손쉽게 생성할 수 있습니다.

```
// URL 생성...
$url = route('profile');

// 리다이렉트 생성...
return redirect()->route('profile');

return to_route('profile');
```

만약 네임드 라우트에 파라미터가 지정되어 있다면, 두 번째 인수로 파라미터 배열을 전달하면 됩니다. 전달한 값은 자동으로 적절한 위치에 URL에 반영됩니다.

```
Route::get('/user/{id}/profile', function (string $id) {
    // ...
})->name('profile');

$url = route('profile', ['id' => 1]);
```

파라미터 배열에 추가로 값을 더 전달하면, 해당 값들은 자동으로 쿼리스트링에 추가됩니다.

```
Route::get('/user/{id}/profile', function (string $id) {
    // ...
})->name('profile');

$url = route('profile', ['id' => 1, 'photos' => 'yes']);

// /user/1/profile?photos=yes
```

> [!NOTE]  
> 경우에 따라 요청 전체에 적용되는 URL 파라미터의 기본값(예: 현재 언어)을 지정하고 싶을 수 있습니다. 이를 위해 [`URL::defaults` 메서드](/docs/11.x/urls#default-values)를 사용할 수 있습니다.

<a name="inspecting-the-current-route"></a>
#### 현재 라우트 확인

현재 요청이 특정 네임드 라우트로 라우팅되었는지 확인하려면 Route 인스턴스의 `named` 메서드를 사용할 수 있습니다. 예를 들어, 미들웨어에서 현재 라우트 이름을 체크할 수 있습니다.

```
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

라우트 그룹을 이용하면, 여러 라우트에 동일한 속성(예: 미들웨어)을 일일이 반복하지 않고 한번에 공유할 수 있습니다.

중첩된 라우트 그룹에서는 부모/자식 그룹의 속성이 적절히 "병합"됩니다. 미들웨어, `where` 조건은 병합되고, 이름(name)과 접두사(prefix)는 서로 이어 붙여집니다. 네임스페이스 구분자나 URI 슬래시 등도 그룹 구조에 맞춰 자동으로 추가 또는 연결됩니다.

<a name="route-group-middleware"></a>
### 미들웨어

[미들웨어](/docs/11.x/middleware)를 하나의 그룹 내 모든 라우트에 적용하려면, 그룹을 정의하기 전에 `middleware` 메서드를 사용하면 됩니다. 배열에 나열한 순서대로 미들웨어가 실행됩니다.

```
Route::middleware(['first', 'second'])->group(function () {
    Route::get('/', function () {
        // first, second 미들웨어가 적용됨...
    });

    Route::get('/user/profile', function () {
        // first, second 미들웨어가 적용됨...
    });
});
```

<a name="route-group-controllers"></a>
### 컨트롤러

여러 라우트가 모두 동일한 [컨트롤러](/docs/11.x/controllers)를 사용한다면, `controller` 메서드로 그룹 내 공통 컨트롤러를 지정할 수 있습니다. 이후 각 라우트 정의에는 컨트롤러 메서드 이름만 명시하면 됩니다.

```
use App\Http\Controllers\OrderController;

Route::controller(OrderController::class)->group(function () {
    Route::get('/orders/{id}', 'show');
    Route::post('/orders', 'store');
});
```

<a name="route-group-subdomain-routing"></a>
### 서브도메인 라우팅

라우트 그룹을 활용해 서브도메인 라우팅도 처리할 수 있습니다. 서브도메인에도 라우트 파라미터를 사용할 수 있기 때문에, URI처럼 일부를 캡처해서 라우트나 컨트롤러에서 사용할 수 있습니다. 서브도메인은 `domain` 메서드로 지정합니다.

```
Route::domain('{account}.example.com')->group(function () {
    Route::get('/user/{id}', function (string $account, string $id) {
        // ...
    });
});
```

> [!WARNING]  
> 서브도메인 라우트를 제대로 동작시키려면, 반드시 루트 도메인 라우트를 등록하기 전에 서브도메인 라우트를 먼저 등록해야 합니다. 이렇게 하면 동일한 URI 경로를 가진 루트 도메인 라우트가 서브도메인 라우트를 덮어쓰는 문제를 방지할 수 있습니다.

<a name="route-group-prefixes"></a>
### 라우트 접두사

`prefix` 메서드를 사용하여 그룹 내 모든 라우트의 URI에 지정한 접두사를 붙일 수 있습니다. 예를 들어, 그룹 내 모든 라우트 URI 앞에 `admin`을 붙이고 싶을 때 사용할 수 있습니다.

```
Route::prefix('admin')->group(function () {
    Route::get('/users', function () {
        // "/admin/users" URL과 매칭됨
    });
});
```

<a name="route-group-name-prefixes"></a>

### 라우트 이름 프리픽스

`name` 메서드를 사용하면 그룹 내의 각 라우트 이름 앞에 지정한 문자열을 접두사로 붙일 수 있습니다. 예를 들어, 그룹 내 모든 라우트의 이름 앞에 `admin`을 붙이고 싶을 수 있습니다. 지정한 문자열은 입력한 그대로 라우트 이름 앞에 붙으므로, 접두어에 꼭 마지막에 `.` 문자를 포함해서 작성해야 합니다.

```
Route::name('admin.')->group(function () {
    Route::get('/users', function () {
        // Route assigned name "admin.users"...
    })->name('users');
});
```

<a name="route-model-binding"></a>
## 라우트 모델 바인딩

라우트나 컨트롤러 액션에 모델 ID를 주입할 때, 보통 해당 ID에 해당하는 모델을 데이터베이스에서 조회하게 됩니다. 라라벨의 라우트 모델 바인딩 기능을 이용하면, 모델 인스턴스를 라우트에 직접 자동으로 주입받을 수 있습니다. 예를 들어, 사용자의 ID가 아니라 해당 ID와 일치하는 전체 `User` 모델 인스턴스를 주입받을 수 있습니다.

<a name="implicit-binding"></a>
### 암묵적(Implicit) 바인딩

라라벨은 라우트나 컨트롤러 액션에서 타입 힌트가 지정된 변수명이 라우트 세그먼트 이름과 일치하는 Eloquent 모델을 자동으로 해결(주입)해줍니다. 예시는 다음과 같습니다.

```
use App\Models\User;

Route::get('/users/{user}', function (User $user) {
    return $user->email;
});
```

위 예시에서 `$user` 변수는 `App\Models\User` Eloquent 모델로 타입 힌트 되어 있고, 변수명이 `{user}` URI 세그먼트와 일치하기 때문에, 라라벨은 요청된 URI에서 해당 값과 ID가 일치하는 모델 인스턴스를 자동으로 주입해줍니다. 일치하는 모델 인스턴스를 데이터베이스에서 찾지 못하면 자동으로 404 HTTP 응답을 반환합니다.

물론, 이런 암묵적 바인딩은 컨트롤러 메서드를 사용할 때도 동일하게 작동합니다. 아래 예시처럼 URI 세그먼트 `{user}`와 타입 힌트된 `$user` 변수가 일치하면 라라벨이 자동으로 인스턴스를 주입해줍니다.

```
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
#### 소프트 삭제된(Soft Deleted) 모델

보통 암묵적 모델 바인딩은 [소프트 삭제](/docs/11.x/eloquent#soft-deleting)된 모델을 조회하지 않습니다. 하지만, 라우트 정의에서 `withTrashed` 메서드를 체이닝하면 소프트 삭제된 모델도 바인딩해서 가져올 수 있습니다.

```
use App\Models\User;

Route::get('/users/{user}', function (User $user) {
    return $user->email;
})->withTrashed();
```

<a name="customizing-the-default-key-name"></a>
#### 바인딩 키 커스터마이징

때로는 `id`가 아닌 다른 컬럼을 이용해 Eloquent 모델을 바인딩하고 싶을 수 있습니다. 이럴 때는 라우트 파라미터 정의에서 사용할 컬럼을 명시할 수 있습니다.

```
use App\Models\Post;

Route::get('/posts/{post:slug}', function (Post $post) {
    return $post;
});
```

특정 모델 클래스에 대해 바인딩에 항상 `id` 이외의 컬럼을 사용하도록 하고 싶다면, Eloquent 모델에서 `getRouteKeyName` 메서드를 오버라이드 하십시오.

```
/**
 * Get the route key for the model.
 */
public function getRouteKeyName(): string
{
    return 'slug';
}
```

<a name="implicit-model-binding-scoping"></a>
#### 커스텀 키와 스코핑(Scoping)

하나의 라우트 정의에서 여러 Eloquent 모델을 암묵적으로 바인딩할 때, 두 번째 모델이 첫 번째 모델의 하위(자식) 모델이어야만 하는 경우가 있습니다. 예를 들어, 특정 사용자에 소속된 블로그 포스트를 slug로 조회할 때 다음과 같이 라우트를 정의할 수 있습니다.

```
use App\Models\Post;
use App\Models\User;

Route::get('/users/{user}/posts/{post:slug}', function (User $user, Post $post) {
    return $post;
});
```

이처럼 중첩된 라우트 파라미터에 커스텀 키(예: `slug`)를 사용할 때 라라벨은 자동으로 쿼리를 스코프하여, 부모 모델의 연관관계를 통해 자식 모델을 조회합니다. 위 예시의 경우에는 `User` 모델에 `posts`라는(라우트 파라미터명을 복수형으로 한) 연관관계가 있다고 가정하고, 이를 통해 `Post` 모델을 조회합니다.

원한다면 커스텀 키를 지정하지 않은 경우에도 "자식" 바인딩을 스코프 하도록 라라벨에 지시할 수 있습니다. 이럴 때는 라우트 정의 시 `scopeBindings` 메서드를 호출하면 됩니다.

```
use App\Models\Post;
use App\Models\User;

Route::get('/users/{user}/posts/{post}', function (User $user, Post $post) {
    return $post;
})->scopeBindings();
```

또는, 라우트 그룹 전체에 대해 스코프 바인딩을 사용할 수도 있습니다.

```
Route::scopeBindings()->group(function () {
    Route::get('/users/{user}/posts/{post}', function (User $user, Post $post) {
        return $post;
    });
});
```

반대로, `withoutScopedBindings` 메서드를 사용하여 라라벨이 자동 스코프 바인딩을 하지 않도록 명확하게 지정할 수도 있습니다.

```
Route::get('/users/{user}/posts/{post:slug}', function (User $user, Post $post) {
    return $post;
})->withoutScopedBindings();
```

<a name="customizing-missing-model-behavior"></a>
#### 존재하지 않는 모델에 대한 행동 커스터마이징

일반적으로 암묵적으로 바인딩된 모델을 찾지 못하면 404 HTTP 응답이 반환됩니다. 하지만 라우트 정의 시 `missing` 메서드를 호출하여 이 동작을 커스터마이즈할 수 있습니다. `missing` 메서드는 바인딩된 모델을 찾지 못했을 때 호출되는 클로저를 인자로 받습니다.

```
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

PHP 8.1부터 [Enum(열거형)](https://www.php.net/manual/en/language.enumerations.backed.php)이 지원됩니다. 이와 연계하여, 라라벨에서는 라우트 정의 시 [문자열 기반 Enum](https://www.php.net/manual/en/language.enumerations.backed.php)을 타입 힌트에 사용하면, 해당 라우트 세그먼트가 Enum의 유효한 값일 때만 라우트가 실행됩니다. 그렇지 않으면 자동으로 404 HTTP 응답을 반환합니다. 예를 들어 아래와 같은 Enum이 있다고 가정해 봅니다.

```php
<?php

namespace App\Enums;

enum Category: string
{
    case Fruits = 'fruits';
    case People = 'people';
}
```

이제 아래와 같이 `{category}` 세그먼트가 `fruits` 또는 `people`일 때만 호출되는 라우트를 정의할 수 있습니다. 그렇지 않으면 404 HTTP 응답이 반환됩니다.

```php
use App\Enums\Category;
use Illuminate\Support\Facades\Route;

Route::get('/categories/{category}', function (Category $category) {
    return $category->value;
});
```

<a name="explicit-binding"></a>
### 명시적(Explicit) 바인딩

모델 바인딩을 위해 꼭 라라벨의 암묵적(규칙 기반) 모델 바인딩만을 사용할 필요는 없습니다. 라우트 파라미터와 모델을 연결하는 방식을 직접 명시적으로 정의할 수도 있습니다. 명시적 바인딩을 등록하려면 라우터의 `model` 메서드로 해당 파라미터에 사용할 모델 클래스를 지정합니다. 보통 이 코드는 `AppServiceProvider`의 `boot` 메서드에서 작성합니다.

```
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

이제 `{user}` 파라미터를 포함한 라우트를 정의할 수 있습니다.

```
use App\Models\User;

Route::get('/users/{user}', function (User $user) {
    // ...
});
```

이렇게 하면 모든 `{user}` 파라미터는 `App\Models\User` 모델에 바인딩되어 해당 클래스의 인스턴스가 주입됩니다. 예를 들어, `users/1`로 요청하면 데이터베이스에서 ID가 `1`인 `User` 인스턴스가 주입됩니다.

만약 일치하는 모델 인스턴스를 데이터베이스에서 찾을 수 없는 경우, 자동으로 404 HTTP 응답이 반환됩니다.

<a name="customizing-the-resolution-logic"></a>
#### 바인딩 로직 커스터마이징

직접 모델 바인딩 동작을 정의하고 싶다면 `Route::bind` 메서드를 사용할 수 있습니다. `bind` 메서드에 전달하는 클로저는 URI 세그먼트의 값을 받아, 라우트에 주입할 인스턴스를 반환해야 합니다. 이 커스터마이즈 역시 애플리케이션의 `AppServiceProvider`의 `boot` 메서드에서 작성합니다.

```
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

또는, Eloquent 모델에서 `resolveRouteBinding` 메서드를 오버라이드하여 바인딩 방법을 지정할 수도 있습니다. 이 메서드는 URI 세그먼트의 값을 인자로 받아 라우트에 주입할 인스턴스를 반환해야 합니다.

```
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

라운트에서 [암묵적 바인딩 스코핑](#implicit-model-binding-scoping)을 사용할 경우, 부모 모델에서 자식 바인딩을 해결할 때는 `resolveChildRouteBinding` 메서드가 호출됩니다.

```
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
## 폴백(Fallback) 라우트

`Route::fallback` 메서드를 통해, 들어오는 요청이 어느 라우트에도 매칭되지 않을 때 실행되는 라우트를 정의할 수 있습니다. 보통 처리되지 않은 요청은 애플리케이션의 예외 핸들러에서 자동으로 "404" 페이지를 보여줍니다. 하지만 `routes/web.php` 파일에 `fallback` 라우트를 정의할 경우, `web` 미들웨어 그룹에 속한 모든 미들웨어가 이 라우트에도 적용됩니다. 필요하다면 여기에 추가 미들웨어를 붙일 수도 있습니다.

```
Route::fallback(function () {
    // ...
});
```

<a name="rate-limiting"></a>
## 속도 제한(Rate Limiting)

<a name="defining-rate-limiters"></a>
### 속도 제한기 정의

라라벨에는 지정한 라우트나 라우트 그룹에 트래픽 제한을 걸기 위한 강력하고 다양한 속도 제한(rate limiting) 서비스가 내장되어 있습니다. 먼저, 애플리케이션에 맞는 속도 제한 구성(rate limiter configuration)을 정의해야 합니다.

속도 제한기는 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 정의할 수 있습니다.

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

속도 제한기는 `RateLimiter` 퍼사드의 `for` 메서드로 정의합니다. 이 메서드는 제한기 이름과, 적용할 제한 설정을 반환하는 클로저를 받습니다. 제한 설정은 `Illuminate\Cache\RateLimiting\Limit` 클래스의 인스턴스여야 하며, 이 클래스에는 제한을 쉽게 정의할 수 있는 여러 "빌더" 메서드가 있습니다. 제한기 이름은 원하는 아무 문자열이나 쓸 수 있습니다.

```
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

요청이 지정된 속도 제한을 초과할 경우, 라라벨은 자동으로 429 HTTP 상태 코드와 함께 응답을 반환합니다. 만약 속도 제한을 초과했을 때 사용자 정의 응답을 반환하고 싶다면 `response` 메서드를 사용할 수 있습니다.

```
RateLimiter::for('global', function (Request $request) {
    return Limit::perMinute(1000)->response(function (Request $request, array $headers) {
        return response('Custom response...', 429, $headers);
    });
});
```

속도 제한기 콜백에서는 들어오는 HTTP 요청 인스턴스를 받을 수 있으므로, 요청이나 인증 사용자 상태에 따라 동적으로 제한을 구현할 수도 있습니다.

```
RateLimiter::for('uploads', function (Request $request) {
    return $request->user()->vipCustomer()
        ? Limit::none()
        : Limit::perMinute(100);
});
```

<a name="segmenting-rate-limits"></a>
#### 세분화된(분할) 속도 제한

경우에 따라 임의의 값을 기준으로 속도 제한을 분할하고 싶을 수 있습니다. 예를 들어, 특정 라우트에 대해 IP 주소별로 분당 100회의 접근만 허용하려 할 때는 `by` 메서드를 사용해 구현할 수 있습니다.

```
RateLimiter::for('uploads', function (Request $request) {
    return $request->user()->vipCustomer()
        ? Limit::none()
        : Limit::perMinute(100)->by($request->ip());
});
```

또 다른 예시로, 인증 사용자는 분당 100회, 비로그인(게스트)은 IP 주소별로 분당 10회로 제한할 수도 있습니다.

```
RateLimiter::for('uploads', function (Request $request) {
    return $request->user()
        ? Limit::perMinute(100)->by($request->user()->id)
        : Limit::perMinute(10)->by($request->ip());
});
```

<a name="multiple-rate-limits"></a>
#### 복수의 속도 제한

필요하다면 하나의 속도 제한기 구성에 대해 여러 개의 제한을 배열로 반환할 수도 있습니다. 이 경우 배열에 정의된 순서대로 각각의 제한이 라우트에 적용됩니다.

```
RateLimiter::for('login', function (Request $request) {
    return [
        Limit::perMinute(500),
        Limit::perMinute(3)->by($request->input('email')),
    ];
});
```

동일한 `by` 값으로 분할된 복수의 제한을 사용할 경우, 각 `by` 값이 고유해야 합니다. 가장 쉬운 방법은 `by` 메서드에 전달하는 값에 접두어를 붙이는 것입니다.

```
RateLimiter::for('uploads', function (Request $request) {
    return [
        Limit::perMinute(10)->by('minute:'.$request->user()->id),
        Limit::perDay(1000)->by('day:'.$request->user()->id),
    ];
});
```

<a name="attaching-rate-limiters-to-routes"></a>
### 속도 제한기 라우트에 지정하기

속도 제한기는 `throttle` [미들웨어](/docs/11.x/middleware)를 사용해 라우트 또는 라우트 그룹에 지정할 수 있습니다. `throttle` 미들웨어는 제한기를 지정하는 이름을 인자로 받습니다.

```
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
#### Redis를 이용한 Throttle 구현

기본적으로 `throttle` 미들웨어는 `Illuminate\Routing\Middleware\ThrottleRequests` 클래스에 매핑되어 있습니다. 하지만 애플리케이션의 캐시 드라이버로 Redis를 사용하고 있다면, 라라벨이 Redis를 이용한 속도 제한 관리를 하도록 지정할 수 있습니다. 이때는 애플리케이션의 `bootstrap/app.php` 파일에서 `throttleWithRedis` 메서드를 사용해야 합니다. 이 메서드는 `throttle` 미들웨어를 `Illuminate\Routing\Middleware\ThrottleRequestsWithRedis` 미들웨어 클래스로 매핑합니다.

```
->withMiddleware(function (Middleware $middleware) {
    $middleware->throttleWithRedis();
    // ...
})
```

<a name="form-method-spoofing"></a>
## 폼 메서드 스푸핑(Form Method Spoofing)

HTML 폼은 `PUT`, `PATCH`, `DELETE` 등의 HTTP 메서드를 직접 지원하지 않습니다. 따라서 HTML 폼에서 `PUT`, `PATCH`, `DELETE` 라우트를 호출하려면 폼 안에 숨겨진 `_method` 필드를 추가해야 합니다. 실제 요청 시 `_method` 필드에 입력된 값이 HTTP 요청 메서드로 사용됩니다.

```
<form action="/example" method="POST">
    <input type="hidden" name="_method" value="PUT">
    <input type="hidden" name="_token" value="{{ csrf_token() }}">
</form>
```

더 간편하게는 `@method` [Blade 디렉티브](/docs/11.x/blade)를 사용해 `_method` 입력 필드를 자동으로 생성할 수 있습니다.

```
<form action="/example" method="POST">
    @method('PUT')
    @csrf
</form>
```

<a name="accessing-the-current-route"></a>
## 현재 라우트 정보 접근

`Route` 퍼사드의 `current`, `currentRouteName`, `currentRouteAction` 메서드를 사용해, 현재 요청을 처리하는 라우트에 대한 정보를 얻을 수 있습니다.

```
use Illuminate\Support\Facades\Route;

$route = Route::current(); // Illuminate\Routing\Route
$name = Route::currentRouteName(); // string
$action = Route::currentRouteAction(); // string
```

라우터와 라우트 클래스에서 사용 가능한 모든 메서드는 각각 [Route 퍼사드의 기본 클래스 API 문서](https://laravel.com/api/11.x/Illuminate/Routing/Router.html) 및 [Route 인스턴스 API 문서](https://laravel.com/api/11.x/Illuminate/Routing/Route.html)를 참고하시면 됩니다.

<a name="cors"></a>
## 교차 출처 리소스 공유(CORS)

라라벨은 CORS `OPTIONS` HTTP 요청에 대해 설정값에 따라 자동으로 응답할 수 있습니다. 이러한 `OPTIONS` 요청은, 애플리케이션의 글로벌 미들웨어 스택에 포함된 `HandleCors` [미들웨어](/docs/11.x/middleware)에 의해 자동으로 처리됩니다.

애플리케이션의 CORS 설정값을 직접 커스터마이즈해야 할 때가 있습니다. 이럴 땐 `config:publish` Artisan 명령어로 `cors` 설정 파일을 배포하십시오.

```shell
php artisan config:publish cors
```

이 명령어를 실행하면 애플리케이션의 `config` 디렉터리에 `cors.php` 설정 파일이 생성됩니다.

> [!NOTE]  
> CORS 및 CORS 헤더에 대한 자세한 정보는 [MDN 웹 문서의 CORS 가이드](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#The_HTTP_response_headers)를 참고하세요.

<a name="route-caching"></a>
## 라우트 캐싱

애플리케이션을 배포할 때는 라라벨의 라우트 캐시(route cache) 기능을 적극적으로 사용하는 것이 좋습니다. 라우트 캐시를 사용하면, 전체 라우트 등록 시간이 비약적으로 단축됩니다. 라우트 캐시를 생성하려면, `route:cache` Artisan 명령어를 실행하세요.

```shell
php artisan route:cache
```

명령어를 실행한 후에는, 매 요청마다 캐시된 라우트 파일이 로드됩니다. 라우트를 새로 추가하거나 변경했을 경우, 반드시 새롭게 라우트 캐시를 다시 생성해야 한다는 점에 유의하세요. 이러한 이유로, 보통 프로젝트를 배포할 때만 `route:cache` 명령어를 실행합니다.

라우트 캐시는 `route:clear` 명령어로 삭제할 수 있습니다.

```shell
php artisan route:clear
```