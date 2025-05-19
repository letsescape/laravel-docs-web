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

대부분의 웹 애플리케이션은 사용자가 잊어버린 비밀번호를 재설정할 수 있는 방법을 제공합니다. 매번 직접 비밀번호 재설정 기능을 새로 구현하지 않도록, 라라벨은 비밀번호 재설정 링크를 전송하고 안전하게 비밀번호를 재설정할 수 있는 편리한 서비스를 제공합니다.

> [!TIP]
> 빠르게 시작하고 싶으신가요? 새로운 라라벨 애플리케이션에 [애플리케이션 스타터 킷](/docs/8.x/starter-kits)을 설치해보세요. 라라벨의 스타터 킷은 비밀번호 재설정 등 전체 인증 시스템의 뼈대를 자동으로 구성해줍니다.

<a name="model-preparation"></a>
### 모델 준비

라라벨의 비밀번호 재설정 기능을 사용하려면, 애플리케이션의 `App\Models\User` 모델에서 `Illuminate\Notifications\Notifiable` 트레이트를 사용해야 합니다. 일반적으로, 이 트레이트는 새로운 라라벨 애플리케이션에서 생성되는 기본 `App\Models\User` 모델에 이미 포함되어 있습니다.

다음으로, `App\Models\User` 모델이 `Illuminate\Contracts\Auth\CanResetPassword` 인터페이스를 구현하고 있는지 확인해야 합니다. 프레임워크에 포함된 `App\Models\User` 모델에서는 이미 해당 인터페이스가 구현되어 있으며, 필요한 메서드를 제공하는 `Illuminate\Auth\Passwords\CanResetPassword` 트레이트도 함께 사용합니다.

<a name="database-preparation"></a>
### 데이터베이스 준비

애플리케이션의 비밀번호 재설정 토큰을 저장하기 위한 테이블이 필요합니다. 이 테이블을 위한 마이그레이션 파일은 기본 라라벨 애플리케이션에 포함되어 있으므로, 데이터베이스를 마이그레이션하기만 하면 테이블이 생성됩니다.

```
php artisan migrate
```

<a name="configuring-trusted-hosts"></a>
### 신뢰할 수 있는 호스트 설정

기본적으로 라라벨은 HTTP 요청의 `Host` 헤더 내용과 관계없이 수신하는 모든 요청에 응답합니다. 또한, 웹 요청 중에 절대 URL을 생성할 때 `Host` 헤더의 값을 사용합니다.

보통은 Nginx나 Apache와 같은 웹 서버에서 특정 호스트명과 일치하는 요청만 애플리케이션에 전달하도록 설정하는 것이 좋습니다. 하지만 웹 서버를 직접 커스터마이즈할 수 없는 환경이거나, 라라벨이 특정 호스트명에만 응답하도록 해야 하는 경우에는 `App\Http\Middleware\TrustHosts` 미들웨어를 활성화하여 사용할 수 있습니다. 비밀번호 재설정 기능이 있는 애플리케이션이라면 이 설정이 특히 중요합니다.

