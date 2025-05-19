# 메일 (Mail)

- [소개](#introduction)
    - [설정](#configuration)
    - [드라이버 사전 준비 사항](#driver-prerequisites)
    - [장애 조치 구성](#failover-configuration)
- [메일러블 생성](#generating-mailables)
- [메일러블 작성하기](#writing-mailables)
    - [발신자 구성](#configuring-the-sender)
    - [뷰 구성](#configuring-the-view)
    - [뷰 데이터](#view-data)
    - [첨부 파일](#attachments)
    - [인라인 첨부](#inline-attachments)
    - [Attachable 객체](#attachable-objects)
    - [헤더](#headers)
    - [태그 & 메타데이터](#tags-and-metadata)
    - [Symfony 메시지 커스터마이징](#customizing-the-symfony-message)
- [마크다운 메일러블](#markdown-mailables)
    - [마크다운 메일러블 생성](#generating-markdown-mailables)
    - [마크다운 메시지 작성](#writing-markdown-messages)
    - [컴포넌트 커스터마이징](#customizing-the-components)
- [메일 전송](#sending-mail)
    - [메일 큐잉](#queueing-mail)
- [메일러블 렌더링](#rendering-mailables)
    - [메일러블을 브라우저에서 미리보기](#previewing-mailables-in-the-browser)
- [메일러블 지역화](#localizing-mailables)
- [메일러블 테스트하기](#testing-mailables)
- [메일 & 로컬 개발](#mail-and-local-development)
- [이벤트](#events)
- [커스텀 트랜스포트](#custom-transports)
    - [추가 Symfony 트랜스포트](#additional-symfony-transports)

<a name="introduction"></a>
## 소개

이메일을 보내는 일은 복잡할 필요가 없습니다. 라라벨은 인기 있는 [Symfony Mailer](https://symfony.com/doc/6.0/mailer.html) 컴포넌트를 기반으로, 깔끔하고 간단한 이메일 API를 제공합니다. 라라벨과 Symfony Mailer는 SMTP, Mailgun, Postmark, Amazon SES, 그리고 `sendmail`을 통한 이메일 전송을 지원하는 다양한 드라이버를 제공하므로, 로컬 환경이나 클라우드 서비스 중 원하는 곳을 선택해 빠르게 메일 발송을 시작할 수 있습니다.

<a name="configuration"></a>
### 설정

라라벨의 이메일 서비스는 애플리케이션의 `config/mail.php` 설정 파일을 통해 구성할 수 있습니다. 이 파일에 여러 개의 메일러를 각각 독립적으로 설정할 수 있으며, 각 메일러마다 "트랜스포트(transport)"를 다르게 지정할 수 있어 특정 이메일 메시지를 전송할 때 서로 다른 메일 서비스를 사용할 수 있습니다. 예를 들어, 트랜잭션 메일은 Postmark로, 대량 메일은 Amazon SES로 발송하도록 구성할 수 있습니다.

`mail` 설정 파일 내에는 `mailers` 설정 배열이 있습니다. 이 배열에는 라라벨이 지원하는 주요 메일 드라이버/트랜스포트에 대한 샘플 설정이 들어 있습니다. `default` 설정 값은 애플리케이션이 이메일을 보낼 때 기본적으로 어떤 메일러를 사용할지 결정합니다.

<a name="driver-prerequisites"></a>
### 드라이버 / 트랜스포트 사전 준비 사항

Mailgun, Postmark와 같은 API 기반 드라이버는 일반적으로 SMTP 서버를 사용해 메일을 보내는 것보다 더 간단하고 빠릅니다. 가능하다면 이러한 드라이버 중 하나를 사용하는 것을 권장합니다.

<a name="mailgun-driver"></a>
#### Mailgun 드라이버

Mailgun 드라이버를 사용하려면 Composer로 Symfony의 Mailgun Mailer 트랜스포트를 설치해야 합니다.

```shell
composer require symfony/mailgun-mailer symfony/http-client
```

그 다음, 애플리케이션의 `config/mail.php` 설정 파일에서 `default` 옵션을 `mailgun`으로 지정합니다. 기본 메일러를 설정했다면, `config/services.php` 설정 파일에 아래와 같은 옵션들이 포함되어 있는지 확인합니다.

```
'mailgun' => [
    'domain' => env('MAILGUN_DOMAIN'),
    'secret' => env('MAILGUN_SECRET'),
],
```

만약 미국이 아닌 다른 [Mailgun 리전](https://documentation.mailgun.com/en/latest/api-intro.html#mailgun-regions)을 사용한다면, `services` 설정 파일에서 해당 리전의 endpoint를 정의해 줄 수 있습니다.

```
'mailgun' => [
    'domain' => env('MAILGUN_DOMAIN'),
    'secret' => env('MAILGUN_SECRET'),
    'endpoint' => env('MAILGUN_ENDPOINT', 'api.eu.mailgun.net'),
],
```

<a name="postmark-driver"></a>
#### Postmark 드라이버

Postmark 드라이버를 사용하려면 Symfony의 Postmark Mailer 트랜스포트를 Composer로 설치해야 합니다.

```shell
composer require symfony/postmark-mailer symfony/http-client
```

그 다음, 애플리케이션의 `config/mail.php` 설정 파일에서 `default` 옵션을 `postmark`로 변경합니다. 그 후, `config/services.php` 설정 파일에 아래와 같은 옵션이 존재하는지 확인합니다.

```
'postmark' => [
    'token' => env('POSTMARK_TOKEN'),
],
```

특정 메일러가 사용할 Postmark 메시지 스트림을 지정하고 싶다면, 해당 메일러의 설정 배열에 `message_stream_id` 옵션을 추가할 수 있습니다. 이 설정 배열은 `config/mail.php` 파일에서 찾을 수 있습니다.

```
'postmark' => [
    'transport' => 'postmark',
    'message_stream_id' => env('POSTMARK_MESSAGE_STREAM_ID'),
],
```

이렇게 하면 다른 메시지 스트림을 사용해 여러 Postmark 메일러를 각각 설정할 수도 있습니다.

<a name="ses-driver"></a>
#### SES 드라이버

Amazon SES 드라이버를 사용하려면 먼저 PHP용 Amazon AWS SDK를 설치해야 합니다. 이 라이브러리는 Composer 패키지 매니저를 이용해 설치할 수 있습니다.

```shell
composer require aws/aws-sdk-php
```

그 다음, `config/mail.php` 설정 파일에서 `default` 옵션을 `ses`로 설정하고, `config/services.php` 파일이 다음과 같은 옵션을 포함하는지 확인합니다.

```
'ses' => [
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
],
```

AWS [임시 자격 증명](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_use-resources.html)을 세션 토큰을 통해 사용하고자 한다면, SES 설정에 `token` 키를 추가할 수 있습니다.

```
'ses' => [
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    'token' => env('AWS_SESSION_TOKEN'),
],
```

이메일 전송 시 라라벨이 AWS SDK의 `SendEmail` 메서드에 [추가 옵션](https://docs.aws.amazon.com/aws-sdk-php/v3/api/api-sesv2-2019-09-27.html#sendemail)을 전달하도록 하려면, `ses` 설정 내에 `options` 배열을 정의할 수 있습니다.

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

<a name="failover-configuration"></a>
### 장애 조치(Failover) 구성

애플리케이션의 메일 전송에 사용되는 외부 서비스가 일시적으로 중단되는 경우가 있습니다. 이런 상황을 대비해 주 메일 드라이버(ex. Mailgun)가 동작하지 않을 때 사용할 백업 메일 전송 옵션을 하나 이상 정의해두는 것이 유용할 수 있습니다.

이 기능을 사용하려면, `mail` 설정 파일에 `failover` 트랜스포트를 사용하는 메일러를 지정해야 합니다. `failover` 메일러의 설정 배열에는 실제로 사용할 메일러들의 우선순위를 정의하는 `mailers` 배열이 포함되어야 합니다.

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

failover 메일러를 정의했으면, 애플리케이션이 기본적으로 사용할 메일러로 이 메일러를 지정해야 합니다. 이를 위해, `mail` 설정 파일의 `default` 키 값을 해당 메일러 이름으로 지정하시면 됩니다.

```
'default' => env('MAIL_MAILER', 'failover'),
```

<a name="generating-mailables"></a>
## 메일러블 생성

라라벨 애플리케이션을 개발할 때, 애플리케이션이 발송하는 각기 다른 종류의 이메일마다 "메일러블(mailable)" 클래스로 표현됩니다. 이런 클래스들은 `app/Mail` 디렉터리에 생성됩니다. 만약 해당 디렉터리가 존재하지 않더라도 걱정하지 않아도 됩니다. `make:mail` Artisan 명령어로 첫 번째 메일러블 클래스를 생성하면 자동으로 만들어집니다.

```shell
php artisan make:mail OrderShipped
```

<a name="writing-mailables"></a>
## 메일러블 작성하기

메일러블 클래스를 생성했다면, 이제 파일을 열고 어떤 내용이 있는지 살펴보겠습니다. 메일러블 클래스는 여러 메서드에서 구성할 수 있는데, 대표적으로 `envelope`, `content`, `attachments` 메서드가 있습니다.

`envelope` 메서드는 메시지의 제목(subject)과 때로는 수신자 정보를 정의하는 `Illuminate\Mail\Mailables\Envelope` 객체를 반환합니다. `content` 메서드는 메시지 내용 생성을 담당할 [Blade 템플릿](/docs/9.x/blade)을 지정하는 `Illuminate\Mail\Mailables\Content` 객체를 반환합니다.

<a name="configuring-the-sender"></a>
### 발신자 구성

<a name="using-the-envelope"></a>
#### Envelope를 사용해 구성하기

먼저, 이메일의 발신자를 어떻게 설정하는지 살펴보겠습니다. 즉, 이메일을 보낼 때 "보낸 사람"이 누구로 표시될지 설정하는 것입니다. 발신자 구성 방법은 두 가지가 있습니다. 첫 번째는 메시지의 envelope에 "from" 주소를 지정하는 방법입니다.

```
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Envelope;

/**
 * Get the message envelope.
 *
 * @return \Illuminate\Mail\Mailables\Envelope
 */
public function envelope()
{
    return new Envelope(
        from: new Address('jeffrey@example.com', 'Jeffrey Way'),
        subject: 'Order Shipped',
    );
}
```

필요하다면, `replyTo` 주소도 지정할 수 있습니다.

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

애플리케이션에서 모든 이메일에 동일한 "from" 주소를 사용할 경우, 매번 메일러블 클래스마다 `from` 메서드를 호출하는 것이 번거로울 수 있습니다. 이럴 때에는 `config/mail.php` 설정 파일에 전역 "from" 주소를 지정해둘 수 있습니다. 메일러블 클래스에서 별도로 "from" 주소를 지정하지 않은 경우에 이 주소가 사용됩니다.

```
'from' => ['address' => 'example@example.com', 'name' => 'App Name'],
```

또한, 전역적으로 "reply_to" 주소도 다음과 같이 지정할 수 있습니다.

```
'reply_to' => ['address' => 'example@example.com', 'name' => 'App Name'],
```

<a name="configuring-the-view"></a>
### 뷰(View) 구성

메일러블 클래스의 `content` 메서드에서는 이메일 내용 렌더링에 사용할 `view`(템플릿)를 정의할 수 있습니다. 각 이메일은 일반적으로 [Blade 템플릿](/docs/9.x/blade)을 사용해 내용을 렌더링하므로, 이메일의 HTML을 만들 때 Blade의 모든 기능과 편리함을 활용할 수 있습니다.

```
/**
 * Get the message content definition.
 *
 * @return \Illuminate\Mail\Mailables\Content
 */
public function content()
{
    return new Content(
        view: 'emails.orders.shipped',
    );
}
```

> [!NOTE]
> 모든 이메일 템플릿을 보관할 `resources/views/emails` 디렉터리를 생성하면 관리에 도움이 될 수 있습니다. 하지만 반드시 이 위치를 고수할 필요는 없으며, `resources/views` 아래라면 어디든 자유롭게 둘 수 있습니다.

<a name="plain-text-emails"></a>
#### 텍스트 전용 이메일(Plain Text Emails)

이메일의 텍스트 전용(plain-text) 버전을 별도로 정의하고 싶다면, 메시지의 `Content` 정의 시 plain-text 템플릿을 지정할 수 있습니다. `view` 파라미터처럼 `text`에도 템플릿 이름을 지정하면, 해당 템플릿이 이메일 본문의 텍스트 버전 렌더링에 사용됩니다. HTML과 텍스트 버전 메시지를 함께 정의할 수도 있습니다.

```
/**
 * Get the message content definition.
 *
 * @return \Illuminate\Mail\Mailables\Content
 */
public function content()
{
    return new Content(
        view: 'emails.orders.shipped',
        text: 'emails.orders.shipped-text'
    );
}
```

가독성을 위해, `html` 파라미터를 `view`의 별칭으로 사용할 수도 있습니다.

```
return new Content(
    html: 'emails.orders.shipped',
    text: 'emails.orders.shipped-text'
);
```

<a name="view-data"></a>
### 뷰 데이터

<a name="via-public-properties"></a>
#### public 속성으로 데이터 전달

보통 이메일의 HTML을 렌더링할 때 사용할 데이터를 뷰에 넘겨주고 싶을 것입니다. 뷰에 데이터를 전달하는 방법은 두 가지가 있습니다. 첫 번째는, 메일러블 클래스 내에 정의한 public 속성이 자동으로 뷰에서 사용할 수 있도록 제공되는 방식입니다. 예를 들어, 메일러블 클래스 생성자에서 데이터를 받아 public 속성에 할당하면 됩니다.

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
     * The order instance.
     *
     * @var \App\Models\Order
     */
    public $order;

    /**
     * Create a new message instance.
     *
     * @param  \App\Models\Order  $order
     * @return void
     */
    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    /**
     * Get the message content definition.
     *
     * @return \Illuminate\Mail\Mailables\Content
     */
    public function content()
    {
        return new Content(
            view: 'emails.orders.shipped',
        );
    }
}
```

public 속성에 데이터가 할당되었다면, 뷰에서 Blade 템플릿의 다른 데이터처럼 접근해 사용할 수 있습니다.

```
<div>
    Price: {{ $order->price }}
</div>
```

<a name="via-the-with-parameter"></a>
#### `with` 파라미터로 데이터 전달

이메일의 데이터를 템플릿으로 보내기 전에 형식을 커스터마이징하고 싶다면, `Content` 정의의 `with` 파라미터를 통해 데이터를 수동으로 뷰에 전달할 수 있습니다. 이 방법을 사용할 때에도 일반적으로 데이터는 메일러블 클래스 생성자를 통해 전달하지만, 이 데이터는 자동 노출이 되지 않도록 `protected` 혹은 `private` 속성에 설정해야 합니다.

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
     * The order instance.
     *
     * @var \App\Models\Order
     */
    protected $order;

    /**
     * Create a new message instance.
     *
     * @param  \App\Models\Order  $order
     * @return void
     */
    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    /**
     * Get the message content definition.
     *
     * @return \Illuminate\Mail\Mailables\Content
     */
    public function content()
    {
        return new Content(
            view: 'emails.orders.shipped',
            with: [
                'orderName' => $this->order->name,
                'orderPrice' => $this->order->price,
            ],
        );
    }
}
```

`with` 메서드를 통해 데이터가 전달되면, 뷰에서는 다른 Blade 템플릿 데이터와 마찬가지로 변수처럼 사용할 수 있습니다.

```
<div>
    Price: {{ $orderPrice }}
</div>
```

<a name="attachments"></a>
### 첨부 파일

이메일에 첨부 파일을 추가하려면, 메일러블 클래스의 `attachments` 메서드에서 반환하는 배열에 첨부 정보를 추가하면 됩니다. 먼저, `Attachment` 클래스의 `fromPath` 메서드에 파일 경로를 제공해 첨부 파일을 추가할 수 있습니다.

```
use Illuminate\Mail\Mailables\Attachment;

/**
 * Get the attachments for the message.
 *
 * @return \Illuminate\Mail\Mailables\Attachment[]
 */
public function attachments()
{
    return [
        Attachment::fromPath('/path/to/file'),
    ];
}
```

파일을 첨부할 때, 첨부파일의 표시 이름이나 MIME 타입을 `as` 및 `withMime` 메서드를 통해 지정할 수도 있습니다.

```
/**
 * Get the attachments for the message.
 *
 * @return \Illuminate\Mail\Mailables\Attachment[]
 */
public function attachments()
{
    return [
        Attachment::fromPath('/path/to/file')
                ->as('name.pdf')
                ->withMime('application/pdf'),
    ];
}
```

<a name="attaching-files-from-disk"></a>
#### 스토리지 디스크에서 파일 첨부하기

[파일시스템 디스크](/docs/9.x/filesystem)에 파일을 저장한 경우, `fromStorage` 첨부 방식으로 해당 파일을 이메일에 첨부할 수 있습니다.

```
/**
 * Get the attachments for the message.
 *
 * @return \Illuminate\Mail\Mailables\Attachment[]
 */
public function attachments()
{
    return [
        Attachment::fromStorage('/path/to/file'),
    ];
}
```

물론, 첨부 파일의 이름 및 MIME 타입 지정도 가능합니다.

```
/**
 * Get the attachments for the message.
 *
 * @return \Illuminate\Mail\Mailables\Attachment[]
 */
public function attachments()
{
    return [
        Attachment::fromStorage('/path/to/file')
                ->as('name.pdf')
                ->withMime('application/pdf'),
    ];
}
```

기본 디스크 이외의 저장소에서 첨부 파일을 가져오려면, `fromStorageDisk` 메서드를 사용할 수 있습니다.

```
/**
 * Get the attachments for the message.
 *
 * @return \Illuminate\Mail\Mailables\Attachment[]
 */
public function attachments()
{
    return [
        Attachment::fromStorageDisk('s3', '/path/to/file')
                ->as('name.pdf')
                ->withMime('application/pdf'),
    ];
}
```

<a name="raw-data-attachments"></a>
#### 원시 데이터 첨부하기

`fromData` 첨부 메서드를 사용하면, 바이트 문자열 등의 원시 데이터를 첨부 파일로 추가할 수 있습니다. 예를 들어, 메모리에서 PDF를 생성해 파일로 저장하지 않고 즉시 이메일에 첨부해야 할 때 이 방법을 사용할 수 있습니다. `fromData`는 첨부할 원시 데이터를 반환하는 클로저 함수와, 첨부 파일의 이름을 인자로 받습니다.

```
/**
 * Get the attachments for the message.
 *
 * @return \Illuminate\Mail\Mailables\Attachment[]
 */
public function attachments()
{
    return [
        Attachment::fromData(fn () => $this->pdf, 'Report.pdf')
                ->withMime('application/pdf'),
    ];
}
```

<a name="inline-attachments"></a>
### 인라인 첨부

이메일에 이미지를 인라인으로 삽입하는 작업은 일반적으로 번거롭습니다. 그러나 라라벨은 이미지를 첨부하고 인라인으로 삽입하는 간편한 방법을 제공합니다. 인라인 이미지를 삽입하려면, 이메일 템플릿 내에서 `$message` 변수의 `embed` 메서드를 사용하세요. `$message` 변수는 모든 이메일 템플릿에서 자동으로 사용할 수 있으므로 별도의 전달 작업은 필요 없습니다.

```blade
<body>
    Here is an image:

    <img src="{{ $message- />embed($pathToImage) }}">
</body>
```

> [!WARNING]
> `$message` 변수는 텍스트 전용(plain-text) 메시지 템플릿에서는 사용할 수 없습니다. 이는 plain-text 메시지가 인라인 첨부를 지원하지 않기 때문입니다.

<a name="embedding-raw-data-attachments"></a>
#### 원시 데이터 인라인 첨부

이미 문자열 형태로 준비된 이미지 데이터를 이메일 템플릿에 인라인으로 삽입하려는 경우, `$message` 변수의 `embedData` 메서드를 사용할 수 있습니다. 이때, 임베드될 이미지의 파일 이름도 함께 지정해주어야 합니다.

```blade
<body>
    Here is an image from raw data:

    <img src="{{ $message- />embedData($data, 'example-image.jpg') }}">
</body>
```

<a name="attachable-objects"></a>

### 첨부 가능한 객체(Attachable Objects)

단순히 문자열 경로를 사용해 메시지에 파일을 첨부하는 것이 보통은 충분하지만, 애플리케이션에서 첨부하려는 엔티티가 클래스로 표현되어 있는 경우도 많습니다. 예를 들어, 애플리케이션에서 사진을 메시지에 첨부하려 할 때, 해당 사진을 나타내는 `Photo` 모델이 있을 수 있습니다. 이럴 때는, `Photo` 모델을 `attach` 메서드에 바로 전달할 수 있다면 훨씬 편리할 것입니다. 첨부 가능한 객체(Attachable Object)는 바로 이러한 기능을 제공합니다.

먼저, 메시지에 첨부가 가능한 객체에 `Illuminate\Contracts\Mail\Attachable` 인터페이스를 구현하면 됩니다. 이 인터페이스는 클래스에 `toMailAttachment` 메서드를 정의하도록 요구하며, 이 메서드는 `Illuminate\Mail\Attachment` 인스턴스를 반환해야 합니다.

```
<?php

namespace App\Models;

use Illuminate\Contracts\Mail\Attachable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Mail\Attachment;

class Photo extends Model implements Attachable
{
    /**
     * 모델의 첨부 파일 표현을 반환합니다.
     *
     * @return \Illuminate\Mail\Attachment
     */
    public function toMailAttachment()
    {
        return Attachment::fromPath('/path/to/file');
    }
}
```

첨부 가능한 객체를 정의한 뒤에는, 이메일 메시지를 작성할 때 `attachments` 메서드에서 해당 객체의 인스턴스를 반환할 수 있습니다.

```
/**
 * 메시지의 첨부 파일을 가져옵니다.
 *
 * @return array
 */
public function attachments()
{
    return [$this->photo];
}
```

물론, 첨부 파일 데이터가 Amazon S3와 같은 원격 파일 저장소에 있을 수도 있습니다. 라라벨에서는 애플리케이션의 [파일 시스템 디스크](/docs/9.x/filesystem)에 저장된 데이터로부터도 첨부 파일 인스턴스를 생성할 수 있도록 지원합니다.

```
// 기본 스토리지 디스크의 파일로부터 첨부 파일을 생성합니다...
return Attachment::fromStorage($this->path);

// 특정 디스크의 파일로부터 첨부 파일을 생성합니다...
return Attachment::fromStorageDisk('backblaze', $this->path);
```

또한, 메모리에 있는 데이터로부터 첨부 파일 인스턴스를 만들 수도 있습니다. 이를 위해서는 `fromData` 메서드에 클로저를 전달하면 됩니다. 이 클로저는 첨부 파일의 원시 데이터를 반환해야 합니다.

```
return Attachment::fromData(fn () => $this->content, 'Photo Name');
```

라라벨에서는 첨부 파일을 커스터마이즈할 수 있는 다양한 메서드도 제공합니다. 예를 들어, `as`와 `withMime` 메서드를 사용하여 파일 이름과 MIME 타입을 지정할 수 있습니다.

```
return Attachment::fromPath('/path/to/file')
        ->as('Photo Name')
        ->withMime('image/jpeg');
```

<a name="headers"></a>
### 헤더(Headers)

때때로, 발신 메시지에 추가적인 헤더를 첨부해야 할 수도 있습니다. 예를 들어, 사용자 정의 `Message-Id`나 기타 임의의 텍스트 헤더를 설정해야 할 수 있습니다.

이를 위해서는 메일러블(mailable)에 `headers` 메서드를 정의하면 됩니다. 이 `headers` 메서드는 `Illuminate\Mail\Mailables\Headers` 인스턴스를 반환해야 합니다. 이 클래스는 `messageId`, `references`, `text` 파라미터를 받을 수 있으며, 메시지에 필요한 파라미터만 지정하여 사용할 수 있습니다.

```
use Illuminate\Mail\Mailables\Headers;

/**
 * 메시지의 헤더를 반환합니다.
 *
 * @return \Illuminate\Mail\Mailables\Headers
 */
public function headers()
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
### 태그 & 메타데이터(Tags & Metadata)

Mailgun, Postmark 같은 일부 서드파티 이메일 서비스에서는 메시지 "태그" 및 "메타데이터" 기능을 지원합니다. 이 기능은 애플리케이션이 발송한 이메일을 그룹화하거나 추적할 때 활용됩니다. 이메일 메시지에는 `Envelope` 정의를 통해 태그와 메타데이터를 추가할 수 있습니다.

```
use Illuminate\Mail\Mailables\Envelope;

/**
 * 메시지의 envelope 정보를 반환합니다.
 *
 * @return \Illuminate\Mail\Mailables\Envelope
 */
public function envelope()
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

Mailgun 드라이버를 사용하는 경우, [tags](https://documentation.mailgun.com/en/latest/user_manual.html#tagging-1)와 [metadata](https://documentation.mailgun.com/en/latest/user_manual.html#attaching-data-to-messages)에 대한 자세한 내용은 Mailgun 공식 문서를 참고하시기 바랍니다. 마찬가지로, Postmark의 [tags](https://postmarkapp.com/blog/tags-support-for-smtp) 및 [metadata](https://postmarkapp.com/support/article/1125-custom-metadata-faq) 기능에 대한 정보는 Postmark 문서를 참고하실 수 있습니다.

Amazon SES를 사용하여 이메일을 보내는 경우, 메시지에 [SES "tags"](https://docs.aws.amazon.com/ses/latest/APIReference/API_MessageTag.html)를 첨부하려면 `metadata` 메서드를 사용해야 합니다.

<a name="customizing-the-symfony-message"></a>
### Symfony 메시지 커스터마이징

라라벨의 메일 기능은 Symfony Mailer를 기반으로 구현되어 있습니다. 라라벨에서는 메시지 전송 전에 Symfony Message 인스턴스에 접근해 커스터마이징할 수 있는 콜백을 등록할 수 있습니다. 이를 통해 메시지를 발송하기 전에 세부적으로 조작하는 것이 가능합니다. 이 기능을 사용하려면, `Envelope` 정의에 `using` 파라미터를 지정하면 됩니다.

```
use Illuminate\Mail\Mailables\Envelope;
use Symfony\Component\Mime\Email;

/**
 * 메시지의 envelope 정보를 반환합니다.
 *
 * @return \Illuminate\Mail\Mailables\Envelope
 */
public function envelope()
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
## 마크다운 메일러블(Markdown Mailables)

마크다운 메일러블 메시지를 사용하면, [메일 알림](/docs/9.x/notifications#mail-notifications)에 내장된 템플릿과 컴포넌트를 그대로 활용할 수 있습니다. 메시지를 마크다운(Markdown)으로 작성할 수 있기 때문에, 라라벨은 아름답고 반응형인 HTML 템플릿을 자동으로 렌더링해주며, 동시에 단순 텍스트 버전도 자동으로 생성합니다.

<a name="generating-markdown-mailables"></a>
### 마크다운 메일러블 생성하기

마크다운 템플릿이 포함된 메일러블 클래스를 생성하려면, Artisan의 `make:mail` 명령어에서 `--markdown` 옵션을 사용하면 됩니다.

```shell
php artisan make:mail OrderShipped --markdown=emails.orders.shipped
```

그리고, 메일러블의 `content` 메서드에서 `Content` 정의를 작성할 때에는 `view` 파라미터 대신 `markdown` 파라미터를 사용합니다.

```
use Illuminate\Mail\Mailables\Content;

/**
 * 메시지의 컨텐츠 정의를 반환합니다.
 *
 * @return \Illuminate\Mail\Mailables\Content
 */
public function content()
{
    return new Content(
        markdown: 'emails.orders.shipped',
        with: [
            'url' => $this->orderUrl,
        ],
    );
}
```

<a name="writing-markdown-messages"></a>
### 마크다운 메시지 작성하기

마크다운 메일러블은 Blade 컴포넌트와 마크다운 문법을 조합하여 이메일 메시지를 쉽고 구조적으로 작성할 수 있도록 해주며, 라라벨의 내장 UI 컴포넌트도 그대로 활용할 수 있습니다.

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
> 마크다운 이메일을 작성할 때 들여쓰기를 과도하게 사용하지 마십시오. 마크다운 표준에 따라, 마크다운 파서는 들여쓰기된 내용을 코드 블록으로 렌더링합니다.

<a name="button-component"></a>
#### 버튼 컴포넌트(Button Component)

버튼 컴포넌트는 가운데에 정렬된 버튼 링크를 렌더링합니다. 이 컴포넌트는 `url`과 선택적으로 `color`라는 두 가지 인자를 받을 수 있습니다. 지원되는 색상은 `primary`, `success`, `error` 입니다. 메시지에 원하는 만큼 여러 개의 버튼 컴포넌트를 추가할 수도 있습니다.

```blade
<x-mail::button :url="$url" color="success">
View Order
</x-mail::button>
```

<a name="panel-component"></a>
#### 패널 컴포넌트(Panel Component)

패널 컴포넌트는 주어진 텍스트 블록을 일반 메시지와는 약간 다른 배경색의 패널 안에 감싸 보여줍니다. 이를 통해 특정 텍스트 블록에 시각적으로 더 큰 주목성을 줄 수 있습니다.

```blade
<x-mail::panel>
This is the panel content.
</x-mail::panel>
```

<a name="table-component"></a>
#### 테이블 컴포넌트(Table Component)

테이블 컴포넌트는 마크다운 테이블을 HTML 테이블로 변환해 렌더링해줍니다. 이 컴포넌트는 마크다운 테이블을 콘텐츠로 전달받습니다. 테이블의 컬럼 정렬은 마크다운 표준 테이블 정렬 문법을 그대로 지원합니다.

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

마크다운 메일 컴포넌트 전체를 자신의 애플리케이션으로 내보내서 커스터마이징할 수 있습니다. 컴포넌트를 내보내려면, `laravel-mail` 에셋 태그로 `vendor:publish` Artisan 명령어를 실행하세요.

```shell
php artisan vendor:publish --tag=laravel-mail
```

이 명령어를 실행하면 `resources/views/vendor/mail` 디렉터리에 마크다운 메일 컴포넌트가 복사됩니다. `mail` 디렉터리에는 각각의 컴포넌트에 대응하는 `html`과 `text` 디렉터리가 포함되어 있습니다. 이 파일들은 자유롭게 수정이 가능합니다.

<a name="customizing-the-css"></a>
#### CSS 커스터마이징

컴포넌트를 내보낸 뒤에는 `resources/views/vendor/mail/html/themes` 디렉터리에 `default.css` 파일이 생성됩니다. 이 파일의 CSS를 커스터마이즈하면, 해당 스타일이 마크다운 메일 메시지의 HTML 버전에 자동으로 인라인 스타일로 적용됩니다.

라라벨의 마크다운 컴포넌트에 대해 완전히 새로운 테마를 만들고 싶다면, `html/themes` 디렉터리에 CSS 파일을 추가하면 됩니다. 파일의 이름을 정하고 저장한 뒤, 애플리케이션의 `config/mail.php` 설정 파일에서 `theme` 옵션을 새 테마명으로 변경해 적용할 수 있습니다.

특정 메일러블에만 사용하는 테마를 지정하고자 한다면, 메일러블 클래스의 `$theme` 속성에 원하는 테마명을 할당하면 됩니다.

<a name="sending-mail"></a>
## 메일 발송하기

메시지를 발송하려면 `Mail` [파사드](/docs/9.x/facades)의 `to` 메서드를 사용합니다. `to` 메서드는 이메일 주소, 사용자 인스턴스, 또는 사용자 컬렉션을 받을 수 있습니다. 객체 또는 객체의 컬렉션을 전달하면, 메일러는 객체의 `email`과 `name` 속성을 자동으로 사용하여 수신자를 결정하므로, 이 속성들이 객체에 존재하는지 확인해야 합니다. 수신자를 지정한 후에는, 메일러블 클래스의 인스턴스를 `send` 메서드에 전달합니다.

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Mail\OrderShipped;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class OrderShipmentController extends Controller
{
    /**
     * 주어진 주문을 배송 처리합니다.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $order = Order::findOrFail($request->order_id);

        // 주문을 배송 처리...

        Mail::to($request->user())->send(new OrderShipped($order));
    }
}
```

메일 발송 시 반드시 "to" 수신자만 지정해야 하는 것은 아닙니다. "to", "cc", "bcc" 수신자를 각각의 메서드로 체이닝하여 원하는 대로 지정할 수 있습니다.

```
Mail::to($request->user())
    ->cc($moreUsers)
    ->bcc($evenMoreUsers)
    ->send(new OrderShipped($order));
```

<a name="looping-over-recipients"></a>
#### 수신자 반복 처리하기

가끔 배열 형태로 여러 수신자에게 메일러블을 반복적으로 보내야 하는 경우가 있습니다. 그러나 `to` 메서드는 메일러블의 수신자 리스트에 이메일 주소를 누적하여 추가하기 때문에, 루프를 돌면 이전 수신자들에게도 계속 메일이 중복으로 발송됩니다. 따라서, 매 반복마다 새로운 메일러블 인스턴스를 생성해서 사용해야 합니다.

```
foreach (['taylor@example.com', 'dries@example.com'] as $recipient) {
    Mail::to($recipient)->send(new OrderShipped($order));
}
```

<a name="sending-mail-via-a-specific-mailer"></a>
#### 특정 메일러로 메일 발송하기

기본적으로 라라벨은 애플리케이션의 `mail` 설정 파일에서 `default`로 지정된 메일러를 사용해 이메일을 발송합니다. 하지만, `mailer` 메서드를 이용하여 특정 메일러 설정으로 메시지를 보낼 수도 있습니다.

```
Mail::mailer('postmark')
        ->to($request->user())
        ->send(new OrderShipped($order));
```

<a name="queueing-mail"></a>
### 메일 큐잉(Queueing Mail)

<a name="queueing-a-mail-message"></a>
#### 메일 메시지 큐잉하기

이메일 발송은 애플리케이션의 응답 속도에 악영향을 줄 수 있으므로, 많은 개발자들이 이메일을 백그라운드에서 전송(큐잉)하는 방식을 선호합니다. 라라벨은 [통합 큐 API](/docs/9.x/queues)를 통해 이를 쉽게 처리할 수 있도록 해줍니다. 메일 메시지를 큐에 적재하려면, 수신자를 지정한 후 `Mail` 파사드의 `queue` 메서드를 사용하면 됩니다.

```
Mail::to($request->user())
    ->cc($moreUsers)
    ->bcc($evenMoreUsers)
    ->queue(new OrderShipped($order));
```

이 메서드는 메일 메시지를 백그라운드에서 발송할 수 있도록 자동으로 큐에 작업을 넣어줍니다. 이 기능을 사용하기 전에 큐 설정을 반드시 [구성](/docs/9.x/queues)해야 합니다.

<a name="delayed-message-queueing"></a>
#### 발송 지연(Delayed Message Queueing)

큐잉된 이메일 메시지의 발송을 지연시키고자 한다면, `later` 메서드를 사용할 수 있습니다. 이 메서드의 첫 번째 인자로는 메시지 발송 시점을 나타내는 `DateTime` 인스턴스를 넘깁니다.

```
Mail::to($request->user())
    ->cc($moreUsers)
    ->bcc($evenMoreUsers)
    ->later(now()->addMinutes(10), new OrderShipped($order));
```

<a name="pushing-to-specific-queues"></a>
#### 특정 큐에 적재하기

`make:mail` 명령어로 생성되는 모든 메일러블 클래스는 `Illuminate\Bus\Queueable` 트레이트를 사용하므로, 모든 메일러블 인스턴스에서는 `onQueue`와 `onConnection` 메서드를 호출하여 사용자가 원하는 커넥션 및 큐 이름을 지정할 수 있습니다.

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
#### 기본으로 큐잉하기

항상 큐잉하도록 하고 싶은 메일러블 클래스가 있다면, 클래스에 `ShouldQueue` 계약(interface)을 구현하면 됩니다. 이 경우, `send` 메서드를 이용해 메일을 발송해도 큐잉 작업이 이루어집니다.

```
use Illuminate\Contracts\Queue\ShouldQueue;

class OrderShipped extends Mailable implements ShouldQueue
{
    //
}
```

<a name="queued-mailables-and-database-transactions"></a>
#### 큐잉된 메일러블과 DB 트랜잭션

큐잉된 메일러블이 데이터베이스 트랜잭션 안에서 디스패치 될 때, 큐가 해당 트랜잭션이 커밋되기 전에 작업을 처리할 수 있습니다. 이럴 경우, 트랜잭션 도중 변경한 모델이나 레코드가 아직 데이터베이스에 반영되지 않은 상태일 수 있습니다. 또한, 트랜잭션 내에서 생성된 모델이나 레코드는 아예 존재하지 않을 수도 있습니다. 메일러블이 이러한 모델에 의존하고 있다면, 작업 실행 시 예기치 않은 오류가 발생할 수 있습니다.

큐 커넥션의 `after_commit` 설정 옵션이 `false`일 경우에도, 해당 메일러블이 모든 DB 트랜잭션의 커밋 이후에 디스패치되도록 하려면 메일 메시지를 보낼 때 `afterCommit` 메서드를 호출하면 됩니다.

```
Mail::to($request->user())->send(
    (new OrderShipped($order))->afterCommit()
);
```

또한, 메일러블의 생성자에서 `afterCommit` 메서드를 호출할 수도 있습니다.

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
     * 새로운 메시지 인스턴스를 생성합니다.
     *
     * @return void
     */
    public function __construct()
    {
        $this->afterCommit();
    }
}
```

> [!NOTE]
> 이러한 문제 상황에서의 대처 방법을 더 자세히 알아보고 싶다면, [큐 작업과 데이터베이스 트랜잭션](/docs/9.x/queues#jobs-and-database-transactions) 관련 문서를 참고하시기 바랍니다.

<a name="rendering-mailables"></a>
## 메일러블 렌더링(Rendering Mailables)

가끔 메일을 실제로 보내지는 않고, 메일러블의 HTML 콘텐츠만 따로 추출하고 싶을 때가 있습니다. 이때는 메일러블의 `render` 메서드를 호출하면 됩니다. 이 메서드는 메일러블을 평가한 HTML 콘텐츠를 문자열로 반환합니다.

```
use App\Mail\InvoicePaid;
use App\Models\Invoice;

$invoice = Invoice::find(1);

return (new InvoicePaid($invoice))->render();
```

<a name="previewing-mailables-in-the-browser"></a>
### 브라우저에서 메일러블 미리보기

메일러블의 템플릿을 디자인할 때, 일반 Blade 템플릿처럼 미리보기를 브라우저에서 해보고 싶다면, 라라벨에서는 라우트 클로저 또는 컨트롤러에서 메일러블 인스턴스를 직접 반환할 수 있습니다. 이렇게 하면, 해당 메일러블이 렌더링되어 브라우저에 표시되므로 실제 이메일로 보내지 않고도 디자인을 빠르게 확인할 수 있습니다.

```
Route::get('/mailable', function () {
    $invoice = App\Models\Invoice::find(1);

    return new App\Mail\InvoicePaid($invoice);
});
```

> [!WARNING]
> [인라인 첨부 파일](#inline-attachments)은 브라우저에서 미리보기 시 렌더링되지 않습니다. 이런 메일러블을 확인하려면, [Mailpit](https://github.com/axllent/mailpit)이나 [HELO](https://usehelo.com) 같은 이메일 테스트 도구로 발송해서 확인해야 합니다.

<a name="localizing-mailables"></a>
## 메일러블 현지화(Localizing Mailables)

라라벨에서는 현재 요청의 로케일과 무관하게 원하는 로케일로 메일러블을 보낼 수 있으며, 메일이 큐에 들어가더라도 해당 로케일이 그대로 유지됩니다.

이 기능을 사용하려면, `Mail` 파사드의 `locale` 메서드로 원하는 언어를 지정하면 됩니다. 메시지의 템플릿을 평가하는 동안 애플리케이션의 로케일이 지정된 언어로 변경되고, 평가가 끝나면 원래 로케일로 복원됩니다.

```
Mail::to($request->user())->locale('es')->send(
    new OrderShipped($order)
);
```

<a name="user-preferred-locales"></a>
### 사용자의 선호 로케일(User Preferred Locales)

애플리케이션에서 사용자마다 선호하는 로케일을 저장할 수도 있습니다. 하나 이상의 모델에 `HasLocalePreference` 계약을 구현하면, 라라벨은 메일을 보낼 때 이 로케일을 자동으로 사용합니다.

```
use Illuminate\Contracts\Translation\HasLocalePreference;

class User extends Model implements HasLocalePreference
{
    /**
     * 사용자의 선호 로케일을 반환합니다.
     *
     * @return string
     */
    public function preferredLocale()
    {
        return $this->locale;
    }
}
```

이 인터페이스를 구현하면, 라라벨은 해당 모델에 메일이나 알림을 발송할 때 자동으로 선호 로케일을 사용합니다. 별도로 `locale` 메서드를 호출할 필요가 없습니다.

```
Mail::to($request->user())->send(new OrderShipped($order));
```

<a name="testing-mailables"></a>
## 메일러블 테스트(Testings Mailables)

라라벨에서는 메일러블 구조를 점검할 수 있는 다양한 메서드를 제공합니다. 또한, 메일러블에 원하는 콘텐츠가 포함되어 있는지 손쉽게 테스트할 수 있도록 여러 편의 메서드도 제공하고 있습니다. 대표적인 메서드는 다음과 같습니다: `assertSeeInHtml`, `assertDontSeeInHtml`, `assertSeeInOrderInHtml`, `assertSeeInText`, `assertDontSeeInText`, `assertSeeInOrderInText`, `assertHasAttachment`, `assertHasAttachedData`, `assertHasAttachmentFromStorage`, `assertHasAttachmentFromStorageDisk`.

이 중 "HTML" 관련 assertion은 메일러블의 HTML 버전에 특정 문자열이 포함되어 있는지를 확인하며, "text" 관련 assertion은 텍스트 버전에 해당 문자열이 포함되어 있는지를 확인합니다.

```
use App\Mail\InvoicePaid;
use App\Models\User;

public function test_mailable_content()
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
#### 메일러블 발송 테스트

메일러블의 콘텐츠 테스트는, 특정 수신자에게 메일러블이 실제로 "발송"되었는지 확인하는 테스트와는 별도로 진행하는 것이 좋습니다. 메일 발송 여부를 테스트하는 방법은 [Mail fake](/docs/9.x/mocking#mail-fake) 문서를 참고하세요.

<a name="mail-and-local-development"></a>
## 메일과 로컬 개발(Mail & Local Development)

이메일을 발송하는 애플리케이션을 개발할 때는 실제로 운영 환경의 메일 주소로 메일이 발송되는 것을 피하고 싶을 것입니다. 라라벨은 로컬 개발 환경에서 실제 메일이 전송되지 않도록 다양한 방법을 제공합니다.

<a name="log-driver"></a>
#### 로그 드라이버(Log Driver)

`log` 메일 드라이버를 사용하면, 이메일을 실제로 발송하는 대신 모든 이메일 메시지를 로그 파일에 기록하여 확인할 수 있습니다. 이 드라이버는 주로 로컬 개발 환경에서만 사용됩니다. 환경별로 애플리케이션을 설정하는 방법에 대한 자세한 정보는 [설정 관련 문서](/docs/9.x/configuration#environment-configuration)를 참고하세요.

<a name="mailtrap"></a>

#### HELO / Mailtrap / Mailpit

또 다른 방법으로, [HELO](https://usehelo.com)나 [Mailtrap](https://mailtrap.io)과 같은 서비스를 이용하고, `smtp` 드라이버를 사용해 이메일 메시지를 "더미" 메일박스로 전송할 수 있습니다. 이렇게 하면 실제 이메일 클라이언트에서 보낼 메일을 직접 확인할 수 있는 장점이 있습니다. Mailtrap의 메시지 뷰어에서 최종 이메일을 상세히 점검할 수 있다는 것이 이 방법의 강점입니다.

[Laravel Sail](/docs/9.x/sail)을 사용하는 경우에는 [Mailpit](https://github.com/axllent/mailpit)을 활용해 메시지를 미리 볼 수 있습니다. Sail이 실행 중이면 `http://localhost:8025`에서 Mailpit 인터페이스에 접속할 수 있습니다.

<a name="using-a-global-to-address"></a>
#### 글로벌 `to` 주소 사용하기

마지막으로, `Mail` 파사드가 제공하는 `alwaysTo` 메서드를 호출해서 전역 "to" 주소를 지정할 수 있습니다. 보통 이 메서드는 애플리케이션의 서비스 프로바이더 중 하나의 `boot` 메서드에서 호출합니다.

```
use Illuminate\Support\Facades\Mail;

/**
 * Bootstrap any application services.
 *
 * @return void
 */
public function boot()
{
    if ($this->app->environment('local')) {
        Mail::alwaysTo('taylor@example.com');
    }
}
```

<a name="events"></a>
## 이벤트

라라벨은 이메일 메시지를 발송하는 과정에서 두 가지 이벤트를 발생시킵니다. 메시지 발송 전에 `MessageSending` 이벤트가 발생하며, 메시지 발송 후에는 `MessageSent` 이벤트가 발생합니다. 이 이벤트들은 *메시지가 실제로 발송될 때* 발생한다는 점에 유의하십시오. 즉, 큐에 등록할 때가 아니라 실제 메일이 전송되는 시점에 발생합니다. 이 이벤트에 리스너를 등록하려면 `App\Providers\EventServiceProvider` 서비스 프로바이더에서 설정하면 됩니다.

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
## 커스텀 전송 방식(Transport) 만들기

라라벨은 다양한 메일 전송 방식을 기본으로 지원하지만, 라라벨에서 기본 제공하지 않는 서비스로 이메일을 발송하고 싶을 때는 직접 전송 방식을 만들어 사용할 수도 있습니다. 먼저, `Symfony\Component\Mailer\Transport\AbstractTransport` 클래스를 상속해서 새로운 클래스를 정의합니다. 그리고 이 전송 방식에 `doSend`와 `__toString()` 메서드를 구현해야 합니다.

```
use MailchimpTransactional\ApiClient;
use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mailer\Transport\AbstractTransport;
use Symfony\Component\Mime\MessageConverter;

class MailchimpTransport extends AbstractTransport
{
    /**
     * The Mailchimp API client.
     *
     * @var \MailchimpTransactional\ApiClient
     */
    protected $client;

    /**
     * Create a new Mailchimp transport instance.
     *
     * @param  \MailchimpTransactional\ApiClient  $client
     * @return void
     */
    public function __construct(ApiClient $client)
    {
        parent::__construct();
        
        $this->client = $client;
    }

    /**
     * {@inheritDoc}
     */
    protected function doSend(SentMessage $message): void
    {
        $email = MessageConverter::toEmail($message->getOriginalMessage());

        $this->client->messages->send(['message' => [
            'from_email' => $email->getFrom(),
            'to' => collect($email->getTo())->map(function ($email) {
                return ['email' => $email->getAddress(), 'type' => 'to'];
            })->all(),
            'subject' => $email->getSubject(),
            'text' => $email->getTextBody(),
        ]]);
    }

    /**
     * Get the string representation of the transport.
     *
     * @return string
     */
    public function __toString(): string
    {
        return 'mailchimp';
    }
}
```

커스텀 전송 방식을 구현했다면, `Mail` 파사드의 `extend` 메서드로 해당 전송 방식을 등록할 수 있습니다. 일반적으로 애플리케이션의 `AppServiceProvider` 서비스 프로바이더의 `boot` 메서드 안에서 등록하면 됩니다. `extend` 메서드에 전달하는 콜백의 인자로는 애플리케이션의 `config/mail.php`에 정의된 메일러 설정 배열이 `$config`로 전달됩니다.

```
use App\Mail\MailchimpTransport;
use Illuminate\Support\Facades\Mail;

/**
 * Bootstrap any application services.
 *
 * @return void
 */
public function boot()
{
    Mail::extend('mailchimp', function (array $config = []) {
        return new MailchimpTransport(/* ... */);
    });
}
```

커스텀 전송 방식이 정의되고 등록되었다면, 애플리케이션의 `config/mail.php` 설정 파일에 아래와 같이 새로운 메일러 정의를 추가하고, 해당 전송 방식을 사용할 수 있습니다.

```
'mailchimp' => [
    'transport' => 'mailchimp',
    // ...
],
```

<a name="additional-symfony-transports"></a>
### 추가적인 Symfony 전송 방식 지원

라라벨은 Mailgun, Postmark와 같은 일부 Symfony가 관리하는 메일 전송 방식도 지원합니다. 추가로, 더 다양한 Symfony 메일러 브릿지를 라라벨에서 사용하고 싶다면 필요한 Symfony 메일러 패키지를 Composer로 설치하고 라라벨에 등록할 수 있습니다. 예를 들어 "Sendinblue" Symfony 메일러를 설치하고 등록하는 방법은 다음과 같습니다.

```none
composer require symfony/sendinblue-mailer symfony/http-client
```

Sendinblue 메일러 패키지를 설치했다면, 애플리케이션의 `services` 설정 파일에 Sendinblue API 자격증명 항목을 추가합니다.

```
'sendinblue' => [
    'key' => 'your-api-key',
],
```

이제 `Mail` 파사드의 `extend` 메서드를 이용해 새로운 전송 방식을 라라벨에 등록합니다. 일반적으로 서비스 프로바이더의 `boot` 메서드에서 수행하면 됩니다.

```
use Illuminate\Support\Facades\Mail;
use Symfony\Component\Mailer\Bridge\Sendinblue\Transport\SendinblueTransportFactory;
use Symfony\Component\Mailer\Transport\Dsn;

/**
 * Bootstrap any application services.
 *
 * @return void
 */
public function boot()
{
    Mail::extend('sendinblue', function () {
        return (new SendinblueTransportFactory)->create(
            new Dsn(
                'sendinblue+api',
                'default',
                config('services.sendinblue.key')
            )
        );
    });
}
```

전송 방식이 등록되었으면, `config/mail.php` 파일에 다음과 같이 새로운 메일러를 정의하고 사용할 수 있습니다.

```
'sendinblue' => [
    'transport' => 'sendinblue',
    // ...
],
```