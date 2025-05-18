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

대부분의 웹 애플리케이션에서는 사용자가 잊어버린 비밀번호를 재설정할 수 있는 방법을 제공합니다. 라라벨은 매번 직접 구현하지 않아도 되도록, 비밀번호 재설정 링크 발송과 안전한 비밀번호 재설정을 위한 편리한 서비스를 제공합니다.

> [!NOTE]
> 빠르게 시작하고 싶으신가요? 새로운 라라벨 애플리케이션에 [애플리케이션 스타터 키트](/docs/9.x/starter-kits)를 설치해 보세요. 라라벨의 스타터 키트는 비밀번호 재설정을 포함한 전체 인증 시스템의 스캐폴딩 작업을 대신 처리해줍니다.

<a name="model-preparation"></a>
### 모델 준비

라라벨의 비밀번호 재설정 기능을 사용하기 전에, 애플리케이션의 `App\Models\User` 모델이 `Illuminate\Notifications\Notifiable` 트레이트를 사용해야 합니다. 보통 이 트레이트는 새로운 라라벨 애플리케이션에서 생성되는 기본 `App\Models\User` 모델에 이미 포함되어 있습니다.

이어서, `App\Models\User` 모델이 `Illuminate\Contracts\Auth\CanResetPassword` 계약을 구현하는지도 확인해야 합니다. 프레임워크에 기본 포함된 `App\Models\User` 모델은 이미 이 인터페이스를 구현하고 있으며, 필수 메서드가 포함된 `Illuminate\Auth\Passwords\CanResetPassword` 트레이트를 사용합니다.

<a name="database-preparation"></a>
### 데이터베이스 준비

애플리케이션의 비밀번호 재설정 토큰을 저장할 테이블을 생성해야 합니다. 이 테이블을 위한 마이그레이션은 기본 라라벨 애플리케이션에 포함되어 있으므로, 데이터베이스를 마이그레이션하여 테이블을 생성하면 됩니다.

```shell
php artisan migrate
```

<a name="configuring-trusted-hosts"></a>
### 신뢰할 수 있는 호스트 설정

기본적으로 라라벨은 HTTP 요청의 `Host` 헤더 내용에 관계없이 모든 요청에 응답합니다. 또한, 웹 요청 중에 애플리케이션의 절대 URL을 생성할 때 해당 `Host` 헤더 값이 사용됩니다.

일반적으로는 Nginx나 Apache와 같은 웹 서버에서 요청이 특정 호스트 이름과 일치할 때만 애플리케이션으로 보내도록 서버를 설정해야 합니다. 하지만 서버를 직접 커스터마이징할 수 없는 환경이라면, 라라벨이 특정 호스트 이름에 대해서만 응답하도록 설정할 수 있습니다. 이때는 애플리케이션에 `App\Http\Middleware\TrustHosts` 미들웨어를 활성화하면 됩니다. 비밀번호 재설정 기능을 제공하는 경우 특히 중요한 부분입니다.

