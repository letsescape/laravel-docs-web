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
    - [요청 검사하기](#inspecting-requests)
    - [불필요한 실제 요청 방지](#preventing-stray-requests)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

라라벨은 [Guzzle HTTP 클라이언트](http://docs.guzzlephp.org/en/stable/) 위에 표현적이고 간결한 API를 제공합니다. 이를 통해 다른 웹 애플리케이션과 통신하기 위한 HTTP 요청을 빠르고 손쉽게 보낼 수 있습니다. 라라벨의 Guzzle 래퍼는 가장 흔히 사용되는 기능과 개발자 경험에 중점을 두어 설계되었습니다.

시작하기 전에, 애플리케이션의 의존성으로 Guzzle 패키지가 설치되어 있는지 확인해야 합니다. 기본적으로 라라벨은 이 의존성을 자동으로 포함합니다. 그러나 이전에 이 패키지를 제거했다면, 다음과 같이 Composer를 통해 다시 설치할 수 있습니다.

```shell
composer require guzzlehttp/guzzle
```

<a name="making-requests"></a>
## 요청 보내기

요청을 보내려면 `Http` 파사드에서 제공하는 `head`, `get`, `post`, `put`, `patch`, `delete` 메서드를 사용할 수 있습니다. 먼저, 다른 URL로 기본적인 `GET` 요청을 보내는 방법을 살펴보겠습니다.

```
use Illuminate\Support\Facades\Http;

$response = Http::get('http://example.com');
```

`get` 메서드는 `Illuminate\Http\Client\Response` 인스턴스를 반환하며, 이 인스턴스는 다양한 응답 확인 메서드를 제공합니다.

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

또한 `Illuminate\Http\Client\Response` 객체는 PHP의 `ArrayAccess` 인터페이스를 구현하고 있어서, JSON 응답 데이터에 배열처럼 바로 접근할 수 있습니다.

```
return Http::get('http://example.com/users/1')['name'];
```

위에서 설명한 응답 메서드 외에도, 다음 메서드들로 응답이 특정 상태 코드를 가지고 있는지 확인할 수 있습니다.

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

HTTP 클라이언트는 [URI 템플릿 규격](https://www.rfc-editor.org/rfc/rfc6570)을 이용해 요청 URL을 동적으로 만들 수도 있습니다. `withUrlParameters` 메서드를 사용하면 URI 템플릿에서 확장될 URL 파라미터를 정의할 수 있습니다.

```php
Http::withUrlParameters([
    'endpoint' => 'https://laravel.com',
    'page' => 'docs',
    'version' => '9.x',
    'topic' => 'validation',
])->get('{+endpoint}/{page}/{version}/{topic}');
```

<a name="dumping-requests"></a>
#### 요청 디버깅(dump)하기

요청을 전송하기 전에 요청 인스턴스를 덤프(dump)하고, 스크립트 실행을 중단하고 싶다면, 요청 정의의 시작 부분에 `dd` 메서드를 추가할 수 있습니다.

```
return Http::dd()->get('http://example.com');
```

<a name="request-data"></a>
### 요청 데이터

보통 `POST`, `PUT`, `PATCH` 요청을 보낼 때 추가 데이터를 함께 전송하는 것이 일반적입니다. 이런 요청 메서드들은 두 번째 인수로 데이터 배열을 받을 수 있습니다. 기본적으로 데이터는 `application/json` 콘텐츠 타입으로 전송됩니다.

```
use Illuminate\Support\Facades\Http;

$response = Http::post('http://example.com/users', [
    'name' => 'Steve',
    'role' => 'Network Administrator',
]);
```

<a name="get-request-query-parameters"></a>
#### GET 요청 쿼리 파라미터

`GET` 요청을 보낼 때는, 직접 URL에 쿼리 문자열을 추가하거나, `get` 메서드의 두 번째 인수로 키/값 쌍 배열을 전달할 수 있습니다.

```
$response = Http::get('http://example.com/users', [
    'name' => 'Taylor',
    'page' => 1,
]);
```

<a name="sending-form-url-encoded-requests"></a>
#### 폼 URL 인코딩 방식 요청 보내기

`application/x-www-form-urlencoded` 콘텐츠 타입으로 데이터를 보내고 싶을 때는, 요청 전에 `asForm` 메서드를 호출해야 합니다.

```
$response = Http::asForm()->post('http://example.com/users', [
    'name' => 'Sara',
    'role' => 'Privacy Consultant',
]);
```

<a name="sending-a-raw-request-body"></a>
#### Raw 요청 바디 전송

요청 시, raw 바디를 직접 제공하고 싶다면 `withBody` 메서드를 사용할 수 있습니다. 두 번째 인수로 콘텐츠 타입을 지정할 수 있습니다.

```
$response = Http::withBody(
    base64_encode($photo), 'image/jpeg'
)->post('http://example.com/photo');
```

<a name="multi-part-requests"></a>
#### 멀티파트(Multi-Part) 요청

파일을 멀티파트 요청으로 전송하고 싶을 때는, 요청 전에 `attach` 메서드를 사용합니다. 이 메서드는 파일의 이름과 내용을 받을 수 있으며, 필요하면 세 번째 인수로 파일명을 지정할 수도 있습니다.

```
$response = Http::attach(
    'attachment', file_get_contents('photo.jpg'), 'photo.jpg'
)->post('http://example.com/attachments');
```

파일의 raw 내용을 전달하는 대신, 스트림 리소스를 사용할 수도 있습니다.

```
$photo = fopen('photo.jpg', 'r');

$response = Http::attach(
    'attachment', $photo, 'photo.jpg'
)->post('http://example.com/attachments');
```

<a name="headers"></a>
### 헤더

요청에 헤더를 추가하려면 `withHeaders` 메서드를 사용합니다. 이 메서드는 키/값 쌍의 배열을 받습니다.

```
$response = Http::withHeaders([
    'X-First' => 'foo',
    'X-Second' => 'bar'
])->post('http://example.com/users', [
    'name' => 'Taylor',
]);
```

요청에 대한 응답으로 애플리케이션이 기대하는 콘텐츠 타입을 지정하려면 `accept` 메서드를 사용할 수 있습니다.

```
$response = Http::accept('application/json')->get('http://example.com/users');
```

좀 더 간단하게, 요청 응답으로 `application/json` 타입을 기대한다고 명시하려면 `acceptJson` 메서드를 사용할 수 있습니다.

```
$response = Http::acceptJson()->get('http://example.com/users');
```

<a name="authentication"></a>
### 인증

Basic 또는 Digest 인증이 필요하다면 각각 `withBasicAuth` 또는 `withDigestAuth` 메서드로 인증 정보를 지정할 수 있습니다.

```
// Basic 인증...
$response = Http::withBasicAuth('taylor@laravel.com', 'secret')->post(/* ... */);

// Digest 인증...
$response = Http::withDigestAuth('taylor@laravel.com', 'secret')->post(/* ... */);
```

<a name="bearer-tokens"></a>
#### 베어러 토큰

요청의 `Authorization` 헤더에 베어러 토큰을 쉽게 추가하고 싶다면, `withToken` 메서드를 사용할 수 있습니다.

```
$response = Http::withToken('token')->post(/* ... */);
```

<a name="timeout"></a>
### 타임아웃

응답을 기다릴 최대 초(second) 수를 지정하려면 `timeout` 메서드를 사용할 수 있습니다.

```
$response = Http::timeout(3)->get(/* ... */);
```

지정한 타임아웃을 초과하면 `Illuminate\Http\Client\ConnectionException` 예외가 발생합니다.

서버에 연결을 시도할 때 대기할 최대 초(second) 수는 `connectTimeout` 메서드로 지정할 수 있습니다.

```
$response = Http::connectTimeout(3)->get(/* ... */);
```

<a name="retries"></a>
### 재시도

HTTP 클라이언트가 클라이언트 또는 서버 에러가 발생했을 때, 자동으로 요청을 재시도하도록 하려면 `retry` 메서드를 사용할 수 있습니다. 이 메서드는 최대 재시도 횟수와 각 시도 사이에 기다릴 밀리초(ms) 시간을 받습니다.

```
$response = Http::retry(3, 100)->post(/* ... */);
```

필요하다면 `retry` 메서드에 세 번째 인수로 콜러블(callable)을 전달할 수 있습니다. 이 콜러블은 실제로 재시도를 해야 하는지 판단하는 역할을 합니다. 예를 들어, 최초 요청에서 `ConnectionException`이 발생할 때만 재시도하게 할 수도 있습니다.

```
$response = Http::retry(3, 100, function ($exception, $request) {
    return $exception instanceof ConnectionException;
})->post(/* ... */);
```

요청 시도가 실패하면, 다음 시도 전에 요청을 변경하고 싶을 수 있습니다. 이럴 때는 `retry` 메서드에 전달한 콜러블에서 제공된 요청 객체를 조작할 수 있습니다. 예를 들어, 첫 시도가 인증 오류(401)를 반환하면 새로운 인증 토큰으로 재시도할 수도 있습니다.

```
$response = Http::withToken($this->getToken())->retry(2, 0, function ($exception, $request) {
    if (! $exception instanceof RequestException || $exception->response->status() !== 401) {
        return false;
    }

    $request->withToken($this->getNewToken());

    return true;
})->post(/* ... */);
```

모든 요청이 실패하면 `Illuminate\Http\Client\RequestException` 예외가 발생합니다. 이 동작을 비활성화하려면, `throw` 인수에 `false` 값을 전달할 수 있습니다. 비활성화하면, 모든 재시도 후 마지막 응답이 반환됩니다.

```
$response = Http::retry(3, 100, throw: false)->post(/* ... */);
```

> [!WARNING]
> 모든 요청이 연결 오류로 실패할 경우, `throw` 인수를 `false`로 설정해도 `Illuminate\Http\Client\ConnectionException` 예외는 계속 발생합니다.

<a name="error-handling"></a>
### 에러 처리

Guzzle의 기본 동작과 달리, 라라벨 HTTP 클라이언트 래퍼는 클라이언트(400번대)나 서버(500번대) 오류가 발생해도 예외를 던지지 않습니다. 이처럼 오류가 반환되었는지는 `successful`, `clientError`, `serverError` 메서드로 확인할 수 있습니다.

```
// 상태 코드가 200 이상 300 미만인지 확인...
$response->successful();

// 상태 코드가 400 이상인지 확인...
$response->failed();

// 400번대 응답인지 확인...
$response->clientError();

// 500번대 응답인지 확인...
$response->serverError();

// 클라이언트 또는 서버 오류가 발생했을 때 즉시 콜백 실행...
$response->onError(callable $callback);
```

<a name="throwing-exceptions"></a>
#### 예외 던지기

응답 인스턴스가 있을 때, 상태 코드가 클라이언트 또는 서버 오류를 나타내면 `Illuminate\Http\Client\RequestException` 예외를 던지고 싶다면, `throw` 또는 `throwIf` 메서드를 사용할 수 있습니다.

```
$response = Http::post(/* ... */);

// 클라이언트 또는 서버 오류가 발생하면 예외 던지기...
$response->throw();

// 오류가 발생하고 조건이 참이면 예외 던지기...
$response->throwIf($condition);

// 오류가 발생하고 주어진 클로저가 참이면 예외 던지기...
$response->throwIf(fn ($response) => true);

// 오류가 발생하고 조건이 거짓이면 예외 던지기...
$response->throwUnless($condition);

// 오류가 발생하고 주어진 클로저가 거짓이면 예외 던지기...
$response->throwUnless(fn ($response) => false);

// 응답이 특정 상태 코드를 가지면 예외 던지기...
$response->throwIfStatus(403);

// 응답이 특정 상태 코드가 아니면 예외 던지기...
$response->throwUnlessStatus(200);

return $response['user']['id'];
```

`Illuminate\Http\Client\RequestException` 인스턴스에는 반환된 응답을 확인할 수 있는 public `$response` 속성이 있습니다.

`throw` 메서드는 에러가 발생하지 않은 경우 응답 인스턴스를 반환하므로, 추가 작업을 체인처럼 연결해 사용할 수 있습니다.

```
return Http::post(/* ... */)->throw()->json();
```

예외가 발생하기 전에 추가 로직을 실행하고 싶다면 클로저를 `throw` 메서드에 전달할 수 있습니다. 클로저 실행 후, 예외는 자동으로 던져지니 클로저 내부에서 예외를 재던질 필요는 없습니다.

```
return Http::post(/* ... */)->throw(function ($response, $e) {
    //
})->json();
```

<a name="guzzle-middleware"></a>
### Guzzle 미들웨어

라라벨 HTTP 클라이언트는 Guzzle 위에서 동작하므로, [Guzzle 미들웨어](https://docs.guzzlephp.org/en/stable/handlers-and-middleware.html)를 활용하여 나가는 요청을 조작하거나 들어오는 응답을 검사할 수 있습니다. 나가는 요청을 조작하려면, `withMiddleware` 메서드와 함께 Guzzle의 `mapRequest` 미들웨어 팩토리를 사용해 미들웨어를 등록합니다.

```
use GuzzleHttp\Middleware;
use Illuminate\Support\Facades\Http;
use Psr\Http\Message\RequestInterface;

$response = Http::withMiddleware(
    Middleware::mapRequest(function (RequestInterface $request) {
        $request = $request->withHeader('X-Example', 'Value');
        
        return $request;
    })
)->get('http://example.com');
```

마찬가지로, 들어오는 HTTP 응답을 검사하려면 `withMiddleware`와 Guzzle의 `mapResponse` 미들웨어 팩토리를 같이 사용해 미들웨어를 등록합니다.

```
use GuzzleHttp\Middleware;
use Illuminate\Support\Facades\Http;
use Psr\Http\Message\ResponseInterface;

$response = Http::withMiddleware(
    Middleware::mapResponse(function (ResponseInterface $response) {
        $header = $response->getHeader('X-Example');

        // ...
        
        return $response;
    })
)->get('http://example.com');
```

<a name="guzzle-options"></a>
### Guzzle 옵션

또한, `withOptions` 메서드로 추가 [Guzzle 요청 옵션](http://docs.guzzlephp.org/en/stable/request-options.html)을 지정할 수 있습니다. 이 메서드는 키/값 쌍의 배열을 받습니다.

```
$response = Http::withOptions([
    'debug' => true,
])->get('http://example.com/users');
```

<a name="concurrent-requests"></a>
## 동시 요청

여러 HTTP 요청을 동시에 보내고 싶을 때가 있습니다. 즉, 요청을 순차적으로 보내지 않고, 여러 개를 동시에 처리하고 싶은 경우입니다. 이는 느린 HTTP API와 상호작용할 때 성능을 크게 개선할 수 있습니다.

이런 동작은 `pool` 메서드를 사용해 구현할 수 있습니다. `pool` 메서드는 `Illuminate\Http\Client\Pool` 인스턴스를 받아 요청 풀에 쉽게 요청을 추가할 수 있도록 클로저를 받습니다.

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

보시다시피, 각 응답 인스턴스는 풀에 추가된 순서대로 접근할 수 있습니다. 필요하다면, `as` 메서드로 요청에 이름을 부여하여 해당 이름으로 응답에 접근할 수 있습니다.

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

<a name="macros"></a>
## 매크로

라라벨 HTTP 클라이언트는 "매크로"를 정의할 수 있습니다. 매크로는 공통 요청 경로 또는 헤더를 자주 사용하는 경우, 이를 유연하게 구성하고 재사용하기 위한 매커니즘입니다. 매크로를 정의하려면, 애플리케이션 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에 아래처럼 작성할 수 있습니다.

```php
use Illuminate\Support\Facades\Http;

/**
 * 애플리케이션 서비스 부트스트랩.
 *
 * @return void
 */
public function boot()
{
    Http::macro('github', function () {
        return Http::withHeaders([
            'X-Example' => 'example',
        ])->baseUrl('https://github.com');
    });
}
```

이제 매크로를 어디에서나 호출하여 지정된 설정이 적용된 pending 요청을 만들 수 있습니다.

```php
$response = Http::github()->get('/');
```

<a name="testing"></a>
## 테스트

라라벨의 다양한 서비스는 쉽게 테스트를 작성할 수 있는 기능을 제공합니다. HTTP 클라이언트 역시 예외가 아닙니다. `Http` 파사드의 `fake` 메서드를 사용하면 실제 요청 대신 미리 준비한 응답(가짜 또는 더미)을 반환하도록 HTTP 클라이언트를 설정할 수 있습니다.

<a name="faking-responses"></a>
### 응답 가짜로 만들기

예를 들어, 모든 요청에 대해 빈 값과 `200` 상태 코드의 응답을 반환하도록 하려면 `fake` 메서드를 인수 없이 호출하면 됩니다.

```
use Illuminate\Support\Facades\Http;

Http::fake();

$response = Http::post(/* ... */);
```

<a name="faking-specific-urls"></a>
#### 특정 URL에 대해 가짜 응답 만들기

또는, `fake` 메서드에 배열을 전달할 수도 있습니다. 배열의 키에는 가짜 응답을 적용할 URL 패턴을, 값에는 해당 응답을 지정합니다. `*` 문자를 와일드카드로 사용할 수 있습니다. 가짜 처리하지 않은 URL로의 실제 요청은 실제로 수행됩니다. HTTP 파사드의 `response` 메서드를 이용해 스텁/가짜 응답을 만들 수 있습니다.

```
Http::fake([
    // GitHub 엔드포인트에 JSON 응답을 스텁 처리...
    'github.com/*' => Http::response(['foo' => 'bar'], 200, $headers),

    // Google 엔드포인트에 문자열 응답을 스텁 처리...
    'google.com/*' => Http::response('Hello World', 200, $headers),
]);
```

모든 패턴과 일치하지 않는 URL에도 가짜 응답을 사용하려면, 와일드카드 `*` 패턴을 사용할 수 있습니다.

```
Http::fake([
    // GitHub 엔드포인트에 JSON 응답을 스텁 처리...
    'github.com/*' => Http::response(['foo' => 'bar'], 200, ['Headers']),

    // 그 외 모든 엔드포인트에 문자열 응답 스텁 처리...
    '*' => Http::response('Hello World', 200, ['Headers']),
]);
```

<a name="faking-response-sequences"></a>
#### 순차 가짜 응답 만들기

특정 URL이 일정한 순서로 여러 개의 가짜 응답을 반환해야 하는 경우가 있습니다. 이럴 때는 `Http::sequence` 메서드를 이용해 응답 시퀀스를 작성할 수 있습니다.

```
Http::fake([
    // GitHub 엔드포인트에 응답 순서대로 스텁 추가...
    'github.com/*' => Http::sequence()
                            ->push('Hello World', 200)
                            ->push(['foo' => 'bar'], 200)
                            ->pushStatus(404),
]);
```

응답 시퀀스가 모두 소진되면, 추가 요청 시 예외가 던져집니다. 만약 시퀀스가 소진된 후 반환할 기본 응답을 지정하고 싶다면 `whenEmpty` 메서드를 사용할 수 있습니다.

```
Http::fake([
    // GitHub 엔드포인트에 응답 순서대로 스텁 추가...
    'github.com/*' => Http::sequence()
                            ->push('Hello World', 200)
                            ->push(['foo' => 'bar'], 200)
                            ->whenEmpty(Http::response()),
]);
```

특정 URL 패턴을 지정할 필요 없이 응답 시퀀스만 필요하다면 `Http::fakeSequence`를 사용할 수 있습니다.

```
Http::fakeSequence()
        ->push('Hello World', 200)
        ->whenEmpty(Http::response());
```

<a name="fake-callback"></a>
#### 콜백 기반 가짜 응답

특정 엔드포인트에 대한 응답을 결정하는 더 복잡한 로직이 필요하다면, `fake` 메서드에 클로저를 전달할 수 있습니다. 이 클로저는 `Illuminate\Http\Client\Request` 인스턴스를 받고, 반환값으로 응답 인스턴스를 반환해야 합니다. 클로저 내부에서 사용자가 원하는 로직을 활용해 다양한 응답을 만들 수 있습니다.

```
use Illuminate\Http\Client\Request;

Http::fake(function (Request $request) {
    return Http::response('Hello World', 200);
});
```

<a name="preventing-stray-requests"></a>
### 불필요한 실제 요청 방지

개별 테스트 또는 전체 테스트 스위트에서 HTTP 클라이언트를 사용하는 모든 요청이 반드시 가짜로 처리되도록 강제하고 싶다면 `preventStrayRequests` 메서드를 호출할 수 있습니다. 이 메서드를 사용하면, 가짜 응답이 없는 요청이 실제로 전송되지 않고 예외가 발생합니다.

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
### 요청 검사하기

가짜 응답을 사용할 때, 클라이언트가 실제로 어떤 요청을 받았는지 확인해서 애플리케이션이 올바른 데이터나 헤더를 보내고 있는지 검사하고 싶을 수 있습니다. 이를 위해, `Http::fake` 호출 이후에 `Http::assertSent` 메서드를 사용할 수 있습니다.

`assertSent`는 클로저를 인수로 받으며, 클로저는 `Illuminate\Http\Client\Request` 인스턴스를 받아 해당 요청이 기대에 부합하는지 여부를 boolean으로 반환하면 됩니다. 조건에 맞는 요청이 최소 하나 이상 존재하면 테스트가 통과합니다.

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

특정 요청이 전송되지 않았음을 검사하고 싶다면 `assertNotSent` 메서드를 사용할 수 있습니다.

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

`assertSentCount` 메서드를 사용하면 테스트 중 "전송된" 요청 개수를 검사할 수 있습니다.

```
Http::fake();

Http::assertSentCount(5);
```

또는, `assertNothingSent` 메서드로 테스트 중에 요청이 전혀 전송되지 않았음을 확인할 수도 있습니다.

```
Http::fake();

Http::assertNothingSent();
```

<a name="recording-requests-and-responses"></a>
#### 요청/응답 기록하기

`recorded` 메서드를 사용하면, 모든 요청과 해당 응답을 모을 수 있습니다. 이 메서드는 `Illuminate\Http\Client\Request`, `Illuminate\Http\Client\Response` 인스턴스 배열 컬렉션을 반환합니다.

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

또한, `recorded` 메서드는 클로저를 인수로 받아 요청/응답 쌍을 원하는 조건에 따라 필터링할 수도 있습니다.

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

라라벨은 HTTP 요청이 수행되는 과정에서 세 가지 이벤트를 발생시킵니다. `RequestSending` 이벤트는 요청이 전송되기 전에, `ResponseReceived` 이벤트는 요청에 대한 응답이 도착한 후 발생합니다. 만약 요청에 대해 응답을 받지 못한 경우에는 `ConnectionFailed` 이벤트가 발생합니다.

`RequestSending`와 `ConnectionFailed` 이벤트 모두 `Illuminate\Http\Client\Request` 인스턴스를 확인할 수 있는 `$request` 속성을 포함하고 있습니다. 또한, `ResponseReceived` 이벤트에는 `$request`와 함께, 응답을 확인할 수 있는 `$response` 속성도 있습니다. 이 이벤트들을 리스닝하려면, `App\Providers\EventServiceProvider` 내에서 다음처럼 이벤트 리스너를 등록할 수 있습니다.

```
/**
 * 애플리케이션 이벤트 리스너 매핑.
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