# 로깅 (Logging)

- [소개](#introduction)
- [설정](#configuration)
    - [사용 가능한 채널 드라이버](#available-channel-drivers)
    - [채널 사전 준비사항](#channel-prerequisites)
    - [사용 중단 경고 로깅](#logging-deprecation-warnings)
- [로그 스택 구성하기](#building-log-stacks)
- [로그 메시지 작성하기](#writing-log-messages)
    - [컨텍스트 정보 추가하기](#contextual-information)
    - [특정 채널로 기록하기](#writing-to-specific-channels)
- [Monolog 채널 커스터마이징](#monolog-channel-customization)
    - [채널별 Monolog 커스터마이즈](#customizing-monolog-for-channels)
    - [Monolog 핸들러 채널 만들기](#creating-monolog-handler-channels)
    - [팩토리로 커스텀 채널 생성](#creating-custom-channels-via-factories)
- [Pail을 사용한 로그 실시간 확인](#tailing-log-messages-using-pail)
    - [설치](#pail-installation)
    - [사용법](#pail-usage)
    - [로그 필터링](#pail-filtering-logs)

<a name="introduction"></a>
## 소개

애플리케이션에서 어떤 일이 일어나고 있는지 더 잘 파악할 수 있도록, 라라벨은 파일, 시스템 에러 로그, 슬랙(Slack) 등 다양한 위치에 로그 메시지를 기록할 수 있는 강력한 로깅 서비스를 제공합니다. 이를 통해 전체 팀과 중요 정보를 쉽게 공유할 수 있습니다.

라라벨의 로깅은 "채널(channel)" 기반으로 동작합니다. 각 채널은 로그 정보를 기록하는 특정 방식을 의미합니다. 예를 들어, `single` 채널은 하나의 로그 파일에 기록하며, `slack` 채널은 로그 메시지를 슬랙으로 전송합니다. 로그 메시지는 심각도(severity)에 따라 여러 채널에 동시에 기록될 수도 있습니다.

내부적으로 라라벨은 [Monolog](https://github.com/Seldaek/monolog) 라이브러리를 활용합니다. 이 라이브러리는 다양한 강력한 로그 핸들러를 지원하며, 라라벨은 이러한 핸들러를 손쉽게 설정할 수 있게 도와줍니다. 원하는 대로 조합해 애플리케이션의 로그 처리 방식을 맞춤 설정할 수 있습니다.

<a name="configuration"></a>
## 설정

애플리케이션의 로깅 동작을 제어하는 모든 설정 옵션은 `config/logging.php` 설정 파일에 있습니다. 이 파일에서 로그 채널을 설정할 수 있으니, 사용 가능한 각 채널과 관련 옵션을 꼭 확인해 보시기 바랍니다. 아래에서 몇 가지 일반적인 옵션을 살펴보겠습니다.

기본적으로 라라벨은 로그 메시지를 기록할 때 `stack` 채널을 사용합니다. `stack` 채널은 여러 개의 로그 채널을 하나로 묶을 때 사용합니다. 스택 구성 방법에 대한 자세한 내용은 [아래 설명](#building-log-stacks)을 참고하세요.

<a name="available-channel-drivers"></a>
### 사용 가능한 채널 드라이버

각 로그 채널은 "드라이버(driver)"에 의해 동작합니다. 드라이버는 로그 메시지가 실제로 어디에, 어떤 방식으로 기록될지 결정합니다. 아래는 모든 라라벨 애플리케이션에서 사용할 수 있는 로그 채널 드라이버 목록입니다. 대부분의 드라이버는 이미 애플리케이션의 `config/logging.php` 파일에 항목이 작성되어 있으니, 파일을 확인해 보며 어떤 설정이 있는지 익혀두세요.

<div class="overflow-auto">

| 이름           | 설명                                                                       |
| -------------- | -------------------------------------------------------------------------- |
| `custom`       | 지정한 팩토리를 호출해 채널을 생성하는 드라이버                           |
| `daily`        | 매일 로그 파일을 교체하는 `RotatingFileHandler` 기반 Monolog 드라이버      |
| `errorlog`     | `ErrorLogHandler` 기반 Monolog 드라이버                                    |
| `monolog`      | 지원되는 모든 Monolog 핸들러를 사용할 수 있는 Monolog 팩토리 드라이버      |
| `papertrail`   | `SyslogUdpHandler` 기반 Monolog 드라이버                                   |
| `single`       | 단일 파일 또는 경로에 기록하는 로거 채널(`StreamHandler`)                  |
| `slack`        | `SlackWebhookHandler` 기반 Monolog 드라이버                                |
| `stack`        | 여러 채널을 하나의 "멀티 채널"로 만들기 위한 래퍼                         |
| `syslog`       | `SyslogHandler` 기반 Monolog 드라이버                                      |

</div>

> [!NOTE]  
> `monolog` 및 `custom` 드라이버에 대한 더 자세한 정보를 원하시면 [고급 채널 커스터마이징](#monolog-channel-customization) 문서를 참고하세요.

<a name="configuring-the-channel-name"></a>
#### 채널 이름 설정

기본적으로 Monolog는 현재 환경(예: `production`, `local`) 이름과 동일한 "채널 이름"으로 인스턴스화됩니다. 이 값을 변경하려면, 해당 채널 설정에 `name` 옵션을 추가하세요.

```
'stack' => [
    'driver' => 'stack',
    'name' => 'channel-name',
    'channels' => ['single', 'slack'],
],
```

<a name="channel-prerequisites"></a>
### 채널 사전 준비사항

<a name="configuring-the-single-and-daily-channels"></a>
#### Single 및 Daily 채널 설정

`single` 및 `daily` 채널에는 `bubble`, `permission`, `locking`이라는 세 가지 옵션이 있습니다. 모두 선택적으로 설정할 수 있습니다.

<div class="overflow-auto">

| 이름           | 설명                                                                      | 기본값   |
| -------------- | ------------------------------------------------------------------------- | -------- |
| `bubble`       | 메시지 처리 후, 다른 채널로도 메시지가 전달될지 여부를 결정                | `true`   |
| `locking`      | 기록 전 로그 파일을 잠글지 시도할지 여부                                  | `false`  |
| `permission`   | 로그 파일 권한 지정                                                       | `0644`   |

</div>

또한, `daily` 채널의 보관 기간은 `LOG_DAILY_DAYS` 환경 변수 또는 `days` 설정 옵션을 통해 지정할 수 있습니다.

<div class="overflow-auto">

| 이름    | 설명                                       | 기본값   |
| ------- | ------------------------------------------ | -------- |
| `days`  | 일자별로 저장되는 로그 파일의 유지 기간(일) | `14`     |

</div>

<a name="configuring-the-papertrail-channel"></a>
#### Papertrail 채널 설정

`papertrail` 채널은 `host`, `port` 설정이 필수입니다. 이 값들은 `PAPERTRAIL_URL`, `PAPERTRAIL_PORT` 환경 변수로 정의할 수 있으며, [Papertrail 공식 문서](https://help.papertrailapp.com/kb/configuration/configuring-centralized-logging-from-php-apps/#send-events-from-php-app)에서 확인할 수 있습니다.

<a name="configuring-the-slack-channel"></a>
#### Slack 채널 설정

`slack` 채널을 사용하려면 `url` 설정이 필요합니다. 해당 값은 `LOG_SLACK_WEBHOOK_URL` 환경 변수로 지정할 수 있습니다. 이 URL은 미리 슬랙 팀에 생성해둔 [incoming webhook](https://slack.com/apps/A0F7XDUAZ-incoming-webhooks) 주소와 일치해야 합니다.

기본적으로 Slack에는 `critical` 수준 이상의 로그만 전달됩니다. 하지만 `LOG_LEVEL` 환경 변수나 Slack 로그 채널 설정 배열의 `level` 옵션을 변경해 원하는 수준을 조정할 수 있습니다.

<a name="logging-deprecation-warnings"></a>
### 사용 중단 경고 로깅

PHP, 라라벨 및 기타 라이브러리는 사용이 중단(deprecated)된 기능이 있다면, 머지않아 제거될 예정임을 사용자에게 알리는 경고를 제공합니다. 이런 사용 중단 경고도 로그로 남기고 싶다면, `LOG_DEPRECATIONS_CHANNEL` 환경 변수나, 애플리케이션의 `config/logging.php` 파일 내에서 원하는 `deprecations` 로그 채널을 설정할 수 있습니다.

```
'deprecations' => [
    'channel' => env('LOG_DEPRECATIONS_CHANNEL', 'null'),
    'trace' => env('LOG_DEPRECATIONS_TRACE', false),
],

'channels' => [
    // ...
]
```

또는, `deprecations`라는 이름의 로그 채널을 따로 정의할 수도 있습니다. 해당 이름의 채널이 존재하면, 항상 사용 중단 경고 로그는 이 채널을 통해 기록됩니다.

```
'channels' => [
    'deprecations' => [
        'driver' => 'single',
        'path' => storage_path('logs/php-deprecation-warnings.log'),
    ],
],
```

<a name="building-log-stacks"></a>
## 로그 스택 구성하기

앞서 언급한 것처럼, `stack` 드라이버는 여러 채널을 하나의 로그 채널로 결합할 수 있게 해줍니다. 실무 환경에서의 활용 예시를 보면 다음과 같은 설정을 볼 수 있습니다.

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

이 설정을 살펴보면, 우선 `stack` 채널이 `channels` 옵션을 통해 `syslog`와 `slack` 두 개의 다른 채널을 모으고 있다는 점을 확인할 수 있습니다. 따라서 로그 메시지를 기록할 때, 두 채널 모두 해당 메시지를 받아 적절하게 처리하게 됩니다. 다만, 실제로 로그로 기록되는지 여부는 다음에서 설명하는 심각도(level) 설정에 따라 달라집니다.

<a name="log-levels"></a>
#### 로그 레벨

위 예시에서 `syslog`와 `slack` 채널 설정에 `level` 옵션이 지정된 것을 볼 수 있습니다. 이 값은 해당 채널이 로그 메시지를 기록하기 위한 최소 "레벨"을 지정합니다. 라라벨의 로깅은 Monolog를 사용하며, Monolog는 [RFC 5424 스펙](https://tools.ietf.org/html/rfc5424)에 정의된 모든 로그 레벨을 지원합니다. 심각도 순서대로 **emergency**, **alert**, **critical**, **error**, **warning**, **notice**, **info**, **debug**가 있습니다.

예를 들어, `debug` 메서드를 이용해 로그를 남기는 경우를 생각해봅시다.

```
Log::debug('An informational message.');
```

위 설정에서는 `syslog` 채널이 시스템 로그로 메시지를 기록합니다. 하지만 이 로그 메시지는 `critical` 이상이 아니므로 Slack으로는 전송되지 않습니다. 반면 `emergency` 레벨의 메시지를 남긴다면, 두 채널 모두 메시지를 기록하게 됩니다. 왜냐하면 `emergency`는 양쪽 채널 모두의 레벨 임계값보다 높은 심각도이기 때문입니다.

```
Log::emergency('The system is down!');
```

<a name="writing-log-messages"></a>
## 로그 메시지 작성하기

로그 메시지는 `Log` [파사드](/docs/11.x/facades)를 사용해 남길 수 있습니다. 앞서 설명했듯이, 라라벨의 logger는 [RFC 5424 스펙](https://tools.ietf.org/html/rfc5424)에서 정의한 여덟 가지 로그 레벨 메서드를 제공합니다: **emergency**, **alert**, **critical**, **error**, **warning**, **notice**, **info**, **debug**입니다.

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

이러한 메서드 중 아무거나 호출해 해당 레벨로 로그를 남길 수 있습니다. 기본적으로 메시지는 `logging` 설정 파일에 지정한 기본 로그 채널에 기록됩니다.

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
     * 주어진 사용자의 프로필을 보여줍니다.
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
### 컨텍스트 정보 추가하기

로그 메서드에 컨텍스트 정보를 배열로 전달할 수 있습니다. 이 컨텍스트 데이터는 로그 메시지와 함께 포맷되어 표시됩니다.

```
use Illuminate\Support\Facades\Log;

Log::info('User {id} failed to login.', ['id' => $user->id]);
```

때로는, 특정 요청에 대한 식별자 등 모든 이후의 로그 항목에 추가적으로 포함되어야 하는 컨텍스트 정보를 설정하고 싶을 수 있습니다. 이럴 때는 `Log` 파사드의 `withContext` 메서드를 사용하면 됩니다.

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
     * 들어오는 요청을 처리합니다.
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

만약 _모든_ 로깅 채널에 걸쳐 컨텍스트 정보를 공유하고 싶다면, `Log::shareContext()` 메서드를 사용할 수 있습니다. 이 메서드는 이미 생성된 모든 채널과 이후 생성되는 채널에 해당 컨텍스트 정보를 제공합니다.

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
     * 들어오는 요청을 처리합니다.
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
> 큐 처리 중에도 로그 컨텍스트를 공유하려면 [잡 미들웨어](/docs/11.x/queues#job-middleware)를 사용할 수 있습니다.

<a name="writing-to-specific-channels"></a>
### 특정 채널로 기록하기

기본 로그 채널이 아닌 다른 채널로 메시지를 남기고 싶을 때도 있습니다. 이럴 때는 `Log` 파사드의 `channel` 메서드로, 설정 파일에 정의된 아무 채널이나 가져와 사용할 수 있습니다.

```
use Illuminate\Support\Facades\Log;

Log::channel('slack')->info('Something happened!');
```

여러 채널로 이루어진 "온디맨드(즉시 생성) 스택"이 필요하다면, `stack` 메서드를 활용할 수 있습니다.

```
Log::stack(['single', 'slack'])->info('Something happened!');
```

<a name="on-demand-channels"></a>
#### 온디맨드 채널

애플리케이션의 로그 설정 파일에 별도로 등록하지 않고, 런타임에 직접 구성 정보를 전달해 온디맨드(즉시)로 채널을 만들 수도 있습니다. 이때는 `Log` 파사드의 `build` 메서드를 사용해 배열 형태의 설정을 넘기면 됩니다.

```
use Illuminate\Support\Facades\Log;

Log::build([
  'driver' => 'single',
  'path' => storage_path('logs/custom.log'),
])->info('Something happened!');
```

온디맨드 채널을 온디맨드 스택에 추가하고 싶다면, 이렇게 채널 인스턴스를 스택에 배열로 넘길 수 있습니다.

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
### 채널별 Monolog 커스터마이즈

경우에 따라, 기존 채널의 Monolog 인스턴스를 어떻게 구성할지 완전히 제어하고 싶을 수 있습니다. 예를 들어, 라라벨에서 기본 제공하는 `single` 채널에 대해 커스텀 Monolog `FormatterInterface` 구현체를 사용하고 싶을 수 있습니다.

이를 위해서는, 해당 채널 설정에 `tap` 배열을 추가하면 됩니다. `tap` 배열에는 Monolog 인스턴스가 생성된 뒤 커스터마이징(또는 "탭")할 수 있는 클래스들의 목록을 지정합니다. 이 클래스들을 구성할 디렉터리 위치에 대한 특별한 규칙은 없으니, 원하는 위치에 자유롭게 작성해도 됩니다.

```
'single' => [
    'driver' => 'single',
    'tap' => [App\Logging\CustomizeFormatter::class],
    'path' => storage_path('logs/laravel.log'),
    'level' => env('LOG_LEVEL', 'debug'),
    'replace_placeholders' => true,
],
```

`tap` 옵션 설정이 끝났으면, 이제 Monolog 인스턴스를 실제로 커스터마이징할 클래스를 작성합니다. 이 클래스는 `__invoke`라는 하나의 메서드만 있으면 되고, 이 메서드는 `Illuminate\Log\Logger` 인스턴스를 인자로 받습니다. 이 인스턴스는 모든 메서드 호출을 실제 Monolog 인스턴스로 전달합니다.

```
<?php

namespace App\Logging;

use Illuminate\Log\Logger;
use Monolog\Formatter\LineFormatter;

class CustomizeFormatter
{
    /**
     * 주어진 로거 인스턴스를 커스터마이징합니다.
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
> 모든 "tap" 클래스는 [서비스 컨테이너](/docs/11.x/container)에서 자동으로 해석되므로, 생성자에서 의존성이 필요하면 자동 주입됩니다.

<a name="creating-monolog-handler-channels"></a>
### Monolog 핸들러 채널 만들기

Monolog에는 [다양한 핸들러](https://github.com/Seldaek/monolog/tree/main/src/Monolog/Handler)가 있지만, 라라벨은 모든 핸들러에 대해 별도의 채널을 제공하지 않습니다. 따라서, 라라벨 내장 로그 드라이버가 없는 특정 Monolog 핸들러 인스턴스로만 구성된 커스텀 채널을 만들고 싶을 때가 있을 수 있습니다. 이런 채널은 `monolog` 드라이버를 이용해 쉽게 생성할 수 있습니다.

`monolog` 드라이버 사용 시, `handler` 옵션에 사용할 핸들러를 지정합니다. 핸들러에 생성자 인자가 필요하다면, `with` 옵션으로 제공할 수 있습니다.

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

`monolog` 드라이버를 쓸 때는, 기본적으로 Monolog의 `LineFormatter`가 포매터로 사용됩니다. 하지만, `formatter` 및 `formatter_with` 옵션을 이용해 다른 포매터로 커스터마이즈할 수 있습니다.

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

Monolog 핸들러가 자체적으로 포매터를 제공할 수 있고, 이를 활용하고 싶다면 `formatter` 옵션 값을 `default`로 지정하면 됩니다.

```
'newrelic' => [
    'driver' => 'monolog',
    'handler' => Monolog\Handler\NewRelicHandler::class,
    'formatter' => 'default',
],
```

<a name="monolog-processors"></a>
#### Monolog 프로세서

Monolog는 로그 메시지를 기록하기 전 사전 처리할 수 있습니다. 직접 프로세서를 만들거나, [이미 제공되는 프로세서 목록](https://github.com/Seldaek/monolog/tree/main/src/Monolog/Processor)을 활용할 수 있습니다.

`monolog` 드라이버의 프로세서를 커스터마이징하고 싶다면, 채널 설정에 `processors` 값을 추가하세요.

```
 'memory' => [
     'driver' => 'monolog',
     'handler' => Monolog\Handler\StreamHandler::class,
     'with' => [
         'stream' => 'php://stderr',
     ],
     'processors' => [
         // 간단하게 클래스명만 작성하는 경우...
         Monolog\Processor\MemoryUsageProcessor::class,

         // 옵션이 필요한 경우...
         [
            'processor' => Monolog\Processor\PsrLogMessageProcessor::class,
            'with' => ['removeUsedContextFields' => true],
        ],
     ],
 ],
```

<a name="creating-custom-channels-via-factories"></a>
### 팩토리로 커스텀 채널 생성

Monolog의 인스턴스화와 설정 전체를 직접 완전히 제어하는 완전한 커스텀 채널을 만들고 싶다면, `config/logging.php` 파일에서 `custom` 드라이버 유형을 지정할 수 있습니다. 이때 `via` 옵션에 Monolog 인스턴스를 생성할 팩토리 클래스명을 지정해야 합니다.

```
'channels' => [
    'example-custom-channel' => [
        'driver' => 'custom',
        'via' => App\Logging\CreateCustomLogger::class,
    ],
],
```

`custom` 채널을 설정했으면, Monolog 인스턴스를 실제로 생성하는 클래스를 만듭니다. 이 클래스는 `__invoke` 메서드 하나만 있으면 되고, 인자로 채널의 설정 배열을 받으며, Monolog logger 인스턴스를 반환해야 합니다.

```
<?php

namespace App\Logging;

use Monolog\Logger;

class CreateCustomLogger
{
    /**
     * 커스텀 Monolog 인스턴스를 생성합니다.
     */
    public function __invoke(array $config): Logger
    {
        return new Logger(/* ... */);
    }
}
```

<a name="tailing-log-messages-using-pail"></a>
## Pail을 사용한 로그 실시간 확인

실시간으로 애플리케이션 로그를 확인해야 할 때가 종종 있습니다. 예를 들어, 오류를 디버깅할 때나 특정 에러 유형을 실시간으로 모니터링할 때가 해당됩니다.

Laravel Pail은 커맨드라인에서 라라벨 애플리케이션의 로그 파일을 쉽게 실시간으로 확인할 수 있게 도와주는 패키지입니다. 표준 `tail` 명령과 달리, Pail은 Sentry나 Flare 같은 다양한 로그 드라이버와도 호환되도록 설계되어 있습니다. 또한, 빠르게 원하는 정보를 찾을 수 있게 도와주는 다양한 유용한 필터 기능도 제공합니다.

<img src="https://laravel.com/img/docs/pail-example.png" />

<a name="pail-installation"></a>
### 설치

> [!WARNING]  
> Laravel Pail을 사용하려면 [PHP 8.2+](https://php.net/releases/)와 [PCNTL](https://www.php.net/manual/en/book.pcntl.php) 확장 설치가 필요합니다.

우선, Composer 패키지 관리자를 이용해 Pail을 프로젝트에 설치하세요.

```bash
composer require laravel/pail
```

<a name="pail-usage"></a>
### 사용법

로그를 실시간으로 확인하려면 `pail` 명령을 실행하세요.

```bash
php artisan pail
```

출력의 상세 수준을 높이고, 메시지가 ...으로 잘리지 않게 하려면 `-v` 옵션을 사용합니다.

```bash
php artisan pail -v
```

최대 상세 수준과 예외 스택 트레이스까지 함께 보고 싶다면 `-vv` 옵션을 사용하세요.

```bash
php artisan pail -vv
```

로그 실시간 확인을 중지하려면 언제든지 `Ctrl+C`를 누르세요.

<a name="pail-filtering-logs"></a>
### 로그 필터링

<a name="pail-filtering-logs-filter-option"></a>
#### `--filter`

로그 타입, 파일, 메시지, 스택 트레이스 내용으로 로그를 필터링하려면 `--filter` 옵션을 사용할 수 있습니다.

```bash
php artisan pail --filter="QueryException"
```

<a name="pail-filtering-logs-message-option"></a>
#### `--message`

로그 메시지만을 기준으로 필터링하고 싶다면 `--message` 옵션을 사용하세요.

```bash
php artisan pail --message="User created"
```

<a name="pail-filtering-logs-level-option"></a>
#### `--level`

로그의 [레벨](#log-levels)로 필터링하려면 `--level` 옵션을 사용할 수 있습니다.

```bash
php artisan pail --level=error
```

<a name="pail-filtering-logs-user-option"></a>
#### `--user`

특정 사용자가 인증된 상태로 남긴 로그만 보고 싶을 때는, `--user` 옵션에 해당 사용자의 ID를 입력하면 됩니다.

```bash
php artisan pail --user=1
```
