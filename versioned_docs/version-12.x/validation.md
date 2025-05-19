# 유효성 검증 (Validation)

- [소개](#introduction)
- [유효성 검증 빠르게 시작하기](#validation-quickstart)
    - [라우트 정의하기](#quick-defining-the-routes)
    - [컨트롤러 생성하기](#quick-creating-the-controller)
    - [유효성 검증 로직 작성하기](#quick-writing-the-validation-logic)
    - [유효성 검증 오류 메시지 표시하기](#quick-displaying-the-validation-errors)
    - [폼 값 다시 채우기](#repopulating-forms)
    - [선택 필드에 대한 안내](#a-note-on-optional-fields)
    - [유효성 검증 오류 응답 포맷](#validation-error-response-format)
- [폼 리퀘스트(Form Request) 유효성 검증](#form-request-validation)
    - [폼 리퀘스트 생성하기](#creating-form-requests)
    - [폼 리퀘스트 인가 처리하기](#authorizing-form-requests)
    - [오류 메시지 커스터마이즈](#customizing-the-error-messages)
    - [유효성 검증 전 입력값 준비하기](#preparing-input-for-validation)
- [수동으로 Validator 만들기](#manually-creating-validators)
    - [자동 리다이렉션](#automatic-redirection)
    - [이름 있는 에러 백 사용하기](#named-error-bags)
    - [오류 메시지 커스터마이즈](#manual-customizing-the-error-messages)
    - [추가 유효성 검증 수행하기](#performing-additional-validation)
- [검증된 입력값 다루기](#working-with-validated-input)
- [오류 메시지 활용하기](#working-with-error-messages)
    - [언어 파일에서 커스텀 메시지 지정하기](#specifying-custom-messages-in-language-files)
    - [언어 파일에서 속성 지정하기](#specifying-attribute-in-language-files)
    - [언어 파일에서 값 지정하기](#specifying-values-in-language-files)
- [사용 가능한 유효성 검증 규칙](#available-validation-rules)
- [조건부로 규칙 추가하기](#conditionally-adding-rules)
- [배열 유효성 검증](#validating-arrays)
    - [중첩 배열 입력값 검증](#validating-nested-array-input)
    - [오류 메시지 인덱스와 위치](#error-message-indexes-and-positions)
- [파일 유효성 검증](#validating-files)
- [비밀번호 유효성 검증](#validating-passwords)
- [커스텀 유효성 검증 규칙](#custom-validation-rules)
    - [규칙 객체 사용하기](#using-rule-objects)
    - [클로저(Closure) 사용하기](#using-closures)
    - [암묵적(implicit) 규칙](#implicit-rules)

<a name="introduction"></a>
## 소개

라라벨은 애플리케이션에 들어오는 데이터를 검증할 수 있는 다양한 방법을 제공합니다. 가장 흔히 사용되는 방법은 모든 들어오는 HTTP 요청에서 사용할 수 있는 `validate` 메서드를 활용하는 것입니다. 하지만, 이외에도 여러 유효성 검증 방식이 있으니 이번 문서에서 차근차근 살펴보겠습니다.

라라벨은 매우 다양한 편리한 유효성 검증 규칙들을 내장하고 있어 데이터 검증 시 활용할 수 있습니다. 예를 들어, 특정 값이 데이터베이스 테이블 내에서 유일한지도 쉽게 검증할 수 있습니다. 본 문서에서는 이러한 각종 검증 규칙들을 차근차근 소개하므로, 라라벨의 유효성 검증 기능을 폭넓게 이해할 수 있도록 안내합니다.

<a name="validation-quickstart"></a>
## 유효성 검증 빠르게 시작하기

라라벨의 강력한 유효성 검증 기능을 익히기 위해, 폼 입력값을 검증하고 오류 메시지를 사용자에게 표시하는 전체 과정을 예시와 함께 살펴봅니다. 이 내용을 통해 라라벨에서 들어오는 요청 데이터를 어떻게 효과적으로 검증하는지 전반적인 흐름을 알 수 있습니다.

<a name="quick-defining-the-routes"></a>
### 라우트 정의하기

먼저, `routes/web.php` 파일에 다음과 같은 라우트가 정의되어 있다고 가정합니다:

```php
use App\Http\Controllers\PostController;

Route::get('/post/create', [PostController::class, 'create']);
Route::post('/post', [PostController::class, 'store']);
```

위의 `GET` 라우트는 사용자가 새 블로그 게시글을 작성할 수 있는 폼을 보여주며, `POST` 라우트는 새로운 게시글을 데이터베이스에 저장합니다.

<a name="quick-creating-the-controller"></a>
### 컨트롤러 생성하기

다음으로, 위 라우트에서 들어오는 요청을 처리하는 간단한 컨트롤러 내용을 살펴봅니다. 여기서는 일단 `store` 메서드는 비워둡니다:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class PostController extends Controller
{
    /**
     * 새 블로그 게시글 작성 폼을 보여줍니다.
     */
    public function create(): View
    {
        return view('post.create');
    }

    /**
     * 새 블로그 게시글을 저장합니다.
     */
    public function store(Request $request): RedirectResponse
    {
        // 여기에 게시글 검증 및 저장 로직이 들어갈 예정입니다...

        $post = /** ... */

        return to_route('post.show', ['post' => $post->id]);
    }
}
```

<a name="quick-writing-the-validation-logic"></a>
### 유효성 검증 로직 작성하기

이제 `store` 메서드 안에 새 블로그 게시글의 유효성 검증 로직을 추가해보겠습니다. 여기서는 `Illuminate\Http\Request` 객체가 제공하는 `validate` 메서드를 사용합니다. 검증 규칙을 통과하면 코드는 정상적으로 계속 실행되며, 만약 검증에 실패하면 `Illuminate\Validation\ValidationException` 예외가 발생하고, 적절한 에러 응답이 자동으로 사용자에게 전달됩니다.

전통적인 HTTP 요청에서 검증에 실패하면, 사용자는 이전 URL로 리다이렉트됩니다. 만약 들어오는 요청이 XHR(비동기) 요청이라면, [유효성 검증 오류 메시지가 담긴 JSON 응답](#validation-error-response-format)이 반환됩니다.

`validate` 메서드의 사용법을 좀 더 구체적으로 살펴보겠습니다:

```php
/**
 * 새 블로그 게시글을 저장합니다.
 */
public function store(Request $request): RedirectResponse
{
    $validated = $request->validate([
        'title' => 'required|unique:posts|max:255',
        'body' => 'required',
    ]);

    // 게시글 입력값이 모두 유효합니다...

    return redirect('/posts');
}
```

보시다시피, 검증 규칙들을 `validate` 메서드에 전달하게 됩니다. 걱정 마세요! 사용 가능한 모든 검증 규칙은 [별도로 문서화되어 있습니다](#available-validation-rules). 다시 한 번 강조하면, 검증에 실패한 경우 적절한 응답이 자동으로 생성되어 반환됩니다. 검증을 통과하면 컨트롤러 코드가 계속 정상적으로 실행됩니다.

또한, 검증 규칙 명시 시 문자열(`|`로 구분) 대신 배열로도 규칙을 지정할 수 있습니다:

```php
$validatedData = $request->validate([
    'title' => ['required', 'unique:posts', 'max:255'],
    'body' => ['required'],
]);
```

또한, [이름 있는 에러 백](#named-error-bags)을 사용해 검증 오류 메시지를 따로 저장하고 싶을 때는 `validateWithBag` 메서드를 사용할 수도 있습니다:

```php
$validatedData = $request->validateWithBag('post', [
    'title' => ['required', 'unique:posts', 'max:255'],
    'body' => ['required'],
]);
```

<a name="stopping-on-first-validation-failure"></a>
#### 첫 번째 검증 실패 시 중단하기

경우에 따라, 어떤 속성(attribute)에 대해 첫 번째 검증 실패가 발생하면 이후 규칙 검증을 바로 멈추고 싶을 수 있습니다. 이때는 해당 속성에 `bail` 규칙을 추가합니다:

```php
$request->validate([
    'title' => 'bail|required|unique:posts|max:255',
    'body' => 'required',
]);
```

위 예시에서 `title` 속성의 `unique` 규칙이 실패하면, 그 뒤의 `max` 규칙은 검증하지 않습니다. 규칙은 지정한 순서대로 차례로 검증됩니다.

<a name="a-note-on-nested-attributes"></a>
#### 중첩된 속성에 대한 안내

들어오는 HTTP 요청에 "중첩된" 필드 데이터가 있을 경우, 검증 규칙에서 "닷(dot, .) 표기법"을 사용해 이러한 필드를 지정할 수 있습니다:

```php
$request->validate([
    'title' => 'required|unique:posts|max:255',
    'author.name' => 'required',
    'author.description' => 'required',
]);
```

반대로, 필드 이름 자체에 실제 마침표가 들어가는 경우에는, 백슬래시(`\`)로 마침표를 이스케이프해서 "dot" 문법으로 인식되지 않도록 할 수 있습니다:

```php
$request->validate([
    'title' => 'required|unique:posts|max:255',
    'v1\.0' => 'required',
]);
```

<a name="quick-displaying-the-validation-errors"></a>
### 유효성 검증 오류 메시지 표시하기

그렇다면, 만약 들어오는 요청 필드가 지정한 유효성 검증을 통과하지 못한다면 어떻게 될까요? 앞서 언급했듯, 라라벨은 자동으로 사용자를 이전 위치로 리다이렉트합니다. 또한, 모든 유효성 검증 오류와 [요청 입력값](/docs/12.x/requests#retrieving-old-input)이 자동으로 [세션에 flash](https://laravel.kr/docs/12.x/session#flash-data) 됩니다.

애플리케이션의 모든 뷰에서는 `Illuminate\View\Middleware\ShareErrorsFromSession` 미들웨어(이 미들웨어는 `web` 미들웨어 그룹에 포함) 덕분에 `$errors` 변수를 항상 사용할 수 있습니다. 즉, `$errors` 변수는 언제나 뷰에서 정의되어 있다고 가정하고 편하게 사용할 수 있습니다. 이 `$errors` 변수는 `Illuminate\Support\MessageBag` 인스턴스입니다. 이 객체를 다루는 방법은 [별도의 문서](#working-with-error-messages)에서 확인할 수 있습니다.

따라서, 예시에서 검증 실패 시 컨트롤러의 `create` 메서드로 리다이렉트되어 뷰에서 오류 메시지를 표시할 수 있습니다.

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
#### 오류 메시지 커스터마이즈

라라벨이 기본으로 제공하는 각 유효성 검증 규칙에는 `lang/en/validation.php` 파일에 오류 메시지가 정의되어 있습니다. 만약 애플리케이션에 `lang` 디렉터리가 없다면, `lang:publish` 아티즌 명령어를 실행해 디렉터리를 생성할 수 있습니다.

`lang/en/validation.php` 파일 내에는 각 유효성 검증 규칙에 해당하는 번역 문자열이 있습니다. 애플리케이션 환경에 맞게 이 메시지를 자유롭게 변경하거나 수정할 수 있습니다.

또한, 이 파일을 다른 언어의 디렉터리로 복사하여 각 언어에 맞는 오류 메시지로 번역할 수 있습니다. 라라벨의 다국어 지원(localization) 전체에 대해 알아보려면 [로컬라이제이션 문서를 참고하세요](/docs/12.x/localization).

> [!WARNING]
> 기본적으로, 라라벨 애플리케이션 기본 스켈레톤에는 `lang` 디렉터리가 포함되어 있지 않습니다. 라라벨의 언어 파일을 커스터마이즈하고 싶다면 `lang:publish` 아티즌 명령어를 사용해 해당 파일을 배포할 수 있습니다.

<a name="quick-xhr-requests-and-validation"></a>
#### XHR 요청과 유효성 검증

이번 예제에서는 전통적인 폼을 통해 데이터를 애플리케이션으로 전달했습니다. 하지만 실제로는 JavaScript 기반 프론트엔드에서 XHR 요청(비동기 요청)이 들어오는 경우가 많습니다. XHR 요청에서 `validate` 메서드를 사용할 경우, 라라벨은 리다이렉트 응답을 생성하지 않고, 대신 [모든 유효성 검증 오류가 담긴 JSON 응답](#validation-error-response-format)을 반환합니다. 이 JSON 응답은 422 HTTP 상태 코드와 함께 전달됩니다.

<a name="the-at-error-directive"></a>
#### `@error` 디렉티브

특정 속성에 대한 유효성 검증 오류가 존재하는지 쉽게 확인하기 위해 [Blade](/docs/12.x/blade)의 `@error` 디렉티브를 사용할 수 있습니다. `@error` 블록 내에서는 `$message` 변수를 사용해 오류 메시지를 표시할 수 있습니다:

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

[이름 있는 에러 백](#named-error-bags)을 사용하는 경우, `@error` 디렉티브의 두 번째 인자로 에러 백의 이름을 지정할 수 있습니다:

```blade
<input ... class="@error('title', 'post') is-invalid @enderror">
```

<a name="repopulating-forms"></a>
### 폼 값 다시 채우기

라라벨이 유효성 검증 오류로 인해 리다이렉트 응답을 생성할 때, 프레임워크는 요청의 모든 입력값을 자동으로 [세션에 flash](/docs/12.x/session#flash-data) 합니다. 이를 통해 다음 요청 시, 사용자가 시도했던 폼 입력값을 쉽게 조회해 폼을 다시 채울 수 있습니다.

이전 요청에서 flash된 입력값을 가져오려면, `Illuminate\Http\Request` 인스턴스의 `old` 메서드를 사용합니다. `old` 메서드는 [세션](/docs/12.x/session)에 저장된 이전 입력값 데이터를 꺼내옵니다:

```php
$title = $request->old('title');
```

라라벨은 전역적으로 사용할 수 있는 `old` 헬퍼도 제공합니다. [Blade 템플릿](/docs/12.x/blade) 내에서 예전 입력값을 표시할 때는, 이 헬퍼를 활용하면 더욱 편리합니다. 만약 해당 필드에 예전 입력값이 존재하지 않으면, `null`이 반환됩니다:

```blade
<input type="text" name="title" value="{{ old('title') }}">
```

<a name="a-note-on-optional-fields"></a>
### 선택 필드에 대한 안내

기본적으로 라라벨은 애플리케이션의 글로벌 미들웨어 스택에 `TrimStrings`, `ConvertEmptyStringsToNull` 미들웨어를 포함하고 있습니다. 이 때문에 "선택적" 입력 필드가 있다면, 해당 필드를 검증 규칙에서 `nullable`로 지정해주지 않으면 `null` 값을 무효한 값으로 간주하게 됩니다. 예를 들어:

```php
$request->validate([
    'title' => 'required|unique:posts|max:255',
    'body' => 'required',
    'publish_at' => 'nullable|date',
]);
```

위의 예시에서 `publish_at` 필드는 `null`이거나 유효한 날짜 문자열이면 통과합니다. 만약 `nullable` 수정자를 규칙에 추가하지 않으면, 검증기는 `null`을 유효하지 않은 날짜로 간주합니다.

<a name="validation-error-response-format"></a>
### 유효성 검증 오류 응답 포맷

애플리케이션에서 `Illuminate\Validation\ValidationException` 예외가 발생하고, 들어오는 HTTP 요청이 JSON 응답을 기대하는 경우, 라라벨은 자동으로 오류 메시지를 포맷하여 `422 Unprocessable Entity` HTTP 응답을 반환합니다.

아래는 유효성 검증 오류에 대한 JSON 응답 예시입니다. 중첩된 오류 키가 "닷(dot) 표기법"으로 평탄화(flatten)되어 있다는 점에 주의하세요:

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
## 폼 리퀘스트(Form Request) 유효성 검증

<a name="creating-form-requests"></a>
### 폼 리퀘스트 생성하기

좀 더 복잡한 유효성 검증이 필요할 때는 "폼 리퀘스트"를 사용하는 것이 좋습니다. 폼 리퀘스트는 자체적으로 유효성 검증과 인가 로직을 캡슐화한 맞춤형 요청 클래스입니다. 폼 리퀘스트 클래스를 생성하려면, `make:request` 아티즌 CLI 명령어를 사용할 수 있습니다:

```shell
php artisan make:request StorePostRequest
```

생성된 폼 리퀘스트 클래스는 `app/Http/Requests` 디렉터리에 추가됩니다. 만약 이 디렉터리가 아직 없다면, 위 명령어 실행 시 자동으로 생성됩니다. 라라벨이 생성하는 각 폼 리퀘스트에는 기본적으로 `authorize`와 `rules` 두 개의 메서드가 추가됩니다.

예상대로, `authorize` 메서드는 현재 인증된 사용자가 요청을 실행할 권한이 있는지 판단하는 역할을 하며, `rules` 메서드는 해당 요청 데이터에 적용되어야 할 유효성 검증 규칙을 반환합니다:

```php
/**
 * 요청에 적용할 유효성 검증 규칙을 반환합니다.
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
> `rules` 메서드 시그니처에 필요한 의존성을 타입힌트로 지정할 수 있습니다. 이러한 의존성들은 라라벨 [서비스 컨테이너](/docs/12.x/container)를 통해 자동으로 주입(resolve)됩니다.

그렇다면, 실제로 이 검증 규칙은 어떻게 평가될까요? 컨트롤러 메서드에서 해당 요청 타입을 타입힌트로 지정하기만 하면 됩니다. 들어오는 폼 리퀘스트가 컨트롤러 메서드에 진입하기 전에 검증이 먼저 실행되기 때문에, 검증 로직을 컨트롤러에 직접 작성할 필요가 없습니다:

```php
/**
 * 새 블로그 게시글 저장하기
 */
public function store(StorePostRequest $request): RedirectResponse
{
    // 여기까지 왔다면 요청이 유효함을 의미합니다...

    // 검증된 입력값을 가져옵니다...
    $validated = $request->validated();

    // 입력값 중 일부만 가져올 수도 있습니다...
    $validated = $request->safe()->only(['name', 'email']);
    $validated = $request->safe()->except(['name', 'email']);

    // 게시글 저장하기...

    return redirect('/posts');
}
```

만약 검증에 실패하면, 사용자는 이전 위치로 리다이렉트되며 에러도 세션에 flash되어 오류 메시지 표시용으로 활용할 수 있습니다. 요청이 XHR(비동기) 요청이었다면 422 상태 코드와 [유효성 오류를 담은 JSON 응답](#validation-error-response-format)이 반환됩니다.

> [!NOTE]
> Inertia 기반 라라벨 프론트엔드에 실시간 폼 리퀘스트 유효성 검증을 추가하고 싶다면 [Laravel Precognition](/docs/12.x/precognition)을 참고하세요.

<a name="performing-additional-validation-on-form-requests"></a>
#### 폼 리퀘스트에서 추가 유효성 검증 수행하기

경우에 따라, 최초 유효성 검증이 끝난 뒤 추가적인 검증이 필요한 상황이 있을 수 있습니다. 이럴 때는 폼 리퀘스트의 `after` 메서드를 사용할 수 있습니다.

`after` 메서드는 콜러블(callable) 혹은 클로저(closure)로 이루어진 배열을 반환해야 하며, 이들은 검증이 모두 끝난 뒤 호출됩니다. 각 콜러블은 `Illuminate\Validation\Validator` 인스턴스를 전달받아, 필요하다면 추가 오류 메시지를 추가할 수 있습니다:

```php
use Illuminate\Validation\Validator;

/**
 * 이 요청의 "after" 유효성 검증 콜러블을 반환합니다.
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

설명한 것처럼, `after` 메서드가 반환하는 배열에는 클래스를 인보커블(invokable) 객체로 추가할 수도 있습니다. 해당 클래스의 `__invoke` 메서드는 `Illuminate\Validation\Validator` 인스턴스를 전달받게 됩니다:

```php
use App\Validation\ValidateShippingTime;
use App\Validation\ValidateUserStatus;
use Illuminate\Validation\Validator;

/**
 * 이 요청의 "after" 유효성 검증 콜러블을 반환합니다.
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
#### 첫 번째 유효성 검증 실패 시 전체 중단

폼 리퀘스트 클래스에 `stopOnFirstFailure` 프로퍼티를 추가하면, 하나의 검증 실패가 발생한 순간 모든 속성 검증을 즉시 중단하도록 검증기에 알릴 수 있습니다:

```php
/**
 * 하나의 규칙이라도 실패하면 전체 검증을 중단할지 여부
 *
 * @var bool
 */
protected $stopOnFirstFailure = true;
```

<a name="customizing-the-redirect-location"></a>
#### 리다이렉트 위치 커스터마이즈

폼 리퀘스트의 유효성 검증이 실패할 때, 사용자는 기본적으로 이전 위치로 리다이렉트됩니다. 하지만, 이 동작을 자유롭게 변경할 수 있습니다. 이를 위해 리퀘스트 클래스에 `$redirect` 프로퍼티를 정의하면 됩니다:

```php
/**
 * 유효성 검증에 실패하면 사용자가 리다이렉트되어야 하는 URI
 *
 * @var string
 */
protected $redirect = '/dashboard';
```

또는, 네임드 라우트로 리다이렉트하고 싶다면 `$redirectRoute` 프로퍼티를 사용하세요:

```php
/**
 * 유효성 검증에 실패하면 사용자가 리다이렉트되어야 하는 라우트 이름
 *
 * @var string
 */
protected $redirectRoute = 'dashboard';
```

<a name="authorizing-form-requests"></a>
### 폼 리퀘스트 인가 처리하기

폼 리퀘스트 클래스에는 `authorize` 메서드도 포함되어 있습니다. 이 메서드에서는 현재 인증된 사용자가 실제로 어떤 리소스를 갱신할 권한이 있는지 직접 판단할 수 있습니다. 예를 들어, 사용자가 자신의 블로그 댓글만 수정할 수 있는지 판별할 수 있습니다. 대개, 이 메서드 내부에서 [인가 게이트(gate)나 정책(policy)](/docs/12.x/authorization)와 상호작용하게 됩니다:

```php
use App\Models\Comment;

/**
 * 사용자가 이 요청을 수행할 수 있는지 여부를 판별합니다.
 */
public function authorize(): bool
{
    $comment = Comment::find($this->route('comment'));

    return $comment && $this->user()->can('update', $comment);
}
```

모든 폼 리퀘스트는 기본 라라벨 리퀘스트 클래스를 확장하기 때문에, `user` 메서드로 현재 인증된 사용자를 접근할 수 있습니다. 또, 위 예시에서 호출한 `route` 메서드는 해당 라우트의 URI 파라미터(예: `{comment}`)에 접근할 수 있게 해줍니다:

```php
Route::post('/comment/{comment}');
```

만약 [라우트 모델 바인딩](/docs/12.x/routing#route-model-binding)을 활용하고 있다면, 리퀘스트의 프로퍼티로 이미 resolve된 모델에 바로 접근할 수도 있어 코드를 더욱 간단하게 만들 수 있습니다:

```php
return $this->user()->can('update', $this->comment);
```

만약 `authorize` 메서드가 `false`를 반환한다면, 403 상태 코드의 HTTP 응답이 자동으로 반환되고 컨트롤러 메서드는 실행되지 않습니다.

만약 해당 리퀘스트의 인가 로직을 애플리케이션의 다른 부분에서 처리할 계획이라면, `authorize` 메서드를 아예 제거하거나, 단순히 항상 `true`를 반환해도 됩니다:

```php
/**
 * 사용자가 이 요청을 수행할 수 있는지 여부를 판별합니다.
 */
public function authorize(): bool
{
    return true;
}
```

> [!NOTE]
> 필요한 의존성이 있다면, `authorize` 메서드 시그니처에 타입힌트로 지정할 수 있습니다. 이에 필요한 의존성들은 라라벨 [서비스 컨테이너](/docs/12.x/container)에 의해 자동으로 resolve됩니다.

<a name="customizing-the-error-messages"></a>
### 오류 메시지 커스터마이즈

폼 리퀘스트에서 반환되는 검증 오류 메시지는 `messages` 메서드를 오버라이드하여 자유롭게 커스터마이즈할 수 있습니다. 이 메서드는 속성/규칙 쌍과 그에 해당하는 오류 메시지의 배열을 반환해야 합니다:

```php
/**
 * 지정한 유효성 검증 규칙에 대한 오류 메시지를 반환합니다.
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

라라벨의 많은 기본 유효성 검증 오류 메시지에는 `:attribute` 플레이스홀더가 포함되어 있습니다. 이 플레이스홀더를 원하는 속성명으로 대체하고 싶을 때는, `attributes` 메서드를 오버라이드하여 속성명 쌍의 배열을 반환하면 됩니다:

```php
/**
 * validator 오류에 사용할 커스텀 속성명을 반환합니다.
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

검증 규칙을 적용하기 전에 요청에서 받은 입력값을 미리 준비(정규화/가공 등)해야 한다면, `prepareForValidation` 메서드를 사용할 수 있습니다:

```php
use Illuminate\Support\Str;

/**
 * 유효성 검증을 위한 데이터 준비 작업을 수행합니다.
 */
protected function prepareForValidation(): void
{
    $this->merge([
        'slug' => Str::slug($this->slug),
    ]);
}
```

또한, 검증이 끝난 후 입력값을 정규화해야 할 필요가 있다면 `passedValidation` 메서드를 사용할 수 있습니다:

```php
/**
 * 유효성 검증이 통과된 뒤 실행할 처리.
 */
protected function passedValidation(): void
{
    $this->replace(['name' => 'Taylor']);
}
```

<a name="manually-creating-validators"></a>

## 유효성 검사기(Validator) 수동 생성

요청 객체의 `validate` 메서드를 사용하지 않고, 직접 유효성 검사기 인스턴스를 만들고 싶다면 `Validator` [파사드](/docs/12.x/facades)를 사용할 수 있습니다. 파사드의 `make` 메서드는 새로운 유효성 검사기 인스턴스를 생성합니다.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PostController extends Controller
{
    /**
     * 새 블로그 포스트 저장.
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

        // 유효성 검증이 성공한 입력값 가져오기...
        $validated = $validator->validated();

        // 필요한 일부 유효성 검증 통과 입력값만 가져오기...
        $validated = $validator->safe()->only(['name', 'email']);
        $validated = $validator->safe()->except(['name', 'email']);

        // 블로그 포스트 저장...

        return redirect('/posts');
    }
}
```

`make` 메서드의 첫 번째 인수는 유효성 검증을 적용할 데이터이며, 두 번째 인수는 데이터에 적용할 유효성 규칙들의 배열입니다.

요청 유효성 검증이 실패했는지 판단한 후에는 `withErrors` 메서드를 사용하여 에러 메시지를 세션에 플래시할 수 있습니다. 이 메서드를 사용할 때, 리다이렉트 이후 뷰에서 `$errors` 변수가 자동으로 공유되어 사용자가 에러 메시지를 쉽게 볼 수 있습니다. `withErrors` 메서드는 유효성 검사기 인스턴스, `MessageBag`, 또는 PHP `array`를 인수로 받습니다.

#### 첫 번째 유효성 검증 실패 시 중지

`stopOnFirstFailure` 메서드를 사용하면, 하나의 유효성 검증 실패가 발생하면 즉시 모든 속성에 대한 검증을 중지하도록 검사기에 알릴 수 있습니다.

```php
if ($validator->stopOnFirstFailure()->fails()) {
    // ...
}
```

<a name="automatic-redirection"></a>
### 자동 리다이렉션

유효성 검사기 인스턴스를 수동으로 만들어 사용하더라도, HTTP 요청의 `validate` 메서드가 제공하는 자동 리다이렉션 기능을 그대로 이용하고 싶을 때가 있습니다. 이럴 때는 기존 검사기 인스턴스에서 `validate` 메서드를 호출하면 됩니다. 유효성 검증이 실패하면 사용자는 자동으로 리다이렉트되거나, XHR(비동기) 요청의 경우 [JSON 응답이 반환됩니다](#validation-error-response-format).

```php
Validator::make($request->all(), [
    'title' => 'required|unique:posts|max:255',
    'body' => 'required',
])->validate();
```

검증 실패 시 에러 메시지를 [이름이 지정된 에러 bag](#named-error-bags)에 저장하려면 `validateWithBag` 메서드를 사용할 수 있습니다.

```php
Validator::make($request->all(), [
    'title' => 'required|unique:posts|max:255',
    'body' => 'required',
])->validateWithBag('post');
```

<a name="named-error-bags"></a>
### 이름이 지정된 에러 Bag

하나의 페이지에 여러 개의 폼이 존재하는 경우, 유효성 검증 실패 시 에러 메시지가 담기는 `MessageBag`에 이름을 붙여 특정 폼의 에러 메시지만 쉽게 가져올 수 있습니다. 이를 위해 `withErrors` 메서드의 두 번째 인수로 이름을 전달하면 됩니다.

```php
return redirect('/register')->withErrors($validator, 'login');
```

그 후 `$errors` 변수에서 해당 이름의 `MessageBag` 인스턴스에 접근할 수 있습니다.

```blade
{{ $errors->login->first('email') }}
```

<a name="manual-customizing-the-error-messages"></a>
### 에러 메시지 커스터마이징

원하는 경우, 라라벨의 기본 에러 메시지 대신 유효성 검사기 인스턴스에서 사용할 커스텀 에러 메시지를 제공할 수 있습니다. 커스텀 메시지는 여러 가지 방식으로 지정할 수 있습니다. 우선, `Validator::make` 메서드의 세 번째 인수로 커스텀 메시지 배열을 전달할 수 있습니다.

```php
$validator = Validator::make($input, $rules, $messages = [
    'required' => 'The :attribute field is required.',
]);
```

위 예시에서 `:attribute` 플레이스홀더는 검증되는 필드의 실제 이름으로 대체됩니다. 유효성 검증 메시지에는 이 외에도 다양한 플레이스홀더를 사용할 수 있습니다. 예를 들어:

```php
$messages = [
    'same' => 'The :attribute and :other must match.',
    'size' => 'The :attribute must be exactly :size.',
    'between' => 'The :attribute value :input is not between :min - :max.',
    'in' => 'The :attribute must be one of the following types: :values',
];
```

<a name="specifying-a-custom-message-for-a-given-attribute"></a>
#### 특정 속성에 대한 커스텀 메시지 지정

특정 필드에만 커스텀 에러 메시지를 적용하고 싶다면, "닷(dot) 표기법"을 사용할 수 있습니다. 즉, 속성명.규칙명 형태로 지정하면 됩니다.

```php
$messages = [
    'email.required' => 'We need to know your email address!',
];
```

<a name="specifying-custom-attribute-values"></a>
#### 속성명 플레이스홀더에 대한 커스텀 값 지정

라라벨의 기본 에러 메시지에는 검증 대상 필드명에 해당하는 `:attribute` 플레이스홀더가 사용됩니다. 이 부분에 나타나는 이름을 커스텀하고 싶으면, `Validator::make`의 네 번째 인수로 커스텀 속성명 배열을 전달할 수 있습니다.

```php
$validator = Validator::make($input, $rules, $messages, [
    'email' => 'email address',
]);
```

<a name="performing-additional-validation"></a>
### 추가 유효성 검증 수행

기본적인 유효성 검증 이후에 추가 검증이 필요한 경우, Validator의 `after` 메서드를 이용할 수 있습니다. `after` 메서드는 클로저나 호출 가능한(callable) 객체 배열을 인수로 받아, 검증이 끝난 뒤 실행됩니다. 전달받은 콜러블에는 `Illuminate\Validation\Validator` 인스턴스가 주어져, 필요 시 추가 에러 메시지를 등록할 수 있습니다.

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

앞서 언급한 대로, `after` 메서드는 콜러블의 배열도 허용하는데, "after validation" 로직을 호출 가능한 클래스로 분리해두었다면 매우 편리하게 활용할 수 있습니다. 각 클래스의 `__invoke` 메서드에 `Illuminate\Validation\Validator` 인스턴스가 주입됩니다.

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
## 검증된 입력 데이터 활용하기

폼 요청이나 직접 생성한 유효성 검사기를 통해 요청 데이터를 검증한 후, 실제로 검증을 거친 입력 데이터만 따로 가져오고 싶은 경우가 있습니다. 다음과 같은 방법들을 사용할 수 있습니다. 우선, 폼 요청 객체나 유효성 검사기 인스턴스에서 `validated` 메서드를 호출하면, 검증된 데이터의 배열이 반환됩니다.

```php
$validated = $request->validated();

$validated = $validator->validated();
```

또는, 폼 요청이나 유효성 검사기 인스턴스에서 `safe` 메서드를 호출하면 됩니다. 이 메서드는 `Illuminate\Support\ValidatedInput` 인스턴스를 반환합니다. 이 객체는 `only`, `except`, `all` 메서드를 제공하여 필요한 일부 또는 전체 검증 데이터만 별도로 가져올 수 있습니다.

```php
$validated = $request->safe()->only(['name', 'email']);

$validated = $request->safe()->except(['name', 'email']);

$validated = $request->safe()->all();
```

또한, `Illuminate\Support\ValidatedInput` 인스턴스는 배열처럼 반복(이터레이션)하거나, 배열처럼 값을 가져올 수도 있습니다.

```php
// 검증된 데이터를 반복(iterate)하여 사용
foreach ($request->safe() as $key => $value) {
    // ...
}

// 배열 접근도 가능
$validated = $request->safe();

$email = $validated['email'];
```

검증된 데이터에 추가 필드를 더하고 싶다면 `merge` 메서드를 사용하면 됩니다.

```php
$validated = $request->safe()->merge(['name' => 'Taylor Otwell']);
```

검증된 데이터를 [컬렉션](/docs/12.x/collections) 객체로 받고 싶으면, `collect` 메서드를 호출할 수 있습니다.

```php
$collection = $request->safe()->collect();
```

<a name="working-with-error-messages"></a>
## 에러 메시지 다루기

`Validator` 인스턴스의 `errors` 메서드를 호출하면, 다양한 편의 기능이 제공되는 `Illuminate\Support\MessageBag` 인스턴스를 얻게 됩니다. 뷰에서 자동으로 사용할 수 있는 `$errors` 변수 역시 `MessageBag` 클래스의 인스턴스입니다.

<a name="retrieving-the-first-error-message-for-a-field"></a>
#### 필드별 첫 번째 에러 메시지 가져오기

특정 필드에서 발생한 가장 첫 번째 에러 메시지만 필요하다면, `first` 메서드를 사용하면 됩니다.

```php
$errors = $validator->errors();

echo $errors->first('email');
```

<a name="retrieving-all-error-messages-for-a-field"></a>
#### 필드의 모든 에러 메시지 배열로 가져오기

특정 필드에 발생한 모든 메시지를 배열로 받고 싶다면, `get` 메서드를 사용하세요.

```php
foreach ($errors->get('email') as $message) {
    // ...
}
```

배열 형태의 폼 필드를 검증했다면, `*` 문자를 활용해 각 원소의 모든 메시지를 가져올 수 있습니다.

```php
foreach ($errors->get('attachments.*') as $message) {
    // ...
}
```

<a name="retrieving-all-error-messages-for-all-fields"></a>
#### 모든 필드의 에러 메시지 전부 가져오기

모든 필드에 대한 모든 에러 메시지를 배열로 받고 싶다면, `all` 메서드를 사용하면 됩니다.

```php
foreach ($errors->all() as $message) {
    // ...
}
```

<a name="determining-if-messages-exist-for-a-field"></a>
#### 특정 필드의 에러 존재 여부 판단

주어진 필드에 에러 메시지가 존재하는지 판별하려면, `has` 메서드를 사용할 수 있습니다.

```php
if ($errors->has('email')) {
    // ...
}
```

<a name="specifying-custom-messages-in-language-files"></a>
### 언어 파일에서 커스텀 메시지 지정

라라벨의 내장 유효성 검증 규칙별 에러 메시지는 애플리케이션의 `lang/en/validation.php` 파일에 위치합니다. `lang` 디렉터리가 없다면, `lang:publish` Artisan 명령어로 디렉터리를 생성할 수 있습니다.

`lang/en/validation.php` 파일에서는 각 유효성 검증 규칙에 대한 번역 메시지가 정의되어 있으며, 애플리케이션 필요에 맞게 자유롭게 수정할 수 있습니다.

이 파일을 다른 언어 디렉터리로 복사하여, 애플리케이션 언어에 맞게 메시지를 번역할 수도 있습니다. 라라벨의 로컬라이제이션(Localization)에 대해 더 자세히 알고 싶다면, [로컬라이제이션 전체 문서](/docs/12.x/localization)를 참고하세요.

> [!WARNING]
> 기본적으로 라라벨 애플리케이션 스캐폴드는 `lang` 디렉터리를 포함하지 않습니다. 라라벨의 언어 파일을 커스터마이징하고 싶다면 `lang:publish` Artisan 명령어로 게시하세요.

<a name="custom-messages-for-specific-attributes"></a>
#### 특정 속성에 대한 커스텀 메시지

지정한 속성과 규칙 조합에 사용될 에러 메시지를, 애플리케이션의 유효성 검증 언어 파일에서 커스터마이즈할 수 있습니다. 이를 위해, `lang/xx/validation.php` 파일의 `custom` 배열에 커스텀 메시지를 추가합니다.

```php
'custom' => [
    'email' => [
        'required' => 'We need to know your email address!',
        'max' => 'Your email address is too long!'
    ],
],
```

<a name="specifying-attribute-in-language-files"></a>
### 언어 파일에서 속성명 지정하기

라라벨의 내장 에러 메시지 중 다수는 `:attribute` 플래이스홀더를 포함하며, 유효성 검증 중인 필드명이나 속성명으로 치환됩니다. 만약 `:attribute` 부분을 커스텀한 값으로 대체하고 싶다면, `lang/xx/validation.php` 파일의 `attributes` 배열에 해당 속성명을 등록하면 됩니다.

```php
'attributes' => [
    'email' => 'email address',
],
```

> [!WARNING]
> 기본적으로 라라벨 애플리케이션 스캐폴드는 `lang` 디렉터리를 포함하지 않습니다. 라라벨의 언어 파일을 커스터마이징하고 싶다면 `lang:publish` Artisan 명령어로 게시하세요.

<a name="specifying-values-in-language-files"></a>
### 언어 파일에서 값(value) 지정하기

일부 라라벨 내장 유효성 검증 규칙의 에러 메시지에는 `:value` 플레이스홀더가 포함되어, 요청된 속성의 현재 값으로 치환됩니다. 하지만 때로는 이 값을 좀 더 사용자가 알기 쉽게 변환하여 표시하고 싶을 수 있습니다. 예를 들어, `payment_type` 필드가 `cc` 값일 때 `credit_card_number`가 반드시 필요하다고 지정한 경우를 보겠습니다.

```php
Validator::make($request->all(), [
    'credit_card_number' => 'required_if:payment_type,cc'
]);
```

이 유효성 검증이 실패하면 다음과 같은 에러 메시지가 출력됩니다.

```text
The credit card number field is required when payment type is cc.
```

여기서 `cc` 대신 더 친근한 표현으로 값을 바꾸고 싶다면, 언어 파일의 `values` 배열에 다음과 같이 등록하면 됩니다.

```php
'values' => [
    'payment_type' => [
        'cc' => 'credit card'
    ],
],
```

> [!WARNING]
> 기본적으로 라라벨 애플리케이션 스캐폴드는 `lang` 디렉터리를 포함하지 않습니다. 라라벨의 언어 파일을 커스터마이징하고 싶다면 `lang:publish` Artisan 명령어로 게시하세요.

이 값을 등록하면, 유효성 검증 메시지가 다음과 같이 변경됩니다.

```text
The credit card number field is required when payment type is credit card.
```

<a name="available-validation-rules"></a>
## 사용 가능한 유효성 검증 규칙

아래는 사용 가능한 모든 유효성 검증 규칙과 그 기능을 정리한 목록입니다.

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

해당 필드는 `"yes"`, `"on"`, `1`, `"1"`, `true`, `"true"` 값 중 하나여야 합니다. 주로 "이용약관 동의"와 같은 필드를 검증할 때 유용합니다.

<a name="rule-accepted-if"></a>
#### accepted_if:anotherfield,value,...

다른 필드의 값이 특정 값과 같을 경우, 해당 필드가 `"yes"`, `"on"`, `1`, `"1"`, `true`, `"true"` 중 하나여야 합니다. 이 또한 "이용약관 동의" 등과 같이 조건부 동의가 필요한 항목 검증에 사용할 수 있습니다.

<a name="rule-active-url"></a>
#### active_url

해당 필드는 `dns_get_record` PHP 함수 기준으로 유효한 A 또는 AAAA 레코드를 가진 URL이어야 합니다. 제공된 URL의 호스트명은 `parse_url` PHP 함수를 통해 추출되어 `dns_get_record`로 전달됩니다.

<a name="rule-after"></a>
#### after:_date_

해당 필드는 지정된 날짜 이후의 값이어야 합니다. 지정된 날짜들은 `strtotime` PHP 함수로 전달되어 유효한 `DateTime` 인스턴스로 변환됩니다.

```php
'start_date' => 'required|date|after:tomorrow'
```

`strtotime`에서 평가될 날짜 문자열 대신, 비교 대상이 될 다른 필드를 지정할 수도 있습니다.

```php
'finish_date' => 'required|date|after:start_date'
```

날짜 기반 규칙은 유창한 형식의 `date` 규칙 빌더로도 만들 수 있습니다.

```php
use Illuminate\Validation\Rule;

'start_date' => [
    'required',
    Rule::date()->after(today()->addDays(7)),
],
```

`afterToday`와 `todayOrAfter` 메서드를 사용하면, 날짜가 오늘 이후여야 하거나, 오늘 또는 이후여야 함을 좀 더 명확하게 표현할 수 있습니다.

```php
'start_date' => [
    'required',
    Rule::date()->afterToday(),
],
```

<a name="rule-after-or-equal"></a>

#### after_or_equal:_date_

해당 필드는 지정된 날짜 이후이거나 같은 값이어야 합니다. 자세한 내용은 [after](#rule-after) 규칙을 참고하세요.

날짜 기반의 규칙을 좀 더 편리하게 작성하고 싶다면, fluent한 `date` 규칙 빌더를 사용할 수 있습니다.

```php
use Illuminate\Validation\Rule;

'start_date' => [
    'required',
    Rule::date()->afterOrEqual(today()->addDays(7)),
],
```

<a name="rule-anyof"></a>
#### anyOf

`Rule::anyOf` 유효성 규칙은 해당 필드가 지정된 여러 유효성 검사 규칙 중 **하나라도 충족**해야 함을 의미합니다. 예를 들어 아래의 규칙은 `username` 필드가 이메일 주소이거나, 대시(-)를 포함한 6자 이상의 영문/숫자 문자열(alpha-numeric)이면 통과합니다.

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

해당 필드는 [`\p{L}`](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AL%3A%5D&g=&i=) 및 [`\p{M}`](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AM%3A%5D&g=&i=)에 포함된 완전한 유니코드 문자(알파벳 문자)로만 이루어져야 합니다.

이 규칙을 ASCII 범위(`a-z`, `A-Z`) 문자로 한정하고 싶다면, `ascii` 옵션을 규칙에 전달할 수 있습니다.

```php
'username' => 'alpha:ascii',
```

<a name="rule-alpha-dash"></a>
#### alpha_dash

해당 필드는 [`\p{L}`](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AL%3A%5D&g=&i=), [`\p{M}`](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AM%3A%5D&g=&i=), [`\p{N}`](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AN%3A%5D&g=&i=)에 포함된 유니코드 영문/숫자 + ASCII 대시(`-`) 및 밑줄(`_`) 문자만 허용됩니다.

이 규칙을 ASCII 범위(`a-z`, `A-Z`, `0-9`) 문자로만 한정하고 싶다면, `ascii` 옵션을 규칙에 전달할 수 있습니다.

```php
'username' => 'alpha_dash:ascii',
```

<a name="rule-alpha-num"></a>
#### alpha_num

해당 필드는 [`\p{L}`](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AL%3A%5D&g=&i=), [`\p{M}`](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AM%3A%5D&g=&i=), [`\p{N}`](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AN%3A%5D&g=&i=)에 포함된 유니코드 영문/숫자로만 이루어져야 합니다.

이 규칙을 ASCII 범위(`a-z`, `A-Z`, `0-9`)로 한정하고 싶다면, `ascii` 옵션을 추가하세요.

```php
'username' => 'alpha_num:ascii',
```

<a name="rule-array"></a>
#### array

해당 필드는 PHP의 `array` 타입이어야 합니다.

`array` 규칙에 값을 추가로 지정하면, 입력 배열의 각 키가 지정된 값 목록 내에 있어야 합니다. 아래 예시에서 입력 배열의 `admin` 키는 허용된 값 목록(`name`, `username`)에 없기 때문에 유효하지 않습니다.

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

일반적으로 배열 내에서 허용되는 키를 항상 명시적으로 지정하는 것이 좋습니다.

<a name="rule-ascii"></a>
#### ascii

해당 필드는 7비트 ASCII 문자만으로 이루어져야 합니다.

<a name="rule-bail"></a>
#### bail

해당 필드에 대해 첫 번째 유효성 검사 실패가 발생하면, 이후 규칙들의 검증을 중지합니다.

`bail` 규칙은 **특정 필드에 한정**해서 작동하며, 하나라도 실패할 경우 그 필드는 더 이상 검사하지 않습니다. 전체 속성에 대해 하나라도 실패 시 전체 검증을 중지하고 싶다면, `stopOnFirstFailure` 메서드를 사용할 수 있습니다.

```php
if ($validator->stopOnFirstFailure()->fails()) {
    // ...
}
```

<a name="rule-before"></a>
#### before:_date_

해당 필드는 지정한 날짜 **이전**이어야 합니다. 입력된 날짜들은 PHP의 `strtotime` 함수로 변환되어 유효한 `DateTime` 인스턴스가 됩니다. 또한 [after](#rule-after) 규칙과 마찬가지로, 비교할 날짜로 다른 필드명을 사용할 수도 있습니다.

날짜 기반 규칙 역시 fluent한 `date` 규칙 빌더로 작성할 수 있습니다.

```php
use Illuminate\Validation\Rule;

'start_date' => [
    'required',
    Rule::date()->before(today()->subDays(7)),
],
```

`beforeToday`와 `todayOrBefore` 메서드는 각기 "오늘 이전", "오늘 또는 이전"을 간결하게 표현할 수 있습니다.

```php
'start_date' => [
    'required',
    Rule::date()->beforeToday(),
],
```

<a name="rule-before-or-equal"></a>
#### before_or_equal:_date_

해당 필드는 지정한 날짜와 **같거나 이전**이어야 합니다. 입력된 날짜들은 PHP의 `strtotime` 함수로 변환되어 유효한 `DateTime` 인스턴스가 됩니다. [after](#rule-after) 규칙과 동일하게, 비교할 날짜로 다른 필드명을 사용할 수도 있습니다.

날짜 기반 규칙 역시 fluent한 `date` 규칙 빌더로 작성할 수 있습니다.

```php
use Illuminate\Validation\Rule;

'start_date' => [
    'required',
    Rule::date()->beforeOrEqual(today()->subDays(7)),
],
```

<a name="rule-between"></a>
#### between:_min_,_max_

해당 필드는 지정한 _min_과 _max_의 범위(포함)에 속하는 크기를 가져야 합니다. 문자열, 숫자, 배열, 파일 모두 [size](#rule-size) 규칙과 같은 방식으로 평가됩니다.

<a name="rule-boolean"></a>
#### boolean

해당 필드는 불리언 타입으로 변환될 수 있어야 합니다. 허용되는 입력값은 `true`, `false`, `1`, `0`, `"1"`, `"0"`입니다.

<a name="rule-confirmed"></a>
#### confirmed

해당 필드와 `{field}_confirmation`이라는 이름의 일치하는 필드가 있어야 합니다. 예를 들어 검증 대상 필드가 `password`이면, `password_confirmation` 필드도 함께 입력되어야 하며 두 값이 일치해야 합니다.

커스텀 확인 필드명을 지정할 수도 있습니다. 예를 들어, `confirmed:repeat_username`이라고 정의하면, `repeat_username` 필드가 현재 필드와 일치하는지 확인합니다.

<a name="rule-contains"></a>
#### contains:_foo_,_bar_,...

해당 필드는 지정된 파라미터 값들이 모두 포함되어 있는 배열이어야 합니다.

<a name="rule-current-password"></a>
#### current_password

해당 필드는 인증된 사용자의 비밀번호와 일치해야 합니다. 규칙의 첫 번째 파라미터로 [인증 가드](/docs/12.x/authentication)를 지정할 수 있습니다.

```php
'password' => 'current_password:api'
```

<a name="rule-date"></a>
#### date

해당 필드는 PHP의 `strtotime` 함수에 의해 변환 가능한 **유효한, 상대적이지 않은 날짜**여야 합니다.

<a name="rule-date-equals"></a>
#### date_equals:_date_

해당 필드는 지정한 날짜와 같은 날짜여야 합니다. 입력값은 PHP의 `strtotime` 함수로 변환되어 검사됩니다.

<a name="rule-date-format"></a>
#### date_format:_format_,...

해당 필드는 지정된 _formats_ 중 하나와 일치해야 합니다. 필드를 검사할 때 `date` 또는 `date_format` 중 **하나만** 사용해야 하며, 두 개를 동시에 사용하지 않아야 합니다. 이 규칙은 PHP의 [DateTime](https://www.php.net/manual/en/class.datetime.php) 클래스가 지원하는 모든 포맷을 사용할 수 있습니다.

날짜 기반 규칙을 편리하게 작성하려면 fluent `date` 규칙 빌더를 사용할 수도 있습니다.

```php
use Illuminate\Validation\Rule;

'start_date' => [
    'required',
    Rule::date()->format('Y-m-d'),
],
```

<a name="rule-decimal"></a>
#### decimal:_min_,_max_

해당 필드는 숫자여야 하며, 지정된 소수점 자릿수를 가져야 합니다.

```php
// 정확히 소수점 이하 두 자리만 허용(9.99)...
'price' => 'decimal:2'

// 소수점 이하 2~4자리 허용...
'price' => 'decimal:2,4'
```

<a name="rule-declined"></a>
#### declined

해당 필드는 `"no"`, `"off"`, `0`, `"0"`, `false`, `"false"` 중 하나여야 합니다.

<a name="rule-declined-if"></a>
#### declined_if:anotherfield,value,...

만약 검증 중인 다른 필드가 특정 값과 같을 경우, 해당 필드는 `"no"`, `"off"`, `0`, `"0"`, `false`, `"false"` 중 하나여야 합니다.

<a name="rule-different"></a>
#### different:_field_

해당 필드는 _field_와 서로 **다른** 값을 가져야 합니다.

<a name="rule-digits"></a>
#### digits:_value_

해당 필드는 정수여야 하며, 정확히 _value_ 자리수여야 합니다.

<a name="rule-digits-between"></a>
#### digits_between:_min_,_max_

해당 필드는 정수여야 하며, 자리수가 _min_에서 _max_ 사이여야 합니다.

<a name="rule-dimensions"></a>
#### dimensions

해당 파일은 규칙의 파라미터에서 지정한 **이미지 크기 조건**을 만족해야 합니다.

```php
'avatar' => 'dimensions:min_width=100,min_height=200'
```

사용 가능한 제약 조건: _min_width_, _max_width_, _min_height_, _max_height_, _width_, _height_, _ratio_

_ratio_ 제한은 '가로/세로' 비율을 나타냅니다. `3/2`와 같이 분수로, 또는 `1.5`와 같은 소수(float)로 지정할 수 있습니다.

```php
'avatar' => 'dimensions:ratio=3/2'
```

이 규칙은 인자가 많기 때문에, `Rule::dimensions` 메서드로 fluent하게 정의하는 것이 더 편리합니다.

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

배열을 검사할 때, 해당 필드는 중복된 값을 가질 수 없습니다.

```php
'foo.*.id' => 'distinct'
```

`distinct`는 기본적으로 느슨한(loose) 변수 비교를 사용합니다. 엄격한(strict) 비교를 사용하려면, 검증 규칙에 `strict` 파라미터를 추가하세요.

```php
'foo.*.id' => 'distinct:strict'
```

대소문자 차이를 무시하도록 하려면, `ignore_case` 옵션을 추가할 수 있습니다.

```php
'foo.*.id' => 'distinct:ignore_case'
```

<a name="rule-doesnt-start-with"></a>
#### doesnt_start_with:_foo_,_bar_,...

해당 필드는 주어진 값들 중 하나로 **시작해서는 안 됩니다**.

<a name="rule-doesnt-end-with"></a>
#### doesnt_end_with:_foo_,_bar_,...

해당 필드는 주어진 값들 중 하나로 **끝나서는 안 됩니다**.

<a name="rule-email"></a>
#### email

해당 필드는 이메일 주소 형식을 가져야 합니다. 이 규칙은 이메일 주소 유효성 검사를 위해 [egulias/email-validator](https://github.com/egulias/EmailValidator) 패키지를 사용합니다. 기본적으로 `RFCValidation` 검증기가 적용되며, 다양한 추가 검증 스타일도 사용할 수 있습니다.

```php
'email' => 'email:rfc,dns'
```

위 예시는 `RFCValidation`과 `DNSCheckValidation` 검증이 모두 적용됩니다. 적용 가능한 모든 검증 스타일은 다음과 같습니다.

<div class="content-list" markdown="1">

- `rfc`: `RFCValidation` - [지원되는 RFC](https://github.com/egulias/EmailValidator?tab=readme-ov-file#supported-rfcs)의 규격을 따릅니다.
- `strict`: `NoRFCWarningsValidation` - [지원 RFC](https://github.com/egulias/EmailValidator?tab=readme-ov-file#supported-rfcs) 규격을 따르며, 경고(예: 끝에 붙은 마침표, 연속된 마침표) 발생 시 실패 처리함.
- `dns`: `DNSCheckValidation` - 이메일 도메인이 유효한 MX 레코드를 갖고 있는지 검사합니다.
- `spoof`: `SpoofCheckValidation` - 이메일 주소에 동형 문자(homograph) 또는 속이는 유니코드 문자가 포함되지 않았는지 검사합니다.
- `filter`: `FilterEmailValidation` - PHP의 `filter_var` 함수 기준의 유효성 검사를 적용합니다.
- `filter_unicode`: `FilterEmailValidation::unicode()` - PHP의 `filter_var` 함수 기준의 유효성 검사를 유니코드 문자 허용 모드로 실행합니다.

</div>

좀 더 편리하게 email 유효성 규칙을 빌더로 작성할 수도 있습니다.

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
> `dns`와 `spoof` 검증기는 PHP의 `intl` 확장 모듈이 필요합니다.

<a name="rule-ends-with"></a>
#### ends_with:_foo_,_bar_,...

해당 필드는 주어진 값들 중 하나로 **끝나야 합니다**.

<a name="rule-enum"></a>
#### enum

`Enum` 규칙은 해당 필드가 유효한 열거형(enum) 값인지 검사합니다. `Enum` 규칙의 생성자에는 열거형의 이름만 전달하면 됩니다. 원시 타입을 검사하려면, backed Enum을 전달해야 합니다.

```php
use App\Enums\ServerStatus;
use Illuminate\Validation\Rule;

$request->validate([
    'status' => [Rule::enum(ServerStatus::class)],
]);
```

`Enum` 규칙의 `only`와 `except` 메서드를 활용하면, 허용 또는 제외할 enum case를 제한할 수 있습니다.

```php
Rule::enum(ServerStatus::class)
    ->only([ServerStatus::Pending, ServerStatus::Active]);

Rule::enum(ServerStatus::class)
    ->except([ServerStatus::Pending, ServerStatus::Active]);
```

`when` 메서드를 통해 조건부로 Enum 규칙을 동적으로 변경할 수도 있습니다.

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

해당 필드는 `validate` 및 `validated` 메서드가 반환하는 요청 데이터에서 **제외**됩니다.

<a name="rule-exclude-if"></a>
#### exclude_if:_anotherfield_,_value_

`_anotherfield_` 필드가 `_value_`와 같을 경우, 해당 필드는 `validate` 및 `validated` 메서드의 반환 데이터에서 **제외**됩니다.

좀 더 복잡한 조건부 제외 로직이 필요하다면, `Rule::excludeIf` 메서드를 사용할 수 있습니다. 이 메서드는 불린값 또는 클로저를 인수로 받으며, 클로저는 해당 필드를 제외해야 할지 여부를 `true` 또는 `false`로 반환해야 합니다.

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

`_anotherfield_` 필드가 `_value_`와 같지 않을 경우, 해당 필드는 `validate` 및 `validated` 메서드가 반환하는 요청 데이터에서 **제외**됩니다. 만약 `_value_`가 `null`인 경우(`exclude_unless:name,null`), 비교 필드가 `null`이거나 요청 데이터에 필드가 없는 경우에만 해당 필드는 포함됩니다.

<a name="rule-exclude-with"></a>
#### exclude_with:_anotherfield_

`_anotherfield_` 필드가 존재하면, 해당 필드는 `validate` 및 `validated` 메서드 반환 데이터에서 **제외**됩니다.

<a name="rule-exclude-without"></a>
#### exclude_without:_anotherfield_

`_anotherfield_` 필드가 존재하지 않을 때, 해당 필드는 `validate` 및 `validated` 메서드가 반환하는 요청 데이터에서 **제외**됩니다.

<a name="rule-exists"></a>
#### exists:_table_,_column_

해당 필드는 지정한 데이터베이스 테이블에 **존재해야 합니다**.

<a name="basic-usage-of-exists-rule"></a>
#### Exists 규칙의 기본 사용법

```php
'state' => 'exists:states'
```

`column` 옵션을 지정하지 않으면, 필드명이 사용됩니다. 위 예시의 경우, 요청 데이터의 `state` 속성값이 `states` 테이블의 `state` 컬럼에 존재하는지 검증합니다.

<a name="specifying-a-custom-column-name"></a>
#### 특정 컬럼명 지정

유효성 규칙에서 사용할 데이터베이스 컬럼명을 테이블명 뒤에 명시적으로 지정할 수 있습니다.

```php
'state' => 'exists:states,abbreviation'
```

때로는 `exists` 쿼리에 사용할 데이터베이스 연결명을 지정해야 할 수도 있습니다. 이 경우에는 테이블 이름 앞에 연결명을 붙이면 됩니다.

```php
'email' => 'exists:connection.staff,email'
```

테이블명을 직접 지정하는 대신, 해당 테이블의 Eloquent 모델명을 명시할 수도 있습니다.

```php
'user_id' => 'exists:App\Models\User,id'
```

쿼리를 더욱 세밀하게 제어하고 싶다면, `Rule` 클래스를 사용하여 규칙을 배열 형태로 fluently 정의할 수 있습니다. 다음 예시에서는 `|` 대신 배열을 사용하고, 쿼리 조건을 추가로 지정합니다.

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

`Rule::exists` 메서드가 생성하는 exists 규칙에 사용될 컬럼명을 두 번째 인자로 명시적으로 지정할 수 있습니다.

```php
'state' => Rule::exists('states', 'abbreviation'),
```

여러 개의 값(배열 형태)이 데이터베이스에 존재하는지 검증하려면, [array](#rule-array)와 `exists` 규칙을 함께 추가하면 됩니다.

```php
'states' => ['array', Rule::exists('states', 'abbreviation')],
```

이렇게 하면, Laravel은 제공된 모든 값이 지정 테이블에 존재하는지 한 번의 쿼리로 자동 검증합니다.

<a name="rule-extensions"></a>
#### extensions:_foo_,_bar_,...

해당 파일은 나열된 확장자 중 하나여야 합니다.

```php
'photo' => ['required', 'extensions:jpg,png'],
```

> [!WARNING]
> 파일의 확장자만으로 유효성을 검증하는 것은 안전하지 않습니다. 반드시 [mimes](#rule-mimes) 또는 [mimetypes](#rule-mimetypes)와 같은 규칙과 함께 사용하는 것이 좋습니다.

<a name="rule-file"></a>
#### file

해당 필드는 정상적으로 업로드된 파일이어야 합니다.

<a name="rule-filled"></a>
#### filled

해당 필드는 값이 **비어 있지 않아야 하며**, 존재할 때 값이 있어야 합니다.

<a name="rule-gt"></a>
#### gt:_field_

해당 필드는 주어진 _field_ 또는 _value_보다 커야 합니다. 두 필드는 반드시 같은 타입이어야 하며, 문자열, 숫자, 배열, 파일 모두 [size](#rule-size) 규칙과 동일한 방식으로 비교됩니다.

<a name="rule-gte"></a>
#### gte:_field_

해당 필드는 주어진 _field_ 또는 _value_보다 크거나 같아야 합니다. 두 필드는 같은 타입이어야 하며, 문자열, 숫자, 배열, 파일 모두 [size](#rule-size) 규칙과 동일하게 비교됩니다.

<a name="rule-hex-color"></a>
#### hex_color

해당 필드는 [16진수(hex)](https://developer.mozilla.org/en-US/docs/Web/CSS/hex-color) 형식의 유효한 색상 값이어야 합니다.

<a name="rule-image"></a>
#### image

해당 파일은 이미지여야 합니다(jpg, jpeg, png, bmp, gif, 또는 webp).

> [!WARNING]
> 기본적으로 image 규칙은 XSS 취약성 문제로 인해 SVG 파일을 허용하지 않습니다. SVG 파일 허용이 필요한 경우, `image:allow_svg` 지시어를 추가하면 됩니다.

<a name="rule-in"></a>
#### in:_foo_,_bar_,...

해당 필드는 주어진 값 목록 중에 하나이어야 합니다. 이 규칙을 배열의 값에 모두 적용하려면, `Rule::in` 메서드로 규칙을 더 명확하게 구성할 수 있습니다.

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

`in` 규칙이 `array` 규칙과 함께 사용될 경우, 입력 배열 내 각 값은 in 규칙에 지정된 목록에 존재해야 합니다. 아래 예시에서 입력 배열의 `LAS` 값은 제공된 공항 목록에 없으므로 유효하지 않습니다.

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

유효성 검증 대상 필드의 값이 _anotherfield_의 값 목록에 포함되어 있어야 합니다.

<a name="rule-integer"></a>
#### integer

유효성 검증 대상 필드는 정수여야 합니다.

> [!WARNING]
> 이 검증 규칙은 입력값이 실제로 "integer" 타입인지까지 확인하지는 않고, PHP의 `FILTER_VALIDATE_INT` 규칙에서 허용하는 값이면 통과합니다. 값이 진짜 숫자인지까지 확인하고 싶다면, 반드시 [numeric 검증 규칙](#rule-numeric)과 함께 사용해야 합니다.

<a name="rule-ip"></a>
#### ip

유효성 검증 대상 필드는 IP 주소여야 합니다.

<a name="ipv4"></a>
#### ipv4

유효성 검증 대상 필드는 IPv4 주소여야 합니다.

<a name="ipv6"></a>
#### ipv6

유효성 검증 대상 필드는 IPv6 주소여야 합니다.

<a name="rule-json"></a>
#### json

유효성 검증 대상 필드는 올바른 JSON 문자열이어야 합니다.

<a name="rule-lt"></a>
#### lt:_field_

유효성 검증 대상 필드의 값은 지정한 _field_ 값보다 작아야 합니다. 두 필드는 반드시 같은 타입이어야 합니다. 문자열, 숫자, 배열, 파일 모두 [size](#rule-size) 규칙과 동일한 방식으로 비교됩니다.

<a name="rule-lte"></a>
#### lte:_field_

유효성 검증 대상 필드의 값은 지정한 _field_ 값보다 작거나 같아야 합니다. 두 필드는 반드시 같은 타입이어야 합니다. 문자열, 숫자, 배열, 파일 모두 [size](#rule-size) 규칙과 동일한 방식으로 비교됩니다.

<a name="rule-lowercase"></a>
#### lowercase

유효성 검증 대상 필드는 모두 소문자여야 합니다.

<a name="rule-list"></a>
#### list

유효성 검증 대상 필드는 배열이어야 하며, 해당 배열이 리스트여야 합니다. 배열의 키가 0부터 `count($array) - 1`까지 연속된 숫자일 때 리스트로 간주합니다.

<a name="rule-mac"></a>
#### mac_address

유효성 검증 대상 필드는 MAC 주소여야 합니다.

<a name="rule-max"></a>
#### max:_value_

유효성 검증 대상 필드는 _value_ 값보다 작거나 같아야 합니다. 문자열, 숫자, 배열, 파일은 [size](#rule-size) 규칙과 동일하게 평가합니다.

<a name="rule-max-digits"></a>
#### max_digits:_value_

유효성 검증 대상 정수는 최대 _value_ 자리수까지만 허용됩니다.

<a name="rule-mimetypes"></a>
#### mimetypes:_text/plain_,...

유효성 검증 대상 파일이 지정된 MIME 타입 중 하나와 일치해야 합니다.

```php
'video' => 'mimetypes:video/avi,video/mpeg,video/quicktime'
```

업로드된 파일의 MIME 타입은 파일의 실제 내용을 읽어서 프레임워크가 추측(guess)하며, 이는 클라이언트가 전송한 MIME 타입과 다를 수 있습니다.

<a name="rule-mimes"></a>
#### mimes:_foo_,_bar_,...

유효성 검증 대상 파일의 MIME 타입이 지정한 확장자 중 하나에 해당해야 합니다.

```php
'photo' => 'mimes:jpg,bmp,png'
```

확장자만 지정하면 되지만, 이 규칙은 실제로 파일의 내용을 읽어 MIME 타입을 추측한 뒤 이를 검증합니다. MIME 타입과 그에 해당하는 확장자 전체 목록은 아래에서 확인할 수 있습니다.

[https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types](https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types)

<a name="mime-types-and-extensions"></a>
#### MIME Type과 확장자

이 검증 규칙은 파일의 MIME 타입과 사용자가 지정한 파일 확장자가 반드시 일치하는지까지 확인하지는 않습니다. 예를 들어, `mimes:png` 규칙은 파일의 내용이 실제 PNG라면 파일명이 `photo.txt`이더라도 PNG 이미지를 유효하다고 간주합니다. 사용자가 지정한 파일 확장자를 별도로 확인하고 싶다면 [extensions](#rule-extensions) 규칙을 사용할 수 있습니다.

<a name="rule-min"></a>
#### min:_value_

유효성 검증 대상 필드는 최소 _value_ 값을 가져야 합니다. 문자열, 숫자, 배열, 파일 모두 [size](#rule-size) 규칙과 동일하게 평가합니다.

<a name="rule-min-digits"></a>
#### min_digits:_value_

유효성 검증 대상 정수는 최소 _value_ 자리수를 가져야 합니다.

<a name="rule-multiple-of"></a>
#### multiple_of:_value_

유효성 검증 대상 필드는 _value_의 배수여야 합니다.

<a name="rule-missing"></a>
#### missing

유효성 검증 대상 필드는 입력 데이터에 존재하지 않아야 합니다.

<a name="rule-missing-if"></a>
#### missing_if:_anotherfield_,_value_,...

유효성 검증 대상 필드는 _anotherfield_의 값이 지정한 _value_ 중 하나와 일치할 때 존재하지 않아야 합니다.

<a name="rule-missing-unless"></a>
#### missing_unless:_anotherfield_,_value_

유효성 검증 대상 필드는 _anotherfield_의 값이 지정한 _value_ 중 하나와 일치하지 않을 때 존재하지 않아야 합니다.

<a name="rule-missing-with"></a>
#### missing_with:_foo_,_bar_,...

유효성 검증 대상 필드는 지정된 다른 필드들 중 하나라도 존재하는 경우에만 존재하지 않아야 합니다.

<a name="rule-missing-with-all"></a>
#### missing_with_all:_foo_,_bar_,...

유효성 검증 대상 필드는 지정된 다른 필드들이 모두 존재하는 경우에만 존재하지 않아야 합니다.

<a name="rule-not-in"></a>
#### not_in:_foo_,_bar_,...

유효성 검증 대상 필드의 값이 지정한 값 목록에 포함되어 있으면 안 됩니다. `Rule::notIn` 메서드를 활용해 보다 명확하게 규칙을 구성할 수 있습니다.

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

유효성 검증 대상 필드의 값이 지정한 정규식 패턴과 일치하지 않아야 합니다.

이 규칙은 내부적으로 PHP의 `preg_match` 함수를 사용합니다. 입력한 정규식 패턴은 반드시 `preg_match`에서 요구하는 양식(구분자 포함)을 따라야 합니다. 예: `'email' => 'not_regex:/^.+$/i'`.

> [!WARNING]
> `regex` / `not_regex` 패턴을 사용할 때 정규식에 `|` 문자가 포함되어 있다면, 규칙을 문자열의 `|` 구분자 대신 배열로 지정하는 것이 좋습니다.

<a name="rule-nullable"></a>
#### nullable

유효성 검증 대상 필드는 `null`이어도 허용합니다.

<a name="rule-numeric"></a>
#### numeric

유효성 검증 대상 필드는 [숫자형](https://www.php.net/manual/en/function.is-numeric.php)이어야 합니다.

<a name="rule-present"></a>
#### present

유효성 검증 대상 필드는 입력 데이터에 반드시 존재해야 합니다.

<a name="rule-present-if"></a>
#### present_if:_anotherfield_,_value_,...

유효성 검증 대상 필드는 _anotherfield_의 값이 지정한 _value_ 중 하나와 같을 때 반드시 존재해야 합니다.

<a name="rule-present-unless"></a>
#### present_unless:_anotherfield_,_value_

유효성 검증 대상 필드는 _anotherfield_의 값이 지정한 _value_ 중 하나와 같지 않을 때 반드시 존재해야 합니다.

<a name="rule-present-with"></a>
#### present_with:_foo_,_bar_,...

유효성 검증 대상 필드는 지정한 다른 필드 중 하나라도 존재할 때만 반드시 존재해야 합니다.

<a name="rule-present-with-all"></a>
#### present_with_all:_foo_,_bar_,...

유효성 검증 대상 필드는 지정한 다른 필드들이 모두 존재할 때만 반드시 존재해야 합니다.

<a name="rule-prohibited"></a>
#### prohibited

유효성 검증 대상 필드는 입력값에 포함되어 있지 않거나 비어 있어야 합니다. 필드가 "비어 있음"으로 간주되는 조건은 다음과 같습니다.

<div class="content-list" markdown="1">

- 값이 `null`인 경우
- 값이 빈 문자열인 경우
- 값이 빈 배열이거나, 빈 `Countable` 객체인 경우
- 업로드된 파일이지만 경로가 비어 있는 경우

</div>

<a name="rule-prohibited-if"></a>
#### prohibited_if:_anotherfield_,_value_,...

유효성 검증 대상 필드는 _anotherfield_의 값이 지정한 _value_ 중 하나와 같을 때 반드시 입력값에 포함되지 않거나, 비어 있어야 합니다. "비어 있음"의 기준은 아래와 같습니다.

<div class="content-list" markdown="1">

- 값이 `null`인 경우
- 값이 빈 문자열인 경우
- 값이 빈 배열이거나, 빈 `Countable` 객체인 경우
- 업로드된 파일이지만 경로가 비어 있는 경우

</div>

복잡한 조건으로 입력 금지 로직이 필요한 경우 `Rule::prohibitedIf` 메서드를 사용할 수 있습니다. 이 메서드는 불리언 값이나 클로저를 인자로 받을 수 있습니다. 클로저를 사용할 때는 true 또는 false를 반환해야 하며, 반환값에 따라 필드의 입력 허용 여부가 결정됩니다.

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

유효성 검증 대상 필드는 _anotherfield_의 값이 `"yes"`, `"on"`, `1`, `"1"`, `true`, `"true"` 중 하나일 때 반드시 값이 비어 있거나 입력되지 않아야 합니다.

<a name="rule-prohibited-if-declined"></a>
#### prohibited_if_declined:_anotherfield_,...

유효성 검증 대상 필드는 _anotherfield_의 값이 `"no"`, `"off"`, `0`, `"0"`, `false`, `"false"` 중 하나일 때 반드시 값이 비어 있거나 입력되지 않아야 합니다.

<a name="rule-prohibited-unless"></a>
#### prohibited_unless:_anotherfield_,_value_,...

유효성 검증 대상 필드는 _anotherfield_의 값이 지정한 _value_ 중 하나와 같지 않을 때 반드시 값이 비어 있거나 입력되지 않아야 합니다. "비어 있음"의 기준은 아래와 같습니다.

<div class="content-list" markdown="1">

- 값이 `null`인 경우
- 값이 빈 문자열인 경우
- 값이 빈 배열이거나, 빈 `Countable` 객체인 경우
- 업로드된 파일이지만 경로가 비어 있는 경우

</div>

<a name="rule-prohibits"></a>
#### prohibits:_anotherfield_,...

유효성 검증 대상 필드가 비어 있지 않으면, _anotherfield_에 지정된 모든 필드는 반드시 값이 비어 있거나 입력되지 않아야 합니다. "비어 있음"의 기준은 아래와 같습니다.

<div class="content-list" markdown="1">

- 값이 `null`인 경우
- 값이 빈 문자열인 경우
- 값이 빈 배열이거나, 빈 `Countable` 객체인 경우
- 업로드된 파일이지만 경로가 비어 있는 경우

</div>

<a name="rule-regex"></a>
#### regex:_pattern_

유효성 검증 대상 필드는 지정한 정규식과 반드시 일치해야 합니다.

이 규칙은 내부적으로 PHP의 `preg_match` 함수를 사용합니다. 입력한 정규식 패턴은 반드시 `preg_match`에서 요구하는 양식(구분자 포함)을 따라야 합니다. 예: `'email' => 'regex:/^.+@.+$/i'`.

> [!WARNING]
> `regex` / `not_regex` 패턴을 사용할 때 정규식에 `|` 문자가 포함되어 있다면, 규칙을 배열로 지정하는 것이 좋습니다.

<a name="rule-required"></a>
#### required

유효성 검증 대상 필드는 입력 데이터에 반드시 존재하고, 비어 있으면 안 됩니다. 필드가 "비어 있음"으로 간주되는 조건은 다음과 같습니다.

<div class="content-list" markdown="1">

- 값이 `null`인 경우
- 값이 빈 문자열인 경우
- 값이 빈 배열이거나, 빈 `Countable` 객체인 경우
- 업로드된 파일이지만 경로가 없는 경우

</div>

<a name="rule-required-if"></a>
#### required_if:_anotherfield_,_value_,...

유효성 검증 대상 필드는 _anotherfield_의 값이 지정한 _value_ 중 하나와 같을 때 반드시 존재하고 비어 있으면 안 됩니다.

`required_if` 조건을 더 복잡하게 작성하고 싶다면, `Rule::requiredIf` 메서드를 사용할 수 있습니다. 이 메서드는 불리언 값이나 클로저를 받을 수 있으며, 클로저에서는 true 혹은 false를 반환해야 합니다. 반환값에 따라 필드의 필수 여부가 결정됩니다.

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

유효성 검증 대상 필드는 _anotherfield_의 값이 `"yes"`, `"on"`, `1`, `"1"`, `true`, `"true"` 중 하나일 때 반드시 존재하고 비어 있으면 안 됩니다.

<a name="rule-required-if-declined"></a>
#### required_if_declined:_anotherfield_,...

유효성 검증 대상 필드는 _anotherfield_의 값이 `"no"`, `"off"`, `0`, `"0"`, `false`, `"false"` 중 하나일 때 반드시 존재하고 비어 있으면 안 됩니다.

<a name="rule-required-unless"></a>
#### required_unless:_anotherfield_,_value_,...

유효성 검증 대상 필드는 _anotherfield_의 값이 지정한 _value_ 중 하나와 같지 않을 때 반드시 존재하고 비어 있으면 안 됩니다. 또한 이 규칙은 _value_가 `null`일 경우(예: `required_unless:name,null`) 비교 대상이 `null`이거나 요청 데이터에 아예 없으면 필드는 필수가 아닙니다.

<a name="rule-required-with"></a>
#### required_with:_foo_,_bar_,...

유효성 검증 대상 필드는 지정한 다른 필드들 중 하나라도 존재하고 비어 있지 않을 때에만 반드시 존재하고 비어 있지 않아야 합니다.

<a name="rule-required-with-all"></a>
#### required_with_all:_foo_,_bar_,...

유효성 검증 대상 필드는 지정한 다른 필드들이 모두 존재하고 비어 있지 않을 때에만 반드시 존재하고 비어 있지 않아야 합니다.

<a name="rule-required-without"></a>
#### required_without:_foo_,_bar_,...

유효성 검증 대상 필드는 지정한 다른 필드들 중 하나라도 없거나 비어 있을 때만 반드시 존재하고 비어 있지 않아야 합니다.

<a name="rule-required-without-all"></a>
#### required_without_all:_foo_,_bar_,...

유효성 검증 대상 필드는 지정한 다른 필드들이 모두 없거나 비어 있을 때만 반드시 존재하고 비어 있지 않아야 합니다.

<a name="rule-required-array-keys"></a>
#### required_array_keys:_foo_,_bar_,...

유효성 검증 대상 필드는 배열이어야 하며, 지정한 키들이 모두 포함되어 있어야 합니다.

<a name="rule-same"></a>
#### same:_field_

지정한 _field_의 값이 유효성 검증 대상 필드와 일치해야 합니다.

<a name="rule-size"></a>
#### size:_value_

유효성 검증 대상 필드는 지정한 _value_ 크기와 일치해야 합니다.  
문자열 데이터: _value_는 문자 수를 의미합니다.  
숫자 데이터: _value_는 해당 정수 값이 됩니다(`numeric` 또는 `integer` 규칙과 함께 사용해야 함).  
배열: 배열의 개수(`count`)가 _size_와 일치해야 합니다.  
파일: 파일의 크기가 _value_ 킬로바이트와 같아야 합니다.  
아래 예시를 참고하세요.

```php
// 문자열이 정확히 12글자인지 검증
'title' => 'size:12';

// 입력받은 정수가 10인지 검증
'seats' => 'integer|size:10';

// 배열 요소가 정확히 5개인지 검증
'tags' => 'array|size:5';

// 업로드된 파일의 용량이 512KB인지 검증
'image' => 'file|size:512';
```

<a name="rule-starts-with"></a>
#### starts_with:_foo_,_bar_,...

유효성 검증 대상 필드는 지정한 값들 중 하나로 시작해야 합니다.

<a name="rule-string"></a>
#### string

유효성 검증 대상 필드는 문자열이어야 합니다. 만약 해당 필드에 `null` 값도 허용하려면 `nullable` 규칙을 함께 지정해야 합니다.

<a name="rule-timezone"></a>
#### timezone

유효성 검증 대상 필드는 `DateTimeZone::listIdentifiers` 메서드에 따라 유효한 타임존 식별자여야 합니다.

[DateTimeZone::listIdentifiers 메서드](https://www.php.net/manual/en/datetimezone.listidentifiers.php)가 허용하는 인자를 이 검증 규칙에서도 추가로 사용할 수 있습니다.

```php
'timezone' => 'required|timezone:all';

'timezone' => 'required|timezone:Africa';

'timezone' => 'required|timezone:per_country,US';
```

<a name="rule-unique"></a>
#### unique:_table_,_column_

유효성 검증 대상 필드의 값이 지정한 데이터베이스 테이블에 이미 존재하지 않아야 합니다.

**테이블명 및 컬럼명 커스텀 지정:**

테이블명을 직접 지정하는 대신, 해당 테이블과 연결된 Eloquent 모델을 지정할 수도 있습니다.

```php
'email' => 'unique:App\Models\User,email_address'
```

`column` 옵션을 통해 비교할 컬럼명을 지정할 수 있습니다. `column`을 지정하지 않으면, 유효성 검증 대상 필드명이 기본값으로 사용됩니다.

```php
'email' => 'unique:users,email_address'
```

**데이터베이스 커스텀 커넥션 지정:**

Validator가 질의하는 데이터베이스 커넥션을 커스텀으로 지정하고 싶을 때는, 테이블명 앞에 커넥션명을 붙이면 됩니다.

```php
'email' => 'unique:connection.users,email_address'
```

**특정 ID를 무시하고 고유값을 검사하고 싶을 때:**

예를 들어, "프로필 수정" 화면에서 사용자의 이름, 이메일, 지역 정보를 받고, 이메일의 고유성(unique)을 검사하고자 합니다. 만약 사용자가 '이름'만 바꾸고 '이메일'은 그대로 둘 경우, 이미 자신의 이메일 주소이기 때문에 검증 에러가 발생하지 않아야 하겠죠.

해당 사용자의 ID를 무시하고 고유값을 체크하려면, `Rule` 클래스를 사용해 규칙을 메서드 체인 방식으로 정의할 수 있습니다. 아래 예에서는 검증 규칙을 `|` 구분자가 아니라 배열로 지정하는 방법도 함께 보여줍니다.

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
> 사용자가 직접 조작 가능한 입력값을 `ignore` 메서드에 전달해서는 절대로 안 됩니다. 반드시 시스템에서 자동으로 생성된 고유한 값, 예를 들어 auto-increment ID나 Eloquent 모델의 UUID만 사용해야 보안상 안전합니다. 그렇지 않으면 SQL 인젝션 공격에 취약할 수 있습니다.

모델의 키 값을 전달하는 대신, 모델 인스턴스 전체를 전달할 수도 있습니다. 이 경우 라라벨이 자동으로 키 값을 추출해줍니다.

```php
Rule::unique('users')->ignore($user)
```

테이블의 기본키 컬럼명이 `id`가 아니라면, `ignore` 호출 시 두 번째 파라미터로 컬럼명을 지정할 수 있습니다.

```php
Rule::unique('users')->ignore($user->id, 'user_id')
```

기본적으로 unique 규칙은 검증 대상 필드명과 같은 컬럼의 고유성을 확인합니다. 다른 컬럼명을 두 번째 인자로 지정할 수도 있습니다.

```php
Rule::unique('users', 'email_address')->ignore($user->id)
```

**where 조건을 추가하고 싶을 때:**

`where` 메서드로 쿼리에 조건을 추가할 수 있습니다. 예시로, `account_id` 컬럼의 값이 1인 레코드만 검색하도록 범위를 좁힐 수 있습니다.

```php
'email' => Rule::unique('users')->where(fn (Builder $query) => $query->where('account_id', 1))
```

**고유성 검사에서 소프트 삭제된 레코드 제외:**

기본적으로 unique 규칙은 soft delete된 레코드까지 포함해 검토합니다. soft delete된 레코드는 제외하고 싶다면 `withoutTrashed` 메서드를 사용하세요.

```php
Rule::unique('users')->withoutTrashed();
```

모델이 soft delete 컬럼명을 기본값(`deleted_at`) 대신 다른 값으로 사용한다면, `withoutTrashed` 호출 시 컬럼명을 지정할 수 있습니다.

```php
Rule::unique('users')->withoutTrashed('was_deleted_at');
```

<a name="rule-uppercase"></a>
#### uppercase

유효성 검증 대상 필드는 모두 대문자여야 합니다.

<a name="rule-url"></a>
#### url

유효성 검증 대상 필드는 올바른 URL이어야 합니다.

허용할 URL 프로토콜을 직접 지정하고 싶을 때는, 규칙의 파라미터로 프로토콜을 추가할 수 있습니다.

```php
'url' => 'url:http,https',

'game' => 'url:minecraft,steam',
```

<a name="rule-ulid"></a>
#### ulid

유효성 검증 대상 필드는 [ULID(Universally Unique Lexicographically Sortable Identifier)](https://github.com/ulid/spec) 형식에 맞아야 합니다.

<a name="rule-uuid"></a>
#### uuid

유효성 검증 대상 필드는 RFC 9562 (버전 1, 3, 4, 5, 6, 7, 8)의 UUID(범용 고유 식별자) 형식이어야 합니다.

특정 버전의 UUID와 일치하는지 검증할 수도 있습니다.

```php
'uuid' => 'uuid:4'
```

<a name="conditionally-adding-rules"></a>
## 조건부 규칙 추가

<a name="skipping-validation-when-fields-have-certain-values"></a>
#### 특정 값일 때 검증 건너뛰기

다른 필드 값이 특정 값일 때, 해당 필드의 검증 자체를 건너뛰고 싶을 때가 있습니다. 이런 경우에는 `exclude_if` 검증 규칙을 사용할 수 있습니다. 아래 예시는 `has_appointment` 필드 값이 `false`면 `appointment_date`와 `doctor_name` 필드의 검증을 모두 건너뜁니다.

```php
use Illuminate\Support\Facades\Validator;

$validator = Validator::make($data, [
    'has_appointment' => 'required|boolean',
    'appointment_date' => 'exclude_if:has_appointment,false|required|date',
    'doctor_name' => 'exclude_if:has_appointment,false|required|string',
]);
```

반대로, 특정 값이 아닐 때만 검증을 건너뛰고 싶은 경우 `exclude_unless` 규칙을 사용합니다.

```php
$validator = Validator::make($data, [
    'has_appointment' => 'required|boolean',
    'appointment_date' => 'exclude_unless:has_appointment,true|required|date',
    'doctor_name' => 'exclude_unless:has_appointment,true|required|string',
]);
```

<a name="validating-when-present"></a>

#### 존재할 때만 유효성 검사 수행

특정 상황에서는, 어떤 필드가 전달된 데이터 내에 **존재할 때만** 유효성 검사를 수행하고 싶을 수 있습니다. 이를 빠르게 구현하려면, 규칙 목록에 `sometimes` 규칙을 추가하면 됩니다.

```php
$validator = Validator::make($data, [
    'email' => 'sometimes|required|email',
]);
```

위 예제에서는 `$data` 배열에 `email` 필드가 존재할 때만 해당 필드의 유효성 검사가 진행됩니다.

> [!NOTE]
> 항상 존재해야 하지만 비어 있을 수도 있는 필드에 대해 유효성 검사를 하고 싶다면, [옵션 필드에 대한 안내](#a-note-on-optional-fields)를 참고하세요.

<a name="complex-conditional-validation"></a>
#### 복잡한 조건부 유효성 검사

때로는 좀 더 복잡한 조건부 로직에 따라 유효성 검증 규칙을 추가하고 싶을 수 있습니다. 예를 들어, 다른 필드의 값이 100보다 클 때만 특정 필드를 필수로 요구한다거나, 특정 필드가 있을 때만 두 개의 필드에 값이 있어야 하는 등 복잡한 조건이 필요할 수 있습니다. 이러한 조건부 유효성 검사는 어렵지 않게 추가할 수 있습니다. 먼저, 변경되지 않는 _정적 규칙_ 들로 `Validator` 인스턴스를 생성합니다:

```php
use Illuminate\Support\Facades\Validator;

$validator = Validator::make($request->all(), [
    'email' => 'required|email',
    'games' => 'required|integer|min:0',
]);
```

여기서 웹 애플리케이션이 게임 수집가를 위한 것이라고 가정해봅시다. 만약 어느 사용자가 100개가 넘는 게임을 소유하고 있다면, 왜 그렇게 많은 게임을 소유하게 되었는지 이유를 설명하도록 요구하고자 합니다. 예를 들어, 리셀샵을 운영한다거나 단순한 수집 취미 때문일 수 있겠죠. 이러한 조건부 필수 규칙을 추가하려면, `Validator` 인스턴스의 `sometimes` 메서드를 사용할 수 있습니다.

```php
use Illuminate\Support\Fluent;

$validator->sometimes('reason', 'required|max:500', function (Fluent $input) {
    return $input->games >= 100;
});
```

`sometimes` 메서드의 첫 번째 인수는 조건부로 유효성 검사를 적용할 필드 이름입니다. 두 번째 인수는 추가할 규칙의 목록입니다. 세 번째 인수로 전달된 클로저가 `true`를 반환하면, 해당 규칙이 실제로 추가됩니다. 이 메서드를 활용하면 복잡한 조건부 유효성 검사를 간단하게 구현할 수 있습니다. 여러 필드에 대해 한 번에 조건부 유효성 검사를 추가할 수도 있습니다.

```php
$validator->sometimes(['reason', 'cost'], 'required', function (Fluent $input) {
    return $input->games >= 100;
});
```

> [!NOTE]
> 클로저에 전달되는 `$input` 파라미터는 `Illuminate\Support\Fluent` 인스턴스이며, 유효성 검증 대상의 입력 및 파일에 접근하는 데 사용할 수 있습니다.

<a name="complex-conditional-array-validation"></a>
#### 복잡한 조건부 배열 유효성 검사

때때로, 중첩 배열 내에 있는 다른 필드를 기반으로 어떤 필드를 유효성 검증해야 할 때가 있지만, 그 배열의 인덱스를 미리 알 수 없는 경우도 있습니다. 이럴 때는, 클로저의 두 번째 인수로 현재 유효성 검사 중인 개별 배열 항목을 받을 수 있습니다.

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

이때, 클로저에 전달되는 `$item` 역시 배열 속성일 때는 `Illuminate\Support\Fluent` 인스턴스이고, 그 외에는 단순한 문자열이 됩니다.

<a name="validating-arrays"></a>
## 배열 유효성 검사

[배열 유효성 검사 규칙 문서](#rule-array)에서 설명한 것처럼, `array` 규칙은 허용되는 배열 키의 목록을 지정할 수 있습니다. 배열 내에 추가적인 키가 존재하면, 유효성 검증이 실패합니다.

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

일반적으로는 배열 내에 존재할 수 있는 키 목록을 항상 명시적으로 지정하는 것이 좋습니다. 그렇지 않으면, validator의 `validate` 및 `validated` 메서드는 유효성 검사를 거치지 않은 추가 키까지 포함하여 모든 데이터를 반환할 수 있습니다.

<a name="validating-nested-array-input"></a>
### 중첩 배열 입력의 유효성 검사

배열을 기반으로 한 중첩 폼 입력 필드도 간단히 유효성 검사를 할 수 있습니다. 배열 내 속성의 유효성 검증에는 "점 표기법(dot notation)"을 사용할 수 있습니다. 예를 들어, 들어오는 HTTP 요청에 `photos[profile]` 필드가 포함되어 있다면, 다음과 같이 유효성 검사를 적용할 수 있습니다.

```php
use Illuminate\Support\Facades\Validator;

$validator = Validator::make($request->all(), [
    'photos.profile' => 'required|image',
]);
```

배열의 각 요소에 대해서도 유효성 검증을 적용할 수 있습니다. 예를 들어, 주어진 배열 입력 필드 내의 모든 이메일이 고유한지 검사하려면 다음과 같이 하면 됩니다.

```php
$validator = Validator::make($request->all(), [
    'person.*.email' => 'email|unique:users',
    'person.*.first_name' => 'required_with:person.*.last_name',
]);
```

마찬가지로, [언어 파일에서 사용자 지정 유효성 메시지](#custom-messages-for-specific-attributes)를 지정할 때도 `*` 문자를 사용할 수 있으므로, 배열 기반 필드에 대해 동일한 메시지를 사용하기가 매우 쉽습니다.

```php
'custom' => [
    'person.*.email' => [
        'unique' => '각 사람의 이메일 주소는 고유해야 합니다.',
    ]
],
```

<a name="accessing-nested-array-data"></a>
#### 중첩 배열 데이터 접근

속성에 유효성 검증 규칙을 할당할 때, 특정 중첩 배열 요소의 값을 참조해야 할 일이 있을 수 있습니다. 이럴 때는 `Rule::forEach` 메서드를 사용할 수 있습니다. `forEach` 메서드는 유효성 검사 대상 배열 속성의 각 항목에 대해 호출되며, 각 항목의 값과 완전히 확장된 속성 이름을 인자로 전달합니다. 이 클로저는 배열 요소에 적용할 규칙 배열을 반환하면 됩니다.

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
### 에러 메시지에서 인덱스 및 위치 참조하기

배열을 검증하는 경우, 유효성 검증에 실패한 항목이 배열 내에서 몇 번째인지(인덱스 혹은 위치) 에러 메시지에 표기할 수 있습니다. 이를 위해 [사용자 지정 유효성 메시지](#manual-customizing-the-error-messages) 내에서 `:index`(0부터 시작)와 `:position`(1부터 시작) 플레이스홀더를 사용할 수 있습니다.

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
    'photos.*.description.required' => '사진 #:position의 설명을 입력해주세요.',
]);
```

위 예시처럼, 유효성 검증에 실패하면 사용자는 `"사진 #2의 설명을 입력해주세요."` 와 같은 에러 메시지를 보게 됩니다.

필요하다면, 더 깊이 중첩된 인덱스와 위치도 `second-index`, `second-position`, `third-index`, `third-position` 등으로 참조할 수 있습니다.

```php
'photos.*.attributes.*.string' => '사진 #:second-position의 속성이 올바르지 않습니다.',
```

<a name="validating-files"></a>
## 파일 유효성 검사

라라벨은 파일 업로드 시 사용할 수 있는 다양한 유효성 검사 규칙(`mimes`, `image`, `min`, `max` 등)을 제공합니다. 파일 유효성 검증 시 이러한 규칙을 개별적으로 지정해도 되지만, 더 편리하게 사용할 수 있는 유연한 파일 유효성 규칙 빌더도 제공합니다.

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
#### 파일 타입 유효성 검사

`types` 메서드 사용 시 확장자만 지정하면 되지만, 실제로 이 메서드는 파일 내용을 읽어 MIME 타입을 추정해 유효성을 검사합니다. 각 MIME 타입과 그에 해당하는 확장자 목록은 다음 위치에서 확인할 수 있습니다.

[https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types](https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types)

<a name="validating-files-file-sizes"></a>
#### 파일 크기 유효성 검사

더 편리하게 파일의 최소, 최대 크기는 접미사를 추가한 문자열로 지정할 수 있습니다. 지원하는 접미사로는 `kb`, `mb`, `gb`, `tb` 가 있습니다.

```php
File::types(['mp3', 'wav'])
    ->min('1kb')
    ->max('10mb');
```

<a name="validating-files-image-files"></a>
#### 이미지 파일 유효성 검사

애플리케이션에서 사용자가 이미지를 업로드할 수 있는 경우, `File` 규칙의 `image` 생성자를 사용해 업로드된 파일이 이미지(jpg, jpeg, png, bmp, gif, webp)임을 보장할 수 있습니다.

또한, 이미지의 크기를 제한하고자 할 때에는 `dimensions` 규칙도 함께 사용할 수 있습니다.

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
> 이미지 크기 유효성 검사에 관한 자세한 정보는 [dimensions 규칙 문서](#rule-dimensions)를 참고하세요.

> [!WARNING]
> 기본적으로, `image` 규칙은 XSS 취약성 때문에 SVG 파일을 허용하지 않습니다. SVG 파일을 허용해야 할 경우, `allowSvg: true` 옵션을 추가해서 사용할 수 있습니다: `File::image(allowSvg: true)`

<a name="validating-files-image-dimensions"></a>
#### 이미지 크기(가로/세로) 유효성 검사

이미지의 크기 역시 쉽게 검증할 수 있습니다. 예를 들어, 업로드된 이미지가 최소 폭 1000픽셀, 높이 500픽셀 이상이어야 한다면 `dimensions` 규칙을 활용할 수 있습니다.

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
> 이미지 크기 유효성 검사에 대한 자세한 내용은 [dimensions 규칙 문서](#rule-dimensions)를 참고하세요.

<a name="validating-passwords"></a>
## 비밀번호 유효성 검사

비밀번호가 충분히 복잡한지 쉽게 검사하려면 라라벨의 `Password` 규칙 객체를 사용할 수 있습니다.

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

$validator = Validator::make($request->all(), [
    'password' => ['required', 'confirmed', Password::min(8)],
]);
```

`Password` 규칙 객체는 비밀번호가 최소한 하나 이상의 영문자, 숫자, 특수기호, 대/소문자 혼합 여부 등 다양한 복잡도 요건을 쉽게 설정할 수 있도록 도와줍니다.

```php
// 최소 8자 이상...
Password::min(8)

// 영문자 1자 이상 포함...
Password::min(8)->letters()

// 대소문자 각각 1자 이상 포함...
Password::min(8)->mixedCase()

// 숫자 1자 이상 포함...
Password::min(8)->numbers()

// 특수기호 1자 이상 포함...
Password::min(8)->symbols()
```

또한, `uncompromised` 메서드를 활용해 입력한 비밀번호가 이미 유출(데이터 유출 목록에 공개)된 적이 있는지 확인할 수도 있습니다.

```php
Password::min(8)->uncompromised()
```

내부적으로 `Password` 규칙 객체는 [k-Anonymity](https://en.wikipedia.org/wiki/K-anonymity) 모델과 [haveibeenpwned.com](https://haveibeenpwned.com) 서비스를 사용해 사용자의 개인정보와 보안을 침해하지 않는 방식으로 비밀번호 유출 여부를 검사합니다.

기본적으로, 한번이라도 유출 기록이 있으면 "compromised(유출됨)" 상태로 간주됩니다. 이 임계값은 `uncompromised` 메서드의 첫 번째 인자로 커스터마이즈할 수 있습니다.

```php
// 데이터 유출에서 3회 미만 나타나면 허용...
Password::min(8)->uncompromised(3);
```

물론, 위 예시들의 메서드들을 모두 체이닝해서 사용할 수 있습니다.

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

비밀번호에 대한 기본 유효성 검사 규칙을 애플리케이션의 한 곳에서 지정하면 관리가 더욱 편리해집니다. 이를 위해서는 `Password::defaults` 메서드를 활용할 수 있습니다. 클로저를 넘기면 해당 클로저가 반환하는 Password 규칙이 전체 애플리케이션에서 기본값으로 사용됩니다. 일반적으로 이 코드는 Service Provider의 `boot` 메서드에서 호출하는 것이 좋습니다.

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

이렇게 하면, 실제로 검증 시 `defaults` 메서드를 인수 없이 호출해 기본 비밀번호 규칙들을 적용할 수 있습니다.

```php
'password' => ['required', Password::defaults()],
```

가끔은, 기본 비밀번호 규칙에 추가적인 규칙을 덧붙이고 싶을 때도 있습니다. `rules` 메서드를 이용해 이 작업을 할 수 있습니다.

```php
use App\Rules\ZxcvbnRule;

Password::defaults(function () {
    $rule = Password::min(8)->rules([new ZxcvbnRule]);

    // ...
});
```

<a name="custom-validation-rules"></a>
## 사용자 정의 유효성 검사 규칙

<a name="using-rule-objects"></a>
### 규칙 객체 사용하기

라라벨에서는 다양한 유용한 유효성 검사 규칙들이 준비되어 있습니다. 하지만 때로는 직접 나만의 규칙을 정의해야 할 때도 있습니다. 규칙 객체를 사용해 커스텀 유효성 검증 규칙을 등록하는 방법이 있습니다. 새 규칙 객체를 만들려면 `make:rule` 아티즌 명령어를 사용하세요. 이 예제에서는 문자열이 모두 대문자인지 검증하는 규칙을 만들어보겠습니다. 라라벨은 새 규칙을 `app/Rules` 디렉터리에 생성해줍니다. 해당 디렉터리가 없다면, 규칙 생성 시 자동으로 만들어집니다.

```shell
php artisan make:rule Uppercase
```

규칙 객체를 만들었으면, 이제 동작을 구현해보겠습니다. 규칙 객체는 단 하나의 `validate` 메서드를 갖습니다. 이 메서드는 속성 이름, 실제 값, 검증 실패 시 호출할 콜백(에러 메시지를 전달)을 인자로 받습니다.

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

이제, 규칙 객체를 인스턴스로 만들어 다른 유효성 검사 규칙들과 함께 validator에 넘기면 사용할 수 있습니다.

```php
use App\Rules\Uppercase;

$request->validate([
    'name' => ['required', 'string', new Uppercase],
]);
```

#### 유효성 검사 메시지의 다국어화

`$fail` 클로저에 직접 에러 메시지를 입력하는 대신, [번역 문자열 키](/docs/12.x/localization)를 넘겨 라라벨이 해당 에러 메시지를 번역하게 할 수도 있습니다.

```php
if (strtoupper($value) !== $value) {
    $fail('validation.uppercase')->translate();
}
```

필요하다면, `translate` 메서드의 첫 번째 인수로 플레이스홀더 치환값 배열을, 두 번째 인수로 언어 코드를 전달할 수 있습니다.

```php
$fail('validation.location')->translate([
    'value' => $this->value,
], 'fr');
```

#### 추가 데이터 접근

사용자 정의 유효성 검사 클래스에서 전체 유효성 검사 데이터에 접근해야 한다면, 해당 클래스가 `Illuminate\Contracts\Validation\DataAwareRule` 인터페이스를 구현하도록 하면 됩니다. 이 인터페이스는 반드시 `setData` 메서드를 구현해야 합니다. 이 메서드는 라라벨에 의해 자동으로, (유효성 검사 전에) 전체 데이터 배열을 넘겨 호출됩니다.

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

또는, 유효성 검사를 수행하는 validator 인스턴스에 접근해야 하는 경우, `ValidatorAwareRule` 인터페이스를 구현할 수 있습니다.

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

어떤 규칙이 애플리케이션 내에서 한 번만 사용된다면, 규칙 객체 대신 클로저를 사용할 수도 있습니다. 클로저는 속성 이름, 속성 값, 그리고 유효성 검사 실패 시 호출할 `$fail` 콜백을 받습니다.

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

기본적으로, 유효성 검사를 수행할 때 해당 속성이 없거나 빈 문자열일 경우, 라라벨은 일반 규칙뿐만 아니라 사용자 정의 규칙도 실행하지 않습니다. 예를 들어 [unique](#rule-unique) 규칙도 빈 문자열에 대해서는 검사하지 않습니다.

```php
use Illuminate\Support\Facades\Validator;

$rules = ['name' => 'unique:users,name'];

$input = ['name' => ''];

Validator::make($input, $rules)->passes(); // true
```

사용자 정의 규칙이 비어 있는 값에 대해서도 반드시 실행되어야 한다면, 해당 규칙이 "필수" 임을 암시해야 합니다. 암묵적(implicit) 규칙 객체를 빠르게 생성하려면, `make:rule` 아티즌 명령어에서 `--implicit` 옵션을 사용하세요.

```shell
php artisan make:rule Uppercase --implicit
```

> [!WARNING]
> "암묵적(implicit)" 규칙은 해당 속성이 필수임을 내포(암시)하지만, 실제로 속성이 없거나 비어있을 때 검증 실패로 만들지는 않습니다. 이 동작 여부는 규칙 구현에 달려 있습니다.