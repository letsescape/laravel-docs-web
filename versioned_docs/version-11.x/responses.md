# HTTP 응답 (HTTP Responses)

- [응답 생성](#creating-responses)
    - [응답에 헤더 추가](#attaching-headers-to-responses)
    - [응답에 쿠키 추가](#attaching-cookies-to-responses)
    - [쿠키와 암호화](#cookies-and-encryption)
- [리다이렉트](#redirects)
    - [네임드 라우트로 리다이렉트](#redirecting-named-routes)
    - [컨트롤러 액션으로 리다이렉트](#redirecting-controller-actions)
    - [외부 도메인으로 리다이렉트](#redirecting-external-domains)
    - [플래시 세션 데이터와 함께 리다이렉트](#redirecting-with-flashed-session-data)
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
#### 문자열 및 배열 반환

모든 라우트와 컨트롤러는 반드시 사용자의 브라우저로 전송될 응답을 반환해야 합니다. 라라벨에서는 여러 가지 방법으로 응답을 반환할 수 있습니다. 가장 기본적인 방법은 라우트나 컨트롤러에서 문자열을 반환하는 것입니다. 프레임워크는 이 문자열을 자동으로 HTTP 응답으로 변환하여 전송합니다.

```
Route::get('/', function () {
    return 'Hello World';
});
```

라우트나 컨트롤러에서 문자열뿐만 아니라 배열도 반환할 수 있습니다. 배열이 반환되면, 프레임워크가 자동으로 해당 배열을 JSON 응답으로 변환해 줍니다.

```
Route::get('/', function () {
    return [1, 2, 3];
});
```

> [!NOTE]  
> 라우트나 컨트롤러에서 [Eloquent 컬렉션](/docs/11.x/eloquent-collections)도 반환할 수 있다는 사실, 알고 계셨나요? 컬렉션 역시 자동으로 JSON으로 변환됩니다. 직접 시도해 보세요!

<a name="response-objects"></a>
#### Response 객체 반환

실제로는, 라우트 액션에서 단순 문자열이나 배열만 반환하는 경우보다는 전체 `Illuminate\Http\Response` 인스턴스나 [뷰](/docs/11.x/views)를 반환하는 경우가 더 많습니다.

`Response` 인스턴스를 반환하면, 응답의 HTTP 상태 코드와 헤더 등을 더욱 세밀하게 제어할 수 있습니다. `Response` 인스턴스는 `Symfony\Component\HttpFoundation\Response` 클래스를 상속하며, HTTP 응답을 구성할 수 있는 다양한 메서드를 제공합니다.

```
Route::get('/home', function () {
    return response('Hello World', 200)
        ->header('Content-Type', 'text/plain');
});
```

<a name="eloquent-models-and-collections"></a>
#### Eloquent 모델 및 컬렉션 반환

[엘로퀀트 ORM](/docs/11.x/eloquent)의 모델과 컬렉션도 라우트나 컨트롤러에서 직접 반환할 수 있습니다. 이 경우 라라벨이 모델과 컬렉션을 자동으로 JSON 응답으로 변환합니다. 이때 모델의 [hidden 속성들](/docs/11.x/eloquent-serialization#hiding-attributes-from-json)은 자동으로 숨겨집니다.

```
use App\Models\User;

Route::get('/user/{user}', function (User $user) {
    return $user;
});
```

<a name="attaching-headers-to-responses"></a>
### 응답에 헤더 추가

대부분의 응답 관련 메서드는 체이닝이 가능하므로, 하나의 응답 인스턴스를 유연하게 구성할 수 있습니다. 예를 들어, `header` 메서드를 사용하면 여러 개의 헤더를 연달아 추가할 수 있습니다.

```
return response($content)
    ->header('Content-Type', $type)
    ->header('X-Header-One', 'Header Value')
    ->header('X-Header-Two', 'Header Value');
```

또는, `withHeaders` 메서드를 사용해 배열 형태로 한 번에 여러 개의 헤더를 지정할 수도 있습니다.

```
return response($content)
    ->withHeaders([
        'Content-Type' => $type,
        'X-Header-One' => 'Header Value',
        'X-Header-Two' => 'Header Value',
    ]);
```

<a name="cache-control-middleware"></a>
#### Cache Control 미들웨어

라라벨에는 `cache.headers` 미들웨어가 내장되어 있어, 여러 라우트 그룹에 대해 `Cache-Control` 헤더를 간단히 설정할 수 있습니다. 지시어(Directive)는 캐시 제어 디렉티브의 "스네이크 케이스" 형태로, 세미콜론(;)으로 구분해서 입력해야 합니다. 만약 `etag` 디렉티브를 포함하면, 응답 내용의 MD5 해시값이 자동으로 ETag 식별자로 설정됩니다.

```
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
### 응답에 쿠키 추가

`Illuminate\Http\Response` 인스턴스의 `cookie` 메서드를 사용해 응답에 쿠키를 추가할 수 있습니다. 이 메서드에는 쿠키의 이름, 값, 유효 시간(분)을 전달하면 됩니다.

```
return response('Hello World')->cookie(
    'name', 'value', $minutes
);
```

`cookie` 메서드는 잘 사용되지 않는 몇 가지 인자를 더 받을 수 있습니다. 일반적으로 이 인자들은 PHP의 기본 [setcookie](https://secure.php.net/manual/en/function.setcookie.php) 함수에 전달하는 인자와 같은 목적과 의미를 가집니다.

```
return response('Hello World')->cookie(
    'name', 'value', $minutes, $path, $domain, $secure, $httpOnly
);
```

아직 응답 인스턴스가 없는 상황에서도 쿠키를 응답에 붙이고 싶다면, `Cookie` 파사드를 사용하여 쿠키를 "큐"에 등록할 수 있습니다. `queue` 메서드에 쿠키 생성에 필요한 인자를 전달하면, 이 쿠키가 다음 응답에 자동으로 포함되어 전송됩니다.

```
use Illuminate\Support\Facades\Cookie;

Cookie::queue('name', 'value', $minutes);
```

<a name="generating-cookie-instances"></a>
#### 쿠키 인스턴스 생성하기

`Symfony\Component\HttpFoundation\Cookie` 인스턴스를 미리 생성해두고, 나중에 응답 인스턴스에 추가하고 싶다면 글로벌 `cookie` 헬퍼를 사용하면 됩니다. 이 쿠키 인스턴스는 응답에 붙이지 않는 이상 클라이언트에게 전송되지 않습니다.

```
$cookie = cookie('name', 'value', $minutes);

return response('Hello World')->cookie($cookie);
```

<a name="expiring-cookies-early"></a>
#### 쿠키를 조기 만료시키기

`withoutCookie` 메서드를 사용해 응답에서 특정 쿠키를 만료할 수 있습니다.

```
return response('Hello World')->withoutCookie('name');
```

아직 응답 인스턴스가 없다면, `Cookie` 파사드의 `expire` 메서드를 이용해 쿠키를 만료시킬 수 있습니다.

```
Cookie::expire('name');
```

<a name="cookies-and-encryption"></a>
### 쿠키와 암호화

기본적으로, `Illuminate\Cookie\Middleware\EncryptCookies` 미들웨어 덕분에 라라벨에서 생성되는 모든 쿠키는 암호화 및 서명되어, 클라이언트에서 내용을 읽거나 수정할 수 없습니다. 애플리케이션에서 생성되는 일부 쿠키에 대해서만 암호화를 해제하고 싶다면, `bootstrap/app.php` 파일 내에서 `encryptCookies` 메서드를 사용하면 됩니다.

```
->withMiddleware(function (Middleware $middleware) {
    $middleware->encryptCookies(except: [
        'cookie_name',
    ]);
})
```

<a name="redirects"></a>
## 리다이렉트

리다이렉트 응답은 `Illuminate\Http\RedirectResponse` 클래스의 인스턴스이며, 사용자를 다른 URL로 이동시키는 데 필요한 헤더가 포함되어 있습니다. `RedirectResponse` 인스턴스는 여러 가지 방법으로 생성할 수 있습니다. 가장 간단한 방법은 글로벌 `redirect` 헬퍼를 사용하는 것입니다.

```
Route::get('/dashboard', function () {
    return redirect('/home/dashboard');
});
```

폼 제출이 유효하지 않을 때 등, 사용자를 이전 페이지로 돌려보내고 싶을 때가 있습니다. 이럴 때는 글로벌 `back` 헬퍼 함수를 사용하면 됩니다. 이 기능은 [세션](/docs/11.x/session)을 활용하므로, 해당 라우트가 반드시 `web` 미들웨어 그룹에 속해 있어야 합니다.

```
Route::post('/user/profile', function () {
    // 요청 검증...

    return back()->withInput();
});
```

<a name="redirecting-named-routes"></a>
### 네임드 라우트로 리다이렉트

`redirect` 헬퍼를 인자 없이 호출하면, `Illuminate\Routing\Redirector` 인스턴스가 반환되어 다양한 리다이렉트 메서드를 체이닝할 수 있습니다. 예를 들어, 네임드 라우트로 리다이렉트를 하려면 `route` 메서드를 사용합니다.

```
return redirect()->route('login');
```

라우트에 파라미터가 필요한 경우, 두 번째 인자로 배열로 넘겨주면 됩니다.

```
// 예시 라우트: /profile/{id}

return redirect()->route('profile', ['id' => 1]);
```

<a name="populating-parameters-via-eloquent-models"></a>
#### Eloquent 모델로 파라미터 채우기

라우트에 "ID" 파라미터를 전달해야 할 때, 해당 파라미터가 Eloquent 모델에서 채워지는 경우 직접 모델 인스턴스를 넘길 수 있습니다. 그러면 라라벨이 자동으로 ID 값을 추출하여 사용합니다.

```
// 예시 라우트: /profile/{id}

return redirect()->route('profile', [$user]);
```

라우트 파라미터에 들어가는 값을 커스터마이즈하고 싶다면 라우트 정의에서 컬럼을 지정하거나(`/profile/{id:slug}`), Eloquent 모델의 `getRouteKey` 메서드를 오버라이드할 수 있습니다.

```
/**
 * 모델의 라우트 키 값을 반환합니다.
 */
public function getRouteKey(): mixed
{
    return $this->slug;
}
```

<a name="redirecting-controller-actions"></a>
### 컨트롤러 액션으로 리다이렉트

[컨트롤러 액션](/docs/11.x/controllers)으로 리다이렉트 할 수도 있습니다. 컨트롤러 클래스와 액션명을 배열로 전달하여 `action` 메서드를 사용하면 됩니다.

```
use App\Http\Controllers\UserController;

return redirect()->action([UserController::class, 'index']);
```

만약 컨트롤러 라우트에 파라미터가 필요하다면, 두 번째 인자로 배열을 넘겨주면 됩니다.

```
return redirect()->action(
    [UserController::class, 'profile'], ['id' => 1]
);
```

<a name="redirecting-external-domains"></a>
### 외부 도메인으로 리다이렉트

애플리케이션 외부의 도메인으로 이동시켜야 할 경우, `away` 메서드를 사용할 수 있습니다. 이 메서드는 추가적인 URL 인코딩, 검증, 확인 없이 `RedirectResponse`를 생성합니다.

```
return redirect()->away('https://www.google.com');
```

<a name="redirecting-with-flashed-session-data"></a>
### 플래시 세션 데이터와 함께 리다이렉트

새 URL로 리다이렉트 하면서 [세션에 데이터를 플래시](/docs/11.x/session#flash-data)하는 경우가 많습니다. 예를 들어, 어떤 동작에 성공한 후 성공 메시지를 세션에 저장하면서 동시에 리다이렉트하는 것이 일반적입니다. 이때, 한 번에 메서드 체이닝을 통해 플래시 데이터와 리다이렉트 동작을 처리할 수 있습니다.

```
Route::post('/user/profile', function () {
    // ...

    return redirect('/dashboard')->with('status', 'Profile updated!');
});
```

사용자가 리다이렉트된 후에는 [세션](/docs/11.x/session)에 저장된 메시지를 출력할 수 있습니다. 예를 들어, [Blade](/docs/11.x/blade) 문법을 사용하면 다음과 같습니다.

```
@if (session('status'))
    <div class="alert alert-success">
        {{ session('status') }}
    </div>
@endif
```

<a name="redirecting-with-input"></a>
#### 입력값 플래시와 함께 리다이렉트

`RedirectResponse` 인스턴스가 제공하는 `withInput` 메서드를 사용하면, 현재 요청의 입력값(input data)을 세션에 플래시하여 사용자가 다른 위치로 리다이렉트된 후에도 폼 데이터를 쉽게 복원할 수 있습니다. 보통 유효성 검증에 실패한 경우 이 방법을 사용합니다. 입력값이 세션에 저장되면, 다음 요청에서 [입력값 가져오기](/docs/11.x/requests#retrieving-old-input)가 간편해집니다.

```
return back()->withInput();
```

<a name="other-response-types"></a>
## 기타 응답 타입

`response` 헬퍼를 사용하면 다양한 형태의 응답 인스턴스를 생성할 수 있습니다. 인자를 전달하지 않고 호출하면, `Illuminate\Contracts\Routing\ResponseFactory` [컨트랙트](/docs/11.x/contracts)의 구현체가 반환됩니다. 이 컨트랙트는 여러 편리한 응답 생성 메서드를 제공합니다.

<a name="view-responses"></a>
### 뷰 응답

HTTP 상태 코드와 헤더를 제어하면서 [뷰](/docs/11.x/views)를 응답 본문으로 반환해야 할 때는 `view` 메서드를 사용할 수 있습니다.

```
return response()
    ->view('hello', $data, 200)
    ->header('Content-Type', $type);
```

물론, 상태 코드나 헤더의 커스터마이징이 불필요하다면 글로벌 `view` 헬퍼 함수만 사용해도 충분합니다.

<a name="json-responses"></a>
### JSON 응답

`json` 메서드는 `Content-Type` 헤더를 자동으로 `application/json`으로 설정하고, 전달된 배열을 PHP의 `json_encode` 함수로 JSON 문자열로 변환합니다.

```
return response()->json([
    'name' => 'Abigail',
    'state' => 'CA',
]);
```

JSONP 응답이 필요하다면, `json` 메서드와 함께 `withCallback` 메서드를 조합해 사용할 수 있습니다.

```
return response()
    ->json(['name' => 'Abigail', 'state' => 'CA'])
    ->withCallback($request->input('callback'));
```

<a name="file-downloads"></a>
### 파일 다운로드

`download` 메서드는 지정한 경로에 있는 파일을 사용자의 브라우저가 강제로 다운로드하도록 하는 응답을 생성합니다. 두 번째 인자로 파일 이름(다운로드시 사용자가 보는 이름), 세 번째 인자로 HTTP 헤더 배열을 전달할 수 있습니다.

```
return response()->download($pathToFile);

return response()->download($pathToFile, $name, $headers);
```

> [!WARNING]  
> 파일 다운로드를 관리하는 Symfony HttpFoundation은 다운로드 파일명이 반드시 ASCII 문자여야 한다는 점에 유의하세요.

<a name="file-responses"></a>
### 파일 응답

`file` 메서드는 지정한 파일(예: 이미지, PDF 등)을 사용자의 브라우저에 바로 표시하도록 응답을 생성합니다(다운로드가 아니라 바로 표시함). 첫 번째 인수로 절대 경로를, 두 번째 인수로 헤더 배열을 전달할 수 있습니다.

```
return response()->file($pathToFile);

return response()->file($pathToFile, $headers);
```

<a name="streamed-responses"></a>
### 스트림 응답

데이터를 생성하는 동시에 클라이언트로 전송(스트리밍)하면, 특히 굉장히 큰 응답을 다룰 때 메모리 사용량을 크게 줄이고 성능을 높일 수 있습니다. 스트림 응답을 이용하면 서버가 응답을 모두 준비하기 전에, 클라이언트가 데이터를 일부씩 받아 처리할 수 있습니다.

```
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
            sleep(2); // 청크 간 대기 시간 시뮬레이션...
        }
    }, 200, ['X-Accel-Buffering' => 'no']);
});
```

> [!NOTE]
> 라라벨 내부적으로는 PHP의 output buffering 기능을 활용합니다. 위 예제에서 볼 수 있듯, 버퍼링된 데이터를 클라이언트로 즉시 전달하려면 `ob_flush`와 `flush` 함수를 반드시 사용해야 합니다.

<a name="streamed-json-responses"></a>
#### 스트리밍 JSON 응답

JSON 데이터를 점진적으로(streaming) 전송해야 한다면 `streamJson` 메서드를 사용할 수 있습니다. 이 방법은 대용량 데이터를 자바스크립트 등에서 점차적으로 파싱 처리가 필요한 경우에 유용합니다.

```
use App\Models\User;

Route::get('/users.json', function () {
    return response()->streamJson([
        'users' => User::cursor(),
    ]);
});
```

<a name="event-streams"></a>
#### 이벤트 스트림

`eventStream` 메서드는 `text/event-stream` 콘텐츠 타입으로 서버-전송 이벤트(Server-Sent Events, SSE) 스트림 응답을 반환합니다. 이 메서드는 클로저를 받아 그 안에서 [yield](https://www.php.net/manual/en/language.generators.overview.php)를 사용해 이벤트 데이터를 순차적으로 전송할 수 있습니다.

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

프론트엔드에서는 [EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource) 객체를 통해 이 이벤트 스트림을 구독할 수 있습니다. 스트림이 모두 종료되면, `eventStream` 메서드가 자동으로 `</stream>` 업데이트 메시지를 전송합니다.

```js
const source = new EventSource('/chat');

source.addEventListener('update', (event) => {
    if (event.data === '</stream>') {
        source.close();

        return;
    }

    console.log(event.data);
})
```

<a name="streamed-downloads"></a>
#### 스트리밍 다운로드

작업 결과로 생성된 문자열 응답을 파일로 저장하지 않고 바로 다운로드 가능한 응답으로 만들고 싶을 때는 `streamDownload` 메서드를 사용할 수 있습니다. 이 메서드는 콜백, 파일명, 그리고 옵션으로 헤더 배열을 인자로 받습니다.

```
use App\Services\GitHub;

return response()->streamDownload(function () {
    echo GitHub::api('repo')
        ->contents()
        ->readme('laravel', 'laravel')['contents'];
}, 'laravel-readme.md');
```

<a name="response-macros"></a>
## 응답 매크로

특정한 응답 형식을 여러 라우트나 컨트롤러에서 반복적으로 사용하고 싶다면, `Response` 파사드의 `macro` 메서드를 이용해 사용자 정의 응답 매크로를 등록할 수 있습니다. 보통 이 메서드는 애플리케이션의 [서비스 프로바이더](/docs/11.x/providers) 중 하나(예: `App\Providers\AppServiceProvider`)의 `boot` 메서드에서 호출합니다.

```
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

`macro` 함수는 첫 번째 인자로 매크로의 이름, 두 번째 인자로 클로저를 받습니다. 등록된 매크로는 `ResponseFactory`의 구현 또는 `response` 헬퍼에서 해당 이름으로 호출할 수 있습니다.

```
return response()->caps('foo');
```
