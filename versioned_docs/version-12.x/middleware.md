# 미들웨어 (Middleware)

- [소개](#introduction)
- [미들웨어 정의하기](#defining-middleware)
- [미들웨어 등록하기](#registering-middleware)
    - [전역 미들웨어](#global-middleware)
    - [미들웨어를 라우트에 할당하기](#assigning-middleware-to-routes)
    - [미들웨어 그룹](#middleware-groups)
    - [미들웨어 별칭](#middleware-aliases)
    - [미들웨어 정렬](#sorting-middleware)
- [미들웨어 매개변수](#middleware-parameters)
- [종결형(Terminable) 미들웨어](#terminable-middleware)

<a name="introduction"></a>
## 소개

미들웨어는 애플리케이션에 들어오는 HTTP 요청을 검사하고 필터링할 수 있는 편리한 메커니즘을 제공합니다. 예를 들어, 라라벨은 사용자가 인증되었는지 확인하는 미들웨어를 기본으로 제공합니다. 사용자가 인증되어 있지 않다면, 미들웨어는 사용자를 애플리케이션의 로그인 화면으로 리다이렉트합니다. 반대로, 사용자가 인증되어 있다면 요청은 애플리케이션 내부로 정상적으로 전달됩니다.

이 외에도 인증과 무관하게 다양한 작업을 수행하는 미들웨어를 직접 작성할 수 있습니다. 예를 들어, 모든 들어오는 요청을 로그로 남기는 로깅 미들웨어를 만들 수도 있습니다. 라라벨에는 인증이나 CSRF 보호 등 여러 종류의 미들웨어가 기본 포함되어 있지만, 여러분이 직접 만든 사용자 정의 미들웨어는 보통 애플리케이션의 `app/Http/Middleware` 디렉터리에 위치합니다.

<a name="defining-middleware"></a>
## 미들웨어 정의하기

새로운 미들웨어를 생성하려면, `make:middleware` 아티즌 명령어를 사용합니다.

```shell
php artisan make:middleware EnsureTokenIsValid
```

이 명령어를 실행하면 `app/Http/Middleware` 디렉터리에 새로운 `EnsureTokenIsValid` 클래스가 생성됩니다. 아래 예제에서는 제공된 `token` 입력값이 지정한 값과 일치할 때만 해당 라우트에 접근을 허용하며, 그렇지 않으면 사용자를 `/home` URI로 리다이렉트합니다.

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTokenIsValid
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->input('token') !== 'my-secret-token') {
            return redirect('/home');
        }

        return $next($request);
    }
}
```

위 예시에서 볼 수 있듯이, 만약 전달된 `token` 값이 비밀 토큰과 일치하지 않으면 클라이언트에 HTTP 리다이렉트를 반환합니다. 그렇지 않으면 요청이 애플리케이션 내부로 더 깊이 전달됩니다. 미들웨어가 "통과"하도록 하려면 `$next` 콜백에 `$request`를 전달하여야 합니다.

미들웨어는 HTTP 요청이 애플리케이션에 도달하기 전에 반드시 통과해야 하는 여러 "레이어"라고 생각하면 이해하기 쉽습니다. 각 레이어에서는 요청을 검사하고, 필요하다면 요청을 완전히 거부할 수도 있습니다.

> [!NOTE]
> 모든 미들웨어는 [서비스 컨테이너](/docs/12.x/container)를 통해 resolve되므로, 미들웨어의 생성자에서 필요한 의존성을 타입 힌트로 주입할 수 있습니다.

<a name="middleware-and-responses"></a>
#### 미들웨어와 응답

물론, 미들웨어는 요청을 더 깊게 전달하기 전이나 후에 모두 작업을 수행할 수 있습니다. 예를 들어, 다음처럼 작성하면 애플리케이션이 해당 요청을 처리하기 **이전**에 어떤 작업을 수행할 수 있습니다.

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class BeforeMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        // 작업 수행

        return $next($request);
    }
}
```

반면, 아래와 같이 작성하면, 애플리케이션에서 요청을 처리한 **이후**에 작업을 수행합니다.

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AfterMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // 작업 수행

        return $response;
    }
}
```

<a name="registering-middleware"></a>
## 미들웨어 등록하기

<a name="global-middleware"></a>
### 전역 미들웨어

모든 HTTP 요청에서 항상 실행되는 미들웨어를 만들고 싶다면, 애플리케이션의 `bootstrap/app.php` 파일 내 전역 미들웨어 스택에 해당 미들웨어를 추가하면 됩니다.

```php
use App\Http\Middleware\EnsureTokenIsValid;

->withMiddleware(function (Middleware $middleware) {
     $middleware->append(EnsureTokenIsValid::class);
})
```

`withMiddleware` 클로저에 전달되는 `$middleware` 객체는 `Illuminate\Foundation\Configuration\Middleware`의 인스턴스이며, 애플리케이션 라우트에 등록된 미들웨어들을 관리합니다. `append` 메서드는 해당 미들웨어를 전역 미들웨어 목록의 마지막에 추가합니다. 만약 리스트의 맨 앞에 추가하고 싶다면 `prepend` 메서드를 사용하세요.

<a name="manually-managing-laravels-default-global-middleware"></a>
#### 라라벨의 기본 전역 미들웨어 직접 관리하기

라라벨의 전역 미들웨어 스택을 직접 관리하고 싶다면, `use` 메서드를 통해 라라벨의 기본 전역 미들웨어 목록을 지정하여 원하는 대로 조정할 수 있습니다.

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->use([
        \Illuminate\Foundation\Http\Middleware\InvokeDeferredCallbacks::class,
        // \Illuminate\Http\Middleware\TrustHosts::class,
        \Illuminate\Http\Middleware\TrustProxies::class,
        \Illuminate\Http\Middleware\HandleCors::class,
        \Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance::class,
        \Illuminate\Http\Middleware\ValidatePostSize::class,
        \Illuminate\Foundation\Http\Middleware\TrimStrings::class,
        \Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull::class,
    ]);
})
```

<a name="assigning-middleware-to-routes"></a>
### 미들웨어를 라우트에 할당하기

특정 라우트에 미들웨어를 적용하고 싶다면, 해당 라우트를 정의할 때 `middleware` 메서드를 사용합니다.

```php
use App\Http\Middleware\EnsureTokenIsValid;

Route::get('/profile', function () {
    // ...
})->middleware(EnsureTokenIsValid::class);
```

여러 개의 미들웨어를 동시에 할당할 경우, 미들웨어 이름의 배열을 `middleware` 메서드에 전달하면 됩니다.

```php
Route::get('/', function () {
    // ...
})->middleware([First::class, Second::class]);
```

<a name="excluding-middleware"></a>
#### 미들웨어 제외하기

라우트 그룹에 미들웨어를 할당했더라도, 그룹 내 일부 라우트에서는 특정 미들웨어 적용을 제외하고 싶을 수 있습니다. 이때는 `withoutMiddleware` 메서드를 활용할 수 있습니다.

```php
use App\Http\Middleware\EnsureTokenIsValid;

Route::middleware([EnsureTokenIsValid::class])->group(function () {
    Route::get('/', function () {
        // ...
    });

    Route::get('/profile', function () {
        // ...
    })->withoutMiddleware([EnsureTokenIsValid::class]);
});
```

특정 미들웨어를 라우트 그룹 전체에서 제거할 수도 있습니다.

```php
use App\Http\Middleware\EnsureTokenIsValid;

Route::withoutMiddleware([EnsureTokenIsValid::class])->group(function () {
    Route::get('/profile', function () {
        // ...
    });
});
```

`withoutMiddleware` 메서드는 라우트 미들웨어만 제거할 수 있으며, [전역 미들웨어](#global-middleware)에는 영향을 주지 않습니다.

<a name="middleware-groups"></a>
### 미들웨어 그룹

여러 개의 미들웨어를 하나의 키로 묶어서 라우트에 쉽게 할당하고 싶을 때도 있습니다. 이럴 땐 애플리케이션의 `bootstrap/app.php` 파일에서 `appendToGroup` 메서드를 통해 미들웨어 그룹을 만들 수 있습니다.

```php
use App\Http\Middleware\First;
use App\Http\Middleware\Second;

->withMiddleware(function (Middleware $middleware) {
    $middleware->appendToGroup('group-name', [
        First::class,
        Second::class,
    ]);

    $middleware->prependToGroup('group-name', [
        First::class,
        Second::class,
    ]);
})
```

미들웨어 그룹은 개별 미들웨어와 동일한 방식으로 라우트 및 컨트롤러 액션에 할당할 수 있습니다.

```php
Route::get('/', function () {
    // ...
})->middleware('group-name');

Route::middleware(['group-name'])->group(function () {
    // ...
});
```

<a name="laravels-default-middleware-groups"></a>
#### 라라벨의 기본 미들웨어 그룹

라라벨에는 `web`과 `api`라는 미리 정의된 미들웨어 그룹이 포함되어 있습니다. 이 그룹들은 웹과 API 라우트에 일반적으로 사용되는 미들웨어를 모아둔 것으로, 라라벨은 각각 `routes/web.php`와 `routes/api.php` 파일에 이들 그룹을 자동으로 적용합니다.

<div class="overflow-auto">

| `web` 미들웨어 그룹 |
| --- |
| `Illuminate\Cookie\Middleware\EncryptCookies` |
| `Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse` |
| `Illuminate\Session\Middleware\StartSession` |
| `Illuminate\View\Middleware\ShareErrorsFromSession` |
| `Illuminate\Foundation\Http\Middleware\ValidateCsrfToken` |
| `Illuminate\Routing\Middleware\SubstituteBindings` |

</div>

<div class="overflow-auto">

| `api` 미들웨어 그룹 |
| --- |
| `Illuminate\Routing\Middleware\SubstituteBindings` |

</div>

이 그룹들에 미들웨어를 추가하거나 앞에 붙이고 싶다면, `bootstrap/app.php` 파일에서 `web`, `api` 메서드를 사용할 수 있습니다. 이 메서드들은 `appendToGroup`을 사용하는 것보다 더 간단한 방법을 제공합니다.

```php
use App\Http\Middleware\EnsureTokenIsValid;
use App\Http\Middleware\EnsureUserIsSubscribed;

->withMiddleware(function (Middleware $middleware) {
    $middleware->web(append: [
        EnsureUserIsSubscribed::class,
    ]);

    $middleware->api(prepend: [
        EnsureTokenIsValid::class,
    ]);
})
```

라라벨의 기본 미들웨어 그룹 내 특정 항목을 사용자 정의 미들웨어로 교체할 수도 있습니다.

```php
use App\Http\Middleware\StartCustomSession;
use Illuminate\Session\Middleware\StartSession;

$middleware->web(replace: [
    StartSession::class => StartCustomSession::class,
]);
```

또는, 미들웨어를 완전히 제거할 수도 있습니다.

```php
$middleware->web(remove: [
    StartSession::class,
]);
```

<a name="manually-managing-laravels-default-middleware-groups"></a>
#### 라라벨의 기본 미들웨어 그룹 직접 관리하기

라라벨의 기본 `web` 및 `api` 미들웨어 그룹을 직접 모든 항목까지 완전히 관리하고 싶다면, 아래와 같이 그룹을 재정의하면 됩니다. 예제에서는 각 그룹에 기본값과 함께 원하는 대로 커스터마이징할 수 있도록 설정합니다.

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->group('web', [
        \Illuminate\Cookie\Middleware\EncryptCookies::class,
        \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
        \Illuminate\Session\Middleware\StartSession::class,
        \Illuminate\View\Middleware\ShareErrorsFromSession::class,
        \Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
        // \Illuminate\Session\Middleware\AuthenticateSession::class,
    ]);

    $middleware->group('api', [
        // \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        // 'throttle:api',
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
    ]);
})
```

> [!NOTE]
> 기본적으로 `web`과 `api` 미들웨어 그룹은 `bootstrap/app.php` 파일을 통해 애플리케이션의 해당 라우트 파일(`routes/web.php`, `routes/api.php`)에 자동으로 적용됩니다.

<a name="middleware-aliases"></a>
### 미들웨어 별칭

애플리케이션의 `bootstrap/app.php` 파일에서 미들웨어에 별칭(알리아스)을 지정할 수 있습니다. 별칭을 사용하면 클래스명이 길거나 복잡한 미들웨어에 짧은 이름을 부여해 라우트에 쉽게 할당할 수 있습니다.

```php
use App\Http\Middleware\EnsureUserIsSubscribed;

->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'subscribed' => EnsureUserIsSubscribed::class
    ]);
})
```

별칭을 등록한 후, 라우트에 미들웨어를 할당할 때 이 별칭을 사용할 수 있습니다.

```php
Route::get('/profile', function () {
    // ...
})->middleware('subscribed');
```

편의를 위해 라라벨에서 기본적으로 별칭이 할당되어 있는 내장 미들웨어도 있습니다. 예를 들어, `auth` 미들웨어는 `Illuminate\Auth\Middleware\Authenticate` 미들웨어의 별칭입니다. 기본 별칭 목록은 다음 표와 같습니다.

<div class="overflow-auto">

| 별칭 | 미들웨어 |
| --- | --- |
| `auth` | `Illuminate\Auth\Middleware\Authenticate` |
| `auth.basic` | `Illuminate\Auth\Middleware\AuthenticateWithBasicAuth` |
| `auth.session` | `Illuminate\Session\Middleware\AuthenticateSession` |
| `cache.headers` | `Illuminate\Http\Middleware\SetCacheHeaders` |
| `can` | `Illuminate\Auth\Middleware\Authorize` |
| `guest` | `Illuminate\Auth\Middleware\RedirectIfAuthenticated` |
| `password.confirm` | `Illuminate\Auth\Middleware\RequirePassword` |
| `precognitive` | `Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests` |
| `signed` | `Illuminate\Routing\Middleware\ValidateSignature` |
| `subscribed` | `\Spark\Http\Middleware\VerifyBillableIsSubscribed` |
| `throttle` | `Illuminate\Routing\Middleware\ThrottleRequests` 또는 `Illuminate\Routing\Middleware\ThrottleRequestsWithRedis` |
| `verified` | `Illuminate\Auth\Middleware\EnsureEmailIsVerified` |

</div>

<a name="sorting-middleware"></a>
### 미들웨어 정렬

드물긴 하지만, 미들웨어를 라우트에 할당할 때 그 실행 순서를 직접 제어할 수 없는 경우가 있습니다. 이런 경우, 애플리케이션의 `bootstrap/app.php` 파일에서 `priority` 메서드를 사용하여 원하는 미들웨어 우선순위를 직접 지정할 수 있습니다.

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->priority([
        \Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests::class,
        \Illuminate\Cookie\Middleware\EncryptCookies::class,
        \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
        \Illuminate\Session\Middleware\StartSession::class,
        \Illuminate\View\Middleware\ShareErrorsFromSession::class,
        \Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,
        \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        \Illuminate\Routing\Middleware\ThrottleRequests::class,
        \Illuminate\Routing\Middleware\ThrottleRequestsWithRedis::class,
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
        \Illuminate\Contracts\Auth\Middleware\AuthenticatesRequests::class,
        \Illuminate\Auth\Middleware\Authorize::class,
    ]);
})
```

