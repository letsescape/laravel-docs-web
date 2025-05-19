# 알림 (Notifications)

- [소개](#introduction)
- [알림 생성](#generating-notifications)
- [알림 전송](#sending-notifications)
    - [Notifiable 트레이트 사용하기](#using-the-notifiable-trait)
    - [Notification 파사드 사용하기](#using-the-notification-facade)
    - [전달 채널 지정하기](#specifying-delivery-channels)
    - [알림 큐잉하기](#queueing-notifications)
    - [온디맨드 알림](#on-demand-notifications)
- [메일 알림](#mail-notifications)
    - [메일 메시지 포맷팅](#formatting-mail-messages)
    - [발신자 커스터마이즈](#customizing-the-sender)
    - [수신자 커스터마이즈](#customizing-the-recipient)
    - [제목 커스터마이즈](#customizing-the-subject)
    - [메일러 커스터마이즈](#customizing-the-mailer)
    - [템플릿 커스터마이즈](#customizing-the-templates)
    - [첨부파일](#mail-attachments)
    - [태그 및 메타데이터 추가](#adding-tags-metadata)
    - [Symfony 메시지 커스터마이즈](#customizing-the-symfony-message)
    - [Mailable 사용하기](#using-mailables)
    - [메일 알림 미리보기](#previewing-mail-notifications)
- [Markdown 메일 알림](#markdown-mail-notifications)
    - [메시지 생성하기](#generating-the-message)
    - [메시지 작성하기](#writing-the-message)
    - [컴포넌트 커스터마이즈](#customizing-the-components)
- [데이터베이스 알림](#database-notifications)
    - [사전 준비사항](#database-prerequisites)
    - [데이터베이스 알림 포맷팅](#formatting-database-notifications)
    - [알림 접근하기](#accessing-the-notifications)
    - [알림 읽음 처리](#marking-notifications-as-read)
- [브로드캐스트 알림](#broadcast-notifications)
    - [사전 준비사항](#broadcast-prerequisites)
    - [브로드캐스트 알림 포맷팅](#formatting-broadcast-notifications)
    - [알림 수신 대기](#listening-for-notifications)
- [SMS 알림](#sms-notifications)
    - [사전 준비사항](#sms-prerequisites)
    - [SMS 알림 포맷팅](#formatting-sms-notifications)
    - [유니코드 콘텐츠](#unicode-content)
    - ["From" 번호 커스터마이즈](#customizing-the-from-number)
    - [클라이언트 참조 추가](#adding-a-client-reference)
    - [SMS 알림 라우팅](#routing-sms-notifications)
- [Slack 알림](#slack-notifications)
    - [사전 준비사항](#slack-prerequisites)
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

[이메일 전송](/docs/10.x/mail) 기능 외에도, 라라벨은 이메일, SMS([Vonage](https://www.vonage.com/communications-apis/) - 이전 명칭 Nexmo), [Slack](https://slack.com) 등 다양한 전달 채널을 통한 알림 전송을 지원합니다. 또한, [커뮤니티에서 제작한 다양한 알림 채널](https://laravel-notification-channels.com/about/#suggesting-a-new-channel)도 제공되어 수십 가지 채널로 알림을 전송할 수 있습니다! 알림은 데이터베이스에 저장하여 웹 인터페이스에서 사용자가 확인할 수 있도록 할 수도 있습니다.

일반적으로, 알림은 애플리케이션에서 발생한 어떤 일을 사용자에게 알리는 짧고 정보성 메시지입니다. 예를 들어, 요금 청구 애플리케이션을 개발 중이라면, "인보이스 결제 완료"와 같은 알림을 이메일 및 SMS 채널을 통해 사용자에게 보낼 수 있습니다.

<a name="generating-notifications"></a>
## 알림 생성

라라벨에서 각 알림은 보통 `app/Notifications` 디렉터리에 저장되는 하나의 클래스로 표현됩니다. 만약 이 디렉터리가 애플리케이션에 없다면 걱정하지 마십시오. `make:notification` 아티즌 명령어를 실행하면 자동으로 생성해줍니다:

```shell
php artisan make:notification InvoicePaid
```

이 명령은 새로운 알림 클래스를 `app/Notifications` 디렉터리에 생성합니다. 생성된 각 알림 클래스에는 `via` 메서드와, 각 채널에 맞는 메시지로 변환하는 `toMail`, `toDatabase`와 같은 다양한 메시지 빌더 메서드가 포함됩니다.

<a name="sending-notifications"></a>
## 알림 전송

<a name="using-the-notifiable-trait"></a>
### Notifiable 트레이트 사용하기

알림은 두 가지 방법으로 전송할 수 있습니다. 하나는 `Notifiable` 트레이트의 `notify` 메서드를 사용하는 것이고, 다른 하나는 `Notification` [파사드](/docs/10.x/facades)를 사용하는 것입니다. 기본적으로 `Notifiable` 트레이트는 애플리케이션의 `App\Models\User` 모델에 포함되어 있습니다:

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

이 트레이트가 제공하는 `notify` 메서드는 알림 인스턴스를 인수로 받습니다:

```
use App\Notifications\InvoicePaid;

$user->notify(new InvoicePaid($invoice));
```

> [!NOTE]
> `Notifiable` 트레이트는 어떤 모델에도 사용할 수 있습니다. 반드시 `User` 모델에만 포함해야 하는 것은 아닙니다.

<a name="using-the-notification-facade"></a>
### Notification 파사드 사용하기

또 다른 방법으로, `Notification` [파사드](/docs/10.x/facades)를 사용하여 알림을 전송할 수 있습니다. 이 방식은 여러 notifiable 엔터티(예: 여러 사용자 컬렉션)에게 알림을 보내야 할 때 유용합니다. 파사드의 `send` 메서드에 notifiable 엔터티와 알림 인스턴스를 전달하면 됩니다:

```
use Illuminate\Support\Facades\Notification;

Notification::send($users, new InvoicePaid($invoice));
```

즉시 알림을 보낼 필요가 있다면 `sendNow` 메서드를 사용할 수도 있습니다. 이 메서드는 알림이 `ShouldQueue` 인터페이스를 구현하고 있더라도 즉시 알림을 전송합니다:

```
Notification::sendNow($developers, new DeploymentCompleted($deployment));
```

<a name="specifying-delivery-channels"></a>
### 전달 채널 지정하기

모든 알림 클래스에는 알림이 어떤 채널로 전달될지 결정하는 `via` 메서드가 있습니다. 알림은 `mail`, `database`, `broadcast`, `vonage`, `slack` 채널로 전송할 수 있습니다.

> [!NOTE]
> Telegram, Pusher와 같은 다른 전달 채널도 사용하고 싶다면 커뮤니티에서 관리하는 [Laravel Notification Channels 웹사이트](http://laravel-notification-channels.com)를 참고하세요.

`via` 메서드는 `$notifiable` 인스턴스를 인수로 받는데, 이 객체는 알림을 받을 클래스의 인스턴스입니다. `$notifiable`을 사용해 어떤 채널로 알림을 보낼지 결정할 수 있습니다:

```
/**
 * 알림이 전달될 채널을 반환합니다.
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
> 알림을 큐잉하기 전에 큐를 설정하고 [Worker를 실행](/docs/10.x/queues#running-the-queue-worker)해야 합니다.

특히 외부 API 호출이 필요한 채널의 경우 알림을 보내는 데 시간이 소요될 수 있습니다. 애플리케이션의 응답 속도를 높이려면, 알림 클래스에 `ShouldQueue` 인터페이스와 `Queueable` 트레이트를 추가하여 알림을 큐에 넘기도록 설정하세요. `make:notification` 명령어로 생성한 알림 클래스에는 이미 이 인터페이스와 트레이트가 import 되어 있으므로, 바로 추가해서 사용할 수 있습니다:

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

`ShouldQueue` 인터페이스를 알림에 추가하면, 평소와 같이 알림을 전송하면 됩니다. 라라벨은 클래스에 `ShouldQueue`가 구현되어 있는 것을 감지하면, 자동으로 알림 전송 과정을 큐에 등록합니다:

```
$user->notify(new InvoicePaid($invoice));
```

알림을 큐에 등록하면, 수신자와 채널 조합마다 각각 큐 작업이 생성됩니다. 예를 들어, 세 명의 수신자와 두 개의 채널이 있을 경우 6개의 작업이 큐에 등록됩니다.

<a name="delaying-notifications"></a>
#### 알림 지연 전송

알림 전송을 일정 시간 후로 지연하고 싶다면, 알림 인스턴스를 생성할 때 `delay` 메서드를 체이닝하면 됩니다:

```
$delay = now()->addMinutes(10);

$user->notify((new InvoicePaid($invoice))->delay($delay));
```

<a name="delaying-notifications-per-channel"></a>
#### 채널별 알림 지연 전송

특정 채널에 대해 각각 지연 시간을 지정하고자 할 때는, `delay` 메서드에 배열을 전달할 수 있습니다:

```
$user->notify((new InvoicePaid($invoice))->delay([
    'mail' => now()->addMinutes(5),
    'sms' => now()->addMinutes(10),
]));
```

또는, 알림 클래스 자체에 `withDelay` 메서드를 정의해 사용할 수 있습니다. 이 메서드는 채널명과 지연값이 매핑된 배열을 반환해야 합니다:

```
/**
 * 알림 전송 지연 시간을 결정합니다.
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
#### 알림 큐 연결 설정 커스터마이즈

기본적으로 큐에 등록되는 알림은 애플리케이션의 기본 큐 연결 설정을 따릅니다. 특정 알림만 별도의 큐 연결을 사용하고 싶다면, 알림 클래스의 생성자에서 `onConnection` 메서드를 호출할 수 있습니다:

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
     * 새로운 알림 인스턴스 생성자.
     */
    public function __construct()
    {
        $this->onConnection('redis');
    }
}
```

또는, 알림이 지원하는 각각의 채널에 대해 별도의 큐 연결을 지정하고 싶다면, 알림 클래스에 `viaConnections` 메서드를 정의할 수 있습니다. 이 메서드는 채널명과 큐 연결명을 매핑한 배열을 반환해야 합니다:

```
/**
 * 각 알림 채널에 사용될 연결명을 결정합니다.
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
#### 알림 채널별 큐 설정 커스터마이즈

알림이 사용하는 각 채널별로 별도의 큐를 지정하고 싶다면, 알림 클래스에 `viaQueues` 메서드를 정의해야 합니다. 이 메서드는 채널명과 큐명이 짝지어진 배열을 반환해야 합니다:

```
/**
 * 각 알림 채널에 사용될 큐를 결정합니다.
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

<a name="queued-notifications-and-database-transactions"></a>
#### 큐잉된 알림과 데이터베이스 트랜잭션

알림을 데이터베이스 트랜잭션 내에서 큐에 등록하면, 큐 워커가 데이터베이스 트랜잭션이 커밋되기 전에 알림을 처리할 수도 있습니다. 이 경우, 트랜잭션 내에서 모델이나 데이터베이스 레코드를 업데이트했더라도 아직 데이터베이스에 반영되지 않은 상태일 수 있습니다. 또한, 트랜잭션에서 생성된 모델 또는 레코드가 아직 존재하지 않을 수도 있습니다. 알림이 이런 모델에 의존한다면, 큐 작업이 처리되면서 예기치 않은 오류가 발생할 수 있습니다.

만약 큐 연결의 `after_commit` 설정 옵션이 `false`로 되어 있더라도, 알림 전송 시 `afterCommit` 메서드를 호출하면 모든 데이터베이스 트랜잭션이 커밋된 이후에 큐잉이 실행되도록 지정할 수 있습니다:

```
use App\Notifications\InvoicePaid;

$user->notify((new InvoicePaid($invoice))->afterCommit());
```

또는, 알림 클래스의 생성자에서 `afterCommit` 메서드를 호출할 수도 있습니다:

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
     * 새로운 알림 인스턴스 생성자.
     */
    public function __construct()
    {
        $this->afterCommit();
    }
}
```

> [!NOTE]
> 이 문제를 우회하는 방법에 대해 더 알아보고 싶다면 [큐 작업과 데이터베이스 트랜잭션](/docs/10.x/queues#jobs-and-database-transactions) 문서를 참고하세요.

<a name="determining-if-the-queued-notification-should-be-sent"></a>
#### 큐잉된 알림 전송 여부 판단하기

큐잉된 알림이 백그라운드 처리를 위해 큐에 등록된 뒤에는 일반적으로 큐 워커에 의해 수신자에게 전송됩니다.

그러나, 큐 워커가 알림을 처리하는 시점에 실제로 알림을 보낼지 여부를 최종적으로 판단하고 싶다면, 알림 클래스에 `shouldSend` 메서드를 정의할 수 있습니다. 이 메서드가 `false`를 반환하면 알림이 전송되지 않습니다:

```
/**
 * 알림을 전송할지 결정합니다.
 */
public function shouldSend(object $notifiable, string $channel): bool
{
    return $this->invoice->isPaid();
}
```

<a name="on-demand-notifications"></a>
### 온디맨드 알림

어떤 경우에는 애플리케이션에 저장된 "사용자"가 아닌 대상에게 알림을 보내야 할 때도 있습니다. 이럴 때는 `Notification` 파사드의 `route` 메서드를 사용하여 임시로 알림 라우팅 정보를 설정한 뒤 알림을 전송할 수 있습니다:

```
use Illuminate\Broadcasting\Channel;
use Illuminate\Support\Facades\Notification;

Notification::route('mail', 'taylor@example.com')
            ->route('vonage', '5555555555')
            ->route('slack', '#slack-channel')
            ->route('broadcast', [new Channel('channel-name')])
            ->notify(new InvoicePaid($invoice));
```

`mail` 라우트를 통해 온디맨드 알림을 보낼 때, 수신자의 이름을 지정하려면 배열의 첫 번째 요소에 이메일 주소를 키로, 이름을 값으로 전달하면 됩니다:

```
Notification::route('mail', [
    'barrett@example.com' => 'Barrett Blair',
])->notify(new InvoicePaid($invoice));
```

또한, `routes` 메서드를 사용하면 여러 알림 채널의 임시 라우팅 정보를 한 번에 지정할 수 있습니다:

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

알림을 이메일로 전송하려면, 알림 클래스에 `toMail` 메서드를 정의해야 합니다. 이 메서드는 `$notifiable` 엔터티를 인수로 받고, `Illuminate\Notifications\Messages\MailMessage` 인스턴스를 반환해야 합니다.

`MailMessage` 클래스는 거래성 이메일 메시지를 쉽게 작성할 수 있는 몇 가지 간단한 메서드를 제공합니다. 메일 메시지는 텍스트 줄(line)뿐만 아니라 "행동 유도 버튼(call to action)"도 포함할 수 있습니다. 예시 `toMail` 메서드는 다음과 같습니다:

```
/**
 * 알림의 메일 표현을 반환합니다.
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
> `toMail` 메서드에서 `$this->invoice->id`를 사용하고 있습니다. 알림의 메시지 생성을 위해 필요한 모든 데이터는 알림의 생성자를 통해 전달할 수 있습니다.

위 예시에서는 인사말(greeting), 텍스트 한 줄, 행동 유도 버튼, 그리고 또 한 줄의 텍스트를 등록하고 있습니다. `MailMessage` 객체가 제공하는 다양한 메서드를 통해 작고 간단한 거래성 이메일을 쉽고 빠르게 만들 수 있습니다. mail 채널은 이렇게 작성된 메시지 구성 요소를 자동으로, 보기 좋고 반응형인 HTML 이메일 템플릿(플레인 텍스트 본문 포함)으로 변환해 줍니다. 아래는 `mail` 채널이 생성한 이메일 예시입니다:

<img src="https://laravel.com/img/docs/notification-example-2.png" />

> [!NOTE]
> 메일 알림을 전송할 때는 꼭 `config/app.php` 설정 파일의 `name` 설정 값을 지정해 주셔야 합니다. 이 값은 메일 알림 메시지의 헤더와 푸터에 사용됩니다.

<a name="error-messages"></a>
#### 에러 메시지

일부 알림은 인보이스 결제 실패 등과 같이 사용자에게 오류를 안내해야 할 때 사용됩니다. 메시지를 작성할 때 `error` 메서드를 호출하여 해당 메일이 오류와 관련된 것임을 표시할 수 있습니다. `error` 메서드를 사용하면 행동 유도 버튼이 검정색 대신 빨간색으로 표시됩니다:

```
/**
 * 알림의 메일 표현을 반환합니다.
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

알림 클래스에서 텍스트 줄을 직접 정의하는 대신, `view` 메서드를 사용하여 알림 이메일 렌더링에 사용할 커스텀 템플릿을 지정할 수도 있습니다:

```
/**
 * 알림의 메일 표현을 반환합니다.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)->view(
        'mail.invoice.paid', ['invoice' => $this->invoice]
    );
}
```

메일 메시지에 플레인 텍스트 뷰를 사용하고 싶을 때는, `view` 메서드에 배열로 뷰 이름을 두 번째 요소로 전달하면 됩니다:

```
/**
 * 알림의 메일 표현을 반환합니다.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)->view(
        ['mail.invoice.paid', 'mail.invoice.paid-text'],
        ['invoice' => $this->invoice]
    );
}
```

또는, 메시지에 오직 플레인 텍스트 뷰만 사용할 경우 `text` 메서드를 활용할 수도 있습니다:

```
/**
 * 알림의 메일 표현을 반환합니다.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)->text(
        'mail.invoice.paid-text', ['invoice' => $this->invoice]
    );
}
```

<a name="customizing-the-sender"></a>
### 발신자 커스터마이즈

기본적으로 이메일의 발신자(From) 주소는 `config/mail.php` 설정 파일에서 정의됩니다. 하지만, 특정 알림에 대해 발신자 주소를 따로 지정하고자 한다면 `from` 메서드를 사용할 수 있습니다:

```
/**
 * 알림의 메일 표현을 반환합니다.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
                ->from('barrett@example.com', 'Barrett Blair')
                ->line('...');
}
```

<a name="customizing-the-recipient"></a>
### 수신자 커스터마이즈

`mail` 채널로 알림을 전송할 때, 라라벨 알림 시스템은 자동으로 notifiable 엔터티의 `email` 속성을 찾아 해당 주소로 알림을 보냅니다. 만약 알림을 전달할 이메일 주소를 커스터마이즈하고 싶다면, notifiable 엔터티에 `routeNotificationForMail` 메서드를 정의하면 됩니다:

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
     * 메일 채널용 알림 라우팅.
     *
     * @return  array<string, string>|string
     */
    public function routeNotificationForMail(Notification $notification): array|string
    {
        // 이메일 주소만 반환할 경우...
        return $this->email_address;

        // 이메일 주소와 이름을 모두 반환할 경우...
        return [$this->email_address => $this->name];
    }
}
```

<a name="customizing-the-subject"></a>
### 제목 커스터마이즈

기본적으로 이메일의 제목(subject)은 알림 클래스명을 "Title Case"로 포맷한 값이 됩니다. 예를 들어, 알림 클래스명이 `InvoicePaid`라면 이메일 제목은 `Invoice Paid`가 됩니다. 메시지에 다른 제목을 지정하고 싶을 때는 `subject` 메서드를 사용하면 됩니다:

```
/**
 * 알림의 메일 표현을 반환합니다.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
                ->subject('Notification Subject')
                ->line('...');
}
```

<a name="customizing-the-mailer"></a>
### 메일러 커스터마이즈

기본적으로 이메일 알림은 `config/mail.php` 설정 파일에 정의된 기본 메일러를 사용해 전송됩니다. 그러나, 메시지 작성 단계에서 `mailer` 메서드를 사용하여 런타임에 다른 메일러를 지정할 수도 있습니다:

```
/**
 * 알림의 메일 표현을 반환합니다.
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

메일 알림에서 사용하는 HTML 및 일반 텍스트 템플릿은 알림 패키지의 리소스를 퍼블리시(publish)하여 원하는 대로 수정할 수 있습니다. 아래 명령어를 실행하면 메일 알림 템플릿이 `resources/views/vendor/notifications` 디렉터리에 생성됩니다.

```shell
php artisan vendor:publish --tag=laravel-notifications
```

<a name="mail-attachments"></a>
### 첨부 파일

이메일 알림에 첨부 파일을 추가하려면, 메시지를 작성할 때 `attach` 메서드를 사용합니다. `attach` 메서드는 첫 번째 인자로 파일의 절대 경로를 받습니다.

```
/**
 * 알림의 메일 표현을 반환합니다.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
                ->greeting('Hello!')
                ->attach('/path/to/file');
}
```

> [!NOTE]
> 알림 메일 메시지에서 제공하는 `attach` 메서드는 [attachable 객체](/docs/10.x/mail#attachable-objects)도 인자로 받을 수 있습니다. 자세한 내용은 [attachable 객체 문서](/docs/10.x/mail#attachable-objects)를 참고하시기 바랍니다.

메시지에 파일을 첨부할 때, 두 번째 인자로 배열을 전달하면 표시될 파일 이름이나 MIME 타입도 지정할 수 있습니다.

```
/**
 * 알림의 메일 표현을 반환합니다.
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

mailable 객체에서처럼 `attachFromStorage`를 사용해 저장소 디스크에서 파일을 직접 첨부하는 방법은 사용할 수 없습니다. 대신, 저장소 디스크의 파일에 대한 절대 경로를 `attach` 메서드에 전달해야 합니다. 또는 `toMail` 메서드에서 [mailable](/docs/10.x/mail#generating-mailables)을 반환하는 방법도 사용할 수 있습니다.

```
use App\Mail\InvoicePaid as InvoicePaidMailable;

/**
 * 알림의 메일 표현을 반환합니다.
 */
public function toMail(object $notifiable): Mailable
{
    return (new InvoicePaidMailable($this->invoice))
                ->to($notifiable->email)
                ->attachFromStorage('/path/to/file');
}
```

필요하다면, `attachMany` 메서드를 사용하여 여러 파일을 메시지에 첨부할 수 있습니다.

```
/**
 * 알림의 메일 표현을 반환합니다.
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

`attachData` 메서드를 사용하면, 바이트 문자열 데이터를 첨부할 수 있습니다. 이 메서드를 호출할 때 첨부 파일로 지정할 파일 이름을 함께 전달해야 합니다.

```
/**
 * 알림의 메일 표현을 반환합니다.
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

Mailgun, Postmark와 같은 일부 외부 이메일 서비스 제공업체는 메시지 "태그"와 "메타데이터"를 지원하며, 이를 통해 애플리케이션에서 발송한 이메일을 그룹화하고 추적할 수 있습니다. 이메일 메시지에 `tag`와 `metadata` 메서드를 이용해 태그 및 메타데이터를 추가할 수 있습니다.

```
/**
 * 알림의 메일 표현을 반환합니다.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
                ->greeting('Comment Upvoted!')
                ->tag('upvote')
                ->metadata('comment_id', $this->comment->id);
}
```

Mailgun 드라이버를 사용할 경우, [Mailgun의 태그(tags)](https://documentation.mailgun.com/en/latest/user_manual.html#tagging-1) 및 [메타데이터(metadata)](https://documentation.mailgun.com/en/latest/user_manual.html#attaching-data-to-messages) 관련 공식 문서를 참고하시면 됩니다. Postmark에 대해서도 [태그](https://postmarkapp.com/blog/tags-support-for-smtp), [메타데이터](https://postmarkapp.com/support/article/1125-custom-metadata-faq) 지원 관련 문서를 참고할 수 있습니다.

Amazon SES를 이용해 이메일을 전송하는 경우, `metadata` 메서드를 활용해 [SES "태그"](https://docs.aws.amazon.com/ses/latest/APIReference/API_MessageTag.html)를 메시지에 첨부할 수 있습니다.

<a name="customizing-the-symfony-message"></a>
### Symfony Message 커스터마이징

`MailMessage` 클래스의 `withSymfonyMessage` 메서드를 사용하면, 메시지를 전송하기 전에 Symfony Message 인스턴스로 클로저를 전달해 메시지를 더욱 세밀하게 커스터마이징할 수 있습니다.

```
use Symfony\Component\Mime\Email;

/**
 * 알림의 메일 표현을 반환합니다.
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
### Mailable 객체 사용

필요하다면 알림의 `toMail` 메서드에서 전체 [mailable 객체](/docs/10.x/mail)를 반환할 수도 있습니다. `MailMessage` 대신 `Mailable`을 반환할 경우, mailable 객체의 `to` 메서드로 수신자를 직접 지정해야 합니다.

```
use App\Mail\InvoicePaid as InvoicePaidMailable;
use Illuminate\Mail\Mailable;

/**
 * 알림의 메일 표현을 반환합니다.
 */
public function toMail(object $notifiable): Mailable
{
    return (new InvoicePaidMailable($this->invoice))
                ->to($notifiable->email);
}
```

<a name="mailables-and-on-demand-notifications"></a>
#### Mailable과 주문형 알림

[주문형 알림](#on-demand-notifications)을 보낼 경우, `toMail` 메서드에 주어지는 `$notifiable` 인스턴스는 `Illuminate\Notifications\AnonymousNotifiable`의 인스턴스가 됩니다. 이 객체는 주문형 알림이 발송될 이메일 주소를 얻기 위한 `routeNotificationFor` 메서드를 제공합니다.

```
use App\Mail\InvoicePaid as InvoicePaidMailable;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Mail\Mailable;

/**
 * 알림의 메일 표현을 반환합니다.
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

메일 알림 템플릿을 디자인할 때, Blade 템플릿을 미리보기 하듯 렌더링된 메일 메시지를 브라우저에서 바로 확인할 수 있으면 작업이 매우 편리합니다. 이를 위해, 라라벨에서는 알림에서 생성한 mail 메시지를 라우트 클로저나 컨트롤러에서 직접 반환할 수 있도록 지원합니다. `MailMessage`를 반환하면 메시지가 렌더링되어 브라우저에 바로 표시되므로, 실제 이메일 주소로 전송하지 않고도 미리 디자인을 확인할 수 있습니다.

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

마크다운 메일 알림은 미리 만들어진 알림용 템플릿의 장점을 그대로 누리는 동시에, 더 길고 자유로운 메시지를 작성할 수 있게 해줍니다. 마크다운으로 작성된 메시지는 라라벨이 보기 좋은 반응형의 HTML 템플릿뿐만 아니라, 자동으로 일반 텍스트 버전도 생성하여 제공합니다.

<a name="generating-the-message"></a>
### 메시지 생성하기

마크다운 템플릿과 함께 알림을 생성하려면, `make:notification` 아티즌 명령어에서 `--markdown` 옵션을 사용합니다.

```shell
php artisan make:notification InvoicePaid --markdown=mail.invoice.paid
```

다른 모든 종류의 메일 알림과 마찬가지로, 마크다운 템플릿을 사용하는 알림 클래스에도 반드시 `toMail` 메서드를 정의해야 합니다. 단, 알림을 구성할 때 `line` 및 `action` 메서드 대신, 사용할 마크다운 템플릿 이름을 지정하는 `markdown` 메서드를 사용합니다. 템플릿에서 사용하고 싶은 데이터를 배열 형태로 두 번째 인자에 전달할 수 있습니다.

```
/**
 * 알림의 메일 표현을 반환합니다.
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

마크다운 메일 알림은 Blade 컴포넌트와 마크다운 문법이 결합된 형태로 작성합니다. 이를 통해 라라벨이 제공하는 알림 컴포넌트 기능을 쉽게 활용할 수 있습니다.

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

버튼 컴포넌트는 가운데 정렬된 버튼 링크를 렌더링합니다. 이 컴포넌트는 `url`과 선택적인 `color` 두 가지 인자를 받습니다. 사용할 수 있는 색상은 `primary`, `green`, `red`입니다. 여러 개의 버튼 컴포넌트를 알림에 자유롭게 추가할 수 있습니다.

```blade
<x-mail::button :url="$url" color="green">
View Invoice
</x-mail::button>
```

<a name="panel-component"></a>
#### 패널 컴포넌트

패널 컴포넌트는 알림의 다른 부분과 구분되는 배경색을 가진 영역에 지정된 텍스트 블록을 보여줍니다. 이를 통해 중요한 안내 또는 특정 내용을 강조할 수 있습니다.

```blade
<x-mail::panel>
This is the panel content.
</x-mail::panel>
```

<a name="table-component"></a>
#### 테이블 컴포넌트

테이블 컴포넌트를 사용하면 마크다운 표를 HTML 표로 변환할 수 있습니다. 컴포넌트의 콘텐츠로 마크다운 표를 그대로 넣으면 됩니다. 표의 열 정렬 역시 기본 마크다운 정렬 문법을 그대로 지원합니다.

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

모든 마크다운 알림 컴포넌트를 애플리케이션으로 내보내어 직접 커스터마이징할 수 있습니다. 컴포넌트를 내보내려면 아티즌의 `vendor:publish` 명령어를 사용하여 `laravel-mail` 에셋 태그를 퍼블리시합니다.

```shell
php artisan vendor:publish --tag=laravel-mail
```

이 명령을 실행하면 마크다운 메일 컴포넌트가 `resources/views/vendor/mail` 디렉터리에 복사됩니다. `mail` 폴더에는 `html`과 `text` 디렉터리가 있으며, 각 컴포넌트의 HTML 및 텍스트 버전이 담겨 있습니다. 각 컴포넌트는 자유롭게 수정 가능합니다.

<a name="customizing-the-css"></a>
#### CSS 커스터마이징

컴포넌트를 퍼블리시 한 후, `resources/views/vendor/mail/html/themes` 폴더 아래에 `default.css` 파일이 생성됩니다. 이 파일의 CSS를 원하는 대로 수정하면, 해당 스타일이 마크다운 알림의 HTML에 자동으로 인라인 적용됩니다.

라라벨의 마크다운 컴포넌트에 대해 완전히 새로운 테마를 만들고 싶다면, 직접 CSS 파일을 `html/themes` 디렉터리에 추가하면 됩니다. 새 CSS 파일을 저장하고 나면, `mail` 설정 파일의 `theme` 옵션을 새 테마명으로 변경해야 합니다.

개별 알림마다 다른 테마를 적용하고 싶을 때는, 알림의 메일 메시지를 빌드하는 과정에서 `theme` 메서드를 호출하면 됩니다. 이 메서드는 발송 시 사용할 테마 이름을 인자로 받습니다.

```
/**
 * 알림의 메일 표현을 반환합니다.
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

`database` 알림 채널은 알림 정보를 데이터베이스 테이블에 저장합니다. 이 테이블에는 알림 타입과 알림을 기술하는 JSON 데이터 구조 등의 정보가 포함됩니다.

이 테이블을 조회하여 애플리케이션 사용자 인터페이스에 알림을 표시할 수 있습니다. 그 전에 알림 정보를 저장할 데이터베이스 테이블을 먼저 만들어야 합니다. 다음 명령을 이용해 적절한 테이블 스키마를 가진 [마이그레이션](/docs/10.x/migrations) 파일을 생성할 수 있습니다.

```shell
php artisan notifications:table

php artisan migrate
```

> [!NOTE]
> 알림을 받을 모델이 [UUID 혹은 ULID 기본 키](/docs/10.x/eloquent#uuid-and-ulid-keys)를 사용 중인 경우, 알림 테이블 마이그레이션에서 `morphs` 메서드 대신 [`uuidMorphs`](/docs/10.x/migrations#column-method-uuidMorphs) 또는 [`ulidMorphs`](/docs/10.x/migrations#column-method-ulidMorphs)를 사용해야 합니다.

<a name="formatting-database-notifications"></a>
### 데이터베이스 알림 포맷팅

알림이 데이터베이스 테이블에 저장될 수 있도록 하려면, 알림 클래스에 `toDatabase` 또는 `toArray` 메서드를 정의해야 합니다. 이 메서드는 `$notifiable` 엔티티를 받아 일반 PHP 배열을 반환합니다. 반환된 배열은 JSON으로 인코딩되어 `notifications` 테이블의 `data` 컬럼에 저장됩니다. 아래는 예시 `toArray` 메서드입니다.

```
/**
 * 알림의 배열 표현을 반환합니다.
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

알림이 애플리케이션의 데이터베이스에 저장되면, `type` 컬럼에는 알림 클래스명이 기록됩니다. 이 동작을 커스터마이징하고 싶다면, 알림 클래스에 `databaseType` 메서드를 정의하세요.

```
/**
 * 알림의 데이터베이스 타입을 반환합니다.
 *
 * @return string
 */
public function databaseType(object $notifiable): string
{
    return 'invoice-paid';
}
```

<a name="todatabase-vs-toarray"></a>
#### `toDatabase` vs. `toArray`

`toArray` 메서드는 `broadcast` 채널에서도 브로드캐스트에 포함될 데이터를 결정하는 데 사용됩니다. `database` 채널과 `broadcast` 채널에서 서로 다른 배열 표현을 사용하고 싶다면, `toArray` 대신 `toDatabase` 메서드를 별도로 정의하세요.

<a name="accessing-the-notifications"></a>
### 알림 접근하기

알림이 데이터베이스에 저장된 뒤에는, 알림을 받아야 하는 엔티티(예: 사용자)에서 쉽게 알림을 조회할 수 있어야 합니다. 라라벨의 기본 `App\Models\User` 모델 등에 포함된 `Illuminate\Notifications\Notifiable` 트레이트에는 엔티티의 알림을 반환하는 `notifications` [Eloquent 연관관계](/docs/10.x/eloquent-relationships)가 포함되어 있습니다. 다른 Eloquent 연관관계와 마찬가지로 이 메서드를 통해 알림을 조회할 수 있습니다. 기본적으로 알림은 `created_at` 타임스탬프를 기준으로 최근 알림이 컬렉션 앞에 오도록 정렬됩니다.

```
$user = App\Models\User::find(1);

foreach ($user->notifications as $notification) {
    echo $notification->type;
}
```

"읽지 않은" 알림만 조회하려면 `unreadNotifications` 연관관계를 사용할 수 있습니다. 이 역시 `created_at` 기준으로 최근 알림이 앞에 정렬됩니다.

```
$user = App\Models\User::find(1);

foreach ($user->unreadNotifications as $notification) {
    echo $notification->type;
}
```

> [!NOTE]
> JavaScript 클라이언트에서 알림에 접근하려면, 현재 사용자와 같은 수신 엔티티의 알림을 반환하는 알림 컨트롤러를 애플리케이션에서 정의해야 합니다. 이후 JavaScript 클라이언트에서 해당 컨트롤러의 URL로 HTTP 요청을 보내어 알림을 받아올 수 있습니다.

<a name="marking-notifications-as-read"></a>
### 알림 읽음 처리

일반적으로 사용자에게 알림을 보여주면 "읽음" 상태로 표시하고 싶을 것입니다. `Illuminate\Notifications\Notifiable` 트레이트의 `markAsRead` 메서드는 알림 데이터베이스 레코드의 `read_at` 컬럼을 업데이트하여 해당 알림을 읽음 처리합니다.

```
$user = App\Models\User::find(1);

foreach ($user->unreadNotifications as $notification) {
    $notification->markAsRead();
}
```

각 알림을 반복하지 않고, 알림들의 컬렉션에 바로 `markAsRead`를 호출할 수도 있습니다.

```
$user->unreadNotifications->markAsRead();
```

알림을 데이터베이스에서 완전히 삭제하고 싶다면 대량 업데이트 쿼리를 사용할 수도 있습니다.

```
$user = App\Models\User::find(1);

$user->unreadNotifications()->update(['read_at' => now()]);
```

알림을 테이블에서 삭제하려면 `delete` 메서드를 사용하면 됩니다.

```
$user->notifications()->delete();
```

<a name="broadcast-notifications"></a>
## 브로드캐스트 알림

<a name="broadcast-prerequisites"></a>
### 사전 준비

브로드캐스트 알림을 사용하기 전에, 라라벨의 [이벤트 브로드캐스팅](/docs/10.x/broadcasting) 서비스를 설정하고 익숙해져야 합니다. 이벤트 브로드캐스팅을 사용하면 자바스크립트로 동작하는 프런트엔드에서 서버의 라라벨 이벤트를 실시간으로 받아볼 수 있습니다.

<a name="formatting-broadcast-notifications"></a>
### 브로드캐스트 알림 포맷팅

`broadcast` 채널은 라라벨의 [이벤트 브로드캐스팅](/docs/10.x/broadcasting) 서비스를 통해 알림을 브로드캐스트하여, 자바스크립트 프런트엔드에서 즉시 알림을 수신할 수 있게 합니다. 알림 클래스에 `toBroadcast` 메서드를 정의하면, 브로드캐스트를 지원할 수 있습니다. 이 메서드는 `$notifiable` 엔티티를 받아 `BroadcastMessage` 인스턴스를 반환해야 합니다. 만약 `toBroadcast` 메서드가 없다면, `toArray` 메서드에서 반환한 데이터가 브로드캐스팅에 사용됩니다. 반환된 데이터는 JSON 형식으로 인코딩되어 자바스크립트 프런트엔드에 브로드캐스트됩니다. 아래는 `toBroadcast` 메서드 예시입니다.

```
use Illuminate\Notifications\Messages\BroadcastMessage;

/**
 * 알림의 브로드캐스팅 표현을 반환합니다.
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

모든 브로드캐스트 알림은 큐를 이용해 전송됩니다. 브로드캐스트 작업에 사용할 큐 커넥션이나 큐 이름을 설정하고 싶다면, `BroadcastMessage`의 `onConnection`과 `onQueue` 메서드를 사용할 수 있습니다.

```
return (new BroadcastMessage($data))
                ->onConnection('sqs')
                ->onQueue('broadcasts');
```

<a name="customizing-the-notification-type"></a>
#### 알림 타입 커스터마이즈

지정한 데이터 외에도, 모든 브로드캐스트 알림에는 알림의 전체 클래스 이름이 들어간 `type` 필드가 포함됩니다. 알림의 `type` 값을 커스터마이즈하고 싶다면, 알림 클래스에 `broadcastType` 메서드를 정의하세요.

```
/**
 * 브로드캐스트 시 사용할 알림 타입을 반환합니다.
 */
public function broadcastType(): string
{
    return 'broadcast.message';
}
```

<a name="listening-for-notifications"></a>
### 알림 수신 대기

알림은 `{notifiable}.{id}` 패턴의 프라이빗 채널에 브로드캐스트됩니다. 따라서, 예를 들어 `App\Models\User` 인스턴스의 ID가 `1`일 경우, `App.Models.User.1` 프라이빗 채널로 알림이 전송됩니다. [Laravel Echo](/docs/10.x/broadcasting#client-side-installation)를 사용할 경우, 해당 채널에서 `notification` 메서드로 쉽게 알림을 수신할 수 있습니다.

```
Echo.private('App.Models.User.' + userId)
    .notification((notification) => {
        console.log(notification.type);
    });
```

<a name="customizing-the-notification-channel"></a>
#### 알림 채널 커스터마이징

특정 엔티티의 브로드캐스트 알림이 전송될 채널을 커스터마이즈하려면, 알림을 받는 엔티티(예: 사용자)에 `receivesBroadcastNotificationsOn` 메서드를 정의하면 됩니다.

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
     * 사용자가 알림 브로드캐스트를 수신하는 채널을 반환합니다.
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
### 사전 준비

라라벨에서 SMS 알림은 [Vonage](https://www.vonage.com/) (이전 Nexmo) 서비스를 통해 발송됩니다. Vonage를 통해 알림을 발송하려면 `laravel/vonage-notification-channel` 패키지와 `guzzlehttp/guzzle` 패키지를 설치해야 합니다.

```
composer require laravel/vonage-notification-channel guzzlehttp/guzzle
```

이 패키지에는 [설정 파일](https://github.com/laravel/vonage-notification-channel/blob/3.x/config/vonage.php)도 포함되어 있지만, 직접 애플리케이션에 복사(퍼블리시)하지 않아도 됩니다. `VONAGE_KEY`, `VONAGE_SECRET` 환경 변수를 사용해 Vonage의 공개 키, 비밀 키를 지정할 수 있습니다.

키를 설정한 후에는, 기본 발송 전화번호를 정의하는 `VONAGE_SMS_FROM` 환경 변수도 지정해야 합니다. 이 전화번호는 Vonage 콘트롤 패널에서 생성할 수 있습니다.

```
VONAGE_SMS_FROM=15556666666
```

<a name="formatting-sms-notifications"></a>
### SMS 알림 포맷팅

알림 클래스에서 SMS로 알림을 발송하려면, `toVonage` 메서드를 정의해야 합니다. 이 메서드는 `$notifiable` 엔티티를 받아 `Illuminate\Notifications\Messages\VonageMessage` 인스턴스를 반환해야 합니다.

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

#### 유니코드 문자 메시지

SMS 메시지에 유니코드 문자가 포함될 경우, `VonageMessage` 인스턴스를 생성할 때 `unicode` 메서드를 호출해야 합니다.

```
use Illuminate\Notifications\Messages\VonageMessage;

/**
 * Get the Vonage / SMS representation of the notification.
 */
public function toVonage(object $notifiable): VonageMessage
{
    return (new VonageMessage)
                ->content('Your unicode message')
                ->unicode();
}
```

<a name="customizing-the-from-number"></a>
### "From" 번호 커스터마이징

`VONAGE_SMS_FROM` 환경 변수에 지정된 전화번호와 다른 번호로 일부 알림을 보내고 싶다면, `VonageMessage` 인스턴스에서 `from` 메서드를 호출하면 됩니다.

```
use Illuminate\Notifications\Messages\VonageMessage;

/**
 * Get the Vonage / SMS representation of the notification.
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

사용자, 팀 또는 클라이언트별 비용을 추적하고 싶다면, 알림에 "클라이언트 참조(client reference)"를 추가할 수 있습니다. Vonage는 이 참조값을 기준으로 보고서를 생성해서 특정 고객의 SMS 사용량을 더 잘 파악할 수 있도록 도와줍니다. 클라이언트 참조는 최대 40자까지의 아무 문자열이나 사용할 수 있습니다.

```
use Illuminate\Notifications\Messages\VonageMessage;

/**
 * Get the Vonage / SMS representation of the notification.
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

Vonage 알림이 올바른 전화번호로 전송되도록, 알림을 받을 엔티티(예: 유저)에 `routeNotificationForVonage` 메서드를 정의해야 합니다.

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
     * Route notifications for the Vonage channel.
     */
    public function routeNotificationForVonage(Notification $notification): string
    {
        return $this->phone_number;
    }
}
```

<a name="slack-notifications"></a>
## 슬랙(Slack) 알림

<a name="slack-prerequisites"></a>
### 사전 준비

Slack 알림을 보내기 전에 Composer를 통해 Slack 알림 채널 패키지를 설치해야 합니다.

```shell
composer require laravel/slack-notification-channel
```

또한, 해당 Slack 워크스페이스에 사용할 [Slack 앱](https://api.slack.com/apps?new_app=1)을 생성해야 합니다.

만약 알림을 앱이 생성된 동일한 워크스페이스로만 보낸다면 앱에 `chat:write`, `chat:write.public`, `chat:write.customize` 권한(scope)이 있어야 합니다. 이 권한은 Slack의 "OAuth & Permissions" 관리 탭에서 추가할 수 있습니다.

다음으로, 앱의 "Bot User OAuth Token"을 복사해서 애플리케이션의 `services.php` 설정 파일의 `slack` 설정 배열에 등록합니다. 이 토큰은 Slack의 "OAuth & Permissions" 탭에서 확인할 수 있습니다.

```
'slack' => [
    'notifications' => [
        'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
        'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
    ],
],
```

<a name="slack-app-distribution"></a>
#### 앱 배포(App Distribution)

애플리케이션이 사용자의 외부 Slack 워크스페이스로 알림을 보내야 한다면, Slack을 통해 앱을 "배포"해야 합니다. 앱 배포는 Slack 내 "Manage Distribution" 탭에서 관리할 수 있습니다. 앱이 배포된 후에는, [Socialite](/docs/10.x/socialite)를 사용하여 [Slack Bot 토큰](/docs/10.x/socialite#slack-bot-scopes)을 사용자 계정 대신 발급받을 수 있습니다.

<a name="formatting-slack-notifications"></a>
### 슬랙 알림 포맷팅

알림이 Slack 메시지 형식을 지원한다면, 알림 클래스에 `toSlack` 메서드를 정의해야 합니다. 이 메서드는 `$notifiable` 엔티티를 받아서, `Illuminate\Notifications\Slack\SlackMessage` 인스턴스를 반환해야 합니다. [Slack의 Block Kit API](https://api.slack.com/block-kit)를 이용해 풍부한 형태의 알림을 만들 수 있습니다. 아래 예시는 [Slack의 Block Kit builder](https://app.slack.com/block-kit-builder/T01KWS6K23Z#%7B%22blocks%22:%5B%7B%22type%22:%22header%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22Invoice%20Paid%22%7D%7D,%7B%22type%22:%22context%22,%22elements%22:%5B%7B%22type%22:%22plain_text%22,%22text%22:%22Customer%20%231234%22%7D%5D%7D,%7B%22type%22:%22section%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22An%20invoice%20has%20been%20paid.%22%7D,%22fields%22:%5B%7B%22type%22:%22mrkdwn%22,%22text%22:%22*Invoice%20No:*%5Cn1000%22%7D,%7B%22type%22:%22mrkdwn%22,%22text%22:%22*Invoice%20Recipient:*%5Cntaylor@laravel.com%22%7D%5D%7D,%7B%22type%22:%22divider%22%7D,%7B%22type%22:%22section%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22Congratulations!%22%7D%7D%5D%7D)에서 미리보기도 할 수 있습니다.

```
use Illuminate\Notifications\Slack\BlockKit\Blocks\ContextBlock;
use Illuminate\Notifications\Slack\BlockKit\Blocks\SectionBlock;
use Illuminate\Notifications\Slack\BlockKit\Composites\ConfirmObject;
use Illuminate\Notifications\Slack\SlackMessage;

/**
 * Get the Slack representation of the notification.
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

<a name="slack-interactivity"></a>
### 슬랙 인터랙티브 기능

Slack의 Block Kit 알림 시스템은 [사용자 상호작용 처리](https://api.slack.com/interactivity/handling)를 위한 강력한 기능을 제공합니다. 이러한 기능을 활용하려면 Slack 앱의 "Interactivity"를 활성화하고, 애플리케이션이 서비스하는 URL을 "Request URL"로 설정해야 합니다. 관련 설정은 Slack 앱 관리 메뉴의 "Interactivity & Shortcuts" 탭에서 찾을 수 있습니다.

아래 예시는 `actionsBlock` 메서드를 이용한 것으로, Slack은 버튼 클릭 시 "Request URL"로 해당 Slack 사용자의 정보, 클릭된 버튼 ID 등 다양한 데이터를 포함한 `POST` 요청을 전송합니다. 애플리케이션은 수신된 payload를 바탕으로 필요한 작업을 수행할 수 있습니다. 또한, 이 요청이 Slack에서 온 것임을 반드시 [검증](https://api.slack.com/authentication/verifying-requests-from-slack)해야 합니다.

```
use Illuminate\Notifications\Slack\BlockKit\Blocks\ActionsBlock;
use Illuminate\Notifications\Slack\BlockKit\Blocks\ContextBlock;
use Illuminate\Notifications\Slack\BlockKit\Blocks\SectionBlock;
use Illuminate\Notifications\Slack\SlackMessage;

/**
 * Get the Slack representation of the notification.
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
                 // ID는 기본적으로 "button_acknowledge_invoice"...
                $block->button('Acknowledge Invoice')->primary();

                // ID를 수동으로 지정할 수도 있습니다...
                $block->button('Deny')->danger()->id('deny_invoice');
            });
}
```

<a name="slack-confirmation-modals"></a>
#### 확인(Confirmation) 모달

사용자가 특정 작업을 진행하기 전에 반드시 확인하도록 하고 싶다면, 버튼 정의 시 `confirm` 메서드를 사용할 수 있습니다. 이 메서드는 메시지와, `ConfirmObject` 인스턴스를 받는 클로저를 인자로 받습니다.

```
use Illuminate\Notifications\Slack\BlockKit\Blocks\ActionsBlock;
use Illuminate\Notifications\Slack\BlockKit\Blocks\ContextBlock;
use Illuminate\Notifications\Slack\BlockKit\Blocks\SectionBlock;
use Illuminate\Notifications\Slack\BlockKit\Composites\ConfirmObject;
use Illuminate\Notifications\Slack\SlackMessage;

/**
 * Get the Slack representation of the notification.
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

구성한 Slack 블록을 빠르게 확인하고 싶다면, `SlackMessage` 인스턴스에서 `dd` 메서드를 호출하면 됩니다. `dd` 메서드는 구성한 payload와 알림을 미리 볼 수 있는 Slack [Block Kit Builder](https://app.slack.com/block-kit-builder/)의 URL을 만들어 출력합니다. true 값을 넘기면 전체 원시 payload 데이터를 출력해줍니다.

```
return (new SlackMessage)
        ->text('One of your invoices has been paid!')
        ->headerBlock('Invoice Paid')
        ->dd();
```

<a name="routing-slack-notifications"></a>
### 슬랙 알림 라우팅

Slack 알림을 올바른 팀 및 채널로 전달하려면, 알림을 받을 모델에 `routeNotificationForSlack` 메서드를 정의해야 합니다. 이 메서드는 다음 중 하나를 반환할 수 있습니다.

- `null` : 라우팅을 알림 자체에서 지정한 채널 설정에 위임합니다. 알림 내에서 `to` 메서드를 사용해 채널을 설정할 수 있습니다.
- 문자형 채널명(ex. `#support-channel`)
- `SlackRoute` 인스턴스 : OAuth 토큰과 채널명을 직접 지정할 수 있습니다. 예: `SlackRoute::make($this->slack_channel, $this->slack_token)`  
  이 방식은 외부 워크스페이스로 알림을 보낼 때 사용합니다.

예를 들어, `routeNotificationForSlack` 메서드에서 `#support-channel`을 반환하면, 애플리케이션의 `services.php`에 등록된 Bot User OAuth 토큰으로 연결된 워크스페이스의 `#support-channel`로 알림이 전송됩니다.

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
     * Route notifications for the Slack channel.
     */
    public function routeNotificationForSlack(Notification $notification): mixed
    {
        return '#support-channel';
    }
}
```

<a name="notifying-external-slack-workspaces"></a>
### 외부 Slack 워크스페이스로 알림 보내기

> [!NOTE]
> 외부 Slack 워크스페이스로 알림을 보내기 전에, Slack 앱을 반드시 [배포](#slack-app-distribution)해야 합니다.

애플리케이션의 사용자가 소유한 Slack 워크스페이스로 알림을 보내고 싶은 경우가 많습니다. 이를 위해서는 먼저 해당 사용자의 Slack OAuth 토큰을 발급받아야 합니다. 다행히도, [Laravel Socialite](/docs/10.x/socialite)의 Slack 드라이버를 이용하면 손쉽게 사용자 인증 및 [봇 토큰 발급](/docs/10.x/socialite#slack-bot-scopes)이 가능합니다.

봇 토큰을 발급받아 애플리케이션 데이터베이스에 저장한 후에는, `SlackRoute::make` 메서드를 이용해 알림을 사용자의 워크스페이스로 라우팅할 수 있습니다. 또한, 사용자에게 알림이 전송될 채널을 지정하는 UI를 제공할 수도 있습니다.

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
     * Route notifications for the Slack channel.
     */
    public function routeNotificationForSlack(Notification $notification): mixed
    {
        return SlackRoute::make($this->slack_channel, $this->slack_token);
    }
}
```

<a name="localizing-notifications"></a>
## 알림의 다국어(로케일) 지원

라라벨은 현재 HTTP 요청의 로케일과 다른 언어로 알림을 보낼 수 있으며, 알림이 큐에 저장될 때도 이 로케일을 기억합니다.

이를 위해, `Illuminate\Notifications\Notification` 클래스의 `locale` 메서드를 사용해 원하는 언어를 지정할 수 있습니다. 알림이 평가(전송)되는 동안 해당 로케일로 변경되며, 완료 후에는 다시 이전 로케일로 돌아옵니다.

```
$user->notify((new InvoicePaid($invoice))->locale('es'));
```

여러 명에게 동시에 알림을 보낼 경우에는 `Notification` 파사드에서 locale을 지정할 수 있습니다.

```
Notification::locale('es')->send(
    $users, new InvoicePaid($invoice)
);
```

<a name="user-preferred-locales"></a>
### 사용자별 선호 로케일

애플리케이션에서 사용자별 선호 로케일을 저장하는 경우도 있습니다. 이럴 때는, notifiable 모델에 `HasLocalePreference` 계약을 구현하면 라라벨이 알림 전송 시 자동으로 해당 로케일을 사용하도록 할 수 있습니다.

```
use Illuminate\Contracts\Translation\HasLocalePreference;

class User extends Model implements HasLocalePreference
{
    /**
     * Get the user's preferred locale.
     */
    public function preferredLocale(): string
    {
        return $this->locale;
    }
}
```

이 인터페이스를 구현하면, 라라벨은 알림 및 메일 전송 시 자동으로 선호 로케일을 사용합니다. 즉, 이 인터페이스 사용 시에는 별도로 `locale` 메서드를 호출할 필요가 없습니다.

```
$user->notify(new InvoicePaid($invoice));
```

<a name="testing"></a>
## 테스트

알림이 실제로 전송되지 않게 하려면, `Notification` 파사드의 `fake` 메서드를 사용할 수 있습니다. 보통 실제 테스트 대상 코드는 알림 전송과 직접 관련되지 않으므로, 라라벨에 특정 알림을 보내도록 지시했는지만 검증하면 충분합니다.

`Notification` 파사드의 `fake` 호출 후에는, 사용자가 어떤 알림을 받도록 지시됐는지 검증하고, 알림이 받은 데이터를 확인할 수 있습니다.

```
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

        // Perform order shipping...

        // 실제로 전송된 알림이 없는지 검증...
        Notification::assertNothingSent();

        // 특정 사용자에게 알림이 전송됐는지 검증...
        Notification::assertSentTo(
            [$user], OrderShipped::class
        );

        // 특정 알림이 전송되지 않았는지 검증...
        Notification::assertNotSentTo(
            [$user], AnotherNotification::class
        );

        // 전체 전송된 알림 개수 검증...
        Notification::assertCount(3);
    }
}
```

알림이 보냈는지 검사하는 `assertSentTo`, `assertNotSentTo` 메서드에 클로저를 전달해, 특정 조건(진리값 테스트)에 맞는 알림이 하나라도 전송되었는지까지 검증할 수 있습니다. 주어진 조건에 맞는 알림이 하나라도 있으면 해당 검증은 통과하게 됩니다.

```
Notification::assertSentTo(
    $user,
    function (OrderShipped $notification, array $channels) use ($order) {
        return $notification->order->id === $order->id;
    }
);
```

<a name="on-demand-notifications"></a>
#### 온디맨드(임시) 알림 테스트

[온디맨드 알림](#on-demand-notifications)을 전송하는 코드를 테스트할 때는 `assertSentOnDemand` 메서드를 사용할 수 있습니다.

```
Notification::assertSentOnDemand(OrderShipped::class);
```

`assertSentOnDemand`의 두 번째 인자로 클로저를 넘기면, 알림이 올바른 "라우트" 주소로 전송됐는지까지 확인할 수 있습니다.

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
#### 알림 전송(시도) 이벤트

알림이 전송될 때, 라라벨은 `Illuminate\Notifications\Events\NotificationSending` [이벤트](/docs/10.x/events)를 디스패치(dispatch)합니다. 이 이벤트에는 "notifiable" 엔티티와 알림 인스턴스가 포함되어 있습니다. 애플리케이션의 `EventServiceProvider`에서 이 이벤트의 리스너를 등록할 수 있습니다.

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

`NotificationSending` 이벤트의 리스너에서 `handle` 메서드가 `false`를 반환하면 해당 알림은 실제로 전송되지 않습니다.

```
use Illuminate\Notifications\Events\NotificationSending;

/**
 * Handle the event.
 */
public function handle(NotificationSending $event): bool
{
    return false;
}
```

이벤트 리스너 내에서는 `notifiable`, `notification`, `channel` 속성을 통해 수신자나 알림에 대한 정보를 조회할 수 있습니다.

```
/**
 * Handle the event.
 */
public function handle(NotificationSending $event): void
{
    // $event->channel
    // $event->notifiable
    // $event->notification
}
```

<a name="notification-sent-event"></a>
#### 알림 전송 완료 이벤트

알림이 실제로 전송되면, 라라벨은 `Illuminate\Notifications\Events\NotificationSent` [이벤트](/docs/10.x/events)를 디스패치합니다. 이 이벤트에는 "notifiable" 엔티티와 알림 인스턴스가 포함되어 있습니다. 마찬가지로 `EventServiceProvider`에서 리스너를 등록할 수 있습니다.

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
> `EventServiceProvider`에 리스너를 등록하였다면, `event:generate` Artisan 명령을 사용해 빠르게 리스너 클래스를 생성할 수 있습니다.

이벤트 리스너 내에서는 `notifiable`, `notification`, `channel`, `response` 속성으로 수신자와 알림 관련 정보를 조회할 수 있습니다.

```
/**
 * Handle the event.
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

라라벨은 몇 가지 내장(기본) 알림 채널을 제공하지만, 필요한 경우 직접 원하는 방식의 드라이버(채널)를 만들어 알림을 보낼 수도 있습니다. 만드는 방법은 간단합니다. 먼저 `send` 메서드를 포함한 클래스를 하나 정의합니다. 이 메서드는 `$notifiable`과 `$notification` 두 개의 인수를 받습니다.

`send` 메서드 안에서, 알림의 다양한 메서드를 호출해 해당 채널에서 사용할 메시지 객체를 얻고, 원하는 방식으로 이 메시지를 `$notifiable` 인스턴스에게 전송하면 됩니다.

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

이제 알림 채널 클래스를 만들었으니, 알림의 `via` 메서드에서 해당 클래스명을 반환하면 됩니다. 아래 예시에서는 알림의 `toVoice` 메서드가 음성 메시지를 나타내는 어떤 객체든 반환할 수 있습니다. 예를 들어 직접 `VoiceMessage` 클래스를 만들어서 사용할 수도 있습니다.

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