이 미들웨어에 대한 자세한 내용은 [`TrustHosts` 미들웨어 문서](/docs/8.x/requests#configuring-trusted-hosts)를 참고하시기 바랍니다.

<a name="routing"></a>
## 라우팅

사용자가 비밀번호를 재설정할 수 있도록 지원하려면 여러 개의 라우트를 정의해야 합니다. 먼저, 사용자가 이메일 주소로 비밀번호 재설정 링크를 요청할 수 있도록 처리하는 라우트 두 개가 필요합니다. 두 번째로, 사용자가 이메일로 받은 비밀번호 재설정 링크를 방문해 비밀번호 재설정 폼을 작성할 때 이를 처리하는 라우트 두 개가 필요합니다.

<a name="requesting-the-password-reset-link"></a>
### 비밀번호 재설정 링크 요청

<a name="the-password-reset-link-request-form"></a>
#### 비밀번호 재설정 링크 요청 폼

먼저, 비밀번호 재설정 링크를 요청하기 위한 라우트를 정의합니다. 아래 라우트는 비밀번호 재설정 링크 요청 폼이 담긴 뷰를 반환합니다.

```
Route::get('/forgot-password', function () {
    return view('auth.forgot-password');
})->middleware('guest')->name('password.request');
```

이 라우트에서 반환되는 뷰에는 `email` 필드를 가진 폼이 있어야 하며, 사용자는 이를 통해 특정 이메일 주소에 대한 비밀번호 재설정 링크를 요청할 수 있습니다.

<a name="password-reset-link-handling-the-form-submission"></a>
#### 폼 제출 처리

다음으로, "비밀번호 잊어버림" 뷰로부터 폼 제출 요청을 처리하는 라우트를 정의합니다. 이 라우트는 이메일 주소를 검증한 뒤 해당 사용자에게 비밀번호 재설정 요청을 전송합니다.

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

다음 단계로 넘어가기 전에, 이 라우트에 대해 조금 더 살펴보겠습니다. 먼저, 요청의 `email` 속성이 유효한지 검증합니다. 그리고 나서 라라벨의 내장 "패스워드 브로커"(`Password` 파사드 사용)를 통해 해당 사용자에게 비밀번호 재설정 링크를 전송합니다. 패스워드 브로커는 주어진 필드(이 경우 이메일 주소)로 사용자를 조회하고, 라라벨의 내장 [노티피케이션 시스템](/docs/8.x/notifications)을 이용해 비밀번호 재설정 링크를 전송합니다.

`sendResetLink` 메서드는 "상태(status)" 슬러그를 반환합니다. 이 상태는 라라벨의 [로컬라이제이션](/docs/8.x/localization) 헬퍼를 통해 사용자에게 요청 결과에 대한 친절한 메시지를 제공할 수 있습니다. 비밀번호 재설정 상태의 번역은 애플리케이션의 `resources/lang/{lang}/passwords.php` 언어 파일을 통해 결정됩니다. 모든 가능한 상태별 엔트리가 `passwords` 언어 파일에 포함되어 있습니다.

`Password` 파사드의 `sendResetLink` 메서드를 호출할 때, 라라벨이 어떻게 애플리케이션의 데이터베이스에서 사용자 레코드를 조회하는지 궁금할 수 있습니다. 라라벨의 패스워드 브로커는 인증 시스템의 "유저 프로바이더"를 사용해 데이터베이스에서 레코드를 조회합니다. 패스워드 브로커에서 사용할 유저 프로바이더는 `config/auth.php` 설정 파일의 `passwords` 설정 배열에서 설정할 수 있습니다. 커스텀 유저 프로바이더 작성에 대한 자세한 내용은 [인증 문서](/docs/8.x/authentication#adding-custom-user-providers)를 참고하세요.

> [!TIP]
> 비밀번호 재설정을 직접 구현하는 경우, 뷰와 라우트의 내용을 모두 직접 정의해주셔야 합니다. 인증과 검증 로직을 모두 포함한 뼈대가 필요하시다면 [라라벨 애플리케이션 스타터 키트](/docs/8.x/starter-kits)를 참고해 주세요.

<a name="resetting-the-password"></a>
### 비밀번호 재설정

<a name="the-password-reset-form"></a>
#### 비밀번호 재설정 폼

이제 사용자가 이메일로 전송된 비밀번호 재설정 링크를 클릭해 새로운 비밀번호를 입력할 수 있도록 필요한 라우트를 정의해보겠습니다. 먼저, 사용자가 비밀번호 재설정 링크를 클릭했을 때 표시되는 비밀번호 재설정 폼을 보여주는 라우트를 정의합니다. 이 라우트는 나중에 비밀번호 재설정 요청 검증에 사용할 `token` 파라미터를 전달받습니다.

```
Route::get('/reset-password/{token}', function ($token) {
    return view('auth.reset-password', ['token' => $token]);
})->middleware('guest')->name('password.reset');
```

이 라우트에서 반환되는 뷰는 `email` 필드, `password` 필드, `password_confirmation` 필드, 그리고 숨겨진 필드로 전달받은 비밀 `$token` 값을 담는 `token` 필드를 포함해야 합니다.

<a name="password-reset-handling-the-form-submission"></a>
#### 폼 제출 처리

물론, 실제로 비밀번호 재설정 폼 제출을 처리하는 라우트도 필요합니다. 이 라우트는 들어오는 요청을 검증하고, 데이터베이스에서 사용자의 비밀번호를 업데이트하는 역할을 합니다.

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

다음 단계로 넘어가기 전에, 이 라우트에 대해 조금 더 살펴보겠습니다. 먼저, 요청으로 들어온 `token`, `email`, `password` 속성이 올바른지 검증합니다. 그리고 라라벨의 내장 "패스워드 브로커"(`Password` 파사드 사용)를 통해 비밀번호 재설정 요청 자격이 유효한지 확인합니다.

토큰, 이메일, 비밀번호가 올바른 경우, `reset` 메서드에 전달된 클로저가 실행됩니다. 이 클로저는 비밀번호 재설정 폼에 입력된 평문 비밀번호와 사용자 인스턴스를 전달받으며, 이 안에서 사용자의 비밀번호를 데이터베이스에 업데이트할 수 있습니다.

`reset` 메서드는 "상태(status)" 슬러그를 반환합니다. 이 값은 라라벨의 [로컬라이제이션](/docs/8.x/localization) 헬퍼를 이용해 요청 결과에 대한 친절한 메시지를 사용자에게 보여줄 수 있습니다. 비밀번호 재설정 상태의 번역 내용은 애플리케이션의 `resources/lang/{lang}/passwords.php` 파일에서 관리됩니다. 모든 가능한 상태별 엔트리가 이 파일에 포함되어 있습니다.

또한, `Password` 파사드의 `reset` 메서드를 호출했을 때 라라벨이 어떻게 데이터베이스에서 사용자 레코드를 조회하는지 궁금할 수 있습니다. 이를 위해 라라벨은 인증 시스템의 "유저 프로바이더"를 활용합니다. 패스워드 브로커에서 사용할 유저 프로바이더는 `config/auth.php` 파일 내 `passwords` 설정 배열에서 정할 수 있습니다. 커스텀 유저 프로바이더 작성에 대한 자세한 내용은 [인증 문서](/docs/8.x/authentication#adding-custom-user-providers)를 참고하시기 바랍니다.

<a name="deleting-expired-tokens"></a>
## 만료된 토큰 삭제

만료된 비밀번호 재설정 토큰도 데이터베이스에 남아 있을 수 있습니다. 하지만 `auth:clear-resets` 아티즌 명령어를 사용해 이러한 레코드를 쉽게 삭제할 수 있습니다.

```
php artisan auth:clear-resets
```

이 과정을 자동화하고 싶다면, 애플리케이션의 [스케줄러](/docs/8.x/scheduling)에 명령어를 추가하는 것을 고려해볼 수 있습니다.

```
$schedule->command('auth:clear-resets')->everyFifteenMinutes();
```

<a name="password-customization"></a>
## 커스터마이징

<a name="reset-link-customization"></a>
#### 재설정 링크 커스터마이즈

`ResetPassword` 노티피케이션 클래스의 `createUrlUsing` 메서드를 사용하면 비밀번호 재설정 링크 URL을 자유롭게 커스터마이즈할 수 있습니다. 이 메서드는 노티피케이션을 받을 사용자 인스턴스와 비밀번호 재설정 토큰을 전달받는 클로저를 인자로 받습니다. 보통은 `App\Providers\AuthServiceProvider` 서비스 프로바이더의 `boot` 메서드에서 이 메서드를 호출하는 것이 일반적입니다.

```
use Illuminate\Auth\Notifications\ResetPassword;

/**
 * 인증 / 인가 관련 모든 서비스를 등록합니다.
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
#### 재설정 이메일 커스터마이즈

비밀번호 재설정 링크를 사용자에게 전송할 때 사용하는 노티피케이션 클래스를 간편하게 수정할 수 있습니다. 우선, `App\Models\User` 모델에서 `sendPasswordResetNotification` 메서드를 오버라이드해야 합니다. 이 메서드 안에서는 원하는 [노티피케이션 클래스](/docs/8.x/notifications)를 사용해 알림을 전송할 수 있습니다. 비밀번호 재설정용 `$token`이 메서드의 첫 번째 인자로 전달되며, 이 값을 활용해 원하는 형태의 비밀번호 재설정 URL을 만들고 해당 노티피케이션을 사용자에게 전송할 수 있습니다.

```
use App\Notifications\ResetPasswordNotification;

/**
 * 사용자에게 비밀번호 재설정 알림을 전송합니다.
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
