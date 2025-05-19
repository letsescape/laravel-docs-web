# 프론트엔드 (Frontend)

- [소개](#introduction)
- [PHP 사용하기](#using-php)
    - [PHP와 Blade](#php-and-blade)
    - [Livewire](#livewire)
    - [스타터 키트](#php-starter-kits)
- [Vue / React 사용하기](#using-vue-react)
    - [Inertia](#inertia)
    - [스타터 키트](#inertia-starter-kits)
- [에셋 번들링](#bundling-assets)

<a name="introduction"></a>
## 소개

라라벨은 [라우팅](/docs/10.x/routing), [유효성 검증](/docs/10.x/validation), [캐싱](/docs/10.x/cache), [큐](/docs/10.x/queues), [파일 스토리지](/docs/10.x/filesystem) 등과 같이 현대적인 웹 애플리케이션 개발에 필요한 모든 기능을 제공하는 백엔드 프레임워크입니다. 그러나 저희는 개발자 여러분께 강력한 프론트엔드 구축 방식까지 포함된, 아름다운 풀스택 경험을 제공하는 것이 중요하다고 생각합니다.

라라벨로 애플리케이션을 개발할 때 프론트엔드 개발을 진행하는 주요한 두 가지 방식이 있습니다. 어떤 접근 방식을 선택할지는 여러분이 PHP를 활용할지, 아니면 Vue와 React 같은 JavaScript 프레임워크를 사용할지에 따라 결정됩니다. 아래에서 두 가지 옵션을 모두 다루니, 여러분의 애플리케이션에 가장 적합한 프론트엔드 개발 방식을 선택하는 데 참고하시기 바랍니다.

<a name="using-php"></a>
## PHP 사용하기

<a name="php-and-blade"></a>
### PHP와 Blade

과거 대부분의 PHP 애플리케이션은 단순한 HTML 템플릿에 PHP의 `echo` 문을 섞어가며, 요청 중 데이터베이스에서 조회한 데이터를 브라우저에 HTML로 렌더링하곤 했습니다.

```blade
<div>
    <?php foreach ($users as $user): ?>
        Hello, <?php echo $user->name; ?> <br />
    <?php endforeach; ?>
</div>
```

라라벨에서는 이런 HTML 렌더링 방식도 계속 지원하며, [뷰](/docs/10.x/views)와 [Blade](/docs/10.x/blade)를 사용해 구현할 수 있습니다. Blade는 데이터를 출력하거나 반복하는 등의 작업을 매우 간편하고 짧은 문법으로 표현할 수 있게 해주는, 가볍고 효율적인 템플릿 언어입니다.

```blade
<div>
    @foreach ($users as $user)
        Hello, {{ $user->name }} <br />
    @endforeach
</div>
```

이런 방식으로 애플리케이션을 구축하면, 폼 제출 등의 페이지 상호작용이 발생할 때마다 서버에서 완전히 새로운 HTML 문서를 받아오고, 브라우저가 전체 페이지를 다시 렌더링하게 됩니다. 오늘날에도 많은 애플리케이션이 단순한 Blade 템플릿으로 프론트엔드를 구성해도 충분히 적합할 때가 많습니다.

<a name="growing-expectations"></a>
#### 높아지는 사용자 기대치

하지만 웹 애플리케이션에 대한 사용자의 기대치가 점점 높아지면서, 더 정교하고 동적인 프론트엔드를 필요로 하는 경우가 많아졌습니다. 이에 따라 일부 개발자들은 Vue, React와 같은 JavaScript 프레임워크를 활용해 프론트엔드를 개발하기 시작했습니다.

반면, 자신이 익숙한 백엔드 언어를 계속 사용하고 싶어하는 개발자들은, 주로 백엔드 언어를 이용하면서도 현대적인 웹 앱 UI를 만들 수 있는 솔루션을 개발하기도 했습니다. 예를 들어, [Rails](https://rubyonrails.org/) 생태계에서는 [Turbo](https://turbo.hotwired.dev/), [Hotwire](https://hotwired.dev/), [Stimulus](https://stimulus.hotwired.dev/)와 같은 라이브러리가 탄생했습니다.

라라벨 생태계에서는 PHP만으로도 현대적이고 동적인 프론트엔드를 구축하려는 요구가 [Laravel Livewire](https://livewire.laravel.com)와 [Alpine.js](https://alpinejs.dev/) 같은 도구의 탄생으로 이어졌습니다.

<a name="livewire"></a>
### Livewire

[Laravel Livewire](https://livewire.laravel.com)는 라라벨로 동작하는 프론트엔드를 현대적이고 생동감 있게, Vue나 React 같은 최신 JavaScript 프레임워크로 개발한 것처럼 만들 수 있는 프레임워크입니다.

Livewire를 사용하면 UI의 독립적인 일부를 담당하는 "컴포넌트"를 만들어, 프론트엔드에서 호출하거나 상호작용할 수 있는 메서드와 데이터를 노출할 수 있습니다. 예를 들어, 간단한 "카운터" 컴포넌트는 다음과 같이 작성할 수 있습니다.

```php
<?php

namespace App\Http\Livewire;

use Livewire\Component;

class Counter extends Component
{
    public $count = 0;

    public function increment()
    {
        $this->count++;
    }

    public function render()
    {
        return view('livewire.counter');
    }
}
```

카운터의 뷰 템플릿은 아래와 같이 작성됩니다.

```blade
<div>
    <button wire:click="increment">+</button>
    <h1>{{ $count }}</h1>
</div>
```

위 예시처럼, Livewire는 `wire:click` 같은 새로운 HTML 속성을 사용할 수 있게 해주어 라라벨 애플리케이션의 프론트엔드와 백엔드를 자연스럽게 연결해줍니다. 또한 컴포넌트의 상태를 단순한 Blade 문법으로 출력할 수 있습니다.

많은 개발자에게 Livewire는 라라벨 프론트엔드 개발 방식에 혁신을 가져다주었으며, 라라벨 환경 내에서만 머무르면서도 현대적이고 동적인 웹 앱 개발이 가능합니다. 일반적으로 Livewire를 사용하는 개발자들은, 다이얼로그 창처럼 특별한 곳에만 JavaScript가 필요할 때 [Alpine.js](https://alpinejs.dev/)를 함께 사용해서 최소한의 JavaScript만 프론트엔드에 추가합니다.

라라벨이 처음이라면, [뷰](/docs/10.x/views)와 [Blade](/docs/10.x/blade)의 기본 사용법을 먼저 익힌 뒤, 공식 [Laravel Livewire 문서](https://livewire.laravel.com/docs)를 참고해 동적인 Livewire 컴포넌트로 애플리케이션을 확장하는 방법을 배워보시기 바랍니다.

<a name="php-starter-kits"></a>
### 스타터 키트

PHP와 Livewire로 프론트엔드를 구축하고 싶다면, 라라벨에서 제공하는 Breeze 또는 Jetstream [스타터 키트](/docs/10.x/starter-kits)를 활용해 개발을 빠르게 시작할 수 있습니다. 이 스타터 키트들은 모두 [Blade](/docs/10.x/blade)와 [Tailwind](https://tailwindcss.com)를 기반으로 백엔드와 프론트엔드 인증 흐름을 미리 구현해주기 때문에, 본격적인 프로젝트 아이디어에 바로 집중할 수 있습니다.

<a name="using-vue-react"></a>
## Vue / React 사용하기

라라벨과 Livewire만으로도 충분히 현대적인 프론트엔드 개발이 가능하지만, 여전히 많은 개발자들이 Vue나 React와 같은 JavaScript 프레임워크의 강력함을 선호합니다. 이런 선택은 NPM을 통해 다양한 JavaScript 패키지와 도구의 생태계를 적극적으로 활용할 수 있다는 장점이 있습니다.

하지만 별도의 추가 도구 없이는, 라라벨과 Vue 또는 React를 함께 사용할 때 클라이언트 사이드 라우팅, 데이터 하이드레이션, 인증 등 다양한 복잡한 문제를 직접 해결해야 합니다. 클라이언트 사이드 라우팅은 [Nuxt](https://nuxt.com/)나 [Next](https://nextjs.org/)와 같은 Vue/React 전용 프레임워크로 어느 정도 간소화할 수 있지만, 데이터 하이드레이션과 인증 문제는 여전히 복잡하며 직접 풀어야 할 과제입니다.

또한, 이런 방식은 두 개의 독립적인 코드 저장소를 관리해야 하므로 유지보수, 릴리즈, 배포 작업을 따로 조율해야 하는 번거로움이 생깁니다. 물론 극복할 수 없는 문제는 아니지만, 생산적이거나 즐거운 개발 방식은 아니라 생각합니다.

<a name="inertia"></a>
### Inertia

다행히 라라벨은 두 세계의 장점을 모두 제공합니다. [Inertia](https://inertiajs.com)는 라라벨 애플리케이션과 최신 Vue, React 프론트엔드의 간극을 연결해 주는 역할을 하여, 라라벨의 라우트와 컨트롤러를 이용해 라우팅, 데이터 하이드레이션, 인증을 처리하면서 Vue 또는 React로 전체 프론트엔드를 구축할 수 있게 해줍니다. 이 모든 작업을 하나의 코드 저장소에서 관리할 수 있습니다. 덕분에 라라벨과 Vue/React의 장점을 모두 누리면서, 어느 쪽의 기능도 타협할 필요가 없습니다.

라라벨 애플리케이션에 Inertia를 설치하면, 평소처럼 라우트와 컨트롤러를 작성할 수 있습니다. 단, 컨트롤러에서 Blade 템플릿을 반환하는 대신, Inertia 페이지를 반환하게 됩니다.

```php
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Show the profile for a given user.
     */
    public function show(string $id): Response
    {
        return Inertia::render('Users/Profile', [
            'user' => User::findOrFail($id)
        ]);
    }
}
```

여기서 Inertia 페이지는 보통 애플리케이션의 `resources/js/Pages` 디렉토리에 위치하는 Vue 또는 React 컴포넌트를 의미합니다. `Inertia::render` 메서드를 통해 전달되는 데이터는 해당 페이지 컴포넌트의 "props"로 하이드레이트되어 사용됩니다.

```vue
<script setup>
import Layout from '@/Layouts/Authenticated.vue';
import { Head } from '@inertiajs/vue3';

const props = defineProps(['user']);
</script>

<template>
    <Head title="User Profile" />

    <Layout>
        <template #header>
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                Profile
            </h2>
        </template>

        <div class="py-12">
            Hello, {{ user.name }}
        </div>
    </Layout>
</template>
```

이처럼 Inertia를 사용하면 Vue나 React의 모든 기능을 프론트엔드 개발에 적극적으로 활용할 수 있으면서, 라라벨 기반 백엔드와 JavaScript 프론트엔드 사이를 가볍게 연결해 효율적으로 개발할 수 있습니다.

#### 서버 사이드 렌더링 (Server-Side Rendering)

애플리케이션에 서버 사이드 렌더링이 필요해서 Inertia 도입이 망설여진다면 걱정하지 않으셔도 됩니다. Inertia는 [서버 사이드 렌더링 지원](https://inertiajs.com/server-side-rendering)을 제공합니다. 또한 [Laravel Forge](https://forge.laravel.com)를 통해 애플리케이션을 배포할 때도 Inertia의 서버 사이드 렌더링 프로세스를 손쉽게 항상 동작하도록 설정할 수 있습니다.

<a name="inertia-starter-kits"></a>
### 스타터 키트

Inertia, Vue/React를 활용해 프론트엔드를 만들고 싶다면, Breeze 또는 Jetstream [스타터 키트](/docs/10.x/starter-kits#breeze-and-inertia)로 프로젝트의 개발 속도를 높일 수 있습니다. 이 스타터 키트들은 Inertia와 Vue/React, [Tailwind](https://tailwindcss.com), [Vite](https://vitejs.dev)를 활용해 백엔드/프론트엔드 인증 흐름까지 미리 구성해주므로, 곧바로 본인의 새로운 아이디어에 집중할 수 있습니다.

<a name="bundling-assets"></a>
## 에셋 번들링

Blade와 Livewire를 사용하든, Vue/React와 Inertia를 사용하든, 애플리케이션의 CSS 에셋을 프로덕션에서 사용할 수 있도록 번들링해야 할 필요가 있습니다. 물론 Vue나 React로 프론트엔드를 구성한다면, 컴포넌트 역시 브라우저에서 동작할 수 있는 자바스크립트 에셋으로 번들링해야 합니다.

라라벨은 기본적으로 [Vite](https://vitejs.dev)를 사용해 에셋을 번들링합니다. Vite는 번개처럼 빠른 빌드 속도와, 로컬 개발 환경에서의 즉각적인 Hot Module Replacement(HMR, 핫 모듈 교체) 기능을 제공합니다. 모든 새로운 라라벨 애플리케이션(그리고 [스타터 키트](/docs/10.x/starter-kits) 프로젝트)에는 `vite.config.js` 파일이 포함되어 있으며, 라라벨용 Vite 플러그인을 로드해 라라벨과 Vite를 즐겁게 함께 사용할 수 있습니다.

라라벨과 Vite를 빠르게 시작하려면, [Laravel Breeze](/docs/10.x/starter-kits#laravel-breeze) 스타터 키트로 프로젝트 개발을 시작하는 것이 가장 손쉽습니다. Breeze는 프론트엔드와 백엔드 인증 구조를 모두 빠르게 갖출 수 있도록 도와줍니다.

> [!NOTE]
> Vite를 라라벨과 함께 사용하는 방법에 대해서는 [에셋 번들링 및 컴파일에 관한 전용 문서](/docs/10.x/vite)를 참고하시기 바랍니다.
