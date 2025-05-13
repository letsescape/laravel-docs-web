# 블레이드 템플릿 (Blade Templates)

- [소개](#introduction)
    - [Livewire로 블레이드 확장하기](#supercharging-blade-with-livewire)
- [데이터 표시하기](#displaying-data)
    - [HTML 엔터티 인코딩](#html-entity-encoding)
    - [블레이드와 자바스크립트 프레임워크](#blade-and-javascript-frameworks)
- [블레이드 지시문](#blade-directives)
    - [If 문](#if-statements)
    - [Switch 문](#switch-statements)
    - [반복문](#loops)
    - [Loop 변수](#the-loop-variable)
    - [조건부 클래스](#conditional-classes)
    - [추가 속성](#additional-attributes)
    - [서브뷰 포함하기](#including-subviews)
    - [`@once` 지시문](#the-once-directive)
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
    - [데이터 프로퍼티 / 속성](#data-properties-attributes)
    - [부모 데이터 접근하기](#accessing-parent-data)
    - [익명 컴포넌트 경로](#anonymous-component-paths)
- [레이아웃 빌드하기](#building-layouts)
    - [컴포넌트를 활용한 레이아웃](#layouts-using-components)
    - [템플릿 상속 레이아웃](#layouts-using-template-inheritance)
- [폼](#forms)
    - [CSRF 필드](#csrf-field)
    - [Method 필드](#method-field)
    - [유효성 검증 에러](#validation-errors)
- [스택스](#stacks)
- [서비스 주입](#service-injection)
- [인라인 블레이드 템플릿 렌더링](#rendering-inline-blade-templates)
- [블레이드 프래그먼트 렌더링](#rendering-blade-fragments)
- [블레이드 확장하기](#extending-blade)
    - [커스텀 Echo 핸들러](#custom-echo-handlers)
    - [커스텀 If 문](#custom-if-statements)

<a name="introduction"></a>
## 소개

Blade는 라라벨에 기본 내장된 간단하면서도 강력한 템플릿 엔진입니다. 일부 PHP 템플릿 엔진과는 달리 Blade는 템플릿에서 순수 PHP 코드를 자유롭게 사용할 수 있습니다. 실제로, 모든 Blade 템플릿은 순수 PHP 코드로 컴파일되어 변경될 때까지 캐시되므로, 사실상 애플리케이션에 거의 오버헤드를 추가하지 않습니다. Blade 템플릿 파일은 `.blade.php` 확장자를 사용하며 보통 `resources/views` 디렉터리에 저장합니다.

Blade 뷰는 전역 `view` 헬퍼를 이용하여 라우트나 컨트롤러에서 반환할 수 있습니다. 물론 [뷰](/docs/views) 문서에서 설명했듯이, `view` 헬퍼의 두 번째 인수를 통해 Blade 뷰로 데이터를 전달할 수도 있습니다.

```php
Route::get('/', function () {
    return view('greeting', ['name' => 'Finn']);
});
```

<a name="supercharging-blade-with-livewire"></a>
### Livewire로 블레이드 확장하기

Blade 템플릿을 한 단계 더 업그레이드해서 동적인 인터페이스도 쉽게 만들어보고 싶으신가요? [Laravel Livewire](https://livewire.laravel.com)를 살펴보시기 바랍니다. Livewire를 사용하면 보통은 React나 Vue 같은 프런트엔드 프레임워크로만 할 수 있었던 동적 기능을 블레이드 컴포넌트에서도 쉽게 구현할 수 있습니다. 이를 통해 복잡한 빌드 과정이나, 클라이언트 측 렌더링에 대한 부담 없이도 현대적인 리액티브 프론트엔드를 간편하게 만들 수 있습니다.

<a name="displaying-data"></a>
## 데이터 표시하기

Blade 뷰로 전달된 데이터를 중괄호로 감싸서 화면에 표시할 수 있습니다. 예를 들어 다음과 같은 라우트가 있다고 할 때:

```php
Route::get('/', function () {
    return view('welcome', ['name' => 'Samantha']);
});
```

다음과 같이 `name` 변수를 출력할 수 있습니다.

```blade
Hello, {{ $name }}.
```

> [!NOTE]
> Blade의 `{{ }}` 이코 출력 구문은 PHP의 `htmlspecialchars` 함수로 자동 변환되어 XSS 공격을 방지합니다.

뷰에 전달된 변수만 표시할 필요는 없습니다. PHP의 함수 결과를 그대로 출력할 수도 있고, Blade 이코 구문 내에 원하는 모든 PHP 코드를 사용할 수 있습니다.

```blade
The current UNIX timestamp is {{ time() }}.
```

<a name="html-entity-encoding"></a>
### HTML 엔터티 인코딩

기본적으로 Blade(그리고 라라벨의 `e` 함수)는 HTML 엔터티를 이중으로 인코딩합니다. 이중 인코딩을 비활성화하려면 `AppServiceProvider`의 `boot` 메서드에서 `Blade::withoutDoubleEncoding` 메서드를 호출하세요.

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
#### 이스케이프하지 않은 데이터 표시

기본적으로 Blade의 `{{ }}` 구문은 XSS 공격을 막기 위해 데이터를 PHP의 `htmlspecialchars` 함수로 자동 이스케이프합니다. 만약 이스케이프하지 않은 데이터를 표시하고 싶다면 다음과 같은 문법을 사용할 수 있습니다.

```blade
Hello, {!! $name !!}.
```

> [!WARNING]
> 애플리케이션 사용자가 제공한 데이터를 그대로 출력할 때는 매우 주의해야 합니다. 일반적으로 사용자 데이터는 반드시 이스케이프(중괄호 두 개) 문법을 사용하여 XSS 공격을 방지해야 합니다.

<a name="blade-and-javascript-frameworks"></a>
### 블레이드와 자바스크립트 프레임워크

많은 자바스크립트 프레임워크에서도 "중괄호" 기호를 사용해 값을 브라우저에 표시해야 할 부분을 나타냅니다. 이 경우, Blade가 해당 표현식을 건드리지 않도록 `@` 기호를 앞에 붙이면 블레이드 렌더링 엔진이 무시합니다. 예를 들어,

```blade
<h1>Laravel</h1>

Hello, @{{ name }}.
```

이 예시에서 `@` 기호는 Blade에서 제거되며, `{{ name }}` 표현식은 Blade에서 변환하지 않고 그대로 남기기 때문에, 자바스크립트 프레임워크가 렌더링할 수 있습니다.

또한, `@` 기호는 블레이드 지시문을 이스케이프하는 데에도 사용할 수 있습니다.

```blade
{{-- Blade template --}}
@@if()

<!-- HTML output -->
@if()
```

<a name="rendering-json"></a>
#### JSON 렌더링하기

자바스크립트 변수를 초기화하기 위해 배열을 JSON으로 변환해서 뷰로 전달하는 경우가 있습니다. 예를 들어,

```php
<script>
    var app = <?php echo json_encode($array); ?>;
</script>
```

이렇게 직접적으로 `json_encode`를 호출하는 대신, `Illuminate\Support\Js::from` 메서드 지시문을 사용할 수 있습니다. `from` 메서드는 PHP의 `json_encode` 함수와 동일한 인수를 받을 수 있으며, HTML 따옴표 내부에서 사용해도 안전하도록 JSON을 적절히 이스케이프해 줍니다. 이 메서드는 주어진 객체나 배열을 유효한 자바스크립트 객체로 변환하는 `JSON.parse` 문장을 반환합니다.

```blade
<script>
    var app = {{ Illuminate\Support\Js::from($array) }};
</script>
```

가장 최근 라라벨 애플리케이션 스캐폴딩에는 `Js` 파사드가 포함되어 있어서 Blade 템플릿에서 이 기능을 더욱 편리하게 사용할 수 있습니다.

```blade
<script>
    var app = {{ Js::from($array) }};
</script>
```

> [!WARNING]
> `Js::from` 메서드는 이미 존재하는 변수를 JSON으로 렌더링할 때만 사용해야 합니다. 블레이드 템플릿 엔진은 정규표현식 기반이기 때문에 복잡한 표현식을 이 지시문에 전달하면 예기치 않은 에러가 발생할 수 있습니다.

<a name="the-at-verbatim-directive"></a>
#### `@verbatim` 지시문

템플릿의 많은 부분에서 자바스크립트 변수를 사용해야 할 경우, 매번 Blade 이코 구문마다 `@` 기호를 붙이지 않고, 해당 HTML을 `@verbatim` 지시문으로 감쌀 수 있습니다.

```blade
@verbatim
    <div class="container">
        Hello, {{ name }}.
    </div>
@endverbatim
```

<a name="blade-directives"></a>
## 블레이드 지시문

템플릿 상속이나 데이터 출력 외에도, Blade는 조건문이나 반복문과 같은 일반적인 PHP 제어구문을 간결하게 사용할 수 있는 다양한 단축 지시문을 제공합니다. 이 지시문들은 PHP와 거의 동일한 익숙한 방식으로, 훨씬 깔끔하고 짧게 코드를 작성할 수 있게 해줍니다.

<a name="if-statements"></a>
### If 문

`@if`, `@elseif`, `@else`, `@endif` 지시문을 사용해서 조건문을 만들 수 있습니다. 이 지시문들은 PHP의 해당 제어문과 기능이 동일합니다.

```blade
@if (count($records) === 1)
    I have one record!
@elseif (count($records) > 1)
    I have multiple records!
@else
    I don't have any records!
@endif
```

더 편리하게, Blade에서는 `@unless` 지시문도 사용할 수 있습니다.

```blade
@unless (Auth::check())
    You are not signed in.
@endunless
```

앞에서 다룬 조건문 이외에도, PHP 함수와 동일하게 동작하는 `@isset` 및 `@empty` 지시문을 사용할 수 있습니다.

```blade
@isset($records)
    // $records가 정의되어 있고 null이 아님...
@endisset

@empty($records)
    // $records가 "비어있음"...
@endempty
```

<a name="authentication-directives"></a>
#### 인증 지시문

`@auth`와 `@guest` 지시문을 사용하여 현재 사용자가 [인증](/docs/authentication) 상태인지, 게스트인지 쉽게 확인할 수 있습니다.

```blade
@auth
    // 사용자가 인증된 상태...
@endauth

@guest
    // 사용자가 인증되지 않은 상태...
@endguest
```

필요하다면, `@auth`와 `@guest` 지시문에 사용할 인증 가드를 명시할 수도 있습니다.

```blade
@auth('admin')
    // 사용자가 인증된 상태...
@endauth

@guest('admin')
    // 사용자가 인증되지 않은 상태...
@endguest
```

<a name="environment-directives"></a>
#### 환경 지시문

`@production` 지시문으로 애플리케이션이 프로덕션 환경에서 실행되고 있는지 확인할 수 있습니다.

```blade
@production
    // 프로덕션 전용 콘텐츠...
@endproduction
```

또한, `@env` 지시문을 사용하면 애플리케이션이 특정 환경에서 동작 중인지 확인할 수 있습니다.

```blade
@env('staging')
    // 애플리케이션이 "staging" 환경에서 실행 중...
@endenv

@env(['staging', 'production'])
    // 애플리케이션이 "staging" 또는 "production" 환경에서 실행 중...
@endenv
```

<a name="section-directives"></a>
#### Section 지시문

템플릿 상속의 특정 섹션에 내용이 있는지 `@hasSection` 지시문으로 확인할 수 있습니다.

```blade
@hasSection('navigation')
    <div class="pull-right">
        @yield('navigation')
    </div>

    <div class="clearfix"></div>
@endif
```

섹션에 내용이 없는 경우를 확인하려면 `sectionMissing` 지시문을 사용할 수 있습니다.

```blade
@sectionMissing('navigation')
    <div class="pull-right">
        @include('default-navigation')
    </div>
@endif
```

<a name="session-directives"></a>
#### 세션 지시문

`@session` 지시문을 사용하면 [세션](/docs/session) 값이 존재하는지 확인할 수 있습니다. 세션 값이 있으면 `@session`과 `@endsession` 사이의 템플릿 내용이 평가됩니다. 이 블록 안에서는 `$value` 변수를 출력하여 세션 값을 표시할 수 있습니다.

```blade
@session('status')
    <div class="p-4 bg-green-100">
        {{ $value }}
    </div>
@endsession
```

<a name="switch-statements"></a>
### Switch 문

`@switch`, `@case`, `@break`, `@default`, `@endswitch` 지시문을 사용해서 Switch 문을 만들 수 있습니다.

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

조건문뿐 아니라, Blade는 PHP 반복문을 위해 간단한 지시문도 제공합니다. 이 역시 각각의 지시문이 PHP와 동일하게 동작합니다.

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
> `foreach` 반복문을 실행하는 동안에는 [loop 변수](#the-loop-variable)를 이용해서 루프의 첫 번째, 마지막 반복 등 유용한 정보를 확인할 수 있습니다.

반복문에서는 `@continue`나 `@break` 지시문을 사용하여 현재 반복을 건너뛰거나 반복을 종료할 수 있습니다.

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

또는, 계속 반복/중지 조건을 지시문 선언부에 직접 입력할 수도 있습니다.

```blade
@foreach ($users as $user)
    @continue($user->type == 1)

    <li>{{ $user->name }}</li>

    @break($user->number == 5)
@endforeach
```

<a name="the-loop-variable"></a>
### Loop 변수

`foreach` 반복문 내에서는 `$loop` 변수가 자동으로 제공됩니다. 이 변수는 현재 반복의 인덱스, 첫/마지막 반복 여부 등 유용한 정보를 담고 있습니다.

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

중첩 반복문일 경우, 부모 반복문의 `$loop` 변수는 `parent` 프로퍼티로 접근할 수 있습니다.

```blade
@foreach ($users as $user)
    @foreach ($user->posts as $post)
        @if ($loop->parent->first)
            This is the first iteration of the parent loop.
        @endif
    @endforeach
@endforeach
```

`$loop` 변수에는 다음과 같은 다양한 속성들이 있습니다.

<div class="overflow-auto">

| 속성               | 설명                                                    |
| ------------------ | ------------------------------------------------------ |
| `$loop->index`     | 현재 반복의 인덱스(0부터 시작).                         |
| `$loop->iteration` | 현재 반복 횟수(1부터 시작).                             |
| `$loop->remaining` | 루프 안에서 남은 반복 횟수.                            |
| `$loop->count`     | 반복 대상 배열의 전체 항목 수.                          |
| `$loop->first`     | 첫 번째 반복인지 여부.                                  |
| `$loop->last`      | 마지막 반복인지 여부.                                   |
| `$loop->even`      | 짝수 번째 반복인지 여부.                                |
| `$loop->odd`       | 홀수 번째 반복인지 여부.                                |
| `$loop->depth`     | 현재 반복문의 중첩 깊이(레벨).                          |
| `$loop->parent`    | 중첩된 반복문에서 부모 반복문 변수.                     |

</div>

<a name="conditional-classes"></a>
### 조건부 클래스 & 스타일

`@class` 지시문을 사용하면 조건에 맞게 CSS 클래스를 동적으로 조합해줄 수 있습니다. 이 지시문에는 클래스 이름을 키로, 불린 값을 값으로 하는 배열을 전달합니다. 배열의 키가 숫자인 경우, 해당 클래스는 무조건 렌더링 클래스 목록에 포함됩니다.

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

마찬가지로, `@style` 지시문을 사용하면 HTML 요소에 인라인 스타일을 조건부로 추가할 수 있습니다.

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

편의를 위해, `@checked` 지시문을 사용하면 체크박스 입력 항목이 "checked" 상태인지 쉽게 표현할 수 있습니다. 전달된 조건이 `true`이면 `checked`가 출력됩니다.

```blade
<input
    type="checkbox"
    name="active"
    value="active"
    @checked(old('active', $user->active))
/>
```

마찬가지로, `@selected` 지시문을 사용하여 특정 select 옵션이 "selected" 상태인지 명시할 수 있습니다.

```blade
<select name="version">
    @foreach ($product->versions as $version)
        <option value="{{ $version }}" @selected(old('version') == $version)>
            {{ $version }}
        </option>
    @endforeach
</select>
```

또한, `@disabled` 지시문을 통해 특정 요소가 "disabled" 상태가 되도록 지정할 수 있습니다.

```blade
<button type="submit" @disabled($errors->isNotEmpty())>Submit</button>
```

더불어, `@readonly` 지시문을 사용하면 해당 요소를 "readonly" 상태로 만들 수 있습니다.

```blade
<input
    type="email"
    name="email"
    value="email@laravel.com"
    @readonly($user->isNotAdmin())
/>
```

그리고, `@required` 지시문을 이용해 해당 요소를 "required" 상태로 만들 수도 있습니다.

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
> `@include` 지시문은 자유롭게 사용할 수 있지만, Blade의 [컴포넌트](#components)는 이와 비슷한 기능을 제공하며 데이터, 속성 바인딩 등 여러 면에서 더 나은 장점이 있습니다.

Blade의 `@include` 지시문을 사용하면 다른 뷰 파일을 현재 뷰에 포함시킬 수 있습니다. 부모 뷰에서 이용 가능한 모든 변수는 포함된 뷰에서도 그대로 사용할 수 있습니다.

```blade
<div>
    @include('shared.errors')

    <form>
        <!-- Form Contents -->
    </form>
</div>
```

포함된 뷰가 부모 뷰의 모든 데이터를 상속받긴 하지만, 추가적으로 별도의 데이터 배열을 전달할 수도 있습니다.

```blade
@include('view.name', ['status' => 'complete'])
```

포함하려는 뷰가 존재하지 않을 경우 Laravel은 에러를 발생시킵니다. 뷰가 있는 경우에만 포함하고 싶다면 `@includeIf` 지시문을 사용하세요.

```blade
@includeIf('view.name', ['status' => 'complete'])
```

특정 불리언 조건이 `true` 혹은 `false`일 때만 뷰를 포함하고 싶다면, 각각 `@includeWhen`, `@includeUnless` 지시문을 사용할 수 있습니다.

```blade
@includeWhen($boolean, 'view.name', ['status' => 'complete'])

@includeUnless($boolean, 'view.name', ['status' => 'complete'])
```

여러 뷰 중에서 처음으로 존재하는 뷰만 포함하고 싶을 때는 `includeFirst` 지시문을 사용하면 됩니다.

```blade
@includeFirst(['custom.admin', 'admin'], ['status' => 'complete'])
```

> [!WARNING]
> Blade 뷰에서 `__DIR__` 및 `__FILE__` 상수는 사용을 피하는 것이 좋습니다. 이 값들은 캐시된 컴파일 뷰의 위치를 참조하게 됩니다.

<a name="rendering-views-for-collections"></a>

#### 컬렉션을 위한 뷰 렌더링

Blade의 `@each` 디렉티브를 이용하면 반복문과 포함(`include`)을 한 줄로 간단하게 결합할 수 있습니다.

```blade
@each('view.name', $jobs, 'job')
```

`@each` 디렉티브의 첫 번째 인수는 배열이나 컬렉션의 각 요소마다 렌더링할 뷰입니다. 두 번째 인수에는 반복할 배열이나 컬렉션을, 세 번째 인수는 현재 반복되는 항목이 뷰 내에서 사용할 변수명을 지정합니다. 예를 들어 `jobs` 배열을 반복하고 있다면, 각 반복에서 해당 `job` 항목을 `job` 변수로 뷰에서 접근할 수 있습니다. 반복문의 현재 배열 키는 `key`라는 변수로 뷰에서 사용할 수 있습니다.

`@each` 디렉티브에는 네 번째 인수를 전달할 수도 있습니다. 네 번째 인수는 전달된 배열이 비어있을 때 렌더링할 뷰를 지정합니다.

```blade
@each('view.name', $jobs, 'job', 'view.empty')
```

> [!WARNING]
> `@each`로 렌더링된 뷰는 부모 뷰의 변수를 상속받지 않습니다. 만약 자식 뷰에서 부모 뷰의 변수가 필요하다면 `@foreach`와 `@include` 디렉티브를 대신 사용해야 합니다.

<a name="the-once-directive"></a>
### `@once` 디렉티브

`@once` 디렉티브는 템플릿 내에서 해당 블록이 렌더링 사이클마다 오직 한 번만 실행되도록 정의할 수 있게 해줍니다. 이는 [스택(stacks)](#stacks)를 사용해 특정 자바스크립트를 페이지의 헤더에 한 번만 추가하고 싶을 때 유용합니다. 예를 들어, [컴포넌트](#components)를 반복문 안에서 렌더링할 때 자바스크립트는 처음 한 번만 헤더에 푸시하고 싶다면 다음과 같이 사용할 수 있습니다.

```blade
@once
    @push('scripts')
        <script>
            // Your custom JavaScript...
        </script>
    @endpush
@endonce
```

`@once` 디렉티브는 보통 `@push` 또는 `@prepend` 디렉티브와 함께 자주 사용되기 때문에, 편의성을 위해 `@pushOnce`와 `@prependOnce` 디렉티브도 제공합니다.

```blade
@pushOnce('scripts')
    <script>
        // Your custom JavaScript...
    </script>
@endPushOnce
```

<a name="raw-php"></a>
### 순수 PHP 코드 사용

특정 상황에서는 뷰에 PHP 코드를 직접 삽입해야 할 때가 있습니다. Blade의 `@php` 디렉티브를 사용하면 템플릿 내에서 순수 PHP 코드 블록을 실행할 수 있습니다.

```blade
@php
    $counter = 1;
@endphp
```

또한, 단순히 클래스를 불러오기만 하고 싶다면 `@use` 디렉티브를 사용할 수 있습니다.

```blade
@use('App\Models\Flight')
```

두 번째 인수로 클래스를 불러올 때 별칭을 지정할 수도 있습니다.

```blade
@use('App\Models\Flight', 'FlightModel')
```

같은 네임스페이스 내에 여러 클래스를 한 번에 불러오고 싶다면 아래와 같이 그룹 임포트를 사용할 수 있습니다.

```blade
@use('App\Models\{Flight, Airport}')
```

`@use` 디렉티브는 `function` 또는 `const` 한정자를 앞에 붙여 PHP 함수와 상수도 임포트할 수 있습니다.

```blade
@use(function App\Helpers\format_currency)
```

함수나 상수 역시 클래스와 동일하게 별칭을 지정할 수 있습니다.

```blade
@use(function App\Helpers\format_currency, 'formatMoney')
@use(const App\Constants\MAX_ATTEMPTS, 'MAX_TRIES')
```

함수와 상수에 대해서도 아래와 같이 그룹 임포트를 지원하여 같은 네임스페이스 내 여러 심볼을 한 번에 불러올 수 있습니다.

```blade
@use(function App\Helpers\{format_currency, format_date})
@use(const App\Constants\{MAX_ATTEMPTS, DEFAULT_TIMEOUT})
```

<a name="comments"></a>
### 주석

Blade에서는 뷰 안에 주석을 작성할 수도 있습니다. 다만, HTML 주석과는 다르게 Blade 주석은 반환되는 HTML에는 전혀 포함되지 않습니다.

```blade
{{-- 이 주석은 렌더링된 HTML에 포함되지 않습니다 --}}
```

<a name="components"></a>
## 컴포넌트

컴포넌트와 슬롯(slot)은 섹션, 레이아웃, 인클루드(`include`)가 제공하는 것과 유사한 장점을 제공합니다. 하지만 컴포넌트와 슬롯의 개념이 더 직관적이라고 느낄 수도 있습니다. 컴포넌트는 클래스 기반 컴포넌트와 익명 컴포넌트, 두 가지 방식으로 작성할 수 있습니다.

클래스 기반 컴포넌트를 만들 때에는 `make:component` Artisan 명령어를 사용합니다. 예를 들어 `Alert` 컴포넌트를 생성한다고 가정하면, `make:component` 명령어는 컴포넌트를 `app/View/Components` 디렉터리에 생성합니다.

```shell
php artisan make:component Alert
```

`make:component` 명령어는 동시에 해당 컴포넌트 전용 뷰 템플릿도 만듭니다. 이 뷰는 `resources/views/components` 디렉터리에 위치합니다. 라라벨 애플리케이션의 경우, `app/View/Components` 디렉터리와 `resources/views/components` 디렉터리에 위치한 컴포넌트는 별도의 등록 과정 없이 자동으로 인식됩니다.

하위 디렉터리 내에 컴포넌트를 생성할 수도 있습니다.

```shell
php artisan make:component Forms/Input
```

이 명령어는 `app/View/Components/Forms` 하위에 `Input` 컴포넌트를 생성하고, 해당 뷰 파일은 `resources/views/components/forms` 디렉터리에 만들어집니다.

익명 컴포넌트(즉, 클래스 없이 Blade 템플릿 파일로만 이루어진 컴포넌트)를 만들고 싶다면 `make:component` 명령어에 `--view` 옵션을 사용할 수 있습니다.

```shell
php artisan make:component forms.input --view
```

이 명령어는 `resources/views/components/forms/input.blade.php` 경로에 Blade 파일을 생성하며, 해당 컴포넌트는 `<x-forms.input />` 형태로 사용할 수 있습니다.

<a name="manually-registering-package-components"></a>
#### 패키지 컴포넌트 수동 등록

자체 애플리케이션의 컴포넌트는 `app/View/Components` 디렉터리와 `resources/views/components` 디렉터리 내에 자동으로 인식됩니다.

하지만 패키지를 개발하며 Blade 컴포넌트를 사용하는 경우에는 컴포넌트 클래스와 HTML 태그 별칭을 직접 등록해야 합니다. 보통 패키지의 서비스 프로바이더 내 `boot` 메서드에서 아래와 같이 등록합니다.

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

위와 같이 등록 후에는 HTML 태그 별칭으로 컴포넌트를 사용할 수 있습니다.

```blade
<x-package-alert/>
```

또는, `componentNamespace` 메서드를 사용해서 컴포넌트 클래스를 규칙적으로 오토로드할 수도 있습니다. 예를 들어, `Nightshade`라는 패키지가 `Package\Views\Components` 네임스페이스 내에 `Calendar`와 `ColorPicker` 컴포넌트를 갖고 있다면 아래와 같이 등록합니다.

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

이렇게 하면, 패키지 컴포넌트를 벤더 네임스페이스를 붙여 `package-name::` 형태로 사용할 수 있습니다.

```blade
<x-nightshade::calendar />
<x-nightshade::color-picker />
```

Blade는 컴포넌트명에서 파스칼 케이스를 자동으로 인식하여 해당 클래스를 찾아 연결해 줍니다. 하위 디렉터리도 "점(.) 표기법"을 통해 지원합니다.

<a name="rendering-components"></a>
### 컴포넌트 렌더링

컴포넌트를 사용하려면, Blade 템플릿 내에서 Blade 컴포넌트 태그를 사용하면 됩니다. 컴포넌트 태그는 대시(kebab-case) 형태의 컴포넌트명 앞에 `x-`를 붙여서 사용합니다.

```blade
<x-alert/>

<x-user-profile/>
```

만약 컴포넌트 클래스가 `app/View/Components` 디렉터리의 하위에 위치한다면, 디렉터리 구조를 나타내는 데 점(`.`)을 사용할 수 있습니다. 예를 들어 `app/View/Components/Inputs/Button.php`에 컴포넌트가 있다면 아래와 같이 렌더링합니다.

```blade
<x-inputs.button/>
```

컴포넌트 렌더링을 조건부로 처리하고 싶다면, 컴포넌트 클래스에 `shouldRender` 메서드를 정의할 수 있습니다. 이 메서드가 `false`를 반환하면 컴포넌트는 렌더링되지 않습니다.

```php
use Illuminate\Support\Str;

/**
 * 컴포넌트 렌더링 여부
 */
public function shouldRender(): bool
{
    return Str::length($this->message) > 0;
}
```

<a name="index-components"></a>
### Index 컴포넌트

컴포넌트가 여러 개로 구성된 그룹의 일부이며 하나의 디렉터리로 그룹화하고 싶을 때가 있습니다. 예를 들어 "card" 컴포넌트가 다음과 같은 구조라고 가정해봅시다.

```text
App\Views\Components\Card\Card
App\Views\Components\Card\Header
App\Views\Components\Card\Body
```

루트 `Card` 컴포넌트가 `Card` 디렉터리 안에 있기 때문에 `<x-card.card>` 형태로 사용해야 할 것처럼 보입니다. 하지만, 라라벨은 컴포넌트 파일의 이름이 디렉터리 이름과 일치할 경우 이 컴포넌트를 "루트 컴포넌트"로 간주하여 디렉터리명을 반복할 필요 없이 아래와 같이 사용할 수 있도록 지원합니다.

```blade
<x-card>
    <x-card.header>...</x-card.header>
    <x-card.body>...</x-card.body>
</x-card>
```

<a name="passing-data-to-components"></a>
### 컴포넌트에 데이터 전달

Blade 컴포넌트에 데이터를 전달할 때는 HTML 속성을 사용합니다. 일반 값은 단순히 HTML 속성 문자열로 컴포넌트에 전달할 수 있고, PHP 표현식이나 변수를 전달하려면 속성명 앞에 콜론(`:`)을 붙여 사용합니다.

```blade
<x-alert type="error" :message="$message"/>
```

컴포넌트 클래스의 생성자에서 전체 데이터 속성을 정의해야 합니다. 컴포넌트에 선언된 모든 public 속성(property)은 자동으로 컴포넌트의 뷰에서 사용할 수 있습니다. 데이터를 컴포넌트의 `render` 메서드를 통해 뷰에 전달할 필요는 없습니다.

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

컴포넌트가 렌더링될 때, 컴포넌트의 public 변수를 변수명 그대로 출력하여 사용할 수 있습니다.

```blade
<div class="alert alert-{{ $type }}">
    {{ $message }}
</div>
```

<a name="casing"></a>
#### 네이밍 규칙

컴포넌트 생성자 인수는 `camelCase`로 작성하며, HTML 속성에서 참조할 때는 `kebab-case`로 사용합니다. 예를 들어 아래와 같은 컴포넌트 생성자를 정의했다면

```php
/**
 * 컴포넌트 인스턴스 생성자
 */
public function __construct(
    public string $alertType,
) {}
```

이 경우, HTML에서는 다음과 같이 전달합니다.

```blade
<x-alert alert-type="danger" />
```

<a name="short-attribute-syntax"></a>
#### 속성 단축 표기법

컴포넌트에 속성을 전달할 때 자주 사용하는 간단한 "단축 속성" 표기법도 지원합니다. 주로 속성명과 변수명이 일치할 때 유용합니다.

```blade
{{-- 단축 속성 표기법 --}}
<x-profile :$userId :$name />

{{-- 아래와 동일합니다 --}}
<x-profile :user-id="$userId" :name="$name" />
```

<a name="escaping-attribute-rendering"></a>
#### 속성 렌더링 이스케이프

Alpine.js와 같은 일부 자바스크립트 프레임워크는 콜론으로 시작하는 속성을 사용하기도 합니다. 이럴 때는 `::`(콜론 두 개)를 속성명 앞에 붙이면 Blade가 해당 속성을 PHP 표현식으로 해석하지 않게 할 수 있습니다. 예를 들어 아래와 같은 컴포넌트가 있을 때

```blade
<x-button ::class="{ danger: isDeleting }">
    Submit
</x-button>
```

Blade가 렌더링하는 최종 HTML은 아래와 같습니다.

```blade
<button :class="{ danger: isDeleting }">
    Submit
</button>
```

<a name="component-methods"></a>
#### 컴포넌트 메서드

컴포넌트의 public 변수뿐만 아니라, public 메서드도 컴포넌트 템플릿에서 호출할 수 있습니다. 예를 들어, `isSelected` 메서드를 가진 컴포넌트가 있다면

```php
/**
 * 지정한 옵션이 현재 선택된 옵션인지 판별
 */
public function isSelected(string $option): bool
{
    return $option === $this->selected;
}
```

컴포넌트 템플릿에서 변수처럼 해당 메서드를 호출할 수 있습니다.

```blade
<option {{ $isSelected($value) ? 'selected' : '' }} value="{{ $value }}">
    {{ $label }}
</option>
```

<a name="using-attributes-slots-within-component-class"></a>
#### 컴포넌트 클래스 내에서 속성과 슬롯 접근

Blade 컴포넌트는 컴포넌트 클래스의 `render` 메서드 안에서 컴포넌트명, 속성, 슬롯 등에 접근할 수 있습니다. 이를 위해서는 `render` 메서드에서 클로저(Closure)를 반환해야 합니다.

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

클로저는 인자로 `$data` 배열을 받을 수 있습니다. 이 배열에는 컴포넌트에 대한 다양한 정보가 저장됩니다.

```php
return function (array $data) {
    // $data['componentName'];
    // $data['attributes'];
    // $data['slot'];

    return '<div {{ $attributes }}>Components content</div>';
}
```

> [!WARNING]
> `$data` 배열의 요소를 `render` 메서드에서 반환하는 Blade 문자열에 직접 삽입해서는 안 됩니다. 이는 악의적인 속성값이 들어올 경우 원격 코드 실행 취약점을 유발할 수 있습니다.

`componentName`은 HTML 태그에서 `x-` 접두사를 뺀 이름과 같습니다. 예를 들어 `<x-alert />`라면 `componentName`은 `alert`입니다. `attributes`에는 태그에 명시된 모든 속성이 담기며, `slot`은 컴포넌트 슬롯의 내용을 갖는 `Illuminate\Support\HtmlString` 객체입니다.

클로저는 반드시 문자열을 반환해야 합니다. 반환된 문자열이 실제 뷰 이름과 일치하면 해당 뷰가 렌더링되고, 그렇지 않으면 반환된 문자열 자체가 인라인 Blade 뷰로 해석되어 렌더링됩니다.

<a name="additional-dependencies"></a>
#### 추가 의존성 주입

컴포넌트에서 라라벨의 [서비스 컨테이너](/docs/container)로부터 의존성을 주입받고 싶을 때에는 생성자의 데이터 속성 앞에 의존성 목록을 선언하면 됩니다. 서비스 컨테이너에 의해 자동으로 주입됩니다.

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

컴포넌트 템플릿에서 일부 public 메서드나 속성을 변수로 노출하고 싶지 않을 때에는 `$except` 배열 속성에 해당 이름을 추가할 수 있습니다.

```php
<?php

namespace App\View\Components;

use Illuminate\View\Component;

class Alert extends Component
{
    /**
     * 컴포넌트 템플릿에 노출하지 않을 속성/메서드
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
### 컴포넌트 속성(Attributes)

앞서 살펴본 것처럼 컴포넌트에 데이터 속성을 전달할 수 있지만, 컴포넌트의 핵심 기능과 관계없는 추가적인 HTML 속성(예: `class`)을 지정해야 하는 경우도 있습니다. 일반적으로 이 추가 속성을 컴포넌트 템플릿의 루트 요소로 넘겨주고자 할 때가 많습니다. 예를 들어 아래와 같이 `alert` 컴포넌트를 렌더링한다고 가정해 봅니다.

```blade
<x-alert type="error" :message="$message" class="mt-4"/>
```

컴포넌트 생성자에 정의되지 않은 모든 속성은 자동으로 "속성 집합(attribute bag)"에 추가됩니다. 이 속성 집합은 컴포넌트 내부에서 `$attributes` 변수로 언제든 사용할 수 있습니다. 모든 속성을 출력하고 싶을 때는 아래처럼 사용합니다.

```blade
<div {{ $attributes }}>
    <!-- Component content -->
</div>
```

> [!WARNING]
> 현재 컴포넌트 태그 내에서 `@env`와 같은 디렉티브를 사용하는 것은 지원하지 않습니다. 예를 들어 `<x-alert :live="@env('production')"/>`와 같이 작성하면 컴파일되지 않습니다.

<a name="default-merged-attributes"></a>
#### 기본값/병합 속성

경우에 따라 속성에 기본값을 지정하거나, 일부 속성에 추가 값을 병합해야 할 수 있습니다. 이럴 때는 속성 집합의 `merge` 메서드를 이용하면 됩니다. 주로 컴포넌트에 항상 적용해야 할 기본 CSS 클래스를 지정할 때 유용합니다.

```blade
<div {{ $attributes->merge(['class' => 'alert alert-'.$type]) }}>
    {{ $message }}
</div>
```

만약 아래처럼 컴포넌트를 사용했다면

```blade
<x-alert type="error" :message="$message" class="mb-4"/>
```

최종적으로 렌더링되는 HTML은 다음과 같습니다.

```blade
<div class="alert alert-error mb-4">
    <!-- Contents of the $message variable -->
</div>
```

<a name="conditionally-merge-classes"></a>
#### 클래스 조건부 병합

어떤 조건이 참일 때만 클래스를 병합하고 싶을 경우, `class` 메서드를 사용할 수 있습니다. 이 메서드는 클래스명(혹은 클래스명 배열)을 키로, 해당 클래스를 적용할 조건식을 값으로 가지는 배열을 받습니다. 배열 요소의 키가 숫자라면 항상 렌더링되는 클래스에 포함됩니다.

```blade
<div {{ $attributes->class(['p-4', 'bg-red' => $hasError]) }}>
    {{ $message }}
</div>
```

다른 속성을 추가로 병합하고 싶다면, `class` 메서드에 `merge` 메서드를 체이닝해서 사용할 수 있습니다.

```blade
<button {{ $attributes->class(['p-4'])->merge(['type' => 'button']) }}>
    {{ $slot }}
</button>
```

> [!NOTE]
> 병합 속성을 사용하지 않아야 하는 일반 HTML 요소에 조건부 클래스를 적용할 때는 [@class 디렉티브](#conditional-classes)를 사용할 수 있습니다.

<a name="non-class-attribute-merging"></a>
#### class 이외 속성 병합

`class`가 아닌 다른 속성을 병합할 때 `merge`에서 제공하는 값은 "기본값"으로 간주됩니다. 이때, `class` 속성과 달리 해당 값은 외부에서 주입된 속성값과 병합되지 않고, 주입된 값이 있으면 덮어쓰게 됩니다. 예를 들어, `button` 컴포넌트를 아래처럼 구현했다면

```blade
<button {{ $attributes->merge(['type' => 'button']) }}>
    {{ $slot }}
</button>
```

컴포넌트 사용 시 `type` 속성을 명시하면 해당 값이 적용되고, 명시하지 않으면 `button`이 기본값이 됩니다.

```blade
<x-button type="submit">
    Submit
</x-button>
```

이 예제에서의 렌더링 결과는 아래와 같습니다.

```blade
<button type="submit">
    Submit
</button>
```

만약 `class` 같은 방식으로 기본값과 주입값을 나란히 병합하고 싶은 HTML 속성이 있다면, `prepends` 메서드를 사용할 수 있습니다. 아래 예시에서는 `data-controller` 속성이 언제나 `profile-controller`로 시작하고, 추가로 주입된 값이 뒤에 붙습니다.

```blade
<div {{ $attributes->merge(['data-controller' => $attributes->prepends('profile-controller')]) }}>
    {{ $slot }}
</div>
```

<a name="filtering-attributes"></a>
#### 속성 선택 및 필터링

`filter` 메서드를 이용해 원하는 속성만 필터링할 수 있습니다. 이 메서드는 true를 반환하는 속성만 속성 집합에 남깁니다.

```blade
{{ $attributes->filter(fn (string $value, string $key) => $key == 'foo') }}
```

특정 문자열로 시작하는 모든 속성을 얻고 싶다면 `whereStartsWith` 메서드를 사용할 수 있습니다.

```blade
{{ $attributes->whereStartsWith('wire:model') }}
```

반대로, 특정 문자열로 시작하는 모든 속성을 제외하려면 `whereDoesntStartWith` 메서드를 사용할 수 있습니다.

```blade
{{ $attributes->whereDoesntStartWith('wire:model') }}
```

`first` 메서드를 이용하면 속성 집합 내에서 첫 번째 속성값을 출력할 수 있습니다.

```blade
{{ $attributes->whereStartsWith('wire:model')->first() }}
```

특정 속성의 존재 여부를 확인하려면 `has` 메서드를 사용합니다. 이 메서드는 속성명을 인수로 받아 속성이 존재하면 true, 없으면 false를 반환합니다.

```blade
@if ($attributes->has('class'))
    <div>Class attribute is present</div>
@endif
```

만약 배열 형태로 여러 속성명을 전달할 경우, 모든 속성이 존재하는지 검사합니다.

```blade
@if ($attributes->has(['name', 'class']))
    <div>All of the attributes are present</div>
@endif
```

`hasAny` 메서드를 사용하면 전달된 여러 속성 중 하나라도 존재할 경우 true를 반환합니다.

```blade
@if ($attributes->hasAny(['href', ':href', 'v-bind:href']))
    <div>One of the attributes is present</div>
@endif
```

특정 속성값을 가져오고 싶으면 `get` 메서드를 사용합니다.

```blade
{{ $attributes->get('class') }}
```

`only` 메서드는 지정한 키만 가진 속성만 반환합니다.

```blade
{{ $attributes->only(['class']) }}
```

`except` 메서드는 지정한 키를 제외한 속성만 반환합니다.

```blade
{{ $attributes->except(['class']) }}
```

<a name="reserved-keywords"></a>

### 예약된 키워드

기본적으로 Blade에서 컴포넌트를 렌더링하기 위해 내부적으로 사용하는 몇 가지 예약어가 있습니다. 아래에 나열된 키워드는 여러분의 컴포넌트에서 public 속성이나 메서드 이름으로 정의할 수 없습니다.

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
### 슬롯(Slots)

컴포넌트에 추가적인 콘텐츠를 전달해야 할 때가 많습니다. 이때 "슬롯(slot)"을 활용할 수 있습니다. 컴포넌트의 슬롯은 `$slot` 변수를 출력해서 사용할 수 있습니다. 이 개념을 살펴보기 위해, `alert` 컴포넌트가 다음과 같은 마크업을 가지고 있다고 가정해 보겠습니다.

```blade
<!-- /resources/views/components/alert.blade.php -->

<div class="alert alert-danger">
    {{ $slot }}
</div>
```

다음과 같이 컴포넌트로 콘텐츠를 전달하여 슬롯을 사용할 수 있습니다.

```blade
<x-alert>
    <strong>Whoops!</strong> Something went wrong!
</x-alert>
```

컴포넌트에서 서로 다른 위치에 여러 개의 슬롯을 렌더링해야 할 때가 있습니다. 이번에는 "title" 슬롯을 주입할 수 있도록 alert 컴포넌트를 수정해 보겠습니다.

```blade
<!-- /resources/views/components/alert.blade.php -->

<span class="alert-title">{{ $title }}</span>

<div class="alert alert-danger">
    {{ $slot }}
</div>
```

이처럼 각각 이름이 지정된 슬롯의 콘텐츠는 `x-slot` 태그를 사용해 정의할 수 있습니다. 명시적으로 `x-slot` 태그 안에 적어주지 않은 콘텐츠는 `$slot` 변수로 컴포넌트에 전달됩니다.

```xml
<x-alert>
    <x-slot:title>
        Server Error
    </x-slot>

    <strong>Whoops!</strong> Something went wrong!
</x-alert>
```

슬롯에 콘텐츠가 존재하는지 확인하려면 슬롯의 `isEmpty` 메서드를 호출할 수 있습니다.

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

또한, `hasActualContent` 메서드를 사용하면 슬롯이 HTML 주석이 아닌 "실제" 콘텐츠를 포함하고 있는지 확인할 수 있습니다.

```blade
@if ($slot->hasActualContent())
    The scope has non-comment content.
@endif
```

<a name="scoped-slots"></a>
#### 스코프 슬롯(Scoped Slots)

Vue 등 자바스크립트 프레임워크를 사용해본 분들은 "스코프 슬롯"에 익숙할 수 있습니다. 이 기능은 슬롯 내부에서 컴포넌트의 데이터나 메서드에 접근할 수 있도록 해줍니다. 라라벨에서도 컴포넌트에 public 메서드 또는 속성을 정의하고, 슬롯 내부에서 `$component` 변수를 통해 컴포넌트에 접근함으로써 비슷한 기능을 구현할 수 있습니다. 예를 들어, 아래 예시에서는 `x-alert` 컴포넌트 클래스에 `formatAlert`라는 public 메서드가 있다고 가정합니다.

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

Blade 컴포넌트처럼, 슬롯에도 CSS 클래스명 등 [속성(attribute)](#component-attributes)을 추가로 지정할 수 있습니다.

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

슬롯의 속성에 접근하려면 해당 슬롯 변수의 `attributes` 속성을 사용할 수 있습니다. 속성에 관한 보다 자세한 내용은 [컴포넌트 속성 문서](#component-attributes)를 참고하십시오.

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

매우 간단한 컴포넌트라면, 컴포넌트 클래스와 컴포넌트 뷰 템플릿 파일을 각각 관리하는 일이 번거로울 수 있습니다. 이런 경우에는 `render` 메서드에서 컴포넌트의 마크업을 직접 반환할 수 있습니다.

```php
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

인라인 방식의 뷰를 렌더링하는 컴포넌트를 생성하려면 `make:component` 명령어 실행 시 `--inline` 옵션을 사용할 수 있습니다.

```shell
php artisan make:component Alert --inline
```

<a name="dynamic-components"></a>
### 동적 컴포넌트(Dynamic Components)

경우에 따라 어떤 컴포넌트를 렌더링할지 런타임에 결정해야 할 수도 있습니다. 이런 상황에서는 Laravel의 내장 `dynamic-component` 컴포넌트를 사용해, 실행 시점의 값이나 변수에 따라 컴포넌트를 렌더링할 수 있습니다.

```blade
// $componentName = "secondary-button";

<x-dynamic-component :component="$componentName" class="mt-4" />
```

<a name="manually-registering-components"></a>
### 컴포넌트 수동 등록

> [!WARNING]
> 아래의 컴포넌트 수동 등록 문서는 주로 뷰 컴포넌트를 포함하는 라라벨 패키지를 작성하는 경우에 해당합니다. 일반적으로 패키지를 작성하지 않는 경우, 이 내용은 해당되지 않을 수 있습니다.

자신의 애플리케이션에서 컴포넌트를 작성하는 경우, `app/View/Components` 디렉터리와 `resources/views/components` 디렉터리에 있는 컴포넌트는 자동으로 인식됩니다.

하지만 Blade 컴포넌트를 사용하는 자체 패키지를 만들거나, 규정된 위치가 아닌 곳에 컴포넌트를 두는 경우 컴포넌트 클래스와 해당 HTML 태그 별칭을 직접 등록해줘야 라라벨이 해당 컴포넌트를 올바르게 찾을 수 있습니다. 보통 패키지의 서비스 프로바이더의 `boot` 메서드에서 등록해야 합니다.

```php
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

컴포넌트가 등록되면, 설정한 태그 별칭을 사용해 다음과 같이 렌더링할 수 있습니다.

```blade
<x-package-alert/>
```

#### 패키지 컴포넌트 자동 로딩

또는, `componentNamespace` 메서드를 사용해 컨벤션 기반으로 컴포넌트 클래스를 자동 로딩할 수도 있습니다. 예를 들어, `Nightshade` 패키지에 `Calendar`, `ColorPicker` 컴포넌트가 있고 이들이 `Package\Views\Components` 네임스페이스에 존재한다고 가정해봅시다.

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

이렇게 하면, 아래와 같이 벤더 네임스페이스를 사용하여 `package-name::` 문법으로 컴포넌트를 사용할 수 있습니다.

```blade
<x-nightshade::calendar />
<x-nightshade::color-picker />
```

Blade는 컴포넌트 이름을 파스칼 케이스로 변환해서 해당하는 클래스를 자동으로 찾습니다. 하위 디렉터리 구조도 "dot" 표기법으로 지원합니다.

<a name="anonymous-components"></a>
## 익명 컴포넌트(Anonymous Components)

인라인 컴포넌트와 비슷하게, 익명 컴포넌트는 컴포넌트를 단일 파일로 관리할 수 있도록 해줍니다. 하지만 익명 컴포넌트는 하나의 뷰 파일만 사용하며 별도의 클래스가 없습니다. 익명 컴포넌트를 정의하려면 `resources/views/components` 디렉터리에 Blade 템플릿을 배치하기만 하면 됩니다. 예를 들어, `resources/views/components/alert.blade.php`에 익명 컴포넌트를 정의했다면, 아래와 같이 간단히 렌더링할 수 있습니다.

```blade
<x-alert/>
```

컴포넌트가 `components` 디렉터리 내에 더 깊게 중첩되어 있는 경우, 마침표(`.`)를 사용해 해당 컴포넌트를 지정할 수 있습니다. 예를 들어 `resources/views/components/inputs/button.blade.php` 파일이 있다면, 다음과 같이 렌더링합니다.

```blade
<x-inputs.button/>
```

<a name="anonymous-index-components"></a>
### 익명 인덱스 컴포넌트(Anonymous Index Components)

여러 Blade 템플릿으로 구성된 컴포넌트의 경우, 관련 템플릿을 하나의 디렉터리로 묶고 싶을 수도 있습니다. 예를 들어, "아코디언(accordion)" 컴포넌트가 아래와 같은 구조라고 가정해보겠습니다.

```text
/resources/views/components/accordion.blade.php
/resources/views/components/accordion/item.blade.php
```

이렇게 하면 다음과 같이 아코디언 컴포넌트와 그 아이템을 렌더링할 수 있습니다.

```blade
<x-accordion>
    <x-accordion.item>
        ...
    </x-accordion.item>
</x-accordion>
```

하지만 위 구조에서 `x-accordion`으로 아코디언 컴포넌트를 렌더링하려면 인덱스 역할의 템플릿(accordion.blade.php)을 최상위 디렉터리에 두어야만 했습니다.

다행히 Blade는 컴포넌트 디렉터리 내부에, 디렉터리 이름과 동일한 파일을 두는 것도 허용합니다. 이렇게 하면 해당 템플릿이 디렉터리 내부에 있더라도 "루트(root)" 엘리먼트로 렌더링할 수 있습니다. 즉, 위 예시와 같은 Blade 문법을 계속 사용할 수 있지만 디렉터리 구조는 아래처럼 변경할 수 있습니다.

```text
/resources/views/components/accordion/accordion.blade.php
/resources/views/components/accordion/item.blade.php
```

<a name="data-properties-attributes"></a>
### 데이터 속성 / 속성(Attributes)

익명 컴포넌트에는 별도의 클래스가 없으므로, 어떤 데이터가 변수로 전달되고 어떤 속성이 [속성 배그(attribute bag)](#component-attributes)에 포함되는지 구분이 필요할 수 있습니다.

컴포넌트 Blade 템플릿 상단에 `@props` 지시어를 사용해 데이터 변수를 지정할 수 있습니다. 그 외의 모든 속성은 컴포넌트의 속성 배그(`$attributes`)로 전달됩니다. 기본값을 지정하려면, 변수명을 배열의 키로, 기본값을 배열의 값으로 지정할 수 있습니다.

```blade
<!-- /resources/views/components/alert.blade.php -->

@props(['type' => 'info', 'message'])

<div {{ $attributes->merge(['class' => 'alert alert-'.$type]) }}>
    {{ $message }}
</div>
```

위와 같이 컴포넌트를 정의했다면, 다음처럼 컴포넌트를 호출할 수 있습니다.

```blade
<x-alert type="error" :message="$message" class="mb-4"/>
```

<a name="accessing-parent-data"></a>
### 부모 데이터에 접근하기

때때로 자식 컴포넌트 내부에서 부모 컴포넌트의 데이터를 사용하고 싶을 수도 있습니다. 이럴 때는 `@aware` 지시어를 활용하세요. 예를 들어, `<x-menu>` 부모 컴포넌트와 `<x-menu.item>` 자식 컴포넌트로 구성된 복잡한 메뉴를 만든다고 가정하겠습니다.

```blade
<x-menu color="purple">
    <x-menu.item>...</x-menu.item>
    <x-menu.item>...</x-menu.item>
</x-menu>
```

부모인 `<x-menu>` 컴포넌트는 아래와 같이 구현할 수 있습니다.

```blade
<!-- /resources/views/components/menu/index.blade.php -->

@props(['color' => 'gray'])

<ul {{ $attributes->merge(['class' => 'bg-'.$color.'-200']) }}>
    {{ $slot }}
</ul>
```

여기서 `color` prop은 오직 부모( `<x-menu>`)에만 전달되므로 자식인 `<x-menu.item>`에서는 사용할 수 없습니다. 하지만 `@aware` 지시어를 이용하면 자식 컴포넌트에서도 사용할 수 있습니다.

```blade
<!-- /resources/views/components/menu/item.blade.php -->

@aware(['color' => 'gray'])

<li {{ $attributes->merge(['class' => 'text-'.$color.'-800']) }}>
    {{ $slot }}
</li>
```

> [!WARNING]
> `@aware` 지시어는 부모 컴포넌트로 HTML 속성(attribute)으로 명시적으로 전달된 데이터만 접근할 수 있습니다. 부모의 `@props` 기본값은 명시적으로 넘겨주지 않은 한 `@aware`로 접근할 수 없습니다.

<a name="anonymous-component-paths"></a>
### 익명 컴포넌트 경로

앞서 언급한 것처럼, 익명 컴포넌트는 일반적으로 `resources/views/components` 디렉터리에 Blade 템플릿 파일을 배치해 정의합니다. 하지만 때로는 이 기본 위치 외에 다른 익명 컴포넌트 경로를 별도로 등록하고 싶을 수도 있습니다.

`anonymousComponentPath` 메서드는 첫 번째 인자로 익명 컴포넌트가 위치한 "경로(path)"를, 두 번째 인자로(optional) 해당 경로에 적용할 네임스페이스를 받습니다. 이 메서드는 보통 애플리케이션의 [서비스 프로바이더](/docs/providers)의 `boot` 메서드에서 호출하면 됩니다.

```php
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Blade::anonymousComponentPath(__DIR__.'/../components');
}
```

위 예시처럼 접두사(prefix) 없이 컴포넌트 경로를 등록하는 경우, Blade 컴포넌트에서 접두사 없이 해당 컴포넌트를 렌더링할 수 있습니다. 예를 들어, 등록한 경로에 `panel.blade.php`가 있다면 다음과 같이 사용할 수 있습니다.

```blade
<x-panel />
```

`anonymousComponentPath` 메서드의 두 번째 인자로 접두사(네임스페이스)를 지정할 수도 있습니다.

```php
Blade::anonymousComponentPath(__DIR__.'/../components', 'dashboard');
```

접두사가 지정된 경우, 해당 네임스페이스의 컴포넌트를 렌더링할 때 컴포넌트 네임 앞에 네임스페이스를 붙여야 합니다.

```blade
<x-dashboard::panel />
```

<a name="building-layouts"></a>
## 레이아웃 구성하기

<a name="layouts-using-components"></a>
### 컴포넌트를 이용한 레이아웃

대부분의 웹 애플리케이션은 여러 페이지에 걸쳐 동일한 레이아웃을 유지합니다. 만약 우리가 생성하는 모든 뷰마다 전체 레이아웃의 HTML을 반복해서 작성해야 한다면, 애플리케이션 유지보수가 매우 어렵고 번거로울 것입니다. 다행히 [Blade 컴포넌트](#components)를 사용해 레이아웃을 하나로 정의하고, 프로젝트 전반에 재사용할 수 있습니다.

<a name="defining-the-layout-component"></a>
#### 레이아웃 컴포넌트 정의하기

예시로, "할 일(todo)" 목록 애플리케이션을 만든다고 가정해 봅시다. 레이아웃 컴포넌트는 아래와 같이 만들 수 있습니다.

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

`layout` 컴포넌트를 정의했다면, 이를 사용하는 뷰를 만들 수 있습니다. 아래는 할 일 목록을 표시하는 단순한 뷰의 예시입니다.

```blade
<!-- resources/views/tasks.blade.php -->

<x-layout>
    @foreach ($tasks as $task)
        <div>{{ $task }}</div>
    @endforeach
</x-layout>
```

컴포넌트에 전달된 콘텐츠는 기본적으로 `layout` 컴포넌트 내부의 `$slot` 변수로 주입된다는 점을 기억하세요. 또한, 레이아웃 컴포넌트에서는 만약 `$title` 슬롯이 제공될 경우 이를 사용하고, 그렇지 않으면 기본 타이틀을 표시합니다. 아래와 같이 일반적인 슬롯 문법([컴포넌트 문서](#components) 참고)을 사용해 할 일 목록 뷰에서 커스텀 타이틀을 전달할 수 있습니다.

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

레이아웃과 할 일 목록 뷰를 정의한 뒤, 이제 라우트에서 해당 뷰를 반환하면 됩니다.

```php
use App\Models\Task;

Route::get('/tasks', function () {
    return view('tasks', ['tasks' => Task::all()]);
});
```

<a name="layouts-using-template-inheritance"></a>
### 템플릿 상속을 이용한 레이아웃

<a name="defining-a-layout"></a>
#### 레이아웃 정의하기

레이아웃은 "템플릿 상속(template inheritance)" 방식으로도 만들 수 있습니다. 이는 [컴포넌트](#components)가 도입되기 전 Blade에서 애플리케이션을 구축하던 주요 방식이었습니다.

먼저, 간단한 예제를 살펴보겠습니다. 가장 먼저 페이지 레이아웃을 정의합니다. 대다수 웹 애플리케이션은 여러 페이지에 걸쳐 동일한 레이아웃을 가지므로, 하나의 Blade 뷰로 레이아웃을 정의하는 것이 편리합니다.

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

위 파일은 일반적인 HTML 마크업을 포함하고 있습니다. 주목할 부분은 `@section`과 `@yield` 지시어입니다. `@section` 지시어는 말 그대로 콘텐츠의 "섹션"을 정의하며, `@yield` 지시어는 지정된 섹션의 내용을 출력합니다.

이제 레이아웃을 정의했으니, 해당 레이아웃을 상속하는 하위 페이지를 만들어보겠습니다.

<a name="extending-a-layout"></a>
#### 레이아웃 확장하기

하위 뷰를 정의할 때는, `@extends` Blade 지시어로 어떤 레이아웃을 상속할지 지정해야 합니다. 레이아웃을 상속받는 뷰에서는 `@section` 지시어를 통해 레이아웃에 정의된 섹션의 내용을 주입할 수 있습니다. 위의 예시처럼, 이 섹션의 내용은 레이아웃에서 `@yield`로 출력됩니다.

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

이 예시에서, `sidebar` 섹션은 `@@parent` 지시어를 활용하여(부모의 사이드바 콘텐츠를 덮어쓰는 대신) 내용을 추가로 덧붙이고 있습니다. `@@parent`는 렌더링 시 부모 레이아웃의 해당 섹션 내용으로 치환됩니다.

> [!NOTE]
> 위의 예시와 달리, 이 `sidebar` 섹션은 `@show`가 아닌 `@endsection`으로 끝납니다. `@endsection`은 단순히 섹션을 정의만 하고, `@show`는 섹션을 정의함과 동시에 **즉시 해당 섹션을 출력(yield)** 합니다.

`@yield` 지시어는 두 번째 인자로 기본값도 받을 수 있습니다. 지정된 섹션이 정의되어 있지 않을 때 해당 값이 출력됩니다.

```blade
@yield('content', 'Default content')
```

<a name="forms"></a>
## 폼(Forms)

<a name="csrf-field"></a>
### CSRF 필드

애플리케이션 내에서 HTML 폼을 정의할 때는, [CSRF 보호 미들웨어](/docs/csrf)가 요청을 검증할 수 있도록 반드시 hidden CSRF 토큰 필드를 포함해야 합니다. `@csrf` Blade 지시어를 사용하면 토큰 필드를 쉽게 생성할 수 있습니다.

```blade
<form method="POST" action="/profile">
    @csrf

    ...
</form>
```

<a name="method-field"></a>
### 메서드 필드(Method Field)

HTML 폼은 `PUT`, `PATCH`, `DELETE` 요청을 직접 전송할 수 없으므로, 이런 HTTP 메서드를 흉내내기 위해 숨겨진 `_method` 필드를 추가해야 합니다. `@method` Blade 지시어를 사용하면 이 필드를 손쉽게 만들 수 있습니다.

```blade
<form action="/foo/bar" method="POST">
    @method('PUT')

    ...
</form>
```

<a name="validation-errors"></a>
### 유효성 검증 에러(Validation Errors)

`@error` 지시어를 사용하면 [유효성 검증 에러 메시지](/docs/validation#quick-displaying-the-validation-errors)가 특정 속성(attribute)에 존재하는지 빠르게 확인할 수 있습니다. `@error` 블록 안에서는 `$message` 변수를 출력해 에러 메시지를 표시할 수 있습니다.

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

`@error` 지시어는 내부적으로 "if" 조건문으로 컴파일되므로, 해당 속성에 오류가 없을 때 `@else` 지시어를 활용할 수도 있습니다.

```blade
<!-- /resources/views/auth.blade.php -->

<label for="email">Email address</label>

<input
    id="email"
    type="email"
    class="@error('email') is-invalid @else is-valid @enderror"
/>
```

[별도의 에러 백(error bag)이 있을 때](/docs/validation#named-error-bags), `@error` 지시어의 두 번째 인자로 백 이름을 넘겨 여러 개의 폼이 있는 페이지에서 특정 폼에 대한 에러 메시지를 가져올 수도 있습니다.

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

Blade에서는 이름이 지정된 스택(stack)에 내용을 추가(`push`)하고, 그 스택을 다른 뷰나 레이아웃의 원하는 위치에서 렌더링할 수 있습니다. 이 기능은 자식 뷰에서 필요한 JavaScript 라이브러리 등을 지정할 때 특히 유용하게 사용됩니다.

```blade
@push('scripts')
    <script src="/example.js"></script>
@endpush
```

만약 특정 불리언(boolean) 조건이 `true`일 때만 `@push`를 수행하고 싶다면, `@pushIf` 디렉티브를 사용할 수 있습니다.

```blade
@pushIf($shouldPush, 'scripts')
    <script src="/example.js"></script>
@endPushIf
```

하나의 스택에 여러 번 내용을 추가할 수 있습니다. 스택에 쌓인 모든 내용을 렌더링하려면, `@stack` 디렉티브에 해당 스택의 이름을 전달해서 사용하면 됩니다.

```blade
<head>
    <!-- Head Contents -->

    @stack('scripts')
</head>
```

스택의 맨 앞에 내용을 추가하고 싶다면, `@prepend` 디렉티브를 사용해야 합니다.

```blade
@push('scripts')
    This will be second...
@endpush

// 나중에...

@prepend('scripts')
    This will be first...
@endprepend
```

<a name="service-injection"></a>
## 서비스 주입(Service Injection)

`@inject` 디렉티브를 사용하면 Laravel [서비스 컨테이너](/docs/container)에서 서비스를 가져올 수 있습니다. `@inject`의 첫 번째 인자는 주입받을 변수의 이름이고, 두 번째 인자는 가져오고 싶은 서비스의 클래스 또는 인터페이스 이름입니다.

```blade
@inject('metrics', 'App\Services\MetricsService')

<div>
    Monthly Revenue: {{ $metrics->monthlyRevenue() }}.
</div>
```

<a name="rendering-inline-blade-templates"></a>
## 인라인 Blade 템플릿 렌더링

때때로 Blade 템플릿 문자열을 바로 유효한 HTML로 변환해야 할 경우가 있습니다. 이럴 때는 `Blade` 파사드(facade)에서 제공하는 `render` 메서드를 사용할 수 있습니다. `render` 메서드는 Blade 템플릿 문자열과, (선택적으로) 템플릿에 전달될 데이터 배열을 인수로 받습니다.

```php
use Illuminate\Support\Facades\Blade;

return Blade::render('Hello, {{ $name }}', ['name' => 'Julian Bashir']);
```

Laravel은 인라인 Blade 템플릿을 렌더링할 때 내부적으로 `storage/framework/views` 디렉터리에 임시 파일을 생성합니다. Blade 템플릿 렌더링 후 이 임시 파일을 자동으로 지우고 싶다면, `deleteCachedView` 인자를 추가로 넘기면 됩니다.

```php
return Blade::render(
    'Hello, {{ $name }}',
    ['name' => 'Julian Bashir'],
    deleteCachedView: true
);
```

<a name="rendering-blade-fragments"></a>
## Blade 프래그먼트(Fragments) 렌더링

[Tubro](https://turbo.hotwired.dev/) 나 [htmx](https://htmx.org/)와 같은 프론트엔드 프레임워크를 사용할 때, HTTP 응답에서 Blade 템플릿의 특정 일부분만 반환해야 할 경우가 있습니다. Blade의 "프래그먼트" 기능을 사용하면 이 작업이 가능합니다. 먼저, 뷰 템플릿 내에서 일부 영역을 `@fragment`와 `@endfragment` 디렉티브로 감싸줍니다.

```blade
@fragment('user-list')
    <ul>
        @foreach ($users as $user)
            <li>{{ $user->name }}</li>
        @endforeach
    </ul>
@endfragment
```

이제 이 템플릿을 사용하는 뷰를 렌더링할 때, `fragment` 메서드를 호출하여 응답에 특정 프래그먼트만 포함되도록 할 수 있습니다.

```php
return view('dashboard', ['users' => $users])->fragment('user-list');
```

`fragmentIf` 메서드를 이용하면 조건에 따라 프래그먼트만 반환하거나, 조건이 맞지 않으면 전체 뷰를 반환하도록 할 수 있습니다.

```php
return view('dashboard', ['users' => $users])
    ->fragmentIf($request->hasHeader('HX-Request'), 'user-list');
```

`fragments` 및 `fragmentsIf` 메서드를 사용하면 여러 프래그먼트를 한 번에 반환할 수 있으며, 이 경우 프래그먼트들이 합쳐져서 전달됩니다.

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
## Blade 확장(Extending Blade)

Blade는 `directive` 메서드를 통해 사용자 정의 디렉티브를 직접 만들 수 있습니다. Blade 컴파일러가 이 커스텀 디렉티브를 만나면, 해당 디렉티브에 포함된 표현식(expression)을 인수로 하여 콜백을 실행합니다.

아래 예시는 전달받은 `$var`(여기서는 `DateTime` 인스턴스여야 합니다)를 포맷팅하는 `@datetime($var)` 디렉티브를 만드는 방법입니다.

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

보시는 것처럼, 이 예제에서는 전달받은 표현식에 `format` 메서드를 체이닝해서 사용합니다. 실행 결과, 이 디렉티브가 렌더링하는 실제 PHP 코드는 아래와 같게 됩니다.

```php
<?php echo ($var)->format('m/d/Y H:i'); ?>
```

> [!WARNING]
> Blade 디렉티브의 로직을 수정한 뒤에는 Blade 뷰의 캐시를 모두 삭제해야 정상적으로 반영됩니다. 캐시된 Blade 뷰는 `view:clear` Artisan 명령어로 제거할 수 있습니다.

<a name="custom-echo-handlers"></a>
### 사용자 정의 에코 핸들러(Custom Echo Handlers)

Blade에서 객체를 `{{ ... }}`로 출력(`echo`)할 경우, 해당 객체의 `__toString` 메서드가 호출됩니다. [`__toString`](https://www.php.net/manual/en/language.oop5.magic.php#object.tostring) 메서드는 PHP가 기본적으로 제공하는 "매직 메서드" 중 하나입니다. 하지만, 사용 중인 클래스가 서드파티 라이브러리 소속이여서 `__toString`을 마음대로 수정할 수 없는 경우가 있을 수 있습니다.

이런 상황에서는 Blade의 커스텀 에코 핸들러를 등록해서 원하는 방식으로 객체를 출력할 수 있습니다. 이를 위해 Blade의 `stringable` 메서드를 호출하는데, 이때 타입힌트를 통해 처리할 대상 객체 타입을 명확히 지정합니다. 보통 이 코드는 `AppServiceProvider`의 `boot` 메서드에서 등록해줍니다.

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

위처럼 커스텀 에코 핸들러를 등록한 후에는, Blade 템플릿에서 단순히 객체를 출력하기만 하면 등록한 핸들러가 자동으로 적용됩니다.

```blade
Cost: {{ $money }}
```

<a name="custom-if-statements"></a>
### 사용자 정의 If 문(Custom If Statements)

간단한 커스텀 조건문만 필요하다면, 직접 디렉티브를 구현하는 대신 Blade의 `Blade::if` 메서드를 사용할 수 있습니다. 이 메서드는 클로저(익명 함수)를 받아 간단하게 사용자 정의 조건문을 Blade에 추가할 수 있습니다. 예를 들어, 애플리케이션의 기본 "디스크(disk)" 설정값을 확인하는 조건을 `boot` 메서드에서 등록하는 예시는 아래와 같습니다.

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

이처럼 조건문을 정의하면, Blade 템플릿 내부에서 다음처럼 사용할 수 있습니다.

```blade
@disk('local')
    <!-- 애플리케이션이 local 디스크를 사용하고 있을 때... -->
@elsedisk('s3')
    <!-- 애플리케이션이 s3 디스크를 사용하고 있을 때... -->
@else
    <!-- 애플리케이션이 그 외의 디스크를 사용하고 있을 때... -->
@enddisk

@unlessdisk('local')
    <!-- 애플리케이션이 local 디스크를 사용하지 않을 때... -->
@enddisk
```