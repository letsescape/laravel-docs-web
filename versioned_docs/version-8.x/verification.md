# 이메일 인증 (Email Verification)

- [소개](#introduction)
    - [모델 준비](#model-preparation)
    - [데이터베이스 준비](#database-preparation)
- [라우팅](#verification-routing)
    - [이메일 인증 알림](#the-email-verification-notice)
    - [이메일 인증 처리](#the-email-verification-handler)
    - [인증 이메일 재전송](#resending-the-verification-email)
    - [라우트 보호하기](#protecting-routes)
- [커스터마이즈](#customization)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

많은 웹 애플리케이션에서는 사용자가 서비스를 이용하기 전에 이메일 주소를 인증하도록 요구합니다. 라라벨을 사용하면, 매번 직접 이 기능을 구현하지 않아도 되도록 이메일 인증 요청 전송과 검증을 쉽게 처리할 수 있는 내장 서비스를 제공합니다.

> [!TIP]
> 빠르게 시작하고 싶으신가요? 새로운 라라벨 애플리케이션에 [라라벨 스타터 키트](/docs/8.x/starter-kits)를 설치해보세요. 이 스타터 키트는 이메일 인증을 포함한 전체 인증 시스템을 손쉽게 구축해줍니다.

<a name="model-preparation"></a>
### 모델 준비

시작하기 전에, `App\Models\User` 모델이 `Illuminate\Contracts\Auth\MustVerifyEmail` 계약(Contract)을 구현하는지 확인해야 합니다:

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

이 인터페이스를 모델에 추가하면, 새로 가입한 사용자에게는 이메일 인증 링크가 담긴 이메일이 자동으로 전송됩니다. `App\Providers\EventServiceProvider` 파일을 살펴보면, 라라벨에는 이미 `Illuminate\Auth\Events\Registered` 이벤트에 연결된 `SendEmailVerificationNotification` [리스너](/docs/8.x/events)가 포함되어 있음을 알 수 있습니다. 이 이벤트 리스너가 사용자에게 이메일 인증 링크를 발송하는 역할을 합니다.

만약 [스타터 키트](/docs/8.x/starter-kits) 없이 직접 회원 가입 기능을 구현하고 있다면, 사용자가 회원가입을 마친 뒤 반드시 `Illuminate\Auth\Events\Registered` 이벤트를 발생시키는 코드를 추가해야 합니다:

```
use Illuminate\Auth\Events\Registered;

event(new Registered($user));
```

<a name="database-preparation"></a>
### 데이터베이스 준비

다음으로, 사용자의 이메일 인증 시각을 저장할 수 있도록 `users` 테이블에 `email_verified_at` 컬럼이 있어야 합니다. 기본적으로 라라벨이 제공하는 `users` 테이블 마이그레이션에는 이 컬럼이 이미 포함되어 있습니다. 그러므로 데이터베이스 마이그레이션만 실행하면 됩니다:

```
php artisan migrate
```

<a name="verification-routing"></a>
## 라우팅

이메일 인증을 제대로 구현하려면, 세 가지 라우트를 정의해야 합니다.  
첫 번째로, 사용자가 이메일로 받은 인증 링크를 클릭해야 한다는 안내 메시지를 보여주는 라우트가 필요합니다.

두 번째로, 사용자가 이메일에 포함된 인증 링크를 클릭했을 때 요청을 처리하는 라우트가 필요합니다.

세 번째로, 사용자가 인증 링크를 실수로 잃어버렸을 경우 인증 링크를 다시 보낼 수 있도록 도와주는 라우트가 필요합니다.

<a name="the-email-verification-notice"></a>
### 이메일 인증 알림

앞서 언급한 것처럼, 회원가입 후 라라벨이 이메일로 전송한 인증 링크를 클릭하라는 안내 메시지를 보여주는 라우트를 정의해야 합니다. 사용자가 이메일 인증을 하지 않고 애플리케이션 내 다른 페이지에 접근하려 할 때 이 뷰가 표시됩니다. 이메일 인증 링크는 `App\Models\User` 모델이 `MustVerifyEmail` 인터페이스를 구현하고 있다면 자동으로 발송됩니다:

```
Route::get('/email/verify', function () {
    return view('auth.verify-email');
})->middleware('auth')->name('verification.notice');
```

이메일 인증 알림을 반환하는 라우트의 이름은 반드시 `verification.notice`로 지정해야 합니다. 이는 [라우트 보호하기](#protecting-routes)에서 다루는 라라벨의 `verified` 미들웨어가, 사용자가 이메일 인증을 하지 않았다면 자동으로 이 이름의 라우트로 리다이렉트하기 때문입니다.

> [!TIP]
> 이메일 인증을 직접 구현할 경우, 인증 알림 뷰의 내용을 개발자가 직접 정의해야 합니다. 인증 및 이메일 인증 관련 모든 페이지가 포함된 자동화된 구조가 필요하다면 [라라벨 스타터 키트](/docs/8.x/starter-kits)를 참고하세요.

<a name="the-email-verification-handler"></a>
### 이메일 인증 처리

다음으로, 사용자가 이메일로 받은 인증 링크를 클릭할 때 발생하는 요청을 처리할 라우트를 정의해야 합니다. 이 라우트의 이름은 `verification.verify`로 지정하고, `auth`와 `signed` 미들웨어를 적용해야 합니다:

```
use Illuminate\Foundation\Auth\EmailVerificationRequest;

Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
    $request->fulfill();

    return redirect('/home');
})->middleware(['auth', 'signed'])->name('verification.verify');
```

이 라우트를 좀 더 자세히 살펴보면, 평소와는 달리 `Illuminate\Http\Request` 대신 `EmailVerificationRequest` 타입을 사용하고 있는 것을 알 수 있습니다. `EmailVerificationRequest`는 라라벨에 내장된 [폼 리퀘스트](/docs/8.x/validation#form-request-validation)입니다. 이 폼 리퀘스트가 요청에 포함된 `id`와 `hash` 파라미터의 유효성을 자동으로 검사해줍니다.

그다음, 요청 인스턴스의 `fulfill` 메서드를 바로 호출할 수 있습니다. 이 메서드는 인증된 유저의 `markEmailAsVerified` 메서드를 호출하고, 동시에 `Illuminate\Auth\Events\Verified` 이벤트를 발행합니다. `markEmailAsVerified` 메서드는 기본 `App\Models\User` 모델이 상속하는 `Illuminate\Foundation\Auth\User` 클래스에 포함되어 있습니다. 사용자의 이메일이 인증되고 나면, 원하는 페이지로 자유롭게 리다이렉트할 수 있습니다.

<a name="resending-the-verification-email"></a>
### 인증 이메일 재전송

사용자가 이메일 인증 메일을 실수로 잃어버렸거나 삭제한 경우도 있을 수 있습니다. 이런 상황을 대비해 인증 이메일을 다시 요청할 수 있는 라우트를 추가할 수 있습니다. 이 라우트는 [인증 알림 뷰](#the-email-verification-notice)에서 간단한 폼 버튼을 이용해 동작하도록 구성할 수 있습니다:

```
use Illuminate\Http\Request;

Route::post('/email/verification-notification', function (Request $request) {
    $request->user()->sendEmailVerificationNotification();

    return back()->with('message', 'Verification link sent!');
})->middleware(['auth', 'throttle:6,1'])->name('verification.send');
```

<a name="protecting-routes"></a>
### 라우트 보호하기

[라우트 미들웨어](/docs/8.x/middleware)를 이용해, 이메일 인증이 완료된 사용자만 특정 라우트에 접근할 수 있도록 제한할 수 있습니다. 라라벨에는 `Illuminate\Auth\Middleware\EnsureEmailIsVerified` 클래스를 참조하는 `verified` 미들웨어가 기본 제공됩니다. 이 미들웨어는 이미 애플리케이션의 HTTP 커널에 등록되어 있으므로, 라우트 정의 시 미들웨어만 지정해주면 됩니다:

```
Route::get('/profile', function () {
    // 인증된 사용자만 이 라우트에 접근할 수 있습니다...
})->middleware('verified');
```

아직 인증이 완료되지 않은 사용자가 이 미들웨어가 적용된 라우트에 접근하면, 자동으로 `verification.notice` [이름이 지정된 라우트](/docs/8.x/routing#named-routes)로 리다이렉트됩니다.

<a name="customization"></a>
## 커스터마이즈

<a name="verification-email-customization"></a>
#### 인증 이메일 커스터마이즈

기본 제공되는 이메일 인증 알림은 대부분의 애플리케이션에 충분하지만, 이메일 메시지의 내용을 커스터마이즈할 수도 있습니다.

먼저, `Illuminate\Auth\Notifications\VerifyEmail` 알림 클래스에서 제공하는 `toMailUsing` 메서드에 클로저(익명 함수)를 전달하면 됩니다. 이 클로저는 알림을 받을 대상 모델 인스턴스와, 사용자가 인증해야 할 서명된 이메일 인증 URL을 인자로 받습니다. 그리고 이 함수는 `Illuminate\Notifications\Messages\MailMessage` 인스턴스를 반환해야 합니다. 일반적으로, 이 코드는 애플리케이션의 `App\Providers\AuthServiceProvider` 클래스의 `boot` 메서드에서 호출하는 것이 좋습니다:

```
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * Register any authentication / authorization services.
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

> [!TIP]
> 메일 알림에 대해 더 자세히 알고 싶다면, [메일 알림 공식 문서](/docs/8.x/notifications#mail-notifications)를 참고하세요.

<a name="events"></a>
## 이벤트

[라라벨 스타터 키트](/docs/8.x/starter-kits)를 사용할 때, 라라벨은 이메일 인증 과정 중에 [이벤트](/docs/8.x/events)를 발생시킵니다. 직접 인증 처리를 구현하는 경우에도, 인증 완료 후에 이러한 이벤트를 수동으로 발생시킬 수 있습니다. 애플리케이션의 `EventServiceProvider`에 리스너를 등록해서 원하는 동작을 연결할 수 있습니다:

```
/**
 * The event listener mappings for the application.
 *
 * @var array
 */
protected $listen = [
    'Illuminate\Auth\Events\Verified' => [
        'App\Listeners\LogVerifiedUser',
    ],
];
```