# HTTP 클라이언트 (HTTP Client)

- [소개](#introduction)
- [요청 보내기](#making-requests)
    - [요청 데이터](#request-data)
    - [헤더](#headers)
    - [인증](#authentication)
    - [타임아웃](#timeout)
    - [재시도](#retries)
    - [에러 핸들링](#error-handling)
    - [Guzzle 미들웨어](#guzzle-middleware)
    - [Guzzle 옵션](#guzzle-options)
- [동시 요청](#concurrent-requests)
- [매크로](#macros)
- [테스트](#testing)
    - [응답 가짜 데이터 설정](#faking-responses)
    - [요청 검사](#inspecting-requests)
    - [불필요한 요청 방지](#preventing-stray-requests)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

라라벨은 [Guzzle HTTP 클라이언트](http://docs.guzzlephp.org/en/stable/)를 감싸는 간결하고 직관적인 API를 제공합니다. 이를 통해 다른 웹 애플리케이션과 통신하기 위한 외부 HTTP 요청을 아주 빠르게 만들 수 있습니다. 라라벨의 Guzzle 감싸기(wrapper)는 가장 많이 쓰이는 사용 사례와 개발자의 편의성을 중심으로 설계되어 있습니다.

<a name="making-requests"></a>
## 요청 보내기

요청을 보내기 위해서는 `Http` 파사드에서 제공하는 `head`, `get`, `post`, `put`, `patch`, `delete` 메서드를 사용할 수 있습니다. 먼저, 다른 URL로 기본적인 `GET` 요청을 보내는 방법을 살펴보겠습니다.

```php
use Illuminate\Support\Facades\Http;

$response = Http::get('http://example.com');
```

`get` 메서드는 `Illuminate\Http\Client\Response` 인스턴스를 반환하며, 이를 통해 응답을 다양한 방식으로 확인할 수 있는 여러 메서드를 사용할 수 있습니다.

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

`Illuminate\Http\Client\Response` 객체는 PHP의 `ArrayAccess` 인터페이스도 구현하고 있기 때문에, 응답 데이터가 JSON일 경우 배열처럼 바로 접근할 수 있습니다.

```php
return Http::get('http://example.com/users/1')['name'];
```

위에 소개한 응답 관련 메서드 외에도, 다음의 메서드를 사용하여 응답이 특정 상태 코드를 가지고 있는지 쉽게 확인할 수 있습니다.

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

HTTP 클라이언트는 [URI 템플릿 명세](https://www.rfc-editor.org/rfc/rfc6570)를 사용하여 요청 URL을 동적으로 구성할 수 있도록 지원합니다. `withUrlParameters` 메서드를 사용해서 URI 템플릿에서 확장할 수 있는 URL 파라미터를 정의할 수 있습니다.

```php
Http::withUrlParameters([
    'endpoint' => 'https://laravel.com',
    'page' => 'docs',
    'version' => '11.x',
    'topic' => 'validation',
])->get('{+endpoint}/{page}/{version}/{topic}');
```

<a name="dumping-requests"></a>
#### 요청 디버깅(Dumping Requests)

요청이 실제로 전송되기 전에 요청 인스턴스를 화면에 출력하고 스크립트 실행을 중단하고 싶다면, 요청 정의의 시작 부분에 `dd` 메서드를 추가할 수 있습니다.

```php
return Http::dd()->get('http://example.com');
```

<a name="request-data"></a>
### 요청 데이터

일반적으로 `POST`, `PUT`, `PATCH` 요청을 보낼 때는 요청 데이터도 함께 전송해야 합니다. 이들 메서드는 두 번째 인수로 데이터 배열을 받을 수 있습니다. 기본적으로 요청 데이터는 `application/json` 컨텐츠 타입으로 전송됩니다.

```php
use Illuminate\Support\Facades\Http;

$response = Http::post('http://example.com/users', [
    'name' => 'Steve',
    'role' => 'Network Administrator',
]);
```

<a name="get-request-query-parameters"></a>
#### GET 요청 쿼리 파라미터

`GET` 요청을 할 때는 URL에 쿼리 문자열을 직접 붙여 사용할 수도 있고, `get` 메서드의 두 번째 인수로 key/value 쌍의 배열을 전달할 수도 있습니다.

```php
$response = Http::get('http://example.com/users', [
    'name' => 'Taylor',
    'page' => 1,
]);
```

또는, `withQueryParameters` 메서드를 사용할 수도 있습니다.

```php
Http::retry(3, 100)->withQueryParameters([
    'name' => 'Taylor',
    'page' => 1,
])->get('http://example.com/users')
```

<a name="sending-form-url-encoded-requests"></a>
#### Form URL Encoded 요청 보내기

`application/x-www-form-urlencoded` 타입으로 데이터를 전송하고 싶다면, 요청을 보내기 전에 `asForm` 메서드를 호출하면 됩니다.

```php
$response = Http::asForm()->post('http://example.com/users', [
    'name' => 'Sara',
    'role' => 'Privacy Consultant',
]);
```

<a name="sending-a-raw-request-body"></a>
#### Raw 요청 바디 전송

요청을 보낼 때 raw(가공하지 않은) 형태의 요청 본문을 전송하고 싶다면, `withBody` 메서드를 사용할 수 있습니다. 이때 컨텐츠 타입은 두 번째 인수로 명시해야 합니다.

```php
$response = Http::withBody(
    base64_encode($photo), 'image/jpeg'
)->post('http://example.com/photo');
```

<a name="multi-part-requests"></a>
#### 멀티파트(Multi-Part) 요청

파일을 첨부하여 멀티파트 요청을 보내려면, 요청 전에 `attach` 메서드를 사용해야 합니다. 이 메서드는 첫 번째 인자로 파일 이름, 두 번째 인자로 파일 내용을 받으며, 필요하다면 세 번째 인수로 파일의 실제 파일명, 네 번째 인수로 파일과 관련된 헤더를 지정할 수 있습니다.

```php
$response = Http::attach(
    'attachment', file_get_contents('photo.jpg'), 'photo.jpg', ['Content-Type' => 'image/jpeg']
)->post('http://example.com/attachments');
```

파일의 실제 내용이 아닌 스트림 리소스를 전달할 수도 있습니다.

```php
$photo = fopen('photo.jpg', 'r');

$response = Http::attach(
    'attachment', $photo, 'photo.jpg'
)->post('http://example.com/attachments');
```

<a name="headers"></a>
### 헤더

요청에 헤더를 추가하려면 `withHeaders` 메서드를 사용할 수 있습니다. 이 메서드는 key/value 쌍의 배열을 인수로 받습니다.

```php
$response = Http::withHeaders([
    'X-First' => 'foo',
    'X-Second' => 'bar'
])->post('http://example.com/users', [
    'name' => 'Taylor',
]);
```

`accept` 메서드를 사용하면, 요청에 대해 애플리케이션이 어떤 컨텐츠 타입을 기대하는지 지정할 수 있습니다.

```php
$response = Http::accept('application/json')->get('http://example.com/users');
```

더욱 간편하게, `acceptJson` 메서드를 사용해 `application/json` 타입을 바로 지정할 수도 있습니다.

```php
$response = Http::acceptJson()->get('http://example.com/users');
```

`withHeaders` 메서드는 기존 요청 헤더에 새로운 헤더를 병합합니다. 만약 기존 헤더를 전부 다른 헤더로 교체하고 싶다면 `replaceHeaders` 메서드를 사용하면 됩니다.

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

기본 인증(Basic Authentication)과 다이제스트 인증(Digest Authentication) 정보를 각각 `withBasicAuth`와 `withDigestAuth` 메서드로 지정할 수 있습니다.

```php
// Basic authentication...
$response = Http::withBasicAuth('taylor@laravel.com', 'secret')->post(/* ... */);

// Digest authentication...
$response = Http::withDigestAuth('taylor@laravel.com', 'secret')->post(/* ... */);
```

<a name="bearer-tokens"></a>
#### Bearer 토큰

요청의 `Authorization` 헤더에 Bearer 토큰을 손쉽게 추가하려면, `withToken` 메서드를 사용하면 됩니다.

```php
$response = Http::withToken('token')->post(/* ... */);
```

<a name="timeout"></a>
### 타임아웃

`timeout` 메서드는 응답을 기다리는 최대 초(second)를 지정할 수 있습니다. 기본적으로 HTTP 클라이언트는 30초 후에 시간 초과 처리합니다.

```php
$response = Http::timeout(3)->get(/* ... */);
```

지정한 시간 초과를 넘기면 `Illuminate\Http\Client\ConnectionException` 인스턴스가 발생합니다.

서버에 연결 시도할 때 대기할 최대 초(second)를 지정하고 싶다면 `connectTimeout` 메서드를 사용할 수 있습니다. 기본값은 10초입니다.

```php
$response = Http::connectTimeout(3)->get(/* ... */);
```

<a name="retries"></a>
### 재시도

클라이언트 또는 서버 오류가 발생할 경우 HTTP 클라이언트가 요청을 자동으로 재시도하도록 하려면 `retry` 메서드를 사용할 수 있습니다. 이 메서드는 요청을 시도할 최대 횟수와 각 시도 사이에 라라벨이 대기할 밀리초(ms) 시간을 인수로 받습니다.

```php
$response = Http::retry(3, 100)->post(/* ... */);
```

재시도 간 대기할 밀리초를 직접 계산하려면, 두 번째 인수로 클로저(closure)를 전달할 수 있습니다.

```php
use Exception;

$response = Http::retry(3, function (int $attempt, Exception $exception) {
    return $attempt * 100;
})->post(/* ... */);
```

편의를 위해, 첫 번째 인수로 배열을 전달할 수도 있습니다. 이 배열은 각 시도마다 얼마나 대기할지 밀리초 단위로 지정합니다.

```php
$response = Http::retry([100, 200])->post(/* ... */);
```

필요하다면 세 번째 인수로 콜러블(callable)을 전달하여 실제로 재시도를 시도할지 결정할 수 있습니다. 예를 들어, 요청이 `ConnectionException` 오류를 만났을 때만 재시도를 원한다면 다음처럼 작성할 수 있습니다.

```php
use Exception;
use Illuminate\Http\Client\PendingRequest;

$response = Http::retry(3, 100, function (Exception $exception, PendingRequest $request) {
    return $exception instanceof ConnectionException;
})->post(/* ... */);
```

요청 시도가 실패한 경우, 새로운 시도를 하기 전에 요청을 변경하고 싶을 수도 있습니다. 이런 경우, `retry` 메서드에 전달한 콜러블에서 전달받는 request 인수를 활용하여 요청을 수정할 수 있습니다. 예를 들어, 첫 번째 요청에서 인증 오류가 발생하면 새로운 인증 토큰으로 다시 요청하도록 할 수도 있습니다.

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

설정한 횟수만큼 시도를 모두 실패하면, `Illuminate\Http\Client\RequestException` 인스턴스가 던져집니다. 이 동작을 비활성화하고 싶다면 `throw` 인수를 `false`로 지정하면 됩니다. 비활성화하면 모든 재시도 후 마지막으로 받은 응답을 반환합니다.

```php
$response = Http::retry(3, 100, throw: false)->post(/* ... */);
```

> [!WARNING]
> 모든 요청이 연결 문제로 실패한 경우, `throw` 인수를 `false`로 설정했다 해도 `Illuminate\Http\Client\ConnectionException` 예외는 여전히 전달됩니다.

<a name="error-handling"></a>
### 에러 핸들링

Guzzle의 기본 동작과 다르게, 라라벨의 HTTP 클라이언트 래퍼는 클라이언트/서버 오류(서버에서 400번대, 500번대 응답)가 발생할 때 예외를 던지지 않습니다. 이러한 오류가 발생했는지는 `successful`, `clientError`, `serverError` 메서드를 사용해 확인할 수 있습니다.

```php
// 상태 코드가 200 이상 300 미만인지 확인...
$response->successful();

// 상태 코드가 400 이상인지 확인...
$response->failed();

// 응답이 400번대 상태 코드인지 확인...
$response->clientError();

// 응답이 500번대 상태 코드인지 확인...
$response->serverError();

// 클라이언트나 서버 에러가 있을 때 지정한 콜백을 즉시 실행...
$response->onError(callable $callback);
```

<a name="throwing-exceptions"></a>
#### 예외 던지기

응답 인스턴스가 있고, 응답 상태 코드가 클라이언트 또는 서버 오류임을 나타낼 경우 `Illuminate\Http\Client\RequestException` 예외를 던지려면, `throw` 또는 `throwIf` 메서드를 사용할 수 있습니다.

```php
use Illuminate\Http\Client\Response;

$response = Http::post(/* ... */);

// 클라이언트 혹은 서버 오류가 발생하면 예외를 던집니다.
$response->throw();

// 오류가 발생했고, 주어진 조건이 true일 때 예외를 던집니다.
$response->throwIf($condition);

// 오류가 발생했고, 주어진 클로저가 true를 반환하면 예외를 던집니다.
$response->throwIf(fn (Response $response) => true);

// 오류가 발생했고, 주어진 조건이 false일 때 예외를 던집니다.
$response->throwUnless($condition);

// 오류가 발생했고, 주어진 클로저가 false를 반환하면 예외를 던집니다.
$response->throwUnless(fn (Response $response) => false);

// 응답이 특정 상태 코드일 때 예외를 던집니다.
$response->throwIfStatus(403);

// 응답이 특정 상태 코드가 아닐 때 예외를 던집니다.
$response->throwUnlessStatus(200);

return $response['user']['id'];
```

`Illuminate\Http\Client\RequestException` 인스턴스에는 반환된 응답을 확인할 수 있는 public `$response` 속성이 있습니다.

`throw` 메서드는 오류가 없는 경우에는 response 인스턴스를 그대로 반환하므로, `throw` 메서드 이후에 다른 작업을 체이닝해서 사용할 수 있습니다.

```php
return Http::post(/* ... */)->throw()->json();
```

예외가 던져지기 전에 추가적으로 처리할 작업이 있다면, `throw` 메서드에 클로저를 전달할 수도 있습니다. 클로저 실행 후에는 예외가 자동으로 던져지므로, 클로저에서 직접 예외를 다시 던질 필요는 없습니다.

```php
use Illuminate\Http\Client\Response;
use Illuminate\Http\Client\RequestException;

return Http::post(/* ... */)->throw(function (Response $response, RequestException $e) {
    // ...
})->json();
```

기본적으로, `RequestException` 메시지는 로그나 리포트 시 120자까지 잘립니다. 이 동작을 변경 또는 비활성화하려면, 애플리케이션의 `bootstrap/app.php` 파일에서 `truncateRequestExceptionsAt` 및 `dontTruncateRequestExceptions` 메서드를 사용할 수 있습니다.

```php
use Illuminate\Foundation\Configuration\Exceptions;

->withExceptions(function (Exceptions $exceptions) {
    // 요청 예외 메시지를 240자로 잘라서 저장하도록 설정...
    $exceptions->truncateRequestExceptionsAt(240);

    // 요청 예외 메시지 자르기 비활성화...
    $exceptions->dontTruncateRequestExceptions();
})
```

<a name="guzzle-middleware"></a>
### Guzzle 미들웨어

라라벨의 HTTP 클라이언트는 내부적으로 Guzzle을 사용하므로, [Guzzle 미들웨어](https://docs.guzzlephp.org/en/stable/handlers-and-middleware.html)를 활용하여 나가는 요청을 가공하거나 들어오는 응답을 검사할 수 있습니다. 나가는 요청을 가공하려면 `withRequestMiddleware` 메서드로 미들웨어를 등록합니다.

```php
use Illuminate\Support\Facades\Http;
use Psr\Http\Message\RequestInterface;

$response = Http::withRequestMiddleware(
    function (RequestInterface $request) {
        return $request->withHeader('X-Example', 'Value');
    }
)->get('http://example.com');
```

들어오는 HTTP 응답을 검사하고 싶을 때는 `withResponseMiddleware` 메서드를 이용하여 미들웨어를 등록할 수 있습니다.

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

모든 나가는 요청 및 들어오는 응답에 항상 적용되는 미들웨어를 등록하고 싶을 때도 있습니다. 이럴 때는 `globalRequestMiddleware`와 `globalResponseMiddleware` 메서드를 사용할 수 있습니다. 보통 이 메서드들은 애플리케이션의 `AppServiceProvider`의 `boot` 메서드에서 호출하는 것이 좋습니다.

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

나가는 요청에 추가적인 [Guzzle 요청 옵션](http://docs.guzzlephp.org/en/stable/request-options.html)이 필요하다면, `withOptions` 메서드를 사용하면 됩니다. 이 메서드는 key/value 쌍의 배열을 인수로 받습니다.

```php
$response = Http::withOptions([
    'debug' => true,
])->get('http://example.com/users');
```

<a name="global-options"></a>
#### 전역 옵션

모든 나가는 요청에 기본 옵션을 지정하려면, `globalOptions` 메서드를 활용할 수 있습니다. 이는 마찬가지로 애플리케이션의 `AppServiceProvider`의 `boot` 메서드에서 호출하는 것이 일반적입니다.

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

여러 HTTP 요청을 동시에 보내고 싶을 때가 종종 있습니다. 즉, 여러 요청을 차례로 보내는 대신 한 번에 동시에 여러 요청을 발송하고 싶을 때 입니다. 이렇게 하면 느린 HTTP API와 상호작용할 때 성능이 크게 향상될 수 있습니다.

이럴 때는 `pool` 메서드를 사용하면 됩니다. `pool` 메서드는 클로저를 인수로 받아, 클로저 안에서 `Illuminate\Http\Client\Pool` 인스턴스를 통해 쉽게 여러 요청을 pool에 추가할 수 있습니다.

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

위 예시처럼, 각각의 응답 인스턴스는 요청이 pool에 추가된 순서대로 배열 인덱스로 접근할 수 있습니다. 원한다면 `as` 메서드로 요청에 이름을 붙여, 응답도 해당 이름으로 바로 접근할 수 있습니다.

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

`pool` 메서드는 `withHeaders`나 `middleware` 같은 다른 HTTP 클라이언트 메서드와 체이닝해서 사용할 수 없습니다. pool에 추가하는 각 요청에서 직접 옵션을 설정해야 합니다.

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

라라벨 HTTP 클라이언트는 "매크로"를 정의할 수 있습니다. 매크로는 서비스와 상호작용할 때 자주 사용하는 요청 경로나 헤더 설정을 손쉽게 구성할 수 있는 유연하고 직관적인 방법을 제공합니다. 먼저, 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드 안에서 매크로를 정의할 수 있습니다.

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

이제 매크로가 설정되었으므로, 애플리케이션 어디서든 해당 매크로를 호출해 지정한 설정으로 요청을 만들 수 있습니다.

```php
$response = Http::github()->get('/');
```

<a name="testing"></a>

## 테스트 (Testing)

많은 라라벨 서비스에서는 테스트를 쉽고 명확하게 작성할 수 있도록 다양한 기능을 제공합니다. 라라벨의 HTTP 클라이언트 역시 예외는 아닙니다. `Http` 파사드의 `fake` 메서드를 사용하면, 실제 요청 대신 임의의(더미) 응답을 반환하도록 HTTP 클라이언트의 동작을 변경할 수 있습니다.

<a name="faking-responses"></a>
### 응답을 가짜로 만들기

예를 들어, 모든 요청에 대해 내용이 비어 있고, 상태 코드가 `200`인 응답을 반환하도록 하려면 `fake` 메서드를 별도의 인수 없이 호출하면 됩니다.

```php
use Illuminate\Support\Facades\Http;

Http::fake();

$response = Http::post(/* ... */);
```

<a name="faking-specific-urls"></a>
#### 특정 URL에 대해 가짜 응답 만들기

또는, `fake` 메서드에 배열을 전달할 수도 있습니다. 배열의 키에는 가짜 응답을 지정할 URL 패턴을, 값에는 반환할 응답을 지정하세요. `*` 문자는 와일드카드로 사용될 수 있습니다. 지정하지 않은(미가짜화) URL로의 요청은 실제로 실행됩니다. 각 엔드포인트에 대해 `Http` 파사드의 `response` 메서드를 활용해 가짜 응답을 만들 수 있습니다.

```php
Http::fake([
    // GitHub 엔드포인트를 위한 JSON 응답 더미...
    'github.com/*' => Http::response(['foo' => 'bar'], 200, $headers),

    // Google 엔드포인트를 위한 문자열 응답 더미...
    'google.com/*' => Http::response('Hello World', 200, $headers),
]);
```

미가짜화된 모든 URL에도 가짜 응답을 적용하는 기본값 패턴을 지정하고 싶다면, `*`만 전달하면 됩니다.

```php
Http::fake([
    // GitHub 엔드포인트를 위한 JSON 응답 더미...
    'github.com/*' => Http::response(['foo' => 'bar'], 200, ['Headers']),

    // 다른 모든 엔드포인트에 대한 문자열 응답 더미...
    '*' => Http::response('Hello World', 200, ['Headers']),
]);
```

간편하게 문자열, JSON, 빈 응답을 만들 때에는 응답값에 문자열, 배열, 정수(상태 코드)만 전달해도 됩니다.

```php
Http::fake([
    'google.com/*' => 'Hello World',
    'github.com/*' => ['foo' => 'bar'],
    'chatgpt.com/*' => 200,
]);
```

<a name="faking-connection-exceptions"></a>
#### 예외를 가짜로 만들기

HTTP 클라이언트가 요청을 시도하다가 `Illuminate\Http\Client\ConnectionException`을 만났을 때 애플리케이션의 동작을 테스트하고 싶을 때가 있습니다. 이런 경우, `failedConnection` 메서드를 사용하면 HTTP 클라이언트가 연결 예외를 던지도록 할 수 있습니다.

```php
Http::fake([
    'github.com/*' => Http::failedConnection(),
]);
```

만약 `Illuminate\Http\Client\RequestException`이 발생하는 상황을 테스트하고 싶다면 `failedRequest` 메서드를 사용하면 됩니다.

```php
Http::fake([
    'github.com/*' => Http::failedRequest(['code' => 'not_found'], 404),
]);
```

<a name="faking-response-sequences"></a>
#### 연속된 응답을 순서대로 가짜로 만들기

때로는 하나의 URL에 대해 여러 개의 가짜 응답을 순서대로 반환하도록 지정해야 할 수 있습니다. 이 경우 `Http::sequence` 메서드를 사용해 응답 시퀀스를 만들 수 있습니다.

```php
Http::fake([
    // GitHub 엔드포인트에 대한 연속된 가짜 응답들...
    'github.com/*' => Http::sequence()
        ->push('Hello World', 200)
        ->push(['foo' => 'bar'], 200)
        ->pushStatus(404),
]);
```

시퀀스에 포함된 모든 응답이 소진되면, 이후 요청은 예외를 발생시킵니다. 시퀀스가 비었을 때 반환할 기본 응답을 지정하고 싶다면 `whenEmpty` 메서드를 사용할 수 있습니다.

```php
Http::fake([
    // GitHub 엔드포인트에 대한 연속된 가짜 응답들...
    'github.com/*' => Http::sequence()
        ->push('Hello World', 200)
        ->push(['foo' => 'bar'], 200)
        ->whenEmpty(Http::response()),
]);
```

특정 URL 패턴에 관계없이 간단히 연속된 가짜 응답 시퀀스를 지정하고 싶다면 `Http::fakeSequence`를 사용할 수 있습니다.

```php
Http::fakeSequence()
    ->push('Hello World', 200)
    ->whenEmpty(Http::response());
```

<a name="fake-callback"></a>
#### 가짜 콜백

특정 엔드포인트마다 반환할 응답을 더 복잡한 로직으로 동적으로 판단해야 한다면, `fake` 메서드에 클로저를 전달하세요. 이 클로저는 `Illuminate\Http\Client\Request` 인스턴스를 받아서 응답 인스턴스를 반환해야 합니다. 클로저 내에서 어떤 응답을 반환할지 자유롭게 로직을 작성할 수 있습니다.

```php
use Illuminate\Http\Client\Request;

Http::fake(function (Request $request) {
    return Http::response('Hello World', 200);
});
```

<a name="preventing-stray-requests"></a>
### 예기치 않은 실제 요청 방지하기

테스트 코드 전체 또는 개별 테스트 내에서 HTTP 클라이언트로 보내는 모든 요청이 반드시 가짜 응답을 사용했는지 보장하려면 `preventStrayRequests` 메서드를 사용할 수 있습니다. 이 메서드가 호출된 이후로, 가짜 응답이 지정되지 않은 요청은 실제로 전송되지 않고 예외를 발생시킵니다.

```php
use Illuminate\Support\Facades\Http;

Http::preventStrayRequests();

Http::fake([
    'github.com/*' => Http::response('ok'),
]);

// "ok" 응답이 반환됩니다...
Http::get('https://github.com/laravel/framework');

// 예외가 발생합니다...
Http::get('https://laravel.com');
```

<a name="inspecting-requests"></a>
### 요청 검사하기

가짜 응답을 사용하는 동안에도, 애플리케이션이 정상적으로 데이터나 헤더를 보내고 있는지 확인하고 싶을 수 있습니다. 이때 `Http::fake` 이후 `Http::assertSent`를 호출하여 요청을 검사할 수 있습니다.

`assertSent` 메서드는 클로저를 인수로 받으며, 이 클로저에는 `Illuminate\Http\Client\Request` 인스턴스가 전달됩니다. 클로저에서는 요청이 기대와 일치하는지 판단하는 코드를 작성해 true 또는 false를 반환하면 됩니다. 하나 이상의 요청이라도 이 조건에 부합하면 테스트는 통과하게 됩니다.

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

특정 요청이 전송되지 않았는지 검증하고 싶다면, `assertNotSent` 메서드를 사용할 수 있습니다.

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

테스트 동안 "전송"된 요청의 개수를 검증할 때는 `assertSentCount` 메서드를 사용할 수 있습니다.

```php
Http::fake();

Http::assertSentCount(5);
```

또한, 테스트 중에 아무 요청도 전송되지 않았는지 검증하려면 `assertNothingSent`를 사용할 수 있습니다.

```php
Http::fake();

Http::assertNothingSent();
```

<a name="recording-requests-and-responses"></a>
#### 요청 / 응답 기록하기

`recorded` 메서드를 활용하면 모든 요청과 해당하는 응답을 한 번에 모아 확인할 수 있습니다. 이 메서드는 `Illuminate\Http\Client\Request` 및 `Illuminate\Http\Client\Response` 인스턴스가 들어 있는 배열들의 컬렉션을 반환합니다.

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

또한, `recorded` 메서드에 클로저를 전달하여 요청/응답 쌍 중에서 원하는 조건에 맞는 것만 필터링할 수도 있습니다. 이 클로저는 각각 `Illuminate\Http\Client\Request`와 `Illuminate\Http\Client\Response` 인스턴스를 전달받습니다.

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
## 이벤트 (Events)

라라벨은 HTTP 요청을 전송하는 과정에서 세 가지 이벤트를 발생시킵니다. 요청을 실제로 보내기 전에 `RequestSending` 이벤트가 발생하며, 요청에 대한 응답을 받은 뒤에는 `ResponseReceived` 이벤트가 발생합니다. 만약 요청에 대해 응답을 받지 못했다면 `ConnectionFailed` 이벤트가 발생합니다.

`RequestSending` 및 `ConnectionFailed` 이벤트에는 모두 `Illuminate\Http\Client\Request` 인스턴스를 담고 있는 public `$request` 속성이 포함되어 있습니다. 마찬가지로, `ResponseReceived` 이벤트에는 `$request` 속성뿐만 아니라 `Illuminate\Http\Client\Response` 인스턴스를 담고 있는 `$response` 속성도 있습니다. 이러한 이벤트들에 대해 [이벤트 리스너](/docs/12.x/events)를 애플리케이션 내에서 만들 수 있습니다.

```php
use Illuminate\Http\Client\Events\RequestSending;

class LogRequest
{
    /**
     * 이벤트를 처리합니다.
     */
    public function handle(RequestSending $event): void
    {
        // $event->request ...
    }
}
```