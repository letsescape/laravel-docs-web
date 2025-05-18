# 블레이드 템플릿 (Blade Templates)

- [소개](#introduction)
    - [Livewire로 블레이드 확장하기](#supercharging-blade-with-livewire)
- [데이터 표시](#displaying-data)
    - [HTML 엔터티 인코딩](#html-entity-encoding)
    - [블레이드와 자바스크립트 프레임워크](#blade-and-javascript-frameworks)
- [블레이드 디렉티브](#blade-directives)
    - [If 문](#if-statements)
    - [Switch 문](#switch-statements)
    - [반복문](#loops)
    - [루프 변수](#the-loop-variable)
    - [조건부 클래스](#conditional-classes)
    - [추가 속성](#additional-attributes)
    - [서브뷰 포함하기](#including-subviews)
    - [`@once` 디렉티브](#the-once-directive)
    - [원시 PHP](#raw-php)
    - [주석](#comments)
- [컴포넌트](#components)
    - [컴포넌트 렌더링](#rendering-components)
    - [인덱스 컴포넌트](#index-components)
    - [컴포넌트에 데이터 전달](#passing-data-to-components)
    - [컴포넌트 속성](#component-attributes)
    - [예약어](#reserved-keywords)
    - [슬롯](#slots)
    - [인라인 컴포넌트 뷰](#inline-component-views)
    - [동적 컴포넌트](#dynamic-components)
    - [컴포넌트 수동 등록](#manually-registering-components)
- [익명 컴포넌트](#anonymous-components)
    - [익명 인덱스 컴포넌트](#anonymous-index-components)
    - [데이터 속성 / Attribute](#data-properties-attributes)
    - [부모 데이터 접근](#accessing-parent-data)
    - [익명 컴포넌트 경로](#anonymous-component-paths)
- [레이아웃 만들기](#building-layouts)
    - [컴포넌트로 레이아웃 구성](#layouts-using-components)
    - [템플릿 상속으로 레이아웃 구성](#layouts-using-template-inheritance)
- [폼](#forms)
    - [CSRF 필드](#csrf-field)
    - [메서드 필드](#method-field)
    - [유효성 검증 에러](#validation-errors)
- [스택](#stacks)
- [서비스 주입](#service-injection)
- [인라인 블레이드 템플릿 렌더링](#rendering-inline-blade-templates)
- [블레이드 프래그먼트 렌더링](#rendering-blade-fragments)
- [블레이드 확장하기](#extending-blade)
    - [커스텀 에코 핸들러](#custom-echo-handlers)
    - [커스텀 If 문](#custom-if-statements)

<a name="introduction"></a>
## 소개

블레이드는 라라벨에 기본 포함되어 있는 간단하면서도 강력한 템플릿 엔진입니다. 일부 PHP 템플릿 엔진과 달리, 블레이드는 템플릿 파일 내에서 일반 PHP 코드를 자유롭게 사용할 수 있도록 제한하지 않습니다. 실제로, 모든 블레이드 템플릿은 일반 PHP 코드로 컴파일되어 변경 전까지 캐시되므로, 블레이드는 애플리케이션에 거의 성능 저하 없이 동작합니다. 블레이드 템플릿 파일은 `.blade.php` 확장자를 사용하며, 일반적으로 `resources/views` 디렉터리에 저장됩니다.

블레이드 뷰는 라우트나 컨트롤러에서 글로벌 `view` 헬퍼를 사용해 반환할 수 있습니다. 물론, [뷰](/docs/11.x/views) 문서에서 다뤄진 것처럼 `view` 헬퍼의 두 번째 인수를 통해 데이터를 블레이드 뷰로 전달할 수도 있습니다.

```
Route::get('/', function () {
    return view('greeting', ['name' => 'Finn']);
});
```

<a name="supercharging-blade-with-livewire"></a>
### Livewire로 블레이드 확장하기

블레이드 템플릿을 한 단계 더 발전시키고 동적인 인터페이스를 손쉽게 만들어보고 싶으신가요? [Laravel Livewire](https://livewire.laravel.com)를 참고해보세요. Livewire를 사용하면 일반적으로 프론트엔드 프레임워크(React, Vue 등)에서만 가능했던 동적 기능이 값에 의해 보강된 Blade 컴포넌트를 작성할 수 있습니다. 이를 통해 별도의 복잡한 자바스크립트 프레임워크의 클라이언트 렌더링이나 빌드 과정 없이도 현대적인 반응형 프론트엔드를 훨씬 수월하게 구현할 수 있습니다.

<a name="displaying-data"></a>
## 데이터 표시

블레이드 뷰로 전달된 데이터를 중괄호로 감싸서 표시할 수 있습니다. 예를 들어 아래와 같은 라우트가 있다고 가정해보겠습니다.

```
Route::get('/', function () {
    return view('welcome', ['name' => 'Samantha']);
});
```

`name` 변수의 내용을 뷰에서 이렇게 출력할 수 있습니다.

```blade
Hello, {{ $name }}.
```

> [!NOTE]  
> 블레이드의 `{{ }}` 에코 구문은 XSS 공격을 방지하기 위해 PHP의 `htmlspecialchars` 함수로 자동 변환 처리됩니다.

뷰에 전달된 변수 내용만 표시하는 데에 국한되지 않습니다. 어떤 PHP 함수의 결과도 에코할 수 있으며, 실제로 블레이드 에코 구문 내에 원하는 PHP 코드를 자유롭게 넣을 수 있습니다.

```blade
The current UNIX timestamp is {{ time() }}.
```

<a name="html-entity-encoding"></a>
### HTML 엔터티 인코딩

기본적으로, 블레이드(그리고 라라벨의 `e` 함수)는 HTML 엔터티를 이중으로 인코딩합니다. 이중 인코딩을 비활성화하고 싶다면, `AppServiceProvider`의 `boot` 메서드에서 `Blade::withoutDoubleEncoding` 메서드를 호출하면 됩니다.

```
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
#### 이스케이프 되지 않은 데이터 표시

기본적으로 블레이드의 `{{ }}` 문은 XSS 공격을 막기 위해 PHP의 `htmlspecialchars` 함수로 자동 이스케이프됩니다. 만약 데이터를 이스케이프 없이 그대로 출력하고 싶다면, 다음과 같은 구문을 사용할 수 있습니다.

```blade
Hello, {!! $name !!}.
```

> [!WARNING]  
> 사용자로부터 입력받은 데이터를 에코할 때는 특히 주의해야 합니다. 사용자 제공 데이터를 표시할 때는 반드시 XSS 공격을 막기 위해 이스케이프된 중괄호(`{{ }}`) 구문을 사용하는 것이 안전합니다.

<a name="blade-and-javascript-frameworks"></a>
### 블레이드와 자바스크립트 프레임워크

많은 자바스크립트 프레임워크 역시 "중괄호"를 이용해 브라우저에 표현식을 표시하도록 합니다. 이럴 때, 블레이드 렌더링 엔진에 해당 표현식을 건드리지 말라고 알리려면 `@` 심볼을 사용할 수 있습니다. 예를 들면 다음과 같습니다.

```blade
<h1>Laravel</h1>

Hello, @{{ name }}.
```

위 예제에서는 블레이드가 `@` 심볼을 제거하고, `{{ name }}` 표현식은 그대로 남아 자바스크립트 프레임워크에서 렌더링될 수 있습니다.

`@` 심볼은 블레이드 디렉티브를 이스케이프할 때에도 사용할 수 있습니다.

```blade
{{-- Blade template --}}
@@if()

<!-- HTML output -->
@if()
```

<a name="rendering-json"></a>
#### JSON 렌더링

때때로 뷰에 배열을 전달해 자바스크립트 변수를 초기화할 목적으로 JSON으로 출력하고 싶을 때가 있습니다. 예를 들면 아래와 같습니다.

```blade
<script>
    var app = <?php echo json_encode($array); ?>;
</script>
```

하지만 직접 `json_encode`를 호출하는 대신, `Illuminate\Support\Js::from` 메서드 디렉티브를 사용할 수 있습니다. `from` 메서드는 PHP의 `json_encode` 함수와 동일한 인수를 받지만, HTML 안에서 안전하게 사용할 수 있도록 JSON이 올바르게 이스케이프되도록 보장합니다. 이 메서드는 주어진 객체나 배열을 유효한 JavaScript 객체로 변환하는 `JSON.parse` 자바스크립트 구문을 반환합니다.

```blade
<script>
    var app = {{ Illuminate\Support\Js::from($array) }};
</script>
```

최신 버전의 라라벨 애플리케이션 스켈레톤에서는 `Js` 파사드를 포함하고 있어, 블레이드 템플릿에서 좀 더 편리하게 이 기능을 사용할 수 있습니다.

```blade
<script>
    var app = {{ Js::from($array) }};
</script>
```

> [!WARNING]  
> `Js::from` 메서드는 이미 생성된 변수를 JSON으로 변환할 때만 사용해야 합니다. 블레이드 템플릿은 정규 표현식을 기반으로 동작하므로, 복잡한 표현식을 전달하면 예기치 않은 오류가 발생할 수 있습니다.

<a name="the-at-verbatim-directive"></a>
#### `@verbatim` 디렉티브

블레이드 템플릿의 상당 부분에서 자바스크립트 변수를 표시해야 하는 경우, 각각의 블레이드 에코 구문 앞에 `@` 심볼을 일일이 붙이지 않고도 사용할 수 있도록, 해당 HTML을 `@verbatim` 디렉티브로 감쌀 수 있습니다.

```blade
@verbatim
    <div class="container">
        Hello, {{ name }}.
    </div>
@endverbatim
```

<a name="blade-directives"></a>
## 블레이드 디렉티브

블레이드는 템플릿 상속 및 데이터 표시 외에도 조건문, 반복문 등 자주 사용하는 PHP 제어문에 대해 간결한 문법의 디렉티브를 제공합니다. 이러한 단축 구문을 사용하면 PHP 문법과 거의 동일한 친숙함은 유지하면서, 매우 깔끔하고 코드량이 적은 방식으로 제어문을 다룰 수 있습니다.

<a name="if-statements"></a>
### If 문

`@if`, `@elseif`, `@else`, `@endif` 디렉티브를 이용해 조건문을 생성할 수 있습니다. 이 디렉티브들은 PHP의 if문과 작동 방식이 완전히 동일합니다.

```blade
@if (count($records) === 1)
    I have one record!
@elseif (count($records) > 1)
    I have multiple records!
@else
    I don't have any records!
@endif
```

추가로 편리하게 사용할 수 있는 `@unless` 디렉티브도 지원합니다.

```blade
@unless (Auth::check())
    You are not signed in.
@endunless
```

앞서 설명한 조건문 디렉티브 외에도, 각각의 PHP 함수의 단축 구문으로 `@isset`과 `@empty` 디렉티브를 사용할 수 있습니다.

```blade
@isset($records)
    // $records가 정의되어 있고 null이 아님...
@endisset

@empty($records)
    // $records가 "비어 있음"...
@endempty
```

<a name="authentication-directives"></a>
#### 인증 관련 디렉티브

`@auth`와 `@guest` 디렉티브를 사용하여 현재 사용자가 [인증된 상태](/docs/11.x/authentication)인지 혹은 게스트인지를 빠르게 확인할 수 있습니다.

```blade
@auth
    // 사용자가 인증됨...
@endauth

@guest
    // 사용자가 인증되지 않음...
@endguest
```

필요하다면, `@auth`와 `@guest` 디렉티브에 인증 가드를 지정하여 검사할 수도 있습니다.

```blade
@auth('admin')
    // 사용자가 인증됨...
@endauth

@guest('admin')
    // 사용자가 인증되지 않음...
@endguest
```

<a name="environment-directives"></a>
#### 환경(Environment) 관련 디렉티브

애플리케이션이 실제 운영(Production) 환경에서 실행 중인지 확인하려면, `@production` 디렉티브를 사용할 수 있습니다.

```blade
@production
    // 운영 환경에만 표시할 내용...
@endproduction
```

또는, 애플리케이션이 특정 환경에서 실행 중인지 확인하려면 `@env` 디렉티브를 사용할 수 있습니다.

```blade
@env('staging')
    // 현재 애플리케이션이 "staging" 환경에서 동작 중...
@endenv

@env(['staging', 'production'])
    // "staging" 또는 "production" 환경에서 동작 중...
@endenv
```

<a name="section-directives"></a>
#### Section 디렉티브

템플릿 상속에서 특정 section에 컨텐츠가 정의되어 있는지, `@hasSection` 디렉티브로 확인할 수 있습니다.

```blade
@hasSection('navigation')
    <div class="pull-right">
        @yield('navigation')
    </div>

    <div class="clearfix"></div>
@endif
```

반대로 section에 컨텐츠가 없을 때를 확인하고 싶다면 `sectionMissing` 디렉티브를 사용할 수 있습니다.

```blade
@sectionMissing('navigation')
    <div class="pull-right">
        @include('default-navigation')
    </div>
@endif
```

<a name="session-directives"></a>
#### 세션(Session) 디렉티브

`@session` 디렉티브를 사용하면 [세션](/docs/11.x/session) 값이 존재하는지 확인할 수 있습니다. 세션 값이 존재하면, `@session`과 `@endsession` 사이의 내용을 렌더링합니다. 이 블록 내부에서는 세션 값을 `$value` 변수로 참조할 수 있습니다.

```blade
@session('status')
    <div class="p-4 bg-green-100">
        {{ $value }}
    </div>
@endsession
```

<a name="switch-statements"></a>
### Switch 문

`@switch`, `@case`, `@break`, `@default`, `@endswitch` 디렉티브를 이용해 switch 문을 작성할 수 있습니다.

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

블레이드는 조건문 외에도 PHP의 다양한 반복문 구조를 편리하게 사용할 수 있는 디렉티브를 제공합니다. 각 디렉티브는 PHP의 for, foreach, while 반복문과 완전히 동일하게 작동합니다.

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
> `foreach` 반복문 내부에서는 [루프 변수](#the-loop-variable)를 사용해 현재 루프의 첫 번째 또는 마지막 순회인지 등 다양한 정보를 얻을 수 있습니다.

반복문을 사용할 때, 특정 반복을 건너뛰거나 반복문을 끝내고 싶다면 `@continue`와 `@break` 디렉티브를 사용할 수 있습니다.

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

또는, 조건식을 디렉티브 선언부에 직접 포함시킬 수도 있습니다.

```blade
@foreach ($users as $user)
    @continue($user->type == 1)

    <li>{{ $user->name }}</li>

    @break($user->number == 5)
@endforeach
```

<a name="the-loop-variable"></a>
### 루프 변수

`foreach` 반복문을 순회할 때, 루프 내부에서 `$loop` 변수를 사용할 수 있습니다. 이 변수는 현재 루프의 인덱스, 첫 번째/마지막 순회 여부 등 유용한 정보들을 제공합니다.

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

중첩된 반복문 안에 있다면, 부모 반복문의 `$loop` 변수는 `parent` 속성을 통해 접근할 수 있습니다.

```blade
@foreach ($users as $user)
    @foreach ($user->posts as $post)
        @if ($loop->parent->first)
            This is the first iteration of the parent loop.
        @endif
    @endforeach
@endforeach
```

`$loop` 변수에는 아래와 같은 다양한 속성이 포함되어 있습니다.

<div class="overflow-auto">

| 속성               | 설명                                                    |
| ------------------ | ------------------------------------------------------ |
| `$loop->index`     | 현재 반복문의 인덱스(0에서 시작)                         |
| `$loop->iteration` | 현재 반복문의 순번(1에서 시작)                           |
| `$loop->remaining` | 반복문이 남은 횟수                                      |
| `$loop->count`     | 반복 대상 배열의 총 아이템 개수                          |
| `$loop->first`     | 이번 순회가 첫 번째인지                                  |
| `$loop->last`      | 이번 순회가 마지막인지                                   |
| `$loop->even`      | 이번 순회가 짝수 순번인지                                |
| `$loop->odd`       | 이번 순회가 홀수 순번인지                                |
| `$loop->depth`     | 현재 루프의 중첩 깊이                                    |
| `$loop->parent`    | 중첩 루프일 때 부모의 루프 변수                         |

</div>

<a name="conditional-classes"></a>
### 조건부 클래스 & 스타일

`@class` 디렉티브는 조건에 따라 CSS 클래스 문자열을 동적으로 합성해줍니다. 이 디렉티브는 클래스명을 배열로 받아, 키가 클래스명 또는 클래스들의 문자열이고 값이 불리언 조건식으로 되어 있습니다. 만약 배열의 키가 숫자일 경우, 해당 클래스는 조건과 상관없이 항상 포함됩니다.

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

마찬가지로, `@style` 디렉티브를 사용하면 HTML 요소에 조건부로 인라인 CSS 스타일을 추가할 수 있습니다.

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

HTML 체크박스 input이 "checked" 상태인지 쉽게 표시하려면 `@checked` 디렉티브를 사용할 수 있습니다. 제공한 조건이 `true`로 평가되면 해당 input 요소에 `checked` 속성을 출력합니다.

```blade
<input
    type="checkbox"
    name="active"
    value="active"
    @checked(old('active', $user->active))
/>
```

마찬가지로, 해당 select option이 "selected" 상태여야 할 경우 `@selected` 디렉티브를 사용할 수 있습니다.

```blade
<select name="version">
    @foreach ($product->versions as $version)
        <option value="{{ $version }}" @selected(old('version') == $version)>
            {{ $version }}
        </option>
    @endforeach
</select>
```

또한, 특정 요소가 "disabled" 되어야 하면 `@disabled` 디렉티브를 사용할 수 있습니다.

```blade
<button type="submit" @disabled($errors->isNotEmpty())>Submit</button>
```

또한 "readonly" 속성을 동적으로 설정하려면 `@readonly` 디렉티브를 사용할 수 있습니다.

```blade
<input
    type="email"
    name="email"
    value="email@laravel.com"
    @readonly($user->isNotAdmin())
/>
```

추가로, 해당 요소가 "required"해야 한다면 `@required` 디렉티브를 사용할 수 있습니다.

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
> `@include` 디렉티브를 자유롭게 사용할 수 있지만, 블레이드의 [컴포넌트](#components)는 `@include`와 유사한 기능을 제공하면서 데이터 및 Attribute 바인딩과 같은 여러 이점을 더 가지고 있습니다.

블레이드의 `@include` 디렉티브를 사용하면 한 뷰 파일 안에서 다른 블레이드 뷰를 쉽게 불러올 수 있습니다. 부모 뷰에서 사용할 수 있는 모든 변수는 포함된 뷰에서도 동일하게 사용할 수 있습니다.

```blade
<div>
    @include('shared.errors')

    <form>
        <!-- Form Contents -->
    </form>
</div>
```

포함된 뷰가 부모의 모든 데이터를 상속받긴 하지만, 추가로 제공할 데이터를 배열 형태로 전달할 수도 있습니다.

```blade
@include('view.name', ['status' => 'complete'])
```

포함하려는 뷰 파일이 존재하지 않을 경우, 라라벨은 에러를 발생시킵니다. 하지만 해당 뷰가 있을 때만 포함하고 싶을 때는 `@includeIf` 디렉티브를 사용하면 됩니다.

```blade
@includeIf('view.name', ['status' => 'complete'])
```

지정한 불리언 조건이 `true`일 때만 뷰를 포함하고 싶다면 `@includeWhen`, 반대로 `false`일 때만 포함하려면 `@includeUnless` 디렉티브를 사용할 수 있습니다.

```blade
@includeWhen($boolean, 'view.name', ['status' => 'complete'])

@includeUnless($boolean, 'view.name', ['status' => 'complete'])
```

뷰들의 배열에서 첫 번째로 존재하는 파일을 포함하고 싶다면, `includeFirst` 디렉티브를 사용하면 됩니다.

```blade
@includeFirst(['custom.admin', 'admin'], ['status' => 'complete'])
```

> [!WARNING]  
> 블레이드 뷰에서는 `__DIR__`, `__FILE__` 상수 사용을 피해야 합니다. 이 상수들은 컴파일되어 캐시된 뷰의 경로를 가리키게 됩니다.

<a name="rendering-views-for-collections"></a>

#### 컬렉션에 대한 뷰 렌더링

Blade의 `@each` 디렉티브를 사용하면 반복문과 include를 한 줄로 결합할 수 있습니다.

```blade
@each('view.name', $jobs, 'job')
```

`@each` 디렉티브의 첫 번째 인수는 배열 또는 컬렉션의 각 요소를 렌더링할 때 사용할 뷰입니다. 두 번째 인수는 반복하고자 하는 배열이나 컬렉션이고, 세 번째 인수는 현재 반복 요소가 뷰에서 지정될 변수명입니다. 예를 들어 `jobs` 배열을 순회한다면, 각 뷰 내부에서 해당 잡(job)을 `job` 변수로 접근할 수 있습니다. 그리고 현재 반복의 배열 키는 뷰 내에서 `key` 변수로 사용할 수 있습니다.

또한, 네 번째 인수를 `@each` 디렉티브에 전달할 수 있습니다. 이 인수는 만약 지정한 배열이 비어 있을 때 렌더링할 뷰를 정합니다.

```blade
@each('view.name', $jobs, 'job', 'view.empty')
```

> [!WARNING]  
> `@each`로 렌더링된 뷰는 부모 뷰의 변수들을 상속받지 않습니다. 자식 뷰에서 부모 뷰의 변수를 필요로 한다면 `@foreach`와 `@include` 디렉티브를 대신 사용해야 합니다.

<a name="the-once-directive"></a>
### `@once` 디렉티브

`@once` 디렉티브를 사용하면 렌더링 사이클당 한 번만 평가되는 템플릿 일부를 정의할 수 있습니다. 예를 들어, [스택](#stacks)을 사용해서 일정한 자바스크립트를 페이지 헤더에 한 번만 넣고 싶을 때 유용합니다. 예를 들어, [컴포넌트](#components)를 반복문으로 여러 번 렌더링할 때, 처음 렌더링 시에만 자바스크립트를 헤더에 push하고 싶다면 다음과 같이 사용합니다.

```blade
@once
    @push('scripts')
        <script>
            // Your custom JavaScript...
        </script>
    @endpush
@endonce
```

`@once` 디렉티브는 주로 `@push`, `@prepend`와 함께 많이 사용되며, 편의를 위해 `@pushOnce`와 `@prependOnce` 디렉티브도 제공됩니다.

```blade
@pushOnce('scripts')
    <script>
        // Your custom JavaScript...
    </script>
@endPushOnce
```

<a name="raw-php"></a>
### PHP 코드 직접 사용

어떤 상황에서는 뷰에 PHP 코드를 직접 사용할 필요가 있습니다. Blade의 `@php` 디렉티브를 사용하면 템플릿 내에서 일반 PHP 코드를 실행할 수 있습니다.

```blade
@php
    $counter = 1;
@endphp
```

또한, PHP 클래스를 import하는 용도로만 PHP 코드를 쓰고 싶다면 `@use` 디렉티브를 사용할 수 있습니다.

```blade
@use('App\Models\Flight')
```

`@use` 디렉티브에는 두 번째 인수로 import한 클래스의 별칭을 지정할 수도 있습니다.

```php
@use('App\Models\Flight', 'FlightModel')
```

<a name="comments"></a>
### 주석

Blade는 뷰 내에서 주석을 정의하는 기능도 제공합니다. 이 주석은 HTML 주석과 달리, 애플리케이션이 최종적으로 반환하는 HTML에 절대 포함되지 않습니다.

```blade
{{-- 이 주석은 렌더링된 HTML에 포함되지 않습니다 --}}
```

<a name="components"></a>
## 컴포넌트(Components)

컴포넌트와 슬롯(slots)은 section, layout, include가 제공하는 이점과 유사하지만, 컴포넌트와 슬롯의 개념이 더 이해하기 쉬울 수 있습니다. 컴포넌트를 작성하는 방법은 크게 클래스 기반 컴포넌트와 익명 컴포넌트 두 가지가 있습니다.

클래스 기반 컴포넌트를 만들려면 `make:component` Artisan 명령어를 사용할 수 있습니다. 사용 예시로, 간단한 `Alert` 컴포넌트를 만들어 보겠습니다. `make:component` 명령어는 컴포넌트를 `app/View/Components` 디렉터리에 생성합니다.

```shell
php artisan make:component Alert
```

`make:component` 명령어는 컴포넌트용 뷰 템플릿도 함께 생성합니다. 이 뷰는 `resources/views/components` 디렉터리에 위치합니다. 애플리케이션 용도로 컴포넌트를 만들 때는, 이 두 디렉터리(`app/View/Components`, `resources/views/components`) 내의 컴포넌트들은 자동으로 감지 및 등록되므로 별도의 등록 과정이 필요하지 않습니다.

서브디렉터리 안에 컴포넌트를 생성하는 것도 가능합니다.

```shell
php artisan make:component Forms/Input
```

위 명령어를 실행하면, `app/View/Components/Forms` 디렉터리에 `Input` 컴포넌트가 생성되고 뷰 템플릿은 `resources/views/components/forms` 디렉터리에 생성됩니다.

만약 클래스 없이 Blade 템플릿 파일만 가지는 익명 컴포넌트를 생성하고 싶다면, 명령 실행 시 `--view` 플래그를 사용하면 됩니다.

```shell
php artisan make:component forms.input --view
```

이 명령어는 `resources/views/components/forms/input.blade.php` 파일을 생성하며, `<x-forms.input />` 형태로 컴포넌트처럼 렌더링할 수 있습니다.

<a name="manually-registering-package-components"></a>
#### 패키지 컴포넌트 수동 등록

애플리케이션용 컴포넌트는 위에서 설명한 대로 지정된 디렉터리 내에서 자동으로 감지 및 등록됩니다.

하지만 패키지를 개발하며 Blade 컴포넌트를 활용하는 경우, 컴포넌트 클래스와 HTML 태그 별칭을 직접 등록해야 합니다. 보통 패키지의 서비스 프로바이더의 `boot` 메서드에서 컴포넌트를 등록합니다.

```
use Illuminate\Support\Facades\Blade;

/**
 * 패키지 서비스 부트스트랩.
 */
public function boot(): void
{
    Blade::component('package-alert', Alert::class);
}
```

컴포넌트가 등록되면 태그 별칭으로 렌더링할 수 있습니다.

```blade
<x-package-alert/>
```

또는, `componentNamespace` 메서드를 이용해 네임스페이스에 따라 컴포넌트 클래스를 오토로드할 수도 있습니다. 예를 들어, `Nightshade` 패키지에 `Calendar`, `ColorPicker` 컴포넌트가 있고, `Package\Views\Components` 네임스페이스에 위치한다면 다음과 같이 등록할 수 있습니다.

```
use Illuminate\Support\Facades\Blade;

/**
 * 패키지 서비스 부트스트랩.
 */
public function boot(): void
{
    Blade::componentNamespace('Nightshade\\Views\\Components', 'nightshade');
}
```

이렇게 하면 `package-name::` 문법을 사용하여 벤더 네임스페이스로 패키지 컴포넌트를 사용할 수 있습니다.

```blade
<x-nightshade::calendar />
<x-nightshade::color-picker />
```

Blade는 컴포넌트 이름을 파스칼케이스로 변환하여 자동으로 연결된 클래스를 감지합니다. 서브디렉터리는 "도트(dot) 표기"를 사용해 지원됩니다.

<a name="rendering-components"></a>
### 컴포넌트 렌더링

컴포넌트를 표시하려면 Blade 템플릿에서 Blade 컴포넌트 태그를 사용할 수 있습니다. Blade 컴포넌트 태그는 `x-`로 시작하며, 그 뒤에 컴포넌트 클래스명을 케밥(case) 형태로 작성합니다.

```blade
<x-alert/>

<x-user-profile/>
```

만약 컴포넌트 클래스가 `app/View/Components` 디렉토리 내에서 더 깊은 경로에 있다면, 디렉토리 구조를 `.` 문자로 표현할 수 있습니다. 예를 들어, `app/View/Components/Inputs/Button.php`에 컴포넌트가 있다면 다음과 같이 렌더링할 수 있습니다.

```blade
<x-inputs.button/>
```

컴포넌트를 조건부로 렌더링하고 싶다면, 컴포넌트 클래스에서 `shouldRender` 메서드를 정의할 수 있습니다. 이 메서드가 `false`를 반환하면 해당 컴포넌트는 렌더링되지 않습니다.

```
use Illuminate\Support\Str;

/**
 * 컴포넌트 렌더링 여부 반환
 */
public function shouldRender(): bool
{
    return Str::length($this->message) > 0;
}
```

<a name="index-components"></a>
### 인덱스 컴포넌트

때때로 컴포넌트가 컴포넌트 그룹의 일부로 사용되어 같은 디렉터리에 관련 컴포넌트들을 모으고 싶을 때가 있습니다. 예를 들어 다음과 같이 "카드(card)" 컴포넌트를 구성했다고 가정합니다.

```none
App\Views\Components\Card\Card
App\Views\Components\Card\Header
App\Views\Components\Card\Body
```

루트 `Card` 컴포넌트가 `Card` 디렉터리 내에 있으므로, `<x-card.card>`와 같이 렌더링해야 할 것처럼 보일 수 있습니다. 하지만, 컴포넌트 파일명이 디렉터리 이름과 동일한 경우 라라벨은 이를 "루트" 컴포넌트로 간주하여 디렉터리 이름을 반복하지 않고 다음과 같이 렌더링할 수 있게 해줍니다.

```blade
<x-card>
    <x-card.header>...</x-card.header>
    <x-card.body>...</x-card.body>
</x-card>
```

<a name="passing-data-to-components"></a>
### 컴포넌트에 데이터 전달하기

Blade 컴포넌트에 데이터를 전달할 때는 HTML 속성을 활용할 수 있습니다. 하드코딩된 기본형 값은 HTML 속성 문자열로, PHP 표현식이나 변수를 넘길 때는 속성 이름 앞에 `:`를 붙여서 사용할 수 있습니다.

```blade
<x-alert type="error" :message="$message"/>
```

컴포넌트 클래스의 생성자에서 모든 데이터 속성을 정의해야 합니다. 컴포넌트의 모든 public 속성은 자동으로 컴포넌트 뷰에서 사용할 수 있습니다. 컴포넌트의 `render` 메서드에서 별도로 데이터를 뷰로 전달할 필요는 없습니다.

```
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
     * 컴포넌트를 표현하는 뷰/내용 반환
     */
    public function render(): View
    {
        return view('components.alert');
    }
}
```

컴포넌트가 렌더링될 때, 컴포넌트의 public 변수는 해당 이름으로 뷰에서 바로 출력할 수 있습니다.

```blade
<div class="alert alert-{{ $type }}">
    {{ $message }}
</div>
```

<a name="casing"></a>
#### 대소문자 규칙(Casing)

컴포넌트 생성자 인수는 `camelCase`로 작성해야 하며, HTML 속성에서 인수명을 사용할 때는 `kebab-case`로 사용해야 합니다. 예를 들어 다음과 같은 컴포넌트 생성자가 있을 때,

```
/**
 * 컴포넌트 인스턴스 생성자
 */
public function __construct(
    public string $alertType,
) {}
```

`$alertType` 인수는 아래와 같이 컴포넌트에 전달할 수 있습니다.

```blade
<x-alert alert-type="danger" />
```

<a name="short-attribute-syntax"></a>
#### 속성 축약 문법(Short Attribute Syntax)

컴포넌트에 속성을 전달할 때, "속성 축약 문법"을 사용할 수 있습니다. 속성명과 변수명이 일치하는 경우 자주 유용합니다.

```blade
{{-- 속성 축약 문법 --}}
<x-profile :$userId :$name />

{{-- 아래와 동일함 --}}
<x-profile :user-id="$userId" :name="$name" />
```

<a name="escaping-attribute-rendering"></a>
#### 속성 렌더링 이스케이프(Escaping Attribute Rendering)

Alpine.js 같은 자바스크립트 프레임워크에서 속성 앞에 콜론(:)이 사용되는 경우, Blade에 해당 속성이 PHP 표현식이 아니라는 것을 알리기 위해 더블 콜론(`::`)을 사용할 수 있습니다. 예를 들어 아래와 같은 컴포넌트가 있다면,

```blade
<x-button ::class="{ danger: isDeleting }">
    Submit
</x-button>
```

아래와 같은 HTML이 Blade에 의해 렌더링됩니다.

```blade
<button :class="{ danger: isDeleting }">
    Submit
</button>
```

<a name="component-methods"></a>
#### 컴포넌트 메서드

컴포넌트 템플릿에서는 public 변수 외에도 컴포넌트의 public 메서드를 불러올 수 있습니다. 예를 들어, `isSelected` 메서드가 있는 컴포넌트라면 다음과 같이 사용할 수 있습니다.

```
/**
 * 주어진 옵션이 현재 선택된 옵션인지 확인
 */
public function isSelected(string $option): bool
{
    return $option === $this->selected;
}
```

컴포넌트 템플릿에서 해당 메서드명을 변수처럼 직접 호출할 수 있습니다.

```blade
<option {{ $isSelected($value) ? 'selected' : '' }} value="{{ $value }}">
    {{ $label }}
</option>
```

<a name="using-attributes-slots-within-component-class"></a>
#### 컴포넌트 클래스 내에서 속성 및 슬롯 접근

Blade 컴포넌트에서는 컴포넌트 이름, 속성(attributes), 슬롯(slot)에 접근할 수 있습니다. 이 데이터를 사용하려면 컴포넌트의 `render` 메서드에서 클로저(Closure)를 반환해야 합니다.

```
use Closure;

/**
 * 컴포넌트를 표현하는 뷰/내용 반환
 */
public function render(): Closure
{
    return function () {
        return '<div {{ $attributes }}>Components content</div>';
    };
}
```

이 클로저는 `$data` 배열을 유일한 인자로 받을 수 있습니다. 이 배열에는 컴포넌트 정보를 담은 여러 요소가 포함됩니다.

```
return function (array $data) {
    // $data['componentName'];
    // $data['attributes'];
    // $data['slot'];

    return '<div {{ $attributes }}>Components content</div>';
}
```

> [!WARNING]  
> `$data` 배열의 요소를 Blade 문자열에 직접 포함시키면, 악의적인 속성 값을 통한 원격 코드 실행이 발생할 수 있으므로 절대 사용하지 않아야 합니다.

`componentName`은 HTML 태그의 `x-` 접두어 뒤에 온 이름에 해당합니다. 즉 `<x-alert />`의 `componentName`은 `alert`이 됩니다. `attributes` 요소는 HTML 태그에 지정된 모든 속성을 가지며, `slot` 요소는 컴포넌트 슬롯의 내용을 포함한 `Illuminate\Support\HtmlString` 인스턴스입니다.

클로저는 문자열을 반환해야 하며, 이 문자열이 기존 뷰와 일치할 경우 해당 뷰가 렌더링되고, 아니면 인라인 Blade 뷰로 처리됩니다.

<a name="additional-dependencies"></a>
#### 추가 의존성 주입

컴포넌트에서 라라벨의 [서비스 컨테이너](/docs/11.x/container)에서 의존성이 필요한 경우, 컴포넌트의 데이터 속성 앞에 의존성을 나열하면 컨테이너가 자동으로 주입해줍니다.

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
#### 속성/메서드 감추기

컴포넌트 템플릿에 public 메서드나 속성이 변수로 노출되는 것을 막으려면, `$except` 배열 속성에 제외할 항목을 지정할 수 있습니다.

```
<?php

namespace App\View\Components;

use Illuminate\View\Component;

class Alert extends Component
{
    /**
     * 컴포넌트 템플릿에서 노출하지 않을 속성/메서드
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
### 컴포넌트 속성

앞서 살펴본 것처럼, 데이터 속성을 컴포넌트에 전달할 수 있습니다. 하지만 때로는 컴포넌트 기능과는 무관한 추가 HTML 속성(예시: `class` 같은)을 지정해야 할 수도 있습니다. 보통 이러한 추가 속성들은 컴포넌트 템플릿의 루트 요소로 전달하는 것이 바람직합니다. 예를 들어 아래처럼 alert 컴포넌트를 렌더링한다고 가정해보겠습니다.

```blade
<x-alert type="error" :message="$message" class="mt-4"/>
```

컴포넌트 생성자에 없는 모든 속성은 자동으로 컴포넌트의 "속성 백(attribute bag)"에 추가됩니다. 이 속성 백은 컴포넌트 내에서 `$attributes` 변수로 사용할 수 있고, 모든 속성을 렌더링하려면 이 변수를 echo하면 됩니다.

```blade
<div {{ $attributes }}>
    <!-- Component content -->
</div>
```

> [!WARNING]  
> 컴포넌트 태그에서 `@env` 같은 디렉티브 사용은 현재 지원되지 않습니다. 예를 들어 `<x-alert :live="@env('production')"/>`와 같은 코드는 컴파일되지 않습니다.

<a name="default-merged-attributes"></a>
#### 기본값/병합된 속성(Default / Merged Attributes)

때로는 속성에 기본값을 지정하거나, 일부 속성에 값을 추가로 합쳐야 할 때가 있습니다. 이럴 때는 속성 백의 `merge` 메서드를 사용할 수 있습니다. 이 메서드는 항상 적용할 CSS 클래스의 기본값을 지정할 때 특히 유용합니다.

```blade
<div {{ $attributes->merge(['class' => 'alert alert-'.$type]) }}>
    {{ $message }}
</div>
```

예를 들어, 이 컴포넌트가 아래와 같이 사용된다면:

```blade
<x-alert type="error" :message="$message" class="mb-4"/>
```

최종적으로 렌더링되는 HTML은 아래처럼 나타납니다.

```blade
<div class="alert alert-error mb-4">
    <!-- Contents of the $message variable -->
</div>
```

<a name="conditionally-merge-classes"></a>
#### 조건부 클래스 병합

특정 조건이 참일 때만 클래스를 병합하고 싶은 경우에는, `class` 메서드를 사용할 수 있습니다. 이 메서드는 클래스 혹은 여러 클래스를 키로, 불리언 값을 값으로 갖는 배열을 받습니다. 배열의 키가 숫자면, 조건과 상관없이 항상 렌더링된 클래스 리스트에 포함됩니다.

```blade
<div {{ $attributes->class(['p-4', 'bg-red' => $hasError]) }}>
    {{ $message }}
</div>
```

다른 속성도 병합하고 싶으면, `class` 메서드 뒤에 `merge` 메서드를 체이닝할 수 있습니다.

```blade
<button {{ $attributes->class(['p-4'])->merge(['type' => 'button']) }}>
    {{ $slot }}
</button>
```

> [!NOTE]  
> 병합 속성이 필요 없는 다른 HTML 요소에서 조건부 클래스를 처리하고 싶다면 [`@class` 디렉티브](#conditional-classes)를 사용할 수 있습니다.

<a name="non-class-attribute-merging"></a>
#### 클래스 외 속성 병합(Non-Class Attribute Merging)

클래스가 아닌 다른 속성의 병합 시에는 `merge` 메서드에 지정된 값이 해당 속성의 "기본값"으로 간주됩니다. 하지만, `class` 속성과 달리 이 속성들은 전달된 값과 병합되지 않고, 기본값이 오버라이드됩니다. 예를 들어 button 컴포넌트 구현은 아래와 같습니다.

```blade
<button {{ $attributes->merge(['type' => 'button']) }}>
    {{ $slot }}
</button>
```

이 컴포넌트를 사용자 정의 `type` 속성으로 렌더링하려면 아래와 같이 사용할 수 있습니다. 지정하지 않으면 기본형인 `button` 타입이 적용됩니다.

```blade
<x-button type="submit">
    Submit
</x-button>
```

이 예시에서 렌더링되는 HTML은 다음과 같습니다.

```blade
<button type="submit">
    Submit
</button>
```

만약 `class`가 아닌 다른 속성에서 기본값과 전달값을 합쳐서 사용하고 싶다면 `prepends` 메서드를 사용하면 됩니다. 예를 들어, `data-controller` 속성은 항상 `profile-controller`로 시작하고, 전달된 값은 그 뒤에 추가되게 할 수 있습니다.

```blade
<div {{ $attributes->merge(['data-controller' => $attributes->prepends('profile-controller')]) }}>
    {{ $slot }}
</div>
```

<a name="filtering-attributes"></a>
#### 속성 필터링 및 조회

`filter` 메서드를 사용하면 속성을 필터링할 수 있습니다. 이 메서드는 true를 반환하는 경우에 한해 해당 속성을 속성 백에 남깁니다.

```blade
{{ $attributes->filter(fn (string $value, string $key) => $key == 'foo') }}
```

편의상, `whereStartsWith` 메서드를 사용하면 키가 특정 문자열로 시작하는 모든 속성을 한 번에 가져올 수 있습니다.

```blade
{{ $attributes->whereStartsWith('wire:model') }}
```

반대로, `whereDoesntStartWith` 메서드는 키가 특정 문자열로 시작하지 않는 속성만 남깁니다.

```blade
{{ $attributes->whereDoesntStartWith('wire:model') }}
```

`first` 메서드를 사용하면 주어진 속성 백에서 첫 번째 속성만 렌더링할 수 있습니다.

```blade
{{ $attributes->whereStartsWith('wire:model')->first() }}
```

컴포넌트에 특정 속성이 존재하는지 확인하려면 `has` 메서드를 사용할 수 있습니다. 이 메서드는 속성명을 유일한 인수로 받아, 해당 속성이 존재하면 true를 반환합니다.

```blade
@if ($attributes->has('class'))
    <div>Class attribute is present</div>
@endif
```

배열을 `has` 메서드에 전달하면, 지정한 모든 속성이 있는지 검사합니다.

```blade
@if ($attributes->has(['name', 'class']))
    <div>All of the attributes are present</div>
@endif
```

`hasAny` 메서드는 지정한 속성 중 하나라도 존재하는지 검사합니다.

```blade
@if ($attributes->hasAny(['href', ':href', 'v-bind:href']))
    <div>One of the attributes is present</div>
@endif
```

특정 속성의 값을 가져오려면 `get` 메서드를 사용하면 됩니다.

```blade
{{ $attributes->get('class') }}
```

<a name="reserved-keywords"></a>

### 예약된 키워드

기본적으로, Blade에서 컴포넌트를 렌더링할 때 내부적으로 사용하는 일부 키워드는 예약어로 지정되어 있습니다. 아래 나열된 키워드는 컴포넌트 내에서 public 속성이나 메서드 이름으로 정의할 수 없습니다.

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

컴포넌트에 추가적인 콘텐츠를 전달해야 할 때, 흔히 "슬롯(slot)"을 사용합니다. 컴포넌트 슬롯은 `$slot` 변수를 출력함으로써 렌더링할 수 있습니다. 이 개념을 이해하기 위해, `alert` 컴포넌트가 다음과 같은 마크업을 가진다고 가정해보겠습니다.

```blade
<!-- /resources/views/components/alert.blade.php -->

<div class="alert alert-danger">
    {{ $slot }}
</div>
```

컴포넌트에 콘텐츠를 주입하여 `slot`으로 전달할 수 있습니다.

```blade
<x-alert>
    <strong>Whoops!</strong> Something went wrong!
</x-alert>
```

때로는 하나의 컴포넌트 내부에서 여러 위치에 서로 다른 슬롯을 렌더링해야 할 수도 있습니다. 알림 컴포넌트에 "title" 슬롯을 주입할 수 있도록 수정해보겠습니다.

```blade
<!-- /resources/views/components/alert.blade.php -->

<span class="alert-title">{{ $title }}</span>

<div class="alert alert-danger">
    {{ $slot }}
</div>
```

명명된 슬롯의 내용을 정의할 때는 `x-slot` 태그를 사용합니다. 명시적으로 `x-slot` 태그 안에 포함되지 않은 모든 내용은 `$slot` 변수로 컴포넌트에 전달됩니다.

```xml
<x-alert>
    <x-slot:title>
        Server Error
    </x-slot>

    <strong>Whoops!</strong> Something went wrong!
</x-alert>
```

슬롯에 콘텐츠가 있는지 확인하기 위해, `isEmpty` 메서드를 사용할 수 있습니다.

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

또한, `hasActualContent` 메서드를 사용하면 해당 슬롯에 HTML 주석이 아닌 진짜 콘텐츠가 있는지 확인할 수 있습니다.

```blade
@if ($slot->hasActualContent())
    The scope has non-comment content.
@endif
```

<a name="scoped-slots"></a>
#### 스코프 슬롯(Scoped Slot)

Vue 같은 자바스크립트 프레임워크를 사용해본 적이 있다면, 컴포넌트의 데이터나 메서드에 슬롯 내부에서 접근할 수 있게 해주는 "스코프 슬롯" 개념이 익숙할 수 있습니다. 라라벨에서도 컴포넌트에 public 메서드나 속성을 정의하고, 슬롯 내부에서 `$component` 변수를 통해 이들을 사용할 수 있습니다. 예를 들어, `x-alert` 컴포넌트 클래스에 public `formatAlert` 메서드가 있다고 가정하면 아래와 같이 사용할 수 있습니다.

```blade
<x-alert>
    <x-slot:title>
        {{ $component->formatAlert('Server Error') }}
    </x-slot>

    <strong>Whoops!</strong> Something went wrong!
</x-alert>
```

<a name="slot-attributes"></a>
#### 슬롯 속성

Blade 컴포넌트처럼, 슬롯에도 CSS 클래스명 등 [속성](#component-attributes)을 추가로 할당할 수 있습니다.

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

슬롯의 속성과 상호작용하려면, 해당 슬롯 변수의 `attributes` 속성에 접근하면 됩니다. 속성 처리에 대한 자세한 내용은 [컴포넌트 속성](#component-attributes) 문서를 참고하세요.

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

매우 작은 컴포넌트의 경우, 컴포넌트 클래스와 뷰 템플릿을 따로 관리하는 것이 번거롭게 느껴질 수 있습니다. 이런 상황에서는 `render` 메서드에서 컴포넌트의 마크업을 직접 반환할 수 있습니다.

```
/**
 * Get the view / contents that represent the component.
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
#### 인라인 뷰 컴포넌트 생성하기

인라인 뷰를 렌더링하는 컴포넌트를 생성하려면, `make:component` 명령어 실행 시 `--inline` 옵션을 사용하면 됩니다.

```shell
php artisan make:component Alert --inline
```

<a name="dynamic-components"></a>
### 동적 컴포넌트

때로는 어떤 컴포넌트를 렌더링해야 할지 실행 시점까지 알 수 없는 경우가 있습니다. 이런 경우, 라라벨 내장 `dynamic-component` 컴포넌트를 사용해 런타임 값이나 변수를 기반으로 컴포넌트를 렌더링할 수 있습니다.

```blade
// $componentName = "secondary-button";

<x-dynamic-component :component="$componentName" class="mt-4" />
```

<a name="manually-registering-components"></a>
### 컴포넌트 수동 등록

> [!WARNING]  
> 다음 문서는 주로 뷰 컴포넌트가 포함된 라라벨 패키지를 작성하는 경우에만 해당됩니다. 패키지 개발이 아니라면 이 부분은 대부분 해당되지 않습니다.

애플리케이션에서 컴포넌트를 직접 작성하는 경우, `app/View/Components` 디렉터리와 `resources/views/components` 디렉터리에 있는 컴포넌트들은 자동으로 인식됩니다.

하지만, Blade 컴포넌트를 사용하는 패키지를 만들거나 컴포넌트를 별도의 디렉터리에 둘 경우, 직접 컴포넌트 클래스와 해당 HTML 태그 별칭을 등록해야 라라벨이 해당 컴포넌트의 위치를 알 수 있습니다. 보통 패키지의 서비스 프로바이더의 `boot` 메서드에서 컴포넌트를 등록합니다.

```
use Illuminate\Support\Facades\Blade;
use VendorPackage\View\Components\AlertComponent;

/**
 * Bootstrap your package's services.
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

#### 패키지 컴포넌트 자동 로드(Autoloading)

또는, `componentNamespace` 메서드를 사용해 규칙에 따라 컴포넌트 클래스를 자동 등록할 수도 있습니다. 예를 들어, `Nightshade` 패키지의 `Calendar`와 `ColorPicker` 컴포넌트가 `Package\Views\Components` 네임스페이스에 있다면 아래와 같이 할 수 있습니다.

```
use Illuminate\Support\Facades\Blade;

/**
 * Bootstrap your package's services.
 */
public function boot(): void
{
    Blade::componentNamespace('Nightshade\\Views\\Components', 'nightshade');
}
```

이렇게 하면 벤더 네임스페이스와 함께 `package-name::` 문법을 사용해서 패키지 컴포넌트를 사용할 수 있습니다.

```blade
<x-nightshade::calendar />
<x-nightshade::color-picker />
```

Blade는 컴포넌트 이름을 파스칼 케이스로 변환해 해당 클래스와 자동으로 연결합니다. 서브 디렉터리는 "도트" 표기법도 지원합니다.

<a name="anonymous-components"></a>
## 익명 컴포넌트(Anonymous Components)

인라인 컴포넌트와 마찬가지로, 익명 컴포넌트는 하나의 파일만으로 컴포넌트를 관리할 수 있는 방법을 제공합니다. 하지만 익명 컴포넌트는 하나의 뷰 파일만 사용하고 별도의 클래스가 필요하지 않습니다. 익명 컴포넌트는 `resources/views/components` 디렉터리에 Blade 템플릿을 두기만 하면 됩니다. 예를 들어, `resources/views/components/alert.blade.php`에 컴포넌트를 정의하면, 다음과 같이 렌더링할 수 있습니다.

```blade
<x-alert/>
```

`components` 디렉터리 내에서 더 깊이 중첩된 컴포넌트라면 `.` 문자를 사용해 표현할 수 있습니다. 예를 들어, `resources/views/components/inputs/button.blade.php`에 정의된 경우 다음과 같이 사용할 수 있습니다.

```blade
<x-inputs.button/>
```

<a name="anonymous-index-components"></a>
### 익명 인덱스 컴포넌트

여러 Blade 템플릿으로 이루어진 컴포넌트를 만들 때, 각 컴포넌트 템플릿을 하나의 디렉터리로 그룹화하고 싶을 때가 있습니다. 예를 들어, "아코디언" 컴포넌트를 다음과 같이 구성할 수 있습니다.

```none
/resources/views/components/accordion.blade.php
/resources/views/components/accordion/item.blade.php
```

이 디렉터리 구조에서는 아코디언 컴포넌트 및 그 항목을 아래와 같이 렌더링할 수 있습니다.

```blade
<x-accordion>
    <x-accordion.item>
        ...
    </x-accordion.item>
</x-accordion>
```

하지만 위 예시에서처럼, `x-accordion` 컴포넌트를 렌더링하려면 "index" 역할을 하는 템플릿 파일을 항상 `resources/views/components` 루트에 두어야 했습니다.

다행히, Blade에서는 컴포넌트의 디렉터리 내에 디렉터리명과 동일한 파일명을 가진 템플릿을 둘 수 있습니다. 이 템플릿이 존재하면, 디렉터리 내부에 중첩되어 있더라도 해당 컴포넌트의 "루트" 요소로 렌더링할 수 있습니다. 위 예시와 동일하게 Blade 문법을 계속 사용할 수 있으며, 디렉터리 구조만 다음과 같이 변경하면 됩니다.

```none
/resources/views/components/accordion/accordion.blade.php
/resources/views/components/accordion/item.blade.php
```

<a name="data-properties-attributes"></a>
### 데이터 속성 / 속성(attribute)

익명 컴포넌트에는 별도의 클래스가 없기 때문에, 어떤 데이터가 변수로 전달되어야 하는지, 어떤 속성이 [속성 백](#component-attributes)에 속해야 하는지 구분이 필요합니다.

Blade 템플릿 상단에서 `@props` 지시어를 사용해 어떤 속성이 데이터 변수로 취급되어야 하는지 지정할 수 있습니다. 컴포넌트의 다른 모든 속성은 속성 백(attribute bag)에서 사용할 수 있습니다. 데이터 변수에 기본값을 지정하려면 배열의 키에 변수명을, 값에 기본값을 써주면 됩니다.

```blade
<!-- /resources/views/components/alert.blade.php -->

@props(['type' => 'info', 'message'])

<div {{ $attributes->merge(['class' => 'alert alert-'.$type]) }}>
    {{ $message }}
</div>
```

위와 같이 컴포넌트를 정의했다면 다음과 같이 렌더링할 수 있습니다.

```blade
<x-alert type="error" :message="$message" class="mb-4"/>
```

<a name="accessing-parent-data"></a>
### 상위 데이터 접근하기

때때로, 자식 컴포넌트 내부에서 상위 컴포넌트에 전달된 데이터를 참조하고 싶을 수 있습니다. 이럴 때는 `@aware` 지시어를 활용할 수 있습니다. 예를 들어 복잡한 메뉴 컴포넌트(`<x-menu>`와 `<x-menu.item>`로 구성)를 만든다고 가정합시다.

```blade
<x-menu color="purple">
    <x-menu.item>...</x-menu.item>
    <x-menu.item>...</x-menu.item>
</x-menu>
```

`<x-menu>` 컴포넌트는 다음과 같이 구현될 수 있습니다.

```blade
<!-- /resources/views/components/menu/index.blade.php -->

@props(['color' => 'gray'])

<ul {{ $attributes->merge(['class' => 'bg-'.$color.'-200']) }}>
    {{ $slot }}
</ul>
```

이때 `color` prop이 상위(`<x-menu>`) 컴포넌트에만 전달되었기 때문에, 그냥 두면 `<x-menu.item>` 안에서는 사용할 수 없습니다. 하지만 `@aware` 지시어를 활용하면 자식 컴포넌트에서도 이 값을 사용할 수 있습니다.

```blade
<!-- /resources/views/components/menu/item.blade.php -->

@aware(['color' => 'gray'])

<li {{ $attributes->merge(['class' => 'text-'.$color.'-800']) }}>
    {{ $slot }}
</li>
```

> [!WARNING]  
> `@aware` 지시어는 반드시 상위 컴포넌트에 HTML 속성(attribute)으로 명시적으로 전달된 값만 접근할 수 있습니다. 상위 컴포넌트의 `@props` 기본값(명시적으로 속성으로 전달되지 않은 값)은 `@aware`로 접근할 수 없습니다.

<a name="anonymous-component-paths"></a>
### 익명 컴포넌트 경로

앞서 설명했듯, 익명 컴포넌트는 일반적으로 `resources/views/components` 디렉터리에 Blade 템플릿 파일을 두어 정의합니다. 하지만 이 기본 경로 외에 다른 익명 컴포넌트 경로도 라라벨에 등록할 수 있습니다.

`anonymousComponentPath` 메서드는 첫 번째 인수에 익명 컴포넌트의 위치(경로), 두 번째 인수에는 선택적으로 컴포넌트에 붙일 "네임스페이스"를 받습니다. 이 메서드는 보통 애플리케이션의 [서비스 프로바이더](/docs/11.x/providers)의 `boot` 메서드에서 호출합니다.

```
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Blade::anonymousComponentPath(__DIR__.'/../components');
}
```

위와 같이 프리픽스 없이 컴포넌트 경로를 등록하면, 해당 경로에 컴포넌트가 존재할 경우 Blade 컴포넌트에서 프리픽스 없이 바로 렌더링할 수 있습니다. 예를 들어 등록된 경로에 `panel.blade.php` 컴포넌트가 있다면,

```blade
<x-panel />
```

두 번째 인수로 프리픽스 "네임스페이스"를 지정할 수도 있습니다.

```
Blade::anonymousComponentPath(__DIR__.'/../components', 'dashboard');
```

프리픽스를 지정했다면, 해당 네임스페이스를 컴포넌트 이름 앞에 붙여서 렌더링하면 됩니다.

```blade
<x-dashboard::panel />
```

<a name="building-layouts"></a>
## 레이아웃 구성하기

<a name="layouts-using-components"></a>
### 컴포넌트를 활용한 레이아웃

대부분의 웹 애플리케이션은 여러 페이지에서 공통된 레이아웃을 유지합니다. 만약 우리가 모든 뷰마다 동일한 레이아웃의 HTML을 반복해서 작성한다면, 이는 아주 번거롭고 유지 보수도 어렵게 될 것입니다. 다행히 [Blade 컴포넌트](#components)로 레이아웃을 정의하고, 애플리케이션 전반에 걸쳐 재사용하는 것이 편리합니다.

<a name="defining-the-layout-component"></a>
#### 레이아웃 컴포넌트 정의하기

예를 들어, "todo" 리스트 애플리케이션을 만든다고 가정해봅시다. 이때, 아래와 같은 `layout` 컴포넌트를 정의할 수 있습니다.

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

`layout` 컴포넌트를 정의한 후, 해당 컴포넌트를 사용하는 Blade 뷰를 만들 수 있습니다. 예를 들어, 우리의 작업(Task) 리스트를 출력하는 뷰는 다음과 같습니다.

```blade
<!-- resources/views/tasks.blade.php -->

<x-layout>
    @foreach ($tasks as $task)
        <div>{{ $task }}</div>
    @endforeach
</x-layout>
```

컴포넌트에 주입된 콘텐츠는 내부적으로 컴포넌트의 `$slot` 변수에 전달된다는 점을 기억하세요. 또한, `layout` 컴포넌트는 `$title` 슬롯이 전달된 경우 이를 활용하고, 없을 경우에는 기본 제목을 출력합니다. 아래와 같이 일반적인 슬롯 사용법을 통해 커스텀 제목을 별도로 지정할 수 있습니다.

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

이제 레이아웃과 작업 목록 뷰를 정의했다면, 라우트에서 이 `tasks` 뷰를 반환하면 됩니다.

```
use App\Models\Task;

Route::get('/tasks', function () {
    return view('tasks', ['tasks' => Task::all()]);
});
```

<a name="layouts-using-template-inheritance"></a>
### 템플릿 상속을 활용한 레이아웃

<a name="defining-a-layout"></a>
#### 레이아웃 정의하기

레이아웃은 "템플릿 상속" 방식으로도 생성할 수 있습니다. 이는 [컴포넌트](#components)가 도입되기 전 애플리케이션 구조의 기본 방식이었습니다.

간단한 예제로 시작해보겠습니다. 우선, 페이지 레이아웃을 정의해보죠. 대부분의 웹 애플리케이션은 여러 페이지에서 동일한 레이아웃을 유지하므로, 레이아웃을 하나의 Blade 뷰로 정의하는 것이 편리합니다.

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

보시다시피, 일반적인 HTML 마크업으로 되어 있습니다. 여기서 `@section`과 `@yield` 지시어에 주목하세요. `@section`은 콘텐츠 영역을 정의하며, `@yield`는 해당 영역의 내용을 출력할 때 사용됩니다.

이제 애플리케이션의 레이아웃을 정의했으니, 이를 상속하는 하위 페이지를 만들어봅시다.

<a name="extending-a-layout"></a>
#### 레이아웃 확장하기

하위 뷰를 작성할 때는 `@extends` Blade 지시어로 상속할 레이아웃을 지정합니다. 레이아웃을 상속하는 하위 뷰는 `@section` 지시어를 통해 원하는 섹션에 콘텐츠를 주입할 수 있습니다. 위 예시에서 본 것처럼, 각 섹션의 내용은 레이아웃에서 `@yield`로 출력됩니다.

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

이 예시에서, `sidebar` 섹션에서는 `@@parent` 지시어를 사용해 기존 레이아웃의 사이드바 내용 뒤에 추가 내용을 붙이고 있습니다. `@@parent` 지시어는 뷰가 렌더링될 때 레이아웃의 해당 부분으로 대체됩니다.

> [!NOTE]  
> 앞선 예제와는 달리, 이 `sidebar` 섹션은 마지막에 `@endsection`으로 끝납니다(`@show`가 아님). `@endsection`은 해당 영역만 정의하며, `@show`는 영역 정의와 동시에 **즉시 출력**합니다.

`@yield` 지시어는 두 번째 인수로 기본값도 받을 수 있습니다. 지정한 섹션이 정의되지 않았을 때 이 값이 렌더링됩니다.

```blade
@yield('content', 'Default content')
```

<a name="forms"></a>
## 폼(Forms)

<a name="csrf-field"></a>
### CSRF 필드

애플리케이션에서 HTML 폼을 정의할 때는 [CSRF 보호](/docs/11.x/csrf) 미들웨어가 요청을 검증할 수 있도록 반드시 숨겨진 CSRF 토큰 필드를 포함해야 합니다. `@csrf` Blade 지시어를 사용하면 간편하게 토큰 필드를 생성할 수 있습니다.

```blade
<form method="POST" action="/profile">
    @csrf

    ...
</form>
```

<a name="method-field"></a>
### 메서드 필드

HTML 폼은 `PUT`, `PATCH`, `DELETE`와 같은 요청을 직접 보낼 수 없습니다. 따라서 이런 HTTP 메서드를 모방하려면 숨은 `_method` 필드를 추가해야 합니다. `@method` Blade 지시어로 이 필드를 쉽게 생성할 수 있습니다.

```blade
<form action="/foo/bar" method="POST">
    @method('PUT')

    ...
</form>
```

<a name="validation-errors"></a>
### 유효성 검증 에러

`@error` 지시어를 사용하면 [유효성 검증 에러 메시지](/docs/11.x/validation#quick-displaying-the-validation-errors)가 해당 속성에 대해 존재하는지 빠르게 확인할 수 있습니다. `@error` 블록 내에서는 `$message` 변수를 echo 하여 에러 메시지를 출력할 수 있습니다.

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

`@error` 지시어는 내부적으로 "if" 문으로 변환되므로, 에러가 없을 때 다른 내용을 출력하고 싶다면 `@else` 지시어를 함께 사용할 수 있습니다.

```blade
<!-- /resources/views/auth.blade.php -->

<label for="email">Email address</label>

<input
    id="email"
    type="email"
    class="@error('email') is-invalid @else is-valid @enderror"
/>
```

여러 폼이 있는 페이지에서 [특정 에러 백의 이름](/docs/11.x/validation#named-error-bags)을 두 번째 매개변수로 전달하면 명명된 에러 백에 대한 검증 메시지도 얻을 수 있습니다.

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

## 스택

Blade에서는 이름이 지정된 스택(named stack)에 내용을 추가할 수 있으며, 이 스택은 다른 뷰나 레이아웃의 원하는 위치에서 렌더링할 수 있습니다. 이 기능은 특히 자식 뷰에서 필요한 JavaScript 라이브러리를 지정할 때 유용하게 사용할 수 있습니다.

```blade
@push('scripts')
    <script src="/example.js"></script>
@endpush
```

만약 어떤 불리언(boolean) 식이 `true`일 때만 `@push`로 내용을 추가하려면, `@pushIf` 디렉티브를 사용할 수 있습니다.

```blade
@pushIf($shouldPush, 'scripts')
    <script src="/example.js"></script>
@endPushIf
```

하나의 스택에는 몇 번이든 자유롭게 내용을 추가(push)할 수 있습니다. 이렇게 추가한 스택의 전체 내용을 렌더링하려면, `@stack` 디렉티브에 스택의 이름을 넣어 사용하면 됩니다.

```blade
<head>
    <!-- Head Contents -->

    @stack('scripts')
</head>
```

스택의 앞부분에 내용을 추가하고 싶다면, `@prepend` 디렉티브를 사용해야 합니다.

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
## 서비스 주입

`@inject` 디렉티브를 사용해 [서비스 컨테이너](/docs/11.x/container)에서 서비스를 추출해 뷰에서 사용할 수 있습니다. `@inject`의 첫 번째 인자는 서비스가 저장될 변수명이고, 두 번째 인자는 주입받고자 하는 서비스의 클래스명 또는 인터페이스명입니다.

```blade
@inject('metrics', 'App\Services\MetricsService')

<div>
    Monthly Revenue: {{ $metrics->monthlyRevenue() }}.
</div>
```

<a name="rendering-inline-blade-templates"></a>
## 인라인 Blade 템플릿 렌더링

간혹 원시 Blade 템플릿 문자열을 실제 HTML로 변환해야 할 때가 있습니다. 이럴 때는 `Blade` 파사드의 `render` 메서드를 사용하면 됩니다. `render` 메서드는 Blade 템플릿 문자열과, 선택적으로 뷰에 전달할 데이터를 배열로 받을 수 있습니다.

```php
use Illuminate\Support\Facades\Blade;

return Blade::render('Hello, {{ $name }}', ['name' => 'Julian Bashir']);
```

라라벨은 인라인 Blade 템플릿을 렌더링할 때 임시로 해당 템플릿을 `storage/framework/views` 디렉토리에 기록합니다. 만약 Blade 템플릿 렌더링 후 이러한 임시 파일을 자동으로 삭제하고 싶다면, `deleteCachedView` 인자를 메서드에 전달하면 됩니다.

```php
return Blade::render(
    'Hello, {{ $name }}',
    ['name' => 'Julian Bashir'],
    deleteCachedView: true
);
```

<a name="rendering-blade-fragments"></a>
## Blade 프래그먼트(Fragment) 렌더링

[Tubro](https://turbo.hotwired.dev/)나 [htmx](https://htmx.org/) 같은 프론트엔드 프레임워크를 사용할 때, HTTP 응답으로 Blade 템플릿의 특정 부분만 반환하고 싶을 수 있습니다. Blade "프래그먼트" 기능을 사용하면 이러한 작업이 가능합니다. 먼저, Blade 템플릿에서 반환하고자 하는 영역을 `@fragment`와 `@endfragment` 디렉티브로 감쌉니다.

```blade
@fragment('user-list')
    <ul>
        @foreach ($users as $user)
            <li>{{ $user->name }}</li>
        @endforeach
    </ul>
@endfragment
```

이제 이 템플릿을 사용하는 뷰를 렌더링할 때, `fragment` 메서드를 호출해 특정 프래그먼트만 HTTP 응답에 포함할 수 있습니다.

```php
return view('dashboard', ['users' => $users])->fragment('user-list');
```

`fragmentIf` 메서드를 사용하면 주어진 조건에 따라 뷰의 프래그먼트만 반환하거나, 조건에 맞지 않으면 전체 뷰를 반환할 수 있습니다.

```php
return view('dashboard', ['users' => $users])
    ->fragmentIf($request->hasHeader('HX-Request'), 'user-list');
```

`fragments` 및 `fragmentsIf` 메서드를 사용하면 응답으로 복수의 뷰 프래그먼트를 반환할 수 있습니다. 반환되는 프래그먼트들은 하나로 합쳐집니다.

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

Blade에서는 `directive` 메서드를 이용해 커스텀 디렉티브를 정의할 수 있습니다. Blade 컴파일러가 커스텀 디렉티브를 만나면, 해당 디렉티브에 포함된 식(expression)을 콜백 함수에 인수로 전달합니다.

아래 예시는 주어진 `$var`(반드시 `DateTime` 인스턴스여야 함)를 포맷해주는 `@datetime($var)` 디렉티브를 만드는 방법을 보여줍니다.

```
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

보시는 것처럼, 전달받은 식에 `format` 메서드를 체이닝해서 사용합니다. 따라서 위 예시에서 최종적으로 해당 디렉티브가 생성하는 PHP 코드는 다음과 같습니다.

```
<?php echo ($var)->format('m/d/Y H:i'); ?>
```

> [!WARNING]  
> Blade 디렉티브의 동작 로직을 수정했다면, 반드시 캐시된 Blade 뷰 파일을 모두 삭제해야 합니다. 캐시된 Blade 뷰는 `view:clear` Artisan 명령어로 삭제할 수 있습니다.

<a name="custom-echo-handlers"></a>
### 커스텀 Echo 핸들러

Blade에서 객체를 "echo"로 출력할 경우, 해당 객체의 `__toString` 메서드가 자동으로 호출됩니다. [`__toString`](https://www.php.net/manual/en/language.oop5.magic.php#object.tostring) 메서드는 PHP의 내장 "매직 메서드" 중 하나입니다. 하지만, 사용하려는 클래스가 외부 라이브러리 소속이어서 그 클래스의 `__toString` 메서드를 직접 제어할 수 없는 경우도 있습니다.

이러한 경우 Blade에서는 특정 객체 타입에 대해 커스텀 echo 핸들러를 등록할 수 있습니다. 이를 위해서는 Blade의 `stringable` 메서드를 사용합니다. `stringable` 메서드는 클로저(익명 함수)를 인수로 받으며, 반드시 해당 객체 타입이 명시된 타입힌트가 포함되어야 합니다. 일반적으로, 이 메서드는 애플리케이션의 `AppServiceProvider` 클래스의 `boot` 메서드에서 호출합니다.

```
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

커스텀 echo 핸들러가 정의되면, Blade 템플릿에서 객체를 바로 출력할 수 있습니다.

```blade
Cost: {{ $money }}
```

<a name="custom-if-statements"></a>
### 커스텀 If 문

커스텀 디렉티브를 직접 만드는 것은 단순한 조건문만 구현하려는 경우에는 오히려 복잡할 수 있습니다. Blade는 간단한 조건문을 쉽게 커스텀할 수 있도록, 클로저를 활용하는 `Blade::if` 메서드를 제공합니다. 예를 들어, 애플리케이션의 기본 "디스크(disk)" 설정 값을 확인하는 커스텀 조건문을 아래와 같이 정의할 수 있습니다. 이 작업은 주로 `AppServiceProvider`의 `boot` 메서드 내에서 이루어집니다.

```
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

이렇게 커스텀 조건문을 정의했으면, Blade 템플릿에서 바로 사용할 수 있습니다.

```blade
@disk('local')
    <!-- The application is using the local disk... -->
@elsedisk('s3')
    <!-- The application is using the s3 disk... -->
@else
    <!-- The application is using some other disk... -->
@enddisk

@unlessdisk('local')
    <!-- The application is not using the local disk... -->
@enddisk
```