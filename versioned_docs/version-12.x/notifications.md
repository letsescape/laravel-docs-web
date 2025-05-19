# 알림 (Notifications)

- [소개](#introduction)
- [알림 생성하기](#generating-notifications)
- [알림 보내기](#sending-notifications)
    - [Notifiable 트레이트 사용하기](#using-the-notifiable-trait)
    - [Notification 파사드 사용하기](#using-the-notification-facade)
    - [발송 채널 지정하기](#specifying-delivery-channels)
    - [알림 큐잉하기](#queueing-notifications)
    - [온디맨드(즉석) 알림](#on-demand-notifications)
- [메일 알림](#mail-notifications)
    - [메일 메시지 포매팅](#formatting-mail-messages)
    - [발신자 커스터마이징](#customizing-the-sender)
    - [수신자 커스터마이징](#customizing-the-recipient)
    - [제목 커스터마이징](#customizing-the-subject)
    - [메일러 커스터마이징](#customizing-the-mailer)
    - [템플릿 커스터마이징](#customizing-the-templates)
    - [첨부파일](#mail-attachments)
    - [태그와 메타데이터 추가](#adding-tags-metadata)
    - [Symfony 메시지 커스터마이징](#customizing-the-symfony-message)
    - [메일러블(Mailable) 사용하기](#using-mailables)
    - [메일 알림 미리보기](#previewing-mail-notifications)
- [Markdown 메일 알림](#markdown-mail-notifications)
    - [메시지 생성하기](#generating-the-message)
    - [메시지 작성하기](#writing-the-message)
    - [컴포넌트 커스터마이징](#customizing-the-components)
- [데이터베이스 알림](#database-notifications)
    - [사전 준비 사항](#database-prerequisites)
    - [데이터베이스 알림 포매팅](#formatting-database-notifications)
    - [알림 액세스](#accessing-the-notifications)
    - [알림 읽음 처리](#marking-notifications-as-read)
- [브로드캐스트 알림](#broadcast-notifications)
    - [사전 준비 사항](#broadcast-prerequisites)
    - [브로드캐스트 알림 포매팅](#formatting-broadcast-notifications)
    - [알림 수신 대기](#listening-for-notifications)
- [SMS 알림](#sms-notifications)
    - [사전 준비 사항](#sms-prerequisites)
    - [SMS 알림 포매팅](#formatting-sms-notifications)
    - [유니코드 콘텐츠](#unicode-content)
    - ["From" 번호 커스터마이즈](#customizing-the-from-number)
    - [클라이언트 참조 추가](#adding-a-client-reference)
    - [SMS 알림 라우팅](#routing-sms-notifications)
- [Slack 알림](#slack-notifications)
    - [사전 준비 사항](#slack-prerequisites)
    - [Slack 알림 포매팅](#formatting-slack-notifications)
    - [Slack 상호작용](#slack-interactivity)
    - [Slack 알림 라우팅](#routing-slack-notifications)
    - [외부 Slack 워크스페이스 알리기](#notifying-external-slack-workspaces)
- [알림 로컬라이즈](#localizing-notifications)
- [테스트](#testing)
- [알림 이벤트](#notification-events)
- [커스텀 채널](#custom-channels)

<a name="introduction"></a>
## 소개

[이메일 전송](/docs/12.x/mail)을 지원하는 것에 더해, 라라벨은 이메일, SMS([Vonage](https://www.vonage.com/communications-apis/) - 이전 Nexmo), 그리고 [Slack](https://slack.com) 등 다양한 전달 채널을 통한 알림 전송을 지원합니다. 이 밖에도 [커뮤니티에서 제작한 다양한 알림 채널](https://laravel-notification-channels.com/about/#suggesting-a-new-channel)을 통해 수십 가지 채널로 알림을 보낼 수 있습니다! 또한 알림을 데이터베이스에 저장해서 웹 인터페이스에서 별도로 표시할 수 있습니다.

일반적으로 알림은 애플리케이션에서 발생한 특정 이벤트를 사용자에게 간단하게 안내하는 정보성 메시지입니다. 예를 들어, 요금 청구 애플리케이션을 만든다면, 사용자의 이메일과 SMS로 "인보이스 결제 완료" 알림을 보낼 수 있습니다.

<a name="generating-notifications"></a>
## 알림 생성하기

라라벨에서는 각각의 알림이 하나의 클래스로 표현되며, 보통 `app/Notifications` 디렉터리에 저장됩니다. 만약 이 디렉터리가 애플리케이션에 없다면 걱정하지 마세요. `make:notification` 아티즌 명령어를 실행하면 자동으로 생성됩니다.

```shell
php artisan make:notification InvoicePaid
```

이 명령을 실행하면 새로운 알림 클래스가 `app/Notifications` 디렉터리에 생성됩니다. 각각의 알림 클래스는 `via` 메서드와, 해당 채널에 맞춰 알림 메시지를 만들기 위한 여러 메서드(`toMail`이나 `toDatabase` 등)를 포함하고 있습니다.

<a name="sending-notifications"></a>
## 알림 보내기

<a name="using-the-notifiable-trait"></a>
### Notifiable 트레이트 사용하기

알림은 `Notifiable` 트레이트의 `notify` 메서드를 이용하거나, `Notification` [파사드](/docs/12.x/facades)를 이용해서 두 가지 방식으로 보낼 수 있습니다. 라라벨 애플리케이션의 기본 `App\Models\User` 모델에는 기본적으로 `Notifiable` 트레이트가 포함되어 있습니다.

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;
}
```

이 트레이트에서 제공하는 `notify` 메서드는 알림 인스턴스를 인수로 받습니다.

```php
use App\Notifications\InvoicePaid;

$user->notify(new InvoicePaid($invoice));
```

> [!NOTE]
> `Notifiable` 트레이트는 어떤 모델에든 사용할 수 있습니다. 꼭 `User` 모델에만 국한되지 않습니다.

<a name="using-the-notification-facade"></a>
### Notification 파사드 사용하기

또한, `Notification` [파사드](/docs/12.x/facades)를 통해 알림을 보낼 수도 있습니다. 이 방법은 여러 명의 사용자 등, 여러 notifiable 엔티티에 동시에 알림을 보내야 할 때 유용합니다. 파사드를 사용할 때는, 모든 notifiable 엔티티와 알림 인스턴스를 `send` 메서드에 전달합니다.

```php
use Illuminate\Support\Facades\Notification;

Notification::send($users, new InvoicePaid($invoice));
```

`sendNow` 메서드를 이용하면 알림을 즉시 보낼 수도 있습니다. 이 메서드는 알림이 `ShouldQueue` 인터페이스를 구현하고 있더라도 바로 전송합니다.

```php
Notification::sendNow($developers, new DeploymentCompleted($deployment));
```

<a name="specifying-delivery-channels"></a>
### 발송 채널 지정하기

모든 알림 클래스에는 해당 알림이 어떤 채널을 통해 전달될지 결정하는 `via` 메서드가 있습니다. 알림은 `mail`, `database`, `broadcast`, `vonage`, `slack` 채널 중 하나 혹은 여러 개로 보낼 수 있습니다.

> [!NOTE]
> Telegram, Pusher 등 다른 채널도 사용하고 싶다면, 커뮤니티 기반의 [Laravel Notification Channels 사이트](http://laravel-notification-channels.com)를 참고하세요.

`via` 메서드는 `$notifiable` 인스턴스를 받으며, 이것은 알림이 전송될 대상 클래스의 인스턴스입니다. `$notifiable`을 활용해 어떤 채널로 알림을 보낼지 동적으로 지정할 수 있습니다.

```php
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
### 알림 큐잉하기

> [!WARNING]
> 알림을 큐에 넣기 전에 큐 설정을 완료하고 [워커를 실행](/docs/12.x/queues#running-the-queue-worker)해야 합니다.

알림을 보내는 데 시간이 소요될 수 있는데, 특히 외부 API 호출이 필요한 채널일수록 더욱 그렇습니다. 애플리케이션의 응답 속도를 높이고 싶다면, `ShouldQueue` 인터페이스와 `Queueable` 트레이트를 알림 클래스에 추가해서 알림을 큐 처리되도록 하세요. `make:notification` 명령어로 생성한 모든 알림에는 이미 해당 인터페이스와 트레이트를 임포트할 수 있도록 되어 있으니 바로 추가해서 사용할 수 있습니다.

```php
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

`ShouldQueue` 인터페이스가 알림에 추가된 이후에는 평소처럼 알림을 보내기만 하면 됩니다. 라라벨이 자동으로 해당 알림이 큐 처리되어야 함을 감지해 큐에 넣어줍니다.

```php
$user->notify(new InvoicePaid($invoice));
```

알림을 큐잉하면, 각 수신자와 채널 조합마다 하나의 큐 작업(job)이 생성됩니다. 예를 들어, 수신자가 3명이고 채널이 2개라면 총 6개의 작업이 큐에 등록됩니다.

<a name="delaying-notifications"></a>
#### 알림 전송 지연시키기

알림 전송을 지정한 시간만큼 지연시키고 싶다면, 알림 인스턴스에 `delay` 메서드를 체이닝하면 됩니다.

```php
$delay = now()->addMinutes(10);

$user->notify((new InvoicePaid($invoice))->delay($delay));
```

특정 채널별로 지연 시간을 다르게 지정하려면 배열로 `delay` 메서드에 넘기세요.

```php
$user->notify((new InvoicePaid($invoice))->delay([
    'mail' => now()->addMinutes(5),
    'sms' => now()->addMinutes(10),
]));
```

또는, 알림 클래스 내에 `withDelay` 메서드를 직접 정의할 수도 있습니다. 이 메서드는 채널명과 지연 값을 배열로 반환해야 합니다.

```php
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
#### 알림 큐 연결(커넥션) 커스터마이즈

기본적으로 큐에 넣어진 알림은 애플리케이션의 기본 큐 연결을 사용합니다. 특정 알림에 대해 다른 큐 연결을 쓰고 싶다면, 알림 클래스의 생성자에서 `onConnection` 메서드를 호출하세요.

```php
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

또는, 알림이 지원하는 각 채널별로 다른 큐 연결을 지정하고 싶다면 `viaConnections` 메서드를 정의해서 채널명/큐 연결명 쌍의 배열을 반환하면 됩니다.

```php
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
#### 알림 채널별 큐 커스터마이즈

각 알림 채널마다 사용할 큐를 따로 지정하고 싶다면 `viaQueues` 메서드를 알림 클래스에 정의하세요. 이 메서드는 채널명/큐명 쌍의 배열을 반환해야 합니다.

```php
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
#### 큐잉된 알림 미들웨어

큐잉된 알림에는 [큐잉 작업과 똑같이 미들웨어](/docs/12.x/queues#job-middleware)를 정의할 수 있습니다. 먼저, 알림 클래스에 `middleware` 메서드를 정의하세요. 이 메서드는 `$notifiable`과 `$channel` 변수를 받아서, 알림의 도착지에 따라 반환할 미들웨어를 커스터마이즈할 수 있습니다.

```php
use Illuminate\Queue\Middleware\RateLimited;

/**
 * Get the middleware the notification job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(object $notifiable, string $channel)
{
    return match ($channel) {
        'mail' => [new RateLimited('postmark')],
        'slack' => [new RateLimited('slack')],
        default => [],
    };
}
```

<a name="queued-notifications-and-database-transactions"></a>
#### 큐잉된 알림과 데이터베이스 트랜잭션

큐잉된 알림이 데이터베이스 트랜잭션 내에서 전송될 때, 해당 트랜잭션이 커밋되기 전에 큐 워커가 알림 작업을 처리할 수 있습니다. 이런 경우, 트랜잭션 내에서 모델이나 레코드를 수정했다 하더라도 아직 실제 데이터베이스에는 반영되지 않은 상태일 수 있습니다. 또한, 트랜잭션에서 새로 생성한 모델 또는 레코드 역시 데이터베이스에 아직 존재하지 않을 수 있습니다. 만약 알림이 이러한 모델이나 레코드를 참고한다면, 예상치 못한 오류가 발생할 수 있습니다.

큐 연결의 `after_commit` 설정이 `false`인 경우에도, 알림 전송 시 `afterCommit` 메서드를 호출하면 열린 모든 트랜잭션이 커밋된 이후에 해당 알림이 전송되도록 할 수 있습니다.

```php
use App\Notifications\InvoicePaid;

$user->notify((new InvoicePaid($invoice))->afterCommit());
```

또는, 알림 클래스의 생성자 안에서 `afterCommit` 메서드를 호출할 수도 있습니다.

```php
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
> 이러한 문제를 우회하는 방법에 대해 더 알아보려면, [큐 작업과 데이터베이스 트랜잭션](/docs/12.x/queues#jobs-and-database-transactions) 관련 문서를 참고하세요.

<a name="determining-if-the-queued-notification-should-be-sent"></a>
#### 큐잉된 알림 발송 여부 동적으로 결정하기

보통 큐에 등록된 알림은 워커가 받아서 대상에게 전송합니다.

하지만 큐 워커가 처리한 이후에도 실제로 알림을 보낼지 마지막으로 한 번 더 판단하고 싶다면, 알림 클래스에 `shouldSend` 메서드를 정의할 수 있습니다. 이 메서드가 `false`를 반환하면 해당 알림은 실제로 발송되지 않습니다.

```php
/**
 * Determine if the notification should be sent.
 */
public function shouldSend(object $notifiable, string $channel): bool
{
    return $this->invoice->isPaid();
}
```

<a name="on-demand-notifications"></a>
### 온디맨드(즉석) 알림

때때로 애플리케이션의 "user" 엔티티로 저장되지 않은 대상에게 알림을 보내야 할 때가 있습니다. `Notification` 파사드의 `route` 메서드를 사용하면 알림을 보낼 ad-hoc(즉석) 라우팅 정보를 직접 지정할 수 있습니다.

```php
use Illuminate\Broadcasting\Channel;
use Illuminate\Support\Facades\Notification;

Notification::route('mail', 'taylor@example.com')
    ->route('vonage', '5555555555')
    ->route('slack', '#slack-channel')
    ->route('broadcast', [new Channel('channel-name')])
    ->notify(new InvoicePaid($invoice));
```

만약 온디맨드로 `mail` 라우트에 알림을 보낼 때 수신자의 이름도 함께 지정하고 싶다면, 이메일 주소를 키로 하고 이름을 값으로 하는 배열 형태를 전달하면 됩니다.

```php
Notification::route('mail', [
    'barrett@example.com' => 'Barrett Blair',
])->notify(new InvoicePaid($invoice));
```

`routes` 메서드를 사용하면 여러 알림 채널에 대한 라우팅 정보를 한 번에 지정할 수도 있습니다.

```php
Notification::routes([
    'mail' => ['barrett@example.com' => 'Barrett Blair'],
    'vonage' => '5555555555',
])->notify(new InvoicePaid($invoice));
```

<a name="mail-notifications"></a>
## 메일 알림

<a name="formatting-mail-messages"></a>
### 메일 메시지 포매팅

알림이 이메일 발송을 지원하려면, 알림 클래스에 `toMail` 메서드를 정의해야 합니다. 이 메서드는 `$notifiable` 엔티티를 받아서 `Illuminate\Notifications\Messages\MailMessage` 인스턴스를 반환해야 합니다.

`MailMessage` 클래스는 거래성 이메일을 빠르게 만들 수 있도록 몇 가지 간편한 메서드를 제공합니다. 메일 메시지에는 텍스트 라인들과 "행동 유도(Call To Action)" 버튼을 추가할 수 있습니다. 아래의 `toMail` 메서드 예시를 참고하세요.

```php
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
> 위 `toMail` 메서드에서 `$this->invoice->id`를 사용하는 것을 볼 수 있습니다. 알림이 메시지를 생성하는 데 필요한 데이터를 알림 클래스의 생성자를 통해 얼마든지 주입할 수 있습니다.

위 예시에서는 인사말, 텍스트 한 줄, 행동 유도 버튼, 그리고 마지막으로 텍스트 한 줄을 차례로 추가하고 있습니다. `MailMessage` 객체가 제공하는 이 메서드들 덕분에 거래성 이메일을 빠르고 쉽게 만들 수 있습니다. 메일 채널은 이 메시지들을 보기 좋고, 반응형이며, HTML로 만들어진 이메일 템플릿(plain-text 버전도 함께 제공)을 자동으로 만들어줍니다. 아래 이미지는 `mail` 채널에서 생성된 이메일 예시입니다.

<img src="https://laravel.com/img/docs/notification-example-2.png" />

> [!NOTE]
> 메일 알림을 보낼 때는 반드시 `config/app.php` 설정 파일 내 `name` 항목을 지정하세요. 이 값이 메일 알림 메시지의 헤더와 푸터에 사용됩니다.

<a name="error-messages"></a>
#### 에러 메시지

어떤 알림은 사용자에게 결제 실패 등 에러 상황을 안내하기도 합니다. 메시지를 만들 때 `error` 메서드를 호출하면 해당 메일 메시지가 에러 관련 메시지임을 표시할 수 있습니다. `error` 메서드를 활용하면 행동 유도 버튼 색상이 검정색 대신 빨간색으로 바뀝니다.

```php
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
#### 기타 메일 알림 포매팅 옵션

알림 클래스에서 `line` 메서드로 텍스트를 직접 추가하는 대신, `view` 메서드를 사용해 커스텀 템플릿으로 이메일 알림을 렌더링할 수도 있습니다.

```php
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

만약 plain-text 전용 뷰도 함께 지정하고 싶다면, `view` 메서드에 두 번째 요소로 plain-text 뷰 이름을 배열로 전달하세요.

```php
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

또한, 메시지가 오직 plain-text 뷰 하나만 필요하다면 `text` 메서드를 사용할 수 있습니다.

```php
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

기본적으로 메일의 발신자(From) 주소는 `config/mail.php` 설정 파일에 정의됩니다. 하지만, 특정 알림에 대해 발신자 주소를 별도로 지정하고 싶다면 `from` 메서드를 사용할 수 있습니다.

```php
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

`mail` 채널을 통해 알림을 보낼 때, 라라벨은 기본적으로 notifiable 엔티티에서 `email` 속성을 찾아 이메일 주소로 사용합니다. 만약 어떤 주소를 사용할지 직접 지정하고 싶다면, 해당 엔티티에 `routeNotificationForMail` 메서드를 정의하세요.

```php
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

        // 이메일 주소와 이름을 함께 반환...
        return [$this->email_address => $this->name];
    }
}
```

<a name="customizing-the-subject"></a>
### 제목 커스터마이징

기본적으로 이메일 제목은 알림 클래스명을 "Title Case"로 변환한 값입니다. 예를 들어, 알림 클래스명이 `InvoicePaid`라면, 이메일 제목은 `Invoice Paid`가 됩니다. 다른 제목을 직접 지정하고 싶으면, 메시지 빌드 시 `subject` 메서드를 호출하면 됩니다.

```php
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

### 메일러 커스터마이징

기본적으로 이메일 알림은 `config/mail.php` 설정 파일에 정의된 기본 메일러를 사용하여 전송됩니다. 하지만 메시지를 생성할 때 `mailer` 메서드를 호출하여 런타임에 다른 메일러를 지정할 수도 있습니다.

```php
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

메일 알림에 사용되는 HTML 및 일반 텍스트 템플릿을 수정하려면, 알림 패키지의 리소스를 게시(publish)해야 합니다. 아래 명령어를 실행하면 메일 알림 템플릿이 `resources/views/vendor/notifications` 디렉터리에 복사됩니다.

```shell
php artisan vendor:publish --tag=laravel-notifications
```

<a name="mail-attachments"></a>
### 첨부 파일

이메일 알림에 첨부 파일을 추가하려면 메시지를 생성할 때 `attach` 메서드를 사용합니다. `attach` 메서드의 첫 번째 인수로 파일의 절대 경로를 전달해야 합니다.

```php
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
> 알림 메일 메시지에서 제공되는 `attach` 메서드는 [attachable 객체](/docs/12.x/mail#attachable-objects)도 지원합니다. 자세한 내용은 [attachable 객체 전체 문서](/docs/12.x/mail#attachable-objects)를 참고하세요.

메시지에 파일을 첨부할 때, `attach` 메서드의 두 번째 인자로 `array`를 전달하여 표시할 이름이나 MIME 타입도 지정할 수 있습니다.

```php
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

mailable 객체에서 파일을 첨부하는 것과 달리, 알림에서는 `attachFromStorage`를 사용하여 스토리지 디스크에서 직접 파일을 첨부할 수 없습니다. 대신 파일의 절대 경로를 사용하는 `attach` 메서드를 사용해야 합니다. 또는, `toMail` 메서드에서 [mailable](/docs/12.x/mail#generating-mailables)을 반환할 수도 있습니다.

```php
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

필요하다면 `attachMany` 메서드를 이용해 여러 파일을 한 번에 첨부할 수도 있습니다.

```php
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
#### Raw 데이터 첨부

`attachData` 메서드는 바이트 스트링 형태의 원시 데이터를 첨부 파일로 추가할 때 사용합니다. 이때 첨부파일로 지정할 파일 이름을 두 번째 인수로 전달해야 합니다.

```php
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
### 태그 및 메타데이터 추가하기

Mailgun, Postmark와 같은 일부 외부 이메일 서비스에서는 메시지 "태그"와 "메타데이터"를 지원하며, 이를 통해 애플리케이션에서 전송되는 이메일을 그룹화하거나 추적할 수 있습니다. 이메일 메시지에 태그와 메타데이터를 추가하려면 `tag` 및 `metadata` 메서드를 사용할 수 있습니다.

```php
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

Mailgun 드라이버를 사용하는 경우, [태그 관련 문서](https://documentation.mailgun.com/en/latest/user_manual.html#tagging-1)와 [메타데이터 관련 문서](https://documentation.mailgun.com/en/latest/user_manual.html#attaching-data-to-messages)를 참고하세요. Postmark를 사용하는 경우에도 [태그 관련 지원](https://postmarkapp.com/blog/tags-support-for-smtp) 및 [메타데이터 지원](https://postmarkapp.com/support/article/1125-custom-metadata-faq)에 대한 문서를 참고할 수 있습니다.

Amazon SES를 사용해 이메일을 전송한다면, `metadata` 메서드를 이용해 메시지에 [SES "tags"](https://docs.aws.amazon.com/ses/latest/APIReference/API_MessageTag.html)를 추가해야 합니다.

<a name="customizing-the-symfony-message"></a>
### Symfony 메시지 커스터마이징

`MailMessage` 클래스의 `withSymfonyMessage` 메서드를 사용하면, 메시지 전송 전에 Symfony Message 인스턴스에서 호출되는 클로저(익명 함수)를 등록할 수 있습니다. 이 기능을 통해 메시지가 실제로 전송되기 전에 내용을 깊이 있게 커스터마이징할 수 있습니다.

```php
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
### Mailable 사용하기

필요하다면, 알림의 `toMail` 메서드에서 [mailable 객체](/docs/12.x/mail)를 그대로 반환할 수도 있습니다. 이 경우, `MailMessage` 대신 `Mailable`을 반환하게 되며, 수신자는 mailable 객체의 `to` 메서드를 사용해 지정해야 합니다.

```php
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

[온디맨드 알림](#on-demand-notifications)을 전송하는 경우, `toMail` 메서드에 전달되는 `$notifiable` 인스턴스는 `Illuminate\Notifications\AnonymousNotifiable`의 인스턴스입니다. 이 클래스는, 온디맨드 알림을 보낼 이메일 주소를 가져오기 위한 `routeNotificationFor` 메서드를 제공합니다.

```php
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

메일 알림 템플릿을 개발할 때, 일반 Blade 템플릿처럼 렌더링 결과를 바로 브라우저에서 미리 보는 것이 매우 편리합니다. 이를 위해 라라벨은 메일 알림에서 생성된 객체를 라우트 클로저나 컨트롤러에서 그대로 반환할 수 있게 지원합니다. `MailMessage`를 반환하면 실제 메일을 발송하지 않고도 브라우저에서 해당 메시지를 즉시 확인할 수 있습니다.

```php
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

마크다운 메일 알림을 사용하면, 내장된 메일 알림 템플릿의 이점을 그대로 누리면서도, 더 길고 맞춤화된 메시지를 자유롭게 작성할 수 있습니다. 메시지를 마크다운으로 작성하면, 라라벨이 자동으로 아름답고 반응형(모바일 대응) HTML 템플릿과 함께, 일반 텍스트 버전도 생성해줍니다.

<a name="generating-the-message"></a>
### 메시지 생성하기

마크다운 템플릿이 적용된 알림 클래스를 생성하려면 `make:notification` 아티즌 명령어에서 `--markdown` 옵션을 사용합니다.

```shell
php artisan make:notification InvoicePaid --markdown=mail.invoice.paid
```

다른 메일 알림과 마찬가지로, 마크다운 템플릿을 사용하는 알림 클래스에도 `toMail` 메서드를 정의해야 합니다. 하지만 `line`과 `action` 메서드를 사용해 메시지를 구성하는 대신, `markdown` 메서드로 사용할 마크다운 템플릿의 이름을 지정합니다. 템플릿에서 사용할 데이터 배열을 두 번째 인자로 전달할 수 있습니다.

```php
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

마크다운 메일 알림은 Blade 컴포넌트와 마크다운 문법을 조합해서 사용합니다. 이를 통해 알림 메시지 구성 요소들을 손쉽게 활용할 수 있으면서, 라라벨이 미리 준비한 알림용 컴포넌트의 장점도 누릴 수 있습니다.

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

> [!NOTE]
> 마크다운 이메일을 작성할 때는 들여쓰기를 과하게 사용하지 마세요. 마크다운 표준에 따라, 들여쓰기된 블록은 코드 블록으로 처리됩니다.

<a name="button-component"></a>
#### 버튼 컴포넌트

버튼 컴포넌트는 가운데 정렬된 버튼 링크를 생성합니다. 이 컴포넌트는 `url`과 선택적으로 `color` 속성을 받습니다. 지원되는 색상은 `primary`, `green`, `red`입니다. 하나의 알림에 여러 개의 버튼 컴포넌트를 추가해도 무방합니다.

```blade
<x-mail::button :url="$url" color="green">
View Invoice
</x-mail::button>
```

<a name="panel-component"></a>
#### 패널 컴포넌트

패널 컴포넌트는 입력한 텍스트 블록을 알림 배경과 약간 다른 색상의 패널로 표시합니다. 이 기능을 활용하면 특정 메시지에 수신자의 주목을 유도할 수 있습니다.

```blade
<x-mail::panel>
This is the panel content.
</x-mail::panel>
```

<a name="table-component"></a>
#### 테이블 컴포넌트

테이블 컴포넌트를 사용하면, 마크다운 형식의 테이블을 HTML 테이블로 변환해 표시할 수 있습니다. 컴포넌트는 마크다운 테이블 내용을 직접 받으며, 기본 마크다운 테이블 정렬 문법을 그대로 사용할 수 있습니다.

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

마크다운 알림 컴포넌트 전체를 애플리케이션으로 내보내 직접 커스터마이징할 수 있습니다. 컴포넌트를 내보내려면 `vendor:publish` 아티즌 명령어와 함께 `laravel-mail` 태그를 사용해주세요.

```shell
php artisan vendor:publish --tag=laravel-mail
```

이 명령어를 실행하면 마크다운 메일 컴포넌트가 `resources/views/vendor/mail` 디렉터리에 복사됩니다. 이 디렉터리에는 `html`과 `text` 하위 디렉터리가 포함되어 있으며, 각각의 버전에 해당하는 모든 컴포넌트 템플릿이 들어 있습니다. 이제 이 컴포넌트들을 원하는 대로 자유롭게 수정할 수 있습니다.

<a name="customizing-the-css"></a>
#### CSS 커스터마이징

컴포넌트를 내보낸 후에는 `resources/views/vendor/mail/html/themes` 디렉터리 내의 `default.css` 파일을 수정할 수 있습니다. 이 파일 안의 CSS 스타일은 자동으로 HTML 마크다운 알림 안에 인라인(inline) 적용됩니다.

라라벨의 마크다운 컴포넌트에 대해 완전히 새로운 테마를 만들고 싶다면, `html/themes` 디렉터리 내에 CSS 파일을 직접 추가할 수 있습니다. 파일의 이름을 지정한 뒤, `mail` 설정 파일의 `theme` 옵션을 새 테마 이름으로 변경하면 됩니다.

특정 알림에만 별도의 테마를 적용하고 싶을 때는, 메일 메시지를 빌드할 때 `theme` 메서드를 호출해 사용할 테마 명을 지정하세요.

```php
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

`database` 알림 채널은 알림 정보를 데이터베이스 테이블에 저장합니다. 이 테이블에는 알림 타입과 함께, 알림의 세부 정보를 담고 있는 JSON 데이터 구조가 들어갑니다.

저장된 테이블을 조회해 애플리케이션의 UI에서 알림 정보를 표시할 수 있습니다. 하지만 그전에, 알림 정보를 저장할 데이터베이스 테이블을 생성해야 합니다. 이를 위해 `make:notifications-table` 명령어로 [마이그레이션](/docs/12.x/migrations) 파일을 생성한 뒤, 마이그레이션을 진행해야 합니다.

```shell
php artisan make:notifications-table

php artisan migrate
```

> [!NOTE]
> 알림을 받을 모델이 [UUID 또는 ULID 기본 키](/docs/12.x/eloquent#uuid-and-ulid-keys)를 사용하는 경우, 알림 테이블 마이그레이션에서 `morphs` 메서드 대신 [uuidMorphs](/docs/12.x/migrations#column-method-uuidMorphs) 또는 [ulidMorphs](/docs/12.x/migrations#column-method-ulidMorphs)를 사용해야 합니다.

<a name="formatting-database-notifications"></a>
### 데이터베이스 알림 포맷

알림을 데이터베이스에 저장하려면, 알림 클래스에 `toDatabase` 또는 `toArray` 메서드를 정의해야 합니다. 이 메서드는 `$notifiable` 엔터티를 인자로 받아, 평범한 PHP 배열을 반환해야 합니다. 반환된 배열은 JSON으로 변환된 뒤, `notifications` 테이블의 `data` 컬럼에 저장됩니다. 다음은 `toArray` 메서드의 예시입니다.

```php
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

알림이 애플리케이션의 데이터베이스에 저장될 때에는, `type` 컬럼은 알림의 클래스 이름으로 자동 설정되고, `read_at` 컬럼은 기본값으로 `null`이 들어갑니다. 이 동작은 알림 클래스 내에서 `databaseType`과 `initialDatabaseReadAtValue` 메서드를 정의하여 커스터마이징할 수 있습니다.

```
use Illuminate\Support\Carbon;
```

```php
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
#### `toDatabase` vs. `toArray`

`toArray` 메서드는 `broadcast` 채널에서 JavaScript 프론트엔드로 전달될 데이터 결정에도 사용됩니다. 만약 `database`와 `broadcast` 채널에서 서로 다른 배열 표현을 원한다면, `toArray` 대신 `toDatabase` 메서드를 정의해야 합니다.

<a name="accessing-the-notifications"></a>
### 알림 접근하기

알림이 데이터베이스에 저장된 후에는, 알림을 받을 엔터티에서 쉽게 알림 정보를 조회할 수 있어야 합니다. 라라벨의 기본 `App\Models\User` 모델에 포함된 `Illuminate\Notifications\Notifiable` 트레이트에는, 엔터티의 알림 목록을 반환하는 `notifications` [Eloquent 연관관계](/docs/12.x/eloquent-relationships)가 포함되어 있습니다. 다른 Eloquent 연관관계와 마찬가지로 이 메서드를 호출하여 알림을 조회할 수 있습니다. 기본적으로 알림은 `created_at` 타임스탬프를 기준으로 최신순으로 정렬됩니다.

```php
$user = App\Models\User::find(1);

foreach ($user->notifications as $notification) {
    echo $notification->type;
}
```

"읽지 않은" 알림만 조회하려면 `unreadNotifications` 연관관계를 사용하세요. 역시 `created_at` 기준으로 최신 알림이 먼저 나옵니다.

```php
$user = App\Models\User::find(1);

foreach ($user->unreadNotifications as $notification) {
    echo $notification->type;
}
```

> [!NOTE]
> JavaScript 클라이언트에서 알림 목록에 접근하려면, 알림 컨트롤러를 만들어 인증된 사용자(또는 다른 알림 대상)의 알림을 반환하게 해야 합니다. 이후 JavaScript 클라이언트에서 해당 컨트롤러의 URL로 HTTP 요청을 보내면 됩니다.

<a name="marking-notifications-as-read"></a>
### 알림을 읽음으로 표시하기

대부분의 경우, 사용자가 알림을 확인하면 해당 알림을 "읽음" 상태로 표시하게 됩니다. `Illuminate\Notifications\Notifiable` 트레이트에는, 알림의 `read_at` 열 값을 갱신해주는 `markAsRead` 메서드가 포함되어 있습니다.

```php
$user = App\Models\User::find(1);

foreach ($user->unreadNotifications as $notification) {
    $notification->markAsRead();
}
```

여러 알림에 대해 반복문을 돌리지 않고도, 알림 컬렉션 전체에 `markAsRead`를 직접 호출할 수 있습니다.

```php
$user->unreadNotifications->markAsRead();
```

모든 알림을 데이터베이스에서 가져오지 않고 한 번에 일괄 갱신하려면 mass-update 쿼리를 사용할 수 있습니다.

```php
$user = App\Models\User::find(1);

$user->unreadNotifications()->update(['read_at' => now()]);
```

알림을 완전히 삭제하려면, 아래와 같이 `delete`를 사용합니다.

```php
$user->notifications()->delete();
```

<a name="broadcast-notifications"></a>
## 브로드캐스트 알림

<a name="broadcast-prerequisites"></a>
### 사전 준비

알림을 브로드캐스트하기 전에, 라라벨의 [이벤트 브로드캐스팅](/docs/12.x/broadcasting) 서비스에 대해 숙지하고 설정해야 합니다. 이벤트 브로드캐스팅을 사용하면 서버 측에서 발생한 라라벨 이벤트에 자바스크립트 프론트엔드가 실시간으로 반응할 수 있습니다.

<a name="formatting-broadcast-notifications"></a>
### 브로드캐스트 알림 포맷

`broadcast` 채널은 라라벨의 [이벤트 브로드캐스팅](/docs/12.x/broadcasting) 서비스를 이용해 알림을 자바스크립트 프론트엔드로 실시간으로 전달합니다. 알림이 브로드캐스트를 지원한다면, 알림 클래스에 `toBroadcast` 메서드를 정의할 수 있습니다. 이 메서드는 `$notifiable` 엔터티를 인자로 받아, `BroadcastMessage` 인스턴스를 반환해야 합니다. `toBroadcast` 메서드를 정의하지 않으면, `toArray` 메서드의 반환값이 브로드캐스트용으로 사용됩니다. 반환된 데이터는 JSON으로 인코딩되어 자바스크립트 프론트엔드로 전송됩니다. 아래는 `toBroadcast` 메서드의 예시입니다.

```php
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

모든 브로드캐스트 알림은 자동으로 큐잉됩니다. 만약 알림 브로드캐스트 처리에 사용되는 큐 연결이나 큐 이름을 설정하고 싶다면, `BroadcastMessage`의 `onConnection` 및 `onQueue` 메서드를 사용할 수 있습니다.

```php
return (new BroadcastMessage($data))
    ->onConnection('sqs')
    ->onQueue('broadcasts');
```

<a name="customizing-the-notification-type"></a>
#### 알림 타입 커스터마이징

직접 지정하는 데이터 이외에도, 모든 브로드캐스트 알림에는 알림 클래스의 전체 이름을 담은 `type` 필드가 포함됩니다. 알림의 `type`을 직접 지정하려면, 알림 클래스에 `broadcastType` 메서드를 정의할 수 있습니다.

```php
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

알림은 `{notifiable}.{id}` 형식의 비공개 채널에서 브로드캐스트됩니다. 예를 들어, ID가 `1`인 `App\Models\User` 인스턴스에 알림을 보낸다면, 해당 알림은 `App.Models.User.1` 채널에서 브로드캐스트됩니다. [Laravel Echo](/docs/12.x/broadcasting#client-side-installation)를 사용하면, 아래와 같이 해당 채널에서 알림을 쉽게 수신할 수 있습니다.

```js
Echo.private('App.Models.User.' + userId)
    .notification((notification) => {
        console.log(notification.type);
    });
```

<a name="customizing-the-notification-channel"></a>
#### 알림 채널 커스터마이징

특정 엔터티의 브로드캐스트 알림이 어떤 채널을 통해 전달될지 직접 지정하고 싶다면, 해당 엔터티에 `receivesBroadcastNotificationsOn` 메서드를 정의할 수 있습니다.

```php
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
### 사전 준비 사항

라라벨에서 SMS 알림은 [Vonage](https://www.vonage.com/) (이전 명칭: Nexmo)를 통해 전송됩니다. Vonage를 통해 알림을 전송하려면 먼저 `laravel/vonage-notification-channel`과 `guzzlehttp/guzzle` 패키지를 설치해야 합니다.

```shell
composer require laravel/vonage-notification-channel guzzlehttp/guzzle
```

이 패키지에는 [설정 파일](https://github.com/laravel/vonage-notification-channel/blob/3.x/config/vonage.php)이 포함되어 있습니다. 하지만, 이 설정 파일을 직접 애플리케이션으로 내보낼 필요는 없습니다. 대신 `VONAGE_KEY`와 `VONAGE_SECRET` 환경 변수에 Vonage에서 제공하는 퍼블릭/시크릿 키를 지정해주면 됩니다.

키를 정의한 후에는 기본적으로 SMS를 발송할 때 사용할 발신 번호를 지정하는 `VONAGE_SMS_FROM` 환경 변수를 설정해야 합니다. 이 번호는 Vonage 콘트롤 패널을 통해 생성할 수 있습니다.

```ini
VONAGE_SMS_FROM=15556666666
```

<a name="formatting-sms-notifications"></a>
### SMS 알림 포맷팅

알림이 SMS로 발송될 수 있도록 하려면 알림 클래스 내에 `toVonage` 메서드를 정의해야 합니다. 이 메서드는 `$notifiable` 개체를 인자로 받고, `Illuminate\Notifications\Messages\VonageMessage` 인스턴스를 반환해야 합니다.

```php
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
#### 유니코드 문자 포함하기

SMS 메시지에 유니코드 문자가 포함되어야 한다면, `VonageMessage` 인스턴스를 생성할 때 `unicode` 메서드를 호출해야 합니다.

```php
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

`VONAGE_SMS_FROM` 환경 변수로 기본 발신 번호를 지정할 수 있지만, 일부 알림에 대해 다른 발신 번호를 사용하고 싶다면 `VonageMessage` 인스턴스에서 `from` 메서드를 호출하면 됩니다.

```php
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
### 클라이언트 참조값 추가

사용자, 팀 또는 클라이언트별 비용을 추적하고 싶다면 알림에 "클라이언트 참조(client reference)"를 추가할 수 있습니다. Vonage는 이 값을 기반으로 다양한 보고서를 생성할 수 있어, 특정 고객의 SMS 사용 현황을 쉽게 분석할 수 있습니다. 클라이언트 참조는 최대 40자 이하의 문자열로 지정할 수 있습니다.

```php
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
### SMS 알림 라우팅

Vonage 알림을 올바른 전화번호로 라우팅하려면, 알림 수신 엔터티(예: User 모델)에 `routeNotificationForVonage` 메서드를 정의해야 합니다.

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Notifications\Notification;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * Vonage 채널용 알림 라우팅.
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
### 사전 준비 사항

Slack 알림을 전송하기 전에 Composer를 이용하여 Slack 알림 채널 패키지를 설치해야 합니다.

```shell
composer require laravel/slack-notification-channel
```

추가로, 자신의 Slack 워크스페이스에 [Slack App](https://api.slack.com/apps?new_app=1)을 생성해야 합니다.

Slack App을 생성한 후 해당 워크스페이스에만 알림을 전송하려면, App에 `chat:write`, `chat:write.public`, `chat:write.customize` 스코프를 부여해야 합니다. 이 스코프는 Slack의 "OAuth & Permissions" App 관리 탭에서 추가할 수 있습니다.

그 다음, App의 "Bot User OAuth Token"을 `services.php` 설정 파일 내 `slack` 설정 배열에 추가해야 합니다. 토큰은 Slack의 "OAuth & Permissions" 탭에서 확인할 수 있습니다.

```php
'slack' => [
    'notifications' => [
        'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
        'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
    ],
],
```

<a name="slack-app-distribution"></a>
#### App 배포

애플리케이션이 외부 Slack 워크스페이스(사용자 소유 워크스페이스)로 알림을 보낼 예정이라면 Slack의 App 배포("distribute") 절차를 따라야 합니다. 해당 설정은 App의 "Manage Distribution" 탭에서 관리할 수 있습니다. App을 배포한 후에는 [Socialite](/docs/12.x/socialite)를 사용하여 애플리케이션 사용자 대신 [Slack Bot 토큰](/docs/12.x/socialite#slack-bot-scopes)을 얻을 수 있습니다.

<a name="formatting-slack-notifications"></a>
### Slack 알림 포맷팅

알림이 Slack 메시지로 전송될 수 있도록 하려면 알림 클래스에 `toSlack` 메서드를 정의해야 합니다. 이 메서드는 `$notifiable` 개체를 받고 `Illuminate\Notifications\Slack\SlackMessage` 인스턴스를 반환해야 합니다. [Slack의 Block Kit API](https://api.slack.com/block-kit)를 활용해 다양한 형태로 메시지를 구성할 수 있습니다. 아래 예제는 [Slack Block Kit builder](https://app.slack.com/block-kit-builder/T01KWS6K23Z#%7B%22blocks%22:%5B%7B%22type%22:%22header%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22Invoice%20Paid%22%7D%7D,%7B%22type%22:%22context%22,%22elements%22:%5B%7B%22type%22:%22plain_text%22,%22text%22:%22Customer%20%231234%22%7D%5D%7D,%7B%22type%22:%22section%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22An%20invoice%20has%20been%20paid.%22%7D,%22fields%22:%5B%7B%22type%22:%22mrkdwn%22,%22text%22:%22*Invoice%20No:*%5Cn1000%22%7D,%7B%22type%22:%22mrkdwn%22,%22text%22:%22*Invoice%20Recipient:*%5Cntaylor@laravel.com%22%7D%5D%7D,%7B%22type%22:%22divider%22%7D,%7B%22type%22:%22section%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22Congratulations!%22%7D%7D%5D%7D)로 미리 볼 수 있습니다.

```php
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
#### Slack Block Kit 빌더 템플릿 사용

Block Kit 메시지를 빌더 메서드 대신, Slack Block Kit Builder에서 생성한 원시 JSON 페이로드를 `usingBlockKitTemplate` 메서드에 전달하여 사용할 수도 있습니다.

```php
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
### Slack 인터랙티비티(상호작용)

Slack의 Block Kit 알림 시스템은 [사용자 상호작용 처리](https://api.slack.com/interactivity/handling)를 위한 다양한 기능을 제공합니다. 이 기능을 사용하려면 Slack App에서 "Interactivity" 기능을 활성화하고, 요청을 받아 처리할 애플리케이션의 URL을 "Request URL"로 지정해야 합니다. 이 설정은 Slack의 "Interactivity & Shortcuts" App 관리 탭에서 할 수 있습니다.

아래 예제처럼 `actionsBlock` 메서드를 사용하면, 버튼을 클릭한 Slack 사용자의 정보와 버튼 ID 등이 담긴 페이로드가 "Request URL"로 `POST` 방식으로 전송됩니다. 애플리케이션은 이 페이로드 내용을 바탕으로 적절한 처리를 할 수 있습니다. 또한 반드시 [요청이 Slack에서 온 것인지 검증](https://api.slack.com/authentication/verifying-requests-from-slack)해야 합니다.

```php
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
             // ID는 기본적으로 "button_acknowledge_invoice"로 설정됩니다...
            $block->button('Acknowledge Invoice')->primary();

            // ID를 수동으로 지정할 수도 있습니다...
            $block->button('Deny')->danger()->id('deny_invoice');
        });
}
```

<a name="slack-confirmation-modals"></a>
#### 확인(Confirmation) 모달 창 표시

버튼이 클릭되면 바로 동작하지 않고, 사용자가 반드시 한 번 더 확인하도록 하고 싶다면 `confirm` 메서드를 사용할 수 있습니다. `confirm` 메서드는 메시지와 함께, `ConfirmObject` 인스턴스를 전달받는 클로저를 인자로 받을 수 있습니다.

```php
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
#### Slack 블록(Blocks) 빠르게 확인하기

작성 중인 블록을 빠르게 확인하고 싶다면 `SlackMessage` 인스턴스에서 `dd` 메서드를 호출해 보세요. 이 메서드는 Slack [Block Kit Builder](https://app.slack.com/block-kit-builder/)에서 페이로드와 알림이 어떻게 보이는지 미리 볼 수 있는 URL을 생성해 바로 방문할 수 있도록 합니다. `dd`에 `true`를 인자로 주면, 원시 페이로드 데이터도 같이 덤프됩니다.

```php
return (new SlackMessage)
    ->text('One of your invoices has been paid!')
    ->headerBlock('Invoice Paid')
    ->dd();
```

<a name="routing-slack-notifications"></a>
### Slack 알림 라우팅

Slack 알림을 적절한 Slack 팀 및 채널로 전송하려면 알림 수신 모델에 `routeNotificationForSlack` 메서드를 정의해야 합니다. 이 메서드는 다음과 같은 값 중 하나를 반환할 수 있습니다.

- `null`: 라우팅을 알림 자체에 설정된 채널로 위임합니다. 이 경우 알림 구성 시 `to` 메서드를 사용해 채널을 지정할 수 있습니다.
- 문자열: 알림을 보낼 Slack 채널(예: `#support-channel`)을 직접 지정합니다.
- `SlackRoute` 인스턴스: OAuth 토큰과 채널명을 직접 지정할 수 있으며, 외부 워크스페이스로 알림을 보낼 때 사용합니다.

예를 들어 `routeNotificationForSlack`에서 `#support-channel`을 반환하면, 애플리케이션 `services.php` 설정에 저장된 Bot User OAuth 토큰과 연동된 워크스페이스에서 `#support-channel`로 알림이 전송됩니다.

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Notifications\Notification;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * Slack 채널용 알림 라우팅.
     */
    public function routeNotificationForSlack(Notification $notification): mixed
    {
        return '#support-channel';
    }
}
```

<a name="notifying-external-slack-workspaces"></a>
### 외부 Slack 워크스페이스에 알림 보내기

> [!NOTE]
> 외부 Slack 워크스페이스로 알림을 보내기 전에, Slack App이 [배포(distribution)](#slack-app-distribution)되어 있어야 합니다.

실제로는, 많은 경우 애플리케이션 사용자가 소유한 Slack 워크스페이스로 알림을 보낼 필요가 있습니다. 이때는 우선 해당 사용자에 대한 Slack OAuth 토큰이 필요합니다. 다행히도 [Laravel Socialite](/docs/12.x/socialite)에 Slack 드라이버가 포함되어 있어서, 사용자의 Slack 인증 및 [Bot 토큰 획득](/docs/12.x/socialite#slack-bot-scopes)을 매우 쉽고 빠르게 처리할 수 있습니다.

Bot 토큰을 얻어 애플리케이션 DB에 저장한 뒤, `SlackRoute::make` 메서드를 활용해서 사용자의 워크스페이스로 알림을 전송할 수 있습니다. 보통 알림을 보낼 채널도 사용자가 지정할 수 있도록 해야 합니다.

```php
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
     * Slack 채널용 알림 라우팅.
     */
    public function routeNotificationForSlack(Notification $notification): mixed
    {
        return SlackRoute::make($this->slack_channel, $this->slack_token);
    }
}
```

<a name="localizing-notifications"></a>
## 알림 다국어 지원 (로컬라이징)

라라벨에서는 HTTP 요청의 현재 로케일과 다른 언어로 알림을 보낼 수 있으며, 알림이 큐에 저장된 경우에도 해당 언어가 그대로 유지됩니다.

이를 위해 `Illuminate\Notifications\Notification` 클래스에서는 원하는 언어를 지정할 수 있는 `locale` 메서드를 제공합니다. 알림이 평가될 때 해당 로케일로 설정되고, 작업이 끝나면 이전 로케일로 복원됩니다.

```php
$user->notify((new InvoicePaid($invoice))->locale('es'));
```

여러 개의 알림 수신 대상에게 다국어 알림을 보낼 때는 `Notification` 파사드로도 처리할 수 있습니다.

```php
Notification::locale('es')->send(
    $users, new InvoicePaid($invoice)
);
```

<a name="user-preferred-locales"></a>
### 사용자의 선호 언어 설정

애플리케이션에서 각 사용자별 선호 로케일을 저장하는 경우가 있습니다. 이럴 때 알림 수신 모델에서 `HasLocalePreference` 컨트랙트를 구현하면, 라라벨이 지정된 로케일로 알림을 자동으로 발송합니다.

```php
use Illuminate\Contracts\Translation\HasLocalePreference;

class User extends Model implements HasLocalePreference
{
    /**
     * 사용자의 선호 로케일 반환.
     */
    public function preferredLocale(): string
    {
        return $this->locale;
    }
}
```

인터페이스를 구현하면, 라라벨은 자동으로 선호 로케일을 적용하여 알림과 메일을 발송합니다. 따라서 이때는 `locale` 메서드를 따로 호출할 필요가 없습니다.

```php
$user->notify(new InvoicePaid($invoice));
```

<a name="testing"></a>
## 테스트

알림을 실제로 전송하지 않고 테스트하려면 `Notification` 파사드의 `fake` 메서드를 사용할 수 있습니다. 알림 전송은 대부분 실제 테스트 대상 코드와 크게 연관되지 않으므로, 라라벨이 특정 알림을 "전송하라고" 호출했음을 검증하는 것으로 충분합니다.

`Notification` 파사드의 `fake` 메서드를 호출하면, 해당 이후에 알림이 특정 사용자에게 전송되었는지, 어떤 데이터가 전달되었는지 등도 쉽게 검증할 수 있습니다.

```php tab=Pest
<?php

use App\Notifications\OrderShipped;
use Illuminate\Support\Facades\Notification;

test('orders can be shipped', function () {
    Notification::fake();

    // 주문 발송 동작 수행...

    // 어떤 알림도 전송되지 않았는지 확인...
    Notification::assertNothingSent();

    // 특정 사용자에게 알림이 전송되었는지 확인...
    Notification::assertSentTo(
        [$user], OrderShipped::class
    );

    // 알림이 전송되지 않았는지 확인...
    Notification::assertNotSentTo(
        [$user], AnotherNotification::class
    );

    // 총 3개의 알림이 전송되었는지 확인...
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

        // 주문 발송 동작 수행...

        // 어떤 알림도 전송되지 않았는지 확인...
        Notification::assertNothingSent();

        // 특정 사용자에게 알림이 전송되었는지 확인...
        Notification::assertSentTo(
            [$user], OrderShipped::class
        );

        // 알림이 전송되지 않았는지 확인...
        Notification::assertNotSentTo(
            [$user], AnotherNotification::class
        );

        // 총 3개의 알림이 전송되었는지 확인...
        Notification::assertCount(3);
    }
}
```

`assertSentTo` 또는 `assertNotSentTo` 메서드에 클로저를 전달하여, 특정 조건을 만족하는 알림이 전송(또는 미전송)되었는지 세밀하게 검증할 수 있습니다. 주어진 "진리 테스트"를 통과하는 알림이 하나라도 있다면 검증은 성공합니다.

```php
Notification::assertSentTo(
    $user,
    function (OrderShipped $notification, array $channels) use ($order) {
        return $notification->order->id === $order->id;
    }
);
```

<a name="on-demand-notifications"></a>
#### 온디맨드(즉시) 알림 테스트

테스트 중인 코드가 [온디맨드 알림](#on-demand-notifications)을 전송한다면, `assertSentOnDemand` 메서드를 사용해 해당 알림이 실제로 전송되었는지 테스트할 수 있습니다.

```php
Notification::assertSentOnDemand(OrderShipped::class);
```

`assertSentOnDemand` 메서드의 두 번째 인자로 클로저를 전달하면, 온디맨드 알림이 올바른 "route" 주소로 전송되었는지까지 확인할 수 있습니다.

```php
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
#### Notification Sending 이벤트

알림이 전송될 때 라라벨 알림 시스템은 `Illuminate\Notifications\Events\NotificationSending` 이벤트를 디스패치합니다. 이 이벤트에는 "notifiable" 개체와 알림 인스턴스가 담깁니다. [이벤트 리스너](/docs/12.x/events)를 정의해 알림 발송 전에 커스텀 처리를 할 수 있습니다.

```php
use Illuminate\Notifications\Events\NotificationSending;

class CheckNotificationStatus
{
    /**
     * 이벤트 처리.
     */
    public function handle(NotificationSending $event): void
    {
        // ...
    }
}
```

이벤트 리스너에서 `handle` 메서드가 `false`를 반환하면, 해당 알림은 실제로 전송되지 않습니다.

```php
/**
 * 이벤트 처리.
 */
public function handle(NotificationSending $event): bool
{
    return false;
}
```

이벤트 리스너에서 `$event->notifiable`, `$event->notification`, `$event->channel` 등의 프로퍼티를 활용해 수신자 정보나 알림 정보를 확인할 수 있습니다.

```php
/**
 * 이벤트 처리.
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

알림이 전송되면, 라라벨의 알림 시스템은 `Illuminate\Notifications\Events\NotificationSent` [이벤트](/docs/12.x/events)를 발생시킵니다. 이 이벤트에는 "notifiable" 엔티티와 해당 알림 인스턴스가 포함되어 있습니다. 애플리케이션 내에서 이 이벤트에 대한 [이벤트 리스너](/docs/12.x/events)를 생성할 수 있습니다.

```php
use Illuminate\Notifications\Events\NotificationSent;

class LogNotification
{
    /**
     * 이벤트를 처리합니다.
     */
    public function handle(NotificationSent $event): void
    {
        // ...
    }
}
```

이벤트 리스너 내에서는 `notifiable`, `notification`, `channel`, `response` 프로퍼티에 접근하여, 알림 수신자 또는 알림 자체에 대한 더 많은 정보를 얻을 수 있습니다.

```php
/**
 * 이벤트를 처리합니다.
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

라라벨은 기본적으로 여러 가지 알림 채널을 제공하지만, 알림을 다른 채널(예: 별도의 SMS 서비스, 음성, Slack, 푸시 등)로 전송하는 커스텀 드라이버를 직접 만들 수도 있습니다. 라라벨에서는 이를 매우 간단하게 구현할 수 있습니다. 먼저, `send` 메서드를 포함하는 클래스를 정의하세요. 이 메서드는 두 개의 인수, 즉 `$notifiable` 객체와 `$notification` 객체를 받아야 합니다.

`send` 메서드 안에서는 알림에서 적절한 메시지 객체를 꺼내고(아래 예시의 경우 `toVoice` 사용) 원하는 방식으로 `$notifiable` 인스턴스에 알림을 전달하면 됩니다.

```php
<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

class VoiceChannel
{
    /**
     * 주어진 알림을 전송합니다.
     */
    public function send(object $notifiable, Notification $notification): void
    {
        $message = $notification->toVoice($notifiable);

        // $notifiable 인스턴스에 알림을 전송합니다...
    }
}
```

이렇게 커스텀 알림 채널 클래스를 정의한 후에는, 알림의 `via` 메서드에서 해당 클래스명을 반환하면 됩니다. 예시에서는, 알림의 `toVoice` 메서드가 음성 메시지를 표현하는 객체(예: 여러분이 직접 정의한 `VoiceMessage` 클래스 등)를 반환하면 됩니다.

```php
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
     * 알림을 전송할 채널을 반환합니다.
     */
    public function via(object $notifiable): string
    {
        return VoiceChannel::class;
    }

    /**
     * 알림의 음성 메시지 표현 값을 반환합니다.
     */
    public function toVoice(object $notifiable): VoiceMessage
    {
        // ...
    }
}
```