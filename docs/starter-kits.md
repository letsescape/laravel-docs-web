# 스타터 키트 (Starter Kits)

- [소개](#introduction)
- [스타터 키트로 애플리케이션 생성하기](#creating-an-application)
- [사용 가능한 스타터 키트](#available-starter-kits)
    - [React](#react)
    - [Vue](#vue)
    - [Livewire](#livewire)
- [스타터 키트 커스터마이징](#starter-kit-customization)
    - [React](#react-customization)
    - [Vue](#vue-customization)
    - [Livewire](#livewire-customization)
- [WorkOS AuthKit 인증](#workos)
- [Inertia SSR](#inertia-ssr)
- [커뮤니티 유지 스타터 키트](#community-maintained-starter-kits)
- [자주 묻는 질문](#faqs)

<a name="introduction"></a>
## 소개

새로운 라라벨 애플리케이션을 신속하게 시작할 수 있도록, 저희가 [애플리케이션 스타터 키트](https://laravel.com/starter-kits)를 제공합니다. 이 스타터 키트들은 라라벨 애플리케이션 구축을 빠르게 시작할 수 있게 해주며, 사용자 등록과 인증에 필요한 라우트, 컨트롤러, 뷰가 미리 포함되어 있습니다.

이 스타터 키트는 선택적으로 사용할 수 있으며, 필수는 아닙니다. 원한다면 라라벨을 새로 설치하여 직접 처음부터 애플리케이션을 만들어도 됩니다. 어떤 방법을 사용하더라도, 멋진 애플리케이션을 만들 수 있을 것입니다!

<a name="creating-an-application"></a>
## 스타터 키트로 애플리케이션 생성하기

라라벨의 스타터 키트를 이용해 새 애플리케이션을 만들려면 먼저 [PHP와 라라벨 CLI 도구를 설치](/docs/installation#installing-php)해야 합니다. 이미 PHP와 Composer가 설치되어 있다면, Composer를 통해 라라벨 설치 도구(Installer) CLI를 아래와 같이 설치할 수 있습니다.

```shell
composer global require laravel/installer
```

그 다음, 라라벨 설치 도구를 사용해 새 라라벨 애플리케이션을 생성합니다. 설치 도구는 선호하는 스타터 키트를 선택하라는 프롬프트를 제공합니다.

```shell
laravel new my-app
```

애플리케이션이 생성되면, 프런트엔드 의존성을 NPM으로 설치하고 라라벨 개발 서버를 시작하면 됩니다.

```shell
cd my-app
npm install && npm run build
composer run dev
```

이제 라라벨 개발 서버가 실행되면, 웹 브라우저에서 [http://localhost:8000](http://localhost:8000)으로 접근할 수 있습니다.

<a name="available-starter-kits"></a>
## 사용 가능한 스타터 키트

<a name="react"></a>
### React

React 스타터 키트는 [Inertia](https://inertiajs.com)를 사용하여 React 프런트엔드와 함께 라라벨 애플리케이션을 구축할 수 있는 견고하고 현대적인 출발점을 제공합니다.

Inertia를 이용하면, 서버사이드 라우팅과 컨트롤러를 사용하는 동시에 현대적인 단일 페이지(React) 애플리케이션을 만들 수 있습니다. 즉, React의 강력한 프런트엔드와 라라벨의 생산성, 그리고 빠른 Vite 빌드 환경을 함께 누릴 수 있습니다.

React 스타터 키트는 React 19, TypeScript, Tailwind, 그리고 [shadcn/ui](https://ui.shadcn.com) 컴포넌트 라이브러리를 사용합니다.

<a name="vue"></a>
### Vue

Vue 스타터 키트는 [Inertia](https://inertiajs.com)를 사용하여 Vue 프런트엔드와 함께 라라벨 애플리케이션을 구축할 수 있는 뛰어난 출발점을 제공합니다.

Inertia를 통해, 서버사이드 라우팅과 컨트롤러를 그대로 살리면서도 현대적인 단일 페이지(Vue) 애플리케이션을 만들 수 있습니다. Vue의 프런트엔드 능력과 라라벨의 생산성, 그리고 Vite의 빠른 빌드 환경이 결합된 구성을 사용할 수 있습니다.

Vue 스타터 키트는 Vue Composition API, TypeScript, Tailwind, 그리고 [shadcn-vue](https://www.shadcn-vue.com/) 컴포넌트 라이브러리를 사용합니다.

<a name="livewire"></a>
### Livewire

Livewire 스타터 키트는 [Laravel Livewire](https://livewire.laravel.com) 프런트엔드와 함께 라라벨 애플리케이션을 구축할 수 있는 완벽한 출발점을 제공합니다.

Livewire는 PHP만으로 동적이고 반응성 있는 프런트엔드 UI를 만드는 강력한 방법입니다. 주로 Blade 템플릿을 사용하는 팀이나, React나 Vue같은 자바스크립트 기반 SPA를 복잡하게 도입하기 보다 더 간단한 방법을 원하는 분께 적합합니다.

Livewire 스타터 키트는 Livewire, Tailwind, 그리고 [Flux UI](https://fluxui.dev) 컴포넌트 라이브러리를 사용합니다.

<a name="starter-kit-customization"></a>
## 스타터 키트 커스터마이징

<a name="react-customization"></a>
### React

React 스타터 키트는 Inertia 2, React 19, Tailwind 4, [shadcn/ui](https://ui.shadcn.com)를 기반으로 만들어졌습니다. 모든 스타터 키트와 마찬가지로, 백엔드와 프런트엔드 코드가 모두 내 애플리케이션에 포함되어 있으므로, 원하는 대로 완전히 커스터마이징이 가능합니다.

프런트엔드의 주요 코드는 `resources/js` 디렉터리에 들어 있습니다. 코드의 외관이나 동작을 원하는 만큼 자유롭게 수정할 수 있습니다.

```text
resources/js/
├── components/    # 재사용 가능한 React 컴포넌트
├── hooks/         # React hooks
├── layouts/       # 애플리케이션 레이아웃
├── lib/           # 유틸리티 함수 및 설정
├── pages/         # 페이지 컴포넌트
└── types/         # TypeScript 정의
```

추가로 shadcn 컴포넌트를 사용하려면 먼저 [추가하고 싶은 컴포넌트를 찾은 뒤](https://ui.shadcn.com), 아래처럼 `npx`로 설치할 수 있습니다.

```shell
npx shadcn@latest add switch
```

이 명령어를 실행하면 Switch 컴포넌트가 `resources/js/components/ui/switch.tsx` 경로에 추가됩니다. 이후, 원하는 페이지에서 바로 사용할 수 있습니다.

```jsx
import { Switch } from "@/components/ui/switch"

const MyPage = () => {
  return (
    <div>
      <Switch />
    </div>
  );
};

export default MyPage;
```

<a name="react-available-layouts"></a>
#### 사용 가능한 레이아웃

React 스타터 키트에는 "사이드바(sidebar)" 레이아웃과 "헤더(header)" 레이아웃의 두 가지 주요 레이아웃이 제공됩니다. 기본값은 사이드바 레이아웃이며, 헤더 레이아웃으로 변경하려면 애플리케이션의 `resources/js/layouts/app-layout.tsx` 파일 상단에서 import하는 레이아웃을 바꿔주면 됩니다.

```js
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout'; // [tl! remove]
import AppLayoutTemplate from '@/layouts/app/app-header-layout'; // [tl! add]
```

<a name="react-sidebar-variants"></a>
#### 사이드바 변형(variants)

사이드바 레이아웃은 기본 사이드바, "inset", "floating"의 세 가지 변형이 지원됩니다. 원하는 변형을 쓰고 싶다면 `resources/js/components/app-sidebar.tsx` 컴포넌트에서 아래처럼 수정할 수 있습니다.

```text
<Sidebar collapsible="icon" variant="sidebar"> [tl! remove]
<Sidebar collapsible="icon" variant="inset"> [tl! add]
```

<a name="react-authentication-page-layout-variants"></a>
#### 인증 페이지 레이아웃 변형

React 스타터 키트에 포함된 로그인, 회원가입 등 인증 페이지도 "simple", "card", "split"의 세 가지 레이아웃 변형을 사용할 수 있습니다.

내 인증 페이지의 레이아웃을 변경하려면, 애플리케이션의 `resources/js/layouts/auth-layout.tsx` 파일 최상단 import 구문을 수정하세요.

```js
import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout'; // [tl! remove]
import AuthLayoutTemplate from '@/layouts/auth/auth-split-layout'; // [tl! add]
```

<a name="vue-customization"></a>
### Vue

Vue 스타터 키트는 Inertia 2, Vue 3 Composition API, Tailwind, [shadcn-vue](https://www.shadcn-vue.com/) 기반으로 만들어졌습니다. 모든 스타터 키트와 동일하게, 백엔드와 프런트엔드 코드가 모두 내 애플리케이션에 들어 있어 완전히 커스터마이징할 수 있습니다.

프런트엔드 주요 코드는 `resources/js` 폴더에 있습니다. 원하는 코드의 외관, 동작을 자유롭게 고칠 수 있습니다.

```text
resources/js/
├── components/    # 재사용 가능한 Vue 컴포넌트
├── composables/   # Vue composable/hook
├── layouts/       # 애플리케이션 레이아웃
├── lib/           # 유틸리티 함수 및 설정
├── pages/         # 페이지 컴포넌트
└── types/         # TypeScript 정의
```

shadcn-vue 컴포넌트를 추가하려면, 먼저 [추가할 컴포넌트를 검색](https://www.shadcn-vue.com)한 후, 아래처럼 `npx`로 등록합니다.

```shell
npx shadcn-vue@latest add switch
```

이렇게 하면 Switch 컴포넌트가 `resources/js/components/ui/Switch.vue`에 추가됩니다. 이제 원하는 모든 페이지에서 사용 가능합니다.

```vue
<script setup lang="ts">
import { Switch } from '@/Components/ui/switch'
</script>

<template>
    <div>
        <Switch />
    </div>
</template>
```

<a name="vue-available-layouts"></a>
#### 사용 가능한 레이아웃

Vue 스타터 키트에도 "사이드바" 레이아웃과 "헤더" 레이아웃, 두 가지 주요 레이아웃이 제공됩니다. 기본값은 사이드바 레이아웃이며, 헤더 레이아웃으로 바꾸고 싶다면 `resources/js/layouts/AppLayout.vue` 파일에서 import 구문을 수정하세요.

```js
import AppLayout from '@/layouts/app/AppSidebarLayout.vue'; // [tl! remove]
import AppLayout from '@/layouts/app/AppHeaderLayout.vue'; // [tl! add]
```

<a name="vue-sidebar-variants"></a>
#### 사이드바 변형(variants)

사이드바 레이아웃에서는 기본 사이드바, "inset", "floating" 등 세 가지 변형을 사용할 수 있습니다. 원하는 변형을 쓰려면 `resources/js/components/AppSidebar.vue` 컴포넌트에서 아래와 같이 수정하세요.

```text
<Sidebar collapsible="icon" variant="sidebar"> [tl! remove]
<Sidebar collapsible="icon" variant="inset"> [tl! add]
```

<a name="vue-authentication-page-layout-variants"></a>
#### 인증 페이지 레이아웃 변형

Vue 스타터 키트의 로그인, 회원가입 등 인증 페이지 또한 "simple", "card", "split" 세 가지 레이아웃 중에서 선택해 사용할 수 있습니다.

변경하고 싶다면 애플리케이션의 `resources/js/layouts/AuthLayout.vue` 파일의 import 구문을 아래와 같이 바꿔주면 됩니다.

```js
import AuthLayout from '@/layouts/auth/AuthSimpleLayout.vue'; // [tl! remove]
import AuthLayout from '@/layouts/auth/AuthSplitLayout.vue'; // [tl! add]
```

<a name="livewire-customization"></a>
### Livewire

Livewire 스타터 키트는 Livewire 3, Tailwind, [Flux UI](https://fluxui.dev/)를 기반으로 구축되어 있습니다. 모든 스타터 키트와 같이, 백엔드-프런트엔드 코드가 모두 애플리케이션에 포함되어 있어 언제든 원하는 대로 직접 수정할 수 있습니다.

#### Livewire와 Volt

프런트엔드의 주요 코드는 `resources/views` 폴더에 있습니다. 애플리케이션의 외형과 동작을 원하는 대로 자유롭게 고칠 수 있습니다.

```text
resources/views
├── components            # 재사용 가능한 Livewire 컴포넌트
├── flux                  # 커스텀된 Flux 컴포넌트
├── livewire              # Livewire 페이지들
├── partials              # 재사용 가능한 Blade partial
├── dashboard.blade.php   # 인증된 사용자 대시보드
├── welcome.blade.php     # 게스트 사용자를 위한 환영 페이지
```

#### 전통적인 Livewire 컴포넌트

프런트엔드 코드는 `resouces/views` 폴더에 위치하며, Livewire 컴포넌트에 대응하는 백엔드 로직은 `app/Livewire` 폴더에 존재합니다.

<a name="livewire-available-layouts"></a>
#### 사용 가능한 레이아웃

Livewire 스타터 키트에도 "사이드바" 레이아웃과 "헤더" 레이아웃, 두 가지 주요 레이아웃이 들어 있습니다. 기본값은 사이드바이며, 헤더 레이아웃으로 전환하고 싶으면 애플리케이션의 `resources/views/components/layouts/app.blade.php` 파일에서 사용되는 레이아웃을 변경하면 됩니다. 추가로, 주요 Flux 컴포넌트에 `container` 속성을 넣어줘야 합니다.

```blade
<x-layouts.app.header>
    <flux:main container>
        {{ $slot }}
    </flux:main>
</x-layouts.app.header>
```

<a name="livewire-authentication-page-layout-variants"></a>
#### 인증 페이지 레이아웃 변형

Livewire 스타터 키트에도 로그인‧회원가입 등 인증 페이지에서 "simple", "card", "split" 세 가지 레이아웃 변형을 지원합니다.

디자인을 바꾸고 싶으면 `resources/views/components/layouts/auth.blade.php` 파일에서 아래처럼 레이아웃을 수정할 수 있습니다.

```blade
<x-layouts.auth.split>
    {{ $slot }}
</x-layouts.auth.split>
```

<a name="workos"></a>
## WorkOS AuthKit 인증

React, Vue, Livewire 스타터 키트는 라라벨의 기본 인증 시스템을 사용하여 로그인, 회원가입, 비밀번호 재설정, 이메일 인증 등 모든 기능을 제공합니다. 추가로, 각 스타터 키트에는 [WorkOS AuthKit](https://authkit.com)이 적용된 변형도 제공하는데, 이 버전은 다음과 같은 기능을 지원합니다.

<div class="content-list" markdown="1">

- 소셜 인증(Google, Microsoft, GitHub, Apple)
- 패스키 인증
- 이메일 기반 "매직 로그인(Magic Auth)"
- SSO

</div>

WorkOS를 인증 공급자로 사용하려면 [WorkOS 계정이 필요합니다](https://workos.com). WorkOS는 월 100만 명의 활성 사용자까지 무료로 인증 서비스를 제공합니다.

WorkOS AuthKit을 인증 공급자로 쓰고 싶으면, `laravel new`로 새 스타터 키트 기반 애플리케이션을 생성할 때 WorkOS 옵션을 선택하면 됩니다.

### WorkOS 스타터 키트 설정

WorkOS 기반 스타터 키트로 애플리케이션을 생성한 후에는, `.env` 파일에 `WORKOS_CLIENT_ID`, `WORKOS_API_KEY`, `WORKOS_REDIRECT_URL` 환경 변수들을 설정해야 합니다. 이 값들은 WorkOS 대시보드에서 해당 애플리케이션을 만들 때 제공되는 값과 일치해야 합니다.

```ini
WORKOS_CLIENT_ID=your-client-id
WORKOS_API_KEY=your-api-key
WORKOS_REDIRECT_URL="${APP_URL}/authenticate"
```

또한, WorkOS 대시보드에서 애플리케이션의 홈페이지 URL을 설정하세요. 이 URL로 사용자가 로그아웃 후 리디렉션됩니다.

<a name="configuring-authkit-authentication-methods"></a>
#### AuthKit 인증 방식 설정

WorkOS 기반 스타터 키트를 사용할 때는, 애플리케이션의 WorkOS AuthKit 설정에서 "이메일 + 비밀번호" 방식 인증을 비활성화하는 것을 권장합니다. 이로써 사용자는 소셜 인증, 패스키, 매직 로그인, SSO 중 한 가지 방법으로만 인증할 수 있습니다. 이 방법을 채택하면 애플리케이션이 비밀번호 처리를 직접 하지 않아도 됩니다.

<a name="configuring-authkit-session-timeouts"></a>
#### AuthKit 세션 타임아웃 설정

추가로, WorkOS AuthKit 세션 비활성화 타임아웃을 라라벨 애플리케이션의 세션 타임아웃(일반적으로 2시간)과 맞추는 것을 권장합니다.

<a name="inertia-ssr"></a>
### Inertia SSR

React와 Vue 스타터 키트는 Inertia의 [서버 사이드 렌더링(SSR)](https://inertiajs.com/server-side-rendering) 기능과 호환됩니다. SSR 번들을 빌드하려면 아래 명령어를 실행합니다.

```shell
npm run build:ssr
```

또한, `composer dev:ssr` 명령어도 사용할 수 있습니다. 이 명령어는 SSR용 번들 빌드 후, 라라벨 개발 서버와 Inertia SSR 서버를 자동으로 시작해, 로컬 환경에서 SSR을 바로 테스트할 수 있게 해줍니다.

```shell
composer dev:ssr
```

<a name="community-maintained-starter-kits"></a>
### 커뮤니티 유지 스타터 키트

라라벨 설치 도구를 통해 새 애플리케이션을 만들 때, Packagist에서 제공되는 커뮤니티 유지 스타터 키트를 `--using` 플래그로 지정할 수 있습니다.

```shell
laravel new my-app --using=example/starter-kit
```

<a name="creating-starter-kits"></a>
#### 스타터 키트 제작

내가 만든 스타터 키트를 다른 사람들도 쓸 수 있게 하려면, [Packagist](https://packagist.org)에 배포해야 합니다. 스타터 키트에는 필요한 환경 변수들을 `.env.example` 파일로 정의하고, 추가 설치 명령이 있으면 `composer.json`의 `post-create-project-cmd` 배열에 명시해두어야 합니다.

<a name="faqs"></a>
### 자주 묻는 질문

<a name="faq-upgrade"></a>
#### 업그레이드는 어떻게 하나요?

모든 스타터 키트는 프로젝트를 시작할 때 튼튼한 출발점을 제공합니다. 코드를 온전히 소유하기 때문에, 원할 때 얼마든지 수정하고, 원하는 대로 맞춤화하고, 직접 개발을 이어나갈 수 있습니다. 굳이 스타터 키트 자체를 별도로 업데이트할 필요는 없습니다.

<a name="faq-enable-email-verification"></a>
#### 이메일 인증은 어떻게 활성화하나요?

이메일 인증 기능을 추가하려면, `App/Models/User.php` 모델에서 `MustVerifyEmail` import 구문의 주석을 해제하고, 해당 모델이 `MustVerifyEmail` 인터페이스를 구현하도록 합니다.

```php
<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
// ...

class User extends Authenticatable implements MustVerifyEmail
{
    // ...
}
```

회원가입 후 사용자는 인증 메일을 받게 됩니다. 사용자의 이메일 인증이 완료될 때까지 특정 경로에 접근을 제한하려면, 해당 라우트에 `verified` 미들웨어를 추가합니다.

```php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});
```

> [!NOTE]
> [WorkOS](#workos) 기반 스타터 키트에서는 이메일 인증이 필수가 아닙니다.

<a name="faq-modify-email-template"></a>
#### 기본 이메일 템플릿은 어떻게 수정하나요?

기본 이메일 템플릿을 내 애플리케이션에 맞는 스타일로 커스터마이즈할 수 있습니다. 다음 명령어로 이메일 뷰 파일을 퍼블리시하세요.

```
php artisan vendor:publish --tag=laravel-mail
```

이 명령을 실행하면 `resources/views/vendor/mail` 폴더에 여러 파일이 생성됩니다. 이 파일들과, 기본 이메일 템플릿의 외관을 바꾸려면 `resources/views/vendor/mail/themes/default.css` 파일을 자유롭게 수정하면 됩니다.
