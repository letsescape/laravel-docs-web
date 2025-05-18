# 라라벨 Octane (Laravel Octane)

- [소개](#introduction)
- [설치](#installation)
- [서버 사전 준비 사항](#server-prerequisites)
    - [FrankenPHP](#frankenphp)
    - [RoadRunner](#roadrunner)
    - [Swoole](#swoole)
- [애플리케이션 서비스 시작](#serving-your-application)
    - [HTTPS를 통한 애플리케이션 서비스](#serving-your-application-via-https)
    - [Nginx를 통한 애플리케이션 서비스](#serving-your-application-via-nginx)
    - [파일 변경 감지 및 자동 재시작](#watching-for-file-changes)
    - [워커 개수 지정하기](#specifying-the-worker-count)
    - [최대 요청 처리 횟수 지정하기](#specifying-the-max-request-count)
    - [워커 재시작하기](#reloading-the-workers)
    - [서버 중지하기](#stopping-the-server)
- [의존성 주입과 Octane](#dependency-injection-and-octane)
    - [컨테이너 주입](#container-injection)
    - [Request 주입](#request-injection)
    - [설정 저장소(Configuration Repository) 주입](#configuration-repository-injection)
- [메모리 누수 관리](#managing-memory-leaks)
- [동시 작업(Concurrent Tasks)](#concurrent-tasks)
- [틱(Tick) 및 인터벌(Interval) 활용](#ticks-and-intervals)
- [Octane 캐시](#the-octane-cache)
- [테이블(Tables)](#tables)

<a name="introduction"></a>
## 소개

[Laravel Octane](https://github.com/laravel/octane)는 [FrankenPHP](https://frankenphp.dev/), [Open Swoole](https://openswoole.com/), [Swoole](https://github.com/swoole/swoole-src), [RoadRunner](https://roadrunner.dev) 등 고성능 애플리케이션 서버를 통해 여러분의 라라벨 애플리케이션의 성능을 극대화합니다. Octane은 애플리케이션을 한 번만 부팅한 후 메모리에 유지하고, 미친 속도로 들어오는 요청들을 처리하게 합니다.

<a name="installation"></a>
## 설치

Octane은 Composer 패키지 매니저를 통해 설치할 수 있습니다.

```shell
composer require laravel/octane
```

Octane 설치 후에는 `octane:install` 아티즌 명령어를 실행하여 Octane의 설정 파일을 애플리케이션에 추가할 수 있습니다.

```shell
php artisan octane:install
```

<a name="server-prerequisites"></a>
## 서버 사전 준비 사항

> [!WARNING]
> 라라벨 Octane을 사용하려면 [PHP 8.1 이상](https://php.net/releases/)이 필요합니다.

<a name="frankenphp"></a>
### FrankenPHP

> [!WARNING]
> FrankenPHP의 Octane 통합은 아직 베타 버전이므로 운영 환경에서는 신중하게 사용해야 합니다.

[FrankenPHP](https://frankenphp.dev)는 Go 언어로 작성된 PHP 애플리케이션 서버로, early hints, Zstandard 압축 등 최신 웹 기능을 지원합니다. Octane을 설치하고 서버로 FrankenPHP를 선택하면, Octane이 FrankenPHP 바이너리를 자동으로 다운로드하여 설치해줍니다.

<a name="frankenphp-via-laravel-sail"></a>
#### Laravel Sail을 통한 FrankenPHP 사용

[Laravel Sail](/docs/10.x/sail)로 애플리케이션을 개발하려면, 아래 명령어를 실행하여 Octane과 FrankenPHP를 설치해야 합니다.

```shell
./vendor/bin/sail up

./vendor/bin/sail composer require laravel/octane
```

다음으로, `octane:install` 아티즌 명령어를 사용해 FrankenPHP 바이너리를 설치합니다.

```shell
./vendor/bin/sail artisan octane:install --server=frankenphp
```

마지막으로, 애플리케이션의 `docker-compose.yml` 파일에서 `laravel.test` 서비스 정의에 `SUPERVISOR_PHP_COMMAND` 환경 변수를 추가합니다. 이 환경 변수는 Sail이 PHP 개발 서버 대신 Octane으로 애플리케이션을 실행할 때 사용할 명령어입니다.

```yaml
services:
  laravel.test:
    environment:
      SUPERVISOR_PHP_COMMAND: "/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan octane:start --server=frankenphp --host=0.0.0.0 --admin-port=2019 --port=80" # [tl! add]
      XDG_CONFIG_HOME:  /var/www/html/config # [tl! add]
      XDG_DATA_HOME:  /var/www/html/data # [tl! add]
```

HTTPS, HTTP/2, HTTP/3을 활성화하려면 아래와 같이 구성합니다.

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

일반적으로 FrankenPHP Sail 애플리케이션에는 `https://localhost`로 접근해야 하며, `https://127.0.0.1`을 사용하려면 추가 설정이 필요하므로 [권장되지 않습니다](https://frankenphp.dev/docs/known-issues/#using-https127001-with-docker).

<a name="frankenphp-via-docker"></a>
#### Docker를 통한 FrankenPHP 사용

FrankenPHP의 공식 Docker 이미지를 사용하면 성능이 더 우수하고, FrankenPHP의 정적 설치에는 없는 추가 확장도 사용할 수 있습니다. 또, 공식 Docker 이미지로 FrankenPHP가 기본적으로 지원하지 않는 플랫폼(예: Windows)에서도 실행할 수 있습니다. 공식 Docker 이미지는 로컬 개발과 운영 환경 모두에 적합합니다.

FrankenPHP를 사용하는 라라벨 애플리케이션을 컨테이너화하려면 아래의 Dockerfile을 참고할 수 있습니다.

```dockerfile
FROM dunglas/frankenphp

RUN install-php-extensions \
    pcntl
    # Add other PHP extensions here...

COPY . /app

ENTRYPOINT ["php", "artisan", "octane:frankenphp"]
```

개발 중에는 아래와 같은 Docker Compose 파일로 애플리케이션을 실행할 수 있습니다.

```yaml
# compose.yaml
services:
  frankenphp:
    build:
      context: .
    entrypoint: php artisan octane:frankenphp --max-requests=1
    ports:
      - "8000:8000"
    volumes:
      - .:/app
```

Docker 환경에서 FrankenPHP를 실행하는 더 자세한 방법은 [공식 FrankenPHP 문서](https://frankenphp.dev/docs/docker/)를 참고하세요.

<a name="roadrunner"></a>
### RoadRunner

[RoadRunner](https://roadrunner.dev)는 Go로 작성된 RoadRunner 바이너리 기반으로 동작합니다. RoadRunner 기반의 Octane 서버를 처음 실행할 때, Octane은 RoadRunner 바이너리 다운로드 및 설치를 안내합니다.

<a name="roadrunner-via-laravel-sail"></a>
#### Laravel Sail을 통한 RoadRunner 사용

[Laravel Sail](/docs/10.x/sail)로 애플리케이션을 개발하려면, 아래 명령어를 실행하여 Octane과 RoadRunner를 설치해야 합니다.

```shell
./vendor/bin/sail up

./vendor/bin/sail composer require laravel/octane spiral/roadrunner-cli spiral/roadrunner-http 
```

그 다음 Sail 셸을 실행한 후, `rr` 실행 파일을 이용해 최신 리눅스용 RoadRunner 바이너리를 받아야 합니다.

```shell
./vendor/bin/sail shell

# Sail 셸 내부에서...
./vendor/bin/rr get-binary
```

그리고 애플리케이션의 `docker-compose.yml` 파일에서 `laravel.test` 서비스 정의에 `SUPERVISOR_PHP_COMMAND` 환경 변수를 추가합니다. 이 환경 변수는 Sail이 PHP 개발 서버 대신 Octane으로 애플리케이션을 실행할 때 사용할 명령어입니다.

```yaml
services:
  laravel.test:
    environment:
      SUPERVISOR_PHP_COMMAND: "/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan octane:start --server=roadrunner --host=0.0.0.0 --rpc-port=6001 --port=80" # [tl! add]
```

마지막으로, `rr` 바이너리에 실행 권한을 부여하고, Sail 이미지를 빌드합니다.

```shell
chmod +x ./rr

./vendor/bin/sail build --no-cache
```

<a name="swoole"></a>
### Swoole

Swoole 애플리케이션 서버를 사용해 라라벨 Octane 애플리케이션을 실행하려면, Swoole PHP 확장(extension)을 설치해야 합니다. 일반적으로 아래와 같이 PECL을 통해 설치할 수 있습니다.

```shell
pecl install swoole
```

<a name="openswoole"></a>
#### Open Swoole

Open Swoole 애플리케이션 서버를 사용하려면, Open Swoole PHP 확장(extension)을 설치해야 합니다. 보통 PECL을 이용해 설치합니다.

```shell
pecl install openswoole
```

라라벨 Octane과 Open Swoole을 함께 사용하면 Swoole이 제공하는 동시 작업, tick, interval 등 모든 기능을 동일하게 사용할 수 있습니다.

<a name="swoole-via-laravel-sail"></a>
#### Laravel Sail을 통한 Swoole 사용

> [!WARNING]
> Sail로 Octane 애플리케이션을 실행하기 전에, Laravel Sail 최신 버전 사용 여부를 확인하고 애플리케이션 루트 디렉터리에서 `./vendor/bin/sail build --no-cache`를 먼저 실행하세요.

또는, [Laravel Sail](/docs/10.x/sail) 공식 Docker 기반 개발 환경을 활용해 Swoole 기반 Octane 애플리케이션을 개발할 수 있습니다. Laravel Sail에는 Swoole 확장이 기본 포함되어 있지만, Sail에서 사용하는 `docker-compose.yml` 파일의 수정은 직접 해주어야 합니다.

먼저, `docker-compose.yml` 파일에서 `laravel.test` 서비스 정의에 `SUPERVISOR_PHP_COMMAND` 환경 변수를 추가합니다. 이 환경 변수는 Sail이 PHP 개발 서버 대신 Octane으로 애플리케이션을 실행할 때 사용할 명령어입니다.

```yaml
services:
  laravel.test:
    environment:
      SUPERVISOR_PHP_COMMAND: "/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan octane:start --server=swoole --host=0.0.0.0 --port=80" # [tl! add]
```

그리고 Sail 이미지를 빌드합니다.

```shell
./vendor/bin/sail build --no-cache
```

<a name="swoole-configuration"></a>
#### Swoole 설정

Swoole은 필요에 따라 `octane` 설정 파일에 추가할 수 있는 몇 가지 고유 옵션을 지원합니다. 하지만, 이 옵션들은 거의 수정할 필요가 없으므로 기본 설정 파일에는 포함되어 있지 않습니다.

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

Octane 서버는 `octane:start` 아티즌 명령어를 통해 시작할 수 있습니다. 기본적으로 이 명령어는 애플리케이션의 `octane` 설정 파일에 정의된 `server` 옵션을 사용합니다.

```shell
php artisan octane:start
```

Octane은 기본적으로 8000번 포트에서 서버를 시작하므로, 웹 브라우저를 통해 `http://localhost:8000`으로 애플리케이션에 접근할 수 있습니다.

<a name="serving-your-application-via-https"></a>
### HTTPS를 통한 애플리케이션 서비스

기본적으로 Octane으로 실행 중인 애플리케이션은 `http://`로 시작하는 링크를 생성합니다. 애플리케이션의 `config/octane.php` 설정에서 `OCTANE_HTTPS` 환경 변수를 `true`로 지정하면, HTTPS로 서비스할 때 모든 생성되는 링크를 `https://`로 강제할 수 있습니다.

```php
'https' => env('OCTANE_HTTPS', false),
```

<a name="serving-your-application-via-nginx"></a>
### Nginx를 통한 애플리케이션 서비스

> [!NOTE]
> 직접 서버 구성을 관리하는 것이 익숙하지 않거나 여러 서비스를 구성하는 것에 부담이 있다면, [Laravel Forge](https://forge.laravel.com) 사용을 고려해보세요.

운영 환경에서는 Octane 애플리케이션을 Nginx 또는 Apache와 같은 일반적인 웹 서버 뒤에서 서비스하는 것이 좋습니다. 이렇게 하면 웹 서버가 이미지, 스타일시트와 같은 정적 파일을 직접 서비스할 수 있고, SSL 인증서 종료 등도 효율적으로 관리할 수 있습니다.

아래는 Nginx 설정 예시입니다. 여기서는 Nginx가 정적 자산을 서비스하고, 동적 요청은 8000번 포트의 Octane 서버로 프록시합니다.

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
### 파일 변경 감지 및 자동 재시작

Octane 서버가 시작될 때 한 번만 애플리케이션을 메모리에 올리기 때문에, 애플리케이션 파일이 변경되어도 브라우저 새로고침만으로는 해당 변경 사항이 반영되지 않습니다. 예를 들어, `routes/web.php`에서 추가한 라우트도 서버를 재시작하기 전에는 적용되지 않습니다. 이런 불편을 해소하려면 `--watch` 옵션을 사용해 파일 변경 시 Octane 서버가 자동으로 재시작되게 할 수 있습니다.

```shell
php artisan octane:start --watch
```

이 기능을 사용하기 전, 로컬 개발 환경에 [Node](https://nodejs.org) 설치가 되어 있어야 하고, 프로젝트에 [Chokidar](https://github.com/paulmillr/chokidar) 파일 감시 라이브러리도 설치해야 합니다.

```shell
npm install --save-dev chokidar
```

감시할 디렉터리와 파일 목록은 `config/octane.php` 설정 파일의 `watch` 옵션을 통해 지정할 수 있습니다.

<a name="specifying-the-worker-count"></a>
### 워커 개수 지정하기

기본적으로 Octane은 애플리케이션 요청 워커(worker)를 머신의 CPU 코어 개수만큼 시작합니다. 각각의 워커는 들어오는 HTTP 요청을 처리합니다. 원한다면 `octane:start` 명령 실행 시 `--workers` 옵션을 통해 직접 워커 개수를 지정할 수 있습니다.

```shell
php artisan octane:start --workers=4
```

Swoole 애플리케이션 서버를 사용하는 경우, 동시에 ["task workers"](#concurrent-tasks) 개수도 지정할 수 있습니다.

```shell
php artisan octane:start --workers=4 --task-workers=6
```

<a name="specifying-the-max-request-count"></a>
### 최대 요청 처리 횟수 지정하기

메모리 누수를 방지하기 위해 Octane은 각 워커가 500개의 요청을 처리하면 자동으로 워커를 재시작합니다. 이 숫자는 `--max-requests` 옵션으로 조정할 수 있습니다.

```shell
php artisan octane:start --max-requests=250
```

<a name="reloading-the-workers"></a>
### 워커 재시작하기

Octane 서버의 애플리케이션 워커는 `octane:reload` 명령어로 우아하게 재시작할 수 있습니다. 보통은 코드가 배포된 후, 서버의 메모리에 새 코드를 반영하기 위해 이 명령어를 실행합니다.

```shell
php artisan octane:reload
```

<a name="stopping-the-server"></a>
### 서버 중지하기

Octane 서버는 `octane:stop` 아티즌 명령어로 중지할 수 있습니다.

```shell
php artisan octane:stop
```

<a name="checking-the-server-status"></a>
#### 서버 상태 확인하기

현재 Octane 서버의 상태는 `octane:status` 아티즌 명령어로 확인할 수 있습니다.

```shell
php artisan octane:status
```

<a name="dependency-injection-and-octane"></a>
## 의존성 주입과 Octane

Octane은 애플리케이션을 한 번만 실행해서 메모리에 유지하며, 요청을 계속 처리하기 때문에 애플리케이션을 개발할 때 주의해야 할 점이 몇 가지 있습니다. 예를 들어, 서비스 프로바이더의 `register`나 `boot` 메서드는 워커가 최초 실행될 때 딱 한 번만 실행됩니다. 이후 모든 요청에서는 동일한 애플리케이션 인스턴스가 재사용됩니다.

이러한 특성 때문에, 서비스 컨테이너나 Request 인스턴스를 객체의 생성자에 직접 주입하는 경우에는 특별히 주의해야 합니다. 만약 그렇게 한다면, 해당 객체가 이후의 요청에서도 "오래된" 컨테이너나 Request 인스턴스를 계속 사용할 수 있습니다.

Octane은 프레임워크의 기본 상태(예: 라라벨이 관리하는 자체 상태)는 매 요청마다 자동으로 초기화하지만, 여러분이 만든 글로벌/정적 상태는 Octane이 자동으로 감지하여 초기화할 수 없습니다. 따라서 Octane 친화적인 방식으로 애플리케이션을 개발해야 합니다. 다음은 Octane에서 종종 문제가 되는 상황들에 대한 설명입니다.

<a name="container-injection"></a>
### 컨테이너 주입

일반적으로, 애플리케이션 서비스 컨테이너나 HTTP Request 인스턴스를 다른 객체의 생성자에 직접 주입하는 것은 피하는 것이 좋습니다. 예를 들어, 아래 바인딩은 애플리케이션 전체 서비스 컨테이너를 싱글톤 객체의 생성자에 직접 주입합니다.

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

이 예시에서 `Service` 인스턴스가 애플리케이션 부팅 과정 중에 생성되면, 해당 시점의 컨테이너가 서비스 객체에 주입되고, 이후의 모든 요청에서도 똑같은(최초의) 컨테이너 인스턴스를 계속 사용하게 됩니다. 이렇게 해도 문제없는 경우가 대부분이지만, 일부 상황에서는 부팅 중 추가되거나 이후의 요청에서 추가된 바인딩들을 Service가 알지 못해 의도치 않은 버그가 발생할 수 있습니다.

이 문제를 피하는 방법은 싱글톤으로 등록하지 않거나, 컨테이너 인스턴스를 항상 현재 시점 것으로 가져오는 클로저(resolver)를 생성자에 주입하는 것입니다.

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

글로벌 `app` 헬퍼나 `Container::getInstance()` 메서드를 사용하면 항상 최신 애플리케이션 컨테이너 인스턴스를 가져올 수 있습니다.

<a name="request-injection"></a>
### Request 주입

일반적으로, 애플리케이션 서비스 컨테이너나 HTTP Request 인스턴스를 다른 객체의 생성자에 직접 주입하는 것은 피하는 것이 좋습니다. 아래 코드는 요청 전체 인스턴스를 싱글톤 객체의 생성자에 주입하는 예시입니다.

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

이 예시에서 `Service` 인스턴스가 애플리케이션 부팅 시점에 생성되면, 그때의 Request 인스턴스가 Service에 주입되고, 이후 모든 요청에서 같은 Request를 계속 사용하게 됩니다. 결국 헤더, 입력 데이터, 쿼리스트링 등 모든 요청 정보가 잘못된 값으로 고정됩니다.

이 문제를 피하려면, 싱글톤 등록을 피하거나, 현재 요청을 가져오는 클로저를 생성자에 주입하거나, 가장 권장되는 방식은 객체가 실제로 필요한 요청 데이터만 런타임에 메서드 매개변수로 전달하는 것입니다.

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

글로벌 `request` 헬퍼를 사용하면 항상 현재 처리 중인 요청 인스턴스를 가져올 수 있으므로, 애플리케이션 내에서 안전하게 사용할 수 있습니다.

> [!WARNING]
> 컨트롤러 메서드와 라우트 클로저에서는 `Illuminate\Http\Request` 타입 힌트 사용은 정상적으로 동작하므로, 이 경우에는 주입해도 안전합니다.

<a name="configuration-repository-injection"></a>
### 설정 저장소(Configuration Repository) 주입

마찬가지로, 설정 저장소 인스턴스를 다른 객체의 생성자에 직접 주입하는 것도 피해야 합니다. 아래 예시는 설정 저장소 인스턴스를 싱글톤 객체의 생성자에 주입하는 예시입니다.

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

이렇게 하면, 만약 요청 사이에 설정값이 바뀌더라도 Service는 항상 최초 주입된 설정 저장소만 사용하게 되어 새로운 값에 접근할 수 없습니다.

문제 해결을 위해 싱글톤을 피하거나, 항상 현재 설정 저장소를 반환하는 클로저를 생성자에 전달하는 방법을 활용할 수 있습니다.

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

글로벌 `config` 헬퍼를 사용하면 항상 최신 설정 저장소 인스턴스를 가져올 수 있으므로, 애플리케이션 내에서 안전하게 사용할 수 있습니다.

<a name="managing-memory-leaks"></a>
### 메모리 누수 관리

Octane은 애플리케이션을 요청 사이에도 메모리에 계속 유지하므로, static 배열 등에 데이터를 추가하는 경우 메모리 누수가 발생할 수 있습니다. 아래 컨트롤러는 매 요청마다 static `$data` 배열에 데이터를 쌓아 메모리 누수가 생기는 예시입니다.

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

애플리케이션을 개발할 때는 이런 유형의 메모리 누수가 발생하지 않도록 각별히 주의해야 하며, 로컬 개발 시 애플리케이션의 메모리 사용량을 꼭 확인하는 것이 좋습니다.

<a name="concurrent-tasks"></a>
## 동시 작업(Concurrent Tasks)

> [!WARNING]
> 이 기능은 [Swoole](#swoole)이 필요합니다.

Swoole을 사용할 경우, 가벼운 백그라운드 작업을 동시에 실행할 수 있습니다. Octane의 `concurrently` 메서드를 활용하면 여러 작업을 병렬로 실행하고, PHP의 배열 분해 문법과 함께 각 작업의 결과를 쉽게 받을 수 있습니다.

```php
use App\Models\User;
use App\Models\Server;
use Laravel\Octane\Facades\Octane;

[$users, $servers] = Octane::concurrently([
    fn () => User::all(),
    fn () => Server::all(),
]);
```

Octane의 동시 작업은 Swoole의 "task workers"에서 처리되며, 요청 자체와는 독립된 별도의 프로세스에서 실행됩니다. 동시 작업을 처리할 수 있는 워커의 개수는 `octane:start` 명령어의 `--task-workers` 옵션으로 지정할 수 있습니다.

```shell
php artisan octane:start --workers=4 --task-workers=6
```

`concurrently` 메서드 사용 시, Swoole의 시스템 제한으로 인해 최대 1024개 이하의 작업만 제공해야 합니다.

<a name="ticks-and-intervals"></a>
## 틱(Tick) 및 인터벌(Interval) 활용

> [!WARNING]
> 이 기능은 [Swoole](#swoole)이 필요합니다.

Swoole을 사용할 경우, 특정 초 간격마다 반복적으로 실행되는 "tick" 작업을 등록할 수 있습니다. `tick` 메서드로 등록하며, 첫 번째 인자는 ticker의 이름(문자열), 두 번째 인자는 주기적으로 호출될 콜백입니다.

아래는 10초마다 클로저가 실행되도록 등록하는 예시입니다. 보통 이 메서드는 서비스 프로바이더의 `boot` 메서드 내에서 호출합니다.

```php
Octane::tick('simple-ticker', fn () => ray('Ticking...'))
        ->seconds(10);
```

`immediate` 메서드를 이용하면 Octane 서버가 부팅될 때 즉시 한 번 tick 콜백을 실행하고, 이후 N초마다 계속 호출하도록 만들 수 있습니다.

```php
Octane::tick('simple-ticker', fn () => ray('Ticking...'))
        ->seconds(10)
        ->immediate();
```

<a name="the-octane-cache"></a>
## Octane 캐시

> [!WARNING]
> 이 기능은 [Swoole](#swoole)이 필요합니다.

Swoole을 사용할 경우, Octane 캐시 드라이버를 사용할 수 있으며, 초당 200만 건 이상의 읽기/쓰기 속도를 제공합니다. 그래서 초고속 캐싱이 필요한 애플리케이션에서는 매우 훌륭한 선택지입니다.

이 캐시 드라이버는 [Swoole 테이블](https://www.swoole.co.uk/docs/modules/swoole-table)을 기반으로 동작합니다. 캐시에 저장된 모든 데이터는 서버의 모든 워커에서 접근할 수 있습니다. 단, 서버가 재시작되면 캐시 데이터는 모두 초기화됩니다.

```php
Cache::store('octane')->put('framework', 'Laravel', 30);
```

> [!NOTE]
> Octane 캐시에 저장 가능한 최대 엔트리 수는 애플리케이션의 `octane` 설정 파일에서 지정할 수 있습니다.

<a name="cache-intervals"></a>
### 캐시 인터벌(Cache Intervals)

라라벨의 일반적인 캐시 시스템 메서드 이외에, Octane 캐시 드라이버에서는 특정 주기마다 자동 갱신되는 "interval 기반 캐시"도 제공합니다. 이 기능은 보통 서비스 프로바이더의 `boot` 메서드에서 등록합니다. 아래 예시는 5초마다 새로 갱신되는 캐시입니다.

```php
use Illuminate\Support\Str;

Cache::store('octane')->interval('random', function () {
    return Str::random(10);
}, seconds: 5);
```

<a name="tables"></a>
## 테이블(Tables)

> [!WARNING]
> 이 기능은 [Swoole](#swoole)이 필요합니다.

Swoole을 사용할 경우, 직접 원하는 형태의 [Swoole 테이블](https://www.swoole.co.uk/docs/modules/swoole-table)을 정의하고 조작할 수 있습니다. Swoole 테이블은 매우 높은 성능을 제공하며, 서버의 모든 워커들이 내부 데이터를 공유할 수 있습니다. 단, 서버가 재시작되면 테이블 내 데이터는 모두 사라집니다.

테이블은 애플리케이션의 `octane` 설정 파일의 `tables` 배열에서 정의해야 합니다. 아래는 최대 1000개의 행을 허용하는 테이블 예시입니다. 문자열 컬럼의 최대 길이는 아래와 같이 타입 뒤에 크기를 지정하여 설정할 수 있습니다.

```php
'tables' => [
    'example:1000' => [
        'name' => 'string:1000',
        'votes' => 'int',
    ],
],
```

테이블에 접근하려면 `Octane::table` 메서드를 사용합니다.

```php
use Laravel\Octane\Facades\Octane;

Octane::table('example')->set('uuid', [
    'name' => 'Nuno Maduro',
    'votes' => 1000,
]);

return Octane::table('example')->get('uuid');
```

> [!WARNING]
> Swoole 테이블이 지원하는 컬럼 타입은 `string`, `int`, `float`입니다.