# 인증 (Authentication)

- [소개](#introduction)
    - [스타터 키트](#starter-kits)
    - [데이터베이스 참고 사항](#introduction-database-considerations)
    - [에코시스템 개요](#ecosystem-overview)
- [인증 빠른 시작](#authentication-quickstart)
    - [스타터 키트 설치](#install-a-starter-kit)
    - [인증된 사용자 가져오기](#retrieving-the-authenticated-user)
    - [라우트 보호하기](#protecting-routes)
    - [로그인 시도 제한](#login-throttling)
- [사용자 수동 인증](#authenticating-users)
    - [사용자 기억하기](#remembering-users)
    - [기타 인증 방식](#other-authentication-methods)
- [HTTP Basic 인증](#http-basic-authentication)
    - [Stateless HTTP Basic 인증](#stateless-http-basic-authentication)
- [로그아웃 처리](#logging-out)
    - [다른 기기에서의 세션 무효화](#invalidating-sessions-on-other-devices)
- [비밀번호 확인](#password-confirmation)
    - [설정](#password-confirmation-configuration)
    - [라우팅](#password-confirmation-routing)
    - [라우트 보호](#password-confirmation-protecting-routes)
- [커스텀 가드 추가](#adding-custom-guards)
    - [클로저 요청 가드](#closure-request-guards)
- [커스텀 사용자 제공자 추가](#adding-custom-user-providers)
    - [User Provider 계약](#the-user-provider-contract)
    - [Authenticatable 계약](#the-authenticatable-contract)
- [소셜 인증](/docs/8.x/socialite)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

많은 웹 애플리케이션에서는 사용자가 애플리케이션에 로그인할 수 있는 인증 기능을 제공합니다. 이러한 기능을 웹 애플리케이션에 구현하는 것은 복잡하고 때로는 보안상 위험이 따를 수도 있습니다. 그래서 라라벨은 인증을 빠르고, 안전하게, 그리고 쉽게 구현할 수 있는 다양한 도구를 제공합니다.

라라벨 인증 시스템의 핵심은 "가드(guard)"와 "프로바이더(provider)"로 이루어져 있습니다. 가드는 각각의 요청에서 사용자를 어떻게 인증할지 결정합니다. 예를 들어, 라라벨에는 `session` 가드가 내장되어 있어 세션 저장소와 쿠키를 통해 인증 상태를 유지합니다.

프로바이더는 사용자를 영구 저장소에서 어떻게 가져올지 정의합니다. 라라벨은 [Eloquent](/docs/8.x/eloquent)와 데이터베이스 쿼리 빌더를 이용한 사용자 조회를 기본적으로 지원합니다. 필요하다면 애플리케이션에 맞는 추가 프로바이더도 자유롭게 정의할 수 있습니다.

애플리케이션의 인증 설정 파일은 `config/auth.php`에 위치합니다. 이 파일에는 라라벨의 인증 서비스 동작을 다양하게 조정할 수 있는 여러 옵션이 상세히 주석과 함께 포함되어 있습니다.

> [!TIP]
> 가드와 프로바이더는 "권한(roles)"과 "권한(permission)" 시스템과는 별개입니다. 권한 기반으로 사용자의 행동을 인가하는 방법은 [인가(authorization)](/docs/8.x/authorization) 문서를 참고해 주세요.

<a name="starter-kits"></a>
### 스타터 키트

빠르게 시작하고 싶으신가요? 새로운 라라벨 애플리케이션에 [라라벨 애플리케이션 스타터 키트](/docs/8.x/starter-kits)를 설치해 보세요. 데이터베이스 마이그레이션 후 `/register` 또는 애플리케이션에서 할당한 다른 URL로 접속하면, 스타터 키트가 전체 인증 시스템의 기본 구조를 자동으로 만들어줍니다.

**최종적으로 라라벨 애플리케이션에서 스타터 키트를 사용하지 않기로 정했다 하더라도, [Laravel Breeze](/docs/8.x/starter-kits#laravel-breeze) 스타터 키트를 설치해서 실제 라라벨 프로젝트에서 인증 기능이 어떻게 구현되는지 학습해보는 것은 아주 좋은 기회가 될 수 있습니다.** Laravel Breeze는 인증 컨트롤러, 라우트, 뷰 파일들을 자동으로 생성해주기 때문에, 해당 파일의 코드를 직접 살펴보면서 라라벨 인증 기능의 내부 동작 방식을 쉽게 이해할 수 있습니다.

<a name="introduction-database-considerations"></a>
### 데이터베이스 참고 사항

라라벨은 기본적으로 `app/Models` 디렉터리에 `App\Models\User` [Eloquent 모델](/docs/8.x/eloquent)을 포함하고 있습니다. 이 모델은 기본 Eloquent 인증 드라이버에서 사용할 수 있습니다. 애플리케이션이 Eloquent를 사용하지 않는 경우에는 Laravel 쿼리 빌더를 이용하는 `database` 인증 프로바이더를 사용할 수 있습니다.

`App\Models\User` 모델을 위한 데이터베이스 스키마를 작성할 때, 패스워드 컬럼의 길이가 최소 60자 이상이 되도록 해야 합니다. 물론, 새로 생성된 라라벨 애플리케이션에 포함된 `users` 테이블 마이그레이션에서는 이미 이 길이보다 더 긴 컬럼이 생성됩니다.

또한, `users`(또는 이에 상응하는) 테이블에 `remember_token`이라는 100자 길이의 널(null) 허용 문자열 컬럼이 포함되어 있는지도 확인해야 합니다. 이 컬럼은 로그인 시 "로그인 상태 유지(remember me)" 옵션을 선택한 사용자의 토큰 저장에 사용됩니다. 역시 기본 `users` 테이블 마이그레이션에는 이미 이 컬럼이 포함되어 있습니다.

<a name="ecosystem-overview"></a>
### 에코시스템 개요

라라벨은 인증과 관련하여 여러 패키지를 제공합니다. 본격적으로 살펴보기 전에, 라라벨이 제공하는 인증 에코시스템 전반을 개괄적으로 정리하고 각 패키지의 용도를 설명합니다.

먼저, 인증의 일반적인 동작 방식을 살펴봅니다. 웹 브라우저를 사용할 때 사용자는 로그인 폼에 사용자명과 패스워드를 입력합니다. 이 정보가 올바르면, 애플리케이션은 인증된 사용자에 대한 정보를 사용자의 [세션](/docs/8.x/session)에 저장합니다. 브라우저에는 세션 ID가 담긴 쿠키가 발급되어 이후의 모든 요청에서 이 세션 쿠키를 사용해 사용자를 식별합니다. 세션 쿠키가 올바르게 전달되면, 애플리케이션은 해당 세션 ID로 세션 데이터를 조회하여 인증 정보를 확인하고 해당 사용자를 "인증된 상태"라고 판단합니다.

반대로, API에 접근해야 하는 외부 서비스의 인증에는 일반적으로 쿠키를 사용하지 않습니다(브라우저가 없기 때문입니다). 대신, 외부 서비스는 각 요청마다 API 토큰을 함께 전송합니다. 애플리케이션은 전달받은 토큰이 데이터베이스 등에서 유효한지 검증하고, 해당 토큰에 연결된 사용자가 수행하는 요청으로 간주해 인증 처리를 합니다.

<a name="laravels-built-in-browser-authentication-services"></a>
#### 라라벨 내장 브라우저 인증 서비스

라라벨은 인증과 세션 서비스를 내장하고 있으며, 일반적으로 `Auth`와 `Session` 파사드를 통해 접근할 수 있습니다. 이 기능들은 웹 브라우저에서 이루어지는 요청에 대해 쿠키 기반 인증을 제공합니다. 사용자의 자격 증명 검증 및 인증에 사용할 수 있는 다양한 메서드를 제공하며, 인증 데이터 처리와 세션 쿠키 발급도 자동으로 처리해줍니다. 이 서비스의 사용 방법은 본 문서에서 자세히 설명합니다.

**애플리케이션 스타터 키트**

여기서 설명한 대로, 애플리케이션의 인증 레이어를 직접 구축하기 위해 이 인증 서비스를 수동으로 사용할 수도 있습니다. 그러나 더 빠르게 시작할 수 있도록, 전체 인증 레이어를 견고하고 현대적으로 개발할 수 있는 [무료 패키지](/docs/8.x/starter-kits)들이 준비되어 있습니다. 대표적으로 [Laravel Breeze](/docs/8.x/starter-kits#laravel-breeze), [Laravel Jetstream](/docs/8.x/starter-kits#laravel-jetstream), [Laravel Fortify](/docs/8.x/fortify)가 있습니다.

_Laravel Breeze_는 로그인, 회원가입, 비밀번호 재설정, 이메일 인증, 비밀번호 확인 등 라라벨의 모든 인증 기능을 아주 단순하고 미니멀하게 구현한 예제입니다. 템플릿은 [Blade](/docs/8.x/blade)와 [Tailwind CSS](https://tailwindcss.com)로 이루어져 있습니다. 처음 시작할 때 [애플리케이션 스타터 키트 문서](/docs/8.x/starter-kits)를 참고해 주세요.

_Laravel Fortify_는 라라벨의 다양한 인증 기능(쿠키 기반 인증, 2단계 인증, 이메일 인증 등)을 포함한 헤드리스 인증 백엔드입니다. Jetstream의 인증 백엔드로 작동하며, [Laravel Sanctum](/docs/8.x/sanctum)과 결합해 SPA 인증에도 사용할 수 있습니다.

_[Laravel Jetstream](https://jetstream.laravel.com)_은 Fortify의 인증 서비스를 바탕으로, [Tailwind CSS](https://tailwindcss.com), [Livewire](https://laravel-livewire.com), [Inertia.js](https://inertiajs.com) 기반의 아름답고 현대적인 UI를 제공하는 강력한 애플리케이션 스타터 키트입니다. Jetstream은 2단계 인증, 팀 지원, 브라우저 세션 및 프로필 관리, [Sanctum](/docs/8.x/sanctum)과의 통합 등 다양한 기능을 선택적으로 제공합니다.

<a name="laravels-api-authentication-services"></a>
#### 라라벨의 API 인증 서비스

라라벨은 API 토큰 관리 및 인증을 관리할 수 있도록 [Passport](/docs/8.x/passport)와 [Sanctum](/docs/8.x/sanctum) 두 가지 패키지를 제공합니다. 참고로 이 라이브러리들과 라라벨의 내장 쿠키 기반 인증 라이브러리는 상호 배타적이지 않습니다. API 토큰 인증에는 이 패키지들을, 브라우저 기반 인증에는 내장 인증 서비스를 사용할 수 있습니다. 대부분의 애플리케이션에서는 쿠키 기반 인증과 API 인증 패키지 중 하나를 함께 사용합니다.

**Passport**

Passport는 다양한 OAuth2 "그랜트 타입"을 지원하는 OAuth2 인증 프로바이더입니다. 매우 다양하고 복잡한 API 인증 요구 사항에 적합한 강력한 패키지입니다. 다만, 대부분의 애플리케이션은 OAuth2 명세서의 모든 복잡한 기능이 필요하지 않을 수 있으며, 실제로 SPA나 모바일 앱 인증처럼 일부 시나리오에서는 Passport와 같은 OAuth2 방식의 사용이 혼란을 줄 수 있습니다.

**Sanctum**

OAuth2의 복잡함과 개발자들의 혼동을 해소하기 위해, 더 간단하면서 실질적으로 웹(브라우저) 요청과 API 요청 모두를 처리할 수 있는 인증 패키지가 필요했습니다. 그래서 [Laravel Sanctum](/docs/8.x/sanctum)이 탄생했습니다. Sanctum은 웹 UI뿐만 아니라 별도의 백엔드(SPA, 모바일 클라이언트 등)에서 API를 호출할 때도 사용할 수 있으며, 대부분의 인증 요구에 권장되고 있습니다.

Sanctum은 웹과 API 인증의 하이브리드 패키지입니다. Sanctum을 기반으로 하는 애플리케이션이 요청을 받으면, 우선 세션 쿠키에 인증된 세션이 연관되어 있는지 확인합니다. 이때 위에서 설명한 내장 인증 서비스가 호출됩니다. 세션 쿠키로 인증되지 않은 요청의 경우, 요청에 API 토큰이 포함되어 있는지 검사하여 해당 토큰으로 인증을 진행합니다. 보다 자세한 동작 방식은 Sanctum의 ["how it works"](/docs/8.x/sanctum#how-it-works) 문서를 참고해 주세요.

Sanctum은 [Laravel Jetstream](https://jetstream.laravel.com) 스타터 키트에 기본 포함되어 있으며, 대부분의 웹 애플리케이션 인증 요구에 가장 적합하다고 생각합니다.

<a name="summary-choosing-your-stack"></a>
#### 요약 및 스택 선택

요약하면, 애플리케이션이 브라우저로 접근하는 모놀리식 라라벨 프로젝트라면 라라벨의 내장 인증 서비스를 사용하게 됩니다.

그 다음으로, 외부 API 소비자가 존재하는 API를 제공한다면 [Passport](/docs/8.x/passport) 또는 [Sanctum](/docs/8.x/sanctum) 중에서 선택해 토큰 기반 API 인증 기능을 추가할 수 있습니다. 일반적으로 복잡한 OAuth2 기능이 필요하지 않다면, 간단하고 강력한 솔루션인 Sanctum 사용을 권장합니다. Sanctum은 API, SPA, 모바일 인증, "scopes(역할 범위)" 및 "abilities(권한)"까지 지원합니다.

라라벨 백엔드를 기반으로 하는 SPA(single-page application)를 만들 경우에는 반드시 [Laravel Sanctum](/docs/8.x/sanctum)을 사용하는 것이 좋습니다. Sanctum을 쓸 때는 [백엔드 인증 라우트를 직접 구현하거나](#authenticating-users), [Laravel Fortify](/docs/8.x/fortify)를 헤드리스 인증 서비스로 사용해 회원가입, 비밀번호 재설정, 이메일 인증 등의 라우트와 컨트롤러를 구축할 수 있습니다.

만약 OAuth2 명세의 전체 기능이 반드시 필요한 경우에만 Passport를 선택하시길 바랍니다.

그리고, 빠르게 시작하려면 [Laravel Jetstream](https://jetstream.laravel.com)을 추천합니다. Jetstream은 라라벨 내장 인증 서비스와 Sanctum이 이미 적용되어 있어, 권장되는 인증 스택으로 새로운 라라벨 애플리케이션을 신속하게 시작할 수 있습니다.

<a name="authentication-quickstart"></a>
## 인증 빠른 시작

> [!NOTE]
> 이 문서는 UI 스캐폴딩을 포함한 [라라벨 애플리케이션 스타터 키트](/docs/8.x/starter-kits)에 기반한 인증 사용자 생성 방법을 다룹니다. 라라벨의 인증 시스템을 직접 다루고 싶다면, [수동으로 사용자 인증하기](#authenticating-users) 항목을 참고하세요.

<a name="install-a-starter-kit"></a>
### 스타터 키트 설치

먼저, [라라벨 애플리케이션 스타터 키트](/docs/8.x/starter-kits)를 설치합니다. 현재 제공되는 스타터 키트인 Laravel Breeze와 Laravel Jetstream은 새 라라벨 애플리케이션에서 인증 기능을 아름답고 편리하게 시작할 수 있도록 돕습니다.

Laravel Breeze는 로그인, 회원가입, 비밀번호 재설정, 이메일 인증, 비밀번호 확인 등 모든 인증 기능을 아주 간결하고 단순하게 제공합니다. 뷰 레이어는 [Blade 템플릿](/docs/8.x/blade)과 [Tailwind CSS](https://tailwindcss.com)로 구성되어 있습니다. Breeze는 [Inertia](https://inertiajs.com)를 사용해 Vue나 React 기반의 스캐폴딩 옵션도 제공합니다.

[Laravel Jetstream](https://jetstream.laravel.com)은 더 강력한 스타터 키트로, [Livewire](https://laravel-livewire.com) 또는 [Inertia.js & Vue](https://inertiajs.com)를 기반으로 애플리케이션을 스캐폴딩하는 지원을 제공합니다. Jetstream은 2단계 인증, 팀, 프로필 관리, 브라우저 세션, [Sanctum](/docs/8.x/sanctum)을 통한 API 지원, 계정 삭제 등 다양한 부가 기능도 제공합니다.

<a name="retrieving-the-authenticated-user"></a>
### 인증된 사용자 가져오기

인증 스타터 키트를 설치하고 사용자가 회원가입 또는 인증에 성공한 후에는, 현재 인증된 사용자 정보와 자주 상호작용하게 됩니다. 들어오는 요청(Request)을 처리하는 중에, `Auth` 파사드의 `user` 메서드를 통해 현재 인증된 사용자를 쉽게 얻을 수 있습니다.

```
use Illuminate\Support\Facades\Auth;

// 현재 인증된 사용자 가져오기...
$user = Auth::user();

// 현재 인증된 사용자의 ID 가져오기...
$id = Auth::id();
```

또는, 사용자가 인증된 이후에는 `Illuminate\Http\Request` 인스턴스를 통해서도 인증된 사용자에 접근할 수 있습니다. 컨트롤러 메서드에서 타입힌트로 `Illuminate\Http\Request`를 사용하면 라라벨이 자동으로 객체를 주입하므로, 이 객체의 `user` 메서드로 언제든 인증 사용자를 참조할 수 있습니다.

```
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FlightController extends Controller
{
    /**
     * 기존 항공편 정보 수정.
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
#### 현재 사용자가 인증돼 있는지 여부 확인

들어오는 HTTP 요청의 사용자가 인증된 상태인지 확인하려면 `Auth` 파사드의 `check` 메서드를 사용할 수 있습니다. 이 메서드는 사용자가 로그인되어 있으면 `true`를 반환합니다.

```
use Illuminate\Support\Facades\Auth;

if (Auth::check()) {
    // 사용자가 로그인된 상태입니다...
}
```

> [!TIP]
> `check` 메서드로 사용자가 인증돼 있는지 확인할 수 있지만, 보통은 미들웨어를 사용해 인증된 사용자만 특정 라우트/컨트롤러에 접근하도록 제한하는 것이 일반적입니다. 자세한 내용은 [라우트 보호하기](/docs/8.x/authentication#protecting-routes) 문서를 참고하세요.

<a name="protecting-routes"></a>
### 라우트 보호하기

[라우트 미들웨어](/docs/8.x/middleware)를 사용하면, 인증된 사용자만 특정 라우트에 접근할 수 있도록 할 수 있습니다. 라라벨은 `Illuminate\Auth\Middleware\Authenticate` 클래스를 참조하는 `auth` 미들웨어를 기본 제공하며, 이 미들웨어는 이미 애플리케이션의 HTTP 커널에 등록되어 있습니다. 사용 방법은 아래와 같이 라우트 정의에 미들웨어를 지정하면 됩니다.

```
Route::get('/flights', function () {
    // 인증된 사용자만 이 라우트에 접근할 수 있습니다...
})->middleware('auth');
```

<a name="redirecting-unauthenticated-users"></a>
#### 인증되지 않은 사용자 리다이렉션

`auth` 미들웨어가 인증되지 않은 사용자를 감지하면, 해당 사용자를 `login` [네임드 라우트](/docs/8.x/routing#named-routes)로 리다이렉트합니다. 이 동작은 `app/Http/Middleware/Authenticate.php` 파일의 `redirectTo` 함수를 수정하여 변경할 수 있습니다.

```
/**
 * 사용자가 리다이렉트되어야 할 경로를 반환합니다.
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
#### 가드 지정하기

`auth` 미들웨어를 라우트에 적용할 때, 인증에 사용할 "가드"를 명시적으로 지정할 수도 있습니다. 지정한 가드는 `auth.php` 설정 파일의 `guards` 배열에 정의된 키 중 하나여야 합니다.

```
Route::get('/flights', function () {
    // 인증된 admin 가드 사용자만 이 라우트에 접근할 수 있습니다...
})->middleware('auth:admin');
```

<a name="login-throttling"></a>
### 로그인 시도 제한

Laravel Breeze 또는 Laravel Jetstream [스타터 키트](/docs/8.x/starter-kits)를 사용하는 경우, 로그인 시도에 대해 자동으로 rate limit(속도 제한)이 적용됩니다. 기본적으로 몇 번의 실패 후에는 1분 동안 로그인할 수 없습니다. 이 제한은 사용자의 사용자명/이메일과 IP 주소를 조합해 개별적으로 동작합니다.

> [!TIP]
> 애플리케이션 내 다른 라우트에도 rate limit을 적용하고 싶다면 [rate limit 문서](/docs/8.x/routing#rate-limiting)를 참고하세요.

<a name="authenticating-users"></a>
## 사용자 수동 인증

라라벨 [애플리케이션 스타터 키트](/docs/8.x/starter-kits)가 제공하는 인증 스캐폴딩을 꼭 사용할 필요는 없습니다. 이 스캐폴딩을 사용하지 않기로 했다면, 라라벨의 인증 클래스를 직접 활용해 사용자 인증을 관리해야 합니다. 걱정하지 마세요. 아주 간단하고 직관적으로 할 수 있습니다!

인증 서비스는 `Auth` [파사드](/docs/8.x/facades)를 통해 사용할 수 있습니다. 먼저 클래스 상단에 `Auth` 파사드를 임포트해야 합니다. 다음으로, `attempt` 메서드를 살펴봅니다. 이 메서드는 일반적으로 애플리케이션의 "로그인" 폼에서 인증 시도 시 사용합니다. 인증에 성공하면, [세션 고정(session fixation)](https://en.wikipedia.org/wiki/Session_fixation) 공격을 방지하기 위해 사용자의 [세션](/docs/8.x/session)을 반드시 재생성해야 합니다.

```
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    /**
     * 인증 시도 처리.
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
        ]);
    }
}
```

`attempt` 메서드는 첫 번째 인자로 키-값 쌍의 배열을 받습니다. 이 배열의 값을 이용해 데이터베이스에서 사용자를 조회합니다. 위 예시의 경우에는 `email` 컬럼 값으로 사용자를 찾게 됩니다. 사용자를 찾으면 데이터베이스에 저장된 해시된 비밀번호와 입력받은 `password` 값을 자동으로 비교합니다. 직접 비밀번호를 해시할 필요는 없습니다. 두 값이 일치하면 사용자의 인증 세션이 시작됩니다.

참고로, 라라벨의 인증 서비스는 인증 가드의 "프로바이더" 설정에 따라 사용자를 데이터베이스에서 조회합니다. 기본 `config/auth.php` 파일에서는 Eloquent 사용자 프로바이더가 지정되어 있고, 사용자 모델로 `App\Models\User`을 사용하도록 되어 있습니다. 필요에 따라 이 값을 얼마든지 교체할 수 있습니다.

`attempt` 메서드는 인증 성공 시 `true`, 실패 시 `false`를 반환합니다.

또한 `intended` 메서드는 사용자가 인증 미들웨어에 의해 접근이 차단되기 전 시도했던 URL로 리다이렉트 시켜주며, 의도한 목적지가 없으면 대체 URL을 지정할 수도 있습니다.

<a name="specifying-additional-conditions"></a>
#### 추가 조건 지정하기

필요하다면, 이메일과 비밀번호 외에 다른 쿼리 조건도 인증 쿼리에 추가할 수 있습니다. 이를 위해 인증 정보를 담은 배열에 필요한 조건을 더해 `attempt`에 전달하면 됩니다. 예를 들어 사용자가 "active" 상태인지 검사할 수도 있습니다.

```
if (Auth::attempt(['email' => $email, 'password' => $password, 'active' => 1])) {
    // 인증에 성공했습니다...
}
```

> [!NOTE]
> 예시에서 사용된 `email`은 필수 컬럼이 아니라, 단순히 예시입니다. 실제로는 데이터베이스의 "username" 역할을 하는 컬럼 이름을 사용해야 합니다.

<a name="accessing-specific-guard-instances"></a>
#### 특정 가드 인스턴스 사용

`Auth` 파사드의 `guard` 메서드를 이용하면, 인증에 사용할 가드 인스턴스를 명시적으로 지정할 수 있습니다. 이를 통해 서로 다른 인증 모델이나 사용자 테이블을 각기 다른 애플리케이션 영역에서 독립적으로 사용할 수 있습니다.

`guard` 메서드에 전달하는 가드 이름은 반드시 `auth.php` 설정 파일에 정의되어야 합니다.

```
if (Auth::guard('admin')->attempt($credentials)) {
    // ...
}
```

<a name="remembering-users"></a>
### 사용자 기억하기

많은 웹 애플리케이션에서는 로그인 폼에 "로그인 상태 유지(remember me)" 체크박스를 제공합니다. 이 기능을 적용하려면, `attempt` 메서드의 두 번째 인자에 불린 값을 전달하면 됩니다.

이 값이 `true`이면 라라벨은 사용자를 수동 로그아웃할 때까지 계속 인증된 상태로 유지합니다. 이 기능을 사용하려면 `users` 테이블에 문자열 타입의 `remember_token` 컬럼이 존재해야 하며, 라라벨의 기본 `users` 테이블 마이그레이션에는 이미 이 컬럼이 포함되어 있습니다.

```
use Illuminate\Support\Facades\Auth;

if (Auth::attempt(['email' => $email, 'password' => $password], $remember)) {
    // 사용자가 로그인 상태로 계속 유지됩니다...
}
```

<a name="other-authentication-methods"></a>
### 기타 인증 방식

<a name="authenticate-a-user-instance"></a>
#### 사용자 인스턴스 인증

이미 존재하는 사용자 인스턴스를 현재 인증 사용자로 직접 설정해야 할 경우, 해당 인스턴스를 `Auth` 파사드의 `login` 메서드에 전달하면 됩니다. 이때의 사용자 인스턴스는 반드시 `Illuminate\Contracts\Auth\Authenticatable` [계약](/docs/8.x/contracts)을 구현해야 하며, 라라벨의 기본 `App\Models\User` 모델은 이미 이를 구현하고 있습니다. 주로 사용자가 회원가입을 마치고 곧바로 로그인 상태로 만들어줘야 할 때 유용합니다.

```
use Illuminate\Support\Facades\Auth;

Auth::login($user);
```

필요하다면 두 번째 인자로 불린 값을 전달해 "로그인 상태 유지(remember me)" 기능도 사용할 수 있습니다.

```
Auth::login($user, $remember = true);
```

먼저 사용할 가드를 지정한 뒤, `login`을 호출하는 것도 가능합니다.

```
Auth::guard('admin')->login($user);
```

<a name="authenticate-a-user-by-id"></a>
#### 사용자 ID로 인증

사용자 데이터베이스 레코드의 기본 키(primary key)를 이용해 인증하려면 `loginUsingId` 메서드를 사용할 수 있습니다. 첫 번째 인자로 인증하려는 사용자의 기본 키 값을 전달합니다.

```
Auth::loginUsingId(1);
```

두 번째 인자에 `remember me` 여부를 위한 불린 값을 추가할 수 있습니다.

```
Auth::loginUsingId(1, $remember = true);
```

<a name="authenticate-a-user-once"></a>
#### 한 번만 인증

`once` 메서드를 이용하면, 한 번의 요청에 한해 사용자 인증을 할 수 있습니다. 이때는 세션이나 쿠키가 사용되지 않습니다.

```
if (Auth::once($credentials)) {
    //
}
```

<a name="http-basic-authentication"></a>
## HTTP Basic 인증

[HTTP Basic 인증](https://en.wikipedia.org/wiki/Basic_access_authentication)은 별도의 "로그인" 페이지를 만들지 않고 빠르게 사용자를 인증할 수 있는 방법입니다. 시작하려면, `auth.basic` [미들웨어](/docs/8.x/middleware)를 라우트에 적용하세요. `auth.basic` 미들웨어는 라라벨 프레임워크에 기본 포함되어 있으므로 직접 정의할 필요가 없습니다.

```
Route::get('/profile', function () {
    // 인증된 사용자만 접근할 수 있습니다...
})->middleware('auth.basic');
```

이 미들웨어를 라우트에 적용하면, 브라우저에서 해당 경로 접속 시 인증 정보를 입력하라는 프롬프트가 자동으로 표시됩니다. 기본적으로 `auth.basic` 미들웨어는 `users` 데이터베이스 테이블의 `email` 컬럼을 사용자 이름으로 간주합니다.

<a name="a-note-on-fastcgi"></a>
#### FastCGI를 사용할 때 주의사항

라라벨 애플리케이션을 PHP FastCGI와 Apache 조합으로 서비스하는 경우 HTTP Basic 인증이 올바로 동작하지 않을 수 있습니다. 이때에는 아래 코드를 `.htaccess` 파일에 추가해 주세요.

```
RewriteCond %{HTTP:Authorization} ^(.+)$
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
```

<a name="stateless-http-basic-authentication"></a>
### Stateless HTTP Basic 인증

세션에 사용자 식별 쿠키를 남기지 않고 HTTP Basic 인증을 하고 싶을 때도 있습니다. 주로 API 요청 인증에 이 방법이 유용합니다. 이를 위해서는 [미들웨어를 새로 정의](/docs/8.x/middleware)해, `onceBasic` 메서드를 호출하면 됩니다. `onceBasic`이 아무 응답도 반환하지 않으면, 요청은 애플리케이션의 다음 단계로 넘어갑니다.

```
<?php

namespace App\Http\Middleware;

use Illuminate\Support\Facades\Auth;

class AuthenticateOnceWithBasicAuth
{
    /**
     * 들어오는 요청 처리.
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

이제 [라우트 미들웨어로 등록](/docs/8.x/middleware#registering-middleware)한 다음, 라우트에 적용하세요.

```
Route::get('/api/user', function () {
    // 인증된 사용자만 접근할 수 있습니다...
})->middleware('auth.basic.once');
```

<a name="logging-out"></a>
## 로그아웃 처리

사용자를 수동으로 로그아웃시키려면, `Auth` 파사드의 `logout` 메서드를 사용하면 됩니다. 이 메서드는 사용자의 세션에서 인증 정보를 삭제하므로, 이후 요청부터는 인증이 해제됩니다.

또한 로그아웃 후에는, 사용자의 세션을 즉시 무효화하고 [CSRF 토큰](/docs/8.x/csrf)을 재생성하는 것이 좋습니다. 로그아웃 후 일반적으로 애플리케이션 홈으로 리다이렉트합니다.

```
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * 사용자를 애플리케이션에서 로그아웃합니다.
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

라라벨은 한 사용자가 비밀번호를 변경하거나 업데이트할 때, 현재 사용하는 기기는 그대로 인증된 상태로 두면서 다른 모든 기기에서의 세션을 무효화(로그아웃) 할 수 있는 기능을 제공합니다.

시작하기 전에, `App\Http\Kernel` 클래스의 `web` 미들웨어 그룹에 `Illuminate\Session\Middleware\AuthenticateSession` 미들웨어가 활성화(주석 해제)되어 있는지 확인하세요.

```
'web' => [
    // ...
    \Illuminate\Session\Middleware\AuthenticateSession::class,
    // ...
],
```

이제 `Auth` 파사드의 `logoutOtherDevices` 메서드를 사용할 수 있습니다. 이 메서드는 사용자가 현재 비밀번호를 입력해야 하며, 애플리케이션에서 해당 값을 폼을 통해 받아야 합니다.

```
use Illuminate\Support\Facades\Auth;

Auth::logoutOtherDevices($currentPassword);
```

`logoutOtherDevices` 메서드가 호출되면, 해당 사용자의 다른 모든 세션이 완전히 무효화되며, 기존에 인증되어 있던 모든 가드에서 로그아웃 처리됩니다.

<a name="password-confirmation"></a>
## 비밀번호 확인

애플리케이션을 개발하다 보면, 사용자가 민감한 작업을 수행하거나 중요한 영역으로 이동하기 전에 비밀번호를 다시 한번 확인하도록 해야 할 때가 있습니다. 라라벨은 이를 위한 미들웨어를 기본 제공하여, 이 과정을 아주 쉽게 구현할 수 있게 합니다. 비밀번호 확인 기능 구현을 위해서는 두 개의 라우트를 정의해야 합니다. 하나는 비밀번호를 입력받는 뷰를 보여주는 라우트, 다른 하나는 입력받은 비밀번호를 검증하고 사용자를 원래 목적지로 이동시키는 라우트입니다.

> [!TIP]
> 아래 문서는 라라벨 비밀번호 확인 기능을 직접 통합하는 방법을 안내합니다. 더 빠른 구현을 원하신다면, [라라벨 애플리케이션 스타터 키트](/docs/8.x/starter-kits)도 이 기능을 지원합니다.

<a name="password-confirmation-configuration"></a>
### 설정

사용자가 비밀번호를 확인한 후에는 3시간(기본값) 동안 다시 비밀번호를 입력할 필요가 없습니다. 이 시간은 애플리케이션의 `config/auth.php` 설정 파일에서 `password_timeout` 값으로 조정할 수 있습니다.

<a name="password-confirmation-routing"></a>
### 라우팅

<a name="the-password-confirmation-form"></a>
#### 비밀번호 확인 폼

먼저, 비밀번호 확인을 요청하는 뷰를 보여줄 라우트를 정의합니다.

```
Route::get('/confirm-password', function () {
    return view('auth.confirm-password');
})->middleware('auth')->name('password.confirm');
```

이 라우트가 반환하는 뷰에는 반드시 `password` 필드를 가진 폼이 포함되어 있어야 하며, 민감한 영역에 접근하기 때문에 비밀번호 확인이 필요하다는 안내문을 자유롭게 추가할 수 있습니다.

<a name="confirming-the-password"></a>
#### 비밀번호 확인 처리

그 다음, "비밀번호 확인" 뷰에서 폼 요청을 받아 처리할 라우트를 정의합니다. 이 라우트는 비밀번호 유효성 검사 및 목적지로의 리다이렉션을 담당합니다.

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

이 라우트의 내부 동작을 살펴보면, 먼저 폼 입력의 `password` 필드가 현재 인증된 사용자의 비밀번호와 일치하는지 검사합니다. 일치하면 사용자가 비밀번호를 확인했다는 정보를 세션에 저장하는데, 이때 `passwordConfirmed` 메서드를 사용합니다. 그 후 사용자를 원래 목적지로 리다이렉트합니다.

<a name="password-confirmation-protecting-routes"></a>
### 라우트 보호

비밀번호 확인이 필요한 라우트에는 반드시 `password.confirm` 미들웨어를 적용해야 합니다. 이 미들웨어는 라라벨에서 기본 설치시 포함되어 있으며, 사용자가 비밀번호를 확인한 직후 원하는 위치로 사용자를 되돌려 보내기 위해 목적지를 세션에 저장합니다. 그 후 사용자를 `password.confirm` [네임드 라우트](/docs/8.x/routing#named-routes)로 리다이렉트합니다.

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

`Auth` 파사드의 `extend` 메서드를 사용하면, 직접 인증 가드를 정의할 수도 있습니다. `extend` 호출은 보통 [서비스 프로바이더](/docs/8.x/providers) 내부에 위치합니다. 라라벨에는 이미 `AuthServiceProvider`가 있으므로, 해당 파일에 코드를 추가하면 됩니다.

```
<?php

namespace App\Providers;

use App\Services\Auth\JwtGuard;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Auth;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * 인증/인가 서비스 등록.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();

        Auth::extend('jwt', function ($app, $name, array $config) {
            // Illuminate\Contracts\Auth\Guard 인스턴스 반환...

            return new JwtGuard(Auth::createUserProvider($config['provider']));
        });
    }
}
```

위 예시에서처럼, `extend`에 전달되는 콜백은 반드시 `Illuminate\Contracts\Auth\Guard` 구현체를 반환해야 하며, 이 인터페이스의 여러 메서드를 반드시 구현해야 합니다. 커스텀 가드 작성 후에는 `auth.php` 설정 파일 내 `guards` 섹션에서 사용할 수 있습니다.

```
'guards' => [
    'api' => [
        'driver' => 'jwt',
        'provider' => 'users',
    ],
],
```

<a name="closure-request-guards"></a>
### 클로저 요청 가드

HTTP 요청 기반의 간단한 커스텀 인증 시스템은 `Auth::viaRequest` 메서드로 곧바로 정의할 수 있습니다. 하나의 클로저만으로 인증 프로세스를 쉽고 빠르게 구현할 수 있습니다.

시작하려면, `AuthServiceProvider`의 `boot` 메서드 내부에서 `Auth::viaRequest`를 호출하세요. 첫 번째 인자는 커스텀 가드의 이름(임의 문자열), 두 번째 인자는 HTTP 요청을 받고 인증에 성공하면 사용자 인스턴스를, 실패하면 `null`을 반환하는 클로저입니다.

```
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * 인증/인가 서비스 등록.
 *
 * @return void
 */
public function boot()
{
    $this->registerPolicies();

    Auth::viaRequest('custom-token', function (Request $request) {
        return User::where('token', $request->token)->first();
    });
}
```

커스텀 인증 드라이버를 정의한 후에는 `auth.php` 설정 파일의 `guards`에서 `driver` 이름으로 사용할 수 있습니다.

```
'guards' => [
    'api' => [
        'driver' => 'custom-token',
    ],
],
```

<a name="adding-custom-user-providers"></a>
## 커스텀 사용자 제공자 추가

기존의 관계형 데이터베이스가 아닌 다른 저장소를 사용자 정보 저장에 사용할 경우, 라라벨에 직접 사용자 프로바이더를 추가할 수 있습니다. 이를 위해 `Auth` 파사드의 `provider` 메서드로 사용자 프로바이더를 등록하면 됩니다. 이때 반환 타입은 반드시 `Illuminate\Contracts\Auth\UserProvider` 여야 합니다.

```
<?php

namespace App\Providers;

use App\Extensions\MongoUserProvider;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Auth;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * 인증/인가 서비스 등록.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();

        Auth::provider('mongo', function ($app, array $config) {
            // Illuminate\Contracts\Auth\UserProvider 인스턴스 반환...

            return new MongoUserProvider($app->make('mongo.connection'));
        });
    }
}
```

`provider` 메서드로 사용자 프로바이더 등록이 끝나면, `auth.php` 설정 파일에서 새 드라이버로 프로바이더를 선언해야 합니다.

```
'providers' => [
    'users' => [
        'driver' => 'mongo',
    ],
],
```

그리고 이제 `guards` 설정에서 이 프로바이더를 지정해 사용할 수 있습니다.

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

`Illuminate\Contracts\Auth\UserProvider` 구현체는 `Illuminate\Contracts\Auth\Authenticatable` 구현체를 MySQL, MongoDB 등 영구 저장소에서 꺼내오는 역할을 합니다. 이 두 인터페이스 덕분에 사용자 데이터 저장 방식이나 클래스타입과 관계없이 라라벨 인증 시스템이 일관성 있게 동작할 수 있습니다.

아래는 `Illuminate\Contracts\Auth\UserProvider` 계약 예시입니다.

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

`retrieveById`는 보통 사용자 ID(예: MySQL의 auto-increment ID) 등 사용자를 특정할 수 있는 키 값을 받아 해당하는 `Authenticatable` 구현체를 반환해야 합니다.

`retrieveByToken`은 고유 `$identifier`와 "remember me" `$token`(예: `remember_token` 컬럼 값)으로 사용자를 조회해 반환합니다.

`updateRememberToken`은 `$user` 인스턴스의 `remember_token` 값을 갱신합니다. 사용자가 "로그인 상태 유지"로 로그인하거나, 로그아웃할 때마다 새로운 토큰이 배정됩니다.

`retrieveByCredentials`는 `Auth::attempt` 호출 시 전달된 인증 정보 배열을 받아, 해당 조건에 맞는 사용자를 영구 저장소에서 조회합니다. 예를 들어 `$credentials['username']`과 일치하는 사용자 레코드를 where 쿼리로 조회하면 됩니다. 이 메서드는 **비밀번호 검증·인증 과정은 절대 포함하지 않아야 합니다.**

`validateCredentials`는 주어진 `$user`와 `$credentials`를 비교해 비밀번호 등 자격 증명을 검증합니다. 예를 들어, 보통 `Hash::check`를 통해 `$user->getAuthPassword()`와 `$credentials['password']`를 비교하고, 결과에 따라 `true` 또는 `false`를 반환합니다.

<a name="the-authenticatable-contract"></a>
### Authenticatable 계약

이제 UserProvider의 각 메서드를 살펴보았으니, 실제 반환해야 하는 `Authenticatable` 계약도 살펴봅시다. UserProvider의 `retrieveById`, `retrieveByToken`, `retrieveByCredentials` 메서드는 모두 이 인터페이스를 반환해야 합니다.

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

이 인터페이스는 매우 단순합니다. `getAuthIdentifierName`은 사용자 개체의 "기본 키" 필드 이름을, `getAuthIdentifier`는 "기본 키" 값을 반환해야 합니다(예: MySQL의 auto-increment 값). `getAuthPassword`는 사용자의 해시된 비밀번호를 반환해야 합니다.

이 덕분에 인증 시스템이 어떤 ORM, 저장소 구현체에서든 동작할 수 있습니다. 라라벨은 `app/Models` 디렉터리에 `App\Models\User` 클래스를 제공하며, 이 클래스가 이미 이 인터페이스를 구현하고 있습니다.

<a name="events"></a>
## 이벤트

라라벨은 인증 과정 중에 다양한 [이벤트](/docs/8.x/events)를 발생시킵니다. `EventServiceProvider`에서 원하는 이벤트에 리스너를 등록할 수 있습니다.

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
