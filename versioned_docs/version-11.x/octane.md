# 라라벨 옥테인 (Laravel Octane)

- [소개](#introduction)
- [설치](#installation)
- [서버 사전 준비 사항](#server-prerequisites)
    - [FrankenPHP](#frankenphp)
    - [RoadRunner](#roadrunner)
    - [Swoole](#swoole)
- [애플리케이션 서비스 실행](#serving-your-application)
    - [HTTPS로 애플리케이션 서비스하기](#serving-your-application-via-https)
    - [Nginx로 애플리케이션 서비스하기](#serving-your-application-via-nginx)
    - [파일 변경 사항 감지하기](#watching-for-file-changes)
    - [워커 수 지정하기](#specifying-the-worker-count)
    - [최대 요청 수 지정하기](#specifying-the-max-request-count)
    - [워커 재시작하기](#reloading-the-workers)
    - [서버 중지하기](#stopping-the-server)
- [의존성 주입과 Octane](#dependency-injection-and-octane)
    - [컨테이너 주입](#container-injection)
    - [리퀘스트 주입](#request-injection)
    - [설정 리포지토리 주입](#configuration-repository-injection)
- [메모리 누수 관리](#managing-memory-leaks)
- [동시 작업](#concurrent-tasks)
- [틱(Tick) 및 인터벌(Interval) 활용](#ticks-and-intervals)
- [Octane 캐시](#the-octane-cache)
- [테이블](#tables)

<a name="introduction"></a>
## 소개

[Laravel Octane](https://github.com/laravel/octane)은 [FrankenPHP](https://frankenphp.dev/), [Open Swoole](https://openswoole.com/), [Swoole](https://github.com/swoole/swoole-src), [RoadRunner](https://roadrunner.dev)와 같은 고성능 애플리케이션 서버를 활용하여 여러분의 애플리케이션 성능을 극대화합니다. Octane은 애플리케이션을 단 한 번 부팅한 뒤 메모리에 유지하고, 이후 번개처럼 빠른 속도로 요청을 처리합니다.

<a name="installation"></a>
## 설치

Octane은 Composer 패키지 매니저를 통해 설치할 수 있습니다.

```shell
composer require laravel/octane
```

Octane 설치 후, `octane:install` Artisan 명령어를 실행하면 Octane의 설정 파일이 애플리케이션에 추가됩니다.

```shell
php artisan octane:install
```

<a name="server-prerequisites"></a>
## 서버 사전 준비 사항

> [!WARNING]  
> Laravel Octane은 [PHP 8.1 이상](https://php.net/releases/)이 필요합니다.

<a name="frankenphp"></a>
### FrankenPHP

[FrankenPHP](https://frankenphp.dev)는 Go로 작성된 PHP 애플리케이션 서버로, early hints, Brotli, Zstandard 압축 등 최신 웹 기능을 지원합니다. Octane을 설치하고 서버로 FrankenPHP를 선택하면 Octane이 FrankenPHP 실행 파일을 자동으로 다운로드 및 설치해 줍니다.

<a name="frankenphp-via-laravel-sail"></a>
#### Laravel Sail을 사용한 FrankenPHP

[Laravel Sail](/docs/11.x/sail) 환경에서 개발할 예정이라면 다음과 같은 명령어로 Octane과 FrankenPHP를 설치해야 합니다.

```shell
./vendor/bin/sail up

./vendor/bin/sail composer require laravel/octane
```

그 다음, `octane:install` Artisan 명령어를 사용해 FrankenPHP 실행 파일을 설치합니다.

```shell
./vendor/bin/sail artisan octane:install --server=frankenphp
```

마지막으로, 애플리케이션의 `docker-compose.yml` 파일 내 `laravel.test` 서비스에 `SUPERVISOR_PHP_COMMAND` 환경 변수를 추가해야 합니다. 이 환경 변수는 Sail에서 Octane을 사용해 애플리케이션을 서비스하기 위해 실행할 명령어를 지정합니다(기본 PHP 개발 서버 대신 Octane을 사용).

```yaml
services:
  laravel.test:
    environment:
      SUPERVISOR_PHP_COMMAND: "/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan octane:start --server=frankenphp --host=0.0.0.0 --admin-port=2019 --port='${APP_PORT:-80}'" # [tl! add]
      XDG_CONFIG_HOME:  /var/www/html/config # [tl! add]
      XDG_DATA_HOME:  /var/www/html/data # [tl! add]
```

HTTPS, HTTP/2, HTTP/3 지원을 활성화하려면 다음과 같이 추가 설정을 적용합니다.

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

일반적으로 FrankenPHP Sail 애플리케이션에는 `https://localhost`를 통해 접근해야 하며, `https://127.0.0.1` 사용은 추가 구성이 필요하므로 [권장되지 않습니다](https://frankenphp.dev/docs/known-issues/#using-https127001-with-docker).

<a name="frankenphp-via-docker"></a>
#### Docker를 사용한 FrankenPHP

공식 FrankenPHP Docker 이미지를 사용하면 성능이 향상되고, 정적 설치에는 없는 추가 확장 기능도 사용할 수 있습니다. 또한, 공식 Docker 이미지는 FrankenPHP가 네이티브로 지원하지 않는 플랫폼(예: Windows)에서도 구동이 가능합니다. 공식 Docker 이미지는 로컬 개발과 운영 환경 모두에 적합합니다.

아래 예제 Dockerfile을 활용해 FrankenPHP 기반의 라라벨 애플리케이션을 컨테이너화할 수 있습니다.

```dockerfile
FROM dunglas/frankenphp

RUN install-php-extensions \
    pcntl
    # Add other PHP extensions here...

COPY . /app

ENTRYPOINT ["php", "artisan", "octane:frankenphp"]
```

개발 시에는 다음과 같은 Docker Compose 파일로 애플리케이션을 실행할 수 있습니다.

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

`php artisan octane:start` 명령에 `--log-level` 옵션을 명시적으로 지정하면 Octane은 FrankenPHP 고유의 로거를 사용하며, 별도의 설정이 없으면 구조화된 JSON 로그가 생성됩니다.

Docker에서 FrankenPHP를 실행하는 자세한 방법은 [공식 FrankenPHP 문서](https://frankenphp.dev/docs/docker/)를 참고하세요.

<a name="roadrunner"></a>
### RoadRunner

[RoadRunner](https://roadrunner.dev)는 Go로 구현된 RoadRunner 실행 파일을 사용합니다. RoadRunner 기반 Octane 서버를 처음 시작하면 Octane이 RoadRunner 실행 파일을 다운로드 및 설치해 줄 것인지 확인합니다.

<a name="roadrunner-via-laravel-sail"></a>
#### Laravel Sail을 사용한 RoadRunner

[Laravel Sail](/docs/11.x/sail) 환경에서 개발할 예정이라면 다음 명령어로 Octane과 RoadRunner를 설치합니다.

```shell
./vendor/bin/sail up

./vendor/bin/sail composer require laravel/octane spiral/roadrunner-cli spiral/roadrunner-http
```

그 다음 Sail 셸에 접속하여 최신 리눅스용 RoadRunner 실행 파일을 받아야 합니다.

```shell
./vendor/bin/sail shell

# Sail 셸 내에서...
./vendor/bin/rr get-binary
```

그리고 `docker-compose.yml` 내 `laravel.test` 서비스 정의에 `SUPERVISOR_PHP_COMMAND` 환경 변수를 추가합니다. 이 환경 변수는 Octane을 사용하여 애플리케이션을 서비스할 때 사용됩니다.

```yaml
services:
  laravel.test:
    environment:
      SUPERVISOR_PHP_COMMAND: "/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan octane:start --server=roadrunner --host=0.0.0.0 --rpc-port=6001 --port='${APP_PORT:-80}'" # [tl! add]
```

마지막으로, `rr` 바이너리의 실행 권한을 부여하고 Sail 이미지를 빌드합니다.

```shell
chmod +x ./rr

./vendor/bin/sail build --no-cache
```

<a name="swoole"></a>
### Swoole

Swoole 애플리케이션 서버를 이용해 라라벨 Octane 애플리케이션을 서비스하려면 Swoole PHP 확장 모듈을 설치해야 합니다. 일반적으로 PECL을 통해 설치할 수 있습니다.

```shell
pecl install swoole
```

<a name="openswoole"></a>
#### Open Swoole

Open Swoole 애플리케이션 서버를 사용하려면 Open Swoole PHP 확장 모듈을 설치해야 합니다. PECL을 통해 설치할 수 있습니다.

```shell
pecl install openswoole
```

Laravel Octane을 Open Swoole과 함께 사용하면 Swoole과 동일한 동시 작업, 틱(tick), 인터벌(interval) 등의 기능을 모두 누릴 수 있습니다.

<a name="swoole-via-laravel-sail"></a>
#### Laravel Sail을 사용한 Swoole

> [!WARNING]  
> Sail로 Octane 애플리케이션을 서비스하기 전에 Laravel Sail의 최신 버전을 사용하고 있는지 확인하고, 애플리케이션 루트 디렉토리에서 `./vendor/bin/sail build --no-cache` 명령을 실행하세요.

또는, [Laravel Sail](/docs/11.x/sail)을 사용해 Docker 기반 공식 개발 환경에서 Swoole 기반 Octane 애플리케이션을 개발할 수 있습니다. Laravel Sail은 Swoole 확장을 기본적으로 포함하고 있지만, `docker-compose.yml` 파일을 추가로 조정해야 합니다.

먼저, `docker-compose.yml` 파일에서 `laravel.test` 서비스의 환경 변수에 `SUPERVISOR_PHP_COMMAND`를 추가하세요. 이 변수는 Octane을 사용해 애플리케이션을 서비스할 때 실행할 명령어입니다.

```yaml
services:
  laravel.test:
    environment:
      SUPERVISOR_PHP_COMMAND: "/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan octane:start --server=swoole --host=0.0.0.0 --port='${APP_PORT:-80}'" # [tl! add]
```

마지막으로, Sail 이미지를 빌드합니다.

```shell
./vendor/bin/sail build --no-cache
```

<a name="swoole-configuration"></a>
#### Swoole 설정

필요하다면, `octane` 설정 파일에 몇 가지 Swoole 추가 옵션을 지정할 수 있습니다. 대부분의 경우 수정할 일이 드물기 때문에 기본값에는 포함되어 있지 않습니다.

```php
'swoole' => [
    'options' => [
        'log_file' => storage_path('logs/swoole_http.log'),
        'package_max_length' => 10 * 1024 * 1024,
    ],
],
```

<a name="serving-your-application"></a>
## 애플리케이션 서비스 실행

Octane 서버는 `octane:start` Artisan 명령어로 시작할 수 있습니다. 기본적으로 이 명령어는 애플리케이션의 `octane` 설정 파일에 있는 `server` 옵션에 설정된 서버를 사용합니다.

```shell
php artisan octane:start
```

기본적으로 Octane은 8000번 포트에서 서버를 시작하므로, 웹 브라우저에서 `http://localhost:8000`으로 애플리케이션에 접근할 수 있습니다.

<a name="serving-your-application-via-https"></a>
### HTTPS로 애플리케이션 서비스하기

기본적으로 Octane을 통해 실행되는 애플리케이션은 `http://`로 시작하는 링크를 생성합니다. 만약 HTTPS로 서비스를 제공한다면, 애플리케이션의 `config/octane.php` 설정 파일에서 `OCTANE_HTTPS` 환경 변수를 `true`로 지정해야 합니다. 이 값을 `true`로 설정하면 Octane이 라라벨에게 모든 링크를 `https://`로 시작하도록 안내합니다.

```php
'https' => env('OCTANE_HTTPS', false),
```

<a name="serving-your-application-via-nginx"></a>
### Nginx로 애플리케이션 서비스하기

> [!NOTE]  
> 직접 서버 설정을 관리하거나 다양한 서비스 설정에 익숙하지 않다면, [Laravel Forge](https://forge.laravel.com) 활용을 고려해보세요.

운영 환경에서는 Octane 애플리케이션을 Nginx나 Apache와 같은 전통적인 웹 서버 뒤에서 서비스해야 합니다. 이렇게 하면 웹 서버가 정적 자산(이미지, 스타일시트 등)을 직접 제공하고, SSL 인증서 종료도 처리할 수 있습니다.

아래 Nginx 설정 예시에서는 정적 자산은 Nginx가 제공하고, 나머지 모든 요청은 8000번 포트에서 실행 중인 Octane 서버로 프록시하게 됩니다.

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
### 파일 변경 사항 감지하기

Octane 서버는 시작 시 애플리케이션을 메모리에 올려둡니다. 따라서, 파일을 수정해도 바로 반영되지 않으며, 예를 들어 `routes/web.php`에서 라우트를 추가해도 서버를 재시작하기 전까지는 브라우저에서 볼 수 없습니다. 이를 편리하게 처리하기 위해 `--watch` 플래그를 사용하면, 애플리케이션 파일에 변경이 감지될 때마다 자동으로 서버가 재시작됩니다.

```shell
php artisan octane:start --watch
```

이 기능을 사용하려면, 먼저 로컬 개발 환경에 [Node](https://nodejs.org)가 설치되어 있어야 합니다. 또한 프로젝트에 [Chokidar](https://github.com/paulmillr/chokidar) 파일 감시 라이브러리를 설치해야 합니다.

```shell
npm install --save-dev chokidar
```

어떤 디렉터리와 파일을 감시할지 설정하려면, 애플리케이션의 `config/octane.php` 파일의 `watch` 설정 옵션을 조정하면 됩니다.

<a name="specifying-the-worker-count"></a>
### 워커 수 지정하기

기본적으로 Octane은 시스템의 각 CPU 코어당 하나의 애플리케이션 요청 워커를 시작합니다. 이 워커들이 들어오는 HTTP 요청을 처리하게 됩니다. 그러나, `octane:start` 명령어에 `--workers` 옵션을 추가하여 워커 수를 직접 지정할 수도 있습니다.

```shell
php artisan octane:start --workers=4
```

Swoole 애플리케이션 서버를 사용하는 경우, ["작업 워커(task workers)"](#concurrent-tasks)의 수 또한 지정할 수 있습니다.

```shell
php artisan octane:start --workers=4 --task-workers=6
```

<a name="specifying-the-max-request-count"></a>
### 최대 요청 수 지정하기

의도치 않은 메모리 누수를 예방하기 위해, Octane은 각 워커가 500건의 요청을 처리하면 자동으로 재시작합니다. 이 숫자는 `--max-requests` 옵션을 사용해 조정할 수 있습니다.

```shell
php artisan octane:start --max-requests=250
```

<a name="reloading-the-workers"></a>
### 워커 재시작하기

`octane:reload` 명령어로 Octane 서버의 애플리케이션 워커를 부드럽게 재시작할 수 있습니다. 일반적으로, 배포 후에 새로 배포된 코드가 메모리에 반영되도록 수행합니다.

```shell
php artisan octane:reload
```

<a name="stopping-the-server"></a>
### 서버 중지하기

`octane:stop` Artisan 명령어로 Octane 서버를 중지할 수 있습니다.

```shell
php artisan octane:stop
```

<a name="checking-the-server-status"></a>
#### 서버 상태 확인하기

`octane:status` Artisan 명령어로 현재 Octane 서버의 상태를 확인할 수 있습니다.

```shell
php artisan octane:status
```

<a name="dependency-injection-and-octane"></a>
## 의존성 주입과 Octane

Octane은 애플리케이션을 한 번만 부팅해서 메모리에 올리고, 요청을 처리할 때마다 같은 애플리케이션 인스턴스를 계속 재사용합니다. 이로 인해 애플리케이션을 개발할 때 유의해야 할 사항이 있습니다. 예를 들어, 서비스 프로바이더의 `register`나 `boot` 메서드는 워커가 처음 부팅될 때 단 한 번만 실행됩니다. 이후 요청에서는 항상 같은 애플리케이션 인스턴스가 사용됩니다.

이로 인해, 애플리케이션 서비스 컨테이너나 요청(Request) 객체 등을 클래스의 생성자에 주입하면 이후 요청에서 오래된 컨테이너나 요청 인스턴스를 참조하게 되므로 주의가 필요합니다.

라라벨 프레임워크의 기본 상태는 Octane이 자동으로 요청마다 초기화해줍니다. 하지만 애플리케이션이 전역 상태를 직접 관리하는 경우에는 Octane이 이를 알 수 없으므로 주의해서 개발해야 합니다. 아래에서는 Octane 사용 시 문제가 될 수 있는 대표적인 상황을 안내합니다.

<a name="container-injection"></a>
### 컨테이너 주입

일반적으로, 애플리케이션 서비스 컨테이너나 HTTP 요청 인스턴스를 다른 객체의 생성자에 직접 주입하는 것은 피하는 것이 좋습니다. 예를 들어, 다음 바인딩은 서비스 전체에 애플리케이션 컨테이너를 싱글톤 형태로 주입하고 있습니다.

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

이 예제에서 만약 `Service` 인스턴스가 애플리케이션 부트 과정에서 생성된다면, 그 시점의 컨테이너 인스턴스가 서비스에 주입되고 이후 요청에서도 계속 그 컨테이너를 사용하게 됩니다. 이는 실제로 문제가 되지 않을 수도 있지만, 이후 부트 단계나 다음 요청에서 컨테이너에 새로운 바인딩이 추가돼도 이 서비스에서는 이를 인식하지 못하는 문제가 생길 수 있습니다.

이를 해결하려면, 싱글톤 대신 일반 바인딩을 사용하거나, 컨테이너를 항상 최신 인스턴스로 반환하는 클로저를 서비스에 주입하는 방식으로 개선할 수 있습니다.

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

`app` 헬퍼 함수와 `Container::getInstance()` 메서드는 항상 최신 애플리케이션 컨테이너 인스턴스를 반환합니다.

<a name="request-injection"></a>
### 리퀘스트 주입

애플리케이션 서비스 컨테이너나 HTTP 요청 인스턴스를 다른 객체의 생성자에 직접 주입하는 것도 역시 지양해야 합니다. 예를 들어, 다음 바인딩은 싱글톤 객체에 전체 요청 인스턴스를 주입하고 있습니다.

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

이 예제에서 `Service` 인스턴스가 부트 과정에서 생성되면, 그 시점의 HTTP 요청이 서비스에 주입되고 이후 요청에서도 같은 요청 인스턴스를 사용하게 됩니다. 결과적으로 헤더, 입력값, 쿼리스트링 등 모든 요청 데이터가 올바르지 않게 됩니다.

이 문제를 피하려면, 싱글톤 대신 일반 바인딩을 사용하거나, 항상 최신 요청 인스턴스를 반환하는 클로저를 주입하는 방식, 혹은 가장 추천되는 방법으로 필요한 요청 데이터를 런타임에 객체의 메서드에 직접 전달하는 방식이 있습니다.

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

전역 `request` 헬퍼는 항상 현재 처리 중인 요청 인스턴스를 반환하므로 안전하게 사용할 수 있습니다.

> [!WARNING]  
> 컨트롤러 메서드나 라우트 클로저에서 `Illuminate\Http\Request` 타입힌트는 사용해도 괜찮습니다.

<a name="configuration-repository-injection"></a>
### 설정 리포지토리 주입

설정(Configuration) 리포지토리 인스턴스를 다른 객체의 생성자에 직접 주입하는 것도 일반적으로 피하는 것이 좋습니다. 아래 예시는 싱글톤 객체에 설정 리포지토리를 주입하고 있습니다.

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

이 경우, 요청 사이에 설정값이 변경돼도 해당 서비스에서는 항상 최초의 설정 리포지토리 인스턴스만 참조하게 되어 새로운 설정 값에 접근할 수 없습니다.

해결 방안으로는, 싱글톤 대신 일반 바인딩을 사용하거나, 항상 최신 설정 리포지토리를 반환하는 클로저를 주입할 수 있습니다.

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

전역 `config` 헬퍼는 항상 최신 설정 리포지토리를 반환하므로 애플리케이션에서 안전하게 사용할 수 있습니다.

<a name="managing-memory-leaks"></a>
### 메모리 누수 관리

Octane은 요청 사이에도 애플리케이션을 메모리에 유지하므로, 정적(static) 배열 등에 데이터를 계속 추가할 경우 메모리 누수가 발생합니다. 예를 들어, 아래 컨트롤러 코드는 요청이 들어올 때마다 정적 `$data` 배열에 데이터를 추가하므로 메모리 누수를 일으킵니다.

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

애플리케이션을 개발할 때 이런 유형의 메모리 누수를 만들지 않도록 각별히 주의해야 합니다. 개발 환경에서 애플리케이션의 메모리 사용량을 모니터링하여, 새로운 메모리 누수가 있는지 점검하는 것이 좋습니다.

<a name="concurrent-tasks"></a>
## 동시 작업

> [!WARNING]  
> 이 기능은 [Swoole](#swoole)이 필요합니다.

Swoole을 사용할 때, 경량 백그라운드 작업을 통해 여러 동작을 동시에 실행할 수 있습니다. Octane의 `concurrently` 메서드를 사용하면 이를 쉽게 구현할 수 있습니다. PHP 배열 디스트럭처링과 결합하여 각 동작의 결과를 받을 수 있습니다.

```php
use App\Models\User;
use App\Models.Server;
use Laravel\Octane\Facades\Octane;

[$users, $servers] = Octane::concurrently([
    fn () => User::all(),
    fn () => Server::all(),
]);
```

동시 작업은 Swoole의 "작업 워커(task workers)"에서 별도의 프로세스로 처리되며, 요청과는 완전히 분리되어 동작합니다. 이 작업 워커의 수는 `octane:start` 명령어에서 `--task-workers` 옵션으로 지정할 수 있습니다.

```shell
php artisan octane:start --workers=4 --task-workers=6
```

`concurrently` 메서드 사용 시에는 Swoole 태스크 시스템의 제한으로 1024개 이하의 작업만 제공해야 합니다.

<a name="ticks-and-intervals"></a>
## 틱(Tick) 및 인터벌(Interval) 활용

> [!WARNING]  
> 이 기능은 [Swoole](#swoole)이 필요합니다.

Swoole 사용 시, 특정 초마다 실행되는 "틱(tick)" 작업을 등록할 수 있습니다. `tick` 메서드를 사용해 틱 콜백을 지정하며, 첫 번째 인자는 틱의 이름(문자열), 두 번째 인자는 주기적으로 실행될 콜러블(callable)입니다.

아래 예시는 매 10초마다 실행되는 클로저를 등록합니다. 보통 틱 작업은 서비스 프로바이더의 `boot` 메서드에서 호출합니다.

```php
Octane::tick('simple-ticker', fn () => ray('Ticking...'))
    ->seconds(10);
```

`immediate` 메서드를 활용하면 Octane 서버 최초 부팅 시에도 틱 콜백이 즉시 한 번 실행되고, 이후에는 지정한 간격만큼 계속 반복됩니다.

```php
Octane::tick('simple-ticker', fn () => ray('Ticking...'))
    ->seconds(10)
    ->immediate();
```

<a name="the-octane-cache"></a>
## Octane 캐시

> [!WARNING]  
> 이 기능은 [Swoole](#swoole)이 필요합니다.

Swoole 환경에서 Octane 캐시 드라이버를 사용하면 초당 최대 2백만 번의 읽기/쓰기가 가능한 매우 빠른 캐시를 구현할 수 있습니다. 극한의 캐시 속도가 필요한 애플리케이션에는 최적의 선택입니다.

이 캐시 드라이버는 [Swoole 테이블](https://www.swoole.co.uk/docs/modules/swoole-table)을 기반으로 하며, 모든 워커에서 동일한 데이터를 공유할 수 있습니다. 다만, 서버가 재시작되면 모든 캐시 데이터는 초기화됩니다.

```php
Cache::store('octane')->put('framework', 'Laravel', 30);
```

> [!NOTE]  
> Octane 캐시에 허용되는 최대 항목 수는 애플리케이션의 `octane` 설정 파일에서 지정할 수 있습니다.

<a name="cache-intervals"></a>
### 캐시 인터벌

라라벨의 일반적인 캐시 시스템 기능 외에도 Octane 캐시는 "인터벌 기반 캐시"를 제공합니다. 이 캐시는 지정한 간격마다 자동으로 갱신되며, 서비스 프로바이더의 `boot` 메서드 내에서 등록해야 합니다. 아래 예시에서는 5초마다 캐시가 새 랜덤 문자열로 갱신됩니다.

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

Swoole 환경에서는 여러분이 직접 임의의 [Swoole 테이블](https://www.swoole.co.uk/docs/modules/swoole-table)을 정의하고 사용할 수 있습니다. Swoole 테이블은 매우 높은 처리량을 제공하며, 모든 서버 워커에서 데이터 접근이 가능합니다. 단, 서버 재시작 시 데이터는 모두 사라집니다.

테이블은 애플리케이션 `octane` 설정 파일의 `tables` 배열에서 정의하며, 최대 행(row) 수를 설정할 수 있습니다. 아래는 최대 1000개의 행과 string 컬럼 크기를 설정한 예시입니다.

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
> Swoole 테이블에서 지원하는 컬럼 타입은 `string`, `int`, `float` 세 가지입니다.
