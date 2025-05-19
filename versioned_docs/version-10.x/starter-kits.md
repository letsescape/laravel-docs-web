# 스타터 키트 (Starter Kits)

- [소개](#introduction)
- [라라벨 브리즈](#laravel-breeze)
    - [설치](#laravel-breeze-installation)
    - [브리즈와 Blade](#breeze-and-blade)
    - [브리즈와 Livewire](#breeze-and-livewire)
    - [브리즈와 React / Vue](#breeze-and-inertia)
    - [브리즈와 Next.js / API](#breeze-and-next)
- [라라벨 제트스트림](#laravel-jetstream)

<a name="introduction"></a>
## 소개

새로운 라라벨 애플리케이션을 빠르게 시작할 수 있도록, 라라벨은 인증 및 애플리케이션 스타터 키트를 제공합니다. 이 키트들은 회원가입과 인증에 필요한 라우트, 컨트롤러, 뷰 등을 자동으로 프로젝트에 구성해 줍니다.

물론 이 스타터 키트들은 사용이 필수는 아닙니다. 깔끔하게 라라벨을 설치해서 처음부터 직접 애플리케이션을 만들어도 좋습니다. 어떤 방법을 선택하든, 멋진 결과를 만들어내실 거라 믿습니다!

<a name="laravel-breeze"></a>
## 라라벨 브리즈

[라라벨 브리즈](https://github.com/laravel/breeze)는 라라벨의 [인증 기능](/docs/10.x/authentication) 전반(로그인, 회원가입, 비밀번호 재설정, 이메일 인증, 비밀번호 확인 등)을 간단하고 최소한의 형태로 구현한 스타터 키트입니다. 또한 브리즈에는 사용자가 이름, 이메일 주소, 비밀번호를 수정할 수 있는 "프로필" 페이지도 포함되어 있습니다.

라라벨 브리즈의 기본 뷰 레이어는 [Tailwind CSS](https://tailwindcss.com)로 스타일링된 심플한 [Blade 템플릿](/docs/10.x/blade)으로 구성되어 있습니다. 또한, 브리즈는 [Livewire](https://livewire.laravel.com) 또는 [Inertia](https://inertiajs.com)를 기반으로 Vue 혹은 React를 사용할 수 있는 다양한 스캐폴딩 옵션도 제공합니다.

<img src="https://laravel.com/img/docs/breeze-register.png" />

#### 라라벨 부트캠프

라라벨이 처음이라면 [라라벨 부트캠프](https://bootcamp.laravel.com)에 바로 도전해 보십시오. 라라벨 부트캠프는 브리즈를 활용해 처음으로 라라벨 애플리케이션을 만드는 과정을 단계별로 안내합니다. 라라벨과 브리즈의 핵심 기능을 한눈에 살펴볼 수 있는 좋은 방법입니다.

<a name="laravel-breeze-installation"></a>
### 설치

먼저, [새로운 라라벨 애플리케이션을 생성](/docs/10.x/installation)하고 데이터베이스를 설정한 뒤, [데이터베이스 마이그레이션](/docs/10.x/migrations)을 실행해야 합니다. 새로운 라라벨 애플리케이션을 준비했다면, Composer를 이용해 라라벨 브리즈를 설치할 수 있습니다:

```shell
composer require laravel/breeze --dev
```

Composer로 라라벨 브리즈 패키지를 설치한 후에는 `breeze:install` 아티즌 명령어를 실행할 수 있습니다. 이 명령어는 인증 뷰, 라우트, 컨트롤러 등 여러 리소스를 애플리케이션에 퍼블리시합니다. 브리즈는 모든 코드를 여러분의 프로젝트로 복사하기 때문에, 기능과 구현을 완전히 직접 관리하고 확인할 수 있습니다.

`breeze:install` 명령어를 실행하면, 선호하는 프론트엔드 스택과 테스트 프레임워크를 선택하라는 안내가 표시됩니다:

```shell
php artisan breeze:install

php artisan migrate
npm install
npm run dev
```

<a name="breeze-and-blade"></a>
### 브리즈와 Blade

브리즈의 기본 "스택"은 Blade 스택으로, [Blade 템플릿](/docs/10.x/blade)을 이용해 프론트엔드를 렌더링합니다. 단순하게 `breeze:install` 명령어를 아무 인자 없이 실행하고 Blade 프론트엔드 스택을 선택하면 설치할 수 있습니다. 브리즈의 스캐폴딩을 마친 후에는 프론트엔드 에셋도 반드시 컴파일해야 합니다:

```shell
php artisan breeze:install

php artisan migrate
npm install
npm run dev
```

이제 웹 브라우저에서 `/login` 또는 `/register` URL로 이동해 직접 브리즈에서 제공하는 인증 페이지들을 확인할 수 있습니다. 브리즈의 모든 라우트는 `routes/auth.php` 파일에 정의되어 있습니다.

> [!NOTE]
> 애플리케이션의 CSS 및 JavaScript를 컴파일하는 방법에 대해 더 알고 싶으시다면, 라라벨의 [Vite 문서](/docs/10.x/vite#running-vite)를 참고하세요.

<a name="breeze-and-livewire"></a>
### 브리즈와 Livewire

라라벨 브리즈는 [Livewire](https://livewire.laravel.com) 스캐폴딩도 제공합니다. Livewire는 순수 PHP만으로 동적이고 반응형인 프론트엔드 UI를 쉽게 개발할 수 있는 강력한 도구입니다.

Livewire는 주로 Blade 템플릿을 사용하는 팀이, Vue나 React 같은 자바스크립트 기반 SPA 프레임워크보다 더 단순한 대안을 찾을 때 특히 잘 어울립니다.

Livewire 스택을 선택하려면 `breeze:install` 아티즌 명령어를 실행할 때 Livewire 프론트엔드 스택을 선택하면 됩니다. 스캐폴딩이 완료된 후엔 데이터베이스 마이그레이션을 진행해야 합니다:

```shell
php artisan breeze:install

php artisan migrate
```

<a name="breeze-and-inertia"></a>
### 브리즈와 React / Vue

라라벨 브리즈는 [Inertia](https://inertiajs.com) 프론트엔드 구현을 통해 React 및 Vue 기반 스캐폴딩도 지원합니다. Inertia를 활용하면, 익숙한 서버 사이드 라우팅과 컨트롤러 방식 그대로, 최신의 싱글 페이지 React 또는 Vue 애플리케이션을 개발할 수 있습니다.

Inertia를 통해 React, Vue의 프론트엔드 개발 효율성과 라라벨의 강력한 백엔드, 그리고 [Vite](https://vitejs.dev)로 인한 빠른 컴파일 속도를 동시에 누릴 수 있습니다. Inertia 스택을 사용하려면 `breeze:install`을 실행할 때 Vue 또는 React 프론트엔드 스택을 선택하면 됩니다.

Vue나 React를 선택하면 브리즈 설치기는 [Inertia SSR](https://inertiajs.com/server-side-rendering)이나 TypeScript 지원 여부도 함께 설정할 수 있도록 안내합니다. 스캐폴딩이 마무리되면 프론트엔드 에셋도 반드시 컴파일해야 합니다:

```shell
php artisan breeze:install

php artisan migrate
npm install
npm run dev
```

이후 웹 브라우저에서 `/login` 또는 `/register` 페이지로 접속하시면 됩니다. 브리즈에서 정의된 모든 라우트는 `routes/auth.php` 파일에 있습니다.

<a name="breeze-and-next"></a>
### 브리즈와 Next.js / API

라라벨 브리즈는 [Next](https://nextjs.org), [Nuxt](https://nuxt.com) 등과 같은 현대적인 자바스크립트 애플리케이션에서 인증할 수 있는 API 스캐폴딩도 제공합니다. 시작하려면 `breeze:install` 명령어를 실행할 때 원하는 스택으로 API 스택을 선택해 주세요:

```shell
php artisan breeze:install

php artisan migrate
```

설치 과정에서 브리즈는 애플리케이션의 `.env` 파일에 `FRONTEND_URL` 환경 변수를 추가합니다. 이 URL에는 여러분이 사용 중인 자바스크립트 애플리케이션의 주소를 입력해야 합니다. 보통 로컬 개발 환경에서는 `http://localhost:3000`이 될 것입니다. 또한, `APP_URL`이 `http://localhost:8000`으로 설정되어 있는지 반드시 확인하세요. 이는 `serve` 아티즌 명령어가 사용하는 기본 URL입니다.

<a name="next-reference-implementation"></a>
#### Next.js 레퍼런스 구현체

이제 백엔드와 원하는 프론트엔드를 연동할 준비가 끝났습니다. 브리즈 프론트엔드의 Next.js 레퍼런스 구현체는 [GitHub에서 확인할 수 있습니다](https://github.com/laravel/breeze-next). 이 프론트엔드는 라라벨에서 공식적으로 관리하며, 기존의 Blade 및 Inertia 스택과 동일한 사용자 인터페이스를 제공합니다.

<a name="laravel-jetstream"></a>
## 라라벨 제트스트림

라라벨 브리즈가 간단하고 최소한의 프로젝트 시작점을 제공한다면, 제트스트림은 여기에 더 강력한 여러 기능과 다양한 프론트엔드 스택을 결합해줍니다. **라라벨을 처음 접하셨다면, 먼저 라라벨 브리즈로 입문하시고 이후에 제트스트림을 활용해보는 것을 추천합니다.**

제트스트림은 멋지게 디자인된 애플리케이션 스캐폴딩을 제공하며, 로그인, 회원가입, 이메일 인증, 2단계 인증, 세션 관리, Laravel Sanctum을 통한 API 지원, 팀 관리(선택적) 등 다양한 기능을 포함합니다. 제트스트림은 [Tailwind CSS](https://tailwindcss.com)를 활용해 디자인되었으며, [Livewire](https://livewire.laravel.com) 혹은 [Inertia](https://inertiajs.com) 기반 프론트엔드 스캐폴딩 중에서 선택할 수 있습니다.

라라벨 제트스트림의 설치에 관한 자세한 안내는 [공식 제트스트림 문서](https://jetstream.laravel.com)에서 확인할 수 있습니다.
