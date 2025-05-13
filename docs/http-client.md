# HTTP 클라이언트 (HTTP Client)

- [소개](#introduction)
- [요청 보내기](#making-requests)
    - [요청 데이터](#request-data)
    - [헤더](#headers)
    - [인증](#authentication)
    - [타임아웃](#timeout)
    - [재시도](#retries)
    - [에러 처리](#error-handling)
    - [Guzzle 미들웨어](#guzzle-middleware)
    - [Guzzle 옵션](#guzzle-options)
- [동시 요청](#concurrent-requests)
- [매크로](#macros)
- [테스트](#testing)
    - [응답 가짜 처리](#faking-responses)
    - [요청 검사](#inspecting-requests)
    - [예상치 못한 요청 방지](#preventing-stray-requests)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

라라벨은 [Guzzle HTTP 클라이언트](http://docs.guzzlephp.org/en/stable/)를 감싸는 간결하면서도 표현력이 뛰어난 API를 제공합니다. 이를 통해 외부 웹 애플리케이션과 통신하기 위한 HTTP 요청을 손쉽게 보낼 수 있습니다. 라라벨의 Guzzle 래퍼는 가장 일반적인 사용 사례에 초점을 맞추고 있으며, 훌륭한 개발 경험을 제공합니다.

<a name="making-requests"></a>
## 요청 보내기

`Http` 파사드에서 제공하는 `head`, `get`, `post`, `put`, `patch`, `delete` 메서드를 이용해 HTTP 요청을 보낼 수 있습니다. 먼저, 기본적인 `GET` 요청을 다른 URL에 보내는 방법을 살펴보겠습니다.

```php
use Illuminate\Support\Facades\Http;

$response = Http::get('http://example.com');
```

`get` 메서드는 `Illuminate\Http\Client\Response` 인스턴스를 반환하며, 이 객체는 응답을 확인할 수 있는 다양한 메서드를 제공합니다.

```php
$response->body() : string;
$response->json($key = null, $default = null) : mixed;
$response->object() : object;
$response->collect($key = null) : Illuminate\Support\Collection;
$response->resource() : resource;
$response->status() : int;
$response->successful() : bool;
$response->redirect(): bool;
$response->failed() : bool;
$response->clientError() : bool;
$response->header($header) : string;
$response->headers() : array;
```

`Illuminate\Http\Client\Response` 객체는 PHP의 `ArrayAccess` 인터페이스도 구현하고 있으므로, JSON 응답 데이터에 배열처럼 직접 접근할 수도 있습니다.

```php
return Http::get('http://example.com/users/1')['name'];
```

위에 언급된 응답 메서드 외에도, 아래와 같은 메서드를 사용해 특정 상태 코드가 반환되었는지 확인할 수 있습니다.

```php
$response->ok() : bool;                  // 200 OK
$response->created() : bool;             // 201 Created
$response->accepted() : bool;            // 202 Accepted
$response->noContent() : bool;           // 204 No Content
$response->movedPermanently() : bool;    // 301 Moved Permanently
$response->found() : bool;               // 302 Found
$response->badRequest() : bool;          // 400 Bad Request
$response->unauthorized() : bool;        // 401 Unauthorized
$response->paymentRequired() : bool;     // 402 Payment Required
$response->forbidden() : bool;           // 403 Forbidden
$response->notFound() : bool;            // 404 Not Found
$response->requestTimeout() : bool;      // 408 Request Timeout
$response->conflict() : bool;            // 409 Conflict
$response->unprocessableEntity() : bool; // 422 Unprocessable Entity
$response->tooManyRequests() : bool;     // 429 Too Many Requests
$response->serverError() : bool;         // 500 Internal Server Error
```

<a name="uri-templates"></a>
#### URI 템플릿

HTTP 클라이언트는 [URI 템플릿 명세](https://www.rfc-editor.org/rfc/rfc6570)를 사용해 요청 URL을 쉽게 구성할 수 있습니다. URI 템플릿에서 확장할 URL 파라미터는 `withUrlParameters` 메서드를 사용해 정의합니다.

```php
Http::withUrlParameters([
    'endpoint' => 'https://laravel.com',
    'page' => 'docs',
    'version' => '11.x',
    'topic' => 'validation',
])->get('{+endpoint}/{page}/{version}/{topic}');
```

<a name="dumping-requests"></a>
#### 요청 디버깅(dump)

요청이 전송되기 전에 요청 인스턴스를 덤프(dump)하고 스크립트 실행을 종료하고 싶다면, 요청 정의 시작 부분에 `dd` 메서드를 추가할 수 있습니다.

```php
return Http::dd()->get('http://example.com');
```

<a name="request-data"></a>
### 요청 데이터

일반적으로 `POST`, `PUT`, `PATCH` 요청을 보낼 때는 추가 데이터를 함께 전송하는 경우가 많습니다. 해당 메서드들은 두 번째 인수로 데이터 배열을 받을 수 있습니다. 기본적으로 데이터는 `application/json` 콘텐츠 타입으로 전송됩니다.

```php
use Illuminate\Support\Facades\Http;

$response = Http::post('http://example.com/users', [
    'name' => 'Steve',
    'role' => 'Network Administrator',
]);
```

<a name="get-request-query-parameters"></a>
#### GET 요청 쿼리 파라미터

`GET` 요청을 보낼 때, URL에 쿼리 문자열을 직접 추가하거나 두 번째 인수로 key/value 쌍의 배열을 전달할 수 있습니다.

```php
$response = Http::get('http://example.com/users', [
    'name' => 'Taylor',
    'page' => 1,
]);
```

또는 `withQueryParameters` 메서드를 사용할 수도 있습니다.

```php
Http::retry(3, 100)->withQueryParameters([
    'name' => 'Taylor',
    'page' => 1,
])->get('http://example.com/users')
```

<a name="sending-form-url-encoded-requests"></a>
#### 폼 URL 인코딩 방식 요청

`application/x-www-form-urlencoded` 콘텐츠 타입으로 데이터를 전송하고 싶다면, 요청 전에 `asForm` 메서드를 호출해야 합니다.

```php
$response = Http::asForm()->post('http://example.com/users', [
    'name' => 'Sara',
    'role' => 'Privacy Consultant',
]);
```

<a name="sending-a-raw-request-body"></a>
#### Raw(원시) 바디 전송

요청 바디를 직접 raw 데이터로 전달하고 싶다면, `withBody` 메서드를 사용하세요. 콘텐츠 타입을 두 번째 인수로 전달할 수 있습니다.

```php
$response = Http::withBody(
    base64_encode($photo), 'image/jpeg'
)->post('http://example.com/photo');
```

<a name="multi-part-requests"></a>
#### 멀티파트(Multi-Part) 요청

파일을 multipart 요청으로 전송하고 싶다면, 요청 전에 `attach` 메서드를 호출합니다. 이 메서드는 파일의 이름과 내용을 인수로 받습니다. 필요하다면 세 번째 인수로 파일명을, 네 번째 인수로는 파일에 지정할 헤더를 넘길 수 있습니다.

```php
$response = Http::attach(
    'attachment', file_get_contents('photo.jpg'), 'photo.jpg', ['Content-Type' => 'image/jpeg']
)->post('http://example.com/attachments');
```

파일의 raw 내용 대신 stream 리소스를 전달할 수도 있습니다.

```php
$photo = fopen('photo.jpg', 'r');

$response = Http::attach(
    'attachment', $photo, 'photo.jpg'
)->post('http://example.com/attachments');
```

<a name="headers"></a>
### 헤더

요청에 헤더를 추가하려면 `withHeaders` 메서드를 사용합니다. 이 메서드는 key/value 쌍의 배열을 인수로 받습니다.

```php
$response = Http::withHeaders([
    'X-First' => 'foo',
    'X-Second' => 'bar'
])->post('http://example.com/users', [
    'name' => 'Taylor',
]);
```

응답에 기대하는 콘텐츠 타입을 지정하려면 `accept` 메서드를 사용할 수 있습니다.

```php
$response = Http::accept('application/json')->get('http://example.com/users');
```

특히 자주 쓰는 `application/json` 콘텐츠 타입을 손쉽게 지정하고 싶다면, `acceptJson` 메서드를 사용할 수 있습니다.

```php
$response = Http::acceptJson()->get('http://example.com/users');
```

`withHeaders` 메서드를 사용하면 기존 요청 헤더에 새로운 헤더가 병합됩니다. 모든 헤더를 완전히 교체하고 싶다면, `replaceHeaders` 메서드를 사용하세요.

```php
$response = Http::withHeaders([
    'X-Original' => 'foo',
])->replaceHeaders([
    'X-Replacement' => 'bar',
])->post('http://example.com/users', [
    'name' => 'Taylor',
]);
```

<a name="authentication"></a>
### 인증

기본 인증과 다이제스트 인증 자격증명은 각각 `withBasicAuth`와 `withDigestAuth` 메서드를 사용해 지정할 수 있습니다.

```php
// 기본 인증...
$response = Http::withBasicAuth('taylor@laravel.com', 'secret')->post(/* ... */);

// 다이제스트 인증...
$response = Http::withDigestAuth('taylor@laravel.com', 'secret')->post(/* ... */);
```

<a name="bearer-tokens"></a>
#### Bearer 토큰

요청의 `Authorization` 헤더에 bearer 토큰을 빠르게 추가하고 싶다면, `withToken` 메서드를 사용할 수 있습니다.

```php
$response = Http::withToken('token')->post(/* ... */);
```

<a name="timeout"></a>
### 타임아웃

응답을 기다릴 최대 시간을 초 단위로 지정하려면 `timeout` 메서드를 사용합니다. 기본적으로 HTTP 클라이언트는 30초 후에 타임아웃됩니다.

```php
$response = Http::timeout(3)->get(/* ... */);
```

지정한 시간 내에 응답이 오지 않으면 `Illuminate\Http\Client\ConnectionException` 예외가 발생합니다.

서버에 접속을 시도할 때 대기할 최대 시간(초)은 `connectTimeout` 메서드로 별도로 지정할 수 있습니다. 기본값은 10초입니다.

```php
$response = Http::connectTimeout(3)->get(/* ... */);
```

<a name="retries"></a>
### 재시도

클라이언트나 서버 오류가 발생할 경우 HTTP 클라이언트가 자동으로 요청을 다시 시도하게 하려면, `retry` 메서드를 사용할 수 있습니다. 이 메서드는 요청을 최대 몇 번 시도할지와, 각 시도 사이에 몇 밀리초 대기할지 지정합니다.

```php
$response = Http::retry(3, 100)->post(/* ... */);
```

각 시도 사이 대기 시간을 직접 계산하고 싶다면, 두 번째 인수에 클로저를 전달할 수 있습니다.

```php
use Exception;

$response = Http::retry(3, function (int $attempt, Exception $exception) {
    return $attempt * 100;
})->post(/* ... */);
```

간편하게 첫 번째 인수로 배열을 전달하면, 각시도 사이에 대기할 밀리초 목록을 지정할 수 있습니다.

```php
$response = Http::retry([100, 200])->post(/* ... */);
```

필요하다면 세 번째 인수로 실제 재시도를 할지를 판별하는 콜러블을 전달할 수 있습니다. 예를 들어, 첫 번째 요청에서 `ConnectionException`이 발생한 경우에만 재시도하도록 설정할 수 있습니다.

```php
use Exception;
use Illuminate\Http\Client\PendingRequest;

$response = Http::retry(3, 100, function (Exception $exception, PendingRequest $request) {
    return $exception instanceof ConnectionException;
})->post(/* ... */);
```

요청이 실패했을 때, 다음 시도 전에 요청을 변경하고 싶다면, `retry` 메서드에 제공된 콜러블의 두 번째 인수인 요청 인스턴스를 조작할 수 있습니다. 예를 들어, 첫 번째 시도에서 인증 오류가 발생한 경우 새로운 토큰으로 요청을 다시 시도하고 싶을 때 사용할 수 있습니다.

```php
use Exception;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\RequestException;

$response = Http::withToken($this->getToken())->retry(2, 0, function (Exception $exception, PendingRequest $request) {
    if (! $exception instanceof RequestException || $exception->response->status() !== 401) {
        return false;
    }

    $request->withToken($this->getNewToken());

    return true;
})->post(/* ... */);
```

모든 요청이 실패하면 `Illuminate\Http\Client\RequestException` 예외가 발생합니다. 이 동작을 비활성화하려면, `throw`라는 인수에 `false` 값을 전달합니다. 비활성화된 경우, 모든 시도가 끝난 후 마지막으로 받은 응답이 반환됩니다.

```php
$response = Http::retry(3, 100, throw: false)->post(/* ... */);
```

> [!WARNING]
> 만약 모든 요청이 연결 문제(ConnectionException)로 인해 실패하면, `throw` 옵션을 `false`로 설정하더라도 `Illuminate\Http\Client\ConnectionException` 예외는 여전히 발생합니다.

<a name="error-handling"></a>
### 에러 처리

기본 Guzzle의 동작과 달리, 라라벨의 HTTP 클라이언트 래퍼는 클라이언트나 서버 오류(`400` 또는 `500`번대 응답)에 대해 기본적으로 예외를 발생시키지 않습니다. 이러한 오류가 반환되었는지 확인하려면 `successful`, `clientError`, `serverError` 등의 메서드를 사용하면 됩니다.

```php
// 상태 코드가 >= 200, < 300 인지 확인...
$response->successful();

// 상태 코드가 400 이상인지 확인...
$response->failed();

// 400번대 상태 코드 여부 확인...
$response->clientError();

// 500번대 상태 코드 여부 확인...
$response->serverError();

// 클라이언트 또는 서버 오류 시 콜백 즉시 실행...
$response->onError(callable $callback);
```

<a name="throwing-exceptions"></a>
#### 예외 발생시키기

응답 인스턴스를 가지고 있고, 만약 응답 상태 코드가 클라이언트 또는 서버 오류를 나타낸다면 `Illuminate\Http\Client\RequestException` 예외를 던지고 싶을 때는 `throw` 또는 `throwIf` 메서드를 사용할 수 있습니다.

```php
use Illuminate\Http\Client\Response;

$response = Http::post(/* ... */);

// 클라이언트 또는 서버 오류 시 예외를 던짐...
$response->throw();

// 오류 발생 시, 주어진 조건이 true면 예외를 던짐...
$response->throwIf($condition);

// 오류 발생 시, 주어진 클로저가 true면 예외를 던짐...
$response->throwIf(fn (Response $response) => true);

// 오류 발생 시, 주어진 조건이 false면 예외를 던짐...
$response->throwUnless($condition);

// 오류 발생 시, 주어진 클로저가 false면 예외를 던짐...
$response->throwUnless(fn (Response $response) => false);

// 특정 상태 코드일 때 예외를 던짐...
$response->throwIfStatus(403);

// 특정 상태 코드가 아니면 예외를 던짐...
$response->throwUnlessStatus(200);

return $response['user']['id'];
```

`Illuminate\Http\Client\RequestException` 인스턴스는 반환된 응답을 확인할 수 있는 공개 `$response` 속성을 가지고 있습니다.

`throw` 메서드는 오류가 발생하지 않으면 응답 인스턴스를 그대로 반환하므로, 메서드 체이닝이 가능합니다.

```php
return Http::post(/* ... */)->throw()->json();
```

예외가 던져지기 전에 추가 로직을 실행하고 싶다면, `throw` 메서드에 클로저를 전달할 수 있습니다. 이 경우 클로저 호출 후 예외는 자동으로 던져지므로, 클로저 내부에서 별도로 예외를 다시 던질 필요는 없습니다.

```php
use Illuminate\Http\Client\Response;
use Illuminate\Http\Client\RequestException;

return Http::post(/* ... */)->throw(function (Response $response, RequestException $e) {
    // ...
})->json();
```

기본적으로 `RequestException` 메시지는 로그/보고 시 120자로 잘려서 기록됩니다. 이 동작을 커스터마이징하거나 비활성화하고 싶다면, 애플리케이션의 `bootstrap/app.php`에서 `truncateRequestExceptionsAt`, `dontTruncateRequestExceptions` 메서드를 사용할 수 있습니다.

```php
use Illuminate\Foundation\Configuration\Exceptions;

->withExceptions(function (Exceptions $exceptions) {
    // 예외 메시지를 240자로 잘라서 기록...
    $exceptions->truncateRequestExceptionsAt(240);

    // 예외 메시지 잘림(truncation) 비활성화...
    $exceptions->dontTruncateRequestExceptions();
})
```

<a name="guzzle-middleware"></a>
### Guzzle 미들웨어

라라벨의 HTTP 클라이언트는 Guzzle을 기반으로 동작하므로, [Guzzle 미들웨어](https://docs.guzzlephp.org/en/stable/handlers-and-middleware.html)를 활용해 나가는 요청을 조작하거나 들어오는 응답을 검사할 수 있습니다. 나가는 요청을 조작하려면 `withRequestMiddleware` 메서드를 통해 Guzzle 미들웨어를 등록하세요.

```php
use Illuminate\Support\Facades\Http;
use Psr\Http\Message\RequestInterface;

$response = Http::withRequestMiddleware(
    function (RequestInterface $request) {
        return $request->withHeader('X-Example', 'Value');
    }
)->get('http://example.com');
```

마찬가지로, 들어오는 HTTP 응답을 검사하려면 `withResponseMiddleware` 메서드로 미들웨어를 등록할 수 있습니다.

```php
use Illuminate\Support\Facades\Http;
use Psr\Http\Message\ResponseInterface;

$response = Http::withResponseMiddleware(
    function (ResponseInterface $response) {
        $header = $response->getHeader('X-Example');

        // ...

        return $response;
    }
)->get('http://example.com');
```

<a name="global-middleware"></a>
#### 전역 미들웨어

모든 요청과 응답에 항상 적용되는 미들웨어를 등록하고 싶다면 `globalRequestMiddleware`와 `globalResponseMiddleware` 메서드를 사용할 수 있습니다. 일반적으로 이 메서드들은 애플리케이션의 `AppServiceProvider` 클래스의 `boot` 메서드에서 호출하는 것이 좋습니다.

```php
use Illuminate\Support\Facades\Http;

Http::globalRequestMiddleware(fn ($request) => $request->withHeader(
    'User-Agent', 'Example Application/1.0'
));

Http::globalResponseMiddleware(fn ($response) => $response->withHeader(
    'X-Finished-At', now()->toDateTimeString()
));
```

<a name="guzzle-options"></a>
### Guzzle 옵션

`withOptions` 메서드를 이용해 [Guzzle 요청 옵션](http://docs.guzzlephp.org/en/stable/request-options.html)을 추가로 지정할 수 있습니다. 이 메서드는 key/value 쌍 배열을 인수로 받습니다.

```php
$response = Http::withOptions([
    'debug' => true,
])->get('http://example.com/users');
```

<a name="global-options"></a>
#### 전역 옵션

모든 나가는 요청에 대한 기본 옵션을 지정하려면 `globalOptions` 메서드를 사용할 수 있습니다. 보통 이 메서드는 애플리케이션의 `AppServiceProvider` 클래스의 `boot` 메서드에서 호출합니다.

```php
use Illuminate\Support\Facades\Http;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Http::globalOptions([
        'allow_redirects' => false,
    ]);
}
```

<a name="concurrent-requests"></a>
## 동시 요청

여러 HTTP 요청을 동시에 보내고 싶을 때가 있습니다. 즉, 요청을 하나씩 순차적으로 보내는 것이 아니라, 여러 개를 한 번에 동시에 처리함으로써 느린 HTTP API와 상호작용할 때 성능을 크게 향상시킬 수 있습니다.

이럴 때는 `pool` 메서드를 사용하면 됩니다. `pool` 메서드는 클로저를 받아 사용하며, 클로저에는 `Illuminate\Http\Client\Pool` 인스턴스가 전달되어 여러 요청을 한번에 추가할 수 있습니다.

```php
use Illuminate\Http\Client\Pool;
use Illuminate\Support\Facades\Http;

$responses = Http::pool(fn (Pool $pool) => [
    $pool->get('http://localhost/first'),
    $pool->get('http://localhost/second'),
    $pool->get('http://localhost/third'),
]);

return $responses[0]->ok() &&
       $responses[1]->ok() &&
       $responses[2]->ok();
```

이처럼 각 응답 인스턴스는 pool에 추가한 순서대로 접근할 수 있습니다. 필요하다면, `as` 메서드로 각 요청에 이름을 붙여 응답에 이름으로 접근하는 것도 가능합니다.

```php
use Illuminate\Http\Client\Pool;
use Illuminate\Support\Facades\Http;

$responses = Http::pool(fn (Pool $pool) => [
    $pool->as('first')->get('http://localhost/first'),
    $pool->as('second')->get('http://localhost/second'),
    $pool->as('third')->get('http://localhost/third'),
]);

return $responses['first']->ok();
```

<a name="customizing-concurrent-requests"></a>
#### 동시 요청 커스터마이징

`pool` 메서드는 `withHeaders`, `middleware` 등과 같은 다른 HTTP 클라이언트 메서드와 체이닝할 수 없습니다. pool로 묶인 각 요청에 커스텀 헤더나 미들웨어를 적용하려면, pool 내부에서 각 요청별로 설정해야 합니다.

```php
use Illuminate\Http\Client\Pool;
use Illuminate\Support\Facades\Http;

$headers = [
    'X-Example' => 'example',
];

$responses = Http::pool(fn (Pool $pool) => [
    $pool->withHeaders($headers)->get('http://laravel.test/test'),
    $pool->withHeaders($headers)->get('http://laravel.test/test'),
    $pool->withHeaders($headers)->get('http://laravel.test/test'),
]);
```

<a name="macros"></a>
## 매크로

라라벨 HTTP 클라이언트는 "매크로"를 정의할 수 있도록 지원합니다. 매크로를 사용하면 서비스별로 공통 요청 path와 헤더를 편리하게 설정하여, 일관된 방식으로 요청을 구성할 수 있습니다. 매크로는 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드 내부에 정의하면 됩니다.

```php
use Illuminate\Support\Facades\Http;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Http::macro('github', function () {
        return Http::withHeaders([
            'X-Example' => 'example',
        ])->baseUrl('https://github.com');
    });
}
```

매크로를 정의했다면, 애플리케이션 어디서든 이를 호출해 지정한 설정이 적용된 요청을 보낼 수 있습니다.

```php
$response = Http::github()->get('/');
```

<a name="testing"></a>
## 테스트

라라벨의 다양한 서비스는 테스트를 쉽게, 그리고 표현력 있게 작성할 수 있도록 지원합니다. HTTP 클라이언트도 예외가 아닙니다. `Http` 파사드의 `fake` 메서드는 HTTP 요청이 발생할 때 미리 정의한 응답(스텁/더미 응답)을 반환하도록 만들어줍니다.

<a name="faking-responses"></a>
### 응답 가짜 처리

예를 들어 모든 요청에 대해 비어있는 200 상태 코드 응답을 반환하게 하려면, 인수 없이 `fake` 메서드를 호출하면 됩니다.

```php
use Illuminate\Support\Facades\Http;

Http::fake();

$response = Http::post(/* ... */);
```

<a name="faking-specific-urls"></a>
#### 특정 URL에 대한 응답 가짜 처리

또는 `fake` 메서드에 배열을 전달할 수도 있습니다. 배열의 key는 가짜 응답을 정의할 URL 패턴이고, 값은 해당 응답입니다. `*` 문자를 와일드카드로 사용할 수 있습니다. 가짜 처리되지 않은 URL로의 요청은 실제로 실행됩니다. 스텁 응답 생성은 `Http` 파사드의 `response` 메서드를 사용합니다.

```php
Http::fake([
    // GitHub 엔드포인트의 JSON 응답 가짜 처리...
    'github.com/*' => Http::response(['foo' => 'bar'], 200, $headers),

    // Google 엔드포인트 문자열 응답 가짜 처리...
    'google.com/*' => Http::response('Hello World', 200, $headers),
]);
```

모든 매칭되지 않은 URL에 대해 응답을 스텁 처리하고 싶다면, 단일 `*` 문자를 사용할 수 있습니다.

```php
Http::fake([
    // GitHub 엔드포인트의 JSON 응답 가짜 처리...
    'github.com/*' => Http::response(['foo' => 'bar'], 200, ['Headers']),

    // 나머지 모든 엔드포인트의 문자열 응답 가짜 처리...
    '*' => Http::response('Hello World', 200, ['Headers']),
]);
```

간단히 문자열, 배열, 정수를 응답 값으로 넘기면 각각 문자열, JSON, 비어있는 응답이 생성됩니다.

```php
Http::fake([
    'google.com/*' => 'Hello World',
    'github.com/*' => ['foo' => 'bar'],
    'chatgpt.com/*' => 200,
]);
```

<a name="faking-connection-exceptions"></a>
#### 예외 가짜 처리

테스트 중 HTTP 클라이언트가 `Illuminate\Http\Client\ConnectionException`을 만났을 때 애플리케이션이 어떻게 동작하는지 확인해야 할 때가 있습니다. 이럴 때는 `failedConnection` 메서드를 사용하면 됩니다.

```php
Http::fake([
    'github.com/*' => Http::failedConnection(),
]);
```

`Illuminate\Http\Client\RequestException` 예외가 발생했을 때의 동작을 테스트하고 싶다면, `failedRequest` 메서드를 사용하세요.

```php
Http::fake([
    'github.com/*' => Http::failedRequest(['code' => 'not_found'], 404),
]);
```

<a name="faking-response-sequences"></a>
#### 응답 시퀀스 가짜 처리

특정 URL로 여러 번 요청을 보낼 때, 순서대로 여러 가짜 응답을 반환해야 할 때가 있습니다. 이럴 때는 `Http::sequence` 메서드를 사용해 응답 시퀀스를 만들 수 있습니다.

```php
Http::fake([
    // GitHub 엔드포인트에 일련의 응답 스텁 처리...
    'github.com/*' => Http::sequence()
        ->push('Hello World', 200)
        ->push(['foo' => 'bar'], 200)
        ->pushStatus(404),
]);
```

응답 시퀀스의 모든 스텁을 다 소진하면, 추가 요청 시 예외가 발생합니다. 남은 응답이 없는 경우 반환할 기본 응답을 지정하려면 `whenEmpty` 메서드를 사용할 수 있습니다.

```php
Http::fake([
    // GitHub 엔드포인트에 시퀀스 응답 처리...
    'github.com/*' => Http::sequence()
        ->push('Hello World', 200)
        ->push(['foo' => 'bar'], 200)
        ->whenEmpty(Http::response()),
]);
```

특정 URL 패턴을 지정하지 않고 응답 시퀀스를 가짜로 처리하고 싶다면 `Http::fakeSequence` 메서드를 사용할 수 있습니다.

```php
Http::fakeSequence()
    ->push('Hello World', 200)
    ->whenEmpty(Http::response());
```

<a name="fake-callback"></a>
#### 가짜 콜백

특정 엔드포인트마다 어떤 응답을 반환할지 더 복잡한 논리가 필요하다면, `fake` 메서드에 클로저를 전달하면 됩니다. 이 클로저에는 `Illuminate\Http\Client\Request` 인스턴스가 전달되며, 적절한 응답 인스턴스를 반환하면 됩니다. 클로저 내부에서 원하는 로직을 자유롭게 구현할 수 있습니다.

```php
use Illuminate\Http\Client\Request;

Http::fake(function (Request $request) {
    return Http::response('Hello World', 200);
});
```

<a name="preventing-stray-requests"></a>
### 예상치 못한 요청 방지

전체 테스트나 단일 테스트 내에서 HTTP 클라이언트 요청이 전부 가짜 응답을 반환하도록 강제하려면, `preventStrayRequests` 메서드를 사용할 수 있습니다. 이 메서드를 호출하면, 대응하는 가짜 응답이 없는 요청은 실제로 전송되지 않고 바로 예외를 던집니다.

```php
use Illuminate\Support\Facades\Http;

Http::preventStrayRequests();

Http::fake([
    'github.com/*' => Http::response('ok'),
]);

// "ok" 응답 반환...
Http::get('https://github.com/laravel/framework');

// 예외 발생...
Http::get('https://laravel.com');
```

<a name="inspecting-requests"></a>
### 요청 검사

가짜 응답을 사용하면서 실제로 클라이언트가 어떤 요청을 받았는지 검사해야 할 때가 있습니다. 예를 들어, 애플리케이션이 올바른 데이터나 헤더를 보내는지 확인하려면 `Http::assertSent` 메서드를 사용합니다.

`assertSent` 메서드는 클로저를 인수로 받으며, 클로저에는 `Illuminate\Http\Client\Request` 인스턴스가 전달됩니다. 클로저가 true를 반환하는 조건을 충족하는 요청이 최소 1회 발생해야 테스트가 통과합니다.

```php
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

Http::fake();

Http::withHeaders([
    'X-First' => 'foo',
])->post('http://example.com/users', [
    'name' => 'Taylor',
    'role' => 'Developer',
]);

Http::assertSent(function (Request $request) {
    return $request->hasHeader('X-First', 'foo') &&
           $request->url() == 'http://example.com/users' &&
           $request['name'] == 'Taylor' &&
           $request['role'] == 'Developer';
});
```

특정 요청이 전송되지 않았음을 검사하려면 `assertNotSent` 메서드를 사용할 수 있습니다.

```php
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

Http::fake();

Http::post('http://example.com/users', [
    'name' => 'Taylor',
    'role' => 'Developer',
]);

Http::assertNotSent(function (Request $request) {
    return $request->url() === 'http://example.com/posts';
});
```

`assertSentCount` 메서드를 사용하면 테스트 중 "전송"된 요청 수를 검증할 수 있습니다.

```php
Http::fake();

Http::assertSentCount(5);
```

또는 `assertNothingSent` 메서드로 테스트 중 어떤 요청도 전송되지 않았음을 확인할 수 있습니다.

```php
Http::fake();

Http::assertNothingSent();
```

<a name="recording-requests-and-responses"></a>
#### 요청/응답 기록

`recorded` 메서드를 사용하면 모든 요청과 해당 응답을 모아볼 수 있습니다. `recorded` 메서드는 `Illuminate\Http\Client\Request`, `Illuminate\Http\Client\Response` 인스턴스가 들어있는 배열의 컬렉션을 반환합니다.

```php
Http::fake([
    'https://laravel.com' => Http::response(status: 500),
    'https://nova.laravel.com/' => Http::response(),
]);

Http::get('https://laravel.com');
Http::get('https://nova.laravel.com/');

$recorded = Http::recorded();

[$request, $response] = $recorded[0];
```

또한, `recorded` 메서드에 클로저를 전달해 기대에 따라 요청/응답 쌍을 필터링할 수도 있습니다.

```php
use Illuminate\Http\Client\Request;
use Illuminate\Http\Client\Response;

Http::fake([
    'https://laravel.com' => Http::response(status: 500),
    'https://nova.laravel.com/' => Http::response(),
]);

Http::get('https://laravel.com');
Http::get('https://nova.laravel.com/');

$recorded = Http::recorded(function (Request $request, Response $response) {
    return $request->url() !== 'https://laravel.com' &&
           $response->successful();
});
```

<a name="events"></a>
## 이벤트

라라벨은 HTTP 요청을 보내는 과정에서 세 가지 이벤트를 발생시킵니다. 요청 전에는 `RequestSending` 이벤트가, 응답을 받은 후에는 `ResponseReceived` 이벤트가, 응답을 받지 못할 경우에는 `ConnectionFailed` 이벤트가 발생합니다.

`RequestSending`과 `ConnectionFailed` 이벤트에는 해당 요청을 검사할 수 있는 공개 `$request` 속성이 있습니다. 마찬가지로, `ResponseReceived` 이벤트에는 `$request`와 `$response` 속성이 있어 각각 요청, 응답 정보를 확인할 수 있습니다. 이들 이벤트에 대해 [이벤트 리스너](/docs/events)를 생성하거나 등록할 수 있습니다.

```php
use Illuminate\Http\Client\Events\RequestSending;

class LogRequest
{
    /**
     * Handle the given event.
     */
    public function handle(RequestSending $event): void
    {
        // $event->request ...
    }
}
```
