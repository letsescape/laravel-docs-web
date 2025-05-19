---
slug: /
---

# 설치 (Installation)

- [라라벨 만나기](#meet-laravel)
    - [왜 라라벨인가?](#why-laravel)
- [라라벨 애플리케이션 생성하기](#creating-a-laravel-project)
    - [PHP 및 라라벨 인스톨러 설치](#installing-php)
    - [애플리케이션 생성하기](#creating-an-application)
- [초기 설정](#initial-configuration)
    - [환경 기반 설정](#environment-based-configuration)
    - [데이터베이스 및 마이그레이션](#databases-and-migrations)
    - [디렉터리 설정](#directory-configuration)
- [Herd를 이용한 설치](#installation-using-herd)
    - [macOS에서 Herd 사용하기](#herd-on-macos)
    - [Windows에서 Herd 사용하기](#herd-on-windows)
- [IDE 지원](#ide-support)
- [다음 단계](#next-steps)
    - [풀스택 프레임워크로서의 라라벨](#laravel-the-fullstack-framework)
    - [API 백엔드로서의 라라벨](#laravel-the-api-backend)

<a name="meet-laravel"></a>
## 라라벨 만나기

라라벨은 표현력이 뛰어나고 우아한 문법을 제공하는 웹 애플리케이션 프레임워크입니다. 웹 프레임워크는 애플리케이션을 만들 때 활용할 수 있는 구조와 출발점을 제공하므로, 복잡한 세부 사항에 신경 쓰지 않고도 멋진 기능 개발에 집중할 수 있습니다.

라라벨은 강력한 의존성 주입, 표현적인 데이터베이스 추상화 계층, 큐와 예약 작업, 단위 및 통합 테스트 등 다양한 강력한 기능과 함께, 개발자에게 뛰어난 경험을 제공하는 것을 목표로 합니다.

PHP 웹 프레임워크를 처음 접하는 분이든, 이미 경험이 많은 분이든 라라벨은 여러분의 성장 단계에 맞춰 발전할 수 있는 프레임워크입니다. 라라벨은 웹 개발자로 첫걸음을 내딛는 분들에게도 든든한 안내자가 되어주며, 여러분이 전문성을 또 한 단계 성장시킬 때에도 큰 도움이 될 것입니다. 여러분이 어떤 멋진 결과물을 만들어 낼지 저희도 기대하고 있습니다.

<a name="why-laravel"></a>
### 왜 라라벨인가?

웹 애플리케이션을 개발할 때 사용할 수 있는 다양한 도구와 프레임워크가 있습니다. 하지만 저희는 라라벨이 모던한 풀스택 웹 애플리케이션 개발에 가장 적합한 선택이라고 생각합니다.

#### 진화하는 프레임워크

저희는 라라벨을 "진화형(progressive)" 프레임워크라 부르곤 합니다. 이는 라라벨이 여러분과 함께 성장한다는 의미입니다. 웹 개발을 처음 시작하는 분이라면 방대한 문서, 가이드, [비디오 튜토리얼](https://laracasts.com)을 통해 부담 없이 기본기를 익힐 수 있습니다.

경력이 많은 시니어 개발자에게는 [의존성 주입](/docs/12.x/container), [단위 테스트](/docs/12.x/testing), [큐](/docs/12.x/queues), [실시간 이벤트](/docs/12.x/broadcasting) 등 다양한 강력한 도구를 제공합니다. 라라벨은 전문적인 웹 애플리케이션 개발에 특화되어 있으며, 대규모 엔터프라이즈 환경도 문제 없이 처리할 수 있습니다.

#### 확장 가능한 프레임워크

라라벨은 아주 높은 확장성을 자랑합니다. PHP의 확장에 유리한 특성과, Redis와 같은 빠른 분산 캐시 시스템을 기본 지원하는 라라벨 덕분에 수평 확장이 매우 쉽습니다. 실제로 라라벨 애플리케이션은 한 달에 수억 건 이상의 요청 처리로 손쉽게 확장된 사례가 있습니다.

극단적인 확장성까지 필요하다면 [Laravel Cloud](https://cloud.laravel.com)와 같은 플랫폼을 통해 라라벨 애플리케이션을 거의 제한 없이 확장할 수 있습니다.

#### 커뮤니티 중심의 프레임워크

라라벨은 PHP 생태계에서 최고의 패키지들을 결합하여, 가장 견고하고 개발자 친화적인 프레임워크를 제공합니다. 전 세계 수천 명의 유능한 개발자들이 [라라벨 프레임워크에 기여](https://github.com/laravel/framework)하고 있습니다. 어쩌면 여러분도 미래의 라라벨 컨트리뷰터가 될 수 있습니다.

<a name="creating-a-laravel-project"></a>
## 라라벨 애플리케이션 생성하기

<a name="installing-php"></a>
### PHP 및 라라벨 인스톨러 설치

처음으로 라라벨 애플리케이션을 만들기 전에, 여러분의 로컬 환경에 [PHP](https://php.net), [Composer](https://getcomposer.org), 그리고 [라라벨 인스톨러](https://github.com/laravel/installer)가 설치되어 있는지 확인하세요. 또한, 프론트엔드 에셋 빌드를 위해 [Node와 NPM](https://nodejs.org) 또는 [Bun](https://bun.sh/) 중 하나도 설치해야 합니다.

만약 PHP와 Composer가 아직 설치되어 있지 않다면, 아래의 명령어를 실행하여 macOS, Windows, Linux에 PHP, Composer, 라라벨 인스톨러를 한 번에 설치할 수 있습니다:

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

위 명령어 중 하나를 실행한 뒤에는 터미널 세션을 재시작해야 합니다. 설치 후 PHP, Composer, 라라벨 인스톨러를 최신 버전으로 업데이트하고 싶다면, 위의 명령어를 다시 실행하면 됩니다.

이미 PHP와 Composer가 설치된 환경이라면, Composer를 통해 라라벨 인스톨러를 설치할 수 있습니다:

```shell
composer global require laravel/installer
```

> [!NOTE]
> 완성도 높은 그래픽 기반의 PHP 설치 및 관리 환경을 원하신다면 [Laravel Herd](#installation-using-herd)를 참고해보세요.

<a name="creating-an-application"></a>
### 애플리케이션 생성하기

PHP, Composer, 라라벨 인스톨러 설치가 끝났다면, 이제 새로운 라라벨 애플리케이션을 생성할 수 있습니다. 라라벨 인스톨러는 테스트 프레임워크, 데이터베이스, 스타터 키트 선택도 함께 안내합니다:

```shell
laravel new example-app
```

애플리케이션이 생성된 후에는 `dev` Composer 스크립트를 사용해 라라벨의 로컬 개발 서버, 큐 워커, Vite 개발 서버를 시작할 수 있습니다:

```shell
cd example-app
npm install && npm run build
composer run dev
```

개발 서버가 정상 동작하면, 웹 브라우저에서 [http://localhost:8000](http://localhost:8000) 주소로 애플리케이션에 접근할 수 있습니다. 이제 [라라벨 생태계의 다음 단계](#next-steps)를 시작할 준비가 된 것입니다. 물론, [데이터베이스 설정](#databases-and-migrations)도 진행할 수 있습니다.

> [!NOTE]
> 라라벨 애플리케이션을 빠르게 시작하고 싶으시다면 [스타터 키트](/docs/12.x/starter-kits)를 활용하세요. 라라벨의 스타터 키트는 새로운 애플리케이션을 위한 백엔드 및 프론트엔드 인증 기본 구성을 제공합니다.

<a name="initial-configuration"></a>
## 초기 설정

라라벨 프레임워크의 모든 설정 파일은 `config` 디렉터리에 저장되어 있습니다. 각 옵션은 별도의 문서가 첨부되어 있으니, 파일을 살펴보고 여러 설정 옵션을 확인해 보시기 바랍니다.

라라벨은 기본적으로 특별한 추가 설정 없이 바로 사용할 수 있습니다. 바로 개발을 시작해도 무방하지만, `config/app.php` 파일과 해당 항목의 문서를 한 번쯤 검토하실 것을 추천합니다. 이 파일 안의 `url`, `locale` 등은 애플리케이션에 맞게 변경할 수 있는 대표적인 주요 옵션입니다.

<a name="environment-based-configuration"></a>
### 환경 기반 설정

라라벨의 많은 설정값은 애플리케이션이 로컬 환경에서 실행되는지, 프로덕션 서버에서 동작하는지에 따라 달라질 수 있기 때문에, 중요한 설정값 다수는 애플리케이션 루트에 위치한 `.env` 파일에 정의되어 있습니다.

`.env` 파일은 애플리케이션의 소스 제어 시스템(버전 관리)에 커밋하지 않는 것이 좋습니다. 개발자나 서버마다 서로 다른 환경 설정이 필요할 수 있기 때문입니다. 또한, 만약 소스 저장소가 침해될 경우 중요한 인증 정보가 노출될 수 있으므로, 보안 측면에서도 반드시 예외 없이 제외해야 합니다.

> [!NOTE]
> `.env` 파일과 환경별 설정에 관한 자세한 내용은 [설정 문서 전체](/docs/12.x/configuration#environment-configuration)를 참고하세요.

<a name="databases-and-migrations"></a>
### 데이터베이스 및 마이그레이션

이제 라라벨 애플리케이션을 생성했으니 데이터를 데이터베이스에 저장하고 싶을 것입니다. 기본적으로, 애플리케이션의 `.env` 설정 파일에는 라라벨이 SQLite 데이터베이스를 사용하도록 설정되어 있습니다.

애플리케이션 생성 시 라라벨은 `database/database.sqlite` 파일을 자동으로 만들고, 필요한 마이그레이션을 실행해 테이블도 준비해줍니다.

만약 MySQL이나 PostgreSQL 같은 다른 데이터베이스 드라이버를 사용하고 싶다면, 적절한 데이터베이스로 `.env` 설정 파일을 수정하세요. 예를 들어, MySQL을 사용하고 싶다면 `.env`의 `DB_*` 변수를 다음과 같이 변경합니다:

```ini
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=root
DB_PASSWORD=
```

SQLite가 아닌 데이터베이스를 선택했다면, 반드시 데이터베이스 생성과 마이그레이션 실행을 직접 해야 합니다:

```shell
php artisan migrate
```

> [!NOTE]
> macOS 또는 Windows 환경에서 MySQL, PostgreSQL, Redis 등을 로컬에 설치해야 한다면 [Herd Pro](https://herd.laravel.com/#plans) 또는 [DBngin](https://dbngin.com/)을 고려해보세요.

<a name="directory-configuration"></a>
### 디렉터리 설정

라라벨 애플리케이션은 웹 서버의 "웹 디렉터리" 루트에서 반드시 서비스되어야 합니다. "웹 디렉터리"의 하위 디렉터리에서 라라벨 애플리케이션을 서비스하려고 시도해서는 안 됩니다. 그렇게 하면 애플리케이션의 민감한 파일이 외부에 노출될 수 있습니다.

<a name="installation-using-herd"></a>
## Herd를 이용한 설치

[Laravel Herd](https://herd.laravel.com)는 macOS와 Windows에서 사용할 수 있는 아주 빠르고, 라라벨과 PHP 개발 환경에 특화된 토종(네이티브) 툴입니다. Herd에는 PHP와 Nginx 등 라라벨 개발에 필요한 모든 것이 포함되어 있어 손쉽게 시작할 수 있습니다.

Herd를 설치하면 바로 라라벨 개발을 시작할 수 있습니다. Herd는 `php`, `composer`, `laravel`, `expose`, `node`, `npm`, `nvm` 명령줄 도구도 함께 제공합니다.

> [!NOTE]
> [Herd Pro](https://herd.laravel.com/#plans)는 Herd의 기능을 확장하여 로컬 MySQL, Postgres, Redis 데이터베이스를 생성·관리하거나, 로컬 메일 보기 및 로그 모니터링 등 고급 기능도 제공합니다.

<a name="herd-on-macos"></a>
### macOS에서 Herd 사용하기

macOS에서 개발한다면 [Herd 공식 웹사이트](https://herd.laravel.com)에서 설치 프로그램을 다운로드할 수 있습니다. 설치 프로그램은 최신 버전의 PHP를 자동으로 내려받아서 Mac에서 [Nginx](https://www.nginx.com/)가 항상 백그라운드에서 동작하도록 설정해줍니다.

macOS용 Herd는 [dnsmasq](https://en.wikipedia.org/wiki/Dnsmasq)를 사용하여 "파킹(parked)" 디렉터리를 지원합니다. 파킹된 디렉터리 안의 라라벨 애플리케이션은 Herd가 자동으로 서비스합니다. 기본적으로 Herd는 `~/Herd`에 파킹 디렉터리를 만들며, 이 디렉터리 내의 모든 라라벨 애플리케이션은 디렉터리 이름에 `.test` 도메인을 조합해 바로 접근할 수 있습니다.

Herd 설치 후 가장 빠르게 라라벨 애플리케이션을 만드는 방법은, Herd에 포함된 라라벨 CLI를 이용하는 것입니다:

```shell
cd ~/Herd
laravel new my-app
cd my-app
herd open
```

물론, Herd의 UI를 통해 파킹된 디렉터리 및 기타 PHP 설정을 관리할 수도 있으며, 시스템 트레이의 Herd 메뉴에서 쉽게 열 수 있습니다.

Herd에 대해 더 알아보고 싶다면 [공식 문서](https://herd.laravel.com/docs)를 참고하세요.

<a name="herd-on-windows"></a>
### Windows에서 Herd 사용하기

Windows에서도 [Herd 공식 웹사이트](https://herd.laravel.com/windows)에서 설치 프로그램을 내려받을 수 있습니다. 설치가 끝난 뒤 Herd를 실행하여 초기 세팅을 마치고, Herd UI에 처음 접근할 수 있습니다.

Herd UI는 시스템 트레이에서 Herd 아이콘을 왼쪽 클릭하면 열립니다. 우클릭하면 필수 도구에 바로 접근할 수 있는 빠른 메뉴가 표시됩니다.

설치 과정에서 Herd는 홈 디렉터리의 `%USERPROFILE%\Herd`에 "파킹" 디렉터리를 생성합니다. 파킹된 디렉터리 내의 라라벨 애플리케이션은 자동으로 서비스되고, 해당 디렉터리 이름에 `.test` 도메인을 조합해 바로 접근할 수 있습니다.

Herd 설치 후 라라벨 애플리케이션을 만드는 가장 빠른 방법은, Herd에 포함된 라라벨 CLI를 활용하는 것입니다. Powershell에서 다음 명령어를 실행하세요:

```shell
cd ~\Herd
laravel new my-app
cd my-app
herd open
```

Windows용 Herd에 관해 더 자세히 알고 싶으시면 [공식 문서](https://herd.laravel.com/docs/windows)를 참고해주세요.

<a name="ide-support"></a>
## IDE 지원

라라벨 애플리케이션 개발에는 원하는 코드 에디터를 자유롭게 사용할 수 있습니다. 그중에서도 [PhpStorm](https://www.jetbrains.com/phpstorm/laravel/)은 라라벨 및 생태계에 대한 높은 지원도를 제공하며, [Laravel Pint](https://www.jetbrains.com/help/phpstorm/using-laravel-pint.html)도 포함되어 있습니다.

또한, 커뮤니티에서 관리하는 [Laravel Idea](https://laravel-idea.com/) PhpStorm 플러그인은 코드 생성, Eloquent 문법 자동완성, 유효성 검증 규칙 자동완성 등 다양한 IDE 확장 기능을 제공합니다.

[Visual Studio Code (VS Code)](https://code.visualstudio.com) 사용자라면, 공식 [Laravel VS Code Extension](https://marketplace.visualstudio.com/items?itemName=laravel.vscode-laravel)도 사용할 수 있습니다. 이 확장 프로그램은 라라벨에 특화된 여러 도구를 VS Code 내에 바로 제공하여 생산성을 높여줍니다.

<a name="next-steps"></a>
## 다음 단계

이제 라라벨 애플리케이션을 만들었으니, 다음엔 무엇을 익혀야 할지 궁금하실 수 있습니다. 먼저, 라라벨이 어떻게 동작하는지 이해를 높이기 위해 아래 문서를 읽어보시길 강력히 권장합니다.

<div class="content-list" markdown="1">

- [요청 라이프사이클](/docs/12.x/lifecycle)
- [설정](/docs/12.x/configuration)
- [디렉터리 구조](/docs/12.x/structure)
- [프론트엔드](/docs/12.x/frontend)
- [서비스 컨테이너](/docs/12.x/container)
- [파사드](/docs/12.x/facades)

</div>

라라벨을 어떻게 활용할 것인지에 따라 여러분의 다음 여정에도 차이가 생깁니다. 라라벨은 여러 방식으로 사용할 수 있으며, 아래에서는 대표적인 두 가지 활용 케이스를 소개합니다.

<a name="laravel-the-fullstack-framework"></a>
### 풀스택 프레임워크로서의 라라벨

라라벨은 풀스택 프레임워크로 동작할 수 있습니다. 여기서 "풀스택"이란, 라라벨이 요청을 애플리케이션에 라우팅하고, [Blade 템플릿](/docs/12.x/blade) 또는 [Inertia](https://inertiajs.com)와 같은 싱글 페이지 애플리케이션 하이브리드 기술로 프론트엔드를 렌더링하는 방식을 의미합니다. 라라벨을 활용하는 가장 일반적이면서도 생산적인 사용 방법입니다.

이런 방식으로 라라벨을 사용하고자 한다면, [프론트엔드 개발](/docs/12.x/frontend), [라우팅](/docs/12.x/routing), [뷰](/docs/12.x/views), [Eloquent ORM](/docs/12.x/eloquent) 문서를 참고해보세요. 또한, [Livewire](https://livewire.laravel.com), [Inertia](https://inertiajs.com)와 같은 커뮤니티 패키지를 활용해 라라벨을 풀스택 프레임워크로 사용하면서도 싱글 페이지 JavaScript 애플리케이션의 다양한 UI 이점을 누릴 수 있습니다.

풀스택 프레임워크로 라라벨을 사용한다면, [Vite](/docs/12.x/vite)를 활용하여 CSS 및 JavaScript를 컴파일하는 방법도 꼭 익혀두시기 바랍니다.

> [!NOTE]
> 애플리케이션을 빠르게 시작하고 싶다면, 공식 [애플리케이션 스타터 키트](/docs/12.x/starter-kits)도 활용할 수 있습니다.

<a name="laravel-the-api-backend"></a>
### API 백엔드로서의 라라벨

라라벨은 JavaScript 싱글 페이지 애플리케이션, 모바일 앱 등을 위한 API 백엔드로도 사용할 수 있습니다. 예를 들어, [Next.js](https://nextjs.org) 애플리케이션의 API 백엔드로 라라벨을 사용할 수 있습니다. 이런 상황에서는 라라벨을 통해 애플리케이션의 [인증](/docs/12.x/sanctum)과 데이터 저장/조회 기능을 제공하고, 큐, 이메일, 알림 등 강력한 서비스를 함께 이용할 수 있습니다.

이처럼 라라벨을 API 백엔드로 활용한다면, [라우팅](/docs/12.x/routing), [Laravel Sanctum](/docs/12.x/sanctum), [Eloquent ORM](/docs/12.x/eloquent) 관련 문서를 참고해보세요.
