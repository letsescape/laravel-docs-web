# 스타터 키트 (Starter Kits)

- [소개](#introduction)
- [라라벨 브리즈](#laravel-breeze)
    - [설치](#laravel-breeze-installation)
    - [브리즈와 Blade](#breeze-and-blade)
    - [브리즈와 Livewire](#breeze-and-livewire)
    - [브리즈와 React / Vue](#breeze-and-inertia)
    - [브리즈와 Next.js / API](#breeze-and-next)
- [라라벨 젯스트림](#laravel-jetstream)

<a name="introduction"></a>
## 소개

새로운 라라벨 애플리케이션을 빠르게 시작할 수 있도록, 라라벨에서는 인증과 애플리케이션 스타터 키트를 제공합니다. 이 스타터 키트는 애플리케이션에서 사용자 등록 및 인증에 필요한 라우트, 컨트롤러, 뷰 등을 자동으로 만들어줍니다.

이러한 스타터 키트의 사용은 필수가 아니며, 원하신다면 라라벨을 처음부터 설치하여 직접 애플리케이션을 만들어갈 수도 있습니다. 어떤 방식을 선택하셔도 멋진 결과물을 만들 수 있을 것이라 믿습니다!

<a name="laravel-breeze"></a>
## 라라벨 브리즈

[라라벨 브리즈](https://github.com/laravel/breeze)는 로그인, 회원가입, 비밀번호 재설정, 이메일 인증, 비밀번호 확인 등 라라벨의 [인증 기능](/docs/11.x/authentication)을 최소한의 간단한 구현으로 제공합니다. 또한 브리즈에는 사용자가 이름, 이메일, 비밀번호를 업데이트할 수 있는 "프로필" 페이지도 포함되어 있습니다.

라라벨 브리즈의 기본 뷰 레이어는 [Blade 템플릿](/docs/11.x/blade)과 [Tailwind CSS](https://tailwindcss.com)로 구성되어 있습니다. 추가로, [Livewire](https://livewire.laravel.com) 또는 [Inertia](https://inertiajs.com)를 기반으로 한 스캐폴딩 방식도 제공하며, Inertia 기반의 경우 Vue 또는 React 중 원하는 것을 선택할 수 있습니다.

<img src="https://laravel.com/img/docs/breeze-register.png" />

#### 라라벨 부트캠프

라라벨을 처음 접하시는 분이라면, [라라벨 부트캠프](https://bootcamp.laravel.com)에 참여해 보시길 권장합니다. 라라벨 부트캠프에서는 브리즈를 활용하여 라라벨 애플리케이션을 처음부터 만들어 보는 과정을 친절히 안내해줍니다. 이를 통해 라라벨과 브리즈가 제공하는 다양한 기능을 짧은 시간 안에 경험할 수 있습니다.

<a name="laravel-breeze-installation"></a>
### 설치

먼저, [새로운 라라벨 애플리케이션을 생성](/docs/11.x/installation)해야 합니다. [라라벨 인스톨러](/docs/11.x/installation#creating-a-laravel-project)로 애플리케이션을 생성하면 설치 과정에서 라라벨 브리즈 설치 여부를 묻는 안내가 표시됩니다. 만약 다른 방식으로 애플리케이션을 만들었다면, 아래의 수동 설치 방법을 따라야 합니다.

이미 스타터 키트 없이 라라벨 애플리케이션을 생성했다면, Composer를 이용해 라라벨 브리즈를 직접 설치할 수 있습니다.

```shell
composer require laravel/breeze --dev
```

Composer로 라라벨 브리즈 패키지 설치를 마친 후, `breeze:install` 아티즌 명령어를 실행해야 합니다. 이 명령어는 인증 관련 뷰, 라우트, 컨트롤러 등 필요한 자원들을 애플리케이션 내에 복사합니다. 브리즈는 모든 코드를 애플리케이션 내로 직접 복사하므로, 각 기능의 구현과 동작 방식을 직접 확인하고 자유롭게 수정할 수 있습니다.

`breeze:install` 명령어를 실행하면 프론트엔드 스택과 테스트 프레임워크에 대한 선호도를 선택할 수 있도록 안내가 나타납니다.

```shell
php artisan breeze:install

php artisan migrate
npm install
npm run dev
```

<a name="breeze-and-blade"></a>
### 브리즈와 Blade

브리즈의 기본 "스택"은 Blade 스택입니다. 이 스택은 직관적이고 간단한 [Blade 템플릿](/docs/11.x/blade)을 사용해 애플리케이션의 프론트엔드를 렌더링합니다. Blade 스택은 특별한 추가 인자 없이 `breeze:install` 명령어 실행 시 Blade 프론트엔드 스택을 선택하면 설치할 수 있습니다. 스캐폴딩이 완료된 후에는 프론트엔드 자산도 함께 빌드해야 합니다.

```shell
php artisan breeze:install

php artisan migrate
npm install
npm run dev
```

설치가 끝나면 웹 브라우저에서 애플리케이션의 `/login` 또는 `/register` 주소로 접속해 볼 수 있습니다. 브리즈에서 사용되는 모든 라우트는 `routes/auth.php` 파일에 정의되어 있습니다.

> [!NOTE]  
> 애플리케이션의 CSS와 JavaScript 컴파일에 대해 더 자세히 알고 싶다면, 라라벨의 [Vite 문서](/docs/11.x/vite#running-vite)를 참고하시기 바랍니다.

<a name="breeze-and-livewire"></a>
### 브리즈와 Livewire

라라벨 브리즈는 [Livewire](https://livewire.laravel.com) 기반의 스캐폴딩도 제공하고 있습니다. Livewire는 PHP만으로 동적이고 반응성 높은 프론트엔드 UI를 만들 수 있게 해 주는 강력한 도구입니다.

Livewire 스택은 Blade 템플릿을 선호하고, Vue나 React 같은 자바스크립트 중심 SPA 프레임워크 대신 좀 더 단순한 솔루션을 찾는 분들에게 적합합니다.

Livewire 스택을 사용하려면 `breeze:install` 아티즌 명령어 실행 시 Livewire 프론트엔드 스택을 선택하시면 됩니다. 브리즈 스캐폴딩이 끝난 후에는 데이터베이스 마이그레이션을 실행해 마무리합니다.

```shell
php artisan breeze:install

php artisan migrate
```

<a name="breeze-and-inertia"></a>
### 브리즈와 React / Vue

라라벨 브리즈는 [Inertia](https://inertiajs.com) 기반으로 React와 Vue 스캐폴딩도 지원합니다. Inertia를 이용하면 전통적인 서버 사이드 라우팅과 컨트롤러 구조를 그대로 유지하면서도, 현대적인 싱글 페이지 React 또는 Vue 애플리케이션을 쉽게 만들 수 있습니다.

Inertia를 사용하면 라라벨의 뛰어난 백엔드 생산성과 [Vite](https://vitejs.dev)로 빌드되는 빠른 프론트엔드(React, Vue)의 장점을 모두 누릴 수 있습니다. Inertia 스택을 사용하려면 `breeze:install` 명령어 실행 시 Vue 또는 React 프론트엔드 스택을 선택하면 됩니다.

만약 Vue 또는 React 프론트엔드 스택을 선택한다면, 브리즈 인스톨러가 [Inertia SSR](https://inertiajs.com/server-side-rendering)과 TypeScript 지원 여부도 함께 물어보게 됩니다. 브리즈 스캐폴딩이 완료된 이후에는 프론트엔드 자산도 빌드해야 합니다.

```shell
php artisan breeze:install

php artisan migrate
npm install
npm run dev
```

설치가 끝나면 웹 브라우저에서 애플리케이션의 `/login` 또는 `/register` 경로로 접속해 볼 수 있습니다. 모든 브리즈 라우트는 `routes/auth.php` 파일에 정의되어 있습니다.

<a name="breeze-and-next"></a>
### 브리즈와 Next.js / API

라라벨 브리즈는 [Next](https://nextjs.org), [Nuxt](https://nuxt.com) 등 현대적인 JavaScript 프레임워크에서 사용할 수 있는 인증 API 스캐폴딩도 지원합니다. 시작하려면 `breeze:install` 아티즌 명령어 실행 시 API 스택을 선택하면 됩니다.

```shell
php artisan breeze:install

php artisan migrate
```

설치하는 과정에서 브리즈가 애플리케이션의 `.env` 파일에 `FRONTEND_URL` 환경 변수를 추가합니다. 이 URL에는 사용하려는 자바스크립트 애플리케이션의 주소를 입력해야 하며, 보통 로컬 개발 환경에서는 `http://localhost:3000`을 사용합니다. 또한 `APP_URL` 역시 `http://localhost:8000`로 설정되어 있는지 확인해야 하며, 이는 기본적으로 `serve` 아티즌 명령어가 사용하는 주소입니다.

<a name="next-reference-implementation"></a>
#### Next.js 참고 구현체

이제 백엔드를 원하는 프론트엔드와 연결할 준비가 완료되었습니다. Breeze 프론트엔드의 Next 참고 구현체는 [GitHub에서 확인하실 수 있습니다](https://github.com/laravel/breeze-next). 이 프론트엔드는 라라벨에서 공식적으로 관리되며, 브리즈의 일반적인 Blade 및 Inertia 스택과 동일한 사용자 인터페이스를 제공합니다.

<a name="laravel-jetstream"></a>
## 라라벨 젯스트림

라라벨 브리즈가 간단하고 미니멀한 시작점이라면, 젯스트림은 보다 강력하고 다양한 기능, 그리고 추가적인 프론트엔드 기술 스택을 통해 브리즈의 역할을 확장합니다. **라라벨이 처음이신 분들은 라라벨 브리즈를 먼저 경험한 뒤, 젯스트림을 도입해 보시길 권장합니다.**

젯스트림은 라라벨에 아름답게 디자인된 애플리케이션 스캐폴딩을 제공하며, 로그인, 회원가입, 이메일 인증, 2단계 인증, 세션 관리, Laravel Sanctum을 통한 API 지원, 선택적인 팀 관리까지 폭넓은 기능을 지원합니다. 젯스트림 역시 [Tailwind CSS](https://tailwindcss.com)로 디자인되어 있으며, [Livewire](https://livewire.laravel.com) 또는 [Inertia](https://inertiajs.com) 기반 프론트엔드 스캐폴딩 중 원하는 방식을 선택할 수 있습니다.

라라벨 젯스트림의 설치 방법과 자세한 기능은 [공식 젯스트림 문서](https://jetstream.laravel.com)에서 확인하실 수 있습니다.
