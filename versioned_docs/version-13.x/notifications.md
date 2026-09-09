<!-- # Notifications -->
# Notifications

- [Introduction](#introduction)
- [Generating Notifications](#generating-notifications)
- [Sending Notifications](#sending-notifications)
    - [Using the Notifiable Trait](#using-the-notifiable-trait)
    - [Using the Notification Facade](#using-the-notification-facade)
    - [Specifying Delivery Channels](#specifying-delivery-channels)
    - [Queueing Notifications](#queueing-notifications)
    - [On-Demand Notifications](#on-demand-notifications)
- [Mail Notifications](#mail-notifications)
    - [Formatting Mail Messages](#formatting-mail-messages)
    - [Customizing the Sender](#customizing-the-sender)
    - [Customizing the Recipient](#customizing-the-recipient)
    - [Customizing the Subject](#customizing-the-subject)
    - [Customizing the Mailer](#customizing-the-mailer)
    - [Customizing the Templates](#customizing-the-templates)
    - [Attachments](#mail-attachments)
    - [Adding Tags and Metadata](#adding-tags-metadata)
    - [Customizing the Symfony Message](#customizing-the-symfony-message)
    - [Using Mailables](#using-mailables)
    - [Previewing Mail Notifications](#previewing-mail-notifications)
- [Markdown Mail Notifications](#markdown-mail-notifications)
    - [Generating the Message](#generating-the-message)
    - [Writing the Message](#writing-the-message)
    - [Customizing the Components](#customizing-the-components)
- [Database Notifications](#database-notifications)
    - [Prerequisites](#database-prerequisites)
    - [Formatting Database Notifications](#formatting-database-notifications)
    - [Accessing the Notifications](#accessing-the-notifications)
    - [Marking Notifications as Read](#marking-notifications-as-read)
- [Broadcast Notifications](#broadcast-notifications)
    - [Prerequisites](#broadcast-prerequisites)
    - [Formatting Broadcast Notifications](#formatting-broadcast-notifications)
    - [Listening for Notifications](#listening-for-notifications)
- [SMS Notifications](#sms-notifications)
    - [Prerequisites](#sms-prerequisites)
    - [Formatting SMS Notifications](#formatting-sms-notifications)
    - [Customizing the "From" Number](#customizing-the-from-number)
    - [Adding a Client Reference](#adding-a-client-reference)
    - [Routing SMS Notifications](#routing-sms-notifications)
- [Slack Notifications](#slack-notifications)
    - [Prerequisites](#slack-prerequisites)
    - [Formatting Slack Notifications](#formatting-slack-notifications)
    - [Slack Interactivity](#slack-interactivity)
    - [Routing Slack Notifications](#routing-slack-notifications)
    - [Notifying External Slack Workspaces](#notifying-external-slack-workspaces)
- [Localizing Notifications](#localizing-notifications)
- [Testing](#testing)
- [Notification Events](#notification-events)
- [Custom Channels](#custom-channels)

<a name="introduction"></a>
<!-- ## Introduction -->
## Introduction

<!-- In addition to support for [sending email](/docs/13.x/mail), Laravel provides support for sending notifications across a variety of delivery channels, including email, SMS (via [Vonage](https://www.vonage.com/communications-apis/), formerly known as Nexmo), and [Slack](https://slack.com). In addition, a variety of [community built notification channels](https://laravel-notification-channels.com/about/#suggesting-a-new-channel) have been created to send notifications over dozens of different channels! Notifications may also be stored in a database so they may be displayed in your web interface. -->
Laravel은 [sending email](/docs/13.x/mail)을 지원하는 것에 더해, 이메일, SMS(이전에는 Nexmo로 알려졌던 [Vonage](https://www.vonage.com/communications-apis/)를 통해), [Slack](https://slack.com)을 포함한 다양한 전달 채널로 알림을 전송하는 기능을 제공합니다. 또한 여러 다른 채널을 통해 알림을 보낼 수 있도록 다양한 [community built notification channels](https://laravel-notification-channels.com/about/#suggesting-a-new-channel)도 만들어져 있습니다! 알림은 데이터베이스에 저장하여 웹 인터페이스에 표시할 수도 있습니다.

<!-- Typically, notifications should be short, informational messages that notify users of something that occurred in your application. For example, if you are writing a billing application, you might send an "Invoice Paid" notification to your users via the email and SMS channels. -->
일반적으로 알림은 애플리케이션에서 발생한 일을 사용자에게 알려 주는 짧은 정보성 메시지여야 합니다. 예를 들어 결제 애플리케이션을 작성하고 있다면, 이메일과 SMS 채널을 통해 사용자에게 "Invoice Paid" 알림을 보낼 수 있습니다.

<a name="generating-notifications"></a>
<!-- ## Generating Notifications -->
## Generating Notifications

<!-- In Laravel, each notification is represented by a single class that is typically stored in the `app/Notifications` directory. Don't worry if you don't see this directory in your application - it will be created for you when you run the `make:notification` Artisan command: -->
Laravel에서 각 알림은 보통 `app/Notifications` 디렉터리에 저장되는 하나의 클래스로 표현됩니다. 애플리케이션에 이 디렉터리가 보이지 않더라도 걱정하지 마십시오. `make:notification` Artisan 명령어를 실행하면 자동으로 생성됩니다.

```shell
php artisan make:notification InvoicePaid
```

<!-- This command will place a fresh notification class in your `app/Notifications` directory. Each notification class contains a `via` method and a variable number of message building methods, such as `toMail` or `toDatabase`, that convert the notification to a message tailored for that particular channel. -->
이 명령어는 `app/Notifications` 디렉터리에 새 알림 클래스를 배치합니다. 각 알림 클래스에는 `via` 메서드와 `toMail`, `toDatabase` 같은 여러 메시지 생성 메서드가 포함되어 있으며, 이 메서드들은 알림을 해당 특정 채널에 맞는 메시지로 변환합니다.

<a name="sending-notifications"></a>
<!-- ## Sending Notifications -->
## Sending Notifications

<a name="using-the-notifiable-trait"></a>
<!-- ### Using the Notifiable Trait -->
### Using the Notifiable Trait

<!-- Notifications may be sent in two ways: using the `notify` method of the `Notifiable` trait or using the `Notification` [facade](/docs/13.x/facades). The `Notifiable` trait is included on your application's `App\Models\User` model by default: -->
알림은 두 가지 방법으로 전송할 수 있습니다. `Notifiable` 트레이트의 `notify` 메서드를 사용하거나, `Notification` [facade](/docs/13.x/facades)를 사용할 수 있습니다. `Notifiable` 트레이트는 기본적으로 애플리케이션의 `App\Models\User` 모델에 포함되어 있습니다.

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

<!-- The `notify` method that is provided by this trait expects to receive a notification instance: -->
이 트레이트가 제공하는 `notify` 메서드는 알림 인스턴스를 전달받습니다.

```php
use App\Notifications\InvoicePaid;

$user->notify(new InvoicePaid($invoice));
```

> [!NOTE]
> `Notifiable` 트레이트는 모든 모델에서 사용할 수 있다는 점을 기억하십시오. `User` 모델에만 포함해야 하는 것은 아닙니다.

<a name="using-the-notification-facade"></a>
<!-- ### Using the Notification Facade -->
### Using the Notification Facade

<!-- Alternatively, you may send notifications via the `Notification` [facade](/docs/13.x/facades). This approach is useful when you need to send a notification to multiple notifiable entities such as a collection of users. To send notifications using the facade, pass all of the notifiable entities and the notification instance to the `send` method: -->
또는 `Notification` [facade](/docs/13.x/facades)를 통해 알림을 전송할 수도 있습니다. 이 방식은 사용자 컬렉션처럼 알림을 받을 수 있는 여러 엔티티에 알림을 보내야 할 때 유용합니다. 파사드를 사용해 알림을 전송하려면, 알림을 받을 모든 엔티티와 알림 인스턴스를 `send` 메서드에 전달하십시오.

```php
use Illuminate\Support\Facades\Notification;

Notification::send($users, new InvoicePaid($invoice));
```

<!-- You can also send notifications immediately using the `sendNow` method. This method will send the notification immediately even if the notification implements the `ShouldQueue` interface: -->
`sendNow` 메서드를 사용하여 알림을 즉시 전송할 수도 있습니다. 이 메서드는 알림이 `ShouldQueue` 인터페이스를 구현하더라도 즉시 알림을 전송합니다.

```php
Notification::sendNow($developers, new DeploymentCompleted($deployment));
```

<a name="specifying-delivery-channels"></a>
<!-- ### Specifying Delivery Channels -->
### Specifying Delivery Channels

<!-- Every notification class has a `via` method that determines on which channels the notification will be delivered. Notifications may be sent on the `mail`, `database`, `broadcast`, `vonage`, and `slack` channels. -->
모든 알림 클래스에는 알림이 어떤 채널로 전달될지를 결정하는 `via` 메서드가 있습니다. 알림은 `mail`, `database`, `broadcast`, `vonage`, `slack` 채널로 전송할 수 있습니다.

> [!NOTE]
> Telegram이나 Pusher 같은 다른 전달 채널을 사용하고 싶다면, 커뮤니티가 운영하는 [Laravel Notification Channels website](http://laravel-notification-channels.com)를 확인하십시오.

<!-- The `via` method receives a `$notifiable` instance, which will be an instance of the class to which the notification is being sent. You may use `$notifiable` to determine which channels the notification should be delivered on: -->
`via` 메서드는 알림이 전송될 클래스의 인스턴스인 `$notifiable` 인스턴스를 전달받습니다. `$notifiable`을 사용해 알림이 어떤 채널로 전달되어야 하는지 결정할 수 있습니다.

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
<!-- ### Queueing Notifications -->
### Queueing Notifications

> [!WARNING]
> 알림을 큐에 넣기 전에 큐를 설정하고 [start a worker](/docs/13.x/queues#running-the-queue-worker)해야 합니다.

<!-- Sending notifications can take time, especially if the channel needs to make an external API call to deliver the notification. To speed up your application's response time, let your notification be queued by adding the `ShouldQueue` interface and `Queueable` trait to your class. The interface and trait are already imported for all notifications generated using the `make:notification` command, so you may immediately add them to your notification class: -->
알림 전송에는 시간이 걸릴 수 있습니다. 특히 채널이 알림을 전달하기 위해 외부 API 호출을 해야 한다면 더 그렇습니다. 애플리케이션의 응답 시간을 빠르게 하려면 알림 클래스에 `ShouldQueue` 인터페이스와 `Queueable` 트레이트를 추가하여 알림이 큐에 들어가도록 하십시오. `make:notification` 명령어로 생성된 모든 알림에는 이 인터페이스와 트레이트가 이미 import되어 있으므로, 바로 알림 클래스에 추가할 수 있습니다.

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

<!-- Once the `ShouldQueue` interface has been added to your notification, you may send the notification like normal. Laravel will detect the `ShouldQueue` interface on the class and automatically queue the delivery of the notification: -->
알림에 `ShouldQueue` 인터페이스가 추가되면, 평소와 같은 방식으로 알림을 전송할 수 있습니다. Laravel은 클래스의 `ShouldQueue` 인터페이스를 감지하고 알림 전달을 자동으로 큐에 넣습니다.

```php
$user->notify(new InvoicePaid($invoice));
```

<!-- When queueing notifications, a queued job will be created for each recipient and channel combination. For example, six jobs will be dispatched to the queue if your notification has three recipients and two channels. -->
알림을 큐에 넣으면 각 수신자와 채널 조합마다 하나의 큐 작업이 생성됩니다. 예를 들어 알림에 수신자가 세 명이고 채널이 두 개라면, 여섯 개의 작업이 큐에 디스패치됩니다.

<a name="delaying-notifications"></a>
<!-- #### Delaying Notifications -->
#### Delaying Notifications

<!-- If you would like to delay the delivery of the notification, you may chain the `delay` method onto your notification instantiation: -->
알림 전달을 지연하고 싶다면 알림 인스턴스를 생성할 때 `delay` 메서드를 체이닝할 수 있습니다.

```php
$delay = now()->plus(minutes: 10);

$user->notify((new InvoicePaid($invoice))->delay($delay));
```

<!-- You may pass an array to the `delay` method to specify the delay amount for specific channels: -->
특정 채널에 대한 지연 시간을 지정하려면 `delay` 메서드에 배열을 전달할 수 있습니다.

```php
$user->notify((new InvoicePaid($invoice))->delay([
    'mail' => now()->plus(minutes: 5),
    'sms' => now()->plus(minutes: 10),
]));
```

<!-- Alternatively, you may define a `withDelay` method on the notification class itself. The `withDelay` method should return an array of channel names and delay values: -->
또는 알림 클래스 자체에 `withDelay` 메서드를 정의할 수도 있습니다. `withDelay` 메서드는 채널 이름과 지연 값으로 이루어진 배열을 반환해야 합니다.

```php
/**
 * Determine the notification's delivery delay.
 *
 * @return array<string, \Illuminate\Support\Carbon>
 */
public function withDelay(object $notifiable): array
{
    return [
        'mail' => now()->plus(minutes: 5),
        'sms' => now()->plus(minutes: 10),
    ];
}
```

<a name="customizing-the-notification-queue-connection"></a>
<!-- #### Customizing the Notification Queue Connection -->
#### Customizing the Notification Queue Connection

<!-- By default, queued notifications will be queued using your application's default queue connection. If you would like to specify a different connection that should be used for a particular notification, you may call the `onConnection` method from your notification's constructor: -->
기본적으로 큐에 들어간 알림은 애플리케이션의 기본 큐 연결을 사용해 큐에 등록됩니다. 특정 알림에 사용할 다른 연결을 지정하고 싶다면, 알림의 생성자에서 `onConnection` 메서드를 호출할 수 있습니다.

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

<!-- Or, if you would like to specify a specific queue connection that should be used for each notification channel supported by the notification, you may define a `viaConnections` method on your notification. This method should return an array of channel name / queue connection name pairs: -->
또는 알림이 지원하는 각 알림 채널마다 사용할 특정 큐 연결을 지정하고 싶다면, 알림에 `viaConnections` 메서드를 정의할 수 있습니다. 이 메서드는 채널 이름 / 큐 연결 이름 쌍의 배열을 반환해야 합니다.

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
<!-- #### Customizing Notification Channel Queues -->
#### Customizing Notification Channel Queues

<!-- If you would like to specify a specific queue that should be used for each notification channel supported by the notification, you may define a `viaQueues` method on your notification. This method should return an array of channel name / queue name pairs: -->
알림이 지원하는 각 알림 채널마다 사용할 특정 큐를 지정하고 싶다면, 알림에 `viaQueues` 메서드를 정의할 수 있습니다. 이 메서드는 채널 이름 / 큐 이름 쌍의 배열을 반환해야 합니다.

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

<a name="customizing-queued-notification-job-properties"></a>
<!-- #### Customizing Queued Notification Job Attributes -->
#### Customizing Queued Notification Job Attributes

<!-- You may customize the behavior of the underlying queued job by defining queue attributes on your notification class. These attributes will be inherited by the queued job that sends the notification: -->
알림 클래스에 큐 속성을 정의하여 기반이 되는 큐 작업의 동작을 커스터마이징할 수 있습니다. 이 속성들은 알림을 전송하는 큐 작업에 상속됩니다.

```php
<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Queue\Attributes\FailOnTimeout;
use Illuminate\Queue\Attributes\MaxExceptions;
use Illuminate\Queue\Attributes\Timeout;
use Illuminate\Queue\Attributes\Tries;

#[Tries(5)]
#[Timeout(120)]
#[MaxExceptions(3)]
#[FailOnTimeout]
class InvoicePaid extends Notification implements ShouldQueue
{
    use Queueable;

    // ...
}
```

<!-- If you would like to ensure the privacy and integrity of a queued notification's data via [encryption](/docs/13.x/encryption), add the `ShouldBeEncrypted` interface to your notification class: -->
[encryption](/docs/13.x/encryption)를 통해 큐에 등록된 알림 데이터의 개인정보 보호와 무결성을 보장하고 싶다면, 알림 클래스에 `ShouldBeEncrypted` 인터페이스를 추가하십시오.

```php
<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeEncrypted;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class InvoicePaid extends Notification implements ShouldQueue, ShouldBeEncrypted
{
    use Queueable;

    // ...
}
```

<!-- In addition to defining these attributes directly on your notification class, you may also define `backoff` and `retryUntil` methods to specify the backoff strategy and retry timeout for the queued notification job: -->
이러한 속성을 알림 클래스에 직접 정의하는 것 외에도, `backoff`와 `retryUntil` 메서드를 정의하여 큐에 등록된 알림 작업의 백오프 전략과 재시도 제한 시간을 지정할 수 있습니다.

```php
use DateTime;

/**
 * Calculate the number of seconds to wait before retrying the notification.
 */
public function backoff(): int
{
    return 3;
}

/**
 * Determine the time at which the notification should timeout.
 */
public function retryUntil(): DateTime
{
    return now()->plus(minutes: 5);
}
```

> [!NOTE]
> 이러한 작업 속성과 메서드에 대한 자세한 내용은 [queued jobs](/docs/13.x/queues#max-job-attempts-and-timeout) 문서를 확인하십시오.

<a name="queued-notification-middleware"></a>
<!-- #### Queued Notification Middleware -->
#### Queued Notification Middleware

<!-- Queued notifications may define middleware [just like queued jobs](/docs/13.x/queues#job-middleware). To get started, define a `middleware` method on your notification class. The `middleware` method will receive `$notifiable` and `$channel` variables, which allow you to customize the returned middleware based on the notification's destination: -->
큐에 등록된 알림은 [just like queued jobs](/docs/13.x/queues#job-middleware) Middleware를 정의할 수 있습니다. 시작하려면 알림 클래스에 `middleware` 메서드를 정의하십시오. `middleware` 메서드는 `$notifiable`과 `$channel` 변수를 전달받으며, 이를 통해 알림의 목적지에 따라 반환할 Middleware를 커스터마이징할 수 있습니다.

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
<!-- #### Queued Notifications and Database Transactions -->
#### Queued Notifications and Database Transactions

<!-- When queued notifications are dispatched within database transactions, they may be processed by the queue before the database transaction has committed. When this happens, any updates you have made to models or database records during the database transaction may not yet be reflected in the database. In addition, any models or database records created within the transaction may not exist in the database. If your notification depends on these models, unexpected errors can occur when the job that sends the queued notification is processed. -->
큐에 등록된 알림이 데이터베이스 트랜잭션 안에서 디스패치되면, 데이터베이스 트랜잭션이 커밋되기 전에 큐가 이를 처리할 수 있습니다. 이런 일이 발생하면 데이터베이스 트랜잭션 중에 모델이나 데이터베이스 레코드에 적용한 업데이트가 아직 데이터베이스에 반영되지 않았을 수 있습니다. 또한 트랜잭션 안에서 생성된 모델이나 데이터베이스 레코드가 데이터베이스에 존재하지 않을 수도 있습니다. 알림이 이러한 모델에 의존한다면, 큐에 등록된 알림을 전송하는 작업이 처리될 때 예상치 못한 오류가 발생할 수 있습니다.

<!-- If your queue connection's `after_commit` configuration option is set to `false`, you may still indicate that a particular queued notification should be dispatched after all open database transactions have been committed by calling the `afterCommit` method when sending the notification: -->
큐 연결의 `after_commit` 설정 옵션이 `false`로 설정되어 있더라도, 알림을 전송할 때 `afterCommit` 메서드를 호출하여 특정 큐 알림이 열려 있는 모든 데이터베이스 트랜잭션이 커밋된 이후에 디스패치되어야 한다고 지정할 수 있습니다.

```php
use App\Notifications\InvoicePaid;

$user->notify((new InvoicePaid($invoice))->afterCommit());
```

<!-- Alternatively, you may call the `afterCommit` method from your notification's constructor: -->
또는 알림의 생성자에서 `afterCommit` 메서드를 호출할 수도 있습니다.

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
> 이러한 문제를 우회하는 방법을 더 알아보려면 [queued jobs and database transactions](/docs/13.x/queues#jobs-and-database-transactions)에 관한 문서를 확인하십시오.

<a name="determining-if-the-queued-notification-should-be-sent"></a>
<!-- #### Determining if a Queued Notification Should Be Sent -->
#### Determining if a Queued Notification Should Be Sent

<!-- After a queued notification has been dispatched for the queue for background processing, it will typically be accepted by a queue worker and sent to its intended recipient. -->
큐에 추가된 알림이 백그라운드 처리를 위해 큐에 디스패치되면, 일반적으로 큐 워커가 이를 받아 의도한 수신자에게 전송합니다.

<!-- However, if you would like to make the final determination on whether the queued notification should be sent after it is being processed by a queue worker, you may define a `shouldSend` method on the notification class. If this method returns `false`, the notification will not be sent: -->
하지만 큐 워커가 알림을 처리하는 시점에, 큐에 추가된 알림을 실제로 전송할지 최종적으로 결정하고 싶다면 알림 클래스에 `shouldSend` 메서드를 정의할 수 있습니다. 이 메서드가 `false`를 반환하면 알림은 전송되지 않습니다.

```php
/**
 * Determine if the notification should be sent.
 */
public function shouldSend(object $notifiable, string $channel): bool
{
    return $this->invoice->isPaid();
}
```

<a name="after-sending-notifications"></a>
<!-- #### After Sending Notifications -->
#### After Sending Notifications

<!-- If you would like to execute code after a notification has been sent, you may define an `afterSending` method on the notification class. This method will receive the notifiable entity, the channel name, and the response from the channel: -->
알림이 전송된 후 코드를 실행하고 싶다면 알림 클래스에 `afterSending` 메서드를 정의할 수 있습니다. 이 메서드는 알림을 받을 수 있는 엔티티, 채널 이름, 그리고 채널의 응답을 전달받습니다.

```php
/**
 * Handle the notification after it has been sent.
 */
public function afterSending(object $notifiable, string $channel, mixed $response): void
{
    // ...
}
```

<a name="on-demand-notifications"></a>
<!-- ### On-Demand Notifications -->
### On-Demand Notifications

<!-- Sometimes you may need to send a notification to someone who is not stored as a "user" of your application. Using the `Notification` facade's `route` method, you may specify ad-hoc notification routing information before sending the notification: -->
때로는 애플리케이션의 "사용자"로 저장되어 있지 않은 사람에게 알림을 보내야 할 수 있습니다. `Notification` 파사드의 `route` 메서드를 사용하면 알림을 보내기 전에 임시 알림 라우팅 정보를 지정할 수 있습니다.

```php
use Illuminate\Broadcasting\Channel;
use Illuminate\Support\Facades\Notification;

Notification::route('mail', 'taylor@example.com')
    ->route('vonage', '5555555555')
    ->route('slack', '#slack-channel')
    ->route('broadcast', [new Channel('channel-name')])
    ->notify(new InvoicePaid($invoice));
```

<!-- If you would like to provide the recipient's name when sending an on-demand notification to the `mail` route, you may provide an array that contains the email address as the key and the name as the value of the first element in the array: -->
`mail` 라우트로 온디맨드 알림을 보낼 때 수신자의 이름을 함께 제공하고 싶다면, 배열의 첫 번째 요소에서 이메일 주소를 키로, 이름을 값으로 포함하는 배열을 전달할 수 있습니다.

```php
Notification::route('mail', [
    'barrett@example.com' => 'Barrett Blair',
])->notify(new InvoicePaid($invoice));
```

<!-- Using the `routes` method, you may provide ad-hoc routing information for multiple notification channels at once: -->
`routes` 메서드를 사용하면 여러 알림 채널에 대한 임시 라우팅 정보를 한 번에 제공할 수 있습니다.

```php
Notification::routes([
    'mail' => ['barrett@example.com' => 'Barrett Blair'],
    'vonage' => '5555555555',
])->notify(new InvoicePaid($invoice));
```

<a name="mail-notifications"></a>
<!-- ## Mail Notifications -->
## Mail Notifications

<a name="formatting-mail-messages"></a>
<!-- ### Formatting Mail Messages -->
### Formatting Mail Messages

<!-- If a notification supports being sent as an email, you should define a `toMail` method on the notification class. This method will receive a `$notifiable` entity and should return an `Illuminate\Notifications\Messages\MailMessage` instance. -->
알림이 이메일로 전송될 수 있다면 알림 클래스에 `toMail` 메서드를 정의해야 합니다. 이 메서드는 `$notifiable` 엔티티를 전달받고 `Illuminate\Notifications\Messages\MailMessage` 인스턴스를 반환해야 합니다.

<!-- The `MailMessage` class contains a few simple methods to help you build transactional email messages. Mail messages may contain lines of text as well as a "call to action". Let's take a look at an example `toMail` method: -->
`MailMessage` 클래스에는 트랜잭션 이메일 메시지를 작성하는 데 도움이 되는 몇 가지 간단한 메서드가 포함되어 있습니다. 메일 메시지에는 텍스트 줄과 "행동 유도"가 포함될 수 있습니다. 다음은 `toMail` 메서드 예시입니다.

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
> `toMail` 메서드에서 `$this->invoice->id`를 사용하고 있다는 점에 주목하십시오. 알림 메시지를 생성하는 데 필요한 모든 데이터를 알림의 생성자에 전달할 수 있습니다.

<!-- In this example, we register a greeting, a line of text, a call to action, and then another line of text. These methods provided by the `MailMessage` object make it simple and fast to format small transactional emails. The mail channel will then translate the message components into a beautiful, responsive HTML email template with a plain-text counterpart. Here is an example of an email generated by the `mail` channel: -->
이 예시에서는 인사말, 텍스트 줄, 행동 유도, 그리고 또 다른 텍스트 줄을 등록합니다. `MailMessage` 객체가 제공하는 이러한 메서드를 사용하면 작은 트랜잭션 이메일을 쉽고 빠르게 구성할 수 있습니다. 그런 다음 메일 채널은 메시지 구성 요소를 보기 좋은 반응형 HTML 이메일 템플릿과 그에 대응하는 일반 텍스트 버전으로 변환합니다. 다음은 `mail` 채널이 생성한 이메일 예시입니다.

<img src="https://laravel.com/img/docs/notification-example-2.png"/>

> [!NOTE]
> 메일 알림을 보낼 때는 `config/app.php` 설정 파일의 `name` 설정 옵션을 반드시 지정하십시오. 이 값은 메일 알림 메시지의 헤더와 푸터에서 사용됩니다.

<a name="error-messages"></a>
<!-- #### Error Messages -->
#### Error Messages

<!-- Some notifications inform users of errors, such as a failed invoice payment. You may indicate that a mail message is regarding an error by calling the `error` method when building your message. When using the `error` method on a mail message, the call to action button will be red instead of black: -->
일부 알림은 송장 결제 실패와 같은 오류를 사용자에게 알려줍니다. 메시지를 작성할 때 `error` 메서드를 호출하면 해당 메일 메시지가 오류와 관련된 것임을 나타낼 수 있습니다. 메일 메시지에서 `error` 메서드를 사용하면 행동 유도 버튼이 검은색 대신 빨간색으로 표시됩니다.

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
<!-- #### Other Mail Notification Formatting Options -->
#### Other Mail Notification Formatting Options

<!-- Instead of defining the "lines" of text in the notification class, you may use the `view` method to specify a custom template that should be used to render the notification email: -->
알림 클래스에서 텍스트 "줄"을 정의하는 대신, `view` 메서드를 사용하여 알림 이메일을 렌더링할 때 사용할 커스텀 템플릿을 지정할 수 있습니다.

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

<!-- You may specify a plain-text view for the mail message by passing the view name as the second element of an array that is given to the `view` method: -->
메일 메시지의 일반 텍스트 뷰는 `view` 메서드에 전달하는 배열의 두 번째 요소로 뷰 이름을 전달하여 지정할 수 있습니다.

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

<!-- Or, if your message only has a plain-text view, you may utilize the `text` method: -->
또는 메시지에 일반 텍스트 뷰만 있는 경우 `text` 메서드를 사용할 수 있습니다.

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
<!-- ### Customizing the Sender -->
### Customizing the Sender

<!-- By default, the email's sender / from address is defined in the `config/mail.php` configuration file. However, you may specify the from address for a specific notification using the `from` method: -->
기본적으로 이메일의 발신자 / from 주소는 `config/mail.php` 설정 파일에 정의됩니다. 하지만 `from` 메서드를 사용하여 특정 알림에 대한 발신자 주소를 지정할 수 있습니다.

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
<!-- ### Customizing the Recipient -->
### Customizing the Recipient

<!-- When sending notifications via the `mail` channel, the notification system will automatically look for an `email` property on your notifiable entity. You may customize which email address is used to deliver the notification by defining a `routeNotificationForMail` method on the notifiable entity: -->
`mail` 채널을 통해 알림을 보낼 때 알림 시스템은 알림을 받을 수 있는 엔티티에서 `email` 속성을 자동으로 찾습니다. 알림을 전달하는 데 사용할 이메일 주소를 커스터마이징하려면, 알림을 받을 수 있는 엔티티에 `routeNotificationForMail` 메서드를 정의하면 됩니다.

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
        // Return email address only...
        return $this->email_address;

        // Return email address and name...
        return [$this->email_address => $this->name];
    }
}
```

<a name="customizing-the-subject"></a>
<!-- ### Customizing the Subject -->
### Customizing the Subject

<!-- By default, the email's subject is the class name of the notification formatted to "Title Case". So, if your notification class is named `InvoicePaid`, the email's subject will be `Invoice Paid`. If you would like to specify a different subject for the message, you may call the `subject` method when building your message: -->
기본적으로 이메일 제목은 알림 클래스 이름을 "Title Case" 형식으로 변환한 값입니다. 따라서 알림 클래스 이름이 `InvoicePaid`라면 이메일 제목은 `Invoice Paid`가 됩니다. 메시지에 다른 제목을 지정하고 싶다면 메시지를 작성할 때 `subject` 메서드를 호출하면 됩니다.

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
<!-- ### Customizing the Mailer -->
### Customizing the Mailer

<!-- By default, the email notification will be sent using the default mailer defined in the `config/mail.php` configuration file. However, you may specify a different mailer at runtime by calling the `mailer` method when building your message: -->
기본적으로 이메일 알림은 `config/mail.php` 설정 파일에 정의된 기본 mailer를 사용하여 전송됩니다. 하지만 메시지를 작성할 때 `mailer` 메서드를 호출하면 런타임에 다른 mailer를 지정할 수 있습니다.

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
<!-- ### Customizing the Templates -->
### Customizing the Templates

<!-- You can modify the HTML and plain-text template used by mail notifications by publishing the notification package's resources. After running this command, the mail notification templates will be located in the `resources/views/vendor/notifications` directory: -->
알림 패키지의 리소스를 퍼블리시하면 메일 알림에서 사용하는 HTML 및 일반 텍스트 템플릿을 수정할 수 있습니다. 이 명령어를 실행한 후에는 메일 알림 템플릿이 `resources/views/vendor/notifications` 디렉터리에 위치합니다.

```shell
php artisan vendor:publish --tag=laravel-notifications
```

<a name="mail-attachments"></a>
<!-- ### Attachments -->
### Attachments

<!-- To add attachments to an email notification, use the `attach` method while building your message. The `attach` method accepts the absolute path to the file as its first argument: -->
이메일 알림에 첨부 파일을 추가하려면 메시지를 작성할 때 `attach` 메서드를 사용하십시오. `attach` 메서드는 첫 번째 인수로 파일의 절대 경로를 받습니다.

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
> 알림 메일 메시지가 제공하는 `attach` 메서드는 [attachable objects](/docs/13.x/mail#attachable-objects)도 받을 수 있습니다. 더 자세히 알아보려면 종합적인 [attachable object documentation](/docs/13.x/mail#attachable-objects)를 참고하십시오.

<!-- When attaching files to a message, you may also specify the display name and / or MIME type by passing an `array` as the second argument to the `attach` method: -->
메시지에 파일을 첨부할 때는 `attach` 메서드의 두 번째 인수로 `array`를 전달하여 표시 이름 및 / 또는 MIME 타입을 지정할 수도 있습니다.

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

<!-- When necessary, multiple files may be attached to a message using the `attachMany` method: -->
필요한 경우 `attachMany` 메서드를 사용하여 여러 파일을 메시지에 첨부할 수 있습니다.

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

<!-- You may use the `attachFromStorageDisk` method to attach a file that exists on a specific [filesystem disk](/docs/13.x/filesystem). This method accepts the disk name and the path to the file on that disk: -->
특정 [filesystem disk](/docs/13.x/filesystem)에 존재하는 파일을 첨부하려면 `attachFromStorageDisk` 메서드를 사용할 수 있습니다. 이 메서드는 디스크 이름과 해당 디스크상의 파일 경로를 인수로 받습니다.

```php
use App\Mail\InvoicePaid as InvoicePaidMailable;

/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): Mailable
{
    return (new InvoicePaidMailable($this->invoice))
        ->to($notifiable->email)
        ->attachFromStorageDisk('s3', '/path/to/file', 'invoice.pdf', [
            'mime' => 'application/pdf',
        ]);
}
```

<a name="raw-data-attachments"></a>
<!-- #### Raw Data Attachments -->
#### Raw Data Attachments

<!-- The `attachData` method may be used to attach a raw string of bytes as an attachment. When calling the `attachData` method, you should provide the filename that should be assigned to the attachment: -->
`attachData` 메서드는 원시 바이트 문자열을 첨부 파일로 첨부하는 데 사용할 수 있습니다. `attachData` 메서드를 호출할 때는 첨부 파일에 지정할 파일 이름을 제공해야 합니다.

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
<!-- ### Adding Tags and Metadata -->
### Adding Tags and Metadata

<!-- Some third-party email providers such as Mailgun and Postmark support message "tags" and "metadata", which may be used to group and track emails sent by your application. You may add tags and metadata to an email message via the `tag` and `metadata` methods: -->
Mailgun, Postmark와 같은 일부 서드파티 이메일 제공업체는 애플리케이션이 보낸 이메일을 그룹화하고 추적하는 데 사용할 수 있는 메시지 "태그"와 "메타데이터"를 지원합니다. `tag` 및 `metadata` 메서드를 통해 이메일 메시지에 태그와 메타데이터를 추가할 수 있습니다.

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

<!-- If your application is using the Mailgun driver, you may consult Mailgun's documentation for more information on [tags](https://documentation.mailgun.com/docs/mailgun/user-manual/tracking-messages/#tags) and [metadata](https://documentation.mailgun.com/docs/mailgun/user-manual/sending-messages/#attaching-metadata-to-messages). Likewise, the Postmark documentation may also be consulted for more information on their support for [tags](https://postmarkapp.com/blog/tags-support-for-smtp) and [metadata](https://postmarkapp.com/support/article/1125-custom-metadata-faq). -->
애플리케이션이 Mailgun 드라이버를 사용한다면 [tags](https://documentation.mailgun.com/docs/mailgun/user-manual/tracking-messages/#tags)와 [metadata](https://documentation.mailgun.com/docs/mailgun/user-manual/sending-messages/#attaching-metadata-to-messages)에 대한 자세한 내용은 Mailgun 문서를 참고할 수 있습니다. 마찬가지로 Postmark가 지원하는 [tags](https://postmarkapp.com/blog/tags-support-for-smtp)와 [metadata](https://postmarkapp.com/support/article/1125-custom-metadata-faq)에 대한 자세한 내용은 Postmark 문서를 참고할 수 있습니다.

<!-- If your application is using Amazon SES to send emails, you should use the `metadata` method to attach [SES "tags"](https://docs.aws.amazon.com/ses/latest/APIReference/API_MessageTag.html) to the message. -->
애플리케이션이 Amazon SES를 사용하여 이메일을 보내는 경우, `metadata` 메서드를 사용하여 [SES "tags"](https://docs.aws.amazon.com/ses/latest/APIReference/API_MessageTag.html)를 메시지에 첨부해야 합니다.

<a name="customizing-the-symfony-message"></a>
<!-- ### Customizing the Symfony Message -->
### Customizing the Symfony Message

<!-- The `withSymfonyMessage` method of the `MailMessage` class allows you to register a closure which will be invoked with the Symfony Message instance before sending the message. This gives you an opportunity to deeply customize the message before it is delivered: -->
`MailMessage` 클래스의 `withSymfonyMessage` 메서드를 사용하면 메시지를 보내기 전에 Symfony Message 인스턴스와 함께 호출될 클로저를 등록할 수 있습니다. 이를 통해 메시지가 전달되기 전에 메시지를 더 깊이 커스터마이징할 수 있습니다.

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
<!-- ### Using Mailables -->
### Using Mailables
<!-- If needed, you may return a full [mailable object](/docs/13.x/mail) from your notification's `toMail` method. When returning a `Mailable` instead of a `MailMessage`, you will need to specify the message recipient using the mailable object's `to` method: -->
필요하다면 알림의 `toMail` 메서드에서 전체 [mailable object](/docs/13.x/mail)를 반환할 수 있습니다. `MailMessage` 대신 `Mailable`을 반환할 때는 mailable 객체의 `to` 메서드를 사용하여 메시지 수신자를 지정해야 합니다.

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
<!-- #### Mailables and On-Demand Notifications -->
#### Mailables and On-Demand Notifications

<!-- If you are sending an [on-demand notification](#on-demand-notifications), the `$notifiable` instance given to the `toMail` method will be an instance of `Illuminate\Notifications\AnonymousNotifiable`, which offers a `routeNotificationFor` method that may be used to retrieve the email address the on-demand notification should be sent to: -->
[on-demand notification](#on-demand-notifications)을 보내는 경우, `toMail` 메서드에 전달되는 `$notifiable` 인스턴스는 `Illuminate\Notifications\AnonymousNotifiable`의 인스턴스입니다. 이 클래스는 온디맨드 알림을 보낼 이메일 주소를 가져오는 데 사용할 수 있는 `routeNotificationFor` 메서드를 제공합니다.

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
<!-- ### Previewing Mail Notifications -->
### Previewing Mail Notifications

<!-- When designing a mail notification template, it is convenient to quickly preview the rendered mail message in your browser like a typical Blade template. For this reason, Laravel allows you to return any mail message generated by a mail notification directly from a route closure or controller. When a `MailMessage` is returned, it will be rendered and displayed in the browser, allowing you to quickly preview its design without needing to send it to an actual email address: -->
메일 알림 템플릿을 디자인할 때는 일반적인 Blade 템플릿처럼 렌더링된 메일 메시지를 브라우저에서 빠르게 미리 볼 수 있으면 편리합니다. 이를 위해 Laravel은 메일 알림이 생성한 어떤 메일 메시지든 라우트 클로저나 컨트롤러에서 직접 반환할 수 있도록 지원합니다. `MailMessage`가 반환되면 브라우저에서 렌더링되어 표시되므로, 실제 이메일 주소로 전송하지 않고도 디자인을 빠르게 미리 볼 수 있습니다.

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
<!-- ## Markdown Mail Notifications -->
## Markdown Mail Notifications

<!-- Markdown mail notifications allow you to take advantage of the pre-built templates of mail notifications, while giving you more freedom to write longer, customized messages. Since the messages are written in Markdown, Laravel is able to render beautiful, responsive HTML templates for the messages while also automatically generating a plain-text counterpart. -->
Markdown 메일 알림을 사용하면 미리 만들어진 메일 알림 템플릿을 활용하면서도, 더 길고 사용자 정의된 메시지를 자유롭게 작성할 수 있습니다. 메시지는 Markdown으로 작성되므로 Laravel은 보기 좋고 반응형인 HTML 템플릿을 렌더링할 수 있으며, 동시에 일반 텍스트 버전도 자동으로 생성합니다.

<a name="generating-the-message"></a>
<!-- ### Generating the Message -->
### Generating the Message

<!-- To generate a notification with a corresponding Markdown template, you may use the `--markdown` option of the `make:notification` Artisan command: -->
해당 Markdown 템플릿을 사용하는 알림을 생성하려면 `make:notification` Artisan 명령어의 `--markdown` 옵션을 사용할 수 있습니다.

```shell
php artisan make:notification InvoicePaid --markdown=mail.invoice.paid
```

<!-- Like all other mail notifications, notifications that use Markdown templates should define a `toMail` method on their notification class. However, instead of using the `line` and `action` methods to construct the notification, use the `markdown` method to specify the name of the Markdown template that should be used. An array of data you wish to make available to the template may be passed as the method's second argument: -->
다른 모든 메일 알림과 마찬가지로, Markdown 템플릿을 사용하는 알림도 알림 클래스에 `toMail` 메서드를 정의해야 합니다. 다만 알림을 구성할 때 `line`과 `action` 메서드를 사용하는 대신, 사용할 Markdown 템플릿의 이름을 지정하기 위해 `markdown` 메서드를 사용합니다. 템플릿에서 사용할 수 있게 만들 데이터 배열은 이 메서드의 두 번째 인수로 전달할 수 있습니다.

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
<!-- ### Writing the Message -->
### Writing the Message

<!-- Markdown mail notifications use a combination of Blade components and Markdown syntax which allow you to easily construct notifications while leveraging Laravel's pre-crafted notification components: -->
Markdown 메일 알림은 Blade 컴포넌트와 Markdown 문법을 함께 사용합니다. 이를 통해 Laravel이 미리 제공하는 알림 컴포넌트를 활용하면서 알림을 쉽게 구성할 수 있습니다.

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
> Markdown 이메일을 작성할 때 과도한 들여쓰기를 사용하지 마십시오. Markdown 표준에 따라 Markdown 파서는 들여쓰기된 내용을 코드 블록으로 렌더링합니다.

<a name="button-component"></a>
<!-- #### Button Component -->
#### Button Component

<!-- The button component renders a centered button link. The component accepts two arguments, a `url` and an optional `color`. Supported colors are `primary`, `green`, and `red`. You may add as many button components to a notification as you wish: -->
버튼 컴포넌트는 가운데 정렬된 버튼 링크를 렌더링합니다. 이 컴포넌트는 `url`과 선택 사항인 `color` 두 가지 인수를 받습니다. 지원되는 색상은 `primary`, `green`, `red`입니다. 알림에는 원하는 만큼 버튼 컴포넌트를 추가할 수 있습니다.

```blade
<x-mail::button :url="$url" color="green">
View Invoice
</x-mail::button>
```

<a name="panel-component"></a>
<!-- #### Panel Component -->
#### Panel Component

<!-- The panel component renders the given block of text in a panel that has a slightly different background color than the rest of the notification. This allows you to draw attention to a given block of text: -->
패널 컴포넌트는 주어진 텍스트 블록을 알림의 나머지 부분과 약간 다른 배경색을 가진 패널 안에 렌더링합니다. 이를 통해 특정 텍스트 블록에 독자의 주의를 끌 수 있습니다.

```blade
<x-mail::panel>
This is the panel content.
</x-mail::panel>
```

<a name="table-component"></a>
<!-- #### Table Component -->
#### Table Component

<!-- The table component allows you to transform a Markdown table into an HTML table. The component accepts the Markdown table as its content. Table column alignment is supported using the default Markdown table alignment syntax: -->
테이블 컴포넌트를 사용하면 Markdown 테이블을 HTML 테이블로 변환할 수 있습니다. 이 컴포넌트는 Markdown 테이블을 콘텐츠로 받습니다. 테이블 컬럼 정렬은 기본 Markdown 테이블 정렬 문법을 사용하여 지원됩니다.

```blade
<x-mail::table>
| Laravel       | Table         | Example       |
| ------------- | :-----------: | ------------: |
| Col 2 is      | Centered      | $10           |
| Col 3 is      | Right-Aligned | $20           |
</x-mail::table>
```

<a name="customizing-the-components"></a>
<!-- ### Customizing the Components -->
### Customizing the Components

<!-- You may export all of the Markdown notification components to your own application for customization. To export the components, use the `vendor:publish` Artisan command to publish the `laravel-mail` asset tag: -->
모든 Markdown 알림 컴포넌트를 애플리케이션으로 내보내 사용자 정의할 수 있습니다. 컴포넌트를 내보내려면 `vendor:publish` Artisan 명령어를 사용하여 `laravel-mail` 에셋 태그를 게시합니다.

```shell
php artisan vendor:publish --tag=laravel-mail
```

<!-- This command will publish the Markdown mail components to the `resources/views/vendor/mail` directory. The `mail` directory will contain an `html` and a `text` directory, each containing their respective representations of every available component. You are free to customize these components however you like. -->
이 명령어는 Markdown 메일 컴포넌트를 `resources/views/vendor/mail` 디렉터리에 게시합니다. `mail` 디렉터리에는 `html` 디렉터리와 `text` 디렉터리가 포함되며, 각 디렉터리에는 사용 가능한 모든 컴포넌트의 해당 표현이 들어 있습니다. 이 컴포넌트들은 원하는 방식으로 자유롭게 사용자 정의할 수 있습니다.

<a name="customizing-the-css"></a>
<!-- #### Customizing the CSS -->
#### Customizing the CSS

<!-- After exporting the components, the `resources/views/vendor/mail/html/themes` directory will contain a `default.css` file. You may customize the CSS in this file and your styles will automatically be in-lined within the HTML representations of your Markdown notifications. -->
컴포넌트를 내보낸 후에는 `resources/views/vendor/mail/html/themes` 디렉터리에 `default.css` 파일이 포함됩니다. 이 파일의 CSS를 사용자 정의할 수 있으며, 작성한 스타일은 Markdown 알림의 HTML 표현 안에 자동으로 인라인 처리됩니다.

<!-- If you would like to build an entirely new theme for Laravel's Markdown components, you may place a CSS file within the `html/themes` directory. After naming and saving your CSS file, update the `theme` option of the `mail` configuration file to match the name of your new theme. -->
Laravel의 Markdown 컴포넌트를 위한 완전히 새로운 테마를 만들고 싶다면 `html/themes` 디렉터리 안에 CSS 파일을 배치하면 됩니다. CSS 파일의 이름을 정하고 저장한 뒤, `mail` 설정 파일의 `theme` 옵션을 새 테마 이름과 일치하도록 업데이트합니다.

<!-- To customize the theme for an individual notification, you may call the `theme` method while building the notification's mail message. The `theme` method accepts the name of the theme that should be used when sending the notification: -->
개별 알림의 테마를 사용자 정의하려면 알림의 메일 메시지를 구성하는 동안 `theme` 메서드를 호출할 수 있습니다. `theme` 메서드는 알림을 보낼 때 사용할 테마의 이름을 받습니다.

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
<!-- ## Database Notifications -->
## Database Notifications

<a name="database-prerequisites"></a>
<!-- ### Prerequisites -->
### Prerequisites

<!-- The `database` notification channel stores the notification information in a database table. This table will contain information such as the notification type as well as a JSON data structure that describes the notification. -->
`database` 알림 채널은 알림 정보를 데이터베이스 테이블에 저장합니다. 이 테이블에는 알림 유형과 알림을 설명하는 JSON 데이터 구조 같은 정보가 포함됩니다.

<!-- You can query the table to display the notifications in your application's user interface. But, before you can do that, you will need to create a database table to hold your notifications. You may use the `make:notifications-table` command to generate a [migration](/docs/13.x/migrations) with the proper table schema: -->
이 테이블을 조회하여 애플리케이션의 사용자 인터페이스에 알림을 표시할 수 있습니다. 하지만 그렇게 하기 전에 알림을 저장할 데이터베이스 테이블을 만들어야 합니다. 적절한 테이블 스키마를 가진 [migration](/docs/13.x/migrations)을 생성하려면 `make:notifications-table` 명령어를 사용할 수 있습니다.

```shell
php artisan make:notifications-table

php artisan migrate
```

> [!NOTE]
> 알림을 받을 수 있는 모델이 [UUID or ULID primary keys](/docs/13.x/eloquent#uuid-and-ulid-keys)를 사용한다면, 알림 테이블 마이그레이션에서 `morphs` 메서드를 [uuidMorphs](/docs/13.x/migrations#column-method-uuidMorphs) 또는 [ulidMorphs](/docs/13.x/migrations#column-method-ulidMorphs)로 바꿔야 합니다.

<a name="formatting-database-notifications"></a>
<!-- ### Formatting Database Notifications -->
### Formatting Database Notifications

<!-- If a notification supports being stored in a database table, you should define a `toDatabase` or `toArray` method on the notification class. This method will receive a `$notifiable` entity and should return a plain PHP array. The returned array will be encoded as JSON and stored in the `data` column of your `notifications` table. Let's take a look at an example `toArray` method: -->
알림이 데이터베이스 테이블에 저장되는 기능을 지원한다면, 알림 클래스에 `toDatabase` 또는 `toArray` 메서드를 정의해야 합니다. 이 메서드는 `$notifiable` 엔티티를 전달받고 일반 PHP 배열을 반환해야 합니다. 반환된 배열은 JSON으로 인코딩되어 `notifications` 테이블의 `data` 컬럼에 저장됩니다. 다음은 `toArray` 메서드 예시입니다.

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

<!-- When a notification is stored in your application's database, the `type` column will be set to the notification's class name by default, and the `read_at` column will be `null`. However, you can customize this behavior by defining the `databaseType` and `initialDatabaseReadAtValue` methods in your notification class: -->
알림이 애플리케이션의 데이터베이스에 저장되면, 기본적으로 `type` 컬럼은 알림의 클래스 이름으로 설정되고 `read_at` 컬럼은 `null`이 됩니다. 하지만 알림 클래스에 `databaseType` 및 `initialDatabaseReadAtValue` 메서드를 정의하여 이 동작을 사용자 정의할 수 있습니다.

```php
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
<!-- #### `toDatabase` vs. `toArray` -->
#### `toDatabase` vs. `toArray`

<!-- The `toArray` method is also used by the `broadcast` channel to determine which data to broadcast to your JavaScript powered frontend. If you would like to have two different array representations for the `database` and `broadcast` channels, you should define a `toDatabase` method instead of a `toArray` method. -->
`toArray` 메서드는 `broadcast` 채널에서도 JavaScript 기반 프런트엔드로 브로드캐스트할 데이터를 결정하는 데 사용됩니다. `database` 채널과 `broadcast` 채널에 서로 다른 배열 표현을 사용하고 싶다면, `toArray` 메서드 대신 `toDatabase` 메서드를 정의해야 합니다.

<a name="accessing-the-notifications"></a>
<!-- ### Accessing the Notifications -->
### Accessing the Notifications

<!-- Once notifications are stored in the database, you need a convenient way to access them from your notifiable entities. The `Illuminate\Notifications\Notifiable` trait, which is included on Laravel's default `App\Models\User` model, includes a `notifications` [Eloquent relationship](/docs/13.x/eloquent-relationships) that returns the notifications for the entity. To fetch notifications, you may access this method like any other Eloquent relationship. By default, notifications will be sorted by the `created_at` timestamp with the most recent notifications at the beginning of the collection: -->
알림이 데이터베이스에 저장되면, 알림을 받을 수 있는 엔티티에서 해당 알림에 편리하게 접근할 방법이 필요합니다. Laravel의 기본 `App\Models\User` 모델에 포함되어 있는 `Illuminate\Notifications\Notifiable` 트레이트는 해당 엔티티의 알림을 반환하는 `notifications` [Eloquent relationship](/docs/13.x/eloquent-relationships)를 포함합니다. 알림을 가져오려면 다른 Eloquent 연관관계와 마찬가지로 이 메서드에 접근하면 됩니다. 기본적으로 알림은 `created_at` 타임스탬프를 기준으로 정렬되며, 가장 최근 알림이 컬렉션의 앞쪽에 배치됩니다.

```php
$user = App\Models\User::find(1);

foreach ($user->notifications as $notification) {
    echo $notification->type;
}
```

<!-- If you want to retrieve only the "unread" notifications, you may use the `unreadNotifications` relationship. Again, these notifications will be sorted by the `created_at` timestamp with the most recent notifications at the beginning of the collection: -->
"읽지 않은" 알림만 가져오고 싶다면 `unreadNotifications` 연관관계를 사용할 수 있습니다. 이 경우에도 알림은 `created_at` 타임스탬프를 기준으로 정렬되며, 가장 최근 알림이 컬렉션의 앞쪽에 배치됩니다.

```php
$user = App\Models\User::find(1);

foreach ($user->unreadNotifications as $notification) {
    echo $notification->type;
}
```

<!-- If you want to retrieve only the "read" notifications, you may use the `readNotifications` relationship: -->
"읽은" 알림만 가져오고 싶다면 `readNotifications` 연관관계를 사용할 수 있습니다.

```php
$user = App\Models\User::find(1);

foreach ($user->readNotifications as $notification) {
    echo $notification->type;
}
```

> [!NOTE]
> JavaScript 클라이언트에서 알림에 접근하려면, 현재 사용자와 같은 알림 수신 가능 엔티티의 알림을 반환하는 알림 컨트롤러를 애플리케이션에 정의해야 합니다. 그런 다음 JavaScript 클라이언트에서 해당 컨트롤러의 URL로 HTTP 요청을 보낼 수 있습니다.

<a name="marking-notifications-as-read"></a>
<!-- ### Marking Notifications as Read -->
### Marking Notifications as Read

<!-- Typically, you will want to mark a notification as "read" when a user views it. The `Illuminate\Notifications\Notifiable` trait provides a `markAsRead` method, which updates the `read_at` column on the notification's database record: -->
일반적으로 사용자가 알림을 확인하면 해당 알림을 "읽음"으로 표시하고 싶을 것입니다. `Illuminate\Notifications\Notifiable` 트레이트는 알림의 데이터베이스 레코드에서 `read_at` 컬럼을 업데이트하는 `markAsRead` 메서드를 제공합니다.

```php
$user = App\Models\User::find(1);

foreach ($user->unreadNotifications as $notification) {
    $notification->markAsRead();
}
```

<!-- However, instead of looping through each notification, you may use the `markAsRead` method directly on a collection of notifications: -->
하지만 각 알림을 반복 처리하는 대신, 알림 컬렉션에 직접 `markAsRead` 메서드를 사용할 수도 있습니다.

```php
$user->unreadNotifications->markAsRead();
```

<!-- You may also use a mass-update query to mark all of the notifications as read without retrieving them from the database: -->
데이터베이스에서 알림을 가져오지 않고 모든 알림을 읽음으로 표시하려면 대량 업데이트 쿼리를 사용할 수도 있습니다.

```php
$user = App\Models\User::find(1);

$user->unreadNotifications()->update(['read_at' => now()]);
```

<!-- You may `delete` the notifications to remove them from the table entirely: -->
알림을 테이블에서 완전히 제거하려면 `delete`를 사용할 수 있습니다.

```php
$user->notifications()->delete();
```

<a name="broadcast-notifications"></a>
<!-- ## Broadcast Notifications -->
## Broadcast Notifications

<a name="broadcast-prerequisites"></a>
<!-- ### Prerequisites -->
### Prerequisites

<!-- Before broadcasting notifications, you should configure and be familiar with Laravel's [event broadcasting](/docs/13.x/broadcasting) services. Event broadcasting provides a way to react to server-side Laravel events from your JavaScript powered frontend. -->
알림을 브로드캐스트하기 전에 Laravel의 [event broadcasting](/docs/13.x/broadcasting) 서비스를 설정하고 익숙해져야 합니다. 이벤트 브로드캐스팅은 JavaScript 기반 프런트엔드에서 서버 측 Laravel 이벤트에 반응할 수 있는 방법을 제공합니다.

<a name="formatting-broadcast-notifications"></a>
<!-- ### Formatting Broadcast Notifications -->
### Formatting Broadcast Notifications

<!-- The `broadcast` channel broadcasts notifications using Laravel's [event broadcasting](/docs/13.x/broadcasting) services, allowing your JavaScript powered frontend to catch notifications in realtime. If a notification supports broadcasting, you can define a `toBroadcast` method on the notification class. This method will receive a `$notifiable` entity and should return a `BroadcastMessage` instance. If the `toBroadcast` method does not exist, the `toArray` method will be used to gather the data that should be broadcast. The returned data will be encoded as JSON and broadcast to your JavaScript powered frontend. Let's take a look at an example `toBroadcast` method: -->
`broadcast` 채널은 Laravel의 [event broadcasting](/docs/13.x/broadcasting) 서비스를 사용하여 알림을 브로드캐스트합니다. 이를 통해 JavaScript 기반 프런트엔드가 알림을 실시간으로 받을 수 있습니다. 알림이 브로드캐스트를 지원한다면, 알림 클래스에 `toBroadcast` 메서드를 정의할 수 있습니다. 이 메서드는 `$notifiable` 엔티티를 전달받고 `BroadcastMessage` 인스턴스를 반환해야 합니다. `toBroadcast` 메서드가 없으면, 브로드캐스트할 데이터를 수집하기 위해 `toArray` 메서드가 사용됩니다. 반환된 데이터는 JSON으로 인코딩되어 JavaScript 기반 프런트엔드로 브로드캐스트됩니다. 다음은 `toBroadcast` 메서드 예시입니다.

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
<!-- #### Broadcast Queue Configuration -->
#### Broadcast Queue Configuration

<!-- All broadcast notifications are queued for broadcasting. If you would like to configure the queue connection or queue name that is used to queue the broadcast operation, you may use the `onConnection` and `onQueue` methods of the `BroadcastMessage`: -->
모든 브로드캐스트 알림은 브로드캐스트를 위해 큐에 등록됩니다. 브로드캐스트 작업을 큐에 등록할 때 사용할 큐 연결이나 큐 이름을 설정하고 싶다면 `BroadcastMessage`의 `onConnection` 및 `onQueue` 메서드를 사용할 수 있습니다.

```php
return (new BroadcastMessage($data))
    ->onConnection('sqs')
    ->onQueue('broadcasts');
```

<a name="customizing-the-notification-type"></a>
<!-- #### Customizing the Notification Type -->
#### Customizing the Notification Type

<!-- In addition to the data you specify, all broadcast notifications also have a `type` field containing the full class name of the notification. If you would like to customize the notification `type`, you may define a `broadcastType` method on the notification class: -->
지정한 데이터 외에도 모든 브로드캐스트 알림에는 알림의 전체 클래스 이름이 들어 있는 `type` 필드가 포함됩니다. 알림의 `type`을 사용자 정의하고 싶다면 알림 클래스에 `broadcastType` 메서드를 정의할 수 있습니다.

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
<!-- ### Listening for Notifications -->
### Listening for Notifications

<!-- Notifications will broadcast on a private channel formatted using a `{notifiable}.{id}` convention. So, if you are sending a notification to an `App\Models\User` instance with an ID of `1`, the notification will be broadcast on the `App.Models.User.1` private channel. When using [Laravel Echo](/docs/13.x/broadcasting#client-side-installation), you may easily listen for notifications on a channel using the `notification` method: -->
알림은 `{notifiable}.{id}` 규칙을 사용해 구성된 private 채널에서 브로드캐스트됩니다. 따라서 ID가 `1`인 `App\Models\User` 인스턴스에 알림을 보내는 경우, 알림은 `App.Models.User.1` private 채널에서 브로드캐스트됩니다. [Laravel Echo](/docs/13.x/broadcasting#client-side-installation)를 사용할 때는 `notification` 메서드를 사용하여 채널의 알림을 쉽게 수신할 수 있습니다.

```js
Echo.private('App.Models.User.' + userId)
    .notification((notification) => {
        console.log(notification.type);
    });
```

<a name="using-react-or-vue"></a>
<!-- #### Using React, Vue, or Svelte -->
#### Using React, Vue, or Svelte

<!-- Laravel Echo includes React, Vue, and Svelte hooks that make it painless to listen for notifications. To get started, invoke the `useEchoNotification` hook, which is used to listen for notifications. The `useEchoNotification` hook will automatically leave channels when the consuming component is unmounted: -->
Laravel Echo에는 알림을 쉽게 수신할 수 있도록 React, Vue, Svelte 훅이 포함되어 있습니다. 시작하려면 알림을 수신하는 데 사용되는 `useEchoNotification` 훅을 호출합니다. `useEchoNotification` 훅은 사용하는 컴포넌트가 언마운트될 때 자동으로 채널을 나갑니다.

```js tab=React
import { useEchoNotification } from "@laravel/echo-react";

useEchoNotification(
    `App.Models.User.${userId}`,
    (notification) => {
        console.log(notification.type);
    },
);
```

```vue tab=Vue
<script setup lang="ts">
import { useEchoNotification } from "@laravel/echo-vue";

useEchoNotification(
    `App.Models.User.${userId}`,
    (notification) => {
        console.log(notification.type);
    },
);
</script>
```
```svelte tab=Svelte
<script>
import { useEchoNotification } from "@laravel/echo-svelte";

useEchoNotification(
    `App.Models.User.${userId}`,
    (notification) => {
        console.log(notification.type);
    },
);
</script>
```

<!-- By default, the hook listens to all notifications. To specify the notification types you would like to listen to, you can provide either a string or array of types to `useEchoNotification`: -->
기본적으로 이 훅은 모든 알림을 수신합니다. 수신하려는 알림 타입을 지정하려면 `useEchoNotification`에 타입 문자열 또는 타입 배열을 전달할 수 있습니다.

```js tab=React
import { useEchoNotification } from "@laravel/echo-react";

useEchoNotification(
    `App.Models.User.${userId}`,
    (notification) => {
        console.log(notification.type);
    },
    'App.Notifications.InvoicePaid',
);
```

```vue tab=Vue
<script setup lang="ts">
import { useEchoNotification } from "@laravel/echo-vue";

useEchoNotification(
    `App.Models.User.${userId}`,
    (notification) => {
        console.log(notification.type);
    },
    'App.Notifications.InvoicePaid',
);
</script>
```

```svelte tab=Svelte
<script>
import { useEchoNotification } from "@laravel/echo-svelte";

useEchoNotification(
    `App.Models.User.${userId}`,
    (notification) => {
        console.log(notification.type);
    },
    'App.Notifications.InvoicePaid',
);
</script>
```

<!-- You may also specify the shape of the notification payload data, providing greater type safety and editing convenience: -->
알림 페이로드 데이터의 구조를 지정하여 더 높은 타입 안정성과 편집 편의성을 얻을 수도 있습니다.

```ts
type InvoicePaidNotification = {
    invoice_id: number;
    created_at: string;
};

useEchoNotification<InvoicePaidNotification>(
    `App.Models.User.${userId}`,
    (notification) => {
        console.log(notification.invoice_id);
        console.log(notification.created_at);
        console.log(notification.type);
    },
    'App.Notifications.InvoicePaid',
);
```

<a name="customizing-the-notification-channel"></a>
<!-- #### Customizing the Notification Channel -->
#### Customizing the Notification Channel

<!-- If you would like to customize which channel that an entity's broadcast notifications are broadcast on, you may define a `receivesBroadcastNotificationsOn` method on the notifiable entity: -->
엔티티의 브로드캐스트 알림이 어느 채널로 브로드캐스트될지 커스터마이징하려면, 알림을 받을 수 있는 엔티티에 `receivesBroadcastNotificationsOn` 메서드를 정의하면 됩니다.

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
<!-- ## SMS Notifications -->
## SMS Notifications

<a name="sms-prerequisites"></a>
<!-- ### Prerequisites -->
### Prerequisites

<!-- Sending SMS notifications in Laravel is powered by [Vonage](https://www.vonage.com/) (formerly known as Nexmo). Before you can send notifications via Vonage, you need to install the `laravel/vonage-notification-channel` and `guzzlehttp/guzzle` packages: -->
Laravel에서 SMS 알림 전송은 [Vonage](https://www.vonage.com/)(이전 명칭 Nexmo)를 통해 제공됩니다. Vonage로 알림을 보내기 전에 `laravel/vonage-notification-channel` 및 `guzzlehttp/guzzle` 패키지를 설치해야 합니다.

```shell
composer require laravel/vonage-notification-channel guzzlehttp/guzzle
```

<!-- The package includes a [configuration file](https://github.com/laravel/vonage-notification-channel/blob/3.x/config/vonage.php). However, you are not required to export this configuration file to your own application. You can simply use the `VONAGE_KEY` and `VONAGE_SECRET` environment variables to define your Vonage public and secret keys. -->
이 패키지에는 [configuration file](https://github.com/laravel/vonage-notification-channel/blob/3.x/config/vonage.php)이 포함되어 있습니다. 하지만 이 설정 파일을 애플리케이션으로 반드시 내보낼 필요는 없습니다. `VONAGE_KEY` 및 `VONAGE_SECRET` 환경 변수를 사용해 Vonage 공개 키와 비밀 키를 정의하면 됩니다.

<!-- After defining your keys, you should set a `VONAGE_SMS_FROM` environment variable that defines the phone number that your SMS messages should be sent from by default. You may generate this phone number within the Vonage control panel: -->
키를 정의한 후에는 SMS 메시지가 기본적으로 어떤 전화번호에서 발신될지 지정하는 `VONAGE_SMS_FROM` 환경 변수를 설정해야 합니다. 이 전화번호는 Vonage 제어판에서 생성할 수 있습니다.

```ini
VONAGE_SMS_FROM=15556666666
```

<a name="formatting-sms-notifications"></a>
<!-- ### Formatting SMS Notifications -->
### Formatting SMS Notifications

<!-- If a notification supports being sent as an SMS, you should define a `toVonage` method on the notification class. This method will receive a `$notifiable` entity and should return an `Illuminate\Notifications\Messages\VonageMessage` instance: -->
알림이 SMS로 전송되는 것을 지원한다면, 알림 클래스에 `toVonage` 메서드를 정의해야 합니다. 이 메서드는 `$notifiable` 엔티티를 전달받고 `Illuminate\Notifications\Messages\VonageMessage` 인스턴스를 반환해야 합니다.

```php
use Illuminate\Notifications\Messages\VonageMessage;

/**
 * Get the Vonage / SMS representation of the notification.
 */
public function toVonage(object $notifiable): VonageMessage
{
    return (new VonageMessage)
        ->content('Your SMS message content');
}
```

<a name="unicode-content"></a>
<!-- #### Unicode Content -->
#### Unicode Content

<!-- If your SMS message will contain unicode characters, you should call the `unicode` method when constructing the `VonageMessage` instance: -->
SMS 메시지에 unicode 문자가 포함된다면, `VonageMessage` 인스턴스를 만들 때 `unicode` 메서드를 호출해야 합니다.

```php
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
<!-- ### Customizing the "From" Number -->
### Customizing the "From" Number

<!-- If you would like to send some notifications from a phone number that is different from the phone number specified by your `VONAGE_SMS_FROM` environment variable, you may call the `from` method on a `VonageMessage` instance: -->
`VONAGE_SMS_FROM` 환경 변수에 지정된 전화번호와 다른 전화번호에서 일부 알림을 보내고 싶다면, `VonageMessage` 인스턴스에서 `from` 메서드를 호출할 수 있습니다.

```php
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
<!-- ### Adding a Client Reference -->
### Adding a Client Reference

<!-- If you would like to keep track of costs per user, team, or client, you may add a "client reference" to the notification. Vonage will allow you to generate reports using this client reference so that you can better understand a particular customer's SMS usage. The client reference can be any string up to 40 characters: -->
사용자, 팀, 클라이언트별 비용을 추적하고 싶다면 알림에 "클라이언트 참조"를 추가할 수 있습니다. Vonage는 이 클라이언트 참조를 사용해 보고서를 생성할 수 있도록 해 주므로, 특정 고객의 SMS 사용량을 더 잘 파악할 수 있습니다. 클라이언트 참조는 최대 40자까지의 임의의 문자열일 수 있습니다.

```php
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
<!-- ### Routing SMS Notifications -->
### Routing SMS Notifications

<!-- To route Vonage notifications to the proper phone number, define a `routeNotificationForVonage` method on your notifiable entity: -->
Vonage 알림을 올바른 전화번호로 라우팅하려면, 알림을 받을 수 있는 엔티티에 `routeNotificationForVonage` 메서드를 정의하세요.

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
     * Route notifications for the Vonage channel.
     */
    public function routeNotificationForVonage(Notification $notification): string
    {
        return $this->phone_number;
    }
}
```

<a name="slack-notifications"></a>
<!-- ## Slack Notifications -->
## Slack Notifications

<a name="slack-prerequisites"></a>
<!-- ### Prerequisites -->
### Prerequisites

<!-- Before sending Slack notifications, you should install the Slack notification channel via Composer: -->
Slack 알림을 보내기 전에 Composer를 통해 Slack 알림 채널을 설치해야 합니다.

```shell
composer require laravel/slack-notification-channel
```

<!-- Additionally, you must create a [Slack App](https://api.slack.com/apps?new_app=1) for your Slack workspace. -->
또한 Slack 워크스페이스용 [Slack App](https://api.slack.com/apps?new_app=1)을 만들어야 합니다.

<!-- If you only need to send notifications to the same Slack workspace that the App is created in, you should ensure that your App has the `chat:write`, `chat:write.public`, and `chat:write.customize` scopes. These scopes can be added from the "OAuth & Permissions" App management tab within Slack. -->
App이 생성된 동일한 Slack 워크스페이스로만 알림을 보내면 된다면, App에 `chat:write`, `chat:write.public`, `chat:write.customize` 스코프가 있는지 확인해야 합니다. 이 스코프들은 Slack의 "OAuth & Permissions" App 관리 탭에서 추가할 수 있습니다.

<!-- Next, copy the App's "Bot User OAuth Token" and place it within a `slack` configuration array in your application's `services.php` configuration file. This token can be found on the "OAuth & Permissions" tab within Slack: -->
다음으로 App의 "Bot User OAuth Token"을 복사하여 애플리케이션의 `services.php` 설정 파일에 있는 `slack` 설정 배열 안에 넣습니다. 이 토큰은 Slack의 "OAuth & Permissions" 탭에서 찾을 수 있습니다.

```php
'slack' => [
    'notifications' => [
        'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
        'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
    ],
],
```

<a name="slack-app-distribution"></a>
<!-- #### App Distribution -->
#### App Distribution

<!-- If your application will be sending notifications to external Slack workspaces that are owned by your application's users, you will need to "distribute" your App via Slack. App distribution can be managed from your App's "Manage Distribution" tab within Slack. Once your App has been distributed, you may use [Socialite](/docs/13.x/socialite) to [obtain Slack Bot tokens](/docs/13.x/socialite#slack-bot-scopes) on behalf of your application's users. -->
애플리케이션 사용자가 소유한 외부 Slack 워크스페이스로 알림을 보내야 한다면, Slack을 통해 App을 "배포"해야 합니다. App 배포는 Slack의 "Manage Distribution" 탭에서 관리할 수 있습니다. App이 배포된 후에는 [Socialite](/docs/13.x/socialite)를 사용하여 애플리케이션 사용자를 대신해 [obtain Slack Bot tokens](/docs/13.x/socialite#slack-bot-scopes).

<a name="formatting-slack-notifications"></a>
<!-- ### Formatting Slack Notifications -->
### Formatting Slack Notifications

<!-- If a notification supports being sent as a Slack message, you should define a `toSlack` method on the notification class. This method will receive a `$notifiable` entity and should return an `Illuminate\Notifications\Slack\SlackMessage` instance. You can construct rich notifications using [Slack's Block Kit API](https://api.slack.com/block-kit). The following example may be previewed in [Slack's Block Kit builder](https://app.slack.com/block-kit-builder/T01KWS6K23Z#%7B%22blocks%22:%5B%7B%22type%22:%22header%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22Invoice%20Paid%22%7D%7D,%7B%22type%22:%22context%22,%22elements%22:%5B%7B%22type%22:%22plain_text%22,%22text%22:%22Customer%20%231234%22%7D%5D%7D,%7B%22type%22:%22section%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22An%20invoice%20has%20been%20paid.%22%7D,%22fields%22:%5B%7B%22type%22:%22mrkdwn%22,%22text%22:%22*Invoice%20No:*%5Cn1000%22%7D,%7B%22type%22:%22mrkdwn%22,%22text%22:%22*Invoice%20Recipient:*%5Cntaylor@laravel.com%22%7D%5D%7D,%7B%22type%22:%22divider%22%7D,%7B%22type%22:%22section%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22Congratulations!%22%7D%7D%5D%7D): -->
알림이 Slack 메시지로 전송되는 것을 지원한다면, 알림 클래스에 `toSlack` 메서드를 정의해야 합니다. 이 메서드는 `$notifiable` 엔티티를 전달받고 `Illuminate\Notifications\Slack\SlackMessage` 인스턴스를 반환해야 합니다. [Slack's Block Kit API](https://api.slack.com/block-kit)를 사용하여 풍부한 알림을 구성할 수 있습니다. 다음 예시는 [Slack's Block Kit builder](https://app.slack.com/block-kit-builder/T01KWS6K23Z#%7B%22blocks%22:%5B%7B%22type%22:%22header%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22Invoice%20Paid%22%7D%7D,%7B%22type%22:%22context%22,%22elements%22:%5B%7B%22type%22:%22plain_text%22,%22text%22:%22Customer%20%231234%22%7D%5D%7D,%7B%22type%22:%22section%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22An%20invoice%20has%20been%20paid.%22%7D,%22fields%22:%5B%7B%22type%22:%22mrkdwn%22,%22text%22:%22*Invoice%20No:*%5Cn1000%22%7D,%7B%22type%22:%22mrkdwn%22,%22text%22:%22*Invoice%20Recipient:*%5Cntaylor@laravel.com%22%7D%5D%7D,%7B%22type%22:%22divider%22%7D,%7B%22type%22:%22section%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22Congratulations!%22%7D%7D%5D%7D)에서 미리 볼 수 있습니다.

```php
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
<!-- #### Using Slack's Block Kit Builder Template -->
#### Using Slack's Block Kit Builder Template

<!-- Instead of using the fluent message builder methods to construct your Block Kit message, you may provide the raw JSON payload generated by Slack's Block Kit Builder to the `usingBlockKitTemplate` method: -->
플루언트 메시지 빌더 메서드를 사용해 Block Kit 메시지를 구성하는 대신, Slack의 Block Kit Builder가 생성한 원시 JSON 페이로드를 `usingBlockKitTemplate` 메서드에 전달할 수 있습니다.

```php
use Illuminate\Notifications\Slack\SlackMessage;
use Illuminate\Support\Str;

/**
 * Get the Slack representation of the notification.
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
<!-- ### Slack Interactivity -->
### Slack Interactivity

<!-- Slack's Block Kit notification system provides powerful features to [handle user interaction](https://api.slack.com/interactivity/handling). To utilize these features, your Slack App should have "Interactivity" enabled and a "Request URL" configured that points to a URL served by your application. These settings can be managed from the "Interactivity & Shortcuts" App management tab within Slack. -->
Slack의 Block Kit 알림 시스템은 [handle user interaction](https://api.slack.com/interactivity/handling)할 수 있는 강력한 기능을 제공합니다. 이 기능을 사용하려면 Slack App에서 "Interactivity"를 활성화하고, 애플리케이션이 제공하는 URL을 가리키는 "Request URL"을 설정해야 합니다. 이러한 설정은 Slack의 "Interactivity & Shortcuts" App 관리 탭에서 관리할 수 있습니다.

<!-- In the following example, which utilizes the `actionsBlock` method, Slack will send a `POST` request to your "Request URL" with a payload containing the Slack user who clicked the button, the ID of the clicked button, and more. Your application can then determine the action to take based on the payload. You should also [verify the request](https://api.slack.com/authentication/verifying-requests-from-slack) was made by Slack: -->
다음 예시는 `actionsBlock` 메서드를 사용합니다. Slack은 버튼을 클릭한 Slack 사용자, 클릭된 버튼의 ID 등을 포함한 페이로드와 함께 "Request URL"로 `POST` 요청을 보냅니다. 그러면 애플리케이션은 페이로드를 바탕으로 수행할 작업을 결정할 수 있습니다. 또한 해당 요청이 Slack에서 온 것인지 [verify the request](https://api.slack.com/authentication/verifying-requests-from-slack)해야 합니다.

```php
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
             // ID defaults to "button_acknowledge_invoice"...
            $block->button('Acknowledge Invoice')->primary();

            // Manually configure the ID...
            $block->button('Deny')->danger()->id('deny_invoice');
        });
}
```

<a name="slack-confirmation-modals"></a>
<!-- #### Confirmation Modals -->
#### Confirmation Modals

<!-- If you would like users to be required to confirm an action before it is performed, you may invoke the `confirm` method when defining your button. The `confirm` method accepts a message and a closure which receives a `ConfirmObject` instance: -->
사용자가 작업이 수행되기 전에 반드시 확인하도록 만들고 싶다면, 버튼을 정의할 때 `confirm` 메서드를 호출할 수 있습니다. `confirm` 메서드는 메시지와 `ConfirmObject` 인스턴스를 전달받는 클로저를 인수로 받습니다.

```php
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
<!-- #### Inspecting Slack Blocks -->
#### Inspecting Slack Blocks

<!-- If you would like to quickly inspect the blocks you've been building, you can invoke the `dd` method on the `SlackMessage` instance. The `dd` method will generate and dump a URL to Slack's [Block Kit Builder](https://app.slack.com/block-kit-builder/), which displays a preview of the payload and notification in your browser. You may pass `true` to the `dd` method to dump the raw payload: -->
작성 중인 블록을 빠르게 확인하고 싶다면 `SlackMessage` 인스턴스에서 `dd` 메서드를 호출할 수 있습니다. `dd` 메서드는 Slack의 [Block Kit Builder](https://app.slack.com/block-kit-builder/) URL을 생성하고 덤프합니다. 이 도구는 브라우저에서 페이로드와 알림의 미리보기를 보여줍니다. 원시 페이로드를 덤프하려면 `dd` 메서드에 `true`를 전달할 수 있습니다.

```php
return (new SlackMessage)
    ->text('One of your invoices has been paid!')
    ->headerBlock('Invoice Paid')
    ->dd();
```

<a name="routing-slack-notifications"></a>
<!-- ### Routing Slack Notifications -->
### Routing Slack Notifications

<!-- To direct Slack notifications to the appropriate Slack team and channel, define a `routeNotificationForSlack` method on your notifiable model. This method can return one of three values: -->
Slack 알림을 적절한 Slack 팀과 채널로 보내려면, 알림을 받을 수 있는 모델에 `routeNotificationForSlack` 메서드를 정의하세요. 이 메서드는 다음 세 가지 값 중 하나를 반환할 수 있습니다.

<!-- - `null` - which defers routing to the channel configured in the notification itself. You may use the `to` method when building your `SlackMessage` to configure the channel within the notification. - A string specifying the Slack channel to send the notification to, e.g. `#support-channel`. - A `SlackRoute` instance, which allows you to specify an OAuth token and channel name, e.g. `SlackRoute::make($this->slack_channel, $this->slack_token)`. This method should be used to send notifications to external workspaces. -->
- `null` - 라우팅을 알림 자체에 설정된 채널에 위임합니다. `SlackMessage`를 생성할 때 `to` 메서드를 사용하여 알림 내부의 채널을 설정할 수 있습니다.
- 알림을 보낼 Slack 채널을 지정하는 문자열입니다. 예를 들어 `#support-channel`입니다.
- `SlackRoute` 인스턴스입니다. 이를 사용하면 OAuth 토큰과 채널 이름을 지정할 수 있습니다. 예를 들어 `SlackRoute::make($this->slack_channel, $this->slack_token)`입니다. 이 메서드는 외부 워크스페이스로 알림을 보낼 때 사용해야 합니다.

<!-- For instance, returning `#support-channel` from the `routeNotificationForSlack` method will send the notification to the `#support-channel` channel in the workspace associated with the Bot User OAuth token located in your application's `services.php` configuration file: -->
예를 들어 `routeNotificationForSlack` 메서드에서 `#support-channel`을 반환하면, 애플리케이션의 `services.php` 설정 파일에 있는 Bot User OAuth 토큰과 연결된 워크스페이스의 `#support-channel` 채널로 알림이 전송됩니다.

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
     * Route notifications for the Slack channel.
     */
    public function routeNotificationForSlack(Notification $notification): mixed
    {
        return '#support-channel';
    }
}
```

<a name="notifying-external-slack-workspaces"></a>
<!-- ### Notifying External Slack Workspaces -->
### Notifying External Slack Workspaces

> [!NOTE]
> 외부 Slack 워크스페이스로 알림을 보내기 전에 Slack App이 [distributed](#slack-app-distribution)되어 있어야 합니다.

<!-- Of course, you will often want to send notifications to the Slack workspaces owned by your application's users. To do so, you will first need to obtain a Slack OAuth token for the user. Thankfully, [Laravel Socialite](/docs/13.x/socialite) includes a Slack driver that will allow you to easily authenticate your application's users with Slack and [obtain a bot token](/docs/13.x/socialite#slack-bot-scopes). -->
물론 애플리케이션 사용자가 소유한 Slack 워크스페이스로 알림을 보내고 싶은 경우가 많습니다. 이를 위해서는 먼저 사용자에 대한 Slack OAuth 토큰을 얻어야 합니다. 다행히 [Laravel Socialite](/docs/13.x/socialite)는 Slack 드라이버를 포함하고 있어 애플리케이션 사용자를 Slack으로 쉽게 인증하고 [obtain a bot token](/docs/13.x/socialite#slack-bot-scopes).

<!-- Once you have obtained the bot token and stored it within your application's database, you may utilize the `SlackRoute::make` method to route a notification to the user's workspace. In addition, your application will likely need to offer an opportunity for the user to specify which channel notifications should be sent to: -->
봇 토큰을 얻어 애플리케이션 데이터베이스에 저장했다면, `SlackRoute::make` 메서드를 사용하여 사용자의 워크스페이스로 알림을 라우팅할 수 있습니다. 또한 애플리케이션은 사용자가 알림을 받을 채널을 지정할 수 있는 기능도 제공해야 할 가능성이 높습니다.

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
     * Route notifications for the Slack channel.
     */
    public function routeNotificationForSlack(Notification $notification): mixed
    {
        return SlackRoute::make($this->slack_channel, $this->slack_token);
    }
}
```

<a name="localizing-notifications"></a>
<!-- ## Localizing Notifications -->
## Localizing Notifications

<!-- Laravel allows you to send notifications in a locale other than the HTTP request's current locale, and will even remember this locale if the notification is queued. -->
Laravel은 HTTP 요청의 현재 로케일이 아닌 다른 로케일로 알림을 보낼 수 있도록 지원합니다. 알림이 큐에 들어간 경우에도 이 로케일을 기억합니다.

<!-- To accomplish this, the `Illuminate\Notifications\Notification` class offers a `locale` method to set the desired language. The application will change into this locale when the notification is being evaluated and then revert back to the previous locale when evaluation is complete: -->
이를 위해 `Illuminate\Notifications\Notification` 클래스는 원하는 언어를 설정할 수 있는 `locale` 메서드를 제공합니다. 알림을 평가하는 동안 애플리케이션은 해당 로케일로 전환되고, 평가가 완료되면 이전 로케일로 되돌아갑니다.

```php
$user->notify((new InvoicePaid($invoice))->locale('es'));
```

<!-- Localization of multiple notifiable entries may also be achieved via the `Notification` facade: -->
여러 알림 수신 대상의 현지화도 `Notification` 파사드를 통해 처리할 수 있습니다.

```php
Notification::locale('es')->send(
    $users, new InvoicePaid($invoice)
);
```

<a name="user-preferred-locales"></a>
<!-- #### User Preferred Locales -->
#### User Preferred Locales

<!-- Sometimes, applications store each user's preferred locale. By implementing the `HasLocalePreference` contract on your notifiable model, you may instruct Laravel to use this stored locale when sending a notification: -->
때로는 애플리케이션이 각 사용자의 선호 로케일을 저장합니다. 알림을 받을 수 있는 모델에 `HasLocalePreference` 계약을 구현하면, Laravel이 알림을 보낼 때 이 저장된 로케일을 사용하도록 지시할 수 있습니다.

```php
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

<!-- Once you have implemented the interface, Laravel will automatically use the preferred locale when sending notifications and mailables to the model. Therefore, there is no need to call the `locale` method when using this interface: -->
인터페이스를 구현하고 나면 Laravel은 해당 모델에 알림과 메일러블을 보낼 때 자동으로 선호 로케일을 사용합니다. 따라서 이 인터페이스를 사용할 때는 `locale` 메서드를 호출할 필요가 없습니다.

```php
$user->notify(new InvoicePaid($invoice));
```

<a name="testing"></a>
<!-- ## Testing -->
## Testing

<!-- You may use the `Notification` facade's `fake` method to prevent notifications from being sent. Typically, sending notifications is unrelated to the code you are actually testing. Most likely, it is sufficient to simply assert that Laravel was instructed to send a given notification. -->
`Notification` 파사드의 `fake` 메서드를 사용하면 알림이 실제로 전송되지 않도록 막을 수 있습니다. 일반적으로 알림 전송은 실제로 테스트하려는 코드와 직접적인 관련이 없습니다. 대부분의 경우 Laravel이 특정 알림을 보내도록 지시받았는지만 단언하면 충분합니다.

<!-- After calling the `Notification` facade's `fake` method, you may then assert that notifications were instructed to be sent to users and even inspect the data the notifications received: -->
`Notification` 파사드의 `fake` 메서드를 호출한 후에는 사용자에게 알림을 보내도록 지시되었는지 단언할 수 있으며, 알림이 받은 데이터까지 검사할 수 있습니다.

```php tab=Pest
<?php

use App\Notifications\OrderShipped;
use Illuminate\Support\Facades\Notification;

test('orders can be shipped', function () {
    Notification::fake();

    // Perform order shipping...

    // Assert that no notifications were sent...
    Notification::assertNothingSent();

    // Assert a notification was sent to the given users...
    Notification::assertSentTo(
        [$user], OrderShipped::class
    );

    // Assert a notification was not sent...
    Notification::assertNotSentTo(
        [$user], AnotherNotification::class
    );

    // Assert a notification was sent twice...
    Notification::assertSentTimes(WeeklyReminder::class, 2);

    // Assert that a notification was sent to a user exactly once...
    Notification::assertSentToOnce($user, OrderShipped::class);

    // Assert that a given number of notifications were sent...
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

        // Perform order shipping...

        // Assert that no notifications were sent...
        Notification::assertNothingSent();

        // Assert a notification was sent to the given users...
        Notification::assertSentTo(
            [$user], OrderShipped::class
        );

        // Assert a notification was not sent...
        Notification::assertNotSentTo(
            [$user], AnotherNotification::class
        );

        // Assert a notification was sent twice...
        Notification::assertSentTimes(WeeklyReminder::class, 2);

        // Assert that a notification was sent to a user exactly once...
        Notification::assertSentToOnce($user, OrderShipped::class);

        // Assert that a given number of notifications were sent...
        Notification::assertCount(3);
    }
}
```

<!-- You may pass a closure to the `assertSentTo` or `assertNotSentTo` methods in order to assert that a notification was sent that passes a given "truth test". If at least one notification was sent that passes the given truth test then the assertion will be successful: -->
`assertSentTo` 또는 `assertNotSentTo` 메서드에 클로저를 전달하면, 주어진 "참 검사"를 통과하는 알림이 전송되었는지 단언할 수 있습니다. 주어진 참 검사를 통과하는 알림이 하나라도 전송되었다면 단언은 성공합니다.

```php
Notification::assertSentTo(
    $user,
    function (OrderShipped $notification, array $channels) use ($order) {
        return $notification->order->id === $order->id;
    }
);
```

<a name="testing-on-demand-notifications"></a>
<!-- #### On-Demand Notifications -->
#### On-Demand Notifications

<!-- If the code you are testing sends [on-demand notifications](#on-demand-notifications), you can test that the on-demand notification was sent via the `assertSentOnDemand` method: -->
테스트 중인 코드가 [on-demand notifications](#on-demand-notifications)을 보낸다면, `assertSentOnDemand` 메서드를 통해 온디맨드 알림이 전송되었는지 테스트할 수 있습니다.

```php
Notification::assertSentOnDemand(OrderShipped::class);
Notification::assertSentOnDemandOnce(OrderShipped::class);
```

<!-- By passing a closure as the second argument to the `assertSentOnDemand` method, you may determine if an on-demand notification was sent to the correct "route" address: -->
`assertSentOnDemand` 메서드의 두 번째 인수로 클로저를 전달하면, 온디맨드 알림이 올바른 "route" 주소로 전송되었는지 확인할 수 있습니다.

```php
Notification::assertSentOnDemand(
    OrderShipped::class,
    function (OrderShipped $notification, array $channels, object $notifiable) use ($user) {
        return $notifiable->routes['mail'] === $user->email;
    }
);
```

<a name="notification-events"></a>
<!-- ## Notification Events -->
## Notification Events

<a name="notification-sending-event"></a>
<!-- #### Notification Sending Event -->
#### Notification Sending Event

<!-- When a notification is sending, the `Illuminate\Notifications\Events\NotificationSending` event is dispatched by the notification system. This contains the "notifiable" entity and the notification instance itself. You may create [event listeners](/docs/13.x/events) for this event within your application: -->
알림이 전송되는 중에는 알림 시스템이 `Illuminate\Notifications\Events\NotificationSending` 이벤트를 디스패치합니다. 이 이벤트에는 "알림을 받을 수 있는" 엔티티와 알림 인스턴스 자체가 포함됩니다. 애플리케이션 안에서 이 이벤트에 대한 [event listeners](/docs/13.x/events)를 만들 수 있습니다.

```php
use Illuminate\Notifications\Events\NotificationSending;

class CheckNotificationStatus
{
    /**
     * Handle the event.
     */
    public function handle(NotificationSending $event): void
    {
        // ...
    }
}
```

<!-- The notification will not be sent if an event listener for the `NotificationSending` event returns `false` from its `handle` method: -->
`NotificationSending` 이벤트의 이벤트 리스너가 `handle` 메서드에서 `false`를 반환하면 알림은 전송되지 않습니다.

```php
/**
 * Handle the event.
 */
public function handle(NotificationSending $event): bool
{
    return false;
}
```

<!-- Within an event listener, you may access the `notifiable`, `notification`, and `channel` properties on the event to learn more about the notification recipient or the notification itself: -->
이벤트 리스너 안에서는 이벤트의 `notifiable`, `notification`, `channel` 속성에 접근하여 알림 수신자나 알림 자체에 대해 더 자세히 알 수 있습니다.

```php
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
<!-- #### Notification Sent Event -->
#### Notification Sent Event

<!-- When a notification is sent, the `Illuminate\Notifications\Events\NotificationSent` [event](/docs/13.x/events) is dispatched by the notification system. This contains the "notifiable" entity and the notification instance itself. You may create [event listeners](/docs/13.x/events) for this event within your application: -->
알림이 전송되면 알림 시스템이 `Illuminate\Notifications\Events\NotificationSent` [event](/docs/13.x/events)를 디스패치합니다. 이 이벤트에는 "알림을 받을 수 있는" 엔티티와 알림 인스턴스 자체가 포함됩니다. 애플리케이션 안에서 이 이벤트에 대한 [event listeners](/docs/13.x/events)를 만들 수 있습니다.

```php
use Illuminate\Notifications\Events\NotificationSent;

class LogNotification
{
    /**
     * Handle the event.
     */
    public function handle(NotificationSent $event): void
    {
        // ...
    }
}
```

<!-- Within an event listener, you may access the `notifiable`, `notification`, `channel`, and `response` properties on the event to learn more about the notification recipient or the notification itself: -->
이벤트 리스너 안에서는 이벤트의 `notifiable`, `notification`, `channel`, `response` 속성에 접근하여 알림 수신자나 알림 자체에 대해 더 자세히 알 수 있습니다.

```php
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
<!-- ## Custom Channels -->
## Custom Channels

<!-- Laravel ships with a handful of notification channels, but you may want to write your own drivers to deliver notifications via other channels. Laravel makes it simple. To get started, define a class that contains a `send` method. The method should receive two arguments: a `$notifiable` and a `$notification`. -->
Laravel은 몇 가지 알림 채널을 기본으로 제공하지만, 다른 채널을 통해 알림을 전달하기 위해 직접 드라이버를 작성하고 싶을 수 있습니다. Laravel에서는 이를 간단하게 처리할 수 있습니다. 시작하려면 `send` 메서드를 포함하는 클래스를 정의하세요. 이 메서드는 두 개의 인수, 즉 `$notifiable`과 `$notification`을 받아야 합니다.

<!-- Within the `send` method, you may call methods on the notification to retrieve a message object understood by your channel and then send the notification to the `$notifiable` instance however you wish: -->
`send` 메서드 안에서는 알림의 메서드를 호출하여 해당 채널이 이해할 수 있는 메시지 객체를 가져온 다음, 원하는 방식으로 `$notifiable` 인스턴스에 알림을 보낼 수 있습니다.

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

<!-- Once your notification channel class has been defined, you may return the class name from the `via` method of any of your notifications. In this example, the `toVoice` method of your notification can return whatever object you choose to represent voice messages. For example, you might define your own `VoiceMessage` class to represent these messages: -->
알림 채널 클래스를 정의한 후에는 알림의 `via` 메서드에서 해당 클래스 이름을 반환할 수 있습니다. 이 예제에서 알림의 `toVoice` 메서드는 음성 메시지를 표현하기 위해 원하는 어떤 객체든 반환할 수 있습니다. 예를 들어 이러한 메시지를 표현하기 위해 직접 `VoiceMessage` 클래스를 정의할 수 있습니다.

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
