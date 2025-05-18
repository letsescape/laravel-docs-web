# 라라벨 Sail (Laravel Sail)

- [소개](#introduction)
- [설치 및 셋업](#installation)
    - [기존 애플리케이션에 Sail 설치하기](#installing-sail-into-existing-applications)
    - [셸 별칭(alias) 설정하기](#configuring-a-shell-alias)
- [Sail 시작 및 중지](#starting-and-stopping-sail)
- [명령어 실행하기](#executing-sail-commands)
    - [PHP 명령어 실행](#executing-php-commands)
    - [Composer 명령어 실행](#executing-composer-commands)
    - [Artisan 명령어 실행](#executing-artisan-commands)
    - [Node / NPM 명령어 실행](#executing-node-npm-commands)
- [데이터베이스와 상호작용하기](#interacting-with-sail-databases)
    - [MySQL](#mysql)
    - [Redis](#redis)
    - [MeiliSearch](#meilisearch)
- [파일 스토리지](#file-storage)
- [테스트 실행하기](#running-tests)
    - [라라벨 Dusk](#laravel-dusk)
- [이메일 미리보기](#previewing-emails)
- [컨테이너 CLI 명령어 사용](#sail-container-cli)
- [PHP 버전](#sail-php-versions)
- [Node 버전](#sail-node-versions)
- [사이트 공유하기](#sharing-your-site)
- [Xdebug로 디버깅하기](#debugging-with-xdebug)
  - [Xdebug CLI 사용법](#xdebug-cli-usage)
  - [Xdebug 브라우저 사용법](#xdebug-browser-usage)
- [커스터마이즈](#sail-customization)

<a name="introduction"></a>
## 소개

[라라벨 Sail](https://github.com/laravel/sail)은 라라벨 기본 Docker 개발 환경과 상호작용하기 위한 가볍고 편리한 커맨드라인 도구입니다. Sail을 이용하면 Docker에 대한 사전 지식 없이도 PHP, MySQL, Redis를 활용해 라라벨 애플리케이션을 쉽게 구축할 수 있습니다.

Sail의 핵심은 프로젝트 루트에 저장된 `docker-compose.yml` 파일과 `sail` 스크립트입니다. `sail` 스크립트는 `docker-compose.yml` 파일에 정의된 Docker 컨테이너들과 쉽게 상호작용할 수 있는 CLI를 제공합니다.

라라벨 Sail은 macOS, Linux, 그리고 Windows( [WSL2](https://docs.microsoft.com/en-us/windows/wsl/about) 를 통해)에서 사용할 수 있습니다.

<a name="installation"></a>
## 설치 및 셋업

라라벨 Sail은 모든 신규 라라벨 애플리케이션에 자동으로 설치되므로 즉시 사용할 수 있습니다. 새로운 라라벨 애플리케이션을 만드는 방법은 운영체제에 맞는 라라벨 [설치 문서](/docs/9.x/installation)를 참고하세요. 설치 과정에서 Sail이 지원하는 서비스 중 어떤 것과 연동할지 선택하게 됩니다.

<a name="installing-sail-into-existing-applications"></a>
### 기존 애플리케이션에 Sail 설치하기

기존의 라라벨 애플리케이션에서 Sail을 사용하고 싶다면, Composer 패키지 관리자를 통해 Sail을 설치할 수 있습니다. 당연히, 이 과정은 현재의 로컬 개발 환경에서 Composer 패키지 설치가 가능한 경우를 가정합니다.

```shell
composer require laravel/sail --dev
```

Sail 설치 후, `sail:install` Artisan 명령어를 실행하면 Sail의 `docker-compose.yml` 파일이 애플리케이션의 루트에 생성됩니다.

```shell
php artisan sail:install
```

마지막으로 Sail을 시작할 수 있습니다. Sail의 사용 방법에 대해 더 자세히 알아보고 싶다면 아래 문서를 계속 참고하시면 됩니다.

```shell
./vendor/bin/sail up
```

<a name="adding-additional-services"></a>
#### 추가 서비스 설치하기

기존 Sail 설치 환경에 다른 서비스를 추가하고 싶으면, `sail:add` Artisan 명령어를 실행할 수 있습니다.

```shell
php artisan sail:add
```

<a name="using-devcontainers"></a>
#### Devcontainer 사용하기

[Devcontainer](https://code.visualstudio.com/docs/remote/containers) 내에서 개발하고 싶다면, `sail:install` 명령어에 `--devcontainer` 옵션을 추가합니다. 이 옵션은 기본 `.devcontainer/devcontainer.json` 파일을 애플리케이션 루트에 생성해줍니다.

```shell
php artisan sail:install --devcontainer
```

<a name="configuring-a-shell-alias"></a>
### 셸 별칭(alias) 설정하기

기본적으로 Sail 명령어는 신규 라라벨 애플리케이션에 포함된 `vendor/bin/sail` 스크립트를 사용해서 실행합니다.

```shell
./vendor/bin/sail up
```

하지만, 매번 `vendor/bin/sail`을 입력하는 대신 간편하게 사용할 수 있도록 셸 alias를 설정할 수 있습니다.

```shell
alias sail='[ -f sail ] && sh sail || sh vendor/bin/sail'
```

이 alias가 항상 사용 가능하도록 하려면, 홈 디렉터리의 셸 설정 파일(`~/.zshrc`, `~/.bashrc` 등)에 이 내용을 추가한 뒤 셸을 재시작하세요.

별칭이 설정되면 이제 간단하게 `sail`만 입력해도 Sail 명령어를 사용할 수 있습니다. 이후 이 문서의 모든 예제에서는 alias 설정을 했다고 가정합니다.

```shell
sail up
```

<a name="starting-and-stopping-sail"></a>
## Sail 시작 및 중지

라라벨 Sail의 `docker-compose.yml` 파일에는 라라벨 애플리케이션 개발에 필요한 다양한 Docker 컨테이너 설정이 담겨 있습니다. 각 컨테이너는 `docker-compose.yml` 파일의 `services` 항목에 정의됩니다. 이 중 `laravel.test` 컨테이너가 실제로 애플리케이션을 서비스하는 기본 컨테이너입니다.

Sail을 시작하기 전에, 컴퓨터에 기존의 웹 서버나 데이터베이스가 실행되고 있지 않은지 확인하세요. 애플리케이션의 `docker-compose.yml`에 정의된 모든 Docker 컨테이너를 실행하려면 아래와 같이 `up` 명령어를 사용합니다.

```shell
sail up
```

컨테이너를 백그라운드에서 실행하려면, "detached" 모드로 시작할 수 있습니다.

```shell
sail up -d
```

컨테이너가 모두 시작되면, 웹 브라우저에서 http://localhost 로 접속해 프로젝트를 확인할 수 있습니다.

모든 컨테이너를 중지하려면 Control + C를 누르거나, 백그라운드에서 컨테이너가 실행 중일 때는 `stop` 명령어를 사용할 수 있습니다.

```shell
sail stop
```

<a name="executing-sail-commands"></a>
## 명령어 실행하기

라라벨 Sail을 사용할 때, 애플리케이션은 Docker 컨테이너 내에서 실행되어 로컬 컴퓨터와 분리되어 있습니다. 하지만, Sail은 PHP 명령어, Artisan 명령어, Composer 명령어, Node / NPM 명령어 등 다양한 명령어를 편리하게 실행할 수 있는 방법을 제공합니다.

**라라벨 공식 문서에서 Composer, Artisan, Node / NPM 명령어 등이 Sail을 언급하지 않고 나오는 경우가 많습니다.** 이러한 예시는 해당 도구들이 로컬 컴퓨터에 설치되어 있다고 가정하기 때문입니다. Sail을 이용해 개발 환경을 구축한 경우, 반드시 Sail 명령어로 해당 작업을 실행해야 합니다.

```shell
# 로컬에서 Artisan 명령어 실행 예시...
php artisan queue:work

# 라라벨 Sail에서 Artisan 명령어 실행 예시...
sail artisan queue:work
```

<a name="executing-php-commands"></a>
### PHP 명령어 실행

PHP 명령어는 `php` 명령어를 통해 실행할 수 있습니다. 이때 사용되는 PHP 버전은 애플리케이션에 설정된 버전이 사용됩니다. Sail에서 지원하는 PHP 버전에 대한 자세한 내용은 [PHP 버전 문서](#sail-php-versions)를 참고하세요.

```shell
sail php --version

sail php script.php
```

<a name="executing-composer-commands"></a>
### Composer 명령어 실행

Composer 명령어는 `composer` 명령어를 통해 실행할 수 있습니다. 라라벨 Sail의 애플리케이션 컨테이너에는 Composer 2.x가 이미 설치되어 있습니다.

```nothing
sail composer require laravel/sanctum
```

<a name="installing-composer-dependencies-for-existing-projects"></a>
#### 기존 애플리케이션의 Composer 의존성 설치

여러 명이 함께 개발하는 프로젝트에서는, 자신이 직접 라라벨 애플리케이션을 생성하지 않았을 가능성이 높습니다. 이 경우, 애플리케이션의 Composer 의존성(즉, Sail을 포함한 모든 패키지)이 새로 clone한 로컬 컴퓨터에 설치되지 않은 상태일 수 있습니다.

이런 경우, 애플리케이션 디렉터리로 이동한 후 아래 명령어를 실행해 Composer 의존성을 설치할 수 있습니다. 이 명령어는 PHP와 Composer가 들어있는 작은 Docker 컨테이너를 사용합니다.

```shell
docker run --rm \
    -u "$(id -u):$(id -g)" \
    -v "$(pwd):/var/www/html" \
    -w /var/www/html \
    laravelsail/php82-composer:latest \
    composer install --ignore-platform-reqs
```

`laravelsail/phpXX-composer` 이미지를 사용할 때는, 실제 애플리케이션에서 사용할 PHP 버전(`74`, `80`, `81`, `82`)과 동일한 버전을 선택해야 합니다.

<a name="executing-artisan-commands"></a>
### Artisan 명령어 실행

라라벨 Artisan 명령어는 `artisan` 명령어를 이용해 실행할 수 있습니다.

```shell
sail artisan queue:work
```

<a name="executing-node-npm-commands"></a>
### Node / NPM 명령어 실행

Node 명령어는 `node` 명령어로, NPM 명령어는 `npm` 명령어로 각각 실행할 수 있습니다.

```shell
sail node --version

sail npm run dev
```

필요하다면 NPM 대신 Yarn을 사용할 수도 있습니다.

```shell
sail yarn
```

<a name="interacting-with-sail-databases"></a>
## 데이터베이스와 상호작용하기

<a name="mysql"></a>
### MySQL

애플리케이션의 `docker-compose.yml` 파일에는 MySQL 컨테이너가 정의되어 있습니다. 이 컨테이너는 [Docker 볼륨](https://docs.docker.com/storage/volumes/)을 사용하므로, 컨테이너 중지나 재시작에도 데이터가 안전하게 유지됩니다.

또한 MySQL 컨테이너가 처음 시작될 때, 두 개의 데이터베이스가 자동으로 생성됩니다. 첫 번째는 `DB_DATABASE` 환경 변수 값으로 명명되어 실제 개발에 사용하며, 두 번째는 `testing`이라는 테스트 전용 데이터베이스로, 테스트 실행 시 개발 데이터에 영향을 주지 않도록 분리되어 있습니다.

컨테이너가 모두 시작된 후, `.env` 파일의 `DB_HOST` 환경 변수 값을 `mysql`로 설정해야 애플리케이션에서 MySQL 인스턴스에 정상적으로 연결됩니다.

로컬 컴퓨터에서 MySQL DB에 접속하려면 [TablePlus](https://tableplus.com)와 같은 GUI DB 관리 도구를 사용할 수 있습니다. 기본적으로 MySQL DB는 `localhost`, 포트 3306에서 열려 있으며, 접근 계정 정보는 `DB_USERNAME`, `DB_PASSWORD` 환경 변수 값을 따릅니다. 또는 `root` 사용자로, 비밀번호는 역시 `DB_PASSWORD` 값을 사용해 접속할 수도 있습니다.

<a name="redis"></a>
### Redis

애플리케이션의 `docker-compose.yml` 파일엔 [Redis](https://redis.io) 컨테이너도 포함되어 있습니다. 이 컨테이너 역시 [Docker 볼륨](https://docs.docker.com/storage/volumes/)을 사용해 데이터를 보존합니다. 컨테이너가 모두 시작되면, `.env` 파일의 `REDIS_HOST` 변수 값을 `redis`로 설정해 애플리케이션에서 Redis 인스턴스에 접속할 수 있습니다.

로컬 컴퓨터에서는 [TablePlus](https://tableplus.com)와 같은 GUI 도구로 Redis 데이터베이스에 접속할 수 있습니다. 기본적으로 Redis는 `localhost`, 포트 6379에서 접근할 수 있습니다.

<a name="meilisearch"></a>
### MeiliSearch

Sail 설치할 때 [MeiliSearch](https://www.meilisearch.com) 서비스를 선택했다면, 애플리케이션의 `docker-compose.yml` 파일에 강력한 검색 엔진인 MeiliSearch 컨테이너가 추가됩니다. MeiliSearch는 [Laravel Scout](/docs/9.x/scout) 와 [호환](https://github.com/meilisearch/meilisearch-laravel-scout)됩니다. 컨테이너가 모두 시작되면, `.env` 파일의 `MEILISEARCH_HOST` 환경 변수 값을 `http://meilisearch:7700`으로 설정해 사용합니다.

로컬 컴퓨터에서 MeiliSearch의 웹 관리 패널에 접속하려면 브라우저에서 `http://localhost:7700`으로 이동하면 됩니다.

<a name="file-storage"></a>
## 파일 스토리지

프로덕션 환경에서 파일 저장 용도로 Amazon S3를 사용할 계획이라면, Sail 설치 시 [MinIO](https://min.io) 서비스를 추가할 수 있습니다. MinIO는 로컬 개발 중 별도의 프로덕션 S3 환경에 "테스트" 버킷을 만들 필요 없이 라라벨의 `s3` 파일 스토리지 드라이버와 호환되는 S3 API를 제공합니다. MinIO를 설치하면 `docker-compose.yml` 파일에 MinIO 관련 설정이 추가됩니다.

기본적으로 애플리케이션의 `filesystems` 설정 파일에는 이미 `s3` 디스크 설정이 포함되어 있습니다. Amazon S3뿐만 아니라 MinIO 등 S3 호환 파일 스토리지와 연동하려면 관련 환경 변수를 다음과 같이 수정하면 됩니다.

```ini
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=sail
AWS_SECRET_ACCESS_KEY=password
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=local
AWS_ENDPOINT=http://minio:9000
AWS_USE_PATH_STYLE_ENDPOINT=true
```

라라벨의 Flysystem 통합 기능이 MinIO를 사용할 때 올바른 URL을 생성하도록 하려면, `AWS_URL` 환경 변수를 애플리케이션의 로컬 URL과 버킷명이 포함된 경로로 지정해 주어야 합니다.

```ini
AWS_URL=http://localhost:9000/local
```

MinIO의 콘솔(관리자 페이지)은 `http://localhost:8900`에서 접속할 수 있으며, 기본 사용자명은 `sail`, 비밀번호는 `password`입니다.

> [!WARNING]
> `temporaryUrl` 메서드를 이용해 임시 저장소 URL을 생성하는 기능은 MinIO 사용 시 지원되지 않습니다.

<a name="running-tests"></a>
## 테스트 실행하기

라라벨은 기본적으로 뛰어난 테스트 지원 기능을 제공합니다. Sail의 `test` 명령어를 이용해 애플리케이션의 [기능 및 단위 테스트](/docs/9.x/testing)를 실행할 수 있습니다. PHPUnit이 지원하는 모든 CLI 옵션도 함께 사용할 수 있습니다.

```shell
sail test

sail test --group orders
```

Sail의 `test` 명령어는 다음과 같이 Artisan의 `test` 명령어를 실행하는 것과 동일합니다.

```shell
sail artisan test
```

Sail은 기본적으로 테스트 실행 시 기존 데이터베이스와 충돌하지 않도록 전용 `testing` 데이터베이스를 생성하고, 애플리케이션의 `phpunit.xml` 파일에도 이를 사용하도록 자동으로 설정합니다.

```xml
<env name="DB_DATABASE" value="testing"/>
```

<a name="laravel-dusk"></a>
### 라라벨 Dusk

[라라벨 Dusk](/docs/9.x/dusk)는 쉽고 직관적으로 브라우저 자동화 및 테스트를 작성할 수 있는 API를 제공합니다. Sail을 사용하면 로컬에 Selenium이나 기타 도구를 별도로 설치하지 않고 Dusk 테스트를 실행할 수 있습니다. 우선, `docker-compose.yml` 파일에서 Selenium 서비스의 주석을 해제합니다.

```yaml
selenium:
    image: 'selenium/standalone-chrome'
    volumes:
        - '/dev/shm:/dev/shm'
    networks:
        - sail
```

그런 다음, `laravel.test` 서비스에 `selenium`이 `depends_on`에 포함되어 있는지 확인합니다.

```yaml
depends_on:
    - mysql
    - redis
    - selenium
```

이제 Sail을 실행한 뒤, 아래와 같이 `dusk` 명령어로 Dusk 테스트를 수행할 수 있습니다.

```shell
sail dusk
```

<a name="selenium-on-apple-silicon"></a>
#### Apple Silicon에서 Selenium 사용하기

로컬 컴퓨터에 Apple Silicon 칩이 있다면, `selenium` 서비스는 `seleniarm/standalone-chromium` 이미지를 사용해야 합니다.

```yaml
selenium:
    image: 'seleniarm/standalone-chromium'
    volumes:
        - '/dev/shm:/dev/shm'
    networks:
        - sail
```

<a name="previewing-emails"></a>
## 이메일 미리보기

라라벨 Sail의 기본 `docker-compose.yml` 파일에는 [Mailpit](https://github.com/axllent/mailpit) 서비스도 포함되어 있습니다. Mailpit은 로컬 개발 환경에서 애플리케이션이 보내는 이메일을 가로채 웹 인터페이스에서 직접 미리볼 수 있는 편리한 도구입니다. Sail 환경에서 Mailpit의 기본 호스트는 `mailpit`이며, 포트 1025를 사용합니다.

```ini
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_ENCRYPTION=null
```

Sail이 실행 중일 때 웹 브라우저로 http://localhost:8025 에 접속해 Mailpit 웹 인터페이스를 사용할 수 있습니다.

<a name="sail-container-cli"></a>
## 컨테이너 CLI 명령어 사용

가끔 애플리케이션 컨테이너에서 Bash 세션을 시작해 내부 파일이나 설치된 서비스 확인, 임의의 셸 명령어 실행 등이 필요할 수 있습니다. 이럴 땐 `shell` 명령어를 사용해 컨테이너에 직접 접속할 수 있습니다.

```shell
sail shell

sail root-shell
```

또한, [Laravel Tinker](https://github.com/laravel/tinker) 세션을 시작하려면 다음과 같이 `tinker` 명령어를 사용합니다.

```shell
sail tinker
```

<a name="sail-php-versions"></a>
## PHP 버전

Sail은 PHP 8.2, 8.1, 8.0, 7.4 등 다양한 버전으로 애플리케이션을 실행할 수 있게 지원합니다. 기본적으로는 PHP 8.2가 사용됩니다. PHP 버전을 변경하려면 `docker-compose.yml`의 `laravel.test` 컨테이너의 `build` 항목을 다음과 같이 수정하면 됩니다.

```yaml
# PHP 8.2
context: ./vendor/laravel/sail/runtimes/8.2

# PHP 8.1
context: ./vendor/laravel/sail/runtimes/8.1

# PHP 8.0
context: ./vendor/laravel/sail/runtimes/8.0

# PHP 7.4
context: ./vendor/laravel/sail/runtimes/7.4
```

또한, 사용하는 PHP 버전에 맞게 `image` 이름도 변경할 수 있습니다. 이 설정 역시 `docker-compose.yml` 파일에서 관리합니다.

```yaml
image: sail-8.1/app
```

설정을 변경한 뒤에는 반드시 컨테이너 이미지를 다시 빌드해야 합니다.

```shell
sail build --no-cache

sail up
```

<a name="sail-node-versions"></a>
## Node 버전

기본적으로 Sail은 Node 18을 설치합니다. 빌드 이미지에 설치되는 Node 버전을 바꾸고 싶다면, `docker-compose.yml` 파일의 `laravel.test` 서비스에서 `build.args` 항목의 `NODE_VERSION` 값을 원하는 버전으로 변경하면 됩니다.

```yaml
build:
    args:
        WWWGROUP: '${WWWGROUP}'
        NODE_VERSION: '14'
```

변경 후에는 컨테이너 이미지를 다시 빌드해야 합니다.

```shell
sail build --no-cache

sail up
```

<a name="sharing-your-site"></a>
## 사이트 공유하기

동료에게 웹사이트를 미리 보여주거나, 웹훅 등 외부와의 연동 테스트를 위해 사이트를 외부에 임시로 공개해야 할 때가 있습니다. 이럴 때 `share` 명령어를 사용하면 됩니다. 명령어 실행 시 무작위로 생성된 `laravel-sail.site` 도메인이 할당되어 외부에서 접속할 수 있게 됩니다.

```shell
sail share
```

`share` 명령어로 사이트를 공유할 때는, 애플리케이션의 `TrustProxies` 미들웨어에서 신뢰할 수 있는 프록시 설정을 해주어야 URL 생성 헬퍼(`url`, `route` 등)가 올바른 HTTP 호스트 정보를 사용할 수 있습니다.

```
/**
 * The trusted proxies for this application.
 *
 * @var array|string|null
 */
protected $proxies = '*';
```

특정 서브도메인으로 사이트를 공유하고 싶을 때는 `share` 명령어 실행 시 `subdomain` 옵션을 지정할 수 있습니다.

```shell
sail share --subdomain=my-sail-site
```

> [!NOTE]
> `share` 명령어는 [BeyondCode](https://beyondco.de)에서 제공하는 오픈소스 터널링 서비스 [Expose](https://github.com/beyondcode/expose)를 기반으로 동작합니다.

<a name="debugging-with-xdebug"></a>
## Xdebug로 디버깅하기

라라벨 Sail의 Docker 설정에는 PHP를 위한 강력한 디버거인 [Xdebug](https://xdebug.org/)가 지원됩니다. Xdebug를 활성화하려면 몇 가지 변수를 애플리케이션의 `.env` 파일에 추가해 [Xdebug 설정](https://xdebug.org/docs/step_debug#mode)을 해야 하며, Sail을 시작하기 전에 올바른 모드 값을 지정해야 합니다.

```ini
SAIL_XDEBUG_MODE=develop,debug,coverage
```

#### Linux 호스트 IP 설정

내부적으로 `XDEBUG_CONFIG` 환경 변수는 `client_host=host.docker.internal`로 지정되어 있어서 Mac 및 Windows(WSL2) 환경에서 자동으로 Xdebug가 동작합니다. 만약 로컬 머신이 Linux라면, Docker Engine 17.06.0+ 및 Compose 1.16.0+ 버전 이상을 사용하는지 확인해야 하며, 그렇지 않다면 아래와 같이 환경 변수를 수동으로 정의해야 할 수도 있습니다.

가장 먼저 아래 명령어로 환경 변수에 추가할 올바른 호스트 IP 주소를 알아내야 합니다. `<container-name>`에는 애플리케이션을 구동하는 컨테이너명을 입력합니다. 일반적으로 `_laravel.test_1`로 끝나는 이름입니다.

```shell
docker inspect -f {{range.NetworkSettings.Networks}}{{.Gateway}}{{end}} <container-name>
```

알맞은 호스트 IP를 알게 됐다면, `.env` 파일에 `SAIL_XDEBUG_CONFIG` 변수를 다음과 같이 추가합니다.

```ini
SAIL_XDEBUG_CONFIG="client_host=<host-ip-address>"
```

<a name="xdebug-cli-usage"></a>
### Xdebug CLI 사용법

`debug` 명령어를 활용하면 Artisan 명령어 실행 시 디버깅 세션을 시작할 수 있습니다.

```shell
# Xdebug 없이 Artisan 명령어 실행...
sail artisan migrate

# Xdebug와 함께 Artisan 명령어 실행...
sail debug migrate
```

<a name="xdebug-browser-usage"></a>
### Xdebug 브라우저 사용법

웹 브라우저에서 애플리케이션을 직접 조작하면서 디버깅하려면, [Xdebug 공식 가이드](https://xdebug.org/docs/step_debug#web-application)를 참고해 브라우저에서 Xdebug 세션을 시작하세요.

PhpStorm을 사용하는 경우, [0-설정 디버깅](https://www.jetbrains.com/help/phpstorm/zero-configuration-debugging.html)에 대해 JetBrain 공식 문서를 참고하면 도움이 됩니다.

> [!WARNING]
> 라라벨 Sail은 애플리케이션을 서비스할 때 `artisan serve`를 사용합니다. `artisan serve` 명령은 라라벨 8.53.0 버전부터서만 `XDEBUG_CONFIG` 및 `XDEBUG_MODE` 변수를 인식합니다. 8.52.0 이하의 버전은 이 변수를 지원하지 않아 디버깅 연결이 불가능합니다.

<a name="sail-customization"></a>
## 커스터마이즈

Sail은 기본적으로 Docker 환경을 사용하기 때문에 거의 모든 부분을 자유롭게 커스터마이즈할 수 있습니다. Sail에서 사용하는 Dockerfile들을 직접 프로젝트에 복사하려면 다음 명령어를 실행하세요.

```shell
sail artisan sail:publish
```

명령 실행 후, 라라벨 Sail에 사용되는 Dockerfile과 기타 설정 파일들이 애플리케이션의 루트에 `docker` 디렉터리 내부에 생성됩니다. 커스터마이즈를 마친 뒤에는 `docker-compose.yml` 파일에서 애플리케이션 컨테이너의 이미지 이름 변경을 고려할 수 있고, 변경 후에는 반드시 컨테이너를 다시 빌드해야 합니다. 여러 개의 라라벨 애플리케이션을 한 컴퓨터에서 개발할 때, 이미지를 고유하게 지정하는 것이 특히 중요합니다.

```shell
sail build --no-cache
```
