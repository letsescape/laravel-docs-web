# 로깅 (Logging)

- [소개](#introduction)
- [설정](#configuration)
    - [사용 가능한 채널 드라이버](#available-channel-drivers)
    - [채널 사전 조건](#channel-prerequisites)
    - [사용 중단 경고 로깅](#logging-deprecation-warnings)
- [로그 스택 구축](#building-log-stacks)
- [로그 메시지 작성하기](#writing-log-messages)
    - [컨텍스트 정보](#contextual-information)
    - [특정 채널에 기록하기](#writing-to-specific-channels)
- [Monolog 채널 커스터마이징](#monolog-channel-customization)
    - [채널별 Monolog 커스터마이징](#customizing-monolog-for-channels)
    - [Monolog 핸들러 채널 생성](#creating-monolog-handler-channels)
    - [팩토리로 커스텀 채널 만들기](#creating-custom-channels-via-factories)
- [Pail을 사용한 로그 테일링](#tailing-log-messages-using-pail)
    - [설치](#pail-installation)
    - [사용법](#pail-usage)
    - [로그 필터링](#pail-filtering-logs)

<a name="introduction"></a>
## 소개

애플리케이션 내부에서 어떤 일이 일어나는지 쉽게 파악할 수 있도록, 라라벨은 메시지를 파일, 시스템 에러 로그, 그리고 Slack 등 다양한 곳에 기록할 수 있는 강력한 로깅 서비스를 제공합니다. Slack을 통해 팀 전체에 알림을 보낼 수도 있습니다.

라라벨의 로깅 시스템은 "채널(channel)"을 기반으로 동작합니다. 각 채널은 로그 정보를 기록하는 한 가지 방식을 나타냅니다. 예를 들어, `single` 채널은 단일 로그 파일에 로그를 저장하고, `slack` 채널은 로그 메시지를 Slack으로 전송합니다. 로그 메시지는 심각도에 따라 여러 채널에 동시에 기록될 수 있습니다.

라라벨 내부에서는 [Monolog](https://github.com/Seldaek/monolog) 라이브러리를 활용합니다. Monolog은 다양한 강력한 로그 핸들러를 지원하는데, 라라벨은 이를 아주 쉽게 설정하고 자유롭게 조합할 수 있도록 도와줍니다.

<a name="configuration"></a>
## 설정

애플리케이션의 로깅 동작을 제어하는 모든 설정 옵션은 `config/logging.php` 설정 파일에 정의되어 있습니다. 이 파일을 통해 각종 로그 채널을 구성할 수 있으니, 사용 가능한 채널과 옵션들을 꼭 살펴보시기 바랍니다. 아래에서 몇 가지 주요 옵션을 안내합니다.

기본적으로 라라벨은 로그 메시지를 기록할 때 `stack` 채널을 사용합니다. `stack` 채널은 여러 로그 채널을 하나의 채널로 묶어 사용할 수 있게 해줍니다. 스택 구축에 대한 자세한 내용은 [아래 문서](#building-log-stacks)를 참고하세요.

<a name="available-channel-drivers"></a>
### 사용 가능한 채널 드라이버

각 로그 채널은 "드라이버(driver)"에 의해 동작합니다. 드라이버는 실제로 로그 메시지가 어떻게, 어디에 기록될지 결정합니다. 아래는 모든 라라벨 애플리케이션에서 사용할 수 있는 주요 로그 채널 드라이버입니다. 대부분의 드라이버는 이미 `config/logging.php` 설정 파일에 항목이 있으니, 이 파일을 확인하여 내용을 익혀 두시길 권장합니다.

<div class="overflow-auto">

| 이름         | 설명                                                                        |
| ------------ | --------------------------------------------------------------------------- |
| `custom`     | 지정한 팩토리(factory)를 호출하여 채널을 생성하는 드라이버입니다.            |
| `daily`      | 일 단위로 로그 파일을 순환(rotating)하는 Monolog 기반 `RotatingFileHandler` 드라이버입니다. |
| `errorlog`   | Monolog의 `ErrorLogHandler` 기반 드라이버입니다.                            |
| `monolog`    | 지원되는 모든 Monolog 핸들러를 사용할 수 있는 Monolog 팩토리 드라이버입니다.  |
| `papertrail` | Monolog의 `SyslogUdpHandler` 기반 드라이버입니다.                            |
| `single`     | 단일 파일 또는 경로에 기록하는 채널이며, Monolog `StreamHandler`를 사용합니다. |
| `slack`      | Monolog의 `SlackWebhookHandler` 기반 드라이버입니다.                        |
| `stack`      | 다중 채널 채널을 쉽게 만들 수 있도록 도와주는 래퍼입니다.                   |
| `syslog`     | Monolog의 `SyslogHandler` 기반 드라이버입니다.                              |

</div>

> [!NOTE]
> `monolog` 및 `custom` 드라이버에 대한 더 자세한 내용은 [고급 채널 커스터마이징](#monolog-channel-customization) 문서를 참고하세요.

<a name="configuring-the-channel-name"></a>
#### 채널 이름 설정

기본적으로 Monolog은 현재 환경(`production`, `local` 등)과 동일한 이름의 "채널 이름"으로 인스턴스화됩니다. 이 값을 변경하고 싶다면, 채널 설정에 `name` 옵션을 추가하세요.

```php
'stack' => [
    'driver' => 'stack',
    'name' => 'channel-name',
    'channels' => ['single', 'slack'],
],
```

<a name="channel-prerequisites"></a>
### 채널 사전 조건

<a name="configuring-the-single-and-daily-channels"></a>
#### Single 및 Daily 채널 설정

`single`과 `daily` 채널은 `bubble`, `permission`, `locking`의 3가지 선택적 설정 옵션을 가지고 있습니다.

<div class="overflow-auto">

| 이름         | 설명                                                                 | 기본값   |
| ------------ | ------------------------------------------------------------------- | -------- |
| `bubble`     | 메시지가 처리된 후 다른 채널로 "버블 업"될지 여부를 지정합니다.        | `true`   |
| `locking`    | 로그 파일에 기록하기 전 파일을 잠글지 시도합니다.                    | `false`  |
| `permission` | 생성되는 로그 파일의 권한값입니다.                                  | `0644`   |

</div>

또한, `daily` 채널의 로그 보관 정책(=보관 일수)은 `LOG_DAILY_DAYS` 환경 변수나 `days` 설정 옵션으로 지정할 수 있습니다.

<div class="overflow-auto">

| 이름   | 설명                                                | 기본값  |
| ------ | --------------------------------------------------- | ------- |
| `days` | 일별 로그 파일을 몇 일간 보관할지 설정합니다.        | `14`    |

</div>

<a name="configuring-the-papertrail-channel"></a>
#### Papertrail 채널 설정

`papertrail` 채널은 `host`와 `port` 설정 옵션이 필요합니다. 이 값은 `PAPERTRAIL_URL`과 `PAPERTRAIL_PORT` 환경 변수로 지정할 수 있습니다. 자세한 정보는 [Papertrail 공식 문서](https://help.papertrailapp.com/kb/configuration/configuring-centralized-logging-from-php-apps/#send-events-from-php-app)를 참고하세요.

<a name="configuring-the-slack-channel"></a>
#### Slack 채널 설정

`slack` 채널은 `url` 설정 옵션이 필요합니다. 이 URL은 `LOG_SLACK_WEBHOOK_URL` 환경 변수로 지정할 수 있습니다. 해당 URL은 [Slack의 인커밍 웹훅](https://slack.com/apps/A0F7XDUAZ-incoming-webhooks)에서 발급받아야 합니다.

기본적으로 Slack에는 `critical` 레벨 이상의 로그만 전송됩니다. 하지만, `LOG_LEVEL` 환경 변수나 Slack 채널 설정 배열의 `level` 옵션을 변경해 원하는 심각도 이상만 전송되도록 조정할 수 있습니다.

<a name="logging-deprecation-warnings"></a>
### 사용 중단 경고 로깅

PHP, 라라벨, 그리고 기타 라이브러리들은 종종 일부 기능이 향후 버전에서 제거될 것임을 알리기 위해 "사용 중단(deprecated)" 경고를 제공합니다. 이러한 경고도 로그로 남기고 싶다면, `LOG_DEPRECATIONS_CHANNEL` 환경 변수나 애플리케이션의 `config/logging.php` 파일에서 `deprecations` 로그 채널을 지정할 수 있습니다.

```php
'deprecations' => [
    'channel' => env('LOG_DEPRECATIONS_CHANNEL', 'null'),
    'trace' => env('LOG_DEPRECATIONS_TRACE', false),
],

'channels' => [
    // ...
]
```

또는, `deprecations`라는 이름의 로그 채널을 따로 정의할 수도 있습니다. 만약 해당 이름의 로그 채널이 존재하면, 항상 이 채널로 사용 중단 경고가 기록됩니다.

```php
'channels' => [
    'deprecations' => [
        'driver' => 'single',
        'path' => storage_path('logs/php-deprecation-warnings.log'),
    ],
],
```

<a name="building-log-stacks"></a>
## 로그 스택 구축

앞서 언급했듯이, `stack` 드라이버는 여러 채널을 하나의 로그 채널로 합쳐 사용할 수 있도록 해줍니다. 실제 운영 환경에서 자주 사용하는 예시 설정을 살펴보겠습니다.

```php
'channels' => [
    'stack' => [
        'driver' => 'stack',
        'channels' => ['syslog', 'slack'], // [tl! add]
        'ignore_exceptions' => false,
    ],

    'syslog' => [
        'driver' => 'syslog',
        'level' => env('LOG_LEVEL', 'debug'),
        'facility' => env('LOG_SYSLOG_FACILITY', LOG_USER),
        'replace_placeholders' => true,
    ],

    'slack' => [
        'driver' => 'slack',
        'url' => env('LOG_SLACK_WEBHOOK_URL'),
        'username' => env('LOG_SLACK_USERNAME', 'Laravel Log'),
        'emoji' => env('LOG_SLACK_EMOJI', ':boom:'),
        'level' => env('LOG_LEVEL', 'critical'),
        'replace_placeholders' => true,
    ],
],
```

이 설정을 하나씩 살펴보겠습니다. 먼저, `stack` 채널은 `channels` 옵션을 통해 `syslog`와 `slack` 두 개의 채널을 묶습니다. 그래서 로그 메시지를 남길 때 두 채널이 각각 메시지를 기록할 기회를 갖게 됩니다. 단, 실제로 각 채널에 메시지가 남겨지는지는 메시지의 심각도(레벨)에 따라 달라집니다.

<a name="log-levels"></a>
#### 로그 레벨

위 예시에서 `syslog`와 `slack` 채널 설정의 `level` 옵션에 주목하세요. 이 옵션은 해당 채널에 기록되기 위해 메시지가 가져야 하는 최소 "레벨(심각도)"을 결정합니다. 라라벨의 로깅 서비스는 Monolog을 기반으로 하고, Monolog은 [RFC 5424 규격](https://tools.ietf.org/html/rfc5424)에 정의된 모든 로그 레벨을 제공합니다. 심각도 순서대로 나열하면, **emergency**, **alert**, **critical**, **error**, **warning**, **notice**, **info**, **debug** 입니다.

예를 들어, 다음처럼 `debug` 메서드로 메시지를 기록한다고 가정해보겠습니다.

```php
Log::debug('An informational message.');
```

이 경우, 설정에 따라 `syslog` 채널은 시스템 로그에 메시지를 기록합니다. 반면, 이 메시지는 `critical` 이상이 아니므로 Slack에는 전송되지 않습니다. 반면, `emergency` 레벨의 메시지를 남기면, system log와 Slack 모두에 메시지가 기록됩니다. `emergency`가 두 채널 모두의 최소 레벨을 충족하기 때문입니다.

```php
Log::emergency('The system is down!');
```

<a name="writing-log-messages"></a>
## 로그 메시지 작성하기

`Log` [파사드](/docs/facades)를 사용해 로그에 정보를 남길 수 있습니다. 앞서 언급했듯이, 라라벨 로거는 [RFC 5424 스펙](https://tools.ietf.org/html/rfc5424)에 정의된 8가지 레벨의 로깅 메서드를 제공합니다: **emergency**, **alert**, **critical**, **error**, **warning**, **notice**, **info**, **debug**

```php
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

이 메서드 중 하나를 호출하면 해당 레벨의 메시지를 기록할 수 있습니다. 기본적으로 메시지는 `logging` 설정 파일에 정의된 기본 로그 채널에 기록됩니다.

```php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * Show the profile for the given user.
     */
    public function show(string $id): View
    {
        Log::info('Showing the user profile for user: {id}', ['id' => $id]);

        return view('user.profile', [
            'user' => User::findOrFail($id)
        ]);
    }
}
```

<a name="contextual-information"></a>
### 컨텍스트 정보

로그 메서드에 컨텍스트 데이터 배열을 함께 전달할 수 있습니다. 이렇게 하면, 이 정보가 로그 메시지와 함께 포맷되어 출력됩니다.

```php
use Illuminate\Support\Facades\Log;

Log::info('User {id} failed to login.', ['id' => $user->id]);
```

경우에 따라, 특정 채널에서 기록되는 모든 로그에 항상 포함되어야 할 컨텍스트 정보를 지정하고 싶을 수 있습니다. 예를 들어, 모든 HTTP 요청마다 고유한 request ID를 로그에 남기고자 할 때가 있습니다. 이런 경우에는 `Log` 파사드의 `withContext` 메서드를 사용하세요.

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class AssignRequestId
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $requestId = (string) Str::uuid();

        Log::withContext([
            'request-id' => $requestId
        ]);

        $response = $next($request);

        $response->headers->set('Request-Id', $requestId);

        return $response;
    }
}
```

만약 _모든_ 로깅 채널에 컨텍스트 정보를 공유하고 싶다면, `Log::shareContext()` 메서드를 사용할 수 있습니다. 이 메서드를 호출하면, 해당 컨텍스트 정보가 이미 생성된 채널과 앞으로 생성되는 모든 채널에도 동일하게 적용됩니다.

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class AssignRequestId
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $requestId = (string) Str::uuid();

        Log::shareContext([
            'request-id' => $requestId
        ]);

        // ...
    }
}
```

> [!NOTE]
> 큐 처리 중에 로그 컨텍스트를 공유해야 할 경우, [작업 미들웨어](/docs/queues#job-middleware)를 활용할 수 있습니다.

<a name="writing-to-specific-channels"></a>
### 특정 채널에 기록하기

기본 로그 채널이 아닌, 다른 채널에 로그를 남기고 싶을 때도 있습니다. 이럴 때는 `Log` 파사드의 `channel` 메서드를 사용하여, 설정 파일에 정의된 아무 채널에나 메시지를 기록할 수 있습니다.

```php
use Illuminate\Support\Facades\Log;

Log::channel('slack')->info('Something happened!');
```

여러 채널로 구성된 임시(온디맨드) 로그 스택을 직접 만들어 기록하는 것도 가능합니다. 이때는 `stack` 메서드를 사용하세요.

```php
Log::stack(['single', 'slack'])->info('Something happened!');
```

<a name="on-demand-channels"></a>
#### 온디맨드 채널

애플리케이션의 `logging` 설정 파일에 별도의 설정 없이, 실행 중에 직접 로그 채널 구성을 전달하여 임시로(온디맨드로) 로그 채널을 만들 수도 있습니다. 구성을 배열 형태로 `Log` 파사드의 `build` 메서드에 전달하면 됩니다.

```php
use Illuminate\Support\Facades\Log;

Log::build([
  'driver' => 'single',
  'path' => storage_path('logs/custom.log'),
])->info('Something happened!');
```

온디맨드 채널 역시 온디맨드 로깅 스택의 일부로 포함시킬 수 있습니다. 이때는 생성한 온디맨드 채널 인스턴스를 스택 배열에 넣으면 됩니다.

```php
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
### 채널별 Monolog 커스터마이징

특정 채널에 대해 Monolog을 완전히 원하는 대로 직접 조정해야 할 때가 있습니다. 예를 들어, 라라벨 내장 `single` 채널에 직접 구현한 Monolog `FormatterInterface`(포맷터)를 사용하고 싶을 수 있습니다.

먼저, 채널 설정에 `tap` 배열을 추가하세요. `tap` 배열에는 Monolog 인스턴스가 생성된 후, 커스터마이징할 기회를 제공할 클래스들을 나열합니다. 이 클래스는 애플리케이션 안에 별도의 디렉터리를 만들어 자유롭게 위치시킬 수 있습니다.

```php
'single' => [
    'driver' => 'single',
    'tap' => [App\Logging\CustomizeFormatter::class],
    'path' => storage_path('logs/laravel.log'),
    'level' => env('LOG_LEVEL', 'debug'),
    'replace_placeholders' => true,
],
```

`tap` 옵션을 설정했다면, 이제 Monolog 인스턴스를 커스터마이징할 클래스를 정의하면 됩니다. 이 클래스는 `__invoke`라는 단일 메서드만 필요하며, 여기서 받은 `Illuminate\Log\Logger` 인스턴스를 통해 Monolog에 접근할 수 있습니다.

```php
<?php

namespace App\Logging;

use Illuminate\Log\Logger;
use Monolog\Formatter\LineFormatter;

class CustomizeFormatter
{
    /**
     * Customize the given logger instance.
     */
    public function __invoke(Logger $logger): void
    {
        foreach ($logger->getHandlers() as $handler) {
            $handler->setFormatter(new LineFormatter(
                '[%datetime%] %channel%.%level_name%: %message% %context% %extra%'
            ));
        }
    }
}
```

> [!NOTE]
> 모든 "tap" 클래스는 [서비스 컨테이너](/docs/container)를 통해 생성되므로, 생성자에 필요한 의존성은 자동 주입됩니다.

<a name="creating-monolog-handler-channels"></a>
### Monolog 핸들러 채널 생성

Monolog은 [다양한 핸들러](https://github.com/Seldaek/monolog/tree/main/src/Monolog/Handler)를 제공합니다. 라라벨에는 모든 핸들러에 대해 내장 채널이 준비되어 있지는 않습니다. 만약 라라벨이 기본 제공하지 않는 Monolog 핸들러를 사용하는 커스텀 채널을 만들고 싶다면, `monolog` 드라이버를 사용하여 쉽게 구현할 수 있습니다.

`monolog` 드라이버를 사용할 때에는, `handler` 옵션으로 사용할 핸들러 클래스를 지정해야 합니다. 핸들러에 생성자 파라미터가 필요하다면, `handler_with` 설정 옵션을 추가로 지정하면 됩니다.

```php
'logentries' => [
    'driver'  => 'monolog',
    'handler' => Monolog\Handler\SyslogUdpHandler::class,
    'handler_with' => [
        'host' => 'my.logentries.internal.datahubhost.company.com',
        'port' => '10000',
    ],
],
```

<a name="monolog-formatters"></a>
#### Monolog 포매터

`monolog` 드라이버를 사용할 때 기본 포매터는 Monolog의 `LineFormatter`입니다. 하지만, `formatter`와 `formatter_with` 설정 옵션을 활용해 사용할 포매터의 종류 및 세부 옵션을 변경할 수 있습니다.

```php
'browser' => [
    'driver' => 'monolog',
    'handler' => Monolog\Handler\BrowserConsoleHandler::class,
    'formatter' => Monolog\Formatter\HtmlFormatter::class,
    'formatter_with' => [
        'dateFormat' => 'Y-m-d',
    ],
],
```

만약 사용하는 Monolog 핸들러가 자체적으로 포매터를 제공할 수 있다면, `formatter` 옵션 값을 `default`로 설정할 수 있습니다.

```php
'newrelic' => [
    'driver' => 'monolog',
    'handler' => Monolog\Handler\NewRelicHandler::class,
    'formatter' => 'default',
],
```

<a name="monolog-processors"></a>
#### Monolog 프로세서

Monolog은 메시지를 기록하기 전에 추가로 가공(처리)할 수 있도록 "프로세서(processor)"도 지원합니다. 원하는 프로세서를 직접 만들 수도 있고, [Monolog이 기본 제공하는 프로세서](https://github.com/Seldaek/monolog/tree/main/src/Monolog/Processor)를 사용할 수도 있습니다.

`monolog` 드라이버의 프로세서를 커스터마이즈하고 싶다면, 채널 설정에 `processors` 항목을 추가하세요.

```php
'memory' => [
    'driver' => 'monolog',
    'handler' => Monolog\Handler\StreamHandler::class,
    'handler_with' => [
        'stream' => 'php://stderr',
    ],
    'processors' => [
        // 간단한 형태...
        Monolog\Processor\MemoryUsageProcessor::class,

        // 옵션을 포함하여...
        [
            'processor' => Monolog\Processor\PsrLogMessageProcessor::class,
            'with' => ['removeUsedContextFields' => true],
        ],
    ],
],
```

<a name="creating-custom-channels-via-factories"></a>
### 팩토리로 커스텀 채널 만들기

Monolog의 생성부터 설정까지 모든 과정을 직접 제어하는 완전히 커스텀한 채널을 만들고 싶다면, `config/logging.php` 설정 파일에서 `custom` 드라이버 타입을 지정하면 됩니다. 설정에는 반드시 Monolog 인스턴스를 생성할 팩토리 클래스 이름을 `via` 옵션으로 지정해야 합니다.

```php
'channels' => [
    'example-custom-channel' => [
        'driver' => 'custom',
        'via' => App\Logging\CreateCustomLogger::class,
    ],
],
```

이제 `custom` 드라이버 채널을 위한 클래스를 만들어야 합니다. 이 클래스는 `__invoke`라는 단일 메서드만 필요하며, 이 메서드는 채널 설정 배열을 인자로 받아 Monolog logger 인스턴스를 반환해야 합니다.

```php
<?php

namespace App\Logging;

use Monolog\Logger;

class CreateCustomLogger
{
    /**
     * Create a custom Monolog instance.
     */
    public function __invoke(array $config): Logger
    {
        return new Logger(/* ... */);
    }
}
```

<a name="tailing-log-messages-using-pail"></a>
## Pail을 사용한 로그 테일링

실시간으로 애플리케이션의 로그를 "tail(따라가기)" 해야 할 때가 종종 있습니다. 예를 들어, 버그를 디버깅하거나, 특정 에러 유형만 집중적으로 모니터링할 때 유용합니다.

Laravel Pail은 명령줄에서 라라벨 애플리케이션의 로그 파일을 쉽게 살펴볼 수 있도록 도와주는 패키지입니다. 기존 `tail` 명령과 달리, Pail은 Sentry나 Flare 같은 어떠한 로그 드라이버와도 함께 사용할 수 있도록 설계되어 있습니다. 그뿐만 아니라, 빠르게 원하는 로그만 찾을 수 있도록 여러 유용한 필터도 제공합니다.

<img src="https://laravel.com/img/docs/pail-example.png"/>

<a name="pail-installation"></a>
### 설치

> [!WARNING]
> Laravel Pail은 [PHP 8.2 이상](https://php.net/releases/)과 [PCNTL](https://www.php.net/manual/en/book.pcntl.php) 확장 기능이 필요합니다.

먼저, Composer 패키지 매니저를 사용해 프로젝트에 Pail을 설치하세요.

```shell
composer require laravel/pail
```

<a name="pail-usage"></a>
### 사용법

로그 테일링을 시작하려면 `pail` 명령을 실행하세요.

```shell
php artisan pail
```

출력의 상세 단계(verbosity level)를 높이고 줄임표(…) 없이 보려면 `-v` 옵션을 사용하세요.

```shell
php artisan pail -v
```

가장 상세한 모드로 예외 스택 트레이스까지 표시하려면, `-vv` 옵션을 사용하세요.

```shell
php artisan pail -vv
```

로그 테일링을 중지하려면 언제든지 `Ctrl+C`를 누르세요.

<a name="pail-filtering-logs"></a>
### 로그 필터링

<a name="pail-filtering-logs-filter-option"></a>
#### `--filter`

`--filter` 옵션을 사용하면 로그의 타입, 파일명, 메시지, 스택 트레이스 내용을 기준으로 필터링할 수 있습니다.

```shell
php artisan pail --filter="QueryException"
```

<a name="pail-filtering-logs-message-option"></a>
#### `--message`

로그 메시지만을 기준으로 필터링하려면 `--message` 옵션을 사용합니다.

```shell
php artisan pail --message="User created"
```

<a name="pail-filtering-logs-level-option"></a>
#### `--level`

`--level` 옵션으로 [로그 레벨](#log-levels)에 따라 로그만 조회할 수 있습니다.

```shell
php artisan pail --level=error
```

<a name="pail-filtering-logs-user-option"></a>
#### `--user`

특정 사용자가 인증된 상태에서 기록된 로그만 보고 싶을 때는 해당 사용자의 ID를 `--user` 옵션에 지정하면 됩니다.

```shell
php artisan pail --user=1
```