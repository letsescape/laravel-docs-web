# 라라벨 세일 (Laravel Sail)

- [소개](#introduction)
- [설치 및 설정](#installation)
    - [기존 애플리케이션에 Sail 설치하기](#installing-sail-into-existing-applications)
    - [Bash 별칭 설정](#configuring-a-bash-alias)
- [Sail 시작 및 중지](#starting-and-stopping-sail)
- [명령어 실행](#executing-sail-commands)
    - [PHP 명령어 실행](#executing-php-commands)
    - [Composer 명령어 실행](#executing-composer-commands)
    - [Artisan 명령어 실행](#executing-artisan-commands)
    - [Node / NPM 명령어 실행](#executing-node-npm-commands)
- [데이터베이스 활용](#interacting-with-sail-databases)
    - [MySQL](#mysql)
    - [Redis](#redis)
    - [MeiliSearch](#meilisearch)
- [파일 스토리지](#file-storage)
- [테스트 실행하기](#running-tests)
    - [Laravel Dusk](#laravel-dusk)
- [이메일 미리보기](#previewing-emails)
- [컨테이너 CLI](#sail-container-cli)
- [PHP 버전](#sail-php-versions)
- [Node 버전](#sail-node-versions)
- [사이트 공유하기](#sharing-your-site)
- [Xdebug로 디버깅하기](#debugging-with-xdebug)
  - [Xdebug CLI 사용법](#xdebug-cli-usage)
  - [Xdebug 브라우저 사용법](#xdebug-browser-usage)
- [커스터마이즈](#sail-customization)

<a name="introduction"></a>
## 소개

[라라벨 세일](https://github.com/laravel/sail)은 라라벨의 기본 Docker 개발 환경과 상호작용할 수 있도록 해주는 경량 커맨드라인 인터페이스(CLI)입니다. Sail을 사용하면 Docker에 대한 별도의 경험 없이도 PHP, MySQL, Redis로 라라벨 애플리케이션을 손쉽게 시작할 수 있습니다.

Sail의 핵심은 프로젝트 루트에 위치한 `docker-compose.yml` 파일과 `sail` 스크립트입니다. 이 `sail` 스크립트는 `docker-compose.yml`에 정의된 Docker 컨테이너들과 편리하게 상호작용할 수 있는 CLI 기능을 제공합니다.

라라벨 세일은 macOS, Linux, Windows(및 [WSL2](https://docs.microsoft.com/en-us/windows/wsl/about)) 환경에서 지원됩니다.

<a name="installation"></a>
## 설치 및 설정

라라벨 Sail은 새로운 라라벨 프로젝트를 생성할 때 자동으로 함께 설치됩니다. 즉시 사용하실 수 있습니다. 새로운 라라벨 애플리케이션을 만드는 방법은 각 운영체제에 맞는 라라벨의 [설치 문서](/docs/8.x/installation)를 참고하시기 바랍니다. 설치 과정 중, Sail에서 지원하는 어떤 서비스를 함께 사용할 것인지 묻게 됩니다.

<a name="installing-sail-into-existing-applications"></a>
### 기존 애플리케이션에 Sail 설치하기

이미 개발 중인 기존 라라벨 애플리케이션에 Sail을 도입하고 싶다면, Composer 패키지 매니저를 이용해 Sail을 쉽게 설치할 수 있습니다. 물론, 아래 단계는 Composer 의존성 설치가 가능한 개발 환경이 마련된 경우를 전제로 합니다.

```
composer require laravel/sail --dev
```

Sail 설치가 완료되면, `sail:install` Artisan 명령어를 실행할 수 있습니다. 이 명령어는 Sail의 `docker-compose.yml` 파일을 애플리케이션 루트 경로에 복사해 줍니다.

```
php artisan sail:install
```

마지막으로 Sail을 시작하면 됩니다. Sail 사용법에 대해 더 자세히 알아보려면, 이 문서의 다음 내용을 계속 읽어 내려가세요.

```
./vendor/bin/sail up
```

<a name="using-devcontainers"></a>
#### Devcontainer 사용하기

[Devcontainer](https://code.visualstudio.com/docs/remote/containers) 환경에서 개발하고 싶다면, `sail:install` 명령에 `--devcontainer` 옵션을 추가해서 실행할 수 있습니다. 이 옵션을 적용하면 Sail에서 기본 `.devcontainer/devcontainer.json` 파일을 애플리케이션 루트에 배포합니다.

```
php artisan sail:install --devcontainer
```

<a name="configuring-a-bash-alias"></a>
### Bash 별칭 설정

기본적으로 Sail 명령어는 모든 새로운 라라벨 애플리케이션에 포함되는 `vendor/bin/sail` 스크립트를 사용해 실행합니다.

```bash
./vendor/bin/sail up
```

하지만 매번 `vendor/bin/sail`을 입력하는 대신, Bash 별칭(alias)을 만들어 좀 더 쉽게 Sail 명령어를 사용할 수 있습니다.

```bash
alias sail='[ -f sail ] && bash sail || bash vendor/bin/sail'
```

이렇게 Bash 별칭을 설정하면, 단순히 `sail`만 입력해 Sail 명령어를 실행할 수 있습니다. 이 문서의 이후 예제들은 해당 별칭이 등록되어 있다고 가정하고 설명합니다.

```bash
sail up
```

<a name="starting-and-stopping-sail"></a>
## Sail 시작 및 중지

라라벨 Sail의 `docker-compose.yml` 파일에는 라라벨 애플리케이션 개발을 위해 함께 동작하는 다양한 Docker 컨테이너가 정의되어 있습니다. 이들 각각은 `docker-compose.yml` 파일의 `services` 항목에 등록되어 있으며, `laravel.test` 컨테이너가 주 애플리케이션 컨테이너 역할을 담당합니다.

Sail을 시작하기 전에, 로컬 컴퓨터에서 다른 웹 서버나 데이터베이스가 실행 중이지 않은지 확인해야 합니다. 애플리케이션의 `docker-compose.yml` 파일에 정의된 모든 Docker 컨테이너를 시작하려면 아래와 같이 `up` 명령어를 입력합니다.

```bash
sail up
```

모든 Docker 컨테이너를 백그라운드에서 실행하고 싶다면 "detached" 모드로 시작하면 됩니다.

```bash
sail up -d
```

컨테이너가 모두 정상적으로 시작되면, 브라우저에서 http://localhost 주소로 프로젝트를 확인하실 수 있습니다.

모든 컨테이너를 중지하려면 `Control + C` 단축키로 실행을 멈추면 됩니다. 만약 컨테이너가 백그라운드에서 실행 중이라면, 다음과 같이 `stop` 명령어로 중지할 수 있습니다.

```bash
sail stop
```

<a name="executing-sail-commands"></a>
## 명령어 실행

라라벨 Sail을 사용하는 경우, 여러분의 애플리케이션은 Docker 컨테이너 안에서 실행되며 로컬 컴퓨터와 분리된 환경에 있습니다. 하지만 Sail을 사용하면 임의의 PHP 명령어, Artisan 명령어, Composer 명령어, Node/NPM 명령어 등 다양한 명령어를 손쉽게 실행할 수 있습니다.

**라라벨 공식 문서에서 Composer, Artisan, Node/NPM 명령어가 Sail을 명시하지 않고 안내되는 경우가 많습니다.** 이런 예제들은 해당 도구가 로컬 컴퓨터에 설치되어 있다는 전제로 작성되어 있습니다. 그러나 Sail 환경에서 개발한다면, 이런 명령어들도 Sail을 통해 실행해야 합니다.

```bash
# (로컬 환경에서 Artisan 명령어 실행 예시)
php artisan queue:work

# (라라벨 Sail 환경에서 Artisan 명령어 실행 예시)
sail artisan queue:work
```

<a name="executing-php-commands"></a>
### PHP 명령어 실행

PHP 명령어는 `php` 명령어를 사용해 실행할 수 있습니다. 이때 사용되는 PHP 버전은 애플리케이션에 설정된 버전입니다. Sail에서 지원하는 PHP 버전에 대한 자세한 내용은 [PHP 버전 문서](#sail-php-versions)를 참고하세요.

```bash
sail php --version

sail php script.php
```

<a name="executing-composer-commands"></a>
### Composer 명령어 실행

Composer 명령어는 `composer` 명령어를 사용해 실행할 수 있습니다. 라라벨 Sail의 애플리케이션 컨테이너에는 Composer 2.x가 미리 설치되어 있습니다.

```nothing
sail composer require laravel/sanctum
```

<a name="installing-composer-dependencies-for-existing-projects"></a>
#### 기존 애플리케이션의 Composer 의존성 설치

여러 명이 함께 개발하는 프로젝트의 경우, 여러분이 처음 라라벨 애플리케이션을 만드는 사람이 아닐 수도 있습니다. 따라서 프로젝트의 Composer 의존성(및 Sail)들은 저장소를 클론한 뒤 자동으로 설치되지 않습니다.

이럴 때는 프로젝트 디렉터리에서 아래 명령어를 실행해 의존성을 설치할 수 있습니다. 이 명령어는 PHP와 Composer가 포함된 경량 Docker 컨테이너를 사용하여 애플리케이션 의존성을 설치합니다.

```nothing
docker run --rm \
    -u "$(id -u):$(id -g)" \
    -v $(pwd):/var/www/html \
    -w /var/www/html \
    laravelsail/php81-composer:latest \
    composer install --ignore-platform-reqs
```

`laravelsail/phpXX-composer` 이미지를 사용할 때는 여러분이 실제 사용할 PHP 버전(`74`, `80`, `81` 등)과 맞추어 선택해야 합니다.

<a name="executing-artisan-commands"></a>
### Artisan 명령어 실행

라라벨의 Artisan 명령어는 `artisan` 명령어를 사용해 실행할 수 있습니다.

```bash
sail artisan queue:work
```

<a name="executing-node-npm-commands"></a>
### Node / NPM 명령어 실행

Node 관련 명령어는 `node`로, NPM 명령어는 `npm`으로 실행할 수 있습니다.

```nothing
sail node --version

sail npm run prod
```

원한다면 NPM 대신 Yarn을 사용해도 됩니다.

```nothing
sail yarn
```

<a name="interacting-with-sail-databases"></a>
## 데이터베이스 활용

<a name="mysql"></a>
### MySQL

애플리케이션의 `docker-compose.yml` 파일에는 MySQL 컨테이너가 포함되어 있습니다. 이 컨테이너는 [Docker 볼륨](https://docs.docker.com/storage/volumes/)을 사용해 데이터베이스의 데이터가 컨테이너를 중지ㆍ재시작해도 보존되도록 합니다. 또한 MySQL 컨테이너가 시작될 때, 여러분의 `.env` 파일에 설정된 `DB_DATABASE` 변수 값과 동일한 데이터베이스가 자동으로 생성됩니다.

컨테이너가 모두 실행된 후, 애플리케이션 내에서 MySQL 인스턴스에 접속하려면 `.env` 파일에서 `DB_HOST`를 `mysql`로 지정하면 됩니다.

로컬 컴퓨터에서 애플리케이션의 MySQL 데이터베이스에 접속하려면 [TablePlus](https://tableplus.com)와 같은 GUI 데이터베이스 관리 도구를 사용할 수 있습니다. 기본적으로 MySQL 데이터베이스는 `localhost`의 3306 포트로 접근이 가능합니다.

<a name="redis"></a>
### Redis

애플리케이션의 `docker-compose.yml` 파일에는 [Redis](https://redis.io) 컨테이너 역시 포함되어 있습니다. 이 컨테이너도 [Docker 볼륨](https://docs.docker.com/storage/volumes/)을 사용하여 컨테이너 중지나 재시작 시에도 Redis 데이터를 보존합니다. 컨테이너 실행 후 `.env` 파일에서 `REDIS_HOST`를 `redis`로 지정하면 애플리케이션 내에서 Redis 인스턴스에 접근할 수 있습니다.

로컬 컴퓨터에서 애플리케이션의 Redis 데이터베이스에 접속하려면 [TablePlus](https://tableplus.com) 등의 데이터베이스 관리 도구를 사용할 수 있습니다. 기본적으로 Redis는 `localhost`의 6379 포트에서 접근할 수 있습니다.

<a name="meilisearch"></a>
### MeiliSearch

Sail 설치 시 [MeiliSearch](https://www.meilisearch.com) 서비스를 함께 설치하도록 선택했다면, 애플리케이션의 `docker-compose.yml` 파일에 MeiliSearch 컨테이너 설정이 추가됩니다. MeiliSearch는 [Laravel Scout](/docs/8.x/scout)과 [호환](https://github.com/meilisearch/meilisearch-laravel-scout)되며, 강력한 검색 엔진을 제공합니다. 컨테이너 실행 후 `.env` 파일에서 `MEILISEARCH_HOST`를 `http://meilisearch:7700`으로 설정하면 애플리케이션 내에서 MeiliSearch에 연결할 수 있습니다.

로컬 컴퓨터에서 MeiliSearch의 웹 기반 관리 패널은 브라우저에서 `http://localhost:7700`으로 접속해 사용합니다.

<a name="file-storage"></a>
## 파일 스토리지

프로덕션 환경에서 Amazon S3를 이용해 파일을 저장할 계획이라면, Sail 설치 시 [MinIO](https://min.io) 서비스를 함께 추가하는 것을 추천합니다. MinIO는 S3와 호환되는 API를 제공하며, 프로덕션 환경의 S3에서 "테스트" 버킷을 만들 필요 없이 라라벨의 `s3` 파일 스토리지 드라이버를 로컬 환경에서 개발용으로 사용할 수 있게 해 줍니다. Sail 설치 시 MinIO를 선택하면, 애플리케이션의 `docker-compose.yml` 파일에 MinIO 구성 항목이 추가됩니다.

기본적으로 여러분의 애플리케이션 `filesystems` 설정 파일에는 이미 `s3` 디스크 구성이 포함되어 있습니다. 이 디스크를 Amazon S3뿐 아니라 MinIO 등 S3 호환 파일 스토리지 서비스와도 함께 사용할 수 있으며, 관련 환경 변수를 적절히 설정하면 바로 동작합니다. 예를 들어 MinIO 사용할 경우 아래와 같이 환경 변수를 지정합니다.

```ini
FILESYSTEM_DRIVER=s3
AWS_ACCESS_KEY_ID=sail
AWS_SECRET_ACCESS_KEY=password
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=local
AWS_ENDPOINT=http://minio:9000
AWS_USE_PATH_STYLE_ENDPOINT=true
```

<a name="running-tests"></a>
## 테스트 실행하기

라라벨은 기본적으로 강력한 테스트 기능을 제공합니다. Sail에서는 `test` 명령어를 통해 [기능 및 단위 테스트](/docs/8.x/testing)를 실행할 수 있습니다. PHPUnit이 지원하는 모든 CLI 옵션 역시 함께 사용할 수 있습니다.

```
sail test

sail test --group orders
```

Sail의 `test` 명령어는 아래와 같이 `test` Artisan 명령어를 실행하는 것과 동일합니다.

```
sail artisan test
```

<a name="laravel-dusk"></a>
### Laravel Dusk

[Laravel Dusk](/docs/8.x/dusk)는 편리하고 직관적인 브라우저 자동화 및 테스트 API를 제공합니다. Sail을 이용하면 Selenium 등 별도의 도구를 로컬에 설치하지 않고도 이런 테스트를 실행할 수 있습니다. 먼저, 애플리케이션의 `docker-compose.yml` 파일에서 Selenium 서비스를 주석 해제하세요.

```yaml
selenium:
    image: 'selenium/standalone-chrome'
    volumes:
        - '/dev/shm:/dev/shm'
    networks:
        - sail
```

그리고 `docker-compose.yml` 파일에서 `laravel.test` 서비스의 `depends_on` 항목에 `selenium`도 추가되어 있는지 확인하세요.

```yaml
depends_on:
    - mysql
    - redis
    - selenium
```

이제 Sail을 시작한 뒤 아래와 같이 `dusk` 명령어로 Dusk 테스트를 실행할 수 있습니다.

```
sail dusk
```

<a name="selenium-on-apple-silicon"></a>
#### Apple Silicon에서 Selenium 사용하기

로컬 컴퓨터가 Apple Silicon 칩(M1/M2 등)을 사용한다면, `selenium` 서비스에서 `seleniarm/standalone-chromium` 이미지를 사용해야 합니다.

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

라라벨 Sail의 기본 `docker-compose.yml` 파일에는 [MailHog](https://github.com/mailhog/MailHog) 서비스가 포함되어 있습니다. MailHog는 개발 중 애플리케이션에서 전송되는 이메일을 가로채 웹 인터페이스로 미리볼 수 있게 해줍니다. Sail을 사용할 때 MailHog의 기본 호스트명은 `mailhog`이고, 1025 포트를 사용합니다.

```bash
MAIL_HOST=mailhog
MAIL_PORT=1025
MAIL_ENCRYPTION=null
```

Sail이 실행 중이라면 브라우저에서 http://localhost:8025 주소를 입력해 MailHog 웹 인터페이스에 접속할 수 있습니다.

<a name="sail-container-cli"></a>
## 컨테이너 CLI

때로는 애플리케이션의 컨테이너 안에서 Bash 세션을 열고 싶을 수 있습니다. `shell` 명령어를 사용하면 애플리케이션 컨테이너에 접속해 파일 확인, 설치된 서비스 점검, 임의의 shell 명령 실행 등을 할 수 있습니다.

```nothing
sail shell

sail root-shell
```

또한 [Laravel Tinker](https://github.com/laravel/tinker) 세션을 새로 시작하고 싶을 때는 다음과 같이 `tinker` 명령어를 실행하면 됩니다.

```bash
sail tinker
```

<a name="sail-php-versions"></a>
## PHP 버전

Sail은 현재 PHP 8.1, PHP 8.0, PHP 7.4 버전으로 애플리케이션을 실행할 수 있습니다. Sail의 기본 PHP 버전은 8.1입니다. 애플리케이션에서 사용하는 PHP 버전을 변경하려면, `docker-compose.yml` 파일의 `laravel.test` 컨테이너의 `build` 정의를 아래처럼 수정하면 됩니다.

```yaml
# PHP 8.1
context: ./vendor/laravel/sail/runtimes/8.1

# PHP 8.0
context: ./vendor/laravel/sail/runtimes/8.0

# PHP 7.4
context: ./vendor/laravel/sail/runtimes/7.4
```

또한 이미지 이름(`image`) 역시 PHP 버전과 맞춰서 변경해 주는 것이 좋습니다. 이 설정도 `docker-compose.yml` 파일에서 조정할 수 있습니다.

```yaml
image: sail-8.1/app
```

이후 컨테이너 이미지를 재빌드합니다.

```
sail build --no-cache

sail up
```

<a name="sail-node-versions"></a>
## Node 버전

Sail은 기본적으로 Node 16을 설치합니다. 빌드 시 설치되는 Node 버전을 변경하려면, `docker-compose.yml` 파일에서 `laravel.test` 서비스의 `build.args`를 아래와 같이 수정하면 됩니다.

```yaml
build:
    args:
        WWWGROUP: '${WWWGROUP}'
        NODE_VERSION: '14'
```

이후 컨테이너 이미지를 다시 빌드해주어야 합니다.

```
sail build --no-cache

sail up
```

<a name="sharing-your-site"></a>
## 사이트 공유하기

동료에게 사이트를 보여주거나, 외부에서 애플리케이션에 webhook 테스트를 할 때 사이트를 임시로 외부에 공개하고 싶을 수 있습니다. 이럴 때는 `share` 명령어를 사용해서 사이트를 공유할 수 있습니다. 명령어를 실행하면, 애플리케이션에 접근할 수 있는 임의의 `laravel-sail.site` 도메인이 발급됩니다.

```
sail share
```

`share` 명령어로 사이트를 공유할 때는 애플리케이션의 trusted proxy 미들웨어(`TrustProxies`)를 올바르게 설정해야 합니다. 그렇지 않으면, `url`이나 `route` 등의 URL 생성 헬퍼가 올바른 HTTP 호스트를 판단할 수 없습니다.

```
/**
 * The trusted proxies for this application.
 *
 * @var array|string|null
 */
protected $proxies = '*';
```

공유 URL의 서브도메인을 직접 지정하고 싶을 때는 `subdomain` 옵션을 함께 사용할 수 있습니다.

```
sail share --subdomain=my-sail-site
```

> [!TIP]
> `share` 명령어는 [BeyondCode](https://beyondco.de)에서 제공하는 오픈소스 터널링 서비스 [Expose](https://github.com/beyondcode/expose)를 사용합니다.

<a name="debugging-with-xdebug"></a>
## Xdebug로 디버깅하기

라라벨 Sail의 Docker 설정에는 [Xdebug](https://xdebug.org/) 지원이 내장되어 있습니다. Xdebug는 PHP에서 널리 사용되는 강력한 디버거입니다. Xdebug를 사용하려면 애플리케이션 `.env` 파일에 몇 가지 변수를 추가해 [Xdebug 설정](https://xdebug.org/docs/step_debug#mode)을 준비해야 합니다. Xdebug를 활성화하려면, Sail을 시작하기 전에 아래와 같이 모드를 지정하세요.

```ini
SAIL_XDEBUG_MODE=develop,debug
```

#### 리눅스 호스트 IP 설정

내부적으로 `XDEBUG_CONFIG` 환경 변수는 `client_host=host.docker.internal`로 설정되어 Mac과 Windows(WSL2) 환경에 맞게 작동합니다. 하지만 리눅스 사용자의 경우, 이 환경 변수를 별도로 지정해야 할 수 있습니다.

먼저 아래 명령어로 올바른 호스트 IP 주소를 확인합니다. `<container-name>`에는 보통 `_laravel.test_1`로 끝나는 애플리케이션 컨테이너의 이름을 입력합니다.

```bash
docker inspect -f {{range.NetworkSettings.Networks}}{{.Gateway}}{{end}} <container-name>
```

획득한 IP 주소로 `.env` 파일에 `SAIL_XDEBUG_CONFIG` 변수를 다음과 같이 정의합니다.

```ini
SAIL_XDEBUG_CONFIG="client_host=<host-ip-address>"
```

<a name="xdebug-cli-usage"></a>
### Xdebug CLI 사용법

Artisan 명령어 실행 시 디버깅 세션을 시작하려면 `sail debug` 명령어를 사용합니다.

```bash
# Xdebug 없이 Artisan 명령어 실행...
sail artisan migrate

# Xdebug 활성화 후 Artisan 명령어 실행...
sail debug migrate
```

<a name="xdebug-browser-usage"></a>
### Xdebug 브라우저 사용법

웹 브라우저를 통해 애플리케이션을 이용하면서 디버깅하려면, Xdebug의 [웹 애플리케이션용 세션 시작 안내](https://xdebug.org/docs/step_debug#web-application)를 참고해 세션을 시작하십시오.

PhpStorm을 사용한다면, JetBrain 공식 문서에서 [제로 구성 디버깅](https://www.jetbrains.com/help/phpstorm/zero-configuration-debugging.html) 내용을 확인하시기 바랍니다.

> [!NOTE]
> 라라벨 Sail은 애플리케이션 서비스를 위해 `artisan serve`를 사용합니다. `artisan serve` 명령은 라라벨 8.53.0 이상에서만 `XDEBUG_CONFIG` 및 `XDEBUG_MODE` 변수를 지원합니다. 8.52.0 이하 버전의 라라벨에서는 이 변수들이 지원되지 않으므로 디버그 접속이 동작하지 않습니다.

<a name="sail-customization"></a>
## 커스터마이즈

Sail은 Docker 기반이므로 거의 모든 부분을 자유롭게 변경할 수 있습니다. Sail의 Dockerfile 등을 프로젝트에 복사하려면 아래와 같이 `sail:publish` 명령어를 실행합니다.

```bash
sail artisan sail:publish
```

이 명령을 실행하면, 라라벨 Sail이 사용하는 Dockerfile 등 각종 설정 파일이 애플리케이션 루트의 `docker` 디렉터리에 복사됩니다. Sail 환경을 원하는 대로 커스터마이징한 뒤, `docker-compose.yml`에서 애플리케이션 컨테이너의 이미지 이름을 변경하고, 아래와 같이 `build` 명령어로 컨테이너를 재빌드할 수 있습니다. 여러 개의 라라벨 애플리케이션을 한 대의 머신에서 개발하는 경우, 애플리케이션마다 이미지 이름을 다르게 지정하는 것이 특히 유용합니다.

```bash
sail build --no-cache
```