이 미들웨어에 대한 자세한 내용은 [`TrustHosts` 미들웨어 문서](/docs/9.x/requests#configuring-trusted-hosts)를 참고하세요.

<a name="routing"></a>
## 라우팅

사용자가 비밀번호를 재설정할 수 있도록 하려면 여러 개의 라우트를 정의해야 합니다. 먼저, 사용자가 이메일 주소를 통해 비밀번호 재설정 링크를 요청할 수 있도록 처리하는 라우트가 필요합니다. 다음으로, 사용자가 이메일로 받은 비밀번호 재설정 링크를 클릭하여 실제로 비밀번호를 재설정하는 폼을 처리하는 라우트가 필요합니다.

<a name="requesting-the-password-reset-link"></a>
### 비밀번호 재설정 링크 요청

<a name="the-password-reset-link-request-form"></a>
#### 비밀번호 재설정 링크 요청 폼

먼저, 비밀번호 재설정 링크를 요청하는 데 필요한 라우트를 정의합니다. 시작을 위해, 비밀번호 재설정 링크 요청 폼이 포함된 뷰를 반환하는 라우트를 아래와 같이 작성합니다.

```
Route::get('/forgot-password', function () {
    return view('auth.forgot-password');
})->middleware('guest')->name('password.request');
```

이 라우트가 반환하는 뷰에는 사용자가 특정 이메일 주소로 비밀번호 재설정 링크를 요청할 수 있도록 `email` 입력 필드를 포함해야 합니다.

<a name="password-reset-link-handling-the-form-submission"></a>
#### 폼 제출 처리

다음으로, "비밀번호를 잊으셨나요" 뷰에서 폼 제출 요청을 처리할 라우트를 정의합니다. 이 라우트는 이메일 주소를 검증하고 해당 사용자에게 비밀번호 재설정 요청을 전송하는 역할을 합니다.

```
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;

Route::post('/forgot-password', function (Request $request) {
    $request->validate(['email' => 'required|email']);

    $status = Password::sendResetLink(
        $request->only('email')
    );

    return $status === Password::RESET_LINK_SENT
                ? back()->with(['status' => __($status)])
                : back()->withErrors(['email' => __($status)]);
})->middleware('guest')->name('password.email');
```

다음 단계로 넘어가기 전에, 이 라우트의 동작을 좀 더 살펴보겠습니다. 먼저, 요청에서 전달된 `email` 속성을 유효성 검사합니다. 이후 라라벨의 기본 "비밀번호 브로커"(Password 파사드)를 이용하여 사용자의 비밀번호 재설정 링크를 전송합니다. 비밀번호 브로커는 전달된 필드(여기서는 이메일 주소)로 사용자를 조회하고, 라라벨의 [알림 시스템](/docs/9.x/notifications)을 통해 비밀번호 재설정 링크를 전송합니다.

`sendResetLink` 메서드는 "status" 슬러그(코드값)를 반환합니다. 이 status는 라라벨의 [로컬라이제이션](/docs/9.x/localization) 헬퍼로 변환하여 사용자에게 의미 있는 메시지를 표시할 수 있습니다. 비밀번호 재설정 status의 번역은 애플리케이션의 `lang/{lang}/passwords.php` 언어 파일에서 결정되며, status 슬러그별로 해당 파일에 번역 항목이 존재합니다.

아마도 `Password` 파사드의 `sendResetLink` 메서드를 호출할 때 라라벨이 어떻게 데이터베이스에서 사용자 레코드를 찾는지 궁금하실 수 있습니다. 라라벨의 비밀번호 브로커는 인증 시스템의 "user providers"를 활용해 데이터베이스 레코드를 가져옵니다. 비밀번호 브로커가 사용할 user provider는 `config/auth.php` 설정 파일의 `passwords` 설정 배열에서 지정할 수 있습니다. 커스텀 user provider를 작성하는 방법은 [인증 문서](/docs/9.x/authentication#adding-custom-user-providers)를 참고하세요.

> [!NOTE]
> 비밀번호 재설정 기능을 직접 구현할 경우, 뷰와 라우트 내용을 반드시 직접 정의해 주어야 합니다. 인증 및 검증 로직이 모두 포함된 스캐폴딩을 원한다면, [라라벨 애플리케이션 스타터 키트](/docs/9.x/starter-kits)를 확인해 보세요.

<a name="resetting-the-password"></a>
### 비밀번호 재설정

<a name="the-password-reset-form"></a>
#### 비밀번호 재설정 폼

이제 사용자가 이메일로 받은 비밀번호 재설정 링크를 클릭해 실제로 비밀번호를 재설정할 수 있도록 하는 라우트를 정의합니다. 먼저, 사용자가 재설정 링크를 클릭했을 때 표시할 비밀번호 재설정 폼 뷰를 반환하는 라우트를 아래와 같이 작성합니다. 이 라우트는 나중에 비밀번호 재설정 요청이 올바른지 확인할 때 사용할 `token` 파라미터를 전달받게 됩니다.

```
Route::get('/reset-password/{token}', function ($token) {
    return view('auth.reset-password', ['token' => $token]);
})->middleware('guest')->name('password.reset');
```

이 라우트가 반환하는 뷰에서는 `email` 필드, `password` 필드, `password_confirmation` 필드, 그리고 숨겨진 `token` 필드를 포함하는 폼이 있어야 하며, `token` 필드에는 라우트에서 전달받은 비밀 `$token` 값을 넣어야 합니다.

<a name="password-reset-handling-the-form-submission"></a>
#### 폼 제출 처리

물론, 실제로 비밀번호를 재설정하는 폼 제출 요청을 처리할 라우트도 정의해야 합니다. 이 라우트는 전달된 요청을 검증하고 데이터베이스에서 사용자의 비밀번호를 업데이트하는 역할을 합니다.

```
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
        function ($user, $password) {
            $user->forceFill([
                'password' => Hash::make($password)
            ])->setRememberToken(Str::random(60));

            $user->save();

            event(new PasswordReset($user));
        }
    );

    return $status === Password::PASSWORD_RESET
                ? redirect()->route('login')->with('status', __($status))
                : back()->withErrors(['email' => [__($status)]]);
})->middleware('guest')->name('password.update');
```

다음 단계로 넘어가기 전에 이 라우트의 동작을 좀 더 살펴보겠습니다. 먼저, 요청에서 전달된 `token`, `email`, `password` 속성의 유효성을 검사합니다. 이후 라라벨의 기본 "비밀번호 브로커"(Password 파사드)를 통해 비밀번호 재설정 요청을 검증합니다.

비밀번호 브로커에 전달된 토큰, 이메일 주소, 비밀번호가 모두 유효할 경우, `reset` 메서드에 전달된 클로저가 호출됩니다. 이 클로저에서는 사용자 인스턴스와 비밀번호 재설정 폼에서 입력받은 평문 비밀번호를 받아, 사용자의 비밀번호를 데이터베이스에 업데이트할 수 있습니다.

`reset` 메서드는 "status" 슬러그(코드값)를 반환합니다. 이 status는 라라벨의 [로컬라이제이션](/docs/9.x/localization) 헬퍼로 변환하여 사용자에게 알기 쉬운 메시지로 보여줄 수 있습니다. 비밀번호 재설정 status의 번역은 애플리케이션의 `lang/{lang}/passwords.php` 언어 파일에서 결정되며, status 슬러그별로 해당 파일에 번역 항목이 존재합니다.

여기서 또 한 번, `Password` 파사드의 `reset` 메서드를 사용할 때 라라벨이 데이터베이스의 사용자 레코드를 어떻게 조회하는지 궁금할 수 있습니다. 라라벨의 비밀번호 브로커는 인증 시스템의 "user providers"를 활용합니다. 비밀번호 브로커가 사용할 user provider는 `config/auth.php` 설정 파일 내의 `passwords` 설정 배열에서 지정할 수 있습니다. 커스텀 user provider 작성에 대한 상세 내용은 [인증 문서](/docs/9.x/authentication#adding-custom-user-providers)를 참고하세요.

<a name="deleting-expired-tokens"></a>
## 만료된 토큰 삭제

만료된 비밀번호 재설정 토큰도 데이터베이스에 그대로 남아 있을 수 있습니다. 그러나 `auth:clear-resets` 아티즌 명령어를 사용해 손쉽게 만료된 토큰 레코드를 삭제할 수 있습니다.

```shell
php artisan auth:clear-resets
```

이 작업을 자동화하고 싶다면, 애플리케이션의 [스케줄러](/docs/9.x/scheduling)에 아래와 같이 명령어를 추가해 보세요.

```
$schedule->command('auth:clear-resets')->everyFifteenMinutes();
```

<a name="password-customization"></a>
## 커스터마이징

<a name="reset-link-customization"></a>
#### 재설정 링크 커스터마이징

`ResetPassword` 알림 클래스에서 제공하는 `createUrlUsing` 메서드를 사용하면 비밀번호 재설정 링크 URL을 직접 커스터마이즈할 수 있습니다. 이 메서드는 알림을 받는 사용자 인스턴스와 재설정 토큰을 파라미터로 받는 클로저를 인자로 받습니다. 보통 `App\Providers\AuthServiceProvider` 서비스 프로바이더의 `boot` 메서드에서 이 메서드를 호출하면 됩니다.

```
use Illuminate\Auth\Notifications\ResetPassword;

/**
 * Register any authentication / authorization services.
 *
 * @return void
 */
public function boot()
{
    $this->registerPolicies();

    ResetPassword::createUrlUsing(function ($user, string $token) {
        return 'https://example.com/reset-password?token='.$token;
    });
}
```

<a name="reset-email-customization"></a>
#### 재설정 이메일 커스터마이징

비밀번호 재설정 링크를 사용자에게 전송할 때 사용하는 알림 클래스를 손쉽게 변경할 수 있습니다. 먼저, `App\Models\User` 모델에서 `sendPasswordResetNotification` 메서드를 오버라이딩하세요. 이 메서드 안에서 여러분이 만든 [알림 클래스](/docs/9.x/notifications)를 사용해 자유롭게 알림을 보낼 수 있습니다. 비밀번호 재설정 `$token`은 이 메서드의 첫 번째 인수로 전달되며, 원하는 형태의 비밀번호 재설정 URL을 만들어 사용자에게 알림을 보낼 때 사용할 수 있습니다.

```
use App\Notifications\ResetPasswordNotification;

/**
 * Send a password reset notification to the user.
 *
 * @param  string  $token
 * @return void
 */
public function sendPasswordResetNotification($token)
{
    $url = 'https://example.com/reset-password?token='.$token;

    $this->notify(new ResetPasswordNotification($url));
}
```
