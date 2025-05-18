# 알림(Notification)

- [소개](#introduction)
- [알림 생성하기](#generating-notifications)
- [알림 보내기](#sending-notifications)
    - [Notifiable 트레잇 사용하기](#using-the-notifiable-trait)
    - [Notification 파사드 사용하기](#using-the-notification-facade)
    - [전달 채널 지정하기](#specifying-delivery-channels)
    - [알림 큐잉(Queueing)하기](#queueing-notifications)
    - [온디맨드(즉시) 알림](#on-demand-notifications)
- [메일 알림](#mail-notifications)
    - [메일 메시지 포맷팅](#formatting-mail-messages)
    - [발신자 커스터마이즈](#customizing-the-sender)
    - [수신자 커스터마이즈](#customizing-the-recipient)
    - [제목 커스터마이즈](#customizing-the-subject)
    - [메일러 지정](#customizing-the-mailer)
    - [템플릿 커스터마이즈](#customizing-the-templates)
    - [첨부파일 추가](#mail-attachments)
    - [메일러블(Mailable) 사용](#using-mailables)
    - [메일 알림 미리보기](#previewing-mail-notifications)
- [Markdown 메일 알림](#markdown-mail-notifications)
    - [메시지 생성하기](#generating-the-message)
    - [메시지 작성하기](#writing-the-message)
    - [컴포넌트 커스터마이즈](#customizing-the-components)
- [데이터베이스 알림](#database-notifications)
    - [사전 준비 사항](#database-prerequisites)
    - [데이터베이스 알림 포맷팅](#formatting-database-notifications)
    - [알림 접근하기](#accessing-the-notifications)
    - [알림 읽음 처리](#marking-notifications-as-read)
- [브로드캐스트 알림](#broadcast-notifications)
    - [사전 준비 사항](#broadcast-prerequisites)
    - [브로드캐스트 알림 포맷팅](#formatting-broadcast-notifications)
    - [알림 수신 리스닝](#listening-for-notifications)
- [SMS 알림](#sms-notifications)
    - [사전 준비 사항](#sms-prerequisites)
    - [SMS 알림 포맷팅](#formatting-sms-notifications)
    - [숏코드(Shortcode) 알림 포맷팅](#formatting-shortcode-notifications)
    - ["From" 번호 커스터마이즈](#customizing-the-from-number)
    - [클라이언트 참조 정보 추가](#adding-a-client-reference)
    - [SMS 알림 라우팅](#routing-sms-notifications)
- [Slack 알림](#slack-notifications)
    - [사전 준비 사항](#slack-prerequisites)
    - [Slack 알림 포맷팅](#formatting-slack-notifications)
    - [Slack 첨부파일](#slack-attachments)
    - [Slack 알림 라우팅](#routing-slack-notifications)
- [알림의 로컬라이징(Localizing)](#localizing-notifications)
- [알림 이벤트](#notification-events)
- [커스텀 채널](#custom-channels)

<a name="introduction"></a>
## 소개

라라벨은 [이메일 전송](/docs/8.x/mail) 기능을 기본적으로 제공할 뿐만 아니라, 이메일, SMS([Vonage](https://www.vonage.com/communications-apis/), 예전 명칭은 Nexmo), [Slack](https://slack.com) 등 다양한 전달 채널을 통한 알림 발송도 지원합니다. 또한, [커뮤니티에서 제작된 다양한 알림 채널](https://laravel-notification-channels.com/about/#suggesting-a-new-channel)도 마련되어 있어, 수십 가지 이상의 채널로 알림을 손쉽게 전송할 수 있습니다! 알림은 데이터베이스에 저장해 웹 인터페이스 내에서 사용자에게 보여줄 수도 있습니다.

일반적으로 알림은 애플리케이션에서 어떤 일이 발생했음을 사용자가 빠르게 알 수 있도록 해주는 짧고 정보성 메시지입니다. 예를 들어, 결제 관련 애플리케이션을 만든다면, 사용자의 청구서가 결제됨을 "Invoice Paid(청구서 결제 완료)" 알림을 이메일이나 SMS 채널을 통해 전달할 수 있습니다.

<a name="generating-notifications"></a>
## 알림 생성하기

라라벨에서 각 알림은 일반적으로 `app/Notifications` 디렉터리에 저장되는 하나의 클래스로 표현됩니다. 만약 이 디렉터리가 애플리케이션에 없다면 걱정하지 마십시오. `make:notification` 아티즌 명령어를 실행하면 자동으로 생성됩니다.

```
php artisan make:notification InvoicePaid
```

이 명령은 `app/Notifications` 디렉터리에 새로운 알림 클래스를 생성합니다. 각 알림 클래스는 `via` 메서드, 그리고 `toMail`, `toDatabase`와 같이 특정 채널에 맞춘 메시지를 만들어 내는 다양한 메서드들을 포함합니다. 이 메서드들은 각각의 채널에 알맞게 알림을 메시지로 변환합니다.

<a name="sending-notifications"></a>
## 알림 보내기

<a name="using-the-notifiable-trait"></a>
### Notifiable 트레잇 사용하기

알림을 보내는 방법에는 두 가지가 있습니다. 첫 번째는 `Notifiable` 트레잇의 `notify` 메서드를 사용하는 것이고, 두 번째는 `Notification` [파사드](/docs/8.x/facades)를 사용하는 방법입니다. 애플리케이션의 `App\Models\User` 모델에는 기본적으로 `Notifiable` 트레잇이 포함되어 있습니다.

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

이 트레잇에서 제공하는 `notify` 메서드는 알림 인스턴스를 인수로 받습니다.

```
use App\Notifications\InvoicePaid;

$user->notify(new InvoicePaid($invoice));
```

> [!TIP]
> `Notifiable` 트레잇은 어떤 모델에나 사용할 수 있습니다. 반드시 `User` 모델에만 적용해야 하는 것은 아닙니다.

<a name="using-the-notification-facade"></a>
### Notification 파사드 사용하기

또 다른 방법으로, `Notification` [파사드](/docs/8.x/facades)를 이용해 알림을 보낼 수도 있습니다. 이 방법은 여러 개의 알림 대상(예: 유저 컬렉션)에게 동시에 알림을 보낼 때 유용합니다. 파사드를 사용할 때는, 모든 알림 대상 엔티티들과 알림 인스턴스를 `send` 메서드에 전달하면 됩니다.

```
use Illuminate\Support\Facades\Notification;

Notification::send($users, new InvoicePaid($invoice));
```

또한, `sendNow` 메서드를 사용하면 큐에 상관없이 즉시 알림을 전송할 수 있습니다. 이 메서드는 알림이 `ShouldQueue` 인터페이스를 구현했더라도 무시하고 즉시 전송합니다.

```
Notification::sendNow($developers, new DeploymentCompleted($deployment));
```

<a name="specifying-delivery-channels"></a>
### 전달 채널 지정하기

모든 알림 클래스에는 해당 알림이 어떤 채널로 전송될지 결정하는 `via` 메서드가 있습니다. 알림은 `mail`, `database`, `broadcast`, `nexmo`, `slack` 등 다양한 채널로 보낼 수 있습니다.

> [!TIP]
> Telegram, Pusher 등 다른 전달 채널도 사용하고 싶으시다면, 커뮤니티가 운영하는 [Laravel Notification Channels 웹사이트](http://laravel-notification-channels.com)를 참고해 보세요.

`via` 메서드는 `$notifiable` 인스턴스를 인수로 받으며, 이 인스턴스는 해당 알림을 전달받게 될 클래스의 인스턴스입니다. `$notifiable` 객체의 정보를 바탕으로 알림을 전달할 채널을 동적으로 지정할 수도 있습니다.

```
/**
 * 알림을 전달할 채널을 반환합니다.
 *
 * @param  mixed  $notifiable
 * @return array
 */
public function via($notifiable)
{
    return $notifiable->prefers_sms ? ['nexmo'] : ['mail', 'database'];
}
```

<a name="queueing-notifications"></a>
### 알림 큐잉(Queueing)하기

> [!NOTE]
> 알림을 큐에 등록하기 전에, 반드시 큐 설정을 마치고 [워커(worker)를 실행](/docs/8.x/queues)해야 합니다.

알림을 보내는 작업은, 외부 API 호출 등이 수반될 경우 시간이 오래 걸릴 수 있습니다. 애플리케이션의 응답 속도를 높이고 싶다면, 알림을 큐에 등록해서 백그라운드로 처리할 수 있습니다. 이를 위해서는 알림 클래스에 `ShouldQueue` 인터페이스와 `Queueable` 트레잇을 추가해야 합니다. `make:notification` 명령으로 생성한 알림 클래스에는 해당 인터페이스와 트레잇이 이미 임포트되어 있으니, 바로 아래와 같이 사용하시면 됩니다.

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

`ShouldQueue` 인터페이스를 추가한 후에는 평소와 같이 알림을 보내면 됩니다. 라라벨은 클래스에 `ShouldQueue` 인터페이스가 있는지 감지해서, 자동으로 알림 전송을 큐에 등록합니다.

```
$user->notify(new InvoicePaid($invoice));
```

알림 전달을 지연시키고 싶다면, 알림 인스턴스를 만들 때 `delay` 메서드를 체이닝(chaining)하면 됩니다.

```
$delay = now()->addMinutes(10);

$user->notify((new InvoicePaid($invoice))->delay($delay));
```

특정 채널별로 지연 시간을 따로두고 싶은 경우에는 `delay` 메서드에 배열을 넘겨주면 됩니다.

```
$user->notify((new InvoicePaid($invoice))->delay([
    'mail' => now()->addMinutes(5),
    'sms' => now()->addMinutes(10),
]));
```

알림을 큐로 보낼 때는, 수신자와 채널의 조합마다 하나씩 큐 작업이 생성됩니다. 예를 들어, 알림 대상이 3명이고 채널도 2개라면, 총 6개의 작업이 큐에 등록됩니다.

<a name="customizing-the-notification-queue-connection"></a>
#### 알림 큐 연결 커스터마이즈

기본적으로 큐잉된 알림은 애플리케이션의 기본 큐 연결을 사용하게 됩니다. 하지만 특정 알림만 별도의 큐 연결을 사용하고 싶다면, 알림 클래스에 `$connection` 속성을 지정할 수 있습니다.

```
/**
 * 알림 큐잉 시 사용할 큐 연결명을 지정합니다.
 *
 * @var string
 */
public $connection = 'redis';
```

<a name="customizing-notification-channel-queues"></a>
#### 알림 채널별 큐 커스터마이즈

알림 클래스에서는 채널마다 서로 다른 큐를 사용할 수도 있습니다. 이를 위해 알림 클래스에 `viaQueues` 메서드를 정의하세요. 이 메서드는 채널명과 큐명 쌍을 포함하는 배열을 반환해야 합니다.

```
/**
 * 알림 채널별로 사용할 큐를 지정합니다.
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
#### 큐잉된 알림과 데이터베이스 트랜잭션

데이터베이스 트랜잭션 내부에서 큐잉된 알림을 디스패치하면, 트랜잭션 커밋 이전에 큐에서 즉시 처리될 수 있습니다. 이렇게 되면 트랜잭션 내에서 변경된 모델이나 테이블 내용이 실제 DB에 반영되기 전에 알림 작업이 실행될 수 있습니다. 트랜잭션 중 생성된 모델/레코드가 아직 DB에 없다면, 알림에서 해당 모델에 의존하는 경우 예기치 않은 오류가 발생할 수 있습니다.

만약 큐 연결의 `after_commit` 설정값이 `false`라면, 알림을 보낼 때 `afterCommit` 메서드를 호출하여 반드시 모든 오픈된 DB 트랜잭션 커밋 이후에 큐 작업이 디스패치되도록 지정할 수 있습니다.

```
use App\Notifications\InvoicePaid;

$user->notify((new InvoicePaid($invoice))->afterCommit());
```

또는, 알림 클래스의 생성자에서 `afterCommit` 메서드를 호출할 수도 있습니다.

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
     * 새로운 알림 인스턴스 생성자입니다.
     *
     * @return void
     */
    public function __construct()
    {
        $this->afterCommit();
    }
}
```

> [!TIP]
> 이런 문제에 대한 자세한 내용은 [큐 작업과 데이터베이스 트랜잭션](/docs/8.x/queues#jobs-and-database-transactions) 문서를 참고하십시오.

<a name="determining-if-the-queued-notification-should-be-sent"></a>
#### 큐잉된 알림의 실제 전송 여부 결정하기

큐에 등록된 알림은 일반적으로 백그라운드 워커가 받아서 수신자에게 전송합니다.

그러나 큐 워커에서 알림을 처리할 때 실제로 보낼지 최종적으로 결정하고 싶다면, 알림 클래스에 `shouldSend` 메서드를 정의할 수 있습니다. 이 메서드가 `false`를 반환하면, 알림은 전송되지 않습니다.

```
/**
 * 알림을 실제로 보낼지 여부를 결정합니다.
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
### 온디맨드(즉시) 알림

때로는 애플리케이션의 "유저"로 저장되어 있지 않은 사람에게도 알림을 보내야 할 때가 있습니다. 이럴 때는 `Notification` 파사드의 `route` 메서드를 이용해 임의로 전달 경로를 지정한 뒤 알림을 보낼 수 있습니다.

```
Notification::route('mail', 'taylor@example.com')
            ->route('nexmo', '5555555555')
            ->route('slack', 'https://hooks.slack.com/services/...')
            ->notify(new InvoicePaid($invoice));
```

만약 이메일 경로를 지정하면서 수신자 이름까지 함께 전달하고 싶다면, 이메일 주소를 키로, 이름을 값으로 갖는 배열을 전달하면 됩니다.

```
Notification::route('mail', [
    'barrett@example.com' => 'Barrett Blair',
])->notify(new InvoicePaid($invoice));
```

<a name="mail-notifications"></a>
## 메일 알림

<a name="formatting-mail-messages"></a>
### 메일 메시지 포맷팅

알림이 이메일로 발송되는 것을 지원하려면, 알림 클래스에 `toMail` 메서드를 정의해야 합니다. 이 메서드는 `$notifiable` 엔티티를 받아서, `Illuminate\Notifications\Messages\MailMessage` 인스턴스를 반환해야 합니다.

`MailMessage` 클래스에는 트랜잭션성 이메일 메시지 작성을 도와주는 다양한 간단한 메서드가 포함되어 있습니다. 메일 메시지에는 일반 텍스트뿐만 아니라 "콜 투 액션(call to action)" 버튼도 포함시킬 수 있습니다. 다음은 `toMail` 메서드의 예시입니다.

```
/**
 * 알림의 메일 표현을 반환합니다.
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
                ->action('View Invoice', $url)
                ->line('Thank you for using our application!');
}
```

> [!TIP]
> 위 예시처럼 `toMail` 메서드에서 `$this->invoice->id`를 사용하고 있습니다. 알림 메시지를 만들 때 필요한 모든 데이터를 생성자에 넣어 넘겨줄 수 있습니다.

이 예시에서는 인사말, 한 줄 메시지, 액션 버튼, 그리고 또 한 줄 메시지를 등록합니다. `MailMessage` 객체가 제공하는 이 메서드들을 활용하면 간단하고 빠르게 트랜잭션성 메일을 포맷할 수 있습니다. 메일 채널은 메시지의 각 요소들을 보기 좋은 반응형 HTML 이메일 템플릿(그리고 평문 텍스트 버전)으로 자동 변환합니다. 아래는 `mail` 채널로 발송된 이메일 예시입니다.

<img src="https://laravel.com/img/docs/notification-example-2.png" />

> [!TIP]
> 메일 알림을 보낼 때는 `config/app.php` 설정 파일의 `name` 옵션을 꼭 지정하십시오. 이 값은 메일 알림 메시지의 헤더와 푸터에서 사용됩니다.

<a name="other-mail-notification-formatting-options"></a>
#### 그 밖의 메일 알림 포맷 옵션

알림 클래스에서 "라인" 단위 메시지를 직접 정의하는 대신, `view` 메서드를 사용해 커스텀 템플릿을 지정하여 알림 이메일을 렌더링할 수도 있습니다.

```
/**
 * 알림의 메일 표현을 반환합니다.
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

메일 메시지에 대해 별도의 평문 템플릿을 사용하고 싶다면, `view` 메서드에 이름이 들어있는 배열을 전달하면 됩니다(두 번째 요소에 평문 템플릿).

```
/**
 * 알림의 메일 표현을 반환합니다.
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

<a name="error-messages"></a>
#### 에러 메시지

일부 알림은 청구 실패 등 오류 발생 사실을 사용자에게 알려주는 역할도 합니다. 이런 경우 메시지를 만들 때 `error` 메서드를 호출해 해당 메시지가 에러와 관련됨을 표시할 수 있습니다. `error` 메서드를 호출하면, 콜 투 액션 버튼이 검정이 아니라 빨간색으로 바뀝니다.

```
/**
 * 알림의 메일 표현을 반환합니다.
 *
 * @param  mixed  $notifiable
 * @return \Illuminate\Notifications\Message
 */
public function toMail($notifiable)
{
    return (new MailMessage)
                ->error()
                ->subject('Notification Subject')
                ->line('...');
}
```

<a name="customizing-the-sender"></a>
### 발신자 커스터마이즈

기본적으로 이메일의 발신자/From 주소 정보는 `config/mail.php` 설정 파일에서 정의됩니다. 하지만, 특정 알림에 대해 발신자 주소를 별도로 지정하고 싶을 때는 `from` 메서드를 사용할 수 있습니다.

```
/**
 * 알림의 메일 표현을 반환합니다.
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
### 수신자 커스터마이즈

메일 채널로 알림을 보낼 때, 시스템은 기본적으로 알림 대상 엔티티의 `email` 속성을 사용합니다. 만약 알림이 다른 이메일 주소로 전달되길 원한다면, 노티피어블(알림을 받을 수 있는) 엔티티에 `routeNotificationForMail` 메서드를 정의하면 됩니다.

```
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * 메일 채널로 알림 라우팅.
     *
     * @param  \Illuminate\Notifications\Notification  $notification
     * @return array|string
     */
    public function routeNotificationForMail($notification)
    {
        // 이메일 주소만 반환...
        return $this->email_address;

        // 이메일 주소와 이름까지 반환...
        return [$this->email_address => $this->name];
    }
}
```

<a name="customizing-the-subject"></a>
### 제목 커스터마이즈

기본적으로 이메일 제목(subject)은 알림 클래스명을 "Title Case" 형태로 변환한 값입니다. 예를 들어, 알림 클래스가 `InvoicePaid`라면 이메일 제목은 `Invoice Paid`가 됩니다. 다른 제목을 사용하고 싶다면 메시지 작성 시 `subject` 메서드를 호출하면 됩니다.

```
/**
 * 알림의 메일 표현을 반환합니다.
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
### 메일러 지정

기본적으로 이메일 알림은 `config/mail.php`에서 지정된 기본 메일러를 사용해 발송됩니다. 하지만 메시지를 만들 때 `mailer` 메서드를 호출하면 다른 메일러로 전송할 수 있습니다.

```
/**
 * 알림의 메일 표현을 반환합니다.
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
### 템플릿 커스터마이즈

메일 알림에서 사용하는 HTML 및 평문 템플릿을 직접 수정할 수도 있습니다. notification 패키지 리소스를 퍼블리싱하면 커스텀 템플릿을 사용할 수 있으며, 다음 명령어를 실행하면 템플릿 파일들이 `resources/views/vendor/notifications`에 복사됩니다.

```
php artisan vendor:publish --tag=laravel-notifications
```

<a name="mail-attachments"></a>
### 첨부파일 추가

이메일 알림에 파일을 첨부하려면, 메시지 작성 시 `attach` 메서드를 사용하면 됩니다. `attach` 메서드의 첫 번째 인수로는 파일의 절대 경로를 지정합니다.

```
/**
 * 알림의 메일 표현을 반환합니다.
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

첨부파일을 추가할 때, 표시될 파일명이나 MIME 타입 등도 배열 형태의 두 번째 인수로 지정할 수 있습니다.

```
/**
 * 알림의 메일 표현을 반환합니다.
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

메일러블 객체에서 파일을 첨부할 때와 달리, 알림에서는 `attachFromStorage`를 직접 사용할 수 없습니다. 대신, 파일의 절대 경로를 `attach` 메서드에 전달해야 합니다. 또는, `toMail` 메서드에서 [메일러블(Mailable)](/docs/8.x/mail#generating-mailables)을 반환하는 방식도 사용할 수 있습니다.

```
use App\Mail\InvoicePaid as InvoicePaidMailable;

/**
 * 알림의 메일 표현을 반환합니다.
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

<a name="raw-data-attachments"></a>

#### 원시 데이터 첨부

`attachData` 메서드는 바이트로 이루어진 원시 문자열 데이터를 첨부파일로 첨부할 때 사용할 수 있습니다. `attachData` 메서드를 호출할 때는 첨부파일에 지정할 파일명을 함께 전달해야 합니다.

```
/**
 * 알림의 메일 표현을 반환합니다.
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

<a name="using-mailables"></a>
### Mailable 사용하기

필요하다면, 알림의 `toMail` 메서드에서 [Mailable 객체](/docs/8.x/mail) 전체를 반환할 수 있습니다. `MailMessage` 대신 `Mailable` 객체를 반환하는 경우, 수신자는 mailable 객체의 `to` 메서드로 명시해주어야 합니다.

```
use App\Mail\InvoicePaid as InvoicePaidMailable;

/**
 * 알림의 메일 표현을 반환합니다.
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
#### Mailable과 온디맨드 알림

[온디맨드 알림](#on-demand-notifications)을 보낼 때 알림의 `toMail` 메서드로 전달되는 `$notifiable` 인스턴스는 `Illuminate\Notifications\AnonymousNotifiable`의 인스턴스로, `routeNotificationFor` 메서드를 제공해 온디맨드 알림이 발송되어야 할 이메일 주소를 가져올 수 있습니다.

```
use App\Mail\InvoicePaid as InvoicePaidMailable;
use Illuminate\Notifications\AnonymousNotifiable;

/**
 * 알림의 메일 표현을 반환합니다.
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
### 메일 알림 미리보기

메일 알림 템플릿을 디자인할 때, 일반 Blade 템플릿을 렌더링하는 것처럼 브라우저에서 미리보기 기능을 활용하면 편리합니다. 이를 위해, Laravel에서는 메일 알림에서 생성된 mail 메시지를 바로 라우트 클로저나 컨트롤러에서 반환할 수 있습니다. `MailMessage`가 반환되면, 실제 이메일로 발송하지 않고도 브라우저에서 바로 렌더링된 형태로 디자인 결과를 미리 볼 수 있습니다.

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

마크다운(Markdown) 메일 알림은 사전에 준비된 템플릿을 활용하면서도 자유롭게 길고 맞춤화된 메시지를 작성할 수 있는 기능입니다. 메시지가 마크다운으로 작성되므로, Laravel은 메시지를 미려하고 반응형인 HTML 템플릿으로 렌더링할 수 있으며, 동시에 자동으로 일반 텍스트 버전도 생성합니다.

<a name="generating-the-message"></a>
### 메시지 생성하기

마크다운 템플릿을 사용하는 알림을 생성하려면, Artisan의 `make:notification` 명령어에 `--markdown` 옵션을 사용할 수 있습니다.

```
php artisan make:notification InvoicePaid --markdown=mail.invoice.paid
```

다른 메일 알림과 마찬가지로, 마크다운 템플릿을 사용하는 알림 클래스에도 `toMail` 메서드를 정의해야 합니다. 하지만, 알림 메시지를 구성할 때 `line`과 `action` 메서드 대신, 사용할 마크다운 템플릿의 이름을 `markdown` 메서드로 지정합니다. 템플릿에서 사용할 데이터를 배열 형태로 두 번째 인자로 전달할 수 있습니다.

```
/**
 * 알림의 메일 표현을 반환합니다.
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

마크다운 메일 알림은 Blade 컴포넌트와 마크다운 구문을 조합하여, Laravel에서 미리 제작한 알림 컴포넌트를 쉽게 활용하며 알림을 구성할 수 있게 해줍니다.

```
@component('mail::message')
# Invoice Paid

Your invoice has been paid!

@component('mail::button', ['url' => $url])
View Invoice
@endcomponent

Thanks,<br>
{{ config('app.name') }}
@endcomponent
```

<a name="button-component"></a>
#### 버튼 컴포넌트

버튼 컴포넌트는 가운데 정렬된 버튼 링크를 렌더링합니다. 이 컴포넌트는 `url`과 선택적으로 `color` 두 가지 인자를 받을 수 있습니다. 지원되는 색상은 `primary`, `green`, `red`입니다. 한 알림에 필요한 만큼 버튼 컴포넌트를 추가할 수 있습니다.

```
@component('mail::button', ['url' => $url, 'color' => 'green'])
View Invoice
@endcomponent
```

<a name="panel-component"></a>
#### 패널 컴포넌트

패널 컴포넌트는 지정한 텍스트 블록을 알림 본문과는 구분된 약간 다른 배경색의 패널로 표시합니다. 강조하고 싶은 특정 텍스트 블록이 있을 때 유용하게 사용할 수 있습니다.

```
@component('mail::panel')
This is the panel content.
@endcomponent
```

<a name="table-component"></a>
#### 테이블 컴포넌트

테이블 컴포넌트를 사용하면 마크다운 테이블을 HTML 테이블로 변환할 수 있습니다. 이 컴포넌트의 내용으로 마크다운 테이블을 넘겨주면 됩니다. 마크다운 기본 테이블 정렬 문법을 활용해 컬럼 정렬도 지원합니다.

```
@component('mail::table')
| Laravel       | Table         | Example  |
| ------------- |:-------------:| --------:|
| Col 2 is      | Centered      | $10      |
| Col 3 is      | Right-Aligned | $20      |
@endcomponent
```

<a name="customizing-the-components"></a>
### 컴포넌트 커스터마이즈

알림에서 사용하는 마크다운 컴포넌트들은 모두 직접 앱 내에서 복사해 자유롭게 커스터마이즈할 수 있습니다. 컴포넌트를 내 앱에 내보내려면 `laravel-mail` 에셋 태그를 활용해 `vendor:publish` Artisan 명령어를 실행하세요.

```
php artisan vendor:publish --tag=laravel-mail
```

이 명령은 마크다운 메일 컴포넌트들을 `resources/views/vendor/mail` 디렉토리에 복사합니다. `mail` 디렉토리 안에는 각 컴포넌트의 HTML, 텍스트 버전이 각각 `html`, `text` 디렉토리에 들어있습니다. 이 컴포넌트들은 원하는 대로 자유롭게 커스터마이즈 가능합니다.

<a name="customizing-the-css"></a>
#### CSS 커스터마이즈

컴포넌트를 내보낸 뒤에는 `resources/views/vendor/mail/html/themes` 디렉토리에 `default.css` 파일이 생성됩니다. 이 파일의 CSS를 수정하면, 스타일이 자동으로 각 마크다운 알림의 HTML 본문에 인라인 방식으로 반영됩니다.

만약 라라벨 마크다운 컴포넌트에 대해 완전히 새로운 테마를 생성하고 싶다면, `html/themes` 디렉토리에 CSS 파일을 추가하면 됩니다. 파일명을 지정해 저장한 뒤, `mail` 설정 파일의 `theme` 옵션에서 해당 테마명을 지정하세요.

특정 알림 한 건에 대해서만 별도의 테마를 적용하고 싶다면, 알림의 메일 메시지를 빌드하는 과정에서 `theme` 메서드를 활용하면 됩니다. `theme` 메서드는 알림 발송 시 사용할 테마의 이름을 인자로 받습니다.

```
/**
 * 알림의 메일 표현을 반환합니다.
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

`database` 알림 채널은 알림 정보를 데이터베이스 테이블에 저장합니다. 이 테이블에는 알림 타입과 알림에 대한 정보를 설명하는 JSON 데이터 구조 등이 기록됩니다.

저장된 알림을 애플리케이션 UI에서 조회해 표시할 수 있습니다. 그러나 이를 위해 먼저 알림 정보를 저장할 전용 데이터베이스 테이블이 필요합니다. `notifications:table` 명령어를 사용해 적절한 테이블 스키마를 가진 [마이그레이션](/docs/8.x/migrations)을 생성할 수 있습니다.

```
php artisan notifications:table

php artisan migrate
```

<a name="formatting-database-notifications"></a>
### 데이터베이스 알림 포맷팅

알림을 데이터베이스 테이블에 저장하려면 알림 클래스에 `toDatabase` 또는 `toArray` 메서드를 정의해야 합니다. 이 메서드는 `$notifiable` 엔터티를 전달받고, 일반 PHP 배열을 반환해야 합니다. 반환된 배열은 JSON으로 인코딩되어 `notifications` 테이블의 `data` 컬럼에 저장됩니다. 아래는 예시 `toArray` 메서드입니다.

```
/**
 * 알림의 배열 표현을 반환합니다.
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
#### `toDatabase`와 `toArray`의 차이

`toArray` 메서드는 `broadcast` 채널이 프론트엔드로 브로드캐스트할 데이터를 결정할 때도 사용됩니다. 만약 `database` 채널과 `broadcast` 채널에서 각각 다르게 배열 구조를 만들고 싶다면, `toArray` 대신 `toDatabase` 메서드를 정의하면 됩니다.

<a name="accessing-the-notifications"></a>
### 데이터베이스 알림 접근하기

알림이 데이터베이스에 저장되면, 수신 가능한 엔터티(예: User)로부터 알림을 쉽게 불러와 사용하는 것이 중요합니다. Laravel 기본 `App\Models\User` 모델에 포함된 `Illuminate\Notifications\Notifiable` 트레이트에는 해당 엔터티의 알림들을 반환하는 `notifications` [Eloquent 연관관계](/docs/8.x/eloquent-relationships)가 있습니다. 이 메서드는 일반 Eloquent 연관관계와 마찬가지로 접근할 수 있으며, 기본적으로 `created_at` 타임스탬프 내림차순(최신순)으로 알림이 정렬됩니다.

```
$user = App\Models\User::find(1);

foreach ($user->notifications as $notification) {
    echo $notification->type;
}
```

"읽지 않은" 알림만 가져오고 싶다면, `unreadNotifications` 연관관계를 사용하면 됩니다. 역시 최신순으로 정렬됩니다.

```
$user = App\Models\User::find(1);

foreach ($user->unreadNotifications as $notification) {
    echo $notification->type;
}
```

> [!TIP]
> 자바스크립트 클라이언트에서 알림에 접근하려면, 현재 사용자와 같은 특정 notifiable 엔터티에 대한 알림을 반환하는 알림 컨트롤러를 만들고, 해당 컨트롤러 URL로 HTTP 요청을 보내면 됩니다.

<a name="marking-notifications-as-read"></a>
### 알림을 읽음으로 표시

일반적으로 사용자가 알림을 조회하면 '읽음' 상태로 표시하고 싶을 것입니다. `Illuminate\Notifications\Notifiable` 트레이트는 `markAsRead` 메서드를 제공하여 데이터베이스의 알림 레코드의 `read_at` 컬럼을 업데이트합니다.

```
$user = App\Models\User::find(1);

foreach ($user->unreadNotifications as $notification) {
    $notification->markAsRead();
}
```

각 알림을 반복 처리하는 대신, 전체 알림 컬렉션에 대해 바로 `markAsRead`를 호출할 수도 있습니다.

```
$user->unreadNotifications->markAsRead();
```

모든 알림을 한 번에 읽음 처리하려면, 직접 데이터베이스에 대해 대량 업데이트 쿼리를 실행할 수도 있습니다.

```
$user = App\Models\User::find(1);

$user->unreadNotifications()->update(['read_at' => now()]);
```

알림을 테이블에서 완전히 삭제하고 싶다면 `delete` 메서드를 호출하면 됩니다.

```
$user->notifications()->delete();
```

<a name="broadcast-notifications"></a>
## 브로드캐스트 알림

<a name="broadcast-prerequisites"></a>
### 사전 준비

알림을 브로드캐스트하기 전에, Laravel의 [이벤트 브로드캐스팅](/docs/8.x/broadcasting) 서비스에 대해 설정 및 기본 개념 숙지가 필요합니다. 이벤트 브로드캐스팅은 라라벨의 서버사이드 이벤트에 자바스크립트 프론트엔드가 반응하도록 만드는 기능입니다.

<a name="formatting-broadcast-notifications"></a>
### 브로드캐스트 알림 포맷팅

`broadcast` 채널은 Laravel의 [이벤트 브로드캐스팅](/docs/8.x/broadcasting) 서비스를 활용하여 알림을 브로드캐스팅하며, 이를 통해 자바스크립트 프론트엔드에서 실시간으로 알림을 받을 수 있습니다. 브로드캐스트 가능한 알림이라면 알림 클래스에 `toBroadcast` 메서드를 정의할 수 있습니다. 이 메서드는 `$notifiable` 엔터티를 받아, `BroadcastMessage` 인스턴스를 반환해야 합니다. `toBroadcast` 메서드가 없다면 `toArray` 메서드 데이터를 사용해서 브로드캐스트됩니다. 반환된 데이터는 JSON으로 인코딩되어 자바스크립트 프론트엔드에 전달됩니다. 아래는 예제 `toBroadcast` 메서드입니다.

```
use Illuminate\Notifications\Messages\BroadcastMessage;

/**
 * 알림의 브로드캐스트용 표현을 반환합니다.
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

모든 브로드캐스트 알림은 큐잉되어 처리됩니다. 브로드캐스트 작업이 사용할 큐 커넥션이나 큐 이름을 설정하려면, `BroadcastMessage`의 `onConnection`, `onQueue` 메서드를 사용할 수 있습니다.

```
return (new BroadcastMessage($data))
                ->onConnection('sqs')
                ->onQueue('broadcasts');
```

<a name="customizing-the-notification-type"></a>
#### 알림 타입 커스터마이즈

직접 지정한 데이터 외에도, 모든 브로드캐스트 알림에는 알림의 전체 클래스명을 담은 `type` 필드가 포함됩니다. 이 `type` 값을 직접 정의하고 싶을 경우, 알림 클래스에 `broadcastType` 메서드를 작성하면 됩니다.

```
use Illuminate\Notifications\Messages\BroadcastMessage;

/**
 * 브로드캐스팅 될 알림의 타입을 반환합니다.
 *
 * @return string
 */
public function broadcastType()
{
    return 'broadcast.message';
}
```

<a name="listening-for-notifications"></a>
### 알림 수신 이벤트 리스닝

알림은 `{notifiable}.{id}` 형태로 구성된 프라이빗 채널을 통해 브로드캐스트됩니다. 예를 들어, ID가 1인 `App\Models\User` 인스턴스에게 알림을 전송하면, `App.Models.User.1` 프라이빗 채널로 브로드캐스트됩니다. [Laravel Echo](/docs/8.x/broadcasting#client-side-installation)를 사용할 경우, 해당 채널에서 쉽게 알림 이벤트를 청취할 수 있습니다.

```
Echo.private('App.Models.User.' + userId)
    .notification((notification) => {
        console.log(notification.type);
    });
```

<a name="customizing-the-notification-channel"></a>
#### 알림 채널 커스터마이즈

특정 엔터티의 브로드캐스트 알림이 브로드캐스트되는 채널을 커스터마이즈하고 싶으면, notifiable 엔터티에 `receivesBroadcastNotificationsOn` 메서드를 정의하면 됩니다.

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
     * 이 사용자가 알림을 수신할 채널을 반환합니다.
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

Laravel에서 SMS 알림은 [Vonage](https://www.vonage.com/) (이전 Nexmo)로 제공됩니다. Vonage를 통해 알림을 보내려면, `laravel/nexmo-notification-channel` 및 `nexmo/laravel` Composer 패키지를 설치해야 합니다.

```
composer require laravel/nexmo-notification-channel nexmo/laravel
```

`nexmo/laravel` 패키지는 [별도의 설정 파일](https://github.com/Nexmo/nexmo-laravel/blob/master/config/nexmo.php)을 포함하고 있지만, 꼭 설정 파일을 내 앱에 복사해서 사용할 필요는 없습니다. 그냥 `NEXMO_KEY`와 `NEXMO_SECRET` 환경 변수로 Vonage의 공개키와 비밀키를 지정하시면 됩니다.

그리고 `config/services.php` 설정 파일에 `nexmo` 항목을 추가해야 합니다. 아래 예시 설정을 참고하세요.

```
'nexmo' => [
    'sms_from' => '15556666666',
],
```

`sms_from` 옵션은 SMS를 발신할 전화번호입니다. Vonage 관리 패널에서 애플리케이션에 사용할 발신 번호를 생성할 수 있습니다.

<a name="formatting-sms-notifications"></a>
### SMS 알림 포맷팅

알림을 SMS로 보낼 수 있다면, 알림 클래스에 `toNexmo` 메서드를 정의해야 합니다. 이 메서드는 `$notifiable` 엔터티를 전달받고, `Illuminate\Notifications\Messages\NexmoMessage` 인스턴스를 반환해야 합니다.

```
/**
 * 알림의 Vonage / SMS 표현을 반환합니다.
 *
 * @param  mixed  $notifiable
 * @return \Illuminate\Notifications\Messages\NexmoMessage
 */
public function toNexmo($notifiable)
{
    return (new NexmoMessage)
                ->content('Your SMS message content');
}
```

<a name="unicode-content"></a>
#### 유니코드 메시지

SMS 메시지에 유니코드 문자가 포함될 경우, `NexmoMessage` 인스턴스를 만들 때 `unicode` 메서드를 함께 호출해야 합니다.

```
/**
 * 알림의 Vonage / SMS 표현을 반환합니다.
 *
 * @param  mixed  $notifiable
 * @return \Illuminate\Notifications\Messages\NexmoMessage
 */
public function toNexmo($notifiable)
{
    return (new NexmoMessage)
                ->content('Your unicode message')
                ->unicode();
}
```

<a name="formatting-shortcode-notifications"></a>
### 쇼트코드(Shortcode) 알림 포맷팅

Laravel은 Vonage 계정에 미리 등록해둔 메시지 템플릿(쇼트코드) 알림 전송도 지원합니다. 쇼트코드 SMS 알림을 보내려면, 알림 클래스 내에 `toShortcode` 메서드를 정의하세요. 이 메서드에서는 알림 타입(`alert`, `2fa`, `marketing`)과 템플릿 내에 전달할 커스텀 값들을 배열로 반환합니다.

```
/**
 * 알림의 Vonage / Shortcode 표현을 반환합니다.
 *
 * @param  mixed  $notifiable
 * @return array
 */
public function toShortcode($notifiable)
{
    return [
        'type' => 'alert',
        'custom' => [
            'code' => 'ABC123',
        ],
    ];
}
```

> [!TIP]
> [SMS 알림 라우팅](#routing-sms-notifications)처럼, notifiable 모델에는 `routeNotificationForShortcode` 메서드를 구현해주셔야 합니다.

<a name="customizing-the-from-number"></a>
### 발신 번호 커스터마이즈

`config/services.php` 파일에 설정한 발신 번호와 다른 번호로 알림을 보내고 싶다면, `NexmoMessage` 인스턴스에 `from` 메서드로 발신 번호를 지정하면 됩니다.

```
/**
 * 알림의 Vonage / SMS 표현을 반환합니다.
 *
 * @param  mixed  $notifiable
 * @return NexmoMessage
 */
public function toNexmo($notifiable)
{
    return (new NexmoMessage)
                ->content('Your SMS message content')
                ->from('15554443333');
}
```

<a name="adding-a-client-reference"></a>
### 클라이언트 참조(Client Reference) 추가

사용자, 팀, 특정 고객 단위로 SMS 비용을 추적하고 싶다면, 알림에 "클라이언트 참조(client reference)"를 추가할 수 있습니다. Vonage에서는 이 값을 기준으로 각 고객의 SMS 활용 내역 리포트를 생성할 수 있습니다. 클라이언트 참조는 최대 40자 길이의 임의 문자열이면 됩니다.

```
/**
 * 알림의 Vonage / SMS 표현을 반환합니다.
 *
 * @param  mixed  $notifiable
 * @return NexmoMessage
 */
public function toNexmo($notifiable)
{
    return (new NexmoMessage)
                ->clientReference((string) $notifiable->id)
                ->content('Your SMS message content');
}
```

<a name="routing-sms-notifications"></a>
### SMS 알림 라우팅

Vonage 알림이 올바른 전화번호로 전송되도록 하려면, notifiable 엔터티(예: User)에서 `routeNotificationForNexmo` 메서드를 정의하세요.

```
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * Nexmo 채널의 알림 라우팅.
     *
     * @param  \Illuminate\Notifications\Notification  $notification
     * @return string
     */
    public function routeNotificationForNexmo($notification)
    {
        return $this->phone_number;
    }
}
```

<a name="slack-notifications"></a>

## 슬랙 알림 (Slack Notifications)

<a name="slack-prerequisites"></a>
### 사전 준비

슬랙을 통해 알림을 전송하려면, 먼저 Composer를 사용하여 Slack 알림 채널 패키지를 설치해야 합니다.

```
composer require laravel/slack-notification-channel
```

또한, 팀을 위해 [Slack App](https://api.slack.com/apps?new_app=1)을 하나 생성해야 합니다. 앱을 만든 후, 워크스페이스에 대해 "Incoming Webhook"을 설정해야 합니다. 그러면 Slack에서 제공하는 웹훅 URL을 받을 수 있으며, 이 URL을 사용하여 [슬랙 알림의 라우팅](#routing-slack-notifications)을 진행할 수 있습니다.

<a name="formatting-slack-notifications"></a>
### 슬랙 알림 포맷팅

알림이 슬랙 메시지로 전송될 수 있도록 하려면, 알림 클래스에 `toSlack` 메서드를 정의해야 합니다. 이 메서드는 `$notifiable` 엔티티를 인자로 받아야 하며, `Illuminate\Notifications\Messages\SlackMessage` 인스턴스를 반환해야 합니다. 슬랙 메시지는 일반 텍스트 뿐만 아니라 추가 정보를 포함하는 "attachment(첨부)"도 가질 수 있습니다. 기본적인 `toSlack` 예제를 살펴보겠습니다.

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
### 슬랙 첨부(Attachment)

슬랙 메시지에는 "attachment(첨부)"도 추가할 수 있습니다. 첨부는 단순 텍스트 메시지보다 더 다양한 포맷팅 옵션을 제공합니다. 아래 예제에서는 애플리케이션에서 예외가 발생했을 때 해당 예외에 대한 상세 정보를 볼 수 있는 링크와 함께 에러 알림을 전송합니다.

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

첨부를 사용하면 사용자에게 보여줄 다양한 데이터를 배열 형태로 지정할 수도 있습니다. 지정한 데이터는 표 형식으로 쉽게 읽을 수 있게 표시됩니다.

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
#### 첨부 내용에서 마크다운 사용

첨부의 일부 필드가 마크다운(Markdown) 포맷을 포함하고 있다면, `markdown` 메서드를 사용하여 Slack이 해당 필드를 마크다운으로 파싱하고 표시하도록 할 수 있습니다. 이 메서드에는 `pretext`, `text`, `fields` 값 중 하나 또는 여러 개를 배열로 전달할 수 있습니다. Slack 첨부 포맷에 대한 자세한 내용은 [Slack API 문서](https://api.slack.com/docs/message-formatting#message_formatting)를 참고하시기 바랍니다.

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
### 슬랙 알림 라우팅

슬랙 알림을 특정 팀과 채널로 전달하려면, 알림을 받을 엔티티에 `routeNotificationForSlack` 메서드를 정의해야 합니다. 이 메서드는 알림이 전송될 웹훅 URL을 반환해야 합니다. 웹훅 URL은 Slack 팀에 "Incoming Webhook" 서비스를 추가해서 생성할 수 있습니다.

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
## 알림의 다국어 처리(Localizing Notifications)

라라벨에서는 알림을 전송할 때 HTTP 요청의 현재 로케일(locale)이 아닌 다른 언어로 알림을 보낼 수 있으며, 알림이 큐에 저장됐다가 나중에 전송된다 해도 지정한 로케일을 기억합니다.

이를 위해 `Illuminate\Notifications\Notification` 클래스는 원하는 언어를 지정하는 `locale` 메서드를 제공합니다. 알림을 평가할 때 애플리케이션의 사용 언어가 지정된 로케일로 변경되었다가, 평가가 끝나면 이전 언어로 다시 복원됩니다.

```
$user->notify((new InvoicePaid($invoice))->locale('es'));
```

여러 명의 알림 수신자를 대상으로 할 경우에는 `Notification` 파사드를 이용해 로케일을 지정할 수도 있습니다.

```
Notification::locale('es')->send(
    $users, new InvoicePaid($invoice)
);
```

<a name="user-preferred-locales"></a>
### 사용자 기본 언어 적용

경우에 따라, 각 사용자의 선호 언어(로케일)를 데이터베이스에 저장하는 경우도 있습니다. 이럴 때에는 알림을 받을 모델에 `HasLocalePreference` 계약(Contract)을 구현하면, 라라벨이 알림 전송 시 해당 사용자의 언어 설정을 자동으로 사용합니다.

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

이 인터페이스를 구현하고 나면, 라라벨이 자동으로 알림 및 메일 전송 시 각 모델의 선호 언어를 사용합니다. 즉, 별도로 `locale` 메서드를 호출하지 않아도 됩니다.

```
$user->notify(new InvoicePaid($invoice));
```

<a name="notification-events"></a>
## 알림 이벤트(Notification Events)

<a name="notification-sending-event"></a>
#### 알림 전송 중 이벤트(Notification Sending Event)

알림이 전송될 때, 라라벨 알림 시스템은 `Illuminate\Notifications\Events\NotificationSending` [이벤트](/docs/8.x/events)를 발생시킵니다. 이 이벤트에는 "알림 받을 엔티티"와 "알림 인스턴스" 자체가 포함되어 있습니다. 이 이벤트에 대한 리스너를 애플리케이션의 `EventServiceProvider`에 등록할 수 있습니다.

```
/**
 * The event listener mappings for the application.
 *
 * @var array
 */
protected $listen = [
    'Illuminate\Notifications\Events\NotificationSending' => [
        'App\Listeners\CheckNotificationStatus',
    ],
];
```

`NotificationSending` 이벤트의 리스너에서 `handle` 메서드가 `false`를 반환하면, 알림이 실제로 전송되지 않습니다.

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

이벤트 리스너 내부에서 `notifiable`, `notification`, `channel` 속성에 접근하여, 알림의 수신자 또는 알림의 세부 정보 등을 확인할 수 있습니다.

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
#### 알림 전송 완료 이벤트(Notification Sent Event)

알림이 실제로 전송이 완료되면, 알림 시스템은 `Illuminate\Notifications\Events\NotificationSent` [이벤트](/docs/8.x/events)를 발생시킵니다. 이 이벤트 역시 "알림 받을 엔티티"와 "알림 인스턴스" 자체를 포함합니다. 해당 이벤트에 대한 리스너를 `EventServiceProvider`에 등록할 수 있습니다.

```
/**
 * The event listener mappings for the application.
 *
 * @var array
 */
protected $listen = [
    'Illuminate\Notifications\Events\NotificationSent' => [
        'App\Listeners\LogNotification',
    ],
];
```

> [!TIP]
> `EventServiceProvider`에 리스너를 등록한 후에는, `event:generate` 아티즌 명령어를 사용해서 리스너 클래스를 빠르게 생성할 수 있습니다.

리스너 내부에서는 `notifiable`, `notification`, `channel`, `response` 속성에 접근하여 알림 수신자, 알림 자체, 실제 응답 등에 대한 정보를 얻을 수 있습니다.

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
## 커스텀 채널(Custom Channels)

라라벨은 여러 가지 기본 알림 채널을 제공하지만, 필요에 따라 직접 드라이버를 만들어 다른 방식으로 알림을 전달할 수도 있습니다. 라라벨은 이를 아주 쉽게 지원합니다. 먼저 `send` 메서드를 가진 클래스를 정의하세요. 이 메서드는 `$notifiable`과 `$notification` 두 개의 인자를 받습니다.

`send` 메서드 내에서 알림의 메서드를 호출하여 채널에서 이해할 수 있는 메시지 객체를 만들고, 원하는 방식으로 `$notifiable` 인스턴스에 알림을 보내면 됩니다.

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

알림 채널 클래스를 정의한 후에는, 각 알림의 `via` 메서드에서 해당 클래스명을 반환할 수 있습니다. 아래 예시에서 보듯, 알림의 `toVoice` 메서드는 여러분이 정의한 음성 메시지를 나타내는 어떤 객체든 반환할 수 있습니다. 예를 들어, 여러분만의 `VoiceMessage` 클래스를 만들어 이 메시지를 구현할 수 있습니다.

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