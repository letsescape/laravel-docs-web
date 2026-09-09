<!-- # Mail -->
# Mail

- [Introduction](#introduction)
    - [Configuration](#configuration)
    - [Driver Prerequisites](#driver-prerequisites)
    - [Failover Configuration](#failover-configuration)
    - [Round Robin Configuration](#round-robin-configuration)
- [Generating Mailables](#generating-mailables)
- [Writing Mailables](#writing-mailables)
    - [Configuring the Sender](#configuring-the-sender)
    - [Configuring the View](#configuring-the-view)
    - [View Data](#view-data)
    - [Attachments](#attachments)
    - [Inline Attachments](#inline-attachments)
    - [Attachable Objects](#attachable-objects)
    - [Headers](#headers)
    - [Tags and Metadata](#tags-and-metadata)
    - [Customizing the Symfony Message](#customizing-the-symfony-message)
- [Markdown Mailables](#markdown-mailables)
    - [Generating Markdown Mailables](#generating-markdown-mailables)
    - [Writing Markdown Messages](#writing-markdown-messages)
    - [Customizing the Components](#customizing-the-components)
- [Sending Mail](#sending-mail)
    - [Queueing Mail](#queueing-mail)
- [Rendering Mailables](#rendering-mailables)
    - [Previewing Mailables in the Browser](#previewing-mailables-in-the-browser)
- [Localizing Mailables](#localizing-mailables)
- [Testing](#testing-mailables)
    - [Testing Mailable Content](#testing-mailable-content)
    - [Testing Mailable Sending](#testing-mailable-sending)
- [Mail and Local Development](#mail-and-local-development)
- [Events](#events)
- [Custom Transports](#custom-transports)
    - [Additional Symfony Transports](#additional-symfony-transports)

<a name="introduction"></a>
<!-- ## Introduction -->
## Introduction

<!-- Sending email doesn't have to be complicated. Laravel provides a clean, simple email API powered by the popular [Symfony Mailer](https://symfony.com/doc/current/mailer.html) component. Laravel and Symfony Mailer provide drivers for sending email via SMTP, Cloudflare, Mailgun, Postmark, Resend, Amazon SES, and `sendmail`, allowing you to quickly get started sending mail through a local or cloud-based service of your choice. -->
電子メールの送信は複雑である必要はありません。 Laravel は、人気のある [Symfony Mailer](https://symfony.com/doc/current/mailer.html) コンポーネントを活用したクリーンでシンプルな電子メール API を提供します。 Laravel と Symfony Mailer は、SMTP、Cloudflare、Mailgun、Postmark、Resend、Amazon SES、および `sendmail` 経由で電子メールを送信するためのドライバを提供しており、選択したローカルまたはクラウドベースのサービスを通じてメールの送信をすぐに開始できます。

<a name="configuration"></a>
<!-- ### Configuration -->
### Configuration

<!-- Laravel's email services may be configured via your application's `config/mail.php` configuration file. Each mailer configured within this file may have its own unique configuration and even its own unique "transport", allowing your application to use different email services to send certain email messages. For example, your application might use Postmark to send transactional emails while using Amazon SES to send bulk emails. -->
Laravel の電子メール サービスは、アプリケーションの `config/mail.php` 構成ファイルを介して構成できます。このファイル内で構成された各メーラーは、独自の固有の構成および独自の「トランスポート」さえ持つことができ、アプリケーションがさまざまな電子メール サービスを使用して特定の電子メール メッセージを送信できるようになります。たとえば、アプリケーションでは Postmark を使用してトランザクション E メールを送信し、Amazon SES を使用して一括 E メールを送信する場合があります。

<!-- Within your `mail` configuration file, you will find a `mailers` configuration array. This array contains a sample configuration entry for each of the major mail drivers / transports supported by Laravel, while the `default` configuration value determines which mailer will be used by default when your application needs to send an email message. -->
`mail` 構成ファイル内に、`mailers` 構成配列があります。この配列には、Laravel でサポートされている主要なメールドライバ/トランスポートのそれぞれのサンプル構成エントリが含まれています。一方、`default` 構成値は、アプリケーションが電子メールメッセージを送信する必要があるときにデフォルトで使用されるメーラーを決定します。

<a name="driver-prerequisites"></a>
<!-- ### Driver / Transport Prerequisites -->
### Driver / Transport Prerequisites

<!-- The API based drivers such as Mailgun, Postmark, and Resend are often simpler and faster than sending mail via SMTP servers. Whenever possible, we recommend that you use one of these drivers. -->
Mailgun、Postmark、Resend などの API ベースのドライバは、多くの場合、SMTP サーバー経由でメールを送信するよりも簡単で高速です。可能な限り、これらのドライバのいずれかを使用することをお勧めします。

<a name="cloudflare-driver"></a>
<!-- #### Cloudflare Driver -->
#### Cloudflare Driver

<!-- To use the Cloudflare driver, install Symfony's HTTP Client via Composer: -->
Cloudflare ドライバを使用するには、Composer 経由で Symfony の HTTP クライアントをインストールします。

```shell
composer require symfony/http-client
```

<!-- Next, you will need to make two changes in your application's `config/mail.php` configuration file. First, set your default mailer to `cloudflare`: -->
次に、アプリケーションの `config/mail.php` 構成ファイルに 2 つの変更を加える必要があります。まず、デフォルトのメーラーを `cloudflare` に設定します。

```php
'default' => env('MAIL_MAILER', 'cloudflare'),
```

<!-- Second, add the following configuration array to your array of `mailers`: -->
次に、次の構成配列を `mailers` の配列に追加します。

```php
'cloudflare' => [
    'transport' => 'cloudflare',
],
```

<!-- After configuring your application's default mailer, add the following options to your `config/services.php` configuration file: -->
アプリケーションのデフォルトのメーラーを構成した後、`config/services.php` 構成ファイルに次のオプションを追加します。

```php
'cloudflare' => [
    'account_id' => env('CLOUDFLARE_ACCOUNT_ID'),
    'key' => env('CLOUDFLARE_KEY'),
],
```

<a name="mailgun-driver"></a>
<!-- #### Mailgun Driver -->
#### Mailgun Driver

<!-- To use the Mailgun driver, install Symfony's Mailgun Mailer transport via Composer: -->
Mailgun ドライバを使用するには、Composer 経由で Symfony の Mailgun Mailer トランスポートをインストールします。

```shell
composer require symfony/mailgun-mailer symfony/http-client
```

<!-- Next, you will need to make two changes in your application's `config/mail.php` configuration file. First, set your default mailer to `mailgun`: -->
次に、アプリケーションの `config/mail.php` 構成ファイルに 2 つの変更を加える必要があります。まず、デフォルトのメーラーを `mailgun` に設定します。

```php
'default' => env('MAIL_MAILER', 'mailgun'),
```

<!-- Second, add the following configuration array to your array of `mailers`: -->
次に、次の構成配列を `mailers` の配列に追加します。

```php
'mailgun' => [
    'transport' => 'mailgun',
    // 'client' => [
    //     'timeout' => 5,
    // ],
],
```

<!-- After configuring your application's default mailer, add the following options to your `config/services.php` configuration file: -->
アプリケーションのデフォルトのメーラーを構成した後、`config/services.php` 構成ファイルに次のオプションを追加します。

```php
'mailgun' => [
    'domain' => env('MAILGUN_DOMAIN'),
    'secret' => env('MAILGUN_SECRET'),
    'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
    'scheme' => 'https',
],
```

<!-- If you are not using the United States [Mailgun region](https://documentation.mailgun.com/docs/mailgun/api-reference/api-overview#mailgun-regions), you may define your region's endpoint in the `services` configuration file: -->
米国の [Mailgun region](https://documentation.mailgun.com/docs/mailgun/api-reference/api-overview#mailgun-regions) を使用していない場合は、`services` 構成ファイルで地域のエンドポイントを定義できます。

```php
'mailgun' => [
    'domain' => env('MAILGUN_DOMAIN'),
    'secret' => env('MAILGUN_SECRET'),
    'endpoint' => env('MAILGUN_ENDPOINT', 'api.eu.mailgun.net'),
    'scheme' => 'https',
],
```

<a name="postmark-driver"></a>
<!-- #### Postmark Driver -->
#### Postmark Driver

<!-- To use the [Postmark](https://postmarkapp.com/) driver, install Symfony's Postmark Mailer transport via Composer: -->
[Postmark](https://postmarkapp.com/) ドライバを使用するには、Composer 経由で Symfony の Postmark Mailer トランスポートをインストールします。

```shell
composer require symfony/postmark-mailer symfony/http-client
```

<!-- Next, set the `default` option in your application's `config/mail.php` configuration file to `postmark`. After configuring your application's default mailer, ensure that your `config/services.php` configuration file contains the following options: -->
次に、アプリケーションの `config/mail.php` 構成ファイルの `default` オプションを `postmark` に設定します。アプリケーションのデフォルトのメーラーを構成した後、`config/services.php` 構成ファイルに次のオプションが含まれていることを確認してください。

```php
'postmark' => [
    'key' => env('POSTMARK_API_KEY'),
],
```

<!-- If you would like to specify the Postmark message stream that should be used by a given mailer, you may add the `message_stream_id` configuration option to the mailer's configuration array. This configuration array can be found in your application's `config/mail.php` configuration file: -->
特定のメーラーで使用する Postmark メッセージ ストリームを指定したい場合は、メーラーの構成配列に `message_stream_id` 構成オプションを追加できます。この構成配列は、アプリケーションの `config/mail.php` 構成ファイルにあります。

```php
'postmark' => [
    'transport' => 'postmark',
    'message_stream_id' => env('POSTMARK_MESSAGE_STREAM_ID'),
    // 'client' => [
    //     'timeout' => 5,
    // ],
],
```

<!-- This way you are also able to set up multiple Postmark mailers with different message streams. -->
この方法では、異なるメッセージ ストリームを持つ複数の Postmark メーラーを設定することもできます。

<a name="resend-driver"></a>
<!-- #### Resend Driver -->
#### Resend Driver

<!-- To use the [Resend](https://resend.com/) driver, install Resend's PHP SDK via Composer: -->
[Resend](https://resend.com/) ドライバを使用するには、Composer 経由で Resend の PHP SDK をインストールします。

```shell
composer require resend/resend-php
```

<!-- Next, set the `default` option in your application's `config/mail.php` configuration file to `resend`. After configuring your application's default mailer, ensure that your `config/services.php` configuration file contains the following options: -->
次に、アプリケーションの `config/mail.php` 構成ファイルの `default` オプションを `resend` に設定します。アプリケーションのデフォルトのメーラーを構成した後、`config/services.php` 構成ファイルに次のオプションが含まれていることを確認してください。

```php
'resend' => [
    'key' => env('RESEND_API_KEY'),
],
```

<a name="ses-driver"></a>
<!-- #### SES Driver -->
#### SES Driver

<!-- To use the Amazon SES driver you must first install the Amazon AWS SDK for PHP. You may install this library via the Composer package manager: -->
Amazon SES ドライバを使用するには、まず Amazon AWS SDK for PHP をインストールする必要があります。このライブラリは、Composer パッケージ マネージャーを介してインストールできます。

```shell
composer require aws/aws-sdk-php
```

<!-- Next, set the `default` option in your `config/mail.php` configuration file to `ses` and verify that your `config/services.php` configuration file contains the following options: -->
次に、`config/mail.php` 構成ファイルの `default` オプションを `ses` に設定し、`config/services.php` 構成ファイルに次のオプションが含まれていることを確認します。

```php
'ses' => [
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
],
```

<!-- To utilize AWS [temporary credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_use-resources.html) via a session token, you may add a `token` key to your application's SES configuration: -->
セッション トークン経由で AWS [temporary credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_use-resources.html) を利用するには、アプリケーションの SES 設定に `token` キーを追加します。

```php
'ses' => [
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    'token' => env('AWS_SESSION_TOKEN'),
],
```

<!-- To interact with SES's [subscription management features](https://docs.aws.amazon.com/ses/latest/dg/sending-email-subscription-management.html), you may return the `X-Ses-List-Management-Options` header in the array returned by the [headers](#headers) method of a mail message: -->
SES の [subscription management features](https://docs.aws.amazon.com/ses/latest/dg/sending-email-subscription-management.html) と対話するには、メール メッセージの [headers](#headers) メソッドによって返される配列内の `X-Ses-List-Management-Options` ヘッダーを返すことができます。

```php
/**
 * Get the message headers.
 */
public function headers(): Headers
{
    return new Headers(
        text: [
            'X-Ses-List-Management-Options' => 'contactListName=MyContactList;topicName=MyTopic',
        ],
    );
}
```

<!-- To send an email through an SES [tenant](https://docs.aws.amazon.com/ses/latest/dg/tenants.html), you may return the `X-Ses-Tenant-Name` header from the `headers` method. Laravel will pass the header value as the `TenantName` option to SES when sending the message: -->
SES の [tenant](https://docs.aws.amazon.com/ses/latest/dg/tenants.html) 経由でメールを送信するには、`headers` メソッドから `X-Ses-Tenant-Name` ヘッダーを返します。Laravel はメール送信時に、このヘッダーの値を `TenantName` オプションとして SES に渡します。

```php
public function headers(): Headers
{
    return new Headers(
        text: [
            'X-Ses-Tenant-Name' => 'tenant-id',
        ],
    );
}
```

<!-- If you would like to define [additional options](https://docs.aws.amazon.com/aws-sdk-php/v3/api/api-sesv2-2019-09-27.html#sendemail) that Laravel should pass to the AWS SDK's `SendEmail` method when sending an email, you may define an `options` array within your `ses` configuration: -->
電子メールの送信時に Laravel が AWS SDK の `SendEmail` メソッドに渡す [additional options](https://docs.aws.amazon.com/aws-sdk-php/v3/api/api-sesv2-2019-09-27.html#sendemail) を定義したい場合は、`ses` 設定内で `options` 配列を定義できます。

```php
'ses' => [
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    'options' => [
        'ConfigurationSetName' => 'MyConfigurationSet',
        'EmailTags' => [
            ['Name' => 'foo', 'Value' => 'bar'],
        ],
    ],
],
```

<a name="failover-configuration"></a>
<!-- ### Failover Configuration -->
### Failover Configuration

<!-- Sometimes, an external service you have configured to send your application's mail may be down. In these cases, it can be useful to define one or more backup mail delivery configurations that will be used in case your primary delivery driver is down. -->
場合によっては、アプリケーションのメールを送信するように構成した外部サービスがダウンしている可能性があります。このような場合、プライマリ配信ドライバがダウンした場合に使用されるバックアップ メール配信構成を 1 つ以上定義すると便利です。

<!-- To accomplish this, you should define a mailer within your application's `mail` configuration file that uses the `failover` transport. The configuration array for your application's `failover` mailer should contain an array of `mailers` that reference the order in which configured mailers should be chosen for delivery: -->
これを実現するには、アプリケーションの `mail` 構成ファイル内で、`failover` トランスポートを使用するメーラーを定義する必要があります。アプリケーションの `failover` メーラーの構成配列には、構成されたメーラーが配信用に選択される順序を参照する `mailers` の配列が含まれている必要があります。

```php
'mailers' => [
    'failover' => [
        'transport' => 'failover',
        'mailers' => [
            'postmark',
            'mailgun',
            'sendmail',
        ],
        'retry_after' => 60,
    ],

    // ...
],
```

<!-- Once you have configured a mailer that uses the `failover` transport, you will need to set the failover mailer as your default mailer in your application's `.env` file to make use of the failover functionality: -->
`failover` トランスポートを使用するメーラーを構成したら、フェイルオーバー機能を利用するには、アプリケーションの `.env` ファイルでフェイルオーバー メーラーをデフォルトのメーラーとして設定する必要があります。

```ini
MAIL_MAILER=failover
```

<a name="round-robin-configuration"></a>
<!-- ### Round Robin Configuration -->
### Round Robin Configuration

<!-- The `roundrobin` transport allows you to distribute your mailing workload across multiple mailers. To get started, define a mailer within your application's `mail` configuration file that uses the `roundrobin` transport. The configuration array for your application's `roundrobin` mailer should contain an array of `mailers` that reference which configured mailers should be used for delivery: -->
`roundrobin` トランスポートを使用すると、メール送信ワークロードを複数のメーラーに分散できます。まず、アプリケーションの `mail` 構成ファイル内で、`roundrobin` トランスポートを使用するメーラーを定義します。アプリケーションの `roundrobin` メーラーの構成配列には、どの構成メーラーを配信に使用するかを参照する `mailers` の配列が含まれている必要があります。

```php
'mailers' => [
    'roundrobin' => [
        'transport' => 'roundrobin',
        'mailers' => [
            'ses',
            'postmark',
        ],
        'retry_after' => 60,
    ],

    // ...
],
```

<!-- Once your round robin mailer has been defined, you should set this mailer as the default mailer used by your application by specifying its name as the value of the `default` configuration key within your application's `mail` configuration file: -->
ラウンド ロビン メーラーを定義したら、アプリケーションの `mail` 構成ファイル内の `default` 構成キーの値としてその名前を指定することにより、このメーラーをアプリケーションで使用するデフォルトのメーラーとして設定する必要があります。

```php
'default' => env('MAIL_MAILER', 'roundrobin'),
```

<!-- The round robin transport selects a random mailer from the list of configured mailers and then switches to the next available mailer for each subsequent email. In contrast to `failover` transport, which helps to achieve *[high availability](https://en.wikipedia.org/wiki/High_availability)*, the `roundrobin` transport provides *[load balancing](https://en.wikipedia.org/wiki/Load_balancing_(computing))*. -->
ラウンド ロビン トランスポートは、構成されたメーラーのリストからランダムにメーラーを選択し、後続の電子メールごとに次に使用可能なメーラーに切り替えます。 *[high availability](https://en.wikipedia.org/wiki/High_availability)* の実現に役立つ `failover` トランスポートとは対照的に、`roundrobin` トランスポートは *[load balancing](https://en.wikipedia.org/wiki/Load_balancing_(computing))* を提供します。

<a name="generating-mailables"></a>
<!-- ## Generating Mailables -->
## Generating Mailables

<!-- When building Laravel applications, each type of email sent by your application is represented as a "mailable" class. These classes are stored in the `app/Mail` directory. Don't worry if you don't see this directory in your application, since it will be generated for you when you create your first mailable class using the `make:mail` Artisan command: -->
Laravel アプリケーションを構築する場合、アプリケーションによって送信される各種類の電子メールは、「メール可能」クラスとして表されます。これらのクラスは、`app/Mail` ディレクトリに保存されます。アプリケーションにこのディレクトリが表示されなくても心配する必要はありません。このディレクトリは、`make:mail` Artisan コマンドを使用して最初のメール可能クラスを作成するときに生成されるためです。

```shell
php artisan make:mail OrderShipped
```

<a name="writing-mailables"></a>
<!-- ## Writing Mailables -->
## Writing Mailables

<!-- Once you have generated a mailable class, open it up so we can explore its contents. Mailable class configuration is done in several methods, including the `envelope`, `content`, and `attachments` methods. -->
メール可能なクラスを生成したら、そのクラスを開いて、その内容を探索できるようにします。メール可能クラスの構成は、`envelope`、`content`、`attachments` メソッドなど、いくつかのメソッドで行われます。

<!-- The `envelope` method returns an `Illuminate\Mail\Mailables\Envelope` object that defines the subject and, sometimes, the recipients of the message. The `content` method returns an `Illuminate\Mail\Mailables\Content` object that defines the [Blade template](/docs/13.x/blade) that will be used to generate the message content. -->
`envelope` メソッドは、メッセージの件名と、場合によっては受信者を定義する `Illuminate\Mail\Mailables\Envelope` オブジェクトを返します。 `content` メソッドは、メッセージ コンテンツの生成に使用される [Blade template](/docs/13.x/blade) を定義する `Illuminate\Mail\Mailables\Content` オブジェクトを返します。

<a name="configuring-the-sender"></a>
<!-- ### Configuring the Sender -->
### Configuring the Sender

<a name="using-the-envelope"></a>
<!-- #### Using the Envelope -->
#### Using the Envelope

<!-- First, let's explore configuring the sender of the email. Or, in other words, who the email is going to be "from". There are two ways to configure the sender. First, you may specify the "from" address on your message's envelope: -->
まず、電子メールの送信者の構成を見てみましょう。言い換えれば、電子メールの「送信者」が誰になるのかということです。送信者を構成するには 2 つの方法があります。まず、メッセージのエンベロープに「差出人」アドレスを指定します。

```php
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Envelope;

/**
 * Get the message envelope.
 */
public function envelope(): Envelope
{
    return new Envelope(
        from: new Address('jeffrey@example.com', 'Jeffrey Way'),
        subject: 'Order Shipped',
    );
}
```

<!-- If you would like, you may also specify a `replyTo` address: -->
必要に応じて、`replyTo` アドレスを指定することもできます。

```php
return new Envelope(
    from: new Address('jeffrey@example.com', 'Jeffrey Way'),
    replyTo: [
        new Address('taylor@example.com', 'Taylor Otwell'),
    ],
    subject: 'Order Shipped',
);
```

<a name="using-a-global-from-address"></a>
<!-- #### Using a Global `from` Address -->
#### Using a Global `from` Address

<!-- However, if your application uses the same "from" address for all of its emails, it can become cumbersome to add it to each mailable class you generate. Instead, you may specify a global "from" address in your `config/mail.php` configuration file. This address will be used if no other "from" address is specified within the mailable class: -->
ただし、アプリケーションがすべての電子メールに同じ「差出人」アドレスを使用する場合、生成する各メール可能クラスにそのアドレスを追加するのが面倒になる可能性があります。代わりに、`config/mail.php` 構成ファイルでグローバル「送信元」アドレスを指定できます。このアドレスは、メール可能クラス内に他の「差出人」アドレスが指定されていない場合に使用されます。

```php
'from' => [
    'address' => env('MAIL_FROM_ADDRESS', 'hello@example.com'),
    'name' => env('MAIL_FROM_NAME', 'Example'),
],
```

<!-- In addition, you may define a global "reply_to" address within your `config/mail.php` configuration file: -->
さらに、`config/mail.php` 構成ファイル内でグローバル「reply_to」アドレスを定義できます。

```php
'reply_to' => [
    'address' => 'example@example.com',
    'name' => 'App Name',
],
```

<a name="configuring-the-view"></a>
<!-- ### Configuring the View -->
### Configuring the View

<!-- Within a mailable class's `content` method, you may define the `view`, or which template should be used when rendering the email's contents. Since each email typically uses a [Blade template](/docs/13.x/blade) to render its contents, you have the full power and convenience of the Blade templating engine when building your email's HTML: -->
メール可能クラスの `content` メソッド内で、`view`、または電子メールのコンテンツをレンダリングするときに使用するテンプレートを定義できます。通常、各電子メールは [Blade template](/docs/13.x/blade) を使用してコンテンツをレンダリングするため、電子メールの HTML を構築するときに、Blade テンプレート エンジンの能力と利便性を最大限に活用できます。

```php
/**
 * Get the message content definition.
 */
public function content(): Content
{
    return new Content(
        view: 'mail.orders.shipped',
    );
}
```

> [!NOTE]
> すべての電子メール テンプレートを格納する `resources/views/mail` ディレクトリを作成することもできます。ただし、`resources/views` ディレクトリ内のどこにでも自由に配置できます。

<a name="plain-text-emails"></a>
<!-- #### Plain Text Emails -->
#### Plain Text Emails

<!-- If you would like to define a plain-text version of your email, you may specify the plain-text template when creating the message's `Content` definition. Like the `view` parameter, the `text` parameter should be a template name which will be used to render the contents of the email. You are free to define both an HTML and plain-text version of your message: -->
電子メールのプレーンテキスト バージョンを定義したい場合は、メッセージの `Content` 定義を作成するときにプレーンテキスト テンプレートを指定できます。 `view` パラメータと同様に、`text` パラメータは、電子メールのコンテンツをレンダリングするために使用されるテンプレート名である必要があります。メッセージの HTML バージョンとプレーンテキスト バージョンの両方を自由に定義できます。

```php
/**
 * Get the message content definition.
 */
public function content(): Content
{
    return new Content(
        view: 'mail.orders.shipped',
        text: 'mail.orders.shipped-text'
    );
}
```

<!-- For clarity, the `html` parameter may be used as an alias of the `view` parameter: -->
わかりやすくするために、`html` パラメーターは `view` パラメーターのエイリアスとして使用できます。

```php
return new Content(
    html: 'mail.orders.shipped',
    text: 'mail.orders.shipped-text'
);
```

<a name="view-data"></a>
<!-- ### View Data -->
### View Data

<a name="via-public-properties"></a>
<!-- #### Via Public Properties -->
#### Via Public Properties

<!-- Typically, you will want to pass some data to your view that you can utilize when rendering the email's HTML. There are two ways you may make data available to your view. First, any public property defined on your mailable class will automatically be made available to the view. So, for example, you may pass data into your mailable class's constructor and set that data to public properties defined on the class: -->
通常、電子メールの HTML をレンダリングするときに利用できるデータをビューに渡す必要があります。ビューでデータを利用できるようにするには 2 つの方法があります。まず、メール可能クラスで定義されたパブリック プロパティは自動的にビューで利用できるようになります。したがって、たとえば、メール可能クラスのコンストラクターにデータを渡し、そのデータをクラスで定義されたパブリック プロパティに設定できます。

```php
<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Queue\SerializesModels;

class OrderShipped extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public Order $order,
    ) {}

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'mail.orders.shipped',
        );
    }
}
```

<!-- Once the data has been set to a public property, it will automatically be available in your view, so you may access it like you would access any other data in your Blade templates: -->
データがパブリック プロパティに設定されると、そのデータは自動的にビューで使用できるようになり、Blade テンプレート内の他のデータにアクセスするのと同じようにアクセスできます。

```blade
<div>
    Price: {{ $order->price }}
</div>
```

<a name="via-the-with-parameter"></a>
<!-- #### Via the `with` Parameter: -->
#### Via the `with` Parameter:

<!-- If you would like to customize the format of your email's data before it is sent to the template, you may manually pass your data to the view via the `Content` definition's `with` parameter. Typically, you will still pass data via the mailable class's constructor; however, you should set this data to `protected` or `private` properties so the data is not automatically made available to the template: -->
テンプレートに送信される前に電子メールのデータの形式をカスタマイズしたい場合は、`Content` 定義の `with` パラメーターを介してデータをビューに手動で渡すことができます。通常は、メール可能クラスのコンストラクターを介してデータを渡します。ただし、データがテンプレートで自動的に使用可能にならないように、このデータを `protected` または `private` プロパティに設定する必要があります。

```php
<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Queue\SerializesModels;

class OrderShipped extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        protected Order $order,
    ) {}

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'mail.orders.shipped',
            with: [
                'orderName' => $this->order->name,
                'orderPrice' => $this->order->price,
            ],
        );
    }
}
```

<!-- Once the data has been passed via the `with` parameter, it will automatically be available in your view, so you may access it like you would access any other data in your Blade templates: -->
データが `with` パラメーターを介して渡されると、そのデータはビューで自動的に使用可能になるため、Blade テンプレート内の他のデータにアクセスするのと同じようにアクセスできます。

```blade
<div>
    Price: {{ $orderPrice }}
</div>
```

<a name="attachments"></a>
<!-- ### Attachments -->
### Attachments

<!-- To add attachments to an email, you will add attachments to the array returned by the message's `attachments` method. First, you may add an attachment by providing a file path to the `fromPath` method provided by the `Attachment` class: -->
電子メールに添付ファイルを追加するには、メッセージの `attachments` メソッドによって返される配列に添付ファイルを追加します。まず、`Attachment` クラスによって提供される `fromPath` メソッドにファイル パスを指定して、添付ファイルを追加できます。

```php
use Illuminate\Mail\Mailables\Attachment;

/**
 * Get the attachments for the message.
 *
 * @return array<int, \Illuminate\Mail\Mailables\Attachment>
 */
public function attachments(): array
{
    return [
        Attachment::fromPath('/path/to/file'),
    ];
}
```

<!-- When attaching files to a message, you may also specify the display name and / or MIME type for the attachment using the `as` and `withMime` methods: -->
メッセージにファイルを添付する場合、`as` および `withMime` メソッドを使用して、添付ファイルの表示名や MIME タイプを指定することもできます。

```php
/**
 * Get the attachments for the message.
 *
 * @return array<int, \Illuminate\Mail\Mailables\Attachment>
 */
public function attachments(): array
{
    return [
        Attachment::fromPath('/path/to/file')
            ->as('name.pdf')
            ->withMime('application/pdf'),
    ];
}
```

<a name="attaching-files-from-disk"></a>
<!-- #### Attaching Files From Disk -->
#### Attaching Files From Disk

<!-- If you have stored a file on one of your [filesystem disks](/docs/13.x/filesystem), you may attach it to the email using the `fromStorage` attachment method: -->
[filesystem disks](/docs/13.x/filesystem) のいずれかにファイルを保存している場合は、`fromStorage` 添付方法を使用してそのファイルを電子メールに添付できます。

```php
/**
 * Get the attachments for the message.
 *
 * @return array<int, \Illuminate\Mail\Mailables\Attachment>
 */
public function attachments(): array
{
    return [
        Attachment::fromStorage('/path/to/file'),
    ];
}
```

<!-- Of course, you may also specify the attachment's name and MIME type: -->
もちろん、添付ファイルの名前と MIME タイプを指定することもできます。

```php
/**
 * Get the attachments for the message.
 *
 * @return array<int, \Illuminate\Mail\Mailables\Attachment>
 */
public function attachments(): array
{
    return [
        Attachment::fromStorage('/path/to/file')
            ->as('name.pdf')
            ->withMime('application/pdf'),
    ];
}
```

<!-- The `fromStorageDisk` method may be used if you need to specify a storage disk other than your default disk: -->
デフォルトのディスク以外のストレージ ディスクを指定する必要がある場合は、`fromStorageDisk` メソッドを使用できます。

```php
/**
 * Get the attachments for the message.
 *
 * @return array<int, \Illuminate\Mail\Mailables\Attachment>
 */
public function attachments(): array
{
    return [
        Attachment::fromStorageDisk('s3', '/path/to/file')
            ->as('name.pdf')
            ->withMime('application/pdf'),
    ];
}
```

<a name="raw-data-attachments"></a>
<!-- #### Raw Data Attachments -->
#### Raw Data Attachments

<!-- The `fromData` attachment method may be used to attach a raw string of bytes as an attachment. For example, you might use this method if you have generated a PDF in memory and want to attach it to the email without writing it to disk. The `fromData` method accepts a closure which resolves the raw data bytes as well as the name that the attachment should be assigned: -->
`fromData` 添付メソッドを使用して、生のバイト文字列を添付ファイルとして添付できます。たとえば、メモリ内に PDF を生成し、それをディスクに書き込まずに電子メールに添付したい場合は、この方法を使用できます。 `fromData` メソッドは、生データ バイトと添付ファイルに割り当てる名前を解決するクロージャを受け入れます。

```php
/**
 * Get the attachments for the message.
 *
 * @return array<int, \Illuminate\Mail\Mailables\Attachment>
 */
public function attachments(): array
{
    return [
        Attachment::fromData(fn () => $this->pdf, 'Report.pdf')
            ->withMime('application/pdf'),
    ];
}
```

<a name="inline-attachments"></a>
<!-- ### Inline Attachments -->
### Inline Attachments

<!-- Embedding inline images into your emails is typically cumbersome; however, Laravel provides a convenient way to attach images to your emails. To embed an inline image, use the `embed` method on the `$message` variable within your email template. Laravel automatically makes the `$message` variable available to all of your email templates, so you don't need to worry about passing it in manually: -->
通常、電子メールにインライン画像を埋め込むのは面倒です。ただし、Laravel では、メールに画像を添付する便利な方法が提供されています。インライン画像を埋め込むには、電子メール テンプレート内の `$message` 変数で `embed` メソッドを使用します。 Laravel は自動的に `$message` 変数をすべての電子メール テンプレートで利用できるようにするため、手動で渡すことを心配する必要はありません。

```blade
<body>
    Here is an image:

    <img src="{{ $message->embed($pathToImage) }}">
</body>
```

> [!WARNING]
> プレーン テキスト メッセージはインライン添付ファイルを利用しないため、`$message` 変数はプレーン テキスト メッセージ テンプレートでは使用できません。

<a name="embedding-raw-data-attachments"></a>
<!-- #### Embedding Raw Data Attachments -->
#### Embedding Raw Data Attachments

<!-- If you already have a raw image data string you wish to embed into an email template, you may call the `embedData` method on the `$message` variable. When calling the `embedData` method, you will need to provide a filename that should be assigned to the embedded image: -->
電子メール テンプレートに埋め込みたい生の画像データ文字列が既にある場合は、`$message` 変数で `embedData` メソッドを呼び出すことができます。 `embedData` メソッドを呼び出すときは、埋め込み画像に割り当てるファイル名を指定する必要があります。

```blade
<body>
    Here is an image from raw data:

    <img src="{{ $message->embedData($data, 'example-image.jpg') }}">
</body>
```

<a name="attachable-objects"></a>
<!-- ### Attachable Objects -->
### Attachable Objects

<!-- While attaching files to messages via simple string paths is often sufficient, in many cases the attachable entities within your application are represented by classes. For example, if your application is attaching a photo to a message, your application may also have a `Photo` model that represents that photo. When that is the case, wouldn't it be convenient to simply pass the `Photo` model to the `attach` method? Attachable objects allow you to do just that. -->
多くの場合、単純な文字列パスを介してメッセージにファイルを添付するだけで十分ですが、多くの場合、アプリケーション内の添付可能なエンティティはクラスによって表されます。たとえば、アプリケーションがメッセージに写真を添付し​​ている場合、アプリケーションにはその写真を表す `Photo` モデルも含まれる可能性があります。その場合、`Photo` モデルを `attach` メソッドに渡すだけで便利ではないでしょうか。アタッチ可能なオブジェクトを使用すると、まさにそれが可能になります。

<!-- To get started, implement the `Illuminate\Contracts\Mail\Attachable` interface on the object that will be attachable to messages. This interface dictates that your class defines a `toMailAttachment` method that returns an `Illuminate\Mail\Attachment` instance: -->
まず、メッセージに添付できるオブジェクトに `Illuminate\Contracts\Mail\Attachable` インターフェイスを実装します。このインターフェイスは、クラスが `Illuminate\Mail\Attachment` インスタンスを返す `toMailAttachment` メソッドを定義することを指示します。

```php
<?php

namespace App\Models;

use Illuminate\Contracts\Mail\Attachable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Mail\Attachment;

class Photo extends Model implements Attachable
{
    /**
     * Get the attachable representation of the model.
     */
    public function toMailAttachment(): Attachment
    {
        return Attachment::fromPath('/path/to/file');
    }
}
```

<!-- Once you have defined your attachable object, you may return an instance of that object from the `attachments` method when building an email message: -->
添付可能なオブジェクトを定義したら、電子メール メッセージを作成するときに `attachments` メソッドからそのオブジェクトのインスタンスを返すことができます。

```php
/**
 * Get the attachments for the message.
 *
 * @return array<int, \Illuminate\Mail\Mailables\Attachment>
 */
public function attachments(): array
{
    return [$this->photo];
}
```

<!-- Of course, attachment data may be stored on a remote file storage service such as Amazon S3. So, Laravel also allows you to generate attachment instances from data that is stored on one of your application's [filesystem disks](/docs/13.x/filesystem): -->
もちろん、添付データは Amazon S3 などのリモート ファイルストレージ サービスに保存される場合があります。したがって、Laravel では、アプリケーションの [filesystem disks](/docs/13.x/filesystem) の 1 つに保存されているデータから添付ファイル インスタンスを生成することもできます。

```php
// Create an attachment from a file on your default disk...
return Attachment::fromStorage($this->path);

// Create an attachment from a file on a specific disk...
return Attachment::fromStorageDisk('backblaze', $this->path);
```

<!-- In addition, you may create attachment instances via data that you have in memory. To accomplish this, provide a closure to the `fromData` method. The closure should return the raw data that represents the attachment: -->
さらに、メモリ内にあるデータを使用して添付ファイルのインスタンスを作成することもできます。これを実現するには、`fromData` メソッドにクロージャーを提供します。クロージャは添付ファイルを表す生データを返す必要があります。

```php
return Attachment::fromData(fn () => $this->content, 'Photo Name');
```

<!-- Laravel also provides additional methods that you may use to customize your attachments. For example, you may use the `as` and `withMime` methods to customize the file's name and MIME type: -->
Laravel は、添付ファイルをカスタマイズするために使用できる追加のメソッドも提供します。たとえば、`as` メソッドと `withMime` メソッドを使用して、ファイル名と MIME タイプをカスタマイズできます。

```php
return Attachment::fromPath('/path/to/file')
    ->as('Photo Name')
    ->withMime('image/jpeg');
```

<a name="headers"></a>
<!-- ### Headers -->
### Headers

<!-- Sometimes you may need to attach additional headers to the outgoing message. For instance, you may need to set a custom `Message-Id` or other arbitrary text headers. -->
場合によっては、送信メッセージに追加のヘッダーを添付する必要がある場合があります。たとえば、カスタム `Message-Id` またはその他の任意のテキスト ヘッダーを設定する必要がある場合があります。

<!-- To accomplish this, define a `headers` method on your mailable. The `headers` method should return an `Illuminate\Mail\Mailables\Headers` instance. This class accepts `messageId`, `references`, and `text` parameters. Of course, you may provide only the parameters you need for your particular message: -->
これを実現するには、メール可能ファイルで `headers` メソッドを定義します。 `headers` メソッドは、`Illuminate\Mail\Mailables\Headers` インスタンスを返す必要があります。このクラスは、`messageId`、`references`、および `text` パラメーターを受け入れます。もちろん、特定のメッセージに必要なパラメータのみを指定することもできます。

```php
use Illuminate\Mail\Mailables\Headers;

/**
 * Get the message headers.
 */
public function headers(): Headers
{
    return new Headers(
        messageId: 'custom-message-id@example.com',
        references: ['previous-message@example.com'],
        text: [
            'X-Custom-Header' => 'Custom Value',
        ],
    );
}
```

<a name="tags-and-metadata"></a>
<!-- ### Tags and Metadata -->
### Tags and Metadata

<!-- Some third-party email providers such as Mailgun and Postmark support message "tags" and "metadata", which may be used to group and track emails sent by your application. You may add tags and metadata to an email message via your `Envelope` definition: -->
Mailgun や Postmark などの一部のサードパーティ電子メール プロバイダは、メッセージの「タグ」と「メタデータ」をサポートしています。これらは、アプリケーションによって送信された電子メールをグループ化し、追跡するために使用される場合があります。 `Envelope` 定義を使用して、電子メール メッセージにタグとメタデータを追加できます。

```php
use Illuminate\Mail\Mailables\Envelope;

/**
 * Get the message envelope.
 *
 * @return \Illuminate\Mail\Mailables\Envelope
 */
public function envelope(): Envelope
{
    return new Envelope(
        subject: 'Order Shipped',
        tags: ['shipment'],
        metadata: [
            'order_id' => $this->order->id,
        ],
    );
}
```

<!-- If your application is using the Mailgun driver, you may consult Mailgun's documentation for more information on [tags](https://documentation.mailgun.com/docs/mailgun/user-manual/tracking-messages/#tags) and [metadata](https://documentation.mailgun.com/docs/mailgun/user-manual/sending-messages/#attaching-metadata-to-messages). Likewise, the Postmark documentation may also be consulted for more information on their support for [tags](https://postmarkapp.com/blog/tags-support-for-smtp) and [metadata](https://postmarkapp.com/support/article/1125-custom-metadata-faq). -->
アプリケーションが Mailgun ドライバを使用している場合、[tags](https://documentation.mailgun.com/docs/mailgun/user-manual/tracking-messages/#tags) および [metadata](https://documentation.mailgun.com/docs/mailgun/user-manual/sending-messages/#attaching-metadata-to-messages) の詳細については、Mailgun のドキュメントを参照してください。同様に、[tags](https://postmarkapp.com/blog/tags-support-for-smtp) および [metadata](https://postmarkapp.com/support/article/1125-custom-metadata-faq) のサポートの詳細については、Postmark のドキュメントを参照することもできます。

<!-- If your application is using Amazon SES to send emails, you should use the `metadata` method to attach [SES "tags"](https://docs.aws.amazon.com/ses/latest/APIReference/API_MessageTag.html) to the message. -->
アプリケーションが Amazon SES を使用して E メールを送信している場合は、`metadata` メソッドを使用してメッセージに [SES "tags"](https://docs.aws.amazon.com/ses/latest/APIReference/API_MessageTag.html) を添付する必要があります。

<a name="customizing-the-symfony-message"></a>
<!-- ### Customizing the Symfony Message -->
### Customizing the Symfony Message

<!-- Laravel's mail capabilities are powered by Symfony Mailer. Laravel allows you to register custom callbacks that will be invoked with the Symfony Message instance before sending the message. This gives you an opportunity to deeply customize the message before it is sent. To accomplish this, define a `using` parameter on your `Envelope` definition: -->
Laravel のメール機能は Symfony Mailer によって強化されています。 Laravel では、メッセージを送信する前に Symfony Message インスタンスで呼び出されるカスタム コールバックを登録できます。これにより、メッセージを送信する前にメッセージを詳細にカスタマイズする機会が得られます。これを実現するには、`Envelope` 定義で `using` パラメータを定義します。

```php
use Illuminate\Mail\Mailables\Envelope;
use Symfony\Component\Mime\Email;

/**
 * Get the message envelope.
 */
public function envelope(): Envelope
{
    return new Envelope(
        subject: 'Order Shipped',
        using: [
            function (Email $message) {
                // ...
            },
        ]
    );
}
```

<a name="markdown-mailables"></a>
<!-- ## Markdown Mailables -->
## Markdown Mailables

<!-- Markdown mailable messages allow you to take advantage of the pre-built templates and components of [mail notifications](/docs/13.x/notifications#mail-notifications) in your mailables. Since the messages are written in Markdown, Laravel is able to render beautiful, responsive HTML templates for the messages while also automatically generating a plain-text counterpart. -->
マークダウンのメール可能メッセージを使用すると、メール可能メッセージで事前に構築されたテンプレートと [mail notifications](/docs/13.x/notifications#mail-notifications) のコンポーネントを利用できます。メッセージは Markdown で記述されているため、Laravel はメッセージ用の美しく応答性の高い HTML テンプレートをレンダリングできると同時に、対応するプレーンテキストも自動的に生成します。

<a name="generating-markdown-mailables"></a>
<!-- ### Generating Markdown Mailables -->
### Generating Markdown Mailables

<!-- To generate a mailable with a corresponding Markdown template, you may use the `--markdown` option of the `make:mail` Artisan command: -->
対応する Markdown テンプレートを使用してメール可能ファイルを生成するには、`make:mail` Artisan コマンドの `--markdown` オプションを使用できます。

```shell
php artisan make:mail OrderShipped --markdown=mail.orders.shipped
```

<!-- Then, when configuring the mailable `Content` definition within its `content` method, use the `markdown` parameter instead of the `view` parameter: -->
次に、`content` メソッド内でメール可能な `Content` 定義を構成するときに、`view` パラメーターの代わりに `markdown` パラメーターを使用します。

```php
use Illuminate\Mail\Mailables\Content;

/**
 * Get the message content definition.
 */
public function content(): Content
{
    return new Content(
        markdown: 'mail.orders.shipped',
        with: [
            'url' => $this->orderUrl,
        ],
    );
}
```

<a name="writing-markdown-messages"></a>
<!-- ### Writing Markdown Messages -->
### Writing Markdown Messages

<!-- Markdown mailables use a combination of Blade components and Markdown syntax which allow you to easily construct mail messages while leveraging Laravel's pre-built email UI components: -->
Markdown メール可能ファイルは、Blade コンポーネントと Markdown 構文の組み合わせを使用するため、Laravel の事前構築済み電子メール UI コンポーネントを活用しながら、メール メッセージを簡単に作成できます。

```blade
<x-mail::message>
# Order Shipped

Your order has been shipped!

<x-mail::button :url="$url">
View Order
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

<!-- The button component renders a centered button link. The component accepts two arguments, a `url` and an optional `color`. Supported colors are `primary`, `success`, and `error`. You may add as many button components to a message as you wish: -->
ボタン コンポーネントは、中央にボタン リンクをレンダリングします。このコンポーネントは、`url` とオプションの `color` の 2 つの引数を受け入れます。サポートされている色は、`primary`、`success`、および `error` です。ボタン コンポーネントは必要なだけメッセージに追加できます。

```blade
<x-mail::button :url="$url" color="success">
View Order
</x-mail::button>
```

<a name="panel-component"></a>
<!-- #### Panel Component -->
#### Panel Component

<!-- The panel component renders the given block of text in a panel that has a slightly different background color than the rest of the message. This allows you to draw attention to a given block of text: -->
パネル コンポーネントは、メッセージの残りの部分とはわずかに異なる背景色を持つパネルに指定されたテキスト ブロックをレンダリングします。これにより、特定のテキスト ブロックに注意を向けることができます。

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

<!-- You may export all of the Markdown mail components to your own application for customization. To export the components, use the `vendor:publish` Artisan command to publish the `laravel-mail` asset tag: -->
すべての Markdown メール コンポーネントを独自のアプリケーションにエクスポートしてカスタマイズできます。コンポーネントをエクスポートするには、`vendor:publish` Artisan コマンドを使用して、`laravel-mail` アセット タグを公開します。

```shell
php artisan vendor:publish --tag=laravel-mail
```

<!-- This command will publish the Markdown mail components to the `resources/views/vendor/mail` directory. The `mail` directory will contain an `html` and a `text` directory, each containing their respective representations of every available component. You are free to customize these components however you like. -->
このコマンドは、Markdown メール コンポーネントを `resources/views/vendor/mail` ディレクトリに公開します。 `mail` ディレクトリには、`html` ディレクトリと `text` ディレクトリが含まれ、それぞれに使用可能なすべてのコンポーネントのそれぞれの表現が含まれます。これらのコンポーネントは自由にカスタマイズできます。

<a name="customizing-the-css"></a>
<!-- #### Customizing the CSS -->
#### Customizing the CSS

<!-- After exporting the components, the `resources/views/vendor/mail/html/themes` directory will contain a `default.css` file. You may customize the CSS in this file and your styles will automatically be converted to inline CSS styles within the HTML representations of your Markdown mail messages. -->
コンポーネントをエクスポートすると、`resources/views/vendor/mail/html/themes` ディレクトリに `default.css` ファイルが含まれます。このファイル内の CSS をカスタマイズすると、スタイルは Markdown メール メッセージの HTML 表現内のインライン CSS スタイルに自動的に変換されます。

<!-- If you would like to build an entirely new theme for Laravel's Markdown components, you may place a CSS file within the `html/themes` directory. After naming and saving your CSS file, update the `theme` option of your application's `config/mail.php` configuration file to match the name of your new theme. -->
Laravel の Markdown コンポーネント用にまったく新しいテーマを構築したい場合は、CSS ファイルを `html/themes` ディレクトリ内に配置できます。 CSS ファイルに名前を付けて保存した後、アプリケーションの `config/mail.php` 構成ファイルの `theme` オプションを新しいテーマの名前と一致するように更新します。

<!-- To customize the theme for an individual mailable, you may set the `$theme` property of the mailable class to the name of the theme that should be used when sending that mailable. -->
個々のメール可能ファイルのテーマをカスタマイズするには、メール可能クラスの `$theme` プロパティを、そのメール可能ファイルの送信時に使用するテーマの名前に設定します。

<a name="sending-mail"></a>
<!-- ## Sending Mail -->
## Sending Mail

<!-- To send a message, use the `to` method on the `Mail` [facade](/docs/13.x/facades). The `to` method accepts an email address, a user instance, or a collection of users. If you pass an object or collection of objects, the mailer will automatically use their `email` and `name` properties when determining the email's recipients, so make sure these attributes are available on your objects. Once you have specified your recipients, you may pass an instance of your mailable class to the `send` method: -->
メッセージを送信するには、`Mail` [facade](/docs/13.x/facades) で `to` メソッドを使用します。 `to` メソッドは、電子メール アドレス、ユーザー インスタンス、またはユーザーのコレクションを受け入れます。オブジェクトまたはオブジェクトのコレクションを渡す場合、メーラーは電子メールの受信者を決定するときに `email` および `name` プロパティを自動的に使用するため、これらの属性がオブジェクトで使用できることを確認してください。受信者を指定したら、メール可能クラスのインスタンスを `send` メソッドに渡すことができます。

```php
<?php

namespace App\Http\Controllers;

use App\Mail\OrderShipped;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class OrderShipmentController extends Controller
{
    /**
     * Ship the given order.
     */
    public function store(Request $request): RedirectResponse
    {
        $order = Order::findOrFail($request->order_id);

        // Ship the order...

        Mail::to($request->user())->send(new OrderShipped($order));

        return redirect('/orders');
    }
}
```

<!-- You are not limited to just specifying the "to" recipients when sending a message. You are free to set "to", "cc", and "bcc" recipients by chaining their respective methods together: -->
メッセージを送信するときは、受信者の「宛先」を指定するだけではありません。それぞれのメソッドを連鎖させることで、「to」、「cc」、「bcc」の受信者を自由に設定できます。

```php
Mail::to($request->user())
    ->cc($moreUsers)
    ->bcc($evenMoreUsers)
    ->send(new OrderShipped($order));
```

<a name="looping-over-recipients"></a>
<!-- #### Looping Over Recipients -->
#### Looping Over Recipients

<!-- Occasionally, you may need to send a mailable to a list of recipients by iterating over an array of recipients / email addresses. However, since the `to` method appends email addresses to the mailable's list of recipients, each iteration through the loop will send another email to every previous recipient. Therefore, you should always re-create the mailable instance for each recipient: -->
場合によっては、受信者/電子メール アドレスの配列を反復処理して、受信者のリストにメール可能ファイルを送信する必要がある場合があります。ただし、`to` メソッドは電子メール アドレスをメール可能受信者のリストに追加するため、ループを繰り返すたびに、前のすべての受信者に別の電子メールが送信されます。したがって、受信者ごとにメール可能インスタンスを常に再作成する必要があります。

```php
foreach (['taylor@example.com', 'dries@example.com'] as $recipient) {
    Mail::to($recipient)->send(new OrderShipped($order));
}
```

<a name="sending-mail-via-a-specific-mailer"></a>
<!-- #### Sending Mail via a Specific Mailer -->
#### Sending Mail via a Specific Mailer

<!-- By default, Laravel will send email using the mailer configured as the `default` mailer in your application's `mail` configuration file. However, you may use the `mailer` method to send a message using a specific mailer configuration: -->
デフォルトでは、Laravel はアプリケーションの `mail` 設定ファイルで `default` メーラーとして設定されたメーラーを使用して電子メールを送信します。ただし、`mailer` メソッドを使用して、特定のメーラー構成を使用してメッセージを送信することもできます。

```php
Mail::mailer('postmark')
    ->to($request->user())
    ->send(new OrderShipped($order));
```

<a name="queueing-mail"></a>
<!-- ### Queueing Mail -->
### Queueing Mail

<a name="queueing-a-mail-message"></a>
<!-- #### Queueing a Mail Message -->
#### Queueing a Mail Message

<!-- Since sending email messages can negatively impact the response time of your application, many developers choose to queue email messages for background sending. Laravel makes this easy using its built-in [unified queue API](/docs/13.x/queues). To queue a mail message, use the `queue` method on the `Mail` facade after specifying the message's recipients: -->
電子メール メッセージの送信はアプリケーションの応答時間に悪影響を与える可能性があるため、多くの開発者はバックグラウンド送信のために電子メール メッセージをキューに入れることを選択します。 Laravel では、組み込みの [unified queue API](/docs/13.x/queues) を使用してこれを簡単に実行できます。メール メッセージをキューに入れるには、メッセージの受信者を指定した後、`Mail` ファサードで `queue` メソッドを使用します。

```php
Mail::to($request->user())
    ->cc($moreUsers)
    ->bcc($evenMoreUsers)
    ->queue(new OrderShipped($order));
```

<!-- This method will automatically take care of pushing a job onto the queue so the message is sent in the background. You will need to [configure your queues](/docs/13.x/queues) before using this feature. -->
このメソッドは、ジョブをキューにプッシュする処理を自動的に処理するため、メッセージはバックグラウンドで送信されます。この機能を使用する前に、[configure your queues](/docs/13.x/queues) する必要があります。

<a name="delayed-message-queueing"></a>
<!-- #### Delayed Message Queueing -->
#### Delayed Message Queueing

<!-- If you wish to delay the delivery of a queued email message, you may use the `later` method. As its first argument, the `later` method accepts a `DateTime` instance indicating when the message should be sent: -->
キューに入れられた電子メール メッセージの配信を遅らせたい場合は、`later` メソッドを使用できます。 `later` メソッドは、最初の引数として、メッセージをいつ送信するかを示す `DateTime` インスタンスを受け取ります。

```php
Mail::to($request->user())
    ->cc($moreUsers)
    ->bcc($evenMoreUsers)
    ->later(now()->plus(minutes: 10), new OrderShipped($order));
```

<a name="pushing-to-specific-queues"></a>
<!-- #### Pushing to Specific Queues -->
#### Pushing to Specific Queues

<!-- Since all mailable classes generated using the `make:mail` command make use of the `Illuminate\Bus\Queueable` trait, you may call the `onQueue` and `onConnection` methods on any mailable class instance, allowing you to specify the connection and queue name for the message: -->
`make:mail` コマンドを使用して生成されたすべてのメール可能クラスは `Illuminate\Bus\Queueable` 特性を利用するため、任意のメール可能クラス インスタンスで `onQueue` メソッドと `onConnection` メソッドを呼び出して、メッセージの接続とキュー名を指定できます。

```php
$message = (new OrderShipped($order))
    ->onConnection('sqs')
    ->onQueue('emails');

Mail::to($request->user())
    ->cc($moreUsers)
    ->bcc($evenMoreUsers)
    ->queue($message);
```

<!-- Alternatively, you may specify the connection and queue using the `Connection` and `Queue` attributes on the mailable class: -->
または、メール可能クラスで `Connection` 属性と `Queue` 属性を使用して、接続とキューを指定することもできます。

```php
use Illuminate\Queue\Attributes\Connection;
use Illuminate\Queue\Attributes\Queue;

#[Connection('sqs')]
#[Queue('emails')]
class OrderShipped extends Mailable
{
    // ...
}
```

<a name="queueing-by-default"></a>
<!-- #### Queueing by Default -->
#### Queueing by Default

<!-- If you have mailable classes that you want to always be queued, you may implement the `ShouldQueue` contract on the class. Now, even if you call the `send` method when mailing, the mailable will still be queued since it implements the contract: -->
常にキューに入れておきたいメール可能なクラスがある場合は、そのクラスに `ShouldQueue` コントラクトを実装できます。ここで、メール送信時に `send` メソッドを呼び出したとしても、メール可能ファイルはコントラクトを実装しているため、引き続きキューに入れられます。

```php
use Illuminate\Contracts\Queue\ShouldQueue;

class OrderShipped extends Mailable implements ShouldQueue
{
    // ...
}
```

<a name="queued-mailables-and-database-transactions"></a>
<!-- #### Queued Mailables and Database Transactions -->
#### Queued Mailables and Database Transactions

<!-- When queued mailables are dispatched within database transactions, they may be processed by the queue before the database transaction has committed. When this happens, any updates you have made to models or database records during the database transaction may not yet be reflected in the database. In addition, any models or database records created within the transaction may not exist in the database. If your mailable depends on these models, unexpected errors can occur when the job that sends the queued mailable is processed. -->
キューに入れられたメール可能ファイルがデータベース トランザクション内でディスパッチされると、データベース トランザクションがコミットされる前にキューによって処理される可能性があります。この問題が発生すると、データベース トランザクション中にモデルまたはデータベース レコードに対して行った更新がまだデータベースに反映されていない可能性があります。さらに、トランザクション内で作成されたモデルやデータベース レコードはデータベースに存在しない可能性があります。メール可能ファイルがこれらのモデルに依存している場合、キューに入れられたメール可能ファイルを送信するジョブの処理時に予期しないエラーが発生する可能性があります。

<!-- If your queue connection's `after_commit` configuration option is set to `false`, you may still indicate that a particular queued mailable should be dispatched after all open database transactions have been committed by calling the `afterCommit` method when sending the mail message: -->
キュー接続の `after_commit` 構成オプションが `false` に設定されている場合でも、メール メッセージの送信時に `afterCommit` メソッドを呼び出して、開いているすべてのデータベース トランザクションがコミットされた後に特定のキューに入れられたメール可能ファイルをディスパッチする必要があることを指定できます。

```php
Mail::to($request->user())->send(
    (new OrderShipped($order))->afterCommit()
);
```

<!-- Alternatively, you may call the `afterCommit` method from your mailable's constructor: -->
あるいは、メール可能ファイルのコンストラクターから `afterCommit` メソッドを呼び出すこともできます。

```php
<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OrderShipped extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct()
    {
        $this->afterCommit();
    }
}
```

> [!NOTE]
> これらの問題の回避方法の詳細については、[queued jobs and database transactions](/docs/13.x/queues#jobs-and-database-transactions) に関するドキュメントを参照してください。

<a name="queued-email-failures"></a>
<!-- #### Queued Email Failures -->
#### Queued Email Failures

<!-- When a queued email fails, the `failed` method on the queued mailable class will be invoked if it has been defined. The `Throwable` instance that caused the queued email to fail will be passed to the `failed` method: -->
キューに入れられた電子メールが失敗すると、キューに入れられたメール可能クラスの `failed` メソッドが定義されている場合は呼び出されます。キューに入れられた電子メールの失敗の原因となった `Throwable` インスタンスは、`failed` メソッドに渡されます。

```php
<?php

namespace App\Mail;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Throwable;

class OrderDelayed extends Mailable implements ShouldQueue
{
    use SerializesModels;

    /**
     * Handle a queued email's failure.
     */
    public function failed(Throwable $exception): void
    {
        // ...
    }
}
```

<a name="rendering-mailables"></a>
<!-- ## Rendering Mailables -->
## Rendering Mailables

<!-- Sometimes you may wish to capture the HTML content of a mailable without sending it. To accomplish this, you may call the `render` method of the mailable. This method will return the evaluated HTML content of the mailable as a string: -->
メール可能ファイルを送信せずに、その HTML コンテンツをキャプチャしたい場合があります。これを実現するには、メール可能ファイルの `render` メソッドを呼び出します。このメソッドは、メール可能ファイルの評価された HTML コンテンツを文字列として返します。

```php
use App\Mail\InvoicePaid;
use App\Models\Invoice;

$invoice = Invoice::find(1);

return (new InvoicePaid($invoice))->render();
```

<a name="previewing-mailables-in-the-browser"></a>
<!-- ### Previewing Mailables in the Browser -->
### Previewing Mailables in the Browser

<!-- When designing a mailable's template, it is convenient to quickly preview the rendered mailable in your browser like a typical Blade template. For this reason, Laravel allows you to return any mailable directly from a route closure or controller. When a mailable is returned, it will be rendered and displayed in the browser, allowing you to quickly preview its design without needing to send it to an actual email address: -->
メール可能ファイルのテンプレートを設計する場合、一般的な Blade テンプレートと同様に、レンダリングされたメール可能ファイルをブラウザーですばやくプレビューできると便利です。このため、Laravel では、ルート クロージャーまたはコントローラから直接メール可能ファイルを返すことができます。メール可能ファイルが返されると、レンダリングされてブラウザに表示されるため、実際の電子メール アドレスに送信しなくても、そのデザインをすばやくプレビューできます。

```php
Route::get('/mailable', function () {
    $invoice = App\Models\Invoice::find(1);

    return new App\Mail\InvoicePaid($invoice);
});
```

<a name="localizing-mailables"></a>
<!-- ## Localizing Mailables -->
## Localizing Mailables

<!-- Laravel allows you to send mailables in a locale other than the request's current locale, and will even remember this locale if the mail is queued. -->
Laravel では、リクエストの現在のロケール以外のロケールでメール可能ファイルを送信することができ、メールがキューに入れられている場合でもこのロケールを記憶します。

<!-- To accomplish this, the `Mail` facade offers a `locale` method to set the desired language. The application will change into this locale when the mailable's template is being evaluated and then revert back to the previous locale when evaluation is complete: -->
これを実現するために、`Mail` ファサードは、希望の言語を設定するための `locale` メソッドを提供します。アプリケーションは、メール可能テンプレートの評価中にこのロケールに変更され、評価が完了すると前のロケールに戻ります。

```php
Mail::to($request->user())->locale('es')->send(
    new OrderShipped($order)
);
```

<a name="user-preferred-locales"></a>
<!-- #### User Preferred Locales -->
#### User Preferred Locales

<!-- Sometimes, applications store each user's preferred locale. By implementing the `HasLocalePreference` contract on one or more of your models, you may instruct Laravel to use this stored locale when sending mail: -->
場合によっては、アプリケーションが各ユーザーの優先ロケールを保存することがあります。 1 つ以上のモデルに `HasLocalePreference` コントラクトを実装することで、メール送信時にこの保存されたロケールを使用するように Laravel に指示できます。

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

<!-- Once you have implemented the interface, Laravel will automatically use the preferred locale when sending mailables and notifications to the model. Therefore, there is no need to call the `locale` method when using this interface: -->
インターフェースを実装すると、Laravel はメール可能ファイルや通知をモデルに送信するときに優先ロケールを自動的に使用します。したがって、このインターフェイスを使用する場合は、`locale` メソッドを呼び出す必要はありません。

```php
Mail::to($request->user())->send(new OrderShipped($order));
```

<a name="testing-mailables"></a>
<!-- ## Testing -->
## Testing

<a name="testing-mailable-content"></a>
<!-- ### Testing Mailable Content -->
### Testing Mailable Content

<!-- Laravel provides a variety of methods for inspecting your mailable's structure. In addition, Laravel provides several convenient methods for testing that your mailable contains the content that you expect: -->
Laravel は、メーラブルの構造を検査するためのさまざまな方法を提供します。さらに、Laravel には、メール可能ファイルに期待するコンテンツが含まれているかどうかをテストするための便利な方法がいくつか用意されています。

```php tab=Pest
use App\Mail\InvoicePaid;
use App\Models\User;

test('mailable content', function () {
    $user = User::factory()->create();

    $mailable = new InvoicePaid($user);

    $mailable->assertFrom('jeffrey@example.com');
    $mailable->assertTo('taylor@example.com');
    $mailable->assertHasCc('abigail@example.com');
    $mailable->assertHasBcc('victoria@example.com');
    $mailable->assertHasReplyTo('tyler@example.com');
    $mailable->assertHasSubject('Invoice Paid');
    $mailable->assertHasTag('example-tag');
    $mailable->assertHasMetadata('key', 'value');

    $mailable->assertSeeInHtml($user->email);
    $mailable->assertDontSeeInHtml('Invoice Not Paid');
    $mailable->assertSeeInOrderInHtml(['Invoice Paid', 'Thanks']);

    $mailable->assertSeeInText($user->email);
    $mailable->assertDontSeeInText('Invoice Not Paid');
    $mailable->assertSeeInOrderInText(['Invoice Paid', 'Thanks']);

    $mailable->assertHasAttachment('/path/to/file');
    $mailable->assertHasAttachment(Attachment::fromPath('/path/to/file'));
    $mailable->assertHasAttachedData($pdfData, 'name.pdf', ['mime' => 'application/pdf']);
    $mailable->assertHasAttachmentFromStorage('/path/to/file', 'name.pdf', ['mime' => 'application/pdf']);
    $mailable->assertHasAttachmentFromStorageDisk('s3', '/path/to/file', 'name.pdf', ['mime' => 'application/pdf']);
});
```

```php tab=PHPUnit
use App\Mail\InvoicePaid;
use App\Models\User;

public function test_mailable_content(): void
{
    $user = User::factory()->create();

    $mailable = new InvoicePaid($user);

    $mailable->assertFrom('jeffrey@example.com');
    $mailable->assertTo('taylor@example.com');
    $mailable->assertHasCc('abigail@example.com');
    $mailable->assertHasBcc('victoria@example.com');
    $mailable->assertHasReplyTo('tyler@example.com');
    $mailable->assertHasSubject('Invoice Paid');
    $mailable->assertHasTag('example-tag');
    $mailable->assertHasMetadata('key', 'value');

    $mailable->assertSeeInHtml($user->email);
    $mailable->assertDontSeeInHtml('Invoice Not Paid');
    $mailable->assertSeeInOrderInHtml(['Invoice Paid', 'Thanks']);

    $mailable->assertSeeInText($user->email);
    $mailable->assertDontSeeInText('Invoice Not Paid');
    $mailable->assertSeeInOrderInText(['Invoice Paid', 'Thanks']);

    $mailable->assertHasAttachment('/path/to/file');
    $mailable->assertHasAttachment(Attachment::fromPath('/path/to/file'));
    $mailable->assertHasAttachedData($pdfData, 'name.pdf', ['mime' => 'application/pdf']);
    $mailable->assertHasAttachmentFromStorage('/path/to/file', 'name.pdf', ['mime' => 'application/pdf']);
    $mailable->assertHasAttachmentFromStorageDisk('s3', '/path/to/file', 'name.pdf', ['mime' => 'application/pdf']);
}
```

<!-- As you might expect, the "HTML" assertions assert that the HTML version of your mailable contains a given string, while the "text" assertions assert that the plain-text version of your mailable contains a given string. -->
ご想像のとおり、「HTML」アサーションはメール可能ファイルの HTML バージョンに特定の文字列が含まれていることをアサートし、「テキスト」アサーションはメール可能ファイルのプレーンテキスト バージョンに特定の文字列が含まれていることをアサートします。

<a name="testing-mailable-sending"></a>
<!-- ### Testing Mailable Sending -->
### Testing Mailable Sending

<!-- We suggest testing the content of your mailables separately from your tests that assert that a given mailable was "sent" to a specific user. Typically, the content of mailables is not relevant to the code you are testing, and it is sufficient to simply assert that Laravel was instructed to send a given mailable. -->
特定のメール可能ファイルが特定のユーザーに「送信された」ことを確認するテストとは別に、メール可能ファイルのコンテンツをテストすることをお勧めします。通常、メール可能ファイルの内容はテストしているコードとは無関係であり、Laravel が特定のメール可能ファイルを送信するように指示されたことを単に主張するだけで十分です。

<!-- You may use the `Mail` facade's `fake` method to prevent mail from being sent. After calling the `Mail` facade's `fake` method, you may then assert that mailables were instructed to be sent to users and even inspect the data the mailables received: -->
`Mail` ファサードの `fake` メソッドを使用して、メールが送信されないようにすることができます。 `Mail` ファサードの `fake` メソッドを呼び出した後、メール可能ファイルがユーザーに送信されるように指示されたことをアサートし、メール可能ファイルが受信したデータを検査することもできます。

```php tab=Pest
<?php

use App\Mail\OrderShipped;
use Illuminate\Support\Facades\Mail;

test('orders can be shipped', function () {
    Mail::fake();

    // Perform order shipping...

    // Assert that no mailables were sent...
    Mail::assertNothingSent();

    // Assert that a mailable was sent...
    Mail::assertSent(OrderShipped::class);

    // Assert a mailable was sent twice...
    Mail::assertSent(OrderShipped::class, 2);

    // Assert a mailable was sent to an email address...
    Mail::assertSent(OrderShipped::class, 'example@laravel.com');

    // Assert a mailable was sent to multiple email addresses...
    Mail::assertSent(OrderShipped::class, ['example@laravel.com', '...']);

    // Assert a mailable was not sent...
    Mail::assertNotSent(AnotherMailable::class);

    // Assert a mailable was sent twice...
    Mail::assertSentTimes(OrderShipped::class, 2);

    // Assert that a mailable was sent exactly once...
    Mail::assertSentOnce(OrderShipped::class);

    // Assert 3 total mailables were sent...
    Mail::assertSentCount(3);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use App\Mail\OrderShipped;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_orders_can_be_shipped(): void
    {
        Mail::fake();

        // Perform order shipping...

        // Assert that no mailables were sent...
        Mail::assertNothingSent();

        // Assert that a mailable was sent...
        Mail::assertSent(OrderShipped::class);

        // Assert a mailable was sent twice...
        Mail::assertSent(OrderShipped::class, 2);

        // Assert a mailable was sent to an email address...
        Mail::assertSent(OrderShipped::class, 'example@laravel.com');

        // Assert a mailable was sent to multiple email addresses...
        Mail::assertSent(OrderShipped::class, ['example@laravel.com', '...']);

        // Assert a mailable was not sent...
        Mail::assertNotSent(AnotherMailable::class);

        // Assert a mailable was sent twice...
        Mail::assertSentTimes(OrderShipped::class, 2);

        // Assert that a mailable was sent exactly once...
        Mail::assertSentOnce(OrderShipped::class);

        // Assert 3 total mailables were sent...
        Mail::assertSentCount(3);
    }
}
```

<!-- If you are queueing mailables for delivery in the background, you should use the `assertQueued` method instead of `assertSent`: -->
バックグラウンドで配信のためにメール可能ファイルをキューに入れている場合は、`assertSent` の代わりに `assertQueued` メソッドを使用する必要があります。

```php
Mail::assertQueued(OrderShipped::class);
Mail::assertQueuedOnce(OrderShipped::class);
Mail::assertNotQueued(OrderShipped::class);
Mail::assertNothingQueued();
Mail::assertQueuedCount(3);
```

<!-- You can also assert the total number of mailables that have been sent or queued using the `assertOutgoingCount` method: -->
`assertOutgoingCount` メソッドを使用して、送信またはキューに入れられたメール可能ファイルの合計数をアサートすることもできます。

```php
Mail::assertOutgoingCount(3);
```

<!-- You may pass a closure to the `assertSent`, `assertNotSent`, `assertQueued`, or `assertNotQueued` methods in order to assert that a mailable was sent that passes a given "truth test". If at least one mailable was sent that passes the given truth test then the assertion will be successful: -->
特定の「真実テスト」に合格したメール可能ファイルが送信されたことをアサートするために、`assertSent`、`assertNotSent`、`assertQueued`、または `assertNotQueued` メソッドにクロージャを渡すことができます。指定された真実テストに合格する少なくとも 1 つのメール可能ファイルが送信された場合、アサーションは成功します。

```php
Mail::assertSent(function (OrderShipped $mail) use ($order) {
    return $mail->order->id === $order->id;
});
```

<!-- When calling the `Mail` facade's assertion methods, the mailable instance accepted by the provided closure exposes helpful methods for examining the mailable: -->
`Mail` ファサードのアサーション メソッドを呼び出すと、提供されたクロージャによって受け入れられるメール可能インスタンスは、メール可能を調べるための役立つメソッドを公開します。

```php
Mail::assertSent(OrderShipped::class, function (OrderShipped $mail) use ($user) {
    return $mail->hasTo($user->email) &&
           $mail->hasCc('...') &&
           $mail->hasBcc('...') &&
           $mail->hasReplyTo('...') &&
           $mail->hasFrom('...') &&
           $mail->hasSubject('...') &&
           $mail->hasMetadata('order_id', $mail->order->id);
           $mail->usesMailer('ses');
});
```

<!-- The mailable instance also includes several helpful methods for examining the attachments on a mailable: -->
メール可能インスタンスには、メール可能ファイルの添付ファイルを調べるための便利なメソッドもいくつか含まれています。

```php
use Illuminate\Mail\Mailables\Attachment;

Mail::assertSent(OrderShipped::class, function (OrderShipped $mail) {
    return $mail->hasAttachment(
        Attachment::fromPath('/path/to/file')
            ->as('name.pdf')
            ->withMime('application/pdf')
    );
});

Mail::assertSent(OrderShipped::class, function (OrderShipped $mail) {
    return $mail->hasAttachment(
        Attachment::fromStorageDisk('s3', '/path/to/file')
    );
});

Mail::assertSent(OrderShipped::class, function (OrderShipped $mail) use ($pdfData) {
    return $mail->hasAttachment(
        Attachment::fromData(fn () => $pdfData, 'name.pdf')
    );
});
```

<!-- You may have noticed that there are two methods for asserting that mail was not sent: `assertNotSent` and `assertNotQueued`. Sometimes you may wish to assert that no mail was sent **or** queued. To accomplish this, you may use the `assertNothingOutgoing` and `assertNotOutgoing` methods: -->
メールが送信されなかったことを確認するには、`assertNotSent` と `assertNotQueued` という 2 つの方法があることに気づいたかもしれません。場合によっては、メールが送信されなかったり、キューに入れられたりしていないことを主張したい場合があります。これを実現するには、`assertNothingOutgoing` メソッドと `assertNotOutgoing` メソッドを使用できます。

```php
Mail::assertNothingOutgoing();

Mail::assertNotOutgoing(function (OrderShipped $mail) use ($order) {
    return $mail->order->id === $order->id;
});
```

<a name="mail-and-local-development"></a>
<!-- ## Mail and Local Development -->
## Mail and Local Development

<!-- When developing an application that sends email, you probably don't want to actually send emails to live email addresses. Laravel provides several ways to "disable" the actual sending of emails during local development. -->
電子メールを送信するアプリケーションを開発する場合、実際には実際の電子メール アドレスに電子メールを送信したくないでしょう。 Laravel には、ローカル開発中に実際の電子メールの送信を「無効にする」方法がいくつか用意されています。

<a name="log-driver"></a>
<!-- #### Log Driver -->
#### Log Driver

<!-- Instead of sending your emails, the `log` mail driver will write all email messages to your log files for inspection. Typically, this driver would only be used during local development. For more information on configuring your application per environment, check out the [configuration documentation](/docs/13.x/configuration#environment-configuration). -->
電子メールを送信する代わりに、`log` メール ドライバは検査のためにすべての電子メール メッセージをログ ファイルに書き込みます。通常、このドライバはローカル開発中にのみ使用されます。環境ごとのアプリケーションの構成の詳細については、[configuration documentation](/docs/13.x/configuration#environment-configuration) を確認してください。

<a name="mailtrap"></a>
<!-- #### HELO / Mailtrap / Mailpit -->
#### HELO / Mailtrap / Mailpit

<!-- Alternatively, you may use a service like [HELO](https://usehelo.com) or [Mailtrap](https://mailtrap.io) and the `smtp` driver to send your email messages to a "dummy" mailbox where you may view them in a true email client. This approach has the benefit of allowing you to actually inspect the final emails in Mailtrap's message viewer. -->
あるいは、[HELO](https://usehelo.com) や [Mailtrap](https://mailtrap.io) などのサービスと `smtp` ドライバを使用して、電子メール メッセージを「ダミー」メールボックスに送信し、実際の電子メール クライアントで表示することもできます。このアプローチには、Mailtrap のメッセージ ビューアで最終的な電子メールを実際に検査できるという利点があります。

<!-- If you are using [Laravel Sail](/docs/13.x/sail), you may preview your messages using [Mailpit](https://github.com/axllent/mailpit). When Sail is running, you may access the Mailpit interface at: `http://localhost:8025`. -->
[Laravel Sail](/docs/13.x/sail) を使用している場合は、[Mailpit](https://github.com/axllent/mailpit) を使用してメッセージをプレビューできます。 Sail の実行中は、`http://localhost:8025` で Mailpit インターフェイスにアクセスできます。

<a name="using-a-global-to-address"></a>
<!-- #### Using a Global `to` Address -->
#### Using a Global `to` Address

<!-- Finally, you may specify a global "to" address by invoking the `alwaysTo` method offered by the `Mail` facade. Typically, this method should be called from the `boot` method of one of your application's service providers: -->
最後に、`Mail` ファサードが提供する `alwaysTo` メソッドを呼び出して、グローバル "to" アドレスを指定できます。通常、このメソッドは、アプリケーションのサービスプロバイダの 1 つの `boot` メソッドから呼び出す必要があります。

```php
use Illuminate\Support\Facades\Mail;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    if ($this->app->environment('local')) {
        Mail::alwaysTo('taylor@example.com');
    }
}
```

<!-- When using the `alwaysTo` method, any additional "cc" or "bcc" addresses on mail messages will be removed. -->
`alwaysTo` メソッドを使用すると、メール メッセージ上の追加の「cc」または「bcc」アドレスが削除されます。

<a name="events"></a>
<!-- ## Events -->
## Events

<!-- Laravel dispatches two events while sending mail messages. The `MessageSending` event is dispatched prior to a message being sent, while the `MessageSent` event is dispatched after a message has been sent. Remember, these events are dispatched when the mail is being *sent*, not when it is queued. You may create [event listeners](/docs/13.x/events) for these events within your application: -->
Laravel はメールメッセージの送信中に 2 つのイベントを送出します。 `MessageSending` イベントはメッセージの送信前に送出されますが、`MessageSent` イベントはメッセージの送信後に送出されます。これらのイベントは、メールがキューに入れられたときではなく、*送信*されたときに送出されることに注意してください。アプリケーション内で次のイベントに対して [event listeners](/docs/13.x/events) を作成できます。

```php
use Illuminate\Mail\Events\MessageSending;
// use Illuminate\Mail\Events\MessageSent;

class LogMessage
{
    /**
     * Handle the event.
     */
    public function handle(MessageSending $event): void
    {
        // ...
    }
}
```

<a name="custom-transports"></a>
<!-- ## Custom Transports -->
## Custom Transports

<!-- Laravel includes a variety of mail transports; however, you may wish to write your own transports to deliver email via other services that Laravel does not support out of the box. To get started, define a class that extends the `Symfony\Component\Mailer\Transport\AbstractTransport` class. Then, implement the `doSend` and `__toString` methods on your transport: -->
Laravel にはさまざまなメールトランスポートが含まれています。ただし、Laravel がそのままではサポートしていない他のサービスを介して電子メールを配信するために、独自のトランスポートを作成することもできます。まず、`Symfony\Component\Mailer\Transport\AbstractTransport` クラスを拡張するクラスを定義します。次に、トランスポートに `doSend` メソッドと `__toString` メソッドを実装します。

```php
<?php

namespace App\Mail;

use MailchimpTransactional\ApiClient;
use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mailer\Transport\AbstractTransport;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\MessageConverter;

class MailchimpTransport extends AbstractTransport
{
    /**
     * Create a new Mailchimp transport instance.
     */
    public function __construct(
        protected ApiClient $client,
    ) {
        parent::__construct();
    }

    /**
     * {@inheritDoc}
     */
    protected function doSend(SentMessage $message): void
    {
        $email = MessageConverter::toEmail($message->getOriginalMessage());

        $this->client->messages->send(['message' => [
            'from_email' => $email->getFrom(),
            'to' => collect($email->getTo())->map(function (Address $email) {
                return ['email' => $email->getAddress(), 'type' => 'to'];
            })->all(),
            'subject' => $email->getSubject(),
            'text' => $email->getTextBody(),
        ]]);
    }

    /**
     * Get the string representation of the transport.
     */
    public function __toString(): string
    {
        return 'mailchimp';
    }
}
```

<!-- Once you've defined your custom transport, you may register it via the `extend` method provided by the `Mail` facade. Typically, this should be done within the `boot` method of your application's `AppServiceProvider`. A `$config` argument will be passed to the closure provided to the `extend` method. This argument will contain the configuration array defined for the mailer in the application's `config/mail.php` configuration file: -->
カスタム トランスポートを定義したら、`Mail` ファサードによって提供される `extend` メソッドを介して登録できます。通常、これはアプリケーションの `AppServiceProvider` の `boot` メソッド内で実行する必要があります。 `$config` 引数は、`extend` メソッドに提供されたクロージャに渡されます。この引数には、アプリケーションの `config/mail.php` 構成ファイルでメーラーに対して定義された構成配列が含まれます。

```php
use App\Mail\MailchimpTransport;
use Illuminate\Support\Facades\Mail;
use MailchimpTransactional\ApiClient;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Mail::extend('mailchimp', function (array $config = []) {
        $client = new ApiClient;

        $client->setApiKey($config['key']);

        return new MailchimpTransport($client);
    });
}
```

<!-- Once your custom transport has been defined and registered, you may create a mailer definition within your application's `config/mail.php` configuration file that utilizes the new transport: -->
カスタム トランスポートを定義して登録したら、新しいトランスポートを利用するアプリケーションの `config/mail.php` 構成ファイル内にメーラー定義を作成できます。

```php
'mailchimp' => [
    'transport' => 'mailchimp',
    'key' => env('MAILCHIMP_API_KEY'),
    // ...
],
```

<a name="additional-symfony-transports"></a>
<!-- ### Additional Symfony Transports -->
### Additional Symfony Transports

<!-- Laravel includes support for some existing Symfony maintained mail transports like Mailgun and Postmark. However, you may wish to extend Laravel with support for additional Symfony maintained transports. You can do so by requiring the necessary Symfony mailer via Composer and registering the transport with Laravel. For example, you may install and register the "Brevo" (formerly "Sendinblue") Symfony mailer: -->
Laravel には、Mailgun や Postmark など、Symfony が管理する既存のメールトランスポートのサポートが含まれています。ただし、追加の Symfony 管理トランスポートをサポートして Laravel を拡張したい場合もあります。これを行うには、Composer 経由で必要な Symfony Mailerを要求し、トランスポートを Laravel に登録します。たとえば、「Brevo」 (旧名「Sendinblue」) Symfony Mailerをインストールして登録できます。

```shell
composer require symfony/brevo-mailer symfony/http-client
```

<!-- Once the Brevo mailer package has been installed, you may add an entry for your Brevo API credentials to your application's `services` configuration file: -->
Brevo メーラー パッケージがインストールされたら、Brevo API 資格情報のエントリをアプリケーションの `services` 構成ファイルに追加できます。

```php
'brevo' => [
    'key' => env('BREVO_API_KEY'),
],
```

<!-- Next, you may use the `Mail` facade's `extend` method to register the transport with Laravel. Typically, this should be done within the `boot` method of a service provider: -->
次に、`Mail` ファサードの `extend` メソッドを使用して、トランスポートを Laravel に登録できます。通常、これはサービスプロバイダの `boot` メソッド内で実行する必要があります。

```php
use Illuminate\Support\Facades\Mail;
use Symfony\Component\Mailer\Bridge\Brevo\Transport\BrevoTransportFactory;
use Symfony\Component\Mailer\Transport\Dsn;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Mail::extend('brevo', function () {
        return (new BrevoTransportFactory)->create(
            new Dsn(
                'brevo+api',
                'default',
                config('services.brevo.key')
            )
        );
    });
}
```

<!-- Once your transport has been registered, you may create a mailer definition within your application's `config/mail.php` configuration file that utilizes the new transport: -->
トランスポートが登録されたら、新しいトランスポートを利用するアプリケーションの `config/mail.php` 構成ファイル内にメーラー定義を作成できます。

```php
'brevo' => [
    'transport' => 'brevo',
    // ...
],
```
