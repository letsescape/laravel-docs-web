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
    - [응답 가짜로 만들기](#faking-responses)
    - [요청 검사](#inspecting-requests)
    - [의도하지 않은 실제 요청 방지](#preventing-stray-requests)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

라라벨은 [Guzzle HTTP 클라이언트](http://docs.guzzlephp.org/en/stable/)를 감싸서, 간단하고 직관적인 API를 제공합니다. 이를 통해 다른 웹 애플리케이션과 신속하게 HTTP 요청을 주고받을 수 있습니다. 라라벨의 Guzzle 래퍼는 가장 자주 사용되는 사례에 초점을 맞췄으며, 개발자 경험을 극대화했습니다.

시작하기 전에, 애플리케이션의 의존성으로 Guzzle 패키지를 설치했는지 확인해야 합니다. 기본적으로 라라벨에서는 이 의존성을 자동으로 포함합니다. 만약 Guzzle 패키지를 삭제했다면, 아래 Composer 명령어로 다시 설치할 수 있습니다:

```shell
composer require guzzlehttp/guzzle
```

<a name="making-requests"></a>
## 요청 보내기

`Http` 파사드가 제공하는 `head`, `get`, `post`, `put`, `patch`, `delete` 메서드를 통해 HTTP 요청을 보낼 수 있습니다. 먼저, 다른 URL로 기본적인 `GET` 요청을 보내는 방법을 살펴보겠습니다:

```
use Illuminate\Support\Facades\Http;

$response = Http::get('http://example.com');
```

`get` 메서드는 `Illuminate\Http\Client\Response` 인스턴스를 반환합니다. 이 객체는 다양한 메서드를 제공하여 응답을 쉽게 확인할 수 있도록 돕습니다:

```
$response->body() : string;
$response->json($key = null, $default = null) : array|mixed;
$response->object() : object;
$response->collect($key = null) : Illuminate\Support\Collection;
$response->status() : int;
$response->successful() : bool;
$response->redirect(): bool;
$response->failed() : bool;
$response->clientError() : bool;
$response->header($header) : string;
$response->headers() : array;
```

`Illuminate\Http\Client\Response` 객체는 PHP의 `ArrayAccess` 인터페이스도 구현하고 있어서, 응답으로 반환된 JSON 데이터를 배열처럼 바로 접근할 수 있습니다:

```
return Http::get('http://example.com/users/1')['name'];
```

위의 다양한 응답 메서드 외에도, 특정 상태 코드를 반환했는지 확인할 수 있는 메서드들도 사용할 수 있습니다:

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

HTTP 클라이언트는 [URI 템플릿 명세](https://www.rfc-editor.org/rfc/rfc6570)를 활용하여 요청 URL을 동적으로 구성할 수 있도록 지원합니다. URI 템플릿에서 변수로 사용될 URL 파라미터는 `withUrlParameters` 메서드를 이용해 정의합니다:

```php
Http::withUrlParameters([
    'endpoint' => 'https://laravel.com',
    'page' => 'docs',
    'version' => '9.x',
    'topic' => 'validation',
])->get('{+endpoint}/{page}/{version}/{topic}');
```

<a name="dumping-requests"></a>
#### 요청 객체 덤프하기

요청이 실제로 전송되기 전에 해당 요청 인스턴스를 덤프하고(즉시 출력) 스크립트 실행을 중단하고 싶을 때는 `dd` 메서드를 요청 정의의 시작 부분에 추가하면 됩니다:

```
return Http::dd()->get('http://example.com');
```

<a name="request-data"></a>
### 요청 데이터

`POST`, `PUT`, `PATCH` 요청을 보내면서 추가적인 데이터 전송이 필요한 경우가 많습니다. 이러한 메서드들은 두 번째 인수로 데이터 배열을 받을 수 있습니다. 기본적으로 데이터는 `application/json` content-type으로 전송됩니다:

```
use Illuminate\Support\Facades\Http;

$response = Http::post('http://example.com/users', [
    'name' => 'Steve',
    'role' => 'Network Administrator',
]);
```

<a name="get-request-query-parameters"></a>
#### GET 요청 쿼리 파라미터

`GET` 요청을 보낼 때는, 쿼리 스트링을 URL에 직접 추가하거나, 두 번째 인수로 key / value 쌍 배열을 전달할 수 있습니다:

```
$response = Http::get('http://example.com/users', [
    'name' => 'Taylor',
    'page' => 1,
]);
```

또는, `withQueryParameters` 메서드를 사용할 수도 있습니다:

```
Http::retry(3, 100)->withQueryParameters([
    'name' => 'Taylor',
    'page' => 1,
])->get('http://example.com/users')
```

<a name="sending-form-url-encoded-requests"></a>
#### Form URL Encoded 방식으로 데이터 전송

`application/x-www-form-urlencoded` content-type으로 데이터를 전송하려면, 요청 전송 전에 `asForm` 메서드를 호출해야 합니다:

```
$response = Http::asForm()->post('http://example.com/users', [
    'name' => 'Sara',
    'role' => 'Privacy Consultant',
]);
```

<a name="sending-a-raw-request-body"></a>
#### Raw 데이터로 요청 본문 전송

요청 시, 원시(raw) 데이터 본문을 직접 지정하고 싶을 때는 `withBody` 메서드를 사용할 수 있습니다. 두 번째 인수로 content-type을 지정할 수 있습니다:

```
$response = Http::withBody(
    base64_encode($photo), 'image/jpeg'
)->post('http://example.com/photo');
```

<a name="multi-part-requests"></a>
#### 멀티파트(Multi-Part) 요청

파일을 멀티파트로 전송하려면, 요청 전에 `attach` 메서드를 사용해야 합니다. 이 메서드는 파일 이름과 파일 내용을 인수로 받으며, 필요하다면 세 번째 인수로 파일 이름, 네 번째 인수로 파일과 관련된 헤더를 추가할 수 있습니다:

```
$response = Http::attach(
    'attachment', file_get_contents('photo.jpg'), 'photo.jpg', ['Content-Type' => 'image/jpeg']
)->post('http://example.com/attachments');
```

파일의 원시 데이터를 전달하는 대신, 스트림 리소스를 사용할 수도 있습니다:

```
$photo = fopen('photo.jpg', 'r');

$response = Http::attach(
    'attachment', $photo, 'photo.jpg'
)->post('http://example.com/attachments');
```

<a name="headers"></a>
### 헤더

요청에 헤더를 추가하려면 `withHeaders` 메서드를 사용합니다. 이 메서드는 key / value 쌍 배열을 인수로 받습니다:

```
$response = Http::withHeaders([
    'X-First' => 'foo',
    'X-Second' => 'bar'
])->post('http://example.com/users', [
    'name' => 'Taylor',
]);
```

요청에 대해 응답으로 기대하는 content-type을 지정하고 싶다면 `accept` 메서드를 사용할 수 있습니다:

```
$response = Http::accept('application/json')->get('http://example.com/users');
```

자주 사용하는 경우, `acceptJson` 메서드를 사용해 `application/json` content-type을 간편하게 지정할 수 있습니다:

```
$response = Http::acceptJson()->get('http://example.com/users');
```

`withHeaders` 메서드는 새로운 헤더를 기존 요청 헤더에 병합합니다. 만약 모든 헤더를 완전히 교체하고 싶다면 `replaceHeaders` 메서드를 사용할 수 있습니다:

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

베이직 인증과 다이제스트 인증(Basic, Digest)은 각각 `withBasicAuth`, `withDigestAuth` 메서드로 지정할 수 있습니다:

```
// Basic 인증...
$response = Http::withBasicAuth('taylor@laravel.com', 'secret')->post(/* ... */);

// Digest 인증...
$response = Http::withDigestAuth('taylor@laravel.com', 'secret')->post(/* ... */);
```

<a name="bearer-tokens"></a>
#### Bearer 토큰

요청의 `Authorization` 헤더에 Bearer 토큰을 빠르게 추가하려면 `withToken` 메서드를 사용합니다:

```
$response = Http::withToken('token')->post(/* ... */);
```

<a name="timeout"></a>
### 타임아웃

응답을 기다리는 최대 초(second) 수를 지정하려면 `timeout` 메서드를 사용하면 됩니다. 기본적으로 HTTP 클라이언트는 30초 후 타임아웃됩니다:

```
$response = Http::timeout(3)->get(/* ... */);
```

지정한 타임아웃을 초과하는 경우 `Illuminate\Http\Client\ConnectionException` 예외가 발생합니다.

서버 연결 시도에 대해 별도의 최대 대기 초를 지정하고 싶다면, `connectTimeout` 메서드를 사용할 수 있습니다:

```
$response = Http::connectTimeout(3)->get(/* ... */);
```

<a name="retries"></a>
### 재시도

클라이언트 오류 또는 서버 오류가 발생하면 HTTP 클라이언트가 자동으로 요청을 재시도하도록 `retry` 메서드를 사용할 수 있습니다. 이 메서드는 요청을 최대 몇 번 재시도할지와, 각 시도 사이 대기 시간을 밀리초(ms) 단위로 받습니다:

```
$response = Http::retry(3, 100)->post(/* ... */);
```

재시도 사이 대기 밀리초를 직접 계산하고 싶다면, 두 번째 인수로 클로저를 전달하면 됩니다:

```
use Exception;

$response = Http::retry(3, function (int $attempt, Exception $exception) {
    return $attempt * 100;
})->post(/* ... */);
```

편리하게, 첫 번째 인수에 배열을 전달할 수도 있습니다. 이 배열은 각 시도 사이에 대기할 밀리초를 결정하는데 사용됩니다:

```
$response = Http::retry([100, 200])->post(/* ... */);
```

필요하다면, `retry` 메서드의 세 번째 인수로 실제로 재시도를 해야 하는지 판단하는 콜러블을 전달할 수 있습니다. 예를 들어, 처음 요청에서 `ConnectionException`만 발생할 때만 재시도하고 싶을 때 사용할 수 있습니다:

```
use Exception;
use Illuminate\Http\Client\PendingRequest;

$response = Http::retry(3, 100, function (Exception $exception, PendingRequest $request) {
    return $exception instanceof ConnectionException;
})->post(/* ... */);
```

요청이 실패할 경우, 다음 시도 전에 요청 객체를 변경하고 싶을 때도 있습니다. 예를 들어, 첫 번째 요청이 인증 오류(401)였다면 새로운 토큰을 받아서 재시도할 수도 있습니다:

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

모든 요청이 실패할 경우, `Illuminate\Http\Client\RequestException` 예외가 발생합니다. 이 동작을 비활성화하려면 `throw` 인수를 `false`로 지정하세요. 이 경우 모든 재시도 후 마지막 응답 객체가 반환됩니다:

```
$response = Http::retry(3, 100, throw: false)->post(/* ... */);
```

> [!WARNING]
> 모든 요청이 네트워크 연결 문제로 실패하면, `throw` 인수를 `false`로 설정해도 `Illuminate\Http\Client\ConnectionException` 예외는 여전히 발생합니다.

<a name="error-handling"></a>
### 에러 처리

Guzzle의 기본 동작과 달리, 라라벨 HTTP 클라이언트 래퍼는 클라이언트/서버 에러(`400`·`500` 상태) 발생 시 예외를 자동으로 던지지 않습니다. 이러한 오류가 반환됐는지 확인하려면 `successful`, `clientError`, `serverError` 등의 메서드를 사용할 수 있습니다:

```
// 상태 코드가 200 이상 300 미만인지 확인...
$response->successful();

// 상태 코드가 400 이상인지 확인...
$response->failed();

// 400번대 에러(클라이언트 에러) 여부 확인...
$response->clientError();

// 500번대 에러(서버 에러) 여부 확인...
$response->serverError();

// 클라이언트/서버 에러시 지정한 콜백을 즉시 실행...
$response->onError(callable $callback);
```

<a name="throwing-exceptions"></a>
#### 예외 강제 발생

응답 인스턴스가 있고, 상태 코드가 클라이언트 또는 서버 에러를 나타낸다면 직접 `Illuminate\Http\Client\RequestException` 예외를 던질 수 있습니다. 이때 `throw` 또는 `throwIf` 메서드를 사용할 수 있습니다:

```
use Illuminate\Http\Client\Response;

$response = Http::post(/* ... */);

// 에러가 발생하면 예외 발생...
$response->throw();

// 조건이 true일 때만 예외 발생...
$response->throwIf($condition);

// 클로저가 true를 반환하면 예외 발생...
$response->throwIf(fn (Response $response) => true);

// 조건이 false일 때 예외 발생...
$response->throwUnless($condition);

// 클로저가 false를 반환하면 예외 발생...
$response->throwUnless(fn (Response $response) => false);

// 특정 상태 코드일 때 예외 발생...
$response->throwIfStatus(403);

// 특정 상태 코드가 아닐 때 예외 발생...
$response->throwUnlessStatus(200);

return $response['user']['id'];
```

`Illuminate\Http\Client\RequestException` 인스턴스에는 공개 `$response` 속성이 있어 반환된 응답을 확인할 수 있습니다.

`throw` 메서드는 에러가 없으면 해당 응답 인스턴스를 그대로 반환하므로, 추가적인 연산을 체이닝할 수도 있습니다:

```
return Http::post(/* ... */)->throw()->json();
```

예외가 발생하기 전 추가 로직이 필요하다면, `throw` 메서드에 클로저를 전달할 수 있습니다. 이 때 예외는 클로저 실행 후 자동으로 던져지므로 내부에서 예외를 명시적으로 다시 던질 필요는 없습니다:

```
use Illuminate\Http\Client\Response;
use Illuminate\Http\Client\RequestException;

return Http::post(/* ... */)->throw(function (Response $response, RequestException $e) {
    // ...
})->json();
```

<a name="guzzle-middleware"></a>
### Guzzle 미들웨어

라라벨의 HTTP 클라이언트는 Guzzle을 기반으로 동작하므로, [Guzzle 미들웨어](https://docs.guzzlephp.org/en/stable/handlers-and-middleware.html)를 활용하여 아웃바운드 요청을 조작하거나 인바운드 응답을 검사할 수 있습니다. 아웃바운드 요청을 조작하고 싶을 경우 `withRequestMiddleware` 메서드로 미들웨어를 등록합니다:

```
use Illuminate\Support\Facades\Http;
use Psr\Http\Message\RequestInterface;

$response = Http::withRequestMiddleware(
    function (RequestInterface $request) {
        return $request->withHeader('X-Example', 'Value');
    }
)->get('http://example.com');
```

마찬가지로, 들어오는 HTTP 응답을 검사하고 싶을 때는 `withResponseMiddleware` 메서드로 미들웨어를 등록할 수 있습니다:

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
#### 글로벌 미들웨어

모든 아웃바운드 요청과 인바운드 응답에 항상 적용할 미들웨어를 등록하고 싶을 때는 `globalRequestMiddleware`, `globalResponseMiddleware` 메서드를 사용합니다. 보통 이들은 애플리케이션의 `AppServiceProvider`의 `boot` 메서드에서 호출합니다:

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

`withOptions` 메서드를 사용하면 추가 [Guzzle 요청 옵션](http://docs.guzzlephp.org/en/stable/request-options.html)을 지정할 수 있습니다. 이 메서드는 key / value 쌍 배열을 인수로 받습니다:

```
$response = Http::withOptions([
    'debug' => true,
])->get('http://example.com/users');
```

<a name="concurrent-requests"></a>
## 동시 요청

여러 HTTP 요청을 동시에 보낼 필요가 있을 때가 있습니다. 즉, 여러 요청을 순차적으로 처리하지 않고 한 번에 병렬로 전송하고자 하는 경우이며, 이는 느린 HTTP API와 상호작용할 때 큰 성능 향상으로 이어질 수 있습니다.

이러한 경우 `pool` 메서드를 사용하면 됩니다. `pool` 메서드는 클로저를 인수로 받아 `Illuminate\Http\Client\Pool` 인스턴스를 제공하고, 여기에 요청을 추가할 수 있습니다:

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

각 응답 인스턴스에 pool에 추가된 순서대로 접근할 수 있습니다. 만약 요청에 이름을 붙이고 싶다면 `as` 메서드를 사용할 수 있고, 그러면 이름으로 결과에 접근할 수 있습니다:

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

`pool` 메서드는 `withHeaders`나 `middleware` 같은 다른 HTTP 클라이언트 메서드와 체이닝이 불가능합니다. pool에 추가한 각 요청에 직접 옵션을 지정해주어야 합니다:

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

라라벨 HTTP 클라이언트를 사용하면 "매크로"를 정의할 수 있습니다. 매크로는 특정 서비스에 대해 자주 사용하는 주소, 헤더 등 공통 설정을 간결하게 묶어서 사용할 수 있게 도와줍니다. 매크로는 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 정의합니다:

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

이렇게 매크로를 구성하면, 애플리케이션 어디서든 지정한 구성을 가진 pending request를 사용할 수 있습니다:

```php
$response = Http::github()->get('/');
```

<a name="testing"></a>
## 테스트

라라벨의 여러 서비스는 테스트를 쉽게 할 수 있도록 다양한 기능을 제공합니다. HTTP 클라이언트도 예외는 아니며, `Http` 파사드의 `fake` 메서드를 이용하면 요청 시 미리 지정한 더미(dummpy) 응답을 반환하도록 가짜처리(stubbing/faking)할 수 있습니다.

<a name="faking-responses"></a>
### 응답 가짜로 만들기

예를 들어, 모든 요청에 대해 비어있는(내용 없음) 200 상태 코드 응답을 반환하도록 하려면, `fake` 메서드를 인수 없이 호출하면 됩니다:

```
use Illuminate\Support\Facades\Http;

Http::fake();

$response = Http::post(/* ... */);
```

<a name="faking-specific-urls"></a>
#### 특정 URL에 대한 가짜 응답

또는, `fake` 메서드에 배열을 전달할 수 있습니다. 이 때 배열의 키는 가짜로 만들고자 하는 URL 패턴, 값은 각 엔드포인트별로 반환할 응답 객체입니다. `*`(별표)는 와일드카드로 사용 가능합니다. 배열에 없는 URL로 요청하면 실제로 HTTP 요청이 전송됩니다. 각 엔드포인트에 대한 스텁 응답은 `Http` 파사드의 `response` 메서드로 생성합니다:

```
Http::fake([
    // GitHub 엔드포인트에 대해 JSON 응답 스텁...
    'github.com/*' => Http::response(['foo' => 'bar'], 200, $headers),

    // Google 엔드포인트에 대해 문자열 응답 스텁...
    'google.com/*' => Http::response('Hello World', 200, $headers),
]);
```

패턴에 매칭되지 않는 모든 URL을 포괄(fallback)해서 스텁 응답을 반환하고 싶다면, `*` 하나만 키로 사용하면 됩니다:

```
Http::fake([
    // GitHub 엔드포인트에 대해 JSON 응답 스텁...
    'github.com/*' => Http::response(['foo' => 'bar'], 200, ['Headers']),

    // 나머지 모든 엔드포인트에 대해 문자열 응답 스텁...
    '*' => Http::response('Hello World', 200, ['Headers']),
]);
```

<a name="faking-response-sequences"></a>
#### 응답 시퀀스 가짜로 만들기

특정 URL에 대해 여러 개의 응답을 순서대로 반환해야 할 상황도 있습니다. 이때는 `Http::sequence` 메서드로 응답 시퀀스를 구성할 수 있습니다:

```
Http::fake([
    // GitHub 엔드포인트에 대해 일련의 응답 스텁...
    'github.com/*' => Http::sequence()
                            ->push('Hello World', 200)
                            ->push(['foo' => 'bar'], 200)
                            ->pushStatus(404),
]);
```

응답 시퀀스의 모든 응답이 소진되면, 이후 요청에서는 예외가 발생합니다. 시퀀스가 모두 비었을 때 대신 반환할 기본 응답이 필요하다면, `whenEmpty` 메서드를 사용할 수 있습니다:

```
Http::fake([
    // GitHub 엔드포인트에 대해 일련의 응답 스텁...
    'github.com/*' => Http::sequence()
                            ->push('Hello World', 200)
                            ->push(['foo' => 'bar'], 200)
                            ->whenEmpty(Http::response()),
]);
```

특정 URL 패턴 없이 모든 요청에 대해 응답 시퀀스를 가짜로 만들 때는 `Http::fakeSequence` 메서드를 사용할 수 있습니다:

```
Http::fakeSequence()
        ->push('Hello World', 200)
        ->whenEmpty(Http::response());
```

<a name="fake-callback"></a>
#### 콜백을 이용한 가짜 응답

특정 엔드포인트에 대해 더 복잡한 논리로 어떤 응답을 반환할지 결정해야 할 때는, `fake` 메서드에 클로저를 전달할 수 있습니다. 이 클로저는 `Illuminate\Http\Client\Request` 인스턴스와 옵션 배열을 인수로 받으며, 반드시 응답 인스턴스를 반환해야 합니다. 이 안에서 필요한 모든 복잡한 로직을 구현할 수 있습니다:

```
use Illuminate\Http\Client\Request;

Http::fake(function (Request $request, array $options) {
    return Http::response('Hello World', 200);
});
```

<a name="preventing-stray-requests"></a>
### 의도하지 않은 실제 요청 방지

테스트 중에 HTTP 클라이언트로 전송된 모든 요청이 반드시 fake이어야 한다는 것을 보장하고 싶을 때는, `preventStrayRequests` 메서드를 호출합니다. 이후 fake되지 않은 요청이 발생하면 실제 HTTP 요청 대신 예외가 발생합니다:

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

응답을 fake하는 경우, 클라이언트가 올바른 데이터나 헤더로 요청을 전송했는지 확인하고 싶은 경우가 있습니다. 이때 `Http::assertSent` 메서드를 사용하면 됩니다. 이 메서드는 테스트 통과를 위해 적어도 1개의 요청이 기대에 부합해야 하며, 전달된 클로저에는 `Illuminate\Http\Client\Request` 인스턴스가 전달됩니다. 클로저가 `true`를 반환하면 일치하는 요청으로 간주됩니다:

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

특정 요청이 전송되지 않았음(assertNotSent)을 확인하려면 `assertNotSent` 메서드를 사용할 수 있습니다:

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

`assertSentCount` 메서드로 테스트 중 전송된 요청 수를 검증할 수 있습니다:

```
Http::fake();

Http::assertSentCount(5);
```

또는, `assertNothingSent` 메서드로 아무런 요청도 보내지 않았음을 검증할 수 있습니다:

```
Http::fake();

Http::assertNothingSent();
```

<a name="recording-requests-and-responses"></a>
#### 요청/응답 기록

`recorded` 메서드를 사용하면 모든 요청과 그에 대한 응답 목록을 조회할 수 있습니다. 이 메서드는 `Illuminate\Http\Client\Request`와 `Illuminate\Http\Client\Response` 인스턴스 쌍으로 구성된 컬렉션을 반환합니다:

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

또한, `recorded` 메서드에 클로저를 전달하여 특정 조건에 맞는 요청/응답 쌍만 필터링할 수도 있습니다:

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

라라벨은 HTTP 요청 처리 과정에서 총 3개의 이벤트를 발생시킵니다. 요청이 전송되기 직전에 `RequestSending` 이벤트가, 요청에 대해 응답이 도착한 후에는 `ResponseReceived` 이벤트가 발생합니다. 서버로부터 응답을 받지 못한 경우에는 `ConnectionFailed` 이벤트가 발생합니다.

`RequestSending`과 `ConnectionFailed` 이벤트에는 `Illuminate\Http\Client\Request` 인스턴스를 확인할 수 있는 공개 `$request` 속성이 있습니다. 마찬가지로 `ResponseReceived` 이벤트에는 `$request`와 함께, 응답 객체인 `$response` 속성도 있습니다. 이러한 이벤트에 리스너를 등록하려면, `App\Providers\EventServiceProvider`의 이벤트 매핑에 아래와 같이 추가하세요:

```
/**
 * The event listener mappings for the application.
 *
 * @var array
 */
protected $listen = [
    'Illuminate\Http\Client\Events\RequestSending' => [
        'App\Listeners\LogRequestSending',
    ],
    'Illuminate\Http\Client\Events\ResponseReceived' => [
        'App\Listeners\LogResponseReceived',
    ],
    'Illuminate\Http\Client\Events\ConnectionFailed' => [
        'App\Listeners\LogConnectionFailed',
    ],
];
```