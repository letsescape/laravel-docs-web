# HTTP 요청 (HTTP Requests)

- [소개](#introduction)
- [요청과의 상호작용](#interacting-with-the-request)
    - [Request 인스턴스 접근하기](#accessing-the-request)
    - [요청 경로, 호스트, 메서드](#request-path-and-method)
    - [요청 헤더](#request-headers)
    - [요청 IP 주소](#request-ip-address)
    - [콘텐츠 협상](#content-negotiation)
    - [PSR-7 요청](#psr7-requests)
- [입력값 처리](#input)
    - [입력값 조회](#retrieving-input)
    - [입력값 존재 확인](#input-presence)
    - [추가 입력 병합](#merging-additional-input)
    - [이전 입력값](#old-input)
    - [쿠키](#cookies)
    - [입력값 트리밍 및 정규화](#input-trimming-and-normalization)
- [파일](#files)
    - [업로드된 파일 조회](#retrieving-uploaded-files)
    - [업로드 파일 저장](#storing-uploaded-files)
- [신뢰할 수 있는 프록시 설정](#configuring-trusted-proxies)
- [신뢰할 수 있는 호스트 설정](#configuring-trusted-hosts)

<a name="introduction"></a>
## 소개

라라벨의 `Illuminate\Http\Request` 클래스는 현재 애플리케이션에서 처리 중인 HTTP 요청 객체와 상호작용할 수 있는 객체지향적 방식을 제공하며, 해당 요청과 함께 전달된 입력값, 쿠키, 파일 등을 손쉽게 조회할 수 있도록 해줍니다.

<a name="interacting-with-the-request"></a>
## 요청과의 상호작용

<a name="accessing-the-request"></a>
### Request 인스턴스 접근하기

현재 HTTP 요청 인스턴스를 의존성 주입을 통해 얻으려면, 라우트 클로저나 컨트롤러 메서드에서 `Illuminate\Http\Request` 클래스를 타입힌트해주면 됩니다. 들어오는 요청 인스턴스는 라라벨 [서비스 컨테이너](/docs/12.x/container)에 의해 자동으로 주입됩니다.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * 새 사용자를 저장합니다.
     */
    public function store(Request $request): RedirectResponse
    {
        $name = $request->input('name');

        // 사용자 저장 작업...

        return redirect('/users');
    }
}
```

앞서 설명한 것처럼, 라우트 클로저에서도 `Illuminate\Http\Request` 클래스를 타입힌트해서 동일하게 사용할 수 있습니다. 서비스 컨테이너가 해당 클로저가 실행될 때 들어온 요청을 알아서 주입해줍니다.

```php
use Illuminate\Http\Request;

Route::get('/', function (Request $request) {
    // ...
});
```

<a name="dependency-injection-route-parameters"></a>
#### 의존성 주입과 라우트 파라미터

컨트롤러에서 라우트 파라미터와 추가적인 의존성을 함께 받아야 하는 경우에는, 라우트 파라미터를 다른 의존성 뒤에 나열하면 됩니다. 예를 들어, 아래와 같이 라우트가 정의되어 있다면:

```php
use App\Http\Controllers\UserController;

Route::put('/user/{id}', [UserController::class, 'update']);
```

`Illuminate\Http\Request`를 타입힌트하면서, 아래와 같이 컨트롤러 메서드를 작성해 라우트 파라미터 `id`도 함께 받을 수 있습니다.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * 지정된 사용자를 업데이트합니다.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        // 사용자 업데이트 작업...

        return redirect('/users');
    }
}
```

<a name="request-path-and-method"></a>
### 요청 경로, 호스트, 메서드

`Illuminate\Http\Request` 인스턴스는 들어온 HTTP 요청을 다양하게 검사하고, `Symfony\Component\HttpFoundation\Request` 클래스를 확장하여 여러 유용한 메서드를 제공합니다. 이 중 자주 사용되는 몇 가지 메서드에 대해 살펴보겠습니다.

<a name="retrieving-the-request-path"></a>
#### 요청 경로 조회

`path` 메서드를 사용하면 요청의 경로 정보를 얻을 수 있습니다. 예를 들어, 요청이 `http://example.com/foo/bar`로 들어왔다면, `path` 메서드는 `foo/bar`를 반환합니다.

```php
$uri = $request->path();
```

<a name="inspecting-the-request-path"></a>
#### 요청 경로/라우트 검사

`is` 메서드는 들어온 요청 경로가 특정 패턴과 일치하는지 확인할 수 있습니다. 이때, `*` 문자를 와일드카드로 사용할 수 있습니다.

```php
if ($request->is('admin/*')) {
    // ...
}
```

`routeIs` 메서드는 현재 요청이 [이름이 지정된 라우트](/docs/12.x/routing#named-routes)와 일치하는지 확인할 때 사용할 수 있습니다.

```php
if ($request->routeIs('admin.*')) {
    // ...
}
```

<a name="retrieving-the-request-url"></a>
#### 요청 URL 조회

들어온 요청의 전체 URL을 조회하려면 `url` 또는 `fullUrl` 메서드를 사용할 수 있습니다. `url` 메서드는 쿼리 스트링 없이 URL을 반환하고, `fullUrl` 메서드는 쿼리 스트링까지 포함한 전체 URL을 반환합니다.

```php
$url = $request->url();

$urlWithQueryString = $request->fullUrl();
```

현재 URL에 쿼리 스트링 데이터를 추가하고 싶다면, `fullUrlWithQuery` 메서드를 사용할 수 있습니다. 이 메서드는 전달한 배열의 쿼리스트링을 현재 쿼리스트링과 결합하여 반환합니다.

```php
$request->fullUrlWithQuery(['type' => 'phone']);
```

특정 쿼리스트링 파라미터를 제외한 현재 URL을 얻고 싶다면 `fullUrlWithoutQuery` 메서드를 사용할 수 있습니다.

```php
$request->fullUrlWithoutQuery(['type']);
```

<a name="retrieving-the-request-host"></a>
#### 요청 호스트 조회

들어온 요청의 "호스트" 정보는 `host`, `httpHost`, `schemeAndHttpHost` 메서드를 통해 각각 확인할 수 있습니다.

```php
$request->host();
$request->httpHost();
$request->schemeAndHttpHost();
```

<a name="retrieving-the-request-method"></a>
#### 요청 메서드 조회

`method` 메서드는 요청의 HTTP 메서드(예: GET, POST 등)를 반환합니다. 특정 HTTP 메서드인지 확인하려면 `isMethod` 메서드를 사용할 수 있습니다.

```php
$method = $request->method();

if ($request->isMethod('post')) {
    // ...
}
```

<a name="request-headers"></a>
### 요청 헤더

`Illuminate\Http\Request` 인스턴스에서 `header` 메서드를 이용하면 요청 헤더 값을 가져올 수 있습니다. 해당 헤더가 존재하지 않으면 `null`이 반환됩니다. 하지만, 두 번째 인수에 기본값을 지정하면, 헤더가 없을 때 해당 값이 반환됩니다.

```php
$value = $request->header('X-Header-Name');

$value = $request->header('X-Header-Name', 'default');
```

`hasHeader` 메서드를 사용하면 요청에 특정 헤더가 포함되어 있는지 확인할 수 있습니다.

```php
if ($request->hasHeader('X-Header-Name')) {
    // ...
}
```

편의를 위해 `bearerToken` 메서드를 사용하면 `Authorization` 헤더에 있는 bearer 토큰을 바로 얻을 수 있습니다. 해당 헤더가 없으면 빈 문자열이 반환됩니다.

```php
$token = $request->bearerToken();
```

<a name="request-ip-address"></a>
### 요청 IP 주소

요청을 보낸 클라이언트의 IP 주소를 얻으려면 `ip` 메서드를 사용할 수 있습니다.

```php
$ipAddress = $request->ip();
```

프록시를 통해 전달된 IP 주소를 포함해, 모든 클라이언트 IP의 배열을 조회하려면 `ips` 메서드를 사용하면 됩니다. "원본" 클라이언트 IP 주소는 배열의 마지막 요소에 위치합니다.

```php
$ipAddresses = $request->ips();
```

일반적으로, IP 주소는 신뢰할 수 없는 사용자 입력값으로 간주되어야 하며, 정보 제공 용도로만 활용해야 합니다.

<a name="content-negotiation"></a>
### 콘텐츠 협상

라라벨에서는 들어오는 요청의 `Accept` 헤더를 바탕으로 요청자가 어떤 콘텐츠 타입을 원하는지 다양한 메서드로 확인할 수 있습니다. 먼저, `getAcceptableContentTypes` 메서드는 요청에서 받아들일 수 있는 모든 콘텐츠 타입 배열을 반환합니다.

```php
$contentTypes = $request->getAcceptableContentTypes();
```

`accepts` 메서드는 전달한 콘텐츠 타입 배열 중 하나라도 요청에서 허용된다면 `true`를 반환하며, 그렇지 않으면 `false`를 반환합니다.

```php
if ($request->accepts(['text/html', 'application/json'])) {
    // ...
}
```

`prefers` 메서드는 전달된 콘텐츠 타입 배열 중에서 요청이 가장 선호하는 타입을 반환합니다. 만약 요청에서 허용하지 않는 타입만 전달했다면 `null`이 반환됩니다.

```php
$preferred = $request->prefers(['text/html', 'application/json']);
```

많은 애플리케이션이 HTML 또는 JSON만 응답하는 경우가 많기 때문에, `expectsJson` 메서드를 이용해 요청이 JSON 응답을 기대하는지 여부를 빠르게 확인할 수 있습니다.

```php
if ($request->expectsJson()) {
    // ...
}
```

<a name="psr7-requests"></a>
### PSR-7 요청

[PSR-7 표준](https://www.php-fig.org/psr/psr-7/)은 HTTP 메시지(요청과 응답)의 인터페이스를 정의합니다. 라라벨이 아닌 PSR-7 요청 인스턴스를 얻고 싶다면 몇 가지 라이브러리를 먼저 설치해야 합니다. 라라벨은 *Symfony HTTP Message Bridge* 컴포넌트를 사용해 일반 라라벨 요청과 응답을 PSR-7 호환 구현체로 변환합니다.

```shell
composer require symfony/psr-http-message-bridge
composer require nyholm/psr7
```

이 라이브러리들을 설치했다면, 라우트 클로저나 컨트롤러 메서드에서 요청 인터페이스를 타입힌트하여 PSR-7 요청 인스턴스를 받을 수 있습니다.

```php
use Psr\Http\Message\ServerRequestInterface;

Route::get('/', function (ServerRequestInterface $request) {
    // ...
});
```

> [!NOTE]
> 라우트 또는 컨트롤러에서 PSR-7 응답 인스턴스를 반환하면, 라라벨이 자동으로 이를 다시 라라벨 응답 인스턴스로 변환해 화면에 표시합니다.

<a name="input"></a>
## 입력값 처리

<a name="retrieving-input"></a>
### 입력값 조회

<a name="retrieving-all-input-data"></a>
#### 모든 입력 데이터 조회

들어온 요청의 모든 입력값을 `array` 형태로 가져오려면 `all` 메서드를 사용합니다. 이 메서드는 요청이 HTML 폼에서 왔는지, XHR 요청인지 관계없이 사용할 수 있습니다.

```php
$input = $request->all();
```

`collect` 메서드를 사용하면 모든 입력값을 [컬렉션](/docs/12.x/collections)으로 가져올 수 있습니다.

```php
$input = $request->collect();
```

또한, `collect` 메서드는 일부 입력값만을 컬렉션 형태로 가져올 수도 있습니다.

```php
$request->collect('users')->each(function (string $user) {
    // ...
});
```

<a name="retrieving-an-input-value"></a>
#### 특정 입력값 조회

몇 가지 간단한 메서드를 사용하여, 요청이 어떤 HTTP 메서드로 전달되었는지 신경쓰지 않고 `Illuminate\Http\Request` 인스턴스에서 사용자 입력값을 쉽게 가져올 수 있습니다. `input` 메서드는 HTTP 메서드에 관계없이 원하는 값을 반환합니다.

```php
$name = $request->input('name');
```

`input` 메서드의 두 번째 인자로 기본값을 전달할 수 있습니다. 요청에 해당 입력값이 없으면 이 값이 반환됩니다.

```php
$name = $request->input('name', 'Sally');
```

폼 데이터에 배열 형태의 입력이 포함된 경우, "dot" 표기법을 사용해 배열의 특정 값을 조회할 수 있습니다.

```php
$name = $request->input('products.0.name');

$names = $request->input('products.*.name');
```

인수를 전달하지 않고 `input` 메서드를 호출하면, 모든 입력값을 연관 배열로 가져옵니다.

```php
$input = $request->input();
```

<a name="retrieving-input-from-the-query-string"></a>
#### 쿼리스트링에서 입력값 조회

`input` 메서드는 전체 요청 데이터를 조회하는 반면, `query` 메서드는 오직 쿼리스트링에서만 값을 조회합니다.

```php
$name = $request->query('name');
```

쿼리스트링에 해당 값이 없으면 두 번째 인수의 기본값을 반환합니다.

```php
$name = $request->query('name', 'Helen');
```

인자를 생략하고 `query` 메서드를 호출하면, 모든 쿼리스트링 값을 연관 배열로 반환합니다.

```php
$query = $request->query();
```

<a name="retrieving-json-input-values"></a>
#### JSON 입력값 조회

애플리케이션으로 JSON 요청이 전달되는 경우, 요청의 `Content-Type` 헤더가 `application/json`으로 제대로 설정되어 있다면, `input` 메서드를 통해 JSON 데이터를 조회할 수 있습니다. 또한, "dot" 표기법으로 JSON 배열/객체 내부의 값을 쉽게 가져올 수 있습니다.

```php
$name = $request->input('user.name');
```

<a name="retrieving-stringable-input-values"></a>
#### Stringable 입력값 조회

입력값을 단순 문자열이 아닌 [Illuminate\Support\Stringable](/docs/12.x/strings) 인스턴스로 사용하고 싶을 때는 `string` 메서드를 사용할 수 있습니다.

```php
$name = $request->string('name')->trim();
```

<a name="retrieving-integer-input-values"></a>
#### 정수(integer) 입력값 조회

입력값을 정수로 가져오고 싶을 때는 `integer` 메서드를 사용할 수 있습니다. 이 메서드는 입력값을 정수로 캐스팅해 반환합니다. 입력이 없거나 캐스팅에 실패하면 지정한 기본값을 반환합니다. 페이징이나 기타 숫자 입력값 처리에 유용합니다.

```php
$perPage = $request->integer('per_page');
```

<a name="retrieving-boolean-input-values"></a>
#### 불리언(boolean) 입력값 조회

HTML 체크박스 등에서 "true"나 "on" 등 문자열로 "참" 값을 받는 경우가 많습니다. 이럴 때는 `boolean` 메서드를 사용하여 입력값을 불리언으로 변환해 쉽게 처리할 수 있습니다. `boolean` 메서드는 1, "1", true, "true", "on", "yes"에 대해 `true`를 반환하고, 그 외 값은 모두 `false`를 반환합니다.

```php
$archived = $request->boolean('archived');
```

<a name="retrieving-date-input-values"></a>
#### 날짜 입력값 조회

날짜/시간이 포함된 입력값은 `date` 메서드를 사용하여 Carbon 인스턴스로 바로 가져올 수 있습니다. 해당 값이 없다면 `null`이 반환됩니다.

```php
$birthday = $request->date('birthday');
```

`date` 메서드의 두 번째, 세 번째 인자를 사용하면 날짜 포맷 및 타임존을 지정할 수 있습니다.

```php
$elapsed = $request->date('elapsed', '!H:i', 'Europe/Madrid');
```

입력값이 있지만 포맷이 올바르지 않으면 `InvalidArgumentException`이 발생하므로, 이 메서드를 사용하기 전에 입력값을 유효성 검사하는 것이 좋습니다.

<a name="retrieving-enum-input-values"></a>
#### 열거형(Enum) 입력값 조회

[PHP 열거형(enum)](https://www.php.net/manual/en/language.types.enumerations.php)에 대응하는 입력값도 요청에서 가져올 수 있습니다. 해당 이름의 입력값이 없거나, enum에서 일치하는 백업 값(backing value)을 찾지 못하면 `null`이 반환됩니다. `enum` 메서드는 입력값 이름과 enum 클래스를 각각 첫 번째, 두 번째 인수로 받습니다.

```php
use App\Enums\Status;

$status = $request->enum('status', Status::class);
```

입력값 배열이 각각 PHP enum에 해당된다면 `enums` 메서드를 사용하면 enum 인스턴스 배열을 반환받을 수 있습니다.

```php
use App\Enums\Product;

$products = $request->enums('products', Product::class);
```

<a name="retrieving-input-via-dynamic-properties"></a>
#### 동적 프로퍼티로 입력값 조회

`Illuminate\Http\Request` 인스턴스에서 동적 프로퍼티를 통해서도 사용자 입력값에 접근할 수 있습니다. 예를 들어, 애플리케이션 폼에 `name` 필드가 있을 경우 아래처럼 값을 조회할 수 있습니다.

```php
$name = $request->name;
```

동적 프로퍼티를 사용할 때, 라라벨은 먼저 요청 페이로드에서 해당 파라미터 값을 찾고, 없다면 매칭된 라우트의 파라미터에서 값을 찾습니다.

<a name="retrieving-a-portion-of-the-input-data"></a>
#### 일부 입력값만 추출하기

입력 데이터에서 일부분만 필요하다면 `only` 또는 `except` 메서드를 사용할 수 있습니다. 이 두 메서드는 하나의 배열 또는 여러 인수를 받을 수 있습니다.

```php
$input = $request->only(['username', 'password']);

$input = $request->only('username', 'password');

$input = $request->except(['credit_card']);

$input = $request->except('credit_card');
```

> [!WARNING]
> `only` 메서드는 요청에 존재하는 키/값 쌍만 반환하며, 요청에 없는 키/값 쌍은 반환하지 않습니다.

<a name="input-presence"></a>
### 입력값 존재 확인

`has` 메서드를 사용하면 요청에 특정 값이 포함되어 있는지 확인할 수 있습니다. 해당 값이 존재하면 `true`를 반환합니다.

```php
if ($request->has('name')) {
    // ...
}
```

배열을 인수로 전달하면, 지정한 모든 값이 요청에 존재해야 `true`를 반환합니다.

```php
if ($request->has(['name', 'email'])) {
    // ...
}
```

`hasAny` 메서드는 지정한 값 중 하나라도 존재하면 `true`를 반환합니다.

```php
if ($request->hasAny(['name', 'email'])) {
    // ...
}
```

`whenHas` 메서드는 값이 요청에 존재할 경우 지정한 클로저를 실행합니다.

```php
$request->whenHas('name', function (string $input) {
    // ...
});
```

두 번째 클로저를 추가로 전달하면, 해당 값이 존재하지 않을 때 실행됩니다.

```php
$request->whenHas('name', function (string $input) {
    // "name" 값이 존재합니다...
}, function () {
    // "name" 값이 존재하지 않습니다...
});
```

값이 요청에 존재하고, 비어 있지 않은(빈 문자열이 아닌) 경우를 확인하려면 `filled` 메서드를 사용할 수 있습니다.

```php
if ($request->filled('name')) {
    // ...
}
```

요청에 값이 없거나 비어 있는 경우를 확인하려면 `isNotFilled` 메서드를 사용합니다.

```php
if ($request->isNotFilled('name')) {
    // ...
}
```

배열을 전달하면, 지정한 값이 모두 없거나 비어 있는 경우 `isNotFilled`가 `true`를 반환합니다.

```php
if ($request->isNotFilled(['name', 'email'])) {
    // ...
}
```

`anyFilled` 메서드는 전달된 값들 중 하나라도 비어있지 않으면 `true`를 반환합니다.

```php
if ($request->anyFilled(['name', 'email'])) {
    // ...
}
```

`whenFilled` 메서드는 값이 존재하고 비어 있지 않을 때 지정한 클로저를 실행합니다.

```php
$request->whenFilled('name', function (string $input) {
    // ...
});
```

두 번째 클로저를 함께 전달하면, 해당 값이 "filled"가 아닐 때(없거나 빈 문자열일 때) 실행됩니다.

```php
$request->whenFilled('name', function (string $input) {
    // "name" 값이 비어 있지 않습니다...
}, function () {
    // "name" 값이 비어 있거나 존재하지 않습니다...
});
```

특정 키가 요청에 존재하지 않는 경우를 확인하려면 `missing` 및 `whenMissing` 메서드를 사용할 수 있습니다.

```php
if ($request->missing('name')) {
    // ...
}

$request->whenMissing('name', function () {
    // "name" 값이 존재하지 않습니다...
}, function () {
    // "name" 값이 존재합니다...
});
```

<a name="merging-additional-input"></a>

### 추가 입력 병합하기

때로는 요청(Request)에 이미 존재하는 입력 데이터에 추가 데이터를 수동으로 병합해야 할 수도 있습니다. 이를 위해 `merge` 메서드를 사용할 수 있습니다. 만약 지정한 입력 키가 요청에 이미 존재한다면, `merge` 메서드에 전달한 데이터로 기존 값이 덮어쓰기 됩니다.

```php
$request->merge(['votes' => 0]);
```

`mergeIfMissing` 메서드는 요청의 입력 데이터에 해당 키가 이미 존재하지 않을 경우에만 새로운 입력을 병합할 때 사용할 수 있습니다.

```php
$request->mergeIfMissing(['votes' => 0]);
```

<a name="old-input"></a>
### 이전 입력값

라라벨에서는 한 요청에서 입력받은 데이터를 다음 요청에서도 유지할 수 있습니다. 이 기능은 주로 유효성 검사에서 오류가 발생한 후, 폼을 다시 채워 넣을 때 유용합니다. 단, 라라벨에서 제공하는 [유효성 검증 기능](/docs/12.x/validation)을 사용하는 경우에는, 별도로 세션 입력 플래시(flash) 메서드를 직접 사용할 필요가 없을 수도 있습니다. 라라벨의 내장 유효성 검증 기능에서 자동으로 호출해줄 수 있기 때문입니다.

<a name="flashing-input-to-the-session"></a>
#### 세션에 입력값 플래시하기

`Illuminate\Http\Request` 클래스의 `flash` 메서드는 현재 요청의 입력값을 [세션](/docs/12.x/session)에 플래시하여, 사용자가 다음 요청(예: 리디렉션 후)에 해당 입력값을 사용할 수 있도록 해줍니다.

```php
$request->flash();
```

또한, `flashOnly`와 `flashExcept` 메서드를 사용하면 입력값 중 일부만 세션에 플래시할 수 있습니다. 이 메서드는 비밀번호처럼 민감한 정보를 세션에 남기지 않으려 할 때 유용합니다.

```php
$request->flashOnly(['username', 'email']);

$request->flashExcept('password');
```

<a name="flashing-input-then-redirecting"></a>
#### 입력값을 플래시하고 리디렉션하기

실무에서는 세션에 입력값을 플래시한 후 이전 페이지로 리디렉션하는 경우가 많습니다. 이때는 `withInput` 메서드를 사용하여 리디렉션과 입력값 플래시를 쉽게 체이닝할 수 있습니다.

```php
return redirect('/form')->withInput();

return redirect()->route('user.create')->withInput();

return redirect('/form')->withInput(
    $request->except('password')
);
```

<a name="retrieving-old-input"></a>
#### 이전 입력값 불러오기

이전 요청에서 플래시된 입력값을 가져오려면, `Illuminate\Http\Request` 인스턴스에서 `old` 메서드를 호출하면 됩니다. `old` 메서드는 [세션](/docs/12.x/session)에서 이전에 플래시된 입력값을 불러옵니다.

```php
$username = $request->old('username');
```

라라벨은 전역 `old` 헬퍼 함수도 제공합니다. [Blade 템플릿](/docs/12.x/blade)에서 이전 입력값을 표시할 때는 `old` 헬퍼를 사용하면 더욱 편리합니다. 해당 필드에 대한 이전 입력이 없으면 `null`이 반환됩니다.

```blade
<input type="text" name="username" value="{{ old('username') }}">
```

<a name="cookies"></a>
### 쿠키

<a name="retrieving-cookies-from-requests"></a>
#### 요청에서 쿠키 가져오기

라라벨에서 생성된 모든 쿠키는 암호화되고 인증 코드로 서명되므로, 클라이언트에서 쿠키가 변경되었다면 무효한 쿠키로 간주됩니다. 요청에서 쿠키 값을 가져오려면, `Illuminate\Http\Request` 인스턴스의 `cookie` 메서드를 사용하면 됩니다.

```php
$value = $request->cookie('name');
```

<a name="input-trimming-and-normalization"></a>
## 입력값 트리밍 및 정규화

라라벨은 기본적으로 애플리케이션의 전역 미들웨어 스택에 `Illuminate\Foundation\Http\Middleware\TrimStrings`와 `Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull` 미들웨어를 포함합니다. 이 미들웨어들은 요청(Request)으로 들어오는 모든 문자열 필드를 자동으로 트리밍(양쪽 공백 제거)하고, 빈 문자열 필드는 자동으로 `null`로 변환합니다. 따라서 라우트나 컨트롤러에서 이러한 정규화 처리에 신경 쓸 필요가 없습니다.

#### 입력값 정규화 비활성화

모든 요청에 대해 이러한 기능을 비활성화하고 싶다면, 애플리케이션의 `bootstrap/app.php` 파일에서 `$middleware->remove` 메서드를 통해 두 미들웨어를 미들웨어 스택에서 제거할 수 있습니다.

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

특정 요청에 대해서만 문자열 트리밍 또는 빈 문자열 변환을 비활성화하려면, `bootstrap/app.php` 파일에서 `trimStrings`와 `convertEmptyStringsToNull` 미들웨어 메서드를 사용할 수 있습니다. 두 메서드 모두 클로저 배열을 인자로 받으며, 각 클로저는 입력값 정규화를 스킵할지 여부를 `true` 또는 `false`로 반환해야 합니다.

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

`Illuminate\Http\Request` 인스턴스에서 `file` 메서드 또는 동적 프로퍼티를 사용하여 업로드된 파일을 가져올 수 있습니다. `file` 메서드는 `Illuminate\Http\UploadedFile` 클래스의 인스턴스를 반환하며, 이 클래스는 PHP의 `SplFileInfo`를 상속하고 파일과 상호작용할 수 있는 다양한 메서드를 제공합니다.

```php
$file = $request->file('photo');

$file = $request->photo;
```

파일이 요청에 포함되어 있는지 확인하려면 `hasFile` 메서드를 사용할 수 있습니다.

```php
if ($request->hasFile('photo')) {
    // ...
}
```

<a name="validating-successful-uploads"></a>
#### 업로드 성공 검증

파일이 존재하는지만 확인하는 것에 더해, `isValid` 메서드를 사용하여 파일 업로드에 문제가 없었는지도 검증할 수 있습니다.

```php
if ($request->file('photo')->isValid()) {
    // ...
}
```

<a name="file-paths-extensions"></a>
#### 파일 경로 및 확장자

`UploadedFile` 클래스에는 파일의 전체 경로와 확장자를 확인할 수 있는 메서드도 포함되어 있습니다. `extension` 메서드는 파일의 내용을 기반으로 확장자를 추측합니다. 이 확장자는 클라이언트가 보낸 확장자와 다를 수 있습니다.

```php
$path = $request->photo->path();

$extension = $request->photo->extension();
```

<a name="other-file-methods"></a>
#### 기타 파일 관련 메서드

`UploadedFile` 인스턴스에서 사용할 수 있는 다른 다양한 메서드들도 있습니다. 더 많은 정보는 [클래스의 API 문서](https://github.com/symfony/symfony/blob/6.0/src/Symfony/Component/HttpFoundation/File/UploadedFile.php)에서 확인할 수 있습니다.

<a name="storing-uploaded-files"></a>
### 업로드된 파일 저장하기

업로드된 파일을 저장할 때는 일반적으로 설정된 [파일시스템](/docs/12.x/filesystem)을 사용합니다. `UploadedFile` 클래스는 업로드된 파일을 로컬 파일시스템이나 Amazon S3와 같은 클라우드 스토리지 등, 설정한 디스크로 이동할 수 있는 `store` 메서드를 제공합니다.

`store` 메서드는 파일을 저장할 경로(파일시스템 루트에서의 상대경로)를 인자로 받으며, 파일명은 포함하지 않아야 합니다. 고유한 ID가 자동으로 파일명으로 생성되어 저장됩니다.

또한, 디스크명을 선택적으로 두 번째 인자로 지정할 수 있습니다. 이 메서드는 디스크의 루트에서 상대경로로 저장된 파일 경로를 반환합니다.

```php
$path = $request->photo->store('images');

$path = $request->photo->store('images', 's3');
```

파일명을 자동으로 생성하지 않고, 직접 지정하고 싶다면 `storeAs` 메서드를 사용할 수 있습니다. 이 메서드는 경로, 파일명, 디스크명을 인자로 받습니다.

```php
$path = $request->photo->storeAs('images', 'filename.jpg');

$path = $request->photo->storeAs('images', 'filename.jpg', 's3');
```

> [!NOTE]
> 라라벨의 파일 저장소에 대해 더 자세한 정보가 필요하다면, [파일 저장소 문서](/docs/12.x/filesystem)를 참고하시기 바랍니다.

<a name="configuring-trusted-proxies"></a>
## 신뢰할 수 있는 프록시 설정

TLS/SSL 인증서를 종료 처리하는 로드 밸런서 뒤에서 애플리케이션을 운영할 때, `url` 헬퍼를 사용해도 HTTPS 링크가 생성되지 않는 현상을 경험할 수 있습니다. 이는 주로 애플리케이션이 로드 밸런서로부터 80번 포트로 트래픽을 전달받아, 안전한 링크를 생성해야 한다는 사실을 인지하지 못하기 때문입니다.

이러한 문제를 해결하려면, 라라벨 애플리케이션에 기본 포함된 `Illuminate\Http\Middleware\TrustProxies` 미들웨어를 활성화하여, 신뢰할 수 있는 로드 밸런서 또는 프록시를 간편하게 지정할 수 있습니다. 신뢰할 프록시는 애플리케이션의 `bootstrap/app.php` 파일에서 `trustProxies` 미들웨어 메서드를 통해 지정합니다.

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->trustProxies(at: [
        '192.168.1.1',
        '10.0.0.0/8',
    ]);
})
```

신뢰할 프록시를 지정하는 것 외에도, 신뢰해야 하는 프록시 헤더도 설정할 수 있습니다.

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
> AWS Elastic Load Balancing을 사용하는 경우, `headers` 값은 `Request::HEADER_X_FORWARDED_AWS_ELB`이어야 합니다. 로드 밸런서가 [RFC 7239](https://www.rfc-editor.org/rfc/rfc7239#section-4)의 표준 `Forwarded` 헤더를 사용한다면, `headers` 값은 `Request::HEADER_FORWARDED`이어야 합니다. `headers`에 사용할 수 있는 상수에 대한 자세한 정보는 Symfony의 [신뢰할 수 있는 프록시](https://symfony.com/doc/current/deployment/proxies.html) 문서를 참고하세요.

<a name="trusting-all-proxies"></a>
#### 모든 프록시를 신뢰

Amazon AWS나 기타 "클라우드" 로드 밸런서 서비스를 사용하는 경우, 실제 밸런서의 IP 주소를 알 수 없는 경우가 있습니다. 이럴 때는 `*`를 사용해 모든 프록시를 신뢰할 수 있습니다.

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->trustProxies(at: '*');
})
```

<a name="configuring-trusted-hosts"></a>
## 신뢰할 수 있는 호스트 설정

기본적으로 라라벨 애플리케이션은 들어오는 모든 요청의 HTTP `Host` 헤더 내용에 상관없이 응답합니다. 또한, 웹 요청 중 절대 URL을 생성할 때도 `Host` 헤더의 값을 사용합니다.

일반적으로는 Nginx나 Apache와 같은 웹서버에서 특정 호스트명만 애플리케이션에 전달되도록 서버를 설정해야 합니다. 하지만, 웹서버를 직접 커스터마이징할 수 없는 상황에서 라라벨로 특정 호스트명에만 응답하도록 제한하고 싶다면, `Illuminate\Http\Middleware\TrustHosts` 미들웨어를 활성화하면 됩니다.

`TrustHosts` 미들웨어를 활성화하려면, 애플리케이션의 `bootstrap/app.php` 파일에서 `trustHosts` 미들웨어 메서드를 호출해야 합니다. 이때 `at` 인자를 사용해 애플리케이션이 응답할 호스트명을 지정할 수 있습니다. 지정된 호스트명이 아닌 `Host` 헤더로 유입된 요청은 거부됩니다.

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->trustHosts(at: ['laravel.test']);
})
```

기본적으로, 애플리케이션의 URL의 하위 도메인에서 들어오는 요청도 자동으로 신뢰합니다. 이 동작을 비활성화하려면 `subdomains` 인자를 사용할 수 있습니다.

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->trustHosts(at: ['laravel.test'], subdomains: false);
})
```

신뢰할 호스트 값을 애플리케이션의 설정 파일이나 데이터베이스에서 동적으로 가져와야 한다면, `at` 인자에 클로저를 전달하여 처리할 수 있습니다.

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->trustHosts(at: fn () => config('app.trusted_hosts'));
})
```