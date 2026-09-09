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
이메일 발송은 복잡할 필요가 없습니다. Laravel은 널리 사용되는 [Symfony Mailer](https://symfony.com/doc/current/mailer.html) 컴포넌트를 기반으로 하는 깔끔하고 단순한 이메일 API를 제공합니다. Laravel과 Symfony Mailer는 SMTP, Cloudflare, Mailgun, Postmark, Resend, Amazon SES, `sendmail`을 통해 이메일을 보낼 수 있는 드라이버를 제공합니다. 따라서 원하는 로컬 또는 클라우드 기반 서비스를 통해 빠르게 메일 발송을 시작할 수 있습니다.

<a name="configuration"></a>
<!-- ### Configuration -->
### Configuration

<!-- Laravel's email services may be configured via your application's `config/mail.php` configuration file. Each mailer configured within this file may have its own unique configuration and even its own unique "transport", allowing your application to use different email services to send certain email messages. For example, your application might use Postmark to send transactional emails while using Amazon SES to send bulk emails. -->
Laravel의 이메일 서비스는 애플리케이션의 `config/mail.php` 설정 파일을 통해 설정할 수 있습니다. 이 파일 안에 설정된 각 mailer는 고유한 설정을 가질 수 있으며, 고유한 "transport"도 가질 수 있습니다. 이를 통해 애플리케이션은 특정 이메일 메시지를 보낼 때 서로 다른 이메일 서비스를 사용할 수 있습니다. 예를 들어, 애플리케이션은 트랜잭션 이메일을 보낼 때 Postmark를 사용하고, 대량 이메일을 보낼 때 Amazon SES를 사용할 수 있습니다.

<!-- Within your `mail` configuration file, you will find a `mailers` configuration array. This array contains a sample configuration entry for each of the major mail drivers / transports supported by Laravel, while the `default` configuration value determines which mailer will be used by default when your application needs to send an email message. -->
`mail` 설정 파일 안에는 `mailers` 설정 배열이 있습니다. 이 배열에는 Laravel이 지원하는 주요 메일 드라이버 / transport 각각에 대한 샘플 설정 항목이 들어 있으며, `default` 설정 값은 애플리케이션이 이메일 메시지를 보내야 할 때 기본으로 사용할 mailer를 결정합니다.

<a name="driver-prerequisites"></a>
<!-- ### Driver / Transport Prerequisites -->
### Driver / Transport Prerequisites

<!-- The API based drivers such as Mailgun, Postmark, and Resend are often simpler and faster than sending mail via SMTP servers. Whenever possible, we recommend that you use one of these drivers. -->
Mailgun, Postmark, Resend처럼 API 기반 드라이버는 SMTP 서버를 통해 메일을 보내는 방식보다 더 단순하고 빠른 경우가 많습니다. 가능하다면 이러한 드라이버 중 하나를 사용하는 것을 권장합니다.

<a name="cloudflare-driver"></a>
<!-- #### Cloudflare Driver -->
#### Cloudflare Driver

<!-- To use the Cloudflare driver, install Symfony's HTTP Client via Composer: -->
Cloudflare 드라이버를 사용하려면 Composer를 통해 Symfony의 HTTP Client를 설치합니다.

```shell
composer require symfony/http-client
```

<!-- Next, you will need to make two changes in your application's `config/mail.php` configuration file. First, set your default mailer to `cloudflare`: -->
다음으로, 애플리케이션의 `config/mail.php` 설정 파일에서 두 가지를 변경해야 합니다. 먼저 기본 mailer를 `cloudflare`로 설정합니다.

```php
'default' => env('MAIL_MAILER', 'cloudflare'),
```

<!-- Second, add the following configuration array to your array of `mailers`: -->
두 번째로, `mailers` 배열에 다음 설정 배열을 추가합니다.

```php
'cloudflare' => [
    'transport' => 'cloudflare',
],
```

<!-- After configuring your application's default mailer, add the following options to your `config/services.php` configuration file: -->
애플리케이션의 기본 mailer를 설정한 후에는 `config/services.php` 설정 파일에 다음 옵션을 추가합니다.

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
Mailgun 드라이버를 사용하려면 Composer를 통해 Symfony의 Mailgun Mailer transport를 설치합니다.

```shell
composer require symfony/mailgun-mailer symfony/http-client
```

<!-- Next, you will need to make two changes in your application's `config/mail.php` configuration file. First, set your default mailer to `mailgun`: -->
다음으로, 애플리케이션의 `config/mail.php` 설정 파일에서 두 가지를 변경해야 합니다. 먼저 기본 mailer를 `mailgun`으로 설정합니다.

```php
'default' => env('MAIL_MAILER', 'mailgun'),
```

<!-- Second, add the following configuration array to your array of `mailers`: -->
두 번째로, `mailers` 배열에 다음 설정 배열을 추가합니다.

```php
'mailgun' => [
    'transport' => 'mailgun',
    // 'client' => [
    //     'timeout' => 5,
    // ],
],
```

<!-- After configuring your application's default mailer, add the following options to your `config/services.php` configuration file: -->
애플리케이션의 기본 mailer를 설정한 후에는 `config/services.php` 설정 파일에 다음 옵션을 추가합니다.

```php
'mailgun' => [
    'domain' => env('MAILGUN_DOMAIN'),
    'secret' => env('MAILGUN_SECRET'),
    'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
    'scheme' => 'https',
],
```

<!-- If you are not using the United States [Mailgun region](https://documentation.mailgun.com/docs/mailgun/api-reference/api-overview#mailgun-regions), you may define your region's endpoint in the `services` configuration file: -->
미국 [Mailgun region](https://documentation.mailgun.com/docs/mailgun/api-reference/api-overview#mailgun-regions)을 사용하지 않는 경우, `services` 설정 파일에서 해당 지역의 endpoint를 정의할 수 있습니다.

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
[Postmark](https://postmarkapp.com/) 드라이버를 사용하려면 Composer를 통해 Symfony의 Postmark Mailer transport를 설치합니다.

```shell
composer require symfony/postmark-mailer symfony/http-client
```

<!-- Next, set the `default` option in your application's `config/mail.php` configuration file to `postmark`. After configuring your application's default mailer, ensure that your `config/services.php` configuration file contains the following options: -->
다음으로, 애플리케이션의 `config/mail.php` 설정 파일에서 `default` 옵션을 `postmark`로 설정합니다. 애플리케이션의 기본 mailer를 설정한 후에는 `config/services.php` 설정 파일에 다음 옵션이 포함되어 있는지 확인합니다.

```php
'postmark' => [
    'key' => env('POSTMARK_API_KEY'),
],
```

<!-- If you would like to specify the Postmark message stream that should be used by a given mailer, you may add the `message_stream_id` configuration option to the mailer's configuration array. This configuration array can be found in your application's `config/mail.php` configuration file: -->
특정 mailer에서 사용할 Postmark 메시지 스트림을 지정하고 싶다면, mailer의 설정 배열에 `message_stream_id` 설정 옵션을 추가할 수 있습니다. 이 설정 배열은 애플리케이션의 `config/mail.php` 설정 파일에서 찾을 수 있습니다.

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
이 방식으로 서로 다른 메시지 스트림을 사용하는 여러 Postmark mailer도 설정할 수 있습니다.

<a name="resend-driver"></a>
<!-- #### Resend Driver -->
#### Resend Driver

<!-- To use the [Resend](https://resend.com/) driver, install Resend's PHP SDK via Composer: -->
[Resend](https://resend.com/) 드라이버를 사용하려면 Composer를 통해 Resend의 PHP SDK를 설치합니다.

```shell
composer require resend/resend-php
```

<!-- Next, set the `default` option in your application's `config/mail.php` configuration file to `resend`. After configuring your application's default mailer, ensure that your `config/services.php` configuration file contains the following options: -->
다음으로, 애플리케이션의 `config/mail.php` 설정 파일에서 `default` 옵션을 `resend`로 설정합니다. 애플리케이션의 기본 mailer를 설정한 후에는 `config/services.php` 설정 파일에 다음 옵션이 포함되어 있는지 확인합니다.

```php
'resend' => [
    'key' => env('RESEND_API_KEY'),
],
```

<a name="ses-driver"></a>
<!-- #### SES Driver -->
#### SES Driver

<!-- To use the Amazon SES driver you must first install the Amazon AWS SDK for PHP. You may install this library via the Composer package manager: -->
Amazon SES 드라이버를 사용하려면 먼저 PHP용 Amazon AWS SDK를 설치해야 합니다. Composer 패키지 관리자를 통해 이 라이브러리를 설치할 수 있습니다.

```shell
composer require aws/aws-sdk-php
```

<!-- Next, set the `default` option in your `config/mail.php` configuration file to `ses` and verify that your `config/services.php` configuration file contains the following options: -->
다음으로, `config/mail.php` 설정 파일에서 `default` 옵션을 `ses`로 설정하고, `config/services.php` 설정 파일에 다음 옵션이 포함되어 있는지 확인합니다.

```php
'ses' => [
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
],
```

<!-- To utilize AWS [temporary credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_use-resources.html) via a session token, you may add a `token` key to your application's SES configuration: -->
세션 토큰을 통해 AWS [temporary credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_use-resources.html)을 사용하려면, 애플리케이션의 SES 설정에 `token` 키를 추가할 수 있습니다.

```php
'ses' => [
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    'token' => env('AWS_SESSION_TOKEN'),
],
```

<!-- To interact with SES's [subscription management features](https://docs.aws.amazon.com/ses/latest/dg/sending-email-subscription-management.html), you may return the `X-Ses-List-Management-Options` header in the array returned by the [headers](#headers) method of a mail message: -->
SES의 [subscription management features](https://docs.aws.amazon.com/ses/latest/dg/sending-email-subscription-management.html)과 연동하려면, 메일 메시지의 [headers](#headers) 메서드가 반환하는 배열에 `X-Ses-List-Management-Options` 헤더를 반환하면 됩니다.

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
SES [tenant](https://docs.aws.amazon.com/ses/latest/dg/tenants.html)를 통해 이메일을 보내려면 `headers` 메서드에서 `X-Ses-Tenant-Name` 헤더를 반환할 수 있습니다. Laravel은 메시지를 보낼 때 헤더 값을 `TenantName` 옵션으로 SES에 전달합니다.

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
이메일을 보낼 때 Laravel이 AWS SDK의 `SendEmail` 메서드에 전달해야 하는 [additional options](https://docs.aws.amazon.com/aws-sdk-php/v3/api/api-sesv2-2019-09-27.html#sendemail)을 정의하고 싶다면, `ses` 설정 안에 `options` 배열을 정의할 수 있습니다.

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
때로는 애플리케이션의 메일 발송에 사용하도록 설정한 외부 서비스가 중단될 수 있습니다. 이런 경우, 기본 발송 드라이버를 사용할 수 없을 때 대신 사용할 하나 이상의 백업 메일 발송 설정을 정의해 두면 유용합니다.

<!-- To accomplish this, you should define a mailer within your application's `mail` configuration file that uses the `failover` transport. The configuration array for your application's `failover` mailer should contain an array of `mailers` that reference the order in which configured mailers should be chosen for delivery: -->
이를 구현하려면 애플리케이션의 `mail` 설정 파일 안에 `failover` transport를 사용하는 mailer를 정의해야 합니다. 애플리케이션의 `failover` mailer 설정 배열에는 발송에 사용할 설정된 mailer의 선택 순서를 나타내는 `mailers` 배열이 포함되어야 합니다.

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
`failover` transport를 사용하는 mailer를 설정한 후에는 failover 기능을 사용하기 위해 애플리케이션의 `.env` 파일에서 failover mailer를 기본 mailer로 설정해야 합니다.

```ini
MAIL_MAILER=failover
```

<a name="round-robin-configuration"></a>
<!-- ### Round Robin Configuration -->
### Round Robin Configuration

<!-- The `roundrobin` transport allows you to distribute your mailing workload across multiple mailers. To get started, define a mailer within your application's `mail` configuration file that uses the `roundrobin` transport. The configuration array for your application's `roundrobin` mailer should contain an array of `mailers` that reference which configured mailers should be used for delivery: -->
`roundrobin` transport를 사용하면 메일 발송 작업량을 여러 mailer에 분산할 수 있습니다. 시작하려면 애플리케이션의 `mail` 설정 파일 안에 `roundrobin` transport를 사용하는 mailer를 정의합니다. 애플리케이션의 `roundrobin` mailer 설정 배열에는 발송에 사용할 설정된 mailer를 참조하는 `mailers` 배열이 포함되어야 합니다.

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
Round Robin mailer를 정의한 후에는 애플리케이션의 `mail` 설정 파일 안에서 `default` 설정 키의 값으로 해당 이름을 지정하여, 이 mailer를 애플리케이션이 사용하는 기본 mailer로 설정해야 합니다.

```php
'default' => env('MAIL_MAILER', 'roundrobin'),
```

<!-- The round robin transport selects a random mailer from the list of configured mailers and then switches to the next available mailer for each subsequent email. In contrast to `failover` transport, which helps to achieve *[high availability](https://en.wikipedia.org/wiki/High_availability)*, the `roundrobin` transport provides *[load balancing](https://en.wikipedia.org/wiki/Load_balancing_(computing))*. -->
Round Robin transport는 설정된 mailer 목록에서 무작위 mailer를 선택한 다음, 이후 각 이메일마다 다음으로 사용 가능한 mailer로 전환합니다. *[high availability](https://en.wikipedia.org/wiki/High_availability)*을 달성하는 데 도움을 주는 `failover` transport와 달리, `roundrobin` transport는 *[load balancing](https://en.wikipedia.org/wiki/Load_balancing_(computing))*을 제공합니다.

<a name="generating-mailables"></a>
<!-- ## Generating Mailables -->
## Generating Mailables

<!-- When building Laravel applications, each type of email sent by your application is represented as a "mailable" class. These classes are stored in the `app/Mail` directory. Don't worry if you don't see this directory in your application, since it will be generated for you when you create your first mailable class using the `make:mail` Artisan command: -->
Laravel 애플리케이션을 만들 때, 애플리케이션이 보내는 각 이메일 유형은 "mailable" 클래스로 표현됩니다. 이 클래스들은 `app/Mail` 디렉터리에 저장됩니다. 애플리케이션에서 이 디렉터리가 보이지 않아도 걱정하지 않아도 됩니다. `make:mail` Artisan 명령어를 사용해 첫 번째 mailable 클래스를 만들 때 자동으로 생성됩니다.

```shell
php artisan make:mail OrderShipped
```

<a name="writing-mailables"></a>
<!-- ## Writing Mailables -->
## Writing Mailables

<!-- Once you have generated a mailable class, open it up so we can explore its contents. Mailable class configuration is done in several methods, including the `envelope`, `content`, and `attachments` methods. -->
Mailable 클래스를 생성했다면 파일을 열어 내부 내용을 살펴보겠습니다. Mailable 클래스 설정은 `envelope`, `content`, `attachments` 메서드를 포함한 여러 메서드에서 이루어집니다.

<!-- The `envelope` method returns an `Illuminate\Mail\Mailables\Envelope` object that defines the subject and, sometimes, the recipients of the message. The `content` method returns an `Illuminate\Mail\Mailables\Content` object that defines the [Blade template](/docs/13.x/blade) that will be used to generate the message content. -->
`envelope` 메서드는 메시지의 제목과 경우에 따라 수신자를 정의하는 `Illuminate\Mail\Mailables\Envelope` 객체를 반환합니다. `content` 메서드는 메시지 콘텐츠를 생성하는 데 사용할 [Blade template](/docs/13.x/blade)을 정의하는 `Illuminate\Mail\Mailables\Content` 객체를 반환합니다.

<a name="configuring-the-sender"></a>
<!-- ### Configuring the Sender -->
### Configuring the Sender

<a name="using-the-envelope"></a>
<!-- #### Using the Envelope -->
#### Using the Envelope

<!-- First, let's explore configuring the sender of the email. Or, in other words, who the email is going to be "from". There are two ways to configure the sender. First, you may specify the "from" address on your message's envelope: -->
먼저 이메일 발신자를 설정하는 방법을 살펴보겠습니다. 다시 말해, 이메일이 누구로부터 "보내지는지"를 설정하는 방법입니다. 발신자를 설정하는 방법은 두 가지입니다. 먼저 메시지의 envelope에 "from" 주소를 지정할 수 있습니다.

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
원한다면 `replyTo` 주소도 지정할 수 있습니다.

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
하지만 애플리케이션이 모든 이메일에 동일한 "from" 주소를 사용한다면, 생성하는 각 mailable 클래스마다 이 주소를 추가하는 일이 번거로울 수 있습니다. 대신 `config/mail.php` 설정 파일에서 전역 "from" 주소를 지정할 수 있습니다. Mailable 클래스 안에서 다른 "from" 주소가 지정되지 않은 경우 이 주소가 사용됩니다.

```php
'from' => [
    'address' => env('MAIL_FROM_ADDRESS', 'hello@example.com'),
    'name' => env('MAIL_FROM_NAME', 'Example'),
],
```

<!-- In addition, you may define a global "reply_to" address within your `config/mail.php` configuration file: -->
또한 `config/mail.php` 설정 파일 안에서 전역 "reply_to" 주소를 정의할 수도 있습니다.

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
Mailable 클래스의 `content` 메서드 안에서는 `view`, 즉 이메일 콘텐츠를 렌더링할 때 어떤 템플릿을 사용할지 정의할 수 있습니다. 각 이메일은 일반적으로 콘텐츠를 렌더링하기 위해 [Blade template](/docs/13.x/blade)을 사용하므로, 이메일 HTML을 만들 때 Blade 템플릿 엔진의 강력함과 편리함을 모두 활용할 수 있습니다.

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
> 모든 이메일 템플릿을 보관하기 위해 `resources/views/mail` 디렉터리를 만들고 싶을 수 있습니다. 하지만 `resources/views` 디렉터리 안이라면 원하는 위치 어디에든 자유롭게 배치할 수 있습니다.

<a name="plain-text-emails"></a>
<!-- #### Plain Text Emails -->
#### Plain Text Emails

<!-- If you would like to define a plain-text version of your email, you may specify the plain-text template when creating the message's `Content` definition. Like the `view` parameter, the `text` parameter should be a template name which will be used to render the contents of the email. You are free to define both an HTML and plain-text version of your message: -->
이메일의 일반 텍스트 버전을 정의하고 싶다면, 메시지의 `Content` 정의를 만들 때 일반 텍스트 템플릿을 지정할 수 있습니다. `view` 파라미터와 마찬가지로, `text` 파라미터는 이메일 콘텐츠를 렌더링하는 데 사용할 템플릿 이름이어야 합니다. 메시지의 HTML 버전과 일반 텍스트 버전을 모두 자유롭게 정의할 수 있습니다.

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
명확성을 위해 `html` 매개변수를 `view` 매개변수의 별칭으로 사용할 수 있습니다.

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
일반적으로 이메일의 HTML을 렌더링할 때 사용할 데이터를 뷰에 전달하고 싶을 것입니다. 데이터를 뷰에서 사용할 수 있게 만드는 방법은 두 가지입니다. 첫 번째로, mailable 클래스에 정의된 모든 public 속성은 자동으로 뷰에서 사용할 수 있게 됩니다. 예를 들어, mailable 클래스의 생성자로 데이터를 전달한 뒤, 그 데이터를 클래스에 정의된 public 속성에 설정할 수 있습니다.

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
데이터가 public 속성에 설정되면 자동으로 뷰에서 사용할 수 있으므로, Blade 템플릿에서 다른 데이터를 접근하듯이 접근할 수 있습니다.

```blade
<div>
    Price: {{ $order->price }}
</div>
```

<a name="via-the-with-parameter"></a>
<!-- #### Via the `with` Parameter: -->
#### Via the `with` Parameter:

<!-- If you would like to customize the format of your email's data before it is sent to the template, you may manually pass your data to the view via the `Content` definition's `with` parameter. Typically, you will still pass data via the mailable class's constructor; however, you should set this data to `protected` or `private` properties so the data is not automatically made available to the template: -->
이메일 데이터가 템플릿에 전달되기 전에 그 형식을 직접 조정하고 싶다면, `Content` 정의의 `with` 매개변수를 통해 데이터를 뷰에 직접 전달할 수 있습니다. 일반적으로 데이터는 여전히 mailable 클래스의 생성자를 통해 전달합니다. 다만 이 데이터가 템플릿에서 자동으로 사용할 수 있게 되지 않도록, `protected` 또는 `private` 속성에 설정해야 합니다.

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
데이터가 `with` 매개변수를 통해 전달되면 자동으로 뷰에서 사용할 수 있으므로, Blade 템플릿에서 다른 데이터를 접근하듯이 접근할 수 있습니다.

```blade
<div>
    Price: {{ $orderPrice }}
</div>
```

<a name="attachments"></a>
<!-- ### Attachments -->
### Attachments

<!-- To add attachments to an email, you will add attachments to the array returned by the message's `attachments` method. First, you may add an attachment by providing a file path to the `fromPath` method provided by the `Attachment` class: -->
이메일에 첨부 파일을 추가하려면 메시지의 `attachments` 메서드가 반환하는 배열에 첨부 파일을 추가합니다. 먼저 `Attachment` 클래스가 제공하는 `fromPath` 메서드에 파일 경로를 전달하여 첨부 파일을 추가할 수 있습니다.

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
메시지에 파일을 첨부할 때는 `as` 및 `withMime` 메서드를 사용하여 첨부 파일의 표시 이름 및/또는 MIME 타입도 지정할 수 있습니다.

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
[filesystem disks](/docs/13.x/filesystem) 중 하나에 파일을 저장해 두었다면, `fromStorage` 첨부 메서드를 사용하여 이메일에 첨부할 수 있습니다.

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
물론 첨부 파일의 이름과 MIME 타입도 지정할 수 있습니다.

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
기본 디스크가 아닌 다른 storage disk를 지정해야 한다면 `fromStorageDisk` 메서드를 사용할 수 있습니다.

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
`fromData` 첨부 메서드는 원시 바이트 문자열을 첨부 파일로 첨부할 때 사용할 수 있습니다. 예를 들어 PDF를 메모리에서 생성했고, 디스크에 쓰지 않고 이메일에 첨부하고 싶을 때 이 메서드를 사용할 수 있습니다. `fromData` 메서드는 원시 데이터 바이트를 반환하는 클로저와 첨부 파일에 지정할 이름을 인수로 받습니다.

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
이메일에 인라인 이미지를 삽입하는 작업은 보통 번거롭습니다. 하지만 Laravel은 이메일에 이미지를 첨부하는 편리한 방법을 제공합니다. 인라인 이미지를 삽입하려면 이메일 템플릿 안에서 `$message` 변수의 `embed` 메서드를 사용합니다. Laravel은 모든 이메일 템플릿에서 `$message` 변수를 자동으로 사용할 수 있게 해 주므로, 직접 전달하는 일을 신경 쓸 필요가 없습니다.

```blade
<body>
    Here is an image:

    <img src="{{ $message->embed($pathToImage) }}">
</body>
```

> [!WARNING]
> 일반 텍스트 메시지는 인라인 첨부 파일을 사용하지 않으므로, 일반 텍스트 메시지 템플릿에서는 `$message` 변수를 사용할 수 없습니다.

<a name="embedding-raw-data-attachments"></a>
<!-- #### Embedding Raw Data Attachments -->
#### Embedding Raw Data Attachments

<!-- If you already have a raw image data string you wish to embed into an email template, you may call the `embedData` method on the `$message` variable. When calling the `embedData` method, you will need to provide a filename that should be assigned to the embedded image: -->
이메일 템플릿에 삽입하고 싶은 원시 이미지 데이터 문자열이 이미 있다면, `$message` 변수의 `embedData` 메서드를 호출할 수 있습니다. `embedData` 메서드를 호출할 때는 삽입된 이미지에 지정할 파일명을 제공해야 합니다.

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
단순한 문자열 경로를 통해 메시지에 파일을 첨부하는 것으로 충분한 경우가 많지만, 애플리케이션에서 첨부 가능한 엔티티가 클래스로 표현되는 경우도 많습니다. 예를 들어 애플리케이션이 메시지에 사진을 첨부한다면, 그 사진을 나타내는 `Photo` 모델도 있을 수 있습니다. 이런 경우 `Photo` 모델을 `attach` 메서드에 바로 전달할 수 있다면 편리하지 않을까요? 첨부 가능한 객체를 사용하면 바로 그렇게 할 수 있습니다.

<!-- To get started, implement the `Illuminate\Contracts\Mail\Attachable` interface on the object that will be attachable to messages. This interface dictates that your class defines a `toMailAttachment` method that returns an `Illuminate\Mail\Attachment` instance: -->
시작하려면 메시지에 첨부할 수 있어야 하는 객체에 `Illuminate\Contracts\Mail\Attachable` 인터페이스를 구현합니다. 이 인터페이스는 클래스가 `Illuminate\Mail\Attachment` 인스턴스를 반환하는 `toMailAttachment` 메서드를 정의해야 한다고 지정합니다.

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
첨부 가능한 객체를 정의한 뒤에는 이메일 메시지를 만들 때 `attachments` 메서드에서 해당 객체의 인스턴스를 반환할 수 있습니다.

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
물론 첨부 데이터는 Amazon S3 같은 원격 파일 storage service에 저장되어 있을 수도 있습니다. 따라서 Laravel은 애플리케이션의 [filesystem disks](/docs/13.x/filesystem) 중 하나에 저장된 데이터로부터 첨부 파일 인스턴스를 생성하는 것도 허용합니다.

```php
// Create an attachment from a file on your default disk...
return Attachment::fromStorage($this->path);

// Create an attachment from a file on a specific disk...
return Attachment::fromStorageDisk('backblaze', $this->path);
```

<!-- In addition, you may create attachment instances via data that you have in memory. To accomplish this, provide a closure to the `fromData` method. The closure should return the raw data that represents the attachment: -->
또한 메모리에 가지고 있는 데이터를 통해 첨부 파일 인스턴스를 만들 수도 있습니다. 이렇게 하려면 `fromData` 메서드에 클로저를 제공하십시오. 이 클로저는 첨부 파일을 나타내는 원시 데이터를 반환해야 합니다.

```php
return Attachment::fromData(fn () => $this->content, 'Photo Name');
```

<!-- Laravel also provides additional methods that you may use to customize your attachments. For example, you may use the `as` and `withMime` methods to customize the file's name and MIME type: -->
Laravel은 첨부 파일을 사용자 지정하는 데 사용할 수 있는 추가 메서드도 제공합니다. 예를 들어 `as` 및 `withMime` 메서드를 사용하여 파일 이름과 MIME 타입을 사용자 지정할 수 있습니다.

```php
return Attachment::fromPath('/path/to/file')
    ->as('Photo Name')
    ->withMime('image/jpeg');
```

<a name="headers"></a>
<!-- ### Headers -->
### Headers

<!-- Sometimes you may need to attach additional headers to the outgoing message. For instance, you may need to set a custom `Message-Id` or other arbitrary text headers. -->
때로는 발신 메시지에 추가 헤더를 첨부해야 할 수 있습니다. 예를 들어 사용자 지정 `Message-Id` 또는 그 밖의 임의 텍스트 헤더를 설정해야 할 수 있습니다.

<!-- To accomplish this, define a `headers` method on your mailable. The `headers` method should return an `Illuminate\Mail\Mailables\Headers` instance. This class accepts `messageId`, `references`, and `text` parameters. Of course, you may provide only the parameters you need for your particular message: -->
이를 위해 mailable에 `headers` 메서드를 정의합니다. `headers` 메서드는 `Illuminate\Mail\Mailables\Headers` 인스턴스를 반환해야 합니다. 이 클래스는 `messageId`, `references`, `text` 매개변수를 받습니다. 물론 특정 메시지에 필요한 매개변수만 제공하면 됩니다.

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
Mailgun 및 Postmark 같은 일부 서드파티 이메일 제공자는 메시지 "tags"와 "metadata"를 지원합니다. 이는 애플리케이션이 보낸 이메일을 그룹화하고 추적하는 데 사용할 수 있습니다. `Envelope` 정의를 통해 이메일 메시지에 태그와 메타데이터를 추가할 수 있습니다.

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
애플리케이션이 Mailgun 드라이버를 사용하고 있다면, [tags](https://documentation.mailgun.com/docs/mailgun/user-manual/tracking-messages/#tags) 및 [metadata](https://documentation.mailgun.com/docs/mailgun/user-manual/sending-messages/#attaching-metadata-to-messages)에 대한 자세한 정보는 Mailgun 문서를 참고할 수 있습니다. 마찬가지로 Postmark가 지원하는 [tags](https://postmarkapp.com/blog/tags-support-for-smtp) 및 [metadata](https://postmarkapp.com/support/article/1125-custom-metadata-faq)에 대한 자세한 정보는 Postmark 문서를 참고할 수 있습니다.

<!-- If your application is using Amazon SES to send emails, you should use the `metadata` method to attach [SES "tags"](https://docs.aws.amazon.com/ses/latest/APIReference/API_MessageTag.html) to the message. -->
애플리케이션이 Amazon SES를 사용하여 이메일을 보내고 있다면, `metadata` 메서드를 사용하여 메시지에 [SES "tags"](https://docs.aws.amazon.com/ses/latest/APIReference/API_MessageTag.html)를 첨부해야 합니다.

<a name="customizing-the-symfony-message"></a>
<!-- ### Customizing the Symfony Message -->
### Customizing the Symfony Message

<!-- Laravel's mail capabilities are powered by Symfony Mailer. Laravel allows you to register custom callbacks that will be invoked with the Symfony Message instance before sending the message. This gives you an opportunity to deeply customize the message before it is sent. To accomplish this, define a `using` parameter on your `Envelope` definition: -->
Laravel의 메일 기능은 Symfony Mailer를 기반으로 동작합니다. Laravel은 메시지를 보내기 전에 Symfony Message 인스턴스와 함께 호출될 사용자 지정 콜백을 등록할 수 있게 해 줍니다. 이를 통해 메시지가 전송되기 전에 메시지를 깊이 있게 사용자 지정할 수 있습니다. 이를 위해 `Envelope` 정의에 `using` 매개변수를 정의합니다.

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
Markdown mailable 메시지를 사용하면 mailable에서 [mail notifications](/docs/13.x/notifications#mail-notifications)의 미리 만들어진 템플릿과 컴포넌트를 활용할 수 있습니다. 메시지가 Markdown으로 작성되므로 Laravel은 메시지를 위한 아름답고 반응형인 HTML 템플릿을 렌더링할 수 있으며, 동시에 일반 텍스트 버전도 자동으로 생성합니다.

<a name="generating-markdown-mailables"></a>
<!-- ### Generating Markdown Mailables -->
### Generating Markdown Mailables

<!-- To generate a mailable with a corresponding Markdown template, you may use the `--markdown` option of the `make:mail` Artisan command: -->
해당 Markdown 템플릿을 함께 가진 mailable을 생성하려면 `make:mail` Artisan 명령어의 `--markdown` 옵션을 사용할 수 있습니다.

```shell
php artisan make:mail OrderShipped --markdown=mail.orders.shipped
```

<!-- Then, when configuring the mailable `Content` definition within its `content` method, use the `markdown` parameter instead of the `view` parameter: -->
그런 다음 mailable의 `content` 메서드 안에서 `Content` 정의를 설정할 때, `view` 매개변수 대신 `markdown` 매개변수를 사용합니다.

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
Markdown mailable은 Blade 컴포넌트와 Markdown 문법을 함께 사용합니다. 이를 통해 Laravel이 미리 제공하는 이메일 UI 컴포넌트를 활용하면서 메일 메시지를 쉽게 구성할 수 있습니다.

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
> Markdown 이메일을 작성할 때는 과도한 들여쓰기를 사용하지 마십시오. Markdown 표준에 따라 Markdown 파서는 들여쓰기된 내용을 코드 블록으로 렌더링합니다.

<a name="button-component"></a>
<!-- #### Button Component -->
#### Button Component

<!-- The button component renders a centered button link. The component accepts two arguments, a `url` and an optional `color`. Supported colors are `primary`, `success`, and `error`. You may add as many button components to a message as you wish: -->
버튼 컴포넌트는 가운데 정렬된 버튼 링크를 렌더링합니다. 이 컴포넌트는 `url`과 선택 사항인 `color`, 두 가지 인수를 받습니다. 지원되는 색상은 `primary`, `success`, `error`입니다. 메시지에는 원하는 만큼 버튼 컴포넌트를 추가할 수 있습니다.

```blade
<x-mail::button :url="$url" color="success">
View Order
</x-mail::button>
```

<a name="panel-component"></a>
<!-- #### Panel Component -->
#### Panel Component

<!-- The panel component renders the given block of text in a panel that has a slightly different background color than the rest of the message. This allows you to draw attention to a given block of text: -->
패널 컴포넌트는 전달된 텍스트 블록을 메시지의 나머지 부분과 약간 다른 배경색을 가진 패널 안에 렌더링합니다. 이를 통해 특정 텍스트 블록에 독자의 주의를 끌 수 있습니다.

```blade
<x-mail::panel>
This is the panel content.
</x-mail::panel>
```

<a name="table-component"></a>
<!-- #### Table Component -->
#### Table Component

<!-- The table component allows you to transform a Markdown table into an HTML table. The component accepts the Markdown table as its content. Table column alignment is supported using the default Markdown table alignment syntax: -->
테이블 컴포넌트를 사용하면 Markdown 테이블을 HTML 테이블로 변환할 수 있습니다. 이 컴포넌트는 Markdown 테이블을 내용으로 받습니다. 테이블 컬럼 정렬은 기본 Markdown 테이블 정렬 문법을 사용하여 지원됩니다.

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
모든 Markdown 메일 컴포넌트를 애플리케이션으로 내보내 커스터마이징할 수 있습니다. 컴포넌트를 내보내려면 `vendor:publish` Artisan 명령어를 사용하여 `laravel-mail` asset tag를 게시합니다.

```shell
php artisan vendor:publish --tag=laravel-mail
```

<!-- This command will publish the Markdown mail components to the `resources/views/vendor/mail` directory. The `mail` directory will contain an `html` and a `text` directory, each containing their respective representations of every available component. You are free to customize these components however you like. -->
이 명령어는 Markdown 메일 컴포넌트를 `resources/views/vendor/mail` 디렉터리에 게시합니다. `mail` 디렉터리에는 `html` 디렉터리와 `text` 디렉터리가 포함되며, 각각 사용 가능한 모든 컴포넌트의 해당 표현을 담고 있습니다. 이러한 컴포넌트는 원하는 방식으로 자유롭게 커스터마이징할 수 있습니다.

<a name="customizing-the-css"></a>
<!-- #### Customizing the CSS -->
#### Customizing the CSS

<!-- After exporting the components, the `resources/views/vendor/mail/html/themes` directory will contain a `default.css` file. You may customize the CSS in this file and your styles will automatically be converted to inline CSS styles within the HTML representations of your Markdown mail messages. -->
컴포넌트를 내보낸 후에는 `resources/views/vendor/mail/html/themes` 디렉터리에 `default.css` 파일이 포함됩니다. 이 파일의 CSS를 커스터마이징할 수 있으며, 작성한 스타일은 Markdown 메일 메시지의 HTML 표현 안에서 자동으로 inline CSS 스타일로 변환됩니다.

<!-- If you would like to build an entirely new theme for Laravel's Markdown components, you may place a CSS file within the `html/themes` directory. After naming and saving your CSS file, update the `theme` option of your application's `config/mail.php` configuration file to match the name of your new theme. -->
Laravel의 Markdown 컴포넌트를 위한 완전히 새로운 테마를 만들고 싶다면 `html/themes` 디렉터리 안에 CSS 파일을 배치할 수 있습니다. CSS 파일의 이름을 정하고 저장한 뒤, 애플리케이션의 `config/mail.php` 설정 파일에서 `theme` 옵션을 새 테마 이름과 일치하도록 업데이트합니다.

<!-- To customize the theme for an individual mailable, you may set the `$theme` property of the mailable class to the name of the theme that should be used when sending that mailable. -->
개별 mailable의 테마를 커스터마이징하려면 해당 mailable을 보낼 때 사용할 테마 이름으로 mailable 클래스의 `$theme` 속성을 설정하면 됩니다.

<a name="sending-mail"></a>
<!-- ## Sending Mail -->
## Sending Mail

<!-- To send a message, use the `to` method on the `Mail` [facade](/docs/13.x/facades). The `to` method accepts an email address, a user instance, or a collection of users. If you pass an object or collection of objects, the mailer will automatically use their `email` and `name` properties when determining the email's recipients, so make sure these attributes are available on your objects. Once you have specified your recipients, you may pass an instance of your mailable class to the `send` method: -->
메시지를 보내려면 `Mail` [facade](/docs/13.x/facades)의 `to` 메서드를 사용합니다. `to` 메서드는 이메일 주소, 사용자 인스턴스, 또는 사용자 컬렉션을 받습니다. 객체나 객체 컬렉션을 전달하면 mailer는 이메일의 수신자를 결정할 때 해당 객체의 `email` 및 `name` 속성을 자동으로 사용합니다. 따라서 이러한 속성이 객체에 제공되어 있는지 확인해야 합니다. 수신자를 지정한 뒤에는 mailable 클래스의 인스턴스를 `send` 메서드에 전달할 수 있습니다.

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
메시지를 보낼 때 "to" 수신자만 지정해야 하는 것은 아닙니다. 각 메서드를 체이닝하여 "to", "cc", "bcc" 수신자를 자유롭게 설정할 수 있습니다.

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
때로는 수신자나 이메일 주소 배열을 반복하면서 mailable을 여러 수신자에게 보내야 할 수 있습니다. 하지만 `to` 메서드는 mailable의 수신자 목록에 이메일 주소를 추가하므로, 루프를 한 번 돌 때마다 이전의 모든 수신자에게도 이메일이 다시 전송됩니다. 따라서 각 수신자마다 항상 mailable 인스턴스를 새로 생성해야 합니다.

```php
foreach (['taylor@example.com', 'dries@example.com'] as $recipient) {
    Mail::to($recipient)->send(new OrderShipped($order));
}
```

<a name="sending-mail-via-a-specific-mailer"></a>
<!-- #### Sending Mail via a Specific Mailer -->
#### Sending Mail via a Specific Mailer

<!-- By default, Laravel will send email using the mailer configured as the `default` mailer in your application's `mail` configuration file. However, you may use the `mailer` method to send a message using a specific mailer configuration: -->
기본적으로 Laravel은 애플리케이션의 `mail` 설정 파일에서 `default` mailer로 설정된 mailer를 사용하여 이메일을 보냅니다. 하지만 `mailer` 메서드를 사용하면 특정 mailer 설정으로 메시지를 보낼 수 있습니다.

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
이메일 메시지를 보내는 작업은 애플리케이션의 응답 시간에 부정적인 영향을 줄 수 있으므로, 많은 개발자는 이메일 메시지를 큐에 넣어 백그라운드에서 보내도록 선택합니다. Laravel은 내장된 [unified queue API](/docs/13.x/queues)를 사용하여 이를 쉽게 처리할 수 있게 해줍니다. 메일 메시지를 큐에 넣으려면 메시지의 수신자를 지정한 뒤 `Mail` 파사드의 `queue` 메서드를 사용합니다.

```php
Mail::to($request->user())
    ->cc($moreUsers)
    ->bcc($evenMoreUsers)
    ->queue(new OrderShipped($order));
```

<!-- This method will automatically take care of pushing a job onto the queue so the message is sent in the background. You will need to [configure your queues](/docs/13.x/queues) before using this feature. -->
이 메서드는 메시지가 백그라운드에서 전송되도록 job을 큐에 넣는 작업을 자동으로 처리합니다. 이 기능을 사용하기 전에 [configure your queues](/docs/13.x/queues)해야 합니다.

<a name="delayed-message-queueing"></a>
<!-- #### Delayed Message Queueing -->
#### Delayed Message Queueing

<!-- If you wish to delay the delivery of a queued email message, you may use the `later` method. As its first argument, the `later` method accepts a `DateTime` instance indicating when the message should be sent: -->
큐에 들어간 이메일 메시지의 전송을 지연하고 싶다면 `later` 메서드를 사용할 수 있습니다. `later` 메서드의 첫 번째 인수는 메시지를 보낼 시점을 나타내는 `DateTime` 인스턴스를 받습니다.

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
`make:mail` 명령어로 생성된 모든 mailable 클래스는 `Illuminate\Bus\Queueable` trait를 사용하므로, 어떤 mailable 클래스 인스턴스에서든 `onQueue` 및 `onConnection` 메서드를 호출할 수 있습니다. 이를 통해 메시지에 사용할 연결과 큐 이름을 지정할 수 있습니다.

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
또는, mailable 클래스에 `Connection` 및 `Queue` 속성(attribute)을 사용하여 연결과 큐를 지정할 수도 있습니다.

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
항상 큐에 넣고 싶은 mailable 클래스가 있다면 해당 클래스에서 `ShouldQueue` contract를 구현할 수 있습니다. 이렇게 하면 메일을 보낼 때 `send` 메서드를 호출하더라도, mailable이 contract를 구현하고 있기 때문에 여전히 큐에 들어갑니다.

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
큐 처리된 mailable이 데이터베이스 트랜잭션 안에서 디스패치되면, 데이터베이스 트랜잭션이 커밋되기 전에 큐에서 처리될 수 있습니다. 이런 일이 발생하면 데이터베이스 트랜잭션 중에 모델이나 데이터베이스 레코드에 적용한 업데이트가 아직 데이터베이스에 반영되지 않았을 수 있습니다. 또한 트랜잭션 안에서 생성된 모델이나 데이터베이스 레코드가 아직 데이터베이스에 존재하지 않을 수도 있습니다. mailable이 이러한 모델에 의존한다면, 큐 처리된 mailable을 보내는 job이 처리될 때 예상치 못한 오류가 발생할 수 있습니다.

<!-- If your queue connection's `after_commit` configuration option is set to `false`, you may still indicate that a particular queued mailable should be dispatched after all open database transactions have been committed by calling the `afterCommit` method when sending the mail message: -->
큐 연결의 `after_commit` 설정 옵션이 `false`로 설정되어 있더라도, 메일 메시지를 보낼 때 `afterCommit` 메서드를 호출하면 특정 큐 처리 mailable이 열려 있는 모든 데이터베이스 트랜잭션이 커밋된 뒤에 디스패치되도록 지정할 수 있습니다.

```php
Mail::to($request->user())->send(
    (new OrderShipped($order))->afterCommit()
);
```

<!-- Alternatively, you may call the `afterCommit` method from your mailable's constructor: -->
또는 mailable의 생성자에서 `afterCommit` 메서드를 호출할 수도 있습니다.

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
> 이러한 문제를 다루는 방법에 대해 더 알아보려면 [queued jobs and database transactions](/docs/13.x/queues#jobs-and-database-transactions)에 관한 문서를 확인하십시오.

<a name="queued-email-failures"></a>
<!-- #### Queued Email Failures -->
#### Queued Email Failures

<!-- When a queued email fails, the `failed` method on the queued mailable class will be invoked if it has been defined. The `Throwable` instance that caused the queued email to fail will be passed to the `failed` method: -->
큐 처리된 이메일이 실패하면, 큐 처리된 mailable 클래스에 `failed` 메서드가 정의되어 있을 경우 해당 메서드가 호출됩니다. 큐 처리된 이메일이 실패하게 만든 `Throwable` 인스턴스가 `failed` 메서드로 전달됩니다.

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
때로는 mailable을 보내지 않고 HTML 내용을 가져오고 싶을 수 있습니다. 이를 위해 mailable의 `render` 메서드를 호출할 수 있습니다. 이 메서드는 평가된 mailable의 HTML 내용을 문자열로 반환합니다.

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
mailable의 템플릿을 디자인할 때는 일반적인 Blade 템플릿처럼 렌더링된 mailable을 브라우저에서 빠르게 미리보는 것이 편리합니다. 이러한 이유로 Laravel은 route closure나 controller에서 어떤 mailable이든 직접 반환할 수 있도록 허용합니다. mailable이 반환되면 브라우저에서 렌더링되어 표시되므로, 실제 이메일 주소로 보내지 않고도 디자인을 빠르게 미리볼 수 있습니다.

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
Laravel은 요청의 현재 locale이 아닌 다른 locale로 mailable을 보낼 수 있게 해주며, 메일이 큐에 들어가더라도 이 locale을 기억합니다.

<!-- To accomplish this, the `Mail` facade offers a `locale` method to set the desired language. The application will change into this locale when the mailable's template is being evaluated and then revert back to the previous locale when evaluation is complete: -->
이를 위해 `Mail` 파사드는 원하는 언어를 설정하는 `locale` 메서드를 제공합니다. mailable의 템플릿이 평가되는 동안 애플리케이션은 해당 locale로 전환되고, 평가가 완료되면 이전 locale로 되돌아갑니다.

```php
Mail::to($request->user())->locale('es')->send(
    new OrderShipped($order)
);
```

<a name="user-preferred-locales"></a>
<!-- #### User Preferred Locales -->
#### User Preferred Locales

<!-- Sometimes, applications store each user's preferred locale. By implementing the `HasLocalePreference` contract on one or more of your models, you may instruct Laravel to use this stored locale when sending mail: -->
때로는 애플리케이션이 각 사용자의 선호 locale을 저장합니다. 하나 이상의 모델에서 `HasLocalePreference` contract를 구현하면, Laravel에 메일을 보낼 때 저장된 locale을 사용하도록 지시할 수 있습니다.

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
인터페이스를 구현하면 Laravel은 해당 모델로 mailable과 알림을 보낼 때 자동으로 선호 locale을 사용합니다. 따라서 이 인터페이스를 사용할 때는 `locale` 메서드를 호출할 필요가 없습니다.

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
Laravel은 mailable의 구조를 검사할 수 있는 다양한 메서드를 제공합니다. 또한 Laravel은 mailable에 기대하는 내용이 포함되어 있는지 테스트하기 위한 여러 편리한 메서드를 제공합니다.

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
예상할 수 있듯이, "HTML" assertion은 mailable의 HTML 버전에 주어진 문자열이 포함되어 있는지 확인하고, "text" assertion은 mailable의 일반 텍스트 버전에 주어진 문자열이 포함되어 있는지 확인합니다.

<a name="testing-mailable-sending"></a>
<!-- ### Testing Mailable Sending -->
### Testing Mailable Sending

<!-- We suggest testing the content of your mailables separately from your tests that assert that a given mailable was "sent" to a specific user. Typically, the content of mailables is not relevant to the code you are testing, and it is sufficient to simply assert that Laravel was instructed to send a given mailable. -->
특정 mailable이 특정 사용자에게 "전송"되었는지 확인하는 테스트와는 별도로, mailable의 내용을 테스트하는 것을 권장합니다. 일반적으로 mailable의 내용은 테스트 중인 코드와 직접 관련이 없으며, Laravel에 특정 mailable을 전송하라고 지시했는지만 확인하면 충분합니다.

<!-- You may use the `Mail` facade's `fake` method to prevent mail from being sent. After calling the `Mail` facade's `fake` method, you may then assert that mailables were instructed to be sent to users and even inspect the data the mailables received: -->
메일이 실제로 전송되지 않도록 `Mail` 파사드의 `fake` 메서드를 사용할 수 있습니다. `Mail` 파사드의 `fake` 메서드를 호출한 뒤에는 mailable이 사용자에게 전송되도록 지시되었는지 확인할 수 있으며, mailable이 받은 데이터까지 검사할 수 있습니다.

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
mailable을 백그라운드에서 전송되도록 큐에 넣고 있다면 `assertSent` 대신 `assertQueued` 메서드를 사용해야 합니다.

```php
Mail::assertQueued(OrderShipped::class);
Mail::assertQueuedOnce(OrderShipped::class);
Mail::assertNotQueued(OrderShipped::class);
Mail::assertNothingQueued();
Mail::assertQueuedCount(3);
```

<!-- You can also assert the total number of mailables that have been sent or queued using the `assertOutgoingCount` method: -->
`assertOutgoingCount` 메서드를 사용하여 전송되었거나 큐에 등록된 mailable의 전체 개수도 확인할 수 있습니다.

```php
Mail::assertOutgoingCount(3);
```

<!-- You may pass a closure to the `assertSent`, `assertNotSent`, `assertQueued`, or `assertNotQueued` methods in order to assert that a mailable was sent that passes a given "truth test". If at least one mailable was sent that passes the given truth test then the assertion will be successful: -->
`assertSent`, `assertNotSent`, `assertQueued`, `assertNotQueued` 메서드에 클로저를 전달하여, 주어진 "진리 테스트"를 통과하는 mailable이 전송되었는지 확인할 수 있습니다. 주어진 진리 테스트를 통과하는 mailable이 하나라도 전송되었다면 assertion은 성공합니다.

```php
Mail::assertSent(function (OrderShipped $mail) use ($order) {
    return $mail->order->id === $order->id;
});
```

<!-- When calling the `Mail` facade's assertion methods, the mailable instance accepted by the provided closure exposes helpful methods for examining the mailable: -->
`Mail` 파사드의 assertion 메서드를 호출할 때, 제공된 클로저가 받는 mailable 인스턴스는 mailable을 검사하는 데 유용한 메서드를 제공합니다.

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
mailable 인스턴스에는 mailable의 첨부 파일을 검사하는 데 유용한 여러 메서드도 포함되어 있습니다.

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
메일이 전송되지 않았는지 확인하는 메서드가 `assertNotSent`와 `assertNotQueued` 두 가지라는 점을 눈치챘을 수 있습니다. 때로는 메일이 전송되지도, 큐에 등록되지도 않았는지 확인하고 싶을 수 있습니다. 이를 위해 `assertNothingOutgoing` 및 `assertNotOutgoing` 메서드를 사용할 수 있습니다.

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
이메일을 보내는 애플리케이션을 개발할 때, 실제 이메일 주소로 이메일이 전송되는 것은 원하지 않을 가능성이 큽니다. Laravel은 로컬 개발 중 실제 이메일 전송을 "비활성화"하는 여러 방법을 제공합니다.

<a name="log-driver"></a>
<!-- #### Log Driver -->
#### Log Driver

<!-- Instead of sending your emails, the `log` mail driver will write all email messages to your log files for inspection. Typically, this driver would only be used during local development. For more information on configuring your application per environment, check out the [configuration documentation](/docs/13.x/configuration#environment-configuration). -->
이메일을 전송하는 대신, `log` 메일 드라이버는 모든 이메일 메시지를 검사할 수 있도록 로그 파일에 기록합니다. 일반적으로 이 드라이버는 로컬 개발 중에만 사용합니다. 환경별로 애플리케이션을 설정하는 방법에 대한 자세한 내용은 [configuration documentation](/docs/13.x/configuration#environment-configuration)를 확인하십시오.

<a name="mailtrap"></a>
<!-- #### HELO / Mailtrap / Mailpit -->
#### HELO / Mailtrap / Mailpit

<!-- Alternatively, you may use a service like [HELO](https://usehelo.com) or [Mailtrap](https://mailtrap.io) and the `smtp` driver to send your email messages to a "dummy" mailbox where you may view them in a true email client. This approach has the benefit of allowing you to actually inspect the final emails in Mailtrap's message viewer. -->
또는 [HELO](https://usehelo.com)나 [Mailtrap](https://mailtrap.io) 같은 서비스와 `smtp` 드라이버를 사용하여, 실제 이메일 클라이언트에서 확인할 수 있는 "더미" 메일함으로 이메일 메시지를 보낼 수 있습니다. 이 방식은 Mailtrap의 메시지 뷰어에서 최종 이메일을 실제로 검사할 수 있다는 장점이 있습니다.

<!-- If you are using [Laravel Sail](/docs/13.x/sail), you may preview your messages using [Mailpit](https://github.com/axllent/mailpit). When Sail is running, you may access the Mailpit interface at: `http://localhost:8025`. -->
[Laravel Sail](/docs/13.x/sail)을 사용하고 있다면 [Mailpit](https://github.com/axllent/mailpit)을 사용하여 메시지를 미리 볼 수 있습니다. Sail이 실행 중이면 다음 주소에서 Mailpit 인터페이스에 접근할 수 있습니다: `http://localhost:8025`.

<a name="using-a-global-to-address"></a>
<!-- #### Using a Global `to` Address -->
#### Using a Global `to` Address

<!-- Finally, you may specify a global "to" address by invoking the `alwaysTo` method offered by the `Mail` facade. Typically, this method should be called from the `boot` method of one of your application's service providers: -->
마지막으로, `Mail` 파사드가 제공하는 `alwaysTo` 메서드를 호출하여 전역 "to" 주소를 지정할 수 있습니다. 일반적으로 이 메서드는 애플리케이션의 서비스 프로바이더 중 하나의 `boot` 메서드에서 호출해야 합니다.

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
`alwaysTo` 메서드를 사용할 때, 메일 메시지에 추가로 지정된 "cc" 또는 "bcc" 주소는 모두 제거됩니다.

<a name="events"></a>
<!-- ## Events -->
## Events

<!-- Laravel dispatches two events while sending mail messages. The `MessageSending` event is dispatched prior to a message being sent, while the `MessageSent` event is dispatched after a message has been sent. Remember, these events are dispatched when the mail is being *sent*, not when it is queued. You may create [event listeners](/docs/13.x/events) for these events within your application: -->
Laravel은 메일 메시지를 전송하는 동안 두 가지 이벤트를 디스패치합니다. `MessageSending` 이벤트는 메시지가 전송되기 전에 디스패치되고, `MessageSent` 이벤트는 메시지가 전송된 후에 디스패치됩니다. 이 이벤트들은 메일이 큐에 등록될 때가 아니라 실제로 *전송*될 때 디스패치된다는 점을 기억하십시오. 애플리케이션 안에서 이러한 이벤트에 대한 [event listeners](/docs/13.x/events)를 만들 수 있습니다.

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
Laravel에는 다양한 메일 트랜스포트가 포함되어 있습니다. 하지만 Laravel이 기본적으로 지원하지 않는 다른 서비스를 통해 이메일을 전달하기 위해 직접 트랜스포트를 작성하고 싶을 수 있습니다. 시작하려면 `Symfony\Component\Mailer\Transport\AbstractTransport` 클래스를 확장하는 클래스를 정의하십시오. 그런 다음 트랜스포트에 `doSend` 및 `__toString` 메서드를 구현하십시오.

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
커스텀 트랜스포트를 정의한 뒤에는 `Mail` 파사드가 제공하는 `extend` 메서드를 통해 등록할 수 있습니다. 일반적으로 이 작업은 애플리케이션의 `AppServiceProvider`에 있는 `boot` 메서드 안에서 수행해야 합니다. `$config` 인수가 `extend` 메서드에 제공된 클로저로 전달됩니다. 이 인수에는 애플리케이션의 `config/mail.php` 설정 파일에서 해당 mailer에 대해 정의된 설정 배열이 들어 있습니다.

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
커스텀 트랜스포트를 정의하고 등록한 뒤에는, 애플리케이션의 `config/mail.php` 설정 파일 안에 새 트랜스포트를 사용하는 mailer 정의를 만들 수 있습니다.

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
Laravel은 Mailgun 및 Postmark와 같이 Symfony가 유지 관리하는 일부 기존 메일 트랜스포트를 지원합니다. 하지만 Symfony가 유지 관리하는 추가 트랜스포트를 지원하도록 Laravel을 확장하고 싶을 수 있습니다. 필요한 Symfony mailer를 Composer로 설치하고 Laravel에 트랜스포트를 등록하면 됩니다. 예를 들어 "Brevo"(이전 이름은 "Sendinblue") Symfony mailer를 설치하고 등록할 수 있습니다.

```shell
composer require symfony/brevo-mailer symfony/http-client
```

<!-- Once the Brevo mailer package has been installed, you may add an entry for your Brevo API credentials to your application's `services` configuration file: -->
Brevo mailer 패키지가 설치되면, 애플리케이션의 `services` 설정 파일에 Brevo API 자격 증명 항목을 추가할 수 있습니다.

```php
'brevo' => [
    'key' => env('BREVO_API_KEY'),
],
```

<!-- Next, you may use the `Mail` facade's `extend` method to register the transport with Laravel. Typically, this should be done within the `boot` method of a service provider: -->
다음으로 `Mail` 파사드의 `extend` 메서드를 사용하여 Laravel에 트랜스포트를 등록할 수 있습니다. 일반적으로 이 작업은 서비스 프로바이더의 `boot` 메서드 안에서 수행해야 합니다.

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
트랜스포트를 등록한 뒤에는 애플리케이션의 `config/mail.php` 설정 파일 안에 새 트랜스포트를 사용하는 mailer 정의를 만들 수 있습니다.

```php
'brevo' => [
    'transport' => 'brevo',
    // ...
],
```
