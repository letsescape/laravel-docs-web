# 라라벨 포티파이 (Laravel Fortify)

- [소개](#introduction)
    - [Fortify란?](#what-is-fortify)
    - [Fortify는 언제 사용해야 할까요?](#when-should-i-use-fortify)
- [설치](#installation)
    - [Fortify 서비스 프로바이더](#the-fortify-service-provider)
    - [Fortify 기능](#fortify-features)
    - [뷰 비활성화](#disabling-views)
- [인증](#authentication)
    - [사용자 인증 맞춤화](#customizing-user-authentication)
    - [인증 파이프라인 커스터마이징](#customizing-the-authentication-pipeline)
    - [리디렉션 커스터마이징](#customizing-authentication-redirects)
- [이중 인증(2FA)](#two-factor-authentication)
    - [이중 인증 활성화](#enabling-two-factor-authentication)
    - [이중 인증으로 인증하기](#authenticating-with-two-factor-authentication)
    - [이중 인증 비활성화](#disabling-two-factor-authentication)
- [회원가입](#registration)
    - [회원가입 커스터마이징](#customizing-registration)
- [비밀번호 재설정](#password-reset)
    - [비밀번호 재설정 링크 요청](#requesting-a-password-reset-link)
    - [비밀번호 재설정](#resetting-the-password)
    - [비밀번호 재설정 커스터마이징](#customizing-password-resets)
- [이메일 인증](#email-verification)
    - [라우트 보호하기](#protecting-routes)
- [비밀번호 확인](#password-confirmation)

<a name="introduction"></a>
## 소개

[Laravel Fortify](https://github.com/laravel/fortify)는 라라벨을 위한 프론트엔드에 독립적인 인증 백엔드 구현체입니다. Fortify는 로그인, 회원가입, 비밀번호 재설정, 이메일 인증 등 라라벨의 모든 인증 기능을 구현하는 데 필요한 라우트와 컨트롤러를 등록합니다. Fortify 설치 후에는 `route:list` 아티즌 명령어를 실행하여 Fortify가 등록한 라우트 목록을 확인할 수 있습니다.

Fortify는 자체 UI를 제공하지 않으므로, Fortify와 함께 여러분이 직접 만든 사용자 인터페이스에서 Fortify가 등록한 라우트에 요청을 보내도록 설계되어 있습니다. 이러한 라우트에 요청을 보내는 방법은 이 문서의 뒷부분에서 자세히 설명합니다.

> [!NOTE]
> Fortify는 라라벨의 인증 기능을 빠르게 도입할 수 있도록 도와주는 패키지입니다. **꼭 사용해야 하는 것은 아닙니다.** [인증](/docs/10.x/authentication), [비밀번호 재설정](/docs/10.x/passwords), [이메일 인증](/docs/10.x/verification) 문서를 참고하여 직접 라라벨의 인증 서비스를 활용할 수도 있습니다.

<a name="what-is-fortify"></a>
### Fortify란?

앞서 언급한 바와 같이, Laravel Fortify는 라라벨을 위한 프론트엔드에 독립적인 인증 백엔드 구현체입니다. Fortify는 로그인, 회원가입, 비밀번호 재설정, 이메일 인증 등 라라벨의 모든 인증 기능을 구현하는 데 필요한 라우트와 컨트롤러를 등록합니다.

**라라벨의 인증 기능을 사용하기 위해 반드시 Fortify를 써야 하는 것은 아닙니다.** [인증](/docs/10.x/authentication), [비밀번호 재설정](/docs/10.x/passwords), [이메일 인증](/docs/10.x/verification) 문서에 따라 직접 라라벨의 인증 서비스를 활용할 수 있습니다.

라라벨을 처음 배우는 분이라면, Fortify를 사용하기 전에 [Laravel Breeze](/docs/10.x/starter-kits) 스타터 키트를 먼저 살펴보는 것이 좋습니다. Laravel Breeze는 [Tailwind CSS](https://tailwindcss.com) 기반 UI를 포함하는 인증 스캐폴딩을 제공합니다. Breeze는 Fortify와 달리 라우트와 컨트롤러가 앱에 직접 생성되기 때문에, 코드 구조를 직접 확인하고 라라벨의 인증 기능을 익힐 수 있습니다.

Laravel Fortify는 Laravel Breeze의 라우트와 컨트롤러를 UI 없이 패키지 형태로 제공하는 것과 같습니다. UI와 무관하게 빠르게 인증 시스템의 백엔드만 구축할 수 있습니다.

<a name="when-should-i-use-fortify"></a>
### Fortify는 언제 사용해야 할까요?

Laravel Fortify를 언제 사용하는 것이 적절할지 궁금하실 수 있습니다. 우선, 라라벨의 [애플리케이션 스타터 키트](/docs/10.x/starter-kits)를 사용하는 경우에는 별도로 Fortify를 설치할 필요가 없습니다. 스타터 키트는 자체적으로 완전한 인증 기능을 제공합니다.

스타터 키트를 사용하지 않고 직접 인증 기능이 필요한 경우, 두 가지 선택지가 있습니다. 하나는 인증 기능을 직접 구현하는 것이고, 다른 하나는 Laravel Fortify로 인증 기능의 백엔드 구현을 도입하는 것입니다.

Fortify를 설치하게 되면, 여러분의 UI는 Fortify에서 제공하는 인증 관련 라우트에 요청을 보내 사용자 인증과 회원가입을 처리하게 됩니다.

반대로 Fortify를 사용하지 않고 인증을 직접 구현하고 싶다면, [인증](/docs/10.x/authentication), [비밀번호 재설정](/docs/10.x/passwords), [이메일 인증](/docs/10.x/verification) 문서를 참고하시면 됩니다.

<a name="laravel-fortify-and-laravel-sanctum"></a>
#### Laravel Fortify와 Laravel Sanctum

일부 개발자들은 [Laravel Sanctum](/docs/10.x/sanctum)과 Laravel Fortify의 차이점에 대해 혼란을 느끼기도 합니다. 이 두 패키지는 서로 다른 목적을 가지므로, 상호 배타적이거나 경쟁하는 관계가 아닙니다.

Laravel Sanctum은 API 토큰 관리와 세션 쿠키 또는 토큰을 활용한 기존 사용자 인증만 다룹니다. 즉, Sanctum은 회원가입, 비밀번호 재설정과 같은 라우트를 제공하지 않습니다.

만약 API를 제공하거나 SPA(싱글 페이지 애플리케이션)의 백엔드로 동작하는 앱에서 인증 레이어를 직접 구축한다면, Fortify(회원가입, 비밀번호 재설정 등)와 Sanctum(API 토큰 관리, 세션 인증)를 함께 사용할 수 있습니다.

<a name="installation"></a>
## 설치

먼저, Composer 패키지 매니저를 사용하여 Fortify를 설치하세요.

```shell
composer require laravel/fortify
```

다음으로, `vendor:publish` 명령어를 사용해 Fortify의 리소스를 퍼블리시합니다.

```shell
php artisan vendor:publish --provider="Laravel\Fortify\FortifyServiceProvider"
```

이 명령어는 `app/Actions` 디렉터리에 Fortify의 액션을 생성합니다. 이 디렉터리는 없으면 자동으로 생성됩니다. 또한 `FortifyServiceProvider`, 설정 파일, 필요한 데이터베이스 마이그레이션도 함께 퍼블리시됩니다.

그리고 데이터베이스 마이그레이션을 실행해야 합니다.

```shell
php artisan migrate
```

<a name="the-fortify-service-provider"></a>
### Fortify 서비스 프로바이더

위에서 실행한 `vendor:publish` 명령어는 `App\Providers\FortifyServiceProvider` 클래스도 함께 퍼블리시합니다. 반드시 이 클래스가 `config/app.php` 설정 파일의 `providers` 배열에 등록되어 있는지 확인하세요.

Fortify 서비스 프로바이더는 퍼블리시된 액션들을 등록하고, Fortify가 각 작업을 실행할 때 이 액션들을 사용하도록 지시합니다.

<a name="fortify-features"></a>
### Fortify 기능

`fortify` 설정 파일(`config/fortify.php`)에는 `features`라는 설정 배열이 있습니다. 이 배열을 통해 Fortify가 기본적으로 노출할 백엔드 라우트와 기능을 정의할 수 있습니다. [Laravel Jetstream](https://jetstream.laravel.com)과 Fortify를 함께 사용하지 않는다면, 일반적으로 아래와 같은 기본 인증 기능만 활성화하는 것을 권장합니다.

```php
'features' => [
    Features::registration(),
    Features::resetPasswords(),
    Features::emailVerification(),
],
```

<a name="disabling-views"></a>
### 뷰 비활성화

기본적으로 Fortify는 로그인 화면, 회원가입 화면 등 뷰를 반환하는 라우트도 등록합니다. 하지만 자바스크립트로 동작하는 SPA(싱글 페이지 앱)를 개발할 때는 이런 라우트가 필요하지 않을 수 있습니다. 이럴 땐 `config/fortify.php` 설정 파일에서 `views` 값을 `false`로 변경해 해당 라우트들을 완전히 비활성화할 수 있습니다.

```php
'views' => false,
```

<a name="disabling-views-and-password-reset"></a>
#### 뷰 및 비밀번호 재설정 비활성화

Fortify의 뷰를 비활성화하면서도 비밀번호 재설정 기능은 사용할 경우, 반드시 앱에서 "비밀번호 재설정" 화면을 표시하는 `password.reset` 이름의 라우트를 따로 정의해야 합니다. 라라벨의 `Illuminate\Auth\Notifications\ResetPassword` 알림이 비밀번호 재설정 URL을 생성할 때 이 라우트 이름을 사용하기 때문입니다.

<a name="authentication"></a>
## 인증

먼저 Fortify에서 "로그인" 뷰를 반환하는 방법을 구현해야 합니다. Fortify는 헤드리스(화면이 없는) 인증 라이브러리입니다. 라라벨의 인증 기능을 이미 구현해 둔 프론트엔드를 사용하고 싶다면 [애플리케이션 스타터 키트](/docs/10.x/starter-kits)를 사용하는 것이 좋습니다.

모든 인증 관련 뷰 렌더링 로직은 `Laravel\Fortify\Fortify` 클래스의 각종 메서드를 사용해 맞춤화할 수 있습니다. 보통, 앱의 `App\Providers\FortifyServiceProvider` 클래스의 `boot` 메서드에서 아래처럼 호출합니다. Fortify는 `/login` 라우트를 자동으로 정의해 이 뷰를 반환하게 합니다.

```
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

로그인 템플릿에는 `/login`으로 POST 요청을 보내는 폼이 포함되어 있어야 합니다. `/login` 엔드포인트는 문자열 타입의 `email` / `username`과 `password` 값을 기대합니다. 이 중 `email` / `username` 필드명은 반드시 `config/fortify.php` 파일의 `username` 설정값과 동일해야 합니다. 또한, 사용자가 "로그인 유지하기" 기능을 사용할 수 있게 하려면 불린 타입의 `remember` 필드를 제공할 수 있습니다.

로그인에 성공하면 Fortify는 `fortify` 설정 파일의 `home` 구성 옵션에 지정된 URI로 리디렉션합니다. XHR 요청(비동기 요청)이면 200 HTTP 응답이 반환됩니다.

만약 인증에 실패하면 사용자는 다시 로그인 화면으로 리디렉션되며, 검증 오류는 공유된 `$errors` [Blade 템플릿 변수](/docs/10.x/validation#quick-displaying-the-validation-errors)로 확인할 수 있습니다. XHR 요청일 경우에는 검증 오류가 422 응답 코드와 함께 반환됩니다.

<a name="customizing-user-authentication"></a>
### 사용자 인증 맞춤화

Fortify는 기본적으로 제공된 자격 정보와 앱에서 설정된 인증 가드를 사용하여 사용자를 자동으로 인증하고 조회합니다. 하지만 인증 로직 전체를 직접 제어하고 싶은 경우에는 `Fortify::authenticateUsing` 메서드를 사용하면 됩니다.

이 메서드는 클로저를 인수로 받아, 요청된 로그인 자격 정보를 검증하고 연관된 사용자 인스턴스를 반환하는 역할을 합니다. 만약 올바른 자격 정보가 아니거나 사용자를 찾지 못하면 `null` 또는 `false`를 반환하면 됩니다. 이 코드는 보통 여러분의 `FortifyServiceProvider`의 `boot` 메서드에서 호출합니다.

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

Fortify가 사용할 인증 가드는 앱의 `fortify` 설정 파일에서 커스터마이즈할 수 있습니다. 단, 여기서 지정한 가드는 반드시 `Illuminate\Contracts\Auth\StatefulGuard` 구현체여야 합니다. SPA(싱글 페이지 앱)의 인증도 Fortify로 처리하려면, 라라벨의 기본 `web` 가드와 [Laravel Sanctum](https://laravel.com/docs/sanctum)을 함께 사용하는 것이 일반적입니다.

<a name="customizing-the-authentication-pipeline"></a>
### 인증 파이프라인 커스터마이징

라라벨 Fortify는 로그인 요청을 일련의 호출 가능한 클래스(파이프라인)를 거쳐 인증합니다. 필요에 따라 로그인 요청에 대한 커스텀 파이프라인을 정의할 수 있습니다. 각 클래스는 요청(`Illuminate\Http\Request`)과 미들웨어처럼 동작하는 `$next` 변수를 받아 처리합니다.

커스텀 파이프라인을 정의하려면 `Fortify::authenticateThrough` 메서드에 클로저를 넘겨주고, 로그인 요청을 거치게 할 클래스 배열을 반환해야 합니다. 이 코드는 보통 앱의 `App\Providers\FortifyServiceProvider` 클래스의 `boot` 메서드에서 호출합니다.

아래는 Fortify의 기본 파이프라인 정의 예시로, 커스터마이징할 때 참고용으로 사용할 수 있습니다.

```php
use Laravel\Fortify\Actions\AttemptToAuthenticate;
use Laravel\Fortify\Actions\EnsureLoginIsNotThrottled;
use Laravel\Fortify\Actions\PrepareAuthenticatedSession;
use Laravel\Fortify\Actions\RedirectIfTwoFactorAuthenticatable;
use Laravel\Fortify\Fortify;
use Illuminate\Http\Request;

Fortify::authenticateThrough(function (Request $request) {
    return array_filter([
            config('fortify.limiters.login') ? null : EnsureLoginIsNotThrottled::class,
            Features::enabled(Features::twoFactorAuthentication()) ? RedirectIfTwoFactorAuthenticatable::class : null,
            AttemptToAuthenticate::class,
            PrepareAuthenticatedSession::class,
    ]);
});
```

<a name="customizing-authentication-redirects"></a>
### 리디렉션 커스터마이징

로그인에 성공하면 Fortify는 앱의 `fortify` 설정 파일의 `home` 옵션에 지정된 URI로 리디렉션합니다. XHR 요청(비동기 요청)인 경우 200 HTTP 응답이 반환됩니다. 사용자가 로그아웃하면 `/` URI로 리디렉션됩니다.

이 동작을 더 세밀하게 제어하려면 `LoginResponse`와 `LogoutResponse` 계약의 구현체를 라라벨 [서비스 컨테이너](/docs/10.x/container)에 바인딩할 수 있습니다. 일반적으로, 앱의 `App\Providers\FortifyServiceProvider` 클래스의 `register` 메서드에서 아래와 같이 등록합니다.

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
## 이중 인증(2FA)

Fortify의 이중 인증(two factor authentication) 기능을 활성화하면, 인증 과정 중에 6자리 숫자로 된 토큰을 입력해야 합니다. 이 토큰은 시간 기반 일회용 비밀번호(TOTP)를 사용해 생성되며, Google Authenticator 등 TOTP를 지원하는 모바일 인증 앱으로 조회할 수 있습니다.

먼저, 앱의 `App\Models\User` 모델이 반드시 `Laravel\Fortify\TwoFactorAuthenticatable` 트레이트를 사용하고 있는지 확인해야 합니다.

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

다음으로, 사용자가 자신의 이중 인증 설정을 관리할 수 있는 화면을 앱에 만들어야 합니다. 이 화면에서는 이중 인증의 활성화/비활성화, 복구 코드 재생성 등을 지원해야 합니다.

> 기본적으로 `fortify` 설정 파일의 `features` 배열에서 이중 인증 설정 변경 시 비밀번호 확인이 필요하도록 지정되어 있습니다. 따라서, [비밀번호 확인](#password-confirmation) 기능을 앱에 구현한 후에 이중 인증 기능을 도입하는 것이 좋습니다.

<a name="enabling-two-factor-authentication"></a>
### 이중 인증 활성화

이중 인증을 활성화하려면, 앱이 Fortify가 정의한 `/user/two-factor-authentication` 엔드포인트에 POST 요청을 보내야 합니다. 요청이 성공하면 사용자는 이전 URL로 리디렉션되고, 세션 변수 `status`에 `two-factor-authentication-enabled`가 저장됩니다. 이 값을 활용해 템플릿에서 성공 메시지를 표시할 수 있습니다. XHR 요청인 경우엔 200 응답 코드가 반환됩니다.

이중 인증을 선택했더라도, 사용자는 반드시 유효한 이중 인증 코드를 입력해 본인 설정을 "확인(confirm)"해야 합니다. 따라서 성공 메시지에는 이중 인증 확인 절차가 남아 있다는 안내가 포함되어야 합니다.

```html
@if (session('status') == 'two-factor-authentication-enabled')
    <div class="mb-4 font-medium text-sm">
        아래에서 이중 인증 설정을 마저 완료해 주세요.
    </div>
@endif
```

그리고 나서 사용자가 인증 앱에 등록할 수 있도록, 이중 인증용 QR 코드를 화면에 표시해야 합니다. Blade를 사용하는 경우 인증된 사용자 인스턴스에서 `twoFactorQrCodeSvg` 메서드로 QR 코드 SVG를 얻을 수 있습니다.

```php
$request->user()->twoFactorQrCodeSvg();
```

자바스크립트 기반 프론트엔드를 만든다면, `/user/two-factor-qr-code` 엔드포인트에 XHR GET 요청을 보내면 사용자의 이중 인증 QR 코드를 포함한 JSON(`svg` 키) 데이터를 받을 수 있습니다.

<a name="confirming-two-factor-authentication"></a>
#### 이중 인증 확인(Confirming)

2차 QR 코드를 보여주면서, 사용자가 인증 앱에서 생성된 코드를 입력할 수 있는 입력란을 제공해야 합니다. 이 코드는 Fortify의 `/user/confirmed-two-factor-authentication` 엔드포인트로 POST 요청으로 전송되어야 합니다.

요청이 성공하면 사용자는 이전 URL로 리디렉션되고, 세션 변수 `status` 값이 `two-factor-authentication-confirmed`로 설정됩니다.

```html
@if (session('status') == 'two-factor-authentication-confirmed')
    <div class="mb-4 font-medium text-sm">
        이중 인증이 정상적으로 확인 및 활성화되었습니다.
    </div>
@endif
```

XHR 요청의 경우, 200 HTTP 응답이 반환됩니다.

<a name="displaying-the-recovery-codes"></a>
#### 복구 코드 표시

복구 코드(recovery codes)도 사용자에게 반드시 제공해야 합니다. 복구 코드는 모바일 기기를 분실한 경우 등의 상황에서 인증에 사용할 수 있습니다. Blade를 사용할 경우 인증된 사용자 인스턴스의 `recoveryCodes()` 메서드를 통해 복구 코드를 배열 형태로 얻을 수 있습니다.

```php
(array) $request->user()->recoveryCodes()
```

자바스크립트 기반 프론트엔드는 `/user/two-factor-recovery-codes` 엔드포인트에 XHR GET 요청을 보내면 복구 코드 목록을 담은 JSON 배열을 받을 수 있습니다.

복구 코드를 재생성하려면 `/user/two-factor-recovery-codes` 엔드포인트에 POST 요청을 보내면 됩니다.

<a name="authenticating-with-two-factor-authentication"></a>
### 이중 인증으로 인증하기

로그인 과정에서 Fortify는 자동으로 사용자를 앱의 이중 인증 도전(challenge) 화면으로 리디렉션합니다. 만약 XHR 방식으로 로그인 요청을 처리하는 경우, 인증 성공 시 반환되는 JSON 응답에 `two_factor` 불린 값이 포함됩니다. 이 값을 참고해 이중 인증 화면으로 리디렉션할지 여부를 결정할 수 있습니다.

이중 인증 기능을 구현하려면, Fortify에 "이중 인증 도전" 뷰를 어떻게 반환할지 알려주어야 합니다. 모든 인증 뷰 렌더링 로직은 `Laravel\Fortify\Fortify` 클래스의 메서드로 맞춤화할 수 있으며, 주로 앱의 `App\Providers\FortifyServiceProvider` 클래스의 `boot` 메서드에서 설정합니다.

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

Fortify는 `/two-factor-challenge` 라우트를 자동으로 정의하여 이 뷰를 반환하게 합니다. 이 템플릿에는 `/two-factor-challenge`로 POST 요청을 보내는 폼이 있어야 하며, 폼에는 유효한 TOTP 토큰을 입력받는 `code` 필드 또는 복구 코드를 입력받는 `recovery_code` 필드가 필요합니다.

로그인에 성공하면, Fortify는 `fortify` 설정 파일의 `home` 옵션에 지정한 URI로 리디렉션합니다. XHR 요청인 경우 204 HTTP 응답을 반환합니다.

실패한 경우에는 다시 이중 인증 도전 화면으로 돌아가고, 검증 오류는 `$errors` [Blade 템플릿 변수](/docs/10.x/validation#quick-displaying-the-validation-errors)로 전달됩니다. XHR 요청인 경우 422 응답입니다.

<a name="disabling-two-factor-authentication"></a>
### 이중 인증 비활성화

이중 인증을 비활성화하려면 `/user/two-factor-authentication` 엔드포인트에 DELETE 요청을 보내면 됩니다. 이 엔드포인트를 사용할 때는 반드시 [비밀번호 확인](#password-confirmation) 기능이 선행되어야 합니다.

<a name="registration"></a>
## 회원가입

회원가입 기능을 구현하려면, Fortify에 "회원가입" 뷰를 반환하는 방법을 알려주어야 합니다. Fortify는 헤드리스 인증 라이브러리입니다. 이미 구현된 UI가 필요한 경우 [애플리케이션 스타터 키트](/docs/10.x/starter-kits)를 사용하는 것이 좋습니다.

모든 뷰 렌더링 로직은 `Laravel\Fortify\Fortify` 클래스의 메서드로 맞춤화가 가능합니다. 일반적으로 앱의 `App\Providers\FortifyServiceProvider` 클래스의 `boot` 메서드에서 아래와 같이 구현합니다.

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

Fortify는 `/register` 라우트를 자동으로 정의해 이 뷰를 반환합니다. `register` 템플릿은 Fortify가 정의한 `/register` 엔드포인트로 POST 요청을 보내는 폼이 있어야 합니다.

`/register` 엔드포인트는 문자열 타입의 `name`, 문자열 이메일/아이디, `password`, `password_confirmation` 필드를 기대합니다. 이 중 이메일/아이디 필드명은 `fortify` 설정 파일의 `username` 값과 반드시 일치해야 합니다.

회원가입이 성공하면 Fortify는 설정한 `home` URI로 리디렉션합니다. XHR 요청인 경우 201 응답 코드가 반환됩니다.

실패할 경우에는 회원가입 화면으로 다시 돌아가고, 검증 오류는 `$errors` [Blade 템플릿 변수](/docs/10.x/validation#quick-displaying-the-validation-errors)로 전달됩니다. XHR 요청인 경우 422 응답 코드가 반환됩니다.

<a name="customizing-registration"></a>
### 회원가입 커스터마이징

사용자 검증 및 생성 로직은 Fortify 설치 시 생성된 `App\Actions\Fortify\CreateNewUser` 액션 파일을 수정함으로써 맞춤화할 수 있습니다.

<a name="password-reset"></a>
## 비밀번호 재설정

<a name="requesting-a-password-reset-link"></a>
### 비밀번호 재설정 링크 요청

비밀번호 재설정 기능을 구현하려면 먼저 Fortify에 "비밀번호 찾기" 뷰를 반환하는 방법을 알려주어야 합니다. Fortify는 헤드리스 인증 라이브러리입니다. 이미 구현된 UI가 필요하다면 [애플리케이션 스타터 키트](/docs/10.x/starter-kits)를 사용하는 것을 추천합니다.

모든 뷰 렌더링 로직은 `Laravel\Fortify\Fortify` 클래스의 메서드로 맞춤화가 가능합니다. 주로 앱의 `App\Providers\FortifyServiceProvider` 클래스의 `boot` 메서드에서 아래와 같이 구현합니다.

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

Fortify는 `/forgot-password` 엔드포인트를 자동으로 정의해서 이 뷰를 보여줍니다. `forgot-password` 템플릿에는 `/forgot-password`로 POST 요청을 보내는 폼이 있어야 하며, 필드는 문자열 타입의 `email` 하나만 있으면 됩니다. 이 필드명 및 데이터베이스 컬럼명은 `fortify` 설정 파일의 `email` 값과 일치해야 합니다.

<a name="handling-the-password-reset-link-request-response"></a>
#### 비밀번호 재설정 링크 요청 처리

비밀번호 재설정 링크 요청이 성공하면, Fortify는 사용자를 `/forgot-password` 엔드포인트로 다시 리디렉션하고, 사용자의 이메일로 안전한 비밀번호 재설정 링크를 전송합니다. XHR 요청일 경우 200 응답 코드가 반환됩니다.

요청 성공 후 다시 돌아온 `/forgot-password` 화면에서 세션 변수 `status` 값을 활용하여 결과 메시지를 화면에 표시할 수 있습니다.

`$status` 세션 변수에는 앱의 `passwords` [번역 파일](/docs/10.x/localization)에 정의된 번역 문자열 중 하나가 담기게 됩니다. 직접 값을 커스터마이즈하고 싶고, 아직 라라벨 번역 파일을 퍼블리시하지 않았다면 `lang:publish` 아티즌 명령어로 해당 파일을 퍼블리시할 수 있습니다.

```html
@if (session('status'))
    <div class="mb-4 font-medium text-sm text-green-600">
        {{ session('status') }}
    </div>
@endif
```

요청이 실패했을 경우에는 다시 비밀번호 재설정 요청 화면으로 돌아가고, 검증 오류는 `$errors` [Blade 템플릿 변수](/docs/10.x/validation#quick-displaying-the-validation-errors)에서 확인할 수 있습니다. XHR 요청의 경우 422 응답이 반환됩니다.

<a name="resetting-the-password"></a>
### 비밀번호 재설정

비밀번호 재설정 기능을 완성하려면, Fortify에 "비밀번호 재설정" 뷰를 반환하는 방법을 정의해야 합니다.

모든 뷰 렌더링 로직은 `Laravel\Fortify\Fortify` 클래스의 메서드로 커스터마이징할 수 있으며, 주로 앱의 `App\Providers\FortifyServiceProvider` 클래스의 `boot` 메서드에서 아래처럼 설정합니다.

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

Fortify가 비밀번호 재설정 화면을 노출하는 라우트도 자동으로 정의합니다. `reset-password` 템플릿에는 `/reset-password`로 POST 요청을 보내는 폼이 있어야 하며, 폼 필드는 문자열 타입의 `email`, `password`, `password_confirmation`, 그리고 `request()->route('token')` 값을 담는 숨김 필드 `token`이 필요합니다. "email" 필드명 및 데이터베이스 컬럼명은 앱의 `fortify` 설정 파일에서 정의한 `email` 값과 일치해야 합니다.

<a name="handling-the-password-reset-response"></a>
#### 비밀번호 재설정 응답 처리

비밀번호 재설정 요청에 성공하면 Fortify는 `/login` 라우트로 리디렉션해 사용자가 새 비밀번호로 로그인할 수 있게 합니다. 또한, 성공 상태를 로그인 화면에서 표시할 수 있도록 `status` 세션 변수가 설정됩니다.

```blade
@if (session('status'))
    <div class="mb-4 font-medium text-sm text-green-600">
        {{ session('status') }}
    </div>
@endif
```

XHR 요청일 경우 200 응답이 반환됩니다.

실패했을 경우에는 재설정 화면으로 다시 돌아가고, 검증 오류는 `$errors` [Blade 템플릿 변수](/docs/10.x/validation#quick-displaying-the-validation-errors)에 담깁니다. XHR 요청 시에는 422 응답 코드가 반환됩니다.

<a name="customizing-password-resets"></a>
### 비밀번호 재설정 커스터마이징

비밀번호 재설정 과정은 Fortify 설치 시 생성된 `App\Actions\ResetUserPassword` 액션 파일을 수정해서 맞춤화할 수 있습니다.

<a name="email-verification"></a>
## 이메일 인증

회원가입 후에는 사용자가 계속해서 앱을 이용하기 전에 이메일 주소를 인증하도록 요구하고 싶을 수 있습니다. 먼저, `fortify` 설정 파일의 `features` 배열에서 `emailVerification` 기능이 활성화되어 있는지 확인하세요. 그리고 `App\Models\User` 클래스가 반드시 `Illuminate\Contracts\Auth\MustVerifyEmail` 인터페이스를 구현하고 있어야 합니다.

이 두 단계를 마치면, 새롭게 가입한 사용자에게 이메일 소유권을 인증하는 링크가 담긴 이메일이 발송됩니다. 다음으로, Fortify가 인증이 필요한 사용자를 위한 이메일 인증 화면을 어떻게 표시할지 정의해주어야 합니다.

모든 뷰 렌더링 로직은 `Laravel\Fortify\Fortify` 클래스의 메서드를 사용해 맞춤화할 수 있습니다. 일반적으로 앱의 `App\Providers\FortifyServiceProvider` 클래스의 `boot` 메서드에서 아래처럼 작성합니다.

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

Fortify는 사용자가 `/email/verify` 엔드포인트로 리디렉션될 때 이 뷰를 반환하도록 자동으로 라우트를 정의합니다. 이 라우트는 라라벨의 `verified` 미들웨어를 사용합니다.

`verify-email` 템플릿에는 인증 이메일에 포함된 링크를 클릭해야 한다는 안내 메시지를 포함해야 합니다.

<a name="resending-email-verification-links"></a>
#### 이메일 인증 링크 재발송

원한다면 `verify-email` 템플릿에 인증 링크를 재전송하는 버튼을 추가할 수 있습니다. 이 버튼이 클릭되면 `/email/verification-notification` 엔드포인트로 POST 요청을 보내게 됩니다. 이 요청이 성공하면 Fortify는 사용자를 다시 `/email/verify`로 리디렉션하면서, `status` 세션 변수를 설정하여 성공 메시지를 제공하게 됩니다. XHR 요청인 경우 202 응답 코드가 반환됩니다.

```blade
@if (session('status') == 'verification-link-sent')
    <div class="mb-4 font-medium text-sm text-green-600">
        새 이메일 인증 링크가 발송되었습니다!
    </div>
@endif
```

<a name="protecting-routes"></a>
### 라우트 보호하기

특정 라우트 또는 라우트 그룹이 반드시 이메일 인증을 마친 사용자만 접근 가능하도록 하려면, 해당 라우트에 라라벨 내장 `verified` 미들웨어를 붙이면 됩니다. 이 미들웨어는 앱의 `App\Http\Kernel` 클래스에 이미 등록되어 있습니다.

```php
Route::get('/dashboard', function () {
    // ...
})->middleware(['verified']);
```

<a name="password-confirmation"></a>
## 비밀번호 확인

애플리케이션을 만들다 보면 일부 작업은 사용자에게 비밀번호 재확인을 요구해야 할 때가 있습니다. 이 경우 라라벨의 내장 `password.confirm` 미들웨어로 라우트를 보호할 수 있습니다.

비밀번호 확인 기능을 구현하려면, Fortify에 "비밀번호 확인" 뷰를 반환하는 방법을 알려주어야 합니다. Fortify는 헤드리스 인증 라이브러리입니다. 이미 인증 기능이 포함된 프론트엔드가 필요하다면 [애플리케이션 스타터 키트](/docs/10.x/starter-kits)를 사용하는 것이 좋습니다.

모든 뷰 렌더링 로직은 `Laravel\Fortify\Fortify` 클래스의 메서드를 사용해 맞춤화할 수 있습니다. 일반적으로 앱의 `App\Providers\FortifyServiceProvider` 클래스의 `boot` 메서드에서 아래와 같이 작성합니다.

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

Fortify는 `/user/confirm-password` 엔드포인트를 자동으로 정의해 이 뷰를 반환합니다. `confirm-password` 템플릿에는 `/user/confirm-password`로 POST 요청을 보내는 폼이 있어야 하며, 폼에는 사용자의 현재 비밀번호를 입력받는 `password` 필드가 필요합니다.

비밀번호가 일치하면 사용자는 원래 접근하려던 라우트로 리디렉션됩니다. XHR 요청일 경우 201 응답 코드가 반환됩니다.

실패할 경우에는 비밀번호 확인 화면으로 다시 이동하며, 검증 오류는 Blade의 `$errors` 변수로 확인할 수 있습니다. XHR 요청은 422 응답 코드로 반환됩니다.
