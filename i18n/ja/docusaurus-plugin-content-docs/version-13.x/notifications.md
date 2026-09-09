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
[sending email](/docs/13.x/mail) のサポートに加えて、Laravel は、電子メール、SMS (旧 Nexmo である [Vonage](https://www.vonage.com/communications-apis/) 経由)、[Slack](https://slack.com) など、さまざまな配信チャネルで通知を送信するためのサポートを提供します。さらに、数十の異なるチャネルで通知を送信するために、さまざまな [community built notification channels](https://laravel-notification-channels.com/about/#suggesting-a-new-channel) が作成されています。通知はデータベースに保存され、Web インターフェイスに表示される場合もあります。

<!-- Typically, notifications should be short, informational messages that notify users of something that occurred in your application. For example, if you are writing a billing application, you might send an "Invoice Paid" notification to your users via the email and SMS channels. -->
通常、通知は、アプリケーションで発生した何かをユーザーに通知する短い情報メッセージである必要があります。たとえば、請求アプリケーションを作成している場合、電子メールと SMS チャネルを介してユーザーに「請求書支払い済み」通知を送信できます。

<a name="generating-notifications"></a>
<!-- ## Generating Notifications -->
## Generating Notifications

<!-- In Laravel, each notification is represented by a single class that is typically stored in the `app/Notifications` directory. Don't worry if you don't see this directory in your application - it will be created for you when you run the `make:notification` Artisan command: -->
Laravel では、各通知は単一のクラスで表され、通常は `app/Notifications` ディレクトリに保存されます。アプリケーションにこのディレクトリが表示されなくても心配する必要はありません。`make:notification` Artisan コマンドを実行すると作成されます。

```shell
php artisan make:notification InvoicePaid
```

<!-- This command will place a fresh notification class in your `app/Notifications` directory. Each notification class contains a `via` method and a variable number of message building methods, such as `toMail` or `toDatabase`, that convert the notification to a message tailored for that particular channel. -->
このコマンドは、新しい通知クラスを `app/Notifications` ディレクトリに配置します。各通知クラスには、`via` メソッドと、通知をその特定のチャネルに合わせたメッセージに変換する `toMail` や `toDatabase` などの可変数のメッセージ構築メソッドが含まれています。

<a name="sending-notifications"></a>
<!-- ## Sending Notifications -->
## Sending Notifications

<a name="using-the-notifiable-trait"></a>
<!-- ### Using the Notifiable Trait -->
### Using the Notifiable Trait

<!-- Notifications may be sent in two ways: using the `notify` method of the `Notifiable` trait or using the `Notification` [facade](/docs/13.x/facades). The `Notifiable` trait is included on your application's `App\Models\User` model by default: -->
通知は 2 つの方法で送信できます。`Notifiable` 特性の `notify` メソッドを使用する方法と、`Notification` [facade](/docs/13.x/facades) を使用する方法です。 `Notifiable` 特性は、デフォルトでアプリケーションの `App\Models\User` モデルに含まれています。

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
この特性によって提供される `notify` メソッドは、通知インスタンスを受信することを想定しています。

```php
use App\Notifications\InvoicePaid;

$user->notify(new InvoicePaid($invoice));
```

> [!NOTE]
> どのモデルでも `Notifiable` トレイトを使用できることに注意してください。 `User` モデルに含めるだけに限定されるわけではありません。

<a name="using-the-notification-facade"></a>
<!-- ### Using the Notification Facade -->
### Using the Notification Facade

<!-- Alternatively, you may send notifications via the `Notification` [facade](/docs/13.x/facades). This approach is useful when you need to send a notification to multiple notifiable entities such as a collection of users. To send notifications using the facade, pass all of the notifiable entities and the notification instance to the `send` method: -->
あるいは、`Notification` [facade](/docs/13.x/facades) 経由で通知を送信することもできます。このアプローチは、ユーザーのコレクションなど、複数の通知対象エンティティに通知を送信する必要がある場合に便利です。ファサードを使用して通知を送信するには、すべての通知可能なエンティティと通知インスタンスを `send` メソッドに渡します。

```php
use Illuminate\Support\Facades\Notification;

Notification::send($users, new InvoicePaid($invoice));
```

<!-- You can also send notifications immediately using the `sendNow` method. This method will send the notification immediately even if the notification implements the `ShouldQueue` interface: -->
`sendNow` メソッドを使用して、すぐに通知を送信することもできます。このメソッドは、通知が `ShouldQueue` インターフェイスを実装している場合でも、通知をすぐに送信します。

```php
Notification::sendNow($developers, new DeploymentCompleted($deployment));
```

<a name="specifying-delivery-channels"></a>
<!-- ### Specifying Delivery Channels -->
### Specifying Delivery Channels

<!-- Every notification class has a `via` method that determines on which channels the notification will be delivered. Notifications may be sent on the `mail`, `database`, `broadcast`, `vonage`, and `slack` channels. -->
すべての通知クラスには、通知が配信されるチャネルを決定する `via` メソッドがあります。通知は、`mail`、`database`、`broadcast`、`vonage`、および `slack` チャネルで送信される場合があります。

> [!NOTE]
> Telegram や Pusher などの他の配信チャネルを使用したい場合は、コミュニティ主導の [Laravel Notification Channels website](http://laravel-notification-channels.com) をチェックしてください。

<!-- The `via` method receives a `$notifiable` instance, which will be an instance of the class to which the notification is being sent. You may use `$notifiable` to determine which channels the notification should be delivered on: -->
`via` メソッドは、通知の送信先となるクラスのインスタンスとなる `$notifiable` インスタンスを受け取ります。 `$notifiable` を使用して、通知を配信するチャネルを決定できます。

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
> 通知をキューに入れる前に、キューと [start a worker](/docs/13.x/queues#running-the-queue-worker) を設定する必要があります。

<!-- Sending notifications can take time, especially if the channel needs to make an external API call to deliver the notification. To speed up your application's response time, let your notification be queued by adding the `ShouldQueue` interface and `Queueable` trait to your class. The interface and trait are already imported for all notifications generated using the `make:notification` command, so you may immediately add them to your notification class: -->
特にチャネルが通知を配信するために外部 API 呼び出しを行う必要がある場合、通知の送信には時間がかかることがあります。アプリケーションの応答時間を短縮するには、`ShouldQueue` インターフェイスと `Queueable` トレイトをクラスに追加して、通知をキューに入れます。インターフェイスと特性は、`make:notification` コマンドを使用して生成されたすべての通知に対してすでにインポートされているため、通知クラスにすぐに追加できます。

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
`ShouldQueue` インターフェイスが通知に追加されたら、通常どおり通知を送信できます。 Laravel はクラス上の `ShouldQueue` インターフェイスを検出し、通知の配信を自動的にキューに入れます。

```php
$user->notify(new InvoicePaid($invoice));
```

<!-- When queueing notifications, a queued job will be created for each recipient and channel combination. For example, six jobs will be dispatched to the queue if your notification has three recipients and two channels. -->
通知をキューに入れると、受信者とチャネルの組み合わせごとにキューに入れられたジョブが作成されます。たとえば、通知に 3 人の受信者と 2 つのチャネルがある場合、6 つのジョブがキューにディスパッチされます。

<a name="delaying-notifications"></a>
<!-- #### Delaying Notifications -->
#### Delaying Notifications

<!-- If you would like to delay the delivery of the notification, you may chain the `delay` method onto your notification instantiation: -->
通知の配信を遅らせたい場合は、通知のインスタンス化に `delay` メソッドを連鎖させます。

```php
$delay = now()->plus(minutes: 10);

$user->notify((new InvoicePaid($invoice))->delay($delay));
```

<!-- You may pass an array to the `delay` method to specify the delay amount for specific channels: -->
配列を `delay` メソッドに渡して、特定のチャネルの遅​​延量を指定できます。

```php
$user->notify((new InvoicePaid($invoice))->delay([
    'mail' => now()->plus(minutes: 5),
    'sms' => now()->plus(minutes: 10),
]));
```

<!-- Alternatively, you may define a `withDelay` method on the notification class itself. The `withDelay` method should return an array of channel names and delay values: -->
あるいは、通知クラス自体に `withDelay` メソッドを定義することもできます。 `withDelay` メソッドは、チャネル名と遅延値の配列を返す必要があります。

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
デフォルトでは、キューに入れられた通知は、アプリケーションのデフォルトのキュー接続を使用してキューに入れられます。特定の通知に使用する別の接続を指定したい場合は、通知のコンストラクターから `onConnection` メソッドを呼び出すことができます。

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
または、通知でサポートされる各通知チャネルに使用する特定のキュー接続を指定したい場合は、通知で `viaConnections` メソッドを定義できます。このメソッドは、チャネル名とキュー接続名のペアの配列を返す必要があります。

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
通知でサポートされる各通知チャネルに使用する特定のキューを指定したい場合は、通知で `viaQueues` メソッドを定義できます。このメソッドは、チャネル名とキュー名のペアの配列を返す必要があります。

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
通知クラスでキュー属性を定義することで、基になるキューに入れられたジョブの動作をカスタマイズできます。これらの属性は、通知を送信するキューに入れられたジョブによって継承されます。

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
[encryption](/docs/13.x/encryption) 経由でキューに入れられた通知データのプライバシーと整合性を確保したい場合は、通知クラスに `ShouldBeEncrypted` インターフェイスを追加します。

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
これらの属性を通知クラスで直接定義することに加えて、`backoff` メソッドと `retryUntil` メソッドを定義して、キューに入れられた通知ジョブのバックオフ戦略と再試行タイムアウトを指定することもできます。

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
> これらのジョブの属性とメソッドの詳細については、[queued jobs](/docs/13.x/queues#max-job-attempts-and-timeout) のドキュメントを参照してください。

<a name="queued-notification-middleware"></a>
<!-- #### Queued Notification Middleware -->
#### Queued Notification Middleware

<!-- Queued notifications may define middleware [just like queued jobs](/docs/13.x/queues#job-middleware). To get started, define a `middleware` method on your notification class. The `middleware` method will receive `$notifiable` and `$channel` variables, which allow you to customize the returned middleware based on the notification's destination: -->
キューに入れられた通知はミドルウェア [just like queued jobs](/docs/13.x/queues#job-middleware) を定義する場合があります。まず、通知クラスで `middleware` メソッドを定義します。 `middleware` メソッドは `$notifiable` 変数と `$channel` 変数を受け取ります。これにより、返されるミドルウェアを通知の宛先に基づいてカスタマイズできます。

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
キューに入れられた通知がデータベース トランザクション内でディスパッチされると、データベース トランザクションがコミットされる前にキューによって通知が処理される場合があります。この問題が発生すると、データベース トランザクション中にモデルまたはデータベース レコードに対して行った更新がまだデータベースに反映されていない可能性があります。さらに、トランザクション内で作成されたモデルやデータベース レコードはデータベースに存在しない可能性があります。通知がこれらのモデルに依存している場合、キューに入れられた通知を送信するジョブの処理時に予期しないエラーが発生する可能性があります。

<!-- If your queue connection's `after_commit` configuration option is set to `false`, you may still indicate that a particular queued notification should be dispatched after all open database transactions have been committed by calling the `afterCommit` method when sending the notification: -->
キュー接続の `after_commit` 構成オプションが `false` に設定されている場合でも、通知の送信時に `afterCommit` メソッドを呼び出すことにより、開いているすべてのデータベース トランザクションがコミットされた後に特定のキューに入れられた通知を送信する必要があることを示すことができます。

```php
use App\Notifications\InvoicePaid;

$user->notify((new InvoicePaid($invoice))->afterCommit());
```

<!-- Alternatively, you may call the `afterCommit` method from your notification's constructor: -->
あるいは、通知のコンストラクターから `afterCommit` メソッドを呼び出すこともできます。

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
> これらの問題の回避方法の詳細については、[queued jobs and database transactions](/docs/13.x/queues#jobs-and-database-transactions) に関するドキュメントを参照してください。

<a name="determining-if-the-queued-notification-should-be-sent"></a>
<!-- #### Determining if a Queued Notification Should Be Sent -->
#### Determining if a Queued Notification Should Be Sent

<!-- After a queued notification has been dispatched for the queue for background processing, it will typically be accepted by a queue worker and sent to its intended recipient. -->
キューに入れられた通知は、バックグラウンド処理のためにキューにディスパッチされた後、通常、キューワーカーによって受け入れられ、目的の受信者に送信されます。

<!-- However, if you would like to make the final determination on whether the queued notification should be sent after it is being processed by a queue worker, you may define a `shouldSend` method on the notification class. If this method returns `false`, the notification will not be sent: -->
ただし、キューに入れられた通知がキューワーカーによって処理された後に送信するかどうかを最終決定したい場合は、通知クラスで `shouldSend` メソッドを定義できます。このメソッドが `false` を返した場合、通知は送信されません。

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
通知の送信後にコードを実行したい場合は、通知クラスで `afterSending` メソッドを定義できます。このメソッドは、通知対象エンティティ、チャネル名、チャネルからの応答を受け取ります。

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
場合によっては、アプリケーションの「ユーザー」として保存されていない人に通知を送信する必要がある場合があります。 `Notification` ファサードの `route` メソッドを使用すると、通知を送信する前にアドホック通知ルーティング情報を指定できます。

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
オンデマンド通知を `mail` ルートに送信するときに受信者の名前を指定したい場合は、電子メール アドレスをキーとして、名前を配列の最初の要素の値として含む配列を指定できます。

```php
Notification::route('mail', [
    'barrett@example.com' => 'Barrett Blair',
])->notify(new InvoicePaid($invoice));
```

<!-- Using the `routes` method, you may provide ad-hoc routing information for multiple notification channels at once: -->
`routes` メソッドを使用すると、複数の通知チャネルにアドホック ルーティング情報を一度に提供できます。

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
通知が電子メールとして送信されることをサポートしている場合は、通知クラスで `toMail` メソッドを定義する必要があります。このメソッドは `$notifiable` エンティティを受け取り、`Illuminate\Notifications\Messages\MailMessage` インスタンスを返す必要があります。

<!-- The `MailMessage` class contains a few simple methods to help you build transactional email messages. Mail messages may contain lines of text as well as a "call to action". Let's take a look at an example `toMail` method: -->
`MailMessage` クラスには、トランザクション電子メール メッセージの作成に役立ついくつかの簡単なメソッドが含まれています。メールメッセージには、テキスト行と「行動喚起」が含まれる場合があります。 `toMail` メソッドの例を見てみましょう。

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
> `toMail` メソッドで `$this->invoice->id` を使用していることに注意してください。通知がメッセージを生成するために必要なデータを通知のコンストラクターに渡すことができます。

<!-- In this example, we register a greeting, a line of text, a call to action, and then another line of text. These methods provided by the `MailMessage` object make it simple and fast to format small transactional emails. The mail channel will then translate the message components into a beautiful, responsive HTML email template with a plain-text counterpart. Here is an example of an email generated by the `mail` channel: -->
この例では、挨拶、テキスト行、行動喚起、そして別のテキスト行を登録します。 `MailMessage` オブジェクトによって提供されるこれらのメソッドにより、小規模なトランザクション電子メールのフォーマットが簡単かつ迅速になります。次に、メール チャネルは、メッセージ コンポーネントを、対応するプレーン テキストを含む美しく応答性の高い HTML 電子メール テンプレートに変換します。 `mail` チャネルによって生成された電子メールの例を次に示します。

<img src="https://laravel.com/img/docs/notification-example-2.png"/>

> [!NOTE]
> メール通知を送信するときは、`config/app.php` 構成ファイルで `name` 構成オプションを必ず設定してください。この値は、メール通知メッセージのヘッダーとフッターで使用されます。

<a name="error-messages"></a>
<!-- #### Error Messages -->
#### Error Messages

<!-- Some notifications inform users of errors, such as a failed invoice payment. You may indicate that a mail message is regarding an error by calling the `error` method when building your message. When using the `error` method on a mail message, the call to action button will be red instead of black: -->
一部の通知は、請求書支払いの失敗などのエラーをユーザーに通知します。メッセージの作成時に `error` メソッドを呼び出すことで、メール メッセージがエラーに関するものであることを示すことができます。メール メッセージで `error` メソッドを使用すると、CTA ボタンが黒ではなく赤になります。

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
通知クラスでテキストの「行」を定義する代わりに、`view` メソッドを使用して、通知電子メールのレンダリングに使用するカスタム テンプレートを指定できます。

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
`view` メソッドに与えられる配列の 2 番目の要素としてビュー名を渡すことで、メール メッセージのプレーンテキスト ビューを指定できます。

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
または、メッセージにプレーンテキスト ビューのみがある場合は、`text` メソッドを利用できます。

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
デフォルトでは、電子メールの送信者/差出人のアドレスは、`config/mail.php` 構成ファイルで定義されます。ただし、`from` メソッドを使用して、特定の通知の送信元アドレスを指定できます。

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
`mail` チャネル経由で通知を送信すると、通知システムは通知対象エンティティの `email` プロパティを自動的に検索します。通知可能なエンティティで `routeNotificationForMail` メソッドを定義することにより、通知の配信に使用される電子メール アドレスをカスタマイズできます。

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
デフォルトでは、電子メールの件名は、「Title Case」にフォーマットされた通知のクラス名です。したがって、通知クラスの名前が `InvoicePaid` の場合、電子メールの件名は `Invoice Paid` になります。メッセージに別の件名を指定したい場合は、メッセージの作成時に `subject` メソッドを呼び出すことができます。

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
デフォルトでは、電子メール通知は、`config/mail.php` 構成ファイルで定義されたデフォルトのメーラーを使用して送信されます。ただし、メッセージの作成時に `mailer` メソッドを呼び出すことで、実行時に別のメーラーを指定できます。

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
通知パッケージのリソースを公開することで、メール通知で使用される HTML およびプレーンテキストのテンプレートを変更できます。このコマンドを実行すると、メール通知テンプレートが `resources/views/vendor/notifications` ディレクトリに配置されます。

```shell
php artisan vendor:publish --tag=laravel-notifications
```

<a name="mail-attachments"></a>
<!-- ### Attachments -->
### Attachments

<!-- To add attachments to an email notification, use the `attach` method while building your message. The `attach` method accepts the absolute path to the file as its first argument: -->
電子メール通知に添付ファイルを追加するには、メッセージの作成時に `attach` メソッドを使用します。 `attach` メソッドは、最初の引数としてファイルへの絶対パスを受け入れます。

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
> 通知メール メッセージによって提供される `attach` メソッドは、[attachable objects](/docs/13.x/mail#attachable-objects) も受け入れます。詳細については、包括的な [attachable object documentation](/docs/13.x/mail#attachable-objects) を参照してください。

<!-- When attaching files to a message, you may also specify the display name and / or MIME type by passing an `array` as the second argument to the `attach` method: -->
メッセージにファイルを添付するときは、`array` を `attach` メソッドの 2 番目の引数として渡すことで、表示名や MIME タイプを指定することもできます。

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
必要に応じて、`attachMany` メソッドを使用して複数のファイルをメッセージに添付できます。

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
特定の [filesystem disk](/docs/13.x/filesystem) 上に存在するファイルを添付するには、`attachFromStorageDisk` メソッドを使用できます。このメソッドは、ディスク名とそのディスク上のファイルへのパスを受け取ります。

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
`attachData` メソッドを使用して、生のバイト文字列を添付ファイルとして添付できます。 `attachData` メソッドを呼び出すときは、添付ファイルに割り当てるファイル名を指定する必要があります。

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
Mailgun や Postmark などの一部のサードパーティ電子メール プロバイダは、メッセージの「タグ」と「メタデータ」をサポートしています。これらは、アプリケーションによって送信された電子メールをグループ化し、追跡するために使用される場合があります。 `tag` および `metadata` メソッドを使用して、電子メール メッセージにタグとメタデータを追加できます。

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
アプリケーションが Mailgun ドライバを使用している場合、[tags](https://documentation.mailgun.com/docs/mailgun/user-manual/tracking-messages/#tags) および [metadata](https://documentation.mailgun.com/docs/mailgun/user-manual/sending-messages/#attaching-metadata-to-messages) の詳細については、Mailgun のドキュメントを参照してください。同様に、[tags](https://postmarkapp.com/blog/tags-support-for-smtp) および [metadata](https://postmarkapp.com/support/article/1125-custom-metadata-faq) のサポートの詳細については、Postmark のドキュメントを参照することもできます。

<!-- If your application is using Amazon SES to send emails, you should use the `metadata` method to attach [SES "tags"](https://docs.aws.amazon.com/ses/latest/APIReference/API_MessageTag.html) to the message. -->
アプリケーションが Amazon SES を使用して E メールを送信している場合は、`metadata` メソッドを使用してメッセージに [SES "tags"](https://docs.aws.amazon.com/ses/latest/APIReference/API_MessageTag.html) を添付する必要があります。

<a name="customizing-the-symfony-message"></a>
<!-- ### Customizing the Symfony Message -->
### Customizing the Symfony Message

<!-- The `withSymfonyMessage` method of the `MailMessage` class allows you to register a closure which will be invoked with the Symfony Message instance before sending the message. This gives you an opportunity to deeply customize the message before it is delivered: -->
`MailMessage` クラスの `withSymfonyMessage` メソッドを使用すると、メッセージを送信する前に Symfony Message インスタンスで呼び出されるクロージャを登録できます。これにより、メッセージを配信する前に詳細にカスタマイズする機会が得られます。

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
必要に応じて、通知の `toMail` メソッドから完全な [mailable object](/docs/13.x/mail) を返すことができます。 `MailMessage` の代わりに `Mailable` を返す場合は、メール可能オブジェクトの `to` メソッドを使用してメッセージ受信者を指定する必要があります。

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
[on-demand notification](#on-demand-notifications) を送信する場合、`toMail` メソッドに指定される `$notifiable` インスタンスは、オンデマンド通知の送信先となる電子メール アドレスを取得するために使用できる `routeNotificationFor` メソッドを提供する `Illuminate\Notifications\AnonymousNotifiable` のインスタンスになります。

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
メール通知テンプレートを設計する場合、一般的な Blade テンプレートと同様に、レンダリングされたメール メッセージをブラウザですばやくプレビューできると便利です。このため、Laravel では、メール通知によって生成されたメール メッセージをルート クロージャーまたはコントローラから直接返すことができます。 `MailMessage` が返されると、ブラウザーにレンダリングされて表示されるため、実際の電子メール アドレスに送信しなくても、そのデザインをすばやくプレビューできます。

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
マークダウン メール通知を使用すると、メール通知の事前に構築されたテンプレートを利用できると同時に、カスタマイズされた長いメッセージをより自由に作成できるようになります。メッセージは Markdown で記述されているため、Laravel はメッセージ用の美しく応答性の高い HTML テンプレートをレンダリングできると同時に、対応するプレーンテキストも自動的に生成します。

<a name="generating-the-message"></a>
<!-- ### Generating the Message -->
### Generating the Message

<!-- To generate a notification with a corresponding Markdown template, you may use the `--markdown` option of the `make:notification` Artisan command: -->
対応するマークダウン テンプレートで通知を生成するには、`make:notification` Artisan コマンドの `--markdown` オプションを使用できます。

```shell
php artisan make:notification InvoicePaid --markdown=mail.invoice.paid
```

<!-- Like all other mail notifications, notifications that use Markdown templates should define a `toMail` method on their notification class. However, instead of using the `line` and `action` methods to construct the notification, use the `markdown` method to specify the name of the Markdown template that should be used. An array of data you wish to make available to the template may be passed as the method's second argument: -->
他のすべてのメール通知と同様、Markdown テンプレートを使用する通知は、通知クラスで `toMail` メソッドを定義する必要があります。ただし、`line` メソッドと `action` メソッドを使用して通知を作成する代わりに、`markdown` メソッドを使用して、使用する必要がある Markdown テンプレートの名前を指定します。テンプレートで使用できるようにしたいデータの配列は、メソッドの 2 番目の引数として渡すことができます。

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
Markdown メール通知では、Blade コンポーネントと Markdown 構文の組み合わせを使用するため、Laravel の事前に作成された通知コンポーネントを活用しながら、通知を簡単に構築できます。

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
> Markdown メールを作成するときは、過剰なインデントを使用しないでください。 Markdown 標準に従って、Markdown パーサーはインデントされたコンテンツをコード ブロックとしてレンダリングします。

<a name="button-component"></a>
<!-- #### Button Component -->
#### Button Component

<!-- The button component renders a centered button link. The component accepts two arguments, a `url` and an optional `color`. Supported colors are `primary`, `green`, and `red`. You may add as many button components to a notification as you wish: -->
ボタン コンポーネントは、中央にボタン リンクをレンダリングします。このコンポーネントは、`url` とオプションの `color` の 2 つの引数を受け入れます。サポートされている色は、`primary`、`green`、および `red` です。ボタン コンポーネントは必要なだけ通知に追加できます。

```blade
<x-mail::button :url="$url" color="green">
View Invoice
</x-mail::button>
```

<a name="panel-component"></a>
<!-- #### Panel Component -->
#### Panel Component

<!-- The panel component renders the given block of text in a panel that has a slightly different background color than the rest of the notification. This allows you to draw attention to a given block of text: -->
パネル コンポーネントは、通知の残りの部分とはわずかに異なる背景色を持つパネルに指定されたテキスト ブロックをレンダリングします。これにより、特定のテキスト ブロックに注意を向けることができます。

```blade
<x-mail::panel>
This is the panel content.
</x-mail::panel>
```

<a name="table-component"></a>
<!-- #### Table Component -->
#### Table Component

<!-- The table component allows you to transform a Markdown table into an HTML table. The component accepts the Markdown table as its content. Table column alignment is supported using the default Markdown table alignment syntax: -->
table コンポーネントを使用すると、Markdown テーブルを HTML テーブルに変換できます。コンポーネントは、Markdown テーブルをコンテンツとして受け入れます。テーブル列の配置は、デフォルトの Markdown テーブル配置構文を使用してサポートされます。

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
すべての Markdown 通知コンポーネントを独自のアプリケーションにエクスポートしてカスタマイズできます。コンポーネントをエクスポートするには、`vendor:publish` Artisan コマンドを使用して、`laravel-mail` アセット タグを公開します。

```shell
php artisan vendor:publish --tag=laravel-mail
```

<!-- This command will publish the Markdown mail components to the `resources/views/vendor/mail` directory. The `mail` directory will contain an `html` and a `text` directory, each containing their respective representations of every available component. You are free to customize these components however you like. -->
このコマンドは、Markdown メール コンポーネントを `resources/views/vendor/mail` ディレクトリに公開します。 `mail` ディレクトリには、`html` ディレクトリと `text` ディレクトリが含まれ、それぞれに使用可能なすべてのコンポーネントのそれぞれの表現が含まれます。これらのコンポーネントは自由にカスタマイズできます。

<a name="customizing-the-css"></a>
<!-- #### Customizing the CSS -->
#### Customizing the CSS

<!-- After exporting the components, the `resources/views/vendor/mail/html/themes` directory will contain a `default.css` file. You may customize the CSS in this file and your styles will automatically be in-lined within the HTML representations of your Markdown notifications. -->
コンポーネントをエクスポートすると、`resources/views/vendor/mail/html/themes` ディレクトリに `default.css` ファイルが含まれます。このファイルの CSS をカスタマイズすると、スタイルは Markdown 通知の HTML 表現内に自動的にインラインで組み込まれます。

<!-- If you would like to build an entirely new theme for Laravel's Markdown components, you may place a CSS file within the `html/themes` directory. After naming and saving your CSS file, update the `theme` option of the `mail` configuration file to match the name of your new theme. -->
Laravel の Markdown コンポーネント用にまったく新しいテーマを構築したい場合は、CSS ファイルを `html/themes` ディレクトリ内に配置できます。 CSS ファイルに名前を付けて保存した後、`mail` 構成ファイルの `theme` オプションを新しいテーマの名前と一致するように更新します。

<!-- To customize the theme for an individual notification, you may call the `theme` method while building the notification's mail message. The `theme` method accepts the name of the theme that should be used when sending the notification: -->
個々の通知のテーマをカスタマイズするには、通知のメール メッセージを作成するときに `theme` メソッドを呼び出すことができます。 `theme` メソッドは、通知の送信時に使用するテーマの名前を受け入れます。

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
`database` 通知チャネルは、通知情報をデータベース テーブルに保存します。このテーブルには、通知タイプや通知を説明する JSON データ構造などの情報が含まれます。

<!-- You can query the table to display the notifications in your application's user interface. But, before you can do that, you will need to create a database table to hold your notifications. You may use the `make:notifications-table` command to generate a [migration](/docs/13.x/migrations) with the proper table schema: -->
テーブルをクエリして、アプリケーションのユーザー インターフェイスに通知を表示できます。ただし、その前に、通知を保持するデータベース テーブルを作成する必要があります。 `make:notifications-table` コマンドを使用して、適切なテーブル スキーマを持つ [migration](/docs/13.x/migrations) を生成できます。

```shell
php artisan make:notifications-table

php artisan migrate
```

> [!NOTE]
> 通知対象モデルが [UUID or ULID primary keys](/docs/13.x/eloquent#uuid-and-ulid-keys) を使用している場合は、通知テーブルの移行で `morphs` メソッドを [uuidMorphs](/docs/13.x/migrations#column-method-uuidMorphs) または [ulidMorphs](/docs/13.x/migrations#column-method-ulidMorphs) に置き換える必要があります。

<a name="formatting-database-notifications"></a>
<!-- ### Formatting Database Notifications -->
### Formatting Database Notifications

<!-- If a notification supports being stored in a database table, you should define a `toDatabase` or `toArray` method on the notification class. This method will receive a `$notifiable` entity and should return a plain PHP array. The returned array will be encoded as JSON and stored in the `data` column of your `notifications` table. Let's take a look at an example `toArray` method: -->
通知がデータベース テーブルへの保存をサポートしている場合は、通知クラスで `toDatabase` メソッドまたは `toArray` メソッドを定義する必要があります。このメソッドは `$notifiable` エンティティを受け取り、プレーンな PHP 配列を返す必要があります。返された配列は JSON としてエンコードされ、`notifications` テーブルの `data` 列に保存されます。 `toArray` メソッドの例を見てみましょう。

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
通知がアプリケーションのデータベースに保存されると、`type` 列はデフォルトで通知のクラス名に設定され、`read_at` 列は `null` になります。ただし、通知クラスで `databaseType` メソッドと `initialDatabaseReadAtValue` メソッドを定義することで、この動作をカスタマイズできます。

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
`toArray` メソッドは、JavaScript を利用したフロントエンドにブロードキャストするデータを決定するために、`broadcast` チャネルでも使用されます。 `database` チャネルと `broadcast` チャネルに 2 つの異なる配列表現を使用したい場合は、`toArray` メソッドの代わりに `toDatabase` メソッドを定義する必要があります。

<a name="accessing-the-notifications"></a>
<!-- ### Accessing the Notifications -->
### Accessing the Notifications

<!-- Once notifications are stored in the database, you need a convenient way to access them from your notifiable entities. The `Illuminate\Notifications\Notifiable` trait, which is included on Laravel's default `App\Models\User` model, includes a `notifications` [Eloquent relationship](/docs/13.x/eloquent-relationships) that returns the notifications for the entity. To fetch notifications, you may access this method like any other Eloquent relationship. By default, notifications will be sorted by the `created_at` timestamp with the most recent notifications at the beginning of the collection: -->
通知がデータベースに保存されたら、通知対象エンティティから通知にアクセスする便利な方法が必要になります。 Laravel のデフォルトの `App\Models\User` モデルに含まれる `Illuminate\Notifications\Notifiable` トレイトには、エンティティの通知を返す `notifications` [Eloquent relationship](/docs/13.x/eloquent-relationships) が含まれています。通知を取得するには、他の Eloquent 関係と同様に、このメソッドにアクセスできます。デフォルトでは、通知は `created_at` タイムスタンプによって並べ替えられ、最新の通知がコレクションの先頭に表示されます。

```php
$user = App\Models\User::find(1);

foreach ($user->notifications as $notification) {
    echo $notification->type;
}
```

<!-- If you want to retrieve only the "unread" notifications, you may use the `unreadNotifications` relationship. Again, these notifications will be sorted by the `created_at` timestamp with the most recent notifications at the beginning of the collection: -->
「未読」通知のみを取得したい場合は、`unreadNotifications` 関係を使用できます。繰り返しますが、これらの通知は `created_at` タイムスタンプによって並べ替えられ、最新の通知がコレクションの先頭に表示されます。

```php
$user = App\Models\User::find(1);

foreach ($user->unreadNotifications as $notification) {
    echo $notification->type;
}
```

<!-- If you want to retrieve only the "read" notifications, you may use the `readNotifications` relationship: -->
「既読」通知のみを取得したい場合は、`readNotifications` 関係を使用できます。

```php
$user = App\Models\User::find(1);

foreach ($user->readNotifications as $notification) {
    echo $notification->type;
}
```

> [!NOTE]
> JavaScript クライアントから通知にアクセスするには、現在のユーザーなどの通知可能なエンティティに通知を返すアプリケーションの通知コントローラを定義する必要があります。その後、JavaScript クライアントからそのコントローラの URL に対して HTTP リクエストを行うことができます。

<a name="marking-notifications-as-read"></a>
<!-- ### Marking Notifications as Read -->
### Marking Notifications as Read

<!-- Typically, you will want to mark a notification as "read" when a user views it. The `Illuminate\Notifications\Notifiable` trait provides a `markAsRead` method, which updates the `read_at` column on the notification's database record: -->
通常、ユーザーが通知を表示したときに、通知を「既読」としてマークする必要があります。 `Illuminate\Notifications\Notifiable` トレイトは、通知のデータベース レコードの `read_at` 列を更新する `markAsRead` メソッドを提供します。

```php
$user = App\Models\User::find(1);

foreach ($user->unreadNotifications as $notification) {
    $notification->markAsRead();
}
```

<!-- However, instead of looping through each notification, you may use the `markAsRead` method directly on a collection of notifications: -->
ただし、各通知をループする代わりに、通知のコレクションに対して `markAsRead` メソッドを直接使用することもできます。

```php
$user->unreadNotifications->markAsRead();
```

<!-- You may also use a mass-update query to mark all of the notifications as read without retrieving them from the database: -->
一括更新クエリを使用して、データベースから通知を取得せずに、すべての通知を既読としてマークすることもできます。

```php
$user = App\Models\User::find(1);

$user->unreadNotifications()->update(['read_at' => now()]);
```

<!-- You may `delete` the notifications to remove them from the table entirely: -->
通知を `delete` してテーブルから完全に削除できます。

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
通知をブロードキャストする前に、Laravel の [event broadcasting](/docs/13.x/broadcasting) サービスを設定し、よく理解しておく必要があります。イベントブロードキャストは、JavaScript を利用したフロントエンドからサーバーサイドの Laravel イベントに反応する方法を提供します。

<a name="formatting-broadcast-notifications"></a>
<!-- ### Formatting Broadcast Notifications -->
### Formatting Broadcast Notifications

<!-- The `broadcast` channel broadcasts notifications using Laravel's [event broadcasting](/docs/13.x/broadcasting) services, allowing your JavaScript powered frontend to catch notifications in realtime. If a notification supports broadcasting, you can define a `toBroadcast` method on the notification class. This method will receive a `$notifiable` entity and should return a `BroadcastMessage` instance. If the `toBroadcast` method does not exist, the `toArray` method will be used to gather the data that should be broadcast. The returned data will be encoded as JSON and broadcast to your JavaScript powered frontend. Let's take a look at an example `toBroadcast` method: -->
`broadcast` チャネルは、Laravel の [event broadcasting](/docs/13.x/broadcasting) サービスを使用して通知をブロードキャストし、JavaScript を利用したフロントエンドがリアルタイムで通知をキャッチできるようにします。通知がブロードキャストをサポートしている場合は、通知クラスで `toBroadcast` メソッドを定義できます。このメソッドは `$notifiable` エンティティを受け取り、`BroadcastMessage` インスタンスを返す必要があります。 `toBroadcast` メソッドが存在しない場合は、ブロードキャストするデータを収集するために `toArray` メソッドが使用されます。返されたデータは JSON としてエンコードされ、JavaScript を利用したフロントエンドにブロードキャストされます。 `toBroadcast` メソッドの例を見てみましょう。

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
すべてのブロードキャスト通知はブロードキャストのためにキューに入れられます。ブロードキャスト操作をキューに入れるために使用されるキュー接続またはキュー名を構成したい場合は、`BroadcastMessage` の `onConnection` および `onQueue` メソッドを使用できます。

```php
return (new BroadcastMessage($data))
    ->onConnection('sqs')
    ->onQueue('broadcasts');
```

<a name="customizing-the-notification-type"></a>
<!-- #### Customizing the Notification Type -->
#### Customizing the Notification Type

<!-- In addition to the data you specify, all broadcast notifications also have a `type` field containing the full class name of the notification. If you would like to customize the notification `type`, you may define a `broadcastType` method on the notification class: -->
指定したデータに加えて、すべてのブロードキャスト通知には、通知の完全なクラス名を含む `type` フィールドもあります。通知 `type` をカスタマイズしたい場合は、通知クラスで `broadcastType` メソッドを定義できます。

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
通知は、`{notifiable}.{id}` 規則を使用してフォーマットされたプライベート チャネルでブロードキャストされます。したがって、`1` の ID を持つ `App\Models\User` インスタンスに通知を送信する場合、通知は `App.Models.User.1` プライベート チャネルでブロードキャストされます。 [Laravel Echo](/docs/13.x/broadcasting#client-side-installation) を使用する場合、`notification` メソッドを使用してチャネル上の通知を簡単にリッスンできます。

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
Laravel Echo には React、Vue、Svelte フックが含まれており、通知を簡単にリッスンできるようになります。まず、通知をリッスンするために使用される `useEchoNotification` フックを呼び出します。 `useEchoNotification` フックは、使用側コンポーネントがアンマウントされると自動的にチャネルを離れます。

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
デフォルトでは、フックはすべての通知をリッスンします。リッスンする通知タイプを指定するには、タイプの文字列または配列を `useEchoNotification` に提供します。

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
通知ペイロード データの形式を指定して、タイプ セーフ性と編集の利便性を高めることもできます。

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
エンティティのブロードキャスト通知がどのチャネルでブロードキャストされるかをカスタマイズしたい場合は、通知可能なエンティティで `receivesBroadcastNotificationsOn` メソッドを定義できます。

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
Laravel での SMS 通知の送信は、[Vonage](https://www.vonage.com/) (旧名 Nexmo) を利用しています。 Vonage 経由で通知を送信する前に、`laravel/vonage-notification-channel` および `guzzlehttp/guzzle` パッケージをインストールする必要があります。

```shell
composer require laravel/vonage-notification-channel guzzlehttp/guzzle
```

<!-- The package includes a [configuration file](https://github.com/laravel/vonage-notification-channel/blob/3.x/config/vonage.php). However, you are not required to export this configuration file to your own application. You can simply use the `VONAGE_KEY` and `VONAGE_SECRET` environment variables to define your Vonage public and secret keys. -->
パッケージには [configuration file](https://github.com/laravel/vonage-notification-channel/blob/3.x/config/vonage.php) が含まれています。ただし、この構成ファイルを独自のアプリケーションにエクスポートする必要はありません。 `VONAGE_KEY` および `VONAGE_SECRET` 環境変数を使用するだけで、Vonage の公開キーと秘密キーを定義できます。

<!-- After defining your keys, you should set a `VONAGE_SMS_FROM` environment variable that defines the phone number that your SMS messages should be sent from by default. You may generate this phone number within the Vonage control panel: -->
キーを定義した後、デフォルトで SMS メッセージの送信元となる電話番号を定義する `VONAGE_SMS_FROM` 環境変数を設定する必要があります。この電話番号は、Vonage コントロール パネル内で生成できます。

```ini
VONAGE_SMS_FROM=15556666666
```

<a name="formatting-sms-notifications"></a>
<!-- ### Formatting SMS Notifications -->
### Formatting SMS Notifications

<!-- If a notification supports being sent as an SMS, you should define a `toVonage` method on the notification class. This method will receive a `$notifiable` entity and should return an `Illuminate\Notifications\Messages\VonageMessage` instance: -->
通知が SMS としての送信をサポートしている場合は、通知クラスで `toVonage` メソッドを定義する必要があります。このメソッドは `$notifiable` エンティティを受け取り、`Illuminate\Notifications\Messages\VonageMessage` インスタンスを返す必要があります。

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
SMS メッセージに Unicode 文字が含まれる場合は、`VonageMessage` インスタンスを構築するときに `unicode` メソッドを呼び出す必要があります。

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
`VONAGE_SMS_FROM` 環境変数で指定された電話番号とは異なる電話番号から通知を送信したい場合は、`VonageMessage` インスタンスで `from` メソッドを呼び出すことができます。

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
ユーザー、チーム、またはクライアントごとのコストを追跡したい場合は、通知に「クライアント参照」を追加できます。 Vonage では、このクライアント リファレンスを使用してレポートを生成できるため、特定の顧客の SMS の使用状況をよりよく理解できます。クライアント参照には、最大 40 文字の任意の文字列を指定できます。

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
Vonage 通知を適切な電話番号にルーティングするには、通知対象エンティティで `routeNotificationForVonage` メソッドを定義します。

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
Slack 通知を送信する前に、Composer 経由で Slack 通知チャネルをインストールする必要があります。

```shell
composer require laravel/slack-notification-channel
```

<!-- Additionally, you must create a [Slack App](https://api.slack.com/apps?new_app=1) for your Slack workspace. -->
さらに、Slack ワークスペース用に [Slack App](https://api.slack.com/apps?new_app=1) を作成する必要があります。

<!-- If you only need to send notifications to the same Slack workspace that the App is created in, you should ensure that your App has the `chat:write`, `chat:write.public`, and `chat:write.customize` scopes. These scopes can be added from the "OAuth & Permissions" App management tab within Slack. -->
アプリが作成されているのと同じ Slack ワークスペースにのみ通知を送信する必要がある場合は、アプリに `chat:write`、`chat:write.public`、および `chat:write.customize` スコープがあることを確認する必要があります。これらのスコープは、Slack 内の「OAuth と権限」アプリ管理タブから追加できます。

<!-- Next, copy the App's "Bot User OAuth Token" and place it within a `slack` configuration array in your application's `services.php` configuration file. This token can be found on the "OAuth & Permissions" tab within Slack: -->
次に、アプリの「ボット ユーザー OAuth トークン」をコピーし、アプリケーションの `services.php` 構成ファイルの `slack` 構成配列内に配置します。このトークンは、Slack 内の [OAuth & Permissions] タブにあります。

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
アプリケーションが、アプリケーションのユーザーが所有する外部 Slack ワークスペースに通知を送信する場合は、Slack 経由でアプリケーションを「配布」する必要があります。アプリの配布は、Slack 内のアプリの「配布の管理」タブから管理できます。アプリが配布されたら、アプリケーションのユーザーに代わって [Socialite](/docs/13.x/socialite) から [obtain Slack Bot tokens](/docs/13.x/socialite#slack-bot-scopes) を使用できます。

<a name="formatting-slack-notifications"></a>
<!-- ### Formatting Slack Notifications -->
### Formatting Slack Notifications

<!-- If a notification supports being sent as a Slack message, you should define a `toSlack` method on the notification class. This method will receive a `$notifiable` entity and should return an `Illuminate\Notifications\Slack\SlackMessage` instance. You can construct rich notifications using [Slack's Block Kit API](https://api.slack.com/block-kit). The following example may be previewed in [Slack's Block Kit builder](https://app.slack.com/block-kit-builder/T01KWS6K23Z#%7B%22blocks%22:%5B%7B%22type%22:%22header%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22Invoice%20Paid%22%7D%7D,%7B%22type%22:%22context%22,%22elements%22:%5B%7B%22type%22:%22plain_text%22,%22text%22:%22Customer%20%231234%22%7D%5D%7D,%7B%22type%22:%22section%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22An%20invoice%20has%20been%20paid.%22%7D,%22fields%22:%5B%7B%22type%22:%22mrkdwn%22,%22text%22:%22*Invoice%20No:*%5Cn1000%22%7D,%7B%22type%22:%22mrkdwn%22,%22text%22:%22*Invoice%20Recipient:*%5Cntaylor@laravel.com%22%7D%5D%7D,%7B%22type%22:%22divider%22%7D,%7B%22type%22:%22section%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22Congratulations!%22%7D%7D%5D%7D): -->
通知が Slack メッセージとしての送信をサポートしている場合は、通知クラスで `toSlack` メソッドを定義する必要があります。このメソッドは `$notifiable` エンティティを受け取り、`Illuminate\Notifications\Slack\SlackMessage` インスタンスを返す必要があります。 [Slack's Block Kit API](https://api.slack.com/block-kit) を使用してリッチ通知を構築できます。次の例は、[Slack's Block Kit builder](https://app.slack.com/block-kit-builder/T01KWS6K23Z#%7B%22blocks%22:%5B%7B%22type%22:%22header%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22Invoice%20Paid%22%7D%7D,%7B%22type%22:%22context%22,%22elements%22:%5B%7B%22type%22:%22plain_text%22,%22text%22:%22Customer%20%231234%22%7D%5D%7D,%7B%22type%22:%22section%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22An%20invoice%20has%20been%20paid.%22%7D,%22fields%22:%5B%7B%22type%22:%22mrkdwn%22,%22text%22:%22*Invoice%20No:*%5Cn1000%22%7D,%7B%22type%22:%22mrkdwn%22,%22text%22:%22*Invoice%20Recipient:*%5Cntaylor@laravel.com%22%7D%5D%7D,%7B%22type%22:%22divider%22%7D,%7B%22type%22:%22section%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22Congratulations!%22%7D%7D%5D%7D) でプレビューできます。

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
Block Kit メッセージを構築するために流暢なメッセージ ビルダ メソッドを使用する代わりに、Slack の Block Kit Builder によって生成された生の JSON ペイロードを `usingBlockKitTemplate` メソッドに提供することもできます。

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
Slack の Block Kit 通知システムは、[handle user interaction](https://api.slack.com/interactivity/handling) に強力な機能を提供します。これらの機能を利用するには、Slack アプリで「インタラクティブ性」を有効にし、アプリケーションによって提供される URL を指すように「リクエスト URL」を構成する必要があります。これらの設定は、Slack 内の「インタラクティブ性とショートカット」アプリ管理タブから管理できます。

<!-- In the following example, which utilizes the `actionsBlock` method, Slack will send a `POST` request to your "Request URL" with a payload containing the Slack user who clicked the button, the ID of the clicked button, and more. Your application can then determine the action to take based on the payload. You should also [verify the request](https://api.slack.com/authentication/verifying-requests-from-slack) was made by Slack: -->
`actionsBlock` メソッドを利用する次の例では、Slack は、ボタンをクリックした Slack ユーザー、クリックされたボタンの ID などを含むペイロードを含む `POST` リクエストを「リクエスト URL」に送信します。その後、アプリケーションはペイロードに基づいて実行するアクションを決定できます。 [verify the request](https://api.slack.com/authentication/verifying-requests-from-slack) は Slack によって作成されたものであることも確認してください。

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
アクションを実行する前にユーザーに確認を要求したい場合は、ボタンを定義するときに `confirm` メソッドを呼び出すことができます。 `confirm` メソッドは、メッセージと、`ConfirmObject` インスタンスを受け取るクロージャを受け入れます。

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
構築しているブロックをすぐに検査したい場合は、`SlackMessage` インスタンスで `dd` メソッドを呼び出すことができます。 `dd` メソッドは、Slack の [Block Kit Builder](https://app.slack.com/block-kit-builder/) への URL を生成してダンプします。これにより、ブラウザーにペイロードと通知のプレビューが表示されます。 `true` を `dd` メソッドに渡して、生のペイロードをダンプできます。

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
Slack 通知を適切な Slack チームとチャネルに送信するには、通知可能なモデルで `routeNotificationForSlack` メソッドを定義します。このメソッドは、次の 3 つの値のいずれかを返します。

<!-- - `null` - which defers routing to the channel configured in the notification itself. You may use the `to` method when building your `SlackMessage` to configure the channel within the notification. - A string specifying the Slack channel to send the notification to, e.g. `#support-channel`. - A `SlackRoute` instance, which allows you to specify an OAuth token and channel name, e.g. `SlackRoute::make($this->slack_channel, $this->slack_token)`. This method should be used to send notifications to external workspaces. -->
- `null` - 通知自体で構成されたチャネルへのルーティングを延期します。 `SlackMessage` を構築するときに `to` メソッドを使用して、通知内のチャネルを構成できます。
- 通知の送信先となる Slack チャネルを指定する文字列。 `#support-channel`。
- `SlackRoute` インスタンス。OAuth トークンとチャネル名を指定できます。 `SlackRoute::make($this->slack_channel, $this->slack_token)`。このメソッドは、外部ワークスペースに通知を送信するために使用する必要があります。

<!-- For instance, returning `#support-channel` from the `routeNotificationForSlack` method will send the notification to the `#support-channel` channel in the workspace associated with the Bot User OAuth token located in your application's `services.php` configuration file: -->
たとえば、`routeNotificationForSlack` メソッドから `#support-channel` を返すと、アプリケーションの `services.php` 構成ファイルにあるボット ユーザー OAuth トークンに関連付けられたワークスペースの `#support-channel` チャネルに通知が送信されます。

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
> 外部 Slack ワークスペースに通知を送信する前に、Slack アプリが [distributed](#slack-app-distribution) である必要があります。

<!-- Of course, you will often want to send notifications to the Slack workspaces owned by your application's users. To do so, you will first need to obtain a Slack OAuth token for the user. Thankfully, [Laravel Socialite](/docs/13.x/socialite) includes a Slack driver that will allow you to easily authenticate your application's users with Slack and [obtain a bot token](/docs/13.x/socialite#slack-bot-scopes). -->
もちろん、アプリケーションのユーザーが所有する Slack ワークスペースに通知を送信したい場合もよくあります。これを行うには、まずユーザーの Slack OAuth トークンを取得する必要があります。ありがたいことに、[Laravel Socialite](/docs/13.x/socialite) には、Slack と [obtain a bot token](/docs/13.x/socialite#slack-bot-scopes) を使用してアプリケーションのユーザーを簡単に認証できるようにする Slack ドライバが含まれています。

<!-- Once you have obtained the bot token and stored it within your application's database, you may utilize the `SlackRoute::make` method to route a notification to the user's workspace. In addition, your application will likely need to offer an opportunity for the user to specify which channel notifications should be sent to: -->
ボット トークンを取得してアプリケーションのデータベース内に保存したら、`SlackRoute::make` メソッドを利用してユーザーのワークスペースに通知をルーティングできます。さらに、アプリケーションでは、どのチャネル通知を送信するかをユーザーに指定する機会を提供する必要がある可能性があります。

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
Laravel では、HTTP リクエストの現在のロケール以外のロケールで通知を送信することができ、通知がキューに入れられている場合でもこのロケールを記憶します。

<!-- To accomplish this, the `Illuminate\Notifications\Notification` class offers a `locale` method to set the desired language. The application will change into this locale when the notification is being evaluated and then revert back to the previous locale when evaluation is complete: -->
これを実現するために、`Illuminate\Notifications\Notification` クラスは、希望の言語を設定するための `locale` メソッドを提供します。アプリケーションは、通知の評価中にこのロケールに変更され、評価が完了すると前のロケールに戻ります。

```php
$user->notify((new InvoicePaid($invoice))->locale('es'));
```

<!-- Localization of multiple notifiable entries may also be achieved via the `Notification` facade: -->
複数の通知可能なエントリのローカライズは、`Notification` ファサードを介して実現することもできます。

```php
Notification::locale('es')->send(
    $users, new InvoicePaid($invoice)
);
```

<a name="user-preferred-locales"></a>
<!-- #### User Preferred Locales -->
#### User Preferred Locales

<!-- Sometimes, applications store each user's preferred locale. By implementing the `HasLocalePreference` contract on your notifiable model, you may instruct Laravel to use this stored locale when sending a notification: -->
場合によっては、アプリケーションが各ユーザーの優先ロケールを保存することがあります。通知可能モデルに `HasLocalePreference` コントラクトを実装することで、通知を送信するときにこの保存されたロケールを使用するように Laravel に指示できます。

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
インターフェースを実装すると、Laravel は通知とメール可能ファイルをモデルに送信するときに優先ロケールを自動的に使用します。したがって、このインターフェイスを使用する場合は、`locale` メソッドを呼び出す必要はありません。

```php
$user->notify(new InvoicePaid($invoice));
```

<a name="testing"></a>
<!-- ## Testing -->
## Testing

<!-- You may use the `Notification` facade's `fake` method to prevent notifications from being sent. Typically, sending notifications is unrelated to the code you are actually testing. Most likely, it is sufficient to simply assert that Laravel was instructed to send a given notification. -->
`Notification` ファサードの `fake` メソッドを使用して、通知が送信されないようにすることができます。通常、通知の送信は、実際にテストしているコードとは無関係です。おそらく、Laravel が特定の通知を送信するように指示されたと主張するだけで十分です。

<!-- After calling the `Notification` facade's `fake` method, you may then assert that notifications were instructed to be sent to users and even inspect the data the notifications received: -->
`Notification` ファサードの `fake` メソッドを呼び出した後、通知がユーザーに送信されるように指示されたことをアサートし、通知が受信したデータを検査することもできます。

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
特定の「真実テスト」に合格する通知が送信されたことをアサートするために、`assertSentTo` メソッドまたは `assertNotSentTo` メソッドにクロージャを渡すことができます。指定された真実テストに合格する少なくとも 1 つの通知が送信された場合、アサーションは成功します。

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
テストしているコードが [on-demand notifications](#on-demand-notifications) を送信する場合、オンデマンド通知が `assertSentOnDemand` メソッド経由で送信されたことをテストできます。

```php
Notification::assertSentOnDemand(OrderShipped::class);
Notification::assertSentOnDemandOnce(OrderShipped::class);
```

<!-- By passing a closure as the second argument to the `assertSentOnDemand` method, you may determine if an on-demand notification was sent to the correct "route" address: -->
`assertSentOnDemand` メソッドの 2 番目の引数としてクロージャーを渡すことで、オンデマンド通知が正しい「ルート」アドレスに送信されたかどうかを判断できます。

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
通知の送信中に、通知システムによって `Illuminate\Notifications\Events\NotificationSending` イベントが送出されます。これには、「通知可能な」エンティティと通知インスタンス自体が含まれます。アプリケーション内でこのイベント用に [event listeners](/docs/13.x/events) を作成できます。

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
`NotificationSending` イベントのイベント リスナが `handle` メソッドから `false` を返した場合、通知は送信されません。

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
イベント リスナ内で、イベントの `notifiable`、`notification`、および `channel` プロパティにアクセスして、通知受信者または通知自体の詳細を確認できます。

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
通知が送信されると、通知システムによって `Illuminate\Notifications\Events\NotificationSent` [event](/docs/13.x/events) がディスパッチされます。これには、「通知可能な」エンティティと通知インスタンス自体が含まれます。アプリケーション内でこのイベント用に [event listeners](/docs/13.x/events) を作成できます。

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
イベント リスナ内で、イベントの `notifiable`、`notification`、`channel`、および `response` プロパティにアクセスして、通知受信者または通知自体の詳細を確認できます。

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
Laravel にはいくつかの通知チャネルが付属していますが、他のチャネル経由で通知を配信する独自​​のドライバを作成することもできます。 Laravel を使えば簡単になります。まず、`send` メソッドを含むクラスを定義します。このメソッドは、`$notifiable` と `$notification` の 2 つの引数を受け取る必要があります。

<!-- Within the `send` method, you may call methods on the notification to retrieve a message object understood by your channel and then send the notification to the `$notifiable` instance however you wish: -->
`send` メソッド内で、通知のメソッドを呼び出して、チャネルによって理解されるメッセージ オブジェクトを取得し、通知を `$notifiable` インスタンスに送信することができます。

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
通知チャネル クラスを定義したら、任意の通知の `via` メソッドからクラス名を返すことができます。この例では、通知の `toVoice` メソッドは、音声メッセージを表すために選択したオブジェクトを返すことができます。たとえば、次のメッセージを表す独自の `VoiceMessage` クラスを定義できます。

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
