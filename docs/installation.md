# 설치 (Installation)

- [라라벨 만나기](#meet-laravel)
    - [왜 라라벨인가?](#why-laravel)
- [라라벨 애플리케이션 생성](#creating-a-laravel-project)
    - [PHP 및 라라벨 인스톨러 설치](#installing-php)
    - [애플리케이션 생성](#creating-an-application)
- [초기 설정](#initial-configuration)
    - [환경 기반 설정](#environment-based-configuration)
    - [데이터베이스와 마이그레이션](#databases-and-migrations)
    - [디렉터리 설정](#directory-configuration)
- [Herd를 활용한 설치](#installation-using-herd)
    - [macOS에서 Herd 사용하기](#herd-on-macos)
    - [Windows에서 Herd 사용하기](#herd-on-windows)
- [IDE 지원](#ide-support)
- [다음 단계](#next-steps)
    - [풀스택 프레임워크로서의 라라벨](#laravel-the-fullstack-framework)
    - [API 백엔드로서의 라라벨](#laravel-the-api-backend)

<a name="meet-laravel"></a>
## 라라벨 만나기

라라벨은 표현력 있고 우아한 문법을 갖춘 웹 애플리케이션 프레임워크입니다. 웹 프레임워크는 애플리케이션을 만들기 위한 구조와 출발점을 제공하여, 세부적인 부분은 라라벨이 처리하는 동안 멋진 무언가를 만드는 데 온전히 집중할 수 있도록 도와줍니다.

라라벨은 탁월한 개발자 경험을 제공하는 것을 목표로 하며, 강력한 의존성 주입, 표현력 있는 데이터베이스 추상화 계층, 큐와 예약된 작업, 단위 및 통합 테스트 등 다양한 기능을 지원합니다.

PHP 웹 프레임워크가 처음이든, 오랜 경험을 갖추었든, 라라벨은 여러분과 함께 성장할 수 있는 프레임워크입니다. 웹 개발을 처음 시작한 분에게는 첫 걸음을, 이미 경험 있는 분께는 한 단계 도약할 동력을 제공할 것입니다. 여러분이 만들어갈 것을 저희도 기대하고 있습니다.

<a name="why-laravel"></a>
### 왜 라라벨인가?

웹 애플리케이션을 만들 때 사용할 수 있는 다양한 도구와 프레임워크가 존재합니다. 그러나 저희는 라라벨이 모던한 풀스택 웹 애플리케이션을 개발하는 데 가장 탁월한 선택이라고 믿습니다.

#### 점진적(Progressive) 프레임워크

저희는 라라벨을 "점진적(progressive)" 프레임워크라고 부릅니다. 이는 라라벨이 여러분의 성장 단계에 맞춰 함께 발전한다는 의미입니다. 웹 개발을 처음 시작한다면, 라라벨의 방대한 문서, 가이드, 그리고 [동영상 튜토리얼](https://laracasts.com)이 처음부터 차근차근 안내해 드릴 것입니다.

만약 시니어 개발자라면, 라라벨은 [의존성 주입](/docs/container), [단위 테스트](/docs/testing), [큐](/docs/queues), [실시간 이벤트](/docs/broadcasting) 등 전문가를 위한 강력한 도구를 제공합니다. 라라벨은 전문적인 웹 애플리케이션을 구축할 수 있도록 최적화되어 있으며, 엔터프라이즈 급의 대규모 트래픽도 문제 없이 감당할 수 있습니다.

#### 확장 가능한(Scalable) 프레임워크

라라벨은 확장성이 매우 뛰어납니다. PHP의 확장 친화적인 특성과 라라벨이 기본 제공하는 Redis와 같은 빠르고 분산된 캐시 시스템 덕분에, 라라벨을 활용한 수평적 확장은 매우 간단합니다. 실제로 라라벨 애플리케이션은 월 수억 건의 요청까지도 쉽게 처리할 수 있습니다.

특히 극한의 확장이 필요하다면, [Laravel Cloud](https://cloud.laravel.com)와 같은 플랫폼을 통해 사실상 무제한에 가까운 확장성을 경험하실 수 있습니다.

#### 커뮤니티 중심(Community) 프레임워크

라라벨은 PHP 생태계의 최고의 패키지들을 결합하여, 가장 강력하고 개발자 친화적인 프레임워크를 제공합니다. 전 세계의 수많은 뛰어난 개발자들이 [라라벨 프레임워크에 기여](https://github.com/laravel/framework)해 왔습니다. 여러분도 라라벨 컨트리뷰터가 될 수도 있겠죠.

<a name="creating-a-laravel-project"></a>
## 라라벨 애플리케이션 생성

<a name="installing-php"></a>
### PHP 및 라라벨 인스톨러 설치

라라벨 애플리케이션을 만들기 전에, 먼저 로컬 컴퓨터에 [PHP](https://php.net), [Composer](https://getcomposer.org), 그리고 [라라벨 인스톨러](https://github.com/laravel/installer)가 설치되어 있어야 합니다. 또한, 애플리케이션의 프런트엔드 자산을 컴파일하기 위해 [Node와 NPM](https://nodejs.org) 또는 [Bun](https://bun.sh/) 중 하나를 설치하는 것이 좋습니다.

만약 로컬에 PHP와 Composer가 설치되어 있지 않다면, 아래 명령어들을 실행하여 macOS, Windows, 또는 Linux에서 PHP, Composer, 그리고 라라벨 인스톨러를 설치할 수 있습니다.

```shell tab=macOS
/bin/bash -c "$(curl -fsSL https://php.new/install/mac/8.4)"
```

```shell tab=Windows PowerShell
# Run as administrator...
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://php.new/install/windows/8.4'))
```

```shell tab=Linux
/bin/bash -c "$(curl -fsSL https://php.new/install/linux/8.4)"
```

위 명령어 중 하나를 실행한 후에는 터미널 세션을 다시 시작해야 합니다. `php.new`로 설치한 이후 PHP, Composer, 라라벨 인스톨러를 업데이트하려면, 위 명령어를 터미널에서 다시 실행하면 됩니다.

이미 PHP와 Composer를 설치했다면, Composer를 통해 라라벨 인스톨러를 설치할 수 있습니다.

```shell
composer global require laravel/installer
```

> [!NOTE]
> 시각적이고 다양한 기능을 제공하는 PHP 설치 및 관리 환경이 필요하다면, [Laravel Herd](#installation-using-herd)를 살펴보시기 바랍니다.

<a name="creating-an-application"></a>
### 애플리케이션 생성

PHP, Composer, 라라벨 인스톨러 설치가 끝났다면, 이제 새로운 라라벨 애플리케이션을 생성할 준비가 완료된 것입니다. 라라벨 인스톨러는 선호하는 테스트 프레임워크, 데이터베이스, 스타터 키트 등을 선택하도록 안내할 것입니다.

```shell
laravel new example-app
```

애플리케이션이 생성되면, `dev` Composer 스크립트를 통해 라라벨의 로컬 개발 서버, 큐 워커, Vite 개발 서버를 실행할 수 있습니다.

```shell
cd example-app
npm install && npm run build
composer run dev
```

개발 서버를 시작하면, 웹 브라우저에서 [http://localhost:8000](http://localhost:8000) 주소를 통해 애플리케이션에 접근할 수 있습니다. 이제 [라라벨 생태계로 더 나아갈 준비](#next-steps)가 된 것입니다. 물론, [데이터베이스 설정](#databases-and-migrations)을 먼저 진행해 볼 수도 있습니다.

> [!NOTE]
> 라라벨 애플리케이션 개발을 좀 더 빠르고 편하게 시작하고 싶다면, 라라벨에서 제공하는 [스타터 키트](/docs/starter-kits)를 활용해 보세요. 스타터 키트에는 백엔드 및 프런트엔드 인증에 필요한 기본 뼈대가 모두 포함되어 있습니다.

<a name="initial-configuration"></a>
## 초기 설정

라라벨 프레임워크의 모든 설정 파일은 `config` 디렉터리에 저장되어 있습니다. 각 옵션에는 관련 문서가 상세히 나와 있으니, 파일들을 살펴보며 어떤 옵션들이 있는지 익혀두는 것이 좋습니다.

라라벨은 기본 설정만으로도 바로 개발을 시작할 수 있습니다. 곧바로 개발에 착수해도 괜찮지만, 필요하다면 `config/app.php` 파일과 그 문서를 꼭 한 번 읽어보는 것을 권장합니다. 이 파일에는 `url`, `locale` 등 애플리케이션에 맞게 변경할 수 있는 여러 옵션들이 포함되어 있습니다.

<a name="environment-based-configuration"></a>
### 환경 기반 설정

라라벨의 설정 옵션 값 중 다수는, 애플리케이션이 로컬 컴퓨터에서 실행 중인지, 또는 프로덕션 웹 서버에서 실행 중인지에 따라 달라질 수 있습니다. 그래서 많은 중요한 설정 값들은 애플리케이션 루트에 위치한 `.env` 파일을 통해 정의됩니다.

`.env` 파일은 각 개발자나 서버 환경마다 다르게 설정될 수 있으므로, 절대 소스 관리 시스템에 커밋해서는 안 됩니다. 만약 누군가 소스 저장소에 접근하게 될 경우, 중요한 자격 증명들이 유출될 위험이 있기 때문입니다.

> [!NOTE]
> `.env` 파일과 환경 기반 설정에 대한 보다 자세한 내용은 [설정 문서](/docs/configuration#environment-configuration)를 참고하세요.

<a name="databases-and-migrations"></a>
### 데이터베이스와 마이그레이션

라라벨 애플리케이션을 생성한 후에는, 이제 데이터를 데이터베이스에 저장하고 싶을 것입니다. 기본적으로, 애플리케이션의 `.env` 설정 파일에서는 라라벨이 SQLite 데이터베이스를 사용하도록 지정되어 있습니다.

애플리케이션 생성 시, 라라벨은 자동으로 `database/database.sqlite` 파일을 만들어주며, 필요한 마이그레이션을 실행해서 데이터베이스 테이블을 생성합니다.

MySQL이나 PostgreSQL과 같은 다른 데이터베이스 드라이버를 사용하려면, `.env` 파일에서 적절한 데이터베이스 설정으로 변경하면 됩니다. 예를 들어 MySQL을 사용하고 싶다면, 아래와 같이 `.env` 파일의 `DB_*` 변수를 업데이트합니다.

```ini
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=root
DB_PASSWORD=
```

SQLite 이외의 데이터베이스를 사용하는 경우에는, 직접 데이터베이스를 생성하고 애플리케이션의 [데이터베이스 마이그레이션](/docs/migrations)을 실행해야 합니다.

```shell
php artisan migrate
```

> [!NOTE]
> macOS 또는 Windows에서 로컬로 MySQL, PostgreSQL, Redis 등을 설치하려면 [Herd Pro](https://herd.laravel.com/#plans) 또는 [DBngin](https://dbngin.com/)을 고려해보세요.

<a name="directory-configuration"></a>
### 디렉터리 설정

라라벨 애플리케이션은 항상 웹 서버에 설정된 "웹 디렉터리"의 루트에서 서비스되어야 합니다. "웹 디렉터리"의 하위 폴더에서 라라벨 애플리케이션을 서비스하려고 하면 안 됩니다. 그렇게 할 경우, 애플리케이션 내에 포함된 민감한 파일들이 노출될 수 있습니다.

<a name="installation-using-herd"></a>
## Herd를 활용한 설치

[Laravel Herd](https://herd.laravel.com)는 macOS와 Windows에서 사용할 수 있는 매우 빠른 네이티브 라라벨 및 PHP 개발 환경입니다. Herd에는 라라벨 개발에 필요한 PHP, Nginx 등이 모두 포함되어 있어 바로 개발을 시작할 수 있습니다.

Herd를 설치하면, `php`, `composer`, `laravel`, `expose`, `node`, `npm`, `nvm` 등 다양한 커맨드라인 툴을 즉시 사용할 수 있습니다.

> [!NOTE]
> [Herd Pro](https://herd.laravel.com/#plans)는 로컬 MySQL, Postgres, Redis 데이터베이스 생성 및 관리, 메일 확인, 로그 모니터링 등 강력한 추가 기능을 제공합니다.

<a name="herd-on-macos"></a>
### macOS에서 Herd 사용하기

macOS에서 개발한다면, [Herd 웹사이트](https://herd.laravel.com)에서 인스톨러를 다운로드할 수 있습니다. 인스톨러는 최신 버전의 PHP를 자동으로 받아서 설치하며, Mac에서 [Nginx](https://www.nginx.com/)를 백그라운드로 항상 실행되도록 설정합니다.

macOS용 Herd는 [dnsmasq](https://en.wikipedia.org/wiki/Dnsmasq)를 활용하여 "파킹(parking)"된 디렉터리 기능을 제공합니다. 파킹된 디렉터리 내의 모든 라라벨 애플리케이션은 자동으로 Herd에서 서비스됩니다. 기본적으로 Herd는 `~/Herd` 경로에 파킹 디렉터리를 만들며, 이곳의 모든 라라벨 애플리케이션은 디렉터리 이름을 그대로 `.test` 도메인에서 접근할 수 있습니다.

Herd 설치 후, 라라벨 CLI(명령줄 도구)를 이용해 새로운 애플리케이션을 가장 빠르게 생성할 수 있습니다. 라라벨 CLI는 Herd에 기본 포함되어 있습니다.

```shell
cd ~/Herd
laravel new my-app
cd my-app
herd open
```

물론, Herd 메뉴의 UI를 통해 파킹 디렉터리 및 PHP 설정을 쉽게 관리할 수 있습니다.

Herd에 대한 더 자세한 정보는 [공식 문서](https://herd.laravel.com/docs)에서 확인할 수 있습니다.

<a name="herd-on-windows"></a>
### Windows에서 Herd 사용하기

Windows 용 Herd 인스톨러는 [Herd 웹사이트](https://herd.laravel.com/windows)에서 다운로드 가능합니다. 설치가 완료되면 Herd를 시작하여 온보딩 과정을 마치고 Herd UI(그래픽 인터페이스)를 처음으로 사용할 수 있습니다.

Herd UI는 시스템 트레이의 Herd 아이콘을 왼쪽 클릭하여 접근할 수 있습니다. 우클릭 하면 자주 쓰는 다양한 도구가 포함된 빠른 메뉴가 나타납니다.

설치 중 Herd는 사용자 홈 디렉터리 내 `%USERPROFILE%\Herd` 경로에 "파킹(parking)" 디렉터리를 생성합니다. 이 경로에 있는 모든 라라벨 애플리케이션은 자동으로 Herd를 통해 서비스되며, 해당 디렉터리 이름을 그대로 `.test` 도메인 주소로 사용할 수 있습니다.

Herd 설치 후 라라벨 CLI로 가장 빠르게 새 애플리케이션을 만들 수 있습니다. Powershell을 열고 다음과 같이 입력하세요.

```shell
cd ~\Herd
laravel new my-app
cd my-app
herd open
```

Windows용 Herd에 대한 자세한 내용은 [Herd 공식 문서](https://herd.laravel.com/docs/windows)에서 확인하실 수 있습니다.

<a name="ide-support"></a>
## IDE 지원

라라벨 애플리케이션 개발에는 원하는 어떤 코드 에디터를 사용해도 무방합니다. 그중에서도 [PhpStorm](https://www.jetbrains.com/phpstorm/laravel/)은 라라벨 및 생태계 전반에 대해 뛰어난 지원을 제공하며, [Laravel Pint](https://www.jetbrains.com/help/phpstorm/using-laravel-pint.html) 같은 도구도 손쉽게 사용할 수 있습니다.

또한, 커뮤니티에서 관리하는 [Laravel Idea](https://laravel-idea.com/) PhpStorm 플러그인은 코드 생성, Eloquent 구문 자동완성, 유효성 검증 규칙 자동완성 등 다양한 생산성 향상 기능을 지원합니다.

[Visual Studio Code (VS Code)](https://code.visualstudio.com) 개발자라면, 공식 [Laravel VS Code Extension](https://marketplace.visualstudio.com/items?itemName=laravel.vscode-laravel)를 사용할 수 있습니다. 이 확장 프로그램은 VS Code 환경 내에서 라라벨 개발 생산성을 한층 높여주는 다양한 도구를 제공합니다.

<a name="next-steps"></a>
## 다음 단계

라라벨 애플리케이션을 만들고 나면, 다음으로 무엇을 배워야 할지 궁금하실 수 있습니다. 가장 먼저, 아래 주요 문서를 읽으며 라라벨의 작동 원리를 익혀두는 것을 강력히 추천합니다.

<div class="content-list" markdown="1">

- [요청 라이프사이클](/docs/lifecycle)
- [설정](/docs/configuration)
- [디렉터리 구조](/docs/structure)
- [프런트엔드](/docs/frontend)
- [서비스 컨테이너](/docs/container)
- [파사드(Facades)](/docs/facades)

</div>

라라벨을 어떻게 사용하고 싶은지에 따라, 앞으로의 학습 경로가 달라질 수 있습니다. 라라벨은 다양한 방식으로 활용할 수 있으며, 여기에서 대표적인 두 가지 활용 방식을 안내합니다.

<a name="laravel-the-fullstack-framework"></a>
### 풀스택 프레임워크로서의 라라벨

라라벨은 풀스택 프레임워크로 사용할 수 있습니다. 여기서 "풀스택"이란 라라벨로 라우팅부터 프런트엔드 렌더링(예: [Blade 템플릿](/docs/blade)이나 [Inertia](https://inertiajs.com) 등 SPA 하이브리드 기술 포함)까지 모두 담당하는 것을 뜻합니다. 이것은 라라벨을 활용하는 가장 일반적이고, 저희가 생각하기에 가장 생산적인 방식입니다.

이와 같이 라라벨을 활용할 계획이라면, [프런트엔드 개발](/docs/frontend), [라우팅](/docs/routing), [뷰](/docs/views), [Eloquent ORM](/docs/eloquent)에 대한 문서를 먼저 참고해 보세요. 또한 [Livewire](https://livewire.laravel.com), [Inertia](https://inertiajs.com)와 같은 커뮤니티 패키지에 관심을 가져볼 만합니다. 이들 패키지는 자바스크립트 단일 페이지 애플리케이션이 제공하는 다양한 UI 편의성을 누리면서도, 라라벨을 완전한 풀스택 프레임워크로 사용할 수 있는 길을 열어줍니다.

풀스택 프레임워크 형태로 라라벨을 사용할 계획이라면, [Vite](/docs/vite)를 이용해 애플리케이션의 CSS 및 자바스크립트를 컴파일하는 방법도 꼭 익혀두시기 바랍니다.

> [!NOTE]
> 애플리케이션 개발을 빠르게 시작하고 싶다면, [공식 스타터 키트](/docs/starter-kits)를 활용해 보세요.

<a name="laravel-the-api-backend"></a>
### API 백엔드로서의 라라벨

라라벨은 자바스크립트 단일 페이지 애플리케이션이나 모바일 앱을 위한 API 백엔드로도 사용할 수 있습니다. 예를 들어, 여러분의 [Next.js](https://nextjs.org) 애플리케이션의 백엔드 API로 라라벨을 활용할 수 있습니다. 이 경우, 라라벨로 [인증](/docs/sanctum)과 데이터 저장/조회 기능을 제공하고, 동시에 큐, 이메일, 알림 등 강력한 서비스도 함께 사용할 수 있습니다.

이런 방식으로 라라벨을 활용하고 싶다면, [라우팅](/docs/routing), [Laravel Sanctum](/docs/sanctum), [Eloquent ORM](/docs/eloquent) 관련 문서를 읽어보시길 권장합니다.
