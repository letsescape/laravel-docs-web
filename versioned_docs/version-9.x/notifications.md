# 알림 (Notifications)

- [소개](#introduction)
- [알림 생성](#generating-notifications)
- [알림 보내기](#sending-notifications)
    - [Notifiable 트레이트 사용하기](#using-the-notifiable-trait)
    - [Notification 파사드 사용하기](#using-the-notification-facade)
    - [전송 채널 지정하기](#specifying-delivery-channels)
    - [알림 큐 처리하기](#queueing-notifications)
    - [온디맨드 알림](#on-demand-notifications)
- [메일 알림](#mail-notifications)
    - [메일 메시지 포매팅하기](#formatting-mail-messages)
    - [발신자 커스터마이징](#customizing-the-sender)
    - [수신자 커스터마이징](#customizing-the-recipient)
    - [제목 커스터마이징](#customizing-the-subject)
    - [메일러 커스터마이징](#customizing-the-mailer)
    - [템플릿 커스터마이징](#customizing-the-templates)
    - [첨부 파일](#mail-attachments)
    - [태그 및 메타데이터 추가](#adding-tags-metadata)
    - [Symfony 메시지 커스터마이징](#customizing-the-symfony-message)
    - [Mailable 사용](#using-mailables)
    - [메일 알림 미리보기](#previewing-mail-notifications)
- [Markdown 메일 알림](#markdown-mail-notifications)
    - [메시지 생성](#generating-the-message)
    - [메시지 작성](#writing-the-message)
    - [컴포넌트 커스터마이징](#customizing-the-components)
- [데이터베이스 알림](#database-notifications)
    - [사전 준비 사항](#database-prerequisites)
    - [데이터베이스 알림 포매팅](#formatting-database-notifications)
    - [알림 접근](#accessing-the-notifications)
    - [알림 읽은 상태 처리](#marking-notifications-as-read)
- [브로드캐스트 알림](#broadcast-notifications)
    - [사전 준비 사항](#broadcast-prerequisites)
    - [브로드캐스트 알림 포매팅](#formatting-broadcast-notifications)
    - [알림 리스닝](#listening-for-notifications)
- [SMS 알림](#sms-notifications)
    - [사전 준비 사항](#sms-prerequisites)
    - [SMS 알림 포매팅](#formatting-sms-notifications)
    - [숏코드 알림 포매팅](#formatting-shortcode-notifications)
    - ["From" 번호 커스터마이징](#customizing-the-from-number)
    - [클라이언트 참조 추가](#adding-a-client-reference)
    - [SMS 알림 라우팅](#routing-sms-notifications)
- [슬랙 알림](#slack-notifications)
    - [사전 준비 사항](#slack-prerequisites)
    - [슬랙 알림 포매팅](#formatting-slack-notifications)
    - [슬랙 첨부 파일](#slack-attachments)
    - [슬랙 알림 라우팅](#routing-slack-notifications)
- [알림 현지화](#localizing-notifications)
- [알림 이벤트](#notification-events)
- [커스텀 채널](#custom-channels)

<a name="introduction"></a>
## 소개

라라벨은 [이메일 전송](/docs/9.x/mail) 기능 외에도 다양한 전송 채널을 통해 알림을 보낼 수 있도록 지원합니다. 이메일뿐만 아니라, SMS([Vonage](https://www.vonage.com/communications-apis/), 이전 명칭 Nexmo), [Slack](https://slack.com) 같은 채널로도 알림을 전송할 수 있습니다. 이 외에도 [커뮤니티에서 만들어진 다양한 알림 채널](https://laravel-notification-channels.com/about/#suggesting-a-new-channel)이 있어, 수많은 채널로 손쉽게 알림을 보낼 수 있습니다! 또한 알림을 데이터베이스에 저장하여 웹 인터페이스에서 표시할 수도 있습니다.

일반적으로 알림은 사용자가 애플리케이션에서 발생한 특정 이벤트를 바로 알 수 있도록 도와주는, 짧고 정보성 위주의 메시지여야 합니다. 예를 들어, 결제 기능이 있는 애플리케이션을 만든다고 가정하면, 사용자의 송장 결제가 완료되었을 때 "송장 결제 완료" 알림을 이메일과 SMS로 전송할 수 있습니다.

<a name="generating-notifications"></a>
## 알림 생성

라라벨에서 각 알림은 하나의 클래스로 표현되며, 보통 `app/Notifications` 디렉터리에 저장됩니다. 만약 이 디렉터리가 존재하지 않더라도 걱정하지 마세요. `make:notification` 아티즌 명령어를 실행하면 자동으로 생성됩니다:

```shell
php artisan make:notification InvoicePaid
```

이 명령어를 실행하면 새로운 알림 클래스가 `app/Notifications` 디렉터리에 생성됩니다. 각 알림 클래스에는 `via` 메서드와 여러 개의 메시지 빌더 메서드(예: `toMail`, `toDatabase` 등)가 포함되어 있으며, 각 채널에 맞는 메시지로 알림을 변환합니다.

<a name="sending-notifications"></a>
## 알림 보내기

<a name="using-the-notifiable-trait"></a>
### Notifiable 트레이트 사용하기

알림을 보내는 방법에는 두 가지가 있습니다. 첫 번째는 `Notifiable` 트레이트의 `notify` 메서드를 사용하는 방법이고, 두 번째는 `Notification` [파사드](/docs/9.x/facades)를 이용하는 방법입니다. `Notifiable` 트레이트는 기본적으로 애플리케이션의 `App\Models\User` 모델에 이미 포함되어 있습니다:

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

이 트레이트에서 제공하는 `notify` 메서드는 알림 인스턴스를 파라미터로 받습니다:

```
use App\Notifications\InvoicePaid;

$user->notify(new InvoicePaid($invoice));
```

> [!NOTE]
> `Notifiable` 트레이트는 어떤 모델에도 사용할 수 있습니다. 반드시 `User` 모델에만 추가할 필요는 없습니다.

<a name="using-the-notification-facade"></a>
### Notification 파사드 사용하기

또 다른 방법으로, `Notification` [파사드](/docs/9.x/facades)를 사용해 알림을 보낼 수 있습니다. 이 방식은 여러 명의 수신자(예: 사용자 컬렉션)에게 동시에 알림을 보내야 할 때 유용합니다. 파사드를 사용할 때는, 모든 수신자와 알림 인스턴스를 `send` 메서드에 전달하면 됩니다:

```
use Illuminate\Support\Facades\Notification;

Notification::send($users, new InvoicePaid($invoice));
```

또한 `sendNow` 메서드를 사용하면 알림을 즉시 전송할 수 있습니다. 이 메서드는 알림이 `ShouldQueue` 인터페이스를 구현하고 있더라도 대기열 처리 없이 바로 전송합니다:

```
Notification::sendNow($developers, new DeploymentCompleted($deployment));
```

<a name="specifying-delivery-channels"></a>
### 전송 채널 지정하기

모든 알림 클래스에는 어떤 채널로 알림을 보낼지 결정하는 `via` 메서드가 있습니다. 알림은 `mail`, `database`, `broadcast`, `vonage`, `slack` 등 다양한 채널 중 하나 이상으로 보낼 수 있습니다.

> [!NOTE]
> Telegram, Pusher와 같은 추가 채널을 사용하고 싶다면, 커뮤니티 주도로 운영되는 [Laravel Notification Channels 웹사이트](http://laravel-notification-channels.com)를 참고하세요.

`via` 메서드는 `$notifiable` 인스턴스를 파라미터로 받는데, 이 인스턴스는 알림을 받을 대상 클래스의 인스턴스입니다. `$notifiable`을 사용해 어떤 채널로 알림을 보낼지 동적으로 결정할 수 있습니다:

```
/**
 * Get the notification's delivery channels.
 *
 * @param  mixed  $notifiable
 * @return array
 */
public function via($notifiable)
{
    return $notifiable->prefers_sms ? ['vonage'] : ['mail', 'database'];
}
```

<a name="queueing-notifications"></a>
### 알림 큐 처리하기

> [!WARNING]
> 알림을 큐로 처리하기 전에 반드시 큐 구성을 마치고, [워커를 실행](/docs/9.x/queues)해야 합니다.

알림을 보내는 과정은 시간이 꽤 걸릴 수 있습니다. 특히 외부 API 호출을 해야 할 때 더 그렇습니다. 애플리케이션의 응답 속도를 빠르게 유지하기 위해, 알림을 큐로 보내서 비동기 처리하도록 할 수 있습니다. 이를 위해서는 `ShouldQueue` 인터페이스와 `Queueable` 트레이트를 알림 클래스에 추가하세요. 이 인터페이스와 트레이트는 `make:notification` 명령어로 생성된 알림 클래스에 이미 임포트되어 있으니 바로 추가할 수 있습니다:

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

`ShouldQueue` 인터페이스를 추가한 후에는 평소처럼 알림을 보내면 됩니다. 라라벨은 해당 클래스에 `ShouldQueue` 인터페이스가 있는지 자동으로 감지해서, 알림 전송을 큐에 대기시킵니다:

```
$user->notify(new InvoicePaid($invoice));
```

알림을 큐에 등록하면, 수신자와 채널 조합별로 각각의 대기열(job)이 생성됩니다. 예를 들어, 수신자가 3명이고 두 개의 채널로 보낼 경우, 총 6개의 작업이 큐에 할당됩니다.

<a name="delaying-notifications"></a>
#### 알림 전송 지연시키기

알림을 일정 시간 뒤에 보내고 싶다면, 알림 인스턴스 생성 시 `delay` 메서드를 체이닝해서 사용할 수 있습니다:

```
$delay = now()->addMinutes(10);

$user->notify((new InvoicePaid($invoice))->delay($delay));
```

<a name="delaying-notifications-per-channel"></a>
#### 채널별로 알림 전송 지연시키기

특정 채널에만 따로 전송 지연을 적용하고 싶다면, `delay` 메서드에 배열을 전달하면 됩니다:

```
$user->notify((new InvoicePaid($invoice))->delay([
    'mail' => now()->addMinutes(5),
    'sms' => now()->addMinutes(10),
]));
```

또는, 알림 클래스에 `withDelay` 메서드를 직접 정의해서 각 채널별로 지연 시간을 설정할 수도 있습니다. 이 메서드는 채널명과 지연 값을 갖는 배열을 반환해야 합니다:

```
/**
 * Determine the notification's delivery delay.
 *
 * @param  mixed  $notifiable
 * @return array
 */
public function withDelay($notifiable)
{
    return [
        'mail' => now()->addMinutes(5),
        'sms' => now()->addMinutes(10),
    ];
}
```

<a name="customizing-the-notification-queue-connection"></a>
#### 알림 전용 큐 연결(커넥션) 지정하기

기본적으로 큐 처리되는 알림은 애플리케이션의 기본 큐 연결(커넥션)을 사용합니다. 하지만 특정 알림에 대해 다른 연결을 사용하고 싶다면, 알림 클래스에 `$connection` 속성을 지정할 수 있습니다:

```
/**
 * The name of the queue connection to use when queueing the notification.
 *
 * @var string
 */
public $connection = 'redis';
```

알림이 지원하는 각 채널별로 큐 연결을 다르게 지정하고 싶을 경우, 알림 클래스에 `viaConnections` 메서드를 정의하면 됩니다. 이 메서드는 채널명과 큐 연결명을 짝지은 배열을 반환해야 합니다:

```
/**
 * Determine which connections should be used for each notification channel.
 *
 * @return array
 */
public function viaConnections()
{
    return [
        'mail' => 'redis',
        'database' => 'sync',
    ];
}
```

<a name="customizing-notification-channel-queues"></a>
#### 알림 채널별 큐 지정하기

특정 알림 채널별로 사용할 큐 이름을 지정하고 싶다면, 알림 클래스에 `viaQueues` 메서드를 정의하세요. 이 메서드는 채널명과 큐 이름의 쌍으로 이루어진 배열을 반환해야 합니다:

```
/**
 * Determine which queues should be used for each notification channel.
 *
 * @return array
 */
public function viaQueues()
{
    return [
        'mail' => 'mail-queue',
        'slack' => 'slack-queue',
    ];
}
```

<a name="queued-notifications-and-database-transactions"></a>
#### 큐 알림과 데이터베이스 트랜잭션

데이터베이스 트랜잭션 내에서 큐 알림을 디스패치할 경우, 데이터베이스 트랜잭션이 커밋되기 전에 큐 워커가 작업을 처리할 수 있습니다. 이런 상황에서는 트랜잭션에서 변경한 모델 또는 데이터베이스 레코드가 아직 저장되지 않았을 수 있습니다. 또한 트랜잭션 내에서 새로 생성된 레코드가 데이터베이스에 존재하지 않을 수도 있습니다. 만약 알림에서 이런 모델에 의존한다면, 큐 워커에서 작업할 때 예기치 않은 오류가 발생할 수 있습니다.

큐 연결의 `after_commit` 설정 옵션이 `false`로 되어 있다면, 알림 전송 시 `afterCommit` 메서드를 호출하여, 모든 데이터베이스 트랜잭션이 커밋된 이후에만 큐 알림이 처리되도록 지정할 수 있습니다:

```
use App\Notifications\InvoicePaid;

$user->notify((new InvoicePaid($invoice))->afterCommit());
```

또는, 알림 클래스 생성자에서 `afterCommit` 메서드를 호출해도 됩니다:

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
     *
     * @return void
     */
    public function __construct()
    {
        $this->afterCommit();
    }
}
```

> [!NOTE]
> 이러한 문제를 우회하는 방법 등 자세한 내용은 [큐에 등록된 작업과 데이터베이스 트랜잭션](/docs/9.x/queues#jobs-and-database-transactions) 문서를 참고하세요.

<a name="determining-if-the-queued-notification-should-be-sent"></a>
#### 큐에 등록된 알림의 실제 전송 여부 결정

큐에 알림이 등록된 후, 보통은 큐 워커가 해당 작업을 받아서 실제로 수신자에게 알림을 전송하게 됩니다.

하지만 알림이 큐 워커에서 처리되는 시점에 전송 여부를 최종적으로 결정하고 싶다면, 알림 클래스에 `shouldSend` 메서드를 정의할 수 있습니다. 이 메서드가 `false`를 반환하면 해당 알림은 전송되지 않습니다:

```
/**
 * Determine if the notification should be sent.
 *
 * @param  mixed  $notifiable
 * @param  string  $channel
 * @return bool
 */
public function shouldSend($notifiable, $channel)
{
    return $this->invoice->isPaid();
}
```

<a name="on-demand-notifications"></a>
### 온디맨드 알림

어떤 경우에는 애플리케이션에 저장된 "User" 엔티티가 아닌 대상자에게도 알림을 보내야 할 수 있습니다. 이럴 때는 `Notification` 파사드의 `route` 메서드를 사용해, 임의의 알림 라우팅 정보를 지정한 뒤 알림을 보낼 수 있습니다:

```
use Illuminate\Broadcasting\Channel;
use Illuminate\Support\Facades\Notification;

Notification::route('mail', 'taylor@example.com')
            ->route('vonage', '5555555555')
            ->route('slack', 'https://hooks.slack.com/services/...')
            ->route('broadcast', [new Channel('channel-name')])
            ->notify(new InvoicePaid($invoice));
```

온디맨드 방식으로 메일 알림을 보낼 때, 수신자의 이름까지 지정하고 싶다면 이메일 주소와 이름을 배열 형태로 제공하면 됩니다. 배열의 첫 번째 원소에 이메일 주소가 키, 이름이 값이 되도록 설정합니다:

```
Notification::route('mail', [
    'barrett@example.com' => 'Barrett Blair',
])->notify(new InvoicePaid($invoice));
```

<a name="mail-notifications"></a>
## 메일 알림

<a name="formatting-mail-messages"></a>
### 메일 메시지 포매팅하기

알림을 이메일로도 전송하고 싶다면, 알림 클래스에 `toMail` 메서드를 정의해야 합니다. 이 메서드는 `$notifiable` 엔티티를 받아서, `Illuminate\Notifications\Messages\MailMessage` 인스턴스를 반환해야 합니다.

`MailMessage` 클래스에는 트랜잭션 메일을 쉽게 만들기 위한 간단한 메서드들이 있습니다. 메일 메시지는 텍스트 줄과 함께, "콜 투 액션(call to action)" 버튼도 포함할 수 있습니다. 아래는 `toMail` 메서드의 예시입니다:

```
/**
 * Get the mail representation of the notification.
 *
 * @param  mixed  $notifiable
 * @return \Illuminate\Notifications\Messages\MailMessage
 */
public function toMail($notifiable)
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
> 여기서 `$this->invoice->id`를 `toMail` 메서드에서 사용하고 있습니다. 알림 생성자에 메시지 생성을 위해 필요한 어떠한 데이터도 전달할 수 있습니다.

이 예제에서는 인사 메시지, 텍스트 줄, 콜 투 액션, 마지막 안내 메시지를 차례로 등록합니다. `MailMessage` 객체가 제공하는 이러한 메서드들을 이용하면 간단하고 빠르게 트랜잭션 메일을 만들 수 있습니다. 메일 채널은 메시지의 요소들을 자동으로 아름답고 반응형인 HTML 메일 템플릿(그리고 텍스트-only 버전)으로 변환해줍니다. 다음은 `mail` 채널을 통해 생성된 메일 예시입니다:

<img src="https://laravel.com/img/docs/notification-example-2.png" />

> [!NOTE]
> 메일 알림을 보낼 때는 반드시 `config/app.php` 설정 파일의 `name` 옵션을 설정해야 합니다. 이 값은 메일 알림 메시지의 헤더와 푸터에 사용됩니다.

<a name="error-messages"></a>
#### 에러 메시지

일부 알림은 예를 들어 송장 결제 실패와 같은 오류 상황을 사용자에게 알려줄 필요가 있습니다. 이런 경우, 메시지 빌드 시 `error` 메서드를 호출하면 메일 메시지가 오류와 관련된 것으로 표시됩니다. `error`를 사용하면 콜 투 액션 버튼이 검은색 대신 빨간색으로 바뀝니다:

```
/**
 * Get the mail representation of the notification.
 *
 * @param  mixed  $notifiable
 * @return \Illuminate\Notifications\Messages\MailMessage
 */
public function toMail($notifiable)
{
    return (new MailMessage)
                ->error()
                ->subject('Invoice Payment Failed')
                ->line('...');
}
```

<a name="other-mail-notification-formatting-options"></a>
#### 기타 메일 알림 포매팅 옵션

알림 클래스 내에서 텍스트 줄을 직접 정의하지 않고, `view` 메서드를 사용해 커스텀 템플릿을 지정할 수도 있습니다:

```
/**
 * Get the mail representation of the notification.
 *
 * @param  mixed  $notifiable
 * @return \Illuminate\Notifications\Messages\MailMessage
 */
public function toMail($notifiable)
{
    return (new MailMessage)->view(
        'emails.name', ['invoice' => $this->invoice]
    );
}
```

또한, 메일 메시지에 대해 plain-text 전용 뷰를 지정하고 싶다면, 뷰 이름 배열의 두 번째 원소로 plain-text 뷰명을 전달하면 됩니다:

```
/**
 * Get the mail representation of the notification.
 *
 * @param  mixed  $notifiable
 * @return \Illuminate\Notifications\Messages\MailMessage
 */
public function toMail($notifiable)
{
    return (new MailMessage)->view(
        ['emails.name.html', 'emails.name.plain'],
        ['invoice' => $this->invoice]
    );
}
```

<a name="customizing-the-sender"></a>
### 발신자 커스터마이징

기본적으로 이메일의 발신자(From) 주소는 `config/mail.php` 설정 파일에서 정의됩니다. 그러나 특정 알림에 대해 발신자 주소를 다르게 지정하고 싶다면, `from` 메서드를 사용하면 됩니다:

```
/**
 * Get the mail representation of the notification.
 *
 * @param  mixed  $notifiable
 * @return \Illuminate\Notifications\Messages\MailMessage
 */
public function toMail($notifiable)
{
    return (new MailMessage)
                ->from('barrett@example.com', 'Barrett Blair')
                ->line('...');
}
```

<a name="customizing-the-recipient"></a>
### 수신자 커스터마이징

`mail` 채널을 통해 알림을 보낼 때, 알림 시스템은 수신자 엔티티에서 자동으로 `email` 속성을 찾아 메일을 보냅니다. 만약 사용할 이메일 주소를 직접 지정하고 싶다면, 수신자 모델에 `routeNotificationForMail` 메서드를 정의하면 됩니다:

```
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * Route notifications for the mail channel.
     *
     * @param  \Illuminate\Notifications\Notification  $notification
     * @return array|string
     */
    public function routeNotificationForMail($notification)
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

기본적으로 이메일의 제목은 알림 클래스의 이름을 “타이틀 케이스” 형식으로 변환해서 사용합니다. 예를 들어 알림 클래스가 `InvoicePaid`라면, 이메일 제목은 `Invoice Paid`가 됩니다. 직접 제목을 정하고 싶다면 메시지를 만들 때 `subject` 메서드를 사용할 수 있습니다:

```
/**
 * Get the mail representation of the notification.
 *
 * @param  mixed  $notifiable
 * @return \Illuminate\Notifications\Messages\MailMessage
 */
public function toMail($notifiable)
{
    return (new MailMessage)
                ->subject('Notification Subject')
                ->line('...');
}
```

<a name="customizing-the-mailer"></a>
### 메일러 커스터마이징

알림이 이메일로 전송될 때는 기본적으로 `config/mail.php` 파일에 정의된 기본 메일러를 사용합니다. 하지만 런타임에 다른 메일러를 사용하고 싶다면, 메시지를 빌드할 때 `mailer` 메서드를 호출하면 됩니다:

```
/**
 * Get the mail representation of the notification.
 *
 * @param  mixed  $notifiable
 * @return \Illuminate\Notifications\Messages\MailMessage
 */
public function toMail($notifiable)
{
    return (new MailMessage)
                ->mailer('postmark')
                ->line('...');
}
```

<a name="customizing-the-templates"></a>
### 템플릿 커스터마이징

메일 알림에서 사용하는 HTML, plain-text 템플릿을 직접 수정하고 싶다면, notification 패키지의 리소스를 퍼블리시(publish)하면 됩니다. 아래 명령어를 실행한 후에는 템플릿 파일들이 `resources/views/vendor/notifications` 디렉터리에 위치하게 됩니다:

```shell
php artisan vendor:publish --tag=laravel-notifications
```

<a name="mail-attachments"></a>
### 첨부 파일

메일 알림에 첨부 파일을 추가하려면 메시지 빌드 시 `attach` 메서드를 사용하세요. `attach` 메서드는 첫 번째 인자로 첨부할 파일의 절대 경로를 받습니다:

```
/**
 * Get the mail representation of the notification.
 *
 * @param  mixed  $notifiable
 * @return \Illuminate\Notifications\Messages\MailMessage
 */
public function toMail($notifiable)
{
    return (new MailMessage)
                ->greeting('Hello!')
                ->attach('/path/to/file');
}
```

> [!NOTE]
> 알림 메일 메시지에서 제공하는 `attach` 메서드는 [attachable 객체](/docs/9.x/mail#attachable-objects)도 지원합니다. 자세한 내용은 [attachable 객체 공식 문서](/docs/9.x/mail#attachable-objects)를 참고하세요.

파일을 첨부할 때, 두 번째 인자로 배열을 전달해서 표시 이름 또는 MIME 타입을 지정할 수도 있습니다:

```
/**
 * Get the mail representation of the notification.
 *
 * @param  mixed  $notifiable
 * @return \Illuminate\Notifications\Messages\MailMessage
 */
public function toMail($notifiable)
{
    return (new MailMessage)
                ->greeting('Hello!')
                ->attach('/path/to/file', [
                    'as' => 'name.pdf',
                    'mime' => 'application/pdf',
                ]);
}
```

mailable 객체에서 파일을 첨부할 때와 달리, 알림에서는 `attachFromStorage` 메서드를 직접 사용할 수 없습니다. 대신, storage 디스크 내 파일의 절대 경로를 `attach` 메서드에 전달해야 합니다. 또는, `toMail` 메서드에서 [mailable](/docs/9.x/mail#generating-mailables)을 반환하는 것도 가능합니다:

```
use App\Mail\InvoicePaid as InvoicePaidMailable;

/**
 * Get the mail representation of the notification.
 *
 * @param  mixed  $notifiable
 * @return Mailable
 */
public function toMail($notifiable)
{
    return (new InvoicePaidMailable($this->invoice))
                ->to($notifiable->email)
                ->attachFromStorage('/path/to/file');
}
```

메일에 여러 파일을 첨부해야 할 경우, `attachMany` 메서드를 사용할 수 있습니다:

```
/**
 * Get the mail representation of the notification.
 *
 * @param  mixed  $notifiable
 * @return \Illuminate\Notifications\Messages\MailMessage
 */
public function toMail($notifiable)
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

#### Raw Data Attachments

`attachData` 메서드를 사용하면 바이트 문자열 형태의 원시 데이터를 첨부파일로 메일에 첨부할 수 있습니다. 이 메서드를 호출할 때 첨부될 파일의 파일명을 직접 지정해야 합니다.

```
/**
 * Get the mail representation of the notification.
 *
 * @param  mixed  $notifiable
 * @return \Illuminate\Notifications\Messages\MailMessage
 */
public function toMail($notifiable)
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

Mailgun, Postmark와 같은 일부 외부 이메일 서비스들은 애플리케이션에서 발송하는 이메일을 그룹화하거나 추적할 수 있도록 "태그(tag)"와 "메타데이터(metadata)" 기능을 지원합니다. 이메일 메시지에 태그와 메타데이터를 추가하려면 각각 `tag`와 `metadata` 메서드를 사용할 수 있습니다.

```
/**
 * Get the mail representation of the notification.
 *
 * @param  mixed  $notifiable
 * @return \Illuminate\Notifications\Messages\MailMessage
 */
public function toMail($notifiable)
{
    return (new MailMessage)
                ->greeting('Comment Upvoted!')
                ->tag('upvote')
                ->metadata('comment_id', $this->comment->id);
}
```

애플리케이션에서 Mailgun 드라이버를 사용하는 경우, [Mailgun의 태그](https://documentation.mailgun.com/en/latest/user_manual.html#tagging-1) 및 [메타데이터](https://documentation.mailgun.com/en/latest/user_manual.html#attaching-data-to-messages) 관련 공식 문서를 참고하여 자세한 정보를 확인할 수 있습니다. 마찬가지로, Postmark의 [태그](https://postmarkapp.com/blog/tags-support-for-smtp) 및 [메타데이터](https://postmarkapp.com/support/article/1125-custom-metadata-faq) 관련 문서도 참고하시기 바랍니다.

만약 Amazon SES를 통해 이메일을 발송하는 경우, 메시지에 [SES "태그"](https://docs.aws.amazon.com/ses/latest/APIReference/API_MessageTag.html)를 추가하고 싶다면 `metadata` 메서드를 사용해야 합니다.

<a name="customizing-the-symfony-message"></a>
### Symfony 메시지 커스터마이징

`MailMessage` 클래스의 `withSymfonyMessage` 메서드는 메시지 전송 전에 Symfony Message 인스턴스를 인자로 받아 원하는 방식으로 커스터마이징할 수 있는 클로저를 등록할 수 있습니다. 이를 통해 메시지가 실제로 전송되기 전에 깊이 있는 커스터마이징이 가능합니다.

```
use Symfony\Component\Mime\Email;

/**
 * Get the mail representation of the notification.
 *
 * @param  mixed  $notifiable
 * @return \Illuminate\Notifications\Messages\MailMessage
 */
public function toMail($notifiable)
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

필요하다면 알림 클래스의 `toMail` 메서드에서 [mailable 객체](/docs/9.x/mail)를 그대로 반환할 수 있습니다. `MailMessage` 대신 `Mailable`을 반환할 때는, mailable 객체의 `to` 메서드를 사용하여 수신자를 지정해주어야 합니다.

```
use App\Mail\InvoicePaid as InvoicePaidMailable;

/**
 * Get the mail representation of the notification.
 *
 * @param  mixed  $notifiable
 * @return Mailable
 */
public function toMail($notifiable)
{
    return (new InvoicePaidMailable($this->invoice))
                ->to($notifiable->email);
}
```

<a name="mailables-and-on-demand-notifications"></a>
#### Mailable과 On-Demand 알림

[On-demand 알림](#on-demand-notifications)을 발송할 경우, `toMail` 메서드에 전달되는 `$notifiable` 인스턴스는 `Illuminate\Notifications\AnonymousNotifiable`의 인스턴스입니다. 이 객체에서는 `routeNotificationFor` 메서드를 활용해 해당 on-demand 알림을 보내야 할 이메일 주소를 쉽게 가져올 수 있습니다.

```
use App\Mail\InvoicePaid as InvoicePaidMailable;
use Illuminate\Notifications\AnonymousNotifiable;

/**
 * Get the mail representation of the notification.
 *
 * @param  mixed  $notifiable
 * @return Mailable
 */
public function toMail($notifiable)
{
    $address = $notifiable instanceof AnonymousNotifiable
            ? $notifiable->routeNotificationFor('mail')
            : $notifiable->email;

    return (new InvoicePaidMailable($this->invoice))
                ->to($address);
}
```

<a name="previewing-mail-notifications"></a>
### 메일 알림 미리 보기

메일 알림 템플릿을 디자인할 때 실제 이메일로 전송하지 않고 바로 브라우저에서 Blade 템플릿처럼 결과를 미리 확인할 수 있으면 매우 편리합니다. 라라벨에서는 라우트 클로저나 컨트롤러에서 알림에서 생성한 mail 메시지를 직접 반환하면, 해당 메시지를 렌더링해서 브라우저에서 바로 미리 볼 수 있습니다. 즉, 실제로 이메일 주소로 발송하지 않고 빠르게 디자인을 확인할 수 있습니다.

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
## 마크다운(Markdown) 메일 알림

마크다운 메일 알림을 사용하면 라라벨이 제공하는 다양한 미리 만들어진 템플릿의 장점을 활용하면서, 더 길고 자유로운 커스텀 문구를 사용할 수 있습니다. 해당 메시지들은 마크다운으로 작성되므로, 라라벨은 메시지를 아름답고 반응형인 HTML 템플릿으로 렌더링할 뿐 아니라, 자동으로 일반 텍스트 버전도 함께 생성해줍니다.

<a name="generating-the-message"></a>
### 메시지 생성하기

마크다운 템플릿과 연동되는 알림 클래스를 생성하려면, Artisan의 `make:notification` 명령어에 `--markdown` 옵션을 함께 사용하면 됩니다.

```shell
php artisan make:notification InvoicePaid --markdown=mail.invoice.paid
```

기존의 메일 알림과 마찬가지로, 마크다운 템플릿을 사용하는 알림 클래스도 `toMail` 메서드를 정의해야 합니다. 단, 알림을 구성할 때 `line`과 `action` 대신 `markdown` 메서드를 사용해 사용할 마크다운 템플릿의 이름을 지정해야 합니다. 두 번째 인수로는 템플릿 내에서 사용할 데이터를 배열로 전달할 수 있습니다.

```
/**
 * Get the mail representation of the notification.
 *
 * @param  mixed  $notifiable
 * @return \Illuminate\Notifications\Messages\MailMessage
 */
public function toMail($notifiable)
{
    $url = url('/invoice/'.$this->invoice->id);

    return (new MailMessage)
                ->subject('Invoice Paid')
                ->markdown('mail.invoice.paid', ['url' => $url]);
}
```

<a name="writing-the-message"></a>
### 메시지 작성하기

마크다운 메일 알림은 Blade 컴포넌트와 마크다운 문법이 결합되어 있습니다. 이를 통해 라라벨이 미리 제작해둔 알림용 컴포넌트를 손쉽게 활용해 알림 메시지를 만들 수 있습니다.

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

버튼 컴포넌트는 화면 중앙에 버튼 형태의 링크를 렌더링합니다. 이 컴포넌트는 `url`과 선택적으로 `color` 인수를 받을 수 있습니다. 지원되는 색상은 `primary`, `green`, `red`입니다. 한 알림 내에 원하는 만큼 버튼 컴포넌트를 추가할 수 있습니다.

```blade
<x-mail::button :url="$url" color="green">
View Invoice
</x-mail::button>
```

<a name="panel-component"></a>
#### 패널 컴포넌트

패널 컴포넌트는 전달된 텍스트 블록을 다른 부분과 확연히 다른 배경색을 갖는 패널 안쪽에 표시합니다. 이를 통해 특정 부분의 텍스트를 강조할 수 있습니다.

```blade
<x-mail::panel>
This is the panel content.
</x-mail::panel>
```

<a name="table-component"></a>
#### 테이블 컴포넌트

테이블 컴포넌트를 사용하면 마크다운 테이블을 HTML 테이블 형태로 변환하여 보여줄 수 있습니다. 컴포넌트의 콘텐츠로 마크다운 테이블을 직접 작성하면 됩니다. 컬럼 정렬 또한 기본 마크다운 정렬 문법으로 손쉽게 지정할 수 있습니다.

```blade
<x-mail::table>
| Laravel       | Table         | Example  |
| ------------- |:-------------:| --------:|
| Col 2 is      | Centered      | $10      |
| Col 3 is      | Right-Aligned | $20      |
</x-mail::table>
```

<a name="customizing-the-components"></a>
### 컴포넌트 커스터마이징

모든 마크다운 알림 컴포넌트는 직접 애플리케이션으로 내보내 커스터마이징할 수 있습니다. 컴포넌트를 내보내려면 `vendor:publish` Artisan 명령어에 `laravel-mail` 태그를 지정해 실행합니다.

```shell
php artisan vendor:publish --tag=laravel-mail
```

이 명령을 실행하면 마크다운 메일 컴포넌트가 `resources/views/vendor/mail` 디렉터리에 복사됩니다. `mail` 디렉터리 아래에는 각각의 컴포넌트에 대해 HTML 버전과 텍스트 버전(plain text)이 들어있는 `html`과 `text` 디렉터리가 생성됩니다. 이 컴포넌트들은 원하는 대로 자유롭게 수정할 수 있습니다.

<a name="customizing-the-css"></a>
#### CSS 커스터마이징

컴포넌트 내보내기 작업을 완료하면, `resources/views/vendor/mail/html/themes` 경로 아래에 `default.css` 파일이 만들어집니다. 이 CSS 파일을 수정하면 스타일이 자동으로 마크다운 알림의 HTML 표현에 인라인되어 적용됩니다.

라라벨 마크다운 컴포넌트에 대해 완전히 새로운 테마를 만들고 싶은 경우, `html/themes` 디렉터리에 새 CSS 파일을 생성해서 넣으면 됩니다. 파일명을 정한 후, `mail` 설정 파일의 `theme` 옵션을 새로운 테마명과 일치하도록 변경해주면 적용됩니다.

특정 알림 하나에만 별도의 테마를 적용하려면, 알림의 메일 메시지를 생성할 때 `theme` 메서드를 사용해서 적용할 테마 이름을 지정할 수 있습니다.

```
/**
 * Get the mail representation of the notification.
 *
 * @param  mixed  $notifiable
 * @return \Illuminate\Notifications\Messages\MailMessage
 */
public function toMail($notifiable)
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

`database` 알림 채널은 알림 정보를 데이터베이스 테이블에 저장합니다. 이 테이블에는 알림 종류, 그리고 알림을 설명하는 JSON 구조의 데이터 등이 포함됩니다.

저장된 알림들은 애플리케이션 UI에서 조회해 보여줄 수 있습니다. 하지만 먼저 알림 데이터를 저장할 데이터베이스 테이블을 생성해야 합니다. [마이그레이션](/docs/9.x/migrations)을 위한 적절한 테이블 스키마를 자동으로 생성하려면 `notifications:table` Artisan 명령어를 사용하세요.

```shell
php artisan notifications:table

php artisan migrate
```

<a name="formatting-database-notifications"></a>
### 데이터베이스 알림 포맷 지정

알림을 데이터베이스 테이블에 저장하려면, 알림 클래스에 `toDatabase` 또는 `toArray` 메서드를 정의해야 합니다. 이 메서드는 `$notifiable` 엔터티를 전달받고, 순수 PHP 배열을 반환해야 합니다. 반환된 배열은 JSON 형태로 인코딩되어 `notifications` 테이블의 `data` 컬럼에 저장됩니다. 아래는 `toArray` 메서드 예시입니다.

```
/**
 * Get the array representation of the notification.
 *
 * @param  mixed  $notifiable
 * @return array
 */
public function toArray($notifiable)
{
    return [
        'invoice_id' => $this->invoice->id,
        'amount' => $this->invoice->amount,
    ];
}
```

<a name="todatabase-vs-toarray"></a>
#### `toDatabase`와 `toArray`의 차이점

`toArray` 메서드는 `broadcast` 채널에서도 데이터를 수집하는 데에 사용됩니다. 만약 `database` 채널과 `broadcast` 채널에서 서로 다른 데이터 구조를 반환하고 싶다면, `toArray` 대신 `toDatabase` 메서드를 별도로 정의해야 합니다.

<a name="accessing-the-notifications"></a>
### 데이터베이스 알림 접근하기

알림이 데이터베이스에 저장된 후에는, 알림을 받을 엔터티에서 쉽게 접근할 수 있어야 합니다. 라라벨의 기본 `App\Models\User` 모델에 포함된 `Illuminate\Notifications\Notifiable` 트레이트는 해당 엔터티의 알림들을 반환하는 `notifications` [Eloquent 연관관계](/docs/9.x/eloquent-relationships)를 제공합니다. 이 메서드는 다른 Eloquent 연관관계와 똑같이 접근할 수 있습니다. 알림은 기본적으로 `created_at` 타임스탬프 기준으로 가장 최근 것이 맨 앞에 오도록 정렬됩니다.

```
$user = App\Models\User::find(1);

foreach ($user->notifications as $notification) {
    echo $notification->type;
}
```

읽지 않은(unread) 알림만 가져오고 싶다면, `unreadNotifications` 연관관계를 사용할 수 있습니다. 역시, 최근 알림이 우선 정렬되어 있습니다.

```
$user = App\Models\User::find(1);

foreach ($user->unreadNotifications as $notification) {
    echo $notification->type;
}
```

> [!NOTE]
> 자바스크립트 클라이언트에서 알림에 접근하려면, 애플리케이션에 알림 컨트롤러를 만들고, 현재 사용자 등 특정 notifiable 엔터티의 알림을 반환해야 합니다. 그런 뒤 클라이언트에서 HTTP 요청을 해당 컨트롤러 URL로 보내 알림을 받아올 수 있습니다.

<a name="marking-notifications-as-read"></a>
### 알림 읽음 처리

일반적으로 사용자가 알림을 확인(조회)하면 해당 알림의 상태를 "읽음(read)"으로 표시하게 됩니다. `Illuminate\Notifications\Notifiable` 트레이트의 `markAsRead` 메서드를 사용하면, 알림의 데이터베이스 레코드의 `read_at` 컬럼을 업데이트하여 읽음 처리할 수 있습니다.

```
$user = App\Models\User::find(1);

foreach ($user->unreadNotifications as $notification) {
    $notification->markAsRead();
}
```

각각의 알림에 대해 일일이 반복문을 돌릴 필요 없이, 알림 컬렉션 전체에 대해 직접 `markAsRead`를 호출할 수도 있습니다.

```
$user->unreadNotifications->markAsRead();
```

알림을 모두 읽음 상태로 일괄 처리하면서 데이터베이스에서 가져오지 않고 직접 업데이트 쿼리를 실행하고 싶다면 다음과 같이 할 수 있습니다.

```
$user = App\Models\User::find(1);

$user->unreadNotifications()->update(['read_at' => now()]);
```

테이블에서 알림을 완전히 삭제하려면 `delete` 메서드를 사용합니다.

```
$user->notifications()->delete();
```

<a name="broadcast-notifications"></a>
## 브로드캐스트 알림

<a name="broadcast-prerequisites"></a>
### 사전 준비

브로드캐스트 알림을 사용하려면 라라벨의 [이벤트 브로드캐스팅](/docs/9.x/broadcasting) 기능을 사전에 구성하고 익숙해지는 것이 필요합니다. 이벤트 브로드캐스팅은 서버에서 발생한 라라벨 이벤트에 자바스크립트 기반 프론트엔드가 즉시 반응할 수 있도록 해주는 기술입니다.

<a name="formatting-broadcast-notifications"></a>
### 브로드캐스트 알림 포맷 지정

`broadcast` 채널은 라라벨의 [이벤트 브로드캐스팅](/docs/9.x/broadcasting) 기능을 이용하여 알림을 실시간으로 자바스크립트 프론트엔드로 브로드캐스트합니다. 알림을 브로드캐스트하도록 지원하려면 알림 클래스에 `toBroadcast` 메서드를 정의할 수 있습니다. 이 메서드는 `$notifiable` 엔터티를 전달받고, `BroadcastMessage` 인스턴스를 반환해야 합니다. 만약 `toBroadcast`가 없다면, `toArray` 메서드의 반환값으로 브로드캐스트할 데이터를 자동으로 수집합니다. 반환된 데이터는 JSON으로 변환되어 자바스크립트 프론트엔드로 전달됩니다. 아래는 `toBroadcast` 메서드의 예시입니다.

```
use Illuminate\Notifications\Messages\BroadcastMessage;

/**
 * Get the broadcastable representation of the notification.
 *
 * @param  mixed  $notifiable
 * @return BroadcastMessage
 */
public function toBroadcast($notifiable)
{
    return new BroadcastMessage([
        'invoice_id' => $this->invoice->id,
        'amount' => $this->invoice->amount,
    ]);
}
```

<a name="broadcast-queue-configuration"></a>
#### 브로드캐스트 큐 설정

모든 브로드캐스트 알림은 큐에 등록되어 비동기적으로 전송됩니다. 브로드캐스트 작업을 어떤 큐 커넥션이나 큐 이름을 사용해 처리할지 지정하려면 `BroadcastMessage`의 `onConnection`과 `onQueue` 메서드를 사용하면 됩니다.

```
return (new BroadcastMessage($data))
                ->onConnection('sqs')
                ->onQueue('broadcasts');
```

<a name="customizing-the-notification-type"></a>
#### 알림 타입 커스터마이즈

직접 지정한 데이터 이외에도, 모든 브로드캐스트 알림에는 알림 전체 클래스 이름을 담고 있는 `type` 필드가 포함됩니다. 이 `type` 값을 커스터마이즈하고 싶다면, 알림 클래스에 `broadcastType` 메서드를 정의하십시오.

```
use Illuminate\Notifications\Messages\BroadcastMessage;

/**
 * Get the type of the notification being broadcast.
 *
 * @return string
 */
public function broadcastType()
{
    return 'broadcast.message';
}
```

<a name="listening-for-notifications"></a>
### 알림 수신 리스닝

알림은 `{notifiable}.{id}` 규칙에 따라 생성되는 프라이빗 채널에 브로드캐스트됩니다. 예를 들어, `App\Models\User` 인스턴스의 ID가 `1`이면 `App.Models.User.1` 프라이빗 채널로 알림이 전송됩니다. [Laravel Echo](/docs/9.x/broadcasting#client-side-installation)를 이용하면, 해당 채널에서 손쉽게 `notification` 메서드로 알림 이벤트를 구독할 수 있습니다.

```
Echo.private('App.Models.User.' + userId)
    .notification((notification) => {
        console.log(notification.type);
    });
```

<a name="customizing-the-notification-channel"></a>
#### 알림 브로드캐스트 채널 커스터마이즈

엔터티가 어떤 채널로 브로드캐스트 알림을 받을지 직접 지정하려면, notifiable 엔터티 내에 `receivesBroadcastNotificationsOn` 메서드를 정의하면 됩니다.

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
     *
     * @return string
     */
    public function receivesBroadcastNotificationsOn()
    {
        return 'users.'.$this->id;
    }
}
```

<a name="sms-notifications"></a>
## SMS 알림

<a name="sms-prerequisites"></a>
### 사전 준비

라라벨에서 SMS 알림은 [Vonage](https://www.vonage.com/) (이전 이름: Nexmo)를 이용해 전송됩니다. Vonage를 통해 알림을 전송하려면, `laravel/vonage-notification-channel` 및 `guzzlehttp/guzzle` 패키지를 설치해야 합니다.

```
composer require laravel/vonage-notification-channel guzzlehttp/guzzle
```

이 패키지에는 [설정 파일](https://github.com/laravel/vonage-notification-channel/blob/3.x/config/vonage.php)이 포함되어 있습니다. 하지만 반드시 이 설정 파일을 직접 애플리케이션에 복사할 필요는 없습니다. `VONAGE_KEY`, `VONAGE_SECRET` 환경 변수를 통해 공개키와 시크릿키를 지정해주면 충분합니다.

키를 정의한 후에는, SMS를 전송할 기본 전화번호를 결정하기 위해 `VONAGE_SMS_FROM` 환경 변수를 설정해야 합니다. 이 번호는 Vonage 관리자 패널에서 생성할 수 있습니다.

```
VONAGE_SMS_FROM=15556666666
```

<a name="formatting-sms-notifications"></a>
### SMS 알림 포맷 작성

SMS로 알림을 발송할 때는 알림 클래스에 `toVonage` 메서드를 정의해야 합니다. 이 메서드는 `$notifiable` 엔터티를 전달받고, `Illuminate\Notifications\Messages\VonageMessage` 인스턴스를 반환해야 합니다.

```
/**
 * Get the Vonage / SMS representation of the notification.
 *
 * @param  mixed  $notifiable
 * @return \Illuminate\Notifications\Messages\VonageMessage
 */
public function toVonage($notifiable)
{
    return (new VonageMessage)
                ->content('Your SMS message content');
}
```

<a name="unicode-content"></a>
#### 유니코드(Unicode) 문자 메시지

SMS 메시지에 유니코드 문자를 포함해야 할 경우, `VonageMessage` 인스턴스를 생성할 때 `unicode` 메서드를 반드시 호출해야 합니다.

```
/**
 * Get the Vonage / SMS representation of the notification.
 *
 * @param  mixed  $notifiable
 * @return \Illuminate\Notifications\Messages\VonageMessage
 */
public function toVonage($notifiable)
{
    return (new VonageMessage)
                ->content('Your unicode message')
                ->unicode();
}
```

<a name="customizing-the-from-number"></a>
### 발신 번호("From" 번호) 커스터마이징

일부 알림을 기본 환경 변수에 지정된 번호가 아닌 다른 번호로 발송하고 싶다면, `VonageMessage` 인스턴스의 `from` 메서드를 통해 발신 번호를 개별적으로 지정할 수 있습니다.

```
/**
 * Get the Vonage / SMS representation of the notification.
 *
 * @param  mixed  $notifiable
 * @return \Illuminate\Notifications\Messages\VonageMessage
 */
public function toVonage($notifiable)
{
    return (new VonageMessage)
                ->content('Your SMS message content')
                ->from('15554443333');
}
```

<a name="adding-a-client-reference"></a>
### 고객 기준 참조값(Client Reference) 추가

사용자, 팀, 또는 고객별로 SMS 비용을 추적하고 싶다면 알림에 "client reference" 값을 추가할 수 있습니다. Vonage는 이 참조 값을 활용해서 특정 고객의 SMS 사용량을 포함하는 보고서를 제공합니다. client reference는 최대 40자까지 임의의 문자열을 지정할 수 있습니다.

```
/**
 * Get the Vonage / SMS representation of the notification.
 *
 * @param  mixed  $notifiable
 * @return \Illuminate\Notifications\Messages\VonageMessage
 */
public function toVonage($notifiable)
{
    return (new VonageMessage)
                ->clientReference((string) $notifiable->id)
                ->content('Your SMS message content');
}
```

<a name="routing-sms-notifications"></a>

### SMS 알림 경로 지정

Vonage 알림을 올바른 전화번호로 전송하려면, 알림을 받을 엔티티에 `routeNotificationForVonage` 메서드를 정의해야 합니다:

```
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * Route notifications for the Vonage channel.
     *
     * @param  \Illuminate\Notifications\Notification  $notification
     * @return string
     */
    public function routeNotificationForVonage($notification)
    {
        return $this->phone_number;
    }
}
```

<a name="slack-notifications"></a>
## Slack 알림

<a name="slack-prerequisites"></a>
### 사전 준비 사항

Slack을 통해 알림을 전송하려면, 먼저 Composer를 이용해 Slack 알림 채널을 설치해야 합니다:

```shell
composer require laravel/slack-notification-channel
```

또한 팀을 위한 [Slack 앱](https://api.slack.com/apps?new_app=1)을 생성해야 합니다. 앱을 만들고 나서 워크스페이스에 대해 "Incoming Webhook"을 설정해야 하며, 설정이 완료되면 Slack에서 웹훅 URL을 제공합니다. 이 URL은 [Slack 알림 라우팅](#routing-slack-notifications) 시 사용하게 됩니다.

<a name="formatting-slack-notifications"></a>
### Slack 알림 포맷팅

알림을 Slack 메시지로 전송하고 싶다면 알림 클래스에 `toSlack` 메서드를 정의해야 합니다. 이 메서드는 `$notifiable` 엔티티를 인자로 받으며, 반드시 `Illuminate\Notifications\Messages\SlackMessage` 인스턴스를 반환해야 합니다. Slack 메시지는 텍스트 콘텐츠뿐 아니라 추가 정보를 표현할 수 있는 "첨부(attachment)"도 포함할 수 있습니다. 기본적인 `toSlack` 예시를 살펴보겠습니다:

```
/**
 * Get the Slack representation of the notification.
 *
 * @param  mixed  $notifiable
 * @return \Illuminate\Notifications\Messages\SlackMessage
 */
public function toSlack($notifiable)
{
    return (new SlackMessage)
                ->content('One of your invoices has been paid!');
}
```

<a name="slack-attachments"></a>
### Slack 첨부(Attachment)

Slack 메시지에는 "첨부(attachment)"도 추가할 수 있습니다. 첨부 기능을 사용하면 단순한 텍스트 메시지보다 더 풍부한 포맷을 제공할 수 있습니다. 아래는 애플리케이션에서 발생한 예외에 대해 오류 메시지와 추가 상세 페이지 링크를 첨부하여 알림을 보내는 예시입니다:

```
/**
 * Get the Slack representation of the notification.
 *
 * @param  mixed  $notifiable
 * @return \Illuminate\Notifications\Messages\SlackMessage
 */
public function toSlack($notifiable)
{
    $url = url('/exceptions/'.$this->exception->id);

    return (new SlackMessage)
                ->error()
                ->content('Whoops! Something went wrong.')
                ->attachment(function ($attachment) use ($url) {
                    $attachment->title('Exception: File Not Found', $url)
                               ->content('File [background.jpg] was not found.');
                });
}
```

첨부를 이용하면 사용자에게 보여줄 데이터 배열도 지정할 수 있습니다. 이 데이터는 표 형태로 정리되어 읽기 쉽게 표시됩니다:

```
/**
 * Get the Slack representation of the notification.
 *
 * @param  mixed  $notifiable
 * @return SlackMessage
 */
public function toSlack($notifiable)
{
    $url = url('/invoices/'.$this->invoice->id);

    return (new SlackMessage)
                ->success()
                ->content('One of your invoices has been paid!')
                ->attachment(function ($attachment) use ($url) {
                    $attachment->title('Invoice 1322', $url)
                               ->fields([
                                    'Title' => 'Server Expenses',
                                    'Amount' => '$1,234',
                                    'Via' => 'American Express',
                                    'Was Overdue' => ':-1:',
                                ]);
                });
}
```

<a name="markdown-attachment-content"></a>
#### 첨부 내용에 마크다운 적용

첨부 필드 중에 마크다운(Markdown)이 포함된 경우, `markdown` 메서드를 사용하여 Slack에게 해당 첨부 필드를 마크다운 형식으로 파싱하여 보여줄 것을 지정할 수 있습니다. 이 메서드에는 `pretext`, `text`, 그리고/또는 `fields` 값을 전달할 수 있습니다. Slack 첨부 포맷에 대한 자세한 정보는 [Slack API 문서](https://api.slack.com/docs/message-formatting#message_formatting)를 참고하시기 바랍니다:

```
/**
 * Get the Slack representation of the notification.
 *
 * @param  mixed  $notifiable
 * @return SlackMessage
 */
public function toSlack($notifiable)
{
    $url = url('/exceptions/'.$this->exception->id);

    return (new SlackMessage)
                ->error()
                ->content('Whoops! Something went wrong.')
                ->attachment(function ($attachment) use ($url) {
                    $attachment->title('Exception: File Not Found', $url)
                               ->content('File [background.jpg] was *not found*.')
                               ->markdown(['text']);
                });
}
```

<a name="routing-slack-notifications"></a>
### Slack 알림 경로 지정

Slack 알림을 올바른 팀 및 채널로 전송하려면, 알림을 받을 엔티티에 `routeNotificationForSlack` 메서드를 정의해야 합니다. 이 메서드는 알림을 보내야 할 웹훅 URL을 반환해야 합니다. 웹훅 URL은 Slack 팀에 "Incoming Webhook" 서비스를 추가하여 생성할 수 있습니다:

```
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * Route notifications for the Slack channel.
     *
     * @param  \Illuminate\Notifications\Notification  $notification
     * @return string
     */
    public function routeNotificationForSlack($notification)
    {
        return 'https://hooks.slack.com/services/...';
    }
}
```

<a name="localizing-notifications"></a>
## 알림 다국어(로케일) 지원

라라벨에서는 HTTP 요청의 현재 로케일과 다른 언어로 알림을 전송할 수 있으며, 알림이 큐에 쌓인 경우에도 선택한 로케일 값을 기억하게 됩니다.

이 기능을 사용하려면 `Illuminate\Notifications\Notification` 클래스의 `locale` 메서드를 활용하여 원하는 언어를 설정할 수 있습니다. 알림이 처리되는 동안 애플리케이션의 로케일이 해당 언어로 변경되었다가, 처리가 끝나면 다시 이전 로케일로 돌아갑니다:

```
$user->notify((new InvoicePaid($invoice))->locale('es'));
```

여러 사용자에게 알림을 다국어로 전송하려면 `Notification` 파사드를 통해서도 가능합니다:

```
Notification::locale('es')->send(
    $users, new InvoicePaid($invoice)
);
```

<a name="user-preferred-locales"></a>
### 사용자가 선호하는 로케일 적용

애플리케이션에서 각 사용자의 기본 로케일 정보를 저장하고 있다면, 알림을 받을 모델에 `HasLocalePreference` 컨트랙트를 구현하면 저장된 로케일을 알림 전송 시 자동으로 사용할 수 있습니다:

```
use Illuminate\Contracts\Translation\HasLocalePreference;

class User extends Model implements HasLocalePreference
{
    /**
     * Get the user's preferred locale.
     *
     * @return string
     */
    public function preferredLocale()
    {
        return $this->locale;
    }
}
```

이 인터페이스를 구현한 후에는 라라벨이 자동으로 해당 모델에 대한 알림과 메일 전송 시 선호 로케일을 적용합니다. 따라서 별도로 `locale` 메서드를 호출할 필요가 없습니다:

```
$user->notify(new InvoicePaid($invoice));
```

<a name="notification-events"></a>
## 알림 관련 이벤트

<a name="notification-sending-event"></a>
#### Notification Sending 이벤트

알림이 전송될 때마다, 라라벨의 알림 시스템은 `Illuminate\Notifications\Events\NotificationSending` [이벤트](/docs/9.x/events)를 발생시킵니다. 이 이벤트에는 "알림 대상" 엔티티와 알림 인스턴스가 포함됩니다. `EventServiceProvider`에서 이 이벤트 리스너를 등록할 수 있습니다:

```
use App\Listeners\CheckNotificationStatus;
use Illuminate\Notifications\Events\NotificationSending;

/**
 * The event listener mappings for the application.
 *
 * @var array
 */
protected $listen = [
    NotificationSending::class => [
        CheckNotificationStatus::class,
    ],
];
```

`NotificationSending` 이벤트 리스너의 `handle` 메서드에서 `false`를 반환하면 해당 알림은 실제로 전송되지 않습니다:

```
use Illuminate\Notifications\Events\NotificationSending;

/**
 * Handle the event.
 *
 * @param  \Illuminate\Notifications\Events\NotificationSending  $event
 * @return void
 */
public function handle(NotificationSending $event)
{
    return false;
}
```

이벤트 리스너 내에서는 이벤트 객체의 `notifiable`, `notification`, `channel` 속성을 통해, 알림 수신자 및 알림에 대한 추가 정보를 조회할 수 있습니다:

```
/**
 * Handle the event.
 *
 * @param  \Illuminate\Notifications\Events\NotificationSending  $event
 * @return void
 */
public function handle(NotificationSending $event)
{
    // $event->channel
    // $event->notifiable
    // $event->notification
}
```

<a name="notification-sent-event"></a>
#### Notification Sent 이벤트

알림이 전송된 후에는 `Illuminate\Notifications\Events\NotificationSent` [이벤트](/docs/9.x/events)가 Dispatcher에 의해 발생합니다. 이 이벤트에도 역시 "알림 대상" 엔티티와 알림 인스턴스가 포함되어 있습니다. `EventServiceProvider`에 아래와 같이 리스너를 등록할 수 있습니다:

```
use App\Listeners\LogNotification;
use Illuminate\Notifications\Events\NotificationSent;

/**
 * The event listener mappings for the application.
 *
 * @var array
 */
protected $listen = [
    NotificationSent::class => [
        LogNotification::class,
    ],
];
```

> [!NOTE]
> `EventServiceProvider`에 리스너를 등록한 후에는, `event:generate` 아티즌 명령어를 사용하여 리스너 클래스를 빠르게 생성할 수 있습니다.

이벤트 리스너 내에서는 이벤트 객체의 `notifiable`, `notification`, `channel`, `response` 속성을 통해 알림 수신자나 알림 자체에 대한 다양한 정보를 얻을 수 있습니다:

```
/**
 * Handle the event.
 *
 * @param  \Illuminate\Notifications\Events\NotificationSent  $event
 * @return void
 */
public function handle(NotificationSent $event)
{
    // $event->channel
    // $event->notifiable
    // $event->notification
    // $event->response
}
```

<a name="custom-channels"></a>
## 사용자 정의 채널

라라벨은 여러 기본 알림 채널을 제공하지만, 필요에 따라 직접 드라이버(커스텀 채널)를 만들어 알림을 다른 방식으로 전송할 수 있습니다. 라라벨에서 이를 구현하는 방법은 매우 간단합니다. 우선, `send` 메서드를 포함한 클래스를 하나 정의합니다. 이 메서드는 `$notifiable`과 `$notification` 두 개의 인자를 받게 됩니다.

`send` 메서드 내부에서는 알림 객체에서 각 채널이 이해할 수 있는 메시지 오브젝트를 꺼내고, 원하는 방식대로 `$notifiable` 인스턴스에 알림을 전송하면 됩니다:

```
<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

class VoiceChannel
{
    /**
     * Send the given notification.
     *
     * @param  mixed  $notifiable
     * @param  \Illuminate\Notifications\Notification  $notification
     * @return void
     */
    public function send($notifiable, Notification $notification)
    {
        $message = $notification->toVoice($notifiable);

        // Send notification to the $notifiable instance...
    }
}
```

알림 채널 클래스를 정의했다면, 이제 알림 클래스의 `via` 메서드에서 해당 클래스명을 반환하면 됩니다. 아래 예제에서는 알림의 `toVoice` 메서드가 음성 메시지를 표현하는 임의의 객체를 반환합니다. 필요하다면 알림 메시지에 맞는 `VoiceMessage` 클래스를 직접 정의해서 활용할 수 있습니다:

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
     *
     * @param  mixed  $notifiable
     * @return array|string
     */
    public function via($notifiable)
    {
        return [VoiceChannel::class];
    }

    /**
     * Get the voice representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return VoiceMessage
     */
    public function toVoice($notifiable)
    {
        // ...
    }
}
```