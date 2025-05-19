# 라라벨 포티파이 (Laravel Fortify)

- [소개](#introduction)
    - [Fortify란?](#what-is-fortify)
    - [언제 Fortify를 사용해야 하나요?](#when-should-i-use-fortify)
- [설치](#installation)
    - [Fortify의 기능](#fortify-features)
    - [뷰 비활성화](#disabling-views)
- [인증](#authentication)
    - [사용자 인증 커스터마이징](#customizing-user-authentication)
    - [인증 파이프라인 커스터마이징](#customizing-the-authentication-pipeline)
    - [리디렉션 커스터마이징](#customizing-authentication-redirects)
- [2단계 인증](#two-factor-authentication)
    - [2단계 인증 활성화](#enabling-two-factor-authentication)
    - [2단계 인증으로 인증하기](#authenticating-with-two-factor-authentication)
    - [2단계 인증 비활성화](#disabling-two-factor-authentication)
- [회원가입](#registration)
    - [회원가입 커스터마이징](#customizing-registration)
- [비밀번호 초기화](#password-reset)
    - [비밀번호 초기화 링크 요청](#requesting-a-password-reset-link)
    - [비밀번호 재설정](#resetting-the-password)
    - [비밀번호 초기화 커스터마이징](#customizing-password-resets)
- [이메일 인증](#email-verification)
    - [라우트 보호](#protecting-routes)
- [비밀번호 확인](#password-confirmation)

<a name="introduction"></a>
## 소개

[Laravel Fortify](https://github.com/laravel/fortify)는 라라벨을 위한 프론트엔드에 독립적인 인증 백엔드 구현 패키지입니다. Fortify는 로그인, 회원가입, 비밀번호 초기화, 이메일 인증 등 라라벨의 모든 인증 기능 구현에 필요한 라우트와 컨트롤러를 등록해 줍니다. Fortify를 설치한 뒤 `route:list` 아티즌 명령어를 실행하면, Fortify가 등록한 라우트들을 확인할 수 있습니다.

Fortify는 자체적으로 사용자 인터페이스(UI)를 제공하지 않으므로, 여러분이 별도로 UI를 구축하여 Fortify가 제공하는 라우트로 요청이 전송되도록 해야 합니다. 아래 문서에서는 이러한 라우트들에 어떻게 요청을 보내는지 자세히 설명합니다.

> [!NOTE]
> Fortify는 라라벨의 인증 기능 구현을 빠르게 시작할 수 있도록 도와주는 패키지입니다. **반드시 사용해야 하는 것은 아닙니다.** 필요하다면 [인증](/docs/12.x/authentication), [비밀번호 초기화](/docs/12.x/passwords), [이메일 인증](/docs/12.x/verification) 공식 문서에 따라 직접 라라벨 인증 서비스를 사용할 수도 있습니다.

<a name="what-is-fortify"></a>
### Fortify란?

앞서 언급했듯이, Laravel Fortify는 라라벨을 위한 프론트엔드에 독립적인 인증 백엔드 구현 패키지입니다. Fortify는 로그인, 회원가입, 비밀번호 초기화, 이메일 인증 등 라라벨의 모든 인증 기능 구현에 필요한 라우트와 컨트롤러를 등록해 줍니다.

**라라벨의 인증 기능을 사용하기 위해 Fortify를 반드시 사용할 필요는 없습니다.** 필요한 경우 [인증](/docs/12.x/authentication), [비밀번호 초기화](/docs/12.x/passwords), [이메일 인증](/docs/12.x/verification) 공식 문서에 따라 직접 구현할 수 있습니다.

라라벨에 처음 입문하셨다면, Fortify 사용에 앞서 [애플리케이션 스타터 키트](/docs/12.x/starter-kits)를 먼저 활용해 보시는 것을 추천합니다. 스타터 키트는 [Tailwind CSS](https://tailwindcss.com)로 구성된 사용자 인터페이스와 함께, 인증 스캐폴딩(인증 관련 코드 구조)을 제공합니다. 이를 통해 라라벨의 인증 기능을 학습하고 익숙해질 수 있으며, 이후 Fortify로 백엔드 인증 구현만 별도로 적용할 수도 있습니다.

Laravel Fortify는 기본적으로 애플리케이션 스타터 키트의 인증 라우트와 컨트롤러 구현만 패키지 형태로 제공하되, 사용자 인터페이스(UI)는 포함하지 않기 때문에, 여러분이 원하는 프론트엔드로 자유롭게 인증 기능을 연동할 수 있습니다.

<a name="when-should-i-use-fortify"></a>
### 언제 Fortify를 사용해야 하나요?

Laravel Fortify를 언제 사용하는 것이 적합한지 궁금하실 수 있습니다. 우선, 라라벨의 [애플리케이션 스타터 키트](/docs/12.x/starter-kits)를 사용하고 있다면 별도로 Fortify를 설치할 필요가 없습니다. 스타터 키트에는 이미 완전한 인증 구현이 포함되어 있습니다.

스타터 키트를 사용하지 않고, 여러분의 애플리케이션에 인증 기능이 필요하다면 2가지 선택지가 있습니다. 직접 인증 기능을 구현하거나, Fortify를 활용하여 백엔드 인증 구현을 적용하는 방법입니다.

Fortify를 설치하면, 여러분이 구축한 UI에서 본 문서에 정리된 Fortify의 인증 라우트로 요청을 전송하여 사용자 인증 및 회원가입을 처리하게 됩니다.

반대로 Fortify 없이 직접 인증 서비스를 사용하고 싶다면, [인증](/docs/12.x/authentication), [비밀번호 초기화](/docs/12.x/passwords), [이메일 인증](/docs/12.x/verification) 공식 문서를 참고하여 구현하면 됩니다.

<a name="laravel-fortify-and-laravel-sanctum"></a>
#### Laravel Fortify와 Laravel Sanctum

일부 개발자들은 [Laravel Sanctum](/docs/12.x/sanctum)과 Fortify의 차이에 대해 혼란을 겪기도 합니다. 이 두 패키지는 서로 다른 역할을 수행하며, 겹치거나 경쟁하는 패키지가 아닙니다.

Laravel Sanctum은 API 토큰 관리와 세션 쿠키/토큰을 활용한 기존 사용자 인증만을 담당합니다. 회원가입, 비밀번호 초기화와 같은 라우트는 제공하지 않습니다.

따라서, API를 제공하는 애플리케이션이나 SPA(싱글 페이지 애플리케이션)를 만들면서 인증 계층을 직접 구축하려는 경우, 회원가입·비밀번호 초기화 등에는 Fortify(백엔드 인증 기능 사용), API 토큰 관리나 세션 인증에는 Sanctum을 함께 활용하는 것이 일반적입니다.

<a name="installation"></a>
## 설치

먼저, Composer 패키지 매니저를 사용하여 Fortify를 설치합니다.

```shell
composer require laravel/fortify
```

그 다음, `fortify:install` 아티즌 명령어로 Fortify의 리소스 파일을 퍼블리시합니다.

```shell
php artisan fortify:install
```

이 명령어를 실행하면 Fortify의 액션 클래스들이 `app/Actions` 디렉터리에 생성됩니다(디렉터리가 없다면 자동 생성). 또한, `FortifyServiceProvider`, 설정 파일, 필수 데이터베이스 마이그레이션도 모두 퍼블리시됩니다.

이제 데이터베이스 마이그레이션을 진행해야 합니다.

```shell
php artisan migrate
```

<a name="fortify-features"></a>
### Fortify의 기능

`fortify` 설정 파일에는 `features`라는 구성 배열이 있습니다. 이 배열은 Fortify가 기본으로 노출할 백엔드 라우트/기능을 정의합니다. 대부분의 라라벨 애플리케이션에서 사용하는 기본 인증 기능만 활성화할 것을 권장합니다.

```php
'features' => [
    Features::registration(),
    Features::resetPasswords(),
    Features::emailVerification(),
],
```

<a name="disabling-views"></a>
### 뷰 비활성화

기본적으로 Fortify는 로그인 화면, 회원가입 화면 등 뷰(View)를 반환하는 라우트도 정의합니다. 하지만, 여러분의 애플리케이션이 JavaScript로 구동되는 SPA(싱글 페이지 애플리케이션)라면 이러한 라우트가 필요 없을 수 있습니다. 이 경우, Fortify의 `config/fortify.php` 설정 파일에서 `views` 값을 `false`로 지정하여 해당 라우트들을 비활성화할 수 있습니다.

```php
'views' => false,
```

<a name="disabling-views-and-password-reset"></a>
#### 뷰 비활성화와 비밀번호 초기화

Fortify의 뷰 라우트를 비활성화하면서도 여러분의 애플리케이션에서 비밀번호 초기화 기능을 사용한다면, 반드시 "reset password" 뷰를 렌더링할 `password.reset`라는 이름의 라우트도 직접 정의해야 합니다. 이는 라라벨의 `Illuminate\Auth\Notifications\ResetPassword` 알림이 비밀번호 초기화 URL을 생성할 때 `password.reset` 라우트 이름을 사용하기 때문입니다.

<a name="authentication"></a>
## 인증

먼저, Fortify가 "로그인" 뷰를 반환하는 방법을 지정해야 합니다. Fortify는 프론트엔드가 없는(Headless) 인증 라이브러리이므로, 이미 완성된 프론트엔드 인증 기능을 사용하고 싶다면 [애플리케이션 스타터 키트](/docs/12.x/starter-kits)를 활용해야 합니다.

모든 인증 뷰 렌더링 로직은 `Laravel\Fortify\Fortify` 클래스의 적절한 메서드를 사용하여 커스터마이즈할 수 있습니다. 일반적으로 이 메서드는 `App\Providers\FortifyServiceProvider` 클래스의 `boot` 메서드에서 호출합니다. Fortify는 `/login` 라우트를 자동으로 정의하여 이 뷰를 반환합니다.

```php
use Laravel\Fortify\Fortify;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Fortify::loginView(function () {
        return view('auth.login');
    });

    // ...
}
```

로그인 템플릿에는 `/login`으로 POST 요청을 보내는 폼이 포함되어야 합니다. `/login` 엔드포인트는 문자열 타입의 `email` 또는 `username`, `password`를 받아야 하며, email/username 필드명은 `config/fortify.php`의 `username` 값과 일치해야 합니다. 추가로 사용자가 "로그인 유지(remember me)" 기능을 사용하려면 불리언 타입의 `remember` 필드를 포함할 수 있습니다.

로그인에 성공하면 Fortify는 애플리케이션의 `fortify` 설정 파일의 `home` 옵션에 지정된 URI로 리디렉션합니다. 단, XHR(비동기) 요청의 경우 HTTP 200 응답을 반환합니다.

로그인 실패 시에는 로그인 화면으로 다시 리디렉션되며, 검증 에러는 공유된 `$errors` [Blade 템플릿 변수](/docs/12.x/validation#quick-displaying-the-validation-errors)를 통해 확인할 수 있습니다. XHR 요청인 경우 422 HTTP 응답에 검증 에러가 포함되어 반환됩니다.

<a name="customizing-user-authentication"></a>
### 사용자 인증 커스터마이징

Fortify는 기본적으로 설정된 인증 가드와 제공된 자격 증명 정보를 사용해 자동으로 사용자 인증을 처리합니다. 그러나 특정 상황에서는 로그인 자격 증명 검증 및 사용자 조회 방식을 완전히 커스터마이즈하고 싶을 수도 있습니다. Fortify는 `Fortify::authenticateUsing` 메서드로 이러한 기능을 쉽게 구현할 수 있습니다.

이 메서드는 클로저를 인수로 받으며, 클로저는 전달받은 HTTP 요청 객체에서 로그인 자격 증명을 검증하고, 인증된 사용자 인스턴스를 반환해야 합니다. 자격 증명이 잘못됐거나 사용자를 찾을 수 없는 경우에는 `null` 또는 `false`를 반환하면 됩니다. 이 메서드 역시 `FortifyServiceProvider`의 `boot` 메서드에서 호출하는 것이 일반적입니다.

```php
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Laravel\Fortify\Fortify;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Fortify::authenticateUsing(function (Request $request) {
        $user = User::where('email', $request->email)->first();

        if ($user &&
            Hash::check($request->password, $user->password)) {
            return $user;
        }
    });

    // ...
}
```

<a name="authentication-guard"></a>
#### 인증 가드

Fortify가 사용할 인증 가드는 애플리케이션의 `fortify` 설정 파일에서 커스터마이즈할 수 있습니다. 단, 설정한 가드는 반드시 `Illuminate\Contracts\Auth\StatefulGuard` 인터페이스를 구현해야 합니다. SPA(싱글 페이지 애플리케이션)에서 Fortify로 인증을 처리하려면 Laravel 기본값인 `web` 가드와 [Laravel Sanctum](https://laravel.com/docs/sanctum) 조합을 사용하는 것이 권장됩니다.

<a name="customizing-the-authentication-pipeline"></a>
### 인증 파이프라인 커스터마이징

Laravel Fortify는 로그인 요청을 여러 개의 인보커블(호출 가능한) 클래스가 연결된 파이프라인을 통해 처리합니다. 필요하다면 로그인 요청을 거치게 할 커스텀 파이프라인 클래스를 직접 정의할 수 있습니다. 각 클래스는 인자로 들어오는 `Illuminate\Http\Request` 인스턴스와, 파이프라인의 다음 클래스를 실행하는 `$next` 변수를 받아 `__invoke` 메서드를 구현해야 합니다. ([미들웨어](/docs/12.x/middleware)와 구조가 유사합니다.)

커스텀 파이프라인은 `Fortify::authenticateThrough` 메서드로 지정하며, 이 메서드는 로그인 요청이 거칠 클래스 배열을 반환하는 클로저를 받습니다. 일반적으로 `App\Providers\FortifyServiceProvider`의 `boot` 메서드에서 호출합니다.

아래 예시는 기본 파이프라인 구성을 보여주며, 필요에 따라 이 구조를 참고해 수정할 수 있습니다.

```php
use Laravel\Fortify\Actions\AttemptToAuthenticate;
use Laravel\Fortify\Actions\CanonicalizeUsername;
use Laravel\Fortify\Actions\EnsureLoginIsNotThrottled;
use Laravel\Fortify\Actions\PrepareAuthenticatedSession;
use Laravel\Fortify\Actions\RedirectIfTwoFactorAuthenticatable;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;
use Illuminate\Http\Request;

Fortify::authenticateThrough(function (Request $request) {
    return array_filter([
            config('fortify.limiters.login') ? null : EnsureLoginIsNotThrottled::class,
            config('fortify.lowercase_usernames') ? CanonicalizeUsername::class : null,
            Features::enabled(Features::twoFactorAuthentication()) ? RedirectIfTwoFactorAuthenticatable::class : null,
            AttemptToAuthenticate::class,
            PrepareAuthenticatedSession::class,
    ]);
});
```

#### 인증 시도 제한(Throttling)

Fortify는 기본적으로 `EnsureLoginIsNotThrottled` 미들웨어를 이용하여 인증 시도를 제한(쓰로틀링)합니다. 이 미들웨어는 사용자 이름(username)과 IP 주소 조합별로 인증 시도를 제한합니다.

특정 애플리케이션에서는 IP 주소 단위로만 제한 등 다른 방식이 필요할 수도 있습니다. Fortify에서는 `fortify.limiters.login` 설정 옵션을 통해 [커스텀 속도 제한자](/docs/12.x/routing#rate-limiting)를 지정할 수 있습니다. 이 설정은 `config/fortify.php`에 있습니다.

> [!NOTE]
> 인증 시도 제한, [2단계 인증](/docs/12.x/fortify#two-factor-authentication), 외부 웹 애플리케이션 방화벽(WAF) 등을 적절히 조합하면 실제 사용자 보호에 가장 효과적입니다.

<a name="customizing-authentication-redirects"></a>
### 리디렉션 커스터마이징

로그인에 성공하면 Fortify는 애플리케이션의 `fortify` 설정 파일에서 `home` 옵션에 지정한 URI로 리디렉션합니다. XHR(비동기) 요청이라면 200 HTTP 응답을 반환합니다. 로그아웃하면 `/` URI로 이동합니다.

보다 세부적인 동작 커스터마이징이 필요하다면, `LoginResponse`와 `LogoutResponse` 계약 인터페이스의 구현체를 라라벨 [서비스 컨테이너](/docs/12.x/container)에 바인딩할 수 있습니다. 일반적으로 이 작업은 `App\Providers\FortifyServiceProvider` 클래스의 `register` 메서드에서 진행합니다.

```php
use Laravel\Fortify\Contracts\LogoutResponse;

/**
 * Register any application services.
 */
public function register(): void
{
    $this->app->instance(LogoutResponse::class, new class implements LogoutResponse {
        public function toResponse($request)
        {
            return redirect('/');
        }
    });
}
```

<a name="two-factor-authentication"></a>
## 2단계 인증

Fortify의 2단계 인증 기능이 활성화되어 있으면, 사용자는 인증 과정에서 6자리 숫자 토큰을 입력해야 합니다. 이 토큰은 TOTP(Time-based One-Time Password)를 사용해 생성되며, Google Authenticator 등 TOTP 호환 모바일 인증 앱에서 확인할 수 있습니다.

먼저, 애플리케이션의 `App\Models\User` 모델에 `Laravel\Fortify\TwoFactorAuthenticatable` 트레이트가 포함되어 있는지 확인합니다.

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    use Notifiable, TwoFactorAuthenticatable;
}
```

그 다음, 사용자들이 2단계 인증 설정을 관리할 수 있는 화면을 만들어야 합니다. 이 화면에서는 사용자가 2단계 인증을 활성화/비활성화하고, 복구 코드를 재발급받는 기능도 제공해야 합니다.

> 기본적으로 `fortify` 설정 파일의 `features` 배열에서 2단계 인증 설정 변경 시 비밀번호 확인이 필요하도록 구성되어 있습니다. 따라서, 계속 진행하기 전에 Fortify의 [비밀번호 확인](#password-confirmation) 기능을 구현해 두어야 합니다.

<a name="enabling-two-factor-authentication"></a>
### 2단계 인증 활성화

2단계 인증 활성화를 위해, 여러분의 애플리케이션은 Fortify가 정의한 `/user/two-factor-authentication` 엔드포인트로 POST 요청을 전송해야 합니다. 요청이 성공하면 사용자는 이전 URL로 리디렉션되며, 세션 변수 `status`가 `two-factor-authentication-enabled`로 설정됩니다. 이 변수로 성공 메시지를 화면에 표시할 수 있습니다. XHR 요청일 경우에는 200 HTTP 응답이 반환됩니다.

2단계 인증을 활성화해도, 사용자는 "2단계 인증 구성 확인"을 위해 반드시 올바른 인증 코드를 입력해야 합니다. 따라서 아래와 같이 "구성을 완료해 주십시오"라는 메시지를 띄우는 것이 좋습니다.

```html
@if (session('status') == 'two-factor-authentication-enabled')
    <div class="mb-4 font-medium text-sm">
        Please finish configuring two factor authentication below.
    </div>
@endif
```

그 다음, 사용자가 인증 앱에 등록할 수 있는 2단계 인증용 QR 코드를 화면에 표시해야 합니다. Blade로 프론트엔드를 구현하는 경우, 인증된 사용자 인스턴스의 `twoFactorQrCodeSvg` 메서드를 사용해 QR 코드 SVG를 얻을 수 있습니다.

```php
$request->user()->twoFactorQrCodeSvg();
```

만약 JavaScript로 프론트엔드를 구축했다면, `/user/two-factor-qr-code` 엔드포인트로 XHR GET 요청을 보내면 `svg` 키를 포함한 JSON 형태로 QR 코드를 받아올 수 있습니다.

<a name="confirming-two-factor-authentication"></a>
#### 2단계 인증 구성 확인

사용자에게 2단계 인증 QR 코드만 보여주지 말고, 인증 코드를 입력할 수 있는 필드 또한 함께 제공해야 합니다. 이 코드 입력값은 Fortify가 정의한 `/user/confirmed-two-factor-authentication` 엔드포인트로 POST 요청해야 하며, 정상 처리되면 사용자는 이전 URL로 리디렉션되고, 세션 변수 `status`가 `two-factor-authentication-confirmed` 값으로 설정됩니다.

```html
@if (session('status') == 'two-factor-authentication-confirmed')
    <div class="mb-4 font-medium text-sm">
        Two factor authentication confirmed and enabled successfully.
    </div>
@endif
```

XHR 요청일 경우에는 200 HTTP 응답이 반환됩니다.

<a name="displaying-the-recovery-codes"></a>
#### 복구 코드 표시

사용자에게 2단계 인증 복구 코드도 보여주어야 합니다. 복구 코드는 사용자가 모바일 기기를 분실했을 때 인증할 수 있는 백업 수단입니다. Blade 템플릿을 사용한다면 아래처럼 인증된 사용자 인스턴스에서 복구 코드를 가져올 수 있습니다.

```php
(array) $request->user()->recoveryCodes()
```

JavaScript 기반 프론트엔드에서는 `/user/two-factor-recovery-codes` 엔드포인트로 XHR GET 요청을 보내어 복구 코드 배열을 받아올 수 있습니다.

복구 코드를 재발급하려면, 애플리케이션에서 `/user/two-factor-recovery-codes` 엔드포인트로 POST 요청을 보내면 됩니다.

<a name="authenticating-with-two-factor-authentication"></a>
### 2단계 인증으로 인증하기

인증 과정 중 Fortify는 자동으로 사용자를 애플리케이션의 2단계 인증 입력 화면으로 리디렉션합니다. 단, XHR 방식 로그인 요청의 경우 성공 시점의 JSON 응답에 `two_factor` 불린 값이 포함되어 있습니다. 이 값을 확인해 2단계 인증 입력 화면으로 리디렉션 처리해야 합니다.

Fortify가 2단계 인증 화면을 어떤 방식으로 반환할지 지정하기 위해, 다음과 같이 `Laravel\Fortify\Fortify` 클래스의 메서드를 사용합니다. 보통 `App\Providers\FortifyServiceProvider`의 `boot` 메서드에서 호출합니다.

```php
use Laravel\Fortify\Fortify;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Fortify::twoFactorChallengeView(function () {
        return view('auth.two-factor-challenge');
    });

    // ...
}
```

Fortify는 `/two-factor-challenge` 라우트를 정의해서 이 뷰를 반환합니다. `two-factor-challenge` 템플릿에는 `/two-factor-challenge` 엔드포인트로 POST 요청을 보내는 폼이 필요합니다. 이때 `code` 필드에 유효한 TOTP 토큰, 또는 `recovery_code` 필드에 복구 코드를 입력받아야 합니다.

로그인에 성공하면, Fortify는 설정 파일의 `home` 옵션에 지정된 URI로 리디렉션합니다. XHR 요청의 경우 204 HTTP 응답을 반환합니다.

실패한 경우, 2단계 인증 화면으로 다시 리디렉션되고 검증 에러는 `$errors` [Blade 템플릿 변수](/docs/12.x/validation#quick-displaying-the-validation-errors)를 통해 확인할 수 있습니다. XHR 요청이라면 422 HTTP 응답에 에러가 반환됩니다.

<a name="disabling-two-factor-authentication"></a>
### 2단계 인증 비활성화

2단계 인증을 비활성화하려면, 애플리케이션에서 `/user/two-factor-authentication` 엔드포인트로 DELETE 요청을 보내면 됩니다. 이때, Fortify의 2단계 인증 관련 엔드포인트는 [비밀번호 확인](#password-confirmation) 절차를 거친 뒤에 호출해야 하니 주의하세요.

<a name="registration"></a>
## 회원가입

애플리케이션의 회원가입 기능을 구현하려면, Fortify가 "회원가입(register)" 뷰를 반환하는 방법을 지정해야 합니다. Fortify는 프론트엔드가 없는(Headless) 인증 라이브러리이기 때문에, 완성된 인증 UI가 필요하다면 [애플리케이션 스타터 키트](/docs/12.x/starter-kits)를 사용하시기 바랍니다.

모든 뷰 렌더링 로직은 `Laravel\Fortify\Fortify` 클래스의 적절한 메서드로 커스터마이즈할 수 있습니다. 일반적으로는 `App\Providers\FortifyServiceProvider`의 `boot` 메서드에서 아래와 같이 처리합니다.

```php
use Laravel\Fortify\Fortify;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Fortify::registerView(function () {
        return view('auth.register');
    });

    // ...
}
```

Fortify는 `/register` 라우트를 생성해 해당 뷰를 반환합니다. `register` 템플릿에는 Fortify가 정의한 `/register` 엔드포인트로 POST 요청하는 폼을 포함하면 됩니다.

`/register` 엔드포인트는 문자열 타입의 `name`, 문자열 타입 이메일 주소 또는 사용자명, `password`, `password_confirmation` 필드를 기대합니다. 이메일 또는 사용자명 필드명은 설정 파일의 `username` 값과 일치해야 합니다.

회원가입 성공 시, Fortify는 설정 파일의 `home` 옵션에 지정한 URI로 리디렉션하며, XHR(비동기) 요청이라면 201 HTTP 응답이 반환됩니다.

실패한 경우 회원가입 화면으로 이동하고, 검증 에러는 공유된 `$errors` [Blade 템플릿 변수](/docs/12.x/validation#quick-displaying-the-validation-errors)나, XHR 요청의 경우 422 HTTP 응답값으로 확인할 수 있습니다.

<a name="customizing-registration"></a>
### 회원가입 커스터마이징

사용자 검증 및 생성 과정은 Fortify 설치 시 함께 생성된 `App\Actions\Fortify\CreateNewUser` 액션 파일을 수정함으로써 자유롭게 커스터마이즈할 수 있습니다.

<a name="password-reset"></a>
## 비밀번호 초기화

<a name="requesting-a-password-reset-link"></a>
### 비밀번호 초기화 링크 요청

비밀번호 초기화 기능을 구현하려면, Fortify가 "비밀번호 찾기" 뷰를 반환하는 방식을 아래와 같이 지정해야 합니다. Fortify는 헤드리스 인증 라이브러리이므로, 완성된 프론트엔드가 필요하면 [애플리케이션 스타터 키트](/docs/12.x/starter-kits)를 활용하세요.

모든 뷰 렌더링 로직은 `Laravel\Fortify\Fortify` 클래스의 적절한 메서드로 커스터마이즈할 수 있습니다. 일반적으로는 `App\Providers\FortifyServiceProvider`의 `boot` 메서드에서 다음과 같이 호출합니다.

```php
use Laravel\Fortify\Fortify;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Fortify::requestPasswordResetLinkView(function () {
        return view('auth.forgot-password');
    });

    // ...
}
```

Fortify는 `/forgot-password` 엔드포인트를 생성해 뷰를 반환합니다. `forgot-password` 템플릿 폼은 `/forgot-password` 엔드포인트로 POST 요청을 보내야 하며, 입력값으로 문자열 타입의 `email` 필드가 필요합니다. 필드명/DB 컬럼명은 설정 파일의 `email` 값과 같아야 합니다.

<a name="handling-the-password-reset-link-request-response"></a>
#### 비밀번호 초기화 링크 요청 응답 처리

비밀번호 초기화 링크 요청에 성공하면, Fortify는 `/forgot-password` 엔드포인트로 사용자를 다시 리디렉션하고, 사용자에게 이메일로 보안 링크를 발송합니다. XHR 요청이라면 200 HTTP 응답을 반환합니다.

요청 성공 후 `/forgot-password`로 리디렉션된 화면에서는 세션 변수 `status`로 요청 결과 메시지를 표시할 수 있습니다.

`$status` 세션 변수의 값은 애플리케이션의 `passwords` [언어 파일](/docs/12.x/localization)에 정의된 번역 문자열 중 하나와 일치합니다. 이 값을 커스터마이징하고 싶고, 라라벨의 언어 파일을 퍼블리시하지 않았다면 `lang:publish` 아티즌 명령어로 쉽게 수정할 수 있습니다.

```html
@if (session('status'))
    <div class="mb-4 font-medium text-sm text-green-600">
        {{ session('status') }}
    </div>
@endif
```

비밀번호 초기화 링크 요청 실패 시에는 원래 화면으로 이동하고, 검증 에러는 `$errors` [Blade 템플릿 변수](/docs/12.x/validation#quick-displaying-the-validation-errors) 또는 XHR의 422 응답값에서 확인할 수 있습니다.

<a name="resetting-the-password"></a>
### 비밀번호 재설정

비밀번호 초기화 기능을 완성하려면, Fortify가 "비밀번호 재설정" 뷰를 반환하는 방법을 아래와 같이 지정합니다.

모든 뷰 렌더링 로직은 `Laravel\Fortify\Fortify` 클래스의 적절한 메서드로 커스터마이즈할 수 있으며, 이를 `App\Providers\FortifyServiceProvider`의 `boot` 메서드에서 호출하는 것이 일반적입니다.

```php
use Laravel\Fortify\Fortify;
use Illuminate\Http\Request;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Fortify::resetPasswordView(function (Request $request) {
        return view('auth.reset-password', ['request' => $request]);
    });

    // ...
}
```

Fortify는 해당 뷰를 반환하는 라우트를 정의합니다. `reset-password` 템플릿에는 `/reset-password`로 POST 요청을 보내는 폼이 있어야 하며, `email`, `password`, `password_confirmation` 필드, 그리고 숨겨진 `token` 필드를 포함해야 합니다. `token`에는 `request()->route('token')` 값을 추가합니다. "이메일" 필드명/컬럼명 역시 설정 파일의 `email` 값과 같아야 합니다.

<a name="handling-the-password-reset-response"></a>
#### 비밀번호 재설정 응답 처리

비밀번호 재설정에 성공하면 Fortify는 `/login` 라우트로 리디렉션하여 사용자가 새로운 비밀번호로 로그인할 수 있도록 합니다. 또한, 세션 변수 `status`를 활용하여 성공 메시지를 로그인 화면에 표시할 수도 있습니다.

```blade
@if (session('status'))
    <div class="mb-4 font-medium text-sm text-green-600">
        {{ session('status') }}
    </div>
@endif
```

XHR 요청이라면, 200 HTTP 응답이 반환됩니다.

실패할 경우 재설정 화면으로 이동하고, 검증 에러는 `$errors` [Blade 템플릿 변수](/docs/12.x/validation#quick-displaying-the-validation-errors) 또는 XHR 422 응답에서 받아볼 수 있습니다.

<a name="customizing-password-resets"></a>
### 비밀번호 초기화 커스터마이징

비밀번호 초기화 과정은 Fortify 설치 시 생성된 `App\Actions\ResetUserPassword` 액션 파일을 수정하여 자유롭게 커스터마이즈할 수 있습니다.

<a name="email-verification"></a>
## 이메일 인증

회원가입 후, 사용자가 애플리케이션을 계속 이용하기 전에 이메일 소유 여부 인증을 받고 싶을 수 있습니다. 시작하려면, `fortify` 설정 파일의 `features` 배열에 `emailVerification` 기능이 활성화되어 있어야 합니다. 그 다음, `App\Models\User` 클래스가 `Illuminate\Contracts\Auth\MustVerifyEmail` 인터페이스를 구현하는지 확인하세요.

이 두 가지 준비가 끝나면, 회원가입된 사용자에게 이메일 소유 확인을 위한 링크가 전송됩니다. 하지만, Fortify가 이메일 인증 안내 화면을 어떻게 보여줄지 또한 지정해 주어야 합니다.

모든 뷰 렌더링 로직은 `Laravel\Fortify\Fortify` 클래스의 메서드를 사용하여 커스터마이즈할 수 있으며, 보통 `App\Providers\FortifyServiceProvider`의 `boot` 메서드에서 아래와 같이 처리합니다.

```php
use Laravel\Fortify\Fortify;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Fortify::verifyEmailView(function () {
        return view('auth.verify-email');
    });

    // ...
}
```

Fortify는 `/email/verify` 엔드포인트에 접근할 때 해당 뷰를 보여주도록 라우트를 자동 정의합니다. 이 라우트는 라라벨의 내장 `verified` 미들웨어에 의해 리디렉션됩니다.

`verify-email` 템플릿에는 사용자가 이메일 인증 링크를 클릭해야 한다는 안내 메시지를 포함시켜야 합니다.

<a name="resending-email-verification-links"></a>
#### 이메일 인증 링크 재발송

필요하다면, `verify-email` 템플릿에 버튼을 추가해 `/email/verification-notification` 엔드포인트로 POST 요청하여 인증 이메일을 다시 보낼 수 있습니다. 이 요청이 성공하면 사용자는 다시 `/email/verify`로 리디렉션되고, 세션 `status` 변수로 성공 메시지를 표시할 수 있습니다. XHR 요청일 경우 202 HTTP 응답이 반환됩니다.

```blade
@if (session('status') == 'verification-link-sent')
    <div class="mb-4 font-medium text-sm text-green-600">
        A new email verification link has been emailed to you!
    </div>
@endif
```

<a name="protecting-routes"></a>
### 라우트 보호

특정 라우트 또는 라우트 그룹에서 사용자의 이메일 인증 완료를 필수로 지정하려면, 라라벨 내장 `verified` 미들웨어를 해당 라우트에 적용하세요. `verified` 미들웨어는 자동으로 등록되어 있으며 내부적으로는 `Illuminate\Auth\Middleware\EnsureEmailIsVerified` 미들웨어에 대한 별칭입니다.

```php
Route::get('/dashboard', function () {
    // ...
})->middleware(['verified']);
```

<a name="password-confirmation"></a>
## 비밀번호 확인

애플리케이션을 개발할 때, 특정 액션을 수행하기 전에 사용자가 비밀번호를 한 번 더 확인하도록 요구해야 할 때가 있습니다. 이런 라우트에는 일반적으로 라라벨의 내장 `password.confirm` 미들웨어가 적용됩니다.

비밀번호 확인 기능을 구현하려면, Fortify가 "비밀번호 확인" 뷰를 반환하는 방식을 아래와 같이 지정해야 합니다. Fortify는 헤드리스 인증 라이브러리이기 때문에, 완성된 프론트엔드가 필요하다면 [애플리케이션 스타터 키트](/docs/12.x/starter-kits)를 활용하세요.

모든 뷰 렌더링 로직은 `Laravel\Fortify\Fortify` 클래스의 해당 메서드로 커스터마이즈할 수 있으며, 보통 `App\Providers\FortifyServiceProvider`의 `boot` 메서드에서 아래와 같이 호출합니다.

```php
use Laravel\Fortify\Fortify;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Fortify::confirmPasswordView(function () {
        return view('auth.confirm-password');
    });

    // ...
}
```

Fortify는 `/user/confirm-password` 엔드포인트를 정의해 이 뷰를 반환합니다. `confirm-password` 템플릿에는 `/user/confirm-password`로 POST 요청을 보내는 폼이 필요하며, 입력값으로 현재 비밀번호를 담은 `password` 필드가 포함되어야 합니다.

비밀번호가 일치하면 사용자는 시도 중이던 라우트로 리디렉션되며, XHR 요청이라면 201 HTTP 응답을 받습니다.

비밀번호가 일치하지 않는 경우에는 비밀번호 확인 화면으로 돌아가며, 검증 에러는 `$errors` Blade 템플릿 변수 또는 XHR 422 응답으로 전달됩니다.
