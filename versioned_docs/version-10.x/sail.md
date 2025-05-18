# 라라벨 Sail (Laravel Sail)

- [소개](#introduction)
- [설치 및 설정](#installation)
    - [기존 애플리케이션에 Sail 설치하기](#installing-sail-into-existing-applications)
    - [Shell 별칭(alias) 설정하기](#configuring-a-shell-alias)
- [Sail 시작 및 중지](#starting-and-stopping-sail)
- [명령어 실행하기](#executing-sail-commands)
    - [PHP 명령어 실행](#executing-php-commands)
    - [Composer 명령어 실행](#executing-composer-commands)
    - [Artisan 명령어 실행](#executing-artisan-commands)
    - [Node / NPM 명령어 실행](#executing-node-npm-commands)
- [데이터베이스와 상호작용하기](#interacting-with-sail-databases)
    - [MySQL](#mysql)
    - [Redis](#redis)
    - [Meilisearch](#meilisearch)
    - [Typesense](#typesense)
- [파일 저장소](#file-storage)
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
- [커스터마이징](#sail-customization)

<a name="introduction"></a>
## 소개

[라라벨 Sail](https://github.com/laravel/sail)은 라라벨 기본 Docker 개발 환경과 상호작용할 수 있는 가벼운 명령줄 인터페이스(CLI)입니다. Sail을 사용하면 Docker 사용 경험이 없어도 PHP, MySQL, Redis를 활용하여 라라벨 애플리케이션을 쉽게 구축할 수 있습니다.

Sail의 핵심은 프로젝트 최상위 디렉터리에 위치한 `docker-compose.yml` 파일과 `sail` 스크립트입니다. `sail` 스크립트는 `docker-compose.yml`로 정의된 Docker 컨테이너들과 편리하게 상호작용할 수 있는 CLI를 제공합니다.

라라벨 Sail은 macOS, Linux, 그리고 Windows( [WSL2](https://docs.microsoft.com/en-us/windows/wsl/about) 를 통해)에서 지원됩니다.

<a name="installation"></a>
## 설치 및 설정

라라벨 Sail은 모든 새로운 라라벨 애플리케이션에 자동으로 설치되므로 바로 사용할 수 있습니다. 새로운 라라벨 애플리케이션을 만드는 방법은 운영체제에 맞는 라라벨 [설치 문서](/docs/10.x/installation#docker-installation-using-sail)를 참고하세요. 설치 과정에서 Sail이 지원하는 서비스 중, 어떤 서비스를 사용할지 선택하게 됩니다.

<a name="installing-sail-into-existing-applications"></a>
### 기존 애플리케이션에 Sail 설치하기

기존 라라벨 애플리케이션에서 Sail을 사용하고 싶은 경우, Composer 패키지 관리자를 이용해 Sail을 설치할 수 있습니다. (이 단계는 로컬 개발 환경에서 Composer 패키지 설치가 가능한 상황을 전제로 합니다.)

```shell
composer require laravel/sail --dev
```

Sail 설치가 완료되면, `sail:install` 아티즌 명령어를 실행할 수 있습니다. 이 명령어는 Sail의 `docker-compose.yml` 파일을 애플리케이션 최상위 디렉터리에 복사하고, Docker 서비스에 연결하기 위해 `.env` 파일에 필요한 환경 변수도 자동으로 추가해줍니다.

```shell
php artisan sail:install
```

마지막으로 Sail을 시작하면 됩니다. Sail 사용법에 대해 더 알아보고 싶으시다면 아래 설명을 계속 읽어주세요.

```shell
./vendor/bin/sail up
```

> [!WARNING]
> 만약 Linux에서 Docker Desktop을 사용한다면, 아래 명령어를 실행해서 `default` Docker 컨텍스트를 사용하도록 설정해야 합니다: `docker context use default`.

<a name="adding-additional-services"></a>
#### 추가 서비스 설치하기

이미 Sail이 설치된 환경에 다른 서비스를 추가하고 싶다면, `sail:add` 아티즌 명령어를 실행하면 됩니다.

```shell
php artisan sail:add
```

<a name="using-devcontainers"></a>
#### Devcontainer 사용하기

[Devcontainer](https://code.visualstudio.com/docs/remote/containers) 환경에서 개발하고자 할 경우, `sail:install` 명령어에 `--devcontainer` 옵션을 추가할 수 있습니다. 이 옵션을 사용하면, 기본 `.devcontainer/devcontainer.json` 파일이 애플리케이션 최상위 디렉터리에 생성됩니다.

```shell
php artisan sail:install --devcontainer
```

<a name="configuring-a-shell-alias"></a>
### Shell 별칭(alias) 설정하기

기본적으로 Sail 명령어는 모든 새로운 라라벨 애플리케이션에 포함된 `vendor/bin/sail` 스크립트를 통해 실행합니다.

```shell
./vendor/bin/sail up
```

하지만 매번 `vendor/bin/sail`를 입력하는 대신 shell 별칭을 설정하면 Sail 명령어를 더 쉽게 실행할 수 있습니다.

```shell
alias sail='sh $([ -f sail ] && echo sail || echo vendor/bin/sail)'
```

이 별칭이 항상 적용되도록 하려면, 사용 중인 shell의 설정 파일(예: `~/.zshrc` 또는 `~/.bashrc`)에 위 명령어를 추가한 후, shell을 재시작하면 됩니다.

별칭을 설정한 후에는 다음과 같이 Sail 명령어를 간단히 입력할 수 있습니다. 본 문서의 예제들도 별칭 사용을 전제로 작성되어 있습니다.

```shell
sail up
```

<a name="starting-and-stopping-sail"></a>
## Sail 시작 및 중지

라라벨 Sail의 `docker-compose.yml` 파일은 라라벨 애플리케이션 개발을 위해 함께 작동하는 다양한 Docker 컨테이너를 정의합니다. 각 컨테이너는 `docker-compose.yml`의 `services` 설정 안에 항목으로 포함되어 있고, 이 중 `laravel.test` 컨테이너가 주요 애플리케이션 서버 역할을 합니다.

Sail을 시작하기 전에, 로컬 컴퓨터에서 다른 웹 서버나 데이터베이스가 실행 중이 아닌지 확인하세요. 애플리케이션의 `docker-compose.yml`에 정의된 모든 Docker 컨테이너를 시작하려면 `up` 명령어를 실행합니다.

```shell
sail up
```

컨테이너들을 백그라운드(Detached) 모드로 실행하려면 다음과 같이 입력합니다.

```shell
sail up -d
```

컨테이너들이 시작되면 웹 브라우저를 통해 http://localhost에서 프로젝트에 접속할 수 있습니다.

모든 컨테이너를 종료하려면 단순히 Control + C를 누르면 됩니다. 백그라운드로 실행 중인 경우에는 `stop` 명령어를 사용하면 됩니다.

```shell
sail stop
```

<a name="executing-sail-commands"></a>
## 명령어 실행하기

라라벨 Sail을 사용할 때, 애플리케이션은 Docker 컨테이너 내에서 실행되며 로컬 컴퓨터와 분리되어 있습니다. 하지만 Sail은 다양한 명령어(PHP, Artisan, Composer, Node / NPM 등)를 간편하게 실행할 수 있는 방법을 제공합니다.

**라라벨 공식 문서를 보면 Composer, Artisan, Node / NPM 명령어 예제가 있는데, Sail을 명시하지 않은 경우가 많습니다.** 이는 해당 도구들이 로컬에 직접 설치되어 있다는 전제를 가진 예시입니다. Sail을 이용한다면, 이러한 명령어도 아래와 같이 Sail을 통해 실행해야 합니다.

```shell
# 로컬에서 Artisan 명령어 실행 ...
php artisan queue:work

# Laravel Sail을 통해 Artisan 명령어 실행 ...
sail artisan queue:work
```

<a name="executing-php-commands"></a>
### PHP 명령어 실행

PHP 명령어는 `php` 커맨드를 통해 실행할 수 있습니다. 이때 사용되는 PHP 버전은 애플리케이션에서 설정한 버전이 사용됩니다. Sail에서 지원하는 PHP 버전에 대해 자세히 알고 싶다면 [PHP 버전 문서](#sail-php-versions)를 참고하세요.

```shell
sail php --version

sail php script.php
```

<a name="executing-composer-commands"></a>
### Composer 명령어 실행

Composer 명령어는 `composer` 커맨드를 통해 실행할 수 있습니다. 라라벨 Sail의 애플리케이션 컨테이너에는 Composer 2.x가 기본 설치되어 있습니다.

```nothing
sail composer require laravel/sanctum
```

<a name="installing-composer-dependencies-for-existing-projects"></a>
#### 기존 애플리케이션의 Composer 의존성 설치

여러 명이 함께 개발하는 프로젝트라면, 처음 라라벨 프로젝트를 만든 사람이 아닐 수 있습니다. 따라서, 애플리케이션의 Composer 의존성(즉, Sail 포함)이 프로젝트 복제 후 설치되어 있지 않을 수 있습니다.

이런 경우 애플리케이션 디렉터리 안에서 다음 명령어를 실행해 의존 패키지를 설치할 수 있습니다. 이 명령어는 PHP와 Composer가 포함된 작은 Docker 컨테이너를 사용합니다.

```shell
docker run --rm \
    -u "$(id -u):$(id -g)" \
    -v "$(pwd):/var/www/html" \
    -w /var/www/html \
    laravelsail/php83-composer:latest \
    composer install --ignore-platform-reqs
```

`laravelsail/phpXX-composer` 이미지를 사용할 때는 애플리케이션에서 사용하려는 PHP 버전(`80`, `81`, `82`, `83` 중 하나)을 맞추어 사용해야 합니다.

<a name="executing-artisan-commands"></a>
### Artisan 명령어 실행

라라벨 Artisan 명령어는 `artisan` 커맨드를 통해 실행할 수 있습니다.

```shell
sail artisan queue:work
```

<a name="executing-node-npm-commands"></a>
### Node / NPM 명령어 실행

Node 명령어는 `node`, NPM 명령어는 `npm`을 사용해 실행할 수 있습니다.

```shell
sail node --version

sail npm run dev
```

원한다면 NPM 대신 Yarn을 사용할 수도 있습니다.

```shell
sail yarn
```

<a name="interacting-with-sail-databases"></a>
## 데이터베이스와 상호작용하기

<a name="mysql"></a>
### MySQL

애플리케이션의 `docker-compose.yml` 파일에는 MySQL 컨테이너에 대한 항목이 있습니다. 이 컨테이너는 [Docker 볼륨](https://docs.docker.com/storage/volumes/)을 사용하므로, 컨테이너를 중지하거나 다시 시작해도 데이터가 보존됩니다.

또한, MySQL 컨테이너가 처음 시작될 때 두 개의 데이터베이스가 자동으로 생성됩니다. 첫 번째는 `DB_DATABASE` 환경 변수의 값으로 된 데이터베이스로, 개발용입니다. 두 번째는 테스트 전용 데이터베이스인 `testing`이며, 테스트 데이터와 개발 데이터가 섞이지 않도록 해줍니다.

컨테이너를 시작한 후에는, 애플리케이션의 `.env` 파일에서 `DB_HOST` 환경 변수를 `mysql`로 설정하면 컨테이너 내부 MySQL에 연결할 수 있습니다.

로컬 PC에서 애플리케이션의 MySQL 데이터베이스에 접속하려면 [TablePlus](https://tableplus.com)와 같은 GUI 데이터베이스 관리 앱을 사용할 수 있습니다. 기본적으로 MySQL 데이터베이스는 `localhost`의 3306 포트에서 접근할 수 있으며, 접속 계정은 `.env`의 `DB_USERNAME`, `DB_PASSWORD` 값을 사용합니다. 혹은 `root` 유저로 접속해도 되며, 이때도 비밀번호는 `DB_PASSWORD` 값을 사용합니다.

<a name="redis"></a>
### Redis

애플리케이션의 `docker-compose.yml` 파일에는 [Redis](https://redis.io) 컨테이너에 대한 항목도 포함되어 있습니다. 이 컨테이너 역시 [Docker 볼륨](https://docs.docker.com/storage/volumes/)을 사용해, 컨테이너가 중지되거나 재시작되어도 데이터가 보존됩니다. 컨테이너를 시작한 후에는, 애플리케이션의 `.env` 파일에서 `REDIS_HOST` 환경 변수를 `redis`로 설정하여 내부 Redis에 접속할 수 있습니다.

로컬 머신에서 Redis 데이터베이스에 연결할 때는 [TablePlus](https://tableplus.com)와 같은 앱을 활용할 수 있습니다. 기본적으로 Redis는 `localhost` 포트 6379에서 접근할 수 있습니다.

<a name="meilisearch"></a>
### Meilisearch

Sail 설치 시 [Meilisearch](https://www.meilisearch.com) 서비스를 선택했다면, 애플리케이션의 `docker-compose.yml` 파일에 이 강력한 검색엔진에 대한 항목이 추가됩니다. Meilisearch는 [Laravel Scout](/docs/10.x/scout)와 [호환](https://github.com/meilisearch/meilisearch-laravel-scout)됩니다. 컨테이너를 시작한 후, 애플리케이션의 `MEILISEARCH_HOST` 환경변수를 `http://meilisearch:7700`으로 설정해 연결할 수 있습니다.

로컬 머신에서는 브라우저로 `http://localhost:7700`에 접속해 Meilisearch 웹 관리자 패널에 접근할 수 있습니다.

<a name="typesense"></a>
### Typesense

Sail 설치 시 [Typesense](https://typesense.org) 서비스를 선택했다면, `docker-compose.yml`에 네이티브로 [Laravel Scout](/docs/10.x/scout#typesense)와 통합된 고성능 오픈소스 검색 엔진 항목이 추가됩니다. 컨테이너 기동 후, 아래와 같이 환경변수를 설정하여 Typesense 인스턴스에 연결할 수 있습니다.

```ini
TYPESENSE_HOST=typesense
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_API_KEY=xyz
```

로컬 머신에서는 `http://localhost:8108`에서 Typesense API에 접근할 수 있습니다.

<a name="file-storage"></a>
## 파일 저장소

프로덕션 환경에서 파일을 Amazon S3에 저장할 계획이라면, Sail 설치 시 [MinIO](https://min.io) 서비스를 함께 설치하는 것이 좋습니다. MinIO는 S3와 호환되는 API를 제공하므로, 실제 S3에 테스트 버킷을 만들지 않아도 라라벨에서 `s3` 드라이버로 로컬에서 개발할 수 있습니다. MinIO를 선택하면, `docker-compose.yml`에 MinIO 설정이 추가됩니다.

기본적으로 애플리케이션의 파일 시스템 설정(`filesystems` 설정 파일)에는 이미 `s3` 디스크 구성이 들어 있습니다. Amazon S3뿐만 아니라 MinIO처럼 S3 호환 파일 저장소도 연동할 수 있는데, 환경 변수만 적절히 변경하면 됩니다. 예를 들어 MinIO를 사용할 때는 다음과 같이 설정합니다.

```ini
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=sail
AWS_SECRET_ACCESS_KEY=password
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=local
AWS_ENDPOINT=http://minio:9000
AWS_USE_PATH_STYLE_ENDPOINT=true
```

라라벨의 Flysystem 연동에서 MinIO를 사용할 때 올바른 URL을 생성하려면, `AWS_URL` 환경 변수를 애플리케이션의 로컬 주소와 버킷 이름까지 포함해 지정해야 합니다.

```ini
AWS_URL=http://localhost:9000/local
```

버킷은 MinIO 콘솔(http://localhost:8900)에서 생성할 수 있습니다. MinIO 콘솔의 기본 아이디는 `sail`, 비밀번호는 `password`입니다.

> [!WARNING]
> MinIO를 사용할 때는 `temporaryUrl` 메서드로 임시 저장소 URL을 생성하는 기능이 지원되지 않습니다.

<a name="running-tests"></a>
## 테스트 실행하기

라라벨은 강력한 테스트 도구를 기본으로 제공합니다. Sail의 `test` 명령어를 통해 [기능 테스트와 단위 테스트](/docs/10.x/testing)를 실행할 수 있습니다. 그리고 PHPUnit에서 사용하는 모든 CLI 옵션 역시 `test` 명령어에 그대로 전달할 수 있습니다.

```shell
sail test

sail test --group orders
```

Sail의 `test` 명령어는 사실상 아래의 아티즌 명령어와 동일합니다.

```shell
sail artisan test
```

Sail은 기본적으로 테스트 전용 `testing` 데이터베이스를 생성해, 테스트 수행 시 여러분의 실제 데이터베이스 상태를 변경하지 않도록 해줍니다. 라라벨 기본 설치에서는 `phpunit.xml` 파일도 이 데이터베이스를 사용하도록 자동으로 설정되어 있습니다.

```xml
<env name="DB_DATABASE" value="testing"/>
```

<a name="laravel-dusk"></a>
### Laravel Dusk

[Laravel Dusk](/docs/10.x/dusk)는 쉽고 강력한 브라우저 자동화 및 테스트 API를 제공합니다. Sail 덕분에 Selenium이나 다른 도구를 로컬에 설치하지 않아도 Dusk 테스트를 실행할 수 있습니다. 우선, 애플리케이션의 `docker-compose.yml` 파일에서 Selenium 서비스 부분을 주석 해제(uncomment) 하세요.

```yaml
selenium:
    image: 'selenium/standalone-chrome'
    extra_hosts:
      - 'host.docker.internal:host-gateway'
    volumes:
        - '/dev/shm:/dev/shm'
    networks:
        - sail
```

그리고 `laravel.test` 서비스 블록에 `selenium`을 `depends_on` 항목에 추가해야 합니다.

```yaml
depends_on:
    - mysql
    - redis
    - selenium
```

이후 Sail을 시작하고, 아래처럼 `dusk` 명령어로 Dusk 테스트를 실행할 수 있습니다.

```shell
sail dusk
```

<a name="selenium-on-apple-silicon"></a>
#### Apple Silicon에서 Selenium 사용

Apple Silicon 칩이 탑재된 머신을 사용할 경우, `selenium` 서비스는 `seleniarm/standalone-chromium` 이미지를 사용해야 합니다.

```yaml
selenium:
    image: 'seleniarm/standalone-chromium'
    extra_hosts:
        - 'host.docker.internal:host-gateway'
    volumes:
        - '/dev/shm:/dev/shm'
    networks:
        - sail
```

<a name="previewing-emails"></a>
## 이메일 미리보기

라라벨 Sail의 기본 `docker-compose.yml` 파일에는 [Mailpit](https://github.com/axllent/mailpit) 서비스 항목이 포함되어 있습니다. Mailpit은 로컬 개발 중 애플리케이션에서 발송된 이메일을 가로채어, 브라우저에서 이메일 메시지를 미리볼 수 있는 웹 인터페이스를 제공합니다. Sail 사용 시 Mailpit의 호스트명은 `mailpit`이고, 포트는 1025입니다.

```ini
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_ENCRYPTION=null
```

Sail이 실행 중이면, http://localhost:8025에서 Mailpit 웹 인터페이스에 접속할 수 있습니다.

<a name="sail-container-cli"></a>
## 컨테이너 CLI

때때로 애플리케이션 컨테이너 내에서 Bash 세션을 시작해 파일이나 설치된 서비스를 직접 살펴보거나, 임의의 shell 명령어를 실행하고 싶을 수 있습니다. 이럴 때는 `shell` 명령어를 사용해 컨테이너에 접속할 수 있습니다.

```shell
sail shell

sail root-shell
```

[Laravel Tinker](https://github.com/laravel/tinker) 세션을 시작하고 싶다면, `tinker` 명령어를 실행하면 됩니다.

```shell
sail tinker
```

<a name="sail-php-versions"></a>
## PHP 버전

Sail은 현재 PHP 8.3, 8.2, 8.1, 8.0을 지원합니다. 기본적으로 Sail에서 사용하는 PHP 버전은 8.3입니다. 다른 PHP 버전으로 변경하려면, 애플리케이션의 `docker-compose.yml` 파일에서 `laravel.test` 컨테이너의 `build` 설정을 아래와 같이 업데이트하면 됩니다.

```yaml
# PHP 8.3
context: ./vendor/laravel/sail/runtimes/8.3

# PHP 8.2
context: ./vendor/laravel/sail/runtimes/8.2

# PHP 8.1
context: ./vendor/laravel/sail/runtimes/8.1

# PHP 8.0
context: ./vendor/laravel/sail/runtimes/8.0
```

또한, `image` 이름도 현재 사용 중인 PHP 버전에 맞게 변경하는 것이 좋습니다. 이 설정 역시 `docker-compose.yml`에서 정의합니다.

```yaml
image: sail-8.1/app
```

설정을 마쳤다면 컨테이너 이미지를 다시 빌드해야 합니다.

```shell
sail build --no-cache

sail up
```

<a name="sail-node-versions"></a>
## Node 버전

Sail은 기본적으로 Node 20을 설치합니다. 빌드 시 설치되는 Node 버전을 바꾸고 싶다면, `docker-compose.yml` 파일에서 `laravel.test` 서비스의 `build.args` 설정에서 `NODE_VERSION` 값을 원하는 버전으로 지정하면 됩니다.

```yaml
build:
    args:
        WWWGROUP: '${WWWGROUP}'
        NODE_VERSION: '18'
```

설정 변경 후에는 컨테이너 이미지를 다시 빌드해야 합니다.

```shell
sail build --no-cache

sail up
```

<a name="sharing-your-site"></a>
## 사이트 공유하기

동료에게 사이트를 미리 보여주거나, 웹훅(Webhook) 같은 외부 연동 기능을 테스트할 때 사이트를 외부에 공개해야 할 수도 있습니다. 이럴 땐 `share` 명령어를 이용해 사이트를 공유할 수 있습니다. 명령어 실행 후, 애플리케이션에 접근할 수 있는 임의의 `laravel-sail.site` URL이 발급됩니다.

```shell
sail share
```

`share` 명령어로 사이트를 외부에 공유할 때는, 애플리케이션의 `TrustProxies` 미들웨어에서 신뢰할 수 있는 프록시를 올바르게 설정해야 합니다. 그렇지 않으면 `url`, `route` 등 URL 생성 관련 헬퍼에서 올바른 HTTP 호스트 정보를 얻지 못할 수 있습니다.

```
/**
 * The trusted proxies for this application.
 *
 * @var array|string|null
 */
protected $proxies = '*';
```

공유 사이트의 서브도메인을 직접 지정하고 싶다면, `subdomain` 옵션을 추가해 실행할 수 있습니다.

```shell
sail share --subdomain=my-sail-site
```

> [!NOTE]
> `share` 명령어는 [BeyondCode](https://beyondco.de)에서 만든 오픈 소스 터널링 서비스 [Expose](https://github.com/beyondcode/expose) 기반으로 동작합니다.

<a name="debugging-with-xdebug"></a>
## Xdebug로 디버깅하기

라라벨 Sail의 Docker 구성에는 [Xdebug](https://xdebug.org/) 지원이 내장되어 있습니다. Xdebug는 PHP 개발에 널리 사용되는 강력한 디버거입니다. Xdebug를 활성화하려면 `.env` 파일에 몇 가지 환경 변수를 추가해 [설정](https://xdebug.org/docs/step_debug#mode)해야 하며, Sail을 시작하기 전에 모드 값을 지정해야 합니다.

```ini
SAIL_XDEBUG_MODE=develop,debug,coverage
```

#### Linux 호스트 IP 설정

내부적으로 `XDEBUG_CONFIG` 환경 변수에 `client_host=host.docker.internal`이 지정되어 있으므로, Mac이나 Windows(WSL2)에서는 별도의 설정 없이도 Xdebug를 바로 사용할 수 있습니다. 하지만 Linux 환경에서는 Docker Engine 17.06.0+와 Compose 1.16.0+ 이상을 사용해야 하며, 그렇지 않은 경우에는 아래와 같이 직접 환경 변수를 지정해야 합니다.

먼저, 다음 명령어를 활용해 올바른 호스트 IP 주소를 구해야 합니다. `<container-name>`에는 실제로 애플리케이션을 제공하는 컨테이너 이름(보통 `_laravel.test_1`로 끝남)을 사용하세요.

```shell
docker inspect -f {{range.NetworkSettings.Networks}}{{.Gateway}}{{end}} <container-name>
```

IP 주소를 확인했다면, 해당 값을 `.env` 파일의 `SAIL_XDEBUG_CONFIG` 환경 변수에 지정해주세요.

```ini
SAIL_XDEBUG_CONFIG="client_host=<host-ip-address>"
```

<a name="xdebug-cli-usage"></a>
### Xdebug CLI 사용법

`artisan` 명령어를 실행할 때 디버깅 세션을 시작하려면, `sail debug` 명령어를 사용할 수 있습니다.

```shell
# Xdebug 없이 Artisan 명령어 실행 ...
sail artisan migrate

# Xdebug와 함께 Artisan 명령어 실행 ...
sail debug migrate
```

<a name="xdebug-browser-usage"></a>
### Xdebug 브라우저 사용법

애플리케이션에 웹브라우저로 접속할 때 디버깅을 원한다면, Xdebug에서 제공하는 [웹 애플리케이션 디버깅 방법](https://xdebug.org/docs/step_debug#web-application)을 참고해 세션을 시작하세요.

만약 PhpStorm을 사용한다면, [제로-구성 디버깅](https://www.jetbrains.com/help/phpstorm/zero-configuration-debugging.html)에 관한 JetBrain 공식 문서를 참고하면 도움이 됩니다.

> [!WARNING]
> 라라벨 Sail은 애플리케이션 구동 시 `artisan serve` 명령어를 사용합니다. `artisan serve` 명령어는 라라벨 8.53.0부터 `XDEBUG_CONFIG`와 `XDEBUG_MODE` 변수를 지원합니다. 라라벨 8.52.0 이하 버전에서는 해당 변수를 지원하지 않으므로, 디버깅 연결이 되지 않습니다.

<a name="sail-customization"></a>
## 커스터마이징

Sail은 Docker 기반이므로, 거의 모든 부분을 자유롭게 커스터마이즈할 수 있습니다. Sail의 자체 Dockerfile을 직접 사용할 수 있도록, 다음 아티즌 명령어로 관련 파일들을 프로젝트 내에 복사할 수 있습니다.

```shell
sail artisan sail:publish
```

이 명령어를 실행하면, 라라벨 Sail이 사용하는 Dockerfile 및 기타 설정 파일들이 애플리케이션의 `docker` 디렉터리에 복사됩니다. Sail 설치를 커스터마이즈한 후에는, 애플리케이션 컨테이너의 이미지 이름을 `docker-compose.yml`에서 변경할 수 있습니다. 그 후, `build` 명령어로 컨테이너를 다시 빌드해야 합니다. 특히 한 컴퓨터에서 여러 라라벨 애플리케이션을 개발한다면, 각 애플리케이션마다 이미지 이름을 다르게 지정하는 것이 좋습니다.

```shell
sail build --no-cache
```
