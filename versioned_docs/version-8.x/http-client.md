# HTTP 클라이언트 (HTTP Client)

- [소개](#introduction)
- [요청 보내기](#making-requests)
    - [요청 데이터](#request-data)
    - [헤더](#headers)
    - [인증](#authentication)
    - [타임아웃](#timeout)
    - [재시도](#retries)
    - [에러 처리](#error-handling)
    - [Guzzle 옵션](#guzzle-options)
- [동시 요청](#concurrent-requests)
- [매크로](#macros)
- [테스트](#testing)
    - [응답을 가짜로 만들기](#faking-responses)
    - [요청 검사하기](#inspecting-requests)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

라라벨은 [Guzzle HTTP 클라이언트](http://docs.guzzlephp.org/en/stable/) 위에 표현적이며 최소한의 API를 제공합니다. 이를 통해 다른 웹 애플리케이션과 통신할 때 빠르게 외부 HTTP 요청을 보낼 수 있습니다. 라라벨의 Guzzle 래퍼는 가장 흔히 사용하는 기능들에 중점을 두고, 개발자 경험이 탁월하도록 설계되어 있습니다.

시작하기 전에, Guzzle 패키지가 애플리케이션의 의존성으로 설치되어 있는지 확인해야 합니다. 기본적으로 라라벨에는 이 의존성이 자동으로 포함되어 있습니다. 하지만 만약 이전에 이 패키지를 제거한 적이 있다면, 다음과 같이 Composer를 통해 다시 설치할 수 있습니다.

```
composer require guzzlehttp/guzzle
```

<a name="making-requests"></a>
## 요청 보내기

요청을 보내려면 `Http` 파사드에서 제공하는 `head`, `get`, `post`, `put`, `patch`, `delete` 메서드를 사용할 수 있습니다. 먼저, 다른 URL에 기본적인 `GET` 요청을 보내는 방법을 살펴보겠습니다.

```
use Illuminate\Support\Facades\Http;

$response = Http::get('http://example.com');
```

`get` 메서드는 `Illuminate\Http\Client\Response` 인스턴스를 반환하며, 다음과 같은 다양한 메서드를 이용해 응답을 검사할 수 있습니다.

```
$response->body() : string;
$response->json($key = null) : array|mixed;
$response->object() : object;
$response->collect($key = null) : Illuminate\Support\Collection;
$response->status() : int;
$response->ok() : bool;
$response->successful() : bool;
$response->redirect(): bool;
$response->failed() : bool;
$response->serverError() : bool;
$response->clientError() : bool;
$response->header($header) : string;
$response->headers() : array;
```

또한 `Illuminate\Http\Client\Response` 객체는 PHP의 `ArrayAccess` 인터페이스를 구현하므로, JSON 응답 데이터를 배열처럼 바로 접근할 수 있습니다.

```
return Http::get('http://example.com/users/1')['name'];
```

<a name="dumping-requests"></a>
#### 요청 디버깅(dump)하기

요청이 전송되기 전에 해당 요청 인스턴스를 덤프하고 스크립트 실행을 즉시 종료하고 싶다면, 요청 정의의 처음에 `dd` 메서드를 추가하면 됩니다.

```
return Http::dd()->get('http://example.com');
```

<a name="request-data"></a>
### 요청 데이터

`POST`, `PUT`, `PATCH` 요청 시에는 추가 데이터를 함께 보내는 경우가 많습니다. 이런 메서드들은 두 번째 인수로 데이터 배열을 받을 수 있습니다. 기본적으로, 데이터는 `application/json` 콘텐츠 타입으로 전송됩니다.

```
use Illuminate\Support\Facades\Http;

$response = Http::post('http://example.com/users', [
    'name' => 'Steve',
    'role' => 'Network Administrator',
]);
```

<a name="get-request-query-parameters"></a>
#### GET 요청 쿼리 파라미터

`GET` 요청을 할 때, 쿼리 문자열을 URL에 직접 추가하거나, `get` 메서드의 두 번째 인수로 키/값 쌍 배열을 전달할 수 있습니다.

```
$response = Http::get('http://example.com/users', [
    'name' => 'Taylor',
    'page' => 1,
]);
```

<a name="sending-form-url-encoded-requests"></a>
#### Form URL 인코딩 방식으로 요청 보내기

만약 `application/x-www-form-urlencoded` 콘텐츠 타입으로 데이터를 보내고 싶다면, 요청 전에 `asForm` 메서드를 호출해야 합니다.

```
$response = Http::asForm()->post('http://example.com/users', [
    'name' => 'Sara',
    'role' => 'Privacy Consultant',
]);
```

<a name="sending-a-raw-request-body"></a>
#### Raw 요청 바디 보내기

요청을 보낼 때 raw 데이터를 직접 주고 싶다면, `withBody` 메서드를 사용할 수 있습니다. 두 번째 인수로 콘텐츠 타입을 지정할 수 있습니다.

```
$response = Http::withBody(
    base64_encode($photo), 'image/jpeg'
)->post('http://example.com/photo');
```

<a name="multi-part-requests"></a>
#### 다중 파트(Multi-Part) 요청

파일을 다중 파트 요청으로 보내야 할 경우, `attach` 메서드를 사용해야 합니다. 이 메서드는 파일의 이름과 내용을 받으며, 필요하다면 파일명을 세 번째 인수로 지정할 수 있습니다.

```
$response = Http::attach(
    'attachment', file_get_contents('photo.jpg'), 'photo.jpg'
)->post('http://example.com/attachments');
```

파일의 raw 데이터를 전달하는 대신, 스트림 리소스를 전달하는 것도 가능합니다.

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

응답에서 어떤 콘텐츠 타입을 기대할 것인지 지정하려면 `accept` 메서드를 사용할 수 있습니다.

```
$response = Http::accept('application/json')->get('http://example.com/users');
```

간편하게 `application/json` 콘텐츠 타입을 기대한다고 지정하려면, `acceptJson` 메서드를 사용할 수 있습니다.

```
$response = Http::acceptJson()->get('http://example.com/users');
```

<a name="authentication"></a>
### 인증

Basic 인증과 Digest 인증을 각각 `withBasicAuth`, `withDigestAuth` 메서드를 사용해 지정할 수 있습니다.

```
// Basic 인증...
$response = Http::withBasicAuth('taylor@laravel.com', 'secret')->post(...);

// Digest 인증...
$response = Http::withDigestAuth('taylor@laravel.com', 'secret')->post(...);
```

<a name="bearer-tokens"></a>
#### Bearer 토큰

요청의 `Authorization` 헤더에 Bearer 토큰을 빠르게 추가하고 싶다면, `withToken` 메서드를 사용합니다.

```
$response = Http::withToken('token')->post(...);
```

<a name="timeout"></a>
### 타임아웃

`timeout` 메서드를 통해 응답을 기다리는 최대 초(sec)를 지정할 수 있습니다.

```
$response = Http::timeout(3)->get(...);
```

만약 지정한 시간 내에 응답을 받지 못하면, `Illuminate\Http\Client\ConnectionException` 예외가 발생합니다.

<a name="retries"></a>
### 재시도

클라이언트 오류나 서버 오류가 발생했을 때 HTTP 클라이언트가 자동으로 요청을 재시도하게 하려면, `retry` 메서드를 사용할 수 있습니다. `retry` 메서드는 요청을 시도할 최대 횟수와 요청 사이에 라라벨이 대기할 시간(밀리초 단위)을 각각 받습니다.

```
$response = Http::retry(3, 100)->post(...);
```

필요하다면, 세 번째 인수로 콜러블을 전달할 수 있습니다. 세 번째 인수는 실제로 재시도를 할지 결정하는 콜백입니다. 예를 들어, 최초 요청에서 `ConnectionException`이 발생할 때만 재시도하도록 할 수 있습니다.

```
$response = Http::retry(3, 100, function ($exception) {
    return $exception instanceof ConnectionException;
})->post(...);
```

모든 시도가 실패한다면, `Illuminate\Http\Client\RequestException` 예외가 발생합니다.

<a name="error-handling"></a>
### 에러 처리

Guzzle의 기본 동작과 달리, 라라벨 HTTP 클라이언트 래퍼는 클라이언트 또는 서버 오류(서버에서 400, 500번대 응답)에서 예외를 발생시키지 않습니다. `successful`, `clientError`, `serverError` 메서드를 사용해 이러한 오류가 발생했는지 확인할 수 있습니다.

```
// 상태 코드가 200 이상 300 미만인지 확인...
$response->successful();

// 상태 코드가 400 이상인지 확인...
$response->failed();

// 400번대 에러 응답인지 확인...
$response->clientError();

// 500번대 에러 응답인지 확인...
$response->serverError();

// 클라이언트 또는 서버 오류 시 즉시 콜백 실행...
$response->onError(callable $callback);
```

<a name="throwing-exceptions"></a>
#### 예외 발생시키기

응답 인스턴스가 있고, 상태 코드가 클라이언트 또는 서버 오류임을 나타낸다면 `Illuminate\Http\Client\RequestException` 예외를 발생시키도록 `throw` 또는 `throwIf` 메서드를 사용할 수 있습니다.

```
$response = Http::post(...);

// 클라이언트 또는 서버 오류 시 예외 발생...
$response->throw();

// 오류가 발생하고, 주어진 조건이 true면 예외 발생...
$response->throwIf($condition);

return $response['user']['id'];
```

`Illuminate\Http\Client\RequestException` 인스턴스에는 반환된 응답을 검사할 수 있도록 public `$response` 속성이 있습니다.

`throw` 메서드는 오류가 없으면 응답 인스턴스를 반환하므로, `throw` 이후에 다른 메서드를 체이닝할 수 있습니다.

```
return Http::post(...)->throw()->json();
```

예외가 발생하기 전에 추가적인 로직을 실행하고 싶다면, 클로저를 `throw` 메서드에 전달할 수 있습니다. 이 경우, 클로저 실행 후 예외가 자동으로 발생하기 때문에 직접 예외를 다시 던질 필요는 없습니다.

```
return Http::post(...)->throw(function ($response, $e) {
    //
})->json();
```

<a name="guzzle-options"></a>
### Guzzle 옵션

추가적인 [Guzzle 요청 옵션](http://docs.guzzlephp.org/en/stable/request-options.html)이 필요할 경우, `withOptions` 메서드를 사용하면 됩니다. 이 메서드는 키/값 쌍의 배열을 받습니다.

```
$response = Http::withOptions([
    'debug' => true,
])->get('http://example.com/users');
```

<a name="concurrent-requests"></a>
## 동시 요청

여러 개의 HTTP 요청을 동시에 보내야 할 때가 있습니다. 즉, 여러 요청을 순차적으로 처리하는 대신 한 번에 동시에 보냅니다. 이를 통해 반응이 느린 HTTP API와 통신할 때 성능이 크게 개선될 수 있습니다.

이럴 때는 `pool` 메서드를 사용하면 됩니다. `pool` 메서드는 `Illuminate\Http\Client\Pool` 인스턴스를 받는 클로저를 인수로 받으며, 여기에 요청들을 추가해 한 번에 보낼 수 있습니다.

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

각 응답 인스턴스는 풀에 추가된 순서대로 접근할 수 있습니다. 또한 `as` 메서드를 사용해 요청에 이름을 붙이고, 그 이름으로 응답을 조회할 수도 있습니다.

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

라라벨 HTTP 클라이언트는 "매크로"를 정의할 수 있게 하여, 서비스와 상호작용할 때 자주 사용하는 요청 경로와 헤더를 손쉽게 구성할 수 있도록 지원합니다. 먼저, 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드 안에 매크로를 정의하세요.

```php
use Illuminate\Support\Facades\Http;

/**
 * Bootstrap any application services.
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

매크로 설정을 완료했다면, 애플리케이션 어디에서든 지정한 설정으로 대기 중인(pending) 요청을 다음과 같이 만들 수 있습니다.

```php
$response = Http::github()->get('/');
```

<a name="testing"></a>
## 테스트

라라벨의 다양한 서비스들은 테스트 작성을 보다 쉽고 표현적으로 할 수 있게 도와주는 기능을 제공합니다. HTTP 래퍼 역시 예외는 아닙니다. `Http` 파사드의 `fake` 메서드를 이용하면, 요청 시 미리 준비된(stub) 또는 더미(dummmy) 응답을 반환하도록 지정할 수 있습니다.

<a name="faking-responses"></a>
### 응답을 가짜로 만들기

예를 들어, HTTP 클라이언트가 모든 요청마다 비어 있는 200 상태 코드 응답을 반환하도록 하려면, `fake` 메서드에 인수를 주지 않고 호출하면 됩니다.

```
use Illuminate\Support\Facades\Http;

Http::fake();

$response = Http::post(...);
```

> [!NOTE]
> 요청을 가짜로 만들면, HTTP 클라이언트의 미들웨어는 실행되지 않습니다. 가짜 응답에 대한 기대값을 정의할 때 이 미들웨어들이 정상적으로 동작했다고 가정하여 테스트를 작성해야 합니다.

<a name="faking-specific-urls"></a>
#### 특정 URL만 가짜 응답 지정하기

또는, `fake` 메서드에 배열을 전달할 수도 있습니다. 이 배열의 키는 가짜로 만들고자 하는 URL 패턴이고, 값은 해당 응답입니다. `*` 문자를 와일드카드로 사용할 수 있습니다. 가짜로 지정되지 않은 URL로의 요청은 실제로 실행됩니다. 이런 엔드포인트용 가짜 응답을 만들려면, `Http` 파사드의 `response` 메서드를 사용할 수 있습니다.

```
Http::fake([
    // GitHub 엔드포인트에 대한 JSON 응답 스텁...
    'github.com/*' => Http::response(['foo' => 'bar'], 200, $headers),

    // Google 엔드포인트에 대한 문자열 응답 스텁...
    'google.com/*' => Http::response('Hello World', 200, $headers),
]);
```

모든 매칭되지 않은 URL을 위한 fallback URL 패턴을 지정하고 싶다면, 단일 `*` 문자를 사용할 수 있습니다.

```
Http::fake([
    // GitHub 엔드포인트에 대한 JSON 응답 스텁...
    'github.com/*' => Http::response(['foo' => 'bar'], 200, ['Headers']),

    // 그 외 모든 엔드포인트에 대한 문자열 응답 스텁...
    '*' => Http::response('Hello World', 200, ['Headers']),
]);
```

<a name="faking-response-sequences"></a>
#### 응답 시퀀스를 가짜로 지정하기

특정 URL에서 여러 개의 가짜 응답을 순서대로 반환해야 할 때가 있습니다. 이럴 때는 `Http::sequence` 메서드로 응답 시퀀스를 만들 수 있습니다.

```
Http::fake([
    // GitHub 엔드포인트에 대한 다수의 응답 스텁...
    'github.com/*' => Http::sequence()
                            ->push('Hello World', 200)
                            ->push(['foo' => 'bar'], 200)
                            ->pushStatus(404),
]);
```

시퀀스의 모든 응답이 소진되면, 그 이후의 요청은 예외를 발생시킵니다. 시퀀스가 비었을 때 반환할 기본 응답을 지정하고 싶다면, `whenEmpty` 메서드를 사용할 수 있습니다.

```
Http::fake([
    // GitHub 엔드포인트에 대한 다수의 응답 스텁...
    'github.com/*' => Http::sequence()
                            ->push('Hello World', 200)
                            ->push(['foo' => 'bar'], 200)
                            ->whenEmpty(Http::response()),
]);
```

만약 특정 URL 패턴이 필요 없고, 단순히 응답 시퀀스만 가짜로 만들고 싶다면, `Http::fakeSequence` 메서드를 사용할 수 있습니다.

```
Http::fakeSequence()
        ->push('Hello World', 200)
        ->whenEmpty(Http::response());
```

<a name="fake-callback"></a>
#### Fake 콜백

특정 엔드포인트에 대해 반환할 응답을 동적으로 결정해야 하는 더 복잡한 로직이 필요하다면, `fake` 메서드에 클로저를 전달할 수 있습니다. 이 클로저는 `Illuminate\Http\Client\Request` 인스턴스를 인수로 받고, 응답 인스턴스를 반환해야 합니다. 클로저 내부에서 원하는 모든 로직을 실행할 수 있습니다.

```
Http::fake(function ($request) {
    return Http::response('Hello World', 200);
});
```

<a name="inspecting-requests"></a>
### 요청 검사하기

가짜 응답을 만드는 도중, 클라이언트가 받은 요청을 검사해 애플리케이션이 올바른 데이터 또는 헤더를 보내는지 확인하고 싶을 수 있습니다. 이를 위해 `Http::fake` 호출 이후 `Http::assertSent` 메서드를 사용할 수 있습니다.

`assertSent` 메서드는 클로저를 받으며, 이 클로저는 `Illuminate\Http\Client\Request` 인스턴스를 인수로 받고, 요청이 기대에 부합하면 true를 반환하면 됩니다. 적어도 하나의 요청이 기대에 맞으면 테스트가 통과합니다.

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

특정 요청이 전송되지 않았음을 확인하려면 `assertNotSent` 메서드를 사용할 수 있습니다.

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

테스트 도중 "전송된" 요청 횟수를 검증하려면, `assertSentCount` 메서드를 사용할 수 있습니다.

```
Http::fake();

Http::assertSentCount(5);
```

혹은, 테스트 중 단 하나의 요청도 전송되지 않았는지 확인하려면, `assertNothingSent` 메서드를 사용합니다.

```
Http::fake();

Http::assertNothingSent();
```

<a name="events"></a>
## 이벤트

라라벨은 HTTP 요청 전송 과정에서 세 가지 이벤트를 발생시킵니다. `RequestSending` 이벤트는 요청이 전송되기 전에 발생하고, `ResponseReceived` 이벤트는 주어진 요청에 대한 응답을 받은 후 발생합니다. 요청에 응답을 받지 못할 경우에는 `ConnectionFailed` 이벤트가 발생합니다.

`RequestSending`과 `ConnectionFailed` 이벤트 모두 요청 인스턴스를 검사할 수 있도록 public `$request` 속성을 포함합니다. `ResponseReceived` 이벤트는 `$request`뿐만 아니라 `$response` 속성도 포함하여, `Illuminate\Http\Client\Response` 인스턴스를 검사할 수 있습니다. 이 이벤트에 대한 리스터는 애플리케이션의 `App\Providers\EventServiceProvider` 서비스 프로바이더에서 등록할 수 있습니다.

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