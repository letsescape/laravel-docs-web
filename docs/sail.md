# 라라벨 세일 (Laravel Sail)

- [소개](#introduction)
- [설치 및 설정](#installation)
    - [기존 애플리케이션에 Sail 설치하기](#installing-sail-into-existing-applications)
    - [Sail 이미지 재빌드하기](#rebuilding-sail-images)
    - [셸 별칭(shell alias) 설정하기](#configuring-a-shell-alias)
- [Sail 시작 및 종료](#starting-and-stopping-sail)
- [명령어 실행](#executing-sail-commands)
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
- [테스트 실행](#running-tests)
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

[Laravel Sail](https://github.com/laravel/sail)은 라라벨에서 기본적으로 제공하는 Docker 개발 환경과 상호작용할 수 있도록 도와주는 경량 커맨드라인 인터페이스입니다. Sail을 사용하면 Docker 경험이 없어도 PHP, MySQL, Redis 기반의 라라벨 애플리케이션 개발을 손쉽게 시작할 수 있습니다.

Sail의 핵심은 프로젝트 루트에 위치하는 `docker-compose.yml` 파일과 `sail` 스크립트입니다. `sail` 스크립트는 `docker-compose.yml`로 정의한 Docker 컨테이너들과 편리하게 상호작용할 수 있는 여러 CLI 명령을 제공합니다.

라라벨 Sail은 macOS, Linux, 그리고 [WSL2](https://docs.microsoft.com/en-us/windows/wsl/about)를 사용하는 Windows에서 사용할 수 있습니다.

<a name="installation"></a>
## 설치 및 설정

라라벨 Sail은 새로운 라라벨 애플리케이션에 자동으로 설치되므로 바로 사용할 수 있습니다.

<a name="installing-sail-into-existing-applications"></a>
### 기존 애플리케이션에 Sail 설치하기

기존 라라벨 애플리케이션에서 Sail을 사용하고 싶다면 Composer 패키지 관리자를 통해 간단하게 Sail을 설치할 수 있습니다. 이 과정은 사용 중인 개발 환경에서 Composer 의존성을 설치할 수 있어야 합니다.

```shell
composer require laravel/sail --dev
```

Sail이 설치된 후에는 `sail:install` Artisan 명령어를 실행할 수 있습니다. 이 명령어는 Sail의 `docker-compose.yml` 파일을 애플리케이션 루트 디렉터리에 복사하면서, Docker 서비스와 연결할 수 있도록 `.env` 파일에 필요한 환경 변수를 추가합니다.

```shell
php artisan sail:install
```

마지막으로 Sail을 실행해서 개발 환경을 시작합니다. Sail 사용 방법에 대해 더 알아보려면 아래 내용을 계속 읽어보세요.

```shell
./vendor/bin/sail up
```

> [!WARNING]
> 리눅스용 Docker Desktop을 사용한다면, 아래 명령어로 반드시 `default` Docker context를 선택해야 합니다: `docker context use default`.

<a name="adding-additional-services"></a>
#### 추가 서비스 설치하기

기존 Sail 설치 환경에 서비스를 새로 추가하고 싶다면, 아래와 같이 `sail:add` Artisan 명령어를 실행하면 됩니다.

```shell
php artisan sail:add
```

<a name="using-devcontainers"></a>
#### Devcontainer 사용하기

[Devcontainer](https://code.visualstudio.com/docs/remote/containers) 환경에서 개발하고 싶다면, `sail:install` 명령어에 `--devcontainer` 옵션을 추가할 수 있습니다. 이 옵션을 주면, `sail:install` 명령어가 애플리케이션 루트 경로에 기본 `.devcontainer/devcontainer.json` 파일을 생성합니다.

```shell
php artisan sail:install --devcontainer
```

<a name="rebuilding-sail-images"></a>
### Sail 이미지 재빌드하기

가끔 Sail 이미지를 완전히 재빌드하여 모든 패키지와 소프트웨어가 최신 상태인지 확인하고 싶을 때가 있습니다. 이럴 때는 아래와 같이 `build` 명령어를 사용하면 됩니다.

```shell
docker compose down -v

sail build --no-cache

sail up
```

<a name="configuring-a-shell-alias"></a>
### 셸 별칭(shell alias) 설정하기

기본적으로, Sail 명령은 모든 새로운 라라벨 애플리케이션에 포함된 `vendor/bin/sail` 스크립트를 통해 실행합니다.

```shell
./vendor/bin/sail up
```

이렇게 매번 `vendor/bin/sail`을 입력하는 대신, 쉘 별칭을 설정하면 Sail 명령을 더 편하게 실행할 수 있습니다.

```shell
alias sail='sh $([ -f sail ] && echo sail || echo vendor/bin/sail)'
```

이 설정을 항상 유지하려면, 사용자 홈 디렉터리의 셸 설정 파일(예: `~/.zshrc`나 `~/.bashrc`)에 위 별칭을 추가한 뒤 셸을 재시작하세요.

별칭 설정 후에는 단순히 `sail`만 입력하면 Sail 명령을 실행할 수 있습니다. 아래 문서의 모든 예제 역시 이 별칭이 설정되어 있다고 가정합니다.

```shell
sail up
```

<a name="starting-and-stopping-sail"></a>
## Sail 시작 및 종료

라라벨 Sail의 `docker-compose.yml` 파일에는 라라벨 개발에 필요한 다양한 Docker 컨테이너가 정의되어 있습니다. 각 컨테이너는 `docker-compose.yml` 파일의 `services` 설정 항목에 포함되어 있습니다. 이 중에서 `laravel.test` 컨테이너가 실제로 여러분의 애플리케이션을 서비스하는 주 컨테이너입니다.

Sail을 시작하기 전에, 컴퓨터에서 다른 웹서버나 데이터베이스가 실행 중이지 않은지 반드시 확인하세요. 모든 Docker 컨테이너를 함께 실행하려면 아래와 같이 `up` 명령을 실행합니다.

```shell
sail up
```

모든 컨테이너를 백그라운드에서 실행하려면, "detached" 모드(-d 옵션)를 사용할 수 있습니다.

```shell
sail up -d
```

애플리케이션 컨테이너 실행이 완료되면 웹 브라우저에서 http://localhost로 접속할 수 있습니다.

모든 컨테이너를 종료하려면 단순히 Control + C를 눌러 실행을 중지하면 됩니다. 만약 백그라운드에서 실행 중이라면 다음 명령어로 중지할 수 있습니다.

```shell
sail stop
```

<a name="executing-sail-commands"></a>
## 명령어 실행

라라벨 Sail을 사용하는 경우, 애플리케이션이 Docker 컨테이너에서 실행되므로 로컬 컴퓨터 환경과 분리되어 있습니다. 그렇지만 Sail을 사용하면 임의의 PHP 명령어, Artisan 명령어, Composer 명령어, Node/NPM 명령어도 편리하게 실행할 수 있습니다.

**라라벨 공식 문서를 볼 때, 종종 Sail이 붙지 않은 Composer, Artisan, Node/NPM 명령어 예시를 볼 수 있습니다.** 이런 예시는 해당 도구가 로컬에 설치되어 있다고 전제하는 것입니다. 하지만 Sail를 쓴다면 이런 명령어들은 Sail을 통해 실행해야 합니다.

```shell
# 로컬에서 Artisan 명령어 실행...
php artisan queue:work

# 라라벨 Sail 환경에서 Artisan 명령어 실행...
sail artisan queue:work
```

<a name="executing-php-commands"></a>
### PHP 명령어 실행

PHP 명령어는 `php` 커맨드로 실행할 수 있습니다. 명령어는 설정된 PHP 버전으로 실행되며, Sail에서 지원하는 PHP 버전은 [PHP 버전 문서](#sail-php-versions)를 참고하세요.

```shell
sail php --version

sail php script.php
```

<a name="executing-composer-commands"></a>
### Composer 명령어 실행

Composer 명령어는 `composer` 커맨드를 통해 실행할 수 있습니다. Sail 앱 컨테이너에는 컴포저가 이미 설치되어 있습니다.

```shell
sail composer require laravel/sanctum
```

<a name="executing-artisan-commands"></a>
### Artisan 명령어 실행

라라벨의 Artisan 명령어는 `artisan` 커맨드로 실행할 수 있습니다.

```shell
sail artisan queue:work
```

<a name="executing-node-npm-commands"></a>
### Node / NPM 명령어 실행

Node 명령어는 `node`, NPM 명령어는 `npm` 커맨드로 실행할 수 있습니다.

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

`docker-compose.yml` 파일에는 MySQL 컨테이너 항목이 포함되어 있습니다. 이 컨테이너는 [Docker 볼륨](https://docs.docker.com/storage/volumes/)을 이용해 데이터베이스의 데이터를 컨테이너 중지/재시작 시에도 안전하게 보존합니다.

또한 MySQL 컨테이너가 최초로 시작될 때, 두 개의 데이터베이스가 생성됩니다. 첫 번째 데이터베이스는 `DB_DATABASE` 환경 변수의 값을 사용하여 생성되며, 로컬 개발 용도로 사용합니다. 두 번째 데이터베이스는 테스트 전용으로 `testing` 이라는 이름으로 만들어집니다. 이를 통해 개발 데이터와 테스트 데이터가 서로 영향을 주지 않습니다.

컨테이너를 시작한 후 애플리케이션 내에서 MySQL에 접속하려면 `.env` 파일의 `DB_HOST` 환경 변수를 `mysql`로 지정하세요.

로컬 컴퓨터에서 MySQL에 접속하려면 [TablePlus](https://tableplus.com) 같은 GUI 데이터베이스 도구를 사용할 수 있습니다. 기본 설정 기준 MySQL은 `localhost`의 3306 포트에서 접속할 수 있으며, 접속 정보는 `DB_USERNAME`, `DB_PASSWORD` 환경 변수와 같습니다. 또는 `root` 유저로도 접속할 수 있고, 이 경우에도 비밀번호는 `DB_PASSWORD` 값으로 설정됩니다.

<a name="mongodb"></a>
### MongoDB

Sail 설치 시 [MongoDB](https://www.mongodb.com/) 서비스를 선택했다면, `docker-compose.yml`에 [MongoDB Atlas Local](https://www.mongodb.com/docs/atlas/cli/current/atlas-cli-local-cloud/) 컨테이너 항목이 추가됩니다. 이 컨테이너는 Atlas의 [Search Indexes](https://www.mongodb.com/docs/atlas/atlas-search/) 등 부가 기능도 제공합니다. 데이터는 Docker 볼륨을 사용해 안전하게 보존됩니다.

컨테이너를 시작한 후 애플리케이션에서 MongoDB에 접속하려면 `.env` 파일의 `MONGODB_URI` 환경 변수를 `mongodb://mongodb:27017`로 지정하세요. 기본적으로 인증은 비활성화되어 있지만, 컨테이너 실행 전 `MONGODB_USERNAME`, `MONGODB_PASSWORD` 환경 변수를 설정하여 인증을 활성화할 수 있습니다. 이후 접속 문자열에 인증 정보를 포함합니다.

```ini
MONGODB_USERNAME=user
MONGODB_PASSWORD=laravel
MONGODB_URI=mongodb://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@mongodb:27017
```

MongoDB를 애플리케이션에 원활하게 통합하려면 [MongoDB에서 공식 유지보수하는 라라벨용 패키지](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/)를 설치하세요.

로컬 컴퓨터에서 MongoDB에 접속하려면 [Compass](https://www.mongodb.com/products/tools/compass) 등 GUI를 사용할 수 있습니다. 기본적으로 `localhost`의 27017 포트로 접속 가능합니다.

<a name="redis"></a>
### Redis

`docker-compose.yml` 파일에는 [Redis](https://redis.io) 컨테이너 항목도 포함되어 있습니다. 이 컨테이너 역시 Docker 볼륨을 사용해 데이터가 보존됩니다. 컨테이너를 시작한 후 애플리케이션에서 Redis에 접속하려면 `.env` 파일의 `REDIS_HOST` 환경 변수를 `redis`로 지정하세요.

로컬에서 Redis 데이터베이스에 접속하려면 [TablePlus](https://tableplus.com) 같은 GUI 데이터베이스 도구를 사용할 수 있습니다. 기본적으로 `localhost`의 6379 포트로 접속 가능합니다.

<a name="valkey"></a>
### Valkey

Sail 설치 시 Valkey 서비스를 선택했다면, `docker-compose.yml` 파일에 [Valkey](https://valkey.io/) 컨테이너가 추가됩니다. 이 컨테이너도 Docker 볼륨을 사용해 데이터가 보존됩니다. 애플리케이션에서 이 컨테이너와 연결하려면 `.env` 파일의 `REDIS_HOST` 환경 변수를 `valkey`로 지정하세요.

로컬에서 Valkey 데이터베이스에 접속하려면 [TablePlus](https://tableplus.com) 같은 GUI 데이터베이스 도구를 사용할 수 있습니다. 기본적으로 `localhost`의 6379 포트로 접속 가능합니다.

<a name="meilisearch"></a>
### Meilisearch

Sail 설치 시 [Meilisearch](https://www.meilisearch.com) 서비스를 선택했다면, `docker-compose.yml`에 이 강력한 검색 엔진 컨테이너 항목이 추가됩니다. [Laravel Scout](/docs/scout)와 통합되어 사용할 수 있습니다. 컨테이너를 시작한 후 애플리케이션에서 Meilisearch에 접속하려면 `MEILISEARCH_HOST` 환경 변수를 `http://meilisearch:7700`으로 지정하세요.

로컬 컴퓨터에서는 웹 브라우저에서 `http://localhost:7700`으로 Meilisearch의 관리 페이지에 접근할 수 있습니다.

<a name="typesense"></a>
### Typesense

Sail 설치 시 [Typesense](https://typesense.org) 서비스를 선택했다면, `docker-compose.yml`에 매우 빠르고 오픈소스인 검색 엔진 Typesense 항목이 추가됩니다. [Laravel Scout](/docs/scout#typesense)와도 연동됩니다. 컨테이너를 시작한 후 아래와 같이 환경 변수를 설정해서 애플리케이션과 연결할 수 있습니다.

```ini
TYPESENSE_HOST=typesense
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_API_KEY=xyz
```

로컬 컴퓨터에서는 `http://localhost:8108`로 Typesense API에 접근할 수 있습니다.

<a name="file-storage"></a>
## 파일 스토리지

프로덕션 환경에서 Amazon S3에 파일을 저장할 계획이라면, Sail 설치 시 [MinIO](https://min.io) 서비스를 선택할 수 있습니다. MinIO는 Amazon S3와 호환되는 API를 제공하므로, S3 환경을 테스트 용도로 직접 사용할 필요 없이 로컬에서 개발할 수 있습니다. MinIO를 Sail 환경에 추가하면 `docker-compose.yml`에 해당 설정이 반영됩니다.

라라벨의 기본 `filesystems` 설정 파일에는 이미 `s3` 디스크가 구성되어 있습니다. Amazon S3는 물론 MinIO 같은 S3 호환 스토리지도 환경 변수만 변경하여 쉽게 사용할 수 있습니다. 예를 들어 MinIO를 사용할 경우 아래와 같이 환경 변수를 설정합니다.

```ini
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=sail
AWS_SECRET_ACCESS_KEY=password
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=local
AWS_ENDPOINT=http://minio:9000
AWS_USE_PATH_STYLE_ENDPOINT=true
```

MinIO를 사용할 때, Flysystem 연동이 올바른 URL을 생성하려면 `AWS_URL` 환경 변수를 앱의 로컬 URL과 버킷 이름 경로를 포함해 지정해야 합니다.

```ini
AWS_URL=http://localhost:9000/local
```

MinIO 콘솔은 `http://localhost:8900`에서 사용할 수 있으며, 기본 사용자명은 `sail`, 비밀번호는 `password`입니다.

> [!WARNING]
> MinIO를 사용할 때는 `temporaryUrl` 메서드를 통한 임시 스토리지 URL 생성이 지원되지 않습니다.

<a name="running-tests"></a>
## 테스트 실행

라라벨은 강력한 테스트 기능을 기본 제공합니다. Sail의 `test` 명령을 사용해 [기능/유닛 테스트](/docs/testing)를 실행할 수 있습니다. Pest/PHPUnit에서 지원하는 CLI 옵션도 함께 전달할 수 있습니다.

```shell
sail test

sail test --group orders
```

Sail의 `test` 명령은 사실상 `test` Artisan 명령 실행과 동일합니다.

```shell
sail artisan test
```

기본적으로 Sail은 테스트가 실제 데이터베이스 상태를 해치지 않도록 별도 `testing` 데이터베이스를 생성합니다. 일반 라라벨 설치에서는 `phpunit.xml` 설정도 이 DB를 쓰도록 자동 지정됩니다.

```xml
<env name="DB_DATABASE" value="testing"/>
```

<a name="laravel-dusk"></a>
### Laravel Dusk

[Laravel Dusk](/docs/dusk)은 간편하게 브라우저 자동화 및 UI 테스트 환경을 제공합니다. Sail 덕분에 Selenium 등 별도 도구 설치 없이도 Dusk 테스트를 실행할 수 있습니다. 우선, `docker-compose.yml` 파일에서 Selenium 서비스를 주석 해제하세요.

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

다음으로, `laravel.test` 서비스의 `depends_on`에 Selenium을 추가합니다.

```yaml
depends_on:
    - mysql
    - redis
    - selenium
```

이후 Sail을 실행하고 `dusk` 명령어로 Dusk 테스트를 시작할 수 있습니다.

```shell
sail dusk
```

<a name="selenium-on-apple-silicon"></a>
#### Apple Silicon에서 Selenium 사용

Apple Silicon(M1/M2 등) 칩셋을 사용하는 경우, `selenium` 서비스는 `selenium/standalone-chromium` 이미지를 사용해야 합니다.

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

라라벨 Sail의 기본 `docker-compose.yml` 파일에는 [Mailpit](https://github.com/axllent/mailpit) 서비스가 포함되어 있습니다. Mailpit은 로컬 개발 중 애플리케이션이 전송한 이메일을 가로채서, 웹 브라우저에서 미리볼 수 있는 웹 인터페이스를 제공합니다. Sail 사용 시, Mailpit의 기본 호스트는 `mailpit`이며 포트는 1025입니다.

```ini
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_ENCRYPTION=null
```

Sail이 실행 중이라면, http://localhost:8025 에서 Mailpit 웹 인터페이스를 사용할 수 있습니다.

<a name="sail-container-cli"></a>
## 컨테이너 CLI

가끔 애플리케이션 컨테이너에서 Bash 세션을 직접 실행하고 싶을 경우가 있습니다. 이런 경우, `shell` 명령어를 사용하여 컨테이너에 접속하면 파일이나 설치된 서비스 확인, 임의의 셸 명령 실행 등이 가능합니다.

```shell
sail shell

sail root-shell
```

[Laravel Tinker](https://github.com/laravel/tinker) 세션을 새로 시작하려면 `tinker` 명령을 실행하면 됩니다.

```shell
sail tinker
```

<a name="sail-php-versions"></a>
## PHP 버전

Sail은 현재 PHP 8.4, 8.3, 8.2, 8.1, 8.0을 모두 지원합니다. 기본 PHP 버전은 PHP 8.4입니다. 사용하려는 PHP 버전을 변경하려면, `docker-compose.yml`에서 `laravel.test` 컨테이너의 `build` 설정을 아래와 같이 변경하세요.

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

또한, 사용 중인 PHP 버전을 반영하도록 `image` 이름도 업데이트하는 것이 좋습니다. 이 설정 역시 `docker-compose.yml`에서 지정합니다.

```yaml
image: sail-8.2/app
```

`docker-compose.yml` 변경 후 컨테이너 이미지를 재빌드하세요.

```shell
sail build --no-cache

sail up
```

<a name="sail-node-versions"></a>
## Node 버전

Sail은 기본적으로 Node 20을 설치합니다. 빌드 시 다른 Node 버전을 설치하고 싶다면, `docker-compose.yml`의 `laravel.test` 서비스의 `build.args` 항목을 수정하면 됩니다.

```yaml
build:
    args:
        WWWGROUP: '${WWWGROUP}'
        NODE_VERSION: '18'
```

수정 후 컨테이너 이미지를 반드시 재빌드하세요.

```shell
sail build --no-cache

sail up
```

<a name="sharing-your-site"></a>
## 사이트 공유하기

동료에게 사이트를 보여주거나, Webhook 연동 테스트를 위해 사이트를 외부에 잠시 공개해야 할 때가 있습니다. 이럴 때 `share` 명령어를 사용하면, 임의로 생성된 `laravel-sail.site` URL이 발급되어 외부에서 애플리케이션에 접근할 수 있습니다.

```shell
sail share
```

`share` 명령어로 사이트를 외부에 공개할 경우, `bootstrap/app.php`의 `trustProxies` 미들웨어 메서드로 신뢰할 수 있는 프록시를 반드시 등록해야 합니다. 그렇지 않으면 `url`, `route`와 같은 라라벨의 URL 생성 도우미가 올바른 HTTP 호스트를 판단하지 못할 수 있습니다.

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->trustProxies(at: '*');
})
```

공유 사이트의 서브도메인을 직접 지정하려면 `subdomain` 옵션을 줄 수 있습니다.

```shell
sail share --subdomain=my-sail-site
```

> [!NOTE]
> `share` 명령은 [BeyondCode](https://beyondco.de)가 만든 오픈소스 터널 서비스 [Expose](https://github.com/beyondcode/expose)를 사용합니다.

<a name="debugging-with-xdebug"></a>
## Xdebug로 디버깅하기

라라벨 Sail의 Docker 구성에는 [Xdebug](https://xdebug.org/) 지원이 포함되어 있습니다. Xdebug는 PHP용으로 매우 강력하고 널리 쓰이는 디버거입니다. Xdebug를 활성화하려면, [Sail 환경 구성을 먼저 발행](#sail-customization)한 뒤 아래와 같이 `.env` 파일에 Xdebug 관련 변수를 추가하세요.

```ini
SAIL_XDEBUG_MODE=develop,debug,coverage
```

그 다음, 발행된 `php.ini` 파일에도 Xdebug 모드를 아래와 같이 지정해야 합니다.

```ini
[xdebug]
xdebug.mode=${XDEBUG_MODE}
```

`php.ini`를 수정했다면, Docker 이미지를 반드시 재빌드해야 변경사항이 반영됩니다.

```shell
sail build --no-cache
```

#### 리눅스에서 호스트 IP 설정

내부적으로 `XDEBUG_CONFIG` 환경 변수는 `client_host=host.docker.internal`로 되어 있어 macOS 및 Windows(WSL2)에서 Xdebug가 문제 없이 동작합니다. 만약 리눅스에서 Docker 20.10 이상을 사용한다면 추가 설정 없이 사용 가능합니다.

하지만 Docker 20.10 미만 버전에서는 `host.docker.internal`이 지원되지 않으므로, 컨테이너에 고정 IP를 할당하여 직접 지정해야 합니다. 이 경우, `docker-compose.yml`에서 커스텀 네트워크와 고정 IP를 아래처럼 설정하세요.

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

이렇게 IP를 고정했다면, `.env` 파일에 SAIL_XDEBUG_CONFIG 변수를 다음과 같이 추가합니다.

```ini
SAIL_XDEBUG_CONFIG="client_host=172.20.0.2"
```

<a name="xdebug-cli-usage"></a>
### Xdebug CLI 사용법

Artisan 명령어 실행 시 디버깅 세션을 시작하고 싶다면, `sail debug` 명령을 사용할 수 있습니다.

```shell
# Xdebug 없이 Artisan 명령 실행...
sail artisan migrate

# Xdebug를 사용해 Artisan 명령 실행...
sail debug migrate
```

<a name="xdebug-browser-usage"></a>
### Xdebug 브라우저 사용법

웹 브라우저에서 애플리케이션을 직접 다루면서 디버깅하려면, [Xdebug 공식 문서](https://xdebug.org/docs/step_debug#web-application)에서 안내하는 방법대로 Xdebug 세션을 시작하면 됩니다.

PhpStorm을 사용한다면 [제로 설정 디버깅](https://www.jetbrains.com/help/phpstorm/zero-configuration-debugging.html) 관련 JetBrains 문서도 참고하세요.

> [!WARNING]
> 라라벨 Sail은 애플리케이션을 서비스할 때 `artisan serve` 명령어에 의존합니다. `artisan serve`는 라라벨 8.53.0 이상에서만 `XDEBUG_CONFIG`, `XDEBUG_MODE` 변수를 인식합니다. 8.52.0 이하 구버전에서는 지원하지 않으니 참고하세요.

<a name="sail-customization"></a>
## 커스터마이징

Sail은 결국 Docker이기 때문에, 거의 모든 부분을 자유롭게 커스터마이징할 수 있습니다. Sail 전용 Dockerfile들을 직접 프로젝트에 복사하려면 다음 명령어를 실행하세요.

```shell
sail artisan sail:publish
```

이 명령을 실행하면, 라라벨 Sail에서 사용하는 Dockerfile과 기타 구성 파일들이 프로젝트 루트의 `docker` 디렉터리에 복사됩니다. Sail을 직접 커스터마이징한 후, 애플리케이션 컨테이너 이미지의 이름을 변경하고 싶다면 `docker-compose.yml`에서 해당 이름을 수정한 뒤 컨테이너 이미지를 다시 빌드해야 합니다. 여러 라라벨 프로젝트를 한 컴퓨터에서 Sail로 개발하는 경우, 이미지 이름을 고유하게 지정하는 것이 충돌 방지에 매우 중요합니다.

```shell
sail build --no-cache
```