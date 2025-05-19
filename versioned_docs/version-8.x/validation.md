# 유효성 검증 (Validation)

- [소개](#introduction)
- [유효성 검증 빠르게 시작하기](#validation-quickstart)
    - [라우트 정의하기](#quick-defining-the-routes)
    - [컨트롤러 생성하기](#quick-creating-the-controller)
    - [유효성 검증 로직 작성하기](#quick-writing-the-validation-logic)
    - [유효성 검증 오류 표시하기](#quick-displaying-the-validation-errors)
    - [폼 값 다시 채우기](#repopulating-forms)
    - [선택 입력 필드에 관하여](#a-note-on-optional-fields)
- [폼 리퀘스트 유효성 검증](#form-request-validation)
    - [폼 리퀘스트 생성하기](#creating-form-requests)
    - [폼 리퀘스트 인가](#authorizing-form-requests)
    - [오류 메시지 커스터마이징](#customizing-the-error-messages)
    - [유효성 검증을 위한 입력값 준비하기](#preparing-input-for-validation)
- [수동으로 Validator 생성하기](#manually-creating-validators)
    - [자동 리다이렉트](#automatic-redirection)
    - [네임드 에러 백](#named-error-bags)
    - [오류 메시지 커스터마이징](#manual-customizing-the-error-messages)
    - [유효성 검증 후 후킹](#after-validation-hook)
- [검증된 입력값 다루기](#working-with-validated-input)
- [오류 메시지 다루기](#working-with-error-messages)
    - [언어 파일에서 커스텀 메시지 지정하기](#specifying-custom-messages-in-language-files)
    - [언어 파일에서 속성 지정하기](#specifying-attribute-in-language-files)
    - [언어 파일에서 값 지정하기](#specifying-values-in-language-files)
- [사용 가능한 유효성 검증 규칙](#available-validation-rules)
- [조건부로 규칙 추가하기](#conditionally-adding-rules)
- [배열 유효성 검증하기](#validating-arrays)
    - [검증되지 않은 배열 키 제외하기](#excluding-unvalidated-array-keys)
    - [중첩 배열 입력값 검증하기](#validating-nested-array-input)
- [비밀번호 유효성 검증하기](#validating-passwords)
- [커스텀 유효성 검증 규칙](#custom-validation-rules)
    - [Rule 객체 사용하기](#using-rule-objects)
    - [클로저 사용하기](#using-closures)
    - [암묵적 규칙](#implicit-rules)

<a name="introduction"></a>
## 소개

라라벨은 애플리케이션의 입력 데이터를 유효성 검증하는 여러 가지 다양한 방법을 제공합니다. 가장 일반적으로는 모든 들어오는 HTTP 요청에서 사용할 수 있는 `validate` 메서드를 활용합니다. 하지만 이외에도 여러 가지 다른 유효성 검증 방식에 대해서도 이 문서에서 다룹니다.

라라벨에는 다양한 간편한 유효성 검증 규칙이 내장되어 있으며, 데이터가 데이터베이스의 특정 테이블 내에서 유일한지까지 손쉽게 검증할 수 있습니다. 본 문서에서는 각 유효성 검증 규칙에 대해 꼼꼼하게 설명하여, 라라벨의 유효성 검증 기능을 완벽하게 익힐 수 있도록 안내합니다.

<a name="validation-quickstart"></a>
## 유효성 검증 빠르게 시작하기

라라벨의 강력한 유효성 검증 기능을 이해하기 위해, 폼을 검증하고 오류 메시지를 사용자에게 보여주는 전체 흐름을 단계별로 살펴보겠습니다. 이 내용을 먼저 읽어보면 라라벨에서 들어오는 요청 데이터를 어떻게 유효성 검증하는지 전반적인 큰 흐름을 쉽게 파악할 수 있습니다.

<a name="quick-defining-the-routes"></a>
### 라우트 정의하기

먼저, `routes/web.php` 파일에 다음과 같이 라우트가 정의되어 있다고 가정해 봅시다.

```
use App\Http\Controllers\PostController;

Route::get('/post/create', [PostController::class, 'create']);
Route::post('/post', [PostController::class, 'store']);
```

위 예시에서 `GET` 라우트는 사용자가 새로운 블로그 게시글을 작성할 수 있는 폼을 보여주고, `POST` 라우트는 사용자가 작성한 새 블로그 게시글을 데이터베이스에 저장합니다.

<a name="quick-creating-the-controller"></a>
### 컨트롤러 생성하기

다음으로, 위 라우트에서 들어온 요청을 처리하는 간단한 컨트롤러를 만들어 봅시다. 여기서 `store` 메서드는 아직 비워둡니다.

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PostController extends Controller
{
    /**
     * 새로운 블로그 게시글을 작성하는 폼을 보여줍니다.
     *
     * @return \Illuminate\View\View
     */
    public function create()
    {
        return view('post.create');
    }

    /**
     * 새 블로그 게시글을 저장합니다.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        // 블로그 포스트를 검증하고 저장...
    }
}
```

<a name="quick-writing-the-validation-logic"></a>
### 유효성 검증 로직 작성하기

이제 `store` 메서드에 새 블로그 게시글을 검증하는 로직을 작성해봅시다. 이를 위해서는 `Illuminate\Http\Request` 객체에서 제공하는 `validate` 메서드를 사용하면 됩니다. 만약 유효성 검증 규칙을 모두 통과하면, 코드가 정상적으로 계속 실행됩니다. 하지만 검증 실패 시에는 `Illuminate\Validation\ValidationException` 예외가 발생하며, 자동으로 올바른 오류 응답이 사용자에게 반환됩니다.

만약 전통적인 HTTP 요청 방식이라면, 검증 실패 시 이전 URL로 리다이렉트 응답이 생성됩니다. 요청이 XHR 방식이라면, 유효성 검증 오류 메시지를 담은 JSON 응답이 반환됩니다.

`validate` 메서드가 실제로 어떻게 동작하는지 직접 살펴봅시다.

```
/**
 * 새 블로그 게시글을 저장합니다.
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

    // 블로그 게시글이 유효함...
}
```

위에서 볼 수 있듯, 유효성 검증 규칙은 `validate` 메서드에 배열로 전달됩니다. 걱정하지 마세요 - 모든 사용 가능한 유효성 검증 규칙은 [문서로 정리되어 있습니다](#available-validation-rules). 다시 한번, 검증에 실패하면 적절한 응답이 자동으로 생성됩니다. 만약 검증에 성공한다면, 컨트롤러는 정상적으로 실행을 계속합니다.

또한, 규칙을 단일 `'|'` 구분 문자열 대신 배열 형태로 지정할 수도 있습니다.

```
$validatedData = $request->validate([
    'title' => ['required', 'unique:posts', 'max:255'],
    'body' => ['required'],
]);
```

또한, [네임드 에러 백](#named-error-bags)을 사용하고 싶다면 `validateWithBag` 메서드를 이용해 각 요청에 대한 검증 오류 메시지를 저장할 수 있습니다.

```
$validatedData = $request->validateWithBag('post', [
    'title' => ['required', 'unique:posts', 'max:255'],
    'body' => ['required'],
]);
```

<a name="stopping-on-first-validation-failure"></a>
#### 첫 번째 검증 실패 시 중단하기

특정 속성(attribute)에서 한 번이라도 검증에 실패하면, 이후 해당 속성에 대해 더 이상 검증하지 않고 멈추길 원할 수 있습니다. 이럴 때는 해당 속성에 `bail` 규칙을 추가해 주세요.

```
$request->validate([
    'title' => 'bail|required|unique:posts|max:255',
    'body' => 'required',
]);
```

이 예시에서 `title` 속성에 대해 `unique` 규칙이 실패하면, `max` 규칙은 더 이상 확인하지 않습니다. 규칙들은 작성한 순서대로 차례로 검증됩니다.

<a name="a-note-on-nested-attributes"></a>
#### 중첩된 속성에 대한 팁

만약 들어오는 HTTP 요청에 '중첩된' 필드 데이터가 있다면, 검증 규칙에서 '닷(dot) 표기법'을 사용해 이런 필드를 지정할 수 있습니다.

```
$request->validate([
    'title' => 'required|unique:posts|max:255',
    'author.name' => 'required',
    'author.description' => 'required',
]);
```

반면에, 필드 이름 자체에 온점(닷)이 포함된 경우에는, 역슬래시(`\`)로 닷을 이스케이프하면 "닷 표기법"이 아닌 문자 그대로의 온점으로 인식됩니다.

```
$request->validate([
    'title' => 'required|unique:posts|max:255',
    'v1\.0' => 'required',
]);
```

<a name="quick-displaying-the-validation-errors"></a>
### 유효성 검증 오류 표시하기

그렇다면, 들어온 요청 필드가 지정한 검증 규칙을 통과하지 못하면 어떻게 될까요? 앞에서 언급한 것처럼, 라라벨은 자동으로 사용자를 이전 위치로 리다이렉트합니다. 그리고 모든 유효성 검증 오류와 [요청 입력값](/docs/8.x/requests#retrieving-old-input)이 자동으로 [세션에 flash 처리](/docs/8.x/session#flash-data)됩니다.

`Illuminate\View\Middleware\ShareErrorsFromSession` 미들웨어가 `$errors` 변수를 모든 뷰에 자동으로 공유해줍니다. 이 미들웨어는 기본적으로 `web` 미들웨어 그룹에 포함되어 있으므로, 별다른 설정 없이도 모든 뷰에서 `$errors` 변수를 언제든지 사용할 수 있습니다. `$errors` 변수는 `Illuminate\Support\MessageBag`의 인스턴스입니다. 이 객체를 다루는 방법은 [관련 문서](#working-with-error-messages)에서 자세히 설명합니다.

따라서, 이 예시에서는 검증 실패 시 컨트롤러의 `create` 메서드로 다시 리다이렉트되며, 뷰에서 오류 메시지를 아래와 같이 표시할 수 있습니다:

```html
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

라라벨 내장 유효성 검증 규칙마다 오류 메시지가 함께 제공되며, 이 메시지는 애플리케이션의 `resources/lang/en/validation.php` 파일에 위치합니다. 해당 파일에서 각 유효성 검증 규칙에 대한 번역 항목을 확인할 수 있습니다. 애플리케이션의 필요에 따라, 메시지를 자유롭게 수정하거나 변경할 수 있습니다.

또한, 이 파일을 다른 언어 디렉터리로 복사해 메시지를 번역할 수도 있습니다. 라라벨의 로컬라이제이션에 대해 더 자세히 알고 싶다면 [로컬라이제이션 문서](/docs/8.x/localization)를 참고해 주세요.

<a name="quick-xhr-requests-and-validation"></a>
#### XHR 요청과 유효성 검증

이 예시에서는 전통적인 폼을 통해 데이터를 애플리케이션으로 전송했습니다. 하지만, 많은 현대 애플리케이션에서는 자바스크립트 기반 프론트엔드에서 XHR 요청을 보냅니다. 이런 경우, `validate` 메서드를 사용할 때 라라벨은 리다이렉트 대신 모든 유효성 검증 오류를 포함한 JSON 응답을 반환합니다. 이 응답은 HTTP 상태 코드 422와 함께 전송됩니다.

<a name="the-at-error-directive"></a>
#### `@error` 디렉티브

주어진 속성에 대해 유효성 검증 오류 메시지가 존재하는지 빠르게 확인하려면 [Blade](/docs/8.x/blade)에서 `@error` 디렉티브를 사용할 수 있습니다. `@error` 블록 내부에서는 `$message` 변수를 출력해 오류 메시지를 표시할 수 있습니다.

```html
<!-- /resources/views/post/create.blade.php -->

<label for="title">Post Title</label>

<input id="title" type="text" name="title" class="@error('title') is-invalid @enderror">

@error('title')
    <div class="alert alert-danger">{{ $message }}</div>
@enderror
```

[네임드 에러 백](#named-error-bags)을 사용하는 경우, 두 번째 인자로 에러 백의 이름을 `@error` 디렉티브에 전달할 수 있습니다:

```html
<input ... class="@error('title', 'post') is-invalid @enderror">
```

<a name="repopulating-forms"></a>
### 폼 값 다시 채우기

라라벨이 유효성 검증 오류로 인해 리다이렉트를 생성할 때, 프레임워크는 자동으로 [요청의 모든 입력값을 세션에 flash 처리](/docs/8.x/session#flash-data)합니다. 덕분에, 사용자는 바로 다음 요청에서 이전에 입력한 데이터에 접근할 수 있어, 제출 직전의 폼을 그대로 다시 보여주거나 일부 값을 자동으로 채우는 데 매우 편리합니다.

이전 요청에서 플래시된 입력값을 가져오려면, `Illuminate\Http\Request` 인스턴스에서 `old` 메서드를 호출하면 됩니다. `old` 메서드는 세션에 보관된 플래시 입력값을 꺼내줍니다:

```
$title = $request->old('title');
```

라라벨은 전역 헬퍼 함수인 `old`도 제공합니다. 뷰(특히 [Blade 템플릿](/docs/8.x/blade))에서 이전 입력값을 표시할 때, 이 헬퍼를 사용하면 훨씬 편리하게 폼 값을 다시 채울 수 있습니다. 해당 필드에 이전 입력값이 없다면, `null`이 반환됩니다.

```
<input type="text" name="title" value="{{ old('title') }}">
```

<a name="a-note-on-optional-fields"></a>
### 선택 입력 필드에 관하여

기본적으로, 라라벨은 전역 미들웨어 스택에 `TrimStrings`와 `ConvertEmptyStringsToNull` 미들웨어를 포함합니다. 이들은 `App\Http\Kernel` 클래스에서 정의되어 있습니다. 그래서, 선택(필수 아님) 필드에 대해 값이 `null`일 때도 검증에서 오류가 나길 원하지 않는다면 해당 필드를 반드시 `nullable`로 지정해야 합니다. 예를 들면 다음과 같습니다.

```
$request->validate([
    'title' => 'required|unique:posts|max:255',
    'body' => 'required',
    'publish_at' => 'nullable|date',
]);
```

위 예시에서, `publish_at` 필드는 `null`이거나 올바른 날짜 형식이어야 합니다. 만약 `nullable`을 추가하지 않으면, 검증기는 `null`을 잘못된 날짜로 간주해 검증에 실패할 수 있습니다.

<a name="form-request-validation"></a>
## 폼 리퀘스트 유효성 검증

<a name="creating-form-requests"></a>
### 폼 리퀘스트 생성하기

더 복잡한 유효성 검증이 필요한 경우, "폼 리퀘스트(form request)"라는 방식을 사용할 수 있습니다. 폼 리퀘스트는 자체적으로 유효성 검증 및 인가(authorization) 로직을 캡슐화한 커스텀 요청 클래스입니다. 폼 리퀘스트 클래스를 만들려면 `make:request` 아티즌 CLI 명령어를 사용하세요.

```
php artisan make:request StorePostRequest
```

생성된 폼 리퀘스트 클래스는 `app/Http/Requests` 디렉터리에 위치합니다. 이 디렉터리가 없으면, 해당 명령어 실행 시 자동으로 생성됩니다. 라라벨에서 만들어진 각 폼 리퀘스트는 `authorize`와 `rules`라는 두 가지 메서드를 포함합니다.

예상하신 대로, `authorize` 메서드는 현재 인증된 사용자가 해당 요청에서 나타내는 동작을 할 수 있는지 판단하는 역할을 하며, `rules` 메서드는 요청 데이터에 적용해야 할 유효성 검증 규칙을 반환합니다:

```
/**
 * 요청에 적용할 유효성 검증 규칙을 반환합니다.
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

> [!TIP]
> `rules` 메서드의 시그니처에 필요한 의존성을 타입힌트 할 수 있습니다. 이를 통해 의존성이 라라벨 [서비스 컨테이너](/docs/8.x/container)에서 자동으로 주입됩니다.

그럼 이러한 규칙들은 어떻게 평가될까요? 컨트롤러 메서드에서 해당 요청 클래스를 타입힌트(명시적 매개변수로 선언)해주면 됩니다. 폼 리퀘스트가 들어오면, 컨트롤러 메서드가 호출되기 전에 자동으로 유효성 검증이 이뤄지기 때문에 컨트롤러가 지저분해질 걱정 없이 검증을 적용할 수 있습니다.

```
/**
 * 새 블로그 게시글을 저장합니다.
 *
 * @param  \App\Http\Requests\StorePostRequest  $request
 * @return Illuminate\Http\Response
 */
public function store(StorePostRequest $request)
{
    // 들어온 요청이 유효합니다...

    // 유효성 검증된 입력값 전체 가져오기...
    $validated = $request->validated();

    // 유효성 검증된 입력값 중 일부만 가져오기...
    $validated = $request->safe()->only(['name', 'email']);
    $validated = $request->safe()->except(['name', 'email']);
}
```

만약 유효성 검증에 실패하면, 자동으로 이전 페이지로 리다이렉트되는 응답이 생성됩니다. 오류 메시지는 세션에 flash 처리되어 뷰에서 쉽게 표시할 수 있습니다. 만약 요청이 XHR 방식이라면, 422 상태 코드를 포함한 JSON 형태로 오류 정보가 반환됩니다.

<a name="adding-after-hooks-to-form-requests"></a>
#### 폼 리퀘스트에 After 훅 추가하기

폼 리퀘스트에서 "after" 유효성 검증 훅을 추가하고 싶다면 `withValidator` 메서드를 사용할 수 있습니다. 이 메서드는 완전히 구성된 validator 객체를 전달받으므로, 실제 규칙이 평가되기 전에 validator의 다양한 메서드를 호출해 추가 로직을 넣을 수 있습니다.

```
/**
 * validator 인스턴스를 구성합니다.
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
#### 첫 번째 유효성 검증 실패 시 전체 속성 검증 중단하기

폼 리퀘스트 클래스에 `stopOnFirstFailure` 프로퍼티를 추가함으로써, 하나의 유효성 검증 실패가 발생하면 모든 속성(attribute)에 대한 추가 검증을 멈추도록 validator에 알릴 수 있습니다.

```
/**
 * validator가 첫 번째 규칙 실패 시 중단해야 하는지 여부를 나타냅니다.
 *
 * @var bool
 */
protected $stopOnFirstFailure = true;
```

<a name="customizing-the-redirect-location"></a>
#### 리다이렉트 위치 커스터마이징

앞서 설명한 대로, 폼 리퀘스트 검증에 실패하면 사용자를 이전 위치로 리다이렉트하게 됩니다. 하지만 이 동작은 필요에 따라 자유롭게 커스터마이즈할 수 있습니다. 이를 위해서 폼 리퀘스트에 `$redirect` 프로퍼티를 정의하면 됩니다.

```
/**
 * 유효성 검증에 실패할 경우 사용자가 리다이렉트될 URI입니다.
 *
 * @var string
 */
protected $redirect = '/dashboard';
```

또는, 네임드 라우트로 리다이렉트하고 싶다면 `$redirectRoute` 프로퍼티를 대신 정의할 수 있습니다.

```
/**
 * 유효성 검증 실패 시 사용자가 이동할 라우트 이름입니다.
 *
 * @var string
 */
protected $redirectRoute = 'dashboard';
```

<a name="authorizing-form-requests"></a>
### 폼 리퀘스트 인가

폼 리퀘스트 클래스에는 `authorize` 메서드도 함께 존재합니다. 이 메서드에서는 현재 인증된 사용자가 해당 리소스를 실제로 수정 등 업데이트할 권한이 있는지 판단할 수 있습니다. 예를 들면 사용자가 자신이 소유한 블로그 댓글만 수정할 수 있도록 인가 체크 코드를 추가할 수 있습니다. 보통은 이 안에서 [인가 게이트 및 정책](/docs/8.x/authorization)을 활용합니다.

```
use App\Models\Comment;

/**
 * 사용자가 이 요청을 보낼 권한이 있는지 확인합니다.
 *
 * @return bool
 */
public function authorize()
{
    $comment = Comment::find($this->route('comment'));

    return $comment && $this->user()->can('update', $comment);
}
```

모든 폼 리퀘스트는 기본 라라벨 요청 클래스를 확장하므로, `user` 메서드를 사용해 현재 인증된 사용자에 접근할 수 있습니다. 위 예시에서 `route` 메서드를 사용한 부분에 주목해 주세요. 이 메서드는 현재 호출 중인 라우트에서 정의된 URI 파라미터(`{comment}` 등)에 접근하는 데 유용합니다.

```
Route::post('/comment/{comment}');
```

따라서, [라우트 모델 바인딩](/docs/8.x/routing#route-model-binding)을 사용하고 있다면, 요청의 속성으로 바로 바인딩된 모델을 더 간결하게 사용할 수 있습니다.

```
return $this->user()->can('update', $this->comment);
```

`authorize` 메서드가 `false`를 반환하면, 자동으로 403 상태 코드의 HTTP 응답이 반환되며, 컨트롤러 메서드는 아예 실행되지 않습니다.

요청에 대한 인가 로직을 애플리케이션의 다른 곳에서 처리할 예정이라면, `authorize` 메서드에서 간단히 `true`만 반환해도 괜찮습니다.

```
/**
 * 사용자가 이 요청을 보낼 권한이 있는지 확인합니다.
 *
 * @return bool
 */
public function authorize()
{
    return true;
}
```

> [!TIP]
> `authorize` 메서드 시그니처에 필요한 의존성을 타입힌트로 선언할 수 있습니다. 이 경우 의존성은 라라벨 [서비스 컨테이너](/docs/8.x/container)에서 자동으로 주입됩니다.

<a name="customizing-the-error-messages"></a>
### 오류 메시지 커스터마이징

폼 리퀘스트에서 사용하는 오류 메시지는 `messages` 메서드를 오버라이드하여 자유롭게 변경할 수 있습니다. 이 메서드는 `attribute / rule` 쌍과 각각의 오류 메시지가 담긴 배열을 반환하면 됩니다.

```
/**
 * 정의된 유효성 검증 규칙에 대한 오류 메시지를 반환합니다.
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
#### 유효성 검증 속성명 커스터마이징

라라벨 내장 유효성 검증 오류 메시지 중에는 `:attribute` 플레이스홀더를 포함하는 경우가 많습니다. 이 플레이스홀더를 원하는 속성명으로 바꾸고 싶다면, `attributes` 메서드를 오버라이드해 직접 지정할 수 있습니다. 이 메서드는 `attribute / name` 쌍의 배열을 반환해야 합니다.

```
/**
 * validator 오류에 대한 커스텀 속성명을 반환합니다.
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
### 유효성 검증을 위한 입력값 준비하기

검증 규칙을 적용하기 전에 요청 데이터 일부를 사전 처리(가공/정제)해야 한다면, `prepareForValidation` 메서드를 활용할 수 있습니다.

```
use Illuminate\Support\Str;

/**
 * 유효성 검증을 위한 데이터 전처리를 수행합니다.
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

<a name="manually-creating-validators"></a>
## 수동으로 Validator 생성하기

요청 객체의 `validate` 메서드를 사용하고 싶지 않다면, `Validator` [파사드](/docs/8.x/facades)를 사용해 validator 인스턴스를 직접 생성할 수도 있습니다. 파사드의 `make` 메서드는 새로운 validator 인스턴스를 만듭니다.

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PostController extends Controller
{
    /**
     * 새 블로그 게시글을 저장합니다.
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

        // 유효성 검증에 통과한 입력값을 가져옵니다...
        $validated = $validator->validated();

        // 유효성 검증에 통과한 입력값 중 일부만 가져오기...
        $validated = $validator->safe()->only(['name', 'email']);
        $validated = $validator->safe()->except(['name', 'email']);

        // 블로그 게시글 저장...
    }
}
```

`make` 메서드의 첫 번째 인자는 검증할 데이터이고, 두 번째 인자는 데이터에 적용할 유효성 검증 규칙 배열입니다.

요청 데이터 검증 결과 실패했는지 확인한 뒤, `withErrors` 메서드를 사용해 오류 메시지를 세션에 flash할 수 있습니다. 이 메서드를 사용하면, 뷰에서 `$errors` 변수가 자동으로 공유되므로, 사용자에게 오류 메시지를 간편하게 다시 보여줄 수 있습니다. `withErrors` 메서드는 validator, `MessageBag`, 또는 PHP 배열을 인자로 받을 수 있습니다.

#### 첫 번째 유효성 검증 실패 시 중단

`stopOnFirstFailure` 메서드는 하나의 속성에서 유효성 검증이 실패하면, 모든 속성에 대한 추가 검증을 중단하도록 검증기(validator)에게 알립니다.

```
if ($validator->stopOnFirstFailure()->fails()) {
    // ...
}
```

<a name="automatic-redirection"></a>
### 자동 리디렉션

직접 검증기 인스턴스를 생성하면서도, HTTP 요청의 `validate` 메서드가 제공하는 자동 리디렉션 기능을 활용하고 싶다면, 이미 생성한 검증기 인스턴스에서 `validate` 메서드를 호출하면 됩니다. 유효성 검증이 실패할 경우 사용자는 자동으로 리디렉션되거나, XHR 요청의 경우 JSON 응답이 반환됩니다.

```
Validator::make($request->all(), [
    'title' => 'required|unique:posts|max:255',
    'body' => 'required',
])->validate();
```

유효성 검증 실패 시 [이름이 지정된 에러 백](#named-error-bags)에 에러 메시지를 저장하고 싶다면 `validateWithBag` 메서드를 사용할 수 있습니다.

```
Validator::make($request->all(), [
    'title' => 'required|unique:posts|max:255',
    'body' => 'required',
])->validateWithBag('post');
```

<a name="named-error-bags"></a>
### 이름이 지정된 에러 백

한 페이지에 여러 개의 폼이 있다면, 해당 폼의 유효성 검증 에러를 담는 `MessageBag`에 이름을 붙이고 싶을 때가 있습니다. 이렇게 하면 특정 폼에 해당하는 에러 메시지를 쉽게 가져올 수 있습니다. 이를 위해 `withErrors`의 두 번째 인자로 이름을 전달하면 됩니다.

```
return redirect('register')->withErrors($validator, 'login');
```

그런 다음, `$errors` 변수에서 이름이 지정된 `MessageBag` 인스턴스에 접근할 수 있습니다.

```
{{ $errors->login->first('email') }}
```

<a name="manual-customizing-the-error-messages"></a>
### 에러 메시지 커스터마이징

필요하다면, 검증기 인스턴스가 라라벨이 제공하는 기본 에러 메시지 대신 사용할 커스텀 에러 메시지를 지정할 수 있습니다. 커스텀 메시지는 여러 가지 방식으로 지정할 수 있습니다. 첫 번째로, `Validator::make` 메서드의 세 번째 인자로 커스텀 메시지 배열을 전달할 수 있습니다.

```
$validator = Validator::make($input, $rules, $messages = [
    'required' => 'The :attribute field is required.',
]);
```

이 예시에서 `:attribute` 플레이스홀더는 실제 검증 중인 필드명으로 치환됩니다. 유효성 검증 메시지에서는 다른 플레이스홀더도 사용할 수 있습니다. 예를 들면 다음과 같습니다.

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

특정 속성에만 커스텀 에러 메시지를 지정하고 싶을 때가 있습니다. 이럴 때는 "점(.) 표기법(dot notation)"을 사용합니다. 속성명 다음에 규칙명을 이어서 지정합니다.

```
$messages = [
    'email.required' => 'We need to know your email address!',
];
```

<a name="specifying-custom-attribute-values"></a>
#### 속성명 커스텀 값 지정

라라벨의 기본 에러 메시지 중 다수는 `:attribute` 플레이스홀더를 포함하며, 이는 검증 대상 필드 또는 속성명으로 치환됩니다. 특정 필드에 대해 이 플레이스홀더를 치환할 값을 커스터마이징하고 싶다면, `Validator::make`의 네 번째 인자로 커스텀 속성 배열을 전달하면 됩니다.

```
$validator = Validator::make($input, $rules, $messages, [
    'email' => 'email address',
]);
```

<a name="after-validation-hook"></a>
### 검증 후 후킹(After Validation Hook)

유효성 검증이 끝난 후 실행할 콜백을 추가할 수도 있습니다. 이를 통해 추가적인 검증이나 에러 메시지 추가 등 후처리를 쉽게 수행할 수 있습니다. 먼저, 검증기 인스턴스에서 `after` 메서드를 호출하세요.

```
$validator = Validator::make(...);

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
## 유효성 검증된 입력 값 다루기

폼 요청을 사용하거나 직접 검증기 인스턴스를 생성해 유효성 검증을 거친 후, 실제로 검증된 요청 데이터만 가져오고 싶을 수 있습니다. 이는 여러 가지 방법으로 할 수 있습니다. 가장 먼저, 폼 요청 혹은 검증기 인스턴스에서 `validated` 메서드를 호출할 수 있습니다. 이 메서드는 검증을 통과한 데이터만 담긴 배열을 반환합니다.

```
$validated = $request->validated();

$validated = $validator->validated();
```

또는, 폼 요청이나 검증기 인스턴스에서 `safe` 메서드를 호출할 수도 있습니다. 이 메서드는 `Illuminate\Support\ValidatedInput` 인스턴스를 반환합니다. 이 객체에서는 `only`, `except`, `all` 메서드를 통해 검증된 데이터 중 원하는 부분만, 또는 전체를 쉽게 가져올 수 있습니다.

```
$validated = $request->safe()->only(['name', 'email']);

$validated = $request->safe()->except(['name', 'email']);

$validated = $request->safe()->all();
```

그 외에도, `Illuminate\Support\ValidatedInput` 인스턴스는 배열처럼 순회하거나 접근할 수 있습니다.

```
// 검증된 데이터를 순회할 수도 있습니다.
foreach ($request->safe() as $key => $value) {
    //
}

// 검증된 데이터를 배열처럼 접근할 수도 있습니다.
$validated = $request->safe();

$email = $validated['email'];
```

검증된 데이터에 추가 필드를 더하고 싶다면 `merge` 메서드를 사용할 수 있습니다.

```
$validated = $request->safe()->merge(['name' => 'Taylor Otwell']);
```

검증된 데이터를 [컬렉션](/docs/8.x/collections) 인스턴스로 받고 싶다면 `collect` 메서드를 호출하세요.

```
$collection = $request->safe()->collect();
```

<a name="working-with-error-messages"></a>
## 에러 메시지 다루기

`Validator` 인스턴스에서 `errors` 메서드를 호출하면, 다양한 편리한 메서드로 에러 메시지를 다룰 수 있는 `Illuminate\Support\MessageBag` 인스턴스를 얻게 됩니다. 모든 뷰에서 자동으로 사용할 수 있는 `$errors` 변수 역시 `MessageBag` 클래스의 인스턴스입니다.

<a name="retrieving-the-first-error-message-for-a-field"></a>
#### 특정 필드의 첫 번째 에러 메시지 가져오기

특정 필드에 대해 첫 번째 에러 메시지만 가져오려면 `first` 메서드를 사용하세요.

```
$errors = $validator->errors();

echo $errors->first('email');
```

<a name="retrieving-all-error-messages-for-a-field"></a>
#### 특정 필드의 모든 에러 메시지 가져오기

특정 필드에 대한 모든 에러 메시지 배열을 가져오려면 `get` 메서드를 사용하세요.

```
foreach ($errors->get('email') as $message) {
    //
}
```

배열 형태의 폼 필드를 검증하였다면, `*` 문자를 사용해 각 배열 요소의 모든 메시지를 한 번에 가져올 수 있습니다.

```
foreach ($errors->get('attachments.*') as $message) {
    //
}
```

<a name="retrieving-all-error-messages-for-all-fields"></a>
#### 모든 필드의 모든 에러 메시지 가져오기

모든 필드에 대한 모든 메시지 배열을 가져오려면 `all` 메서드를 사용하세요.

```
foreach ($errors->all() as $message) {
    //
}
```

<a name="determining-if-messages-exist-for-a-field"></a>
#### 특정 필드에 에러 메시지가 있는지 여부 확인

특정 필드에 아무 에러 메시지가 존재하는지 확인하려면 `has` 메서드를 사용합니다.

```
if ($errors->has('email')) {
    //
}
```

<a name="specifying-custom-messages-in-language-files"></a>
### 언어 파일에서 커스텀 메시지 지정

라라벨의 기본 내장 유효성 검증 규칙 각각은 애플리케이션의 `resources/lang/en/validation.php` 파일에 에러 메시지가 정의되어 있습니다. 이 파일 안에는 각 유효성 검증 규칙에 대한 번역 항목이 있습니다. 필요에 따라 이 메시지들을 자유롭게 변경하거나 수정할 수 있습니다.

또한, 이 파일을 다른 언어 디렉터리로 복사해 애플리케이션 언어에 맞게 메세지를 번역할 수도 있습니다. 라라벨의 지역화(Localization)에 대해 더 자세히 알아보고 싶다면 [로컬라이제이션 문서](/docs/8.x/localization)를 참고하세요.

<a name="custom-messages-for-specific-attributes"></a>
#### 특정 속성에 대한 커스텀 메시지

애플리케이션의 유효성 검증 언어 파일에서, 특정 속성과 규칙의 조합에 대해 사용하는 에러 메시지를 커스터마이즈할 수 있습니다. 이를 위해 `resources/lang/xx/validation.php` 언어 파일의 `custom` 배열에 메시지를 추가합니다.

```
'custom' => [
    'email' => [
        'required' => 'We need to know your email address!',
        'max' => 'Your email address is too long!'
    ],
],
```

<a name="specifying-attribute-in-language-files"></a>
### 언어 파일에서 속성명 지정

라라벨의 기본 에러 메시지 중 다수는 `:attribute` 플레이스홀더를 포함하며, 검증 중인 필드나 속성명으로 치환됩니다. 유효성 검증 메시지의 `:attribute` 부분을 커스텀 값으로 바꾸고 싶으면, `resources/lang/xx/validation.php` 언어 파일의 `attributes` 배열에 커스텀 속성명을 지정하세요.

```
'attributes' => [
    'email' => 'email address',
],
```

<a name="specifying-values-in-language-files"></a>
### 언어 파일에서 값 지정

라라벨의 내장 유효성 검증 규칙에 대한 에러 메시지 중 일부는 `:value` 플레이스홀더를 포함하는데, 이는 현재 요청 속성의 실제 값으로 치환됩니다. 하지만, 가끔씩 유효성 메시지에서 이 값 대신 더 사용자 친화적인 표현으로 바꾸고 싶을 때가 있습니다. 예를 들어, 아래와 같이 `payment_type` 값이 `cc`인 경우에 신용카드 번호가 필수임을 나타내는 규칙이 있다고 해봅시다.

```
Validator::make($request->all(), [
    'credit_card_number' => 'required_if:payment_type,cc'
]);
```

이 규칙에 실패하면 다음과 같은 에러 메시지가 출력됩니다.

```
The credit card number field is required when payment type is cc.
```

`cc` 대신 사용자에게 더 친근한 값을 보여주고 싶다면, `resources/lang/xx/validation.php` 언어 파일의 `values` 배열에 다음과 같이 정의할 수 있습니다.

```
'values' => [
    'payment_type' => [
        'cc' => 'credit card'
    ],
],
```

이렇게 하면, 유효성 검증 규칙이 다음과 같은 에러 메시지를 출력하게 됩니다.

```
The credit card number field is required when payment type is credit card.
```

<a name="available-validation-rules"></a>
## 사용 가능한 유효성 검증 규칙

아래는 모든 사용 가능한 유효성 검증 규칙과 그 기능에 대한 목록입니다.



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
[Declined](#rule-declined)
[Declined If](#rule-declined-if)
[Different](#rule-different)
[Digits](#rule-digits)
[Digits Between](#rule-digits-between)
[Dimensions (Image Files)](#rule-dimensions)
[Distinct](#rule-distinct)
[Email](#rule-email)
[Ends With](#rule-ends-with)
[Enum](#rule-enum)
[Exclude](#rule-exclude)
[Exclude If](#rule-exclude-if)
[Exclude Unless](#rule-exclude-unless)
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
[MAC Address](#rule-mac)
[JSON](#rule-json)
[Less Than](#rule-lt)
[Less Than Or Equal](#rule-lte)
[Max](#rule-max)
[MIME Types](#rule-mimetypes)
[MIME Type By File Extension](#rule-mimes)
[Min](#rule-min)
[Multiple Of](#multiple-of)
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
[Same](#rule-same)
[Size](#rule-size)
[Sometimes](#validating-when-present)
[Starts With](#rule-starts-with)
[String](#rule-string)
[Timezone](#rule-timezone)
[Unique (Database)](#rule-unique)
[URL](#rule-url)
[UUID](#rule-uuid)

</div>

<a name="rule-accepted"></a>
#### accepted

검증 중인 필드의 값이 반드시 `"yes"`, `"on"`, `1`, 또는 `true`여야 합니다. "서비스 약관 동의"와 같은 필드를 검증할 때 유용합니다.

<a name="rule-accepted-if"></a>
#### accepted_if:anotherfield,value,...

검증 중인 필드의 값이, 대상이 되는 다른 필드의 값이 지정한 값과 같을 때만 `"yes"`, `"on"`, `1`, 또는 `true`여야 합니다. "서비스 약관 동의"와 유사한 필드 검증에 활용할 수 있습니다.

<a name="rule-active-url"></a>
#### active_url

검증 중인 필드는 PHP의 `dns_get_record` 함수에 따라 유효한 A 레코드 또는 AAAA 레코드를 반드시 가지고 있어야 합니다. 입력 값에서 URL의 호스트명은 PHP의 `parse_url` 함수를 사용해 추출된 뒤 `dns_get_record`로 전달됩니다.

<a name="rule-after"></a>
#### after:_date_

검증 중인 필드는, 주어진 날짜 이후의 값이어야 합니다. 주어진 날짜는 내부적으로 PHP의 `strtotime` 함수로 `DateTime` 인스턴스에 변환됩니다.

```
'start_date' => 'required|date|after:tomorrow'
```

`strtotime`으로 평가할 날짜 문자열 대신, 비교할 기준으로 다른 필드명을 지정할 수도 있습니다.

```
'finish_date' => 'required|date|after:start_date'
```

<a name="rule-after-or-equal"></a>
#### after\_or\_equal:_date_

검증 중인 필드는 주어진 날짜 이후 또는 그 날짜와 같아야 합니다. 더 자세한 사항은 [after](#rule-after) 규칙을 참고하세요.

<a name="rule-alpha"></a>
#### alpha

검증 중인 필드는 영문 알파벳 문자만을 포함해야 합니다.

<a name="rule-alpha-dash"></a>
#### alpha_dash

검증 중인 필드는 영문자, 숫자, 대시(-), 언더스코어(_)만 포함할 수 있습니다.

<a name="rule-alpha-num"></a>
#### alpha_num

검증 중인 필드는 영문자와 숫자만 포함해야 합니다.

<a name="rule-array"></a>
#### array

검증 중인 필드는 PHP의 `array` 타입이어야 합니다.

`array` 규칙에 추가 값이 전달되면, 입력 배열에서 각 키가 반드시 이 규칙에 정의한 값의 목록 안에 있어야만 합니다. 아래 예시에서 입력 배열의 `admin` 키는, 규칙에서 지정한 값 목록에 없으므로 유효하지 않습니다.

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

일반적으로 배열의 허용 키 목록을 명시적으로 지정하는 것이 좋습니다. 지정하지 않으면, 검증기의 `validate` 및 `validated` 메서드는 배열과 모든 키를 포함한 검증 데이터를 반환하며, 별도의 중첩 배열 검증 규칙이 없다면 허용되지 않은 키도 함께 반환될 수 있습니다.

만약 `array` 규칙에서 별도의 허용 키 목록을 지정하지 않았을 때도, 검증 데이터에 유효하지 않은 배열 키를 포함하고 싶지 않다면, 애플리케이션의 `AppServiceProvider`의 `boot` 메서드에서 검증기의 `excludeUnvalidatedArrayKeys` 메서드를 호출하여 언제나 유효성 검증되지 않은 배열 키를 반환 데이터에서 제외하도록 할 수 있습니다. 이렇게 하면, 검증 결과 데이터에는 반드시 [중첩 배열 규칙](#validating-arrays)으로 검증한 키만 포함됩니다.

```php
use Illuminate\Support\Facades\Validator;

/**
 * Register any application services.
 *
 * @return void
 */
public function boot()
{
    Validator::excludeUnvalidatedArrayKeys();
}
```

<a name="rule-bail"></a>
#### bail

유효성 검증 도중, 해당 필드에서 가장 첫 번째 실패가 발생하면 그 뒤의 규칙은 검증하지 않습니다.

`bail` 규칙은 특정 필드에서만 유효성 검증 실패 시 검증을 중단하지만, `stopOnFirstFailure` 메서드는 하나의 검증 실패가 발생한 즉시 모든 속성의 추가 유효성 검증을 중단합니다.

```
if ($validator->stopOnFirstFailure()->fails()) {
    // ...
}
```

<a name="rule-before"></a>
#### before:_date_

검증 중인 필드는, 주어진 날짜 이전의 값이어야 합니다. 주어진 날짜는 내부적으로 PHP의 `strtotime` 함수로 `DateTime` 인스턴스에 변환됩니다. 또한 [`after`](#rule-after) 규칙과 마찬가지로, 날짜 값을 지정할 때 다른 필드명을 사용할 수도 있습니다.

<a name="rule-before-or-equal"></a>
#### before\_or\_equal:_date_

검증 중인 필드는 주어진 날짜 이전이거나 동일한 값이어야 합니다. 사용 방법과 동작은 [`after`](#rule-after) 규칙과 동일하며, 내부적으로 PHP `strtotime`으로 날짜를 평가합니다.

<a name="rule-between"></a>
#### between:_min_,_max_

검증 중인 필드는 지정한 _min_과 _max_ 사이의 크기여야 합니다. 문자열, 숫자, 배열, 파일 등은 [`size`](#rule-size) 규칙과 동일한 방식으로 평가됩니다.

<a name="rule-boolean"></a>
#### boolean

검증 중인 필드는 boolean 타입으로 변환될 수 있어야 합니다. 허용되는 값은 `true`, `false`, `1`, `0`, `"1"`, `"0"` 입니다.

<a name="rule-confirmed"></a>
#### confirmed

검증 중인 필드는 `{field}_confirmation`으로 끝나는 동일한 이름의 필드를 입력 값에서 반드시 가져야 하며, 두 필드의 값이 일치해야 합니다. 예를 들어, `password` 필드를 검증할 때 `password_confirmation` 필드도 함께 받아야 합니다.

<a name="rule-current-password"></a>
#### current_password

검증 중인 필드는 인증된 사용자의 비밀번호와 일치해야 합니다. 이 규칙의 첫 번째 파라미터로 [인증 가드](/docs/8.x/authentication)를 지정할 수도 있습니다.

```
'password' => 'current_password:api'
```

<a name="rule-date"></a>
#### date

검증 중인 필드는 PHP `strtotime` 함수로 유효(존재하는 날짜, 상대적이지 않은 날짜)한 날짜 형식이어야 합니다.

<a name="rule-date-equals"></a>
#### date_equals:_date_

검증 중인 필드는 주어진 날짜와 정확히 같은 값이어야 합니다. 주어진 날짜는 PHP의 `strtotime` 함수로 변환해 `DateTime` 인스턴스로 체크됩니다.

<a name="rule-date-format"></a>
#### date_format:_format_

검증 중인 필드는 지정한 _format_과 일치해야 합니다. 한 필드에 `date`와 `date_format` 규칙을 함께 사용하면 안 됩니다. 이 검증 규칙은 PHP의 [DateTime](https://www.php.net/manual/en/class.datetime.php) 클래스에서 지원하는 모든 형식을 지원합니다.

<a name="rule-declined"></a>
#### declined

검증 중인 필드는 반드시 `"no"`, `"off"`, `0`, 또는 `false` 값이어야 합니다.

<a name="rule-declined-if"></a>
#### declined_if:anotherfield,value,...

다른 필드의 값이 특정 값과 같을 때, 검증 중인 필드는 반드시 `"no"`, `"off"`, `0`, 또는 `false`여야 합니다.

<a name="rule-different"></a>
#### different:_field_

검증 중인 필드는 지정한 _field_와 값이 달라야 합니다.

<a name="rule-digits"></a>
#### digits:_value_

검증 중인 필드는 _numeric_이어야 하며, 자리수가 정확히 _value_여야 합니다.

<a name="rule-digits-between"></a>
#### digits_between:_min_,_max_

검증 중인 필드는 _numeric_이어야 하며, 자리수가 _min_과 _max_ 사이여야 합니다.

<a name="rule-dimensions"></a>
#### dimensions

검증 중인 파일은 다음과 같이 지정한 파라미터 제약조건을 만족하는 이미지여야 합니다.

```
'avatar' => 'dimensions:min_width=100,min_height=200'
```

사용 가능한 제약조건: _min\_width_, _max\_width_, _min\_height_, _max\_height_, _width_, _height_, _ratio_.

_비율(ratio)_ 제약조건은 가로를 세로로 나눈 값으로 표시합니다. 분수(`3/2`) 또는 실수(`1.5`) 형태로 지정할 수 있습니다.

```
'avatar' => 'dimensions:ratio=3/2'
```

이 규칙은 여러 인자를 필요로 하므로, `Rule::dimensions` 메서드를 사용해 더 유연하게 규칙을 구성할 수 있습니다.

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

`distinct` 규칙은 기본적으로 느슨한(비엄격한) 변수 비교를 사용합니다. 엄격한 비교를 사용하려면 `strict` 매개변수를 규칙 정의에 추가하면 됩니다.

```
'foo.*.id' => 'distinct:strict'
```

대소문자 구분 없이 중복 여부를 검사하고 싶다면 `ignore_case`를 규칙에 추가하세요.

```
'foo.*.id' => 'distinct:ignore_case'
```

<a name="rule-email"></a>
#### email

해당 필드는 이메일 주소 형식이어야 합니다. 이 유효성 검증 규칙은 이메일 주소를 검증하기 위해 [`egulias/email-validator`](https://github.com/egulias/EmailValidator) 패키지를 사용합니다. 기본적으로 `RFCValidation` 검증기가 적용되지만, 다른 검증 스타일도 사용할 수 있습니다.

```
'email' => 'email:rfc,dns'
```

위 예시에서는 `RFCValidation`과 `DNSCheckValidation` 두 가지 검증이 동시에 적용됩니다. 적용 가능한 검증 스타일 전체 목록은 아래와 같습니다.

<div class="content-list" markdown="1">

- `rfc`: `RFCValidation`
- `strict`: `NoRFCWarningsValidation`
- `dns`: `DNSCheckValidation`
- `spoof`: `SpoofCheckValidation`
- `filter`: `FilterEmailValidation`

</div>

PHP의 `filter_var` 함수를 사용하는 `filter` 검증기는 라라벨에 기본 탑재되어 있으며, 라라벨 버전 5.8 이전의 기본 이메일 검증 방식이기도 했습니다.

> [!NOTE]
> `dns` 및 `spoof` 검증기는 PHP `intl` 확장 모듈이 필요합니다.

<a name="rule-ends-with"></a>
#### ends_with:_foo_,_bar_,...

해당 필드는 주어진 값들 중 하나로 끝나야 합니다.

<a name="rule-enum"></a>
#### enum

`Enum` 규칙은 필드 값이 유효한 열거형(enum) 값인지 클래스 기반으로 검증합니다. `Enum` 규칙은 생성자 인수로 열거형 클래스명을 받습니다.

```
use App\Enums\ServerStatus;
use Illuminate\Validation\Rules\Enum;

$request->validate([
    'status' => [new Enum(ServerStatus::class)],
]);
```

> [!NOTE]
> 열거형(enum)은 PHP 8.1 이상에서만 사용할 수 있습니다.

<a name="rule-exclude"></a>
#### exclude

해당 필드는 `validate`, `validated` 메서드로 반환되는 요청 데이터에서 제외됩니다.

<a name="rule-exclude-if"></a>
#### exclude_if:_anotherfield_,_value_

`_anotherfield_`에 해당하는 필드가 _value_와 같으면, 해당 필드는 `validate`, `validated` 메서드로 반환되는 요청 데이터에서 제외됩니다.

<a name="rule-exclude-unless"></a>
#### exclude_unless:_anotherfield_,_value_

`_anotherfield_` 필드가 _value_와 같지 않다면, 해당 필드는 `validate`, `validated` 메서드로 반환되는 데이터에서 제외됩니다. _value_가 `null`(`exclude_unless:name,null`)이면, 비교 대상 필드가 `null`이거나 요청 데이터에 없을 때 해당 필드는 제외됩니다.

<a name="rule-exclude-without"></a>
#### exclude_without:_anotherfield_

`_anotherfield_` 필드가 존재하지 않을 경우, 해당 필드는 `validate`, `validated` 결과에서 제외됩니다.

<a name="rule-exists"></a>
#### exists:_table_,_column_

해당 필드의 값은 지정된 데이터베이스 테이블에 존재해야 합니다.

<a name="basic-usage-of-exists-rule"></a>
#### exists 규칙의 기본 사용법

```
'state' => 'exists:states'
```

`column` 옵션을 지정하지 않으면, 필드명이 그대로 사용됩니다. 즉, 위 규칙은 요청의 `state` 값이 `states` 테이블의 `state` 컬럼에 존재하는지 검사합니다.

<a name="specifying-a-custom-column-name"></a>
#### 커스텀 컬럼명 명시하기

유효성 규칙에서 사용할 데이터베이스 컬럼명을 테이블명 뒤에 명시적으로 지정할 수 있습니다.

```
'state' => 'exists:states,abbreviation'
```

경우에 따라 `exists` 쿼리를 수행할 때 특정 데이터베이스 커넥션을 지정해야 할 수도 있습니다. 이때는 테이블 이름 앞에 커넥션명을 추가하면 됩니다.

```
'email' => 'exists:connection.staff,email'
```

테이블명을 직접 지정하는 대신, 사용할 Eloquent 모델을 지정하여 테이블명을 자동으로 결정하게 할 수도 있습니다.

```
'user_id' => 'exists:App\Models\User,id'
```

유효성 검증 규칙이 실행하는 쿼리를 커스터마이징하고 싶다면, `Rule` 클래스를 이용해 규칙을 체이닝 방식으로 정의할 수 있습니다. 아래 예시에서는 구분자로 `|` 대신 배열로 규칙을 명시하고 있습니다.

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

<a name="rule-file"></a>
#### file

해당 필드는 성공적으로 업로드된 파일이어야 합니다.

<a name="rule-filled"></a>
#### filled

해당 필드가 존재할 경우, 빈 값이 아니어야 합니다.

<a name="rule-gt"></a>
#### gt:_field_

해당 필드는 지정한 _field_보다 커야 합니다. 두 필드의 데이터 타입이 동일해야 합니다. 문자열, 숫자, 배열, 파일의 경우 [`size`](#rule-size) 규칙과 동일한 기준으로 비교합니다.

<a name="rule-gte"></a>
#### gte:_field_

해당 필드는 지정한 _field_보다 크거나 같아야 합니다. 두 값의 데이터 타입이 동일해야 합니다. 문자열, 숫자, 배열, 파일 모두 [`size`](#rule-size) 규칙과 동일하게 평가합니다.

<a name="rule-image"></a>
#### image

검증 대상 파일은 이미지(jpg, jpeg, png, bmp, gif, svg, webp)여야 합니다.

<a name="rule-in"></a>
#### in:_foo_,_bar_,...

해당 필드는 주어진 값들의 목록에 포함되어야 합니다. 이 규칙은 배열을 `implode`로 연결할 필요가 많은데, `Rule::in` 메서드를 사용하면 규칙을 더 간결하게 작성할 수 있습니다.

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

`in` 규칙을 `array` 규칙과 함께 사용하면, 입력 배열의 각 값이 `in` 규칙의 값 목록에 모두 존재해야 합니다. 다음 예시에서 입력 배열의 `LAS` 코드 값은 목록에 포함돼 있지 않으므로 유효하지 않습니다.

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
        Rule::in(['NYC', 'LIT']),
    ],
]);
```

<a name="rule-in-array"></a>
#### in_array:_anotherfield_.*

해당 필드는 `_anotherfield_`에 포함된 값들 중 하나여야 합니다.

<a name="rule-integer"></a>
#### integer

해당 필드는 정수 값이어야 합니다.

> [!NOTE]
> 이 유효성 규칙은 입력값이 "integer" 자료형인지까지는 검사하지 않고, PHP의 `FILTER_VALIDATE_INT`로 허용되는 값인지 확인합니다. 입력값을 명확하게 숫자로 검증하고 싶다면 [`numeric` 규칙](#rule-numeric)과 같이 사용하세요.

<a name="rule-ip"></a>
#### ip

해당 필드는 IP 주소 형식이어야 합니다.

<a name="ipv4"></a>
#### ipv4

해당 필드는 IPv4 주소여야 합니다.

<a name="ipv6"></a>
#### ipv6

해당 필드는 IPv6 주소여야 합니다.

<a name="rule-mac"></a>
#### mac_address

해당 필드는 MAC 주소 형식이어야 합니다.

<a name="rule-json"></a>
#### json

해당 필드는 유효한 JSON 문자열이어야 합니다.

<a name="rule-lt"></a>
#### lt:_field_

해당 필드는 지정한 _field_보다 작아야 합니다. 두 값의 타입이 동일해야 하며, 문자열, 숫자, 배열, 파일은 [`size`](#rule-size) 규칙과 동일한 기준으로 비교합니다.

<a name="rule-lte"></a>
#### lte:_field_

해당 필드는 지정한 _field_보다 작거나 같아야 합니다. 두 값은 동일한 타입이어야 하며, 문자열, 숫자, 배열, 파일의 경우 [`size`](#rule-size) 규칙과 동일하게 평가합니다.

<a name="rule-max"></a>
#### max:_value_

해당 필드는 _value_보다 작거나 같은 값이어야 합니다. 문자열, 숫자, 배열, 파일은 [`size`](#rule-size) 규칙과 동일하게 평가합니다.

<a name="rule-mimetypes"></a>
#### mimetypes:_text/plain_,...

해당 파일의 MIME 타입이 주어진 타입 중 하나와 일치해야 합니다.

```
'video' => 'mimetypes:video/avi,video/mpeg,video/quicktime'
```

업로드된 파일의 MIME 타입을 확인하기 위해, 프레임워크는 파일의 내용을 읽어 MIME 타입을 추론합니다(이 과정에서 클라이언트가 제공한 값과 다를 수 있습니다).

<a name="rule-mimes"></a>
#### mimes:_foo_,_bar_,...

해당 파일의 확장자가 나열된 목록과 대응하는 MIME 타입이어야 합니다.

<a name="basic-usage-of-mime-rule"></a>
#### MIME 규칙 기본 사용 예시

```
'photo' => 'mimes:jpg,bmp,png'
```

확장자만 지정하면 되지만, 실제로는 파일의 내용이 읽혀서 MIME 타입을 판별합니다. 전체 MIME 타입과 확장자 목록은 아래에서 확인할 수 있습니다.

[https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types](https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types)

<a name="rule-min"></a>
#### min:_value_

해당 필드는 최소 _value_ 값 이상이어야 합니다. 문자열, 숫자, 배열, 파일 모두 [`size`](#rule-size) 규칙과 동일하게 평가됩니다.

<a name="multiple-of"></a>
#### multiple_of:_value_

해당 필드는 _value_의 배수여야 합니다.

> [!NOTE]
> `multiple_of` 규칙을 사용하려면 [`bcmath` PHP 확장 모듈](https://www.php.net/manual/en/book.bc.php)이 필요합니다.

<a name="rule-not-in"></a>
#### not_in:_foo_,_bar_,...

해당 필드는 주어진 값 목록에 포함되지 않아야 합니다. `Rule::notIn` 메서드를 쓰면 규칙을 더 깔끔하게 선언할 수 있습니다.

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

해당 필드는 주어진 정규 표현식과 일치하지 않아야 합니다.

이 규칙은 내부적으로 PHP의 `preg_match` 함수로 동작합니다. 지정한 패턴은 `preg_match`의 형식(구분자 포함)을 따라야 합니다. 예시: `'email' => 'not_regex:/^.+$/i'`

> [!NOTE]
> `regex` 또는 `not_regex` 규칙에 `|` 문자가 포함되어 있을 땐, `|` 구분자 대신 규칙을 배열로 입력하는 것이 필요할 수 있습니다.

<a name="rule-nullable"></a>
#### nullable

해당 필드는 `null` 값을 허용합니다.

<a name="rule-numeric"></a>
#### numeric

해당 필드는 [숫자값(numeric)](https://www.php.net/manual/en/function.is-numeric.php)이어야 합니다.

<a name="rule-password"></a>
#### password

해당 필드는 인증된 사용자의 비밀번호와 일치해야 합니다.

> [!NOTE]
> 이 규칙은 라라벨 9에서 삭제 예정이며, 이름이 `current_password`로 변경되었습니다. 반드시 [Current Password](#rule-current-password) 규칙을 사용하시기 바랍니다.

<a name="rule-present"></a>
#### present

해당 필드는 입력 데이터에 반드시 존재해야 하며, 비어 있어도 상관없습니다.

<a name="rule-prohibited"></a>
#### prohibited

해당 필드는 비어 있거나 요청 데이터에 존재하지 않아야 합니다.

<a name="rule-prohibited-if"></a>
#### prohibited_if:_anotherfield_,_value_,...

`_anotherfield_` 필드가 _value_와 같을 경우, 이 필드는 비어 있거나 존재하지 않아야 합니다.

<a name="rule-prohibited-unless"></a>
#### prohibited_unless:_anotherfield_,_value_,...

`_anotherfield_` 필드가 _value_와 같지 않을 경우, 이 필드는 비어 있거나 존재하지 않아야 합니다.

<a name="rule-prohibits"></a>
#### prohibits:_anotherfield_,...

해당 필드가 존재하는 경우, `_anotherfield_` 목록에 있는 어느 필드도(비어 있더라도) 존재해서는 안 됩니다.

<a name="rule-regex"></a>
#### regex:_pattern_

해당 필드는 주어진 정규 표현식과 일치해야 합니다.

이 규칙은 내부적으로 PHP의 `preg_match`를 사용합니다. 지정한 패턴은 구분자를 포함해 `preg_match` 규칙 형식을 따라야 합니다. 예: `'email' => 'regex:/^.+@.+$/i'`

> [!NOTE]
> `regex` 또는 `not_regex` 규칙을 쓸 때 정규표현식에 `|` 문자가 포함되어 있으면, 규칙을 배열 형태로 선언하는 것이 필요할 수 있습니다.

<a name="rule-required"></a>
#### required

해당 필드는 입력 데이터에 반드시 존재해야 하며, 비어 있으면 안 됩니다. 필드가 "비어 있음"으로 간주되는 조건은 다음과 같습니다.

<div class="content-list" markdown="1">

- 값이 `null`인 경우
- 값이 빈 문자열인 경우
- 값이 빈 배열이거나, 비어 있는 `Countable` 객체인 경우
- 업로드된 파일이 경로를 갖고 있지 않은 경우

</div>

<a name="rule-required-if"></a>
#### required_if:_anotherfield_,_value_,...

`_anotherfield_` 필드가 _value_ 값일 때, 해당 필드는 반드시 존재하며 비어 있으면 안 됩니다.

`required_if` 규칙에 더 복잡한 조건을 사용하고 싶을 땐 `Rule::requiredIf` 메서드를 사용할 수 있습니다. 이 메서드는 불리언 값이나 클로저를 받고, 클로저는 해당 필드가 필수인지 판단해 `true` 또는 `false`를 반환해야 합니다.

```
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($request->all(), [
    'role_id' => Rule::requiredIf($request->user()->is_admin),
]);

Validator::make($request->all(), [
    'role_id' => Rule::requiredIf(function () use ($request) {
        return $request->user()->is_admin;
    }),
]);
```

<a name="rule-required-unless"></a>
#### required_unless:_anotherfield_,_value_,...

`_anotherfield_` 필드가 _value_가 아닌 경우에 해당 필드는 반드시 존재하며 비어 있으면 안 됩니다. 즉, _anotherfield_도 _value_가 `null`이 아닌 한 요청 데이터에 반드시 포함되어야 합니다. _value_가 `null`(`required_unless:name,null`)이면, 비교 대상 필드가 `null`이거나 데이터에 없는 경우에만 해당 필드를 요구하지 않습니다.

<a name="rule-required-with"></a>
#### required_with:_foo_,_bar_,...

지정한 다른 필드들 중 어느 하나라도 값이 존재하며 비어 있지 않다면, 해당 필드도 반드시 존재하며 비어 있으면 안 됩니다.

<a name="rule-required-with-all"></a>
#### required_with_all:_foo_,_bar_,...

지정한 필드들이 모두 값이 존재하며 비어 있지 않을 때만, 해당 필드도 반드시 존재하며 비어 있으면 안 됩니다.

<a name="rule-required-without"></a>
#### required_without:_foo_,_bar_,...

지정한 필드들 중 어느 하나라도 비어 있거나 존재하지 않을 때에만, 해당 필드는 반드시 존재하며 비어 있으면 안 됩니다.

<a name="rule-required-without-all"></a>
#### required_without_all:_foo_,_bar_,...

지정한 필드들이 모두 비어 있거나 존재하지 않을 때에만, 해당 필드는 반드시 존재하며 비어 있으면 안 됩니다.

<a name="rule-same"></a>
#### same:_field_

지정한 _field_의 값과 해당 필드가 일치해야 합니다.

<a name="rule-size"></a>
#### size:_value_

해당 필드는 _value_와 정확히 일치하는 크기를 가져야 합니다. 문자열 데이터라면 _value_는 글자 수, 숫자라면 정수값(그리고 반드시 `numeric` 또는 `integer` 규칙이 함께 적용되어야 함), 배열이라면 `count`, 파일이라면 킬로바이트(KB) 단위의 파일 크기에 해당합니다. 예시를 보겠습니다.

```
// 문자열이 정확히 12글자인지 검증...
'title' => 'size:12';

// 입력된 정수가 정확히 10인지 검증...
'seats' => 'integer|size:10';

// 배열 원소가 정확히 5개인지 검증...
'tags' => 'array|size:5';

// 업로드 파일이 정확히 512KB인지 검증...
'image' => 'file|size:512';
```

<a name="rule-starts-with"></a>
#### starts_with:_foo_,_bar_,...

해당 필드는 주어진 값들 중 하나로 시작해야 합니다.

<a name="rule-string"></a>
#### string

해당 필드는 문자열이어야 합니다. 만약 이 필드에 `null`도 허용하고 싶다면, `nullable` 규칙도 함께 지정해야 합니다.

<a name="rule-timezone"></a>
#### timezone

해당 필드는 PHP의 `timezone_identifiers_list` 함수에 기반하여 유효한 타임존 식별자여야 합니다.

<a name="rule-unique"></a>
#### unique:_table_,_column_

해당 필드 값이 주어진 데이터베이스 테이블에 기존에 존재하지 않아야 합니다.

**커스텀 테이블/컬럼명 지정하기**

테이블명을 직접 지정하는 대신, 사용할 Eloquent 모델을 지정해 테이블명을 자동으로 사용할 수 있습니다.

```
'email' => 'unique:App\Models\User,email_address'
```

`column` 옵션에서 데이터베이스 컬럼명을 지정할 수 있습니다(지정하지 않으면 필드명이 사용됨).

```
'email' => 'unique:users,email_address'
```

**커스텀 데이터베이스 커넥션 지정하기**

경우에 따라 유효성 검사 시 사용하는 커넥션을 지정해야 할 수 있습니다. 이때는 테이블명 앞에 커넥션명을 붙여 사용합니다.

```
'email' => 'unique:connection.users,email_address'
```

**특정 ID를 무시하도록 Unique 규칙에 지정하기**

예를 들어 '프로필 수정 화면'에서 사용자의 이름, 이메일, 위치를 검사한다고 할 때, 이메일 주소의 유일성을 검증하길 원할 수 있습니다. 하지만 사용자가 이름만 바꾸고 이메일은 바꾸지 않은 경우, 기존 본인의 이메일이기 때문에 유효성 검증에서 문제없이 통과해야 합니다.

사용자의 ID를 무시하도록 지정하려면 `Rule` 클래스를 이용해 규칙을 체이닝 방식으로 정의해야 합니다. 예시에서는 구분자 대신 배열로 규칙을 입력하고 있습니다.

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

> [!NOTE]
> `ignore` 메서드에 사용자 입력값을 직접 사용해서는 절대 안 됩니다. 반드시 Eloquent 모델에서 얻거나 시스템이 생성한 고유 키 값(예: 증가하는 ID, UUID)만 사용해야 합니다. 그렇지 않으면 애플리케이션이 SQL 인젝션 공격에 취약해질 수 있습니다.

모델의 키 값 자체를 전달하지 않고, 모델 인스턴스 전체를 `ignore` 메서드에 넘길 수도 있습니다. 이 경우 라라벨이 자동으로 키 값을 추출합니다.

```
Rule::unique('users')->ignore($user)
```

테이블의 기본 키 컬럼명이 `id`가 아니라면, `ignore` 메서드에서 해당 컬럼명을 지정할 수 있습니다.

```
Rule::unique('users')->ignore($user->id, 'user_id')
```

기본적으로 `unique` 규칙은 검증 중인 필드명과 동일한 컬럼의 유일성을 검사합니다. 하지만, `unique` 메서드의 두 번째 인수로 다른 컬럼명을 지정할 수도 있습니다.

```
Rule::unique('users', 'email_address')->ignore($user->id),
```

**추가 Where 조건 지정하기**

`where` 메서드를 활용해 쿼리 조건을 더 상세하게 지정할 수 있습니다. 예시에서는 `account_id` 컬럼 값이 1인 레코드 안에서만 검색하도록 쿼리를 제한하고 있습니다.

```
'email' => Rule::unique('users')->where(function ($query) {
    return $query->where('account_id', 1);
})
```

<a name="rule-url"></a>
#### url

해당 필드는 유효한 URL이어야 합니다.

<a name="rule-uuid"></a>
#### uuid

해당 필드는 RFC 4122(버전 1, 3, 4, 5) 표준의 UUID(범용 고유 식별자)여야 합니다.

<a name="conditionally-adding-rules"></a>
## 조건부 규칙 추가하기

<a name="skipping-validation-when-fields-have-certain-values"></a>

#### 특정 값이 있을 때 필드 검증 건너뛰기

다른 필드가 특정 값을 가질 때, 해당 필드의 유효성 검증을 건너뛰고 싶을 수 있습니다. 이런 경우에는 `exclude_if` 유효성 검증 규칙을 사용할 수 있습니다. 아래 예시에서는 `has_appointment` 필드의 값이 `false`일 경우, `appointment_date`와 `doctor_name` 필드의 유효성 검증이 수행되지 않습니다.

```
use Illuminate\Support\Facades\Validator;

$validator = Validator::make($data, [
    'has_appointment' => 'required|boolean',
    'appointment_date' => 'exclude_if:has_appointment,false|required|date',
    'doctor_name' => 'exclude_if:has_appointment,false|required|string',
]);
```

반대로, 특정 필드가 주어진 값이 아닐 때만 검증을 건너뛰고, 특정 값일 때만 검증을 수행하고 싶다면 `exclude_unless` 규칙을 사용할 수 있습니다.

```
$validator = Validator::make($data, [
    'has_appointment' => 'required|boolean',
    'appointment_date' => 'exclude_unless:has_appointment,true|required|date',
    'doctor_name' => 'exclude_unless:has_appointment,true|required|string',
]);
```

<a name="validating-when-present"></a>
#### 필드가 존재할 때만 검증하기

특정 필드가 입력 데이터에 포함되어 있을 때만 유효성 검증을 진행하고 싶은 경우가 있습니다. 이런 경우에는 규칙 목록에 `sometimes` 규칙을 추가하면 간단하게 처리할 수 있습니다.

```
$v = Validator::make($data, [
    'email' => 'sometimes|required|email',
]);
```

위 예시에서, `email` 필드는 `$data` 배열에 존재할 때만 유효성 검증 대상이 됩니다.

> [!TIP]
> 무조건 존재해야 하지만 비어 있을 수 있는 필드를 검증하려면 [옵션 필드에 관한 참고 사항](#a-note-on-optional-fields)을 참고하세요.

<a name="complex-conditional-validation"></a>
#### 복잡한 조건부 검증

조건이 조금 더 복잡할 때 유효성 규칙을 동적으로 추가하고 싶을 수 있습니다. 예를 들어, 어떤 필드가 100보다 클 경우에만 다른 필드를 필수로 만들거나, 특정 필드의 값이 있을 때만 다른 두 필드가 특정 값을 갖게 하는 등의 요구사항이 있을 수 있습니다. 이런 경우에도 유효성 검증 규칙을 유연하게 추가할 수 있습니다.

우선, _항상 동일하게 적용되는 규칙_ 으로 `Validator` 인스턴스를 생성합니다.

```
use Illuminate\Support\Facades\Validator;

$validator = Validator::make($request->all(), [
    'email' => 'required|email',
    'games' => 'required|numeric',
]);
```

예를 들어, 게임 수집가를 위한 웹 애플리케이션이라고 가정해봅시다. 만약 가입 시 수집한 게임이 100개를 넘는다면, 왜 그렇게 많은 게임을 소유하게 되었는지 설명을 받으려 할 수 있습니다(예: 게임 되팔이점을 운영함, 또는 단순히 수집을 즐김 등). 이런 조건부 요구사항은 `Validator` 인스턴스의 `sometimes` 메서드로 추가할 수 있습니다.

```
$validator->sometimes('reason', 'required|max:500', function ($input) {
    return $input->games >= 100;
});
```

`sometimes` 메서드의 첫 번째 인자는 조건부로 검증할 필드명입니다. 두 번째 인자는 추가할 규칙 목록이고, 세 번째 인자로 전달되는 클로저가 `true`를 반환하면 해당 규칙이 추가됩니다. 이 방식으로 복잡한 조건부 유효성 검증도 매우 쉽게 작성할 수 있습니다. 여러 필드에 대해 한 번에 조건부 검증 규칙을 추가하는 것도 가능합니다.

```
$validator->sometimes(['reason', 'cost'], 'required', function ($input) {
    return $input->games >= 100;
});
```

> [!TIP]
> 클로저에 전달되는 `$input` 파라미터는 `Illuminate\Support\Fluent` 인스턴스입니다. 따라서 유효성 검증 중인 입력 값이나 파일에 접근할 수 있습니다.

<a name="complex-conditional-array-validation"></a>
#### 복잡한 조건부 배열 검증

중첩 배열 내에서, 정확한 인덱스를 모르는 경우 다른 필드의 값을 조건으로 검증할 때도 있을 수 있습니다. 이럴 때는, 클로저에 두 번째 인자를 받아서, 현재 검증 중인 배열 내 개별 항목 정보를 활용할 수 있습니다.

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

`$input`과 마찬가지로, `$item` 파라미터는 배열 데이터라면 `Illuminate\Support\Fluent` 인스턴스가 되고, 배열이 아니라면 일반 문자열이 됩니다.

<a name="validating-arrays"></a>
## 배열 검증

[`array` 유효성 검증 규칙 문서](#rule-array)에서 설명한 것처럼, `array` 규칙에는 허용할 배열 키의 목록을 지정할 수 있습니다. 배열에 추가적인 키가 있으면, 유효성 검증은 실패하게 됩니다.

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

일반적으로, 배열 내에 어떤 키가 들어올 수 있는지 명시하는 것이 좋습니다. 그렇지 않으면, validator의 `validate`와 `validated` 메서드는 배열 전체와 모든 키(심지어 중첩 배열 규칙으로 검증되지 않은 키 포함)를 그대로 반환합니다.

<a name="excluding-unvalidated-array-keys"></a>
### 검증되지 않은 배열 키 제외하기

만약 `array` 규칙에서 허용 키 목록을 지정하지 않아도, 검증되지 않은 배열 키를 "검증된 데이터"에 절대 포함시키고 싶지 않다면, 애플리케이션의 `AppServiceProvider`의 `boot` 메서드 내에서 validator의 `excludeUnvalidatedArrayKeys` 메서드를 호출하면 됩니다. 이렇게 하면 [중첩 배열 규칙](#validating-arrays)으로 구체적으로 검증한 키만 "검증된 데이터"에 포함됩니다.

```php
use Illuminate\Support\Facades\Validator;

/**
 * Register any application services.
 *
 * @return void
 */
public function boot()
{
    Validator::excludeUnvalidatedArrayKeys();
}
```

<a name="validating-nested-array-input"></a>
### 중첩 배열 입력값 검증

중첩 배열 형식의 폼 입력 필드도 손쉽게 검증할 수 있습니다. 배열 내 특정 속성을 지정할 때는 "점 표기법(dot notation)"을 사용할 수 있습니다. 예를 들어, 들어오는 HTTP 요청에 `photos[profile]` 필드가 있다면 다음과 같이 검증할 수 있습니다.

```
use Illuminate\Support\Facades\Validator;

$validator = Validator::make($request->all(), [
    'photos.profile' => 'required|image',
]);
```

배열의 각 요소에 대해서도 검증이 가능합니다. 예를 들어, 주어진 배열 입력의 각 이메일이 고유해야 하는 경우 아래와 같이 처리할 수 있습니다.

```
$validator = Validator::make($request->all(), [
    'person.*.email' => 'email|unique:users',
    'person.*.first_name' => 'required_with:person.*.last_name',
]);
```

마찬가지로, [언어 파일 내에서 사용자 정의 메시지](#custom-messages-for-specific-attributes)를 지정할 때에도 `*` 문자를 사용할 수 있습니다. 이렇게 하면 배열 기반 필드에 단일 검증 메시지를 쉽게 적용할 수 있습니다.

```
'custom' => [
    'person.*.email' => [
        'unique' => 'Each person must have a unique email address',
    ]
],
```

<a name="validating-passwords"></a>
## 비밀번호 검증

비밀번호가 충분한 복잡성을 갖추었는지 확인하려면, Laravel의 `Password` 규칙 객체를 사용할 수 있습니다.

```
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

$validator = Validator::make($request->all(), [
    'password' => ['required', 'confirmed', Password::min(8)],
]);
```

`Password` 규칙 객체를 사용하면, 비밀번호가 최소 한 글자, 숫자, 특수 기호, 대소문자 혼합 등 다양한 복잡성 요구사항을 손쉽게 지정할 수 있습니다.

```
// 최소 8자 이상...
Password::min(8)

// 최소 한 글자 포함...
Password::min(8)->letters()

// 대문자와 소문자 각각 1자 이상 포함...
Password::min(8)->mixedCase()

// 최소 한 숫자 포함...
Password::min(8)->numbers()

// 최소 한 특수 기호 포함...
Password::min(8)->symbols()
```

또한, `uncompromised` 메서드를 사용하면 공개적으로 유출된 비밀번호 데이터에 포함된 적이 있는지 확인하여, 유출된 비밀번호 사용을 방지할 수 있습니다.

```
Password::min(8)->uncompromised()
```

내부적으로 `Password` 규칙 객체는 [k-Anonymity](https://en.wikipedia.org/wiki/K-anonymity) 모델을 활용하여, 사용자의 개인정보나 보안을 침해하지 않는 선에서 [haveibeenpwned.com](https://haveibeenpwned.com) 서비스를 통해 비밀번호 유출 여부를 검사합니다.

기본적으로, 데이터 유출 내역에 한 번이라도 등장한 비밀번호는 유출된 것으로 간주되며, `uncompromised` 메서드의 첫 번째 인자를 통해 이 기준을 바꿀 수 있습니다.

```
// 동일한 데이터 유출 내역에서 3번 미만 등장한 비밀번호만 허용...
Password::min(8)->uncompromised(3);
```

물론 위의 메서드들을 모두 체인으로 연결하여 사용할 수 있습니다.

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

애플리케이션에서 비밀번호 검증 규칙을 한 번에 정의해두고 재사용하고 싶을 때가 있을 수 있습니다. 이때는 `Password::defaults` 메서드에 클로저를 전달하여 기본 규칙 구성을 지정하면 됩니다. 일반적으로 이 규칙 등록은 서비스 제공자의 `boot` 메서드에서 설정합니다.

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

이후, 해당 기본 규칙을 검증에 적용하려면 아래와 같이 인자 없이 `defaults` 메서드를 호출하면 됩니다.

```
'password' => ['required', Password::defaults()],
```

가끔 기본 비밀번호 규칙 외에 추가적인 검증 규칙을 붙이고 싶을 때는, `rules` 메서드를 사용할 수 있습니다.

```
use App\Rules\ZxcvbnRule;

Password::defaults(function () {
    $rule = Password::min(8)->rules([new ZxcvbnRule]);

    // ...
});
```

<a name="custom-validation-rules"></a>
## 사용자 정의 유효성 검증 규칙

<a name="using-rule-objects"></a>
### 규칙 객체 사용하기

라라벨은 다양한 유효성 검증 규칙을 제공합니다. 그러나 나만의 특별한 규칙이 필요할 수도 있습니다. 이럴 때 "규칙 객체(rule object)"를 이용하여 사용자 정의 검증 규칙을 정의할 수 있습니다. 새로운 규칙 객체를 생성하려면 `make:rule` Artisan 명령어를 사용할 수 있습니다. 예를 들어, 문자열이 모두 대문자인지 검사하는 규칙을 만들어보겠습니다. 새롭게 생성된 규칙 객체는 `app/Rules` 디렉토리에 저장되며, 디렉토리가 없다면 Artisan 명령 실행 시 자동으로 생성됩니다.

```
php artisan make:rule Uppercase
```

생성이 완료되면, 해당 규칙의 동작을 정의할 준비가 된 것입니다. 규칙 객체엔 두 가지 메서드가 있습니다: `passes`와 `message`. `passes`는 필드명과 값이 인자로 전달되어, 유효할 경우 `true`, 아니면 `false`를 반환해야 합니다. `message`는 유효성 검증에 실패할 때 사용할 에러 메시지를 반환합니다.

```
<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;

class Uppercase implements Rule
{
    /**
     * Determine if the validation rule passes.
     *
     * @param  string  $attribute
     * @param  mixed  $value
     * @return bool
     */
    public function passes($attribute, $value)
    {
        return strtoupper($value) === $value;
    }

    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message()
    {
        return 'The :attribute must be uppercase.';
    }
}
```

만약 에러 메시지를 다국어 파일에서 불러오고 싶다면, `message` 메서드에서 `trans` 헬퍼를 사용할 수 있습니다.

```
/**
 * Get the validation error message.
 *
 * @return string
 */
public function message()
{
    return trans('validation.uppercase');
}
```

이제 이 규칙 객체를 유효성 검증에 사용할 수 있으며, 다른 유효성 규칙과 함께 인스턴스를 전달하면 됩니다.

```
use App\Rules\Uppercase;

$request->validate([
    'name' => ['required', 'string', new Uppercase],
]);
```

#### 추가 데이터 접근하기

사용자 정의 유효성 검증 규칙 클래스에서 검증 중인 모든 데이터를 접근해야 한다면, 해당 클래스에서 `Illuminate\Contracts\Validation\DataAwareRule` 인터페이스를 구현하면 됩니다. 이때 `setData` 메서드를 정의해야 하며, 라라벨이 유효성 검증 전에 내부적으로 해당 메서드를 호출해 검증 데이터 전체를 전달합니다.

```
<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;
use Illuminate\Contracts\Validation\DataAwareRule;

class Uppercase implements Rule, DataAwareRule
{
    /**
     * All of the data under validation.
     *
     * @var array
     */
    protected $data = [];

    // ...

    /**
     * Set the data under validation.
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

만약 유효성 검증을 수행하는 validator 인스턴스 자체에 접근해야 한다면, `ValidatorAwareRule` 인터페이스를 구현할 수 있습니다.

```
<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;
use Illuminate\Contracts\Validation\ValidatorAwareRule;

class Uppercase implements Rule, ValidatorAwareRule
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
### 클로저를 사용한 규칙

애플리케이션 전반에서 재사용할 필요 없이, 특정 곳에서 한 번만 규칙이 필요한 경우라면, 별도의 클래스 대신 클로저를 사용할 수 있습니다. 이 클로저는 필드명, 값, 그리고 검증 실패 시 호출할 `$fail` 콜백을 인수로 받습니다.

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
### 암묵적(implicit) 규칙

기본적으로, 검증 대상 필드가 없거나 빈 문자열일 경우에는 일반 규칙과 사용자 정의 규칙을 포함한 대부분의 유효성 검증은 실행되지 않습니다. 예를 들어, [`unique`](#rule-unique) 규칙은 빈 문자열에 대해 실행되지 않습니다.

```
use Illuminate\Support\Facades\Validator;

$rules = ['name' => 'unique:users,name'];

$input = ['name' => ''];

Validator::make($input, $rules)->passes(); // true
```

사용자 정의 규칙이 비어 있거나 없는 값에도 항상 실행되게 하려면, 해당 규칙이 "필수"임을 암묵적으로 나타내야 합니다. 즉, `Illuminate\Contracts\Validation\ImplicitRule` 인터페이스를 구현하세요. 이 인터페이스는 자체적인 추가 메서드가 있는 것은 아니며, validator에서 "암묵적으로 필수"로 판단하게 해주는 마커 인터페이스 역할만 합니다.

새로운 암묵적 규칙 객체를 생성하려면 `make:rule` Artisan 명령어에 `--implicit` 옵션을 추가하면 됩니다.

```
 php artisan make:rule Uppercase --implicit
```

> [!NOTE]
> "암묵적(implicit)" 규칙은 해당 필드가 "필수"임을 _암시_ 할 뿐입니다. 실제로 필드가 없거나 비어 있는 경우를 에러로 처리할지는 규칙 메서드를 어떻게 구현했는지에 달려 있습니다.