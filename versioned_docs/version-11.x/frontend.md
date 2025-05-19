# 프론트엔드 (Frontend)

- [소개](#introduction)
- [PHP 활용](#using-php)
    - [PHP 및 Blade](#php-and-blade)
    - [Livewire](#livewire)
    - [스타터 킷](#php-starter-kits)
- [Vue / React 활용](#using-vue-react)
    - [Inertia](#inertia)
    - [스타터 킷](#inertia-starter-kits)
- [에셋 번들링](#bundling-assets)

<a name="introduction"></a>
## 소개

라라벨은 [라우팅](/docs/11.x/routing), [유효성 검증](/docs/11.x/validation), [캐싱](/docs/11.x/cache), [큐](/docs/11.x/queues), [파일 저장소](/docs/11.x/filesystem) 등과 같이 현대적인 웹 애플리케이션 구축에 필요한 모든 기능을 제공하는 백엔드 프레임워크입니다. 하지만 저희는 개발자에게 아름다운 풀스택 개발 경험을 제공하는 것이 중요하다고 생각하며, 이를 위해 프론트엔드 구축을 위한 강력한 접근법도 함께 제시하고 있습니다.

라라벨로 애플리케이션을 개발할 때 프론트엔드 개발을 진행하는 주요 방식은 두 가지입니다. 여러분이 프론트엔드를 PHP로 구현할지, 아니면 Vue나 React 같은 JavaScript 프레임워크를 활용할지에 따라 나뉩니다. 아래에서는 이 두 가지 방식을 모두 다루며, 여러분의 애플리케이션에 가장 적합한 프론트엔드 개발 방식을 결정할 수 있도록 도와드립니다.

<a name="using-php"></a>
## PHP 활용

<a name="php-and-blade"></a>
### PHP 및 Blade

과거에는 대부분의 PHP 애플리케이션이 단순 HTML 템플릿 안에 PHP `echo` 문을 삽입하여, 요청 시 데이터베이스에서 가져온 데이터를 브라우저로 렌더링하는 방식이 일반적이었습니다.

```blade
<div>
    <?php foreach ($users as $user): ?>
        Hello, <?php echo $user->name; ?> <br />
    <?php endforeach; ?>
</div>
```

라라벨에서도 이러한 방식으로 HTML을 렌더링할 수 있으며, 이는 [뷰](/docs/11.x/views) 및 [Blade](/docs/11.x/blade)를 활용하여 구현할 수 있습니다. Blade는 매우 가볍고 직관적인 템플릿 언어로, 데이터를 출력하거나 반복 처리하는 작업을 간결한 문법으로 지원합니다.

```blade
<div>
    @foreach ($users as $user)
        Hello, {{ $user->name }} <br />
    @endforeach
</div>
```

이와 같은 방식으로 애플리케이션을 구축하면, 보통 폼 제출이나 페이지 내 상호작용이 있을 때마다 서버에서 HTML 문서 전체를 새로 받아와 브라우저가 전체 페이지를 다시 렌더링합니다. 여전히 많은 애플리케이션에서 간단한 Blade 템플릿만으로도 충분히 프론트엔드를 구축할 수 있습니다.

<a name="growing-expectations"></a>
#### 높아지는 기대치

하지만 웹 애플리케이션에 대한 사용자 기대치가 점점 높아지면서, 더 다이내믹하고 세련된 상호작용이 요구되는 프론트엔드를 구축해야 하는 경우가 많아졌습니다. 이런 흐름에 따라 일부 개발자들은 Vue나 React 같은 JavaScript 프레임워크를 이용해 프론트엔드를 제작하기 시작했습니다.

한편, 익숙한 백엔드 언어에 계속 머물고 싶은 개발자들은 현대적인 웹 UI를 백엔드 언어 위주로 구현할 수 있는 다양한 솔루션을 만들기도 했습니다. 예를 들어, [Rails](https://rubyonrails.org/) 생태계에서는 [Turbo](https://turbo.hotwired.dev/), [Hotwire](https://hotwired.dev/), [Stimulus](https://stimulus.hotwired.dev/)와 같은 라이브러리가 등장했습니다.

라라벨 생태계에서도 PHP를 위주로 하면서도 현대적이고 동적인 프론트엔드 구성을 위한 [Laravel Livewire](https://livewire.laravel.com)와 [Alpine.js](https://alpinejs.dev/)가 만들어졌습니다.

<a name="livewire"></a>
### Livewire

[Laravel Livewire](https://livewire.laravel.com)는 Vue나 React 같은 현대 JavaScript 프레임워크로 만든 프론트엔드처럼 동적이고 생동감 있는 라라벨 기반 프론트엔드를 구축할 수 있게 해주는 프레임워크입니다.

Livewire를 사용할 때는 UI의 특정 부분을 담당하는 Livewire "컴포넌트"를 정의합니다. 이 컴포넌트는 외부에서 호출하거나 상호작용할 수 있는 메서드와 데이터를 제공하며, 프론트엔드에서 이를 손쉽게 사용할 수 있게 해줍니다. 예를 들어, 간단한 "카운터" 컴포넌트는 다음과 같이 작성될 수 있습니다.

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

그리고 카운터에 대응하는 템플릿은 다음과 같이 작성할 수 있습니다.

```blade
<div>
    <button wire:click="increment">+</button>
    <h1>{{ $count }}</h1>
</div>
```

보시는 것처럼, Livewire를 사용하면 `wire:click`과 같은 새로운 HTML 속성을 활용해 라라벨 백엔드와 프론트엔드를 직접 연결할 수 있습니다. 그리고 간단한 Blade 표현식을 통해 컴포넌트의 현재 상태를 렌더링할 수 있습니다.

많은 개발자들에게 Livewire는 라라벨 프론트엔드 개발의 방식에 큰 변화를 가져왔습니다. 라라벨의 친숙함을 그대로 유지하면서도 현대적이고 동적인 웹 애플리케이션을 구축할 수 있기 때문입니다. 보통 Livewire를 사용할 때는 [Alpine.js](https://alpinejs.dev/)를 함께 활용하여, 필요한 부분에만 간단히 자바스크립트를 "첨가"할 수 있습니다(예: 다이얼로그 창 구현 등).

라라벨이 처음이라면, 우선 [뷰](/docs/11.x/views)와 [Blade](/docs/11.x/blade)의 기본 사용법을 익혀보시기 바랍니다. 그 다음, 공식 [Laravel Livewire 문서](https://livewire.laravel.com/docs)에서 상호작용이 가능한 Livewire 컴포넌트로 애플리케이션을 한 단계 더 발전시키는 방법을 확인해보세요.

<a name="php-starter-kits"></a>
### 스타터 킷

PHP와 Livewire를 사용해 프론트엔드를 구축하고자 한다면, Breeze 또는 Jetstream [스타터 킷](/docs/11.x/starter-kits)을 활용하여 애플리케이션 개발을 빠르게 시작할 수 있습니다. 이 스타터 킷들은 [Blade](/docs/11.x/blade)와 [Tailwind](https://tailwindcss.com)를 이용해 백엔드와 프론트엔드의 인증 흐름을 미리 구성해주므로, 여러분은 곧바로 새로운 아이디어를 실현하는 데 집중하실 수 있습니다.

<a name="using-vue-react"></a>
## Vue / React 활용

라라벨과 Livewire만으로도 현대적인 프론트엔드를 만들 수 있지만, 여전히 많은 개발자들은 Vue나 React 같은 JavaScript 프레임워크가 가진 강력한 기능을 선호합니다. 이를 이용하면 NPM을 통해 제공되는 다양한 자바스크립트 패키지와 도구도 적극적으로 활용할 수 있습니다.

그러나 추가적인 툴링이 없다면, 라라벨을 Vue 또는 React와 결합하여 개발할 때 클라이언트 사이드 라우팅, 데이터 하이드레이션, 인증 등 여러 복잡한 문제를 직접 해결해야 합니다. 클라이언트 사이드 라우팅은 [Nuxt](https://nuxt.com/)나 [Next](https://nextjs.org/) 같은 Vue/React 전용 프레임워크를 통해 간단하게 구현할 수 있지만, 데이터 하이드레이션이나 인증은 여전히 번거롭고 까다로운 작업입니다.

또한, 서버와 프론트엔드를 별개의 코드 저장소로 각각 관리해야 하므로, 유지보수, 릴리즈, 배포 등의 작업을 양쪽에서 따로 신경 써야 하는 경우가 많아집니다. 이런 문제들이 극복 불가능한 것은 아니지만, 생산적이거나 즐거운 개발 방식이라고 생각하지는 않습니다.

<a name="inertia"></a>
### Inertia

다행히도 라라벨에서는 두 방식의 장점을 모두 누릴 수 있습니다. [Inertia](https://inertiajs.com)는 라라벨 애플리케이션과 현대적인 Vue 또는 React 프론트엔드 사이의 간극을 메워줍니다. Inertia를 사용하면 Vue 혹은 React를 최대한 활용해 완성도 높은 프론트엔드를 만들면서도, 라라벨 라우트와 컨트롤러를 통해 라우팅, 데이터 하이드레이션, 인증 등을 처리할 수 있습니다. 그리고 이 모든 것이 단일 저장소 내에서 이루어집니다. 이에 따라 프론트엔드와 백엔드 각각의 장점을 온전히 누릴 수 있습니다.

라라벨 애플리케이션에 Inertia를 설치한 뒤에는 기존과 마찬가지로 라우트와 컨트롤러를 작성합니다. 단, 컨트롤러에서 Blade 템플릿 대신 Inertia 페이지를 반환하게 됩니다.

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

Inertia 페이지는 Vue 또는 React 컴포넌트이며, 보통 애플리케이션의 `resources/js/Pages` 디렉토리에 저장됩니다. `Inertia::render` 메서드를 통해 전달한 데이터는 해당 페이지 컴포넌트의 "props"로 사용되어 하이드레이션됩니다.

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

보시는 것처럼, Inertia를 사용하면 프론트엔드 개발 과정에서 Vue나 React의 모든 기능을 누릴 수 있고, 동시에 라라벨 기반 백엔드와 가볍게 연결할 수 있습니다.

#### 서버사이드 렌더링

애플리케이션에 서버사이드 렌더링이 꼭 필요한 경우, Inertia를 사용하는 것이 걱정될 수 있으나 걱정하지 않으셔도 됩니다. Inertia는 [서버사이드 렌더링 지원](https://inertiajs.com/server-side-rendering)을 제공합니다. 그리고 [Laravel Forge](https://forge.laravel.com)를 통해 애플리케이션을 배포할 때도 Inertia의 서버사이드 렌더링 프로세스를 항상 원활하게 유지할 수 있습니다.

<a name="inertia-starter-kits"></a>
### 스타터 킷

Inertia와 Vue / React를 함께 활용해 프론트엔드를 개발하고 싶다면, Breeze 또는 Jetstream [스타터 킷](/docs/11.x/starter-kits#breeze-and-inertia)을 활용해 신속하게 애플리케이션 개발을 시작할 수 있습니다. 이 스타터 킷들은 Inertia, Vue / React, [Tailwind](https://tailwindcss.com), [Vite](https://vitejs.dev)를 활용하여 백엔드와 프론트엔드 인증 플로우를 미리 구성해주기 때문에, 여러분은 바로 새로운 프로젝트 구축에 집중할 수 있습니다.

<a name="bundling-assets"></a>
## 에셋 번들링

Blade와 Livewire, 혹은 Vue / React와 Inertia 중 어떤 방식을 선택하더라도, 실제 서비스에 배포하기 위해서는 애플리케이션의 CSS를 번들링하여 최적화된 에셋으로 만들어야 합니다. 또한 Vue나 React로 프론트엔드를 개발하는 경우, 컴포넌트도 브라우저에서 동작할 수 있도록 자바스크립트 에셋으로 번들링해야 합니다.

라라벨에서는 기본적으로 [Vite](https://vitejs.dev)를 사용해 에셋을 번들링합니다. Vite는 아주 빠른 빌드 속도와 함께, 개발 환경에서 거의 즉각적으로 적용되는 Hot Module Replacement(HMR) 기능을 제공합니다. 모든 신규 라라벨 애플리케이션(스타터 킷을 사용하는 경우도 포함)에는 `vite.config.js` 파일이 있으며, 여기에 가볍고 직관적으로 사용할 수 있는 라라벨 전용 Vite 플러그인이 로드되어 있어 Vite 활용을 더욱 쉽게 만들어줍니다.

라라벨과 Vite로 개발을 시작하는 가장 빠른 방법은 [Laravel Breeze](/docs/11.x/starter-kits#laravel-breeze)를 선택하는 것입니다. Breeze는 가장 간단한 스타터 킷으로, 프론트엔드와 백엔드 인증 플로우까지 미리 구성해두어 바로 애플리케이션 개발을 시작할 수 있습니다.

> [!NOTE]  
> 라라벨에서 Vite를 활용한 에셋 번들링 및 컴파일 방법에 대한 자세한 설명은 [별도의 Vite 문서](/docs/11.x/vite)를 참고하시기 바랍니다.
