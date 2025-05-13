# 라라벨 Fortify (Laravel Fortify)

- [소개](#introduction)
    - [Fortify란?](#what-is-fortify)
    - [Fortify를 언제 사용해야 하나요?](#when-should-i-use-fortify)
- [설치](#installation)
    - [Fortify 주요 기능](#fortify-features)
    - [뷰 비활성화](#disabling-views)
- [인증](#authentication)
    - [사용자 인증 커스터마이즈](#customizing-user-authentication)
    - [인증 파이프라인 커스터마이즈](#customizing-the-authentication-pipeline)
    - [리디렉션 커스터마이즈](#customizing-authentication-redirects)
- [2단계 인증](#two-factor-authentication)
    - [2단계 인증 활성화](#enabling-two-factor-authentication)
    - [2단계 인증으로 인증하기](#authenticating-with-two-factor-authentication)
    - [2단계 인증 비활성화](#disabling-two-factor-authentication)
- [회원가입](#registration)
    - [회원가입 커스터마이즈](#customizing-registration)
- [비밀번호 재설정](#password-reset)
    - [비밀번호 재설정 링크 요청](#requesting-a-password-reset-link)
    - [비밀번호 재설정](#resetting-the-password)
    - [비밀번호 재설정 커스터마이즈](#customizing-password-resets)
- [이메일 인증](#email-verification)
    - [라우트 보호](#protecting-routes)
- [비밀번호 확인](#password-confirmation)

<a name="introduction"></a>
## 소개

[Laravel Fortify](https://github.com/laravel/fortify)는 라라벨에서 사용할 수 있는 프론트엔드와 무관한 인증 백엔드 구현체입니다. Fortify는 로그인, 회원가입, 비밀번호 재설정, 이메일 인증 등 라라벨의 모든 인증 기능을 구현하는 데 필요한 라우트와 컨트롤러를 등록해줍니다. Fortify를 설치한 후 `route:list` 아티즌 명령어를 실행하면 Fortify가 등록한 라우트 목록을 확인할 수 있습니다.

Fortify는 사용자 인터페이스(UI)를 직접 제공하지 않으므로, 여러분이 만든 UI가 Fortify에서 등록한 라우트로 직접 HTTP 요청을 보내는 구조입니다. 이후 문서에서 이러한 라우트에 어떻게 요청을 보내는지 구체적으로 안내하겠습니다.

> [!NOTE]
> Fortify는 라라벨 인증 기능을 쉽게 구현할 수 있도록 도와주는 패키지입니다. **꼭 사용해야 하는 필수 패키지는 아닙니다.** [인증](/docs/authentication), [비밀번호 재설정](/docs/passwords), [이메일 인증](/docs/verification) 관련 공식 문서를 따라 수동으로 라라벨 인증 서비스를 직접 사용하실 수도 있습니다.

<a name="what-is-fortify"></a>
### Fortify란?

앞서 언급한 것처럼, Laravel Fortify는 라라벨을 위한 프론트엔드와 무관하게 동작하는 인증 백엔드 구현체입니다. Fortify는 로그인, 회원가입, 비밀번호 재설정, 이메일 인증 등 라라벨의 모든 인증 기능을 구현하는 데 필요한 라우트와 컨트롤러를 등록해줍니다.

**라라벨의 인증 기능을 사용하기 위해 반드시 Fortify를 설치할 필요는 없습니다.** [인증](/docs/authentication), [비밀번호 재설정](/docs/passwords), [이메일 인증](/docs/verification) 공식 문서를 참고하여 인증 서비스를 직접 사용할 수 있습니다.

라라벨을 처음 사용한다면, Fortify 사용 전에 [애플리케이션 스타터 키트](/docs/starter-kits)를 먼저 살펴보시는 것을 추천합니다. 스타터 키트는 [Tailwind CSS](https://tailwindcss.com)로 만들어진 사용자 인터페이스와 함께 인증 기능의 전체 스캐폴딩을 제공하므로, 라라벨의 인증 시스템을 익히는 데 큰 도움이 됩니다.

Laravel Fortify는 사실상 이러한 스타터 키트에서 제공하는 라우트와 컨트롤러 부분만 떼어내 별도의 패키지로 제공하는 것입니다. Fortify는 UI 없이 백엔드 인증 구현만 빠르게 구축할 수 있으므로, 프론트엔드 구현 방식에 제약받지 않고 라라벨 인증 백엔드를 손쉽게 적용할 수 있습니다.

<a name="when-should-i-use-fortify"></a>
### Fortify를 언제 사용해야 하나요?

Fortify 사용이 적합한 경우가 언제인지 고민이 될 수 있습니다. 우선, 라라벨의 [애플리케이션 스타터 키트](/docs/starter-kits)를 사용 중이라면 별도로 Fortify를 설치할 필요가 없습니다. 모든 라라벨 스타터 키트에는 이미 완벽한 인증 구현이 포함되어 있기 때문입니다.

스타터 키트 없이 인증 기능이 필요한 애플리케이션을 개발한다면 두 가지 선택지가 있습니다.  
직접 인증 기능을 하나하나 구현하거나, 또는 Fortify를 이용해 인증 백엔드만 빠르게 구축하고 별도의 프론트엔드를 붙이는 방식이 있습니다.

Fortify를 설치하면, 여러분이 만든 사용자 인터페이스가 이 문서에서 다루는 Fortify의 인증 라우트로 HTTP 요청을 보내 회원 인증 및 가입 처리를 하게 됩니다.

반대로 Fortify를 사용하지 않고 수동으로 인증 서비스를 통합하려면, [인증](/docs/authentication), [비밀번호 재설정](/docs/passwords), [이메일 인증](/docs/verification) 공식 문서를 참고해 직접 코드를 작성하면 됩니다.

<a name="laravel-fortify-and-laravel-sanctum"></a>
#### Laravel Fortify와 Laravel Sanctum

[Laravel Sanctum](/docs/sanctum)과 Fortify의 차이가 헷갈릴 수 있습니다. 두 패키지는 관련 있는 서로 다른 문제를 해결합니다. 따라서 Fortify와 Sanctum은 상호 배타적이거나 경쟁적인 패키지가 아닙니다.

Sanctum은 API 토큰 관리와 세션 쿠키/토큰을 통한 기존 사용자 인증만 처리합니다. 회원가입, 비밀번호 재설정 등과 관련된 라우트는 제공하지 않습니다.

즉, 만약 여러분이 API를 제공하거나 싱글페이지 애플리케이션(SPA)을 위한 백엔드를 만든다면, Fortify로 회원가입과 비밀번호 재설정 등의 인증 API를 담당하게 하고, Sanctum으로 API 토큰 관리와 세션 인증 기능을 함께 사용할 수도 있습니다.

<a name="installation"></a>
## 설치

시작하려면 Composer 패키지 매니저로 Fortify를 설치합니다.

```shell
composer require laravel/fortify
```

다음으로, 아티즌의 `fortify:install` 명령어를 사용해 Fortify의 리소스를 퍼블리시합니다.

```shell
php artisan fortify:install
```

이 명령을 실행하면 `app/Actions` 디렉터리에 Fortify의 액션 클래스들이 생성됩니다(해당 디렉터리가 없다면 자동으로 만들어집니다). 또한, `FortifyServiceProvider`, 설정 파일, 관련 데이터베이스 마이그레이션 파일도 함께 퍼블리시됩니다.

그 다음, 데이터베이스 마이그레이션을 실행해야 합니다.

```shell
php artisan migrate
```

<a name="fortify-features"></a>
### Fortify 주요 기능

`fortify` 설정 파일에는 `features` 설정 배열이 있습니다. 이 배열은 Fortify가 기본적으로 노출할 백엔드 라우트/기능을 정의합니다. 대부분의 라라벨 애플리케이션에 필요한 기본 인증 기능만 활성화하는 것을 권장합니다.

```php
'features' => [
    Features::registration(),
    Features::resetPasswords(),
    Features::emailVerification(),
],
```

<a name="disabling-views"></a>
### 뷰 비활성화

Fortify는 기본적으로 로그인 화면, 회원가입 화면 등에 대응하는 뷰 반환용 라우트도 정의합니다. 하지만, 자바스크립트로 구동되는 싱글페이지 애플리케이션(SPA)을 만든다면 이런 라우트가 필요 없을 수 있습니다. 이럴 때는, 애플리케이션의 `config/fortify.php` 설정 파일에서 `views` 값을 `false`로 지정하여 해당 라우트를 완전히 비활성화할 수 있습니다.

```php
'views' => false,
```

<a name="disabling-views-and-password-reset"></a>
#### 뷰 및 비밀번호 재설정 비활성화

Fortify의 뷰 라우트를 비활성화하면서 비밀번호 재설정 기능은 별도 구현하려면, 반드시 "reset password" 용도의 `password.reset`이라는 이름의 라우트를 정의해야 합니다.  
이유는, 라라벨의 `Illuminate\Auth\Notifications\ResetPassword` 알림이 해당 이름의 라우트를 기준으로 재설정 URL을 생성하기 때문입니다.

<a name="authentication"></a>
## 인증

먼저, Fortify가 "로그인" 뷰를 반환하는 방법을 지정해야 합니다. Fortify는 UI가 없는 헤드리스(Headless) 인증 라이브러리임을 잊지 마세요. 만약 이미 인증 프론트엔드 구현이 포함된 [애플리케이션 스타터 키트](/docs/starter-kits)를 원한다면 해당 키트를 사용하는 것이 더 간단합니다.

모든 인증 뷰를 렌더링하는 로직은 `Laravel\Fortify\Fortify` 클래스의 메서드로 커스터마이즈할 수 있습니다. 보통, 이 메서드를 `App\Providers\FortifyServiceProvider` 클래스의 `boot` 메서드에서 호출합니다. Fortify가 `/login` 라우트 정의와 뷰 반환을 알아서 처리합니다.

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

로그인 템플릿에는 `/login`으로 POST 요청을 보내는 폼이 포함되어야 합니다. 이때 `/login` 엔드포인트는 `email`/`username`(문자열)과 `password`(문자열)가 필요합니다. 입력 필드의 이름이 `config/fortify.php`의 `username` 값과 일치해야 합니다. 또한, "로그인 상태 유지" 기능을 위해 boolean 타입의 `remember` 필드를 추가로 보낼 수도 있습니다.

로그인에 성공하면, Fortify는 애플리케이션의 `fortify` 설정 파일에 정의된 `home` 경로로 리디렉션합니다. 만약 XHR 요청이라면, 200 HTTP 응답이 반환됩니다.

인증 실패 시에는 로그인 화면으로 다시 리디렉션되고, 검증 오류 메시지는 [Blade 템플릿 `$errors` 변수](/docs/validation#quick-displaying-the-validation-errors)로 전달됩니다. XHR 요청의 경우엔 422 응답과 함께 validation 오류가 반환됩니다.

<a name="customizing-user-authentication"></a>
### 사용자 인증 커스터마이즈

Fortify는 기본적으로 애플리케이션에 설정된 인증 가드와 제공된 자격 증명을 바탕으로 사용자를 자동 인증해줍니다. 하지만, 인증 로직을 더 자유롭게 커스터마이즈하고 싶을 때도 있습니다. 이럴 땐 `Fortify::authenticateUsing` 메서드를 사용할 수 있습니다.

이 메서드는 클로저를 인수로 받으며, 이 클로저에는 HTTP 요청 객체가 전달됩니다. 이 안에서 인증에 필요한 검증과 사용자 객체 반환을 직접 코딩할 수 있습니다. 인증에 실패하거나 사용자가 없으면 `null` 또는 `false`를 반환하면 됩니다. 이 역시 `FortifyServiceProvider`의 `boot` 메서드에서 호출하면 됩니다.

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
#### 인증 가드(Guard)

Fortify가 사용할 인증 가드는 `fortify` 설정 파일에서 커스터마이즈할 수 있습니다. 다만, 반드시 `Illuminate\Contracts\Auth\StatefulGuard`를 구현한 가드여야 합니다. 싱글페이지 애플리케이션(SPA)에서 Fortify로 인증을 처리하려면, 보통 라라벨 기본 `web` 가드와 [Laravel Sanctum](https://laravel.com/docs/sanctum)을 함께 사용하는 것이 일반적입니다.

<a name="customizing-the-authentication-pipeline"></a>
### 인증 파이프라인 커스터마이즈

라라벨 Fortify는 인증 요청을 여러 클래스로 구성된 파이프라인을 통해 처리합니다. 필요하다면 로그인 처리를 거치는 클래스를 원하는 대로 커스터마이즈할 수 있습니다. 각 클래스는 `__invoke` 메서드를 가지고 있어야 하며, 이 안에서 HTTP 요청 인스턴스와 [미들웨어](docs/{{version}}/middleware)와 유사하게 `$next` 변수를 사용해 다음 클래스에 제어를 넘깁니다.

커스텀 파이프라인을 정의하려면 `Fortify::authenticateThrough` 메서드에 클로저를 전달해 사용합니다. 이 클로저는 로그인 요청이 통과할 클래스 배열을 반환해야 합니다. 이 메서드도 `App\Providers\FortifyServiceProvider` 클래스의 `boot` 메서드에서 호출하는 것이 일반적입니다.

아래는 기본 파이프라인 예시이니, 필요에 따라 참고해 수정할 수 있습니다.

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

Fortify는 기본적으로 `EnsureLoginIsNotThrottled` 미들웨어를 통해 인증 시도를 제한(throttle)합니다. 이 미들웨어는 사용자 이름과 IP 조합별로 시도를 제한합니다.

특정 상황에서는 IP별로만 제한하거나, 다른 방식이 필요할 수 있습니다. Fortify는 `fortify.limiters.login` 설정 옵션을 통해 직접 [rate limiter](/docs/routing#rate-limiting)를 지정할 수 있도록 지원합니다.  
이 옵션은 `config/fortify.php` 파일에 위치합니다.

> [!NOTE]
> 인증 시도 제한(Throttling), [2단계 인증](/docs/fortify#two-factor-authentication), 그리고 외부 웹 애플리케이션 방화벽(WAF)을 함께 활용하면 합법적인 사용자에게 최적의 보안을 제공합니다.

<a name="customizing-authentication-redirects"></a>
### 리디렉션 커스터마이즈

로그인 성공 시, Fortify는 `fortify` 설정 파일의 `home` 옵션에 지정된 경로로 리디렉션합니다. XHR 요청이라면 200 HTTP 응답이 반환되고, 로그아웃 후에는 `/` 경로로 이동합니다.

이 동작을 더 세밀하게 제어하고 싶다면, `LoginResponse`와 `LogoutResponse` 계약을 구현하여 라라벨 [서비스 컨테이너](/docs/container)에 바인딩할 수 있습니다. 보통 `App\Providers\FortifyServiceProvider` 클래스의 `register` 메서드에서 이 작업을 처리합니다.

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

Fortify의 2단계 인증 기능을 활성화하면, 인증 과정에서 사용자가 6자리 숫자 토큰을 입력해야 합니다. 이 토큰은 시간 기반 일회용 비밀번호(TOTP) 방식으로 생성되며, Google Authenticator와 같은 TOTP 호환 모바일 인증 앱에서 사용할 수 있습니다.

먼저, 애플리케이션의 `App\Models\User` 모델에 `Laravel\Fortify\TwoFactorAuthenticatable` 트레이트가 추가되어 있는지 확인하세요.

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

그 다음, 사용자가 2단계 인증을 직접 설정/해제하거나, 복구 코드를 재생성할 수 있는 관리 화면을 애플리케이션 내에 만들어야 합니다.

> 기본적으로, `fortify` 설정 파일의 `features` 배열 안에서 2단계 인증 관련 설정은 변경 전 반드시 [비밀번호 확인](#password-confirmation) 기능이 선행되어야 하도록 요구합니다. 따라서 아래 설정을 적용하기 전에 Fortify의 비밀번호 확인 기능을 먼저 구현해야 합니다.

<a name="enabling-two-factor-authentication"></a>
### 2단계 인증 활성화

2단계 인증을 활성화하려면, `/user/two-factor-authentication` 엔드포인트로 POST 요청을 보내야 합니다. 요청이 성공하면 이전 URL로 리디렉션되며, `status` 세션 변수에 `two-factor-authentication-enabled` 값이 설정됩니다. 이를 이용해 템플릿에서 성공 메시지를 보여줄 수 있습니다. XHR 요청이라면 200 응답이 반환됩니다.

2단계 인증을 활성화하면, 실제로 인증 구성이 완료된 것은 아니므로 사용자가 별도로 유효한 2단계 인증 코드를 입력해 인증을 "확인"해야 합니다. 성공 메시지는 이 추가 확인이 필요하다는 안내를 포함해야 합니다.

```html
@if (session('status') == 'two-factor-authentication-enabled')
    <div class="mb-4 font-medium text-sm">
        2단계 인증 구성을 아래에서 완료해 주세요.
    </div>
@endif
```

이어서, 사용자가 인증 앱에 등록할 수 있도록 2단계 인증 QR 코드를 표시해야 합니다. Blade에서 프론트엔드를 만든다면, 사용자 인스턴스의 `twoFactorQrCodeSvg` 메서드로 SVG 형식의 QR 코드를 구할 수 있습니다.

```php
$request->user()->twoFactorQrCodeSvg();
```

자바스크립트 기반 프론트엔드라면, `/user/two-factor-qr-code` 엔드포인트에 XHR GET 요청을 보내면 JSON으로 `svg` 키가 포함된 QR 코드 정보를 받게 됩니다.

<a name="confirming-two-factor-authentication"></a>
#### 2단계 인증 확인

사용자의 2단계 인증 QR 코드를 보여줄 뿐 아니라, 별도 입력란을 제공하여 인증 코드를 입력받고 구성을 "확인"해야 합니다. 이 코드는 `/user/confirmed-two-factor-authentication` 엔드포인트로 POST 요청을 보내 전달합니다.

성공 시, 이전 URL로 리디렉션되고 `status` 세션 변수에는 `two-factor-authentication-confirmed` 값이 설정됩니다.

```html
@if (session('status') == 'two-factor-authentication-confirmed')
    <div class="mb-4 font-medium text-sm">
        2단계 인증이 성공적으로 확인 및 활성화되었습니다.
    </div>
@endif
```

XHR 요청이었다면 200 응답이 반환됩니다.

<a name="displaying-the-recovery-codes"></a>
#### 복구 코드 표시

2단계 인증에서는 복구 코드도 함께 제공해야 합니다. 복구 코드를 이용하면 사용자가 모바일 기기를 잃어버려도 인증이 가능합니다. Blade에서는 인증된 사용자 인스턴스의 아래 메서드를 통해 복구 코드 배열에 접근할 수 있습니다.

```php
(array) $request->user()->recoveryCodes()
```

자바스크립트 프론트엔드의 경우, `/user/two-factor-recovery-codes` 엔드포인트에 GET/XHR 요청을 보내면 복구 코드가 담긴 JSON 배열을 받을 수 있습니다.

복구 코드를 재생성하려면 `/user/two-factor-recovery-codes` 엔드포인트로 POST 요청을 보내면 됩니다.

<a name="authenticating-with-two-factor-authentication"></a>
### 2단계 인증으로 인증하기

인증 도중 Fortify는 자동으로 2단계 인증 챌린지 화면으로 사용자를 리디렉션 시킵니다. 하지만, XHR 방식으로 로그인 요청을 보낼 경우에는 인증 성공 시 JSON 응답에 `two_factor`라는 boolean 속성이 포함됩니다. 이 값을 확인해서 2단계 인증 챌린지 화면으로 이동할지 결정하면 됩니다.

2단계 인증 기능을 구현하기 위해 먼저 `two factor authentication challenge` 뷰를 반환하는 방법을 Fortify에게 알려야 합니다. 모든 인증 뷰 렌더링 로직은 `Laravel\Fortify\Fortify` 클래스의 메서드로 커스터마이즈할 수 있으며, `App\Providers\FortifyServiceProvider`의 `boot`에서 정의합니다.

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

Fortify가 자동으로 `/two-factor-challenge` 라우트를 정의해주며, 해당 라우트로부터 뷰를 반환합니다. `two-factor-challenge` 템플릿에는 `/two-factor-challenge` 엔드포인트로 POST 요청을 보내는 폼이 필요합니다. 이때 `code` 필드에는 유효한 TOTP 토큰, 또는 `recovery_code` 필드에 복구 코드가 들어갈 수 있습니다.

로그인에 성공하면, Fortify는 `fortify` 설정 파일의 `home` 경로로 리디렉션합니다. XHR 요청이라면 204 응답이 주어집니다.

인증 실패 시에는 2단계 인증 화면으로 되돌아가며, 검증 오류는 `$errors` [Blade 템플릿 변수](/docs/validation#quick-displaying-the-validation-errors)로 받을 수 있습니다. XHR라면 422 오류와 함께 반환됩니다.

<a name="disabling-two-factor-authentication"></a>
### 2단계 인증 비활성화

2단계 인증을 비활성화하려면, `/user/two-factor-authentication` 엔드포인트에 DELETE 요청을 보내면 됩니다. Fortify의 2단계 인증 관련 엔드포인트는 항상 [비밀번호 확인](#password-confirmation)이 선행되어야 함을 잊지 마세요.

<a name="registration"></a>
## 회원가입

회원가입 기능을 구현하려면, Fortify에 "회원가입(register)" 뷰를 반환하는 방법을 지정해야 합니다. Fortify는 UI가 없는 헤드리스 인증 라이브러리임을 기억하세요.  
완성된 인증 프론트엔드가 포함된 [애플리케이션 스타터 키트](/docs/starter-kits) 사용도 가능합니다.

Fortify가 모든 뷰 렌더링을 제공하는 방식은 항상 `Laravel\Fortify\Fortify` 클래스의 메서드로 변경할 수 있습니다. 주로 `App\Providers\FortifyServiceProvider`의 `boot`에서 정의합니다.

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

Fortify는 `/register` 라우트를 정의해 이 뷰를 반환합니다.  
`register` 템플릿에는 `/register`로 POST 요청을 보내는 폼이 포함되어야 하며,  
이때 `name`(문자열), 이메일 주소 또는 사용자명(문자열), `password`, `password_confirmation` 값이 필요합니다. 이메일/사용자명 필드 이름은 `fortify` 설정 파일의 `username` 값과 일치해야 합니다.

회원가입 성공 시, Fortify는 `fortify` 설정 파일의 `home` 경로로 리디렉션합니다. XHR 요청이면 201 응답이 반환됩니다.

실패 시에는 회원가입 화면으로 돌아가며, 검증 오류는 `$errors` [Blade 템플릿 변수](/docs/validation#quick-displaying-the-validation-errors)로 받을 수 있습니다. XHR 요청일 때는 422 오류와 함께 반환됩니다.

<a name="customizing-registration"></a>
### 회원가입 커스터마이즈

회원 검증 및 생성 로직은 Fortify 설치 시 자동 생성된 `App\Actions\Fortify\CreateNewUser` 액션을 수정하여 직접 커스터마이즈할 수 있습니다.

<a name="password-reset"></a>
## 비밀번호 재설정

<a name="requesting-a-password-reset-link"></a>
### 비밀번호 재설정 링크 요청

비밀번호 재설정 기능 구현을 시작하려면, Fortify에 "비밀번호 재설정(패스워드 찾기)" 뷰를 반환하는 방법을 지정해야 합니다.  
Fortify는 UI가 없는 라이브러리임을 기억하세요.  
완성된 인증 프론트엔드가 필요하면 [애플리케이션 스타터 키트](/docs/starter-kits) 사용도 가능합니다.

Fortify의 뷰 렌더링 로직은 항상 `Laravel\Fortify\Fortify` 클래스를 통해 커스터마이즈할 수 있으며, `App\Providers\FortifyServiceProvider`의 `boot`에서 정의합니다.

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

Fortify는 `/forgot-password` 엔드포인트를 정의해 이 뷰를 반환합니다. 해당 뷰(템플릿)에서는 `/forgot-password`로 POST 요청하는 폼이 필요합니다.

`/forgot-password` 엔드포인트는 `email`(문자열) 필드를 기대합니다. 이 필드/컬럼 이름은 `fortify` 설정 파일의 `email` 값과 맞아야 합니다.

<a name="handling-the-password-reset-link-request-response"></a>
#### 비밀번호 재설정 링크 요청 결과 처리

재설정 링크 요청이 성공하면, Fortify는 사용자에게 보안 링크가 담긴 이메일을 보내고 `/forgot-password`로 리디렉션합니다. XHR 요청의 경우 200 HTTP 응답이 반환됩니다.

리디렉션 후, `status` 세션 변수를 사용해 성공 메시지를 표시할 수 있습니다.

`$status` 세션 변수 값은 애플리케이션의 `passwords` [언어 파일](/docs/localization)에 정의된 번역 문자열들 중 하나입니다. 만약 Laravel 언어 파일을 직접 퍼블리시하지 않았다면, `lang:publish` 아티즌 명령어로 커스터마이즈할 수 있습니다.

```html
@if (session('status'))
    <div class="mb-4 font-medium text-sm text-green-600">
        {{ session('status') }}
    </div>
@endif
```

요청이 실패한 경우에는 재설정 링크 요청 화면으로 돌아가며, 검증 오류는 `$errors` [Blade 템플릿 변수](/docs/validation#quick-displaying-the-validation-errors)로, XHR 요청 시에는 422 오류로 반환됩니다.

<a name="resetting-the-password"></a>
### 비밀번호 재설정

비밀번호 재설정 기능을 완성하려면, Fortify에 "비밀번호 재설정" 뷰 반환 방식을 지정해야 합니다.

Fortify의 뷰 렌더링 로직 역시 `Laravel\Fortify\Fortify` 클래스로 커스터마이즈할 수 있으며, 보통 `App\Providers\FortifyServiceProvider`의 `boot`에서 아래처럼 정의합니다.

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

Fortify가 뷰를 표시하는 라우트도 자동 정의합니다.  
`reset-password` 템플릿에는 `/reset-password`로 POST 요청하는 폼이 필요하며,  
`email`(문자열), `password`, `password_confirmation`, 그리고 숨겨진 `token` 필드(값은 `request()->route('token')`)가 필요합니다. "이메일" 필드/컬럼 이름도 `fortify` 설정 파일의 `email` 값과 맞아야 합니다.

<a name="handling-the-password-reset-response"></a>
#### 비밀번호 재설정 결과 처리

재설정이 성공하면, Fortify는 `/login` 라우트로 리디렉션하여 새 비밀번호로 로그인할 수 있도록 안내합니다. 이와 함께 `status` 세션 변수가 지정되어 로그인 화면에서 성공 메시지를 표시할 수 있습니다.

```blade
@if (session('status'))
    <div class="mb-4 font-medium text-sm text-green-600">
        {{ session('status') }}
    </div>
@endif
```

XHR 요청의 경우 200 응답이 반환됩니다.

실패 시에는 비밀번호 재설정 화면으로 돌아가며, 검증 오류는 `$errors` [Blade 템플릿 변수](/docs/validation#quick-displaying-the-validation-errors) 또는 XHR 요청에서는 422 오류로 받을 수 있습니다.

<a name="customizing-password-resets"></a>
### 비밀번호 재설정 커스터마이즈

비밀번호 재설정 로직은 Fortify 설치 시 생성된 `App\Actions\ResetUserPassword` 액션을 수정하여 원하는 대로 커스터마이즈할 수 있습니다.

<a name="email-verification"></a>
## 이메일 인증

회원가입 후, 사용자의 이메일 주소를 인증하도록 요구하고 싶을 수 있습니다. 먼저, `fortify` 설정 파일의 `features` 배열에 `emailVerification` 기능이 활성화되어야 합니다. 또한, `App\Models\User` 클래스가 `Illuminate\Contracts\Auth\MustVerifyEmail` 인터페이스를 반드시 구현하고 있어야 합니다.

이 두 가지가 모두 준비되면 신규 가입 사용자는 이메일 소유권을 인증할 수 있도록 관련 메일을 받게 됩니다. 하지만, 인증 메일 안내 화면을 어떻게 보여줄지 Fortify에 알려줘야 합니다.

Fortify의 모든 뷰 렌더링 로직은 `Laravel\Fortify\Fortify` 클래스를 통해 커스터마이즈할 수 있으며, 보통 `App\Providers\FortifyServiceProvider`의 `boot`에서 정의합니다.

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

Fortify가 `/email/verify` 엔드포인트로 리디렉션될 때 보여줄 라우트를 자동 정의합니다.  
`verify-email` 템플릿에는 이메일 인증 링크를 클릭하라는 안내 메시지가 포함되어 있어야 합니다.

<a name="resending-email-verification-links"></a>
#### 인증 이메일 재발송

필요하다면 `verify-email` 템플릿에 버튼을 추가해 `/email/verification-notification` 엔드포인트로 POST 요청을 보낼 수 있습니다.  
이 엔드포인트는 새로운 인증 이메일을 사용자에게 발송해, 만약 이전 인증 메일을 사용자가 지웠거나 분실했다면 새 링크로 다시 인증할 수 있습니다.

인증 메일 재발송 성공 시, Fortify는 `/email/verify`로 리디렉션하며, `status` 세션 변수를 통해 성공 메시지를 표시할 수 있습니다. XHR 요청이라면 202 HTTP 응답을 반환합니다.

```blade
@if (session('status') == 'verification-link-sent')
    <div class="mb-4 font-medium text-sm text-green-600">
        새로운 이메일 인증 링크가 전송되었습니다!
    </div>
@endif
```

<a name="protecting-routes"></a>
### 라우트 보호

특정 라우트 또는 라우트 그룹이 사용자의 이메일 인증이 완료된 상태여야만 접근 가능하도록 하려면, 라라벨 내장 `verified` 미들웨어를 해당 라우트에 적용하면 됩니다. `verified` 미들웨어 별칭은 라라벨에서 자동으로 등록되어 있으며, 실제로는 `Illuminate\Auth\Middleware\EnsureEmailIsVerified` 미들웨어와 동일하게 동작합니다.

```php
Route::get('/dashboard', function () {
    // ...
})->middleware(['verified']);
```

<a name="password-confirmation"></a>
## 비밀번호 확인

애플리케이션을 개발하다 보면, 특정 작업을 수행하기 전에 사용자가 비밀번호를 한 번 더 입력해 확인하도록 요구해야 할 때가 있습니다. 이런 라우트들은 보통 라라벨의 내장 `password.confirm` 미들웨어로 보호합니다.

비밀번호 재확인 기능을 구현하려면 Fortify에 "비밀번호 확인" 뷰 반환 방식을 알려야 합니다.  
Fortify는 UI가 없는 라이브러리임을 기억하세요.  
완성된 인증 프론트엔드가 필요하다면 [애플리케이션 스타터 키트](/docs/starter-kits)를 사용할 수 있습니다.

Fortify의 뷰 렌더링 방식은 항상 `Laravel\Fortify\Fortify` 클래스를 통해 커스터마이즈할 수 있으며, `App\Providers\FortifyServiceProvider`의 `boot`에서 정의합니다.

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

Fortify가 `/user/confirm-password` 엔드포인트를 정의해 이 뷰를 반환합니다. `confirm-password` 템플릿에는 `/user/confirm-password`로 POST 요청하는 폼이 필요하며, `password` 필드에는 사용자의 현재 비밀번호가 입력됩니다.

비밀번호가 일치하면, Fortify는 사용자가 원래 접근하려던 라우트로 리디렉션합니다. XHR 요청이라면 201 응답이 반환됩니다.

실패하면 비밀번호 확인 화면으로 돌아가며, 검증 오류는 `$errors` Blade 템플릿 변수나 XHR 요청시 422 에러로 반환됩니다.
