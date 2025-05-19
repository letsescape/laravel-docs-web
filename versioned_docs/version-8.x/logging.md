# 로깅 (Logging)

- [소개](#introduction)
- [설정](#configuration)
    - [사용 가능한 채널 드라이버](#available-channel-drivers)
    - [채널 사전 준비 사항](#channel-prerequisites)
    - [폐기 예정 경고 로깅](#logging-deprecation-warnings)
- [로그 스택 구축하기](#building-log-stacks)
- [로그 메시지 작성하기](#writing-log-messages)
    - [컨텍스트 정보 전달](#contextual-information)
    - [특정 채널로 로그 남기기](#writing-to-specific-channels)
- [Monolog 채널 커스터마이징](#monolog-channel-customization)
    - [채널을 위한 Monolog 커스터마이징](#customizing-monolog-for-channels)
    - [Monolog 핸들러 채널 생성하기](#creating-monolog-handler-channels)
    - [팩토리를 통한 커스텀 채널 생성](#creating-custom-channels-via-factories)

<a name="introduction"></a>
## 소개

애플리케이션 내부에서 일어나는 다양한 상황을 좀 더 쉽게 파악할 수 있도록, 라라벨은 강력한 로깅 서비스를 제공합니다. 이를 통해 파일, 시스템 에러 로그, 심지어 Slack 등 다양한 곳에 로그 메시지를 남길 수 있어 팀원 전체에 알림을 줄 수도 있습니다.

라라벨의 로깅은 "채널(channel)"을 기반으로 동작합니다. 각 채널은 로그 정보를 기록하는 특정 방식을 나타냅니다. 예를 들어, `single` 채널은 모든 로그를 하나의 로그 파일에 기록하고, `slack` 채널은 로그 메시지를 Slack으로 전송합니다. 로그 메시지는 심각도에 따라 여러 채널에 동시에 기록될 수도 있습니다.

내부적으로 라라벨은 [Monolog](https://github.com/Seldaek/monolog) 라이브러리를 활용하여 다양한 강력한 로그 핸들러를 지원합니다. 라라벨은 이러한 핸들러들을 손쉽게 설정할 수 있도록 도와주며, 필요에 따라 자유롭게 조합하여 애플리케이션의 로그 처리 방식을 원하는 대로 맞출 수 있습니다.

<a name="configuration"></a>
## 설정

애플리케이션의 로깅 동작을 제어하는 모든 설정 옵션은 `config/logging.php` 설정 파일에 정의되어 있습니다. 이 파일을 통해 사용 중인 로그 채널을 구성할 수 있으니, 각 채널과 옵션을 꼭 확인해 보는 것이 좋습니다. 아래에서 자주 사용하는 몇 가지 주요 옵션을 살펴보겠습니다.

기본적으로 라라벨은 로그 메시지를 기록할 때 `stack` 채널을 사용합니다. `stack` 채널은 여러 로그 채널을 하나로 묶어주는 역할을 합니다. 스택(stack) 구성에 대한 상세 내용은 [아래 문서](#building-log-stacks)를 참고하세요.

<a name="configuring-the-channel-name"></a>
#### 채널 이름 설정하기

기본적으로 Monolog은 현재 환경(`production`이나 `local` 등)에 맞는 "채널 이름"으로 인스턴스가 생성됩니다. 이 값을 바꾸고 싶다면, 해당 채널 설정에 `name` 옵션을 추가하면 됩니다:

```
'stack' => [
    'driver' => 'stack',
    'name' => 'channel-name',
    'channels' => ['single', 'slack'],
],
```

<a name="available-channel-drivers"></a>
### 사용 가능한 채널 드라이버

각 로그 채널은 "드라이버"에 의해 구동됩니다. 드라이버는 로그 메시지가 어떤 방식, 어디에 저장될지 결정합니다. 모든 라라벨 애플리케이션에서 사용 가능한 로그 채널 드라이버는 아래와 같습니다. 대부분의 드라이버에 대한 설정 예시는 이미 `config/logging.php` 파일에 포함되어 있으니, 이 파일을 꼭 확인해 보세요:

이름 | 설명
------------- | -------------
`custom` | 지정한 팩토리를 호출하여 채널을 생성하는 드라이버
`daily` | 매일 로그 파일을 분리해 저장하는 Monolog의 `RotatingFileHandler` 기반 드라이버
`errorlog` | 시스템 에러 로그에 기록하는 Monolog의 `ErrorLogHandler` 기반 드라이버
`monolog` | 다양한 Monolog 핸들러를 사용할 수 있는 Monolog 팩토리 드라이버
`null` | 모든 로그 메시지를 폐기하는 드라이버
`papertrail` | Monolog의 `SyslogUdpHandler` 기반 드라이버 (Papertrail 서비스 연동)
`single` | 단일 파일 또는 경로에 로그를 저장하는 채널 (`StreamHandler`)
`slack` | Monolog의 `SlackWebhookHandler`를 사용하는 드라이버로 Slack에 로그를 전송
`stack` | 여러 채널을 하나로 묶어주는 래퍼 채널
`syslog` | 시스템 로그에 기록하는 Monolog의 `SyslogHandler` 기반 드라이버

> [!TIP]
> `monolog`과 `custom` 드라이버에 대한 고급 채널 커스터마이징은 [아래 문서](#monolog-channel-customization)에서 더 자세히 다루고 있으니 참고하시기 바랍니다.

<a name="channel-prerequisites"></a>
### 채널 사전 준비 사항

<a name="configuring-the-single-and-daily-channels"></a>
#### Single 및 Daily 채널 설정

`single`과 `daily` 채널은 세 가지 선택적 옵션(`bubble`, `permission`, `locking`)을 지원합니다.

이름 | 설명 | 기본값
------------- | ------------- | -------------
`bubble` | 처리 후 메시지가 다른 채널로 전달(bubble up)될지 여부 | `true`
`locking` | 로그 기록 전 파일 잠금을 시도할지 여부 | `false`
`permission` | 로그 파일의 권한 설정 | `0644`

<a name="configuring-the-papertrail-channel"></a>
#### Papertrail 채널 설정

`papertrail` 채널을 사용하려면 `host`와 `port` 옵션을 필수로 설정해야 합니다. 각 값은 [Papertrail 공식 문서](https://help.papertrailapp.com/kb/configuration/configuring-centralized-logging-from-php-apps/#send-events-from-php-app)에서 확인할 수 있습니다.

<a name="configuring-the-slack-channel"></a>
#### Slack 채널 설정

`slack` 채널을 사용하려면 `url` 설정 값이 필요합니다. 이 URL은 여러분이 Slack 팀용으로 만들어 둔 [incoming webhook](https://slack.com/apps/A0F7XDUAZ-incoming-webhooks) 주소와 일치해야 합니다.

기본적으로 Slack은 `critical` 등급 이상의 로그만 수신합니다. 하지만, `config/logging.php` 설정 파일 내에 있는 Slack 로그 채널의 `level` 값을 조정함으로써 이 기준을 변경할 수 있습니다.

<a name="logging-deprecation-warnings"></a>
### 폐기 예정 경고 로깅

PHP, 라라벨, 그리고 기타 라이브러리는 일부 기능이 더 이상 지원되지 않고, 앞으로 제거될 예정이라는 메시지(Deprecated Warnings)를 종종 제공합니다. 이러한 폐기 예정 경고를 로그로 남기고 싶을 땐, 애플리케이션의 `config/logging.php` 파일에서 원하는 `deprecations` 로그 채널을 지정할 수 있습니다:

```
'deprecations' => env('LOG_DEPRECATIONS_CHANNEL', 'null'),

'channels' => [
    ...
]
```

또는, `deprecations`라는 이름의 로그 채널을 정의할 수도 있습니다. 해당 이름의 로그 채널이 존재하면, 폐기 경고는 항상 이 채널로 기록됩니다:

```
'channels' => [
    'deprecations' => [
        'driver' => 'single',
        'path' => storage_path('logs/php-deprecation-warnings.log'),
    ],
],
```

<a name="building-log-stacks"></a>
## 로그 스택 구축하기

앞서 살펴봤듯이, `stack` 드라이버를 이용하면 여러 채널을 하나의 로그 채널로 편리하게 결합할 수 있습니다. 실제 운영 환경에서 볼 수 있는 구성 예시를 살펴보겠습니다:

```
'channels' => [
    'stack' => [
        'driver' => 'stack',
        'channels' => ['syslog', 'slack'],
    ],

    'syslog' => [
        'driver' => 'syslog',
        'level' => 'debug',
    ],

    'slack' => [
        'driver' => 'slack',
        'url' => env('LOG_SLACK_WEBHOOK_URL'),
        'username' => 'Laravel Log',
        'emoji' => ':boom:',
        'level' => 'critical',
    ],
],
```

이 예시를 하나씩 설명해 보겠습니다. 먼저, `stack` 채널이 `channels` 옵션을 통해 `syslog`와 `slack` 두 채널을 묶고 있다는 점을 확인할 수 있습니다. 즉, 로그 메시지가 기록될 때 이 두 채널에서 모두 메시지를 받아 처리할 수 있습니다. 단, 아래 설명하는 것처럼 실제로 어느 채널에 메시지가 쓰일지는 메시지의 심각도(level)에 따라 달라집니다.

<a name="log-levels"></a>
#### 로그 레벨

위 예시에서 `syslog`와 `slack` 채널 설정에 `level` 옵션이 포함되어 있는 점에 주목해주세요. 이 옵션은 해당 채널이 로깅할 메시지의 최소 "레벨"을 결정합니다. Monolog(라라벨 로깅 시스템의 기반)는 [RFC 5424 사양](https://tools.ietf.org/html/rfc5424)에서 정의된 모든 로그 레벨을 지원합니다: **emergency**, **alert**, **critical**, **error**, **warning**, **notice**, **info**, **debug**.

예를 들어, `debug` 메서드로 메시지를 남겨본다고 가정해봅시다.

```
Log::debug('An informational message.');
```

이 경우, 예시 구성에서는 `syslog` 채널이 시스템 로그에 메시지를 기록하게 됩니다. 하지만 이 메시지는 `critical` 이상 등급이 아니기 때문에 Slack에는 전송되지 않습니다. 반대로, 만약 `emergency` 등급의 메시지를 남긴다면, 최소 레벨 기준을 충족하므로 시스템 로그와 Slack 양쪽 모두에 기록됩니다:

```
Log::emergency('The system is down!');
```

<a name="writing-log-messages"></a>
## 로그 메시지 작성하기

`Log` [파사드](/docs/8.x/facades)를 활용하여 로그에 다양한 정보를 기록할 수 있습니다. 앞서 언급했듯, 로거는 [RFC 5424 사양](https://tools.ietf.org/html/rfc5424)에서 정의한 여덟 가지 로그 레벨(**emergency**, **alert**, **critical**, **error**, **warning**, **notice**, **info**, **debug**)을 모두 지원합니다.

```
use Illuminate\Support\Facades\Log;

Log::emergency($message);
Log::alert($message);
Log::critical($message);
Log::error($message);
Log::warning($message);
Log::notice($message);
Log::info($message);
Log::debug($message);
```

이 중 어디든 원하는 메서드를 호출해서 해당 레벨에 맞는 메시지를 로그로 남길 수 있습니다. 기본적으로는, 메시지가 `logging` 설정 파일에서 지정한 기본 로그 채널로 기록됩니다.

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    /**
     * Show the profile for the given user.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        Log::info('Showing the user profile for user: '.$id);

        return view('user.profile', [
            'user' => User::findOrFail($id)
        ]);
    }
}
```

<a name="contextual-information"></a>
### 컨텍스트 정보 전달

로그 메서드에 컨텍스트 데이터(배열 형태)를 함께 전달할 수도 있습니다. 이 데이터는 로그 메시지와 같이 포맷되어 함께 기록됩니다.

```
use Illuminate\Support\Facades\Log;

Log::info('User failed to login.', ['id' => $user->id]);
```

가끔은, 앞으로 남길 모든 로그 메시지에 공통적으로 포함해야 할 컨텍스트 정보를 지정하고 싶을 수도 있습니다. 예를 들어, 각 요청마다 고유하게 발급되는 request ID를 함께 기록하고 싶을 때가 있습니다. 이때는 `Log` 파사드의 `withContext` 메서드를 사용하면 됩니다.

```
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AssignRequestId
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        $requestId = (string) Str::uuid();

        Log::withContext([
            'request-id' => $requestId
        ]);

        return $next($request)->header('Request-Id', $requestId);
    }
}
```

<a name="writing-to-specific-channels"></a>
### 특정 채널로 로그 남기기

애플리케이션의 기본 로그 채널이 아닌, 특정 채널로 메시지를 로깅하고 싶은 경우가 있습니다. 이럴 때는 `Log` 파사드의 `channel` 메서드를 사용해, 설정 파일에 정의된 채널 중 원하는 채널로 직접 메서드 체인을 연결해 로그를 남기면 됩니다.

```
use Illuminate\Support\Facades\Log;

Log::channel('slack')->info('Something happened!');
```

만약 여러 채널을 묶은 스택(stack) 채널을 즉석에서 만들어 로그를 남기고 싶다면 `stack` 메서드를 사용하면 됩니다.

```
Log::stack(['single', 'slack'])->info('Something happened!');
```

<a name="on-demand-channels"></a>
#### 즉석 채널 (On-Demand Channels)

`logging` 설정 파일에 미리 정의되어 있지 않은 채널을, 런타임에 즉석으로 만들어 사용하고 싶을 때에는 `Log` 파사드의 `build` 메서드에 설정 배열을 전달하면 됩니다.

```
use Illuminate\Support\Facades\Log;

Log::build([
  'driver' => 'single',
  'path' => storage_path('logs/custom.log'),
])->info('Something happened!');
```

즉석으로 만든 채널 인스턴스를 즉석 스택에 포함시키고 싶은 경우에도, 해당 채널 인스턴스를 배열에 추가하여 `stack` 메서드에 전달하면 됩니다.

```
use Illuminate\Support\Facades\Log;

$channel = Log::build([
  'driver' => 'single',
  'path' => storage_path('logs/custom.log'),
]);

Log::stack(['slack', $channel])->info('Something happened!');
```

<a name="monolog-channel-customization"></a>
## Monolog 채널 커스터마이징

<a name="customizing-monolog-for-channels"></a>
### 채널을 위한 Monolog 커스터마이징

기존 채널에 대해 Monolog의 다양한 설정을 완전히 제어하고 싶을 때가 있습니다. 예를 들어, 라라벨 기본 제공 `single` 채널에 Monolog의 커스텀 `FormatterInterface` 구현체를 적용하고 싶을 수 있습니다.

이 경우, 채널 설정에 `tap` 배열을 정의하면 됩니다. `tap` 배열에는 Monolog 인스턴스가 생성된 후 커스터마이징을 할 수 있는 클래스의 목록을 지정합니다. 해당 클래스들은 애플리케이션 내 어디에 두어도 상관없으며, 필요한 폴더 내에 자유롭게 생성하면 됩니다.

```
'single' => [
    'driver' => 'single',
    'tap' => [App\Logging\CustomizeFormatter::class],
    'path' => storage_path('logs/laravel.log'),
    'level' => 'debug',
],
```

이제 실제로 Monolog 인스턴스를 커스터마이즈하는 클래스를 정의하면 됩니다. 이 클래스에는 `__invoke`라는 단 하나의 메서드만 필요하며, 이 메서드는 `Illuminate\Log\Logger` 인스턴스를 인자로 받습니다. `Illuminate\Log\Logger`는 내부적으로 Monolog 인스턴스에 모든 메서드 호출을 위임합니다.

```
<?php

namespace App\Logging;

use Monolog\Formatter\LineFormatter;

class CustomizeFormatter
{
    /**
     * Customize the given logger instance.
     *
     * @param  \Illuminate\Log\Logger  $logger
     * @return void
     */
    public function __invoke($logger)
    {
        foreach ($logger->getHandlers() as $handler) {
            $handler->setFormatter(new LineFormatter(
                '[%datetime%] %channel%.%level_name%: %message% %context% %extra%'
            ));
        }
    }
}
```

> [!TIP]
> 모든 "tap" 클래스는 [서비스 컨테이너](/docs/8.x/container)에 의해 자동 해석(resolve)되므로, 생성자에서 다른 의존성이 필요한 경우도 자동으로 주입됩니다.

<a name="creating-monolog-handler-channels"></a>
### Monolog 핸들러 채널 생성하기

Monolog에는 다양한 [핸들러(handler)](https://github.com/Seldaek/monolog/tree/main/src/Monolog/Handler)가 존재하지만, 라라벨에는 그 모든 핸들러에 대한 내장 채널이 준비되어 있는 것은 아닙니다. 특정 Monolog 핸들러만을 이용한 채널이 필요하다면, 라라벨의 자체 로그 드라이버 대신 `monolog` 드라이버를 이용해 쉽게 직접 만들 수 있습니다.

`monolog` 드라이버 사용 시, `handler` 옵션에 사용할 핸들러를 지정합니다. 핸들러 생성자에 필요로 하는 추가 파라미터가 있다면 `with` 옵션을 사용해 전달하면 됩니다.

```
'logentries' => [
    'driver'  => 'monolog',
    'handler' => Monolog\Handler\SyslogUdpHandler::class,
    'with' => [
        'host' => 'my.logentries.internal.datahubhost.company.com',
        'port' => '10000',
    ],
],
```

<a name="monolog-formatters"></a>
#### Monolog 포매터(Formatter)

`monolog` 드라이버를 사용하는 경우, Monolog의 `LineFormatter`가 기본 포매터로 쓰입니다. 하지만 핸들러에 전달되는 포매터 종류를 커스터마이즈하고 싶다면 `formatter`와 `formatter_with` 설정 옵션을 사용할 수 있습니다.

```
'browser' => [
    'driver' => 'monolog',
    'handler' => Monolog\Handler\BrowserConsoleHandler::class,
    'formatter' => Monolog\Formatter\HtmlFormatter::class,
    'formatter_with' => [
        'dateFormat' => 'Y-m-d',
    ],
],
```

만약 사용하는 Monolog 핸들러가 자체적으로 포매터를 제공할 수 있다면, `formatter` 값을 `default`로 지정할 수 있습니다.

```
'newrelic' => [
    'driver' => 'monolog',
    'handler' => Monolog\Handler\NewRelicHandler::class,
    'formatter' => 'default',
],
```

<a name="creating-custom-channels-via-factories"></a>
### 팩토리를 통한 커스텀 채널 생성

Monolog의 인스턴스 생성과 설정 과정을 완전히 직접 제어하고 싶을 경우, `config/logging.php` 파일에서 `custom` 드라이버 타입을 지정해 커스텀 채널을 만들 수 있습니다. 이때 설정에는 Monolog 인스턴스를 생성할 팩토리 클래스의 이름을 `via` 옵션에 명시해야 합니다.

```
'channels' => [
    'example-custom-channel' => [
        'driver' => 'custom',
        'via' => App\Logging\CreateCustomLogger::class,
    ],
],
```

이제 클래스를 정의할 차례입니다. 이 클래스는 단 하나의 `__invoke` 메서드만 필요하며, 해당 메서드는 채널 설정 배열을 인자로 받아 Monolog의 logger 인스턴스를 반환해야 합니다.

```
<?php

namespace App\Logging;

use Monolog\Logger;

class CreateCustomLogger
{
    /**
     * Create a custom Monolog instance.
     *
     * @param  array  $config
     * @return \Monolog\Logger
     */
    public function __invoke(array $config)
    {
        return new Logger(...);
    }
}
```