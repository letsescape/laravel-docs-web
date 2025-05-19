# 유효성 검증 (Validation)

- [소개](#introduction)
- [유효성 검증 빠른 시작](#validation-quickstart)
    - [라우트 정의하기](#quick-defining-the-routes)
    - [컨트롤러 생성하기](#quick-creating-the-controller)
    - [유효성 검증 로직 작성하기](#quick-writing-the-validation-logic)
    - [유효성 검증 에러 메시지 표시하기](#quick-displaying-the-validation-errors)
    - [폼 입력값 자동 재입력하기](#repopulating-forms)
    - [선택 필드에 대한 참고 사항](#a-note-on-optional-fields)
    - [유효성 검증 에러 응답 포맷](#validation-error-response-format)
- [폼 리퀘스트 유효성 검증](#form-request-validation)
    - [폼 리퀘스트 생성하기](#creating-form-requests)
    - [폼 리퀘스트 인가 처리](#authorizing-form-requests)
    - [에러 메시지 커스터마이징](#customizing-the-error-messages)
    - [유효성 검증용 입력값 전처리](#preparing-input-for-validation)
- [수동으로 유효성 검사기 생성하기](#manually-creating-validators)
    - [자동 리다이렉션](#automatic-redirection)
    - [네임드 에러 백 사용하기](#named-error-bags)
    - [에러 메시지 커스터마이징](#manual-customizing-the-error-messages)
    - [추가 유효성 검증 수행하기](#performing-additional-validation)
- [검증된 입력값 다루기](#working-with-validated-input)
- [에러 메시지 다루기](#working-with-error-messages)
    - [언어 파일에서 커스텀 메시지 지정](#specifying-custom-messages-in-language-files)
    - [언어 파일에서 속성 지정](#specifying-attribute-in-language-files)
    - [언어 파일에서 값 지정](#specifying-values-in-language-files)
- [사용 가능한 유효성 검증 규칙](#available-validation-rules)
- [조건부 규칙 추가](#conditionally-adding-rules)
- [배열 유효성 검증](#validating-arrays)
    - [중첩 배열 입력값 검증](#validating-nested-array-input)
    - [에러 메시지의 인덱스 및 위치](#error-message-indexes-and-positions)
- [파일 유효성 검증](#validating-files)
- [비밀번호 유효성 검증](#validating-passwords)
- [커스텀 유효성 검증 규칙](#custom-validation-rules)
    - [Rule 객체 사용](#using-rule-objects)
    - [클로저 사용](#using-closures)
    - [암묵적 규칙](#implicit-rules)

<a name="introduction"></a>
## 소개

라라벨은 애플리케이션으로 들어오는 데이터를 유효성 검증하기 위한 여러 가지 접근 방식을 제공합니다. 가장 일반적인 방법은 모든 HTTP 요청에서 사용할 수 있는 `validate` 메서드를 사용하는 것입니다. 하지만 이 문서에서는 다른 유효성 검증 방법들도 함께 다룹니다.

라라벨에는 매우 다양한 편리한 유효성 검증 규칙들이 포함되어 있습니다. 특정 데이터베이스 테이블에서 값의 유일성까지 검증할 수 있으며, 이러한 유효성 검증 규칙 하나하나를 자세히 설명할 예정입니다. 이를 통해 라라벨의 유효성 검증 기능을 모두 이해할 수 있습니다.

<a name="validation-quickstart"></a>
## 유효성 검증 빠른 시작

라라벨의 강력한 유효성 검증 기능을 익히려면, 폼을 검증하고 사용자에게 에러 메시지를 표시하는 전체 예제를 살펴보는 것이 좋습니다. 아래 전체적인 흐름을 따라 읽으면, 라라벨을 사용해 들어오는 요청 데이터를 어떻게 검증하는지 전반적인 이해를 하실 수 있습니다.

<a name="quick-defining-the-routes"></a>
### 라우트 정의하기

우선, `routes/web.php` 파일에 다음과 같이 라우트를 정의한다고 가정해보겠습니다:

```
use App\Http\Controllers\PostController;

Route::get('/post/create', [PostController::class, 'create']);
Route::post('/post', [PostController::class, 'store']);
```

`GET` 라우트는 사용자가 새 블로그 포스트를 작성할 수 있는 폼을 보여주며, `POST` 라우트는 작성된 블로그 포스트를 데이터베이스에 저장합니다.

<a name="quick-creating-the-controller"></a>
### 컨트롤러 생성하기

다음으로, 이 라우트로 들어오는 요청을 처리하는 간단한 컨트롤러를 살펴보겠습니다. 여기서는 `store` 메서드는 일단 비워두겠습니다:

```
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class PostController extends Controller
{
    /**
     * Show the form to create a new blog post.
     */
    public function create(): View
    {
        return view('post.create');
    }

    /**
     * Store a new blog post.
     */
    public function store(Request $request): RedirectResponse
    {
        // Validate and store the blog post...

        $post = /** ... */

        return to_route('post.show', ['post' => $post->id]);
    }
}
```

<a name="quick-writing-the-validation-logic"></a>
### 유효성 검증 로직 작성하기

이제, 새 블로그 포스트를 검증하는 로직으로 `store` 메서드를 완성할 차례입니다. 이를 위해 `Illuminate\Http\Request` 객체에서 제공하는 `validate` 메서드를 사용합니다. 유효성 검증 규칙을 통과하면 코드는 정상적으로 계속 실행됩니다. 그러나 검증에 실패할 경우 `Illuminate\Validation\ValidationException` 예외가 발생하며, 적절한 에러 응답이 자동으로 사용자에게 전송됩니다.

전통적인 HTTP 요청에서 검증이 실패하면 이전 URL로 리다이렉트하는 응답이 생성됩니다. 만약 들어온 요청이 XHR(비동기) 요청이면, [검증 에러 메시지가 담긴 JSON 응답](#validation-error-response-format)이 반환됩니다.

`validate` 메서드의 동작 방식을 더 잘 이해하기 위해 `store` 메서드 예시를 봅시다:

```
/**
 * Store a new blog post.
 */
public function store(Request $request): RedirectResponse
{
    $validated = $request->validate([
        'title' => 'required|unique:posts|max:255',
        'body' => 'required',
    ]);

    // The blog post is valid...

    return redirect('/posts');
}
```

보시다시피, 검증 규칙들은 `validate` 메서드의 인수로 전달됩니다. 걱정하지 마세요. 사용 가능한 모든 유효성 검증 규칙은 [여기서](#available-validation-rules) 자세히 문서화되어 있습니다. 다시 말씀드리면, 검증에 실패하면 적절한 응답이 자동으로 생성됩니다. 검증을 통과하면 컨트롤러는 계속 정상 실행됩니다.

또한, 검증 규칙은 `|`로 구분된 문자열 대신 각각 배열로 지정할 수도 있습니다:

```
$validatedData = $request->validate([
    'title' => ['required', 'unique:posts', 'max:255'],
    'body' => ['required'],
]);
```

또한, 요청을 검증하면서 발생한 에러 메시지를 [네임드 에러 백](#named-error-bags)에 저장하고 싶을 땐 `validateWithBag` 메서드를 사용할 수 있습니다:

```
$validatedData = $request->validateWithBag('post', [
    'title' => ['required', 'unique:posts', 'max:255'],
    'body' => ['required'],
]);
```

<a name="stopping-on-first-validation-failure"></a>
#### 첫 번째 검증 실패 시 중지하기

때로는 하나의 속성(attribute)에 대해 첫 번째 유효성 검증에 실패하면 그 이후의 검증 규칙을 실행하지 않게 하고 싶을 때가 있습니다. 이럴 때는 해당 속성에 `bail` 규칙을 추가하면 됩니다:

```
$request->validate([
    'title' => 'bail|required|unique:posts|max:255',
    'body' => 'required',
]);
```

이 예시에서, 만약 `title` 속성에 설정된 `unique` 규칙이 실패하면, 그 이후의 `max` 규칙은 검사하지 않습니다. 규칙들은 지정된 순서대로 검증됩니다.

<a name="a-note-on-nested-attributes"></a>
#### 중첩 속성에 대한 참고 사항

들어오는 HTTP 요청에 "중첩된(nested)" 필드 데이터가 들어올 경우, 검증 규칙에서 "닷(dot, .)" 문법을 이용해 필드명을 지정하면 됩니다:

```
$request->validate([
    'title' => 'required|unique:posts|max:255',
    'author.name' => 'required',
    'author.description' => 'required',
]);
```

반면, 필드명에 마침표(`.`)가 실제로 포함되어 있고 이것이 "dot" 문법이 아니기를 원한다면, 백슬래시(`\`)로 마침표를 이스케이프 처리해서 의도를 명확히 할 수 있습니다:

```
$request->validate([
    'title' => 'required|unique:posts|max:255',
    'v1\.0' => 'required',
]);
```

<a name="quick-displaying-the-validation-errors"></a>
### 유효성 검증 에러 메시지 표시하기

그렇다면, 들어온 요청의 필드 값이 지정한 유효성 검증 규칙을 통과하지 못한다면 어떻게 될까요? 앞서 언급했듯이, 라라벨은 자동으로 사용자를 이전 위치로 리다이렉트합니다. 뿐만 아니라, 모든 유효성 검증 에러와 [요청 입력값](/docs/10.x/requests#retrieving-old-input)이 자동으로 [세션에 플래시됩니다](/docs/10.x/session#flash-data).

`Illuminate\View\Middleware\ShareErrorsFromSession` 미들웨어에 의해 `$errors` 변수는 애플리케이션의 모든 뷰(view)에서 항상 사용할 수 있도록 자동으로 공유됩니다. 이 미들웨어는 `web` 미들웨어 그룹에 포함되어 있습니다. 따라서 여러분은 뷰 파일에서 `$errors` 변수가 항상 정의되어 있다고 가정하고 안전하게 사용할 수 있습니다. `$errors` 변수는 `Illuminate\Support\MessageBag` 클래스의 인스턴스입니다. 이 객체를 사용하는 방법이 궁금하다면 [관련 문서](#working-with-error-messages)를 참고하세요.

따라서, 이 예시에서는 검증 실패 시 사용자는 컨트롤러의 `create` 메서드로 리다이렉트되고, 뷰에서 에러 메시지를 표시할 수 있습니다:

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
#### 에러 메시지 커스터마이징

라라벨에서 기본적으로 제공하는 유효성 검증 규칙마다 각각의 에러 메시지는 애플리케이션의 `lang/en/validation.php` 파일에 정의되어 있습니다. 만약 애플리케이션에 `lang` 디렉토리가 없다면, `lang:publish` 아티즌 명령어를 사용해 디렉토리를 만들 수 있습니다.

`lang/en/validation.php` 파일에는 각각의 유효성 검증 규칙에 대한 번역 항목이 있습니다. 여러분은 애플리케이션에 맞게 이 메시지를 자유롭게 수정할 수 있습니다.

또한, 이 파일을 원하는 언어 디렉토리로 복사하여 에러 메시지를 애플리케이션 언어에 맞게 번역할 수도 있습니다. 라라벨의 다국어 지원 기능에 대해 더 자세히 알고 싶다면 [로컬라이제이션 문서](/docs/10.x/localization)를 참고하세요.

> [!WARNING]
> 기본적으로 라라벨 애플리케이션의 기본 구조(스캐폴딩)에는 `lang` 디렉토리가 포함되어 있지 않습니다. 라라벨의 언어 파일을 커스터마이즈하려면, `lang:publish` 아티즌 명령어로 해당 파일을 퍼블리시해야 합니다.

<a name="quick-xhr-requests-and-validation"></a>
#### XHR 요청과 유효성 검증

이 예제에서는 전통적인 폼을 사용하여 데이터를 애플리케이션에 전송했습니다. 하지만, 많은 애플리케이션에서는 자바스크립트로 구동되는 프론트엔드에서 XHR(비동기 HTTP) 요청을 받습니다. XHR 요청 중에 `validate` 메서드를 사용하는 경우, 라라벨은 리다이렉트 응답을 생성하지 않고, 대신 [모든 유효성 검증 에러가 담긴 JSON 응답](#validation-error-response-format)을 반환합니다. 이 JSON 응답은 422 HTTP 상태 코드로 전송됩니다.

<a name="the-at-error-directive"></a>
#### `@error` 디렉티브

주어진 속성(attribute)에 대한 유효성 검증 에러 메시지가 있는지 빠르게 확인해야 할 때는 [Blade](/docs/10.x/blade)의 `@error` 디렉티브를 사용할 수 있습니다. `@error` 블록 안에서 `$message` 변수를 출력해 에러 메시지를 바로 표시할 수 있습니다:

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

[네임드 에러 백](#named-error-bags)을 사용하는 경우, `@error` 디렉티브의 두 번째 인수로 에러 백의 이름을 넘길 수 있습니다:

```blade
<input ... class="@error('title', 'post') is-invalid @enderror">
```

<a name="repopulating-forms"></a>
### 폼 입력값 자동 재입력하기

라라벨은 유효성 검증 실패로 인해 리다이렉트 응답을 생성할 때, 프레임워크가 요청의 모든 입력값을 [자동으로 세션에 플래시](/docs/10.x/session#flash-data)합니다. 이는 다음 요청에서 이전 입력값에 쉽게 접근하여, 사용자가 제출했던 폼을 편리하게 다시 표시할 수 있도록 하기 위함입니다.

이전에 플래시된 입력값을 가져오려면, `Illuminate\Http\Request` 인스턴스의 `old` 메서드를 호출하면 됩니다. `old` 메서드는 [세션](/docs/10.x/session)에서 플래시된 입력값을 불러옵니다:

```
$title = $request->old('title');
```

라라벨은 전역 `old` 헬퍼도 제공합니다. [Blade 템플릿](/docs/10.x/blade)에서 이전 입력값을 표시할 때는 `old` 헬퍼를 사용하는 것이 더 간편합니다. 지정한 필드에 이전 입력값이 없으면 `null`이 반환됩니다:

```blade
<input type="text" name="title" value="{{ old('title') }}">
```

<a name="a-note-on-optional-fields"></a>
### 선택 필드에 대한 참고 사항

기본적으로 라라벨은 애플리케이션의 글로벌 미들웨어 스택에 `TrimStrings`와 `ConvertEmptyStringsToNull` 미들웨어를 포함시킵니다. 이 미들웨어들은 `App\Http\Kernel` 클래스에 등록되어 있습니다. 이 때문에, "선택적(optional)" 요청 필드를 유효성 검증 시 `nullable`로 명시해야 `null` 값이 유효하지 않은 값으로 처리되지 않습니다. 예를 들어:

```
$request->validate([
    'title' => 'required|unique:posts|max:255',
    'body' => 'required',
    'publish_at' => 'nullable|date',
]);
```

이 예시에서 `publish_at` 필드는 `null`이거나, 날짜 포맷의 값이 모두 허용됩니다. 만약 규칙 지정 시 `nullable`을 추가하지 않으면, 검증기는 `null` 값을 유효하지 않은 날짜로 간주하니 주의해야 합니다.

<a name="validation-error-response-format"></a>
### 유효성 검증 에러 응답 포맷

애플리케이션에서 `Illuminate\Validation\ValidationException` 예외를 발생시키고, 들어온 HTTP 요청이 JSON 응답을 기대하는 경우, 라라벨은 에러 메시지를 자동으로 포맷해서 `422 Unprocessable Entity` HTTP 응답으로 반환합니다.

아래는 유효성 검증 에러에 대한 JSON 응답 예시입니다. 중첩된 에러 키는 "dot" 표기법으로 평탄화(flatten)되어 표현됩니다:

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

좀 더 복잡한 유효성 검증 시나리오에서는 "폼 리퀘스트(form request)"를 생성해서 사용하는 것이 좋습니다. 폼 리퀘스트는 자체적으로 유효성 검증과 인가(authorization) 로직을 캡슐화하는 커스텀 리퀘스트 클래스입니다. 폼 리퀘스트 클래스를 생성하려면, `make:request` 아티즌 CLI 명령어를 사용하면 됩니다:

```shell
php artisan make:request StorePostRequest
```

생성된 폼 리퀘스트 클래스는 `app/Http/Requests` 디렉토리에 위치하게 됩니다. 이 디렉토리가 원래 없었다면, `make:request` 명령어 실행과 동시에 자동 생성됩니다. 라라벨에서 생성하는 각 폼 리퀘스트에는 `authorize`와 `rules` 두 가지 메서드가 포함되어 있습니다.

예상하신 것처럼, `authorize` 메서드는 현재 인증된 사용자가 해당 요청이 표현하는 동작을 수행할 수 있는지를 결정하는 역할을 하고, `rules` 메서드는 요청 데이터에 적용될 유효성 검증 규칙을 반환합니다:

```
/**
 * Get the validation rules that apply to the request.
 *
 * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
 */
public function rules(): array
{
    return [
        'title' => 'required|unique:posts|max:255',
        'body' => 'required',
    ];
}
```

> [!NOTE]
> `rules` 메서드의 시그니처에 필요한 모든 의존성을 타입힌트로 선언하면, 라라벨 [서비스 컨테이너](/docs/10.x/container)를 통해 자동으로 주입됩니다.

그렇다면, 이 유효성 검증 규칙들은 언제 평가될까요? 컨트롤러 메서드에서 요청을 타입힌트로 받기만 하면 됩니다. 컨트롤러 메서드가 호출되기 전에 들어오는 폼 리퀘스트가 먼저 유효성 검증을 마치기 때문에, 컨트롤러에 별도의 유효성 검증 코드를 작성할 필요가 없습니다:

```
/**
 * Store a new blog post.
 */
public function store(StorePostRequest $request): RedirectResponse
{
    // The incoming request is valid...

    // Retrieve the validated input data...
    $validated = $request->validated();

    // Retrieve a portion of the validated input data...
    $validated = $request->safe()->only(['name', 'email']);
    $validated = $request->safe()->except(['name', 'email']);

    // Store the blog post...

    return redirect('/posts');
}
```

유효성 검증에 실패하면, 사용자는 이전 위치로 리다이렉트되며, 에러도 세션에 플래시됩니다. 만약 요청이 XHR 요청이었다면 422 상태 코드의 HTTP 응답, 즉 [유효성 검증 에러의 JSON 표현](#validation-error-response-format)이 반환됩니다.

> [!NOTE]
> 인에르시아(Inertia) 기반 라라벨 프론트엔드에 실시간 폼 리퀘스트 유효성 검증을 추가해야 하나요? [Laravel Precognition](/docs/10.x/precognition)을 참고하세요.

<a name="performing-additional-validation-on-form-requests"></a>
#### 폼 리퀘스트에서 추가 유효성 검증 수행하기

때로는, 초기 유효성 검증이 완료된 이후에 추가 검증을 해야 할 수도 있습니다. 이럴 땐 폼 리퀘스트의 `after` 메서드를 사용합니다.

`after` 메서드는 콜러블(callable) 또는 클로저(closure)의 배열을 반환해야 하며, 유효성 검증 완료 후에 호출됩니다. 이 콜러블에는 `Illuminate\Validation\Validator` 인스턴스가 전달되므로, 필요시 추가 에러 메시지를 등록할 수 있습니다:

```
use Illuminate\Validation\Validator;

/**
 * Get the "after" validation callables for the request.
 */
public function after(): array
{
    return [
        function (Validator $validator) {
            if ($this->somethingElseIsInvalid()) {
                $validator->errors()->add(
                    'field',
                    'Something is wrong with this field!'
                );
            }
        }
    ];
}
```

설명한 것처럼, `after` 메서드가 반환하는 배열에는 바로 실행 가능한 클래스도 포함될 수 있습니다. 이런 클래스의 `__invoke` 메서드에는 `Illuminate\Validation\Validator` 인스턴스가 전달됩니다:

```php
use App\Validation\ValidateShippingTime;
use App\Validation\ValidateUserStatus;
use Illuminate\Validation\Validator;

/**
 * Get the "after" validation callables for the request.
 */
public function after(): array
{
    return [
        new ValidateUserStatus,
        new ValidateShippingTime,
        function (Validator $validator) {
            //
        }
    ];
}
```

<a name="request-stopping-on-first-validation-rule-failure"></a>
#### 첫 번째 검증 실패 시 전체 속성 검사 중지

리퀘스트 클래스에 `stopOnFirstFailure` 프로퍼티를 추가하면, 하나의 검증 실패 발생 시 모든 속성(attribute)의 유효성 검증을 즉시 중단하도록 검증기에 알릴 수 있습니다:

```
/**
 * Indicates if the validator should stop on the first rule failure.
 *
 * @var bool
 */
protected $stopOnFirstFailure = true;
```

<a name="customizing-the-redirect-location"></a>
#### 리다이렉트 위치 커스터마이징

앞서 설명한 것처럼, 폼 리퀘스트 유효성 검증 실패 시 사용자는 이전 위치로 리다이렉트됩니다. 하지만 이 동작을 자유롭게 변경할 수 있습니다. 폼 리퀘스트에 `$redirect` 프로퍼티를 정의하면 됩니다:

```
/**
 * The URI that users should be redirected to if validation fails.
 *
 * @var string
 */
protected $redirect = '/dashboard';
```

또는, 네임드 라우트로 리다이렉트하고 싶다면 `$redirectRoute` 프로퍼티를 정의하면 됩니다:

```
/**
 * The route that users should be redirected to if validation fails.
 *
 * @var string
 */
protected $redirectRoute = 'dashboard';
```

<a name="authorizing-form-requests"></a>
### 폼 리퀘스트 인가 처리

폼 리퀘스트 클래스에는 `authorize` 메서드도 포함되어 있습니다. 이 메서드에서 인증된 사용자가 실제로 해당 리소스를 수정할 권한이 있는지 결정할 수 있습니다. 예를 들어, 사용자가 어떤 블로그 댓글을 수정하려고 하는데, 실제로 그 댓글의 작성자인지 확인할 수 있습니다. 일반적으로 이 메서드 안에서 [인가 게이트와 정책](/docs/10.x/authorization)을 활용하게 됩니다:

```
use App\Models\Comment;

/**
 * Determine if the user is authorized to make this request.
 */
public function authorize(): bool
{
    $comment = Comment::find($this->route('comment'));

    return $comment && $this->user()->can('update', $comment);
}
```

모든 폼 리퀘스트는 라라벨의 기본 리퀘스트 클래스를 확장하므로, `user` 메서드로 현재 인증된 사용자를 얻을 수 있습니다. 또한 위 예시의 `route` 메서드를 보면, 호출된 라우트에서 정의한 URI 파라미터(예: `{comment}`)에 접근할 수 있습니다:

```
Route::post('/comment/{comment}');
```

따라서, [라우트 모델 바인딩](/docs/10.x/routing#route-model-binding)를 활용하면, 리퀘스트의 속성(property)으로 바로 바인딩된 모델 인스턴스를 사용할 수 있어 코드가 더 간결해집니다:

```
return $this->user()->can('update', $this->comment);
```

만약 `authorize` 메서드가 `false`를 반환하면, 라라벨은 자동으로 403 상태 코드의 HTTP 응답을 반환하며, 컨트롤러 메서드는 실행되지 않습니다.

만약 요청의 인가(authorization) 로직을 애플리케이션의 다른 부분에서 처리할 계획이라면, `authorize` 메서드를 아예 삭제하거나, 항상 `true`를 반환하도록 만들 수도 있습니다:

```
/**
 * Determine if the user is authorized to make this request.
 */
public function authorize(): bool
{
    return true;
}
```

> [!NOTE]
> `authorize` 메서드의 시그니처에도 필요한 의존성을 타입힌트로 선언할 수 있습니다. 라라벨 [서비스 컨테이너](/docs/10.x/container)에서 자동으로 주입해줍니다.

<a name="customizing-the-error-messages"></a>
### 에러 메시지 커스터마이징

폼 리퀘스트에서 사용하는 에러 메시지는 `messages` 메서드를 오버라이딩하면 커스터마이징할 수 있습니다. 이 메서드는 속성/규칙 쌍과 그에 대응하는 에러 메시지의 배열을 반환하면 됩니다:

```
/**
 * Get the error messages for the defined validation rules.
 *
 * @return array<string, string>
 */
public function messages(): array
{
    return [
        'title.required' => 'A title is required',
        'body.required' => 'A message is required',
    ];
}
```

<a name="customizing-the-validation-attributes"></a>
#### 유효성 검증 속성명 커스터마이징

라라벨의 기본 유효성 검증 에러 메시지에는 `:attribute` 플레이스홀더가 많이 포함되어 있습니다. 이 `:attribute`를 커스텀한 속성명으로 바꿔서 표시하고 싶을 때는 `attributes` 메서드를 오버라이딩하면 됩니다. 이 메서드는 속성/표시명 쌍의 배열을 반환해야 합니다:

```
/**
 * Get custom attributes for validator errors.
 *
 * @return array<string, string>
 */
public function attributes(): array
{
    return [
        'email' => 'email address',
    ];
}
```

<a name="preparing-input-for-validation"></a>
### 유효성 검증용 입력값 전처리

유효성 검증 규칙을 적용하기 전, 요청의 일부 데이터를 준비하거나 정제(sanitize)해야 할 필요가 있다면, `prepareForValidation` 메서드를 사용할 수 있습니다:

```
use Illuminate\Support\Str;

/**
 * Prepare the data for validation.
 */
protected function prepareForValidation(): void
{
    $this->merge([
        'slug' => Str::slug($this->slug),
    ]);
}
```

마찬가지로, 유효성 검증이 끝난 뒤 요청 데이터의 정규화 작업이 필요하다면, `passedValidation` 메서드를 사용할 수 있습니다:

```
/**
 * Handle a passed validation attempt.
 */
protected function passedValidation(): void
{
    $this->replace(['name' => 'Taylor']);
}
```

<a name="manually-creating-validators"></a>

## 수동으로 Validator 생성하기

요청에서 `validate` 메서드를 사용하지 않고 직접 validator 인스턴스를 생성하고 싶다면, `Validator` [파사드](/docs/10.x/facades)를 사용할 수 있습니다. 파사드의 `make` 메서드는 새로운 validator 인스턴스를 생성합니다.

```
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PostController extends Controller
{
    /**
     * Store a new blog post.
     */
    public function store(Request $request): RedirectResponse
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

        // Retrieve the validated input...
        $validated = $validator->validated();

        // Retrieve a portion of the validated input...
        $validated = $validator->safe()->only(['name', 'email']);
        $validated = $validator->safe()->except(['name', 'email']);

        // Store the blog post...

        return redirect('/posts');
    }
}
```

`make` 메서드의 첫 번째 인수에는 유효성 검사를 진행할 데이터를 전달합니다. 두 번째 인수에는 해당 데이터에 적용할 유효성 검사 규칙의 배열을 전달합니다.

요청의 유효성 검사가 실패했는지 판별한 후에는, `withErrors` 메서드를 사용해 에러 메시지를 세션에 플래시할 수 있습니다. 이 메서드를 사용하면, 리다이렉션 후에 `$errors` 변수가 자동으로 뷰에 공유되어 사용자가 에러 메시지를 쉽게 확인할 수 있습니다. `withErrors` 메서드에는 validator, `MessageBag`, 또는 PHP `array`를 전달할 수 있습니다.

#### 첫 번째 유효성 검증 실패 시 즉시 중단

`stopOnFirstFailure` 메서드를 사용하면, 하나의 유효성 검사가 실패하면 이후의 모든 속성에 대한 검증을 멈추도록 validator에 알릴 수 있습니다.

```
if ($validator->stopOnFirstFailure()->fails()) {
    // ...
}
```

<a name="automatic-redirection"></a>
### 자동 리다이렉션

validator 인스턴스를 수동으로 생성하더라도 HTTP 요청의 `validate` 메서드가 제공하는 자동 리다이렉션 기능을 함께 활용하고 싶다면, 기존 validator 인스턴스에서 `validate` 메서드를 호출하면 됩니다. 유효성 검사가 실패하면 사용자는 자동으로 리다이렉트되거나, XHR 요청인 경우 [JSON 응답이 반환](#validation-error-response-format)됩니다.

```
Validator::make($request->all(), [
    'title' => 'required|unique:posts|max:255',
    'body' => 'required',
])->validate();
```

유효성 검사 실패 시 에러 메시지를 [명명된 에러 가방](#named-error-bags)에 저장하려면 `validateWithBag` 메서드를 사용할 수 있습니다.

```
Validator::make($request->all(), [
    'title' => 'required|unique:posts|max:255',
    'body' => 'required',
])->validateWithBag('post');
```

<a name="named-error-bags"></a>
### 명명된 에러 가방

하나의 페이지에 여러 폼이 있는 경우, 유효성 검사 에러를 담고 있는 `MessageBag`에 이름을 붙여서 특정 폼에 대한 에러 메시지만 가져오고 싶을 수 있습니다. 이를 위해 `withErrors`의 두 번째 인수로 이름을 전달하면 됩니다.

```
return redirect('register')->withErrors($validator, 'login');
```

이후에는 `$errors` 변수에서 명명된 `MessageBag` 인스턴스에 접근할 수 있습니다.

```blade
{{ $errors->login->first('email') }}
```

<a name="manual-customizing-the-error-messages"></a>
### 에러 메시지 커스터마이징

필요하다면 validator 인스턴스가 기본적으로 제공하는 라라벨의 에러 메시지 대신 커스텀 에러 메시지를 사용할 수 있습니다. 커스텀 메시지는 여러 방법으로 지정할 수 있습니다. 가장 먼저, `Validator::make`의 세 번째 인수로 메시지 배열을 전달하는 방법이 있습니다.

```
$validator = Validator::make($input, $rules, $messages = [
    'required' => 'The :attribute field is required.',
]);
```

이 예시에서 `:attribute` 플레이스홀더는 실제 유효성 검사가 적용되는 필드명으로 대체됩니다. 또한, 유효성 검사 메시지에는 다양한 플레이스홀더를 사용할 수 있습니다. 예를 들어:

```
$messages = [
    'same' => 'The :attribute and :other must match.',
    'size' => 'The :attribute must be exactly :size.',
    'between' => 'The :attribute value :input is not between :min - :max.',
    'in' => 'The :attribute must be one of the following types: :values',
];
```

<a name="specifying-a-custom-message-for-a-given-attribute"></a>
#### 특정 속성에 대해 커스텀 메시지 지정하기

특정 속성에만 커스텀 에러 메시지를 지정하고 싶을 때는 "도트" 표기법을 사용하면 됩니다. 먼저 속성명을 적고, 점(`.`)을 찍은 뒤 규칙명을 적습니다.

```
$messages = [
    'email.required' => 'We need to know your email address!',
];
```

<a name="specifying-custom-attribute-values"></a>
#### 속성명 커스터마이즈하기

라라벨의 기본 에러 메시지에는 보통 `:attribute` 플레이스홀더가 들어 있는데, 이는 해당 속성명으로 대체됩니다. 특정 필드에 대해 이 플레이스홀더가 표시되는 값을 바꾸고 싶다면, `Validator::make`의 네 번째 인수로 커스텀 속성 배열을 전달하세요.

```
$validator = Validator::make($input, $rules, $messages, [
    'email' => 'email address',
]);
```

<a name="performing-additional-validation"></a>
### 추가 유효성 검사 수행하기

처음 유효성 검사 후에 별도의 추가 검증이 필요하다면, validator의 `after` 메서드를 사용할 수 있습니다. `after` 메서드는 검증이 끝난 후에 호출되는 클로저 또는 콜러블(callable)의 배열을 인수로 받습니다. 전달한 콜러블은 `Illuminate\Validation\Validator` 인스턴스를 받아서, 필요한 경우 추가적인 에러 메시지를 등록할 수 있습니다.

```
use Illuminate\Support\Facades\Validator;

$validator = Validator::make(/* ... */);

$validator->after(function ($validator) {
    if ($this->somethingElseIsInvalid()) {
        $validator->errors()->add(
            'field', 'Something is wrong with this field!'
        );
    }
});

if ($validator->fails()) {
    // ...
}
```

위에서 설명했듯이, `after` 메서드는 콜러블 배열도 받을 수 있습니다. "검증 이후 로직"이 __invoke 메서드를 통해 `Illuminate\Validation\Validator` 인스턴스를 받는 호출 가능한 클래스에 캡슐화되어 있다면 더욱 편리합니다.

```php
use App\Validation\ValidateShippingTime;
use App\Validation\ValidateUserStatus;

$validator->after([
    new ValidateUserStatus,
    new ValidateShippingTime,
    function ($validator) {
        // ...
    },
]);
```

<a name="working-with-validated-input"></a>
## 유효성 검사된 입력 데이터 활용하기

폼 리퀘스트 또는 직접 생성한 validator 인스턴스를 사용해 들어온 요청 데이터를 검증한 뒤, 실제로 검증을 통과한 입력 데이터를 가져오고 싶을 수 있습니다. 이를 위해 몇 가지 방법이 있습니다. 먼저, 폼 리퀘스트나 validator 인스턴스에서 `validated` 메서드를 호출하면, 검증된 데이터의 배열을 반환합니다.

```
$validated = $request->validated();

$validated = $validator->validated();
```

또는, 폼 리퀘스트나 validator 인스턴스에서 `safe` 메서드를 호출할 수도 있습니다. 이 메서드는 `Illuminate\Support\ValidatedInput` 인스턴스를 반환합니다. 반환된 객체는 `only`, `except`, `all` 메서드를 제공하여 검증된 데이터의 일부만 선택하거나, 전체를 배열로 반환할 수 있습니다.

```
$validated = $request->safe()->only(['name', 'email']);

$validated = $request->safe()->except(['name', 'email']);

$validated = $request->safe()->all();
```

또한, `Illuminate\Support\ValidatedInput` 인스턴스는 배열처럼 순회하거나 배열 인덱스로 접근할 수 있습니다.

```
// 검증된 데이터를 반복문으로 순회...
foreach ($request->safe() as $key => $value) {
    // ...
}

// 배열처럼 접근해서 값 활용...
$validated = $request->safe();

$email = $validated['email'];
```

추가적으로 검증된 데이터에 필드를 덧붙이고 싶다면, `merge` 메서드를 사용할 수 있습니다.

```
$validated = $request->safe()->merge(['name' => 'Taylor Otwell']);
```

검증된 데이터를 [컬렉션](/docs/10.x/collections) 인스턴스로 받아 활용하고 싶다면, `collect` 메서드를 호출하면 됩니다.

```
$collection = $request->safe()->collect();
```

<a name="working-with-error-messages"></a>
## 에러 메시지 다루기

`Validator` 인스턴스에서 `errors` 메서드를 호출하면, 다양한 에러 메시지를 다루기에 편리한 `Illuminate\Support\MessageBag` 인스턴스를 얻을 수 있습니다. 뷰에서 자동으로 사용할 수 있는 `$errors` 변수도 바로 이 `MessageBag` 클래스의 인스턴스입니다.

<a name="retrieving-the-first-error-message-for-a-field"></a>
#### 필드별 첫 번째 에러 메시지 가져오기

특정 필드에 대해 첫 번째 에러 메시지만 가져오고 싶다면 `first` 메서드를 사용하세요.

```
$errors = $validator->errors();

echo $errors->first('email');
```

<a name="retrieving-all-error-messages-for-a-field"></a>
#### 필드별 모든 에러 메시지 가져오기

특정 필드에 대한 모든 에러 메시지를 배열로 받고 싶다면 `get` 메서드를 사용하세요.

```
foreach ($errors->get('email') as $message) {
    // ...
}
```

배열 형태의 폼 필드를 검증하는 경우, `*` 문자를 사용해 각 요소에 대한 모든 메시지를 가져올 수도 있습니다.

```
foreach ($errors->get('attachments.*') as $message) {
    // ...
}
```

<a name="retrieving-all-error-messages-for-all-fields"></a>
#### 모든 필드의 모든 에러 메시지 가져오기

폼의 모든 필드에 대한 모든 메시지를 배열로 받고자 한다면 `all` 메서드를 사용하세요.

```
foreach ($errors->all() as $message) {
    // ...
}
```

<a name="determining-if-messages-exist-for-a-field"></a>
#### 특정 필드에 에러 메시지가 존재하는지 확인하기

`has` 메서드는 특정 필드에 대한 에러 메시지가 존재하는지 확인할 때 사용할 수 있습니다.

```
if ($errors->has('email')) {
    // ...
}
```

<a name="specifying-custom-messages-in-language-files"></a>
### 언어 파일에서 커스텀 메시지 지정하기

라라벨의 기본 유효성 검사 규칙은 각각의 에러 메시지가 애플리케이션의 `lang/en/validation.php` 파일에 위치합니다. 만약 프로젝트에 `lang` 디렉터리가 없다면, `lang:publish` Artisan 명령어로 생성할 수 있습니다.

`lang/en/validation.php` 파일에는 각 유효성 검사 규칙별로 변환 항목이 존재합니다. 애플리케이션의 요구에 따라 이 메시지들을 자유롭게 수정할 수 있습니다.

또한, 이 파일을 다른 언어 디렉터리로 복사해 애플리케이션 언어에 맞도록 메시지를 번역할 수 있습니다. 라라벨의 지역화에 관해 더 자세히 알고 싶다면 [지역화 문서](/docs/10.x/localization)를 참고하세요.

> [!WARNING]
> 기본적으로 라라벨 앱 스캐폴딩(기본 코드 구조)에는 `lang` 디렉터리가 포함되어 있지 않습니다. 라라벨의 언어 파일을 커스터마이즈하려면 `lang:publish` Artisan 명령어를 사용하여 파일을 배포해야 합니다.

<a name="custom-messages-for-specific-attributes"></a>
#### 특정 속성에 대한 커스텀 메시지

특정 속성명과 규칙 조합에 대해 언어 파일에서 사용할 에러 메시지를 커스터마이징하려면, 애플리케이션의 `lang/xx/validation.php` 언어 파일의 `custom` 배열에 해당 내용을 추가합니다.

```
'custom' => [
    'email' => [
        'required' => 'We need to know your email address!',
        'max' => 'Your email address is too long!'
    ],
],
```

<a name="specifying-attribute-in-language-files"></a>
### 언어 파일에서 속성명 지정하기

라라벨의 기본 에러 메시지에는 보통 `:attribute` 플레이스홀더가 사용되며, 이는 유효성 검사를 거치는 필드명으로 대체됩니다. 만약 유효성 검사 메시지의 `:attribute` 부분을 커스텀 값으로 대체하고 싶다면, `lang/xx/validation.php` 언어 파일의 `attributes` 배열에서 커스텀 속성명을 지정할 수 있습니다.

```
'attributes' => [
    'email' => 'email address',
],
```

> [!WARNING]
> 기본적으로 라라벨 앱 스캐폴딩에는 `lang` 디렉터리가 포함되어 있지 않습니다. 라라벨의 언어 파일을 커스터마이즈하려면 `lang:publish` Artisan 명령어를 사용해야 합니다.

<a name="specifying-values-in-language-files"></a>
### 언어 파일에서 값 지정하기

라라벨의 몇몇 기본 유효성 검사 에러 메시지에는 `:value` 플레이스홀더가 사용되며, 이는 해당 속성의 실제 값으로 대체됩니다. 그러나, 경우에 따라 `:value` 부분을 더 사용자 친화적인 값으로 바꿔주고 싶을 때가 있습니다. 예를 들어, `payment_type`이 `cc`일 때 카드 번호가 필수임을 지정하는 아래 규칙을 보겠습니다.

```
Validator::make($request->all(), [
    'credit_card_number' => 'required_if:payment_type,cc'
]);
```

이 유효성 검사가 실패한다면, 다음과 같은 에러 메시지가 표시됩니다.

```none
The credit card number field is required when payment type is cc.
```

여기서 `cc` 대신 좀 더 알아보기 쉬운 값 표시를 원한다면, `lang/xx/validation.php` 언어 파일의 `values` 배열에서 바꿔줄 수 있습니다.

```
'values' => [
    'payment_type' => [
        'cc' => 'credit card'
    ],
],
```

> [!WARNING]
> 기본적으로 라라벨 앱 스캐폴딩에는 `lang` 디렉터리가 포함되어 있지 않습니다. 라라벨의 언어 파일을 커스터마이즈하려면 `lang:publish` Artisan 명령어를 사용해야 합니다.

이렇게 값을 정의하면 유효성 검사 규칙이 다음과 같은 에러 메시지를 보여주게 됩니다.

```none
The credit card number field is required when payment type is credit card.
```

<a name="available-validation-rules"></a>
## 사용 가능한 유효성 검사 규칙

아래는 사용 가능한 모든 유효성 검사 규칙과 해당 기능을 정리한 목록입니다.



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
[Extensions](#rule-extensions)
[File](#rule-file)
[Filled](#rule-filled)
[Greater Than](#rule-gt)
[Greater Than Or Equal](#rule-gte)
[Hex Color](#rule-hex-color)
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
[Present](#rule-present)
[Present If](#rule-present-if)
[Present Unless](#rule-present-unless)
[Present With](#rule-present-with)
[Present With All](#rule-present-with-all)
[Prohibited](#rule-prohibited)
[Prohibited If](#rule-prohibited-if)
[Prohibited Unless](#rule-prohibited-unless)
[Prohibits](#rule-prohibits)
[Regular Expression](#rule-regex)
[Required](#rule-required)
[Required If](#rule-required-if)
[Required If Accepted](#rule-required-if-accepted)
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

해당 필드는 `"yes"`, `"on"`, `1`, `"1"`, `true`, `"true"` 중 하나의 값을 가져야 합니다. 주로 "서비스 약관 동의" 같은 항목을 검증할 때 유용하게 사용할 수 있습니다.

<a name="rule-accepted-if"></a>
#### accepted_if:anotherfield,value,...

해당 필드는, 유효성 검사 중인 다른 필드가 특정 값과 같을 때 `"yes"`, `"on"`, `1`, `"1"`, `true`, `"true"` 중 하나의 값을 필수로 가져야 합니다. 마찬가지로 "서비스 약관 동의"와 같은 입력을 조건부로 검증할 때 활용할 수 있습니다.

<a name="rule-active-url"></a>
#### active_url

해당 필드는 `dns_get_record` PHP 함수에 따라 A 또는 AAAA 레코드가 유효하게 존재하는 값이어야 합니다. URL에서 호스트명은 `parse_url` PHP 함수로 추출된 뒤 `dns_get_record`로 전달됩니다.

<a name="rule-after"></a>
#### after:_date_

해당 필드는 지정한 날짜 이후의 값이어야 합니다. 전달된 날짜 문자열은 내부적으로 `strtotime` PHP 함수로 변환되어 유효한 `DateTime` 인스턴스와 비교됩니다.

```
'start_date' => 'required|date|after:tomorrow'
```

직접 날짜 문자열을 전달하는 대신, 비교 대상으로 다른 필드명을 지정할 수도 있습니다.

```
'finish_date' => 'required|date|after:start_date'
```

<a name="rule-after-or-equal"></a>
#### after\_or\_equal:_date_

해당 필드는 지정한 날짜 이후 또는 같은 날짜여야 합니다. 자세한 내용은 [after](#rule-after) 규칙을 참고하세요.

<a name="rule-alpha"></a>
#### alpha

해당 필드는 [`\p{L}`](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AL%3A%5D&g=&i=), [`\p{M}`](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AM%3A%5D&g=&i=)에 포함된 유니코드 알파벳 문자만을 포함해야 합니다.

이 규칙을 ASCII 범위의 문자(`a-z`, `A-Z`)로 제한하려면, 검증 규칙에 `ascii` 옵션을 추가할 수 있습니다.

```php
'username' => 'alpha:ascii',
```

<a name="rule-alpha-dash"></a>
#### alpha_dash

해당 필드는 [`\p{L}`](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AL%3A%5D&g=&i=), [`\p{M}`](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AM%3A%5D&g=&i=), [`\p{N}`](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AN%3A%5D&g=&i=)에 포함된 유니코드 영문자, 숫자 그리고 ASCII 대시(`-`), 언더스코어(`_`)만을 포함해야 합니다.

이 규칙을 ASCII 범위로 제한하고 싶다면, 마찬가지로 `ascii` 옵션을 사용할 수 있습니다.

```php
'username' => 'alpha_dash:ascii',
```

<a name="rule-alpha-num"></a>
#### alpha_num

해당 필드는 [`\p{L}`](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AL%3A%5D&g=&i=), [`\p{M}`](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AM%3A%5D&g=&i=), [`\p{N}`](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AN%3A%5D&g=&i=)에 포함된 유니코드 영문자 또는 숫자만을 포함해야 합니다.

ASCII 범위만 허용할 경우 `ascii` 옵션을 지정하세요.

```php
'username' => 'alpha_num:ascii',
```

<a name="rule-array"></a>
#### array

해당 필드는 PHP의 `array` 타입이어야 합니다.

`array` 규칙에 값을 추가로 지정하면, 입력 배열에 포함된 각 키가 반드시 규칙에서 지정한 목록에 포함되어야 합니다. 다음 예시에서 입력 배열의 `admin` 키는 규칙의 허용 목록에 없으므로 유효하지 않습니다.

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

일반적으로 배열의 허용 가능한 키 목록을 명확히 지정하는 것이 좋습니다.

<a name="rule-ascii"></a>

#### ascii

검증 대상 필드는 반드시 7비트 ASCII 문자만으로 이루어져야 합니다.

<a name="rule-bail"></a>
#### bail

해당 필드에서 첫 번째 유효성 검사 실패가 발생하면 이후의 유효성 검사 규칙 적용을 중단합니다.

`bail` 규칙은 특정 필드에 대해서만 유효성 검사를 중단합니다. 반면, `stopOnFirstFailure` 메서드는 하나의 유효성 검사 실패가 발생하면 모든 속성의 검증을 즉시 멈추도록 validator에 지시합니다.

```
if ($validator->stopOnFirstFailure()->fails()) {
    // ...
}
```

<a name="rule-before"></a>
#### before:_date_

검증 대상 필드는 지정된 날짜보다 이전이어야 합니다. 입력된 날짜 값은 PHP의 `strtotime` 함수로 변환되어 유효한 `DateTime` 인스턴스로 처리됩니다. 또한, [`after`](#rule-after) 규칙과 마찬가지로, `date` 값 대신 검증 중인 다른 필드명을 지정할 수도 있습니다.

<a name="rule-before-or-equal"></a>
#### before\_or\_equal:_date_

검증 대상 필드는 지정된 날짜 이전이거나 그 날짜와 동일해야 합니다. 날짜 값은 PHP의 `strtotime` 함수로 처리되어 유효한 `DateTime` 인스턴스로 변환됩니다. 또한, [`after`](#rule-after) 규칙과 동일하게, 값으로 검증 중인 다른 필드명을 지정할 수도 있습니다.

<a name="rule-between"></a>
#### between:_min_,_max_

검증 대상 필드의 크기가 지정된 _min_과 _max_ 사이(포함)여야 합니다. 문자열, 숫자, 배열, 파일 모두 [`size`](#rule-size) 규칙과 동일한 방식으로 판단됩니다.

<a name="rule-boolean"></a>
#### boolean

검증 대상 필드는 불리언(boolean) 타입으로 변환될 수 있어야 합니다. 허용되는 값은 `true`, `false`, `1`, `0`, `"1"`, `"0"` 입니다.

<a name="rule-confirmed"></a>
#### confirmed

검증 대상 필드는 `{field}_confirmation`과 동일한 값이어야 합니다. 예를 들어, 검증 대상 필드가 `password`라면 입력 데이터에 `password_confirmation` 필드가 존재해야 하며 값이 일치해야 합니다.

<a name="rule-current-password"></a>
#### current_password

검증 대상 필드는 인증된(로그인 중인) 사용자의 비밀번호와 일치해야 합니다. 규칙의 첫 번째 파라미터로 [인증 가드](/docs/10.x/authentication)를 지정할 수 있습니다.

```
'password' => 'current_password:api'
```

<a name="rule-date"></a>
#### date

검증 대상 필드는 PHP의 `strtotime` 함수 기준으로 유효한(상대적인 값이 아닌) 날짜여야 합니다.

<a name="rule-date-equals"></a>
#### date_equals:_date_

검증 대상 필드는 지정된 날짜와 동일해야 합니다. 날짜 값은 PHP의 `strtotime` 함수로 변환되어 유효한 `DateTime` 인스턴스로 처리됩니다.

<a name="rule-date-format"></a>
#### date_format:_format_,...

검증 대상 필드는 지정된 _formats_ 중 하나와 일치해야 합니다. 필드 유효성 검사 시에는 `date` 또는 `date_format` 중 하나만 사용해야 하며, 두 가지를 함께 적용해서는 안 됩니다. 이 유효성 검사 규칙은 PHP [DateTime](https://www.php.net/manual/en/class.datetime.php) 클래스가 지원하는 모든 형식을 지원합니다.

<a name="rule-decimal"></a>
#### decimal:_min_,_max_

검증 대상 필드는 숫자여야 하며, 소수점 자리수가 지정된 범위와 일치해야 합니다.

```
// 소수점 아래 자릿수가 정확히 2자리여야 함(예: 9.99)...
'price' => 'decimal:2'

// 소수점 아래 자릿수가 2~4자리 사이여야 함...
'price' => 'decimal:2,4'
```

<a name="rule-declined"></a>
#### declined

검증 대상 필드는 `"no"`, `"off"`, `0`, `"0"`, `false`, `"false"` 중 하나의 값이어야 합니다.

<a name="rule-declined-if"></a>
#### declined_if:anotherfield,value,...

특정 다른 검증 대상 필드가 지정된 값과 같을 때, 검증 대상 필드는 반드시 `"no"`, `"off"`, `0`, `"0"`, `false`, `"false"` 중 하나의 값이어야 합니다.

<a name="rule-different"></a>
#### different:_field_

검증 대상 필드는 _field_와는 다른 값을 가져야 합니다.

<a name="rule-digits"></a>
#### digits:_value_

검증 대상 정수(integer)는 정확히 _value_ 자리여야 합니다.

<a name="rule-digits-between"></a>
#### digits_between:_min_,_max_

검증 대상 정수의 자릿수는 _min_과 _max_ 사이여야 합니다.

<a name="rule-dimensions"></a>
#### dimensions

검증 대상 파일이 아래 인자 조건을 만족하는 이미지(사진 등)여야 합니다.

```
'avatar' => 'dimensions:min_width=100,min_height=200'
```

사용 가능한 조건에는: _min\_width_, _max\_width_, _min\_height_, _max\_height_, _width_, _height_, _ratio_ 가 있습니다.

_ratio_ 값은 width(가로)을 height(세로)로 나눈 비율로 표현하며, `3/2` 같은 분수나 `1.5`와 같은 실수 형태 모두 허용됩니다.

```
'avatar' => 'dimensions:ratio=3/2'
```

이 규칙은 여러 인자를 필요로 하므로, `Rule::dimensions` 메서드를 사용해 유창하게(rule chaining) 규칙을 정의할 수 있습니다.

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

배열을 검증할 때, 해당 필드에는 중복된 값이 없어야 합니다.

```
'foo.*.id' => 'distinct'
```

`distinct`는 기본적으로 느슨한(==) 비교를 사용합니다. 엄격한(===) 비교를 원한다면 `strict` 파라미터를 추가합니다.

```
'foo.*.id' => 'distinct:strict'
```

대소문자 구분을 무시하려면 `ignore_case` 파라미터를 추가할 수 있습니다.

```
'foo.*.id' => 'distinct:ignore_case'
```

<a name="rule-doesnt-start-with"></a>
#### doesnt_start_with:_foo_,_bar_,...

검증 대상 필드는 지정된 값들 중 하나로 시작해서는 안 됩니다.

<a name="rule-doesnt-end-with"></a>
#### doesnt_end_with:_foo_,_bar_,...

검증 대상 필드는 지정된 값들 중 하나로 끝나서는 안 됩니다.

<a name="rule-email"></a>
#### email

검증 대상 필드는 이메일 주소 형태여야 합니다. 이 규칙은 이메일 주소를 검증하기 위해 [`egulias/email-validator`](https://github.com/egulias/EmailValidator) 패키지를 사용합니다. 기본적으로 `RFCValidation` 방식이 적용되나, 다른 스타일도 선택해 적용할 수 있습니다.

```
'email' => 'email:rfc,dns'
```

위 예시는 `RFCValidation`과 `DNSCheckValidation`을 적용합니다. 적용 가능한 모든 검증 스타일은 다음과 같습니다.

<div class="content-list" markdown="1">

- `rfc`: `RFCValidation`
- `strict`: `NoRFCWarningsValidation`
- `dns`: `DNSCheckValidation`
- `spoof`: `SpoofCheckValidation`
- `filter`: `FilterEmailValidation`
- `filter_unicode`: `FilterEmailValidation::unicode()`

</div>

`filter` 검증기는 PHP의 `filter_var` 함수를 활용하며, 이는 라라벨 5.8 이전의 기본 이메일 검증 방식이기도 했습니다.

> [!NOTE]
> `dns`와 `spoof` 검증기는 PHP의 `intl` 확장(extension)이 필요합니다.

<a name="rule-ends-with"></a>
#### ends_with:_foo_,_bar_,...

검증 대상 필드는 지정된 값들 중 하나로 끝나야 합니다.

<a name="rule-enum"></a>
#### enum

`Enum` 규칙은 클래스 기반 규칙으로, 검증 대상 필드가 올바른 enum(열거형) 값인지 확인합니다. 생성자 인자로 enum 클래스명을 받습니다. Primitive 값을 검증할 때에는 backed Enum을 넘겨주어야 합니다.

```
use App\Enums\ServerStatus;
use Illuminate\Validation\Rule;

$request->validate([
    'status' => [Rule::enum(ServerStatus::class)],
]);
```

`Enum` 규칙의 `only` 및 `except` 메서드를 사용하면 특정 enum case만 유효하도록 한정할 수 있습니다.

```
Rule::enum(ServerStatus::class)
    ->only([ServerStatus::Pending, ServerStatus::Active]);

Rule::enum(ServerStatus::class)
    ->except([ServerStatus::Pending, ServerStatus::Active]);
```

`when` 메서드는 조건적으로 Enum 규칙을 수정할 수 있도록 도와줍니다.

```php
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

Rule::enum(ServerStatus::class)
    ->when(
        Auth::user()->isAdmin(),
        fn ($rule) => $rule->only(...),
        fn ($rule) => $rule->only(...),
    );
```

<a name="rule-exclude"></a>
#### exclude

검증 대상 필드는 `validate` 및 `validated` 메서드가 반환하는 요청 데이터에서 제외됩니다.

<a name="rule-exclude-if"></a>
#### exclude_if:_anotherfield_,_value_

_`anotherfield`_ 필드가 _value_와 동일하면, 검증 대상 필드는 `validate` 및 `validated`가 반환하는 요청 데이터에서 제외됩니다.

복잡한 조건으로 필드를 제외해야 할 경우, `Rule::excludeIf` 메서드를 사용할 수 있습니다. 이 메서드는 불리언 혹은 클로저를 인자로 받으며, 클로저의 반환값이 `true`이면 해당 필드는 제외되고, `false`면 유지됩니다.

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

_`anotherfield`_ 필드가 _value_와 같지 않으면, 검증 대상 필드는 `validate` 및 `validated`가 반환하는 요청 데이터에서 제외됩니다. _value_가 `null`(예: `exclude_unless:name,null`)인 경우, 비교 필드가 `null`이거나 요청 데이터에서 해당 필드가 없으면 제외됩니다.

<a name="rule-exclude-with"></a>
#### exclude_with:_anotherfield_

_`anotherfield`_ 필드가 존재할 경우, 검증 대상 필드는 요청 데이터에서 제외됩니다.

<a name="rule-exclude-without"></a>
#### exclude_without:_anotherfield_

_`anotherfield`_ 필드가 존재하지 않을 경우, 검증 대상 필드는 요청 데이터에서 제외됩니다.

<a name="rule-exists"></a>
#### exists:_table_,_column_

검증 대상 필드의 값이 지정한 데이터베이스 테이블에 존재해야 합니다.

<a name="basic-usage-of-exists-rule"></a>
#### Exists 규칙 기본 사용법

```
'state' => 'exists:states'
```

`column` 옵션을 명시하지 않으면, 필드명이 그대로 사용됩니다. 위 예시에서는 `states` 테이블에서 `state` 컬럼 값이 요청의 `state` 속성과 일치하는 레코드가 존재하는지 확인합니다.

<a name="specifying-a-custom-column-name"></a>
#### 커스텀 컬럼명 지정

검증 규칙에서 사용할 데이터베이스 컬럼명을 테이블명 뒤에 명시적으로 작성할 수 있습니다.

```
'state' => 'exists:states,abbreviation'
```

특정 데이터베이스 연결을 사용하여 `exists` 쿼리를 실행하고 싶을 때는, 테이블명 앞에 연결명을 추가할 수 있습니다.

```
'email' => 'exists:connection.staff,email'
```

테이블명을 직접 작성하는 대신, Eloquent 모델명을 지정해서 테이블명을 결정하게 할 수도 있습니다.

```
'user_id' => 'exists:App\Models\User,id'
```

`Rule` 클래스를 사용하면, 쿼리를 직접 커스터마이즈할 수도 있으며, 규칙 배열을 사용해 유효성 검증 규칙을 구분자 `|` 대신 배열로 지정할 수 있습니다.

```
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($data, [
    'email' => [
        'required',
        Rule::exists('staff')->where(function (Builder $query) {
            return $query->where('account_id', 1);
        }),
    ],
]);
```

`Rule::exists` 메서드의 두 번째 인자로 컬럼명을 직접 지정하면, 해당 컬럼이 검증에 사용됩니다.

```
'state' => Rule::exists('states', 'abbreviation'),
```

<a name="rule-extensions"></a>
#### extensions:_foo_,_bar_,...

검증 대상 파일은 반드시 지정된 확장자 중 하나를 사용해야 합니다.

```
'photo' => ['required', 'extensions:jpg,png'],
```

> [!NOTE]
> 사용자 정의 확장자만으로 파일을 검증하는 것은 권장되지 않습니다. 이 규칙은 보통 [`mimes`](#rule-mimes)나 [`mimetypes`](#rule-mimetypes) 규칙과 결합해서 사용하는 것이 바람직합니다.

<a name="rule-file"></a>
#### file

검증 대상 필드는 정상적으로 업로드된 파일이어야 합니다.

<a name="rule-filled"></a>
#### filled

검증 대상 필드는 값이 비어 있지 않아야 합니다(존재할 경우).

<a name="rule-gt"></a>
#### gt:_field_

검증 대상 필드는 지정된 _field_ 혹은 _value_보다 커야 합니다. 두 필드는 반드시 동일한 타입이어야 합니다. 문자열, 숫자, 배열, 파일 모두 [`size`](#rule-size) 규칙과 동일한 방식으로 처리됩니다.

<a name="rule-gte"></a>
#### gte:_field_

검증 대상 필드는 지정된 _field_ 혹은 _value_보다 크거나 같아야 합니다. 두 필드는 반드시 동일한 타입이어야 하며, 문자열, 숫자, 배열, 파일 모두 [`size`](#rule-size) 규칙과 동일하게 판단합니다.

<a name="rule-hex-color"></a>
#### hex_color

검증 대상 필드는 [16진수(hexadecimal)](https://developer.mozilla.org/en-US/docs/Web/CSS/hex-color) 형식의 올바른 색상 값이어야 합니다.

<a name="rule-image"></a>
#### image

검증 대상 파일은 이미지이어야 하며, 형식은 jpg, jpeg, png, bmp, gif, svg, webp 중 하나여야 합니다.

<a name="rule-in"></a>
#### in:_foo_,_bar_,...

검증 대상 필드는 지정된 값 목록 중 하나에 포함되어야 합니다. 이 규칙은 배열 값을 `implode`해야 하는 경우가 많기 때문에, `Rule::in` 메서드를 활용해 좀 더 읽기 쉽게 규칙을 작성할 수 있습니다.

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

`in` 규칙이 `array` 규칙과 함께 사용되면, 입력 배열의 각각의 값이 반드시 in 규칙에 지정된 값 목록 중 하나에 포함되어야 합니다. 아래 예시에서 입력값 배열 중 `LAS`는 제공된 리스트에 없으므로 유효하지 않습니다.

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

검증 대상 필드의 값이 _anotherfield_ 배열의 값 중 하나여야 합니다.

<a name="rule-integer"></a>
#### integer

검증 대상 필드는 정수여야 합니다.

> [!NOTE]
> 이 유효성 검사 규칙은 인풋이 진짜 '정수' 타입인지까지 확인하지는 않으며, PHP의 `FILTER_VALIDATE_INT` 규칙에서 허용하는 타입이면 모두 허용됩니다. 값을 진짜 숫자로 검증하려면 [numeric 유효성 검사 규칙](#rule-numeric)과 함께 사용해야 합니다.

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

검증 대상 필드는 지정된 _field_보다 작아야 합니다. 두 필드는 반드시 동일한 타입이어야 하며, 문자열, 숫자, 배열, 파일 모두 [`size`](#rule-size)와 동일한 기준을 적용받습니다.

<a name="rule-lte"></a>
#### lte:_field_

검증 대상 필드는 지정된 _field_보다 작거나 같아야 합니다. 두 필드는 반드시 동일 타입이어야 하며, 문자열, 숫자, 배열, 파일 모두 [`size`](#rule-size) 규칙과 같은 방식으로 평가됩니다.

<a name="rule-lowercase"></a>
#### lowercase

검증 대상 필드는 모두 소문자여야 합니다.

<a name="rule-mac"></a>
#### mac_address

검증 대상 필드는 MAC 주소여야 합니다.

<a name="rule-max"></a>
#### max:_value_

검증 대상 필드는 지정된 최대값(_value_) 이하이어야 합니다. 문자열, 숫자, 배열, 파일 모두 [`size`](#rule-size) 규칙과 동일한 방식으로 판단합니다.

<a name="rule-max-digits"></a>
#### max_digits:_value_

검증 대상 정수(integer)의 자릿수 최대값이 _value_이어야 합니다.

<a name="rule-mimetypes"></a>
#### mimetypes:_text/plain_,...

검증 대상 파일은 지정된 MIME 타입 중 하나여야 합니다.

```
'video' => 'mimetypes:video/avi,video/mpeg,video/quicktime'
```

업로드된 파일의 MIME 타입은 파일의 실제 내용을 읽어 추론하며, 클라이언트가 제공한 MIME 타입과는 다를 수 있습니다.

<a name="rule-mimes"></a>
#### mimes:_foo_,_bar_,...

검증 대상 파일은 지정된 확장자에 해당하는 MIME 타입을 가져야 합니다.

```
'photo' => 'mimes:jpg,bmp,png'
```

실제 지정하는 것은 확장자(예: jpg)이지만, 이 규칙은 파일의 내용을 읽어 MIME 타입을 판별해 검사합니다. 지원되는 전체 MIME 타입과 그에 해당하는 확장자 목록은 다음에서 확인할 수 있습니다.

[https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types](https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types)

<a name="mime-types-and-extensions"></a>
#### MIME 타입과 확장자

이 유효성 검사 규칙은 파일의 MIME 타입과 사용자가 지정한 확장자가 일치하는지까지 검사하지는 않습니다. 예를 들어, `mimes:png` 규칙은 내용이 올바른 PNG 형식이라면 파일명이 `photo.txt`이어도 PNG 이미지로 인정합니다. 파일의 확장자를 검증하고 싶다면 [`extensions`](#rule-extensions) 규칙을 이용할 수 있습니다.

<a name="rule-min"></a>
#### min:_value_

검증 대상 필드는 지정된 최소값(_value_) 이상이어야 합니다. 문자열, 숫자, 배열, 파일 모두 [`size`](#rule-size) 규칙과 동일하게 적용됩니다.

<a name="rule-min-digits"></a>
#### min_digits:_value_

검증 대상 정수(integer)의 자릿수 최소값이 _value_이어야 합니다.

<a name="rule-multiple-of"></a>
#### multiple_of:_value_

검증 대상 필드는 _value_의 배수여야 합니다.

<a name="rule-missing"></a>
#### missing

검증 대상 필드는 입력 데이터에 존재하지 않아야 합니다.

 <a name="rule-missing-if"></a>
 #### missing_if:_anotherfield_,_value_,...

 _anotherfield_ 필드가 _value_ 중 하나와 같으면, 검증 대상 필드는 존재해서는 안 됩니다.

 <a name="rule-missing-unless"></a>
 #### missing_unless:_anotherfield_,_value_

_`anotherfield`_ 필드가 _value_ 중 하나와 같지 않으면, 검증 대상 필드는 존재해서는 안 됩니다.

 <a name="rule-missing-with"></a>
 #### missing_with:_foo_,_bar_,...

 지정된 다른 필드 중 하나라도 존재할 때만, 검증 대상 필드는 존재해서는 안 됩니다.

 <a name="rule-missing-with-all"></a>
 #### missing_with_all:_foo_,_bar_,...

 지정된 다른 필드들이 모두 존재할 때만, 검증 대상 필드는 존재해서는 안 됩니다.

<a name="rule-not-in"></a>
#### not_in:_foo_,_bar_,...

검증 대상 필드는 지정된 값 목록에 포함되어서는 안 됩니다. `Rule::notIn` 메서드를 사용하면 더 유연하게 규칙을 정의할 수 있습니다.

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

검증 대상 필드는 지정된 정규 표현식과 **일치하지 않아야** 합니다.

내부적으로 이 규칙은 PHP의 `preg_match` 함수를 사용합니다. 지정하는 정규식 패턴은 반드시 `preg_match`가 요구하는 형식(유효한 구분자 포함)을 따라야 합니다. 예를 들어, `'email' => 'not_regex:/^.+$/i'`와 같이 작성해야 합니다.

> [!WARNING]
> `regex` 또는 `not_regex` 패턴을 사용할 때, 특히 정규식에 `|` 문자가 포함된 경우에는 파이프(`|`) 구분자 대신 배열 형태로 유효성 검사 규칙을 지정해야 할 수 있습니다.

<a name="rule-nullable"></a>
#### nullable

검증 대상 필드의 값은 `null`일 수 있습니다.

<a name="rule-numeric"></a>
#### numeric

검증 대상 필드 값은 [숫자(numeric)](https://www.php.net/manual/en/function.is-numeric.php)여야 합니다.

<a name="rule-present"></a>
#### present

검증 대상 필드는 입력 데이터에 **존재**해야 합니다.

<a name="rule-present-if"></a>
#### present_if:_anotherfield_,_value_,...

_다른 필드_가 지정한 _값_ 중 하나와 같을 때 검증 대상 필드는 반드시 포함되어야 합니다.

<a name="rule-present-unless"></a>
#### present_unless:_anotherfield_,_value_

_다른 필드_가 지정한 _값_ 중 하나와 같지 않을 때, 검증 대상 필드는 반드시 포함되어야 합니다.

<a name="rule-present-with"></a>
#### present_with:_foo_,_bar_,...

다른 지정된 필드 중 **하나 이상**이 존재할 경우에만, 검증 대상 필드가 반드시 존재해야 합니다.

<a name="rule-present-with-all"></a>
#### present_with_all:_foo_,_bar_,...

다른 지정된 필드 **모두가 존재할 때에만**, 검증 대상 필드가 반드시 존재해야 합니다.

<a name="rule-prohibited"></a>
#### prohibited

검증 대상 필드는 **존재하지 않거나 비어 있어야** 합니다. "비어 있음"의 기준은 다음 중 하나를 만족할 때입니다:

<div class="content-list" markdown="1">

- 값이 `null`일 때
- 값이 빈 문자열일 때
- 값이 빈 배열 또는 비어 있는 `Countable` 객체일 때
- 업로드된 파일이지만 경로(path)가 비어 있을 때

</div>

<a name="rule-prohibited-if"></a>
#### prohibited_if:_anotherfield_,_value_,...

_다른 필드_가 지정한 _값_ 중 하나와 같을 때, 검증 대상 필드는 **존재하지 않거나 비어 있어야** 합니다. "비어 있음"의 기준은 다음 중 하나입니다:

<div class="content-list" markdown="1">

- 값이 `null`일 때
- 값이 빈 문자열일 때
- 값이 빈 배열 또는 비어 있는 `Countable` 객체일 때
- 업로드된 파일이지만 경로(path)가 비어 있을 때

</div>

좀 더 복잡한 조건부 금지(prohibition) 로직이 필요하다면, `Rule::prohibitedIf` 메서드를 사용할 수 있습니다. 이 메서드는 불리언 값이나 클로저를 인자로 받으며, 클로저의 반환값이 `true`면 해당 필드를 금지하도록 동작합니다:

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

_다른 필드_가 지정한 _값_ 중 하나와 **같지 않을 때만**, 검증 대상 필드는 **존재하지 않거나 비어 있어야** 합니다. "비어 있음"의 기준은 다음 중 하나입니다:

<div class="content-list" markdown="1">

- 값이 `null`일 때
- 값이 빈 문자열일 때
- 값이 빈 배열 또는 비어 있는 `Countable` 객체일 때
- 업로드된 파일이지만 경로(path)가 비어 있을 때

</div>

<a name="rule-prohibits"></a>
#### prohibits:_anotherfield_,...

검증 대상 필드가 **존재하거나 비어 있지 않으면**, _anotherfield_에 지정된 모든 필드는 **존재하지 않거나 비어 있어야** 합니다. "비어 있음"의 기준은 아래와 같습니다:

<div class="content-list" markdown="1">

- 값이 `null`일 때
- 값이 빈 문자열일 때
- 값이 빈 배열 또는 비어 있는 `Countable` 객체일 때
- 업로드된 파일이지만 경로(path)가 비어 있을 때

</div>

<a name="rule-regex"></a>
#### regex:_pattern_

검증 대상 필드는 지정된 정규 표현식과 **일치해야** 합니다.

이 규칙은 내부적으로 PHP의 `preg_match` 함수를 사용하며, 패턴은 반드시 `preg_match`에서 요구하는 올바른 구분자가 포함된 형식이어야 합니다. 예를 들어: `'email' => 'regex:/^.+@.+$/i'`와 같이 지정해야 합니다.

> [!WARNING]
> `regex` 또는 `not_regex` 패턴을 사용할 때, 정규식에 `|` 문자가 포함되면 파이프(`|`) 대신 배열로 규칙을 지정해야 할 수 있습니다.

<a name="rule-required"></a>
#### required

검증 대상 필드는 입력 데이터에 반드시 존재해야 하며, 비어 있지 않아야 합니다. 필드가 "비어 있음"의 기준은 다음과 같습니다:

<div class="content-list" markdown="1">

- 값이 `null`일 때
- 값이 빈 문자열일 때
- 값이 빈 배열 또는 비어 있는 `Countable` 객체일 때
- 업로드된 파일이 경로(path)를 가지지 않을 때

</div>

<a name="rule-required-if"></a>
#### required_if:_anotherfield_,_value_,...

_다른 필드_가 지정된 _값_ 중 하나와 같을 때, 검증 대상 필드는 **반드시 존재해야 하며 비어 있으면 안 됩니다**.

`required_if` 규칙에 더 복잡한 조건을 적용하려면, `Rule::requiredIf` 메서드를 사용할 수 있습니다. 이 메서드는 불리언 값이나 클로저를 인자로 받습니다. 클로저의 반환값이 `true`일 때 해당 필드가 필수로 간주됩니다:

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

<a name="rule-required-if-accepted"></a>
#### required_if_accepted:_anotherfield_,...

_다른 필드_가 `"yes"`, `"on"`, `1`, `"1"`, `true`, `"true"` 중 하나의 값과 같을 때, 검증 대상 필드는 반드시 존재해야 하며 비어 있을 수 없습니다.

<a name="rule-required-unless"></a>
#### required_unless:_anotherfield_,_value_,...

_다른 필드_가 지정된 _값_ 중 하나와 **같지 않을 때만** 검증 대상 필드는 반드시 존재해야 하며 비어 있으면 안 됩니다. 또한 _anotherfield_는 _value_가 `null`이 아닌 한 요청 데이터에 반드시 존재해야 합니다. 만약 _value_가 `null`(`required_unless:name,null`)이라면, 비교 대상 필드 값이 `null`이거나 요청 데이터에 해당 필드가 없을 경우에만 검증 대상 필드가 필수로 간주되지 않습니다.

<a name="rule-required-with"></a>
#### required_with:_foo_,_bar_,...

지정된 다른 필드 중 하나라도 값이 **있고 비어 있지 않으면**, 검증 대상 필드는 반드시 존재해야 하며 비어 있으면 안 됩니다.

<a name="rule-required-with-all"></a>
#### required_with_all:_foo_,_bar_,...

지정된 모든 다른 필드가 **존재하고 비어 있지 않을 때에만** 검증 대상 필드는 필수입니다.

<a name="rule-required-without"></a>
#### required_without:_foo_,_bar_,...

지정된 다른 필드 중 하나라도 **비어 있거나 존재하지 않을 때에만** 검증 대상 필드는 필수입니다.

<a name="rule-required-without-all"></a>
#### required_without_all:_foo_,_bar_,...

지정된 모든 다른 필드가 **비어 있거나 존재하지 않을 때에만** 검증 대상 필드는 필수입니다.

<a name="rule-required-array-keys"></a>
#### required_array_keys:_foo_,_bar_,...

검증 대상 필드는 반드시 배열이어야 하며, 지정한 key(들)을 **모두 포함**해야 합니다.

<a name="rule-same"></a>
#### same:_field_

지정한 _field_의 값이 검증 대상 필드와 **같아야** 합니다.

<a name="rule-size"></a>
#### size:_value_

검증 대상 필드는 지정한 _value_와 **크기가 같아야** 합니다. 문자열 필드의 경우 _value_는 문자 수를 의미합니다. 숫자 필드의 경우 _value_는 특정 정수 값이어야 합니다(이 경우 `numeric` 또는 `integer` 규칙도 함께 적용되어야 합니다). 배열의 경우 _size_는 배열 요소의 개수를 의미합니다. 파일의 경우 _size_는 파일 크기(킬로바이트 단위)입니다. 예시를 살펴보겠습니다:

```
// 문자열이 정확히 12자여야 함
'title' => 'size:12';

// 숫자가 정확히 10이어야 함
'seats' => 'integer|size:10';

// 배열에 정확히 5개의 요소가 포함되어야 함
'tags' => 'array|size:5';

// 업로드 파일이 정확히 512KB여야 함
'image' => 'file|size:512';
```

<a name="rule-starts-with"></a>
#### starts_with:_foo_,_bar_,...

검증 대상 필드는 지정한 값 중 **하나로 시작**해야 합니다.

<a name="rule-string"></a>
#### string

검증 대상 필드는 **문자열(string)** 이어야 합니다. 만약 필드 값이 `null`도 허용하려면, 해당 필드에 `nullable` 규칙을 추가하세요.

<a name="rule-timezone"></a>
#### timezone

검증 대상 필드는 `DateTimeZone::listIdentifiers` 메서드 기준의 **유효한 타임존 식별자**여야 합니다.

또한, [`DateTimeZone::listIdentifiers` 메서드에서 허용하는 인자](https://www.php.net/manual/en/datetimezone.listidentifiers.php)를 이 유효성 검사 규칙에 추가로 전달할 수 있습니다.

```
'timezone' => 'required|timezone:all';

'timezone' => 'required|timezone:Africa';

'timezone' => 'required|timezone:per_country,US';
```

<a name="rule-unique"></a>
#### unique:_table_,_column_

검증 대상 필드 값은 지정된 데이터베이스 테이블에 **이미 존재하면 안 됩니다**.

**커스텀 테이블/컬럼명 지정하기**

테이블명을 직접 입력하는 대신, Eloquent 모델명을 지정해 해당 테이블명을 결정하도록 할 수 있습니다:

```
'email' => 'unique:App\Models\User,email_address'
```

`column` 옵션을 사용해 검증하려는 컬럼명을 직접 지정할 수도 있습니다. `column` 옵션을 생략하면 검증 대상 필드명이 컬럼명으로 사용됩니다.

```
'email' => 'unique:users,email_address'
```

**커스텀 데이터베이스 연결 지정하기**

가끔 Validator에서 쿼리를 실행할 때 원하는 데이터베이스 연결을 사용해야 할 때가 있습니다. 이럴 경우, 테이블명 앞에 연결명을 붙여서 지정할 수 있습니다.

```
'email' => 'unique:connection.users,email_address'
```

**특정 ID를 무시하고 unique 검증하기**

가끔 unique 유효성 검증을 하면서 특정 ID값은 **무시**하고 싶을 수도 있습니다. 예를 들어, '프로필 수정' 기능에서 현재 사용자의 이메일을 unique로 검증하되, 자기 자신은 해당 이메일을 가지고 있어도 에러가 발생하지 않게 하고 싶을 때 활용합니다.

이를 위해서는, `Rule` 클래스를 사용하여 규칙을 메서드 체이닝 방식으로 정의합니다. 예시에서는 파이프 구분자가 아니라 배열로 규칙을 지정합니다:

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
> **사용자가 직접 입력하는 값은 절대로 `ignore` 메서드에 전달해서는 안 됩니다.** 반드시 자동 증가 ID나 UUID 등 시스템에서 관리하는 고유값을 전달해야 하며, 그렇지 않으면 SQL 인젝션 공격에 취약해질 수 있습니다.

ignore 메서드에 모델의 키 값 대신 **모델 인스턴스 전체**를 전달할 수도 있으며, 이 경우 라라벨이 자동으로 키 값을 추출합니다.

```
Rule::unique('users')->ignore($user)
```

테이블에서 기본 키(primary key) 컬럼명이 `id`가 아니라면, 두 번째 인자로 컬럼명을 지정할 수 있습니다:

```
Rule::unique('users')->ignore($user->id, 'user_id')
```

기본적으로 unique 규칙은 검증하는 필드명과 동일한 컬럼의 유일성을 검사합니다. 하지만 두 번째 인자로 컬럼명을 지정해 다르게 설정할 수도 있습니다:

```
Rule::unique('users', 'email_address')->ignore($user->id)
```

**추가 where 조건 지정하기**

쿼리 조건을 추가로 지정하려면 `where` 메서드로 쿼리를 수정할 수도 있습니다. 예를 들어, `account_id`가 1인 레코드만 검사하도록 범위를 좁힐 수 있습니다:

```
'email' => Rule::unique('users')->where(fn (Builder $query) => $query->where('account_id', 1))
```

<a name="rule-uppercase"></a>
#### uppercase

검증 대상 필드는 **영문 대문자**여야 합니다.

<a name="rule-url"></a>
#### url

검증 대상 필드는 **유효한 URL**이어야 합니다.

특정 URL 프로토콜만 허용하려면 유효성 검사 규칙의 파라미터로 프로토콜을 지정할 수 있습니다:

```php
'url' => 'url:http,https',

'game' => 'url:minecraft,steam',
```

<a name="rule-ulid"></a>
#### ulid

검증 대상 필드는 [Universally Unique Lexicographically Sortable Identifier (ULID)](https://github.com/ulid/spec) 형식의 **유효한 ULID**여야 합니다.

<a name="rule-uuid"></a>
#### uuid

검증 대상 필드는 RFC 4122(버전 1, 3, 4, 5) 기준의 **유효한 UUID**여야 합니다.

<a name="conditionally-adding-rules"></a>
## 조건부 규칙 추가하기

<a name="skipping-validation-when-fields-have-certain-values"></a>
#### 특정 값일 때 검사 건너뛰기

경우에 따라, 특정 필드가 어떤 값을 가질 때 다른 필드의 유효성 검사를 **하지** 않기를 원할 수 있습니다. 이럴 때는 `exclude_if` 유효성 검사 규칙을 사용할 수 있습니다. 아래 예시처럼 `has_appointment`가 `false`일 때는 `appointment_date`와 `doctor_name` 필드 검증이 생략됩니다:

```
use Illuminate\Support\Facades\Validator;

$validator = Validator::make($data, [
    'has_appointment' => 'required|boolean',
    'appointment_date' => 'exclude_if:has_appointment,false|required|date',
    'doctor_name' => 'exclude_if:has_appointment,false|required|string',
]);
```

반대로, 특정 필드가 지정한 값일 때만 검증하고 싶으면 `exclude_unless` 규칙을 사용할 수 있습니다:

```
$validator = Validator::make($data, [
    'has_appointment' => 'required|boolean',
    'appointment_date' => 'exclude_unless:has_appointment,true|required|date',
    'doctor_name' => 'exclude_unless:has_appointment,true|required|string',
]);
```

<a name="validating-when-present"></a>
#### 필드가 있을 때만 검사하기

특정 상황에서는, 어떤 필드가 입력 데이터에 **존재할 때만** 해당 필드의 유효성 검사를 수행하고 싶을 수 있습니다. 이럴 때는 규칙 목록에 `sometimes` 규칙을 추가하면 됩니다:

```
$v = Validator::make($data, [
    'email' => 'sometimes|required|email',
]);
```

위 예시에서 `$data` 배열에 `email` 필드가 존재할 때에만, 해당 필드에 대해 유효성 검사가 실행됩니다.

> [!NOTE]
> 항상 존재해야 하지만 비어 있어도 되는 필드를 검증하고 싶다면, [옵셔널 필드에 대한 안내](#a-note-on-optional-fields)를 참고하세요.

<a name="complex-conditional-validation"></a>
#### 복잡한 조건부 유효성 검사

특정 조건에 따라 규칙을 동적으로 추가해야 할 때가 종종 있습니다. 예를 들어, 필드 값이 100 이상일 때만 추가 설명을 요구하거나, 또 다른 필드가 존재할 때에만 두 필드가 특정 값을 가져야 하는 경우 등입니다. 이런 복잡한 조건도 손쉽게 처리할 수 있습니다.

먼저, 변하지 않는 **정적(Static) 규칙**으로 Validator 인스턴스를 만듭니다:

```
use Illuminate\Support\Facades\Validator;

$validator = Validator::make($request->all(), [
    'email' => 'required|email',
    'games' => 'required|numeric',
]);
```

만약 웹 애플리케이션이 게임 수집가를 위한 것이라면, 만약 유저가 100개 이상의 게임을 소유하고 있다면, 소유 이유(reason)를 설명하도록 요구하는 상황을 생각해볼 수 있습니다. 이럴 땐, `Validator` 인스턴스의 `sometimes` 메서드를 활용하여 조건부로 규칙을 추가할 수 있습니다.

```
use Illuminate\Support\Fluent;

$validator->sometimes('reason', 'required|max:500', function (Fluent $input) {
    return $input->games >= 100;
});
```

`sometimes` 메서드의 첫 번째 인자는 조건부 검증 대상 필드명, 두 번째 인자는 적용할 규칙 목록, 세 번째 인자는 boolean 값을 반환하는 클로저입니다. 클로저가 `true`를 반환하면 해당 규칙이 적용됩니다. 이 방식으로 여러 필드에 조건부 유효성 검증을 한 번에 추가할 수도 있습니다:

```
$validator->sometimes(['reason', 'cost'], 'required', function (Fluent $input) {
    return $input->games >= 100;
});
```

> [!NOTE]
> 클로저에 전달되는 `$input` 파라미터는 `Illuminate\Support\Fluent` 인스턴스이며, 검증 중인 입력값과 파일을 참조할 때 사용할 수 있습니다.

<a name="complex-conditional-array-validation"></a>
#### 중첩 배열에서 복잡한 조건부 유효성 검사

중첩 배열 내에서, 인덱스를 미리 모를 때 다른 필드의 값에 따라 검증 규칙을 적용하고 싶을 수 있습니다. 이럴 때, 클로저의 두 번째 인자로 현재 반복 중인 배열 아이템을 받을 수 있습니다:

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

$validator->sometimes('channels.*.address', 'email', function (Fluent $input, Fluent $item) {
    return $item->type === 'email';
});

$validator->sometimes('channels.*.address', 'url', function (Fluent $input, Fluent $item) {
    return $item->type !== 'email';
});
```

여기서 `$item` 역시 `$input`과 마찬가지로 `Illuminate\Support\Fluent`의 인스턴스(입력 데이터가 배열일 경우)이며, 아니라면 단순 문자열입니다.

<a name="validating-arrays"></a>
## 배열 유효성 검사

[`array` 유효성 검사 규칙](#rule-array)에서 설명한 것처럼, `array` 규칙에는 허용할 배열 키 목록을 지정할 수 있습니다. 배열에 다른 키가 더 있으면 유효성 검사에 실패합니다.

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

일반적으로, 배열 내에 어떤 키들이 존재할 수 있는지 **항상 명시적으로** 지정하는 것이 좋습니다. 그렇지 않으면, Validator의 `validate`, `validated` 메서드는 중첩 배열 검증 규칙에서 검증받지 않은 키까지 포함해서 모든 배열 키의 데이터를 반환합니다.

<a name="validating-nested-array-input"></a>
### 중첩 배열 입력 데이터 유효성 검사

폼 데이터에 중첩 배열이 있는 필드 유효성 검사도 어렵지 않습니다. "점 표기법(dot notation)"을 사용하면 배열 내부의 필드를 쉽게 검증할 수 있습니다. 예를 들어, 들어오는 HTTP 요청에 `photos[profile]`이 있다면 다음과 같이 유효성 검사를 지정할 수 있습니다:

```
use Illuminate\Support\Facades\Validator;

$validator = Validator::make($request->all(), [
    'photos.profile' => 'required|image',
]);
```

배열의 각 요소에 대해 유효성 검사를 적용하는 것도 가능합니다. 예를 들어, 배열 입력 필드 안의 각 이메일이 유일한지 검사하려면 다음과 같이 작성합니다:

```
$validator = Validator::make($request->all(), [
    'person.*.email' => 'email|unique:users',
    'person.*.first_name' => 'required_with:person.*.last_name',
]);
```

또한 [언어 파일에서 사용자 지정 유효성 검사 메시지](#custom-messages-for-specific-attributes)를 정의할 때 `*`를 사용할 수 있어, 배열 기반 필드에 단일 메시지 설정도 매우 쉽습니다:

```
'custom' => [
    'person.*.email' => [
        'unique' => 'Each person must have a unique email address',
    ]
],
```

<a name="accessing-nested-array-data"></a>
#### 중첩 배열 데이터에 접근하기

검증 규칙을 지정하면서 특정 중첩 배열 요소의 값을 참조해야 할 때가 있습니다. 이럴 때는 `Rule::forEach` 메서드를 활용할 수 있습니다. 이 메서드는 검증 중인 배열 필드의 각 요소에 대해 클로저를 호출하며, 해당 요소의 값과 완전히 확장된 속성명을 파라미터로 전달합니다. 클로저는 각 요소에 적용할 규칙들의 배열을 반환해야 합니다:

```
use App\Rules\HasPermission;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

$validator = Validator::make($request->all(), [
    'companies.*.id' => Rule::forEach(function (string|null $value, string $attribute) {
        return [
            Rule::exists(Company::class, 'id'),
            new HasPermission('manage-company', $value),
        ];
    }),
]);
```

<a name="error-message-indexes-and-positions"></a>
### 에러 메시지에서 인덱스와 위치 사용하기

배열을 검증할 때는 유효성 검증에 실패한 항목의 인덱스나 위치 정보를 에러 메시지에서 참고하고 싶을 수 있습니다. 이런 경우, [사용자 정의 유효성 메시지](#manual-customizing-the-error-messages) 내에서 `:index`(0부터 시작), `:position`(1부터 시작) 플레이스홀더를 사용할 수 있습니다:

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

위 예시의 경우, 유효성 검사가 실패하면 사용자는 `"Please describe photo #2."`와 같은 에러 메시지를 보게 됩니다.

필요하다면, 더 깊이 중첩된 인덱스 및 위치도 `second-index`, `second-position`, `third-index`, `third-position` 등으로 참조할 수 있습니다.

```
'photos.*.attributes.*.string' => 'Invalid attribute for photo #:second-position.',
```

<a name="validating-files"></a>

## 파일 유효성 검증

라라벨은 업로드된 파일을 검증할 수 있도록 `mimes`, `image`, `min`, `max` 등 다양한 유효성 검사 규칙을 제공합니다. 각각의 규칙을 개별적으로 지정하여 파일을 검증할 수도 있지만, 라라벨이 제공하는 유창한(fluid) 파일 유효성 검증 규칙 빌더를 활용하면 더욱 편리합니다:

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

애플리케이션에서 사용자가 이미지를 업로드하도록 허용한다면, `File` 규칙의 `image` 생성자 메서드를 사용하여 업로드된 파일이 이미지임을 지정할 수 있습니다. 또한 `dimensions` 규칙을 사용하면 이미지의 크기를 제한할 수 있습니다.

```
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
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
> 이미지 크기(dimensions) 검증에 대한 추가 정보는 [dimensions 규칙 문서](#rule-dimensions)에서 확인할 수 있습니다.

<a name="validating-files-file-sizes"></a>
#### 파일 크기

편의를 위해, 최소 및 최대 파일 크기는 파일 크기 단위를 나타내는 접미사를 포함한 문자열로 지정할 수 있습니다. `kb`, `mb`, `gb`, `tb` 접미사를 지원합니다:

```php
File::image()
    ->min('1kb')
    ->max('10mb')
```

<a name="validating-files-file-types"></a>
#### 파일 타입

`types` 메서드를 사용할 때는 확장자만 지정하지만, 내부적으로는 실제로 파일의 내용을 읽어서 MIME 타입을 추정한 뒤 해당 MIME 타입을 검사합니다. MIME 타입과 이와 대응되는 확장자 전체 목록은 아래 링크에서 확인할 수 있습니다.

[https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types](https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types)

<a name="validating-passwords"></a>
## 비밀번호 유효성 검증

비밀번호가 적절한 수준의 복잡성을 갖추도록 보장하려면, 라라벨의 `Password` 규칙 객체를 사용할 수 있습니다.

```
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

$validator = Validator::make($request->all(), [
    'password' => ['required', 'confirmed', Password::min(8)],
]);
```

`Password` 규칙 객체를 사용하면 비밀번호에 최소 하나 이상의 영문자, 숫자, 특수문자 또는 대·소문자 혼합과 같은 복잡성 요구사항을 손쉽게 지정할 수 있습니다.

```
// 최소 8자 이상...
Password::min(8)

// 최소 한 글자(영문자) 포함...
Password::min(8)->letters()

// 최소 한 개의 대문자와 한 개의 소문자 포함...
Password::min(8)->mixedCase()

// 최소 하나의 숫자 포함...
Password::min(8)->numbers()

// 최소 하나의 특수문자 포함...
Password::min(8)->symbols()
```

또한, `uncompromised` 메서드를 사용하면 비밀번호가 공개된 비밀번호 데이터 유출에 포함된 적이 있는지 확인할 수 있습니다.

```
Password::min(8)->uncompromised()
```

내부적으로 `Password` 규칙 객체는 [haveibeenpwned.com](https://haveibeenpwned.com) 서비스를 활용하며, [k-익명성(k-Anonymity)](https://en.wikipedia.org/wiki/K-anonymity) 모델을 통해 사용자의 프라이버시와 보안을 해치지 않고 유출 여부를 판단합니다.

기본적으로 비밀번호가 데이터 유출에 한 번이라도 등장하면 유출된 것으로 간주합니다. 이 임계값(threshold)은 `uncompromised` 메서드의 첫 번째 인수를 통해 지정할 수 있습니다.

```
// 데이터 유출에 같은 비밀번호가 3회 미만으로 발견될 경우만 허용...
Password::min(8)->uncompromised(3);
```

물론, 위에서 소개한 모든 메서드를 체이닝하여 동시에 사용할 수도 있습니다.

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

비밀번호에 대한 기본 유효성 검사 규칙을 애플리케이션의 한 곳에서 지정해두면 편리합니다. 이를 위해 `Password::defaults` 메서드(클로저를 인수로 받음)를 사용할 수 있습니다. 이 메서드에 전달하는 클로저는 Password 규칙의 기본 구성을 반환해야 합니다. 일반적으로 `defaults` 규칙은 애플리케이션 서비스 프로바이더의 `boot` 메서드 내부에서 호출하면 좋습니다.

```php
use Illuminate\Validation\Rules\Password;

/**
 * 애플리케이션 서비스 부트스트랩.
 */
public function boot(): void
{
    Password::defaults(function () {
        $rule = Password::min(8);

        return $this->app->isProduction()
                    ? $rule->mixedCase()->uncompromised()
                    : $rule;
    });
}
```

이후 특정 비밀번호가 검증될 때 기본 규칙을 적용하고 싶다면, 인자 없이 `defaults` 메서드를 호출하면 됩니다.

```
'password' => ['required', Password::defaults()],
```

때로는 기본 비밀번호 유효성 검증 규칙에 추가 규칙을 연결하고 싶을 수 있습니다. 이 경우 `rules` 메서드를 사용하면 됩니다.

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
### 규칙 객체 사용

라라벨에는 유용한 유효성 검증 규칙이 다양하게 포함되어 있지만, 직접 정의한 규칙이 필요할 때도 있습니다. 커스텀 유효성 검증 규칙을 등록하는 한 가지 방법은 규칙 객체(rule object)를 사용하는 것입니다. 새 규칙 객체를 생성하려면 `make:rule` 아티즌 명령어를 사용할 수 있습니다. 예를 들어, 입력 문자열이 모두 대문자인지 확인하는 규칙을 아래와 같이 생성할 수 있습니다. 라라벨은 생성된 규칙을 `app/Rules` 디렉터리에 위치시키며, 이 디렉터리가 없다면 명령어 실행 시 자동으로 생성해줍니다.

```shell
php artisan make:rule Uppercase
```

규칙을 생성했다면, 이제 동작을 정의할 차례입니다. 규칙 객체는 하나의 메서드(`validate`)를 가집니다. 이 메서드는 속성명, 값, 실패할 경우 호출해야 할 콜백(검증 오류 메시지 전달용)을 인수로 받습니다.

```
<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class Uppercase implements ValidationRule
{
    /**
     * 유효성 검증 규칙 실행.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (strtoupper($value) !== $value) {
            $fail('The :attribute must be uppercase.');
        }
    }
}
```

규칙 정의가 끝나면, 유효성 검사 시 다른 규칙들과 함께 규칙 객체의 인스턴스를 전달하여 적용할 수 있습니다.

```
use App\Rules\Uppercase;

$request->validate([
    'name' => ['required', 'string', new Uppercase],
]);
```

#### 유효성 검사 메시지 번역하기

`$fail` 콜백에 오류 메시지를 직접 전달하는 대신, [번역 문자열 키](/docs/10.x/localization)를 지정하여 라라벨이 해당 메시지를 번역하도록 할 수도 있습니다.

```
if (strtoupper($value) !== $value) {
    $fail('validation.uppercase')->translate();
}
```

필요하다면 `translate` 메서드에 플레이스홀더 치환값과 원하는 언어를 첫 번째, 두 번째 인수로 전달할 수 있습니다.

```
$fail('validation.location')->translate([
    'value' => $this->value,
], 'fr')
```

#### 추가 데이터 접근하기

커스텀 유효성 검증 규칙 클래스에서 현재 검증 중인 모든 데이터를 참조해야 할 경우, 클래스가 `Illuminate\Contracts\Validation\DataAwareRule` 인터페이스를 구현하게 하면 됩니다. 이 인터페이스를 구현할 때는 `setData` 메서드를 반드시 정의해야 하며, 해당 메서드는 라라벨이 유효성 검사 시작 전에 자동으로 호출하면서 모든 검증 데이터를 전달해줍니다.

```
<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\DataAwareRule;
use Illuminate\Contracts\Validation\ValidationRule;

class Uppercase implements DataAwareRule, ValidationRule
{
    /**
     * 모든 검증 데이터.
     *
     * @var array<string, mixed>
     */
    protected $data = [];

    // ...

    /**
     * 검증 데이터 설정.
     *
     * @param  array<string, mixed>  $data
     */
    public function setData(array $data): static
    {
        $this->data = $data;

        return $this;
    }
}
```

또는, 유효성 검증을 실제로 수행하는 밸리데이터 인스턴스에 접근해야 하는 경우 `ValidatorAwareRule` 인터페이스를 구현할 수 있습니다.

```
<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\ValidatorAwareRule;
use Illuminate\Validation\Validator;

class Uppercase implements ValidationRule, ValidatorAwareRule
{
    /**
     * 밸리데이터 인스턴스.
     *
     * @var \Illuminate\Validation\Validator
     */
    protected $validator;

    // ...

    /**
     * 현재 밸리데이터 설정.
     */
    public function setValidator(Validator $validator): static
    {
        $this->validator = $validator;

        return $this;
    }
}
```

<a name="using-closures"></a>
### 클로저 사용하기

특정 커스텀 규칙이 애플리케이션 내에서 한 번만 필요하다면, 규칙 객체 대신 클로저(익명 함수)를 사용할 수 있습니다. 이 클로저는 속성명, 값, 검증 실패 시 호출할 `$fail` 콜백을 인수로 전달받습니다.

```
use Illuminate\Support\Facades\Validator;
use Closure;

$validator = Validator::make($request->all(), [
    'title' => [
        'required',
        'max:255',
        function (string $attribute, mixed $value, Closure $fail) {
            if ($value === 'foo') {
                $fail("The {$attribute} is invalid.");
            }
        },
    ],
]);
```

<a name="implicit-rules"></a>
### 암묵적(implicit) 규칙

기본적으로, 유효성 검사가 수행될 때 해당 속성이 존재하지 않거나 빈 문자열인 경우에는 기본 규칙과 커스텀 규칙을 포함한 일반 유효성 규칙이 실행되지 않습니다. 예를 들어, [`unique`](#rule-unique) 규칙은 빈 문자열에 대해 실행되지 않습니다.

```
use Illuminate\Support\Facades\Validator;

$rules = ['name' => 'unique:users,name'];

$input = ['name' => ''];

Validator::make($input, $rules)->passes(); // true
```

속성이 비어 있더라도 커스텀 규칙이 실행되기를 바란다면, 해당 규칙이 암묵적으로 해당 속성이 `required`임을 내포해야 합니다. 이 때는 `make:rule` 아티즌 명령어에 `--implicit` 옵션을 추가하여 암묵적 규칙 객체를 빠르게 생성할 수 있습니다.

```shell
php artisan make:rule Uppercase --implicit
```

> [!WARNING]
> "암묵적(implicit)" 규칙이란, 단순히 해당 속성이 `required`임을 _내포_ 한다는 뜻입니다. 실제로 속성 누락 또는 빈 값에 대해 유효성 검사를 실패 처리할지는 여러분이 규칙 내에서 직접 정의해야 합니다.