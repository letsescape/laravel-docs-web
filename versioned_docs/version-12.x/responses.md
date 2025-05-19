# HTTP 응답 (HTTP Responses)

- [응답 생성](#creating-responses)
    - [응답에 헤더 추가하기](#attaching-headers-to-responses)
    - [응답에 쿠키 추가하기](#attaching-cookies-to-responses)
    - [쿠키와 암호화](#cookies-and-encryption)
- [리디렉션](#redirects)
    - [네임드 라우트로 리디렉션](#redirecting-named-routes)
    - [컨트롤러 액션으로 리디렉션](#redirecting-controller-actions)
    - [외부 도메인으로 리디렉션](#redirecting-external-domains)
    - [플래시 세션 데이터와 함께 리디렉션](#redirecting-with-flashed-session-data)
- [기타 응답 타입](#other-response-types)
    - [뷰 응답](#view-responses)
    - [JSON 응답](#json-responses)
    - [파일 다운로드](#file-downloads)
    - [파일 응답](#file-responses)
    - [스트림 응답](#streamed-responses)
- [응답 매크로](#response-macros)

<a name="creating-responses"></a>
## 응답 생성

<a name="strings-arrays"></a>
#### 문자열과 배열

모든 라우트와 컨트롤러는 사용자의 브라우저로 다시 전송할 응답을 반환해야 합니다. 라라벨에서는 여러 가지 방식으로 응답을 반환할 수 있습니다. 가장 기본적인 방법은 라우트 또는 컨트롤러에서 문자열을 반환하는 것입니다. 프레임워크가 이 문자열을 자동으로 전체 HTTP 응답으로 변환합니다.

```php
Route::get('/', function () {
    return 'Hello World';
});
```

컨트롤러나 라우트에서 문자열뿐만 아니라 배열도 반환할 수 있습니다. 이 경우 프레임워크가 배열을 자동으로 JSON 응답으로 변환해줍니다.

```php
Route::get('/', function () {
    return [1, 2, 3];
});
```

> [!NOTE]
> 라우트나 컨트롤러에서 [Eloquent 컬렉션](/docs/12.x/eloquent-collections)을 반환할 수도 있다는 것을 알고 계셨나요? 이들도 자동으로 JSON으로 변환됩니다. 직접 시도해보세요!

<a name="response-objects"></a>
#### 응답 객체

일반적으로 라우트 액션에서 단순히 문자열이나 배열만 반환하는 경우는 드뭅니다. 대부분은 `Illuminate\Http\Response` 인스턴스나 [뷰](/docs/12.x/views)를 반환하게 됩니다.

`Response` 인스턴스를 직접 반환하면 응답의 HTTP 상태 코드와 헤더 등을 원하는 대로 커스터마이즈할 수 있습니다. `Response` 클래스는 `Symfony\Component\HttpFoundation\Response`를 상속하므로, 다양한 메서드를 활용해 HTTP 응답을 구성할 수 있습니다.

```php
Route::get('/home', function () {
    return response('Hello World', 200)
        ->header('Content-Type', 'text/plain');
});
```

<a name="eloquent-models-and-collections"></a>
#### Eloquent 모델과 컬렉션

라우트나 컨트롤러에서 [Eloquent ORM](/docs/12.x/eloquent) 모델 및 컬렉션을 직접 반환할 수도 있습니다. 이렇게 하면 라라벨이 모델 및 컬렉션을 자동으로 JSON 응답으로 변환하며, 모델의 [히든 속성](/docs/12.x/eloquent-serialization#hiding-attributes-from-json)도 존중됩니다.

```php
use App\Models\User;

Route::get('/user/{user}', function (User $user) {
    return $user;
});
```

<a name="attaching-headers-to-responses"></a>
### 응답에 헤더 추가하기

대부분의 응답 메서드는 체이닝이 가능하여, 응답 인스턴스를 유연하게 구성할 수 있습니다. 예를 들어 `header` 메서드를 사용하여 응답에 여러 헤더를 추가한 뒤 반환할 수 있습니다.

```php
return response($content)
    ->header('Content-Type', $type)
    ->header('X-Header-One', 'Header Value')
    ->header('X-Header-Two', 'Header Value');
```

또는 `withHeaders` 메서드로 헤더 배열을 한 번에 지정할 수도 있습니다.

```php
return response($content)
    ->withHeaders([
        'Content-Type' => $type,
        'X-Header-One' => 'Header Value',
        'X-Header-Two' => 'Header Value',
    ]);
```

<a name="cache-control-middleware"></a>
#### 캐시 제어 미들웨어

라라벨에는 그룹 라우트에 대해 `Cache-Control` 헤더를 간편하게 설정할 수 있는 `cache.headers` 미들웨어가 포함되어 있습니다. 캐시 제어 지시자는 해당 디렉티브의 "스네이크 케이스(snake case)" 버전을 사용하여 세미콜론으로 구분하여 지정해야 합니다. 만약 `etag`를 포함하면, 응답 콘텐츠의 MD5 해시가 자동으로 ETag 식별자로 설정됩니다.

```php
Route::middleware('cache.headers:public;max_age=2628000;etag')->group(function () {
    Route::get('/privacy', function () {
        // ...
    });

    Route::get('/terms', function () {
        // ...
    });
});
```

<a name="attaching-cookies-to-responses"></a>
### 응답에 쿠키 추가하기

`Illuminate\Http\Response` 인스턴스에 `cookie` 메서드를 사용하여 쿠키를 추가할 수 있습니다. 이 메서드에 쿠키의 이름, 값, 쿠키가 유효할 분(minute) 단위 시간을 전달합니다.

```php
return response('Hello World')->cookie(
    'name', 'value', $minutes
);
```

`cookie` 메서드는 추가적으로 더 다양한 인자를 받을 수 있으며, 이 인자들은 PHP의 기본 [setcookie](https://secure.php.net/manual/en/function.setcookie.php) 함수의 인자와 거의 용도가 같습니다.

```php
return response('Hello World')->cookie(
    'name', 'value', $minutes, $path, $domain, $secure, $httpOnly
);
```

아직 응답 인스턴스가 없지만 응답과 함께 쿠키를 꼭 보내고 싶을 때는, `Cookie` 파사드를 이용해서 응답 큐에 쿠키를 등록할 수 있습니다. `queue` 메서드는 쿠키 인스턴스 생성에 필요한 인자들을 받아, 나중에 응답이 전송될 때 자동으로 쿠키가 포함되도록 해줍니다.

```php
use Illuminate\Support\Facades\Cookie;

Cookie::queue('name', 'value', $minutes);
```

<a name="generating-cookie-instances"></a>
#### 쿠키 인스턴스 생성하기

쿠키 인스턴스를 미리 만들어두고, 추후 응답에 첨부하고 싶다면 글로벌 `cookie` 헬퍼를 사용할 수 있습니다. 이렇게 생성한 쿠키는 응답에 붙이지 않는 이상 클라이언트로 전송되지 않습니다.

```php
$cookie = cookie('name', 'value', $minutes);

return response('Hello World')->cookie($cookie);
```

<a name="expiring-cookies-early"></a>
#### 쿠키를 조기 만료시키기

응답 인스턴스에서 `withoutCookie` 메서드를 사용하여 쿠키를 만료(삭제)할 수 있습니다.

```php
return response('Hello World')->withoutCookie('name');
```

아직 응답 인스턴스가 없는 경우에는 `Cookie` 파사드의 `expire` 메서드로 쿠키를 만료시킬 수도 있습니다.

```php
Cookie::expire('name');
```

<a name="cookies-and-encryption"></a>
### 쿠키와 암호화

기본적으로, `Illuminate\Cookie\Middleware\EncryptCookies` 미들웨어 덕분에 라라벨이 생성하는 모든 쿠키는 암호화 및 서명 처리되어 클라이언트에서 값을 임의로 읽거나 변경할 수 없습니다. 앱에서 생성하는 일부 쿠키에 대해 암호화를 해제하고 싶다면, `bootstrap/app.php`에서 `encryptCookies` 메서드의 `except` 옵션을 사용하면 됩니다.

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->encryptCookies(except: [
        'cookie_name',
    ]);
})
```

<a name="redirects"></a>
## 리디렉션

리디렉션 응답은 `Illuminate\Http\RedirectResponse` 클래스의 인스턴스이며, 다른 URL로 사용자를 이동시키기 위해 필요한 적절한 헤더를 포함합니다. `RedirectResponse` 인스턴스는 여러 가지 방식으로 생성할 수 있습니다. 가장 간단한 방법은 글로벌 `redirect` 헬퍼를 호출하는 것입니다.

```php
Route::get('/dashboard', function () {
    return redirect('/home/dashboard');
});
```

폼 제출이 유효하지 않을 때 사용자를 이전 페이지로 리디렉션하고 싶은 경우, 글로벌 `back` 헬퍼 함수를 사용할 수 있습니다. 이 기능은 [세션](/docs/12.x/session)을 활용하므로, 해당 라우트가 `web` 미들웨어 그룹에 포함되어야 합니다.

```php
Route::post('/user/profile', function () {
    // 요청 유효성 검사...

    return back()->withInput();
});
```

<a name="redirecting-named-routes"></a>
### 네임드 라우트로 리디렉션

`redirect` 헬퍼를 파라미터 없이 호출하면 `Illuminate\Routing\Redirector` 인스턴스를 반환하므로, 여기서 다양한 메서드를 사용할 수 있습니다. 네임드 라우트로 리디렉션하려면 `route` 메서드를 사용하세요.

```php
return redirect()->route('login');
```

라우트에 파라미터가 있다면, 두 번째 인자로 전달해줄 수 있습니다.

```php
// URI가 /profile/{id}인 라우트의 경우

return redirect()->route('profile', ['id' => 1]);
```

<a name="populating-parameters-via-eloquent-models"></a>
#### Eloquent 모델을 통한 파라미터 채우기

ID 파라미터가 Eloquent 모델에서 자동으로 추출될 경우, 모델 인스턴스 자체를 파라미터로 전달할 수 있습니다. 라라벨이 모델의 ID 값을 자동으로 추출해서 사용합니다.

```php
// URI가 /profile/{id}인 라우트의 경우

return redirect()->route('profile', [$user]);
```

라우트 파라미터에 들어가는 값을 직접 지정하고 싶다면, 라우트 파라미터 정의에서 컬럼을 명시하거나(`/profile/{id:slug}`), 모델의 `getRouteKey` 메서드를 오버라이드하면 됩니다.

```php
/**
 * 모델의 라우트 키 값을 반환합니다.
 */
public function getRouteKey(): mixed
{
    return $this->slug;
}
```

<a name="redirecting-controller-actions"></a>
### 컨트롤러 액션으로 리디렉션

[컨트롤러 액션](/docs/12.x/controllers)으로 바로 리디렉션을 생성할 수도 있습니다. 이 경우 컨트롤러 클래스와 액션명을 `action` 메서드에 전달하면 됩니다.

```php
use App\Http\Controllers\UserController;

return redirect()->action([UserController::class, 'index']);
```

컨트롤러 액션에 파라미터가 필요하다면, 두 번째 인자로 파라미터 배열을 전달하세요.

```php
return redirect()->action(
    [UserController::class, 'profile'], ['id' => 1]
);
```

<a name="redirecting-external-domains"></a>
### 외부 도메인으로 리디렉션

가끔 애플리케이션 외부의 도메인으로 리디렉션해야 할 때가 있습니다. 이런 경우 `away` 메서드를 사용하면 별도의 URL 인코딩이나 추가 검증 없이 `RedirectResponse`를 생성할 수 있습니다.

```php
return redirect()->away('https://www.google.com');
```

<a name="redirecting-with-flashed-session-data"></a>
### 플래시 세션 데이터와 함께 리디렉션

새로운 URL로 리디렉션할 때 [세션에 데이터 플래시](/docs/12.x/session#flash-data)도 자주 함께 사용됩니다. 예를 들어 어떤 작업이 성공한 뒤 성공 메시지를 세션에 플래시하고 리디렉션하는 등 이런 시나리오에 최적화되어 있습니다. 편리하게, 메서드 체이닝을 통해 `RedirectResponse` 인스턴스 생성과 세션 플래시를 한 번에 처리할 수 있습니다.

```php
Route::post('/user/profile', function () {
    // ...

    return redirect('/dashboard')->with('status', 'Profile updated!');
});
```

사용자가 리디렉션된 후에는 [세션](/docs/12.x/session)에서 플래시 메시지를 출력할 수 있습니다. [Blade 문법](/docs/12.x/blade) 예시는 다음과 같습니다.

```blade
@if (session('status'))
    <div class="alert alert-success">
        {{ session('status') }}
    </div>
@endif
```

<a name="redirecting-with-input"></a>
#### 입력값과 함께 리디렉션

`RedirectResponse` 인스턴스의 `withInput` 메서드를 사용하면, 현재 요청에서 받은 입력값(input)을 세션에 플래시한 뒤 새 위치로 리디렉션할 수 있습니다. 주로 유효성 검사 에러 상황에서 사용합니다. 플래시된 입력값은 다음 요청에서 [간편하게 조회](/docs/12.x/requests#retrieving-old-input)하여 폼을 자동으로 채우는 데 활용할 수 있습니다.

```php
return back()->withInput();
```

<a name="other-response-types"></a>
## 기타 응답 타입

`response` 헬퍼를 사용하면 다양한 타입의 응답 인스턴스를 생성할 수 있습니다. 인자가 없는 채로 `response` 헬퍼를 호출하면 `Illuminate\Contracts\Routing\ResponseFactory` [컨트랙트](/docs/12.x/contracts) 구현체가 반환되며, 이 객체가 여러 유용한 응답 생성 메서드를 제공합니다.

<a name="view-responses"></a>
### 뷰 응답

응답의 상태 코드와 헤더까지 세밀하게 제어하면서, 응답 콘텐츠로 [뷰](/docs/12.x/views)를 반환하고자 할 때는 `view` 메서드를 사용할 수 있습니다.

```php
return response()
    ->view('hello', $data, 200)
    ->header('Content-Type', $type);
```

물론, 별도의 상태 코드나 헤더 지정이 필요 없다면 글로벌 `view` 헬퍼 함수를 사용해도 됩니다.

<a name="json-responses"></a>
### JSON 응답

`json` 메서드는 `Content-Type` 헤더를 `application/json`으로 자동 설정하고, 주어진 배열을 내부적으로 PHP의 `json_encode`를 이용해 JSON으로 변환합니다.

```php
return response()->json([
    'name' => 'Abigail',
    'state' => 'CA',
]);
```

JSONP 응답이 필요하다면, `json` 메서드와 `withCallback` 메서드를 조합해 사용할 수 있습니다.

```php
return response()
    ->json(['name' => 'Abigail', 'state' => 'CA'])
    ->withCallback($request->input('callback'));
```

<a name="file-downloads"></a>
### 파일 다운로드

`download` 메서드를 사용하면 사용자의 브라우저가 특정 경로의 파일을 강제 다운로드하도록 하는 응답을 생성할 수 있습니다. 이 메서드의 두 번째 인자는 사용자가 보게 될 파일 이름이며, 세 번째 인자로 HTTP 헤더 배열을 전달할 수도 있습니다.

```php
return response()->download($pathToFile);

return response()->download($pathToFile, $name, $headers);
```

> [!WARNING]
> 파일 다운로드를 관리하는 Symfony HttpFoundation은 다운로드할 파일명의 문자가 반드시 ASCII여야 한다는 점에 유의하세요.

<a name="file-responses"></a>
### 파일 응답

`file` 메서드는 이미지, PDF 등 파일을 다운로드시키지 않고 직접 브라우저에 표시할 때 사용할 수 있습니다. 첫 번째 인자로 파일의 절대 경로, 두 번째 인자로 헤더 배열을 전달합니다.

```php
return response()->file($pathToFile);

return response()->file($pathToFile, $headers);
```

<a name="streamed-responses"></a>
### 스트림 응답

생성되는 데이터를 실시간으로 클라이언트에 스트리밍하면, 메모리 사용을 크게 줄이고 성능도 향상시킬 수 있습니다. 특히 대용량 응답에 유리합니다. 스트림 응답은 서버가 응답 전체를 전송하기 전에 클라이언트가 일부 데이터를 바로 처리하기 시작할 수 있게 해줍니다.

```php
function streamedContent(): Generator {
    yield 'Hello, ';
    yield 'World!';
}

Route::get('/stream', function () {
    return response()->stream(function (): void {
        foreach (streamedContent() as $chunk) {
            echo $chunk;
            ob_flush();
            flush();
            sleep(2); // 청크별 지연을 시뮬레이션...
        }
    }, 200, ['X-Accel-Buffering' => 'no']);
});
```

> [!NOTE]
> 라라벨은 내부적으로 PHP의 출력 버퍼링(output buffering)을 사용합니다. 위 예시에서처럼 `ob_flush`, `flush` 함수를 사용하여 버퍼링된 콘텐츠를 클라이언트로 푸시해야 합니다.

<a name="streamed-json-responses"></a>
#### 스트림 JSON 응답

점진적으로 JSON 데이터를 스트리밍해야 한다면, `streamJson` 메서드를 활용할 수 있습니다. 이 방식은 대용량 데이터를 JavaScript에서 실시간으로 처리해야 할 때 매우 유용합니다.

```php
use App\Models\User;

Route::get('/users.json', function () {
    return response()->streamJson([
        'users' => User::cursor(),
    ]);
});
```

<a name="event-streams"></a>
#### 이벤트 스트림

`eventStream` 메서드는 `text/event-stream` 콘텐츠 타입을 가진 서버 전송 이벤트(SSE) 스트림 응답을 반환합니다. 이 메서드는 [yield](https://www.php.net/manual/en/language.generators.overview.php)를 통해 스트림에 데이터를 순차적으로 전송합니다.

```php
Route::get('/chat', function () {
    return response()->eventStream(function () {
        $stream = OpenAI::client()->chat()->createStreamed(...);

        foreach ($stream as $response) {
            yield $response->choices[0];
        }
    });
});
```

이벤트 이름을 커스터마이즈하고 싶다면 `StreamedEvent` 클래스를 직접 생성하여 yield할 수 있습니다.

```php
use Illuminate\Http\StreamedEvent;

yield new StreamedEvent(
    event: 'update',
    data: $response->choices[0],
);
```

이벤트 스트림은 라라벨의 `stream` npm 패키지를 통해 간편하게 프론트엔드에서 사용할 수 있습니다. 시작하려면 `@laravel/stream-react` 또는 `@laravel/stream-vue` 패키지를 설치하세요.

```shell tab=React
npm install @laravel/stream-react
```

```shell tab=Vue
npm install @laravel/stream-vue
```

이후, `useEventStream` 훅을 사용하여 이벤트 스트림을 소비할 수 있습니다. 스트림 URL을 지정하면 라라벨 애플리케이션에서 메시지가 들어올 때마다 자동으로 `message`가 갱신됩니다.

```jsx tab=React
import { useEventStream } from "@laravel/stream-react";

function App() {
  const { message } = useEventStream("/chat");

  return <div>{message}</div>;
}
```

```vue tab=Vue
<script setup lang="ts">
import { useEventStream } from "@laravel/stream-vue";

const { message } = useEventStream("/chat");
</script>

<template>
  <div>{{ message }}</div>
</template>
```

`useEventStream`의 두 번째 인자는 옵션 객체로, 스트림 소비 방식을 커스터마이즈할 수 있습니다. 기본값 예시는 아래와 같습니다.

```jsx tab=React
import { useEventStream } from "@laravel/stream-react";

function App() {
  const { message } = useEventStream("/stream", {
    event: "update",
    onMessage: (message) => {
      //
    },
    onError: (error) => {
      //
    },
    onComplete: () => {
      //
    },
    endSignal: "</stream>",
    glue: " ",
  });

  return <div>{message}</div>;
}
```

```vue tab=Vue
<script setup lang="ts">
import { useEventStream } from "@laravel/stream-vue";

const { message } = useEventStream("/chat", {
  event: "update",
  onMessage: (message) => {
    // ...
  },
  onError: (error) => {
    // ...
  },
  onComplete: () => {
    // ...
  },
  endSignal: "</stream>",
  glue: " ",
});
</script>
```

이벤트 스트림은 [EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource) 객체를 이용해 프론트엔드에서 직접 사용할 수도 있습니다. 스트림이 완료되면 `</stream>` 업데이트가 자동으로 전송됩니다.

```js
const source = new EventSource('/chat');

source.addEventListener('update', (event) => {
    if (event.data === '</stream>') {
        source.close();

        return;
    }

    console.log(event.data);
});
```

최종 이벤트를 직접 지정하고 싶다면, `eventStream` 메서드의 `endStreamWith` 인자에 `StreamedEvent` 인스턴스를 전달할 수 있습니다.

```php
return response()->eventStream(function () {
    // ...
}, endStreamWith: new StreamedEvent(event: 'update', data: '</stream>'));
```

<a name="streamed-downloads"></a>
#### 스트림 다운로드

어떤 작업의 결과 문자열을 디스크에 저장하지 않고 바로 다운로드 응답으로 전환하고 싶을 때는 `streamDownload` 메서드를 사용할 수 있습니다. 이 메서드는 콜백, 파일명, 그리고 필요에 따라 추가 헤더 배열을 인수로 받습니다.

```php
use App\Services\GitHub;

return response()->streamDownload(function () {
    echo GitHub::api('repo')
        ->contents()
        ->readme('laravel', 'laravel')['contents'];
}, 'laravel-readme.md');
```

<a name="response-macros"></a>
## 응답 매크로

여러 라우트와 컨트롤러에서 반복적으로 사용할 맞춤형 응답을 정의하고 싶다면, `Response` 파사드의 `macro` 메서드를 사용할 수 있습니다. 일반적으로 [서비스 프로바이더](/docs/12.x/providers)의 `boot` 메서드에서 매크로를 등록합니다. 예를 들어 `App\Providers\AppServiceProvider`에서 다음과 같이 작성할 수 있습니다.

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Response;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * 애플리케이션 서비스를 부트스트랩합니다.
     */
    public function boot(): void
    {
        Response::macro('caps', function (string $value) {
            return Response::make(strtoupper($value));
        });
    }
}
```

`macro` 함수는 첫 번째 인자로 매크로 이름, 두 번째 인자로 클로저를 받습니다. 매크로의 클로저는 `ResponseFactory` 구현 객체나 `response` 헬퍼에서 매크로 이름을 호출할 때 실행됩니다.

```php
return response()->caps('foo');
```
