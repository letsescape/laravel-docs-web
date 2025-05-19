# HTTP 요청 (HTTP Requests)

- [소개](#introduction)
- [요청과 상호작용하기](#interacting-with-the-request)
    - [요청 객체 접근하기](#accessing-the-request)
    - [요청 경로, 호스트, 메서드 확인](#request-path-and-method)
    - [요청 헤더](#request-headers)
    - [요청 IP 주소](#request-ip-address)
    - [콘텐츠 협상(Content Negotiation)](#content-negotiation)
    - [PSR-7 요청](#psr7-requests)
- [입력값 처리](#input)
    - [입력값 조회](#retrieving-input)
    - [입력값의 존재 여부 확인](#determining-if-input-is-present)
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

라라벨의 `Illuminate\Http\Request` 클래스는 여러분의 애플리케이션에서 처리 중인 현재 HTTP 요청에 대해 객체 지향적으로 접근할 수 있도록 하며, 요청과 함께 전달된 입력값, 쿠키, 파일 등을 쉽게 조회할 수 있게 도와줍니다.

<a name="interacting-with-the-request"></a>
## 요청과 상호작용하기

<a name="accessing-the-request"></a>
### 요청 객체 접근하기

의존성 주입(dependency injection)을 활용하여 현재 HTTP 요청 인스턴스를 얻으려면, 라우트 클로저 또는 컨트롤러 메서드에서 `Illuminate\Http\Request` 클래스를 타입힌트로 지정하면 됩니다. 라라벨의 [서비스 컨테이너](/docs/9.x/container)가 자동으로 해당 요청 인스턴스를 주입해 줍니다.

```
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * 새 사용자 저장
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $name = $request->input('name');

        //
    }
}
```

위 예시와 같이, 라우트 클로저에도 `Illuminate\Http\Request`를 타입힌트로 지정할 수 있습니다. 서비스 컨테이너가 클로저 실행 시 자동으로 요청을 주입해줍니다.

```
use Illuminate\Http\Request;

Route::get('/', function (Request $request) {
    //
});
```

<a name="dependency-injection-route-parameters"></a>
#### 의존성 주입과 라우트 파라미터

컨트롤러 메서드에서 라우트 파라미터 입력값도 함께 받을 경우, 라우트 파라미터는 다른 의존성 인자들 뒤에 나열해야 합니다. 예를 들어, 아래처럼 라우트가 정의되어 있다면,

```
use App\Http\Controllers\UserController;

Route::put('/user/{id}', [UserController::class, 'update']);
```

컨트롤러 메서드에서 `Illuminate\Http\Request`는 타입힌트로, 라우트 파라미터인 `id`는 뒤쪽 인자로 받을 수 있습니다.

```
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * 지정한 사용자 정보 수정
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }
}
```

<a name="request-path-and-method"></a>
### 요청 경로, 호스트, 메서드 확인

`Illuminate\Http\Request` 인스턴스를 이용하면 다양한 메서드를 통해 들어온 HTTP 요청 정보를 조회할 수 있습니다. 이 클래스는 `Symfony\Component\HttpFoundation\Request`를 확장하고 있습니다. 이 중 주요 메서드들을 아래에서 살펴보겠습니다.

<a name="retrieving-the-request-path"></a>
#### 요청 경로 조회

`path` 메서드는 요청의 경로(path) 정보를 반환합니다. 예를 들어, 요청 주소가 `http://example.com/foo/bar`라면, `path` 메서드는 `foo/bar`를 반환합니다.

```
$uri = $request->path();
```

<a name="inspecting-the-request-path"></a>
#### 요청 경로/라우트 검사

`is` 메서드를 활용하면, 들어오는 요청 경로가 특정 패턴과 일치하는지 확인할 수 있습니다. 이때 `*` 문자를 와일드카드로 사용할 수 있습니다.

```
if ($request->is('admin/*')) {
    //
}
```

또한, `routeIs` 메서드를 이용하면, 현재 요청이 [이름이 지정된 라우트](/docs/9.x/routing#named-routes)와 일치하는지 확인할 수 있습니다.

```
if ($request->routeIs('admin.*')) {
    //
}
```

<a name="retrieving-the-request-url"></a>
#### 요청 URL 조회

요청의 전체 URL을 가져오려면 `url` 또는 `fullUrl` 메서드를 사용할 수 있습니다. `url` 메서드는 쿼리 문자열을 제외한 URL을, `fullUrl` 메서드는 쿼리 문자열을 포함한 전체 URL을 반환합니다.

```
$url = $request->url();

$urlWithQueryString = $request->fullUrl();
```

현재 URL에 쿼리 문자열 데이터를 추가하고 싶다면, `fullUrlWithQuery` 메서드를 사용할 수 있습니다. 이 메서드는 기존 쿼리 스트링에 주어진 배열의 값들을 합쳐서 반환합니다.

```
$request->fullUrlWithQuery(['type' => 'phone']);
```

<a name="retrieving-the-request-host"></a>
#### 요청 호스트 조회

`host`, `httpHost`, `schemeAndHttpHost` 메서드를 사용하면 들어온 요청의 "호스트" 정보를 각각 가져올 수 있습니다.

```
$request->host();
$request->httpHost();
$request->schemeAndHttpHost();
```

<a name="retrieving-the-request-method"></a>
#### 요청 메서드(HTTP 동사) 조회

`method` 메서드는 요청의 HTTP 메서드(동사)를 반환합니다. 또한 `isMethod` 메서드를 사용해 요청의 HTTP 메서드가 특정 문자열과 일치하는지 확인할 수 있습니다.

```
$method = $request->method();

if ($request->isMethod('post')) {
    //
}
```

<a name="request-headers"></a>
### 요청 헤더

`Illuminate\Http\Request` 인스턴스의 `header` 메서드로 요청 헤더 정보를 가져올 수 있습니다. 해당 헤더가 요청에 없으면 `null`이 반환됩니다. 하지만 두 번째 값으로 기본값을 전달할 수 있으며, 헤더가 없을 경우 이 값이 반환됩니다.

```
$value = $request->header('X-Header-Name');

$value = $request->header('X-Header-Name', 'default');
```

특정 헤더가 요청에 포함되었는지 확인하려면 `hasHeader` 메서드를 사용할 수 있습니다.

```
if ($request->hasHeader('X-Header-Name')) {
    //
}
```

편리하게 `Authorization` 헤더에서 Bearer 토큰 값을 꺼내려면 `bearerToken` 메서드를 사용할 수 있습니다. 해당 헤더가 없을 경우 빈 문자열이 반환됩니다.

```
$token = $request->bearerToken();
```

<a name="request-ip-address"></a>
### 요청 IP 주소

`ip` 메서드로 요청을 보낸 클라이언트의 IP 주소를 확인할 수 있습니다.

```
$ipAddress = $request->ip();
```

<a name="content-negotiation"></a>
### 콘텐츠 협상(Content Negotiation)

라라벨은 들어오는 요청의 `Accept` 헤더를 이용해 클라이언트가 원하는 콘텐츠 타입을 검사할 수 있는 여러 메서드를 제공합니다. 먼저, `getAcceptableContentTypes` 메서드는 요청에서 허용된 모든 콘텐츠 타입의 배열을 반환합니다.

```
$contentTypes = $request->getAcceptableContentTypes();
```

`accepts` 메서드는 전달받은 콘텐츠 타입 배열 중 하나라도 요청에서 허용된다면 `true`를 반환합니다. 그렇지 않으면 `false`를 반환합니다.

```
if ($request->accepts(['text/html', 'application/json'])) {
    // ...
}
```

`prefers` 메서드는 주어진 여러 콘텐츠 타입 중 요청 측에서 가장 선호하는 타입을 반환합니다. 만약 전달한 타입들이 모두 허용되지 않으면 `null`이 반환됩니다.

```
$preferred = $request->prefers(['text/html', 'application/json']);
```

많은 애플리케이션에서 HTML이나 JSON만 제공하는 경우, 요청이 JSON 응답을 기대하고 있는지 빠르게 확인하려면 `expectsJson` 메서드를 사용할 수 있습니다.

```
if ($request->expectsJson()) {
    // ...
}
```

<a name="psr7-requests"></a>
### PSR-7 요청

[PSR-7 표준](https://www.php-fig.org/psr/psr-7/)은 HTTP 메시지(요청/응답)에 대한 인터페이스를 정의합니다. 라라벨의 기본 요청이 아닌 PSR-7 요청 인스턴스를 사용하려면 몇 가지 라이브러리를 먼저 설치해야 합니다. 라라벨은 *Symfony HTTP Message Bridge* 컴포넌트를 활용해 라라벨의 요청/응답 객체를 PSR-7 구현체로 변환해줍니다.

```shell
composer require symfony/psr-http-message-bridge
composer require nyholm/psr7
```

라이브러리 설치 후, 라우트 클로저나 컨트롤러에서 PSR-7의 인터페이스를 타입힌트로 지정해 PSR-7 요청 인스턴스를 사용할 수 있습니다.

```
use Psr\Http\Message\ServerRequestInterface;

Route::get('/', function (ServerRequestInterface $request) {
    //
});
```

> [!NOTE]
> 라우트나 컨트롤러에서 PSR-7 응답 인스턴스를 반환하면, 라라벨에서 자동으로 라라벨 응답 인스턴스로 다시 변환되어 화면에 출력됩니다.

<a name="input"></a>
## 입력값 처리

<a name="retrieving-input"></a>
### 입력값 조회

<a name="retrieving-all-input-data"></a>
#### 전체 입력값 조회

`all` 메서드를 사용하면 요청에 담긴 모든 입력값을 `배열` 형태로 가져올 수 있습니다. 이 메서드는 요청이 HTML 폼이든, XHR 요청이든 상관없이 사용 가능합니다.

```
$input = $request->all();
```

`collect` 메서드는 요청의 모든 입력값을 [컬렉션](/docs/9.x/collections) 형태로 가져옵니다.

```
$input = $request->collect();
```

또한 `collect` 메서드는 전달한 키의 입력값 일부만 컬렉션으로 받아올 수도 있습니다.

```
$request->collect('users')->each(function ($user) {
    // ...
});
```

<a name="retrieving-an-input-value"></a>
#### 개별 입력값 조회

HTTP 메서드 종류와 무관하게, `input` 메서드를 사용하면 사용자가 전송한 값을 간편하게 가져올 수 있습니다.

```
$name = $request->input('name');
```

`input` 메서드 두 번째 인수로 기본값을 전달할 수 있으며, 요청에 해당 값이 존재하지 않을 경우 이 값이 반환됩니다.

```
$name = $request->input('name', 'Sally');
```

배열 형태의 입력값은 "점(.) 표기법"을 써서 접근할 수 있습니다.

```
$name = $request->input('products.0.name');

$names = $request->input('products.*.name');
```

인수를 생략하고 `input` 메서드를 호출하면, 모든 입력값을 연관 배열로 가져옵니다.

```
$input = $request->input();
```

<a name="retrieving-input-from-the-query-string"></a>
#### 쿼리 문자열에서 입력값 조회

`input` 메서드는 전체 요청 페이로드(쿼리 스트링 포함)에서 값을 가져오지만, `query` 메서드는 쿼리 스트링에서만 값을 조회합니다.

```
$name = $request->query('name');
```

쿼리 스트링 값이 없을 때 반환할 기본값을 두 번째 인수로 지정할 수 있습니다.

```
$name = $request->query('name', 'Helen');
```

인수 없이 `query`를 호출하면, 모든 쿼리 스트링 값을 연관 배열로 가져옵니다.

```
$query = $request->query();
```

<a name="retrieving-json-input-values"></a>
#### JSON 입력값 조회

애플리케이션에 JSON 요청이 들어오는 경우, 요청의 `Content-Type` 헤더가 `application/json`으로 올바르게 지정되어 있다면 `input` 메서드로 JSON 데이터를 가져올 수 있습니다. 점 표기법을 사용해 깊숙이 중첩된 JSON 값도 접근 가능합니다.

```
$name = $request->input('user.name');
```

<a name="retrieving-stringable-input-values"></a>
#### Stringable 입력값 조회

기본적으로 입력값을 문자열로 가져오는 대신, `string` 메서드를 사용하면 입력값을 [`Illuminate\Support\Stringable`](/docs/9.x/helpers#fluent-strings) 인스턴스로 받아 다양한 문자열 메서드와 조합해서 사용할 수 있습니다.

```
$name = $request->string('name')->trim();
```

<a name="retrieving-boolean-input-values"></a>
#### 불리언(Boolean) 입력값 조회

HTML 체크박스와 같이 실제로는 문자열 형태의 "참" 값을 받을 수 있습니다(예: `"true"`, `"on"`). 이런 경우 `boolean` 메서드를 쓰면 여러 타입("1", 1, true, "true", "on", "yes") 모두에 대해 `true`를 반환하며, 이 외에는 `false`를 반환합니다.

```
$archived = $request->boolean('archived');
```

<a name="retrieving-date-input-values"></a>
#### 날짜(Date) 입력값 조회

날짜/시간이 입력값에 포함된 경우, `date` 메서드를 사용하면 해당 값을 `Carbon` 인스턴스로 간편하게 변환할 수 있습니다. 요청에 해당 입력값이 없으면 `null`이 반환됩니다.

```
$birthday = $request->date('birthday');
```

`date` 메서드의 두 번째, 세 번째 인자로 날짜 형식(format)과 타임존을 지정할 수 있습니다.

```
$elapsed = $request->date('elapsed', '!H:i', 'Europe/Madrid');
```

해당 값이 입력되어 있지만 형식이 유효하지 않으면 `InvalidArgumentException` 예외가 발생하므로, 사전에 입력값 유효성 검증을 하는 것이 좋습니다.

<a name="retrieving-enum-input-values"></a>
#### Enum 입력값 조회

[PHP Enum](https://www.php.net/manual/en/language.types.enumerations.php)과 매칭되는 입력값도 요청에서 직접 꺼낼 수 있습니다. 해당 이름의 값이 없거나 enum의 백킹 값과 일치하지 않으면 `null`이 반환됩니다. `enum` 메서드는 첫 번째로 입력명, 두 번째로 enum 클래스를 받습니다.

```
use App\Enums\Status;

$status = $request->enum('status', Status::class);
```

<a name="retrieving-input-via-dynamic-properties"></a>
#### 동적 프로퍼티로 입력값 조회

`Illuminate\Http\Request` 인스턴스의 동적 프로퍼티를 이용해서도 입력값을 조회할 수 있습니다. 예를 들어, 애플리케이션 폼에 `name` 필드가 있다면 아래처럼 값을 조회할 수 있습니다.

```
$name = $request->name;
```

동적 프로퍼티 사용 시, 먼저 요청 페이로드에서 프로퍼티명을 찾고, 없을 경우 매칭된 라우트의 파라미터에서 찾아 반환합니다.

<a name="retrieving-a-portion-of-the-input-data"></a>
#### 일부 입력값만 조회

입력값 중 특정 값만 부분적으로 가져오려면 `only`와 `except` 메서드를 사용할 수 있습니다. 두 메서드 모두 배열이나 여러 개의 인자를 받을 수 있습니다.

```
$input = $request->only(['username', 'password']);

$input = $request->only('username', 'password');

$input = $request->except(['credit_card']);

$input = $request->except('credit_card');
```

> [!WARNING]
> `only` 메서드는 요청에 실제로 존재하는 키/값만 반환합니다. 요청에 없는 키는 반환하지 않습니다.

<a name="determining-if-input-is-present"></a>
### 입력값의 존재 여부 확인

입력값이 요청에 존재하는지 확인하려면 `has` 메서드를 사용하세요. 값이 있으면 `true`를 반환합니다.

```
if ($request->has('name')) {
    //
}
```

배열로 여러 값을 전달하면 모두 존재하는지 검사합니다.

```
if ($request->has(['name', 'email'])) {
    //
}
```

`whenHas` 메서드를 사용하면, 입력값이 존재할 때만 지정한 클로저를 실행할 수 있습니다.

```
$request->whenHas('name', function ($input) {
    //
});
```

두 번째 클로저를 전달하면, 지정한 값이 존재하지 않을 때 실행됩니다.

```
$request->whenHas('name', function ($input) {
    // "name" 값이 존재함
}, function () {
    // "name" 값이 없음
});
```

`hasAny` 메서드는 지정한 값 중 하나라도 존재하면 `true`를 반환합니다.

```
if ($request->hasAny(['name', 'email'])) {
    //
}
```

요청에 값이 존재하고 빈 문자열이 아닌지도 확인할 수 있는데, 이때는 `filled` 메서드를 사용합니다.

```
if ($request->filled('name')) {
    //
}
```

`whenFilled`는 값이 존재하고 비어있지 않을 때만 클로저가 실행됩니다.

```
$request->whenFilled('name', function ($input) {
    //
});
```

두 번째 클로저를 넘기면, 값이 비어있거나 없을 때 실행됩니다.

```
$request->whenFilled('name', function ($input) {
    // "name" 값이 입력되어 있음
}, function () {
    // "name" 값이 비어있거나 없음
});
```

지정한 키가 요청에 존재하지 않는지 확인하려면 `missing`과 `whenMissing` 메서드를 사용할 수 있습니다.

```
if ($request->missing('name')) {
    //
}

$request->whenMissing('name', function ($input) {
    // "name" 값이 없음
}, function () {
    // "name" 값이 존재함
});
```

<a name="merging-additional-input"></a>
### 추가 입력값 병합하기

가끔은 기존 요청 입력값에 추가 데이터를 직접 합쳐야 할 수도 있습니다. 이럴 때는 `merge` 메서드를 사용하세요. 합치려는 키가 이미 있으면 전달한 값으로 덮어씁니다.

```
$request->merge(['votes' => 0]);
```

키가 아직 요청 입력에 존재하지 않을 경우만 입력값을 병합하려면 `mergeIfMissing`를 사용할 수 있습니다.

```
$request->mergeIfMissing(['votes' => 0]);
```

<a name="old-input"></a>
### 이전 입력값(Old Input)

라라벨에서는 이전 요청의 입력값을 다음 요청에도 사용할 수 있습니다. 이 기능은 주로 입력값 유효성 검증 에러가 발생할 때 폼을 다시 채워줄 때 유용합니다. 라라벨의 [유효성 검증 기능](/docs/9.x/validation)을 사용한다면, 세션 입력값 저장(플래싱) 메서드를 수동으로 쓸 필요 없이 자동으로 처리되는 경우가 많습니다.

<a name="flashing-input-to-the-session"></a>
#### 입력값을 세션에 플래시하기

`Illuminate\Http\Request`의 `flash` 메서드를 호출하면, 현재 입력값을 [세션](/docs/9.x/session)에 저장해 사용자의 다음 요청에서도 접근할 수 있습니다.

```
$request->flash();
```

`flashOnly`와 `flashExcept` 메서드를 사용해서 일부 값만 세션에 저장할 수 있습니다. 민감 정보(예: 비밀번호)는 세션 저장에서 제외할 때 유용합니다.

```
$request->flashOnly(['username', 'email']);

$request->flashExcept('password');
```

<a name="flashing-input-then-redirecting"></a>
#### 입력값을 세션에 플래시 후 리다이렉트

입력값을 세션에 저장하고 이전 페이지로 리다이렉트하는 경우가 많은데, 리다이렉트의 체이닝 메서드로 `withInput`을 사용하면 편리합니다.

```
return redirect('form')->withInput();

return redirect()->route('user.create')->withInput();

return redirect('form')->withInput(
    $request->except('password')
);
```

<a name="retrieving-old-input"></a>
#### 이전 입력값 조회

이전 요청에서 플래시된 입력값을 가져오려면, `Illuminate\Http\Request` 인스턴스의 `old` 메서드를 사용하세요. 이 메서드는 [세션](/docs/9.x/session)에서 플래시된 값을 꺼내옵니다.

```
$username = $request->old('username');
```

라라벨에서는 전역 `old` 헬퍼도 제공합니다. [Blade 템플릿](/docs/9.x/blade)에서 이전 입력값으로 폼을 다시 채워줄 때 더 간편하게 사용할 수 있습니다. 해당 입력값이 없으면 `null`이 반환됩니다.

```
<input type="text" name="username" value="{{ old('username') }}">
```

<a name="cookies"></a>
### 쿠키

<a name="retrieving-cookies-from-requests"></a>
#### 요청에서 쿠키 조회

라라벨에서 생성된 모든 쿠키는 암호화되고 인증 코드로 서명되므로, 클라이언트가 값을 임의 변경할 경우 유효하지 않게 처리됩니다. 요청에서 쿠키 값을 조회하려면 `Illuminate\Http\Request`의 `cookie` 메서드를 사용하세요.

```
$value = $request->cookie('name');
```

<a name="input-trimming-and-normalization"></a>
## 입력값 정리 및 정규화

기본적으로 라라벨은 `App\Http\Middleware\TrimStrings`와 `Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull` 미들웨어를 전역 미들웨어 스택에 추가합니다(스택은 `App\Http\Kernel` 클래스에서 관리). 이 미들웨어들은 모든 들어오는 문자열 입력값을 자동으로 trim(양쪽 공백 제거)하고, 빈 문자열을 `null`로 변환해줍니다. 그래서 라우트나 컨트롤러에서 이런 정규화를 신경쓰지 않아도 됩니다.

#### 입력값 정규화 비활성화

이 동작을 모든 요청에 적용하고 싶지 않다면, 애플리케이션의 미들웨어 스택에서 두 미들웨어를 `$middleware` 속성에서 제거하면 됩니다.

특정 요청에 한해서만 trim 또는 빈 문자열 변환을 적용하지 않으려면, 두 미들웨어가 제공하는 `skipWhen` 메서드를 사용할 수 있습니다. 이 메서드는 클로저를 받아 input 정규화를 건너뛸지 여부(true/false)를 반환합니다. 일반적으로 `AppServiceProvider`의 `boot` 메서드에서 `skipWhen`을 호출합니다.

```php
use App\Http\Middleware\TrimStrings;
use Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull;

/**
 * 애플리케이션 서비스 부트스트랩
 *
 * @return void
 */
public function boot()
{
    TrimStrings::skipWhen(function ($request) {
        return $request->is('admin/*');
    });

    ConvertEmptyStringsToNull::skipWhen(function ($request) {
        // ...
    });
}
```

<a name="files"></a>
## 파일 업로드

<a name="retrieving-uploaded-files"></a>
### 업로드된 파일 조회

업로드된 파일은 `Illuminate\Http\Request` 인스턴스에서 `file` 메서드를 사용하거나, 동적 프로퍼티로 조회할 수 있습니다. `file` 메서드는 `Illuminate\Http\UploadedFile` 인스턴스를 반환하며, 이 클래스는 PHP의 `SplFileInfo`를 확장하여 다양한 파일 작업 메서드를 제공합니다.

```
$file = $request->file('photo');

$file = $request->photo;
```

파일이 실제로 요청에 포함되어 있는지 확인하려면 `hasFile` 메서드를 사용할 수 있습니다.

```
if ($request->hasFile('photo')) {
    //
}
```

<a name="validating-successful-uploads"></a>
#### 파일 업로드 성공 여부 검증

파일이 존재하는지 체크하는 것에 더해, `isValid` 메서드를 사용하면 파일 업로드가 문제 없이 잘 되었는지도 확인할 수 있습니다.

```
if ($request->file('photo')->isValid()) {
    //
}
```

<a name="file-paths-extensions"></a>
#### 파일 경로 및 확장자

`UploadedFile` 클래스는 파일의 전체 경로와 확장자를 가져오는 메서드도 제공합니다. `extension` 메서드는 실제 파일 내용을 바탕으로 확장자를 유추하며, 이는 클라이언트가 제출한 확장자와 다를 수 있습니다.

```
$path = $request->photo->path();

$extension = $request->photo->extension();
```

<a name="other-file-methods"></a>
#### 기타 파일 관련 메서드

`UploadedFile` 인스턴스에는 위에서 언급한 내용 외에도 다양한 메서드가 있습니다. 보다 자세한 내용은 [해당 클래스의 API 문서](https://github.com/symfony/symfony/blob/6.0/src/Symfony/Component/HttpFoundation/File/UploadedFile.php)를 참고하시기 바랍니다.

<a name="storing-uploaded-files"></a>
### 업로드된 파일 저장

업로드된 파일을 저장하려면 보통 [파일 시스템](/docs/9.x/filesystem)을 구성하고, `UploadedFile` 클래스의 `store` 메서드를 사용합니다. 이때 파일은 로컬 파일시스템이나 Amazon S3 등 원하는 저장소에 저장할 수 있습니다.

`store` 메서드는 파일 저장 경로(파일시스템의 루트 기준 상대 경로)를 첫 번째 인자로 받습니다. 이때 파일명은 지정하지 않고, 라라벨이 자동으로 고유한 파일명을 생성합니다.

두 번째 인자로 사용할 저장소 디스크명을 지정할 수 있습니다. 반환값은 지정한 경로(디스크 루트 기준)입니다.

```
$path = $request->photo->store('images');

$path = $request->photo->store('images', 's3');
```

파일명을 직접 지정하고 싶다면, `storeAs` 메서드를 사용합니다. 경로, 파일명, 디스크명을 차례로 입력합니다.

```
$path = $request->photo->storeAs('images', 'filename.jpg');

$path = $request->photo->storeAs('images', 'filename.jpg', 's3');
```

> [!NOTE]
> 라라벨의 파일 저장에 대해 더 알고 싶다면 [파일 저장 문서](/docs/9.x/filesystem)를 참고하세요.

<a name="configuring-trusted-proxies"></a>
## 신뢰할 수 있는 프록시 설정

TLS/SSL 인증서를 종료시키는 로드 밸런서 뒤에서 애플리케이션을 실행할 경우, `url` 헬퍼 등을 사용할 때 가끔 HTTPS 링크가 아닌 일반 HTTP 링크가 생성되는 경우가 있습니다. 이는 대개 로드 밸런서가 80번 포트로 트래픽을 전달하므로, 애플리케이션 쪽에서 안전한 연결임을 인지하지 못하기 때문입니다.

이럴 때는, 라라벨에 기본 포함된 `App\Http\Middleware\TrustProxies` 미들웨어를 이용해 신뢰할 수 있는 로드 밸런서 또는 프록시를 쉽게 커스터마이즈 할 수 있습니다. 신뢰할 프록시는 이 미들웨어의 `$proxies` 프로퍼티에 배열로 지정하면 됩니다. 아울러 사용할 프록시 `$headers`도 설정할 수 있습니다.

```
<?php

namespace App\Http\Middleware;

use Illuminate\Http\Middleware\TrustProxies as Middleware;
use Illuminate\Http\Request;

class TrustProxies extends Middleware
{
    /**
     * 이 애플리케이션에서 신뢰할 프록시
     *
     * @var string|array
     */
    protected $proxies = [
        '192.168.1.1',
        '192.168.1.2',
    ];

    /**
     * 프록시 감지를 위한 헤더
     *
     * @var int
     */
    protected $headers = Request::HEADER_X_FORWARDED_FOR | Request::HEADER_X_FORWARDED_HOST | Request::HEADER_X_FORWARDED_PORT | Request::HEADER_X_FORWARDED_PROTO;
}
```

> [!NOTE]
> AWS Elastic Load Balancing을 사용할 경우, `$headers`는 `Request::HEADER_X_FORWARDED_AWS_ELB`로 지정해야 합니다. `$headers` 프로퍼티에 사용 가능한 상수 정보는 Symfony의 [프록시 신뢰 문서](https://symfony.com/doc/current/deployment/proxies.html)를 참고하세요.

<a name="trusting-all-proxies"></a>
#### 모든 프록시 신뢰하기

Amazon AWS 같은 클라우드 로드 밸런서 환경에서는 실제 밸런서의 IP를 알 수 없는 경우도 있습니다. 이럴 때는 `*`을 사용해서 모든 프록시를 신뢰할 수 있습니다.

```
/**
 * 이 애플리케이션에서 신뢰할 프록시
 *
 * @var string|array
 */
protected $proxies = '*';
```

<a name="configuring-trusted-hosts"></a>
## 신뢰할 수 있는 호스트 설정

라라벨은 기본적으로 HTTP 요청의 `Host` 헤더 내용과 상관없이 모든 요청에 응답합니다. 또한 웹 요청 중 애플리케이션의 절대 URL을 생성할 때도 `Host` 헤더의 값이 사용됩니다.

일반적으로는 Nginx 또는 Apache와 같은 웹 서버에서, 특정 호스트명과 일치하는 요청만 애플리케이션으로 전달하도록 설정하는 것이 바람직합니다. 직접 웹 서버를 설정할 수 없는 상황이라면, 라라벨의 `App\Http\Middleware\TrustHosts` 미들웨어를 활성화해, 라라벨에서 직접 응답할 호스트명을 제한할 수도 있습니다.

`TrustHosts` 미들웨어는 애플리케이션의 `$middleware` 스택에 이미 포함되어 있으므로, 주석 처리를 해제하여 활성화할 수 있습니다. 미들웨어의 `hosts` 메서드에서, 애플리케이션에서 응답할 호스트명을 지정합니다. 이 외의 `Host` 값으로 들어오는 요청은 거부됩니다.

```
/**
 * 신뢰할 호스트 패턴 반환.
 *
 * @return array
 */
public function hosts()
{
    return [
        'laravel.test',
        $this->allSubdomainsOfApplicationUrl(),
    ];
}
```

`allSubdomainsOfApplicationUrl` 헬퍼 메서드는 애플리케이션의 `app.url` 설정 값을 기준으로, 모든 서브도메인과 매칭되는 정규식을 반환합니다. 와일드카드 서브도메인을 허용하는 애플리케이션을 개발할 때 유용하게 활용할 수 있습니다.

