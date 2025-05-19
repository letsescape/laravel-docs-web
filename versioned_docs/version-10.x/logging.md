# 로깅 (Logging)

- [소개](#introduction)
- [구성](#configuration)
    - [사용 가능한 채널 드라이버](#available-channel-drivers)
    - [채널 사전 준비 사항](#channel-prerequisites)
    - [사용 중단 경고 로깅](#logging-deprecation-warnings)
- [로그 스택 구축하기](#building-log-stacks)
- [로그 메시지 작성하기](#writing-log-messages)
    - [컨텍스트 정보](#contextual-information)
    - [특정 채널에 로그 남기기](#writing-to-specific-channels)
- [Monolog 채널 커스터마이징](#monolog-channel-customization)
    - [채널별 Monolog 커스터마이징](#customizing-monolog-for-channels)
    - [Monolog 핸들러 채널 생성](#creating-monolog-handler-channels)
    - [팩토리를 통한 커스텀 채널 생성](#creating-custom-channels-via-factories)
- [Pail로 로그 메시지 실시간 보기](#tailing-log-messages-using-pail)
    - [설치](#pail-installation)
    - [사용법](#pail-usage)
    - [로그 필터링](#pail-filtering-logs)

<a name="introduction"></a>
## 소개

애플리케이션 내에서 어떤 일이 일어나고 있는지 더 잘 파악할 수 있도록, 라라벨은 강력한 로깅 기능을 제공합니다. 이를 통해 메시지를 파일, 시스템 에러 로그, 또는 Slack 등으로 남길 수 있으며, 팀 전체에 알림을 보낼 수도 있습니다.

라라벨의 로깅 시스템은 "채널(channel)"을 기반으로 동작합니다. 각 채널은 로그 정보를 기록하는 특정 방식을 나타냅니다. 예를 들어, `single` 채널은 하나의 로그 파일에 모든 로그를 기록하며, `slack` 채널은 Slack으로 로그를 전송합니다. 로그 메시지는 심각도에 따라 여러 채널에 동시에 기록될 수도 있습니다.

라라벨은 내부적으로 [Monolog](https://github.com/Seldaek/monolog) 라이브러리를 사용합니다. Monolog은 다양한 강력한 로그 핸들러를 지원하며, 라라벨은 이러한 핸들러의 설정을 간단하게 할 수 있도록 도와줍니다. 여러 핸들러를 조합해 여러분의 애플리케이션에 맞는 로그 처리 방식을 쉽게 구축할 수 있습니다.

<a name="configuration"></a>
## 구성

애플리케이션의 로깅 동작과 관련된 모든 구성 옵션은 `config/logging.php` 설정 파일에 있습니다. 이 파일에서 로그 채널을 직접 구성할 수 있으니, 제공되는 각 채널과 그 옵션들을 꼭 살펴보시기 바랍니다. 아래에서 자주 사용되는 몇 가지 옵션을 소개합니다.

기본적으로 라라벨은 메시지를 로깅할 때 `stack` 채널을 사용합니다. `stack` 채널은 여러 로그 채널을 모아 하나의 채널처럼 동작하게 해줍니다. 스택 구축에 대한 자세한 내용은 [아래 문서](#building-log-stacks)를 참고하세요.

<a name="configuring-the-channel-name"></a>
#### 채널 이름 설정

기본적으로 Monolog 인스턴스는 현재 환경(`production` 또는 `local` 등)에 맞는 "채널 이름(channel name)"을 사용합니다. 이 값을 변경하려면 채널 설정에 `name` 옵션을 추가하면 됩니다.

```
'stack' => [
    'driver' => 'stack',
    'name' => 'channel-name',
    'channels' => ['single', 'slack'],
],
```

<a name="available-channel-drivers"></a>
### 사용 가능한 채널 드라이버

각 로그 채널은 "드라이버(driver)"에 의해 동작합니다. 드라이버는 실제로 로그 메시지가 기록되는 방법과 위치를 결정합니다. 아래는 모든 라라벨 애플리케이션에서 사용 가능한 로그 채널 드라이버의 목록입니다. 대부분의 드라이버는 이미 `config/logging.php` 파일에 기본적으로 포함되어 있으니 꼭 내용을 확인해보시기 바랍니다.

<div class="overflow-auto">

이름 | 설명
------------- | -------------
`custom` | 지정한 팩토리를 호출하여 채널을 생성하는 드라이버
`daily` | 매일 로그 파일을 분리하여 기록하는 `RotatingFileHandler` 기반 Monolog 드라이버
`errorlog` | 시스템의 ErrorLog에 기록하는 `ErrorLogHandler` 기반 Monolog 드라이버
`monolog` | 지원되는 모든 Monolog 핸들러를 사용할 수 있는 Monolog 팩토리 드라이버
`papertrail` | `SyslogUdpHandler` 기반 Monolog 드라이버
`single` | 하나의 파일이나 경로에 기록하는 로거 채널 (`StreamHandler`)
`slack` | Slack으로 로그를 보내는 `SlackWebhookHandler` 기반 Monolog 드라이버
`stack` | 여러 채널을 묶는 "멀티채널" 생성을 돕는 래퍼 채널
`syslog` | 시스템의 Syslog에 기록하는 `SyslogHandler` 기반 Monolog 드라이버

</div>

> [!NOTE]
> `monolog` 및 `custom` 드라이버에 대한 더 자세한 내용은 [채널 커스터마이징 문서](#monolog-channel-customization)를 참고하세요.

<a name="channel-prerequisites"></a>
### 채널 사전 준비 사항

<a name="configuring-the-single-and-daily-channels"></a>
#### Single 및 Daily 채널 설정하기

`single`과 `daily` 채널은 `bubble`, `permission`, `locking`의 세 가지 선택적 설정 옵션을 제공합니다.

<div class="overflow-auto">

이름 | 설명 | 기본값
------------- | ------------- | -------------
`bubble` | 메시지 처리 후 다른 채널로 전파할지 여부 | `true`
`locking` | 로그 파일에 기록하기 전 잠금 시도 여부 | `false`
`permission` | 로그 파일의 퍼미션(권한) | `0644`

</div>

또한, `daily` 채널에서는 `days` 옵션을 통해서 로그 파일의 보관 기간(일)을 설정할 수 있습니다.

<div class="overflow-auto">

이름 | 설명                                                       | 기본값
------------- |-------------------------------------------------------------------| -------------
`days` | 일별 로그 파일의 보관 일수 | `7`

</div>

<a name="configuring-the-papertrail-channel"></a>
#### Papertrail 채널 설정

`papertrail` 채널을 사용하려면 반드시 `host`와 `port` 구성 옵션이 필요합니다. 이 값들은 [Papertrail 공식 가이드](https://help.papertrailapp.com/kb/configuration/configuring-centralized-logging-from-php-apps/#send-events-from-php-app)에서 확인할 수 있습니다.

<a name="configuring-the-slack-channel"></a>
#### Slack 채널 설정

`slack` 채널 사용을 위해서는 `url` 설정값이 필요합니다. 이 URL은 Slack 팀을 위한 [Incoming Webhook](https://slack.com/apps/A0F7XDUAZ-incoming-webhooks)에서 발급받아 사용하셔야 합니다.

기본적으로 Slack으로는 `critical` 이상 로그만 전송됩니다. 하지만, 이 조건은 `config/logging.php` 파일 내 Slack 채널의 `level` 옵션을 수정함으로써 원하는 레벨로 조정할 수 있습니다.

<a name="logging-deprecation-warnings"></a>
### 사용 중단 경고 로깅

PHP, 라라벨 그리고 기타 라이브러리들은 경우에 따라 일부 기능이 사용 중단(deprecated)되었으며, 향후 버전에서 제거될 예정임을 사용자에게 알립니다. 이런 사용 중단 경고를 로그로 남기고 싶다면, `config/logging.php` 파일의 `deprecations` 로그 채널 옵션을 설정하세요.

```
'deprecations' => env('LOG_DEPRECATIONS_CHANNEL', 'null'),

'channels' => [
    ...
]
```

또는, `deprecations`라는 이름의 로그 채널을 별도로 정의할 수도 있습니다. 이러한 채널이 설정되어 있다면, 사용 중단 메시지는 항상 이 채널에 기록됩니다.

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

앞서 언급한 것처럼, `stack` 드라이버를 이용하면 여러 채널을 하나의 로그 채널로 묶어 사용할 수 있습니다. 아래는 실제 운영 환경에서 볼 수 있는 예시 설정입니다.

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

이 구성을 하나씩 살펴보면, 먼저 `stack` 채널의 `channels` 옵션에 `syslog`와 `slack`이 포함되어 있습니다. 즉, 로그 메시지는 두 채널 모두에 기록될 수 있습니다. 하지만 실제로 로그가 어떤 채널에 기록될지는 메시지의 심각도(레벨)에 따라 달라질 수 있습니다.

<a name="log-levels"></a>
#### 로그 레벨

위 예시에서 `syslog`와 `slack` 채널 설정에 `level` 옵션이 포함되어 있습니다. 이 옵션은 해당 채널이 메시지를 기록하기 위한 최소 "레벨"을 지정합니다. 라라벨의 로깅 서비스는 Monolog을 기반으로 하며, [RFC 5424 표준](https://tools.ietf.org/html/rfc5424)에 정의된 모든 로그 레벨을 지원합니다. 심각도가 높은 순서대로, **emergency**, **alert**, **critical**, **error**, **warning**, **notice**, **info**, **debug**가 있습니다.

예를 들어, 아래와 같이 `debug` 메서드로 로그를 남기는 경우를 생각해봅니다.

```
Log::debug('An informational message.');
```

이 경우, `syslog` 채널은 메시지를 시스템 로그에 기록합니다. 하지만, 이 메시지가 `critical` 레벨 이상이 아니기 때문에 Slack에는 전송되지 않습니다. 반대로 `emergency` 레벨의 로그라면, 두 채널 모두에 메시지가 기록됩니다. 왜냐하면 `emergency`는 양쪽 채널의 최소 레벨 조건을 모두 충족하기 때문입니다.

```
Log::emergency('The system is down!');
```

<a name="writing-log-messages"></a>
## 로그 메시지 작성하기

로그를 작성하려면 `Log` [파사드](/docs/10.x/facades)를 사용할 수 있습니다. 위에서 언급한 [RFC 5424 표준](https://tools.ietf.org/html/rfc5424)에 명시된 여덟 가지 로깅 레벨, 즉 **emergency**, **alert**, **critical**, **error**, **warning**, **notice**, **info**, **debug** 메서드를 제공합니다.

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

각 메서드를 호출해 해당 레벨의 메시지를 로그로 남길 수 있습니다. 기본적으로 이 메시지는 `logging` 설정 파일에서 지정한 기본 로그 채널에 기록됩니다.

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
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

로그 메서드에 추가 정보를 담은 배열을 함께 전달할 수 있습니다. 이 컨텍스트 정보는 로그 메시지와 함께 포맷되어 표시됩니다.

```
use Illuminate\Support\Facades\Log;

Log::info('User {id} failed to login.', ['id' => $user->id]);
```

경우에 따라, 특정 채널에 포함될 모든 로그 메시지에 컨텍스트 정보를 추가하고 싶을 수 있습니다. 예를 들어, 모든 요청에 대한 ID를 로그에 남기고 싶다면, `Log` 파사드의 `withContext` 메서드를 사용하세요.

```
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

_모든_ 로깅 채널에서 동일한 컨텍스트 정보를 공유하고 싶다면, `Log::shareContext()` 메서드를 사용할 수 있습니다. 이 메서드는 이미 생성된 채널은 물론, 이후 새로 생성되는 모든 채널에도 컨텍스트 정보를 전달합니다.

```
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
> 큐 작업 처리를 하는 도중에 로그 컨텍스트를 공유해야 한다면, [Job 미들웨어](/docs/10.x/queues#job-middleware)를 활용할 수 있습니다.

<a name="writing-to-specific-channels"></a>
### 특정 채널에 로그 남기기

기본 채널이 아닌 다른 채널에 로그 메시지를 남기고 싶을 때는, `Log` 파사드의 `channel` 메서드를 사용하여 구성 파일에 정의된 채널을 지정할 수 있습니다.

```
use Illuminate\Support\Facades\Log;

Log::channel('slack')->info('Something happened!');
```

여러 채널을 묶어 임시로 로그 스택을 만들고 싶다면, `stack` 메서드를 사용하세요.

```
Log::stack(['single', 'slack'])->info('Something happened!');
```

<a name="on-demand-channels"></a>
#### 온디맨드(즉석) 채널

`logging` 설정 파일에 따로 정의하지 않고, 런타임에 즉석으로 구성해서 채널을 만들 수도 있습니다. 이럴 땐 `Log` 파사드의 `build` 메서드에 설정 배열을 넘기면 됩니다.

```
use Illuminate\Support\Facades\Log;

Log::build([
  'driver' => 'single',
  'path' => storage_path('logs/custom.log'),
])->info('Something happened!');
```

또한, 온디맨드 채널을 온디맨드 로그 스택에 포함시킬 수도 있습니다. 즉석에서 만든 채널 인스턴스를 `stack` 메서드에 배열로 전달하세요.

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
### 채널별 Monolog 커스터마이징

가끔은 특정 Monolog 채널이 생성된 이후 Monolog 인스턴스를 완전히 제어하고 싶을 수 있습니다. 예를 들어, 라라벨 내장 `single` 채널에 커스텀 Monolog `FormatterInterface` 구현을 적용하고 싶을 때가 대표적입니다.

이를 위해 채널 설정에 `tap` 배열을 추가할 수 있습니다. 이 배열에는 Monolog 인스턴스가 생성된 후, 그 인스턴스를 조작할 수 있는 클래스들의 목록을 나열합니다. 이 클래스들을 저장할 디렉터리는 자유롭게 만들면 되며 별도의 규칙은 없습니다.

```
'single' => [
    'driver' => 'single',
    'tap' => [App\Logging\CustomizeFormatter::class],
    'path' => storage_path('logs/laravel.log'),
    'level' => 'debug',
],
```

`tap` 옵션에 클래스를 추가한 후, Monolog 인스턴스를 커스터마이징하는 클래스를 만들면 됩니다. 이 클래스는 `__invoke` 메서드만 있으면 됩니다. 이 메서드는 `Illuminate\Log\Logger` 인스턴스를 받으며, 이 인스턴스는 내부적으로 모든 호출을 Monolog 인스턴스로 전달합니다.

```
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
> 모든 "tap" 클래스는 [서비스 컨테이너](/docs/10.x/container)에서 자동으로 의존성이 주입되어 인스턴스화됩니다.

<a name="creating-monolog-handler-channels"></a>
### Monolog 핸들러 채널 생성

Monolog은 [다양한 핸들러](https://github.com/Seldaek/monolog/tree/main/src/Monolog/Handler)를 제공하지만, 라라벨은 모든 핸들러에 대해 기본 채널을 제공하지는 않습니다. 특정 Monolog 핸들러를 활용하고 싶지만 라라벨 기본 드라이버가 없다면, `monolog` 드라이버로 쉽게 커스텀 채널을 만들 수 있습니다.

`monolog` 드라이버를 사용할 때는, `handler` 옵션에 사용할 핸들러를 지정합니다. 핸들러 생성자에 전달할 추가 인자가 있다면, `with` 옵션을 사용하세요.

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
#### Monolog 포매터

`monolog` 드라이버를 사용하면, 기본으로 Monolog의 `LineFormatter`가 핸들러에 적용됩니다. 하지만, `formatter` 와 `formatter_with` 옵션을 통해 포매터 타입과 옵션을 커스터마이즈할 수 있습니다.

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

Monolog 핸들러 자체적으로 포매터를 제공하는 경우라면, `formatter` 옵션을 `default`로 지정할 수 있습니다.

```
'newrelic' => [
    'driver' => 'monolog',
    'handler' => Monolog\Handler\NewRelicHandler::class,
    'formatter' => 'default',
],
```

<a name="monolog-processors"></a>
#### Monolog 프로세서

Monolog은 로그 메시지를 기록하기 전에 가공 처리할 수 있도록 프로세서 기능을 제공합니다. 직접 커스텀 프로세서를 만들 수도 있고, [Monolog이 제공하는 기본 프로세서들](https://github.com/Seldaek/monolog/tree/main/src/Monolog/Processor)도 사용할 수 있습니다.

`monolog` 드라이버에서 프로세서를 지정하려면, 채널 설정에 `processors` 값을 추가하세요.

```
 'memory' => [
     'driver' => 'monolog',
     'handler' => Monolog\Handler\StreamHandler::class,
     'with' => [
         'stream' => 'php://stderr',
     ],
     'processors' => [
         // 간단하게 지정...
         Monolog\Processor\MemoryUsageProcessor::class,

         // 옵션과 함께 사용...
         [
            'processor' => Monolog\Processor\PsrLogMessageProcessor::class,
            'with' => ['removeUsedContextFields' => true],
        ],
     ],
 ],
```

<a name="creating-custom-channels-via-factories"></a>
### 팩토리를 통한 커스텀 채널 생성

Monolog 인스턴스의 생성 및 설정을 전적으로 직접 제어하고 싶은 경우, `config/logging.php`에 `custom` 드라이버를 지정해 채널을 만들 수 있습니다. 이때, Monolog 인스턴스를 생성할 팩토리 클래스명을 `via` 옵션에 입력합니다.

```
'channels' => [
    'example-custom-channel' => [
        'driver' => 'custom',
        'via' => App\Logging\CreateCustomLogger::class,
    ],
],
```

이제, `custom` 드라이버용 클래스를 생성하면 됩니다. 이 클래스는 단 하나의 `__invoke` 메서드만 있으면 되며, 이 메서드는 채널 설정 배열을 인자로 받아 Monolog 로거 인스턴스를 반환해야 합니다.

```
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
## Pail로 로그 메시지 실시간 보기

애플리케이션 로그를 실시간으로 모니터링해야 할 때가 많습니다. 예를 들어, 문제를 디버깅하거나 특정 에러 유형을 실시간으로 감시하고 싶을 때가 있습니다.

Laravel Pail은 CLI에서 라라벨 애플리케이션 로그 파일을 손쉽게 탐색할 수 있도록 도와주는 패키지입니다. 표준 `tail` 커맨드와 달리, Pail은 Sentry나 Flare 등 어떤 로그 드라이버와도 연동됩니다. 또한, 원하는 정보를 빠르게 찾을 수 있도록 다양한 필터 기능도 제공합니다.

<img src="https://laravel.com/img/docs/pail-example.png" />

<a name="pail-installation"></a>
### 설치

> [!WARNING]
> Laravel Pail은 [PHP 8.2 이상](https://php.net/releases/) 및 [PCNTL](https://www.php.net/manual/en/book.pcntl.php) 확장이 필요합니다.

먼저, Composer 패키지 매니저를 이용해 Pail을 프로젝트에 설치하세요.

```bash
composer require laravel/pail
```

<a name="pail-usage"></a>
### 사용법

로그를 실시간으로 확인하려면 다음처럼 `pail` 명령어를 실행하세요.

```bash
php artisan pail
```

출력의 상세 정도를 높이고 줄임표(…) 없이 전체 로그를 보려면 `-v` 옵션을 사용합니다.

```bash
php artisan pail -v
```

최고 수준의 상세 출력과 예외 발생 시 스택 트레이스까지 보고 싶다면 `-vv` 옵션을 사용하세요.

```bash
php artisan pail -vv
```

로그 실시간 출력을 중지하려면 언제든 `Ctrl+C`를 누르면 됩니다.

<a name="pail-filtering-logs"></a>
### 로그 필터링

<a name="pail-filtering-logs-filter-option"></a>
#### `--filter`

`--filter` 옵션을 사용하면 로그의 타입, 파일, 메시지, 스택 트레이스 내용을 기준으로 필터링할 수 있습니다.

```bash
php artisan pail --filter="QueryException"
```

<a name="pail-filtering-logs-message-option"></a>
#### `--message`

로그 메시지만을 기준으로 필터링하고 싶을 때는 `--message` 옵션을 사용하세요.

```bash
php artisan pail --message="User created"
```

<a name="pail-filtering-logs-level-option"></a>
#### `--level`

`--level` 옵션을 사용하면 [로그 레벨](#log-levels)별로 로그를 필터링할 수 있습니다.

```bash
php artisan pail --level=error
```

<a name="pail-filtering-logs-user-option"></a>
#### `--user`

특정 사용자가 인증된 상태에서 기록된 로그만 보고 싶을 땐, 해당 사용자의 ID를 `--user` 옵션에 전달하세요.

```bash
php artisan pail --user=1
```
