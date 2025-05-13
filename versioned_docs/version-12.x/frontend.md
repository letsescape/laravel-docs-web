# 프론트엔드 (Frontend)

- [소개](#introduction)
- [PHP 사용하기](#using-php)
    - [PHP와 Blade](#php-and-blade)
    - [Livewire](#livewire)
    - [스타터 키트](#php-starter-kits)
- [React 또는 Vue 사용하기](#using-react-or-vue)
    - [Inertia](#inertia)
    - [스타터 키트](#inertia-starter-kits)
- [에셋 번들링](#bundling-assets)

<a name="introduction"></a>
## 소개

라라벨은 [라우팅](/docs/routing), [유효성 검증](/docs/validation), [캐싱](/docs/cache), [큐](/docs/queues), [파일 저장소](/docs/filesystem) 등, 현대적인 웹 애플리케이션을 만들 때 필요한 모든 기능을 제공하는 백엔드 프레임워크입니다. 그러나 라라벨은 개발자에게 강력한 프론트엔드 개발 방식까지 포함한 아름다운 풀스택(full-stack) 경험을 제공하는 것도 중요하다고 생각합니다.

라라벨로 애플리케이션을 개발할 때 프론트엔드를 구현하는 주요 방법은 두 가지가 있습니다. 프론트엔드 구현 방식을 선택할 때는 PHP를 그대로 활용할지, 아니면 Vue나 React와 같은 자바스크립트 프레임워크를 사용할지에 따라 결정됩니다. 아래에서 두 가지 방법을 모두 소개하니, 여러분의 애플리케이션에 가장 적합한 프론트엔드 개발 방식을 선택하는 데 도움이 될 것입니다.

<a name="using-php"></a>
## PHP 사용하기

<a name="php-and-blade"></a>
### PHP와 Blade

과거 대부분의 PHP 애플리케이션은 데이터베이스에서 데이터를 읽어온 뒤 이를 PHP `echo` 구문을 섞어가며 단순한 HTML 템플릿에 출력하는 방식으로 브라우저에 HTML을 렌더링했습니다.

```blade
<div>
    <?php foreach ($users as $user): ?>
        Hello, <?php echo $user->name; ?> <br />
    <?php endforeach; ?>
</div>
```

라라벨에서는 [뷰](/docs/views)와 [Blade](/docs/blade)를 통해 이러한 HTML 렌더링 방식을 그대로 사용할 수 있습니다. Blade는 데이터를 출력하고 반복문을 쓰는 등 다양한 작업을 간단한 문법으로 처리할 수 있는, 매우 가벼운 템플릿 엔진입니다.

```blade
<div>
    @foreach ($users as $user)
        Hello, {{ $user->name }} <br />
    @endforeach
</div>
```

이런 방식으로 애플리케이션을 개발할 때, 폼 데이터 전송이나 기타 페이지 상의 사용자 인터랙션이 발생하면 서버에서 다시 새로운 HTML 문서를 받아와 브라우저 전체를 새로 렌더링하게 됩니다. 오늘날에도 많은 애플리케이션이 단순한 Blade 템플릿을 이용하는 이 방식을 사용하는 것이 충분히 적합할 수 있습니다.

<a name="growing-expectations"></a>
#### 높아지는 기대치

하지만 웹 애플리케이션에 대한 사용자의 기대가 점점 높아지면서, 더 역동적이고 세련된 프론트엔드 인터랙션을 구현해야 할 필요성이 커졌습니다. 이런 변화에 맞춰 일부 개발자들은 Vue와 React와 같은 자바스크립트 프레임워크를 적용해 프론트엔드를 만들기 시작했습니다.

또 다른 개발자들은 자신이 익숙한 백엔드 언어(PHP)에 집중하면서도, 현대적 웹 UI를 만들기 위해 새로운 해법을 고안해 왔습니다. 예를 들어 [Rails](https://rubyonrails.org/) 생태계에서는 [Turbo](https://turbo.hotwired.dev/), [Hotwire](https://hotwired.dev/) 및 [Stimulus](https://stimulus.hotwired.dev/)와 같은 라이브러리가 등장했습니다.

라라벨 생태계에서도 주로 PHP를 활용하여 현대적이고 동적인 프론트엔드를 만들기 위한 필요성에서 [Laravel Livewire](https://livewire.laravel.com)와 [Alpine.js](https://alpinejs.dev/) 같은 도구들이 탄생했습니다.

<a name="livewire"></a>
### Livewire

[Laravel Livewire](https://livewire.laravel.com)는 라라벨 기반의 프론트엔드를 Vue 및 React 같은 최신 자바스크립트 프레임워크로 만든 것만큼이나 동적이고 생동감 있게 구현할 수 있게 해주는 프레임워크입니다.

Livewire를 사용할 때는 UI의 일부분을 구성하는 Livewire "컴포넌트"를 만들고, 여기에 메서드와 데이터를 정의해 이를 프론트엔드에서 호출하거나 상호작용할 수 있도록 합니다. 예를 들어, 간단한 "카운터" 컴포넌트는 아래와 같이 작성할 수 있습니다.

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

그리고 카운터에 대응하는 템플릿은 아래처럼 작성합니다.

```blade
<div>
    <button wire:click="increment">+</button>
    <h1>{{ $count }}</h1>
</div>
```

이처럼 Livewire는 `wire:click`과 같은 새로운 HTML 속성을 통해 라라벨의 프론트엔드와 백엔드를 연결할 수 있도록 해줍니다. 또한, 컴포넌트의 현재 상태를 Blade의 간단한 표현식을 통해 바로 렌더링할 수 있습니다.

많은 개발자들에게 Livewire는 프론트엔드 개발 방식에 큰 변화를 가져왔습니다. 복잡한 자바스크립트 없이도 라라벨의 익숙한 환경에서 현대적이고 동적인 웹 애플리케이션을 개발할 수 있게 되었기 때문입니다. 보통 Livewire를 활용하는 개발자는 [Alpine.js](https://alpinejs.dev/)도 함께 사용하여, 필요한 부분에만 자바스크립트를 "약간씩" 더해 예를 들어 다이얼로그 창을 띄우는 등 세밀한 인터랙션을 구현합니다.

라라벨을 처음 접하는 분이라면 먼저 [뷰](/docs/views)와 [Blade](/docs/blade)의 기본 사용법을 익혀보시는 것을 추천합니다. 그런 다음, 공식 [Laravel Livewire 문서](https://livewire.laravel.com/docs)를 참고하여 더욱 상호작용적인 Livewire 컴포넌트 개발 방법을 익혀보시기 바랍니다.

<a name="php-starter-kits"></a>
### 스타터 키트

PHP와 Livewire를 사용해 프론트엔드를 개발하고 싶다면, 라라벨에서 제공하는 [Livewire 스타터 키트](/docs/starter-kits)를 활용하여 애플리케이션 개발을 빠르게 시작할 수 있습니다.

<a name="using-react-or-vue"></a>
## React 또는 Vue 사용하기

Laravel과 Livewire를 사용해 현대적인 프론트엔드를 개발할 수도 있지만, 여전히 많은 개발자들은 React나 Vue와 같은 자바스크립트 프레임워크의 강력함을 활용하길 원합니다. 이렇게 하면 NPM을 통해 제공되는 다양한 자바스크립트 패키지들과 툴의 생태계를 그대로 활용할 수 있습니다.

하지만 추가적인 도구 없이 라라벨과 React 또는 Vue를 직접 연동하려면, 클라이언트 사이드 라우팅, 데이터 하이드레이션(hydration), 인증 등 복잡한 문제들을 직접 해결해야 합니다. 클라이언트 사이드 라우팅의 경우 [Next](https://nextjs.org/)나 [Nuxt](https://nuxt.com/) 등 방향성 있는 React / Vue 프레임워크를 사용하면 보다 간단해질 수 있지만, 데이터 하이드레이션과 인증 문제는 라라벨 같은 백엔드 프레임워크와 프론트엔드 프레임워크를 함께 쓸 때 여전히 골치 아픈 부분으로 남습니다.

또한 이렇게 두 개의 별도 코드 저장소(레포지토리)를 각각 관리해야 하고, 유지보수, 릴리스, 배포 작업까지 양쪽에서 따로 조율해야 하는 불편함이 있습니다. 이런 문제들이 절대 극복할 수 없는 것은 아니지만, 생산적이거나 즐거운 개발 경험이라고 보기는 어렵다고 생각합니다.

<a name="inertia"></a>
### Inertia

다행히도 라라벨에서는 양쪽의 장점을 모두 누릴 수 있습니다. [Inertia](https://inertiajs.com)는 라라벨 애플리케이션과 현대적인 React 또는 Vue 프론트엔드를 매끄럽게 연결해주는 도구로, 라라벨의 라우트와 컨트롤러를 활용하면서도 클라이언트 측에서는 React 또는 Vue를 사용해 완성도 높은 프론트엔드를 구현할 수 있습니다. 이 모든 작업을 하나의 코드 저장소에서 관리할 수 있습니다. 이 방식으로 라라벨과 React / Vue 각각의 장점을 모두 누릴 수 있으며, 어느 한쪽의 기능이 제한되는 일도 없습니다.

Inertia를 라라벨 애플리케이션에 설치하면, 기존처럼 라우트와 컨트롤러를 작성하면 됩니다. 다만 컨트롤러에서 Blade 템플릿 대신 Inertia 페이지를 반환한다는 점만 다릅니다.

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

Inertia 페이지는 React 또는 Vue 컴포넌트와 1:1로 대응되며, 보통 애플리케이션의 `resources/js/pages` 디렉터리에 저장됩니다. `Inertia::render` 메서드로 전달되는 데이터는 해당 페이지 컴포넌트의 "props"로 하이드레이션(hydration)됩니다.

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

이처럼 Inertia를 사용하면 라라벨 기반 백엔드와 자바스크립트 기반 프론트엔드를 가볍게 연결하면서, React나 Vue의 모든 기능을 프론트엔드에서 자유롭게 활용할 수 있습니다.

#### 서버 사이드 렌더링

애플리케이션에서 서버 사이드 렌더링이 꼭 필요한 경우라면, Inertia 사용을 주저하지 않으셔도 됩니다. Inertia는 [서버 사이드 렌더링 지원](https://inertiajs.com/server-side-rendering)을 제공합니다. 또한 [Laravel Cloud](https://cloud.laravel.com)나 [Laravel Forge](https://forge.laravel.com)를 통해 애플리케이션을 배포할 경우, Inertia의 서버 사이드 렌더링 프로세스가 항상 정상적으로 동작하도록 쉽게 설정할 수 있습니다.

<a name="inertia-starter-kits"></a>
### 스타터 키트

Inertia와 Vue / React를 사용해 프론트엔드를 만들고 싶다면 라라벨에서 제공하는 [React 또는 Vue 애플리케이션 스타터 키트](/docs/starter-kits)를 활용해 빠르게 개발을 시작할 수 있습니다. 이 스타터 키트는 라라벨 백엔드와 프론트엔드 인증 플로우를 모두 Inertia, Vue / React, [Tailwind](https://tailwindcss.com), [Vite](https://vitejs.dev)와 함께 기본 구성해줍니다. 이를 통해 여러분의 아이디어를 바로 실현하는 데 집중할 수 있습니다.

<a name="bundling-assets"></a>
## 에셋 번들링

Blade와 Livewire 기반으로 프론트엔드를 개발하든, Vue / React 및 Inertia 조합으로 개발하든, 실제 서비스 환경에 배포하기 위해서는 CSS 등의 에셋을 프로덕션 빌드 형태로 번들링해야 할 필요가 있습니다. 물론, Vue나 React로 프론트엔드를 만들 경우 컴포넌트 또한 브라우저에서 동작할 수 있는 자바스크립트 에셋으로 번들링해야 합니다.

라라벨은 기본적으로 [Vite](https://vitejs.dev)를 사용해 에셋을 번들링합니다. Vite는 매우 빠른 빌드 속도와, 로컬 개발 환경에서는 거의 즉각적인 Hot Module Replacement(HMR)를 제공합니다. 모든 신규 라라벨 애플리케이션(그리고 [스타터 키트](/docs/starter-kits)를 사용하는 프로젝트)에는 Vite의 라라벨 플러그인을 불러오는 `vite.config.js` 파일이 포함되어 있어, Vite를 라라벨과 함께 손쉽게 사용할 수 있습니다.

라라벨과 Vite로 가장 빠르게 애플리케이션 개발을 시작하는 방법은 [애플리케이션 스타터 키트](/docs/starter-kits)를 사용하는 것입니다. 이 스타터 키트는 프론트엔드와 백엔드 인증 플로우가 모두 포함된 기본 구조를 제공합니다.

> [!NOTE]
> 라라벨에서 Vite를 활용한 에셋 번들링과 컴파일에 대한 더 자세한 문서는 [에셋 번들링 및 컴파일 전용 문서](/docs/vite)에서 확인하실 수 있습니다.