<a name="middleware-parameters"></a>
## 미들웨어 매개변수

미들웨어는 추가적인 매개변수도 받을 수 있습니다. 예를 들어, 인증된 사용자가 특정 "역할(role)"을 갖고 있는지 확인해야 한다면, 역할 이름을 추가 인수로 받는 `EnsureUserHasRole` 미들웨어를 만들 수 있습니다.

추가 미들웨어 매개변수는 `$next` 매개변수 다음에 전달됩니다.

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (! $request->user()->hasRole($role)) {
            // 리다이렉트 등 처리...
        }

        return $next($request);
    }
}
```

라우트 정의 시, 미들웨어 이름과 매개변수는 `:`를 이용하여 구분해서 전달하면 됩니다.

```php
use App\Http\Middleware\EnsureUserHasRole;

Route::put('/post/{id}', function (string $id) {
    // ...
})->middleware(EnsureUserHasRole::class.':editor');
```

여러 개의 매개변수가 있다면 쉼표로 구분합니다.

```php
Route::put('/post/{id}', function (string $id) {
    // ...
})->middleware(EnsureUserHasRole::class.':editor,publisher');
```

<a name="terminable-middleware"></a>
## 종결형(Terminable) 미들웨어

때때로 미들웨어에서 HTTP 응답이 브라우저에 완전히 전송된 **후**에 추가로 작업을 수행해야 할 수도 있습니다. 이 경우, 미들웨어에 `terminate` 메서드를 정의하고, 웹 서버가 FastCGI를 사용한다면 라라벨이 응답 반환 후 자동으로 `terminate` 메서드를 호출합니다.

```php
<?php

namespace Illuminate\Session\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TerminatingMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        return $next($request);
    }

    /**
     * Handle tasks after the response has been sent to the browser.
     */
    public function terminate(Request $request, Response $response): void
    {
        // ...
    }
}
```

`terminate` 메서드는 요청 객체와 응답 객체를 모두 인자로 받아야 합니다. 종결형 미들웨어를 만들었다면, 해당 미들웨어를 라우트 또는 전역 미들웨어 목록에 반드시 등록해야 합니다.

라라벨이 미들웨어의 `terminate` 메서드를 호출할 때, [서비스 컨테이너](/docs/12.x/container)에서 새로운 미들웨어 인스턴스를 resolve합니다. 만약 `handle`과 `terminate` 메서드 호출 시 동일한 인스턴스를 사용하고 싶다면, 컨테이너의 `singleton` 메서드를 통해 미들웨어를 등록하세요. 일반적으로 이는 `AppServiceProvider`의 `register` 메서드에서 처리합니다.

```php
use App\Http\Middleware\TerminatingMiddleware;

/**
 * Register any application services.
 */
public function register(): void
{
    $this->app->singleton(TerminatingMiddleware::class);
}
```