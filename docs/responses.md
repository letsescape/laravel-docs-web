# HTTP 응답 (HTTP Responses)

- [응답 생성](#creating-responses)
    - [응답에 헤더 추가하기](#attaching-headers-to-responses)
    - [응답에 쿠키 추가하기](#attaching-cookies-to-responses)
    - [쿠키와 암호화](#cookies-and-encryption)
- [리디렉션](#redirects)
    - [네임드 라우트로 리디렉션](#redirecting-named-routes)
    - [컨트롤러 액션으로 리디렉션](#redirecting-controller-actions)
    - [외부 도메인으로 리디렉션](#redirecting-external-domains)
    - [세션 플래시 데이터와 함께 리디렉션](#redirecting-with-flashed-session-data)
- [기타 응답 타입](#other-response-types)
    - [뷰 응답](#view-responses)
    - [JSON 응답](#json-responses)
    - [파일 다운로드](#file-downloads)
    - [파일 응답](#file-responses)
    - [스트리밍 응답](#streamed-responses)
- [응답 매크로](#response-macros)

<a name="creating-responses"></a>
## 응답 생성

<a name="strings-arrays"></a>
#### 문자열 및 배열

모든 라우트와 컨트롤러에서는 반드시 사용자의 브라우저로 다시 보낼 응답을 반환해야 합니다. 라라벨에서는 여러 가지 방식으로 응답을 반환할 수 있습니다. 가장 기본적인 방법은 라우트 또는 컨트롤러에서 문자열을 반환하는 것입니다. 프레임워크는 문자열을 자동으로 완전한 HTTP 응답으로 변환합니다.

```php
Route::get('/', function () {
    return 'Hello World';
});
```

라우트와 컨트롤러에서 문자열 뿐만 아니라 배열을 반환할 수도 있습니다. 이 경우 프레임워크가 배열을 자동으로 JSON 응답으로 변환하여 반환합니다.

```php
Route::get('/', function () {
    return [1, 2, 3];
});
```

> [!NOTE]
> 라라벨의 [Eloquent 컬렉션](/docs/eloquent-collections)도 라우트나 컨트롤러에서 바로 반환할 수 있다는 사실을 알고 계셨나요? 자동으로 JSON으로 변환되어 반환됩니다. 한번 시도해 보세요!

<a name="response-objects"></a>
#### 응답 객체

일반적으로 라우트 액션에서는 문자열이나 배열만 반환하지 않고, `Illuminate\Http\Response` 인스턴스나 [뷰](/docs/views)를 반환하는 경우가 많습니다.

`Response` 인스턴스를 반환하면, 응답의 HTTP 상태 코드 및 헤더를 자유롭게 제어할 수 있습니다. `Response` 인스턴스는 `Symfony\Component\HttpFoundation\Response` 클래스를 상속하며, HTTP 응답을 조립할 수 있는 다양한 메서드를 제공합니다.

```php
Route::get('/home', function () {
    return response('Hello World', 200)
        ->header('Content-Type', 'text/plain');
});
```

<a name="eloquent-models-and-collections"></a>
#### Eloquent 모델 및 컬렉션

[Eloquent ORM](/docs/eloquent)의 모델이나 컬렉션을 라우트 및 컨트롤러에서 직접 반환할 수도 있습니다. 이렇게 반환하면, 라라벨이 해당 모델이나 컬렉션을 JSON 응답으로 자동 변환해줍니다. 이때 모델의 [숨김 속성](/docs/eloquent-serialization#hiding-attributes-from-json)도 자동으로 처리됩니다.

```php
use App\Models\User;

Route::get('/user/{user}', function (User $user) {
    return $user;
});
```

<a name="attaching-headers-to-responses"></a>
### 응답에 헤더 추가하기

대부분의 응답 메서드는 체이닝이 가능하기 때문에, 응답 객체를 유연하게 조립할 수 있습니다. 예를 들어, `header` 메서드를 사용하면 여러 개의 헤더를 연속적으로 추가할 수 있습니다.

```php
return response($content)
    ->header('Content-Type', $type)
    ->header('X-Header-One', 'Header Value')
    ->header('X-Header-Two', 'Header Value');
```

또는, `withHeaders` 메서드를 사용해 헤더 배열을 한 번에 설정할 수도 있습니다.

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

라라벨에서는 `cache.headers` 미들웨어를 제공하여, 여러 라우트 그룹에 `Cache-Control` 헤더를 손쉽게 지정할 수 있습니다. 캐시 제어 지시어는 해당 캐시 제어 구문을 스네이크 케이스로 변환해 세미콜론(;)으로 구분하여 입력합니다. 만약 지시어에 `etag`가 포함되어 있으면, 응답 본문의 MD5 해시가 ETag 식별자로 자동 지정됩니다.

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

응답 객체(`Illuminate\Http\Response`)에 쿠키를 추가하려면 `cookie` 메서드를 사용합니다. 쿠키의 이름, 값, 유효기간(분)을 인수로 전달합니다.

```php
return response('Hello World')->cookie(
    'name', 'value', $minutes
);
```

`cookie` 메서드는 흔히 사용되지는 않지만, 더 많은 인수를 추가로 받을 수 있습니다. 이 인수들은 PHP의 기본 [setcookie](https://secure.php.net/manual/en/function.setcookie.php) 함수에 전달하는 인수와 동일합니다.

```php
return response('Hello World')->cookie(
    'name', 'value', $minutes, $path, $domain, $secure, $httpOnly
);
```

응답 객체가 아직 없지만 쿠키를 미리 지정해 둬야 하는 경우라면, `Cookie` 파사드를 이용하여 쿠키를 "큐잉"할 수 있습니다. 즉, `queue` 메서드로 쿠키를 등록해두면, 응답이 전송될 때 해당 쿠키가 자동으로 포함됩니다.

```php
use Illuminate\Support\Facades\Cookie;

Cookie::queue('name', 'value', $minutes);
```

<a name="generating-cookie-instances"></a>
#### 쿠키 인스턴스 생성하기

나중에 응답 객체에 첨부할 수 있도록, `Symfony\Component\HttpFoundation\Cookie` 인스턴스를 미리 생성하고 싶다면 전역 `cookie` 헬퍼를 사용할 수 있습니다. 생성된 쿠키 인스턴스는 응답 객체에 추가하기 전까지는 실제로 전송되지 않습니다.

```php
$cookie = cookie('name', 'value', $minutes);

return response('Hello World')->cookie($cookie);
```

<a name="expiring-cookies-early"></a>
#### 쿠키 조기 만료시키기

아웃바운드 응답의 `withoutCookie` 메서드를 사용해서 쿠키를 조기 만료시켜 삭제할 수 있습니다.

```php
return response('Hello World')->withoutCookie('name');
```

응답 객체가 없는 경우라면, `Cookie` 파사드의 `expire` 메서드를 사용할 수 있습니다.

```php
Cookie::expire('name');
```

<a name="cookies-and-encryption"></a>
### 쿠키와 암호화

라라벨에서는 기본적으로 `Illuminate\Cookie\Middleware\EncryptCookies` 미들웨어가 활성화되어 있기 때문에, 생성된 모든 쿠키가 자동으로 암호화 및 서명됩니다. 따라서 클라이언트가 쿠키 내용을 읽거나 수정할 수 없습니다. 애플리케이션에서 생성된 일부 쿠키만 암호화 대상에서 제외하고 싶다면, `bootstrap/app.php` 파일에서 `encryptCookies` 메서드를 이용할 수 있습니다.

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->encryptCookies(except: [
        'cookie_name',
    ]);
})
```

<a name="redirects"></a>
## 리디렉션

리디렉션 응답은 `Illuminate\Http\RedirectResponse` 클래스의 인스턴스이며, 사용자를 다른 URL로 이동시키는 데 필요한 적절한 헤더가 포함되어 있습니다. 다양한 방법으로 `RedirectResponse` 인스턴스를 생성할 수 있습니다. 가장 간단한 방법은 전역 `redirect` 헬퍼를 사용하는 것입니다.

```php
Route::get('/dashboard', function () {
    return redirect('/home/dashboard');
});
```

때로는 사용자를 이전 위치로 되돌려 보내고 싶을 때가 있습니다. (예: 제출된 폼이 올바르지 않은 경우 등) 이럴 때는 전역 `back` 헬퍼 함수를 사용할 수 있습니다. 이 기능은 [세션](/docs/session)을 이용하므로, `back` 함수를 호출하는 라우트는 반드시 `web` 미들웨어 그룹을 사용해야 합니다.

```php
Route::post('/user/profile', function () {
    // 요청 유효성 검사 ...

    return back()->withInput();
});
```

<a name="redirecting-named-routes"></a>
### 네임드 라우트로 리디렉션

`redirect` 헬퍼를 파라미터 없이 호출하면, `Illuminate\Routing\Redirector` 인스턴스가 반환됩니다. 이 객체를 통해 여러 메서드를 호출하여 다양한 리디렉션을 만들 수 있습니다. 예를 들어, 네임드 라우트로 리디렉션하려면 `route` 메서드를 사용하면 됩니다.

```php
return redirect()->route('login');
```

라우트에 파라미터가 필요한 경우에는, 두 번째 인수로 파라미터를 전달하면 됩니다.

```php
// 라우트 URI 예시: /profile/{id}

return redirect()->route('profile', ['id' => 1]);
```

<a name="populating-parameters-via-eloquent-models"></a>
#### Eloquent 모델을 이용해 파라미터 채우기

라우트 파라미터 중 "ID" 값이 Eloquent 모델에서 자동으로 추출되어야 하는 경우, 모델 객체 자체를 배열로 전달하면 자동으로 ID 값이 추출되어 전달됩니다.

```php
// 라우트 URI 예시: /profile/{id}

return redirect()->route('profile', [$user]);
```

라우트 파라미터에 들어갈 값을 직접 지정하고 싶다면, 라우트 파라미터 정의에서 컬럼명을 지정(`/profile/{id:slug}`)하거나, Eloquent 모델에서 `getRouteKey` 메서드를 오버라이드할 수도 있습니다.

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

[컨트롤러 액션](/docs/controllers)으로 리디렉션도 가능합니다. 이때는 컨트롤러 클래스명과 액션명을 `action` 메서드에 전달하면 됩니다.

```php
use App\Http\Controllers\UserController;

return redirect()->action([UserController::class, 'index']);
```

컨트롤러 액션이 파라미터를 필요로 하면, 두 번째 인수로 파라미터 배열을 전달하세요.

```php
return redirect()->action(
    [UserController::class, 'profile'], ['id' => 1]
);
```

<a name="redirecting-external-domains"></a>
### 외부 도메인으로 리디렉션

가끔 애플리케이션 외부의 도메인으로 리디렉션해야 할 일이 있습니다. 이럴 때는 `away` 메서드를 사용하면, URL 인코딩, 검증, 확인 과정 없이 즉시 외부 도메인으로 리디렉션됩니다.

```php
return redirect()->away('https://www.google.com');
```

<a name="redirecting-with-flashed-session-data"></a>
### 세션 플래시 데이터와 함께 리디렉션

새 URL로 리디렉션하면서 [데이터를 세션에 플래시](/docs/session#flash-data)하는 경우가 많습니다. 예를 들어, 어떤 작업에 성공한 뒤 성공 메시지를 세션에 플래시합니다. 라라벨에서는 한 번에 `RedirectResponse` 생성과 데이터 플래시를 연속된 메서드 체인으로 편리하게 처리할 수 있습니다.

```php
Route::post('/user/profile', function () {
    // ...

    return redirect('/dashboard')->with('status', 'Profile updated!');
});
```

리디렉션 후, [세션](/docs/session)에 저장되어 있는 플래시 메시지는 [Blade 문법](/docs/blade)을 사용해 쉽게 표시할 수 있습니다.

```blade
@if (session('status'))
    <div class="alert alert-success">
        {{ session('status') }}
    </div>
@endif
```

<a name="redirecting-with-input"></a>
#### 입력값과 함께 리디렉션

`RedirectResponse`의 `withInput` 메서드를 사용하면, 현재 요청의 입력 데이터를 세션에 플래시한 뒤 새로운 위치로 리디렉션할 수 있습니다. 주로 유효성 검사 오류가 있을 때 사용됩니다. 이렇게 세션에 플래시된 입력값은 다음 요청에서 [쉽게 꺼내어](/docs/requests#retrieving-old-input) 폼을 다시 채울 때 사용할 수 있습니다.

```php
return back()->withInput();
```

<a name="other-response-types"></a>
## 기타 응답 타입

`response` 헬퍼는 다양한 종류의 응답 인스턴스를 생성하는 데 사용할 수 있습니다. `response` 헬퍼를 인수 없이 호출하면, `Illuminate\Contracts\Routing\ResponseFactory` [컨트랙트](/docs/contracts)의 구현체가 반환됩니다. 이 컨트랙트에는 여러 가지 유용한 응답 생성 메서드가 포함되어 있습니다.

<a name="view-responses"></a>
### 뷰 응답

응답의 상태 코드와 헤더도 직접 지정하면서 [뷰](/docs/views)를 응답 내용으로 반환해야 한다면, `view` 메서드를 이용하세요.

```php
return response()
    ->view('hello', $data, 200)
    ->header('Content-Type', $type);
```

별도의 HTTP 상태 코드나 헤더를 조작할 필요가 없다면, 전역 `view` 헬퍼 함수를 사용하면 됩니다.

<a name="json-responses"></a>
### JSON 응답

`json` 메서드는 `Content-Type` 헤더를 자동으로 `application/json`으로 설정하고, 전달된 배열을 PHP의 `json_encode`로 JSON 문자열로 변환해줍니다.

```php
return response()->json([
    'name' => 'Abigail',
    'state' => 'CA',
]);
```

JSONP 응답이 필요하다면, `json` 메서드와 함께 `withCallback` 메서드를 사용할 수 있습니다.

```php
return response()
    ->json(['name' => 'Abigail', 'state' => 'CA'])
    ->withCallback($request->input('callback'));
```

<a name="file-downloads"></a>
### 파일 다운로드

`download` 메서드를 사용하면, 지정한 경로의 파일을 사용자의 브라우저에서 즉시 다운로드하도록 응답을 생성할 수 있습니다. 두 번째 인수로 파일명을 지정할 수 있으며, 이는 사용자가 보게 되는 다운로드 파일명입니다. 마지막 세 번째 인수로 HTTP 헤더의 배열도 전달할 수 있습니다.

```php
return response()->download($pathToFile);

return response()->download($pathToFile, $name, $headers);
```

> [!WARNING]
> 파일 다운로드를 담당하는 Symfony HttpFoundation은, 다운로드할 파일의 파일명이 반드시 ASCII 문자로만 이루어져 있어야 합니다.

<a name="file-responses"></a>
### 파일 응답

`file` 메서드는 이미지나 PDF와 같이 파일을 일반 다운로드가 아닌 브라우저에서 바로 보여줄 때 사용합니다. 첫 번째 인수로 파일의 절대 경로, 두 번째 인수로 옵션 헤더 배열을 전달할 수 있습니다.

```php
return response()->file($pathToFile);

return response()->file($pathToFile, $headers);
```

<a name="streamed-responses"></a>
### 스트리밍 응답

대용량 응답의 경우, 데이터를 생성하는 대로 실시간 스트리밍으로 클라이언트에 전송하면 메모리 소모를 크게 줄이고 성능을 높일 수 있습니다. 스트리밍 응답은 서버가 데이터 전송을 끝내기 전에 클라이언트가 데이터 처리를 시작할 수 있게 해줍니다.

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
            sleep(2); // 청크 간 딜레이를 시뮬레이션...
        }
    }, 200, ['X-Accel-Buffering' => 'no']);
});
```

> [!NOTE]
> 라라벨 내부적으로는 PHP의 출력 버퍼링 기능을 사용합니다. 위 예시처럼, 버퍼에 있는 내용을 클라이언트로 전달하려면 `ob_flush`와 `flush` 함수를 반드시 호출해야 합니다.

<a name="streamed-json-responses"></a>
#### 스트리밍 JSON 응답

JSON 데이터를 점진적으로 스트리밍해야 할 때는 `streamJson` 메서드를 사용할 수 있습니다. 이 메서드는 대규모 데이터셋을 JavaScript 등에서 점진적으로 파싱할 필요가 있을 때 매우 유용합니다.

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

`eventStream` 메서드를 사용하면, `text/event-stream` 콘텐츠 타입을 사용해 서버 전송 이벤트(Server-Sent Events, SSE) 방식의 스트리밍 응답을 반환할 수 있습니다. 이 메서드는 클로저를 인수로 받으며, 각 스트림에 포함시킬 응답을 [yield](https://www.php.net/manual/en/language.generators.overview.php)로 반환하면 됩니다.

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

이벤트의 이름을 직접 지정하고 싶다면, `StreamedEvent` 클래스의 인스턴스를 `yield`로 반환할 수 있습니다.

```php
use Illuminate\Http\StreamedEvent;

yield new StreamedEvent(
    event: 'update',
    data: $response->choices[0],
);
```

이벤트 스트림은 라라벨의 `stream` npm 패키지를 이용해서 클라이언트에서 손쉽게 사용할 수 있습니다. 먼저, `@laravel/stream-react` 또는 `@laravel/stream-vue` 패키지를 설치하세요.

```shell tab=React
npm install @laravel/stream-react
```

```shell tab=Vue
npm install @laravel/stream-vue
```

그 다음, `useEventStream` 훅을 이용해서 이벤트 스트림을 소비할 수 있습니다. 스트림 URL만 전달하면, 라라벨 앱에서 메시지가 도착할 때마다 `message` 값이 자동으로 갱신됩니다.

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

`useEventStream`의 두 번째 인수로 옵션 객체를 전달하면 스트림 사용 방식을 커스터마이징할 수 있습니다. 이 객체의 기본값은 아래와 같습니다.

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

이벤트 스트림은 프론트엔드에서 [EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource) 객체로 직접 수동으로 소비할 수도 있습니다. `eventStream` 메서드는 스트림이 끝날 때 자동으로 `</stream>` 메시지를 전송합니다.

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

스트림 종료 시 전송되는 최종 이벤트를 커스터마이즈하려면, `eventStream` 메서드의 `endStreamWith` 옵션에 `StreamedEvent` 인스턴스를 직접 지정할 수 있습니다.

```php
return response()->eventStream(function () {
    // ...
}, endStreamWith: new StreamedEvent(event: 'update', data: '</stream>'));
```

<a name="streamed-downloads"></a>
#### 스트리밍 다운로드

때로는 어떤 작업의 결과를 문자열로 반환 받은 후, 해당 문자열을 디스크에 저장하지 않고 바로 다운로드 가능한 응답으로 바꿔주고 싶을 때가 있습니다. 이럴 때는 `streamDownload` 메서드를 사용할 수 있습니다. 이 메서드는 콜백, 파일명, 옵션 헤더 배열을 인수로 받습니다.

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

여러 라우트나 컨트롤러에서 반복적으로 사용할 사용자 지정 응답을 만들고 싶다면, `Response` 파사드의 `macro` 메서드를 사용할 수 있습니다. 일반적으로 이 메서드는 애플리케이션의 [서비스 프로바이더](/docs/providers), 예를 들어 `App\Providers\AppServiceProvider`의 `boot` 메서드에서 호출하는 것이 좋습니다.

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

`macro` 함수는 첫 번째 인수로 매크로의 이름, 두 번째 인수로 클로저를 받습니다. 이렇게 정의된 매크로는 `ResponseFactory` 구현체나 `response` 헬퍼에서 해당 매크로 이름을 호출하면 실행됩니다.

```php
return response()->caps('foo');
```
