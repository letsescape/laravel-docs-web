# 라라벨 세일 (Laravel Sail)

- [소개](#introduction)
- [설치 및 설정](#installation)
    - [기존 애플리케이션에 Sail 설치하기](#installing-sail-into-existing-applications)
    - [Sail 이미지 재빌드하기](#rebuilding-sail-images)
    - [셸 별칭(alias) 설정하기](#configuring-a-shell-alias)
- [Sail 시작과 종료](#starting-and-stopping-sail)
- [명령어 실행하기](#executing-sail-commands)
    - [PHP 명령어 실행하기](#executing-php-commands)
    - [Composer 명령어 실행하기](#executing-composer-commands)
    - [Artisan 명령어 실행하기](#executing-artisan-commands)
    - [Node / NPM 명령어 실행하기](#executing-node-npm-commands)
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
- [커스터마이징](#sail-customization)

<a name="introduction"></a>
## 소개

[Laravel Sail](https://github.com/laravel/sail)은 라라벨의 기본 Docker 개발 환경과 상호작용할 수 있도록 도와주는 경량의 명령줄 인터페이스(CLI)입니다. Sail을 사용하면 Docker에 대한 사전 지식 없이도 PHP, MySQL, Redis를 활용하여 라라벨 애플리케이션을 쉽게 시작할 수 있습니다.

Sail의 핵심은 프로젝트 루트에 위치한 `docker-compose.yml` 파일과 `sail` 스크립트입니다. 이 `sail` 스크립트는 `docker-compose.yml` 파일에서 정의한 Docker 컨테이너들과 편리하게 상호작용할 수 있는 CLI 기능을 제공합니다.

라라벨 Sail은 macOS, Linux, 그리고 Windows([WSL2](https://docs.microsoft.com/en-us/windows/wsl/about)를 통해 지원)에서 사용할 수 있습니다.

<a name="installation"></a>
## 설치 및 설정

라라벨 Sail은 모든 새로운 라라벨 애플리케이션에 자동으로 설치되므로 즉시 사용할 수 있습니다.

<a name="installing-sail-into-existing-applications"></a>
### 기존 애플리케이션에 Sail 설치하기

이미 존재하는 라라벨 애플리케이션에서 Sail을 사용하고 싶다면, Composer 패키지 관리자를 이용해 Sail을 설치하면 됩니다. 이 과정은 기존 개발 환경에서 Composer 의존성 설치가 가능한 상황을 전제로 합니다.

```shell
composer require laravel/sail --dev
```

Sail 설치가 완료되면, `sail:install` 아티즌 명령어를 실행할 수 있습니다. 이 명령어는 Sail의 `docker-compose.yml` 파일을 애플리케이션 루트에 배포(publish)하고, 도커 서비스와 연결할 수 있도록 `.env` 환경 변수들을 수정합니다.

```shell
php artisan sail:install
```

마지막으로, Sail을 시작하면 됩니다. Sail 사용법에 대해 더 자세히 알고 싶다면 아래의 문서를 계속 읽으십시오.

```shell
./vendor/bin/sail up
```

> [!WARNING]
> Linux용 Docker Desktop을 사용 중이라면, 다음 명령어를 입력하여 반드시 `default` Docker 컨텍스트를 사용해야 합니다: `docker context use default`.

<a name="adding-additional-services"></a>
#### 추가 서비스 설치하기

기존 Sail 설치에 다른 서비스를 추가하고 싶다면, 다음과 같이 `sail:add` 아티즌 명령어를 실행하면 됩니다.

```shell
php artisan sail:add
```

<a name="using-devcontainers"></a>
#### Devcontainer 사용하기

[Devcontainer](https://code.visualstudio.com/docs/remote/containers) 환경에서 개발을 진행하고 싶다면, `sail:install` 명령어에 `--devcontainer` 옵션을 추가하여 사용합니다. 이 옵션을 사용하면 애플리케이션 루트에 기본 `.devcontainer/devcontainer.json` 파일이 생성됩니다.

```shell
php artisan sail:install --devcontainer
```

<a name="rebuilding-sail-images"></a>
### Sail 이미지 재빌드하기

간혹, Sail 이미지 내 모든 패키지와 소프트웨어를 최신 상태로 유지하기 위해 이미지를 완전히 다시 빌드해야 할 수 있습니다. 이때는 아래 명령어를 순서대로 실행하면 됩니다.

```shell
docker compose down -v

sail build --no-cache

sail up
```

<a name="configuring-a-shell-alias"></a>
### 셸 별칭(alias) 설정하기

Sail 명령어는 기본적으로 모든 새로운 라라벨 애플리케이션에 포함된 `vendor/bin/sail` 스크립트를 통해 실행하게 됩니다.

```shell
./vendor/bin/sail up
```

하지만 매번 `vendor/bin/sail`을 입력하는 대신, 아래와 같이 셸 별칭을 설정하면 Sail 명령어를 더 쉽게 사용할 수 있습니다.

```shell
alias sail='sh $([ -f sail ] && echo sail || echo vendor/bin/sail)'
```

이 별칭을 항상 사용할 수 있도록 하려면, 사용 중인 셸 설정 파일(예: `~/.zshrc` 또는 `~/.bashrc`)에 위 별칭을 추가한 뒤, 셸을 재시작하세요.

셸 별칭이 설정되면, 단순히 `sail` 명령어만 입력해서 Sail 관련 모든 명령을 실행할 수 있습니다. 이 문서의 나머지 예시들도 별칭이 설정된 상황을 가정하고 있습니다.

```shell
sail up
```

<a name="starting-and-stopping-sail"></a>
## Sail 시작과 종료

라라벨 Sail의 `docker-compose.yml` 파일에는 라라벨 애플리케이션 개발을 도와주는 다양한 Docker 컨테이너가 정의되어 있습니다. 각각의 컨테이너는 `docker-compose.yml`의 `services` 항목에 포함되어 있으며, `laravel.test` 컨테이너가 실제 애플리케이션을 서비스합니다.

Sail을 시작하기 전에, 로컬 컴퓨터에서 다른 웹 서버나 데이터베이스가 실행되고 있지 않은지 반드시 확인하세요. 애플리케이션의 `docker-compose.yml`에 정의된 모든 Docker 컨테이너를 시작하려면 아래 명령어를 사용합니다.

```shell
sail up
```

모든 컨테이너를 백그라운드로 실행하고 싶다면, "detached" 모드로 시작할 수 있습니다.

```shell
sail up -d
```

애플리케이션 컨테이너가 정상적으로 시작되면 웹 브라우저에서 `http://localhost` 를 통해 프로젝트에 접속할 수 있습니다.

모든 컨테이너를 중지하려면, 실행 중인 터미널에서 Control + C를 누르면 됩니다. 또는 컨테이너가 백그라운드에서 동작 중이라면, 아래와 같이 `stop` 명령어를 사용할 수 있습니다.

```shell
sail stop
```

<a name="executing-sail-commands"></a>
## 명령어 실행하기

라라벨 Sail을 사용할 때는 애플리케이션이 Docker 컨테이너 내에서 실행되기 때문에 로컬 컴퓨터와 격리된 환경이 됩니다. 하지만, Sail은 PHP, Artisan, Composer, Node/NPM 명령어 등을 편리하게 실행할 수 있게 도와줍니다.

**라라벨 공식 문서에서 Composer, Artisan, Node/NPM 명령어가 Sail 없이 직접 실행하는 형태로 안내되는 경우가 많습니다.** 이러한 예시는 해당 툴들이 로컬 컴퓨터에 설치되어 있다고 가정합니다. 만약 여러분이 Sail을 로컬 개발 환경으로 사용하고 있다면, 해당 명령어들은 Sail을 통해 실행해야 합니다.

```shell
# 로컬에서 직접 Artisan 명령어 실행 예시...
php artisan queue:work

# 라라벨 Sail 환경에서 Artisan 명령어 실행 예시...
sail artisan queue:work
```

<a name="executing-php-commands"></a>
### PHP 명령어 실행하기

PHP 명령어는 `php` 명령어를 통해 실행할 수 있습니다. 이 명령어들은 애플리케이션에 설정된 PHP 버전에서 실행됩니다. Sail에서 지원되는 PHP 버전에 대한 자세한 내용은 [PHP 버전 문서](#sail-php-versions)를 참고하세요.

```shell
sail php --version

sail php script.php
```

<a name="executing-composer-commands"></a>
### Composer 명령어 실행하기

Composer 명령어는 `composer` 명령어를 사용해 실행할 수 있습니다. 라라벨 Sail의 애플리케이션 컨테이너에는 Composer가 기본적으로 포함되어 있습니다.

```shell
sail composer require laravel/sanctum
```

<a name="executing-artisan-commands"></a>
### Artisan 명령어 실행하기

라라벨의 Artisan 명령어는 `artisan` 명령어를 통해 실행할 수 있습니다.

```shell
sail artisan queue:work
```

<a name="executing-node-npm-commands"></a>
### Node / NPM 명령어 실행하기

Node 명령어는 `node`, NPM 명령어는 `npm`을 사용하여 실행할 수 있습니다.

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

애플리케이션의 `docker-compose.yml` 파일에는 MySQL 컨테이너 설정이 포함되어 있습니다. 이 컨테이너는 [Docker 볼륨](https://docs.docker.com/storage/volumes/)을 사용하므로, 컨테이너를 중지하거나 재시작해도 데이터가 유지됩니다.

또한 MySQL 컨테이너가 처음 시작될 때 두 개의 데이터베이스가 자동으로 생성됩니다. 첫 번째 데이터베이스는 개발 용도로, 애플리케이션의 `DB_DATABASE` 환경 변수 값을 따릅니다. 두 번째 데이터베이스는 테스트 전용으로 `testing`이라는 이름이 할당되며, 테스트 실행 시 개발 데이터와 분리되어 동작합니다.

컨테이너를 모두 시작했다면, `.env` 파일의 `DB_HOST` 환경 변수를 `mysql`로 설정해서 애플리케이션에서 MySQL에 연결할 수 있습니다.

로컬 컴퓨터에서 직접 MySQL 데이터베이스에 접속하려면 [TablePlus](https://tableplus.com)와 같은 GUI 데이터베이스 관리 도구를 사용할 수 있습니다. 기본적으로 MySQL은 `localhost`의 3306 포트에서 접속할 수 있고, 인증 정보는 `DB_USERNAME` 및 `DB_PASSWORD` 환경 변수의 값과 같습니다. 또는 `root` 계정으로도 접속할 수 있으며, 이때 역시 비밀번호는 `DB_PASSWORD` 값을 사용합니다.

<a name="mongodb"></a>
### MongoDB

Sail 설치 시 [MongoDB](https://www.mongodb.com/) 서비스를 선택한 경우, 여러분의 `docker-compose.yml` 파일에는 [MongoDB Atlas Local](https://www.mongodb.com/docs/atlas/cli/current/atlas-cli-local-cloud/) 컨테이너 항목이 포함되어, [Atlas 검색 인덱스](https://www.mongodb.com/docs/atlas/atlas-search/) 등 Atlas의 다양한 기능을 제공합니다. 이 컨테이너 역시 [Docker 볼륨](https://docs.docker.com/storage/volumes/)을 사용해 데이터가 영구적으로 저장됩니다.

컨테이너를 모두 시작하면, `.env` 파일의 `MONGODB_URI` 환경 변수를 `mongodb://mongodb:27017`로 설정하여 애플리케이션 안에서 MongoDB에 연결할 수 있습니다. 기본적으로 인증은 비활성화되어 있지만, `MONGODB_USERNAME`과 `MONGODB_PASSWORD` 환경 변수를 설정한 뒤 `mongodb` 컨테이너를 시작하면 인증 기능도 사용할 수 있습니다. 이 경우 아래와 같이 연결 문자열을 구성합니다.

```ini
MONGODB_USERNAME=user
MONGODB_PASSWORD=laravel
MONGODB_URI=mongodb://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@mongodb:27017
```

애플리케이션에서 MongoDB를 손쉽게 사용하려면, [MongoDB에서 공식적으로 관리하는 패키지](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/)를 설치하는 것도 추천합니다.

로컬 컴퓨터에서 직접 MongoDB 데이터베이스에 접속하려면 [Compass](https://www.mongodb.com/products/tools/compass) 같은 GUI 툴을 사용할 수 있습니다. 기본적으로 MongoDB 데이터베이스는 `localhost`의 27017 포트에서 접속 가능합니다.

<a name="redis"></a>
### Redis

애플리케이션의 `docker-compose.yml` 파일에는 [Redis](https://redis.io) 컨테이너 설정도 포함되어 있습니다. 이 컨테이너 역시 [Docker 볼륨](https://docs.docker.com/storage/volumes/)을 사용하여 데이터의 영속성을 유지합니다. 컨테이너가 모두 시작되면, `.env` 파일의 `REDIS_HOST` 환경 변수를 `redis`로 지정하여 애플리케이션 안에서 Redis에 연결할 수 있습니다.

로컬 컴퓨터에서 직접 Redis 데이터베이스에 접속하려면 [TablePlus](https://tableplus.com)와 같은 GUI 도구를 사용할 수 있습니다. 기본적으로 Redis는 `localhost`의 6379 포트에 연결됩니다.

<a name="valkey"></a>
### Valkey

Sail 설치 시 Valkey 서비스를 선택하면, 애플리케이션의 `docker-compose.yml` 파일에 [Valkey](https://valkey.io/) 컨테이너가 추가됩니다. 이 컨테이너도 [Docker 볼륨](https://docs.docker.com/storage/volumes/)을 사용해 데이터가 유지됩니다. `.env` 파일에서 `REDIS_HOST` 값을 `valkey`로 지정하면 애플리케이션에서도 연결할 수 있습니다.

로컬 컴퓨터에서 Valkey 데이터베이스에 직접 접속하려면 [TablePlus](https://tableplus.com)와 같은 GUI 도구를 사용하세요. 기본적으로 Valkey는 `localhost`의 6379 포트에 접근 가능합니다.

<a name="meilisearch"></a>
### Meilisearch

[Sail 설치 시 [Meilisearch](https://www.meilisearch.com) 서비스를 선택했다면, 여러분의 `docker-compose.yml` 파일에 강력한 검색 엔진인 Meilisearch 컨테이너가 추가됩니다. Meilisearch는 [Laravel Scout](/docs/12.x/scout)와 연동하여 사용할 수 있습니다. 컨테이너를 시작했다면, `.env` 파일에서 `MEILISEARCH_HOST`를 `http://meilisearch:7700`으로 지정해 애플리케이션에서 사용할 수 있습니다.

로컬 컴퓨터에서는 웹 브라우저에서 `http://localhost:7700` 주소로 접속하면 Meilisearch의 웹 기반 관리 패널에 들어갈 수 있습니다.

<a name="typesense"></a>
### Typesense

[Sail 설치 시 [Typesense](https://typesense.org) 서비스를 선택했다면, 애플리케이션의 `docker-compose.yml` 파일에는 초고속 오픈소스 검색 엔진인 Typesense 컨테이너가 추가됩니다. Typesense 역시 [Laravel Scout](/docs/12.x/scout#typesense)와 네이티브로 통합되어 사용할 수 있습니다. 컨테이너를 모두 시작했다면, 아래 환경 변수들을 통해 애플리케이션에서 연결 설정을 해야 합니다.

```ini
TYPESENSE_HOST=typesense
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_API_KEY=xyz
```

로컬 컴퓨터에서는 `http://localhost:8108` 경로로 Typesense API에 접근할 수 있습니다.

<a name="file-storage"></a>
## 파일 스토리지

프로덕션 환경에서 Amazon S3를 파일 저장소로 사용할 예정이라면, Sail 설치 시 [MinIO](https://min.io) 서비스를 추가하는 것이 좋습니다. MinIO는 S3와 호환되는 API를 제공하므로, 실제 프로덕션 S3 버킷을 생성할 필요 없이 로컬에서 라라벨의 `s3` 파일 스토리지 드라이버를 테스트할 수 있습니다. MinIO를 선택해 설치하면 `docker-compose.yml`에 MinIO가 자동으로 추가됩니다.

기본적으로 애플리케이션의 `filesystems` 설정 파일에는 이미 `s3` 디스크 구성이 포함되어 있습니다. Amazon S3뿐만 아니라 MinIO와 같은 S3 호환 파일 스토리지 서비스도 환경 변수만 적절히 변경하면 동일하게 사용할 수 있습니다. 예를 들어, MinIO를 사용할 때는 아래와 같이 환경 변수를 설정하세요.

```ini
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=sail
AWS_SECRET_ACCESS_KEY=password
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=local
AWS_ENDPOINT=http://minio:9000
AWS_USE_PATH_STYLE_ENDPOINT=true
```

라라벨의 Flysystem 통합이 MinIO 사용 시 올바른 URL을 생성하도록 하려면, `AWS_URL` 환경 변수를 애플리케이션의 로컬 URL과 버킷 이름을 포함하도록 정의해야 합니다.

```ini
AWS_URL=http://localhost:9000/local
```

MinIO 콘솔을 통해 버킷을 생성할 수 있으며, 콘솔은 `http://localhost:8900` 에서 접속할 수 있습니다. 기본 사용자명은 `sail`, 비밀번호는 `password`입니다.

> [!WARNING]
> MinIO를 사용하는 경우 `temporaryUrl` 메서드를 통한 임시 스토리지 URL 생성은 지원되지 않습니다.

<a name="running-tests"></a>
## 테스트 실행하기

라라벨은 뛰어난 테스트 지원을 제공하며, Sail의 `test` 명령어를 이용해 [기능 테스트와 단위 테스트](/docs/12.x/testing)를 실행할 수 있습니다. Pest / PHPUnit에서 지원하는 모든 CLI 옵션 역시 함께 전달할 수 있습니다.

```shell
sail test

sail test --group orders
```

Sail의 `test` 명령어는 아래와 같이 `test` 아티즌 명령어를 실행한 것과 동일합니다.

```shell
sail artisan test
```

Sail은 기본적으로 테스트 실행 시 사용되는 전용 `testing` 데이터베이스를 생성하므로, 실제 데이터베이스 상태를 변경하지 않고 안전하게 테스트할 수 있습니다. 기본 라라벨 설치 환경에서는, Sail이 자동으로 `phpunit.xml` 파일에 테스트 데이터베이스 정보를 설정해 줍니다.

```xml
<env name="DB_DATABASE" value="testing"/>
```

<a name="laravel-dusk"></a>
### Laravel Dusk

[Laravel Dusk](/docs/12.x/dusk)는 웹 브라우저 자동화와 테스트를 손쉽게 할 수 있는 강력한 API를 제공합니다. Sail 덕분에 Selenium 등 추가 도구를 직접 설치하지 않고도 Dusk 테스트를 실행할 수 있습니다. 먼저, 애플리케이션의 `docker-compose.yml` 파일에서 Selenium 서비스를 주석 해제하세요.

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

그리고 `laravel.test` 서비스의 `depends_on` 설정에도 `selenium`을 추가해야 합니다.

```yaml
depends_on:
    - mysql
    - redis
    - selenium
```

준비가 되면 Sail을 시작한 후, 아래와 같이 `dusk` 명령어로 Dusk 테스트 스위트를 실행할 수 있습니다.

```shell
sail dusk
```

<a name="selenium-on-apple-silicon"></a>
#### Apple Silicon에서 Selenium 사용하기

만약 Apple Silicon 칩이 탑재된 Mac을 사용한다면, `selenium` 서비스에서 `selenium/standalone-chromium` 이미지를 사용해야 합니다.

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

라라벨 Sail의 기본 `docker-compose.yml`에는 [Mailpit](https://github.com/axllent/mailpit) 서비스가 포함되어 있습니다. Mailpit은 개발 중 애플리케이션에서 발송하는 이메일을 가로채어, 웹 인터페이스로 편리하게 이메일 미리보기를 제공합니다. Sail에서 Mailpit은 기본적으로 `mailpit` 호스트명과 1025 포트로 동작합니다.

```ini
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_ENCRYPTION=null
```

Sail이 실행 중일 때 브라우저에서 `http://localhost:8025` 주소로 접속해 Mailpit 웹 인터페이스를 사용할 수 있습니다.

<a name="sail-container-cli"></a>
## 컨테이너 CLI

때로는 애플리케이션 컨테이너 내부에서 직접 Bash 세션을 시작해 파일을 살펴보거나 임의의 셸 명령어를 실행하고 싶을 수 있습니다. 이럴 때는 `shell` 명령어를 사용해 컨테이너에 접속할 수 있습니다.

```shell
sail shell

sail root-shell
```

[Laravel Tinker](https://github.com/laravel/tinker) 세션을 시작하려면, 아래와 같이 `tinker` 명령어를 실행하세요.

```shell
sail tinker
```

<a name="sail-php-versions"></a>
## PHP 버전

Sail은 현재 PHP 8.4, 8.3, 8.2, 8.1, 8.0 버전으로 애플리케이션을 서비스할 수 있습니다. 기본으로는 PHP 8.4가 적용되어 있습니다. 사용할 PHP 버전을 변경하고 싶다면, `docker-compose.yml` 파일에서 `laravel.test` 컨테이너의 `build` 항목을 아래와 같이 수정하세요.

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

또한, 애플리케이션에서 사용하는 이미지 이름도 PHP 버전에 맞춰 변경할 수 있습니다. 이 설정 역시 `docker-compose.yml` 파일에서 확인할 수 있습니다.

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

Sail은 기본적으로 Node 20을 설치합니다. Node 버전을 변경하려면, `docker-compose.yml` 파일의 `laravel.test` 서비스 내 `build.args` 항목을 원하는 버전으로 수정하세요.

```yaml
build:
    args:
        WWWGROUP: '${WWWGROUP}'
        NODE_VERSION: '18'
```

설정 변경 후에는 컨테이너 이미지를 반드시 다시 빌드해야 합니다.

```shell
sail build --no-cache

sail up
```

<a name="sharing-your-site"></a>
## 사이트 공유하기

가끔 동료에게 사이트를 미리 보여주거나, 웹훅 통합 기능을 테스트해야 할 때 사이트를 외부에 임시 공개하고 싶을 수 있습니다. 이럴 때 `share` 명령어를 사용하면, 무작위로 생성된 `laravel-sail.site` 도메인을 통해 애플리케이션에 접속할 수 있는 URL이 발급됩니다.

```shell
sail share
```

사이트를 공유할 때는 반드시 `bootstrap/app.php` 파일 안에서 `trustProxies` 미들웨어 메서드를 이용해 애플리케이션의 트러스트드 프록시(trusted proxies)를 설정해야 합니다. 그렇지 않으면, `url`, `route` 와 같은 URL 생성 헬퍼가 올바른 HTTP 호스트를 파악하지 못해 URL이 잘못 생성될 수 있습니다.

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->trustProxies(at: '*');
})
```

원한다면 임의로 서브도메인을 지정할 수도 있습니다. 이럴 때는 `subdomain` 옵션을 함께 사용하세요.

```shell
sail share --subdomain=my-sail-site
```

> [!NOTE]
> `share` 명령어는 오픈소스 터널링 서비스인 [Expose](https://github.com/beyondcode/expose, 제공: [BeyondCode](https://beyondco.de))를 기반으로 동작합니다.

<a name="debugging-with-xdebug"></a>
## Xdebug로 디버깅하기

라라벨 Sail의 Docker 설정에는 PHP 디버깅 도구인 [Xdebug](https://xdebug.org/) 지원이 내장되어 있습니다. Xdebug 활성화를 위해서는 [Sail 환경 구성](#sail-customization)이 완료된 상태여야 하며, 다음과 같이 `.env` 파일에 Xdebug 관련 변수를 추가해야 합니다.

```ini
SAIL_XDEBUG_MODE=develop,debug,coverage
```

또한, 배포된 `php.ini` 파일에 아래와 같은 설정이 포함되어 있어야 생성한 모드로 Xdebug가 동작하게 됩니다.

```ini
[xdebug]
xdebug.mode=${XDEBUG_MODE}
```

`php.ini` 파일을 변경한 뒤에는 반드시 Docker 이미지를 재빌드하여 변경사항이 반영되게 해야 합니다.

```shell
sail build --no-cache
```

#### Linux 호스트 IP 설정

Sail 내부적으로는 `XDEBUG_CONFIG` 환경 변수를 `client_host=host.docker.internal`로 설정해 Mac과 Windows(WSL2)에 맞는 Xdebug 환경을 자동으로 구성합니다. 만약 로컬 컴퓨터가 Linux이고 Docker 20.10+를 사용 중이라면 별도의 추가 설정 없이도 `host.docker.internal`이 지원됩니다.

하지만 Docker 20.10 미만의 버전에서는 Linux에서 `host.docker.internal`이 지원되지 않으므로, 컨테이너에 고정 IP를 직접 할당해야 합니다. 이를 위해서는 `docker-compose.yml` 파일에 커스텀 네트워크와 고정 IP를 정의하세요.

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

고정 IP를 설정했다면, `.env` 파일에 SAIL_XDEBUG_CONFIG 변수도 아래와 같이 지정합니다.

```ini
SAIL_XDEBUG_CONFIG="client_host=172.20.0.2"
```

<a name="xdebug-cli-usage"></a>
### Xdebug CLI 사용법

아티즌 명령어를 실행할 때 디버깅 세션을 시작하고 싶으면 `sail debug` 명령어를 이용하세요.

```shell
# Xdebug 없이 아티즌 명령어 실행...
sail artisan migrate

# Xdebug를 활성화하여 아티즌 명령어 실행...
sail debug migrate
```

<a name="xdebug-browser-usage"></a>
### Xdebug 브라우저 사용법

웹 브라우저와 함께 애플리케이션을 디버깅하려면, [Xdebug의 공식 안내문서](https://xdebug.org/docs/step_debug#web-application)에 따라 Xdebug 세션을 활성화하세요.

PhpStorm을 사용하는 경우, [제로 구성 디버깅](https://www.jetbrains.com/help/phpstorm/zero-configuration-debugging.html) 가이드도 참고할 수 있습니다.

> [!WARNING]
> 라라벨 Sail은 애플리케이션 서비스에 `artisan serve` 명령어를 사용합니다. 이 명령어는 라라벨 8.53.0 이상에서만 `XDEBUG_CONFIG`, `XDEBUG_MODE` 변수를 지원합니다. 라라벨 8.52.0 이하 버전에서는 해당 변수를 지원하지 않아 디버깅 연결이 불가능합니다.

<a name="sail-customization"></a>
## 커스터마이징

Sail은 결국 Docker 기반이기 때문에 거의 모든 부분을 자유롭게 커스터마이징할 수 있습니다. Sail의 Dockerfile 등을 직접 애플리케이션에 배포(publish)하려면 아래와 같이 실행합니다.

```shell
sail artisan sail:publish
```

이 명령을 실행하면, 라라벨 Sail에서 사용하는 Dockerfile 및 설정 파일이 프로젝트의 `docker` 디렉터리로 복사됩니다. Sail 설정을 커스터마이즈한 후에는 `docker-compose.yml` 파일에서 애플리케이션 컨테이너의 이미지 이름도 변경하고, 다시 이미지를 빌드해야 합니다. 여러 라라벨 애플리케이션을 한 머신에서 동시에 개발할 때는 각각의 컨테이너 이미지를 고유하게 지정하는 것이 특히 중요합니다.

```shell
sail build --no-cache
```
