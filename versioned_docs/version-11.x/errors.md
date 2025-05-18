# 에러 처리 (Error Handling)

- [소개](#introduction)
- [설정](#configuration)
- [예외 처리](#handling-exceptions)
    - [예외 보고](#reporting-exceptions)
    - [예외 로그 레벨](#exception-log-levels)
    - [타입별 예외 무시](#ignoring-exceptions-by-type)
    - [예외 렌더링](#rendering-exceptions)
    - [보고 및 렌더링 가능한 예외](#renderable-exceptions)
- [보고 예외 제한하기](#throttling-reported-exceptions)
- [HTTP 예외](#http-exceptions)
    - [사용자 지정 HTTP 에러 페이지](#custom-http-error-pages)

<a name="introduction"></a>
## 소개

새로운 라라벨 프로젝트를 시작하면, 에러 및 예외 처리는 이미 기본적으로 설정되어 있습니다. 하지만 언제든지 애플리케이션의 `bootstrap/app.php` 파일에서 `withExceptions` 메서드를 사용해 예외가 어떻게 보고되고 렌더링되는지 직접 관리할 수 있습니다.

`withExceptions` 클로저로 전달되는 `$exceptions` 객체는 `Illuminate\Foundation\Configuration\Exceptions`의 인스턴스이며, 애플리케이션의 예외 처리를 전반적으로 관리하는 역할을 합니다. 이 문서에서는 이 객체에 대해 자세히 살펴봅니다.

<a name="configuration"></a>
## 설정

`config/app.php` 설정 파일의 `debug` 옵션은 사용자에게 에러 정보가 얼마나 노출되는지를 결정합니다. 기본적으로 이 옵션은 `.env` 파일에 저장된 `APP_DEBUG` 환경 변수의 값을 따르도록 설정되어 있습니다.

로컬 개발 단계에서는 `APP_DEBUG` 환경 변수를 `true`로 설정해야 합니다. **프로덕션 환경에서는 반드시 이 값을 `false`로 설정해야 하며, 만약 `true`로 설정할 경우 애플리케이션의 민감한 설정 값이 외부 사용자에게 노출될 위험이 있습니다.**

<a name="handling-exceptions"></a>
## 예외 처리

<a name="reporting-exceptions"></a>
### 예외 보고

라라벨에서 예외 보고는 예외를 로그로 기록하거나 [Sentry](https://github.com/getsentry/sentry-laravel), [Flare](https://flareapp.io)와 같은 외부 서비스로 전송할 때 사용됩니다. 기본적으로 예외는 [로깅](/docs/11.x/logging) 설정에 따라 기록됩니다. 하지만 필요하다면 원하는 방식으로 예외를 로그로 남길 수 있습니다.

예외 유형에 따라 다른 방식으로 보고하고 싶다면, `bootstrap/app.php` 파일에서 `report` 예외 메서드를 사용해, 특정 예외가 발생할 때 실행될 클로저를 등록할 수 있습니다. 라라벨은 클로저의 타입힌트를 확인하여 어떤 타입의 예외를 대상으로 하는지 판단합니다.

```
->withExceptions(function (Exceptions $exceptions) {
    $exceptions->report(function (InvalidOrderException $e) {
        // ...
    });
})
```

`report` 메서드를 사용해 사용자 정의 예외 보고 콜백을 등록해도, 라라벨은 여전히 애플리케이션의 기본 로깅 설정에 따라 예외를 로그에 남깁니다. 만약 예외가 기본 로깅 스택에 전파되는 것을 막고 싶다면, 보고 콜백 정의 시 `stop` 메서드를 사용하거나 콜백에서 `false`를 반환할 수 있습니다.

```
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
> 특정 예외의 보고 방식을 사용자화하려면 [보고 및 렌더링 가능한 예외](/docs/11.x/errors#renderable-exceptions)도 함께 사용할 수 있습니다.

<a name="global-log-context"></a>
#### 글로벌 로그 컨텍스트

가능할 때 라라벨은 현재 사용자의 ID를 예외 로그 메시지의 컨텍스트 데이터로 자동 추가합니다. 필요하다면, 애플리케이션의 `bootstrap/app.php` 파일에서 `context` 예외 메서드를 등록해 글로벌 컨텍스트 데이터를 직접 지정할 수 있습니다. 여기서 정의한 정보는 모든 예외 로그 메시지에 함께 기록됩니다.

```
->withExceptions(function (Exceptions $exceptions) {
    $exceptions->context(fn () => [
        'foo' => 'bar',
    ]);
})
```

<a name="exception-log-context"></a>
#### 예외 로그 컨텍스트

모든 로그 메시지에 컨텍스트를 추가하는 것도 유용할 수 있지만, 특정 예외의 경우에는 별도의 추가 정보를 로그에 포함하고 싶을 수 있습니다. 이럴 때는 예외 클래스에 `context` 메서드를 정의하여 로그에 추가할 데이터를 반환하면 됩니다.

```
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

특정 상황에서 예외를 보고하고 싶지만, 현재 요청의 처리를 계속 진행하고자 할 때도 있습니다. 이럴 때는 `report` 헬퍼 함수를 사용해 에러 페이지를 사용자에게 보여주지 않고 예외를 간단히 보고할 수 있습니다.

```
public function isValid(string $value): bool
{
    try {
        // value 유효성 검사 ...
    } catch (Throwable $e) {
        report($e);

        return false;
    }
}
```

<a name="deduplicating-reported-exceptions"></a>
#### 중복 보고된 예외 제거

애플리케이션 곳곳에서 `report` 함수를 사용하는 경우, 같은 예외 인스턴스가 여러 번 보고되어 로그에 중복 항목이 생길 수 있습니다.

단일 예외 인스턴스가 한 번만 보고되도록 하고 싶다면, `bootstrap/app.php` 파일에서 `dontReportDuplicates` 예외 메서드를 호출하면 됩니다.

```
->withExceptions(function (Exceptions $exceptions) {
    $exceptions->dontReportDuplicates();
})
```

이제 `report` 헬퍼로 동일한 예외 인스턴스를 여러 번 보고하더라도, 최초 한 번만 로그에 기록됩니다.

```php
$original = new RuntimeException('Whoops!');

report($original); // reported

try {
    throw $original;
} catch (Throwable $caught) {
    report($caught); // ignored
}

report($original); // ignored
report($caught); // ignored
```

<a name="exception-log-levels"></a>
### 예외 로그 레벨

애플리케이션의 [로그](/docs/11.x/logging)에 메시지를 기록할 때는, 해당 메시지의 심각도나 중요성을 나타내는 [로그 레벨](/docs/11.x/logging#log-levels)이 지정됩니다.

앞서 설명한 것처럼, `report` 메서드로 사용자 정의 예외 보고 콜백을 등록해도 라라벨은 예외를 기본 설정에 따라 로깅합니다. 하지만 로그 레벨에 따라 메시지가 기록되는 채널이 달라질 수 있으므로, 특정 예외가 기록되는 로그 레벨을 직접 지정하고 싶을 때가 있습니다.

이때는 `bootstrap/app.php` 파일에서 `level` 예외 메서드를 사용할 수 있습니다. 이 메서드는 첫 번째 인수로 예외 타입, 두 번째 인수로 로그 레벨을 받습니다.

```
use PDOException;
use Psr\Log\LogLevel;

->withExceptions(function (Exceptions $exceptions) {
    $exceptions->level(PDOException::class, LogLevel::CRITICAL);
})
```

<a name="ignoring-exceptions-by-type"></a>
### 타입별 예외 무시

애플리케이션을 개발하다 보면, 특정 예외 타입은 전혀 보고하지 않을 수 있습니다. 이런 예외는 `bootstrap/app.php` 파일에서 `dontReport` 예외 메서드를 사용해 무시할 수 있습니다. 이 메서드에 등록된 클래스는 보고되지 않지만, 렌더링 동작은 따로 정의할 수 있습니다.

```
use App\Exceptions\InvalidOrderException;

->withExceptions(function (Exceptions $exceptions) {
    $exceptions->dontReport([
        InvalidOrderException::class,
    ]);
})
```

또는, 예외 클래스에 `Illuminate\Contracts\Debug\ShouldntReport` 인터페이스를 구현(implements)하는 것으로도 "무시" 처리가 가능합니다. 이 인터페이스가 붙은 예외는 라라벨의 예외 핸들러에서 절대 보고되지 않습니다.

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

라라벨은 내부적으로 이미 일부 예외(예: 404 HTTP 에러, 잘못된 CSRF 토큰으로 인한 419 HTTP 응답 등)는 무시하고 있습니다. 만약 특정 예외 타입을 무시하지 않도록 하고 싶다면, `bootstrap/app.php` 파일에서 `stopIgnoring` 예외 메서드를 사용할 수 있습니다.

```
use Symfony\Component\HttpKernel\Exception\HttpException;

->withExceptions(function (Exceptions $exceptions) {
    $exceptions->stopIgnoring(HttpException::class);
})
```

<a name="rendering-exceptions"></a>
### 예외 렌더링

기본적으로 라라벨의 예외 핸들러는 예외를 HTTP 응답으로 변환합니다. 하지만 필요하다면, 특정 예외 타입에 대해 커스텀 렌더링 클로저를 등록할 수 있습니다. 이를 위해 `bootstrap/app.php` 파일에서 `render` 예외 메서드를 사용하면 됩니다.

`render` 메서드로 전달하는 클로저는 `Illuminate\Http\Response` 인스턴스를 반환해야 하며, 이때 `response` 헬퍼를 활용할 수 있습니다. 라라벨은 클로저의 타입힌트를 확인해 어떤 예외 타입에 적용할지 판단합니다.

```
use App\Exceptions\InvalidOrderException;
use Illuminate\Http\Request;

->withExceptions(function (Exceptions $exceptions) {
    $exceptions->render(function (InvalidOrderException $e, Request $request) {
        return response()->view('errors.invalid-order', status: 500);
    });
})
```

`render` 메서드를 활용해 라라벨이나 Symfony의 기본 예외(`NotFoundHttpException` 등)에 대한 렌더링 동작을 오버라이드할 수도 있습니다. 만약 클로저에서 값을 반환하지 않으면, 라라벨의 기본 예외 렌더링이 사용됩니다.

```
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

예외를 렌더링할 때, 라라벨은 요청의 `Accept` 헤더 값을 분석해 HTML로 렌더링할지 JSON 응답으로 렌더링할지 자동으로 결정합니다. 만약 라라벨이 HTML/JSON 응답을 구분하는 방식을 커스텀하고 싶다면 `shouldRenderJsonWhen` 메서드를 사용할 수 있습니다.

```
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
#### 예외 응답 전체 커스터마이징

드물지만 라라벨의 예외 핸들러가 렌더링하는 HTTP 응답 전체를 커스텀해야 할 때가 있습니다. 이럴 때는 `respond` 메서드로 응답 커스터마이징 클로저를 등록할 수 있습니다.

```
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

예외의 사용자 정의 보고 및 렌더링 동작을 `bootstrap/app.php`에 정의하는 대신, 예외 클래스 내부에 `report` 및 `render` 메서드를 직접 정의할 수도 있습니다. 이 메서드가 존재하면 프레임워크가 자동으로 호출해줍니다.

```
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

내부적으로 이미 렌더링 가능한 예외(예: 라라벨이나 Symfony의 내장 예외 등)를 상속한다면, 예외 클래스의 `render` 메서드에서 `false`를 반환해 기본 HTTP 응답이 적용되도록 할 수 있습니다.

```
/**
 * 예외를 HTTP 응답으로 렌더링
 */
public function render(Request $request): Response|bool
{
    if (/** 커스텀 렌더링이 필요한 조건 */) {

        return response(/* ... */);
    }

    return false;
}
```

예외에 조건부로만 필요한 사용자 정의 보고 로직이 있다면, 예외의 `report` 메서드에서 `false`를 반환해 필요에 따라 라라벨의 기본 예외 핸들러로 보고를 위임할 수 있습니다.

```
/**
 * 예외 보고
 */
public function report(): bool
{
    if (/** 커스텀 보고가 필요한 조건 */) {

        // ...

        return true;
    }

    return false;
}
```

> [!NOTE]  
> `report` 메서드에서 필요한 의존성을 타입힌트로 지정하면, 라라벨 [서비스 컨테이너](/docs/11.x/container)에서 자동으로 주입해줍니다.

<a name="throttling-reported-exceptions"></a>
### 보고 예외 제한하기

애플리케이션에서 아주 많은 예외가 보고되는 경우, 실제로 로그로 남기거나 외부 에러 트래킹 서비스로 전송되는 예외의 양을 제한하고 싶을 수 있습니다.

예외를 무작위 샘플링 방식으로 제한하려면, `bootstrap/app.php` 파일에서 `throttle` 예외 메서드를 사용할 수 있습니다. 이 메서드는 `Lottery` 인스턴스를 반환하는 클로저를 받습니다.

```
use Illuminate\Support\Lottery;
use Throwable;

->withExceptions(function (Exceptions $exceptions) {
    $exceptions->throttle(function (Throwable $e) {
        return Lottery::odds(1, 1000);
    });
})
```

예외 타입별로 샘플링하는 것도 가능합니다. 특정 예외 클래스에만 샘플링을 적용하려면 해당 클래스에만 `Lottery` 인스턴스를 반환하면 됩니다.

```
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

샘플링 대신 일정 시간당 건수로 제한하려면(즉, rate limit), `Lottery` 대신 `Limit` 인스턴스를 반환하면 됩니다. 이 방식은, 예를 들어 외부 서비스 장애로 인해 대량 예외가 발생해 로그가 폭주하는 상황에서 특히 유용합니다.

```
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

기본적으로 제한은 예외 클래스명을 기준으로 적용됩니다. 필요하다면 `Limit`에서 `by` 메서드를 사용해 직접 키를 지정할 수 있습니다.

```
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

물론, 서로 다른 예외에 대해 `Lottery`와 `Limit`을 섞어서 사용할 수도 있습니다.

```
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

일부 예외는 서버에서 HTTP 에러 코드를 나타냅니다. 예를 들어, "페이지를 찾을 수 없음"(404), "권한 없음"(401), 또는 개발자가 의도적으로 발생시키는 500 에러 등이 있습니다. 이러한 응답을 코드의 어느 위치에서든 만들고 싶다면 `abort` 헬퍼를 사용할 수 있습니다.

```
abort(404);
```

<a name="custom-http-error-pages"></a>
### 사용자 지정 HTTP 에러 페이지

라라벨은 다양한 HTTP 상태 코드에 대해 맞춤형 에러 페이지를 쉽게 제공할 수 있도록 지원합니다. 예를 들어, 404 HTTP 상태 코드의 에러 페이지를 커스터마이즈하려면 `resources/views/errors/404.blade.php` 뷰 파일을 생성하면 됩니다. 이 뷰는 애플리케이션에서 발생하는 모든 404 에러에 사용됩니다. 이 디렉터리 내의 뷰 파일명은 해당 HTTP 상태 코드와 동일하게 지정해야 합니다. 또한 `abort` 함수로 인해 발생하는 `Symfony\Component\HttpKernel\Exception\HttpException` 인스턴스가 `$exception` 변수로 뷰에 전달됩니다.

```
<h2>{{ $exception->getMessage() }}</h2>
```

라라벨의 기본 에러 페이지 템플릿은 `vendor:publish` 아티즌 명령어로 프로젝트에 퍼블리시할 수 있습니다. 퍼블리시 이후에는 자유롭게 원하는 대로 수정할 수 있습니다.

```shell
php artisan vendor:publish --tag=laravel-errors
```

<a name="fallback-http-error-pages"></a>
#### 폴백(fallback) HTTP 에러 페이지

특정 범위의 HTTP 상태 코드를 위한 "폴백" 에러 페이지도 정의할 수 있습니다. 해당 상태 코드의 개별 페이지가 존재하지 않는 경우, 이 폴백 페이지가 사용됩니다. 이를 위해 `resources/views/errors` 디렉터리에 `4xx.blade.php` 와 `5xx.blade.php` 템플릿을 추가하면 됩니다.

폴백 에러 페이지를 정의해도 `404`, `500`, `503` 에러 응답은 영향을 받지 않습니다. 라라벨이 이 상태 코드에 대해서는 내부적으로 전용 페이지를 사용하기 때문입니다. 만약 이 에러 코드에 대한 페이지를 커스텀하고 싶으면, 각각에 맞는 사용자 지정 에러 페이지를 별도로 정의해야 합니다.
