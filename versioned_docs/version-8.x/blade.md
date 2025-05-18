# 블레이드 템플릿 (Blade Templates)

- [소개](#introduction)
- [데이터 표시](#displaying-data)
    - [HTML 엔터티 인코딩](#html-entity-encoding)
    - [블레이드 & 자바스크립트 프레임워크](#blade-and-javascript-frameworks)
- [블레이드 디렉티브](#blade-directives)
    - [If 문](#if-statements)
    - [Switch 문](#switch-statements)
    - [반복문](#loops)
    - [Loop 변수](#the-loop-variable)
    - [조건부 클래스](#conditional-classes)
    - [서브뷰 포함하기](#including-subviews)
    - [@once 디렉티브](#the-once-directive)
    - [Raw PHP 사용하기](#raw-php)
    - [주석 달기](#comments)
- [컴포넌트](#components)
    - [컴포넌트 렌더링하기](#rendering-components)
    - [컴포넌트에 데이터 전달하기](#passing-data-to-components)
    - [컴포넌트 속성](#component-attributes)
    - [예약어](#reserved-keywords)
    - [슬롯(Slot)](#slots)
    - [인라인 컴포넌트 뷰](#inline-component-views)
    - [익명 컴포넌트](#anonymous-components)
    - [동적 컴포넌트](#dynamic-components)
    - [컴포넌트 수동 등록](#manually-registering-components)
- [레이아웃 구성](#building-layouts)
    - [컴포넌트로 레이아웃 구성하기](#layouts-using-components)
    - [템플릿 상속으로 레이아웃 구성하기](#layouts-using-template-inheritance)
- [폼](#forms)
    - [CSRF 필드](#csrf-field)
    - [Method 필드](#method-field)
    - [유효성 검증 에러](#validation-errors)
- [스택(Stacks)](#stacks)
- [서비스 주입](#service-injection)
- [블레이드 확장](#extending-blade)
    - [커스텀 Echo 핸들러](#custom-echo-handlers)
    - [커스텀 If 문](#custom-if-statements)

<a name="introduction"></a>
## 소개

블레이드(Blade)는 라라벨에 기본 포함된 간결하면서도 강력한 템플릿 엔진입니다. 일부 PHP 템플릿 엔진과 달리, 블레이드는 템플릿 내에서 일반 PHP 코드를 자유롭게 사용할 수 있도록 제한하지 않습니다. 실제로, 블레이드 템플릿은 모두 일반 PHP 코드로 컴파일되어 수정될 때까지 캐싱됩니다. 따라서 블레이드가 애플리케이션에 거의 성능 오버헤드를 발생시키지 않습니다. 블레이드 템플릿 파일의 확장자는 `.blade.php`이며, 보통 `resources/views` 디렉터리에 저장됩니다.

블레이드 뷰는 라우트 또는 컨트롤러에서 전역 `view` 헬퍼를 사용해 반환할 수 있습니다. 물론, [뷰](/docs/8.x/views) 문서에서 언급한 것처럼, `view` 헬퍼의 두 번째 인수를 통해 데이터도 블레이드 뷰로 전달할 수 있습니다.

```
Route::get('/', function () {
    return view('greeting', ['name' => 'Finn']);
});
```

> [!TIP]
> 블레이드 템플릿으로 더욱 동적인 인터페이스를 쉽고 빠르게 만들고 싶으신가요? [Laravel Livewire](https://laravel-livewire.com)를 확인해보시기 바랍니다.

<a name="displaying-data"></a>
## 데이터 표시

블레이드 뷰에 전달된 데이터를 중괄호로 감싸서 화면에 출력할 수 있습니다. 예를 들어, 다음과 같은 라우트가 있다고 가정해보겠습니다.

```
Route::get('/', function () {
    return view('welcome', ['name' => 'Samantha']);
});
```

이 예시에서 `name` 변수를 다음과 같이 표시할 수 있습니다.

```
Hello, {{ $name }}.
```

> [!TIP]
> 블레이드의 `{{ }}` 이코(출력) 문은 XSS 공격을 예방하기 위해 PHP의 `htmlspecialchars` 함수로 자동 처리됩니다.

뷰에 전달된 변수 값만 출력할 수 있는 것은 아닙니다. 어떠한 PHP 함수의 결과도 이코로 표시할 수 있습니다. 실제로 원하는 어떤 PHP 코드든 블레이드의 이코 문에 자유롭게 사용할 수 있습니다.

```
The current UNIX timestamp is {{ time() }}.
```

<a name="html-entity-encoding"></a>
### HTML 엔터티 인코딩

기본적으로 블레이드(그리고 라라벨의 `e` 헬퍼)는 HTML 엔터티를 이중 인코딩합니다. 이중 인코딩을 사용하지 않으려면, `AppServiceProvider`의 `boot` 메서드에서 `Blade::withoutDoubleEncoding` 메서드를 호출해주면 됩니다.

```
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        Blade::withoutDoubleEncoding();
    }
}
```

<a name="displaying-unescaped-data"></a>
#### 이스케이프되지 않은 데이터 표시

기본적으로 블레이드 `{{ }}` 구문은 XSS 공격을 방지하기 위해 PHP의 `htmlspecialchars` 함수를 거칩니다. 만약 데이터를 이스케이프하지 않고 그대로 출력하려면 다음과 같은 구문을 사용할 수 있습니다.

```
Hello, {!! $name !!}.
```

> [!NOTE]
> 애플리케이션 사용자가 제공한 콘텐츠를 출력할 때는 특히 주의해야 합니다. 사용자 제공 데이터는 항상 이스케이프되는 이중 중괄호(`{{ }}`) 구문을 사용해 XSS 공격을 예방하는 것이 좋습니다.

<a name="blade-and-javascript-frameworks"></a>
### 블레이드 & 자바스크립트 프레임워크

많은 자바스크립트 프레임워크에서도 화면에 표현할 값을 중괄호(`{}`)로 감싸서 표시합니다. 이럴 때 블레이드는 `@` 기호를 사용하여 렌더링 엔진이 해당 표현식을 건드리지 않도록 할 수 있습니다. 예를 들면 다음과 같습니다.

```
<h1>Laravel</h1>

Hello, @{{ name }}.
```

이 예시의 경우, 블레이드는 `@` 기호를 제거하지만, `{{ name }}` 표현식 자체는 변경하지 않습니다. 따라서 자바스크립트 프레임워크가 해당 내용을 제대로 렌더링할 수 있습니다.

또한, `@` 기호를 사용해 블레이드 디렉티브를 이스케이프(출력 자체는 그대로)할 수도 있습니다.

```
{{-- Blade template --}}
@@if()

<!-- HTML output -->
@if()
```

<a name="rendering-json"></a>
#### JSON 렌더링

자바스크립트 변수를 초기화하기 위해 배열을 뷰로 전달하고, 이를 JSON 형식으로 출력하고 싶을 때가 있습니다. 예를 들어,

```
<script>
    var app = <?php echo json_encode($array); ?>;
</script>
```

이렇게 직접 `json_encode`를 호출하지 않고, `Illuminate\Support\Js::from` 메서드 디렉티브를 사용하는 것이 더 좋습니다. `from` 메서드는 PHP의 `json_encode` 함수와 동일한 인수를 받으며, 결과 JSON이 HTML 속성 값 등에서 안전하게 사용될 수 있도록 적절히 이스케이프해줍니다. 반환 값은 `JSON.parse`를 사용한 자바스크립트 구문으로 변환되어, 객체나 배열을 올바른 자바스크립트 객체로 사용할 수 있습니다.

```
<script>
    var app = {{ Illuminate\Support\Js::from($array) }};
</script>
```

최신 버전의 라라벨 기본 코드에는 이 기능을 블레이드에서 더 편리하게 사용할 수 있도록 `Js` 파사드가 포함되어 있습니다.

```
<script>
    var app = {{ Js::from($array) }};
</script>
```

> [!NOTE]
> 이미 존재하는 변수만 `Js::from` 메서드로 JSON 처리해야 합니다. 블레이드 템플릿은 정규 표현식에 기반하고 있기 때문에 복잡한 식을 이 디렉티브에 전달하면 예기치 않은 오류가 발생할 수 있습니다.

<a name="the-at-verbatim-directive"></a>
#### `@verbatim` 디렉티브

템플릿의 넓은 영역에서 자바스크립트 변수를 중괄호(`{{ }}`)로 표시해야 한다면, `@verbatim` 디렉티브로 해당 HTML 구역을 감싸서 각각에 `@` 기호를 붙이지 않아도 되도록 할 수 있습니다.

```
@verbatim
    <div class="container">
        Hello, {{ name }}.
    </div>
@endverbatim
```

<a name="blade-directives"></a>
## 블레이드 디렉티브

블레이드는 템플릿 상속과 데이터 표시 외에도, 조건문이나 반복문 등 PHP의 일반적인 제어문 구조에 대한 간편한 단축 구문을 제공합니다. 이를 통해 PHP의 원래 구조와 익숙하면서도, 훨씬 간결하고 보기 좋은 문법으로 사용할 수 있습니다.

<a name="if-statements"></a>
### If 문

`@if`, `@elseif`, `@else`, `@endif` 디렉티브를 사용해 if문을 만들 수 있습니다. 이 디렉티브들은 PHP의 원래 if문과 완전히 동일하게 동작합니다.

```
@if (count($records) === 1)
    I have one record!
@elseif (count($records) > 1)
    I have multiple records!
@else
    I don't have any records!
@endif
```

편의상, 블레이드에는 `@unless` 디렉티브도 준비되어 있습니다.

```
@unless (Auth::check())
    You are not signed in.
@endunless
```

이미 설명한 조건문 외에도, `@isset` 및 `@empty` 디렉티브를 사용해 대응하는 PHP 함수처럼 간단히 활용할 수 있습니다.

```
@isset($records)
    // $records가 정의되어 있고 null이 아님...
@endisset

@empty($records)
    // $records가 "비어 있음"...
@endempty
```

<a name="authentication-directives"></a>
#### 인증 관련 디렉티브

`@auth` 및 `@guest` 디렉티브를 사용하면 현재 사용자가 [인증된 상태](/docs/8.x/authentication)인지, 혹은 게스트(비로그인)인지 간단히 확인할 수 있습니다.

```
@auth
    // 사용자가 인증되었습니다...
@endauth

@guest
    // 사용자가 인증되지 않았습니다...
@endguest
```

필요하다면 `@auth`와 `@guest` 디렉티브에서 검사할 인증 가드를 지정할 수 있습니다.

```
@auth('admin')
    // 사용자가 인증되었습니다...
@endauth

@guest('admin')
    // 사용자가 인증되지 않았습니다...
@endguest
```

<a name="environment-directives"></a>
#### 환경 체크 디렉티브

`@production` 디렉티브로 애플리케이션이 운영 환경에서 실행 중인지 확인할 수 있습니다.

```
@production
    // 운영 환경에서만 보이는 콘텐츠...
@endproduction
```

또한 `@env` 디렉티브를 써서, 애플리케이션이 특정 환경에서 실행 중인지 확인할 수 있습니다.

```
@env('staging')
    // "staging" 환경에서 실행 중입니다...
@endenv

@env(['staging', 'production'])
    // "staging"이나 "production" 환경에서 실행 중입니다...
@endenv
```

<a name="section-directives"></a>
#### Section(섹션) 디렉티브

템플릿 상속의 섹션에 내용이 있는지 `@hasSection` 디렉티브로 확인할 수 있습니다.

```html
@hasSection('navigation')
    <div class="pull-right">
        @yield('navigation')
    </div>

    <div class="clearfix"></div>
@endif
```

섹션에 내용이 없는 경우를 확인하려면 `sectionMissing` 디렉티브를 사용할 수 있습니다.

```html
@sectionMissing('navigation')
    <div class="pull-right">
        @include('default-navigation')
    </div>
@endif
```

<a name="switch-statements"></a>
### Switch 문

`@switch`, `@case`, `@break`, `@default`, `@endswitch` 디렉티브를 이용해 switch문을 만들 수 있습니다.

```
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

조건문 외에도, 블레이드는 PHP 반복문 구조를 위한 간단한 디렉티브를 제공합니다. 이들 디렉티브 역시 각각의 PHP 반복문과 정확히 같은 방식으로 동작합니다.

```
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

> [!TIP]
> `foreach` 반복문에서 반복에 대한 다양한 정보를 제공하는 [loop 변수](#the-loop-variable)를 활용할 수 있습니다. 예를 들어, 루프의 첫 번째 또는 마지막 반복인지 확인할 수 있습니다.

반복문 안에서 `@continue`와 `@break` 디렉티브를 사용해, 반복을 건너뛰거나 중단할 수도 있습니다.

```
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

이때, continue 또는 break 조건을 디렉티브 선언문 안에 바로 작성할 수도 있습니다.

```
@foreach ($users as $user)
    @continue($user->type == 1)

    <li>{{ $user->name }}</li>

    @break($user->number == 5)
@endforeach
```

<a name="the-loop-variable"></a>
### Loop 변수

`foreach` 반복문을 사용할 때, 반복문 내부에서는 `$loop` 변수를 사용할 수 있습니다. 이 변수로 반복문의 현재 인덱스, 첫번째/마지막 반복 여부 등 다양한 정보를 얻을 수 있습니다.

```
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

중첩 반복문에서는 부모 반복문의 `$loop` 변수에 `parent` 속성을 통해 접근할 수 있습니다.

```
@foreach ($users as $user)
    @foreach ($user->posts as $post)
        @if ($loop->parent->first)
            This is the first iteration of the parent loop.
        @endif
    @endforeach
@endforeach
```

`$loop` 변수는 아래와 같은 다양한 유용한 속성을 제공합니다.

| 속성 | 설명 |
| ----------- | ----------- |
| `$loop->index` | 현재 반복 인덱스 (0부터 시작) |
| `$loop->iteration` | 현재 반복 횟수 (1부터 시작) |
| `$loop->remaining` | 반복이 남은 횟수 |
| `$loop->count` | 배열(컬렉션)의 전체 항목 수 |
| `$loop->first` | 첫 반복인지 여부 |
| `$loop->last` | 마지막 반복인지 여부 |
| `$loop->even` | 반복이 짝수번째인지 여부 |
| `$loop->odd` | 반복이 홀수번째인지 여부 |
| `$loop->depth` | 중첩 반복문의 깊이 |
| `$loop->parent` | 중첩 반복문 내에서 부모의 loop 변수 |

<a name="conditional-classes"></a>
### 조건부 클래스

`@class` 디렉티브는 CSS 클래스 문자열을 조건부로 렌더링할 수 있게 해줍니다. 이 디렉티브는 클래스명과 조건이 쌍으로 이루어진 배열을 받습니다. 배열의 키는 적용할 클래스명, 값은 불리언(참/거짓) 표현식입니다. 만약 배열 요소의 키가 숫자라면, 해당 클래스는 항상 렌더링 결과에 포함됩니다.

```
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

<a name="including-subviews"></a>
### 서브뷰 포함하기

> [!TIP]
> `@include` 디렉티브를 자유롭게 사용할 수 있지만, 블레이드의 [컴포넌트](#components)는 데이터 및 속성 바인딩 등 다양한 이점을 제공하므로 가급적 컴포넌트 사용을 권장합니다.

블레이드의 `@include` 디렉티브를 사용하면 한 뷰 파일 내에서 다른 블레이드 뷰를 쉽게 포함할 수 있습니다. 부모 뷰에서 사용 가능한 모든 변수는 포함된 뷰에서도 그대로 사용할 수 있습니다.

```html
<div>
    @include('shared.errors')

    <form>
        <!-- Form Contents -->
    </form>
</div>
```

포함된 뷰가 부모 뷰의 모든 데이터를 상속받지만, 추가적으로 더 전달할 데이터가 있다면 배열로 넘길 수도 있습니다.

```
@include('view.name', ['status' => 'complete'])
```

존재하지 않는 뷰를 `@include`하려 하면 라라벨은 오류를 발생시킵니다. 포함할 뷰가 없을 수도 있는 경우에는 `@includeIf` 디렉티브를 사용하면 됩니다.

```
@includeIf('view.name', ['status' => 'complete'])
```

특정 불리언 조건값이 `true` 또는 `false`일 때 뷰를 포함하려면, `@includeWhen` 및 `@includeUnless` 디렉티브를 사용하세요.

```
@includeWhen($boolean, 'view.name', ['status' => 'complete'])

@includeUnless($boolean, 'view.name', ['status' => 'complete'])
```

여러 뷰 중 처음으로 존재하는 뷰를 포함하고 싶을 때는 `includeFirst` 디렉티브를 사용할 수 있습니다.

```
@includeFirst(['custom.admin', 'admin'], ['status' => 'complete'])
```

> [!NOTE]
> 블레이드 뷰에서 `__DIR__`와 `__FILE__` 상수는 피해서 사용하시기 바랍니다. 해당 상수들은 캐시된 컴파일 뷰의 경로를 가리키게 됩니다.

<a name="rendering-views-for-collections"></a>
#### 컬렉션에 대해 뷰 렌더링하기

반복문과 뷰 포함을 한 줄로 결합하고 싶을 때는 블레이드의 `@each` 디렉티브를 사용할 수 있습니다.

```
@each('view.name', $jobs, 'job')
```

`@each`의 첫 번째 인수는 반복마다 렌더링할 뷰 이름이고, 두 번째는 반복할 배열(또는 컬렉션) 값, 세 번째는 현재 반복 항목을 뷰 안에서 사용할 때 쓸 변수명입니다. 예를 들어, `jobs` 배열을 반복한다면 자식 뷰에서 각 job을 `job` 변수로 사용할 수 있습니다. 이때 현재 반복의 배열 키는 `key` 변수로도 활용할 수 있습니다.

네 번째 인수를 `@each`에 추가로 넘기면, 배열이 비어 있을 때 렌더링할 뷰를 지정할 수 있습니다.

```
@each('view.name', $jobs, 'job', 'view.empty')
```

> [!NOTE]
> `@each`로 렌더링된 뷰는 부모 뷰의 변수를 상속받지 않습니다. 자식 뷰에서 부모의 변수가 필요하다면 `@foreach`와 `@include`를 사용하는 것이 좋습니다.

<a name="the-once-directive"></a>
### `@once` 디렉티브

`@once` 디렉티브는 해당 부분의 템플릿을 한 번만 평가하도록 해줍니다. 예를 들어 [스택](#stacks)을 활용해 특정 자바스크립트 코드를 한 번만 헤더에 삽입하고 싶을 때 유용하게 사용할 수 있습니다. 루프 내에서 [컴포넌트](#components)를 여러 번 렌더링해도 한 번만 자바스크립트 코드를 출력하고 싶을 때 아래와 같이 사용할 수 있습니다.

```
@once
    @push('scripts')
        <script>
            // Your custom JavaScript...
        </script>
    @endpush
@endonce
```

<a name="raw-php"></a>
### Raw PHP 사용하기

특정 상황에서는 뷰에서 간단히 PHP 코드를 실행해야 할 수도 있습니다. 블레이드의 `@php` 디렉티브를 사용해 원하는 만큼의 PHP 코드를 직접 실행할 수 있습니다.

```
@php
    $counter = 1;
@endphp
```

<a name="comments"></a>
### 주석 달기

블레이드는 뷰에 주석을 남길 수 있도록 지원합니다. HTML 주석과 달리, 블레이드 주석은 애플리케이션이 반환하는 HTML 코드에 포함되지 않습니다.

```
{{-- This comment will not be present in the rendered HTML --}}
```

<a name="components"></a>
## 컴포넌트

컴포넌트와 슬롯(Slot)은 섹션, 레이아웃, include와 비슷한 이점을 제공합니다. 다만, 어떤 분들에게는 컴포넌트와 슬롯 개념이 더 이해하기 쉬울 수 있습니다. 컴포넌트는 클래스 기반 방식과 익명 방식, 두 가지로 작성할 수 있습니다.

클래스 기반 컴포넌트를 만들려면, `make:component` Artisan 명령어를 사용하면 됩니다. 예시로 간단한 `Alert` 컴포넌트를 만들어 보겠습니다. 명령어를 실행하면 컴포넌트가 `app/View/Components` 디렉터리에 생성됩니다.

```
php artisan make:component Alert
```

명령어는 컴포넌트의 뷰(템플릿) 파일도 함께 만들어줍니다. 해당 뷰는 `resources/views/components` 디렉터리에 위치합니다. 애플리케이션 내에서 컴포넌트를 만들 때, 별도의 등록 작업 없이 `app/View/Components`와 `resources/views/components` 디렉터리 내의 컴포넌트는 자동으로 인식됩니다.

컴포넌트를 하위 디렉터리에 생성할 수도 있습니다.

```
php artisan make:component Forms/Input
```

위 명령어로 `Input` 컴포넌트는 `app/View/Components/Forms` 디렉터리에, 뷰 파일은 `resources/views/components/forms` 디렉터리에 생성됩니다.

<a name="manually-registering-package-components"></a>

#### 패키지 컴포넌트 수동 등록하기

애플리케이션 자체에서 컴포넌트를 작성할 때는 `app/View/Components` 디렉터리와 `resources/views/components` 디렉터리에 있는 컴포넌트가 자동으로 인식됩니다.

그러나 만약 Blade 컴포넌트를 사용하는 패키지를 개발한다면, 컴포넌트 클래스와 해당 HTML 태그 별칭을 수동으로 등록해야 합니다. 일반적으로 패키지의 서비스 프로바이더의 `boot` 메서드에서 컴포넌트를 등록합니다.

```
use Illuminate\Support\Facades\Blade;

/**
 * Bootstrap your package's services.
 */
public function boot()
{
    Blade::component('package-alert', Alert::class);
}
```

컴포넌트가 등록된 후에는 아래와 같이 태그 별칭을 사용해 렌더링할 수 있습니다.

```
<x-package-alert/>
```

또는 `componentNamespace` 메서드를 사용해 컴포넌트 클래스를 관례적으로 자동 로딩할 수도 있습니다. 예를 들어, `Nightshade` 패키지에 `Calendar`와 `ColorPicker` 컴포넌트가 있고, 이들이 `Package\Views\Components` 네임스페이스에 위치한다고 가정해 봅시다.

```
use Illuminate\Support\Facades\Blade;

/**
 * Bootstrap your package's services.
 *
 * @return void
 */
public function boot()
{
    Blade::componentNamespace('Nightshade\\Views\\Components', 'nightshade');
}
```

이렇게 하면 패키지 컴포넌트를 `vendor` 네임스페이스로 `package-name::` 구문을 사용해 접근할 수 있습니다.

```
<x-nightshade::calendar />
<x-nightshade::color-picker />
```

Blade는 컴포넌트 이름을 파스칼 케이스로 변환하여 해당 컴포넌트와 연결된 클래스를 자동으로 찾습니다. 또한, "점" 표기법을 사용해 하위 디렉터리도 지원됩니다.

<a name="rendering-components"></a>
### 컴포넌트 렌더링하기

컴포넌트를 표시하려면 Blade 템플릿 내에서 Blade 컴포넌트 태그를 사용하면 됩니다. Blade 컴포넌트 태그는 `x-`로 시작하고 그 뒤에 컴포넌트 클래스 이름을 케밥 케이스로 표기합니다.

```
<x-alert/>

<x-user-profile/>
```

컴포넌트 클래스가 `app/View/Components` 디렉터리 내 하위 디렉터리에 위치한다면, `.`(점) 문자를 사용해 디렉터리 구조를 나타낼 수 있습니다. 예를 들어 `app/View/Components/Inputs/Button.php`에 컴포넌트가 있다면 다음과 같이 렌더링할 수 있습니다.

```
<x-inputs.button/>
```

<a name="passing-data-to-components"></a>
### 컴포넌트에 데이터 전달하기

Blade 컴포넌트에 데이터를 전달하려면 HTML 속성을 사용할 수 있습니다. 하드코딩된 원시 값은 일반적인 HTML 속성 문자열로 전달합니다. PHP 표현식이나 변수는 속성 앞에 콜론(`:`)을 붙여서 전달해야 합니다.

```
<x-alert type="error" :message="$message"/>
```

컴포넌트에 필요한 데이터는 컴포넌트 클래스의 생성자에서 정의합니다. 컴포넌트의 모든 public 속성은 자동으로 컴포넌트 뷰에서 사용할 수 있게 됩니다. 따라서 `render` 메서드에서 별도로 데이터를 뷰에 전달할 필요는 없습니다.

```
<?php

namespace App\View\Components;

use Illuminate\View\Component;

class Alert extends Component
{
    /**
     * 알림의 타입.
     *
     * @var string
     */
    public $type;

    /**
     * 알림 메시지.
     *
     * @var string
     */
    public $message;

    /**
     * 컴포넌트 인스턴스 생성.
     *
     * @param  string  $type
     * @param  string  $message
     * @return void
     */
    public function __construct($type, $message)
    {
        $this->type = $type;
        $this->message = $message;
    }

    /**
     * 컴포넌트를 나타내는 뷰/내용 반환.
     *
     * @return \Illuminate\View\View|\Closure|string
     */
    public function render()
    {
        return view('components.alert');
    }
}
```

컴포넌트가 렌더링될 때, 컴포넌트의 public 변수 값은 변수명을 이용해 출력할 수 있습니다.

```html
<div class="alert alert-{{ $type }}">
    {{ $message }}
</div>
```

<a name="casing"></a>
#### 케이스 표기법

컴포넌트 생성자 인수는 `camelCase`로 지정해야 하고, HTML 속성을 이용해 인수 이름을 참조할 때는 `kebab-case`를 사용해야 합니다. 예를 들어 다음과 같은 컴포넌트 생성자가 있다면

```
/**
 * 컴포넌트 인스턴스 생성.
 *
 * @param  string  $alertType
 * @return void
 */
public function __construct($alertType)
{
    $this->alertType = $alertType;
}
```

`$alertType` 인수는 아래와 같이 컴포넌트에 제공할 수 있습니다.

```
<x-alert alert-type="danger" />
```

<a name="escaping-attribute-rendering"></a>
#### 속성 렌더링 이스케이프

Alpine.js와 같이 콜론 접두사(`:`)를 속성에 사용하는 자바스크립트 프레임워크들이 있기 때문에, Blade가 해당 속성을 PHP 표현식으로 인식하지 않도록 하려면 더블 콜론(`::`)을 접두어로 사용합니다. 예를 들어 아래와 같은 컴포넌트가 있을 때,

```
<x-button ::class="{ danger: isDeleting }">
    Submit
</x-button>
```

Blade가 렌더링한 HTML은 다음과 같습니다.

```
<button :class="{ danger: isDeleting }">
    Submit
</button>
```

<a name="component-methods"></a>
#### 컴포넌트 메서드

컴포넌트 템플릿에서는 public 변수를 사용할 수 있는 것뿐만 아니라, public 메서드도 호출할 수 있습니다. 예를 들어, 컴포넌트에 `isSelected`라는 메서드가 있다고 가정해 봅니다.

```
/**
 * 주어진 옵션이 현재 선택된 옵션인지 판단.
 *
 * @param  string  $option
 * @return bool
 */
public function isSelected($option)
{
    return $option === $this->selected;
}
```

아래와 같이 메서드명과 같은 이름의 변수를 호출해 이 메서드를 컴포넌트 템플릿에서 사용할 수 있습니다.

```
<option {{ $isSelected($value) ? 'selected="selected"' : '' }} value="{{ $value }}">
    {{ $label }}
</option>
```

<a name="using-attributes-slots-within-component-class"></a>
#### 컴포넌트 클래스 내부에서 속성 & 슬롯 접근하기

Blade 컴포넌트는 클래스의 render 메서드 안에서 컴포넌트 이름, 속성, 슬롯 등에 접근할 수 있습니다. 이 때는 `render` 메서드에서 클로저를 반환해야 합니다. 이 클로저는 `$data` 배열을 인자로 받는데, 이 배열에는 컴포넌트에 대한 다양한 정보가 들어 있습니다.

```
/**
 * 컴포넌트를 나타내는 뷰/내용 반환.
 *
 * @return \Illuminate\View\View|\Closure|string
 */
public function render()
{
    return function (array $data) {
        // $data['componentName'];
        // $data['attributes'];
        // $data['slot'];

        return '<div>Components content</div>';
    };
}
```

`componentName` 값은 `x-` 접두어 이후 HTML 태그에 사용된 이름과 같습니다. 예를 들어 `<x-alert />`의 `componentName` 값은 `alert`이 됩니다. `attributes` 요소에는 해당 태그에 지정된 모든 속성이, `slot` 요소에는 슬롯의 내용이 `Illuminate\Support\HtmlString` 인스턴스로 담겨 있습니다.

이 클로저는 문자열을 반환해야 하며, 만약 이 문자열이 실제로 존재하는 Blade 뷰라면 해당 뷰가 렌더링됩니다. 만약 존재하지 않으면, 반환된 문자열이 인라인 Blade 뷰로 해석되어 렌더링됩니다.

<a name="additional-dependencies"></a>
#### 추가 의존성 주입하기

컴포넌트에서 라라벨의 [서비스 컨테이너](/docs/8.x/container)에서 의존성을 주입받을 필요가 있을 경우, 컴포넌트의 데이터 속성들 앞에 의존성을 나열하면 컨테이너가 자동으로 주입해줍니다.

```
use App\Services\AlertCreator

/**
 * 컴포넌트 인스턴스 생성.
 *
 * @param  \App\Services\AlertCreator  $creator
 * @param  string  $type
 * @param  string  $message
 * @return void
 */
public function __construct(AlertCreator $creator, $type, $message)
{
    $this->creator = $creator;
    $this->type = $type;
    $this->message = $message;
}
```

<a name="hiding-attributes-and-methods"></a>
#### 속성/메서드 숨기기

컴포넌트 템플릿에 노출시키고 싶지 않은 public 메서드나 속성이 있다면, 해당 속성이나 메서드의 이름을 `$except` 배열 속성에 추가하면 됩니다.

```
<?php

namespace App\View\Components;

use Illuminate\View\Component;

class Alert extends Component
{
    /**
     * 알림 타입.
     *
     * @var string
     */
    public $type;

    /**
     * 컴포넌트 템플릿에 노출시키지 않을 속성/메서드 목록.
     *
     * @var array
     */
    protected $except = ['type'];
}
```

<a name="component-attributes"></a>
### 컴포넌트 속성

이전에 컴포넌트에 데이터 속성을 전달하는 방법을 살펴보았습니다. 그러나 컴포넌트의 기능상 꼭 필요하지 않지만, 추가적인 HTML 속성(예: `class`)을 지정해야 하는 경우도 있습니다. 주로 이런 추가 속성들은 컴포넌트 템플릿의 루트 엘리먼트에 내려주고 싶을 때가 많습니다. 예를 들어 아래처럼 `alert` 컴포넌트를 렌더링하고 싶다고 가정해보겠습니다.

```
<x-alert type="error" :message="$message" class="mt-4"/>
```

컴포넌트 생성자에 정의되지 않은 모든 속성은 자동으로 컴포넌트의 "속성 백(attribute bag)"에 들어갑니다. 이 속성 백은 `$attributes` 변수로 컴포넌트에 자동 제공됩니다. 컴포넌트에서는 이 변수를 출력함으로써 모든 속성을 렌더링할 수 있습니다.

```
<div {{ $attributes }}>
    <!-- Component content -->
</div>
```

> [!NOTE]
> 현재 컴포넌트 태그에서 `@env` 같은 디렉티브를 사용하는 것은 지원되지 않습니다. 예를 들어 `<x-alert :live="@env('production')"/>`는 컴파일되지 않습니다.

<a name="default-merged-attributes"></a>
#### 기본/병합된 속성

속성의 기본값을 지정하거나, 특정 속성에 추가적인 값을 병합해야 할 때가 있습니다. 이럴 때는 속성 백의 `merge` 메서드를 사용할 수 있습니다. 이 메서드는 컴포넌트에 항상 적용되어야 하는 기본 CSS 클래스를 정의할 때 특히 유용합니다.

```
<div {{ $attributes->merge(['class' => 'alert alert-'.$type]) }}>
    {{ $message }}
</div>
```

이 컴포넌트를 다음처럼 사용한다고 가정해봅니다.

```
<x-alert type="error" :message="$message" class="mb-4"/>
```

최종적으로 렌더링되는 컴포넌트의 HTML은 아래와 같이 나옵니다.

```html
<div class="alert alert-error mb-4">
    <!-- Contents of the $message variable -->
</div>
```

<a name="conditionally-merge-classes"></a>
#### 조건부 클래스 병합하기

특정 조건이 `true`일 때만 클래스를 병합하고 싶을 때가 있습니다. `class` 메서드를 사용하면 배열을 넘겨서, 배열 키가 추가할 클래스(또는 여러 클래스), 값이 해당 클래스의 추가 여부를 결정할 불리언 표현식이 됩니다. 배열의 키가 숫자일 경우, 이 클래스는 항상 렌더링에 포함됩니다.

```
<div {{ $attributes->class(['p-4', 'bg-red' => $hasError]) }}>
    {{ $message }}
</div>
```

만약 다른 속성도 함께 병합하고 싶다면, `class` 메서드 뒤에 `merge` 메서드를 체이닝해서 사용할 수 있습니다.

```
<button {{ $attributes->class(['p-4'])->merge(['type' => 'button']) }}>
    {{ $slot }}
</button>
```

> [!TIP]
> 병합된 속성을 받지 않아야 하는 다른 HTML 엘리먼트에서 조건부 클래스를 컴파일하려면, [`@class` 디렉티브](#conditional-classes)를 사용할 수 있습니다.

<a name="non-class-attribute-merging"></a>
#### class 이외의 속성 병합하기

`class` 외의 다른 속성을 병합할 때, `merge` 메서드에 넘겨진 값은 해당 속성의 "기본값"으로 간주됩니다. 그러나 `class` 속성과 달리, 이 속성들은 삽입된 속성 값과 병합되지 않고, 삽입 값이 있다면 기본값 대신 덮어써집니다. 예를 들어, 아래와 같은 `button` 컴포넌트를 구현했다고 가정해봅시다.

```
<button {{ $attributes->merge(['type' => 'button']) }}>
    {{ $slot }}
</button>
```

버튼 컴포넌트를 사용할 때 `type`을 지정하려면, 아래처럼 사용할 수 있습니다. 만약 타입을 지정하지 않으면 기본값인 `button`이 사용됩니다.

```
<x-button type="submit">
    Submit
</x-button>
```

이렇게 사용할 경우, 실제로 렌더된 버튼 컴포넌트의 HTML 코드는 다음과 같습니다.

```
<button type="submit">
    Submit
</button>
```

`class`가 아닌 속성에서도 기본값과 주입된 값을 모두 합치고 싶다면, `prepends` 메서드를 사용할 수 있습니다. 아래 예제에서는 `data-controller` 속성이 항상 `profile-controller`로 시작되고, 추가로 주입된 `data-controller` 값이 뒤에 붙습니다.

```
<div {{ $attributes->merge(['data-controller' => $attributes->prepends('profile-controller')]) }}>
    {{ $slot }}
</div>
```

<a name="filtering-attributes"></a>
#### 속성 가져오기 및 필터링하기

`filter` 메서드를 이용해 속성을 필터링할 수 있습니다. 이 메서드는 클로저를 인자로 받아, 클로저가 `true`를 반환하는 경우만 속성이 남게 됩니다.

```
{{ $attributes->filter(fn ($value, $key) => $key == 'foo') }}
```

편의를 위해, `whereStartsWith` 메서드를 사용하면 키가 특정 문자열로 시작하는 모든 속성을 한 번에 가져올 수 있습니다.

```
{{ $attributes->whereStartsWith('wire:model') }}
```

반대로, `whereDoesntStartWith` 메서드를 이용하면 특정 문자열로 시작하는 모든 속성을 제외할 수 있습니다.

```
{{ $attributes->whereDoesntStartWith('wire:model') }}
```

`first` 메서드를 사용하면, 속성 백에서 첫 번째 속성만 렌더링할 수 있습니다.

```
{{ $attributes->whereStartsWith('wire:model')->first() }}
```

컴포넌트에 특정 속성이 존재하는지 확인하고 싶다면, `has` 메서드를 이용합니다. 인자로 속성 이름만 전달하면, 해당 속성이 존재하는지 아닌지 불리언으로 반환합니다.

```
@if ($attributes->has('class'))
    <div>Class attribute is present</div>
@endif
```

특정 속성의 값을 가져오려면 `get` 메서드를 사용합니다.

```
{{ $attributes->get('class') }}
```

<a name="reserved-keywords"></a>
### 예약어(Reserved Keywords)

기본적으로, Blade가 내부적으로 컴포넌트를 렌더링할 때 사용하기 위해 몇 가지 예약어를 정의하고 있습니다. 아래에 나열된 예약어는 컴포넌트 내 public 속성이나 메서드 이름으로 사용할 수 없습니다.

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

컴포넌트에 "슬롯"을 통해 추가적인 콘텐츠를 전달할 필요가 있을 때가 많습니다. 컴포넌트 슬롯은 `$slot` 변수를 출력함으로써 렌더링됩니다. 개념을 살펴보기 위해, 다음과 같이 `alert` 컴포넌트의 마크업이 있다고 가정합시다.

```html
<!-- /resources/views/components/alert.blade.php -->

<div class="alert alert-danger">
    {{ $slot }}
</div>
```

이제 컴포넌트에 콘텐츠를 주입하여 `slot`에 값이 전달되도록 할 수 있습니다.

```html
<x-alert>
    <strong>Whoops!</strong> Something went wrong!
</x-alert>
```

컴포넌트 안에서 여러 위치에 다양한 슬롯을 전달해야 할 경우도 있습니다. 예를 들어 "title" 슬롯을 추가로 주입할 수 있도록 alert 컴포넌트를 수정해보겠습니다.

```html
<!-- /resources/views/components/alert.blade.php -->

<span class="alert-title">{{ $title }}</span>

<div class="alert alert-danger">
    {{ $slot }}
</div>
```

명명된 슬롯의 내용을 정의하려면 `x-slot` 태그를 사용하면 됩니다. 명시적으로 `x-slot` 태그 내에 있지 않은 모든 내용은 기본적으로 `$slot` 변수에 전달됩니다.

```html
<x-alert>
    <x-slot name="title">
        Server Error
    </x-slot>

    <strong>Whoops!</strong> Something went wrong!
</x-alert>
```

<a name="scoped-slots"></a>
#### 스코프 슬롯(Scoped Slots)

Vue 등의 자바스크립트 프레임워크를 사용해 본 적이 있다면, 컴포넌트의 데이터나 메서드에 접근할 수 있는 "스코프 슬롯"에 익숙할 수 있습니다. 라라벨에서도 컴포넌트의 public 메서드 또는 속성을 정의하고, 슬롯 내부에서 `$component` 변수로 컴포넌트에 접근함으로써 유사한 동작을 구현할 수 있습니다. 아래 예제에서는 `x-alert` 컴포넌트 클래스에 `formatAlert`라는 public 메서드가 정의되어 있다고 가정해 봅니다.

```html
<x-alert>
    <x-slot name="title">
        {{ $component->formatAlert('Server Error') }}
    </x-slot>

    <strong>Whoops!</strong> Something went wrong!
</x-alert>
```

<a name="slot-attributes"></a>
#### 슬롯 속성

Blade 컴포넌트와 마찬가지로, CSS 클래스명과 같은 [속성](#component-attributes)을 슬롯에 적용할 수 있습니다.

```html
<x-card class="shadow-sm">
    <x-slot name="heading" class="font-bold">
        Heading
    </x-slot>

    Content

    <x-slot name="footer" class="text-sm">
        Footer
    </x-slot>
</x-card>
```

슬롯의 속성과 상호작용하려면, 슬롯 변수의 `attributes` 속성에 접근하면 됩니다. 속성에 어떻게 접근하는지에 대한 자세한 내용은 [컴포넌트 속성](#component-attributes) 문서를 참고하세요.

```php
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

매우 간단한 컴포넌트의 경우 컴포넌트 클래스와 뷰 템플릿 파일을 따로 관리하는 것이 번거롭게 느껴질 수 있습니다. 이럴 때는 컴포넌트의 `render` 메서드에서 마크업을 직접 반환할 수 있습니다.

```
/**
 * 컴포넌트를 나타내는 뷰/내용 반환.
 *
 * @return \Illuminate\View\View|\Closure|string
 */
public function render()
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

인라인 뷰를 렌더링하는 컴포넌트를 생성하려면, `make:component` 명령어 실행 시 `inline` 옵션을 사용할 수 있습니다.

```
php artisan make:component Alert --inline
```

<a name="anonymous-components"></a>
### 익명 컴포넌트

인라인 컴포넌트와 유사하게, 익명(anonymous) 컴포넌트는 하나의 파일만으로 컴포넌트를 관리할 수 있는 방식을 제공합니다. 하지만 익명 컴포넌트는 하나의 뷰 파일만을 사용하며 별도의 클래스가 없습니다. 익명 컴포넌트를 정의하려면 단순히 Blade 템플릿을 `resources/views/components` 디렉터리에 추가하면 됩니다. 예를 들어, `resources/views/components/alert.blade.php`에 컴포넌트를 정의했다면, 다음과 같이 간단히 렌더링할 수 있습니다.

```
<x-alert/>
```

컴포넌트가 `components` 디렉터리 내에 더 깊이 중첩되어 있는 경우에는 `.`(점) 문자를 사용할 수 있습니다. 예를 들어, 컴포넌트가 `resources/views/components/inputs/button.blade.php`에 정의되어 있다면, 아래와 같이 렌더링할 수 있습니다.

```
<x-inputs.button/>
```

<a name="anonymous-index-components"></a>
#### 익명 인덱스 컴포넌트

때때로, 컴포넌트가 여러 Blade 템플릿으로 구성되어 있다면 하나의 디렉터리 안에 해당 컴포넌트의 템플릿들을 그룹화하고 싶을 수 있습니다. 예를 들어, "아코디언(accordion)" 컴포넌트가 아래와 같은 디렉터리 구조를 가진다고 가정해봅시다.

```none
/resources/views/components/accordion.blade.php
/resources/views/components/accordion/item.blade.php
```

이 구조를 사용하면 다음과 같이 아코디언 컴포넌트 및 아이템을 렌더링할 수 있습니다.

```html
<x-accordion>
    <x-accordion.item>
        ...
    </x-accordion.item>
</x-accordion>
```

하지만 위와 같이 `x-accordion`으로 아코디언 컴포넌트를 렌더링하려면, "index" 역할의 아코디언 컴포넌트 템플릿을 관련된 다른 템플릿들과 함께 `accordion` 디렉터리가 아닌, `resources/views/components` 디렉터리에 두어야만 했습니다.

다행히도, Blade에서는 컴포넌트의 템플릿 디렉터리에 `index.blade.php` 파일을 둘 수 있습니다. 컴포넌트에 해당 `index.blade.php` 템플릿이 있으면, 컴포넌트의 "루트" 노드로서 렌더링됩니다. 즉, 앞서 보여준 Blade 문법을 그대로 사용할 수 있으면서, 디렉터리 구조는 아래처럼 정리할 수 있습니다.

```none
/resources/views/components/accordion/index.blade.php
/resources/views/components/accordion/item.blade.php
```

<a name="data-properties-attributes"></a>
#### 데이터 속성 / 속성(attribute) 구분

익명 컴포넌트에는 연결된 클래스가 없기 때문에, 어떤 데이터를 컴포넌트의 변수로 전달하고, 어떤 속성을 [속성 가방(attribute bag)](#component-attributes)에 넣어야 할지 궁금할 수 있습니다.

컴포넌트의 Blade 템플릿 맨 위에 `@props` 디렉티브를 사용하여 데이터 변수로 취급할 속성을 명시할 수 있습니다. 이외의 나머지 속성들은 모두 컴포넌트의 속성 가방에서 사용할 수 있습니다. 특정 데이터 변수에 기본값을 주고 싶다면 변수 이름을 배열의 키로, 기본값을 값으로 지정하면 됩니다.

```
<!-- /resources/views/components/alert.blade.php -->

@props(['type' => 'info', 'message'])

<div {{ $attributes->merge(['class' => 'alert alert-'.$type]) }}>
    {{ $message }}
</div>
```

위와 같이 컴포넌트를 정의했다면, 아래와 같이 컴포넌트를 렌더링할 수 있습니다.

```
<x-alert type="error" :message="$message" class="mb-4"/>
```

<a name="accessing-parent-data"></a>
#### 부모 데이터 접근

때때로 자식 컴포넌트에서 부모 컴포넌트의 데이터를 사용하고 싶을 때가 있습니다. 이럴 때는 `@aware` 디렉티브를 사용할 수 있습니다. 예를 들어, 부모 `<x-menu>`와 자식 `<x-menu.item>`로 이루어진 복잡한 메뉴 컴포넌트를 만든다고 가정해봅시다.

```
<x-menu color="purple">
    <x-menu.item>...</x-menu.item>
    <x-menu.item>...</x-menu.item>
</x-menu>
```

`<x-menu>` 컴포넌트는 아래와 같이 구현할 수 있습니다.

```
<!-- /resources/views/components/menu/index.blade.php -->

@props(['color' => 'gray'])

<ul {{ $attributes->merge(['class' => 'bg-'.$color.'-200']) }}>
    {{ $slot }}
</ul>
```

`color` 속성이 부모(`<x-menu>`)에만 전달되었으므로, 기본적으로 `<x-menu.item>` 내부에서는 사용할 수 없습니다. 하지만, `@aware` 디렉티브를 사용하면 `<x-menu.item>` 내부에서도 해당 값을 사용할 수 있습니다.

```
<!-- /resources/views/components/menu/item.blade.php -->

@aware(['color' => 'gray'])

<li {{ $attributes->merge(['class' => 'text-'.$color.'-800']) }}>
    {{ $slot }}
</li>
```

<a name="dynamic-components"></a>
### 동적 컴포넌트

어떤 컴포넌트를 렌더링할지는 런타임 값에 따라 결정되어야 할 때가 있습니다. 이런 상황에서는 Laravel에 내장된 `dynamic-component` 컴포넌트를 활용해 런타임 값이나 변수에 따라 컴포넌트를 렌더링할 수 있습니다.

```
<x-dynamic-component :component="$componentName" class="mt-4" />
```

<a name="manually-registering-components"></a>
### 컴포넌트 수동 등록

> [!NOTE]
> 아래 문서의 컴포넌트 수동 등록 내용은 주로 뷰 컴포넌트를 포함하는 Laravel 패키지를 작성하는 사용자에게 유용합니다. 패키지를 작성하지 않는 경우, 이 부분은 필요하지 않을 수 있습니다.

자신의 애플리케이션에서 컴포넌트를 작성할 때는, `app/View/Components` 디렉터리와 `resources/views/components` 디렉터리에 있는 컴포넌트들이 자동으로 인식됩니다.

하지만, Blade 컴포넌트를 활용하는 패키지 개발 시나, 비표준(일반적이지 않은) 디렉터리에 컴포넌트를 둘 경우에는, 라라벨이 해당 컴포넌트의 클래스를 찾을 수 있도록 컴포넌트 클래스와 HTML 태그 별칭(alias)을 직접 등록해야 합니다. 보통은 패키지의 서비스 프로바이더 `boot` 메서드에서 등록하게 됩니다.

```
use Illuminate\Support\Facades\Blade;
use VendorPackage\View\Components\AlertComponent;

/**
 * Bootstrap your package's services.
 *
 * @return void
 */
public function boot()
{
    Blade::component('package-alert', AlertComponent::class);
}
```

컴포넌트가 등록되고 나면, 태그 별칭(alias)을 사용해 다음과 같이 렌더링할 수 있습니다.

```
<x-package-alert/>
```

#### 패키지 컴포넌트 오토로드

또는, `componentNamespace` 메서드를 사용해 컴포넌트 클래스를 컨벤션에 따라 자동으로 로드할 수도 있습니다. 예를 들어, `Nightshade`라는 패키지에 `Calendar`와 `ColorPicker` 컴포넌트가 있고, 이들이 `Package\Views\Components` 네임스페이스에 위치한다고 가정하면:

```
use Illuminate\Support\Facades\Blade;

/**
 * Bootstrap your package's services.
 *
 * @return void
 */
public function boot()
{
    Blade::componentNamespace('Nightshade\\Views\\Components', 'nightshade');
}
```

위와 같이 등록해 주면, `package-name::` 형태의 벤더 네임스페이스로 패키지 컴포넌트를 사용할 수 있습니다.

```
<x-nightshade::calendar />
<x-nightshade::color-picker />
```

Blade는 컴포넌트 이름을 파스칼 표기법(PascalCase)으로 변환해 자동으로 관련된 클래스를 찾습니다. 하위 디렉터리 구조 역시 "점" 표기법(dot notation)으로 지원됩니다.

<a name="building-layouts"></a>
## 레이아웃 구성하기

<a name="layouts-using-components"></a>
### 컴포넌트를 이용한 레이아웃

대부분의 웹 애플리케이션은 여러 페이지에서 동일한 레이아웃 구조를 유지합니다. 만약 각 뷰마다 전체 레이아웃 HTML을 반복해서 작성해야 한다면 매우 번거롭고, 유지보수도 어렵게 됩니다. 다행히도, 이 레이아웃을 하나의 [Blade 컴포넌트](#components)로 정의해서 애플리케이션 전반에 걸쳐 재사용할 수 있습니다.

<a name="defining-the-layout-component"></a>
#### 레이아웃 컴포넌트 정의

예를 들어, "할 일(todo) 목록" 애플리케이션을 만든다고 가정합시다. 다음과 같은 `layout` 컴포넌트를 만들 수 있습니다.

```html
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
#### 레이아웃 컴포넌트 적용

`layout` 컴포넌트를 정의한 후, 해당 컴포넌트를 사용하는 Blade 뷰를 만들 수 있습니다. 예제로, 아래와 같이 할 일 목록을 출력하는 간단한 뷰를 정의해 보겠습니다.

```html
<!-- resources/views/tasks.blade.php -->

<x-layout>
    @foreach ($tasks as $task)
        {{ $task }}
    @endforeach
</x-layout>
```

컴포넌트에 전달된 내부 콘텐츠는 컴포넌트 내에서 기본적으로 `$slot` 변수로 전달됩니다. 또한, 위 레이아웃은 `$title` 슬롯이 제공될 경우 이를 사용하고, 제공되지 않으면 기본값을 표시하도록 되어 있습니다. [컴포넌트 문서](#components)에서 소개한 표준 슬롯 문법을 사용해, 아래와 같이 커스텀 제목을 주입할 수 있습니다.

```html
<!-- resources/views/tasks.blade.php -->

<x-layout>
    <x-slot name="title">
        커스텀 제목
    </x-slot>

    @foreach ($tasks as $task)
        {{ $task }}
    @endforeach
</x-layout>
```

레이아웃과 할 일 목록 뷰를 정의했다면, 이제 단순히 라우트에서 `tasks` 뷰를 반환하면 됩니다.

```
use App\Models\Task;

Route::get('/tasks', function () {
    return view('tasks', ['tasks' => Task::all()]);
});
```

<a name="layouts-using-template-inheritance"></a>
### 템플릿 상속을 이용한 레이아웃

<a name="defining-a-layout"></a>
#### 레이아웃 정의

레이아웃은 "템플릿 상속" 기능을 통해서도 만들 수 있습니다. 이 방식은 [컴포넌트](#components)가 도입되기 전, 애플리케이션을 구성하는 주된 방법이었습니다.

먼저, 간단한 예제를 살펴보겠습니다. 다음은 페이지 전체 레이아웃입니다. 일반적으로 여러 페이지에서 동일한 구조를 유지하기 때문에, 한 개의 Blade 뷰로 레이아웃을 정의하는 것이 편리합니다.

```html
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

이 파일에는 일반적인 HTML 마크업이 들어 있습니다. 하지만, `@section`과 `@yield` Blade 디렉티브에 주목해야 합니다. `@section` 디렉티브는 이름처럼 특정 콘텐츠 영역을 정의하며, `@yield` 디렉티브는 해당 영역의 내용을 출력하는 데 사용됩니다.

이제 애플리케이션의 레이아웃이 정의되었으니, 이 레이아웃을 상속받는 자식 페이지를 만들어 보겠습니다.

<a name="extending-a-layout"></a>
#### 레이아웃 확장

자식 뷰를 정의할 때는, 어떤 레이아웃을 상속받을 것인지 `@extends` Blade 디렉티브로 명시해야 합니다. 레이아웃을 상속받는 뷰에서는 `@section` 디렉티브를 사용해 레이아웃의 각 영역에 콘텐츠를 주입할 수 있습니다. 상기 예제에서처럼, 이 영역의 내용들은 레이아웃 내 `@yield`를 통해 표시됩니다.

```html
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

여기서 `sidebar` 영역은 `@@parent` 디렉티브를 사용해, 레이아웃의 사이드바 내용에 새로운 콘텐츠를 덧붙이는 방식으로 동작합니다. `@@parent`는 뷰가 렌더링될 때 레이아웃의 기본 내용을 해당 위치에 삽입합니다.

> [!TIP]
> 앞선 예제와 달리, 이번 `sidebar` 영역은 `@show`가 아닌 `@endsection`으로 끝납니다. `@endsection`은 단순히 영역을 정의만 하고, `@show`는 정의와 동시에 해당 영역을 **즉시 출력**합니다.

`@yield` 디렉티브는 두 번째 인자로 기본값을 받을 수도 있습니다. 만약 해당 영역이 정의되지 않은 경우에는 이 값이 출력됩니다.

```
@yield('content', 'Default content')
```

<a name="forms"></a>
## 폼 (Forms)

<a name="csrf-field"></a>
### CSRF 필드

애플리케이션에서 HTML 폼을 정의할 때는, [CSRF 보호](/docs/8.x/csrf) 미들웨어가 요청을 검증할 수 있도록 폼 내에 숨겨진 CSRF 토큰 필드를 항상 포함해야 합니다. `@csrf` Blade 디렉티브를 사용해서 이 토큰 필드를 생성할 수 있습니다.

```html
<form method="POST" action="/profile">
    @csrf

    ...
</form>
```

<a name="method-field"></a>
### 메서드 필드

HTML 폼은 `PUT`, `PATCH`, `DELETE` 요청을 직접 보낼 수 없기 때문에, 이러한 HTTP 동사를 흉내내기 위해 숨겨진 `_method` 필드를 추가해야 합니다. Blade의 `@method` 디렉티브로 이 필드를 생성할 수 있습니다.

```html
<form action="/foo/bar" method="POST">
    @method('PUT')

    ...
</form>
```

<a name="validation-errors"></a>
### 유효성 검증 에러

`@error` 디렉티브는 [유효성 검증 에러 메시지](/docs/8.x/validation#quick-displaying-the-validation-errors)가 특정 속성에 대해 존재하는지 빠르게 확인할 수 있습니다. `@error` 블록 내부에서는 `$message` 변수를 바로 출력해 에러 메시지를 표시할 수 있습니다.

```html
<!-- /resources/views/post/create.blade.php -->

<label for="title">Post Title</label>

<input id="title" type="text" class="@error('title') is-invalid @enderror">

@error('title')
    <div class="alert alert-danger">{{ $message }}</div>
@enderror
```

`@error` 디렉티브는 실제로 "if" 문으로 컴파일되므로, 에러가 없을 때 콘텐츠를 렌더링하려면 `@else` 디렉티브를 함께 사용할 수도 있습니다.

```html
<!-- /resources/views/auth.blade.php -->

<label for="email">Email address</label>

<input id="email" type="email" class="@error('email') is-invalid @else is-valid @enderror">
```

여러 개의 폼이 있는 페이지에서 [특정 에러 백(error bag) 이름](/docs/8.x/validation#named-error-bags)을 두 번째 인자로 전달해, 해당 이름을 가진 에러 메시지를 얻을 수도 있습니다.

```html
<!-- /resources/views/auth.blade.php -->

<label for="email">Email address</label>

<input id="email" type="email" class="@error('email', 'login') is-invalid @enderror">

@error('email', 'login')
    <div class="alert alert-danger">{{ $message }}</div>
@enderror
```

<a name="stacks"></a>
## 스택 (Stacks)

Blade에서는 명명된 스택에 콘텐츠를 추가(push)하고, 이 스택을 다른 뷰나 레이아웃에서 렌더링할 수 있습니다. 자식 뷰에서 필요한 JavaScript 라이브러리 등을 지정할 때 유용하게 쓸 수 있습니다.

```html
@push('scripts')
    <script src="/example.js"></script>
@endpush
```

스택에는 원하는 만큼 여러 번 push 할 수 있습니다. 전체 스택 내용을 렌더링하려면, `@stack` 디렉티브에 스택명을 전달합니다.

```html
<head>
    <!-- Head Contents -->

    @stack('scripts')
</head>
```

스택 앞쪽에 내용을 추가(prepend)하고 싶다면, `@prepend` 디렉티브를 사용합니다.

```html
@push('scripts')
    This will be second...
@endpush

// 이후에...

@prepend('scripts')
    This will be first...
@endprepend
```

<a name="service-injection"></a>
## 서비스 주입 (Service Injection)

`@inject` 디렉티브를 사용해 Laravel의 [서비스 컨테이너](/docs/8.x/container)에서 서비스를 내려받을 수 있습니다. 첫 번째 인자는 서비스가 할당될 변수명이며, 두 번째 인자는 주입할 서비스의 클래스나 인터페이스 이름입니다.

```html
@inject('metrics', 'App\Services\MetricsService')

<div>
    Monthly Revenue: {{ $metrics->monthlyRevenue() }}.
</div>
```

<a name="extending-blade"></a>
## Blade 확장하기

Blade는 `directive` 메서드를 이용해 사용자 정의 디렉티브를 직접 정의할 수 있습니다. Blade 컴파일러가 사용자 정의 디렉티브를 만나면, 디렉티브에 포함된 식(expression)을 전달하면서 지정한 콜백을 실행합니다.

아래 예제는 `@datetime($var)` 디렉티브를 만들고, 전달된 `$var`(DateTime 인스턴스여야 함)를 특정 포맷으로 출력합니다.

```
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        Blade::directive('datetime', function ($expression) {
            return "<?php echo ($expression)->format('m/d/Y H:i'); ?>";
        });
    }
}
```

위와 같이 하면, 디렉티브에 전달된 식에 대해 `format` 메서드를 체이닝합니다. 즉, 아래와 같이 작성한 Blade 템플릿이 실제로는 다음과 같이 컴파일됩니다.

```
<?php echo ($var)->format('m/d/Y H:i'); ?>
```

> [!NOTE]
> Blade 디렉티브의 로직을 변경한 뒤에는, 캐시된 Blade 뷰를 모두 삭제해야 합니다. `view:clear` 아티즌 명령어로 캐시된 Blade 뷰를 삭제할 수 있습니다.

<a name="custom-echo-handlers"></a>
### 커스텀 Echo 핸들러

Blade에서 오브젝트를 "echo"하면 그 객체의 `__toString` 메서드가 호출됩니다. [`__toString`](https://www.php.net/manual/en/language.oop5.magic.php#object.tostring) 메서드는 PHP에 내장된 "매직 메서드" 중 하나입니다. 하지만 사용 중인 클래스가 외부 라이브러리 소속이라서, `__toString` 메서드를 제어할 수 없는 상황도 있을 수 있습니다.

이럴 때 Blade는 해당 타입의 오브젝트에 대해 사용자 정의 echo 핸들러를 등록할 수 있게 해줍니다. 이 기능은 Blade의 `stringable` 메서드를 통해 사용합니다. `stringable` 메서드는 클로저를 인자로 받는데, 여기서 책임지는 오브젝트의 타입을 타입힌트로 명확히 지정해야 합니다. 보통 이 메서드는 애플리케이션의 `AppServiceProvider` 클래스의 `boot` 메서드 내에서 호출합니다.

```
use Illuminate\Support\Facades\Blade;
use Money\Money;

/**
 * Bootstrap any application services.
 *
 * @return void
 */
public function boot()
{
    Blade::stringable(function (Money $money) {
        return $money->formatTo('en_GB');
    });
}
```

이렇게 커스텀 echo 핸들러를 정의한 뒤에는, 해당 Blade 템플릿에서 객체를 바로 출력할 수 있습니다.

```html
Cost: {{ $money }}
```

<a name="custom-if-statements"></a>
### 커스텀 If 문

간단한 조건문을 위한 커스텀 디렉티브를 만들 때는, 별도로 복잡한 디렉티브 프로그래밍보다는 Blade의 `Blade::if` 메서드를 이용하는 것이 더 간편합니다. `Blade::if` 메서드를 사용하면 클로저로 조건문을 정의하고, 곧바로 커스텀 조건문 디렉티브를 사용할 수 있습니다. 예를 들어, 애플리케이션의 기본 "디스크(disk)"를 체크하는 커스텀 조건문을 만들어 보겠습니다. 해당 코드는 보통 `AppServiceProvider`의 `boot` 메서드에 추가합니다.

```
use Illuminate\Support\Facades\Blade;

/**
 * Bootstrap your package's services.
 *
 * @return void
 */
public function boot()
{
    Blade::if('disk', function ($value) {
        return config('filesystems.default') === $value;
    });
}
```

이 커스텀 조건문은 아래처럼 Blade 템플릿에서 사용할 수 있습니다.

```html
@disk('local')
    <!-- 애플리케이션이 local 디스크 사용 중일 때... -->
@elsedisk('s3')
    <!-- 애플리케이션이 s3 디스크 사용 중일 때... -->
@else
    <!-- 애플리케이션이 다른 디스크를 사용 중일 때... -->
@enddisk

@unlessdisk('local')
    <!-- 애플리케이션이 local 디스크가 아닐 때... -->
@enddisk
```