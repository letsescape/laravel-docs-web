# 알림 (Notifications)

- [소개](#introduction)
- [알림 생성](#generating-notifications)
- [알림 전송](#sending-notifications)
    - [Notifiable 트레이트 사용하기](#using-the-notifiable-trait)
    - [Notification 파사드 사용하기](#using-the-notification-facade)
    - [전달 채널 지정하기](#specifying-delivery-channels)
    - [알림 큐 처리하기](#queueing-notifications)
    - [온디맨드 알림](#on-demand-notifications)
- [메일 알림](#mail-notifications)
    - [메일 메시지 포맷팅](#formatting-mail-messages)
    - [발신자 커스터마이징](#customizing-the-sender)
    - [수신자 커스터마이징](#customizing-the-recipient)
    - [제목 커스터마이징](#customizing-the-subject)
    - [메일러 커스터마이징](#customizing-the-mailer)
    - [템플릿 커스터마이징](#customizing-the-templates)
    - [첨부 파일](#mail-attachments)
    - [태그 및 메타데이터 추가](#adding-tags-metadata)
    - [Symfony 메시지 커스터마이징](#customizing-the-symfony-message)
    - [Mailables 사용](#using-mailables)
    - [메일 알림 미리보기](#previewing-mail-notifications)
- [마크다운 메일 알림](#markdown-mail-notifications)
    - [메시지 생성](#generating-the-message)
    - [메시지 작성](#writing-the-message)
    - [컴포넌트 커스터마이징](#customizing-the-components)
- [데이터베이스 알림](#database-notifications)
    - [사전 준비 사항](#database-prerequisites)
    - [데이터베이스 알림 포맷팅](#formatting-database-notifications)
    - [알림 접근하기](#accessing-the-notifications)
    - [알림 읽음 처리](#marking-notifications-as-read)
- [브로드캐스트 알림](#broadcast-notifications)
    - [사전 준비 사항](#broadcast-prerequisites)
    - [브로드캐스트 알림 포맷팅](#formatting-broadcast-notifications)
    - [알림 리스닝](#listening-for-notifications)
- [SMS 알림](#sms-notifications)
    - [사전 준비 사항](#sms-prerequisites)
    - [SMS 알림 포맷팅](#formatting-sms-notifications)
    - [유니코드 콘텐츠](#unicode-content)
    - [발신 번호 커스터마이징](#customizing-the-from-number)
    - [클라이언트 참조 추가](#adding-a-client-reference)
    - [SMS 알림 라우팅](#routing-sms-notifications)
- [Slack 알림](#slack-notifications)
    - [사전 준비 사항](#slack-prerequisites)
    - [Slack 알림 포맷팅](#formatting-slack-notifications)
    - [Slack 인터랙티비티](#slack-interactivity)
    - [Slack 알림 라우팅](#routing-slack-notifications)
    - [외부 Slack 워크스페이스 알림](#notifying-external-slack-workspaces)
- [알림 현지화](#localizing-notifications)
- [테스트](#testing)
- [알림 이벤트](#notification-events)
- [커스텀 채널](#custom-channels)

<a name="introduction"></a>
## 소개

[이메일 전송](/docs/11.x/mail) 기능 외에도, 라라벨은 이메일, SMS([Vonage](https://www.vonage.com/communications-apis/) - 기존 Nexmo), [Slack](https://slack.com) 등 다양한 전달 채널을 통한 알림 전송을 지원합니다. 또한, 수십 가지의 다양한 채널로 알림을 보낼 수 있도록 [커뮤니티에서 제작한 알림 채널](https://laravel-notification-channels.com/about/#suggesting-a-new-channel)도 활발하게 운영되고 있습니다. 알림은 데이터베이스에 저장해서 웹 인터페이스에서 출력할 수도 있습니다.

일반적으로 알림은 사용자에게 애플리케이션 내에서 일어난 사건을 알리는 짧고 간단한 정보 메시지입니다. 예를 들어, 결제 시스템을 개발할 때 "청구서 결제 완료" 알림을 이메일과 SMS 채널을 통해 사용자에게 보낼 수 있습니다.

<a name="generating-notifications"></a>
## 알림 생성

라라벨에서는 각 알림이 하나의 클래스로 표현되며, 이 클래스는 주로 `app/Notifications` 디렉터리에 저장됩니다. 애플리케이션에 해당 디렉터리가 없어도 괜찮습니다. `make:notification` 아티즌 명령어를 실행하면 자동으로 생성됩니다.

```shell
php artisan make:notification InvoicePaid
```

이 명령어를 실행하면 `app/Notifications` 디렉터리 내에 새로운 알림 클래스가 생성됩니다. 각 알림 클래스에는 `via`라는 메서드와, `toMail`, `toDatabase` 등처럼 해당 채널에 맞는 메시지로 변환하는 다양한 메시지 생성 메서드가 포함됩니다.

<a name="sending-notifications"></a>
## 알림 전송

<a name="using-the-notifiable-trait"></a>
### Notifiable 트레이트 사용하기

알림을 전송하는 방법은 두 가지가 있습니다. 하나는 `Notifiable` 트레이트의 `notify` 메서드를 사용하는 것이고, 다른 하나는 `Notification` [파사드](/docs/11.x/facades)를 활용하는 방법입니다. `Notifiable` 트레이트는 기본적으로 애플리케이션의 `App\Models\User` 모델에 포함되어 있습니다.

```
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;
}
```

이 트레이트에서 제공하는 `notify` 메서드는 알림 인스턴스를 매개변수로 받습니다.

```
use App\Notifications\InvoicePaid;

$user->notify(new InvoicePaid($invoice));
```

> [!NOTE]
> `Notifiable` 트레이트는 모든 모델에 사용할 수 있습니다. 반드시 `User` 모델에만 포함시키는 것은 아닙니다.

<a name="using-the-notification-facade"></a>
### Notification 파사드 사용하기

또 다른 방법으로, `Notification` [파사드](/docs/11.x/facades)를 이용해 알림을 전송할 수 있습니다. 이 방식은 여러 개의 notifiable(알림 수신 가능) 엔티티, 예를 들어 여러 명의 사용자에게 동시에 알림을 보낼 때 유용합니다. 파사드를 사용할 때는 모든 수신자와 알림 인스턴스를 `send` 메서드에 전달하면 됩니다.

```
use Illuminate\Support\Facades\Notification;

Notification::send($users, new InvoicePaid($invoice));
```

즉시 알림을 보내고 싶을 때는 `sendNow` 메서드를 사용할 수 있습니다. 이 메서드는 알림이 `ShouldQueue` 인터페이스를 구현하더라도 즉시 전송합니다.

```
Notification::sendNow($developers, new DeploymentCompleted($deployment));
```

<a name="specifying-delivery-channels"></a>
### 전달 채널 지정하기

모든 알림 클래스는 알림을 어떤 채널로 보낼 것인지 결정하는 `via` 메서드를 가지고 있습니다. 알림은 `mail`, `database`, `broadcast`, `vonage`, `slack` 채널을 통해 전송할 수 있습니다.

> [!NOTE]
> Telegram, Pusher 같은 다른 전달 채널을 사용하고 싶다면, 커뮤니티에서 운영하는 [Laravel Notification Channels 웹사이트](http://laravel-notification-channels.com)를 참고하세요.

`via` 메서드는 `$notifiable` 인스턴스를 매개변수로 받는데, 이 객체는 알림을 전송할 대상을 의미합니다. `$notifiable`을 활용하면 알림을 어떤 채널로 보낼지 유연하게 제어할 수 있습니다.

```
/**
 * Get the notification's delivery channels.
 *
 * @return array<int, string>
 */
public function via(object $notifiable): array
{
    return $notifiable->prefers_sms ? ['vonage'] : ['mail', 'database'];
}
```

<a name="queueing-notifications"></a>
### 알림 큐 처리하기

> [!WARNING]
> 알림 큐 처리를 위해서는 먼저 큐 설정을 완료하고 [워크 커를 실행](/docs/11.x/queues#running-the-queue-worker)해야 합니다.

특정 채널에서 외부 API 호출이나 기타 작업이 필요할 경우, 알림 전송 과정에 시간이 오래 걸릴 수 있습니다. 애플리케이션의 응답 속도를 높이려면 알림에 `ShouldQueue` 인터페이스와 `Queueable` 트레이트를 추가해 큐에 작업을 맡기는 것이 좋습니다. 이 인터페이스와 트레이트는 `make:notification` 명령으로 생성된 알림 클래스에는 이미 임포트되어 있으니 바로 사용할 수 있습니다.

```
<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class InvoicePaid extends Notification implements ShouldQueue
{
    use Queueable;

    // ...
}
```

`ShouldQueue` 인터페이스를 추가하면, 기존과 동일하게 알림을 전송할 수 있습니다. 라라벨이 해당 알림 클래스에 `ShouldQueue`가 적용됐는지 감지해 자동으로 전달 작업을 큐에 등록합니다.

```
$user->notify(new InvoicePaid($invoice));
```

알림을 큐에 등록하면, 각 수신자·채널 조합마다 별도의 큐 작업이 생성됩니다. 예를 들어, 수신자가 3명이고 채널이 2개라면, 6개의 작업이 큐에 등록됩니다.

<a name="delaying-notifications"></a>
#### 알림 전송 지연시키기

알림 전송을 일정 시간 지연하고 싶을 때는, 알림 인스턴스 생성 시 `delay` 메서드를 체이닝해서 사용할 수 있습니다.

```
$delay = now()->addMinutes(10);

$user->notify((new InvoicePaid($invoice))->delay($delay));
```

또는, `delay` 메서드에 배열을 전달하여 채널별로 지연 시간을 개인화할 수도 있습니다.

```
$user->notify((new InvoicePaid($invoice))->delay([
    'mail' => now()->addMinutes(5),
    'sms' => now()->addMinutes(10),
]));
```

또는, 알림 클래스 내부에 `withDelay` 메서드를 정의하여 채널별 지연 값을 반환하도록 커스터마이징할 수도 있습니다.

```
/**
 * Determine the notification's delivery delay.
 *
 * @return array<string, \Illuminate\Support\Carbon>
 */
public function withDelay(object $notifiable): array
{
    return [
        'mail' => now()->addMinutes(5),
        'sms' => now()->addMinutes(10),
    ];
}
```

<a name="customizing-the-notification-queue-connection"></a>
#### 알림 큐 커넥션 커스터마이징

기본적으로 큐에 등록된 알림은 애플리케이션의 기본 큐 커넥션을 사용합니다. 하지만 특정 알림에서 다른 커넥션을 사용하고 싶다면, 알림 생성자에서 `onConnection` 메서드를 호출하면 됩니다.

```
<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class InvoicePaid extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct()
    {
        $this->onConnection('redis');
    }
}
```

또한, 알림에서 지원하는 각 채널별로 사용할 큐 커넥션을 다르게 지정하고 싶다면 `viaConnections` 메서드를 알림 클래스에 정의하면 됩니다. 이 메서드는 채널명과 큐 커넥션명을 페어로 묶은 배열을 반환합니다.

```
/**
 * Determine which connections should be used for each notification channel.
 *
 * @return array<string, string>
 */
public function viaConnections(): array
{
    return [
        'mail' => 'redis',
        'database' => 'sync',
    ];
}
```

<a name="customizing-notification-channel-queues"></a>
#### 알림 채널별 큐 지정하기

알림에서 지원하는 각 채널별로 어떤 큐(Queue)를 사용할지 지정하고 싶을 땐 `viaQueues` 메서드를 알림 클래스에 정의할 수 있습니다. 이 메서드는 채널명과 큐명을 묶은 배열을 반환합니다.

```
/**
 * Determine which queues should be used for each notification channel.
 *
 * @return array<string, string>
 */
public function viaQueues(): array
{
    return [
        'mail' => 'mail-queue',
        'slack' => 'slack-queue',
    ];
}
```

<a name="queued-notification-middleware"></a>
#### 큐 처리 알림에 미들웨어 적용하기

큐에 등록된 알림에도 [큐 작업처럼 미들웨어](/docs/11.x/queues#job-middleware)를 정의할 수 있습니다. 우선 알림 클래스에 `middleware` 메서드를 구현하면 됩니다. 이 메서드는 `$notifiable`, `$channel` 변수를 전달받으므로, 알림의 대상 및 채널에 따라 미들웨어를 다르게 지정할 수 있습니다.

```
use Illuminate\Queue\Middleware\RateLimited;

/**
 * Get the middleware the notification job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(object $notifiable, string $channel)
{
    return match ($channel) {
        'email' => [new RateLimited('postmark')],
        'slack' => [new RateLimited('slack')],
        default => [],
    };
}
```

<a name="queued-notifications-and-database-transactions"></a>
#### 큐 알림과 데이터베이스 트랜잭션

데이터베이스 트랜잭션 내부에서 큐 알림을 디스패치하면, 큐에서 알림을 처리하는 시점에 아직 트랜잭션이 커밋되지 않았을 수 있습니다. 그럴 경우, 트랜잭션 중 업데이트한 모델이나 레코드가 데이터베이스에 반영되지 않아 모델을 참조할 때 문제가 발생할 수 있습니다. 트랜잭션 내에서 생성된 모델·레코드 역시 데이터베이스에 존재하지 않을 수 있습니다. 이처럼 알림이 이러한 모델에 의존한다면, 알림을 처리하는 과정에서 예기치 않은 오류가 발생할 수 있습니다.

만약 큐 커넥션의 `after_commit` 설정이 `false`로 돼 있다면, 알림을 전송할 때 `afterCommit` 메서드를 호출해 해당 알림이 모든 열린 데이터베이스 트랜잭션이 커밋된 후에 디스패치하도록 지정할 수 있습니다.

```
use App\Notifications\InvoicePaid;

$user->notify((new InvoicePaid($invoice))->afterCommit());
```

또는, 알림 클래스의 생성자에서 `afterCommit` 메서드를 호출해도 됩니다.

```
<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class InvoicePaid extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct()
    {
        $this->afterCommit();
    }
}
```

> [!NOTE]
> 이러한 상황을 효과적으로 다루는 방법에 대해서는 [큐 작업과 데이터베이스 트랜잭션 문서](/docs/11.x/queues#jobs-and-database-transactions)를 참고해 주세요.

<a name="determining-if-the-queued-notification-should-be-sent"></a>
#### 큐 알림 발송 여부 결정하기

큐에 등록된 알림이 백그라운드 작업으로 디스패치된 후, 일반적으로 큐 워커(worker)가 해당 알림을 수신자에게 전송합니다.

하지만, 큐 워커가 알림을 처리하는 시점에서 알림을 전송할지 최종적으로 결정하고 싶다면, 알림 클래스에 `shouldSend` 메서드를 정의할 수 있습니다. 이 메서드가 `false`를 반환하면 해당 알림은 전송되지 않습니다.

```
/**
 * Determine if the notification should be sent.
 */
public function shouldSend(object $notifiable, string $channel): bool
{
    return $this->invoice->isPaid();
}
```

<a name="on-demand-notifications"></a>
### 온디맨드 알림

가끔 애플리케이션의 "사용자"로 저장되어 있지 않은 대상에게도 알림을 보내야 할 때가 있습니다. 이럴 때 `Notification` 파사드의 `route` 메서드를 사용해 임의의 라우팅 정보를 지정한 다음 알림을 전송할 수 있습니다.

```
use Illuminate\Broadcasting\Channel;
use Illuminate\Support\Facades\Notification;

Notification::route('mail', 'taylor@example.com')
    ->route('vonage', '5555555555')
    ->route('slack', '#slack-channel')
    ->route('broadcast', [new Channel('channel-name')])
    ->notify(new InvoicePaid($invoice));
```

만약 온디맨드 알림을 메일(`mail`) 경로로 보낼 때 수신자의 이름도 같이 제공하고 싶다면, 배열 키에 이메일 주소, 값에 이름을 넣어 전달하면 됩니다.

```
Notification::route('mail', [
    'barrett@example.com' => 'Barrett Blair',
])->notify(new InvoicePaid($invoice));
```

`routes` 메서드를 사용하면 여러 알림 채널에 대해 임시 라우팅 정보를 한 번에 지정할 수 있습니다.

```
Notification::routes([
    'mail' => ['barrett@example.com' => 'Barrett Blair'],
    'vonage' => '5555555555',
])->notify(new InvoicePaid($invoice));
```

<a name="mail-notifications"></a>
## 메일 알림

<a name="formatting-mail-messages"></a>
### 메일 메시지 포맷팅

알림을 이메일로 보낼 수 있도록 지원하려면 알림 클래스에 `toMail` 메서드를 정의해야 합니다. 이 메서드는 `$notifiable` 엔티티를 매개변수로 받고, `Illuminate\Notifications\Messages\MailMessage` 인스턴스를 반환해야 합니다.

`MailMessage` 클래스에는 거래용 메일 메시지를 손쉽게 작성할 수 있도록 도와주는 간단한 메서드들이 제공됩니다. 메일 메시지에는 여러 줄의 텍스트, 그리고 "콜 투 액션(call to action)" 버튼 등을 추가할 수 있습니다. 예시 `toMail` 메서드는 다음과 같습니다.

```
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    $url = url('/invoice/'.$this->invoice->id);

    return (new MailMessage)
        ->greeting('Hello!')
        ->line('One of your invoices has been paid!')
        ->lineIf($this->amount > 0, "Amount paid: {$this->amount}")
        ->action('View Invoice', $url)
        ->line('Thank you for using our application!');
}
```

> [!NOTE]
> 위 예시에서 `toMail` 메서드 내부에 `$this->invoice->id`를 사용하고 있습니다. 알림이 메시지를 생성하는 데 필요한 데이터라면 알림의 생성자에 전달해주면 됩니다.

이 예시에서는 인사말(`greeting`), 텍스트 한 줄(`line`), 콜 투 액션 버튼(`action`), 그리고 다시 한 줄의 텍스트를 추가했습니다. `MailMessage` 객체에서 제공하는 이러한 메서드 덕분에 거래 알림 메일을 쉽고 빠르게 포맷팅할 수 있습니다. 메일 채널은 이 메시지 요소들을 아름답고 반응형(Responsive) HTML 이메일 템플릿 및 텍스트 버전으로 변환해줍니다. 아래는 `mail` 채널로 생성된 이메일 예시입니다.

<img src="https://laravel.com/img/docs/notification-example-2.png" />

> [!NOTE]
> 메일 알림을 보낼 때는 `config/app.php` 설정 파일의 `name` 옵션을 반드시 설정하세요. 이 값은 메일 알림 메시지의 헤더와 푸터에서 사용됩니다.

<a name="error-messages"></a>
#### 오류 메시지

일부 알림은 사용자에게, 예를 들어 결제 실패 등과 같은 오류 상황을 안내합니다. 이럴 때는 메시지 빌드시 `error` 메서드를 호출해 메일 메시지가 오류임을 나타낼 수 있습니다. `error` 메서드를 사용하면 콜 투 액션 버튼이 검정색 대신 빨간색으로 표시됩니다.

```
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->error()
        ->subject('Invoice Payment Failed')
        ->line('...');
}
```

<a name="other-mail-notification-formatting-options"></a>
#### 기타 메일 알림 포맷팅 옵션

알림 클래스에 텍스트 'line'을 직접 작성하는 대신, `view` 메서드를 사용해 알림 이메일 렌더링에 사용할 커스텀 템플릿을 지정할 수 있습니다.

```
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)->view(
        'mail.invoice.paid', ['invoice' => $this->invoice]
    );
}
```

메일 메시지에 텍스트 전용 뷰를 지정하려면, `view` 메서드에 배열로 뷰 이름을 두 번째 요소로 함께 전달하면 됩니다.

```
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)->view(
        ['mail.invoice.paid', 'mail.invoice.paid-text'],
        ['invoice' => $this->invoice]
    );
}
```

또한, 메시지에 오직 텍스트 뷰만 있을 경우에는 `text` 메서드를 사용할 수도 있습니다.

```
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)->text(
        'mail.invoice.paid-text', ['invoice' => $this->invoice]
    );
}
```

<a name="customizing-the-sender"></a>
### 발신자 커스터마이징

기본적으로 메일 발신자/From 주소는 `config/mail.php` 설정 파일에서 지정합니다. 하지만, 특정 알림에 대해 별도의 발신 주소를 사용하고 싶다면 `from` 메서드로 지정할 수 있습니다.

```
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->from('barrett@example.com', 'Barrett Blair')
        ->line('...');
}
```

<a name="customizing-the-recipient"></a>
### 수신자 커스터마이징

메일 채널을 통해 알림을 보낼 때, 라라벨은 notifiable 엔티티에서 기본적으로 `email` 속성을 찾아 그 주소로 알림을 전송합니다. 이때 알림 수신에 사용할 이메일 주소를 직접 지정하고 싶다면 notifiable 엔티티에 `routeNotificationForMail` 메서드를 정의하면 됩니다.

```
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Notifications\Notification;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * Route notifications for the mail channel.
     *
     * @return  array<string, string>|string
     */
    public function routeNotificationForMail(Notification $notification): array|string
    {
        // 이메일 주소만 반환...
        return $this->email_address;

        // 이메일 주소와 이름 함께 반환...
        return [$this->email_address => $this->name];
    }
}
```

<a name="customizing-the-subject"></a>
### 제목 커스터마이징

기본적으로 메일의 제목(subject)은 알림 클래스명을 "타이틀 케이스"로 변환한 값이 됩니다. 예를 들어 클래스명이 `InvoicePaid`라면, 메일 제목은 `Invoice Paid`가 지정됩니다. 만약 원하는 제목을 직접 지정하고 싶다면, 메시지 빌드 시 `subject` 메서드를 호출하면 됩니다.

```
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->subject('Notification Subject')
        ->line('...');
}
```

<a name="customizing-the-mailer"></a>

### 메일러 커스터마이징

기본적으로 이메일 알림은 `config/mail.php` 설정 파일에 정의된 기본 메일러를 사용해서 전송됩니다. 그러나 메시지를 작성할 때 `mailer` 메서드를 사용하면 런타임에 다른 메일러를 지정할 수 있습니다.

```
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->mailer('postmark')
        ->line('...');
}
```

<a name="customizing-the-templates"></a>
### 템플릿 커스터마이징

메일 알림에서 사용하는 HTML 및 일반 텍스트 템플릿을 수정하려면, 알림 패키지의 리소스를 게시(publish)해야 합니다. 아래 명령어를 실행하면 메일 알림 템플릿이 `resources/views/vendor/notifications` 디렉터리에 저장됩니다.

```shell
php artisan vendor:publish --tag=laravel-notifications
```

<a name="mail-attachments"></a>
### 첨부파일 추가

이메일 알림에 첨부파일을 추가하려면, 메시지를 작성할 때 `attach` 메서드를 사용하면 됩니다. `attach` 메서드의 첫 번째 인수로는 첨부할 파일의 절대 경로를 전달합니다.

```
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->greeting('Hello!')
        ->attach('/path/to/file');
}
```

> [!NOTE]
> 알림 메일 메시지에서 제공되는 `attach` 메서드는 [attachable 객체](/docs/11.x/mail#attachable-objects)도 지원합니다. 자세한 내용은 [attachable 객체 공식 문서](/docs/11.x/mail#attachable-objects)를 참고하시기 바랍니다.

파일을 첨부할 때, 두 번째 인수로 배열을 전달해 표시 이름 또는 MIME 타입을 지정할 수도 있습니다.

```
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->greeting('Hello!')
        ->attach('/path/to/file', [
            'as' => 'name.pdf',
            'mime' => 'application/pdf',
        ]);
}
```

mailable 객체에 파일을 첨부하는 경우와 달리, 알림에서는 `attachFromStorage`를 직접 사용할 수 없습니다. 대신 파일 시스템 상의 절대 경로를 사용하여 `attach` 메서드를 호출해야 합니다. 또는 `toMail` 메서드에서 [mailable 객체](/docs/11.x/mail#generating-mailables)를 반환하는 방법도 있습니다.

```
use App\Mail\InvoicePaid as InvoicePaidMailable;

/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): Mailable
{
    return (new InvoicePaidMailable($this->invoice))
        ->to($notifiable->email)
        ->attachFromStorage('/path/to/file');
}
```

여러 개의 파일을 한 번에 첨부해야 할 경우에는 `attachMany` 메서드를 사용할 수 있습니다.

```
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->greeting('Hello!')
        ->attachMany([
            '/path/to/forge.svg',
            '/path/to/vapor.svg' => [
                'as' => 'Logo.svg',
                'mime' => 'image/svg+xml',
            ],
        ]);
}
```

<a name="raw-data-attachments"></a>
#### 원시 데이터 첨부

`attachData` 메서드는 바이트 문자열(raw string of bytes)을 첨부파일로 추가할 수 있습니다. 이 메서드를 사용할 때는 첨부파일의 파일명을 두 번째 인수로 전달해야 합니다.

```
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->greeting('Hello!')
        ->attachData($this->pdf, 'name.pdf', [
            'mime' => 'application/pdf',
        ]);
}
```

<a name="adding-tags-metadata"></a>
### 태그 및 메타데이터 추가

Mailgun, Postmark 같은 일부 서드파티 이메일 제공업체는 메시지 "태그"와 "메타데이터"를 지원하며, 이를 이용해 애플리케이션에서 발송한 이메일을 그룹화하거나 추적할 수 있습니다. `tag` 및 `metadata` 메서드를 통해 이메일 메시지에 태그와 메타데이터를 추가할 수 있습니다.

```
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->greeting('Comment Upvoted!')
        ->tag('upvote')
        ->metadata('comment_id', $this->comment->id);
}
```

Mailgun 드라이버를 사용하는 경우, [tags](https://documentation.mailgun.com/en/latest/user_manual.html#tagging-1) 및 [metadata](https://documentation.mailgun.com/en/latest/user_manual.html#attaching-data-to-messages)에 대한 자세한 내용은 Mailgun 공식 문서를 참고하시기 바랍니다. Postmark 역시 [tags](https://postmarkapp.com/blog/tags-support-for-smtp)와 [metadata](https://postmarkapp.com/support/article/1125-custom-metadata-faq) 지원에 관한 문서를 참고하실 수 있습니다.

Amazon SES를 사용하여 이메일을 발송하는 경우, 메시지에 [SES "tags"](https://docs.aws.amazon.com/ses/latest/APIReference/API_MessageTag.html)를 첨부하려면 `metadata` 메서드를 사용해야 합니다.

<a name="customizing-the-symfony-message"></a>
### Symfony 메시지 커스터마이즈

`MailMessage` 클래스의 `withSymfonyMessage` 메서드를 사용하면, 메시지 전송 전 Symfony Message 인스턴스에 접근해 클로저를 실행할 수 있습니다. 이를 통해 메시지가 전송되기 전에 세부적으로 원하는 설정을 적용할 수 있습니다.

```
use Symfony\Component\Mime\Email;

/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->withSymfonyMessage(function (Email $message) {
            $message->getHeaders()->addTextHeader(
                'Custom-Header', 'Header Value'
            );
        });
}
```

<a name="using-mailables"></a>
### Mailable 객체 사용하기

필요하다면 알림의 `toMail` 메서드에서 [mailable 객체](/docs/11.x/mail) 전체를 반환할 수도 있습니다. `MailMessage` 대신 `Mailable`을 반환할 때는, mailable 객체의 `to` 메서드를 사용하여 수신자를 명시해주어야 합니다.

```
use App\Mail\InvoicePaid as InvoicePaidMailable;
use Illuminate\Mail\Mailable;

/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): Mailable
{
    return (new InvoicePaidMailable($this->invoice))
        ->to($notifiable->email);
}
```

<a name="mailables-and-on-demand-notifications"></a>
#### Mailable과 온디맨드 알림

[온디맨드 알림](#on-demand-notifications)을 전송할 때, `toMail` 메서드에 주어지는 `$notifiable` 인스턴스는 `Illuminate\Notifications\AnonymousNotifiable`의 인스턴스입니다. 이 객체는 `routeNotificationFor` 메서드를 제공하며, 온디맨드 알림을 전송할 이메일 주소를 가져올 때 사용할 수 있습니다.

```
use App\Mail\InvoicePaid as InvoicePaidMailable;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Mail\Mailable;

/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): Mailable
{
    $address = $notifiable instanceof AnonymousNotifiable
        ? $notifiable->routeNotificationFor('mail')
        : $notifiable->email;

    return (new InvoicePaidMailable($this->invoice))
        ->to($address);
}
```

<a name="previewing-mail-notifications"></a>
### 메일 알림 미리보기

메일 알림 템플릿을 디자인할 때, 일반 Blade 템플릿처럼 브라우저에서 바로 렌더링된 메일 메시지를 빠르게 미리 볼 수 있으면 편리합니다. 이를 위해, 라라벨에서는 알림이 생성한 메일 메시지를 라우트 클로저나 컨트롤러에서 직접 반환할 수 있습니다. `MailMessage` 객체를 반환하면 실제 이메일 주소로 전송하지 않아도 즉시 디자인을 브라우저에서 확인할 수 있습니다.

```
use App\Models\Invoice;
use App\Notifications\InvoicePaid;

Route::get('/notification', function () {
    $invoice = Invoice::find(1);

    return (new InvoicePaid($invoice))
        ->toMail($invoice->user);
});
```

<a name="markdown-mail-notifications"></a>
## 마크다운 메일 알림

마크다운 메일 알림은 기본적으로 제공되는 메일 알림용 템플릿을 활용할 수 있으면서도, 더 길거나 커스터마이즈된 메시지를 자유롭게 작성할 수 있도록 해줍니다. 메시지가 마크다운(Markdown)으로 작성되기 때문에, 라라벨이 읽기 쉽고 반응형인 HTML 템플릿과 자동으로 생성된 일반 텍스트 버전까지 함께 렌더링해줍니다.

<a name="generating-the-message"></a>
### 메시지 생성하기

마크다운 템플릿과 함께 알림 클래스를 생성하려면, `make:notification` Artisan 명령어의 `--markdown` 옵션을 사용하면 됩니다.

```shell
php artisan make:notification InvoicePaid --markdown=mail.invoice.paid
```

다른 메일 알림과 마찬가지로, 마크다운 템플릿을 사용하는 알림도 알림 클래스 내에 `toMail` 메서드를 정의해야 합니다. 하지만, 메시지를 구성할 때에는 `line`이나 `action` 메서드 대신, 사용하려는 마크다운 템플릿의 이름을 `markdown` 메서드로 지정합니다. 템플릿에서 사용할 데이터를 배열로 두 번째 인수에 전달할 수 있습니다.

```
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    $url = url('/invoice/'.$this->invoice->id);

    return (new MailMessage)
        ->subject('Invoice Paid')
        ->markdown('mail.invoice.paid', ['url' => $url]);
}
```

<a name="writing-the-message"></a>
### 메시지 작성하기

마크다운 메일 알림은 Blade 컴포넌트와 마크다운 문법을 함께 활용합니다. 이를 통해 사용자 정의 메시지를 쉽고, 라라벨이 제공하는 여러 알림용 컴포넌트도 간단히 사용할 수 있습니다.

```blade
<x-mail::message>
# Invoice Paid

Your invoice has been paid!

<x-mail::button :url="$url">
View Invoice
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
```

<a name="button-component"></a>
#### 버튼 컴포넌트

버튼 컴포넌트는 가운데 정렬된 버튼 링크를 생성합니다. 이 컴포넌트는 `url`, 그리고 선택적으로 `color` 인자를 받을 수 있습니다. `color`는 `primary`, `green`, `red` 중에서 지정할 수 있습니다. 알림 하나에 원하는 만큼 버튼 컴포넌트를 추가할 수 있습니다.

```blade
<x-mail::button :url="$url" color="green">
View Invoice
</x-mail::button>
```

<a name="panel-component"></a>
#### 패널 컴포넌트

패널 컴포넌트는 주어진 텍스트 블록을 알림의 다른 부분과는 살짝 다른 배경색이 적용된 패널로 표시해줍니다. 사용자에게 특정 부분을 강조하고 싶을 때 유용합니다.

```blade
<x-mail::panel>
This is the panel content.
</x-mail::panel>
```

<a name="table-component"></a>
#### 테이블 컴포넌트

테이블 컴포넌트를 사용하면, 마크다운 테이블을 손쉽게 HTML 테이블로 변환할 수 있습니다. 컴포넌트 본문에 마크다운 표를 그대로 넣으면 됩니다. 컬럼 정렬도 기본 마크다운 표 정렬 문법을 그대로 지원합니다.

```blade
<x-mail::table>
| Laravel       | Table         | Example       |
| ------------- | :-----------: | ------------: |
| Col 2 is      | Centered      | $10           |
| Col 3 is      | Right-Aligned | $20           |
</x-mail::table>
```

<a name="customizing-the-components"></a>
### 컴포넌트 커스터마이징

마크다운 알림에서 사용하는 모든 컴포넌트를 직접 커스터마이즈하기 위해, 컴포넌트 파일 전체를 애플리케이션으로 내보낼 수 있습니다. 내보내려면 `laravel-mail` 태그로 `vendor:publish` Artisan 명령어를 실행합니다.

```shell
php artisan vendor:publish --tag=laravel-mail
```

이 명령어는 마크다운 메일 컴포넌트 파일을 `resources/views/vendor/mail` 디렉터리에 복사합니다. `mail` 디렉터리 안에는 `html`과 `text` 디렉터리가 있으며, 각각의 컴포넌트에 대한 HTML, 텍스트 버전이 포함되어 있습니다. 이제 원하는 대로 이 컴포넌트들을 자유롭게 커스터마이즈할 수 있습니다.

<a name="customizing-the-css"></a>
#### CSS 커스터마이징

컴포넌트를 내보낸 뒤, `resources/views/vendor/mail/html/themes` 디렉터리에는 `default.css` 파일이 생성됩니다. 이 파일의 CSS를 수정하면 스타일이 자동으로 마크다운 알림의 HTML 출력에 인라인 방식으로 적용됩니다.

라라벨의 마크다운 컴포넌트용으로 완전히 새로운 테마를 만들고 싶다면, CSS 파일을 `html/themes` 디렉터리에 추가하면 됩니다. 파일 이름을 지정해 저장한 후, 새 테마 이름을 `mail` 설정 파일의 `theme` 옵션에 반영하세요.

개별 알림에만 다른 테마를 적용하고 싶을 때는, 알림의 메일 메시지 객체에서 `theme` 메서드를 사용해 적용할 테마 이름을 명시할 수 있습니다.

```
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->theme('invoice')
        ->subject('Invoice Paid')
        ->markdown('mail.invoice.paid', ['url' => $url]);
}
```

<a name="database-notifications"></a>
## 데이터베이스 알림

<a name="database-prerequisites"></a>
### 사전 준비

`database` 알림 채널은 알림 정보를 데이터베이스 테이블에 저장합니다. 이 테이블에는 알림의 타입, 알림을 설명하는 JSON 구조 등 여러 정보가 저장됩니다.

이 테이블을 쿼리하여 애플리케이션의 UI에서 알림을 표시할 수 있습니다. 이를 위해 우선 알림을 저장할 데이터베이스 테이블을 만들어야 하며, 적절한 테이블 구조의 [마이그레이션](/docs/11.x/migrations)을 자동 생성하는 `make:notifications-table` 명령어를 사용할 수 있습니다.

```shell
php artisan make:notifications-table

php artisan migrate
```

> [!NOTE]
> 알림 엔터티가 [UUID 혹은 ULID 기본 키](/docs/11.x/eloquent#uuid-and-ulid-keys)를 사용하는 경우, 알림 테이블 마이그레이션에서 `morphs` 메서드 대신 [`uuidMorphs`](/docs/11.x/migrations#column-method-uuidMorphs) 또는 [`ulidMorphs`](/docs/11.x/migrations#column-method-ulidMorphs)를 사용해야 합니다.

<a name="formatting-database-notifications"></a>
### 데이터베이스 알림 메시지 포맷팅

알림을 데이터베이스 테이블에 저장하려면, 알림 클래스에 `toDatabase` 또는 `toArray` 메서드를 정의해야 합니다. 이 메서드에는 `$notifiable` 엔티티가 전달되며, 반드시 일반 PHP 배열을 반환해야 합니다. 반환된 배열은 JSON으로 인코딩되어 `notifications` 테이블의 `data` 컬럼에 저장됩니다. 아래는 예시 `toArray` 메서드입니다.

```
/**
 * Get the array representation of the notification.
 *
 * @return array<string, mixed>
 */
public function toArray(object $notifiable): array
{
    return [
        'invoice_id' => $this->invoice->id,
        'amount' => $this->invoice->amount,
    ];
}
```

알림이 데이터베이스에 저장되면, `type` 컬럼은 기본적으로 알림의 클래스명이 저장되고, `read_at` 컬럼은 `null`로 저장됩니다. 이러한 동작을 변경하려면 알림 클래스에 `databaseType`과 `initialDatabaseReadAtValue` 메서드를 정의할 수 있습니다.

```
use Illuminate\Support\Carbon;

/**
 * Get the notification's database type.
 */
public function databaseType(object $notifiable): string
{
    return 'invoice-paid';
}

/**
 * Get the initial value for the "read_at" column.
 */
public function initialDatabaseReadAtValue(): ?Carbon
{
    return null;
}
```

<a name="todatabase-vs-toarray"></a>
#### `toDatabase` 대 `toArray`

`toArray` 메서드는 `broadcast` 채널에서도, 프런트엔드에 전달할 데이터를 결정하는 데 사용됩니다. 만약 `database`와 `broadcast` 채널에 대해 서로 다른 배열 구조를 원한다면, `toArray` 대신 `toDatabase` 메서드를 별도로 정의해야 합니다.

<a name="accessing-the-notifications"></a>
### 알림 접근하기

알림이 데이터베이스에 저장된 후에는, notifiable 엔티티에서 알림을 편리하게 조회할 필요가 있습니다. 라라벨의 기본 `App\Models\User` 모델에 포함된 `Illuminate\Notifications\Notifiable` 트레이트에는, 해당 엔티티의 알림들을 반환하는 `notifications` [Eloquent 연관관계](/docs/11.x/eloquent-relationships)가 정의되어 있습니다. 다른 컬렉션 관계처럼 이 메서드를 사용해 알림을 가져올 수 있습니다. 알림은 기본적으로 `created_at` 타임스탬프 내림차순(최신 순)으로 정렬되어 컬렉션 앞부분에 나타납니다.

```
$user = App\Models\User::find(1);

foreach ($user->notifications as $notification) {
    echo $notification->type;
}
```

"읽지 않음(unread)" 알림만 가져오고 싶은 경우, `unreadNotifications` 연관관계를 사용할 수 있습니다. 이 역시 가장 최근 알림이 컬렉션 앞에 옵니다.

```
$user = App\Models\User::find(1);

foreach ($user->unreadNotifications as $notification) {
    echo $notification->type;
}
```

> [!NOTE]
> 자바스크립트 클라이언트에서 알림에 접근하려면, 현재 사용자 등 notifiable 엔티티에 대한 알림을 반환하는 전용 알림 컨트롤러를 정의한 뒤, 자바스크립트 클라이언트에서 해당 컨트롤러 URL로 HTTP 요청을 보내면 됩니다.

<a name="marking-notifications-as-read"></a>
### 알림 읽음 처리

일반적으로 사용자가 알림을 확인했을 때 해당 알림을 "읽음"으로 표시하고 싶을 때가 많습니다. `Illuminate\Notifications\Notifiable` 트레이트의 `markAsRead` 메서드를 사용하면, 데이터베이스 내 알림 레코드의 `read_at` 컬럼이 갱신됩니다.

```
$user = App\Models\User::find(1);

foreach ($user->unreadNotifications as $notification) {
    $notification->markAsRead();
}
```

각 알림마다 반복문을 돌리지 않고, 알림 컬렉션에 대해 바로 `markAsRead`를 사용할 수도 있습니다.

```
$user->unreadNotifications->markAsRead();
```

데이터베이스에서 알림을 불러오지 않고, 일괄 업데이트 쿼리로 모두 읽음 처리할 수도 있습니다.

```
$user = App\Models\User::find(1);

$user->unreadNotifications()->update(['read_at' => now()]);
```

알림을 완전히 삭제할 경우에는 다음과 같이 `delete` 메서드를 사용합니다.

```
$user->notifications()->delete();
```

<a name="broadcast-notifications"></a>
## 브로드캐스트 알림

<a name="broadcast-prerequisites"></a>
### 사전 준비

브로드캐스트 알림을 사용하기 전에, 라라벨의 [이벤트 브로드캐스팅](/docs/11.x/broadcasting) 서비스를 설정하고 기본 동작을 반드시 이해해두세요. 이벤트 브로드캐스팅을 통해 서버 측에서 발생하는 라라벨 이벤트에 자바스크립트 중심 프런트엔드가 실시간으로 반응할 수 있습니다.

<a name="formatting-broadcast-notifications"></a>
### 브로드캐스트 알림 메시지 포맷팅

`broadcast` 채널은 라라벨의 [이벤트 브로드캐스팅](/docs/11.x/broadcasting) 서비스를 이용해 알림을 브로드캐스팅하며, 브라우저의 자바스크립트 프런트엔드에서 실시간으로 알림을 받을 수 있게 해줍니다. 해당 알림 클래스에 `toBroadcast` 메서드를 정의하면 브로드캐스팅을 지원할 수 있습니다. 이 메서드는 `$notifiable` 엔티티를 받아서 `BroadcastMessage` 인스턴스를 반환해야 합니다. 만약 `toBroadcast` 메서드가 없다면, 브로드캐스트에 사용할 데이터는 `toArray` 메서드가 대신 사용됩니다. 반환된 데이터는 JSON으로 인코딩되어 자바스크립트 프런트엔드로 전송됩니다. 아래는 예시 `toBroadcast` 메서드입니다.

```
use Illuminate\Notifications\Messages\BroadcastMessage;

/**
 * Get the broadcastable representation of the notification.
 */
public function toBroadcast(object $notifiable): BroadcastMessage
{
    return new BroadcastMessage([
        'invoice_id' => $this->invoice->id,
        'amount' => $this->invoice->amount,
    ]);
}
```

<a name="broadcast-queue-configuration"></a>
#### 브로드캐스트 큐 설정

모든 브로드캐스트 알림은 기본적으로 큐에 등록되어 브로드캐스팅됩니다. 브로드캐스트 작업에 사용할 큐 커넥션이나 큐 이름을 지정하고 싶다면, `BroadcastMessage`의 `onConnection`, `onQueue` 메서드를 사용할 수 있습니다.

```
return (new BroadcastMessage($data))
    ->onConnection('sqs')
    ->onQueue('broadcasts');
```

<a name="customizing-the-notification-type"></a>
#### 알림 타입 커스터마이즈

데이터 외에, 모든 브로드캐스트 알림에는 알림의 전체 클래스명이 담긴 `type` 필드도 자동으로 포함됩니다. 알림의 `type`을 직접 정의하고 싶다면, 알림 클래스에 `broadcastType` 메서드를 구현하면 됩니다.

```
/**
 * Get the type of the notification being broadcast.
 */
public function broadcastType(): string
{
    return 'broadcast.message';
}
```

<a name="listening-for-notifications"></a>
### 알림 수신 대기

알림은 `{notifiable}.{id}` 형식의 프라이빗 채널을 통해 브로드캐스트됩니다. 예를 들어, ID가 `1`인 `App\Models\User` 인스턴스로 알림을 보낼 경우, 해당 알림은 `App.Models.User.1` 프라이빗 채널로 브로드캐스트됩니다. [Laravel Echo](/docs/11.x/broadcasting#client-side-installation)를 사용할 경우, 아래와 같이 `notification` 메서드로 해당 채널의 알림을 쉽게 수신할 수 있습니다.

```
Echo.private('App.Models.User.' + userId)
    .notification((notification) => {
        console.log(notification.type);
    });
```

<a name="customizing-the-notification-channel"></a>
#### 알림 채널 커스터마이즈

엔티티별 브로드캐스트 알림이 어떤 채널로 송출될지 커스터마이즈하려면, notifiable 엔티티에 `receivesBroadcastNotificationsOn` 메서드를 정의하세요.

```
<?php

namespace App\Models;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * The channels the user receives notification broadcasts on.
     */
    public function receivesBroadcastNotificationsOn(): string
    {
        return 'users.'.$this->id;
    }
}
```

<a name="sms-notifications"></a>

## SMS 알림

<a name="sms-prerequisites"></a>
### 사전 준비사항

라라벨에서 SMS 알림 전송은 [Vonage](https://www.vonage.com/) (이전 Nexmo) 서비스를 통해 지원됩니다. Vonage를 통해 알림을 전송하려면 먼저 `laravel/vonage-notification-channel` 패키지와 `guzzlehttp/guzzle` 패키지를 설치해야 합니다.

```
composer require laravel/vonage-notification-channel guzzlehttp/guzzle
```

이 패키지에는 [환경설정 파일](https://github.com/laravel/vonage-notification-channel/blob/3.x/config/vonage.php)이 포함되어 있습니다. 하지만 이 설정 파일을 애플리케이션에 직접 내보낼 필요는 없습니다. `VONAGE_KEY`와 `VONAGE_SECRET` 환경 변수를 사용해 Vonage의 퍼블릭 키와 시크릿 키를 설정하면 됩니다.

키를 정의한 후에는 기본적으로 SMS 메시지를 보낼 발신자 번호를 지정하는 `VONAGE_SMS_FROM` 환경 변수를 설정해야 합니다. 이 번호는 Vonage 콘트롤 패널에서 생성하실 수 있습니다.

```
VONAGE_SMS_FROM=15556666666
```

<a name="formatting-sms-notifications"></a>
### SMS 알림 포맷팅

알림이 SMS로 전송되는 기능을 지원하려면, 해당 알림 클래스에 `toVonage` 메서드를 정의해야 합니다. 이 메서드는 `$notifiable` 엔터티를 받아 `Illuminate\Notifications\Messages\VonageMessage` 인스턴스를 반환해야 합니다.

```
use Illuminate\Notifications\Messages\VonageMessage;

/**
 * 알림의 Vonage / SMS 표현을 반환합니다.
 */
public function toVonage(object $notifiable): VonageMessage
{
    return (new VonageMessage)
        ->content('Your SMS message content');
}
```

<a name="unicode-content"></a>
#### 유니코드 문자 사용

SMS 메시지에 유니코드 문자가 포함될 경우, `VonageMessage` 인스턴스를 만들 때 `unicode` 메서드를 함께 호출해야 합니다.

```
use Illuminate\Notifications\Messages\VonageMessage;

/**
 * 알림의 Vonage / SMS 표현을 반환합니다.
 */
public function toVonage(object $notifiable): VonageMessage
{
    return (new VonageMessage)
        ->content('Your unicode message')
        ->unicode();
}
```

<a name="customizing-the-from-number"></a>
### 발신 번호 커스터마이즈

`VONAGE_SMS_FROM` 환경 변수로 지정한 번호와 다른 번호로 일부 알림을 보내고 싶다면, `VonageMessage` 인스턴스에서 `from` 메서드를 사용할 수 있습니다.

```
use Illuminate\Notifications\Messages\VonageMessage;

/**
 * 알림의 Vonage / SMS 표현을 반환합니다.
 */
public function toVonage(object $notifiable): VonageMessage
{
    return (new VonageMessage)
        ->content('Your SMS message content')
        ->from('15554443333');
}
```

<a name="adding-a-client-reference"></a>
### 클라이언트 레퍼런스 추가

사용자, 팀, 또는 클라이언트별로 비용을 추적하고 싶다면, 알림에 "클라이언트 레퍼런스"를 추가할 수 있습니다. Vonage에서는 이 클라이언트 레퍼런스를 이용하여 특정 고객의 SMS 사용 내역을 조회할 수 있는 리포트를 생성할 수 있습니다. 클라이언트 레퍼런스는 최대 40자의 문자열이어야 합니다.

```
use Illuminate\Notifications\Messages\VonageMessage;

/**
 * 알림의 Vonage / SMS 표현을 반환합니다.
 */
public function toVonage(object $notifiable): VonageMessage
{
    return (new VonageMessage)
        ->clientReference((string) $notifiable->id)
        ->content('Your SMS message content');
}
```

<a name="routing-sms-notifications"></a>
### SMS 알림의 라우팅

Vonage 알림을 정확한 휴대폰 번호로 전송하려면, notifiable 엔터티(예: User 모델)에 `routeNotificationForVonage` 메서드를 정의해야 합니다.

```
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Notifications\Notification;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * Vonage 채널로 알림을 라우팅합니다.
     */
    public function routeNotificationForVonage(Notification $notification): string
    {
        return $this->phone_number;
    }
}
```

<a name="slack-notifications"></a>
## Slack 알림

<a name="slack-prerequisites"></a>
### 사전 준비사항

Slack 알림을 전송하기 전에, Composer를 이용해 Slack notification 채널을 설치해야 합니다.

```shell
composer require laravel/slack-notification-channel
```

또한, 사용하는 Slack 워크스페이스에 [Slack App](https://api.slack.com/apps?new_app=1)을 생성해야 합니다.

App이 생성된 동일한 Slack 워크스페이스에만 알림을 전송하려면 App에 `chat:write`, `chat:write.public`, `chat:write.customize` scope가 있는지 확인하세요. Slack App으로 메시지를 전송하고 싶다면 `chat:write:bot` scope도 필요합니다. 이 scope들은 Slack의 "OAuth & Permissions" App 관리 탭에서 추가할 수 있습니다.

이제 App의 "Bot User OAuth Token"을 복사해서 애플리케이션의 `services.php` 설정 파일의 `slack` 설정 배열에 넣어야 합니다. 이 토큰은 Slack의 "OAuth & Permissions" 탭에서 확인할 수 있습니다.

```
'slack' => [
    'notifications' => [
        'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
        'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
    ],
],
```

<a name="slack-app-distribution"></a>
#### App 배포(App Distribution)

애플리케이션이 외부 Slack 워크스페이스(즉, 여러분의 애플리케이션 사용자들이 소유한 워크스페이스)로 알림을 전송해야 하는 경우, Slack을 통해 App을 "배포(distribute)"해야 합니다. App 배포는 Slack의 "Manage Distribution" 탭에서 관리할 수 있습니다. App이 배포되면 [Socialite](/docs/11.x/socialite)를 활용해 [Slack Bot 토큰을 발급](/docs/11.x/socialite#slack-bot-scopes)받을 수 있습니다.

<a name="formatting-slack-notifications"></a>
### Slack 알림 포맷팅

알림을 Slack 메시지로 전송하도록 지원하려면 알림 클래스에 `toSlack` 메서드를 정의하세요. 이 메서드는 `$notifiable` 객체를 받아 `Illuminate\Notifications\Slack\SlackMessage` 인스턴스를 반환해야 합니다. [Slack의 Block Kit API](https://api.slack.com/block-kit)를 활용하여 풍부한 형태의 알림 메시지를 만들 수 있습니다. 아래 예제는 [Slack의 Block Kit builder](https://app.slack.com/block-kit-builder/T01KWS6K23Z#%7B%22blocks%22:%5B%7B%22type%22:%22header%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22Invoice%20Paid%22%7D%7D,%7B%22type%22:%22context%22,%22elements%22:%5B%7B%22type%22:%22plain_text%22,%22text%22:%22Customer%20%231234%22%7D%5D%7D,%7B%22type%22:%22section%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22An%20invoice%20has%20been%20paid.%22%7D,%22fields%22:%5B%7B%22type%22:%22mrkdwn%22,%22text%22:%22*Invoice%20No:*%5Cn1000%22%7D,%7B%22type%22:%22mrkdwn%22,%22text%22:%22*Invoice%20Recipient:*%5Cntaylor@laravel.com%22%7D%5D%7D,%7B%22type%22:%22divider%22%7D,%7B%22type%22:%22section%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22Congratulations!%22%7D%7D%5D%7D)에서 미리보기가 가능합니다.

```
use Illuminate\Notifications\Slack\BlockKit\Blocks\ContextBlock;
use Illuminate\Notifications\Slack\BlockKit\Blocks\SectionBlock;
use Illuminate\Notifications\Slack\BlockKit\Composites\ConfirmObject;
use Illuminate\Notifications\Slack\SlackMessage;

/**
 * 알림의 Slack 표현을 반환합니다.
 */
public function toSlack(object $notifiable): SlackMessage
{
    return (new SlackMessage)
        ->text('One of your invoices has been paid!')
        ->headerBlock('Invoice Paid')
        ->contextBlock(function (ContextBlock $block) {
            $block->text('Customer #1234');
        })
        ->sectionBlock(function (SectionBlock $block) {
            $block->text('An invoice has been paid.');
            $block->field("*Invoice No:*\n1000")->markdown();
            $block->field("*Invoice Recipient:*\ntaylor@laravel.com")->markdown();
        })
        ->dividerBlock()
        ->sectionBlock(function (SectionBlock $block) {
            $block->text('Congratulations!');
        });
}
```

<a name="using-slacks-block-kit-builder-template"></a>
#### Slack의 Block Kit Builder 템플릿 사용

Block Kit 메시지를 생성할 때 플루언트 방식의 빌더 메서드 대신, Slack의 Block Kit Builder에서 만들어진 원시 JSON payload를 `usingBlockKitTemplate` 메서드에 그대로 넘길 수도 있습니다.

```
use Illuminate\Notifications\Slack\SlackMessage;
use Illuminate\Support\Str;

/**
 * 알림의 Slack 표현을 반환합니다.
 */
public function toSlack(object $notifiable): SlackMessage
{
    $template = <<<JSON
        {
          "blocks": [
            {
              "type": "header",
              "text": {
                "type": "plain_text",
                "text": "Team Announcement"
              }
            },
            {
              "type": "section",
              "text": {
                "type": "plain_text",
                "text": "We are hiring!"
              }
            }
          ]
        }
    JSON;

    return (new SlackMessage)
        ->usingBlockKitTemplate($template);
}
```

<a name="slack-interactivity"></a>
### Slack 상호작용(Interactivity)

Slack의 Block Kit 알림 시스템은 [사용자 상호작용 처리](https://api.slack.com/interactivity/handling)와 같은 강력한 기능을 제공합니다. 이를 활용하려면 Slack App의 "Interactivity"를 활성화하고, 애플리케이션에서 제공하는 URL을 "Request URL"로 등록해야 합니다. 이 설정은 Slack의 "Interactivity & Shortcuts" App 관리 탭에서 할 수 있습니다.

아래 예제에서 `actionsBlock` 메서드를 사용하면, Slack은 사용자가 버튼을 클릭할 때 "Request URL"로 버튼을 클릭한 Slack 사용자, 버튼의 ID 등 다양한 정보를 포함한 `POST` 요청을 전송합니다. 애플리케이션은 이 데이터를 바탕으로 적합한 동작을 결정할 수 있습니다. 또한, [Slack에서 온 요청인지 검증](https://api.slack.com/authentication/verifying-requests-from-slack)해야 합니다.

```
use Illuminate\Notifications\Slack\BlockKit\Blocks\ActionsBlock;
use Illuminate\Notifications\Slack\BlockKit\Blocks\ContextBlock;
use Illuminate\Notifications\Slack\BlockKit\Blocks\SectionBlock;
use Illuminate\Notifications\Slack\SlackMessage;

/**
 * 알림의 Slack 표현을 반환합니다.
 */
public function toSlack(object $notifiable): SlackMessage
{
    return (new SlackMessage)
        ->text('One of your invoices has been paid!')
        ->headerBlock('Invoice Paid')
        ->contextBlock(function (ContextBlock $block) {
            $block->text('Customer #1234');
        })
        ->sectionBlock(function (SectionBlock $block) {
            $block->text('An invoice has been paid.');
        })
        ->actionsBlock(function (ActionsBlock $block) {
             // ID는 기본적으로 "button_acknowledge_invoice"로 지정됩니다...
            $block->button('Acknowledge Invoice')->primary();

            // ID를 수동으로 설정...
            $block->button('Deny')->danger()->id('deny_invoice');
        });
}
```

<a name="slack-confirmation-modals"></a>
#### 확인(Confirmation) 모달창

특정 행동을 수행하기 전에 사용자가 확실히 확인하도록 만들고 싶다면, 버튼을 정의할 때 `confirm` 메서드를 호출하세요. 이 메서드는 메시지와 함께 `ConfirmObject` 인스턴스를 전달하는 클로저를 인자로 받습니다.

```
use Illuminate\Notifications\Slack\BlockKit\Blocks\ActionsBlock;
use Illuminate\Notifications\Slack\BlockKit\Blocks\ContextBlock;
use Illuminate\Notifications\Slack\BlockKit\Blocks\SectionBlock;
use Illuminate\Notifications\Slack\BlockKit\Composites\ConfirmObject;
use Illuminate\Notifications\Slack\SlackMessage;

/**
 * 알림의 Slack 표현을 반환합니다.
 */
public function toSlack(object $notifiable): SlackMessage
{
    return (new SlackMessage)
        ->text('One of your invoices has been paid!')
        ->headerBlock('Invoice Paid')
        ->contextBlock(function (ContextBlock $block) {
            $block->text('Customer #1234');
        })
        ->sectionBlock(function (SectionBlock $block) {
            $block->text('An invoice has been paid.');
        })
        ->actionsBlock(function (ActionsBlock $block) {
            $block->button('Acknowledge Invoice')
                ->primary()
                ->confirm(
                    'Acknowledge the payment and send a thank you email?',
                    function (ConfirmObject $dialog) {
                        $dialog->confirm('Yes');
                        $dialog->deny('No');
                    }
                );
        });
}
```

<a name="inspecting-slack-blocks"></a>
#### Slack 블록 빠르게 확인하기

생성 중인 블록 내용을 빠르게 확인하고 싶다면 `SlackMessage` 인스턴스에 `dd` 메서드를 호출하세요. `dd` 메서드는 Slack의 [Block Kit Builder](https://app.slack.com/block-kit-builder/)에 바로 접속할 수 있는 URL을 생성해 브라우저에서 payload와 알림의 미리보기를 볼 수 있게 해줍니다. `dd` 메서드에 `true` 값을 전달하면 원시 payload도 바로 출력할 수 있습니다.

```
return (new SlackMessage)
        ->text('One of your invoices has been paid!')
        ->headerBlock('Invoice Paid')
        ->dd();
```

<a name="routing-slack-notifications"></a>
### Slack 알림의 라우팅

Slack 알림을 올바른 Slack 팀과 채널로 전송하려면 notifiable 모델에 `routeNotificationForSlack` 메서드를 정의해야 합니다. 이 메서드는 아래 세 가지 값 중 하나를 반환할 수 있습니다.

- `null` : 라우팅을 알림 클래스 자체에 위임합니다. 알림 클래스의 `to` 메서드를 활용하여 메시지를 보낼 채널을 지정할 수 있습니다.
- 문자열: 알림을 전송할 Slack 채널명(예: `#support-channel`)을 반환.
- `SlackRoute` 인스턴스: OAuth 토큰과 채널명을 함께 지정할 때 사용합니다. 주로 외부 워크스페이스로 알림을 전송할 때 사용됩니다.

예를 들어, `routeNotificationForSlack` 메서드에서 `#support-channel`을 반환하면, 애플리케이션의 `services.php`에 등록된 Bot User OAuth 토큰을 사용하는 워크스페이스의 `#support-channel`로 알림이 전송됩니다.

```
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Notifications\Notification;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * Slack 채널로 알림을 라우팅합니다.
     */
    public function routeNotificationForSlack(Notification $notification): mixed
    {
        return '#support-channel';
    }
}
```

<a name="notifying-external-slack-workspaces"></a>
### 외부 Slack 워크스페이스 알림

> [!NOTE]
> 외부 Slack 워크스페이스로 알림을 전송하기 전에, Slack App이 [배포](#slack-app-distribution)되어야 합니다.

실무에서는 애플리케이션 사용자가 소유한 Slack 워크스페이스로 알림을 전송해야 할 때가 많습니다. 이를 위해 사용자로부터 Slack OAuth 토큰을 획득해야 합니다. [Laravel Socialite](/docs/11.x/socialite)에서는 Slack 드라이버를 지원하므로, 쉽게 애플리케이션 사용자의 Slack 인증을 처리하고 [bot 토큰을 획득](/docs/11.x/socialite#slack-bot-scopes)할 수 있습니다.

bot 토큰을 받아 데이터베이스에 저장했다면, `SlackRoute::make` 메서드를 통해 해당 사용자의 워크스페이스로 알림을 직접 라우팅할 수 있습니다. 이와 더불어, 실제로 알림이 전송될 채널을 사용자가 직접 지정하도록 하는 UI를 제공하는 것이 일반적입니다.

```
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Slack\SlackRoute;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * Slack 채널로 알림을 라우팅합니다.
     */
    public function routeNotificationForSlack(Notification $notification): mixed
    {
        return SlackRoute::make($this->slack_channel, $this->slack_token);
    }
}
```

<a name="localizing-notifications"></a>
## 알림의 다국어 지원(Localizing)

라라벨에서는 알림을 HTTP 요청의 현재 로케일이 아닌 다른 언어로 전송할 수 있으며, 알림이 큐에 저장될 경우에도 해당 로케일이 유지됩니다.

`Illuminate\Notifications\Notification` 클래스의 `locale` 메서드를 통해 원하는 언어로 설정할 수 있습니다. 알림이 처리되는 동안에는 애플리케이션의 로케일이 변경되고, 알림 평가가 끝나면 다시 이전 로케일로 돌아갑니다.

```
$user->notify((new InvoicePaid($invoice))->locale('es'));
```

복수의 notifiable 엔터티에 다양한 로케일로 알림을 보낼 때는 `Notification` 파사드의 `locale` 메서드를 사용할 수 있습니다.

```
Notification::locale('es')->send(
    $users, new InvoicePaid($invoice)
);
```

<a name="user-preferred-locales"></a>
### 사용자의 선호 언어(로케일) 사용

애플리케이션에서 각 사용자의 선호 언어(로케일)를 설정해 두는 경우가 많습니다. notifiable 모델에서 `HasLocalePreference` 계약(interface)을 구현하면, 등록된 로케일을 알림 전송 시 자동으로 사용하도록 라라벨에 지시할 수 있습니다.

```
use Illuminate\Contracts\Translation\HasLocalePreference;

class User extends Model implements HasLocalePreference
{
    /**
     * 사용자의 선호 로케일을 반환합니다.
     */
    public function preferredLocale(): string
    {
        return $this->locale;
    }
}
```

해당 인터페이스를 구현하면, 라라벨은 자동으로 선호 로케일을 사용해 알림과 메일을 전송합니다. 이 경우 따로 `locale` 메서드를 호출하지 않아도 됩니다.

```
$user->notify(new InvoicePaid($invoice));
```

<a name="testing"></a>
## 테스트

알림이 실제로 전송되는 것을 방지하려면 `Notification` 파사드의 `fake` 메서드를 사용할 수 있습니다. 일반적으로 알림 전송은 테스트 대상 코드와 직접적으로 연관이 없으므로, 라라벨이 특정 알림을 보내도록 동작하도록 지시받았는지를 assert(확인)하는 것만으로도 충분합니다.

`Notification` 파사드의 `fake` 메서드 호출 이후에는, 알림이 전송되었는지, 올바른 데이터가 전달되었는지 등을 다음과 같이 검증할 수 있습니다.

```php tab=Pest
<?php

use App\Notifications\OrderShipped;
use Illuminate\Support\Facades\Notification;

test('orders can be shipped', function () {
    Notification::fake();

    // 주문 배송 작업 수행...

    // 아무 알림도 전송되지 않았는지 확인...
    Notification::assertNothingSent();

    // 지정한 사용자에게 알림이 전송되었는지 확인...
    Notification::assertSentTo(
        [$user], OrderShipped::class
    );

    // 알림이 전송되지 않았는지 확인...
    Notification::assertNotSentTo(
        [$user], AnotherNotification::class
    );

    // 지정된 횟수만큼 알림이 전송되었는지 확인...
    Notification::assertCount(3);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use App\Notifications\OrderShipped;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_orders_can_be_shipped(): void
    {
        Notification::fake();

        // 주문 배송 작업 수행...

        // 아무 알림도 전송되지 않았는지 확인...
        Notification::assertNothingSent();

        // 지정한 사용자에게 알림이 전송되었는지 확인...
        Notification::assertSentTo(
            [$user], OrderShipped::class
        );

        // 알림이 전송되지 않았는지 확인...
        Notification::assertNotSentTo(
            [$user], AnotherNotification::class
        );

        // 지정된 횟수만큼 알림이 전송되었는지 확인...
        Notification::assertCount(3);
    }
}
```

`assertSentTo` 또는 `assertNotSentTo` 메서드에 클로저(익명 함수)를 전달해, 특정 조건을 만족하는 알림이 전송되었는지(혹은 전송되지 않았는지) 확인할 수 있습니다. 하나라도 조건을 만족하는 알림이 전송됐다면 해당 검증은 성공합니다.

```
Notification::assertSentTo(
    $user,
    function (OrderShipped $notification, array $channels) use ($order) {
        return $notification->order->id === $order->id;
    }
);
```

<a name="on-demand-notifications"></a>
#### On-Demand(즉시) 알림 테스트

테스트 중인 코드가 [On-Demand 알림](#on-demand-notifications)을 전송한다면, `assertSentOnDemand` 메서드를 이용해 해당 알림이 전송되었는지 검증할 수 있습니다.

```
Notification::assertSentOnDemand(OrderShipped::class);
```

또한, 두 번째 인자로 클로저를 전달하여 On-Demand 알림이 올바른 "route" 주소로 전송되었는지 확인할 수 있습니다.

```
Notification::assertSentOnDemand(
    OrderShipped::class,
    function (OrderShipped $notification, array $channels, object $notifiable) use ($user) {
        return $notifiable->routes['mail'] === $user->email;
    }
);
```

<a name="notification-events"></a>
## 알림 이벤트

<a name="notification-sending-event"></a>
#### 알림 전송 이벤트(Notification Sending Event)

알림이 전송될 때 `Illuminate\Notifications\Events\NotificationSending` 이벤트가 알림 시스템에 의해 디스패치(dispatch)됩니다. 이 이벤트에는 "notifiable" 엔터티와 알림 인스턴스 자체가 포함됩니다. 애플리케이션에서 이 이벤트에 대한 [이벤트 리스너](/docs/11.x/events)를 작성하여 후킹할 수 있습니다.

```
use Illuminate\Notifications\Events\NotificationSending;

class CheckNotificationStatus
{
    /**
     * 전달받은 이벤트를 처리합니다.
     */
    public function handle(NotificationSending $event): void
    {
        // ...
    }
}
```

만약 `NotificationSending` 이벤트에 대한 리스너의 `handle` 메서드가 `false`를 반환하면, 알림은 실제로 전송되지 않습니다.

```
/**
 * 전달받은 이벤트를 처리합니다.
 */
public function handle(NotificationSending $event): bool
{
    return false;
}
```

이벤트 리스너 내부에서는 이벤트를 통해 `notifiable`, `notification`, `channel` 속성에 접근하여 알림 수신자 및 알림 자체에 대한 정보를 파악할 수 있습니다.

```
/**
 * 전달받은 이벤트를 처리합니다.
 */
public function handle(NotificationSending $event): void
{
    // $event->channel
    // $event->notifiable
    // $event->notification
}
```

<a name="notification-sent-event"></a>

#### NotificationSent 이벤트

알림이 발송될 때, 라라벨의 알림 시스템은 `Illuminate\Notifications\Events\NotificationSent` [이벤트](/docs/11.x/events)를 디스패치합니다. 이 이벤트에는 "notifiable" 엔터티와 해당 알림 인스턴스가 포함되어 있습니다. 애플리케이션 내에서 이 이벤트에 대한 [이벤트 리스너](/docs/11.x/events)를 생성할 수 있습니다.

```
use Illuminate\Notifications\Events\NotificationSent;

class LogNotification
{
    /**
     * Handle the given event.
     */
    public function handle(NotificationSent $event): void
    {
        // ...
    }
}
```

이벤트 리스너 내부에서는 이벤트 객체에 포함된 `notifiable`, `notification`, `channel`, `response` 속성들을 활용하여 알림 수신자나 알림 자체에 대한 다양한 정보를 확인할 수 있습니다.

```
/**
 * Handle the given event.
 */
public function handle(NotificationSent $event): void
{
    // $event->channel
    // $event->notifiable
    // $event->notification
    // $event->response
}
```

<a name="custom-channels"></a>
## 커스텀 채널

라라벨은 몇 가지 기본 알림 채널을 제공합니다. 하지만, 프로젝트에서 필요에 따라 직접 드라이버를 구현하여 다른 방식으로 알림을 전송하고 싶을 수 있습니다. 라라벨에서는 이러한 커스텀 알림 채널을 간편하게 만들 수 있습니다. 먼저, `send` 메서드를 포함하는 클래스를 정의하세요. 이 메서드는 두 개의 인수, 즉 `$notifiable`과 `$notification`을 받아야 합니다.

`send` 메서드 내에서는 알림 객체의 메서드를 호출해, 해당 채널에서 사용할 수 있는 메시지 객체를 얻은 후, 원하는 방식으로 `$notifiable` 인스턴스에 알림을 전송하면 됩니다.

```
<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

class VoiceChannel
{
    /**
     * Send the given notification.
     */
    public function send(object $notifiable, Notification $notification): void
    {
        $message = $notification->toVoice($notifiable);

        // Send notification to the $notifiable instance...
    }
}
```

이제 커스텀 알림 채널 클래스를 정의했다면, 해당 클래스명을 알림의 `via` 메서드에서 반환하면 됩니다. 이 예제에서, 알림의 `toVoice` 메서드는 음성 메시지를 표현하는 임의의 객체를 반환할 수 있습니다. 예를 들어 이 메시지를 나타낼 `VoiceMessage` 클래스를 직접 선언할 수도 있습니다.

```
<?php

namespace App\Notifications;

use App\Notifications\Messages\VoiceMessage;
use App\Notifications\VoiceChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class InvoicePaid extends Notification
{
    use Queueable;

    /**
     * Get the notification channels.
     */
    public function via(object $notifiable): string
    {
        return VoiceChannel::class;
    }

    /**
     * Get the voice representation of the notification.
     */
    public function toVoice(object $notifiable): VoiceMessage
    {
        // ...
    }
}
```