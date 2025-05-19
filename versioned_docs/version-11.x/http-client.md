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
- [동시(Concurrent) 요청](#concurrent-requests)
- [매크로](#macros)
- [테스트](#testing)
    - [응답 가짜 처리](#faking-responses)
    - [요청 검증](#inspecting-requests)
    - [불필요한 외부 요청 방지](#preventing-stray-requests)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

라라벨은 [Guzzle HTTP 클라이언트](http://docs.guzzlephp.org/en/stable/)를 감싸는 간결하고 직관적인 API를 제공합니다. 이를 통해 다른 웹 애플리케이션과 통신하기 위한 HTTP 요청을 쉽게 보낼 수 있습니다. 라라벨의 Guzzle 래퍼는 가장 일반적인 사용 사례에 집중되어 있으며, 쾌적한 개발자 경험을 제공합니다.

<a name="making-requests"></a>
## 요청 보내기

요청을 보내기 위해서는 `Http` 파사드에서 제공하는 `head`, `get`, `post`, `put`, `patch`, `delete` 메서드를 사용할 수 있습니다. 먼저, 다른 URL로 기본적인 `GET` 요청을 보내는 방법을 살펴보겠습니다.

```
use Illuminate\Support\Facades\Http;

$response = Http::get('http://example.com');
```

`get` 메서드는 `Illuminate\Http\Client\Response` 인스턴스를 반환하며, 이를 통해 다양한 방식으로 응답을 확인할 수 있습니다.

```
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

`Illuminate\Http\Client\Response` 객체는 PHP의 `ArrayAccess` 인터페이스도 구현하고 있으므로, 아래와 같이 JSON 형식의 응답 데이터를 배열처럼 바로 접근할 수 있습니다.

```
return Http::get('http://example.com/users/1')['name'];
```

위에 소개된 응답 관련 메서드들 외에도, 응답이 특정 HTTP 상태코드를 가지는지 확인할 때 사용할 수 있는 메서드는 다음과 같습니다.

```
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

라라벨 HTTP 클라이언트는 [URI 템플릿 명세](https://www.rfc-editor.org/rfc/rfc6570)를 이용하여 요청 URL을 동적으로 구성할 수 있습니다. `withUrlParameters` 메서드를 사용하면 URI 템플릿에서 확장할 수 있는 URL 파라미터들을 지정할 수 있습니다.

```php
Http::withUrlParameters([
    'endpoint' => 'https://laravel.com',
    'page' => 'docs',
    'version' => '11.x',
    'topic' => 'validation',
])->get('{+endpoint}/{page}/{version}/{topic}');
```

<a name="dumping-requests"></a>
#### 요청 정보 출력

보내기 전에 요청 인스턴스를 확인하고, 코드 실행을 즉시 종료하고 싶을 때는, 요청 정의의 앞부분에 `dd` 메서드를 추가하면 됩니다.

```
return Http::dd()->get('http://example.com');
```

<a name="request-data"></a>
### 요청 데이터

일반적으로 `POST`, `PUT`, `PATCH` 요청을 보낼 때는 추가 데이터를 함께 전송하게 됩니다. 이 메서드들은 두 번째 인자로 배열 형태의 데이터를 받을 수 있습니다. 기본적으로 이 데이터는 `application/json` Content-Type으로 전송됩니다.

```
use Illuminate\Support\Facades\Http;

$response = Http::post('http://example.com/users', [
    'name' => 'Steve',
    'role' => 'Network Administrator',
]);
```

<a name="get-request-query-parameters"></a>
#### GET 요청 쿼리 파라미터

`GET` 요청 시에는 쿼리 스트링을 URL에 바로 붙이거나, `get` 메서드의 두 번째 인자로 키/값 쌍의 배열을 전달할 수 있습니다.

```
$response = Http::get('http://example.com/users', [
    'name' => 'Taylor',
    'page' => 1,
]);
```

또한, `withQueryParameters` 메서드를 활용할 수도 있습니다.

```
Http::retry(3, 100)->withQueryParameters([
    'name' => 'Taylor',
    'page' => 1,
])->get('http://example.com/users')
```

<a name="sending-form-url-encoded-requests"></a>
#### Form URL Encoded 요청 보내기

`application/x-www-form-urlencoded` Content-Type을 사용하여 데이터를 전송하고 싶다면, 요청 전에 `asForm` 메서드를 호출하십시오.

```
$response = Http::asForm()->post('http://example.com/users', [
    'name' => 'Sara',
    'role' => 'Privacy Consultant',
]);
```

<a name="sending-a-raw-request-body"></a>
#### Raw 요청 본문(body) 전송

요청 시에 raw 데이터를 직접 본문으로 보낼 경우에는 `withBody` 메서드를 사용할 수 있습니다. Content-Type은 두 번째 인자로 지정할 수 있습니다.

```
$response = Http::withBody(
    base64_encode($photo), 'image/jpeg'
)->post('http://example.com/photo');
```

<a name="multi-part-requests"></a>
#### 멀티파트(Multi-Part) 요청

파일을 멀티파트 형식으로 전송하려면, 요청 전에 `attach` 메서드를 호출해야 합니다. 이 메서드는 파일 이름과 파일의 내용을 인자로 받으며, 필요하다면 세 번째 인자로 파일 이름을, 네 번째 인자로 파일과 관련된 헤더를 지정할 수 있습니다.

```
$response = Http::attach(
    'attachment', file_get_contents('photo.jpg'), 'photo.jpg', ['Content-Type' => 'image/jpeg']
)->post('http://example.com/attachments');
```

파일의 raw 내용 대신 스트림 리소스를 전달할 수도 있습니다.

```
$photo = fopen('photo.jpg', 'r');

$response = Http::attach(
    'attachment', $photo, 'photo.jpg'
)->post('http://example.com/attachments');
```

<a name="headers"></a>
### 헤더

`withHeaders` 메서드를 사용하면 요청에 헤더를 추가할 수 있습니다. 이 메서드는 키/값 쌍의 배열을 받습니다.

```
$response = Http::withHeaders([
    'X-First' => 'foo',
    'X-Second' => 'bar'
])->post('http://example.com/users', [
    'name' => 'Taylor',
]);
```

`accept` 메서드를 사용하면, 요청에 대한 응답으로 애플리케이션이 기대하는 Content-Type을 명시할 수 있습니다.

```
$response = Http::accept('application/json')->get('http://example.com/users');
```

편의를 위해, 응답에서 `application/json` Content-Type을 기대할 경우에는 `acceptJson` 메서드를 사용할 수 있습니다.

```
$response = Http::acceptJson()->get('http://example.com/users');
```

`withHeaders` 메서드는 새 헤더를 기존 요청 헤더에 병합합니다. 모든 헤더를 완전히 교체하고 싶을 때는 `replaceHeaders` 메서드를 사용하면 됩니다.

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

기본 인증과 다이제스트 인증 정보를 각각 `withBasicAuth`, `withDigestAuth` 메서드를 통해 지정할 수 있습니다.

```
// 기본 인증...
$response = Http::withBasicAuth('taylor@laravel.com', 'secret')->post(/* ... */);

// 다이제스트 인증...
$response = Http::withDigestAuth('taylor@laravel.com', 'secret')->post(/* ... */);
```

<a name="bearer-tokens"></a>
#### Bearer 토큰

요청의 `Authorization` 헤더에 bearer 토큰을 간단하게 추가하고 싶을 때는, `withToken` 메서드를 이용할 수 있습니다.

```
$response = Http::withToken('token')->post(/* ... */);
```

<a name="timeout"></a>
### 타임아웃

`timeout` 메서드는 응답을 기다리는 동안 허용할 최대 초(sec) 단위를 지정합니다. 기본적으로 HTTP 클라이언트는 30초 후 타임아웃 처리합니다.

```
$response = Http::timeout(3)->get(/* ... */);
```

지정한 타임아웃보다 오래 걸리면, `Illuminate\Http\Client\ConnectionException` 예외가 발생합니다.

서버에 연결되는 동안 대기할 최대 초 단위를 지정하고 싶을 때는 `connectTimeout` 메서드를 사용할 수 있습니다.

```
$response = Http::connectTimeout(3)->get(/* ... */);
```

<a name="retries"></a>
### 재시도

클라이언트 또는 서버 에러가 발생할 경우, HTTP 클라이언트가 자동으로 요청을 다시 시도하도록 하려면 `retry` 메서드를 사용하십시오. `retry` 메서드는 최대 요청 시도 횟수와, 각 시도 사이에 대기할 밀리초(ms) 단위를 인자로 받습니다.

```
$response = Http::retry(3, 100)->post(/* ... */);
```

매 시도마다 대기할 밀리초(ms) 수를 직접 계산하고 싶을 때는, 두 번째 인자로 클로저를 전달할 수 있습니다.

```
use Exception;

$response = Http::retry(3, function (int $attempt, Exception $exception) {
    return $attempt * 100;
})->post(/* ... */);
```

또한, 첫 번째 인자로 배열을 전달해 각 재시도 사이 대기시간을 설정할 수도 있습니다.

```
$response = Http::retry([100, 200])->post(/* ... */);
```

필요하다면 세 번째 인자로 호출 가능한(callback) 값을 전달할 수 있습니다. 이 값은 실제로 재시도를 시도해야 하는지 여부를 결정합니다. 예를 들어, 최초 요청이 `ConnectionException`을 만났을 때만 재시도하도록 할 수 있습니다.

```
use Exception;
use Illuminate\Http\Client\PendingRequest;

$response = Http::retry(3, 100, function (Exception $exception, PendingRequest $request) {
    return $exception instanceof ConnectionException;
})->post(/* ... */);
```

요청 시도가 실패했을 때, 다음 시도 전에 요청을 변경하고 싶을 때는, `retry` 메서드에 전달한 콜러블에서 요청 객체를 수정하면 됩니다. 예를 들어, 첫 번째 시도에서 인증 에러가 반환된다면 새로운 인증 토큰을 사용해 재시도할 수 있습니다.

```
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

모든 요청이 실패한 경우에는 `Illuminate\Http\Client\RequestException` 예외가 발생합니다. 이 동작을 비활성화하려면 `throw` 인자에 `false` 값을 전달하면 됩니다. 이때는 모든 재시도 후 마지막으로 받은 응답이 반환됩니다.

```
$response = Http::retry(3, 100, throw: false)->post(/* ... */);
```

> [!WARNING]  
> 모든 요청이 연결 문제로 인해 실패한 경우, `throw` 인자 값이 `false`라도 `Illuminate\Http\Client\ConnectionException` 예외는 여전히 발생합니다.

<a name="error-handling"></a>
### 에러 처리

Guzzle의 기본 동작과 달리, 라라벨의 HTTP 클라이언트 래퍼는 클라이언트 또는 서버 에러(`400` 또는 `500` 레벨 응답)가 발생해도 예외를 자동으로 발생시키지 않습니다. 대신, 이러한 에러가 반환되었는지 확인하려면 `successful`, `clientError`, `serverError` 메서드를 사용할 수 있습니다.

```
// 상태 코드가 200 이상 300 미만인지 확인...
$response->successful();

// 상태 코드가 400 이상인지 확인...
$response->failed();

// 응답이 400 레벨 상태 코드인지 확인...
$response->clientError();

// 응답이 500 레벨 상태 코드인지 확인...
$response->serverError();

// 클라이언트 또는 서버 에러 발생 시, 즉시 지정 콜백 실행...
$response->onError(callable $callback);
```

<a name="throwing-exceptions"></a>
#### 예외 발생

응답 인스턴스를 가지고 있고, 상태 코드가 클라이언트 또는 서버 에러를 의미할 때 `Illuminate\Http\Client\RequestException` 예외를 발생시키고 싶다면, `throw` 또는 `throwIf` 메서드를 사용할 수 있습니다.

```
use Illuminate\Http\Client\Response;

$response = Http::post(/* ... */);

// 클라이언트 또는 서버 에러 발생 시 예외 발생...
$response->throw();

// 에러 발생 & 지정 조건이 참일 때 예외 발생...
$response->throwIf($condition);

// 에러 발생 & 지정 클로저가 true를 반환할 때 예외 발생...
$response->throwIf(fn (Response $response) => true);

// 에러 발생 & 지정 조건이 거짓일 때 예외 발생...
$response->throwUnless($condition);

// 에러 발생 & 지정 클로저가 false를 반환할 때 예외 발생...
$response->throwUnless(fn (Response $response) => false);

// 응답이 특정 상태 코드일 때 예외 발생...
$response->throwIfStatus(403);

// 응답이 특정 상태 코드가 아닐 때 예외 발생...
$response->throwUnlessStatus(200);

return $response['user']['id'];
```

`Illuminate\Http\Client\RequestException` 인스턴스에는 반환된 응답을 확인할 수 있도록 public `$response` 프로퍼티가 있습니다.

`throw` 메서드는 에러가 없으면 응답 인스턴스를 그대로 반환하므로, 이어서 다른 메서드를 체이닝(연결)할 수 있습니다.

```
return Http::post(/* ... */)->throw()->json();
```

예외가 발생하기 전 추가 로직을 수행하고 싶다면, `throw` 메서드에 클로저를 전달할 수 있습니다. 이 클로저가 실행된 후 예외는 자동으로 던져지므로, 클로저 안에서 예외를 다시 던질 필요는 없습니다.

```
use Illuminate\Http\Client\Response;
use Illuminate\Http\Client\RequestException;

return Http::post(/* ... */)->throw(function (Response $response, RequestException $e) {
    // ...
})->json();
```

기본적으로 `RequestException` 메시지는 120자까지만 기록되거나 보고됩니다. 이 동작을 커스터마이즈하거나 비활성화하고자 할 때는, 애플리케이션의 `bootstrap/app.php` 파일에서 `truncateRequestExceptionsAt` 과 `dontTruncateRequestExceptions` 메서드를 사용할 수 있습니다.

```
->withExceptions(function (Exceptions $exceptions) {
    // 요청 예외 메시지를 240자까지로 자르기...
    $exceptions->truncateRequestExceptionsAt(240);

    // 요청 예외 메시지 자르기 비활성화...
    $exceptions->dontTruncateRequestExceptions();
})
```

<a name="guzzle-middleware"></a>
### Guzzle 미들웨어

라라벨의 HTTP 클라이언트는 Guzzle을 기반으로 하므로, [Guzzle 미들웨어](https://docs.guzzlephp.org/en/stable/handlers-and-middleware.html)를 통해 나가는 요청을 조작하거나 들어오는 응답을 검사할 수 있습니다. 나가는 요청을 수정하려면, `withRequestMiddleware` 메서드를 사용해 Guzzle 미들웨어를 등록하십시오.

```
use Illuminate\Support\Facades\Http;
use Psr\Http\Message\RequestInterface;

$response = Http::withRequestMiddleware(
    function (RequestInterface $request) {
        return $request->withHeader('X-Example', 'Value');
    }
)->get('http://example.com');
```

마찬가지로, 받는 HTTP 응답을 검사하려면 `withResponseMiddleware` 메서드에 미들웨어를 등록할 수 있습니다.

```
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

모든 나가는 요청과 들어오는 응답에 대해 한 번에 적용되는 미들웨어를 등록하고 싶을 때는 `globalRequestMiddleware` 와 `globalResponseMiddleware` 메서드를 사용할 수 있습니다. 일반적으로 이러한 메서드는 애플리케이션의 `AppServiceProvider` 의 `boot` 메서드에서 호출해야 합니다.

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

나가는 요청에 대해 [추가 Guzzle 요청 옵션](http://docs.guzzlephp.org/en/stable/request-options.html) 을 지정하려면, `withOptions` 메서드를 사용할 수 있습니다. 이 메서드는 키/값 쌍의 배열을 인자로 받습니다.

```
$response = Http::withOptions([
    'debug' => true,
])->get('http://example.com/users');
```

<a name="global-options"></a>
#### 전역 옵션

모든 나가는 요청의 기본 옵션을 설정하려면, `globalOptions` 메서드를 활용하세요. 이 메서드는 일반적으로 애플리케이션의 `AppServiceProvider` 의 `boot` 메서드에서 호출해야 합니다.

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
## 동시(Concurrent) 요청

여러 HTTP 요청을 동시에 보내고 싶을 때가 있습니다. 즉, 여러 요청을 순차적으로 보내는 것이 아니라, 여러 요청을 한 번에 발송해 처리 속도를 크게 높이고자 할 때 사용할 수 있습니다. 천천히 동작하는 HTTP API를 사용할 때 성능이 크게 개선될 수 있습니다.

이럴 때는 `pool` 메서드를 사용하면 됩니다. `pool` 메서드에는 `Illuminate\Http\Client\Pool` 인스턴스를 인자로 받는 클로저를 전달하여, 한 번에 여러 요청을 손쉽게 풀에 추가하고 발송할 수 있습니다.

```
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

보시다시피 각 응답 인스턴스는 풀에 추가된 순서대로 배열 인덱스로 접근할 수 있습니다. 필요하다면 `as` 메서드를 사용해 각 요청을 이름으로 지정할 수 있고, 응답도 해당 이름으로 접근할 수 있습니다.

```
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

`pool` 메서드는 `withHeaders`나 `middleware`와 같은 다른 HTTP 클라이언트 메서드와 체이닝할 수 없습니다. 만약 풀에 추가하는 각 요청에 커스텀 헤더나 미들웨어를 적용하고 싶다면, 각 풀 요청에서 해당 옵션을 직접 지정해야 합니다.

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

라라벨 HTTP 클라이언트는 "매크로" 기능을 제공합니다. 매크로를 통해 애플리케이션 전역에서 서비스별 공통 경로나 헤더를 간결하게 구성할 수 있으며, 직관적이고 유창한 방식으로 재사용할 수 있습니다. 먼저, 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 매크로를 정의하세요.

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

매크로를 정의한 뒤에는, 애플리케이션 어디에서나 지정한 설정으로 미리 구성된 요청을 만들 수 있습니다.

```php
$response = Http::github()->get('/');
```

<a name="testing"></a>

## 테스트

라라벨의 다양한 서비스는 테스트 작성이 쉽고 직관적으로 이뤄질 수 있도록 다양한 기능을 제공합니다. 라라벨의 HTTP 클라이언트 역시 예외가 아닙니다. `Http` 파사드의 `fake` 메서드를 사용하면 요청이 발생할 때 더미(Stub) 또는 가짜(Dummy) 응답을 반환하도록 HTTP 클라이언트를 설정할 수 있습니다.

<a name="faking-responses"></a>
### 응답 가짜 처리하기

예를 들어, 모든 요청에 대해 비어 있는, 상태 코드가 `200`인 응답을 반환하도록 HTTP 클라이언트를 설정하려면 `fake` 메서드를 인수 없이 호출하면 됩니다.

```
use Illuminate\Support\Facades\Http;

Http::fake();

$response = Http::post(/* ... */);
```

<a name="faking-specific-urls"></a>
#### 특정 URL의 응답 가짜 처리

또는, `fake` 메서드에 배열을 전달할 수도 있습니다. 이 배열의 키는 가짜 응답을 설정하고 싶은 URL 패턴을 나타내며, 값은 응답 객체입니다. `*` 문자는 와일드카드로 사용할 수 있습니다. 가짜 응답이 설정되지 않은 URL에 대한 요청은 실제로 전송됩니다. 이러한 엔드포인트에 대해 가짜 응답을 만들려면 `Http` 파사드의 `response` 메서드를 사용할 수 있습니다.

```
Http::fake([
    // GitHub 엔드포인트에 대한 JSON 응답 가짜 처리...
    'github.com/*' => Http::response(['foo' => 'bar'], 200, $headers),

    // Google 엔드포인트에 대한 문자열 응답 가짜 처리...
    'google.com/*' => Http::response('Hello World', 200, $headers),
]);
```

모든 일치하지 않는 URL에도 가짜 응답을 적용하는 기본 패턴을 지정하고 싶다면, `*` 하나만 사용하면 됩니다.

```
Http::fake([
    // GitHub 엔드포인트에 대한 JSON 응답 가짜 처리...
    'github.com/*' => Http::response(['foo' => 'bar'], 200, ['Headers']),

    // 나머지 모든 엔드포인트는 동일한 문자열 응답으로 처리...
    '*' => Http::response('Hello World', 200, ['Headers']),
]);
```

편의상, 문자열, JSON, 빈 응답 등은 문자열, 배열, 정수를 응답값으로 제공해서도 생성할 수 있습니다.

```
Http::fake([
    'google.com/*' => 'Hello World',
    'github.com/*' => ['foo' => 'bar'],
    'chatgpt.com/*' => 200,
]);
```

<a name="faking-connection-exceptions"></a>
#### 연결 예외 가짜 처리

가끔 애플리케이션이 요청을 시도할 때 `Illuminate\Http\Client\ConnectionException`이 발생하는 경우를 테스트해야 할 수도 있습니다. 이때 `failedConnection` 메서드를 사용하여 HTTP 클라이언트가 연결 예외를 발생시키도록 설정할 수 있습니다.

```
Http::fake([
    'github.com/*' => Http::failedConnection(),
]);
```

<a name="faking-response-sequences"></a>
#### 응답 시퀀스 가짜 처리

특정 URL이 여러 개의 가짜 응답을 순서대로 반환해야 하는 경우가 있습니다. 이럴 때 `Http::sequence` 메서드를 사용해 응답 시퀀스를 만들 수 있습니다.

```
Http::fake([
    // GitHub 엔드포인트에 대한 일련의 응답 가짜 처리...
    'github.com/*' => Http::sequence()
        ->push('Hello World', 200)
        ->push(['foo' => 'bar'], 200)
        ->pushStatus(404),
]);
```

시퀀스에 포함된 모든 응답이 소진된 이후에 추가적인 요청이 오면 예외가 발생합니다. 만약 시퀀스가 비었을 때 반환할 기본 응답을 지정하고 싶다면 `whenEmpty` 메서드를 사용합니다.

```
Http::fake([
    // GitHub 엔드포인트에 대한 일련의 응답 가짜 처리...
    'github.com/*' => Http::sequence()
        ->push('Hello World', 200)
        ->push(['foo' => 'bar'], 200)
        ->whenEmpty(Http::response()),
]);
```

특정 URL 패턴을 지정하지 않고도 응답 시퀀스를 가짜 처리하고 싶다면 `Http::fakeSequence` 메서드를 사용할 수 있습니다.

```
Http::fakeSequence()
    ->push('Hello World', 200)
    ->whenEmpty(Http::response());
```

<a name="fake-callback"></a>
#### 가짜 응답 콜백

특정 엔드포인트에 대해 반환할 응답을 결정하는 더 복잡한 로직이 필요하다면, `fake` 메서드에 클로저(익명함수)를 전달할 수 있습니다. 이 클로저는 `Illuminate\Http\Client\Request` 인스턴스를 전달받으며, 응답 인스턴스를 반환해야 합니다. 클로저 내부에서 원하는 모든 판단 로직을 수행할 수 있습니다.

```
use Illuminate\Http\Client\Request;

Http::fake(function (Request $request) {
    return Http::response('Hello World', 200);
});
```

<a name="preventing-stray-requests"></a>
### 예기치 않은(가짜 처리되지 않은) 요청 차단

테스트 단위나 전체 테스트 스위트에서, HTTP 클라이언트로 전송하는 모든 요청이 반드시 가짜 처리되었는지 보장하고 싶다면 `preventStrayRequests` 메서드를 호출할 수 있습니다. 이 메서드 호출 이후, 가짜 응답이 설정되지 않은 요청이 발생하면 실제 요청을 보내는 대신 예외가 발생합니다.

```
use Illuminate\Support\Facades\Http;

Http::preventStrayRequests();

Http::fake([
    'github.com/*' => Http::response('ok'),
]);

// "ok" 응답이 반환됩니다.
Http::get('https://github.com/laravel/framework');

// 예외가 발생합니다.
Http::get('https://laravel.com');
```

<a name="inspecting-requests"></a>
### 요청 검사

가짜 응답을 설정할 때, 실제로 애플리케이션이 올바른 데이터나 헤더 등을 포함하여 요청하는지 검사하고 싶을 수 있습니다. 이럴 때는 `Http::fake` 이후에 `Http::assertSent` 메서드를 호출하면 됩니다.

`assertSent` 메서드는 클로저를 인수로 받으며, 클로저에는 `Illuminate\Http\Client\Request` 인스턴스가 전달됩니다. 그리고 클로저는 요청이 기대에 부합하는지 여부를 나타내는 불리언을 반환해야 합니다. 테스트가 통과하려면 하나 이상의 요청이 해당 조건을 만족해야 합니다.

```
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

필요하다면 `assertNotSent` 메서드를 사용해서 특정 요청이 전송되지 않았음을 검증할 수도 있습니다.

```
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

`assertSentCount` 메서드를 사용하면 테스트 중 "전송된" 요청의 개수를 검증할 수 있습니다.

```
Http::fake();

Http::assertSentCount(5);
```

또는, 테스트 중 요청이 전혀 전송되지 않았음을 확인하려면 `assertNothingSent` 메서드를 사용할 수 있습니다.

```
Http::fake();

Http::assertNothingSent();
```

<a name="recording-requests-and-responses"></a>
#### 요청/응답 기록

`recorded` 메서드를 사용하면 모든 요청과 그에 대응하는 응답을 모아볼 수 있습니다. `recorded` 메서드는 `Illuminate\Http\Client\Request`와 `Illuminate\Http\Client\Response` 인스턴스로 구성된 배열 컬렉션을 반환합니다.

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

또한, `recorded` 메서드에 클로저를 전달하면, `Illuminate\Http\Client\Request`와 `Illuminate\Http\Client\Response` 인스턴스를 인수로 받아서 원하는 조건으로 요청/응답 쌍을 필터링할 수 있습니다.

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

라라벨은 HTTP 요청을 전송하는 과정에서 세 가지 이벤트를 발생시킵니다. 요청을 전송하기 전에 `RequestSending` 이벤트가 발생하고, 요청에 대한 응답을 수신한 후에는 `ResponseReceived` 이벤트가 발생합니다. 주어진 요청에 응답이 없는 경우에는 `ConnectionFailed` 이벤트가 발생합니다.

`RequestSending` 및 `ConnectionFailed` 이벤트는 모두 `Illuminate\Http\Client\Request` 인스턴스를 검사할 수 있는 공용 `$request` 속성을 포함하고 있습니다. 마찬가지로, `ResponseReceived` 이벤트는 `$request` 속성과 함께 `Illuminate\Http\Client\Response` 인스턴스를 검사할 수 있는 `$response` 속성을 포함합니다. 여러분의 애플리케이션 내에서 이 이벤트들에 [이벤트 리스너](/docs/11.x/events)를 등록하여 활용할 수 있습니다.

```
use Illuminate\Http\Client\Events\RequestSending;

class LogRequest
{
    /**
     * 받은 이벤트 처리
     */
    public function handle(RequestSending $event): void
    {
        // $event->request ...
    }
}
```