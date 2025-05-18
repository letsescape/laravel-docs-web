# 블레이드 템플릿 (Blade Templates)

- [소개](#introduction)
    - [Livewire로 Blade 확장하기](#supercharging-blade-with-livewire)
- [데이터 출력](#displaying-data)
    - [HTML 엔터티 인코딩](#html-entity-encoding)
    - [Blade와 자바스크립트 프레임워크](#blade-and-javascript-frameworks)
- [블레이드 디렉티브](#blade-directives)
    - [If문](#if-statements)
    - [Switch문](#switch-statements)
    - [반복문](#loops)
    - [Loop 변수](#the-loop-variable)
    - [조건부 클래스](#conditional-classes)
    - [추가 속성](#additional-attributes)
    - [하위 뷰 포함하기](#including-subviews)
    - [`@once` 디렉티브](#the-once-directive)
    - [원시 PHP 코드](#raw-php)
    - [주석](#comments)
- [컴포넌트](#components)
    - [컴포넌트 렌더링](#rendering-components)
    - [컴포넌트에 데이터 전달](#passing-data-to-components)
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
- [레이아웃 구성](#building-layouts)
    - [컴포넌트를 활용한 레이아웃](#layouts-using-components)
    - [템플릿 상속을 활용한 레이아웃](#layouts-using-template-inheritance)
- [폼](#forms)
    - [CSRF 필드](#csrf-field)
    - [메서드 필드](#method-field)
    - [유효성 검증 에러](#validation-errors)
- [스택](#stacks)
- [서비스 주입](#service-injection)
- [인라인 블레이드 템플릿 렌더링](#rendering-inline-blade-templates)
- [블레이드 프래그먼트 렌더링](#rendering-blade-fragments)
- [블레이드 확장](#extending-blade)
    - [커스텀 Echo 핸들러](#custom-echo-handlers)
    - [커스텀 If 문](#custom-if-statements)

<a name="introduction"></a>
## 소개

Blade는 라라벨에 기본 포함된 간결하면서도 강력한 템플릿 엔진입니다. 일부 PHP 템플릿 엔진과는 달리, Blade는 템플릿에서 평범한 PHP 코드를 자유롭게 사용할 수 있습니다. 실제로 모든 Blade 템플릿은 일반 PHP 코드로 컴파일되고, 파일이 수정될 때까지 캐싱되므로 Blade가 애플리케이션에 추가하는 오버헤드는 거의 없습니다. Blade 템플릿 파일의 확장자는 `.blade.php`이며, 일반적으로 `resources/views` 디렉터리에 저장됩니다.

Blade 뷰는 전역 `view` 헬퍼를 사용해 라우트나 컨트롤러에서 반환할 수 있습니다. 물론, [뷰](https://laravel.com/docs/10.x/views) 문서에서 설명한 대로, 두 번째 인수로 데이터를 Blade 뷰에 전달할 수 있습니다.

```
Route::get('/', function () {
    return view('greeting', ['name' => 'Finn']);
});
```

<a name="supercharging-blade-with-livewire"></a>
### Livewire로 Blade 확장하기

Blade 템플릿을 한 단계 더 끌어올려서 동적인 인터페이스를 손쉽게 구축하고 싶으신가요? [Laravel Livewire](https://livewire.laravel.com)를 살펴보세요. Livewire를 활용하면 평소에 React나 Vue 같은 프론트엔드 프레임워크가 필요했던 동적인 기능을 Blade 컴포넌트에 손쉽게 추가할 수 있습니다. 복잡한 클라이언트 사이드 렌더링이나 빌드 과정 없이도, 현대적인 리액티브 프론트엔드를 쉽고 직관적으로 구축할 수 있다는 점이 큰 장점입니다.

<a name="displaying-data"></a>
## 데이터 출력

Blade 뷰로 전달된 데이터를 중괄호로 감싸서 출력할 수 있습니다. 예를 들어, 아래와 같은 라우트가 있다고 가정해보겠습니다.

```
Route::get('/', function () {
    return view('welcome', ['name' => 'Samantha']);
});
```

위와 같이 전달된 `name` 변수를 다음과 같이 출력할 수 있습니다.

```blade
Hello, {{ $name }}.
```

> [!NOTE]
> Blade의 `{{ }}` 출력 구문은 자동으로 PHP의 `htmlspecialchars` 함수를 통해 처리되어 XSS 공격을 방지합니다.

뷰에 전달된 변수뿐 아니라, PHP의 어떤 함수 결과도 출력할 수 있습니다. 실제로, Blade의 출력 구문 안에는 원하는 어떤 PHP 코드를 넣어도 동작합니다.

```blade
The current UNIX timestamp is {{ time() }}.
```

<a name="html-entity-encoding"></a>
### HTML 엔터티 인코딩

기본적으로 Blade(그리고 라라벨의 `e` 함수)는 HTML 엔터티를 "이중 인코딩" 처리합니다. 이중 인코딩을 비활성화하려면 `AppServiceProvider`의 `boot` 메서드에서 `Blade::withoutDoubleEncoding` 메서드를 호출하면 됩니다.

```
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * 애플리케이션 서비스를 부트스트랩합니다.
     */
    public function boot(): void
    {
        Blade::withoutDoubleEncoding();
    }
}
```

<a name="displaying-unescaped-data"></a>
#### 이스케이프되지 않은 데이터 출력

기본적으로 Blade의 `{{ }}` 구문은 XSS 방지를 위해 자동으로 PHP의 `htmlspecialchars` 함수로 감싸집니다. 만약 HTML 이스케이프 없이 원본 데이터를 그대로 출력하고 싶다면, 다음과 같은 문법을 사용할 수 있습니다.

```blade
Hello, {!! $name !!}.
```

> [!WARNING]
> 사용자가 입력한 데이터를 그대로 출력할 때는 매우 주의하세요. 보통 사용자로부터 입력받은 데이터를 출력할 때는 반드시 이스케이프된 중괄호 구문(`{{ }}`)을 사용해 XSS 공격을 예방해야 합니다.

<a name="blade-and-javascript-frameworks"></a>
### Blade와 자바스크립트 프레임워크

많은 자바스크립트 프레임워크도 중괄호를 변수 출력에 사용하므로, Blade에서 해당 부분은 해석하지 않고 그대로 남기고 싶을 때 `@` 기호를 접두어로 붙이면 됩니다. 예를 들어:

```blade
<h1>Laravel</h1>

Hello, @{{ name }}.
```

이 예시에서, Blade는 `@`만 제거하고 `{{ name }}`은 그대로 두기 때문에 자바스크립트 프레임워크가 직접 처리할 수 있게 됩니다.

또한, `@` 기호로 Blade의 디렉티브 자체를 이스케이프할 수도 있습니다.

```blade
{{-- Blade template --}}
@@if()

<!-- HTML output -->
@if()
```

<a name="rendering-json"></a>
#### JSON 렌더링

어떤 배열을 JSON으로 변환하여 자바스크립트 변수에 할당하고 싶을 때가 있습니다. 예를 들어:

```blade
<script>
    var app = <?php echo json_encode($array); ?>;
</script>
```

이렇게 직접 `json_encode` 함수를 사용하는 대신, `Illuminate\Support\Js::from` 메서드 디렉티브를 활용할 수도 있습니다. `from` 메서드는 PHP의 `json_encode`와 동일한 인수를 사용하지만, HTML 인용부호 안에 안전하게 삽입할 수 있도록 JSON 문자열을 적절히 이스케이프 처리해줍니다. 반환되는 값은 `JSON.parse` 자바스크립트 구문을 사용해 객체 또는 배열을 올바른 자바스크립트 객체로 변환합니다.

```blade
<script>
    var app = {{ Illuminate\Support\Js::from($array) }};
</script>
```

최신 버전의 라라벨 애플리케이션 스켈레톤에는 `Js` 파사드가 포함되어 있어, Blade 템플릿에서 보다 간편하게 이 기능을 사용할 수 있습니다.

```blade
<script>
    var app = {{ Js::from($array) }};
</script>
```

> [!WARNING]
> 기존 변수의 JSON 변환에만 `Js::from` 메서드를 사용해야 합니다. Blade 템플릿 엔진은 정규표현식에 기반해 동작하므로, 복잡한 식을 디렉티브에 직접 전달하면 예기치 못한 동작이 발생할 수 있습니다.

<a name="the-at-verbatim-directive"></a>
#### `@verbatim` 디렉티브

템플릿의 넓은 영역에서 자바스크립트 변수를 출력하고자 할 때, 모든 Blade 출력 앞에 `@`를 붙이는 대신 `@verbatim` 디렉티브로 해당 HTML 부분 전체를 감쌀 수 있습니다.

```blade
@verbatim
    <div class="container">
        Hello, {{ name }}.
    </div>
@endverbatim
```

<a name="blade-directives"></a>
## 블레이드 디렉티브

템플릿 상속이나 데이터 출력 이외에도, Blade는 조건문이나 반복문과 같은 PHP 제어 구조를 위한 짧고 간편한 문법(디렉티브)을 제공합니다. 이 디렉티브를 활용하면 더욱 깔끔하고 가독성 좋은 코드를 작성할 수 있으며, PHP의 기본 제어문처럼 익숙하게 사용할 수 있습니다.

<a name="if-statements"></a>
### If문

`@if`, `@elseif`, `@else`, `@endif` 디렉티브를 사용해 if문을 작성할 수 있습니다. 이들 디렉티브는 PHP의 if문과 동작 방식이 동일합니다.

```blade
@if (count($records) === 1)
    I have one record!
@elseif (count($records) > 1)
    I have multiple records!
@else
    I don't have any records!
@endif
```

편의상 `@unless` 디렉티브도 제공합니다.

```blade
@unless (Auth::check())
    You are not signed in.
@endunless
```

앞서 설명한 조건문 디렉티브 외에도, 각각 PHP의 `isset`, `empty`와 동일하게 동작하는 `@isset`, `@empty` 디렉티브도 있습니다.

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

현재 사용자가 [인증되어 있는지](/docs/10.x/authentication) 또는 비회원(게스트)인지 신속하게 확인하고 싶을 때는 `@auth`, `@guest` 디렉티브를 사용할 수 있습니다.

```blade
@auth
    // 사용자가 인증됨...
@endauth

@guest
    // 사용자가 인증되지 않음...
@endguest
```

필요하다면 인증 시 사용할 가드도 지정할 수 있습니다.

```blade
@auth('admin')
    // 사용자가 인증됨...
@endauth

@guest('admin')
    // 사용자가 인증되지 않음...
@endguest
```

<a name="environment-directives"></a>
#### 환경(Environment) 디렉티브

애플리케이션이 운영 환경에서 실행 중인지 확인하고 싶다면 `@production` 디렉티브를 사용할 수 있습니다.

```blade
@production
    // 운영 환경에서만 출력할 내용...
@endproduction
```

또 특정 환경인지 확인할 때는 `@env` 디렉티브를 사용할 수 있습니다.

```blade
@env('staging')
    // 현재 "staging" 환경에서 실행 중...
@endenv

@env(['staging', 'production'])
    // "staging" 또는 "production" 환경에서 실행 중...
@endenv
```

<a name="section-directives"></a>
#### 섹션 관련 디렉티브

템플릿 상속용 섹션에 내용이 있는지 판단하려면 `@hasSection` 디렉티브를 사용할 수 있습니다.

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

세션 값이 존재하는지 확인하고 싶다면 `@session` 디렉티브를 사용할 수 있습니다. 세션 값이 존재할 경우, `@session` ~ `@endsession` 블록 안의 템플릿 내용이 평가됩니다. 이 구간에서는 `$value` 변수를 출력할 수 있습니다.

```blade
@session('status')
    <div class="p-4 bg-green-100">
        {{ $value }}
    </div>
@endsession
```

<a name="switch-statements"></a>
### Switch문

Switch문은 `@switch`, `@case`, `@break`, `@default`, `@endswitch` 디렉티브를 조합해 사용할 수 있습니다.

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

Blade는 조건문 이외에 반복문용 간단한 디렉티브도 제공합니다. 해당 디렉티브들은 PHP의 반복문과 완전히 동일하게 동작합니다.

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
> `foreach` 루프를 순회할 때, [loop 변수](#the-loop-variable)를 활용하면 현재 순회가 첫 번째인지, 마지막 순회인지 등 유용한 정보를 얻을 수 있습니다.

반복문 내부에서 현재 반복을 건너뛰거나 루프를 종료하려면 `@continue`, `@break` 디렉티브를 사용합니다.

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

또한, 건너뛰기나 종료 조건을 디렉티브 선언부에 바로 포함시킬 수도 있습니다.

```blade
@foreach ($users as $user)
    @continue($user->type == 1)

    <li>{{ $user->name }}</li>

    @break($user->number == 5)
@endforeach
```

<a name="the-loop-variable"></a>
### Loop 변수

`foreach` 반복문을 사용할 때, 반복문 안에서는 `$loop` 변수가 자동으로 제공됩니다. 이 변수는 현재 인덱스, 첫 번째/마지막 순회 여부 등 다양한 정보를 제공합니다.

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

중첩 반복문에서라면, parent 속성을 통해 부모 반복문의 `$loop` 변수에도 접근할 수 있습니다.

```blade
@foreach ($users as $user)
    @foreach ($user->posts as $post)
        @if ($loop->parent->first)
            This is the first iteration of the parent loop.
        @endif
    @endforeach
@endforeach
```

`$loop` 변수에는 다음과 같이 매우 유용한 속성들이 포함되어 있습니다.

| 속성                | 설명                                                  |
|---------------------|-----------------------------------------------------|
| `$loop->index`      | 현재 루프 순회의 인덱스(0부터 시작).                  |
| `$loop->iteration`  | 현재 실행 중인 루프 순회(1부터 시작).                  |
| `$loop->remaining`  | 남아 있는 반복 횟수.                                  |
| `$loop->count`      | 반복 중인 배열의 총 항목 수.                          |
| `$loop->first`      | 현재 순회가 첫 번째인지 여부.                          |
| `$loop->last`       | 현재 순회가 마지막인지 여부.                           |
| `$loop->even`       | 현재 순회가 짝수번째인지 여부.                         |
| `$loop->odd`        | 현재 순회가 홀수번째인지 여부.                         |
| `$loop->depth`      | 현재 루프의 중첩 깊이.                                 |
| `$loop->parent`     | 중첩 루프일 때, 부모의 loop 변수.                     |

<a name="conditional-classes"></a>
### 조건부 클래스 & 스타일

`@class` 디렉티브는 조건에 따라 CSS 클래스 문자열을 자동으로 조립해 줍니다. 배열 키에 클래스명을, 값에는 불린 식을 지정하면 해당 식이 true일 때만 클래스가 출력됩니다. 배열의 키가 숫자일 때는 항상 클래스 목록에 포함됩니다.

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

마찬가지로, `@style` 디렉티브를 활용하면 조건에 따라 인라인 스타일도 쉽게 추가할 수 있습니다.

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

체크박스 입력 요소에 `checked` 속성을 쉽게 부여하고 싶다면 `@checked` 디렉티브를 사용할 수 있습니다. 주어진 조건이 `true`일 때 해당 요소에 `checked` 속성을 출력합니다.

```blade
<input type="checkbox"
        name="active"
        value="active"
        @checked(old('active', $user->active)) />
```

비슷하게, `@selected` 디렉티브는 select 옵션 목록에서 해당 옵션이 선택된 상태임을 쉽게 표시할 수 있습니다.

```blade
<select name="version">
    @foreach ($product->versions as $version)
        <option value="{{ $version }}" @selected(old('version') == $version)>
            {{ $version }}
        </option>
    @endforeach
</select>
```

또한, `@disabled` 디렉티브를 사용하면 특정 요소를 손쉽게 비활성화(disabled)할 수 있습니다.

```blade
<button type="submit" @disabled($errors->isNotEmpty())>Submit</button>
```

뿐만 아니라, `@readonly` 디렉티브로 요소를 읽기 전용(readonly)으로 만들 수 있습니다.

```blade
<input type="email"
        name="email"
        value="email@laravel.com"
        @readonly($user->isNotAdmin()) />
```

추가로, `@required` 디렉티브로 요소를 필수(required) 입력 값으로 지정할 수 있습니다.

```blade
<input type="text"
        name="title"
        value="title"
        @required($user->isAdmin()) />
```

<a name="including-subviews"></a>
### 하위 뷰 포함하기

> [!NOTE]
> `@include` 디렉티브를 자유롭게 사용할 수 있지만, Blade의 [컴포넌트](#components) 기능은 데이터 및 속성 바인딩 등 다양한 이점을 제공하므로 컴포넌트의 활용도 추천드립니다.

Blade의 `@include` 디렉티브를 사용하면 한 Blade 뷰 안에서 다른 뷰를 손쉽게 가져올 수 있습니다. 부모 뷰에서 사용할 수 있는 모든 변수가 포함된 뷰에서도 동일하게 사용 가능합니다.

```blade
<div>
    @include('shared.errors')

    <form>
        <!-- Form Contents -->
    </form>
</div>
```

포함된 뷰가 부모 뷰의 데이터를 자동으로 상속받지만, 별도로 추가 데이터 배열을 전달해 포함 뷰에서 사용할 수도 있습니다.

```blade
@include('view.name', ['status' => 'complete'])
```

포함하고자 하는 뷰 파일이 없을 경우 라라벨은 에러를 발생시킵니다. 만약 뷰가 존재하지 않아도 오류 없이 진행하고 싶다면 `@includeIf` 디렉티브를 사용하세요.

```blade
@includeIf('view.name', ['status' => 'complete'])
```

조건식의 평가 결과에 따라 뷰를 포함하려면 `@includeWhen`, `@includeUnless` 디렉티브를 사용할 수 있습니다.

```blade
@includeWhen($boolean, 'view.name', ['status' => 'complete'])

@includeUnless($boolean, 'view.name', ['status' => 'complete'])
```

여러 뷰 중 존재하는 첫 번째 뷰만 포함하고 싶을 때는 `includeFirst` 디렉티브를 사용할 수 있습니다.

```blade
@includeFirst(['custom.admin', 'admin'], ['status' => 'complete'])
```

> [!WARNING]
> Blade 뷰 안에서 `__DIR__` 및 `__FILE__` 상수를 사용하는 것은 피해야 합니다. 해당 상수들은 캐시된 컴파일 뷰 파일의 위치를 참조하기 때문입니다.

<a name="rendering-views-for-collections"></a>

#### 컬렉션을 위한 뷰 렌더링

Blade의 `@each` 디렉티브를 사용하면 반복문과 포함 지시문을 한 줄로 결합할 수 있습니다.

```blade
@each('view.name', $jobs, 'job')
```

`@each` 디렉티브의 첫 번째 인수는 배열이나 컬렉션의 각 요소에 대해 렌더링할 뷰입니다. 두 번째 인수에는 반복할 배열이나 컬렉션을, 세 번째 인수에는 현재 반복 중인 요소가 뷰 내에서 할당될 변수명을 지정합니다. 예를 들어, `jobs` 배열을 반복할 때, 각 `job`을 뷰에서 `job` 변수로 접근하고 싶다면 위와 같이 작성합니다. 반복 중인 현재 요소의 배열 키는 뷰 내에서 `key` 변수로도 사용할 수 있습니다.

또한, `@each` 디렉티브에 네 번째 인수를 전달할 수도 있습니다. 이 인수는 지정한 배열이 비어 있을 때 렌더링할 뷰를 지정합니다.

```blade
@each('view.name', $jobs, 'job', 'view.empty')
```

> [!WARNING]
> `@each`로 렌더링된 뷰는 부모 뷰의 변수를 상속받지 않습니다. 자식 뷰에서 부모의 변수가 꼭 필요하다면 `@foreach`와 `@include` 디렉티브를 대신 사용해야 합니다.

<a name="the-once-directive"></a>
### `@once` 디렉티브

`@once` 디렉티브를 사용하면 템플릿 내의 특정 부분을 한 번만 실행하도록 지정할 수 있습니다. 이 기능은 [스택](#stacks)을 이용해 한 번만 JavaScript를 페이지의 헤더에 추가하고 싶을 때 유용합니다. 예를 들어, [컴포넌트](#components)를 반복 렌더링하면서 JavaScript를 처음 한 번만 헤더에 push하고 싶다면 아래와 같이 작성할 수 있습니다.

```blade
@once
    @push('scripts')
        <script>
            // Your custom JavaScript...
        </script>
    @endpush
@endonce
```

`@once` 디렉티브는 `@push`, `@prepend`와 자주 함께 쓰이므로, 편의를 위해 `@pushOnce`, `@prependOnce` 디렉티브도 제공합니다:

```blade
@pushOnce('scripts')
    <script>
        // Your custom JavaScript...
    </script>
@endPushOnce
```

<a name="raw-php"></a>
### 순수 PHP 코드 사용

특정 상황에서는 뷰 내부에 PHP 코드를 직접 작성해야 할 때도 있습니다. Blade의 `@php` 디렉티브를 사용하면 템플릿 안에서 순수 PHP 블록을 실행할 수 있습니다.

```blade
@php
    $counter = 1;
@endphp
```

또는, 클래스만 가져오려면 `@use` 디렉티브를 사용할 수 있습니다.

```blade
@use('App\Models\Flight')
```

`@use` 디렉티브에 두 번째 인수를 주면 임포트한 클래스에 별칭을 지정할 수 있습니다:

```php
@use('App\Models\Flight', 'FlightModel')
```

<a name="comments"></a>
### 주석

Blade에서는 뷰에 주석을 작성할 수 있습니다. 하지만, HTML 주석과 달리 Blade 주석은 실제 애플리케이션에서 반환되는 HTML에는 포함되지 않습니다.

```blade
{{-- 이 주석은 실제 HTML에는 포함되지 않습니다 --}}
```

<a name="components"></a>
## 컴포넌트

컴포넌트와 슬롯은 section, layout, include 등과 비슷한 이점을 제공하지만, 어떤 개발자에게는 컴포넌트와 슬롯의 개념이 더 이해하기 쉬울 수 있습니다. 컴포넌트 작성 방식에는 클래스 기반 컴포넌트와 익명 컴포넌트, 두 가지 방식이 있습니다.

클래스 기반 컴포넌트를 생성하려면 `make:component` 아티즌 명령어를 사용할 수 있습니다. 컴포넌트 사용 방법을 예시로 보여드리기 위해 간단한 `Alert` 컴포넌트를 만들어보겠습니다. `make:component` 명령어는 컴포넌트를 `app/View/Components` 디렉터리에 생성합니다.

```shell
php artisan make:component Alert
```

`make:component` 명령어는 컴포넌트용 뷰 템플릿도 자동으로 만들어줍니다. 이 뷰 파일은 `resources/views/components` 디렉터리에 생성됩니다. 직접 개발하는 애플리케이션용 컴포넌트는 `app/View/Components`와 `resources/views/components` 디렉터리에서 자동으로 감지되므로, 별도의 등록 작업이 필요하지 않습니다.

서브 디렉터리에도 컴포넌트를 생성할 수 있습니다:

```shell
php artisan make:component Forms/Input
```

위 명령은 `app/View/Components/Forms` 디렉터리에 `Input` 컴포넌트 클래스를, `resources/views/components/forms` 디렉터리에 뷰 파일을 생성합니다.

익명 컴포넌트(클래스 없이 Blade 템플릿만 존재하는 컴포넌트)를 만들고 싶으면, `make:component` 명령에 `--view` 플래그를 추가합니다.

```shell
php artisan make:component forms.input --view
```

이 명령은 `resources/views/components/forms/input.blade.php` 파일을 만들며, `<x-forms.input />` 형태로 컴포넌트를 렌더링할 수 있습니다.

<a name="manually-registering-package-components"></a>
#### 패키지 컴포넌트 직접 등록하기

자신의 애플리케이션에서는 컴포넌트가 `app/View/Components`와 `resources/views/components` 디렉터리에서 자동으로 감지됩니다.

하지만 Blade 컴포넌트를 사용하는 패키지를 개발하는 경우에는 컴포넌트 클래스와 HTML 태그 별칭을 직접 등록해야 합니다. 일반적으로 패키지의 서비스 프로바이더 `boot` 메서드에서 등록합니다:

```
use Illuminate\Support\Facades\Blade;

/**
 * 패키지 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Blade::component('package-alert', Alert::class);
}
```

컴포넌트를 등록하면, 등록된 태그 별칭으로 컴포넌트를 렌더링할 수 있습니다:

```blade
<x-package-alert/>
```

또는, `componentNamespace` 메서드를 사용해서 네임스페이스별로 컴포넌트 클래스를 자동으로 로드할 수도 있습니다. 예를 들어, `Nightshade` 패키지에 `Calendar`, `ColorPicker` 컴포넌트가 `Package\Views\Components` 네임스페이스 아래에 있다면 다음과 같이 등록할 수 있습니다.

```
use Illuminate\Support\Facades\Blade;

/**
 * 패키지 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Blade::componentNamespace('Nightshade\\Views\\Components', 'nightshade');
}
```

이렇게 등록하면, `vendor 네임스페이스::` 문법을 사용하여 다음과 같이 패키지 컴포넌트를 사용할 수 있습니다.

```blade
<x-nightshade::calendar />
<x-nightshade::color-picker />
```

Blade는 컴포넌트명과 연결된 클래스를 자동으로 파스칼 케이스로 탐색합니다. 서브디렉터리가 있다면 "dot" 표기법도 지원합니다.

<a name="rendering-components"></a>
### 컴포넌트 렌더링

컴포넌트를 화면에 표시하려면 Blade 템플릿에서 Blade 컴포넌트 태그를 사용할 수 있습니다. 컴포넌트 태그는 `x-`로 시작하고, 컴포넌트 클래스명을 케밥 케이스(kebab-case)로 변환해 이어붙입니다.

```blade
<x-alert/>

<x-user-profile/>
```

컴포넌트 클래스가 `app/View/Components` 디렉터리 내 더 하위에 존재한다면, 디렉터리 구조를 점(`.`)으로 표현할 수 있습니다. 예를 들어, `app/View/Components/Inputs/Button.php`에 컴포넌트가 있다면 다음과 같이 렌더링합니다.

```blade
<x-inputs.button/>
```

컴포넌트를 조건부로 렌더링하고 싶다면, 컴포넌트 클래스에 `shouldRender` 메서드를 정의하면 됩니다. `shouldRender` 메서드가 `false`를 반환하면 컴포넌트는 렌더링되지 않습니다.

```
use Illuminate\Support\Str;

/**
 * 컴포넌트를 렌더링할지 여부를 판단합니다.
 */
public function shouldRender(): bool
{
    return Str::length($this->message) > 0;
}
```

<a name="passing-data-to-components"></a>
### 컴포넌트에 데이터 전달하기

Blade 컴포넌트에 데이터를 전달하려면 HTML 속성(attribute)를 사용할 수 있습니다. PHP 변수나 식이 아닌 일반 상수(primitive) 값은 일반 HTML 속성처럼 전달하면 되고, PHP 표현식이나 변수를 전달할 때는 속성 이름 앞에 콜론(`:`)을 붙여서 사용합니다.

```blade
<x-alert type="error" :message="$message"/>
```

컴포넌트 클래스의 생성자에서 컴포넌트의 모든 데이터 속성을 정의해야 합니다. 컴포넌트의 public 속성은 자동으로 컴포넌트 뷰에서 사용할 수 있게 됩니다. 데이터를 뷰에 따로 넘겨줄 필요는 없습니다.

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
     * 컴포넌트를 나타내는 뷰/내용을 반환합니다.
     */
    public function render(): View
    {
        return view('components.alert');
    }
}
```

컴포넌트가 렌더링될 때, 컴포넌트의 public 변수값은 변수명 그대로 출력할 수 있습니다.

```blade
<div class="alert alert-{{ $type }}">
    {{ $message }}
</div>
```

<a name="casing"></a>
#### 케이스 규칙

컴포넌트 생성자 인수는 `camelCase`로 작성해야 하며, HTML 속성으로 참조할 때는 `kebab-case`로 변환해야 합니다. 예를 들어, 다음과 같이 컴포넌트를 정의한 경우:

```
/**
 * 컴포넌트 인스턴스 생성자
 */
public function __construct(
    public string $alertType,
) {}
```

컴포넌트에는 아래처럼 속성을 전달할 수 있습니다.

```blade
<x-alert alert-type="danger" />
```

<a name="short-attribute-syntax"></a>
#### 짧은 속성 표기법

컴포넌트에 속성을 전달할 때 "짧은 속성 표기법"도 사용할 수 있습니다. 변수명과 속성명이 일치할 때 특히 유용합니다.

```blade
{{-- 짧은 속성 표기법 --}}
<x-profile :$userId :$name />

{{-- 아래와 동일한 의미입니다 --}}
<x-profile :user-id="$userId" :name="$name" />
```

<a name="escaping-attribute-rendering"></a>
#### 속성 렌더링 이스케이프

Alpine.js 등 일부 JavaScript 프레임워크는 콜론으로 시작하는 속성을 사용하므로, 해당 속성이 PHP 식이 아니라는 것을 Blade에 알리고 싶다면 접두사로 콜론 두 개(`::`)를 붙이면 됩니다. 예를 들면:

```blade
<x-button ::class="{ danger: isDeleting }">
    Submit
</x-button>
```

이 경우 Blade는 다음과 같은 HTML을 렌더링합니다.

```blade
<button :class="{ danger: isDeleting }">
    Submit
</button>
```

<a name="component-methods"></a>
#### 컴포넌트 메서드

컴포넌트 템플릿에서는 public 변수뿐 아니라 public 메서드도 사용할 수 있습니다. 예를 들어, `isSelected` 메서드를 갖는 컴포넌트가 있다고 할 때:

```
/**
 * 지정한 옵션이 현재 선택되었는지 여부를 판단합니다.
 */
public function isSelected(string $option): bool
{
    return $option === $this->selected;
}
```

템플릿에서 메서드명을 그대로 변수처럼 써서 실행할 수 있습니다.

```blade
<option {{ $isSelected($value) ? 'selected' : '' }} value="{{ $value }}">
    {{ $label }}
</option>
```

<a name="using-attributes-slots-within-component-class"></a>
#### 컴포넌트 클래스에서 속성/슬롯 사용하기

Blade 컴포넌트에서는 렌더 메서드 내부에서 컴포넌트명, 속성, 슬롯에 접근할 수도 있습니다. 이 데이터를 사용하려면 `render` 메서드에서 클로저를 반환해야 하며, 해당 클로저의 인수로는 `$data` 배열이 전달됩니다. 이 배열 안에 컴포넌트와 관련된 다양한 정보가 담겨 있습니다:

```
use Closure;

/**
 * 컴포넌트를 나타내는 뷰/내용을 반환합니다.
 */
public function render(): Closure
{
    return function (array $data) {
        // $data['componentName'];
        // $data['attributes'];
        // $data['slot'];

        return '<div>Components content</div>';
    };
}
```

`componentName`은 HTML 태그의 `x-` 접두사를 뺀 이름과 동일합니다. 예를 들어 `<x-alert />`라면 `componentName`은 `alert`가 됩니다. `attributes`는 해당 태그에 지정된 모든 속성을 담고 있습니다. `slot`은 컴포넌트 슬롯의 내용을 담는 `Illuminate\Support\HtmlString` 인스턴스입니다.

이 클로저는 문자열을 반환해야 하며, 반환값이 실제 존재하는 뷰 경로라면 해당 뷰가 렌더링되고, 그렇지 않으면 인라인 Blade 뷰로 평가됩니다.

<a name="additional-dependencies"></a>
#### 추가 의존성 처리

컴포넌트에서 라라벨의 [서비스 컨테이너](/docs/10.x/container)로부터 의존성을 주입받아야 할 때는, 컴포넌트의 데이터 속성들 앞에 필요한 의존성을 선언하면 자동으로 주입됩니다.

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
#### 속성과 메서드 숨기기

컴포넌트 템플릿에서 특정 public 메서드나 속성을 노출하고 싶지 않다면, 컴포넌트 클래스의 `$except` 배열 속성에 해당 이름을 추가하면 됩니다.

```
<?php

namespace App\View\Components;

use Illuminate\View\Component;

class Alert extends Component
{
    /**
     * 컴포넌트 템플릿에 노출하지 않을 속성/메서드 목록
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

앞서 데이터 속성을 컴포넌트에 전달하는 방법을 알아보았습니다. 하지만 종종 컴포넌트 동작과 무관한 추가 HTML 속성(예: `class`)을 지정해야 할 때가 있습니다. 이런 추가 속성들은 보통 컴포넌트 템플릿의 루트 요소에 전달하고 싶을 것입니다. 예를 들어, `alert` 컴포넌트를 다음과 같이 렌더링한다고 가정해봅니다.

```blade
<x-alert type="error" :message="$message" class="mt-4"/>
```

컴포넌트 생성자에 정의하지 않은 모든 속성은 자동으로 컴포넌트의 “속성 백(attribute bag)”에 포함됩니다. 이 속성 백은 `$attributes` 변수로 컴포넌트에서 사용할 수 있습니다. `$attributes` 변수를 출력하면 모든 추가 속성이 렌더링됩니다.

```blade
<div {{ $attributes }}>
    <!-- Component content -->
</div>
```

> [!WARNING]
> 현재로서는 컴포넌트 태그 내에서 `@env`와 같은 디렉티브를 사용하는 것이 지원되지 않습니다. 예를 들어, `<x-alert :live="@env('production')"/>`는 컴파일되지 않습니다.

<a name="default-merged-attributes"></a>
#### 기본/병합 속성

어떤 속성에 기본값을 제공하거나, 속성값을 추가로 병합해야 할 때는, 속성 백의 `merge` 메서드를 사용할 수 있습니다. 주로 컴포넌트에 항상 적용할 CSS 클래스를 지정할 때 자주 사용합니다.

```blade
<div {{ $attributes->merge(['class' => 'alert alert-'.$type]) }}>
    {{ $message }}
</div>
```

이 컴포넌트를 아래와 같이 사용하면:

```blade
<x-alert type="error" :message="$message" class="mb-4"/>
```

최종 렌더된 결과는 아래와 같이 나오게 됩니다:

```blade
<div class="alert alert-error mb-4">
    <!-- Contents of the $message variable -->
</div>
```

<a name="conditionally-merge-classes"></a>
#### 조건부 클래스 병합

특정 조건에 따라 클래스를 병합하고 싶을 때는 `class` 메서드를 사용할 수 있습니다. 이 메서드는 클래스명을 키, 조건식을 값으로 갖는 배열을 받으며, 배열의 키가 숫자라면 무조건 클래스 목록에 추가됩니다.

```blade
<div {{ $attributes->class(['p-4', 'bg-red' => $hasError]) }}>
    {{ $message }}
</div>
```

다른 속성을 함께 병합하려면, `class` 뒤에 `merge`를 체이닝해서 사용할 수 있습니다.

```blade
<button {{ $attributes->class(['p-4'])->merge(['type' => 'button']) }}>
    {{ $slot }}
</button>
```

> [!NOTE]
> 병합 속성이 적용되지 않는 다른 HTML 요소에 대해서 조건부 클래스를 컴파일하려면 [`@class` 디렉티브](#conditional-classes)를 사용할 수 있습니다.

<a name="non-class-attribute-merging"></a>
#### 클래스 외 속성 병합

`class`가 아닌 다른 속성을 병합할 때, `merge` 메서드에 제공된 값들은 해당 속성의 “기본값”으로 사용됩니다. 그러나 `class` 속성과 달리, 이 외의 속성은 병합되지 않고, 주입된 속성값이 있으면 기본값이 덮어써집니다. 예를 들어, 아래처럼 `button` 컴포넌트를 구현한다고 할 때:

```blade
<button {{ $attributes->merge(['type' => 'button']) }}>
    {{ $slot }}
</button>
```

버튼 컴포넌트를 커스텀 `type`으로 렌더링하려면 사용 시 속성을 지정하면 되고, 지정하지 않으면 기본적으로 `button` 타입이 사용됩니다.

```blade
<x-button type="submit">
    Submit
</x-button>
```

위 예시에서 렌더되는 최종 HTML은 다음과 같습니다.

```blade
<button type="submit">
    Submit
</button>
```

만약 `class` 외의 다른 속성도 기본값과 추가 값을 합쳐서 사용하고 싶다면, `prepends` 메서드를 활용할 수 있습니다. 아래 예시는 항상 `profile-controller`로 시작하고, 추가로 전달된 `data-controller` 값이 그 뒤에 붙습니다.

```blade
<div {{ $attributes->merge(['data-controller' => $attributes->prepends('profile-controller')]) }}>
    {{ $slot }}
</div>
```

<a name="filtering-attributes"></a>
#### 속성 조회 및 필터링

`filter` 메서드를 이용하면 속성을 필터링할 수 있습니다. 이 메서드는 클로저를 받아, true를 반환한 속성만 남겨둡니다.

```blade
{{ $attributes->filter(fn (string $value, string $key) => $key == 'foo') }}
```

편의상, `whereStartsWith` 메서드로 키가 특정 문자열로 시작하는 속성만 쉽게 가져올 수 있습니다.

```blade
{{ $attributes->whereStartsWith('wire:model') }}
```

반대로, `whereDoesntStartWith` 메서드를 사용하면 특정 접두어로 시작하는 속성을 모두 제외하여 가져올 수 있습니다.

```blade
{{ $attributes->whereDoesntStartWith('wire:model') }}
```

`first` 메서드를 사용하면, 지정한 속성 집합 중 첫 번째 속성만 가져와서 렌더링할 수 있습니다.

```blade
{{ $attributes->whereStartsWith('wire:model')->first() }}
```

컴포넌트에 특정 속성이 존재하는지 확인하려면 `has` 메서드를 쓸 수 있습니다. 속성명을 인수로 주면, 해당 속성의 존재 여부를 불린값으로 반환합니다.

```blade
@if ($attributes->has('class'))
    <div>Class attribute is present</div>
@endif
```

배열을 전달하면, 해당 모든 속성이 존재하는지 검사합니다.

```blade
@if ($attributes->has(['name', 'class']))
    <div>All of the attributes are present</div>
@endif
```

`hasAny` 메서드를 사용하면, 여러 속성 중 하나라도 있으면 true를 반환합니다.

```blade
@if ($attributes->hasAny(['href', ':href', 'v-bind:href']))
    <div>One of the attributes is present</div>
@endif
```

특정 속성값을 가져오고 싶다면 `get` 메서드를 사용하면 됩니다.

```blade
{{ $attributes->get('class') }}
```

<a name="reserved-keywords"></a>
### 예약어

기본적으로, 일부 키워드는 Blade 내부적으로 컴포넌트 렌더링에 사용되므로, 자신의 컴포넌트에서 public 속성이나 메서드 이름으로 정의할 수 없습니다.

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

컴포넌트에 "슬롯(slot)"을 통해 추가적인 내용을 전달해야 하는 경우가 자주 있습니다. 컴포넌트 슬롯은 `$slot` 변수를 출력하여 렌더링됩니다. 이 개념을 쉽게 이해하기 위해, `alert` 컴포넌트가 아래와 같은 마크업을 가지고 있다고 가정해보겠습니다.

```blade
<!-- /resources/views/components/alert.blade.php -->

<div class="alert alert-danger">
    {{ $slot }}
</div>
```

컴포넌트에 아래와 같이 내용을 삽입하면, 해당 내용이 슬롯을 통해 전달됩니다.

```blade
<x-alert>
    <strong>Whoops!</strong> Something went wrong!
</x-alert>
```

컴포넌트 내에서 여러 다른 슬롯들을 각각 다른 위치에 렌더링해야 하는 경우도 있습니다. 예를 들어, `alert` 컴포넌트에 "title" 슬롯을 추가해 다양한 위치에서 사용할 수 있도록 아래와 같이 수정해보겠습니다.

```blade
<!-- /resources/views/components/alert.blade.php -->

<span class="alert-title">{{ $title }}</span>

<div class="alert alert-danger">
    {{ $slot }}
</div>
```

명명된 슬롯의 내용을 정의하려면 `x-slot` 태그를 활용할 수 있습니다. `x-slot` 태그에 명시적으로 포함되지 않은 내용은 모두 `$slot` 변수로 컴포넌트에 전달됩니다.

```xml
<x-alert>
    <x-slot:title>
        Server Error
    </x-slot>

    <strong>Whoops!</strong> Something went wrong!
</x-alert>
```

슬롯이 내용을 가지고 있는지 확인하려면, 슬롯의 `isEmpty` 메서드를 호출할 수 있습니다.

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

또한, 슬롯 내에 실제 내용(HTML 주석이 아닌 내용)이 존재하는지 확인하려면 `hasActualContent` 메서드를 사용할 수 있습니다.

```blade
@if ($slot->hasActualContent())
    The scope has non-comment content.
@endif
```

<a name="scoped-slots"></a>
#### 스코프 슬롯(Scoped Slots)

Vue 등 자바스크립트 프레임워크에서 "스코프 슬롯(scoped slot)"을 사용해본 적이 있다면, 슬롯 내부에서 컴포넌트의 데이터나 메서드에 접근할 수 있다는 점을 아실 것입니다. 라라벨에서도 이와 유사한 방식으로 컴포넌트 클래스에 public 메서드나 프로퍼티를 정의하고, 슬롯 내에서 `$component` 변수를 통해 접근할 수 있습니다. 아래 예시는 `x-alert` 컴포넌트 클래스에 public `formatAlert` 메서드가 정의되어 있다고 가정한 예시입니다.

```blade
<x-alert>
    <x-slot:title>
        {{ $component->formatAlert('Server Error') }}
    </x-slot>

    <strong>Whoops!</strong> Something went wrong!
</x-alert>
```

<a name="slot-attributes"></a>
#### 슬롯 속성(Slot Attributes)

Blade 컴포넌트와 마찬가지로, 슬롯에도 CSS 클래스와 같은 [속성(attribute)](#component-attributes)을 추가할 수 있습니다.

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

슬롯 속성과 상호작용하려면 슬롯 변수의 `attributes` 프로퍼티에 접근할 수 있습니다. 속성과 관련된 보다 자세한 내용은 [컴포넌트 속성](#component-attributes) 문서를 참고하시기 바랍니다.

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
### 인라인 컴포넌트 뷰(Inline Component Views)

매우 간단한 컴포넌트의 경우, 컴포넌트 클래스와 뷰 템플릿 파일을 별도로 관리하는 것이 번거로울 수 있습니다. 이런 경우, 컴포넌트의 `render` 메서드에서 마크업을 직접 반환할 수 있습니다.

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

인라인 뷰를 렌더링하는 컴포넌트를 생성하려면, `make:component` 명령어 실행 시 `--inline` 옵션을 사용할 수 있습니다.

```shell
php artisan make:component Alert --inline
```

<a name="dynamic-components"></a>
### 동적 컴포넌트(Dynamic Components)

어떤 컴포넌트를 렌더링할지 런타임에서 결정해야 하는 경우가 있습니다. 이때는 라라벨에 내장된 `dynamic-component` 컴포넌트를 사용하여, 런타임 값이나 변수 기반으로 컴포넌트를 렌더링할 수 있습니다.

```blade
// $componentName = "secondary-button";

<x-dynamic-component :component="$componentName" class="mt-4" />
```

<a name="manually-registering-components"></a>
### 컴포넌트 수동 등록하기(Manually Registering Components)

> [!WARNING]
> 아래 컴포넌트 수동 등록에 관한 문서는 뷰 컴포넌트를 포함하는 라라벨 패키지 개발자를 위한 내용입니다. 패키지를 작성하지 않고 있다면, 이 부분은 대부분의 개발자에게 해당되지 않을 수 있습니다.

자신의 애플리케이션을 위한 컴포넌트를 작성할 때는 `app/View/Components` 디렉터리와 `resources/views/components` 디렉터리에 위치한 컴포넌트가 자동으로 감지됩니다.

하지만 Blade 컴포넌트를 사용하는 패키지를 제작하거나, 관례적이지 않은 디렉터리에 컴포넌트를 두는 경우에는, 컴포넌트 클래스와 HTML 태그 별칭(alias)을 라라벨에 수동으로 등록해야 합니다. 일반적으로는 패키지의 서비스 프로바이더 `boot` 메서드에서 컴포넌트를 등록합니다.

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

이렇게 등록한 컴포넌트는 아래처럼 태그 별칭으로 렌더링할 수 있습니다.

```blade
<x-package-alert/>
```

#### 패키지 컴포넌트 자동 로딩(Autoloading Package Components)

또는 `componentNamespace` 메서드를 사용하여 관례에 따라 컴포넌트 클래스를 자동 로딩할 수도 있습니다. 예를 들어, `Nightshade`라는 패키지에 `Package\Views\Components` 네임스페이스 내에 `Calendar`와 `ColorPicker` 컴포넌트가 있다고 가정해보겠습니다.

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

이렇게 하면 패키지 컴포넌트를 `package-name::` 네임스페이스로 아래와 같이 사용할 수 있습니다.

```blade
<x-nightshade::calendar />
<x-nightshade::color-picker />
```

Blade는 컴포넌트 이름을 파스칼 케이스(PascalCase)로 변환해 해당 클래스를 자동으로 찾아냅니다. 또한, 하위 디렉터리도 "점(dot)" 표기법을 사용하여 지원됩니다.

<a name="anonymous-components"></a>
## 익명 컴포넌트(Anonymous Components)

인라인 컴포넌트와 비슷하게, 익명 컴포넌트도 단일 파일로 컴포넌트를 관리할 수 있는 방법을 제공합니다. 하지만 익명 컴포넌트는 뷰 파일만 존재하고 별도의 클래스는 없습니다. 익명 컴포넌트를 정의하려면, 컴포넌트용 Blade 템플릿을 단순히 `resources/views/components` 디렉터리에 두면 됩니다. 예를 들어, `resources/views/components/alert.blade.php`에 컴포넌트를 정의했다면 다음과 같이 바로 렌더링할 수 있습니다.

```blade
<x-alert/>
```

`components` 디렉터리 내에 컴포넌트가 더 깊이 중첩되어 있는 경우에는 `.` 문자를 사용하여 위치를 표시할 수 있습니다. 예를 들어, 컴포넌트가 `resources/views/components/inputs/button.blade.php`에 정의되어 있다면 다음과 같이 렌더링합니다.

```blade
<x-inputs.button/>
```

<a name="anonymous-index-components"></a>
### 익명 인덱스 컴포넌트(Anonymous Index Components)

블레이드 템플릿이 여러 개로 구성된 복잡한 컴포넌트라면, 관련된 템플릿을 한 디렉터리로 묶어 구조화하고 싶을 수 있습니다. 예를 들어, "아코디언(accordion)" 컴포넌트의 경우 아래와 같은 디렉터리 구조를 사용할 수 있습니다.

```none
/resources/views/components/accordion.blade.php
/resources/views/components/accordion/item.blade.php
```

이 구조라면 다음과 같이 아코디언과 아이템 컴포넌트를 함께 렌더링할 수 있습니다.

```blade
<x-accordion>
    <x-accordion.item>
        ...
    </x-accordion.item>
</x-accordion>
```

하지만 위처럼 `x-accordion`을 통해 루트 컴포넌트를 렌더링하려면, 아코디언의 대표 템플릿을 `resources/views/components` 디렉터리에 두어야 했습니다.

다행히도 Blade에서는 컴포넌트 템플릿 디렉터리 내에 `index.blade.php` 파일을 두면, 해당 컴포넌트의 "루트" 노드로 사용합니다. 즉, 아래와 같이 디렉터리 구조를 변경해도 위와 동일하게 사용할 수 있습니다.

```none
/resources/views/components/accordion/index.blade.php
/resources/views/components/accordion/item.blade.php
```

<a name="data-properties-attributes"></a>
### 데이터 프로퍼티 / 속성(Data Properties / Attributes)

익명 컴포넌트는 별도의 클래스가 없기 때문에, 어떤 데이터가 변수로 전달되고, 어떤 속성이 [속성 집합(attribute bag)](#component-attributes)에 넣어져야 하는지 구분할 필요가 있습니다.

컴포넌트 Blade 템플릿 상단에서 `@props` 디렉티브를 사용하여 데이터 변수로 처리할 속성을 지정할 수 있습니다. 지정되지 않은 다른 속성은 모두 속성 집합으로 전달됩니다. 변수에 기본값을 지정하려면 배열의 키에 변수 이름, 값에는 기본값을 작성합니다.

```blade
<!-- /resources/views/components/alert.blade.php -->

@props(['type' => 'info', 'message'])

<div {{ $attributes->merge(['class' => 'alert alert-'.$type]) }}>
    {{ $message }}
</div>
```

위와 같이 컴포넌트를 정의했다면, 다음과 같이 렌더링할 수 있습니다.

```blade
<x-alert type="error" :message="$message" class="mb-4"/>
```

<a name="accessing-parent-data"></a>
### 부모 데이터 접근하기(Accessing Parent Data)

자식 컴포넌트에서 부모 컴포넌트의 데이터에 접근하고 싶을 때가 있습니다. 이럴 때는 `@aware` 디렉티브를 사용합니다. 예를 들어, 부모 `<x-menu>`, 자식 `<x-menu.item>`으로 구성된 복잡한 메뉴 컴포넌트를 만든다고 가정해봅니다.

```blade
<x-menu color="purple">
    <x-menu.item>...</x-menu.item>
    <x-menu.item>...</x-menu.item>
</x-menu>
```

부모 `<x-menu>` 컴포넌트는 다음과 같이 구현할 수 있습니다.

```blade
<!-- /resources/views/components/menu/index.blade.php -->

@props(['color' => 'gray'])

<ul {{ $attributes->merge(['class' => 'bg-'.$color.'-200']) }}>
    {{ $slot }}
</ul>
```

`color` 속성이 부모에만 전달되었으므로, 원래라면 `<x-menu.item>`에는 전달되지 않습니다. 하지만 `@aware` 디렉티브를 사용하면 자식에서도 접근할 수 있습니다.

```blade
<!-- /resources/views/components/menu/item.blade.php -->

@aware(['color' => 'gray'])

<li {{ $attributes->merge(['class' => 'text-'.$color.'-800']) }}>
    {{ $slot }}
</li>
```

> [!WARNING]
> `@aware` 디렉티브는 부모 컴포넌트에 HTML 속성(attribute)으로 명시적으로 전달된 데이터만 접근할 수 있습니다. 부모 컴포넌트의 `@props` 디폴트 값처럼, 명시적으로 전달되지 않은 값은 얻을 수 없습니다.

<a name="anonymous-component-paths"></a>
### 익명 컴포넌트 경로(Anonymous Component Paths)

앞서 설명했던 것처럼, 익명 컴포넌트는 주로 `resources/views/components` 디렉터리에 Blade 템플릿을 두어 정의합니다. 하지만 필요에 따라 라라벨에 추가적인 익명 컴포넌트 경로를 등록할 수도 있습니다.

`anonymousComponentPath` 메서드는 익명 컴포넌트들이 위치한 "경로"를 첫 번째 인자로 받고, 두 번째 인자로는 컴포넌트에 부여할 "네임스페이스"를 선택적으로 지정할 수 있습니다. 이 메서드는 일반적으로 앱의 [서비스 프로바이더](/docs/10.x/providers) `boot` 메서드에서 호출해야 합니다.

```
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Blade::anonymousComponentPath(__DIR__.'/../components');
}
```

이렇게 프리픽스 없이 경로를 등록했다면, 해당 경로의 컴포넌트도 뷰에서 프리픽스 없이 렌더링할 수 있습니다. 예를 들어, 위 경로에 `panel.blade.php` 컴포넌트가 있다면 다음과 같이 사용할 수 있습니다.

```blade
<x-panel />
```

`anonymousComponentPath` 메서드의 두 번째 인자로 접두사 네임스페이스를 지정할 수도 있습니다.

```
Blade::anonymousComponentPath(__DIR__.'/../components', 'dashboard');
```

접두사를 지정하면, 해당 네임스페이스의 모든 컴포넌트는 컴포넌트 이름 앞에 이 네임스페이스를 붙여 렌더링해야 합니다.

```blade
<x-dashboard::panel />
```

<a name="building-layouts"></a>
## 레이아웃 구성하기(Building Layouts)

<a name="layouts-using-components"></a>
### 컴포넌트를 활용한 레이아웃(Layouts Using Components)

대부분의 웹 애플리케이션은 여러 페이지에 걸쳐 동일한 전반적인 레이아웃을 유지합니다. 만약 여러분이 각 뷰마다 전체 레이아웃 HTML을 반복해서 작성한다면 관리가 매우 번거로워질 것입니다. 다행히도, 라라벨에서는 레이아웃을 하나의 [Blade 컴포넌트](#components)로 정의한 뒤, 애플리케이션 전체에서 재사용할 수 있습니다.

<a name="defining-the-layout-component"></a>
#### 레이아웃 컴포넌트 정의하기

예를 들어, "todo" 목록 애플리케이션을 만든다고 가정해보겠습니다. 이 경우 아래와 같이 `layout` 컴포넌트를 정의할 수 있습니다.

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

`layout` 컴포넌트를 정의했다면, 이제 이 컴포넌트를 활용하는 Blade 뷰를 생성할 수 있습니다. 예를 들어, 아래와 같이 간단한 태스크 목록을 표시하는 뷰를 만들 수 있습니다.

```blade
<!-- resources/views/tasks.blade.php -->

<x-layout>
    @foreach ($tasks as $task)
        {{ $task }}
    @endforeach
</x-layout>
```

이처럼 컴포넌트에 삽입된 내용은, `layout` 컴포넌트 내부의 기본 `$slot` 변수로 전달됩니다. 또한, `layout` 컴포넌트에서는 `$title` 슬롯이 있을 경우 이를 사용하며, 없으면 기본값이 표시됩니다. 아래와 같이 표준 슬롯 문법을 활용해 태스크 목록 뷰에서 타이틀을 전달할 수도 있습니다.

```blade
<!-- resources/views/tasks.blade.php -->

<x-layout>
    <x-slot:title>
        Custom Title
    </x-slot>

    @foreach ($tasks as $task)
        {{ $task }}
    @endforeach
</x-layout>
```

이제 레이아웃과 태스크 목록 뷰를 정의했다면, 라우트에서 이 뷰를 반환하면 됩니다.

```
use App\Models\Task;

Route::get('/tasks', function () {
    return view('tasks', ['tasks' => Task::all()]);
});
```

<a name="layouts-using-template-inheritance"></a>
### 템플릿 상속 방식의 레이아웃(Layouts Using Template Inheritance)

<a name="defining-a-layout"></a>
#### 레이아웃 정의하기

레이아웃은 "템플릿 상속" 방식으로도 생성할 수 있습니다. 이는 [컴포넌트](#components)가 도입되기 전까지 라라벨에서 주로 사용하던 방법입니다.

간단한 예시로 살펴보겠습니다. 먼저, 여러 페이지에 걸쳐 쓰이는 페이지 레이아웃을 정의합니다. 웹 애플리케이션은 여러 페이지에서 비슷한 구조를 공유하므로, 하나의 Blade 뷰로 레이아웃을 정의하는 것이 편리합니다.

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

여기서 `@section`과 `@yield` 디렉티브의 쓰임을 눈여겨 보아야 합니다. `@section`은 하나의 콘텐츠 영역을 정의하며, `@yield`는 해당 영역의 내용을 표시하는 역할을 합니다.

레이아웃을 정의했다면, 이제 이 레이아웃을 상속받는 하위 페이지를 정의해봅니다.

<a name="extending-a-layout"></a>
#### 레이아웃 확장하기

하위 뷰를 정의할 때는 `@extends` Blade 디렉티브로 어떤 레이아웃을 상속받을지 지정합니다. Blade 레이아웃을 확장한 뷰는 `@section` 디렉티브로 콘텐츠를 레이아웃의 각 영역에 삽입할 수 있습니다. 앞선 예시처럼, 이 영역들의 내용을 실제로 표시할 때는 `@yield`가 사용됩니다.

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

위 예시에서, `sidebar` 부분은 `@@parent` 디렉티브를 사용해 부모 레이아웃의 기존 콘텐츠에 내용을 추가(덮어쓰기 대신)합니다. 렌더링 시, 레이아웃의 해당 부분이 `@@parent`로 교체되어 출력됩니다.

> [!NOTE]
> 이전 예시와 달리, 이 `sidebar` 영역은 `@show`가 아니라 `@endsection`으로 끝나는 점에 주의하세요. `@endsection`은 해당 영역만 정의하는 반면, `@show`는 정의와 동시에 **즉시 출력**까지 처리합니다.

`@yield` 디렉티브는 두 번째 인자에 기본값도 받을 수 있습니다. 지정한 영역이 정의되지 않은 경우, 해당 기본값이 렌더링됩니다.

```blade
@yield('content', 'Default content')
```

<a name="forms"></a>
## 폼(Forms)

<a name="csrf-field"></a>
### CSRF 필드

HTML 폼을 작성할 때는 반드시 CSRF 보호 미들웨어가 요청을 검증할 수 있도록 숨겨진 CSRF 토큰 필드를 포함해야 합니다. `@csrf` Blade 디렉티브를 사용하면 이 토큰 필드를 자동으로 생성할 수 있습니다.

```blade
<form method="POST" action="/profile">
    @csrf

    ...
</form>
```

<a name="method-field"></a>
### 메서드 필드(Method Field)

HTML 폼은 본래 `PUT`, `PATCH`, `DELETE` 요청을 직접 보낼 수 없습니다. 이런 HTTP 메서드를 사용하려면 숨겨진 `_method` 필드를 추가해야 하며, `@method` Blade 디렉티브로 쉽게 생성할 수 있습니다.

```blade
<form action="/foo/bar" method="POST">
    @method('PUT')

    ...
</form>
```

<a name="validation-errors"></a>
### 유효성 검증 에러(Validation Errors)

`@error` 디렉티브를 사용하면 [유효성 검증 에러 메시지](/docs/10.x/validation#quick-displaying-the-validation-errors)가 특정 속성에 존재하는지 빠르게 확인할 수 있습니다. `@error` 블록 내에서 `$message` 변수를 출력하면 에러 메시지가 표시됩니다.

```blade
<!-- /resources/views/post/create.blade.php -->

<label for="title">Post Title</label>

<input id="title"
    type="text"
    class="@error('title') is-invalid @enderror">

@error('title')
    <div class="alert alert-danger">{{ $message }}</div>
@enderror
```

`@error` 디렉티브는 "if" 문으로 컴파일되므로, 해당 에러가 없을 때 다른 내용을 출력하고 싶을 때는 `@else` 디렉티브를 사용할 수 있습니다.

```blade
<!-- /resources/views/auth.blade.php -->

<label for="email">Email address</label>

<input id="email"
    type="email"
    class="@error('email') is-invalid @else is-valid @enderror">
```

여러 개의 폼이 있는 페이지에서 [특정 에러백의 이름](/docs/10.x/validation#named-error-bags)을 두 번째 인자로 전달하면, 해당 폼에만 관련된 검증 에러 메시지를 확인할 수 있습니다.

```blade
<!-- /resources/views/auth.blade.php -->

<label for="email">Email address</label>

<input id="email"
    type="email"
    class="@error('email', 'login') is-invalid @enderror">

@error('email', 'login')
    <div class="alert alert-danger">{{ $message }}</div>
@enderror
```

<a name="stacks"></a>

## 스택(Stacks)

Blade에서는 이름이 지정된 스택에 내용을 추가(push)하고, 이후 다른 뷰나 레이아웃에서 해당 스택을 출력할 수 있습니다. 이 기능은 특히 자식 뷰에서 필요한 JavaScript 라이브러리를 지정할 때 유용하게 사용할 수 있습니다.

```blade
@push('scripts')
    <script src="/example.js"></script>
@endpush
```

특정 불리언 조건이 `true`일 때만 `@push`를 실행하고 싶다면, `@pushIf` 디렉티브를 사용할 수 있습니다.

```blade
@pushIf($shouldPush, 'scripts')
    <script src="/example.js"></script>
@endPushIf
```

여러 번에 걸쳐 동일한 스택에 여러 내용을 반복해서 추가할 수 있습니다. 스택에 쌓인 모든 내용을 출력하려면 `@stack` 디렉티브에 해당 스택의 이름을 전달하여 사용합니다.

```blade
<head>
    <!-- Head Contents -->

    @stack('scripts')
</head>
```

스택의 맨 앞에 내용을 추가하고 싶다면 `@prepend` 디렉티브를 사용해야 합니다.

```blade
@push('scripts')
    This will be second...
@endpush

// 이후 코드...

@prepend('scripts')
    This will be first...
@endprepend
```

<a name="service-injection"></a>
## 서비스 주입(Service Injection)

`@inject` 디렉티브는 라라벨 [서비스 컨테이너](/docs/10.x/container)에서 서비스를 가져올 때 사용합니다. 첫 번째 인수는 서비스가 할당될 변수명이고, 두 번째 인수는 가져올 서비스의 클래스 또는 인터페이스 이름입니다.

```blade
@inject('metrics', 'App\Services\MetricsService')

<div>
    Monthly Revenue: {{ $metrics->monthlyRevenue() }}.
</div>
```

<a name="rendering-inline-blade-templates"></a>
## 인라인 Blade 템플릿 렌더링

간혹 Blade 템플릿 문자열을 유효한 HTML로 변환해야 할 때가 있습니다. 이럴 때는 `Blade` 파사드가 제공하는 `render` 메서드를 사용할 수 있습니다. `render` 메서드는 Blade 템플릿 문자열과, 옵션으로 템플릿에 전달할 데이터 배열을 인자로 받습니다.

```php
use Illuminate\Support\Facades\Blade;

return Blade::render('Hello, {{ $name }}', ['name' => 'Julian Bashir']);
```

라라벨은 인라인 Blade 템플릿을 렌더링할 때 임시 파일을 `storage/framework/views` 디렉터리에 저장합니다. 만약 Blade 템플릿을 렌더링한 후, 이 임시 파일을 자동으로 삭제하고 싶다면, 메서드에 `deleteCachedView` 인자를 추가로 지정하면 됩니다.

```php
return Blade::render(
    'Hello, {{ $name }}',
    ['name' => 'Julian Bashir'],
    deleteCachedView: true
);
```

<a name="rendering-blade-fragments"></a>
## Blade 프래그먼트(Fragment) 렌더링

[Tubro](https://turbo.hotwired.dev/)나 [htmx](https://htmx.org/) 같은 프론트엔드 프레임워크와 함께 사용할 때, 때로는 HTTP 응답에서 Blade 템플릿의 일부분만 반환하고 싶을 수 있습니다. Blade의 "프래그먼트(fragment)" 기능을 이용하면 이런 상황에 딱 맞는 처리가 가능합니다. 사용하려면, Blade 템플릿의 일부 코드를 `@fragment`와 `@endfragment` 디렉티브로 감싸세요.

```blade
@fragment('user-list')
    <ul>
        @foreach ($users as $user)
            <li>{{ $user->name }}</li>
        @endforeach
    </ul>
@endfragment
```

이제 이 템플릿을 사용하는 뷰를 렌더링할 때, `fragment` 메서드로 반환할 프래그먼트의 이름만 지정하면, 해당 부분만 HTTP 응답에 포함됩니다.

```php
return view('dashboard', ['users' => $users])->fragment('user-list');
```

`fragmentIf` 메서드는 특정 조건에 따라 뷰의 프래그먼트만 반환할지를 제어합니다. 조건이 만족하지 않으면 전체 뷰가 반환됩니다.

```php
return view('dashboard', ['users' => $users])
    ->fragmentIf($request->hasHeader('HX-Request'), 'user-list');
```

`fragments`와 `fragmentsIf` 메서드는 응답에 여러 개의 뷰 프래그먼트를 결합하여 반환할 때 사용합니다. 지정한 프래그먼트들이 한 번에 모두 붙어서 반환됩니다.

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
## Blade 확장하기(Extending Blade)

Blade에서는 `directive` 메서드를 사용해 나만의 커스텀 디렉티브를 정의할 수 있습니다. Blade 컴파일러가 해당 디렉티브를 만나면, 제공된 콜백에서 그 디렉티브의 인수(표현식, expression)를 받아 처리하게 됩니다.

아래 예시는 `@datetime($var)`라는 디렉티브를 만들어서, 전달받은 `$var`가 `DateTime` 인스턴스라고 가정하고 포맷팅하는 방법입니다.

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

보시는 것처럼, 해당 디렉티브에 전달된 표현식에 바로 `format` 메서드를 체이닝해서 사용할 수 있습니다. 위 예시에서 최종적으로 생성될 PHP 코드는 다음과 같습니다.

```
<?php echo ($var)->format('m/d/Y H:i'); ?>
```

> [!WARNING]
> Blade 디렉티브의 로직을 수정한 후에는 모든 Blade 뷰 캐시 파일을 삭제해야 합니다. 캐시된 Blade 뷰 파일은 `view:clear` Artisan 명령어를 사용해 삭제할 수 있습니다.

<a name="custom-echo-handlers"></a>
### 커스텀 Echo 핸들러

Blade에서 어떤 객체를 `{{ ... }}`로 "echo"하면, 해당 객체의 `__toString` 메서드가 호출됩니다. [`__toString`](https://www.php.net/manual/en/language.oop5.magic.php#object.tostring) 메서드는 PHP에서 기본적으로 제공하는 "매직 메서드" 중 하나입니다. 하지만 사용 중인 클래스가 서드파티 라이브러리 소속이어서 직접 `__toString`을 수정할 수 없는 경우가 있을 수 있습니다.

이런 경우 Blade는 특정 타입의 객체에 대해 커스텀 echo 핸들러를 등록할 수 있도록 `stringable` 메서드를 제공합니다. `stringable`은 클로저를 인수로 받으며, 이 클로저에서 렌더링할 객체 타입을 타입힌트로 지정할 수 있습니다. 일반적으로 `AppServiceProvider` 클래스의 `boot` 메서드 안에서 커스텀 핸들러를 등록합니다.

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

이제 커스텀 echo 핸들러를 등록했다면, Blade 템플릿에서 해당 객체를 그냥 출력만 해도 됩니다.

```blade
Cost: {{ $money }}
```

<a name="custom-if-statements"></a>
### 커스텀 If 문

경우에 따라, 간단한 커스텀 조건문을 만들고 싶을 때 디렉티브를 직접 만드는 것보다 더 간단한 방법이 필요할 수 있습니다. 이를 위해 Blade에서는 클로저를 이용해 빠르게 커스텀 조건문 디렉티브를 만들 수 있는 `Blade::if` 메서드를 제공합니다. 예를 들어, 애플리케이션에서 기본 "디스크" 설정값을 확인하는 커스텀 조건문을 만들어보겠습니다. 아래 코드는 `AppServiceProvider`의 `boot` 메서드에서 실행하면 됩니다.

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

커스텀 조건문을 정의했다면, Blade 템플릿에서 다음과 같이 사용할 수 있습니다.

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