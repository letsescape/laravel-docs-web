# 스타터 키트 (Starter Kits)

- [소개](#introduction)
- [라라벨 브리즈](#laravel-breeze)
    - [설치](#laravel-breeze-installation)
    - [브리즈 & 이너시아](#breeze-and-inertia)
    - [브리즈 & Next.js / API](#breeze-and-next)
- [라라벨 젯스트림](#laravel-jetstream)

<a name="introduction"></a>
## 소개

새로운 라라벨 애플리케이션을 개발할 때 더 빠르게 시작할 수 있도록, 인증 및 애플리케이션 스타터 키트를 제공합니다. 이 키트는 회원 등록과 인증에 필요한 라우트, 컨트롤러, 뷰를 자동으로 생성해주어, 빠르게 기본 골격을 갖춘 애플리케이션을 만들 수 있습니다.

이러한 스타터 키트를 반드시 사용해야 하는 것은 아닙니다. 원한다면 라라벨을 새롭게 설치하여 처음부터 직접 애플리케이션을 구성할 수도 있습니다. 어떤 방식을 택하든 멋진 결과를 만들어낼 수 있을 것입니다!

<a name="laravel-breeze"></a>
## 라라벨 브리즈

[라라벨 브리즈](https://github.com/laravel/breeze)는 로그인, 회원가입, 비밀번호 재설정, 이메일 인증, 비밀번호 확인 등 라라벨의 모든 [인증 기능](/docs/8.x/authentication)을 간결하고 단순하게 구현한 스타터 키트입니다. 브리즈의 기본 뷰 레이어는 [Tailwind CSS](https://tailwindcss.com)로 스타일링된 간단한 [Blade 템플릿](/docs/8.x/blade)으로 구성되어 있습니다.

브리즈는 새로운 라라벨 애플리케이션을 시작할 때 훌륭한 출발점이 되어주며, [라라벨 Livewire](https://laravel-livewire.com)와 함께 Blade 템플릿을 한 단계 더 발전시키려는 프로젝트에도 잘 어울리는 선택입니다.

<a name="laravel-breeze-installation"></a>
### 설치

먼저 [새로운 라라벨 애플리케이션을 생성](/docs/8.x/installation)한 뒤, 데이터베이스를 설정하고 [데이터베이스 마이그레이션](/docs/8.x/migrations)을 실행합니다.

```bash
curl -s https://laravel.build/example-app | bash

cd example-app

php artisan migrate
```

새 프로젝트가 준비되었다면, Composer를 사용해 라라벨 브리즈를 설치합니다.

```bash
composer require laravel/breeze:1.9.2 
```

Composer로 라라벨 브리즈 패키지 설치가 완료되면, `breeze:install` 아티즌 명령어를 실행할 수 있습니다. 이 명령어는 인증과 관련된 뷰, 라우트, 컨트롤러 등 여러 리소스를 프로젝트에 추가합니다. 브리즈는 모든 코드를 프로젝트 내부에 직접 배포하기 때문에, 개발자가 기능 구현과 동작을 완전히 직접 제어하고 확인할 수 있습니다. 설치가 끝났다면, CSS 파일이 정상적으로 적용될 수 있도록 에셋도 빌드해야 합니다.

```nothing
php artisan breeze:install

npm install
npm run dev
php artisan migrate
```

이제 웹 브라우저에서 애플리케이션의 `/login` 또는 `/register` 경로로 이동해볼 수 있습니다. 브리즈에서 사용하는 모든 인증 라우트는 `routes/auth.php` 파일에 정의되어 있습니다.

> [!TIP]
> 애플리케이션의 CSS와 자바스크립트 번들링에 대해 더 자세히 알고 싶다면 [라라벨 Mix 문서](/docs/8.x/mix#running-mix)를 참고하세요.

<a name="breeze-and-inertia"></a>
### 브리즈 & 이너시아

라라벨 브리즈는 [Inertia.js](https://inertiajs.com)를 활용한 프론트엔드 스택도 제공합니다. 뷰(Vue) 또는 리액트(React)를 선택해 사용할 수 있습니다. 이너시아 스택을 적용하려면, `breeze:install` 아티즌 명령어를 실행할 때 원하는 스택 이름(`vue` 또는 `react`)을 함께 입력하면 됩니다.

```nothing
php artisan breeze:install vue

// 또는...

php artisan breeze:install react

npm install
npm run dev
php artisan migrate
```

<a name="breeze-and-next"></a>
### 브리즈 & Next.js / API

라라벨 브리즈는 최신 자바스크립트 애플리케이션(예: [Next](https://nextjs.org), [Nuxt](https://nuxt.com) 등)에서 사용하기에 적합한 인증 API도 자동으로 구성할 수 있습니다. 시작하려면 `breeze:install` 아티즌 명령어 실행 시 `api` 스택을 지정해주면 됩니다.

```nothing
php artisan breeze:install api

php artisan migrate
```

설치 과정에서 브리즈는 `.env` 파일에 `FRONTEND_URL` 환경 변수를 추가합니다. 이 값은 자바스크립트 프론트엔드 애플리케이션의 URL로 설정해야 합니다. 일반적으로 개발 환경에서는 `http://localhost:3000` 등으로 지정합니다.

<a name="next-reference-implementation"></a>
#### Next.js 참고 구현체

이제 백엔드를 다양한 프론트엔드와 연동할 준비가 끝났습니다. 브리즈 프론트엔드의 Next.js 참고 구현체는 [GitHub에서 확인할 수 있습니다](https://github.com/laravel/breeze-next). 이 프론트엔드는 라라벨에서 공식적으로 관리하며, 브리즈의 기존 Blade 및 이너시아 스택과 동일한 사용자 인터페이스를 제공합니다.

<a name="laravel-jetstream"></a>
## 라라벨 젯스트림

라라벨 브리즈가 단순하고 미니멀한 시작점을 제공하는 반면, 젯스트림은 보다 강력한 기능과 추가 프론트엔드 기술 스택을 함께 제공합니다. **라라벨을 처음 접하는 분이라면, 먼저 라라벨 브리즈로 기본 구조와 개념을 익히고, 그 다음에 라라벨 젯스트림을 활용하는 것을 추천합니다.**

젯스트림은 미려하게 디자인된 애플리케이션 스캐폴딩을 제공하며, 로그인, 회원가입, 이메일 인증, 2단계 인증, 세션 관리, 라라벨 Sanctum을 통한 API 지원, 팀 관리(선택 사항) 등의 기능을 지원합니다. [Tailwind CSS](https://tailwindcss.com)로 디자인되어 있으며, [Livewire](https://laravel-livewire.com) 또는 [Inertia.js](https://inertiajs.com) 중 원하는 프론트엔드 스캐폴딩 방식을 선택할 수 있습니다.

라라벨 젯스트림의 설치 방법에 대한 전체 공식 문서는 [Jetstream 공식 문서](https://jetstream.laravel.com/introduction.html)에서 확인하실 수 있습니다.
