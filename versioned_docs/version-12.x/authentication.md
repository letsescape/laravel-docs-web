# 인증(Authentication)

- [소개](#introduction)
    - [스타터 키트](#starter-kits)
    - [데이터베이스 관련 사항](#introduction-database-considerations)
    - [에코시스템 개요](#ecosystem-overview)
- [인증 빠르게 시작하기](#authentication-quickstart)
    - [스타터 키트 설치하기](#install-a-starter-kit)
    - [인증된 사용자 가져오기](#retrieving-the-authenticated-user)
    - [라우트 보호하기](#protecting-routes)
    - [로그인 시도 제한](#login-throttling)
- [사용자 수동 인증하기](#authenticating-users)
    - [사용자 기억하기](#remembering-users)
    - [기타 인증 방법](#other-authentication-methods)
- [HTTP 기본 인증](#http-basic-authentication)
    - [상태 없는 HTTP 기본 인증](#stateless-http-basic-authentication)
- [로그아웃](#logging-out)
    - [다른 기기에서 세션 무효화](#invalidating-sessions-on-other-devices)
- [비밀번호 확인](#password-confirmation)
    - [설정](#password-confirmation-configuration)
    - [라우팅](#password-confirmation-routing)
    - [라우트 보호하기](#password-confirmation-protecting-routes)
- [사용자 정의 가드 추가](#adding-custom-guards)
    - [클로저 요청 가드](#closure-request-guards)
- [사용자 정의 사용자 제공자 추가](#adding-custom-user-providers)
    - [User Provider 계약](#the-user-provider-contract)
    - [Authenticatable 계약](#the-authenticatable-contract)
- [자동 비밀번호 재해시](#automatic-password-rehashing)
- [소셜 인증](/docs/socialite)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

많은 웹 애플리케이션은 사용자가 애플리케이션에 인증하고 "로그인"할 수 있는 방법을 제공합니다. 이러한 기능을 웹 애플리케이션에 구현하는 과정은 복잡하고 보안상 위험할 수 있기 때문에, 라라벨은 인증 기능을 빠르고 안전하며 쉽게 구현하기 위한 다양한 도구를 제공합니다.

라라벨 인증의 핵심은 "가드(guards)"와 "프로바이더(providers)"로 구성되어 있습니다. 가드는 각 요청마다 사용자를 어떻게 인증할지 정의합니다. 예를 들어, 라라벨에는 세션 저장소와 쿠키를 활용하는 `session` 가드가 기본적으로 포함되어 있습니다.

프로바이더는 사용자를 영구 저장소(데이터베이스 등)에서 어떻게 불러올지 결정합니다. 라라벨은 [Eloquent](/docs/eloquent) 및 데이터베이스 쿼리 빌더를 활용한 사용자 조회를 기본 지원합니다. 필요하다면 여러분의 애플리케이션에서 추가 프로바이더 역시 정의할 수 있습니다.

애플리케이션의 인증 설정 파일은 `config/auth.php`에 위치합니다. 이 파일에는 라라벨 인증 서비스의 동작을 세부적으로 조정할 수 있는 옵션들이 잘 설명되어 있습니다.

> [!NOTE]
> 가드와 프로바이더는 "역할(roles)"이나 "권한(permissions)"과는 다릅니다. 권한을 통한 사용자 동작 인가(authorization) 기능이 궁금하다면, [인가(authorization)](/docs/authorization) 문서를 참고하세요.

<a name="starter-kits"></a>
### 스타터 키트

빠르게 시작하고 싶으신가요? 새로 설치한 라라벨 애플리케이션에 [라라벨 애플리케이션 스타터 키트](/docs/starter-kits)를 설치하세요. 데이터베이스 마이그레이션을 끝낸 후, 브라우저에서 `/register` 등 해당 애플리케이션에 할당된 URL로 접속하면 됩니다. 스타터 키트는 인증 시스템 전체의 기본 구조를 손쉽게 만들어 줍니다.

**최종 애플리케이션에서는 굳이 스타터 키트를 사용하지 않더라도, [스타터 키트](/docs/starter-kits)를 설치해 실제 예제를 보며 라라벨 인증 기능 전체를 직접 구현하는 방법을 배울 수 있습니다.** 스타터 키트에는 인증 컨트롤러, 라우트, 뷰가 모두 미리 구현되어 있으니, 이러한 파일의 코드를 살펴보며 라라벨의 인증 기능이 어떻게 동작하는지 학습할 수 있습니다.

<a name="introduction-database-considerations"></a>
### 데이터베이스 관련 사항

기본적으로 라라벨은 `app/Models` 디렉터리에 `App\Models\User` [Eloquent 모델](/docs/eloquent)을 포함하고 있습니다. 이 모델은 기본 Eloquent 인증 드라이버와 함께 사용할 수 있습니다.

만약 애플리케이션에서 Eloquent를 사용하지 않는다 해도, 라라벨 쿼리 빌더를 사용하는 `database` 인증 프로바이더를 활용할 수 있습니다. MongoDB를 사용하는 경우, MongoDB 공식 [라라벨 사용자 인증 문서](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/user-authentication/)를 참고하세요.

`App\Models\User` 모델에 대한 데이터베이스 스키마를 만들 때, 비밀번호 컬럼은 최소 60자 이상이어야 합니다. 참고로, 새로운 라라벨 애플리케이션에 포함된 `users` 테이블 마이그레이션에서 이미 충분히 긴 컬럼을 제공합니다.

또한 `users` (혹은 이에 상응하는) 테이블에는 100자 크기의, null이 가능한 문자열 타입의 `remember_token` 컬럼이 반드시 있어야 합니다. 이 컬럼은 애플리케이션에 로그인할 때 "로그인 상태 유지" 옵션을 선택한 사용자의 토큰을 저장하는 데 사용됩니다. 마찬가지로, 라라벨의 기본 `users` 테이블 마이그레이션에는 이미 이 컬럼이 포함되어 있습니다.

<a name="ecosystem-overview"></a>
### 에코시스템 개요

라라벨은 인증과 관련된 다양한 패키지를 제공합니다. 본격적으로 학습을 시작하기 전에, 라라벨의 인증 에코시스템 전체를 간단히 살펴보고 각 패키지가 어떤 용도에 적합한지 소개하겠습니다.

먼저, 인증이 어떻게 동작하는지 생각해봅시다. 웹 브라우저를 이용할 때, 사용자는 로그인 폼에 사용자명과 비밀번호를 입력합니다. 이 정보가 정확하다면, 애플리케이션은 해당 사용자 정보를 [세션](/docs/session)에 저장합니다. 브라우저에는 세션 ID가 담긴 쿠키가 발급되어, 이후 요청에서는 세션 ID로 적절한 사용자를 연결할 수 있습니다. 이렇게 세션 쿠키가 전달되면, 애플리케이션은 해당 세션 ID로 세션 데이터를 조회하고 인증 정보를 확인해, 사용자를 "인증됨" 상태로 간주합니다.

반면, 외부 서비스가 API에 접근하려는 경우에는 웹 브라우저가 없기 때문에 인증에 쿠키를 잘 사용하지 않습니다. 대신 원격 서비스는 매 요청마다 API 토큰을 함께 보내고, 애플리케이션은 유효한 토큰 목록과 요청에 포함된 토큰을 비교해 해당 토큰에 연결된 사용자로 "인증" 처리를 하게 됩니다.

<a name="laravels-built-in-browser-authentication-services"></a>
#### 라라벨의 기본 브라우저 인증 서비스

라라벨은 `Auth`와 `Session` 파사드를 통해 접근할 수 있는 기본 인증 및 세션 기능을 제공합니다. 이 기능들은 주로 웹 브라우저 기반 요청에 대해 쿠키 기반 인증을 제공하며, 사용자의 자격 증명 확인, 인증 처리 등 여러 메서드를 지원합니다. 또한 이 서비스들은 인증 데이터를 자동으로 세션에 저장하고, 사용자의 세션 쿠키를 발급합니다. 구체적인 사용 방법은 이 문서에서 다룹니다.

**애플리케이션 스타터 키트**

이 문서에서 소개하는 것처럼 개발자가 인증 서비스를 직접 활용해 자체 인증 계층을 만들 수도 있지만, 좀 더 빠르게 시작하고 싶다면 [무료 스타터 키트](/docs/starter-kits)를 활용해 견고하고 현대적인 인증 구조 전체를 쉽게 구축할 수 있습니다.

<a name="laravels-api-authentication-services"></a>
#### 라라벨의 API 인증 서비스

라라벨은 API 토큰 관리와 토큰을 통한 인증을 도와주는 두 가지 선택적 패키지, [Passport](/docs/passport)와 [Sanctum](/docs/sanctum)을 제공합니다. 이 두 라이브러리와 라라벨 내장 쿠키 기반 인증 라이브러리는 서로 배타적이지 않으며, 주로 API 토큰 인증에 집중하는 한편 내장 인증 서비스는 브라우저 쿠키 기반 인증에 집중합니다. 많은 애플리케이션은 라라벨 내장 인증 서비스와 API 인증 패키지 하나를 함께 사용하는 경우가 많습니다.

**Passport**

Passport는 OAuth2 인증 제공자로, 다양한 OAuth2 "grant type"을 지원하여 여러 종류의 토큰을 발급할 수 있습니다. 전반적으로 강력하고 복잡한 API 인증 패키지입니다. 그러나 대부분의 애플리케이션은 OAuth2 스펙이 제공하는 복잡한 기능까지는 필요 없으며, 이로 인해 사용자와 개발자 모두 혼란을 겪을 수 있습니다. 특히 SPA나 모바일 애플리케이션에서 Passport와 같은 OAuth2 인증을 사용할 때 이러한 혼란이 존재했습니다.

**Sanctum**

OAuth2의 복잡성과 관련된 개발자 혼란을 해소하기 위해, 라라벨 팀은 웹 브라우저의 1인칭 요청과 API 토큰 인증 모두를 다룰 수 있는 보다 간결하고 직관적인 인증 패키지 개발을 목표로 했고, 그 결과물이 바로 [Laravel Sanctum](/docs/sanctum)입니다. Sanctum은 별도의 백엔드와 분리된 SPA, 혹은 모바일 클라이언트를 함께 제공하거나, API와 웹 UI를 모두 제공해야 하는 애플리케이션에 권장되는 하이브리드 인증 패키지입니다.

Laravel Sanctum은 웹/ API 인증을 모두 아우르는 기능을 제공하는데, 이는 Sanctum이 요청을 받을 때 먼저 세션 쿠키가 있는지 확인하여 라라벨 내장 인증 기능(앞서 설명한 서비스들)을 활용한다는 점에서 가능합니다. 세션 쿠키 기반 인증이 아닐 경우, 요청에 API 토큰이 있는지 확인해 해당 토큰으로 인증 처리를 수행합니다. 더 자세한 작동 방식은 Sanctum의 ["작동 원리"](/docs/sanctum#how-it-works) 문서를 참고하세요.

<a name="summary-choosing-your-stack"></a>
#### 요약 및 인증 스택 선택

정리하면, 애플리케이션이 브라우저를 통해 접근되고, 단일 라라벨 애플리케이션(모놀리식 구조)이라면, 라라벨의 내장 인증 서비스를 활용하면 됩니다.

다음으로, 서드 파티가 API를 통해 접근할 수 있도록 만들고자 한다면, API 토큰 인증 기능 제공을 위해 [Passport](/docs/passport) 또는 [Sanctum](/docs/sanctum) 중 택일하면 됩니다. 일반적으로는 더 간단하고 완성도 높은 인증 경험을 제공하는 Sanctum이 권장되며, "스코프(scopes)"와 "abilities" 등도 지원합니다.

만약 라라벨 백엔드 기반의 SPA를 만든다면, [Laravel Sanctum](/docs/sanctum) 사용을 권장합니다. 이 경우 [사용자 인증 라우트를 직접 구현](#authenticating-users)하거나, [Laravel Fortify](/docs/fortify)를 헤드리스 인증 백엔드 서비스(회원가입, 비밀번호 재설정, 이메일 인증 등 기능 제공)로 이용하면 좋습니다.

OAuth2의 모든 기능이 필수적으로 필요한 앱이라면 Passport를 선택할 수 있습니다.

무엇보다 빠른 시작을 원한다면, [애플리케이션 스타터 키트](/docs/starter-kits)를 활용해 라라벨 내장 인증 스택 기반의 새 프로젝트를 빠르게 구축할 수 있습니다.

<a name="authentication-quickstart"></a>
## 인증 빠르게 시작하기

> [!WARNING]
> 이 문서의 지금 파트에서는 [라라벨 애플리케이션 스타터 키트](/docs/starter-kits)를 통한 사용자 인증 방법을 설명합니다. 스타터 키트에는 UI 구조가 포함되어 있어 빠르게 시작할 수 있습니다. 라라벨의 인증 시스템을 직접 연동하고 싶다면, [사용자 수동 인증하기](#authenticating-users) 문서를 참고하세요.

<a name="install-a-starter-kit"></a>
### 스타터 키트 설치하기

먼저, [라라벨 애플리케이션 스타터 키트](/docs/starter-kits)를 설치하세요. 스타터 키트는 신선한(새로 설치한) 라라벨 애플리케이션에 인증을 손쉽게 적용할 수 있는 아름답게 디자인된 시작점을 제공합니다.

<a name="retrieving-the-authenticated-user"></a>
### 인증된 사용자 가져오기

스타터 키트로 애플리케이션을 생성하고, 사용자가 회원가입과 인증을 할 수 있게 되면, 현재 인증된 사용자 정보를 코드에서 자주 조회하게 됩니다. 요청 처리 중에는 `Auth` 파사드의 `user` 메서드를 사용해 현재 인증된 사용자에 접근할 수 있습니다:

```php
use Illuminate\Support\Facades\Auth;

// 현재 인증된 사용자 정보 얻기
$user = Auth::user();

// 현재 인증된 사용자의 ID 얻기
$id = Auth::id();
```

또 다른 방법으로, 이미 인증된 사용자라면 `Illuminate\Http\Request` 인스턴스를 통해서도 접근할 수 있습니다. 컨트롤러 메서드에서 의존성 주입된 `Request` 객체를 활용하면, request의 `user` 메서드를 통해 언제든 편리하게 인증 사용자 객체를 가져올 수 있습니다:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class FlightController extends Controller
{
    /**
     * 기존 항공편 정보 수정
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        // ...

        return redirect('/flights');
    }
}
```

<a name="determining-if-the-current-user-is-authenticated"></a>
#### 현재 사용자가 인증되었는지 확인하기

들어오는 HTTP 요청의 사용자가 인증되었는지 확인하려면, `Auth` 파사드의 `check` 메서드를 사용할 수 있습니다. 사용자가 인증된 상태라면 이 메서드는 `true`를 반환합니다:

```php
use Illuminate\Support\Facades\Auth;

if (Auth::check()) {
    // 사용자가 로그인된 상태입니다...
}
```

> [!NOTE]
> `check` 메서드로 사용자 인증 여부를 직접 확인할 수도 있지만, 실제로는 미들웨어를 활용해 특정 라우트/컨트롤러 접근 전 미리 인증 여부를 확인하는 경우가 많습니다. 이와 관련해서는 [라우트 보호하기](/docs/authentication#protecting-routes) 문서를 참고하세요.

<a name="protecting-routes"></a>
### 라우트 보호하기

[라우트 미들웨어](/docs/middleware)를 활용하면, 인증된 사용자만 특정 라우트에 접근하도록 제한할 수 있습니다. 라라벨에는 인증 전용 `auth` 미들웨어가 내장되어 있으며, 이는 `Illuminate\Auth\Middleware\Authenticate` 클래스의 [미들웨어 별칭](/docs/middleware#middleware-aliases)입니다. 이 미들웨어는 라라벨에서 이미 별칭이 등록되어 있으므로, 라우트에 단순히 붙이기만 하면 됩니다:

```php
Route::get('/flights', function () {
    // 인증된 사용자만 접근할 수 있는 라우트입니다...
})->middleware('auth');
```

<a name="redirecting-unauthenticated-users"></a>
#### 인증되지 않은 사용자 리다이렉트

`auth` 미들웨어가 인증되지 않은 사용자를 감지하면, 자동으로 그 사용자를 `login` [네임드 라우트](/docs/routing#named-routes)로 리다이렉트합니다. 이 동작은 애플리케이션의 `bootstrap/app.php` 파일에서 `redirectGuestsTo` 메서드를 활용해 변경할 수 있습니다:

```php
use Illuminate\Http\Request;

->withMiddleware(function (Middleware $middleware) {
    $middleware->redirectGuestsTo('/login');

    // 클로저를 사용하는 경우...
    $middleware->redirectGuestsTo(fn (Request $request) => route('login'));
})
```

<a name="redirecting-authenticated-users"></a>
#### 인증된 사용자 리다이렉트

`guest` 미들웨어는 이미 인증된 사용자를 감지하면, 그 사용자를 기본적으로 `dashboard`나 `home` 네임드 라우트로 리다이렉트합니다. 이 동작 역시 `bootstrap/app.php` 파일 내 `redirectUsersTo` 메서드를 사용해서 변경할 수 있습니다:

```php
use Illuminate\Http\Request;

->withMiddleware(function (Middleware $middleware) {
    $middleware->redirectUsersTo('/panel');

    // 클로저를 사용하는 경우...
    $middleware->redirectUsersTo(fn (Request $request) => route('panel'));
})
```

<a name="specifying-a-guard"></a>
#### 특정 가드 지정하기

`auth` 미들웨어를 라우트에 붙일 때, 사용자 인증에 사용할 "가드"를 지정할 수도 있습니다. 지정한 가드는 `auth.php` 설정 파일의 `guards` 배열 중 하나의 키여야 합니다:

```php
Route::get('/flights', function () {
    // 인증된 사용자만 접근할 수 있는 라우트입니다...
})->middleware('auth:admin');
```

<a name="login-throttling"></a>
### 로그인 시도 제한

[애플리케이션 스타터 키트](/docs/starter-kits)를 사용하는 경우, 로그인 시도에 대해 자동으로 속도 제한(레이트 리미트)이 적용됩니다. 기본적으로 사용자가 여러 번 연속 잘못된 정보를 입력하면, 1분간 로그인 시도가 차단됩니다. 이 제한은 사용자명/이메일과 IP 주소별로 각각 적용됩니다.

> [!NOTE]
> 애플리케이션의 다른 라우트에 대해서도 레이트 리미트를 적용하고 싶다면, [레이트 리미트 문서](/docs/routing#rate-limiting)를 참고하세요.

<a name="authenticating-users"></a>
## 사용자 수동 인증하기

라라벨의 [애플리케이션 스타터 키트](/docs/starter-kits)에 포함된 인증 스캐폴딩을 반드시 사용할 필요는 없습니다. 이 스캐폴딩 없이 직접 인증 기능을 구현하려면, 라라벨의 인증 클래스를 직접 활용해야 합니다. 걱정하지 마세요, 절차는 간단합니다!

여기서는 인증 서비스를 `Auth` [파사드](/docs/facades)를 통해 사용하므로, 클래스 상단에서 `Auth` 파사드를 꼭 임포트해야 합니다. 일단, `attempt` 메서드를 살펴봅시다. `attempt` 메서드는 일반적으로 애플리케이션의 "로그인" 폼에서 인증 요청을 처리할 때 사용합니다. 인증에 성공하면, [세션](/docs/session) [고정 공격(session fixation)](https://en.wikipedia.org/wiki/Session_fixation)을 막기 위해 사용자의 세션을 반드시 재생성해주세요:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    /**
     * 인증 시도 처리 메서드
     */
    public function authenticate(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();

            return redirect()->intended('dashboard');
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email');
    }
}
```

`attempt` 메서드는 첫 번째 인수로 키/값 쌍의 배열을 받습니다. 배열의 값으로 데이터베이스에서 사용자를 찾으니, 위 예시에서는 `email` 컬럼 값으로 사용자를 조회합니다. 사용자가 존재하면, 데이터베이스에 저장된 해시된 비밀번호와 `password` 값이 일치하는지 비교합니다. 여기서 `password` 값은 따로 해시하지 않아도 되며, 프레임워크가 알아서 해시 처리 후 비교합니다. 두 해시가 일치하면 인증 세션이 시작됩니다.

참고로 라라벨은 가드의 "프로바이더" 설정에 따라 데이터베이스에서 사용자를 조회합니다. 기본 `config/auth.php` 설정 파일에서는 Eloquent 사용자 프로바이더가 지정되어, `App\Models\User` 모델로 사용자를 가져옵니다. 필요하다면 값들을 설정 파일에서 자유롭게 바꿀 수 있습니다.

인증이 성공하면 `attempt`는 `true`, 실패하면 `false`를 반환합니다.

또한, 라라벨이 제공하는 `intended` 메서드는 인증 미들웨어에 의해 인터셉트되기 전에 사용자가 원래 가려고 했던 URL로 리다이렉트합니다. 만약 그런 경로가 없다면, 기본 URL을 전달해 줄 수 있습니다.

<a name="specifying-additional-conditions"></a>
#### 추가 조건 지정하기

필요하다면 사용자의 이메일/비밀번호 외에도 추가적인 쿼리 조건을 인증에 활용할 수 있습니다. 단순히 추가 조건을 `attempt` 메서드에 전달하는 배열에 포함하면 됩니다. 예를 들어, 사용자가 "active" 상태인지 추가로 검증하고 싶다면 아래와 같이 작성할 수 있습니다:

```php
if (Auth::attempt(['email' => $email, 'password' => $password, 'active' => 1])) {
    // 인증에 성공했습니다...
}
```

더 복잡한 쿼리 조건이 필요할 경우, credentials 배열 내에 클로저를 추가해 쿼리를 원하는 대로 커스터마이징할 수도 있습니다:

```php
use Illuminate\Database\Eloquent\Builder;

if (Auth::attempt([
    'email' => $email,
    'password' => $password,
    fn (Builder $query) => $query->has('activeSubscription'),
])) {
    // 인증에 성공했습니다...
}
```

> [!WARNING]
> 위 예시에서 `email`은 필수 옵션이 아니라 단순히 예시일 뿐입니다. 데이터베이스에 "username"에 해당하는 컬럼명을 사용하시면 됩니다.

`attemptWhen` 메서드는 두 번째 인수로 클로저를 받아, 해당 사용자에 대해 더 세밀한 검사를 한 뒤 실제 인증을 시도할 수 있도록 해 줍니다. 클로저는 해당 유저를 받아 인증 가능 여부에 따라 `true` 또는 `false`를 반환해야 합니다:

```php
if (Auth::attemptWhen([
    'email' => $email,
    'password' => $password,
], function (User $user) {
    return $user->isNotBanned();
})) {
    // 인증에 성공했습니다...
}
```

<a name="accessing-specific-guard-instances"></a>
#### 특정 가드 인스턴스 사용하기

`Auth` 파사드의 `guard` 메서드를 이용하면, 사용자 인증 시 사용할 가드 인스턴스를 직접 지정할 수 있습니다. 이를 통해 애플리케이션의 여러 파트를 서로 다른 인증 모델 또는 사용자 테이블로 분리 관리할 수 있습니다.

`guard`에 넘겨주는 가드 이름은 `auth.php` 설정의 guards 목록에 등록되어 있어야 합니다.

```php
if (Auth::guard('admin')->attempt($credentials)) {
    // ...
}
```

<a name="remembering-users"></a>
### 사용자 기억하기

많은 웹 애플리케이션에서는 로그인 폼에 "로그인 상태 유지" 체크박스 옵션을 제공합니다. 이 기능을 구현하고 싶다면, `attempt` 메서드의 두 번째 인수로 불린 값을 넘기면 됩니다.

이 값이 `true`이면, 라라벨은 사용자가 직접 로그아웃할 때까지(혹은 인증이 만료될 때까지) 인증 상태를 유지합니다. 이를 위해 `users` 테이블에 문자열 타입의 `remember_token` 컬럼이 꼭 포함되어야 하며, 신규 라라벨 프로젝트의 기본 마이그레이션에는 이미 이 컬럼이 생성되어 있습니다:

```php
use Illuminate\Support\Facades\Auth;

if (Auth::attempt(['email' => $email, 'password' => $password], $remember)) {
    // 사용자를 기억하고 있습니다...
}
```

"로그인 상태 유지" 기능을 제공하는 경우, 현재 인증된 사용자가 이 쿠키로 인증되었는지 확인하려면 `viaRemember` 메서드를 활용하면 됩니다:

```php
use Illuminate\Support\Facades\Auth;

if (Auth::viaRemember()) {
    // ...
}
```

<a name="other-authentication-methods"></a>
### 기타 인증 방법

<a name="authenticate-a-user-instance"></a>
#### User 인스턴스를 직접 인증하기

이미 존재하는 사용자 인스턴스를 현재 인증된 사용자로 설정하려면, `Auth` 파사드의 `login` 메서드에 해당 인스턴스를 넘기면 됩니다. 전달하는 인스턴스는 반드시 `Illuminate\Contracts\Auth\Authenticatable` [계약](/docs/contracts)을 구현하고 있어야 하며, 라라벨의 기본 `App\Models\User` 모델은 이미 이를 구현합니다. 이 방식은 일반적으로 회원가입 직후 등, 유효한 사용자 인스턴스가 이미 있는 경우에 유용합니다:

```php
use Illuminate\Support\Facades\Auth;

Auth::login($user);
```

두 번째 인수로 불린 값을 넘기면 "로그인 상태 유지" 기능 적용 여부도 지정할 수 있습니다. 이 경우 해당 세션은 사용자가 명시적으로 로그아웃할 때까지 유지됩니다:

```php
Auth::login($user, $remember = true);
```

필요하다면 인증 가드를 먼저 지정한 뒤, 로그인 처리할 수도 있습니다:

```php
Auth::guard('admin')->login($user);
```

<a name="authenticate-a-user-by-id"></a>
#### ID로 사용자 인증하기

데이터베이스에서 사용자의 기본키(primary key)를 이용해 인증하려면 `loginUsingId` 메서드를 사용하면 됩니다. 이때 인증하려는 사용자의 기본키 값을 전달합니다:

```php
Auth::loginUsingId(1);
```

`loginUsingId`의 `remember` 인수로 불린 값을 전달해 "로그인 상태 유지" 적용 여부도 지정할 수 있습니다:

```php
Auth::loginUsingId(1, remember: true);
```

<a name="authenticate-a-user-once"></a>
#### 한 번만 사용자 인증하기

특정 요청에 한해서만 인증을 수행하고, 세션이나 쿠키를 사용하지 않으려면 `once` 메서드를 이용할 수 있습니다:

```php
if (Auth::once($credentials)) {
    // ...
}
```

<a name="http-basic-authentication"></a>
## HTTP 기본 인증

[HTTP 기본 인증](https://en.wikipedia.org/wiki/Basic_access_authentication)은 별도의 "로그인" 페이지를 만들지 않고도 신속하게 사용자를 인증하는 방법입니다. 먼저, 해당 라우트에 `auth.basic` [미들웨어](/docs/middleware)를 추가하세요. `auth.basic` 미들웨어는 라라벨 프레임워크에 기본 포함이므로, 정의할 필요 없이 바로 사용할 수 있습니다:

```php
Route::get('/profile', function () {
    // 인증된 사용자만 접근할 수 있는 라우트입니다...
})->middleware('auth.basic');
```

이 미들웨어를 라우트에 추가하면 브라우저에서 해당 경로에 접근할 때마다 자동으로 자격 증명을 입력하라는 창이 뜹니다. 기본적으로, `auth.basic` 미들웨어는 `users` 테이블의 `email` 컬럼을 username으로 사용합니다.

<a name="a-note-on-fastcgi"></a>
#### FastCGI 사용 시 주의사항

PHP FastCGI와 Apache 조합에서 라라벨 애플리케이션을 운영 중이라면, HTTP 기본 인증이 올바로 동작하지 않을 수 있습니다. 이런 경우, 아래의 내용을 애플리케이션의 `.htaccess` 파일에 추가하면 문제가 해결됩니다:

```apache
RewriteCond %{HTTP:Authorization} ^(.+)$
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
```

<a name="stateless-http-basic-authentication"></a>
### 상태 없는 HTTP 기본 인증

세션에 사용자 식별 쿠키를 남기지 않고 HTTP 기본 인증을 사용할 수도 있습니다. 이 방법은 API 요청에 대해 HTTP 인증을 쓰고자 할 때 유용합니다. 이를 위해, [사용자 지정 미들웨어](/docs/middleware)를 정의해 `onceBasic` 메서드를 호출하면 됩니다. `onceBasic` 메서드가 응답을 반환하지 않는 경우에만 요청 처리를 진행하도록 합니다:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateOnceWithBasicAuth
{
    /**
     * 들어오는 요청 처리
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        return Auth::onceBasic() ?: $next($request);
    }

}
```

그리고, 해당 미들웨어를 원하는 라우트에 연결하세요:

```php
Route::get('/api/user', function () {
    // 인증된 사용자만 접근할 수 있는 라우트입니다...
})->middleware(AuthenticateOnceWithBasicAuth::class);
```

<a name="logging-out"></a>
## 로그아웃

사용자를 수동으로 로그아웃시키려면, `Auth` 파사드의 `logout` 메서드를 사용하세요. 이 메서드는 사용자의 세션에서 인증 정보를 제거해, 이후 요청에서는 인증 상태가 유지되지 않게 만듭니다.

추가로, 로그아웃 시 세션을 무효화하고 [CSRF 토큰](/docs/csrf)도 재생성할 것을 권장합니다. 사용자를 로그아웃 처리한 다음, 보통은 홈페이지 등으로 리다이렉트시킵니다:

```php
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

/**
 * 사용자를 로그아웃합니다.
 */
public function logout(Request $request): RedirectResponse
{
    Auth::logout();

    $request->session()->invalidate();

    $request->session()->regenerateToken();

    return redirect('/');
}
```

<a name="invalidating-sessions-on-other-devices"></a>
### 다른 기기에서 세션 무효화

라라벨은 한 사용자가 여러 기기(브라우저 등)에서 로그인하고 있을 때, 현재 기기를 제외한 다른 기기들의 세션만 선택적으로 무효화(로그아웃)하는 기능을 제공합니다. 이 기능은 사용자가 비밀번호를 변경하거나 수정할 때, 현재 사용 중인 기기는 유지하면서 다른 기기의 세션을 만료시키고 싶을 때 주로 사용됩니다.

이 기능을 사용하기 전, `Illuminate\Session\Middleware\AuthenticateSession` 미들웨어가 해당 라우트에 추가되어 있는지 확인하세요. 보통은 라우트 그룹 단위로 이 미들웨어를 걸어두면 대부분의 라우트에 적용할 수 있습니다. 기본적으로 `auth.session` [미들웨어 별칭](/docs/middleware#middleware-aliases)으로 라우트에 추가할 수 있습니다:

```php
Route::middleware(['auth', 'auth.session'])->group(function () {
    Route::get('/', function () {
        // ...
    });
});
```

이후에는, `Auth` 파사드의 `logoutOtherDevices` 메서드를 이용하면 됩니다. 이 메서드는 사용자가 현재 비밀번호를 한 번 더 입력해 인증해야 하며, 그 값은 입력 폼으로부터 받아야 합니다:

```php
use Illuminate\Support\Facades\Auth;

Auth::logoutOtherDevices($currentPassword);
```

`logoutOtherDevices` 메서드를 호출하면, 해당 사용자의 다른 세션이 모두 완전히 무효화되어, 그동안 인증 상태였던 모든 가드에서 로그아웃 처리됩니다.

<a name="password-confirmation"></a>
## 비밀번호 확인

애플리케이션 개발 과정에서 중요한 작업을 수행하거나 민감한 영역으로 이동하기 전에, 사용자가 비밀번호를 한 번 더 확인하도록 해야 하는 경우가 있습니다. 라라벨은 이를 쉽게 구현할 수 있도록 내장 미들웨어를 제공합니다. 이 기능의 구현에는, 비밀번호 확인 화면을 보여주는 라우트와, 비밀번호를 검증하고 사용자를 의도한 위치로 보내는 라우트, 총 두 개를 정의해야 합니다.

> [!NOTE]
> 아래에서 소개하는 방법은 라라벨의 비밀번호 확인 기능 자체를 직접 통합하는 방법입니다. 보다 빠르게 시작하고 싶다면, [라라벨 애플리케이션 스타터 키트](/docs/starter-kits)에 이미 해당 기능이 포함되어 있습니다.

<a name="password-confirmation-configuration"></a>
### 설정

비밀번호를 한 번 확인하면, 사용자는 3시간 동안 같은 비밀번호를 다시 확인하지 않아도 됩니다. 하지만, 사용자마다 비밀번호 재인증을 요구하는 주기를 변경하려면, `config/auth.php`의 `password_timeout` 값을 변경하면 됩니다.

<a name="password-confirmation-routing"></a>
### 라우팅

<a name="the-password-confirmation-form"></a>
#### 비밀번호 확인 폼

먼저, 사용자가 비밀번호를 입력하도록 요청하는 뷰를 보여주는 라우트를 정의합니다:

```php
Route::get('/confirm-password', function () {
    return view('auth.confirm-password');
})->middleware('auth')->name('password.confirm');
```

이 라우트에서 반환하는 뷰에는 `password` 필드를 가진 입력 폼이 있어야 하며, 사용자가 애플리케이션의 보호된 영역에 접근하기 위해 비밀번호를 확인 중임을 안내하는 문구를 포함하면 좋습니다.

<a name="confirming-the-password"></a>
#### 비밀번호 확인 처리

다음으로, "비밀번호 확인" 뷰에서 제출한 폼을 처리하는 라우트를 정의합니다. 이 라우트에서는 입력된 비밀번호의 유효성을 검사하고, 사용자를 원하는 위치로 리다이렉트합니다:

```php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Redirect;

Route::post('/confirm-password', function (Request $request) {
    if (! Hash::check($request->password, $request->user()->password)) {
        return back()->withErrors([
            'password' => ['The provided password does not match our records.']
        ]);
    }

    $request->session()->passwordConfirmed();

    return redirect()->intended();
})->middleware(['auth', 'throttle:6,1']);
```

이 라우트를 조금 더 자세히 살펴보면, 먼저 요청의 `password` 필드 값이 실제로 현재 인증된 사용자의 비밀번호와 맞는지 확인합니다. 비밀번호가 올바르다면, 라라벨 세션에 사용자가 방금 비밀번호를 확인했다는 정보를 남깁니다. `passwordConfirmed` 메서드는 세션에 해당 정보를 저장하는데, 라라벨은 이 값을 바탕으로 사용자가 마지막으로 비밀번호를 확인한 시점을 판단합니다. 마지막으로, 사용자를 원래 가려던 위치로 리다이렉트합니다.

<a name="password-confirmation-protecting-routes"></a>
### 라우트 보호하기

비밀번호 재확인이 필요한 액션을 수행하는 라우트에는 반드시 `password.confirm` 미들웨어를 붙여주세요. 이 미들웨어는 라라벨 기본 설치에 포함되어 있으며, 사용자가 비밀번호를 확인하자마자 원래 가려던 위치로 리다이렉트할 수 있도록 해당 정보를 세션에 자동 저장합니다. 이후, 미들웨어가 사용자를 `password.confirm` [네임드 라우트](/docs/routing#named-routes)로 리다이렉트합니다:

```php
Route::get('/settings', function () {
    // ...
})->middleware(['password.confirm']);

Route::post('/settings', function () {
    // ...
})->middleware(['password.confirm']);
```

<a name="adding-custom-guards"></a>
## 사용자 정의 가드 추가

`Auth` 파사드의 `extend` 메서드를 이용하면 나만의 인증 가드를 직접 정의할 수 있습니다. 이 코드는 보통 [서비스 프로바이더](/docs/providers) 내에서 작성합니다. 라라벨에는 이미 `AppServiceProvider`가 있으니, 여기에 코드를 추가하면 됩니다:

```php
<?php

namespace App\Providers;

use App\Services\Auth\JwtGuard;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    // ...

    /**
     * 애플리케이션 서비스 부트스트랩
     */
    public function boot(): void
    {
        Auth::extend('jwt', function (Application $app, string $name, array $config) {
            // Illuminate\Contracts\Auth\Guard 인스턴스 반환

            return new JwtGuard(Auth::createUserProvider($config['provider']));
        });
    }
}
```

위 예시에서 보듯, `extend` 메서드에 넘기는 콜백은 반드시 `Illuminate\Contracts\Auth\Guard` 구현체를 반환해야 합니다. 이 인터페이스에는 커스텀 가드를 만드려면 구현해야 하는 메서드가 있습니다. 사용자 정의 가드를 정의했다면, 이를 `auth.php` 설정 파일의 `guards` 항목에서 참조하면 됩니다:

```php
'guards' => [
    'api' => [
        'driver' => 'jwt',
        'provider' => 'users',
    ],
],
```

<a name="closure-request-guards"></a>
### 클로저 요청 가드

HTTP 요청 기반의 커스텀 인증 시스템을 가장 간단하게 구현하는 방법은 `Auth::viaRequest` 메서드를 활용하는 것입니다. 이 메서드는 클로저 하나로 인증 과정을 신속하게 정의할 수 있게 해줍니다.

사용법은, 애플리케이션의 `AppServiceProvider`의 `boot` 메서드에서 `Auth::viaRequest`를 호출하면 됩니다. 첫 번째 인수로는 커스텀 가드 이름(아무 문자열 가능)을, 두 번째 인수로는 요청을 받아 인증에 성공하면 사용자 인스턴스를, 실패하면 `null`을 반환하는 클로저를 넘기면 됩니다:

```php
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * 애플리케이션 서비스 부트스트랩
 */
public function boot(): void
{
    Auth::viaRequest('custom-token', function (Request $request) {
        return User::where('token', (string) $request->token)->first();
    });
}
```

이렇게 커스텀 인증 드라이버를 정의했으면, 이제 `auth.php` 설정 파일의 `guards` 항목에서 드라이버로 참조할 수 있습니다:

```php
'guards' => [
    'api' => [
        'driver' => 'custom-token',
    ],
],
```

마지막 단계로, 해당 가드 이름을 사용해 인증 미들웨어를 라우트에 연결하면 됩니다:

```php
Route::middleware('auth:api')->group(function () {
    // ...
});
```

<a name="adding-custom-user-providers"></a>
## 사용자 정의 사용자 제공자 추가

만약 기존의 관계형 데이터베이스가 아닌 다른 방식(예: NoSQL 등)으로 사용자를 저장한다면, 라라벨을 확장해 사용자 정의 User Provider를 구현해야 합니다. 이를 위해 `Auth` 파사드의 `provider` 메서드를 활용해 사용자 정의 프로바이더를 등록합니다. 이때 리졸버 함수는 `Illuminate\Contracts\Auth\UserProvider` 인터페이스의 구현체를 반환해야 합니다:

```php
<?php

namespace App\Providers;

use App\Extensions\MongoUserProvider;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    // ...

    /**
     * 애플리케이션 서비스 부트스트랩
     */
    public function boot(): void
    {
        Auth::provider('mongo', function (Application $app, array $config) {
            // Illuminate\Contracts\Auth\UserProvider 인스턴스 반환

            return new MongoUserProvider($app->make('mongo.connection'));
        });
    }
}
```

이렇게 provider를 등록했다면, 이제 `auth.php` 설정 파일에서 새 드라이버를 사용하는 provider를 정의합니다:

```php
'providers' => [
    'users' => [
        'driver' => 'mongo',
    ],
],
```

마지막으로, 이 provider를 `guards` 항목에서 참조할 수 있습니다:

```php
'guards' => [
    'web' => [
        'driver' => 'session',
        'provider' => 'users',
    ],
],
```

<a name="the-user-provider-contract"></a>
### User Provider 계약

`Illuminate\Contracts\Auth\UserProvider` 구현체는, MySQL, MongoDB 등 다양한 영속적 저장소에서 `Illuminate\Contracts\Auth\Authenticatable` 구현 객체(인증 사용자 객체)를 가져오는 역할을 합니다. 이 두 인터페이스 덕분에, 사용자 데이터가 어디에 저장되고 어떤 클래스로 표현되더라도 라라벨 인증 시스템의 동작에는 변화가 없습니다.

다음은 `Illuminate\Contracts\Auth\UserProvider` 계약입니다:

```php
<?php

namespace Illuminate\Contracts\Auth;

interface UserProvider
{
    public function retrieveById($identifier);
    public function retrieveByToken($identifier, $token);
    public function updateRememberToken(Authenticatable $user, $token);
    public function retrieveByCredentials(array $credentials);
    public function validateCredentials(Authenticatable $user, array $credentials);
    public function rehashPasswordIfRequired(Authenticatable $user, array $credentials, bool $force = false);
}
```

- `retrieveById`: 보통 사용자의 키(예: MySQL의 auto_increment ID 등)를 받아 해당 사용자를 찾고 반환합니다.
- `retrieveByToken`: 고유 `$identifier`와 "로그인 상태 유지" `$token`을 받아 사용자를 찾습니다(주로 `remember_token` 컬럼).
- `updateRememberToken`: `$user` 인스턴스의 `remember_token`을 새 `$token`으로 업데이트합니다. "로그인 상태 유지" 인증이나 로그아웃 시 새로운 토큰이 발급됩니다.
- `retrieveByCredentials`: `Auth::attempt` 메서드에 전달된 credentials 배열을 받아, 조건에 맞는 사용자를 저장소에서 쿼리해 가져옵니다. (예: `$credentials['username']`이 일치하는 사용자) 이 메서드는 **비밀번호 검증/인증은 하지 않습니다.**
- `validateCredentials`: 주어진 `$user`와 `$credentials`를 비교해 인증을 수행합니다. 보통 `Hash::check`로 비밀번호 해시를 비교하고 인증이 성공하면 `true`, 아니면 `false`를 반환합니다.
- `rehashPasswordIfRequired`: 필요하거나 지원되는 경우, 해당 `$user`의 비밀번호를 재해시합니다. 보통 `Hash::needsRehash`로 필요 여부를 판단하고, 필요하다면 `Hash::make`로 재해시 후 데이터 저장소에 사용자 정보를 업데이트합니다.

<a name="the-authenticatable-contract"></a>
### Authenticatable 계약

UserProvider의 각 메서드를 살펴보았으니, 이제 `Authenticatable` 계약(인터페이스)도 함께 살펴보겠습니다. UserProvider에서 `retrieveById`, `retrieveByToken`, `retrieveByCredentials` 메서드는 이 인터페이스를 구현한 객체를 반환해야 합니다:

```php
<?php

namespace Illuminate\Contracts\Auth;

interface Authenticatable
{
    public function getAuthIdentifierName();
    public function getAuthIdentifier();
    public function getAuthPasswordName();
    public function getAuthPassword();
    public function getRememberToken();
    public function setRememberToken($value);
    public function getRememberTokenName();
}
```

이 인터페이스는 단순합니다.  
- `getAuthIdentifierName`: 사용자의 "기본키" 컬럼명을 반환합니다.
- `getAuthIdentifier`: 실제 기본키 값을 반환합니다(MySQL이라면 보통 자동 증가 id 값).
- `getAuthPasswordName`: 비밀번호 컬럼명을 반환합니다.
- `getAuthPassword`: 해시된 비밀번호 값을 반환합니다.
- `getRememberToken`/`setRememberToken`: 리멤버 토큰(remember_token) 값의 조회/설정.
- `getRememberTokenName`: remember_token 컬럼명 반환.

이 인터페이스 덕분에, 사용자를 어떤 저장 방식을 쓰든, 어떤 ORM/저장 추상화 레이어든 관계없이 인증 시스템이 동작할 수 있습니다. 기본적으로 라라벨에는 `app/Models` 폴더에 이 인터페이스를 구현하는 `App\Models\User` 클래스가 포함되어 있습니다.

<a name="automatic-password-rehashing"></a>
## 자동 비밀번호 재해시

라라벨은 기본적으로 bcrypt 해싱 알고리즘을 사용해 비밀번호를 저장합니다. bcrypt의 "작업 인자(work factor)"는 `config/hashing.php` 설정 파일 또는 환경 변수 `BCRYPT_ROUNDS`로 조절할 수 있습니다.

보통 시간이 지날수록 CPU/GPU 성능이 좋아지므로, bcrypt의 작업 인자도 높여 보안을 강화하는 것이 좋습니다. 만약 bcrypt 작업 인자 값을 높이면, 기존에 저장된 비밀번호가 인증될 때 라라벨이 자동으로 재해시를 수행합니다. 스타터 키트 기반 인증, 또는 [사용자 수동 인증](#authenticating-users)에서 `attempt` 메서드를 사용할 때 마다 이런 재해시가 자동 적용됩니다.

이런 자동 재해싱이 애플리케이션 구동에 영향을 주는 경우, 아래처럼 `hashing` 설정 파일을 퍼블리시 후 끌 수 있습니다:

```shell
php artisan config:publish hashing
```

설정 파일에서 `rehash_on_login` 값을 `false`로 지정하세요:

```php
'rehash_on_login' => false,
```

<a name="events"></a>
## 이벤트

라라벨은 인증 과정에서 다양한 [이벤트](/docs/events)를 디스패치합니다. 아래 이벤트 각각에 대해 [리스너를 정의](/docs/events)해 사용할 수 있습니다:

<div class="overflow-auto">

| 이벤트 이름 |
| --- |
| `Illuminate\Auth\Events\Registered` |
| `Illuminate\Auth\Events\Attempting` |
| `Illuminate\Auth\Events\Authenticated` |
| `Illuminate\Auth\Events\Login` |
| `Illuminate\Auth\Events\Failed` |
| `Illuminate\Auth\Events\Validated` |
| `Illuminate\Auth\Events\Verified` |
| `Illuminate\Auth\Events\Logout` |
| `Illuminate\Auth\Events\CurrentDeviceLogout` |
| `Illuminate\Auth\Events\OtherDeviceLogout` |
| `Illuminate\Auth\Events\Lockout` |
| `Illuminate\Auth\Events\PasswordReset` |

</div>