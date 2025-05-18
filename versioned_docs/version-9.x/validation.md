# 유효성 검증 (Validation)

- [소개](#introduction)
- [유효성 검증 빠른 시작](#validation-quickstart)
    - [라우트 정의하기](#quick-defining-the-routes)
    - [컨트롤러 생성하기](#quick-creating-the-controller)
    - [유효성 검증 로직 작성하기](#quick-writing-the-validation-logic)
    - [유효성 검증 오류 표시하기](#quick-displaying-the-validation-errors)
    - [폼 값 다시 채우기](#repopulating-forms)
    - [선택 필드에 대한 참고 사항](#a-note-on-optional-fields)
    - [유효성 검증 오류 응답 형식](#validation-error-response-format)
- [폼 리퀘스트 유효성 검증](#form-request-validation)
    - [폼 리퀘스트 생성하기](#creating-form-requests)
    - [폼 리퀘스트 인가 처리하기](#authorizing-form-requests)
    - [오류 메시지 커스터마이징](#customizing-the-error-messages)
    - [유효성 검증 전 데이터 준비하기](#preparing-input-for-validation)
- [수동으로 Validator 생성하기](#manually-creating-validators)
    - [자동 리디렉션](#automatic-redirection)
    - [이름이 지정된 에러백(Named Error Bags)](#named-error-bags)
    - [오류 메시지 커스터마이징](#manual-customizing-the-error-messages)
    - [After Validation Hook](#after-validation-hook)
- [검증된 입력 데이터 활용하기](#working-with-validated-input)
- [오류 메시지 다루기](#working-with-error-messages)
    - [언어 파일에 사용자 정의 메시지 지정하기](#specifying-custom-messages-in-language-files)
    - [언어 파일에 속성 지정하기](#specifying-attribute-in-language-files)
    - [언어 파일에 값 지정하기](#specifying-values-in-language-files)
- [사용 가능한 유효성 검증 규칙](#available-validation-rules)
- [조건부로 규칙 추가하기](#conditionally-adding-rules)
- [배열 유효성 검증하기](#validating-arrays)
    - [중첩 배열 입력값 유효성 검증하기](#validating-nested-array-input)
    - [오류 메시지 인덱스와 위치](#error-message-indexes-and-positions)
- [파일 유효성 검증하기](#validating-files)
- [비밀번호 유효성 검증하기](#validating-passwords)
- [커스텀 유효성 검증 규칙](#custom-validation-rules)
    - [Rule 객체 사용하기](#using-rule-objects)
    - [클로저 사용하기](#using-closures)
    - [암묵적(Implicit) 규칙](#implicit-rules)

<a name="introduction"></a>
## 소개

라라벨은 애플리케이션으로 들어오는 데이터를 검증하는 다양한 방법을 제공합니다. 가장 일반적으로는, 모든 HTTP 요청 객체에서 사용할 수 있는 `validate` 메서드를 활용하게 됩니다. 이 밖에도 여러 유효성 검증 방식을 다루고 있으니 함께 살펴보겠습니다.

라라벨은 매우 다양한 편리한 유효성 검증 규칙을 내장하고 있습니다. 예를 들어, 특정 데이터베이스 테이블에서 값의 중복 여부까지 검증할 수 있습니다. 본 문서를 통해 각각의 유효성 검증 규칙과 라라벨이 제공하는 모든 유효성 검증 기능을 상세히 익혀보시기 바랍니다.

<a name="validation-quickstart"></a>
## 유효성 검증 빠른 시작

라라벨의 강력한 유효성 검증 기능을 배우기 위해, 실제 폼을 검증하고 오류 메시지를 사용자에게 표시하는 완성 예제를 먼저 살펴보겠습니다. 이 하이레벨 개요를 읽으며 요청 데이터를 어떻게 검증하고, 결과를 처리하는지 전체적인 흐름을 파악할 수 있습니다.

<a name="quick-defining-the-routes"></a>
### 라우트 정의하기

먼저, `routes/web.php` 파일에 다음과 같은 라우트를 정의했다고 가정하겠습니다.

```
use App\Http\Controllers\PostController;

Route::get('/post/create', [PostController::class, 'create']);
Route::post('/post', [PostController::class, 'store']);
```

여기서 `GET` 라우트는 사용자가 새 블로그 포스트를 작성할 수 있는 폼을 보여주고, `POST` 라우트는 새로운 블로그 포스트를 데이터베이스에 저장합니다.

<a name="quick-creating-the-controller"></a>
### 컨트롤러 생성하기

다음으로, 이 라우트로 들어오는 요청을 처리할 간단한 컨트롤러를 살펴보겠습니다. 우선 `store` 메서드는 비워둡니다.

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PostController extends Controller
{
    /**
     * 새 블로그 포스트 작성 폼을 표시합니다.
     *
     * @return \Illuminate\View\View
     */
    public function create()
    {
        return view('post.create');
    }

    /**
     * 새 블로그 포스트를 저장합니다.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        // 블로그 포스트를 검증 및 저장합니다...
    }
}
```

<a name="quick-writing-the-validation-logic"></a>
### 유효성 검증 로직 작성하기

이제, 새로운 블로그 포스트를 검증하는 로직을 `store` 메서드에 추가해봅니다. 이를 위해 `Illuminate\Http\Request` 객체가 제공하는 `validate` 메서드를 사용합니다. 유효성 검증에 성공하면 코드가 정상적으로 계속 실행됩니다. 그러나 검증에 실패하면 `Illuminate\Validation\ValidationException` 예외가 발생하며, 적절한 오류 응답이 자동으로 사용자에게 반환됩니다.

전통적인 HTTP 요청에서 검증에 실패하면 이전 URL로 자동으로 리디렉션됩니다. 만약 들어오는 요청이 XHR(비동기 JavaScript) 요청이라면, [유효성 검증 오류 메시지를 포함하는 JSON 응답](#validation-error-response-format)이 반환됩니다.

`validate` 메서드가 어떻게 동작하는지 좀 더 자세히 알아보기 위해, 다시 `store` 메서드로 돌아가 보겠습니다.

```
/**
 * 새 블로그 포스트를 저장합니다.
 *
 * @param  \Illuminate\Http\Request  $request
 * @return \Illuminate\Http\Response
 */
public function store(Request $request)
{
    $validated = $request->validate([
        'title' => 'required|unique:posts|max:255',
        'body' => 'required',
    ]);

    // 블로그 포스트가 유효합니다...
}
```

보시다시피, 유효성 검증 규칙은 `validate` 메서드의 인수로 전달됩니다. 걱정하지 마세요. 사용 가능한 유효성 검증 규칙 목록은 [문서](#available-validation-rules)에서 확인할 수 있습니다. 다시 한 번, 검증에 실패하면 라라벨이 자동으로 적절한 응답을 생성합니다. 검증에 성공하면 컨트롤러의 다음 코드가 정상적으로 실행됩니다.

또한, 단일 `|`로 구분된 문자열 대신 유효성 검증 규칙을 배열로 지정할 수도 있습니다.

```
$validatedData = $request->validate([
    'title' => ['required', 'unique:posts', 'max:255'],
    'body' => ['required'],
]);
```

또한, `validateWithBag` 메서드를 사용하면 요청을 검증하고, 오류 메시지를 [이름이 지정된 에러백(Named Error Bag)](#named-error-bags)으로 저장할 수 있습니다.

```
$validatedData = $request->validateWithBag('post', [
    'title' => ['required', 'unique:posts', 'max:255'],
    'body' => ['required'],
]);
```

<a name="stopping-on-first-validation-failure"></a>
#### 첫 번째 검증 실패 시 중지하기

때로는 특정 속성에 대해 유효성 검증을 하다가 첫 번째 실패가 발생했을 때 이후 규칙을 실행하지 않고 검증을 멈추고 싶을 수 있습니다. 이럴 때는 해당 속성에 `bail` 규칙을 추가하면 됩니다.

```
$request->validate([
    'title' => 'bail|required|unique:posts|max:255',
    'body' => 'required',
]);
```

이 예시에서, 만약 `title` 속성에 대한 `unique` 규칙이 실패하면, `max` 규칙은 검증하지 않습니다. 규칙은 정의한 순서대로 차례차례 검증됩니다.

<a name="a-note-on-nested-attributes"></a>
#### 중첩 속성(Nested Attributes)에 관한 참고 사항

들어오는 HTTP 요청에 "중첩된" 필드 데이터가 있을 경우, 유효성 검증 규칙에서 "dot" 표기법을 사용해 해당 필드를 지정할 수 있습니다.

```
$request->validate([
    'title' => 'required|unique:posts|max:255',
    'author.name' => 'required',
    'author.description' => 'required',
]);
```

반대로, 필드명에 실제로 마침표( . )가 들어간 경우에는 백슬래시( \ )로 이스케이프 처리하여 "dot" 표기법이 적용되지 않도록 할 수 있습니다.

```
$request->validate([
    'title' => 'required|unique:posts|max:255',
    'v1\.0' => 'required',
]);
```

<a name="quick-displaying-the-validation-errors"></a>
### 유효성 검증 오류 표시하기

들어오는 요청 필드가 정해진 검증 규칙을 통과하지 못할 경우는 어떻게 될까요? 앞서 언급했듯이, 라라벨은 자동으로 사용자를 이전 위치로 리디렉션합니다. 또한 모든 유효성 검증 오류와 [요청값](/docs/9.x/requests#retrieving-old-input)이 [세션에 자동으로 플래시됩니다](/docs/9.x/session#flash-data).

`Illuminate\View\Middleware\ShareErrorsFromSession` 미들웨어는 모든 뷰에 `$errors` 변수를 공유해 줍니다. 이 미들웨어는 기본적으로 `web` 미들웨어 그룹에 포함되어 있습니다. 이 덕분에 뷰에서는 항상 `$errors` 변수가 정의되어 있다고 가정하고 안전하게 사용할 수 있습니다. `$errors` 변수는 `Illuminate\Support\MessageBag`의 인스턴스입니다. 이 객체를 다루는 방법에 대해서는 [별도의 문서](#working-with-error-messages)를 참고하세요.

예를 들어, 검증에 실패하면 사용자는 컨트롤러의 `create` 메서드로 리디렉션되며, 뷰에서 다음과 같이 오류 메시지를 보여줄 수 있습니다.

```blade
<!-- /resources/views/post/create.blade.php -->

<h1>Create Post</h1>

@if ($errors->any())
    <div class="alert alert-danger">
        <ul>
            @foreach ($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
@endif

<!-- Create Post Form -->
```

<a name="quick-customizing-the-error-messages"></a>
#### 오류 메시지 커스터마이징

라라벨이 제공하는 기본 유효성 검증 규칙 각각에 대한 오류 메시지는 애플리케이션의 `lang/en/validation.php` 파일에 위치합니다. 이 파일에서 각 유효성 검증 규칙에 대해 번역 가능한 텍스트가 정의되어 있습니다. 필요에 따라 이 메시지들을 자유롭게 수정하거나 변경할 수 있습니다.

또한, 이 파일을 다른 언어 디렉터리로 복사하여 애플리케이션 언어에 맞게 메시지를 번역할 수도 있습니다. 라라벨의 다국어 지원(Localization)에 대해서는 [로컬라이제이션 문서](/docs/9.x/localization)를 참고하시기 바랍니다.

<a name="quick-xhr-requests-and-validation"></a>
#### XHR 요청과 유효성 검증

앞서 예제에서는 전통적인 폼을 통해 데이터를 애플리케이션으로 전송했습니다. 하지만 실제로는 많은 애플리케이션이 자바스크립트 기반의 프런트엔드에서 XHR(비동기 HTTP) 요청을 발송합니다. XHR 요청 시 `validate` 메서드를 사용하면, 라라벨은 리디렉션 응답을 생성하지 않습니다. 대신, [유효성 검증 에러 메시지를 모두 담은 JSON 응답](#validation-error-response-format)을 반환합니다. 이 JSON 응답의 HTTP 상태 코드는 422입니다.

<a name="the-at-error-directive"></a>
#### `@error` 디렉티브

Blade 템플릿에서 특정 속성에 대한 유효성 오류 메시지가 있는지 빠르게 확인하려면, `@error` [Blade](/docs/9.x/blade) 디렉티브를 사용할 수 있습니다. `@error` 블록 내부에서는 `$message` 변수를 출력하여 해당 속성의 오류 메시지를 보여줄 수 있습니다.

```blade
<!-- /resources/views/post/create.blade.php -->

<label for="title">Post Title</label>

<input id="title"
    type="text"
    name="title"
    class="@error('title') is-invalid @enderror">

@error('title')
    <div class="alert alert-danger">{{ $message }}</div>
@enderror
```

[이름이 지정된 에러백(Named Error Bags)](#named-error-bags)를 사용하는 경우, `@error` 디렉티브의 두 번째 인수로 에러백 이름을 전달할 수 있습니다.

```blade
<input ... class="@error('title', 'post') is-invalid @enderror">
```

<a name="repopulating-forms"></a>
### 폼 값 다시 채우기

유효성 검증 오류로 인해 라라벨이 리디렉션 응답을 생성하면, 프레임워크는 해당 요청의 모든 입력값을 자동으로 [세션에 플래시](https://laravel.com/docs/9.x/session#flash-data)합니다. 이렇게 하면 다음 요청에서 이전 입력값을 쉽게 가져와, 사용자가 시도했던 폼을 다시 채울 수 있습니다.

직전 요청에서 플래시된 입력 데이터를 가져오려면, `Illuminate\Http\Request` 인스턴스에서 `old` 메서드를 호출하세요. 이 메서드는 [세션](/docs/9.x/session)에 저장된 이전 입력값을 불러옵니다.

```
$title = $request->old('title');
```

라라벨은 전역 `old` 헬퍼 함수도 제공합니다. [Blade 템플릿](/docs/9.x/blade)에서 이전 입력값을 표시할 때는 이 헬퍼를 사용하는 것이 더 편리합니다. 해당 필드에 이전 입력값이 없으면 `null`을 반환합니다.

```blade
<input type="text" name="title" value="{{ old('title') }}">
```

<a name="a-note-on-optional-fields"></a>
### 선택 필드에 대한 참고 사항

기본적으로 라라벨은 `TrimStrings`와 `ConvertEmptyStringsToNull` 미들웨어를 애플리케이션의 전역 미들웨어 스택에 포함시킵니다. 이 미들웨어들은 `App\Http\Kernel` 클래스의 `$middleware` 스택에 정의되어 있습니다. 이로 인해, 선택 입력값이 `null`이 될 수 있다는 점에 유의해야 하며, 이런 필드는 검증 규칙에 `nullable` 키워드를 반드시 추가해야 합니다. 그렇지 않으면, 검증기는 `null` 값을 올바르지 않은 값으로 처리합니다. 예를 들어 다음과 같습니다.

```
$request->validate([
    'title' => 'required|unique:posts|max:255',
    'body' => 'required',
    'publish_at' => 'nullable|date',
]);
```

위 예시에서 `publish_at` 필드는 `null` 값이거나, 올바른 날짜 형식이어야 합니다. 만약 `nullable` 제한자를 추가하지 않으면, 검증기는 `null` 값을 유효한 날짜로 간주하지 않습니다.

<a name="validation-error-response-format"></a>
### 유효성 검증 오류 응답 형식

애플리케이션이 `Illuminate\Validation\ValidationException` 예외를 발생시키고, 들어온 HTTP 요청이 JSON 응답을 기대하는 경우, 라라벨은 자동으로 오류 메시지를 포맷하여 `422 Unprocessable Entity` HTTP 응답으로 반환합니다.

아래는 유효성 검증 실패 시 반환되는 JSON 응답의 예시입니다. 중첩된 오류 키는 모두 "dot" 표기법으로 평탄화됩니다.

```json
{
    "message": "The team name must be a string. (and 4 more errors)",
    "errors": {
        "team_name": [
            "The team name must be a string.",
            "The team name must be at least 1 characters."
        ],
        "authorization.role": [
            "The selected authorization.role is invalid."
        ],
        "users.0.email": [
            "The users.0.email field is required."
        ],
        "users.2.email": [
            "The users.2.email must be a valid email address."
        ]
    }
}
```

<a name="form-request-validation"></a>
## 폼 리퀘스트 유효성 검증

<a name="creating-form-requests"></a>
### 폼 리퀘스트 생성하기

보다 복잡한 유효성 검증 시나리오에서는 "폼 리퀘스트(Form Request)"라는 커스텀 요청 클래스를 생성하는 것이 좋습니다. 폼 리퀘스트는 자체적인 검증 및 인가 로직을 캡슐화하는 사용자 정의 요청 클래스입니다. 폼 리퀘스트 클래스를 생성하려면 `make:request` 아티즌 명령어를 사용하세요.

```shell
php artisan make:request StorePostRequest
```

생성된 폼 리퀘스트 클래스는 `app/Http/Requests` 디렉터리에 위치합니다. 해당 디렉터리가 없다면, `make:request` 명령어를 실행할 때 자동으로 생성됩니다. 라라벨이 생성하는 각 폼 리퀘스트 클래스에는 `authorize`와 `rules`라는 두 개의 메서드가 포함됩니다.

예상하셨겠지만, `authorize` 메서드는 현재 인증된 사용자가 요청에서 표현된 동작을 수행할 수 있는지 판단하는 역할을 하고, `rules` 메서드는 해당 요청 데이터에 적용될 유효성 검증 규칙을 반환합니다.

```
/**
 * 요청에 적용될 유효성 검증 규칙을 반환합니다.
 *
 * @return array
 */
public function rules()
{
    return [
        'title' => 'required|unique:posts|max:255',
        'body' => 'required',
    ];
}
```

> [!NOTE]
> `rules` 메서드의 시그니처에 필요로 하는 의존성을 타입힌트로 명시하면, 라라벨의 [서비스 컨테이너](/docs/9.x/container)를 통해 자동으로 주입받을 수 있습니다.

그렇다면 검증 규칙은 언제 평가될까요? 컨트롤러 메서드에서 요청 객체의 타입힌트로 폼 리퀘스트를 명시하기만 하면 됩니다. 요청이 컨트롤러에 전달되기 전에 이미 유효성 검증이 완료되므로, 컨트롤러 내부가 검증 로직으로 복잡해질 필요가 없습니다.

```
/**
 * 새 블로그 포스트를 저장합니다.
 *
 * @param  \App\Http\Requests\StorePostRequest  $request
 * @return Illuminate\Http\Response
 */
public function store(StorePostRequest $request)
{
    // 들어온 요청 데이터는 이미 유효합니다...

    // 검증된 입력 데이터 전체를 가져옵니다.
    $validated = $request->validated();

    // 검증된 데이터 중 일부만 가져올 수도 있습니다.
    $validated = $request->safe()->only(['name', 'email']);
    $validated = $request->safe()->except(['name', 'email']);
}
```

만약 검증에 실패하면, 사용자는 이전 위치로 자동 리디렉션되고 오류들은 세션에 플래시되어 뷰에서 표시할 수 있습니다. 요청이 XHR 요청이라면 422 상태 코드와 함께 [유효성 오류 메시지의 JSON 결과](#validation-error-response-format)가 반환됩니다.

<a name="adding-after-hooks-to-form-requests"></a>
#### 폼 리퀘스트에 After Hook 추가하기

폼 리퀘스트에 유효성 검증 후 추가 작업을 수행하고 싶다면, `withValidator` 메서드를 사용할 수 있습니다. 이 메서드는 생성된 Validator 인스턴스를 전달받으므로, 실제 검증 규칙이 평가되기 전에 원하는 Validator의 메서드를 호출할 수 있습니다.

```
/**
 * Validator 인스턴스를 구성합니다.
 *
 * @param  \Illuminate\Validation\Validator  $validator
 * @return void
 */
public function withValidator($validator)
{
    $validator->after(function ($validator) {
        if ($this->somethingElseIsInvalid()) {
            $validator->errors()->add('field', 'Something is wrong with this field!');
        }
    });
}
```

<a name="request-stopping-on-first-validation-rule-failure"></a>
#### 첫 번째 검증 실패 속성에서 중지하기

폼 리퀘스트 클래스에 `stopOnFirstFailure` 속성을 추가하면, 하나의 검증 실패 발생 시 모든 속성의 검증을 중지하도록 Validator에게 설정할 수 있습니다.

```
/**
 * Validator가 첫 번째 규칙 실패에서 멈출지 여부를 나타냅니다.
 *
 * @var bool
 */
protected $stopOnFirstFailure = true;
```

<a name="customizing-the-redirect-location"></a>
#### 리디렉션 위치 커스터마이징

앞에서 설명한 대로, 폼 리퀘스트 유효성 검증에 실패하면 사용자는 기본적으로 이전 위치로 리디렉션됩니다. 하지만, 이 동작은 자유롭게 커스터마이즈할 수 있습니다. 이를 위해, 폼 리퀘스트에 `$redirect` 속성을 정의하세요.

```
/**
 * 유효성 검증 실패 시 리디렉션할 URI입니다.
 *
 * @var string
 */
protected $redirect = '/dashboard';
```

또한, named route로 리디렉션하고 싶다면 `$redirectRoute` 속성을 대신 정의할 수 있습니다.

```
/**
 * 유효성 검증 실패 시 리디렉션할 라우트 이름입니다.
 *
 * @var string
 */
protected $redirectRoute = 'dashboard';
```

<a name="authorizing-form-requests"></a>
### 폼 리퀘스트 인가 처리하기

폼 리퀘스트 클래스에는 `authorize` 메서드도 포함되어 있습니다. 이 메서드에서는 인증된 사용자가 실제로 주어진 리소스를 수정할 권한이 있는지를 판단할 수 있습니다. 예를 들어, 사용자가 자신이 소유한 블로그 댓글만 수정할 수 있도록 제한할 수 있습니다. 일반적으로 이 메서드에서는 [인가 게이트(authorization gates)와 정책(policy)](/docs/9.x/authorization)을 활용하게 됩니다.

```
use App\Models\Comment;

/**
 * 사용자가 이 요청을 수행할 권한이 있는지 결정합니다.
 *
 * @return bool
 */
public function authorize()
{
    $comment = Comment::find($this->route('comment'));

    return $comment && $this->user()->can('update', $comment);
}
```

모든 폼 리퀘스트는 라라벨 기본 Request 클래스를 상속하므로, 현재 인증된 사용자에 접근할 땐 `user` 메서드를 사용할 수 있습니다. 위의 예제에서 `route` 메서드를 호출하는 것도 주목하세요. 이 메서드는 호출된 라우트의 URI 파라미터에 접근할 수 있게 해줍니다. 예를 들면, 아래 라우트에서 `{comment}` 파라미터가 해당합니다.

```
Route::post('/comment/{comment}');
```

만약 [라우트 모델 바인딩](/docs/9.x/routing#route-model-binding)을 활용하고 있다면, 요청의 속성으로 바인딩된 모델에 더 간단하게 접근할 수도 있습니다.

```
return $this->user()->can('update', $this->comment);
```

만약 `authorize` 메서드가 `false`를 반환한다면, 라라벨은 자동으로 403 상태코드 HTTP 응답을 반환하며 컨트롤러 메서드는 실행되지 않습니다.

인증 관련 로직을 애플리케이션의 다른 부분에서 처리할 계획이라면, `authorize` 메서드에서 단순히 `true`를 반환해도 됩니다.

```
/**
 * 사용자가 이 요청을 수행할 권한이 있는지 결정합니다.
 *
 * @return bool
 */
public function authorize()
{
    return true;
}
```

> [!NOTE]
> `authorize` 메서드 시그니처에도 필요한 의존성을 타입힌트로 선언하면, 라라벨 [서비스 컨테이너](/docs/9.x/container)를 통해 자동으로 주입받을 수 있습니다.

<a name="customizing-the-error-messages"></a>
### 오류 메시지 커스터마이징

폼 리퀘스트에서 사용하는 오류 메시지를 커스터마이즈하려면 `messages` 메서드를 오버라이딩하면 됩니다. 이 메서드는 속성 / 규칙 조합과 그에 대응하는 오류 메시지를 배열로 반환해야 합니다.

```
/**
 * 정의된 유효성 검증 규칙의 오류 메시지를 반환합니다.
 *
 * @return array
 */
public function messages()
{
    return [
        'title.required' => 'A title is required',
        'body.required' => 'A message is required',
    ];
}
```

<a name="customizing-the-validation-attributes"></a>
#### 검증 속성명 커스터마이즈

라라벨이 기본적으로 제공하는 유효성 검증 오류 메시지에는 `:attribute` 플레이스홀더가 포함된 경우가 많습니다. 해당 플레이스홀더를 실제 검증 메시지에서 원하는 명칭으로 바꾸려면 `attributes` 메서드를 오버라이딩하세요. 이 메서드는 속성 / 명칭 매핑 배열을 반환해야 합니다.

```
/**
 * Validator 오류에 사용할 커스텀 속성명을 반환합니다.
 *
 * @return array
 */
public function attributes()
{
    return [
        'email' => 'email address',
    ];
}
```

<a name="preparing-input-for-validation"></a>
### 유효성 검증 전 데이터 준비하기

검증 규칙을 적용하기 전에 리퀘스트 데이터의 일부를 전처리(preparing)하거나 정제(sanitizing)해야 한다면, `prepareForValidation` 메서드를 사용하세요.

```
use Illuminate\Support\Str;

/**
 * 유효성 검증에 사용할 데이터를 준비합니다.
 *
 * @return void
 */
protected function prepareForValidation()
{
    $this->merge([
        'slug' => Str::slug($this->slug),
    ]);
}
```

마찬가지로, 검증이 완료된 후에 리퀘스트 데이터를 정규화(normalize)할 필요가 있다면 `passedValidation` 메서드를 사용할 수 있습니다.

```
use Illuminate\Support\Str;

/**
 * 유효성 검증에 통과한 후 처리할 내용을 작성합니다.
 *
 * @return void
 */
protected function passedValidation()
{
    $this->replace(['name' => 'Taylor']);
}
```

<a name="manually-creating-validators"></a>
## 수동으로 Validator 생성하기

요청 객체의 `validate` 메서드 대신 직접 Validator 인스턴스를 생성하고자 한다면, `Validator` [파사드](/docs/9.x/facades)를 사용할 수 있습니다. 파사드의 `make` 메서드는 새로운 Validator 인스턴스를 반환합니다.

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PostController extends Controller
{
    /**
     * 새 블로그 포스트를 저장합니다.
     *
     * @param  Request  $request
     * @return Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|unique:posts|max:255',
            'body' => 'required',
        ]);

        if ($validator->fails()) {
            return redirect('post/create')
                        ->withErrors($validator)
                        ->withInput();
        }

        // 검증된 입력 데이터 전체를 가져옵니다...
        $validated = $validator->validated();

        // 검증된 데이터 중 일부만 가져올 수도 있습니다...
        $validated = $validator->safe()->only(['name', 'email']);
        $validated = $validator->safe()->except(['name', 'email']);

        // 블로그 포스트 저장 로직...
    }
}
```

`make` 메서드에 전달되는 첫 번째 인수는 유효성 검증 대상 데이터이고, 두 번째 인수는 데이터에 적용할 유효성 검증 규칙 배열입니다.

요청 검증이 실패했는지 확인한 후에는 `withErrors` 메서드를 사용해 오류 메시지를 세션에 플래시할 수 있습니다. 이 메서드를 사용하면 리디렉션 후 뷰에서 `$errors` 변수를 자동으로 사용할 수 있으므로, 사용자에게 오류 메시지를 쉽게 표시할 수 있습니다. `withErrors` 메서드는 Validator, `MessageBag`, 또는 PHP 배열을 받을 수 있습니다.

#### 첫 번째 유효성 검증 실패 시 중단

`stopOnFirstFailure` 메서드는 유효성 검증에서 첫 번째 실패가 발생하는 즉시, 모든 속성에 대한 추가 검증을 중단하도록 validator에 알립니다.

```
if ($validator->stopOnFirstFailure()->fails()) {
    // ...
}
```

<a name="automatic-redirection"></a>
### 자동 리다이렉션

수동으로 validator 인스턴스를 생성했더라도, HTTP 요청의 `validate` 메서드가 제공하는 자동 리다이렉션 기능을 그대로 활용하고 싶다면, 기존 validator 인스턴스에서 `validate` 메서드를 호출할 수 있습니다. 유효성 검증에 실패하면 사용자가 자동으로 리다이렉트되고, XHR 요청의 경우에는 [JSON 응답이 반환](#validation-error-response-format)됩니다.

```
Validator::make($request->all(), [
    'title' => 'required|unique:posts|max:255',
    'body' => 'required',
])->validate();
```

유효성 검증에 실패했을 때 에러 메시지를 [이름이 지정된 에러 백](#named-error-bags)에 저장하고 싶다면, `validateWithBag` 메서드를 사용할 수 있습니다.

```
Validator::make($request->all(), [
    'title' => 'required|unique:posts|max:255',
    'body' => 'required',
])->validateWithBag('post');
```

<a name="named-error-bags"></a>
### 이름이 지정된 에러 백

한 페이지에 여러 개의 폼이 존재하는 경우, 각 폼에 대한 유효성 검증 에러를 별도의 `MessageBag`에 저장하고 싶을 수 있습니다. 이를 위해 `withErrors`의 두 번째 인수로 이름을 전달하면 에러 메시지를 특정 폼에 대해 구분할 수 있습니다.

```
return redirect('register')->withErrors($validator, 'login');
```

이후 해당 이름이 지정된 `MessageBag` 인스턴스를 `$errors` 변수에서 사용할 수 있습니다.

```blade
{{ $errors->login->first('email') }}
```

<a name="manual-customizing-the-error-messages"></a>
### 에러 메시지 커스터마이즈

필요하다면, validator 인스턴스가 사용할 기본 에러 메시지 대신 직접 정의한 커스텀 에러 메시지를 지정할 수 있습니다. 커스텀 메시지를 지정하는 방법에는 여러 가지가 있습니다. 우선, `Validator::make` 메서드의 세 번째 인수로 커스텀 메시지를 배열로 전달할 수 있습니다.

```
$validator = Validator::make($input, $rules, $messages = [
    'required' => 'The :attribute field is required.',
]);
```

위 예시에서 `:attribute` 플레이스홀더는 실제로 검증 중인 필드명으로 대체됩니다. 또한 다른 플레이스홀더도 유효성 검증 메시지에서 활용할 수 있습니다. 예를 들어:

```
$messages = [
    'same' => 'The :attribute and :other must match.',
    'size' => 'The :attribute must be exactly :size.',
    'between' => 'The :attribute value :input is not between :min - :max.',
    'in' => 'The :attribute must be one of the following types: :values',
];
```

<a name="specifying-a-custom-message-for-a-given-attribute"></a>
#### 특정 속성에 대한 커스텀 메시지 지정

특정 속성에만 커스텀 에러 메시지를 지정하고 싶을 때가 있습니다. 이 경우 "dot" 표기법을 사용하면 됩니다. 속성명과 규칙명을 점(`.`)으로 이어서 지정합니다.

```
$messages = [
    'email.required' => 'We need to know your email address!',
];
```

<a name="specifying-custom-attribute-values"></a>
#### 커스텀 속성값 지정

라라벨의 기본 에러 메시지 중 다수는 검증 중인 속성명을 `:attribute` 플레이스홀더로 출력합니다. 특정 필드에 대해 이 플레이스홀더에 들어갈 값을 커스터마이즈하고 싶다면, `Validator::make`의 네 번째 인수로 커스텀 속성 배열을 전달하면 됩니다.

```
$validator = Validator::make($input, $rules, $messages, [
    'email' => 'email address',
]);
```

<a name="after-validation-hook"></a>
### After Validation Hook

유효성 검증이 끝난 후 실행할 콜백을 추가할 수도 있습니다. 이를 통해 추가적인 검증 작업을 쉽게 수행하거나, 메시지 컬렉션에 에러 메시지를 더할 수 있습니다. 사용 방법은 validator 인스턴스에서 `after` 메서드를 호출하면 됩니다.

```
$validator = Validator::make(/* ... */);

$validator->after(function ($validator) {
    if ($this->somethingElseIsInvalid()) {
        $validator->errors()->add(
            'field', 'Something is wrong with this field!'
        );
    }
});

if ($validator->fails()) {
    //
}
```

<a name="working-with-validated-input"></a>
## 유효성 검증된 입력값 활용하기

폼 리퀘스트나 직접 생성한 validator 인스턴스로 요청 데이터를 검증한 후에는, 실제로 검증이 진행된 데이터를 가져오고 싶을 때가 많습니다. 이 작업은 여러 방법으로 가능합니다. 우선, 폼 리퀘스트나 validator 인스턴스에서 `validated` 메서드를 호출할 수 있습니다. 이 메서드는 검증된 데이터를 배열로 반환합니다.

```
$validated = $request->validated();

$validated = $validator->validated();
```

또는, 폼 리퀘스트나 validator 인스턴스에서 `safe` 메서드를 호출할 수도 있습니다. 이 메서드는 `Illuminate\Support\ValidatedInput` 인스턴스를 반환하며, 이 객체는 `only`, `except`, `all` 메서드를 제공하여 검증된 데이터의 일부 또는 전체를 원하는 형태로 가져올 수 있습니다.

```
$validated = $request->safe()->only(['name', 'email']);

$validated = $request->safe()->except(['name', 'email']);

$validated = $request->safe()->all();
```

또한, `Illuminate\Support\ValidatedInput` 인스턴스는 반복문으로 순회하거나 배열처럼 접근할 수도 있습니다.

```
// 검증된 데이터를 반복문으로 순회...
foreach ($request->safe() as $key => $value) {
    //
}

// 검증된 데이터를 배열처럼 접근...
$validated = $request->safe();

$email = $validated['email'];
```

만약 검증된 데이터에 추가 필드를 더하고 싶다면, `merge` 메서드를 사용할 수 있습니다.

```
$validated = $request->safe()->merge(['name' => 'Taylor Otwell']);
```

[컬렉션](/docs/9.x/collections) 인스턴스로 검증된 데이터를 받고 싶다면, `collect` 메서드를 사용할 수 있습니다.

```
$collection = $request->safe()->collect();
```

<a name="working-with-error-messages"></a>
## 에러 메시지 다루기

`Validator` 인스턴스에서 `errors` 메서드를 호출하면, 여러 가지 편리한 메서드를 제공하는 `Illuminate\Support\MessageBag` 인스턴스를 얻게 됩니다. 또한, 뷰에서 자동으로 사용할 수 있는 `$errors` 변수도 역시 `MessageBag` 클래스의 인스턴스입니다.

<a name="retrieving-the-first-error-message-for-a-field"></a>
#### 특정 필드의 첫 번째 에러 메시지 가져오기

특정 필드에 대한 첫 번째 에러 메시지를 가져오려면, `first` 메서드를 사용합니다.

```
$errors = $validator->errors();

echo $errors->first('email');
```

<a name="retrieving-all-error-messages-for-a-field"></a>
#### 특정 필드의 모든 에러 메시지 가져오기

특정 필드에 대해 메시지 전체 배열을 가져와야 할 때는, `get` 메서드를 사용합니다.

```
foreach ($errors->get('email') as $message) {
    //
}
```

배열 형태의 폼 필드를 검증할 경우, `*` 문자를 사용해 배열 각 요소의 모든 메시지를 가져올 수 있습니다.

```
foreach ($errors->get('attachments.*') as $message) {
    //
}
```

<a name="retrieving-all-error-messages-for-all-fields"></a>
#### 모든 필드의 에러 메시지 전부 가져오기

모든 필드에 대한 에러 메시지 배열을 얻고 싶다면 `all` 메서드를 사용하세요.

```
foreach ($errors->all() as $message) {
    //
}
```

<a name="determining-if-messages-exist-for-a-field"></a>
#### 특정 필드에 메시지가 존재하는지 확인하기

`has` 메서드를 사용하면 특정 필드에 에러 메시지가 존재하는지 확인할 수 있습니다.

```
if ($errors->has('email')) {
    //
}
```

<a name="specifying-custom-messages-in-language-files"></a>
### 언어 파일에서 커스텀 메시지 지정하기

라라벨 기본 유효성 검증 규칙들은 각각의 에러 메시지가 애플리케이션의 `lang/en/validation.php` 파일에 정의되어 있습니다. 이 파일에는 각 유효성 검증 규칙에 해당하는 번역 항목이 존재합니다. 필요에 따라 이 메시지들을 변경하거나 수정하여 애플리케이션의 요구 사항에 맞게 사용할 수 있습니다.

또한, 이 파일을 다른 언어의 번역 디렉터리로 복사하여 애플리케이션에서 사용할 언어로 메시지를 번역할 수 있습니다. 라라벨의 로컬라이제이션 기능에 대한 자세한 내용은 [로컬라이제이션 문서](/docs/9.x/localization)를 참고하십시오.

<a name="custom-messages-for-specific-attributes"></a>
#### 특정 속성에 대한 커스텀 메시지

애플리케이션의 유효성 검증 언어 파일에서 특정 속성-규칙 조합에 대한 에러 메시지도 커스터마이즈할 수 있습니다. 이를 위해, `lang/xx/validation.php` 언어 파일의 `custom` 배열에 커스텀 메시지를 추가하세요.

```
'custom' => [
    'email' => [
        'required' => 'We need to know your email address!',
        'max' => 'Your email address is too long!'
    ],
],
```

<a name="specifying-attribute-in-language-files"></a>
### 언어 파일에서 속성 커스터마이즈

라라벨의 기본 에러 메시지 다수에는 검증 중인 속성명을 나타내는 `:attribute` 플레이스홀더가 포함되어 있습니다. 만약 유효성 메시지의 `:attribute` 부분을 원하는 값으로 바꿔서 보여주고 싶다면, `lang/xx/validation.php` 파일의 `attributes` 배열에 원하는 속성명을 추가하여 지정할 수 있습니다.

```
'attributes' => [
    'email' => 'email address',
],
```

<a name="specifying-values-in-language-files"></a>
### 언어 파일에서 값 커스터마이즈

일부 라라벨 기본 유효성 검증 규칙은 `:value` 플레이스홀더를 포함합니다. 이 플레이스홀더는 현재 요청 속성의 실제 값으로 대체되지만, 경우에 따라 이 값을 더 사용자 친화적인 용어로 바꾸고 싶을 수 있습니다. 예를 들어, `payment_type`이 `cc`인 경우에 신용카드 번호 입력을 필수로 지정하는 규칙을 다음과 같이 설정할 수 있습니다.

```
Validator::make($request->all(), [
    'credit_card_number' => 'required_if:payment_type,cc'
]);
```

이 검증 규칙이 실패하면 아래와 같은 에러 메시지가 출력됩니다.

```none
The credit card number field is required when payment type is cc.
```

이때 `cc` 대신 좀 더 읽기 쉬운 값을 표시하고 싶다면, `lang/xx/validation.php` 언어 파일의 `values` 배열에 값을 지정할 수 있습니다.

```
'values' => [
    'payment_type' => [
        'cc' => 'credit card'
    ],
],
```

이렇게 값을 지정하면 유효성 검증 실패 시 아래와 같은 보다 읽기 쉬운 메시지가 출력됩니다.

```none
The credit card number field is required when payment type is credit card.
```

<a name="available-validation-rules"></a>
## 사용 가능한 유효성 검증 규칙

아래는 사용 가능한 모든 유효성 검증 규칙과 각 규칙의 역할을 정리한 목록입니다.



<div class="collection-method-list" markdown="1">

[Accepted](#rule-accepted)
[Accepted If](#rule-accepted-if)
[Active URL](#rule-active-url)
[After (Date)](#rule-after)
[After Or Equal (Date)](#rule-after-or-equal)
[Alpha](#rule-alpha)
[Alpha Dash](#rule-alpha-dash)
[Alpha Numeric](#rule-alpha-num)
[Array](#rule-array)
[Ascii](#rule-ascii)
[Bail](#rule-bail)
[Before (Date)](#rule-before)
[Before Or Equal (Date)](#rule-before-or-equal)
[Between](#rule-between)
[Boolean](#rule-boolean)
[Confirmed](#rule-confirmed)
[Current Password](#rule-current-password)
[Date](#rule-date)
[Date Equals](#rule-date-equals)
[Date Format](#rule-date-format)
[Decimal](#rule-decimal)
[Declined](#rule-declined)
[Declined If](#rule-declined-if)
[Different](#rule-different)
[Digits](#rule-digits)
[Digits Between](#rule-digits-between)
[Dimensions (Image Files)](#rule-dimensions)
[Distinct](#rule-distinct)
[Doesnt Start With](#rule-doesnt-start-with)
[Doesnt End With](#rule-doesnt-end-with)
[Email](#rule-email)
[Ends With](#rule-ends-with)
[Enum](#rule-enum)
[Exclude](#rule-exclude)
[Exclude If](#rule-exclude-if)
[Exclude Unless](#rule-exclude-unless)
[Exclude With](#rule-exclude-with)
[Exclude Without](#rule-exclude-without)
[Exists (Database)](#rule-exists)
[File](#rule-file)
[Filled](#rule-filled)
[Greater Than](#rule-gt)
[Greater Than Or Equal](#rule-gte)
[Image (File)](#rule-image)
[In](#rule-in)
[In Array](#rule-in-array)
[Integer](#rule-integer)
[IP Address](#rule-ip)
[JSON](#rule-json)
[Less Than](#rule-lt)
[Less Than Or Equal](#rule-lte)
[Lowercase](#rule-lowercase)
[MAC Address](#rule-mac)
[Max](#rule-max)
[Max Digits](#rule-max-digits)
[MIME Types](#rule-mimetypes)
[MIME Type By File Extension](#rule-mimes)
[Min](#rule-min)
[Min Digits](#rule-min-digits)
[Missing](#rule-missing)
[Missing If](#rule-missing-if)
[Missing Unless](#rule-missing-unless)
[Missing With](#rule-missing-with)
[Missing With All](#rule-missing-with-all)
[Multiple Of](#rule-multiple-of)
[Not In](#rule-not-in)
[Not Regex](#rule-not-regex)
[Nullable](#rule-nullable)
[Numeric](#rule-numeric)
[Password](#rule-password)
[Present](#rule-present)
[Prohibited](#rule-prohibited)
[Prohibited If](#rule-prohibited-if)
[Prohibited Unless](#rule-prohibited-unless)
[Prohibits](#rule-prohibits)
[Regular Expression](#rule-regex)
[Required](#rule-required)
[Required If](#rule-required-if)
[Required Unless](#rule-required-unless)
[Required With](#rule-required-with)
[Required With All](#rule-required-with-all)
[Required Without](#rule-required-without)
[Required Without All](#rule-required-without-all)
[Required Array Keys](#rule-required-array-keys)
[Same](#rule-same)
[Size](#rule-size)
[Sometimes](#validating-when-present)
[Starts With](#rule-starts-with)
[String](#rule-string)
[Timezone](#rule-timezone)
[Unique (Database)](#rule-unique)
[Uppercase](#rule-uppercase)
[URL](#rule-url)
[ULID](#rule-ulid)
[UUID](#rule-uuid)

</div>

<a name="rule-accepted"></a>
#### accepted

해당 필드는 값이 `"yes"`, `"on"`, `1`, 또는 `true`여야 합니다. 보통 "약관 동의"와 같은 필드의 유효성 검증에 유용하게 쓸 수 있습니다.

<a name="rule-accepted-if"></a>
#### accepted_if:anotherfield,value,...

해당 필드는, 다른 검증 대상 필드가 지정한 값과 동일할 때, 값이 `"yes"`, `"on"`, `1`, 또는 `true`여야 합니다. 이 규칙 역시 "약관 동의" 등과 같은 케이스에 활용할 수 있습니다.

<a name="rule-active-url"></a>
#### active_url

해당 필드는 PHP의 `dns_get_record` 함수 기준으로 유효한 A 또는 AAAA 레코드를 갖는 URL이어야 합니다. 제공된 URL의 호스트명은 사전에 PHP의 `parse_url` 함수로 추출한 후 `dns_get_record`로 전달됩니다.

<a name="rule-after"></a>
#### after:_date_

해당 필드는 지정한 날짜 이후의 값이어야 합니다. 날짜 값은 PHP의 `strtotime` 함수에 전달되어 유효한 `DateTime` 인스턴스로 변환됩니다.

```
'start_date' => 'required|date|after:tomorrow'
```

날짜 문자열 대신, 비교 대상으로 다른 필드를 지정할 수도 있습니다.

```
'finish_date' => 'required|date|after:start_date'
```

<a name="rule-after-or-equal"></a>
#### after\_or\_equal:_date_

해당 필드는 지정한 날짜 이후 또는 같은 날짜여야 합니다. 자세한 내용은 [after](#rule-after) 규칙 설명을 참고하세요.

<a name="rule-alpha"></a>
#### alpha

해당 필드는 [`\p{L}`](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AL%3A%5D&g=&i=), [`\p{M}`](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AM%3A%5D&g=&i=) 집합에 속하는 유니코드 알파벳 문자로만 구성되어야 합니다.

만약 ASCII 범위(`a-z`, `A-Z`)로 제한하고 싶다면, 검증 규칙에 `ascii` 옵션을 추가할 수 있습니다.

```php
'username' => 'alpha:ascii',
```

<a name="rule-alpha-dash"></a>
#### alpha_dash

해당 필드는 [`\p{L}`](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AL%3A%5D&g=&i=), [`\p{M}`](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AM%3A%5D&g=&i=), [`\p{N}`](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AN%3A%5D&g=&i=) 집합에 속하는 유니코드 영문, 숫자, 그리고 ASCII 대시(`-`), 언더스코어(`_`) 문자로만 구성되어야 합니다.

역시 문자 집합을 ASCII 값(`a-z`, `A-Z`)으로만 제한하려면, `ascii` 옵션을 추가하면 됩니다.

```php
'username' => 'alpha_dash:ascii',
```

<a name="rule-alpha-num"></a>
#### alpha_num

해당 필드는 [`\p{L}`](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AL%3A%5D&g=&i=), [`\p{M}`](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AM%3A%5D&g=&i=), [`\p{N}`](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AN%3A%5D&g=&i=) 집합에 속하는 유니코드 알파벳 또는 숫자만 사용할 수 있습니다.

ASCII 범위로만 제한하고 싶을 때는, `ascii` 옵션을 추가하세요.

```php
'username' => 'alpha_num:ascii',
```

<a name="rule-array"></a>
#### array

해당 필드는 PHP의 `array` 여야 합니다.

`array` 규칙에 값을 추가로 지정하면, 입력 배열의 각 키가 지정값 목록에 포함되어 있어야 합니다. 예를 들어 아래 코드에서 입력 배열의 `admin` 키는 규칙에 지정된 값 목록에 없으므로 유효하지 않습니다.

```
use Illuminate\Support\Facades\Validator;

$input = [
    'user' => [
        'name' => 'Taylor Otwell',
        'username' => 'taylorotwell',
        'admin' => true,
    ],
];

Validator::make($input, [
    'user' => 'array:name,username',
]);
```

일반적으로, 배열 내에 허용할 키를 명확하게 지정하는 것이 좋습니다.

<a name="rule-ascii"></a>
#### ascii

해당 필드는 7비트 ASCII 문자로만 구성되어야 합니다.

<a name="rule-bail"></a>
#### bail

해당 필드에서 첫 번째 유효성 검증 실패가 발생한 경우 이후 나머지 유효성 검증 규칙은 실행하지 않고 중단합니다.

`bail` 규칙은 특정 필드에 대해서만 유효성 검증 실패 시 추가 검증을 중단하지만, `stopOnFirstFailure` 메서드는 어느 필드에서든 유효성 검증에 실패하면 모든 속성의 검증 자체를 즉시 중단합니다.

```
if ($validator->stopOnFirstFailure()->fails()) {
    // ...
}
```

<a name="rule-before"></a>
#### before:_date_

해당 필드는 지정한 날짜 이전의 값이어야 합니다. 날짜들은 PHP `strtotime` 함수에 전달되어 올바른 `DateTime` 인스턴스로 변환됩니다. 또한, [`after`](#rule-after) 규칙과 마찬가지로 검증 대상이 되는 다른 필드명을 날짜 값으로 지정할 수도 있습니다.

<a name="rule-before-or-equal"></a>
#### before\_or\_equal:_date_

해당 필드는 지정한 날짜 이전 또는 같은 값이어야 합니다. 날짜 값은 PHP의 `strtotime` 함수에 전달되어 유효한 `DateTime` 인스턴스로 변환됩니다. 또한, [`after`](#rule-after) 규칙과 마찬가지로 검증에 사용할 다른 필드명을 지정할 수도 있습니다.

<a name="rule-between"></a>
#### between:_min_,_max_

해당 필드는 _min_과 _max_(포함) 사이의 크기를 가져야 합니다. 문자열, 숫자, 배열, 파일의 경우, [`size`](#rule-size) 규칙과 동일한 방식으로 크기가 측정됩니다.

<a name="rule-boolean"></a>
#### boolean

해당 필드는 불리언으로 변환될 수 있어야 합니다. 가능한 값은 `true`, `false`, `1`, `0`, `"1"`, `"0"`입니다.

<a name="rule-confirmed"></a>
#### confirmed

해당 필드와 `{필드명}_confirmation` 입력값이 일치해야 합니다. 예를 들어, 검증 대상 필드가 `password`라면 입력 데이터에 `password_confirmation` 필드도 있어야 합니다.

<a name="rule-current-password"></a>
#### current_password

해당 필드는 인증된 사용자의 비밀번호와 일치해야 합니다. 규칙의 첫 번째 파라미터로 [인증 가드](/docs/9.x/authentication)를 지정할 수도 있습니다.

```
'password' => 'current_password:api'
```

<a name="rule-date"></a>
#### date

해당 필드는 PHP `strtotime` 함수 기준으로 유효한(상대적이지 않은) 날짜여야 합니다.

<a name="rule-date-equals"></a>
#### date_equals:_date_

해당 필드는 지정한 날짜와 동일해야 합니다. 입력 날짜는 PHP `strtotime` 함수에 전달되어 올바른 `DateTime` 인스턴스로 변환됩니다.

<a name="rule-date-format"></a>
#### date_format:_format_,...

해당 필드는 지정 포맷과 일치해야 합니다. 하나의 필드를 검증할 때는 `date` 또는 `date_format` 중 하나만 사용해야 합니다. 이 검증 규칙은 PHP [DateTime](https://www.php.net/manual/en/class.datetime.php) 클래스가 지원하는 모든 포맷을 지원합니다.

<a name="rule-decimal"></a>
#### decimal:_min_,_max_

해당 필드는 숫자 형식이어야 하며, 지정된 소수 자릿수를 가져야 합니다.

```
// 정확히 두 자리 소수 (예: 9.99) ...
'price' => 'decimal:2'

// 2~4자리 소수 허용 ...
'price' => 'decimal:2,4'
```

<a name="rule-declined"></a>

#### declined

검증 대상 필드는 `"no"`, `"off"`, `0`, 또는 `false` 중 하나여야 합니다.

<a name="rule-declined-if"></a>
#### declined_if:anotherfield,value,...

만약 또 다른 검증 대상 필드가 지정한 값과 같다면, 검증 대상 필드는 `"no"`, `"off"`, `0`, 또는 `false` 중 하나여야 합니다.

<a name="rule-different"></a>
#### different:_field_

검증 대상 필드의 값은 _field_와 달라야 합니다.

<a name="rule-digits"></a>
#### digits:_value_

검증 대상 정수는 _value_ 자리 수여야 합니다.

<a name="rule-digits-between"></a>
#### digits_between:_min_,_max_

검증 대상 정수의 자리 수는 _min_보다 크거나 같고 _max_보다 작거나 같아야 합니다.

<a name="rule-dimensions"></a>
#### dimensions

검증 대상 파일은 아래와 같이 규칙의 파라미터로 지정된 이미지 크기 제약 조건을 충족하는 이미지여야 합니다.

```
'avatar' => 'dimensions:min_width=100,min_height=200'
```

사용 가능한 제약 조건은 다음과 같습니다: _min\_width_, _max\_width_, _min\_height_, _max\_height_, _width_, _height_, _ratio_.

_ratio_ 제약 조건은 가로/세로 비율로 입력하며, 분수(`3/2`) 또는 실수(`1.5`) 형식으로 지정할 수 있습니다.

```
'avatar' => 'dimensions:ratio=3/2'
```

이 규칙은 여러 인자가 필요하므로, `Rule::dimensions` 메서드를 사용해 규칙을 좀 더 유연하게 작성할 수 있습니다.

```
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($data, [
    'avatar' => [
        'required',
        Rule::dimensions()->maxWidth(1000)->maxHeight(500)->ratio(3 / 2),
    ],
]);
```

<a name="rule-distinct"></a>
#### distinct

배열을 검증할 때, 값이 중복되면 안 됩니다.

```
'foo.*.id' => 'distinct'
```

distinct는 기본적으로 느슨한(값 중심의) 비교를 사용합니다. 엄격한 비교를 적용하려면, 검증 규칙 정의에 `strict` 파라미터를 추가할 수 있습니다.

```
'foo.*.id' => 'distinct:strict'
```

대소문자 차이를 무시하고 싶다면, `ignore_case`를 검증 규칙 인수에 추가하세요.

```
'foo.*.id' => 'distinct:ignore_case'
```

<a name="rule-doesnt-start-with"></a>
#### doesnt_start_with:_foo_,_bar_,...

검증 대상 필드는 주어진 값들 중 하나로 시작하면 안 됩니다.

<a name="rule-doesnt-end-with"></a>
#### doesnt_end_with:_foo_,_bar_,...

검증 대상 필드는 주어진 값들 중 하나로 끝나면 안 됩니다.

<a name="rule-email"></a>
#### email

검증 대상 필드는 이메일 주소 형식이어야 합니다. 이 검증 규칙은 이메일 형식 검증을 위해 [`egulias/email-validator`](https://github.com/egulias/EmailValidator) 패키지를 사용합니다. 기본적으로 `RFCValidation` 방식이 적용되지만, 다음과 같이 여러 종류의 검증 스타일을 선택할 수 있습니다.

```
'email' => 'email:rfc,dns'
```

위 예시는 `RFCValidation`과 `DNSCheckValidation` 검사를 동시에 적용합니다. 사용할 수 있는 모든 검증 스타일 목록은 다음과 같습니다.

<div class="content-list" markdown="1">

- `rfc`: `RFCValidation`
- `strict`: `NoRFCWarningsValidation`
- `dns`: `DNSCheckValidation`
- `spoof`: `SpoofCheckValidation`
- `filter`: `FilterEmailValidation`
- `filter_unicode`: `FilterEmailValidation::unicode()`

</div>

`filter` 검증기는 PHP의 `filter_var` 함수를 사용하며, 라라벨 5.8 이전까지 기본 이메일 검증 방식으로 사용되었습니다.

> [!WARNING]
> `dns`와 `spoof` 검증기는 PHP의 `intl` 확장이 필요합니다.

<a name="rule-ends-with"></a>
#### ends_with:_foo_,_bar_,...

검증 대상 필드는 주어진 값들 중 하나로 끝나야 합니다.

<a name="rule-enum"></a>
#### enum

`Enum` 규칙은, 검증 대상 필드 값이 지정한 Enum(열거형) 값 중 하나인지 확인하는 클래스 기반 규칙입니다. 이 규칙은 Enum의 이름을 생성자 인수로 받습니다.

```
use App\Enums\ServerStatus;
use Illuminate\Validation\Rules\Enum;

$request->validate([
    'status' => [new Enum(ServerStatus::class)],
]);
```

> [!WARNING]
> Enum은 PHP 8.1 이상에서만 사용할 수 있습니다.

<a name="rule-exclude"></a>
#### exclude

검증 대상 필드는 `validate` 및 `validated` 메서드가 반환하는 요청 데이터에서 제외됩니다.

<a name="rule-exclude-if"></a>
#### exclude_if:_anotherfield_,_value_

만약 _anotherfield_ 필드가 _value_와 같으면, 검증 대상 필드는 `validate` 및 `validated` 메서드가 반환하는 요청 데이터에서 제외됩니다.

복잡한 조건으로 제외해야 할 경우, `Rule::excludeIf` 메서드를 사용하세요. 이 메서드는 불리언 값이나 클로저(익명 함수)를 인수로 받습니다. 클로저를 사용할 경우, 해당 클로저에서는 필드를 제외할지(true/false) 반환하면 됩니다.

```
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($request->all(), [
    'role_id' => Rule::excludeIf($request->user()->is_admin),
]);

Validator::make($request->all(), [
    'role_id' => Rule::excludeIf(fn () => $request->user()->is_admin),
]);
```

<a name="rule-exclude-unless"></a>
#### exclude_unless:_anotherfield_,_value_

_ anotherfield_ 필드가 _value_와 같지 않으면, 검증 대상 필드는 `validate` 및 `validated` 메서드가 반환하는 요청 데이터에서 제외됩니다. _value_가 `null` (`exclude_unless:name,null`)일 때는, 비교할 필드가 `null`이거나 요청 데이터에서 누락된 경우 필드는 제외되지 않습니다.

<a name="rule-exclude-with"></a>
#### exclude_with:_anotherfield_

_ anotherfield_ 필드가 존재하면, 검증 대상 필드는 `validate` 및 `validated` 메서드가 반환하는 요청 데이터에서 제외됩니다.

<a name="rule-exclude-without"></a>
#### exclude_without:_anotherfield_

_ anotherfield_ 필드가 존재하지 않으면, 검증 대상 필드는 `validate` 및 `validated` 메서드가 반환하는 요청 데이터에서 제외됩니다.

<a name="rule-exists"></a>
#### exists:_table_,_column_

검증 대상 필드의 값은 지정한 데이터베이스 테이블에 존재해야 합니다.

<a name="basic-usage-of-exists-rule"></a>
#### Exists 규칙 기본 사용

```
'state' => 'exists:states'
```

`column` 옵션을 지정하지 않으면 필드명이 사용됩니다. 위 예시에서는 요청 데이터의 `state` 속성 값이 같은 이름의 컬럼을 가진 `states` 테이블에 존재하는지 검증합니다.

<a name="specifying-a-custom-column-name"></a>
#### 컬럼명 직접 지정하기

테이블명 뒤에 사용할 컬럼명을 직접 지정할 수 있습니다.

```
'state' => 'exists:states,abbreviation'
```

간혹 `exists` 쿼리를 특정 데이터베이스 연결에서 실행해야 할 경우, 테이블명 앞에 연결 이름을 붙여 지정할 수 있습니다.

```
'email' => 'exists:connection.staff,email'
```

테이블명을 직접 지정하는 대신, 해당 테이블명을 사용하는 Eloquent 모델명을 지정할 수도 있습니다.

```
'user_id' => 'exists:App\Models\User,id'
```

`Rule` 클래스를 사용하면 쿼리를 더욱 유연하게 커스터마이징할 수 있습니다. 아래 예시에서는 검증 규칙도 배열로 나열하고 있습니다.

```
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($data, [
    'email' => [
        'required',
        Rule::exists('staff')->where(function ($query) {
            return $query->where('account_id', 1);
        }),
    ],
]);
```

`Rule::exists` 메서드에서 두 번째 인자로 컬럼명을 명시적으로 지정할 수도 있습니다.

```
'state' => Rule::exists('states', 'abbreviation'),
```

<a name="rule-file"></a>
#### file

검증 대상 필드는 성공적으로 업로드된 파일이어야 합니다.

<a name="rule-filled"></a>
#### filled

검증 대상 필드가 존재한다면 값이 비어 있으면 안 됩니다.

<a name="rule-gt"></a>
#### gt:_field_

검증 대상 필드는 지정된 _field_ 값보다 커야 합니다. 두 필드는 같은 타입이어야 하며, 문자열, 숫자, 배열, 파일 모두 [`size`](#rule-size) 규칙과 동일한 방식으로 비교됩니다.

<a name="rule-gte"></a>
#### gte:_field_

검증 대상 필드는 지정된 _field_ 값보다 크거나 같아야 합니다. 두 필드는 같은 타입이어야 하며, 문자열, 숫자, 배열, 파일 모두 [`size`](#rule-size) 규칙과 동일한 방식으로 비교됩니다.

<a name="rule-image"></a>
#### image

검증 대상 파일은 이미지 파일이어야 합니다(jpg, jpeg, png, bmp, gif, svg, webp).

<a name="rule-in"></a>
#### in:_foo_,_bar_,...

검증 대상 필드는 지정된 값 목록 중 하나에 포함되어야 합니다. 종종 배열을 `implode` 해서 사용해야 하므로, `Rule::in` 메서드를 활용하면 더욱 유연하게 규칙을 정의할 수 있습니다.

```
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($data, [
    'zones' => [
        'required',
        Rule::in(['first-zone', 'second-zone']),
    ],
]);
```

`in` 규칙을 `array` 규칙과 함께 쓰면, 입력 배열의 각 값이 `in` 규칙의 목록에 모두 포함되어야 합니다. 아래 예시에서 입력 배열에 포함된 'LAS' 공항 코드는, 검증 가능한 공항 코드에 포함되지 않으므로 유효하지 않습니다.

```
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

$input = [
    'airports' => ['NYC', 'LAS'],
];

Validator::make($input, [
    'airports' => [
        'required',
        'array',
    ],
    'airports.*' => Rule::in(['NYC', 'LIT']),
]);
```

<a name="rule-in-array"></a>
#### in_array:_anotherfield_.*

검증 대상 필드는 _anotherfield_의 값 목록 중 하나여야 합니다.

<a name="rule-integer"></a>
#### integer

검증 대상 필드는 정수여야 합니다.

> [!WARNING]
> 이 검증 규칙은 입력값이 "정수형" 변수 타입인지까지는 검사하지 않습니다. 단지 입력값이 PHP의 `FILTER_VALIDATE_INT` 규칙에 허용되는 타입이면 통과합니다. 입력값이 숫자인지까지 엄격하게 검사하려면 [numeric 검증 규칙](#rule-numeric)과 함께 사용하세요.

<a name="rule-ip"></a>
#### ip

검증 대상 필드는 IP 주소여야 합니다.

<a name="ipv4"></a>
#### ipv4

검증 대상 필드는 IPv4 주소여야 합니다.

<a name="ipv6"></a>
#### ipv6

검증 대상 필드는 IPv6 주소여야 합니다.

<a name="rule-json"></a>
#### json

검증 대상 필드는 올바른 JSON 문자열이어야 합니다.

<a name="rule-lt"></a>
#### lt:_field_

검증 대상 필드는 지정된 _field_보다 작아야 합니다. 두 필드는 같은 타입이어야 하며, 문자열, 숫자, 배열, 파일 모두 [`size`](#rule-size) 규칙과 동일한 방식으로 비교됩니다.

<a name="rule-lte"></a>
#### lte:_field_

검증 대상 필드는 지정된 _field_보다 작거나 같아야 합니다. 두 필드는 같은 타입이어야 하며, 문자열, 숫자, 배열, 파일 모두 [`size`](#rule-size) 규칙과 동일한 방식으로 비교됩니다.

<a name="rule-lowercase"></a>
#### lowercase

검증 대상 필드는 모두 소문자여야 합니다.

<a name="rule-mac"></a>
#### mac_address

검증 대상 필드는 MAC 주소여야 합니다.

<a name="rule-max"></a>
#### max:_value_

검증 대상 필드는 최대 _value_ 이하여야 합니다. 문자열, 숫자, 배열, 파일 모두 [`size`](#rule-size) 규칙과 동일하게 평가됩니다.

<a name="rule-max-digits"></a>
#### max_digits:_value_

검증 대상 정수의 자리 수는 _value_ 이하여야 합니다.

<a name="rule-mimetypes"></a>
#### mimetypes:_text/plain_,...

검증 대상 파일은 주어진 MIME 타입 목록 중 하나와 일치해야 합니다.

```
'video' => 'mimetypes:video/avi,video/mpeg,video/quicktime'
```

업로드된 파일의 MIME 타입을 판별하기 위해, 파일 내용을 읽어서 프레임워크가 MIME 타입을 추정합니다. 이 결과는 클라이언트가 전송한 타입과 다를 수 있습니다.

<a name="rule-mimes"></a>
#### mimes:_foo_,_bar_,...

검증 대상 파일의 MIME 타입이 나열된 확장자 중 하나와 일치해야 합니다.

<a name="basic-usage-of-mime-rule"></a>
#### MIME 규칙 기본 사용

```
'photo' => 'mimes:jpg,bmp,png'
```

여기에는 확장자만 지정하지만, 실제로는 파일 내용을 읽고 MIME 타입을 추정해서 확장자와 일치하는지 확인합니다. MIME 타입과 그에 해당하는 확장자 전체 목록은 다음에서 확인할 수 있습니다.

[https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types](https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types)

<a name="rule-min"></a>
#### min:_value_

검증 대상 필드는 최소 _value_보다 크거나 같아야 합니다. 문자열, 숫자, 배열, 파일 모두 [`size`](#rule-size) 규칙과 동일하게 평가됩니다.

<a name="rule-min-digits"></a>
#### min_digits:_value_

검증 대상 정수의 자리 수는 _value_ 이상이어야 합니다.

<a name="rule-multiple-of"></a>
#### multiple_of:_value_

검증 대상 필드는 _value_의 배수여야 합니다.

<a name="rule-missing"></a>
#### missing

검증 대상 필드는 입력 데이터에 존재하면 안 됩니다.

 <a name="rule-missing-if"></a>
 #### missing_if:_anotherfield_,_value_,...

 _anotherfield_ 필드가 _value_ 값 중 하나와 같으면, 검증 대상 필드는 존재하면 안 됩니다.

 <a name="rule-missing-unless"></a>
 #### missing_unless:_anotherfield_,_value_

_ anotherfield_ 필드가 _value_ 값 중 하나와 같지 않으면, 검증 대상 필드는 존재하면 안 됩니다.

 <a name="rule-missing-with"></a>
 #### missing_with:_foo_,_bar_,...

 지정된 다른 필드들 중 하나라도 존재할 경우에만, 검증 대상 필드는 존재하면 안 됩니다.

 <a name="rule-missing-with-all"></a>
 #### missing_with_all:_foo_,_bar_,...

 지정된 다른 필드들이 모두 존재할 경우에만, 검증 대상 필드는 존재하면 안 됩니다.

<a name="rule-not-in"></a>
#### not_in:_foo_,_bar_,...

검증 대상 필드의 값은 지정된 값 목록에 포함되면 안 됩니다. `Rule::notIn` 메서드를 사용하면 규칙을 유연하게 정의할 수 있습니다.

```
use Illuminate\Validation\Rule;

Validator::make($data, [
    'toppings' => [
        'required',
        Rule::notIn(['sprinkles', 'cherries']),
    ],
]);
```

<a name="rule-not-regex"></a>
#### not_regex:_pattern_

검증 대상 필드는 지정한 정규 표현식 패턴과 일치하지 않아야 합니다.

이 규칙은 내부적으로 PHP의 `preg_match` 함수를 사용합니다. 지정한 패턴은 `preg_match`가 요구하는 형식과 동일하게, 올바른 구분자를 포함해야 합니다. 예시: `'email' => 'not_regex:/^.+$/i'`.

> [!WARNING]
> `regex` / `not_regex` 패턴을 사용할 때, 정규식에 `|` 문자가 포함된 경우에는 규칙을 배열로 지정해야 할 수 있습니다.

<a name="rule-nullable"></a>
#### nullable

검증 대상 필드는 `null`일 수 있습니다.

<a name="rule-numeric"></a>
#### numeric

검증 대상 필드는 [숫자형(numeric)](https://www.php.net/manual/en/function.is-numeric.php)이어야 합니다.

<a name="rule-password"></a>
#### password

검증 대상 필드는 인증된 사용자의 비밀번호와 일치해야 합니다.

> [!WARNING]
> 이 규칙은 라라벨 9에서 제거될 예정이며, `current_password`로 이름이 변경되었습니다. [Current Password](#rule-current-password) 규칙을 대신 사용하세요.

<a name="rule-present"></a>
#### present

검증 대상 필드는 입력 데이터에 반드시 존재해야 합니다.

<a name="rule-prohibited"></a>
#### prohibited

검증 대상 필드는 입력 데이터에 존재하지 않거나 "비어 있어야" 합니다. "비어 있음"의 기준은 다음 중 하나를 만족하면 됩니다.

<div class="content-list" markdown="1">

- 값이 `null`인 경우
- 값이 빈 문자열인 경우
- 값이 빈 배열이거나 빈 `Countable` 객체인 경우
- 업로드된 파일인데 파일 경로가 비어 있는 경우

</div>

<a name="rule-prohibited-if"></a>
#### prohibited_if:_anotherfield_,_value_,...

_ anotherfield_ 필드가 _value_ 값 중 하나와 같으면, 검증 대상 필드는 존재하지 않거나 "비어 있어야" 합니다. "비어 있음"의 기준은 다음과 같습니다.

<div class="content-list" markdown="1">

- 값이 `null`인 경우
- 값이 빈 문자열인 경우
- 값이 빈 배열이거나 빈 `Countable` 객체인 경우
- 업로드된 파일인데 파일 경로가 비어 있는 경우

</div>

복잡한 조건에 따라 필드를 금지해야 한다면, `Rule::prohibitedIf` 메서드를 사용할 수 있습니다. 이 메서드는 불리언 또는 클로저를 인수로 받으며, 클로저를 사용할 때는 필드를 금지할지(true/false) 반환해야 합니다.

```
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($request->all(), [
    'role_id' => Rule::prohibitedIf($request->user()->is_admin),
]);

Validator::make($request->all(), [
    'role_id' => Rule::prohibitedIf(fn () => $request->user()->is_admin),
]);
```

<a name="rule-prohibited-unless"></a>
#### prohibited_unless:_anotherfield_,_value_,...

_ anotherfield_ 필드가 _value_ 값 중 하나와 같지 않으면, 검증 대상 필드는 존재하지 않거나 "비어 있어야" 합니다. "비어 있음"의 기준은 다음과 같습니다.

<div class="content-list" markdown="1">

- 값이 `null`인 경우
- 값이 빈 문자열인 경우
- 값이 빈 배열이거나 빈 `Countable` 객체인 경우
- 업로드된 파일인데 파일 경로가 비어 있는 경우

</div>

<a name="rule-prohibits"></a>
#### prohibits:_anotherfield_,...

검증 대상 필드가 존재하고 비어 있지 않다면, _anotherfield_에 나열된 모든 필드는 존재하지 않거나 "비어 있어야" 합니다. "비어 있음"의 기준은 다음 중 하나를 만족하면 됩니다.

<div class="content-list" markdown="1">

- 값이 `null`인 경우
- 값이 빈 문자열인 경우
- 값이 빈 배열이거나 빈 `Countable` 객체인 경우
- 업로드된 파일인데 파일 경로가 비어 있는 경우

</div>

<a name="rule-regex"></a>
#### regex:_pattern_

검증 대상 필드는 지정한 정규 표현식과 일치해야 합니다.

이 규칙은 내부적으로 PHP의 `preg_match` 함수를 사용합니다. 지정한 패턴은 `preg_match`와 동일한 포맷 및 구분자를 포함해야 합니다. 예시: `'email' => 'regex:/^.+@.+$/i'`.

> [!WARNING]
> `regex` / `not_regex` 패턴을 사용할 때, 정규식에 `|` 문자가 포함된 경우에는 규칙을 배열로 지정해야 합니다.

<a name="rule-required"></a>
#### required

검증 대상 필드는 입력 데이터에 반드시 존재해야 하며, 빈 값이어서는 안 됩니다. "비어 있음"의 기준은 다음 중 하나를 만족하면 됩니다.

<div class="content-list" markdown="1">

- 값이 `null`인 경우
- 값이 빈 문자열인 경우
- 값이 빈 배열이거나 빈 `Countable` 객체인 경우
- 업로드된 파일인데 파일 경로가 없는 경우

</div>

<a name="rule-required-if"></a>

#### required_if:_anotherfield_,_value_,...

유효성 검증 대상 필드는, _anotherfield_ 필드가 _value_ 값과 같을 때 반드시 존재해야 하며 비어 있지 않아야 합니다.

`required_if` 규칙에 더 복잡한 조건을 사용하고 싶다면, `Rule::requiredIf` 메서드를 사용할 수 있습니다. 이 메서드는 불린 값이나 클로저를 인자로 받을 수 있습니다. 클로저가 전달된 경우, 해당 클로저는 해당 필드의 필수 여부를 나타내기 위해 `true` 또는 `false`를 반환해야 합니다.

```
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($request->all(), [
    'role_id' => Rule::requiredIf($request->user()->is_admin),
]);

Validator::make($request->all(), [
    'role_id' => Rule::requiredIf(fn () => $request->user()->is_admin),
]);
```

<a name="rule-required-unless"></a>
#### required_unless:_anotherfield_,_value_,...

유효성 검증 대상 필드는, _anotherfield_ 필드가 _value_ 값과 같지 않을 때 반드시 존재해야 하며 비어 있지 않아야 합니다. 이는 _anotherfield_ 필드는 _value_가 `null`이 아닌 한 요청 데이터에 반드시 포함되어야 함을 의미합니다. 만약 _value_가 `null`인 경우(`required_unless:name,null`), 비교 대상 필드가 `null`이거나 요청 데이터에 없는 경우에는 해당 필드가 필수가 아닙니다.

<a name="rule-required-with"></a>
#### required_with:_foo_,_bar_,...

지정된 다른 필드 중 하나라도 존재하고 비어 있지 않다면, 유효성 검증 대상 필드는 반드시 존재하고 비어 있지 않아야 합니다.

<a name="rule-required-with-all"></a>
#### required_with_all:_foo_,_bar_,...

지정된 다른 모든 필드가 존재하고 비어 있지 않은 경우에만, 유효성 검증 대상 필드는 반드시 존재하고 비어 있지 않아야 합니다.

<a name="rule-required-without"></a>
#### required_without:_foo_,_bar_,...

지정된 다른 필드 중 하나라도 비어 있거나 존재하지 않을 때에만, 유효성 검증 대상 필드는 반드시 존재하고 비어 있지 않아야 합니다.

<a name="rule-required-without-all"></a>
#### required_without_all:_foo_,_bar_,...

지정된 다른 모든 필드가 비어 있거나 존재하지 않을 때에만, 유효성 검증 대상 필드는 반드시 존재하고 비어 있지 않아야 합니다.

<a name="rule-required-array-keys"></a>
#### required_array_keys:_foo_,_bar_,...

유효성 검증 대상 필드는 배열이어야 하며, 지정된 키들이 최소한 반드시 포함되어 있어야 합니다.

<a name="rule-same"></a>
#### same:_field_

지정된 _field_의 값이 유효성 검증 대상 필드의 값과 일치해야 합니다.

<a name="rule-size"></a>
#### size:_value_

유효성 검증 대상 필드는 지정한 _value_와 동일한 크기를 가져야 합니다. 문자열의 경우 _value_는 문자 개수를 의미합니다. 숫자 데이터의 경우 _value_는 지정한 정수 값이고(이때 필드는 `numeric` 또는 `integer` 규칙도 적용되어야 합니다), 배열의 경우 크기는 배열의 `count`와 같습니다. 파일의 경우, 크기는 킬로바이트(KB) 단위의 파일 크기입니다. 몇 가지 예시를 보겠습니다.

```
// 문자열이 정확히 12자여야 함
'title' => 'size:12';

// 제공된 정수가 10과 일치해야 함
'seats' => 'integer|size:10';

// 배열에 요소가 정확히 5개 있어야 함
'tags' => 'array|size:5';

// 업로드된 파일이 정확히 512KB여야 함
'image' => 'file|size:512';
```

<a name="rule-starts-with"></a>
#### starts_with:_foo_,_bar_,...

유효성 검증 대상 필드는 지정한 값 중 하나로 시작해야 합니다.

<a name="rule-string"></a>
#### string

유효성 검증 대상 필드는 문자열이어야 합니다. 이 필드에 `null` 값도 허용하려면 `nullable` 규칙을 같이 지정하십시오.

<a name="rule-timezone"></a>
#### timezone

유효성 검증 대상 필드는 PHP 함수 `timezone_identifiers_list` 기준으로 올바른 타임존 식별자여야 합니다.

<a name="rule-unique"></a>
#### unique:_table_,_column_

유효성 검증 대상 필드 값은 지정한 데이터베이스 테이블 내에 존재하지 않아야 합니다.

**커스텀 테이블/컬럼명 지정하기:**

테이블명을 직접 입력하는 대신, Eloquent 모델을 지정하여 해당 테이블명을 사용할 수도 있습니다.

```
'email' => 'unique:App\Models\User,email_address'
```

`column` 옵션을 사용하여 필드가 데이터베이스에서 매칭되어야 할 컬럼명을 지정할 수 있습니다. 만약 `column` 옵션을 지정하지 않으면, 유효성 검증 대상 필드명이 사용됩니다.

```
'email' => 'unique:users,email_address'
```

**커스텀 데이터베이스 커넥션 지정**

Validator가 수행하는 데이터베이스 쿼리에 커스텀 커넥션을 사용해야 하는 경우, 테이블명 앞에 커넥션명을 붙이면 됩니다.

```
'email' => 'unique:connection.users,email_address'
```

**특정 ID를 무시하도록 Unique 규칙 강제하기:**

경우에 따라 unique 유효성 검증 시 특정 ID를 무시해야 할 때가 있습니다. 예를 들어, "프로필 수정" 화면에서 사용자의 이름, 이메일 주소, 위치 정보를 업데이트할 때, 이메일 주소가 고유한지 확인하되, 이미 본인 이메일이라면 에러가 발생하지 않아야 합니다.

이처럼 사용자의 ID를 무시하도록 validator에 지시하려면 `Rule` 클래스를 활용하여 규칙을 유창하게(fluent) 정의할 수 있습니다. 또한, 이 예시에서는 규칙을 배열로 지정하고 각각의 규칙을 `|` 문자 대신 배열 요소로 구분합니다.

```
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($data, [
    'email' => [
        'required',
        Rule::unique('users')->ignore($user->id),
    ],
]);
```

> [!WARNING]
> `ignore` 메서드에 사용자 입력값을 그대로 넘겨서는 절대 안 됩니다. 반드시 auto-increment ID, Eloquent 모델의 UUID 등 시스템에서 생성한 고유 식별자만 넘겨야 하며, 그렇지 않으면 애플리케이션이 SQL 인젝션 공격에 취약해질 수 있습니다.

모델의 키 값을 `ignore` 메서드에 직접 넘기는 대신, 전체 모델 인스턴스를 넘길 수도 있습니다. 그러면 Laravel이 자동으로 키 값을 추출합니다.

```
Rule::unique('users')->ignore($user)
```

만약 테이블의 기본 키 컬럼명이 `id`가 아니라면, `ignore` 호출 시 두 번째 인자로 해당 컬럼명을 지정할 수 있습니다.

```
Rule::unique('users')->ignore($user->id, 'user_id')
```

기본적으로, `unique` 규칙은 유효성 검증을 실행하는 필드명과 동일한 컬럼의 유일성을 체크합니다. 그러나 두 번째 인자에 다른 컬럼명을 지정할 수도 있습니다.

```
Rule::unique('users', 'email_address')->ignore($user->id),
```

**추가 where 조건 지정하기:**

쿼리에 추가적인 조건을 붙이고 싶을 경우, `where` 메서드를 사용해 쿼리를 커스터마이즈할 수 있습니다. 예를 들어, `account_id` 컬럼이 1인 레코드에서만 유일성을 검사하고 싶다면 다음과 같이 작성할 수 있습니다.

```
'email' => Rule::unique('users')->where(fn ($query) => $query->where('account_id', 1))
```

<a name="rule-uppercase"></a>
#### uppercase

유효성 검증 대상 필드는 반드시 모두 대문자여야 합니다.

<a name="rule-url"></a>
#### url

유효성 검증 대상 필드는 올바른 URL이어야 합니다.

<a name="rule-ulid"></a>
#### ulid

유효성 검증 대상 필드는 [ULID(Universally Unique Lexicographically Sortable Identifier)](https://github.com/ulid/spec) 형식이어야 합니다.

<a name="rule-uuid"></a>
#### uuid

유효성 검증 대상 필드는 RFC 4122 (버전 1, 3, 4, 5) 규격의 UUID 형식이어야 합니다.

<a name="conditionally-adding-rules"></a>
## 조건부 규칙 추가하기

<a name="skipping-validation-when-fields-have-certain-values"></a>
#### 특정 값일 때 유효성 검증 건너뛰기

다른 필드가 특정 값을 갖는 경우, 해당 필드의 유효성 검증을 건너뛰고 싶을 때가 있습니다. 이럴 때는 `exclude_if` 유효성 검증 규칙을 사용할 수 있습니다. 아래 예시에서는 `has_appointment` 필드가 `false`이면 `appointment_date`와 `doctor_name` 필드는 유효성 검증을 하지 않습니다.

```
use Illuminate\Support\Facades\Validator;

$validator = Validator::make($data, [
    'has_appointment' => 'required|boolean',
    'appointment_date' => 'exclude_if:has_appointment,false|required|date',
    'doctor_name' => 'exclude_if:has_appointment,false|required|string',
]);
```

반대로, `exclude_unless` 규칙을 사용해 특정 값이 아닐 경우에만 유효성 검증을 수행하지 않을 수도 있습니다.

```
$validator = Validator::make($data, [
    'has_appointment' => 'required|boolean',
    'appointment_date' => 'exclude_unless:has_appointment,true|required|date',
    'doctor_name' => 'exclude_unless:has_appointment,true|required|string',
]);
```

<a name="validating-when-present"></a>
#### 존재할 때만 유효성 검증

특정 필드가 데이터에 존재할 때만 유효성 검증을 실행하고 싶을 때가 있습니다. 이럴 때는 규칙에 `sometimes`를 추가하면 간편하게 구현할 수 있습니다.

```
$v = Validator::make($data, [
    'email' => 'sometimes|required|email',
]);
```

위 예시에서 `email` 필드는 `$data` 배열에 있을 때만 유효성 검증이 작동합니다.

> [!NOTE]
> 항상 존재하지만 비어있을 수 있는 필드에 대해 유효성 검증을 시도하는 경우에는 [optional 필드에 대한 참고](#a-note-on-optional-fields)를 확인하시기 바랍니다.

<a name="complex-conditional-validation"></a>
#### 복잡한 조건부 유효성 검증

다소 복잡한 조건에 따라 유효성 검증 규칙을 추가하고 싶은 경우가 있습니다. 예를 들어, 어떤 필드는 다른 필드 값이 100 초과일 때만 필수로 만들고 싶거나, 특정 필드가 존재할 때 두 개 이상의 필드에 대해 동일한 값을 요구하고 싶을 수 있습니다. 이러한 조건부 검증도 어렵지 않게 구현할 수 있습니다. 먼저, 항상 고정되어 적용할 _static 규칙_으로 `Validator` 인스턴스를 만듭니다.

```
use Illuminate\Support\Facades\Validator;

$validator = Validator::make($request->all(), [
    'email' => 'required|email',
    'games' => 'required|numeric',
]);
```

예를 들어, 웹 애플리케이션이 게임 수집가용이고, 사용자가 100개 이상의 게임을 소유한다고 등록할 때는 그 이유도 설명하게 하고 싶다고 가정해봅시다(예: 게임 리셀 샵을 운영하거나, 순수히 수집 자체를 즐기는 경우 등). 이 조건부 필수 항목은 `Validator` 인스턴스의 `sometimes` 메서드를 이용해 쉽게 추가할 수 있습니다.

```
$validator->sometimes('reason', 'required|max:500', function ($input) {
    return $input->games >= 100;
});
```

`sometimes` 메서드의 첫 번째 인자는 조건부 검증할 필드명, 두 번째는 추가할 규칙 목록입니다. 세 번째 인자로 전달되는 클로저가 `true`를 반환하면 해당 규칙이 추가됩니다. 이 방식으로 복잡한 조건부 유효성 검증을 매우 쉽게 구현할 수 있습니다. 또한 여러 필드에 한 번에 조건부 검증을 적용할 수도 있습니다.

```
$validator->sometimes(['reason', 'cost'], 'required', function ($input) {
    return $input->games >= 100;
});
```

> [!NOTE]
> 클로저로 전달된 `$input` 인자는 `Illuminate\Support\Fluent` 인스턴스로, 검증 중인 입력값 및 파일에 접근할 수 있습니다.

<a name="complex-conditional-array-validation"></a>
#### 복잡한 조건부 배열 유효성 검증

중첩 배열 내에서, 인덱스를 모르는 또 다른 필드에 따라 특정 필드를 검증하고 싶을 때가 있습니다. 이런 경우에는 클로저에 두 번째 인자로 현재 배열 항목(개별 아이템)이 전달되도록 할 수 있습니다.

```
$input = [
    'channels' => [
        [
            'type' => 'email',
            'address' => 'abigail@example.com',
        ],
        [
            'type' => 'url',
            'address' => 'https://example.com',
        ],
    ],
];

$validator->sometimes('channels.*.address', 'email', function ($input, $item) {
    return $item->type === 'email';
});

$validator->sometimes('channels.*.address', 'url', function ($input, $item) {
    return $item->type !== 'email';
});
```

배열 데이터일 경우, 클로저로 전달되는 `$item` 역시 `Illuminate\Support\Fluent` 인스턴스입니다. 배열이 아닌 단일 값일 경우에는 단순 문자열을 받게 됩니다.

<a name="validating-arrays"></a>
## 배열 유효성 검증

[`array` 유효성 검증 규칙 문서](#rule-array)에서 설명한 것처럼, `array` 규칙은 허용되는 배열 키 목록을 받을 수 있습니다. 해당 배열 내에 허용된 키 외의 추가 키가 존재한다면, 유효성 검증은 실패합니다.

```
use Illuminate\Support\Facades\Validator;

$input = [
    'user' => [
        'name' => 'Taylor Otwell',
        'username' => 'taylorotwell',
        'admin' => true,
    ],
];

Validator::make($input, [
    'user' => 'array:username,locale',
]);
```

일반적으로 배열 내에 포함될 수 있는 키를 항상 명시적으로 지정해야 합니다. 그렇지 않으면 validator의 `validate` 및 `validated` 메서드가 배열과 모든 키(다른 중첩 배열 검증 규칙으로 검증하지 않은 키 포함)까지 검증된 데이터로 반환하게 됩니다.

<a name="validating-nested-array-input"></a>
### 중첩 배열 입력 데이터 유효성 검증

중첩 배열 기반 폼 입력 필드 유효성 검증도 어렵지 않습니다. 배열 내부 속성을 검증할 때는 "점 표기법(dot notation)"을 사용하면 됩니다. 예를 들어, 요청에 `photos[profile]` 필드가 있다면 다음처럼 검증할 수 있습니다.

```
use Illuminate\Support\Facades\Validator;

$validator = Validator::make($request->all(), [
    'photos.profile' => 'required|image',
]);
```

배열의 각 항목도 쉽게 검증할 수 있습니다. 예를 들어, 배열 입력 필드의 각 이메일이 유일한 값이어야 한다면 다음과 같이 작성할 수 있습니다.

```
$validator = Validator::make($request->all(), [
    'person.*.email' => 'email|unique:users',
    'person.*.first_name' => 'required_with:person.*.last_name',
]);
```

마찬가지로, [언어 파일에서 커스텀 유효성 메시지](#custom-messages-for-specific-attributes) 지정 시에도 `*` 문자를 사용할 수 있으므로, 배열 기반 필드에 대해 단일 유효성 메시지를 쉽게 사용할 수 있습니다.

```
'custom' => [
    'person.*.email' => [
        'unique' => 'Each person must have a unique email address',
    ]
],
```

<a name="accessing-nested-array-data"></a>
#### 중첩 배열 데이터에 접근하기

어떤 중첩 배열 항목의 값에 따라 유효성 검증 규칙을 지정할 필요가 있을 때가 있습니다. 이럴 때는 `Rule::forEach` 메서드를 사용할 수 있습니다. `forEach` 메서드는 배열 속성의 각 항목마다 실행될 클로저를 받고, 배열 요소의 값과 전체 확장된(fully-expanded) 속성명을 인자로 넘겨줍니다. 클로저는 해당 항목에 할당할 규칙 배열을 반환해야 합니다.

```
use App\Rules\HasPermission;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

$validator = Validator::make($request->all(), [
    'companies.*.id' => Rule::forEach(function ($value, $attribute) {
        return [
            Rule::exists(Company::class, 'id'),
            new HasPermission('manage-company', $value),
        ];
    }),
]);
```

<a name="error-message-indexes-and-positions"></a>
### 오류 메시지에 인덱스와 위치 표시

배열을 검증할 때, 특정 항목의 인덱스나 위치 정보를 에러 메시지에 포함하고 싶을 수 있습니다. 이런 경우 [커스텀 유효성 메시지](#manual-customizing-the-error-messages)에서 `:index`(0부터 시작)와 `:position`(1부터 시작) 플레이스홀더를 사용할 수 있습니다.

```
use Illuminate\Support\Facades\Validator;

$input = [
    'photos' => [
        [
            'name' => 'BeachVacation.jpg',
            'description' => 'A photo of my beach vacation!',
        ],
        [
            'name' => 'GrandCanyon.jpg',
            'description' => '',
        ],
    ],
];

Validator::validate($input, [
    'photos.*.description' => 'required',
], [
    'photos.*.description.required' => 'Please describe photo #:position.',
]);
```

위 예시에서는 두 번째 항목에서 유효성 검증이 실패하므로, 사용자에게는 _"Please describe photo #2."_라는 오류 메시지가 표시됩니다.

<a name="validating-files"></a>
## 파일 유효성 검증

라라벨은 업로드된 파일을 검증하기 위한 다양한 유효성 검증 규칙(`mimes`, `image`, `min`, `max` 등)을 제공합니다. 이러한 규칙을 파일 검증 시 각각 개별적으로 지정할 수도 있지만, 라라벨에서는 유창한(fluent) 파일 검증 규칙 빌더도 제공하므로 더욱 편리하게 검증할 수 있습니다.

```
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\File;

Validator::validate($input, [
    'attachment' => [
        'required',
        File::types(['mp3', 'wav'])
            ->min(1024)
            ->max(12 * 1024),
    ],
]);
```

애플리케이션에서 사용자가 이미지를 업로드할 수 있도록 하고 싶다면 `File` 규칙의 `image` 생성자를 사용할 수 있습니다. 더불어, `dimensions` 규칙을 함께 적용해 이미지의 크기도 제한할 수 있습니다.

```
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\File;

Validator::validate($input, [
    'photo' => [
        'required',
        File::image()
            ->min(1024)
            ->max(12 * 1024)
            ->dimensions(Rule::dimensions()->maxWidth(1000)->maxHeight(500)),
    ],
]);
```

> [!NOTE]
> 이미지 크기 검증에 대한 더욱 자세한 정보는 [dimensions 규칙 문서](#rule-dimensions)를 참고하세요.

<a name="validating-files-file-types"></a>
#### 파일 타입

`types` 메서드를 사용할 때에는 확장자만 지정하면 되지만, 실제로는 해당 파일의 내용을 읽어서 MIME 타입을 유추하고 파일의 MIME 타입을 검사합니다. 전체 MIME 타입과 그에 대응하는 확장자 목록은 아래에서 확인할 수 있습니다.

[https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types](https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types)

<a name="validating-passwords"></a>
## 비밀번호 유효성 검증

비밀번호의 복잡도가 충분하도록 검사하려면 라라벨의 `Password` 규칙 객체를 사용할 수 있습니다.

```
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

$validator = Validator::make($request->all(), [
    'password' => ['required', 'confirmed', Password::min(8)],
]);
```

`Password` 규칙 객체는 비밀번호의 최소 길이, 문자, 숫자, 기호, 대소문자 조합과 같은 복잡도 조건을 매우 자유롭게 커스터마이즈할 수 있습니다.

```
// 최소 8자 이상이어야 함
Password::min(8)

// 1개 이상의 문자가 반드시 포함되어야 함
Password::min(8)->letters()

// 최소 1개의 대문자와 1개의 소문자가 포함되어야 함
Password::min(8)->mixedCase()

// 최소 1개의 숫자가 포함되어야 함
Password::min(8)->numbers()

// 최소 1개의 기호가 포함되어야 함
Password::min(8)->symbols()
```

또한, 입력된 비밀번호가 이미 공공 데이터 유출 등에서 유출된 적이 없는지 `uncompromised` 메서드로 검증할 수도 있습니다.

```
Password::min(8)->uncompromised()
```

내부적으로는 [k-Anonymity](https://en.wikipedia.org/wiki/K-anonymity) 모델을 사용해서 [haveibeenpwned.com](https://haveibeenpwned.com) 서비스를 활용하되, 사용자의 프라이버시와 보안을 해치지 않습니다.

기본적으로 데이터 유출 내에서 1회라도 발견된 비밀번호는 `compromised`로 간주하지만, 유출 허용 횟수를 `uncompromised` 메서드의 첫 번째 파라미터로 수정할 수도 있습니다.

```
// 데이터 유출 내에서 3회 미만으로만 발견된 경우까지 허용
Password::min(8)->uncompromised(3);
```

물론 위 예시의 여러 메서드를 모두 체이닝해서 사용할 수도 있습니다.

```
Password::min(8)
    ->letters()
    ->mixedCase()
    ->numbers()
    ->symbols()
    ->uncompromised()
```

<a name="defining-default-password-rules"></a>
#### 기본 비밀번호 규칙 정의하기

애플리케이션에서 비밀번호 유효성 검증 기본 규칙을 한 곳에 공통적으로 정의하면 편리할 수 있습니다. `Password::defaults` 메서드를 사용하면 손쉽게 설정할 수 있으며, 이 메서드에는 기본 규칙을 반환하는 클로저를 전달하면 됩니다. 일반적으로 이 규칙은 서비스 프로바이더의 `boot` 메서드에서 호출하는 것이 좋습니다.

```php
use Illuminate\Validation\Rules\Password;

/**
 * Bootstrap any application services.
 *
 * @return void
 */
public function boot()
{
    Password::defaults(function () {
        $rule = Password::min(8);

        return $this->app->isProduction()
                    ? $rule->mixedCase()->uncompromised()
                    : $rule;
    });
}
```

이후 비밀번호 검증 시 기본 규칙을 적용하려면, 별도의 인자 없이 `defaults()` 메서드를 호출하면 됩니다.

```
'password' => ['required', Password::defaults()],
```

경우에 따라 기본 비밀번호 규칙에 추가 검증 조건을 붙이고 싶을 수도 있습니다. 이럴 땐 `rules` 메서드를 사용할 수 있습니다.

```
use App\Rules\ZxcvbnRule;

Password::defaults(function () {
    $rule = Password::min(8)->rules([new ZxcvbnRule]);

    // ...
});
```

<a name="custom-validation-rules"></a>
## 커스텀 유효성 검증 규칙

<a name="using-rule-objects"></a>
### 규칙 객체 사용하기

라라벨은 다양한 기본 유효성 규칙을 제공하지만, 직접 커스텀 규칙을 만들어 사용하고 싶을 수도 있습니다. 커스텀 유효성 규칙 등록 방법 중 하나는 규칙 객체(rule object)를 이용하는 것입니다. 새 규칙 객체를 생성하려면 `make:rule` 아티즌 명령어를 사용합니다. 아래 예시처럼 문자열이 모두 대문자인지 확인하는 규칙을 만들어 보겠습니다. 라라벨은 새 규칙 클래스를 `app/Rules` 디렉토리에 생성하며, 이 디렉토리가 없을 경우 명령어 실행 시 자동으로 만듭니다.

```shell
php artisan make:rule Uppercase --invokable
```

규칙이 생성되었으면, 이제 동작을 정의해봅니다. 규칙 객체는 하나의 메서드 `__invoke`만을 포함하며, 이 메서드는 속성명, 값, 검증 실패 시 호출할 콜백(에러 메시지)을 받습니다.

```
<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\InvokableRule;

class Uppercase implements InvokableRule
{
    /**
     * Run the validation rule.
     *
     * @param  string  $attribute
     * @param  mixed  $value
     * @param  \Closure  $fail
     * @return void
     */
    public function __invoke($attribute, $value, $fail)
    {
        if (strtoupper($value) !== $value) {
            $fail('The :attribute must be uppercase.');
        }
    }
}
```

이제, 정의한 규칙 객체 인스턴스를 다른 유효성 규칙과 함께 validator에 전달하여 사용할 수 있습니다.

```
use App\Rules\Uppercase;

$request->validate([
    'name' => ['required', 'string', new Uppercase],
]);
```

#### 유효성 검사 메시지 번역하기

`$fail` 클로저에 직접 오류 메시지를 전달하는 대신, [번역 문자열 키](/docs/9.x/localization)를 지정하여 라라벨이 해당 오류 메시지를 번역하도록 할 수 있습니다.

```
if (strtoupper($value) !== $value) {
    $fail('validation.uppercase')->translate();
}
```

필요하다면, `translate` 메서드의 첫 번째와 두 번째 인수로 각각 플레이스홀더 치환 값과 원하는 언어를 전달할 수 있습니다.

```
$fail('validation.location')->translate([
    'value' => $this->value,
], 'fr')
```

#### 추가 데이터 접근

커스텀 유효성 검사 규칙 클래스에서 검증 대상이 되는 모든 데이터를 접근해야 한다면, 해당 클래스에서 `Illuminate\Contracts\Validation\DataAwareRule` 인터페이스를 구현할 수 있습니다. 이 인터페이스는 클래스에 `setData` 메서드 정의를 요구합니다. 라라벨은 유효성 검사 전에 자동으로 이 메서드를 호출하여, 검증 대상이 되는 모든 데이터를 전달합니다.

```
<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\DataAwareRule;
use Illuminate\Contracts\Validation\InvokableRule;

class Uppercase implements DataAwareRule, InvokableRule
{
    /**
     * 검증 대상 데이터 전체.
     *
     * @var array
     */
    protected $data = [];

    // ...

    /**
     * 검증 대상 데이터를 설정합니다.
     *
     * @param  array  $data
     * @return $this
     */
    public function setData($data)
    {
        $this->data = $data;

        return $this;
    }
}
```

또한 유효성 검사를 수행하는 validator 인스턴스에 접근이 필요한 경우, `ValidatorAwareRule` 인터페이스를 구현할 수 있습니다.

```
<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\InvokableRule;
use Illuminate\Contracts\Validation\ValidatorAwareRule;

class Uppercase implements InvokableRule, ValidatorAwareRule
{
    /**
     * validator 인스턴스
     *
     * @var \Illuminate\Validation\Validator
     */
    protected $validator;

    // ...

    /**
     * 현재 validator를 설정합니다.
     *
     * @param  \Illuminate\Validation\Validator  $validator
     * @return $this
     */
    public function setValidator($validator)
    {
        $this->validator = $validator;

        return $this;
    }
}
```

<a name="using-closures"></a>
### 클로저(Closure) 사용하기

애플리케이션에서 단 한 번만 사용할 커스텀 규칙이라면, 규칙 객체 대신 클로저를 사용할 수 있습니다. 이 클로저는 속성의 이름, 속성 값, 그리고 검증 실패 시 호출해야 하는 `$fail` 콜백을 인수로 받습니다.

```
use Illuminate\Support\Facades\Validator;

$validator = Validator::make($request->all(), [
    'title' => [
        'required',
        'max:255',
        function ($attribute, $value, $fail) {
            if ($value === 'foo') {
                $fail('The '.$attribute.' is invalid.');
            }
        },
    ],
]);
```

<a name="implicit-rules"></a>
### 암묵적 규칙(Implicit Rules)

기본적으로, 검증 대상 속성이 존재하지 않거나 빈 문자열인 경우 일반 유효성 검사 규칙은커녕, 커스텀 규칙조차 실행되지 않습니다. 예를 들어, [`unique`](#rule-unique) 규칙은 빈 문자열에 대해서는 실행되지 않습니다.

```
use Illuminate\Support\Facades\Validator;

$rules = ['name' => 'unique:users,name'];

$input = ['name' => ''];

Validator::make($input, $rules)->passes(); // true
```

빈 값이더라도 커스텀 규칙이 반드시 실행되도록 하려면, 해당 규칙이 속성이 필수임을 _암묵적으로_ 지정해야 합니다. 새로운 암묵적 규칙 객체를 빠르게 생성하기 위해서는, `--implicit` 옵션을 사용하여 `make:rule` 아티즌 명령어를 실행합니다.

```shell
php artisan make:rule Uppercase --invokable --implicit
```

> [!WARNING]
> "암묵적(implicit)" 규칙이란, 해당 속성이 필수임을 _암시_ 한다는 의미일 뿐입니다. 실제로 값이 없거나 비어 있을 때 검증에 실패 처리할지는 개발자가 규칙 클래스에서 직접 정의해야 합니다.