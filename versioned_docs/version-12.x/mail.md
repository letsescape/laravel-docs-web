# 메일 (Mail)

- [소개](#introduction)
    - [설정](#configuration)
    - [드라이버 사전 준비사항](#driver-prerequisites)
    - [페일오버(failover) 구성](#failover-configuration)
    - [라운드로빈(round robin) 구성](#round-robin-configuration)
- [메일러블 생성](#generating-mailables)
- [메일러블 작성](#writing-mailables)
    - [발신자 설정](#configuring-the-sender)
    - [뷰(view) 설정](#configuring-the-view)
    - [뷰 데이터](#view-data)
    - [첨부 파일](#attachments)
    - [인라인 첨부 파일](#inline-attachments)
    - [첨부 가능한 객체(Attachable Objects)](#attachable-objects)
    - [헤더](#headers)
    - [태그 및 메타데이터](#tags-and-metadata)
    - [Symfony 메시지 커스터마이즈](#customizing-the-symfony-message)
- [마크다운 메일러블](#markdown-mailables)
    - [마크다운 메일러블 생성](#generating-markdown-mailables)
    - [마크다운 메시지 작성](#writing-markdown-messages)
    - [컴포넌트 커스터마이즈](#customizing-the-components)
- [메일 전송](#sending-mail)
    - [메일 큐잉(Queueing Mail)](#queueing-mail)
- [메일러블 렌더링](#rendering-mailables)
    - [메일러블을 브라우저에서 미리보기](#previewing-mailables-in-the-browser)
- [메일러블 현지화(Localizing)](#localizing-mailables)
- [테스트](#testing-mailables)
    - [메일러블 본문 테스트](#testing-mailable-content)
    - [메일러블 발송 테스트](#testing-mailable-sending)
- [메일과 로컬 개발 환경](#mail-and-local-development)
- [이벤트](#events)
- [커스텀 트랜스포트(Custom Transports)](#custom-transports)
    - [추가 Symfony 트랜스포트](#additional-symfony-transports)

<a name="introduction"></a>
## 소개

이메일을 발송하는 작업은 복잡할 필요가 없습니다. 라라벨은 인기 있는 [Symfony Mailer](https://symfony.com/doc/current/mailer.html) 컴포넌트를 기반으로 하는 깔끔하고 간단한 이메일 API를 제공합니다. 라라벨과 Symfony Mailer는 SMTP, Mailgun, Postmark, Resend, Amazon SES, 그리고 `sendmail`을 통한 메일 발송을 지원하는 여러 드라이버를 제공하므로, 여러분이 원하는 로컬 또는 클라우드 기반 서비스로 손쉽게 메일을 발송할 수 있습니다.

<a name="configuration"></a>
### 설정

라라벨의 이메일 서비스는 애플리케이션의 `config/mail.php` 설정 파일을 통해 구성할 수 있습니다. 이 파일 내에서 각 메일러(mailer)는 고유한 설정값과 전송 방식("transport")을 가질 수 있으므로, 특정 이메일 메시지마다 서로 다른 이메일 서비스를 사용할 수도 있습니다. 예를 들어, 애플리케이션은 체크아웃과 같은 트랜잭션 메일은 Postmark를 이용해 보내고, 대량 메일은 Amazon SES로 보낼 수 있습니다.

`mail` 설정 파일을 살펴보면, `mailers`라는 배열이 있습니다. 이 배열에는 라라벨에서 지원하는 주요 메일 드라이버/트랜스포트별 샘플 설정이 담겨 있으며, `default` 값에 어떤 메일러를 기본으로 사용할지 지정할 수 있습니다. 애플리케이션이 이메일을 보낼 때 특별히 지정하지 않으면 이 기본 메일러가 사용됩니다.

<a name="driver-prerequisites"></a>
### 드라이버 / 트랜스포트 사전 준비사항

Mailgun, Postmark, Resend, MailerSend와 같은 API 기반 드라이버는 SMTP 서버를 이용하는 것보다 더 간단하고 빠른 경우가 많습니다. 가능하다면 이러한 드라이버 중 하나를 사용하는 것을 권장합니다.

<a name="mailgun-driver"></a>
#### Mailgun 드라이버

Mailgun 드라이버를 사용하려면, Composer를 통해 Symfony의 Mailgun Mailer 트랜스포트를 설치해야 합니다:

```shell
composer require symfony/mailgun-mailer symfony/http-client
```

설치 후, 애플리케이션의 `config/mail.php` 파일에서 두 가지를 변경해야 합니다. 먼저, 기본 메일러를 `mailgun`으로 설정합니다:

```php
'default' => env('MAIL_MAILER', 'mailgun'),
```

그리고 나서, 아래와 같은 설정 배열을 `mailers` 배열에 추가하세요:

```php
'mailgun' => [
    'transport' => 'mailgun',
    // 'client' => [
    //     'timeout' => 5,
    // ],
],
```

기본 메일러를 설정한 뒤에는, `config/services.php` 설정 파일에 아래 정보를 추가하세요:

```php
'mailgun' => [
    'domain' => env('MAILGUN_DOMAIN'),
    'secret' => env('MAILGUN_SECRET'),
    'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
    'scheme' => 'https',
],
```

만약 미국 외 [Mailgun region](https://documentation.mailgun.com/en/latest/api-intro.html#mailgun-regions)을 사용한다면, `services` 설정 파일에서 해당 지역의 endpoint를 지정할 수 있습니다:

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

[Postmark](https://postmarkapp.com/) 드라이버를 사용하려면, Composer를 통해 Symfony의 Postmark Mailer 트랜스포트를 설치해야 합니다:

```shell
composer require symfony/postmark-mailer symfony/http-client
```

이후 애플리케이션의 `config/mail.php` 파일에서 `default` 옵션을 `postmark`로 설정합니다. 기본 메일러를 설정한 뒤에는, `config/services.php` 파일에 아래와 같은 옵션이 있는지 확인하세요:

```php
'postmark' => [
    'token' => env('POSTMARK_TOKEN'),
],
```

특정 메일러에서 사용할 Postmark 메시지 스트림을 지정하려면, 메일러 설정 배열에 `message_stream_id` 옵션을 추가하면 됩니다. 이 배열은 애플리케이션의 `config/mail.php` 파일 내에서 확인할 수 있습니다:

```php
'postmark' => [
    'transport' => 'postmark',
    'message_stream_id' => env('POSTMARK_MESSAGE_STREAM_ID'),
    // 'client' => [
    //     'timeout' => 5,
    // ],
],
```

이렇게 하면, 서로 다른 메시지 스트림을 사용하는 Postmark 메일러를 여러 개 설정할 수도 있습니다.

<a name="resend-driver"></a>
#### Resend 드라이버

[Resend](https://resend.com/) 드라이버를 사용하려면, Composer를 통해 Resend의 PHP SDK를 설치해야 합니다:

```shell
composer require resend/resend-php
```

설치 후에는 애플리케이션의 `config/mail.php` 파일에서 `default` 옵션을 `resend`로 설정합니다. 그리고 `config/services.php` 파일에 아래 항목이 있는지 확인하세요:

```php
'resend' => [
    'key' => env('RESEND_KEY'),
],
```

<a name="ses-driver"></a>
#### SES 드라이버

Amazon SES 드라이버를 사용하기 위해서는 먼저 Amazon AWS SDK for PHP를 설치해야 합니다. Composer 패키지 매니저로 다음 라이브러리를 설치하세요:

```shell
composer require aws/aws-sdk-php
```

설치가 끝나면, `config/mail.php` 파일에서 `default` 옵션을 `ses`로 하고, `config/services.php` 파일에 아래와 같은 옵션이 포함되어 있는지 확인하세요:

```php
'ses' => [
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
],
```

AWS의 [임시 자격 증명(temporary credentials)](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_use-resources.html)을 사용하고 싶다면, SES 설정에 `token` 키를 추가할 수 있습니다:

```php
'ses' => [
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    'token' => env('AWS_SESSION_TOKEN'),
],
```

SES의 [구독 관리(subscription management) 기능](https://docs.aws.amazon.com/ses/latest/dg/sending-email-subscription-management.html)을 활용하려면, 메일 메시지의 [headers](#headers) 메서드에서 아래처럼 헤더 값을 반환하세요:

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

라라벨에서 이메일 발송 시 AWS SDK의 `SendEmail` 메서드로 추가 [옵션](https://docs.aws.amazon.com/aws-sdk-php/v3/api/api-sesv2-2019-09-27.html#sendemail)을 전달하고 싶은 경우, SES 설정에 `options` 배열을 정의할 수 있습니다:

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

[MailerSend](https://www.mailersend.com/)는 트랜잭션 이메일 및 SMS 서비스를 제공하며, 라라벨용 API 기반 메일 드라이버를 자체적으로 제공합니다. 해당 드라이버 패키지는 Composer를 통해 설치할 수 있습니다:

```shell
composer require mailersend/laravel-driver
```

패키지를 설치한 후에는, 애플리케이션의 `.env` 파일에 `MAILERSEND_API_KEY` 환경 변수를 추가하세요. 그리고 `MAIL_MAILER` 환경 변수도 `mailersend`로 지정해야 합니다:

```ini
MAIL_MAILER=mailersend
MAIL_FROM_ADDRESS=app@yourdomain.com
MAIL_FROM_NAME="App Name"

MAILERSEND_API_KEY=your-api-key
```

마지막으로, 애플리케이션의 `config/mail.php` 파일 내 `mailers` 배열에 MailerSend를 추가하세요:

```php
'mailersend' => [
    'transport' => 'mailersend',
],
```

MailerSend의 호스팅 템플릿 등 더 자세한 사용법은 [MailerSend 드라이버 공식 문서](https://github.com/mailersend/mailersend-laravel-driver#usage)를 참고하세요.

<a name="failover-configuration"></a>
### 페일오버(failover) 구성

외부 서비스 중 하나가 다운될 경우, 애플리케이션의 메일 발송이 중단될 수 있습니다. 이런 상황을 대비해서, 주 메일 드라이버가 동작하지 않을 때 사용할 백업 메일 발송 구성을 하나 또는 여러 개 정의해두면 도움이 됩니다.

이를 위해서는 애플리케이션의 `mail` 설정 파일에 `failover` 트랜스포트를 사용하는 메일러를 정의해야 합니다. 이 메일러의 설정 배열에는 사용할 메일러의 우선순위를 배열로 지정할 수 있습니다:

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

이렇게 페일오버 메일러를 정의한 후에는, 이 메일러의 이름을 `mail` 설정 파일의 `default` 값에 지정해서 애플리케이션에서 기본 메일러로 사용하도록 해야 합니다:

```php
'default' => env('MAIL_MAILER', 'failover'),
```

<a name="round-robin-configuration"></a>
### 라운드로빈(round robin) 구성

`roundrobin` 트랜스포트를 사용하면 여러 메일러에 걸쳐 메일 발송 작업을 분산할 수 있습니다. 시작하려면, `mail` 설정 파일 내에 `roundrobin` 트랜스포트를 사용하는 메일러를 정의하세요. 이 메일러 설정 배열에는 실제로 사용할 메일러 이름을 배열로 지정합니다:

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

라운드로빈 메일러를 정의한 후에는, 이 메일러 이름을 `mail` 설정 파일의 `default`에 지정해야 합니다:

```php
'default' => env('MAIL_MAILER', 'roundrobin'),
```

라운드로빈 트랜스포트는 설정된 메일러 중 하나를 랜덤으로 선택한 뒤, 이후 이메일부터 차례대로 다음 메일러로 자동 전환합니다. 이 방식은 *[고가용성(high availability)](https://en.wikipedia.org/wiki/High_availability)* 을 제공하는 `failover` 트랜스포트와 달리, *[로드 밸런싱(load balancing)](https://en.wikipedia.org/wiki/Load_balancing_(computing))* 을 위해 사용됩니다.

<a name="generating-mailables"></a>
## 메일러블 생성

라라벨 애플리케이션에서 발송하는 각 이메일 유형은 "메일러블(mailable)" 클래스 하나로 표현됩니다. 이 클래스들은 `app/Mail` 디렉토리에 저장됩니다. 이 디렉토리가 없더라도 걱정하지 마세요. 공식적으로 메일러블 클래스를 처음 생성할 때, `make:mail` 아티즌 명령어가 디렉토리를 자동으로 만들어줍니다:

```shell
php artisan make:mail OrderShipped
```

<a name="writing-mailables"></a>
## 메일러블 작성

메일러블 클래스를 생성했다면, 이제 그 파일을 열어 내부 구조를 살펴보겠습니다. 메일러블 클래스의 설정은 주로 `envelope`, `content`, `attachments` 메서드에서 이뤄집니다.

`envelope` 메서드는 메시지의 제목과, 경우에 따라 수신자를 정의하는 `Illuminate\Mail\Mailables\Envelope` 객체를 반환합니다. `content` 메서드는 메일 메시지의 본문을 만들 때 사용할 [Blade 템플릿](/docs/12.x/blade)을 정의하는 `Illuminate\Mail\Mailables\Content` 객체를 반환합니다.

<a name="configuring-the-sender"></a>
### 발신자 설정

<a name="using-the-envelope"></a>
#### Envelope로 설정하기

먼저, 이메일의 발신자, 즉 '누구로부터 보내는가'를 어떻게 설정하는지 살펴보겠습니다. 발신자는 두 가지 방법으로 지정할 수 있습니다. 첫 번째는 메시지의 envelope에서 "from" 주소를 직접 지정하는 방법입니다:

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

필요하다면 `replyTo` 주소도 함께 지정할 수 있습니다:

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
#### 전역 "from" 주소 사용하기

애플리케이션에서 모든 이메일에 동일한 "from" 주소를 사용한다면, 각 메일러블 클래스마다 일일이 지정하는 것이 번거로울 수 있습니다. 이럴 때는 `config/mail.php` 설정 파일의 전역 "from" 주소 항목에 값을 지정해두면, 메일러블 클래스 내에서 별도로 설정하지 않아도 이 주소가 자동으로 사용됩니다:

```php
'from' => [
    'address' => env('MAIL_FROM_ADDRESS', 'hello@example.com'),
    'name' => env('MAIL_FROM_NAME', 'Example'),
],
```

그리고 `config/mail.php` 파일에서 전역 "reply_to" 주소도 정의할 수 있습니다:

```php
'reply_to' => ['address' => 'example@example.com', 'name' => 'App Name'],
```

<a name="configuring-the-view"></a>
### 뷰(view) 설정

메일러블 클래스의 `content` 메서드에서는 이메일 내용 렌더링에 사용할 `view`(템플릿)를 지정할 수 있습니다. 일반적으로 이메일은 [Blade 템플릿](/docs/12.x/blade)을 사용해 본문을 렌더링하므로, 라라벨 Blade의 모든 기능을 메일 HTML 작성에 활용할 수 있습니다:

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
> 이메일 템플릿을 보관할 용도로 `resources/views/emails` 디렉토리를 따로 만드는 것을 추천하지만, `resources/views` 내부 어디든 자유롭게 템플릿을 둘 수 있습니다.

<a name="plain-text-emails"></a>
#### 일반 텍스트(plain-text) 이메일

이메일을 일반 텍스트 형식으로도 보내고 싶다면, 메시지의 `Content` 정의에 plain-text 템플릿을 함께 지정할 수 있습니다. `view`와 마찬가지로 `text` 파라미터에도 렌더링에 사용할 템플릿 이름을 전달합니다. HTML 버전과 plain-text 버전을 함께 정의해도 괜찮습니다:

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

보다 명확하게 하려면, `view` 대신 `html` 파라미터를 사용할 수도 있습니다:

```php
return new Content(
    html: 'mail.orders.shipped',
    text: 'mail.orders.shipped-text'
);
```

<a name="view-data"></a>
### 뷰 데이터

<a name="via-public-properties"></a>
#### public 프로퍼티로 데이터 전달

이메일 HTML을 렌더링할 때 뷰로 데이터를 넘겨야 할 때가 많습니다. 뷰에 데이터를 전달하는 방법은 두 가지가 있습니다. 첫째, 메일러블 클래스에 정의된 public 프로퍼티는 자동으로 뷰에서 사용할 수 있게 전달됩니다. 예를 들어, 생성자를 통해 데이터를 전달하고, 그 값을 public 프로퍼티에 할당하면 됩니다:

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

데이터가 public 프로퍼티에 할당되면, 뷰에서 일반 Blade 데이터처럼 바로 접근할 수 있습니다:

```blade
<div>
    Price: {{ $order->price }}
</div>
```

<a name="via-the-with-parameter"></a>
#### `with` 파라미터로 전달

이메일에 전달하는 데이터 형식을 직접 커스터마이즈하고 싶다면, Content 정의의 `with` 파라미터를 통해 직접 데이터를 넘길 수 있습니다. 일반적으로 생성자를 통해 데이터를 전달하되, 해당 데이터를 protected나 private 프로퍼티에 저장하고, 뷰로 넘길 때 명시적으로 변환해 전달하는 방식입니다:

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

이렇게 `with`로 넘긴 데이터 역시 뷰에서 Blade 변수로 자유롭게 사용할 수 있습니다:

```blade
<div>
    Price: {{ $orderPrice }}
</div>
```

<a name="attachments"></a>
### 첨부 파일

이메일에 첨부 파일을 추가하려면, 메시지의 `attachments` 메서드에서 첨부파일을 배열로 반환하면 됩니다. 가장 기본적인 방법은 Attachment 클래스의 `fromPath` 메서드에 파일 경로를 넘기는 것입니다:

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

파일을 첨부할 때, 표시될 파일 이름이나 MIME 타입도 `as`와 `withMime` 메서드로 지정할 수 있습니다:

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
#### 파일 시스템 디스크에서 파일 첨부

[파일시스템 디스크](/docs/12.x/filesystem)에 파일을 저장했다면, `fromStorage` 첨부 메서드를 사용해 이메일에 첨부할 수 있습니다:

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

물론 첨부파일의 이름이나 MIME 타입도 지정할 수 있습니다:

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

기본 디스크가 아닌 특정 스토리지 디스크를 지정해야 한다면, `fromStorageDisk` 메서드를 사용할 수 있습니다:

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

#### Raw Data 첨부하기

`fromData` 첨부 메서드는 바이트 배열 형태의 원시 문자열을 첨부 파일로 추가할 때 사용할 수 있습니다. 예를 들어, 메모리 상에 PDF 파일을 생성한 후, 파일을 디스크에 저장하지 않고 바로 이메일에 첨부하고 싶을 때 이 방법을 사용할 수 있습니다. `fromData` 메서드는 첨부할 원시 데이터 바이트를 반환하는 클로저와, 첨부 파일로 사용할 파일명을 인수로 받습니다.

```php
/**
 * 메시지에 첨부될 파일 목록을 반환합니다.
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

이메일에 인라인 이미지를 삽입하는 작업은 보통 번거로운 편입니다. 그러나 라라벨에서는 이미지를 손쉽게 첨부할 수 있도록 편리한 방법을 제공합니다. 인라인 이미지를 삽입하려면, 이메일 템플릿 내의 `$message` 변수에서 `embed` 메서드를 사용하면 됩니다. 라라벨에서는 모든 이메일 템플릿에서 `$message` 변수를 자동으로 사용할 수 있도록 제공하므로, 이 변수를 직접 전달할 필요가 없습니다.

```blade
<body>
    Here is an image:

    <img src="{{ $message->embed($pathToImage) }}">
</body>
```

> [!WARNING]
> `$message` 변수는 일반 텍스트 메일 템플릿에서는 사용할 수 없습니다. 일반 텍스트 메일은 인라인 첨부파일을 지원하지 않기 때문입니다.

<a name="embedding-raw-data-attachments"></a>
#### 원시 데이터 첨부파일 인라인 삽입

이미 이메일 템플릿에 삽입할 이미지의 원시 데이터 문자열이 있다면, `$message` 변수의 `embedData` 메서드를 사용할 수 있습니다. 이 메서드를 사용할 때는, 삽입될 이미지에 사용할 파일명을 추가로 전달해야 합니다.

```blade
<body>
    Here is an image from raw data:

    <img src="{{ $message->embedData($data, 'example-image.jpg') }}">
</body>
```

<a name="attachable-objects"></a>
### Attachable 객체

단순 문자열 경로를 사용하여 파일을 메시지에 첨부하는 것만으로도 대부분의 경우 충분합니다. 그러나 실제로는 애플리케이션 내부에서 첨부할 대상이 별도의 클래스로 표현되는 경우가 많습니다. 예를 들어, 메시지에 사진을 첨부해야 하는 상황이라면, 애플리케이션 내에 해당 사진을 나타내는 `Photo` 모델이 있을 수 있습니다. 이런 경우라면, `attach` 메서드에 `Photo` 모델 인스턴스를 바로 전달할 수 있다면 편리할 것입니다. Attachable 객체는 바로 이런 상황을 지원합니다.

이를 사용하려면, 첨부 가능한 객체에 `Illuminate\Contracts\Mail\Attachable` 인터페이스를 구현하면 됩니다. 이 인터페이스는 클래스에 `toMailAttachment` 메서드를 정의해야 함을 명시합니다. 이 메서드는 `Illuminate\Mail\Attachment` 인스턴스를 반환해야 합니다.

```php
<?php

namespace App\Models;

use Illuminate\Contracts\Mail\Attachable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Mail\Attachment;

class Photo extends Model implements Attachable
{
    /**
     * 모델의 attachable 표현을 반환합니다.
     */
    public function toMailAttachment(): Attachment
    {
        return Attachment::fromPath('/path/to/file');
    }
}
```

Attachable 객체를 정의했다면, 이메일 메시지를 생성할 때 `attachments` 메서드에서 해당 객체의 인스턴스를 반환할 수 있습니다.

```php
/**
 * 메시지에 첨부될 파일 목록을 반환합니다.
 *
 * @return array<int, \Illuminate\Mail\Mailables\Attachment>
 */
public function attachments(): array
{
    return [$this->photo];
}
```

물론, 첨부 파일 데이터가 Amazon S3와 같은 외부 파일 스토리지 서비스에 저장되어 있을 수도 있습니다. 라라벨은 애플리케이션의 [파일시스템 디스크](/docs/12.x/filesystem)에 저장된 파일로부터 첨부파일 인스턴스를 손쉽게 생성할 수 있도록 지원합니다.

```php
// 기본 디스크에 있는 파일을 첨부파일로 생성...
return Attachment::fromStorage($this->path);

// 특정 디스크에서 파일을 첨부파일로 생성...
return Attachment::fromStorageDisk('backblaze', $this->path);
```

또한 메모리에 보관 중인 데이터로도 첨부파일 인스턴스를 만들 수 있습니다. 이를 위해서는 `fromData` 메서드에 클로저를 전달하세요. 클로저는 첨부할 원시 데이터를 반환해야 합니다.

```php
return Attachment::fromData(fn () => $this->content, 'Photo Name');
```

라라벨에서는 첨부파일을 커스터마이징할 수 있는 추가적인 메서드도 제공합니다. 예를 들어, 파일명과 MIME 타입을 변경하려면 `as`와 `withMime` 메서드를 사용할 수 있습니다.

```php
return Attachment::fromPath('/path/to/file')
    ->as('Photo Name')
    ->withMime('image/jpeg');
```

<a name="headers"></a>
### 헤더

때로는 발송 메시지에 추가 헤더를 설정해야 할 수 있습니다. 예를 들어, 커스텀 `Message-Id`나 임의의 텍스트 헤더를 추가하는 경우가 그렇습니다.

이럴 때는, mailable 클래스에 `headers` 메서드를 정의하세요. `headers` 메서드는 `Illuminate\Mail\Mailables\Headers` 인스턴스를 반환해야 합니다. 이 클래스는 `messageId`, `references`, `text` 파라미터를 받습니다. 필요한 헤더만 골라서 전달하면 됩니다.

```php
use Illuminate\Mail\Mailables\Headers;

/**
 * 메시지 헤더를 반환합니다.
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

Mailgun이나 Postmark와 같은 일부 외부 이메일 서비스는 메시지를 식별하고 그룹화 및 추적할 수 있도록 "태그(tags)" 및 "메타데이터(metadata)" 기능을 지원합니다. 이메일 메시지에 태그와 메타데이터를 추가하려면, `Envelope` 정의에서 해당 옵션을 지정하면 됩니다.

```php
use Illuminate\Mail\Mailables\Envelope;

/**
 * 메시지의 envelope을 반환합니다.
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

Mailgun 드라이버를 사용한다면 [Mailgun 태그](https://documentation.mailgun.com/docs/mailgun/user-manual/tracking-messages/#tagging), [Mailgun 메타데이터](https://documentation.mailgun.com/docs/mailgun/user-manual/tracking-messages/#attaching-data-to-messages) 관련 공식 문서도 참고하시기 바랍니다. Postmark를 사용할 경우, [Postmark 태그](https://postmarkapp.com/blog/tags-support-for-smtp), [Postmark 메타데이터](https://postmarkapp.com/support/article/1125-custom-metadata-faq) 관련 문서를 참고하세요.

Amazon SES를 통해 이메일을 보낸다면 `metadata` 메서드를 사용하여 메시지에 [SES "tags"](https://docs.aws.amazon.com/ses/latest/APIReference/API_MessageTag.html)를 추가해야 합니다.

<a name="customizing-the-symfony-message"></a>
### Symfony 메시지 커스터마이징

라라벨의 메일 시스템은 Symfony Mailer를 기반으로 동작합니다. 라라벨에서는 메시지 발송 전 Symfony Message 인스턴스에 접근해 커스텀 콜백을 실행할 수 있도록 지원합니다. 이를 통해, 메시지를 심층적으로 커스터마이즈할 수 있습니다. 이를 위해, `Envelope` 정의 내에 `using` 파라미터를 지정하면 됩니다.

```php
use Illuminate\Mail\Mailables\Envelope;
use Symfony\Component\Mime\Email;

/**
 * 메시지의 envelope을 반환합니다.
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
## 마크다운(Markdown) Mailable

마크다운 Mailable 메시지를 사용하면 [메일 알림](/docs/12.x/notifications#mail-notifications)의 템플릿과 컴포넌트들을 그대로 활용할 수 있습니다. 메시지는 마크다운 문법으로 작성되므로, 라라벨이 깔끔하고 반응형인 HTML 템플릿을 자동으로 렌더링해주고, 동시에 plain-text 버전도 자동으로 생성해 줍니다.

<a name="generating-markdown-mailables"></a>
### 마크다운 Mailable 생성하기

마크다운 템플릿이 포함된 mailable을 생성하려면, `make:mail` Artisan 명령어에 `--markdown` 옵션을 사용하세요.

```shell
php artisan make:mail OrderShipped --markdown=mail.orders.shipped
```

그리고, 해당 mailable의 `content` 메서드에서 mailable의 Content 정의를 구성할 때 `view` 파라미터 대신 `markdown` 파라미터를 사용합니다.

```php
use Illuminate\Mail\Mailables\Content;

/**
 * 메시지 내용(content) 정의를 반환합니다.
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

마크다운 Mailable은 Blade 컴포넌트와 마크다운 문법을 함께 사용함으로써, 다양한 라라벨의 미리 만들어진 UI 컴포넌트를 활용하여 손쉽게 메일 메시지를 만들 수 있습니다.

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
> 마크다운 이메일 작성 시, 들여쓰기를 과도하게 사용하지 마세요. 마크다운 문법상, 들여쓰기가 있으면 해당 줄이 코드 블록으로 렌더링됩니다.

<a name="button-component"></a>
#### 버튼 컴포넌트

버튼 컴포넌트는 중앙에 정렬된 버튼 링크를 렌더링합니다. 이 컴포넌트는 `url`과 선택적인 `color` 인수를 받습니다. 사용할 수 있는 색상 값은 `primary`, `success`, `error` 입니다. 하나의 메시지에 원하는 만큼 버튼 컴포넌트를 추가할 수 있습니다.

```blade
<x-mail::button :url="$url" color="success">
View Order
</x-mail::button>
```

<a name="panel-component"></a>
#### 패널 컴포넌트

패널 컴포넌트는 주어진 텍스트 블록을 메시지 내에서 주변과 약간 다른 배경색의 패널로 렌더링합니다. 이를 통해 특정 텍스트 영역을 강조할 수 있습니다.

```blade
<x-mail::panel>
This is the panel content.
</x-mail::panel>
```

<a name="table-component"></a>
#### 테이블 컴포넌트

테이블 컴포넌트를 사용하면 마크다운 형식의 테이블을 HTML 테이블로 변환할 수 있습니다. 이 컴포넌트는 마크다운 형태의 테이블을 콘텐츠로 받습니다. 컬럼 정렬 역시 기본 마크다운 문법을 그대로 지원합니다.

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

마크다운 메일 컴포넌트 전체를 내 애플리케이션으로 내보내(export)해 원하는 대로 커스터마이즈할 수도 있습니다. 컴포넌트를 내보내려면, `laravel-mail` 태그로 `vendor:publish` Artisan 명령어를 실행하세요.

```shell
php artisan vendor:publish --tag=laravel-mail
```

이 명령어를 실행하면, 마크다운 메일 컴포넌트가 `resources/views/vendor/mail` 디렉터리에 복사됩니다. `mail` 디렉터리에는 각각의 컴포넌트에 해당하는 `html`과 `text` 폴더가 존재합니다. 이제 이 파일들을 자유롭게 수정해 나만의 이메일 컴포넌트를 만들 수 있습니다.

<a name="customizing-the-css"></a>
#### CSS 커스터마이징

컴포넌트를 내보낸 이후, `resources/views/vendor/mail/html/themes` 디렉터리 내의 `default.css` 파일을 편집해 스타일을 변경할 수 있습니다. 여기에서 CSS를 변경하면, 내 스타일이 자동으로 HTML 이메일에 인라인(inline) 스타일로 적용됩니다.

라라벨의 마크다운 컴포넌트에 완전히 새로운 테마를 만들고 싶다면, `html/themes` 디렉터리에 CSS 파일을 추가하면 됩니다. 해당 파일에 이름을 정하고 저장한 후, 애플리케이션의 `config/mail.php` 설정 파일의 `theme` 옵션을 새 테마 이름으로 변경하면 됩니다.

특정 mailable에만 따로 테마를 지정하고 싶다면, mailable 클래스에서 `$theme` 프로퍼티의 값을 원하는 테마 이름으로 설정하세요.

<a name="sending-mail"></a>
## 메일 보내기

이메일 메시지를 발송하려면 [Mail 파사드](/docs/12.x/facades)의 `to` 메서드를 사용하세요. `to` 메서드는 이메일 주소, 사용자 인스턴스, 또는 사용자 컬렉션을 인수로 받을 수 있습니다. 객체나 객체 컬렉션을 전달하면, 해당 객체의 `email`과 `name` 속성을 자동으로 읽어 수신자로 사용하므로, 해당 속성들이 객체에 정의되어야 합니다. 수신자를 지정한 뒤에는 mailable 클래스 인스턴스를 `send` 메서드에 전달하여 실제 발송이 이뤄집니다.

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
     * 전달받은 주문을 발송 처리합니다.
     */
    public function store(Request $request): RedirectResponse
    {
        $order = Order::findOrFail($request->order_id);

        // 주문 발송 처리 코드...

        Mail::to($request->user())->send(new OrderShipped($order));

        return redirect('/orders');
    }
}
```

이메일 발송 시 반드시 "to"만 설정할 필요는 없습니다. "to", "cc", "bcc"를 메서드 체이닝으로 자유롭게 조합하여 사용할 수 있습니다.

```php
Mail::to($request->user())
    ->cc($moreUsers)
    ->bcc($evenMoreUsers)
    ->send(new OrderShipped($order));
```

<a name="looping-over-recipients"></a>
#### 수신자 반복 처리하기

경우에 따라, 수신자 목록(여러 명의 이메일 주소 또는 객체)에 메일을 반복적으로 보내야 할 수 있습니다. 하지만 `to` 메서드는 반복문을 돌 때마다 이전 수신자도 계속 누적되어 발송 대상이 늘어나게 되므로, 수신자 별로 mailable 인스턴스를 반드시 새로 생성해서 전달해야 합니다.

```php
foreach (['taylor@example.com', 'dries@example.com'] as $recipient) {
    Mail::to($recipient)->send(new OrderShipped($order));
}
```

<a name="sending-mail-via-a-specific-mailer"></a>
#### 특정 메일러로 메일 보내기

라라벨은 기본적으로 애플리케이션의 `mail` 설정 파일에서 `default`로 지정된 메일러를 사용해 이메일을 보냅니다. 하지만, `mailer` 메서드를 사용하면 특정 메일러 설정을 지정하여 메일을 보낼 수 있습니다.

```php
Mail::mailer('postmark')
    ->to($request->user())
    ->send(new OrderShipped($order));
```

<a name="queueing-mail"></a>
### 메일 큐 처리

<a name="queueing-a-mail-message"></a>
#### 메일 메시지 큐에 넣기

이메일 발송 작업은 애플리케이션의 응답 속도에 부정적인 영향을 줄 수 있기 때문에, 많은 개발자들은 이메일을 백그라운드에서 발송할 수 있도록 큐로 처리합니다. 라라벨은 [일관된 큐 API](/docs/12.x/queues)를 제공하므로 손쉽게 메일을 큐처리할 수 있습니다. 메일을 큐에 넣으려면, 수신자를 지정한 뒤 `Mail` 파사드의 `queue` 메서드를 사용하세요.

```php
Mail::to($request->user())
    ->cc($moreUsers)
    ->bcc($evenMoreUsers)
    ->queue(new OrderShipped($order));
```

이 방식은 자동으로 큐에 작업을 추가해서 별도의 백그라운드에서 메시지가 발송되도록 처리합니다. 이 기능을 사용하기 위해서는 먼저 [큐 설정](/docs/12.x/queues)이 되어 있어야 합니다.

<a name="delayed-message-queueing"></a>
#### 지연 메시지 큐 처리

큐에 등록된 메일 발송 작업의 실제 발송 시점을 지연시키고 싶다면, `later` 메서드를 사용할 수 있습니다. `later` 메서드는 첫 번째 인수로 언제 발송할지 지정하는 `DateTime` 인스턴스를 전달받습니다.

```php
Mail::to($request->user())
    ->cc($moreUsers)
    ->bcc($evenMoreUsers)
    ->later(now()->addMinutes(10), new OrderShipped($order));
```

<a name="pushing-to-specific-queues"></a>
#### 특정 큐 지정하기

`make:mail` 명령어로 생성한 모든 mailable 클래스는 자동으로 `Illuminate\Bus\Queueable` 트레이트를 사용합니다. 따라서, mailable 인스턴스에 대해 `onQueue`와 `onConnection` 메서드를 호출하여 메시지 발송에 사용할 큐 연결과 큐명을 지정할 수 있습니다.

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
#### 메일 기본 큐 처리

특정 mailable 클래스가 항상 큐로 동작하도록 하려면 클래스에 `ShouldQueue` 계약을 구현하세요. 이렇게 하면, `send` 메서드를 직접 호출해도 해당 mailable은 자동으로 큐에 등록되어 처리됩니다.

```php
use Illuminate\Contracts\Queue\ShouldQueue;

class OrderShipped extends Mailable implements ShouldQueue
{
    // ...
}
```

<a name="queued-mailables-and-database-transactions"></a>
#### 큐 처리 메일과 데이터베이스 트랜잭션

큐로 처리되는 mailable이 데이터베이스 트랜잭션 내에서 디스패치되는 경우, 큐가 트랜잭션 커밋보다 먼저 동작할 수 있습니다. 이런 경우, 트랜잭션 내에서 모델이나 레코드에 적용된 변경사항이 아직 데이터베이스에 커밋되지 않았을 수 있습니다. 또한, 트랜잭션 안에서 생성된 모델이나 레코드는 아직 데이터베이스에 존재하지 않을 수도 있습니다. 만약 mailable이 이러한 모델에 의존한다면, 큐 작업 실행 시 예기치 않은 오류가 발생할 수 있습니다.

큐 연결 설정의 `after_commit` 옵션이 `false`인 경우에도, 메일 발송 시 `afterCommit` 메서드를 호출하면 해당 mailable이 트랜잭션이 전부 커밋되고 나서 디스패치되도록 할 수 있습니다.

```php
Mail::to($request->user())->send(
    (new OrderShipped($order))->afterCommit()
);
```

또는, mailable 클래스의 생성자에서 `afterCommit` 메서드를 호출해도 동일하게 동작합니다.

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
     * 새 메시지 인스턴스를 생성합니다.
     */
    public function __construct()
    {
        $this->afterCommit();
    }
}
```

> [!NOTE]
> 이 문제를 우회하는 방법에 대한 자세한 내용은 [큐 작업과 데이터베이스 트랜잭션](/docs/12.x/queues#jobs-and-database-transactions) 문서를 참고하시기 바랍니다.

<a name="rendering-mailables"></a>
## Mailable 렌더링하기

메일을 실제로 발송하지 않고, mailable의 HTML 콘텐츠만 따로 추출하고 싶을 때가 있습니다. 이럴 때는, mailable의 `render` 메서드를 호출하면 됩니다. 이 메서드는 해당 mailable의 최종 HTML 내용을 문자열로 평가하여 반환합니다.

```php
use App\Mail\InvoicePaid;
use App\Models\Invoice;

$invoice = Invoice::find(1);

return (new InvoicePaid($invoice))->render();
```

<a name="previewing-mailables-in-the-browser"></a>
### 브라우저에서 mailable 미리보기

mailable의 템플릿을 작업할 때, 일반 블레이드 템플릿처럼 브라우저에서 바로 결과를 미리 확인할 수 있으면 매우 편리합니다. 라라벨에서는 경로(route) 클로저나 컨트롤러에서 mailable 인스턴스를 반환하면, 해당 내용이 브라우저에서 바로 렌더링되어 미리보기가 가능합니다. 실제 이메일 수신자에게 발송하지 않고도 디자인을 바로 확인할 수 있습니다.

```php
Route::get('/mailable', function () {
    $invoice = App\Models\Invoice::find(1);

    return new App\Mail\InvoicePaid($invoice);
});
```

<a name="localizing-mailables"></a>
## Mailable 다국어 지원

라라벨에서는 요청의 현재 언어(locale)와 다른 언어로 mailable을 발송할 수 있으며, 메일 발송이 큐에 등록될 경우에도 해당 언어 설정을 기억합니다.

이를 위해 `Mail` 파사드의 `locale` 메서드를 사용하여 원하는 언어를 지정할 수 있습니다. 설정한 언어는 mailable의 템플릿이 렌더링 되는 동안 적용되며, 작업이 끝나면 원래의 언어로 복원됩니다.

```php
Mail::to($request->user())->locale('es')->send(
    new OrderShipped($order)
);
```

<a name="user-preferred-locales"></a>
### 사용자 지정 선호 언어

애플리케이션에서 각 사용자의 선호 언어 정보를 저장해놓고 있다면, 모델에서 `HasLocalePreference` 계약을 구현함으로써 mailable 발송 시 해당 정보를 자동으로 적용할 수 있습니다.

```php
use Illuminate\Contracts\Translation\HasLocalePreference;

class User extends Model implements HasLocalePreference
{
    /**
     * 사용자의 선호 언어를 반환합니다.
     */
    public function preferredLocale(): string
    {
        return $this->locale;
    }
}
```

이 인터페이스를 구현하면, 라라벨은 해당 모델에 대해 mailable과 알림을 보낼 때 자동으로 preferred locale을 적용합니다. 즉, 이 인터페이스를 사용한다면 `locale` 메서드를 명시적으로 호출할 필요가 없습니다.

```php
Mail::to($request->user())->send(new OrderShipped($order));
```

<a name="testing-mailables"></a>
## 테스트

<a name="testing-mailable-content"></a>
### Mailable 내용 테스트하기

라라벨은 mailable의 구조와 내용을 검증할 수 있는 다양한 메서드를 제공합니다. 그 중에서도, 예상하는 내용이나 첨부파일이 실제로 포함되어 있는지 테스트할 수 있는 여러 편리한 메서드를 제공합니다. 주요 메서드는 다음과 같습니다: `assertSeeInHtml`, `assertDontSeeInHtml`, `assertSeeInOrderInHtml`, `assertSeeInText`, `assertDontSeeInText`, `assertSeeInOrderInText`, `assertHasAttachment`, `assertHasAttachedData`, `assertHasAttachmentFromStorage`, `assertHasAttachmentFromStorageDisk`.

"HTML" 관련 단정(assert) 메서드는 mailable의 HTML 버전에 특정 문자열이 포함되어 있는지 확인하고, "text" 관련 단정 메서드는 plain-text 버전에 특정 문자열이 포함되어 있는지 확인합니다.

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

### 메일러블 발송 테스트

특정 메일러블이 특정 사용자에게 "발송"되었는지를 검증하는 테스트 코드와는 별도로 메일러블의 실제 내용을 따로 테스트하는 것을 권장합니다. 일반적으로, 여러분이 작성하는 테스트 코드에서는 메일러블의 상세 내용 자체가 중요한 경우가 거의 없으므로, 라라벨이 해당 메일러블을 발송하도록 요청받았는지만 검증하면 충분합니다.

메일이 실제로 발송되는 것을 방지하려면 `Mail` 파사드의 `fake` 메서드를 사용할 수 있습니다. 이 메서드를 호출하면 메일이 발송되지 않고, 이후에 해당 메일러블이 어떤 사용자에게 발송되도록 요청되었는지, 또는 해당 메일러블이 받은 데이터 등을 검증(어설션)할 수 있습니다.

```php tab=Pest
<?php

use App\Mail\OrderShipped;
use Illuminate\Support\Facades\Mail;

test('orders can be shipped', function () {
    Mail::fake();

    // 주문 발송 동작 실행...

    // 어떤 메일러블도 전송되지 않았는지 확인...
    Mail::assertNothingSent();

    // 특정 메일러블이 전송되었는지 확인...
    Mail::assertSent(OrderShipped::class);

    // 메일러블이 두 번 전송되었는지 확인...
    Mail::assertSent(OrderShipped::class, 2);

    // 특정 이메일 주소로 메일러블이 전송되었는지 확인...
    Mail::assertSent(OrderShipped::class, 'example@laravel.com');

    // 여러 이메일 주소로 메일러블이 전송되었는지 확인...
    Mail::assertSent(OrderShipped::class, ['example@laravel.com', '...']);

    // 특정 메일러블이 전송되지 않았는지 확인...
    Mail::assertNotSent(AnotherMailable::class);

    // 총 3개의 메일러블이 전송되었는지 확인...
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

        // 주문 발송 동작 실행...

        // 어떤 메일러블도 전송되지 않았는지 확인...
        Mail::assertNothingSent();

        // 특정 메일러블이 전송되었는지 확인...
        Mail::assertSent(OrderShipped::class);

        // 메일러블이 두 번 전송되었는지 확인...
        Mail::assertSent(OrderShipped::class, 2);

        // 특정 이메일 주소로 메일러블이 전송되었는지 확인...
        Mail::assertSent(OrderShipped::class, 'example@laravel.com');

        // 여러 이메일 주소로 메일러블이 전송되었는지 확인...
        Mail::assertSent(OrderShipped::class, ['example@laravel.com', '...']);

        // 특정 메일러블이 전송되지 않았는지 확인...
        Mail::assertNotSent(AnotherMailable::class);

        // 총 3개의 메일러블이 전송되었는지 확인...
        Mail::assertSentCount(3);
    }
}
```

만약 메일러블을 백그라운드에서 큐를 통해 발송하도록 한 경우에는 `assertSent` 대신 `assertQueued` 메서드를 사용해야 합니다.

```php
Mail::assertQueued(OrderShipped::class);
Mail::assertNotQueued(OrderShipped::class);
Mail::assertNothingQueued();
Mail::assertQueuedCount(3);
```

`assertSent`, `assertNotSent`, `assertQueued`, `assertNotQueued` 메서드에 클로저를 전달하여, 특정 "조건"을 만족하는 메일러블이 발송(또는 큐잉)되었는지 검증할 수도 있습니다. 해당 조건에 부합하는 메일러블이 하나라도 있다면 어설션은 통과합니다.

```php
Mail::assertSent(function (OrderShipped $mail) use ($order) {
    return $mail->order->id === $order->id;
});
```

`Mail` 파사드의 어설션 메서드에 전달된 클로저에서 받을 수 있는 메일러블 인스턴스를 활용하면, 발송된 메일러블에 대해 보다 세부적으로 검사할 수도 있습니다.

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

메일러블 인스턴스는 첨부 파일에 대한 검사에도 유용한 여러 메서드를 제공합니다.

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

메일이 전송되지 않았는지 확인할 때 `assertNotSent`와 `assertNotQueued` 두 가지 방법이 있습니다. 두 방법 중 어떤 것이건 사용자가 원하는 기준에 맞게 쓸 수 있으며, 경우에 따라 메일이 **전혀 보내지지 않았고** **큐에도 등록되지 않았음**을 한꺼번에 검사하고 싶은 일이 있습니다. 이를 위해 `assertNothingOutgoing` 및 `assertNotOutgoing` 메서드를 사용할 수 있습니다.

```php
Mail::assertNothingOutgoing();

Mail::assertNotOutgoing(function (OrderShipped $mail) use ($order) {
    return $mail->order->id === $order->id;
});
```

<a name="mail-and-local-development"></a>
## 메일과 로컬 개발 환경

이메일을 발송하는 애플리케이션을 개발할 때, 실제로 실존하는 이메일 주소로 메일을 보내고 싶지 않을 것입니다. 라라벨은 로컬 개발 중 실제로 메일 발송이 이루어지지 않도록 여러 방법을 제공합니다.

<a name="log-driver"></a>
#### Log 드라이버

메일을 실제로 전송하는 대신, `log` 메일 드라이버를 사용하면 모든 메일 메시지가 로그 파일에 기록되어 나중에 확인할 수 있습니다. 이 드라이버는 주로 로컬 개발 환경에서만 사용됩니다. 환경별로 애플리케이션을 설정하는 방법은 [설정 문서](/docs/12.x/configuration#environment-configuration)를 참고하세요.

<a name="mailtrap"></a>
#### HELO / Mailtrap / Mailpit

또는 [HELO](https://usehelo.com)나 [Mailtrap](https://mailtrap.io)과 같은 서비스를 이용하거나, `smtp` 드라이버를 사용해 이메일을 "더미" 우편함(테스트용 수신함)으로 보낼 수 있습니다. 이 방식의 장점은 Mailtrap 등의 메시지 뷰어에서 실제 사용자와 동일한 이메일 클라이언트로 최종 결과를 확인할 수 있다는 것입니다.

[Laravel Sail](/docs/12.x/sail)을 사용한다면 [Mailpit](https://github.com/axllent/mailpit)으로 메시지를 미리 볼 수 있습니다. Sail이 실행 중일 때 `http://localhost:8025`에서 Mailpit 인터페이스에 접속할 수 있습니다.

<a name="using-a-global-to-address"></a>
#### 전체 글로벌 `to` 주소 사용

마지막으로, `Mail` 파사드의 `alwaysTo` 메서드를 통해 전체적으로 "to" 주소를 지정할 수도 있습니다. 이 메서드는 일반적으로 애플리케이션 서비스 제공자 중 하나의 `boot` 메서드에서 호출해야 합니다.

```php
use Illuminate\Support\Facades\Mail;

/**
 * 애플리케이션 서비스 초기화
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

라라벨은 메일 메시지를 발송하는 동안 두 가지 이벤트를 발생시킵니다. `MessageSending` 이벤트는 메시지 발송 전에 발생하며, `MessageSent` 이벤트는 메시지 발송 후에 발생합니다. 이 이벤트들은 메일이 *실제로 발송될 때* 발생한다는 점을 기억하세요(큐잉 시점이 아님). 여러분의 애플리케이션에서 [이벤트 리스너](/docs/12.x/events)를 만들어 이러한 이벤트를 처리할 수 있습니다.

```php
use Illuminate\Mail\Events\MessageSending;
// use Illuminate\Mail\Events\MessageSent;

class LogMessage
{
    /**
     * 이벤트 처리
     */
    public function handle(MessageSending $event): void
    {
        // ...
    }
}
```

<a name="custom-transports"></a>
## 커스텀 트랜스포트

라라벨에는 다양한 메일 트랜스포트(메일 발송 방식)가 내장되어 있지만, 때로는 라라벨이 기본적으로 지원하지 않는 다른 서비스와 연동해야 할 수도 있습니다. 이럴 때에는 직접 새로운 트랜스포트를 작성할 수 있습니다. 새 트랜스포트를 만들려면, `Symfony\Component\Mailer\Transport\AbstractTransport` 클래스를 상속하는 클래스를 정의한 뒤, 그 안에 `doSend`와 `__toString()` 메서드를 구현합니다.

```php
use MailchimpTransactional\ApiClient;
use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mailer\Transport\AbstractTransport;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\MessageConverter;

class MailchimpTransport extends AbstractTransport
{
    /**
     * 새로운 Mailchimp 트랜스포트 인스턴스 생성
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
     * 트랜스포트의 문자열 표현 반환
     */
    public function __toString(): string
    {
        return 'mailchimp';
    }
}
```

커스텀 트랜스포트를 정의했다면, 애플리케이션의 `AppServiceProvider` 등 서비스 제공자의 `boot` 메서드에서 `Mail` 파사드의 `extend` 메서드를 사용하여 등록할 수 있습니다. `extend` 메서드에 전달하는 클로저에는 `$config` 인자가 전달되는데, 이 인자에는 `config/mail.php` 파일에 정의된 해당 메일러에 대한 설정 배열이 담겨 있습니다.

```php
use App\Mail\MailchimpTransport;
use Illuminate\Support\Facades\Mail;

/**
 * 애플리케이션 서비스 초기화
 */
public function boot(): void
{
    Mail::extend('mailchimp', function (array $config = []) {
        return new MailchimpTransport(/* ... */);
    });
}
```

트랜스포트 등록이 끝나면, 애플리케이션의 `config/mail.php` 설정 파일에서 새 트랜스포트를 사용하는 메일러를 다음과 같이 정의할 수 있습니다.

```php
'mailchimp' => [
    'transport' => 'mailchimp',
    // ...
],
```

<a name="additional-symfony-transports"></a>
### 추가적인 Symfony 트랜스포트

라라벨은 기본적으로 Mailgun, Postmark와 같이 Symfony에서 공식적으로 관리하는 일부 메일 트랜스포트를 지원합니다. 그러나 더 많은 Symfony 트랜스포트에 대한 지원이 필요하다면 Composer로 해당 패키지를 설치한 후, 트랜스포트를 등록할 수 있습니다. 예를 들어, "Brevo" (이전 명칭: "Sendinblue") Symfony 메일러를 설치하고 등록하는 방법은 다음과 같습니다.

```shell
composer require symfony/brevo-mailer symfony/http-client
```

Brevo 메일러가 설치되었다면, 애플리케이션의 `services` 설정 파일에 Brevo API 인증 정보를 추가합니다.

```php
'brevo' => [
    'key' => 'your-api-key',
],
```

그 다음, 서비스 제공자 중 하나의 `boot` 메서드에서 `Mail` 파사드의 `extend` 메서드를 사용해 트랜스포트를 등록합니다.

```php
use Illuminate\Support\Facades\Mail;
use Symfony\Component\Mailer\Bridge\Brevo\Transport\BrevoTransportFactory;
use Symfony\Component\Mailer\Transport\Dsn;

/**
 * 애플리케이션 서비스 초기화
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

트랜스포트가 등록되면, 애플리케이션의 `config/mail.php` 설정 파일에서 다음과 같이 새로운 트랜스포트를 사용하는 메일러를 정의하면 됩니다.

```php
'brevo' => [
    'transport' => 'brevo',
    // ...
],
```