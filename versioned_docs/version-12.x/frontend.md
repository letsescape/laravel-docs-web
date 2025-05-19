# 프론트엔드 (Frontend)

- [소개](#introduction)
- [PHP 활용하기](#using-php)
    - [PHP와 Blade](#php-and-blade)
    - [Livewire](#livewire)
    - [스타터 킷](#php-starter-kits)
- [React 또는 Vue 활용하기](#using-react-or-vue)
    - [Inertia](#inertia)
    - [스타터 킷](#inertia-starter-kits)
- [에셋 번들링](#bundling-assets)

<a name="introduction"></a>
## 소개

라라벨은 [라우팅](/docs/12.x/routing), [유효성 검증](/docs/12.x/validation), [캐시](/docs/12.x/cache), [큐](/docs/12.x/queues), [파일 저장소](/docs/12.x/filesystem) 등 현대적인 웹 애플리케이션을 개발하는 데 필요한 모든 기능을 갖춘 백엔드 프레임워크입니다. 하지만 저희는 개발자에게 강력하면서도 아름다운 풀스택 경험을 제공하는 것이 중요하다고 믿으며, 애플리케이션의 프론트엔드를 구축할 수 있는 다양한 방법 역시 제공합니다.

라라벨로 애플리케이션을 개발할 때 프론트엔드를 구현하는 주요 방법은 두 가지가 있으며, PHP를 통해 프론트엔드를 구현할지, 아니면 Vue·React와 같은 자바스크립트 프레임워크를 사용할지에 따라 결정됩니다. 아래에서 이 두 가지 방법에 대해 모두 설명하니, 여러분이 애플리케이션에 가장 적합한 프론트엔드 개발 방식을 선택하는 데 도움이 되시길 바랍니다.

<a name="using-php"></a>
## PHP 활용하기

<a name="php-and-blade"></a>
### PHP와 Blade

과거에는 대부분의 PHP 애플리케이션이 HTML 템플릿 안에 PHP의 `echo` 문을 섞어 데이터베이스에서 가져온 데이터를 렌더링하는 방식으로 브라우저에 HTML을 출력했습니다.

```blade
<div>
    <?php foreach ($users as $user): ?>
        Hello, <?php echo $user->name; ?> <br />
    <?php endforeach; ?>
</div>
```

라라벨에서는 이런 HTML 렌더링 방식을 여전히 [뷰](/docs/12.x/views)와 [Blade](/docs/12.x/blade)를 사용해 구현할 수 있습니다. Blade는 데이터를 출력하거나 반복하는 등 다양한 작업을 쉽고 간결하게 할 수 있도록 해주는, 매우 가벼운 템플릿 언어입니다.

```blade
<div>
    @foreach ($users as $user)
        Hello, {{ $user->name }} <br />
    @endforeach
</div>
```

이처럼 애플리케이션을 구성할 경우, 일반적으로 폼 제출이나 페이지 상호작용이 발생하면 서버에서 완전히 새로운 HTML 문서를 받아 브라우저 전체가 다시 렌더링됩니다. 오늘날에도 수많은 애플리케이션이 이런 단순한 Blade 템플릿 기반 프론트엔드 구조로도 충분히 잘 동작합니다.

<a name="growing-expectations"></a>
#### 높아지는 기대치

하지만 웹 애플리케이션에 대한 사용자들의 기대치가 높아지면서, 점점 더 역동적이고 세련된 프론트엔드를 구축하려는 요구가 많아졌습니다. 이에 따라 일부 개발자는 Vue, React와 같은 자바스크립트 프레임워크를 활용해 프론트엔드 개발을 시작하는 선택을 하기도 했습니다.

반면, 익숙한 백엔드 언어를 그대로 사용하고 싶은 개발자들은 주로 백엔드 언어만을 사용하면서도 현대적인 웹 UI 구축이 가능한 솔루션 개발에 나섰습니다. 예를 들어, [Rails](https://rubyonrails.org/) 생태계에서는 [Turbo](https://turbo.hotwired.dev/), [Hotwire](https://hotwired.dev/), [Stimulus](https://stimulus.hotwired.dev/)와 같은 라이브러리가 등장하기도 했습니다.

라라벨 생태계에서는 PHP를 주로 사용하면서도 현대적이고 동적인 프론트엔드 개발이 가능하도록 [Laravel Livewire](https://livewire.laravel.com)와 [Alpine.js](https://alpinejs.dev/)가 탄생했습니다.

<a name="livewire"></a>
### Livewire

[Laravel Livewire](https://livewire.laravel.com)는 라라벨 기반의 프론트엔드를 최신 자바스크립트 프레임워크(예: Vue, React)로 만든 것처럼 동적이고 현대적이며 생동감 있게 만드는 프레임워크입니다.

Livewire를 사용할 때는, UI의 일부분을 렌더링하고 프론트엔드에서 호출·상호작용할 수 있는 메서드와 데이터를 노출하는 Livewire "컴포넌트"를 생성하게 됩니다. 간단한 "카운터" 컴포넌트 예시는 다음과 같습니다.

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

그리고 해당 카운터 컴포넌트의 템플릿은 다음과 같이 작성합니다.

```blade
<div>
    <button wire:click="increment">+</button>
    <h1>{{ $count }}</h1>
</div>
```

보시는 것처럼, Livewire를 통해 `wire:click`과 같은 새로운 HTML 속성을 사용하여 라라벨 애플리케이션의 프론트엔드와 백엔드가 연결됩니다. 또한, 컴포넌트의 현재 상태를 간단한 Blade 문법으로 출력할 수 있습니다.

Livewire는 라라벨을 잘 아는 환경에서 바로 현대적이고 다이내믹한 웹 애플리케이션을 개발할 수 있게 해주면서 프론트엔드 개발 방식에 혁신을 가져왔습니다. 보통 Livewire를 사용하는 개발자들은 [Alpine.js](https://alpinejs.dev/)도 함께 활용하여, 모달 창 등 꼭 필요한 부분에만 자바스크립트를 추가하곤 합니다.

라라벨을 처음 접하신다면 [뷰](/docs/12.x/views)와 [Blade](/docs/12.x/blade)의 기본 사용법을 먼저 익히시기를 추천합니다. 이후 공식 [Laravel Livewire 문서](https://livewire.laravel.com/docs)를 참고하여 인터랙티브한 Livewire 컴포넌트로 애플리케이션의 수준을 한 단계 더 올릴 수 있습니다.

<a name="php-starter-kits"></a>
### 스타터 킷

PHP와 Livewire를 사용해 프론트엔드를 구축하고 싶다면, [Livewire 스타터 킷](/docs/12.x/starter-kits)을 활용하여 손쉽게 애플리케이션 개발을 시작할 수 있습니다.

<a name="using-react-or-vue"></a>
## React 또는 Vue 활용하기

라라벨과 Livewire로도 현대적인 프론트엔드를 만들 수 있지만, 여전히 많은 개발자들은 React나 Vue와 같은 자바스크립트 프레임워크의 강력함을 활용하고 싶어합니다. 이렇게 하면 NPM을 통해 제공되는 풍부한 자바스크립트 패키지와 툴 생태계를 적극적으로 이용할 수 있습니다.

하지만 별도의 도구 없이 라라벨과 React 또는 Vue를 같이 사용하려면 클라이언트 사이드 라우팅, 데이터 하이드레이션, 인증 등 해결해야 하는 여러 복잡한 과제들이 생깁니다. 클라이언트 사이드 라우팅은 [Next](https://nextjs.org/)나 [Nuxt](https://nuxt.com/)와 같은 프레임워크로 쉽게 할 수도 있지만, 데이터 하이드레이션과 인증은 라라벨과 이런 프론트엔드 프레임워크를 결합할 때 여전히 까다로운 문제로 남아있습니다.

더불어, 백엔드와 프론트엔드 각각의 코드 저장소를 따로 관리해야 하고, 유지보수·릴리스·배포 또한 각각 조율해야 하는 번거로움이 생깁니다. 물론 극복할 수 없는 문제는 아니지만, 개발자 입장에서 생산적이거나 즐거운 방식이라고 생각하지는 않습니다.

<a name="inertia"></a>
### Inertia

다행히도 라라벨에서는 두 가지 방식의 장점만을 취할 수 있는 방법을 제공합니다. [Inertia](https://inertiajs.com)는 라라벨 애플리케이션과 현대적인 React/Vue 프론트엔드 사이를 자연스럽게 연결해서, 단일한 코드 저장소 안에서 라라벨의 라우트·컨트롤러를 그대로 활용하면서도 React/Vue를 이용해 완전한 현대식 프론트엔드를 개발할 수 있게 해줍니다. 이 방식으로 라라벨의 장점과 React/Vue의 장점을 모두 누릴 수 있습니다.

Inertia를 프로젝트에 설치하면, 기존처럼 라우트와 컨트롤러를 작성하되 Blade 템플릿 대신 Inertia 페이지를 반환하게 됩니다.

```php
<?php

namespace App\Http\Controllers;

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
        return Inertia::render('users/show', [
            'user' => User::findOrFail($id)
        ]);
    }
}
```

여기서 Inertia 페이지는 보통 `resources/js/pages` 디렉터리에 위치한 React 또는 Vue 컴포넌트를 의미합니다. `Inertia::render` 메서드를 통해 전달한 데이터는 페이지 컴포넌트의 "props"로 하이드레이션됩니다.

```jsx
import Layout from '@/layouts/authenticated';
import { Head } from '@inertiajs/react';

export default function Show({ user }) {
    return (
        <Layout>
            <Head title="Welcome" />
            <h1>Welcome</h1>
            <p>Hello {user.name}, welcome to Inertia.</p>
        </Layout>
    )
}
```

이와 같이 Inertia를 이용하면 라라벨 기반 백엔드와 자바스크립트 기반 프론트엔드 사이에서 자연스럽게 연동하면서도, React와 Vue의 모든 기능을 마음껏 활용할 수 있습니다.

#### 서버 사이드 렌더링

애플리케이션에서 서버 사이드 렌더링이 꼭 필요해 Inertia 도입을 망설이고 있다면 걱정하지 않으셔도 됩니다. Inertia는 [서버 사이드 렌더링 지원](https://inertiajs.com/server-side-rendering)도 제공합니다. 그리고 [Laravel Cloud](https://cloud.laravel.com)나 [Laravel Forge](https://forge.laravel.com)를 통해 애플리케이션을 배포할 때도 Inertia의 SSR 프로세스를 간단히 항상 실행 상태로 둘 수 있습니다.

<a name="inertia-starter-kits"></a>
### 스타터 킷

Inertia와 Vue/React를 활용해 프론트엔드를 구축하고 싶다면, [React 또는 Vue 애플리케이션 스타터 킷](/docs/12.x/starter-kits)을 이용해 손쉽게 개발을 시작할 수 있습니다. 이러한 스타터 킷은 Inertia, Vue/React, [Tailwind](https://tailwindcss.com), [Vite](https://vitejs.dev)를 조합해 백엔드와 프론트엔드 인증 흐름까지 한 번에 구성해주므로, 여러분의 창의적인 프로젝트를 바로 시작하실 수 있습니다.

<a name="bundling-assets"></a>
## 에셋 번들링

Blade와 Livewire를 사용하든, Vue/React와 Inertia를 사용하든 관계없이, 여러분의 애플리케이션 CSS를 프로덕션용 에셋으로 번들링해야 할 것입니다. 또한 Vue 또는 React로 프론트엔드를 구성한다면, 각각의 컴포넌트도 브라우저에서 동작할 수 있도록 자바스크립트 에셋으로 번들링해야 합니다.

라라벨은 기본적으로 [Vite](https://vitejs.dev)를 사용해 에셋을 번들링합니다. Vite는 매우 빠른 빌드 속도와 로컬 개발 시 즉각적인 Hot Module Replacement(HMR)를 제공합니다. 모든 신규 라라벨 프로젝트(스타터 킷을 포함)에는 `vite.config.js` 파일이 포함되어 있는데, 이 파일을 통해 가볍게 구현된 라라벨 Vite 플러그인을 불러와 라라벨과 함께 Vite를 손쉽게 사용할 수 있습니다.

라라벨과 Vite로 가장 빠르게 시작하는 방법은 [애플리케이션 스타터 킷](/docs/12.x/starter-kits)으로 시작하는 것으로, 백엔드와 프론트엔드 인증 구조까지 자동으로 구성해줍니다.

> [!NOTE]
> 라라벨에서 Vite를 활용하는 방법에 대한 더 구체적인 안내는 [에셋 번들링 및 컴파일에 관한 별도의 문서](/docs/12.x/vite)를 참고해 주세요.
