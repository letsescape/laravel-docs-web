# 알림(Notification) (Notifications)

- [소개](#introduction)
- [알림 생성](#generating-notifications)
- [알림 전송](#sending-notifications)
    - [Notifiable 트레이트 사용](#using-the-notifiable-trait)
    - [Notification 파사드 사용](#using-the-notification-facade)
    - [전달 채널 지정](#specifying-delivery-channels)
    - [알림 큐 처리](#queueing-notifications)
    - [온디맨드 알림](#on-demand-notifications)
- [메일 알림](#mail-notifications)
    - [메일 메시지 포매팅](#formatting-mail-messages)
    - [발신자 커스텀](#customizing-the-sender)
    - [수신자 커스텀](#customizing-the-recipient)
    - [제목 커스텀](#customizing-the-subject)
    - [메일러 커스텀](#customizing-the-mailer)
    - [템플릿 커스텀](#customizing-the-templates)
    - [첨부파일](#mail-attachments)
    - [태그 및 메타데이터 추가](#adding-tags-metadata)
    - [Symfony 메시지 커스텀](#customizing-the-symfony-message)
    - [메일러블(Mailable) 사용](#using-mailables)
    - [메일 알림 미리보기](#previewing-mail-notifications)
- [마크다운 메일 알림](#markdown-mail-notifications)
    - [메시지 생성](#generating-the-message)
    - [메시지 작성](#writing-the-message)
    - [컴포넌트 커스텀](#customizing-the-components)
- [데이터베이스 알림](#database-notifications)
    - [사전 준비](#database-prerequisites)
    - [데이터베이스 알림 포매팅](#formatting-database-notifications)
    - [알림 조회](#accessing-the-notifications)
    - [알림 읽음 처리](#marking-notifications-as-read)
- [브로드캐스트 알림](#broadcast-notifications)
    - [사전 준비](#broadcast-prerequisites)
    - [브로드캐스트 알림 포매팅](#formatting-broadcast-notifications)
    - [알림 수신 대기](#listening-for-notifications)
- [SMS 알림](#sms-notifications)
    - [사전 준비](#sms-prerequisites)
    - [SMS 알림 포매팅](#formatting-sms-notifications)
    - [유니코드 콘텐츠](#unicode-content)
    - ["From" 번호 커스텀](#customizing-the-from-number)
    - [클라이언트 참조 추가](#adding-a-client-reference)
    - [SMS 알림 라우팅](#routing-sms-notifications)
- [Slack 알림](#slack-notifications)
    - [사전 준비](#slack-prerequisites)
    - [Slack 알림 포매팅](#formatting-slack-notifications)
    - [Slack 인터랙션](#slack-interactivity)
    - [Slack 알림 라우팅](#routing-slack-notifications)
    - [외부 Slack 워크스페이스 알림](#notifying-external-slack-workspaces)
- [알림의 지역화](#localizing-notifications)
- [테스트](#testing)
- [알림 이벤트](#notification-events)
- [커스텀 채널](#custom-channels)

<a name="introduction"></a>
## 소개

[이메일 전송](/docs/mail) 지원 외에도, 라라벨은 이메일, SMS([Vonage](https://www.vonage.com/communications-apis/), 이전 명칭 Nexmo), [Slack](https://slack.com) 등 다양한 전달 채널을 통한 알림 전송을 지원합니다. 뿐만 아니라, [커뮤니티에서 제공하는 다양한 알림 채널](https://laravel-notification-channels.com/about/#suggesting-a-new-channel)도 존재하며, 이를 통해 수십 가지 채널에 알림을 보낼 수 있습니다! 알림은 데이터베이스에 저장하여 웹 인터페이스에서 표시할 수도 있습니다.

일반적으로 알림은 사용자가 애플리케이션에서 발생한 이벤트를 확인할 수 있도록 도와주는 짧고 간단한 정보 메시지입니다. 예를 들어, 결제 애플리케이션을 만든다면, "송장 결제 완료" 알림을 이메일 및 SMS 채널을 통해 사용자에게 전송할 수 있습니다.

<a name="generating-notifications"></a>
## 알림 생성

라라벨에서 각 알림은 보통 `app/Notifications` 디렉터리에 저장되는 하나의 클래스로 표현됩니다. 만약 이 디렉터리가 애플리케이션에 없다면, `make:notification` 아티즌 명령어를 실행할 때 자동으로 생성됩니다:

```shell
php artisan make:notification InvoicePaid
```

이 명령어를 실행하면 새로운 알림 클래스가 `app/Notifications` 디렉터리에 생성됩니다. 각 알림 클래스에는 `via` 메서드와, `toMail` 또는 `toDatabase`처럼 특정 채널에 맞게 알림 메시지를 만드는 여러 메서드들이 포함되어 있습니다.

<a name="sending-notifications"></a>
## 알림 전송

<a name="using-the-notifiable-trait"></a>
### Notifiable 트레이트 사용

알림은 `Notifiable` 트레이트의 `notify` 메서드 또는 `Notification` [파사드](/docs/facades)를 통해 두 가지 방식으로 전송할 수 있습니다. `Notifiable` 트레이트는 기본적으로 애플리케이션의 `App\Models\User` 모델에 포함되어 있습니다.

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

이 트레이트의 `notify` 메서드는 알림 인스턴스를 인수로 받습니다.

```php
use App\Notifications\InvoicePaid;

$user->notify(new InvoicePaid($invoice));
```

> [!NOTE]
> `Notifiable` 트레이트는 어떤 모델에나 사용할 수 있습니다. 반드시 `User` 모델에만 포함해야 하는 것은 아닙니다.

<a name="using-the-notification-facade"></a>
### Notification 파사드 사용

또는, `Notification` [파사드](/docs/facades)를 이용해 알림을 전송할 수도 있습니다. 이 방법은 여러 notifiable 엔터티(예: 사용자 컬렉션)에게 한 번에 알림을 보낼 때 유용합니다. 파사드를 사용하여 알림을 보내려면, 모든 notifiable 엔터티와 알림 인스턴스를 `send` 메서드에 전달하면 됩니다.

```php
use Illuminate\Support\Facades\Notification;

Notification::send($users, new InvoicePaid($invoice));
```

또는, `sendNow` 메서드를 사용해 알림을 즉시 전송할 수도 있습니다. 이 메서드는 알림이 `ShouldQueue` 인터페이스를 구현했더라도 즉시 전송합니다.

```php
Notification::sendNow($developers, new DeploymentCompleted($deployment));
```

<a name="specifying-delivery-channels"></a>
### 전달 채널 지정

모든 알림 클래스에는 알림이 어떤 채널로 전달될지 결정하는 `via` 메서드가 존재합니다. 알림은 `mail`, `database`, `broadcast`, `vonage`, `slack` 채널로 전송될 수 있습니다.

> [!NOTE]
> Telegram, Pusher와 같은 다른 채널을 사용하고 싶다면 커뮤니티에서 관리하는 [Laravel Notification Channels 웹사이트](http://laravel-notification-channels.com)를 확인해보세요.

`via` 메서드는 알림이 전송될 대상 클래스의 인스턴스인 `$notifiable`을 받습니다. `$notifiable`을 활용해 알림을 전달할 채널을 동적으로 결정할 수 있습니다.

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
### 알림 큐 처리

> [!WARNING]
> 알림을 큐잉하기 전에 큐를 설정하고 [워커를 시작](/docs/queues#running-the-queue-worker)해야 합니다.

특정 채널이 외부 API 호출을 해야 할 경우, 알림 전송은 시간이 오래 걸릴 수 있습니다. 애플리케이션의 응답 속도를 높이기 위해, `ShouldQueue` 인터페이스와 `Queueable` 트레이트를 클래스에 추가함으로써 알림을 큐로 전환할 수 있습니다. 이 인터페이스와 트레이트는 `make:notification` 명령어로 생성한 모든 알림에 이미 임포트되어 있으므로, 바로 알림 클래스에 추가해도 됩니다.

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

`ShouldQueue` 인터페이스를 알림에 추가한 뒤에는, 평소대로 알림을 전송하면 됩니다. 라라벨은 클래스에 `ShouldQueue`가 있는지 자동으로 감지하고, 알림 전달을 큐에 등록합니다.

```php
$user->notify(new InvoicePaid($invoice));
```

알림이 큐로 전송될 때는, 각각의 수신자와 채널 조합별로 큐 작업이 생성됩니다. 예를 들어, 수신자가 3명이고 채널이 2개라면, 큐에 6개의 작업이 추가됩니다.

<a name="delaying-notifications"></a>
#### 알림 지연(delaying) 전송

알림의 전송을 지연하고 싶다면, 알림 인스턴스를 만들 때 `delay` 메서드를 체이닝하면 됩니다.

```php
$delay = now()->addMinutes(10);

$user->notify((new InvoicePaid($invoice))->delay($delay));
```

특정 채널별로 지연 시간을 다르게 지정하려면 `delay` 메서드에 배열을 전달하면 됩니다.

```php
$user->notify((new InvoicePaid($invoice))->delay([
    'mail' => now()->addMinutes(5),
    'sms' => now()->addMinutes(10),
]));
```

또는, 알림 클래스에 직접 `withDelay` 메서드를 정의해도 됩니다. 이 메서드는 채널 이름과 지연 시간을 담은 배열을 반환해야 합니다.

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
#### 알림 큐 커넥션 커스텀

기본적으로 큐잉된 알림은 애플리케이션의 기본 큐 커넥션을 사용합니다. 특정 알림에 대해 별도의 커넥션을 지정하고 싶다면, 알림의 생성자에서 `onConnection` 메서드를 호출하면 됩니다.

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

또는, 각 채널별로 알림에 사용할 큐 커넥션을 따로 지정하고 싶다면, 알림 클래스에 `viaConnections` 메서드를 정의할 수 있습니다. 이 메서드는 채널명/큐 커넥션명의 쌍으로 이루어진 배열을 반환해야 합니다.

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
#### 채널별 큐 지정

각 알림 채널에 사용할 큐를 직접 지정하고 싶다면, `viaQueues` 메서드를 알림 클래스에 정의할 수 있습니다. 이 메서드는 채널명/큐 이름의 쌍을 반환해야 합니다.

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
#### 큐잉된 알림의 미들웨어

큐에 등록된 알림은 [일반적인 큐 작업과 마찬가지로](/docs/queues#job-middleware) 미들웨어를 정의할 수 있습니다. 사용을 시작하려면, 알림 클래스에 `middleware` 메서드를 정의하세요. 이 메서드는 `$notifiable`(알림 대상)과 `$channel`(채널명) 변수를 받아, 알림의 목적지에 따라 반환할 미들웨어를 커스텀할 수 있습니다.

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

큐잉된 알림이 데이터베이스 트랜잭션 안에서 디스패치되면, 큐 작업이 데이터베이스 트랜잭션이 커밋되기 전에 처리될 수 있습니다. 이 경우, 트랜잭션 도중에 변경된 모델이나 레코드는 데이터베이스에 아직 반영되지 않았을 수 있습니다. 또한 트랜잭션 안에서 생성된 모델이나 레코드가 데이터베이스에 존재하지 않을 수도 있습니다. 알림이 이런 모델에 의존한다면, 큐작업이 처리될 때 예기치 못한 오류가 발생할 수 있습니다.

큐 커넥션의 `after_commit` 구성 옵션이 `false`로 되어 있다면, 알림을 보낼 때 `afterCommit` 메서드를 호출해 모든 데이터베이스 트랜잭션이 커밋된 후에 알림이 디스패치되도록 지정할 수 있습니다.

```php
use App\Notifications\InvoicePaid;

$user->notify((new InvoicePaid($invoice))->afterCommit());
```

또는 알림 클래스의 생성자에서 `afterCommit` 메서드를 호출해도 됩니다.

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
> 이러한 문제를 우회하는 방법에 대해 더 자세히 알아보고 싶다면, [큐 작업과 데이터베이스 트랜잭션](/docs/queues#jobs-and-database-transactions) 문서를 참고하세요.

<a name="determining-if-the-queued-notification-should-be-sent"></a>
#### 큐잉된 알림의 최종 전송 조건 결정

큐잉된 알림이 백그라운드 처리용 큐에 디스패치되면, 일반적으로 큐 워커에 의해 수락되어 지정된 수신자에게 전송됩니다.

하지만, 큐 워커가 알림을 처리한 후에 알림의 최종 전송 여부를 결정하고 싶다면, 알림 클래스에 `shouldSend` 메서드를 정의할 수 있습니다. 이 메서드가 `false`를 반환하면 알림은 전송되지 않습니다.

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
### 온디맨드 알림

때로는 애플리케이션에 "사용자"로 저장되지 않은 사람에게도 알림을 보내야 할 수 있습니다. 이럴 때는 `Notification` 파사드의 `route` 메서드를 사용하여 임시(al-hoc)로 알림 라우팅 정보를 지정한 뒤 알림을 전송할 수 있습니다.

```php
use Illuminate\Broadcasting\Channel;
use Illuminate\Support\Facades\Notification;

Notification::route('mail', 'taylor@example.com')
    ->route('vonage', '5555555555')
    ->route('slack', '#slack-channel')
    ->route('broadcast', [new Channel('channel-name')])
    ->notify(new InvoicePaid($invoice));
```

메일 채널에 온디맨드 알림을 보낼 때 수신자의 이름도 함께 지정하고 싶다면, 배열의 첫 요소에 이메일 주소를 key로, 이름을 value로 전달하면 됩니다.

```php
Notification::route('mail', [
    'barrett@example.com' => 'Barrett Blair',
])->notify(new InvoicePaid($invoice));
```

`routes` 메서드를 사용하여 여러 알림 채널에 대한 라우팅 정보를 한 번에 전달할 수도 있습니다.

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

알림이 이메일로 전송될 수 있도록 하려면, 알림 클래스에 `toMail` 메서드를 정의해야 합니다. 이 메서드는 `$notifiable` 엔터티를 받고, `Illuminate\Notifications\Messages\MailMessage` 인스턴스를 반환해야 합니다.

`MailMessage` 클래스는 트랜잭션 메일을 만들 때 유용한 간단한 메서드들을 제공합니다. 메일 메시지는 여러 줄의 텍스트뿐만 아니라 "콜 투 액션(call to action)" 또한 포함할 수 있습니다. 예시 `toMail` 메서드는 다음과 같습니다.

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
> 위의 `toMail` 메서드에서 `$this->invoice->id`와 같은 데이터를 사용하는 방법처럼, 알림 메시지 생성에 필요한 데이터는 알림의 생성자(Constructor)로 전달할 수 있습니다.

위 예제는 인사말, 텍스트 줄, 콜 투 액션 버튼, 마지막 텍스트 라인까지 포함해서 메일 메시지를 간결하고 빠르게 작성할 수 있음을 보여줍니다. 메일 채널은 이 메시지 구성을 아름다운 반응형 HTML 이메일 템플릿과 텍스트 버전으로 변환해줍니다. 아래는 `mail` 채널로 생성된 이메일 예시입니다.

<img src="https://laravel.com/img/docs/notification-example-2.png"/>

> [!NOTE]
> 메일 알림을 전송할 때는, `config/app.php` 설정 파일에서 `name` 옵션이 반드시 설정되어 있어야 합니다. 이 값은 메일 알림 메시지의 헤더와 푸터에 사용됩니다.

<a name="error-messages"></a>
#### 에러 메시지

일부 알림은 실패한 송장 결제처럼 사용자에게 오류 상황을 안내할 수도 있습니다. 이런 경우, 메시지를 빌드할 때 `error` 메서드를 호출해 이 메일이 오류 메시지임을 표시할 수 있습니다. `error` 메서드를 사용하면 콜 투 액션 버튼이 검정이 아니라 빨간색으로 표시됩니다.

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
#### 메일 알림의 기타 포매팅 옵션

알림 클래스에서 텍스트 줄을 직접 정의하는 대신, `view` 메서드를 사용해 알림 이메일 표시를 위한 커스텀 템플릿을 지정할 수도 있습니다.

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

메일 메시지의 평문 템플릿도 사용할 수 있는데, 이 경우 `view` 메서드에 배열 형태로 뷰명을 전달하면 됩니다. 두 번째 요소에 평문 뷰의 이름을 지정하면 됩니다.

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

또는, 메시지가 오로지 평문 뷰만으로 구성된다면 `text` 메서드를 사용할 수 있습니다.

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
### 발신자 커스텀

기본적으로 이메일의 발신자(From) 주소는 `config/mail.php` 설정 파일에 정의되어 있습니다. 그러나 특정 알림에 대해 별도의 발신자 주소를 지정하고 싶다면, `from` 메서드를 사용하면 됩니다.

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
### 수신자 커스텀

`mail` 채널을 통해 알림을 보낼 때, 시스템은 알림 대상(notifiable) 엔티티의 `email` 속성을 자동으로 찾아서 메일을 발송합니다. 전송에 사용할 이메일 주소를 직접 커스텀하려면, notifiable 엔티티에 `routeNotificationForMail` 메서드를 정의하세요.

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

        // 이메일 주소와 이름을 모두 반환...
        return [$this->email_address => $this->name];
    }
}
```

<a name="customizing-the-subject"></a>
### 제목 커스텀

기본적으로 이메일의 제목(subject)은 알림 클래스의 이름을 "Title Case"로 변환한 값입니다. 예를 들어, 알림 클래스 이름이 `InvoicePaid`라면, 이메일 제목은 `Invoice Paid`가 됩니다. 메시지에 별도의 제목을 지정하고 싶다면, 메시지 작성 시 `subject` 메서드를 호출하면 됩니다.

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

<a name="customizing-the-mailer"></a>

### 메일러 커스터마이징

기본적으로 이메일 알림은 `config/mail.php` 설정 파일에 정의된 기본 메일러를 사용하여 발송됩니다. 그러나 메시지를 작성할 때 `mailer` 메서드를 호출하면 런타임에 다른 메일러를 지정할 수도 있습니다.

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

알림에서 사용하는 HTML 및 일반 텍스트 템플릿은 알림 패키지의 리소스를 퍼블리시하여 수정할 수 있습니다. 아래 명령어를 실행하면 메일 알림 템플릿이 `resources/views/vendor/notifications` 디렉터리에 복사됩니다.

```shell
php artisan vendor:publish --tag=laravel-notifications
```

<a name="mail-attachments"></a>
### 첨부 파일 추가

이메일 알림에 첨부 파일을 추가하려면 메시지 작성 시 `attach` 메서드를 사용하면 됩니다. 이 메서드의 첫 번째 인자로는 첨부할 파일의 절대 경로를 전달합니다.

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
> 알림 메일 메시지의 `attach` 메서드는 [attachable 객체](/docs/mail#attachable-objects)도 지원합니다. 자세한 내용은 [attachable 객체 공식 문서](/docs/mail#attachable-objects)를 참고하십시오.

파일을 첨부할 때, 두 번째 인자로 `array`를 전달하여 파일의 표시 이름(`as`)이나 MIME 타입(`mime`)도 지정할 수 있습니다.

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

mailable 객체에서 파일을 첨부할 때와 달리, 알림에서는 `attachFromStorage`를 직접 사용할 수 없습니다. 대신 `attach` 메서드에서 파일의 절대 경로를 지정해야 합니다. 혹은 `toMail` 메서드에서 [mailable](/docs/mail#generating-mailables)를 반환하는 방법도 있습니다.

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

필요하다면, `attachMany` 메서드를 사용하여 여러 파일을 한 번에 첨부할 수 있습니다.

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

`attachData` 메서드를 사용하면 바이트 문자열(raw string of bytes) 데이터를 첨부 파일로 추가할 수 있습니다. 이 메서드에는 첨부할 데이터와 함께, 첨부 시 사용할 파일명을 전달해야 합니다.

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
### 태그 및 메타데이터 추가

Mailgun, Postmark 등 일부 서드파티 이메일 서비스에서는 메시지를 그룹화하고 추적하기 위해 "태그(tag)"와 "메타데이터(metadata)" 기능을 지원합니다. 메일 메시지에 태그와 메타데이터를 추가하려면 각각 `tag`와 `metadata` 메서드를 사용할 수 있습니다.

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

Mailgun 드라이버를 사용하는 경우, [태그](https://documentation.mailgun.com/en/latest/user_manual.html#tagging-1) 및 [메타데이터](https://documentation.mailgun.com/en/latest/user_manual.html#attaching-data-to-messages) 지원에 대한 자세한 내용은 Mailgun 공식 문서를 참고하십시오. 마찬가지로, Postmark의 [태그](https://postmarkapp.com/blog/tags-support-for-smtp) 및 [메타데이터](https://postmarkapp.com/support/article/1125-custom-metadata-faq) 지원도 Postmark 공식 문서를 참고할 수 있습니다.

Amazon SES에서 이메일을 발송한다면, 메시지에 [SES "태그"](https://docs.aws.amazon.com/ses/latest/APIReference/API_MessageTag.html)를 추가할 때도 `metadata` 메서드를 사용하면 됩니다.

<a name="customizing-the-symfony-message"></a>
### Symfony 메시지 커스터마이징

`MailMessage` 클래스의 `withSymfonyMessage` 메서드를 사용하면, 메시지 발송 전에 Symfony Message 인스턴스를 전달하는 클로저를 등록할 수 있습니다. 이를 통해 메시지 발송 전에 더욱 깊은 커스터마이징이 가능합니다.

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

필요하다면, 알림의 `toMail` 메서드에서 [mailable 객체](/docs/mail)를 전체 반환할 수도 있습니다. 이때는 `MailMessage` 대신 `Mailable`을 반환하며, 수신자는 mailable 객체의 `to` 메서드를 이용해 반드시 명시해야 합니다.

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

[온디맨드 알림](#on-demand-notifications)을 전송하는 경우, `toMail` 메서드로 전달된 `$notifiable` 인스턴스는 `Illuminate\Notifications\AnonymousNotifiable`의 인스턴스입니다. 이 객체는 해당 알림을 전송할 이메일 주소를 얻기 위해 `routeNotificationFor` 메서드를 제공합니다.

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

메일 알림 템플릿을 디자인할 때, Blade 템플릿처럼 브라우저에서 바로 렌더링된 메일 메시지를 빠르게 미리 볼 수 있으면 편리합니다. 이를 위해, Laravel에서는 알림에서 생성한 메일 메시지를 라우트 클로저나 컨트롤러에서 직접 반환할 수 있도록 지원합니다. `MailMessage`가 반환될 경우, 브라우저에 바로 렌더링되어 디자인을 실시간으로 미리 확인할 수 있습니다. 실제 이메일 주소로 보내지 않아도 됩니다.

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
## 마크다운(Markdown) 메일 알림

마크다운(Markdown) 메일 알림 기능을 사용하면, 기본 알림 템플릿의 장점은 유지하면서 다양한 커스터마이즈와 풍부한 메시징이 가능합니다. 메시지는 마크다운 문법으로 작성되므로, Laravel에서는 이를 아름답고 반응형인 HTML 템플릿으로 렌더링하는 동시에, 자동으로 일반 텍스트 버전도 생성해 줍니다.

<a name="generating-the-message"></a>
### 메시지 생성하기

마크다운 템플릿이 포함된 알림을 생성하려면, `make:notification` Artisan 명령어에 `--markdown` 옵션을 사용할 수 있습니다.

```shell
php artisan make:notification InvoicePaid --markdown=mail.invoice.paid
```

다른 메일 알림과 마찬가지로, 마크다운 템플릿 알림도 알림 클래스에 `toMail` 메서드를 정의해야 합니다. 하지만, 알림 생성 시 `line`과 `action` 메서드 대신 `markdown` 메서드를 사용하여 사용할 마크다운 템플릿의 이름을 지정합니다. 또한 해당 템플릿에서 사용 가능한 데이터를 배열로 두 번째 인자로 함께 전달할 수 있습니다.

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

마크다운 메일 알림은 Blade 컴포넌트와 마크다운 문법을 조합하여 사용할 수 있습니다. 이를 통해 Laravel이 미리 준비한 알림용 컴포넌트를 손쉽게 활용하여 메시지를 구성할 수 있습니다.

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
> 마크다운 이메일을 작성할 때 들여쓰기를 과도하게 사용하지 마십시오. 마크다운 표준에 따라, 들여쓰기가 포함된 내용은 코드 블록으로 렌더링될 수 있습니다.

<a name="button-component"></a>
#### 버튼 컴포넌트

버튼 컴포넌트는 가운데 정렬된 버튼 링크를 렌더링합니다. 이 컴포넌트는 `url`과 선택적으로 `color` 인자를 받습니다. 지원되는 색상은 `primary`, `green`, `red`입니다. 하나의 알림에 여러 개의 버튼 컴포넌트를 추가할 수도 있습니다.

```blade
<x-mail::button :url="$url" color="green">
View Invoice
</x-mail::button>
```

<a name="panel-component"></a>
#### 패널 컴포넌트

패널 컴포넌트는 지정된 블록 텍스트를 알림의 다른 부분과 약간 다른 배경 색상으로 감싸서, 해당 블록에 주목할 수 있도록 만들어줍니다.

```blade
<x-mail::panel>
This is the panel content.
</x-mail::panel>
```

<a name="table-component"></a>
#### 테이블 컴포넌트

테이블 컴포넌트를 사용하면 마크다운 표를 HTML 표로 변환할 수 있습니다. 이 컴포넌트 안에 마크다운 표 형식으로 입력하면 됩니다. 컬럼 정렬도 기본 마크다운 표 문법대로 지원됩니다.

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

마크다운 알림용 모든 컴포넌트를 직접 애플리케이션으로 복사해 원하는 대로 커스터마이즈할 수 있습니다. 컴포넌트를 복사하려면 `vendor:publish` Artisan 명령어로 `laravel-mail` 에셋 태그를 퍼블리시합니다.

```shell
php artisan vendor:publish --tag=laravel-mail
```

이렇게 하면 마크다운 메일 컴포넌트가 `resources/views/vendor/mail` 디렉터리에 복사됩니다. `mail` 디렉터리는 `html`과 `text` 하위 디렉터리를 갖는데, 각각 HTML 및 일반 텍스트 버전의 컴포넌트가 포함되어 있습니다. 이 컴포넌트들은 자유롭게 수정할 수 있습니다.

<a name="customizing-the-css"></a>
#### CSS 커스터마이징

컴포넌트를 퍼블리시하면, `resources/views/vendor/mail/html/themes` 디렉터리에 `default.css` 파일이 생성됩니다. 이 파일의 CSS를 수정하면, 여러분이 작성한 스타일이 자동으로 마크다운 알림의 HTML에 인라인 적용됩니다.

만약 라라벨 마크다운 컴포넌트만의 새로운 테마를 만들고 싶다면, 해당 디렉터리 내에 CSS 파일을 직접 만들고 저장하면 됩니다. 그리고 `mail` 설정 파일에서 `theme` 옵션에 새 테마 이름을 지정해주면, 해당 테마가 적용됩니다.

각각의 알림 마다 별도 테마를 지정하려면, 알림의 메일 메시지 생성 시 `theme` 메서드를 호출해 사용하면 됩니다. 이때, 사용하고자 하는 테마의 이름을 인자로 전달합니다.

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

`database` 알림 채널은 알림 정보를 데이터베이스 테이블에 저장합니다. 이 테이블에는 알림의 타입 및 알림을 기술하는 JSON 데이터 구조가 포함됩니다.

이 테이블을 쿼리하여 애플리케이션 UI에 알림을 표시할 수 있습니다. 이 작업을 위해서는 우선 알림 정보를 저장할 테이블을 생성해야 합니다. `make:notifications-table` 명령어를 통해 [마이그레이션](/docs/migrations)을 생성할 수 있습니다.

```shell
php artisan make:notifications-table

php artisan migrate
```

> [!NOTE]
> 알림 모델이 [UUID 또는 ULID 기본 키](/docs/eloquent#uuid-and-ulid-keys)를 사용하는 경우, 마이그레이션 생성 시 `morphs` 대신 [uuidMorphs](/docs/migrations#column-method-uuidMorphs) 또는 [ulidMorphs](/docs/migrations#column-method-ulidMorphs)를 사용해야 합니다.

<a name="formatting-database-notifications"></a>
### 데이터베이스 알림 데이터 포매팅

알림이 데이터베이스 테이블에 저장될 수 있다면, 알림 클래스에 `toDatabase` 또는 `toArray` 메서드를 정의해야 합니다. 이 메서드는 `$notifiable` 엔터티를 받아 순수 PHP 배열을 반환해야 합니다. 반환된 배열은 JSON으로 인코딩되어 `notifications` 테이블의 `data` 컬럼에 저장됩니다. 아래는 예시로 `toArray` 메서드를 구현한 모습입니다.

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

알림이 데이터베이스에 저장될 때, 기본적으로 `type` 컬럼은 알림 클래스 이름으로, `read_at` 컬럼은 `null`로 설정됩니다. 이 동작을 변경하려면 알림 클래스에서 `databaseType` 또는 `initialDatabaseReadAtValue` 메서드를 정의할 수 있습니다.

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
#### `toDatabase`와 `toArray`의 차이

`toArray` 메서드는 `broadcast` 채널에서도 데이터를 전송할 때 사용됩니다. 만약 `database` 채널과 `broadcast` 채널에서 각각 다른 배열 구조를 반환하고 싶다면, `toArray` 대신 `toDatabase` 메서드를 별도로 정의해야 합니다.

<a name="accessing-the-notifications"></a>
### 알림 데이터 액세스

알림이 데이터베이스에 저장된 후에는, 알림을 쉽게 조회할 수 있어야 합니다. Laravel의 기본 `App\Models\User` 모델에도 포함된 `Illuminate\Notifications\Notifiable` 트레이트는 Eloquent의 `notifications` [관계](/docs/eloquent-relationships)를 제공합니다. 일반적인 Eloquent 관계와 마찬가지로, 이 메서드로 알림을 손쉽게 가져올 수 있습니다. 기본적으로 최근에 생성된 순서대로(최신순) 정렬됩니다.

```php
$user = App\Models\User::find(1);

foreach ($user->notifications as $notification) {
    echo $notification->type;
}
```

"읽지 않은" 알림만 조회하고 싶다면, `unreadNotifications` 관계를 이용할 수 있습니다. 이 역시 최신순으로 정렬되어 반환됩니다.

```php
$user = App\Models\User::find(1);

foreach ($user->unreadNotifications as $notification) {
    echo $notification->type;
}
```

> [!NOTE]
> 자바스크립트 클라이언트에서 알림 데이터를 얻으려면, 알림 컨트롤러를 생성해 해당 엔터티(예: 현재 사용자)의 알림을 반환하게 해야 합니다. 그 컨트롤러의 URL에 자바스크립트로 HTTP 요청을 보내면 됩니다.

<a name="marking-notifications-as-read"></a>
### 알림 읽음 처리

일반적으로 사용자가 알림을 확인하면, 해당 알림을 "읽음"으로 표시해야 합니다. `Illuminate\Notifications\Notifiable` 트레이트의 `markAsRead` 메서드는 알림 데이터베이스 레코드의 `read_at` 컬럼을 업데이트해줍니다.

```php
$user = App\Models\User::find(1);

foreach ($user->unreadNotifications as $notification) {
    $notification->markAsRead();
}
```

각 알림을 하나씩 순회하지 않고, 알림 컬렉션 전체에 직접 `markAsRead`를 호출할 수도 있습니다.

```php
$user->unreadNotifications->markAsRead();
```

알림 데이터를 전부 조회하지 않고 한 번에 "읽음" 처리하려면, 대량 업데이트 쿼리를 사용할 수 있습니다.

```php
$user = App\Models\User::find(1);

$user->unreadNotifications()->update(['read_at' => now()]);
```

알림을 테이블에서 완전히 삭제하려면, `delete` 메서드를 호출합니다.

```php
$user->notifications()->delete();
```

<a name="broadcast-notifications"></a>
## 브로드캐스트 알림

<a name="broadcast-prerequisites"></a>
### 사전 준비

브로드캐스트 알림을 사용하기 전에, Laravel의 [이벤트 브로드캐스팅](/docs/broadcasting) 서비스를 먼저 설정하고 숙지하는 것이 좋습니다. 이벤트 브로드캐스팅을 통해 백엔드에서 발생한 Laravel 이벤트를 자바스크립트 프론트엔드에서 실시간으로 감지할 수 있습니다.

<a name="formatting-broadcast-notifications"></a>
### 브로드캐스트 알림 데이터 포매팅

`broadcast` 채널은 Laravel의 [이벤트 브로드캐스팅](/docs/broadcasting) 서비스를 통해, 자바스크립트 프론트엔드에 실시간으로 알림을 전송합니다. 브로드캐스팅을 지원하는 알림 클래스에는 `toBroadcast` 메서드를 정의할 수 있습니다. 이 메서드는 `$notifiable` 엔터티를 받아 `BroadcastMessage` 인스턴스를 반환해야 합니다. 만약 `toBroadcast`가 없으면, `toArray` 메서드를 사용해 브로드캐스트 데이터가 생성됩니다. 이 데이터는 JSON으로 인코딩되어 자바스크립트 프론트엔드로 전송됩니다. 다음은 `toBroadcast` 메서드 예시입니다.

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

모든 브로드캐스트 알림은 기본적으로 큐잉되어 발송됩니다. 브로드캐스트 작업이 사용할 큐 연결이나 큐 이름을 설정하려면, `BroadcastMessage`의 `onConnection`, `onQueue` 메서드를 사용할 수 있습니다.

```php
return (new BroadcastMessage($data))
    ->onConnection('sqs')
    ->onQueue('broadcasts');
```

<a name="customizing-the-notification-type"></a>
#### 알림 타입 커스터마이징

알림 데이터 이외에도 모든 브로드캐스트 알림에는 해당 알림의 전체 클래스 이름이 포함된 `type` 필드가 있습니다. 만약 알림의 `type`을 커스터마이즈하고 싶다면, 알림 클래스 내에 `broadcastType` 메서드를 정의하면 됩니다.

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
### 알림 리스닝

알림은 `{notifiable}.{id}` 형태의 프라이빗 채널로 브로드캐스트됩니다. 예를 들어, `App\Models\User` 인스턴스의 ID가 `1`이라면, 해당 알림은 `App.Models.User.1` 프라이빗 채널로 전송됩니다. [Laravel Echo](/docs/broadcasting#client-side-installation)를 사용하면, `notification` 메서드로 해당 채널에서 알림을 편리하게 구독할 수 있습니다.

```js
Echo.private('App.Models.User.' + userId)
    .notification((notification) => {
        console.log(notification.type);
    });
```

<a name="customizing-the-notification-channel"></a>
#### 알림 채널 커스터마이징

알림이 브로드캐스트될 채널명을 커스터마이즈하고 싶다면, 알림을 받을 엔터티(예: User 모델)에 `receivesBroadcastNotificationsOn` 메서드를 정의할 수 있습니다.

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

라라벨에서 SMS 알림 전송은 [Vonage](https://www.vonage.com/) (이전 명칭: Nexmo) 서비스를 통해 이뤄집니다. Vonage를 통해 알림을 보내려면 우선 `laravel/vonage-notification-channel` 패키지와 `guzzlehttp/guzzle` 패키지를 설치해야 합니다:

```shell
composer require laravel/vonage-notification-channel guzzlehttp/guzzle
```

이 패키지에는 [설정 파일](https://github.com/laravel/vonage-notification-channel/blob/3.x/config/vonage.php)이 포함되어 있습니다. 다만, 이 설정 파일을 여러분의 애플리케이션으로 내보낼 필요는 없습니다. `VONAGE_KEY`와 `VONAGE_SECRET` 환경 변수만 등록하면 공개 키와 비밀 키를 설정할 수 있습니다.

키를 정의한 후에는, SMS 메시지가 기본적으로 어떤 전화번호에서 발송될지 지정하는 `VONAGE_SMS_FROM` 환경 변수를 추가로 설정해야 합니다. 이 전화번호는 Vonage 관리 콘솔에서 생성할 수 있습니다:

```ini
VONAGE_SMS_FROM=15556666666
```

<a name="formatting-sms-notifications"></a>
### SMS 알림 형식 지정

알림이 SMS 전송을 지원한다면 해당 알림 클래스에 `toVonage` 메서드를 정의해야 합니다. 이 메서드는 `$notifiable` 엔티티를 인자로 받아 `Illuminate\Notifications\Messages\VonageMessage` 인스턴스를 반환해야 합니다.

```php
use Illuminate\Notifications\Messages\VonageMessage;

/**
 * 알림의 Vonage/SMS 표현을 반환합니다.
 */
public function toVonage(object $notifiable): VonageMessage
{
    return (new VonageMessage)
        ->content('Your SMS message content');
}
```

<a name="unicode-content"></a>
#### 유니코드(Unicode) 문자 포함

SMS 메시지에 유니코드 문자가 포함되어야 한다면, `VonageMessage` 인스턴스 생성 시 `unicode` 메서드를 호출해야 합니다.

```php
use Illuminate\Notifications\Messages\VonageMessage;

/**
 * 알림의 Vonage/SMS 표현을 반환합니다.
 */
public function toVonage(object $notifiable): VonageMessage
{
    return (new VonageMessage)
        ->content('Your unicode message')
        ->unicode();
}
```

<a name="customizing-the-from-number"></a>
### 발신 번호("From") 커스터마이징

일부 알림을 `VONAGE_SMS_FROM` 환경 변수에 지정된 번호와 다르게 발송하고 싶다면, `VonageMessage` 인스턴스의 `from` 메서드를 사용하면 됩니다.

```php
use Illuminate\Notifications\Messages\VonageMessage;

/**
 * 알림의 Vonage/SMS 표현을 반환합니다.
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

사용자나 팀, 클라이언트별로 비용을 추적하고 싶을 때는 알림에 "클라이언트 참조(client reference)" 값을 추가할 수 있습니다. Vonage는 이 값을 통해 사용자별 SMS 사용량 보고서를 생성할 수 있습니다. 클라이언트 참조는 최대 40자까지의 문자열을 사용할 수 있습니다.

```php
use Illuminate\Notifications\Messages\VonageMessage;

/**
 * 알림의 Vonage/SMS 표현을 반환합니다.
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

Vonage 알림을 올바른 전화번호로 보낼 수 있도록, notifiable 엔티티에 `routeNotificationForVonage` 메서드를 정의해야 합니다.

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

Slack 알림을 보내기 전에, Composer를 통해 Slack 알림 채널 패키지를 설치해야 합니다.

```shell
composer require laravel/slack-notification-channel
```

또한, Slack 워크스페이스용 [Slack App](https://api.slack.com/apps?new_app=1)을 생성해야 합니다.

만약 해당 App을 생성한 동일한 워크스페이스에만 알림을 보낼 계획이라면, App에 `chat:write`, `chat:write.public`, `chat:write.customize` 스코프가 포함되어야 합니다. 이 스코프들은 Slack의 "OAuth & Permissions" 앱 관리 탭에서 추가할 수 있습니다.

다음으로, App의 "Bot User OAuth Token"을 복사해 애플리케이션의 `services.php` 설정 파일 내 `slack` 설정 배열에 등록해야 합니다. 이 토큰은 Slack의 "OAuth & Permissions" 탭에서 확인할 수 있습니다.

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

외부의, 즉 애플리케이션 사용자가 소유한 Slack 워크스페이스로 알림을 전송하려면 Slack을 통해 App을 "배포(distribute)"해야 합니다. App 배포는 Slack의 "Manage Distribution" 탭에서 관리할 수 있습니다. 앱을 배포한 뒤에는, [Socialite](/docs/socialite)를 사용해 [Slack Bot 토큰](/docs/socialite#slack-bot-scopes)을 사용자별로 획득할 수 있습니다.

<a name="formatting-slack-notifications"></a>
### Slack 알림의 형식 지정

알림이 Slack 메시지 전송을 지원하는 경우, 해당 알림 클래스에 `toSlack` 메서드를 정의해야 합니다. 이 메서드는 `$notifiable` 엔티티를 인자로 받아 `Illuminate\Notifications\Slack\SlackMessage` 인스턴스를 반환합니다. [Slack의 Block Kit API](https://api.slack.com/block-kit)를 활용해서 풍부한 형태의 알림을 만들 수 있습니다. 아래 예시는 [Slack의 Block Kit builder](https://app.slack.com/block-kit-builder/T01KWS6K23Z#%7B%22blocks%22:%5B%7B%22type%22:%22header%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22Invoice%20Paid%22%7D%7D,%7B%22type%22:%22context%22,%22elements%22:%5B%7B%22type%22:%22plain_text%22,%22text%22:%22Customer%20%231234%22%7D%5D%7D,%7B%22type%22:%22section%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22An%20invoice%20has%20been%20paid.%22%7D,%22fields%22:%5B%7B%22type%22:%22mrkdwn%22,%22text%22:%22*Invoice%20No:*%5Cn1000%22%7D,%7B%22type%22:%22mrkdwn%22,%22text%22:%22*Invoice%20Recipient:*%5Cntaylor@laravel.com%22%7D%5D%7D,%7B%22type%22:%22divider%22%7D,%7B%22type%22:%22section%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22Congratulations!%22%7D%7D%5D%7D)에서 미리볼 수 있습니다.

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
#### Slack의 Block Kit Builder 템플릿 사용

Block Kit 메시지를 fluent 방식의 빌더 메서드로 직접 작성하기보다는, Slack Block Kit Builder에서 생성된 원본 JSON 페이로드를 `usingBlockKitTemplate` 메서드에 전달할 수도 있습니다.

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
### Slack 상호작용 기능

Slack의 Block Kit 알림 시스템은 [사용자 인터랙션 처리](https://api.slack.com/interactivity/handling) 등 다양한 상호작용 기능을 제공합니다. 이 기능을 활용하려면 Slack App에서 "Interactivity"를 활성화하고, 애플리케이션에서 제공하는 URL을 "Request URL"로 설정해야 합니다. 해당 세팅은 Slack의 "Interactivity & Shortcuts" 앱 관리 탭에서 할 수 있습니다.

아래 예시에서처럼 `actionsBlock` 메서드를 사용할 경우, 사용자가 버튼을 클릭하면 Slack은 여러분의 "Request URL"로 해당 사용자, 클릭된 버튼 ID 등 관련 정보를 담은 `POST` 요청을 전송합니다. 애플리케이션에서는 이 페이로드를 바탕으로 적절한 처리를 할 수 있습니다. 또한 반드시 [Slack 인증 요청 검증](https://api.slack.com/authentication/verifying-requests-from-slack)도 수행해야 합니다.

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
             // 아이디는 기본값으로 "button_acknowledge_invoice"가 사용됩니다...
            $block->button('Acknowledge Invoice')->primary();

            // 아이디를 직접 설정할 수도 있습니다...
            $block->button('Deny')->danger()->id('deny_invoice');
        });
}
```

<a name="slack-confirmation-modals"></a>
#### 확인(Confirmation) 모달창

행동에 앞서 사용자의 확인을 반드시 받고 싶을 때는 버튼 정의 시 `confirm` 메서드를 사용할 수 있습니다. `confirm` 메서드는 메시지와, `ConfirmObject` 인스턴스를 전달받는 클로저를 인자로 받습니다.

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
#### Slack Block 빠르게 확인하기

작성한 블록을 바로 확인하고 싶다면, `SlackMessage` 인스턴스의 `dd` 메서드를 호출하면 됩니다. 이 메서드는 Slack의 [Block Kit Builder](https://app.slack.com/block-kit-builder/)로 바로 접속할 수 있는 URL(또는 원시 페이로드)을 생성해줍니다. `dd` 메서드에 `true`를 인자로 넘기면 원시 페이로드도 출력됩니다.

```php
return (new SlackMessage)
    ->text('One of your invoices has been paid!')
    ->headerBlock('Invoice Paid')
    ->dd();
```

<a name="routing-slack-notifications"></a>
### Slack 알림 라우팅

Slack 알림을 적절한 팀 및 채널로 전송하려면 notifiable 모델에 `routeNotificationForSlack` 메서드를 정의해야 합니다. 이 메서드는 다음 세 가지 중 하나의 값을 반환할 수 있습니다.

- `null` - 알림의 채널 설정을 notification 클래스 내에서 따릅니다. 이 경우 알림 생성 시 `SlackMessage`에서 `to` 메서드로 채널을 지정할 수 있습니다.
- 전송할 Slack 채널을 직접 문자열로 지정. 예: `#support-channel`
- `SlackRoute` 인스턴스. OAuth 토큰과 채널명을 직접 지정할 수 있으며, 외부 워크스페이스로 보낼 때 사용합니다.

예를 들어, `routeNotificationForSlack`에서 `#support-channel`을 반환하면, `services.php`에 등록된 Bot User OAuth 토큰이 연결된 워크스페이스 내의 `#support-channel` 채널로 알림을 전송합니다.

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
> 외부 Slack 워크스페이스로 알림을 보내기 전에, 해당 Slack 앱이 반드시 [배포](#slack-app-distribution)되어 있어야 합니다.

개발할 때 애플리케이션 사용자가 소유한 Slack 워크스페이스로 알림을 보내는 경우가 많습니다. 이때는 먼저 사용자의 Slack OAuth 토큰을 획득해야 합니다. 다행히 [Laravel Socialite](/docs/socialite)에서 Slack 드라이버를 지원하여 사용자를 손쉽게 Slack에 인증하고 [bot 토큰](/docs/socialite#slack-bot-scopes)을 획득할 수 있습니다.

봇 토큰을 획득하여 데이터베이스에 저장했다면, `SlackRoute::make` 메서드를 통해 사용자의 워크스페이스로 알림을 라우팅할 수 있습니다. 또한, 사용자에게 알림이 전송될 채널을 직접 지정할 수 있는 UI를 제공하는 것이 일반적입니다.

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
## 알림의 로컬라이징(다국어 지원)

라라벨은 알림을 HTTP 요청의 현재 로케일(local)과 다르게 전송할 수 있으며, 심지어 알림이 큐잉(queued)된 경우에도 해당 로케일을 기억합니다.

이를 위해 `Illuminate\Notifications\Notification` 클래스는 로케일을 지정할 수 있는 `locale` 메서드를 제공합니다. 알림이 전송되는 동안 애플리케이션은 이 로케일로 임시 전환되었다가, 완료 후 다시 원래 로케일로 복원됩니다.

```php
$user->notify((new InvoicePaid($invoice))->locale('es'));
```

여러 notifiable 엔티티에 대해 로케일을 설정할 때는 `Notification` 파사드의 `locale` 메서드를 사용할 수 있습니다.

```php
Notification::locale('es')->send(
    $users, new InvoicePaid($invoice)
);
```

<a name="user-preferred-locales"></a>
### 사용자 선호 로케일

애플리케이션에서 각 사용자의 선호 로케일을 따로 저장하는 경우가 있습니다. notifiable 모델에 `HasLocalePreference` 계약을 구현하면 라라벨은 알림을 전송할 때 해당 모델에 저장된 로케일을 자동으로 사용합니다.

```php
use Illuminate\Contracts\Translation\HasLocalePreference;

class User extends Model implements HasLocalePreference
{
    /**
     * 사용자의 선호 로케일 반환
     */
    public function preferredLocale(): string
    {
        return $this->locale;
    }
}
```

이 인터페이스를 구현하면, 알림이나 메일을 보낼 때 라라벨이 자동으로 선호 로케일을 참조하므로 따로 `locale` 메서드를 호출할 필요가 없습니다.

```php
$user->notify(new InvoicePaid($invoice));
```

<a name="testing"></a>
## 테스트

알림이 실제로 전송되지 않도록 하려면 `Notification` 파사드의 `fake` 메서드를 사용할 수 있습니다. 대부분의 경우, 실제로 알림을 전송하는 것보다 "알림 전송 요청이 있었는지"만 검증하면 충분하며, 실제 테스트 초점은 테스트 코드를 작성하는 것과 별개로 두는 것이 일반적입니다.

`Notification` 파사드의 `fake` 메서드를 호출한 뒤에는, 라라벨이 특정 알림을 전송하도록 지시했는지 검증하고, 알림이 받은 데이터도 확인할 수 있습니다.

```php tab=Pest
<?php

use App\Notifications\OrderShipped;
use Illuminate\Support\Facades\Notification;

test('orders can be shipped', function () {
    Notification::fake();

    // 주문 발송 처리...

    // 어떤 알림도 전송되지 않았는지 확인...
    Notification::assertNothingSent();

    // 특정 사용자에게 알림이 전송됐는지 확인...
    Notification::assertSentTo(
        [$user], OrderShipped::class
    );

    // 알림이 전송되지 않은 것도 확인할 수 있습니다...
    Notification::assertNotSentTo(
        [$user], AnotherNotification::class
    );

    // 지정한 횟수만큼 알림이 전송됐는지 확인할 수도 있습니다...
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

        // 주문 발송 처리...

        // 어떤 알림도 전송되지 않았는지 확인...
        Notification::assertNothingSent();

        // 특정 사용자에게 알림이 전송됐는지 확인...
        Notification::assertSentTo(
            [$user], OrderShipped::class
        );

        // 알림이 전송되지 않은 것도 확인할 수 있습니다...
        Notification::assertNotSentTo(
            [$user], AnotherNotification::class
        );

        // 지정한 횟수만큼 알림이 전송됐는지 확인할 수도 있습니다...
        Notification::assertCount(3);
    }
}
```

알림이 전송되었는지 검증(단언)할 때, "조건에 맞는 알림이 전송됐는가"를 판단할 수 있도록 `assertSentTo` 혹은 `assertNotSentTo` 메서드에 클로저를 전달할 수 있습니다. 주어진 조건을 만족하는 알림이 하나라도 존재한다면 검증이 통과합니다.

```php
Notification::assertSentTo(
    $user,
    function (OrderShipped $notification, array $channels) use ($order) {
        return $notification->order->id === $order->id;
    }
);
```

<a name="on-demand-notifications"></a>
#### 주문형(On-Demand) 알림 테스트

테스트 대상 코드가 [주문형 알림](#on-demand-notifications)을 전송한다면, `assertSentOnDemand` 메서드를 통해 주문형 알림의 전송 여부를 테스트할 수 있습니다.

```php
Notification::assertSentOnDemand(OrderShipped::class);
```

`assertSentOnDemand` 메서드에 두 번째 인자로 클로저를 넘기면, 해당 주문형 알림이 올바른 "라우트" 주소로 전송되었는지까지 검증할 수 있습니다.

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
#### 알림 전송(Notification Sending) 이벤트

알림이 전송될 때, 라라벨의 알림 시스템은 `Illuminate\Notifications\Events\NotificationSending` 이벤트를 발생시킵니다. 이 이벤트에는 "notifiable" 엔티티와 알림 인스턴스 자체가 모두 포함되어 있습니다. 여러분의 애플리케이션 내에서 이 이벤트에 대한 [이벤트 리스너](/docs/events)를 생성할 수 있습니다.

```php
use Illuminate\Notifications\Events\NotificationSending;

class CheckNotificationStatus
{
    /**
     * 이벤트 처리
     */
    public function handle(NotificationSending $event): void
    {
        // ...
    }
}
```

그리고 만약 `NotificationSending` 이벤트에 대한 이벤트 리스너의 `handle` 메서드가 `false`를 반환하면, 해당 알림은 전송되지 않습니다.

```php
/**
 * 이벤트 처리
 */
public function handle(NotificationSending $event): bool
{
    return false;
}
```

이벤트 리스너 내에선 이벤트의 `notifiable`, `notification`, `channel` 프로퍼티에 접근하여 수신자나 알림에 대한 상세 정보를 확인할 수 있습니다.

```php
/**
 * 이벤트 처리
 */
public function handle(NotificationSending $event): void
{
    // $event->channel
    // $event->notifiable
    // $event->notification
}
```

<a name="notification-sent-event"></a>

#### 알림 전송 이벤트

알림이 전송될 때, 라라벨의 알림 시스템에서는 `Illuminate\Notifications\Events\NotificationSent` [이벤트](/docs/events)가 발생합니다. 이 이벤트에는 "notifiable" 엔터티(알림을 받을 수 있는 객체)와 알림 인스턴스 자체가 포함되어 있습니다. 애플리케이션에서 이 이벤트에 대한 [이벤트 리스너](/docs/events)를 만들 수 있습니다.

```php
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

이벤트 리스너 내부에서는 이벤트 내에 있는 `notifiable`, `notification`, `channel`, `response` 속성에 접근하여 알림 수신자나 알림 자체에 대한 추가 정보를 확인할 수 있습니다.

```php
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

라라벨에는 여러 가지 기본 알림 채널이 제공되지만, 직접 다른 방식의 알림을 전송하고 싶을 때는 직접 드라이버를 만들어 채널을 추가할 수 있습니다. 라라벨에서는 이를 매우 간단하게 구현할 수 있습니다. 시작하려면, `send` 메서드를 포함하는 클래스를 하나 정의하면 됩니다. 이 메서드는 두 개의 인수, `$notifiable`과 `$notification`을 받아야 합니다.

`send` 메서드 내부에서는 알림 객체의 메서드를 호출해, 해당 채널이 이해할 수 있는 메시지 객체를 얻은 후, 원하는 방식으로 `$notifiable` 인스턴스에게 알림을 전송하면 됩니다.

```php
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

알림 채널 클래스를 정의했다면, 원하는 알림 클래스의 `via` 메서드에서 해당 클래스명을 반환하면 됩니다. 이 예시에서는 알림 클래스의 `toVoice` 메서드가 음성 메시지를 나타내는 임의의 객체를 반환할 수 있습니다. 예를 들어, 직접 `VoiceMessage` 클래스를 정의해 음성 메시지를 표현할 수 있습니다.

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