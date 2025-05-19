# 이메일 인증 (Email Verification)

- [소개](#introduction)
    - [모델 준비](#model-preparation)
    - [데이터베이스 준비](#database-preparation)
- [라우팅](#verification-routing)
    - [이메일 인증 알림](#the-email-verification-notice)
    - [이메일 인증 처리 핸들러](#the-email-verification-handler)
    - [인증 이메일 재발송](#resending-the-verification-email)
    - [라우트 보호](#protecting-routes)
- [커스터마이즈](#customization)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

많은 웹 애플리케이션에서는 사용자에게 애플리케이션을 사용하기 전에 이메일 주소를 인증하도록 요구합니다. 라라벨은 이 기능을 애플리케이션마다 직접 구현할 필요 없이, 이메일 인증 요청의 전송과 검증을 간편하게 처리할 수 있는 내장 서비스를 제공합니다.

> [!NOTE]  
> 빠르게 시작하고 싶으신가요? 새로운 라라벨 애플리케이션에 [라라벨 스타터 키트](/docs/11.x/starter-kits)를 설치해 보세요. 스타터 키트는 이메일 인증 지원을 포함하여 전체 인증 시스템을 자동으로 구성해줍니다.

<a name="model-preparation"></a>
### 모델 준비

시작하기 전에, `App\Models\User` 모델이 `Illuminate\Contracts\Auth\MustVerifyEmail` 계약을 구현하고 있는지 확인해야 합니다:

```
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

이 인터페이스를 모델에 추가하면, 새로 등록된 사용자에게 자동으로 이메일 인증 링크가 포함된 이메일이 전송됩니다. 이는 라라벨이 `Illuminate\Auth\Events\Registered` 이벤트에 대해 `Illuminate\Auth\Listeners\SendEmailVerificationNotification` [리스너](/docs/11.x/events)를 자동으로 등록하기 때문에 별도의 작업 없이 처리됩니다.

만약 [스타터 키트](/docs/11.x/starter-kits)가 아닌 직접 회원가입 로직을 구현하고 있다면, 사용자의 회원가입이 성공적으로 이루어진 후 `Illuminate\Auth\Events\Registered` 이벤트를 반드시 디스패치해야 합니다:

```
use Illuminate\Auth\Events\Registered;

event(new Registered($user));
```

<a name="database-preparation"></a>
### 데이터베이스 준비

다음으로, 사용자가 이메일 주소를 인증한 날짜와 시간을 저장하기 위해 `users` 테이블에 `email_verified_at` 컬럼이 존재해야 합니다. 보통 이는 라라벨의 기본 마이그레이션 파일인 `0001_01_01_000000_create_users_table.php`에 이미 포함되어 있습니다.

<a name="verification-routing"></a>
## 라우팅

이메일 인증을 제대로 구현하려면 총 세 개의 라우트를 정의해야 합니다.  
첫 번째로, 사용자가 회원가입 후 라라벨이 보낸 이메일 인증 링크를 클릭하도록 안내하는 알림을 보여주는 라우트가 필요합니다.

두 번째로, 사용자가 이메일 내의 인증 링크를 클릭했을 때 처리를 담당하는 라우트가 필요합니다.

세 번째로, 사용자가 처음 받은 인증 링크를 잃어버렸을 때 재전송을 요청할 수 있는 라우트가 필요합니다.

<a name="the-email-verification-notice"></a>
### 이메일 인증 알림

앞서 언급한 것처럼, 사용자가 회원가입 후 이메일로 전달받은 인증 링크를 클릭하라는 안내 메시지를 보여주는 뷰를 반환하는 라우트를 정의해야 합니다. 이 뷰는 사용자가 이메일 인증을 완료하지 않은 상태에서 애플리케이션의 다른 영역에 접근하려 할 때 표시됩니다. 참고로, `App\Models\User` 모델이 `MustVerifyEmail` 인터페이스를 구현하고 있다면 인증 링크는 사용자에게 자동으로 발송됩니다.

```
Route::get('/email/verify', function () {
    return view('auth.verify-email');
})->middleware('auth')->name('verification.notice');
```

이메일 인증 알림을 반환하는 라우트의 이름은 반드시 `verification.notice`여야 합니다. 이 이름이 중요한 이유는, 라라벨에 포함된 [`verified` 미들웨어](#protecting-routes)가 사용자가 이메일을 인증하지 않았을 경우 자동으로 이 라우트로 리다이렉트하기 때문입니다.

> [!NOTE]  
> 이메일 인증을 직접 구현하는 경우 인증 알림 뷰의 내용을 직접 정의해야 합니다. 인증과 이메일 인증에 필요한 모든 뷰가 자동으로 제공되기를 원한다면 [라라벨 스타터 키트](/docs/11.x/starter-kits)를 참고해 주세요.

<a name="the-email-verification-handler"></a>
### 이메일 인증 처리 핸들러

다음으로, 사용자에게 이메일로 전송된 인증 링크를 클릭할 때 처리를 담당하는 라우트를 정의해야 합니다. 이 라우트의 이름은 `verification.verify`여야 하며, `auth`와 `signed` 미들웨어가 적용되어야 합니다.

```
use Illuminate\Foundation\Auth\EmailVerificationRequest;

Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
    $request->fulfill();

    return redirect('/home');
})->middleware(['auth', 'signed'])->name('verification.verify');
```

여기서, 이 라우트를 자세히 살펴보면 일반적인 `Illuminate\Http\Request` 인스턴스 대신 `EmailVerificationRequest`를 사용하고 있다는 점을 알 수 있습니다.  
`EmailVerificationRequest`는 라라벨에 기본 제공되는 [폼 리퀘스트](/docs/11.x/validation#form-request-validation)로, 전달받은 `id`와 `hash` 파라미터의 유효성을 자동으로 검증해줍니다.

그 다음, 요청 객체의 `fulfill` 메서드를 호출하는 것으로 인증 처리를 바로 진행할 수 있습니다.  
이 메서드는 인증된 사용자에게 `markEmailAsVerified` 메서드를 호출하고, `Illuminate\Auth\Events\Verified` 이벤트를 디스패치합니다.  
`markEmailAsVerified` 메서드는 기본 `App\Models\User` 모델의 부모 클래스인 `Illuminate\Foundation\Auth\User`를 통해 제공됩니다.  
사용자의 이메일 인증이 완료되면 원하는 경로로 자유롭게 리다이렉트할 수 있습니다.

<a name="resending-the-verification-email"></a>
### 인증 이메일 재발송

사용자가 이메일 인증 메일을 분실하거나 실수로 삭제하는 경우가 있을 수 있습니다.  
이럴 때 사용자가 인증 이메일을 다시 받을 수 있도록 별도의 라우트를 정의할 수 있습니다.  
[이메일 인증 알림 뷰](#the-email-verification-notice)에 간단한 폼 버튼을 만들어 이 라우트로 요청을 보낼 수 있습니다.

```
use Illuminate\Http\Request;

Route::post('/email/verification-notification', function (Request $request) {
    $request->user()->sendEmailVerificationNotification();

    return back()->with('message', 'Verification link sent!');
})->middleware(['auth', 'throttle:6,1'])->name('verification.send');
```

<a name="protecting-routes"></a>
### 라우트 보호

[라우트 미들웨어](/docs/11.x/middleware)를 사용하면 인증을 마친 사용자만 특정 라우트에 접근할 수 있도록 할 수 있습니다.  
라라벨에는 `Illuminate\Auth\Middleware\EnsureEmailIsVerified` 미들웨어 클래스의 별칭인 `verified` [미들웨어 별칭](/docs/11.x/middleware#middleware-aliases)이 기본으로 등록되어 있습니다.  
따라서 해당 미들웨어를 라우트에 추가하기만 하면 됩니다. 보통 `auth` 미들웨어와 함께 사용합니다.

```
Route::get('/profile', function () {
    // 인증된 사용자만 이 라우트에 접근할 수 있습니다...
})->middleware(['auth', 'verified']);
```

아직 이메일 인증을 하지 않은 사용자가 이 미들웨어가 적용된 라우트에 접근할 경우, 자동으로 `verification.notice` [이름이 지정된 라우트](/docs/11.x/routing#named-routes)로 리다이렉트됩니다.

<a name="customization"></a>
## 커스터마이즈

<a name="verification-email-customization"></a>
#### 인증 이메일 커스터마이즈

기본 이메일 인증 알림은 대부분의 애플리케이션 요구 사항을 충족하지만, 라라벨은 이메일 인증 메일의 내용을 커스터마이즈할 수 있는 기능도 제공합니다.

먼저, `Illuminate\Auth\Notifications\VerifyEmail` 알림에서 제공하는 `toMailUsing` 메서드에 클로저를 전달해 주세요.  
이 클로저는 알림을 받는 모델 인스턴스와, 사용자가 이메일 인증을 위해 방문해야 하는 서명된 이메일 인증 URL을 매개변수로 받습니다.  
클로저는 `Illuminate\Notifications\Messages\MailMessage` 인스턴스를 반환해야 합니다.  
보통은 애플리케이션의 `AppServiceProvider` 클래스의 `boot` 메서드에서 `toMailUsing` 메서드를 호출합니다.

```
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
> 메일 알림에 대해 더 자세한 내용이 궁금하다면 [메일 알림 문서](/docs/11.x/notifications#mail-notifications)를 참고해 주세요.

<a name="events"></a>
## 이벤트

[라라벨 스타터 키트](/docs/11.x/starter-kits)를 사용하는 경우, 라라벨은 이메일 인증 과정에서 `Illuminate\Auth\Events\Verified` [이벤트](/docs/11.x/events)를 자동으로 디스패치합니다. 애플리케이션에서 이메일 인증 과정을 직접 구현할 때도, 인증 완료 후 해당 이벤트를 수동으로 디스패치하는 것이 필요할 수 있습니다.

