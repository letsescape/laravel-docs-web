# 이메일 인증 (Email Verification)

- [소개](#introduction)
    - [모델 준비](#model-preparation)
    - [데이터베이스 준비](#database-preparation)
- [라우팅](#verification-routing)
    - [이메일 인증 안내 화면](#the-email-verification-notice)
    - [이메일 인증 처리 핸들러](#the-email-verification-handler)
    - [인증 이메일 재전송](#resending-the-verification-email)
    - [라우트 보호하기](#protecting-routes)
- [커스터마이징](#customization)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

많은 웹 애플리케이션에서는 사용자가 애플리케이션을 사용하기 전에 자신의 이메일 주소를 인증하도록 요구합니다. 이러한 기능을 매번 직접 구현하지 않도록, 라라벨은 이메일 인증 요청을 보내고 처리하는 데 유용한 기본 제공 서비스를 제공합니다.

> [!NOTE]
> 빠르게 시작하고 싶으신가요? 새로 설치된 라라벨 애플리케이션에서 [라라벨 스타터 키트](/docs/9.x/starter-kits) 중 하나를 설치해 보세요. 스타터 키트는 전체 인증 시스템, 그리고 이메일 인증 기능까지 모두 자동으로 구성해 줍니다.

<a name="model-preparation"></a>
### 모델 준비

시작하기 전에, `App\Models\User` 모델이 `Illuminate\Contracts\Auth\MustVerifyEmail` 계약(인터페이스)을 구현하고 있는지 확인해야 합니다.

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

이 인터페이스를 모델에 추가하면, 새로 회원가입한 사용자에게 이메일 인증 링크가 포함된 이메일이 자동으로 전송됩니다. 실제로 애플리케이션의 `App\Providers\EventServiceProvider`를 살펴보면, 라라벨에는 이미 `Illuminate\Auth\Events\Registered` 이벤트에 연결된 `SendEmailVerificationNotification` [리스너](/docs/9.x/events)가 포함되어 있는 것을 확인할 수 있습니다. 이 이벤트 리스너가 사용자에게 이메일 인증 링크를 전송합니다.

만약 [스타터 키트](/docs/9.x/starter-kits)를 사용하지 않고 직접 회원가입 기능을 구현하는 경우, 사용자가 회원가입에 성공한 후 `Illuminate\Auth\Events\Registered` 이벤트가 반드시 디스패치(dispatch)되도록 해주어야 합니다.

```
use Illuminate\Auth\Events\Registered;

event(new Registered($user));
```

<a name="database-preparation"></a>
### 데이터베이스 준비

다음으로, `users` 테이블에 사용자의 이메일 인증 시점(날짜와 시간)을 저장할 수 있도록 `email_verified_at` 컬럼이 있어야 합니다. 기본적으로 라라벨 프레임워크에 포함된 `users` 테이블 마이그레이션에는 이미 이 컬럼이 정의되어 있습니다. 따라서 데이터베이스 마이그레이션만 실행하면 됩니다.

```shell
php artisan migrate
```

<a name="verification-routing"></a>
## 라우팅

이메일 인증을 적절하게 구현하려면 세 가지 라우트를 정의해야 합니다. 첫 번째로, 회원가입 후 라라벨에서 전송한 인증 이메일 내의 링크를 클릭하라는 안내 화면을 사용자에게 보여주는 라우트가 필요합니다.

두 번째로, 사용자가 이메일에서 제공된 인증 링크를 클릭할 때 요청을 처리하는 라우트가 있어야 합니다.

세 번째로, 사용자가 실수로 인증 링크를 분실한 경우 인증 이메일을 다시 전송하는 라우트가 필요합니다.

<a name="the-email-verification-notice"></a>
### 이메일 인증 안내 화면

앞서 설명한 것처럼, 회원가입 후 라라벨에서 보낸 이메일 내 인증 링크를 클릭하라는 안내를 담은 뷰(view)를 반환하는 라우트를 정의해야 합니다. 사용자가 이메일 인증을 완료하지 않고 애플리케이션의 다른 부분에 접근하려고 할 때 이 뷰가 표시됩니다. `App\Models\User` 모델이 `MustVerifyEmail` 인터페이스를 구현하고 있다면 이 링크는 자동으로 사용자에게 전송됩니다.

```
Route::get('/email/verify', function () {
    return view('auth.verify-email');
})->middleware('auth')->name('verification.notice');
```

이메일 인증 안내 화면을 반환하는 라우트의 이름은 반드시 `verification.notice`여야 합니다. 라라벨에 내장된 `verified` 미들웨어([자세히 보기](#protecting-routes))는 사용자가 이메일을 인증하지 않은 경우 자동으로 이 이름의 라우트로 리다이렉트하기 때문입니다.

> [!NOTE]
> 이메일 인증을 수동으로 직접 구현하는 경우, 인증 안내 화면의 뷰 내용을 직접 작성해야 합니다. 필요한 모든 인증 및 인증 관련 뷰가 포함된 기본 스캐폴딩이 필요하다면 [라라벨 스타터 키트](/docs/9.x/starter-kits)를 참고하세요.

<a name="the-email-verification-handler"></a>
### 이메일 인증 처리 핸들러

이제 사용자가 이메일로 받은 인증 링크를 클릭할 때 발생하는 요청을 처리하는 라우트를 정의해야 합니다. 이 라우트는 `verification.verify`라는 이름이어야 하며, `auth` 및 `signed` 미들웨어가 적용되어야 합니다.

```
use Illuminate\Foundation\Auth\EmailVerificationRequest;

Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
    $request->fulfill();

    return redirect('/home');
})->middleware(['auth', 'signed'])->name('verification.verify');
```

이 라우트를 자세히 살펴보면, 일반적으로 사용하는 `Illuminate\Http\Request` 대신에 `EmailVerificationRequest`를 파라미터로 사용합니다. `EmailVerificationRequest`는 라라벨에서 제공하는 [폼 요청](/docs/9.x/validation#form-request-validation)으로, 해당 요청의 `id`와 `hash` 파라미터가 올바른지 자동으로 검증해 줍니다.

그리고 나서, `fulfill` 메서드를 호출하여 인증 처리를 바로 할 수 있습니다. 이 메서드는 인증된 사용자에게 `markEmailAsVerified` 메서드를 실행하고, `Illuminate\Auth\Events\Verified` 이벤트를 디스패치합니다. `markEmailAsVerified` 메서드는 기본 `App\Models\User` 모델이 상속하는 `Illuminate\Foundation\Auth\User` 클래스에서 제공됩니다. 이메일 인증이 완료되면 사용자를 원하는 위치로 리다이렉트할 수 있습니다.

<a name="resending-the-verification-email"></a>
### 인증 이메일 재전송

때때로 사용자가 인증 이메일을 실수로 분실하거나 삭제할 수 있습니다. 이를 위해, 사용자가 직접 인증 이메일을 다시 받을 수 있도록 하는 라우트를 정의할 수 있습니다. [인증 안내 화면](#the-email-verification-notice) 뷰에 간단한 폼 전송 버튼을 추가하여 이 라우트로 요청을 보낼 수 있습니다.

```
use Illuminate\Http\Request;

Route::post('/email/verification-notification', function (Request $request) {
    $request->user()->sendEmailVerificationNotification();

    return back()->with('message', 'Verification link sent!');
})->middleware(['auth', 'throttle:6,1'])->name('verification.send');
```

<a name="protecting-routes"></a>
### 라우트 보호하기

[라우트 미들웨어](/docs/9.x/middleware)를 사용하면 인증된 사용자 중 이메일 인증이 완료된 사용자만 특정 라우트에 접근할 수 있도록 제한할 수 있습니다. 라라벨에는 `verified`라는 미들웨어가 내장되어 있으며, 이는 `Illuminate\Auth\Middleware\EnsureEmailIsVerified` 클래스를 참조합니다. 이 미들웨어는 이미 애플리케이션의 HTTP 커널에 등록되어 있으므로, 라우트 정의에서 미들웨어를 추가해주기만 하면 됩니다. 일반적으로 `auth` 미들웨어와 함께 사용됩니다.

```
Route::get('/profile', function () {
    // 이 라우트는 이메일 인증을 완료한 사용자만 접근할 수 있습니다...
})->middleware(['auth', 'verified']);
```

이 미들웨어가 적용된 라우트에 이메일 인증을 완료하지 않은 사용자가 접근하면, 자동으로 `verification.notice` [이름을 가진 라우트](/docs/9.x/routing#named-routes)로 리다이렉트됩니다.

<a name="customization"></a>
## 커스터마이징

<a name="verification-email-customization"></a>
#### 이메일 인증 메일 커스터마이즈

기본 제공되는 이메일 인증 알림만으로 대부분의 애플리케이션 요구사항을 충족할 수 있지만, 라라벨에서는 이메일 인증 메일 메시지를 원하는 대로 커스터마이즈할 수도 있습니다.

이를 위해, `Illuminate\Auth\Notifications\VerifyEmail` 노티피케이션에 있는 `toMailUsing` 메서드에 클로저를 전달하세요. 이 클로저는 알림을 받을 모델 인스턴스와 사용자가 방문해야 할 서명된(보안이 적용된) 이메일 인증 URL을 매개변수로 받습니다. 클로저에서는 `Illuminate\Notifications\Messages\MailMessage` 인스턴스를 반환해야 합니다. 일반적으로 이 메서드는 애플리케이션의 `App\Providers\AuthServiceProvider` 클래스의 `boot` 메서드 내에서 호출합니다.

```
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * 인증/인가 서비스를 등록합니다.
 *
 * @return void
 */
public function boot()
{
    // ...

    VerifyEmail::toMailUsing(function ($notifiable, $url) {
        return (new MailMessage)
            ->subject('Verify Email Address')
            ->line('Click the button below to verify your email address.')
            ->action('Verify Email Address', $url);
    });
}
```

> [!NOTE]
> 메일 알림에 대해 더 자세히 알고 싶다면 [메일 알림 문서](/docs/9.x/notifications#mail-notifications)를 참고하세요.

<a name="events"></a>
## 이벤트

[라라벨 스타터 키트](/docs/9.x/starter-kits)를 사용할 때, 라라벨은 이메일 인증 과정에서 [이벤트](/docs/9.x/events)를 디스패치합니다. 만약 이메일 인증 과정을 직접 구현한다면, 인증 절차가 완료된 후 이러한 이벤트를 직접 디스패치할 수도 있습니다. `EventServiceProvider`에서 이러한 이벤트에 리스너를 등록하여 사용할 수 있습니다.

```
use App\Listeners\LogVerifiedUser;
use Illuminate\Auth\Events\Verified;

/**
 * 애플리케이션의 이벤트 리스너 매핑.
 *
 * @var array
 */
protected $listen = [
    Verified::class => [
        LogVerifiedUser::class,
    ],
];
```