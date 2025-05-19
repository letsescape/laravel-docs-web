# 유효성 검증 (Validation)

- [소개](#introduction)
- [유효성 검증 빠르게 시작하기](#validation-quickstart)
    - [라우트 정의하기](#quick-defining-the-routes)
    - [컨트롤러 생성하기](#quick-creating-the-controller)
    - [유효성 검증 로직 작성하기](#quick-writing-the-validation-logic)
    - [유효성 검증 오류 표시하기](#quick-displaying-the-validation-errors)
    - [폼 값 다시 채우기](#repopulating-forms)
    - [옵션 필드에 대한 참고](#a-note-on-optional-fields)
    - [유효성 검증 오류 응답 포맷](#validation-error-response-format)
- [폼 리퀘스트를 이용한 유효성 검증](#form-request-validation)
    - [폼 리퀘스트 클래스 생성하기](#creating-form-requests)
    - [폼 리퀘스트 인가 처리](#authorizing-form-requests)
    - [에러 메시지 커스터마이즈](#customizing-the-error-messages)
    - [유효성 검증용 입력값 준비하기](#preparing-input-for-validation)
- [수동으로 검증기 생성하기](#manually-creating-validators)
    - [자동 리다이렉션](#automatic-redirection)
    - [네임드 에러 백 사용하기](#named-error-bags)
    - [에러 메시지 커스터마이즈](#manual-customizing-the-error-messages)
    - [추가 유효성 검증 수행하기](#performing-additional-validation)
- [검증된 입력값 사용하기](#working-with-validated-input)
- [에러 메시지 활용하기](#working-with-error-messages)
    - [언어 파일에서 커스텀 메시지 지정하기](#specifying-custom-messages-in-language-files)
    - [언어 파일에서 속성 지정하기](#specifying-attribute-in-language-files)
    - [언어 파일에서 값 지정하기](#specifying-values-in-language-files)
- [사용 가능한 유효성 검증 규칙](#available-validation-rules)
- [조건부 규칙 추가하기](#conditionally-adding-rules)
- [배열 검증하기](#validating-arrays)
    - [중첩 배열 입력 검증](#validating-nested-array-input)
    - [에러 메시지 인덱스 및 위치](#error-message-indexes-and-positions)
- [파일 유효성 검증](#validating-files)
- [비밀번호 유효성 검증](#validating-passwords)
- [커스텀 유효성 검증 규칙](#custom-validation-rules)
    - [Rule 객체 사용하기](#using-rule-objects)
    - [클로저 사용하기](#using-closures)
    - [암묵적 규칙](#implicit-rules)

<a name="introduction"></a>
## 소개

라라벨은 애플리케이션으로 들어오는 데이터를 검증할 수 있는 다양한 방법을 제공합니다. 가장 일반적으로는 모든 HTTP 요청 객체에 사용할 수 있는 `validate` 메서드를 이용합니다. 하지만, 본 문서에서는 그 외에도 여러 유효성 검증 방식에 대해 다룹니다.

라라벨은 매우 다양한 편의 유효성 검증 규칙을 기본으로 제공하며, 특정 데이터베이스 테이블에서 값이 유일한지까지 검증할 수 있는 기능도 포함하고 있습니다. 본 문서에서는 이 모든 유효성 검증 규칙에 대해 자세히 설명드리니, 라라벨의 많은 유효성 검증 기능을 익힐 수 있습니다.

<a name="validation-quickstart"></a>
## 유효성 검증 빠르게 시작하기

라라벨의 강력한 유효성 검증 기능을 알아보기 위해, 폼을 검증하고 검증 실패 시 에러 메시지를 사용자에게 표시하는 전체 예제를 살펴보겠습니다. 이 전반적인 흐름을 이해하면 라라벨에서 들어오는 요청 데이터를 어떻게 검증하는지 개괄적으로 파악할 수 있습니다.

<a name="quick-defining-the-routes"></a>
### 라우트 정의하기

먼저, `routes/web.php` 파일에 아래와 같은 라우트가 정의되어 있다고 가정해 봅시다.

```
use App\Http\Controllers\PostController;

Route::get('/post/create', [PostController::class, 'create']);
Route::post('/post', [PostController::class, 'store']);
```

`GET` 라우트는 사용자가 새로운 블로그 게시글을 작성할 수 있는 폼을 보여주고, `POST` 라우트는 새로운 게시글을 데이터베이스에 저장합니다.

<a name="quick-creating-the-controller"></a>
### 컨트롤러 생성하기

다음으로, 이 라우트에서 들어오는 요청을 처리하는 간단한 컨트롤러 예제를 살펴보겠습니다. `store` 메서드는 아직 비워둔 상태입니다.

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

이제 `store` 메서드에 새 블로그 게시글을 검증하는 로직을 작성해 보겠습니다. 이를 위해 `Illuminate\Http\Request` 객체가 제공하는 `validate` 메서드를 사용할 수 있습니다. 검증 규칙을 통과하면 코드가 정상적으로 계속 실행되고, 실패하면 `Illuminate\Validation\ValidationException` 예외가 발생하며 적절한 에러 응답이 자동으로 사용자에게 반환됩니다.

전통적인 HTTP 요청에서 유효성 검증이 실패하면, 이전 URL로 리다이렉트되는 응답이 생성됩니다. 만약 요청이 XHR(비동기, JS 기반) 요청이라면, [유효성 검증 에러 메시지를 담은 JSON 응답](#validation-error-response-format)이 반환됩니다.

`validate` 메서드가 어떻게 동작하는지 좀 더 구체적으로 알아보겠습니다.

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

보시다시피, 유효성 검증 규칙들은 `validate` 메서드에 전달됩니다. 걱정하지 마세요. 사용 가능한 모든 유효성 검증 규칙은 [문서화되어 있습니다](#available-validation-rules). 다시 한 번 강조드리면, 검증 실패 시 적절한 응답이 자동으로 생성됩니다. 검증 성공 시 컨트롤러는 정상적으로 계속 실행됩니다.

또한, 검증 규칙들은 단일 `|`로 구분된 문자열이 아니라, 규칙 배열로도 지정할 수 있습니다.

```
$validatedData = $request->validate([
    'title' => ['required', 'unique:posts', 'max:255'],
    'body' => ['required'],
]);
```

추가로, `validateWithBag` 메서드를 사용하면 [네임드 에러 백](#named-error-bags) 내에 에러 메시지를 저장하면서 요청을 검증할 수 있습니다.

```
$validatedData = $request->validateWithBag('post', [
    'title' => ['required', 'unique:posts', 'max:255'],
    'body' => ['required'],
]);
```

<a name="stopping-on-first-validation-failure"></a>
#### 첫 번째 검증 실패 시 검증 중단하기

특정 속성(attribute)에 대해 첫 번째 유효성 검증 실패 이후, 더 이상 검증 규칙을 평가하지 않고 중단하고 싶을 때가 있습니다. 이럴 때는 해당 속성에 `bail` 규칙을 추가하면 됩니다.

```
$request->validate([
    'title' => 'bail|required|unique:posts|max:255',
    'body' => 'required',
]);
```

이 예제에서는 `title` 속성에 대한 `unique` 규칙이 실패하면, 이후의 `max` 규칙은 평가되지 않습니다. 규칙들은 지정된 순서대로 검증됩니다.

<a name="a-note-on-nested-attributes"></a>
#### 중첩 속성에 대한 참고

만약 들어오는 HTTP 요청에 "중첩된" 필드 데이터가 있다면, 검증 규칙에서도 "점(dot) 표기법"을 이용해 해당 필드를 지정할 수 있습니다.

```
$request->validate([
    'title' => 'required|unique:posts|max:255',
    'author.name' => 'required',
    'author.description' => 'required',
]);
```

반대로, 필드 이름에 실제 마침표가 들어가 있을 경우에는, 백슬래시로 마침표를 이스케이프해서 "점 표기법"으로 해석되지 않도록 명시할 수 있습니다.

```
$request->validate([
    'title' => 'required|unique:posts|max:255',
    'v1\.0' => 'required',
]);
```

<a name="quick-displaying-the-validation-errors"></a>
### 유효성 검증 오류 표시하기

그렇다면 요청 필드가 지정된 검증 규칙을 통과하지 못했을 때 어떻게 될까요? 앞서 언급했듯이, 라라벨은 자동으로 사용자를 이전 위치로 리다이렉트합니다. 그리고 모든 유효성 검증 오류 메시지와 [요청 입력값](/docs/11.x/requests#retrieving-old-input)이 [세션에 플래시](https://laravel.kr/docs/11.x/session#flash-data)됩니다.

`Illuminate\View\Middleware\ShareErrorsFromSession` 미들웨어가 제공하는 `$errors` 변수가 모든 뷰에 자동으로 공유됩니다. 이 미들웨어는 `web` 미들웨어 그룹에 포함되어 있으며, 따라서 뷰에서는 언제든 `$errors` 변수를 사용할 수 있다고 가정해도 됩니다. `$errors` 변수는 `Illuminate\Support\MessageBag`의 인스턴스입니다. 이 객체를 다루는 자세한 방법은 [관련 문서](#working-with-error-messages)를 참고하세요.

따라서, 검증에 실패하면 사용자는 컨트롤러의 `create` 메서드로 리다이렉트되고, 뷰에서 오류 메시지를 보여줄 수 있습니다.

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
#### 에러 메시지 커스터마이즈

라라벨이 내장 제공하는 검증 규칙들은 각각의 에러 메시지가 애플리케이션의 `lang/en/validation.php` 파일에 위치합니다. 만약 애플리케이션에 `lang` 디렉터리가 없다면, `lang:publish` 아티즌 명령어로 생성할 수 있습니다.

`lang/en/validation.php` 파일에는 각 유효성 검증 규칙에 대한 번역 항목이 들어 있습니다. 애플리케이션의 요구에 따라 이 메시지들은 자유롭게 변경하거나 수정할 수 있습니다.

또한, 이 파일을 다른 언어 디렉터리에 복사해 번역하여 사용할 수도 있습니다. 라라벨의 다국어 지원 기능(Localization)에 대해 더 알고 싶다면 [로컬라이제이션 전체 문서](/docs/11.x/localization)를 참고하세요.

> [!WARNING]  
> 기본적으로 라라벨 애플리케이션 스켈레톤에는 `lang` 디렉터리가 포함되어 있지 않습니다. 라라벨의 언어 파일을 커스터마이즈하고 싶다면 `lang:publish` 아티즌 명령어로 발행하세요.

<a name="quick-xhr-requests-and-validation"></a>
#### XHR 요청과 유효성 검증

이 예제에서는 전통적인 폼 제출 방식을 사용했지만, 실제 애플리케이션에서는 자바스크립트 기반 프론트엔드에서 XHR(비동기) 요청을 보내는 경우가 많습니다. XHR 요청에서 `validate` 메서드를 사용하면 라라벨은 리다이렉트 응답을 생성하지 않습니다. 대신, [모든 유효성 검증 오류를 포함하는 JSON 응답](#validation-error-response-format)을 반환하며, 응답의 HTTP 상태 코드는 422로 전송됩니다.

<a name="the-at-error-directive"></a>
#### `@error` 디렉티브

특정 속성에 대해 유효성 검증 에러 메시지가 있는지 빠르게 확인하려면 [Blade](/docs/11.x/blade)에서 `@error` 디렉티브를 사용할 수 있습니다. `@error` 블록 내부에서는 `$message` 변수를 통해 해당 에러 메시지를 바로 출력할 수 있습니다.

```blade
<!-- /resources/views/post/create.blade.php -->

<label for="title">Post Title</label>

<input
    id="title"
    type="text"
    name="title"
    class="@error('title') is-invalid @enderror"
/>

@error('title')
    <div class="alert alert-danger">{{ $message }}</div>
@enderror
```

[네임드 에러 백](#named-error-bags)을 사용할 경우에는 `@error` 디렉티브의 두 번째 인자로 에러 백의 이름을 전달할 수 있습니다.

```blade
<input ... class="@error('title', 'post') is-invalid @enderror">
```

<a name="repopulating-forms"></a>
### 폼 값 다시 채우기

라라벨이 유효성 검증 오류로 인해 리다이렉트 응답을 생성하면, 프레임워크는 [해당 요청의 모든 입력값을 세션에 플래시](https://laravel.kr/docs/11.x/session#flash-data)합니다. 이렇게 하면 다음 요청에서 이 입력값을 쉽게 가져와 폼을 다시 채울 수 있습니다.

직전 요청의 플래시된 입력값을 가져오려면, `Illuminate\Http\Request` 인스턴스의 `old` 메서드를 호출하면 됩니다. 이 메서드는 [세션](/docs/11.x/session)에 저장된 이전 입력값을 반환합니다.

```
$title = $request->old('title');
```

라라벨은 또한 전역 `old` 헬퍼 함수를 제공합니다. [Blade 템플릿](/docs/11.x/blade)에서 이전 입력값을 폼에 채우고자 할 때는 이 헬퍼를 사용하면 편리합니다. 만약 해당 필드의 이전 입력값이 없으면 `null`이 반환됩니다.

```blade
<input type="text" name="title" value="{{ old('title') }}">
```

<a name="a-note-on-optional-fields"></a>
### 옵션 필드에 대한 참고

기본적으로, 라라벨은 여러분의 애플리케이션 전역 미들웨어 스택에 `TrimStrings`와 `ConvertEmptyStringsToNull` 미들웨어를 포함하고 있습니다. 이 때문에 "옵션" 요청 필드 값을 `null`로 처리하고 싶다면, 해당 필드 규칙에 `nullable`을 명시해야 합니다. 예를 들어,

```
$request->validate([
    'title' => 'required|unique:posts|max:255',
    'body' => 'required',
    'publish_at' => 'nullable|date',
]);
```

이 예제에서는 `publish_at` 필드가 `null`이거나, 올바른 날짜 형식이 되어야 함을 명시하고 있습니다. 만약 규칙에 `nullable`을 추가하지 않으면, 검증기는 `null`을 올바른 날짜로 간주하지 않고 검증을 실패하게 됩니다.

<a name="validation-error-response-format"></a>
### 유효성 검증 오류 응답 포맷

애플리케이션이 `Illuminate\Validation\ValidationException` 예외를 throw하고, 요청이 JSON 응답을 기대하는 경우 라라벨이 에러 메시지를 자동으로 포맷해서 `422 Unprocessable Entity` HTTP 응답으로 반환합니다.

아래는 유효성 검증 오류에 대한 JSON 응답의 예시입니다. 참고로 중첩된 에러 키는 "점(dot) 표기법"으로 평탄화됩니다.

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
## 폼 리퀘스트를 이용한 유효성 검증

<a name="creating-form-requests"></a>
### 폼 리퀘스트 클래스 생성하기

더 복잡한 유효성 검증이 필요할 때는 "폼 리퀘스트(Form Request)"를 생성하는 것이 좋습니다. 폼 리퀘스트란, 검증 및 인가 로직을 자체적으로 가지고 있는 커스텀 요청 클래스입니다. 폼 리퀘스트 클래스를 생성하려면 `make:request` 아티즌 CLI 명령어를 사용하세요.

```shell
php artisan make:request StorePostRequest
```

이렇게 생성된 폼 리퀘스트 클래스는 `app/Http/Requests` 디렉터리에 저장됩니다. 이 디렉터리가 없다면 `make:request` 실행 시 자동으로 생성됩니다. 라라벨이 생성하는 각 폼 리퀘스트 클래스에는 `authorize`와 `rules`라는 두 개의 메서드가 포함됩니다.

예상하셨겠지만, `authorize` 메서드는 현재 인증된 사용자가 해당 요청에서 표현하는 동작을 수행할 수 있는지 판단하는 역할이고, `rules` 메서드는 해당 요청 데이터에 적용할 검증 규칙을 반환합니다.

```
/**
 * Get the validation rules that apply to the request.
 *
 * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
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
> `rules` 메서드의 시그니처에 필요한 의존성은 타입힌트로 지정하면, 라라벨 [서비스 컨테이너](/docs/11.x/container)를 통해 자동으로 주입됩니다.

그렇다면 검증 규칙들은 언제 평가될까요? 컨트롤러의 메서드에서 해당 리퀘스트를 타입힌트로 선언하기만 하면 됩니다. 폼 리퀘스트 객체가 컨트롤러로 전달되기 전에 자동으로 유효성 검증이 수행되기 때문에, 컨트롤러가 검증 로직으로 복잡해질 필요가 없습니다.

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

만약 검증에 실패하면, 사용자를 이전 위치로 리다이렉트하는 응답이 자동으로 생성되고, 에러는 세션에 플래시되어 나중에 뷰에서 표시할 수 있습니다. XHR 요청인 경우, HTTP 응답 코드 422와 함께 [유효성 검증 에러의 JSON 형태](#validation-error-response-format)가 반환됩니다.

> [!NOTE]  
> 라라벨 프론트엔드를 Inertia로 구성한 경우 실시간 폼 리퀘스트 유효성 검증이 필요하다면 [Laravel Precognition](/docs/11.x/precognition)을 참고하세요.

<a name="performing-additional-validation-on-form-requests"></a>
#### 추가 유효성 검증 수행하기

기본 유효성 검증 이후, 추가로 검증이 필요할 때는 폼 리퀘스트 클래스의 `after` 메서드를 활용할 수 있습니다.

`after` 메서드는 검증이 완료된 후 호출되는 callable(클로저 또는 invokable 클래스)들의 배열을 반환해야 합니다. 각 콜러블에는 `Illuminate\Validation\Validator` 인스턴스가 전달되어, 필요할 경우 추가 에러 메시지를 등록할 수 있습니다.

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

위에서 설명했듯, `after` 메서드가 반환하는 배열에 invokable 클래스를 포함할 수도 있습니다. 이 클래스의 `__invoke` 메서드는 `Illuminate\Validation\Validator` 인스턴스를 전달받습니다.

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
#### 첫 번째 검증 실패 시 전체 검증 중단

요청 클래스에 `stopOnFirstFailure` 프로퍼티를 추가하면, 하나의 검증 실패가 발생한 후 모든 속성에 대한 검증을 중단하도록 지정할 수 있습니다.

```
/**
 * Indicates if the validator should stop on the first rule failure.
 *
 * @var bool
 */
protected $stopOnFirstFailure = true;
```

<a name="customizing-the-redirect-location"></a>
#### 리다이렉트 위치 커스터마이즈

폼 리퀘스트가 유효성 검증에 실패하면, 사용자를 이전 위치로 보내는 리다이렉트 응답이 자동 생성됩니다. 이 동작을 변경하고 싶다면, 폼 리퀘스트 클래스 내에 `$redirect` 프로퍼티를 정의하세요.

```
/**
 * The URI that users should be redirected to if validation fails.
 *
 * @var string
 */
protected $redirect = '/dashboard';
```

또는, 이름이 지정된 라우트로 리다이렉트하고 싶다면 `$redirectRoute` 프로퍼티를 사용합니다.

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

폼 리퀘스트 클래스에는 `authorize` 메서드도 포함되어 있습니다. 이 메서드 내부에서는 인증된 사용자가 실제로 특정 리소스를 수정할 권한이 있는지 판단할 수 있습니다. 예를 들어, 사용자가 특정 블로그 댓글에 대해 실제로 소유자임을 판단할 수 있습니다. 보통 이 메서드에서는 [인가 게이트 및 정책](/docs/11.x/authorization)을 활용하게 됩니다.

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

모든 폼 리퀘스트는 라라벨의 기본 요청 클래스를 확장하므로, `user` 메서드로 현재 인증된 사용자를 참조할 수 있습니다. 그리고, 위 예시에서 호출한 `route` 메서드는 호출된 라우트에서 받은 URI 파라미터에 접근할 수 있게 해주며, 예제의 `{comment}`와 같은 파라미터가 여기에 해당합니다.

```
Route::post('/comment/{comment}');
```

따라서, 애플리케이션이 [라우트 모델 바인딩](/docs/11.x/routing#route-model-binding)을 이용하는 경우, 요청 객체의 프로퍼티로 바로 바인딩된 모델에 접근하여 코드를 더욱 간결하게 만들 수 있습니다.

```
return $this->user()->can('update', $this->comment);
```

만약 `authorize` 메서드가 `false`를 반환하면, 자동으로 HTTP 403 상태 코드와 함께 컨트롤러 메서드는 실행되지 않습니다.

요청에 대한 인가 로직을 애플리케이션의 다른 부분에서 처리할 계획이라면, `authorize` 메서드를 아예 제거하거나, 단순히 `true`를 반환해도 됩니다.

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
> `authorize` 메서드의 시그니처에서 필요한 의존성도 타입힌트로 지정할 수 있으며, 이 역시 라라벨 [서비스 컨테이너](/docs/11.x/container)를 통해 자동으로 주입됩니다.

<a name="customizing-the-error-messages"></a>
### 에러 메시지 커스터마이즈

폼 리퀘스트에서 사용하는 에러 메시지는 `messages` 메서드를 오버라이드하여 커스터마이즈 할 수 있습니다. 이 메서드는 속성/규칙 쌍과 각각의 에러 메시지로 이루어진 배열을 반환해야 합니다.

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
#### 유효성 검증 속성명 커스터마이즈

라라벨의 내장 유효성 검증 에러 메시지에는 자주 `:attribute` 플레이스홀더가 포함되어 있습니다. 이 플레이스홀더를 커스텀 속성명으로 교체하고 싶다면, `attributes` 메서드를 오버라이드하여 사용하세요. 이 메서드는 속성/이름 쌍의 배열을 반환해야 합니다.

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
### 유효성 검증용 입력값 준비하기

검증 규칙을 적용하기 전에 요청 데이터를 사전 처리하거나 정제해야 한다면, `prepareForValidation` 메서드를 사용할 수 있습니다.

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

마찬가지로, 검증이 완료된 후에 요청 데이터를 정규화할 필요가 있다면 `passedValidation` 메서드를 사용할 수 있습니다.

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

## 수동으로 Validator 인스턴스 생성하기

요청 객체의 `validate` 메서드를 사용하지 않고 직접 Validator 인스턴스를 만들고 싶다면, [facade](/docs/11.x/facades) 중 하나인 `Validator`를 사용할 수 있습니다. 이 파사드의 `make` 메서드는 새로운 Validator 인스턴스를 생성합니다.

```
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PostController extends Controller
{
    /**
     * 새로운 블로그 게시글 저장.
     */
    public function store(Request $request): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|unique:posts|max:255',
            'body' => 'required',
        ]);

        if ($validator->fails()) {
            return redirect('/post/create')
                ->withErrors($validator)
                ->withInput();
        }

        // 유효성 검증을 통과한 입력 데이터를 가져옵니다...
        $validated = $validator->validated();

        // 검증된 입력 데이터의 일부만 추출합니다...
        $validated = $validator->safe()->only(['name', 'email']);
        $validated = $validator->safe()->except(['name', 'email']);

        // 블로그 게시글을 저장합니다...

        return redirect('/posts');
    }
}
```

`make` 메서드의 첫 번째 인수는 유효성 검증을 받을 데이터입니다. 두 번째 인수는 해당 데이터에 적용할 유효성 검증 규칙을 배열로 전달합니다.

요청의 유효성 검증이 실패했는지 판단한 다음에는, `withErrors` 메서드를 사용해 에러 메시지를 세션에 플래시할 수 있습니다. 이 방법을 사용하면, 리다이렉트 이후 자동으로 뷰에 `$errors` 변수가 공유되어, 사용자에게 쉽게 에러 메시지를 표시할 수 있습니다. `withErrors` 메서드는 Validator 인스턴스, `MessageBag`, PHP 배열 중 하나를 인수로 받을 수 있습니다.

#### 첫 번째 검증 실패에서 중단하기

`stopOnFirstFailure` 메서드를 사용하면, 첫 번째 유효성 검증 실패가 발생한 순간 해당 속성(attribute) 검증을 즉시 중단하고 이후 검증을 진행하지 않습니다.

```
if ($validator->stopOnFirstFailure()->fails()) {
    // ...
}
```

<a name="automatic-redirection"></a>
### 자동 리다이렉션

Validator 인스턴스를 수동으로 생성하더라도, HTTP 요청의 `validate` 메서드가 제공하는 자동 리다이렉트 기능을 그대로 활용하고 싶다면, 기존 Validator 인스턴스에서 `validate` 메서드를 호출하면 됩니다. 유효성 검증에 실패하면, 사용자에게 자동으로 리다이렉트되거나, XHR 요청의 경우 [JSON 응답이 반환됩니다](#validation-error-response-format).

```
Validator::make($request->all(), [
    'title' => 'required|unique:posts|max:255',
    'body' => 'required',
])->validate();
```

유효성 검증 실패 시 에러 메시지를 [이름이 지정된 에러 백](#named-error-bags)에 저장하려면 `validateWithBag` 메서드를 사용할 수 있습니다.

```
Validator::make($request->all(), [
    'title' => 'required|unique:posts|max:255',
    'body' => 'required',
])->validateWithBag('post');
```

<a name="named-error-bags"></a>
### 이름이 지정된 에러 백

한 페이지에 여러 폼이 있을 때, 각 폼에 대한 에러 메시지를 개별적으로 관리하기 위해 `MessageBag`에 이름(에러 백 이름)을 지정할 수 있습니다. 이때는 `withErrors`에 두 번째 인수로 이름을 전달하면 됩니다.

```
return redirect('/register')->withErrors($validator, 'login');
```

이후 뷰에서 `$errors` 변수에서 이름이 지정된 `MessageBag` 인스턴스에 접근할 수 있습니다.

```blade
{{ $errors->login->first('email') }}
```

<a name="manual-customizing-the-error-messages"></a>
### 에러 메시지 커스터마이징

필요하다면, Validator 인스턴스가 Laravel에서 기본으로 제공하는 에러 메시지 대신 직접 정의한 커스텀 에러 메시지를 사용하도록 지정할 수 있습니다. 커스텀 메시지를 지정하는 방법은 여러 가지가 있습니다. 첫 번째 방법은, `Validator::make` 메서드의 세 번째 인수로 메시지 배열을 전달하는 것입니다.

```
$validator = Validator::make($input, $rules, $messages = [
    'required' => 'The :attribute field is required.',
]);
```

여기서 `:attribute` 플레이스홀더는 실제로 검증 대상이 되는 필드명으로 자동 치환됩니다. 그 외에도, 유효성 메시지에는 다양한 플레이스홀더를 사용할 수 있습니다. 예시:

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

특정 필드에만 별도의 맞춤 에러 메시지를 적용하고 싶다면, "dot" 표기법을 사용할 수 있습니다. 즉, 필드 이름 뒤에 점(.)을 찍고 검증 규칙명을 이어 붙입니다.

```
$messages = [
    'email.required' => 'We need to know your email address!',
];
```

<a name="specifying-custom-attribute-values"></a>
#### 커스텀 속성(필드명) 값 지정

라라벨의 내장 에러 메시지에서는 대부분 `:attribute` 플레이스홀더를 사용하여 필드명 또는 속성 이름을 자동으로 보여줍니다. 이 치환 값(필드명)을 특정 필드에 대해 더 사용자 친화적으로 바꾸고 싶을 때는, `Validator::make` 메서드의 네 번째 인수로 커스텀 속성명을 배열로 전달할 수 있습니다.

```
$validator = Validator::make($input, $rules, $messages, [
    'email' => 'email address',
]);
```

<a name="performing-additional-validation"></a>
### 추가 유효성 검증 수행

초기 유효성 검증 이후에 추가 검증 로직이 필요할 때는, Validator의 `after` 메서드를 사용할 수 있습니다. 이 메서드는 클로저나 콜러블(callable) 배열을 인수로 받아, 검증이 끝난 후 실행됩니다. 각 콜러블에는 `Illuminate\Validation\Validator` 인스턴스가 전달되므로, 필요한 경우 에러 메시지를 추가할 수 있습니다.

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

또한 `after` 메서드는 콜러블의 배열도 받을 수 있으며, "검증 이후" 실행 로직을 인보커블(호출 가능한) 클래스로 분리해 둘 때 특히 편리합니다. 이 클래스들도 `__invoke` 메서드를 통해 `Illuminate\Validation\Validator` 인스턴스를 받을 수 있습니다.

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
## 유효성 검증된 입력 데이터 활용하기

폼 리퀘스트 또는 수동으로 생성한 Validator 인스턴스를 사용해 들어온 요청 데이터를 유효성 검증한 후, 실제로 검증된 입력 데이터만 얻고 싶을 수 있습니다. 이를 위한 방법은 여러 가지가 있습니다. 가장 간단하게, 폼 리퀘스트나 Validator 인스턴스에서 `validated` 메서드를 호출할 수 있습니다. 이 메서드는 실제로 검증에 통과한 데이터 배열을 반환합니다.

```
$validated = $request->validated();

$validated = $validator->validated();
```

또는, 폼 리퀘스트 또는 Validator 인스턴스에서 `safe` 메서드를 호출해도 됩니다. 이 메서드는 `Illuminate\Support\ValidatedInput` 인스턴스를 반환합니다. 이 객체는 `only`, `except`, `all` 메서드를 제공하여, 검증된 데이터의 일부 또는 전체 데이터 배열을 쉽게 가져올 수 있습니다.

```
$validated = $request->safe()->only(['name', 'email']);

$validated = $request->safe()->except(['name', 'email']);

$validated = $request->safe()->all();
```

또한, `Illuminate\Support\ValidatedInput` 인스턴스는 반복(iterate)하거나 배열처럼 접근할 수도 있습니다.

```
// 검증된 데이터를 반복해서 사용할 수 있습니다...
foreach ($request->safe() as $key => $value) {
    // ...
}

// 검증된 데이터를 배열처럼 접근할 수도 있습니다...
$validated = $request->safe();

$email = $validated['email'];
```

유효성 검증된 데이터에 추가 필드를 더하고 싶을 때는, `merge` 메서드를 사용할 수 있습니다.

```
$validated = $request->safe()->merge(['name' => 'Taylor Otwell']);
```

검증된 데이터를 [컬렉션](/docs/11.x/collections) 인스턴스로 변환하고 싶다면, `collect` 메서드를 사용합니다.

```
$collection = $request->safe()->collect();
```

<a name="working-with-error-messages"></a>
## 에러 메시지 활용하기

`Validator` 인스턴스에서 `errors` 메서드를 호출하면, 다양한 에러 메시지 조작 메서드를 가진 `Illuminate\Support\MessageBag` 인스턴스를 얻을 수 있습니다. 뷰에서 자동으로 제공되는 `$errors` 변수 역시 `MessageBag` 클래스의 인스턴스입니다.

<a name="retrieving-the-first-error-message-for-a-field"></a>
#### 필드별 첫 번째 에러 메시지 가져오기

특정 필드에 대한 첫 번째 에러 메시지를 가져오려면, `first` 메서드를 사용합니다.

```
$errors = $validator->errors();

echo $errors->first('email');
```

<a name="retrieving-all-error-messages-for-a-field"></a>
#### 필드의 모든 에러 메시지 가져오기

특정 필드에 대한 모든 에러 메시지를 배열로 가져오려면, `get` 메서드를 사용합니다.

```
foreach ($errors->get('email') as $message) {
    // ...
}
```

배열 형태의 폼 필드를 검증할 때는, `*` 문자를 이용해 각 배열 요소별 에러 메시지 전체를 불러올 수 있습니다.

```
foreach ($errors->get('attachments.*') as $message) {
    // ...
}
```

<a name="retrieving-all-error-messages-for-all-fields"></a>
#### 모든 필드의 모든 에러 메시지 가져오기

모든 필드에 대한 모든 에러 메시지 배열을 가져오려면, `all` 메서드를 사용합니다.

```
foreach ($errors->all() as $message) {
    // ...
}
```

<a name="determining-if-messages-exist-for-a-field"></a>
#### 필드의 에러 메시지 존재 여부 확인

특정 필드에 대한 에러 메시지 유무를 확인하려면, `has` 메서드를 사용할 수 있습니다.

```
if ($errors->has('email')) {
    // ...
}
```

<a name="specifying-custom-messages-in-language-files"></a>
### 언어 파일에서 커스텀 메시지 지정

라라벨이 내장한 각 유효성 검증 규칙에는 에러 메시지가 기본적으로 존재하며, 애플리케이션의 `lang/en/validation.php` 파일에 저장되어 있습니다. 만약 애플리케이션에 `lang` 디렉터리가 없다면, `lang:publish` Artisan 명령어를 통해 생성할 수 있습니다.

`lang/en/validation.php` 파일에는 각 검증 규칙별로 번역 메시지를 설정할 수 있습니다. 필요에 따라 이러한 메시지를 자유롭게 수정하거나 교체할 수 있습니다.

또한 이 파일을 다른 언어 경로에 복사해, 애플리케이션이 지원하는 언어별로 메시지를 번역할 수도 있습니다. 라라벨의 로컬라이제이션에 대해 더 알고 싶다면, [로컬라이제이션 전체 문서](/docs/11.x/localization)를 참고하세요.

> [!WARNING]  
> 기본적으로, 라라벨 애플리케이션 스켈레톤에는 `lang` 디렉터리가 포함되어 있지 않습니다. 라라벨의 언어 파일을 커스터마이징하고 싶다면, `lang:publish` Artisan 명령어를 통해 발행해야 합니다.

<a name="custom-messages-for-specific-attributes"></a>
#### 특정 속성에 대한 커스텀 메시지

애플리케이션의 validation 언어 파일에서, 특정 필드와 규칙 조합에 대해 사용하는 에러 메시지를 직접 지정할 수 있습니다. 이를 위해서는, `lang/xx/validation.php` 파일의 `custom` 배열에 커스텀 메시지를 추가하면 됩니다.

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

라라벨의 내장 에러 메시지는 대부분 `:attribute` 플레이스홀더를 포함하고, 검증 대상 필드 또는 속성의 이름으로 대체됩니다. 만약 `:attribute` 부분을 더 친절하거나 사용자 친화적인 이름으로 바꾸고 싶다면, `lang/xx/validation.php` 언어 파일의 `attributes` 배열에서 커스텀 속성명을 지정할 수 있습니다.

```
'attributes' => [
    'email' => 'email address',
],
```

> [!WARNING]  
> 기본적으로, 라라벨 애플리케이션 스켈레톤에는 `lang` 디렉터리가 포함되어 있지 않습니다. 라라벨의 언어 파일을 커스터마이징하고 싶다면, `lang:publish` Artisan 명령어를 통해 발행해야 합니다.

<a name="specifying-values-in-language-files"></a>
### 언어 파일에서 값 치환하기

라라벨 내장 검증 규칙의 일부 에러 메시지에는 `:value` 플레이스홀더가 포함되어 있으며, 이는 해당 요청 속성의 현재 값으로 치환됩니다. 하지만, 경우에 따라 `:value`를 좀 더 읽기 좋은 형태로 사용자 정의 치환값으로 바꾸고 싶을 수 있습니다. 예를 들어, `payment_type`이 `cc` 값일 때 신용카드 번호 필드가 필수임을 지정하는 아래와 같은 규칙이 있다고 가정해 봅니다.

```
Validator::make($request->all(), [
    'credit_card_number' => 'required_if:payment_type,cc'
]);
```

이 검증 규칙이 실패하면, 다음과 같은 에러 메시지가 표시됩니다.

```none
The credit card number field is required when payment type is cc.
```

`cc` 대신, 더 사용자 친화적인 표시 값으로 바꾸고 싶다면, `lang/xx/validation.php` 언어 파일의 `values` 배열에 다음과 같이 지정할 수 있습니다.

```
'values' => [
    'payment_type' => [
        'cc' => 'credit card'
    ],
],
```

> [!WARNING]  
> 기본적으로, 라라벨 애플리케이션 스켈레톤에는 `lang` 디렉터리가 포함되어 있지 않습니다. 라라벨의 언어 파일을 커스터마이징하고 싶다면, `lang:publish` Artisan 명령어를 통해 발행해야 합니다.

이처럼 값을 정의하면, 검증 규칙이 실패할 때 아래와 같이 더 이해하기 쉬운 에러 메시지가 출력됩니다.

```none
The credit card number field is required when payment type is credit card.
```

<a name="available-validation-rules"></a>
## 사용 가능한 유효성 검증 규칙

아래는 활용 가능한 모든 유효성 검증 규칙과 각각의 역할에 대한 목록입니다.

#### 불리언(Boolean) 관련

<div class="collection-method-list" markdown="1">

[Accepted](#rule-accepted)
[Accepted If](#rule-accepted-if)
[Boolean](#rule-boolean)
[Declined](#rule-declined)
[Declined If](#rule-declined-if)

</div>

#### 문자열(String) 관련

<div class="collection-method-list" markdown="1">

[Active URL](#rule-active-url)
[Alpha](#rule-alpha)
[Alpha Dash](#rule-alpha-dash)
[Alpha Numeric](#rule-alpha-num)
[Ascii](#rule-ascii)
[Confirmed](#rule-confirmed)
[Current Password](#rule-current-password)
[Different](#rule-different)
[Doesnt Start With](#rule-doesnt-start-with)
[Doesnt End With](#rule-doesnt-end-with)
[Email](#rule-email)
[Ends With](#rule-ends-with)
[Enum](#rule-enum)
[Hex Color](#rule-hex-color)
[In](#rule-in)
[IP Address](#rule-ip)
[JSON](#rule-json)
[Lowercase](#rule-lowercase)
[MAC Address](#rule-mac)
[Max](#rule-max)
[Min](#rule-min)
[Not In](#rule-not-in)
[Regular Expression](#rule-regex)
[Not Regular Expression](#rule-not-regex)
[Same](#rule-same)
[Size](#rule-size)
[Starts With](#rule-starts-with)
[String](#rule-string)
[Uppercase](#rule-uppercase)
[URL](#rule-url)
[ULID](#rule-ulid)
[UUID](#rule-uuid)

</div>

#### 숫자(Number) 관련

<div class="collection-method-list" markdown="1">

[Between](#rule-between)
[Decimal](#rule-decimal)
[Different](#rule-different)
[Digits](#rule-digits)
[Digits Between](#rule-digits-between)
[Greater Than](#rule-gt)
[Greater Than Or Equal](#rule-gte)
[Integer](#rule-integer)
[Less Than](#rule-lt)
[Less Than Or Equal](#rule-lte)
[Max](#rule-max)
[Max Digits](#rule-max-digits)
[Min](#rule-min)
[Min Digits](#rule-min-digits)
[Multiple Of](#rule-multiple-of)
[Numeric](#rule-numeric)
[Same](#rule-same)
[Size](#rule-size)

</div>

#### 배열(Array) 관련

<div class="collection-method-list" markdown="1">

[Array](#rule-array)
[Between](#rule-between)
[Contains](#rule-contains)
[Distinct](#rule-distinct)
[In Array](#rule-in-array)
[List](#rule-list)
[Max](#rule-max)
[Min](#rule-min)
[Size](#rule-size)

</div>

#### 날짜(Date) 관련

<div class="collection-method-list" markdown="1">

[After](#rule-after)
[After Or Equal](#rule-after-or-equal)
[Before](#rule-before)
[Before Or Equal](#rule-before-or-equal)
[Date](#rule-date)
[Date Equals](#rule-date-equals)
[Date Format](#rule-date-format)
[Different](#rule-different)
[Timezone](#rule-timezone)

</div>

#### 파일(File) 관련

<div class="collection-method-list" markdown="1">

[Between](#rule-between)
[Dimensions](#rule-dimensions)
[Extensions](#rule-extensions)
[File](#rule-file)
[Image](#rule-image)
[Max](#rule-max)
[MIME Types](#rule-mimetypes)
[MIME Type By File Extension](#rule-mimes)
[Size](#rule-size)

</div>

#### 데이터베이스(Database) 관련

<div class="collection-method-list" markdown="1">

[Exists](#rule-exists)
[Unique](#rule-unique)

</div>

#### 유틸리티(Utilities)

<div class="collection-method-list" markdown="1">

[Bail](#rule-bail)
[Exclude](#rule-exclude)
[Exclude If](#rule-exclude-if)
[Exclude Unless](#rule-exclude-unless)
[Exclude With](#rule-exclude-with)
[Exclude Without](#rule-exclude-without)
[Filled](#rule-filled)
[Missing](#rule-missing)
[Missing If](#rule-missing-if)
[Missing Unless](#rule-missing-unless)
[Missing With](#rule-missing-with)
[Missing With All](#rule-missing-with-all)
[Nullable](#rule-nullable)
[Present](#rule-present)
[Present If](#rule-present-if)
[Present Unless](#rule-present-unless)
[Present With](#rule-present-with)
[Present With All](#rule-present-with-all)
[Prohibited](#rule-prohibited)
[Prohibited If](#rule-prohibited-if)
[Prohibited Unless](#rule-prohibited-unless)
[Prohibits](#rule-prohibits)
[Required](#rule-required)
[Required If](#rule-required-if)
[Required If Accepted](#rule-required-if-accepted)
[Required If Declined](#rule-required-if-declined)
[Required Unless](#rule-required-unless)
[Required With](#rule-required-with)
[Required With All](#rule-required-with-all)
[Required Without](#rule-required-without)
[Required Without All](#rule-required-without-all)
[Required Array Keys](#rule-required-array-keys)
[Sometimes](#validating-when-present)

</div>

<a name="rule-accepted"></a>
#### accepted

해당 필드는 `"yes"`, `"on"`, `1`, `"1"`, `true`, `"true"` 중 하나여야 합니다. 주로 "이용 약관 동의"와 같은 필드의 유효성 검증에 사용됩니다.

<a name="rule-accepted-if"></a>
#### accepted_if:anotherfield,value,...

지정한 다른 필드가 특정 값과 같을 때, 해당 필드는 `"yes"`, `"on"`, `1`, `"1"`, `true`, `"true"` 중 하나여야 합니다. 역시 "이용 약관 동의" 등 상황별 필드 검증에 사용하면 좋습니다.

<a name="rule-active-url"></a>
#### active_url

해당 필드는 유효한 A 또는 AAAA 레코드를 가지고 있어야 하며, 이는 PHP의 `dns_get_record` 함수로 확인합니다. 제공된 URL의 호스트명은 `parse_url` PHP 함수로 추출된 뒤, `dns_get_record`에 전달됩니다.

<a name="rule-after"></a>
#### after:_date_

해당 필드는 주어진 날짜 이후의 값이어야 합니다. 날짜는 `strtotime` PHP 함수로 변환되어 유효한 `DateTime` 인스턴스로 처리됩니다.

```
'start_date' => 'required|date|after:tomorrow'
```

`strtotime`으로 평가할 날짜 문자열 대신, 비교 대상으로 다른 필드를 지정할 수도 있습니다.

```
'finish_date' => 'required|date|after:start_date'
```

더 편리하게 날짜 기반 규칙을 만들고 싶다면, 유창한(Fluent) `date` 규칙 빌더를 사용할 수 있습니다.

```
use Illuminate\Validation\Rule;

'start_date' => [
    'required',
    Rule::date()->after(today()->addDays(7)),
],
```

`afterToday`와 `todayOrAfter` 메서드를 이용하면 오늘 이후, 또는 오늘 또는 이후 날짜여야 함을 좀 더 쉽게 표현할 수 있습니다.

```
'start_date' => [
    'required',
    Rule::date()->afterToday(),
],
```

<a name="rule-after-or-equal"></a>

#### after_or_equal:_date_

유효성 검사가 진행되는 필드는 지정된 날짜와 같거나 이후여야 합니다. 자세한 내용은 [after](#rule-after) 규칙을 참고하십시오.

편의를 위해, 날짜 기반 규칙은 유창한 `date` 규칙 빌더를 사용하여 생성할 수 있습니다.

```
use Illuminate\Validation\Rule;

'start_date' => [
    'required',
    Rule::date()->afterOrEqual(today()->addDays(7)),
],
```

<a name="rule-alpha"></a>
#### alpha

유효성 검사가 진행되는 필드는 [`\p{L}`](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AL%3A%5D&g=&i=)와 [`\p{M}`](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AM%3A%5D&g=&i=)에 포함된 유니코드 알파벳 문자만으로 이루어져 있어야 합니다.

ASCII 범위(`a-z`, `A-Z`)의 문자로만 검증을 제한하려면, 아래와 같이 `ascii` 옵션을 규칙에 전달할 수 있습니다.

```php
'username' => 'alpha:ascii',
```

<a name="rule-alpha-dash"></a>
#### alpha_dash

유효성 검사가 진행되는 필드는 [`\p{L}`](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AL%3A%5D&g=&i=), [`\p{M}`](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AM%3A%5D&g=&i=), [`\p{N}`](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AN%3A%5D&g=&i=)에 해당하는 유니코드 영숫자 문자 또는 ASCII 대시(`-`), 언더스코어(`_`)로만 구성되어야 합니다.

ASCII 범위(`a-z`, `A-Z`)의 문자로만 제한하려면 `ascii` 옵션을 사용할 수 있습니다.

```php
'username' => 'alpha_dash:ascii',
```

<a name="rule-alpha-num"></a>
#### alpha_num

유효성 검사가 진행되는 필드는 [`\p{L}`](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AL%3A%5D&g=&i=), [`\p{M}`](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AM%3A%5D&g=&i=), [`\p{N}`](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AN%3A%5D&g=&i=)에 해당하는 유니코드 영숫자 문자만 허용됩니다.

ASCII 범위(`a-z`, `A-Z`)로 한정하고 싶다면 아래와 같이 `ascii` 옵션을 지정할 수 있습니다.

```php
'username' => 'alpha_num:ascii',
```

<a name="rule-array"></a>
#### array

유효성 검사가 진행되는 필드는 PHP `array` 타입이어야 합니다.

`array` 규칙에 추가 값을 전달하면, 입력된 배열의 각 키는 규칙에 지정된 값 목록 중에 반드시 존재해야 합니다. 아래 예시에서 입력 배열의 `admin` 키는 `array` 규칙에 지정된 목록에 포함되어있지 않으므로 유효하지 않습니다.

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

일반적으로, 배열에 허용되는 키는 항상 명시적으로 지정하는 것이 좋습니다.

<a name="rule-ascii"></a>
#### ascii

유효성 검사가 진행되는 필드는 7비트 ASCII 문자로만 구성되어 있어야 합니다.

<a name="rule-bail"></a>
#### bail

해당 필드에서 첫 번째 유효성 검사 실패가 발생하면 이후의 검사를 중단합니다.

`bail` 규칙은 특정 필드에만 적용되어, 해당 필드에서 유효성 검사가 실패했을 때만 후속 검사를 중단합니다. 반면, `stopOnFirstFailure` 메서드를 사용하면 모든 속성 중 하나라도 실패하면 전체 유효성 검사를 즉시 중단하게 할 수 있습니다.

```
if ($validator->stopOnFirstFailure()->fails()) {
    // ...
}
```

<a name="rule-before"></a>
#### before:_date_

유효성 검사가 진행되는 필드는 지정된 날짜 이전이어야 합니다. 날짜 값은 PHP의 `strtotime` 함수에 전달되어 유효한 `DateTime` 인스턴스로 변환됩니다. 또한, [`after`](#rule-after) 규칙과 마찬가지로 검증 대상인 다른 필드의 이름을 값으로 제공할 수도 있습니다.

날짜 기반 규칙 역시 유창한 `date` 규칙 빌더를 활용하여 생성할 수 있습니다.

```
use Illuminate\Validation\Rule;

'start_date' => [
    'required',
    Rule::date()->before(today()->subDays(7)),
],
```

`beforeToday` 및 `todayOrBefore` 메서드를 사용하면 검사 대상 날짜가 "오늘 이전" 또는 "오늘 또는 이전"임을 더욱 명확하게 표현할 수 있습니다.

```
'start_date' => [
    'required',
    Rule::date()->beforeToday(),
],
```

<a name="rule-before-or-equal"></a>
#### before_or_equal:_date_

유효성 검사가 진행되는 필드는 지정된 날짜와 같거나 이전이어야 합니다. 날짜 값은 PHP의 `strtotime` 함수에 전달되어 유효한 `DateTime` 인스턴스로 변환됩니다. 또한, [`after`](#rule-after) 규칙과 마찬가지로 검증 대상 필드의 이름을 값으로 제공할 수도 있습니다.

날짜 기반 규칙 역시 유창한 `date` 규칙 빌더를 활용하여 생성할 수 있습니다.

```
use Illuminate\Validation\Rule;

'start_date' => [
    'required',
    Rule::date()->beforeOrEqual(today()->subDays(7)),
],
```

<a name="rule-between"></a>
#### between:_min_,_max_

유효성 검사가 진행되는 필드는 _min_과 _max_ 사이(포함)의 크기를 가져야 합니다. 문자열, 숫자, 배열, 파일은 [`size`](#rule-size) 규칙과 같은 방식으로 평가됩니다.

<a name="rule-boolean"></a>
#### boolean

유효성 검사가 진행되는 필드는 불리언 값(boolean)으로 변환 가능해야 합니다. 허용되는 입력값은 `true`, `false`, `1`, `0`, `"1"`, `"0"`입니다.

<a name="rule-confirmed"></a>
#### confirmed

유효성 검사가 진행되는 필드는 `{field}_confirmation`이라는 이름의 일치하는 필드가 있어야 합니다. 예를 들어, 검사 대상 필드가 `password`라면 입력 데이터에 `password_confirmation` 필드가 반드시 존재해야 하고, 그 값이 같아야 합니다.

커스텀 확인 필드명을 지정할 수도 있습니다. 예를 들어, `confirmed:repeat_username`을 사용하면 해당 필드와 `repeat_username` 필드가 일치해야 합니다.

<a name="rule-contains"></a>
#### contains:_foo_,_bar_,...

유효성 검사가 진행되는 필드는 지정한 모든 파라미터 값을 포함하는 배열이어야 합니다.

<a name="rule-current-password"></a>
#### current_password

유효성 검사가 진행되는 필드는 인증된 사용자의 비밀번호와 일치해야 합니다. 규칙의 첫 번째 파라미터로 [인증 가드](/docs/11.x/authentication)를 지정할 수 있습니다.

```
'password' => 'current_password:api'
```

<a name="rule-date"></a>
#### date

유효성 검사가 진행되는 필드는 PHP의 `strtotime` 함수 기준으로 유효한(상대적인 값이 아닌) 날짜여야 합니다.

<a name="rule-date-equals"></a>
#### date_equals:_date_

유효성 검사가 진행되는 필드는 지정한 날짜와 동일해야 합니다. 날짜 값은 PHP의 `strtotime` 함수에 전달되어 유효한 `DateTime` 인스턴스로 변환됩니다.

<a name="rule-date-format"></a>
#### date_format:_format_,...

유효성 검사가 진행되는 필드는 지정한 _formats_ 중 하나와 동일한 형식이어야 합니다. 한 필드에 대해 `date` 또는 `date_format` 중 **하나만** 사용해야 합니다. 이 규칙은 PHP의 [DateTime](https://www.php.net/manual/en/class.datetime.php) 클래스에서 지원하는 모든 형식을 지원합니다.

편의를 위해 날짜 기반 규칙은 유창한 `date` 규칙 빌더로 생성할 수 있습니다.

```
use Illuminate\Validation\Rule;

'start_date' => [
    'required',
    Rule::date()->format('Y-m-d'),
],
```

<a name="rule-decimal"></a>
#### decimal:_min_,_max_

유효성 검사가 진행되는 필드는 숫자이어야 하며, 소수점 이하 자릿수가 지정한 개수여야 합니다.

```
// 소수점 이하 자릿수가 정확히 2자리(예: 9.99)이어야 함...
'price' => 'decimal:2'

// 소수점 이하 자릿수가 2~4자리여야 함...
'price' => 'decimal:2,4'
```

<a name="rule-declined"></a>
#### declined

유효성 검사가 진행되는 필드는 `"no"`, `"off"`, `0`, `"0"`, `false`, 또는 `"false"` 중 하나여야 합니다.

<a name="rule-declined-if"></a>
#### declined_if:anotherfield,value,...

유효성 검사가 진행되는 필드는, 또 다른 유효성 검사 대상 필드가 특정 값과 같을 때 `"no"`, `"off"`, `0`, `"0"`, `false`, 또는 `"false"` 중 하나여야 합니다.

<a name="rule-different"></a>
#### different:_field_

유효성 검사가 진행되는 필드는 _field_ 필드와 다른 값이어야 합니다.

<a name="rule-digits"></a>
#### digits:_value_

유효성 검사가 진행되는 정수(integer)는 정확히 _value_ 자리수여야 합니다.

<a name="rule-digits-between"></a>
#### digits_between:_min_,_max_

유효성 검사가 진행되는 정수(integer)의 자릿수는 _min_과 _max_ 사이(포함)여야 합니다.

<a name="rule-dimensions"></a>
#### dimensions

유효성 검사가 진행되는 파일은 규칙 파라미터로 지정된 이미지 크기 제한 조건을 충족하는 이미지여야 합니다.

```
'avatar' => 'dimensions:min_width=100,min_height=200'
```

사용 가능한 제약 조건은 다음과 같습니다: _min_width_, _max_width_, _min_height_, _max_height_, _width_, _height_, _ratio_.

_ratio_ 제약 조건은 너비를 높이로 나눈 값(비율)로 표현해야 하며, 분수(`3/2`) 또는 실수(`1.5`) 형태 모두 사용할 수 있습니다.

```
'avatar' => 'dimensions:ratio=3/2'
```

이 규칙은 인자가 많기 때문에, 보통 `Rule::dimensions` 메서드를 사용해서 유창하게 작성하는 것이 더 편리합니다.

```
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($data, [
    'avatar' => [
        'required',
        Rule::dimensions()
            ->maxWidth(1000)
            ->maxHeight(500)
            ->ratio(3 / 2),
    ],
]);
```

<a name="rule-distinct"></a>
#### distinct

배열을 검증할 때, 유효성 검사가 진행되는 각 필드는 중복된 값이 없어야 합니다.

```
'foo.*.id' => 'distinct'
```

`distinct`는 기본적으로 느슨한 비교(loose comparison)로 동작합니다. stricter(엄격한) 비교를 원하면 `strict` 파라미터를 추가하면 됩니다.

```
'foo.*.id' => 'distinct:strict'
```

대소문자 차이를 무시하려면, 검증 규칙 인자에 `ignore_case`를 추가하면 됩니다.

```
'foo.*.id' => 'distinct:ignore_case'
```

<a name="rule-doesnt-start-with"></a>
#### doesnt_start_with:_foo_,_bar_,...

유효성 검사가 진행되는 필드는 지정한 값들로 시작하지 않아야 합니다.

<a name="rule-doesnt-end-with"></a>
#### doesnt_end_with:_foo_,_bar_,...

유효성 검사가 진행되는 필드는 지정한 값들로 끝나지 않아야 합니다.

<a name="rule-email"></a>
#### email

유효성 검사가 진행되는 필드는 이메일 주소 형식이어야 합니다. 이 규칙은 이메일 주소의 유효성 검증을 위해 [`egulias/email-validator`](https://github.com/egulias/EmailValidator) 패키지를 사용합니다. 기본적으로 `RFCValidation` 검증기가 적용되지만, 다양한 검증 스타일을 추가로 적용할 수 있습니다.

```
'email' => 'email:rfc,dns'
```

위 예시는 `RFCValidation`과 `DNSCheckValidation` 두 가지 검증을 모두 적용합니다. 적용 가능한 모든 검증 스타일은 다음과 같습니다.

<div class="content-list" markdown="1">

- `rfc`: `RFCValidation` - RFC 5322 기준으로 이메일 주소를 검증합니다.
- `strict`: `NoRFCWarningsValidation` - RFC 5322에 따라 엄격하게 검증하며, 마지막에 마침표가 있거나 연속된 마침표가 있는 경우 거부합니다.
- `dns`: `DNSCheckValidation` - 이메일 도메인에 유효한 MX 레코드가 존재하는지 확인합니다.
- `spoof`: `SpoofCheckValidation` - 호모그래프(homograph)나 속이는 Unicode 문자가 포함되어 있지 않은지 확인합니다.
- `filter`: `FilterEmailValidation` - PHP의 `filter_var` 함수 기준으로 이메일이 유효한지 확인합니다.
- `filter_unicode`: `FilterEmailValidation::unicode()` - PHP의 `filter_var` 함수를 사용하되 일부 Unicode 문자를 허용하여 이메일이 유효한지 확인합니다.

</div>

이메일 검증 규칙 역시 유창한 규칙 빌더로 작성할 수 있습니다.

```php
use Illuminate\Validation\Rule;

$request->validate([
    'email' => [
        'required',
        Rule::email()
            ->rfcCompliant(strict: false)
            ->validateMxRecord()
            ->preventSpoofing()
    ],
]);
```

> [!WARNING]  
> `dns` 및 `spoof` 검증기는 PHP의 `intl` 확장(extension)이 필요합니다.

<a name="rule-ends-with"></a>
#### ends_with:_foo_,_bar_,...

유효성 검사가 진행되는 필드는 지정한 값들로 끝나야 합니다.

<a name="rule-enum"></a>
#### enum

`Enum` 규칙은 검사 대상 필드에 열거형(enum) 값이 유효하게 들어있는지 클래스 기반으로 판별합니다. `Enum` 규칙은 생성자 인자로 열거형 클래스명을 받으며, 원시 값을 검증할 경우에는 backed Enum을 지정해야 합니다.

```
use App\Enums\ServerStatus;
use Illuminate\Validation\Rule;

$request->validate([
    'status' => [Rule::enum(ServerStatus::class)],
]);
```

`Enum` 규칙의 `only`와 `except` 메서드를 사용하면 유효성 검사를 통과하는 enum 케이스를 제한할 수 있습니다.

```
Rule::enum(ServerStatus::class)
    ->only([ServerStatus::Pending, ServerStatus::Active]);

Rule::enum(ServerStatus::class)
    ->except([ServerStatus::Pending, ServerStatus::Active]);
```

`when` 메서드를 사용하면 조건에 따라 `Enum` 규칙을 동적으로 변경할 수 있습니다.

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

유효성 검사에 통과한 해당 필드는 `validate` 및 `validated` 메서드가 반환하는 요청 데이터에서 제외됩니다.

<a name="rule-exclude-if"></a>
#### exclude_if:_anotherfield_,_value_

`_anotherfield_` 필드가 `_value_`와 같을 경우, 해당 필드는 `validate` 및 `validated` 메서드가 반환하는 요청 데이터에서 제외됩니다.

복잡한 조건부 제외(conditional exclusion) 로직이 필요한 경우, `Rule::excludeIf` 메서드를 사용할 수 있습니다. 이 메서드는 불리언 값이나 클로저를 받을 수 있으며, 클로저는 해당 필드를 제외할지 판단해서 `true` 또는 `false`를 반환해야 합니다.

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

유효성 검사가 진행되는 필드는 `_anotherfield_` 필드가 `_value_`와 같지 않을 때 `validate` 및 `validated` 메서드가 반환하는 요청 데이터에서 제외됩니다. `_value_`가 `null`(`exclude_unless:name,null`)일 경우, 비교 대상 필드가 `null`이거나 요청 데이터에 존재하지 않으면 해당 필드는 제외됩니다.

<a name="rule-exclude-with"></a>
#### exclude_with:_anotherfield_

`_anotherfield_` 필드가 존재할 때, 유효성 검사가 진행되는 필드는 `validate` 및 `validated` 메서드가 반환하는 요청 데이터에서 제외됩니다.

<a name="rule-exclude-without"></a>
#### exclude_without:_anotherfield_

`_anotherfield_` 필드가 존재하지 않을 경우, 유효성 검사가 진행되는 필드는 `validate` 및 `validated` 메서드가 반환하는 요청 데이터에서 제외됩니다.

<a name="rule-exists"></a>
#### exists:_table_,_column_

유효성 검사가 진행되는 필드는 지정된 데이터베이스 테이블에 존재해야 합니다.

<a name="basic-usage-of-exists-rule"></a>
#### Exists 규칙의 기본 사용법

```
'state' => 'exists:states'
```

`column` 옵션을 지정하지 않으면 필드명이 자동으로 사용됩니다. 위 예시에서는 `states` 테이블의 `state` 컬럼에 요청 속성 값이 일치하는 레코드가 존재하는지 검증합니다.

<a name="specifying-a-custom-column-name"></a>
#### 커스텀 컬럼명 지정하기

검증 규칙에서 사용할 데이터베이스 컬럼명을 테이블명 뒤에 명시할 수 있습니다.

```
'state' => 'exists:states,abbreviation'
```

가끔 특정 데이터베이스 커넥션을 사용해야 할 경우, 테이블명 앞에 커넥션명을 붙여서 지정할 수 있습니다.

```
'email' => 'exists:connection.staff,email'
```

테이블명을 직접 지정하는 대신, Eloquent 모델명을 지정해서 사용할 수도 있습니다.

```
'user_id' => 'exists:App\Models\User,id'
```

`Rule` 클래스를 활용하면 커스텀 쿼리로 조건을 구성할 수 있고, `|`를 대신해 배열 형태로 규칙을 지정할 수도 있습니다.

```
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($data, [
    'email' => [
        'required',
        Rule::exists('staff')->where(function (Builder $query) {
            $query->where('account_id', 1);
        }),
    ],
]);
```

`Rule::exists` 메서드를 사용할 경우, 두 번째 인자로 컬럼명을 명시적으로 지정할 수 있습니다.

```
'state' => Rule::exists('states', 'abbreviation'),
```

<a name="rule-extensions"></a>
#### extensions:_foo_,_bar_,...

유효성 검사가 진행되는 파일은 지정된 확장자 중 하나를 가져야 합니다.

```
'photo' => ['required', 'extensions:jpg,png'],
```

> [!WARNING]  
> 파일의 확장자만으로 유효성을 검증해서는 안 됩니다. 이 규칙은 보통 [`mimes`](#rule-mimes)나 [`mimetypes`](#rule-mimetypes) 규칙과 함께 사용해야 합니다.

<a name="rule-file"></a>
#### file

유효성 검사가 진행되는 필드는 성공적으로 업로드된 파일이어야 합니다.

<a name="rule-filled"></a>
#### filled

유효성 검사가 진행되는 필드는 존재한다면 빈 값이 아니어야 합니다.

<a name="rule-gt"></a>
#### gt:_field_

유효성 검사가 진행되는 필드는 주어진 _field_ 또는 _value_보다 커야 합니다. 두 필드는 반드시 같은 타입이어야 하며, 문자열, 숫자, 배열, 파일은 [`size`](#rule-size) 규칙과 동일한 방식으로 평가됩니다.

<a name="rule-gte"></a>
#### gte:_field_

유효성 검사가 진행되는 필드는 주어진 _field_ 또는 _value_보다 크거나 같아야 합니다. 두 필드는 반드시 같은 타입이어야 하며, 문자열, 숫자, 배열, 파일은 [`size`](#rule-size) 규칙과 같은 방식으로 평가됩니다.

<a name="rule-hex-color"></a>
#### hex_color

유효성 검사가 진행되는 필드는 [16진수(hexadecimal)](https://developer.mozilla.org/en-US/docs/Web/CSS/hex-color) 형식의 유효한 색상 값이어야 합니다.

<a name="rule-image"></a>
#### image

유효성 검사가 진행되는 파일은 이미지 파일이어야 하며, 지원되는 포맷은 jpg, jpeg, png, bmp, gif, svg, webp입니다.

<a name="rule-in"></a>
#### in:_foo_,_bar_,...

유효성 검사가 진행되는 필드는 지정된 값 목록 안에 포함되어야 합니다. 이 규칙은 보통 배열을 `implode`해야 하기 때문에, `Rule::in` 메서드로 규칙을 유창하게 생성할 수 있습니다.

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

`in` 규칙을 `array` 규칙과 함께 사용하면, 입력 배열의 각 값이 반드시 `in` 규칙의 값 목록에 포함되어야 합니다. 아래 예시에서 입력 배열의 `LAS` 공항 코드는 제공한 목록에 없으므로 유효하지 않습니다.

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

유효성 검사가 진행되는 필드는 _anotherfield_ 필드의 값 목록 안에 존재해야 합니다.

<a name="rule-integer"></a>
#### integer

유효성 검사가 진행되는 필드는 정수여야 합니다.

> [!WARNING]  
> 이 유효성 검사 규칙은 입력 값이 실제로 "정수(integer)" 변수 타입인지 확인하지 않고, PHP의 `FILTER_VALIDATE_INT` 규칙에서 허용하는 타입인지만 검사합니다. 입력 값을 반드시 숫자인지 확인하려면 이 규칙을 [numeric 유효성 검사 규칙](#rule-numeric)과 함께 사용해야 합니다.

<a name="rule-ip"></a>

#### ip

유효성 검사를 수행하는 필드는 IP 주소여야 합니다.

<a name="ipv4"></a>
#### ipv4

유효성 검사를 수행하는 필드는 IPv4 주소여야 합니다.

<a name="ipv6"></a>
#### ipv6

유효성 검사를 수행하는 필드는 IPv6 주소여야 합니다.

<a name="rule-json"></a>
#### json

유효성 검사를 수행하는 필드는 올바른 JSON 문자열이어야 합니다.

<a name="rule-lt"></a>
#### lt:_field_

유효성 검사를 수행하는 필드는 지정된 _field_보다 작아야 합니다. 두 필드는 동일한 타입이어야 하며, 문자열, 숫자, 배열, 파일 모두 [`size`](#rule-size) 규칙과 동일한 방식으로 비교합니다.

<a name="rule-lte"></a>
#### lte:_field_

유효성 검사를 수행하는 필드는 지정된 _field_보다 작거나 같아야 합니다. 두 필드는 동일한 타입이어야 하며, 문자열, 숫자, 배열, 파일 모두 [`size`](#rule-size) 규칙과 동일한 방식으로 비교합니다.

<a name="rule-lowercase"></a>
#### lowercase

유효성 검사를 수행하는 필드는 모두 소문자여야 합니다.

<a name="rule-list"></a>
#### list

유효성 검사를 수행하는 필드는 리스트 형식의 배열이어야 합니다. 배열의 키가 0부터 `count($array) - 1`까지의 연속된 숫자일 경우, 리스트로 간주합니다.

<a name="rule-mac"></a>
#### mac_address

유효성 검사를 수행하는 필드는 MAC 주소여야 합니다.

<a name="rule-max"></a>
#### max:_value_

유효성 검사를 수행하는 필드는 _value_ 이하의 값이어야 합니다. 문자열, 숫자, 배열, 파일 모두 [`size`](#rule-size) 규칙과 같은 방식으로 평가됩니다.

<a name="rule-max-digits"></a>
#### max_digits:_value_

유효성 검사를 수행하는 정수 값은 최대 _value_자리까지 허용됩니다.

<a name="rule-mimetypes"></a>
#### mimetypes:_text/plain_,...

유효성 검사를 수행하는 파일은 지정된 MIME 타입 중 하나와 일치해야 합니다.

```
'video' => 'mimetypes:video/avi,video/mpeg,video/quicktime'
```

업로드된 파일의 MIME 타입 판정은 파일 내용을 실제로 읽어 프레임워크가 MIME 타입을 추측하는 방식으로 이루어지며, 클라이언트가 제공한 MIME 타입과 다를 수 있습니다.

<a name="rule-mimes"></a>
#### mimes:_foo_,_bar_,...

유효성 검사를 수행하는 파일은 명시한 확장자 중 하나에 해당하는 MIME 타입을 가져야 합니다.

```
'photo' => 'mimes:jpg,bmp,png'
```

확장자만 지정하면 되지만, 이 규칙은 실제로 파일의 내용을 읽어 MIME 타입을 추측하여 검사합니다. 확장자별 전체 MIME 타입 목록은 다음에서 확인할 수 있습니다.:

[https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types](https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types)

<a name="mime-types-and-extensions"></a>
#### MIME 타입과 확장자

이 유효성 검사 규칙은 사용자가 파일에 지정한 확장자와 실제 MIME 타입이 일치하는지까지 확인하지는 않습니다. 예를 들어, `mimes:png` 규칙을 사용하면 파일 내용이 올바른 PNG 이미지라면 파일명이 `photo.txt`여도 유효한 PNG 이미지로 간주됩니다. 파일명에 지정된 확장자까지 검증하려면 [`extensions`](#rule-extensions) 규칙을 사용하십시오.

<a name="rule-min"></a>
#### min:_value_

유효성 검사를 수행하는 필드는 최소 _value_ 이상의 값을 가져야 합니다. 문자열, 숫자, 배열, 파일 모두 [`size`](#rule-size) 규칙과 같은 방식으로 평가됩니다.

<a name="rule-min-digits"></a>
#### min_digits:_value_

유효성 검사를 수행하는 정수 값은 최소 _value_ 자리여야 합니다.

<a name="rule-multiple-of"></a>
#### multiple_of:_value_

유효성 검사를 수행하는 필드는 _value_의 배수여야 합니다.

<a name="rule-missing"></a>
#### missing

유효성 검사를 수행하는 필드는 입력 데이터에 존재해서는 안 됩니다.

<a name="rule-missing-if"></a>
#### missing_if:_anotherfield_,_value_,...

_ anotherfield_ 필드가 지정한 _value_ 중 하나와 같으면, 유효성 검사를 수행하는 필드는 존재해서는 안 됩니다.

<a name="rule-missing-unless"></a>
#### missing_unless:_anotherfield_,_value_

_ anotherfield_ 필드가 지정한 _value_ 중 하나와 같지 않으면, 유효성 검사를 수행하는 필드는 입력 데이터에 존재해서는 안 됩니다.

<a name="rule-missing-with"></a>
#### missing_with:_foo_,_bar_,...

명시된 다른 필드들 중 하나라도 존재할 경우에만, 유효성 검사를 수행하는 필드는 존재해서는 안 됩니다.

<a name="rule-missing-with-all"></a>
#### missing_with_all:_foo_,_bar_,...

명시된 모든 다른 필드가 모두 존재할 경우에만, 유효성 검사를 수행하는 필드는 존재해서는 안 됩니다.

<a name="rule-not-in"></a>
#### not_in:_foo_,_bar_,...

유효성 검사를 수행하는 필드는 지정된 값 목록에 포함되어서는 안 됩니다. `Rule::notIn` 메서드를 사용해 유동적으로 규칙을 생성할 수도 있습니다.

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

유효성 검사를 수행하는 필드는 지정한 정규표현식에 일치하지 않아야 합니다.

이 규칙은 내부적으로 PHP의 `preg_match` 함수를 사용합니다. 패턴은 `preg_match`에서 요구되는 형식, 즉 올바른 구분자(delimiter)를 포함해야 합니다. 예시: `'email' => 'not_regex:/^.+$/i'`.

> [!WARNING]  
> `regex` 또는 `not_regex` 패턴을 사용할 때 정규표현식에 `|` 문자가 포함될 경우, 유효성 검사 규칙을 파이프(`|`)로 이어붙이지 않고 배열 형태로 지정해야 할 수도 있습니다.

<a name="rule-nullable"></a>
#### nullable

유효성 검사를 수행하는 필드는 `null` 값을 가질 수 있습니다.

<a name="rule-numeric"></a>
#### numeric

유효성 검사를 수행하는 필드는 [숫자형(numeric)](https://www.php.net/manual/en/function.is-numeric.php)이어야 합니다.

<a name="rule-present"></a>
#### present

유효성 검사를 수행하는 필드는 입력 데이터에 반드시 존재해야 합니다.

<a name="rule-present-if"></a>
#### present_if:_anotherfield_,_value_,...

_ anotherfield_ 필드가 지정한 _value_ 중 하나와 같을 경우, 유효성 검사를 수행하는 필드는 존재해야 합니다.

<a name="rule-present-unless"></a>
#### present_unless:_anotherfield_,_value_

_ anotherfield_ 필드가 지정한 _value_ 중 하나와 같지 않을 경우, 유효성 검사를 수행하는 필드는 존재해야 합니다.

<a name="rule-present-with"></a>
#### present_with:_foo_,_bar_,...

명시된 다른 필드들 중 하나라도 존재하면, 유효성 검사를 수행하는 필드는 반드시 존재해야 합니다.

<a name="rule-present-with-all"></a>
#### present_with_all:_foo_,_bar_,...

명시된 모든 다른 필드가 모두 존재할 때만, 유효성 검사를 수행하는 필드는 반드시 존재해야 합니다.

<a name="rule-prohibited"></a>
#### prohibited

유효성 검사를 수행하는 필드는 누락되어 있거나, 비어 있어야 합니다. 필드가 "비어 있다"로 간주되는 기준은 다음과 같습니다.

<div class="content-list" markdown="1">

- 값이 `null`인 경우
- 값이 빈 문자열인 경우
- 값이 빈 배열이거나, 빈 `Countable` 객체인 경우
- 빈 경로를 가진 업로드 파일인 경우

</div>

<a name="rule-prohibited-if"></a>
#### prohibited_if:_anotherfield_,_value_,...

_ anotherfield_ 필드가 지정한 _value_ 중 하나와 같을 경우, 유효성 검사를 수행하는 필드는 누락되어 있거나 비어 있어야 합니다. "비어 있다"의 기준은 다음과 같습니다.

<div class="content-list" markdown="1">

- 값이 `null`인 경우
- 값이 빈 문자열인 경우
- 값이 빈 배열이거나, 빈 `Countable` 객체인 경우
- 빈 경로를 가진 업로드 파일인 경우

</div>

복잡한 조건부 금지 규칙이 필요하다면 `Rule::prohibitedIf` 메서드를 사용할 수 있습니다. 이 메서드는 불리언 또는 클로저를 인자로 받을 수 있습니다. 클로저를 사용할 경우, true 또는 false를 반환하여 필드의 금지 여부를 결정합니다.

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

_ anotherfield_ 필드가 지정한 _value_ 중 하나와 같지 않을 경우, 유효성 검사를 수행하는 필드는 누락되어 있거나 비어 있어야 합니다. "비어 있다"의 기준은 다음과 같습니다.

<div class="content-list" markdown="1">

- 값이 `null`인 경우
- 값이 빈 문자열인 경우
- 값이 빈 배열이거나, 빈 `Countable` 객체인 경우
- 빈 경로를 가진 업로드 파일인 경우

</div>

<a name="rule-prohibits"></a>
#### prohibits:_anotherfield_,...

유효성 검사를 수행하는 필드가 존재하며 비어 있지 않다면, _anotherfield_로 명시된 모든 필드는 누락 또는 비어 있어야 합니다. "비어 있다"의 기준은 다음과 같습니다.

<div class="content-list" markdown="1">

- 값이 `null`인 경우
- 값이 빈 문자열인 경우
- 값이 빈 배열이거나, 빈 `Countable` 객체인 경우
- 빈 경로를 가진 업로드 파일인 경우

</div>

<a name="rule-regex"></a>
#### regex:_pattern_

유효성 검사를 수행하는 필드는 지정된 정규표현식에 일치해야 합니다.

이 규칙은 내부적으로 PHP의 `preg_match` 함수를 사용합니다. 패턴은 `preg_match`에서 요구되는 형식, 즉 올바른 구분자(delimiter)를 포함해야 합니다. 예시: `'email' => 'regex:/^.+@.+$/i'`.

> [!WARNING]  
> `regex` 또는 `not_regex` 패턴을 사용할 때, 정규표현식에 `|` 문자가 포함되어 있다면 파이프(`|`)로 연결하는 대신 배열 형태로 규칙을 작성해야 할 수도 있습니다.

<a name="rule-required"></a>
#### required

유효성 검사를 수행하는 필드는 입력 데이터에 반드시 존재하며 비어 있지 않아야 합니다. 필드가 "비어 있다"로 간주되는 기준은 다음과 같습니다.

<div class="content-list" markdown="1">

- 값이 `null`인 경우
- 값이 빈 문자열인 경우
- 값이 빈 배열이거나, 빈 `Countable` 객체인 경우
- 경로가 없는 업로드 파일인 경우

</div>

<a name="rule-required-if"></a>
#### required_if:_anotherfield_,_value_,...

_ anotherfield_ 필드가 지정한 _value_ 중 하나와 같을 경우, 유효성 검사를 수행하는 필드는 반드시 존재하며 비어 있지 않아야 합니다.

`required_if` 규칙에 대해 더 복잡한 조건을 사용하려면 `Rule::requiredIf` 메서드를 활용할 수 있습니다. 이 메서드는 불리언 또는 클로저를 인자로 받으며, 클로저가 true 또는 false를 반환하면 해당 값에 따라 필드의 필수 여부를 결정합니다.

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

_ anotherfield_ 필드의 값이 `"yes"`, `"on"`, `1`, `"1"`, `true`, `"true"` 중 하나와 같을 경우, 유효성 검사를 수행하는 필드는 반드시 존재하며 비어 있지 않아야 합니다.

<a name="rule-required-if-declined"></a>
#### required_if_declined:_anotherfield_,...

_ anotherfield_ 필드의 값이 `"no"`, `"off"`, `0`, `"0"`, `false`, `"false"` 중 하나와 같을 경우, 유효성 검사를 수행하는 필드는 반드시 존재하며 비어 있지 않아야 합니다.

<a name="rule-required-unless"></a>
#### required_unless:_anotherfield_,_value_,...

_ anotherfield_ 필드가 지정한 _value_ 중 하나와 같지 않은 경우, 유효성 검사를 수행하는 필드는 반드시 존재하며 비어 있지 않아야 합니다. 또한 _anotherfield_는 _value_가 `null`인 경우를 제외하고 요청 데이터에 반드시 존재해야 합니다. _value_에 `null`이 지정되면(`required_unless:name,null`), 비교 대상 필드가 `null`이거나 요청 데이터에서 누락된 경우에만 검증 대상 필드는 필수가 아닙니다.

<a name="rule-required-with"></a>
#### required_with:_foo_,_bar_,...

명시된 다른 필드들 중 하나라도 존재하며 비어 있지 않은 경우에만, 유효성 검사를 수행하는 필드는 반드시 존재하며 비어 있지 않아야 합니다.

<a name="rule-required-with-all"></a>
#### required_with_all:_foo_,_bar_,...

명시된 모든 필드가 모두 존재하고 비어 있지 않을 경우에만, 유효성 검사를 수행하는 필드는 반드시 존재하며 비어 있지 않아야 합니다.

<a name="rule-required-without"></a>
#### required_without:_foo_,_bar_,...

명시된 다른 필드 중 하나라도 비어 있거나 존재하지 않는 경우에만, 유효성 검사를 수행하는 필드는 반드시 존재하며 비어 있지 않아야 합니다.

<a name="rule-required-without-all"></a>
#### required_without_all:_foo_,_bar_,...

명시된 모든 다른 필드가 모두 비어 있거나 존재하지 않을 경우에만, 유효성 검사를 수행하는 필드는 반드시 존재하며 비어 있지 않아야 합니다.

<a name="rule-required-array-keys"></a>
#### required_array_keys:_foo_,_bar_,...

유효성 검사를 수행하는 필드는 배열이어야 하며, 지정된 키를 최소한 포함해야 합니다.

<a name="rule-same"></a>
#### same:_field_

지정한 _field_의 값이 유효성 검사를 수행하는 필드의 값과 같아야 합니다.

<a name="rule-size"></a>
#### size:_value_

유효성 검사를 수행하는 필드는 지정된 _value_와 크기가 정확히 일치해야 합니다. 문자열에서는 _value_가 글자 수에 해당합니다. 숫자라면 _value_가 정수 값이 되며(`numeric` 또는 `integer` 규칙이 같이 적용되어야 함), 배열이라면 _value_가 배열의 `count` 값, 파일에서는 _value_가 파일 크기(킬로바이트 단위)가 됩니다. 예시는 다음과 같습니다.

```
// 문자열이 정확히 12글자인지 확인...
'title' => 'size:12';

// 제공된 정수가 10과 같은지 확인...
'seats' => 'integer|size:10';

// 배열이 정확히 5개의 요소를 가지는지 확인...
'tags' => 'array|size:5';

// 업로드된 파일이 정확히 512킬로바이트인지 확인...
'image' => 'file|size:512';
```

<a name="rule-starts-with"></a>
#### starts_with:_foo_,_bar_,...

유효성 검사를 수행하는 필드는 지정된 값 중 하나로 시작해야 합니다.

<a name="rule-string"></a>
#### string

유효성 검사를 수행하는 필드는 문자열이어야 합니다. 만약 이 필드가 `null` 값도 허용해야 한다면, `nullable` 규칙을 같이 지정하면 됩니다.

<a name="rule-timezone"></a>
#### timezone

유효성 검사를 수행하는 필드는 `DateTimeZone::listIdentifiers` 메서드에 따라 유효한 타임존 식별자여야 합니다.

이 유효성 검사 규칙에는 [`DateTimeZone::listIdentifiers` 메서드에서 사용할 수 있는 인자 목록](https://www.php.net/manual/en/datetimezone.listidentifiers.php)을 추가로 전달할 수 있습니다.

```
'timezone' => 'required|timezone:all';

'timezone' => 'required|timezone:Africa';

'timezone' => 'required|timezone:per_country,US';
```

<a name="rule-unique"></a>
#### unique:_table_,_column_

유효성 검사를 수행하는 필드 값은 지정된 데이터베이스 테이블 내에 존재하지 않아야 합니다.

**사용자 지정 테이블/컬럼명 지정하기:**

테이블명을 직접 지정하는 대신, Eloquent 모델을 지정하여 해당 모델의 테이블명을 자동으로 사용하도록 할 수 있습니다.

```
'email' => 'unique:App\Models\User,email_address'
```

`column` 옵션을 사용해 필드의 DB 컬럼명을 명시적으로 지정할 수 있습니다. 이 옵션을 생략하면 검증 대상 필드의 이름이 그대로 컬럼명으로 사용됩니다.

```
'email' => 'unique:users,email_address'
```

**사용자 지정 데이터베이스 커넥션 지정하기**

Validator가 쿼리를 실행할 때 별도의 커넥션을 사용해야 할 때, 연결명(connection name)을 테이블명 앞에 붙여서 지정할 수 있습니다.

```
'email' => 'unique:connection.users,email_address'
```

**unique 규칙에서 특정 ID 무시하기:**

때로는 고유성 검증을 할 때, 지정한 ID를 무시하고 싶을 때도 있습니다. 예를 들어 유저가 이름, 이메일, 위치 정보를 수정하는 "프로필 업데이트" 화면에서는, 이메일의 고유성도 검증하고자 하겠지만, 유저가 이름만 바꾸고 이메일을 변경하지 않은 경우에는 자신의 기존 이메일이 이미 데이터베이스에 있어서 검증에 실패하는 일이 없어야 합니다.

이런 경우, validator에 사용자의 ID를 무시하라고 명령할 수 있습니다. 이를 위해 `Rule` 클래스를 사용해 규칙을 유연하게 작성할 수 있습니다. 이때에는 규칙들을 파이프(`|`)로 묶지 말고 배열로 지정하십시오.

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
> 사용자가 조작할 수 있는 입력값을 절대 `ignore` 메서드에 전달해서는 안 됩니다. 오직 시스템에서 자동 생성되는 고유 ID(예: 자동 증가 PK 또는 Eloquent 모델 인스턴스의 UUID 등)만 전달해야 하며, 그렇지 않으면 SQL 인젝션 공격에 취약해질 수 있습니다.

모델 키 값을 직접 넘기는 대신, 모델 인스턴스 전체를 `ignore` 메서드에 전달할 수도 있습니다. 이 경우 라라벨이 자동으로 PK 값을 추출합니다.

```
Rule::unique('users')->ignore($user)
```

테이블의 기본 키 컬럼명이 `id`가 아닌 경우, `ignore` 메서드 호출 시 컬럼명을 명시할 수 있습니다.

```
Rule::unique('users')->ignore($user->id, 'user_id')
```

기본적으로 `unique` 규칙은 검증 대상 필드명과 같은 컬럼명에 대해 고유성 검사를 진행합니다. 하지만 `unique` 메서드 두 번째 인자로 다른 컬럼명을 전달할 수도 있습니다.

```
Rule::unique('users', 'email_address')->ignore($user->id)
```

**추가 Where 조건 지정하기:**

쿼리에 추가적인 조건을 붙이고 싶을 때는 `where` 메서드를 이용할 수 있습니다. 예를 들어 `account_id` 컬럼이 1인 레코드만 조회 대상으로 한정하려면 다음과 같이 코드를 작성합니다.

```
'email' => Rule::unique('users')->where(fn (Builder $query) => $query->where('account_id', 1))
```

**unique 검사 시 소프트 삭제된(soft deleted) 레코드 무시하기:**

고유성 검사는 기본적으로 소프트 삭제된 레코드도 검사 대상에 포함시킵니다. 소프트 삭제된 레코드를 제외하려면 `withoutTrashed` 메서드를 호출합니다.

```
Rule::unique('users')->withoutTrashed();
```

소프트 삭제 컬럼명이 기본값인 `deleted_at`이 아닐 경우, `withoutTrashed` 호출 시 컬럼명을 지정하세요.

```
Rule::unique('users')->withoutTrashed('was_deleted_at');
```

<a name="rule-uppercase"></a>
#### uppercase

유효성 검사를 수행하는 필드는 모두 대문자여야 합니다.

<a name="rule-url"></a>
#### url

유효성 검사를 수행하는 필드는 올바른 URL이어야 합니다.

허용할 URL 프로토콜을 제한하려면 다음과 같이 규칙에 프로토콜명을 추가하면 됩니다.

```php
'url' => 'url:http,https',

'game' => 'url:minecraft,steam',
```

<a name="rule-ulid"></a>
#### ulid

유효성 검사를 수행하는 필드는 [ULID(Universally Unique Lexicographically Sortable Identifier)](https://github.com/ulid/spec)이어야 합니다.

<a name="rule-uuid"></a>
#### uuid

유효성 검사를 수행하는 필드는 RFC 9562(버전 1, 3, 4, 5, 6, 7, 8) 규격의 UUID(범용 고유 식별자)이어야 합니다.

<a name="conditionally-adding-rules"></a>
## 조건부 규칙 추가

<a name="skipping-validation-when-fields-have-certain-values"></a>
#### 특정 필드 값에 따라 유효성 검사 생략하기

다른 필드 값에 따라 특정 필드의 유효성 검사를 생략하고자 할 때는 `exclude_if` 유효성 검사 규칙을 사용할 수 있습니다. 예를 들어, `has_appointment` 필드가 `false`일 경우에는 `appointment_date`와 `doctor_name` 필드는 아예 검증하지 않습니다.

```
use Illuminate\Support\Facades\Validator;

$validator = Validator::make($data, [
    'has_appointment' => 'required|boolean',
    'appointment_date' => 'exclude_if:has_appointment,false|required|date',
    'doctor_name' => 'exclude_if:has_appointment,false|required|string',
]);
```

반대로, `exclude_unless` 규칙을 사용하면 다른 필드가 특정 값일 때만 검증을 생략할 수 있습니다.

```
$validator = Validator::make($data, [
    'has_appointment' => 'required|boolean',
    'appointment_date' => 'exclude_unless:has_appointment,true|required|date',
    'doctor_name' => 'exclude_unless:has_appointment,true|required|string',
]);
```

<a name="validating-when-present"></a>
#### 필드가 존재할 때만 유효성 검증하기

특정 필드가 데이터에 포함되어 있을 때만 유효성 검사를 수행하고 싶은 경우가 있습니다. 이 땐 규칙 목록에 `sometimes` 규칙을 추가하면 됩니다.

```
$validator = Validator::make($data, [
    'email' => 'sometimes|required|email',
]);
```

위 예시에서는 `$data` 배열에 `email` 필드가 있을 때만 유효성 검사를 수행합니다.

> [!NOTE]  
> 항상 존재해야 하지만 비어 있을 수 있는 필드를 검증하는 경우, [옵션 필드에 대한 안내](#a-note-on-optional-fields)를 참고하세요.

<a name="complex-conditional-validation"></a>
#### 복잡한 조건의 유효성 검사

다른 필드의 값이 특정 조건을 만족할 때만 규칙을 추가하는 등, 더 복잡한 조건부 유효성 검사가 필요할 수도 있습니다. 예를 들어, 다른 필드의 값이 100보다 클 때만 특정 필드를 필수로 지정하거나, 두 필드가 동시에 특정 값을 가져야만 하는 조건을 지정할 수 있습니다. 이런 규칙들을 쉽게 만들 수 있도록, 변경되지 않는 _기본(static)_ 규칙들로 우선 `Validator` 인스턴스를 생성합니다.

```
use Illuminate\Support\Facades\Validator;

$validator = Validator::make($request->all(), [
    'email' => 'required|email',
    'games' => 'required|numeric',
]);
```

예를 들어, 게임 수집가가 100개 이상의 게임을 소유하면 그 이유를 설명하게 하고 싶은 경우를 생각해봅시다. (예: 본인이 중고 게임 판매점을 운영하거나, 단순 수집 취미일 수 있음) 이 조건부 필수 조건은 `Validator` 인스턴스의 `sometimes` 메서드로 추가할 수 있습니다.

```
use Illuminate\Support\Fluent;

$validator->sometimes('reason', 'required|max:500', function (Fluent $input) {
    return $input->games >= 100;
});
```

`sometimes` 메서드의 첫 번째 인자는 조건부로 유효성 검사를 추가할 필드명이고, 두 번째 인자는 적용할 규칙이며, 세 번째 인자로 전달되는 클로저가 true를 반환할 경우 규칙이 추가됩니다. 이 메서드를 활용하면 여러 필드에 조건부 유효성 규칙을 한 번에 추가할 수도 있습니다.

```
$validator->sometimes(['reason', 'cost'], 'required', function (Fluent $input) {
    return $input->games >= 100;
});
```

> [!NOTE]  
> 클로저에 전달되는 `$input` 파라미터는 `Illuminate\Support\Fluent`의 인스턴스이며, 검증 대상 입력값 및 파일에 접근하는 데 사용할 수 있습니다.

<a name="complex-conditional-array-validation"></a>

#### 복잡한 조건의 배열 유효성 검증

때로는, 동일한 중첩 배열 내에서 인덱스를 모르는 다른 필드를 기반으로 특정 필드의 유효성을 검사하고 싶을 수 있습니다. 이럴 때는 클로저(closure)가 두 번째 인자를 받을 수 있도록 설정하면 되며, 이 두 번째 인자는 현재 검증 중인 배열 아이템 자체가 됩니다.

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

클로저로 전달되는 `$input` 파라미터와 마찬가지로, `$item` 파라미터도 해당 속성 데이터가 배열일 경우에는 `Illuminate\Support\Fluent` 인스턴스입니다. 배열이 아닌 경우에는 문자열이 전달됩니다.

<a name="validating-arrays"></a>
## 배열 유효성 검증

[`array` 유효성 검사 규칙 문서](#rule-array)에서 설명한 것처럼, `array` 규칙은 허용되는 배열 키 목록을 받을 수 있습니다. 배열에 이외의 키가 있으면 검증은 실패합니다.

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

일반적으로, 배열에 허용할 키를 항상 명시하는 것이 좋습니다. 그렇지 않으면, 검증기의 `validate` 및 `validated` 메서드는 해당 배열 전체와 모든 배열 키(다른 중첩 배열 유효성 규칙으로 검증되지 않은 키까지 포함)를 반환하게 됩니다.

<a name="validating-nested-array-input"></a>
### 중첩 배열 입력값 유효성 검증

중첩 배열 기반의 폼 입력값 검증도 어렵지 않습니다. 배열 안의 속성에 대해 "점 표기법(dot notation)"을 사용해 검증 규칙을 지정할 수 있습니다. 예를 들어, HTTP 요청에 `photos[profile]` 필드가 포함된 경우 다음과 같이 검증할 수 있습니다.

```
use Illuminate\Support\Facades\Validator;

$validator = Validator::make($request->all(), [
    'photos.profile' => 'required|image',
]);
```

또한 배열의 각 요소에 대해 각각 따로 유효성 검증을 할 수도 있습니다. 예를 들어, 전달받은 배열 입력 필드 내 각 이메일이 모두 고유함을 검사하려면 다음과 같이 작성할 수 있습니다.

```
$validator = Validator::make($request->all(), [
    'person.*.email' => 'email|unique:users',
    'person.*.first_name' => 'required_with:person.*.last_name',
]);
```

마찬가지로, [언어 파일에서 커스텀 검증 메시지](#custom-messages-for-specific-attributes)를 지정할 때도 `*` 문자를 사용할 수 있어, 배열 기반 필드를 위해 하나의 검증 메시지를 쉽게 재사용할 수 있습니다.

```
'custom' => [
    'person.*.email' => [
        'unique' => '각 사람마다 고유한 이메일 주소가 있어야 합니다.',
    ]
],
```

<a name="accessing-nested-array-data"></a>
#### 중첩 배열 데이터 접근

검증 규칙을 속성에 할당할 때, 특정 중첩 배열 요소의 값을 참조해야 하는 경우가 있습니다. 이럴 때에는 `Rule::forEach` 메서드를 사용할 수 있습니다. `forEach` 메서드는 검증 중인 배열 속성의 각 요소마다 클로저를 호출하는데, 이 클로저는 해당 속성의 값과 명확하게 완전한 속성명을 인자로 받습니다. 반환값으로는 그 배열 요소에 적용할 규칙의 배열을 반환해야 합니다.

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
### 에러 메시지에서 인덱스와 위치 활용

배열을 검증할 때, 특정 요소가 에러일 때 표시되는 메시지에 해당 요소의 인덱스나 위치를 포함하고 싶을 수 있습니다. 이럴 때는 [커스텀 검증 메시지](#manual-customizing-the-error-messages)에서 `:index`(0부터 시작)와 `:position`(1부터 시작) 플레이스홀더를 사용할 수 있습니다.

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
    'photos.*.description.required' => '사진 #:position의 설명을 입력해주세요.',
]);
```

위 예시에서는 검증에 실패하면 _"사진 #2의 설명을 입력해주세요."_ 와 같은 에러 메시지가 표시됩니다.

필요하다면, 더 깊게 중첩된 배열에서 `second-index`, `second-position`, `third-index`, `third-position` 등과 같이 활용할 수도 있습니다.

```
'photos.*.attributes.*.string' => '사진 #:second-position의 속성이 올바르지 않습니다.',
```

<a name="validating-files"></a>
## 파일 유효성 검증

라라벨은 업로드된 파일을 검증하기 위한 다양한 규칙(`mimes`, `image`, `min`, `max` 등)을 제공합니다. 개별 파일 검증 규칙을 직접 지정해도 되지만, 라라벨에서 제공하는 플루언트(flunt) 방식의 파일 유효성 규칙 빌더를 사용하면 더 편리합니다.

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

<a name="validating-files-file-types"></a>
#### 파일 유형 검증

`types` 메서드를 사용할 때는 확장자만 지정하면 되지만, 이 메서드는 실제로는 파일의 콘텐츠를 읽어서 MIME 타입을 추측하여 검증합니다. 전체 MIME 타입과 그에 대응되는 확장자의 목록은 다음 링크에서 확인할 수 있습니다.

[https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types](https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types)

<a name="validating-files-file-sizes"></a>
#### 파일 크기 검증

편의를 위해 최소 및 최대 파일 크기를 문자열로 지정할 수 있으며, 이때 파일 크기 단위 접미사도 사용할 수 있습니다. 지원되는 접미사는 `kb`, `mb`, `gb`, `tb`입니다.

```php
File::types(['mp3', 'wav'])
    ->min('1kb')
    ->max('10mb');
```

<a name="validating-files-image-files"></a>
#### 이미지 파일 검증

업로드된 파일이 이미지임을 검증하려면 `File` 규칙의 `image` 생성자 메서드를 사용할 수 있습니다. `File::image()` 규칙은 jpg, jpeg, png, bmp, gif, svg, webp 중 하나임을 검사합니다.

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

Validator::validate($input, [
    'photo' => [
        'required',
        File::image(),
    ],
]);
```

<a name="validating-files-image-dimensions"></a>
#### 이미지 크기(가로·세로) 검증

이미지의 크기를 검증할 수도 있습니다. 예를 들어, 업로드된 이미지가 최소한 1000픽셀 너비와 500픽셀 높이를 가져야 한다면, `dimensions` 규칙을 사용하면 됩니다.

```php
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

File::image()->dimensions(
    Rule::dimensions()
        ->maxWidth(1000)
        ->maxHeight(500)
)
```

> [!NOTE]  
> 이미지 크기 검증에 대한 더 자세한 내용은 [dimensions 규칙 문서](#rule-dimensions)를 참고하시기 바랍니다.

<a name="validating-passwords"></a>
## 비밀번호 유효성 검증

비밀번호의 복잡도를 충분히 보장하려면, 라라벨의 `Password` 규칙 객체를 사용할 수 있습니다.

```
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

$validator = Validator::make($request->all(), [
    'password' => ['required', 'confirmed', Password::min(8)],
]);
```

`Password` 규칙 객체를 통해 애플리케이션에서 요구하는 비밀번호 복잡도 설정(예: 최소 한 개의 문자, 숫자, 특수문자, 대·소문자 혼합 등)을 손쉽게 커스터마이즈할 수 있습니다.

```
// 최소 8자 이상...
Password::min(8)

// 최소 하나의 문자를 포함...
Password::min(8)->letters()

// 대문자와 소문자가 각각 최소 한 개씩 포함...
Password::min(8)->mixedCase()

// 최소 하나의 숫자 포함...
Password::min(8)->numbers()

// 최소 하나의 특수문자 포함...
Password::min(8)->symbols()
```

또한, 비밀번호가 공개된 유출 데이터에 포함된 적이 없는지도 `uncompromised` 메서드로 검사할 수 있습니다.

```
Password::min(8)->uncompromised()
```

내부적으로 `Password` 규칙 객체는 [k-익명성(K-Anonymity)](https://en.wikipedia.org/wiki/K-anonymity) 모델을 사용하여, 사용자의 비밀번호가 [haveibeenpwned.com](https://haveibeenpwned.com) 서비스를 통해 유출되었는지 프라이버시를 해치지 않고 판단합니다.

기본적으로, 비밀번호가 데이터 유출에 한 번이라도 등장하면 유출로 간주합니다. 이 기준값은 `uncompromised` 메서드의 첫 번째 인자를 통해 변경할 수 있습니다.

```
// 동일 데이터 유출 내에서 3번 미만으로만 나타나는 비밀번호만 허용
Password::min(8)->uncompromised(3);
```

물론, 위 예시의 모든 메서드는 체이닝해서 사용할 수 있습니다.

```
Password::min(8)
    ->letters()
    ->mixedCase()
    ->numbers()
    ->symbols()
    ->uncompromised()
```

<a name="defining-default-password-rules"></a>
#### 기본 비밀번호 규칙 정의

애플리케이션 내에서 비밀번호에 대한 기본 유효성 검증 규칙을 한 곳에 정의해두는 것이 편리할 수 있습니다. 이를 위해 `Password::defaults` 메서드를 클로저와 함께 사용할 수 있습니다. 이 클로저는 비밀번호 규칙의 기본 설정을 반환해야 하며, 일반적으로는 서비스 프로바이더의 `boot` 메서드 안에서 호출합니다.

```php
use Illuminate\Validation\Rules\Password;

/**
 * Bootstrap any application services.
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

이후, 비밀번호 검증 시 별도의 인자 없이 `defaults` 메서드를 호출하면 기본 규칙들이 자동 적용됩니다.

```
'password' => ['required', Password::defaults()],
```

필요하다면 기본 비밀번호 검증 규칙에 추가적인 규칙도 붙일 수 있으며, 이때는 `rules` 메서드를 사용합니다.

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

라라벨에서는 다양한 기본 규칙을 제공하지만, 필요하다면 직접 규칙을 정의할 수도 있습니다. 그 중 하나가 "규칙 객체"를 만드는 방식입니다. 새 규칙 객체를 생성하려면 `make:rule` Artisan 명령어를 사용하면 됩니다. 예를 들어, 문자열이 모두 대문자인지 확인하는 규칙을 생성하려고 한다면 다음처럼 명령어를 입력합니다. 새 규칙 파일은 `app/Rules` 디렉터리에 생성되며, 이 디렉터리가 없다면 Artisan이 자동으로 생성합니다.

```shell
php artisan make:rule Uppercase
```

규칙이 생성되면, 이제 동작을 구현해야 합니다. 규칙 객체에는 오직 하나의 메서드 `validate`만 정의하면 됩니다. 이 메서드는 속성명, 해당 값, 실패 시 호출할 콜백(에러 메시지용)을 받습니다.

```
<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class Uppercase implements ValidationRule
{
    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (strtoupper($value) !== $value) {
            $fail('The :attribute must be uppercase.');
        }
    }
}
```

규칙을 구현한 후에는, 이 규칙 객체의 인스턴스를 다른 검증 규칙과 함께 전달하여 검증기에 연결할 수 있습니다.

```
use App\Rules\Uppercase;

$request->validate([
    'name' => ['required', 'string', new Uppercase],
]);
```

#### 검증 메시지 번역하기

에러 메시지를 `$fail` 콜백에 직접 문자열로 넘기는 대신, [번역 문자열 키](/docs/11.x/localization)를 전달하면 라라벨이 자동으로 에러 메시지를 번역해 줍니다.

```
if (strtoupper($value) !== $value) {
    $fail('validation.uppercase')->translate();
}
```

필요하다면, `translate` 메서드의 첫 번째 인자로 플레이스홀더 치환 배열을, 두 번째 인자로 원하는 언어를 넘길 수 있습니다.

```
$fail('validation.location')->translate([
    'value' => $this->value,
], 'fr')
```

#### 추가 데이터 접근

커스텀 규칙 클래스에서 현재 검증 중인 모든 데이터에 접근해야 한다면, `Illuminate\Contracts\Validation\DataAwareRule` 인터페이스를 구현하면 됩니다. 이 인터페이스는 클래스로 하여금 `setData` 메서드를 반드시 정의하도록 요구합니다. 이 메서드는 라라벨이 (실제 유효성 검증 전에) 검증 대상 전체 데이터를 전달하도록 합니다.

```
<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\DataAwareRule;
use Illuminate\Contracts\Validation\ValidationRule;

class Uppercase implements DataAwareRule, ValidationRule
{
    /**
     * 검증 중인 전체 데이터.
     *
     * @var array<string, mixed>
     */
    protected $data = [];

    // ...

    /**
     * 검증 중인 데이터를 설정합니다.
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

또는, 검증을 수행하는 검증기 인스턴스에 접근해야 한다면 `ValidatorAwareRule` 인터페이스를 구현하면 됩니다.

```
<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\ValidatorAwareRule;
use Illuminate\Validation\Validator;

class Uppercase implements ValidationRule, ValidatorAwareRule
{
    /**
     * 현재 검증기 인스턴스.
     *
     * @var \Illuminate\Validation\Validator
     */
    protected $validator;

    // ...

    /**
     * 현재 검증기를 설정합니다.
     */
    public function setValidator(Validator $validator): static
    {
        $this->validator = $validator;

        return $this;
    }
}
```

<a name="using-closures"></a>
### 클로저로 규칙 만들기

애플리케이션에서 한 번만 사용되는 간단한 커스텀 규칙이라면, 규칙 객체 대신 클로저를 사용할 수 있습니다. 클로저는 속성명, 속성값, 실패 시 호출하는 `$fail` 콜백을 인수로 받습니다.

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
### 암묵적(Implicit) 규칙

기본적으로, 검증 대상 속성이 존재하지 않거나 빈 문자열이면, 기본 규칙이나 커스텀 규칙이 모두 실행되지 않습니다. 예를 들어, [`unique`](#rule-unique) 규칙은 빈 문자열에 대해 실행되지 않습니다.

```
use Illuminate\Support\Facades\Validator;

$rules = ['name' => 'unique:users,name'];

$input = ['name' => ''];

Validator::make($input, $rules)->passes(); // true
```

속성이 비어 있어도 항상 커스텀 규칙을 실행하고 싶다면, 해당 규칙이 속성 필수(requested)를 "암묵적으로" 요구하도록 만들어야 합니다. 새로운 암묵적 규칙 객체를 빠르게 생성하려면 `make:rule` Artisan 명령어에 `--implicit` 옵션을 붙이면 됩니다.

```shell
php artisan make:rule Uppercase --implicit
```

> [!WARNING]  
> "암묵적" 규칙은 단순히 해당 속성이 필수임을 _내포_ 할 뿐입니다. 실제로 값이 없거나 속성이 없을 때 유효하지 않다고 처리할지는 직접 구현에 따라 달라집니다.