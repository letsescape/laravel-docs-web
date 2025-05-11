# 미들웨어 (Middleware)

- [소개](#introduction)
- [미들웨어 정의하기](#defining-middleware)
- [미들웨어 등록하기](#registering-middleware)
    - [글로벌 미들웨어](#global-middleware)
    - [미들웨어를 라우트에 할당하기](#assigning-middleware-to-routes)
    - [미들웨어 그룹](#middleware-groups)
    - [미들웨어 별칭](#middleware-aliases)
    - [미들웨어 정렬](#sorting-middleware)
- [미들웨어 파라미터](#middleware-parameters)
- [Terminate 가능한 미들웨어](#terminable-middleware)

<a name="introduction"></a>
## 소개

미들웨어는 애플리케이션에 들어오는 HTTP 요청을 검사하고 필터링할 수 있는 편리한 방법을 제공합니다. 예를 들어, 라라벨에는 애플리케이션의 사용자가 인증되었는지 확인하는 미들웨어가 포함되어 있습니다. 만약 사용자가 인증되지 않은 경우, 해당 미들웨어는 사용자를 애플리케이션의 로그인 화면으로 리다이렉트합니다. 반면, 사용자가 인증되었다면 미들웨어는 요청이 애플리케이션 내부로 더 진행될 수 있도록 허용합니다.

인증 이외에도 미들웨어를 직접 작성하여 다양한 작업을 수행할 수 있습니다. 예를 들어, 로깅 미들웨어는 애플리케이션에 들어오는 모든 요청을 기록할 수 있습니다. 라라벨에는 인증 및 CSRF 보호를 위한 미들웨어 등 여러 가지 내장 미들웨어가 포함되어 있지만, 사용자가 직접 정의하는 미들웨어는 보통 애플리케이션의 `app/Http/Middleware` 디렉터리에 위치합니다.

<a name="defining-middleware"></a>
## 미들웨어 정의하기

새로운 미들웨어를 생성하려면 `make:middleware` Artisan 명령어를 사용합니다.

```shell
php artisan make:middleware EnsureTokenIsValid
```

이 명령어를 실행하면 `app/Http/Middleware` 디렉터리 내에 새로운 `EnsureTokenIsValid` 클래스를 생성합니다. 이 미들웨어에서는, 전달받은 `token` 입력값이 지정한 값과 일치할 때만 해당 라우트 접근을 허용하고, 그렇지 않다면 사용자를 `/home` URI로 리다이렉트합니다.

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

위 코드에서 볼 수 있듯이, 전달된 `token`이 우리의 시크릿 토큰과 일치하지 않으면 미들웨어는 클라이언트에게 HTTP 리다이렉트를 반환합니다. 반면 일치한다면 요청이 애플리케이션 내부로 더 전달됩니다. 요청을 더 깊이 전달하여(즉, 미들웨어가 "패스(pass)"되도록) 하려면 `$next` 콜백에 `$request`를 전달하면 됩니다.

미들웨어는 애플리케이션에 도달하기 전에 HTTP 요청이 반드시 통과해야 하는 일련의 "레이어(계층)"로 상상하는 것이 좋습니다. 각 레이어는 요청을 검사하고 요청을 완전히 거부할 수도 있습니다.

> [!NOTE]
> 모든 미들웨어는 [서비스 컨테이너](/docs/container)를 통해 resolve되므로, 미들웨어의 생성자에서 필요한 모든 의존성을 타입힌트로 선언할 수 있습니다.

<a name="middleware-and-responses"></a>
#### 미들웨어와 응답

물론, 미들웨어는 요청을 애플리케이션 깊숙이 전달하기 **전**이나 **후**에 작업을 수행할 수 있습니다. 예를 들어, 아래의 미들웨어는 요청이 애플리케이션에 의해 처리되기 **전**에 어떤 작업을 수행합니다.

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
        // Perform action

        return $next($request);
    }
}
```

반면, 아래의 미들웨어는 요청이 애플리케이션에 의해 처리된 **후**에 작업을 수행합니다.

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

        // Perform action

        return $response;
    }
}
```

<a name="registering-middleware"></a>
## 미들웨어 등록하기

<a name="global-middleware"></a>
### 글로벌 미들웨어

모든 HTTP 요청에 대해 항상 실행되는 미들웨어가 필요하다면, 애플리케이션의 `bootstrap/app.php` 파일에서 글로벌 미들웨어 스택에 이를 추가할 수 있습니다.

```php
use App\Http\Middleware\EnsureTokenIsValid;

->withMiddleware(function (Middleware $middleware) {
     $middleware->append(EnsureTokenIsValid::class);
})
```

`withMiddleware` 클로저에 제공되는 `$middleware` 객체는 `Illuminate\Foundation\Configuration\Middleware`의 인스턴스로, 애플리케이션 라우트에 할당된 미들웨어를 관리하는 역할을 합니다. `append` 메서드를 사용하면 전역 미들웨어 리스트의 끝 부분에 미들웨어를 추가할 수 있습니다. 만약 리스트의 앞부분에 추가하고 싶다면 `prepend` 메서드를 사용하면 됩니다.

<a name="manually-managing-laravels-default-global-middleware"></a>
#### 라라벨 기본 글로벌 미들웨어 직접 관리하기

라라벨의 글로벌 미들웨어 스택을 직접 관리하고 싶다면, `use` 메서드에 라라벨의 기본 전역 미들웨어 스택을 직접 명시할 수 있습니다. 이렇게 하면 필요한 대로 기본 미들웨어 스택을 조정할 수 있습니다.

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

특정 라우트에 미들웨어를 할당하고 싶다면, 라우트를 정의할 때 `middleware` 메서드를 사용할 수 있습니다.

```php
use App\Http\Middleware\EnsureTokenIsValid;

Route::get('/profile', function () {
    // ...
})->middleware(EnsureTokenIsValid::class);
```

여러 개의 미들웨어를 한 라우트에 동시에 할당하려면, `middleware` 메서드에 미들웨어 이름의 배열을 전달하면 됩니다.

```php
Route::get('/', function () {
    // ...
})->middleware([First::class, Second::class]);
```

<a name="excluding-middleware"></a>
#### 미들웨어 제외하기

여러 라우트가 속한 그룹에 미들웨어를 할당할 때, 특정 라우트에는 미들웨어를 적용하지 않을 수 있습니다. 이럴 때는 `withoutMiddleware` 메서드를 사용하면 됩니다.

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

특정 미들웨어를 라우트 그룹 전체에서 제외할 수도 있습니다.

```php
use App\Http\Middleware\EnsureTokenIsValid;

Route::withoutMiddleware([EnsureTokenIsValid::class])->group(function () {
    Route::get('/profile', function () {
        // ...
    });
});
```

`withoutMiddleware` 메서드는 오직 라우트 미들웨어만 제거할 수 있으며, [글로벌 미들웨어](#global-middleware)에는 적용되지 않습니다.

<a name="middleware-groups"></a>
### 미들웨어 그룹

여러 미들웨어를 하나의 키로 묶어 보다 편리하게 라우트에 할당하고 싶을 때가 있습니다. 이럴 때는 애플리케이션의 `bootstrap/app.php` 파일에서 `appendToGroup` 메서드를 사용하여 미들웨어 그룹을 만들 수 있습니다.

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

미들웨어 그룹은 개별 미들웨어와 동일한 방식으로 라우트나 컨트롤러 액션에 할당할 수 있습니다.

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

라라벨은 자주 사용되는 미들웨어가 미리 모여 있는 `web` 및 `api` 미들웨어 그룹을 내장하고 있습니다. 라라벨은 이 미들웨어 그룹들을 각각 `routes/web.php`와 `routes/api.php`에 자동으로 적용합니다.

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

이들 그룹에 미들웨어를 추가(append)하거나 앞에 추가(prepend)하고 싶다면, `bootstrap/app.php` 파일 안에서 `web`, `api` 메서드를 사용할 수 있습니다. 이 메서드들은 `appendToGroup` 메서드의 편의 기능입니다.

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

기본 미들웨어 그룹 내의 항목을 여러분만의 커스텀 미들웨어로 대체(replace)할 수도 있습니다.

```php
use App\Http\Middleware\StartCustomSession;
use Illuminate\Session\Middleware\StartSession;

$middleware->web(replace: [
    StartSession::class => StartCustomSession::class,
]);
```

또는 특정 미들웨어를 그룹에서 완전히 제거할 수도 있습니다.

```php
$middleware->web(remove: [
    StartSession::class,
]);
```

<a name="manually-managing-laravels-default-middleware-groups"></a>
#### 라라벨의 기본 미들웨어 그룹 직접 관리하기

라라벨의 기본 `web`, `api` 미들웨어 그룹 내 모든 미들웨어를 직접 관리하고 싶다면, 해당 그룹을 재정의하여 원하는 대로 커스터마이징할 수 있습니다. 아래 예시는 기본 미들웨어 그룹을 정의하여 필요에 맞게 수정하는 방법입니다.

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
> 기본적으로 `web`과 `api` 미들웨어 그룹은 `bootstrap/app.php` 파일에 의해 각각 애플리케이션의 `routes/web.php`, `routes/api.php`에 자동으로 적용됩니다.

<a name="middleware-aliases"></a>
### 미들웨어 별칭

애플리케이션의 `bootstrap/app.php` 파일에서 미들웨어별 별칭(alias)을 설정할 수 있습니다. 미들웨어 별칭을 활용하면 긴 클래스명을 짧은 식별자로 대체하여 사용할 수 있어, 특히 긴 클래스명을 가진 미들웨어를 사용할 때 유용합니다.

```php
use App\Http\Middleware\EnsureUserIsSubscribed;

->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'subscribed' => EnsureUserIsSubscribed::class
    ]);
})
```

애플리케이션의 `bootstrap/app.php` 파일에서 별칭이 정의되면, 해당 별칭으로 라우트에 미들웨어를 할당할 수 있습니다.

```php
Route::get('/profile', function () {
    // ...
})->middleware('subscribed');
```

일부 라라벨 기본 미들웨어는 편의상 기본 별칭이 이미 지정되어 있습니다. 예를 들어, `auth` 미들웨어 별칭은 `Illuminate\Auth\Middleware\Authenticate` 미들웨어에 대해 설정되어 있습니다. 아래는 기본 미들웨어 별칭 목록입니다.

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

특별한 경우, 미들웨어가 실행되는 순서를 제어할 수 없는 상황에서 특정 순서로 실행되도록 해야 할 수도 있습니다. 이럴 때는 애플리케이션의 `bootstrap/app.php` 파일에서 `priority` 메서드를 이용해 미들웨어 우선순위를 지정할 수 있습니다.

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
## 미들웨어 파라미터

미들웨어는 추가적인 파라미터를 받을 수도 있습니다. 예를 들어, 애플리케이션에서 "역할(role)"을 확인해 특정 작업이 가능하도록 하려면, 역할 이름을 추가 인수로 받을 수 있는 `EnsureUserHasRole` 미들웨어를 만들 수 있습니다.

추가적인 미들웨어 파라미터들은 `$next` 인수 뒤에 순서대로 전달됩니다.

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
            // Redirect...
        }

        return $next($request);
    }
}
```

미들웨어를 라우트에 할당할 때에는, 미들웨어 이름과 파라미터를 `:`로 구분해 명시하면 됩니다.

```php
use App\Http\Middleware\EnsureUserHasRole;

Route::put('/post/{id}', function (string $id) {
    // ...
})->middleware(EnsureUserHasRole::class.':editor');
```

여러 파라미터가 필요하다면, 쉼표로 각각 구분하면 됩니다.

```php
Route::put('/post/{id}', function (string $id) {
    // ...
})->middleware(EnsureUserHasRole::class.':editor,publisher');
```

<a name="terminable-middleware"></a>
## Terminate 가능한 미들웨어

때때로 미들웨어가 HTTP 응답이 브라우저로 전송된 후에도 추가적인 작업을 수행해야 하는 경우가 있습니다. 만약 미들웨어에 `terminate` 메서드를 정의하고, 웹서버가 FastCGI를 사용 중이라면, 응답이 브라우저에 전송된 이후 자동으로 `terminate` 메서드가 호출됩니다.

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

`terminate` 메서드는 요청과 응답을 모두 인수로 받아야 합니다. terminate 가능한 미들웨어를 만들었다면, 이를 애플리케이션의 전역 혹은 개별 라우트 미들웨어에 추가하면 됩니다.

라라벨이 미들웨어의 `terminate` 메서드를 호출할 때는 [서비스 컨테이너](/docs/container)를 이용해 새로운 미들웨어 인스턴스를 resolve합니다. 만약 `handle`과 `terminate`가 동일한 미들웨어 인스턴스에서 호출되길 원한다면, 컨테이너의 `singleton` 메서드를 사용해 미들웨어를 등록해야 합니다. 일반적으로 이는 `AppServiceProvider`의 `register` 메서드에서 처리합니다.

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