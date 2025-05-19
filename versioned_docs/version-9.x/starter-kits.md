# 스타터 키트 (Starter Kits)

- [소개](#introduction)
- [라라벨 브리즈](#laravel-breeze)
    - [설치](#laravel-breeze-installation)
    - [브리즈 & Blade](#breeze-and-blade)
    - [브리즈 & React / Vue](#breeze-and-inertia)
    - [브리즈 & Next.js / API](#breeze-and-next)
- [라라벨 젯스트림](#laravel-jetstream)

<a name="introduction"></a>
## 소개

새로운 라라벨 애플리케이션을 빠르게 시작할 수 있도록, 인증과 애플리케이션 초기 구성을 도와주는 스타터 키트를 제공합니다. 이 키트들은 회원가입, 인증에 필요한 라우트, 컨트롤러, 뷰를 자동으로 만들어 주기 때문에, 사용자 인증 기능이 필요한 애플리케이션의 뼈대를 손쉽게 구성할 수 있습니다.

이러한 스타터 키트를 꼭 사용해야 하는 것은 아닙니다. 원한다면 라라벨을 새로 설치한 뒤 직접 처음부터 필요한 기능을 구축해도 됩니다. 어떤 방식을 사용하더라도, 여러분이 멋진 서비스를 만들어낼 것이라 믿습니다!

<a name="laravel-breeze"></a>
## 라라벨 브리즈

[라라벨 브리즈](https://github.com/laravel/breeze)는 로그인, 회원가입, 비밀번호 재설정, 이메일 인증, 비밀번호 확인 등 라라벨의 [인증 기능](/docs/9.x/authentication)을 가장 단순하게 구현해둔 미니멀한 스타터 키트입니다. 또한, 브리즈에는 사용자가 이름, 이메일 주소, 비밀번호를 수정할 수 있는 간단한 "프로필" 페이지도 포함되어 있습니다.

라라벨 브리즈의 기본 뷰 레이어는 [Tailwind CSS](https://tailwindcss.com)로 스타일링된 심플한 [Blade 템플릿](/docs/9.x/blade)으로 구성되어 있습니다. 상황에 따라 Vue, React, 그리고 [Inertia](https://inertiajs.com)를 활용한 옵션도 지원합니다.

브리즈는 새 프로젝트를 시작할 때 훌륭한 출발점이 되어주며, 특히 [라라벨 Livewire](https://laravel-livewire.com)와 결합해 기존 Blade 템플릿을 더 진화시키고자 하는 프로젝트에도 잘 어울립니다.

<img src="https://laravel.com/img/docs/breeze-register.png" />

#### 라라벨 부트캠프

라라벨이 처음이라면 [라라벨 부트캠프](https://bootcamp.laravel.com)를 시작해 보세요. 이 부트캠프는 브리즈를 사용해 첫 번째 라라벨 애플리케이션을 만드는 전 과정을 친절하게 안내합니다. 라라벨과 브리즈가 제공하는 다양한 기능을 둘러보기에도 아주 좋은 방법입니다.

<a name="laravel-breeze-installation"></a>
### 설치

먼저 [새로운 라라벨 애플리케이션](/docs/9.x/installation)을 생성하고, 데이터베이스를 설정한 뒤 [데이터베이스 마이그레이션](/docs/9.x/migrations)을 실행해 주세요. 애플리케이션 준비가 완료되면, Composer로 라라벨 브리즈를 설치할 수 있습니다.

```shell
composer require laravel/breeze --dev
```

브리즈가 설치되면, 아래 설명에서 소개하는 브리즈의 "스택(stack)" 중 하나를 선택해 애플리케이션 구조를 자동으로 만들어줄 수 있습니다.

<a name="breeze-and-blade"></a>
### 브리즈 & Blade

Composer로 라라벨 브리즈 패키지를 설치한 후에는 `breeze:install` 아티즌 명령어를 실행할 수 있습니다. 이 명령어는 인증에 필요한 뷰, 라우트, 컨트롤러 등 여러 리소스를 애플리케이션에 추가합니다. 라라벨 브리즈는 자신의 모든 코드를 여러분의 애플리케이션에 직접 복사해두기 때문에, 필요에 따라 언제든 기능을 자유롭게 수정하거나 확인할 수 있습니다.

브리즈의 기본 "스택"은 Blade 스택입니다. 이 스택은 심플한 [Blade 템플릿](/docs/9.x/blade)으로 프론트엔드를 구성합니다. 별도의 인수 없이 `breeze:install` 명령어만 실행하면 Blade 스택이 설치됩니다. 브리즈의 구조가 완성되면, 프론트엔드 자산도 컴파일해주어야 합니다.

```shell
php artisan breeze:install

php artisan migrate
npm install
npm run dev
```

이제 웹 브라우저에서 애플리케이션의 `/login` 또는 `/register` URL로 접속해 볼 수 있습니다. 모든 브리즈 인증 라우트는 `routes/auth.php` 파일에 정의되어 있습니다.

<a name="dark-mode"></a>
#### 다크 모드

프론트엔드에 "다크 모드" 기능까지 함께 적용하고 싶다면, `breeze:install` 명령어에 `--dark` 옵션을 추가하면 됩니다.

```shell
php artisan breeze:install --dark
```

> [!NOTE]
> 애플리케이션의 CSS 및 JavaScript 자산 컴파일 방법이 궁금하다면 라라벨의 [Vite 문서](/docs/9.x/vite#running-vite)를 참고해 주세요.

<a name="breeze-and-inertia"></a>
### 브리즈 & React / Vue

라라벨 브리즈는 [Inertia](https://inertiajs.com)를 활용한 React, Vue 기반 프론트엔드 구성도 지원합니다. Inertia를 사용하면, 서버 사이드 라우팅과 컨트롤러의 장점은 그대로 누리면서 React나 Vue로 현대적인 싱글 페이지 애플리케이션을 만들 수 있습니다.

Inertia를 활용하면 React, Vue의 강력한 프론트엔드는 물론, 라라벨의 뛰어난 생산성과 [Vite](https://vitejs.dev)로 번개처럼 빠른 빌드 환경을 모두 경험할 수 있습니다. Inertia 스택을 사용하려면, `breeze:install` 아티즌 명령어 실행 시 원하는 스택으로 `vue` 또는 `react`를 지정하면 됩니다. 브리즈의 구조가 완성되면 프론트엔드 자산도 꼭 빌드해 주세요.

```shell
php artisan breeze:install vue

# 또는...

php artisan breeze:install react

php artisan migrate
npm install
npm run dev
```

이제 웹 브라우저에서 애플리케이션의 `/login` 또는 `/register` URL로 접속해 볼 수 있습니다. 모든 브리즈 인증 라우트는 `routes/auth.php` 파일에 정의되어 있습니다.

<a name="server-side-rendering"></a>
#### 서버사이드 렌더링

[Inertia SSR](https://inertiajs.com/server-side-rendering) 기능까지 포함해 구성하고 싶다면, `breeze:install` 명령어에 `ssr` 옵션을 추가해 실행하세요.

```shell
php artisan breeze:install vue --ssr
php artisan breeze:install react --ssr
```

<a name="breeze-and-next"></a>
### 브리즈 & Next.js / API

라라벨 브리즈는 [Next](https://nextjs.org), [Nuxt](https://nuxt.com) 등 최신 자바스크립트 프레임워크를 위한 인증 API도 쉽게 만들 수 있도록 지원합니다. 시작하려면, 원하는 스택으로 `api`를 지정해서 `breeze:install` 아티즌 명령어를 실행하세요.

```shell
php artisan breeze:install api

php artisan migrate
```

설치 과정에서 브리즈가 애플리케이션의 `.env` 파일에 `FRONTEND_URL` 환경 변수를 추가해줍니다. 이 값에는 자바스크립트 프론트엔드 앱의 주소를 입력하면 됩니다. 일반적으로 로컬 개발 환경에서는 `http://localhost:3000`이 사용됩니다. 또한 `APP_URL` 환경 변수는 `php artisan serve` 명령어가 사용하는 기본 값인 `http://localhost:8000`으로 잘 설정되어 있는지 확인해 주세요.

<a name="next-reference-implementation"></a>
#### Next.js 참고 구현체

모든 설정이 끝나면, 원하는 프론트엔드와 이 백엔드를 연결할 수 있습니다. 브리즈 프론트엔드의 Next 참고 구현체는 [GitHub에서 확인할 수 있습니다](https://github.com/laravel/breeze-next). 이 프론트엔드는 라라벨에서 공식적으로 관리하며, 브리즈의 Blade, Inertia 스택과 동일한 사용자 인터페이스를 제공합니다.

<a name="laravel-jetstream"></a>
## 라라벨 젯스트림

라라벨 브리즈가 가장 단순한 출발점을 제공한다면, 젯스트림은 여기에 더 다양한 기능과 프론트엔드 선택지를 추가합니다. **라라벨을 이제 막 시작하는 분들께는 브리즈로 기본기를 먼저 익히신 후, 젯스트림을 사용해보는 것을 추천합니다.**

젯스트림은 아름답게 디자인된 애플리케이션 구조를 제공하며, 로그인, 회원가입, 이메일 인증, 2단계 인증, 세션 관리, Laravel Sanctum을 통한 API 지원, 필요하다면 팀 관리 기능까지 갖추고 있습니다. 젯스트림은 [Tailwind CSS](https://tailwindcss.com)로 디자인되었고, 프론트엔드로는 [Livewire](https://laravel-livewire.com) 혹은 [Inertia](https://inertiajs.com) 중에서 선택할 수 있습니다.

라라벨 젯스트림 설치에 관한 모든 공식 문서는 [Jetstream 공식 문서](https://jetstream.laravel.com/introduction.html)에서 확인하실 수 있습니다.
