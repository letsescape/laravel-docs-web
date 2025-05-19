# 스타터 킷 (Starter Kits)

- [소개](#introduction)
- [스타터 킷으로 애플리케이션 생성하기](#creating-an-application)
- [사용 가능한 스타터 킷](#available-starter-kits)
    - [React](#react)
    - [Vue](#vue)
    - [Livewire](#livewire)
- [스타터 킷 커스터마이징](#starter-kit-customization)
    - [React](#react-customization)
    - [Vue](#vue-customization)
    - [Livewire](#livewire-customization)
- [WorkOS AuthKit 인증](#workos)
- [Inertia SSR](#inertia-ssr)
- [커뮤니티 유지 스타터 킷](#community-maintained-starter-kits)
- [자주 묻는 질문](#faqs)

<a name="introduction"></a>
## 소개

여러분이 새로운 라라벨 애플리케이션을 더욱 빠르게 시작할 수 있도록, 라라벨에서는 [애플리케이션 스타터 킷](https://laravel.com/starter-kits)을 제공합니다. 이 스타터 킷은 라라벨 애플리케이션을 구축할 때 필요한 회원가입, 인증 등의 라우트, 컨트롤러, 뷰를 미리 포함하여 개발을 좀 더 빠르게 시작할 수 있도록 도와줍니다.

이 스타터 킷을 사용할 수도 있지만 반드시 선택해야 하는 것은 아닙니다. 원한다면 라라벨을 새로 설치해서, 완전히 자신만의 애플리케이션을 처음부터 만들어 나갈 수도 있습니다. 어떤 방식이든 여러분만의 멋진 무언가를 만들 수 있으리라 믿습니다!

<a name="creating-an-application"></a>
## 스타터 킷으로 애플리케이션 생성하기

라라벨 스타터 킷 중 하나를 사용해 새로운 라라벨 애플리케이션을 생성하려면, 먼저 [PHP와 라라벨 CLI 도구를 설치](/docs/12.x/installation#installing-php)해야 합니다. 이미 PHP와 Composer가 설치되어 있다면 Composer를 사용해 라라벨 CLI 인스톨러를 전역으로 설치할 수 있습니다.

```shell
composer global require laravel/installer
```

그 다음, 라라벨 인스톨러 CLI를 사용하여 새로운 라라벨 애플리케이션을 생성하세요. 설치 과정에서 어떤 스타터 킷을 사용할지 선택할 수 있습니다.

```shell
laravel new my-app
```

애플리케이션 생성이 완료되면, `npm`으로 프론트엔드 의존성을 설치하고 라라벨 개발 서버를 시작하기만 하면 됩니다.

```shell
cd my-app
npm install && npm run build
composer run dev
```

라라벨 개발 서버가 실행된 후, 애플리케이션은 웹 브라우저에서 [http://localhost:8000](http://localhost:8000) 주소로 접속할 수 있습니다.

<a name="available-starter-kits"></a>
## 사용 가능한 스타터 킷

<a name="react"></a>
### React

React 스타터 킷은 [Inertia](https://inertiajs.com)를 활용하여 React 프론트엔드를 가진 라라벨 애플리케이션을 강력하고 현대적으로 시작할 수 있게 도와줍니다.

Inertia를 사용하면 익숙한 서버 측 라우팅과 컨트롤러 구조를 그대로 활용하면서도, React의 최신 싱글 페이지 애플리케이션의 장점을 누릴 수 있습니다. 라라벨의 뛰어난 백엔드 생산성과 React의 강력한 프론트엔드 기능, 그리고 빠른 Vite 컴파일 환경을 함께 경험할 수 있습니다.

React 스타터 킷은 React 19, TypeScript, Tailwind, 그리고 [shadcn/ui](https://ui.shadcn.com) 컴포넌트 라이브러리를 사용합니다.

<a name="vue"></a>
### Vue

Vue 스타터 킷은 [Inertia](https://inertiajs.com)를 기반으로 Vue 프론트엔드를 가진 라라벨 애플리케이션을 손쉽게 시작할 수 있도록 제공합니다.

Inertia를 통해 서버 측 라우팅과 컨트롤러 구조는 그대로 두면서, Vue로 최신 싱글 페이지 애플리케이션을 개발할 수 있습니다. Vue의 프론트엔드 강점과 라라벨의 백엔드 생산성, 그리고 빠른 Vite 환경이 조합되어 탁월한 개발 경험을 제공합니다.

Vue 스타터 킷은 Vue Composition API, TypeScript, Tailwind, 그리고 [shadcn-vue](https://www.shadcn-vue.com/) 컴포넌트 라이브러리를 사용합니다.

<a name="livewire"></a>
### Livewire

Livewire 스타터 킷은 [Laravel Livewire](https://livewire.laravel.com) 프론트엔드를 활용한 라라벨 애플리케이션을 위한 최고의 시작점을 제공합니다.

Livewire는 복잡한 JavaScript 프레임워크 없이도 PHP만으로 동적이고 반응형 UI를 개발할 수 있게 해주는 강력한 도구입니다. 특히 팀이 Blade 템플릿을 주로 사용하며, React나 Vue 같은 JavaScript 기반 프레임워크보다 더 단순한 SPA 대안을 원하는 경우에 적합합니다.

Livewire 스타터 킷은 Livewire, Tailwind, 그리고 [Flux UI](https://fluxui.dev) 컴포넌트 라이브러리를 사용합니다.

<a name="starter-kit-customization"></a>
## 스타터 킷 커스터마이징

<a name="react-customization"></a>
### React

React 스타터 킷은 Inertia 2, React 19, Tailwind 4, 그리고 [shadcn/ui](https://ui.shadcn.com) 기반으로 제작되어 있습니다. 다른 모든 스타터 킷과 마찬가지로, 백엔드와 프론트엔드의 모든 코드가 여러분 애플리케이션 내부에 포함되어 있으므로 자유롭게 원하는 만큼 커스터마이징할 수 있습니다.

프론트엔드 코드는 대부분 `resources/js` 디렉터리에 위치하며, 자유롭게 수정하여 애플리케이션의 디자인이나 동작을 바꿀 수 있습니다.

```text
resources/js/
├── components/    # 재사용 가능한 React 컴포넌트
├── hooks/         # React 훅
├── layouts/       # 애플리케이션 레이아웃
├── lib/           # 유틸리티 함수 및 설정
├── pages/         # 개별 페이지 컴포넌트
└── types/         # TypeScript 타입 정의
```

추가적인 shadcn 컴포넌트를 사용하고 싶다면, 먼저 [원하는 컴포넌트를 찾은 뒤](https://ui.shadcn.com), 다음과 같이 `npx` 명령어로 컴포넌트를 배포하세요.

```shell
npx shadcn@latest add switch
```

이 예시에서는 Switch 컴포넌트가 `resources/js/components/ui/switch.tsx` 위치에 추가됩니다. 배포가 끝나면, 원하는 페이지 어디에서든 컴포넌트를 사용하면 됩니다.

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

React 스타터 킷은 "사이드바(sidebar)" 레이아웃과 "헤더(header)" 레이아웃, 두 가지 주요 레이아웃 중에서 선택할 수 있습니다. 기본값은 사이드바 레이아웃이지만, `resources/js/layouts/app-layout.tsx` 파일 상단에서 불러오는 레이아웃을 변경하여 헤더 레이아웃으로 전환할 수 있습니다.

```js
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout'; // [tl! remove]
import AppLayoutTemplate from '@/layouts/app/app-header-layout'; // [tl! add]
```

<a name="react-sidebar-variants"></a>
#### 사이드바 변형

사이드바 레이아웃에는 기본 사이드바, "인셋(inset)" 변형, "플로팅(floating)" 변형의 세 가지 스타일이 있습니다. `resources/js/components/app-sidebar.tsx` 파일 내에서 원하는 변형을 선택할 수 있습니다.

```text
<Sidebar collapsible="icon" variant="sidebar"> [tl! remove]
<Sidebar collapsible="icon" variant="inset"> [tl! add]
```

<a name="react-authentication-page-layout-variants"></a>
#### 인증 페이지 레이아웃 변형

React 스타터 킷에는 로그인, 회원가입 등 인증 관련 페이지도 포함되어 있으니, "simple", "card", "split"의 세 가지 레이아웃 중에서 선택할 수 있습니다.

이 레이아웃을 변경하려면, `resources/js/layouts/auth-layout.tsx` 파일 상단에서 불러오는 레이아웃을 수정하세요.

```js
import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout'; // [tl! remove]
import AuthLayoutTemplate from '@/layouts/auth/auth-split-layout'; // [tl! add]
```

<a name="vue-customization"></a>
### Vue

Vue 스타터 킷은 Inertia 2, Vue 3 Composition API, Tailwind, [shadcn-vue](https://www.shadcn-vue.com/) 기반으로 제작되었습니다. 다른 모든 스타터 킷과 마찬가지로, 백엔드와 프론트엔드의 전체 코드가 애플리케이션에 포함되어 있으므로 마음껏 커스터마이징할 수 있습니다.

프론트엔드 코드는 대부분 `resources/js` 디렉터리에 위치하며, 코드를 자유롭게 수정하여 원하는 디자인이나 동작으로 변경할 수 있습니다.

```text
resources/js/
├── components/    # 재사용 가능한 Vue 컴포넌트
├── composables/   # Vue용 composable(훅)
├── layouts/       # 애플리케이션 레이아웃
├── lib/           # 유틸리티 함수 및 설정
├── pages/         # 페이지 컴포넌트
└── types/         # TypeScript 타입 정의
```

추가적인 shadcn-vue 컴포넌트를 배포하려면, 먼저 [원하는 컴포넌트를 찾은 뒤](https://www.shadcn-vue.com), 아래와 같이 `npx`를 사용해 컴포넌트를 설치하세요.

```shell
npx shadcn-vue@latest add switch
```

이 명령을 수행하면 Switch 컴포넌트가 `resources/js/components/ui/Switch.vue` 경로에 배포됩니다. 컴포넌트가 추가된 후에는 페이지 어디에서든 사용할 수 있습니다.

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

Vue 스타터 킷에는 "사이드바(sidebar)" 레이아웃과 "헤더(header)" 레이아웃, 두 가지 주요 레이아웃이 제공됩니다. 기본은 사이드바 레이아웃이지만, `resources/js/layouts/AppLayout.vue` 파일 상단의 임포트 구문을 변경하여 헤더 레이아웃으로 바꿀 수 있습니다.

```js
import AppLayout from '@/layouts/app/AppSidebarLayout.vue'; // [tl! remove]
import AppLayout from '@/layouts/app/AppHeaderLayout.vue'; // [tl! add]
```

<a name="vue-sidebar-variants"></a>
#### 사이드바 변형

사이드바 레이아웃에는 기본, "인셋(inset)", "플로팅(floating)" 세 가지 스타일이 있습니다. 원하는 스타일은 `resources/js/components/AppSidebar.vue` 파일에서 선택할 수 있습니다.

```text
<Sidebar collapsible="icon" variant="sidebar"> [tl! remove]
<Sidebar collapsible="icon" variant="inset"> [tl! add]
```

<a name="vue-authentication-page-layout-variants"></a>
#### 인증 페이지 레이아웃 변형

Vue 스타터 킷에 포함된 로그인, 회원가입 등 인증 관련 페이지 역시 "simple", "card", "split" 세 가지 레이아웃 중에서 선택할 수 있습니다.

인증 레이아웃을 변경하려면, `resources/js/layouts/AuthLayout.vue` 파일 상단의 임포트 구문을 수정하세요.

```js
import AuthLayout from '@/layouts/auth/AuthSimpleLayout.vue'; // [tl! remove]
import AuthLayout from '@/layouts/auth/AuthSplitLayout.vue'; // [tl! add]
```

<a name="livewire-customization"></a>
### Livewire

Livewire 스타터 킷은 Livewire 3, Tailwind, [Flux UI](https://fluxui.dev/)를 기반으로 제작되어 있습니다. 마찬가지로 모든 백엔드와 프론트엔드 코드를 애플리케이션 내에서 직접 수정할 수 있습니다.

#### Livewire와 Volt

프론트엔드 코드는 주로 `resources/views` 디렉터리에 저장되어 있습니다. 원하는 디자인이나 동작으로 커스터마이즈하려면 이 경로의 코드를 자유롭게 수정하시면 됩니다.

```text
resources/views
├── components            # 재사용 Livewire 컴포넌트
├── flux                  # 커스터마이즈된 Flux 컴포넌트
├── livewire              # Livewire 페이지
├── partials              # 재사용 Blade 부분 템플릿
├── dashboard.blade.php   # 인증된 사용자 대시보드
├── welcome.blade.php     # 비회원 사용자 환영 페이지
```

#### 전통적인 Livewire 컴포넌트

프론트엔드 코드는 `resources/views` 디렉터리에 존재하며, 각 Livewire 컴포넌트의 백엔드 로직은 `app/Livewire` 디렉터리에 위치합니다.

<a name="livewire-available-layouts"></a>
#### 사용 가능한 레이아웃

Livewire 스타터 킷에도 두 가지 주요 레이아웃, 즉 "사이드바(sidebar)"와 "헤더(header)"가 제공됩니다. 기본값은 사이드바이지만, `resources/views/components/layouts/app.blade.php` 파일에서 사용하는 레이아웃을 수정하여 헤더 레이아웃으로 변경할 수 있습니다. 또한, 주요 Flux 컴포넌트에는 `container` 속성을 추가해야 합니다.

```blade
<x-layouts.app.header>
    <flux:main container>
        {{ $slot }}
    </flux:main>
</x-layouts.app.header>
```

<a name="livewire-authentication-page-layout-variants"></a>
#### 인증 페이지 레이아웃 변형

Livewire 스타터 킷의 로그인, 회원가입 등 인증 페이지 역시 "simple", "card", "split" 세 가지 레이아웃 변형이 제공됩니다.

인증 레이아웃을 바꾸려면 `resources/views/components/layouts/auth.blade.php` 파일에서 사용되는 레이아웃을 수정하세요.

```blade
<x-layouts.auth.split>
    {{ $slot }}
</x-layouts.auth.split>
```

<a name="workos"></a>
## WorkOS AuthKit 인증

기본적으로 React, Vue, Livewire 스타터 킷은 모두 라라벨의 내장 인증 시스템을 활용해 로그인, 회원가입, 비밀번호 재설정, 이메일 인증 등 여러 기능을 제공합니다. 이와 더불어, 각 스타터 킷에는 [WorkOS AuthKit](https://authkit.com)이 적용된 변형 버전도 제공되며, 이 버전은 아래와 같은 기능을 추가로 지원합니다.

<div class="content-list" markdown="1">

- 소셜 인증(Google, Microsoft, GitHub, Apple)
- 패스키(passkey) 인증
- 이메일 기반 "매직 인증(Magic Auth)"
- SSO(싱글 사인온)

</div>

WorkOS를 인증 제공자로 사용하려면 [WorkOS 계정이 필요](https://workos.com)합니다. WorkOS는 월 활성 사용자 100만 명까지 무료 인증 서비스를 제공합니다.

애플리케이션 생성 시 `laravel new` 명령에서 WorkOS 옵션을 선택하면, WorkOS AuthKit을 인증 제공자로 활용할 수 있습니다.

### WorkOS 스타터 킷 설정

WorkOS 기반 스타터 킷으로 새 애플리케이션을 만든 후, `.env` 파일에 `WORKOS_CLIENT_ID`, `WORKOS_API_KEY`, `WORKOS_REDIRECT_URL` 환경 변수를 추가해야 합니다. 이 값들은 WorkOS 대시보드에서 발급받은 값과 일치해야 합니다.

```ini
WORKOS_CLIENT_ID=your-client-id
WORKOS_API_KEY=your-api-key
WORKOS_REDIRECT_URL="${APP_URL}/authenticate"
```

또한, WorkOS 대시보드에서 애플리케이션 홈 페이지 URL을 설정해야 합니다. 이 URL은 사용자가 로그아웃 후 리디렉션되는 주소입니다.

<a name="configuring-authkit-authentication-methods"></a>
#### AuthKit 인증 방식 설정

WorkOS 기반 스타터 킷 사용 시에는 애플리케이션의 WorkOS AuthKit 설정 메뉴에서 "이메일 + 비밀번호" 인증 방식을 비활성화하고, 소셜 인증, 패스키, 매직 인증, SSO만 활성화할 것을 권장합니다. 이렇게 하면 애플리케이션 자체에서 사용자 비밀번호를 직접 다루지 않아도 됩니다.

<a name="configuring-authkit-session-timeouts"></a>
#### AuthKit 세션 타임아웃 설정

또한, WorkOS AuthKit의 세션 비활성화(비접속) 타임아웃도 라라벨 애플리케이션에 설정된 세션 만료 시간과 일치하도록 설정하는 것이 좋습니다. 보통 기본값은 2시간입니다.

<a name="inertia-ssr"></a>
### Inertia SSR

React 및 Vue 스타터 킷은 Inertia의 [서버 사이드 렌더링(SSR)](https://inertiajs.com/server-side-rendering) 기능도 지원합니다. SSR 호환 번들을 만들려면 다음과 같이 `build:ssr` 명령을 실행하세요.

```shell
npm run build:ssr
```

편의상 `composer dev:ssr` 명령도 제공됩니다. 이 명령을 통해 SSR 호환 번들 빌드 후 라라벨 개발 서버와 Inertia SSR 서버가 함께 실행되어, 로컬 환경에서 Inertia SSR 엔진을 적용한 애플리케이션을 바로 테스트할 수 있습니다.

```shell
composer dev:ssr
```

<a name="community-maintained-starter-kits"></a>
### 커뮤니티 유지 스타터 킷

라라벨 인스톨러로 새로운 애플리케이션을 생성할 때, Packagist에 등록된 커뮤니티 스타터 킷을 `--using` 옵션에 지정해서 사용할 수도 있습니다.

```shell
laravel new my-app --using=example/starter-kit
```

<a name="creating-starter-kits"></a>
#### 스타터 킷 만들기

다른 개발자들도 사용할 수 있도록 스타터 킷을 배포하려면, [Packagist](https://packagist.org)로 배포해야 합니다. 스타터 킷에는 필요한 환경 변수들을 `.env.example` 파일에 정의하고, 설치 후 실행되어야 하는 명령어는 `composer.json` 파일의 `post-create-project-cmd` 배열에 등록해야 합니다.

<a name="faqs"></a>
### 자주 묻는 질문

<a name="faq-upgrade"></a>
#### 업그레이드는 어떻게 하나요?

모든 스타터 킷은 다음 프로젝트의 확실한 시작점을 제공합니다. 코드에 대한 완전한 소유권을 가지므로, 원하는 대로 수정하거나 확장해 자신만의 애플리케이션을 만들 수 있습니다. 다만, 스타터 킷 자체를 별도로 업데이트할 필요는 없습니다.

<a name="faq-enable-email-verification"></a>
#### 이메일 인증 기능은 어떻게 활성화하나요?

이메일 인증 기능을 추가하려면, `App/Models/User.php` 모델에서 `MustVerifyEmail` 임포트 부분의 주석을 해제하고, 해당 모델이 `MustVerifyEmail` 인터페이스를 구현하도록 해야 합니다.

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

회원가입 이후, 사용자는 인증 메일을 받게 됩니다. 특정 라우트에 대해 이메일 인증을 완료한 사용자만 접근할 수 있도록 하려면, 라우트에 `verified` 미들웨어를 추가하세요.

```php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});
```

> [!NOTE]
> [WorkOS](#workos) 변형 스타터 킷을 사용하는 경우 이메일 인증은 필수가 아닙니다.

<a name="faq-modify-email-template"></a>
#### 기본 이메일 템플릿은 어떻게 수정하나요?

애플리케이션의 브랜드 아이덴티티에 맞게 이메일 템플릿을 커스터마이즈하고 싶을 수 있습니다. 이를 위해 다음 명령어로 이메일 뷰 파일을 애플리케이션에 배포하세요.

```
php artisan vendor:publish --tag=laravel-mail
```

이 명령어를 실행하면 `resources/views/vendor/mail` 경로에 여러 파일이 생성됩니다. 이 파일들 또는 `resources/views/vendor/mail/themes/default.css` 파일을 수정해 기본 이메일 템플릿의 디자인과 스타일을 변경할 수 있습니다.
