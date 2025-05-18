# HTTP 요청 (HTTP Requests)

- [소개](#introduction)
- [요청 객체와 상호작용하기](#interacting-with-the-request)
    - [요청 객체 접근하기](#accessing-the-request)
    - [요청 경로, 호스트, 메서드 확인](#request-path-and-method)
    - [요청 헤더](#request-headers)
    - [요청 IP 주소](#request-ip-address)
    - [콘텐츠 협상](#content-negotiation)
    - [PSR-7 요청](#psr7-requests)
- [입력값(Input)](#input)
    - [입력값 조회하기](#retrieving-input)
    - [입력값 존재 확인](#input-presence)
    - [추가 입력값 병합하기](#merging-additional-input)
    - [이전 입력값(Old Input)](#old-input)
    - [쿠키](#cookies)
    - [입력값 정리 및 정규화](#input-trimming-and-normalization)
- [파일 업로드](#files)
    - [업로드된 파일 조회](#retrieving-uploaded-files)
    - [업로드된 파일 저장](#storing-uploaded-files)
- [신뢰할 수 있는 프록시 설정](#configuring-trusted-proxies)
- [신뢰할 수 있는 호스트 설정](#configuring-trusted-hosts)

<a name="introduction"></a>
## 소개

라라벨의 `Illuminate\Http\Request` 클래스는 현재 애플리케이션에서 처리 중인 HTTP 요청과, 요청에 함께 전달된 입력값, 쿠키, 파일 등을 객체지향적으로 다룰 수 있는 방법을 제공합니다.

<a name="interacting-with-the-request"></a>
## 요청 객체와 상호작용하기

<a name="accessing-the-request"></a>
### 요청 객체 접근하기

의존성 주입을 통해 현재 HTTP 요청 인스턴스를 받으려면, 라우트 클로저나 컨트롤러 메서드에 `Illuminate\Http\Request` 클래스를 타입힌트로 지정하면 됩니다. 그러면 라라벨 [서비스 컨테이너](/docs/11.x/container)가 자동으로 현재 요청 인스턴스를 주입합니다.

```
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * 새 유저를 저장합니다.
     */
    public function store(Request $request): RedirectResponse
    {
        $name = $request->input('name');

        // 유저 저장...

        return redirect('/users');
    }
}
```

위에서 설명했듯이, 라우트 클로저에서도 동일하게 `Illuminate\Http\Request` 클래스를 타입힌트로 지정하여 사용할 수 있습니다. 이 경우에도 서비스 컨테이너가 실행 시점에 현재 요청을 자동 주입합니다.

```
use Illuminate\Http\Request;

Route::get('/', function (Request $request) {
    // ...
});
```

<a name="dependency-injection-route-parameters"></a>
#### 의존성 주입과 라우트 파라미터

컨트롤러 메서드에서 라우트 파라미터를 함께 받아야 할 경우, 해당 파라미터를 다른 의존성 뒤에 나열해야 합니다. 예를 들어 다음과 같이 라우트를 정의했다면:

```
use App\Http\Controllers\UserController;

Route::put('/user/{id}', [UserController::class, 'update']);
```

여전히 `Illuminate\Http\Request`를 타입힌트로 지정하고, 라우트 파라미터인 `id`를 두 번째 인자로 받는 식으로 컨트롤러 메서드를 정의할 수 있습니다.

```
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * 지정된 유저를 업데이트합니다.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        // 유저 업데이트...

        return redirect('/users');
    }
}
```

<a name="request-path-and-method"></a>
### 요청 경로, 호스트, 메서드 확인

`Illuminate\Http\Request` 인스턴스는 들어온 HTTP 요청을 검사할 수 있는 다양한 메서드를 제공합니다. 이 클래스는 `Symfony\Component\HttpFoundation\Request`를 확장합니다. 이하에서는 가장 중요한 몇 가지 메서드만 소개합니다.

<a name="retrieving-the-request-path"></a>
#### 요청 경로 가져오기

`path` 메서드는 요청의 경로(path) 정보를 반환합니다. 예를 들어, 현재 요청이 `http://example.com/foo/bar`라면 `path`는 `foo/bar`를 반환합니다.

```
$uri = $request->path();
```

<a name="inspecting-the-request-path"></a>
#### 요청 경로/라우트 일치 검사

`is` 메서드를 사용하면 요청 경로가 지정한 패턴과 일치하는지 확인할 수 있습니다. 패턴에는 와일드카드 문자 `*`를 사용할 수 있습니다.

```
if ($request->is('admin/*')) {
    // ...
}
```

또한, `routeIs` 메서드를 사용하면 현재 요청이 [네임드 라우트](/docs/11.x/routing#named-routes)와 일치하는지 확인할 수 있습니다.

```
if ($request->routeIs('admin.*')) {
    // ...
}
```

<a name="retrieving-the-request-url"></a>
#### 요청 URL 가져오기

전체 요청 URL을 가져오려면 `url` 또는 `fullUrl` 메서드를 사용할 수 있습니다. `url`은 쿼리 문자열을 제외한 URL을 반환하고, `fullUrl`은 쿼리 문자열까지 포함한 전체 URL을 반환합니다.

```
$url = $request->url();

$urlWithQueryString = $request->fullUrl();
```

현재 URL에 쿼리 문자열 데이터를 추가하려면 `fullUrlWithQuery` 메서드를 사용할 수 있습니다. 이 메서드는 제공한 배열의 쿼리 파라미터를 현재 쿼리 문자열에 병합합니다.

```
$request->fullUrlWithQuery(['type' => 'phone']);
```

특정 쿼리 문자열 파라미터 없이 현재 URL을 얻으려면 `fullUrlWithoutQuery` 메서드를 사용할 수 있습니다.

```php
$request->fullUrlWithoutQuery(['type']);
```

<a name="retrieving-the-request-host"></a>
#### 요청 호스트 가져오기

들어오는 요청의 "호스트" 정보는 `host`, `httpHost`, `schemeAndHttpHost` 메서드로 조회할 수 있습니다.

```
$request->host();
$request->httpHost();
$request->schemeAndHttpHost();
```

<a name="retrieving-the-request-method"></a>
#### 요청 메서드(HTTP Verb) 가져오기

`method` 메서드는 요청의 HTTP 메서드(verb)를 반환합니다. 또한, `isMethod` 메서드를 이용해 해당 HTTP 메서드가 특정 문자열과 일치하는지 확인할 수 있습니다.

```
$method = $request->method();

if ($request->isMethod('post')) {
    // ...
}
```

<a name="request-headers"></a>
### 요청 헤더

`Illuminate\Http\Request` 인스턴스의 `header` 메서드를 사용하면 요청의 특정 헤더 값을 조회할 수 있습니다. 헤더가 요청에 없다면 `null`이 반환됩니다. 그러나, 두 번째 인수로 기본값을 지정하면 헤더가 없을 때 해당 값이 반환됩니다.

```
$value = $request->header('X-Header-Name');

$value = $request->header('X-Header-Name', 'default');
```

`hasHeader` 메서드를 사용하면 해당 헤더가 요청에 포함되어 있는지 확인할 수 있습니다.

```
if ($request->hasHeader('X-Header-Name')) {
    // ...
}
```

편의를 위해, `bearerToken` 메서드를 사용하면 `Authorization` 헤더에서 bearer 토큰을 추출할 수 있습니다. 해당 헤더가 없으면 빈 문자열이 반환됩니다.

```
$token = $request->bearerToken();
```

<a name="request-ip-address"></a>
### 요청 IP 주소

요청을 보낸 클라이언트의 IP 주소는 `ip` 메서드로 조회할 수 있습니다.

```
$ipAddress = $request->ip();
```

프록시를 거친 요청 등, 여러 개의 클라이언트 IP 주소 배열이 필요한 경우에는 `ips` 메서드를 사용할 수 있습니다. 이 배열의 마지막 값이 실제(원본) 클라이언트 IP 주소입니다.

```
$ipAddresses = $request->ips();
```

일반적으로 IP 주소는 신뢰할 수 없고, 사용자가 제어할 수 있는 값이므로, 정보 참고 용도로만 사용하는 것이 좋습니다.

<a name="content-negotiation"></a>
### 콘텐츠 협상

라라벨은 요청의 `Accept` 헤더를 검사하여 요청이 요구하는 콘텐츠 타입을 확인하는 다양한 메서드를 제공합니다. 먼저, `getAcceptableContentTypes` 메서드는 요청이 허용하는 모든 콘텐츠 타입의 배열을 반환합니다.

```
$contentTypes = $request->getAcceptableContentTypes();
```

`accepts` 메서드는 배열 형태로 여러 콘텐츠 타입을 전달받아, 요청에서 이들 중 하나라도 허용하면 `true`를 반환합니다. 그렇지 않으면 `false`가 반환됩니다.

```
if ($request->accepts(['text/html', 'application/json'])) {
    // ...
}
```

여러 콘텐츠 타입 중 요청자가 가장 선호하는 타입을 확인하려면 `prefers` 메서드를 사용합니다. 전달한 타입 중 요청이 지원하지 않는다면 `null`을 반환합니다.

```
$preferred = $request->prefers(['text/html', 'application/json']);
```

많은 애플리케이션이 HTML이나 JSON만을 반환할 경우, 요청이 JSON 응답을 원하는지 빠르게 확인하려면 `expectsJson` 메서드를 사용할 수 있습니다.

```
if ($request->expectsJson()) {
    // ...
}
```

<a name="psr7-requests"></a>
### PSR-7 요청

[PSR-7 표준](https://www.php-fig.org/psr/psr-7/)은 HTTP 메시지(요청, 응답 포함)에 대한 인터페이스를 정의합니다. 라라벨의 요청 객체 대신 PSR-7 요청 객체를 사용하려면 먼저 몇 가지 라이브러리를 설치해야 합니다. 라라벨은 *Symfony HTTP Message Bridge* 컴포넌트를 이용해 라라벨의 요청과 응답을 PSR-7 호환 구현체로 변환합니다.

```shell
composer require symfony/psr-http-message-bridge
composer require nyholm/psr7
```

이 라이브러리 설치 후, 라우트 클로저나 컨트롤러 메서드에 타입힌트로 PSR-7 요청 인터페이스를 지정하면 PSR-7 요청 인스턴스를 받을 수 있습니다.

```
use Psr\Http\Message\ServerRequestInterface;

Route::get('/', function (ServerRequestInterface $request) {
    // ...
});
```

> [!NOTE]  
> 라우트 또는 컨트롤러에서 PSR-7 응답 인스턴스를 반환하면, 프레임워크가 이를 라라벨의 응답 인스턴스로 자동 변환해 화면에 출력합니다.

<a name="input"></a>
## 입력값(Input)

<a name="retrieving-input"></a>
### 입력값 조회하기

<a name="retrieving-all-input-data"></a>
#### 모든 입력값 조회

들어온 모든 요청 입력값을 `array` 형식으로 가져오려면 `all` 메서드를 사용할 수 있습니다. 이 메서드는 요청이 HTML 폼이든 XHR 요청이든 상관없이 모두 쓸 수 있습니다.

```
$input = $request->all();
```

`collect` 메서드를 사용하면 모든 입력값을 [컬렉션](/docs/11.x/collections)으로 가져올 수도 있습니다.

```
$input = $request->collect();
```

또한, `collect` 메서드는 일부 입력값만 컬렉션으로 조회하는 것도 가능합니다.

```
$request->collect('users')->each(function (string $user) {
    // ...
});
```

<a name="retrieving-an-input-value"></a>
#### 단일 입력값 조회

몇 가지 간단한 메서드로 `Illuminate\Http\Request` 인스턴스에서 모든 사용자 입력값을 HTTP 메서드에 관계없이 접근할 수 있습니다. HTTP 메서드와 관계없이 `input` 메서드를 사용해 입력값을 받아올 수 있습니다.

```
$name = $request->input('name');
```

두 번째 인수로 기본값을 지정해, 해당 입력값이 없을 때 반환되도록 할 수 있습니다.

```
$name = $request->input('name', 'Sally');
```

배열 형태의 입력값이 포함된 폼을 다룰 때는 "점(.) 표기법"을 사용해서 배열 내부 값에 접근할 수 있습니다.

```
$name = $request->input('products.0.name');

$names = $request->input('products.*.name');
```

`input` 메서드를 인수 없이 호출하면, 모든 입력값을 연관 배열로 반환합니다.

```
$input = $request->input();
```

<a name="retrieving-input-from-the-query-string"></a>
#### 쿼리 문자열에서 입력값 조회

`input` 메서드는 요청 전체 페이로드(쿼리 문자열을 포함)에서 값을 조회하지만, `query` 메서드는 오직 쿼리 문자열에서만 값을 가져옵니다.

```
$name = $request->query('name');
```

요청에 해당 쿼리 문자열 값이 없으면 두 번째 인수의 기본값이 반환됩니다.

```
$name = $request->query('name', 'Helen');
```

인수 없이 `query` 메서드를 호출하면 쿼리 문자열의 모든 값을 연관 배열로 가져옵니다.

```
$query = $request->query();
```

<a name="retrieving-json-input-values"></a>
#### JSON 입력값 조회

애플리케이션에 JSON 요청을 보낼 때, 요청의 `Content-Type` 헤더가 `application/json`으로 올바르게 지정되어 있으면 `input` 메서드를 통해 JSON 데이터를 조회할 수 있습니다. "점(.) 표기법"을 활용해 JSON 배열/객체 내부 값에도 접근할 수 있습니다.

```
$name = $request->input('user.name');
```

<a name="retrieving-stringable-input-values"></a>
#### Stringable 입력값 조회

요청의 입력값을 단순한 `string`이 아니라 [`Illuminate\Support\Stringable`](/docs/11.x/strings) 인스턴스로 받아오고 싶을 때는 `string` 메서드를 사용할 수 있습니다.

```
$name = $request->string('name')->trim();
```

<a name="retrieving-integer-input-values"></a>
#### 정수형 입력값 조회

입력값을 정수로 받고 싶을 때는 `integer` 메서드를 사용할 수 있습니다. 이 메서드는 입력값을 정수로 변환(캐스팅)합니다. 값이 없거나 변환에 실패하면 지정한 기본값을 반환합니다. 페이지네이션 등 숫자 입력을 받을 때 유용합니다.

```
$perPage = $request->integer('per_page');
```

<a name="retrieving-boolean-input-values"></a>
#### 불린(boolean) 입력값 조회

체크박스와 같은 HTML 요소를 다루다 보면 "true", "on"처럼 문자열이지만 참(true)으로 취급해야 하는 경우가 많습니다. `boolean` 메서드를 사용하면 이런 값을 실제 불린 값으로 변환해서 받아올 수 있습니다. "1", 1, true, "true", "on", "yes"에 대해 `true`를, 그 외의 값은 `false`를 반환합니다.

```
$archived = $request->boolean('archived');
```

<a name="retrieving-date-input-values"></a>
#### 날짜/시간 입력값 조회

날짜/시간이 포함된 입력값은 `date` 메서드로 [Carbon](https://carbon.nesbot.com/) 인스턴스로 바로 받아올 수 있습니다. 값이 없으면 `null`을 반환합니다.

```
$birthday = $request->date('birthday');
```

`date` 메서드의 두 번째, 세 번째 인수로 날짜 포맷과 타임존도 지정할 수 있습니다.

```
$elapsed = $request->date('elapsed', '!H:i', 'Europe/Madrid');
```

만약 입력값은 존재하지만 형식이 올바르지 않다면 `InvalidArgumentException`이 발생하니, `date` 메서드 호출 전에 유효성 검증을 권장합니다.

<a name="retrieving-enum-input-values"></a>
#### Enum 입력값 조회

요청 입력값이 [PHP enum](https://www.php.net/manual/en/language.types.enumerations.php)에 해당하는 경우, 이 값을 enum 인스턴스로 받아올 수 있습니다. 요청에 해당 값이 없거나 enum의 백잉 값과 일치하지 않으면 `null`이 반환됩니다. `enum` 메서드는 입력값 이름과 enum 클래스명을 첫 번째와 두 번째 인자로 받습니다.

```
use App\Enums\Status;

$status = $request->enum('status', Status::class);
```

입력값이 enum에 해당하는 값들의 배열이라면, `enums` 메서드로 enum 인스턴스의 배열을 받아올 수도 있습니다.

```
use App\Enums\Product;

$products = $request->enums('products', Product::class);
```

<a name="retrieving-input-via-dynamic-properties"></a>
#### 동적 프로퍼티로 입력값 조회

`Illuminate\Http\Request` 인스턴스에서 동적 프로퍼티로도 사용자 입력값에 접근할 수 있습니다. 예를 들어, 폼에 `name` 필드가 있다면, 다음처럼 값을 얻을 수 있습니다.

```
$name = $request->name;
```

동적 프로퍼티를 사용할 때 라라벨은 우선 요청 페이로드에서 해당 값이 있는지 찾고, 없으면 매치된 라우트의 파라미터를 검색합니다.

<a name="retrieving-a-portion-of-the-input-data"></a>
#### 입력값 중 일부만 조회

입력값 일부만 필요하다면 `only`와 `except` 메서드를 사용할 수 있습니다. 이들 메서드는 단일 `array` 또는 가변 인수로 값을 받습니다.

```
$input = $request->only(['username', 'password']);

$input = $request->only('username', 'password');

$input = $request->except(['credit_card']);

$input = $request->except('credit_card');
```

> [!WARNING]  
> `only` 메서드는 요청에 실제 포함된 key/value 쌍만 반환하며, 요청에 없는 key/value 쌍은 반환하지 않습니다.

<a name="input-presence"></a>
### 입력값 존재 확인

요청에 값이 있는지 확인하려면 `has` 메서드를 사용할 수 있습니다. 요청에 해당 값이 있으면 `true`를 반환합니다.

```
if ($request->has('name')) {
    // ...
}
```

배열을 인수로 넘기면, 지정한 모든 값이 요청에 존재하는지 확인합니다.

```
if ($request->has(['name', 'email'])) {
    // ...
}
```

`hasAny` 메서드는 전달한 값들 중 하나라도 요청에 있으면 `true`를 반환합니다.

```
if ($request->hasAny(['name', 'email'])) {
    // ...
}
```

`whenHas` 메서드는 지정한 값이 요청에 존재할 때 주어진 클로저를 실행합니다.

```
$request->whenHas('name', function (string $input) {
    // ...
});
```

해당 값이 요청에 없을 때 실행할 두 번째 클로저를 `whenHas`에 추가로 전달할 수도 있습니다.

```
$request->whenHas('name', function (string $input) {
    // "name" 값이 있음...
}, function () {
    // "name" 값이 없음...
});
```

요청에 값이 있고 빈 문자열이 아닌 경우를 확인하고 싶을 때는 `filled` 메서드를 사용할 수 있습니다.

```
if ($request->filled('name')) {
    // ...
}
```

요청에서 값이 없거나 빈 문자열일 때는 `isNotFilled` 메서드로 확인할 수 있습니다.

```
if ($request->isNotFilled('name')) {
    // ...
}
```

배열을 인수로 넘길 경우, `isNotFilled`는 해당 값들 모두가 없거나 비어있는지 판단합니다.

```
if ($request->isNotFilled(['name', 'email'])) {
    // ...
}
```

`anyFilled` 메서드는 지정한 값 중 하나라도 비어 있지 않으면 `true`를 반환합니다.

```
if ($request->anyFilled(['name', 'email'])) {
    // ...
}
```

`whenFilled` 메서드는 값이 빈 문자열이 아니면서 존재할 때 주어진 클로저를 실행합니다.

```
$request->whenFilled('name', function (string $input) {
    // ...
});
```

해당 값이 "filled"가 아니면 실행할 두 번째 클로저도 전달할 수 있습니다.

```
$request->whenFilled('name', function (string $input) {
    // "name" 값이 채워져 있음...
}, function () {
    // "name" 값이 비어있음...
});
```

요청에서 특정 키가 없는지 확인하려면 `missing` 및 `whenMissing` 메서드를 사용할 수 있습니다.

```
if ($request->missing('name')) {
    // ...
}

$request->whenMissing('name', function () {
    // "name" 값이 없음...
}, function () {
    // "name" 값이 있음...
});
```

<a name="merging-additional-input"></a>

### 추가 입력 병합하기

때때로 요청(Request)에 이미 존재하는 입력 데이터에 추가 입력값을 수동으로 병합해야 할 수도 있습니다. 이럴 때는 `merge` 메서드를 사용하면 됩니다. 만약 병합하려는 입력 키가 요청에 이미 존재한다면, `merge` 메서드에 전달한 값으로 해당 키의 데이터가 덮어써집니다.

```
$request->merge(['votes' => 0]);
```

입력 데이터에 해당 키가 아직 존재하지 않을 경우에만 병합하려면 `mergeIfMissing` 메서드를 사용할 수 있습니다.

```
$request->mergeIfMissing(['votes' => 0]);
```

<a name="old-input"></a>
### 이전 입력값(Old Input)

라라벨에서는 한 번의 요청에서 입력된 데이터를 다음 요청에서도 사용할 수 있습니다. 이 기능은 특히 유효성 검증(Validation) 오류 발생 이후, 폼을 다시 채워줄 때 유용합니다. 단, 라라벨이 제공하는 [유효성 검증 기능](/docs/11.x/validation)을 사용하는 경우, 이러한 세션 입력 플래싱(Session Input Flashing) 메서드를 별도로 직접 사용할 필요가 없을 수도 있습니다. 라라벨의 일부 내장 유효성 검증 기능이 자동으로 이 메서드들을 호출하기 때문입니다.

<a name="flashing-input-to-the-session"></a>
#### 입력값을 세션에 플래시하기

`Illuminate\Http\Request` 클래스의 `flash` 메서드는 현재 입력(input)값을 [세션](/docs/11.x/session)에 플래시(flash)하여, 사용자가 다음 요청에서 해당 값을 사용할 수 있도록 해줍니다.

```
$request->flash();
```

`flashOnly` 및 `flashExcept` 메서드를 사용하면 요청 데이터 중 일부만 세션에 플래시할 수도 있습니다. 이 방법은 예를 들어 비밀번호처럼 민감한 정보를 세션에 저장하고 싶지 않을 때 유용합니다.

```
$request->flashOnly(['username', 'email']);

$request->flashExcept('password');
```

<a name="flashing-input-then-redirecting"></a>
#### 입력값을 플래시하고 리디렉션하기

입력값을 세션에 플래시한 후 이전 페이지로 리디렉션(redirect)하고 싶을 때가 많습니다. 이때는 리디렉션과 입력값 플래시를 `withInput` 메서드로 쉽게 체이닝할 수 있습니다.

```
return redirect('/form')->withInput();

return redirect()->route('user.create')->withInput();

return redirect('/form')->withInput(
    $request->except('password')
);
```

<a name="retrieving-old-input"></a>
#### 이전 입력값 가져오기

플래시된 입력값을 이전 요청에서 불러오려면 `Illuminate\Http\Request` 인스턴스의 `old` 메서드를 호출하면 됩니다. 이 `old` 메서드는 이전에 플래시된 입력 데이터를 [세션](/docs/11.x/session)에서 찾아 반환해줍니다.

```
$username = $request->old('username');
```

라라벨에서는 글로벌 `old` 헬퍼 함수도 제공합니다. [Blade 템플릿](/docs/11.x/blade) 내에서 이전 입력값을 표시할 때 이 헬퍼를 활용하면 더욱 편리하게 폼을 다시 채울 수 있습니다. 해당 필드에 플래시된 입력값이 없다면 `null`이 반환됩니다.

```
<input type="text" name="username" value="{{ old('username') }}">
```

<a name="cookies"></a>
### 쿠키(Cookies)

<a name="retrieving-cookies-from-requests"></a>
#### 요청에서 쿠키 값 가져오기

라라벨 프레임워크에서 생성된 모든 쿠키는 암호화되고, 인증 코드로 서명되어 있습니다. 그래서 사용자가 쿠키 값을 임의로 변경하면 더 이상 유효하지 않게 됩니다. 요청(Request)에서 쿠키 값을 가져오려면 `Illuminate\Http\Request` 인스턴스의 `cookie` 메서드를 사용하세요.

```
$value = $request->cookie('name');
```

<a name="input-trimming-and-normalization"></a>
## 입력값 트리밍 및 정규화

라라벨은 기본적으로 애플리케이션의 전역 미들웨어 스택에 `Illuminate\Foundation\Http\Middleware\TrimStrings`와 `Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull` 미들웨어를 포함하고 있습니다. 이 미들웨어들은 요청에 들어오는 문자열 필드를 모두 자동으로 양쪽 공백을 제거(trim)하고, 빈 문자열은 자동으로 `null`로 변환합니다. 이를 통해 라우트나 컨트롤러에서 이와 관련된 정규화 작업을 따로 신경 쓸 필요가 없습니다.

#### 입력값 정규화 비활성화

이 동작을 모든 요청에 대해 비활성화하고 싶다면, 애플리케이션의 `bootstrap/app.php` 파일에서 `$middleware->remove` 메서드를 호출하여 두 미들웨어를 전역 미들웨어 스택에서 제거하면 됩니다.

```
use Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull;
use Illuminate\Foundation\Http\Middleware\TrimStrings;

->withMiddleware(function (Middleware $middleware) {
    $middleware->remove([
        ConvertEmptyStringsToNull::class,
        TrimStrings::class,
    ]);
})
```

특정 요청에 대해서만 문자열 트리밍과 빈 문자열 변환을 비활성화하고 싶다면, 애플리케이션의 `bootstrap/app.php` 파일에서 `trimStrings`, `convertEmptyStringsToNull` 미들웨어 메서드를 사용할 수 있습니다. 두 메서드는 각각 클로저 배열을 인자로 받으며, 클로저는 입력값 정규화를 건너뛸지 여부를 `true` 또는 `false`로 반환해야 합니다.

```
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
## 파일 처리

<a name="retrieving-uploaded-files"></a>
### 업로드된 파일 가져오기

업로드된 파일은 `Illuminate\Http\Request` 인스턴스의 `file` 메서드나 다이내믹 프로퍼티(dynamic property)를 통해 가져올 수 있습니다. `file` 메서드는 `Illuminate\Http\UploadedFile` 클래스의 인스턴스를 반환하며, 이 클래스는 PHP의 `SplFileInfo` 클래스를 확장하여 다양한 파일 관련 메서드를 제공합니다.

```
$file = $request->file('photo');

$file = $request->photo;
```

파일이 요청에 포함되어 있는지 확인하려면 `hasFile` 메서드를 사용하세요.

```
if ($request->hasFile('photo')) {
    // ...
}
```

<a name="validating-successful-uploads"></a>
#### 파일 업로드 성공 여부 검증

파일이 존재하는지만 확인하는 것 외에도, 업로드가 정상적으로 완료되었는지 `isValid` 메서드로 확인할 수 있습니다.

```
if ($request->file('photo')->isValid()) {
    // ...
}
```

<a name="file-paths-extensions"></a>
#### 파일 경로 및 확장자 얻기

`UploadedFile` 클래스에는 파일의 전체 경로와 확장자를 확인할 수 있는 메서드들이 있습니다. `extension` 메서드는 파일의 내용에 따라 확장자를 추측해서 반환합니다. 이 확장자는 실제 클라이언트가 보낸 확장자와 다를 수 있습니다.

```
$path = $request->photo->path();

$extension = $request->photo->extension();
```

<a name="other-file-methods"></a>
#### 그 밖의 파일 관련 메서드

`UploadedFile` 인스턴스에는 위에 소개된 것 외에도 다양한 메서드가 포함되어 있습니다. 더 많은 정보는 [해당 클래스의 API 문서](https://github.com/symfony/symfony/blob/6.0/src/Symfony/Component/HttpFoundation/File/UploadedFile.php)를 참고하세요.

<a name="storing-uploaded-files"></a>
### 업로드 파일 저장하기

업로드된 파일을 저장할 때는 보통 여러분이 미리 설정해 둔 [파일 시스템](/docs/11.x/filesystem) 중 하나를 사용하게 됩니다. `UploadedFile` 클래스의 `store` 메서드는 업로드된 파일을 디스크(로컬 파일 시스템이나 Amazon S3 같이 클라우드 스토리지)에 옮겨줍니다.

`store` 메서드는 파일이 저장될 경로를 파일 시스템 루트 디렉터리를 기준으로 상대경로로 받아들입니다. 이 경로에 파일명은 포함하지 않아야 하며, 라라벨이 자동으로 고유한 파일명을 생성해줍니다.

또한, 두 번째 인자로 어떤 디스크를 사용할지(저장 위치) 지정할 수 있습니다. 이 메서드는 파일의 경로를 디스크 루트 기준의 경로로 반환합니다.

```
$path = $request->photo->store('images');

$path = $request->photo->store('images', 's3');
```

자동 생성된 파일명을 쓰고 싶지 않은 경우에는 `storeAs` 메서드를 사용할 수 있습니다. 이 메서드는 경로, 파일명, 그리고 디스크명을 인자로 받습니다.

```
$path = $request->photo->storeAs('images', 'filename.jpg');

$path = $request->photo->storeAs('images', 'filename.jpg', 's3');
```

> [!NOTE]  
> 라라벨에서 파일 저장에 대해 더 자세한 내용은 [파일 저장소 전체 문서](/docs/11.x/filesystem)를 참고하세요.

<a name="configuring-trusted-proxies"></a>
## 신뢰할 수 있는 프록시(Trusted Proxies) 설정

로드 밸런서에서 TLS/SSL 인증서를 종료(종단)하여 애플리케이션을 운영하는 경우, `url` 헬퍼를 사용할 때 HTTPS 링크가 생성되지 않는 경우가 있을 수 있습니다. 이는 일반적으로 애플리케이션이 로드 밸런서에서 80번 포트로 트래픽을 전달받으면서, 안전한(secure) 링크를 생성해야 한다는 사실을 알지 못하기 때문입니다.

이 문제를 해결하려면, 라라벨에 내장된 `Illuminate\Http\Middleware\TrustProxies` 미들웨어를 활성화하십시오. 이 미들웨어를 사용하면 신뢰할 수 있는 로드 밸런서나 프록시를 직접 지정할 수 있습니다. 신뢰할 프록시는 애플리케이션의 `bootstrap/app.php` 파일에서 `trustProxies` 미들웨어 메서드로 지정할 수 있습니다.

```
->withMiddleware(function (Middleware $middleware) {
    $middleware->trustProxies(at: [
        '192.168.1.1',
        '10.0.0.0/8',
    ]);
})
```

신뢰할 프록시를 지정하는 것 외에도, 신뢰할 프록시 헤더를 설정할 수도 있습니다.

```
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
> AWS Elastic Load Balancing을 사용하는 경우 `headers` 값은 반드시 `Request::HEADER_X_FORWARDED_AWS_ELB`여야 합니다. 표준 `Forwarded` 헤더([RFC 7239](https://www.rfc-editor.org/rfc/rfc7239#section-4))를 사용하는 로드밸런서를 사용한다면, `headers` 값은 `Request::HEADER_FORWARDED`이어야 합니다. `headers`에 사용할 수 있는 상수에 대한 자세한 정보는 Symfony의 [프록시 신뢰 구성 문서](https://symfony.com/doc/7.0/deployment/proxies.html)를 참고하세요.

<a name="trusting-all-proxies"></a>
#### 모든 프록시 신뢰하기

Amazon AWS와 같은 "클라우드" 로드밸런서 공급자를 사용하는 경우, 실제 밸런서의 IP 주소를 파악할 수 없을 수도 있습니다. 이때는 `*`를 사용하여 모든 프록시를 신뢰할 수 있습니다.

```
->withMiddleware(function (Middleware $middleware) {
    $middleware->trustProxies(at: '*');
})
```

<a name="configuring-trusted-hosts"></a>
## 신뢰할 수 있는 호스트(Trusted Hosts) 설정

기본적으로 라라벨은 수신된 모든 요청에 대해 HTTP 요청의 `Host` 헤더 값이 무엇이든 관계없이 응답을 반환합니다. 또한, 요청이 웹 요청일 때 절대 URL을 생성할 때도 `Host` 헤더의 값이 사용됩니다.

일반적으로는 Nginx나 Apache 같은 웹 서버에서, 특정 호스트네임(hostname)과 일치하는 요청만 애플리케이션에 전달하도록 설정하는 것이 좋습니다. 하지만 웹 서버를 직접 설정할 수 없는 환경이거나 특정 호스트네임에만 라라벨이 응답하도록 제한해야 할 경우, 라라벨의 `Illuminate\Http\Middleware\TrustHosts` 미들웨어를 활성화하여 제어할 수 있습니다.

`TrustHosts` 미들웨어를 활성화하려면, 애플리케이션의 `bootstrap/app.php` 파일에서 `trustHosts` 미들웨어 메서드를 호출하면 됩니다. 이 메서드의 `at` 인자를 사용해 애플리케이션이 응답할 호스트네임 목록을 지정합니다. 지정하지 않은 다른 `Host` 헤더로 들어온 요청은 거부됩니다.

```
->withMiddleware(function (Middleware $middleware) {
    $middleware->trustHosts(at: ['laravel.test']);
})
```

기본적으로는 애플리케이션 URL의 하위 도메인에서 오는 요청도 자동으로 신뢰합니다. 이 동작을 비활성화하고 싶다면, `subdomains` 인자를 사용하십시오.

```
->withMiddleware(function (Middleware $middleware) {
    $middleware->trustHosts(at: ['laravel.test'], subdomains: false);
})
```

신뢰할 호스트 검증을 위해 애플리케이션의 설정 파일이나 데이터베이스를 참조해야 한다면, `at` 인자에 클로저를 전달할 수도 있습니다.

```
->withMiddleware(function (Middleware $middleware) {
    $middleware->trustHosts(at: fn () => config('app.trusted_hosts'));
})
```