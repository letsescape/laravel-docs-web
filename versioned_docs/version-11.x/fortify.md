# 라라벨 포티파이 (Laravel Fortify)

- [소개](#introduction)
    - [Fortify란 무엇인가?](#what-is-fortify)
    - [언제 Fortify를 사용해야 할까?](#when-should-i-use-fortify)
- [설치](#installation)
    - [Fortify의 기능](#fortify-features)
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
    - [비밀번호 재설정](#resetting-the-password)
    - [비밀번호 재설정 커스터마이징](#customizing-password-resets)
- [이메일 인증](#email-verification)
    - [라우트 보호하기](#protecting-routes)
- [비밀번호 확인](#password-confirmation)

<a name="introduction"></a>
## 소개

[Laravel Fortify](https://github.com/laravel/fortify)는 라라벨을 위한 프론트엔드에 독립적인 인증 백엔드 구현체입니다. Fortify는 로그인, 회원가입, 비밀번호 재설정, 이메일 인증 등 라라벨의 모든 인증 기능을 구현하는 데 필요한 라우트와 컨트롤러를 자동으로 등록합니다. Fortify를 설치한 후 `route:list` 아티즌 명령어를 실행하면, Fortify가 등록한 라우트를 확인할 수 있습니다.

Fortify는 자체 사용자 인터페이스(UI)를 제공하지 않으므로, 여러분이 별도로 만든 UI에서 Fortify가 제공하는 라우트로 요청을 보내는 방식으로 사용합니다. 이 문서의 나머지 부분에서 이러한 라우트로 요청을 보내는 방법을 자세히 설명합니다.

> [!NOTE]  
> Fortify는 라라벨 인증 기능 구현을 빠르게 시작할 수 있도록 도와주는 패키지입니다. **꼭 사용해야 하는 것은 아닙니다.** [인증](/docs/11.x/authentication), [비밀번호 재설정](/docs/11.x/passwords), [이메일 인증](/docs/11.x/verification) 공식 문서를 따라 라라벨의 인증 서비스를 직접 다루어도 괜찮습니다.

<a name="what-is-fortify"></a>
### Fortify란 무엇인가?

앞서 언급한 것처럼, Laravel Fortify는 라라벨을 위한 프론트엔드 독립형 인증 백엔드 구현체입니다. 로그인, 회원가입, 비밀번호 재설정, 이메일 인증 등 라라벨의 모든 인증 기능을 구현하는 데 필요한 라우트와 컨트롤러를 자동으로 등록합니다.

**Fortify를 사용하지 않아도 라라벨의 인증 기능을 사용할 수 있습니다.** [인증](/docs/11.x/authentication), [비밀번호 재설정](/docs/11.x/passwords), [이메일 인증](/docs/11.x/verification) 공식 문서에서 안내하는 방법대로 직접 인증 로직을 구현해도 됩니다.

라라벨을 처음 접하는 분이라면, Fortify를 사용하기 전에 [Laravel Breeze](/docs/11.x/starter-kits) 시작 키트를 먼저 살펴보는 것도 좋습니다. Laravel Breeze는 [Tailwind CSS](https://tailwindcss.com)로 만들어진 기본 UI와 함께 전체 인증 뼈대 코드를 직접 프로젝트에 복사해줍니다. Breeze는 Fortify와 달리 라우트와 컨트롤러를 애플리케이션 내부로 직접 복사해주기 때문에, 라라벨의 인증 기능을 소스코드를 통해 직접 공부하고 익힐 수 있습니다.

Fortify는 Laravel Breeze의 라우트와 컨트롤러를 패키지 형태로 제공하며, UI 부분은 포함하지 않습니다. 덕분에 특정 프론트엔드 라이브러리에 종속되지 않고도 인증 백엔드 구현을 빠르게 설정할 수 있습니다.

<a name="when-should-i-use-fortify"></a>
### 언제 Fortify를 사용해야 할까?

Laravel Fortify 사용 시점에 대해 고민할 수 있습니다. 먼저, [라라벨 애플리케이션 시작 키트](/docs/11.x/starter-kits)를 사용하는 경우, 별도의 Fortify 설치가 필요 없습니다. 시작 키트들은 이미 완전한 인증 구현을 제공합니다.

별도의 시작 키트를 사용하지 않고 애플리케이션에 인증 기능이 필요하다면, 인증을 직접 구현하거나 Fortify를 설치하여 인증 백엔드를 구축할 수 있습니다.

Fortify를 설치했다면, 직접 만든 사용자 인터페이스에서 이 문서에서 안내하는 Fortify가 등록한 인증 라우트에 요청을 보내는 방식을 사용하게 됩니다.

Fortify 없이 인증 기능을 직접 구현하려면, [인증](/docs/11.x/authentication), [비밀번호 재설정](/docs/11.x/passwords), [이메일 인증](/docs/11.x/verification) 문서를 참고하면 됩니다.

<a name="laravel-fortify-and-laravel-sanctum"></a>
#### Laravel Fortify와 Laravel Sanctum

[Laravel Sanctum](/docs/11.x/sanctum)과 Fortify의 차이점 때문에 혼란스러울 수 있습니다. 두 패키지는 서로 다른 문제를 해결하기 때문에, Fortify와 Sanctum은 경쟁하거나 상호 배타적인 패키지가 아닙니다.

Laravel Sanctum은 API 토큰 관리와 기존 사용자의 세션 쿠키 또는 토큰 인증만 담당합니다. 즉, Sanctum은 회원가입, 비밀번호 재설정 같은 라우트를 제공하지 않습니다.

API 백엔드를 직접 구축하거나 싱글 페이지 애플리케이션(SPA) 백엔드를 만들 계획이라면, Fortify(회원가입, 비밀번호 재설정 등)와 Sanctum(API 토큰 관리, 세션 인증)을 함께 사용할 수 있습니다.

<a name="installation"></a>
## 설치

먼저 Composer 패키지 매니저를 사용해 Fortify를 설치합니다.

```shell
composer require laravel/fortify
```

다음으로, Fortify의 리소스를 `fortify:install` 아티즌 명령어로 퍼블리시합니다.

```shell
php artisan fortify:install
```

이 명령어를 실행하면 `app/Actions` 디렉터리(없다면 생성됨)에 Fortify의 액션 파일들이 퍼블리시됩니다. 또한 `FortifyServiceProvider`, 설정 파일, 필요한 모든 데이터베이스 마이그레이션 파일도 함께 등록됩니다.

이후 데이터베이스 마이그레이션을 실행하세요.

```shell
php artisan migrate
```

<a name="fortify-features"></a>
### Fortify의 기능

`fortify` 설정 파일에는 `features` 설정 배열이 있습니다. 이 배열에서 Fortify가 기본적으로 제공할 백엔드 라우트 및 기능을 설정할 수 있습니다. [Laravel Jetstream](https://jetstream.laravel.com)과 함께 Fortify를 쓰지 않는다면, 라라벨에서 흔히 사용하는 기본 인증 기능만 활성화하기를 권장합니다.

```php
'features' => [
    Features::registration(),
    Features::resetPasswords(),
    Features::emailVerification(),
],
```

<a name="disabling-views"></a>
### 뷰 비활성화

기본적으로 Fortify는 로그인/회원가입 화면 등 뷰를 반환하는 라우트도 정의합니다. 하지만 Javascript 기반의 싱글 페이지 애플리케이션을 만든다면 이런 뷰 라우트가 필요 없을 수 있습니다. 이럴 때는 애플리케이션의 `config/fortify.php` 설정 파일에서 `views` 옵션을 `false`로 설정하여 뷰 라우트 전체를 비활성화할 수 있습니다.

```php
'views' => false,
```

<a name="disabling-views-and-password-reset"></a>
#### 뷰와 비밀번호 재설정 기능을 모두 비활성화할 경우

Fortify의 뷰 기능을 비활성화하면서, 애플리케이션에서 비밀번호 재설정 기능은 구현할 계획이라면, 여전히 새로운 "비밀번호 재설정" 뷰를 보여주는 별도의 `password.reset` 이름의 라우트를 정의해야 합니다. 이유는 라라벨의 `Illuminate\Auth\Notifications\ResetPassword` 알림이 `password.reset` 네임드 라우트를 통해 비밀번호 재설정 URL을 생성하기 때문입니다.

<a name="authentication"></a>
## 인증

인증 기능을 구현하려면 먼저 Fortify가 "로그인" 뷰를 어떻게 반환할지 알려주어야 합니다. Fortify는 UI가 없는(=헤드리스) 인증 라이브러리임을 다시 한번 떠올리세요. 이미 완성된 인증 UI가 필요하다면 [애플리케이션 스타터 키트](/docs/11.x/starter-kits)를 사용하는 것이 더 쉽습니다.

인증 화면의 렌더링 로직은 `Laravel\Fortify\Fortify` 클래스의 메서드를 사용해 언제든 커스터마이징할 수 있습니다. 보통, 이 코드는 애플리케이션의 `App\Providers\FortifyServiceProvider` 클래스의 `boot` 메서드에서 호출합니다. Fortify는 `/login` 라우트를 자동으로 정의하여, 지정한 뷰를 반환하게 해 줍니다.

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

로그인 템플릿에는 `/login` 엔드포인트로 POST 요청하는 폼이 포함되어야 합니다. `/login` 엔드포인트는 문자열 타입의 `email` 또는 `username`과 `password` 필드를 기대합니다. 이때, email/username 필드의 이름은 설정 파일 `config/fortify.php`의 `username` 값과 일치해야 합니다. 추가로, "로그인 상태 유지" 기능을 원한다면 불린값 `remember` 필드를 함께 전송할 수 있습니다.

로그인에 성공하면, Fortify는 애플리케이션의 `fortify` 설정 파일에서 `home` 옵션으로 지정한 URI로 리디렉트합니다. 만약 로그인 요청이 XHR 요청이었다면 200 HTTP 응답만 반환합니다.

로그인 실패 시에는 다시 로그인 화면으로 리디렉트되고, 유효성 검증 에러 메시지는 공유 변수인 `$errors` [Blade 템플릿 변수](/docs/11.x/validation#quick-displaying-the-validation-errors)로 조회할 수 있습니다. 또한 XHR 요청의 경우 422 HTTP 응답과 함께 검증 에러가 반환됩니다.

<a name="customizing-user-authentication"></a>
### 사용자 인증 커스터마이징

Fortify는 제공된 자격 증명과 애플리케이션의 인증 가드를 바탕으로 사용자를 자동으로 인증합니다. 그러나, 로그인 자격 증명 검증과 사용자 조회 방식을 완전히 직접 제어하고 싶을 때가 있습니다. 이럴 때는 `Fortify::authenticateUsing` 메서드로 손쉽게 커스터마이즈할 수 있습니다.

이 메서드는 HTTP 요청 객체를 받는 클로저를 인자로 받습니다. 이 클로저에서 로그인 자격 증명을 검증하고, 해당 사용자를 찾아 반환해야 합니다. 자격 증명이 올바르지 않거나 해당 사용자가 없다면 `null` 또는 `false`를 반환해야 합니다. 해당 코드는 보통 `FortifyServiceProvider`의 `boot` 메서드에서 호출합니다.

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

Fortify에서 사용할 인증 가드는 애플리케이션의 `fortify` 설정 파일에서 커스터마이징할 수 있습니다. 단, 반드시 `Illuminate\Contracts\Auth\StatefulGuard` 인터페이스의 구현체여야 합니다. SPA에서 Laravel Fortify 인증을 사용하려면, 라라벨 기본 `web` 가드와 [Laravel Sanctum](https://laravel.com/docs/sanctum)을 함께 쓰는 방식을 추천합니다.

<a name="customizing-the-authentication-pipeline"></a>
### 인증 파이프라인 커스터마이징

Laravel Fortify는 인증(로그인) 요청을 일련의 호출 가능한(Invokable) 클래스 파이프라인을 통해 처리합니다. 원한다면, 로그인 요청 시 거쳐야 할 커스텀 파이프라인 클래스를 직접 정의할 수 있습니다. 각 클래스에는 `__invoke` 메서드가 있어야 하며, [미들웨어](/docs/11.x/middleware)처럼 최초 인자로 `Illuminate\Http\Request` 인스턴스와, `$next` 변수(다음 클래스 실행시 호출)가 전달됩니다.

커스텀 파이프라인 정의는 `Fortify::authenticateThrough` 메서드를 통해 할 수 있습니다. 이 메서드는, 로그인 요청을 거칠 클래스 배열을 반환해야 하는 클로저를 인자로 받습니다. 이 역시 `App\Providers\FortifyServiceProvider` 클래스의 `boot` 메서드에서 호출하는 것이 일반적입니다.

아래는 각 항목을 커스터마이징하기 위한 기본 파이프라인 정의 예시입니다.

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

기본적으로 Fortify는 `EnsureLoginIsNotThrottled` 미들웨어를 통해 인증 시도를 제한합니다. 이 미들웨어는 사용자명과 IP 주소 조합별로 시도를 제한합니다.

일부 애플리케이션에서는 IP 주소 단독으로 제한하는 등, 다른 접근법이 필요할 수 있습니다. Fortify는 이런 경우를 위해 `fortify.limiters.login` 설정 옵션을 통해 [사용자 지정 요청 제한자(rate limiter)](/docs/11.x/routing#rate-limiting)를 지정할 수 있게 지원합니다. 이 옵션은 `config/fortify.php` 설정 파일에 있습니다.

> [!NOTE]  
> 인증 시도 제한, [이중 인증](/docs/11.x/fortify#two-factor-authentication), 외부 웹 애플리케이션 방화벽(WAF)을 함께 사용하면, 실제 사용자에게 훨씬 더 강력한 보안을 제공할 수 있습니다.

<a name="customizing-authentication-redirects"></a>
### 리디렉션 커스터마이징

로그인에 성공하면, Fortify는 애플리케이션의 `fortify` 설정 파일에서 `home` 옵션으로 지정된 URI로 리디렉션합니다. 로그인 요청이 XHR이었다면 200 HTTP 응답을 반환합니다. 사용자가 로그아웃하면 `/` URI로 리디렉션됩니다.

이 리디렉션 동작을 더 세밀하게 제어하려면, `LoginResponse` 및 `LogoutResponse` 계약(Contract) 구현체를 라라벨 [서비스 컨테이너](/docs/11.x/container)에 바인딩해야 합니다. 일반적으로 이 코드는 `App\Providers\FortifyServiceProvider`의 `register` 메서드에서 등록합니다.

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

Fortify의 이중 인증(2FA) 기능을 활성화하면, 인증 과정에서 6자리 숫자 토큰 입력을 추가로 요구하게 됩니다. 이 토큰은 TOTP(Time-based One-Time Password) 방식으로 생성되며, Google Authenticator 등 TOTP를 지원하는 모바일 인증 앱에서 받아올 수 있습니다.

먼저, 여러분의 앱의 `App\Models\User` 모델이 `Laravel\Fortify\TwoFactorAuthenticatable` 트레이트를 사용하는지 확인하세요.

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

그 다음, 사용자들이 이중 인증 설정을 직접 관리할 수 있는 화면을 만드세요. 이곳에서는 이중 인증 활성화/비활성화, 리커버리 코드 재생성 등이 가능해야 합니다.

> 기본적으로 `fortify` 설정 파일의 `features` 배열에 따라, 이중 인증 설정을 변경할 때 비밀번호 확인이 요구됩니다. 따라서, 먼저 Fortify의 [비밀번호 확인](#password-confirmation) 기능을 반드시 구현해두는 것이 좋습니다.

<a name="enabling-two-factor-authentication"></a>
### 이중 인증 활성화

이중 인증을 활성화하려면, 애플리케이션에서 Fortify가 정의한 `/user/two-factor-authentication` 엔드포인트로 POST 요청을 보내면 됩니다. 요청 성공 시, 사용자는 이전 URL로 리다이렉트되고 세션의 `status` 변수에 `two-factor-authentication-enabled`가 설정됩니다. 이 변수를 이용해 템플릿에서 상태 메시지를 표시할 수 있습니다. XHR 요청의 경우에는 200 HTTP 응답이 반환됩니다.

이중 인증 활성화 직후에는, 사용자가 실제로 올바른 이중 인증 코드를 입력해 인증을 "확정"해야 기능이 활성화된 것으로 처리됩니다. 따라서 성공 메시지에는 이중 인증 확정 단계가 남았음을 안내해야 합니다.

```html
@if (session('status') == 'two-factor-authentication-enabled')
    <div class="mb-4 font-medium text-sm">
        Please finish configuring two factor authentication below.
    </div>
@endif
```

다음 단계로, 사용자가 인증 앱으로 스캔할 수 있는 이중 인증 QR 코드를 보여주어야 합니다. Blade를 이용해 프론트엔드를 구현한다면, 사용자 모델의 `twoFactorQrCodeSvg` 메서드로 QR코드 SVG를 받아올 수 있습니다.

```php
$request->user()->twoFactorQrCodeSvg();
```

Javascript 기반 프론트엔드라면, `/user/two-factor-qr-code` 엔드포인트에 XHR GET 요청을 보내면, JSON 형식으로 `svg` 값을 받을 수 있습니다.

<a name="confirming-two-factor-authentication"></a>
#### 이중 인증 확정(Confirm)

QR 코드 표시와 함께, 사용자가 직접 인증 코드를 입력하는 폼을 제공해 "이중 인증 확정"을 진행해야 합니다. 이 코드는 Fortify가 정의한 `/user/confirmed-two-factor-authentication` 엔드포인트로 POST 요청됩니다.

요청이 성공하면, 이전 화면으로 리디렉션되며, 세션의 `status` 값이 `two-factor-authentication-confirmed`로 설정됩니다.

```html
@if (session('status') == 'two-factor-authentication-confirmed')
    <div class="mb-4 font-medium text-sm">
        Two factor authentication confirmed and enabled successfully.
    </div>
@endif
```

XHR 요청에 대해서는 200 HTTP 응답이 반환됩니다.

<a name="displaying-the-recovery-codes"></a>
#### 리커버리 코드 표시

이중 인증 사용자는, 만약 기기에 접근할 수 없게 된 경우 리커버리 코드를 이용해 인증할 수 있습니다. Blade 프론트엔드에서는 인증된 사용자 인스턴스를 통해 다음과 같이 리커버리 코드를 조회할 수 있습니다.

```php
(array) $request->user()->recoveryCodes()
```

Javascript 프론트엔드라면, `/user/two-factor-recovery-codes` 엔드포인트에 XHR GET 요청을 보내면 리커버리 코드 배열(JSON)이 반환됩니다.

리커버리 코드 재생성을 원한다면, `/user/two-factor-recovery-codes` 엔드포인트에 POST 요청을 보내면 됩니다.

<a name="authenticating-with-two-factor-authentication"></a>
### 이중 인증으로 인증하기

인증 과정에서 Fortify는 자동으로 사용자를 앱의 이중 인증 도전 화면(Challenge Screen)으로 리디렉션합니다. 만약 로그인 요청을 XHR 방식으로 보냈다면, 인증 성공 후 JSON 응답에 `two_factor`라는 불린값 프로퍼티가 포함되어 있습니다. 이 값을 활용해 두 번째 단계 인증화면으로 전환할지 결정할 수 있습니다.

이중 인증 기능 구현을 위해, Fortify가 이중 인증 도전 뷰를 반환하는 방법을 알려야 합니다. 모든 인증 뷰 렌더링 로직은 `Laravel\Fortify\Fortify` 클래스 메서드로 커스터마이징할 수 있습니다. 일반적으로 `App\Providers\FortifyServiceProvider` 클래스의 `boot` 메서드에서 정의합니다.

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

Fortify는 `/two-factor-challenge` 라우트를 자동으로 정의해서, 커스텀 뷰를 반환해줍니다. 이 `two-factor-challenge` 템플릿에는 `/two-factor-challenge` 엔드포인트로 POST 요청되는 폼이 필요하며, TOTP 토큰이 담긴 `code` 또는 리커버리 코드가 담긴 `recovery_code` 필드를 보내야 합니다.

로그인에 성공하면, Fortify는 `fortify` 설정 파일의 `home` 옵션에 설정된 URI로 리디렉션합니다. XHR 요청의 경우 204 HTTP 응답을 반환합니다.

인증 실패 시에는 다시 두 번째 인증 화면으로 돌아가며, 유효성 검증 에러는 `$errors` [Blade 템플릿 변수](/docs/11.x/validation#quick-displaying-the-validation-errors)로 노출됩니다. XHR 요청은 422 HTTP 응답과 함께 에러를 반환합니다.

<a name="disabling-two-factor-authentication"></a>
### 이중 인증 비활성화

이중 인증을 비활성화하려면 `/user/two-factor-authentication` 엔드포인트로 DELETE 요청을 보내면 됩니다. Fortify의 이중 인증 관련 엔드포인트 호출 전에는 [비밀번호 확인](#password-confirmation)이 요구됩니다.

<a name="registration"></a>
## 회원가입

회원가입 기능을 구현하려면, Fortify가 "회원가입" 뷰를 반환하는 방식을 알려주어야 합니다. Fortify는 UI가 없는 인증 라이브러리라는 점을 다시 한번 떠올리세요. 이미 완성된 인증 UI 구현이 필요하다면 [애플리케이션 스타터 키트](/docs/11.x/starter-kits)를 사용하는 것이 더 쉽습니다.

모든 인증 뷰 렌더링 로직은 `Laravel\Fortify\Fortify` 클래스의 메서드를 사용해 커스터마이징할 수 있습니다. 보통 `App\Providers\FortifyServiceProvider` 클래스의 `boot` 메서드에서 호출하게 됩니다.

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

Fortify는 `/register` 라우트를 자동으로 정의해 지정한 뷰를 반환합니다. `register` 템플릿에는 `/register` 엔드포인트로 POST 요청하는 폼이 필요합니다.

`/register` 엔드포인트는 문자열 타입의 `name`, email 또는 username, `password`, `password_confirmation` 필드를 기대합니다. email/username 필드의 이름은 설정 파일의 `username` 값과 일치해야 합니다.

회원가입에 성공하면, Fortify는 설정 파일에서 `home` 옵션으로 지정한 URL로 리디렉션하며, XHR 요청일 경우 201 HTTP 응답을 반환합니다.

회원가입 실패 시, 다시 회원가입 화면으로 돌아가며, 유효성 검증 에러는 Blade의 `$errors` 변수로, XHR 요청일 경우 422 HTTP 응답에 포함되어 반환됩니다.

<a name="customizing-registration"></a>
### 회원가입 커스터마이징

사용자 검증 및 생성 과정은 Fortify 설치 시 자동 생성되는 `App\Actions\Fortify\CreateNewUser` 액션 파일을 수정하여 커스터마이즈할 수 있습니다.

<a name="password-reset"></a>
## 비밀번호 재설정

<a name="requesting-a-password-reset-link"></a>
### 비밀번호 재설정 링크 요청

비밀번호 재설정 기능 구현을 시작하려면, Fortify가 "비밀번호 찾기(비밀번호 재설정 링크 요청)" 뷰를 반환하도록 알려주어야 합니다. Fortify는 프론트엔드가 없는 헤드리스 인증 라이브러리임을 유념하세요. 완성된 인증 UI가 필요하다면 [애플리케이션 스타터 키트](/docs/11.x/starter-kits)가 더 적합합니다.

모든 뷰 렌더링 방식은 `Laravel\Fortify\Fortify` 클래스의 메서드를 통해 원하는 대로 커스터마이징할 수 있습니다. 일반적으로 `App\Providers\FortifyServiceProvider` 클래스의 `boot` 메서드에서 호출합니다.

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

Fortify는 `/forgot-password` 엔드포인트를 자동 정의해 위 뷰를 반환합니다. `forgot-password` 템플릿에는 `/forgot-password` 엔드포인트로 POST 요청하는 폼이 필요합니다.

해당 엔드포인트는 문자열 타입의 `email` 필드를 요구하며, 필드/컬럼 이름은 애플리케이션의 `fortify` 설정 파일 내 `email` 값과 일치해야 합니다.

<a name="handling-the-password-reset-link-request-response"></a>
#### 비밀번호 재설정 링크 요청 응답 처리

비밀번호 재설정 링크 요청에 성공하면, 사용자는 `/forgot-password` 페이지로 다시 리디렉션되며, 동시에 비밀번호 재설정 링크가 포함된 이메일을 받게 됩니다. XHR 요청의 경우 200 HTTP 응답을 반환합니다.

성공 후 `/forgot-password`로 돌아왔을 때, 세션의 `status` 변수를 통해 요청 상태를 화면에 표시할 수 있습니다.

이 변수의 값은 애플리케이션의 `passwords` [언어 파일](/docs/11.x/localization)에 정의된 번역 문자열과 일치합니다. 이 값을 직접 커스터마이즈하려면, 라라벨 언어 파일을 퍼블리시(`lang:publish`)하면 됩니다.

```html
@if (session('status'))
    <div class="mb-4 font-medium text-sm text-green-600">
        {{ session('status') }}
    </div>
@endif
```

요청이 실패했다면, 비밀번호 재설정 링크 요청 화면으로 돌아가고 검증 에러는 Blade의 `$errors` 변수로 확인할 수 있습니다. XHR 요청은 422 HTTP 응답과 함께 에러를 반환합니다.

<a name="resetting-the-password"></a>
### 비밀번호 재설정

비밀번호 재설정 기능을 완성하려면, Fortify가 "비밀번호 재설정" 뷰를 반환하도록 지정해야 합니다.

모든 뷰 반환 로직은 `Laravel\Fortify\Fortify` 클래스를 통해 원하는 대로 커스터마이징할 수 있습니다. 보통 `App\Providers\FortifyServiceProvider`의 `boot` 메서드에서 설정합니다.

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

Fortify는 해당 뷰를 보여주는 라우트를 자동으로 정의합니다. `reset-password` 템플릿에는 `/reset-password` 라우트로 POST 요청하는 폼이 필요합니다.

`/reset-password` 엔드포인트는 문자열 타입의 `email` 필드, `password` 필드, `password_confirmation` 필드, 그리고 `request()->route('token')` 값을 담는 숨겨진 `token` 필드를 요구합니다. "email" 필드/컬럼 이름은 설정의 `email` 값과 일치해야 합니다.

<a name="handling-the-password-reset-response"></a>
#### 비밀번호 재설정 요청 응답 처리

비밀번호 재설정에 성공하면, Fortify는 `/login` 라우트로 리디렉션하여 사용자가 새 비밀번호로 로그인할 수 있게 해줍니다. 또한 세션에 `status` 값이 저장되어 있으므로, 로그인 화면에서 성공 메시지를 표시할 수 있습니다.

```blade
@if (session('status'))
    <div class="mb-4 font-medium text-sm text-green-600">
        {{ session('status') }}
    </div>
@endif
```

XHR 요청일 경우 200 HTTP 응답을 반환합니다.

실패 시에는 비밀번호 재설정 화면으로 돌아가고, 검증 에러는 Blade의 `$errors` 변수나 XHR 요청의 경우 422 HTTP 응답으로 반환됩니다.

<a name="customizing-password-resets"></a>
### 비밀번호 재설정 커스터마이징

비밀번호 재설정 과정은 Fortify 설치 시 생성된 `App\Actions\ResetUserPassword` 액션 파일을 수정하여 커스터마이즈할 수 있습니다.

<a name="email-verification"></a>
## 이메일 인증

회원가입 이후, 사용자가 본인 소유의 이메일 주소임을 인증하도록 하고 싶을 수 있습니다. 먼저, `fortify` 설정 파일의 `features` 배열에서 `emailVerification` 기능을 활성화하세요. 그리고 `App\Models\User` 클래스가 반드시 `Illuminate\Contracts\Auth\MustVerifyEmail` 인터페이스를 구현해야 합니다.

이 세팅을 마치면, 새로 가입한 사용자에게 이메일 인증을 유도하는 이메일이 발송됩니다. 이제 Fortify가 이메일 인증 화면을 어떻게 보여줄지 지정해야 합니다. 이 화면은 사용자가 인증 메일의 링크를 클릭해야 함을 안내하는 역할을 합니다.

모든 Fortify 뷰 반환 로직은 `Laravel\Fortify\Fortify` 클래스를 통해 커스터마이즈할 수 있습니다. 대개 `App\Providers\FortifyServiceProvider`의 `boot` 메서드에서 구현합니다.

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

Fortify는 `/email/verify` 엔드포인트에 연결되어, 사용자가 라라벨의 내장 `verified` 미들웨어 적용 라우트에 접근할 때 해당 뷰를 보여줍니다.

`verify-email` 템플릿에서는 이메일 인증 메일의 링크를 클릭해야 한다는 안내 메시지를 포함해야 합니다.

<a name="resending-email-verification-links"></a>
#### 이메일 인증 링크 재발송

원한다면, `verify-email` 템플릿에 `/email/verification-notification` 엔드포인트로 POST 요청하는 버튼을 추가할 수 있습니다. 이 엔드포인트는 새 인증 이메일을 전송하므로, 사용자가 인증 메일을 실수로 지웠거나 분실한 경우 적합합니다.

성공적으로 인증 메일이 재발송되면, Fortify는 `/email/verify`로 리디렉션하면서 세션의 `status` 변수를 통해 성공 메시지 표시가 가능하게 합니다. XHR 요청의 경우 202 HTTP 응답을 반환합니다.

```blade
@if (session('status') == 'verification-link-sent')
    <div class="mb-4 font-medium text-sm text-green-600">
        A new email verification link has been emailed to you!
    </div>
@endif
```

<a name="protecting-routes"></a>
### 라우트 보호하기

특정 라우트(또는 라우트 그룹)는 반드시 사용자 이메일이 인증된 경우에만 접근 가능하도록 만들 수 있습니다. 이럴 때는 라라벨 내장 `verified` 미들웨어를 해당 라우트에 적용하면 됩니다. `verified` 미들웨어 별칭은 라라벨이 자동으로 등록해 주며, 실제로는 `Illuminate\Auth\Middleware\EnsureEmailIsVerified` 미들웨어의 별칭입니다.

```php
Route::get('/dashboard', function () {
    // ...
})->middleware(['verified']);
```

<a name="password-confirmation"></a>
## 비밀번호 확인

애플리케이션에서 사용자가 중요한 작업을 하기 전에 비밀번호 확인을 요구하고 싶을 때가 있습니다. 보통, 이런 라우트에는 라라벨 내장 `password.confirm` 미들웨어를 사용합니다.

이 기능 구현을 위해서는 Fortify가 "비밀번호 확인" 화면 뷰를 반환하도록 지정해야 합니다. Fortify는 UI가 없는 인증 라이브러리라는 점을 다시 기억하세요. 완성된 인증 UI 구현을 원한다면 [애플리케이션 스타터 키트](/docs/11.x/starter-kits)를 사용해도 좋습니다.

모든 뷰 렌더링 로직은 `Laravel\Fortify\Fortify` 클래스를 통해 직접 커스터마이즈할 수 있습니다. 일반적으로 `App\Providers\FortifyServiceProvider`의 `boot` 메서드에서 호출합니다.

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

Fortify는 `/user/confirm-password` 엔드포인트를 정의해 해당 뷰를 반환하게 만듭니다. `confirm-password` 템플릿에는 `/user/confirm-password` 엔드포인트로 POST 요청하는 폼이 필요하며, 사용자의 현재 비밀번호를 담은 `password` 필드를 전송해야 합니다.

입력한 비밀번호가 현재 비밀번호와 일치하면, Fortify는 사용자가 원래 접근하려 했던 라우트로 리디렉션합니다. XHR 요청일 경우 201 HTTP 응답을 반환합니다.

비밀번호가 일치하지 않을 경우, 다시 비밀번호 확인 화면으로 돌아가고 검증 에러는 Blade의 `$errors` 변수 또는 XHR 요청의 경우 422 HTTP 응답으로 전달됩니다.
