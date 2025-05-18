# 이메일 인증 (Email Verification)

- [소개](#introduction)
    - [모델 준비](#model-preparation)
    - [데이터베이스 준비](#database-preparation)
- [라우팅](#verification-routing)
    - [이메일 인증 안내](#the-email-verification-notice)
    - [이메일 인증 처리](#the-email-verification-handler)
    - [인증 이메일 재전송](#resending-the-verification-email)
    - [라우트 보호](#protecting-routes)
- [커스터마이징](#customization)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

많은 웹 애플리케이션에서는 사용자가 애플리케이션을 사용하기 전에 자신의 이메일 주소를 인증하도록 요구합니다. 라라벨은 이러한 기능을 매번 직접 구현할 필요 없이, 이메일 인증 요청을 보내고 검증하는 편리한 내장 서비스를 제공합니다.

> [!NOTE]
> 빠르게 시작하고 싶으신가요? 라라벨의 새 프로젝트에 [라라벨 애플리케이션 스타터 킷](/docs/10.x/starter-kits)을 설치해 보세요. 스타터 킷은 이메일 인증을 포함한 전체 인증 시스템 구성을 자동으로 처리해줍니다.

<a name="model-preparation"></a>
### 모델 준비

본격적으로 시작하기 전에, `App\Models\User` 모델이 `Illuminate\Contracts\Auth\MustVerifyEmail` 계약을 구현하고 있는지 확인합니다.

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

모델에 이 인터페이스를 추가하면, 새로 가입한 사용자에게 이메일 인증 링크가 자동으로 포함된 이메일이 발송됩니다. 애플리케이션의 `App\Providers\EventServiceProvider`를 살펴보면, 라라벨에는 이미 `SendEmailVerificationNotification` [리스너](/docs/10.x/events)가 `Illuminate\Auth\Events\Registered` 이벤트에 연결되어 있는 것을 확인할 수 있습니다. 이 이벤트 리스너가 사용자에게 이메일 인증 링크를 보내는 역할을 합니다.

만약 [스타터 킷](/docs/10.x/starter-kits)이 아닌 별도로 회원가입 기능을 직접 구현하는 경우, 사용자가 가입에 성공한 후 반드시 `Illuminate\Auth\Events\Registered` 이벤트를 발생시켜야 합니다.

```
use Illuminate\Auth\Events\Registered;

event(new Registered($user));
```

<a name="database-preparation"></a>
### 데이터베이스 준비

다음으로, `users` 테이블에는 사용자의 이메일이 인증된 일시를 저장할 `email_verified_at` 컬럼이 포함되어 있어야 합니다. 기본적으로 라라벨 프레임워크에 포함된 `users` 테이블 마이그레이션에는 이미 해당 컬럼이 추가되어 있습니다. 따라서 데이터베이스 마이그레이션을 실행하기만 하면 됩니다.

```shell
php artisan migrate
```

<a name="verification-routing"></a>
## 라우팅

이메일 인증 기능을 제대로 구현하려면 세 가지 라우트를 정의해야 합니다.  
첫 번째로, 회원가입 후 라라벨이 보낸 인증 이메일의 링크를 클릭하라는 안내를 사용자에게 보여줄 라우트가 필요합니다.

두 번째로, 사용자가 이메일 내 인증 링크를 클릭했을 때 처리하는 라우트가 필요합니다.

세 번째로, 사용자가 인증 링크를 분실했을 경우, 인증 링크를 다시 받을 수 있도록 요청하는 라우트가 필요합니다.

<a name="the-email-verification-notice"></a>
### 이메일 인증 안내

앞에서 언급한 대로, 사용자가 회원가입 후 라라벨이 보낸 이메일 인증 링크를 클릭하라는 안내 화면을 반환하는 라우트를 정의해야 합니다. 이 뷰는 사용자가 이메일 인증을 하지 않은 상태로 애플리케이션의 다른 기능을 이용하려고 할 때 보여집니다. `App\Models\User` 모델이 `MustVerifyEmail` 인터페이스를 구현한다면, 해당 링크가 자동으로 이메일로 전송됩니다.

```
Route::get('/email/verify', function () {
    return view('auth.verify-email');
})->middleware('auth')->name('verification.notice');
```

위와 같이 이메일 인증 안내를 반환하는 라우트의 이름은 반드시 `verification.notice`이어야 합니다. 이 이름은 중요하며, [라라벨에 기본 포함된](#protecting-routes) `verified` 미들웨어는 사용자가 이메일 인증을 완료하지 않았다면 자동으로 이 라우트로 리디렉션합니다.

> [!NOTE]
> 이메일 인증을 수동으로 구현하는 경우, 인증 안내 뷰의 내용은 직접 정의해야 합니다. 인증 및 이메일 인증 뷰를 포함한 전체 스캐폴딩이 필요하다면 [라라벨 애플리케이션 스타터 킷](/docs/10.x/starter-kits)을 확인해 보세요.

<a name="the-email-verification-handler"></a>
### 이메일 인증 처리

이제 사용자가 이메일 내 인증 링크를 클릭했을 때 요청을 처리할 라우트를 정의해야 합니다. 이 라우트의 이름은 `verification.verify`이어야 하며, `auth` 및 `signed` 미들웨어를 적용해야 합니다.

```
use Illuminate\Foundation\Auth\EmailVerificationRequest;

Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
    $request->fulfill();

    return redirect('/home');
})->middleware(['auth', 'signed'])->name('verification.verify');
```

여기서 주목해야 할 점은, 우리가 일반적으로 사용하던 `Illuminate\Http\Request` 대신 `EmailVerificationRequest` 타입의 요청 객체를 사용한다는 것입니다. `EmailVerificationRequest`는 라라벨에 내장된 [폼 리퀘스트](/docs/10.x/validation#form-request-validation) 중 하나로, 요청의 `id`와 `hash` 파라미터의 유효성 검증을 자동으로 처리해줍니다.

그 다음, 요청 객체의 `fulfill` 메서드를 바로 호출할 수 있습니다. 이 메서드는 인증된 사용자의 `markEmailAsVerified` 메서드를 호출하고, `Illuminate\Auth\Events\Verified` 이벤트를 발생시킵니다. `markEmailAsVerified` 메서드는 기본 `App\Models\User` 모델이 상속받는 `Illuminate\Foundation\Auth\User` 베이스 클래스에 포함되어 있습니다. 이메일 인증에 성공한 후에는 사용자를 원하는 위치로 리디렉션할 수 있습니다.

<a name="resending-the-verification-email"></a>
### 인증 이메일 재전송

사용자가 이메일 인증 메일을 분실하거나 실수로 삭제하는 경우도 있습니다. 이런 상황을 고려해, 사용자 본인이 인증 메일을 다시 받을 수 있도록 요청하는 라우트를 정의할 수 있습니다. 이 라우트는 [인증 안내 뷰](#the-email-verification-notice)에서 간단한 폼 버튼으로 호출할 수 있습니다.

```
use Illuminate\Http\Request;

Route::post('/email/verification-notification', function (Request $request) {
    $request->user()->sendEmailVerificationNotification();

    return back()->with('message', 'Verification link sent!');
})->middleware(['auth', 'throttle:6,1'])->name('verification.send');
```

<a name="protecting-routes"></a>
### 라우트 보호

[라우트 미들웨어](/docs/10.x/middleware)를 사용하면, 특정 라우트에 대해서 이메일 인증이 완료된 사용자만 접근하도록 제한할 수 있습니다. 라라벨에는 `verified`라는 미들웨어 별칭이 있는데, 이는 `Illuminate\Auth\Middleware\EnsureEmailIsVerified` 클래스의 별칭입니다. 이 미들웨어는 이미 애플리케이션의 HTTP 커널에 등록되어 있기 때문에, 라우트 정의에 해당 미들웨어만 추가하면 됩니다. 일반적으로는 `auth` 미들웨어와 함께 사용합니다.

```
Route::get('/profile', function () {
    // 인증된 사용자만 이 라우트에 접근할 수 있습니다...
})->middleware(['auth', 'verified']);
```

이 미들웨어가 할당된 라우트를 이메일 인증이 되지 않은 사용자가 요청할 경우, 자동으로 `verification.notice`라는 [네임드 라우트](/docs/10.x/routing#named-routes)로 리디렉션됩니다.

<a name="customization"></a>
## 커스터마이징

<a name="verification-email-customization"></a>
#### 인증 이메일 커스터마이징

기본 이메일 인증 알림만으로도 대부분의 애플리케이션 요구사항을 만족할 수 있지만, 필요에 따라 이메일 인증 메일 메시지의 내용을 커스터마이징할 수 있습니다.

먼저, `Illuminate\Auth\Notifications\VerifyEmail` 알림에서 제공하는 `toMailUsing` 메서드에 클로저(익명 함수)를 전달하면 됩니다. 이 클로저는 알림을 받는 모델 인스턴스와, 사용자가 이메일 인증을 위해 방문해야 할 서명된 URL을 인자로 받습니다. 클로저는 반드시 `Illuminate\Notifications\Messages\MailMessage` 인스턴스를 반환해야 하며, 보통은 애플리케이션의 `App\Providers\AuthServiceProvider` 클래스의 `boot` 메서드에서 `toMailUsing`을 호출하면 됩니다.

```
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * Register any authentication / authorization services.
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
> 메일 알림에 대해 더 자세히 알아보고 싶다면 [메일 알림 문서](/docs/10.x/notifications#mail-notifications)를 참고하세요.

<a name="events"></a>
## 이벤트

[라라벨 애플리케이션 스타터 킷](/docs/10.x/starter-kits)을 사용하는 경우, 라라벨은 이메일 인증 과정에서 [이벤트](/docs/10.x/events)를 발생시킵니다. 애플리케이션에서 이메일 인증을 직접 처리한다면, 인증 완료 후 이 이벤트를 직접 발생시키기를 원할 수도 있습니다. 이러한 이벤트에 리스너를 연결하려면 애플리케이션의 `EventServiceProvider`에 등록하면 됩니다.

```
use App\Listeners\LogVerifiedUser;
use Illuminate\Auth\Events\Verified;

/**
 * The event listener mappings for the application.
 *
 * @var array
 */
protected $listen = [
    Verified::class => [
        LogVerifiedUser::class,
    ],
];
```
