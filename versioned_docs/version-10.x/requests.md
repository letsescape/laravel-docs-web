# HTTP 요청 (HTTP Requests)

- [소개](#introduction)
- [요청과 상호작용하기](#interacting-with-the-request)
    - [요청 인스턴스 접근하기](#accessing-the-request)
    - [요청 경로, 호스트, 메서드](#request-path-and-method)
    - [요청 헤더](#request-headers)
    - [요청 IP 주소](#request-ip-address)
    - [콘텐츠 협상](#content-negotiation)
    - [PSR-7 요청](#psr7-requests)
- [입력값(Input)](#input)
    - [입력값 가져오기](#retrieving-input)
    - [입력값 존재 여부 확인](#input-presence)
    - [입력값 추가 병합](#merging-additional-input)
    - [이전 입력값(Old Input)](#old-input)
    - [쿠키](#cookies)
    - [입력값 트리밍 및 정규화](#input-trimming-and-normalization)
- [파일](#files)
    - [업로드된 파일 가져오기](#retrieving-uploaded-files)
    - [업로드된 파일 저장하기](#storing-uploaded-files)
- [신뢰할 수 있는 프록시 설정](#configuring-trusted-proxies)
- [신뢰할 수 있는 호스트 설정](#configuring-trusted-hosts)

<a name="introduction"></a>
## 소개

Laravel의 `Illuminate\Http\Request` 클래스는 현재 애플리케이션에서 처리 중인 HTTP 요청에 객체 지향 방식으로 접근할 수 있도록 해줍니다. 또한, 요청과 함께 제출된 입력값, 쿠키, 파일에 접근할 수 있습니다.

<a name="interacting-with-the-request"></a>
## 요청과 상호작용하기

<a name="accessing-the-request"></a>
### 요청 인스턴스 접근하기

현재 HTTP 요청 인스턴스를 의존성 주입을 통해 받으려면, 라우트 클로저 또는 컨트롤러 메서드에서 `Illuminate\Http\Request` 클래스를 타입 힌트로 지정하면 됩니다. 들어오는 요청 인스턴스는 Laravel [서비스 컨테이너](/docs/10.x/container)에 의해 자동으로 주입됩니다.

```
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * 새로운 사용자를 저장합니다.
     */
    public function store(Request $request): RedirectResponse
    {
        $name = $request->input('name');

        // 사용자 저장...

        return redirect('/users');
    }
}
```

앞서 언급한 것처럼, 라우트 클로저에서도 `Illuminate\Http\Request` 클래스를 타입 힌트로 사용할 수 있습니다. 서비스 컨테이너가 클로저를 실행할 때 요청 인스턴스를 자동으로 주입해줍니다.

```
use Illuminate\Http\Request;

Route::get('/', function (Request $request) {
    // ...
});
```

<a name="dependency-injection-route-parameters"></a>
#### 의존성 주입과 라우트 파라미터

컨트롤러 메서드가 라우트 파라미터도 함께 받을 경우, 라우트 파라미터는 다른 의존성 뒤에 나열해야 합니다. 예를 들어, 라우트가 다음과 같이 정의되어 있다면,

```
use App\Http\Controllers\UserController;

Route::put('/user/{id}', [UserController::class, 'update']);
```

컨트롤러 메서드에서는 `Illuminate\Http\Request`를 타입 힌트로 받고, `id` 라우트 파라미터도 함께 받을 수 있습니다.

```
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * 지정한 사용자를 업데이트합니다.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        // 사용자 업데이트...

        return redirect('/users');
    }
}
```

<a name="request-path-and-method"></a>
### 요청 경로, 호스트, 메서드

`Illuminate\Http\Request` 인스턴스에는 들어오는 HTTP 요청을 검사할 수 있는 다양한 메서드가 있습니다. 이 클래스는 `Symfony\Component\HttpFoundation\Request`를 확장합니다. 여기서는 가장 중요한 몇 가지 메서드를 살펴보겠습니다.

<a name="retrieving-the-request-path"></a>
#### 요청 경로 가져오기

`path` 메서드는 요청의 경로 정보를 반환합니다. 예를 들어, 들어오는 요청이 `http://example.com/foo/bar`라면, `path` 메서드는 `foo/bar`를 반환합니다.

```
$uri = $request->path();
```

<a name="inspecting-the-request-path"></a>
#### 요청 경로/라우트 검사

`is` 메서드를 사용하면, 들어온 요청의 경로가 특정 패턴과 일치하는지 확인할 수 있습니다. 이때 `*` 문자를 와일드카드로 사용할 수 있습니다.

```
if ($request->is('admin/*')) {
    // ...
}
```

`routeIs` 메서드를 사용하면, 요청이 [이름이 지정된 라우트](/docs/10.x/routing#named-routes)에 매칭되는지 확인할 수 있습니다.

```
if ($request->routeIs('admin.*')) {
    // ...
}
```

<a name="retrieving-the-request-url"></a>
#### 요청 URL 가져오기

들어온 요청의 전체 URL을 가져오려면 `url` 또는 `fullUrl` 메서드를 사용할 수 있습니다. `url` 메서드는 쿼리 스트링을 제외한 URL을, `fullUrl` 메서드는 쿼리 스트링을 포함한 URL을 반환합니다.

```
$url = $request->url();

$urlWithQueryString = $request->fullUrl();
```

현재 URL에 쿼리 문자열 데이터를 합치려면, `fullUrlWithQuery` 메서드를 사용할 수 있습니다. 이 메서드는 전달한 배열의 쿼리 문자열 데이터를 기존 쿼리스트링과 병합합니다.

```
$request->fullUrlWithQuery(['type' => 'phone']);
```

특정 쿼리 스트링 파라미터를 제외한 현재 URL을 얻으려면 `fullUrlWithoutQuery` 메서드를 사용합니다.

```php
$request->fullUrlWithoutQuery(['type']);
```

<a name="retrieving-the-request-host"></a>
#### 요청 호스트 가져오기

들어온 요청의 "host" 정보는 `host`, `httpHost`, `schemeAndHttpHost` 메서드를 통해 가져올 수 있습니다.

```
$request->host();
$request->httpHost();
$request->schemeAndHttpHost();
```

<a name="retrieving-the-request-method"></a>
#### 요청 메서드 가져오기

`method` 메서드는 요청의 HTTP 메서드(verb)를 반환합니다. 또한 `isMethod` 메서드로 특정 HTTP 메서드와 일치하는지 확인할 수 있습니다.

```
$method = $request->method();

if ($request->isMethod('post')) {
    // ...
}
```

<a name="request-headers"></a>
### 요청 헤더

`Illuminate\Http\Request` 인스턴스의 `header` 메서드를 이용하여 요청 헤더 값을 가져올 수 있습니다. 해당하는 헤더가 없으면 `null`이 반환됩니다. 단, 두 번째 인자를 지정하면 헤더가 없을 때 해당 값을 반환합니다.

```
$value = $request->header('X-Header-Name');

$value = $request->header('X-Header-Name', 'default');
```

`hasHeader` 메서드를 사용하면 요청에 특정 헤더가 있는지 확인할 수 있습니다.

```
if ($request->hasHeader('X-Header-Name')) {
    // ...
}
```

편의를 위해 `Authorization` 헤더에서 bearer 토큰을 가져오는 `bearerToken` 메서드도 사용할 수 있습니다. 해당 헤더가 없으면 빈 문자열이 반환됩니다.

```
$token = $request->bearerToken();
```

<a name="request-ip-address"></a>
### 요청 IP 주소

`ip` 메서드를 사용하면 요청을 보낸 클라이언트의 IP 주소를 얻을 수 있습니다.

```
$ipAddress = $request->ip();
```

프록시를 거쳐 전달된 모든 클라이언트 IP 주소의 배열이 필요하다면 `ips` 메서드를 사용할 수 있습니다. 배열의 맨 마지막이 "실제" 클라이언트 IP입니다.

```
$ipAddresses = $request->ips();
```

일반적으로 IP 주소는 신뢰할 수 없는, 사용자가 제어하는 입력값이므로 참고용으로만 사용해야 합니다.

<a name="content-negotiation"></a>
### 콘텐츠 협상

Laravel은 요청의 `Accept` 헤더를 통해 원하는 콘텐츠 타입을 검사할 수 있는 여러 메서드를 제공합니다. 우선, `getAcceptableContentTypes` 메서드는 요청에서 허용하는 모든 콘텐츠 타입의 배열을 반환합니다.

```
$contentTypes = $request->getAcceptableContentTypes();
```

`accepts` 메서드는 전달한 콘텐츠 타입 배열 중 하나라도 요청이 받아들인다면 `true`를 반환하고, 그렇지 않으면 `false`를 반환합니다.

```
if ($request->accepts(['text/html', 'application/json'])) {
    // ...
}
```

여러 콘텐츠 타입 중 요청이 가장 선호하는 타입을 알고 싶다면 `prefers` 메서드를 사용하세요. 만약 해당 배열 내에서 요청이 받아들이는 타입이 없다면 `null`이 반환됩니다.

```
$preferred = $request->prefers(['text/html', 'application/json']);
```

대부분의 애플리케이션이 HTML 또는 JSON만을 반환한다면, 요청이 JSON 응답을 원하는지 `expectsJson` 메서드로 간단히 검사할 수 있습니다.

```
if ($request->expectsJson()) {
    // ...
}
```

<a name="psr7-requests"></a>
### PSR-7 요청

[PSR-7 표준](https://www.php-fig.org/psr/psr-7/)은 HTTP 메시지(요청 및 응답)를 위한 인터페이스를 정의합니다. 라라벨 요청 대신 PSR-7 요청 인스턴스를 받고 싶다면, 먼저 몇 가지 라이브러리를 설치해야 합니다. Laravel은 *Symfony HTTP Message Bridge* 컴포넌트를 이용해 일반적인 요청 및 응답을 PSR-7 호환 구현체로 변환합니다.

```shell
composer require symfony/psr-http-message-bridge
composer require nyholm/psr7
```

이 라이브러리를 설치하면, 라우트 클로저나 컨트롤러 메서드에서 PSR-7 요청 인터페이스를 타입 힌트로 사용할 수 있습니다.

```
use Psr\Http\Message\ServerRequestInterface;

Route::get('/', function (ServerRequestInterface $request) {
    // ...
});
```

> [!NOTE]
> 라우트나 컨트롤러에서 PSR-7 응답 인스턴스를 반환하는 경우, 프레임워크에 의해 자동으로 다시 라라벨 응답 인스턴스로 변환되어 화면에 표시됩니다.

<a name="input"></a>
## 입력값(Input)

<a name="retrieving-input"></a>
### 입력값 가져오기

<a name="retrieving-all-input-data"></a>
#### 모든 입력값 가져오기

들어온 요청의 모든 입력값을 `array`로 가져오려면 `all` 메서드를 사용하세요. 이 메서드는 HTML 폼 또는 XHR 요청 구분 없이 사용할 수 있습니다.

```
$input = $request->all();
```

`collect` 메서드를 사용하면 요청의 모든 입력값을 [컬렉션](/docs/10.x/collections)으로도 가져올 수 있습니다.

```
$input = $request->collect();
```

또한 `collect` 메서드는 일부 입력만 컬렉션으로 가져올 수도 있습니다.

```
$request->collect('users')->each(function (string $user) {
    // ...
});
```

<a name="retrieving-an-input-value"></a>
#### 개별 입력값 가져오기

간단한 여러 메서드를 통해, 요청 방식(GET, POST 등)에 상관없이 `Illuminate\Http\Request` 인스턴스에서 사용자의 입력값에 접근할 수 있습니다. `input` 메서드는 HTTP 메서드에 상관없이 값을 가져옵니다.

```
$name = $request->input('name');
```

두 번째 인자에 기본값을 지정하면 입력값이 없을 때 기본값을 반환합니다.

```
$name = $request->input('name', 'Sally');
```

배열 입력값이 포함된 폼일 경우에는 "dot" 표기법을 사용해 각 배열 원소에 접근할 수 있습니다.

```
$name = $request->input('products.0.name');

$names = $request->input('products.*.name');
```

아무 인자 없이 `input` 메서드를 호출하면, 모든 입력값을 연관 배열로 반환합니다.

```
$input = $request->input();
```

<a name="retrieving-input-from-the-query-string"></a>
#### 쿼리 문자열에서 입력값 가져오기

`input` 메서드는 요청 전체 페이로드(쿼리 문자열 포함)에서 값을 가져오지만, `query` 메서드는 오직 쿼리 문자열에서만 값을 가져옵니다.

```
$name = $request->query('name');
```

해당 쿼리 스트링 값이 없을 때 두 번째 인자 값이 반환됩니다.

```
$name = $request->query('name', 'Helen');
```

`query` 메서드를 아무 인자 없이 호출하면, 모든 쿼리 문자열 값을 연관 배열로 반환합니다.

```
$query = $request->query();
```

<a name="retrieving-json-input-values"></a>
#### JSON 입력값 가져오기

애플리케이션으로 JSON 요청이 들어올 때, 요청의 `Content-Type` 헤더가 `application/json`으로 올바르게 설정되어 있다면 `input` 메서드를 통해 JSON 데이터에 접근할 수 있습니다. "dot" 표기법으로 JSON 배열/객체 내부 값도 꺼낼 수 있습니다.

```
$name = $request->input('user.name');
```

<a name="retrieving-stringable-input-values"></a>
#### Stringable 입력값 가져오기

입력값을 `string` 타입이 아닌 [`Illuminate\Support\Stringable`](/docs/10.x/helpers#fluent-strings) 객체로 받고 싶다면, `string` 메서드를 이용하세요.

```
$name = $request->string('name')->trim();
```

<a name="retrieving-boolean-input-values"></a>
#### 불리언(참/거짓) 입력값 가져오기

체크박스 같은 HTML 요소를 처리할 때, `true`, `on`과 같이 '참'을 나타내는 문자열이 넘어올 때가 많습니다. `boolean` 메서드는 이러한 값을 bool로 변환합니다. `1`, `"1"`, `true`, `"true"`, `"on"`, `"yes"`는 모두 `true`로, 나머지는 모두 `false`로 처리됩니다.

```
$archived = $request->boolean('archived');
```

<a name="retrieving-date-input-values"></a>
#### 날짜(Date) 입력값 가져오기

날짜/시간 값을 입력받을 때 편리하게 `date` 메서드로 입력값을 [Carbon](https://carbon.nesbot.com/) 인스턴스로 변환해 가져올 수 있습니다. 값이 없으면 `null`이 반환됩니다.

```
$birthday = $request->date('birthday');
```

날짜 포맷과 타임존을 두 번째, 세 번째 인자로 지정할 수도 있습니다.

```
$elapsed = $request->date('elapsed', '!H:i', 'Europe/Madrid');
```

입력값이 존재하지만 포맷이 틀렸다면 `InvalidArgumentException`이 발생하니, 사용 전에 반드시 유효성 검증을 하는 것이 좋습니다.

<a name="retrieving-enum-input-values"></a>
#### Enum 입력값 가져오기

[PHP enum](https://www.php.net/manual/en/language.types.enumerations.php)과 연결되는 입력값도 요청에서 받아올 수 있습니다. 해당 이름의 입력값이 없거나 enum의 값과 일치하는 백킹 값이 없다면 `null`이 반환됩니다. `enum` 메서드는 입력값의 이름과 enum 클래스를 첫 번째, 두 번째 인자로 받습니다.

```
use App\Enums\Status;

$status = $request->enum('status', Status::class);
```

<a name="retrieving-input-via-dynamic-properties"></a>
#### 동적 프로퍼티(Dynamic Property)로 입력값 가져오기

`Illuminate\Http\Request` 인스턴스에서 동적 프로퍼티 방식으로도 입력값에 접근할 수 있습니다. 예를 들어, 폼에 `name` 필드가 있다면 아래처럼 값을 얻을 수 있습니다.

```
$name = $request->name;
```

동적 프로퍼티를 사용할 때 Laravel은 먼저 요청 페이로드(입력값)에서 값을 찾고, 없으면 매칭된 라우트의 파라미터에서 값을 찾습니다.

<a name="retrieving-a-portion-of-the-input-data"></a>
#### 일부 입력값만 가져오기

입력값 중 일부만 가져오고 싶다면 `only`와 `except` 메서드를 사용할 수 있습니다. 두 메서드는 배열이나 여러 인자를 받을 수 있습니다.

```
$input = $request->only(['username', 'password']);

$input = $request->only('username', 'password');

$input = $request->except(['credit_card']);

$input = $request->except('credit_card');
```

> [!WARNING]
> `only` 메서드는 요청에 실제로 존재하는 key/value 쌍만 반환합니다. 요청에 없는 키에 대해서는 값을 반환하지 않습니다.

<a name="input-presence"></a>
### 입력값 존재 여부 확인

입력값이 요청에 포함되어 있는지 확인하려면 `has` 메서드를 사용하세요. 값이 있으면 `true`를 반환합니다.

```
if ($request->has('name')) {
    // ...
}
```

배열을 전달하면 지정된 모든 값이 요청에 있을 경우에만 `true`를 반환합니다.

```
if ($request->has(['name', 'email'])) {
    // ...
}
```

`hasAny` 메서드를 사용하면 지정된 값 중 하나라도 요청에 있으면 `true`를 반환합니다.

```
if ($request->hasAny(['name', 'email'])) {
    // ...
}
```

`whenHas` 메서드는 지정한 값이 존재할 때만 클로저를 실행합니다.

```
$request->whenHas('name', function (string $input) {
    // ...
});
```

값이 없을 때 실행할 두 번째 클로저를 지정할 수도 있습니다.

```
$request->whenHas('name', function (string $input) {
    // "name" 값이 존재합니다...
}, function () {
    // "name" 값이 존재하지 않습니다...
});
```

값이 존재하고 비어있지 않은(빈 문자열 아님) 경우를 판단하려면 `filled` 메서드를 사용하세요.

```
if ($request->filled('name')) {
    // ...
}
```

여러 값 중 하나라도 비어있지 않으면 `anyFilled`가 `true`를 반환합니다.

```
if ($request->anyFilled(['name', 'email'])) {
    // ...
}
```

`whenFilled` 메서드는 값이 존재하며 비어있지 않을 때 주어진 클로저를 실행합니다.

```
$request->whenFilled('name', function (string $input) {
    // ...
});
```

값이 비어있을 때 실행할 두 번째 클로저도 지정할 수 있습니다.

```
$request->whenFilled('name', function (string $input) {
    // "name" 값이 비어있지 않습니다...
}, function () {
    // "name" 값이 비어있습니다...
});
```

요청에 특정 키가 없음을 확인하려면 `missing`과 `whenMissing` 메서드를 사용할 수 있습니다.

```
if ($request->missing('name')) {
    // ...
}

$request->whenMissing('name', function (array $input) {
    // "name" 값이 누락되었습니다...
}, function () {
    // "name" 값이 존재합니다...
});
```

<a name="merging-additional-input"></a>
### 입력값 추가 병합

가끔, 요청의 기존 입력값에 추가로 값을 직접 병합하고 싶을 때가 있습니다. 이럴 때는 `merge` 메서드를 사용하면 됩니다. 이미 존재하는 입력값이면 전달한 데이터로 덮어씁니다.

```
$request->merge(['votes' => 0]);
```

`mergeIfMissing` 메서드는 주어진 키가 이미 요청 입력값에 존재하지 않을 때만 값을 병합합니다.

```
$request->mergeIfMissing(['votes' => 0]);
```

<a name="old-input"></a>
### 이전 입력값(Old Input)

Laravel에서는 이전 요청의 입력값을 다음 요청까지 유지할 수 있습니다. 이 기능은 주로 유효성 검증 후 폼 입력값을 다시 채우고 싶을 때 매우 유용합니다. 다만, Laravel의 [유효성 검증](/docs/10.x/validation) 기능을 사용한다면, 해당 기능이 내부적으로 이 입력값 저장(플래시) 과정을 자동으로 처리하므로 직접 호출할 필요가 없을 수 있습니다.

<a name="flashing-input-to-the-session"></a>
#### 입력값을 세션에 플래시(Flash)하기

`Illuminate\Http\Request` 클래스의 `flash` 메서드는 현재 입력값을 [세션](/docs/10.x/session)에 저장(플래시)하여 다음 요청에서도 사용할 수 있게 해줍니다.

```
$request->flash();
```

`flashOnly`와 `flashExcept` 메서드를 사용하면 일부 데이터만 선택적으로 세션에 플래시할 수 있습니다. 예를 들어 비밀번호와 같은 민감한 정보는 세션에 저장하지 않을 때 유용합니다.

```
$request->flashOnly(['username', 'email']);

$request->flashExcept('password');
```

<a name="flashing-input-then-redirecting"></a>
#### 입력값 플래시 후 리다이렉트

입력값을 세션에 플래시한 뒤 바로 이전 페이지로 리다이렉트할 때가 많은데, 이때는 `withInput` 메서드를 체이닝해서 사용할 수 있습니다.

```
return redirect('form')->withInput();

return redirect()->route('user.create')->withInput();

return redirect('form')->withInput(
    $request->except('password')
);
```

<a name="retrieving-old-input"></a>
#### 이전 입력값 가져오기

이전 요청에서 플래시된 입력값을 가져오려면, `Illuminate\Http\Request` 인스턴스의 `old` 메서드를 호출하세요. 이 메서드는 [세션](/docs/10.x/session)에 저장된 이전 입력값을 반환합니다.

```
$username = $request->old('username');
```

또한 Laravel에서는 전역 `old` 헬퍼도 제공됩니다. [Blade 템플릿](/docs/10.x/blade)에서 폼에 이전 값을 다시 채울 때 이 헬퍼를 사용하는 것이 더 편리합니다. 만약 해당 필드에 이전 값이 없으면 `null`이 반환됩니다.

```
<input type="text" name="username" value="{{ old('username') }}">
```

<a name="cookies"></a>
### 쿠키

<a name="retrieving-cookies-from-requests"></a>
#### 요청에서 쿠키 값 가져오기

Laravel에서 생성된 모든 쿠키는 암호화 및 인증 코드로 서명되어 있기 때문에, 클라이언트에서 쿠키가 변경되면 무효 처리됩니다. 요청에서 쿠키 값을 가져오려면 `Illuminate\Http\Request` 인스턴스의 `cookie` 메서드를 사용하십시오.

```
$value = $request->cookie('name');
```

<a name="input-trimming-and-normalization"></a>
## 입력값 트리밍 및 정규화

Laravel에서는 기본적으로 `App\Http\Middleware\TrimStrings`와 `Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull` 미들웨어를 전체 글로벌 미들웨어 스택에 포함시킵니다. 이 미들웨어들은 `App\Http\Kernel` 클래스의 `$middleware` 배열에 등록되어 있습니다. 즉, 이 미들웨어들은 들어오는 모든 요청의 문자열 필드를 자동으로 trim(양쪽 공백 제거)하고, 빈 문자열을 `null`로 변환해줍니다. 따라서 라우트나 컨트롤러에서 이 부분을 신경 쓸 필요가 없습니다.

#### 입력값 정규화 비활성화

모든 요청에서 이 동작을 끄고 싶다면, 두 미들웨어를 `App\Http\Kernel` 클래스의 `$middleware` 속성에서 제거하면 됩니다.

특정 요청에 대해서만 문자열 트리밍 또는 빈 문자열 변환을 비활성화하고 싶다면, 각 미들웨어가 제공하는 `skipWhen` 메서드를 사용할 수 있습니다. 클로저를 인자로 받아, 정규화를 건너뛸지(`true`/`false`) 판단합니다. 일반적으로 이 메서드는 애플리케이션의 `AppServiceProvider`의 `boot` 메서드 내부에서 설정합니다.

```php
use App\Http\Middleware\TrimStrings;
use Illuminate\Http\Request;
use Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull;

/**
 * 애플리케이션 서비스 부트스트랩.
 */
public function boot(): void
{
    TrimStrings::skipWhen(function (Request $request) {
        return $request->is('admin/*');
    });

    ConvertEmptyStringsToNull::skipWhen(function (Request $request) {
        // ...
    });
}
```

<a name="files"></a>
## 파일

<a name="retrieving-uploaded-files"></a>
### 업로드된 파일 가져오기

`Illuminate\Http\Request` 인스턴스의 `file` 메서드나 동적 프로퍼티를 통해 업로드된 파일을 가져올 수 있습니다. `file` 메서드는 PHP의 `SplFileInfo`를 확장한 `Illuminate\Http\UploadedFile` 인스턴스를 반환하며, 파일과 상호작용할 수 있는 다양한 메서드를 제공합니다.

```
$file = $request->file('photo');

$file = $request->photo;
```

업로드된 파일이 요청에 포함되어 있는지 확인하려면 `hasFile` 메서드를 사용하세요.

```
if ($request->hasFile('photo')) {
    // ...
}
```

<a name="validating-successful-uploads"></a>
#### 업로드 성공 여부 확인

파일이 실제로 잘 업로드되었는지를 확인하려면 `isValid` 메서드를 호출하면 됩니다.

```
if ($request->file('photo')->isValid()) {
    // ...
}
```

<a name="file-paths-extensions"></a>
#### 파일 경로 및 확장자

`UploadedFile` 클래스에는 파일의 전체 경로와 확장자 정보를 얻을 수 있는 메서드도 있습니다. `extension` 메서드는 파일 내용을 기반으로 확장자를 추측하며, 이는 클라이언트가 제공한 확장자와 다를 수 있습니다.

```
$path = $request->photo->path();

$extension = $request->photo->extension();
```

<a name="other-file-methods"></a>
#### 기타 파일 메서드

`UploadedFile` 인스턴스에는 이 외에도 다양한 메서드가 있습니다. 보다 자세한 정보는 [클래스의 API 문서](https://github.com/symfony/symfony/blob/6.0/src/Symfony/Component/HttpFoundation/File/UploadedFile.php)를 참조하세요.

<a name="storing-uploaded-files"></a>
### 업로드된 파일 저장하기

업로드된 파일을 저장하려면, 보통 미리 설정해둔 [파일 시스템](/docs/10.x/filesystem)을 사용하게 됩니다. `UploadedFile` 클래스의 `store` 메서드는 업로드된 파일을 로컬 디스크 또는 Amazon S3와 같은 클라우드 저장소에 옮길 수 있습니다.

`store` 메서드에는 파일을 저장할 경로(파일 이름은 제외, 파일 시스템의 루트에서 상대 경로)를 지정해야 합니다. 파일 이름은 자동으로 고유값이 생성되어 사용됩니다.

또한 저장할 디스크 이름을 두 번째 인자로 전달할 수도 있습니다. 이 메서드는 디스크의 루트 기준 저장 경로를 반환합니다.

```
$path = $request->photo->store('images');

$path = $request->photo->store('images', 's3');
```

파일 이름을 직접 지정하려면, `storeAs` 메서드를 사용하면 됩니다. 이 메서드는 경로, 파일명, 디스크명을 인자로 받습니다.

```
$path = $request->photo->storeAs('images', 'filename.jpg');

$path = $request->photo->storeAs('images', 'filename.jpg', 's3');
```

> [!NOTE]
> 라라벨 파일 저장에 관해 더 많은 정보가 필요하다면, [파일 저장소 문서](/docs/10.x/filesystem)를 참고하세요.

<a name="configuring-trusted-proxies"></a>
## 신뢰할 수 있는 프록시 설정

로드 밸런서를 통해 TLS/SSL 인증서가 종료되는 환경에서, `url` 헬퍼로 링크를 생성할 때 애플리케이션이 HTTPS 링크를 만들지 않는 문제가 발생할 수 있습니다. 이는 주로 로드 밸런서가 포트 80으로 트래픽을 전달하기 때문이며, 이로 인해 애플리케이션이 보안 링크 생성을 알아채지 못하는 상황이 생깁니다.

이런 경우에는 라라벨 애플리케이션에 포함된 `App\Http\Middleware\TrustProxies` 미들웨어를 설정하세요. 이 미들웨어는 애플리케이션에서 신뢰할 로드 밸런서 또는 프록시를 간편하게 지정할 수 있게 해줍니다. 신뢰할 프록시는 이 미들웨어의 `$proxies` 속성에 배열로 지정하며, 신뢰할 프록시 `$headers`도 별도로 지정할 수 있습니다.

```
<?php

namespace App\Http\Middleware;

use Illuminate\Http\Middleware\TrustProxies as Middleware;
use Illuminate\Http\Request;

class TrustProxies extends Middleware
{
    /**
     * 이 애플리케이션의 신뢰할 수 있는 프록시 목록입니다.
     *
     * @var string|array
     */
    protected $proxies = [
        '192.168.1.1',
        '192.168.1.2',
    ];

    /**
     * 프록시를 감지할 때 사용할 헤더입니다.
     *
     * @var int
     */
    protected $headers = Request::HEADER_X_FORWARDED_FOR | Request::HEADER_X_FORWARDED_HOST | Request::HEADER_X_FORWARDED_PORT | Request::HEADER_X_FORWARDED_PROTO;
}
```

> [!NOTE]
> AWS Elastic Load Balancing을 사용한다면, `$headers` 값은 `Request::HEADER_X_FORWARDED_AWS_ELB`여야 합니다. `$headers` 속성에 사용 가능한 상수에 대한 자세한 내용은 Symfony의 [프록시 신뢰 문서](https://symfony.com/doc/current/deployment/proxies.html)를 참고하세요.

<a name="trusting-all-proxies"></a>
#### 모든 프록시 신뢰

Amazon AWS 등 클라우드 로드 밸런서를 사용하는 경우, 실제 밸런서의 IP 주소를 알지 못할 수도 있습니다. 이럴 때는 `*`를 사용하여 모든 프록시를 신뢰할 수 있습니다.

```
/**
 * 이 애플리케이션의 신뢰할 수 있는 프록시 목록입니다.
 *
 * @var string|array
 */
protected $proxies = '*';
```

<a name="configuring-trusted-hosts"></a>
## 신뢰할 수 있는 호스트 설정

기본적으로 Laravel은 요청의 `Host` 헤더 값이 무엇이든 모든 요청에 응답합니다. 또한, 웹 요청에서 애플리케이션의 절대 URL을 생성할 때 `Host` 헤더 값을 사용합니다.

일반적으로 Nginx, Apache 등 웹 서버에서 지정한 호스트 이름과 일치하는 요청만 애플리케이션으로 전달하도록 설정해야 합니다. 다만, 웹 서버를 직접 제어할 수 없고 Laravel 자체적으로 특정 호스트에만 응답하고 싶다면, `App\Http\Middleware\TrustHosts` 미들웨어를 활성화하면 됩니다.

`TrustHosts` 미들웨어는 이미 `$middleware` 스택에 포함되어 있으니, 주석을 해제하면 바로 동작합니다. 미들웨어의 `hosts` 메서드에서 애플리케이션이 응답해야 할 호스트명을 지정할 수 있습니다. 나머지 `Host` 헤더 값으로 요청이 들어오면 거부됩니다.

```
/**
 * 신뢰할 호스트 패턴을 반환합니다.
 *
 * @return array<int, string>
 */
public function hosts(): array
{
    return [
        'laravel.test',
        $this->allSubdomainsOfApplicationUrl(),
    ];
}
```

`allSubdomainsOfApplicationUrl` 헬퍼 메서드는 애플리케이션의 `app.url` 설정값의 모든 서브도메인과 매칭되는 정규표현식을 반환합니다. 이 메서드는 와일드카드 서브도메인 기반 애플리케이션 구성 시 매우 편리하게 사용할 수 있습니다.
