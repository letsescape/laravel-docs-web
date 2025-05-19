# 블레이드 템플릿 (Blade Templates)

- [소개](#introduction)
    - [Livewire로 블레이드의 기능 확장하기](#supercharging-blade-with-livewire)
- [데이터 출력](#displaying-data)
    - [HTML 엔티티 인코딩](#html-entity-encoding)
    - [블레이드와 자바스크립트 프레임워크](#blade-and-javascript-frameworks)
- [블레이드 디렉티브](#blade-directives)
    - [If 문](#if-statements)
    - [Switch 문](#switch-statements)
    - [반복문](#loops)
    - [Loop 변수](#the-loop-variable)
    - [조건부 클래스](#conditional-classes)
    - [추가 속성](#additional-attributes)
    - [서브뷰 포함하기](#including-subviews)
    - [`@once` 디렉티브](#the-once-directive)
    - [Raw PHP](#raw-php)
    - [주석](#comments)
- [컴포넌트](#components)
    - [컴포넌트 렌더링](#rendering-components)
    - [인덱스 컴포넌트](#index-components)
    - [컴포넌트로 데이터 전달](#passing-data-to-components)
    - [컴포넌트 속성](#component-attributes)
    - [예약어](#reserved-keywords)
    - [슬롯](#slots)
    - [인라인 컴포넌트 뷰](#inline-component-views)
    - [동적 컴포넌트](#dynamic-components)
    - [컴포넌트 수동 등록](#manually-registering-components)
- [익명 컴포넌트](#anonymous-components)
    - [익명 인덱스 컴포넌트](#anonymous-index-components)
    - [데이터 속성 / 속성(attribute)](#data-properties-attributes)
    - [부모 데이터 접근](#accessing-parent-data)
    - [익명 컴포넌트 경로](#anonymous-component-paths)
- [레이아웃 만들기](#building-layouts)
    - [컴포넌트를 사용한 레이아웃](#layouts-using-components)
    - [템플릿 상속을 사용한 레이아웃](#layouts-using-template-inheritance)
- [폼](#forms)
    - [CSRF 필드](#csrf-field)
    - [메서드 필드](#method-field)
    - [유효성 검사 에러](#validation-errors)
- [스택](#stacks)
- [서비스 주입](#service-injection)
- [인라인 블레이드 템플릿 렌더링](#rendering-inline-blade-templates)
- [블레이드 프래그먼트 렌더링](#rendering-blade-fragments)
- [블레이드 확장](#extending-blade)
    - [커스텀 에코 핸들러](#custom-echo-handlers)
    - [커스텀 If 문](#custom-if-statements)

<a name="introduction"></a>
## 소개

Blade는 Laravel에 기본 내장된 간단하면서도 강력한 템플릿 엔진입니다. 일부 PHP 템플릿 엔진과 달리, Blade는 템플릿에서 일반 PHP 코드를 사용하는 것을 제한하지 않습니다. 실제로 모든 Blade 템플릿은 일반 PHP 코드로 컴파일되어, 수정되기 전까지는 캐시되므로 실질적으로 애플리케이션에 추가 성능 저하를 일으키지 않습니다. Blade 템플릿 파일의 확장자는 `.blade.php`이며, 보통 `resources/views` 디렉터리에 저장합니다.

Blade 뷰는 라우트나 컨트롤러에서 전역 `view` 헬퍼를 사용해 반환할 수 있습니다. 물론, [뷰](/docs/12.x/views) 문서에서 설명한 것처럼, `view` 헬퍼의 두 번째 인자를 이용해 Blade 뷰로 데이터를 전달할 수 있습니다.

```php
Route::get('/', function () {
    return view('greeting', ['name' => 'Finn']);
});
```

<a name="supercharging-blade-with-livewire"></a>
### Livewire로 블레이드의 기능 확장하기

Blade 템플릿을 한 단계 더 발전시키고 동적인 인터페이스를 쉽고 빠르게 만들고 싶으신가요? [Laravel Livewire](https://livewire.laravel.com)를 확인해보세요. Livewire는 Blade 컴포넌트에 동적 기능을 손쉽게 추가할 수 있도록 해줍니다. 일반적으로 React나 Vue 같은 프론트엔드 프레임워크에서만 구현할 수 있던 기능도 Blade로 작성할 수 있으므로, 복잡한 빌드 과정이나 클라이언트 렌더링 없이도 최신의 반응형 프론트엔드를 간편하게 제작할 수 있습니다.

<a name="displaying-data"></a>
## 데이터 출력

Blade 뷰에 전달된 데이터를 중괄호로 감싸서 화면에 출력할 수 있습니다. 예를 들어, 다음과 같은 라우트가 있다고 가정해봅시다.

```php
Route::get('/', function () {
    return view('welcome', ['name' => 'Samantha']);
});
```

`name` 변수의 값을 다음과 같이 출력할 수 있습니다.

```blade
Hello, {{ $name }}.
```

> [!NOTE]
> Blade의 `{{ }}` 에코 문법은 자동으로 PHP의 `htmlspecialchars` 함수로 처리되어 XSS 공격을 방지합니다.

Blade에서는 뷰로 전달된 변수를 출력하는 것에 제한되지 않습니다. PHP의 어떤 함수 결과도 에코할 수 있으며, Blade의 에코 구문에는 원하는 어떠한 PHP 코드를 넣을 수도 있습니다.

```blade
The current UNIX timestamp is {{ time() }}.
```

<a name="html-entity-encoding"></a>
### HTML 엔티티 인코딩

기본적으로 Blade(그리고 Laravel의 `e` 함수)는 HTML 엔티티를 중복 인코딩(double encoding)합니다. 만약 중복 인코딩을 비활성화하고 싶다면, `AppServiceProvider`의 `boot` 메서드 안에서 `Blade::withoutDoubleEncoding` 메서드를 호출하면 됩니다.

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Blade::withoutDoubleEncoding();
    }
}
```

<a name="displaying-unescaped-data"></a>
#### 이스케이프되지 않은 데이터 출력

기본적으로 Blade의 `{{ }}` 구문은 PHP의 `htmlspecialchars` 함수로 자동 처리되어 XSS 공격을 방지합니다. 만약 데이터를 이스케이프하지 않고 그대로 출력하고 싶다면 아래와 같은 구문을 사용할 수 있습니다.

```blade
Hello, {!! $name !!}.
```

> [!WARNING]
> 애플리케이션 사용자가 입력한 데이터를 그대로 출력할 때는 매우 주의해야 합니다. 사용자가 제공한 데이터를 출력할 때에는 XSS 공격을 방지하기 위해 반드시 이스케이프되는 중괄호 구문(`{{ }}`)을 사용해야 합니다.

<a name="blade-and-javascript-frameworks"></a>
### 블레이드와 자바스크립트 프레임워크

많은 자바스크립트 프레임워크도 중괄호(`{}`)를 사용해서 브라우저에 표현식을 표시합니다. 이런 경우, Blade 렌더링 엔진에 해당 표현식을 수정 없이 남겨두라고 알려주려면 `@` 기호를 사용할 수 있습니다. 예시:

```blade
<h1>Laravel</h1>

Hello, @{{ name }}.
```

이 예제에서 Blade는 `@` 기호를 제거하고 `{{ name }}` 표현식은 그대로 유지하므로 자바스크립트 프레임워크가 제대로 렌더링할 수 있습니다.

또한, `@` 기호는 Blade 디렉티브를 이스케이프할 때도 사용할 수 있습니다.

```blade
{{-- Blade template --}}
@@if()

<!-- HTML output -->
@if()
```

<a name="rendering-json"></a>
#### JSON 렌더링

때때로, 뷰에 배열을 전달하여 자바스크립트 변수 초기화 목적으로 JSON 형식으로 렌더링해야 할 수도 있습니다. 예를 들어:

```php
<script>
    var app = <?php echo json_encode($array); ?>;
</script>
```

하지만 `json_encode`를 직접 호출하는 대신, `Illuminate\Support\Js::from` 메서드 디렉티브를 사용할 수 있습니다. `from` 메서드는 PHP의 `json_encode`와 동일한 인자를 받아들이지만, HTML의 따옴표 내에 안전하게 포함될 수 있도록 결과 JSON을 이스케이프 처리합니다. `from` 메서드는 해당 객체나 배열을 유효한 자바스크립트 객체로 변환해주는 `JSON.parse` JavaScript 표현식을 반환합니다.

```blade
<script>
    var app = {{ Illuminate\Support\Js::from($array) }};
</script>
```

최신 버전의 Laravel 애플리케이션 스캐폴딩에는 `Js` 파사드가 포함되어 있어, 이 기능을 Blade 템플릿에서 더욱 편리하게 사용할 수 있습니다.

```blade
<script>
    var app = {{ Js::from($array) }};
</script>
```

> [!WARNING]
> `Js::from` 메서드는 기존의 변수만을 JSON으로 렌더링할 때 사용해야 합니다. Blade 템플릿 엔진은 정규식을 기반으로 동작하기 때문에, 복잡한 표현식을 이 디렉티브에 직접 전달하면 예기치 못한 오류가 발생할 수 있습니다.

<a name="the-at-verbatim-directive"></a>
#### `@verbatim` 디렉티브

템플릿의 넓은 부분에서 자바스크립트 변수를 표시해야 한다면, HTML을 `@verbatim` 디렉티브로 감싸면 각 Blade 에코 구문마다 `@` 기호를 붙이지 않아도 됩니다.

```blade
@verbatim
    <div class="container">
        Hello, {{ name }}.
    </div>
@endverbatim
```

<a name="blade-directives"></a>
## 블레이드 디렉티브

템플릿 상속과 데이터 출력 외에도, Blade는 조건문이나 반복문 등 자주 사용하는 PHP 제어 구조를 간단하게 작성할 수 있는 편리한 단축 구문을 제공합니다. 이 단축 문법을 사용하면 익숙한 PHP 구조를 더 읽기 쉽고 간결하게 사용할 수 있습니다.

<a name="if-statements"></a>
### If 문

`@if`, `@elseif`, `@else`, `@endif` 디렉티브를 이용해 `if` 문을 작성할 수 있습니다. 이 디렉티브들은 PHP의 `if`문과 동일하게 동작합니다.

```blade
@if (count($records) === 1)
    I have one record!
@elseif (count($records) > 1)
    I have multiple records!
@else
    I don't have any records!
@endif
```

또한, `@unless` 디렉티브도 사용할 수 있습니다.

```blade
@unless (Auth::check())
    You are not signed in.
@endunless
```

앞서 설명된 조건부 디렉티브 외에도, `@isset`과 `@empty` 디렉티브를 사용해 각각 PHP의 `isset`과 `empty` 함수를 더 간단하게 사용할 수 있습니다.

```blade
@isset($records)
    // $records가 정의되어 있고 null이 아닐 때...
@endisset

@empty($records)
    // $records가 "비어있을" 때...
@endempty
```

<a name="authentication-directives"></a>
#### 인증 디렉티브

`@auth`와 `@guest` 디렉티브를 사용하면 현재 사용자가 [인증](/docs/12.x/authentication)된 상태인지, 아니면 게스트인지 빠르게 확인할 수 있습니다.

```blade
@auth
    // 사용자가 인증되었습니다...
@endauth

@guest
    // 사용자가 인증되지 않았습니다...
@endguest
```

필요하다면, `@auth`와 `@guest` 디렉티브를 사용할 때 확인할 인증 가드를 직접 지정할 수도 있습니다.

```blade
@auth('admin')
    // 사용자가 인증되었습니다...
@endauth

@guest('admin')
    // 사용자가 인증되지 않았습니다...
@endguest
```

<a name="environment-directives"></a>
#### 환경 디렉티브

애플리케이션이 프로덕션 환경에서 실행 중인지 체크하려면 `@production` 디렉티브를 사용할 수 있습니다.

```blade
@production
    // 프로덕션 환경에만 표시할 내용...
@endproduction
```

또는, 특정 환경에서 실행 중인지 확인하려면 `@env` 디렉티브를 사용할 수 있습니다.

```blade
@env('staging')
    // 애플리케이션이 "staging" 환경에서 동작 중...
@endenv

@env(['staging', 'production'])
    // 애플리케이션이 "staging" 또는 "production" 환경에서 동작 중...
@endenv
```

<a name="section-directives"></a>
#### Section 디렉티브

템플릿 상속에서 특정 섹션에 내용이 있는지 확인하려면 `@hasSection` 디렉티브를 사용합니다.

```blade
@hasSection('navigation')
    <div class="pull-right">
        @yield('navigation')
    </div>

    <div class="clearfix"></div>
@endif
```

특정 섹션에 내용이 없는지 확인하려면 `sectionMissing` 디렉티브를 사용할 수 있습니다.

```blade
@sectionMissing('navigation')
    <div class="pull-right">
        @include('default-navigation')
    </div>
@endif
```

<a name="session-directives"></a>
#### 세션 디렉티브

`@session` 디렉티브는 [세션](/docs/12.x/session) 값이 존재하는지 확인할 때 사용할 수 있습니다. 세션 값이 있으면, `@session`과 `@endsession` 사이의 템플릿 내용이 평가됩니다. `@session` 내부에서는 `$value` 변수를 에코해서 세션 값을 표시할 수 있습니다.

```blade
@session('status')
    <div class="p-4 bg-green-100">
        {{ $value }}
    </div>
@endsession
```

<a name="switch-statements"></a>
### Switch 문

`@switch`, `@case`, `@break`, `@default`, `@endswitch` 디렉티브를 이용해 switch 문을 만들 수 있습니다.

```blade
@switch($i)
    @case(1)
        First case...
        @break

    @case(2)
        Second case...
        @break

    @default
        Default case...
@endswitch
```

<a name="loops"></a>
### 반복문

조건문 외에도, Blade는 PHP의 반복문 구조를 쉽게 사용할 수 있는 간단한 디렉티브를 제공합니다. 각각의 디렉티브는 PHP 반복문과 완전히 동일하게 동작합니다.

```blade
@for ($i = 0; $i < 10; $i++)
    The current value is {{ $i }}
@endfor

@foreach ($users as $user)
    <p>This is user {{ $user->id }}</p>
@endforeach

@forelse ($users as $user)
    <li>{{ $user->name }}</li>
@empty
    <p>No users</p>
@endforelse

@while (true)
    <p>I'm looping forever.</p>
@endwhile
```

> [!NOTE]
> `foreach` 반복문을 사용할 때는 [loop 변수](#the-loop-variable)를 활용하여 루프의 현재 상태(예: 첫 번째 반복, 마지막 반복 등)에 대한 유용한 정보를 확인할 수 있습니다.

반복문 안에서 현재 반복을 건너뛰거나 루프를 종료하려면 `@continue`와 `@break` 디렉티브를 사용하면 됩니다.

```blade
@foreach ($users as $user)
    @if ($user->type == 1)
        @continue
    @endif

    <li>{{ $user->name }}</li>

    @if ($user->number == 5)
        @break
    @endif
@endforeach
```

또한, 해당 조건식을 디렉티브 선언에 바로 포함시킬 수도 있습니다.

```blade
@foreach ($users as $user)
    @continue($user->type == 1)

    <li>{{ $user->name }}</li>

    @break($user->number == 5)
@endforeach
```

<a name="the-loop-variable"></a>
### Loop 변수

`foreach` 반복문을 돌 때, 반복문 내부에서는 `$loop` 변수를 사용할 수 있습니다. 이 변수는 루프의 현재 인덱스 등 다양한 정보를 제공하며, 반복문의 첫 번째 혹은 마지막 순회인지를 판별할 수도 있습니다.

```blade
@foreach ($users as $user)
    @if ($loop->first)
        This is the first iteration.
    @endif

    @if ($loop->last)
        This is the last iteration.
    @endif

    <p>This is user {{ $user->id }}</p>
@endforeach
```

중첩 반복문에서, 부모 루프의 `$loop` 변수에 접근하려면 `parent` 속성을 사용할 수 있습니다.

```blade
@foreach ($users as $user)
    @foreach ($user->posts as $post)
        @if ($loop->parent->first)
            This is the first iteration of the parent loop.
        @endif
    @endforeach
@endforeach
```

`$loop` 변수에는 다음과 같은 다양한 속성이 있습니다.

<div class="overflow-auto">

| 속성               | 설명                                                      |
| ------------------ | -------------------------------------------------------- |
| `$loop->index`     | 현재 반복의 인덱스(0부터 시작)                            |
| `$loop->iteration` | 현재 반복 횟수(1부터 시작)                                |
| `$loop->remaining` | 반복문에서 남아있는 반복 횟수                             |
| `$loop->count`     | 반복 중인 배열의 전체 아이템 수                           |
| `$loop->first`     | 루프의 첫 번째 반복인지 여부                              |
| `$loop->last`      | 루프의 마지막 반복인지 여부                               |
| `$loop->even`      | 현재 반복이 짝수 번째 반복인지 여부                       |
| `$loop->odd`       | 현재 반복이 홀수 번째 반복인지 여부                       |
| `$loop->depth`     | 현재 루프의 중첩 레벨                                     |
| `$loop->parent`    | 중첩 루프일 때, 부모 루프의 loop 변수                    |

</div>

<a name="conditional-classes"></a>
### 조건부 클래스 및 스타일

`@class` 디렉티브는 조건에 따라 CSS 클래스 문자열을 동적으로 생성해줍니다. 이 디렉티브는 배열을 인자로 받으며, 배열의 키에는 추가하려는 클래스명을, 값에는 조건식을 넣습니다. 배열 요소가 숫자 키를 가지면 해당 요소는 항상 클래스 목록에 포함됩니다.

```blade
@php
    $isActive = false;
    $hasError = true;
@endphp

<span @class([
    'p-4',
    'font-bold' => $isActive,
    'text-gray-500' => ! $isActive,
    'bg-red' => $hasError,
])></span>

<span class="p-4 text-gray-500 bg-red"></span>
```

마찬가지로, `@style` 디렉티브는 특정 조건에 따라 인라인 CSS 스타일을 동적으로 추가할 수 있습니다.

```blade
@php
    $isActive = true;
@endphp

<span @style([
    'background-color: red',
    'font-weight: bold' => $isActive,
])></span>

<span style="background-color: red; font-weight: bold;"></span>
```

<a name="additional-attributes"></a>
### 추가 속성

더 편리하게 HTML 체크박스가 "checked" 상태인지 표시하려면 `@checked` 디렉티브를 사용할 수 있습니다. 이 디렉티브는 조건이 `true`로 평가되면 `checked`를 에코합니다.

```blade
<input
    type="checkbox"
    name="active"
    value="active"
    @checked(old('active', $user->active))
/>
```

비슷하게, `@selected` 디렉티브를 사용하여 특정 select 옵션이 "selected"되어야 하는지 표시할 수 있습니다.

```blade
<select name="version">
    @foreach ($product->versions as $version)
        <option value="{{ $version }}" @selected(old('version') == $version)>
            {{ $version }}
        </option>
    @endforeach
</select>
```

또한, `@disabled` 디렉티브를 이용해 특정 요소가 "disabled" 상태여야 하는지를 지정할 수 있습니다.

```blade
<button type="submit" @disabled($errors->isNotEmpty())>Submit</button>
```

그리고, `@readonly` 디렉티브로 특정 입력 요소가 "readonly" 상태가 되도록 지정할 수 있습니다.

```blade
<input
    type="email"
    name="email"
    value="email@laravel.com"
    @readonly($user->isNotAdmin())
/>
```

게다가, `@required` 디렉티브를 사용해 특정 입력 요소가 "required" 상태가 되도록 만들 수 있습니다.

```blade
<input
    type="text"
    name="title"
    value="title"
    @required($user->isAdmin())
/>
```

<a name="including-subviews"></a>
### 서브뷰 포함하기

> [!NOTE]
> `@include` 디렉티브를 자유롭게 사용할 수 있지만, Blade의 [컴포넌트](#components)는 데이터 및 속성 바인딩 등 여러 장점이 있으므로 `@include` 디렉티브보다 더 좋은 선택일 수 있습니다.

Blade의 `@include` 디렉티브를 이용하면 하나의 Blade 뷰 내부에서 다른 뷰를 포함할 수 있습니다. 부모 뷰에서 사용 가능한 모든 변수는 포함된 뷰에서도 사용할 수 있게 됩니다.

```blade
<div>
    @include('shared.errors')

    <form>
        <!-- Form Contents -->
    </form>
</div>
```

포함된 뷰가 기본적으로 부모 뷰의 모든 데이터를 상속받지만, 추가로 포함된 뷰에서 사용할 별도의 데이터 배열을 전달할 수도 있습니다.

```blade
@include('view.name', ['status' => 'complete'])
```

만약 포함하려는 뷰가 존재하지 않으면 Laravel은 에러를 발생시킵니다. 뷰가 존재하지 않을 수도 있는 경우라면 `@includeIf` 디렉티브를 사용해야 합니다.

```blade
@includeIf('view.name', ['status' => 'complete'])
```

특정 불리언 표현식이 참 또는 거짓일 때만 뷰를 포함하고 싶다면, `@includeWhen` 및 `@includeUnless` 디렉티브를 사용할 수 있습니다.

```blade
@includeWhen($boolean, 'view.name', ['status' => 'complete'])

@includeUnless($boolean, 'view.name', ['status' => 'complete'])
```

여러 뷰 중 첫 번째로 존재하는 뷰를 포함하고 싶으면, `includeFirst` 디렉티브를 사용할 수 있습니다.

```blade
@includeFirst(['custom.admin', 'admin'], ['status' => 'complete'])
```

> [!WARNING]
> Blade 뷰 파일에서는 `__DIR__`와 `__FILE__` 상수 사용을 피해야 합니다. 해당 상수는 캐시되고 컴파일된 뷰의 위치를 참조하게 되므로 의도와 다를 수 있습니다.

<a name="rendering-views-for-collections"></a>

#### 컬렉션을 위한 뷰 렌더링

루프와 `include`를 한 줄로 결합하고 싶다면 Blade의 `@each` 디렉티브를 사용할 수 있습니다.

```blade
@each('view.name', $jobs, 'job')
```

`@each` 디렉티브의 첫 번째 인수는 배열 또는 컬렉션의 각 요소에 대해 렌더링할 뷰입니다. 두 번째 인수는 반복할 배열이나 컬렉션이고, 세 번째 인수는 해당 뷰 안에서 현재 반복 요소에 할당될 변수의 이름입니다. 예를 들어, `jobs`라는 배열을 반복할 때는 각 작업을 `job` 변수로 접근할 수 있게 됩니다. 반복 중인 요소의 배열 키는 뷰 내부에서 `key` 변수로 사용할 수 있습니다.

네 번째 인수를 추가로 전달할 수도 있습니다. 이 인수는 배열이 비어 있을 때 렌더링할 뷰를 지정합니다.

```blade
@each('view.name', $jobs, 'job', 'view.empty')
```

> [!WARNING]
> `@each`로 렌더링되는 뷰는 상위 뷰의 변수를 상속받지 않습니다. 만약 자식 뷰에서 이러한 변수들이 필요하다면, `@foreach`와 `@include` 디렉티브를 사용해야 합니다.

<a name="the-once-directive"></a>
### `@once` 디렉티브

`@once` 디렉티브를 사용하면 템플릿의 일부분을 렌더링 주기 당 한 번만 평가하도록 할 수 있습니다. 예를 들어, 반복문 안에서 [스택](#stacks)을 사용해 특정 JavaScript를 페이지의 헤더(머리글)에 한 번만 삽입하고 싶을 때 유용합니다. [컴포넌트](#components)를 루프 안에서 렌더링할 때, JS는 한 번만 헤더에 포함하고 싶은 경우가 있습니다.

```blade
@once
    @push('scripts')
        <script>
            // 여기에 사용자 정의 JavaScript 코드를 입력하세요...
        </script>
    @endpush
@endonce
```

`@once`는 주로 `@push` 또는 `@prepend`와 같이 자주 사용되므로, 이 작업을 더 편리하게 할 수 있는 `@pushOnce` 와 `@prependOnce` 디렉티브도 제공합니다.

```blade
@pushOnce('scripts')
    <script>
        // 여기에 사용자 정의 JavaScript 코드를 입력하세요...
    </script>
@endPushOnce
```

<a name="raw-php"></a>
### Raw PHP

특정 상황에서는 뷰에 PHP 코드를 직접 삽입하는 것이 유용할 수 있습니다. Blade의 `@php` 디렉티브를 사용하면 템플릿 내에서 순수 PHP 블록을 실행할 수 있습니다.

```blade
@php
    $counter = 1;
@endphp
```

또한, PHP 클래스를 불러오기(import)만 필요하다면 `@use` 디렉티브를 사용할 수 있습니다.

```blade
@use('App\Models\Flight')
```

`@use` 디렉티브에 두 번째 인수를 추가하면, 불러온 클래스에 별칭을 지정할 수도 있습니다.

```blade
@use('App\Models\Flight', 'FlightModel')
```

같은 네임스페이스 내 여러 클래스를 한 번에 불러올 수도 있습니다.

```blade
@use('App\Models\{Flight, Airport}')
```

또한 `@use` 디렉티브는 `function` 또는 `const`를 앞에 붙여 PHP 함수나 상수도 임포트할 수 있습니다.

```blade
@use(function App\Helpers\format_currency)
```

클래스 임포트와 마찬가지로, 함수나 상수도 별칭을 사용할 수 있습니다.

```blade
@use(function App\Helpers\format_currency, 'formatMoney')
@use(const App\Constants\MAX_ATTEMPTS, 'MAX_TRIES')
```

`function`이나 `const`로 그룹 임포트도 지원하므로, 동일한 네임스페이스에서 여러 심볼을 한 번에 불러올 수 있습니다.

```blade
@use(function App\Helpers\{format_currency, format_date})
@use(const App\Constants\{MAX_ATTEMPTS, DEFAULT_TIMEOUT})
```

<a name="comments"></a>
### 주석(Comment)

Blade에서는 뷰 내에 주석을 작성할 수 있습니다. HTML 주석과 달리, Blade 주석은 애플리케이션에서 렌더링된 HTML에 포함되지 않습니다.

```blade
{{-- 이 주석은 렌더링된 HTML에 표시되지 않습니다 --}}
```

<a name="components"></a>
## 컴포넌트(Components)

컴포넌트와 슬롯은 섹션, 레이아웃, include와 비슷한 이점이 있지만, 컴포넌트와 슬롯의 사고 방식이 더 쉽다고 느끼는 분들도 많습니다. 컴포넌트는 크게 클래스 기반 컴포넌트와 익명(Anonymous) 컴포넌트, 두 가지 방식으로 작성할 수 있습니다.

클래스 기반 컴포넌트를 만들려면, `make:component` Artisan 명령어를 사용할 수 있습니다. 사용 예시로 간단한 `Alert` 컴포넌트를 만들어 보겠습니다. 명령어를 실행하면, 해당 컴포넌트 클래스가 `app/View/Components` 디렉터리에 생성됩니다.

```shell
php artisan make:component Alert
```

이 명령은 컴포넌트의 뷰 템플릿도 함께 만들어주며, 해당 뷰는 `resources/views/components` 디렉터리에 위치하게 됩니다. 애플리케이션용 컴포넌트를 만들 경우 `app/View/Components`와 `resources/views/components` 디렉터리 내의 컴포넌트들은 자동으로 인식되므로, 별도의 등록 작업이 필요하지 않습니다.

하위 디렉터리 내에 컴포넌트를 생성할 수도 있습니다.

```shell
php artisan make:component Forms/Input
```

위 명령을 실행하면, `app/View/Components/Forms` 디렉터리에 `Input` 컴포넌트가, `resources/views/components/forms`에는 해당 뷰가 생성됩니다.

클래스 파일 없이 단독 Blade 템플릿만 갖는 익명 컴포넌트를 생성하고 싶다면, `make:component` 명령에 `--view` 옵션을 추가합니다.

```shell
php artisan make:component forms.input --view
```

이 명령은 `resources/views/components/forms/input.blade.php`에 Blade 파일을 생성하며, `<x-forms.input />`처럼 바로 컴포넌트로 사용할 수 있습니다.

<a name="manually-registering-package-components"></a>
#### 패키지 컴포넌트 수동 등록

자신의 애플리케이션용 컴포넌트는 앞서 설명한 대로 자동으로 인식됩니다.

하지만 Blade 컴포넌트를 사용하는 패키지를 만들 때는 컴포넌트 클래스와 HTML 태그 별칭(alias)을 직접 등록해야 합니다. 보통 패키지용 서비스 프로바이더의 `boot` 메서드 안에서 등록합니다.

```php
use Illuminate\Support\Facades\Blade;

/**
 * Bootstrap your package's services.
 */
public function boot(): void
{
    Blade::component('package-alert', Alert::class);
}
```

컴포넌트를 등록하면 HTML에서 지정한 태그 이름으로 컴포넌트를 렌더링할 수 있습니다.

```blade
<x-package-alert/>
```

또는 `componentNamespace` 메서드를 사용하면 컨벤션 기반으로 컴포넌트 클래스를 자동 로딩할 수도 있습니다. 예를 들어, `Nightshade` 패키지에 `Calendar`, `ColorPicker` 컴포넌트가 있고 이들이 `Package\Views\Components` 네임스페이스에 있다면 아래처럼 사용할 수 있습니다.

```php
use Illuminate\Support\Facades\Blade;

/**
 * Bootstrap your package's services.
 */
public function boot(): void
{
    Blade::componentNamespace('Nightshade\\Views\\Components', 'nightshade');
}
```

이렇게 등록하면, 패키지 네임스페이스를 활용한 `package-name::` 문법으로 컴포넌트를 사용할 수 있게 됩니다.

```blade
<x-nightshade::calendar />
<x-nightshade::color-picker />
```

Blade는 컴포넌트 이름을 pascal-case로 변환해 연결된 클래스 파일을 자동으로 감지합니다. 하위 디렉터리도 "점(dot) 표기법"으로 지원합니다.

<a name="rendering-components"></a>
### 컴포넌트 렌더링

Blade 템플릿에서 컴포넌트를 표시하려면, `x-`로 시작하고 하이픈(-)으로 이어지는 컴포넌트명 태그를 사용하면 됩니다.

```blade
<x-alert/>

<x-user-profile/>
```

컴포넌트 클래스가 `app/View/Components` 내에 더 깊게 중첩되어 있다면, 디렉터리 계층을 `.`(점)으로 구분해 표시할 수 있습니다. 예를 들어, `app/View/Components/Inputs/Button.php`에 컴포넌트가 있다면 아래와 같이 사용할 수 있습니다.

```blade
<x-inputs.button/>
```

컴포넌트 렌더링을 조건적으로 하고 싶다면, 컴포넌트 클래스에 `shouldRender` 메서드를 정의할 수 있습니다. 이 메서드가 `false`를 반환하면 해당 컴포넌트는 렌더링되지 않습니다.

```php
use Illuminate\Support\Str;

/**
 * Whether the component should be rendered
 */
public function shouldRender(): bool
{
    return Str::length($this->message) > 0;
}
```

<a name="index-components"></a>
### 인덱스 컴포넌트(Index Components)

여러 컴포넌트가 하나의 컴포넌트 그룹을 구성할 때, 관련 컴포넌트들을 동일 디렉터리 아래에 그룹화할 수 있습니다. 예를 들어 "card" 컴포넌트 그룹의 클래스 구조는 다음과 같을 수 있습니다.

```text
App\Views\Components\Card\Card
App\Views\Components\Card\Header
App\Views\Components\Card\Body
```

여기서, 루트 `Card` 컴포넌트가 `Card` 디렉터리에 위치하더라도 `<x-card.card>`처럼 반복되지 않고, 파일명과 디렉터리명이 동일하면 라라벨이 자동으로 해당 컴포넌트를 "루트" 컴포넌트로 인식하므로, 아래처럼 디렉터리명을 한 번만 지정해 사용할 수 있습니다.

```blade
<x-card>
    <x-card.header>...</x-card.header>
    <x-card.body>...</x-card.body>
</x-card>
```

<a name="passing-data-to-components"></a>
### 컴포넌트에 데이터 전달

Blade 컴포넌트에 데이터를 전달할 때는 HTML 속성(attribute)처럼 전달할 수 있습니다. 기본형(primitive) 값은 HTML 속성에 문자열로, PHP 표현식이나 변수는 속성명 앞에 `:`를 붙여서 전달합니다.

```blade
<x-alert type="error" :message="$message"/>
```

컴포넌트의 모든 데이터 속성은 컴포넌트 클래스의 생성자(constructor)에서 정의해야 합니다. 컴포넌트 내에 public(공개) 속성을 선언하면, 해당 속성은 자동으로 컴포넌트 뷰에서 사용할 수 있습니다. 그리고 `render` 메서드에서 뷰에게 직접 데이터를 전달할 필요는 없습니다.

```php
<?php

namespace App\View\Components;

use Illuminate\View\Component;
use Illuminate\View\View;

class Alert extends Component
{
    /**
     * 컴포넌트 인스턴스 생성자
     */
    public function __construct(
        public string $type,
        public string $message,
    ) {}

    /**
     * 컴포넌트를 나타내는 뷰/콘텐츠 반환
     */
    public function render(): View
    {
        return view('components.alert');
    }
}
```

컴포넌트가 렌더링될 때, 컴포넌트의 public 변수(속성)를 뷰 내에서 아래처럼 출력할 수 있습니다.

```blade
<div class="alert alert-{{ $type }}">
    {{ $message }}
</div>
```

<a name="casing"></a>
#### 이름 표기법(Casing)

컴포넌트 생성자 인수(매개변수)는 `camelCase`(카멜케이스)를 써야 하고, HTML 속성에서는 `kebab-case`(케밥케이스, 소문자와 하이픈)를 사용해야 합니다. 예시를 보겠습니다.

```php
/**
 * 컴포넌트 인스턴스 생성자
 */
public function __construct(
    public string $alertType,
) {}
```

이 경우 `$alertType` 인수는 아래처럼 컴포넌트로 전달할 수 있습니다.

```blade
<x-alert alert-type="danger" />
```

<a name="short-attribute-syntax"></a>
#### 단축 속성 문법(Short Attribute Syntax)

컴포넌트에 속성을 전달할 때 "단축 속성" 문법을 사용할 수 있습니다. 속성명과 변수명이 동일할 때 매우 편리합니다.

```blade
{{-- 단축 속성 문법 예시 --}}
<x-profile :$userId :$name />

{{-- 아래와 동일함 --}}
<x-profile :user-id="$userId" :name="$name" />
```

<a name="escaping-attribute-rendering"></a>
#### 속성 렌더링 이스케이프

Alpine.js와 같은 일부 JavaScript 프레임워크도 속성 앞에 `:`(콜론)을 사용하므로, 속성이 PHP 표현식이 아님을 Blade에 알리고 싶을 때는 `::`(콜론 두 개)를 붙이면 됩니다. 예시:

```blade
<x-button ::class="{ danger: isDeleting }">
    Submit
</x-button>
```

Blade가 렌더링한 HTML은 아래와 같습니다.

```blade
<button :class="{ danger: isDeleting }">
    Submit
</button>
```

<a name="component-methods"></a>
#### 컴포넌트 메서드

컴포넌트 템플릿에서는 public 변수뿐만 아니라 public 메서드도 사용할 수 있습니다. 예를 들어, 옵션이 현재 선택된 것인지 확인하는 `isSelected` 메서드가 있는 컴포넌트를 생각해봅시다.

```php
/**
 * 주어진 옵션이 현재 선택된 옵션인지 확인
 */
public function isSelected(string $option): bool
{
    return $option === $this->selected;
}
```

컴포넌트 템플릿에서 해당 메서드를 변수처럼 호출할 수 있습니다.

```blade
<option {{ $isSelected($value) ? 'selected' : '' }} value="{{ $value }}">
    {{ $label }}
</option>
```

<a name="using-attributes-slots-within-component-class"></a>
#### 컴포넌트 클래스 내부에서 속성과 슬롯 활용

Blade 컴포넌트에서는 컴포넌트 이름, 속성(attribute), 슬롯(slot) 등을 클래스의 `render` 메서드 내부에서 접근할 수 있습니다. 이 데이터에 접근하려면 `render` 메서드에서 클로저(Closure)를 반환해야 합니다.

```php
use Closure;

/**
 * 컴포넌트를 나타내는 뷰/콘텐츠 반환
 */
public function render(): Closure
{
    return function () {
        return '<div {{ $attributes }}>Components content</div>';
    };
}
```

이 클로저는, 인수로 `$data` 배열을 받을 수도 있습니다. 이 배열에는 컴포넌트의 다양한 정보가 들어 있습니다.

```php
return function (array $data) {
    // $data['componentName'];
    // $data['attributes'];
    // $data['slot'];

    return '<div {{ $attributes }}>Components content</div>';
}
```

> [!WARNING]
> `$data` 배열의 내용을 바로 Blade 문자열에 포함시키면, 악의적인 attribute 내용으로 인해 원격 코드 실행이 발생할 수 있으니 절대로 직접 포함해서는 안 됩니다.

`componentName`은 `x-` 접두사 이후 컴포넌트 태그에서 사용한 이름과 동일합니다. 예를 들어 `<x-alert />`의 `componentName`은 `alert`입니다. `attributes`는 해당 태그에 입력된 모든 속성을, `slot`은 슬롯(자식 콘텐츠)의 내용을 담은 `Illuminate\Support\HtmlString` 인스턴스를 의미합니다.

클로저는 문자열을 반환해야 하며, 반환된 문자열이 실제 뷰 파일명과 일치하면 해당 뷰를 렌더링하고, 그렇지 않으면 인라인 Blade 뷰로 평가됩니다.

<a name="additional-dependencies"></a>
#### 추가 의존성 주입

컴포넌트가 라라벨의 [서비스 컨테이너](/docs/12.x/container)에서 의존성을 필요로 한다면, 생성자에서 데이터 속성 앞에 나열하면 서비스 컨테이너가 자동으로 주입해줍니다.

```php
use App\Services\AlertCreator;

/**
 * 컴포넌트 인스턴스 생성자
 */
public function __construct(
    public AlertCreator $creator,
    public string $type,
    public string $message,
) {}
```

<a name="hiding-attributes-and-methods"></a>
#### 속성/메서드 숨기기

어떤 public 메서드나 속성을 컴포넌트 템플릿에서 변수로 노출하고 싶지 않다면, 컴포넌트 클래스에 `$except` 배열 속성을 추가하면 됩니다.

```php
<?php

namespace App\View\Components;

use Illuminate\View\Component;

class Alert extends Component
{
    /**
     * 템플릿에 노출하지 않을 속성/메서드
     *
     * @var array
     */
    protected $except = ['type'];

    /**
     * 컴포넌트 인스턴스 생성자
     */
    public function __construct(
        public string $type,
    ) {}
}
```

<a name="component-attributes"></a>
### 컴포넌트 속성(attributes)

앞서 데이터 속성을 컴포넌트에 전달하는 방법을 살펴보았습니다. 하지만 컴포넌트를 사용할 때, `class`와 같이 필수 데이터가 아닌 추가적인 HTML 속성도 지정하고 싶을 수 있습니다. 일반적으로 이러한 속성은 컴포넌트 뷰의 루트 요소에 넘기게 됩니다. 예를 들어, `alert` 컴포넌트를 아래와 같이 렌더링한다고 가정해보겠습니다.

```blade
<x-alert type="error" :message="$message" class="mt-4"/>
```

컴포넌트의 생성자에 포함되지 않은 모든 속성들은 "속성 집합(attribute bag)"에 자동으로 모이게 됩니다. 이 속성 집합은 컴포넌트 뷰에서 `$attributes` 변수로 접근할 수 있습니다. 아래와 같이 뷰에서 이 변수를 출력하면 모든 속성이 적용됩니다.

```blade
<div {{ $attributes }}>
    <!-- Component content -->
</div>
```

> [!WARNING]
> 현재로서는 `@env`와 같은 디렉티브를 컴포넌트 태그 내부에서 사용하는 것은 지원되지 않습니다. 예를 들어, `<x-alert :live="@env('production')"/>`와 같은 방식은 컴파일되지 않습니다.

<a name="default-merged-attributes"></a>
#### 기본값/병합된 속성

속성에 기본값을 넣거나, 속성값을 병합하고 싶을 때는 속성 집합의 `merge` 메서드를 사용하면 됩니다. 이 메서드는, 예를 들어 컴포넌트에 항상 적용되어야 하는 기본 CSS 클래스를 정의할 때 유용합니다.

```blade
<div {{ $attributes->merge(['class' => 'alert alert-'.$type]) }}>
    {{ $message }}
</div>
```

이 컴포넌트를 아래와 같이 사용한다면,

```blade
<x-alert type="error" :message="$message" class="mb-4"/>
```

최종적으로 렌더링되는 컴포넌트의 HTML은 아래와 같습니다.

```blade
<div class="alert alert-error mb-4">
    <!-- Contents of the $message variable -->
</div>
```

<a name="conditionally-merge-classes"></a>
#### 조건부 클래스 병합

특정 조건이 `true`일 때 클래스명을 병합하고 싶을 때는, `class` 메서드를 사용할 수 있습니다. 이 메서드는 배열을 받아, 키는 추가할 클래스명·클래스 배열이고 값은 추가 여부를 지정하는 불리언식입니다. 배열 키가 숫자라면 항상 클래스 목록에 포함됩니다.

```blade
<div {{ $attributes->class(['p-4', 'bg-red' => $hasError]) }}>
    {{ $message }}
</div>
```

다른 속성을 컴포넌트에 병합해야 한다면, `class` 메서드에 `merge`를 체이닝할 수 있습니다.

```blade
<button {{ $attributes->class(['p-4'])->merge(['type' => 'button']) }}>
    {{ $slot }}
</button>
```

> [!NOTE]
> 병합된 속성을 받지 않는 다른 HTML 요소에 조건부 클래스를 적용하려면 [@class 디렉티브](#conditional-classes)를 사용할 수 있습니다.

<a name="non-class-attribute-merging"></a>
#### class 이외 속성의 병합 방식

`class` 이외의 속성에서 `merge` 메서드를 사용할 때, 지정한 값은 속성의 "기본값"으로 간주됩니다. 하지만 `class`와 달리 이 속성들은 주입된 속성값과 병합되지 않고, 주입된 값이 있을 경우 덮어써집니다. 예를 들어, `button` 컴포넌트를 아래와 같이 만들 수 있습니다.

```blade
<button {{ $attributes->merge(['type' => 'button']) }}>
    {{ $slot }}
</button>
```

사용 시 원하는 `type`을 지정해서 렌더링할 수도 있고, 지정하지 않으면 기본값 `button`이 사용됩니다.

```blade
<x-button type="submit">
    Submit
</x-button>
```

이 경우, 렌더링된 HTML은 다음과 같습니다.

```blade
<button type="submit">
    Submit
</button>
```

`class` 이외의 속성에서 기본값과 주입값을 모두 한데 합쳐야 한다면, `prepends` 메서드를 사용할 수 있습니다. 예를 들어, `data-controller` 속성이 항상 `profile-controller`로 시작하고, 추가 주입값들은 그 뒤에 오게 하고 싶다면 아래처럼 작성합니다.

```blade
<div {{ $attributes->merge(['data-controller' => $attributes->prepends('profile-controller')]) }}>
    {{ $slot }}
</div>
```

<a name="filtering-attributes"></a>
#### 속성 검색 및 필터링

`filter` 메서드를 사용해 특정 조건에 맞는 속성만 걸러낼 수 있습니다. 이 메서드는 클로저를 인수로 받으며, 반환값이 `true`인 속성만 남게 됩니다.

```blade
{{ $attributes->filter(fn (string $value, string $key) => $key == 'foo') }}
```

또한, 보다 간편하게 `whereStartsWith` 메서드로 키가 특정 문자열로 시작하는 모든 속성을 가져올 수 있습니다.

```blade
{{ $attributes->whereStartsWith('wire:model') }}
```

반대로, `whereDoesntStartWith`로는 해당 문자열로 시작하지 않는 속성만 가져올 수 있습니다.

```blade
{{ $attributes->whereDoesntStartWith('wire:model') }}
```

`first` 메서드로는 속성 집합에서 첫 번째 속성을 출력할 수 있습니다.

```blade
{{ $attributes->whereStartsWith('wire:model')->first() }}
```

속성이 컴포넌트에 존재하는지 확인하려면 `has` 메서드를 사용할 수 있습니다. 이 메서드는 속성명을 인수로 받아서 존재 여부에 따라 true/false를 반환합니다.

```blade
@if ($attributes->has('class'))
    <div>Class attribute is present</div>
@endif
```

배열을 인수로 넘기면, 해당하는 모든 속성이 존재하는지 검사합니다.

```blade
@if ($attributes->has(['name', 'class']))
    <div>All of the attributes are present</div>
@endif
```

`hasAny` 메서드는 인수 중 하나만 존재해도 true를 반환합니다.

```blade
@if ($attributes->hasAny(['href', ':href', 'v-bind:href']))
    <div>One of the attributes is present</div>
@endif
```

특정 속성값을 가져오려면 `get` 메서드를 사용합니다.

```blade
{{ $attributes->get('class') }}
```

`only` 메서드는 주어진 키로만 구성된 속성 집합을 반환합니다.

```blade
{{ $attributes->only(['class']) }}
```

`except` 메서드는 지정한 키를 제외한 속성 집합을 반환합니다.

```blade
{{ $attributes->except(['class']) }}
```

<a name="reserved-keywords"></a>

### 예약된 키워드

기본적으로, 일부 키워드는 Blade의 내부 용도로 컴포넌트를 렌더링할 때 예약되어 있습니다. 아래의 키워드는 컴포넌트 내에서 public 속성이나 메서드명으로 정의할 수 없습니다.

<div class="content-list" markdown="1">

- `data`
- `render`
- `resolveView`
- `shouldRender`
- `view`
- `withAttributes`
- `withName`

</div>

<a name="slots"></a>
### 슬롯(Slot)

컴포넌트에 추가적인 콘텐츠를 전달해야 하는 경우가 많습니다. 이럴 때 "슬롯(slot)" 기능을 사용할 수 있습니다. 컴포넌트 슬롯은 `$slot` 변수를 출력하여 렌더링됩니다. 이 개념을 예시를 통해 살펴보겠습니다. `alert` 컴포넌트가 다음과 같은 마크업을 가지고 있다고 가정해 봅시다.

```blade
<!-- /resources/views/components/alert.blade.php -->

<div class="alert alert-danger">
    {{ $slot }}
</div>
```

아래와 같이 컴포넌트 내부에 컨텐츠를 삽입하여 `slot`에 값을 전달할 수 있습니다.

```blade
<x-alert>
    <strong>Whoops!</strong> Something went wrong!
</x-alert>
```

컴포넌트가 여러 위치에 다양한 슬롯을 렌더링해야 할 때도 있습니다. 예를 들어, "title" 슬롯을 주입할 수 있게 alert 컴포넌트를 수정해봅시다.

```blade
<!-- /resources/views/components/alert.blade.php -->

<span class="alert-title">{{ $title }}</span>

<div class="alert alert-danger">
    {{ $slot }}
</div>
```

명명된 슬롯(naming slot) 콘텐츠를 정의하려면 `x-slot` 태그를 사용합니다. 명시적으로 `x-slot` 태그로 감싸지 않은 모든 내용은 `$slot` 변수로 컴포넌트에 전달됩니다.

```xml
<x-alert>
    <x-slot:title>
        Server Error
    </x-slot>

    <strong>Whoops!</strong> Something went wrong!
</x-alert>
```

슬롯에 실제로 값이 들어 있는지 확인하려면, 슬롯의 `isEmpty` 메서드를 호출할 수 있습니다.

```blade
<span class="alert-title">{{ $title }}</span>

<div class="alert alert-danger">
    @if ($slot->isEmpty())
        This is default content if the slot is empty.
    @else
        {{ $slot }}
    @endif
</div>
```

또한, 슬롯에 HTML 주석이 아닌 실제 콘텐츠가 있는지 확인하려면 `hasActualContent` 메서드를 사용할 수 있습니다.

```blade
@if ($slot->hasActualContent())
    The scope has non-comment content.
@endif
```

<a name="scoped-slots"></a>
#### 스코프 슬롯(Scoped Slot)

Vue와 같은 JavaScript 프레임워크를 사용해본 적이 있다면 "스코프 슬롯(scoped slot)" 개념에 익숙할 수 있습니다. 이 기능은 슬롯 안에서 컴포넌트의 데이터나 메서드에 접근할 수 있도록 해줍니다. 라라벨에서도 컴포넌트에 public 메서드나 속성을 정의하고, 슬롯 내에서 `$component` 변수를 통해 해당 컴포넌트에 접근하여 비슷한 기능을 구현할 수 있습니다. 다음 예시에서 `x-alert` 컴포넌트 클래스에는 public `formatAlert` 메서드가 정의되어 있다고 가정합니다.

```blade
<x-alert>
    <x-slot:title>
        {{ $component->formatAlert('Server Error') }}
    </x-slot>

    <strong>Whoops!</strong> Something went wrong!
</x-alert>
```

<a name="slot-attributes"></a>
#### 슬롯 속성(Attribute)

Blade 컴포넌트와 마찬가지로, 슬롯에도 CSS 클래스명과 같은 [속성(attribute)](#component-attributes)을 추가할 수 있습니다.

```xml
<x-card class="shadow-sm">
    <x-slot:heading class="font-bold">
        Heading
    </x-slot>

    Content

    <x-slot:footer class="text-sm">
        Footer
    </x-slot>
</x-card>
```

슬롯의 속성과 상호작용하려면, 슬롯 변수의 `attributes` 속성에 접근할 수 있습니다. 속성에 대한 자세한 내용은 [컴포넌트 속성 문서](#component-attributes)를 참고하시기 바랍니다.

```blade
@props([
    'heading',
    'footer',
])

<div {{ $attributes->class(['border']) }}>
    <h1 {{ $heading->attributes->class(['text-lg']) }}>
        {{ $heading }}
    </h1>

    {{ $slot }}

    <footer {{ $footer->attributes->class(['text-gray-700']) }}>
        {{ $footer }}
    </footer>
</div>
```

<a name="inline-component-views"></a>
### 인라인 컴포넌트 뷰

매우 단순한 컴포넌트의 경우, 컴포넌트 클래스와 별도의 뷰 파일을 관리하는 것이 번거로울 수 있습니다. 이럴 때는 컴포넌트 클래스의 `render` 메서드에서 바로 마크업을 반환할 수 있습니다.

```php
/**
 * 컴포넌트를 나타내는 뷰 또는 콘텐츠를 반환합니다.
 */
public function render(): string
{
    return <<<'blade'
        <div class="alert alert-danger">
            {{ $slot }}
        </div>
    blade;
}
```

<a name="generating-inline-view-components"></a>
#### 인라인 뷰 컴포넌트 생성

인라인 뷰를 렌더링하는 컴포넌트를 만들려면, `make:component` 명령어 실행 시 `--inline` 옵션을 사용하면 됩니다.

```shell
php artisan make:component Alert --inline
```

<a name="dynamic-components"></a>
### 동적 컴포넌트

경우에 따라 어떤 컴포넌트를 렌더링할지 런타임에 결정해야 할 수 있습니다. 이런 상황에서는, 라라벨에 내장된 `dynamic-component` 컴포넌트를 이용해 런타임 값이나 변수에 따라 컴포넌트를 렌더링할 수 있습니다.

```blade
// $componentName = "secondary-button";

<x-dynamic-component :component="$componentName" class="mt-4" />
```

<a name="manually-registering-components"></a>
### 컴포넌트 수동 등록

> [!WARNING]
> 이 컴포넌트 수동 등록 문서는 주로 뷰 컴포넌트를 포함하는 라라벨 패키지 개발자에게 해당합니다. 일반적인 애플리케이션 개발에는 의미가 없을 수 있습니다.

자신의 애플리케이션에서 컴포넌트를 작성하는 경우, 컴포넌트는 기본적으로 `app/View/Components` 디렉터리와 `resources/views/components` 디렉터리에서 자동으로 발견됩니다.

하지만, Blade 컴포넌트를 사용하는 패키지를 개발하거나, 컴포넌트를 비표준 디렉터리에 둘 경우에는 컴포넌트 클래스와 그 HTML 태그 별칭을 직접 등록해 라라벨이 컴포넌트의 위치를 알 수 있도록 해야 합니다. 일반적으로는 패키지의 서비스 프로바이더의 `boot` 메서드에서 컴포넌트를 등록합니다.

```php
use Illuminate\Support\Facades\Blade;
use VendorPackage\View\Components\AlertComponent;

/**
 * 패키지 서비스 부트스트랩.
 */
public function boot(): void
{
    Blade::component('package-alert', AlertComponent::class);
}
```

컴포넌트가 등록되면 태그 별칭을 이용해 다음과 같이 렌더링할 수 있습니다.

```blade
<x-package-alert/>
```

#### 패키지 컴포넌트 자동 로딩

또 다른 방법으로, `componentNamespace` 메서드를 사용해 컨벤션에 따라 컴포넌트 클래스를 자동으로 로딩할 수도 있습니다. 예를 들어, `Nightshade` 패키지에 `Calendar`, `ColorPicker` 컴포넌트가 `Package\Views\Components` 네임스페이스에 정의되어 있다고 가정해 봅시다.

```php
use Illuminate\Support\Facades\Blade;

/**
 * 패키지 서비스 부트스트랩.
 */
public function boot(): void
{
    Blade::componentNamespace('Nightshade\\Views\\Components', 'nightshade');
}
```

이렇게 등록하면, `package-name::` 형식의 벤더 네임스페이스를 사용해 패키지 컴포넌트를 사용할 수 있습니다.

```blade
<x-nightshade::calendar />
<x-nightshade::color-picker />
```

Blade는 컴포넌트명을 파스칼케이스로 변환해 자동으로 연결된 클래스를 찾아줍니다. 하위 디렉터리도 "dot" 표기법을 사용해 지원합니다.

<a name="anonymous-components"></a>
## 익명 컴포넌트(Anonymous Component)

인라인 컴포넌트와 비슷하게, 익명 컴포넌트는 하나의 파일로 컴포넌트를 관리할 수 있는 방법을 제공합니다. 하지만 익명 컴포넌트는 별도의 클래스 없이 오직 뷰 파일만 존재합니다. 익명 컴포넌트를 정의하려면, 단순히 Blade 템플릿을 `resources/views/components` 디렉터리에 배치하시면 됩니다. 예를 들어 `resources/views/components/alert.blade.php`에 컴포넌트를 작성한 경우, 아래처럼 손쉽게 렌더링할 수 있습니다.

```blade
<x-alert/>
```

컴포넌트가 `components` 디렉터리 내부에 더 깊게 중첩되어 있다면, `.` (점) 문자를 사용해 렌더링할 수 있습니다. 예를 들어 `resources/views/components/inputs/button.blade.php` 파일이 있다면,

```blade
<x-inputs.button/>
```

처럼 사용할 수 있습니다.

<a name="anonymous-index-components"></a>
### 익명 인덱스 컴포넌트

여러 Blade 템플릿으로 구성된 복잡한 컴포넌트라면, 해당 컴포넌트의 템플릿들을 하나의 디렉터리로 묶고 싶을 때가 있습니다. 예를 들어, "아코디언" 컴포넌트가 아래와 같은 디렉터리 구조로 되어 있다고 가정합시다.

```text
/resources/views/components/accordion.blade.php
/resources/views/components/accordion/item.blade.php
```

이 구조라면 아래와 같이 아코디언 컴포넌트와 그 아이템을 렌더링할 수 있습니다.

```blade
<x-accordion>
    <x-accordion.item>
        ...
    </x-accordion.item>
</x-accordion>
```

하지만 `x-accordion` 태그로 렌더링하려면 아코디언의 "index" 컴포넌트 템플릿을 반드시 `resources/views/components` 디렉터리에 두어야 합니다. 다른 아코디언 관련 템플릿들과 같은 하위 디렉터리에 둘 수 없습니다.

다행히도, Blade에서는 컴포넌트 디렉터리 내부에, 디렉터리명과 동일한 이름의 파일을 두면, 해당 템플릿을 컴포넌트의 "루트" 요소로 렌더링할 수 있습니다. 즉, 위 예시와 완전히 동일한 Blade 문법을 사용할 수 있으면서, 디렉터리 구조는 다음처럼 구성할 수 있습니다.

```text
/resources/views/components/accordion/accordion.blade.php
/resources/views/components/accordion/item.blade.php
```

<a name="data-properties-attributes"></a>
### 데이터 속성 / Attribute

익명 컴포넌트는 별도의 클래스가 없기 때문에, 어느 데이터를 컴포넌트 변수로 전달하고, 어느 속성을 [attribute bag](#component-attributes)에 넣을지 구분하는 방법이 궁금할 수 있습니다.

이럴 때는, 컴포넌트 Blade 템플릿 상단에 `@props` 디렉티브를 사용하여 컨트롤할 수 있습니다. 여기서 지정한 속성들은 컴포넌트 변수로 전달되고, 그 외의 속성들은 attribute bag에 보관됩니다. 변수에 기본값을 주고 싶다면, 배열 키로 변수명을, 값으로 기본값을 지정하면 됩니다.

```blade
<!-- /resources/views/components/alert.blade.php -->

@props(['type' => 'info', 'message'])

<div {{ $attributes->merge(['class' => 'alert alert-'.$type]) }}>
    {{ $message }}
</div>
```

위 예시에 정의된 컴포넌트는 아래와 같이 사용할 수 있습니다.

```blade
<x-alert type="error" :message="$message" class="mb-4"/>
```

<a name="accessing-parent-data"></a>
### 부모 데이터 접근

자식 컴포넌트에서 부모 컴포넌트의 데이터를 참고하고 싶을 때도 있습니다. 이럴 때는 `@aware` 디렉티브를 사용하면 됩니다. 예를 들어, `<x-menu>`와 `<x-menu.item>`로 구성된 복잡한 메뉴 컴포넌트를 만든다고 가정해봅시다.

```blade
<x-menu color="purple">
    <x-menu.item>...</x-menu.item>
    <x-menu.item>...</x-menu.item>
</x-menu>
```

`<x-menu>` 컴포넌트는 다음과 같이 구현할 수 있습니다.

```blade
<!-- /resources/views/components/menu/index.blade.php -->

@props(['color' => 'gray'])

<ul {{ $attributes->merge(['class' => 'bg-'.$color.'-200']) }}>
    {{ $slot }}
</ul>
```

여기서 `color` 속성은 부모(`<x-menu>`)에만 전달되어 있으므로, 원래대로라면 `<x-menu.item>` 내부에서는 사용할 수 없습니다. 하지만 `@aware` 디렉티브를 사용하면, 해당 값을 자식 컴포넌트에서도 쓸 수 있습니다.

```blade
<!-- /resources/views/components/menu/item.blade.php -->

@aware(['color' => 'gray'])

<li {{ $attributes->merge(['class' => 'text-'.$color.'-800']) }}>
    {{ $slot }}
</li>
```

> [!WARNING]
> `@aware` 디렉티브는 부모 컴포넌트에 **명시적으로 HTML 속성으로** 전달된 값만 접근할 수 있습니다. 부모 컴포넌트의 `@props` 디폴트 값으로만 존재하는 속성은 자식 컴포넌트에서 `@aware`로 접근할 수 없습니다.

<a name="anonymous-component-paths"></a>
### 익명 컴포넌트 경로

이미 앞에서 설명한 것처럼, 익명 컴포넌트는 보통 `resources/views/components` 디렉터리에 Blade 템플릿을 두어 정의합니다. 그러나 경우에 따라 라라벨에 새로운 익명 컴포넌트 경로를 추가로 등록하고 싶을 수도 있습니다.

이때 `anonymousComponentPath` 메서드의 첫 번째 인수로 익명 컴포넌트가 존재하는 "경로"를, 두 번째 인수로는 컴포넌트들이 소속되는 "네임스페이스" (옵션)를 지정하면 됩니다. 이 메서드는 보통 애플리케이션의 [서비스 프로바이더](/docs/12.x/providers)의 `boot` 메서드 내에서 호출하는 것이 일반적입니다.

```php
/**
 * 애플리케이션 서비스 부트스트랩.
 */
public function boot(): void
{
    Blade::anonymousComponentPath(__DIR__.'/../components');
}
```

위 예시처럼 경로를 접두사 없이 등록하면, 해당 경로의 컴포넌트를 Blade에서 접두사 없이 바로 사용할 수 있습니다. 예를 들어, 위 경로에 `panel.blade.php`라는 컴포넌트가 있다면 다음과 같이 렌더링할 수 있습니다.

```blade
<x-panel />
```

`anonymousComponentPath` 메서드의 두 번째 인수로 접두사 형태의 네임스페이스를 줄 수도 있습니다.

```php
Blade::anonymousComponentPath(__DIR__.'/../components', 'dashboard');
```

이처럼 접두사를 설정하면, 해당 "네임스페이스"에 속한 컴포넌트는 렌더링 시 컴포넌트 네임스페이스를 컴포넌트 이름 앞에 붙여 사용합니다.

```blade
<x-dashboard::panel />
```

<a name="building-layouts"></a>
## 레이아웃 구성하기

<a name="layouts-using-components"></a>
### 컴포넌트 기반 레이아웃

대부분의 웹 애플리케이션은 다양한 페이지에서 동일한 레이아웃을 공유합니다. 만약 매번 뷰를 만들 때마다 전체 레이아웃의 HTML을 반복해서 작성해야 한다면 관리가 매우 힘들 것입니다. 다행히 [Blade 컴포넌트](#components)로 레이아웃을 정의해두고, 이것을 전체 애플리케이션에서 재사용할 수 있습니다.

<a name="defining-the-layout-component"></a>
#### 레이아웃 컴포넌트 정의하기

예를 들어, "할 일 목록(todo)" 애플리케이션을 만든다고 가정해 보겠습니다. 다음과 같이 `layout` 컴포넌트를 정의할 수 있습니다.

```blade
<!-- resources/views/components/layout.blade.php -->

<html>
    <head>
        <title>{{ $title ?? 'Todo Manager' }}</title>
    </head>
    <body>
        <h1>Todos</h1>
        <hr/>
        {{ $slot }}
    </body>
</html>
```

<a name="applying-the-layout-component"></a>
#### 레이아웃 컴포넌트 적용하기

`layout` 컴포넌트를 정의했다면, 이제 해당 컴포넌트를 사용하는 Blade 뷰를 만들어봅니다. 여기서는 간단히 할 일 목록을 출력하는 뷰를 정의해봅니다.

```blade
<!-- resources/views/tasks.blade.php -->

<x-layout>
    @foreach ($tasks as $task)
        <div>{{ $task }}</div>
    @endforeach
</x-layout>
```

이때 컴포넌트에 주입된 내용은 `layout` 컴포넌트 내에서 기본 슬롯 `$slot` 변수로 전달됩니다. 또, 만약 `$title` 슬롯이 별도로 주입된다면 해당 값을 사용하고, 없다면 기본 제목을 출력합니다. 아래 예시처럼, 뷰에서 표준 슬롯 문법으로 제목을 주입할 수도 있습니다. 자세한 문법은 [컴포넌트 문서](#components)를 참고해주세요.

```blade
<!-- resources/views/tasks.blade.php -->

<x-layout>
    <x-slot:title>
        Custom Title
    </x-slot>

    @foreach ($tasks as $task)
        <div>{{ $task }}</div>
    @endforeach
</x-layout>
```

이제 레이아웃과 할 일 목록 뷰를 모두 작성했다면, 라우트에서 `tasks` 뷰를 반환하기만 하면 됩니다.

```php
use App\Models\Task;

Route::get('/tasks', function () {
    return view('tasks', ['tasks' => Task::all()]);
});
```

<a name="layouts-using-template-inheritance"></a>
### 템플릿 상속 기반 레이아웃

<a name="defining-a-layout"></a>
#### 레이아웃 정의하기

레이아웃은 "템플릿 상속"을 통해서도 만들 수 있습니다. 이 방식은 [컴포넌트](#components)가 도입되기 이전 Blade의 전통적인 레이아웃 방식입니다.

먼저, 간단한 레이아웃 예제를 살펴봅시다. 웹 애플리케이션이 여러 페이지에서 동일한 레이아웃을 공유한다면, 다음과 같이 레이아웃을 정의할 수 있습니다.

```blade
<!-- resources/views/layouts/app.blade.php -->

<html>
    <head>
        <title>App Name - @yield('title')</title>
    </head>
    <body>
        @section('sidebar')
            This is the master sidebar.
        @show

        <div class="container">
            @yield('content')
        </div>
    </body>
</html>
```

이 파일은 일반적인 HTML 마크업을 담고 있지만, 여기서 `@section`과 `@yield` 디렉티브에 주목하시기 바랍니다. `@section`은 특정 콘텐츠 영역을 정의하고, `@yield`는 해당 영역의 콘텐츠를 나타내는 역할을 합니다.

이제 레이아웃이 준비되었으니, 이 레이아웃을 상속하는 자식 페이지를 만들어보겠습니다.

<a name="extending-a-layout"></a>
#### 레이아웃 확장하기

자식 뷰를 정의할 때는, `@extends` Blade 디렉티브를 통해 상속할 레이아웃을 지정합니다. Blade 레이아웃을 상속한 뷰에서는 `@section` 디렉티브로 레이아웃의 각 영역(`section`)에 내용을 주입할 수 있습니다. 앞 예시와 같이, 이 영역의 내용은 레이아웃의 `@yield`를 통해 출력됩니다.

```blade
<!-- resources/views/child.blade.php -->

@extends('layouts.app')

@section('title', 'Page Title')

@section('sidebar')
    @@parent

    <p>This is appended to the master sidebar.</p>
@endsection

@section('content')
    <p>This is my body content.</p>
@endsection
```

이 예시에서, `sidebar` 영역에서는 `@@parent` 디렉티브를 사용해 레이아웃 사이드바에 내용을 "덧붙이고"(덮어쓰는 게 아님), 렌더링 시 레이아웃의 내용이 `@@parent`로 교체됩니다.

> [!NOTE]
> 앞선 예시와는 달리, 본문의 `sidebar` 영역은 `@show` 대신 `@endsection`으로 끝납니다. `@endsection`은 단순히 영역을 정의만 하지만, `@show`는 영역을 정의하면서 **즉시 출력**합니다.

또한, `@yield` 디렉티브는 두 번째 파라미터로 기본값도 받을 수 있습니다. 해당 영역이 정의되어 있지 않으면 이 값이 출력됩니다.

```blade
@yield('content', 'Default content')
```

<a name="forms"></a>
## 폼(Forms)

<a name="csrf-field"></a>
### CSRF 필드

애플리케이션에서 HTML 폼을 정의할 때에는, 반드시 폼에 숨겨진 CSRF 토큰 필드를 추가해야 [CSRF 보호 미들웨어](/docs/12.x/csrf)가 요청을 검증할 수 있습니다. `@csrf` Blade 디렉티브를 이용해 CSRF 토큰 필드를 쉽게 생성할 수 있습니다.

```blade
<form method="POST" action="/profile">
    @csrf

    ...
</form>
```

<a name="method-field"></a>
### Method 필드

HTML 폼에서는 `PUT`, `PATCH`, `DELETE` 요청을 직접 만들 수 없습니다. 이럴 때는 숨겨진 `_method` 필드를 추가해 HTTP 메서드를 흉내내야 합니다. `@method` Blade 디렉티브가 이를 대신 만들어 줍니다.

```blade
<form action="/foo/bar" method="POST">
    @method('PUT')

    ...
</form>
```

<a name="validation-errors"></a>
### 유효성 검증 에러(Validation Errors)

`@error` 디렉티브는 입력값의 [유효성 검증 에러 메시지](/docs/12.x/validation#quick-displaying-the-validation-errors)가 존재하는지 쉽게 확인할 수 있게 해줍니다. `@error` 블록 내부에서는 `$message` 변수를 사용해 에러 메시지를 출력할 수 있습니다.

```blade
<!-- /resources/views/post/create.blade.php -->

<label for="title">Post Title</label>

<input
    id="title"
    type="text"
    class="@error('title') is-invalid @enderror"
/>

@error('title')
    <div class="alert alert-danger">{{ $message }}</div>
@enderror
```

`@error` 디렉티브는 실제로 "if"문으로 컴파일되므로, `@else` 디렉티브를 사용하면 해당 입력값에 에러가 없을 때의 내용을 출력할 수도 있습니다.

```blade
<!-- /resources/views/auth.blade.php -->

<label for="email">Email address</label>

<input
    id="email"
    type="email"
    class="@error('email') is-invalid @else is-valid @enderror"
/>
```

[특정 에러백(namaed error bag)](/docs/12.x/validation#named-error-bags)의 이름을 `@error` 디렉티브의 두 번째 파라미터로 전달하면, 여러 개의 폼이 있는 페이지에서 해당 에러백의 검증 에러 메시지만 가져올 수도 있습니다.

```blade
<!-- /resources/views/auth.blade.php -->

<label for="email">Email address</label>

<input
    id="email"
    type="email"
    class="@error('email', 'login') is-invalid @enderror"
/>

@error('email', 'login')
    <div class="alert alert-danger">{{ $message }}</div>
@enderror
```

<a name="stacks"></a>

## 스택(Stacks)

Blade에서는 명명된 스택에 내용을 추가할 수 있으며, 이 내용은 다른 뷰나 레이아웃의 원하는 위치에서 렌더링할 수 있습니다. 이 기능은 자식 뷰에서 필요한 JavaScript 라이브러리를 지정할 때 특히 유용합니다.

```blade
@push('scripts')
    <script src="/example.js"></script>
@endpush
```

특정 불린(boolean) 표현식이 `true`로 평가될 때만 `@push`를 실행하고 싶다면, `@pushIf` 지시어를 사용할 수 있습니다.

```blade
@pushIf($shouldPush, 'scripts')
    <script src="/example.js"></script>
@endPushIf
```

스택에는 원하는 만큼 여러 번 내용을 추가할 수 있습니다. 스택의 전체 내용을 렌더링하려면, `@stack` 지시어에 스택의 이름을 전달하면 됩니다.

```blade
<head>
    <!-- Head Contents -->

    @stack('scripts')
</head>
```

스택의 맨 앞쪽에 내용을 추가하고 싶다면, `@prepend` 지시어를 사용하면 됩니다.

```blade
@push('scripts')
    This will be second...
@endpush

// 이후에...

@prepend('scripts')
    This will be first...
@endprepend
```

<a name="service-injection"></a>
## 서비스 주입(Service Injection)

`@inject` 지시어를 사용하면 라라벨의 [서비스 컨테이너](/docs/12.x/container)에서 서비스를 가져올 수 있습니다. `@inject`에 전달하는 첫 번째 인수는 서비스가 할당될 변수 이름이며, 두 번째 인수는 주입을 원하는 서비스의 클래스 또는 인터페이스 이름입니다.

```blade
@inject('metrics', 'App\Services\MetricsService')

<div>
    Monthly Revenue: {{ $metrics->monthlyRevenue() }}.
</div>
```

<a name="rendering-inline-blade-templates"></a>
## 인라인 Blade 템플릿 렌더링

간혹 Blade 템플릿 문자열 원본을 유효한 HTML로 변환해야 하는 경우가 있습니다. 이럴 때는 `Blade` 파사드에서 제공하는 `render` 메서드를 활용할 수 있습니다. `render` 메서드는 Blade 템플릿 문자열과, 옵션으로 템플릿에서 사용할 데이터를 배열로 받아 처리합니다.

```php
use Illuminate\Support\Facades\Blade;

return Blade::render('Hello, {{ $name }}', ['name' => 'Julian Bashir']);
```

라라벨은 인라인 Blade 템플릿을 렌더링할 때 임시로 해당 내용을 `storage/framework/views` 디렉토리에 저장합니다. 만약 Blade 템플릿 렌더링 후 이러한 임시 파일을 자동으로 삭제하고 싶다면, `deleteCachedView` 인자를 전달할 수 있습니다.

```php
return Blade::render(
    'Hello, {{ $name }}',
    ['name' => 'Julian Bashir'],
    deleteCachedView: true
);
```

<a name="rendering-blade-fragments"></a>
## Blade 프래그먼트(Rendering Blade Fragments) 렌더링

[Tubro](https://turbo.hotwired.dev/)나 [htmx](https://htmx.org/) 같은 프론트엔드 프레임워크를 사용할 때, HTTP 응답에서 Blade 템플릿의 일부분만 반환해야 할 때가 있습니다. Blade의 "프래그먼트(Fragment)" 기능을 사용하면 이러한 요구를 쉽게 처리할 수 있습니다. 먼저, Blade 템플릿의 일부 구간을 `@fragment`와 `@endfragment` 지시어로 감쌉니다.

```blade
@fragment('user-list')
    <ul>
        @foreach ($users as $user)
            <li>{{ $user->name }}</li>
        @endforeach
    </ul>
@endfragment
```

이후 이 템플릿을 사용하는 뷰를 렌더링할 때, 반환할 프래그먼트 이름을 `fragment` 메서드로 지정하면 해당 프래그먼트만 HTTP 응답에 포함됩니다.

```php
return view('dashboard', ['users' => $users])->fragment('user-list');
```

`fragmentIf` 메서드를 사용하면 지정한 조건에 따라 뷰의 특정 프래그먼트만 반환하도록 할 수 있습니다. 조건이 참이 아니면 전체 뷰가 반환됩니다.

```php
return view('dashboard', ['users' => $users])
    ->fragmentIf($request->hasHeader('HX-Request'), 'user-list');
```

`fragments`와 `fragmentsIf` 메서드를 이용하면 여러 프래그먼트를 한 번에 반환할 수 있습니다. 이 경우 프래그먼트들이 하나로 이어져서 반환됩니다.

```php
view('dashboard', ['users' => $users])
    ->fragments(['user-list', 'comment-list']);

view('dashboard', ['users' => $users])
    ->fragmentsIf(
        $request->hasHeader('HX-Request'),
        ['user-list', 'comment-list']
    );
```

<a name="extending-blade"></a>
## Blade 확장하기

Blade는 `directive` 메서드를 통해 직접 커스텀 지시어(directive)를 정의할 수 있습니다. Blade 컴파일러가 커스텀 지시어를 만나면, 해당 지시어에 포함된 표현식을 콜백 함수로 전달해서 실행시킵니다.

다음 예시는 전달된 `$var` 값(반드시 `DateTime` 인스턴스여야 함)을 원하는 형태로 포맷하는 `@datetime($var)` 지시어를 만드는 방법입니다.

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // ...
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Blade::directive('datetime', function (string $expression) {
            return "<?php echo ($expression)->format('m/d/Y H:i'); ?>";
        });
    }
}
```

위의 예시처럼, 전달된 표현식에 `format` 메서드를 체이닝하여 PHP 코드를 생성합니다. 즉, 최종적으로 이 지시어에서 생성된 PHP 코드는 다음과 같습니다.

```php
<?php echo ($var)->format('m/d/Y H:i'); ?>
```

> [!WARNING]
> Blade 지시어의 로직을 수정한 경우, **모든 Blade 캐시 뷰를 삭제해야 합니다.** 캐시된 뷰는 `view:clear` 아티즌 명령어로 삭제할 수 있습니다.

<a name="custom-echo-handlers"></a>
### 커스텀 이코 핸들러(Custom Echo Handlers)

Blade에서 객체를 `echo`하려고 시도하면, 그 객체의 `__toString` 메서드가 호출됩니다. [`__toString`](https://www.php.net/manual/en/language.oop5.magic.php#object.tostring) 메서드는 PHP의 내장 "매직 메서드" 중 하나입니다. 하지만, 상호작용 중인 클래스가 서드 파티 라이브러리에 소속되어 있다면, 해당 클래스의 `__toString` 메서드를 직접 컨트롤할 수 없는 경우도 있습니다.

이럴 때는, 특정 타입의 객체에 대해 커스텀 이코 핸들러를 등록할 수 있습니다. 이를 위해 Blade의 `stringable` 메서드를 호출하면 됩니다. `stringable` 메서드는 클로저를 인수로 받으며, 이 클로저의 파라미터 타입힌트로 맡을 객체 타입을 명시해야 합니다. 일반적으로 `stringable` 메서드는 앱의 `AppServiceProvider` 클래스의 `boot` 메서드 안에서 정의합니다.

```php
use Illuminate\Support\Facades\Blade;
use Money\Money;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Blade::stringable(function (Money $money) {
        return $money->formatTo('en_GB');
    });
}
```

이제 커스텀 이코 핸들러가 정의된 뒤에는, Blade 템플릿에서 해당 객체를 단순히 `{{ }}`로 출력하는 것만으로도 처리가 가능해집니다.

```blade
Cost: {{ $money }}
```

<a name="custom-if-statements"></a>
### 커스텀 If 조건문(Custom If Statements)

커스텀 지시어를 직접 만드는 것은 복잡할 수 있으며, 단순한 커스텀 조건문이 필요할 때에는 Blade의 `Blade::if` 메서드를 통해 클로저 기반의 조건 지시어를 간단히 등록할 수 있습니다. 예를 들어, 애플리케이션의 기본 "디스크" 설정을 검사하는 커스텀 조건문을 정의해 보겠습니다. 이 또한 `AppServiceProvider`의 `boot` 메서드에서 구현할 수 있습니다.

```php
use Illuminate\Support\Facades\Blade;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Blade::if('disk', function (string $value) {
        return config('filesystems.default') === $value;
    });
}
```

이제 커스텀 조건문이 정의되었으니, 템플릿 내에서 아래와 같이 사용할 수 있습니다.

```blade
@disk('local')
    <!-- 애플리케이션이 local 디스크를 사용하고 있습니다... -->
@elsedisk('s3')
    <!-- 애플리케이션이 s3 디스크를 사용하고 있습니다... -->
@else
    <!-- 그 외 다른 디스크를 사용하고 있습니다... -->
@enddisk

@unlessdisk('local')
    <!-- 애플리케이션이 local 디스크를 사용하고 있지 않습니다... -->
@enddisk
```