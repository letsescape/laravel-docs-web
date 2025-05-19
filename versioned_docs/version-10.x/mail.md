# 메일 (Mail)

- [소개](#introduction)
    - [설정](#configuration)
    - [드라이버 필수 조건](#driver-prerequisites)
    - [장애 조치(failover) 설정](#failover-configuration)
    - [라운드 로빈(round robin) 설정](#round-robin-configuration)
- [메일러블 클래스 생성하기](#generating-mailables)
- [메일러블 작성하기](#writing-mailables)
    - [발신자 설정](#configuring-the-sender)
    - [뷰(View) 설정](#configuring-the-view)
    - [뷰 데이터](#view-data)
    - [첨부파일](#attachments)
    - [인라인 첨부파일](#inline-attachments)
    - [Attachable 객체](#attachable-objects)
    - [헤더](#headers)
    - [태그 및 메타데이터](#tags-and-metadata)
    - [Symfony 메시지 커스터마이징](#customizing-the-symfony-message)
- [마크다운 메일러블](#markdown-mailables)
    - [마크다운 메일러블 생성](#generating-markdown-mailables)
    - [마크다운 메시지 작성](#writing-markdown-messages)
    - [컴포넌트 커스터마이징](#customizing-the-components)
- [메일 보내기](#sending-mail)
    - [메일 큐잉하기](#queueing-mail)
- [메일러블 렌더링](#rendering-mailables)
    - [브라우저에서 메일러블 미리보기](#previewing-mailables-in-the-browser)
- [메일러블 로컬라이징](#localizing-mailables)
- [테스트](#testing-mailables)
    - [메일러블 내용 테스트](#testing-mailable-content)
    - [메일러블 발송 테스트](#testing-mailable-sending)
- [메일과 로컬 개발 환경](#mail-and-local-development)
- [이벤트](#events)
- [커스텀 트랜스포트](#custom-transports)
    - [추가 Symfony 트랜스포트](#additional-symfony-transports)

<a name="introduction"></a>
## 소개

이메일을 보내는 일은 복잡하지 않아도 됩니다. 라라벨은 인기 있는 [Symfony Mailer](https://symfony.com/doc/6.2/mailer.html) 컴포넌트를 기반으로 하는 깔끔하고 간단한 이메일 API를 제공합니다. 라라벨과 Symfony Mailer는 SMTP, Mailgun, Postmark, Amazon SES, 그리고 `sendmail`을 통한 이메일 전송을 지원하는 드라이버를 제공하므로, 여러분이 원하는 로컬 또는 클라우드 기반 서비스로 빠르게 메일 발송을 시작할 수 있습니다.

<a name="configuration"></a>
### 설정

라라벨의 이메일 서비스는 애플리케이션의 `config/mail.php` 설정 파일을 통해 구성할 수 있습니다. 이 파일에 정의된 각 메일러는 고유한 설정과 “트랜스포트”를 가질 수 있으며, 이를 활용해 애플리케이션이 서로 다른 이메일 서비스를 통해 특정 메일을 보낼 수 있습니다. 예를 들어, 거래 관련 이메일은 Postmark로, 대량 메일은 Amazon SES로 전송하도록 설정할 수 있습니다.

`mail` 설정 파일 안에는 `mailers` 설정 배열이 있습니다. 이 배열에는 라라벨에서 지원하는 주요 메일 드라이버/트랜스포트에 대한 샘플 설정이 포함되어 있으며, `default` 설정 값은 애플리케이션에서 이메일을 보낼 때 기본적으로 어떤 메일러를 사용할지 지정합니다.

<a name="driver-prerequisites"></a>
### 드라이버/트랜스포트 필수 조건

Mailgun, Postmark, MailerSend와 같은 API 기반 드라이버는 일반적으로 SMTP를 사용할 때보다 더 간단하며 빠르게 메일을 전송할 수 있습니다. 가능한 경우, 이 중 하나의 드라이버 사용을 권장합니다.

<a name="mailgun-driver"></a>
#### Mailgun 드라이버

Mailgun 드라이버를 사용하려면 Composer를 통해 Symfony의 Mailgun Mailer 트랜스포트를 설치해야 합니다:

```shell
composer require symfony/mailgun-mailer symfony/http-client
```

그 다음, 애플리케이션의 `config/mail.php` 파일에서 `default` 옵션을 `mailgun`으로 설정합니다. 기본 메일러 설정을 마쳤으면, `config/services.php` 파일에 다음 옵션이 포함되어 있는지 확인합니다:

```
'mailgun' => [
    'transport' => 'mailgun',
    'domain' => env('MAILGUN_DOMAIN'),
    'secret' => env('MAILGUN_SECRET'),
],
```

미국이 아닌 [Mailgun 리전](https://documentation.mailgun.com/en/latest/api-intro.html#mailgun-regions)을 사용하는 경우, 해당 리전의 엔드포인트를 `services` 설정 파일에 추가로 지정할 수 있습니다:

```
'mailgun' => [
    'domain' => env('MAILGUN_DOMAIN'),
    'secret' => env('MAILGUN_SECRET'),
    'endpoint' => env('MAILGUN_ENDPOINT', 'api.eu.mailgun.net'),
],
```

<a name="postmark-driver"></a>
#### Postmark 드라이버

Postmark 드라이버를 사용하려면 Composer를 통해 Symfony의 Postmark Mailer 트랜스포트를 설치해야 합니다:

```shell
composer require symfony/postmark-mailer symfony/http-client
```

그 다음, 애플리케이션의 `config/mail.php` 설정 파일에서 `default` 옵션을 `postmark`로 설정합니다. 그 후, `config/services.php` 파일에 다음 옵션이 포함되어 있는지 확인합니다:

```
'postmark' => [
    'token' => env('POSTMARK_TOKEN'),
],
```

특정 메일러가 사용할 Postmark 메시지 스트림을 지정하려면, 메일러 설정 배열에 `message_stream_id` 옵션을 추가할 수 있습니다. 이 배열은 `config/mail.php` 파일에서 확인할 수 있습니다:

```
'postmark' => [
    'transport' => 'postmark',
    'message_stream_id' => env('POSTMARK_MESSAGE_STREAM_ID'),
],
```

이렇게 하면 서로 다른 메시지 스트림을 사용하는 여러 Postmark 메일러를 설정할 수 있습니다.

<a name="ses-driver"></a>
#### SES 드라이버

Amazon SES 드라이버를 사용하려면 먼저 Amazon AWS SDK for PHP를 설치해야 합니다. Composer 패키지 관리자를 통해 이 라이브러리를 설치할 수 있습니다:

```shell
composer require aws/aws-sdk-php
```

그 다음, `config/mail.php` 설정 파일에서 `default` 옵션을 `ses`로 지정한 뒤, `config/services.php` 파일에 아래와 같은 옵션이 포함되어 있는지 확인합니다:

```
'ses' => [
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
],
```

AWS [임시 자격 증명](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_use-resources.html)을 세션 토큰을 통해 사용하려면, SES 설정에 `token` 키를 추가하면 됩니다:

```
'ses' => [
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    'token' => env('AWS_SESSION_TOKEN'),
],
```

이메일 전송 시 라라벨이 AWS SDK의 `SendEmail` 메서드로 전달할 [추가 옵션](https://docs.aws.amazon.com/aws-sdk-php/v3/api/api-sesv2-2019-09-27.html#sendemail)을 정의하고 싶다면, SES 설정 내에 `options` 배열을 추가할 수 있습니다:

```
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

[MailerSend](https://www.mailersend.com/)는 트랜잭션 메일 및 SMS 서비스를 제공하며, 라라벨용 자체 API 기반 드라이버를 제공합니다. 해당 드라이버는 Composer 패키지 관리자를 통해 설치할 수 있습니다:

```shell
composer require mailersend/laravel-driver
```

패키지 설치 후, 애플리케이션의 `.env` 파일에 `MAILERSEND_API_KEY` 환경 변수를 추가합니다. 그리고 `MAIL_MAILER` 환경 변수는 `mailersend`로 지정해야 합니다:

```shell
MAIL_MAILER=mailersend
MAIL_FROM_ADDRESS=app@yourdomain.com
MAIL_FROM_NAME="App Name"

MAILERSEND_API_KEY=your-api-key
```

MailerSend의 호스팅 템플릿 사용 등 더 많은 정보를 확인하려면 [MailerSend 드라이버 문서](https://github.com/mailersend/mailersend-laravel-driver#usage)를 참조하세요.

<a name="failover-configuration"></a>
### 장애 조치(failover) 설정

때로는 애플리케이션 메일 발송에 사용되는 외부 서비스가 다운될 수 있습니다. 이런 상황에서는 주 발송 드라이버에 장애가 발생할 경우를 대비해 하나 이상의 백업 메일 발송 구성을 정의해 둘 수 있습니다.

이를 위해, `failover` 트랜스포트를 사용하는 메일러를 애플리케이션의 `mail` 설정 파일에 정의해야 합니다. `failover` 메일러의 설정 배열에는 실제 메일 발송에 사용할 메일러들을 순서대로 나열한 `mailers` 배열이 포함되어야 합니다:

```
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

장애 조치용 메일러를 정의한 후에는, `mail` 설정 파일의 `default` 키 값을 이 메일러의 이름으로 지정하여, 애플리케이션이 기본적으로 장애 조치용 메일러를 사용하게 해야 합니다:

```
'default' => env('MAIL_MAILER', 'failover'),
```

<a name="round-robin-configuration"></a>
### 라운드 로빈(round robin) 설정

`roundrobin` 트랜스포트는 여러 개의 메일러에 걸쳐 메일 발송 작업을 분산할 수 있도록 해줍니다. 사용하려면, `roundrobin` 트랜스포트를 사용하는 메일러를 `mail` 설정 파일 내에 정의합니다. `roundrobin` 메일러의 설정 배열에는 실제 메일 발송에 사용할 메일러들을 나열한 `mailers` 배열을 포함시켜야 합니다:

```
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

라운드 로빈 메일러를 정의한 후에는, `mail` 설정 파일의 `default` 항목 값을 해당 이름으로 지정하여, 애플리케이션이 기본적으로 라운드 로빈 메일러를 사용하게 해야 합니다:

```
'default' => env('MAIL_MAILER', 'roundrobin'),
```

라운드 로빈 트랜스포트는 설정된 메일러 중 임의의 하나를 선택한 다음, 이후에는 순차적으로 다음 메일러로 교체하여 메일을 발송합니다. 이는 *[높은 가용성(high availability)](https://en.wikipedia.org/wiki/High_availability)* 을 달성하는 데 도움을 주는 `failover` 트랜스포트와 달리, *[로드 밸런싱(load balancing)](https://en.wikipedia.org/wiki/Load_balancing_(computing))* 을 제공합니다.

<a name="generating-mailables"></a>
## 메일러블 클래스 생성하기

라라벨 애플리케이션을 개발할 때, 애플리케이션에서 전송되는 각 이메일 종류는 "메일러블(mailable)" 클래스 하나로 표현됩니다. 이 클래스들은 `app/Mail` 디렉터리에 저장됩니다. 만약 이 디렉터리가 없다면, 첫 번째 메일러블 클래스를 `make:mail` Artisan 명령어로 생성할 때 자동으로 만들어집니다:

```shell
php artisan make:mail OrderShipped
```

<a name="writing-mailables"></a>
## 메일러블 작성하기

메일러블 클래스를 생성했다면, 이제 해당 파일을 열어 내부 내용을 살펴볼 수 있습니다. 메일러블 클래스의 설정은 `envelope`, `content`, `attachments` 등 여러 메서드에서 이루어집니다.

`envelope` 메서드는 메시지의 제목과 경우에 따라 수신자를 정의하는 `Illuminate\Mail\Mailables\Envelope` 객체를 반환합니다. `content` 메서드는 메시지 내용을 생성하는 데 사용되는 [Blade 템플릿](/docs/10.x/blade)을 정의하는 `Illuminate\Mail\Mailables\Content` 객체를 반환합니다.

<a name="configuring-the-sender"></a>
### 발신자 설정

<a name="using-the-envelope"></a>
#### Envelope로 설정하기

먼저, 이메일의 발신자를 어떻게 설정하는지 살펴보겠습니다. 즉, 이메일이 누구로부터 발송될 것인지를 정하는 방법입니다. 발신자 설정에는 두 가지 방법이 있습니다. 첫 번째로, 메시지의 envelope에서 "from" 주소를 명시할 수 있습니다:

```
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

필요하다면, `replyTo` 주소도 지정할 수 있습니다:

```
return new Envelope(
    from: new Address('jeffrey@example.com', 'Jeffrey Way'),
    replyTo: [
        new Address('taylor@example.com', 'Taylor Otwell'),
    ],
    subject: 'Order Shipped',
);
```

<a name="using-a-global-from-address"></a>
#### 전역 `from` 주소 사용하기

하지만 애플리케이션 전체에서 같은 "from" 주소를 반복해서 사용할 경우, 매번 메일러블 클래스마다 해당 주소를 추가하는 것이 번거로울 수 있습니다. 이럴 때는 `config/mail.php` 설정 파일에 전역 "from" 주소를 설정해 둘 수 있습니다. 메일러블 클래스 내부에서 별도의 "from" 주소를 지정하지 않은 경우, 이 주소가 자동으로 사용됩니다:

```
'from' => [
    'address' => env('MAIL_FROM_ADDRESS', 'hello@example.com'),
    'name' => env('MAIL_FROM_NAME', 'Example'),
],
```

또한, `config/mail.php` 파일에 전역 "reply_to" 주소도 다음과 같이 정의할 수 있습니다:

```
'reply_to' => ['address' => 'example@example.com', 'name' => 'App Name'],
```

<a name="configuring-the-view"></a>
### 뷰(View) 설정

메일러블 클래스의 `content` 메서드 내에서 이메일 내용을 렌더링할 때 사용할 `view`(즉, 템플릿)를 정의할 수 있습니다. 보통 각 이메일은 내용을 렌더링하기 위해 [Blade 템플릿](/docs/10.x/blade)을 사용하므로, Blade 템플릿 엔진의 모든 기능과 편리함을 HTML 이메일 작성 시에도 활용할 수 있습니다:

```
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
> 이메일 템플릿을 모아둘 `resources/views/emails` 디렉터리를 별도로 만들어두는 것이 좋을 수 있습니다. 하지만 반드시 거기에 둘 필요는 없고, 여러분이 원하는 곳에 뷰 파일을 자유롭게 생성할 수 있습니다.

<a name="plain-text-emails"></a>
#### 일반 텍스트 이메일

이메일의 일반 텍스트 버전을 정의하고 싶다면, 메시지의 `Content` 정의에서 plain-text 템플릿을 지정할 수 있습니다. `view`와 마찬가지로, `text` 파라미터 역시 이메일 내용을 렌더링할 템플릿의 이름이어야 합니다. HTML과 plain-text 버전을 모두 정의할 수 있습니다:

```
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

보다 명확히 하기 위해, `html` 파라미터를 `view` 파라미터의 별칭으로 사용할 수도 있습니다:

```
return new Content(
    html: 'mail.orders.shipped',
    text: 'mail.orders.shipped-text'
);
```

<a name="view-data"></a>
### 뷰 데이터

<a name="via-public-properties"></a>
#### public 속성 사용하기

일반적으로, 이메일 HTML을 렌더링할 때 사용할 데이터를 뷰에 전달하고 싶을 때가 많습니다. 데이터를 뷰에 전달하는 방법은 두 가지가 있습니다. 첫 번째로, 메일러블 클래스에 정의된 public 속성은 자동으로 뷰에서 사용할 수 있게 됩니다. 예를 들어, 생성자에서 데이터를 받아 클래스의 public 속성에 할당하면 됩니다:

```
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

데이터가 public 속성으로 할당되면 블레이드 템플릿 등에서 다른 데이터와 동일하게 바로 사용할 수 있습니다:

```
<div>
    Price: {{ $order->price }}
</div>
```

<a name="via-the-with-parameter"></a>
#### `with` 파라미터 사용하기

이메일에 전달할 데이터의 형태를 뷰로 전달하기 전에 커스터마이즈하고 싶을 때는, `Content` 정의의 `with` 파라미터를 통해 데이터를 직접 전달할 수 있습니다. 이 방법을 쓸 경우 보통 생성자에서는 데이터를 받아 클래스 내에 `protected` 또는 `private` 속성으로 저장해야 하며, 이렇게 하면 속성 값이 뷰에 자동으로 노출되지 않습니다:

```
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

`with` 메서드를 통해 데이터를 전달하면, 해당 값 역시 블레이드 템플릿에서 바로 사용할 수 있게 됩니다:

```
<div>
    Price: {{ $orderPrice }}
</div>
```

<a name="attachments"></a>
### 첨부파일

이메일에 첨부파일을 추가하려면, 메시지의 `attachments` 메서드에서 반환하는 배열에 첨부파일을 추가하면 됩니다. 먼저, `Attachment` 클래스에서 제공하는 `fromPath` 메서드에 파일 경로를 넘겨 첨부파일을 추가할 수 있습니다:

```
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

파일을 첨부할 때, `as` 및 `withMime` 메서드를 사용하여 첨부파일의 표시 이름 또는 MIME 타입을 지정할 수도 있습니다:

```
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

[파일시스템 디스크](/docs/10.x/filesystem)에 저장된 파일을 첨부하려면, `fromStorage` 메서드를 사용하면 됩니다:

```
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

물론, 첨부파일 이름이나 MIME 타입도 지정할 수 있습니다:

```
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

기본 디스크가 아닌 다른 저장소 디스크를 지정해야 한다면 `fromStorageDisk` 메서드를 사용할 수 있습니다:

```
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
#### Raw 데이터 첨부하기

바이트 문자열 등을 첨부파일로 추가하려면 `fromData` 메서드를 사용할 수 있습니다. 예를 들어, 메모리 내에서 PDF를 생성해 파일로 저장하지 않고 곧바로 첨부하고 싶을 때 사용할 수 있습니다. `fromData` 메서드는 첨부할 raw 데이터를 반환하는 클로저와 첨부파일 이름을 인자로 받습니다:

```
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

이메일에 인라인 이미지를 삽입하는 작업은 일반적으로 번거롭지만, 라라벨은 이미지를 이메일에 손쉽게 첨부할 수 있도록 편리한 방법을 제공합니다. 인라인 이미지를 삽입하려면, 이메일 템플릿 내에서 `$message` 변수의 `embed` 메서드를 사용하면 됩니다. 라라벨은 `$message` 변수를 모든 이메일 템플릿에서 자동으로 사용할 수 있도록 해주므로, 별도로 이 변수를 템플릿에 전달할 필요가 없습니다.

```blade
<body>
    Here is an image:

    <img src="{{ $message- />embed($pathToImage) }}">
</body>
```

> [!WARNING]
> `$message` 변수는 일반 텍스트 메시지 템플릿에서는 사용할 수 없습니다. 일반 텍스트 메시지는 인라인 첨부파일을 지원하지 않기 때문입니다.

<a name="embedding-raw-data-attachments"></a>
#### 원시 데이터 첨부파일 임베드

이미 이메일 템플릿에 삽입하고자 하는 원시 이미지 데이터 문자열이 있다면, `$message` 변수의 `embedData` 메서드를 사용할 수 있습니다. `embedData` 메서드를 호출할 때는 임베드될 이미지에 지정할 파일명을 함께 전달해야 합니다.

```blade
<body>
    Here is an image from raw data:

    <img src="{{ $message- />embedData($data, 'example-image.jpg') }}">
</body>
```

<a name="attachable-objects"></a>
### 첨부 가능한 오브젝트

파일을 첨부할 때 단순히 경로 문자열을 사용하는 것으로도 충분한 경우가 많지만, 실제 애플리케이션에서는 첨부하고자 하는 엔터티가 클래스로 표현되어 있을 때도 많습니다. 예를 들어, 애플리케이션에서 사진을 메시지에 첨부하려고 할 때, 이미 그 사진을 나타내는 `Photo` 모델이 존재할 수도 있습니다. 이런 경우, `Photo` 모델 인스턴스를 그대로 `attach` 메서드에 전달할 수 있다면 매우 편리할 것입니다. 첨부 가능한 오브젝트(Attachable object) 기능이 바로 이를 가능하게 해줍니다.

먼저, 메시지에 첨부하고자 하는 오브젝트에 `Illuminate\Contracts\Mail\Attachable` 인터페이스를 구현합니다. 이 인터페이스는 해당 클래스가 `Illuminate\Mail\Attachment` 인스턴스를 반환하는 `toMailAttachment` 메서드를 정의하도록 요구합니다.

```
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

첨부 가능한 오브젝트를 정의했다면, 이메일 메시지를 작성할 때 `attachments` 메서드에서 해당 오브젝트의 인스턴스를 반환하면 됩니다.

```
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

물론 첨부파일 데이터가 Amazon S3와 같은 원격 파일 저장소 서비스에 저장되어 있을 수도 있습니다. 이 경우에도 라라벨에서는 애플리케이션의 [파일시스템 디스크](/docs/10.x/filesystem)에 저장된 데이터를 이용하여 첨부파일 인스턴스를 만들 수 있도록 지원합니다.

```
// 기본 디스크에 저장된 파일로부터 첨부파일 인스턴스 생성...
return Attachment::fromStorage($this->path);

// 특정 디스크의 파일로부터 첨부파일 인스턴스 생성...
return Attachment::fromStorageDisk('backblaze', $this->path);
```

또한, 메모리에 보관 중인 데이터로부터 첨부파일 인스턴스를 생성할 수도 있습니다. 이를 위해서는 `fromData` 메서드에 클로저(익명 함수)를 전달하면 됩니다. 이 클로저에서는 첨부파일의 원시 데이터를 반환해야 합니다.

```
return Attachment::fromData(fn () => $this->content, 'Photo Name');
```

라라벨은 첨부파일을 커스터마이즈할 수 있는 추가 메서드들도 제공합니다. 예를 들어, `as`와 `withMime` 메서드를 사용해 파일명을 변경하거나 MIME 타입을 지정할 수 있습니다.

```
return Attachment::fromPath('/path/to/file')
        ->as('Photo Name')
        ->withMime('image/jpeg');
```

<a name="headers"></a>
### 헤더

경우에 따라 이메일 메시지에 추가적으로 커스텀 헤더를 첨부해야 할 수 있습니다. 예를 들어, 커스텀 `Message-Id` 값을 설정하거나 임의의 텍스트 헤더를 추가할 수도 있습니다.

이러한 작업을 위해서는 mailable 클래스에 `headers` 메서드를 정의하면 됩니다. `headers` 메서드는 `Illuminate\Mail\Mailables\Headers` 인스턴스를 반환해야 하며, 이 클래스는 `messageId`, `references`, `text` 파라미터를 받습니다. 당연히, 필요에 따라 원하는 파라미터만 전달하면 됩니다.

```
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

Mailgun, Postmark 등 일부 서드파티 이메일 서비스에서는 "태그"와 "메타데이터" 기능을 지원합니다. 이를 통해 애플리케이션에서 발송되는 이메일을 그룹화하고 추적할 수 있습니다. 이메일 메시지에 태그와 메타데이터를 추가하려면 `Envelope` 정의에서 관련 옵션을 지정하면 됩니다.

```
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

Mailgun 드라이버를 사용하는 경우, [태그](https://documentation.mailgun.com/en/latest/user_manual.html#tagging-1) 및 [메타데이터](https://documentation.mailgun.com/en/latest/user_manual.html#attaching-data-to-messages) 관련 Mailgun 공식 문서를 참고하시기 바랍니다. 마찬가지로 Postmark 관련 정보는 [태그](https://postmarkapp.com/blog/tags-support-for-smtp), [메타데이터](https://postmarkapp.com/support/article/1125-custom-metadata-faq) 문서를 참고할 수 있습니다.

Amazon SES를 통해 이메일을 발송하는 경우, 메시지에 [SES "tags"](https://docs.aws.amazon.com/ses/latest/APIReference/API_MessageTag.html)를 추가하려면 `metadata` 메서드를 사용해야 합니다.

<a name="customizing-the-symfony-message"></a>
### Symfony 메시지 커스터마이징

라라벨의 메일 기능은 Symfony Mailer를 기반으로 구현되어 있습니다. 라라벨에서는 메시지가 발송되기 전에 Symfony Message 인스턴스를 대상으로 커스텀 콜백을 등록할 수 있습니다. 이 콜백 내에서 메시지를 심층적으로 커스터마이즈할 수 있습니다. 이를 위해 `Envelope` 정의에서 `using` 파라미터를 사용하면 됩니다.

```
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
## 마크다운 메일러블 (Markdown Mailables)

마크다운 메일러블을 사용하면 라라벨의 [메일 알림](/docs/10.x/notifications#mail-notifications)에 내장된 템플릿과 컴포넌트의 장점을 그대로 메일러블에서 활용할 수 있습니다. 메시지는 마크다운(Markdown)으로 작성되므로, 라라벨이 반응형 HTML 템플릿을 자동으로 렌더링해주고 동시에 일반 텍스트 버전도 자동으로 생성해줍니다.

<a name="generating-markdown-mailables"></a>
### 마크다운 메일러블 생성하기

마크다운 템플릿이 포함된 메일러블 클래스를 생성하려면, `make:mail` Artisan 명령어의 `--markdown` 옵션을 사용하면 됩니다.

```shell
php artisan make:mail OrderShipped --markdown=mail.orders.shipped
```

이후, 메일러블 클래스의 `content` 메서드에서 `Content` 정의를 할 때 `view` 대신 `markdown` 파라미터를 사용하세요.

```
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
### 마크다운 메시지 작성하기

마크다운 메일러블은 Blade 컴포넌트와 마크다운(Markdown) 문법을 함께 사용합니다. 이를 통해 라라벨의 미리 만들어진 이메일 UI 컴포넌트를 활용하면서도 손쉽게 메일 메시지를 만들 수 있습니다.

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
> 마크다운 이메일을 작성할 때는 들여쓰기를 과하게 사용하지 않도록 주의하세요. 마크다운 문법상, 들여쓰기된 내용은 코드 블록으로 인식되어 렌더링됩니다.

<a name="button-component"></a>
#### 버튼 컴포넌트

버튼 컴포넌트는 가운데 정렬된 버튼 링크로 렌더링됩니다. 이 컴포넌트는 두 개의 인자, 즉 `url`과 옵션으로 `color`를 받을 수 있습니다. 지원하는 색상은 `primary`, `success`, `error`입니다. 버튼 컴포넌트는 이메일 메시지 내에서 원하는 만큼 여러 개 추가할 수 있습니다.

```blade
<x-mail::button :url="$url" color="success">
View Order
</x-mail::button>
```

<a name="panel-component"></a>
#### 패널 컴포넌트

패널 컴포넌트는 지정한 텍스트 블록을 메시지의 나머지 부분과 배경색이 약간 다른 패널 안에 렌더링해줍니다. 이를 사용하면 특정 텍스트 블록에 독자의 시선을 집중시킬 수 있습니다.

```blade
<x-mail::panel>
This is the panel content.
</x-mail::panel>
```

<a name="table-component"></a>
#### 테이블 컴포넌트

테이블 컴포넌트는 마크다운(Markdown) 표를 HTML 표로 변환해줍니다. 이 컴포넌트의 콘텐츠로 마크다운 표를 그대로 입력하면 됩니다. 표 컬럼 정렬은 기본 마크다운 표 문법을 그대로 지원합니다.

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

모든 마크다운 메일 컴포넌트를 내 애플리케이션으로 직접 내보내(Export) 하여 자유롭게 커스터마이즈할 수 있습니다. 컴포넌트 파일을 내보내려면, `laravel-mail` 에셋 태그를 지정하여 `vendor:publish` Artisan 명령어를 실행하세요.

```shell
php artisan vendor:publish --tag=laravel-mail
```

이 명령어를 실행하면 `resources/views/vendor/mail` 디렉터리에 마크다운 메일 컴포넌트 파일들이 생성됩니다. `mail` 디렉터리에는 각 컴포넌트의 HTML/텍스트 버전이 각각 `html`과 `text` 폴더로 구분되어 있습니다. 이제 이 컴포넌트 파일들을 원하는 대로 자유롭게 수정할 수 있습니다.

<a name="customizing-the-css"></a>
#### CSS 커스터마이징

컴포넌트를 내보낸 후, `resources/views/vendor/mail/html/themes` 디렉터리 내에 `default.css` 파일이 생성됩니다. 이 파일의 CSS를 수정하면, 해당 스타일이 자동으로 마크다운 메일 메시지 내 HTML에 인라인 스타일로 반영됩니다.

라라벨의 마크다운 컴포넌트용으로 완전히 새로운 테마를 만들고 싶다면, 별도의 CSS 파일을 `html/themes` 디렉터리에 추가하면 됩니다. 새 CSS 파일을 생성하고 저장한 뒤, 애플리케이션의 `config/mail.php` 설정 파일에서 `theme` 옵션 값을 새 테마명으로 변경하면 적용됩니다.

개별 메일러블에 대해 별도의 테마를 지정하고 싶다면, 해당 메일러블 클래스의 `$theme` 프로퍼티에 사용할 테마명을 할당하면 됩니다.

<a name="sending-mail"></a>
## 메일 전송하기

이메일을 보내려면, `Mail` [파사드](/docs/10.x/facades)의 `to` 메서드를 사용합니다. `to` 메서드는 이메일 주소, 사용자 인스턴스, 또는 사용자 컬렉션을 받을 수 있습니다. 만약 오브젝트 또는 오브젝트의 컬렉션을 전달하면, 라라벨에서는 해당 오브젝트의 `email`과 `name` 속성을 자동으로 참조하여 이메일 수신자를 결정하므로, 오브젝트에 이 속성이 있는지 확인해야 합니다. 수신자를 지정한 후에는, 메일러블 클래스의 인스턴스를 `send` 메서드에 전달하면 됩니다.

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
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

이메일 전송 시 "to" 수신자만 지정하는 데에 그치지 않고, "cc", "bcc" 등 다양한 수신 유형을 각각의 메서드를 체이닝하여 함께 지정할 수도 있습니다.

```
Mail::to($request->user())
    ->cc($moreUsers)
    ->bcc($evenMoreUsers)
    ->send(new OrderShipped($order));
```

<a name="looping-over-recipients"></a>
#### 수신자 리스트에 반복적으로 발송하기

간혹 여러 명의 수신자(또는 이메일 주소) 목록을 반복(iterate)하여 각각에게 메일러블을 보내고 싶을 때가 있습니다. 그러나 `to` 메서드는 수신자 목록에 이메일을 계속 추가하는 방식이므로, 반복문에서 한 인스턴스의 메일러블을 재사용한다면 이미 지정된 모든 이전 수신자에게도 다시 전송됩니다. 따라서, 반드시 수신자마다 새 메일러블 인스턴스를 생성하여 보내야 합니다.

```
foreach (['taylor@example.com', 'dries@example.com'] as $recipient) {
    Mail::to($recipient)->send(new OrderShipped($order));
}
```

<a name="sending-mail-via-a-specific-mailer"></a>
#### 특정 메일러를 통한 메일 발송

기본적으로 라라벨은 애플리케이션의 `mail` 설정 파일에 명시된 `default` 메일러 설정을 사용하여 이메일을 발송합니다. 그러나, `mailer` 메서드를 사용하면 특정 메일러 설정으로 메시지를 발송할 수 있습니다.

```
Mail::mailer('postmark')
        ->to($request->user())
        ->send(new OrderShipped($order));
```

<a name="queueing-mail"></a>
### 메일 큐잉(Queueing)

<a name="queueing-a-mail-message"></a>
#### 메일 메시지 큐잉

이메일 발송은 애플리케이션의 응답 시간을 늘릴 수 있으므로, 많은 개발자들은 이메일을 백그라운드에서 큐로 처리하도록 설계합니다. 라라벨은 [통합 큐 API](/docs/10.x/queues)를 통해 이 과정을 쉽게 처리할 수 있도록 지원합니다. 메일 메시지를 큐에 넣으려면 수신자를 지정하고 `Mail` 파사드의 `queue` 메서드를 사용합니다.

```
Mail::to($request->user())
    ->cc($moreUsers)
    ->bcc($evenMoreUsers)
    ->queue(new OrderShipped($order));
```

이 방법은 백그라운드에서 메시지가 발송되도록 자동으로 큐에 작업을 추가합니다. 이 기능을 사용하려면 사전에 [큐 설정](/docs/10.x/queues)이 필요합니다.

<a name="delayed-message-queueing"></a>
#### 메일 큐 전송 지연시키기

큐에 쌓인 이메일 메시지의 발송 시점을 지연시키고 싶을 때는 `later` 메서드를 사용할 수 있습니다. 이 메서드는 첫 번째 인자로 이메일이 전송될 시점의 `DateTime` 인스턴스를 받습니다.

```
Mail::to($request->user())
    ->cc($moreUsers)
    ->bcc($evenMoreUsers)
    ->later(now()->addMinutes(10), new OrderShipped($order));
```

<a name="pushing-to-specific-queues"></a>
#### 특정 큐로 작업 할당하기

`make:mail`을 통해 생성된 모든 메일러블 클래스에는 기본적으로 `Illuminate\Bus\Queueable` 트레이트(trait)가 포함되어 있으므로, 메일러블 인스턴스의 `onQueue` 및 `onConnection` 메서드를 활용해 메시지의 큐 이름과 연결명을 지정할 수 있습니다.

```
$message = (new OrderShipped($order))
                ->onConnection('sqs')
                ->onQueue('emails');

Mail::to($request->user())
    ->cc($moreUsers)
    ->bcc($evenMoreUsers)
    ->queue($message);
```

<a name="queueing-by-default"></a>
#### 기본적으로 큐에 메일러블 보내기

항상 큐를 통해 발송하고 싶은 메일러블 클래스라면, 해당 클래스에 `ShouldQueue` 계약(Contract)을 구현하면 됩니다. 이 경우, 메일 발송 시에 `send` 메서드를 사용하더라도 메일러블은 항상 큐에 들어갑니다.

```
use Illuminate\Contracts\Queue\ShouldQueue;

class OrderShipped extends Mailable implements ShouldQueue
{
    // ...
}
```

<a name="queued-mailables-and-database-transactions"></a>
#### 큐잉된 메일러블과 데이터베이스 트랜잭션의 관계

큐잉된 메일러블이 데이터베이스 트랜잭션 내에서 디스패치될 경우, 작업이 트랜잭션 커밋보다 먼저 큐에서 실행될 수 있습니다. 이러면 트랜잭션 내에서 생성하거나 수정한 모델 또는 데이터베이스 레코드가 실제로 아직 데이터베이스에 반영되지 않은 상태일 수 있습니다. 만일 메일러블이 이러한 모델에 의존하고 있다면, 큐 작업 실행 시 예기치 않은 오류가 발생할 수 있습니다.

만약 큐 커넥션의 `after_commit` 설정 값이 `false`로 되어 있다면, 특정 큐잉된 메일러블이 모든 데이터베이스 트랜잭션이 커밋된 후 디스패치되도록 `afterCommit` 메서드를 호출할 수 있습니다.

```
Mail::to($request->user())->send(
    (new OrderShipped($order))->afterCommit()
);
```

또는, 메일러블 클래스의 생성자에서 `afterCommit` 메서드를 호출할 수도 있습니다.

```
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
> 이러한 문제를 우회하는 더 자세한 방법은 [큐 작업과 데이터베이스 트랜잭션 문서](/docs/10.x/queues#jobs-and-database-transactions)를 참고하세요.

<a name="rendering-mailables"></a>
## 메일러블 렌더링하기

가끔은 실제로 이메일을 보내지 않고, 메일러블의 HTML 내용을 단순히 문자열로 받아보고 싶을 때가 있습니다. 이럴 때는, 메일러블의 `render` 메서드를 호출하면 해당 메일러블의 HTML 콘텐츠가 문자열로 반환됩니다.

```
use App\Mail\InvoicePaid;
use App\Models\Invoice;

$invoice = Invoice::find(1);

return (new InvoicePaid($invoice))->render();
```

<a name="previewing-mailables-in-the-browser"></a>
### 브라우저에서 메일러블 미리보기

메일러블 템플릿을 디자인할 때, 실제 이메일로 전송하지 않고도 일반 Blade 템플릿처럼 브라우저에서 빠르게 렌더링된 모양을 확인하면 아주 편리합니다. 그래서 라라벨에서는 라우트 클로저 또는 컨트롤러에서 메일러블을 직접 반환하면, 해당 메일러블이 렌더링되어 브라우저에서 미리보기로 표시됩니다.

```
Route::get('/mailable', function () {
    $invoice = App\Models\Invoice::find(1);

    return new App\Mail\InvoicePaid($invoice);
});
```

<a name="localizing-mailables"></a>
## 메일러블 다국어(로컬라이징) 지원

라라벨에서는 요청의 기본 언어설정과는 다른 언어로 메일러블을 보낼 수 있으며, 심지어 메일 전송이 큐에 예약되었을 때도 이 언어설정을 기억하여 적용해줍니다.

이를 위해 `Mail` 파사드의 `locale` 메서드를 사용하면 원하는 언어코드를 지정할 수 있습니다. 메일러블의 템플릿이 렌더링되는 동안에는 해당 언어로 자동 전환되며, 처리 후에는 이전 언어로 복원됩니다.

```
Mail::to($request->user())->locale('es')->send(
    new OrderShipped($order)
);
```

<a name="user-preferred-locales"></a>
### 사용자의 선호 언어(로케일) 자동 적용

애플리케이션에서 각 사용자의 선호 언어를 별도로 저장해두는 경우가 많습니다. 모델에서 `HasLocalePreference` 계약(Contract)을 구현하면, 메일 발송 시 이 정보를 자동으로 활용하도록 라라벨에 지시할 수 있습니다.

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

이 인터페이스를 구현한 후에는, 라라벨이 해당 모델에 대해 메일러블과 알림을 발송할 때 자동으로 선호 언어 정보를 사용하므로, 더 이상 직접 `locale` 메서드를 호출할 필요가 없습니다.

```
Mail::to($request->user())->send(new OrderShipped($order));
```

<a name="testing-mailables"></a>
## 테스트

<a name="testing-mailable-content"></a>
### 메일러블 내용 테스트

라라벨은 메일러블의 구조를 점검할 수 있는 다양한 메서드를 제공합니다. 또한, 메일러블에 기대하는 내용이 실제로 포함되어 있는지를 쉽게 테스트할 수 있도록 여러 편의 메서드도 제공합니다. 대표적인 메서드로는 `assertSeeInHtml`, `assertDontSeeInHtml`, `assertSeeInOrderInHtml`, `assertSeeInText`, `assertDontSeeInText`, `assertSeeInOrderInText`, `assertHasAttachment`, `assertHasAttachedData`, `assertHasAttachmentFromStorage`, `assertHasAttachmentFromStorageDisk` 등이 있습니다.

"HTML" 관련 assertion은 메일러블의 HTML 버전에 특정 문자열이 포함되어 있는지를, "text" 관련 assertion은 일반 텍스트 버전에 특정 문자열이 포함되어 있는지를 각각 확인합니다.

```
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

### 메일러블 발송 테스트

특정 사용자를 대상으로 한 메일러블이 실제로 "발송"되었는지를 확인하는 테스트와, 메일러블의 콘텐츠 자체를 테스트하는 코드는 별도로 분리해서 관리하는 것이 좋습니다. 일반적으로 메일러블의 실제 내용은 테스트하려는 코드와 직접적인 관련이 없는 경우가 많으므로, Laravel이 특정 메일러블을 발송하도록 지시받았는지만 확인해도 충분합니다.

메일이 실제로 발송되는 것을 방지하려면 `Mail` 파사드의 `fake` 메서드를 사용할 수 있습니다. `Mail::fake()`를 호출한 후에는, 메일러블이 특정 사용자에게 발송되었는지 검증할 수 있으며, 메일러블이 받은 데이터를 직접 확인할 수도 있습니다.

```
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

        // Assert a mailable was not sent...
        Mail::assertNotSent(AnotherMailable::class);

        // Assert 3 total mailables were sent...
        Mail::assertSentCount(3);
    }
}
```

만약 메일러블을 백그라운드 큐에서 발송하도록 설정했다면, `assertSent` 대신 `assertQueued` 메서드를 사용해야 합니다.

```
Mail::assertQueued(OrderShipped::class);
Mail::assertNotQueued(OrderShipped::class);
Mail::assertNothingQueued();
Mail::assertQueuedCount(3);
```

`assertSent`, `assertNotSent`, `assertQueued`, `assertNotQueued` 메서드에는 클로저를 인수로 전달할 수 있습니다. 이 클로저에서는 "검증 조건"을 지정할 수 있으며, 조건을 만족하는 메일러블이 하나라도 발송(또는 큐잉)됐다면 해당 검증은 통과합니다.

```
Mail::assertSent(function (OrderShipped $mail) use ($order) {
    return $mail->order->id === $order->id;
});
```

`Mail` 파사드의 assert 계열 메서드에서 전달받는 메일러블 인스턴스는, 메일의 여러 정보들을 쉽게 확인할 수 있도록 다양한 메서드를 제공합니다.

```
Mail::assertSent(OrderShipped::class, function (OrderShipped $mail) use ($user) {
    return $mail->hasTo($user->email) &&
           $mail->hasCc('...') &&
           $mail->hasBcc('...') &&
           $mail->hasReplyTo('...') &&
           $mail->hasFrom('...') &&
           $mail->hasSubject('...');
});
```

메일러블 인스턴스에는 첨부 파일에 대한 정보를 검사할 수 있는 메서드도 여러 가지가 준비되어 있습니다.

```
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

메일이 발송되지 않았는지를 확인하는 두 가지 메서드인 `assertNotSent`와 `assertNotQueued`가 있습니다. 만약 **발송**과 **큐잉** 모두 이루어지지 않았는지 동시에 검증하고 싶다면, `assertNothingOutgoing` 또는 `assertNotOutgoing` 메서드를 사용할 수 있습니다.

```
Mail::assertNothingOutgoing();

Mail::assertNotOutgoing(function (OrderShipped $mail) use ($order) {
    return $mail->order->id === $order->id;
});
```

<a name="mail-and-local-development"></a>
## 메일과 로컬 개발 환경

이메일을 발송하는 애플리케이션을 개발할 때, 실제 이메일 주소로 메일을 보내기를 원하지 않을 수 있습니다. Laravel은 로컬 개발 도중 실제 메일 발송을 "비활성화"하는 다양한 방법을 제공합니다.

<a name="log-driver"></a>
#### Log 드라이버

메시지를 실제로 발송하는 대신, `log` 메일 드라이버는 모든 이메일 메시지를 로그 파일에 기록하여 직접 확인할 수 있게 합니다. 이 드라이버는 일반적으로 로컬 개발 환경에서만 사용됩니다. 환경별 애플리케이션 설정에 대한 자세한 내용은 [구성 문서](/docs/10.x/configuration#environment-configuration)를 참고하세요.

<a name="mailtrap"></a>
#### HELO / Mailtrap / Mailpit

또 다른 방법으로, [HELO](https://usehelo.com)나 [Mailtrap](https://mailtrap.io) 같은 서비스를 `smtp` 드라이버와 함께 사용하면, 진짜 이메일 클라이언트처럼 메일을 전송해볼 수 있는 "가상" 사서함으로 이메일이 전달됩니다. 이런 방법은 Mailtrap의 메시지 뷰어에서 실제 발송되는 이메일을 직접 확인할 수 있다는 장점이 있습니다.

[Laravel Sail](/docs/10.x/sail)을 사용한다면, [Mailpit](https://github.com/axllent/mailpit)으로 메시지를 미리보기 할 수도 있습니다. Sail이 실행 중이라면, 다음 주소에서 Mailpit 인터페이스에 접근할 수 있습니다: `http://localhost:8025`

<a name="using-a-global-to-address"></a>
#### 전역 `to` 주소 사용하기

마지막 방법으로, `Mail` 파사드에서 제공하는 `alwaysTo` 메서드를 사용하면 모든 메일이 특정 전역 주소로 발송되도록 지정할 수도 있습니다. 일반적으로 이 메서드는 애플리케이션의 서비스 프로바이더 중 하나의 `boot` 메서드 안에서 호출합니다.

```
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
## 이벤트

Laravel은 메일 발송 과정에서 두 가지 이벤트를 발생시킵니다. `MessageSending` 이벤트는 메시지가 발송되기 전에 발생하고, `MessageSent` 이벤트는 메시지가 발송된 후에 발생합니다. 이 이벤트들은 메일이 *실제로 발송*될 때 트리거된다는 점에 유의하세요(큐잉 시점이 아님). 해당 이벤트에 리스너를 등록하려면, 애플리케이션의 `App\Providers\EventServiceProvider`에서 다음처럼 설정할 수 있습니다.

```
use App\Listeners\LogSendingMessage;
use App\Listeners\LogSentMessage;
use Illuminate\Mail\Events\MessageSending;
use Illuminate\Mail\Events\MessageSent;

/**
 * The event listener mappings for the application.
 *
 * @var array
 */
protected $listen = [
    MessageSending::class => [
        LogSendingMessage::class,
    ],

    MessageSent::class => [
        LogSentMessage::class,
    ],
];
```

<a name="custom-transports"></a>
## 커스텀 트랜스포트

Laravel은 다양한 메일 트랜스포트를 제공하지만, 경우에 따라 기본 제공되지 않는 외부 서비스로 메일을 전달하기 위해 직접 트랜스포트를 작성하고자 할 수 있습니다. 직접 구현하려면, 먼저 `Symfony\Component\Mailer\Transport\AbstractTransport` 클래스를 확장하는 클래스를 정의하세요. 그 후, 해당 클래스에서 `doSend`와 `__toString()` 메서드를 구현하면 됩니다.

```
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

커스텀 트랜스포트를 정의한 후에는, `Mail` 파사드가 제공하는 `extend` 메서드로 해당 트랜스포트를 등록할 수 있습니다. 보통 이 작업은 애플리케이션의 `AppServiceProvider`의 `boot` 메서드 안에서 진행합니다. `extend`로 전달된 클로저에는 `$config` 인수가 주어지며, 이 인수에는 애플리케이션의 `config/mail.php`에서 정의된 해당 mailer의 설정 배열이 담겨 있습니다.

```
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

커스텀 트랜스포트를 정의하고 등록했다면, 이제 `config/mail.php` 설정 파일에 해당 트랜스포트를 사용하는 mailer 정의를 추가할 수 있습니다.

```
'mailchimp' => [
    'transport' => 'mailchimp',
    // ...
],
```

<a name="additional-symfony-transports"></a>
### 추가 Symfony 트랜스포트

Laravel은 Mailgun, Postmark 등 일부 Symfony에서 관리하는 메일 트랜스포트를 기본 지원하지만, 필요하다면 추가로 Symfony가 제공하는 트랜스포트를 직접 확장할 수도 있습니다. 이를 위해서는 해당 Symfony 메일러 패키지를 Composer로 설치한 후, 트랜스포트를 Laravel에 직접 등록해야 합니다. 예를 들어, "Brevo"(이전 명칭: "Sendinblue")용 Symfony 메일러를 추가하고 싶다면 아래와 같이 설치합니다.

```none
composer require symfony/brevo-mailer symfony/http-client
```

Brevo 메일러 패키지 설치를 마쳤다면, 애플리케이션의 `services` 설정 파일에 Brevo API 자격 증명을 추가합니다.

```
'brevo' => [
    'key' => 'your-api-key',
],
```

이후, `Mail` 파사드의 `extend` 메서드로 트랜스포트를 등록할 수 있습니다. 보통 이 과정은 서비스 프로바이더의 `boot` 메서드에서 진행합니다.

```
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

트랜스포트 등록을 마쳤으면, 이제 `config/mail.php` 설정 파일에 해당 트랜스포트를 사용하는 mailer 정의를 추가할 수 있습니다.

```
'brevo' => [
    'transport' => 'brevo',
    // ...
],
```