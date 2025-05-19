# HTTP 요청 (HTTP Requests)

- [소개](#introduction)
- [요청과 상호작용하기](#interacting-with-the-request)
    - [요청 객체 접근하기](#accessing-the-request)
    - [요청 경로 및 HTTP 메서드 확인](#request-path-and-method)
    - [요청 헤더 확인](#request-headers)
    - [요청 IP 주소 확인](#request-ip-address)
    - [콘텐츠 협상(Content Negotiation)](#content-negotiation)
    - [PSR-7 요청](#psr7-requests)
- [입력값(Input)](#input)
    - [입력값 가져오기](#retrieving-input)
    - [입력값 존재 여부 확인](#determining-if-input-is-present)
    - [추가 입력값 병합하기](#merging-additional-input)
    - [이전 입력값(Old Input)](#old-input)
    - [쿠키](#cookies)
    - [입력값 다듬기 및 정규화](#input-trimming-and-normalization)
- [파일](#files)
    - [업로드된 파일 가져오기](#retrieving-uploaded-files)
    - [업로드 파일 저장하기](#storing-uploaded-files)
- [신뢰할 수 있는 프록시 설정](#configuring-trusted-proxies)
- [신뢰할 수 있는 호스트 설정](#configuring-trusted-hosts)

<a name="introduction"></a>
## 소개

Laravel의 `Illuminate\Http\Request` 클래스는 애플리케이션에서 현재 처리 중인 HTTP 요청을 객체지향적으로 다루고, 해당 요청을 통해 전송된 입력값, 쿠키, 파일 등을 쉽게 가져올 수 있도록 지원합니다.

<a name="interacting-with-the-request"></a>
## 요청과 상호작용하기

<a name="accessing-the-request"></a>
### 요청 객체 접근하기

HTTP 요청 객체를 의존성 주입(Dependency Injection)을 통해 얻으려면, 라우트 클로저나 컨트롤러 메서드의 인자에 `Illuminate\Http\Request` 타입을 명시하면 됩니다. Laravel의 [서비스 컨테이너](/docs/8.x/container)가 자동으로 해당 요청 객체를 주입해줍니다.

```
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Store a new user.
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

위 예시와 같이, 라우트 클로저에서도 `Illuminate\Http\Request` 클래스를 타입힌트로 명시할 수 있습니다. 서비스 컨테이너가 해당 요청을 자동으로 클로저로 전달해줍니다.

```
use Illuminate\Http\Request;

Route::get('/', function (Request $request) {
    //
});
```

<a name="dependency-injection-route-parameters"></a>
#### 의존성 주입과 라우트 파라미터

컨트롤러 메서드에서 라우트 파라미터 값도 같이 받아야 할 경우엔, 다른 의존성 인자 다음에 라우트 파라미터를 나열하면 됩니다. 예를 들어 아래와 같이 라우트를 정의했다면,

```
use App\Http\Controllers\UserController;

Route::put('/user/{id}', [UserController::class, 'update']);
```

컨트롤러 메서드에서 `Illuminate\Http\Request` 타입과 함께 `id` 파라미터도 받을 수 있습니다.

```
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Update the specified user.
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
### 요청 경로 및 HTTP 메서드 확인

`Illuminate\Http\Request` 인스턴스는 들어온 HTTP 요청을 확인하기 위한 여러 메서드를 제공합니다. 또한 이 클래스는 `Symfony\Component\HttpFoundation\Request` 클래스를 확장합니다. 자주 사용하는 몇 가지 핵심 메서드는 아래와 같습니다.

<a name="retrieving-the-request-path"></a>
#### 요청 경로(path) 가져오기

`path` 메서드는 요청 경로 정보를 반환합니다. 예를 들어, 요청 URL이 `http://example.com/foo/bar`라면 `path` 메서드는 `foo/bar`를 반환합니다.

```
$uri = $request->path();
```

<a name="inspecting-the-request-path"></a>
#### 요청 경로나 라우트 패턴 검사

`is` 메서드는 들어온 요청 경로가 주어진 패턴과 일치하는지 확인할 수 있습니다. 이때 `*` 문자를 와일드카드로 사용할 수 있습니다.

```
if ($request->is('admin/*')) {
    //
}
```

`routeIs` 메서드를 사용하면 요청이 [네임드 라우트](/docs/8.x/routing#named-routes)와 일치하는지 확인할 수 있습니다.

```
if ($request->routeIs('admin.*')) {
    //
}
```

<a name="retrieving-the-request-url"></a>
#### 요청 URL 가져오기

요청의 전체 URL을 얻으려면 `url` 또는 `fullUrl` 메서드를 사용합니다. `url` 메서드는 쿼리 문자열을 제외한 URL을, `fullUrl`은 쿼리 문자열까지 포함한 전체 URL을 반환합니다.

```
$url = $request->url();

$urlWithQueryString = $request->fullUrl();
```

현재 URL에 쿼리 문자열 정보를 추가하고 싶다면 `fullUrlWithQuery` 메서드를 사용할 수 있습니다. 이 메서드는 전달한 배열을 현재 쿼리 문자열과 병합해서 반환합니다.

```
$request->fullUrlWithQuery(['type' => 'phone']);
```

<a name="retrieving-the-request-method"></a>
#### 요청 HTTP 메서드 가져오기

`method` 메서드를 사용하면 요청의 HTTP 메서드(예: GET, POST 등)를 얻을 수 있습니다. 또한 `isMethod` 메서드를 사용해 원하는 HTTP 메서드와 일치하는지 검사할 수 있습니다.

```
$method = $request->method();

if ($request->isMethod('post')) {
    //
}
```

<a name="request-headers"></a>
### 요청 헤더 확인

`Illuminate\Http\Request` 인스턴스에서 `header` 메서드로 특정 요청 헤더 값을 가져올 수 있습니다. 해당 헤더가 없으면 `null`이 반환되고, 두 번째 인자로 기본값을 지정할 수도 있습니다.

```
$value = $request->header('X-Header-Name');

$value = $request->header('X-Header-Name', 'default');
```

특정 헤더가 존재하는지만 확인하고 싶다면 `hasHeader` 메서드를 사용합니다.

```
if ($request->hasHeader('X-Header-Name')) {
    //
}
```

편리하게 `bearerToken` 메서드를 통해 `Authorization` 헤더의 베어러 토큰을 바로 가져올 수도 있습니다. 이 헤더가 없으면 빈 문자열을 반환합니다.

```
$token = $request->bearerToken();
```

<a name="request-ip-address"></a>
### 요청 IP 주소 확인

요청을 보낸 클라이언트의 IP 주소를 알아내려면 `ip` 메서드를 사용합니다.

```
$ipAddress = $request->ip();
```

<a name="content-negotiation"></a>
### 콘텐츠 협상(Content Negotiation)

Laravel은 요청의 `Accept` 헤더를 통해 클라이언트가 수용 가능한 콘텐츠 타입을 쉽게 확인할 수 있는 여러 메서드를 제공합니다. 먼저, `getAcceptableContentTypes` 메서드는 요청에서 허용된 모든 콘텐츠 타입을 배열로 반환합니다.

```
$contentTypes = $request->getAcceptableContentTypes();
```

`accepts` 메서드는 콘텐츠 타입 배열을 받아 요청이 해당 타입들 중 하나라도 수락하는지 확인해 `true` 또는 `false`를 반환합니다.

```
if ($request->accepts(['text/html', 'application/json'])) {
    // ...
}
```

`prefers` 메서드는 제공한 콘텐츠 타입 배열 중에서 요청이 가장 선호하는 타입을 반환합니다. 어느 것도 허용하지 않으면 `null`을 반환합니다.

```
$preferred = $request->prefers(['text/html', 'application/json']);
```

애플리케이션에서 주로 HTML 또는 JSON만 제공한다면, `expectsJson` 메서드를 통해 요청이 JSON 응답을 기대하는지 빠르게 확인할 수 있습니다.

```
if ($request->expectsJson()) {
    // ...
}
```

<a name="psr7-requests"></a>
### PSR-7 요청

[PSR-7 표준](https://www.php-fig.org/psr/psr-7/)은 HTTP 메시지(요청/응답)를 위한 인터페이스를 정의합니다. Laravel 요청 대신 PSR-7 요청 인스턴스를 사용하고 싶다면, 몇 가지 라이브러리 설치가 필요합니다. Laravel은 *Symfony HTTP Message Bridge* 컴포넌트를 사용해 PSR-7 호환 요청/응답으로 변환합니다.

```
composer require symfony/psr-http-message-bridge
composer require nyholm/psr7
```

라이브러리를 설치한 후, 라우트 클로저나 컨트롤러 메서드의 타입힌트에 PSR-7 요청 인터페이스를 사용할 수 있습니다.

```
use Psr\Http\Message\ServerRequestInterface;

Route::get('/', function (ServerRequestInterface $request) {
    //
});
```

> [!TIP]
> 라우트 또는 컨트롤러에서 PSR-7 응답 객체를 반환하면, 프레임워크가 자동으로 Laravel 응답 객체로 변환해 클라이언트에 반환합니다.

<a name="input"></a>
## 입력값(Input)

<a name="retrieving-input"></a>
### 입력값 가져오기

<a name="retrieving-all-input-data"></a>
#### 모든 입력값 받기

들어온 요청의 전체 입력값을 `all` 메서드로 배열 형태로 가져올 수 있습니다. 이는 HTML 폼이나 XHR 요청 등 요청 방식과 관계없이 사용할 수 있습니다.

```
$input = $request->all();
```

`collect` 메서드를 사용하면 모든 입력값을 [컬렉션](/docs/8.x/collections)으로 가져올 수 있습니다.

```
$input = $request->collect();
```

`collect` 메서드에 키를 지정하면 부분 집합만 컬렉션으로 받을 수도 있습니다.

```
$request->collect('users')->each(function ($user) {
    // ...
});
```

<a name="retrieving-an-input-value"></a>
#### 단일 입력값 받기

HTTP 메서드에 상관없이, 요청 객체의 다양한 메서드를 통해 모든 입력값을 쉽게 조회할 수 있습니다. 가장 기본적으로 `input` 메서드를 사용해 입력값을 가져올 수 있습니다.

```
$name = $request->input('name');
```

입력값이 없을 경우 반환할 기본값을 두 번째 인자로 전달할 수도 있습니다.

```
$name = $request->input('name', 'Sally');
```

배열 형태의 입력값이 있는 폼에서 값에 접근할 때는 "dot" 표기법을 사용할 수 있습니다.

```
$name = $request->input('products.0.name');

$names = $request->input('products.*.name');
```

인자 없이 `input` 메서드를 호출하면 모든 입력값을 연관 배열로 반환합니다.

```
$input = $request->input();
```

<a name="retrieving-input-from-the-query-string"></a>
#### 쿼리 스트링 값 직접 가져오기

`input` 메서드는 전체 요청 데이터에서 값을 가져오지만, 쿼리 스트링에서만 값을 가져오고 싶을 땐 `query` 메서드를 사용합니다.

```
$name = $request->query('name');
```

마찬가지로, 값이 없을 때 반환할 기본값을 두 번째 인자로 지정할 수 있습니다.

```
$name = $request->query('name', 'Helen');
```

인자 없이 호출하면 모든 쿼리 스트링 값을 연관 배열로 반환합니다.

```
$query = $request->query();
```

<a name="retrieving-json-input-values"></a>
#### JSON 입력값 가져오기

애플리케이션에 JSON 요청이 들어올 경우, 요청 헤더의 `Content-Type`이 `application/json`으로 제대로 설정되어 있다면 `input` 메서드로 JSON 데이터에 접근할 수 있습니다. "dot" 표기법으로 중첩된 배열의 값을 쉽게 조회할 수도 있습니다.

```
$name = $request->input('user.name');
```

<a name="retrieving-boolean-input-values"></a>
#### 불리언(boolean) 입력값 가져오기

체크박스처럼 HTML 폼에서 실제로는 문자열로 넘어오는 "truthy" 값(예: "true", "on" 등)을 편리하게 처리하려면 `boolean` 메서드를 사용할 수 있습니다. `boolean` 메서드는 1, "1", true, "true", "on", "yes"에 대해 `true`를 반환하며, 그 외에는 모두 `false`를 반환합니다.

```
$archived = $request->boolean('archived');
```

<a name="retrieving-date-input-values"></a>
#### 날짜(Date) 입력값 가져오기

입력값이 날짜/시간이라면, `date` 메서드를 통해 [Carbon](https://carbon.nesbot.com/) 인스턴스로 받을 수 있습니다. 값이 없으면 `null`을 반환합니다.

```
$birthday = $request->date('birthday');
```

`date` 메서드는 두 번째와 세 번째 인자를 받아 포맷과 타임존을 지정할 수 있습니다.

```
$elapsed = $request->date('elapsed', '!H:i', 'Europe/Madrid');
```

입력값이 있지만 형식이 올바르지 않으면 `InvalidArgumentException`이 발생하므로, 사전에 입력 유효성 검사(Validation)를 수행하는 것이 좋습니다.

<a name="retrieving-input-via-dynamic-properties"></a>
#### 동적 속성 사용해서 입력값 가져오기

`Illuminate\Http\Request` 인스턴스의 동적 속성을 활용해 입력값에 접근할 수도 있습니다. 예를 들어, 폼에 `name` 필드가 있다면 다음과 같이 값을 얻을 수 있습니다.

```
$name = $request->name;
```

동적 속성을 사용할 경우, 우선 요청 데이터에서 해당 값을 찾고 없으면 일치하는 라우트 파라미터 값에서 찾게 됩니다.

<a name="retrieving-a-portion-of-the-input-data"></a>
#### 일부 입력값만 추출하기

입력값 중 필요한 일부만 추출하고 싶다면, `only` 또는 `except` 메서드를 사용할 수 있습니다. 두 메서드는 배열 또는 여러 인자를 받습니다.

```
$input = $request->only(['username', 'password']);

$input = $request->only('username', 'password');

$input = $request->except(['credit_card']);

$input = $request->except('credit_card');
```

> [!NOTE]
> `only` 메서드는 요청에 실제로 존재하는 키에 대한 값만 반환합니다. 요청에 없는 키는 반환하지 않습니다.

<a name="determining-if-input-is-present"></a>
### 입력값 존재 여부 확인

`has` 메서드를 사용하면 특정 값이 요청에 포함되어 있는지 검사할 수 있습니다. 값이 있으면 `true`를 반환합니다.

```
if ($request->has('name')) {
    //
}
```

배열을 인자로 전달하면, 지정된 모든 값이 모두 존재할 때만 `true`를 반환합니다.

```
if ($request->has(['name', 'email'])) {
    //
}
```

`whenHas` 메서드를 사용하면 특정 값이 존재할 때만 클로저를 실행할 수 있습니다.

```
$request->whenHas('name', function ($input) {
    //
});
```

`whenHas`에 두 번째 클로저를 전달하면, 지정한 값이 없을 경우 대신 실행됩니다.

```
$request->whenHas('name', function ($input) {
    // "name" 값이 있습니다...
}, function () {
    // "name" 값이 없습니다...
});
```

`hasAny` 메서드는 전달한 값들 중 하나라도 요청에 존재하면 `true`를 반환합니다.

```
if ($request->hasAny(['name', 'email'])) {
    //
}
```

특정 키가 없거나 값이 비어있지 않은지까지 확인하려면 `filled` 메서드를 사용합니다.

```
if ($request->filled('name')) {
    //
}
```

`whenFilled` 메서드를 사용하면 값이 존재하고 비어있지 않을 때만 작업을 수행할 수 있습니다.

```
$request->whenFilled('name', function ($input) {
    //
});
```

마찬가지로, 두 번째 클로저를 전달하면 값이 비어있을 때 실행됩니다.

```
$request->whenFilled('name', function ($input) {
    // "name" 값이 채워져 있습니다...
}, function () {
    // "name" 값이 비어 있습니다...
});
```

특정 키가 요청에 없는지 확인하고 싶다면 `missing` 메서드를 사용하면 됩니다.

```
if ($request->missing('name')) {
    //
}
```

<a name="merging-additional-input"></a>
### 추가 입력값 병합하기

때로는 현재 요청에 추가적으로 값을 수동으로 병합하고 싶을 때가 있습니다. `merge` 메서드를 이용하면 기존 입력 데이터에 새 값을 쉽게 합칠 수 있습니다.

```
$request->merge(['votes' => 0]);
```

`mergeIfMissing` 메서드는 해당 키가 아직 존재하지 않을 때만 값을 병합해줍니다.

```
$request->mergeIfMissing(['votes' => 0]);
```

<a name="old-input"></a>
### 이전 입력값(Old Input)

Laravel은 한 번의 요청에서 입력된 값을 다음 요청에서도 보존할 수 있도록 도와줍니다. 이는 주로 폼 유효성 검사(validation) 실패 시 값을 다시 채워주는 데 유용합니다. 다만, Laravel의 [유효성 검사 기능](/docs/8.x/validation)을 사용하면 이 세션 입력 플래싱(flash) 작업을 직접 수행하지 않아도 되며, 내부적으로 자동 처리되는 경우가 많습니다.

<a name="flashing-input-to-the-session"></a>
#### 입력값을 세션에 플래시(Flash)하기

`Illuminate\Http\Request`의 `flash` 메서드는 현재 입력값을 [세션](/docs/8.x/session)에 플래시하여, 사용자의 다음 요청에도 이 입력값을 사용할 수 있게 합니다.

```
$request->flash();
```

`flashOnly`, `flashExcept` 메서드를 사용하면, 일부 데이터만 세션에 플래시할 수 있습니다. 비밀번호 등 민감한 정보는 세션에 남지 않게 할 때 사용하면 좋습니다.

```
$request->flashOnly(['username', 'email']);

$request->flashExcept('password');
```

<a name="flashing-input-then-redirecting"></a>
#### 입력값을 플래시 후 리다이렉트하기

입력을 세션에 플래시하고 곧바로 이전 페이지로 리다이렉트하는 경우가 많으므로, `withInput` 메서드를 체이닝하여 쉽게 처리할 수 있습니다.

```
return redirect('form')->withInput();

return redirect()->route('user.create')->withInput();

return redirect('form')->withInput(
    $request->except('password')
);
```

<a name="retrieving-old-input"></a>
#### 이전 입력값 가져오기

이전 요청에서 플래시된 입력값을 가져오려면, `Illuminate\Http\Request`의 `old` 메서드를 사용하면 됩니다. 이 메서드는 세션에서 이전에 플래시된 입력값을 꺼내옵니다.

```
$username = $request->old('username');
```

또한 Laravel은 전역 `old` 헬퍼 함수도 제공합니다. [Blade 템플릿](/docs/8.x/blade)에서 이전 입력값으로 폼을 채울 때 이 헬퍼를 사용하는 것이 더 편리합니다. 만약 해당 필드의 이전 입력값이 없으면 `null`을 반환합니다.

```
<input type="text" name="username" value="{{ old('username') }}">
```

<a name="cookies"></a>
### 쿠키

<a name="retrieving-cookies-from-requests"></a>
#### 요청에서 쿠키 가져오기

Laravel 프레임워크에서 생성된 모든 쿠키는 암호화와 인증 코드 서명이 되어 있기 때문에, 클라이언트 쪽에서 수정되면 무효로 간주합니다. 요청에서 쿠키 값을 가져오려면 `Illuminate\Http\Request`의 `cookie` 메서드를 사용합니다.

```
$value = $request->cookie('name');
```

<a name="input-trimming-and-normalization"></a>
## 입력값 다듬기 및 정규화

기본적으로 Laravel은 애플리케이션의 글로벌 미들웨어 스택에 `App\Http\Middleware\TrimStrings`와 `App\Http\Middleware\ConvertEmptyStringsToNull` 미들웨어를 포함합니다. 이 미들웨어들은 `App\Http\Kernel` 클래스의 `$middleware` 속성에 등록되어 있습니다. 이 미들웨어들은 모든 들어오는 문자열 필드를 자동으로 다듬고(trim), 비어 있는 문자열은 `null`로 변환해줍니다. 덕분에 라우트나 컨트롤러에서 이런 정규화 처리를 따로 신경 쓸 필요가 없습니다.

이 기능을 비활성화하고 싶다면, `App\Http\Kernel` 클래스의 `$middleware` 속성에서 두 미들웨어를 제거하면 됩니다.

<a name="files"></a>
## 파일

<a name="retrieving-uploaded-files"></a>
### 업로드된 파일 가져오기

`Illuminate\Http\Request` 인스턴스에서 `file` 메서드나 동적 속성으로 업로드된 파일을 가져올 수 있습니다. `file` 메서드는 `Illuminate\Http\UploadedFile` 클래스의 인스턴스를 반환하며, 이 클래스는 PHP의 `SplFileInfo` 클래스를 상속해서 다양한 파일 관련 메서드를 제공합니다.

```
$file = $request->file('photo');

$file = $request->photo;
```

요청에 파일이 존재하는지 확인하려면 `hasFile` 메서드를 사용할 수 있습니다.

```
if ($request->hasFile('photo')) {
    //
}
```

<a name="validating-successful-uploads"></a>
#### 파일 업로드 성공 여부 검증

파일이 존재하는 것 외에, 업로드 과정에 문제가 없었는지도 `isValid` 메서드로 확인할 수 있습니다.

```
if ($request->file('photo')->isValid()) {
    //
}
```

<a name="file-paths-extensions"></a>
#### 파일 경로 및 확장자

`UploadedFile` 클래스에는 파일의 전체 경로와 확장자를 확인하는 다양한 메서드가 포함되어 있습니다. `extension` 메서드는 파일 내용을 기반으로 확장자를 추정하므로, 클라이언트가 보낸 확장자와 다를 수 있습니다.

```
$path = $request->photo->path();

$extension = $request->photo->extension();
```

<a name="other-file-methods"></a>
#### 기타 파일 관련 메서드

이 외에도 `UploadedFile` 인스턴스에는 다양한 메서드가 존재합니다. 더 자세한 내용은 [클래스의 API 문서](https://api.symfony.com/master/Symfony/Component/HttpFoundation/File/UploadedFile.html)를 참고하세요.

<a name="storing-uploaded-files"></a>
### 업로드 파일 저장하기

업로드된 파일을 저장하려면, 보통 [파일시스템](/docs/8.x/filesystem) 중 하나를 사용하게 됩니다. `UploadedFile` 클래스의 `store` 메서드를 통해 파일을 디스크(로컬 디스크, Amazon S3 등)에 저장할 수 있습니다.

`store` 메서드는 저장할 경로(디스크의 설정된 루트 디렉터리를 기준으로 한 상대 경로)를 받으며, 파일명은 자동으로 고유 값으로 생성됩니다.

두 번째 인자로 사용할 디스크 이름을 지정할 수도 있습니다. 반환 값은 저장된 파일의 경로(지정한 디스크 기준)입니다.

```
$path = $request->photo->store('images');

$path = $request->photo->store('images', 's3');
```

파일명을 직접 지정하고 싶다면 `storeAs` 메서드를 사용합니다. 경로, 파일명, 디스크명을 순서대로 전달합니다.

```
$path = $request->photo->storeAs('images', 'filename.jpg');

$path = $request->photo->storeAs('images', 'filename.jpg', 's3');
```

> [!TIP]
> Laravel의 파일 저장에 대한 더 자세한 내용은 [파일 스토리지 문서](/docs/8.x/filesystem)를 참고하세요.

<a name="configuring-trusted-proxies"></a>
## 신뢰할 수 있는 프록시 설정

TLS/SSL 인증서가 끝단 로드 밸런서에서 처리되는 환경에서, 애플리케이션이 `url` 헬퍼 사용 시 HTTPS 링크를 생성하지 않는 문제를 겪을 수 있습니다. 이는 보통 로드 밸런서가 80 포트에서 트래픽을 전달하고 있기 때문입니다.

이 문제를 해결하려면, Laravel에 기본 포함된 `App\Http\Middleware\TrustProxies` 미들웨어를 활용할 수 있습니다. 이 미들웨어를 통해 신뢰할 수 있는 프록시나 로드 밸런서를 손쉽게 지정할 수 있습니다. 신뢰할 프록시는 이 미들웨어의 `$proxies` 속성에 배열로 나열하면 됩니다. 또한 신뢰할 프록시 헤더도 `$headers` 속성으로 지정할 수 있습니다.

```
<?php

namespace App\Http\Middleware;

use Illuminate\Http\Middleware\TrustProxies as Middleware;
use Illuminate\Http\Request;

class TrustProxies extends Middleware
{
    /**
     * The trusted proxies for this application.
     *
     * @var string|array
     */
    protected $proxies = [
        '192.168.1.1',
        '192.168.1.2',
    ];

    /**
     * The headers that should be used to detect proxies.
     *
     * @var int
     */
    protected $headers = Request::HEADER_X_FORWARDED_FOR | Request::HEADER_X_FORWARDED_HOST | Request::HEADER_X_FORWARDED_PORT | Request::HEADER_X_FORWARDED_PROTO;
}
```

> [!TIP]
> AWS Elastic Load Balancing을 사용할 경우, `$headers` 값은 `Request::HEADER_X_FORWARDED_AWS_ELB`로 지정해야 합니다. `$headers`에서 사용할 수 있는 상수에 대한 자세한 설명은 Symfony의 [프록시 신뢰 관련 문서](https://symfony.com/doc/current/deployment/proxies.html)를 참고하세요.

<a name="trusting-all-proxies"></a>
#### 모든 프록시를 신뢰하기

Amazon AWS 등 클라우드 로드 밸런서를 사용할 경우 실제 밸런서의 IP를 모를 수 있습니다. 이럴 땐, `*`로 모든 프록시를 신뢰하도록 설정할 수 있습니다.

```
/**
 * The trusted proxies for this application.
 *
 * @var string|array
 */
protected $proxies = '*';
```

<a name="configuring-trusted-hosts"></a>
## 신뢰할 수 있는 호스트 설정

기본적으로 Laravel은 HTTP 요청의 `Host` 헤더와 관계없이 모든 요청에 응답하며, 절대 URL 생성 시에도 `Host` 헤더 값을 참고합니다.

보통은 Nginx나 Apache 같은 웹 서버에서 접근 허용 호스트를 제한해야 하지만, 웹 서버를 직접 제어할 수 없는 경우 Laravel을 통해 특정 호스트 이름만 응답하도록 설정할 수 있습니다. 이를 위해 `App\Http\Middleware\TrustHosts` 미들웨어를 활성화하면 됩니다.

`TrustHosts` 미들웨어는 이미 `$middleware` 스택에 포함되어 있지만, 실제로 적용하려면 주석을 해제해야 합니다. 이 미들웨어의 `hosts` 메서드에서 허용할 호스트 패턴을 배열로 지정할 수 있습니다. 지정되지 않은 호스트로 들어온 요청은 모두 거부됩니다.

```
/**
 * Get the host patterns that should be trusted.
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

`allSubdomainsOfApplicationUrl` 헬퍼 메서드는 애플리케이션의 `app.url` 설정 값에 해당하는 모든 서브도메인을 정규식으로 반환합니다. 와일드카드 서브도메인을 사용하는 애플리케이션에서는 이 메서드를 활용해 모든 서브도메인을 허용할 수 있습니다.

