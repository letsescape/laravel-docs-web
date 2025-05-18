# 설치 (Installation)

- [라라벨 알아보기](#meet-laravel)
    - [왜 라라벨인가?](#why-laravel)
- [라라벨 프로젝트 생성](#creating-a-laravel-project)
- [초기 설정](#initial-configuration)
    - [환경 기반 설정](#environment-based-configuration)
    - [데이터베이스와 마이그레이션](#databases-and-migrations)
    - [디렉터리 설정](#directory-configuration)
- [Sail을 이용한 Docker 설치](#docker-installation-using-sail)
    - [macOS에서 Sail 사용하기](#sail-on-macos)
    - [Windows에서 Sail 사용하기](#sail-on-windows)
    - [Linux에서 Sail 사용하기](#sail-on-linux)
    - [Sail 서비스 선택하기](#choosing-your-sail-services)
- [IDE 지원](#ide-support)
- [다음 단계](#next-steps)
    - [라라벨: 풀스택 프레임워크로 활용](#laravel-the-fullstack-framework)
    - [라라벨: API 백엔드로 활용](#laravel-the-api-backend)

<a name="meet-laravel"></a>
## 라라벨 알아보기

라라벨은 표현력 있고 우아한 문법을 제공하는 웹 애플리케이션 프레임워크입니다. 웹 프레임워크는 애플리케이션을 만들 때 구조와 시작점을 제공하여, 세부적인 구현은 라라벨에 맡기고 여러분은 멋진 기능 구현에 집중할 수 있도록 도와줍니다.

라라벨은 훌륭한 개발자 경험을 제공하는 동시에, 강력한 기능도 제공합니다. 대표적으로 완벽한 의존성 주입, 표현력 있는 데이터베이스 추상화 계층, 큐와 스케줄링된 작업, 단위 테스트 및 통합 테스트 등이 있습니다.

PHP 웹 프레임워크가 처음이신 분이든, 다년간 경험이 있는 분이든, 라라벨은 여러분과 함께 성장할 수 있는 프레임워크입니다. 웹 개발자로 첫걸음을 내딛는 분도, 경험 많은 개발자로 역량을 한 단계 더 성장시키고 싶은 분도 환영합니다. 여러분이 무엇을 만들어낼지 기대하고 있습니다.

> [!NOTE]
> 라라벨이 처음이신가요? [라라벨 부트캠프](https://bootcamp.laravel.com)를 방문해 실습 중심의 가이드를 따라가며 첫 라라벨 애플리케이션을 만들어보세요.

<a name="why-laravel"></a>
### 왜 라라벨인가?

웹 애플리케이션을 개발할 때 선택할 수 있는 여러 도구와 프레임워크가 존재합니다. 그럼에도 저희는 라라벨이 현대적인 풀스택 웹 애플리케이션을 구축하기 위한 최고의 선택이라고 믿습니다.

#### 점진적으로 성장하는 프레임워크

라라벨은 "점진적(progressive)" 프레임워크라고 할 수 있습니다. 즉, 라라벨은 여러분의 성장에 맞춰 함께 발전합니다. 웹 개발을 처음 접하는 경우에도, 라라벨의 방대한 공식 문서, 가이드, 그리고 [동영상 튜토리얼](https://laracasts.com) 덕분에 부담 없이 개발을 익힐 수 있습니다.

이미 숙련된 개발자라면, 라라벨이 [의존성 주입](/docs/10.x/container), [단위 테스트](/docs/10.x/testing), [큐](/docs/10.x/queues), [실시간 이벤트](/docs/10.x/broadcasting) 등 여러 강력한 도구를 제공합니다. 라라벨은 전문적인 웹 애플리케이션 개발에 최적화되어 있으며, 기업의 대규모 트래픽에도 충분히 견딜 수 있습니다.

#### 확장 가능한 프레임워크

라라벨은 매우 뛰어난 확장성을 자랑합니다. PHP의 확장 친화적인 구조와, 라라벨에서 기본 제공하는 Redis 등 빠르고 분산된 캐시 시스템 덕분에, 수평 확장이 매우 쉽습니다. 실제로 한 달에 수억 건의 요청을 무리 없이 처리하는 대규모 라라벨 애플리케이션도 존재합니다.

한계 없는 확장성이 필요하다면, [Laravel Vapor](https://vapor.laravel.com)와 같은 플랫폼을 통해 AWS의 최신 서버리스 기술 위에서 라라벨 애플리케이션을 거의 제한 없이 운영할 수 있습니다.

#### 커뮤니티 중심의 프레임워크

라라벨은 PHP 생태계 최고의 패키지들을 결합하여, 가장 강력하고 개발자 친화적인 프레임워크를 제공합니다. 그리고 전 세계 수천 명의 능력 있는 개발자들이 [프레임워크 발전에 기여](https://github.com/laravel/framework)해왔습니다. 여러분도 미래의 라라벨 컨트리뷰터가 될 수 있습니다.

<a name="creating-a-laravel-project"></a>
## 라라벨 프로젝트 생성

첫 라라벨 프로젝트를 만들기 전에, 로컬 컴퓨터에 PHP와 [Composer](https://getcomposer.org)가 설치되어 있는지 확인하세요. macOS를 사용한다면 [Laravel Herd](https://herd.laravel.com)를 통해 PHP와 Composer를 몇 분 만에 설치할 수 있습니다. 또한, [Node와 NPM 설치](https://nodejs.org)도 권장합니다.

PHP와 Composer 설치가 완료되면, Composer의 `create-project` 명령어로 새로운 라라벨 프로젝트를 생성할 수 있습니다.

```nothing
composer create-project "laravel/laravel:^10.0" example-app
```

또는, Composer를 통해 [라라벨 인스톨러](https://github.com/laravel/installer)를 전역으로 설치한 뒤, 아래와 같이 새 라라벨 프로젝트를 만들 수도 있습니다.

```nothing
composer global require laravel/installer

laravel new example-app
```

프로젝트 생성이 완료되면, 라라벨 Artisan의 `serve` 명령어로 로컬 개발 서버를 시작하세요.

```nothing
cd example-app

php artisan serve
```

Artisan 개발 서버를 실행하면, 애플리케이션은 브라우저에서 [http://localhost:8000](http://localhost:8000) 주소로 접속할 수 있습니다. 이제 [라라벨의 다음 단계](#next-steps)를 진행할 준비가 되었습니다. 물론, [데이터베이스 설정](#databases-and-migrations)도 고려할 수 있습니다.

> [!NOTE]
> 라라벨 애플리케이션 개발을 바로 시작하고 싶다면, [스타터 킷](/docs/10.x/starter-kits) 중 하나를 이용해보세요. 라라벨의 스타터 킷은 백엔드와 프론트엔드 인증 기능의 기본 구조를 손쉽게 제공합니다.

<a name="initial-configuration"></a>
## 초기 설정

라라벨 프레임워크의 모든 설정 파일은 `config` 디렉터리에 위치합니다. 각 설정 옵션은 주석으로 잘 설명되어 있으니, 파일을 살펴보며 어떤 옵션들이 있는지 익혀 보시길 권장합니다.

라라벨은 기본적으로 추가적인 설정이 거의 필요하지 않습니다. 즉시 개발을 시작할 수 있습니다! 다만, `config/app.php` 파일과 그 주석을 살펴보고, 필요에 따라 `timezone`이나 `locale`과 같은 옵션을 애플리케이션에 맞게 변경할 수 있습니다.

<a name="environment-based-configuration"></a>
### 환경 기반 설정

라라벨의 설정값 중 많은 부분은 애플리케이션이 로컬 환경에서 실행되는지, 또는 운영 서버에서 실행되는지에 따라 달라질 수 있습니다. 이러한 중요한 설정값 대부분은 애플리케이션 루트 경로에 있는 `.env` 파일에서 정의합니다.

`.env` 파일은 해당 애플리케이션을 사용하는 개발자나 서버마다 서로 다른 환경 설정이 필요하므로, 절대로 소스 코드 저장소에 커밋해서는 안 됩니다. 만약 침입자가 소스 저장소에 접근할 경우, 민감한 인증 정보가 노출되는 보안 위험이 커집니다.

> [!NOTE]
> `.env` 파일과 환경 기반 설정의 자세한 정보는 [설정 문서](/docs/10.x/configuration#environment-configuration)를 참고하세요.

<a name="databases-and-migrations"></a>
### 데이터베이스와 마이그레이션

이제 라라벨 애플리케이션을 만들었으니, 데이터를 데이터베이스에 저장하고 싶을 것입니다. 기본적으로 `.env` 설정 파일에는 라라벨이 MySQL 데이터베이스와 통신하도록 되어 있으며, `127.0.0.1` 주소의 데이터베이스에 접근하도록 설정되어 있습니다.

> [!NOTE]
> macOS에서 MySQL, Postgres, Redis 등을 설치해야 한다면, [DBngin](https://dbngin.com/)을 이용해보세요.

로컬에 MySQL이나 Postgres를 설치하고 싶지 않다면, [SQLite](https://www.sqlite.org/index.html) 데이터베이스를 사용할 수도 있습니다. SQLite는 작고 빠르며, 독립적으로 동작하는 데이터베이스 엔진입니다. 사용을 시작하려면 `.env` 설정 파일에서 라라벨의 `sqlite` 데이터베이스 드라이버를 사용하도록 수정하고, 나머지 데이터베이스 설정 옵션은 삭제해도 됩니다.

```ini
DB_CONNECTION=sqlite # [tl! add]
DB_CONNECTION=mysql # [tl! remove]
DB_HOST=127.0.0.1 # [tl! remove]
DB_PORT=3306 # [tl! remove]
DB_DATABASE=laravel # [tl! remove]
DB_USERNAME=root # [tl! remove]
DB_PASSWORD= # [tl! remove]
```

SQLite 데이터베이스 설정이 완료되면, [데이터베이스 마이그레이션](/docs/10.x/migrations)을 실행하여 사용될 테이블을 생성할 수 있습니다.

```shell
php artisan migrate
```

애플리케이션용 SQLite 데이터베이스 파일이 존재하지 않을 경우, 라라벨이 해당 데이터베이스 파일을 새로 생성할지 물어봅니다. 일반적으로 SQLite 데이터베이스 파일은 `database/database.sqlite` 경로에 생성됩니다.

<a name="directory-configuration"></a>
### 디렉터리 설정

라라벨은 반드시 웹 서버의 "웹 디렉터리" 루트에서 서빙되어야 합니다. "웹 디렉터리"의 하위 디렉터리에서 라라벨 애플리케이션을 제공하는 시도는 하지 말아야 하며, 그렇게 하면 애플리케이션 내의 민감한 파일들이 외부에 노출될 수 있습니다.

<a name="docker-installation-using-sail"></a>
## Sail을 이용한 Docker 설치

여러분이 어떤 운영체제(OS)를 사용하든 라라벨을 쉽게 시작할 수 있도록, 로컬 환경에서 라라벨 프로젝트를 개발하고 실행할 수 있는 다양한 방법이 제공됩니다. 다양한 옵션을 나중에 더 살펴봐도 좋지만, 라라벨은 [Sail](/docs/10.x/sail)이라는 기본 제공 기능을 통해 [Docker](https://www.docker.com)를 이용한 개발 환경 구성을 가능하게 합니다.

Docker는 각종 애플리케이션과 서비스를 작은 크기의 "컨테이너" 안에서 실행할 수 있게 해주는 도구입니다. 이 컨테이너는 로컬 컴퓨터에 설치된 소프트웨어나 설정에 전혀 영향을 주지 않습니다. 따라서 웹 서버, 데이터베이스 등 복잡한 개발 도구를 직접 설치하거나 설정하는 번거로움이 없습니다. 시작을 위해선 [Docker Desktop](https://www.docker.com/products/docker-desktop)만 설치하면 됩니다.

라라벨 Sail은 라라벨의 기본 Docker 구성을 다루기 위한 간편한 커맨드라인 인터페이스(CLI)입니다. PHP, MySQL, Redis 등 주요 서비스를 손쉽게 사용할 수 있고, Docker에 대한 경험이 없어도 쉽게 라라벨 개발 환경을 갖출 수 있습니다.

> [!NOTE]
> 이미 Docker 전문가시라면 걱정하지 않아도 됩니다! Sail의 모든 것은 라라벨에 포함된 `docker-compose.yml` 파일로 자유롭게 커스터마이즈할 수 있습니다.

<a name="sail-on-macos"></a>
### macOS에서 Sail 사용하기

Mac에서 개발하는 경우 [Docker Desktop](https://www.docker.com/products/docker-desktop)이 설치되어 있다면, 한 줄의 커맨드로 라라벨 프로젝트를 생성할 수 있습니다. 예를 들어, "example-app"이라는 디렉터리에 새 라라벨 애플리케이션을 생성하려면 다음 명령어를 터미널에서 실행하세요.

```shell
curl -s "https://laravel.build/example-app" | bash
```

물론, 위 URL의 "example-app" 부분을 원하는 이름으로 자유롭게 바꿀 수 있습니다. 단, 애플리케이션 이름에는 영문 대소문자, 숫자, 하이픈(-), 언더스코어(_)만 사용하세요. 라라벨 애플리케이션 디렉터리는 해당 명령을 실행한 디렉터리 안에 생성됩니다.

Sail 설치에는 애플리케이션 컨테이너가 로컬에서 빌드되므로 몇 분 정도 소요될 수 있습니다.

프로젝트가 생성된 후에는 애플리케이션 디렉터리로 이동해 Sail을 실행할 수 있습니다. Sail은 라라벨의 기본 Docker 구성을 쉽게 다룰 수 있는 커맨드라인 인터페이스(CLI)를 제공합니다.

```shell
cd example-app

./vendor/bin/sail up
```

애플리케이션의 Docker 컨테이너 실행이 완료되면, 웹 브라우저에서 http://localhost로 애플리케이션에 접속할 수 있습니다.

> [!NOTE]
> 라라벨 Sail에 대해 더 자세히 알아보고 싶다면 [공식 문서](/docs/10.x/sail)를 참고하세요.

<a name="sail-on-windows"></a>
### Windows에서 Sail 사용하기

Windows에서 새 라라벨 애플리케이션을 만들기 전에, 먼저 [Docker Desktop](https://www.docker.com/products/docker-desktop)을 설치해야 합니다. 그리고 Windows Subsystem for Linux 2 (WSL2)가 설치되어 활성화되어 있는지 확인하세요. WSL은 Windows에서 리눅스 바이너리 실행 파일을 네이티브로 실행할 수 있게 해 줍니다. WSL2 설치 및 활성화 방법은 Microsoft의 [개발 환경 문서](https://docs.microsoft.com/en-us/windows/wsl/install-win10)에서 확인할 수 있습니다.

> [!NOTE]
> WSL2를 설치 및 활성화한 후에는, Docker Desktop이 [WSL2 백엔드를 사용하도록 설정](https://docs.docker.com/docker-for-windows/wsl/)되어 있는지도 확인해야 합니다.

이제 첫 라라벨 프로젝트를 만들 준비가 끝났습니다. [Windows Terminal](https://www.microsoft.com/en-us/p/windows-terminal/9n0dx20hk701?rtc=1&activetab=pivot:overviewtab)을 실행하고, WSL2 리눅스 운영체제 세션을 열어주세요. 그리고, 아래 명령어를 사용해 새 라라벨 프로젝트를 생성할 수 있습니다.

```shell
curl -s https://laravel.build/example-app | bash
```

물론, 위 URL의 "example-app" 부분은 원하는 이름으로 자유롭게 변경할 수 있습니다. 단, 애플리케이션 이름은 영문 대소문자, 숫자, 하이픈, 언더스코어만 사용하세요. 라라벨 애플리케이션 디렉터리는 명령을 실행한 디렉터리 내에 생성됩니다.

Sail 설치는 애플리케이션 컨테이너가 로컬에서 빌드되므로 몇 분 정도 소요될 수 있습니다.

프로젝트가 생성되면, 해당 디렉터리로 이동해 Sail을 실행하세요. Sail은 라라벨의 기본 Docker 구성을 쉽게 다룰 수 있는 커맨드라인 인터페이스(CLI)를 제공합니다.

```shell
cd example-app

./vendor/bin/sail up
```

애플리케이션의 Docker 컨테이너가 실행되면, 웹 브라우저에서 http://localhost로 접속할 수 있습니다.

> [!NOTE]
> 라라벨 Sail에 대해 더 자세히 알아보려면 [공식 문서](/docs/10.x/sail)를 참고하세요.

#### WSL2 환경에서 개발하기

WSL2에 설치된 라라벨 애플리케이션의 파일을 수정하려면 적절한 텍스트 에디터가 필요합니다. 이를 위해 Microsoft의 [Visual Studio Code](https://code.visualstudio.com)와 공식 [Remote Development](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack) 확장 기능 사용을 권장합니다.

도구 설치 후에는 Windows Terminal에서 애플리케이션 루트 디렉터리에서 `code .` 커맨드를 실행하면 라라벨 프로젝트를 바로 열 수 있습니다.

<a name="sail-on-linux"></a>
### Linux에서 Sail 사용하기

Linux에서 개발하고 있으며, 이미 [Docker Compose](https://docs.docker.com/compose/install/)가 설치되어 있다면, 한 줄의 커맨드로 라라벨 프로젝트를 생성할 수 있습니다.

먼저, 만약 Docker Desktop for Linux를 사용하고 있다면 아래 명령어를 실행하세요. Docker Desktop for Linux를 사용하지 않는다면 이 단계는 건너뛰어도 됩니다.

```shell
docker context use default
```

그 다음, "example-app"이라는 디렉터리에 새 라라벨 애플리케이션을 생성하려면 터미널에서 다음 명령어를 실행하세요.

```shell
curl -s https://laravel.build/example-app | bash
```

위 URL의 "example-app" 부분은 원하는 이름으로 바꿀 수 있습니다. 단, 애플리케이션 이름은 영문 대소문자, 숫자, 하이픈, 언더스코어만 사용하세요. 라라벨 애플리케이션 디렉터리는 명령을 실행한 디렉터리 내에 생성됩니다.

Sail 설치는 애플리케이션 컨테이너를 빌드하기 때문에 완료까지 몇 분 정도 걸릴 수 있습니다.

프로젝트가 생성되면, 해당 디렉터리로 이동해 Sail을 시작하세요. Sail은 라라벨의 기본 Docker 구성을 손쉽게 운영할 수 있습니다.

```shell
cd example-app

./vendor/bin/sail up
```

Docker 컨테이너가 실행된 후, 브라우저에서 http://localhost로 애플리케이션을 확인할 수 있습니다.

> [!NOTE]
> 라라벨 Sail에 대해 더 자세히 알아보려면 [공식 문서](/docs/10.x/sail)를 참고하세요.

<a name="choosing-your-sail-services"></a>
### Sail 서비스 선택하기

Sail을 이용해 새 라라벨 애플리케이션을 만들 때, `with` 쿼리 문자열 변수를 사용하여 새 애플리케이션의 `docker-compose.yml` 파일에 어떤 서비스를 포함할지 선택할 수 있습니다. 설정 가능한 서비스에는 `mysql`, `pgsql`, `mariadb`, `redis`, `memcached`, `meilisearch`, `typesense`, `minio`, `selenium`, `mailpit`이 있습니다.

```shell
curl -s "https://laravel.build/example-app?with=mysql,redis" | bash
```

만약 명시적으로 어떤 서비스를 포함할지 지정하지 않으면, 기본적으로 `mysql`, `redis`, `meilisearch`, `mailpit`, `selenium`이 설정됩니다.

기본 [Devcontainer](/docs/10.x/sail#using-devcontainers)를 설치하고 싶으면 URL에 `devcontainer` 파라미터를 추가하세요.

```shell
curl -s "https://laravel.build/example-app?with=mysql,redis&devcontainer" | bash
```

<a name="ide-support"></a>
## IDE 지원

라라벨 애플리케이션 개발 시 원하는 모든 코드 에디터를 자유롭게 사용할 수 있습니다. 하지만 [PhpStorm](https://www.jetbrains.com/phpstorm/laravel/)은 라라벨 및 그 생태계에 대한 폭넓은 지원을 제공하며, [Laravel Pint](https://www.jetbrains.com/help/phpstorm/using-laravel-pint.html)와의 통합도 지원합니다.

또한, 커뮤니티에서 관리하는 [Laravel Idea](https://laravel-idea.com/) PhpStorm 플러그인은 코드 생성, Eloquent 구문 완성, 유효성 검사 규칙 자동완성 등 다양한 IDE 지원 기능을 제공합니다.

<a name="next-steps"></a>
## 다음 단계

라라벨 프로젝트를 생성했다면, 이제 무엇을 배우면 좋을지 고민이 될 수 있습니다. 먼저, 아래 문서를 읽으면서 라라벨이 어떻게 동작하는지 익히는 것을 강력하게 추천합니다.

<div class="content-list" markdown="1">

- [리퀘스트 라이프사이클](/docs/10.x/lifecycle)
- [설정](/docs/10.x/configuration)
- [디렉터리 구조](/docs/10.x/structure)
- [프론트엔드](/docs/10.x/frontend)
- [서비스 컨테이너](/docs/10.x/container)
- [파사드](/docs/10.x/facades)

</div>

여러분이 라라벨을 어떻게 활용하느냐에 따라 앞으로 배울 내용도 달라질 수 있습니다. 라라벨은 다양한 방식으로 사용할 수 있으며, 아래에서는 프레임워크의 대표적인 두 가지 활용 예시를 소개합니다.

> [!NOTE]
> 라라벨이 처음이신가요? [라라벨 부트캠프](https://bootcamp.laravel.com)를 방문해 실습 중심의 가이드를 따라가며 첫 라라벨 애플리케이션을 제작해보세요.

<a name="laravel-the-fullstack-framework"></a>
### 라라벨: 풀스택 프레임워크로 활용

라라벨은 풀스택(Full Stack) 프레임워크로 활용할 수 있습니다. 풀스택 프레임워크란, 라라벨을 이용해 라우팅을 처리하고 [Blade 템플릿](/docs/10.x/blade)이나 [Inertia](https://inertiajs.com)와 같은 싱글페이지 애플리케이션 하이브리드 기술로 프론트엔드를 렌더링하는 경우를 뜻합니다. 이 방식이 라라벨 프레임워크를 가장 많이, 그리고 가장 생산적으로 사용하는 방법입니다.

라라벨을 이런 용도로 사용할 계획이라면 [프론트엔드 개발](/docs/10.x/frontend), [라우팅](/docs/10.x/routing), [뷰](/docs/10.x/views), [Eloquent ORM](/docs/10.x/eloquent) 관련 문서를 참고하시면 도움이 됩니다. 또한, [Livewire](https://livewire.laravel.com), [Inertia](https://inertiajs.com) 같은 커뮤니티 패키지도 흥미로울 수 있습니다. 이 패키지들은 라라벨을 풀스택 프레임워크로 사용하면서, 싱글페이지 자바스크립트 애플리케이션이 제공하는 UI의 이점도 함께 누릴 수 있도록 해줍니다.

풀스택 프레임워크로 라라벨을 사용할 경우, [Vite](/docs/10.x/vite)를 이용해 애플리케이션의 CSS와 자바스크립트를 컴파일하는 방법도 꼭 익혀두기 바랍니다.

> [!NOTE]
> 애플리케이션 개발을 한발 앞서 시작하고 싶다면, 공식 [애플리케이션 스타터 킷](/docs/10.x/starter-kits) 중 하나를 확인해보세요.

<a name="laravel-the-api-backend"></a>
### 라라벨: API 백엔드로 활용

라라벨은 자바스크립트 싱글페이지 애플리케이션 또는 모바일 애플리케이션의 API 백엔드로도 활용할 수 있습니다. 예를 들어, [Next.js](https://nextjs.org) 애플리케이션의 API 백엔드로 라라벨을 사용할 수 있습니다. 이런 경우 라라벨은 [인증](/docs/10.x/sanctum) 및 데이터 저장/조회 등의 백엔드 역할뿐만 아니라, 큐, 이메일, 알림 등 라라벨의 강력한 서비스도 함께 제공합니다.

이처럼 라라벨을 백엔드 용도로 사용한다면 [라우팅](/docs/10.x/routing), [Laravel Sanctum](/docs/10.x/sanctum), [Eloquent ORM](/docs/10.x/eloquent) 문서를 참고하는 것이 좋습니다.

> [!NOTE]
> 라라벨 백엔드와 Next.js 프론트엔드를 빠르게 구축하고 싶다면, Laravel Breeze가 [API 스택](/docs/10.x/starter-kits#breeze-and-next) 및 [Next.js 프론트엔드 구현](https://github.com/laravel/breeze-next)을 제공하므로 몇 분 만에 시작할 수 있습니다.
