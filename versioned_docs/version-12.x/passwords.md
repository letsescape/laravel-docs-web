# 비밀번호 재설정 (Resetting Passwords)

- [소개](#introduction)
    - [모델 준비](#model-preparation)
    - [데이터베이스 준비](#database-preparation)
    - [신뢰할 수 있는 호스트 설정](#configuring-trusted-hosts)
- [라우팅](#routing)
    - [비밀번호 재설정 링크 요청](#requesting-the-password-reset-link)
    - [비밀번호 재설정](#resetting-the-password)
- [만료된 토큰 삭제](#deleting-expired-tokens)
- [커스터마이징](#password-customization)

<a name="introduction"></a>
## 소개

대부분의 웹 애플리케이션에서는 사용자가 비밀번호를 잊어버렸을 때 이를 재설정할 수 있는 방법을 제공합니다. 라라벨에서는 애플리케이션마다 반복적으로 이 기능을 직접 구현하지 않아도 되도록, 비밀번호 재설정 링크를 전송하고 안전하게 비밀번호를 재설정할 수 있는 편리한 서비스를 제공합니다.

> [!NOTE]
> 빠르게 시작하고 싶으신가요? 새로운 라라벨 애플리케이션에서 [애플리케이션 스타터 키트](/docs/starter-kits)를 설치해 보십시오. 라라벨의 스타터 키트는 비밀번호 재설정 기능을 포함한 전체 인증 시스템을 자동으로 구성해 줍니다.

<a name="model-preparation"></a>
### 모델 준비

라라벨의 비밀번호 재설정 기능을 사용하기 전에, 애플리케이션의 `App\Models\User` 모델에 `Illuminate\Notifications\Notifiable` 트레이트가 사용되어 있어야 합니다. 이 트레이트는 일반적으로 라라벨로 새 프로젝트를 생성할 때 기본적으로 포함되어 있습니다.

다음으로, `App\Models\User` 모델이 `Illuminate\Contracts\Auth\CanResetPassword` 인터페이스를 구현하고 있는지 확인해야 합니다. 라라벨 프레임워크에 기본 포함되어 있는 `App\Models\User` 모델은 이미 이 인터페이스를 구현하고 있으며, `Illuminate\Auth\Passwords\CanResetPassword` 트레이트를 사용하여 필요한 메서드들을 제공합니다.

<a name="database-preparation"></a>
### 데이터베이스 준비

비밀번호 재설정 토큰을 저장하기 위한 테이블이 필요합니다. 보통 이 테이블은 라라벨의 기본 마이그레이션 파일 `0001_01_01_000000_create_users_table.php`에 포함되어 있습니다.

<a name="configuring-trusted-hosts"></a>
### 신뢰할 수 있는 호스트 설정

기본적으로 라라벨은 HTTP 요청의 `Host` 헤더의 값과 상관없이 모든 요청에 응답합니다. 또한, 웹 요청 중에 애플리케이션의 절대 URL을 생성할 때 `Host` 헤더의 값이 사용됩니다.

일반적으로는 Nginx나 Apache와 같은 웹 서버에서 특정 호스트명과 일치하는 요청만 애플리케이션으로 전달하도록 설정하는 것이 바람직합니다. 하지만 웹 서버를 직접 커스터마이징할 수 없는 상황이라면, 라라벨의 `bootstrap/app.php` 파일에서 `trustHosts` 미들웨어 메서드를 사용해 특정 호스트만 허용하도록 설정할 수 있습니다. 특히 비밀번호 재설정 기능을 제공하는 경우 이 설정은 더욱 중요합니다.

이 미들웨어 메서드에 대해 더 자세히 알고 싶으시면 [TrustHosts 미들웨어 문서](/docs/requests#configuring-trusted-hosts)를 참고하시기 바랍니다.

<a name="routing"></a>
## 라우팅

사용자가 비밀번호 재설정 기능을 이용할 수 있도록 하려면, 여러 개의 라우트를 정의해야 합니다. 먼저, 사용자가 이메일 주소를 통해 비밀번호 재설정 링크를 요청할 수 있도록 하는 라우트 2개가 필요합니다. 그리고, 사용자에게 비밀번호 재설정 링크가 이메일로 전달되고, 해당 링크를 통해 비밀번호를 실제로 재설정할 수 있도록 하는 라우트 2개가 필요합니다.

<a name="requesting-the-password-reset-link"></a>
### 비밀번호 재설정 링크 요청

<a name="the-password-reset-link-request-form"></a>
#### 비밀번호 재설정 링크 요청 폼

먼저, 비밀번호 재설정 링크를 요청하는 데 필요한 라우트를 정의합니다. 가장 먼저, 비밀번호 재설정 요청 폼을 보여주는 뷰를 반환하는 라우트를 만들어 보겠습니다.

```php
Route::get('/forgot-password', function () {
    return view('auth.forgot-password');
})->middleware('guest')->name('password.request');
```

이 라우트에서 반환하는 뷰에는 사용자가 특정 이메일 주소로 비밀번호 재설정 링크를 요청할 수 있도록, `email` 필드를 갖는 폼이 포함되어 있어야 합니다.

<a name="password-reset-link-handling-the-form-submission"></a>
#### 폼 제출 처리

다음으로, 위에서 만든 "비밀번호를 잊으셨나요" 뷰의 폼이 제출될 때 요청을 처리하는 라우트를 정의합니다. 이 라우트는 이메일 주소의 유효성을 검사하고, 해당 사용자에게 비밀번호 재설정 요청을 보내는 역할을 합니다.

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

다음 단계로 넘어가기 전에, 위의 라우트가 하는 일을 좀 더 자세히 살펴보겠습니다. 우선, 요청 객체에서 받은 `email` 속성에 대해 유효성 검증을 실시합니다. 그리고 나서 라라벨에서 제공하는 "패스워드 브로커"(`Password` 파사드 사용)를 이용해 해당 사용자에게 비밀번호 재설정 링크를 보냅니다. 패스워드 브로커는 주어진 필드(여기서는 이메일 주소)로 사용자를 찾아 라라벨 내장 [알림 시스템](/docs/notifications)을 통해 비밀번호 재설정 링크를 보내줍니다.

`sendResetLink` 메서드는 "상태" 슬러그를 반환합니다. 이 상태값은 라라벨의 [로컬라이제이션](/docs/localization) 헬퍼를 사용하여, 사용자의 요청 처리 결과에 대해 친숙한 메시지로 번역할 수 있습니다. 비밀번호 재설정 상태에 대한 번역 값은 애플리케이션의 `lang/{lang}/passwords.php` 파일에서 관리됩니다. 가능한 상태 슬러그별로 각각에 대한 항목이 이 파일에 정의되어 있습니다.

> [!NOTE]
> 기본적으로, 라라벨의 애플리케이션 스캐폴딩에는 `lang` 디렉터리가 포함되어 있지 않습니다. 라라벨의 언어 파일을 커스터마이징하고 싶다면, `lang:publish` Artisan 명령어로 파일을 게시할 수 있습니다.

아마 궁금하실 수 있습니다. `Password` 파사드의 `sendResetLink` 메서드를 호출할 때 라라벨이 어떻게 내 애플리케이션 데이터베이스에서 사용자 레코드를 찾아오는 걸까요? 라라벨의 패스워드 브로커는 인증 시스템의 "user providers"를 이용해 데이터베이스 레코드를 조회합니다. 패스워드 브로커에서 사용하는 user provider는 `config/auth.php` 설정 파일의 `passwords` 설정 배열에서 지정됩니다. 커스텀 user provider 작성 방법이 궁금하다면 [인증 문서](/docs/authentication#adding-custom-user-providers)를 참고하십시오.

> [!NOTE]
> 패스워드 재설정을 직접 구현하는 경우, 뷰와 라우트의 내용을 모두 직접 정의해야 합니다. 인증과 인증 검증에 필요한 모든 로직이 자동 구성된 스캐폴딩을 원하신다면 [라라벨 애플리케이션 스타터 키트](/docs/starter-kits)를 참고하지기 바랍니다.

<a name="resetting-the-password"></a>
### 비밀번호 재설정

<a name="the-password-reset-form"></a>
#### 비밀번호 재설정 폼

다음으로, 사용자가 이메일로 받은 비밀번호 재설정 링크를 클릭하여 새로운 비밀번호를 직접 입력할 수 있도록 하는 라우트들을 정의하겠습니다. 가장 먼저, 사용자가 비밀번호 재설정 링크를 클릭했을 때 보여지는 폼을 반환하는 라우트를 만들어보겠습니다. 이 라우트는 비밀번호 재설정 요청의 유효성을 확인할 때 사용할 `token` 파라미터를 전달받습니다.

```php
Route::get('/reset-password/{token}', function (string $token) {
    return view('auth.reset-password', ['token' => $token]);
})->middleware('guest')->name('password.reset');
```

이 라우트에서 반환하는 뷰는, `email` 필드, `password` 필드, `password_confirmation` 필드, 그리고 숨겨진 `token` 필드를 포함해야 하며, 이때 `token` 필드에는 라우트로 전달된 비밀 `$token` 값을 담아야 합니다.

<a name="password-reset-handling-the-form-submission"></a>
#### 폼 제출 처리

당연히, 비밀번호 재설정 폼이 제출되었을 때 이를 처리할 라우트도 필요합니다. 이 라우트는 들어온 요청의 유효성을 검사하고, 데이터베이스에서 사용자의 비밀번호를 실제로 업데이트합니다.

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

여기서 이 라우트의 동작을 좀 더 자세히 살펴보겠습니다. 먼저, 요청 객체로부터 받은 `token`, `email`, `password` 속성들을 검증합니다. 그 다음 라라벨 내장 "패스워드 브로커"(Password 파사드)를 사용해 재설정 요청의 인증 정보를 검증합니다.

패스워드 브로커에 제공된 토큰, 이메일, 비밀번호가 유효하다면, `reset` 메서드에 전달한 클로저가 실행됩니다. 이 클로저는 사용자 인스턴스와 폼에 입력된 평문 비밀번호를 인자로 받아서, 데이터베이스의 실제 사용자 비밀번호를 업데이트합니다.

`reset` 메서드는 "상태" 슬러그를 반환합니다. 이 슬러그는 라라벨의 [로컬라이제이션](/docs/localization) 헬퍼를 사용해, 사용자의 요청 처리 결과를 친숙한 메시지로 번역해서 표시할 수 있습니다. 상태값에 대한 번역 항목은 애플리케이션의 `lang/{lang}/passwords.php` 파일에 정의되어 있습니다. 만약 애플리케이션에 `lang` 디렉터리가 없다면, `lang:publish` Artisan 명령어로 생성할 수 있습니다.

또한, `Password` 파사드의 `reset` 메서드를 호출할 때 라라벨이 데이터베이스에서 사용자 레코드를 어떻게 찾아오는지 궁금할 수 있습니다. 라라벨의 패스워드 브로커는 인증 시스템의 "user provider"를 활용해 사용자 정보를 조회하며, 이 provider는 `config/auth.php` 파일의 `passwords` 설정 배열에서 지정됩니다. 커스텀 user provider 작성에 대해 더 알고 싶으시다면 [인증 문서](/docs/authentication#adding-custom-user-providers)를 참고하십시오.

<a name="deleting-expired-tokens"></a>
## 만료된 토큰 삭제

만료된 비밀번호 재설정 토큰이 데이터베이스에 여전히 남아 있을 수 있습니다. 이러한 토큰을 쉽게 정리하려면 `auth:clear-resets` Artisan 명령어를 사용하면 됩니다.

```shell
php artisan auth:clear-resets
```

이 작업을 자동화하고 싶다면, 애플리케이션의 [스케줄러](/docs/scheduling)를 이용해 아래와 같이 명령어를 등록할 수 있습니다.

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('auth:clear-resets')->everyFifteenMinutes();
```

<a name="password-customization"></a>
## 커스터마이징

<a name="reset-link-customization"></a>
#### 비밀번호 재설정 링크 커스터마이징

`ResetPassword` 알림 클래스에서 제공하는 `createUrlUsing` 메서드를 사용하여 비밀번호 재설정 링크의 URL을 자유롭게 커스터마이징할 수 있습니다. 이 메서드는 알림을 받는 사용자 인스턴스와 비밀번호 재설정 토큰을 인자로 받는 클로저를 매개변수로 받습니다. 보통은 `App\Providers\AppServiceProvider`의 `boot` 메서드에서 이 설정을 등록합니다.

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
#### 비밀번호 재설정 이메일 커스터마이즈

비밀번호 재설정 링크를 사용자에게 전달하는 데 사용하는 알림 클래스를 손쉽게 변경할 수 있습니다. 이를 위해 `App\Models\User` 모델에서 `sendPasswordResetNotification` 메서드를 오버라이드하면 됩니다. 이 메서드 안에서 [알림 클래스](/docs/notifications)를 활용해 원하는 방식으로 알림을 보낼 수 있습니다. 비밀번호 재설정 `$token`은 이 메서드의 첫 번째 인자로 전달됩니다. 이 `$token`을 사용해서 원하는 방식으로 재설정 URL을 만들고, 사용자가 받을 알림을 전송할 수 있습니다.

```php
use App\Notifications\ResetPasswordNotification;

/**
 * Send a password reset notification to the user.
 *
 * @param  string  $token
 */
public function sendPasswordResetNotification($token): void
{
    $url = 'https://example.com/reset-password?token='.$token;

    $this->notify(new ResetPasswordNotification($url));
}
```
