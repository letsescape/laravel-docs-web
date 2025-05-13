# 오류 처리 (Error Handling)

- [소개](#introduction)
- [설정](#configuration)
- [예외 처리](#handling-exceptions)
    - [예외 보고](#reporting-exceptions)
    - [예외 로그 레벨](#exception-log-levels)
    - [예외 타입별 무시하기](#ignoring-exceptions-by-type)
    - [예외 렌더링](#rendering-exceptions)
    - [보고 및 렌더링 가능한 예외](#renderable-exceptions)
- [예외 보고 제한(Throttling)](#throttling-reported-exceptions)
- [HTTP 예외](#http-exceptions)
    - [커스텀 HTTP 에러 페이지](#custom-http-error-pages)

<a name="introduction"></a>
## 소개

새로운 라라벨 프로젝트를 시작하면, 오류 및 예외 처리는 이미 기본적으로 설정되어 있습니다. 그러나 원한다면 언제든지 애플리케이션의 `bootstrap/app.php` 파일에서 `withExceptions` 메서드를 사용해 예외가 어떻게 보고되고 렌더링될지 직접 제어할 수 있습니다.

`withExceptions` 클로저에 전달되는 `$exceptions` 객체는 `Illuminate\Foundation\Configuration\Exceptions` 클래스의 인스턴스이며, 애플리케이션의 예외 처리를 담당합니다. 이 문서에서는 이 객체에 대해 더 자세히 알아보겠습니다.

<a name="configuration"></a>
## 설정

`config/app.php` 설정 파일의 `debug` 옵션은 에러에 대한 정보가 사용자에게 얼마나 노출될지 결정합니다. 기본적으로 이 옵션은 `.env` 파일에 저장된 `APP_DEBUG` 환경 변수의 값을 따릅니다.

로컬 개발 환경에서는 `APP_DEBUG` 환경 변수를 `true`로 설정해야 합니다. **하지만 운영(프로덕션) 환경에서는 반드시 `false`로 설정해야 합니다. 운영 환경에서 이 값을 `true`로 하면, 민감한 설정 정보가 최종 사용자에게 노출될 위험이 있습니다.**

<a name="handling-exceptions"></a>
## 예외 처리

<a name="reporting-exceptions"></a>
### 예외 보고

라라벨에서 예외 보고는 예외를 로그로 기록하거나 [Sentry](https://github.com/getsentry/sentry-laravel)나 [Flare](https://flareapp.io) 같은 외부 서비스로 전송하는 데 사용됩니다. 기본적으로 예외는 [로깅](/docs/logging) 설정에 따라 기록됩니다. 하지만 원하는 방식으로 예외 기록 방식을 자유롭게 구성할 수 있습니다.

예외 유형별로 서로 다르게 보고하고 싶다면, 애플리케이션의 `bootstrap/app.php`에서 `report` 예외 메서드를 사용해 특정 타입의 예외가 보고될 때 실행할 클로저를 등록할 수 있습니다. 라라벨은 클로저의 타입힌트를 통해 어떤 타입의 예외를 처리할지 결정합니다.

```php
use App\Exceptions\InvalidOrderException;

->withExceptions(function (Exceptions $exceptions) {
    $exceptions->report(function (InvalidOrderException $e) {
        // ...
    });
})
```

`report` 메서드를 사용해 커스텀 예외 보고 콜백을 등록해도, 라라벨은 여전히 기본 로깅 설정을 통해 예외를 로그로 남깁니다. 예외가 기본 로깅 스택으로 전달되지 않도록 하고 싶을 때는, 리포팅 콜백에 `stop` 메서드를 사용하거나 콜백에서 `false`를 반환하면 됩니다.

```php
use App\Exceptions\InvalidOrderException;

->withExceptions(function (Exceptions $exceptions) {
    $exceptions->report(function (InvalidOrderException $e) {
        // ...
    })->stop();

    $exceptions->report(function (InvalidOrderException $e) {
        return false;
    });
})
```

> [!NOTE]
> 특정 예외의 예외 보고 방식을 커스터마이즈하려면 [보고 및 렌더링 가능한 예외](/docs/errors#renderable-exceptions) 기능을 활용할 수도 있습니다.

<a name="global-log-context"></a>
#### 글로벌 로그 컨텍스트

가능하다면, 라라벨은 자동으로 모든 예외 로그 메시지에 현재 로그인한 사용자의 ID를 컨텍스트 데이터로 추가합니다. `bootstrap/app.php` 파일에서 `context` 예외 메서드를 사용하면 직접 전역 컨텍스트 데이터를 정의할 수도 있습니다. 이렇게 등록한 정보는 애플리케이션에서 기록하는 모든 예외 로그 메시지에 포함됩니다.

```php
->withExceptions(function (Exceptions $exceptions) {
    $exceptions->context(fn () => [
        'foo' => 'bar',
    ]);
})
```

<a name="exception-log-context"></a>
#### 예외별 로그 컨텍스트

모든 로그 메시지에 컨텍스트를 추가하는 것도 유용하지만, 특정 예외에만 별도의 컨텍스트 데이터를 기록하고 싶을 때도 있습니다. 애플리케이션의 예외 클래스에 `context` 메서드를 정의하면 해당 예외의 로그 항목에 추가할 데이터를 원하는 대로 반환할 수 있습니다.

```php
<?php

namespace App\Exceptions;

use Exception;

class InvalidOrderException extends Exception
{
    // ...

    /**
     * 예외의 컨텍스트 정보 반환
     *
     * @return array<string, mixed>
     */
    public function context(): array
    {
        return ['order_id' => $this->orderId];
    }
}
```

<a name="the-report-helper"></a>
#### `report` 헬퍼

때때로 예외를 보고하면서도 현재 요청 처리를 계속해야 할 때가 있습니다. `report` 헬퍼 함수는 사용자에게 에러 페이지를 보여주지 않고도 빠르게 예외를 보고할 수 있게 해줍니다.

```php
public function isValid(string $value): bool
{
    try {
        // 값 유효성 검증...
    } catch (Throwable $e) {
        report($e);

        return false;
    }
}
```

<a name="deduplicating-reported-exceptions"></a>
#### 예외 중복 보고 방지

애플리케이션 전체에서 `report` 함수를 사용하다 보면, 같은 예외 인스턴스를 여러 번 보고하게 되어 로그에 중복 항목이 쌓일 수 있습니다.

같은 예외 인스턴스가 한 번만 보고되도록 보장하려면, `bootstrap/app.php` 파일에서 `dontReportDuplicates` 예외 메서드를 호출하면 됩니다.

```php
->withExceptions(function (Exceptions $exceptions) {
    $exceptions->dontReportDuplicates();
})
```

이 설정 후에는 `report` 헬퍼가 동일한 예외 인스턴스로 여러 번 호출되더라도, 최초 한 번만 보고됩니다.

```php
$original = new RuntimeException('Whoops!');

report($original); // 보고됨

try {
    throw $original;
} catch (Throwable $caught) {
    report($caught); // 무시됨
}

report($original); // 무시됨
report($caught); // 무시됨
```

<a name="exception-log-levels"></a>
### 예외 로그 레벨

애플리케이션의 [로그](/docs/logging)에 메시지가 기록될 때는, 해당 메시지의 중요도나 심각성을 나타내는 [로그 레벨](/docs/logging#log-levels)이 지정됩니다.

앞서 설명했듯, `report` 메서드를 통해 커스텀 예외 보고 콜백을 등록해도 기본 로깅 설정을 따라 예외가 로그에 남지만, 로그 레벨에 따라 메시지가 기록되는 채널이 달라질 수도 있습니다. 따라서 예외별로 로그 레벨을 별도로 지정하고 싶을 때가 있습니다.

이럴 때는 `bootstrap/app.php` 파일 내에서 `level` 예외 메서드를 사용할 수 있습니다. 이 메서드는 첫 번째 인자로 예외 타입을, 두 번째 인자로 로그 레벨을 받습니다.

```php
use PDOException;
use Psr\Log\LogLevel;

->withExceptions(function (Exceptions $exceptions) {
    $exceptions->level(PDOException::class, LogLevel::CRITICAL);
})
```

<a name="ignoring-exceptions-by-type"></a>
### 예외 타입별 무시하기

애플리케이션을 개발하다 보면 특정 타입의 예외는 보고하지 않기를 원할 수도 있습니다. 이럴 때는 `bootstrap/app.php` 파일에서 `dontReport` 예외 메서드를 사용하면 해당 예외 클래스는 로그로 남지 않습니다. 단, 별도의 렌더링 로직은 여전히 적용할 수 있습니다.

```php
use App\Exceptions\InvalidOrderException;

->withExceptions(function (Exceptions $exceptions) {
    $exceptions->dontReport([
        InvalidOrderException::class,
    ]);
})
```

혹은 예외 클래스에 `Illuminate\Contracts\Debug\ShouldntReport` 인터페이스를 구현해 "마킹"할 수도 있습니다. 이렇게 하면 라라벨의 예외 핸들러가 해당 예외를 절대 보고하지 않습니다.

```php
<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Contracts\Debug\ShouldntReport;

class PodcastProcessingException extends Exception implements ShouldntReport
{
    //
}
```

라라벨 내부적으로도 이미 404 HTTP 오류나 잘못된 CSRF 토큰으로 인한 419 HTTP 응답 등 일부 에러는 자동으로 예외 보고에서 무시하고 있습니다. 만약 특정 예외 타입을 더 이상 무시하지 않도록 하려면, `bootstrap/app.php` 내에서 `stopIgnoring` 예외 메서드를 사용할 수 있습니다.

```php
use Symfony\Component\HttpKernel\Exception\HttpException;

->withExceptions(function (Exceptions $exceptions) {
    $exceptions->stopIgnoring(HttpException::class);
})
```

<a name="rendering-exceptions"></a>
### 예외 렌더링

기본적으로 라라벨의 예외 핸들러는 예외를 HTTP 응답으로 변환합니다. 하지만 특정 타입의 예외에 대해 커스텀 렌더링 클로저를 등록할 수도 있습니다. 이를 위해 `bootstrap/app.php` 파일에서 `render` 예외 메서드를 사용합니다.

`render` 메서드에 전달되는 클로저는 `response` 헬퍼를 사용해 생성한 `Illuminate\Http\Response` 인스턴스를 반환해야 합니다. 라라벨은 클로저의 타입힌트를 통해 렌더링할 예외의 타입을 결정합니다.

```php
use App\Exceptions\InvalidOrderException;
use Illuminate\Http\Request;

->withExceptions(function (Exceptions $exceptions) {
    $exceptions->render(function (InvalidOrderException $e, Request $request) {
        return response()->view('errors.invalid-order', status: 500);
    });
})
```

`render` 메서드를 사용해 Laravel이나 Symfony의 기본 예외, 예를 들어 `NotFoundHttpException`의 렌더링 방식도 오버라이드할 수 있습니다. 만약 클로저에서 값을 반환하지 않으면, 라라벨의 기본 예외 렌더링이 사용됩니다.

```php
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

->withExceptions(function (Exceptions $exceptions) {
    $exceptions->render(function (NotFoundHttpException $e, Request $request) {
        if ($request->is('api/*')) {
            return response()->json([
                'message' => 'Record not found.'
            ], 404);
        }
    });
})
```

<a name="rendering-exceptions-as-json"></a>
#### 예외를 JSON으로 렌더링하기

예외를 렌더링할 때 라라벨은 요청의 `Accept` 헤더를 바탕으로 HTML 또는 JSON 응답 중 어떤 형식으로 예외를 렌더링할지 자동으로 결정합니다. 만약 이 동작을 직접 제어하고 싶다면, `shouldRenderJsonWhen` 메서드를 사용할 수 있습니다.

```php
use Illuminate\Http\Request;
use Throwable;

->withExceptions(function (Exceptions $exceptions) {
    $exceptions->shouldRenderJsonWhen(function (Request $request, Throwable $e) {
        if ($request->is('admin/*')) {
            return true;
        }

        return $request->expectsJson();
    });
})
```

<a name="customizing-the-exception-response"></a>
#### 예외 응답 커스터마이즈

드물긴 하지만, 예외 핸들러가 렌더링하는 전체 HTTP 응답을 직접 커스터마이즈해야 할 때가 있습니다. 이럴 때는 `respond` 메서드를 사용해 응답 커스터마이즈 클로저를 등록하면 됩니다.

```php
use Symfony\Component\HttpFoundation\Response;

->withExceptions(function (Exceptions $exceptions) {
    $exceptions->respond(function (Response $response) {
        if ($response->getStatusCode() === 419) {
            return back()->with([
                'message' => 'The page expired, please try again.',
            ]);
        }

        return $response;
    });
})
```

<a name="renderable-exceptions"></a>
### 보고 및 렌더링 가능한 예외

예외의 커스텀 보고와 렌더링 동작을 `bootstrap/app.php`가 아닌, 예외 클래스 안에서 직접 구현할 수도 있습니다. 예외 클래스에 `report` 및 `render` 메서드를 정의하면, 프레임워크가 자동으로 이 메서드를 호출합니다.

```php
<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class InvalidOrderException extends Exception
{
    /**
     * 예외 보고
     */
    public function report(): void
    {
        // ...
    }

    /**
     * 예외를 HTTP 응답으로 렌더링
     */
    public function render(Request $request): Response
    {
        return response(/* ... */);
    }
}
```

이미 렌더링 가능한 예외(예: 기본 Laravel 또는 Symfony 예외)를 상속한 경우, 예외의 `render` 메서드에서 `false`를 반환하면 기본 HTTP 응답 방식 그대로 렌더링할 수 있습니다.

```php
/**
 * 예외를 HTTP 응답으로 렌더링
 */
public function render(Request $request): Response|bool
{
    if (/** 커스텀 렌더링 필요 여부를 판단 */) {

        return response(/* ... */);
    }

    return false;
}
```

특정 조건에서만 커스텀 보고가 필요하다면, `report` 메서드에서 `false`를 반환하여 라라벨이 기본 예외 처리 방식대로 보고하도록 할 수 있습니다.

```php
/**
 * 예외 보고
 */
public function report(): bool
{
    if (/** 커스텀 보고 필요 여부를 판단 */) {

        // ...

        return true;
    }

    return false;
}
```

> [!NOTE]
> `report` 메서드에서 필요한 의존성을 타입힌트로 지정하면, 라라벨의 [서비스 컨테이너](/docs/container)가 자동으로 주입해줍니다.

<a name="throttling-reported-exceptions"></a>
### 예외 보고 제한(Throttling)

애플리케이션에서 아주 많은 예외가 보고될 경우, 실제로 로그에 기록되거나 외부 오류 추적 서비스로 전송되는 예외의 수를 제한하고 싶을 때가 있습니다.

일정 비율로 무작위 샘플링을 하려면, `bootstrap/app.php` 파일에서 `throttle` 예외 메서드를 사용할 수 있습니다. `throttle` 메서드는 `Lottery` 인스턴스를 반환하는 클로저를 인자로 받습니다.

```php
use Illuminate\Support\Lottery;
use Throwable;

->withExceptions(function (Exceptions $exceptions) {
    $exceptions->throttle(function (Throwable $e) {
        return Lottery::odds(1, 1000);
    });
})
```

예외 타입에 따라 샘플링 규칙을 다르게 적용할 수도 있습니다. 특정 예외 클래스만 샘플링하려면, 그 클래스에만 `Lottery` 인스턴스를 반환하도록 만들 수 있습니다.

```php
use App\Exceptions\ApiMonitoringException;
use Illuminate\Support\Lottery;
use Throwable;

->withExceptions(function (Exceptions $exceptions) {
    $exceptions->throttle(function (Throwable $e) {
        if ($e instanceof ApiMonitoringException) {
            return Lottery::odds(1, 1000);
        }
    });
})
```

샘플링 대신, 외부 오류 추적 서비스나 로그에 지정 시간 내 예외가 너무 많이 기록되는 것을 막고 싶을 때는, `Lottery` 대신 `Limit` 인스턴스를 반환할 수 있습니다. 예를 들어 외부 서비스가 다운되어 짧은 시간에 예외가 대량으로 쏟아질 때 유용합니다.

```php
use Illuminate\Broadcasting\BroadcastException;
use Illuminate\Cache\RateLimiting\Limit;
use Throwable;

->withExceptions(function (Exceptions $exceptions) {
    $exceptions->throttle(function (Throwable $e) {
        if ($e instanceof BroadcastException) {
            return Limit::perMinute(300);
        }
    });
})
```

기본적으로 제한 키는 예외 클래스가 사용되지만, 필요하다면 `Limit`의 `by` 메서드를 사용해 키를 직접 지정할 수 있습니다.

```php
use Illuminate\Broadcasting\BroadcastException;
use Illuminate\Cache\RateLimiting\Limit;
use Throwable;

->withExceptions(function (Exceptions $exceptions) {
    $exceptions->throttle(function (Throwable $e) {
        if ($e instanceof BroadcastException) {
            return Limit::perMinute(300)->by($e->getMessage());
        }
    });
})
```

물론, 여러 예외에 대해 `Lottery`와 `Limit`을 혼합해서 사용할 수도 있습니다.

```php
use App\Exceptions\ApiMonitoringException;
use Illuminate\Broadcasting\BroadcastException;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Lottery;
use Throwable;

->withExceptions(function (Exceptions $exceptions) {
    $exceptions->throttle(function (Throwable $e) {
        return match (true) {
            $e instanceof BroadcastException => Limit::perMinute(300),
            $e instanceof ApiMonitoringException => Lottery::odds(1, 1000),
            default => Limit::none(),
        };
    });
})
```

<a name="http-exceptions"></a>
## HTTP 예외

일부 예외는 서버에서 발생하는 HTTP 오류 코드와 직접 연관되어 있습니다. 예를 들어 "페이지를 찾을 수 없습니다"(404) 오류, "인증되지 않음"(401) 오류, 혹은 개발자가 의도적으로 발생시킨 500 오류 등입니다. 이와 같은 HTTP 오류 응답을 애플리케이션 어디서든 생성하려면, `abort` 헬퍼를 사용할 수 있습니다.

```php
abort(404);
```

<a name="custom-http-error-pages"></a>
### 커스텀 HTTP 에러 페이지

라라벨은 다양한 HTTP 상태 코드에 대해 커스텀 에러 페이지를 간단하게 표시할 수 있도록 지원합니다. 예를 들어 404 HTTP 에러 페이지를 커스터마이즈하려면 `resources/views/errors/404.blade.php` 뷰 템플릿을 생성하면 됩니다. 이 뷰는 애플리케이션에서 발생한 모든 404 에러에 대해 렌더링됩니다. 이 디렉터리 내 뷰 파일은 각각 대응하는 HTTP 상태 코드명으로 이름을 지정해야 합니다. `abort` 함수로 발생한 `Symfony\Component\HttpKernel\Exception.HttpException` 인스턴스는 `$exception` 변수로 뷰에 전달됩니다.

```blade
<h2>{{ $exception->getMessage() }}</h2>
```

라라벨의 기본 에러 페이지 템플릿은 `vendor:publish` 아티즌 명령어를 사용해 프로젝트로 복사할 수 있습니다. 복사 후에는 원하는 대로 커스터마이즈할 수 있습니다.

```shell
php artisan vendor:publish --tag=laravel-errors
```

<a name="fallback-http-error-pages"></a>
#### 폴백 HTTP 에러 페이지

특정 HTTP 상태 코드에 대응하는 페이지가 없을 경우를 대비해, "폴백" 에러 페이지도 정의할 수 있습니다. 예를 들어 `resources/views/errors` 디렉터리에 `4xx.blade.php`와 `5xx.blade.php` 템플릿을 만들어두면, 4xx 또는 5xx 계열 상태 코드에 해당하는 에러가 발생한 경우 각각의 템플릿이 렌더링됩니다.

다만 폴백 에러 페이지는 404, 500, 503 상태 코드에 대한 기본 동작에는 영향을 주지 않습니다. 라라벨은 이 코드들에 대해 내부적으로 별도의 전용 페이지를 사용하므로 각각에 맞는 에러 페이지를 따로 커스터마이즈해야 합니다.