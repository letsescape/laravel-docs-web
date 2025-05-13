# HTTP 요청 (HTTP Requests)

- [소개](#introduction)
- [요청과 상호작용하기](#interacting-with-the-request)
    - [요청 객체 접근하기](#accessing-the-request)
    - [요청 경로, 호스트, 메서드 확인하기](#request-path-and-method)
    - [요청 헤더](#request-headers)
    - [요청 IP 주소](#request-ip-address)
    - [콘텐츠 협상](#content-negotiation)
    - [PSR-7 요청 객체](#psr7-requests)
- [입력(Input)](#input)
    - [입력값 가져오기](#retrieving-input)
    - [입력 존재 여부 확인](#input-presence)
    - [추가 입력값 병합](#merging-additional-input)
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

라라벨의 `Illuminate\Http\Request` 클래스는 현재 애플리케이션에서 처리 중인 HTTP 요청 객체를 기반으로, 요청과 관련된 입력값, 쿠키, 업로드 파일을 객체 지향적으로 다룰 수 있게 해줍니다.

<a name="interacting-with-the-request"></a>
## 요청과 상호작용하기

<a name="accessing-the-request"></a>
### 요청 객체 접근하기

현재 HTTP 요청 인스턴스를 의존성 주입 방식으로 얻으려면, 라우트 클로저나 컨트롤러 메서드의 인자로 `Illuminate\Http\Request` 클래스를 타입힌트하면 됩니다. 요청 객체는 라라벨 [서비스 컨테이너](/docs/container)가 자동으로 주입해줍니다.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Store a new user.
     */
    public function store(Request $request): RedirectResponse
    {
        $name = $request->input('name');

        // Store the user...

        return redirect('/users');
    }
}
```

위에서 보았듯이, 라우트 클로저에서도 `Illuminate\Http\Request`를 타입힌트할 수 있습니다. 서비스 컨테이너가 해당 클로저를 실행할 때 요청 객체를 자동으로 주입해줍니다.

```php
use Illuminate\Http\Request;

Route::get('/', function (Request $request) {
    // ...
});
```

<a name="dependency-injection-route-parameters"></a>
#### 의존성 주입과 라우트 파라미터

컨트롤러 메서드에서 라우트 파라미터 입력도 받고 싶다면, 라우트 파라미터를 다른 의존성 뒤쪽에 작성하면 됩니다. 예를 들어, 아래와 같이 라우트가 정의되어 있다면:

```php
use App\Http\Controllers\UserController;

Route::put('/user/{id}', [UserController::class, 'update']);
```

컨트롤러 메서드 시그니처를 아래처럼 정의하면, `Illuminate\Http\Request`를 타입힌트해도 라우트 파라미터 `id`에 접근할 수 있습니다.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Update the specified user.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        // Update the user...

        return redirect('/users');
    }
}
```

<a name="request-path-and-method"></a>
### 요청 경로, 호스트, 메서드 확인하기

`Illuminate\Http\Request` 인스턴스는 다양한 HTTP 요청 정보를 확인할 수 있는 여러 메서드를 제공합니다. 이 클래스는 `Symfony\Component\HttpFoundation\Request` 클래스를 확장하며, 주요 메서드 사용법은 아래와 같습니다.

<a name="retrieving-the-request-path"></a>
#### 요청 경로 가져오기

`path` 메서드는 요청의 경로 정보를 반환합니다. 예를 들어, 들어온 요청이 `http://example.com/foo/bar`라면, `path` 메서드는 `foo/bar`를 반환합니다.

```php
$uri = $request->path();
```

<a name="inspecting-the-request-path"></a>
#### 요청 경로/라우트 검사하기

`is` 메서드를 사용하면, 들어온 요청 경로가 특정 패턴과 일치하는지 확인할 수 있습니다. 이때 `*` 문자를 와일드카드로 쓸 수 있습니다.

```php
if ($request->is('admin/*')) {
    // ...
}
```

`routeIs` 메서드를 사용하면, 들어온 요청이 [이름 있는 라우트](/docs/routing#named-routes)와 매칭되는지 확인할 수 있습니다.

```php
if ($request->routeIs('admin.*')) {
    // ...
}
```

<a name="retrieving-the-request-url"></a>
#### 요청 URL 가져오기

현재 요청의 전체 URL을 얻으려면 `url` 또는 `fullUrl` 메서드를 사용할 수 있습니다. `url`은 쿼리 문자열이 없는 URL, `fullUrl`은 쿼리 문자열을 포함한 전체 URL을 반환합니다.

```php
$url = $request->url();

$urlWithQueryString = $request->fullUrl();
```

현재 URL에 쿼리 스트링 데이터를 추가하고 싶다면, `fullUrlWithQuery` 메서드를 사용할 수 있습니다. 이 메서드는 전달한 쿼리 파라미터 배열을 기존 쿼리 스트링과 병합해줍니다.

```php
$request->fullUrlWithQuery(['type' => 'phone']);
```

특정 쿼리 파라미터를 제외한 현재 URL을 얻고 싶다면, `fullUrlWithoutQuery` 메서드를 이용하면 됩니다.

```php
$request->fullUrlWithoutQuery(['type']);
```

<a name="retrieving-the-request-host"></a>
#### 요청 호스트 정보 가져오기

들어온 요청의 "호스트" 정보는 `host`, `httpHost`, `schemeAndHttpHost` 메서드로 확인할 수 있습니다.

```php
$request->host();
$request->httpHost();
$request->schemeAndHttpHost();
```

<a name="retrieving-the-request-method"></a>
#### 요청 메서드 가져오기

`method` 메서드는 요청의 HTTP 메서드(동사)를 반환합니다. `isMethod` 메서드로 해당 HTTP 메서드가 특정 문자열과 일치하는지도 검사할 수 있습니다.

```php
$method = $request->method();

if ($request->isMethod('post')) {
    // ...
}
```

<a name="request-headers"></a>
### 요청 헤더

`Illuminate\Http\Request` 인스턴스에서 `header` 메서드를 사용하여 요청 헤더 값을 가져올 수 있습니다. 해당 헤더가 없으면 `null`이 반환되며, 두 번째 인자로 기본값을 지정할 수 있습니다.

```php
$value = $request->header('X-Header-Name');

$value = $request->header('X-Header-Name', 'default');
```

`hasHeader` 메서드로 특정 헤더가 요청에 존재하는지 확인할 수 있습니다.

```php
if ($request->hasHeader('X-Header-Name')) {
    // ...
}
```

편의를 위해, `bearerToken` 메서드를 사용해 `Authorization` 헤더에서 bearer 토큰을 바로 가져올 수 있습니다. 해당 헤더가 없으면 빈 문자열이 반환됩니다.

```php
$token = $request->bearerToken();
```

<a name="request-ip-address"></a>
### 요청 IP 주소

`ip` 메서드로 요청을 보낸 클라이언트의 IP 주소를 가져올 수 있습니다.

```php
$ipAddress = $request->ip();
```

프록시 등을 거쳐 전달된, 모든 클라이언트 IP 주소 배열을 얻으려면 `ips` 메서드를 사용합니다. 배열의 마지막 값이 "원본" 클라이언트 IP입니다.

```php
$ipAddresses = $request->ips();
```

일반적으로, IP 주소는 신뢰할 수 없는 사용자 입력으로 간주해야 하며 정보 용도로만 사용해야 합니다.

<a name="content-negotiation"></a>
### 콘텐츠 협상

라라벨은 요청의 `Accept` 헤더를 통해, 클라이언트가 원하는 콘텐츠 타입을 쉽게 확인할 수 있는 여러 메서드를 제공합니다. 먼저, `getAcceptableContentTypes` 메서드는 요청이 허용하는 모든 콘텐츠 타입의 배열을 반환합니다.

```php
$contentTypes = $request->getAcceptableContentTypes();
```

`accepts` 메서드는 여러 콘텐츠 타입 중 하나라도 요청에서 허용되면 `true`를 반환하며, 그렇지 않으면 `false`입니다.

```php
if ($request->accepts(['text/html', 'application/json'])) {
    // ...
}
```

`prefers` 메서드는 특정 콘텐츠 타입 배열 중 가장 요청에 선호되는 타입을 반환합니다. 어느 것도 허용되지 않으면 `null`을 반환합니다.

```php
$preferred = $request->prefers(['text/html', 'application/json']);
```

일반적으로 응답이 HTML 또는 JSON 중 하나인 애플리케이션이라면 `expectsJson` 메서드를 통해 요청이 JSON을 기대하는지 빠르게 확인할 수 있습니다.

```php
if ($request->expectsJson()) {
    // ...
}
```

<a name="psr7-requests"></a>
### PSR-7 요청 객체

[PSR-7 표준](https://www.php-fig.org/psr/psr-7/)은 HTTP 요청과 응답을 다루는 인터페이스를 정의합니다. 라라벨에서 라라벨 고유의 요청 객체 대신 PSR-7 표준 요청 객체를 사용하려면 몇 가지 추가 패키지를 설치해야 합니다. 라라벨은 일반 라라벨 요청/응답을 PSR-7 구현으로 변환하기 위해 Symfony HTTP Message Bridge 컴포넌트를 활용합니다.

```shell
composer require symfony/psr-http-message-bridge
composer require nyholm/psr7
```

라이브러리를 설치한 후에는, 라우트 클로저나 컨트롤러 메서드에서 PSR-7 인터페이스를 타입힌트하여 PSR-7 요청 객체를 사용할 수 있습니다.

```php
use Psr\Http\Message\ServerRequestInterface;

Route::get('/', function (ServerRequestInterface $request) {
    // ...
});
```

> [!NOTE]
> 라우트나 컨트롤러에서 PSR-7 응답 인스턴스를 반환하면, 라라벨이 자동으로 이를 라라벨 응답 인스턴스로 변환하여 프레임워크에서 정상적으로 처리합니다.

<a name="input"></a>
## 입력(Input)

<a name="retrieving-input"></a>
### 입력값 가져오기

<a name="retrieving-all-input-data"></a>
#### 모든 입력 데이터 가져오기

들어온 요청의 모든 입력값을 `array`로 가져오려면 `all` 메서드를 사용합니다. 이 메서드는 요청 타입에 관계없이(HTML 폼, XHR 포함) 사용할 수 있습니다.

```php
$input = $request->all();
```

`collect` 메서드를 사용하면, 모든 요청 입력값을 [컬렉션](/docs/collections)으로 가져올 수도 있습니다.

```php
$input = $request->collect();
```

또한, `collect` 메서드에 특정 키를 전달해 하위 입력값의 컬렉션을 얻을 수도 있습니다.

```php
$request->collect('users')->each(function (string $user) {
    // ...
});
```

<a name="retrieving-an-input-value"></a>
#### 특정 입력값 가져오기

간편한 메서드들로, `Illuminate\Http\Request` 인스턴스에서 HTTP 메서드에 상관 없이 입력값을 얻을 수 있습니다. 예를 들어 다음과 같이 `input` 메서드를 사용하면 됩니다.

```php
$name = $request->input('name');
```

만약 원하는 입력키가 없을 경우 반환할 기본값을 두 번째 인자로 지정할 수 있습니다.

```php
$name = $request->input('name', 'Sally');
```

입력값이 배열 형태인 경우, "점(`.`) 표기법"을 활용하여 하위 값을 얻을 수 있습니다.

```php
$name = $request->input('products.0.name');

$names = $request->input('products.*.name');
```

인자를 주지 않고 `input` 메서드를 호출하면 모든 입력값을 연관 배열로 반환합니다.

```php
$input = $request->input();
```

<a name="retrieving-input-from-the-query-string"></a>
#### 쿼리 스트링에서 입력값 얻기

`input` 메서드는 전체 요청 데이터를 대상으로 합니다(쿼리 스트링 포함). 오직 쿼리 스트링에서만 값을 얻고 싶다면 `query` 메서드를 사용합니다.

```php
$name = $request->query('name');
```

쿼리 스트링에 해당 값이 없을 경우, 두 번째 인자로 지정한 기본값이 반환됩니다.

```php
$name = $request->query('name', 'Helen');
```

인자 없이 `query` 메서드를 호출하면 모든 쿼리 스트링 값을 연관 배열로 가져올 수 있습니다.

```php
$query = $request->query();
```

<a name="retrieving-json-input-values"></a>
#### JSON 입력값 가져오기

애플리케이션에 JSON 요청이 들어오는 경우, 요청의 `Content-Type` 헤더가 `application/json`으로 설정되어 있다면 `input` 메서드를 그대로 사용할 수 있습니다. "점 표기법"을 통해 중첩된 JSON 값에도 접근 가능합니다.

```php
$name = $request->input('user.name');
```

<a name="retrieving-stringable-input-values"></a>
#### Stringable(문자열 객체) 입력값 가져오기

입력값을 원시 `string` 데이터가 아니라 [Illuminate\Support\Stringable](/docs/strings) 인스턴스로 받고 싶다면, `string` 메서드를 사용할 수 있습니다.

```php
$name = $request->string('name')->trim();
```

<a name="retrieving-integer-input-values"></a>
#### 정수형(Integer) 입력값 가져오기

입력값을 정수로 받고 싶다면 `integer` 메서드를 사용하세요. 이 메서드는 입력값을 정수로 변환해 반환하며, 값이 없거나 변환에 실패하면 두 번째 인자로 지정한 기본값을 반환합니다. 페이지네이션이나 숫자 입력값 처리 시 유용합니다.

```php
$perPage = $request->integer('per_page');
```

<a name="retrieving-boolean-input-values"></a>
#### 불리언(Boolean) 입력값 가져오기

HTML 체크박스 등에서 "true", "on" 등 문자열로 온 값을 명확하게 불리언 값으로 변환하려면 `boolean` 메서드를 사용하세요. 이 메서드는 1, "1", true, "true", "on", "yes" 입력에 대해 `true`를 반환하며, 그 외는 모두 `false`입니다.

```php
$archived = $request->boolean('archived');
```

<a name="retrieving-date-input-values"></a>
#### 날짜(Date) 입력값 가져오기

날짜나 시간 값이 포함된 입력값은 `date` 메서드를 사용해 간단히 [Carbon](https://carbon.nesbot.com/) 인스턴스로 받을 수 있습니다. 값이 없다면 `null`을 반환합니다.

```php
$birthday = $request->date('birthday');
```

날짜의 형식(format)과 시간대(timezone)을 추가 인자로 지정할 수도 있습니다.

```php
$elapsed = $request->date('elapsed', '!H:i', 'Europe/Madrid');
```

값은 있지만 지정한 포맷에 맞지 않으면 `InvalidArgumentException`이 발생하므로, 이 메서드를 호출하기 전에 입력값 유효성 검증을 수행하는 것이 좋습니다.

<a name="retrieving-enum-input-values"></a>
#### Enum(열거형) 입력값 가져오기

[PHP enum](https://www.php.net/manual/en/language.types.enumerations.php) 값에 매핑되는 입력값도 받을 수 있습니다. 입력값이 없거나 enum의 값과 일치하지 않으면 `null`이 반환됩니다. `enum` 메서드는 입력 값의 이름과 enum 클래스명을 순서대로 받습니다.

```php
use App\Enums\Status;

$status = $request->enum('status', Status::class);
```

입력값이 enum 값들의 배열이라면, `enums` 메서드로 enum 인스턴스 배열을 받을 수 있습니다.

```php
use App\Enums\Product;

$products = $request->enums('products', Product::class);
```

<a name="retrieving-input-via-dynamic-properties"></a>
#### 동적 프로퍼티로 입력값 접근하기

`Illuminate\Http\Request` 인스턴스에서 동적 프로퍼티로 입력값을 바로 참조할 수도 있습니다. 예를 들어, 폼에 `name` 필드가 있다면 아래처럼 사용할 수 있습니다.

```php
$name = $request->name;
```

동적 프로퍼티를 사용할 경우, 라라벨은 먼저 요청 입력값에서 해당 파라미터를 찾고, 없으면 매칭되는 라우트의 파라미터에서 값을 검색합니다.

<a name="retrieving-a-portion-of-the-input-data"></a>
#### 입력값 일부만 가져오기

입력값 중 일부만 필요하다면, `only`와 `except` 메서드를 사용할 수 있습니다. 두 메서드는 배열 또는 여러 인자로 키 목록을 받습니다.

```php
$input = $request->only(['username', 'password']);

$input = $request->only('username', 'password');

$input = $request->except(['credit_card']);

$input = $request->except('credit_card');
```

> [!WARNING]
> `only` 메서드는 요청에 실제 존재하는 키/값만 반환하며, 요청에 없는 값은 반환하지 않습니다.

<a name="input-presence"></a>
### 입력 존재 여부 확인

`has` 메서드는 요청에 특정 값이 존재하는지 확인합니다. 값이 존재하면 `true`를 반환합니다.

```php
if ($request->has('name')) {
    // ...
}
```

배열로 여러 키를 넘기면, 지정한 모든 값이 존재할 때만 `true`를 반환합니다.

```php
if ($request->has(['name', 'email'])) {
    // ...
}
```

`hasAny` 메서드는 지정한 값들 중 하나라도 존재하면 `true`를 반환합니다.

```php
if ($request->hasAny(['name', 'email'])) {
    // ...
}
```

`whenHas` 메서드는 지정한 값이 존재하면 지정한 클로저를 실행합니다.

```php
$request->whenHas('name', function (string $input) {
    // ...
});
```

존재하지 않을 때 실행할 두 번째 클로저도 지정할 수 있습니다.

```php
$request->whenHas('name', function (string $input) {
    // The "name" value is present...
}, function () {
    // The "name" value is not present...
});
```

값이 존재하면서 빈 문자열이 아닌지도 확인하려면 `filled` 메서드를 사용합니다.

```php
if ($request->filled('name')) {
    // ...
}
```

반대로, 요청에서 값이 없거나 빈 문자열이라면 `isNotFilled` 메서드를 사용할 수 있습니다.

```php
if ($request->isNotFilled('name')) {
    // ...
}
```

배열로 여러 값을 넘기면, 지정한 모든 값이 없거나 비어 있을 때만 `true`를 반환합니다.

```php
if ($request->isNotFilled(['name', 'email'])) {
    // ...
}
```

`anyFilled` 메서드는 지정한 값들 중 하나라도 빈 문자열이 아니면 `true`를 반환합니다.

```php
if ($request->anyFilled(['name', 'email'])) {
    // ...
}
```

값이 존재하고 비어 있지 않을 때에만 클로저를 실행하고 싶을 경우 `whenFilled` 메서드를 사용하세요.

```php
$request->whenFilled('name', function (string $input) {
    // ...
});
```

"채워진(filled)" 값이 아닐 때 실행할 두 번째 클로저도 지정할 수 있습니다.

```php
$request->whenFilled('name', function (string $input) {
    // The "name" value is filled...
}, function () {
    // The "name" value is not filled...
});
```

특정 키가 요청에 없는 경우, `missing` 및 `whenMissing` 메서드를 사용할 수 있습니다.

```php
if ($request->missing('name')) {
    // ...
}

$request->whenMissing('name', function () {
    // The "name" value is missing...
}, function () {
    // The "name" value is present...
});
```

<a name="merging-additional-input"></a>
### 추가 입력값 병합

가끔 기존 요청 입력 데이터에 값을 추가로 합쳐야 할 때가 있습니다. 이럴 땐 `merge` 메서드를 사용하세요. 입력값이 이미 존재한다면 주어진 값으로 덮어씁니다.

```php
$request->merge(['votes' => 0]);
```

입력값이 없을 때만 병합하려면 `mergeIfMissing` 메서드를 사용합니다.

```php
$request->mergeIfMissing(['votes' => 0]);
```

<a name="old-input"></a>
### 이전 입력값(Old Input)

라라벨에서는 한 번의 요청에서 입력값을 플래시(flashing)하여 다음 요청 시에도 입력값을 유지할 수 있습니다. 주로 폼 유효성 검증에서 오류가 발생했을 때 사용자 입력을 폼에 그대로 보여주고 싶을 때 사용됩니다. 다만, 라라벨의 [유효성 검증](/docs/validation) 기능을 활용한다면 수동으로 입력값 플래싱을 직접 처리할 필요가 없는 경우가 많습니다(내장된 기능이 자동으로 처리함).

<a name="flashing-input-to-the-session"></a>
#### 입력값을 세션에 플래시하기

`Illuminate\Http\Request`의 `flash` 메서드는 현재 입력값을 [세션](/docs/session)에 저장하여, 유저의 다음 요청에서도 입력값에 접근할 수 있게 합니다.

```php
$request->flash();
```

`flashOnly`와 `flashExcept` 메서드를 사용하면 일부 선택한 입력값만 세션에 플래시할 수도 있습니다. 비밀번호처럼 민감한 데이터는 세션에 저장하지 않을 때 유용합니다.

```php
$request->flashOnly(['username', 'email']);

$request->flashExcept('password');
```

<a name="flashing-input-then-redirecting"></a>
#### 입력값 플래시 후 리다이렉트하기

입력값을 세션에 플래시하고 곧바로 이전 페이지로 리다이렉트하는 경우가 많습니다. 이럴 때는 `withInput` 메서드를 체이닝하여 쉽게 처리할 수 있습니다.

```php
return redirect('/form')->withInput();

return redirect()->route('user.create')->withInput();

return redirect('/form')->withInput(
    $request->except('password')
);
```

<a name="retrieving-old-input"></a>
#### 이전 입력값 가져오기

이전 요청에서 플래시된 입력값을 가져오려면, `Illuminate\Http\Request` 인스턴스의 `old` 메서드를 사용하세요. `old` 메서드는 [세션](/docs/session)에서 이전 입력값을 찾아 반환합니다.

```php
$username = $request->old('username');
```

라라벨은 Blade 템플릿에서 입력값을 바로 채울 수 있도록 글로벌 `old` 헬퍼 함수를 제공합니다. 만약 해당 입력 필드에 플래시된 값이 없다면 `null`이 반환됩니다.

```blade
<input type="text" name="username" value="{{ old('username') }}">
```

<a name="cookies"></a>
### 쿠키

<a name="retrieving-cookies-from-requests"></a>
#### 요청에서 쿠키 가져오기

라라벨에서 생성한 모든 쿠키는 암호화 및 서명 처리되어, 클라이언트가 내용을 바꿀 경우 무효 처리됩니다. 요청에서 쿠키 값을 얻으려면 `Illuminate\Http\Request` 인스턴스의 `cookie` 메서드를 사용하세요.

```php
$value = $request->cookie('name');
```

<a name="input-trimming-and-normalization"></a>
## 입력값 트리밍 및 정규화

라라벨은 기본적으로 글로벌 미들웨어 스택에 `Illuminate\Foundation\Http\Middleware\TrimStrings`와 `Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull` 미들웨어를 포함합니다. 이들은 요청에 들어오는 모든 문자열 필드를 자동으로 트리밍 처리하고, 빈 문자열을 `null`로 변환합니다. 따라서 라우트 및 컨트롤러에서 이와 관련된 처리를 따로 신경 쓸 필요가 없습니다.

#### 입력값 정규화 비활성화하기

이런 처리를 모든 요청에서 비활성화하려면, `bootstrap/app.php` 파일에서 `$middleware->remove` 메서드를 사용하여 두 미들웨어를 미들웨어 스택에서 제거하면 됩니다.

```php
use Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull;
use Illuminate\Foundation\Http\Middleware\TrimStrings;

->withMiddleware(function (Middleware $middleware) {
    $middleware->remove([
        ConvertEmptyStringsToNull::class,
        TrimStrings::class,
    ]);
})
```

애플리케이션 일부 요청에만 문자열 트리밍이나 빈 문자열 변환을 비활성화하고 싶다면, `bootstrap/app.php`의 `trimStrings` 혹은 `convertEmptyStringsToNull` 메서드를 사용할 수 있습니다. 이들 메서드는 클로저 배열을 받으며, 각 클로저가 `true`를 반환하면 해당 요청에 한해 정규화를 건너뜁니다.

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->convertEmptyStringsToNull(except: [
        fn (Request $request) => $request->is('admin/*'),
    ]);

    $middleware->trimStrings(except: [
        fn (Request $request) => $request->is('admin/*'),
    ]);
})
```

<a name="files"></a>
## 파일

<a name="retrieving-uploaded-files"></a>
### 업로드된 파일 가져오기

업로드된 파일은 `Illuminate\Http\Request` 인스턴스의 `file` 메서드 혹은 동적 프로퍼티로 가져올 수 있습니다. `file` 메서드는 `Illuminate\Http\UploadedFile` 인스턴스를 반환하며, 이는 PHP의 `SplFileInfo`를 확장해서 파일 관련 다양한 기능을 제공합니다.

```php
$file = $request->file('photo');

$file = $request->photo;
```

`hasFile` 메서드를 사용하면 요청에 파일이 있는지 확인할 수 있습니다.

```php
if ($request->hasFile('photo')) {
    // ...
}
```

<a name="validating-successful-uploads"></a>
#### 파일 업로드 성공 검증하기

파일이 요청에 존재하는지뿐만 아니라, 실제로 업로드 시 에러가 없는지도 `isValid` 메서드로 검증할 수 있습니다.

```php
if ($request->file('photo')->isValid()) {
    // ...
}
```

<a name="file-paths-extensions"></a>
#### 파일 경로와 확장자

`UploadedFile` 클래스는 파일의 실제 경로나 확장자에 접근할 수 있는 메서드도 제공합니다. `extension` 메서드는 파일 내용 기반으로 확장자를 추측하며, 클라이언트가 지정한 확장자와 다를 수 있습니다.

```php
$path = $request->photo->path();

$extension = $request->photo->extension();
```

<a name="other-file-methods"></a>
#### 기타 파일 메서드

`UploadedFile` 인스턴스에는 이 외에도 다양한 메서드가 있습니다. 더 자세한 내용은 [클래스 API 문서](https://github.com/symfony/symfony/blob/6.0/src/Symfony/Component/HttpFoundation/File/UploadedFile.php)를 참고하세요.

<a name="storing-uploaded-files"></a>
### 업로드된 파일 저장하기

업로드된 파일을 저장할 때는, 설정한 [파일 시스템](/docs/filesystem) 중 하나를 보통 사용합니다. `UploadedFile` 클래스의 `store` 메서드는 지정한 디스크로 파일을 이동시킬 수 있습니다. 디스크는 로컬이거나, Amazon S3와 같은 클라우드 스토리지일 수도 있습니다.

`store` 메서드는 파일을 저장할 경로(디렉터리 경로)를 첫 번째 인자로 받습니다. 별도의 파일명을 지정하지 않으면 자동으로 고유한 파일명이 생성되어 저장됩니다.

두 번째 인자로 사용할 디스크 이름을 지정할 수도 있습니다. 파일이 저장된 경로(디스크 기준 상대경로)를 반환합니다.

```php
$path = $request->photo->store('images');

$path = $request->photo->store('images', 's3');
```

파일명을 직접 지정하고 싶다면, `storeAs` 메서드를 사용하면 됩니다. 첫 번째 인자는 경로, 두 번째는 파일명, 세 번째는 디스크명입니다.

```php
$path = $request->photo->storeAs('images', 'filename.jpg');

$path = $request->photo->storeAs('images', 'filename.jpg', 's3');
```

> [!NOTE]
> 파일 저장에 대한 더 자세한 내용은 [파일 시스템 문서](/docs/filesystem)를 참고하세요.

<a name="configuring-trusted-proxies"></a>
## 신뢰할 수 있는 프록시 설정

로드밸런서처럼 TLS/SSL 인증서를 종료하는 환경에서 애플리케이션을 실행하면, `url` 헬퍼 사용 시 HTTPS 링크가 잘못 생성되는 경우가 있습니다. 이런 현상은 보통, 로드밸런서가 80 포트(HTTP)로 애플리케이션에 트래픽을 전달하며, 애플리케이션이 이를 그대로 받아서 보안 연결인지 알지 못하기 때문에 발생합니다.

이 문제를 해결하려면, 라라벨에 기본 포함된 `Illuminate\Http\Middleware\TrustProxies` 미들웨어를 활성화하면 됩니다. 이 미들웨어는 애플리케이션이 신뢰해야 할 로드밸런서나 프록시 목록을 빠르게 지정할 수 있게 해줍니다. 신뢰할 프록시는 애플리케이션의 `bootstrap/app.php` 파일에서 `trustProxies` 미들웨어 메서드로 지정할 수 있습니다.

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->trustProxies(at: [
        '192.168.1.1',
        '10.0.0.0/8',
    ]);
})
```

신뢰할 프록시뿐만 아니라, 신뢰할 프록시 헤더도 아래와 같이 설정할 수 있습니다.

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->trustProxies(headers: Request::HEADER_X_FORWARDED_FOR |
        Request::HEADER_X_FORWARDED_HOST |
        Request::HEADER_X_FORWARDED_PORT |
        Request::HEADER_X_FORWARDED_PROTO |
        Request::HEADER_X_FORWARDED_AWS_ELB
    );
})
```

> [!NOTE]
> AWS Elastic Load Balancing을 쓰는 경우, `headers` 값은 `Request::HEADER_X_FORWARDED_AWS_ELB`이어야 합니다. 만약 로드밸런서가 [RFC 7239](https://www.rfc-editor.org/rfc/rfc7239#section-4)의 표준 `Forwarded` 헤더를 쓴다면, `Request::HEADER_FORWARDED`로 지정해야 합니다. `headers`에 지정할 수 있는 상수에 대한 더 자세한 정보는 Symfony의 [신뢰할 수 있는 프록시 관련 문서](https://symfony.com/doc/current/deployment/proxies.html)를 참고하세요.

<a name="trusting-all-proxies"></a>
#### 모든 프록시 신뢰하기

Amazon AWS 등 클라우드 로드밸런서 공급자를 쓸 때는 실제 프록시 IP 주소를 사전에 알기 어려울 수 있습니다. 이런 경우, `*`을 지정해 모든 프록시를 신뢰하도록 설정할 수 있습니다.

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->trustProxies(at: '*');
})
```

<a name="configuring-trusted-hosts"></a>
## 신뢰할 수 있는 호스트 설정

기본적으로 라라벨은 HTTP 요청의 `Host` 헤더 값과 상관없이, 들어오는 모든 요청에 응답합니다. 또한, 웹 요청 중 절대 URL을 생성할 때 `Host` 헤더 값이 URL의 호스트로 사용됩니다.

일반적으로는 Nginx나 Apache 같은 웹서버에서 허용할 호스트를 제한하는 것이 좋습니다. 그러나 웹서버를 직접 제어할 수 없는 환경에서는 라라벨의 `Illuminate\Http\Middleware\TrustHosts` 미들웨어를 활성화해, 특정 호스트에 대해서만 응답하도록 구성할 수 있습니다.

이 미들웨어를 활성화하려면, `bootstrap/app.php` 파일에서 `trustHosts` 미들웨어 메서드를 사용하세요. `at` 인자로 허용할 호스트명을 배열로 명시할 수 있습니다. 허용하지 않은 `Host` 헤더의 요청은 거부됩니다.

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->trustHosts(at: ['laravel.test']);
})
```

기본적으로, 애플리케이션의 URL 하위 도메인에서 오는 요청도 자동으로 신뢰됩니다. 이 동작을 비활성화하려면 `subdomains` 인자를 `false`로 설정하면 됩니다.

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->trustHosts(at: ['laravel.test'], subdomains: false);
})
```

허용할 호스트 목록을 환경설정이나 데이터베이스에서 동적으로 정하고 싶다면, `at` 인자에 클로저를 넘길 수도 있습니다.

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->trustHosts(at: fn () => config('app.trusted_hosts'));
})
```