# 프론트엔드 (Frontend)

- [소개](#introduction)
- [PHP 사용하기](#using-php)
    - [PHP & Blade](#php-and-blade)
    - [Livewire](#livewire)
    - [스타터 킷](#php-starter-kits)
- [Vue / React 사용하기](#using-vue-react)
    - [Inertia](#inertia)
    - [스타터 킷](#inertia-starter-kits)
- [에셋 번들링](#bundling-assets)

<a name="introduction"></a>
## 소개

라라벨은 [라우팅](/docs/9.x/routing), [유효성 검증](/docs/9.x/validation), [캐싱](/docs/9.x/cache), [큐](/docs/9.x/queues), [파일 저장소](/docs/9.x/filesystem) 등 최신 웹 애플리케이션 개발에 필요한 모든 기능을 제공하는 백엔드 프레임워크입니다. 하지만 저희는 개발자가 아름다운 풀스택 개발 경험을 할 수 있도록 강력한 프론트엔드 개발 방식도 함께 제공하는 것이 중요하다고 생각합니다.

라라벨로 애플리케이션을 개발할 때 프론트엔드 개발을 진행하는 주요 방법은 두 가지가 있으며, 어떤 방식을 선택할지는 PHP를 활용하여 프론트엔드를 구축할지, 혹은 Vue나 React 같은 자바스크립트 프레임워크를 사용할지에 따라 달라집니다. 아래에서 두 가지 방법 모두를 설명하니, 여러분의 프로젝트에 가장 적합한 프론트엔드 개발 방식을 선택하는 데 참고하시기 바랍니다.

<a name="using-php"></a>
## PHP 사용하기

<a name="php-and-blade"></a>
### PHP & Blade

과거에는 대부분의 PHP 애플리케이션이 단순한 HTML 템플릿 안에 PHP의 `echo` 구문을 삽입하여, 요청 중 데이터베이스에서 조회한 데이터를 렌더링하며 HTML을 브라우저에 출력하는 방식이 많았습니다.

```blade
<div>
    <?php foreach ($users as $user): ?>
        Hello, <?php echo $user->name; ?> <br />
    <?php endforeach; ?>
</div>
```

라라벨에서는 이처럼 HTML을 렌더링하는 방식을 [뷰](/docs/9.x/views)와 [Blade](/docs/9.x/blade)를 통해 쉽게 구현할 수 있습니다. Blade는 데이터를 출력하거나 반복문 등 다양한 작업을 간결한 문법으로 처리할 수 있게 해주는 매우 가벼운 템플릿 언어입니다.

```blade
<div>
    @foreach ($users as $user)
        Hello, {{ $user->name }} <br />
    @endforeach
</div>
```

이와 같이 애플리케이션을 개발하면, 폼 제출이나 페이지 내 다른 상호작용 시마다 서버로부터 새로운 HTML 문서를 받아와 브라우저 전체를 다시 렌더링하게 됩니다. 실제로 오늘날에도 많은 애플리케이션에서는 이처럼 Blade 템플릿을 이용해 프론트엔드를 구성하는 방식이 충분히 적합한 경우가 많습니다.

<a name="growing-expectations"></a>
#### 높아지는 기대

하지만 웹 애플리케이션에 대한 사용자들의 기대치가 점점 높아지면서, 좀 더 역동적이고 세련된 상호작용을 제공하는 프론트엔드가 필요해진 경우가 많아졌습니다. 이런 흐름에서, 일부 개발자들은 Vue나 React 같은 자바스크립트 프레임워크를 활용해 프론트엔드를 구축하고 있습니다.

반면, 익숙한 백엔드 언어를 계속 사용하고 싶은 개발자들은 백엔드 언어만으로도 현대적인 웹 UI를 구현할 수 있는 솔루션을 만들어내기도 했습니다. 예를 들어, [Rails](https://rubyonrails.org/) 생태계에서는 이러한 필요로 인해 [Turbo](https://turbo.hotwired.dev/), [Hotwire](https://hotwired.dev/), [Stimulus](https://stimulus.hotwired.dev/) 같은 라이브러리가 등장했습니다.

라라벨 생태계에서도 PHP만을 주로 활용하여 동적이고 현대적인 프론트엔드를 만들기 위한 노력의 결과로 [Laravel Livewire](https://laravel-livewire.com)와 [Alpine.js](https://alpinejs.dev/)가 등장했습니다.

<a name="livewire"></a>
### Livewire

[Laravel Livewire](https://laravel-livewire.com)는 라라벨을 기반으로 한 프론트엔드를 Vue나 React처럼 역동적이고 현대적인 느낌으로 구현할 수 있도록 해주는 프레임워크입니다.

Livewire를 사용할 때는 "컴포넌트" 단위로 UI의 일부를 담당하는 클래스를 만들고, 이 컴포넌트가 프론트엔드에서 상호작용할 수 있도록 데이터를 전달하거나 메서드를 노출합니다. 예를 들어, 아래와 같이 간단한 "카운터" 컴포넌트를 만들 수 있습니다.

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

그리고, 카운터의 템플릿은 다음과 같이 작성할 수 있습니다.

```blade
<div>
    <button wire:click="increment">+</button>
    <h1>{{ $count }}</h1>
</div>
```

보시는 것처럼, Livewire를 이용하면 `wire:click`과 같이 새로운 HTML 속성을 써서 라라벨 애플리케이션의 프론트엔드와 백엔드를 손쉽게 연결할 수 있습니다. 또한 컴포넌트의 현재 상태를 간단한 Blade 표현식으로 렌더링할 수 있습니다.

많은 개발자들은 Livewire 덕분에 라라벨 안에서만 머물면서도 현대적인, 동적인 웹 애플리케이션을 개발할 수 있게 되었다고 평가합니다. 일반적으로 Livewire를 사용하는 개발자들은 [Alpine.js](https://alpinejs.dev/)도 함께 활용하여, 예를 들어 대화상자 렌더링 등 꼭 필요한 부분에만 가벼운 JavaScript 기능을 더합니다.

라라벨을 처음 접하셨다면 먼저 [뷰](/docs/9.x/views)와 [Blade](/docs/9.x/blade)의 기본 사용법을 익혀보시길 추천합니다. 그리고 공식 [Laravel Livewire 문서](https://laravel-livewire.com/docs)를 참고해 인터랙티브한 Livewire 컴포넌트로 애플리케이션의 완성도를 한 단계 높여보세요.

<a name="php-starter-kits"></a>
### 스타터 킷

PHP와 Livewire로 프론트엔드를 개발하고 싶다면, 라라벨에서 제공하는 Breeze 또는 Jetstream [스타터 킷](/docs/9.x/starter-kits)을 활용하여 개발을 빠르게 시작할 수 있습니다. 이 두 스타터 킷 모두 [Blade](/docs/9.x/blade)와 [Tailwind](https://tailwindcss.com)를 이용한 백엔드 및 프론트엔드 인증 흐름 기본 구조를 제공하므로, 큰 틀의 개발 골격을 바로 잡고 본격적으로 아이디어를 구현해나갈 수 있습니다.

<a name="using-vue-react"></a>
## Vue / React 사용하기

라라벨과 Livewire로도 충분히 현대적인 프론트엔드를 만들 수 있지만, 여전히 많은 개발자들이 Vue나 React 같은 자바스크립트 프레임워크의 강력함을 활용하길 선호합니다. 이러한 선택을 하면 NPM 생태계의 풍부한 자바스크립트 패키지와 도구를 자유롭게 사용할 수 있습니다.

하지만 별도의 추가 도구 없이 라라벨을 Vue나 React와 함께 사용하려 한다면, 클라이언트 사이드 라우팅, 데이터 하이드레이션, 인증 등 다양한 복잡한 문제를 직접 해결해야 합니다. Vue/React 전용 프레임워크인 [Nuxt](https://nuxt.com/), [Next](https://nextjs.org/) 등을 사용하면 클라이언트 사이드 라우팅이 다소 쉬워지지만, 데이터 하이드레이션과 인증 문제는 여전히 복잡한 난제로 남습니다.

또한, 프론트엔드와 백엔드를 별도의 코드 저장소(레포지토리)로 관리해야 하는 경우가 많아 개발과 유지보수, 배포 과정에서도 여러 가지 추가적인 신경을 써야 합니다. 물론 이런 문제들이 극복 불가능한 것은 아니지만, 결코 생산적이거나 즐거운 개발 방식은 아니라고 생각합니다.

<a name="inertia"></a>
### Inertia

다행히도 라라벨은 두 가지 방식의 장점을 모두 누릴 수 있는 해법을 제공합니다. [Inertia](https://inertiajs.com)는 라라벨 애플리케이션과 Vue/React 프론트엔드 사이의 간극을 연결해주는 브릿지 역할을 합니다. 즉, 라라벨 라우트와 컨트롤러를 이용해 프론트엔드를 빌드하면서, 현대적인 Vue/React로 구성된 완성도 높은 프론트엔드 UI를 하나의 코드 저장소에서 함께 관리할 수 있게 해줍니다. 이렇게 하면 라라벨과 Vue/React 각각의 장점을 모두 활용할 수 있으며, 어느 한쪽의 능력도 희생하지 않아도 됩니다.

라라벨 애플리케이션에 Inertia를 설치한 후, 기존과 마찬가지로 라우트와 컨트롤러를 작성하되, 컨트롤러에서는 Blade 템플릿 대신 Inertia 페이지를 반환하게 됩니다.

```php
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Show the profile for a given user.
     *
     * @param  int  $id
     * @return \Inertia\Response
     */
    public function show($id)
    {
        return Inertia::render('Users/Profile', [
            'user' => User::findOrFail($id)
        ]);
    }
}
```

Inertia에서의 "페이지"는 Vue 혹은 React 컴포넌트와 1:1로 대응하며, 일반적으로 애플리케이션의 `resources/js/Pages` 디렉터리에 위치합니다. 그리고 `Inertia::render` 메서드를 통해 전달하는 데이터는, 해당 페이지 컴포넌트의 "props"로 하이드레이션되어 사용할 수 있습니다.

```vue
<script setup>
import Layout from '@/Layouts/Authenticated.vue';
import { Head } from '@inertiajs/inertia-vue3';

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

보시는 것처럼, Inertia를 사용하면 프론트엔드 개발 시 Vue나 React의 모든 기능을 자유롭게 활용하면서도, 라라벨 기반 백엔드와 자바스크립트 프론트엔드를 가볍게 연결할 수 있습니다.

#### 서버 사이드 렌더링

만약 애플리케이션에 서버 사이드 렌더링(SSR)이 꼭 필요해서 Inertia 도입을 망설이고 있다면 걱정하지 않으셔도 됩니다. Inertia는 [서버 사이드 렌더링 기능](https://inertiajs.com/server-side-rendering)도 지원하고 있습니다. 그리고 [Laravel Forge](https://forge.laravel.com)를 통해 애플리케이션을 배포할 경우, Inertia의 서버 사이드 렌더링 프로세스도 간편하게 항상 실행되도록 관리할 수 있습니다.

<a name="inertia-starter-kits"></a>
### 스타터 킷

Inertia와 Vue / React로 프론트엔드를 개발하고 싶다면, Breeze 또는 Jetstream [스타터 킷](/docs/9.x/starter-kits#breeze-and-inertia)을 사용해 개발을 빠르게 시작할 수 있습니다. 이 스타터 킷들은 모두 Inertia, Vue / React, [Tailwind](https://tailwindcss.com), 그리고 [Vite](https://vitejs.dev)를 이용해 백엔드 및 프론트엔드 인증 플로우의 기본 구조를 자동으로 만들어줍니다. 이제 여러분은 본격적으로 다음 멋진 아이디어를 구현하기만 하면 됩니다.

<a name="bundling-assets"></a>
## 에셋 번들링

Blade, Livewire, Vue, React, Inertia 등 어떤 조합으로 프론트엔드를 개발하든, 실제 서비스에 배포하려면 CSS 등 애플리케이션의 에셋을 번들링해서 최적화해야 할 필요가 있습니다. 또한, Vue나 React로 프론트엔드를 구축할 경우 컴포넌트 코드도 브라우저에서 바로 동작할 수 있도록 자바스크립트 에셋으로 번들링해야 합니다.

라라벨은 기본적으로 [Vite](https://vitejs.dev)를 사용하여 에셋을 번들링합니다. Vite는 매우 빠른 빌드 속도와, 개발 중 즉각적인 Hot Module Replacement(HMR) 기능을 제공합니다. 새로 생성된 모든 라라벨 애플리케이션(스타터 킷을 사용한 경우 포함)에는 `vite.config.js` 파일이 함께 제공되며, Vite를 라라벨과 더 쉽게 연동할 수 있는 공식 플러그인 설정이 이미 적용되어 있습니다.

라라벨과 Vite 조합으로 개발을 시작하는 가장 빠른 방법은 [Laravel Breeze](/docs/9.x/starter-kits#laravel-breeze) 스타터 킷을 사용하는 것입니다. Breeze는 프론트엔드와 백엔드 인증 구조를 모두 미리 만들어주기 때문에 빠르고 손쉽게 개발을 진행할 수 있습니다.

> [!NOTE]
> 라라벨에서 Vite를 더욱 상세하게 활용하는 방법은 [에셋 번들링과 컴파일에 관한 전용 문서](/docs/9.x/vite)를 참고하시기 바랍니다.
