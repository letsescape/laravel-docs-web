# 라라벨 포티파이 (Laravel Fortify)

- [소개](#introduction)
    - [Fortify란?](#what-is-fortify)
    - [Fortify를 언제 사용해야 할까요?](#when-should-i-use-fortify)
- [설치](#installation)
    - [Fortify 서비스 프로바이더](#the-fortify-service-provider)
    - [Fortify 기능](#fortify-features)
    - [뷰 비활성화](#disabling-views)
- [인증](#authentication)
    - [사용자 인증 커스터마이징](#customizing-user-authentication)
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
    - [비밀번호 재설정하기](#resetting-the-password)
    - [비밀번호 재설정 커스터마이징](#customizing-password-resets)
- [이메일 인증](#email-verification)
    - [라우트 보호하기](#protecting-routes)
- [비밀번호 확인](#password-confirmation)

<a name="introduction"></a>
## 소개

[라라벨 Fortify](https://github.com/laravel/fortify)는 라라벨을 위한 프론트엔드에 독립적인 인증 백엔드 구현체입니다. Fortify는 로그인, 회원가입, 비밀번호 재설정, 이메일 인증 등 라라벨의 모든 인증 기능을 구현하는 데 필요한 라우트와 컨트롤러를 등록해줍니다. Fortify를 설치한 후에는 `route:list` 아티즌 명령어를 실행하여 Fortify가 등록한 라우트를 확인할 수 있습니다.

Fortify는 별도의 사용자 인터페이스(UI)를 제공하지 않으므로, 여러분은 직접 만든 UI에서 Fortify가 등록한 라우트로 요청을 보내는 방식으로 사용하게 됩니다. 이 문서의 나머지 부분에서는 이러한 라우트로 어떻게 요청을 보내야 하는지 자세히 안내합니다.

> [!TIP]
> Fortify는 라라벨의 인증 기능을 빠르게 구현할 수 있도록 도와주는 패키지입니다. **반드시 사용해야 하는 것은 아닙니다.** [인증](/docs/8.x/authentication), [비밀번호 재설정](/docs/8.x/passwords), [이메일 인증](/docs/8.x/verification) 공식 문서를 참고해 직접 라라벨 인증 서비스를 다루실 수도 있습니다.

<a name="what-is-fortify"></a>
### Fortify란?

앞서 언급했듯, 라라벨 Fortify는 프론트엔드에 구애받지 않고 인증 기능을 백엔드에서 구현해주는 패키지입니다. Fortify는 로그인, 회원가입, 비밀번호 재설정, 이메일 인증 등 라라벨의 인증 기능 구현에 필요한 라우트와 컨트롤러를 등록합니다.

**라라벨의 인증 기능을 사용하려면 반드시 Fortify를 설치할 필요는 없습니다.** [인증](/docs/8.x/authentication), [비밀번호 재설정](/docs/8.x/passwords), [이메일 인증](/docs/8.x/verification) 공식 문서를 참고해 직접 인증 서비스를 구현할 수도 있습니다.

라라벨을 처음 접하신다면, Fortify를 사용하기 전에 [라라벨 Breeze](/docs/8.x/starter-kits) 스타터 키트를 먼저 살펴보시기를 권장합니다. Breeze는 [Tailwind CSS](https://tailwindcss.com)로 만들어진 UI와 함께 인증 스캐폴딩(기본 틀)을 제공합니다. Breeze는 Fortify와 달리, 라우트와 컨트롤러가 프로젝트 코드에 직접 추가되어 소스 코드를 분석하며 인증 구조를 익히기에 적합합니다.

Fortify는 기본적으로 Breeze의 라우트와 컨트롤러를 별도의 UI 없이 패키지 형태로 제공합니다. 즉, 프론트엔드 구현 방식에 구애받지 않고, 인증 백엔드만 빠르게 도입할 수 있도록 도와줍니다.

<a name="when-should-i-use-fortify"></a>
### Fortify를 언제 사용해야 할까요?

Fortify가 언제 적합한 선택인지 궁금할 수 있습니다. 먼저, 라라벨의 [애플리케이션 스타터 키트](/docs/8.x/starter-kits)를 사용 중이라면 Fortify를 별도로 설치할 필요가 없습니다. 모든 스타터 키트에는 이미 인증 기능이 완비되어 있습니다.

스타터 키트를 사용하지 않고 자체적으로 인증이 필요한 애플리케이션을 만든다면, 두 가지 방법이 있습니다: 직접 인증 기능을 구현하거나, Fortify로 백엔드 인증 부분을 빠르게 도입하는 방법입니다.

Fortify를 설치한다면, 여러분은 이 문서에 설명된 Fortify의 인증 관련 라우트로 직접 요청을 보내는 UI를 만들어야 합니다.

반대로 Fortify 없이 인증 서비스를 직접 다루려면, [인증](/docs/8.x/authentication), [비밀번호 재설정](/docs/8.x/passwords), [이메일 인증](/docs/8.x/verification) 문서를 참고하세요.

<a name="laravel-fortify-and-laravel-sanctum"></a>
#### 라라벨 Fortify & 라라벨 Sanctum

[라라벨 Sanctum](/docs/8.x/sanctum)과 라라벨 Fortify의 차이점에 헷갈릴 수 있습니다. 이 두 패키지는 서로 다른 목적을 해결하므로, 경쟁하거나 대체 관계가 아닙니다.

라라벨 Sanctum은 API 토큰 관리와, 기존 사용자의 세션 쿠키 또는 토큰 인증에만 집중합니다. 회원가입, 비밀번호 재설정 등 사용자 관리를 위한 라우트는 제공하지 않습니다.

따라서, API나 싱글 페이지 애플리케이션(SPA) 백엔드를 구축하면서 인증 기능(회원가입, 비밀번호 재설정 등)은 Fortify로, API 토큰 관리나 세션 인증은 Sanctum으로 동시에 사용할 수 있습니다.

<a name="installation"></a>
## 설치

먼저, Composer 패키지 매니저를 사용해 Fortify를 설치합니다.

```nothing
composer require laravel/fortify
```

그 다음, `vendor:publish` 명령어로 Fortify의 리소스를 퍼블리시합니다:

```bash
php artisan vendor:publish --provider="Laravel\Fortify\FortifyServiceProvider"
```

이 명령어를 실행하면, Fortify의 액션 클래스가 여러분의 `app/Actions` 디렉토리에 생성됩니다(존재하지 않으면 새로 생성). 또한 Fortify 관련 설정 파일과 마이그레이션도 퍼블리시됩니다.

이제 데이터베이스 마이그레이션을 실행하세요.

```bash
php artisan migrate
```

<a name="the-fortify-service-provider"></a>
### Fortify 서비스 프로바이더

위에서 사용한 `vendor:publish` 명령어는 `App\Providers\FortifyServiceProvider` 클래스도 생성합니다. 반드시 라라벨의 `config/app.php` 파일 `providers` 배열에 이 서비스 프로바이더가 등록되어 있는지 확인하세요.

Fortify 서비스 프로바이더는 퍼블리시된 액션들을 등록하고, Fortify가 관련 작업을 수행할 때 이 액션들을 사용하도록 설정합니다.

<a name="fortify-features"></a>
### Fortify 기능

`fortify` 설정 파일에는 `features` 배열이 있습니다. 이 배열에서 Fortify가 기본적으로 노출할 백엔드 라우트와 기능을 결정합니다. [Laravel Jetstream](https://jetstream.laravel.com)과 Fortify를 함께 사용하지 않는다면, 대부분의 라라벨 애플리케이션에서 필요한 로그인, 회원가입, 비밀번호 재설정 등 인증 기본 기능만 활성화하는 것을 추천합니다:

```php
'features' => [
    Features::registration(),
    Features::resetPasswords(),
    Features::emailVerification(),
],
```

<a name="disabling-views"></a>
### 뷰 비활성화

Fortify는 기본적으로 로그인, 회원가입 화면 등 뷰를 반환하는 라우트를 정의합니다. 하지만 자바스크립트 기반 싱글페이지 애플리케이션(SPA)이라면, 이러한 라우트가 불필요할 수 있습니다. 이 경우, 애플리케이션의 `config/fortify.php` 파일에서 `views` 값을 `false`로 설정해 이러한 라우트를 완전히 비활성화할 수 있습니다:

```php
'views' => false,
```

<a name="disabling-views-and-password-reset"></a>
#### 뷰 비활성화 & 비밀번호 재설정

만약 Fortify의 뷰를 비활성화하면서 애플리케이션의 비밀번호 재설정 기능을 구현하려면, `password.reset`이라는 이름의 라우트를 정의해 비밀번호 재설정 화면을 보여주도록 해야 합니다. 이는 라라벨의 `Illuminate\Auth\Notifications\ResetPassword` 알림이 `password.reset` 명명 라우트를 통해 비밀번호 재설정 URL을 생성하기 때문입니다.

<a name="authentication"></a>
## 인증

먼저, Fortify가 "로그인" 화면을 반환하도록 설정해야 합니다. Fortify는 프론트엔드가 없는(headless) 인증 라이브러리임을 기억하세요. 프론트엔드까지 포함된 완성된 인증 기능이 필요하다면 [애플리케이션 스타터 키트](/docs/8.x/starter-kits) 사용을 고려해 주세요.

모든 인증 관련 뷰 렌더링 로직은 `Laravel\Fortify\Fortify` 클래스에서 제공하는 메서드를 통해 커스터마이즈할 수 있습니다. 일반적으로, 여러분의 `App\Providers\FortifyServiceProvider` 클래스의 `boot` 메서드에서 호출하면 됩니다. `/login` 라우트 정의는 Fortify가 알아서 처리합니다:

```
use Laravel\Fortify\Fortify;

/**
 * Bootstrap any application services.
 *
 * @return void
 */
public function boot()
{
    Fortify::loginView(function () {
        return view('auth.login');
    });

    // ...
}
```

로그인 폼에서는 `/login`에 POST 요청을 보내야 하며, `email`/`username`(문자열)과 `password`가 필요합니다. 이메일/사용자명 필드의 이름은 `config/fortify.php` 설정 파일의 `username` 값과 동일해야 합니다. 또한, "remember me" 기능을 사용하고 싶다면 `remember`(불린 값) 필드를 함께 전송할 수 있습니다.

로그인에 성공하면, Fortify는 `fortify` 설정 파일의 `home` 옵션에 지정된 URI로 리디렉션합니다. XHR 요청일 경우에는 200 HTTP 응답이 반환됩니다.

로그인에 실패하면, 사용자는 로그인 화면으로 되돌아가고, 검증 에러는 공유 `$errors` [Blade 템플릿 변수](/docs/8.x/validation#quick-displaying-the-validation-errors)에서 확인할 수 있습니다. XHR 요청이라면, 422 HTTP 응답과 검증 에러가 반환됩니다.

<a name="customizing-user-authentication"></a>
### 사용자 인증 커스터마이징

Fortify는 기본적으로 전달 받은 자격 정보를 기반으로 사용자와 인증 가드를 이용해 인증을 자동으로 처리합니다. 하지만, 직접 로그인 자격 증명 검증 및 사용자 조회 과정을 커스터마이즈하고 싶다면, `Fortify::authenticateUsing` 메서드를 사용할 수 있습니다.

이 메서드는 클로저를 인자로 받으며, 요청이 전달됩니다. 이 클로저에서 자격 증명을 검증하고, 해당 사용자를 반환하면 됩니다. 유효하지 않은 경우에는 `null` 또는 `false`를 반환해야 합니다. 보통 `FortifyServiceProvider` 클래스의 `boot` 메서드 안에서 호출하면 됩니다.

```php
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Laravel\Fortify\Fortify;

/**
 * Bootstrap any application services.
 *
 * @return void
 */
public function boot()
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

Fortify에서 사용할 인증 가드는 `fortify` 설정 파일에서 수정할 수 있습니다. 단, 반드시 `Illuminate\Contracts\Auth\StatefulGuard`를 구현한 가드여야 합니다. SPA(싱글 페이지 애플리케이션) 인증에 Fortify를 사용하려면 라라벨 기본 `web` 가드와 [라라벨 Sanctum](https://laravel.com/docs/sanctum)을 조합해 사용하세요.

<a name="customizing-the-authentication-pipeline"></a>
### 인증 파이프라인 커스터마이징

라라벨 Fortify는 로그인 요청을 일련의 호출 가능한 파이프라인 클래스들을 거쳐 인증합니다. 필요에 따라, 로그인 요청이 거치는 파이프라인 클래스를 직접 지정할 수도 있습니다. 각 클래스에는 요청 객체(`Illuminate\Http\Request`)와, 다음 파이프라인으로 넘기는 `$next` 변수가 전달됩니다([미들웨어](/docs/8.x/middleware)와 유사합니다).

커스텀 파이프라인을 정의하려면 `Fortify::authenticateThrough` 메서드를 사용하세요. 이 메서드는 클래스를 배열로 반환하는 클로저를 인자로 받습니다. 일반적으로 `App\Providers\FortifyServiceProvider` 클래스의 `boot` 메서드에서 호출합니다.

아래는 기본 파이프라인 정의 예시입니다. 이를 참고해 필요한 부분만 수정해서 사용할 수 있습니다:

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

로그인에 성공하면 Fortify는 `fortify` 설정 파일의 `home` 옵션에 지정한 URI로 리디렉션합니다. XHR 요청이라면 200 HTTP 응답이 반환됩니다. 사용자가 로그아웃하면, 기본적으로 `/` URI로 리디렉션됩니다.

만약 이 동작을 더 세밀하게 제어하고 싶다면, `LoginResponse` 및 `LogoutResponse` 계약을 라라벨의 [서비스 컨테이너](/docs/8.x/container)에 바인딩하세요. 보통 `App\Providers\FortifyServiceProvider` 클래스의 `register` 메서드에서 처리합니다:

```php
use Laravel\Fortify\Contracts\LogoutResponse;

/**
 * Register any application services.
 *
 * @return void
 */
public function register()
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

Fortify의 이중 인증(2FA) 기능을 활성화하면, 인증 과정에서 6자리 숫자 토큰을 입력해야 합니다. 이 토큰은 Google Authenticator 등 TOTP(시간 기반 일회용 비밀번호) 호환 모바일 인증 앱으로 생성할 수 있습니다.

먼저, 여러분의 `App\Models\User` 모델에서 `Laravel\Fortify\TwoFactorAuthenticatable` 트레잇을 사용하고 있는지 확인하세요:

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

그리고 사용자가 이중 인증을 관리할 수 있는 화면을 구현해야 합니다. 즉, 사용자가 이중 인증을 켜거나 끄고, 복구 코드를 재생성할 수 있는 UI가 필요합니다.

> 기본적으로, `fortify` 설정 파일의 `features` 배열은 이중 인증 설정 변경 전에 비밀번호 확인이 필요하도록 설정합니다. 따라서, 계속 진행하기 전에 [비밀번호 확인](#password-confirmation) 기능이 함께 구현되어야 합니다.

<a name="enabling-two-factor-authentication"></a>
### 이중 인증 활성화

이중 인증을 활성화하려면, 애플리케이션에서 Fortify의 `/user/two-factor-authentication` 엔드포인트로 POST 요청을 보내면 됩니다. 성공 시, 이전 URL로 리디렉션되며 세션 변수 `status`가 `two-factor-authentication-enabled`로 설정됩니다. 이 세션 변수를 활용해 성공 메시지를 표시할 수 있습니다. XHR 요청인 경우, 200 HTTP 응답이 반환됩니다:

```html
@if (session('status') == 'two-factor-authentication-enabled')
    <div class="mb-4 font-medium text-sm text-green-600">
        Two factor authentication has been enabled.
    </div>
@endif
```

이제 사용자에게 2FA(이중 인증) QR 코드를 표시해야 하며, 사용자는 이를 인증 앱에 스캔해야 합니다. Blade를 사용한다면, user 인스턴스에서 `twoFactorQrCodeSvg` 메서드로 QR 코드 SVG를 받아올 수 있습니다:

```php
$request->user()->twoFactorQrCodeSvg();
```

자바스크립트 기반 프론트엔드라면, `/user/two-factor-qr-code`로 GET 요청을 해 QR 코드(리턴되는 JSON 객체의 `svg` 키 포함)를 받아올 수 있습니다.

<a name="displaying-the-recovery-codes"></a>
#### 복구 코드 표시하기

2FA 복구 코드도 사용자에게 안내해야 합니다. 사용자가 모바일 기기 접근 권한을 잃더라도 이 코드로 인증할 수 있습니다. Blade라면 아래처럼 복구 코드를 가져올 수 있습니다:

```php
(array) $request->user()->recoveryCodes()
```

자바스크립트 기반 프론트엔드라면 `/user/two-factor-recovery-codes` 엔드포인트로 GET 요청하여 복구 코드(JSON 배열)를 받아올 수 있습니다. 복구 코드를 재생성하려면 `/user/two-factor-recovery-codes`로 POST 요청을 보내세요.

<a name="authenticating-with-two-factor-authentication"></a>
### 이중 인증으로 인증하기

인증 과정에서 Fortify는 자동으로 2FA 챌린지 화면으로 리디렉션합니다. 그러나 XHR(비동기) 로그인 요청인 경우, 인증 성공 후 반환되는 JSON 응답 객체의 `two_factor` 속성을 확인해 2FA 인증이 필요한지 판단해야 합니다.

이중 인증 기능 사용을 시작하려면 Fortify가 2FA 챌린지(2단계 인증) 화면을 반환하는 방법을 지정해주어야 합니다. 모든 인증 뷰 렌더링 로직은 `Laravel\Fortify\Fortify` 클래스에서 메서드로 커스터마이즈할 수 있으며, `App\Providers\FortifyServiceProvider` 클래스의 `boot` 메서드에서 호출합니다:

```php
use Laravel\Fortify\Fortify;

/**
 * Bootstrap any application services.
 *
 * @return void
 */
public function boot()
{
    Fortify::twoFactorChallengeView(function () {
        return view('auth.two-factor-challenge');
    });

    // ...
}
```

Fortify가 `/two-factor-challenge` 라우트를 정의해 해당 뷰를 반환합니다. 이 템플릿에는 `/two-factor-challenge` 엔드포인트로 POST 요청하는 폼이 필요합니다. 이 요청에는 `code` 필드(유효한 TOTP 토큰) 또는 `recovery_code` 필드(복구 코드)를 포함해야 합니다.

로그인 성공 시, Fortify는 `fortify` 설정 파일의 `home` 옵션에 지정된 URI로 리디렉션합니다. XHR 요청인 경우에는 204 HTTP 응답을 반환합니다.

실패 시, 다시 2FA 챌린지 화면으로 되돌아가며, 검증 에러는 `$errors` [Blade 변수](/docs/8.x/validation#quick-displaying-the-validation-errors) 또는 XHR 요청의 경우 422 응답에 포함됩니다.

<a name="disabling-two-factor-authentication"></a>
### 이중 인증 비활성화

이중 인증을 끄려면, 애플리케이션에서 `/user/two-factor-authentication` 엔드포인트로 DELETE 요청을 보내면 됩니다. Fortify의 2FA 관련 엔드포인트는 호출 전에 반드시 [비밀번호 확인](#password-confirmation)이 필요합니다.

<a name="registration"></a>
## 회원가입

회원가입 기능을 구현하려면 Fortify가 "회원가입" 화면을 반환하는 방식을 지정해줘야 합니다. Fortify는 앞서 언급한 것처럼 프론트엔드가 없는 인증 라이브러리입니다. 인증 UI까지 포함해 완성된 방식이 필요하면 [애플리케이션 스타터 키트](/docs/8.x/starter-kits)를 사용해 주세요.

Fortify의 모든 뷰 렌더링 로직은 `Laravel\Fortify\Fortify` 클래스에서 메서드를 통해 설정할 수 있습니다. 보통 `App\Providers\FortifyServiceProvider`의 `boot` 메서드에서 아래와 같이 지정합니다:

```php
use Laravel\Fortify\Fortify;

/**
 * Bootstrap any application services.
 *
 * @return void
 */
public function boot()
{
    Fortify::registerView(function () {
        return view('auth.register');
    });

    // ...
}
```

Fortify가 `/register` 라우트를 자동으로 정의하며, 이 템플릿 내부에는 `/register` 엔드포인트로 POST 요청하는 폼이 필요합니다.

`/register` 엔드포인트는 `name`(문자열), 이메일/사용자명(문자열), `password`, `password_confirmation` 필드를 기대합니다. 이메일/사용자명 필드의 이름은 `fortify` 설정 파일의 `username` 값과 맞추어야 합니다.

회원가입에 성공하면 Fortify는 `fortify` 설정 파일의 `home` 옵션에 정의된 URI로 리디렉션합니다. XHR 요청일 때는 200 응답이 반환됩니다.

실패 시에는 회원가입 화면으로 다시 되돌아가고, 검증 에러는 `$errors` [Blade 템플릿 변수](/docs/8.x/validation#quick-displaying-the-validation-errors) 또는 XHR 422 응답에 포함됩니다.

<a name="customizing-registration"></a>
### 회원가입 커스터마이징

회원 검증 및 생성 과정은 Fortify 설치 시 생성된 `App\Actions\Fortify\CreateNewUser` 액션을 수정해 원하는 대로 변경할 수 있습니다.

<a name="password-reset"></a>
## 비밀번호 재설정

<a name="requesting-a-password-reset-link"></a>
### 비밀번호 재설정 링크 요청

비밀번호 재설정 기능 구현을 시작하려면, Fortify가 "비밀번호 찾기" 뷰를 반환하는 방식을 지정해주어야 합니다. Fortify는 프론트엔드 없는 라이브러리이므로, 완성된 인증 UI가 필요하다면 [애플리케이션 스타터 키트](/docs/8.x/starter-kits)를 사용해 주세요.

모든 뷰 렌더링 커스터마이징은 `Laravel\Fortify\Fortify` 클래스에서 지정할 수 있습니다. `App\Providers\FortifyServiceProvider`의 `boot` 메서드에서 아래와 같이 작성합니다:

```php
use Laravel\Fortify\Fortify;

/**
 * Bootstrap any application services.
 *
 * @return void
 */
public function boot()
{
    Fortify::requestPasswordResetLinkView(function () {
        return view('auth.forgot-password');
    });

    // ...
}
```

Fortify가 `/forgot-password` 엔드포인트를 자동 정의하며, 이 템플릿에는 `/forgot-password`로 POST 요청하는 폼이 필요합니다.

이 엔드포인트에는 `email` 필드(문자열)가 필요합니다. 이 필드와 DB 컬럼 이름은 `fortify` 설정 파일의 `email` 값과 일치해야 합니다.

<a name="handling-the-password-reset-link-request-response"></a>
#### 비밀번호 재설정 링크 응답 처리

비밀번호 재설정 링크 요청이 성공하면, Fortify는 사용자를 다시 `/forgot-password` 엔드포인트로 리디렉션하고, 사용자의 이메일로 비밀번호 재설정 링크가 발송됩니다. XHR 요청 시에는 200 응답이 반환됩니다.

성공 후 `/forgot-password`에 리디렉션되었을 때, 세션 변수 `status`로 요청 결과 메시지를 표시할 수 있습니다. 이 값은 애플리케이션의 `passwords` [언어 파일](/docs/8.x/localization)에 정의된 번역 문자열 중 하나와 일치합니다:

```html
@if (session('status'))
    <div class="mb-4 font-medium text-sm text-green-600">
        {{ session('status') }}
    </div>
@endif
```

실패하면, 다시 비밀번호 재설정 화면으로 돌아가며 검증 에러는 `$errors` [Blade 변수](/docs/8.x/validation#quick-displaying-the-validation-errors) 또는 XHR 422 응답으로 반환됩니다.

<a name="resetting-the-password"></a>
### 비밀번호 재설정하기

비밀번호 재설정 절차를 완성하려면, Fortify가 "비밀번호 재설정" 화면을 반환하도록 지정해야 합니다.

모든 뷰 렌더링 커스터마이징은 `Laravel\Fortify\Fortify` 클래스에서 처리할 수 있습니다. 아래 방식으로 `App\Providers\FortifyServiceProvider`의 `boot` 메서드에서 지정합니다:

```php
use Laravel\Fortify\Fortify;

/**
 * Bootstrap any application services.
 *
 * @return void
 */
public function boot()
{
    Fortify::resetPasswordView(function ($request) {
        return view('auth.reset-password', ['request' => $request]);
    });

    // ...
}
```

Fortify가 해당 뷰 반환 라우트를 자동 정의합니다. 이 템플릿에는 `/reset-password`로 POST 요청하는 폼이 필요합니다.

`/reset-password` 엔드포인트는 `email`(문자열), `password`, `password_confirmation`, 그리고 `request()->route('token')` 값을 담은 숨겨진 `token` 필드를 필요로 합니다. "email" 필드/DB 컬럼명은 `fortify` 설정 파일의 `email` 값과 맞추어야 합니다.

<a name="handling-the-password-reset-response"></a>
#### 비밀번호 재설정 응답 처리

비밀번호 재설정이 성공적으로 완료되면, Fortify는 `/login` 라우트로 리디렉션하여 새로운 비밀번호로 로그인할 수 있게 합니다. 또한 세션 변수 `status`가 설정되어 성공 메시지를 표시할 수 있습니다:

```html
@if (session('status'))
    <div class="mb-4 font-medium text-sm text-green-600">
        {{ session('status') }}
    </div>
@endif
```

XHR 요청인 경우 200 응답이 반환됩니다.

실패하면 비밀번호 재설정 화면으로 되돌아가며, 검증 에러는 `$errors` [Blade 변수](/docs/8.x/validation#quick-displaying-the-validation-errors) 또는 XHR 422 응답으로 확인할 수 있습니다.

<a name="customizing-password-resets"></a>
### 비밀번호 재설정 커스터마이징

비밀번호 재설정 관련 과정은 Fortify 설치 시 생성된 `App\Actions\ResetUserPassword` 액션을 수정해 원하는 대로 바꿀 수 있습니다.

<a name="email-verification"></a>
## 이메일 인증

회원가입 후, 사용자가 애플리케이션을 계속 사용하기 전에 이메일 인증을 요구할 수도 있습니다. 먼저, `fortify` 설정 파일의 `features` 배열에서 `emailVerification` 기능이 활성화되어 있는지 확인하세요. 그리고 `App\Models\User` 클래스가 반드시 `Illuminate\Contracts\Auth\MustVerifyEmail` 인터페이스를 구현해야 합니다.

이 두 가지가 준비되면, 새로 가입한 사용자에게 이메일 소유권 인증을 위한 메일이 전송됩니다. 이제 Fortify가 이메일 인증 안내 화면을 반환하는 방법을 지정해줘야 합니다.

모든 뷰 렌더링 커스터마이징은 `Laravel\Fortify\Fortify` 클래스에서 처리할 수 있고, 일반적으로 `App\Providers\FortifyServiceProvider`의 `boot` 메서드에서 호출합니다:

```php
use Laravel\Fortify\Fortify;

/**
 * Bootstrap any application services.
 *
 * @return void
 */
public function boot()
{
    Fortify::verifyEmailView(function () {
        return view('auth.verify-email');
    });

    // ...
}
```

Fortify가 `/email/verify` 엔드포인트에서 해당 뷰를 반환하도록 라우트를 정의하며, 이는 라라벨 내장 `verified` 미들웨어에 의해 리디렉션될 때 사용됩니다.

`verify-email` 템플릿에서는 사용자에게 이메일로 전송된 인증 링크를 클릭하라는 메시지(안내문)를 표시하세요.

<a name="resending-email-verification-links"></a>
#### 이메일 인증 링크 재전송

필요하다면, `verify-email` 템플릿에 인증 이메일을 다시 요청하는 버튼을 두고, `/email/verification-notification` 엔드포인트로 POST 요청을 전송하면 됩니다. 이 요청이 접수되면, 새로운 인증 링크가 사용자에게 이메일로 전송됩니다. 이전 인증 메일을 삭제했거나 잃어버린 경우 새로운 링크를 받을 수 있습니다.

인증 메일 재전송에 성공하면, Fortify는 `/email/verify` 엔드포인트로 다시 리디렉션하면서 세션 변수 `status`를 설정합니다. 이를 통해 성공 메시지를 표시할 수 있습니다. XHR 요청일 경우에는 202 응답이 반환됩니다:

```html
@if (session('status') == 'verification-link-sent')
    <div class="mb-4 font-medium text-sm text-green-600">
        A new email verification link has been emailed to you!
    </div>
@endif
```

<a name="protecting-routes"></a>
### 라우트 보호하기

특정 라우트(또는 라우트 그룹)에 이메일 인증이 완료된 사용자만 접근할 수 있도록 제한하려면, 해당 라우트에 라라벨 내장 `verified` 미들웨어를 추가하세요. 이 미들웨어는 `App\Http\Kernel` 클래스에 이미 등록되어 있습니다:

```php
Route::get('/dashboard', function () {
    // ...
})->middleware(['verified']);
```

<a name="password-confirmation"></a>
## 비밀번호 확인

애플리케이션을 개발하다 보면, 중요한 작업 전에 사용자에게 비밀번호 재확인을 요구해야 할 때가 있습니다. 보통 이런 라우트에는 라라벨 내장 `password.confirm` 미들웨어가 적용됩니다.

비밀번호 확인 기능 구현을 시작하려면, Fortify가 "비밀번호 확인" 화면을 반환하도록 지정해야 합니다. Fortify는 프론트엔드가 없는 인증 라이브러리이므로, 완성된 UI가 포함된 인증 시스템이 필요하다면 [애플리케이션 스타터 키트](/docs/8.x/starter-kits)를 사용해 주세요.

모든 뷰 렌더링 커스터마이징은 `Laravel\Fortify\Fortify` 클래스에서 처리할 수 있습니다. 보통 `App\Providers\FortifyServiceProvider` 클래스의 `boot` 메서드에서 아래와 같이 지정합니다:

```php
use Laravel\Fortify\Fortify;

/**
 * Bootstrap any application services.
 *
 * @return void
 */
public function boot()
{
    Fortify::confirmPasswordView(function () {
        return view('auth.confirm-password');
    });

    // ...
}
```

Fortify는 `/user/confirm-password` 엔드포인트로 해당 뷰를 반환합니다. `confirm-password` 템플릿에는 `/user/confirm-password`로 POST 요청하는 폼이 들어가야 하며, 이 엔드포인트는 `password`(현재 비밀번호) 필드를 기대합니다.

비밀번호가 현재 비밀번호와 일치하면, Fortify는 사용자가 접근하려 했던 라우트로 리디렉션합니다. XHR 요청이라면 201 응답이 반환됩니다.

실패하면 비밀번호 확인 화면으로 다시 돌아가며, 검증 에러는 공유 `$errors` Blade 변수 또는 XHR 422 응답으로 받을 수 있습니다.