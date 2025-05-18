# 인증(Authentication)

- [소개](#introduction)
    - [스타터 키트](#starter-kits)
    - [데이터베이스 고려사항](#introduction-database-considerations)
    - [생태계 개요](#ecosystem-overview)
- [인증 빠르게 시작하기](#authentication-quickstart)
    - [스타터 키트 설치](#install-a-starter-kit)
    - [인증된 사용자 가져오기](#retrieving-the-authenticated-user)
    - [라우트 보호하기](#protecting-routes)
    - [로그인 제한(Throttling)](#login-throttling)
- [사용자 수동 인증하기](#authenticating-users)
    - [사용자 기억하기(리멤버미)](#remembering-users)
    - [기타 인증 방식](#other-authentication-methods)
- [HTTP 기본 인증](#http-basic-authentication)
    - [Stateless HTTP 기본 인증](#stateless-http-basic-authentication)
- [로그아웃](#logging-out)
    - [다른 기기에서 세션 무효화](#invalidating-sessions-on-other-devices)
- [비밀번호 확인](#password-confirmation)
    - [설정](#password-confirmation-configuration)
    - [라우팅](#password-confirmation-routing)
    - [라우트 보호하기](#password-confirmation-protecting-routes)
- [커스텀 가드 추가](#adding-custom-guards)
    - [클로저 방식 요청 가드](#closure-request-guards)
- [커스텀 사용자 프로바이더 추가](#adding-custom-user-providers)
    - [User Provider 계약](#the-user-provider-contract)
    - [Authenticatable 계약](#the-authenticatable-contract)
- [소셜 인증](/docs/10.x/socialite)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

많은 웹 애플리케이션은 사용자가 인증 및 "로그인"할 수 있는 기능을 제공합니다. 이러한 기능을 웹 애플리케이션에 구현하는 일은 상당히 복잡하고 보안상 위험을 동반할 수 있습니다. 라라벨은 여러분이 인증 기능을 빠르고 안전하게, 그리고 쉽게 구축할 수 있도록 필요한 도구들을 제공합니다.

라라벨 인증 시스템의 핵심은 "가드(guard)"와 "프로바이더(provider)"로 구성됩니다. 가드는 각 요청에 대해 사용자를 어떻게 인증할지 정의합니다. 예를 들어, 라라벨에는 세션 저장소와 쿠키를 활용하여 상태를 유지하는 `session` 가드가 기본 제공됩니다.

프로바이더는 사용자를 영구 저장소(데이터베이스)에서 어떻게 불러오는지 정의합니다. 라라벨은 [Eloquent](/docs/10.x/eloquent) 및 데이터베이스 쿼리 빌더를 이용한 사용자 조회를 지원합니다. 필요하다면 여러분의 애플리케이션에 맞는 추가 프로바이더 정의도 가능합니다.

애플리케이션의 인증 설정 파일은 `config/auth.php`에 위치합니다. 이 파일에는 라라벨 인증 서비스의 동작을 세밀하게 제어할 수 있는 다양한 옵션이 문서화되어 있습니다.

> [!NOTE]
> 가드와 프로바이더는 "역할"(`roles`)이나 "권한"(`permissions`)과 혼동해서는 안 됩니다. 권한을 이용한 사용자 액션 인가에 대해 더 알고 싶으시면 [인가(authorization)](/docs/10.x/authorization) 문서를 참고하세요.

<a name="starter-kits"></a>
### 스타터 키트

빠르게 시작하고 싶으신가요? 새로운 라라벨 애플리케이션에서 [라라벨 애플리케이션 스타터 키트](/docs/10.x/starter-kits)를 설치하세요. 데이터베이스 마이그레이션을 완료한 후, 브라우저에서 `/register` 또는 애플리케이션에 할당된 URL로 이동하면, 스타터 키트가 인증 시스템의 뼈대를 자동으로 만들어 줍니다!

**설령 실제 서비스에 스타터 키트를 직접 사용하지 않는다 하더라도, [라라벨 Breeze](/docs/10.x/starter-kits#laravel-breeze) 스타터 키트를 설치하면 실제 라라벨 프로젝트에서 인증 기능 전반을 어떻게 구현하는지 학습할 수 있는 훌륭한 기회를 얻을 수 있습니다.** 라라벨 Breeze는 인증에 필요한 컨트롤러, 라우트, 뷰를 만들어 주므로, 해당 파일들의 코드를 직접 열어보고 라라벨 인증이 어떻게 작동하는지 배울 수 있습니다.

<a name="introduction-database-considerations"></a>
### 데이터베이스 고려사항

라라벨은 기본적으로 `app/Models` 디렉토리에 `App\Models\User` [Eloquent 모델](/docs/10.x/eloquent)을 포함하고 있습니다. 이 모델은 기본 Eloquent 인증 드라이버와 함께 사용할 수 있습니다. 애플리케이션에서 Eloquent를 사용하지 않는 경우, 라라벨 쿼리 빌더를 활용하는 `database` 인증 프로바이더도 사용할 수 있습니다.

`App\Models\User` 모델에 맞는 데이터베이스 스키마를 정의할 때, 비밀번호 컬럼이 최소 60글자 이상이 되도록 하세요. 참고로, 새로운 라라벨 애플리케이션의 `users` 테이블 마이그레이션에는 이미 이보다 긴 컬럼이 생성되어 있습니다.

또한, `users`(또는 동등한) 테이블에 길이 100의 null 가능 문자열 타입 `remember_token` 컬럼이 포함되어 있는지 확인하세요. 이 컬럼은 사용자가 "로그인 상태 유지(remember me)" 옵션을 선택했을 때 토큰 값을 저장하는 데 사용됩니다. 역시, 기본 `users` 테이블 마이그레이션에는 이미 이 컬럼이 포함되어 있습니다.

<a name="ecosystem-overview"></a>
### 생태계 개요

라라벨은 인증과 관련된 다양한 패키지를 제공합니다. 본격적으로 시작하기 전에, 라라벨 전반에서 지원되는 인증 생태계를 살펴보고, 각 패키지의 목적에 대해 알아보겠습니다.

우선, 인증의 작동 방식을 생각해봅시다. 사용자가 웹 브라우저에서 로그인 폼에 아이디와 비밀번호를 입력하면, 서버는 이 정보를 확인한 뒤, 인증된 사용자 정보를 [세션](/docs/10.x/session)에 저장합니다. 브라우저에는 세션 ID를 담은 쿠키가 발행되어, 앞으로의 요청에서 사용자가 올바른 세션에 연결될 수 있습니다. 세션 쿠키를 통해 애플리케이션은 세션 데이터를 읽어 인증 정보를 확인하고, 사용자를 "인증된 상태"로 처리합니다.

반면, 원격 서비스가 API 접근을 위해 인증하려는 경우에는 웹 브라우저가 없으므로 일반적으로 쿠키가 사용되지 않습니다. 대신, 원격 서비스는 매 요청마다 API 토큰을 API 서버에 전송합니다. 애플리케이션은 이 토큰을 허용된 토큰 목록과 비교해, 해당 토큰에 연결된 사용자로 요청을 "인증"하게 됩니다.

<a name="laravels-built-in-browser-authentication-services"></a>
#### 라라벨 내장 브라우저 인증 서비스

라라벨은 내장 인증 및 세션 서비스를 제공하며, 주로 `Auth`와 `Session` 파사드를 통해 사용할 수 있습니다. 이 기능들은 웹 브라우저에서 시작된 요청에 대해 쿠키 기반 인증을 제공합니다. 사용자의 자격 증명 확인과 인증 처리를 위한 여러 메서드가 제공되며, 인증 데이터는 자동으로 세션에 저장되고, 세션 쿠키가 발급됩니다. 이 문서에서는 이러한 서비스의 사용 방법을 다룹니다.

**애플리케이션 스타터 키트**

여기서 소개하는 인증 서비스들을 직접 조합해 애플리케이션만의 인증 레이어를 구현할 수도 있지만, 보다 빠른 시작을 원한다면 [무료로 제공되는 스타터 키트 패키지](/docs/10.x/starter-kits)를 활용하면 튼튼하고 현대적인 인증 시스템 뼈대를 신속하게 구축할 수 있습니다. 대표적인 스타터 키트로는 [Laravel Breeze](/docs/10.x/starter-kits#laravel-breeze), [Laravel Jetstream](/docs/10.x/starter-kits#laravel-jetstream), [Laravel Fortify](/docs/10.x/fortify)가 있습니다.

_Laravel Breeze_는 로그인, 회원가입, 비밀번호 재설정, 이메일 인증, 비밀번호 확인 등 라라벨 인증의 모든 기능을 간소하고 최소한의 구성을 통해 제공합니다. 뷰는 간단한 [Blade 템플릿](/docs/10.x/blade)과 [Tailwind CSS](https://tailwindcss.com)로 꾸며져 있습니다. 자세한 시작 방법은 라라벨의 [애플리케이션 스타터 키트](/docs/10.x/starter-kits) 문서를 참고하세요.

_Laravel Fortify_는 라라벨용 헤드리스 인증 백엔드로, 쿠키 기반 인증 뿐만 아니라, 2차 인증, 이메일 인증 등 다양한 인증 기능을 제공합니다. 보통은 Laravel Jetstream의 인증 백엔드로 사용하거나, [Laravel Sanctum](/docs/10.x/sanctum)과 함께 SPA(싱글 페이지 애플리케이션) 인증 백엔드로 독립적으로 활용할 수 있습니다.

_[Laravel Jetstream](https://jetstream.laravel.com)_은 Fortify의 인증 기능을 현대적인 UI와 함께 제공하는 강력한 스타터 키트로, [Tailwind CSS](https://tailwindcss.com), [Livewire](https://livewire.laravel.com), [Inertia](https://inertiajs.com) 기반의 아름답고 모던한 UI를 갖추고 있습니다. 2차 인증, 팀 시스템, 브라우저 세션/프로필 관리, [Laravel Sanctum](/docs/10.x/sanctum)과의 연동을 통한 API 토큰 인증 등까지 폭넓게 지원합니다. 라라벨 API 인증 관련 내용은 아래에서 자세히 다룹니다.

<a name="laravels-api-authentication-services"></a>
#### 라라벨의 API 인증 서비스

라라벨은 API 토큰 관리 및 인증을 위해 선택적으로 사용할 수 있는 [Passport](/docs/10.x/passport)와 [Sanctum](/docs/10.x/sanctum) 두 가지 패키지를 제공합니다. 이들 패키지와 라라벨의 기본 쿠키 인증 라이브러리는 함께 쓸 수 있으며, 충돌하지 않습니다. 여기서 소개하는 패키지들은 주로 API 토큰 인증에, 기본 인증 서비스는 브라우저 쿠키 인증에 집중합니다. 많은 애플리케이션에서는 두 방식을 동시에 사용할 수 있습니다.

**Passport**

Passport는 OAuth2 인증 제공자로, 다양한 OAuth2 "grant type" 지원을 통해 여러 종류의 토큰을 발급할 수 있습니다. 매우 강력하고 복잡한 API 인증 패키지이지만, 대부분의 애플리케이션에서는 OAuth2 규격의 복잡한 기능까지 필요하지 않아, 사용자와 개발자 모두에게 다소 부담이 될 수 있습니다. 또한, SPA나 모바일 앱에서의 OAuth2 사용에 혼란을 겪는 개발자들이 많았습니다.

**Sanctum**

OAuth2의 복잡성과 혼란을 해결하기 위해, 더 간결하고 직관적인 인증 패키지인 [Laravel Sanctum](/docs/10.x/sanctum)이 만들어졌습니다. Sanctum은 웹 브라우저에서의 1차 요청과 API 토큰을 활용한 요청 모두를 처리할 수 있어, 웹 UI와 API를 동시에 제공하거나, 백엔드와 분리된 SPA, 모바일 클라이언트를 지원하는 애플리케이션에 가장 적합합니다.

Sanctum 기반 애플리케이션은 요청을 받을 때, 우선 세션 쿠키로 인증된 세션이 있는지 확인하며, 있다면 앞서 살펴본 라라벨의 내장 인증 서비스를 호출해 처리합니다. 만약 세션 쿠키가 인증되지 않은 경우라면, Sanctum은 해당 요청에 API 토큰이 있는지 검사하고, 있으면 해당 토큰으로 인증합니다. 자세한 내용은 Sanctum의 ["동작 방식" 문서](/docs/10.x/sanctum#how-it-works)를 참고하세요.

Sanctum은 저희가 [Laravel Jetstream](https://jetstream.laravel.com) 스타터 키트와 함께 기본 포함시킨 인증 패키지로, 지금까지 소개한 인증 시나리오의 대부분에 가장 적합하다고 할 수 있습니다.

<a name="summary-choosing-your-stack"></a>
#### 요약 및 인증 스택 선택

요약하자면, 브라우저를 이용하는 모놀리식(Monolithic) 라라벨 애플리케이션이라면 내장 인증 서비스만으로 충분합니다.

외부에서 API를 활용하는 경우라면, 애플리케이션 특성에 맞게 [Passport](/docs/10.x/passport) 또는 [Sanctum](/docs/10.x/sanctum) 중 하나를 선택해 API 토큰 인증을 적용하세요. 대부분의 경우, 간단하고 완성도 높은 API 인증/SPA 인증/모바일 인증 기능과 "scope(혹은 ability)"도 제공하는 Sanctum을 추천합니다.

라라벨을 백엔드로 사용하는 SPA를 개발하는 경우에도 [Laravel Sanctum](/docs/10.x/sanctum)이 가장 적합합니다. 이 때, 인증 라우트 구현을 직접 하거나, [Laravel Fortify](/docs/10.x/fortify)를 헤드리스 인증 백엔드로 이용할 수 있습니다. Fortify는 회원가입, 비밀번호 재설정, 이메일 인증 등 다양한 라우트와 컨트롤러도 제공합니다.

반드시 OAuth2의 모든 기능이 필요한 특별한 경우라면 Passport를 선택하세요.

그리고, 빠르게 시작하고 싶으시다면, [Laravel Breeze](/docs/10.x/starter-kits#laravel-breeze)로 내장 인증 서비스와 Sanctum을 조합한 추천 인증 스택을 즉시 경험해 보실 수 있습니다.

<a name="authentication-quickstart"></a>
## 인증 빠르게 시작하기

> [!NOTE]
> 이 섹션에서는 [라라벨 애플리케이션 스타터 키트](/docs/10.x/starter-kits)를 이용해 인증 시스템을 구축하는 방법을 설명합니다. 스타터 키트에는 빠른 시작을 돕는 UI 뼈대가 포함되어 있습니다. 라라벨 인증 시스템을 직접 구현하고 싶으시다면 [사용자 수동 인증하기](#authenticating-users) 문서를 참고하세요.

<a name="install-a-starter-kit"></a>
### 스타터 키트 설치

먼저, [라라벨 애플리케이션 스타터 키트](/docs/10.x/starter-kits)를 설치하세요. 최신의 스타터 키트인 Laravel Breeze와 Laravel Jetstream은 인증이 반영된 아름다운 초기 구조를 제공합니다.

Laravel Breeze는 로그인, 회원가입, 비밀번호 재설정, 이메일 인증, 비밀번호 확인 등 라라벨의 모든 인증 기능을 최소 목적에 맞게, 간단하게 구현합니다. 뷰는 [Blade 템플릿](/docs/10.x/blade)과 [Tailwind CSS](https://tailwindcss.com)로 만들었습니다. 더불어, [Livewire](https://livewire.laravel.com)나 [Inertia](https://inertiajs.com) 기반(Vue 또는 React 선택 가능) 뼈대도 옵션으로 제공합니다.

[Laravel Jetstream](https://jetstream.laravel.com)은 Livewire 또는 Inertia(Vue 기반)로 애플리케이션 뼈대를 구축할 수 있는 더욱 강력한 스타터 키트입니다. Jetstream에는 2차 인증, 팀, 프로필 관리, 브라우저 세션 관리, [Laravel Sanctum](/docs/10.x/sanctum)을 통한 API 지원, 계정 삭제 등 다양한 추가 기능도 선택적으로 제공됩니다.

<a name="retrieving-the-authenticated-user"></a>
### 인증된 사용자 가져오기

인증 스타터 키트를 설치하고, 사용자가 회원가입 및 로그인할 수 있도록 구현한 후에는, 현재 인증된 사용자 정보를 자주 활용하게 됩니다. 요청을 처리할 때는 `Auth` 파사드의 `user` 메서드를 통해 현재 인증된 사용자 인스턴스에 접근할 수 있습니다.

```
use Illuminate\Support\Facades\Auth;

// 현재 인증된 사용자 가져오기...
$user = Auth::user();

// 현재 인증된 사용자의 ID 가져오기...
$id = Auth::id();
```

또는, 인증된 사용자는 `Illuminate\Http\Request` 인스턴스에서도 접근할 수 있습니다. 컨트롤러 메서드에 `Illuminate\Http\Request` 타입힌트를 지정하면 클래스가 자동 주입되어, 메서드 내부에서 `$request->user()`를 사용하면 됩니다.

```
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

들어오는 HTTP 요청의 사용자가 인증된 상태인지 확인하려면, `Auth` 파사드의 `check` 메서드를 사용하면 됩니다. 사용자가 인증된 상태라면 `true`를 반환합니다.

```
use Illuminate\Support\Facades\Auth;

if (Auth::check()) {
    // 사용자가 로그인된 상태입니다...
}
```

> [!NOTE]
> `check` 메서드를 통해 인증 여부를 직접 확인할 수도 있지만, 실제로는 대부분의 경우 미들웨어를 활용해 사용자가 인증된 상태에서만 특정 라우트나 컨트롤러에 접근하도록 제한합니다. 자세한 내용은 [라우트 보호하기](/docs/10.x/authentication#protecting-routes) 문서를 참고하세요.

<a name="protecting-routes"></a>
### 라우트 보호하기

[라우트 미들웨어](/docs/10.x/middleware)를 사용하면, 인증된 사용자만 특정 라우트에 접근할 수 있도록 제한할 수 있습니다. 라라벨에는 `Illuminate\Auth\Middleware\Authenticate` 클래스를 참조하는 `auth` 미들웨어가 내장되어 있습니다. 해당 미들웨어는 이미 애플리케이션의 HTTP 커널에 등록되어 있으므로, 라우트에 바로 붙여 사용할 수 있습니다.

```
Route::get('/flights', function () {
    // 인증된 사용자만 접근할 수 있습니다...
})->middleware('auth');
```

<a name="redirecting-unauthenticated-users"></a>
#### 인증되지 않은 사용자 리다이렉트 하기

`auth` 미들웨어는 인증되지 않은 사용자를 감지하면 `login` [네임드 라우트](/docs/10.x/routing#named-routes)로 자동 리다이렉트합니다. 이 동작을 변경하고 싶을 경우, 애플리케이션의 `app/Http/Middleware/Authenticate.php` 파일 내 `redirectTo` 함수를 수정하세요.

```
use Illuminate\Http\Request;

/**
 * 사용자가 리다이렉트되어야 할 경로 반환.
 */
protected function redirectTo(Request $request): string
{
    return route('login');
}
```

<a name="specifying-a-guard"></a>
#### 가드 지정하기

`auth` 미들웨어를 라우트에 사용할 때 어떤 "가드"로 인증할지 명시적으로 지정할 수 있습니다. 해당 가드는 `auth.php` 설정 파일의 `guards` 배열 키 중 하나여야 합니다.

```
Route::get('/flights', function () {
    // 인증된 admin만 접근할 수 있습니다...
})->middleware('auth:admin');
```

<a name="login-throttling"></a>
### 로그인 제한(Throttling)

Laravel Breeze나 Laravel Jetstream [스타터 키트](/docs/10.x/starter-kits)를 사용하는 경우, 로그인 시도에 자동으로 속도 제한(rate limit)이 적용됩니다. 기본적으로 사용자가 여러 번 틀린 정보를 입력하면 1분 동안 로그인을 시도할 수 없습니다. 이 제한은 사용자의 아이디/이메일, 그리고 IP를 기준으로 개별 적용됩니다.

> [!NOTE]
> 애플리케이션 내 다른 라우트에도 속도 제한을 적용하고 싶으시다면, [rate limiting 문서](/docs/10.x/routing#rate-limiting)를 참고하세요.

<a name="authenticating-users"></a>
## 사용자 수동 인증하기

[애플리케이션 스타터 키트](/docs/10.x/starter-kits)가 제공하는 인증 뼈대를 꼭 사용해야 하는 것은 아닙니다. 만약 직접 인증 로직을 구현하고 싶다면, 라라벨의 인증 클래스를 직접 활용하시면 됩니다. 걱정하지 마세요, 아주 간단합니다!

라라벨 인증 서비스를 사용하려면 `Auth` [파사드](/docs/10.x/facades)를 이용해야 하므로, 해당 클래스를 꼭 import 해주세요. 직접 구현에서는 일반적으로 `attempt` 메서드를 사용하여 로그인 폼에서 입력된 정보를 처리합니다. 인증이 성공하면 [세션](/docs/10.x/session)을 재생성하여 [세션 고정 공격(session fixation)](https://en.wikipedia.org/wiki/Session_fixation)을 예방해야 합니다.

```
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    /**
     * 인증 시도 처리.
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

`attempt` 메서드는 첫 번째 인자로 key/value 쌍의 배열을 받습니다. 이 배열의 값은 사용자를 데이터베이스에서 찾는 데 사용됩니다. 위 예시에서는 `email` 컬럼 값을 기준으로 사용자를 조회하고, 데이터베이스에 저장된 해시된 비밀번호와 입력한 비밀번호를 비교합니다. 입력된 비밀번호는 직접 해싱할 필요가 없습니다. 프레임워크가 자동으로 입력값을 해시하여 비교합니다. 비밀번호가 일치하면 인증 세션이 시작됩니다.

라라벨 인증 서비스는 각 가드의 프로바이더 설정에 따라 사용자를 데이터베이스에서 조회합니다. 기본 `config/auth.php`에서는 Eloquent 사용자 프로바이더가 지정되어 있고, 사용자를 조회할 때 `App\Models\User` 모델을 사용합니다. 필요에 따라 설정 파일을 수정하면 됩니다.

인증 성공 시 `attempt`는 `true`를, 실패하면 `false`를 반환합니다.

라라벨에서 제공하는 `redirector`의 `intended` 메서드는 인증 미들웨어에 의해 차단되기 전 사용자가 접근하려던 URL로 리다이렉트시켜 줍니다. 해당 목적지가 없을 경우 대체 경로를 지정할 수 있습니다.

<a name="specifying-additional-conditions"></a>
#### 추가 조건 지정하기

이메일과 비밀번호 외에 다른 조건도 인증 쿼리에 추가하고 싶을 때는, `attempt`에 전달하는 배열에 조건을 추가하면 됩니다. 예를 들어, 사용자 활성화 여부까지 확인하려면 아래와 같이 쓸 수 있습니다.

```
if (Auth::attempt(['email' => $email, 'password' => $password, 'active' => 1])) {
    // 인증 성공...
}
```

더 복잡한 쿼리 조건이 필요할 경우, 배열의 값으로 클로저를 지정할 수 있습니다. 이 클로저는 쿼리 인스턴스를 인자로 받아, 쿼리를 자유롭게 커스터마이징할 수 있습니다.

```
use Illuminate\Database\Eloquent\Builder;

if (Auth::attempt([
    'email' => $email, 
    'password' => $password, 
    fn (Builder $query) => $query->has('activeSubscription'),
])) {
    // 인증 성공...
}
```

> [!NOTE]
> 위 예시에서 `email`은 필수 항목이 아니며, 예시를 위해 사용된 것입니다. 여러분의 데이터베이스에서 "사용자명"으로 쓰이는 컬럼 명을 자유롭게 사용하세요.

`attemptWhen` 메서드는 두 번째 인자로 클로저를 받아, 실제 인증 전 후보 사용자를 좀 더 정밀하게 검사할 수 있습니다. 클로저는 해당 사용자 인스턴스를 받아, 인증 가능 여부에 따라 `true` 또는 `false`를 반환하면 됩니다.

```
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
#### 특정 가드 인스턴스 사용하기

`Auth` 파사드의 `guard` 메서드를 이용해, 인증에 사용할 특정 가드 인스턴스를 지정할 수 있습니다. 이를 통해 서로 다른 부분에서 독립적인 인증 모델이나 사용자 테이블을 쓸 수 있습니다.

`guard`에 전달하는 이름은 반드시 `auth.php` 설정 파일의 guards 중 하나여야 합니다.

```
if (Auth::guard('admin')->attempt($credentials)) {
    // ...
}
```

<a name="remembering-users"></a>
### 사용자 기억하기(리멤버미)

많은 웹 애플리케이션에서 로그인 폼에 "로그인 상태 유지(remember me)" 체크박스를 제공합니다. 이런 기능을 구현하려면 `attempt` 메서드의 두 번째 인자로 불리언 값을 넘기면 됩니다.

이 값이 `true`면, 사용자는 명시적으로 로그아웃하거나 삭제할 때까지 인증 상태로 유지됩니다. `users` 테이블에는 반드시 `remember_token` 컬럼이 존재해야 하며, 라라벨 신규 프로젝트에는 이미 이 컬럼이 포함되어 있습니다.

```
use Illuminate\Support\Facades\Auth;

if (Auth::attempt(['email' => $email, 'password' => $password], $remember)) {
    // 사용자가 '로그인 상태 유지'로 인증되었습니다...
}
```

만약 "로그인 상태 유지(remember me)" 기능이 있다면, 현재 인증된 사용자가 remember me 쿠키로 인증되었는지 `viaRemember` 메서드로 판단할 수 있습니다.

```
use Illuminate\Support\Facades\Auth;

if (Auth::viaRemember()) {
    // ...
}
```

<a name="other-authentication-methods"></a>
### 기타 인증 방식

<a name="authenticate-a-user-instance"></a>
#### 사용자 인스턴스 인증하기

기존 사용자 인스턴스를 현재 인증된 사용자로 설정해야 할 때는, 해당 인스턴스를 `Auth` 파사드의 `login` 메서드에 넘기면 됩니다. 전달하는 사용자는 반드시 `Illuminate\Contracts\Auth\Authenticatable` [계약](/docs/10.x/contracts)을 구현하고 있어야 하며, 기본 제공되는 `App\Models\User`도 이미 이 인터페이스를 구현하고 있습니다. 이 방식은 회원가입 직후와 같이 이미 사용자 인스턴스가 준비된 경우에 유용합니다.

```
use Illuminate\Support\Facades\Auth;

Auth::login($user);
```

두 번째 인자로 불리언 값을 넘기면 "로그인 상태 유지"를 적용할 수도 있습니다.

```
Auth::login($user, $remember = true);
```

필요하다면, `login` 호출 전에 사용할 가드를 명시할 수도 있습니다.

```
Auth::guard('admin')->login($user);
```

<a name="authenticate-a-user-by-id"></a>
#### 사용자 ID로 인증하기

데이터베이스의 기본키를 활용해 사용자를 인증하고 싶다면, `loginUsingId` 메서드를 사용하세요. 이 메서드는 인증할 사용자의 기본키(primary key)를 전달받습니다.

```
Auth::loginUsingId(1);
```

두 번째 인자로 Boolean 값을 넘겨 "로그인 상태 유지" 여부를 지정할 수 있습니다.

```
Auth::loginUsingId(1, $remember = true);
```

<a name="authenticate-a-user-once"></a>
#### 1회성 인증(세션 미사용하기)

`once` 메서드를 사용하면 세션이나 쿠키 없이 단 한 번의 요청에 대해서만 인증할 수 있습니다.

```
if (Auth::once($credentials)) {
    // ...
}
```

<a name="http-basic-authentication"></a>
## HTTP 기본 인증

[HTTP 기본 인증](https://en.wikipedia.org/wiki/Basic_access_authentication)은 별도의 로그인 페이지 구현 없이도 간단히 인증 기능을 제공합니다. 먼저, 라우트에 `auth.basic` [미들웨어](/docs/10.x/middleware)를 추가하면 됩니다. `auth.basic` 미들웨어는 라라벨 프레임워크에 기본 포함되어 있으므로 별도 등록 없이 바로 사용할 수 있습니다.

```
Route::get('/profile', function () {
    // 인증된 사용자만 접근할 수 있습니다...
})->middleware('auth.basic');
```

미들웨어를 라우트에 추가하면, 브라우저에서 해당 라우트에 접근할 때 즉시 인증을 요구하는 프롬프트가 나타납니다. 기본적으로 `auth.basic` 미들웨어는 `users` 테이블의 `email` 컬럼을 사용자명으로 사용합니다.

<a name="a-note-on-fastcgi"></a>
#### FastCGI 사용 시 참고사항

라라벨을 PHP FastCGI 및 Apache로 서비스하는 경우 HTTP 기본 인증이 올바로 동작하지 않을 수 있습니다. 이럴 때는 `.htaccess` 파일에 아래 내용을 추가하세요.

```apache
RewriteCond %{HTTP:Authorization} ^(.+)$
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
```

<a name="stateless-http-basic-authentication"></a>
### Stateless HTTP 기본 인증

세션에 사용자 식별 쿠키를 저장하지 않고 HTTP 기본 인증을 사용할 수도 있습니다. 주로 API 접근 인증에 유용합니다. 이를 위해서는 [커스텀 미들웨어 정의](/docs/10.x/middleware) 후, 내부에서 `onceBasic` 메서드를 호출하면 됩니다. `onceBasic` 메서드가 응답을 반환하지 않으면 요청이 어플리케이션에 계속 전달됩니다.

```
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

그 다음, 해당 미들웨어를 라우트에 적용하세요.

```
Route::get('/api/user', function () {
    // 인증된 사용자만 접근할 수 있습니다...
})->middleware(AuthenticateOnceWithBasicAuth::class);
```

<a name="logging-out"></a>
## 로그아웃

사용자를 수동으로 로그아웃시키려면 `Auth` 파사드의 `logout` 메서드를 사용하세요. 이 메서드는 현재 세션에서 인증 정보를 제거하여, 이후 요청엔 더 이상 인증이 유효하지 않게 만듭니다.

또한 로그아웃을 수행할 때, 사용자의 세션을 무효화하고 [CSRF 토큰](/docs/10.x/csrf)도 재생성하는 것이 좋습니다. 로그아웃 완료 시 보통 메인 페이지로 리다이렉트합니다.

```
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

/**
 * 애플리케이션에서 사용자를 로그아웃합니다.
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

라라벨은 다른 기기에서 유지 중인 사용자의 세션을 "로그아웃"시키는 기능도 제공합니다. 이 기능은 주로 사용자가 비밀번호를 변경할 때, 본인 기기를 제외한 모든 기기의 인증 세션을 무효화하고 싶을 때 사용합니다.

이 기능을 활용하려면, 먼저 `Illuminate\Session\Middleware\AuthenticateSession` 미들웨어가 해당 라우트 그룹에 포함되어야 합니다. 일반적으로 다수의 라우트에 적용할 수 있도록 라우트 그룹에 미들웨어를 등록합니다. 기본적으로, `auth.session` 미들웨어 alias로도 이 미들웨어를 사용할 수 있도록 HTTP 커널에 등록되어 있습니다.

```
Route::middleware(['auth', 'auth.session'])->group(function () {
    Route::get('/', function () {
        // ...
    });
});
```

그 후, `Auth` 파사드의 `logoutOtherDevices` 메서드를 사용하세요. 사용자의 현재 비밀번호를 받아야 하므로, 별도의 입력 폼에서 비밀번호를 받고 전달해야 합니다.

```
use Illuminate\Support\Facades\Auth;

Auth::logoutOtherDevices($currentPassword);
```

`logoutOtherDevices`를 호출하면, 사용자의 나머지 세션이 전부 무효화되며, 로그인된 모든 가드에서 "로그아웃" 됩니다.

<a name="password-confirmation"></a>
## 비밀번호 확인

앱을 개발하다 보면, 사용자로 하여금 특정 액션 전이나 민감한 영역 진입 전 비밀번호를 한 번 더 확인하도록 해야 할 때가 있습니다. 라라벨은 이를 쉽게 구현할 수 있는 미들웨어를 내장하고 있습니다. 이 기능을 적용하려면, 비밀번호 확인 폼을 보여주는 라우트와, 비밀번호 일치 여부를 확인해 사용자를 리다이렉트하는 라우트가 필요합니다.

> [!NOTE]
> 지금부터 소개하는 기능을 직접 구현하지 않고도, [라라벨 애플리케이션 스타터 키트](/docs/10.x/starter-kits)에는 이미 이 기능이 내장되어 있습니다!

<a name="password-confirmation-configuration"></a>
### 설정

비밀번호를 한 번 확인한 뒤에는 3시간 동안 같은 요청이 발생해도 다시 묻지 않습니다. 이 재확인까지의 시간은 앱의 `config/auth.php` 설정 파일에서 `password_timeout` 값을 변경하여 조정할 수 있습니다.

<a name="password-confirmation-routing"></a>
### 라우팅

<a name="the-password-confirmation-form"></a>
#### 비밀번호 확인 폼

먼저, 사용자의 비밀번호 확인을 요구하는 뷰를 반환하는 라우트를 만듭니다.

```
Route::get('/confirm-password', function () {
    return view('auth.confirm-password');
})->middleware('auth')->name('password.confirm');
```

이 라우트의 뷰에는 `password` 필드가 포함된 폼이 있어야 하며, 사용자가 민감한 영역에 진입하기 전 비밀번호를 다시 확인해야 한다는 내용을 안내해주면 좋습니다.

<a name="confirming-the-password"></a>
#### 비밀번호 확인 처리

그 다음, "비밀번호 확인" 폼에서 제출된 요청을 처리할 라우트를 정의합니다. 이 라우트가 비밀번호 검증 및 목적지 리다이렉트를 모두 담당합니다.

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

조금 더 자세히 살펴보면, 먼저 요청에서 전달된 `password` 값이 인증된 사용자 계정의 비밀번호와 일치하는지 확인합니다. 비밀번호가 올바르면, 라라벨 세션에 비밀번호를 확인한 사실을 알려주는 표시(`passwordConfirmed`)를 남깁니다. 이 메서드는 사용자의 세션에 마지막 비밀번호 확인 시각을 기록하여, 다음 검증 시 활용하게 합니다. 이후, 사용자를 의도된 목적지로 리다이렉트합니다.

<a name="password-confirmation-protecting-routes"></a>
### 라우트 보호하기

최근에 비밀번호 확인이 수행된 사용자만 접근할 수 있도록 하고 싶은 라우트에는 반드시 `password.confirm` 미들웨어를 적용해야 합니다. 이 미들웨어는 라라벨 기본 설치에 포함되어 있으며, 인증이 필요한 라우트 접근 시 그 목적지를 세션에 저장하고, 비밀번호 재확인 뷰(`password.confirm` [네임드 라우트](/docs/10.x/routing#named-routes))로 리다이렉트합니다.

```
Route::get('/settings', function () {
    // ...
})->middleware(['password.confirm']);

Route::post('/settings', function () {
    // ...
})->middleware(['password.confirm']);
```

<a name="adding-custom-guards"></a>
## 커스텀 가드 추가

`Auth` 파사드의 `extend` 메서드를 사용해 자신만의 인증 가드(guard)를 만들 수도 있습니다. 이 코드는 보통 [서비스 프로바이더](/docs/10.x/providers)에서 작성하는데, 라라벨에는 이미 `AuthServiceProvider`가 있으니 그곳에 추가하면 됩니다.

```
<?php

namespace App\Providers;

use App\Services\Auth\JwtGuard;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Auth;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * 애플리케이션의 인증/인가 서비스 등록.
     */
    public function boot(): void
    {
        Auth::extend('jwt', function (Application $app, string $name, array $config) {
            // Illuminate\Contracts\Auth\Guard 인스턴스를 반환해야 합니다...

            return new JwtGuard(Auth::createUserProvider($config['provider']));
        });
    }
}
```

위 예시에서처럼, `extend`에 넘기는 콜백은 반드시 `Illuminate\Contracts\Auth\Guard` 인터페이스를 구현한 객체를 반환해야 합니다. 이 인터페이스의 메서드들을 구현해 커스텀 가드를 구성할 수 있습니다. 커스텀 가드가 준비되면, `auth.php` 설정 파일의 `guards` 항목에서 아래처럼 지정할 수 있습니다.

```
'guards' => [
    'api' => [
        'driver' => 'jwt',
        'provider' => 'users',
    ],
],
```

<a name="closure-request-guards"></a>
### 클로저 방식 요청 가드

HTTP 요청 기반 커스텀 인증 시스템을 가장 빠르게 만드는 방법은 `Auth::viaRequest` 메서드를 활용하는 것입니다. 이 메서드를 사용하면 클로저 하나만으로 인증 프로세스를 정의할 수 있습니다.

`AuthServiceProvider`의 `boot` 메서드에서 `Auth::viaRequest`를 호출하세요. 첫 번째 인자는 커스텀 가드 이름(임의의 문자열), 두 번째 인자는 HTTP 요청을 받아 사용자 인스턴스를 반환하거나 인증 실패 시 `null`을 반환하는 클로저입니다.

```
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * 애플리케이션의 인증/인가 서비스 등록.
 */
public function boot(): void
{
    Auth::viaRequest('custom-token', function (Request $request) {
        return User::where('token', (string) $request->token)->first();
    });
}
```

커스텀 인증 드라이버를 정의했다면, 다음과 같이 `auth.php` 설정 파일의 `guards` 항목에 드라이버명을 지정하여 사용할 수 있습니다.

```
'guards' => [
    'api' => [
        'driver' => 'custom-token',
    ],
],
```

그리고 해당 가드를 라우트 미들웨어로도 지정 가능합니다.

```
Route::middleware('auth:api')->group(function () {
    // ...
});
```

<a name="adding-custom-user-providers"></a>
## 커스텀 사용자 프로바이더 추가

관계형 데이터베이스가 아닌 다른 방식으로 사용자 정보를 보관한다면, 커스텀 사용자 프로바이더를 만들어 라라벨을 확장할 수 있습니다. `Auth` 파사드의 `provider` 메서드를 활용해 새로운 사용자 프로바이더를 등록하세요. 프로바이더 리졸버는 반드시 `Illuminate\Contracts\Auth\UserProvider` 를 구현한 객체를 반환해야 합니다.

```
<?php

namespace App\Providers;

use App\Extensions\MongoUserProvider;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Auth;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * 애플리케이션의 인증/인가 서비스 등록.
     */
    public function boot(): void
    {
        Auth::provider('mongo', function (Application $app, array $config) {
            // Illuminate\Contracts\Auth\UserProvider 인스턴스를 반환...

            return new MongoUserProvider($app->make('mongo.connection'));
        });
    }
}
```

등록이 끝나면, `auth.php`의 `providers`에 새로운 드라이버를 사용할 수 있습니다.

```
'providers' => [
    'users' => [
        'driver' => 'mongo',
    ],
],
```

마지막으로, 해당 프로바이더를 `guards` 설정에서 참조하세요.

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

`Illuminate\Contracts\Auth\UserProvider`는 `Illuminate\Contracts\Auth\Authenticatable` 구현체를 MySQL, MongoDB 등 영구 저장소에서 불러오는 역할을 담당합니다. 이 두 인터페이스 덕분에, 사용자 데이터 저장 방식이나 구현 클래스가 달라도 라라벨 인증은 변함없이 동작할 수 있습니다.

`Illuminate\Contracts\Auth\UserProvider` 계약의 인터페이스는 다음과 같습니다.

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

- `retrieveById`는 사용자 식별자(예: MySQL 자동 증가 ID 등)를 받아 해당 `Authenticatable` 구현체를 반환합니다.
- `retrieveByToken`은 고유 키와 "remember me" 토큰(`remember_token` 컬럼 등)을 이용해 사용자를 불러옵니다.
- `updateRememberToken`은 `$user` 인스턴스의 `remember_token` 값을 새 `$token`으로 갱신합니다. 이 기능은 "로그인 상태 유지" 인증이나 로그아웃 시 사용됩니다.
- `retrieveByCredentials`는 `Auth::attempt`에서 전달받은 자격 증명 배열을 받아, 조건에 맞는 사용자를 영구 저장소에서 찾아 반환합니다. 여기서는 비밀번호 검증/인증을 수행하지 말아야 합니다.
- `validateCredentials`는 주어진 `$user`와 입력값 `$credentials`를 비교해 인증 처리까지 담당합니다. 예를 들어, `Hash::check`로 `$user->getAuthPassword()`와 `$credentials['password']`를 비교하면 됩니다. 결과는 `true`/`false`로 반환합니다.

<a name="the-authenticatable-contract"></a>
### Authenticatable 계약

이번에는 `UserProvider`에서 반환해야 하는 `Authenticatable` 인터페이스를 살펴보겠습니다. 사용자 프로바이더의 `retrieveById`, `retrieveByToken`, `retrieveByCredentials` 메서드는 반드시 이 인터페이스를 구현한 인스턴스를 반환해야 합니다.

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

간단하게 설명하면,
- `getAuthIdentifierName`은 "기본키" 필드명을, `getAuthIdentifier`는 실제 PK 값을 반환합니다. MySQL에서는 사용자의 자동 증가 PK가 대표적입니다.
- `getAuthPassword`는 사용자 비밀번호(해시 값) 반환.
  
이 인터페이스 덕분에 인증 시스템은 ORM이나 저장 방식에 상관없이 어떤 사용자 클래스와도 연동할 수 있습니다. 기본으로 제공되는 `app/Models/User` 클래스가 이미 이 인터페이스를 구현하고 있습니다.

<a name="events"></a>
## 이벤트

라라벨은 인증 프로세스 도중 여러 [이벤트](/docs/10.x/events)를 발생시킵니다. `EventServiceProvider`에서 이러한 이벤트에 리스너를 연결할 수 있습니다.

```
/**
 * 애플리케이션의 이벤트 리스너 매핑.
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
