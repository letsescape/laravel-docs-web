# 라라벨 옥테인 (Laravel Octane)

- [소개](#introduction)
- [설치](#installation)
- [서버 사전 요구사항](#server-prerequisites)
    - [FrankenPHP](#frankenphp)
    - [RoadRunner](#roadrunner)
    - [Swoole](#swoole)
- [애플리케이션 서비스 시작](#serving-your-application)
    - [HTTPS로 애플리케이션 제공](#serving-your-application-via-https)
    - [Nginx로 애플리케이션 제공](#serving-your-application-via-nginx)
    - [파일 변경 감지](#watching-for-file-changes)
    - [워커 개수 지정](#specifying-the-worker-count)
    - [최대 요청 개수 지정](#specifying-the-max-request-count)
    - [워커 재시작](#reloading-the-workers)
    - [서버 중지](#stopping-the-server)
- [의존성 주입과 Octane](#dependency-injection-and-octane)
    - [컨테이너 주입](#container-injection)
    - [요청 객체 주입](#request-injection)
    - [설정 리포지토리 주입](#configuration-repository-injection)
- [메모리 누수 관리](#managing-memory-leaks)
- [동시 작업](#concurrent-tasks)
- [틱과 인터벌](#ticks-and-intervals)
- [Octane 캐시](#the-octane-cache)
- [테이블](#tables)

<a name="introduction"></a>
## 소개

[라라벨 Octane](https://github.com/laravel/octane)은 [FrankenPHP](https://frankenphp.dev/), [Open Swoole](https://openswoole.com/), [Swoole](https://github.com/swoole/swoole-src), [RoadRunner](https://roadrunner.dev) 등 고성능 애플리케이션 서버를 사용하여 애플리케이션의 성능을 크게 향상시켜줍니다. Octane은 애플리케이션을 한 번 부팅한 뒤 메모리에 상주시켜, 매우 빠른 속도로 요청을 처리할 수 있도록 지원합니다.

<a name="installation"></a>
## 설치

Octane은 Composer 패키지 매니저를 통해 설치할 수 있습니다:

```shell
composer require laravel/octane
```

Octane 설치 후에는 `octane:install` 아티즌 명령어를 실행하여 Octane의 설정 파일을 애플리케이션에 추가할 수 있습니다:

```shell
php artisan octane:install
```

<a name="server-prerequisites"></a>
## 서버 사전 요구사항

> [!WARNING]
> 라라벨 Octane은 [PHP 8.1+](https://php.net/releases/) 버전이 필요합니다.

<a name="frankenphp"></a>
### FrankenPHP

[FrankenPHP](https://frankenphp.dev)는 Go 언어로 작성된 PHP 애플리케이션 서버로, early hints, Brotli, Zstandard 압축 등 최신 웹 기술을 지원합니다. Octane과 함께 FrankenPHP를 서버로 선택하면, Octane이 FrankenPHP 바이너리를 자동으로 다운로드 및 설치해줍니다.

<a name="frankenphp-via-laravel-sail"></a>
#### Laravel Sail을 활용한 FrankenPHP

[Laravel Sail](/docs/12.x/sail)을 이용해 개발하려는 경우, 다음 명령어를 실행하여 Octane과 FrankenPHP를 설치할 수 있습니다:

```shell
./vendor/bin/sail up

./vendor/bin/sail composer require laravel/octane
```

그 다음, `octane:install` 아티즌 명령어를 사용해 FrankenPHP 바이너리를 설치합니다:

```shell
./vendor/bin/sail artisan octane:install --server=frankenphp
```

마지막으로, 애플리케이션의 `docker-compose.yml` 파일에서 `laravel.test` 서비스 정의에 `SUPERVISOR_PHP_COMMAND` 환경변수를 추가해야 합니다. 이 환경변수에는 Sail이 PHP 개발 서버 대신 Octane으로 애플리케이션을 제공할 때 사용할 명령어가 포함됩니다:

```yaml
services:
  laravel.test:
    environment:
      SUPERVISOR_PHP_COMMAND: "/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan octane:start --server=frankenphp --host=0.0.0.0 --admin-port=2019 --port='${APP_PORT:-80}'" # [tl! add]
      XDG_CONFIG_HOME:  /var/www/html/config # [tl! add]
      XDG_DATA_HOME:  /var/www/html/data # [tl! add]
```

HTTPS, HTTP/2, HTTP/3를 활성화하려면 다음과 같이 수정할 수 있습니다:

```yaml
services:
  laravel.test:
    ports:
        - '${APP_PORT:-80}:80'
        - '${VITE_PORT:-5173}:${VITE_PORT:-5173}'
        - '443:443' # [tl! add]
        - '443:443/udp' # [tl! add]
    environment:
      SUPERVISOR_PHP_COMMAND: "/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan octane:start --host=localhost --port=443 --admin-port=2019 --https" # [tl! add]
      XDG_CONFIG_HOME:  /var/www/html/config # [tl! add]
      XDG_DATA_HOME:  /var/www/html/data # [tl! add]
```

일반적으로 FrankenPHP Sail 애플리케이션은 `https://localhost`를 통해 접속해야 하며, `https://127.0.0.1`로 접근하려면 추가 설정이 필요하므로 [권장되지 않습니다](https://frankenphp.dev/docs/known-issues/#using-https127001-with-docker).

<a name="frankenphp-via-docker"></a>
#### Docker를 활용한 FrankenPHP

FrankenPHP의 공식 Docker 이미지를 사용하면 더 나은 성능과, FrankenPHP의 정적 설치에는 포함되지 않은 확장 기능들을 사용할 수 있습니다. 또한 공식 Docker 이미지는 윈도우 등 FrankenPHP를 네이티브로 지원하지 않는 플랫폼에서도 실행할 수 있게 해줍니다. FrankenPHP 공식 Docker 이미지는 로컬 개발 및 운영 환경 모두에 적합합니다.

아래의 Dockerfile을 참고해 FrankenPHP 기반 라라벨 애플리케이션을 컨테이너화할 수 있습니다:

```dockerfile
FROM dunglas/frankenphp

RUN install-php-extensions \
    pcntl
    # Add other PHP extensions here...

COPY . /app

ENTRYPOINT ["php", "artisan", "octane:frankenphp"]
```

개발 중에는 다음과 같은 Docker Compose 파일을 사용해 애플리케이션을 실행할 수 있습니다:

```yaml
# compose.yaml
services:
  frankenphp:
    build:
      context: .
    entrypoint: php artisan octane:frankenphp --workers=1 --max-requests=1
    ports:
      - "8000:8000"
    volumes:
      - .:/app
```

`php artisan octane:start` 명령어에 `--log-level` 옵션을 직접 지정하면 Octane은 FrankenPHP의 기본 로거를 사용하게 되며, 별도로 설정하지 않는 한 구조화된 JSON 로그를 출력합니다.

FrankenPHP와 Docker 운용에 대한 자세한 내용은 [공식 FrankenPHP 문서](https://frankenphp.dev/docs/docker/)를 참고하세요.

<a name="roadrunner"></a>
### RoadRunner

[RoadRunner](https://roadrunner.dev)는 Go로 개발된 RoadRunner 바이너리를 기반으로 동작합니다. RoadRunner 기반 Octane 서버를 처음 시작할 때, Octane이 RoadRunner 바이너리를 다운로드하고 설치할지 확인 메시지를 보여줍니다.

<a name="roadrunner-via-laravel-sail"></a>
#### Laravel Sail을 활용한 RoadRunner

[Laravel Sail](/docs/12.x/sail)을 사용하여 개발하려는 경우, 다음 명령어를 실행해 Octane과 RoadRunner를 설치할 수 있습니다:

```shell
./vendor/bin/sail up

./vendor/bin/sail composer require laravel/octane spiral/roadrunner-cli spiral/roadrunner-http
```

그 다음, Sail 쉘을 실행한 뒤, `rr` 실행파일을 사용하여 RoadRunner의 최신 리눅스 빌드를 받아야 합니다:

```shell
./vendor/bin/sail shell

# Sail 쉘 내부에서...
./vendor/bin/rr get-binary
```

그리고 `docker-compose.yml`의 `laravel.test` 서비스 정의에 `SUPERVISOR_PHP_COMMAND` 환경 변수를 추가합니다. 이 변수는 Sail이 PHP 개발 서버 대신 Octane으로 애플리케이션을 제공할 때 사용할 명령어입니다:

```yaml
services:
  laravel.test:
    environment:
      SUPERVISOR_PHP_COMMAND: "/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan octane:start --server=roadrunner --host=0.0.0.0 --rpc-port=6001 --port='${APP_PORT:-80}'" # [tl! add]
```

마지막으로 `rr` 바이너리의 실행 권한을 부여하고, Sail 이미지를 빌드합니다:

```shell
chmod +x ./rr

./vendor/bin/sail build --no-cache
```

<a name="swoole"></a>
### Swoole

Swoole 애플리케이션 서버를 사용하여 라라벨 Octane 애플리케이션을 제공하려면 Swoole PHP 확장 모듈을 설치해야 합니다. 일반적으로 PECL을 통해 설치할 수 있습니다:

```shell
pecl install swoole
```

<a name="openswoole"></a>
#### Open Swoole

Open Swoole 애플리케이션 서버를 사용하려면 Open Swoole PHP 확장 모듈을 설치해야 합니다. 보통 PECL을 통해 설치할 수 있습니다:

```shell
pecl install openswoole
```

라라벨 Octane을 Open Swoole과 함께 사용하면 Swoole이 제공하는 기능(동시 작업, 틱, 인터벌 등)도 동일하게 사용할 수 있습니다.

<a name="swoole-via-laravel-sail"></a>
#### Laravel Sail을 활용한 Swoole

> [!WARNING]
> Sail을 통해 Octane 애플리케이션을 서비스하기 전, Laravel Sail의 최신 버전인지 확인하고, 애플리케이션 루트 디렉토리에서 `./vendor/bin/sail build --no-cache`를 반드시 실행해야 합니다.

또는, [Laravel Sail](/docs/12.x/sail) 공식 Docker 기반 개발 환경을 사용해 Swoole 기반 Octane 애플리케이션을 개발할 수도 있습니다. Laravel Sail에는 기본적으로 Swoole 확장 모듈이 포함되어 있습니다. 하지만, `docker-compose.yml` 파일 일부를 수정해야 합니다.

시작하려면 먼저 `docker-compose.yml`의 `laravel.test` 서비스 정의에 `SUPERVISOR_PHP_COMMAND` 환경변수를 추가하세요. 이 환경변수에는 Sail이 PHP 개발 서버 대신 Octane으로 애플리케이션을 서비스할 때 사용할 명령어가 포함됩니다:

```yaml
services:
  laravel.test:
    environment:
      SUPERVISOR_PHP_COMMAND: "/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan octane:start --server=swoole --host=0.0.0.0 --port='${APP_PORT:-80}'" # [tl! add]
```

마지막으로 Sail 이미지를 빌드하면 됩니다:

```shell
./vendor/bin/sail build --no-cache
```

<a name="swoole-configuration"></a>
#### Swoole 설정

Swoole은 `octane` 설정 파일에 추가할 수 있는 몇 가지 고급 옵션을 지원합니다. 자주 바꿀 필요는 없기 때문에, 이 옵션들은 기본 설정 파일에는 포함되어 있지 않습니다:

```php
'swoole' => [
    'options' => [
        'log_file' => storage_path('logs/swoole_http.log'),
        'package_max_length' => 10 * 1024 * 1024,
    ],
],
```

<a name="serving-your-application"></a>
## 애플리케이션 서비스 시작

Octane 서버는 `octane:start` 아티즌 명령어로 시작할 수 있습니다. 이 명령어는 기본적으로 `octane` 설정 파일의 `server` 항목에 지정된 서버를 사용합니다:

```shell
php artisan octane:start
```

기본적으로 Octane은 8000 포트에서 서버를 시작하므로, 웹 브라우저에서 `http://localhost:8000`으로 접속할 수 있습니다.

<a name="serving-your-application-via-https"></a>
### HTTPS로 애플리케이션 제공

기본적으로 Octane에서 작동 중인 애플리케이션은 `http://`로 시작하는 링크를 생성합니다. 애플리케이션의 `config/octane.php` 설정 파일에서 사용할 수 있는 `OCTANE_HTTPS` 환경 변수 값을 `true`로 설정하면, HTTPS 환경에서 동작할 때 Octane이 라라벨에 모든 링크를 `https://`로 생성하도록 요청할 수 있습니다:

```php
'https' => env('OCTANE_HTTPS', false),
```

<a name="serving-your-application-via-nginx"></a>
### Nginx로 애플리케이션 제공

> [!NOTE]
> 서버 설정을 직접 관리하거나, 라라벨 Octane 애플리케이션을 운영하기 위한 다양한 서비스를 직접 구성하는 것이 부담스럽다면 [Laravel Cloud](https://cloud.laravel.com)의 완전 관리형 Octane 지원 서비스를 활용하는 것을 고려해보세요.

운영 환경에서는 Octane 애플리케이션을 일반적인 웹 서버(Nginx 또는 Apache) 뒤에 위치시키는 것이 좋습니다. 이를 통해 웹 서버가 이미지나 스타일시트 같은 정적 자산을 직접 서비스하고, SSL 인증서 처리도 맡길 수 있습니다.

아래는 Nginx 기본 설정 예시입니다. Nginx가 사이트의 정적 자산 요청을 처리하고, 나머지 요청을 8000번 포트에서 실행 중인 Octane 서버로 프록시합니다:

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 80;
    listen [::]:80;
    server_name domain.com;
    server_tokens off;
    root /home/forge/domain.com/public;

    index index.php;

    charset utf-8;

    location /index.php {
        try_files /not_exists @octane;
    }

    location / {
        try_files $uri $uri/ @octane;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    access_log off;
    error_log  /var/log/nginx/domain.com-error.log error;

    error_page 404 /index.php;

    location @octane {
        set $suffix "";

        if ($uri = /index.php) {
            set $suffix ?$query_string;
        }

        proxy_http_version 1.1;
        proxy_set_header Host $http_host;
        proxy_set_header Scheme $scheme;
        proxy_set_header SERVER_PORT $server_port;
        proxy_set_header REMOTE_ADDR $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;

        proxy_pass http://127.0.0.1:8000$suffix;
    }
}
```

<a name="watching-for-file-changes"></a>
### 파일 변경 감지

Octane 서버가 시작되면 애플리케이션이 메모리에 상주하게 되므로, 코드가 변경되어도 브라우저에서 새로고침만으로는 변경 사항이 반영되지 않습니다. 예를 들어, `routes/web.php`에 새로운 라우트를 추가해도 서버를 재시작하기 전까지는 반영되지 않습니다. 이를 해결하기 위해, `--watch` 플래그를 사용하면 애플리케이션 내부 파일의 변경을 자동으로 감지해 Octane 서버를 재시작하도록 할 수 있습니다:

```shell
php artisan octane:start --watch
```

이 기능을 사용하기 전에는, 로컬 개발환경에 [Node](https://nodejs.org)가 설치되어 있어야 하며, 프로젝트에 [Chokidar](https://github.com/paulmillr/chokidar) 파일 감지 라이브러리를 추가해야 합니다:

```shell
npm install --save-dev chokidar
```

감지할 디렉터리 및 파일은 애플리케이션의 `config/octane.php` 설정 파일의 `watch` 항목에서 지정할 수 있습니다.

<a name="specifying-the-worker-count"></a>
### 워커 개수 지정

기본적으로 Octane은 머신의 각 CPU 코어마다 요청 워커를 하나씩 시작합니다. 이 워커들은 HTTP 요청을 효율적으로 처리합니다. 만약 직접 워커 개수를 지정하고 싶다면, `octane:start` 명령어 실행 시 `--workers` 옵션을 사용할 수 있습니다:

```shell
php artisan octane:start --workers=4
```

Swoole 애플리케이션 서버를 사용한다면, ["task worker"](#concurrent-tasks) 개수도 추가로 지정할 수 있습니다:

```shell
php artisan octane:start --workers=4 --task-workers=6
```

<a name="specifying-the-max-request-count"></a>
### 최대 요청 개수 지정

메모리 누수를 방지하기 위해, Octane은 워커가 500개의 요청을 처리하면 워커를 정상적으로 재시작합니다. 이 숫자는 `--max-requests` 옵션을 통해 조정할 수 있습니다:

```shell
php artisan octane:start --max-requests=250
```

<a name="reloading-the-workers"></a>
### 워커 재시작

`octane:reload` 명령어를 사용하면 Octane 서버의 애플리케이션 워커를 부드럽게 재시작할 수 있습니다. 보통 배포 후 새로운 코드가 메모리에 반영되도록 할 때 주로 사용합니다:

```shell
php artisan octane:reload
```

<a name="stopping-the-server"></a>
### 서버 중지

`octane:stop` 아티즌 명령어로 Octane 서버를 중지할 수 있습니다:

```shell
php artisan octane:stop
```

<a name="checking-the-server-status"></a>
#### 서버 상태 확인

`octane:status` 아티즌 명령어로 Octane 서버의 현재 상태를 확인할 수 있습니다:

```shell
php artisan octane:status
```

<a name="dependency-injection-and-octane"></a>
## 의존성 주입과 Octane

Octane은 애플리케이션을 한 번 부팅한 뒤, 메모리에 그대로 유지하면서 요청을 처리합니다. 이런 방식으로 동작하기 때문에, 애플리케이션을 개발할 때 몇 가지 주의해야 할 점이 있습니다. 예를 들어, 서비스 프로바이더의 `register` 및 `boot` 메서드는 워커가 처음 부팅될 때 한 번만 실행됩니다. 그 후에는 같은 애플리케이션 인스턴스가 반복해서 재사용됩니다.

이와 관련하여, 애플리케이션 서비스 컨테이너나 HTTP 요청 인스턴스를 객체의 생성자에 주입하면 안 됩니다. 이렇게 하면, 그 객체가 이후 요청에 대해 오래된(실제 요청과는 다른) 컨테이너나 요청 인스턴스를 가질 수 있게 됩니다.

Octane은 요청마다 프레임워크 핵심 상태를 자동으로 리셋해주지만, 여러분의 애플리케이션이 만든 전역 상태까지 항상 재설정할 수 있는 것은 아닙니다. 따라서 Octane에 잘 맞는 구조로 애플리케이션을 설계하는 것이 중요합니다. 아래에서는 Octane 사용 시 주의해야 할 대표적인 상황들을 안내합니다.

<a name="container-injection"></a>
### 컨테이너 주입

일반적으로, 애플리케이션 서비스 컨테이너나 HTTP 요청 인스턴스를 다른 객체의 생성자에 직접 주입하는 것은 피해야 합니다. 예를 들어, 다음 바인딩은 전체 애플리케이션 서비스 컨테이너를 싱글턴으로 바인딩된 객체에 주입합니다:

```php
use App\Service;
use Illuminate\Contracts\Foundation\Application;

/**
 * Register any application services.
 */
public function register(): void
{
    $this->app->singleton(Service::class, function (Application $app) {
        return new Service($app);
    });
}
```

이 예시에서, 만약 `Service` 인스턴스가 애플리케이션 부팅 과정에서 생성된다면, 그 인스턴스는 같은 컨테이너 객체를 계속 보유하게 됩니다. 이는 경우에 따라서는 괜찮을 수 있지만, 부트 사이클 뒷부분이나 다음 요청에서 컨테이너에 새로운 바인딩이 추가된 경우, 해당 서비스 인스턴스에서는 이를 인식하지 못하는 문제가 발생할 수 있습니다.

이런 상황을 우회하려면, 해당 바인딩을 싱글턴이 아닌 일반 바인딩으로 변경하거나, 항상 최신 컨테이너 인스턴스를 반환하는 클로저(익명 함수) 형태로 주입하는 것도 방법입니다:

```php
use App\Service;
use Illuminate\Container\Container;
use Illuminate\Contracts\Foundation\Application;

$this->app->bind(Service::class, function (Application $app) {
    return new Service($app);
});

$this->app->singleton(Service::class, function () {
    return new Service(fn () => Container::getInstance());
});
```

전역 `app` 헬퍼와 `Container::getInstance()` 메서드는 항상 최신 애플리케이션 컨테이너 인스턴스를 반환하므로 안전하게 사용할 수 있습니다.

<a name="request-injection"></a>
### 요청 객체 주입

일반적으로, 애플리케이션 서비스 컨테이너나 HTTP 요청 인스턴스를 다른 객체의 생성자에 직접 주입하는 것은 피해야 합니다. 다음 예시는 HTTP 요청 인스턴스를 싱글턴 객체에 주입하는 경우입니다:

```php
use App\Service;
use Illuminate\Contracts\Foundation\Application;

/**
 * Register any application services.
 */
public function register(): void
{
    $this->app->singleton(Service::class, function (Application $app) {
        return new Service($app['request']);
    });
}
```

이 예시에서, 만약 `Service` 인스턴스가 부트 과정에서 생성된다면, 그 인스턴스는 최초 요청의 HTTP 요청 인스턴스만을 계속 보유하게 됩니다. 이후 모든 요청에 대해 헤더, 입력값, 쿼리스트링 등 모든 요청 데이터가 잘못 참조되는 문제가 발생합니다.

이 경우에도 바인딩을 싱글턴이 아닌 일반 바인딩으로 변경하거나, 항상 최신 요청 인스턴스를 반환하는 클로저를 주입하는 것이 방법입니다. 또는, 가장 권장되는 방식은 객체의 메서드를 호출할 때 필요한 요청 정보만을 메서드 인자로 전달하는 것입니다:

```php
use App\Service;
use Illuminate\Contracts\Foundation\Application;

$this->app->bind(Service::class, function (Application $app) {
    return new Service($app['request']);
});

$this->app->singleton(Service::class, function (Application $app) {
    return new Service(fn () => $app['request']);
});

// 또는...

$service->method($request->input('name'));
```

전역 `request` 헬퍼는 앱이 현재 처리 중인 최신 요청을 항상 반환하므로, 애플리케이션 내 어디서든 안전하게 사용할 수 있습니다.

> [!WARNING]
> 컨트롤러 메서드와 라우트 클로저에서 `Illuminate\Http\Request` 타입힌트를 사용하는 것은 안전합니다.

<a name="configuration-repository-injection"></a>
### 설정 리포지토리 주입

일반적으로, 설정 리포지토리 인스턴스를 객체의 생성자에 직접 주입하는 것은 피해야 합니다. 다음은 설정 리포지토리를 싱글턴 객체로 바인딩하는 예시입니다:

```php
use App\Service;
use Illuminate\Contracts\Foundation\Application;

/**
 * Register any application services.
 */
public function register(): void
{
    $this->app->singleton(Service::class, function (Application $app) {
        return new Service($app->make('config'));
    });
}
```

이 경우, 만약 설정 값이 요청 사이에 변경된다면 기존 서비스는 새 설정 값을 참조하지 못하고, 최초 저장된 값만 사용하게 됩니다.

이를 우회하려면 바인딩을 싱글턴이 아닌 일반 바인딩으로 만들거나, 항상 최신 설정 리포지토리를 반환하는 클로저를 주입할 수 있습니다:

```php
use App\Service;
use Illuminate\Container\Container;
use Illuminate\Contracts\Foundation\Application;

$this->app->bind(Service::class, function (Application $app) {
    return new Service($app->make('config'));
});

$this->app->singleton(Service::class, function () {
    return new Service(fn () => Container::getInstance()->make('config'));
});
```

전역 `config` 헬퍼는 항상 최신 설정 리포지토리 인스턴스를 반환하므로, 애플리케이션 내에서 안전하게 사용할 수 있습니다.

<a name="managing-memory-leaks"></a>
### 메모리 누수 관리

Octane은 요청 사이에도 애플리케이션을 메모리에 유지하기 때문에, 정적으로 관리되는 배열 등에 데이터를 추가하면 메모리 누수가 발생할 수 있습니다. 예를 들어, 아래의 컨트롤러 코드는 요청마다 static `$data` 배열에 데이터를 계속 추가하여 메모리 누수를 유발합니다:

```php
use App\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Handle an incoming request.
 */
public function index(Request $request): array
{
    Service::$data[] = Str::random(10);

    return [
        // ...
    ];
}
```

애플리케이션을 개발할 때, 이러한 메모리 누수 패턴이 발생하지 않도록 특별히 주의해야 하며, 로컬 개발 중 메모리 사용량을 주기적으로 확인하는 것이 좋습니다.

<a name="concurrent-tasks"></a>
## 동시 작업

> [!WARNING]
> 이 기능은 [Swoole](#swoole)이 필요합니다.

Swoole을 사용할 때는 경량화된 백그라운드 태스크를 통해 작업을 동시에 실행할 수 있습니다. Octane의 `concurrently` 메서드를 사용하면 손쉽게 여러 작업을 병렬 처리할 수 있습니다. PHP의 배열 구조 분해 기능과 결합하면 작업별 결과를 쉽게 받아올 수 있습니다:

```php
use App\Models\User;
use App\Models\Server;
use Laravel\Octane\Facades\Octane;

[$users, $servers] = Octane::concurrently([
    fn () => User::all(),
    fn () => Server::all(),
]);
```

Octane의 동시 작업은 Swoole의 "task worker"를 활용하며, 각 작업은 요청을 처리하는 메인 프로세스와는 분리된 새로운 프로세스에서 실행됩니다. 동시 작업을 처리할 수 있는 워커 개수는 `octane:start` 명령어의 `--task-workers` 옵션으로 지정합니다:

```shell
php artisan octane:start --workers=4 --task-workers=6
```

`concurrently` 메서드 사용 시 Swoole 태스크 시스템의 제한으로 인해 1024개 이하의 작업만 전달해야 합니다.

<a name="ticks-and-intervals"></a>
## 틱과 인터벌

> [!WARNING]
> 이 기능은 [Swoole](#swoole)이 필요합니다.

Swoole을 사용할 때 일정 초마다 실행되는 "틱(tick)" 작업을 등록할 수 있습니다. `tick` 메서드를 이용해 이러한 콜백을 등록할 수 있으며, 첫 번째 인자는 티커의 이름을 나타내는 문자열, 두 번째 인자는 매 인터벌마다 실행될 콜러블(함수)이 됩니다.

아래는 10초마다 호출되는 클로저를 등록하는 예시입니다. 보통 `tick`은 서비스 프로바이더의 `boot` 메서드 등에서 호출하는 것이 일반적입니다:

```php
Octane::tick('simple-ticker', fn () => ray('Ticking...'))
    ->seconds(10);
```

`immediate` 메서드를 사용하면 Octane 서버가 처음 부팅할 때도 콜백이 즉시 한 번 실행되고, 이후 N초마다 반복됩니다:

```php
Octane::tick('simple-ticker', fn () => ray('Ticking...'))
    ->seconds(10)
    ->immediate();
```

<a name="the-octane-cache"></a>
## Octane 캐시

> [!WARNING]
> 이 기능은 [Swoole](#swoole)이 필요합니다.

Swoole을 사용할 때는 Octane 캐시 드라이버를 활용할 수 있습니다. 이 드라이버는 초당 2백만 번 이상의 읽기/쓰기 속도를 제공하므로, 극단적으로 빠른 캐시 레이어가 필요한 애플리케이션에 적합합니다.

이 캐시는 [Swoole 테이블](https://www.swoole.co.uk/docs/modules/swoole-table) 기반으로 동작합니다. 서버 내 모든 워커가 동일한 캐시 데이터를 공유하게 되나, 서버가 재시작되면 저장된 데이터는 모두 초기화됩니다:

```php
Cache::store('octane')->put('framework', 'Laravel', 30);
```

> [!NOTE]
> Octane 캐시에 저장 가능한 최대 엔트리 수는 애플리케이션의 `octane` 설정 파일에서 지정할 수 있습니다.

<a name="cache-intervals"></a>
### 캐시 인터벌

Octane 캐시 드라이버는 라라벨의 일반적인 캐시 메서드 외에, 지정한 주기로 자동 갱신되는 인터벌 캐시 기능을 지원합니다. 이런 캐시는 보통 서비스 프로바이더의 `boot` 메서드에서 등록합니다. 다음은 5초마다 갱신되는 캐시 예시입니다:

```php
use Illuminate\Support\Str;

Cache::store('octane')->interval('random', function () {
    return Str::random(10);
}, seconds: 5);
```

<a name="tables"></a>
## 테이블

> [!WARNING]
> 이 기능은 [Swoole](#swoole)이 필요합니다.

Swoole을 사용할 때는 원하는 형태의 [Swoole 테이블](https://www.swoole.co.uk/docs/modules/swoole-table)을 직접 등록하고 사용할 수 있습니다. Swoole 테이블은 매우 높은 성능의 데이터 저장/조회가 가능하며, 서버 내 모든 워커가 동일 데이터에 접근할 수 있습니다. 다만, 서버가 재시작되면 모든 데이터가 사라집니다.

테이블은 애플리케이션 `octane` 설정 파일의 `tables` 배열에서 정의할 수 있습니다. 예시로, 최대 1000개 행까지 저장 가능한 테이블이 기본적으로 설정되어 있습니다. 문자열 컬럼의 최대 크기는 아래와 같이 타입 뒤에 사이즈를 명시하여 설정할 수 있습니다:

```php
'tables' => [
    'example:1000' => [
        'name' => 'string:1000',
        'votes' => 'int',
    ],
],
```

테이블에 접근하려면, `Octane::table` 메서드를 사용할 수 있습니다:

```php
use Laravel\Octane\Facades\Octane;

Octane::table('example')->set('uuid', [
    'name' => 'Nuno Maduro',
    'votes' => 1000,
]);

return Octane::table('example')->get('uuid');
```

> [!WARNING]
> Swoole 테이블에서 지원되는 컬럼 타입은 `string`, `int`, `float`입니다.
