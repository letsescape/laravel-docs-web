# 로깅 (Logging)

- [소개](#introduction)
- [설정](#configuration)
    - [사용 가능한 채널 드라이버](#available-channel-drivers)
    - [채널 사전 준비 사항](#channel-prerequisites)
    - [사용 중단 경고 로깅](#logging-deprecation-warnings)
- [로그 스택 만들기](#building-log-stacks)
- [로그 메시지 작성하기](#writing-log-messages)
    - [컨텍스트 정보 사용](#contextual-information)
    - [특정 채널로 쓰기](#writing-to-specific-channels)
- [Monolog 채널 커스터마이즈](#monolog-channel-customization)
    - [채널에 대한 Monolog 커스터마이즈](#customizing-monolog-for-channels)
    - [Monolog 핸들러 채널 생성](#creating-monolog-handler-channels)
    - [팩토리로 커스텀 채널 생성](#creating-custom-channels-via-factories)
- [Pail을 이용한 로그 메시지 실시간 확인](#tailing-log-messages-using-pail)
    - [설치](#pail-installation)
    - [사용법](#pail-usage)
    - [로그 필터링](#pail-filtering-logs)

<a name="introduction"></a>
## 소개

애플리케이션에서 어떤 일이 일어나고 있는지 쉽게 파악할 수 있도록 라라벨은 강력한 로깅 서비스를 제공합니다. 이를 통해 파일, 시스템 에러 로그, 또는 전체 팀에 알림을 주기 위한 Slack 등 다양한 위치에 로그 메시지를 남길 수 있습니다.

라라벨의 로깅은 "채널(channel)" 기반으로 동작합니다. 각 채널은 로그 정보를 기록하는 특정 방식을 나타냅니다. 예를 들어, `single` 채널은 하나의 로그 파일에 모든 로그를 기록하고, `slack` 채널은 로그 메시지를 Slack으로 전송합니다. 로그 메시지는 심각도에 따라 여러 채널에 동시에 기록될 수 있습니다.

라라벨 내부적으로는 [Monolog](https://github.com/Seldaek/monolog) 라이브러리를 활용하여 다양한 강력한 로그 핸들러를 지원합니다. 라라벨에서는 이러한 핸들러를 손쉽게 설정할 수 있도록 하여, 개발자가 자유롭게 조합해 애플리케이션의 로그 처리 방식을 맞춤 설정할 수 있습니다.

<a name="configuration"></a>
## 설정

애플리케이션의 로그 동작을 제어하는 모든 설정 옵션은 `config/logging.php` 설정 파일에 위치합니다. 이 파일을 통해 애플리케이션의 로그 채널을 설정할 수 있으므로, 사용 가능한 각 채널과 옵션을 꼼꼼히 확인하는 것이 좋습니다. 아래에서 몇 가지 주요 설정 항목을 살펴보겠습니다.

기본적으로 라라벨은 메시지 로깅 시 `stack` 채널을 사용합니다. `stack` 채널은 여러 로그 채널을 하나로 묶어서 관리할 수 있도록 해줍니다. 스택 구축에 대한 자세한 내용은 [아래 문서](#building-log-stacks)를 참고하시기 바랍니다.

<a name="available-channel-drivers"></a>
### 사용 가능한 채널 드라이버

각 로그 채널은 "드라이버(driver)"에 의해 동작합니다. 드라이버는 실제로 로그 메시지가 어떻게, 어디에 기록되는지를 결정합니다. 모든 라라벨 애플리케이션에서 사용 가능한 로그 채널 드라이버는 아래와 같습니다. 대부분의 드라이버에 대한 설정 예시는 이미 애플리케이션의 `config/logging.php` 파일에 포함되어 있으니, 파일의 내용을 꼭 확인해 보세요.

<div class="overflow-auto">

| 이름          | 설명                                                                   |
| ------------- | ---------------------------------------------------------------------- |
| `custom`      | 지정한 팩토리를 호출해 채널을 생성하는 드라이버                        |
| `daily`       | Monolog의 `RotatingFileHandler` 기반으로, 로그를 일 단위로 분리         |
| `errorlog`    | Monolog의 `ErrorLogHandler` 기반 드라이버                              |
| `monolog`     | 지원하는 모든 Monolog 핸들러 사용이 가능한 Monolog 팩토리 드라이버      |
| `papertrail`  | Monolog의 `SyslogUdpHandler` 기반 드라이버                              |
| `single`      | 단일 파일(경로) 기반 로거 채널 (`StreamHandler`)                        |
| `slack`       | Monolog의 `SlackWebhookHandler` 기반 드라이버                           |
| `stack`       | 여러 채널을 하나의 "멀티채널"로 묶어주는 래퍼                           |
| `syslog`      | Monolog의 `SyslogHandler` 기반 드라이버                                 |

</div>

> [!NOTE]
> `monolog` 및 `custom` 드라이버에 대한 자세한 내용은 [고급 채널 커스터마이즈 문서](#monolog-channel-customization)를 참고하세요.

<a name="configuring-the-channel-name"></a>
#### 채널 이름 설정하기

기본적으로 Monolog 인스턴스는 현재 환경(`production`, `local` 등)과 동일한 "채널 이름"으로 생성됩니다. 이 값을 변경하고 싶다면 채널의 설정에 `name` 옵션을 추가하면 됩니다.

```php
'stack' => [
    'driver' => 'stack',
    'name' => 'channel-name',
    'channels' => ['single', 'slack'],
],
```

<a name="channel-prerequisites"></a>
### 채널 사전 준비 사항

<a name="configuring-the-single-and-daily-channels"></a>
#### Single 및 Daily 채널 설정

`single` 및 `daily` 채널에는 `bubble`, `permission`, `locking` 등 3가지 선택적 설정 옵션이 있습니다.

<div class="overflow-auto">

| 이름          | 설명                                                                 | 기본값   |
| ------------- | -------------------------------------------------------------------- | -------- |
| `bubble`      | 메시지 처리 후 다른 채널로 "버블링"(전파) 할지 여부                   | `true`   |
| `locking`     | 로그 파일 기록 전에 파일 잠금 시도                                   | `false`  |
| `permission`  | 로그 파일의 퍼미션                                                  | `0644`   |

</div>

추가적으로, `daily` 채널의 로그 보관 기간 정책은 `LOG_DAILY_DAYS` 환경 변수 또는 `days` 설정 옵션으로 지정할 수 있습니다.

<div class="overflow-auto">

| 이름   | 설명                                     | 기본값   |
| ------ | ---------------------------------------- | -------- |
| `days` | 일별 로그 파일을 유지할 일수              | `14`     |

</div>

<a name="configuring-the-papertrail-channel"></a>
#### Papertrail 채널 설정

`papertrail` 채널은 `host`와 `port` 설정 옵션이 필요합니다. 이 옵션들은 `PAPERTRAIL_URL` 및 `PAPERTRAIL_PORT` 환경 변수로 정의할 수 있습니다. 값은 [Papertrail](https://help.papertrailapp.com/kb/configuration/configuring-centralized-logging-from-php-apps/#send-events-from-php-app)에서 확인할 수 있습니다.

<a name="configuring-the-slack-channel"></a>
#### Slack 채널 설정

`slack` 채널은 `url` 옵션이 필수입니다. 이 값은 `LOG_SLACK_WEBHOOK_URL` 환경 변수로 지정할 수 있습니다. 이 URL은 Slack 팀에 대해 미리 설정해둔 [인커밍 Webhook](https://slack.com/apps/A0F7XDUAZ-incoming-webhooks) URL이어야 합니다.

기본적으로 Slack에는 `critical` 이상 레벨의 로그만 전송됩니다. 하지만 `LOG_LEVEL` 환경 변수나 Slack 로그 채널의 `level` 옵션을 설정하여 이 기준을 조정할 수 있습니다.

<a name="logging-deprecation-warnings"></a>
### 사용 중단 경고 로깅

PHP, 라라벨, 기타 라이브러리들은 특정 기능이 더 이상 지원되지 않고 향후 버전에서 제거될 예정임을 "사용 중단(deprecation)" 경고로 알립니다. 이런 사용 중단 경고를 로그로 기록하고 싶다면, 환경 변수 `LOG_DEPRECATIONS_CHANNEL` 또는 애플리케이션의 `config/logging.php` 파일에서 원하는 `deprecations` 로그 채널을 지정할 수 있습니다.

```php
'deprecations' => [
    'channel' => env('LOG_DEPRECATIONS_CHANNEL', 'null'),
    'trace' => env('LOG_DEPRECATIONS_TRACE', false),
],

'channels' => [
    // ...
]
```

또는 `deprecations`라는 이름의 로그 채널을 직접 추가할 수도 있습니다. 이 이름의 채널이 존재하면 해당 채널이 항상 사용 중단 로그를 담당합니다.

```php
'channels' => [
    'deprecations' => [
        'driver' => 'single',
        'path' => storage_path('logs/php-deprecation-warnings.log'),
    ],
],
```

<a name="building-log-stacks"></a>
## 로그 스택 만들기

앞서 설명한 것처럼 `stack` 드라이버는 여러 채널을 하나의 로그 채널로 결합할 수 있습니다. 실무 환경에서 자주 볼 수 있는 스택 예시 설정을 살펴보겠습니다.

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

이 설정을 하나씩 살펴보면, 먼저 `stack` 채널이 `channels` 옵션을 통해 두 개의 채널(`syslog`, `slack`)을 묶고 있습니다. 즉, 로그 메시지를 남길 때 두 채널 모두가 메시지를 받을 수 있습니다. 단, 실제로 어떤 채널이 로그를 남기는지는 각 채널의 "레벨" 또는 심각도에 따라 결정됩니다.

<a name="log-levels"></a>
#### 로그 레벨

위 예시에서 `syslog`와 `slack` 채널 설정에 존재하는 `level` 옵션에 주목하세요. 이 옵션은 각 채널이 메시지를 처리할 최소 "레벨"을 결정합니다. 라라벨 로깅의 기반이 되는 Monolog 라이브러리는 [RFC 5424 표준](https://tools.ietf.org/html/rfc5424)에 정의된 모든 로그 레벨을 지원합니다. 높은 심각도 순서대로 로그 레벨은 다음과 같습니다: **emergency**, **alert**, **critical**, **error**, **warning**, **notice**, **info**, **debug**.

예를 들어, `debug` 메서드로 메시지를 남긴다고 가정해봅시다.

```php
Log::debug('An informational message.');
```

이 설정에서는 `syslog` 채널이 메시지를 시스템 로그에 기록하겠지만, 이 메시지가 `critical` 이상이 아니므로 Slack 채널에는 전송되지 않습니다. 반면, 만약 `emergency` 레벨로 메시지를 남긴다면, 양쪽 채널 모두에 전송됩니다. `emergency` 레벨은 두 채널의 최소 레벨 기준을 모두 넘기 때문입니다.

```php
Log::emergency('The system is down!');
```

<a name="writing-log-messages"></a>
## 로그 메시지 작성하기

로그 메시지는 `Log` [파사드](/docs/12.x/facades)를 통해 남길 수 있습니다. 앞서 언급한 [RFC 5424 표준](https://tools.ietf.org/html/rfc5424)의 8가지 로그 레벨을 그대로 지원합니다: **emergency**, **alert**, **critical**, **error**, **warning**, **notice**, **info**, **debug**.

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

이 메서드들은 해당 로그 레벨에 메시지를 남길 때 사용합니다. 기본적으로 메시지는 `logging` 설정 파일에서 지정한 기본 로그 채널로 기록됩니다.

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
### 컨텍스트 정보 사용

로그 메서드에는 추가적인 컨텍스트 데이터 배열을 전달할 수 있습니다. 이 데이터는 로그 메시지와 함께 포맷되어 표시됩니다.

```php
use Illuminate\Support\Facades\Log;

Log::info('User {id} failed to login.', ['id' => $user->id]);
```

가끔 하나의 채널에서 이후 모든 로그에 공통으로 포함될 컨텍스트 정보를 지정하고 싶을 때가 있습니다. 예를 들어, 모든 요청에 대해 고유한 요청 ID를 남기고 싶을 경우, `Log` 파사드의 `withContext` 메서드를 사용할 수 있습니다.

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

_모든_ 로깅 채널에서 컨텍스트 정보를 공유하고 싶다면, `Log::shareContext()` 메서드를 이용할 수 있습니다. 이 메서드는 이미 생성된 채널뿐만 아니라 이후에 생성되는 모든 채널에도 적용됩니다.

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
> 큐 작업 처리 중 로그 컨텍스트를 공유해야 한다면 [잡 미들웨어](/docs/12.x/queues#job-middleware)를 활용할 수 있습니다.

<a name="writing-to-specific-channels"></a>
### 특정 채널로 쓰기

가끔 기본 로그 채널이 아닌 다른 특정 채널로 메시지를 남기고 싶을 수 있습니다. 이 경우 `Log` 파사드의 `channel` 메서드로 설정 파일에 정의된 임의의 채널에 접근할 수 있습니다.

```php
use Illuminate\Support\Facades\Log;

Log::channel('slack')->info('Something happened!');
```

여러 채널을 조합해 즉석에서 로그 스택을 만들고 싶다면 `stack` 메서드를 사용합니다.

```php
Log::stack(['single', 'slack'])->info('Something happened!');
```

<a name="on-demand-channels"></a>
#### 온디맨드 채널

설정 파일에 별도로 정의하지 않고 런타임에 직접 지정하는 즉석(온디맨드) 채널도 만들 수 있습니다. 이때는 `Log` 파사드의 `build` 메서드에 구성 배열을 전달합니다.

```php
use Illuminate\Support\Facades\Log;

Log::build([
  'driver' => 'single',
  'path' => storage_path('logs/custom.log'),
])->info('Something happened!');
```

즉석 채널을 즉석 로그 스택에 포함시키는 것도 가능합니다. 이 경우 직접 생성한 채널 인스턴스를 `stack` 메서드의 배열에 함께 넣어주면 됩니다.

```php
use Illuminate\Support\Facades\Log;

$channel = Log::build([
  'driver' => 'single',
  'path' => storage_path('logs/custom.log'),
]);

Log::stack(['slack', $channel])->info('Something happened!');
```

<a name="monolog-channel-customization"></a>
## Monolog 채널 커스터마이즈

<a name="customizing-monolog-for-channels"></a>
### 채널에 대한 Monolog 커스터마이즈

가끔 기존 채널에 대해 Monolog의 설정을 완전히 제어하고 싶을 수 있습니다. 예를 들어, 라라벨 내장 `single` 채널에 사용자 정의 Monolog `FormatterInterface` 구현체를 지정해야 할 수 있습니다.

이런 경우 채널의 설정에 `tap` 옵션(배열형)을 추가합니다. `tap` 배열에는 Monolog 인스턴스가 생성된 후 커스터마이즈(또는 "tap")할 기회를 갖는 클래스들의 목록을 넣습니다. 이 클래스들의 위치에는 특별한 제약이 없으므로, 애플리케이션 내에 별도의 디렉터리를 만들어 자유롭게 관리할 수 있습니다.

```php
'single' => [
    'driver' => 'single',
    'tap' => [App\Logging\CustomizeFormatter::class],
    'path' => storage_path('logs/laravel.log'),
    'level' => env('LOG_LEVEL', 'debug'),
    'replace_placeholders' => true,
],
```

`tap` 옵션을 지정했다면, 이제 실제 Monolog 인스턴스를 커스터마이즈할 클래스를 만들어야 합니다. 이 클래스에는 `__invoke`라는 하나의 메서드만 있으면 됩니다. 이 메서드에서는 `Illuminate\Log\Logger` 인스턴스를 인자로 받습니다. 이 인스턴스는 내부적으로 Monolog 인스턴스의 모든 메서드 호출을 위임(proxy)해줍니다.

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
> 모든 "tap" 클래스는 [서비스 컨테이너](/docs/12.x/container)로 해석되므로 필요한 생성자 의존성이 자동으로 주입됩니다.

<a name="creating-monolog-handler-channels"></a>
### Monolog 핸들러 채널 생성

Monolog에는 다양한 [핸들러](https://github.com/Seldaek/monolog/tree/main/src/Monolog/Handler)가 있지만, 라라벨이 내장 채널로 모두 지원하지는 않습니다. 따라서 특정 Monolog 핸들러 인스턴스만을 사용한 커스텀 채널이 필요하다면 `monolog` 드라이버로 손쉽게 채널을 생성할 수 있습니다.

`monolog` 드라이버 사용 시 `handler` 옵션으로 어떤 핸들러를 생성할지 지정합니다. 핸들러의 생성자 인자가 필요하다면 `handler_with` 옵션으로 같이 지정할 수 있습니다.

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

`monolog` 드라이버 사용 시, 기본적으로 Monolog의 `LineFormatter`가 설정됩니다. 하지만 `formatter`와 `formatter_with` 옵션을 이용해 핸들러에 전달할 포매터 타입을 자유롭게 변경할 수 있습니다.

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

만약 사용 중인 Monolog 핸들러가 자체 포매터 제공 능력이 있다면, `formatter` 값을 `default`로 지정하면 됩니다.

```php
'newrelic' => [
    'driver' => 'monolog',
    'handler' => Monolog\Handler\NewRelicHandler::class,
    'formatter' => 'default',
],
```

<a name="monolog-processors"></a>
#### Monolog 프로세서

Monolog에서는 로그를 기록하기 전 메시지를 가공하는 "프로세서(processor)"를 사용할 수 있습니다. 직접 프로세서를 만들 수도 있고, [Monolog이 제공하는 기본 프로세서](https://github.com/Seldaek/monolog/tree/main/src/Monolog/Processor)를 쓸 수도 있습니다.

`monolog` 드라이버의 경우, 채널 설정에서 `processors` 옵션을 통해 자유롭게 프로세서를 지정할 수 있습니다.

```php
'memory' => [
    'driver' => 'monolog',
    'handler' => Monolog\Handler\StreamHandler::class,
    'handler_with' => [
        'stream' => 'php://stderr',
    ],
    'processors' => [
        // 간략한 문법...
        Monolog\Processor\MemoryUsageProcessor::class,

        // 옵션을 포함해서...
        [
            'processor' => Monolog\Processor\PsrLogMessageProcessor::class,
            'with' => ['removeUsedContextFields' => true],
        ],
    ],
],
```

<a name="creating-custom-channels-via-factories"></a>
### 팩토리로 커스텀 채널 생성

Monolog의 인스턴스 생성 및 설정 전체를 직접 제어하는 완전히 커스텀한 채널을 만들고 싶다면, `config/logging.php`에 `custom` 드라이버 타입을 지정하고 `via` 옵션에 팩토리 클래스명을 지정합니다.

```php
'channels' => [
    'example-custom-channel' => [
        'driver' => 'custom',
        'via' => App\Logging\CreateCustomLogger::class,
    ],
],
```

`custom` 드라이버 채널을 설정했다면, 이제 실제로 Monolog 인스턴스를 생성할 팩토리 클래스를 만들어야 합니다. 이 클래스에는 전달받은 채널 설정 배열을 인자로 받아 Monolog 인스턴스를 반환하는 단일 `__invoke` 메서드만 있으면 됩니다.

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
## Pail을 이용한 로그 메시지 실시간 확인

실시간으로 애플리케이션 로그를 추적해야 할 때가 종종 있습니다. 예를 들어, 이슈를 디버깅할 때나 특정 오류를 실시간 모니터링할 때가 그렇습니다.

Laravel Pail은 라라벨 애플리케이션의 로그 파일을 커맨드라인에서 직접 빠르게 탐색할 수 있게 해주는 패키지입니다. 기존의 `tail` 명령과 달리 Pail은 Sentry나 Flare 같은 다양한 로그 드라이버와도 연동됩니다. 게다가, Pail은 원하는 정보를 빠르게 찾을 수 있도록 여러 강력한 필터 기능도 제공합니다.

<img src="https://laravel.com/img/docs/pail-example.png" />

<a name="pail-installation"></a>
### 설치

> [!WARNING]
> Laravel Pail을 사용하려면 [PHP 8.2 이상](https://php.net/releases/)과 [PCNTL 확장](https://www.php.net/manual/en/book.pcntl.php)이 필요합니다.

먼저 Composer 패키지 매니저로 Pail을 프로젝트에 설치합니다.

```shell
composer require laravel/pail
```

<a name="pail-usage"></a>
### 사용법

로그 실시간 추적을 시작하려면 다음 명령어를 실행합니다.

```shell
php artisan pail
```

출력의 상세 정보(줄임표가 아닌 전체 메시지)를 보고 싶다면 `-v` 옵션을 사용하세요.

```shell
php artisan pail -v
```

최대 상세 정보 및 예외의 스택 트레이스까지 모두 보려면 `-vv` 옵션을 사용합니다.

```shell
php artisan pail -vv
```

로그 추적을 중지하려면 언제든지 `Ctrl+C`를 누르면 됩니다.

<a name="pail-filtering-logs"></a>
### 로그 필터링

<a name="pail-filtering-logs-filter-option"></a>
#### `--filter` 옵션

`--filter` 옵션을 사용하면 로그의 타입, 파일, 메시지, 스택 트레이스 내용으로 필터링할 수 있습니다.

```shell
php artisan pail --filter="QueryException"
```

<a name="pail-filtering-logs-message-option"></a>
#### `--message` 옵션

로그 메시지 내용만으로 필터링하려면, `--message` 옵션을 사용하면 됩니다.

```shell
php artisan pail --message="User created"
```

<a name="pail-filtering-logs-level-option"></a>
#### `--level` 옵션

`--level` 옵션은 로그의 [로그 레벨](#log-levels) 값으로도 필터링할 수 있습니다.

```shell
php artisan pail --level=error
```

<a name="pail-filtering-logs-user-option"></a>
#### `--user` 옵션

특정 사용자가 인증된 상태에서 기록된 로그만 보고 싶다면, 해당 사용자의 ID를 `--user` 옵션으로 지정합니다.

```shell
php artisan pail --user=1
```
