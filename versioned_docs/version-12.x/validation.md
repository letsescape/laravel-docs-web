# 유효성 검증 (Validation)

- [소개](#introduction)
- [유효성 검증 빠르게 시작하기](#validation-quickstart)
    - [라우트 정의하기](#quick-defining-the-routes)
    - [컨트롤러 생성하기](#quick-creating-the-controller)
    - [유효성 검증 로직 작성하기](#quick-writing-the-validation-logic)
    - [유효성 검증 에러 표시하기](#quick-displaying-the-validation-errors)
    - [폼 값 다시 채우기(Repopulating Forms)](#repopulating-forms)
    - [선택적 필드에 대한 참고 사항](#a-note-on-optional-fields)
    - [유효성 검증 에러 응답 포맷](#validation-error-response-format)
- [폼 요청 유효성 검증](#form-request-validation)
    - [폼 요청 생성하기](#creating-form-requests)
    - [폼 요청 권한 부여](#authorizing-form-requests)
    - [에러 메시지 커스터마이징](#customizing-the-error-messages)
    - [유효성 검증 전 입력값 준비하기](#preparing-input-for-validation)
- [수동으로 Validator 생성하기](#manually-creating-validators)
    - [자동 리디렉션](#automatic-redirection)
    - [네임드 에러 백(Named Error Bags)](#named-error-bags)
    - [에러 메시지 커스터마이징](#manual-customizing-the-error-messages)
    - [추가 유효성 검증 수행하기](#performing-additional-validation)
- [검증된 입력값 다루기](#working-with-validated-input)
- [에러 메시지 다루기](#working-with-error-messages)
    - [언어 파일에서 커스텀 메시지 지정하기](#specifying-custom-messages-in-language-files)
    - [언어 파일에서 속성 지정하기](#specifying-attribute-in-language-files)
    - [언어 파일에서 값 지정하기](#specifying-values-in-language-files)
- [사용 가능한 유효성 검증 규칙](#available-validation-rules)
- [조건부 규칙 추가하기](#conditionally-adding-rules)
- [배열 데이터 유효성 검증](#validating-arrays)
    - [중첩 배열 입력값 유효성 검증하기](#validating-nested-array-input)
    - [에러 메시지 인덱스와 위치 처리](#error-message-indexes-and-positions)
- [파일 유효성 검증하기](#validating-files)
- [비밀번호 유효성 검증](#validating-passwords)
- [커스텀 유효성 검증 규칙](#custom-validation-rules)
    - [Rule 객체 사용하기](#using-rule-objects)
    - [클로저(Closure) 사용하기](#using-closures)
    - [암묵적 규칙(Implicit Rules)](#implicit-rules)

<a name="introduction"></a>
## 소개

라라벨에서는 애플리케이션에 들어오는 데이터를 유효성 검증하는 여러 가지 방법을 제공합니다. 일반적으로 모든 HTTP 요청에서 제공되는 `validate` 메서드를 사용하는 것이 가장 흔합니다. 하지만, 본 문서에서는 이외에도 다양한 유효성 검증 방법들을 다룰 예정입니다.

라라벨은 데이터에 적용할 수 있는 다양한 편리한 유효성 검증 규칙을 기본으로 제공합니다. 심지어 특정 데이터베이스 테이블에서 값이 유일한지 확인할 수도 있습니다. 본 가이드에서는 모든 유효성 검증 규칙을 하나씩 자세히 살펴보면서 라라벨의 강력한 유효성 검증 기능을 익힐 수 있도록 도와드립니다.

<a name="validation-quickstart"></a>
## 유효성 검증 빠르게 시작하기

라라벨의 강력한 유효성 검증 기능을 빠르게 배워보고 싶다면, 폼 데이터를 검증하고 사용자에게 에러 메시지를 표시하는 전체 예제를 살펴보는 것이 좋습니다. 아래 내용을 읽으면서, 라라벨에서 들어오는 요청 데이터를 어떻게 검증하고 처리하는지 전반적인 이해를 얻을 수 있습니다.

<a name="quick-defining-the-routes"></a>
### 라우트 정의하기

먼저, `routes/web.php` 파일에 다음과 같은 라우트가 정의되어 있다고 가정해봅시다.

```php
use App\Http\Controllers\PostController;

Route::get('/post/create', [PostController::class, 'create']);
Route::post('/post', [PostController::class, 'store']);
```

위 코드에서 `GET` 방식 라우트는 사용자가 새 블로그 게시글을 작성할 수 있는 폼을 보여주며, `POST` 방식 라우트는 새로 작성된 게시글을 데이터베이스에 저장합니다.

<a name="quick-creating-the-controller"></a>
### 컨트롤러 생성하기

이번에는 위에서 정의한 라우트에 대응하는 간단한 컨트롤러를 살펴보겠습니다. 여기서는 `store` 메서드를 아직 비워 둡니다.

```php
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

이제, 새 블로그 게시글에 대한 유효성 검증 로직을 `store` 메서드 내부에 구현해보겠습니다. 이를 위해 `Illuminate\Http\Request` 객체에서 제공하는 `validate` 메서드를 사용할 수 있습니다. 유효성 검증 규칙을 통과하면 코드가 정상적으로 계속 실행되지만, 검증에 실패하면 `Illuminate\Validation\ValidationException` 예외가 발생하며 적절한 에러 응답이 자동으로 사용자에게 반환됩니다.

전통적인 HTTP 요청에서 검증에 실패할 경우, 이전 URL로 자동 리디렉션됩니다. 만약 들어오는 요청이 XHR(비동기 자바스크립트) 요청인 경우에는 [유효성 검증 에러 메시지를 담은 JSON 응답](#validation-error-response-format)이 반환됩니다.

`validate` 메서드 사용법을 이해하기 위해 `store` 메서드를 다시 살펴보겠습니다.

```php
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

보시다시피, 유효성 검증 규칙을 `validate` 메서드에 전달합니다. 사용 가능한 모든 유효성 검증 규칙은 [유효성 검증 규칙 문서](#available-validation-rules)에서 확인할 수 있습니다. 검증에 실패하면 적절한 응답이 자동으로 생성되며, 검증을 통과하면 컨트롤러의 로직이 정상적으로 이어집니다.

또한, 규칙을 문자열 대신 배열 형태로 지정할 수도 있습니다.

```php
$validatedData = $request->validate([
    'title' => ['required', 'unique:posts', 'max:255'],
    'body' => ['required'],
]);
```

또한, [네임드 에러 백](#named-error-bags)에 에러 메시지를 저장하면서 요청을 검증하려면 `validateWithBag` 메서드를 사용할 수도 있습니다.

```php
$validatedData = $request->validateWithBag('post', [
    'title' => ['required', 'unique:posts', 'max:255'],
    'body' => ['required'],
]);
```

<a name="stopping-on-first-validation-failure"></a>
#### 첫 번째 검증 실패 시 바로 중단하기

때로는 특정 필드에 대해 첫 번째 검증 실패가 발생하면 더 이상 추가 규칙을 검사하지 않고 중단하고 싶을 때가 있습니다. 이런 경우 해당 필드에 `bail` 규칙을 추가하면 됩니다.

```php
$request->validate([
    'title' => 'bail|required|unique:posts|max:255',
    'body' => 'required',
]);
```

위 예제에서 `title` 필드에 대해 `unique` 규칙에서 실패하면, 그 뒤의 `max` 규칙은 검사하지 않습니다. 규칙들은 명시한 순서대로 검사됩니다.

<a name="a-note-on-nested-attributes"></a>
#### 중첩 속성(Nested Attributes)에 대한 참고 사항

들어오는 HTTP 요청에 "중첩" 필드 데이터가 포함되어 있다면, "dot" 표기법을 사용해 검증 규칙을 작성할 수 있습니다.

```php
$request->validate([
    'title' => 'required|unique:posts|max:255',
    'author.name' => 'required',
    'author.description' => 'required',
]);
```

반대로, 필드 이름에 마침표(.)가 실제로 포함된 경우, 역슬래시(`\`)로 마침표를 이스케이프 처리하여 "dot" 표기법으로 인식되는 것을 방지할 수 있습니다.

```php
$request->validate([
    'title' => 'required|unique:posts|max:255',
    'v1\.0' => 'required',
]);
```

<a name="quick-displaying-the-validation-errors"></a>
### 유효성 검증 에러 표시하기

만약 들어오는 요청 필드가 지정한 유효성 검증 규칙을 통과하지 못하면 어떻게 될까요? 앞서 언급했듯이, 라라벨은 자동으로 사용자를 이전 위치로 리디렉션합니다. 또한 모든 유효성 검증 에러와 [요청 입력값](/docs/requests#retrieving-old-input)이 자동으로 [세션에 flash됩니다](/docs/session#flash-data).

`Illuminate\View\Middleware\ShareErrorsFromSession` 미들웨어는 모든 뷰에 `$errors` 변수를 공유합니다. 이 미들웨어는 `web` 미들웨어 그룹에 제공되며, 이로 인해 항상 뷰에서 `$errors` 변수를 사용할 수 있습니다. `$errors` 변수는 `Illuminate\Support\MessageBag` 인스턴스이며, 보다 자세한 사용법은 [별도의 문서](#working-with-error-messages)에서 확인할 수 있습니다.

따라서, 검증 실패 시 사용자는 컨트롤러의 `create` 메서드로 리디렉션되며, 아래와 같이 뷰에서 에러 메시지를 쉽게 출력할 수 있습니다.

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

라라벨 기본 유효성 검증 규칙의 에러 메시지는 애플리케이션의 `lang/en/validation.php` 파일에 정의되어 있습니다. 만약 애플리케이션에 `lang` 디렉터리가 없다면, `lang:publish` Artisan 명령어로 생성할 수 있습니다.

`lang/en/validation.php` 파일에는 각 유효성 검증 규칙에 대한 번역 항목이 존재하며, 애플리케이션의 요구에 따라 이 메시지들을 자유롭게 변경하거나 수정할 수 있습니다.

또한, 이 파일을 다른 언어의 디렉터리에 복사해서 메시지를 해당 언어로 번역할 수도 있습니다. 라라벨 지역화(Localization)에 대해 더 알아보려면 [지역화 문서](/docs/localization)를 참고하세요.

> [!WARNING]
> 기본적으로 라라벨 애플리케이션 스캐폴딩에는 `lang` 디렉터리가 포함되어 있지 않습니다. 라라벨의 언어 파일을 커스터마이즈하고 싶다면 `lang:publish` Artisan 명령어로 파일을 퍼블리시하세요.

<a name="quick-xhr-requests-and-validation"></a>
#### XHR 요청과 유효성 검증

위 예제에서는 전통적인 폼을 이용해 데이터를 애플리케이션에 보냈지만, 많은 애플리케이션이 자바스크립트 기반 프론트엔드로부터의 XHR 요청을 받는 경우가 많습니다. XHR 요청에서 `validate` 메서드를 사용할 때에는 리디렉션 응답이 생성되지 않습니다. 대신, [모든 유효성 검증 에러를 포함한 JSON 응답](#validation-error-response-format)이 반환되며, 이 응답의 HTTP 상태 코드는 422입니다.

<a name="the-at-error-directive"></a>
#### `@error` 디렉티브

특정 속성(attribute)에 대한 유효성 검증 에러 메시지가 존재하는지 빠르게 확인하려면, [Blade](/docs/blade)의 `@error` 디렉티브를 사용할 수 있습니다. `@error` 디렉티브 내부에서는 `$message` 변수를 출력해 에러 메시지를 표시하면 됩니다.

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

[네임드 에러 백](#named-error-bags)을 사용하는 경우에는 `@error` 디렉티브의 두 번째 인자로 에러 백의 이름을 전달할 수 있습니다.

```blade
<input ... class="@error('title', 'post') is-invalid @enderror">
```

<a name="repopulating-forms"></a>
### 폼 값 다시 채우기(Repopulating Forms)

라라벨에서는 유효성 검증 에러로 인한 리디렉션 발생 시, 프레임워크가 자동으로 [요청의 모든 입력값을 세션에 flash 처리](/docs/session#flash-data)합니다. 이를 통해 다음 요청 시에도 입력값을 쉽게 다시 폼에 출력할 수 있습니다.

이전 요청에서 flash된 입력값을 가져오려면, `Illuminate\Http\Request` 인스턴스의 `old` 메서드를 호출하면 됩니다. 이 메서드는 [세션](/docs/session)에 저장된 이전 입력값을 반환합니다.

```php
$title = $request->old('title');
```

라라벨은 전역적으로 사용할 수 있는 `old` 헬퍼 함수도 제공합니다. [Blade 템플릿](/docs/blade)에서 이전 입력값을 출력할 때는 이 헬퍼를 활용하는 것이 더욱 편리합니다. 해당 필드에 이전 입력값이 없다면, `null`이 반환됩니다.

```blade
<input type="text" name="title" value="{{ old('title') }}">
```

<a name="a-note-on-optional-fields"></a>
### 선택적 필드에 대한 참고 사항

라라벨은 기본적으로 애플리케이션의 글로벌 미들웨어 스택에 `TrimStrings` 및 `ConvertEmptyStringsToNull` 미들웨어를 포함하고 있습니다. 이로 인해, "선택적" 요청 필드를 `nullable`로 명시하지 않으면, 해당 값이 `null`일 때도 검증에 실패할 수 있습니다. 예를 들어:

```php
$request->validate([
    'title' => 'required|unique:posts|max:255',
    'body' => 'required',
    'publish_at' => 'nullable|date',
]);
```

위 예제에서는 `publish_at` 필드가 `null` 또는 유효한 날짜 표현식일 수 있음을 명시합니다. 만약 규칙에 `nullable`을 추가하지 않았다면, 검증기는 `null` 값을 유효하지 않은 날짜로 판단합니다.

<a name="validation-error-response-format"></a>
### 유효성 검증 에러 응답 포맷

애플리케이션에서 `Illuminate\Validation\ValidationException` 예외가 발생하고, 들어오는 HTTP 요청이 JSON 응답을 기대하는 경우, 라라벨은 에러 메시지를 자동으로 포맷하여 `422 Unprocessable Entity` HTTP 응답으로 반환합니다.

아래는 검증 에러에 대한 JSON 응답 포맷 예시입니다. 중첩된 에러 키는 "dot" 표기법으로 평탄화(flatten)되어 제공됩니다.

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
## 폼 요청 유효성 검증

<a name="creating-form-requests"></a>
### 폼 요청 생성하기

좀 더 복잡한 유효성 검증이 필요한 경우, "폼 요청(form request)" 클래스를 생성해서 사용할 수도 있습니다. 폼 요청은 자체적으로 유효성 검증과 인가(authorization) 로직을 포함하는 커스텀 요청 클래스입니다. 폼 요청 클래스는 `make:request` Artisan CLI 명령어로 생성할 수 있습니다.

```shell
php artisan make:request StorePostRequest
```

생성된 폼 요청 클래스는 `app/Http/Requests` 디렉터리에 위치하게 됩니다. 만약 이 디렉터리가 존재하지 않는다면, 위 명령어 실행 시 함께 생성됩니다. 라라벨에서 생성한 폼 요청 클래스에는 `authorize` 메서드와 `rules` 메서드, 두 가지가 포함되어 있습니다.

예상하셨듯이, `authorize` 메서드는 현재 인증된 사용자가 해당 요청이 표현하는 동작을 수행할 수 있는지 여부를 결정하며, `rules` 메서드는 요청 데이터에 적용할 유효성 검증 규칙을 반환합니다.

```php
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
> `rules` 메서드의 시그니처에서 필요한 의존성을 타입힌트로 지정할 수 있습니다. 이들은 라라벨 [서비스 컨테이너](/docs/container)를 통해 자동으로 resolve됩니다.

그렇다면 실제로 검증 규칙이 평가는 언제 이루어질까요? 컨트롤러 메서드의 인자에서 해당 요청을 타입힌트로 지정하는 것만으로 충분합니다. 들어오는 폼 요청은 컨트롤러 메서드 호출 전에 자동으로 검증되므로, 컨트롤러에 별도의 검증 코드를 추가하지 않아도 됩니다.

```php
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

유효성 검증에 실패하면 다시 이전 위치로 리디렉션 응답이 생성되며, 에러 메시지도 세션에 flash되어 뷰에서 바로 사용할 수 있습니다. 만약 요청이 XHR 방식이었다면, 422 상태 코드와 함께 [JSON 포맷의 검증 에러](#validation-error-response-format)가 포함된 HTTP 응답이 반환됩니다.

> [!NOTE]
> Inertia 기반 라라벨 프론트엔드에 실시간 폼 요청 검증 기능이 필요하다면 [Laravel Precognition](/docs/precognition)을 참고하세요.

<a name="performing-additional-validation-on-form-requests"></a>
#### 추가 유효성 검증 수행하기

초기 유효성 검증이 끝난 후에도 추가적인 검증이 필요할 때는 폼 요청의 `after` 메서드를 사용할 수 있습니다.

`after` 메서드는 검증 완료 후 호출할 콜러블(callable) 또는 클로저 배열을 반환해야 합니다. 각 콜러블에는 `Illuminate\Validation\Validator` 인스턴스가 전달되므로, 필요하다면 추가 에러 메시지를 직접 등록할 수 있습니다.

```php
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

위에서 설명했듯이, `after` 메서드가 반환하는 배열에는 콜러블뿐 아니라 인보커블(invokable) 클래스도 포함할 수 있습니다. 이런 클래스의 `__invoke` 메서드는 `Illuminate\Validation\Validator` 인스턴스를 전달받습니다.

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
#### 첫 번째 유효성 검증 실패 후 전체 검증 중단하기

폼 요청 클래스에 `stopOnFirstFailure` 프로퍼티를 추가하면, 첫 번째 유효성 검증 오류가 발생할 때 모든 속성의 검증을 즉시 중단하도록 설정할 수 있습니다.

```php
/**
 * Indicates if the validator should stop on the first rule failure.
 *
 * @var bool
 */
protected $stopOnFirstFailure = true;
```

<a name="customizing-the-redirect-location"></a>
#### 리디렉션 위치 커스터마이즈

폼 요청 유효성 검증이 실패하면, 기본적으로 이전 위치로 사용자를 리디렉션합니다. 하지만, 이 동작을 변경하고 싶다면 폼 요청 클래스에서 `$redirect` 프로퍼티를 정의하면 됩니다.

```php
/**
 * The URI that users should be redirected to if validation fails.
 *
 * @var string
 */
protected $redirect = '/dashboard';
```

또한, 네임드 라우트로 리디렉션하고 싶다면 `$redirectRoute` 프로퍼티로 대체할 수 있습니다.

```php
/**
 * The route that users should be redirected to if validation fails.
 *
 * @var string
 */
protected $redirectRoute = 'dashboard';
```

<a name="authorizing-form-requests"></a>
### 폼 요청 권한 부여

폼 요청 클래스에는 `authorize` 메서드가 존재합니다. 이 메서드 내부에서 현재 인증된 사용자가 실제로 특정 리소스를 수정할 권한이 있는지 판단할 수 있습니다. 예를 들어, 사용자가 자신이 소유한 블로그 댓글만 수정할 수 있도록 제한하고 싶을 때 사용할 수 있습니다. 이 메서드에서 보통 [인가 게이트(gate) 및 정책(policy)](/docs/authorization)과 상호작용하게 됩니다.

```php
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

모든 폼 요청 클래스는 라라벨의 기본 Request 클래스를 상속하므로, 현재 인증된 사용자는 `user` 메서드를 통해 접근할 수 있습니다. 또한, 위 예제의 `route` 메서드를 통해 해당 라우트의 URI 파라미터(예: `{comment}`)를 가져올 수 있습니다.

```php
Route::post('/comment/{comment}');
```

[라우트 모델 바인딩](/docs/routing#route-model-binding)을 활용하고 있다면, resolve된 모델 객체에 바로 접근하여 코드를 더욱 간결하게 만들 수도 있습니다.

```php
return $this->user()->can('update', $this->comment);
```

만약 `authorize` 메서드가 `false`를 반환하면, 자동으로 403 상태 코드 HTTP 응답이 반환되며 컨트롤러 메서드는 실행되지 않습니다.

요청에 대한 인가 로직을 애플리케이션의 다른 위치에서 처리할 계획이라면, `authorize` 메서드를 아예 제거하거나, 또는 무조건 `true`를 반환해도 됩니다.

```php
/**
 * Determine if the user is authorized to make this request.
 */
public function authorize(): bool
{
    return true;
}
```

> [!NOTE]
> `authorize` 메서드의 시그니처에서 필요한 의존성을 타입힌트로 지정할 수 있습니다. 이들은 라라벨 [서비스 컨테이너](/docs/container)를 통해 자동으로 resolve됩니다.

<a name="customizing-the-error-messages"></a>
### 에러 메시지 커스터마이징

폼 요청에서 사용되는 에러 메시지는 `messages` 메서드를 오버라이드하여 쉽게 커스터마이즈할 수 있습니다. 이 메서드는 속성/규칙 쌍과 해당 에러 메시지를 담은 배열을 반환해야 합니다.

```php
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

라라벨의 기본 유효성 검증 에러 메시지에서는 `:attribute` 플레이스홀더가 자주 사용됩니다. 만약 이 플레이스홀더를 커스텀 속성명으로 바꾸고 싶다면, `attributes` 메서드를 오버라이드하여 속성명/별칭 쌍의 배열을 반환하면 됩니다.

```php
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
### 유효성 검증 전 입력값 준비하기

유효성 검증 규칙을 적용하기 전에, 요청으로부터 받은 데이터를 사전에 가공하거나 정제(sanitize)해야 하는 경우, `prepareForValidation` 메서드를 활용할 수 있습니다.

```php
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

마찬가지로, 유효성 검증이 끝난 후 데이터 정규화(normalization)가 필요하다면 `passedValidation` 메서드를 사용할 수 있습니다.

```php
/**
 * Handle a passed validation attempt.
 */
protected function passedValidation(): void
{
    $this->replace(['name' => 'Taylor']);
}
```

<a name="manually-creating-validators"></a>

## Validator 인스턴스 수동 생성하기

`validate` 메서드를 사용하지 않고 요청 데이터를 검증하려는 경우, `Validator` [파사드](/docs/facades)를 사용하여 직접 validator 인스턴스를 생성할 수 있습니다. 파사드의 `make` 메서드는 새로운 validator 인스턴스를 만들어 줍니다.

```php
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
            return redirect('/post/create')
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

`make` 메서드의 첫 번째 인수는 유효성 검증 대상 데이터입니다. 두 번째 인수에는 해당 데이터에 적용할 유효성 규칙들의 배열을 전달합니다.

요청 데이터의 검증이 실패했는지 확인한 뒤, `withErrors` 메서드를 사용하여 오류 메시지를 세션에 플래시할 수 있습니다. 이 메서드를 이용하면, 리다이렉션 후 `$errors` 변수가 자동으로 뷰와 공유되어, 사용자가 쉽게 오류 메시지를 확인할 수 있도록 해줍니다. `withErrors` 메서드는 validator, `MessageBag`, 또는 PHP `array`를 인수로 받을 수 있습니다.

#### 첫 번째 유효성 검증 실패 시 중단하기

`stopOnFirstFailure` 메서드를 사용하면 하나의 속성에 대해 검증을 실패하는 순간, 모든 속성에 대한 추가 검증을 중단하도록 validator에 지시할 수 있습니다.

```php
if ($validator->stopOnFirstFailure()->fails()) {
    // ...
}
```

<a name="automatic-redirection"></a>
### 자동 리다이렉션

수동으로 validator 인스턴스를 생성하되, HTTP 요청의 `validate` 메서드가 제공하는 자동 리다이렉션 기능도 활용하고 싶다면, 기존 validator 인스턴스에서 `validate` 메서드를 호출하면 됩니다. 검증에 실패할 경우, 사용자는 자동으로 리다이렉트되며, XHR 요청의 경우 [JSON 응답](#validation-error-response-format)이 반환됩니다.

```php
Validator::make($request->all(), [
    'title' => 'required|unique:posts|max:255',
    'body' => 'required',
])->validate();
```

또한, 검증 실패 시 오류 메시지를 [이름이 지정된 오류 가방](#named-error-bags)에 저장하고 싶다면, `validateWithBag` 메서드를 사용할 수 있습니다.

```php
Validator::make($request->all(), [
    'title' => 'required|unique:posts|max:255',
    'body' => 'required',
])->validateWithBag('post');
```

<a name="named-error-bags"></a>
### 이름이 지정된 오류 가방(Named Error Bags)

여러 개의 폼이 한 페이지에 있을 때, 각각의 폼에 대한 오류 메시지를 별도로 구분해서 보여주고 싶을 수 있습니다. 이때는 유효성 검증 오류 메시지를 담는 `MessageBag`에 이름을 부여할 수 있습니다. 이를 위해 `withErrors` 메서드의 두 번째 인수로 이름을 전달하면 됩니다.

```php
return redirect('/register')->withErrors($validator, 'login');
```

이름이 지정된 `MessageBag` 인스턴스는 `$errors` 변수에서 다음과 같이 접근할 수 있습니다.

```blade
{{ $errors->login->first('email') }}
```

<a name="manual-customizing-the-error-messages"></a>
### 오류 메시지 커스터마이징

필요에 따라, validator 인스턴스에서 라라벨의 기본 오류 메시지 대신 사용할 커스텀 메시지를 지정할 수 있습니다. 커스텀 메시지는 여러 방식으로 지정할 수 있습니다. 우선, `Validator::make` 메서드의 세 번째 인수로 커스텀 메시지 배열을 전달할 수 있습니다.

```php
$validator = Validator::make($input, $rules, $messages = [
    'required' => 'The :attribute field is required.',
]);
```

이 예시에서 `:attribute` 플레이스홀더는 실제 검증 대상 필드의 이름으로 대체됩니다. 이 외에도 검증 메시지에는 여러 플레이스홀더를 활용할 수 있습니다. 예를 들어:

```php
$messages = [
    'same' => 'The :attribute and :other must match.',
    'size' => 'The :attribute must be exactly :size.',
    'between' => 'The :attribute value :input is not between :min - :max.',
    'in' => 'The :attribute must be one of the following types: :values',
];
```

<a name="specifying-a-custom-message-for-a-given-attribute"></a>
#### 특정 속성에 대한 커스텀 메시지 지정하기

가끔은 전체 규칙에 대한 메시지가 아닌, 특정 속성에만 커스텀 오류 메시지를 지정하고 싶을 수 있습니다. 이때는 "점(.) 표기법"을 사용하여, `속성명.규칙명` 형태로 메시지를 지정합니다.

```php
$messages = [
    'email.required' => 'We need to know your email address!',
];
```

<a name="specifying-custom-attribute-values"></a>
#### 커스텀 속성명 지정하기

라라벨의 기본 오류 메시지 중에는 `:attribute` 플레이스홀더가 들어 있는 경우가 많으며, 이는 검증 필드 이름으로 대체됩니다. 특정 필드에 대해 이 치환값을 변경하고 싶다면, `Validator::make` 메서드의 네 번째 인수로 커스텀 속성명을 배열로 전달하면 됩니다.

```php
$validator = Validator::make($input, $rules, $messages, [
    'email' => 'email address',
]);
```

<a name="performing-additional-validation"></a>
### 추가적인 유효성 검증 수행하기

처음 유효성 검증이 완료된 후, 추가적인 검증을 수행해야 할 때가 있습니다. 이럴 때는 validator의 `after` 메서드를 사용하면 됩니다. `after` 메서드는 클로저 또는 호출 가능한(callable) 배열을 인수로 받아 검증이 완료된 뒤 실행됩니다. 주어진 콜러블들은 각각 `Illuminate\Validation\Validator` 인스턴스를 전달받으며, 필요한 경우 추가 오류 메시지도 쉽게 추가할 수 있습니다.

```php
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

위에서 언급한 것처럼, `after` 메서드는 콜러블의 배열도 받을 수 있습니다. 특히 "검증 이후"의 로직을 별도의 인보커블 클래스에 캡슐화했다면 유용합니다. 이 클래스들은 `__invoke` 메서드를 통해 `Illuminate\Validation\Validator` 인스턴스를 전달받습니다.

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

폼 리퀘스트나 수동으로 만든 validator 인스턴스를 이용하여 요청 데이터를 검증한 뒤, 실제로 검증을 통과한 입력 값만을 얻고 싶을 때가 있습니다. 이는 여러 방법으로 할 수 있습니다. 우선, 폼 리퀘스트나 validator 인스턴스에서 `validated` 메서드를 호출하면, 유효성 검증을 통과한 데이터 배열을 반환합니다.

```php
$validated = $request->validated();

$validated = $validator->validated();
```

또는, 폼 리퀘스트나 validator 인스턴스에서 `safe` 메서드를 호출할 수도 있습니다. 이 메서드는 `Illuminate\Support\ValidatedInput` 인스턴스를 반환합니다. 이 객체는 `only`, `except`, `all` 메서드를 제공하여 검증된 데이터의 일부만 또는 전체를 가져올 수 있습니다.

```php
$validated = $request->safe()->only(['name', 'email']);

$validated = $request->safe()->except(['name', 'email']);

$validated = $request->safe()->all();
```

또한, `Illuminate\Support\ValidatedInput` 인스턴스는 배열처럼 반복(iterate)하거나, 배열로 접근할 수도 있습니다.

```php
// 유효성 검증된 데이터를 반복 처리...
foreach ($request->safe() as $key => $value) {
    // ...
}

// 배열처럼 접근하기...
$validated = $request->safe();

$email = $validated['email'];
```

추가로, 검증된 데이터에 다른 필드를 덧붙이고 싶다면 `merge` 메서드를 사용할 수 있습니다.

```php
$validated = $request->safe()->merge(['name' => 'Taylor Otwell']);
```

검증된 데이터 전체를 [컬렉션](/docs/collections) 인스턴스로 받고 싶다면, `collect` 메서드를 호출하면 됩니다.

```php
$collection = $request->safe()->collect();
```

<a name="working-with-error-messages"></a>
## 오류 메시지 다루기

`Validator` 인스턴스에서 `errors` 메서드를 호출하면, 여러 편리한 메서드를 제공하는 `Illuminate\Support\MessageBag` 인스턴스를 얻게 됩니다. `$errors` 변수 또한 뷰에서 자동으로 제공되며, 이 역시 `MessageBag` 클래스의 인스턴스입니다.

<a name="retrieving-the-first-error-message-for-a-field"></a>
#### 특정 필드의 첫 번째 오류 메시지 가져오기

특정 필드에 대한 최초의 오류 메시지를 가져오려면, `first` 메서드를 사용합니다.

```php
$errors = $validator->errors();

echo $errors->first('email');
```

<a name="retrieving-all-error-messages-for-a-field"></a>
#### 특정 필드의 모든 오류 메시지 가져오기

특정 필드에 대한 모든 오류 메시지 배열을 얻고 싶다면, `get` 메서드를 사용하세요.

```php
foreach ($errors->get('email') as $message) {
    // ...
}
```

배열 형태의 폼 필드를 검증하는 경우, `*` 문자를 사용하여 배열의 각 요소에 대한 모든 오류 메시지를 가져올 수도 있습니다.

```php
foreach ($errors->get('attachments.*') as $message) {
    // ...
}
```

<a name="retrieving-all-error-messages-for-all-fields"></a>
#### 모든 필드의 모든 오류 메시지 가져오기

전체 필드의 모든 오류 메시지를 포함하는 배열을 얻으려면, `all` 메서드를 사용합니다.

```php
foreach ($errors->all() as $message) {
    // ...
}
```

<a name="determining-if-messages-exist-for-a-field"></a>
#### 특정 필드에 대한 오류 메시지 존재 여부 확인

`has` 메서드는 특정 필드에 대해 오류 메시지가 존재하는지 확인할 때 사용합니다.

```php
if ($errors->has('email')) {
    // ...
}
```

<a name="specifying-custom-messages-in-language-files"></a>
### 언어 파일에서 커스텀 메시지 지정하기

라라벨의 기본 유효성 검증 규칙마다 `lang/en/validation.php` 파일에 오류 메시지가 저장되어 있습니다. 만약 애플리케이션에 `lang` 디렉토리가 없다면, `lang:publish` Artisan 명령어를 사용해 생성할 수 있습니다.

`lang/en/validation.php` 파일에서는 각 검증 규칙에 대한 번역 항목을 확인할 수 있으며, 애플리케이션의 요구에 따라 자유롭게 수정하거나 변경할 수 있습니다.

또한, 이 파일을 다른 언어 디렉터리로 복사해서 애플리케이션의 언어에 맞춰 메시지를 번역할 수도 있습니다. 라라벨의 다국어(localization) 기능에 대한 자세한 내용은 [다국어 문서](/docs/localization)를 참고하세요.

> [!WARNING]
> 기본적으로, 라라벨 애플리케이션 스캐폴딩에는 `lang` 디렉토리가 포함되어 있지 않습니다. 라라벨의 언어 파일을 커스터마이즈하려면 `lang:publish` Artisan 명령어를 통해 언어 파일을 퍼블리시해야 합니다.

<a name="custom-messages-for-specific-attributes"></a>
#### 특정 속성-규칙 조합에 대한 메시지 커스터마이징

`lang/xx/validation.php` 언어 파일의 `custom` 배열을 통해 특정 속성과 규칙의 조합에 대해 커스텀 오류 메시지를 지정할 수 있습니다.

```php
'custom' => [
    'email' => [
        'required' => 'We need to know your email address!',
        'max' => 'Your email address is too long!'
    ],
],
```

<a name="specifying-attribute-in-language-files"></a>
### 언어 파일에서 커스텀 속성명 지정

라라벨의 많은 기본 오류 메시지에는 `:attribute` 플레이스홀더가 들어있고, 이 부분은 검증 대상 필드명으로 바뀝니다. 만약 오류 메시지에서 이 `:attribute` 부분을 사용자에게 더 친근한 값으로 바꾸고 싶다면, `lang/xx/validation.php` 파일의 `attributes` 배열에 원하는 속성 이름을 추가해서 지정할 수 있습니다.

```php
'attributes' => [
    'email' => 'email address',
],
```

> [!WARNING]
> 기본적으로, 라라벨 애플리케이션 스캐폴딩에는 `lang` 디렉토리가 포함되어 있지 않습니다. 라라벨의 언어 파일을 커스터마이즈하려면 `lang:publish` Artisan 명령어를 통해 퍼블리시해야 합니다.

<a name="specifying-values-in-language-files"></a>
### 언어 파일에서 값 치환 지정

라라벨의 일부 유효성 검증 규칙 오류 메시지에는 현재 요청 속성의 값을 반영하는 `:value` 플레이스홀더가 포함되어 있습니다. 그러나 때때로 이 부분을 사용자가 이해하기 쉬운 표현으로 바꿔야 할 수도 있습니다. 예를 들어, 아래와 같이 `payment_type`이 `cc`일 때 `credit_card_number` 속성이 필수로 요구되는 검증 규칙이 있다고 가정해보겠습니다.

```php
Validator::make($request->all(), [
    'credit_card_number' => 'required_if:payment_type,cc'
]);
```

이 검증 규칙이 실패하면, 아래와 같은 오류 메시지가 표시됩니다.

```text
The credit card number field is required when payment type is cc.
```

여기서 `cc` 대신 더 친근한 표현으로 값을 바꾸고 싶다면, 언어 파일의 `values` 배열에 다음과 같이 지정할 수 있습니다.

```php
'values' => [
    'payment_type' => [
        'cc' => 'credit card'
    ],
],
```

> [!WARNING]
> 기본적으로, 라라벨 애플리케이션 스캐폴딩에는 `lang` 디렉토리가 포함되어 있지 않습니다. 라라벨의 언어 파일을 커스터마이즈하려면 `lang:publish` Artisan 명령어를 통해 퍼블리시해야 합니다.

이 값을 지정한 후에는, 해당 검증 규칙 실패 시 아래와 같이 바뀐 메시지가 출력됩니다.

```text
The credit card number field is required when payment type is credit card.
```

<a name="available-validation-rules"></a>
## 사용 가능한 유효성 검증 규칙

아래는 사용 가능한 모든 유효성 검증 규칙과 그 기능의 목록입니다.



#### 불리언(Booleans)

<div class="collection-method-list" markdown="1">

[Accepted](#rule-accepted)
[Accepted If](#rule-accepted-if)
[Boolean](#rule-boolean)
[Declined](#rule-declined)
[Declined If](#rule-declined-if)

</div>

#### 문자열(Strings)

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

#### 숫자(Numbers)

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

#### 배열(Arrays)

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

#### 날짜(Dates)

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

#### 파일(Files)

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

#### 데이터베이스(Database)

<div class="collection-method-list" markdown="1">

[Exists](#rule-exists)
[Unique](#rule-unique)

</div>

#### 유틸리티(Utilities)

<div class="collection-method-list" markdown="1">

[Any Of](#rule-anyof)
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
[Prohibited If Accepted](#rule-prohibited-if-accepted)
[Prohibited If Declined](#rule-prohibited-if-declined)
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

해당 필드는 `"yes"`, `"on"`, `1`, `"1"`, `true`, `"true"` 중 하나여야 합니다. 일반적으로 "서비스 약관 동의"와 같은 필드의 유효성 검증에 적합합니다.

<a name="rule-accepted-if"></a>
#### accepted_if:anotherfield,value,...

해당 필드는, 다른 검증 대상 필드가 특정 값과 일치할 때에만 `"yes"`, `"on"`, `1`, `"1"`, `true`, `"true"` 중 하나여야 합니다. 마찬가지로 약관 동의 등 특정 조건에 따라 동의 여부를 검증할 때 활용합니다.

<a name="rule-active-url"></a>
#### active_url

해당 필드는 유효한 A 또는 AAAA 레코드를 갖는 값이어야 하며, 이는 PHP의 `dns_get_record` 함수 규칙을 따릅니다. URL에서 호스트네임은 PHP의 `parse_url`로 추출한 뒤 `dns_get_record`로 전달됩니다.

<a name="rule-after"></a>
#### after:_date_

해당 필드는 지정한 날짜 이후의 값이어야 합니다. 라라벨은 전달된 날짜를 `strtotime` PHP 함수로 파싱해 유효한 `DateTime` 인스턴스로 변환합니다.

```php
'start_date' => 'required|date|after:tomorrow'
```

`strtotime`으로 해석할 수 있는 날짜 문자열 대신, 날짜를 비교할 다른 필드를 지정할 수도 있습니다.

```php
'finish_date' => 'required|date|after:start_date'
```

날짜 기반 규칙은 더 유연하게, 플루언트한 `date` 규칙 빌더로도 작성할 수 있습니다.

```php
use Illuminate\Validation\Rule;

'start_date' => [
    'required',
    Rule::date()->after(today()->addDays(7)),
],
```

`afterToday`와 `todayOrAfter` 메서드를 사용하면, 날짜가 오늘 이후이거나 오늘 및 이후임을 더욱 명확하게 표현할 수 있습니다.

```php
'start_date' => [
    'required',
    Rule::date()->afterToday(),
],
```

<a name="rule-after-or-equal"></a>

#### after_or_equal:_date_

유효성 검증 대상 필드는 지정된 날짜 이후이거나 같은 값이어야 합니다. 자세한 내용은 [after](#rule-after) 규칙을 참고하세요.

편의를 위해 날짜 기반 규칙은 유창한 `date` 규칙 빌더를 사용하여 생성할 수 있습니다.

```php
use Illuminate\Validation\Rule;

'start_date' => [
    'required',
    Rule::date()->afterOrEqual(today()->addDays(7)),
],
```

<a name="rule-anyof"></a>
#### anyOf

`Rule::anyOf` 유효성 검증 규칙을 사용하면, 유효성 검증 대상 필드가 제공된 여러 검증 규칙셋 중 하나라도 만족해야 함을 지정할 수 있습니다. 예를 들어, 아래 규칙은 `username` 필드가 이메일 주소이거나, 6자 이상이며 알파벳, 숫자, 대시가 허용된 문자열(알파-대시)인지 검증합니다.

```php
use Illuminate\Validation\Rule;

'username' => [
    'required',
    Rule::anyOf([
        ['string', 'email'],
        ['string', 'alpha_dash', 'min:6'],
    ]),
],
```

<a name="rule-alpha"></a>
#### alpha

유효성 검증 대상 필드는 `\p{L}` 및 `\p{M}`에 속하는 유니코드 알파벳 문자만을 포함해야 합니다.

ASCII 범위(`a-z`, `A-Z`) 내 문자만 허용하려면, `ascii` 옵션을 규칙에 추가하세요.

```php
'username' => 'alpha:ascii',
```

<a name="rule-alpha-dash"></a>
#### alpha_dash

유효성 검증 대상 필드는 `\p{L}`, `\p{M}`, `\p{N}`에 속하는 유니코드 영문자와 숫자, 그리고 ASCII 대시(`-`), 밑줄(`_`)만 포함해야 합니다.

이 규칙을 ASCII 범위(`a-z`, `A-Z`, `0-9`)로 제한하려면 `ascii` 옵션을 추가하세요.

```php
'username' => 'alpha_dash:ascii',
```

<a name="rule-alpha-num"></a>
#### alpha_num

유효성 검증 대상 필드는 `\p{L}`, `\p{M}`, `\p{N}`에 해당하는 유니코드 영문자와 숫자만을 포함해야 합니다.

ASCII 범위(`a-z`, `A-Z`, `0-9`) 내로 제한하려면 `ascii` 옵션을 규칙에 추가할 수 있습니다.

```php
'username' => 'alpha_num:ascii',
```

<a name="rule-array"></a>
#### array

유효성 검증 대상 필드는 PHP의 `array`여야 합니다.

`array` 규칙에 값을 추가로 지정하면, 입력 배열의 각 키는 규칙에 지정한 값 중 하나여야 합니다. 아래 예시에서 입력 배열의 `admin` 키는 규칙에서 허용하지 않으므로 유효하지 않습니다.

```php
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

일반적으로 배열에서 허용할 수 있는 키를 항상 명시해 주는 것이 좋습니다.

<a name="rule-ascii"></a>
#### ascii

유효성 검증 대상 필드는 7비트 ASCII 문자만 포함해야 합니다.

<a name="rule-bail"></a>
#### bail

해당 필드에 대해 첫 번째 유효성 검증이 실패하면 이후의 검증 규칙을 실행하지 않고 중단합니다.

`bail` 규칙은 특정 필드에 대해서만 검증을 중단하지만, `stopOnFirstFailure` 메서드는 하나의 검증 실패가 발생하면 모든 속성에 대한 검증 자체를 중단하도록 검증자에게 알립니다.

```php
if ($validator->stopOnFirstFailure()->fails()) {
    // ...
}
```

<a name="rule-before"></a>
#### before:_date_

유효성 검증 대상 필드는 지정한 날짜보다 이전이어야 합니다. 날짜 값은 PHP의 `strtotime` 함수에 전달되어 유효한 `DateTime` 인스턴스로 변환됩니다. 추가로, [after](#rule-after) 규칙과 동일하게, 검증 중인 다른 필드명을 `date` 값으로 지정할 수도 있습니다.

편의상, 아래와 같이 유창한 `date` 규칙 빌더를 통해서도 작성할 수 있습니다.

```php
use Illuminate\Validation\Rule;

'start_date' => [
    'required',
    Rule::date()->before(today()->subDays(7)),
],
```

또한, `beforeToday` 및 `todayOrBefore` 메서드를 사용해 '오늘 이전' 또는 '오늘 또는 그 이전' 등 날짜 조건을 쉽게 표현할 수 있습니다.

```php
'start_date' => [
    'required',
    Rule::date()->beforeToday(),
],
```

<a name="rule-before-or-equal"></a>
#### before_or_equal:_date_

유효성 검증 대상 필드는 지정된 날짜보다 이전이거나 같은 값이어야 합니다. 날짜 값은 PHP의 `strtotime` 함수에 전달되어 유효한 `DateTime` 인스턴스로 변환됩니다. 또한 [after](#rule-after) 규칙과 마찬가지로, 검증 중인 다른 필드명을 `date` 값으로 지정할 수 있습니다.

유창한 `date` 규칙 빌더로도 편리하게 작성할 수 있습니다.

```php
use Illuminate\Validation\Rule;

'start_date' => [
    'required',
    Rule::date()->beforeOrEqual(today()->subDays(7)),
],
```

<a name="rule-between"></a>
#### between:_min_,_max_

유효성 검증 대상 필드는 지정된 _min_과 _max_ 사이의 크기(포함관계)여야 합니다. 문자열, 숫자, 배열, 파일의 크기 판정 방식은 [size](#rule-size) 규칙과 동일합니다.

<a name="rule-boolean"></a>
#### boolean

유효성 검증 대상 필드는 boolean(불리언)으로 변환될 수 있어야 합니다. 허용되는 값은 `true`, `false`, `1`, `0`, `"1"`, `"0"` 입니다.

<a name="rule-confirmed"></a>
#### confirmed

유효성 검증 대상 필드는 `{field}_confirmation`과 일치하는 값이 있어야 합니다. 예를 들어, 검증 대상이 `password`라면, 입력값에 `password_confirmation` 필드가 추가로 존재하고 두 값이 일치해야 합니다.

커스텀 확인 필드명을 지정할 수도 있습니다. 예를 들어, `confirmed:repeat_username`은 `repeat_username` 필드의 값이 검증 대상 필드와 동일해야 함을 의미합니다.

<a name="rule-contains"></a>
#### contains:_foo_,_bar_,...

유효성 검증 대상 필드는 지정한 모든 파라미터 값을 포함하는 배열이어야 합니다.

<a name="rule-current-password"></a>
#### current_password

유효성 검증 대상 필드는 인증된 사용자의 비밀번호와 일치해야 합니다. 규칙의 첫 번째 파라미터로 [인증 가드](/docs/authentication)를 지정할 수 있습니다.

```php
'password' => 'current_password:api'
```

<a name="rule-date"></a>
#### date

유효성 검증 대상 필드는 PHP의 `strtotime` 함수 기준으로 유효하고 상대적이지 않은 날짜여야 합니다.

<a name="rule-date-equals"></a>
#### date_equals:_date_

유효성 검증 대상 필드는 지정한 날짜와 동일해야 합니다. 날짜 값은 PHP의 `strtotime` 함수에 전달되어 유효한 `DateTime` 인스턴스로 변환됩니다.

<a name="rule-date-format"></a>
#### date_format:_format_,...

유효성 검증 대상 필드는 지정한 _formats_ 중 하나와 일치해야 합니다. 하나의 필드에서는 `date` 혹은 `date_format` 둘 중 하나만 사용해야 하며, 동시에 적용하지 않습니다. 이 유효성 검증 규칙은 PHP의 [DateTime](https://www.php.net/manual/en/class.datetime.php) 클래스가 지원하는 모든 형식을 지원합니다.

날짜 기반 규칙도 아래와 같이 유창한 `date` 빌더로 작성할 수 있습니다.

```php
use Illuminate\Validation\Rule;

'start_date' => [
    'required',
    Rule::date()->format('Y-m-d'),
],
```

<a name="rule-decimal"></a>
#### decimal:_min_,_max_

유효성 검증 대상 필드는 숫자이며, 지정한 소수점 자릿수를 가져야 합니다.

```php
// 소수점이 정확히 두 자리(예: 9.99)여야 함
'price' => 'decimal:2'

// 소수점 자릿수가 2~4 자리여야 함
'price' => 'decimal:2,4'
```

<a name="rule-declined"></a>
#### declined

유효성 검증 대상 필드는 `"no"`, `"off"`, `0`, `"0"`, `false`, `"false"` 값 중 하나여야 합니다.

<a name="rule-declined-if"></a>
#### declined_if:anotherfield,value,...

`anotherfield` 필드가 지정한 값과 같을 때, 유효성 검증 대상 필드는 `"no"`, `"off"`, `0`, `"0"`, `false`, `"false"` 값이어야 합니다.

<a name="rule-different"></a>
#### different:_field_

유효성 검증 대상 필드는 지정한 _field_와 서로 다른 값을 가져야 합니다.

<a name="rule-digits"></a>
#### digits:_value_

유효성 검증 대상 정수는 길이가 정확히 _value_여야 합니다.

<a name="rule-digits-between"></a>
#### digits_between:_min_,_max_

정수 유효성 검사는 길이가 _min_과 _max_ 사이여야 합니다.

<a name="rule-dimensions"></a>
#### dimensions

유효성 검증 대상 파일은 아래와 같이 규칙의 파라미터로 지정된 이미지 크기 제약 조건을 만족해야 합니다.

```php
'avatar' => 'dimensions:min_width=100,min_height=200'
```

사용 가능한 조건은 다음과 같습니다: _min_width_, _max_width_, _min_height_, _max_height_, _width_, _height_, _ratio_.

_ratio_ 조건은 너비를 높이로 나눈 값으로 지정하세요. 분수(`3/2`) 또는 실수(`1.5`) 형태 모두 지원합니다.

```php
'avatar' => 'dimensions:ratio=3/2'
```

이 규칙은 인자를 여러 개 받으므로, 아래와 같이 `Rule::dimensions` 메서드를 활용하면 더 편리하게 작성할 수 있습니다.

```php
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

배열을 검증할 때, 해당 필드는 중복된 값을 가져서는 안 됩니다.

```php
'foo.*.id' => 'distinct'
```

기본적으로 `distinct`는 느슨한(loosely) 비교를 사용합니다. 엄격한 비교(strict)를 원할 경우 규칙에 `strict` 파라미터를 추가하세요.

```php
'foo.*.id' => 'distinct:strict'
```

대소문자 차이를 무시하고 중복을 판단하려면 `ignore_case` 파라미터를 추가하세요.

```php
'foo.*.id' => 'distinct:ignore_case'
```

<a name="rule-doesnt-start-with"></a>
#### doesnt_start_with:_foo_,_bar_,...

유효성 검증 대상 필드는 지정된 값 중 하나로 시작해서는 안 됩니다.

<a name="rule-doesnt-end-with"></a>
#### doesnt_end_with:_foo_,_bar_,...

유효성 검증 대상 필드는 지정된 값 중 하나로 끝나서는 안 됩니다.

<a name="rule-email"></a>
#### email

유효성 검증 대상 필드는 이메일 주소 형식이어야 합니다. 이 검증 규칙은 이메일 주소의 유효성 검증을 위해 [egulias/email-validator](https://github.com/egulias/EmailValidator) 패키지를 사용합니다. 기본적으로 `RFCValidation` 이 적용되며, 다른 검증 방식도 적용할 수 있습니다.

```php
'email' => 'email:rfc,dns'
```

위 예시는 `RFCValidation`과 `DNSCheckValidation`을 동시에 적용하는 예시입니다. 적용 가능한 모든 검증 스타일은 다음과 같습니다.

<div class="content-list" markdown="1">

- `rfc`: `RFCValidation` - 이메일 주소가 [지원되는 RFC](https://github.com/egulias/EmailValidator?tab=readme-ov-file#supported-rfcs)를 만족하는지 검증합니다.
- `strict`: `NoRFCWarningsValidation` - [지원되는 RFC](https://github.com/egulias/EmailValidator?tab=readme-ov-file#supported-rfcs) 기준으로 검사하되, 경고(예: 마지막에 점이 있다거나 연속된 점이 여러 개 있는 경우 등)를 실패로 간주합니다.
- `dns`: `DNSCheckValidation` - 이메일 주소의 도메인이 유효한 MX 레코드가 있는지 확인합니다.
- `spoof`: `SpoofCheckValidation` - 이메일에 동형 문자(homograph)나 사기성 유니코드 문자가 포함되지 않았는지 검증합니다.
- `filter`: `FilterEmailValidation` - PHP의 `filter_var` 함수 기준으로 이메일 주소가 유효한지 검사합니다.
- `filter_unicode`: `FilterEmailValidation::unicode()` - PHP의 `filter_var` 함수 기준(일부 유니코드 문자 허용)으로 이메일 주소의 유효성을 검사합니다.

</div>

이메일 검증 규칙도 아래와 같이 유창한 rule 빌더를 사용하여 작성할 수 있습니다.

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
> `dns` 및 `spoof` 검증기는 PHP의 `intl` 확장 기능이 필요합니다.

<a name="rule-ends-with"></a>
#### ends_with:_foo_,_bar_,...

유효성 검증 대상 필드는 지정한 값 중 하나로 끝나야 합니다.

<a name="rule-enum"></a>
#### enum

`Enum` 규칙은 클래스 기반 규칙으로, 유효성 검증 대상 필드가 유효한 열거형(enum) 값인지 검증합니다. `Enum` 규칙의 생성자 인자로 열거형 클래스명을 지정합니다. 원시값(primitive value, backed enum)을 검증할 때는 해당 enum을 전달해야 합니다.

```php
use App\Enums\ServerStatus;
use Illuminate\Validation\Rule;

$request->validate([
    'status' => [Rule::enum(ServerStatus::class)],
]);
```

`Enum` 규칙의 `only` 및 `except` 메서드로 사용할 수 있는 enum 케이스를 제한할 수 있습니다.

```php
Rule::enum(ServerStatus::class)
    ->only([ServerStatus::Pending, ServerStatus::Active]);

Rule::enum(ServerStatus::class)
    ->except([ServerStatus::Pending, ServerStatus::Active]);
```

`when` 메서드를 사용하면 조건에 따라 `Enum` 규칙을 다르게 적용할 수 있습니다.

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

유효성 검증 대상 필드는 `validate` 및 `validated` 메서드로 반환되는 요청 데이터에서 제외됩니다.

<a name="rule-exclude-if"></a>
#### exclude_if:_anotherfield_,_value_

`anotherfield` 값이 _value_와 일치하면, 유효성 검증 대상 필드는 `validate` 및 `validated` 메서드로 반환되는 요청 데이터에서 제외됩니다.

복잡한 조건의 제외 로직이 필요할 때는 `Rule::excludeIf` 메서드를 사용할 수 있습니다. 이 메서드는 불리언이나 클로저를 받아, 클로저의 반환값이 `true`라면 해당 필드를 제외합니다.

```php
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

유효성 검증 대상 필드는 _anotherfield_의 값이 _value_와 일치하지 않으면 `validate`, `validated` 메서드 반환값에서 제외됩니다. 만약 _value_로 `null`을 지정하면(`exclude_unless:name,null`), 비교 대상 필드가 `null`이거나, 해당 필드가 요청 데이터에 없을 경우에만 필드가 유지됩니다.

<a name="rule-exclude-with"></a>
#### exclude_with:_anotherfield_

`anotherfield`가 있으면, 유효성 검증 대상 필드는 `validate`, `validated` 반환값에서 제외됩니다.

<a name="rule-exclude-without"></a>
#### exclude_without:_anotherfield_

`anotherfield`가 없는 경우에 유효성 검증 대상 필드를 `validate`, `validated` 반환값에서 제외합니다.

<a name="rule-exists"></a>
#### exists:_table_,_column_

유효성 검증 대상 데이터는 지정한 데이터베이스 테이블에 존재해야 합니다.

<a name="basic-usage-of-exists-rule"></a>
#### exists 규칙의 기본 사용법

```php
'state' => 'exists:states'
```

`column` 옵션을 지정하지 않으면, 필드명이 자동으로 사용됩니다. 위 예시에서는 데이터베이스 `states` 테이블에 `state` 컬럼의 값이 요청의 `state` 값과 일치하는 레코드가 존재하는지 검증합니다.

<a name="specifying-a-custom-column-name"></a>
#### 커스텀 컬럼명 지정

규칙에서 사용할 데이터베이스 컬럼명을 테이블명 뒤에 명시적으로 지정할 수 있습니다.

```php
'state' => 'exists:states,abbreviation'
```

경우에 따라 특정 데이터베이스 커넥션을 사용할 필요가 있다면, 테이블명 앞에 커넥션명을 붙이면 됩니다.

```php
'email' => 'exists:connection.staff,email'
```

테이블명을 직접 지정하는 대신, Eloquent 모델명을 지정하여 자동으로 테이블명을 결정할 수도 있습니다.

```php
'user_id' => 'exists:App\Models\User,id'
```

규칙이 실행하는 쿼리를 세밀하게 제어하고 싶다면, `Rule` 클래스를 이용해 유창하게 규칙을 정의할 수 있습니다. 아래 예시에서는 규칙 나열 시 `|` 대신 배열을 사용합니다.

```php
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

`Rule::exists` 메서드의 두 번째 인자로 컬럼명을 명시하면, 해당 컬럼을 기준으로 규칙이 동작합니다.

```php
'state' => Rule::exists('states', 'abbreviation'),
```

배열로 이루어진 값들이 데이터베이스에 존재하는지 일괄 검증하려면, 해당 필드에 `exists` 및 [array](#rule-array) 규칙을 모두 추가하세요.

```php
'states' => ['array', Rule::exists('states', 'abbreviation')],
```

이렇게 두 규칙을 동시에 지정하면, 라라벨은 지정된 모든 값이 테이블에 존재하는지 한 번의 쿼리로 확인합니다.

<a name="rule-extensions"></a>
#### extensions:_foo_,_bar_,...

유효성 검증 대상 파일은 사용자 할당 확장자가 명시된 확장자 목록 중 하나와 일치해야 합니다.

```php
'photo' => ['required', 'extensions:jpg,png'],
```

> [!WARNING]
> 파일의 확장자만으로 검증에 의존해서는 안 됩니다. 이 규칙은 보통 반드시 [mimes](#rule-mimes)나 [mimetypes](#rule-mimetypes) 규칙과 함께 사용해야 합니다.

<a name="rule-file"></a>
#### file

유효성 검증 대상 필드는 업로드에 성공한 파일이어야 합니다.

<a name="rule-filled"></a>
#### filled

유효성 검증 대상 필드는 값이 존재할 경우 비어 있으면 안 됩니다.

<a name="rule-gt"></a>
#### gt:_field_

유효성 검증 대상 필드는 지정된 _field_ 또는 _value_보다 더 커야 합니다. 두 필드는 반드시 같은 타입이어야 합니다. 문자열, 숫자, 배열, 파일 모두 [size](#rule-size) 규칙의 동일한 기준으로 비교합니다.

<a name="rule-gte"></a>
#### gte:_field_

유효성 검증 대상 필드는 지정한 _field_ 또는 _value_보다 크거나 같아야 합니다. 두 필드는 반드시 같은 타입이어야 하며, 비교 방법은 [size](#rule-size) 규칙과 동일합니다.

<a name="rule-hex-color"></a>
#### hex_color

유효성 검증 대상 필드는 [16진수 색상 값(hexadecimal)](https://developer.mozilla.org/en-US/docs/Web/CSS/hex-color)이어야 합니다.

<a name="rule-image"></a>
#### image

유효성 검증 대상 파일은 이미지여야 하며, 지원하는 확장자는 jpg, jpeg, png, bmp, gif, webp 입니다.

> [!WARNING]
> 기본적으로 image 규칙은 XSS 취약점 가능성 때문에 SVG 파일을 허용하지 않습니다. SVG 파일을 허용하려면 해당 규칙에 `allow_svg` 옵션을 추가하세요 (`image:allow_svg`).

<a name="rule-in"></a>
#### in:_foo_,_bar_,...

유효성 검증 대상 필드는 지정한 값 목록 안에 포함되어야 합니다. 이 규칙은 배열을 `implode`로 변환할 일이 많으므로, `Rule::in` 메서드를 활용하면 규칙을 더 유연하게 작성할 수 있습니다.

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($data, [
    'zones' => [
        'required',
        Rule::in(['first-zone', 'second-zone']),
    ],
]);
```

또한 `in` 규칙과 `array` 규칙을 동시에 사용할 때, 입력 배열의 모든 값이 `in` 규칙에 지정된 값 목록에 포함되어야 합니다. 아래 예시에서 입력 배열의 `LAS`는 `in` 목록에 없으므로 유효하지 않습니다.

```php
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

검증 대상 필드는 _anotherfield_ 필드의 값 중 하나여야 합니다.

<a name="rule-integer"></a>
#### integer

검증 대상 필드는 정수여야 합니다.

> [!WARNING]
> 이 유효성 검사는 입력값이 실제 "정수" 변수 타입인지 확인하지 않으며, PHP의 `FILTER_VALIDATE_INT` 규칙에 의해 인정되는 타입만 검사합니다. 숫자인지 확인하고 싶다면 [numeric 유효성 검사 규칙](#rule-numeric)과 함께 사용하시기 바랍니다.

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

검증 대상 필드는 지정된 _field_ 보다 작아야 합니다. 두 필드는 동일한 타입이어야 합니다. 문자열, 숫자, 배열, 파일은 [size](#rule-size) 규칙과 동일한 방식으로 평가됩니다.

<a name="rule-lte"></a>
#### lte:_field_

검증 대상 필드는 지정된 _field_ 보다 작거나 같아야 합니다. 두 필드는 동일한 타입이어야 합니다. 문자열, 숫자, 배열, 파일은 [size](#rule-size) 규칙과 동일한 방식으로 평가됩니다.

<a name="rule-lowercase"></a>
#### lowercase

검증 대상 필드는 소문자여야 합니다.

<a name="rule-list"></a>
#### list

검증 대상 필드는 리스트 형태의 배열이어야 합니다. 배열이 리스트로 간주되려면, 키가 0부터 `count($array) - 1`까지 연속된 숫자여야 합니다.

<a name="rule-mac"></a>
#### mac_address

검증 대상 필드는 MAC 주소여야 합니다.

<a name="rule-max"></a>
#### max:_value_

검증 대상 필드는 최대 _value_ 이하여야 합니다. 문자열, 숫자, 배열, 파일은 [size](#rule-size) 규칙과 동일한 방식으로 평가됩니다.

<a name="rule-max-digits"></a>
#### max_digits:_value_

검증 대상 정수는 최대 길이가 _value_ 이하여야 합니다.

<a name="rule-mimetypes"></a>
#### mimetypes:_text/plain_,...

검증 대상 파일은 다음 중 하나의 MIME 타입과 일치해야 합니다:

```php
'video' => 'mimetypes:video/avi,video/mpeg,video/quicktime'
```

업로드된 파일의 MIME 타입을 확인하기 위해 파일의 내용을 직접 읽고, 프레임워크가 MIME 타입을 추정합니다. 이 값은 클라이언트에서 제공하는 MIME 타입과 다를 수 있습니다.

<a name="rule-mimes"></a>
#### mimes:_foo_,_bar_,...

검증 대상 파일은 나열된 확장자에 대응하는 MIME 타입을 가져야 합니다:

```php
'photo' => 'mimes:jpg,bmp,png'
```

확장자만 지정하면 되지만, 실제로 이 규칙은 파일 내용으로부터 MIME 타입을 추정하여 검사합니다. 전체 MIME 타입과 그에 해당하는 확장자는 아래 주소에서 확인할 수 있습니다.

[https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types](https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types)

<a name="mime-types-and-extensions"></a>
#### MIME 타입과 확장자

이 유효성 검사 규칙은 MIME 타입과 사용자가 지정한 파일 확장자가 일치하는지 확인하지 않습니다. 예를 들어, `mimes:png` 유효성 검사 규칙은 파일 내용이 올바른 PNG라면 파일명이 `photo.txt`여도 PNG 파일로 인정합니다. 파일의 사용자 지정 확장자까지 검사하려면 [extensions](#rule-extensions) 규칙을 사용할 수 있습니다.

<a name="rule-min"></a>
#### min:_value_

검증 대상 필드는 최소 _value_ 이상이어야 합니다. 문자열, 숫자, 배열, 파일은 [size](#rule-size) 규칙과 동일하게 평가됩니다.

<a name="rule-min-digits"></a>
#### min_digits:_value_

검증 대상 정수는 최소 길이가 _value_ 이상이어야 합니다.

<a name="rule-multiple-of"></a>
#### multiple_of:_value_

검증 대상 필드는 _value_ 의 배수여야 합니다.

<a name="rule-missing"></a>
#### missing

검증 대상 필드는 입력 데이터에 존재하지 않아야 합니다.

<a name="rule-missing-if"></a>
#### missing_if:_anotherfield_,_value_,...

_또 다른 필드_(_anotherfield_)가 _value_ 중 하나와 같을 때, 검증 대상 필드는 입력 데이터에 존재하지 않아야 합니다.

<a name="rule-missing-unless"></a>
#### missing_unless:_anotherfield_,_value_

_또 다른 필드_(_anotherfield_)가 _value_ 중 하나와 같지 않은 경우에만, 검증 대상 필드는 입력 데이터에 존재하지 않아야 합니다.

<a name="rule-missing-with"></a>
#### missing_with:_foo_,_bar_,...

명시된 다른 필드 중 하나라도 입력 데이터에 있을 경우에만, 검증 대상 필드는 존재하지 않아야 합니다.

<a name="rule-missing-with-all"></a>
#### missing_with_all:_foo_,_bar_,...

명시된 모든 필드가 입력 데이터에 있을 경우에만, 검증 대상 필드는 존재하지 않아야 합니다.

<a name="rule-not-in"></a>
#### not_in:_foo_,_bar_,...

검증 대상 필드는 지정된 값 목록에 포함되면 안 됩니다. `Rule::notIn` 메서드를 사용하여 규칙을 유연하게 작성할 수 있습니다:

```php
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

검증 대상 필드는 지정된 정규식 패턴과 일치하면 안 됩니다.

내부적으로 이 규칙은 PHP의 `preg_match` 함수를 사용합니다. 지정한 패턴은 `preg_match`가 요구하는 형식이어야 하며, 올바른 구분자도 포함되어야 합니다. 예시: `'email' => 'not_regex:/^.+$/i'`.

> [!WARNING]
> `regex` 또는 `not_regex` 패턴을 사용할 때, 정규식에 `|` 문자가 포함되어 있다면 유효성 규칙을 배열로 지정해야 할 수도 있습니다.

<a name="rule-nullable"></a>
#### nullable

검증 대상 필드는 `null` 값일 수 있습니다.

<a name="rule-numeric"></a>
#### numeric

검증 대상 필드는 [숫자](https://www.php.net/manual/en/function.is-numeric.php)여야 합니다.

<a name="rule-present"></a>
#### present

검증 대상 필드는 입력 데이터에 반드시 존재해야 합니다.

<a name="rule-present-if"></a>
#### present_if:_anotherfield_,_value_,...

_또 다른 필드_(_anotherfield_)가 _value_ 중 하나와 같을 때, 검증 대상 필드는 반드시 존재해야 합니다.

<a name="rule-present-unless"></a>
#### present_unless:_anotherfield_,_value_

_또 다른 필드_(_anotherfield_)가 _value_ 중 하나와 같지 않을 때에만, 검증 대상 필드는 입력 데이터에 반드시 존재해야 합니다.

<a name="rule-present-with"></a>
#### present_with:_foo_,_bar_,...

명시된 다른 필드 중 하나라도 입력 데이터에 있을 때에만, 검증 대상 필드는 반드시 존재해야 합니다.

<a name="rule-present-with-all"></a>
#### present_with_all:_foo_,_bar_,...

명시된 모든 필드가 입력 데이터에 있을 때에만, 검증 대상 필드는 반드시 존재해야 합니다.

<a name="rule-prohibited"></a>
#### prohibited

검증 대상 필드는 입력 데이터에 없어야 하거나 비어 있어야 합니다. "비어 있음"은 다음 조건 중 하나를 만족하면 해당됩니다.

<div class="content-list" markdown="1">

- 값이 `null`인 경우
- 값이 빈 문자열인 경우
- 값이 빈 배열 또는 빈 `Countable` 객체인 경우
- 업로드된 파일의 경로가 비어 있는 경우

</div>

<a name="rule-prohibited-if"></a>
#### prohibited_if:_anotherfield_,_value_,...

_또 다른 필드_(_anotherfield_)가 _value_ 중 하나와 같을 때, 검증 대상 필드는 없어야 하거나 비어 있어야 합니다. "비어 있음"은 다음 조건 중 하나를 만족하면 해당됩니다.

<div class="content-list" markdown="1">

- 값이 `null`인 경우
- 값이 빈 문자열인 경우
- 값이 빈 배열 또는 빈 `Countable` 객체인 경우
- 업로드된 파일의 경로가 비어 있는 경우

</div>

복잡한 조건의 금지 로직이 필요하다면, `Rule::prohibitedIf` 메서드를 사용할 수 있습니다. 이 메서드는 불리언 값이나 클로저(익명 함수)를 받아, 반환값이 `true`이면 해당 필드를 금지(없거나 비었어야 함)로 처리합니다:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($request->all(), [
    'role_id' => Rule::prohibitedIf($request->user()->is_admin),
]);

Validator::make($request->all(), [
    'role_id' => Rule::prohibitedIf(fn () => $request->user()->is_admin),
]);
```
<a name="rule-prohibited-if-accepted"></a>
#### prohibited_if_accepted:_anotherfield_,...

_또 다른 필드_(_anotherfield_)의 값이 `"yes"`, `"on"`, `1`, `"1"`, `true`, `"true"` 중 하나일 때, 검증 대상 필드는 없어야 하거나 비어 있어야 합니다.

<a name="rule-prohibited-if-declined"></a>
#### prohibited_if_declined:_anotherfield_,...

_또 다른 필드_(_anotherfield_)의 값이 `"no"`, `"off"`, `0`, `"0"`, `false`, `"false"` 중 하나일 때, 검증 대상 필드는 없어야 하거나 비어 있어야 합니다.

<a name="rule-prohibited-unless"></a>
#### prohibited_unless:_anotherfield_,_value_,...

_또 다른 필드_(_anotherfield_)가 _value_ 중 하나와 같지 않으면, 검증 대상 필드는 입력 데이터에 없어야 하거나 비어 있어야 합니다. "비어 있음"의 기준은 다음과 같습니다.

<div class="content-list" markdown="1">

- 값이 `null`인 경우
- 값이 빈 문자열인 경우
- 값이 빈 배열 또는 빈 `Countable` 객체인 경우
- 업로드된 파일의 경로가 비어 있는 경우

</div>

<a name="rule-prohibits"></a>
#### prohibits:_anotherfield_,...

검증 대상 필드가 존재하며 비어 있지 않은 경우, _anotherfield_에 명시된 모든 필드는 입력 데이터에 없어야 하거나 비어 있어야 합니다. "비어 있음"의 기준은 다음과 같습니다.

<div class="content-list" markdown="1">

- 값이 `null`인 경우
- 값이 빈 문자열인 경우
- 값이 빈 배열 또는 빈 `Countable` 객체인 경우
- 업로드된 파일의 경로가 비어 있는 경우

</div>

<a name="rule-regex"></a>
#### regex:_pattern_

검증 대상 필드는 지정된 정규식 패턴과 일치해야 합니다.

이 규칙은 내부적으로 PHP의 `preg_match` 함수를 사용합니다. 지정하는 패턴은 `preg_match` 규칙과 동일하게 올바른 구분자를 포함해야 합니다. 예시: `'email' => 'regex:/^.+@.+$/i'`.

> [!WARNING]
> `regex` 또는 `not_regex` 패턴을 사용할 때, 정규식 내에 `|` 문자가 들어가 있다면 `|` 구분자가 아니라 배열로 규칙을 지정하는 것이 더 안전합니다.

<a name="rule-required"></a>
#### required

검증 대상 필드는 입력 데이터에 존재하며 비어 있지 않아야 합니다. "비어 있음"은 아래 조건 중 하나를 만족합니다.

<div class="content-list" markdown="1">

- 값이 `null`인 경우
- 값이 빈 문자열인 경우
- 값이 빈 배열 또는 빈 `Countable` 객체인 경우
- 업로드된 파일의 경로가 없을 경우

</div>

<a name="rule-required-if"></a>
#### required_if:_anotherfield_,_value_,...

_또 다른 필드_(_anotherfield_)의 값이 _value_ 중 하나와 같을 때, 검증 대상 필드는 존재하며 비어 있지 않아야 합니다.

`required_if` 규칙에서 더 복잡한 조건을 지정하려면 `Rule::requiredIf` 메서드를 사용할 수 있습니다. 이 메서드는 불리언 값이나 클로저(익명 함수)를 받아, 반환값이 `true`이면 해당 필드를 필수로 처리합니다:

```php
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

_또 다른 필드_(_anotherfield_)의 값이 `"yes"`, `"on"`, `1`, `"1"`, `true`, `"true"` 중 하나일 때, 검증 대상 필드는 존재하며 비어 있지 않아야 합니다.

<a name="rule-required-if-declined"></a>
#### required_if_declined:_anotherfield_,...

_또 다른 필드_(_anotherfield_)의 값이 `"no"`, `"off"`, `0`, `"0"`, `false`, `"false"` 중 하나일 때, 검증 대상 필드는 존재하며 비어 있지 않아야 합니다.

<a name="rule-required-unless"></a>
#### required_unless:_anotherfield_,_value_,...

_또 다른 필드_(_anotherfield_)가 _value_ 중 하나와 같지 않을 때, 검증 대상 필드는 존재하며 비어 있지 않아야 합니다. 또한, _value_가 `null`일 경우(`required_unless:name,null`), 비교 대상 필드 값이 `null`이거나 해당 필드가 요청 데이터에 없는 경우를 제외하고 필수 입력으로 처리됩니다.

<a name="rule-required-with"></a>
#### required_with:_foo_,_bar_,...

명시된 다른 필드 중 하나라도 존재하며 비어 있지 않을 때에만, 검증 대상 필드는 존재하며 비어 있지 않아야 합니다.

<a name="rule-required-with-all"></a>
#### required_with_all:_foo_,_bar_,...

명시된 모든 필드가 존재하며 비어 있지 않을 때에만, 검증 대상 필드는 존재하며 비어 있지 않아야 합니다.

<a name="rule-required-without"></a>
#### required_without:_foo_,_bar_,...

명시된 다른 필드 중 어느 하나라도 비어 있거나 존재하지 않을 경우에만, 검증 대상 필드는 존재하며 비어 있지 않아야 합니다.

<a name="rule-required-without-all"></a>
#### required_without_all:_foo_,_bar_,...

명시된 모든 필드가 모두 비어 있거나 존재하지 않을 경우에만, 검증 대상 필드는 존재하며 비어 있지 않아야 합니다.

<a name="rule-required-array-keys"></a>
#### required_array_keys:_foo_,_bar_,...

검증 대상 필드는 배열이어야 하며, 지정된 키들을 반드시 포함해야 합니다.

<a name="rule-same"></a>
#### same:_field_

지정된 _field_의 값이 검증 대상 필드와 일치해야 합니다.

<a name="rule-size"></a>
#### size:_value_

검증 대상 필드는 _value_와 크기가 같아야 합니다. 문자열일 경우 _value_는 문자 수, 숫자일 경우 _value_는 정수 값(해당 속성에 `numeric` 또는 `integer` 규칙도 함께 적용되어야 함), 배열일 경우 배열의 `count` 값, 파일일 경우 크기는 K바이트 단위로 계산됩니다. 예시를 살펴보겠습니다:

```php
// 문자열이 바로 12글자인지 검증...
'title' => 'size:12';

// 입력된 정수가 10인지 검증...
'seats' => 'integer|size:10';

// 배열이 정확히 5개의 요소를 갖는지 검증...
'tags' => 'array|size:5';

// 업로드된 파일 크기가 정확히 512KB인지 검증...
'image' => 'file|size:512';
```

<a name="rule-starts-with"></a>
#### starts_with:_foo_,_bar_,...

검증 대상 필드는 지정된 값 중 하나로 시작해야 합니다.

<a name="rule-string"></a>
#### string

검증 대상 필드는 문자열이어야 합니다. `null` 값도 허용하고 싶다면 해당 필드에 `nullable` 규칙을 함께 지정해야 합니다.

<a name="rule-timezone"></a>
#### timezone

검증 대상 필드는 `DateTimeZone::listIdentifiers` 메서드에 따라 유효한 시간대 식별자여야 합니다.

[DateTimeZone::listIdentifiers 메서드가 허용하는 매개변수](https://www.php.net/manual/en/datetimezone.listidentifiers.php)도 이 유효성 검사 규칙에 전달할 수 있습니다:

```php
'timezone' => 'required|timezone:all';

'timezone' => 'required|timezone:Africa';

'timezone' => 'required|timezone:per_country,US';
```

<a name="rule-unique"></a>
#### unique:_table_,_column_

검증 대상 필드는 지정된 데이터베이스 테이블에서 존재하지 않아야 합니다.

**사용자 정의 테이블/컬럼명 지정:**

테이블명을 직접 지정하는 대신, Eloquent 모델을 전달하여 모델에 바인딩된 테이블명으로 검사할 수 있습니다:

```php
'email' => 'unique:App\Models\User,email_address'
```

`column` 옵션을 지정하면 해당 컬럼명으로 검사합니다. `column` 옵션이 지정되지 않으면, 검증 대상 필드의 이름이 컬럼명으로 사용됩니다.

```php
'email' => 'unique:users,email_address'
```

**사용자 정의 데이터베이스 커넥션 지정**

Validator에서 쿼리를 보낼 때 커스텀 커넥션을 사용하고 싶다면, 테이블명 앞에 커넥션명을 붙이면 됩니다:

```php
'email' => 'unique:connection.users,email_address'
```

**특정 ID는 고유성 검사에서 무시하도록 강제하기:**

프로필 수정 화면처럼, 사용자가 기존의 이메일 주소를 그대로 두고 이름만 변경하는 경우, 이메일 필드에 대해 고유성 오류가 발생하지 않도록 특정 ID는 검사에서 제외해야 할 수 있습니다.

이럴 때는 `Rule` 클래스를 이용해 고유성 규칙을 정의할 수 있습니다. 규칙을 배열로 지정하는 방법도 함께 사용합니다:

```php
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
> 절대로 사용자 입력값을 `ignore` 메서드에 직접 전달하면 안 됩니다. 반드시 자동 증가 ID나 Eloquent 모델 인스턴스의 UUID 등 시스템이 생성한 고유 식별자만 전달하세요. 그렇지 않으면 SQL 인젝션 공격에 노출될 수 있습니다.

`ignore` 메서드에는 모델의 키 값 대신 전체 모델 인스턴스를 전달할 수도 있습니다. 이 경우 라라벨이 자동으로 키 값만 추출합니다:

```php
Rule::unique('users')->ignore($user)
```

테이블의 기본키 컬럼명이 `id`가 아니라면, 두 번째 인자로 커스텀 컬럼명을 지정할 수 있습니다:

```php
Rule::unique('users')->ignore($user->id, 'user_id')
```

기본적으로 `unique` 규칙은 검증 중인 필드명과 동일한 컬럼에서 고유성을 검사합니다. 다른 컬럼을 쓰고 싶다면 두 번째 인자로 컬럼명을 지정합니다:

```php
Rule::unique('users', 'email_address')->ignore($user->id)
```

**추가 조건(where) 추가:**

쿼리에 추가 조건을 넣고 싶다면 `where` 메서드를 사용할 수 있습니다. 예를 들어, `account_id` 컬럼 값이 1인 경우만 검사하도록 할 수 있습니다:

```php
'email' => Rule::unique('users')->where(fn (Builder $query) => $query->where('account_id', 1))
```

**소프트 삭제된 레코드 제외하기:**

기본적으로 unique 규칙은 소프트 삭제된 레코드를 포함해서 고유성을 검사합니다. 소프트 삭제된 레코드는 제외하고 검사하려면 `withoutTrashed` 메서드를 호출하면 됩니다:

```php
Rule::unique('users')->withoutTrashed();
```

모델에서 소프트 삭제 컬럼 이름이 `deleted_at`이 아니라면, 아래처럼 컬럼명을 직접 지정할 수 있습니다:

```php
Rule::unique('users')->withoutTrashed('was_deleted_at');
```

<a name="rule-uppercase"></a>
#### uppercase

검증 대상 필드는 모두 대문자여야 합니다.

<a name="rule-url"></a>
#### url

검증 대상 필드는 올바른 URL이어야 합니다.

특정 URL 프로토콜을 허용하고 싶다면, 프로토콜을 유효성 검사 규칙 파라미터로 전달할 수 있습니다:

```php
'url' => 'url:http,https',

'game' => 'url:minecraft,steam',
```

<a name="rule-ulid"></a>
#### ulid

검증 대상 필드는 [ULID(Universally Unique Lexicographically Sortable Identifier)](https://github.com/ulid/spec) 표준에 맞는 ULID여야 합니다.

<a name="rule-uuid"></a>
#### uuid

검증 대상 필드는 RFC 9562(버전 1, 3, 4, 5, 6, 7, 8)의 UUID이어야 합니다.

특정 UUID 버전에 맞는 값인지 추가로 검증할 수도 있습니다:

```php
'uuid' => 'uuid:4'
```

<a name="conditionally-adding-rules"></a>
## 조건부 규칙 추가하기

<a name="skipping-validation-when-fields-have-certain-values"></a>
#### 특정 값일 때 유효성 검사 건너뛰기

다른 필드가 특정 값일 때, 일부 필드를 유효성 검사 대상에서 제외하고 싶을 때가 있습니다. 이럴 때는 `exclude_if` 유효성 검사 규칙을 쓸 수 있습니다. 아래 예시에서는, `has_appointment` 필드가 `false`일 때 `appointment_date`와 `doctor_name` 필드는 검사하지 않습니다:

```php
use Illuminate\Support\Facades\Validator;

$validator = Validator::make($data, [
    'has_appointment' => 'required|boolean',
    'appointment_date' => 'exclude_if:has_appointment,false|required|date',
    'doctor_name' => 'exclude_if:has_appointment,false|required|string',
]);
```

또는, `exclude_unless` 규칙을 사용하여, 다른 필드가 특정 값이 아닐 때 유효성 검사를 건너뛸 수도 있습니다:

```php
$validator = Validator::make($data, [
    'has_appointment' => 'required|boolean',
    'appointment_date' => 'exclude_unless:has_appointment,true|required|date',
    'doctor_name' => 'exclude_unless:has_appointment,true|required|string',
]);
```

<a name="validating-when-present"></a>

#### 존재할 때만 유효성 검사하기

특정 상황에서는, 데이터에 특정 필드가 **존재할 때에만** 그 필드에 대해 유효성 검사를 수행하고 싶을 수 있습니다. 이를 간단하게 구현하려면, 규칙 목록에 `sometimes` 규칙을 추가하면 됩니다.

```php
$validator = Validator::make($data, [
    'email' => 'sometimes|required|email',
]);
```

위 예시에서는, `$data` 배열에 `email` 필드가 있을 때에만 해당 필드가 유효성 검사 대상이 됩니다.

> [!NOTE]
> 필드가 항상 존재해야 하긴 하지만 비어 있을 수도 있는 경우라면, [옵션 필드에 관한 주석](#a-note-on-optional-fields)을 참고하십시오.

<a name="complex-conditional-validation"></a>
#### 복잡한 조건부 유효성 검증

때로는 더욱 복잡한 조건에 따라 유효성 검증 규칙을 추가하고 싶을 수 있습니다. 예를 들어, 특정 필드의 값이 100을 초과할 때에만 다른 필드를 필수로 요구하거나, 특정 필드가 존재할 때만 두 개의 필드가 일정한 값을 갖기를 바랄 수 있습니다. 이런 검증 규칙을 추가하는 일이 복잡할 필요는 없습니다. 먼저, _항상 적용되는_ 기본 규칙들을 이용해 `Validator` 인스턴스를 생성합니다.

```php
use Illuminate\Support\Facades\Validator;

$validator = Validator::make($request->all(), [
    'email' => 'required|email',
    'games' => 'required|integer|min:0',
]);
```

이제 웹 애플리케이션이 게임 수집가들을 위한 것이라고 가정해보겠습니다. 만약 게임 수집가가 회원가입할 때 자신이 100개가 넘는 게임을 소유하고 있다면, 왜 그렇게 많은 게임을 가지고 있는지 설명하도록 요구하고 싶을 수 있습니다. 예를 들어, 게임 재판매점을 운영하거나, 단순히 수집이 취미일 수도 있습니다. 이런 조건부 요구 사항을 추가하려면, `Validator` 인스턴스의 `sometimes` 메서드를 사용할 수 있습니다.

```php
use Illuminate\Support\Fluent;

$validator->sometimes('reason', 'required|max:500', function (Fluent $input) {
    return $input->games >= 100;
});
```

`sometimes` 메서드의 첫 번째 인자는 조건부로 유효성 검증할 필드 이름이고, 두 번째 인자는 추가할 규칙들의 배열입니다. 그리고 세 번째 인자로 전달하는 클로저가 `true`를 반환하면 해당 규칙이 적용됩니다. 이 방식을 사용하면 복잡한 조건부 유효성 검사를 아주 쉽게 구현할 수 있습니다. 여러 필드에 대해 조건부 규칙을 동시에 추가할 수도 있습니다.

```php
$validator->sometimes(['reason', 'cost'], 'required', function (Fluent $input) {
    return $input->games >= 100;
});
```

> [!NOTE]
> 클로저에 전달되는 `$input` 매개변수는 `Illuminate\Support\Fluent` 인스턴스이며, 검증 대상의 입력값과 파일 등에 접근할 수 있습니다.

<a name="complex-conditional-array-validation"></a>
#### 복잡한 조건부 배열 유효성 검증

때로는 배열 안에 있는, 인덱스를 알 수 없는 다른 필드의 값을 기준으로 유효성 검증을 해야 할 때가 있습니다. 이런 상황에서는, 클로저가 배열 요소 각각을 나타내는 두 번째 인자를 받을 수 있도록 할 수 있습니다.

```php
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

클로저의 `$input` 매개변수와 마찬가지로, `$item` 역시 속성 데이터가 배열이면 `Illuminate\Support\Fluent` 인스턴스이고, 그렇지 않으면 문자열이 됩니다.

<a name="validating-arrays"></a>
## 배열 유효성 검증

[배열 유효성 규칙 문서](#rule-array)에서 설명한 것처럼, `array` 규칙은 허용할 배열 키 목록을 지정할 수 있습니다. 배열에 허용한 키 이외의 키가 존재하면 유효성 검증이 실패합니다.

```php
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

일반적으로 배열 내에 허용되는 배열 키를 명확히 지정해주는 것이 좋습니다. 그렇지 않으면, 검증기의 `validate` 및 `validated` 메서드는 배열 전체와 (다른 하위 배열 유효성 규칙에서 검증하지 않았더라도) 모든 키를 포함한 값을 반환합니다.

<a name="validating-nested-array-input"></a>
### 중첩 배열 입력 유효성 검사

폼 입력 필드가 배열로 중첩되어 있어도, 유효성 검증은 어렵지 않습니다. 배열 안의 속성을 점(`.`) 표기법을 사용하여 검증할 수 있습니다. 예를 들어, HTTP 요청 데이터에 `photos[profile]` 필드가 포함되어 있다면 다음과 같이 검증할 수 있습니다.

```php
use Illuminate\Support\Facades\Validator;

$validator = Validator::make($request->all(), [
    'photos.profile' => 'required|image',
]);
```

배열의 각 요소에 대해서도 유효성 검증을 수행할 수 있습니다. 예를 들어, 주어진 배열 입력 필드 내의 모든 이메일이 고유해야 한다면 다음과 같이 작성할 수 있습니다.

```php
$validator = Validator::make($request->all(), [
    'person.*.email' => 'email|unique:users',
    'person.*.first_name' => 'required_with:person.*.last_name',
]);
```

마찬가지로, [언어 파일에서 커스텀 유효성 메시지](#custom-messages-for-specific-attributes)를 지정할 때도 `*` 문자를 사용할 수 있어, 배열 기반 필드에 대해 하나의 검증 메시지를 간편하게 사용할 수 있습니다.

```php
'custom' => [
    'person.*.email' => [
        'unique' => 'Each person must have a unique email address',
    ]
],
```

<a name="accessing-nested-array-data"></a>
#### 중첩 배열 데이터 접근하기

속성에 유효성 규칙을 할당할 때, 중첩 배열의 특정 요소 값을 참조해야 할 때가 있습니다. 이럴 때는 `Rule::forEach` 메서드를 사용하면 됩니다. `forEach` 메서드는 유효성 검증 대상인 배열 속성의 각 반복마다 호출될 클로저를 받으며, 해당 배열 요소의 값과 완전히 확장된 속성 이름을 인자로 제공합니다. 클로저는 해당 배열 요소에 적용할 규칙 배열을 반환해야 합니다.

```php
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
### 에러 메시지에서 인덱스 및 순번 표시

배열 검증 시, 어플리케이션에서 보여줄 에러 메시지에, 검증 실패 항목의 인덱스(번호)나 순번을 참조하고 싶을 수 있습니다. 이를 위해 [커스텀 유효성 메시지](#manual-customizing-the-error-messages)에서 `:index`(0부터 시작)와 `:position`(1부터 시작) 플레이스홀더를 사용할 수 있습니다.

```php
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

위 예시에서는 검증이 실패할 경우, 사용자에게 _"Please describe photo #2."_ 와 같은 오류 메시지가 출력됩니다.

더 필요하다면, 더 깊이 중첩된 배열의 인덱스와 순번도 `second-index`, `second-position`, `third-index`, `third-position` 등으로 참조할 수 있습니다.

```php
'photos.*.attributes.*.string' => 'Invalid attribute for photo #:second-position.',
```

<a name="validating-files"></a>
## 파일 유효성 검사

라라벨은 파일 업로드 검증을 위해 `mimes`, `image`, `min`, `max` 등 다양한 유효성 검증 규칙을 제공합니다. 파일을 검증할 때 이런 개별 규칙을 자유롭게 지정할 수 있을 뿐 아니라, 라라벨이 제공하는 유연한 파일 유효성 검증 규칙 빌더도 사용할 수 있습니다.

```php
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
#### 파일 유형 유효성 검사

`types` 메서드에 확장자만 지정하면 되지만, 실제로는 이 메서드가 파일 내용을 읽어 MIME 타입을 추정한 뒤 해당 MIME 타입을 검증하게 됩니다. MIME 타입과 각 확장자의 전체 목록은 다음 링크에서 확인하실 수 있습니다.

[https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types](https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types)

<a name="validating-files-file-sizes"></a>
#### 파일 크기 유효성 검사

파일 크기의 최솟값과 최댓값을, 단위 접미사(kb, mb, gb, tb)를 포함한 문자열로 지정할 수 있습니다.

```php
File::types(['mp3', 'wav'])
    ->min('1kb')
    ->max('10mb');
```

<a name="validating-files-image-files"></a>
#### 이미지 파일 유효성 검사

사용자 업로드 이미지를 검증할 때, `File` 규칙의 `image` 생성자 메서드를 사용해 검증 대상 파일이 이미지 파일(jpg, jpeg, png, bmp, gif, webp)임을 보장할 수 있습니다.

추가로, `dimensions` 규칙을 이용해 이미지의 크기를 제한할 수도 있습니다.

```php
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
> 이미지 크기 검증에 대한 더 자세한 내용은 [dimensions 규칙 문서](#rule-dimensions)에서 확인하실 수 있습니다.

> [!WARNING]
> 기본적으로 `image` 규칙은 XSS 취약성 문제로 인해 SVG 파일을 허용하지 않습니다. SVG 파일도 허용해야 한다면, `File::image(allowSvg: true)`와 같이 `allowSvg: true`를 전달하면 됩니다.

<a name="validating-files-image-dimensions"></a>
#### 이미지 크기 유효성 검사

이미지의 크기(가로, 세로)를 검증할 수도 있습니다. 예를 들어, 업로드된 이미지가 최소 1000픽셀 너비, 500픽셀 높이인지 확인하고 싶다면 `dimensions` 규칙을 사용하면 됩니다.

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
> 이미지 크기 검증에 대한 더 자세한 내용은 [dimensions 규칙 문서](#rule-dimensions)에서 확인하실 수 있습니다.

<a name="validating-passwords"></a>
## 비밀번호 유효성 검사

비밀번호가 충분히 복잡한지 보장하려면, 라라벨의 `Password` 규칙 객체를 사용할 수 있습니다.

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

$validator = Validator::make($request->all(), [
    'password' => ['required', 'confirmed', Password::min(8)],
]);
```

`Password` 규칙 객체를 사용하면, 비밀번호에 최소 하나의 영문자, 숫자, 기호, 대소문자 혼합 등을 요구하는 등 복잡도 조건을 쉽게 커스터마이즈할 수 있습니다.

```php
// 최소 8자 이상...
Password::min(8)

// 최소 1개 이상의 영문자 필수...
Password::min(8)->letters()

// 대문자/소문자 각각 1개 이상 필수...
Password::min(8)->mixedCase()

// 최소 1개 이상의 숫자 필수...
Password::min(8)->numbers()

// 최소 1개 이상의 기호 필수...
Password::min(8)->symbols()
```

또한, 비밀번호가 공개된 데이터 유출에 포함된 적이 없는지도 `uncompromised` 메서드로 검사할 수 있습니다.

```php
Password::min(8)->uncompromised()
```

내부적으로는 [k-익명성](https://ko.wikipedia.org/wiki/K-%EC%9D%B5%EB%AA%85%EC%84%B1) 모델을 활용해, 사용자의 개인정보나 보안을 해치지 않고 비밀번호가 [haveibeenpwned.com](https://haveibeenpwned.com) 서비스에 유출된 적이 있는지 확인합니다.

기본적으로, 비밀번호가 데이터 유출에 한 번이라도 등장하면 이미 유출된 것으로 간주합니다. 이 임계값은 `uncompromised` 메서드의 첫 번째 인자로 직접 지정할 수 있습니다.

```php
// 데이터 유출에 3회 미만 등장하면 유효한 것으로 처리...
Password::min(8)->uncompromised(3);
```

물론, 위 예시의 모든 메서드를 체이닝하여 동시에 사용할 수도 있습니다.

```php
Password::min(8)
    ->letters()
    ->mixedCase()
    ->numbers()
    ->symbols()
    ->uncompromised()
```

<a name="defining-default-password-rules"></a>
#### 기본 비밀번호 규칙 정의하기

애플리케이션 내에서 비밀번호에 대한 기본 유효성 검사 규칙을 한 곳에서 지정하고 싶다면, `Password::defaults` 메서드를 사용하면 됩니다. 이 메서드는 클로저를 인자로 받아서, 기본 비밀번호 규칙 구성을 반환해야 합니다. 일반적으로는, 애플리케이션 서비스 프로바이더의 `boot` 메서드 내에서 `defaults`를 호출하는 것이 적합합니다.

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

이제 유효성 검증 시 기본 규칙을 적용하고 싶을 때, 인자 없이 `defaults` 메서드를 호출하면 됩니다.

```php
'password' => ['required', Password::defaults()],
```

때때로, 기본 비밀번호 규칙에 추가적인 유효성 규칙을 연결하고 싶을 수 있습니다. 이럴 땐 `rules` 메서드를 사용하면 됩니다.

```php
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

라라벨은 다양한 내장 유효성 검증 규칙을 제공하지만, 직접 규칙을 정의해야 할 때도 있습니다. 커스텀 유효성 검증 규칙을 등록하는 한 가지 방법은 "규칙 객체"를 사용하는 것입니다. 새로운 규칙 객체를 생성하려면, `make:rule` Artisan 명령어를 사용할 수 있습니다. 예를 들어, 문자열이 모두 대문자인지 검증하는 규칙을 만들어보겠습니다. 이 명령어를 실행하면 새 규칙 클래스가 `app/Rules` 디렉토리에 생성되며, 디렉토리가 없다면 자동으로 만들어집니다.

```shell
php artisan make:rule Uppercase
```

규칙 파일을 만들었다면, 이제 동작을 정의할 차례입니다. 규칙 객체에는 `validate`라는 단일 메서드가 있으며, 이 메서드는 속성 이름(attribute), 값(value), 검증이 실패했을 때 호출할 콜백(유효성 오류 메시지 전달)을 인자로 받습니다.

```php
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

규칙 정의가 끝났다면, 이 규칙 객체 인스턴스를 다른 유효성 검증 규칙과 함께 검증기에 전달하면 적용됩니다.

```php
use App\Rules\Uppercase;

$request->validate([
    'name' => ['required', 'string', new Uppercase],
]);
```

#### 유효성 메시지 다국어 처리

`$fail` 클로저에 직접 오류 메시지를 작성하는 대신, [번역 문자열 키](/docs/localization)를 넘겨 라라벨이 에러 메시지를 번역하게 할 수도 있습니다.

```php
if (strtoupper($value) !== $value) {
    $fail('validation.uppercase')->translate();
}
```

필요하다면, `translate` 메서드의 첫 번째/두 번째 인자로 플레이스홀더 치환 배열과 선호 언어를 직접 전달할 수도 있습니다.

```php
$fail('validation.location')->translate([
    'value' => $this->value,
], 'fr');
```

#### 추가 데이터 접근

커스텀 유효성 검사 규칙 클래스에서 검증 대상 전체 데이터에 접근해야 한다면, `Illuminate\Contracts\Validation\DataAwareRule` 인터페이스를 구현하면 됩니다. 이 인터페이스는 `setData` 메서드 구현을 요구하는데, 라라벨이(검증 전) 전체 데이터 정보를 해당 메서드로 자동 주입합니다.

```php
<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\DataAwareRule;
use Illuminate\Contracts\Validation\ValidationRule;

class Uppercase implements DataAwareRule, ValidationRule
{
    /**
     * All of the data under validation.
     *
     * @var array<string, mixed>
     */
    protected $data = [];

    // ...

    /**
     * Set the data under validation.
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

또는, 유효성 검증을 수행하는 현재 Validator 인스턴스에 접근해야 한다면, `ValidatorAwareRule` 인터페이스를 구현하면 됩니다.

```php
<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\ValidatorAwareRule;
use Illuminate\Validation\Validator;

class Uppercase implements ValidationRule, ValidatorAwareRule
{
    /**
     * The validator instance.
     *
     * @var \Illuminate\Validation\Validator
     */
    protected $validator;

    // ...

    /**
     * Set the current validator.
     */
    public function setValidator(Validator $validator): static
    {
        $this->validator = $validator;

        return $this;
    }
}
```

<a name="using-closures"></a>
### 클로저(Closure)로 규칙 정의하기

커스텀 규칙이 애플리케이션 전체에서 딱 한 번만 사용된다면, 굳이 규칙 객체를 만들지 않고 클로저로 바로 정의해 쓸 수도 있습니다. 클로저는 속성명, 속성 값, `$fail` 콜백을 인자로 받습니다.

```php
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

기본적으로, 유효성 검증 대상 속성이 존재하지 않거나 빈 문자열일 경우(즉, 'required' 규칙이 없는 경우), 기본 규칙(커스텀 규칙 포함)은 실행되지 않습니다. 예를 들어, [unique](#rule-unique) 규칙은 빈 문자열에 대해 적용되지 않습니다.

```php
use Illuminate\Support\Facades\Validator;

$rules = ['name' => 'unique:users,name'];

$input = ['name' => ''];

Validator::make($input, $rules)->passes(); // true
```

속성이 값이 비었을 때도 커스텀 규칙이 항상 실행되게 하려면, 해당 규칙이 '필수'임을 암시적으로(implicitly) 내포해야 합니다. 암묵적 규칙 객체를 빠르게 만들려면, `make:rule` Artisan 명령 실행 시 `--implicit` 옵션을 사용하면 됩니다.

```shell
php artisan make:rule Uppercase --implicit
```

> [!WARNING]
> "암묵적" 규칙은 단순히 해당 속성이 '필수'임을 _암시_ 합니다. 실제로 값이 없거나 누락된 속성을 검증 실패로 처리할지 여부는 규칙 구현에 달려 있습니다.