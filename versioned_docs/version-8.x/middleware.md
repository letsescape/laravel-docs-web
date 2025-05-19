# 미들웨어 (Middleware)

- [소개](#introduction)
- [미들웨어 정의하기](#defining-middleware)
- [미들웨어 등록하기](#registering-middleware)
    - [전역 미들웨어](#global-middleware)
    - [미들웨어를 라우트에 할당하기](#assigning-middleware-to-routes)
    - [미들웨어 그룹](#middleware-groups)
    - [미들웨어 정렬하기](#sorting-middleware)
- [미들웨어 파라미터](#middleware-parameters)
- [종료 가능한 미들웨어](#terminable-middleware)

<a name="introduction"></a>
## 소개

미들웨어는 여러분의 애플리케이션에 들어오는 HTTP 요청을 검사하고 필터링하는 데 편리한 방법을 제공합니다. 예를 들어, 라라벨에는 사용자가 인증되었는지를 확인하는 미들웨어가 기본으로 포함되어 있습니다. 만약 사용자가 인증되지 않았다면, 미들웨어는 사용자를 애플리케이션의 로그인 화면으로 리다이렉트합니다. 반대로, 사용자가 인증된 경우에는 요청을 애플리케이션 내부로 더 깊게 전달합니다.

인증 외에도 다양한 작업을 수행하는 추가 미들웨어를 직접 작성할 수 있습니다. 예를 들어, 로그를 남기는 미들웨어는 애플리케이션에 들어오는 모든 요청을 기록할 수 있습니다. 라라벨 프레임워크에는 인증, CSRF 보호 등 여러 미들웨어가 기본으로 포함되어 있으며, 이 모든 미들웨어는 `app/Http/Middleware` 디렉터리에 위치합니다.

<a name="defining-middleware"></a>
## 미들웨어 정의하기

새로운 미들웨어를 생성하려면 `make:middleware` Artisan 명령어를 사용합니다.

```
php artisan make:middleware EnsureTokenIsValid
```

이 명령어를 실행하면 `app/Http/Middleware` 디렉터리 내에 새로운 `EnsureTokenIsValid` 클래스가 생성됩니다. 이 미들웨어에서는 전달받은 `token` 입력값이 지정한 값과 일치하는 경우에만 해당 라우트에 접근할 수 있도록 허용합니다. 그렇지 않은 경우, 사용자를 `home` URI로 리다이렉트합니다.

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

위 예제에서 볼 수 있듯이, 전달받은 `token`이 우리가 지정한 시크릿 토큰과 일치하지 않으면 미들웨어는 HTTP 리다이렉트를 클라이언트에 반환합니다. 일치하는 경우에는 요청이 애플리케이션 내부로 더 깊게 전달됩니다. 미들웨어를 "통과"시켜 다음 단계로 요청을 전달하려면 `$next` 콜백에 `$request`를 전달해 호출해야 합니다.

미들웨어는 HTTP 요청이 애플리케이션에 도달하기 전에 거쳐야 하는 "여러 개의 계층"으로 생각하면 이해하기 쉽습니다. 각 계층은 요청을 검사하고, 필요하다면 요청 자체를 거부할 수도 있습니다.

> [!TIP]
> 모든 미들웨어는 [서비스 컨테이너](/docs/8.x/container)를 통해 resolve(해결)됩니다. 따라서 미들웨어 생성자에 필요한 의존성을 타입힌트로 지정해 사용할 수 있습니다.

<a name="middleware-and-responses"></a>
#### 미들웨어와 응답

물론, 미들웨어는 요청을 애플리케이션 내부로 넘기기 전이나 넘긴 후에 작업을 수행할 수 있습니다. 아래 예시의 미들웨어는 **요청이 애플리케이션에서 처리되기 전에** 작업을 수행합니다.

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

반대로, 다음 미들웨어는 **요청이 애플리케이션에서 처리된 후에** 작업을 수행합니다.

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

모든 HTTP 요청에 대해 미들웨어를 항상 실행하고 싶다면, `app/Http/Kernel.php` 클래스의 `$middleware` 속성에 해당 미들웨어 클래스를 추가하면 됩니다.

<a name="assigning-middleware-to-routes"></a>
### 미들웨어를 라우트에 할당하기

특정 라우트에만 미들웨어를 적용하려면 먼저 애플리케이션의 `app/Http/Kernel.php` 파일에서 미들웨어에 키를 할당해야 합니다. 기본적으로 라라벨이 포함하는 미들웨어에 대해 `$routeMiddleware` 속성에 항목이 등록되어 있습니다. 이 목록에 직접 미들웨어를 추가하고 원하는 키로 정의할 수 있습니다.

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

HTTP 커널에서 미들웨어를 정의한 후, 라우트에서 `middleware` 메서드로 미들웨어를 할당할 수 있습니다.

```
Route::get('/profile', function () {
    //
})->middleware('auth');
```

여러 개의 미들웨어를 한 라우트에 할당하려면 `middleware` 메서드에 미들웨어 이름 배열을 전달하면 됩니다.

```
Route::get('/', function () {
    //
})->middleware(['first', 'second']);
```

미들웨어 할당 시, 클래스명을 직접 사용해서 할당하는 것도 가능합니다.

```
use App\Http\Middleware\EnsureTokenIsValid;

Route::get('/profile', function () {
    //
})->middleware(EnsureTokenIsValid::class);
```

<a name="excluding-middleware"></a>
#### 미들웨어 제외하기

여러 라우트를 그룹으로 묶어 미들웨어를 할당했을 때, 그룹에 속한 특정 라우트만 미들웨어의 적용을 제외하고 싶을 때가 있습니다. 이럴 때는 `withoutMiddleware` 메서드를 사용하면 됩니다.

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

또한, [라우트 그룹](/docs/8.x/routing#route-groups) 전체에서 특정 미들웨어 집합을 제외할 수도 있습니다.

```
use App\Http\Middleware\EnsureTokenIsValid;

Route::withoutMiddleware([EnsureTokenIsValid::class])->group(function () {
    Route::get('/profile', function () {
        //
    });
});
```

`withoutMiddleware` 메서드는 라우트 미들웨어만 제거 가능하며, [전역 미들웨어](#global-middleware)에는 적용되지 않습니다.

<a name="middleware-groups"></a>
### 미들웨어 그룹

여러 개의 미들웨어를 하나의 키 아래 묶어서 라우트에 더 쉽게 할당하고 싶을 때가 있습니다. 이런 경우 HTTP 커널의 `$middlewareGroups` 속성을 사용해 미들웨어 그룹을 만들 수 있습니다.

라라벨에서는 기본적으로 `web`과 `api`라는 미들웨어 그룹이 제공됩니다. 이 그룹들은 웹 라우트와 API 라우트에 자주 사용되는 미들웨어들을 미리 모아둔 것입니다. 이 미들웨어 그룹들은 애플리케이션의 `App\Providers\RouteServiceProvider` 서비스 프로바이더에서 해당 `web`과 `api` 라우트 파일에 자동으로 적용됩니다.

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
        // \Illuminate\Session\Middleware\AuthenticateSession::class,
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

미들웨어 그룹 역시 개별 미들웨어와 마찬가지로 라우트와 컨트롤러 액션에 할당할 수 있습니다. 그룹을 이용하면 많은 미들웨어를 한 번에 라우트에 할당할 수 있기 때문에 관리가 훨씬 편리해집니다.

```
Route::get('/', function () {
    //
})->middleware('web');

Route::middleware(['web'])->group(function () {
    //
});
```

> [!TIP]
> `web` 및 `api` 미들웨어 그룹은 `App\Providers\RouteServiceProvider`가 알아서 각 애플리케이션의 `routes/web.php`, `routes/api.php` 파일에 자동 적용합니다.

<a name="sorting-middleware"></a>
### 미들웨어 정렬하기

가끔 특정 미들웨어가 반드시 정해진 순서대로 실행되어야 하지만, 라우트에 할당할 때 그 순서를 직접 지정할 수 없는 경우가 있습니다. 이럴 때는 `app/Http/Kernel.php` 파일의 `$middlewarePriority` 속성을 사용해 미들웨어의 우선순위를 지정할 수 있습니다. 이 속성은 기본적으로 HTTP 커널에 정의되어 있지 않을 수 있기 때문에, 필요하다면 아래 예시를 복사해 추가할 수 있습니다.

```
/**
 * The priority-sorted list of middleware.
 *
 * This forces non-global middleware to always be in the given order.
 *
 * @var string[]
 */
protected $middlewarePriority = [
    \Illuminate\Cookie\Middleware\EncryptCookies::class,
    \Illuminate\Session\Middleware\StartSession::class,
    \Illuminate\View\Middleware\ShareErrorsFromSession::class,
    \Illuminate\Contracts\Auth\Middleware\AuthenticatesRequests::class,
    \Illuminate\Routing\Middleware\ThrottleRequests::class,
    \Illuminate\Routing\Middleware\ThrottleRequestsWithRedis::class,
    \Illuminate\Session\Middleware\AuthenticateSession::class,
    \Illuminate\Routing\Middleware\SubstituteBindings::class,
    \Illuminate\Auth\Middleware\Authorize::class,
];
```

<a name="middleware-parameters"></a>
## 미들웨어 파라미터

미들웨어는 추가적인 파라미터를 받을 수도 있습니다. 예를 들어, 인증된 사용자가 특정 "role"을 가지고 있는지 확인해야 하는 경우, `EnsureUserHasRole`이라는 미들웨어를 만들어 역할 이름(role name)을 추가 인수로 받을 수 있습니다.

추가 미들웨어 파라미터는 `$next` 인자 뒤에 전달됩니다.

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

미들웨어 파라미터는 라우트 정의 시 `:`(콜론)으로 미들웨어 이름과 파라미터를 구분해 지정할 수 있습니다. 여러 파라미터가 필요한 경우 쉼표로 구분합니다.

```
Route::put('/post/{id}', function ($id) {
    //
})->middleware('role:editor');
```

<a name="terminable-middleware"></a>
## 종료 가능한 미들웨어

경우에 따라 미들웨어가 HTTP 응답이 브라우저로 전송된 **후**에 추가 작업을 해야 할 수도 있습니다. 미들웨어에 `terminate` 메서드를 정의해두고, 웹 서버가 FastCGI로 동작 중이라면 응답이 브라우저에 전송된 후 자동으로 `terminate` 메서드가 호출됩니다.

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

`terminate` 메서드는 요청 객체와 응답 객체를 모두 전달받도록 해야 합니다. 종료 가능한 미들웨어를 정의했다면, 해당 미들웨어를 `app/Http/Kernel.php` 의 라우트 또는 전역 미들웨어 목록에 등록해 주어야 합니다.

라라벨이 미들웨어의 `terminate` 메서드를 호출할 때는 [서비스 컨테이너](/docs/8.x/container)에서 미들웨어의 새로운 인스턴스를 resolve합니다. 만약 `handle`과 `terminate` 메서드가 동일한 미들웨어 인스턴스에서 호출되기를 원한다면, 컨테이너의 `singleton` 메서드를 사용해 미들웨어를 싱글톤으로 등록하면 됩니다. 일반적으로는 `AppServiceProvider`의 `register` 메서드에서 등록합니다.

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
