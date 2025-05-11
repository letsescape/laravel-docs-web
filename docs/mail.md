# 메일 (Mail)

- [소개](#introduction)
    - [설정](#configuration)
    - [드라이버 사전 준비 사항](#driver-prerequisites)
    - [장애 조치(failover) 설정](#failover-configuration)
    - [라운드 로빈(round robin) 설정](#round-robin-configuration)
- [메일러블 클래스 생성](#generating-mailables)
- [메일러블 작성하기](#writing-mailables)
    - [발신자 설정](#configuring-the-sender)
    - [뷰(view) 설정](#configuring-the-view)
    - [뷰 데이터(View Data)](#view-data)
    - [첨부 파일](#attachments)
    - [인라인 첨부 파일](#inline-attachments)
    - [Attachable 객체](#attachable-objects)
    - [헤더](#headers)
    - [태그 및 메타데이터](#tags-and-metadata)
    - [Symfony 메시지 커스터마이징](#customizing-the-symfony-message)
- [마크다운 메일러블](#markdown-mailables)
    - [마크다운 메일러블 생성](#generating-markdown-mailables)
    - [마크다운 메시지 작성](#writing-markdown-messages)
    - [컴포넌트 커스터마이징](#customizing-the-components)
- [메일 전송](#sending-mail)
    - [메일 큐잉](#queueing-mail)
- [메일러블 렌더링](#rendering-mailables)
    - [브라우저에서 메일러블 미리보기](#previewing-mailables-in-the-browser)
- [메일러블 지역화](#localizing-mailables)
- [테스트](#testing-mailables)
    - [메일러블 콘텐츠 테스트](#testing-mailable-content)
    - [메일러블 전송 테스트](#testing-mailable-sending)
- [메일과 로컬 개발 환경](#mail-and-local-development)
- [이벤트](#events)
- [커스텀 트랜스포트](#custom-transports)
    - [추가 Symfony 트랜스포트](#additional-symfony-transports)

<a name="introduction"></a>
## 소개

이메일을 전송하는 일은 복잡하지 않아도 됩니다. 라라벨은 인기 있는 [Symfony Mailer](https://symfony.com/doc/current/mailer.html) 컴포넌트를 기반으로 한 깔끔하고 단순한 이메일 API를 제공합니다. 라라벨과 Symfony Mailer는 SMTP, Mailgun, Postmark, Resend, Amazon SES, 그리고 `sendmail`을 통한 이메일 전송 드라이버를 제공하므로, 여러분이 원하는 로컬 또는 클라우드 기반 서비스로 쉽게 메일 전송을 시작할 수 있습니다.

<a name="configuration"></a>
### 설정

라라벨에서 이메일 서비스는 애플리케이션의 `config/mail.php` 설정 파일에서 관리할 수 있습니다. 이 파일에 설정된 각각의 메일러는 고유한 설정과 "트랜스포트"를 가질 수 있으므로, 애플리케이션에서 다양한 이메일 서비스를 선택적으로 사용할 수 있습니다. 예를 들어, 트랜잭션 이메일은 Postmark로, 대량 메일은 Amazon SES로 보내도록 구분할 수 있습니다.

`mail` 설정 파일 안에는 `mailers`라는 설정 배열이 있습니다. 이 배열에는 라라벨에서 지원하는 주요 메일 드라이버/트랜스포트 각각에 대한 샘플 설정 항목이 들어 있습니다. 그리고 `default` 설정 값은 애플리케이션에서 이메일을 전송할 때 기본적으로 어떤 메일러를 사용할지 결정합니다.

<a name="driver-prerequisites"></a>
### 드라이버 / 트랜스포트 사전 준비 사항

Mailgun, Postmark, Resend, MailerSend와 같은 API 기반 드라이버는 SMTP 서버를 통해 메일을 전송하는 것보다 대체로 더 간단하고 빠릅니다. 가능하다면 이러한 드라이버 중 하나를 사용하는 것을 권장합니다.

<a name="mailgun-driver"></a>
#### Mailgun 드라이버

Mailgun 드라이버를 사용하려면 Composer를 통해 Symfony의 Mailgun Mailer 트랜스포트를 설치해야 합니다:

```shell
composer require symfony/mailgun-mailer symfony/http-client
```

설치 후, 애플리케이션의 `config/mail.php` 설정 파일에서 두 가지를 변경해야 합니다. 먼저, 기본 메일러를 `mailgun`으로 설정하세요:

```php
'default' => env('MAIL_MAILER', 'mailgun'),
```

그 다음, `mailers` 배열에 아래와 같은 구성 항목을 추가하세요:

```php
'mailgun' => [
    'transport' => 'mailgun',
    // 'client' => [
    //     'timeout' => 5,
    // ],
],
```

기본 메일러 설정을 마쳤다면, `config/services.php` 설정 파일에 아래 옵션도 추가해야 합니다:

```php
'mailgun' => [
    'domain' => env('MAILGUN_DOMAIN'),
    'secret' => env('MAILGUN_SECRET'),
    'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
    'scheme' => 'https',
],
```

미국 [Mailgun 지역](https://documentation.mailgun.com/en/latest/api-intro.html#mailgun-regions)이 아니라 다른 지역을 사용하는 경우, `services` 설정 파일에서 해당 지역 엔드포인트를 지정할 수 있습니다:

```php
'mailgun' => [
    'domain' => env('MAILGUN_DOMAIN'),
    'secret' => env('MAILGUN_SECRET'),
    'endpoint' => env('MAILGUN_ENDPOINT', 'api.eu.mailgun.net'),
    'scheme' => 'https',
],
```

<a name="postmark-driver"></a>
#### Postmark 드라이버

[Postmark](https://postmarkapp.com/) 드라이버를 사용하려면 Composer를 통해 Symfony의 Postmark Mailer 트랜스포트를 설치하세요:

```shell
composer require symfony/postmark-mailer symfony/http-client
```

이후 애플리케이션의 `config/mail.php` 파일에서 `default` 옵션을 `postmark`로 설정합니다. 기본 메일러 구성을 마치고 나면, `config/services.php` 파일에 아래와 같은 옵션이 있는지 확인하세요:

```php
'postmark' => [
    'token' => env('POSTMARK_TOKEN'),
],
```

특정 메일러에 대해 사용하고자 하는 Postmark 메시지 스트림을 지정하려면, 메일러의 설정 배열에 `message_stream_id` 옵션을 추가할 수 있습니다. 해당 설정 배열은 `config/mail.php` 파일에서 찾을 수 있습니다:

```php
'postmark' => [
    'transport' => 'postmark',
    'message_stream_id' => env('POSTMARK_MESSAGE_STREAM_ID'),
    // 'client' => [
    //     'timeout' => 5,
    // ],
],
```

이렇게 하면 서로 다른 메시지 스트림을 사용하는 여러 Postmark 메일러를 설정할 수도 있습니다.

<a name="resend-driver"></a>
#### Resend 드라이버

[Resend](https://resend.com/) 드라이버를 사용하려면 Composer를 통해 Resend의 PHP SDK를 설치하세요:

```shell
composer require resend/resend-php
```

이후 애플리케이션의 `config/mail.php` 설정 파일에서 `default` 옵션을 `resend`로 변경하고, `config/services.php` 파일에 아래와 같은 옵션이 있는지 확인합니다:

```php
'resend' => [
    'key' => env('RESEND_KEY'),
],
```

<a name="ses-driver"></a>
#### SES 드라이버

Amazon SES 드라이버를 사용하려면 먼저 Amazon AWS SDK for PHP를 설치해야 합니다. Composer 패키지 매니저를 이용해 아래와 같이 설치할 수 있습니다:

```shell
composer require aws/aws-sdk-php
```

그 다음 `config/mail.php` 파일에서 `default` 옵션을 `ses`로 설정하고, `config/services.php` 파일에 아래와 같은 옵션이 포함되어 있는지 확인하세요:

```php
'ses' => [
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
],
```

AWS의 [임시 자격 증명](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_use-resources.html)을 세션 토큰을 통해 사용하고 싶다면, SES 설정에 `token` 키를 추가할 수 있습니다:

```php
'ses' => [
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    'token' => env('AWS_SESSION_TOKEN'),
],
```

SES의 [구독 관리 기능](https://docs.aws.amazon.com/ses/latest/dg/sending-email-subscription-management.html)을 활용하려면, 메일 메시지의 [headers](#headers) 메서드에서 반환하는 배열에 `X-Ses-List-Management-Options` 헤더를 추가하세요:

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

라라벨이 이메일 전송 시 AWS SDK의 `SendEmail` 메서드에 추가 옵션을 전달해야 한다면, `ses` 설정 내부에 `options` 배열을 정의할 수 있습니다:

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

<a name="mailersend-driver"></a>
#### MailerSend 드라이버

[MailerSend](https://www.mailersend.com/)는 트랜잭션 이메일과 SMS 서비스를 제공합니다. 이 서비스는 라라벨을 위한 자체 API 기반 메일 드라이버 패키지를 유지 관리합니다. Composer 패키지 매니저를 통해 아래와 같이 패키지를 설치할 수 있습니다:

```shell
composer require mailersend/laravel-driver
```

설치 후, 애플리케이션의 `.env` 파일에 `MAILERSEND_API_KEY` 환경 변수를 추가합니다. 그리고 `MAIL_MAILER` 환경 변수도 `mailersend`로 정의해야 합니다:

```ini
MAIL_MAILER=mailersend
MAIL_FROM_ADDRESS=app@yourdomain.com
MAIL_FROM_NAME="App Name"

MAILERSEND_API_KEY=your-api-key
```

마지막으로, 애플리케이션의 `config/mail.php` 설정 파일 내 `mailers` 배열에 MailerSend를 추가하세요:

```php
'mailersend' => [
    'transport' => 'mailersend',
],
```

호스팅된 템플릿 사용 방법 등 MailerSend에 대한 더 자세한 내용은 [MailerSend 드라이버 공식 문서](https://github.com/mailersend/mailersend-laravel-driver#usage)를 참고하세요.

<a name="failover-configuration"></a>
### 장애 조치(failover) 설정

외부 서비스로 애플리케이션의 메일을 보내도록 설정했더라도, 해당 서비스가 다운될 수 있습니다. 이런 경우를 대비해, 주된 메일 전송 드라이버가 실패할 때 사용되는 백업 메일 전송 설정을 하나 이상 정의해 두면 유용합니다.

이를 위해서는 애플리케이션의 `mail` 설정 파일에 `failover` 트랜스포트를 사용하는 메일러를 정의해야 합니다. 장애 조치 메일러 설정 배열에는, 메일 전송 시 참조할 메일러들의 순서를 명시한 `mailers` 배열이 포함되어야 합니다:

```php
'mailers' => [
    'failover' => [
        'transport' => 'failover',
        'mailers' => [
            'postmark',
            'mailgun',
            'sendmail',
        ],
    ],

    // ...
],
```

장애 조치용 메일러를 정의했다면, 애플리케이션의 기본 메일러로 지정해야 합니다. `mail` 설정 파일의 `default` 설정값을 해당 메일러 이름(`failover`)으로 지정하세요:

```php
'default' => env('MAIL_MAILER', 'failover'),
```

<a name="round-robin-configuration"></a>
### 라운드 로빈(round robin) 설정

`roundrobin` 트랜스포트를 사용하면 여러 메일러로 메일 발송 작업을 분산할 수 있습니다. 먼저, `mail` 설정 파일에 `roundrobin` 트랜스포트를 사용하는 메일러를 정의하세요. 설정 배열에는 메일 전송에 사용할 메일러들을 나열한 `mailers` 배열이 포함되어야 합니다:

```php
'mailers' => [
    'roundrobin' => [
        'transport' => 'roundrobin',
        'mailers' => [
            'ses',
            'postmark',
        ],
    ],

    // ...
],
```

라운드 로빈 메일러를 정의했다면, 애플리케이션의 기본 메일러로 지정해야 합니다. `mail` 설정 파일의 `default` 값에 이 메일러 이름을 지정합니다:

```php
'default' => env('MAIL_MAILER', 'roundrobin'),
```

라운드 로빈 트랜스포트는 설정된 메일러 목록에서 무작위로 하나를 선택하여 첫 번째 이메일을 보내고, 이후에는 순차적으로 다음 메일러를 사용해 메일을 발송합니다. `failover` 트랜스포트가 *[고가용성(high availability)](https://en.wikipedia.org/wiki/High_availability)* 을 목표로 한다면, `roundrobin` 트랜스포트는 *[부하 분산(load balancing)](https://en.wikipedia.org/wiki/Load_balancing_(computing))* 을 위한 기능입니다.

<a name="generating-mailables"></a>
## 메일러블 클래스 생성

라라벨 애플리케이션에서는, 애플리케이션이 전송하는 각각의 이메일 유형을 "메일러블(mailable)" 클래스라고 부릅니다. 이 클래스들은 `app/Mail` 디렉터리에 저장됩니다. 만약 이 디렉터리가 아직 없다면 걱정하지 마세요. `make:mail` 아티즌 명령어를 사용해 처음 메일러블 클래스를 생성하면, 라라벨이 자동으로 디렉터리를 생성해줍니다:

```shell
php artisan make:mail OrderShipped
```

<a name="writing-mailables"></a>
## 메일러블 작성하기

메일러블 클래스를 생성했다면, 해당 파일을 열고 그 안의 내용을 살펴보겠습니다. 메일러블 클래스의 설정은 `envelope`, `content`, `attachments` 등 여러 메서드에서 이루어집니다.

`envelope` 메서드는 메시지의 제목(subject)과 때로는 수신자 정보를 정의하는 `Illuminate\Mail\Mailables\Envelope` 객체를 반환합니다. `content` 메서드는 메시지 본문 생성을 위해 [Blade 템플릿](/docs/blade)을 지정하는 `Illuminate\Mail\Mailables\Content` 객체를 반환합니다.

<a name="configuring-the-sender"></a>
### 발신자 설정

<a name="using-the-envelope"></a>
#### Envelope를 사용한 설정

이메일의 발신자를 설정하는 방법부터 살펴보겠습니다. 즉, 이메일이 누구에게서 "보낸 것"으로 지정될지 정하는 방식입니다. 발신자 설정에는 두 가지 방법이 있습니다. 첫 번째로, 메시지의 envelope에서 "from" 주소를 지정할 수 있습니다:

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

원한다면 `replyTo` 주소도 함께 지정할 수 있습니다:

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
#### 전역 `from` 주소 사용

하지만 애플리케이션 전체에서 모든 이메일의 발신자("from" 주소)가 항상 동일하다면, 메일러블 클래스를 만들 때마다 중복해서 설정하는 것이 번거로울 수 있습니다. 이럴 땐 `config/mail.php` 설정 파일에서 전역 "from" 주소를 지정할 수 있습니다. 이 경우, 메일러블 클래스 별도로 "from"을 지정하지 않으면 여기에 정의된 주소가 기본적으로 사용됩니다:

```php
'from' => [
    'address' => env('MAIL_FROM_ADDRESS', 'hello@example.com'),
    'name' => env('MAIL_FROM_NAME', 'Example'),
],
```

또한 `config/mail.php` 파일에 전역 "reply_to" 주소도 지정할 수 있습니다:

```php
'reply_to' => ['address' => 'example@example.com', 'name' => 'App Name'],
```

<a name="configuring-the-view"></a>
### 뷰(view) 설정

메일러블 클래스의 `content` 메서드에서 이메일 내용 렌더링에 사용할 뷰(템플릿)를 정의할 수 있습니다. 각 이메일은 보통 [Blade 템플릿](/docs/blade)을 활용해 내용을 렌더링하므로, Blade의 강력한 기능을 사용해 자유롭게 HTML을 작성할 수 있습니다:

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
> 이메일 템플릿을 모아두려면 `resources/views/emails` 디렉터리를 생성해 사용하는 것이 좋지만, 꼭 여기에 두지 않아도 되고 `resources/views` 어디에나 자유롭게 배치할 수 있습니다.

<a name="plain-text-emails"></a>
#### 일반 텍스트 이메일

이메일의 일반 텍스트 형태를 별도로 정의하고 싶다면, 메시지의 `Content` 정의에서 plain-text 템플릿을 지정할 수 있습니다. `view`와 마찬가지로, `text` 파라미터에 템플릿 이름을 지정하면 그 텍스트 템플릿이 이메일 본문으로 사용됩니다. HTML과 텍스트 버전을 모두 지정할 수 있습니다:

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

참고로, `html` 파라미터를 `view` 파라미터의 별칭으로 사용할 수도 있습니다:

```php
return new Content(
    html: 'mail.orders.shipped',
    text: 'mail.orders.shipped-text'
);
```

<a name="view-data"></a>
### 뷰 데이터(View Data)

<a name="via-public-properties"></a>
#### public 속성을 통한 데이터 전달

이메일의 HTML을 렌더링할 때, 보통 템플릿에 필요한 데이터를 전달하게 됩니다. 뷰에 데이터를 전달하는 방법에는 두 가지가 있습니다. 첫 번째는, 메일러블 클래스에 public 속성으로 정의된 데이터는 자동으로 뷰에서 사용할 수 있게 됩니다. 즉, 생성자를 통해 데이터를 받아 public 속성에 담으면 됩니다:

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

public 속성에 데이터를 세팅해두면, 뷰에서 아래와 같이 Blade 문법으로 해당 데이터에 접근할 수 있습니다:

```blade
<div>
    Price: {{ $order->price }}
</div>
```

<a name="via-the-with-parameter"></a>
#### `with` 파라미터를 통한 전달

이메일 템플릿에 데이터를 전달하기 전에 데이터 형식을 직접 조정하고 싶다면, `Content` 정의의 `with` 파라미터를 이용해 데이터를 수동으로 뷰에 전달할 수 있습니다. 이 방법을 쓸 때도 생성자를 통해 데이터를 전달하되, 해당 속성을 `protected` 또는 `private`로 정의해서 뷰에서 자동으로 노출되지 않게 할 수 있습니다:

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

`with` 메서드를 통해 데이터를 넘기면, 해당 값들은 아래처럼 Blade 템플릿에서 사용할 수 있습니다:

```blade
<div>
    Price: {{ $orderPrice }}
</div>
```

<a name="attachments"></a>
### 첨부 파일

이메일에 첨부 파일을 추가하려면, 메시지의 `attachments` 메서드에서 반환되는 배열에 첨부 파일을 추가하세요. 우선, `Attachment` 클래스의 `fromPath` 메서드에 파일 경로를 전달하면 첨부 파일을 손쉽게 추가할 수 있습니다:

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

파일을 첨부할 때, 첨부 파일의 표시 이름이나 MIME 타입을 `as` 또는 `withMime` 메서드로 지정할 수도 있습니다:

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
#### 디스크에서 파일 첨부하기

[파일 시스템 디스크](/docs/filesystem)에 저장된 파일을 메일에 첨부하려면, `fromStorage` 첨부 메서드를 사용할 수 있습니다:

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

당연히, 첨부 파일의 이름과 MIME 타입도 함께 지정할 수 있습니다:

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

기본 디스크가 아닌 다른 스토리지 디스크를 지정해야 할 경우, `fromStorageDisk` 메서드를 사용하면 됩니다:

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

#### Raw Data 첨부

`fromData` 첨부 메서드는 바이트의 원시 문자열 데이터를 첨부파일로 추가할 때 사용할 수 있습니다. 예를 들어, 메모리에서 PDF를 생성했고 이를 디스크에 저장하지 않고 바로 이메일에 첨부하고 싶을 때 이 메서드를 사용할 수 있습니다. `fromData` 메서드는 첨부할 원시 데이터 바이트를 반환하는 클로저와 첨부파일로 지정될 이름을 인수로 받습니다.

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
### 인라인 첨부파일

이메일에 인라인 이미지를 포함하는 작업은 일반적으로 번거롭지만, 라라벨에서는 이미지를 이메일에 인라인으로 쉽게 첨부할 수 있는 편리한 방법을 제공합니다. 인라인 이미지를 삽입하려면 이메일 템플릿에서 `$message` 변수의 `embed` 메서드를 사용하면 됩니다. 라라벨은 모든 이메일 템플릿에서 `$message` 변수를 자동으로 사용할 수 있도록 해주므로, 직접 전달할 필요가 없습니다.

```blade
<body>
    Here is an image:

    <img src="{{ $message->embed($pathToImage) }}"/>
</body>
```

> [!WARNING]
> `$message` 변수는 일반 텍스트 메시지 템플릿에서는 사용할 수 없습니다. 일반 텍스트 메시지는 인라인 첨부파일을 지원하지 않기 때문입니다.

<a name="embedding-raw-data-attachments"></a>
#### 원시 데이터 첨부파일 인라인 삽입

이미 원시 이미지 데이터 문자열이 있고, 이를 이메일 템플릿에 인라인으로 포함하고 싶다면 `$message` 변수의 `embedData` 메서드를 사용할 수 있습니다. `embedData` 메서드를 호출할 때는 삽입될 이미지에 지정할 파일명을 함께 전달해야 합니다.

```blade
<body>
    Here is an image from raw data:

    <img src="{{ $message->embedData($data, 'example-image.jpg') }}"/>
</body>
```

<a name="attachable-objects"></a>
### Attachable 객체

문자열 경로로 파일을 첨부하는 간단한 방식도 자주 사용되지만, 경우에 따라 애플리케이션의 첨부 대상이 클래스로 표현되는 경우가 많습니다. 예를 들어, 애플리케이션에서 사진을 메시지에 첨부한다면, 해당 사진을 나타내는 `Photo` 모델이 있을 수 있습니다. 이런 경우에 모델 인스턴스를 `attach` 메서드에 바로 전달할 수 있다면 편리하겠죠? `Attachable` 객체를 이용하면 바로 이러한 방식으로 첨부할 수 있습니다.

먼저, 메시지에 첨부될 객체에 `Illuminate\Contracts\Mail\Attachable` 인터페이스를 구현합니다. 이 인터페이스를 구현하면, 클래스에 `toMailAttachment` 메서드를 정의해야 하며, 이 메서드는 `Illuminate\Mail\Attachment` 인스턴스를 반환해야 합니다.

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

Attachable 객체를 정의했으면, 이메일 메시지를 만들 때 `attachments` 메서드에서 해당 객체 인스턴스를 반환하면 됩니다.

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

물론 첨부파일 데이터가 Amazon S3와 같은 외부 파일 저장소 서비스에 저장될 수도 있습니다. 그래서 라라벨은 애플리케이션의 [파일 시스템 디스크](/docs/filesystem) 중 하나에 저장된 데이터를 기반으로 첨부파일 인스턴스를 만들 수 있도록 지원합니다.

```php
// 기본 디스크에 있는 파일로부터 첨부파일을 생성...
return Attachment::fromStorage($this->path);

// 지정한 디스크(예: backblaze)에 있는 파일로부터 첨부파일을 생성...
return Attachment::fromStorageDisk('backblaze', $this->path);
```

또한, 메모리에 보관 중인 데이터를 바탕으로 첨부파일 인스턴스를 만들 수도 있습니다. 이를 위해서는 `fromData` 메서드에 클로저를 전달하면 됩니다. 클로저는 첨부파일의 원시 데이터를 반환해야 합니다.

```php
return Attachment::fromData(fn () => $this->content, 'Photo Name');
```

라라벨은 첨부파일을 더 다양하게 커스터마이즈할 수 있는 메서드도 제공합니다. 예를 들어, `as`와 `withMime` 메서드를 사용해 파일의 이름과 MIME 타입을 지정할 수 있습니다.

```php
return Attachment::fromPath('/path/to/file')
    ->as('Photo Name')
    ->withMime('image/jpeg');
```

<a name="headers"></a>
### 헤더(Custom Headers)

때로는 발송하는 메시지에 추가적인 헤더를 붙여야 할 필요가 있습니다. 예를 들어, 커스텀 `Message-Id`나 기타 임의의 텍스트 헤더를 직접 지정할 수 있습니다.

이를 위해서는 mailable 클래스에 `headers` 메서드를 정의하면 됩니다. `headers` 메서드는 `Illuminate\Mail\Mailables\Headers` 인스턴스를 반환해야 하며, 이 클래스는 `messageId`, `references`, `text` 파라미터를 받을 수 있습니다. 물론, 필요한 파라미터만 선택적으로 지정해도 무방합니다.

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
### 태그와 메타데이터

Mailgun, Postmark와 같은 일부 외부 이메일 제공업체는 메시지 "태그"와 "메타데이터"를 지원합니다. 이 기능을 통해 애플리케이션에서 발송한 이메일을 그룹핑·추적할 수 있습니다. 태그와 메타데이터는 `Envelope` 정의 내에서 추가할 수 있습니다.

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

Mailgun 드라이버를 사용하는 경우, [태그](https://documentation.mailgun.com/docs/mailgun/user-manual/tracking-messages/#tagging)와 [메타데이터](https://documentation.mailgun.com/docs/mailgun/user-manual/tracking-messages/#attaching-data-to-messages)에 대한 더 많은 정보는 Mailgun 공식 문서를 참고하시기 바랍니다. 마찬가지로 Postmark 관련 [태그](https://postmarkapp.com/blog/tags-support-for-smtp)와 [메타데이터](https://postmarkapp.com/support/article/1125-custom-metadata-faq)에 대해서도 Postmark 문서를 참고할 수 있습니다.

Amazon SES를 통해 메일을 발송한다면, `metadata` 메서드를 사용하여 메시지에 [SES "태그"](https://docs.aws.amazon.com/ses/latest/APIReference/API_MessageTag.html)를 첨부할 수 있습니다.

<a name="customizing-the-symfony-message"></a>
### Symfony 메시지 커스터마이징

라라벨의 메일 기능은 Symfony Mailer를 기반으로 동작합니다. 라라벨에서는 메일 발송 전에 Symfony Message 인스턴스에 대해 커스텀 콜백을 등록할 수 있습니다. 이를 이용하면 메시지를 발송 전에 자유롭게 커스터마이즈할 수 있습니다. 이를 위해서는 `Envelope` 정의에서 `using` 파라미터를 지정하면 됩니다.

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
## Markdown 메일러블

Markdown 메일러블 메시지를 사용하면, [메일 알림](/docs/notifications#mail-notifications)에 내장된 템플릿과 컴포넌트를 메일러블에서 그대로 활용할 수 있습니다. 메시지를 Markdown으로 작성하면 라라벨이 보기 좋은 반응형 HTML 템플릿을 자동으로 렌더링해주며, 동시에 플레인 텍스트 버전도 자동으로 생성해줍니다.

<a name="generating-markdown-mailables"></a>
### Markdown 메일러블 생성

Markdown 템플릿이 포함된 메일러블을 생성하려면 `make:mail` Artisan 명령어에 `--markdown` 옵션을 사용하면 됩니다.

```shell
php artisan make:mail OrderShipped --markdown=mail.orders.shipped
```

그 다음, 메일러블 클래스의 `content` 메서드에서 `Content` 정의를 할 때 `view` 파라미터 대신 `markdown` 파라미터를 사용하면 됩니다.

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
### Markdown 메시지 작성

Markdown 메일러블은 Blade 컴포넌트와 Markdown 문법을 조합해서 사용하도록 설계되어 있습니다. 이를 통해 라라벨의 사전 제작된 이메일 UI 컴포넌트를 손쉽게 활용하며, 깔끔한 메일 메시지를 빠르게 작성할 수 있습니다.

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
> Markdown 이메일을 작성할 때 들여쓰기가 과도하지 않도록 주의하세요. Markdown 표준에 따라, 들여쓰기된 콘텐츠는 코드 블록으로 렌더링됩니다.

<a name="button-component"></a>
#### 버튼 컴포넌트

버튼 컴포넌트는 가운데 정렬된 버튼 링크를 렌더링합니다. 이 컴포넌트는 `url` 과 선택적 속성인 `color`(색상)를 인수로 받을 수 있습니다. 지원되는 색상은 `primary`, `success`, `error`입니다. 한 메시지에 버튼 컴포넌트를 여러 개 추가해도 문제 없습니다.

```blade
<x-mail::button :url="$url" color="success">
View Order
</x-mail::button>
```

<a name="panel-component"></a>
#### 패널 컴포넌트

패널 컴포넌트는 지정한 텍스트 블록을 일반 메시지와 다른 배경색의 패널에 표시해줍니다. 이를 통해 특정 텍스트 블록에 주목도를 높일 수 있습니다.

```blade
<x-mail::panel>
This is the panel content.
</x-mail::panel>
```

<a name="table-component"></a>
#### 테이블 컴포넌트

테이블 컴포넌트를 활용하면 Markdown 테이블을 HTML 테이블로 변환할 수 있습니다. 이 컴포넌트는 Markdown 테이블을 콘텐츠로 받아 렌더링하며, 기본적인 Markdown 테이블 정렬 문법을 그대로 지원합니다.

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

이메일에 사용하는 Markdown 메일 컴포넌트를 내 애플리케이션으로 내보내서 직접 커스터마이즈할 수 있습니다. 이를 위해 `vendor:publish` Artisan 명령어로 `laravel-mail` 에셋 태그를 퍼블리싱하세요.

```shell
php artisan vendor:publish --tag=laravel-mail
```

이 명령어를 실행하면, Markdown 메일 컴포넌트들이 `resources/views/vendor/mail` 디렉터리에 복사됩니다. 이 디렉터리 내에는 `html`과 `text` 디렉터리가 존재하며, 각각 HTML 및 텍스트 버전의 컴포넌트 파일들이 들어 있습니다. 이 컴포넌트들은 자유롭게 원하는 대로 수정할 수 있습니다.

<a name="customizing-the-css"></a>
#### CSS 커스터마이징

컴포넌트를 내보낸 후, `resources/views/vendor/mail/html/themes` 경로에 `default.css` 파일이 생성됩니다. 이 파일 내의 CSS를 원하는 대로 수정하면, 해당 스타일이 자동으로 Markdown 메일의 HTML 버전에 인라인 스타일로 적용됩니다.

라라벨의 Markdown 컴포넌트용으로 완전히 새로운 테마를 만들고 싶다면, `html/themes` 디렉터리에 CSS 파일을 추가하기만 하면 됩니다. CSS 파일의 이름을 정하고 저장한 후, 애플리케이션의 `config/mail.php` 설정 파일에서 `theme` 옵션을 새 테마명으로 변경해주면 됩니다.

개별 메일러블마다 사용될 테마를 바꾸고 싶다면, 메일러블 클래스에 `$theme` 프로퍼티를 테마 이름으로 설정하면 해당 테마가 적용됩니다.

<a name="sending-mail"></a>
## 메일 발송하기

메일을 보내려면 [Mail 파사드](/docs/facades)의 `to` 메서드를 사용합니다. `to` 메서드는 이메일 주소, 사용자 인스턴스, 또는 사용자 컬렉션을 받을 수 있습니다. 객체나 객체 배열을 전달하는 경우, 메일러는 해당 객체의 `email` 및 `name` 속성(attribute)에 자동으로 접근하여 수신자를 결정합니다. 따라서 이 속성들이 객체에 반드시 정의되어 있어야 합니다. 수신자를 지정한 후, 메일러블 클래스 인스턴스를 `send` 메서드에 인수로 전달하면 됩니다.

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

메일 발송 시 "to" 수신자만 지정할 필요는 없습니다. 필요에 따라 "to", "cc", "bcc" 등의 메서드를 체이닝하여 여러 수신자를 지정할 수 있습니다.

```php
Mail::to($request->user())
    ->cc($moreUsers)
    ->bcc($evenMoreUsers)
    ->send(new OrderShipped($order));
```

<a name="looping-over-recipients"></a>
#### 여러 수신자에게 반복 발송하기

여러 명의 수신자(이메일 주소 리스트)에 메일러블을 반복적으로 보내야 할 때가 있습니다. 하지만 `to` 메서드는 호출할 때마다 해당 메일러블의 수신자 목록에 이메일 주소를 추가합니다. 따라서 배열을 그냥 반복하면서 동일한 메일러블 인스턴스를 계속 재사용할 경우, 이전에 추가된 수신자들에게도 계속 메일이 다시 전송됩니다. 이런 문제를 방지하려면, 수신자마다 매번 새로운 메일러블 인스턴스를 생성해야 합니다.

```php
foreach (['taylor@example.com', 'dries@example.com'] as $recipient) {
    Mail::to($recipient)->send(new OrderShipped($order));
}
```

<a name="sending-mail-via-a-specific-mailer"></a>
#### 특정 메일러로 메일 보내기

기본적으로 라라벨은 애플리케이션의 `mail` 설정 파일에서 `default`로 지정된 메일러를 사용하여 이메일을 보냅니다. 하지만, `mailer` 메서드를 사용하면 특정 메일러 설정을 이용해 메일을 발송할 수 있습니다.

```php
Mail::mailer('postmark')
    ->to($request->user())
    ->send(new OrderShipped($order));
```

<a name="queueing-mail"></a>
### 메일 큐잉(Queueing)

<a name="queueing-a-mail-message"></a>
#### 메일 메시지 큐에 넣기

이메일 전송은 애플리케이션의 응답 속도에 악영향을 줄 수 있으므로, 많은 개발자들이 이메일을 백그라운드에서 큐를 통해 발송하기를 선호합니다. 라라벨에서는 자체 [통합 큐 API](/docs/queues)를 통해 이것을 손쉽게 처리할 수 있습니다. 메일 메시지를 큐에 보내려면, 수신자를 지정한 후 `Mail` 파사드의 `queue` 메서드를 사용하면 됩니다.

```php
Mail::to($request->user())
    ->cc($moreUsers)
    ->bcc($evenMoreUsers)
    ->queue(new OrderShipped($order));
```

이 방식은 큐에 작업을 자동으로 푸시하며, 메일이 백그라운드에서 전송되도록 처리합니다. [큐 설정](/docs/queues)을 먼저 마쳐야 이 기능을 사용할 수 있습니다.

<a name="delayed-message-queueing"></a>
#### 지연 전송(Delayed) 메시지 큐잉

큐에 쌓인 메일 메시지의 전송을 일정 시간 지연시키고 싶다면 `later` 메서드를 사용할 수 있습니다. `later`의 첫 번째 인수로 메시지 전송 시점을 나타내는 `DateTime` 인스턴스를 전달하면 됩니다.

```php
Mail::to($request->user())
    ->cc($moreUsers)
    ->bcc($evenMoreUsers)
    ->later(now()->addMinutes(10), new OrderShipped($order));
```

<a name="pushing-to-specific-queues"></a>
#### 특정 큐로 작업 푸시하기

`make:mail` 명령어로 생성한 모든 메일러블 클래스는 `Illuminate\Bus\Queueable` 트레이트를 사용합니다. 이 때문에 모든 메일러블 인스턴스에서 `onQueue`와 `onConnection` 메서드를 호출해 메시지의 큐 연결과 큐 이름을 지정할 수 있습니다.

```php
$message = (new OrderShipped($order))
    ->onConnection('sqs')
    ->onQueue('emails');

Mail::to($request->user())
    ->cc($moreUsers)
    ->bcc($evenMoreUsers)
    ->queue($message);
```

<a name="queueing-by-default"></a>
#### 기본적으로 큐잉(Queued) 되도록 설정하기

항상 큐로 전송되기를 원하는 메일러블 클래스가 있다면, 해당 클래스에서 `ShouldQueue` 컨트랙트를 구현하면 됩니다. 이제 `send` 메서드가 호출되더라도, 이 컨트랙트가 구현된 메일러블은 자동으로 큐에 쌓여서 전송됩니다.

```php
use Illuminate\Contracts\Queue\ShouldQueue;

class OrderShipped extends Mailable implements ShouldQueue
{
    // ...
}
```

<a name="queued-mailables-and-database-transactions"></a>
#### 큐잉된 메일러블과 데이터베이스 트랜잭션

큐에 쌓인 메일러블이 데이터베이스 트랜잭션 안에서 디스패치될 경우, 큐에서 작업이 실행되는 시점이 트랜잭션 커밋 이전일 수 있습니다. 이럴 때는, 트랜잭션 동안 변경된 모델 혹은 DB 레코드가 아직 데이터베이스에 반영되지 않았을 수 있습니다. 트랜잭션에서 생성된 모델이나 레코드 역시 아직 실제 DB에는 존재하지 않을 수 있습니다. 만약 메일러블이 이런 모델에 의존한다면, 큐 작업 실행 시 예기치 못한 오류가 발생할 수 있습니다.

큐 연결의 `after_commit` 설정 옵션이 `false`인 경우에도, 메일 메시지를 보낼 때 `afterCommit` 메서드를 호출해서 "모든 오픈된 데이터베이스 트랜잭션이 커밋된 후"에 해당 큐잉된 메일러블이 디스패치되도록 지정할 수 있습니다.

```php
Mail::to($request->user())->send(
    (new OrderShipped($order))->afterCommit()
);
```

또한, 메일러블의 생성자에서 `afterCommit` 메서드를 호출해도 효과는 동일합니다.

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
> 이러한 문제들을 우회하는 방법에 대한 더 자세한 내용은 [큐 작업과 데이터베이스 트랜잭션](/docs/queues#jobs-and-database-transactions) 가이드를 참고하십시오.

<a name="rendering-mailables"></a>
## 메일러블 렌더링

가끔 메일을 실제로 발송하지 않고, 메일러블의 HTML 콘텐츠만 얻고 싶을 때가 있습니다. 이럴 때는 메일러블의 `render` 메서드를 사용하면 됩니다. 이 메서드는 메일러블을 평가(evaluate)한 HTML 결과를 문자열로 반환합니다.

```php
use App\Mail\InvoicePaid;
use App\Models\Invoice;

$invoice = Invoice::find(1);

return (new InvoicePaid($invoice))->render();
```

<a name="previewing-mailables-in-the-browser"></a>
### 메일러블을 브라우저에서 미리보기

메일러블 템플릿을 디자인할 때, 일반 Blade 템플릿과 마찬가지로 브라우저에서 바로 렌더링을 확인할 수 있으면 편리합니다. 라라벨에서는 이를 위해, 라우트 클로저나 컨트롤러에서 메일러블을 그대로 반환하면 해당 메일러블이 브라우저에서 렌더링되어 바로 디자인을 미리볼 수 있도록 해줍니다. 실제 이메일 주소로 발송하지 않아도 되므로 개발 과정에서 매우 유용합니다.

```php
Route::get('/mailable', function () {
    $invoice = App\Models\Invoice::find(1);

    return new App\Mail\InvoicePaid($invoice);
});
```

<a name="localizing-mailables"></a>
## 메일러블의 다국어 지원(Localization)

라라벨에서는 메일러블을 현재 요청의 로케일이 아닌 다른 로케일(언어)로 전송할 수 있으며, 심지어 메일을 큐에 넣은 경우에도 이 언어 설정을 기억합니다.

이 기능을 사용하려면, `Mail` 파사드의 `locale` 메서드를 이용해서 원하는 언어를 지정할 수 있습니다. 메일러블의 템플릿이 렌더링되는 동안 애플리케이션의 언어가 임시로 바뀌며, 렌더링이 끝나면 원래 언어로 다시 돌아옵니다.

```php
Mail::to($request->user())->locale('es')->send(
    new OrderShipped($order)
);
```

<a name="user-preferred-locales"></a>
### 사용자별 선호 로케일

애플리케이션에서 각 사용자의 선호 언어(locale)를 저장해 둘 때도 있습니다. 이럴 때 모델에서 `HasLocalePreference` 컨트랙트를 구현하면, 라라벨이 메일 발송 시 해당 사용자의 선호 로케일을 자동으로 적용하게 할 수 있습니다.

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

인터페이스를 구현한 이후에는, 메일러블·알림을 해당 모델에 보낼 때 라라벨이 자동으로 선호 로케일을 적용합니다. 이 경우에는 `locale` 메서드를 따로 호출할 필요가 없습니다.

```php
Mail::to($request->user())->send(new OrderShipped($order));
```

<a name="testing-mailables"></a>
## 테스트

<a name="testing-mailable-content"></a>
### 메일러블 콘텐츠 테스트

라라벨은 메일러블의 구조를 확인할 수 있는 다양한 메서드를 제공합니다. 더불어, 메일러블이 의도한 내용을 제대로 포함하고 있는지 손쉽게 테스트할 수 있도록 여러 편리한 메서드(예: `assertSeeInHtml`, `assertDontSeeInHtml`, `assertSeeInOrderInHtml`, `assertSeeInText`, `assertDontSeeInText`, `assertSeeInOrderInText`, `assertHasAttachment`, `assertHasAttachedData`, `assertHasAttachmentFromStorage`, `assertHasAttachmentFromStorageDisk`)를 지원합니다.

"HTML" 계열 assertion은 메일러블의 HTML 버전에 특정 문자열이 포함되어 있는지, "text" 계열 assertion은 플레인 텍스트 버전에 특정 문자열이 포함되어 있는지를 각각 확인합니다.

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
    $mailable->assertSeeInHtml('Invoice Paid');
    $mailable->assertSeeInOrderInHtml(['Invoice Paid', 'Thanks']);

    $mailable->assertSeeInText($user->email);
    $mailable->assertSeeInHtml('Invoice Paid');
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
    $mailable->assertSeeInHtml('Invoice Paid');
    $mailable->assertSeeInOrderInHtml(['Invoice Paid', 'Thanks']);

    $mailable->assertSeeInText($user->email);
    $mailable->assertSeeInOrderInText(['Invoice Paid', 'Thanks']);

    $mailable->assertHasAttachment('/path/to/file');
    $mailable->assertHasAttachment(Attachment::fromPath('/path/to/file'));
    $mailable->assertHasAttachedData($pdfData, 'name.pdf', ['mime' => 'application/pdf']);
    $mailable->assertHasAttachmentFromStorage('/path/to/file', 'name.pdf', ['mime' => 'application/pdf']);
    $mailable->assertHasAttachmentFromStorageDisk('s3', '/path/to/file', 'name.pdf', ['mime' => 'application/pdf']);
}
```

<a name="testing-mailable-sending"></a>

### Mailable 발송 테스트

메일러블(mailable)이 특정 사용자에게 "발송"되었는지 검증하는 테스트와, 메일러블의 실제 콘텐츠를 검증하는 테스트는 분리해서 진행하는 것이 좋습니다. 일반적으로, 메일러블의 콘텐츠는 여러분이 테스트하는 코드와 직접적인 관련이 없는 경우가 많으므로, 라라벨이 특정 메일러블을 전송하도록 지시받았는지 여부만 검증하면 충분합니다.

메일이 실제로 발송되는 것을 방지하려면 `Mail` 파사드의 `fake` 메서드를 사용할 수 있습니다. `Mail` 파사드의 `fake` 메서드를 호출한 후에는, 메일러블이 사용자에게 발송되도록 지시되었는지 검증하거나, 메일러블이 전달받은 데이터를 확인할 수 있습니다.

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

        // Assert 3 total mailables were sent...
        Mail::assertSentCount(3);
    }
}
```

만약 메일러블을 백그라운드에서 큐잉하여 발송하는 경우에는 `assertSent` 대신 `assertQueued` 메서드를 사용해야 합니다.

```php
Mail::assertQueued(OrderShipped::class);
Mail::assertNotQueued(OrderShipped::class);
Mail::assertNothingQueued();
Mail::assertQueuedCount(3);
```

`assertSent`, `assertNotSent`, `assertQueued`, `assertNotQueued` 메서드에 클로저를 전달하면, 전달한 "진위 테스트(truth test)"를 통과한 메일러블이 발송(혹은 큐잉)되었는지 검증할 수 있습니다. 하나라도 해당 조건을 만족하는 메일러블이 있다면, 어서션은 성공합니다.

```php
Mail::assertSent(function (OrderShipped $mail) use ($order) {
    return $mail->order->id === $order->id;
});
```

`Mail` 파사드의 어서션 메서드를 호출할 때 클로저가 받는 메일러블 인스턴스는 메일러블을 검사할 때 유용한 여러 메서드를 제공합니다.

```php
Mail::assertSent(OrderShipped::class, function (OrderShipped $mail) use ($user) {
    return $mail->hasTo($user->email) &&
           $mail->hasCc('...') &&
           $mail->hasBcc('...') &&
           $mail->hasReplyTo('...') &&
           $mail->hasFrom('...') &&
           $mail->hasSubject('...');
});
```

메일러블 인스턴스는 첨부파일 검사를 위한 다양한 메서드도 제공합니다.

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

메일이 **발송되지 않았음**을 검증하는 메서드로 `assertNotSent`와 `assertNotQueued`가 있습니다. 때로는 메일이 발송도, 큐잉도 되지 않았음을 동시에 검증하고 싶을 수도 있습니다. 이럴 때는 `assertNothingOutgoing` 및 `assertNotOutgoing` 메서드를 사용할 수 있습니다.

```php
Mail::assertNothingOutgoing();

Mail::assertNotOutgoing(function (OrderShipped $mail) use ($order) {
    return $mail->order->id === $order->id;
});
```

<a name="mail-and-local-development"></a>
## 메일과 로컬 개발 환경

이메일을 발송하는 애플리케이션을 개발할 때는, 실제 이메일 주소로 발송되는 것을 원하지 않을 것입니다. 라라벨은 로컬 개발 중 실제 이메일 발송을 "비활성화"할 수 있는 여러 방법을 제공합니다.

<a name="log-driver"></a>
#### 로그 드라이버(Log Driver)

이메일을 실제로 발송하는 대신, `log` 메일 드라이버는 모든 이메일 메시지를 로그 파일에 기록합니다. 일반적으로 이 드라이버는 로컬 개발 환경에서만 사용합니다. 환경별로 애플리케이션을 어떻게 설정하는지에 대해서는 [설정(configuration) 문서](/docs/configuration#environment-configuration)를 참고하세요.

<a name="mailtrap"></a>
#### HELO / Mailtrap / Mailpit

다른 방법으로는 [HELO](https://usehelo.com)나 [Mailtrap](https://mailtrap.io)과 같은 서비스를 `smtp` 드라이버와 함께 사용하여, 실제 이메일 클라이언트에서 확인할 수 있는 "더미" 메일박스로 이메일을 전송할 수 있습니다. 이 방식의 장점은, Mailtrap 메시지 뷰어를 통해 최종 이메일을 실제로 검토할 수 있다는 점입니다.

[Laravel Sail](/docs/sail)를 사용하는 경우, [Mailpit](https://github.com/axllent/mailpit)을 통해 메시지를 미리볼 수 있습니다. Sail이 실행 중이라면, 다음 주소에서 Mailpit 인터페이스를 확인할 수 있습니다: `http://localhost:8025`.

<a name="using-a-global-to-address"></a>
#### 전체 전송 주소(Global to Address) 사용

마지막으로, `Mail` 파사드에서 제공하는 `alwaysTo` 메서드를 호출해 전체적으로 "to 주소"를 지정할 수도 있습니다. 이 메서드는 일반적으로 애플리케이션의 서비스 프로바이더 중 하나의 `boot` 메서드에서 호출합니다.

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

<a name="events"></a>
## 이벤트(Events)

라라벨은 메일 메시지를 보내는 동안 두 가지 이벤트를 발생시킵니다. `MessageSending` 이벤트는 메시지가 발송되기 **직전**에 발생하고, `MessageSent` 이벤트는 메시지가 **발송된 후**에 발생합니다. 주의할 점은, 이 이벤트들은 메일을 직접 **발송(send)** 할 때 발생하며, **큐잉(queued)** 시에는 발생하지 않는다는 것입니다. 이 이벤트들에 대해 [이벤트 리스너](/docs/events)를 만들어 사용할 수 있습니다.

```php
use Illuminate\Mail\Events\MessageSending;
// use Illuminate\Mail\Events\MessageSent;

class LogMessage
{
    /**
     * Handle the given event.
     */
    public function handle(MessageSending $event): void
    {
        // ...
    }
}
```

<a name="custom-transports"></a>
## 사용자 정의 메일 전송 방식(Custom Transports)

라라벨은 다양한 메일 전송 방식을 기본 지원하지만, 때로는 라라벨에서 기본 지원하지 않는 외부 서비스로 이메일을 전송하고 싶을 때가 있습니다. 이런 경우, 직접 메일 전송 방식을 구현할 수 있습니다. 시작하려면, `Symfony\Component\Mailer\Transport\AbstractTransport` 클래스를 확장한 클래스를 정의합니다. 그리고 나서, `doSend`와 `__toString()` 메서드를 구현해야 합니다.

```php
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

사용자 정의 전송 방식(transport)을 정의했다면, `Mail` 파사드에서 제공하는 `extend` 메서드로 등록할 수 있습니다. 일반적으로 이 작업은 애플리케이션의 `AppServiceProvider` 서비스 프로바이더의 `boot` 메서드에서 수행합니다. `extend` 메서드에 전달하는 클로저에는 `$config` 인자가 전달되며, 이 인자에는 애플리케이션의 `config/mail.php`에서 정의한 설정 정보가 담겨 있습니다.

```php
use App\Mail\MailchimpTransport;
use Illuminate\Support\Facades\Mail;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Mail::extend('mailchimp', function (array $config = []) {
        return new MailchimpTransport(/* ... */);
    });
}
```

사용자 정의 전송 방식을 정의·등록했다면, 이제 애플리케이션의 `config/mail.php` 설정 파일에서 해당 전송 방식을 사용하는 메일러(mailer) 설정을 추가할 수 있습니다.

```php
'mailchimp' => [
    'transport' => 'mailchimp',
    // ...
],
```

<a name="additional-symfony-transports"></a>
### 추가적인 Symfony 전송 방식(Symfony Transports) 지원

라라벨은 Mailgun, Postmark 등 일부 Symfony에서 관리하는 메일 전송 방식을 기본 지원합니다. 하지만 필요하다면, 추가적인 Symfony 전송 방식을 라라벨에 확장할 수 있습니다. 이를 위해서는 Composer로 필요한 Symfony 메일러 패키지를 설치한 후, 라라벨에 등록하면 됩니다. 예를 들어, "Brevo"(기존 명칭: Sendinblue) Symfony 메일러를 설치·등록하는 방법은 다음과 같습니다.

```shell
composer require symfony/brevo-mailer symfony/http-client
```

Brevo 메일러 패키지를 설치했다면, 애플리케이션의 `services` 설정 파일에 Brevo API 인증정보를 추가합니다.

```php
'brevo' => [
    'key' => 'your-api-key',
],
```

다음으로, `Mail` 파사드의 `extend` 메서드를 사용하여 전송 방식을 라라벨에 등록합니다. 이 작업은 한 개의 서비스 프로바이더의 `boot` 메서드에서 진행하는 것이 일반적입니다.

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

전송 방식이 등록되었으면, 이제 애플리케이션의 config/mail.php에 새로운 전송 방식을 활용하는 메일러 정의를 추가할 수 있습니다.

```php
'brevo' => [
    'transport' => 'brevo',
    // ...
],
```