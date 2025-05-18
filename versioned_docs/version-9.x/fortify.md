# 라라벨 포티파이 (Laravel Fortify)

- [소개](#introduction)
    - [포티파이란?](#what-is-fortify)
    - [포티파이를 언제 사용해야 할까요?](#when-should-i-use-fortify)
- [설치](#installation)
    - [포티파이 서비스 프로바이더](#the-fortify-service-provider)
    - [포티파이 기능](#fortify-features)
    - [뷰 비활성화](#disabling-views)
- [인증](#authentication)
    - [사용자 인증 커스터마이징](#customizing-user-authentication)
    - [인증 파이프라인 커스터마이징](#customizing-the-authentication-pipeline)
    - [리다이렉트 커스터마이징](#customizing-authentication-redirects)
- [2단계 인증](#two-factor-authentication)
    - [2단계 인증 활성화](#enabling-two-factor-authentication)
    - [2단계 인증으로 인증하기](#authenticating-with-two-factor-authentication)
    - [2단계 인증 비활성화](#disabling-two-factor-authentication)
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

[Laravel Fortify](https://github.com/laravel/fortify)는 라라벨을 위한 프런트엔드에 독립적인 인증 백엔드 구현체입니다. Fortify는 로그인, 회원가입, 비밀번호 재설정, 이메일 인증 등 라라벨의 모든 인증 기능을 구현하는 데 필요한 라우트와 컨트롤러를 등록합니다. Fortify를 설치한 후, `route:list` 아티즌 명령어를 실행하면 등록된 Fortify 라우트 목록을 확인할 수 있습니다.

Fortify는 자체적인 사용자 인터페이스(UI)를 제공하지 않으므로, 여러분이 직접 만든 UI와 짝지어 사용해야 합니다. 여러분은 이 UI를 통해 Fortify가 등록한 라우트로 요청을 보내게 됩니다. 이 문서의 뒷부분에서 이러한 라우트에 요청하는 방법을 자세히 다룹니다.

> [!NOTE]
> Fortify는 라라벨의 인증 기능 구현을 빠르게 시작할 수 있도록 도와주는 패키지입니다. **꼭 사용해야 하는 것은 아닙니다.** 언제든 [인증](/docs/9.x/authentication), [비밀번호 재설정](/docs/9.x/passwords), [이메일 인증](/docs/9.x/verification) 문서를 참고하여 라라벨의 인증 서비스를 직접 사용할 수 있습니다.

<a name="what-is-fortify"></a>
### 포티파이란?

앞서 언급했듯이, Laravel Fortify는 라라벨을 위한 프런트엔드에 독립적인 인증 백엔드 구현체입니다. Fortify는 로그인, 회원가입, 비밀번호 재설정, 이메일 인증 등 라라벨의 모든 인증 기능을 구현하는 데 필요한 라우트와 컨트롤러를 등록합니다.

**Laravel의 인증 기능을 사용하려면 반드시 Fortify를 써야 하는 것은 아닙니다.** 언제든 [인증](/docs/9.x/authentication), [비밀번호 재설정](/docs/9.x/passwords), [이메일 인증](/docs/9.x/verification) 등의 공식 문서를 참고하여 라라벨의 인증 서비스를 직접 구현할 수 있습니다.

라라벨을 처음 접하신 분이라면 Fortify를 사용하기 전에 [Laravel Breeze](/docs/9.x/starter-kits) 스타터 킷을 먼저 살펴보시길 추천합니다. Laravel Breeze는 인증에 관련된 UI와 기능(예: [Tailwind CSS](https://tailwindcss.com) 기반)을 애플리케이션에 손쉽게 추가하는 인증 스캐폴딩을 제공합니다. Breeze는 Fortify와 달리 라우트와 컨트롤러를 여러분 프로젝트 코드로 직접 복사해주기 때문에, 라라벨 인증 시스템의 구조와 역할을 직접 확인하고 익힐 수 있습니다.

Fortify는 개념적으로 Breeze가 제공하던 라우트와 컨트롤러를 하나의 패키지로 구현한 것입니다. 대신 UI는 포함하지 않으므로, 여러분이 원하는 프런트엔드와 결합하여 인증 백엔드 구현을 빠르고 독립적으로 만들 수 있게 도와줍니다.

<a name="when-should-i-use-fortify"></a>
### 포티파이를 언제 사용해야 할까요?

언제 Laravel Fortify를 사용하는 것이 적합한지 궁금할 수 있습니다. 먼저, 라라벨의 [애플리케이션 스타터 킷](/docs/9.x/starter-kits)을 사용하고 있다면 별도로 Fortify를 설치할 필요가 없습니다. 모든 스타터 킷에는 이미 완전한 인증 기능이 포함되어 있습니다.

스타터 킷을 사용하지 않고 인증 기능이 필요한 경우, 두 가지 방법이 있습니다. 첫째, 인증 기능을 직접 구현하거나, 둘째, Fortify를 설치하여 백엔드 인증 구현을 맡길 수 있습니다.

Fortify를 설치하면, 여러분의 프런트엔드 UI는 이 문서에서 설명하는 Fortify의 인증 라우트로 요청을 보내 로그인, 회원가입과 같은 기능을 사용할 수 있습니다.

직접 인증 기능을 구현하고 싶다면, [인증](/docs/9.x/authentication), [비밀번호 재설정](/docs/9.x/passwords), [이메일 인증](/docs/9.x/verification) 공식 문서를 참고하여 직접 인터랙션할 수 있습니다.

<a name="laravel-fortify-and-laravel-sanctum"></a>
#### Laravel Fortify & Laravel Sanctum

일부 개발자들은 [Laravel Sanctum](/docs/9.x/sanctum)과 Laravel Fortify의 차이점에 혼란을 느끼기도 합니다. 이 두 패키지는 서로 다른(하지만 관련된) 문제를 해결하므로, Fortify와 Sanctum은 상호 배타적이거나 경쟁 관계가 아닙니다.

Sanctum은 API 토큰 관리 및 이미 존재하는 사용자를 세션 쿠키나 토큰으로 인증하는 것에 집중합니다. 사용자의 회원가입, 비밀번호 재설정과 같은 기능을 위한 라우트를 제공하지는 않습니다.

만약 여러분이 API를 제공하거나 싱글 페이지 애플리케이션(SPA)의 백엔드를 직접 구축하고 있다면, 실제로 사용자 등록과 비밀번호 재설정을 위해 Laravel Fortify를, API 토큰 관리 및 인증을 위해 Laravel Sanctum을 함께 활용할 수 있습니다.

<a name="installation"></a>
## 설치

먼저, Composer 패키지 매니저를 사용하여 Fortify를 설치합니다.

```shell
composer require laravel/fortify
```

이후 `vendor:publish` 명령어로 Fortify의 리소스를 퍼블리시합니다.

```shell
php artisan vendor:publish --provider="Laravel\Fortify\FortifyServiceProvider"
```

이 명령을 실행하면 Fortify의 액션 파일들이 `app/Actions` 디렉터리에 생성됩니다(해당 폴더가 없다면 새로 만들어집니다). 또한, `FortifyServiceProvider`, 설정 파일, 데이터베이스 마이그레이션 파일도 함께 퍼블리시됩니다.

그 다음, 데이터베이스 마이그레이션을 실행해야 합니다.

```shell
php artisan migrate
```

<a name="the-fortify-service-provider"></a>
### 포티파이 서비스 프로바이더

위에서 설명한 `vendor:publish` 명령어는 `App\Providers\FortifyServiceProvider` 클래스도 함께 퍼블리시합니다. 이 클래스가 `config/app.php` 설정 파일의 `providers` 배열에 등록되어 있는지 반드시 확인해야 합니다.

Fortify 서비스 프로바이더는 퍼블리시된 액션들을 등록하며, Fortify가 각 기능 수행 시 이 액션들을 사용하도록 지정합니다.

<a name="fortify-features"></a>
### 포티파이 기능

`fortify` 설정 파일의 `features` 배열에서 Fortify가 제공할 백엔드 라우트와 기능을 지정할 수 있습니다. Fortify를 [Laravel Jetstream](https://jetstream.laravel.com)과 함께 사용하지 않는다면, 기본적인 인증 기능만 활성화할 것을 권장합니다. 예시는 다음과 같습니다.

```php
'features' => [
    Features::registration(),
    Features::resetPasswords(),
    Features::emailVerification(),
],
```

<a name="disabling-views"></a>
### 뷰 비활성화

Fortify는 기본적으로 로그인 화면, 회원가입 화면 등 뷰를 반환하는 라우트도 정의합니다. 하지만 자바스크립트로 구동되는 싱글페이지 애플리케이션(SPA)이라면 이런 뷰 라우트가 필요 없을 수 있습니다. 이럴 경우, 애플리케이션의 `config/fortify.php` 설정 파일에서 `views` 값을 `false`로 설정하면 해당 라우트들을 완전히 비활성화할 수 있습니다.

```php
'views' => false,
```

<a name="disabling-views-and-password-reset"></a>
#### 뷰 및 비밀번호 재설정 비활성화

Fortify의 뷰를 비활성화하더라도 비밀번호 재설정 기능을 구현한다면 `password.reset` 이름을 가진 라우트를 반드시 정의해야 합니다. 이는 Laravel의 `Illuminate\Auth\Notifications\ResetPassword` 알림이 `password.reset` 라우트를 이용해 비밀번호 재설정 URL을 생성하기 때문입니다.

<a name="authentication"></a>
## 인증

먼저 Fortify가 "로그인" 뷰를 반환하는 방법을 지정해야 합니다. 다시 말하지만, Fortify는 별도의 UI를 제공하지 않는 헤드리스 인증 라이브러리입니다. 인증 페이지 등 라라벨의 프런트엔드까지 완성된 인증 구현을 원한다면 [애플리케이션 스타터 킷](/docs/9.x/starter-kits)을 활용하는 것이 좋습니다.

모든 인증 뷰 렌더링 로직은 `Laravel\Fortify\Fortify` 클래스의 메서드를 활용해 커스터마이즈할 수 있습니다. 일반적으로 이 메서드는 `App\Providers\FortifyServiceProvider` 클래스의 `boot` 메서드 안에서 호출합니다. Fortify는 `/login` 라우트를 직접 정의하여 해당 뷰를 반환합니다.

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

로그인 템플릿에는 `/login`으로 POST 요청을 전송하는 폼(form)이 포함되어야 합니다. `/login` 엔드포인트는 문자열 `email` 또는 `username`과 `password`를 요구합니다. 이때 필드명은 `config/fortify.php` 설정의 `username` 값과 일치해야 합니다. 또, "나를 기억하기" 기능을 위해 불리언 `remember` 필드를 사용할 수도 있습니다.

로그인에 성공하면, Fortify는 애플리케이션의 `fortify` 설정 파일에 정의된 `home` 구성값의 URI로 리다이렉트합니다. 로그인 요청이 XHR(비동기) 요청이라면 200 HTTP 응답을 반환합니다.

로그인에 실패하면 사용자는 로그인 화면으로 다시 이동하고, 유효성 검사 에러 내역은 공유된 `$errors` [Blade 템플릿 변수](/docs/9.x/validation#quick-displaying-the-validation-errors)로 접근할 수 있습니다. XHR 요청이라면 422 HTTP 응답과 함께 에러가 반환됩니다.

<a name="customizing-user-authentication"></a>
### 사용자 인증 커스터마이징

Fortify는 제공된 자격 증명과 여러분이 설정한 인증 가드를 기반으로 자동으로 사용자를 조회하고 인증합니다. 그러나, 로그인 자격 증명 확인 및 사용자 조회 로직을 세밀하게 제어하고 싶을 때는 `Fortify::authenticateUsing` 메서드를 사용할 수 있습니다.

이 메서드는 HTTP 요청을 인수로 받아들이는 클로저를 받으며, 이 클로저는 요청에 포함된 로그인 정보를 직접 검증하고, 성공 시 해당 사용자 인스턴스를 리턴해야 합니다. 검증에 실패하거나 사용자를 찾을 수 없는 경우에는 `null` 또는 `false`를 반환합니다. 일반적으로 이 메서드는 `FortifyServiceProvider`의 `boot` 메서드에서 호출합니다.

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

Fortify에서 사용할 인증 가드는 `fortify` 설정 파일에서 커스터마이징할 수 있습니다. 단, 설정한 가드가 `Illuminate\Contracts\Auth\StatefulGuard`를 구현하고 있어야 합니다. 만약 SPA에서 Fortify로 인증을 처리하려면 라라벨의 기본 `web` 가드와 [Laravel Sanctum](https://laravel.com/docs/sanctum)을 함께 사용하는 것이 일반적입니다.

<a name="customizing-the-authentication-pipeline"></a>
### 인증 파이프라인 커스터마이징

Laravel Fortify는 로그인 요청을 일련의 호출형 클래스(Invokable Class) 파이프라인을 거쳐 인증합니다. 이 파이프라인을 여러분의 필요에 맞게 커스터마이징할 수도 있습니다. 각 클래스는 요청(`Illuminate\Http\Request`) 인스턴스를 받고, [미들웨어](/docs/9.x/middleware)와 마찬가지로 `$next` 변수를 활용해 다음 클래스로 처리를 넘깁니다.

커스텀 파이프라인을 정의하려면 `Fortify::authenticateThrough` 메서드를 사용합니다. 이 메서드는 로그인 요청을 거칠 클래스 배열을 반환하는 클로저를 인수로 받습니다. 일반적으로 `App\Providers\FortifyServiceProvider` 클래스의 `boot` 메서드에서 호출합니다.

아래는 Fortify의 기본 인증 파이프라인을 예시로 보여줍니다. 이를 시작점으로 커스터마이징 할 수 있습니다.

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
### 리다이렉트 커스터마이징

로그인에 성공하면 Fortify는 애플리케이션의 `fortify` 설정 파일에서 `home` 옵션에 지정한 URI로 리다이렉트합니다. 로그인 요청이 XHR(비동기) 요청인 경우 200 HTTP 응답을 반환합니다. 사용자가 로그아웃하면 기본적으로 `/` URI로 리다이렉트됩니다.

이 동작을 더 세밀하게 제어하고 싶다면 `LoginResponse` 및 `LogoutResponse` 계약(Contract)의 구현체를 라라벨의 [서비스 컨테이너](/docs/9.x/container)에 바인딩할 수 있습니다. 보통은 `App\Providers\FortifyServiceProvider` 클래스의 `register` 메서드에서 처리합니다.

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
## 2단계 인증

Fortify의 2단계 인증 기능을 활성화하면 사용자는 인증 과정에서 여섯 자리 숫자의 토큰 입력을 요구받게 됩니다. 이 토큰은 시간 기반 일회용 비밀번호(TOTP)로 생성되며, Google Authenticator와 같은 TOTP 호환 모바일 인증 앱에서 확인할 수 있습니다.

먼저, 여러분의 `App\Models\User` 모델에 `Laravel\Fortify\TwoFactorAuthenticatable` 트레이트가 포함되어 있는지 확인합니다.

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

그 다음, 사용자들이 2단계 인증 설정을 관리할 수 있는 화면을 구성해야 합니다. 이 화면에서는 2단계 인증의 활성화/비활성화와 복구 코드 재생성이 가능해야 합니다.

> 기본적으로, `fortify` 설정 파일의 `features` 배열은 2단계 인증 설정 변경 전 비밀번호 확인이 필요하도록 지시합니다. 따라서, 먼저 Fortify의 [비밀번호 확인](#password-confirmation) 기능을 구현해두어야 합니다.

<a name="enabling-two-factor-authentication"></a>
### 2단계 인증 활성화

2단계 인증을 활성화하려면, 애플리케이션에서 Fortify가 제공하는 `/user/two-factor-authentication` 엔드포인트로 POST 요청을 전송해야 합니다. 요청이 성공하면 사용자는 이전 페이지로 리다이렉트되고, 세션 변수 `status`가 `two-factor-authentication-enabled`로 설정됩니다. 이 세션 변수를 통해 템플릿에서 성공 메시지를 노출할 수 있습니다. XHR 요청인 경우, 200 HTTP 응답이 반환됩니다.

2단계 인증을 활성화한 뒤에는, 반드시 인증 코드 입력을 통해 2단계 인증 구성을 "확인(컨펌)"해야 합니다. 따라서 성공 메시지에는 사용자에게 2단계 인증 확인 절차가 아직 남아 있다는 안내를 표시해야 합니다.

```html
@if (session('status') == 'two-factor-authentication-enabled')
    <div class="mb-4 font-medium text-sm">
        Please finish configuring two factor authentication below.
    </div>
@endif
```

그리고 인증 앱에서 사용할 2단계 인증 QR 코드를 사용자에게 보여줘야 합니다. Blade를 사용하는 경우, 사용자 인스턴스의 `twoFactorQrCodeSvg` 메서드로 QR 코드 SVG를 가져올 수 있습니다.

```php
$request->user()->twoFactorQrCodeSvg();
```

자바스크립트 기반 프런트엔드의 경우, `/user/two-factor-qr-code` 엔드포인트에 XHR GET 요청을 보내면 `svg` 키를 가진 JSON 객체로 QR 코드를 받을 수 있습니다.

<a name="confirming-two-factor-authentication"></a>
#### 2단계 인증 확인(컨펌)

사용자의 2단계 인증 QR 코드를 보여줄 뿐만 아니라, 인증 코드 입력란도 제공해야 합니다. 사용자는 이 입력란에 올바른 인증 코드를 입력해 인증 구성을 "확인"해야 합니다. 코드는 Fortify에서 제공하는 `/user/confirmed-two-factor-authentication` 엔드포인트로 POST 요청을 보내 전달해야 합니다.

요청이 성공하면, 이전 페이지로 리다이렉트되고 세션 변수 `status`에 `two-factor-authentication-confirmed`가 들어갑니다.

```html
@if (session('status') == 'two-factor-authentication-confirmed')
    <div class="mb-4 font-medium text-sm">
        Two factor authentication confirmed and enabled successfully.
    </div>
@endif
```

만약 XHR 요청이었다면 200 HTTP 응답을 받게 됩니다.

<a name="displaying-the-recovery-codes"></a>
#### 복구 코드 표시

사용자의 2단계 인증 복구 코드(recovery codes)도 보여주어야 합니다. 복구 코드는 사용자가 모바일 기기를 분실했을 때 인증을 받을 수 있는 대체 수단입니다. Blade 템플릿에서는 인증된 사용자 인스턴스를 통해 복구 코드 배열에 접근할 수 있습니다.

```php
(array) $request->user()->recoveryCodes()
```

자바스크립트 프런트엔드라면 `/user/two-factor-recovery-codes` 엔드포인트에 XHR GET 요청을 보내면 복구 코드 배열을 얻을 수 있습니다.

복구 코드를 새로 고치려면, `/user/two-factor-recovery-codes` 엔드포인트로 POST 요청을 보내면 됩니다.

<a name="authenticating-with-two-factor-authentication"></a>
### 2단계 인증으로 인증하기

인증 과정에서 Fortify는 자동으로 사용자에게 2단계 인증 입력 화면으로 리다이렉트합니다. 하지만 애플리케이션이 XHR 로그인을 수행하는 경우, 인증 성공 시 반환되는 JSON 응답에는 `two_factor`라는 불리언 프로퍼티가 포함됩니다. 이 값을 확인해 2단계 인증 화면으로 리다이렉트해야 하는지 판단할 수 있습니다.

2단계 인증 기능 구현을 시작하려면, Fortify가 2단계 인증 챌린지 뷰를 반환하는 방식을 지정해야 합니다. 모든 인증 뷰 렌더링 로직은 `Laravel\Fortify\Fortify`의 메서드를 통해 쉽게 커스터마이즈할 수 있습니다. 일반적으로 `App\Providers\FortifyServiceProvider` 클래스의 `boot` 메서드 안에서 설정합니다.

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

Fortify는 `/two-factor-challenge` 라우트를 직접 정의하며, 해당 라우트를 이용해 뷰를 반환합니다. `two-factor-challenge` 템플릿에는 `/two-factor-challenge`로 POST 요청을 전송하는 폼이 있어야 하며, 이때 `code` 필드(유효한 TOTP 토큰)나 `recovery_code` 필드(사용자의 복구 코드 중 하나)를 전송해야 합니다.

인증 성공 시, Fortify는 `fortify` 설정 파일의 `home` 옵션에 지정한 URI로 리다이렉트합니다. XHR 로그인 요청이라면 204 HTTP 응답이 반환됩니다.

실패 시, 사용자는 2단계 인증 화면으로 돌아가고, 유효성 검사 에러 내역은 `$errors` [Blade 템플릿 변수](/docs/9.x/validation#quick-displaying-the-validation-errors)로 접근할 수 있습니다. XHR 요청의 경우 422 HTTP 응답과 함께 반환됩니다.

<a name="disabling-two-factor-authentication"></a>
### 2단계 인증 비활성화

2단계 인증을 비활성화하려면, `/user/two-factor-authentication` 엔드포인트로 DELETE 요청을 전송하면 됩니다. Fortify의 2단계 인증 관련 엔드포인트는 호출 전에 반드시 [비밀번호 확인](#password-confirmation)이 필요합니다.

<a name="registration"></a>
## 회원가입

회원가입 기능 구현을 시작하려면, Fortify가 "회원가입" 뷰를 반환하는 방법을 지정해야 합니다. Fortify는 별도의 UI를 제공하지 않는 라이브러리임을 잊지 마세요. 이미 완성된 인증 프런트엔드가 필요하다면 [애플리케이션 스타터 킷](/docs/9.x/starter-kits)을 활용하세요.

모든 뷰 렌더링 로직은 `Laravel\Fortify\Fortify` 클래스의 적절한 메서드로 커스터마이즈할 수 있습니다. 일반적으로 `App\Providers\FortifyServiceProvider`의 `boot` 메서드에서 호출합니다.

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

Fortify가 `/register` 라우트를 정의하여 회원가입 화면을 반환합니다. 회원가입 템플릿에는 `/register`로 POST 요청을 보내는 폼이 포함되어야 합니다.

`/register` 엔드포인트는 문자열 `name`, 문자열 이메일/아이디, `password`, `password_confirmation` 필드를 요구합니다. 이메일/아이디 필드명은 반드시 `fortify` 설정 파일의 `username` 값과 일치해야 합니다.

가입이 성공하면 사용자는 `fortify` 설정 파일의 `home` 옵션에 지정한 URI로 리다이렉트됩니다. XHR 요청의 경우 201 HTTP 응답이 반환됩니다.

요청이 실패하면, 회원가입 화면으로 돌아가며 유효성 검사 에러는 `$errors` [Blade 템플릿 변수](/docs/9.x/validation#quick-displaying-the-validation-errors)로 확인할 수 있습니다. XHR 요청이라면 422 HTTP 응답으로 반환됩니다.

<a name="customizing-registration"></a>
### 회원가입 커스터마이징

사용자 검증 및 생성 과정은 Fortify 설치 시 생성된 `App\Actions\Fortify\CreateNewUser` 액션을 수정하여 커스터마이즈할 수 있습니다.

<a name="password-reset"></a>
## 비밀번호 재설정

<a name="requesting-a-password-reset-link"></a>
### 비밀번호 재설정 링크 요청

비밀번호 재설정 기능 구현을 시작하려면 Fortify가 "비밀번호 찾기" 뷰를 반환하는 방법을 지정해야 합니다. Fortify는 프런트엔드 UI를 제공하지 않습니다. 프런트엔드까지 완성된 인증 기능이 필요하다면 [애플리케이션 스타터 킷](/docs/9.x/starter-kits)을 활용하세요.

모든 뷰 렌더링 로직은 `Laravel\Fortify\Fortify` 클래스에서 적절한 메서드를 등록해 커스터마이즈할 수 있습니다. 일반적으로는 `App\Providers\FortifyServiceProvider`의 `boot` 메서드에서 호출합니다.

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

Fortify는 `/forgot-password` 엔드포인트를 정의하여 뷰를 반환합니다. `forgot-password` 템플릿에는 `/forgot-password`로 POST 요청을 보내는 폼이 있어야 합니다.

`/forgot-password` 엔드포인트는 문자열 `email` 필드를 요구합니다. 필드명/DB 컬럼명은 반드시 `fortify` 설정 파일의 `email` 값과 일치해야 합니다.

<a name="handling-the-password-reset-link-request-response"></a>
#### 비밀번호 재설정 링크 요청 결과 처리

비밀번호 재설정 링크 요청에 성공하면 사용자는 `/forgot-password` 엔드포인트로 리다이렉트되고, 사용자에게 보안 링크가 포함된 이메일이 발송됩니다. XHR 요청인 경우 200 HTTP 응답이 반환됩니다.

재설정 요청 성공 후 `/forgot-password`로 리다이렉트되었을 때, 세션 변수 `status`로 결과 메시지를 템플릿에서 노출할 수 있습니다. 해당 값은 애플리케이션의 `passwords` [언어 파일](/docs/9.x/localization)에 정의된 번역 문자열과 일치합니다.

```html
@if (session('status'))
    <div class="mb-4 font-medium text-sm text-green-600">
        {{ session('status') }}
    </div>
@endif
```

요청이 실패할 경우, 비밀번호 재설정 요청 화면으로 돌아가며 유효성 검사 에러는 `$errors` [Blade 템플릿 변수](/docs/9.x/validation#quick-displaying-the-validation-errors)로 확인할 수 있습니다. XHR 요청이면 422 HTTP 응답이 반환됩니다.

<a name="resetting-the-password"></a>
### 비밀번호 재설정

비밀번호 재설정 기능을 마무리하려면 "비밀번호 재설정" 뷰를 반환하는 방법을 지정해야 합니다.

모든 뷰 렌더링 로직은 `Laravel\Fortify\Fortify` 클래스의 메서드로 커스터마이즈할 수 있습니다. 보통은 `App\Providers\FortifyServiceProvider`의 `boot` 메서드에서 호출합니다.

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

Fortify가 자동으로 라우트를 정의하여 이 뷰를 보여줍니다. `reset-password` 템플릿에는 `/reset-password`로 POST 요청을 보내는 폼이 있어야 합니다.

`/reset-password` 엔드포인트는 문자열 `email` 필드, `password`, `password_confirmation`, 그리고 `request()->route('token')` 값을 담은 숨겨진 `token` 필드를 요구합니다. "email" 필드명/DB 컬럼명은 반드시 `fortify` 설정 파일의 `email` 값과 일치해야 합니다.

<a name="handling-the-password-reset-response"></a>
#### 비밀번호 재설정 결과 처리

재설정이 성공하면 Fortify는 `/login` 라우트로 리다이렉트하여 사용자가 새 비밀번호로 로그인할 수 있게 합니다. 추가로 `status` 세션 변수를 설정하므로 로그인 화면에서 성공 메시지를 표시할 수 있습니다.

```blade
@if (session('status'))
    <div class="mb-4 font-medium text-sm text-green-600">
        {{ session('status') }}
    </div>
@endif
```

XHR 요청이면 200 HTTP 응답이 반환됩니다.

실패 시, 사용자는 비밀번호 재설정 화면으로 다시 이동하며, 유효성 검사 에러는 `$errors` [Blade 템플릿 변수](/docs/9.x/validation#quick-displaying-the-validation-errors)로 확인할 수 있습니다. XHR 요청이면 422 HTTP 응답이 반환됩니다.

<a name="customizing-password-resets"></a>
### 비밀번호 재설정 커스터마이징

비밀번호 재설정 과정은 Fortify 설치 시 생성된 `App\Actions\ResetUserPassword` 액션을 수정하여 원하는 대로 커스터마이즈할 수 있습니다.

<a name="email-verification"></a>
## 이메일 인증

회원가입 후 사용자가 애플리케이션을 계속 이용하기 전 이메일 인증을 요구하고 싶을 때가 있습니다. 이를 위해서는 먼저 `fortify` 설정 파일의 `features` 배열에서 `emailVerification` 기능이 활성화되어 있어야 하며, `App\Models\User` 클래스가 `Illuminate\Contracts\Auth\MustVerifyEmail` 인터페이스를 구현하고 있어야 합니다.

이 두 가지가 완료되면, 새로 가입한 사용자에게 이메일 소유권 인증을 위한 이메일이 자동 발송됩니다. 하지만, 인증 링크 클릭을 안내하는 별도의 이메일 인증 화면도 Fortify에 알려야 합니다.

모든 Fortify 뷰 렌더링 로직은 `Laravel\Fortify\Fortify`의 관련 메서드로 쉽게 커스터마이즈할 수 있습니다. 대체로 `App\Providers\FortifyServiceProvider`의 `boot` 메서드에서 처리합니다.

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

Fortify는 사용자가 내장된 `verified` 미들웨어에 의해 `/email/verify`로 리다이렉트될 때 해당 뷰를 표시하는 라우트를 직접 정의합니다.

`verify-email` 템플릿에는 이메일로 전송된 인증 링크 클릭을 안내하는 메시지를 포함해야 합니다.

<a name="resending-email-verification-links"></a>
#### 이메일 인증 링크 재전송

원한다면, `verify-email` 템플릿에 `/email/verification-notification` 엔드포인트로 POST 요청을 보내는 버튼을 추가할 수 있습니다. 이 요청이 처리되면 사용자에게 새로운 이메일 인증 링크가 발송됩니다. 이전 링크를 잃어버렸거나 삭제한 경우에도 인증 절차를 이어갈 수 있습니다.

이메일 인증 링크 재전송이 성공하면 Fortify는 `/email/verify` 엔드포인트로 리다이렉트하며, 세션 변수 `status`를 통해 성공 메시지를 표시할 수 있게 합니다. XHR 요청일 경우 202 HTTP 응답이 반환됩니다.

```blade
@if (session('status') == 'verification-link-sent')
    <div class="mb-4 font-medium text-sm text-green-600">
        A new email verification link has been emailed to you!
    </div>
@endif
```

<a name="protecting-routes"></a>
### 라우트 보호하기

특정 라우트 또는 라우트 그룹에서 사용자가 이메일 인증을 마쳤는지 확인하려면 라라벨의 내장 `verified` 미들웨어를 붙이면 됩니다. 이 미들웨어는 애플리케이션의 `App\Http\Kernel` 클래스에 이미 등록되어 있습니다.

```php
Route::get('/dashboard', function () {
    // ...
})->middleware(['verified']);
```

<a name="password-confirmation"></a>
## 비밀번호 확인

애플리케이션을 개발하다 보면, 특정 중요한 작업 전에는 반드시 사용자의 비밀번호 확인을 요구하고 싶을 때가 있습니다. 이러한 라우트에는 라라벨의 내장 `password.confirm` 미들웨어를 사용할 수 있습니다.

비밀번호 확인 기능을 구현하려면, Fortify가 "비밀번호 확인" 뷰를 반환하는 방법을 지정해야 합니다. Fortify는 별도의 UI를 제공하지 않으며, 프런트엔드까지 완성된 인증 구현이 필요하다면 [애플리케이션 스타터 킷](/docs/9.x/starter-kits)을 활용하세요.

모든 뷰 렌더링 로직은 `Laravel\Fortify\Fortify` 클래스의 적절한 메서드를 통해 커스터마이즈할 수 있습니다. 일반적으로는 `App\Providers\FortifyServiceProvider`의 `boot` 메서드에서 처리합니다.

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

Fortify는 `/user/confirm-password` 엔드포인트를 정의하여 이 뷰를 반환합니다. `confirm-password` 템플릿에는 `/user/confirm-password`로 POST 요청을 보낼 수 있는 폼이 있어야 하며, 이때 `password` 필드에 현재 사용자의 비밀번호를 입력해야 합니다.

비밀번호 일치 시, Fortify는 사용자가 원래 접근하려던 라우트로 리다이렉트합니다. XHR 요청의 경우 201 HTTP 응답을 반환합니다.

실패 시에는 비밀번호 확인 화면으로 돌아가며, 유효성 검사 에러는 Blade의 `$errors` 템플릿 변수로 접근하거나, XHR 요청이면 422 HTTP 응답으로 반환됩니다.
