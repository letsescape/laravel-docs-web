# 로깅 (Logging)

- [소개](#introduction)
- [설정](#configuration)
    - [사용 가능한 채널 드라이버](#available-channel-drivers)
    - [채널 사용 전 준비사항](#channel-prerequisites)
    - [사용 중단(deprecation) 경고 로그 기록하기](#logging-deprecation-warnings)
- [로그 스택 구축하기](#building-log-stacks)
- [로그 메시지 작성하기](#writing-log-messages)
    - [컨텍스트 정보 추가](#contextual-information)
    - [특정 채널에 로그 남기기](#writing-to-specific-channels)
- [Monolog 채널 커스터마이징](#monolog-channel-customization)
    - [채널에서 Monolog 커스터마이징](#customizing-monolog-for-channels)
    - [Monolog 핸들러 채널 생성하기](#creating-monolog-handler-channels)
    - [팩토리로 커스텀 채널 만들기](#creating-custom-channels-via-factories)

<a name="introduction"></a>
## 소개

애플리케이션 내부에서 무슨 일이 일어나고 있는지 더 잘 파악할 수 있도록, 라라벨에서는 강력한 로깅 서비스를 제공합니다. 이를 통해 파일, 시스템 에러 로그, 심지어 Slack으로 메시지를 보내 팀 전체에 알릴 수 있습니다.

라라벨의 로깅 시스템은 "채널(channel)"을 기반으로 동작합니다. 각 채널은 로그 정보를 기록하는 특정 방식을 나타냅니다. 예를 들어, `single` 채널은 모든 로그를 하나의 파일에 기록하며, `slack` 채널은 로그 메시지를 Slack으로 전송합니다. 로그 메시지는 심각도(severity)에 따라 여러 채널에 동시에 기록될 수 있습니다.

내부적으로 라라벨은 [Monolog](https://github.com/Seldaek/monolog) 라이브러리를 사용합니다. Monolog은 매우 다양한 강력한 로그 핸들러 지원을 제공하며, 라라벨은 이 핸들러들을 쉽게 설정할 수 있게 해주므로, 여러 조합으로 애플리케이션의 로그 처리를 자유롭게 커스터마이즈할 수 있습니다.

<a name="configuration"></a>
## 설정

애플리케이션의 로깅 동작을 제어하는 모든 설정 옵션들은 `config/logging.php` 설정 파일에 들어 있습니다. 이 파일에서 사용할 로그 채널을 구성할 수 있으니, 각 채널의 종류와 옵션을 꼭 확인해보시기 바랍니다. 아래에서 몇 가지 주요 옵션을 살펴보겠습니다.

기본적으로 라라벨은 로그 메시지를 기록할 때 `stack` 채널을 사용합니다. `stack` 채널은 여러 개의 로그 채널을 하나로 묶어서 동작하게 해줍니다. 스택 구축 방법에 관한 자세한 내용은 [아래의 문서](#building-log-stacks)를 참고하세요.

<a name="configuring-the-channel-name"></a>
#### 채널 이름 지정하기

기본적으로 Monolog 인스턴스는 현재 환경(예: `production` 또는 `local`)과 동일한 "채널 이름(channel name)"을 사용합니다. 이 값을 변경하려면 해당 채널 설정에 `name` 옵션을 추가하세요:

```
'stack' => [
    'driver' => 'stack',
    'name' => 'channel-name',
    'channels' => ['single', 'slack'],
],
```

<a name="available-channel-drivers"></a>
### 사용 가능한 채널 드라이버

각 로그 채널은 "드라이버(driver)"에 의해 동작합니다. 드라이버는 실제로 로그 메시지가 어떻게, 어디에 기록되는지를 결정합니다. 모든 라라벨 애플리케이션에서 지원하는 채널 드라이버는 다음과 같습니다. 대부분의 드라이버는 이미 `config/logging.php`에 샘플이 있으니, 내용을 꼭 확인해보세요:

| 이름        | 설명                                                                              |
|-------------|-----------------------------------------------------------------------------------|
| `custom`    | 지정한 팩토리를 호출해 채널을 생성하는 드라이버                                    |
| `daily`     | 매일 새로운 로그 파일로 기록하는 `RotatingFileHandler` 기반 Monolog 드라이버        |
| `errorlog`  | 시스템의 에러 로그에 기록하는 `ErrorLogHandler` 기반 Monolog 드라이버               |
| `monolog`   | Monolog의 다양한 핸들러를 사용할 수 있는 Monolog 팩토리 드라이버                   |
| `null`      | 모든 로그 메시지를 무시(버림)하는 드라이버                                         |
| `papertrail`| `SyslogUdpHandler` 기반 Monolog 드라이버                                           |
| `single`    | 하나의 파일 또는 경로에만 기록하는 로거 채널 (`StreamHandler`)                      |
| `slack`     | Slack으로 로그를 전송하는 `SlackWebhookHandler` 기반 Monolog 드라이버               |
| `stack`     | 여러 채널을 하나로 묶는 "멀티채널"용 래퍼                                          |
| `syslog`    | 시스템 syslog에 기록하는 `SyslogHandler` 기반 Monolog 드라이버                      |

> [!NOTE]
> `monolog` 및 `custom` 드라이버에 관한 자세한 내용은 [고급 채널 커스터마이징](#monolog-channel-customization) 문서를 참고하세요.

<a name="channel-prerequisites"></a>
### 채널 사용 전 준비사항

<a name="configuring-the-single-and-daily-channels"></a>
#### single 및 daily 채널 설정

`single`과 `daily` 채널은 선택적으로 `bubble`, `permission`, `locking` 옵션을 설정할 수 있습니다.

| 이름         | 설명                                                         | 기본값     |
|--------------|-------------------------------------------------------------|------------|
| `bubble`     | 메시지 처리 후 다른 채널로도 메시지를 전달할지 여부           | `true`     |
| `locking`    | 로그 파일 기록 전 파일을 잠글지 여부                         | `false`    |
| `permission` | 로그 파일 권한                                               | `0644`     |

또한, `daily` 채널의 로그 보관 정책은 `days` 옵션으로 설정할 수 있습니다.

| 이름      | 설명                                   | 기본값  |
|-----------|----------------------------------------|---------|
| `days`    | 일자별 로그 파일을 며칠간 보관할지 여부 | `7`     |

<a name="configuring-the-papertrail-channel"></a>
#### Papertrail 채널 설정

`papertrail` 채널을 사용하려면 `host`와 `port` 설정이 필요합니다. 이 값은 [Papertrail](https://help.papertrailapp.com/kb/configuration/configuring-centralized-logging-from-php-apps/#send-events-from-php-app)에서 발급받을 수 있습니다.

<a name="configuring-the-slack-channel"></a>
#### Slack 채널 설정

`slack` 채널을 사용하려면, [Slack의 인커밍 웹훅](https://slack.com/apps/A0F7XDUAZ-incoming-webhooks)에서 발급한 웹훅 `url`이 필요합니다.

기본적으로 Slack은 `critical` 레벨 이상의 로그만 수신합니다. 그러나 `config/logging.php` 파일에서 해당 Slack 채널의 `level` 옵션을 조정해 로그 레벨을 변경할 수 있습니다.

<a name="logging-deprecation-warnings"></a>
### 사용 중단(deprecation) 경고 로그 기록하기

PHP, Laravel, 그리고 기타 라이브러리들은 일부 기능이 더 이상 사용되지 않으며 미래에 제거될 예정임을(deprecated) 개발자에게 알립니다. 이러한 deprecation 경고를 로그로 남기고 싶다면, 애플리케이션의 `config/logging.php` 파일에서 원하는 `deprecations` 로그 채널을 지정할 수 있습니다:

```
'deprecations' => env('LOG_DEPRECATIONS_CHANNEL', 'null'),

'channels' => [
    ...
]
```

또는 단순히 `deprecations`라는 이름의 로그 채널을 정의할 수도 있습니다. 만약 이 이름의 채널이 존재한다면, 항상 이 채널이 deprecation 로그를 담당하게 됩니다:

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

앞에서 설명한 것처럼, `stack` 드라이버를 사용하면 여러 로그 채널을 하나의 스택으로 묶을 수 있습니다. 다음은 실제 운영환경에서 사용될 수 있는 설정 예시입니다:

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

이 설정을 해부해보겠습니다. 먼저 `stack` 채널의 `channels` 옵션에서 `syslog`와 `slack` 두 개의 채널을 통합하고 있다는 점을 알 수 있습니다. 즉, 메시지를 기록할 때 두 채널 모두에서 기록이 시도됩니다. 다만, 실제로 기록될지 여부는 메시지의 심각도(레벨)에 따라 달라집니다.

<a name="log-levels"></a>
#### 로그 레벨

위 예시에서 `syslog`와 `slack` 채널 설정에 `level` 옵션이 있는 것에 주목하세요. 이 옵션은 해당 채널이 로그할 최소 "레벨"을 결정합니다. 라라벨의 로깅 서비스 기반인 Monolog은 [RFC 5424 규격](https://tools.ietf.org/html/rfc5424)에 정의된 모든 로그 레벨을 지원합니다. 심각도 기준으로 높은 순서대로, **emergency**, **alert**, **critical**, **error**, **warning**, **notice**, **info**, **debug** 단계로 나뉩니다.

예를 들어, 아래처럼 `debug` 메서드로 메시지를 기록한다고 가정해봅시다:

```
Log::debug('An informational message.');
```

이 설정에서는 `syslog` 채널이 메시지를 시스템 로그에 기록하지만, 메시지의 레벨이 `critical` 이상이 아니므로 Slack으로는 전송되지 않습니다. 하지만 만약 `emergency`로 메시지를 기록하면, 심각도가 두 채널의 임계치 이상이므로 둘 다 메시지를 남깁니다:

```
Log::emergency('The system is down!');
```

<a name="writing-log-messages"></a>
## 로그 메시지 작성하기

`Log` [파사드](/docs/9.x/facades)를 사용해 로그에 정보를 기록할 수 있습니다. 앞서 언급한 바와 같이, 로거는 [RFC 5424 규격](https://tools.ietf.org/html/rfc5424)에 정의된 8개의 로깅 레벨 (**emergency**, **alert**, **critical**, **error**, **warning**, **notice**, **info**, **debug**)의 메서드를 제공합니다:

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

이 중 하나의 메서드를 호출하면 해당 레벨에 맞는 로그 메시지를 남길 수 있습니다. 기본적으로 이 메시지는 `logging` 설정 파일에서 지정한 기본 로그 채널에 기록됩니다:

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
### 컨텍스트 정보 추가

로그 메서드에 배열 형태의 추가 정보를 넘겨줄 수 있습니다. 이 컨텍스트 데이터는 로그 메시지와 함께 포맷되어 표시됩니다:

```
use Illuminate\Support\Facades\Log;

Log::info('User failed to login.', ['id' => $user->id]);
```

특정 채널에서 남기는 모든 로그에 동일한 컨텍스트 정보를 함께 기록하고 싶을 때도 있습니다. 예를 들어, 각 요청마다 고유한 request ID를 함께 기록하고 싶다면, `Log` 파사드의 `withContext` 메서드를 사용할 수 있습니다:

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

_모든_ 로깅 채널에서 컨텍스트 정보를 공유하고 싶다면, `Log::shareContext()` 메서드를 사용할 수 있습니다. 이 메서드는 이미 생성된 채널 및 이후 생성되는 모든 채널에 컨텍스트 정보를 전달합니다. 보통 `shareContext`는 애플리케이션 서비스 프로바이더의 `boot` 메서드에서 호출하는 것이 일반적입니다:

```
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AppServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        Log::shareContext([
            'invocation-id' => (string) Str::uuid(),
        ]);
    }
}
```

<a name="writing-to-specific-channels"></a>
### 특정 채널에 로그 남기기

기본 채널 이외의 다른 채널에 로그를 남기고 싶을 때도 있습니다. 이 경우 `Log` 파사드의 `channel` 메서드를 이용해, 설정 파일에 정의된 채널 이름으로 직접 로거 인스턴스를 얻어 사용할 수 있습니다:

```
use Illuminate\Support\Facades\Log;

Log::channel('slack')->info('Something happened!');
```

여러 채널로 동적으로 스택을 구성하여 로그를 남기고 싶다면 `stack` 메서드를 사용할 수 있습니다:

```
Log::stack(['single', 'slack'])->info('Something happened!');
```

<a name="on-demand-channels"></a>
#### 온디맨드 채널

설정 파일(`logging.php`)에 별도로 등록하지 않고도, 런타임에 직접 구성 정보를 넘겨 "온디맨드" 채널(instance)을 만들 수도 있습니다. 이를 위해서는 `Log` 파사드의 `build` 메서드에 설정 배열을 전달하면 됩니다:

```
use Illuminate\Support\Facades\Log;

Log::build([
  'driver' => 'single',
  'path' => storage_path('logs/custom.log'),
])->info('Something happened!');
```

온디맨드 채널을 온디맨드 스택에 포함시켜 사용하고 싶을 수도 있습니다. 그런 경우, 생성한 온디맨드 채널 인스턴스를 `stack` 메서드의 배열에 포함시키면 됩니다:

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
### 채널에서 Monolog 커스터마이징

기존 채널의 Monolog 동작을 완전히 제어해야 할 때가 있을 수 있습니다. 예를 들어, 라라벨 기본 내장 `single` 채널에 맞춤형 Monolog `FormatterInterface`를 지정하고 싶을 수 있습니다.

이때 채널의 설정에 `tap` 배열 옵션을 추가하면 됩니다. `tap` 배열에는 Monolog 인스턴스가 생성된 후 이를 사용자 정의로 커스터마이징할 수 있는 클래스들을 나열합니다. 이 클래스들의 위치에 대한 특별한 규칙은 없으니, 자유롭게 별도의 디렉터리를 만들어 사용하시면 됩니다:

```
'single' => [
    'driver' => 'single',
    'tap' => [App\Logging\CustomizeFormatter::class],
    'path' => storage_path('logs/laravel.log'),
    'level' => 'debug',
],
```

이제 `tap` 옵션에 등록한 클래스에서 Monolog 인스턴스를 커스터마이징하면 됩니다. 해당 클래스는 단일 메서드인 `__invoke`를 구현하면 되며, 인자로 `Illuminate\Log\Logger` 인스턴스를 전달받습니다. 이 객체는 실제 Monolog 인스턴스로 모든 메서드 호출을 프록시합니다:

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

> [!NOTE]
> 모든 "tap" 클래스는 [서비스 컨테이너](/docs/9.x/container)로부터 resolve되므로, 생성자에서 의존성이 필요한 경우 자동 주입됩니다.

<a name="creating-monolog-handler-channels"></a>
### Monolog 핸들러 채널 생성하기

Monolog에는 [여러 가지 핸들러](https://github.com/Seldaek/monolog/tree/main/src/Monolog/Handler)가 존재하지만, 라라벨은 모든 핸들러마다 내장 채널을 제공하지는 않습니다. 특수한 Monolog 핸들러 인스턴스만 사용하는 자체 채널을 만들고 싶다면, `monolog` 드라이버로 간단히 생성할 수 있습니다.

`monolog` 드라이버를 사용할 때는 `handler` 옵션으로 사용할 핸들러를 명시하며, 필요하다면 생성자에 넘길 파라미터도 `with` 옵션으로 지정할 수 있습니다:

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
#### Monolog 포매터(formatter)

`monolog` 드라이버를 사용할 때는, 기본적으로 Monolog의 `LineFormatter`가 사용됩니다. 다만 `formatter` 및 `formatter_with` 옵션을 통해 전달되는 포매터 종류와 값을 커스터마이즈할 수 있습니다:

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

핸들러 자체가 기본 포매터를 제공하는 Monolog 핸들러라면, `formatter` 옵션에 `default` 값을 지정하면 됩니다:

```
'newrelic' => [
    'driver' => 'monolog',
    'handler' => Monolog\Handler\NewRelicHandler::class,
    'formatter' => 'default',
],
```

<a name="creating-custom-channels-via-factories"></a>
### 팩토리로 커스텀 채널 만들기

Monolog의 인스턴스 생성 및 구성을 완전히 직접 제어하는, 사용자 정의 채널을 만들고 싶다면 `config/logging.php` 파일에 `custom` 드라이버 타입을 지정하면 됩니다. 이때, 실제 인스턴스를 생성할 팩토리 클래스명을 `via` 옵션에 지정해야 합니다:

```
'channels' => [
    'example-custom-channel' => [
        'driver' => 'custom',
        'via' => App\Logging\CreateCustomLogger::class,
    ],
],
```

이제, `custom` 드라이버 채널을 위한 클래스에서 Monolog 인스턴스를 생성하면 됩니다. 이 클래스는 단일 `__invoke` 메서드만 있으면 되고, 해당 메서드는 채널 구성 배열을 인자로 받아 Monolog 로거 인스턴스를 반환해야 합니다:

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
        return new Logger(/* ... */);
    }
}
```