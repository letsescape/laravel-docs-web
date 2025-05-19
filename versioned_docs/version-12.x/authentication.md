# 인증 (Authentication)

- [소개](#introduction)
    - [스타터 킷](#starter-kits)
    - [데이터베이스 고려 사항](#introduction-database-considerations)
    - [에코시스템 개요](#ecosystem-overview)
- [인증 빠른 시작](#authentication-quickstart)
    - [스타터 킷 설치](#install-a-starter-kit)
    - [인증된 사용자 가져오기](#retrieving-the-authenticated-user)
    - [라우트 보호하기](#protecting-routes)
    - [로그인 제한(Throttling)](#login-throttling)
- [사용자 수동 인증](#authenticating-users)
    - [사용자 기억하기](#remembering-users)
    - [기타 인증 방법](#other-authentication-methods)
- [HTTP Basic 인증](#http-basic-authentication)
    - [Stateless HTTP Basic 인증](#stateless-http-basic-authentication)
- [로그아웃](#logging-out)
    - [다른 기기에서의 세션 무효화](#invalidating-sessions-on-other-devices)
- [비밀번호 확인](#password-confirmation)
    - [설정](#password-confirmation-configuration)
    - [라우팅](#password-confirmation-routing)
    - [라우트 보호하기](#password-confirmation-protecting-routes)
- [커스텀 가드 추가](#adding-custom-guards)
    - [클로저 요청 가드](#closure-request-guards)
- [커스텀 사용자 제공자 추가](#adding-custom-user-providers)
    - [User Provider 계약](#the-user-provider-contract)
    - [Authenticatable 계약](#the-authenticatable-contract)
- [자동 비밀번호 재해싱](#automatic-password-rehashing)
- [소셜 인증](/docs/12.x/socialite)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

많은 웹 애플리케이션에서는 사용자가 애플리케이션에 인증하고 "로그인"할 수 있는 방법을 제공합니다. 이런 인증 기능을 웹 애플리케이션에 구현하는 것은 복잡하고 보안상 위험 요소가 될 수 있습니다. 그래서 라라벨은 빠르고 안전하며 쉽게 인증 기능을 구현할 수 있도록 다양한 도구를 제공합니다.

라라벨 인증 시스템의 핵심은 "가드(guard)"와 "프로바이더(provider)"로 구성됩니다. 가드는 각 요청마다 사용자를 어떻게 인증할지 정의합니다. 예를 들어, 라라벨에는 세션 저장소와 쿠키를 사용하여 상태를 관리하는 `session` 가드가 기본 제공됩니다.

프로바이더는 영속 저장소(예: 데이터베이스)에서 사용자를 어떻게 가져올지 정의합니다. 라라벨은 [Eloquent](/docs/12.x/eloquent)와 데이터베이스 쿼리 빌더를 이용한 사용자 조회를 기본 지원합니다. 필요하다면 직접 원하는 프로바이더를 추가로 정의할 수도 있습니다.

애플리케이션의 인증 관련 설정 파일은 `config/auth.php`에 있습니다. 이 파일에는 라라벨 인증 서비스를 조정할 수 있는 여러 잘 설명된 옵션들이 포함되어 있습니다.

> [!NOTE]
> 가드와 프로바이더는 "역할(roles)"이나 "권한(permissions)"과 혼동하지 않아야 합니다. 권한을 통한 사용자 액션 인가(authorization)에 대해 더 알고 싶다면 [인가(authorization)](/docs/12.x/authorization) 문서를 참고하세요.

<a name="starter-kits"></a>
### 스타터 킷

빠르게 시작하고 싶으신가요? 새로 설치한 라라벨 애플리케이션에 [라라벨 애플리케이션 스타터 킷](/docs/12.x/starter-kits)을 설치해 보세요. 데이터베이스 마이그레이션을 마친 후, 브라우저에서 `/register` 또는 애플리케이션에 할당된 다른 URL로 접속하면, 스타터 킷이 전체 인증 시스템을 자동으로 구성해줍니다!

**최종적으로 실제 라라벨 애플리케이션에서는 스타터 킷을 사용하지 않을 예정이더라도, [스타터 킷](/docs/12.x/starter-kits)을 한 번 설치해보면 라라벨의 인증 기능을 실제 프로젝트에서 어떻게 구현하는지 배울 수 있는 좋은 기회가 됩니다.** 스타터 킷에는 인증 컨트롤러, 라우트, 뷰가 모두 포함되어 있으니, 이 파일들의 코드를 직접 확인하면서 라라벨 인증 기능이 어떻게 적용되는지 학습할 수 있습니다.

<a name="introduction-database-considerations"></a>
### 데이터베이스 고려 사항

라라벨에는 기본적으로 `app/Models` 디렉터리 안에 `App\Models\User` [Eloquent 모델](/docs/12.x/eloquent)이 포함되어 있습니다. 이 모델은 기본 Eloquent 인증 드라이버에서 사용할 수 있습니다.

만약 애플리케이션에서 Eloquent를 사용하지 않는다면, 라라벨 쿼리 빌더를 사용하는 `database` 인증 프로바이더를 활용할 수 있습니다. MongoDB를 사용하는 경우라면, MongoDB 공식 [라라벨 사용자 인증 문서](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/user-authentication/)를 참고하세요.

`App\Models\User` 모델을 위한 데이터베이스 스키마를 구성할 때, 비밀번호 컬럼의 길이가 최소 60자 이상이어야 합니다. 참고로, 신규 라라벨 애플리케이션에 포함된 기본 `users` 테이블 마이그레이션에는 이미 이 조건을 충족하는 컬럼이 생성되어 있습니다.

또한, `users` (또는 이에 해당하는) 테이블에는 길이 100자의 nullable 문자열 컬럼인 `remember_token`이 반드시 있어야 합니다. 이 컬럼은 로그인 시 "로그인 상태 유지" 옵션을 선택한 사용자의 토큰을 저장하는 데 사용합니다. 역시 라라벨 기본 애플리케이션의 `users` 테이블 마이그레이션에는 이미 이 컬럼이 포함되어 있습니다.

<a name="ecosystem-overview"></a>
### 에코시스템 개요

라라벨은 인증과 관련된 여러 패키지를 제공합니다. 본격적으로 인증 기능을 살펴보기 전에, 라라벨에서 제공하는 인증 에코시스템 전반을 간단히 살펴보고 각 패키지의 역할에 대해 설명합니다.

먼저 인증이 어떻게 작동하는지 생각해봅시다. 일반적으로 사용자는 웹 브라우저를 통해 로그인 폼에 사용자명과 비밀번호를 입력합니다. 입력된 정보가 맞으면, 애플리케이션은 인증된 사용자 정보를 [세션](/docs/12.x/session)에 저장합니다. 브라우저에는 세션 ID가 담긴 쿠키가 발급되어, 이후의 모든 요청에서 사용자가 올바른 세션과 매핑됩니다. 세션 쿠키를 받은 후에는 애플리케이션이 세션 ID를 통해 세션 데이터를 조회하고, 인증 정보가 저장되어 있음을 확인하면 해당 사용자를 "인증됨" 상태로 간주합니다.

원격 서비스가 API에 접근하려고 할 때는, 브라우저가 없기 때문에 쿠키를 통한 인증이 일반적으로 사용되지 않습니다. 대신, 원격 서비스는 매번 API 요청 시 API 토큰을 함께 보내고, 애플리케이션에서는 이 토큰을 유효한 토큰 목록과 비교하여 요청이 올바른 사용자에 의해 이루어진 것인지를 확인해 "인증"합니다.

<a name="laravels-built-in-browser-authentication-services"></a>
#### 라라벨 내장 브라우저 인증 서비스

라라벨에는 기본으로 제공되는 인증 및 세션 서비스가 있으며, 일반적으로 `Auth`와 `Session` 파사드를 통해 사용할 수 있습니다. 이 기능들은 웹 브라우저에서 발생하는 요청에 대해 쿠키 기반의 인증을 제공합니다. 사용자의 자격 증명을 확인하고 인증하는 여러 메서드를 사용할 수 있으며, 인증에 성공하면 자동으로 사용자 세션에 인증 정보를 저장하고 세션 쿠키를 발급합니다. 이 서비스의 활용 방법은 본 문서 전체에 자세히 설명되어 있습니다.

**애플리케이션 스타터 킷**

이 문서에서 다루고 있듯, 직접 인증 서비스를 조작해서 애플리케이션에 커스텀 인증 계층을 만들 수도 있습니다. 하지만 좀 더 빠르고 간편한 시작을 원한다면 [무료 스타터 킷](/docs/12.x/starter-kits)을 사용해서 인증 레이어 전체를 쉽게 구축할 수 있습니다.

<a name="laravels-api-authentication-services"></a>
#### 라라벨 API 인증 서비스

라라벨에서 API 토큰 관리와 토큰 인증 요청을 도와주는 추가 패키지로 [Passport](/docs/12.x/passport)와 [Sanctum](/docs/12.x/sanctum)이 있습니다. 이 라이브러리들과 라라벨의 내장 쿠키 기반 인증은 상호 배타적이지 않습니다. 즉, 내장 인증은 브라우저 인증에, 이 패키지들은 주로 API 토큰 인증에 중점을 둡니다. 많은 애플리케이션에서 이 둘을 함께 사용합니다.

**Passport**

Passport는 OAuth2 인증 제공자로, 다양한 OAuth2 "grant type"을 지원하며 여러 종류의 토큰을 발급할 수 있습니다. 강력하고 복잡한 API 인증 기능이 필요하다면 적합합니다. 하지만 대부분의 애플리케이션에서는 OAuth2 스펙에서 제공하는 복잡한 기능까지는 필요 없는 경우가 많아, 개발자와 사용자 모두에게 혼란을 줄 수 있습니다. 실제로 SPA(싱글 페이지 애플리케이션)나 모바일 앱에서의 인증 구현 방식 때문에 혼란을 겪는 경우가 많았습니다.

**Sanctum**

OAuth2의 복잡성과 개발자 혼란을 해소하기 위해, 라라벨은 훨씬 단순하고 가벼운 패키지인 [Laravel Sanctum](/docs/12.x/sanctum)을 만들었습니다. Sanctum은 웹 UI와 API를 모두 제공하는 애플리케이션, 백엔드와 분리된 SPA, 또는 모바일 앱을 지원하는 경우에 특히 추천하는 인증 패키지입니다.

Sanctum은 웹과 API 인증을 하나로 통합해서 관리할 수 있게 도와주는 하이브리드 패키지입니다. 요청이 도착하면, Sanctum은 우선 세션 쿠키를 확인해 인증된 세션이 있는지 체크합니다(이 과정에서 앞서 설명한 라라벨 내장 인증 서비스를 사용합니다). 만약 세션 쿠키로 인증되지 않으면, 요청 내에 API 토큰이 있는지 검사하고, 토큰이 있다면 그 토큰으로 인증합니다. 이 과정이 궁금하다면 Sanctum의 ["작동 방식"](/docs/12.x/sanctum#how-it-works) 문서를 참고하세요.

<a name="summary-choosing-your-stack"></a>
#### 요약 및 인증 스택 선택 가이드

정리하자면, 브라우저에서 접근하는 모놀리식 라라벨 애플리케이션을 개발 중인 경우에는 라라벨의 내장 인증 서비스를 사용하면 충분합니다.

API를 외부에 제공하는 경우에는 [Passport](/docs/12.x/passport)나 [Sanctum](/docs/12.x/sanctum) 가운데 선택하여 API 토큰 인증을 구현합니다. 일반적으로는 간단하고 완전한 솔루션인 Sanctum을 우선 고려하는 것을 추천합니다. 이 패키지는 API 인증, SPA 인증, 모바일 인증까지 지원하며, "스코프"나 "권한(abilities)"도 관리할 수 있습니다.

라라벨 백엔드를 사용하는 SPA를 만드는 경우라면 [Laravel Sanctum](/docs/12.x/sanctum)을 사용해야 합니다. Sanctum을 사용할 때는 [백엔드에 인증 라우트를 직접 구현](#authenticating-users)하거나, 또는 [Laravel Fortify](/docs/12.x/fortify)를 헤드리스 인증 백엔드 서비스로 활용하여 회원가입, 비밀번호 재설정, 이메일 인증 등 다양한 라우트와 컨트롤러를 쉽게 추가할 수도 있습니다.

OAuth2 모든 기능이 반드시 필요한 경우라면 Passport를 선택하세요.

빠르게 시작하고 싶다면, [라라벨 애플리케이션 스타터 킷](/docs/12.x/starter-kits)을 사용하여, 라라벨 내장 인증 스택이 적용된 형태로 새 프로젝트를 시작할 수 있습니다.

<a name="authentication-quickstart"></a>
## 인증 빠른 시작

> [!WARNING]
> 이 부분에서는 [라라벨 애플리케이션 스타터 킷](/docs/12.x/starter-kits)으로 사용자 인증을 빠르게 구현하는 방법을 설명합니다. 직접 인증 시스템과 직접 연동하고 싶다면 [사용자 수동 인증](#authenticating-users) 문서를 참고하세요.

<a name="install-a-starter-kit"></a>
### 스타터 킷 설치

가장 먼저, [라라벨 애플리케이션 스타터 킷](/docs/12.x/starter-kits)을 설치해야 합니다. 스타터 킷은 새 라라벨 프로젝트에 인증 기능을 적용하기 위한 구조(스캐폴딩)와 아름답게 디자인된 UI를 제공합니다.

<a name="retrieving-the-authenticated-user"></a>
### 인증된 사용자 가져오기

스타터 킷으로 애플리케이션을 만들고 사용자들이 회원가입하거나 인증을 마쳤다면, 현재 인증된 사용자와 자주 상호작용하게 됩니다. 요청을 처리하는 중이라면 `Auth` 파사드의 `user` 메서드를 이용해 인증된 사용자를 가져올 수 있습니다.

```php
use Illuminate\Support\Facades\Auth;

// 현재 인증된 사용자 인스턴스를 가져옵니다...
$user = Auth::user();

// 현재 인증된 사용자의 ID를 가져옵니다...
$id = Auth::id();
```

혹은 사용자가 인증되었다면, 컨트롤러 메서드 내에서 `Illuminate\Http\Request` 인스턴스를 통해 사용자 정보를 얻을 수도 있습니다. 라라벨에서는 타입 힌트가 지정된 클래스가 자동으로 컨트롤러 메서드에 주입되므로, `Illuminate\Http\Request`를 타입힌트하면 요청 객체의 `user` 메서드를 통해 어느 컨트롤러 메서드에서도 인증된 사용자에 쉽게 접근할 수 있습니다.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class FlightController extends Controller
{
    /**
     * 기존 항공편 정보를 업데이트합니다.
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

들어오는 HTTP 요청의 사용자가 인증되어 있는지 확인하려면, `Auth` 파사드의 `check` 메서드를 사용할 수 있습니다. 이 메서드는 사용자가 인증된 경우 `true`를 반환합니다.

```php
use Illuminate\Support\Facades\Auth;

if (Auth::check()) {
    // 사용자가 로그인되어 있습니다...
}
```

> [!NOTE]
> `check` 메서드로 인증 여부를 판별할 수 있지만, 실제로는 특정 라우트나 컨트롤러에 접근 전에 인증 상태를 미들웨어로 검사하는 것이 더 일반적입니다. 자세한 내용은 [라우트 보호하기](/docs/12.x/authentication#protecting-routes) 문서를 참고하세요.

<a name="protecting-routes"></a>
### 라우트 보호하기

[라우트 미들웨어](/docs/12.x/middleware)를 활용해, 인증된 사용자만 특정 라우트에 접근할 수 있도록 설정할 수 있습니다. 라라벨에는 `auth` 미들웨어가 기본 제공되며, 이는 `Illuminate\Auth\Middleware\Authenticate` 클래스에 대한 [미들웨어 별칭](/docs/12.x/middleware#middleware-aliases)입니다. 이 미들웨어는 라라벨에서 내부적으로 이미 별칭이 지정되어 있으므로, 라우트 정의 시 미들웨어만 붙여주면 됩니다.

```php
Route::get('/flights', function () {
    // 인증된 사용자만 이 라우트에 접근할 수 있습니다...
})->middleware('auth');
```

<a name="redirecting-unauthenticated-users"></a>
#### 인증되지 않은 사용자 리디렉션

`auth` 미들웨어가 인증되지 않은 사용자를 감지하면, 해당 사용자를 `login` [네임드 라우트](/docs/12.x/routing#named-routes)로 리디렉션합니다. 이 동작은 애플리케이션의 `bootstrap/app.php` 파일에서 `redirectGuestsTo` 메서드를 사용해 변경할 수 있습니다.

```php
use Illuminate\Http\Request;

->withMiddleware(function (Middleware $middleware) {
    $middleware->redirectGuestsTo('/login');

    // 클로저(익명 함수)를 사용하는 방법...
    $middleware->redirectGuestsTo(fn (Request $request) => route('login'));
})
```

<a name="redirecting-authenticated-users"></a>
#### 인증된 사용자 리디렉션

`guest` 미들웨어가 인증된 사용자를 감지하면, 해당 사용자를 `dashboard` 또는 `home` 네임드 라우트로 리디렉션합니다. 이 동작 역시 `redirectUsersTo` 메서드를 사용해 변경할 수 있습니다.

```php
use Illuminate\Http\Request;

->withMiddleware(function (Middleware $middleware) {
    $middleware->redirectUsersTo('/panel');

    // 클로저(익명 함수)를 사용하는 방법...
    $middleware->redirectUsersTo(fn (Request $request) => route('panel'));
})
```

<a name="specifying-a-guard"></a>
#### 특정 가드 지정하기

라우트에 `auth` 미들웨어를 적용할 때, 인증에 사용할 "가드"를 함께 지정할 수도 있습니다. 지정하는 가드명은 `auth.php` 설정 파일의 `guards` 배열 중 하나여야 합니다.

```php
Route::get('/flights', function () {
    // 인증된 사용자만 이 라우트에 접근할 수 있습니다...
})->middleware('auth:admin');
```

<a name="login-throttling"></a>
### 로그인 제한(Throttling)

[애플리케이션 스타터 킷](/docs/12.x/starter-kits)을 사용하는 경우, 로그인 시도가 일정 횟수 이상 실패하면 자동으로 속도 제한이 적용됩니다. 기본적으로 여러 번 잘못 입력하면 사용자는 1분 동안 로그인할 수 없습니다. 이 제한은 사용자의 사용자명/이메일 주소와 IP 주소를 기준으로 적용됩니다.

> [!NOTE]
> 애플리케이션 내 다른 라우트에서도 속도 제한(Throttle)을 적용하고 싶다면, [속도 제한 문서](/docs/12.x/routing#rate-limiting)를 참고하세요.

<a name="authenticating-users"></a>
## 사용자 수동 인증

라라벨의 [애플리케이션 스타터 킷](/docs/12.x/starter-kits)이 제공하는 인증 스캐폴딩을 반드시 사용해야 하는 것은 아닙니다. 만약 해당 스캐폴딩을 쓰지 않기를 결정했다면, 라라벨 인증 클래스를 직접 활용해서 사용자 인증을 관리할 수 있습니다. 걱정하지 마세요. 매우 쉽습니다!

라라벨 인증 서비스는 `Auth` [파사드](/docs/12.x/facades)를 통해 사용할 수 있으므로, 사용하기 전에 꼭 해당 파사드를 클래스 상단에서 임포트해야 합니다. 그다음, `attempt` 메서드를 살펴보겠습니다. 이 메서드는 보통 애플리케이션의 "로그인" 폼에서 인증 처리를 할 때 사용합니다. 인증이 성공하면, [세션 고정(Session Fixation)](https://en.wikipedia.org/wiki/Session_fixation)을 막기 위해 반드시 사용자의 [세션](/docs/12.x/session)을 재생성해야 합니다.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    /**
     * 인증 시도를 처리합니다.
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

`attempt` 메서드는 첫 번째 인수로 키-값 쌍의 배열을 받습니다. 배열의 값들은 사용자 데이터베이스 테이블에서 사용자를 찾는 데 사용됩니다. 예를 들어 위 코드에서는 `email` 컬럼의 값으로 사용자를 찾습니다. 사용자가 발견되면, 데이터베이스에 저장된 해시 비밀번호와 요청으로 전달된 `password` 값을 비교합니다. 이때 요청에서 받은 `password`를 직접 해시 처리할 필요는 없습니다. 프레임워크가 내부적으로 해싱 후, 데이터베이스의 해시와 비교합니다. 두 해시가 일치할 경우 사용자에게 인증 세션이 시작됩니다.

참고로, 라라벨 인증 서비스는 가드의 "프로바이더" 설정에 따라 데이터베이스에서 사용자를 조회합니다. 기본 `config/auth.php` 파일에서는 Eloquent 사용자 프로바이더가 지정되어 있고, 사용자 조회 시 `App\Models\User` 모델을 사용하라고 되어 있습니다. 애플리케이션 요구에 따라 이 설정을 자유롭게 변경할 수 있습니다.

`attempt` 메서드는 인증에 성공하면 `true`를 반환하며, 실패하면 `false`를 반환합니다.

라라벨에서 제공하는 redirector의 `intended` 메서드는, 인증 미들웨어에 의해 차단되기 전 원래 접근하려 했던 URL로 사용자를 리디렉션합니다. 원하는 URI를 전달하면, 접근 불가할 때 대체 경로로 리디렉션할 수도 있습니다.

<a name="specifying-additional-conditions"></a>
#### 추가 조건 지정하기

필요에 따라, 이메일과 비밀번호 외에 추가 쿼리 조건을 인증 쿼리에 더할 수도 있습니다. 이 경우 간단히 추가 조건을 배열에 넣어서 `attempt` 메서드에 전달하면 됩니다. 예를 들어, 사용자가 "active" 상태여야 인증을 허용하려면 다음과 같이 할 수 있습니다.

```php
if (Auth::attempt(['email' => $email, 'password' => $password, 'active' => 1])) {
    // 인증 성공...
}
```

복잡한 쿼리 조건이 필요하다면, 크리덴셜 배열에 클로저(익명 함수)를 추가할 수 있습니다. 이 클로저는 쿼리 인스턴스를 받아, 애플리케이션 필요에 따라 쿼리를 커스터마이즈할 수 있습니다.

```php
use Illuminate\Database\Eloquent\Builder;

if (Auth::attempt([
    'email' => $email,
    'password' => $password,
    fn (Builder $query) => $query->has('activeSubscription'),
])) {
    // 인증 성공...
}
```

> [!WARNING]
> 위 예제에서 `email`은 필수 옵션이 아니며, 단지 예시를 들기 위해 사용한 것입니다. 데이터베이스에서 사용자명으로 사용하는 컬럼명을 자유롭게 사용하세요.

좀 더 복잡한 조건 검증이 필요하다면, 두 번째 인수로 클로저를 받는 `attemptWhen` 메서드를 사용할 수 있습니다. 이 클로저는 인증 대상 사용자를 받아 `true` 또는 `false`를 반환해야 하며, 해당 사용자가 인증되어야 하는지 추가로 체크할 수 있습니다.

```php
if (Auth::attemptWhen([
    'email' => $email,
    'password' => $password,
], function (User $user) {
    return $user->isNotBanned();
})) {
    // 인증 성공...
}
```

<a name="accessing-specific-guard-instances"></a>
#### 특정 가드 인스턴스에 접근하기

`Auth` 파사드의 `guard` 메서드를 사용하면, 인증 시 사용할 가드 인스턴스를 직접 지정할 수 있습니다. 이를 통해 애플리케이션의 여러 영역에서 완전히 별도의 사용자 모델이나 테이블로 각각 인증 처리를 할 수 있습니다.

`guard` 메서드에 전달하는 가드명은 `auth.php` 설정 파일에서 이미 정의된 가드 중 하나여야 합니다.

```php
if (Auth::guard('admin')->attempt($credentials)) {
    // ...
}
```

<a name="remembering-users"></a>
### 사용자 기억하기("로그인 상태 유지")

대부분의 웹 애플리케이션에서는 로그인 폼에 "로그인 상태 기억하기" 체크박스가 있습니다. 애플리케이션에서 이 기능을 제공하려면 `attempt` 메서드의 두 번째 인수로 불린 값을 전달하세요.

이 값이 `true`이면, 라라벨은 사용자가 직접 로그아웃하기 전까지 인증 상태를 유지합니다. 이 기능을 쓰려면 `users` 테이블에 `remember_token` 문자열 컬럼(100자)이 반드시 있어야 하며, 기본 라라벨 앱에는 이미 포함되어 있습니다.

```php
use Illuminate\Support\Facades\Auth;

if (Auth::attempt(['email' => $email, 'password' => $password], $remember)) {
    // 사용자가 로그인 상태를 유지하도록 처리됨...
}
```

애플리케이션에서 "로그인 상태 유지" 기능을 제공할 경우, 현재 인증된 사용자가 이 기능으로 인증된 것인지 확인하려면 `viaRemember` 메서드를 사용하세요.

```php
use Illuminate\Support\Facades\Auth;

if (Auth::viaRemember()) {
    // ...
}
```

<a name="other-authentication-methods"></a>
### 기타 인증 방법

<a name="authenticate-a-user-instance"></a>
#### 사용자 인스턴스 직접 인증

이미 존재하는 사용자 인스턴스를 현재 인증된 사용자로 지정하고 싶다면, 해당 인스턴스를 `Auth` 파사드의 `login` 메서드에 전달하면 됩니다. 전달하는 사용자 인스턴스는 반드시 `Illuminate\Contracts\Auth\Authenticatable` [계약(Contract)](/docs/12.x/contracts)을 구현해야 합니다. 라라벨의 기본 `App\Models\User` 모델은 이미 이 인터페이스를 구현하고 있습니다. 이 방식은, 사용자가 회원가입 직후 이미 유효한 사용자 인스턴스를 갖고 있을 때 유용합니다.

```php
use Illuminate\Support\Facades\Auth;

Auth::login($user);
```

`login` 메서드의 두 번째 인수로 불린 값을 전달하여 "로그인 상태 유지" 기능을 적용할 수도 있습니다. 이때에도 사용자가 로그아웃할 때까지 인증이 유지됩니다.

```php
Auth::login($user, $remember = true);
```

필요하다면 `login` 호출 전에 인증에 사용할 가드를 지정할 수도 있습니다.

```php
Auth::guard('admin')->login($user);
```

<a name="authenticate-a-user-by-id"></a>
#### 사용자 ID로 인증

데이터베이스 레코드의 기본 키(primary key) 값을 사용해 사용자를 인증하려면, `loginUsingId` 메서드를 사용할 수 있습니다. 이 메서드는 인증하려는 사용자의 PK 값을 인수로 받습니다.

```php
Auth::loginUsingId(1);
```

`loginUsingId`의 `remember` 인수에 불린 값을 전달하여 "로그인 상태 유지" 기능을 활성화할 수도 있습니다.

```php
Auth::loginUsingId(1, remember: true);
```

<a name="authenticate-a-user-once"></a>
#### 1회성 인증

`once` 메서드를 사용하면, 세션이나 쿠키 없이 단 한 번의 요청에 한해 사용자를 인증할 수 있습니다.

```php
if (Auth::once($credentials)) {
    // ...
}
```

<a name="http-basic-authentication"></a>
## HTTP Basic 인증

[HTTP Basic 인증](https://en.wikipedia.org/wiki/Basic_access_authentication)은 별도의 로그인 페이지 없이도 빠르게 사용자 인증 기능을 구현하는 방법입니다. 시작하려면, `auth.basic` [미들웨어](/docs/12.x/middleware)를 라우트에 붙이면 됩니다. `auth.basic` 미들웨어는 라라벨 프레임워크에 기본 내장되어 있으므로 별도 정의가 필요하지 않습니다.

```php
Route::get('/profile', function () {
    // 인증된 사용자만 이 라우트에 접근할 수 있습니다...
})->middleware('auth.basic');
```

이 미들웨어를 라우트에 붙이면, 해당 라우트로 접속 시 브라우저에서 자동으로 자격 증명(계정 정보) 입력 창이 뜨게 됩니다. 기본적으로 `auth.basic` 미들웨어는 `users` 데이터베이스 테이블의 `email` 컬럼을 사용자명으로 간주합니다.

<a name="a-note-on-fastcgi"></a>
#### FastCGI 관련 참고 사항

PHP FastCGI와 Apache로 라라벨 앱을 서비스할 경우, HTTP Basic 인증이 정상 동작하지 않을 수 있습니다. 이 문제를 해결하려면, `.htaccess` 파일에 다음 줄을 추가하세요.

```apache
RewriteCond %{HTTP:Authorization} ^(.+)$
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
```

<a name="stateless-http-basic-authentication"></a>
### Stateless HTTP Basic 인증

세션에 사용자 식별 쿠키를 저장하지 않고 HTTP Basic 인증을 구현할 수도 있습니다. 주로 API 요청에 HTTP 인증을 사용할 때 유용합니다. 이를 위해 [미들웨어를 정의](/docs/12.x/middleware)하여 `onceBasic` 메서드를 호출하면 됩니다. 이 메서드가 별도의 응답을 반환하지 않으면 요청이 다음 단계로 전달됩니다.

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
     * 들어오는 요청을 처리합니다.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        return Auth::onceBasic() ?: $next($request);
    }

}
```

이제 미들웨어를 라우트에 붙이면 됩니다.

```php
Route::get('/api/user', function () {
    // 인증된 사용자만 이 라우트에 접근할 수 있습니다...
})->middleware(AuthenticateOnceWithBasicAuth::class);
```

<a name="logging-out"></a>
## 로그아웃

애플리케이션에서 사용자를 수동으로 로그아웃시키려면, `Auth` 파사드의 `logout` 메서드를 사용하면 됩니다. 이렇게 하면 사용자의 세션에서 인증 정보가 제거되어, 이후의 요청에서는 인증이 유지되지 않습니다.

추가로, `logout` 메서드 호출 후에 사용자의 세션을 무효화하고 새로운 [CSRF 토큰](/docs/12.x/csrf)을 재생성하는 것이 좋습니다. 로그아웃 처리 후에는 보통 루트(`/`)로 리디렉션합니다.

```php
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

/**
 * 사용자를 애플리케이션에서 로그아웃합니다.
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
### 다른 기기에서의 세션 무효화

라라벨은 사용자가 현재 사용 중인 기기를 제외한 다른 모든 기기의 세션을 무효화하고 로그아웃시키는 기능도 제공합니다. 이 기능은 주로 사용자가 비밀번호를 변경하거나 업데이트할 때, 현재 기기 세션은 유지한 채 다른 기기에서의 세션만 무효화하고 싶을 때 유용합니다.

시작 전, 해당 라우트에 `Illuminate\Session\Middleware\AuthenticateSession` 미들웨어가 포함되어 있는지 확인해야 합니다. 보통 이 미들웨어는 라우트 그룹에 등록하여 애플리케이션의 대부분 라우트에 적용합니다. 기본적으로 `AuthenticateSession` 미들웨어는 `auth.session` [미들웨어 별칭](/docs/12.x/middleware#middleware-aliases)으로 라우트에 붙일 수 있습니다.

```php
Route::middleware(['auth', 'auth.session'])->group(function () {
    Route::get('/', function () {
        // ...
    });
});
```

그리고 나서, `Auth` 파사드가 제공하는 `logoutOtherDevices` 메서드를 사용할 수 있습니다. 이 메서드는 사용자가 현재 비밀번호를 입력해 인증하는 과정을 요구하므로, 해당 값을 받아올 수 있는 입력 폼이 필요합니다.

```php
use Illuminate\Support\Facades\Auth;

Auth::logoutOtherDevices($currentPassword);
```

`logoutOtherDevices` 메서드를 호출하면, 사용자의 다른 기기에서의 세션이 모두 무효화되어, 이전에 인증된 모든 가드에서 로그아웃 처리됩니다.

<a name="password-confirmation"></a>
## 비밀번호 확인

애플리케이션을 만들다 보면, 사용자가 중요한 작업을 수행하거나 민감한 영역에 접근하기 전에, 비밀번호를 다시 한 번 확인하도록 요구해야 할 때가 있습니다. 라라벨은 이러한 과정을 쉽게 구현할 수 있도록 기본 미들웨어를 제공합니다. 이 기능을 구현하려면, 비밀번호 입력 폼을 보여주는 라우트와 비밀번호를 확인하고 사용자를 원래 목적지로 리디렉션하는 라우트, 두 개가 필요합니다.

> [!NOTE]
> 아래 문서는 라라벨의 비밀번호 확인 기능을 직접 연동하는 방법을 설명합니다. 더 빠르게 시작하고 싶다면, [라라벨 애플리케이션 스타터 킷](/docs/12.x/starter-kits)에서 이 기능을 기본 제공합니다!

<a name="password-confirmation-configuration"></a>
### 설정

사용자가 비밀번호를 확인하면, 기본적으로 3시간 동안은 다시 비밀번호를 묻지 않습니다. 하지만 이 시간이 너무 짧거나 길게 느껴진다면, `config/auth.php` 설정 파일에서 `password_timeout` 값을 변경해 재확인 시점을 조정할 수 있습니다.

<a name="password-confirmation-routing"></a>
### 라우팅

<a name="the-password-confirmation-form"></a>
#### 비밀번호 확인 폼

먼저, 사용자가 비밀번호를 다시 입력하도록 요청하는 뷰를 반환하는 라우트를 정의해야 합니다.

```php
Route::get('/confirm-password', function () {
    return view('auth.confirm-password');
})->middleware('auth')->name('password.confirm');
```

예상할 수 있듯, 이 라우트가 반환하는 뷰에는 반드시 `password` 입력 필드가 포함된 폼이 있어야 합니다. 또한, 이 영역이 보호된 구역임을 안내하는 내용이나, 왜 비밀번호 확인이 필요한지를 설명하는 텍스트도 포함해주면 좋습니다.

<a name="confirming-the-password"></a>

#### 비밀번호 확인

다음으로, "비밀번호 확인" 뷰에서 폼 요청을 처리하는 라우트를 정의하겠습니다. 이 라우트는 비밀번호를 검증하고, 사용자를 원래 이동하려던 위치로 리다이렉트하는 역할을 합니다.

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

다음 단계로 넘어가기 전에, 이 라우트의 동작을 좀 더 자세히 살펴보겠습니다. 먼저, 요청에서 전달된 `password` 필드가 실제로 인증된 사용자의 비밀번호와 일치하는지 확인합니다. 비밀번호가 일치하면 사용자가 비밀번호를 확인했다는 사실을 라라벨의 세션에 알려야 합니다. `passwordConfirmed` 메서드는 사용자의 세션에 타임스탬프를 저장하며, 라라벨은 이를 통해 사용자가 마지막으로 비밀번호를 확인한 시점을 판단할 수 있습니다. 마지막으로, 사용자는 자신이 원래 이동하려던 위치로 리다이렉트됩니다.

<a name="password-confirmation-protecting-routes"></a>
### 라우트 보호하기

비밀번호를 최근에 다시 확인해야 하는 작업이 포함된 라우트라면 반드시 `password.confirm` 미들웨어를 할당해야 합니다. 이 미들웨어는 라라벨의 기본 설치에 포함되어 있으며, 사용자가 비밀번호를 확인한 뒤 원래 이동하고자 했던 경로로 리다이렉트될 수 있도록 의도한 목적지를 자동으로 세션에 저장합니다. 그 후, 이 미들웨어는 사용자를 `password.confirm` [네임드 라우트](/docs/12.x/routing#named-routes)로 리다이렉트합니다.

```php
Route::get('/settings', function () {
    // ...
})->middleware(['password.confirm']);

Route::post('/settings', function () {
    // ...
})->middleware(['password.confirm']);
```

<a name="adding-custom-guards"></a>
## 커스텀 가드 추가하기

`Auth` 퍼사드의 `extend` 메서드를 사용해 자신만의 인증 가드를 정의할 수 있습니다. 보통 [`service provider`](/docs/12.x/providers) 내부에서 `extend` 메서드를 호출해야 합니다. 라라벨에는 기본적으로 `AppServiceProvider`가 포함되어 있으므로, 여기에 코드를 추가할 수 있습니다.

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
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Auth::extend('jwt', function (Application $app, string $name, array $config) {
            // Return an instance of Illuminate\Contracts\Auth\Guard...

            return new JwtGuard(Auth::createUserProvider($config['provider']));
        });
    }
}
```

위 예제에서 볼 수 있듯, `extend` 메서드에 전달되는 콜백은 `Illuminate\Contracts\Auth\Guard` 구현체를 반환해야 합니다. 이 인터페이스에는 커스텀 가드 정의를 위해 구현해야 하는 몇 가지 메서드가 포함되어 있습니다. 커스텀 가드를 정의한 후에는, `auth.php` 설정 파일의 `guards` 설정에서 해당 가드를 지정할 수 있습니다.

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

HTTP 요청 기반의 커스텀 인증 시스템을 가장 간단하게 구현하는 방법은 `Auth::viaRequest` 메서드를 이용하는 것입니다. 이 메서드를 사용하면 단일 클로저로 인증 프로세스를 빠르게 정의할 수 있습니다.

먼저, 애플리케이션의 `AppServiceProvider`의 `boot` 메서드에서 `Auth::viaRequest`를 호출하면 됩니다. `viaRequest` 메서드의 첫 번째 인자는 인증 드라이버의 이름이며, 이 이름은 커스텀 가드를 설명하는 임의의 문자열이면 충분합니다. 두 번째 인자는 들어오는 HTTP 요청을 받아 사용자 인스턴스를 반환하거나 인증에 실패했을 경우 `null`을 반환하는 클로저입니다.

```php
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Auth::viaRequest('custom-token', function (Request $request) {
        return User::where('token', (string) $request->token)->first();
    });
}
```

이렇게 커스텀 인증 드라이버를 등록했다면, `auth.php` 설정 파일의 `guards` 설정에서 해당 드라이버를 지정할 수 있습니다.

```php
'guards' => [
    'api' => [
        'driver' => 'custom-token',
    ],
],
```

마지막으로, 해당 가드를 미들웨어로 사용하여 라우트에 지정할 수 있습니다.

```php
Route::middleware('auth:api')->group(function () {
    // ...
});
```

<a name="adding-custom-user-providers"></a>
## 커스텀 사용자 공급자(User Provider) 추가하기

사용자 정보를 전통적인 관계형 데이터베이스가 아닌 다른 곳에 저장한다면, 라라벨의 인증 시스템에 맞는 자체적인 사용자 공급자를 추가해야 합니다. 이 작업은 `Auth` 퍼사드의 `provider` 메서드를 사용해서 구현할 수 있습니다. 사용자 공급자 리졸버는 `Illuminate\Contracts\Auth\UserProvider`를 구현해야 합니다.

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
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Auth::provider('mongo', function (Application $app, array $config) {
            // Return an instance of Illuminate\Contracts\Auth\UserProvider...

            return new MongoUserProvider($app->make('mongo.connection'));
        });
    }
}
```

`provider` 메서드로 공급자를 등록하면, `auth.php` 설정 파일에서 새로 추가한 공급자를 사용할 수 있습니다. 먼저, 새로운 드라이버를 사용하는 `provider`를 정의하세요.

```php
'providers' => [
    'users' => [
        'driver' => 'mongo',
    ],
],
```

마지막으로, `guards` 설정에 이 공급자를 참조할 수 있습니다.

```php
'guards' => [
    'web' => [
        'driver' => 'session',
        'provider' => 'users',
    ],
],
```

<a name="the-user-provider-contract"></a>
### User Provider 계약(Contract)

`Illuminate\Contracts\Auth\UserProvider` 구현체는 `Illuminate\Contracts\Auth\Authenticatable` 구현체를 MySQL, MongoDB 등과 같은 영속성 저장소로부터 가져오는 역할을 합니다. 이 두 인터페이스 덕분에 사용자 데이터가 어디에 저장되어 있든, 그리고 어떤 클래스가 인증된 사용자를 표현하든지 라라벨 인증 메커니즘은 일관되게 동작합니다.

`Illuminate\Contracts\Auth\UserProvider` 계약(Contract)을 살펴보겠습니다.

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

`retrieveById` 함수는 일반적으로 사용자를 표현하는 키(예: MySQL 데이터베이스의 자동증가 ID)를 인수로 받아, 해당 ID에 일치하는 `Authenticatable` 구현체를 찾아 반환해야 합니다.

`retrieveByToken` 함수는 고유한 `$identifier`와 "remember me" `$token` 값으로 사용자를 찾아 반환합니다. 보통 이 토큰은 데이터베이스의 `remember_token` 컬럼에 저장됩니다. 이 메서드 역시 해당 토큰 값과 일치하는 `Authenticatable` 구현체를 반환해야 합니다.

`updateRememberToken` 메서드는 `$user` 인스턴스의 `remember_token`을 새로운 `$token` 값으로 업데이트합니다. "로그인 유지" 인증 시도가 성공했거나 사용자가 로그아웃할 때 새 토큰이 할당됩니다.

`retrieveByCredentials` 메서드는 애플리케이션에서 인증을 시도할 때 `Auth::attempt` 메서드에 전달된 크리덴셜 배열을 받습니다. 이 메서드에서는 이 크리덴셜에 해당하는 사용자를 기초 저장소에서 "쿼리"해서 반환해야 합니다. 일반적으로는 `where` 조건절로 `$credentials['username']`에 해당하는 사용자 레코드를 조회하는 방식이며, 이 또한 `Authenticatable` 구현체를 반환해야 합니다. **이 메서드는 비밀번호 검증이나 인증을 시도해서는 안 됩니다.**

`validateCredentials` 메서드는 전달된 `$user`와 `$credentials`를 비교해 사용자를 인증합니다. 예를 들어, 이 메서드는 주로 `Hash::check` 메서드를 사용해 `$user->getAuthPassword()` 값과 `$credentials['password']` 값을 비교합니다. 이 메서드는 비밀번호가 유효한지 여부를 나타내는 `true` 또는 `false`를 반환해야 합니다.

`rehashPasswordIfRequired` 메서드는 필요하다면(그리고 지원한다면) 전달된 `$user`의 비밀번호를 재해시해야 합니다. 보통, 이 메서드는 `Hash::needsRehash` 메서드를 사용해 `$credentials['password']` 값의 재해시 필요 여부를 결정합니다. 비밀번호의 재해시가 필요하다면, `Hash::make` 메서드로 해시를 새로 생성한 후 사용자의 기록을 백엔드 저장소에서 업데이트해야 합니다.

<a name="the-authenticatable-contract"></a>
### Authenticatable 계약(Contract)

이제 `UserProvider`의 각 메서드를 살펴봤으니, 이제 `Authenticatable` 계약을 살펴보겠습니다. 앞서 언급했듯이, 사용자 공급자는 `retrieveById`, `retrieveByToken`, `retrieveByCredentials` 메서드에서 이 인터페이스의 구현체를 반환해야 합니다.

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

이 인터페이스는 구조가 단순합니다. `getAuthIdentifierName` 메서드는 사용자의 "프라이머리 키" 컬럼명을 반환하고, `getAuthIdentifier` 메서드는 해당 사용자의 실제 "프라이머리 키" 값을 반환해야 합니다. MySQL을 사용하는 경우, 일반적으로 사용자 레코드에 자동 할당되는 오토 인크리먼트 프라이머리 키가 여기에 해당합니다. `getAuthPasswordName` 메서드는 사용자의 비밀번호 컬럼명을, `getAuthPassword` 메서드는 사용자의 해시된 비밀번호 값을 반환합니다.

이 인터페이스 덕분에 인증 시스템은 ORM이나 스토리지 추상화 계층이 무엇이든 상관없이 어떤 "user" 클래스와도 작동할 수 있습니다. 라라벨에는 기본적으로 이 인터페이스를 구현한 `App\Models\User` 클래스가 `app/Models` 디렉터리에 포함되어 있습니다.

<a name="automatic-password-rehashing"></a>
## 비밀번호 자동 재해시

라라벨은 기본적으로 bcrypt 알고리즘을 사용해 비밀번호를 해시합니다. bcrypt 해시에서 "워크 팩터"는 애플리케이션의 `config/hashing.php` 설정 파일이나 `BCRYPT_ROUNDS` 환경 변수에서 조정할 수 있습니다.

일반적으로, CPU 및 GPU 성능이 향상됨에 따라 bcrypt의 워크 팩터는 점차 높여가는 것이 권장됩니다. 애플리케이션에서 bcrypt 워크 팩터를 높게 설정할 경우, 라라벨은 스타터 킷을 이용해 사용자가 인증할 때 또는 [`attempt` 메서드로 직접 인증을 수행할 때](#authenticating-users) 비밀번호를 손쉽게 그리고 자동으로 재해시합니다.

비밀번호 자동 재해시 기능은 대개 애플리케이션의 동작에 영향을 주지 않습니다. 그러나 이 동작을 원하지 않는 경우, `hashing` 설정 파일을 퍼블리시해서 비활성화할 수 있습니다.

```shell
php artisan config:publish hashing
```

설정 파일을 퍼블리시 한 후에는 `rehash_on_login` 설정 값을 `false`로 지정하면 됩니다.

```php
'rehash_on_login' => false,
```

<a name="events"></a>
## 이벤트

라라벨은 인증 과정 중 다양한 [이벤트](/docs/12.x/events)를 발생시킵니다. 다음 이벤트들에 대해 [리스너를 정의](/docs/12.x/events)할 수 있습니다.

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