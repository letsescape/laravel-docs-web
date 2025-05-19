# 메일 (Mail)

- [소개](#introduction)
    - [설정](#configuration)
    - [드라이버 필수 조건](#driver-prerequisites)
    - [장애 조치(페일오버) 설정](#failover-configuration)
    - [라운드 로빈 설정](#round-robin-configuration)
- [메일러블 생성](#generating-mailables)
- [메일러블 작성](#writing-mailables)
    - [발신자 설정](#configuring-the-sender)
    - [뷰(View) 설정](#configuring-the-view)
    - [뷰 데이터](#view-data)
    - [첨부 파일](#attachments)
    - [본문 내 첨부 파일](#inline-attachments)
    - [Attachable 객체](#attachable-objects)
    - [헤더 설정](#headers)
    - [태그 및 메타데이터](#tags-and-metadata)
    - [Symfony 메시지 커스터마이징](#customizing-the-symfony-message)
- [마크다운 메일러블](#markdown-mailables)
    - [마크다운 메일러블 생성](#generating-markdown-mailables)
    - [마크다운 메시지 작성](#writing-markdown-messages)
    - [컴포넌트 커스터마이징](#customizing-the-components)
- [메일 발송](#sending-mail)
    - [메일 큐 처리](#queueing-mail)
- [메일러블 렌더링](#rendering-mailables)
    - [브라우저에서 메일러블 미리보기](#previewing-mailables-in-the-browser)
- [메일러블 지역화](#localizing-mailables)
- [테스트](#testing-mailables)
    - [메일러블 콘텐츠 테스트](#testing-mailable-content)
    - [메일러블 발송 테스트](#testing-mailable-sending)
- [메일과 로컬 개발 환경](#mail-and-local-development)
- [이벤트](#events)
- [커스텀 트랜스포트](#custom-transports)
    - [추가 Symfony 트랜스포트](#additional-symfony-transports)

<a name="introduction"></a>
## 소개

이메일을 보내는 것은 결코 복잡할 필요가 없습니다. 라라벨은 널리 사용되는 [Symfony Mailer](https://symfony.com/doc/7.0/mailer.html) 컴포넌트를 기반으로 한 깔끔하고 단순한 이메일 API를 제공합니다. 라라벨과 Symfony Mailer는 SMTP, Mailgun, Postmark, Resend, Amazon SES, 그리고 `sendmail`을 통해 이메일을 보낼 수 있는 다양한 드라이버를 지원하므로, 로컬이든 클라우드 기반이든 원하는 서비스를 사용해 빠르게 메일 발송을 시작할 수 있습니다.

<a name="configuration"></a>
### 설정

라라벨의 이메일 서비스는 애플리케이션의 `config/mail.php` 설정 파일을 통해 구성할 수 있습니다. 이 파일에 정의된 각 메일러(mailer)는 고유한 설정값과 각기 다른 "트랜스포트"를 가질 수 있기 때문에, 애플리케이션에서 다양한 이메일 서비스를 선택적으로 사용할 수 있습니다. 예를 들어, 거래 관련 메일은 Postmark를, 대량 메일 발송은 Amazon SES를 사용할 수 있습니다.

`mail` 설정 파일 내에는 `mailers`라는 설정 배열이 있습니다. 이 배열에는 라라벨이 지원하는 주요 메일 드라이버/트랜스포트의 샘플 설정이 들어 있습니다. 또한 `default` 설정값은 애플리케이션에서 이메일을 보낼 때 기본적으로 사용될 메일러를 지정합니다.

<a name="driver-prerequisites"></a>
### 드라이버 / 트랜스포트 필수 조건

Mailgun, Postmark, Resend, MailerSend와 같은 API 기반 드라이버는 SMTP 서버를 이용하는 방식보다 대개 더 간단하고 빠릅니다. 가능하다면, 이러한 드라이버 중 하나를 사용하는 것을 권장합니다.

<a name="mailgun-driver"></a>
#### Mailgun 드라이버

Mailgun 드라이버를 사용하려면 Composer를 통해 Symfony의 Mailgun Mailer 트랜스포트를 설치해야 합니다.

```shell
composer require symfony/mailgun-mailer symfony/http-client
```

이제 애플리케이션의 `config/mail.php` 설정 파일에서 다음 두 가지를 변경해야 합니다. 먼저, 기본 메일러를 `mailgun`으로 설정합니다.

```
'default' => env('MAIL_MAILER', 'mailgun'),
```

그리고 두 번째로, `mailers` 배열에 아래와 같이 설정을 추가합니다.

```
'mailgun' => [
    'transport' => 'mailgun',
    // 'client' => [
    //     'timeout' => 5,
    // ],
],
```

기본 메일러 설정 후에는, `config/services.php` 설정 파일에 다음과 같은 옵션을 추가해야 합니다.

```
'mailgun' => [
    'domain' => env('MAILGUN_DOMAIN'),
    'secret' => env('MAILGUN_SECRET'),
    'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
    'scheme' => 'https',
],
```

만약 미국이 아닌 다른 [Mailgun 지역](https://documentation.mailgun.com/en/latest/api-intro.html#mailgun-regions)을 사용하는 경우, `services` 설정 파일에서 해당 지역의 엔드포인트를 지정할 수 있습니다.

```
'mailgun' => [
    'domain' => env('MAILGUN_DOMAIN'),
    'secret' => env('MAILGUN_SECRET'),
    'endpoint' => env('MAILGUN_ENDPOINT', 'api.eu.mailgun.net'),
    'scheme' => 'https',
],
```

<a name="postmark-driver"></a>
#### Postmark 드라이버

[Postmark](https://postmarkapp.com/) 드라이버를 사용하려면 Composer를 통해 Symfony의 Postmark Mailer 트랜스포트를 설치해야 합니다.

```shell
composer require symfony/postmark-mailer symfony/http-client
```

그 다음, 애플리케이션의 `config/mail.php` 설정 파일에서 `default` 옵션을 `postmark`로 지정합니다. 기본 메일러 설정 후, `config/services.php` 설정 파일에 다음과 같은 옵션이 포함되어 있는지 확인합니다.

```
'postmark' => [
    'token' => env('POSTMARK_TOKEN'),
],
```

특정 메일러에서 사용할 Postmark 메시지 스트림을 지정하고 싶다면, 메일러의 설정 배열에 `message_stream_id` 옵션을 추가할 수 있습니다. 해당 설정 배열은 애플리케이션의 `config/mail.php`에 위치합니다.

```
'postmark' => [
    'transport' => 'postmark',
    'message_stream_id' => env('POSTMARK_MESSAGE_STREAM_ID'),
    // 'client' => [
    //     'timeout' => 5,
    // ],
],
```

이렇게 하면 여러 Postmark 메일러를 서로 다른 메시지 스트림으로 설정할 수도 있습니다.

<a name="resend-driver"></a>
#### Resend 드라이버

[Resend](https://resend.com/) 드라이버를 사용하려면 Composer를 통해 Resend의 PHP SDK를 설치해야 합니다.

```shell
composer require resend/resend-php
```

그 다음, 애플리케이션의 `config/mail.php` 설정 파일에서 `default` 옵션을 `resend`로 지정합니다. 기본 메일러 설정 후 `config/services.php` 설정 파일에 다음 옵션이 포함되어야 합니다.

```
'resend' => [
    'key' => env('RESEND_KEY'),
],
```

<a name="ses-driver"></a>
#### SES 드라이버

Amazon SES 드라이버를 사용하려면 먼저 Amazon AWS SDK for PHP를 설치해야 합니다. Composer 패키지 매니저를 사용하여 설치할 수 있습니다.

```shell
composer require aws/aws-sdk-php
```

그리고 나서, `config/mail.php` 설정 파일의 `default` 옵션을 `ses`로 지정하고, `config/services.php` 설정 파일에 아래와 같은 옵션이 포함되어 있는지 확인합니다.

```
'ses' => [
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
],
```

AWS [임시 자격 증명](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_use-resources.html)을 세션 토큰으로 활용하려면 SES 설정에 `token` 키를 추가하면 됩니다.

```
'ses' => [
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    'token' => env('AWS_SESSION_TOKEN'),
],
```

SES의 [구독 관리 기능](https://docs.aws.amazon.com/ses/latest/dg/sending-email-subscription-management.html)을 활용하려면, 메일 메시지의 [`headers`](#headers) 메서드에서 반환되는 배열에 `X-Ses-List-Management-Options` 헤더를 추가할 수 있습니다.

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

Laravel이 이메일 발송 시 AWS SDK의 `SendEmail` 메서드에 전달할 [추가 옵션](https://docs.aws.amazon.com/aws-sdk-php/v3/api/api-sesv2-2019-09-27.html#sendemail)을 지정하고 싶다면, `ses` 설정 내에 `options` 배열을 정의할 수 있습니다.

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

[MailerSend](https://www.mailersend.com/)는 트랜잭션 이메일 및 SMS 서비스로, 라라벨용 자체 API 기반 메일 드라이버를 제공합니다. 해당 드라이버가 포함된 패키지는 Composer 패키지 매니저를 통해 설치할 수 있습니다.

```shell
composer require mailersend/laravel-driver
```

패키지 설치 후, 애플리케이션의 `.env` 파일에 `MAILERSEND_API_KEY` 환경 변수를 추가합니다. 그리고 `MAIL_MAILER` 환경 변수도 `mailersend`로 지정해야 합니다.

```ini
MAIL_MAILER=mailersend
MAIL_FROM_ADDRESS=app@yourdomain.com
MAIL_FROM_NAME="App Name"

MAILERSEND_API_KEY=your-api-key
```

마지막으로, 애플리케이션의 `config/mail.php` 설정 파일의 `mailers` 배열에 MailerSend를 추가합니다.

```php
'mailersend' => [
    'transport' => 'mailersend',
],
```

MailerSend의 호스팅 템플릿 사용 등 더 자세한 내용은 [MailerSend 드라이버 공식 문서](https://github.com/mailersend/mailersend-laravel-driver#usage)를 참고하세요.

<a name="failover-configuration"></a>
### 장애 조치(페일오버) 설정

애플리케이션에서 메일 발송에 사용하는 외부 서비스가 일시적으로 중단될 수 있습니다. 이런 경우를 대비해, 기본 발송 드라이버가 다운되었을 때 사용할 예비 메일 발송 설정을 하나 이상 정의해 두면 유용합니다.

이를 위해서는 `mail` 설정 파일에서 `failover` 트랜스포트를 사용하는 메일러를 정의해야 합니다. 이 메일러의 설정 배열에는 `mailers`라는 배열이 포함되어야 하며, 이 배열에는 메일 발송을 시도할 메일러의 순서를 지정합니다.

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

장애 조치(페일오버) 메일러를 정의한 후, 애플리케이션에서 기본적으로 사용할 메일러로 해당 메일러를 지정해야 합니다. 즉, `mail` 설정 파일에서 `default` 키의 값을 방금 정의한 메일러 이름으로 설정합니다.

```
'default' => env('MAIL_MAILER', 'failover'),
```

<a name="round-robin-configuration"></a>
### 라운드 로빈 설정

`roundrobin` 트랜스포트는 여러 메일러에 메일 발송 부담을 분산(로드 밸런싱)할 수 있게 해줍니다. 시작하려면, 애플리케이션의 `mail` 설정 파일에 `roundrobin` 트랜스포트를 사용하는 메일러를 정의하세요. 이 메일러의 설정 배열에는 `mailers` 배열이 포함되어야 하며, 이 배열에는 발송에 사용할 메일러명을 지정합니다.

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

라운드로빈 메일러 정의 후, 애플리케이션에서 기본적으로 사용할 메일러로 해당 메일러를 선택합니다.

```
'default' => env('MAIL_MAILER', 'roundrobin'),
```

라운드로빈 트랜스포트는 등록한 메일러 중 무작위로 하나를 선택한 뒤, 이후 발송되는 이메일마다 다음 메일러로 순차적으로 변경하여 사용합니다. *[장애 조치(페일오버)](https://en.wikipedia.org/wiki/High_availability)* 트랜스포트가 고가용성에 중점을 두는 반면, `roundrobin` 트랜스포트는 *[로드 밸런싱(부하 분산)](https://en.wikipedia.org/wiki/Load_balancing_(computing))*을 제공합니다.

<a name="generating-mailables"></a>
## 메일러블 생성

라라벨 애플리케이션을 만들 때, 애플리케이션에서 발송되는 각 이메일 종류는 하나의 "메일러블(mailable)" 클래스로 표현됩니다. 메일러블 클래스는 `app/Mail` 디렉토리에 저장됩니다. 만약 이 디렉토리가 아직 없다면, `make:mail` Artisan 명령어로 메일러블 클래스를 처음 생성할 때 라라벨이 자동으로 만들어 줍니다.

```shell
php artisan make:mail OrderShipped
```

<a name="writing-mailables"></a>
## 메일러블 작성

메일러블 클래스를 생성했다면, 그 내용을 열어 살펴보겠습니다. 메일러블 클래스는 주로 `envelope`, `content`, `attachments` 메서드에서 관련 설정을 진행합니다.

`envelope` 메서드는 메시지의 제목(subject)과 때로는 수신인을 정의하는 `Illuminate\Mail\Mailables\Envelope` 객체를 반환합니다. `content` 메서드는 메시지 본문을 생성할 때 사용되는 [Blade 템플릿](/docs/11.x/blade)을 지정하는 `Illuminate\Mail\Mailables\Content` 객체를 반환합니다.

<a name="configuring-the-sender"></a>
### 발신자 설정

<a name="using-the-envelope"></a>
#### Envelope로 설정하기

먼저, 이메일의 발신자를 어떻게 설정하는지 살펴보겠습니다. 즉, 이메일이 누구로부터 발송되는지를 지정하는 방법입니다. 발신자 설정 방법은 두 가지가 있습니다. 첫 번째로, 메시지의 envelope(봉투)에서 "from" 주소를 직접 지정할 수 있습니다.

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

원한다면, `replyTo` 주소도 함께 지정할 수 있습니다.

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
#### 글로벌 `from` 주소 사용

하지만 애플리케이션에서 모든 이메일에 동일한 "from" 주소를 사용한다면, 메일러블 클래스마다 일일이 추가하는 것이 번거로울 수 있습니다. 이럴 때는 `config/mail.php` 설정 파일에 글로벌 "from" 주소를 지정하면 됩니다. 메일러블 클래스 내에서 별도의 "from" 주소가 설정되지 않은 경우 이 글로벌 주소가 자동으로 사용됩니다.

```
'from' => [
    'address' => env('MAIL_FROM_ADDRESS', 'hello@example.com'),
    'name' => env('MAIL_FROM_NAME', 'Example'),
],
```

추가로, `config/mail.php` 설정 파일에 글로벌 "reply_to" 주소도 정의할 수 있습니다.

```
'reply_to' => ['address' => 'example@example.com', 'name' => 'App Name'],
```

<a name="configuring-the-view"></a>
### 뷰(View) 설정

메일러블 클래스의 `content` 메서드에서는 이메일 본문이 렌더링될 때 사용할 템플릿, 즉 `view`를 지정할 수 있습니다. 각각의 이메일은 일반적으로 [Blade 템플릿](/docs/11.x/blade)을 사용해 본문을 렌더링하므로, Blade 템플릿 엔진의 모든 기능과 편리함을 활용할 수 있습니다.

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
> 이메일 템플릿을 모두 모아둘 `resources/views/emails` 디렉토리를 만드는 것이 좋습니다. 그러나 템플릿 파일은 `resources/views` 폴더 내에 원하는 곳에 자유롭게 둘 수 있습니다.

<a name="plain-text-emails"></a>
#### 일반 텍스트 이메일

이메일의 일반 텍스트 버전을 별도로 정의하고 싶다면, 메시지의 `Content` 정의에서 `text` 파라미터로 일반 텍스트 템플릿을 지정할 수 있습니다. 이 파라미터도 `view`와 마찬가지로 템플릿 이름을 지정하면 되고, HTML과 텍스트 버전 모두를 동시에 정의할 수 있습니다.

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

더 명확하게 표현하고 싶다면 `html` 파라미터를 `view`의 별칭으로 사용할 수도 있습니다.

```
return new Content(
    html: 'mail.orders.shipped',
    text: 'mail.orders.shipped-text'
);
```

<a name="view-data"></a>
### 뷰 데이터

<a name="via-public-properties"></a>
#### 퍼블릭 프로퍼티를 통한 전달

보통 이메일 본문의 HTML을 렌더링할 때 사용할 데이터를 뷰로 전달하고 싶을 때가 많습니다. 데이터를 뷰에 전달하는 방법은 두 가지가 있습니다. 첫 번째로, 메일러블 클래스에서 정의한 모든 퍼블릭 프로퍼티는 해당 뷰에서 자동으로 사용할 수 있게 됩니다. 예를 들어, 생성자에서 데이터를 받아 퍼블릭 프로퍼티로 지정하면 됩니다.

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

이렇게 퍼블릭 프로퍼티에 데이터를 할당하면, 해당 데이터는 자동으로 뷰에서 사용할 수 있습니다. Blade 템플릿에서 일반 변수처럼 접근하면 됩니다.

```
<div>
    Price: {{ $order->price }}
</div>
```

<a name="via-the-with-parameter"></a>
#### `with` 파라미터 사용

템플릿으로 전달되기 전에 이메일 데이터의 형식을 직접 다듬고 싶다면, `Content` 정의의 `with` 파라미터를 통해 데이터를 수동으로 뷰에 전달할 수 있습니다. 이 경우, 여전히 생성자를 통해 데이터를 전달하지만, 해당 데이터를 `protected`나 `private` 프로퍼티로 저장해두면 자동으로 템플릿에 노출되지 않습니다.

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

데이터를 `with`에 전달하면, 뷰에서 다른 데이터와 동일하게 해당 변수를 사용할 수 있습니다.

```
<div>
    Price: {{ $orderPrice }}
</div>
```

<a name="attachments"></a>
### 첨부 파일

이메일에 첨부 파일을 추가하려면, 메시지의 `attachments` 메서드가 반환하는 배열에 첨부 파일을 추가하면 됩니다. 먼저, `Attachment` 클래스의 `fromPath` 메서드에 파일 경로를 지정하여 첨부할 수 있습니다.

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

파일을 첨부할 때, 첨부 파일의 표시 이름이나 MIME 타입도 `as`, `withMime` 메서드로 지정할 수 있습니다.

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
#### 파일 시스템 디스크에서 첨부

[파일 시스템 디스크](/docs/11.x/filesystem)에 파일을 저장해둔 경우, `fromStorage` 첨부 방식으로 이메일에 파일을 추가할 수 있습니다.

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

물론, 첨부 파일의 이름과 MIME 타입 역시 지정 가능합니다.

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

기본 디스크가 아닌 다른 저장소 디스크에서 첨부하고 싶다면 `fromStorageDisk` 메서드를 사용할 수 있습니다.

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

#### Raw Data 첨부

`fromData` 첨부 메서드는 바이트 배열 형태의 원시 문자열을 첨부 파일로 추가할 때 사용할 수 있습니다. 예를 들어, 메모리상에서 PDF 파일을 생성한 뒤 이를 디스크에 저장하지 않고 이메일에 첨부하고 싶을 때 이 방법을 사용할 수 있습니다. `fromData` 메서드는 첨부할 원시 데이터 바이트를 반환하는 클로저와 첨부 파일에 지정할 파일명을 받습니다.

```
/**
 * 메시지에 첨부할 항목을 반환합니다.
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
### 인라인 첨부

이메일에 인라인 이미지를 삽입하는 일은 일반적으로 번거롭지만, 라라벨에서는 이미지를 편리하게 첨부할 방법을 제공합니다. 이메일 템플릿 내에서 `$message` 변수의 `embed` 메서드를 사용하면 이미지를 인라인으로 삽입할 수 있습니다. 라라벨은 `$message` 변수를 모든 이메일 템플릿에 자동으로 전달하므로, 직접 전달하지 않아도 됩니다.

```blade
<body>
    Here is an image:

    <img src="{{ $message->embed($pathToImage) }}">
</body>
```

> [!WARNING]  
> `$message` 변수는 일반 텍스트 형식의 메시지 템플릿에서는 사용할 수 없습니다. 왜냐하면 일반 텍스트 메시지는 인라인 첨부를 지원하지 않기 때문입니다.

<a name="embedding-raw-data-attachments"></a>
#### 원시 데이터 첨부 임베딩

이메일 템플릿 내에 삽입하고자 하는 원시 이미지 데이터 문자열이 이미 있다면, `$message` 변수의 `embedData` 메서드를 사용할 수 있습니다. 이 메서드를 호출할 때는 임베딩할 이미지에 지정할 파일명도 함께 전달해야 합니다.

```blade
<body>
    Here is an image from raw data:

    <img src="{{ $message->embedData($data, 'example-image.jpg') }}">
</body>
```

<a name="attachable-objects"></a>
### 첨부 가능(Attachable) 객체

파일 경로 문자열로 메시지에 파일을 첨부하는 것만으로는 충분한 경우도 있지만, 애플리케이션 내부에서 첨부할 대상 자체가 클래스로 표현되는 경우가 많습니다. 예를 들어, 애플리케이션에서 사진을 메시지에 첨부하는데 `Photo` 모델이 그 사진을 나타낼 수 있습니다. 이럴 때, 단순히 `Photo` 모델을 `attach` 메서드에 전달하는 것으로 첨부가 된다면 어떨까요? 첨부 가능 객체(Attachable Object)를 사용하면 바로 이런 기능을 간편하게 구현할 수 있습니다.

먼저, 메시지에 첨부하려는 객체에 `Illuminate\Contracts\Mail\Attachable` 인터페이스를 구현합니다. 이 인터페이스는 클래스에 `toMailAttachment` 메서드를 정의해야 한다고 규정하고 있으며, 이 메서드는 `Illuminate\Mail\Attachment` 인스턴스를 반환해야 합니다.

```
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

첨부 가능 객체를 정의하고 나면, 이메일 메시지를 작성할 때 `attachments` 메서드에서 해당 객체의 인스턴스를 반환하면 됩니다.

```
/**
 * 메시지에 첨부할 항목을 반환합니다.
 *
 * @return array<int, \Illuminate\Mail\Mailables\Attachment>
 */
public function attachments(): array
{
    return [$this->photo];
}
```

물론, 첨부 데이터가 Amazon S3 같은 원격 파일 저장소에 저장되어 있을 수도 있습니다. 라라벨은 애플리케이션에서 사용하는 [파일 시스템 디스크](/docs/11.x/filesystem)에 저장된 데이터로부터 첨부 인스턴스를 만들 수 있는 기능도 제공합니다.

```
// 기본 디스크에 저장된 파일로부터 첨부 생성...
return Attachment::fromStorage($this->path);

// 지정한 디스크에 저장된 파일로부터 첨부 생성...
return Attachment::fromStorageDisk('backblaze', $this->path);
```

또한, 메모리 내의 데이터를 이용해 첨부 인스턴스를 만들 수도 있습니다. 이 경우 `fromData` 메서드에 클로저를 전달하면 됩니다. 이 클로저는 첨부 파일에 해당하는 원시 데이터를 반환해야 합니다.

```
return Attachment::fromData(fn () => $this->content, 'Photo Name');
```

라라벨은 첨부를 더욱 유연하게 커스터마이즈할 수 있도록 추가 메서드도 제공합니다. 예를 들어, `as` 및 `withMime` 메서드를 사용해 파일 이름과 MIME 타입을 변경할 수 있습니다.

```
return Attachment::fromPath('/path/to/file')
    ->as('Photo Name')
    ->withMime('image/jpeg');
```

<a name="headers"></a>
### 헤더(Header) 커스터마이징

가끔 이메일 메시지에 추가 헤더를 설정해야 할 때도 있습니다. 예를 들어, 커스텀 `Message-Id`나 기타 텍스트 형태의 헤더를 추가해야 할 수 있습니다.

이럴 때는 mailable 클래스에 `headers` 메서드를 정의합니다. 이 메서드는 `Illuminate\Mail\Mailables\Headers` 인스턴스를 반환해야 합니다. 이 클래스는 `messageId`, `references`, `text` 파라미터를 받을 수 있으며, 필요에 따라 일부 파라미터만 제공하면 됩니다.

```
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

Mailgun, Postmark 등 일부 서드파티 이메일 서비스는 "태그(tags)"와 "메타데이터(metadata)"를 지원하여, 애플리케이션에서 보낸 이메일을 그룹화하거나 추적할 수 있도록 합니다. 이메일 메시지에 태그와 메타데이터를 추가하려면, `Envelope` 정의에서 각각을 지정하면 됩니다.

```
use Illuminate\Mail\Mailables\Envelope;

/**
 * 메시지 봉투(Envelope)를 반환합니다.
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

Mailgun 드라이버를 사용하는 경우, [태그](https://documentation.mailgun.com/docs/mailgun/user-manual/tracking-messages/#tagging)와 [메타데이터](https://documentation.mailgun.com/docs/mailgun/user-manual/tracking-messages/#attaching-data-to-messages)에 관해서는 Mailgun 공식 문서를 참고하시기 바랍니다. Postmark도 [태그](https://postmarkapp.com/blog/tags-support-for-smtp)와 [메타데이터](https://postmarkapp.com/support/article/1125-custom-metadata-faq) 관련 문서가 있으니 참고하실 수 있습니다.

Amazon SES로 이메일을 발송하는 경우에는, 메시지에 [SES "태그"](https://docs.aws.amazon.com/ses/latest/APIReference/API_MessageTag.html)를 붙이기 위해 `metadata` 메서드를 사용하면 됩니다.

<a name="customizing-the-symfony-message"></a>
### Symfony 메시지 커스터마이징

라라벨의 메일 기능은 Symfony Mailer에 기반합니다. 라라벨은 메시지 전송 전에 Symfony Message 인스턴스를 전달받아 조작할 수 있는 커스텀 콜백 등록 기능을 제공합니다. 이를 통해, 메시지가 전송되기 전에 심층적으로 내용을 커스터마이즈할 수 있습니다. 이를 위해서는 `Envelope` 정의에서 `using` 파라미터에 콜백을 추가하면 됩니다.

```
use Illuminate\Mail\Mailables\Envelope;
use Symfony\Component\Mime\Email;

/**
 * 메시지 봉투(Envelope)를 반환합니다.
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
## 마크다운(Markdown) 메일러블

Markdown 메일러블 메시지를 사용하면 [메일 알림](/docs/11.x/notifications#mail-notifications)의 미리 만들어진 템플릿 및 컴포넌트를 메일러블에서 바로 활용할 수 있습니다. 메시지 본문이 Markdown으로 작성되므로 라라벨이 아름답고 반응형인 HTML 템플릿을 렌더링하며, 동시에 일반 텍스트 버전도 자동으로 생성해줍니다.

<a name="generating-markdown-mailables"></a>
### Markdown 메일러블 생성

Markdown 템플릿이 포함된 메일러블을 생성하려면, `make:mail` 아티즌 명령어의 `--markdown` 옵션을 사용하세요.

```shell
php artisan make:mail OrderShipped --markdown=mail.orders.shipped
```

그런 다음, 메일러블 클래스의 `content` 메서드 내에서 `Content` 정의를 할 때 `view` 대신 `markdown` 파라미터를 사용합니다.

```
use Illuminate\Mail\Mailables\Content;

/**
 * 메시지 본문(Content) 정의를 반환합니다.
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

Markdown 메일러블에서는 Blade 컴포넌트와 Markdown 문법이 함께 사용되어, 라라벨이 제공하는 다양한 이메일 UI 컴포넌트를 쉽게 활용할 수 있습니다.

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
> Markdown 이메일을 작성할 때 불필요한 들여쓰기를 사용하지 마세요. Markdown 표준에 따라, 들여쓰기된 내용은 코드 블록으로 처리될 수 있습니다.

<a name="button-component"></a>
#### 버튼(Button) 컴포넌트

버튼 컴포넌트는 중앙 정렬된 버튼 링크를 렌더링합니다. 이 컴포넌트는 `url`과 선택적으로 `color` 값을 받으며, 지원되는 색상은 `primary`, `success`, `error`입니다. 필요하다면 여러 개의 버튼 컴포넌트를 추가할 수 있습니다.

```blade
<x-mail::button :url="$url" color="success">
View Order
</x-mail::button>
```

<a name="panel-component"></a>
#### 패널(Panel) 컴포넌트

패널 컴포넌트는 전달된 텍스트 블록을 일반 메시지보다 약간 다른 배경색의 패널로 감싸줍니다. 이를 통해, 특정 텍스트 블록을 강조하고 싶을 때 사용할 수 있습니다.

```blade
<x-mail::panel>
This is the panel content.
</x-mail::panel>
```

<a name="table-component"></a>
#### 테이블(Table) 컴포넌트

테이블 컴포넌트는 Markdown 테이블을 HTML 테이블로 변환할 수 있게 해줍니다. 컴포넌트 내용에 Markdown 테이블을 그대로 전달하면 되고, 표의 컬럼 정렬도 Markdown 기본 정렬 문법을 그대로 지원합니다.

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

라라벨이 제공하는 Markdown 메일용 컴포넌트 전체를 애플리케이션 내로 내보내서 커스터마이징할 수 있습니다. 내보낼 때는 `laravel-mail` 애셋 태그를 `vendor:publish` 아티즌 명령어로 퍼블리시합니다.

```shell
php artisan vendor:publish --tag=laravel-mail
```

이 명령은 `resources/views/vendor/mail` 디렉터리에 Markdown 메일 컴포넌트를 퍼블리시합니다. `mail` 디렉터리에는 `html`과 `text` 폴더가 포함되며, 각각에 모든 컴포넌트의 버전이 들어 있습니다. 필요에 따라 마음껏 커스터마이즈하여 사용할 수 있습니다.

<a name="customizing-the-css"></a>
#### CSS 커스터마이징

컴포넌트 내보내기 후, `resources/views/vendor/mail/html/themes` 디렉터리 내에 `default.css` 파일이 있습니다. 이 파일 내 CSS를 커스터마이즈하면, 해당 스타일이 자동으로 인라인 CSS 형식으로 변환되어 HTML 버전의 Markdown 메일 메시지에 적용됩니다.

라라벨 Markdown 컴포넌트의 전체적인 테마를 새롭게 만들고 싶다면, `html/themes` 디렉터리에 CSS 파일을 직접 추가할 수 있습니다. 파일명을 저장한 뒤, `config/mail.php` 설정 파일의 `theme` 옵션을 새 테마 이름에 맞게 업데이트하세요.

메일러블 단위로 테마를 개별 지정하고 싶을 경우, 메일러블 클래스의 `$theme` 속성에 사용할 테마명을 지정하면 됩니다.

<a name="sending-mail"></a>
## 메일 발송하기

메일을 전송하려면, [Mail 파사드](/docs/11.x/facades)의 `to` 메서드를 사용하세요. `to` 메서드에는 이메일 주소, 사용자 인스턴스, 또는 사용자 컬렉션을 전달할 수 있습니다. 객체 또는 객체 컬렉션을 전달한 경우, 라라벨은 내부적으로 객체의 `email`과 `name` 속성을 사용하여 수신자를 자동으로 판단합니다. 따라서 해당 속성들이 객체에 존재하는지 반드시 확인해야 합니다. 수신자를 지정했다면, `send` 메서드에 메일러블 클래스 인스턴스를 전달하여 메일을 보낼 수 있습니다.

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
     * 주어진 주문을 발송 처리합니다.
     */
    public function store(Request $request): RedirectResponse
    {
        $order = Order::findOrFail($request->order_id);

        // 주문 발송 처리...

        Mail::to($request->user())->send(new OrderShipped($order));

        return redirect('/orders');
    }
}
```

메일 발송 시, 꼭 "to" 수신자만 지정해야 하는 것은 아닙니다. "to", "cc", "bcc" 수신자를 각각의 메서드 체이닝으로 자유롭게 지정할 수 있습니다.

```
Mail::to($request->user())
    ->cc($moreUsers)
    ->bcc($evenMoreUsers)
    ->send(new OrderShipped($order));
```

<a name="looping-over-recipients"></a>
#### 수신자 반복 처리

간혹, 여러 명의 수신자/이메일 주소에 메일러블을 반복적으로 발송해야 할 수 있습니다. 하지만 `to` 메서드는 수신자 리스트에 이메일 주소를 계속 추가하기만 하므로, 반복문 내부에서 메일러블 인스턴스를 재생성하지 않으면 이전 수신자에게도 중복 발송될 수 있습니다. 따라서, 수신자마다 새로운 메일러블 인스턴스를 반드시 생성해서 사용해야 합니다.

```
foreach (['taylor@example.com', 'dries@example.com'] as $recipient) {
    Mail::to($recipient)->send(new OrderShipped($order));
}
```

<a name="sending-mail-via-a-specific-mailer"></a>
#### 특정 메일러를 통한 메일 발송

기본적으로 라라벨은 애플리케이션의 `mail` 설정 파일에 지정된 `default` 메일러를 사용해 메일을 보냅니다. 하지만, `mailer` 메서드를 사용해서 특정한 메일러 설정을 통해 메일을 발송할 수도 있습니다.

```
Mail::mailer('postmark')
    ->to($request->user())
    ->send(new OrderShipped($order));
```

<a name="queueing-mail"></a>
### 메일 발송 큐 처리

<a name="queueing-a-mail-message"></a>
#### 메일 메시지 큐로 처리하기

이메일 발송은 애플리케이션의 응답 속도에 영향을 줄 수 있기 때문에, 많은 개발자들은 메일 발송 작업을 큐로 처리하여 비동기적으로 실행하는 방식을 많이 선호합니다. 라라벨에서는 [통합 큐 API](/docs/11.x/queues)를 통해 매우 간편하게 이를 구현할 수 있습니다. 메일을 큐로 보내려면, 수신자 지정 후 `Mail` 파사드의 `queue` 메서드를 사용하면 됩니다.

```
Mail::to($request->user())
    ->cc($moreUsers)
    ->bcc($evenMoreUsers)
    ->queue(new OrderShipped($order));
```

이 메서드는 메일 전송 작업을 자동으로 큐에 등록하여, 백그라운드에서 비동기적으로 메시지를 전송합니다. 이 기능을 사용하기 전에 [큐 설정](/docs/11.x/queues)을 반드시 완료해야 합니다.

<a name="delayed-message-queueing"></a>
#### 지연 발송 큐 처리

큐로 보내는 메일을 일정 시간 뒤에 발송하고 싶다면, `later` 메서드를 사용할 수 있습니다. 이 메서드의 첫 번째 인자로는 언제 발송할지를 지정하는 `DateTime` 인스턴스를 전달합니다.

```
Mail::to($request->user())
    ->cc($moreUsers)
    ->bcc($evenMoreUsers)
    ->later(now()->addMinutes(10), new OrderShipped($order));
```

<a name="pushing-to-specific-queues"></a>
#### 특정 큐/커넥션 지정

`make:mail` 명령어로 생성된 모든 메일러블 클래스에는 `Illuminate\Bus\Queueable` 트레이트가 적용되어 있습니다. 이 트레이트 덕분에, 각 메일러블 인스턴스에서 큐 커넥션 및 큐 이름을 지정할 수 있는 `onQueue` 및 `onConnection` 메서드를 사용할 수 있습니다.

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
#### 기본 큐 처리

항상 큐로만 보내고 싶은 메일러블 클래스가 있다면, 해당 클래스에서 `ShouldQueue` 인터페이스(계약)를 구현하면 됩니다. 이렇게 하면, `send` 메서드로 메일을 발송하더라도 이 메일러블은 무조건 큐로 처리됩니다.

```
use Illuminate\Contracts\Queue\ShouldQueue;

class OrderShipped extends Mailable implements ShouldQueue
{
    // ...
}
```

<a name="queued-mailables-and-database-transactions"></a>
#### 큐 메일러블과 데이터베이스 트랜잭션

큐 메일러블이 데이터베이스 트랜잭션 내부에서 디스패치(dispatch)되면, 큐가 먼저 메일러블 처리를 해버리고, 트랜잭션의 커밋이 아직 완료되지 않은 상황일 수 있습니다. 이렇게 되면, 트랜잭션 내에서 수정한 모델이나 레코드가 데이터베이스에 아직 반영되지 않았을 수 있고, 트랜잭션 내에서 생성한 모델, 레코드가 아예 DB에 존재하지 않을 수도 있습니다. 만약 메일러블에서 이런 모델 값에 의존한다면, 큐 작업이 처리될 때 예기치 않은 오류가 날 수 있습니다.

큐 커넥션의 `after_commit` 설정이 `false`일 경우, 특정 큐 메일러블만 트랜잭션 커밋이 끝난 뒤 디스패치되게 하려면, 메일 전송 시 `afterCommit` 메서드를 호출하세요.

```
Mail::to($request->user())->send(
    (new OrderShipped($order))->afterCommit()
);
```

또는, 메일러블 생성자에서 `afterCommit`을 호출할 수도 있습니다.

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
     * 메시지 인스턴스를 생성합니다.
     */
    public function __construct()
    {
        $this->afterCommit();
    }
}
```

> [!NOTE]  
> 이러한 문제를 회피하는 방법에 대해 더 알고 싶다면, [큐 작업과 데이터베이스 트랜잭션](/docs/11.x/queues#jobs-and-database-transactions) 관련 문서를 참고하시기 바랍니다.

<a name="rendering-mailables"></a>
## 메일러블 렌더링

메일을 실제로 발송하지 않고, 메일러블의 HTML 내용을 문자열로 받아보고 싶을 때도 있습니다. 이럴 때는 메일러블의 `render` 메서드를 호출하면, 평가된 HTML 문자열을 반환받을 수 있습니다.

```
use App\Mail\InvoicePaid;
use App\Models\Invoice;

$invoice = Invoice::find(1);

return (new InvoicePaid($invoice))->render();
```

<a name="previewing-mailables-in-the-browser"></a>
### 브라우저에서 메일러블 미리보기

메일러블의 템플릿을 디자인할 때, 실제 이메일로 발송하지 않고 Blade 템플릿처럼 브라우저에서 바로 미리보기를 할 수 있으면 아주 편리합니다. 이를 위해 라라벨에서는 라우트 클로저나 컨트롤러에서 메일러블을 직접 반환하면, 해당 메일러블이 렌더링되어 브라우저에서 미리보기로 표시됩니다.

```
Route::get('/mailable', function () {
    $invoice = App\Models\Invoice::find(1);

    return new App\Mail\InvoicePaid($invoice);
});
```

<a name="localizing-mailables"></a>
## 메일러블 로컬라이징

라라벨은 현재 요청의 로케일(locale)과 다른 언어로 메일러블을 보낼 수 있고, 해당 메일이 큐에 등록될 경우에도 그 로케일 정보를 기억해서 발송합니다.

이를 위해, `Mail` 파사드는 원하는 언어로 변경할 수 있는 `locale` 메서드를 제공합니다. 메일러블 템플릿이 평가되는 동안 애플리케이션의 로케일이 지정한 값으로 변경되며, 평가가 끝나면 다시 원래 로케일로 돌아갑니다.

```
Mail::to($request->user())->locale('es')->send(
    new OrderShipped($order)
);
```

<a name="user-preferred-locales"></a>
### 사용자 선호 언어

애플리케이션에서 사용자마다 선호하는 로케일(언어 설정)을 저장하는 경우가 많습니다. 모델에서 `HasLocalePreference` 인터페이스를 구현하면, 라라벨은 메일 발송 시 저장된 언어 설정을 자동으로 사용합니다.

```
use Illuminate\Contracts\Translation\HasLocalePreference;

class User extends Model implements HasLocalePreference
{
    /**
     * 사용자의 선호 로케일을 반환합니다.
     */
    public function preferredLocale(): string
    {
        return $this->locale;
    }
}
```

이 인터페이스를 구현하면, 라라벨이 메일러블 및 알림을 발송할 때 선호 로케일을 자동으로 사용하므로, `locale` 메서드를 따로 호출할 필요가 없습니다.

```
Mail::to($request->user())->send(new OrderShipped($order));
```

<a name="testing-mailables"></a>
## 테스트

<a name="testing-mailable-content"></a>
### 메일러블 내용 테스트

라라벨은 메일러블의 구조와 내용을 검사할 수 있는 다양한 메서드를 제공합니다. 또한, 메일러블에 기대한 내용이 포함되어 있는지 테스트할 수 있는 편리한 메서드들도 마련되어 있습니다. 대표적인 메서드는 다음과 같습니다: `assertSeeInHtml`, `assertDontSeeInHtml`, `assertSeeInOrderInHtml`, `assertSeeInText`, `assertDontSeeInText`, `assertSeeInOrderInText`, `assertHasAttachment`, `assertHasAttachedData`, `assertHasAttachmentFromStorage`, `assertHasAttachmentFromStorageDisk`.

예상할 수 있듯, "HTML" 관련 메서드는 HTML 버전의 메일러블이 특정 문자열을 포함하는지 검사하며, "text" 메서드는 일반 텍스트 버전에 대해 동일한 검증을 수행합니다.

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

특정 메일러블이 특정 사용자에게 "발송"되었는지를 검증하는 테스트와는 별도로, 메일러블의 본문 내용을 별도로 테스트하는 것을 권장합니다. 보통 테스트의 목적은 메일러블의 내용 자체가 아니라, 라라벨이 특정 메일러블을 발송하도록 지시받았는지가 중요하기 때문입니다.

`Mail` 파사드의 `fake` 메서드를 사용하면 실제로 메일이 발송되지 않도록 할 수 있습니다. `Mail::fake()`를 호출한 후에는, 메일러블이 사용자에게 발송 지시를 받았는지, 각 메일러블이 어떤 데이터를 받았는지 등을 검증할 수 있습니다.

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

만약 백그라운드에서 메일러블을 대기열에 넣어 발송한다면, `assertSent` 대신 `assertQueued` 메서드를 사용해야 합니다.

```
Mail::assertQueued(OrderShipped::class);
Mail::assertNotQueued(OrderShipped::class);
Mail::assertNothingQueued();
Mail::assertQueuedCount(3);
```

또한, `assertSent`, `assertNotSent`, `assertQueued`, `assertNotQueued` 메서드에는 클로저를 전달할 수 있습니다. 전달된 "조건(진리 테스트)"에 부합하는 하나 이상의 메일러블이 발송되었다면 해당 검증(Assertion)이 성공합니다.

```
Mail::assertSent(function (OrderShipped $mail) use ($order) {
    return $mail->order->id === $order->id;
});
```

`Mail` 파사드의 assertion 메서드에서 제공하는 클로저의 인자로 전달되는 메일러블 인스턴스는, 메일러블의 속성을 자세히 살필 수 있는 여러 보조 메서드를 제공합니다.

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

메일러블 인스턴스에서는 첨부 파일에 관한 여러 보조 메서드도 제공합니다.

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

메일이 발송되지 않았음을 검증할 때는, `assertNotSent`와 `assertNotQueued`라는 두 가지 메서드를 사용할 수 있습니다. 어떤 상황에서는 메일이 전혀 발송되지도, 대기열에 들어가지도 않았음을 한 번에 검증하고 싶을 수 있습니다. 이럴 때는 `assertNothingOutgoing`과 `assertNotOutgoing` 메서드를 사용할 수 있습니다.

```
Mail::assertNothingOutgoing();

Mail::assertNotOutgoing(function (OrderShipped $mail) use ($order) {
    return $mail->order->id === $order->id;
});
```

<a name="mail-and-local-development"></a>
## 메일과 로컬 개발 환경

이메일을 발송하는 애플리케이션을 개발할 때는, 실제 이메일이 실존하는 주소로 발송되기를 원치 않을 것입니다. 라라벨은 로컬 개발 환경에서 실제로 이메일이 발송되지 않도록 차단할 수 있는 여러 방법을 제공합니다.

<a name="log-driver"></a>
#### 로그 드라이버

실제 이메일을 발송하는 대신, `log` 메일 드라이버는 모든 이메일 메시지를 로그 파일에 기록하여 추적할 수 있게 해줍니다. 일반적으로 이 드라이버는 로컬 개발 환경에서만 사용합니다. 환경별 설정에 대해 더 자세히 알아보려면 [설정 문서](/docs/11.x/configuration#environment-configuration)를 참고하세요.

<a name="mailtrap"></a>
#### HELO / Mailtrap / Mailpit

또 다른 방법으로, [HELO](https://usehelo.com)나 [Mailtrap](https://mailtrap.io)과 같은 서비스를 `smtp` 드라이버와 함께 사용하여 이메일을 실제로 전달하지 않고 "가상" 메일박스로 전송할 수 있습니다. 이를 통해 실제 메일 클라이언트에서 메시지를 확인할 수 있다는 장점이 있습니다. 특히 Mailtrap의 메시지 뷰어를 통해 최종 이메일의 형태를 직접 살펴볼 수 있습니다.

[라라벨 Sail](/docs/11.x/sail)을 사용하는 경우, [Mailpit](https://github.com/axllent/mailpit)을 통해 메시지를 미리 볼 수 있습니다. Sail이 실행되고 있다면, 브라우저에서 `http://localhost:8025`로 접속해 Mailpit 인터페이스에 접근할 수 있습니다.

<a name="using-a-global-to-address"></a>
#### 전체 전송 주소(Global `to` Address) 사용하기

마지막으로, `Mail` 파사드의 `alwaysTo` 메서드를 사용하여, 모든 이메일을 단일 "전체 전송" 주소로 지정할 수도 있습니다. 이 메서드는 보통 애플리케이션의 서비스 프로바이더 중 하나의 `boot` 메서드에서 호출해야 합니다.

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

라라벨은 메일 메시지를 발송할 때 두 개의 이벤트를 발생시킵니다. `MessageSending` 이벤트는 메시지 발송 이전에, `MessageSent` 이벤트는 메시지 발송 직후에 트리거됩니다. 이 이벤트들은 메일이 실제로 *발송*될 때 발생하며, 대기열에 들어갈 때는 발생하지 않는 점에 유의해야 합니다. 애플리케이션에서 이 이벤트들에 대한 [이벤트 리스너](/docs/11.x/events)를 자유롭게 작성할 수 있습니다.

```
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
## 커스텀 메일 전송 방식(Transport)

라라벨은 다양한 기본 메일 전송 방식을 내장하고 있습니다. 그러나 라라벨에서 지원하지 않는 다른 서비스로 이메일을 전송하고 싶다면, 직접 커스텀 transport를 구현할 수 있습니다. 시작하려면 `Symfony\Component\Mailer\Transport\AbstractTransport` 클래스를 확장한 클래스를 정의해야 합니다. 그런 다음 `doSend`와 `__toString()` 메서드를 구현하세요.

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

커스텀 transport를 정의한 후에는, `Mail` 파사드의 `extend` 메서드를 통해 등록할 수 있습니다. 보통 이 작업은 애플리케이션의 `AppServiceProvider` 서비스 프로바이더의 `boot` 메서드에서 처리합니다. `extend` 메서드에 전달하는 클로저에는 `$config` 인자가 전달되며, 이 인자에는 애플리케이션의 `config/mail.php`에 정의한 메일러 설정 배열이 담겨 있습니다.

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

커스텀 transport가 정의 및 등록되었으면, 애플리케이션의 `config/mail.php` 설정 파일에 해당 transport를 사용하는 mailer 정의를 추가할 수 있습니다.

```
'mailchimp' => [
    'transport' => 'mailchimp',
    // ...
],
```

<a name="additional-symfony-transports"></a>
### 추가적인 Symfony 메일 전송 방식

라라벨은 Mailgun, Postmark처럼 Symfony에서 관리하는 일부 메일 전송 방식(transport)을 기본 지원합니다. 그러나 Laravel에 추가적인 Symfony 공식 transport 지원을 확장하고 싶다면, 필요한 Symfony mailer 패키지를 Composer로 설치한 뒤 직접 등록하면 됩니다. 예를 들어, "Brevo"(이전 이름: "Sendinblue")용 Symfony mailer를 설치하고 등록하는 과정은 다음과 같습니다.

```none
composer require symfony/brevo-mailer symfony/http-client
```

Brevo mailer 패키지를 설치한 후에는, 애플리케이션의 `services` 설정 파일에 Brevo API 자격 증명을 추가할 수 있습니다.

```
'brevo' => [
    'key' => 'your-api-key',
],
```

그리고 나서, `Mail` 파사드의 `extend` 메서드를 사용해 transport를 등록합니다. 일반적으로 이 작업은 서비스 프로바이더의 `boot` 메서드에서 수행합니다.

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

transport를 등록한 뒤에는, 애플리케이션의 config/mail.php 설정 파일에 해당 transport를 사용하는 mailer 정의를 추가하면 됩니다.

```
'brevo' => [
    'transport' => 'brevo',
    // ...
],
```