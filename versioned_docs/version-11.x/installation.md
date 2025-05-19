---
slug: /
---

# 설치 (Installation)

- [라라벨 만나보기](#meet-laravel)
    - [왜 라라벨인가?](#why-laravel)
- [라라벨 애플리케이션 만들기](#creating-a-laravel-project)
    - [PHP와 라라벨 인스톨러 설치](#installing-php)
    - [애플리케이션 생성](#creating-an-application)
- [초기 설정](#initial-configuration)
    - [환경 기반 설정](#environment-based-configuration)
    - [데이터베이스와 마이그레이션](#databases-and-migrations)
    - [디렉터리 설정](#directory-configuration)
- [Herd를 이용한 로컬 설치](#local-installation-using-herd)
    - [macOS에서 Herd 사용하기](#herd-on-macos)
    - [Windows에서 Herd 사용하기](#herd-on-windows)
- [Sail을 이용한 Docker 설치](#docker-installation-using-sail)
    - [macOS에서 Sail 사용하기](#sail-on-macos)
    - [Windows에서 Sail 사용하기](#sail-on-windows)
    - [Linux에서 Sail 사용하기](#sail-on-linux)
    - [Sail 서비스 선택하기](#choosing-your-sail-services)
- [IDE 지원](#ide-support)
- [다음 단계](#next-steps)
    - [라라벨: 풀스택 프레임워크](#laravel-the-fullstack-framework)
    - [라라벨: API 백엔드](#laravel-the-api-backend)

<a name="meet-laravel"></a>
## 라라벨 만나보기

라라벨(Laravel)은 표현력이 뛰어나고 우아한 문법을 가진 웹 애플리케이션 프레임워크입니다. 웹 프레임워크란 애플리케이션 개발을 위한 구조와 출발점을 제공해 주어, 여러분이 세부적인 부분에 신경 쓰지 않고도 멋진 것을 만드는 데 집중할 수 있도록 돕는 역할을 합니다.

라라벨은 탁월한 개발자 경험을 제공하는 데 목표를 두고 있으며, 강력한 의존성 주입, 표현력 높은 데이터베이스 추상화 레이어, 큐 및 예약된 작업, 단위 테스트와 통합 테스트 등 다양한 강력한 기능을 제공합니다.

PHP 웹 프레임워크가 처음이든, 여러 해의 경험이 있는 개발자이든 라라벨은 여러분과 함께 성장할 수 있는 프레임워크입니다. 여러분이 처음 웹 개발을 시작하는 분이든, 이미 전문가로서 더 높은 곳을 바라보고 있다면 라라벨이 든든한 지원군이 되어줄 것입니다. 여러분이 어떤 것을 만들어낼지 저희도 기대하고 있습니다.

> [!NOTE]  
> 라라벨이 처음이신가요? [라라벨 부트캠프(Laravel Bootcamp)](https://bootcamp.laravel.com)에서 실습을 통해 라라벨 프레임워크와 첫 애플리케이션 만들기를 단계별로 배워보세요.

<a name="why-laravel"></a>
### 왜 라라벨인가?

웹 애플리케이션 개발을 위한 다양한 도구와 프레임워크가 있지만, 라라벨은 현대적인 풀스택 웹 애플리케이션 개발에 최적화된 최고의 선택이라고 자부합니다.

#### 점진적(Progressive) 프레임워크

라라벨을 "점진적(progressive)" 프레임워크라고 부릅니다. 이는 라라벨이 여러분의 성장에 맞춰 함께 성장한다는 뜻입니다. 웹 개발에 처음 입문한다면 라라벨의 방대한 문서, 다양한 가이드, 그리고 [비디오 튜토리얼](https://laracasts.com)을 통해 어렵지 않게 기초부터 배울 수 있습니다.

만약 숙련된 개발자라면, 라라벨은 [의존성 주입](/docs/11.x/container), [단위 테스트](/docs/11.x/testing), [큐](/docs/11.x/queues), [실시간 이벤트](/docs/11.x/broadcasting) 등 전문적인 개발을 위한 강력한 도구를 제공합니다. 라라벨은 전문적인 웹 애플리케이션 구축과 엔터프라이즈(기업)급 처리량을 감당할 수 있도록 세심하게 다듬어졌습니다.

#### 확장성 있는(Scalable) 프레임워크

라라벨은 매우 높은 확장성을 자랑합니다. PHP의 확장성 친화적 특성과 라라벨에 내장된 Redis와 같은 빠르고 분산된 캐시 시스템 지원 덕분에, 라라벨로 수평 확장(서버 여러 대 적용)이 매우 간단합니다. 실제로 라라벨 애플리케이션은 한 달에 수억 건의 요청도 무리 없이 처리할 수 있습니다.

기존 한계를 넘어선 극한의 확장성이 필요하다면, [라라벨 베이퍼(Laravel Vapor)](https://vapor.laravel.com)와 같은 플랫폼을 통해 AWS의 최신 서버리스 기술 위에서 사실상 무제한에 가까운 확장성을 경험할 수 있습니다.

#### 커뮤니티 프레임워크

라라벨은 PHP 생태계에서 최고의 패키지들을 결합하여, 가장 견고하고 개발자 친화적인 프레임워크를 제공합니다. 그리고, 세계 각지의 수많은 재능 있는 개발자들이 [라라벨 프레임워크에 기여](https://github.com/laravel/framework)해 왔습니다. 어쩌면, 여러분도 언젠가는 라라벨에 기여하는 개발자가 될 수 있습니다.

<a name="creating-a-laravel-project"></a>
## 라라벨 애플리케이션 만들기

<a name="installing-php"></a>
### PHP와 라라벨 인스톨러 설치

먼저 라라벨 애플리케이션을 만들기 전에, 여러분의 로컬 머신에 [PHP](https://php.net), [Composer](https://getcomposer.org), 그리고 [라라벨 인스톨러](https://github.com/laravel/installer)가 설치되어 있는지 확인해야 합니다. 또한, 프론트엔드 자산을 컴파일하기 위해 [Node와 NPM](https://nodejs.org) 또는 [Bun](https://bun.sh/)도 설치해야 합니다.

만약 아직 PHP와 Composer가 설치되어 있지 않다면, 아래 명령어를 통해 macOS, Windows, 또는 Linux에서 PHP, Composer, 그리고 라라벨 인스톨러를 한 번에 설치할 수 있습니다:

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

위 명령어 중 하나를 실행했다면, 터미널 세션을 재시작해 주세요. `php.new`를 통해 설치한 뒤 PHP, Composer, 라라벨 인스톨러를 업그레이드하고 싶을 경우에는 다시 해당 명령어를 실행하면 됩니다.

이미 PHP와 Composer가 설치되어 있다면, Composer를 통해 라라벨 인스톨러를 설치할 수 있습니다:

```shell
composer global require laravel/installer
```

> [!NOTE]
> 완전한 기능의 그래픽 기반 PHP 설치/관리 환경을 원하신다면 [라라벨 Herd](#local-installation-using-herd)를 참고해 주세요.

<a name="creating-an-application"></a>
### 애플리케이션 생성

PHP, Composer, 라라벨 인스톨러 설치가 끝났다면 이제 새 라라벨 애플리케이션을 만들 준비가 되었습니다. 라라벨 인스톨러는 사용자의 선호에 따라 테스트 프레임워크, 데이터베이스, 스타터 키트(Starter Kit) 선택을 안내합니다:

```nothing
laravel new example-app
```

애플리케이션을 생성한 후에는, `dev` Composer 스크립트를 이용해 라라벨의 로컬 개발 서버, 큐 워커, Vite 개발 서버를 함께 실행할 수 있습니다:

```nothing
cd example-app
npm install && npm run build
composer run dev
```

개발 서버를 실행한 뒤에는 웹 브라우저에서 [http://localhost:8000](http://localhost:8000)에서 애플리케이션을 확인할 수 있습니다. 이제 [라라벨 생태계를 더 깊게 탐색](#next-steps)할 준비가 되었습니다. 물론 [데이터베이스를 설정](#databases-and-migrations)하고 싶을 수도 있습니다.

> [!NOTE]  
> 라라벨 개발을 더 빠르게 시작하고 싶다면 [Starter Kit](/docs/11.x/starter-kits) 중 하나를 사용하는 것이 좋습니다. 라라벨의 Starter Kit은 새로운 라라벨 애플리케이션에 백엔드, 프론트엔드 인증 스캐폴딩을 제공합니다.

<a name="initial-configuration"></a>
## 초기 설정

라라벨 프레임워크의 모든 설정 파일은 `config` 디렉터리에 저장되어 있습니다. 각 설정 옵션에는 자세한 주석이 달려 있으니, 파일을 직접 열어 원하는 옵션과 구조를 익혀 보는 것이 좋습니다.

라라벨은 설치 직후 별도의 추가 설정 없이도 바로 개발할 수 있습니다. 개발을 바로 시작해도 무방합니다! 다만, `config/app.php` 파일과 그 문서를 한 번 살펴보고, `url`과 `locale` 등 몇 가지 옵션을 상황에 맞게 수정하는 것을 추천합니다.

<a name="environment-based-configuration"></a>
### 환경 기반 설정

라라벨의 많은 설정 옵션 값은 애플리케이션이 로컬 개발 환경인지, 운영 서버인지에 따라 달라질 수 있으므로, 여러 중요한 설정 값들은 애플리케이션 루트에 존재하는 `.env` 파일을 통해 정의됩니다.

`.env` 파일은 각 개발자나 서버가 상황에 맞는 환경설정 값을 가질 수 있도록, 소스 제어(버전 관리 시스템)에는 포함하지 않아야 합니다. 만약 소스 제어에 커밋된다면, 외부 침입자가 저장소에 접근할 경우 중요한 인증 정보들이 노출될 위험이 있습니다.

> [!NOTE]  
> `.env` 파일과 환경 기반 설정에 대해 더 자세한 정보는 [설정 문서](/docs/11.x/configuration#environment-configuration)에서 확인할 수 있습니다.

<a name="databases-and-migrations"></a>
### 데이터베이스와 마이그레이션

라라벨 애플리케이션을 만들었다면, 이제 데이터를 저장하기 위한 데이터베이스가 필요할 것 입니다. 기본적으로, 애플리케이션의 `.env` 설정 파일은 SQLite 데이터베이스를 사용하도록 지정되어 있습니다.

애플리케이션 생성 시, 라라벨은 자동으로 `database/database.sqlite` 파일을 만들어 주며, 애플리케이션에 필요한 데이터베이스 테이블 생성을 위한 마이그레이션도 실행해 줍니다.

MySQL이나 PostgreSQL 등 다른 데이터베이스를 사용하고 싶다면, `.env` 파일의 설정을 해당 데이터베이스에 맞게 변경하면 됩니다. 예를 들어 MySQL을 사용하려면, `.env` 파일의 `DB_*` 변수들을 다음과 같이 수정합니다:

```ini
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=root
DB_PASSWORD=
```

SQLite가 아닌 다른 데이터베이스를 선택한 경우에는 데이터베이스를 직접 생성한 뒤, 애플리케이션의 [데이터베이스 마이그레이션](/docs/11.x/migrations)을 실행해야 합니다:

```shell
php artisan migrate
```

> [!NOTE]  
> macOS나 Windows에서 MySQL, PostgreSQL, Redis를 로컬에 설치해야 한다면 [Herd Pro](https://herd.laravel.com/#plans) 사용을 고려해 보세요.

<a name="directory-configuration"></a>
### 디렉터리 설정

라라벨은 항상 웹 서버의 "웹 디렉터리" 루트에서 서비스되어야 합니다. 웹 디렉터리의 하위 디렉터리에서 라라벨 애플리케이션을 서비스하려고 해서는 안 됩니다. 그렇게 하면 애플리케이션 내의 민감한 파일들이 외부로 노출될 수 있습니다.

<a name="local-installation-using-herd"></a>
## Herd를 이용한 로컬 설치

[라라벨 Herd](https://herd.laravel.com)는 macOS와 Windows용으로 개발된 매우 빠르고 네이티브한 라라벨, PHP 개발 환경입니다. Herd에는 PHP와 Nginx 등 라라벨 개발을 시작하는 데 필요한 모든 것이 포함되어 있습니다.

Herd를 설치하면 바로 라라벨 개발을 시작할 수 있습니다. Herd는 `php`, `composer`, `laravel`, `expose`, `node`, `npm`, `nvm` 등 커맨드라인 도구를 함께 제공합니다.

> [!NOTE]  
> [Herd Pro](https://herd.laravel.com/#plans)를 사용하면 추가 기능(로컬 MySQL/Postgres/Redis 데이터베이스 생성, 로컬 메일 뷰어, 로그 모니터링 등)이 제공됩니다.

<a name="herd-on-macos"></a>
### macOS에서 Herd 사용하기

macOS에서 개발한다면, [Herd 웹사이트](https://herd.laravel.com)에서 인스톨러를 다운로드할 수 있습니다. 인스톨러는 최신 버전의 PHP를 자동으로 다운로드하고, Mac에서 [Nginx](https://www.nginx.com/)가 항상 백그라운드에서 실행되도록 설정해줍니다.

macOS용 Herd는 [dnsmasq](https://en.wikipedia.org/wiki/Dnsmasq)를 이용해 "파킹된(parked)" 디렉터리를 지원합니다. 파킹된 디렉터리에 있는 모든 라라벨 애플리케이션은 Herd에 의해 자동 서비스됩니다. 기본적으로 Herd는 `~/Herd`에 파킹 디렉터리를 생성하며, 이 디렉터리의 애플리케이션은 디렉터리 이름을 통해 `.test` 도메인으로 접근할 수 있습니다.

Herd를 설치한 후, 새 라라벨 애플리케이션을 만드는 가장 빠른 방법은 Herd에 포함된 라라벨 CLI를 사용하는 것입니다:

```nothing
cd ~/Herd
laravel new my-app
cd my-app
herd open
```

파킹 디렉터리 관리나 기타 PHP 설정은 시스템 트레이의 Herd 메뉴에서 언제든 UI로 쉽게 관리할 수 있습니다.

Herd에 대해 더 자세한 내용은 [Herd 공식 문서](https://herd.laravel.com/docs)를 참고하세요.

<a name="herd-on-windows"></a>
### Windows에서 Herd 사용하기

Windows용 Herd 인스톨러는 [Herd 웹사이트](https://herd.laravel.com/windows)에서 다운로드할 수 있습니다. 설치가 완료되면 Herd를 실행하여 온보딩 과정을 마치고, 처음으로 Herd UI를 사용할 수 있습니다.

Herd UI는 시스템 트레이의 Herd 아이콘을 왼쪽 클릭하여 열 수 있습니다. 오른쪽 클릭 시에는 매일 필요로 하는 각종 도구에 접근할 수 있는 빠른 메뉴가 나타납니다.

설치 과정에서 Herd는 홈 디렉터리 내에 `%USERPROFILE%\Herd` 파킹 디렉터리를 생성합니다. 이 파킹 디렉터리에 있는 어떤 라라벨 애플리케이션이라도 Herd에 의해 자동 서비스되며, 해당 디렉터리 이름으로 `.test` 도메인에서 접속할 수 있게 됩니다.

설치 이후, 새 라라벨 애플리케이션을 만드는 가장 빠른 방법은 함께 제공되는 라라벨 CLI를 사용하는 것입니다. PowerShell을 열고 다음 명령어를 입력해 시작할 수 있습니다:

```nothing
cd ~\Herd
laravel new my-app
cd my-app
herd open
```

Windows용 Herd에 대한 더 자세한 내용은 [Herd Windows 문서](https://herd.laravel.com/docs/windows)를 참고하세요.

<a name="docker-installation-using-sail"></a>
## Sail을 이용한 Docker 설치

운영체제에 관계없이 라라벨을 쉽게 시작할 수 있도록, 로컬에서 라라벨 애플리케이션을 개발/실행하는 다양한 방법을 제공합니다. 나중에 여러 선택지를 더 탐색해 볼 수도 있지만, 라라벨은 [Sail](/docs/11.x/sail)이라는 자체 Docker 기반 솔루션을 기본 제공하고 있습니다.

Docker는 각종 응용 프로그램·서비스를 가볍고 독립적인 "컨테이너" 안에서 실행하는 도구입니다. 이 방식은 여러분의 로컬 환경에 별도의 웹 서버, 데이터베이스 등 복잡한 개발 도구 설치/설정이 필요 없다는 뜻입니다. 시작하려면 [Docker Desktop](https://www.docker.com/products/docker-desktop)만 설치하면 됩니다.

라라벨 Sail은 라라벨의 기본 Docker 설정을 편하게 다룰 수 있게 해주는 가벼운 커맨드라인 인터페이스입니다. Sail을 사용하면 Docker에 대한 사전 지식 없이도 PHP, MySQL, Redis 기반의 라라벨 개발 환경을 쉽게 구축할 수 있습니다.

> [!NOTE]  
> 이미 Docker 전문가라면 걱정 마세요! Sail의 모든 것은 라라벨에 포함된 `docker-compose.yml` 파일로 자유롭게 커스터마이즈할 수 있습니다.

<a name="sail-on-macos"></a>
### macOS에서 Sail 사용하기

Mac에서 개발하고 있으며 이미 [Docker Desktop](https://www.docker.com/products/docker-desktop)이 설치되어 있다면, 간단한 터미널 명령어만으로 새 라라벨 애플리케이션을 만들 수 있습니다. 예를 들어 "example-app" 이름의 디렉터리에 새 프로젝트를 만들고 싶다면 다음 명령어를 입력하면 됩니다:

```shell
curl -s "https://laravel.build/example-app" | bash
```

물론 여기서 "example-app" 부분은 원하는 이름으로 변경할 수 있습니다. 단, 애플리케이션 이름에는 영문자, 숫자, 대시(-), 밑줄(_)만 사용할 수 있습니다. 라라벨 애플리케이션의 디렉터리는 명령어를 실행한 현재 디렉터리 하위에 생성됩니다.

Sail 설치 과정에서 애플리케이션 컨테이너를 빌드하느라 다소 시간이 소요될 수 있습니다.

애플리케이션이 생성되면, 디렉터리로 이동 후 라라벨 Sail을 실행할 수 있습니다. Sail은 라라벨 기본 Docker 구성을 관리할 수 있는 커맨드라인 도구입니다:

```shell
cd example-app

./vendor/bin/sail up
```

Docker 컨테이너가 시작된 후에는 [데이터베이스 마이그레이션](/docs/11.x/migrations)을 실행하세요:

```shell
./vendor/bin/sail artisan migrate
```

마지막으로, 웹 브라우저에서 http://localhost 에 접속하면 애플리케이션을 확인할 수 있습니다.

> [!NOTE]  
> 라라벨 Sail을 더 깊게 배우고 싶다면 [Sail 공식 문서](/docs/11.x/sail)를 참고하세요.

<a name="sail-on-windows"></a>
### Windows에서 Sail 사용하기

Windows에서 라라벨 애플리케이션을 만들기 전에, [Docker Desktop](https://www.docker.com/products/docker-desktop) 설치를 먼저 완료해야 합니다. 그리고 Windows Subsystem for Linux 2(WSL2)를 설치/활성화해야 합니다. WSL은 Windows 10에서 리눅스 바이너리 실행을 네이티브로 지원하는 환경입니다. 설치 방법은 마이크로소프트의 [개발 환경 문서](https://docs.microsoft.com/en-us/windows/wsl/install-win10)를 참고하세요.

> [!NOTE]  
> WSL2를 설치/활성화한 후에는 Docker Desktop이 [WSL2 백엔드 사용](https://docs.docker.com/docker-for-windows/wsl/)으로 설정되어 있는지도 반드시 확인해야 합니다.

이제 첫 라라벨 애플리케이션을 만들 준비가 되었습니다. [Windows Terminal](https://www.microsoft.com/en-us/p/windows-terminal/9n0dx20hk701?rtc=1&activetab=pivot:overviewtab)을 실행하고, WSL2 리눅스 터미널 세션을 시작하세요. 예를 들어 "example-app" 디렉터리에 새 라라벨 프로젝트를 만들려면 다음과 같이 입력합니다:

```shell
curl -s https://laravel.build/example-app | bash
```

여기서도 "example-app"은 원하는 이름으로 자유롭게 바꿀 수 있지만, 애플리케이션 이름에는 영문자, 숫자, 대시(-), 밑줄(_)만 사용해야 합니다. 새 라라벨 애플리케이션 디렉터리는 현재 위치한 디렉터리 아래에 생성됩니다.

Sail 설치 과정은 다소 시간이 걸릴 수 있습니다.

애플리케이션이 생성된 뒤, 디렉터리로 이동 후 Sail을 실행합니다. Sail은 라라벨 기본 Docker 구성을 쉽게 다룰 수 있는 CLI 도구입니다:

```shell
cd example-app

./vendor/bin/sail up
```

Docker 컨테이너가 모두 실행되면, [데이터베이스 마이그레이션](/docs/11.x/migrations)을 실행해야 합니다:

```shell
./vendor/bin/sail artisan migrate
```

이제 웹 브라우저에서 http://localhost에 접속하면 애플리케이션을 확인할 수 있습니다.

> [!NOTE]  
> 라라벨 Sail에 대한 더 많은 학습은 [Sail 공식 문서](/docs/11.x/sail)에서 확인하세요.

#### WSL2 환경에서 개발하기

WSL2 환경에 생성된 라라벨 애플리케이션 파일을 수정하려면, 마이크로소프트의 [Visual Studio Code](https://code.visualstudio.com) 에디터와 [Remote Development](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack) 확장팩을 설치하는 것이 좋습니다.

이 도구를 설치했다면, Windows Terminal에서 애플리케이션 루트 디렉터리로 이동 후 `code .` 명령어를 실행해 바로 VS Code에서 프로젝트를 열 수 있습니다.

<a name="sail-on-linux"></a>
### Linux에서 Sail 사용하기

Linux에서 개발 중이고 이미 [Docker Compose](https://docs.docker.com/compose/install/)가 설치되어 있다면, 터미널에서 간단한 명령어로 새 라라벨 애플리케이션을 만들 수 있습니다.

먼저 Docker Desktop for Linux를 사용하는 경우라면, 다음 명령어를 실행하세요. Docker Desktop for Linux를 사용하지 않는 경우에는 생략해도 됩니다:

```shell
docker context use default
```

그 다음, "example-app"이라는 디렉터리에 새 라라벨 애플리케이션을 만들고 싶다면 아래와 같이 입력합니다:

```shell
curl -s https://laravel.build/example-app | bash
```

여기서 "example-app"은 원하는 이름으로 교체할 수 있으며, 영문자, 숫자, 대시(-), 밑줄(_)만 사용할 수 있습니다. 라라벨 애플리케이션 디렉터리는 명령어를 실행한 위치에 생성됩니다.

Sail 설치에는 컨테이너를 빌드하는 데 시간이 다소 소요될 수 있습니다.

애플리케이션이 생성된 후, 해당 디렉터리로 이동하여 Sail을 실행할 수 있습니다. Sail은 라라벨 기본 Docker 설정을 다루는 CLI 도구입니다:

```shell
cd example-app

./vendor/bin/sail up
```

Docker 컨테이너가 실행된 뒤에는 [데이터베이스 마이그레이션](/docs/11.x/migrations)을 진행하세요:

```shell
./vendor/bin/sail artisan migrate
```

마지막으로 http://localhost에서 웹 브라우저로 애플리케이션에 접근할 수 있습니다.

> [!NOTE]  
> 라라벨 Sail의 좀 더 자세한 활용법은 [Sail 공식 문서](/docs/11.x/sail)에서 확인할 수 있습니다.

<a name="choosing-your-sail-services"></a>
### Sail 서비스 선택하기

Sail을 이용해 새 라라벨 애플리케이션을 생성할 때, `with` 쿼리 문자열 변수를 사용하여 새로운 애플리케이션의 `docker-compose.yml` 파일에 어떤 서비스를 설정할지 선택할 수 있습니다. 사용 가능한 서비스에는 `mysql`, `pgsql`, `mariadb`, `redis`, `valkey`, `memcached`, `meilisearch`, `typesense`, `minio`, `selenium`, `mailpit` 등이 있습니다:

```shell
curl -s "https://laravel.build/example-app?with=mysql,redis" | bash
```

서비스를 별도로 지정하지 않으면 기본적으로 `mysql`, `redis`, `meilisearch`, `mailpit`, `selenium`이 포함된 기본 스택이 설정됩니다.

Sail이 기본 [Devcontainer](/docs/11.x/sail#using-devcontainers)도 설치하도록 하려면 URL에 `devcontainer` 파라미터를 추가하세요:

```shell
curl -s "https://laravel.build/example-app?with=mysql,redis&devcontainer" | bash
```

<a name="ide-support"></a>
## IDE 지원

라라벨 애플리케이션 개발 시 원하는 어떤 코드 에디터든 자유롭게 사용할 수 있습니다. 단, [PhpStorm](https://www.jetbrains.com/phpstorm/laravel/)은 라라벨과 그 생태계, 그리고 [Laravel Pint](https://www.jetbrains.com/help/phpstorm/using-laravel-pint.html)까지 폭넓게 지원합니다.

추가로 커뮤니티에서 관리하는 [Laravel Idea](https://laravel-idea.com/) PhpStorm 플러그인은 코드 생성, Eloquent 문법 자동완성, 유효성 검사 규칙 자동완성 등 IDE 상에서 다양한 생산성 도구를 제공합니다.

<a name="next-steps"></a>
## 다음 단계

라라벨 애플리케이션을 만들었으니, 이제 다음에 무엇을 배워야 할지 궁금하실 수 있습니다. 우선 아래 문서를 읽고 라라벨의 동작 원리에 익숙해지기를 강력히 추천합니다:

<div class="content-list" markdown="1">

- [요청 라이프사이클](/docs/11.x/lifecycle)
- [설정](/docs/11.x/configuration)
- [디렉터리 구조](/docs/11.x/structure)
- [프론트엔드](/docs/11.x/frontend)
- [서비스 컨테이너](/docs/11.x/container)
- [파사드](/docs/11.x/facades)

</div>

여러분이 라라벨을 어떻게 사용할지에 따라 배워야 할 다음 단계도 달라집니다. 라라벨은 다양한 방식으로 활용될 수 있으며, 아래에는 대표적인 두 가지 사용 사례를 소개합니다.

> [!NOTE]  
> 라라벨이 처음이신가요? [라라벨 부트캠프(Laravel Bootcamp)](https://bootcamp.laravel.com)에서 실습을 통해 프레임워크와 첫 애플리케이션 개발을 단계별로 익혀보세요.

<a name="laravel-the-fullstack-framework"></a>
### 라라벨: 풀스택 프레임워크

라라벨은 풀스택 프레임워크로 동작할 수 있습니다. 여기서 "풀스택" 프레임워크란, 라라벨이 요청 라우팅부터 [Blade 템플릿](/docs/11.x/blade)이나 [Inertia](https://inertiajs.com)와 같은 싱글 페이지 애플리케이션 하이브리드 기술을 이용한 프론트엔드 렌더링까지 모든 역할을 맡는 구조를 의미합니다. 이것이 라라벨을 가장 많이, 그리고 가장 생산적으로 활용하는 방법입니다.

이런 방식으로 라라벨을 쓰고 싶다면, [프론트엔드 개발](/docs/11.x/frontend), [라우팅](/docs/11.x/routing), [뷰](/docs/11.x/views), [Eloquent ORM](/docs/11.x/eloquent) 등의 문서를 살펴보세요. 또한 [Livewire](https://livewire.laravel.com), [Inertia](https://inertiajs.com)와 같은 커뮤니티 패키지에도 관심을 가져 보는 것을 추천합니다. 이런 패키지를 이용하면 라라벨을 풀스택 프레임워크로 사용하면서도 싱글 페이지 자바스크립트 애플리케이션이 주는 다양한 UI 경험을 누릴 수 있습니다.

풀스택 프레임워크로 라라벨을 쓸 예정이라면, [Vite](/docs/11.x/vite)를 이용해 CSS와 JavaScript 자산을 컴파일하는 법도 꼭 익히기를 권장합니다.

> [!NOTE]  
> 애플리케이션 개발을 더 빠르게 시작하고 싶다면 공식 [Starter Kit](/docs/11.x/starter-kits) 중 하나를 참고하세요.

<a name="laravel-the-api-backend"></a>
### 라라벨: API 백엔드

라라벨은 자바스크립트 싱글 페이지 애플리케이션 또는 모바일 앱을 위한 API 백엔드로도 활용할 수 있습니다. 예를 들어, [Next.js](https://nextjs.org) 애플리케이션의 API 백엔드로 라라벨을 사용할 수 있습니다. 이 경우 라라벨은 [인증](/docs/11.x/sanctum) 및 데이터 저장/조회는 물론, 큐, 이메일, 알림 등 라라벨의 강력한 서비스를 모두 누릴 수 있습니다.

이런 방식으로 라라벨을 사용하려 한다면 [라우팅](/docs/11.x/routing), [Laravel Sanctum](/docs/11.x/sanctum), [Eloquent ORM](/docs/11.x/eloquent) 문서를 참고하세요.

> [!NOTE]  
> 라라벨 백엔드와 Next.js 프론트엔드 개발을 더 빠르게 시작하고 싶다면, 라라벨 Breeze에서 [API 스택](/docs/11.x/starter-kits#breeze-and-next)과 [Next.js 프론트엔드 구현체](https://github.com/laravel/breeze-next)를 제공합니다. 몇 분 만에 개발 환경을 구축할 수 있습니다.
