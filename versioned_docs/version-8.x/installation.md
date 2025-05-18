# 설치 (Installation)

- [라라벨 만나보기](#meet-laravel)
    - [왜 라라벨인가?](#why-laravel)
- [나의 첫 라라벨 프로젝트](#your-first-laravel-project)
    - [macOS에서 시작하기](#getting-started-on-macos)
    - [Windows에서 시작하기](#getting-started-on-windows)
    - [Linux에서 시작하기](#getting-started-on-linux)
    - [Sail에서 사용할 서비스 선택하기](#choosing-your-sail-services)
    - [Composer로 설치하기](#installation-via-composer)
- [초기 설정](#initial-configuration)
    - [환경 기반 설정](#environment-based-configuration)
    - [디렉토리 설정](#directory-configuration)
- [다음 단계](#next-steps)
    - [라라벨: 풀스택 프레임워크로 활용하기](#laravel-the-fullstack-framework)
    - [라라벨: API 백엔드로 활용하기](#laravel-the-api-backend)

<a name="meet-laravel"></a>
## 라라벨 만나보기

라라벨은 표현적이고 우아한 문법을 제공하는 웹 애플리케이션 프레임워크입니다. 웹 프레임워크는 애플리케이션을 만들 때 구조와 시작점을 제공하므로, 여러분은 세부적인 기술 설정에 얽매이지 않고 멋진 결과물에 집중할 수 있습니다.

라라벨은 강력한 기능(예: 완전한 의존성 주입, 표현력 있는 데이터베이스 추상화 계층, 큐와 예약 작업, 단위 테스트와 통합 테스트 등)은 물론, 개발자가 멋진 경험을 누릴 수 있도록 끊임없이 노력하고 있습니다.

PHP나 웹 프레임워크가 처음인 분도, 수년간 경험이 있으신 분도 라라벨은 여러분과 함께 성장할 수 있는 프레임워크입니다. 여러분이 웹 개발자에 첫 발을 내딛도록 도와드릴 수도 있고, 이미 숙련된 분이라면 새로운 수준에 도달하도록 한 단계 더 도약할 수 있도록 지원합니다. 여러분이 라라벨로 어떤 멋진 것을 만들지 저희도 무척 기대하고 있습니다.

<a name="why-laravel"></a>
### 왜 라라벨인가?

웹 애플리케이션을 만들 때 사용할 수 있는 다양한 도구와 프레임워크가 있습니다. 하지만 저희는 최신의 풀스택 웹 애플리케이션을 개발할 때 라라벨이 최고의 선택이라 믿습니다.

#### 발전형(Progressive) 프레임워크

저희는 라라벨을 "발전형(Progressive)" 프레임워크라 부릅니다. 즉, 라라벨은 여러분의 성장 단계에 따라 함께 발전할 수 있습니다. 웹 개발 입문 시에도 방대한 [문서](https://laravel.com/docs), 안내서, [비디오 튜토리얼](https://laracasts.com) 등 풍부한 리소스가 제공되어 부담 없이 기초부터 학습할 수 있습니다.

경험이 많은 시니어 개발자라면, 라라벨에서 제공하는 [의존성 주입](/docs/8.x/container), [단위 테스트](/docs/8.x/testing), [큐](/docs/8.x/queues), [실시간 이벤트](/docs/8.x/broadcasting) 등 다양한 강력한 도구들을 활용할 수 있습니다. 라라벨은 전문가용 웹 애플리케이션 구축에도 특화되어 있으며, 대기업에서 필요로 하는 대규모 워크로드도 거뜬히 처리할 준비가 되어 있습니다.

#### 확장성 높은 프레임워크

라라벨은 매우 높은 확장성을 자랑합니다. PHP의 확장성에 더해 라라벨은 Redis와 같은 빠른 분산 캐시 시스템을 기본적으로 지원하므로, 수평 확장(서버를 여러 대로 늘리는 것)도 아주 쉽게 할 수 있습니다. 실제로 라라벨 애플리케이션은 월 수억 건 이상의 요청을 무리 없이 처리한 사례도 있습니다.

극한의 확장성이 필요하시다면, [Laravel Vapor](https://vapor.laravel.com)와 같은 플랫폼을 통해 AWS의 최신 서버리스 기술 환경에서 라라벨 애플리케이션을 거의 무제한 규모로 운영할 수도 있습니다.

#### 커뮤니티 중심 프레임워크

라라벨은 PHP 생태계의 최고의 패키지들을 한데 모아 가장 강력하고 개발자 친화적인 프레임워크를 만들었습니다. 또한, 전 세계 수천 명의 실력 있는 개발자들이 [프레임워크 개발에 기여](https://github.com/laravel/framework)하고 있습니다. 어쩌면 여러분도 미래의 라라벨 기여자가 될지도 모릅니다.

<a name="your-first-laravel-project"></a>
## 나의 첫 라라벨 프로젝트

여러분이 라라벨을 더 쉽게 시작할 수 있도록 다양한 방법을 준비했습니다. 개발에 사용하실 컴퓨터 환경에 따라 여러 가지 방식이 있지만, 라라벨에는 자체적으로 [Sail](/docs/8.x/sail)이라는 솔루션이 내장되어 있어 [Docker](https://www.docker.com)를 사용해 간편하게 프로젝트를 실행할 수 있습니다.

Docker는 각각의 독립된 "컨테이너" 안에서 여러 애플리케이션과 서비스를 실행할 수 있게 해주는 도구로, 로컬 컴퓨터의 기존 프로그램이나 설정을 건드리지 않습니다. 즉, 개인 컴퓨터에 웹 서버나 데이터베이스 같은 복잡한 개발 도구를 따로 설치하고 구성할 필요가 없습니다. 시작을 위해서는 [Docker Desktop](https://www.docker.com/products/docker-desktop)만 설치하면 됩니다.

라라벨 Sail은 라라벨의 기본 Docker 구성과 상호작용할 수 있는 가벼운 명령줄 인터페이스입니다. Sail을 이용하면 Docker에 대한 사전 지식 없이도 PHP, MySQL, Redis를 활용한 라라벨 앱 개발을 바로 시작할 수 있습니다.

> [!TIP]
> 이미 Docker 사용에 익숙하신가요? 걱정하지 마세요! Sail의 모든 설정은 라라벨에 포함된 `docker-compose.yml` 파일을 수정해서 자유롭게 커스터마이징할 수 있습니다.

<a name="getting-started-on-macos"></a>
### macOS에서 시작하기

Mac에서 개발 중이고 [Docker Desktop](https://www.docker.com/products/docker-desktop)이 이미 설치되어 있다면, 터미널 명령어 한 줄로 새로운 라라벨 프로젝트를 만들 수 있습니다. 예를 들어 "example-app"이라는 디렉토리에 라라벨 애플리케이션을 생성하려면 터미널에서 아래 명령을 실행하세요.

```nothing
curl -s "https://laravel.build/example-app" | bash
```

물론, 위 URL의 "example-app" 부분은 원하는 프로젝트 이름으로 자유롭게 변경해도 됩니다. 라라벨 애플리케이션의 디렉토리는 명령을 실행한 현재 디렉토리 안에 생성됩니다.

프로젝트가 생성된 후에는 애플리케이션 디렉토리로 이동해서 라라벨 Sail을 시작할 수 있습니다. 라라벨 Sail은 라라벨의 기본 Docker 구성을 쉽게 다룰 수 있는 명령줄 인터페이스를 제공합니다.

```nothing
cd example-app

./vendor/bin/sail up
```

Sail `up` 명령을 처음 실행하면, 애플리케이션 컨테이너가 여러분의 컴퓨터에서 빌드되므로 몇 분 정도 소요될 수 있습니다. **하지만 걱정하지 마세요, 다음부터는 훨씬 빠르게 시작됩니다.**

애플리케이션의 Docker 컨테이너가 모두 실행되면, 웹 브라우저에서 http://localhost 에 접속해 애플리케이션을 확인하실 수 있습니다.

> [!TIP]
> 라라벨 Sail에 대해 더 자세히 알아보고 싶다면 [Sail의 전체 문서](/docs/8.x/sail)를 참고하세요.

<a name="getting-started-on-windows"></a>
### Windows에서 시작하기

Windows 환경에서 새로운 라라벨 애플리케이션을 만들기 전, 먼저 [Docker Desktop](https://www.docker.com/products/docker-desktop)이 설치되어 있는지 확인하세요. 그리고 Windows Subsystem for Linux 2(WSL2)도 설치 및 활성화되어 있어야 합니다. WSL은 Windows 10에서 리눅스 바이너리 실행 파일을 직접 실행할 수 있게 해줍니다. WSL2 설치 및 활성화 방법은 마이크로소프트의 [개발 환경 문서](https://docs.microsoft.com/en-us/windows/wsl/install-win10)에서 확인하실 수 있습니다.

> [!TIP]
> WSL2 설치 및 활성화 후에는 Docker Desktop이 [WSL2 백엔드로 동작하도록 설정](https://docs.docker.com/docker-for-windows/wsl/)되어 있는지 확인하세요.

이제 첫 라라벨 프로젝트를 만들 준비가 되었습니다. [Windows Terminal](https://www.microsoft.com/en-us/p/windows-terminal/9n0dx20hk701?rtc=1&activetab=pivot:overviewtab)를 실행하고, WSL2 리눅스 환경에서 새로운 터미널 세션을 시작하세요. 그리고 새로운 라라벨 프로젝트를 생성할 때는 아래와 같이 터미널에서 명령어 한 줄로 진행합니다. 예시는 "example-app" 디렉토리에 애플리케이션을 만드는 경우입니다.

```nothing
curl -s https://laravel.build/example-app | bash
```

"example-app" 부분은 자유롭게 원하는 이름으로 바꿔도 됩니다. 애플리케이션 디렉토리는 명령을 실행한 현재 디렉토리에 만들어집니다.

프로젝트가 생성된 후, 애플리케이션 디렉토리로 이동해서 라라벨 Sail을 시작할 수 있습니다. Sail은 기본 Docker 구성을 명령줄에서 간단하게 조작할 수 있게 해줍니다.

```nothing
cd example-app

./vendor/bin/sail up
```

Sail `up` 명령을 처음 실행할 때는 애플리케이션 컨테이너가 초기 빌드되기 때문에 몇 분 정도 소요될 수 있습니다. **하지만 다음 번부터는 훨씬 빠르게 시작됩니다.**

컨테이너 실행이 완료되면, 웹 브라우저에서 http://localhost 로 접속해 애플리케이션을 확인하세요.

> [!TIP]
> 라라벨 Sail에 대해 더 자세히 알아보고 싶다면 [Sail의 전체 문서](/docs/8.x/sail)를 참고하세요.

#### WSL2에서 개발하기

WSL2 환경 내에 생성된 라라벨 애플리케이션 파일을 수정하려면, 마이크로소프트의 [Visual Studio Code](https://code.visualstudio.com) 에디터와 [Remote Development](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack) 공식 확장팩 사용을 권장합니다.

이 도구들을 설치한 후, Windows Terminal에서 애플리케이션의 루트 디렉토리에서 `code .` 명령을 실행하면, 어느 라라벨 프로젝트든 바로 열 수 있습니다.

<a name="getting-started-on-linux"></a>
### Linux에서 시작하기

Linux에서 개발 중이고 [Docker Compose](https://docs.docker.com/compose/install/)가 이미 설치되어 있다면, 명령어 한 줄로 쉽게 라라벨 프로젝트를 만들 수 있습니다. 예를 들어 "example-app" 폴더에 애플리케이션을 생성하려면 터미널에서 아래 명령을 실행하세요.

```nothing
curl -s https://laravel.build/example-app | bash
```

당연히 "example-app" 부분은 원하는 이름으로 바꿀 수 있습니다. 애플리케이션 디렉토리는 명령을 실행한 현재 폴더에 생성됩니다.

프로젝트가 만들어진 후엔 디렉토리로 이동해서 라라벨 Sail을 시작합니다. Sail은 라라벨의 기본 Docker 구성을 명령줄에서 간편하게 관리할 수 있게 해줍니다.

```nothing
cd example-app

./vendor/bin/sail up
```

Sail `up` 명령을 처음 실행하면 컨테이너가 빌드되어 몇 분간 시간이 소요될 수 있습니다. **하지만 2회차부터는 더 빠르게 실행됩니다.**

컨테이너가 실행되면, 웹 브라우저에서 http://localhost 주소로 접속해 애플리케이션을 확인할 수 있습니다.

> [!TIP]
> 라라벨 Sail에 대해 더 자세히 알아보고 싶다면 [Sail의 전체 문서](/docs/8.x/sail)를 참고하세요.

<a name="choosing-your-sail-services"></a>
### Sail에서 사용할 서비스 선택하기

Sail을 통해 새 라라벨 애플리케이션을 만들 때, `with` 쿼리 스트링 변수로 새로운 애플리케이션의 `docker-compose.yml` 파일에 어떤 서비스가 포함될지 지정할 수 있습니다. 사용 가능한 서비스에는 `mysql`, `pgsql`, `mariadb`, `redis`, `memcached`, `meilisearch`, `minio`, `selenium`, `mailhog` 등이 있습니다.

```nothing
curl -s "https://laravel.build/example-app?with=mysql,redis" | bash
```

만약 별도로 서비스를 지정하지 않으면, `mysql`, `redis`, `meilisearch`, `mailhog`, `selenium`이 기본값으로 포함됩니다.

<a name="installation-via-composer"></a>
### Composer로 설치하기

만약 컴퓨터에 PHP와 Composer가 이미 설치되어 있다면, Composer를 직접 활용해서 라라벨 프로젝트를 만들 수 있습니다. 애플리케이션 생성 후에는 Artisan CLI의 `serve` 명령어로 라라벨의 로컬 개발 서버를 실행할 수 있습니다.

```
composer create-project laravel/laravel:^8.0 example-app

cd example-app

php artisan serve
```

<a name="the-laravel-installer"></a>
#### 라라벨 인스톨러

또는 Composer를 이용해 라라벨 인스톨러를 전역으로 설치할 수도 있습니다.

```nothing
composer global require laravel/installer

laravel new example-app

cd example-app

php artisan serve
```

시스템 전체에서 `laravel` 실행 파일을 찾을 수 있도록 Composer의 글로벌 vendor bin 디렉토리가 반드시 `$PATH`에 포함되어 있어야 합니다. 이 디렉토리는 운영체제마다 다르지만, 대표적으로 아래 위치에 존재합니다.

<div class="content-list" markdown="1">

- macOS: `$HOME/.composer/vendor/bin`
- Windows: `%USERPROFILE%\AppData\Roaming\Composer\vendor\bin`
- GNU / Linux 계열: `$HOME/.config/composer/vendor/bin` 또는 `$HOME/.composer/vendor/bin`

</div>

편의를 위해, 라라벨 인스톨러는 새 프로젝트를 만들 때 Git 저장소도 함께 생성할 수 있습니다. 새로운 프로젝트를 만들 때 `--git` 플래그를 추가하면 프로젝트와 함께 Git 저장소가 생성됩니다.

```bash
laravel new example-app --git
```

이 명령어는 프로젝트의 Git 저장소를 초기화하고, 라라벨 기본 골격 코드를 자동으로 첫 커밋으로 만들어줍니다. `git` 플래그를 사용하려면 Git이 제대로 설치 및 설정되어 있어야 합니다. 또한, `--branch` 플래그를 사용해 초기 브랜치 이름을 지정할 수도 있습니다.

```bash
laravel new example-app --git --branch="main"
```

`--git` 플래그 대신 `--github` 플래그를 사용하면, 로컬 Git 저장소는 물론 GitHub에 대응되는 비공개 저장소까지 자동으로 생성할 수 있습니다.

```bash
laravel new example-app --github
```

이렇게 만들어진 저장소는 `https://github.com/<your-account>/example-app` 주소에서 확인할 수 있습니다. `github` 플래그를 사용하려면 [GitHub CLI](https://cli.github.com)가 설치되어 있고, GitHub에 인증되어 있어야 하며, Git도 제대로 설치·설정되어 있어야 합니다. 필요하다면 GitHub CLI에서 지원하는 다양한 플래그도 함께 전달할 수 있습니다.

```bash
laravel new example-app --github="--public"
```

또한 `--organization` 플래그를 사용해 특정 GitHub 조직 하위에 저장소를 생성할 수도 있습니다.

```bash
laravel new example-app --github="--public" --organization="laravel"
```

<a name="initial-configuration"></a>
## 초기 설정

라라벨 프레임워크의 모든 설정 파일은 `config` 디렉토리에 저장되어 있습니다. 각 옵션마다 주석이 잘 달려 있으니, 직접 파일을 열어 다양한 옵션을 확인해보셔도 좋습니다.

라라벨은 기본적으로 별다른 추가 설정 없이 바로 개발을 시작할 수 있습니다. 물론 필요에 따라 `config/app.php` 파일과 문서도 살펴보시길 권장합니다. 여기에는 `timezone(타임존)`이나 `locale(로케일)`처럼 애플리케이션 환경에 맞게 설정할 수 있는 여러 옵션이 있습니다.

<a name="environment-based-configuration"></a>
### 환경 기반 설정

라라벨의 많은 설정 값들은 여러분의 애플리케이션이 로컬 컴퓨터에서 실행될 때와, 운영 서버(프로덕션 웹 서버)에서 실행될 때에 따라 달라질 수 있습니다. 그래서 중요한 설정 값 상당수는 애플리케이션 루트에 위치한 `.env` 파일을 통해 정의됩니다.

`.env` 파일은 각 개발자 또는 서버가 서로 다른 환경 설정을 가질 수 있기 때문에, 반드시 소스 관리 저장소에는 커밋하지 않아야 합니다. 그리고 만약 소스 저장소에 노출된 경우, 민감한 인증 정보가 유출될 수 있으므로 보안상으로도 매우 위험합니다.

> [!TIP]
> `.env` 파일 및 환경 기반 설정에 대해 더 자세한 내용은 [전체 설정 문서](/docs/8.x/configuration#environment-configuration)를 참고하세요.

<a name="directory-configuration"></a>
### 디렉토리 설정

라라벨 애플리케이션은 항상 웹 서버의 "웹 디렉토리" 루트에서 서비스되어야 합니다. 라라벨 애플리케이션을 "웹 디렉토리"의 하위 폴더에서 서비스하려는 시도는 하지 않아야 합니다. 그렇게 하면 애플리케이션 내의 민감한 파일들이 외부에 노출될 위험이 있습니다.

<a name="next-steps"></a>
## 다음 단계

이제 라라벨 프로젝트를 만들었으니, 앞으로 무엇을 학습하면 좋을지 고민하실 수 있습니다. 우선 라라벨의 작동 방식을 익히기 위해 아래 문서들을 반드시 읽어보시길 추천합니다.

<div class="content-list" markdown="1">

- [요청 처리 라이프사이클](/docs/8.x/lifecycle)
- [설정](/docs/8.x/configuration)
- [디렉토리 구조](/docs/8.x/structure)
- [서비스 컨테이너](/docs/8.x/container)
- [Facade](/docs/8.x/facades)

</div>

여러분이 라라벨을 어떤 용도로 쓰고 싶은지에 따라 앞으로의 학습 방향도 달라질 수 있습니다. 라라벨을 활용하는 방법은 매우 다양하며, 아래에서는 대표적인 두 가지 활용 방식을 소개합니다.

<a name="laravel-the-fullstack-framework"></a>
### 라라벨: 풀스택 프레임워크로 활용하기

라라벨은 풀스택 프레임워크로 사용될 수 있습니다. 여기서 "풀스택" 프레임워크란, 라라벨이 모든 HTTP 요청의 라우팅을 담당하고, [Blade 템플릿](/docs/8.x/blade)이나 [Inertia.js](https://inertiajs.com) 같은 단일 페이지 애플리케이션 하이브리드 기술로 프론트엔드 렌더링까지 포함한다는 의미입니다. 이것이 라라벨을 가장 일반적으로 활용하는 방식입니다.

이런 방식으로 라라벨을 사용하고자 한다면 [라우팅](/docs/8.x/routing), [뷰](/docs/8.x/views), [Eloquent ORM](/docs/8.x/eloquent) 문서를 참고하길 권장합니다. 또한 [Livewire](https://laravel-livewire.com), [Inertia.js](https://inertiajs.com) 등 커뮤니티 패키지들도 살펴볼 만합니다. 이런 패키지들을 활용하면 단일 페이지 자바스크립트 앱의 UI 이점을 누리면서도 라라벨을 풀스택 프레임워크로 쓸 수 있습니다.

풀스택 프레임워크로 라라벨을 사용할 경우, [Laravel Mix](/docs/8.x/mix)를 활용해 CSS와 자바스크립트 번들링 방법도 꼭 배워 보길 권장합니다.

> [!TIP]
> 애플리케이션을 곧바로 개발하고 싶다면 공식 [애플리케이션 스타터 킷](/docs/8.x/starter-kits)부터 확인해보세요.

<a name="laravel-the-api-backend"></a>
### 라라벨: API 백엔드로 활용하기

라라벨은 또한 자바스크립트 단일 페이지 애플리케이션이나 모바일 애플리케이션을 위한 API 백엔드로도 사용할 수 있습니다. 예를 들어 [Next.js](https://nextjs.org) 애플리케이션의 API 백엔드로 라라벨을 선택할 수도 있습니다. 이런 식으로 활용하면 라라벨은 [인증](/docs/8.x/sanctum) 및 데이터 저장/조회는 물론, 큐, 이메일, 알림 등 강력한 다양한 서비스를 API로 제공할 수 있습니다.

이런 방식으로 사용하고자 한다면 [라우팅](/docs/8.x/routing), [Laravel Sanctum](/docs/8.x/sanctum), [Eloquent ORM](/docs/8.x/eloquent) 관련 문서를 참고하면 좋습니다.

> [!TIP]
> 라라벨 백엔드와 Next.js 프론트엔드를 빠르게 셋업하고 싶으신가요? Laravel Breeze에는 [API 스택](/docs/8.x/starter-kits#breeze-and-next)과 [Next.js 프론트엔드 예시](https://github.com/laravel/breeze-next)가 준비되어 있어 몇 분 만에 시작할 수 있습니다.