# 에러 처리 (Error Handling)

- [소개](#introduction)
- [설정](#configuration)
- [예외 처리](#handling-exceptions)
    - [예외 보고](#reporting-exceptions)
    - [예외 로그 레벨](#exception-log-levels)
    - [예외 타입별 무시](#ignoring-exceptions-by-type)
    - [예외 렌더링](#rendering-exceptions)
    - [보고 및 렌더 가능한 예외](#renderable-exceptions)
- [예외 보고 제한(Throttling)](#throttling-reported-exceptions)
- [HTTP 예외](#http-exceptions)
    - [사용자 정의 HTTP 에러 페이지](#custom-http-error-pages)

<a name="introduction"></a>
## 소개

새로운 라라벨 프로젝트를 시작하면, 에러 및 예외 처리가 이미 사전 구성되어 있습니다. 하지만 언제든지 애플리케이션의 `bootstrap/app.php` 파일에서 `withExceptions` 메서드를 사용해 애플리케이션이 예외를 보고하고 렌더링하는 방식을 직접 제어할 수 있습니다.

`withExceptions` 클로저에 전달되는 `$exceptions` 객체는 `Illuminate\Foundation\Configuration\Exceptions`의 인스턴스이며, 애플리케이션의 예외 처리를 담당합니다. 이 문서에서는 이 객체를 더 자세히 살펴봅니다.

<a name="configuration"></a>
## 설정

`config/app.php` 설정 파일의 `debug` 옵션은 사용자에게 얼마나 많은 에러 정보를 보여줄지 결정합니다. 기본적으로 이 옵션은 `.env` 파일에 저장된 `APP_DEBUG` 환경 변수의 값을 참조하도록 설정되어 있습니다.

개발 환경(로컬)에서는 `APP_DEBUG`를 `true`로 설정해야 합니다. **프로덕션 환경에서는 이 값을 반드시 `false`로 설정해야 합니다. 만약 프로덕션에서 `true`로 두면 민감한 환경설정 값이 사용자에게 노출될 위험이 있습니다.**

<a name="handling-exceptions"></a>
## 예외 처리

<a name="reporting-exceptions"></a>
### 예외 보고

라라벨에서 예외 보고는 예외를 로그로 남기거나, [Sentry](https://github.com/getsentry/sentry-laravel) 또는 [Flare](https://flareapp.io)와 같은 외부 서비스에 전송하는 데 사용됩니다. 기본적으로 예외는 [로깅](/docs/12.x/logging) 설정에 따라 기록됩니다. 하지만 원한다면 예외를 원하는 방식으로 자유롭게 기록할 수 있습니다.

특정 타입의 예외를 각각 다르게 처리해서 보고해야 한다면, 애플리케이션의 `bootstrap/app.php`에서 `report` 예외 메서드를 사용하여 예외 타입 별로 클로저를 등록할 수 있습니다. 라라벨은 클로저의 타입힌트(type-hint)를 분석해 어떤 예외 타입을 처리하는지 결정합니다.

```php
use App\Exceptions\InvalidOrderException;

->withExceptions(function (Exceptions $exceptions) {
    $exceptions->report(function (InvalidOrderException $e) {
        // ...
    });
})
```

`report` 메서드를 써서 커스텀 예외 보고 콜백을 등록해도, 라라벨은 해당 예외를 애플리케이션의 기본 로깅 설정에 맞게 로그로 남깁니다. 기본 로깅 스택으로의 예외 전파를 중단하려면, 보고 콜백을 정의할 때 `stop` 메서드를 사용하거나, 콜백 내에서 `false`를 반환하면 됩니다.

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
> 특정 예외의 보고 동작을 커스터마이즈 하려면, [보고 및 렌더 가능한 예외](/docs/12.x/errors#renderable-exceptions) 기능을 활용할 수도 있습니다.

<a name="global-log-context"></a>
#### 전역 로그 컨텍스트

가능하다면, 라라벨은 현재 사용자의 ID를 각 예외 로그 메시지의 컨텍스트 데이터로 자동 추가합니다. `bootstrap/app.php` 파일의 `context` 예외 메서드를 이용하면, 전역 컨텍스트 데이터를 직접 정의할 수 있습니다. 이 데이터는 애플리케이션에서 기록하는 모든 예외 로그 메시지에 함께 포함됩니다.

```php
->withExceptions(function (Exceptions $exceptions) {
    $exceptions->context(fn () => [
        'foo' => 'bar',
    ]);
})
```

<a name="exception-log-context"></a>
#### 예외별 로그 컨텍스트

모든 로그 메시지에 동일한 컨텍스트를 추가하는 것도 유용하지만, 특정 예외에 대해 로그에만 포함하고 싶은 추가 정보가 있을 수 있습니다. 이럴 때는 해당 예외 클래스에 `context` 메서드를 정의하면, 해당 예외가 발생할 때 원하는 데이터를 로그에 추가할 수 있습니다.

```php
<?php

namespace App\Exceptions;

use Exception;

class InvalidOrderException extends Exception
{
    // ...

    /**
     * 예외의 컨텍스트 정보를 반환합니다.
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

때로는 예외를 보고해야 하지만, 계속해서 현재 요청을 처리하고 싶을 수 있습니다. `report` 헬퍼 함수는 에러 페이지를 사용자에게 보여주지 않고, 예외를 바로 보고할 수 있게 해줍니다.

```php
public function isValid(string $value): bool
{
    try {
        // 값을 유효성 검사...
    } catch (Throwable $e) {
        report($e);

        return false;
    }
}
```

<a name="deduplicating-reported-exceptions"></a>
#### 예외 보고 중복 방지

애플리케이션 곳곳에서 `report` 함수를 사용하면, 동일한 예외 인스턴스를 여러 번 보고해 로그에 중복 항목이 생길 수 있습니다.

동일한 예외 인스턴스가 한 번만 보고되도록 하려면, `bootstrap/app.php` 파일에서 `dontReportDuplicates` 예외 메서드를 사용하세요.

```php
->withExceptions(function (Exceptions $exceptions) {
    $exceptions->dontReportDuplicates();
})
```

이제 `report` 헬퍼로 동일한 예외 인스턴스를 여러 번 호출해도, 최초 한 번만 로그로 남기게 됩니다.

```php
$original = new RuntimeException('Whoops!');

report($original); // 기록됨

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

애플리케이션의 [로그](/docs/12.x/logging)에 메시지를 남길 때, 각 메시지는 [로그 레벨](/docs/12.x/logging#log-levels)을 지정해 중요도 또는 심각도를 구분합니다.

앞서 설명한 것처럼, `report` 메서드로 커스텀 예외 보고 콜백을 등록해도 라라벨은 예외를 기본 로깅 설정에 따라 기록합니다. 하지만 로그 레벨은 기록되는 채널에 영향을 줄 수 있기 때문에, 예외별로 로그 레벨을 별도로 지정하고 싶을 수 있습니다.

이럴 때는 `bootstrap/app.php` 파일의 `level` 예외 메서드를 사용할 수 있습니다. 이 메서드는 첫 번째 인자로 예외 타입, 두 번째 인자로 로그 레벨을 받습니다.

```php
use PDOException;
use Psr\Log\LogLevel;

->withExceptions(function (Exceptions $exceptions) {
    $exceptions->level(PDOException::class, LogLevel::CRITICAL);
})
```

<a name="ignoring-exceptions-by-type"></a>
### 예외 타입별 무시

애플리케이션을 개발하다 보면, 어떤 예외 타입은 절대로 보고하고 싶지 않을 수 있습니다. 이런 경우, `bootstrap/app.php` 파일의 `dontReport` 예외 메서드를 사용해 해당 예외들을 무시하도록 지정할 수 있습니다. 여기에 지정한 클래스의 예외는 기록되지 않지만, 커스텀 렌더링 로직을 가질 수는 있습니다.

```php
use App\Exceptions\InvalidOrderException;

->withExceptions(function (Exceptions $exceptions) {
    $exceptions->dontReport([
        InvalidOrderException::class,
    ]);
})
```

또는 예외 클래스에 `Illuminate\Contracts\Debug\ShouldntReport` 인터페이스를 구현하면, 라라벨의 예외 처리기가 이 예외를 결코 기록하지 않습니다.

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

내부적으로 라라벨은 404 HTTP 오류나 잘못된 CSRF 토큰으로 인한 419 응답 등 일부 예외 유형을 이미 무시하도록 처리합니다. 만약 무시하지 않도록 변경하고 싶다면, `bootstrap/app.php` 파일에서 `stopIgnoring` 예외 메서드를 사용할 수 있습니다.

```php
use Symfony\Component\HttpKernel\Exception\HttpException;

->withExceptions(function (Exceptions $exceptions) {
    $exceptions->stopIgnoring(HttpException::class);
})
```

<a name="rendering-exceptions"></a>
### 예외 렌더링

기본적으로 라라벨의 예외 처리기는 예외를 HTTP 응답으로 변환해줍니다. 하지만 특정 예외 타입에 대해 별도의 렌더링 클로저를 등록해 예외 처리를 커스터마이즈할 수 있습니다. 이때는 `bootstrap/app.php` 파일의 `render` 예외 메서드를 사용하세요.

`render` 메서드에 전달하는 클로저는 `Illuminate\Http\Response` 인스턴스를 반환해야 하며, 이는 `response` 헬퍼로 쉽게 생성할 수 있습니다. 라라벨은 이 클로저의 타입힌트를 통해 어떤 예외 타입에 대한 렌더링인지 결정합니다.

```php
use App\Exceptions\InvalidOrderException;
use Illuminate\Http\Request;

->withExceptions(function (Exceptions $exceptions) {
    $exceptions->render(function (InvalidOrderException $e, Request $request) {
        return response()->view('errors.invalid-order', status: 500);
    });
})
```

`render` 메서드는 라라벨이나 Symfony의 내장 예외(예: `NotFoundHttpException`)의 렌더링 방식을 덮어쓸 때도 사용할 수 있습니다. 이 클로저가 값을 반환하지 않으면, 라라벨의 기본 예외 렌더링 방식을 그대로 사용합니다.

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
#### 예외를 JSON으로 렌더링

예외를 렌더링할 때, 라라벨은 요청의 `Accept` 헤더를 기준으로 HTML 또는 JSON 응답 중 어떤 방식으로 예외를 반환할지 자동으로 결정합니다. 만약 이 결정 방식을 직접 제어하고 싶다면, `shouldRenderJsonWhen` 메서드를 사용할 수 있습니다.

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

아주 가끔, 라라벨의 예외 처리기가 렌더링하는 전체 HTTP 응답 자체를 커스터마이즈해야 할 수도 있습니다. 이럴 때는 `respond` 메서드를 통해 응답 커스터마이즈 클로저를 등록할 수 있습니다.

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
### 보고 및 렌더 가능한 예외

예외별 커스텀 보고 및 렌더링 동작을 `bootstrap/app.php`에서 정의하는 대신, 예외 클래스 자체에 `report` 및 `render` 메서드를 직접 작성할 수도 있습니다. 이 두 메서드가 정의되어 있다면 프레임워크가 자동으로 호출합니다.

```php
<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class InvalidOrderException extends Exception
{
    /**
     * 예외를 보고합니다.
     */
    public function report(): void
    {
        // ...
    }

    /**
     * 예외를 HTTP 응답으로 렌더합니다.
     */
    public function render(Request $request): Response
    {
        return response(/* ... */);
    }
}
```

이미 렌더링 가능한(예: 라라벨/Symfony 내장) 예외를 상속받는 경우, `render` 메서드에서 `false`를 반환하면 해당 예외의 기본 HTTP 응답이 사용됩니다.

```php
/**
 * 예외를 HTTP 응답으로 렌더합니다.
 */
public function render(Request $request): Response|bool
{
    if (/** 예외에 대해 커스텀 렌더링이 필요한지 판단 */) {

        return response(/* ... */);
    }

    return false;
}
```

예외에 특정 조건에서만 필요한 커스텀 보고 로직이 존재한다면, `report` 메서드에서 `false`를 반환하여 라라벨의 기본 예외 처리 설정대로 보고되게 할 수 있습니다.

```php
/**
 * 예외를 보고합니다.
 */
public function report(): bool
{
    if (/** 예외에 대해 커스텀 보고가 필요한지 판단 */) {

        // ...

        return true;
    }

    return false;
}
```

> [!NOTE]
> `report` 메서드가 의존하는 필요한 의존성은 [서비스 컨테이너](/docs/12.x/container)에 의해 자동으로 주입됩니다.

<a name="throttling-reported-exceptions"></a>
### 예외 보고 제한(Throttling)

애플리케이션에서 너무 많은 예외가 보고된다면, 실제로 기록하거나 외부 에러 추적 서비스로 전송되는 예외의 수를 제한하고 싶을 수 있습니다.

예외의 일부만 무작위로 선택해서 기록하려면, `bootstrap/app.php` 파일의 `throttle` 예외 메서드를 사용할 수 있습니다. 이 메서드에는 `Lottery` 인스턴스를 반환하는 클로저를 전달합니다.

```php
use Illuminate\Support\Lottery;
use Throwable;

->withExceptions(function (Exceptions $exceptions) {
    $exceptions->throttle(function (Throwable $e) {
        return Lottery::odds(1, 1000);
    });
})
```

예외 타입에 따라 조건부로 샘플링하는 것도 가능합니다. 특정 예외 클래스에 한해 샘플링하려면 해당 경우에만 `Lottery` 인스턴스를 반환하면 됩니다.

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

외부 에러 추적 서비스로 전송되거나 로그에 기록되는 예외를 일정 시간 동안 제한하고 싶다면, `Lottery` 대신 `Limit` 인스턴스를 반환할 수 있습니다. 예를 들어, 서드파티 서비스 장애로 인해 로그가 폭주하는 상황에 유용합니다.

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

기본적으로 제한은 예외의 클래스명을 키로 사용합니다. 필요하다면 `Limit`의 `by` 메서드로 원하는 키를 지정할 수 있습니다.

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

물론, 서로 다른 예외에 `Lottery`와 `Limit` 인스턴스를 혼합해서 반환하는 것도 가능합니다.

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

특정 예외는 서버에서 발생한 HTTP 오류 코드를 나타낼 수 있습니다. 예를 들어 "페이지를 찾을 수 없습니다"(404)나 "인가되지 않음"(401) 또는 개발자가 발생시킨 500 에러가 해당됩니다. 이런 응답을 애플리케이션 어디서든 쉽게 발생시키려면, `abort` 헬퍼를 사용할 수 있습니다.

```php
abort(404);
```

<a name="custom-http-error-pages"></a>
### 사용자 정의 HTTP 에러 페이지

라라벨은 다양한 HTTP 상태 코드에 대해 커스텀 에러 페이지를 쉽게 표시할 수 있도록 지원합니다. 예를 들어, 404 HTTP 상태 코드의 에러 페이지를 커스터마이즈하려면 `resources/views/errors/404.blade.php` 뷰 템플릿을 생성하세요. 이 뷰는 애플리케이션에서 발생한 모든 404 오류에 대해 렌더링됩니다. 이 디렉토리 내 뷰 파일명은 해당 HTTP 상태 코드와 일치하도록 지정해야 합니다. 또한, `abort` 함수로 발생한 `Symfony\Component\HttpKernel\Exception.HttpException` 인스턴스가 `$exception` 변수로 뷰에 전달됩니다.

```blade
<h2>{{ $exception->getMessage() }}</h2>
```

라라벨의 기본 에러 페이지 템플릿을 `vendor:publish` 아티즌 명령어로 배포(publish)할 수 있습니다. 템플릿을 배포한 후, 원하는 대로 커스터마이즈할 수 있습니다.

```shell
php artisan vendor:publish --tag=laravel-errors
```

<a name="fallback-http-error-pages"></a>
#### 폴백(공통) HTTP 에러 페이지

특정 HTTP 상태 코드에 대응하는 페이지가 없는 경우를 위해 "폴백(fallback)" 에러 페이지를 정의할 수 있습니다. 이를 위해 `resources/views/errors` 디렉토리에 `4xx.blade.php`와 `5xx.blade.php` 템플릿을 생성하면 됩니다.

폴백 에러 페이지를 정의해도, `404`, `500`, `503` 에러 응답은 라라벨이 내부적으로 별도의 전용 페이지를 사용하므로, 이 상태 코드에 대해서는 각각의 에러 페이지를 따로 정의해주어야 커스터마이즈가 적용됩니다.
