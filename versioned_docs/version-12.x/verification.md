# 이메일 인증 (Email Verification)

- [소개](#introduction)
    - [모델 준비](#model-preparation)
    - [데이터베이스 준비](#database-preparation)
- [라우팅](#verification-routing)
    - [이메일 인증 알림 페이지](#the-email-verification-notice)
    - [이메일 인증 처리기](#the-email-verification-handler)
    - [인증 이메일 재발송](#resending-the-verification-email)
    - [라우트 보호](#protecting-routes)
- [커스터마이징](#customization)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

많은 웹 애플리케이션에서는 사용자가 애플리케이션을 사용하기 전에 이메일 주소를 인증하도록 요구합니다. 라라벨은 매번 직접 이 기능을 구현할 필요 없이, 이메일 인증 요청 전송과 검증을 편리하게 처리할 수 있는 기본 서비스를 제공합니다.

> [!NOTE]
> 빠르게 시작하고 싶으신가요? 새로운 라라벨 애플리케이션에서 [라라벨 애플리케이션 스타터 키트](/docs/starter-kits)를 설치해 보세요. 스타터 키트는 이메일 인증을 포함한 전체 인증 시스템의 뼈대를 자동으로 만들어줍니다.

<a name="model-preparation"></a>
### 모델 준비

시작하기 전에, `App\Models\User` 모델이 `Illuminate\Contracts\Auth\MustVerifyEmail` 계약을 구현하고 있는지 확인해야 합니다.

```php
<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements MustVerifyEmail
{
    use Notifiable;

    // ...
}
```

이 인터페이스를 모델에 추가하면, 신규로 회원가입한 사용자에게 이메일 인증 링크가 자동으로 포함된 이메일이 전송됩니다. 이는 라라벨이 `Illuminate\Auth\Events\Registered` 이벤트에 대해 `Illuminate\Auth\Listeners\SendEmailVerificationNotification` [리스너](/docs/events)를 자동으로 등록하기 때문에 별도의 설정 없이 동작합니다.

만약 [스타터 키트](/docs/starter-kits)가 아닌 직접 회원가입 기능을 구현하는 경우, 사용자의 회원가입이 성공한 후 `Illuminate\Auth\Events\Registered` 이벤트를 직접 발생시켜야 합니다.

```php
use Illuminate\Auth\Events\Registered;

event(new Registered($user));
```

<a name="database-preparation"></a>
### 데이터베이스 준비

다음으로, `users` 테이블에는 사용자의 이메일 인증 시각을 저장할 `email_verified_at` 컬럼이 있어야 합니다. 보통 이 컬럼은 라라벨의 기본 `0001_01_01_000000_create_users_table.php` 데이터베이스 마이그레이션 파일에 포함되어 있습니다.

<a name="verification-routing"></a>
## 라우팅

이메일 인증을 올바르게 구현하려면 세 가지 라우트를 정의해야 합니다.  
첫 번째로, 회원가입 후 라라벨이 전송한 인증 이메일의 링크를 클릭하라는 알림을 사용자에게 보여주는 라우트가 필요합니다.

두 번째로, 사용자가 이메일에 포함된 인증 링크를 클릭할 때 처리하는 라우트가 필요합니다.

세 번째로, 사용자가 인증 링크를 분실했을 경우 인증 메일을 다시 받을 수 있도록, 인증 메일을 재발송하는 라우트가 필요합니다.

<a name="the-email-verification-notice"></a>
### 이메일 인증 알림 페이지

앞서 언급했듯이, 회원가입 후 라라벨이 이메일로 보낸 인증 링크를 클릭하라는 안내 메시지를 반환하는 라우트를 만들어야 합니다. 사용자가 이메일 인증을 완료하지 않은 상태로 애플리케이션의 다른 영역에 접근하려 할 때 이 뷰가 보여집니다. `App\Models\User` 모델에 `MustVerifyEmail` 인터페이스만 구현되어 있다면, 인증 링크는 자동으로 사용자에게 이메일로 전송됩니다.

```php
Route::get('/email/verify', function () {
    return view('auth.verify-email');
})->middleware('auth')->name('verification.notice');
```

이메일 인증 안내를 반환하는 라우트의 이름은 반드시 `verification.notice`여야 합니다. 이 이름이 중요한 이유는, 라라벨에 기본 탑재된 `verified` 미들웨어가 사용자가 이메일을 인증하지 않았을 때 자동으로 이 라우트로 리다이렉션하기 때문입니다. ([라우트 보호](#protecting-routes) 참고)

> [!NOTE]
> 이메일 인증을 직접 구현할 경우, 인증 안내 페이지의 뷰 내용은 개발자가 직접 정의해야 합니다. 인증 및 인증 관련 모든 뷰가 포함된 뼈대 코드가 필요하다면 [라라벨 애플리케이션 스타터 키트](/docs/starter-kits)를 참고하세요.

<a name="the-email-verification-handler"></a>
### 이메일 인증 처리기

다음으로, 이메일에 포함된 인증 링크를 클릭할 때 요청을 처리하는 라우트를 정의해야 합니다. 이 라우트의 이름은 `verification.verify`이어야 하며, `auth`와 `signed` 미들웨어를 지정해야 합니다.

```php
use Illuminate\Foundation\Auth\EmailVerificationRequest;

Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
    $request->fulfill();

    return redirect('/home');
})->middleware(['auth', 'signed'])->name('verification.verify');
```

이 라우트를 자세히 살펴보면, 일반적인 `Illuminate\Http\Request` 대신 `EmailVerificationRequest` 타입이 사용되고 있는 걸 확인할 수 있습니다. `EmailVerificationRequest`는 라라벨에 포함된 [폼 리퀘스트](/docs/validation#form-request-validation)로, 요청의 `id`와 `hash` 파라미터를 알아서 검증해 줍니다.

그 다음으로는, 바로 `fulfill` 메서드를 호출할 수 있습니다. 이 메서드는 인증된 사용자 객체에서 `markEmailAsVerified` 메서드를 실행하고, `Illuminate\Auth\Events\Verified` 이벤트를 발생시킵니다. `markEmailAsVerified` 메서드는 기본 `App\Models\User` 모델이 상속받는 `Illuminate\Foundation\Auth\User` 클래스에서 제공됩니다. 사용자의 이메일이 인증되면 원하시는 경로로 리다이렉트할 수 있습니다.

<a name="resending-the-verification-email"></a>
### 인증 이메일 재발송

사용자가 이메일 인증 메일을 분실하거나 실수로 삭제하는 경우도 있을 수 있습니다. 이를 위해 인증 이메일을 재발송 요청할 수 있는 라우트를 정의할 수 있습니다. 이 라우트는 [인증 안내 뷰](#the-email-verification-notice)에 간단한 폼 버튼을 만들어 요청하도록 설계하는 것이 일반적입니다.

```php
use Illuminate\Http\Request;

Route::post('/email/verification-notification', function (Request $request) {
    $request->user()->sendEmailVerificationNotification();

    return back()->with('message', 'Verification link sent!');
})->middleware(['auth', 'throttle:6,1'])->name('verification.send');
```

<a name="protecting-routes"></a>
### 라우트 보호

[라우트 미들웨어](/docs/middleware)를 사용하여 이메일 인증이 완료된 사용자만 특정 라우트에 접근할 수 있도록 제한할 수 있습니다. 라라벨에는 `verified`라는 [미들웨어 별칭](/docs/middleware#middleware-aliases)이 기본 제공되며, 이는 `Illuminate\Auth\Middleware\EnsureEmailIsVerified` 미들웨어 클래스를 가리킵니다. 이 별칭은 이미 라라벨에서 자동으로 등록되어 있으므로, 미들웨어를 라우트에 붙이기만 하면 됩니다. 보통은 `auth` 미들웨어와 함께 사용합니다.

```php
Route::get('/profile', function () {
    // 인증된 사용자만 이 라우트에 접근할 수 있습니다...
})->middleware(['auth', 'verified']);
```

이 미들웨어가 지정된 라우트에 인증되지 않은 사용자가 접근하면, 자동으로 `verification.notice` [네임드 라우트](/docs/routing#named-routes)로 리다이렉트됩니다.

<a name="customization"></a>
## 커스터마이징

<a name="verification-email-customization"></a>
#### 인증 이메일 커스터마이징

기본 제공되는 이메일 인증 메일 알림은 대부분의 애플리케이션에서 충분히 사용할 수 있지만, 라라벨은 이메일 인증 메일의 내용을 개발자가 원하는 대로 커스터마이징할 수 있도록 지원합니다.

이를 위해서는 `Illuminate\Auth\Notifications\VerifyEmail` 알림에서 제공하는 `toMailUsing` 메서드에 클로저를 전달하면 됩니다. 이 클로저는 인증 알림을 받을 모델 인스턴스와, 사용자가 이메일 인증을 위해 방문해야 하는 서명된 URL을 전달받습니다. 클로저는 반드시 `Illuminate\Notifications\Messages\MailMessage` 인스턴스를 반환해야 합니다. 보통 이 코드는 애플리케이션의 `AppServiceProvider` 클래스의 `boot` 메서드에서 작성합니다.

```php
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    // ...

    VerifyEmail::toMailUsing(function (object $notifiable, string $url) {
        return (new MailMessage)
            ->subject('Verify Email Address')
            ->line('Click the button below to verify your email address.')
            ->action('Verify Email Address', $url);
    });
}
```

> [!NOTE]
> 메일 알림에 대해 더 자세히 알고 싶다면, [메일 알림 문서](/docs/notifications#mail-notifications)를 참고하세요.

<a name="events"></a>
## 이벤트

[라라벨 애플리케이션 스타터 키트](/docs/starter-kits)를 사용할 경우, 라라벨은 이메일 인증 과정에서 `Illuminate\Auth\Events\Verified` [이벤트](/docs/events)를 자동으로 발생시킵니다. 이메일 인증 처리 과정을 직접 구현하는 경우, 인증이 완료된 후 직접 이 이벤트를 발생시키는 것도 가능합니다.
