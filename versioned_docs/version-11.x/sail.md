# 라라벨 세일 (Laravel Sail)

- [소개](#introduction)
- [설치 및 설정](#installation)
    - [기존 애플리케이션에 Sail 설치하기](#installing-sail-into-existing-applications)
    - [Sail 이미지 재빌드하기](#rebuilding-sail-images)
    - [셸 별칭(alias) 설정하기](#configuring-a-shell-alias)
- [Sail 시작 및 중지](#starting-and-stopping-sail)
- [명령어 실행하기](#executing-sail-commands)
    - [PHP 명령어 실행](#executing-php-commands)
    - [Composer 명령어 실행](#executing-composer-commands)
    - [Artisan 명령어 실행](#executing-artisan-commands)
    - [Node / NPM 명령어 실행](#executing-node-npm-commands)
- [데이터베이스와 상호작용하기](#interacting-with-sail-databases)
    - [MySQL](#mysql)
    - [MongoDB](#mongodb)
    - [Redis](#redis)
    - [Valkey](#valkey)
    - [Meilisearch](#meilisearch)
    - [Typesense](#typesense)
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
- [커스터마이즈 방법](#sail-customization)

<a name="introduction"></a>
## 소개

[Laravel Sail](https://github.com/laravel/sail)은 라라벨의 기본 Docker 개발 환경과 상호작용할 수 있는 가볍고 간단한 커맨드라인 인터페이스(CLI)입니다. Sail을 사용하면 Docker에 대해 사전 지식이 없어도 PHP, MySQL, Redis로 라라벨 애플리케이션을 쉽게 시작할 수 있습니다.

Sail의 핵심은 프로젝트 루트에 위치한 `docker-compose.yml` 파일과 `sail` 스크립트입니다. `sail` 스크립트는 `docker-compose.yml`에 정의된 Docker 컨테이너들과 쉽게 상호작용할 수 있는 CLI 명령들을 제공합니다.

라라벨 Sail은 macOS, Linux, 그리고 Windows([WSL2](https://docs.microsoft.com/en-us/windows/wsl/about) 통해)에서 지원됩니다.

<a name="installation"></a>
## 설치 및 설정

라라벨 Sail은 새로운 라라벨 애플리케이션 생성 시 자동으로 설치되므로 바로 사용을 시작할 수 있습니다. 새 라라벨 애플리케이션 생성 방법은 운영체제별 라라벨 [설치 문서](/docs/11.x/installation#docker-installation-using-sail)를 참고해 주세요. 설치 과정 중, Sail이 지원하는 서비스 중 어떤 서비스를 사용할지 선택하게 됩니다.

<a name="installing-sail-into-existing-applications"></a>
### 기존 애플리케이션에 Sail 설치하기

기존 라라벨 애플리케이션에 Sail을 추가해 사용하고 싶다면, Composer 패키지 관리자를 이용해 Sail을 설치할 수 있습니다. 이 단계는 로컬 개발 환경에 Composer 의존성 패키지 설치가 가능한 경우를 전제로 합니다.

```shell
composer require laravel/sail --dev
```

Sail 설치가 완료되면, `sail:install` Artisan 명령어를 실행하세요. 이 명령어는 Sail의 `docker-compose.yml` 파일을 애플리케이션 루트에 복사해주고, Docker 서비스에 연결에 필요한 환경 변수를 `.env` 파일에 추가/수정합니다.

```shell
php artisan sail:install
```

이제 Sail을 시작할 수 있습니다. Sail 사용법에 대해 더 알고 싶으시면, 아래 문서를 계속 읽어주세요.

```shell
./vendor/bin/sail up
```

> [!WARNING]  
> 만약 Docker Desktop for Linux를 사용 중이라면, 아래 명령어로 반드시 `default` Docker 컨텍스트를 활성화해야 합니다: `docker context use default`.

<a name="adding-additional-services"></a>
#### 추가 서비스 설치하기

기존 Sail 설치 환경에 새로운 서비스를 추가하고 싶은 경우엔 `sail:add` Artisan 명령어를 실행하면 됩니다.

```shell
php artisan sail:add
```

<a name="using-devcontainers"></a>
#### Devcontainer 사용하기

[Devcontainer](https://code.visualstudio.com/docs/remote/containers) 환경에서 개발하고 싶을 때는, `sail:install` 명령어에 `--devcontainer` 옵션을 추가하면 됩니다. 이 옵션을 사용하면 애플리케이션 루트에 기본 `.devcontainer/devcontainer.json` 파일이 생성됩니다.

```shell
php artisan sail:install --devcontainer
```

<a name="rebuilding-sail-images"></a>
### Sail 이미지 재빌드하기

가끔 모든 패키지와 소프트웨어를 최신 상태로 맞추기 위해 Sail 이미지를 완전히 다시 빌드해야 할 수 있습니다. 아래 명령어를 사용해서 이미지 재빌드를 할 수 있습니다.

```shell
docker compose down -v

sail build --no-cache

sail up
```

<a name="configuring-a-shell-alias"></a>
### 셸 별칭(alias) 설정하기

기본적으로 Sail 명령어는 신규 라라벨 프로젝트에 포함된 `vendor/bin/sail` 스크립트를 사용해서 실행합니다.

```shell
./vendor/bin/sail up
```

하지만 매번 `vendor/bin/sail`을 입력하는 대신, 셸 별칭(alias)을 설정해 더 쉽게 Sail 명령어를 실행할 수 있습니다.

```shell
alias sail='sh $([ -f sail ] && echo sail || echo vendor/bin/sail)'
```

이 별칭이 항상 적용되도록, 홈 디렉터리의 셸 설정 파일(예: `~/.zshrc` 또는 `~/.bashrc`)에 위 내용을 추가한 뒤 셸을 재시작하세요.

별칭 설정 이후에는 단순히 `sail` 만 입력하면 Sail 명령어가 실행됩니다. 이 문서의 이후 예시들도 별칭이 설정된 것을 전제로 작성됩니다.

```shell
sail up
```

<a name="starting-and-stopping-sail"></a>
## Sail 시작 및 중지

라라벨 Sail의 `docker-compose.yml` 파일에는 라라벨 애플리케이션 개발을 돕기 위한 다양한 Docker 컨테이너들이 정의되어 있습니다. 각각의 컨테이너는 `docker-compose.yml`의 `services` 설정에 하나씩 등록되어 있으며, 그중 `laravel.test` 컨테이너가 실제 애플리케이션을 제공하는 주요 컨테이너입니다.

Sail을 시작하기 전에, 로컬 컴퓨터에 다른 웹 서버나 데이터베이스가 실행 중이지 않은지 확인하세요. 모든 컨테이너를 시작하려면 아래와 같이 `up` 명령어를 실행합니다.

```shell
sail up
```

모든 컨테이너를 백그라운드에서 실행하고자 한다면 "detached" 모드로 실행할 수 있습니다.

```shell
sail up -d
```

컨테이너가 모두 실행되면 웹 브라우저에서 http://localhost 에 접속해 프로젝트를 확인할 수 있습니다.

모든 컨테이너를 종료하려면 Control + C 를 눌러 종료할 수 있습니다. 백그라운드 실행 시에는 `stop` 명령어로 중지할 수 있습니다.

```shell
sail stop
```

<a name="executing-sail-commands"></a>
## 명령어 실행하기

Laravel Sail을 사용할 때 애플리케이션은 Docker 컨테이너 내에서 실행되며, 로컬 컴퓨터와 격리되어 있습니다. 하지만 Sail이 제공하는 인터페이스를 통해 다양한 명령어(PHP 실행, Artisan 명령, Composer 명령, Node/NPM 명령 등)를 쉽게 실행할 수 있습니다.

**라라벨 공식 문서에서 Sail이 언급되지 않은 Composer, Artisan, Node/NPM 명령어 예시가 자주 등장합니다.** 그런 예제는 해당 도구들이 로컬 환경에 직접 설치되었다고 가정합니다. Sail을 사용하는 경우, 다음처럼 Sail을 통해 명령어를 실행해야 합니다.

```shell
# 로컬에서 Artisan 명령어 실행...
php artisan queue:work

# Laravel Sail 내에서 Artisan 명령어 실행...
sail artisan queue:work
```

<a name="executing-php-commands"></a>
### PHP 명령어 실행

PHP 명령어는 `php` 커맨드를 이용해 실행할 수 있습니다. 이때 사용되는 PHP 버전은 애플리케이션에 설정된 버전을 따릅니다. Sail에서 지원하는 PHP 버전은 [PHP 버전 문서](#sail-php-versions)를 참고하세요.

```shell
sail php --version

sail php script.php
```

<a name="executing-composer-commands"></a>
### Composer 명령어 실행

Composer 관련 명령은 `composer` 커맨드로 실행할 수 있습니다. Laravel Sail의 애플리케이션 컨테이너에는 Composer가 이미 설치되어 있습니다.

```shell
sail composer require laravel/sanctum
```

<a name="installing-composer-dependencies-for-existing-projects"></a>
#### 기존 애플리케이션의 Composer 의존성 설치

팀 프로젝트에서 개발을 시작할 때는, 라라벨 애플리케이션 자체를 직접 생성하지 않고 리포지터리를 클론만 하는 경우가 많습니다. 이런 경우에는 Composer 의존성, 포함하여 Sail도 아직 설치 전일 수 있습니다.

애플리케이션 폴더로 이동한 뒤, 아래와 같이 Docker 컨테이너(PHP와 Composer 포함)를 임시로 띄워서 의존성을 설치할 수 있습니다.

```shell
docker run --rm \
    -u "$(id -u):$(id -g)" \
    -v "$(pwd):/var/www/html" \
    -w /var/www/html \
    laravelsail/php84-composer:latest \
    composer install --ignore-platform-reqs
```

`laravelsail/phpXX-composer` 이미지를 사용할 때는, 애플리케이션에서 사용할 PHP 버전(`80`, `81`, `82`, `83`, `84` 중 하나)과 일치하는 이미지를 사용해야 합니다.

<a name="executing-artisan-commands"></a>
### Artisan 명령어 실행

라라벨의 Artisan 명령어들은 `artisan` 커맨드를 통해 실행할 수 있습니다.

```shell
sail artisan queue:work
```

<a name="executing-node-npm-commands"></a>
### Node / NPM 명령어 실행

Node 관련 명령은 `node`로, NPM 관련 명령은 `npm`으로 실행할 수 있습니다.

```shell
sail node --version

sail npm run dev
```

원하면 NPM 대신 Yarn을 사용할 수도 있습니다.

```shell
sail yarn
```

<a name="interacting-with-sail-databases"></a>
## 데이터베이스와 상호작용하기

<a name="mysql"></a>
### MySQL

`docker-compose.yml` 파일에는 MySQL 컨테이너 항목이 기본적으로 포함되어 있습니다. 이 컨테이너는 [Docker 볼륨](https://docs.docker.com/storage/volumes/)을 사용해 데이터베이스 데이터를 보존하므로, 컨테이너를 중지하거나 재시작해도 데이터가 유지됩니다.

MySQL 컨테이너가 처음 시작될 때 두 개의 데이터베이스가 자동으로 만들어집니다. 하나는 `DB_DATABASE` 환경변수의 값을 사용하여 생성된 로컬 개발용 데이터베이스이고, 다른 하나는 `testing`이라는 별도의 테스트 전용 데이터베이스입니다. 이렇게 분리하면 테스트가 개발 데이터에 영향을 주지 않습니다.

컨테이너 실행 이후에는 `.env` 파일의 `DB_HOST` 값을 `mysql`로 설정해서 애플리케이션 내에서 MySQL에 접속할 수 있습니다.

로컬 머신에서 MySQL 데이터베이스에 접속하려면 [TablePlus](https://tableplus.com) 같은 GUI 데이터베이스 도구를 사용할 수 있습니다. 기본적으로 MySQL 데이터베이스는 `localhost`의 3306 포트에서 접속할 수 있고, 로그인 정보는 `.env`의 `DB_USERNAME`, `DB_PASSWORD` 값을 따릅니다. 또는, `root` 사용자로도 접속할 수 있으며 이때 패스워드는 동일하게 `DB_PASSWORD` 값이 사용됩니다.

<a name="mongodb"></a>
### MongoDB

Sail 설치 시 [MongoDB](https://www.mongodb.com/) 서비스를 선택했다면, `docker-compose.yml`에 [MongoDB Atlas Local](https://www.mongodb.com/docs/atlas/cli/current/atlas-cli-local-cloud/) 컨테이너가 등록되고, [Search Indexes](https://www.mongodb.com/docs/atlas/atlas-search/)와 같은 Atlas 기능도 사용할 수 있습니다. 이 컨테이너 역시 [Docker 볼륨](https://docs.docker.com/storage/volumes/)을 사용해 데이터가 유지됩니다.

컨테이너 실행 후에는 `.env` 파일의 `MONGODB_URI`를 `mongodb://mongodb:27017`로 설정하면 애플리케이션 내에서 MongoDB에 연결할 수 있습니다.

기본적으로 인증은 비활성화되어 있습니다. 필요시 `MONGODB_USERNAME`, `MONGODB_PASSWORD` 환경변수를 지정 후 컨테이너를 시작하여 인증 기능을 활성화할 수 있습니다. 그런 경우는 다음과 같이 연결 문자열을 추가로 설정합니다.

```ini
MONGODB_USERNAME=user
MONGODB_PASSWORD=laravel
MONGODB_URI=mongodb://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@mongodb:27017
```

애플리케이션에 MongoDB를 원활히 통합하려면 [MongoDB에서 공식으로 제공하는 라라벨 패키지](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/)를 설치할 수 있습니다.

로컬 머신에서 MongoDB 데이터를 직접 확인하려면 [Compass](https://www.mongodb.com/products/tools/compass)와 같은 GUI를 사용할 수 있습니다. 기본적으로 MongoDB는 `localhost`의 27017 포트에 열려 있습니다.

<a name="redis"></a>
### Redis

`docker-compose.yml` 파일에는 [Redis](https://redis.io) 컨테이너도 포함되어 있습니다. 이 컨테이너 역시 [Docker 볼륨](https://docs.docker.com/storage/volumes/)을 통해 데이터가 유지됩니다. 컨테이너 실행 후, `.env`의 `REDIS_HOST` 값을 `redis`로 설정하면 애플리케이션에서 Redis에 연결할 수 있습니다.

로컬 머신에서는 [TablePlus](https://tableplus.com) 같은 GUI를 쓰거나, `localhost`의 6379 포트로 직접 접근할 수 있습니다.

<a name="valkey"></a>
### Valkey

Sail 설치 시 Valkey 서비스를 선택하면, 애플리케이션의 `docker-compose.yml` 파일에 [Valkey](https://valkey.io/) 컨테이너가 추가됩니다. 이 컨테이너 역시 [Docker 볼륨](https://docs.docker.com/storage/volumes/)을 사용해 데이터가 보존되며, 애플리케이션의 `.env` 파일에서 `REDIS_HOST` 값을 `valkey`로 설정해 연결할 수 있습니다.

로컬 머신에서는 [TablePlus](https://tableplus.com)와 같은 데이터베이스 관리 도구로 `localhost` 6379 포트에 접속할 수 있습니다.

<a name="meilisearch"></a>
### Meilisearch

Sail 설치 시 [Meilisearch](https://www.meilisearch.com) 서비스를 선택하면, `docker-compose.yml`에 이 강력한 검색 엔진 컨테이너가 추가됩니다. [Laravel Scout](/docs/11.x/scout)와 함께 통합해 사용할 수 있습니다. 컨테이너 실행 후 `.env`의 `MEILISEARCH_HOST` 변수를 `http://meilisearch:7700`으로 설정해 연결할 수 있습니다.

로컬 머신에서는 웹 브라우저로 `http://localhost:7700`에 접속해 Meilisearch 관리 패널을 사용할 수 있습니다.

<a name="typesense"></a>
### Typesense

Sail 설치 시 [Typesense](https://typesense.org) 서비스를 선택했다면, `docker-compose.yml`에 초고속의 오픈소스 검색 엔진 컨테이너가 추가됩니다. 이 엔진 역시 [Laravel Scout](/docs/11.x/scout#typesense)와 통합 지원됩니다. 컨테이너 실행 후, 아래 환경변수를 설정하여 연결할 수 있습니다.

```ini
TYPESENSE_HOST=typesense
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_API_KEY=xyz
```

로컬 머신에서는 `http://localhost:8108`을 통해 Typesense API에 접근할 수 있습니다.

<a name="file-storage"></a>
## 파일 스토리지

프로덕션 환경에서 Amazon S3를 파일 스토리지로 사용할 예정이라면, Sail 설치 시 [MinIO](https://min.io) 서비스를 함께 설치할 수 있습니다. MinIO는 S3 호환 API를 제공하기 때문에, 실제 S3 환경에서 "테스트"용 버킷을 만들 필요 없이 로컬 개발 환경에서 `s3` 드라이버 테스트가 가능합니다. MinIO 설치 시, 관련 설정이 `docker-compose.yml`에 자동으로 추가됩니다.

기본적으로 라라벨의 `filesystems` 설정 파일에는 이미 `s3` 디스크 구성이 포함되어 있습니다. Amazon S3 뿐만 아니라 MinIO 등 S3 호환 스토리지를 사용하고 싶다면 관련 환경변수만 적절히 변경하면 됩니다. 예를 들어, MinIO를 쓸 경우 아래와 같이 설정할 수 있습니다.

```ini
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=sail
AWS_SECRET_ACCESS_KEY=password
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=local
AWS_ENDPOINT=http://minio:9000
AWS_USE_PATH_STYLE_ENDPOINT=true
```

Flysystem 통합을 통해 URL이 올바르게 생성되도록 하려면, `AWS_URL` 환경변수도 아래처럼 정의해야 합니다(로컬 URL 및 버킷명을 포함).

```ini
AWS_URL=http://localhost:9000/local
```

MinIO 콘솔에서 버킷 생성을 할 수 있습니다. 콘솔은 `http://localhost:8900` 에서 사용할 수 있고, 기본 아이디는 `sail`, 비밀번호는 `password`입니다.

> [!WARNING]  
> MinIO를 사용할 경우 `temporaryUrl` 메서드를 통한 임시 스토리지 URL 생성은 지원되지 않습니다.

<a name="running-tests"></a>
## 테스트 실행하기

라라벨은 기본적으로 강력한 테스트 지원을 제공합니다. Sail의 `test` 명령어를 사용해 [기능 테스트/단위 테스트](/docs/11.x/testing)를 바로 실행할 수 있습니다. Pest / PHPUnit에서 사용 가능한 모든 CLI 옵션 역시 전달할 수 있습니다.

```shell
sail test

sail test --group orders
```

Sail의 `test` 명령은 `test` Artisan 명령어와 동일합니다.

```shell
sail artisan test
```

기본적으로 Sail에서는 별도의 `testing` 데이터베이스를 만들어 테스트 중 실제 데이터베이스에 영향을 주지 않도록 구성되어 있습니다. 기본 라라벨 프로젝트에서는 Sail이 `phpunit.xml` 파일 또한 테스트용 데이터베이스를 사용하도록 자동 설정합니다.

```xml
<env name="DB_DATABASE" value="testing"/>
```

<a name="laravel-dusk"></a>
### Laravel Dusk

[Laravel Dusk](/docs/11.x/dusk)는 쉽고 표현력 있는 브라우저 자동화 및 테스트를 위한 API를 제공합니다. Sail 덕분에 Selenium이나 별도의 도구를 로컬에 설치하지 않아도 Dusk 테스트를 실행할 수 있습니다. 우선, 애플리케이션의 `docker-compose.yml` 파일에서 Selenium 서비스를 주석 해제하세요.

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

그리고 `laravel.test` 서비스가 `selenium`에 대해 `depends_on` 항목을 갖도록 추가해야 합니다.

```yaml
depends_on:
    - mysql
    - redis
    - selenium
```

이제 Sail을 시작하고 `dusk` 명령어로 Dusk 테스트 스위트를 실행할 수 있습니다.

```shell
sail dusk
```

<a name="selenium-on-apple-silicon"></a>
#### Apple Silicon에서의 Selenium 사용

로컬 머신이 Apple Silicon 칩(M1, M2 등)인 경우, `selenium` 서비스는 `selenium/standalone-chromium` 이미지를 사용해야 합니다.

```yaml
selenium:
    image: 'selenium/standalone-chromium'
    extra_hosts:
        - 'host.docker.internal:host-gateway'
    volumes:
        - '/dev/shm:/dev/shm'
    networks:
        - sail
```

<a name="previewing-emails"></a>
## 이메일 미리보기

라라벨 Sail 기본 `docker-compose.yml` 파일에는 [Mailpit](https://github.com/axllent/mailpit) 서비스가 포함되어 있습니다. Mailpit은 로컬 개발 중 애플리케이션에서 발송되는 이메일들을 가로채서, 브라우저에서 바로 이메일 내용을 미리볼 수 있도록 해줍니다. Sail을 사용할 때 Mailpit의 기본 호스트는 `mailpit`이고, 포트는 1025번입니다.

```ini
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_ENCRYPTION=null
```

Sail이 실행 중이라면, 브라우저에서 http://localhost:8025 을 열어서 Mailpit 인터페이스를 사용할 수 있습니다.

<a name="sail-container-cli"></a>
## 컨테이너 CLI

가끔 애플리케이션 컨테이너 내부에서 Bash 세션을 직접 실행하고 싶을 때가 있습니다. `shell` 명령어를 쓰면 컨테이너에 접속해 파일이나 서비스 확인, 임의의 쉘 명령 실행이 가능합니다.

```shell
sail shell

sail root-shell
```

[Laravel Tinker](https://github.com/laravel/tinker) 세션도 바로 실행할 수 있습니다.

```shell
sail tinker
```

<a name="sail-php-versions"></a>
## PHP 버전

Sail은 현재 PHP 8.4, 8.3, 8.2, 8.1, 8.0을 지원합니다. 기본값은 PHP 8.4입니다. 사용하려는 PHP 버전을 변경하려면, `docker-compose.yml` 파일에서 `laravel.test` 컨테이너의 `build` 섹션을 아래와 같이 수정하세요.

```yaml
# PHP 8.4
context: ./vendor/laravel/sail/runtimes/8.4

# PHP 8.3
context: ./vendor/laravel/sail/runtimes/8.3

# PHP 8.2
context: ./vendor/laravel/sail/runtimes/8.2

# PHP 8.1
context: ./vendor/laravel/sail/runtimes/8.1

# PHP 8.0
context: ./vendor/laravel/sail/runtimes/8.0
```

또한, 애플리케이션에 사용 중인 PHP 버전에 맞춰 `image` 값도 업데이트할 수 있습니다. 이 설정 역시 `docker-compose.yml`에 있습니다.

```yaml
image: sail-8.2/app
```

설정 변경 후에는 반드시 컨테이너 이미지를 다시 빌드해야 합니다.

```shell
sail build --no-cache

sail up
```

<a name="sail-node-versions"></a>
## Node 버전

Sail은 기본적으로 Node 20을 설치합니다. 이미지 빌드시 설치할 Node 버전을 변경하고 싶다면 `docker-compose.yml` 내 `laravel.test` 서비스의 `build.args` 항목을 수정하세요.

```yaml
build:
    args:
        WWWGROUP: '${WWWGROUP}'
        NODE_VERSION: '18'
```

설정 변경 후에는 컨테이너 이미지를 재빌드해야 합니다.

```shell
sail build --no-cache

sail up
```

<a name="sharing-your-site"></a>
## 사이트 공유하기

동료에게 웹사이트를 미리 보여주거나, 외부 서비스와 웹훅 연동 테스트를 하고 싶을 때가 있습니다. `share` 명령어를 사용하면 임시 `laravel-sail.site` URL을 발급받아 외부에서 애플리케이션에 접근할 수 있습니다.

```shell
sail share
```

사이트를 공유할 때는, 애플리케이션의 `bootstrap/app.php`에서 `trustProxies` 미들웨어 메서드를 통해 신뢰할 수 있는 프록시를 적절히 설정해야 합니다. 이 설정이 없으면 `url`이나 `route` 헬퍼에서 올바른 HTTP 호스트를 결정하지 못해 URL이 잘못 생성될 수 있습니다.

```
->withMiddleware(function (Middleware $middleware) {
    $middleware->trustProxies(at: '*');
})
```

공유 사이트의 서브도메인을 직접 지정하고 싶을 땐, `subdomain` 옵션을 사용하세요.

```shell
sail share --subdomain=my-sail-site
```

> [!NOTE]  
> `share` 명령어는 [BeyondCode](https://beyondco.de)가 만든 오픈 소스 터널링 서비스 [Expose](https://github.com/beyondcode/expose)를 기반으로 동작합니다.

<a name="debugging-with-xdebug"></a>
## Xdebug로 디버깅하기

라라벨 Sail의 Docker 구성에는 [Xdebug](https://xdebug.org/) 지원이 내장되어 있어, PHP 환경에서 강력한 디버깅이 가능합니다. 먼저 [Sail 설정을 배포](#sail-customization)한 뒤, 아래와 같이 `.env` 파일에 관련 변수를 추가해 Xdebug를 활성화하세요.

```ini
SAIL_XDEBUG_MODE=develop,debug,coverage
```

`php.ini` 파일에도 아래와 같이 Xdebug 모드가 명시되어 있어야 합니다.

```ini
[xdebug]
xdebug.mode=${XDEBUG_MODE}
```

이후 `php.ini` 변경 사항이 적용되도록 Docker 이미지를 반드시 다시 빌드해야 합니다.

```shell
sail build --no-cache
```

#### Linux 호스트 IP 설정

내부적으로 `XDEBUG_CONFIG` 환경변수는 `client_host=host.docker.internal`로 지정되어, Mac 및 Windows(WSL2)에서는 별도 설정 없이 제대로 동작합니다. 리눅스에서 Docker 20.10 이상을 쓰는 경우에도 `host.docker.internal` 지원으로 추가 설정이 필요 없습니다.

만약 Docker 20.10 미만의 Linux 환경에서는 `host.docker.internal`이 지원되지 않으므로, 컨테이너에 고정 IP를 할당하고 별도로 설정해야 합니다. 이를 위해 `docker-compose.yml` 파일에 네트워크와 IP를 아래처럼 지정합니다.

```yaml
networks:
  custom_network:
    ipam:
      config:
        - subnet: 172.20.0.0/16

services:
  laravel.test:
    networks:
      custom_network:
        ipv4_address: 172.20.0.2
```

이후, 애플리케이션의 .env 파일에 SAIL_XDEBUG_CONFIG 값을 추가로 작성합니다.

```ini
SAIL_XDEBUG_CONFIG="client_host=172.20.0.2"
```

<a name="xdebug-cli-usage"></a>
### Xdebug CLI 사용법

`sail debug` 명령어로 Artisan 명령어를 실행할 때 디버깅 세션을 시작할 수 있습니다.

```shell
# Xdebug 없이 Artisan 명령어 실행...
sail artisan migrate

# Xdebug와 함께 Artisan 명령어 실행...
sail debug migrate
```

<a name="xdebug-browser-usage"></a>
### Xdebug 브라우저 사용법

애플리케이션을 웹 브라우저를 통해 동작시켜 디버깅하려면, 브라우저에서 Xdebug 세션을 시작하는 방법은 [Xdebug 공식 문서](https://xdebug.org/docs/step_debug#web-application)를 참고하세요.

PhpStorm을 사용하는 경우에는 [제트브레인즈의 무설정 디버깅 가이드](https://www.jetbrains.com/help/phpstorm/zero-configuration-debugging.html)를 살펴보시기 바랍니다.

> [!WARNING]  
> 라라벨 Sail은 애플리케이션을 제공하기 위해 `artisan serve` 명령어를 사용합니다. `artisan serve`는 라라벨 8.53.0 이상에서만 `XDEBUG_CONFIG`, `XDEBUG_MODE` 환경 변수를 지원하며, 8.52.0 이하 버전에서는 해당 변수 지원이 없어 디버깅 연결이 정상적으로 동작하지 않습니다.

<a name="sail-customization"></a>
## 커스터마이즈 방법

Sail은 Docker 기반이므로 거의 모든 부분을 자유롭게 커스터마이즈할 수 있습니다. Sail 관련 Dockerfile을 직접 수정하고 싶다면 `sail:publish` Artisan 명령어를 실행하세요.

```shell
sail artisan sail:publish
```

이렇게 하면 라라벨 Sail이 사용하는 Dockerfile과 기타 설정 파일들이 애플리케이션 루트의 `docker` 디렉토리에 복사됩니다. Sail 환경을 수정한 후엔, 애플리케이션 컨테이너의 이미지 이름을 `docker-compose.yml`에서 별도로 지정할 수도 있습니다. 이렇게 이미지 이름을 분리하면 같은 컴퓨터에서 여러 라라벨 프로젝트를 개발할 때 이미지 충돌을 막을 수 있습니다. 변경 후에는 컨테이너 이미지를 반드시 다시 빌드해야 하며, 다음 명령어로 빌드를 수행합니다.

```shell
sail build --no-cache
```
