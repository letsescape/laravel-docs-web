# 비밀번호 재설정 (Resetting Passwords)

- [소개](#introduction)
    - [모델 준비](#model-preparation)
    - [데이터베이스 준비](#database-preparation)
    - [신뢰할 수 있는 호스트 설정](#configuring-trusted-hosts)
- [라우팅](#routing)
    - [비밀번호 재설정 링크 요청하기](#requesting-the-password-reset-link)
    - [비밀번호 재설정하기](#resetting-the-password)
- [만료된 토큰 삭제하기](#deleting-expired-tokens)
- [커스터마이징](#password-customization)

<a name="introduction"></a>
## 소개

대부분의 웹 애플리케이션에서는 사용자가 잊어버린 비밀번호를 재설정할 수 있는 방법을 제공합니다. 매번 직접 이 기능을 다시 구현하는 번거로움을 덜어주기 위해, 라라벨은 비밀번호 재설정 링크 전송 및 안전한 비밀번호 재설정 기능을 편리하게 제공합니다.

> [!NOTE]
> 빠르게 시작하고 싶으신가요? 새로운 라라벨 애플리케이션에 [애플리케이션 스타터 키트](/docs/12.x/starter-kits)를 설치해보세요. 라라벨의 스타터 키트는 비밀번호 재설정 기능을 포함한 전체 인증 시스템을 자동으로 구성해줍니다.

<a name="model-preparation"></a>
### 모델 준비

라라벨의 비밀번호 재설정 기능을 사용하려면, 애플리케이션의 `App\Models\User` 모델에 `Illuminate\Notifications\Notifiable` 트레이트가 반드시 포함되어 있어야 합니다. 일반적으로, 이 트레이트는 신규 라라벨 애플리케이션에서 생성되는 기본 `App\Models\User` 모델에 이미 포함되어 있습니다.

다음으로, `App\Models\User` 모델이 `Illuminate\Contracts\Auth\CanResetPassword` 인터페이스를 구현하고 있는지 확인해야 합니다. 프레임워크에 기본 포함된 `App\Models\User` 모델은 이미 이 인터페이스를 구현하고 있으며, `Illuminate\Auth\Passwords\CanResetPassword` 트레이트를 사용하여 해당 인터페이스를 구현하는 데 필요한 메서드들을 추가합니다.

<a name="database-preparation"></a>
### 데이터베이스 준비

애플리케이션의 비밀번호 재설정 토큰을 저장하기 위한 테이블이 필요합니다. 이 테이블은 일반적으로 라라벨의 기본 마이그레이션 파일인 `0001_01_01_000000_create_users_table.php`에 포함되어 있습니다.

<a name="configuring-trusted-hosts"></a>
### 신뢰할 수 있는 호스트 설정

기본적으로, 라라벨은 HTTP 요청의 `Host` 헤더 내용에 관계없이 모든 요청에 응답합니다. 또한, 웹 요청 중에 애플리케이션의 절대 URL을 생성할 때 해당 `Host` 헤더 값을 사용합니다.

일반적으로 Nginx나 Apache 같은 웹 서버에서 특정 호스트명과 일치하는 요청만 애플리케이션으로 전송하도록 설정하는 것이 좋습니다. 하지만, 웹 서버를 직접 설정할 수 없는 환경에서 라라벨에게 특정 호스트에 대해서만 응답하도록 지시해야 할 경우, 애플리케이션의 `bootstrap/app.php` 파일에서 `trustHosts` 미들웨어 메서드를 사용할 수 있습니다. 이는 비밀번호 재설정 같은 기능을 제공할 때 특히 더 중요합니다.

이 미들웨어 메서드에 대해 더 자세히 알고 싶다면 [TrustHosts 미들웨어 문서](/docs/12.x/requests#configuring-trusted-hosts)를 참고하세요.

<a name="routing"></a>
## 라우팅

사용자가 비밀번호를 재설정할 수 있도록 허용하려면, 여러 개의 라우트 정의가 필요합니다. 먼저, 사용자가 이메일 주소를 통해 비밀번호 재설정 링크를 요청하는 라우트 2개가 필요합니다. 그리고, 사용자가 이메일로 받은 비밀번호 재설정 링크를 클릭한 후 실제로 비밀번호를 재설정할 수 있도록 하는 라우트 2개가 필요합니다.

<a name="requesting-the-password-reset-link"></a>
### 비밀번호 재설정 링크 요청하기

<a name="the-password-reset-link-request-form"></a>
#### 비밀번호 재설정 링크 요청 폼

먼저, 비밀번호 재설정 링크를 요청하기 위한 라우트를 정의합니다. 다음과 같이, 비밀번호 재설정 링크 요청 폼이 포함된 뷰를 반환하는 라우트를 작성할 수 있습니다:

```php
Route::get('/forgot-password', function () {
    return view('auth.forgot-password');
})->middleware('guest')->name('password.request');
```

이 라우트에서 반환되는 뷰에는 사용자가 비밀번호 재설정 링크를 이메일로 요청할 수 있도록 `email` 필드가 포함되어야 합니다.

<a name="password-reset-link-handling-the-form-submission"></a>
#### 폼 제출 처리

다음으로, "비밀번호 찾기" 뷰에서 폼이 제출될 때 해당 요청을 처리하는 라우트를 정의합니다. 이 라우트는 이메일 주소를 검증하고, 해당 사용자에게 비밀번호 재설정 요청을 보내는 역할을 합니다:

```php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;

Route::post('/forgot-password', function (Request $request) {
    $request->validate(['email' => 'required|email']);

    $status = Password::sendResetLink(
        $request->only('email')
    );

    return $status === Password::ResetLinkSent
        ? back()->with(['status' => __($status)])
        : back()->withErrors(['email' => __($status)]);
})->middleware('guest')->name('password.email');
```

이 라우트의 동작을 하나씩 살펴보겠습니다. 먼저, 요청에서 받은 `email` 값이 유효한지 검증합니다. 그 다음, 라라벨의 내장 "패스워드 브로커"(`Password` 파사드)를 사용해 해당 사용자에게 비밀번호 재설정 링크를 보냅니다. 패스워드 브로커는 주어진 필드(이 예시에서는 이메일 주소)로 사용자를 찾아, 라라벨의 내장 [알림 시스템](/docs/12.x/notifications)을 통해 재설정 링크를 전송합니다.

`sendResetLink` 메서드는 "status" 슬러그를 반환합니다. 이 status 슬러그는 라라벨의 [로컬라이제이션](/docs/12.x/localization) 헬퍼를 이용해 사용자에게 요청 상태에 대한 안내 메시지로 번역해서 보여줄 수 있습니다. 비밀번호 재설정 status의 번역 내용은 애플리케이션의 `lang/{lang}/passwords.php` 언어 파일에 정의되어 있으며, 가능한 각 status 슬러그에 대한 항목이 포함되어 있습니다.

> [!NOTE]
> 기본적으로, 라라벨 애플리케이션 스켈레톤에는 `lang` 디렉터리가 포함되어 있지 않습니다. 라라벨의 언어 파일을 커스터마이징하려면, `lang:publish` 아티즌 명령어를 사용해 해당 파일들을 발행할 수 있습니다.

라라벨이 `Password` 파사드의 `sendResetLink` 메서드를 호출할 때, 어떻게 사용자를 데이터베이스에서 조회하는지 궁금할 수 있습니다. 라라벨의 패스워드 브로커는 인증 시스템의 "user provider"(사용자 제공자)를 활용하여 데이터베이스에서 사용자를 조회합니다. 어떤 user provider를 사용할지는 `config/auth.php` 설정 파일의 `passwords` 설정 배열에서 지정할 수 있습니다. 커스텀 user provider 작성에 대한 자세한 내용은 [인증 문서](/docs/12.x/authentication#adding-custom-user-providers)를 참고하세요.

> [!NOTE]
> 비밀번호 재설정을 직접 구현할 때는, 폼 뷰와 라우트를 모두 직접 정의해야 합니다. 모든 필수 인증 및 검증 로직이 포함된 전체 스캐폴딩을 원한다면, [라라벨 애플리케이션 스타터 키트](/docs/12.x/starter-kits)를 확인해보세요.

<a name="resetting-the-password"></a>
### 비밀번호 재설정하기

<a name="the-password-reset-form"></a>
#### 비밀번호 재설정 폼

이제, 사용자가 이메일로 받은 비밀번호 재설정 링크를 클릭하고 새 비밀번호를 입력할 수 있도록 하는 라우트를 정의해보겠습니다. 우선, 사용자가 받은 재설정 링크를 클릭하면 표시되는 폼을 렌더링하는 라우트를 작성합니다. 이 라우트는 재설정 요청을 검증하는 데 사용할 `token` 파라미터를 전달받게 됩니다:

```php
Route::get('/reset-password/{token}', function (string $token) {
    return view('auth.reset-password', ['token' => $token]);
})->middleware('guest')->name('password.reset');
```

이 라우트가 반환하는 뷰에는 반드시 `email`, `password`, `password_confirmation` 필드와 함께, 폼의 숨겨진 필드로 전달받은 비밀 `$token` 값을 저장하는 `token` 필드가 포함되어야 합니다.

<a name="password-reset-handling-the-form-submission"></a>
#### 폼 제출 처리

물론, 실제로 비밀번호를 재설정하는 폼 제출을 처리하는 라우트도 필요합니다. 이 라우트는 전달받은 요청을 검증하고, 데이터베이스에 있는 사용자의 비밀번호를 변경하는 역할을 합니다:

```php
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

Route::post('/reset-password', function (Request $request) {
    $request->validate([
        'token' => 'required',
        'email' => 'required|email',
        'password' => 'required|min:8|confirmed',
    ]);

    $status = Password::reset(
        $request->only('email', 'password', 'password_confirmation', 'token'),
        function (User $user, string $password) {
            $user->forceFill([
                'password' => Hash::make($password)
            ])->setRememberToken(Str::random(60));

            $user->save();

            event(new PasswordReset($user));
        }
    );

    return $status === Password::PasswordReset
        ? redirect()->route('login')->with('status', __($status))
        : back()->withErrors(['email' => [__($status)]]);
})->middleware('guest')->name('password.update');
```

이 라우트의 동작을 더 자세히 살펴보겠습니다. 먼저 요청에서 받은 `token`, `email`, `password` 값들이 모두 유효한지 검증합니다. 이후 라라벨의 내장 "패스워드 브로커"(`Password` 파사드)를 활용하여, 비밀번호 재설정 요청 정보를 검증합니다.

만약 입력한 토큰, 이메일, 그리고 새 비밀번호가 유효하다면, `reset` 메서드에 전달한 클로저가 실행됩니다. 이 클로저는 사용자 인스턴스와 사용자가 입력한 평문 비밀번호를 받아, 데이터베이스의 해당 사용자의 비밀번호를 안전하게 변경합니다.

`reset` 메서드는 "status" 슬러그를 반환하며, 이는 라라벨의 [로컬라이제이션](/docs/12.x/localization) 헬퍼를 사용해 사용자에게 읽기 쉬운 메시지로 번역해 보여줄 수 있습니다. 비밀번호 재설정 상태의 번역 항목은 애플리케이션의 `lang/{lang}/passwords.php` 언어 파일에 정의되어 있습니다. 만약 `lang` 디렉터리가 없으면, `lang:publish` 아티즌 명령어로 생성할 수 있습니다.

더불어, 라라벨이 `Password` 파사드의 `reset` 메서드를 통해 어떻게 데이터베이스에서 사용자를 조회하는지 궁금할 수 있습니다. 패스워드 브로커는 인증 시스템의 "user provider"를 활용해서 사용자를 조회합니다. 어떤 user provider가 사용되는지는 `config/auth.php` 파일의 `passwords` 설정 배열에서 정의됩니다. 커스텀 user provider에 대해서는 [인증 문서](/docs/12.x/authentication#adding-custom-user-providers)를 참고하세요.

<a name="deleting-expired-tokens"></a>
## 만료된 토큰 삭제하기

만료된 비밀번호 재설정 토큰은 데이터베이스에 그대로 남아 있을 수 있습니다. 하지만, 다음과 같은 `auth:clear-resets` 아티즌 명령어를 사용해 손쉽게 이런 레코드를 삭제할 수 있습니다:

```shell
php artisan auth:clear-resets
```

이 작업을 자동화하고 싶다면, 애플리케이션의 [스케줄러](/docs/12.x/scheduling)에 해당 명령어를 등록해주면 됩니다:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('auth:clear-resets')->everyFifteenMinutes();
```

<a name="password-customization"></a>
## 커스터마이징

<a name="reset-link-customization"></a>
#### 비밀번호 재설정 링크 커스터마이징

`ResetPassword` 알림 클래스에서 제공하는 `createUrlUsing` 메서드를 사용하여 비밀번호 재설정 링크 URL을 자유롭게 커스터마이즈할 수 있습니다. 이 메서드는 알림을 받는 사용자 인스턴스와 비밀번호 재설정 토큰을 클로저로 전달받습니다. 일반적으로 `App\Providers\AppServiceProvider` 서비스 프로바이더의 `boot` 메서드에서 이 기능을 설정합니다:

```php
use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    ResetPassword::createUrlUsing(function (User $user, string $token) {
        return 'https://example.com/reset-password?token='.$token;
    });
}
```

<a name="reset-email-customization"></a>
#### 비밀번호 재설정 이메일 커스터마이징

비밀번호 재설정 링크를 사용자에게 전송할 때 사용하는 알림 클래스를 쉽게 수정할 수 있습니다. 우선, `App\Models\User` 모델에서 `sendPasswordResetNotification` 메서드를 오버라이드하세요. 이 메서드 내에서 원하는 [알림 클래스](/docs/12.x/notifications)를 사용해 알림을 보낼 수 있습니다. 비밀번호 재설정 `$token` 값이 첫 번째 인자로 전달되므로, 이 값을 원하는 URL을 만들거나 알림에 포함하는 용도로 활용할 수 있습니다:

```php
use App\Notifications\ResetPasswordNotification;

/**
 * 사용자의 비밀번호 재설정 알림을 전송합니다.
 *
 * @param  string  $token
 */
public function sendPasswordResetNotification($token): void
{
    $url = 'https://example.com/reset-password?token='.$token;

    $this->notify(new ResetPasswordNotification($url));
}
```
