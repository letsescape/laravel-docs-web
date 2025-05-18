# 오류 처리 (Error Handling)

- [소개](#introduction)
- [설정](#configuration)
- [예외 핸들러](#the-exception-handler)
    - [예외 보고](#reporting-exceptions)
    - [예외 로그 레벨](#exception-log-levels)
    - [타입별 예외 무시](#ignoring-exceptions-by-type)
    - [예외 렌더링](#rendering-exceptions)
    - [보고 및 렌더링 가능한 예외](#renderable-exceptions)
- [HTTP 예외](#http-exceptions)
    - [사용자 지정 HTTP 오류 페이지](#custom-http-error-pages)

<a name="introduction"></a>
## 소개

새로운 라라벨 프로젝트를 시작하면, 오류 및 예외 처리가 이미 기본으로 설정되어 있습니다. 모든 예외는 `App\Exceptions\Handler` 클래스에서 처리되며, 이 클래스에서 예외가 로그로 남겨지고 사용자에게 응답 형태로 렌더링됩니다. 이 문서에서는 이 클래스의 구체적인 내용을 살펴보겠습니다.

<a name="configuration"></a>
## 설정

`config/app.php` 설정 파일의 `debug` 옵션은 사용자에게 오류 관련 정보가 어느 정도까지 표시되는지를 제어합니다. 이 옵션은 기본적으로 `.env` 파일에 저장된 `APP_DEBUG` 환경 변수의 값을 따릅니다.

로컬 개발 환경에서는 `APP_DEBUG`를 `true`로 설정해야 합니다. **하지만, 운영 환경(프로덕션)에서는 반드시 이 값을 `false`로 설정해야 합니다. 운영 환경에서 `true`로 설정하면, 애플리케이션의 민감한 설정 값이 사용자에게 노출될 위험이 있습니다.**

<a name="the-exception-handler"></a>
## 예외 핸들러

<a name="reporting-exceptions"></a>
### 예외 보고

모든 예외는 `App\Exceptions\Handler` 클래스에서 처리됩니다. 이 클래스에는 `register` 메서드가 있는데, 이곳에서 커스텀 예외 보고 및 렌더링 콜백을 등록할 수 있습니다. 이 두 가지 개념에 대해 아래에서 자세히 다룹니다. 예외 보고는 예외를 로그로 남기거나 [Flare](https://flareapp.io), [Bugsnag](https://bugsnag.com), [Sentry](https://github.com/getsentry/sentry-laravel) 같은 외부 서비스로 전송하는 데 사용됩니다. 기본적으로 예외는 [로그](/docs/9.x/logging) 설정에 따라 기록됩니다. 물론, 원하는 방식으로 예외를 기록할 수도 있습니다.

예를 들어, 특정 예외 타입을 다르게 보고하고 싶다면, `reportable` 메서드를 사용해 해당 예외 타입에 대해 실행할 클로저를 등록할 수 있습니다. 라라벨은 클로저의 타입 힌트를 분석해 어떤 예외 타입을 처리할지 자동으로 결정합니다.

```
use App\Exceptions\InvalidOrderException;

/**
 * Register the exception handling callbacks for the application.
 *
 * @return void
 */
public function register()
{
    $this->reportable(function (InvalidOrderException $e) {
        //
    });
}
```

`reportable` 메서드로 커스텀 예외 보고 콜백을 등록하더라도, 라라벨은 여전히 애플리케이션의 기본 로그 설정에 따라 예외를 로그로 남깁니다. 만약 기본 로그 스택으로 예외가 전파되지 않도록 하려면, 콜백 정의 시 `stop` 메서드를 사용하거나 콜백에서 `false`를 반환하면 됩니다.

```
$this->reportable(function (InvalidOrderException $e) {
    //
})->stop();

$this->reportable(function (InvalidOrderException $e) {
    return false;
});
```

> [!NOTE]
> 특정 예외에 대한 보고 방식을 직접 커스터마이즈하고 싶다면, [보고 및 렌더링 가능한 예외](/docs/9.x/errors#renderable-exceptions)도 사용할 수 있습니다.

<a name="global-log-context"></a>
#### 글로벌 로그 컨텍스트

가능하다면 라라벨은 현재 사용자의 ID를 모든 예외 로그 메시지에 컨텍스트 데이터로 자동 추가합니다. 추가로, `App\Exceptions\Handler` 클래스의 `context` 메서드를 오버라이드하여 직접 전역 컨텍스트 데이터를 정의할 수도 있습니다. 이 정보는 애플리케이션에서 남기는 모든 예외 로그 메시지에 포함됩니다.

```
/**
 * Get the default context variables for logging.
 *
 * @return array
 */
protected function context()
{
    return array_merge(parent::context(), [
        'foo' => 'bar',
    ]);
}
```

<a name="exception-log-context"></a>
#### 예외별 로그 컨텍스트

모든 로그 메시지에 컨텍스트를 추가하는 것도 유용하지만, 특정 예외에만 별도의 정보를 포함하고 싶을 때가 있습니다. 애플리케이션의 커스텀 예외 클래스에 `context` 메서드를 정의하면, 그 예외와 관련된 데이터를 해당 예외의 로그 엔트리에 추가할 수 있습니다.

```
<?php

namespace App\Exceptions;

use Exception;

class InvalidOrderException extends Exception
{
    // ...

    /**
     * Get the exception's context information.
     *
     * @return array
     */
    public function context()
    {
        return ['order_id' => $this->orderId];
    }
}
```

<a name="the-report-helper"></a>
#### `report` 헬퍼

때로는 예외를 보고만 하고, 현재 요청 처리를 계속 진행하고 싶을 때가 있습니다. `report` 헬퍼 함수는 에러 페이지를 사용자에게 보여주지 않고 예외를 예외 핸들러를 통해 빠르게 보고할 수 있도록 해줍니다.

```
public function isValid($value)
{
    try {
        // Validate the value...
    } catch (Throwable $e) {
        report($e);

        return false;
    }
}
```

<a name="exception-log-levels"></a>
### 예외 로그 레벨

애플리케이션의 [로그](/docs/9.x/logging)에 메시지를 기록할 때, 각 메시지는 [로그 레벨](/docs/9.x/logging#log-levels)에 따라 작성됩니다. 로그 레벨은 해당 메시지의 심각도나 중요도를 나타냅니다.

앞서 설명한 것처럼, `reportable`을 사용해 맞춤 예외 보고 콜백을 등록하더라도, 라라벨은 예외를 기본 로그 설정에 따라 기록합니다. 다만, 로그 레벨에 따라 메시지가 기록되는 채널이 달라질 수 있으므로, 특정 예외에 대해 로그 레벨을 별도로 정하고 싶을 수 있습니다.

이런 경우, 예외 핸들러 클래스의 `$levels` 프로퍼티에 예외 타입과 해당 로그 레벨을 배열로 정의할 수 있습니다.

```
use PDOException;
use Psr\Log\LogLevel;

/**
 * A list of exception types with their corresponding custom log levels.
 *
 * @var array<class-string<\Throwable>, \Psr\Log\LogLevel::*>
 */
protected $levels = [
    PDOException::class => LogLevel::CRITICAL,
];
```

<a name="ignoring-exceptions-by-type"></a>
### 타입별 예외 무시

애플리케이션을 개발하다 보면, 어떤 예외는 아예 보고 대상에서 제외하고 싶을 때가 있습니다. 예외 핸들러에는 `$dontReport`라는 프로퍼티가 존재하며, 기본값은 빈 배열입니다. 여기에 특정 예외 클래스를 추가하면, 해당 예외는 절대로 보고되지 않습니다. 단, 별도의 렌더링 로직은 적용할 수 있습니다.

```
use App\Exceptions\InvalidOrderException;

/**
 * A list of the exception types that are not reported.
 *
 * @var array<int, class-string<\Throwable>>
 */
protected $dontReport = [
    InvalidOrderException::class,
];
```

> [!NOTE]
> 라라벨은 내부적으로도 404 HTTP "not found" 에러나 잘못된 CSRF 토큰으로 인해 발생하는 419 HTTP 응답과 같은 일부 예외 타입을 이미 자동으로 무시하고 있습니다.

<a name="rendering-exceptions"></a>
### 예외 렌더링

기본적으로 라라벨의 예외 핸들러는 예외를 HTTP 응답으로 변환합니다. 하지만, 특정 예외 타입에 대해 커스텀 렌더링 클로저를 등록할 수도 있습니다. 이를 위해 예외 핸들러의 `renderable` 메서드를 사용할 수 있습니다.

`renderable` 메서드에 전달되는 클로저는 `Illuminate\Http\Response` 인스턴스를 반환해야 하며, 이는 `response` 헬퍼로 생성할 수 있습니다. 라라벨은 클로저의 타입 힌트를 분석해 어떤 예외 타입을 렌더링할지 결정합니다.

```
use App\Exceptions\InvalidOrderException;

/**
 * Register the exception handling callbacks for the application.
 *
 * @return void
 */
public function register()
{
    $this->renderable(function (InvalidOrderException $e, $request) {
        return response()->view('errors.invalid-order', [], 500);
    });
}
```

또, `renderable` 메서드를 사용해 라라벨 또는 Symfony의 기본 예외(`NotFoundHttpException`) 등에 대한 렌더링 동작도 변경할 수 있습니다. 만약 전달된 클로저에서 값을 반환하지 않으면, 라라벨의 기본 예외 렌더링이 적용됩니다.

```
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Register the exception handling callbacks for the application.
 *
 * @return void
 */
public function register()
{
    $this->renderable(function (NotFoundHttpException $e, $request) {
        if ($request->is('api/*')) {
            return response()->json([
                'message' => 'Record not found.'
            ], 404);
        }
    });
}
```

<a name="renderable-exceptions"></a>
### 보고 및 렌더링 가능한 예외

예외 핸들러의 `register` 메서드에서 타입 체크를 통해 예외를 처리하는 대신, 원하는 경우 커스텀 예외 클래스에 `report` 및 `render` 메서드를 직접 정의할 수 있습니다. 이 메서드들이 존재하면 프레임워크가 자동으로 호출해줍니다.

```
<?php

namespace App\Exceptions;

use Exception;

class InvalidOrderException extends Exception
{
    /**
     * Report the exception.
     *
     * @return bool|null
     */
    public function report()
    {
        //
    }

    /**
     * Render the exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function render($request)
    {
        return response(/* ... */);
    }
}
```

만약 예외가 이미 `render` 메서드를 가진(예: 라라벨 또는 Symfony의 기본 예외) 예외를 상속한다면, 예외의 `render` 메서드에서 `false`를 반환하면 기본 HTTP 응답 렌더링이 적용됩니다.

```
/**
 * Render the exception into an HTTP response.
 *
 * @param  \Illuminate\Http\Request  $request
 * @return \Illuminate\Http\Response
 */
public function render($request)
{
    // Determine if the exception needs custom rendering...

    return false;
}
```

특정 조건에서만 커스텀 보고 로직이 필요하고, 그렇지 않은 경우 기본 예외 처리 방식으로 보고하고 싶다면, 예외의 `report` 메서드에서 `false`를 반환하면 됩니다.

```
/**
 * Report the exception.
 *
 * @return bool|null
 */
public function report()
{
    // Determine if the exception needs custom reporting...

    return false;
}
```

> [!NOTE]
> `report` 메서드에서 필요한 의존성을 타입 힌트로 선언하면, 라라벨의 [서비스 컨테이너](/docs/9.x/container)에서 자동으로 주입해줍니다.

<a name="http-exceptions"></a>
## HTTP 예외

몇몇 예외는 서버에서 발생한 HTTP 오류 코드를 나타냅니다. 예를 들어, "페이지를 찾을 수 없음"(404), "권한 없음"(401), 또는 개발자가 의도적으로 발생시키는 500 에러 등이 있습니다. 애플리케이션 어디에서든 이런 HTTP 오류 응답을 생성하려면 `abort` 헬퍼를 사용할 수 있습니다.

```
abort(404);
```

<a name="custom-http-error-pages"></a>
### 사용자 지정 HTTP 오류 페이지

라라벨을 사용하면 다양한 HTTP 상태 코드별로 사용자 지정 오류 페이지를 쉽게 만들 수 있습니다. 예를 들어, 404 오류 페이지를 커스터마이즈하고 싶다면 `resources/views/errors/404.blade.php` 뷰 파일을 생성하면 됩니다. 이 뷰는 애플리케이션에서 발생하는 모든 404 오류에 대해 렌더링됩니다. 이 디렉터리에 있는 각 뷰 파일의 이름은 해당 HTTP 상태 코드와 일치해야 합니다. 또한, `abort` 함수에 의해 발생한 `Symfony\Component\HttpKernel\Exception\HttpException` 인스턴스가 `$exception` 변수로 뷰에 전달됩니다.

```
<h2>{{ $exception->getMessage() }}</h2>
```

라라벨의 기본 오류 페이지 템플릿은 `vendor:publish` 아티즌 명령어로 퍼블리시할 수 있습니다. 템플릿을 퍼블리시한 이후에는 자유롭게 커스터마이즈할 수 있습니다.

```shell
php artisan vendor:publish --tag=laravel-errors
```

<a name="fallback-http-error-pages"></a>
#### 폴백 HTTP 오류 페이지

특정 HTTP 상태 코드에 해당하는 페이지가 없다면, 해당 코드 대역(예: 4xx, 5xx)에 대한 "폴백" 오류 페이지를 정의할 수도 있습니다. 이를 위해, 애플리케이션의 `resources/views/errors` 디렉터리에 `4xx.blade.php`와 `5xx.blade.php` 템플릿을 만들어두면 됩니다.
