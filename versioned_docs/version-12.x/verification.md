# 이메일 인증 (Email Verification)

- [소개](#introduction)
    - [모델 준비](#model-preparation)
    - [데이터베이스 준비](#database-preparation)
- [라우팅](#verification-routing)
    - [이메일 인증 안내](#the-email-verification-notice)
    - [이메일 인증 처리](#the-email-verification-handler)
    - [인증 이메일 재전송](#resending-the-verification-email)
    - [라우트 보호하기](#protecting-routes)
- [커스터마이즈](#customization)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

많은 웹 애플리케이션에서는 사용자가 애플리케이션을 이용하기 전에 이메일 주소를 인증하도록 요구합니다. 라라벨은 이 기능을 애플리케이션마다 다시 구현할 필요 없이, 인증 이메일 발송 및 검증을 위한 편리한 내장 서비스를 제공합니다.

> [!NOTE]
> 빠르게 시작하고 싶으신가요? 새 라라벨 애플리케이션에 [라라벨 애플리케이션 스타터 킷](/docs/12.x/starter-kits)을 설치해 보세요. 스타터 킷은 이메일 인증을 포함한 전체 인증 시스템의 스캐폴딩을 자동으로 설정해줍니다.

<a name="model-preparation"></a>
### 모델 준비

시작에 앞서, 여러분의 `App\Models\User` 모델이 `Illuminate\Contracts\Auth\MustVerifyEmail` 계약을 구현하고 있는지 확인하세요:

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

이 인터페이스를 모델에 추가하면, 신규로 회원 가입한 사용자에게 이메일 인증 링크가 담긴 이메일이 자동으로 전송됩니다. 이 과정은 라라벨이 `Illuminate\Auth\Events\Registered` 이벤트에 대해 `Illuminate\Auth\Listeners\SendEmailVerificationNotification` [리스너](/docs/12.x/events)를 자동으로 등록해두기 때문에 별도의 처리가 필요 없습니다.

만약 [스타터 킷](/docs/12.x/starter-kits)이 아닌, 직접 회원가입 기능을 구현하고 계신 경우에는, 사용자의 회원가입이 성공적으로 완료된 뒤 반드시 `Illuminate\Auth\Events\Registered` 이벤트를 디스패치 해야 합니다:

```php
use Illuminate\Auth\Events\Registered;

event(new Registered($user));
```

<a name="database-preparation"></a>
### 데이터베이스 준비

다음으로, 사용자 이메일 인증이 완료된 날짜와 시간을 저장하기 위해 `users` 테이블에 `email_verified_at` 컬럼이 포함되어 있어야 합니다. 이 컬럼은 라라벨의 기본 `0001_01_01_000000_create_users_table.php` 마이그레이션 파일에 이미 포함되어 있습니다.

<a name="verification-routing"></a>
## 라우팅

이메일 인증을 정상적으로 구현하려면 세 가지 라우트를 정의해야 합니다.  
첫 번째로, 사용자에게 인증 이메일 내 링크를 클릭하라는 안내를 보여주는 라우트가 필요합니다. 이 라우트는 회원가입 후 라라벨이 발송한 인증 이메일에서 안내 메시지를 표시하는 역할을 합니다.

두 번째로, 사용자가 이메일에 담긴 인증 링크를 클릭할 때 해당 요청을 처리하는 라우트가 필요합니다.

세 번째로, 사용자가 인증 링크를 분실했을 때 인증 이메일을 다시 받을 수 있도록 인증 링크를 재전송하는 라우트를 준비해야 합니다.

<a name="the-email-verification-notice"></a>
### 이메일 인증 안내

이미 앞서 언급했듯, 사용자가 이메일로 받은 인증 링크를 클릭하라는 안내 메시지를 보여주는 뷰를 반환하는 라우트를 정의해야 합니다.  
이 뷰는 사용자가 이메일을 인증하지 않은 채로 애플리케이션의 다른 영역에 접근하려 할 때 표시됩니다.  
이메일 인증 링크는 `App\Models\User` 모델이 `MustVerifyEmail` 인터페이스를 구현하고 있으면 자동으로 사용자에게 발송됩니다:

```php
Route::get('/email/verify', function () {
    return view('auth.verify-email');
})->middleware('auth')->name('verification.notice');
```

이메일 인증 안내를 반환하는 라우트는 반드시 `verification.notice`라는 이름으로 지정해야 합니다. 실제로 라라벨에 내장된 [`verified` 미들웨어](#protecting-routes)는 사용자가 이메일을 인증하지 않은 상태라면 자동으로 이 라우트로 리디렉션하기 때문입니다.

> [!NOTE]
> 이메일 인증을 직접 구현할 경우, 인증 안내 뷰의 내용은 여러분이 직접 정의해야 합니다. 모든 인증 및 인증 관련 뷰를 포함한 스캐폴딩이 필요하다면 [라라벨 애플리케이션 스타터 킷](/docs/12.x/starter-kits)을 확인해 보세요.

<a name="the-email-verification-handler"></a>
### 이메일 인증 처리

다음으로, 사용자가 이메일로 받은 인증 링크를 클릭할 때 해당 요청을 처리할 라우트를 정의해야 합니다.  
이 라우트는 `verification.verify`라는 이름을 갖고, `auth`와 `signed` 미들웨어가 적용되어야 합니다:

```php
use Illuminate\Foundation\Auth\EmailVerificationRequest;

Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
    $request->fulfill();

    return redirect('/home');
})->middleware(['auth', 'signed'])->name('verification.verify');
```

이 라우트의 동작을 좀 더 자세히 살펴보면, 일반적인 `Illuminate\Http\Request` 인스턴스 대신에 `EmailVerificationRequest` 타입의 요청 객체를 사용한다는 점을 확인할 수 있습니다.  
`EmailVerificationRequest`는 라라벨에서 제공하는 [폼 요청](/docs/12.x/validation#form-request-validation)으로, 해당 요청의 `id`와 `hash` 파라미터에 대한 검증을 자동으로 처리해줍니다.

그 다음으로는 요청 객체의 `fulfill` 메서드를 바로 호출할 수 있습니다.  
이 메서드는 인증된 사용자의 `markEmailAsVerified` 메서드를 실행하고, `Illuminate\Auth\Events\Verified` 이벤트를 디스패치합니다.  
`markEmailAsVerified` 메서드는 `Illuminate\Foundation\Auth\User` 기본 클래스에서 제공되므로 기본 `App\Models\User` 모델에서 바로 사용할 수 있습니다. 이메일 인증이 완료되면 사용자를 원하는 위치로 리디렉션할 수 있습니다.

<a name="resending-the-verification-email"></a>
### 인증 이메일 재전송

사용자가 이메일 인증 메일을 잃어버리거나 실수로 삭제하는 경우가 있을 수 있습니다. 이를 위해 인증 이메일을 다시 요청할 수 있는 라우트를 정의할 수 있습니다.  
그리고 여러분의 [인증 안내 뷰](#the-email-verification-notice) 내에 간단한 폼 버튼을 추가하여 이 라우트로 요청을 보낼 수 있습니다:

```php
use Illuminate\Http\Request;

Route::post('/email/verification-notification', function (Request $request) {
    $request->user()->sendEmailVerificationNotification();

    return back()->with('message', 'Verification link sent!');
})->middleware(['auth', 'throttle:6,1'])->name('verification.send');
```

<a name="protecting-routes"></a>
### 라우트 보호하기

[라우트 미들웨어](/docs/12.x/middleware)를 사용하면 인증이 완료된 사용자만 특정 라우트에 접근할 수 있도록 제한할 수 있습니다.  
라라벨에는 이미 `verified`라는 [미들웨어 별칭](/docs/12.x/middleware#middleware-aliases)이 등록되어 있는데, 이는 `Illuminate\Auth\Middleware\EnsureEmailIsVerified` 미들웨어 클래스의 별칭입니다.  
별도의 등록 과정 없이, 라우트 정의에 `verified` 미들웨어를 추가하기만 하면 됩니다. 보통은 `auth` 미들웨어와 함께 사용합니다:

```php
Route::get('/profile', function () {
    // 이 라우트는 이메일 인증이 완료된 사용자만 접근할 수 있습니다...
})->middleware(['auth', 'verified']);
```

만약 이메일 인증이 완료되지 않은 사용자가 이 미들웨어가 할당된 라우트에 접근하려고 하면, 자동으로 `verification.notice` [네임드 라우트](/docs/12.x/routing#named-routes)로 리디렉션됩니다.

<a name="customization"></a>
## 커스터마이즈

<a name="verification-email-customization"></a>
#### 인증 이메일 커스터마이즈

라라벨에서 기본 제공하는 이메일 인증 알림은 대부분의 애플리케이션에서 충분히 사용할 수 있지만, 이메일 인증 메일 메시지의 내용을 커스터마이즈하는 것도 가능합니다.

이를 위해서는 `Illuminate\Auth\Notifications\VerifyEmail` 알림에서 제공하는 `toMailUsing` 메서드를 사용해 클로저를 전달하면 됩니다.  
이 클로저는 알림을 받는 모델 인스턴스(`$notifiable`)와, 사용자가 클릭해야 하는 서명된 이메일 인증 URL(`$url`) 두 가지 인자를 전달받습니다.  
반환값으로는 `Illuminate\Notifications\Messages\MailMessage` 인스턴스를 반환해야 하며, 보통은 애플리케이션의 `AppServiceProvider` 클래스의 `boot` 메서드에서 `toMailUsing`을 호출합니다:

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
> 메일 알림에 대해 더 알아보고 싶다면 [메일 알림 문서](/docs/12.x/notifications#mail-notifications)를 참고하세요.

<a name="events"></a>
## 이벤트

[라라벨 애플리케이션 스타터 킷](/docs/12.x/starter-kits)을 사용할 경우, 라라벨은 이메일 인증 과정에서 `Illuminate\Auth\Events\Verified` [이벤트](/docs/12.x/events)를 디스패치합니다.  
인증을 직접 구현하고 있다면, 인증이 완료된 후에 이 이벤트를 직접 디스패치할 수도 있습니다.
