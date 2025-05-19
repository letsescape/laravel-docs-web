# 미들웨어 (Middleware)

- [소개](#introduction)
- [미들웨어 정의하기](#defining-middleware)
- [미들웨어 등록하기](#registering-middleware)
    - [글로벌 미들웨어](#global-middleware)
    - [라우트에 미들웨어 할당하기](#assigning-middleware-to-routes)
    - [미들웨어 그룹](#middleware-groups)
    - [미들웨어 별칭](#middleware-aliases)
    - [미들웨어 실행 순서 지정](#sorting-middleware)
- [미들웨어 파라미터](#middleware-parameters)
- [종료 가능한(Terminable) 미들웨어](#terminable-middleware)

<a name="introduction"></a>
## 소개

미들웨어는 애플리케이션에 들어오는 HTTP 요청을 검사하고 필터링할 수 있도록 도와주는 편리한 기능입니다. 예를 들어, 라라벨에는 사용자가 인증되었는지 확인하는 미들웨어가 포함되어 있습니다. 사용자가 인증되지 않은 경우, 해당 미들웨어는 사용자를 애플리케이션의 로그인 화면으로 리디렉션합니다. 반대로 인증이 된 사용자의 경우에는 요청이 애플리케이션 내부로 더 진행될 수 있도록 허용합니다.

인증 외에도 다양한 작업을 수행하는 추가 미들웨어를 직접 작성할 수 있습니다. 예를 들어, 로깅 미들웨어는 애플리케이션에 들어오는 모든 요청을 기록할 수 있습니다. 라라벨에는 인증, CSRF 보호 등 다양한 미들웨어가 기본적으로 포함되어 있지만, 모든 사용자 정의 미들웨어는 일반적으로 애플리케이션의 `app/Http/Middleware` 디렉터리에 위치하게 됩니다.

<a name="defining-middleware"></a>
## 미들웨어 정의하기

새로운 미들웨어를 생성하려면, `make:middleware` 아티즌 명령어를 사용하세요.

```shell
php artisan make:middleware EnsureTokenIsValid
```

이 명령을 실행하면 `app/Http/Middleware` 디렉터리에 `EnsureTokenIsValid` 클래스가 생성됩니다. 여기서는 전달받은 `token` 입력 값이 지정한 값과 일치하는 경우에만 해당 라우트에 접근을 허용할 것입니다. 그렇지 않으면 사용자를 `/home` URI로 리디렉션합니다.

```
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

코드를 보면, 제공된 `token` 값이 우리의 비밀 토큰과 일치하지 않을 때 미들웨어가 HTTP 리디렉션을 클라이언트에 반환합니다. 일치할 경우에는 요청이 애플리케이션 내부로 더 진행됩니다. 미들웨어를 통과시키고 싶다면 `$next` 콜백에 `$request`를 전달해야 합니다.

미들웨어는 애플리케이션에 도달하기 전 HTTP 요청이 여러 "레이어"를 통과해야 하는 구조로 생각하면 이해가 쉽습니다. 각 레이어는 요청을 검사하고, 필요하다면 전체적으로 거절할 수 있습니다.

> [!NOTE]  
> 모든 미들웨어는 [서비스 컨테이너](/docs/11.x/container)를 통해 resolve되므로, 미들웨어의 생성자에 필요한 의존성을 타입힌트로 선언할 수 있습니다.

<a name="middleware-and-responses"></a>
#### 미들웨어와 응답(Response)

물론, 미들웨어는 요청이 애플리케이션 내부로 전달되기 **전**이나 **후**에 작업을 수행할 수 있습니다. 예를 들어, 아래 미들웨어는 요청이 애플리케이션에서 처리되기 **전**에 특정 작업을 수행합니다.

```
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

반면에, 아래 미들웨어는 요청이 애플리케이션에서 처리된 **후**에 작업을 수행합니다.

```
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

애플리케이션으로 들어오는 모든 HTTP 요청마다 미들웨어를 실행하고 싶다면, `bootstrap/app.php` 파일의 글로벌 미들웨어 스택에 해당 미들웨어를 추가하면 됩니다.

```
use App\Http\Middleware\EnsureTokenIsValid;

->withMiddleware(function (Middleware $middleware) {
     $middleware->append(EnsureTokenIsValid::class);
})
```

`withMiddleware` 클로저에 전달되는 `$middleware` 객체는 `Illuminate\Foundation\Configuration\Middleware` 인스턴스이며, 애플리케이션의 라우트에 할당된 미들웨어를 관리합니다. `append` 메서드는 해당 미들웨어를 글로벌 미들웨어 리스트의 **끝**에 추가합니다. 만약 리스트의 **앞**에 추가하고 싶다면, `prepend` 메서드를 사용하세요.

<a name="manually-managing-laravels-default-global-middleware"></a>
#### 라라벨 기본 글로벌 미들웨어 수동 관리

라라벨의 글로벌 미들웨어 스택을 직접 관리하고 싶다면, 기본 글로벌 미들웨어 스택을 `use` 메서드에 전달하여 필요에 따라 수정할 수 있습니다.

```
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
### 라우트에 미들웨어 할당하기

특정 라우트에만 미들웨어를 적용하고 싶다면, 라우트를 정의할 때 `middleware` 메서드를 호출하면 됩니다.

```
use App\Http\Middleware\EnsureTokenIsValid;

Route::get('/profile', function () {
    // ...
})->middleware(EnsureTokenIsValid::class);
```

여러 개의 미들웨어를 라우트에 할당하려면, 미들웨어 이름의 배열을 `middleware` 메서드에 전달하면 됩니다.

```
Route::get('/', function () {
    // ...
})->middleware([First::class, Second::class]);
```

<a name="excluding-middleware"></a>
#### 미들웨어 제외하기

여러 라우트가 하나의 그룹으로 묶여 있고 그 그룹 전체에 미들웨어가 적용되어 있는 경우, 특정 라우트만 미들웨어에서 제외하고 싶을 때가 있습니다. 이럴 때는 `withoutMiddleware` 메서드를 사용하세요.

```
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

또는 [그룹](/docs/11.x/routing#route-groups) 전체에서 지정된 미들웨어를 제외할 수도 있습니다.

```
use App\Http\Middleware\EnsureTokenIsValid;

Route::withoutMiddleware([EnsureTokenIsValid::class])->group(function () {
    Route::get('/profile', function () {
        // ...
    });
});
```

`withoutMiddleware` 메서드는 오직 라우트 미들웨어만 제거할 수 있고, [글로벌 미들웨어](#global-middleware)에는 적용되지 않습니다.

<a name="middleware-groups"></a>
### 미들웨어 그룹

여러 미들웨어를 하나의 키 이름 아래로 묶어서 라우트에 쉽게 할당하고 싶을 때가 있습니다. 이럴 때는 `bootstrap/app.php` 파일 내에서 `appendToGroup` 메서드를 사용해 미들웨어 그룹을 생성하세요.

```
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

```
Route::get('/', function () {
    // ...
})->middleware('group-name');

Route::middleware(['group-name'])->group(function () {
    // ...
});
```

<a name="laravels-default-middleware-groups"></a>
#### 라라벨 기본 미들웨어 그룹

라라벨에서는 웹과 API 라우트에 자주 사용되는 미들웨어를 미리 묶어둔 `web` 및 `api` 그룹을 제공합니다. 이 미들웨어 그룹들은 라라벨이 자동으로 `routes/web.php`와 `routes/api.php` 파일에 적용합니다.

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

이 그룹에 미들웨어를 추가하거나 앞에 삽입하고 싶다면, `bootstrap/app.php` 에서 `web` 및 `api` 메서드를 활용할 수 있습니다. 이 메서드는 `appendToGroup` 메서드의 간편한 대안입니다.

```
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

라라벨이 기본적으로 제공하는 미들웨어 그룹 엔트리를 커스텀 미들웨어로 교체할 수도 있습니다.

```
use App\Http\Middleware\StartCustomSession;
use Illuminate\Session\Middleware\StartSession;

$middleware->web(replace: [
    StartSession::class => StartCustomSession::class,
]);
```

혹은 미들웨어를 아예 제거할 수도 있습니다.

```
$middleware->web(remove: [
    StartSession::class,
]);
```

<a name="manually-managing-laravels-default-middleware-groups"></a>
#### 라라벨 기본 미들웨어 그룹 수동 관리

라라벨에서 기본으로 제공하는 `web` 및 `api` 미들웨어 그룹을 직접 완전히 관리하고 싶다면, 아래 예시와 같이 그룹을 직접 정의하면 됩니다. 아래 예시는 기본 미들웨어를 지정하여 필요에 따라 자유롭게 수정할 수 있게 해 줍니다.

```
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
> 기본적으로 `web` 및 `api` 미들웨어 그룹은 `bootstrap/app.php` 파일에서 자동으로 각 라우트 파일(`routes/web.php`, `routes/api.php`)에 적용됩니다.

<a name="middleware-aliases"></a>
### 미들웨어 별칭

애플리케이션의 `bootstrap/app.php` 파일에서 미들웨어에 별칭을 붙일 수 있습니다. 미들웨어 별칭(aliases)을 사용하면 긴 클래스명을 짧고 간단하게 참조할 수 있어서 편리합니다.

```
use App\Http\Middleware\EnsureUserIsSubscribed;

->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'subscribed' => EnsureUserIsSubscribed::class
    ]);
})
```

별칭을 정의한 뒤에는, 라우트에 미들웨어를 할당할 때 별칭을 사용하면 됩니다.

```
Route::get('/profile', function () {
    // ...
})->middleware('subscribed');
```

기본적으로 라라벨에 내장된 몇몇 미들웨어는 이미 별칭이 지정되어 있습니다. 예를 들어, `auth` 미들웨어는 `Illuminate\Auth\Middleware\Authenticate` 미들웨어의 별칭입니다. 기본 미들웨어 별칭은 아래와 같습니다.

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
### 미들웨어 실행 순서 지정

특별한 경우에 한해, 어떤 미들웨어가 우선적으로 실행되어야 하는데 라우트에 할당된 순서를 제어할 수 없는 상황일 때가 있습니다. 이럴 때는 애플리케이션의 `bootstrap/app.php` 파일에서 `priority` 메서드를 사용하여 미들웨어의 우선순위를 지정할 수 있습니다.

```
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

미들웨어는 추가적인 파라미터(매개변수)를 받을 수도 있습니다. 예를 들어, 인증된 사용자가 특정 "역할(role)"을 가지고 있는지 확인하고 싶을 때, 역할 이름을 인수로 받는 `EnsureUserHasRole` 미들웨어를 만들 수 있습니다.

추가 미들웨어 파라미터는 `$next` 인자 이후 순서로 미들웨어에 전달됩니다.

```
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

미들웨어 파라미터는 라우트 정의에서 `:`(콜론)으로 미들웨어 이름과 파라미터를 구분하여 지정할 수 있습니다.

```
use App\Http\Middleware\EnsureUserHasRole;

Route::put('/post/{id}', function (string $id) {
    // ...
})->middleware(EnsureUserHasRole::class.':editor');
```

여러 개의 파라미터가 필요하다면, 쉼표로 구분하여 전달할 수 있습니다.

```
Route::put('/post/{id}', function (string $id) {
    // ...
})->middleware(EnsureUserHasRole::class.':editor,publisher');
```

<a name="terminable-middleware"></a>
## 종료 가능한(Terminable) 미들웨어

때로는 HTTP 응답이 브라우저로 전송된 후에 미들웨어가 추가 작업을 해야 하는 상황도 있습니다. 미들웨어에 `terminate` 메서드를 정의하고 웹 서버가 FastCGI를 사용 중이라면, 응답이 브라우저로 전송된 뒤에 이 `terminate` 메서드가 자동으로 호출됩니다.

```
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

`terminate` 메서드는 요청과 응답 객체를 모두 받아야 합니다. 종료 가능한 미들웨어를 정의한 후에는 해당 미들웨어를 꼭 라우트 또는 글로벌 미들웨어 목록에 추가해야 작동합니다.

라라벨이 미들웨어의 `terminate` 메서드를 호출할 때, [서비스 컨테이너](/docs/11.x/container)에서 새로운 미들웨어 인스턴스를 resolve합니다. 만약 `handle`과 `terminate` 메서드 호출 시 동일한 미들웨어 인스턴스를 사용하고 싶다면, 해당 미들웨어를 컨테이너의 `singleton` 메서드로 등록해야 합니다. 보통은 `AppServiceProvider`의 `register` 메서드에서 이 작업을 수행합니다.

```
use App\Http\Middleware\TerminatingMiddleware;

/**
 * Register any application services.
 */
public function register(): void
{
    $this->app->singleton(TerminatingMiddleware::class);
}
```
