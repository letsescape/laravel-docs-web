# 인증 (Authentication)

- [소개](#introduction)
    - [스타터 키트](#starter-kits)
    - [데이터베이스 고려 사항](#introduction-database-considerations)
    - [에코시스템 개요](#ecosystem-overview)
- [인증 빠르게 시작하기](#authentication-quickstart)
    - [스타터 키트 설치](#install-a-starter-kit)
    - [인증된 사용자 조회](#retrieving-the-authenticated-user)
    - [라우트 보호](#protecting-routes)
    - [로그인 시도 제한](#login-throttling)
- [사용자 수동 인증](#authenticating-users)
    - [사용자 기억하기](#remembering-users)
    - [기타 인증 방식](#other-authentication-methods)
- [HTTP 베이직 인증](#http-basic-authentication)
    - [상태 비저장 HTTP 베이직 인증](#stateless-http-basic-authentication)
- [로그아웃](#logging-out)
    - [다른 기기에서의 세션 무효화](#invalidating-sessions-on-other-devices)
- [비밀번호 재확인](#password-confirmation)
    - [설정](#password-confirmation-configuration)
    - [라우팅](#password-confirmation-routing)
    - [라우트 보호](#password-confirmation-protecting-routes)
- [커스텀 가드 추가하기](#adding-custom-guards)
    - [클로저 기반 요청 가드](#closure-request-guards)
- [커스텀 사용자 프로바이더 추가하기](#adding-custom-user-providers)
    - [User Provider 계약](#the-user-provider-contract)
    - [Authenticatable 계약](#the-authenticatable-contract)
- [소셜 인증](/docs/9.x/socialite)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

많은 웹 애플리케이션은 사용자가 애플리케이션에 인증하고 "로그인"할 수 있는 방식을 제공합니다. 이러한 기능을 구현하는 것은 복잡하고 잠재적으로 위험할 수 있기 때문에, 라라벨은 인증을 빠르고, 안전하며, 쉽게 구현할 수 있도록 필요한 도구를 제공합니다.

라라벨의 인증의 핵심은 "가드(guard)"와 "프로바이더(provider)"로 구성됩니다. 가드는 각 요청마다 사용자를 어떻게 인증할지 정의합니다. 예를 들어, 라라벨에는 session 저장소와 쿠키를 사용하여 상태를 유지하는 `session` 가드가 내장되어 있습니다.

프로바이더는 영구 저장소에서 사용자를 어떻게 조회할지 정의합니다. 라라벨에서는 기본적으로 [Eloquent](/docs/9.x/eloquent)와 데이터베이스 쿼리 빌더를 통해 사용자를 조회하는 프로바이더가 제공됩니다. 필요하다면 자신만의 프로바이더를 추가할 수도 있습니다.

애플리케이션의 인증 설정 파일은 `config/auth.php`에 위치합니다. 이 파일에는 라라벨의 인증 서비스 동작을 조정할 수 있는 여러 옵션이 잘 설명되어 있습니다.

> [!NOTE]
> 가드와 프로바이더는 "권한(roles)"과 "퍼미션(permissions)" 개념과는 다릅니다. 권한을 기반으로 사용자 액션을 인가하는 방법에 대해서는 [인가(authorization)](/docs/9.x/authorization) 문서를 참고하세요.

<a name="starter-kits"></a>
### 스타터 키트

빠르게 시작하고 싶으신가요? 새 라라벨 애플리케이션에서 [라라벨 애플리케이션 스타터 키트](/docs/9.x/starter-kits)를 설치해 보세요. 데이터베이스 마이그레이션 후, 웹 브라우저에서 `/register`나 애플리케이션 전용 라우트에 접속하면 됩니다. 스타터 키트는 인증 시스템 전체의 기본 구조를 자동으로 만들어 줍니다!

**최종적으로 스타터 키트를 사용하지 않을 계획이더라도, [Laravel Breeze](/docs/9.x/starter-kits#laravel-breeze) 스타터 키트를 설치해보면 실제 라라벨 프로젝트에 인증 기능을 직접 구현하는 방법을 배울 수 있습니다.** Breeze는 인증 컨트롤러, 라우트, 뷰 파일을 자동으로 생성해주기 때문에 그 코드들을 살펴보며 라라벨에서 인증 기능이 어떻게 동작하는지 쉽게 이해할 수 있습니다.

<a name="introduction-database-considerations"></a>
### 데이터베이스 고려 사항

라라벨은 기본적으로 `app/Models` 디렉터리에 `App\Models\User` [Eloquent 모델](/docs/9.x/eloquent)을 포함하고 있습니다. 이 모델은 기본 Eloquent 인증 드라이버와 함께 사용할 수 있습니다. 만약 Eloquent를 사용하지 않는 경우, 라라벨 쿼리 빌더를 사용하는 `database` 인증 프로바이더를 이용하세요.

`App\Models\User` 모델에 맞는 데이터베이스 스키마를 설계할 때는 반드시 비밀번호 컬럼의 길이가 최소 60자 이상이어야 합니다. 다행히도, 새롭게 생성되는 라라벨 앱에 포함된 기본 `users` 테이블 마이그레이션은 이보다 더 넉넉한 길이의 컬럼을 생성합니다.

또한, `users` (또는 해당 역할의) 테이블에는 100자 크기의 nullable string 타입인 `remember_token` 컬럼이 있어야 합니다. 이 컬럼은 "로그인 상태 유지(remember me)"를 선택한 사용자를 위한 토큰을 저장하는 데 사용됩니다. 역시, 라라벨의 기본 `users` 테이블 마이그레이션에 이미 포함되어 있습니다.

<a name="ecosystem-overview"></a>
### 에코시스템 개요

라라벨은 인증과 관련된 몇 가지 패키지를 제공합니다. 본격적으로 시작하기 전에, 라라벨의 인증 에코시스템을 간단히 살펴보고 각 패키지의 목적을 안내하겠습니다.

먼저, 인증이 어떻게 동작하는지 생각해봅시다. 사용자가 웹 브라우저를 통해 아이디와 비밀번호를 로그인 폼에 입력하면, 인증에 성공하면 해당 사용자의 정보가 [세션](/docs/9.x/session)에 저장됩니다. 이때 세션 ID가 담긴 쿠키가 브라우저에 발급되어 이후의 요청마다 애플리케이션이 해당 사용자를 정확히 식별할 수 있게 됩니다. 세션 쿠키를 받은 뒤, 애플리케이션은 ID로 세션 데이터를 조회해서 인증 정보를 확인하고 사용자를 "인증됨" 상태로 처리합니다.

원격 서비스에서 애플리케이션의 API에 접근하기 위해 인증이 필요한 경우, 일반적으로 웹 브라우저가 없으므로 쿠키를 직접 사용할 수 없습니다. 대신 원격 서비스는 각 요청마다 API 토큰을 전송하며, 애플리케이션은 들어온 토큰을 저장된 토큰과 비교, 해당 토큰에 연결된 사용자를 인증하게 됩니다.

<a name="laravels-built-in-browser-authentication-services"></a>
#### 라라벨의 내장 브라우저 인증 서비스

라라벨은 기본적으로 인증과 세션 서비스를 제공하며, 보통 `Auth`와 `Session` 파사드를 통해 사용합니다. 이러한 기능은 웹 브라우저에서 발생하는 요청에 대해 쿠키 기반 인증을 제공합니다. 사용자의 자격 정보를 확인하고 인증할 수 있는 여러 메서드를 내장하고 있으며, 인증된 정보는 자동으로 세션에 저장되고, 세션 쿠키를 발급합니다. 이 문서에서는 이러한 서비스들의 사용법을 안내합니다.

**애플리케이션 스타터 키트**

이 문서에서 설명하는 것처럼, 인증 서비스를 직접 사용하여 나만의 인증 레이어를 구현할 수도 있습니다. 하지만 빠르게 시작하려면 전체 인증 레이어의 견고하고 현대적인 스캐폴딩을 제공하는 [무료 패키지들](/docs/9.x/starter-kits)을 사용하는 것이 좋습니다. 대표적으로 [Laravel Breeze](/docs/9.x/starter-kits#laravel-breeze), [Laravel Jetstream](/docs/9.x/starter-kits#laravel-jetstream), 그리고 [Laravel Fortify](/docs/9.x/fortify) 패키지가 준비되어 있습니다.

_Laravel Breeze_는 로그인, 회원가입, 비밀번호 재설정, 이메일 인증, 비밀번호 재확인 등, 라라벨 인증의 주요 기능을 간결하게 구현한 패키지입니다. Breeze의 뷰 레이어는 [Blade 템플릿](/docs/9.x/blade)과 [Tailwind CSS](https://tailwindcss.com)로 구성되어 있습니다. 자세한 내용은 [애플리케이션 스타터 키트 문서](/docs/9.x/starter-kits)를 참고하세요.

_Laravel Fortify_는 인증 백엔드만 제공하는 헤드리스(headless) 패키지로, 이 문서에 설명된 기능(쿠키 기반 인증, 2단계 인증, 이메일 인증 등)을 구현합니다. Fortify는 [Laravel Jetstream](/docs/9.x/starter-kits#laravel-jetstream)의 인증 백엔드이기도 하며, [Laravel Sanctum](/docs/9.x/sanctum)과 조합하면 SPA(싱글 페이지 애플리케이션) 인증 백엔드로도 사용할 수 있습니다.

_[Laravel Jetstream](https://jetstream.laravel.com)_은 Tailwind CSS, [Livewire](https://laravel-livewire.com), 그리고 [Inertia](https://inertiajs.com)로 만들어진 아름답고 현대적인 UI와 Fortify 인증을 통합 제공합니다. Jetstream은 2단계 인증, 팀, 브라우저 세션 관리, 프로필 관리, [Laravel Sanctum](/docs/9.x/sanctum)으로 API 토큰 인증 등 다양한 기능을 선택적으로 제공합니다. 라라벨의 API 인증은 아래에서 별도로 다룹니다.

<a name="laravels-api-authentication-services"></a>
#### 라라벨의 API 인증 서비스

라라벨은 API 토큰 관리를 돕는 두 가지 패키지, [Passport](/docs/9.x/passport)와 [Sanctum](/docs/9.x/sanctum)을 제공합니다. 참고로 이 라이브러리들은 라라벨에 내장된 쿠키 기반 인증 시스템과 함께 사용할 수 있습니다. 이 패키지들은 주로 API 토큰 인증을, 내장 인증 서비스는 쿠키 기반 브라우저 인증을 담당합니다. 실무에는 종종 라라벨의 내장 인증 서비스와 API 인증 패키지 중 하나를 함께 사용하는 경우가 많습니다.

**Passport**

Passport는 OAuth2 인증 공급자 역할을 하며, 여러 OAuth2 "그랜트 타입"을 제공합니다. 이는 API 인증에 robust하고 복잡한 솔루션이지만, 실제로 대부분의 애플리케이션에서는 OAuth2 사양의 복잡한 기능이 필요하지 않습니다. 또한, SPA나 모바일 앱에서 OAuth2와 Passport를 이용한 인증이 다소 어렵거나 혼란스러울 수 있습니다.

**Sanctum**

OAuth2의 복잡함과 개발자들이 경험한 혼란을 해결하고자, 웹 브라우저 기반의 1st-party 요청과 API 토큰 기반 요청을 모두 간단하게 처리할 수 있는 인증 패키지인 [Laravel Sanctum](/docs/9.x/sanctum)을 만들게 되었습니다. API와 웹 UI를 모두 제공하거나, SPA(싱글 페이지 애플리케이션)가 백엔드 라라벨과 분리되어 있거나 모바일 클라이언트를 지원하는 경우에 가장 적합한 인증 패키지입니다.

Sanctum은 웹/API 인증을 모두 아우르는 하이브리드 패키지입니다. Sanctum을 사용하는 애플리케이션은 요청이 들어오면 우선 세션 쿠키가 존재하는지 확인하여 인증된 세션인가를 확인합니다(이 과정에서 앞서 설명한 라라벨 내장 인증 서비스가 사용됨). 세션 쿠키가 없으면 API 토큰이 첨부되어 있는지도 확인해, 있다면 그 토큰을 인증에 사용합니다. 자세한 내용은 Sanctum의 ["how it works"](/docs/9.x/sanctum#how-it-works) 문서를 참고하세요.

Sanctum은 [Laravel Jetstream](https://jetstream.laravel.com)에서도 기본적으로 포함되어 있으며, 많은 웹 애플리케이션의 다양한 인증 요구에 가장 잘 어울리는 솔루션입니다.

<a name="summary-choosing-your-stack"></a>
#### 요약 및 스택 선택 가이드

정리하자면, 브라우저를 사용해 접근하는 모놀리식 라라벨 애플리케이션을 만든다면 내장 인증 서비스를 사용하면 됩니다.

외부에서 API로 접근하는 경우라면, [Passport](/docs/9.x/passport) 혹은 [Sanctum](/docs/9.x/sanctum) 중 하나를 선택해 API 토큰 인증 기능을 도입하세요. 특별한 OAuth2 스펙의 모든 기능이 꼭 필요한 경우가 아니면, 대부분은 추가 설정이 간편하고 완결성 있는 Sanctum이 더 적합합니다("scopes" 및 "abilities"도 지원함).

Laravel 백엔드를 사용하는 SPA를 개발한다면, [Laravel Sanctum](/docs/9.x/sanctum)을 선택해야 합니다. Sanctum 사용 시에는 [인증 라우트와 컨트롤러를 직접 구현](#authenticating-users)하거나, [Laravel Fortify](/docs/9.x/fortify)를 도입해 헤드리스 인증 백엔드(회원가입, 비밀번호 재설정, 이메일 인증 등)를 사용할 수 있습니다.

OAuth2의 모든 정교한 기능이 꼭 필요하다면 Passport를 선택하세요.

빠르게 시작하고 싶다면, [Laravel Breeze](/docs/9.x/starter-kits#laravel-breeze)로 바로 시작해서 내장 인증 서비스와 Sanctum이 모두 적용된 스타킹 상태의 새로운 라라벨 앱을 만들 것을 추천합니다.

<a name="authentication-quickstart"></a>
## 인증 빠르게 시작하기

> [!WARNING]
> 이 부분은 [라라벨 애플리케이션 스타터 키트](/docs/9.x/starter-kits)를 통한 인증 시스템 구축 방법(UI 스캐폴딩 포함)을 안내합니다. 인증 시스템과 직접 연동하고 싶으신 경우, [수동으로 사용자 인증하기](#authenticating-users) 문서를 참고하세요.

<a name="install-a-starter-kit"></a>
### 스타터 키트 설치

먼저, [라라벨 애플리케이션 스타터 키트](/docs/9.x/starter-kits)를 설치해야 합니다. 최신 스타터 키트인 Laravel Breeze와 Laravel Jetstream은 인증 기능을 손쉽게 포함할 수 있도록 아름답게 디자인된 출발점을 제공합니다.

Laravel Breeze는 로그인, 회원가입, 비밀번호 재설정, 이메일 인증, 비밀번호 재확인 등 라라벨 인증의 모든 항목을 미니멀하고 간단하게 구현한 패키지입니다. Breeze의 뷰 레이어는 [Blade 템플릿](/docs/9.x/blade)과 [Tailwind CSS](https://tailwindcss.com)로 꾸며져 있으며, [Inertia](https://inertiajs.com) 기반(Vue 또는 React 활용)의 스캐폴딩도 지원합니다.

[Laravel Jetstream](https://jetstream.laravel.com)은 Breeze보다 더욱 강력한 스타터 키트로, [Livewire](https://laravel-livewire.com) 또는 [Inertia, Vue](https://inertiajs.com) 기반으로 스캐폴딩이 가능합니다. Jetstream은 2단계 인증, 팀 기능, 프로필 관리, 브라우저 세션 관리, [Laravel Sanctum](/docs/9.x/sanctum) 기반 API 지원, 계정 삭제 등 다양한 부가 기능을 선택적으로 제공합니다.

<a name="retrieving-the-authenticated-user"></a>
### 인증된 사용자 조회

인증 스타터 키트 설치 후, 사용자가 회원가입과 인증을 할 수 있게 된 다음에는, 현재 인증된 사용자와 상호작용할 일이 많습니다. 요청을 처리하면서 현재 인증된 사용자는 `Auth` 파사드의 `user` 메서드로 쉽게 조회할 수 있습니다.

```
use Illuminate\Support\Facades\Auth;

// 현재 인증된 사용자 가져오기...
$user = Auth::user();

// 현재 인증된 사용자의 ID 가져오기...
$id = Auth::id();
```

인증이 완료된 후라면, `Illuminate\Http\Request` 인스턴스를 통해서도 인증된 사용자에 접근할 수 있습니다. 컨트롤러의 메서드에서 의존성으로 `Illuminate\Http\Request` 오브젝트를 주입받으면 언제든 `user` 메서드를 통해 인증된 사용자를 조회할 수 있습니다.

```
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FlightController extends Controller
{
    /**
     * 기존 항공편의 정보를 수정합니다.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
        // $request->user()
    }
}
```

<a name="determining-if-the-current-user-is-authenticated"></a>
#### 현재 사용자가 인증되었는지 확인하기

들어오는 HTTP 요청을 보낸 사용자가 인증된 상태인지 확인하려면, `Auth` 파사드의 `check` 메서드를 사용합니다. 인증된 경우 `true`를 반환합니다.

```
use Illuminate\Support\Facades\Auth;

if (Auth::check()) {
    // 사용자가 로그인되어 있습니다...
}
```

> [!NOTE]
> 사용자가 인증되었는지 확인하려면 `check` 메서드를 쓸 수 있지만, 실제로는 보통 미들웨어를 이용해 특정 라우트나 컨트롤러 접근 전 인증 여부를 검사합니다. 관련해서는 [라우트 보호](/docs/9.x/authentication#protecting-routes) 문서를 참고하세요.

<a name="protecting-routes"></a>
### 라우트 보호

[라우트 미들웨어](/docs/9.x/middleware)를 사용하면 특정 라우트에 대해 인증된 사용자만 접근하도록 제한할 수 있습니다. 라라벨에는 `Illuminate\Auth\Middleware\Authenticate` 클래스를 참조하는 `auth` 미들웨어가 기본 등록되어 있으므로, 미들웨어를 라우트에 할당만 하면 됩니다.

```
Route::get('/flights', function () {
    // 인증된 사용자만 이 경로에 접근할 수 있습니다...
})->middleware('auth');
```

<a name="redirecting-unauthenticated-users"></a>
#### 인증되지 않은 사용자 리다이렉트

`auth` 미들웨어가 인증되지 않은 사용자를 감지하면, 기본적으로 `login` [이름 있는 라우트](/docs/9.x/routing#named-routes)로 리다이렉트합니다. 이 동작을 바꾸고 싶을 때는 `app/Http/Middleware/Authenticate.php` 파일의 `redirectTo` 함수를 수정하면 됩니다.

```
/**
 * 인증되지 않은 사용자를 리다이렉트할 경로를 반환합니다.
 *
 * @param  \Illuminate\Http\Request  $request
 * @return string
 */
protected function redirectTo($request)
{
    return route('login');
}
```

<a name="specifying-a-guard"></a>
#### 사용할 가드 지정하기

`auth` 미들웨어를 라우트에 연결할 때, 사용자를 인증할 때 사용할 "가드"를 지정할 수도 있습니다. 지정하는 값은 `auth.php` 설정 파일의 `guards` 배열에 있는 키 중 하나와 일치해야 합니다.

```
Route::get('/flights', function () {
    // admin 가드로 인증된 사용자만 접근할 수 있습니다...
})->middleware('auth:admin');
```

<a name="login-throttling"></a>
### 로그인 시도 제한

Laravel Breeze나 Laravel Jetstream [스타터 키트](/docs/9.x/starter-kits)를 사용한다면 로그인 시도에 대해 자동으로 rate limiting(시도 제한)이 적용됩니다. 기본적으로 여러 번 비밀번호/이메일을 틀리면 1분간 로그인을 시도할 수 없게 됩니다. 시도 제한은 사용자의 사용자명/이메일과 IP 주소별로 개별 적용됩니다.

> [!NOTE]
> 애플리케이션의 다른 라우트에도 시도 제한을 두고 싶다면 [rate limiting 문서](/docs/9.x/routing#rate-limiting)를 참고하세요.

<a name="authenticating-users"></a>
## 사용자 수동 인증

라라벨의 [애플리케이션 스타터 키트](/docs/9.x/starter-kits)를 반드시 사용해야 하는 것은 아닙니다. 스타터 키트를 쓰지 않는 경우, 라라벨의 인증 클래스를 직접 활용해 사용자 인증을 관리할 수 있습니다. 걱정하지 마세요, 어렵지 않습니다!

라라벨의 인증 서비스는 `Auth` [파사드](/docs/9.x/facades)를 통해 접근합니다. 먼저 클래스 상단에 `Auth` 파사드를 import하세요. 그리고 `attempt` 메서드를 살펴보겠습니다. 이 메서드는 보통 애플리케이션의 '로그인' 폼에서 인증 요청이 들어올 때 사용합니다. 인증에 성공하면 [세션](/docs/9.x/session)을 재생성하여 [세션 고착(session fixation) 공격](https://en.wikipedia.org/wiki/Session_fixation)을 방지해야 합니다.

```
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    /**
     * 인증 시도를 처리합니다.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function authenticate(Request $request)
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

`attempt` 메서드는 배열 형태의 키/값 쌍을 첫 번째 인수로 받습니다. 이 배열의 값이 데이터베이스에서 사용자를 조회하는 데 사용됩니다. 위 예시에서는 `email` 컬럼으로 사용자를 찾고, 비밀번호는 데이터베이스에 저장된 해시와 비교하게 됩니다. 직접 해시 처리할 필요 없이, 프레임워크가 요청의 `password` 입력값을 자동으로 해싱해서 비교하므로 안심해도 됩니다. 두 값이 일치하면 인증된 세션이 시작됩니다.

라라벨의 인증 서비스는 지정된 인증 가드의 "프로바이더" 설정에 따라 사용자를 조회합니다. 기본적으로는 `config/auth.php`에 Eloquent 사용자 프로바이더가 설정되어 있으며, 이 경우 `App\Models\User` 모델을 사용합니다. 애플리케이션 상황에 따라 이 값을 자유롭게 변경할 수 있습니다.

`attempt` 메서드의 반환값은 인증 성공 시 `true`, 실패 시 `false`입니다.

`intended` 메서드는 인증 미들웨어에 의해 가로채기 전 사용자가 진입하려 했던 URL로 리다이렉트해 줍니다. 만약 해당 URL이 없다면 두 번째 인자로 지정한 URI로 이동합니다.

<a name="specifying-additional-conditions"></a>
#### 추가 조건 지정하기

필요하다면, 사용자의 이메일과 비밀번호 이외에 다른 조건도 인증 쿼리에 추가할 수 있습니다. 단순히 쿼리 조건을 배열에 추가하면 됩니다. 예를 들어, 사용자가 "active"여야 인증이 가능하도록 할 수 있습니다.

```
if (Auth::attempt(['email' => $email, 'password' => $password, 'active' => 1])) {
    // 인증 성공...
}
```

더 복잡한 쿼리 조건이 필요하다면, 크레덴셜 배열 내에 클로저를 추가할 수 있습니다. 이 클로저는 쿼리 인스턴스를 인자로 받아, 애플리케이션 상황에 맞게 쿼리를 수정할 수 있습니다.

```
if (Auth::attempt([
    'email' => $email, 
    'password' => $password, 
    fn ($query) => $query->has('activeSubscription'),
])) {
    // 인증 성공...
}
```

> [!WARNING]
> 위 예시에서 `email` 컬럼을 사용하는 것은 단순한 예시일 뿐이며, 필수값이 아닙니다. 사용자의 "아이디" 역할을 하는 컬럼명으로 자유롭게 변경할 수 있습니다.

더 심화된 사용자를 검사해야 한다면, 클로저를 두 번째 인자로 받는 `attemptWhen` 메서드를 사용할 수 있습니다. 이 클로저는 사용자를 인자로 받아, 인증 가능 여부(true/false)를 반환하게 하면 됩니다.

```
if (Auth::attemptWhen([
    'email' => $email,
    'password' => $password,
], function ($user) {
    return $user->isNotBanned();
})) {
    // 인증 성공...
}
```

<a name="accessing-specific-guard-instances"></a>
#### 특정 가드 인스턴스 접근

`Auth` 파사드의 `guard` 메서드를 사용하면, 인증 시 사용할 가드 인스턴스를 지정할 수 있습니다. 이를 통해 애플리케이션의 별도 영역마다 서로 다른 인증 모델/테이블을 사용할 수도 있습니다.

가드 이름은 `auth.php` 설정 파일의 `guards` 항목 중 하나여야 합니다.

```
if (Auth::guard('admin')->attempt($credentials)) {
    // ...
}
```

<a name="remembering-users"></a>
### 사용자 기억하기

로그인 폼에 "로그인 상태 유지(remember me)" 체크박스가 구현된 경우, 두 번째 인수로 불린 값을 `attempt` 메서드에 전달하면 됩니다.

이 값이 `true`이면 사용자가 명시적으로 로그아웃할 때까지 계속 인증 상태가 유지됩니다. 이를 위해서는 `users` 테이블에 문자열 `remember_token` 컬럼이 존재해야 합니다. 신규 라라벨 앱의 테이블 마이그레이션에는 이미 포함되어 있습니다.

```
use Illuminate\Support\Facades\Auth;

if (Auth::attempt(['email' => $email, 'password' => $password], $remember)) {
    // 사용자가 로그인 상태로 유지됩니다...
}
```

"로그인 상태 유지"로 인증된 사용자 여부를 확인하려면 `viaRemember` 메서드를 사용하세요.

```
use Illuminate\Support\Facades\Auth;

if (Auth::viaRemember()) {
    // ...
}
```

<a name="other-authentication-methods"></a>
### 기타 인증 방식

<a name="authenticate-a-user-instance"></a>
#### 사용자 인스턴스를 직접 인증하기

이미 존재하는 사용자 인스턴스를 현재 인증된 사용자로 설정해야 한다면, `Auth` 파사드의 `login` 메서드에 그 인스턴스를 전달하세요. 이때 전달되는 인스턴스는 `Illuminate\Contracts\Auth\Authenticatable` [계약](/docs/9.x/contracts)을 구현해야 합니다. 라라벨의 기본 `App\Models\User` 모델은 이미 이 계약을 구현하고 있습니다. 즉, 회원가입 직후 등 이미 신뢰할 수 있는 사용자 인스턴스가 있을 때 유용합니다.

```
use Illuminate\Support\Facades\Auth;

Auth::login($user);
```

"로그인 상태 유지"를 원할 땐 두 번째 인수로 불린 값을 전달하면 됩니다. 이 경우 사용자가 직접 로그아웃할 때까지 계속 인증 상태가 유지됩니다.

```
Auth::login($user, $remember = true);
```

필요하다면, 먼저 인증 가드를 지정한 뒤 `login`을 호출할 수도 있습니다.

```
Auth::guard('admin')->login($user);
```

<a name="authenticate-a-user-by-id"></a>
#### 사용자 ID로 인증하기

데이터베이스의 주 키(primary key)로 사용자를 인증하고 싶다면 `loginUsingId` 메서드를 사용할 수 있습니다. 인수로 인증하려는 사용자의 주 키를 전달하세요.

```
Auth::loginUsingId(1);
```

두 번째 인수에 "로그인 상태 유지" 여부를 지정할 수 있습니다.

```
Auth::loginUsingId(1, $remember = true);
```

<a name="authenticate-a-user-once"></a>
#### 1회성 인증(쿠키/세션 저장 없이)

`once` 메서드를 사용하면, 세션이나 쿠키를 남기지 않고 단일 요청만 인증 상태로 처리할 수 있습니다.

```
if (Auth::once($credentials)) {
    //
}
```

<a name="http-basic-authentication"></a>
## HTTP 베이직 인증

[HTTP Basic Authentication](https://en.wikipedia.org/wiki/Basic_access_authentication)은 별도의 "로그인" 페이지 구성 없이 빠르게 사용자 인증을 구현할 수 있는 간단한 방법입니다. 사용법은 `auth.basic` [미들웨어](/docs/9.x/middleware)를 라우트에 연결하면 끝입니다. `auth.basic` 미들웨어는 라라벨에 내장되어 있으므로, 별도의 정의가 필요 없습니다.

```
Route::get('/profile', function () {
    // 인증된 사용자만 접근할 수 있습니다...
})->middleware('auth.basic');
```

이 미들웨어를 라우트에 사용할 경우 브라우저에서 해당 라우트에 접근하면 인증 정보를 입력하라는 창이 자동으로 나타납니다. 기본값으로 `users` 테이블의 `email` 컬럼이 사용자명으로 간주됩니다.

<a name="a-note-on-fastcgi"></a>
#### FastCGI 사용 시 참고사항

PHP FastCGI 및 Apache로 라라벨 앱을 서비스하는 경우, HTTP Basic 인증이 정상 동작하지 않을 수 있습니다. 이럴 때는 `.htaccess` 파일에 다음 설정을 추가하세요.

```apache
RewriteCond %{HTTP:Authorization} ^(.+)$
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
```

<a name="stateless-http-basic-authentication"></a>
### 상태 비저장 HTTP 베이직 인증

세션에 사용자 식별자를 쿠키로 기록하지 않고도 HTTP Basic 인증을 사용할 수 있습니다. 보통 API 요청을 HTTP 인증으로 처리할 때 유용합니다. 이를 위해 [커스텀 미들웨어](/docs/9.x/middleware)를 만들고, 내부에서 `onceBasic` 메서드를 활용하세요. `onceBasic`이 null을 반환할 경우, 요청을 계속 체인에 넘깁니다.

```
<?php

namespace App\Http\Middleware;

use Illuminate\Support\Facades\Auth;

class AuthenticateOnceWithBasicAuth
{
    /**
     * 들어오는 요청을 처리합니다.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, $next)
    {
        return Auth::onceBasic() ?: $next($request);
    }

}
```

이제 [라우트 미들웨어로 등록](/docs/9.x/middleware#registering-middleware)한 후, 라우트에 연결할 수 있습니다.

```
Route::get('/api/user', function () {
    // 인증된 사용자만 접근할 수 있습니다...
})->middleware('auth.basic.once');
```

<a name="logging-out"></a>
## 로그아웃

직접 사용자에게 로그아웃 기능을 제공하려면, `Auth` 파사드의 `logout` 메서드를 사용합니다. 이 메서드는 세션의 인증 정보를 제거하므로 이후 요청부터는 더 이상 인증되지 않습니다.

또한 반드시 세션을 무효화하고, [CSRF 토큰](/docs/9.x/csrf)을 재생성하는 것이 좋습니다. 로그아웃 이후에는 주로 애플리케이션 루트로 리다이렉트합니다.

```
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * 사용자를 로그아웃시킵니다.
 *
 * @param  \Illuminate\Http\Request  $request
 * @return \Illuminate\Http\Response
 */
public function logout(Request $request)
{
    Auth::logout();

    $request->session()->invalidate();

    $request->session()->regenerateToken();

    return redirect('/');
}
```

<a name="invalidating-sessions-on-other-devices"></a>
### 다른 기기에서의 세션 무효화

라라벨은 현재 기기 외의 모든 다른 기기에서 로그인된 사용자의 세션을 무효화(즉시 로그아웃)할 수 있는 기능도 제공합니다. 주로 사용자가 비밀번호를 변경하는 순간 다른 기기에서의 세션만 만료시키고, 현재 기기는 계속 인증되도록 처리할 때 쓰입니다.

우선, `Illuminate\Session\Middleware\AuthenticateSession` 미들웨어가 해당 라우트에 포함되어 있는지 확인하세요. 일반적으로 앱 대부분의 라우트에 일괄 적용할 수 있도록 라우트 그룹에 이 미들웨어를 지정하는 것이 좋습니다. 기본적으로는 `auth.session` 키로 등록되어 있으니 아래처럼 활용하면 됩니다.

```
Route::middleware(['auth', 'auth.session'])->group(function () {
    Route::get('/', function () {
        // ...
    });
});
```

이제 `Auth` 파사드의 `logoutOtherDevices` 메서드를 사용할 수 있습니다. 이 메서드는 사용자의 현재 비밀번호를 입력받아야 하며, 입력 데이터는 별도 폼 등으로 전달받아야 합니다.

```
use Illuminate\Support\Facades\Auth;

Auth::logoutOtherDevices($currentPassword);
```

`logoutOtherDevices` 메서드를 호출하면, 그 사용자로 인증된 모든 다른 세션이 강제로 만료되어, 등록된 모든 가드에서 로그아웃 처리됩니다.

<a name="password-confirmation"></a>
## 비밀번호 재확인

애플리케이션을 구축하다 보면 일부 액션이나 민감한 영역 접근 전 사용자의 비밀번호를 다시 한번 확인(재입력)해야 할 때가 있습니다. 라라벨에는 이를 쉽게 구현할 수 있도록 미들웨어가 준비되어 있습니다. 이 기능을 적용하려면, 비밀번호 재확인 화면을 보여주는 라우트와 비밀번호를 실제로 체크해주는 라우트 두 개를 만들어야 합니다.

> [!NOTE]
> 아래 내용은 직접 비밀번호 재확인 기능을 연동하는 방법을 안내합니다. 빠르게 적용하고 싶으시다면 [라라벨 애플리케이션 스타터 키트](/docs/9.x/starter-kits)들이 이 기능을 기본 지원합니다!

<a name="password-confirmation-configuration"></a>
### 설정

비밀번호를 재확인한 후 동일 사용자는 3시간 동안 다시 비밀번호를 확인하지 않아도 됩니다. 이 시간 간격은 애플리케이션의 `config/auth.php` 파일에서 `password_timeout` 값을 변경하면 설정할 수 있습니다.

<a name="password-confirmation-routing"></a>
### 라우팅

<a name="the-password-confirmation-form"></a>
#### 비밀번호 재확인 폼

먼저, 사용자에게 비밀번호 재입력을 요청하는 뷰를 보여줄 라우트를 만듭니다.

```
Route::get('/confirm-password', function () {
    return view('auth.confirm-password');
})->middleware('auth')->name('password.confirm');
```

당연히, 위 라우트가 반환하는 뷰는 `password` 필드가 포함된 폼이어야 하며, 유저가 민감 영역에 진입하기 전에 비밀번호를 재입력해야 한다는 안내문도 함께 포함하면 좋습니다.

<a name="confirming-the-password"></a>
#### 비밀번호 확인 처리

다음으로, 사용자로부터 전달받은 비밀번호를 실제로 검증하고, 인증이 완료되면 사용자를 원래 목적지로 리다이렉트하는 POST 라우트를 만듭니다.

```
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

이 라우트가 어떻게 동작하는지 살펴봅시다. 먼저 요청에서 전달받은 비밀번호가 실제 인증된 사용자의 비밀번호와 일치하는지 확인합니다. 올바르면 Laravel 세션에 비밀번호 확인 완료를 알리는 타임스탬프를 기록합니다. `passwordConfirmed` 메서드를 통해 최근 비밀번호 확인 시각을 세션에 저장할 수 있습니다. 마지막으로 사용자를 원래 시도하던 목적지로 리다이렉트합니다.

<a name="password-confirmation-protecting-routes"></a>
### 라우트 보호

최근 비밀번호 재확인이 필요한 라우트는 반드시 `password.confirm` 미들웨어를 할당해야 합니다. 이 미들웨어는 라라벨에 기본 내장되어 있으며, 사용자의 원래 목적지를 세션에 저장했다가 인증 완료 후 리다이렉트될 수 있도록 처리합니다. 지정된 미들웨어에 의해, 인증되지 않은 사용자는 `password.confirm` [이름 있는 라우트](/docs/9.x/routing#named-routes)로 리다이렉트됩니다.

```
Route::get('/settings', function () {
    // ...
})->middleware(['password.confirm']);

Route::post('/settings', function () {
    // ...
})->middleware(['password.confirm']);
```

<a name="adding-custom-guards"></a>
## 커스텀 가드 추가하기

`Auth` 파사드의 `extend` 메서드를 사용하면 자신만의 인증 가드를 정의할 수 있습니다. `extend` 메서드는 [서비스 프로바이더](/docs/9.x/providers) 내부에서 호출해야 합니다. 라라벨에는 이미 `AuthServiceProvider`가 포함되어 있으므로, 여기에 코드를 추가하는 것이 일반적입니다.

```
<?php

namespace App\Providers;

use App\Services\Auth\JwtGuard;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Auth;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * 애플리케이션 인증/인가 서비스를 등록합니다.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();

        Auth::extend('jwt', function ($app, $name, array $config) {
            // Illuminate\Contracts\Auth\Guard 구현 인스턴스를 반환하세요...

            return new JwtGuard(Auth::createUserProvider($config['provider']));
        });
    }
}
```

위 예시에서 보듯, `extend`에 전달하는 콜백은 반드시 `Illuminate\Contracts\Auth\Guard` 구현체를 반환해야 합니다. 이 인터페이스의 메서드를 적절히 구현하면 사용자 정의 가드가 완성됩니다. 커스텀 가드를 완성했다면, `auth.php` 설정 파일의 `guards` 항목에서 사용할 수 있습니다.

```
'guards' => [
    'api' => [
        'driver' => 'jwt',
        'provider' => 'users',
    ],
],
```

<a name="closure-request-guards"></a>
### 클로저 기반 요청 가드

간단하게 HTTP 요청 기반의 커스텀 인증을 구현하려면 `Auth::viaRequest` 메서드를 사용할 수 있습니다. 이 메서드는 단일 클로저로 인증 프로세스를 신속하게 정의할 수 있도록 해줍니다.

시작하려면, `AuthServiceProvider`의 `boot` 메서드에서 `viaRequest`를 호출하세요. 첫 번째 인수는 가드 이름(아무 문자열이나), 두 번째 인수로는 요청을 받아서 사용자 인스턴스를 반환하거나 인증 실패시 `null`을 반환하는 클로저를 전달합니다.

```
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * 애플리케이션 인증/인가 서비스를 등록합니다.
 *
 * @return void
 */
public function boot()
{
    $this->registerPolicies();

    Auth::viaRequest('custom-token', function (Request $request) {
        return User::where('token', (string) $request->token)->first();
    });
}
```

이제 이 커스텀 인증 드라이버를 `auth.php` 설정 파일의 `guards` 항목에서 사용할 수 있습니다.

```
'guards' => [
    'api' => [
        'driver' => 'custom-token',
    ],
],
```

마지막으로, 인증 미들웨어에 해당 가드를 적용해 라우트를 보호하면 됩니다.

```
Route::middleware('auth:api')->group(function () {
    // ...
}
```

<a name="adding-custom-user-providers"></a>
## 커스텀 사용자 프로바이더 추가하기

기존의 관계형 데이터베이스가 아니라서 기본 UserProvider를 쓸 수 없다면, `Auth` 파사드의 `provider` 메서드로 커스텀 사용자 프로바이더를 정의할 수 있습니다. 사용자 프로바이더는 반드시 `Illuminate\Contracts\Auth\UserProvider` 계약을 구현해야 합니다.

```
<?php

namespace App\Providers;

use App\Extensions\MongoUserProvider;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Auth;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * 애플리케이션 인증/인가 서비스를 등록합니다.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();

        Auth::provider('mongo', function ($app, array $config) {
            // Illuminate\Contracts\Auth\UserProvider 구현 인스턴스를 반환하세요...

            return new MongoUserProvider($app->make('mongo.connection'));
        });
    }
}
```

`provider` 메서드로 프로바이더를 등록했다면, `auth.php`에서 아예 새 드라이버로 정의할 수 있습니다.

```
'providers' => [
    'users' => [
        'driver' => 'mongo',
    ],
],
```

마지막으로, `guards` 항목에서 이 프로바이더를 참조하도록 설정하세요.

```
'guards' => [
    'web' => [
        'driver' => 'session',
        'provider' => 'users',
    ],
],
```

<a name="the-user-provider-contract"></a>
### User Provider 계약

`Illuminate\Contracts\Auth\UserProvider` 구현체는 `Illuminate\Contracts\Auth\Authenticatable` 구현체를 MySQL, MongoDB 등 영구 저장소 시스템에서 꺼내오는 역할을 합니다. 이 두 인터페이스를 통해 라라벨의 인증 메커니즘은 데이터 저장 방식이나 유저 클래스를 변경하더라도 동일하게 동작할 수 있습니다.

아래는 `Illuminate\Contracts\Auth\UserProvider` 계약의 핵심 메서드 예시입니다.

```
<?php

namespace Illuminate\Contracts\Auth;

interface UserProvider
{
    public function retrieveById($identifier);
    public function retrieveByToken($identifier, $token);
    public function updateRememberToken(Authenticatable $user, $token);
    public function retrieveByCredentials(array $credentials);
    public function validateCredentials(Authenticatable $user, array $credentials);
}
```

- `retrieveById`는 사용자 식별값(예: MySQL에서의 auto-increment ID 등)을 받아 해당 사용자의 `Authenticatable` 구현체를 반환합니다.
- `retrieveByToken`은 사용자 고유 ID와 "remember me"용 토큰(예: `remember_token` 컬럼)을 받아 대응되는 사용자를 반환합니다.
- `updateRememberToken`은 사용자 인스턴스의 `remember_token` 값을 새로운 토큰으로 갱신합니다. 이 작업은 일반적으로 "로그인 상태 유지" 인증 성공 시 또는 로그아웃시 이뤄집니다.
- `retrieveByCredentials`는 `Auth::attempt`에 전달된 크레덴셜 배열을 받아 사용자 값을 조회합니다. 이 값으로 "username"에 해당하는 컬럼이 일치하는 사용자를 반환해야 하며, **이 단계에서는 패스워드 검증/인증을 직접 처리하지 않습니다.**
- `validateCredentials`는 사용자 객체와 크레덴셜을 받아, 패스워드 검증 등 실제 인증을 처리합니다. 대개 `Hash::check`를 사용하여 데이터베이스 저장 비밀번호와 입력값 일치 여부를 반환합니다.

<a name="the-authenticatable-contract"></a>
### Authenticatable 계약

`UserProvider`의 각 메서드를 살펴봤으니, `Authenticatable` 계약도 알아둬야 합니다. 사용자 프로바이더가 반환하는 인스턴스는 다음 인터페이스를 반드시 구현해야 합니다.

```
<?php

namespace Illuminate\Contracts\Auth;

interface Authenticatable
{
    public function getAuthIdentifierName();
    public function getAuthIdentifier();
    public function getAuthPassword();
    public function getRememberToken();
    public function setRememberToken($value);
    public function getRememberTokenName();
}
```

- `getAuthIdentifierName`은 사용자의 주요 키(예: 기본키 컬럼명)를 반환합니다.
- `getAuthIdentifier`는 해당 주요 키의 실제 값을 반환합니다. 보통 MySQL 기반 앱에서는 auto-increment PK 값을 의미합니다.
- `getAuthPassword`는 사용자의 해시된 비밀번호를 반환해야 합니다.

이 인터페이스만 구현되어 있으면 인증 시스템은 어떤 ORM 또는 저장 추상화를 써도 아무 문제 없이 동작할 수 있습니다. 라라벨 기본 제공 `App\Models\User` 클래스 역시 이 인터페이스를 구현하고 있습니다.

<a name="events"></a>
## 이벤트

라라벨은 인증 과정에서 다양한 [이벤트](/docs/9.x/events)를 발생시킵니다. `EventServiceProvider`에서 이 이벤트에 리스너를 등록해 활용할 수 있습니다.

```
/**
 * 애플리케이션의 이벤트 리스너 매핑
 *
 * @var array
 */
protected $listen = [
    'Illuminate\Auth\Events\Registered' => [
        'App\Listeners\LogRegisteredUser',
    ],

    'Illuminate\Auth\Events\Attempting' => [
        'App\Listeners\LogAuthenticationAttempt',
    ],

    'Illuminate\Auth\Events\Authenticated' => [
        'App\Listeners\LogAuthenticated',
    ],

    'Illuminate\Auth\Events\Login' => [
        'App\Listeners\LogSuccessfulLogin',
    ],

    'Illuminate\Auth\Events\Failed' => [
        'App\Listeners\LogFailedLogin',
    ],

    'Illuminate\Auth\Events\Validated' => [
        'App\Listeners\LogValidated',
    ],

    'Illuminate\Auth\Events\Verified' => [
        'App\Listeners\LogVerified',
    ],

    'Illuminate\Auth\Events\Logout' => [
        'App\Listeners\LogSuccessfulLogout',
    ],

    'Illuminate\Auth\Events\CurrentDeviceLogout' => [
        'App\Listeners\LogCurrentDeviceLogout',
    ],

    'Illuminate\Auth\Events\OtherDeviceLogout' => [
        'App\Listeners\LogOtherDeviceLogout',
    ],

    'Illuminate\Auth\Events\Lockout' => [
        'App\Listeners\LogLockout',
    ],

    'Illuminate\Auth\Events\PasswordReset' => [
        'App\Listeners\LogPasswordReset',
    ],
];
```