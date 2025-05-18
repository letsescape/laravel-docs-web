# 미들웨어 (Middleware)

- [소개](#introduction)
- [미들웨어 정의하기](#defining-middleware)
- [미들웨어 등록하기](#registering-middleware)
    - [전역 미들웨어](#global-middleware)
    - [라우트에 미들웨어 할당하기](#assigning-middleware-to-routes)
    - [미들웨어 그룹](#middleware-groups)
    - [미들웨어 정렬](#sorting-middleware)
- [미들웨어 파라미터](#middleware-parameters)
- [종료 미들웨어](#terminable-middleware)

<a name="introduction"></a>
## 소개

미들웨어는 애플리케이션에 들어오는 HTTP 요청을 검사하고 필터링할 수 있는 편리한 메커니즘을 제공합니다. 예를 들어, 라라벨에는 애플리케이션 사용자가 인증되었는지 확인하는 미들웨어가 기본적으로 포함되어 있습니다. 사용자가 인증되지 않은 경우, 이 미들웨어는 사용자를 로그인 화면으로 리다이렉트합니다. 반대로, 사용자가 인증된 경우에는 요청이 애플리케이션 내부로 정상적으로 진행됩니다.

이외에도 인증 외에 다양한 작업을 수행하는 추가적인 미들웨어를 직접 작성할 수 있습니다. 예를 들어, 로깅 미들웨어는 애플리케이션으로 들어오는 모든 요청을 기록할 수 있습니다. 라라벨 프레임워크에는 인증, CSRF 보호 등 여러 미들웨어가 내장되어 있습니다. 이러한 모든 미들웨어는 `app/Http/Middleware` 디렉터리에 위치합니다.

<a name="defining-middleware"></a>
## 미들웨어 정의하기

새로운 미들웨어를 생성하려면, `make:middleware` 아티즌 명령어를 사용하면 됩니다.

```shell
php artisan make:middleware EnsureTokenIsValid
```

이 명령어를 실행하면 `app/Http/Middleware` 디렉터리에 `EnsureTokenIsValid`라는 새 클래스가 생성됩니다. 이 예제 미들웨어에서는, 입력으로 제공된 `token` 값이 지정된 값과 일치할 때만 라우트 접근을 허용합니다. 그렇지 않다면 사용자를 `home` URI로 리다이렉트합니다.

```
<?php

namespace App\Http\Middleware;

use Closure;

class EnsureTokenIsValid
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        if ($request->input('token') !== 'my-secret-token') {
            return redirect('home');
        }

        return $next($request);
    }
}
```

위 예시처럼, 전달받은 `token`이 비밀 토큰과 일치하지 않으면 미들웨어가 클라이언트에게 HTTP 리다이렉트를 반환합니다. 일치할 경우에는 요청이 애플리케이션 내부로 계속 전달됩니다. 미들웨어를 "통과"시키려면 `$next` 콜백에 `$request`를 전달하면 됩니다.

미들웨어는 애플리케이션에 도달하기 전에 HTTP 요청이 통과해야 하는 여러 "레이어"의 집합이라고 생각하면 이해하기 쉽습니다. 각 레이어는 요청을 검사하거나, 요청을 완전히 거부할 수도 있습니다.

> [!NOTE]
> 모든 미들웨어는 [서비스 컨테이너](/docs/9.x/container)를 통해 resolve(해결)되므로, 미들웨어의 생성자에서 필요한 의존성을 타입힌트로 선언할 수 있습니다.

<a name="middleware-and-responses"></a>
#### 미들웨어 & 응답

미들웨어는 요청을 더 깊이 전달하기 전에 작업을 수행할 수도 있고, 전달한 뒤에 작업을 수행할 수도 있습니다. 예를 들어, 아래 예제는 요청이 애플리케이션에 도달하기 **이전**에 작업을 수행합니다.

```
<?php

namespace App\Http\Middleware;

use Closure;

class BeforeMiddleware
{
    public function handle($request, Closure $next)
    {
        // 작업 수행

        return $next($request);
    }
}
```

반면, 다음 미들웨어는 요청이 애플리케이션에서 처리된 **이후**에 작업을 수행합니다.

```
<?php

namespace App\Http\Middleware;

use Closure;

class AfterMiddleware
{
    public function handle($request, Closure $next)
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

모든 HTTP 요청에 대해 항상 실행되는 미들웨어를 만들고 싶다면, 해당 미들웨어 클래스를 `app/Http/Kernel.php`의 `$middleware` 프로퍼티에 추가하면 됩니다.

<a name="assigning-middleware-to-routes"></a>
### 라우트에 미들웨어 할당하기

특정 라우트에만 미들웨어를 적용하고 싶은 경우, 먼저 애플리케이션의 `app/Http/Kernel.php` 파일에서 미들웨어에 키를 할당해야 합니다. 기본적으로 이 클래스의 `$routeMiddleware` 프로퍼티에는 라라벨에 내장된 미들웨어에 대한 엔트리가 포함되어 있습니다. 여기에 직접 만든 미들웨어도 추가하고, 원하는 키를 지정할 수 있습니다.

```
// Within App\Http\Kernel class...

protected $routeMiddleware = [
    'auth' => \App\Http\Middleware\Authenticate::class,
    'auth.basic' => \Illuminate\Auth\Middleware\AuthenticateWithBasicAuth::class,
    'bindings' => \Illuminate\Routing\Middleware\SubstituteBindings::class,
    'cache.headers' => \Illuminate\Http\Middleware\SetCacheHeaders::class,
    'can' => \Illuminate\Auth\Middleware\Authorize::class,
    'guest' => \App\Http\Middleware\RedirectIfAuthenticated::class,
    'signed' => \Illuminate\Routing\Middleware\ValidateSignature::class,
    'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,
    'verified' => \Illuminate\Auth\Middleware\EnsureEmailIsVerified::class,
];
```

미들웨어를 HTTP 커널에 정의한 후, 라우트에서 `middleware` 메서드를 사용하여 미들웨어를 할당할 수 있습니다.

```
Route::get('/profile', function () {
    //
})->middleware('auth');
```

여러 개의 미들웨어를 라우트에 할당하려면, 미들웨어 이름의 배열을 `middleware` 메서드에 전달하면 됩니다.

```
Route::get('/', function () {
    //
})->middleware(['first', 'second']);
```

미들웨어를 할당할 때, 전체 네임스페이스를 포함한 클래스명을 직접 전달하는 것도 가능합니다.

```
use App\Http\Middleware\EnsureTokenIsValid;

Route::get('/profile', function () {
    //
})->middleware(EnsureTokenIsValid::class);
```

<a name="excluding-middleware"></a>
#### 미들웨어 제외하기

라우트 그룹에 미들웨어를 할당할 때, 그룹 안의 특정 라우트에서만 해당 미들웨어를 빼고 싶을 때가 있습니다. 이럴 때는 `withoutMiddleware` 메서드를 사용할 수 있습니다.

```
use App\Http\Middleware\EnsureTokenIsValid;

Route::middleware([EnsureTokenIsValid::class])->group(function () {
    Route::get('/', function () {
        //
    });

    Route::get('/profile', function () {
        //
    })->withoutMiddleware([EnsureTokenIsValid::class]);
});
```

특정 미들웨어를 [라우트 그룹](/docs/9.x/routing#route-groups) 전체에서 제외할 수도 있습니다.

```
use App\Http\Middleware\EnsureTokenIsValid;

Route::withoutMiddleware([EnsureTokenIsValid::class])->group(function () {
    Route::get('/profile', function () {
        //
    });
});
```

`withoutMiddleware` 메서드는 라우트 미들웨어만 제거할 수 있으며, [전역 미들웨어](#global-middleware)에는 적용되지 않습니다.

<a name="middleware-groups"></a>
### 미들웨어 그룹

여러 개의 미들웨어를 하나의 키로 묶어서, 라우트에 쉽게 할당하고 싶을 때가 있습니다. 이럴 때는 HTTP 커널의 `$middlewareGroups` 프로퍼티를 활용하면 됩니다.

라라벨에는 `web`과 `api`라는 미리 정의된 미들웨어 그룹이 제공되며, 웹 라우트와 API 라우트에 자주 사용되는 미들웨어들이 포함되어 있습니다. 이 미들웨어 그룹들은 애플리케이션의 `App\Providers\RouteServiceProvider` 서비스 프로바이더에 의해 해당하는 라우트 파일(`web`, `api`)에 자동으로 적용됩니다.

```
/**
 * The application's route middleware groups.
 *
 * @var array
 */
protected $middlewareGroups = [
    'web' => [
        \App\Http\Middleware\EncryptCookies::class,
        \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
        \Illuminate\Session\Middleware\StartSession::class,
        \Illuminate\View\Middleware\ShareErrorsFromSession::class,
        \App\Http\Middleware\VerifyCsrfToken::class,
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
    ],

    'api' => [
        'throttle:api',
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
    ],
];
```

미들웨어 그룹도 단일 미들웨어와 동일한 문법으로 라우트 및 컨트롤러 액션에 할당할 수 있습니다. 미들웨어 그룹을 활용하면 여러 개의 미들웨어를 한 번에 라우트에 적용할 수 있어 매우 편리합니다.

```
Route::get('/', function () {
    //
})->middleware('web');

Route::middleware(['web'])->group(function () {
    //
});
```

> [!NOTE]
> 기본적으로, `web` 및 `api` 미들웨어 그룹은 `App\Providers\RouteServiceProvider`에 의해 `routes/web.php` 및 `routes/api.php` 파일에 자동 적용됩니다.

<a name="sorting-middleware"></a>
### 미들웨어 정렬

드물게, 여러 미들웨어가 특정 순서로 실행되기를 원하지만 라우트에 할당하는 시점에 순서를 제어할 수 없는 경우가 있을 수 있습니다. 이런 경우에는 `app/Http/Kernel.php` 파일의 `$middlewarePriority` 프로퍼티를 사용하여 미들웨어의 우선순위를 직접 지정할 수 있습니다. 이 프로퍼티가 기본적으로 없다면, 아래의 기본 정의를 복사해서 사용할 수 있습니다.

```
/**
 * The priority-sorted list of middleware.
 *
 * This forces non-global middleware to always be in the given order.
 *
 * @var string[]
 */
protected $middlewarePriority = [
    \Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests::class,
    \Illuminate\Cookie\Middleware\EncryptCookies::class,
    \Illuminate\Session\Middleware\StartSession::class,
    \Illuminate\View\Middleware\ShareErrorsFromSession::class,
    \Illuminate\Contracts\Auth\Middleware\AuthenticatesRequests::class,
    \Illuminate\Routing\Middleware\ThrottleRequests::class,
    \Illuminate\Routing\Middleware\ThrottleRequestsWithRedis::class,
    \Illuminate\Contracts\Session\Middleware\AuthenticatesSessions::class,
    \Illuminate\Routing\Middleware\SubstituteBindings::class,
    \Illuminate\Auth\Middleware\Authorize::class,
];
```

<a name="middleware-parameters"></a>
## 미들웨어 파라미터

미들웨어는 추가적인 파라미터를 받을 수도 있습니다. 예를 들어, 인증된 사용자가 어떤 "역할"을 가지고 있는지 확인해야 한다면, 역할 이름을 추가 인수로 받는 `EnsureUserHasRole` 미들웨어를 만들 수 있습니다.

추가 미들웨어 파라미터는 `$next` 인수 뒤에 전달됩니다.

```
<?php

namespace App\Http\Middleware;

use Closure;

class EnsureUserHasRole
{
    /**
     * Handle the incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $role
     * @return mixed
     */
    public function handle($request, Closure $next, $role)
    {
        if (! $request->user()->hasRole($role)) {
            // Redirect...
        }

        return $next($request);
    }

}
```

미들웨어 파라미터는 라우트를 정의할 때, 미들웨어 이름과 파라미터를 `:`로 구분하여 전달할 수 있습니다. 여러 파라미터가 있다면 쉼표로 구분하면 됩니다.

```
Route::put('/post/{id}', function ($id) {
    //
})->middleware('role:editor');
```

<a name="terminable-middleware"></a>
## 종료 미들웨어

때때로, 미들웨어가 HTTP 응답이 브라우저로 전송된 이후에 어떤 작업을 해야 할 수 있습니다. 만약 미들웨어에 `terminate` 메서드를 정의하고, 웹서버가 FastCGI를 사용한다면, 응답이 브라우저로 전송된 후 자동으로 `terminate` 메서드가 호출됩니다.

```
<?php

namespace Illuminate\Session\Middleware;

use Closure;

class TerminatingMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        return $next($request);
    }

    /**
     * Handle tasks after the response has been sent to the browser.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Illuminate\Http\Response  $response
     * @return void
     */
    public function terminate($request, $response)
    {
        // ...
    }
}
```

`terminate` 메서드는 요청과 응답 둘 다를 입력받아야 합니다. 종료 미들웨어를 정의했다면, 반드시 해당 미들웨어를 라우트 또는 전역 미들웨어 목록에 `app/Http/Kernel.php` 파일에서 등록해야 합니다.

라라벨은 `terminate` 메서드를 호출할 때, [서비스 컨테이너](/docs/9.x/container)를 통해 새로운 미들웨어 인스턴스를 resolve(해결)합니다. 만약 `handle`과 `terminate` 메서드가 호출될 때 동일한 미들웨어 인스턴스를 사용하고 싶다면, 컨테이너의 `singleton` 메서드로 미들웨어를 등록할 수 있습니다. 일반적으로 이 작업은 `AppServiceProvider`의 `register` 메서드에서 수행합니다.

```
use App\Http\Middleware\TerminatingMiddleware;

/**
 * Register any application services.
 *
 * @return void
 */
public function register()
{
    $this->app->singleton(TerminatingMiddleware::class);
}
```