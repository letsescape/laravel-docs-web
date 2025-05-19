# 라라벨 Octane (Laravel Octane)

- [소개](#introduction)
- [설치](#installation)
- [서버 요구사항](#server-prerequisites)
    - [FrankenPHP](#frankenphp)
    - [RoadRunner](#roadrunner)
    - [Swoole](#swoole)
- [애플리케이션 실행](#serving-your-application)
    - [HTTPS를 통한 애플리케이션 실행](#serving-your-application-via-https)
    - [Nginx를 통한 애플리케이션 실행](#serving-your-application-via-nginx)
    - [파일 변경 감지 및 자동 재시작](#watching-for-file-changes)
    - [워커 개수 지정하기](#specifying-the-worker-count)
    - [최대 요청 처리 개수 지정하기](#specifying-the-max-request-count)
    - [워커 재시작하기](#reloading-the-workers)
    - [서버 중지하기](#stopping-the-server)
- [의존성 주입과 Octane](#dependency-injection-and-octane)
    - [컨테이너 주입](#container-injection)
    - [Request 주입](#request-injection)
    - [설정 저장소 주입](#configuration-repository-injection)
- [메모리 누수 관리](#managing-memory-leaks)
- [동시 실행 작업](#concurrent-tasks)
- [Tick과 Interval](#ticks-and-intervals)
- [Octane 캐시](#the-octane-cache)
- [테이블(Tables)](#tables)

<a name="introduction"></a>
## 소개

[Laravel Octane](https://github.com/laravel/octane)는 [FrankenPHP](https://frankenphp.dev/), [Open Swoole](https://openswoole.com/), [Swoole](https://github.com/swoole/swoole-src), [RoadRunner](https://roadrunner.dev) 등 고성능 애플리케이션 서버를 이용해 여러분의 애플리케이션 성능을 비약적으로 높여줍니다. Octane은 애플리케이션을 한 번만 부팅한 뒤, 이를 메모리에 상주시켜 초고속으로 요청을 처리합니다.

<a name="installation"></a>
## 설치

Octane은 Composer 패키지 매니저를 통해 설치할 수 있습니다.

```shell
composer require laravel/octane
```

Octane을 설치한 후, `octane:install` Artisan 명령어를 실행하면 Octane의 설정 파일이 애플리케이션에 추가됩니다.

```shell
php artisan octane:install
```

<a name="server-prerequisites"></a>
## 서버 요구사항

> [!WARNING]
> Laravel Octane은 [PHP 8.1 이상](https://php.net/releases/)이 필요합니다.

<a name="frankenphp"></a>
### FrankenPHP

[FrankenPHP](https://frankenphp.dev)는 Go로 작성된 PHP 애플리케이션 서버로, early hint, Brotli, Zstandard 압축 등 최신 웹 기능을 지원합니다. Octane을 설치하고 서버로 FrankenPHP를 선택하면, Octane이 FrankenPHP 바이너리를 자동으로 다운로드 및 설치합니다.

<a name="frankenphp-via-laravel-sail"></a>
#### Laravel Sail에서 FrankenPHP 사용

[Laravel Sail](/docs/sail)을 이용해 개발하려면 다음 명령어로 Octane 및 FrankenPHP를 설치하세요.

```shell
./vendor/bin/sail up

./vendor/bin/sail composer require laravel/octane
```

그 다음, `octane:install` Artisan 명령어를 활용해 FrankenPHP 바이너리를 설치합니다.

```shell
./vendor/bin/sail artisan octane:install --server=frankenphp
```

마지막으로, 애플리케이션의 `docker-compose.yml` 파일 내 `laravel.test` 서비스에 `SUPERVISOR_PHP_COMMAND` 환경 변수를 추가해야 합니다. 이 명령은 Sail이 PHP 개발 서버 대신 Octane으로 애플리케이션을 실행하도록 지정합니다.

```yaml
services:
  laravel.test:
    environment:
      SUPERVISOR_PHP_COMMAND: "/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan octane:start --server=frankenphp --host=0.0.0.0 --admin-port=2019 --port='${APP_PORT:-80}'" # [tl! add]
      XDG_CONFIG_HOME:  /var/www/html/config # [tl! add]
      XDG_DATA_HOME:  /var/www/html/data # [tl! add]
```

HTTPS, HTTP/2, HTTP/3를 사용하려면 아래와 같이 설정을 추가로 수정합니다.

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

일반적으로 FrankenPHP Sail 애플리케이션에는 `https://localhost`로 접근하는 것이 권장됩니다. `https://127.0.0.1`를 사용하려면 추가 설정이 필요하므로 [권장되지 않습니다](https://frankenphp.dev/docs/known-issues/#using-https127001-with-docker).

<a name="frankenphp-via-docker"></a>
#### Docker에서 FrankenPHP 사용

FrankenPHP의 공식 Docker 이미지를 사용하면 정적 설치에 포함되지 않은 확장도 활용할 수 있고, 더 나은 성능도 기대할 수 있습니다. 또한 공식 Docker 이미지는 FrankenPHP가 기본적으로 지원하지 않는 Windows 같은 환경에서도 동작합니다. 공식 Docker 이미지는 로컬 개발과 프로덕션 환경 모두에 적합합니다.

다음은 FrankenPHP 기반의 Laravel 애플리케이션을 컨테이너화할 때 사용할 수 있는 Dockerfile 예시입니다.

```dockerfile
FROM dunglas/frankenphp

RUN install-php-extensions \
    pcntl
    # Add other PHP extensions here...

COPY . /app

ENTRYPOINT ["php", "artisan", "octane:frankenphp"]
```

개발 중에는 다음과 같은 Docker Compose 파일로 애플리케이션을 실행할 수 있습니다.

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

`php artisan octane:start` 명령에 `--log-level` 옵션을 명시적으로 전달하면, Octane은 FrankenPHP의 기본 로거를 사용하고, 별도의 설정이 없다면 구조화된 JSON 로그가 기록됩니다.

FrankenPHP와 Docker 연동에 관한 자세한 내용은 [공식 FrankenPHP 문서](https://frankenphp.dev/docs/docker/)에서 확인할 수 있습니다.

<a name="roadrunner"></a>
### RoadRunner

[RoadRunner](https://roadrunner.dev)는 Go로 빌드된 RoadRunner 바이너리로 동작합니다. RoadRunner 기반 Octane 서버를 처음 시작하면, Octane이 RoadRunner 바이너리를 자동으로 다운로드 및 설치할지 안내해줍니다.

<a name="roadrunner-via-laravel-sail"></a>
#### Laravel Sail에서 RoadRunner 사용

[Laravel Sail](/docs/sail)을 이용해 개발할 경우, 아래 명령어로 Octane과 RoadRunner를 설치하세요.

```shell
./vendor/bin/sail up

./vendor/bin/sail composer require laravel/octane spiral/roadrunner-cli spiral/roadrunner-http
```

그 다음, Sail 셸을 실행한 뒤 `rr` 실행 파일을 이용해 최신 Linux 빌드의 RoadRunner 바이너리를 받아옵니다.

```shell
./vendor/bin/sail shell

# Sail shell 안에서...
./vendor/bin/rr get-binary
```

이제 `docker-compose.yml` 파일의 `laravel.test` 서비스 정의에 `SUPERVISOR_PHP_COMMAND` 환경 변수를 추가해주세요. Sail이 PHP 개발 서버 대신 Octane으로 애플리케이션을 실행하도록 설정합니다.

```yaml
services:
  laravel.test:
    environment:
      SUPERVISOR_PHP_COMMAND: "/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan octane:start --server=roadrunner --host=0.0.0.0 --rpc-port=6001 --port='${APP_PORT:-80}'" # [tl! add]
```

마지막으로, `rr` 바이너리에 실행 권한을 부여한 후 Sail 이미지를 빌드합니다.

```shell
chmod +x ./rr

./vendor/bin/sail build --no-cache
```

<a name="swoole"></a>
### Swoole

라라벨 Octane 애플리케이션을 Swoole 애플리케이션 서버로 실행하려면, Swoole PHP 확장(extention)을 필수로 설치해야 합니다. 일반적으로 PECL을 사용해 설치할 수 있습니다.

```shell
pecl install swoole
```

<a name="openswoole"></a>
#### Open Swoole

Open Swoole 애플리케이션 서버를 사용하려면, Open Swoole PHP 확장을 설치해야 합니다. 역시 PECL을 통해 설치할 수 있습니다.

```shell
pecl install openswoole
```

Laravel Octane을 Open Swoole과 함께 사용할 때도 Swoole과 동일하게, 동시 실행 작업, tick, interval 등 다양한 기능을 그대로 활용할 수 있습니다.

<a name="swoole-via-laravel-sail"></a>
#### Laravel Sail에서 Swoole 사용

> [!WARNING]
> Sail을 이용해 Octane 애플리케이션을 실행하기 전에, Laravel Sail의 최신 버전 사용을 확인하고 애플리케이션 루트에서 `./vendor/bin/sail build --no-cache`를 실행해야 합니다.

또는, [Laravel Sail](/docs/sail) 공식 Docker 기반 개발 환경을 이용해 Swoole 기반 Octane 애플리케이션을 개발할 수 있습니다. Laravel Sail에는 기본적으로 Swoole 확장이 포함되어 있습니다. 단, Sail에서 사용하는 `docker-compose.yml` 파일을 직접 수정해야 합니다.

먼저, `docker-compose.yml` 파일의 `laravel.test` 서비스 정의에 `SUPERVISOR_PHP_COMMAND` 환경 변수를 추가합니다. 이 변수를 통해 Sail이 Octane을 이용해 애플리케이션을 실행하도록 지정합니다.

```yaml
services:
  laravel.test:
    environment:
      SUPERVISOR_PHP_COMMAND: "/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan octane:start --server=swoole --host=0.0.0.0 --port='${APP_PORT:-80}'" # [tl! add]
```

마지막으로 Sail 이미지를 빌드합니다.

```shell
./vendor/bin/sail build --no-cache
```

<a name="swoole-configuration"></a>
#### Swoole 설정

Swoole은 일부 추가 설정을 `octane` 설정 파일에 직접 추가할 수 있습니다. 이러한 옵션들은 변경이 거의 필요하지 않아, 기본 설정 파일에는 포함되어 있지 않습니다.

```php
'swoole' => [
    'options' => [
        'log_file' => storage_path('logs/swoole_http.log'),
        'package_max_length' => 10 * 1024 * 1024,
    ],
],
```

<a name="serving-your-application"></a>
## 애플리케이션 실행

Octane 서버는 `octane:start` Artisan 명령어로 시작할 수 있습니다. 기본적으로 이 명령은 애플리케이션의 `octane` 설정 파일의 `server` 옵션에 지정된 서버를 이용합니다.

```shell
php artisan octane:start
```

기본적으로 Octane 서버는 8000번 포트에서 시작되므로, 웹 브라우저에서 `http://localhost:8000`으로 애플리케이션에 접근할 수 있습니다.

<a name="serving-your-application-via-https"></a>
### HTTPS를 통한 애플리케이션 실행

기본적으로 Octane으로 실행되는 애플리케이션은 `http://`로 시작하는 링크를 생성합니다. HTTPS로 애플리케이션을 구동할 때는, `config/octane.php` 설정 파일에서 사용하는 `OCTANE_HTTPS` 환경 변수를 `true`로 설정해야 합니다. 이 값을 `true`로 지정하면 Octane이 라라벨에 모든 링크를 `https://`로 생성하도록 지시합니다.

```php
'https' => env('OCTANE_HTTPS', false),
```

<a name="serving-your-application-via-nginx"></a>
### Nginx를 통한 애플리케이션 실행

> [!NOTE]
> 직접 서버 설정을 관리할 준비가 안 되었거나 다양한 서비스를 구성하는데 익숙하지 않다면, [Laravel Cloud](https://cloud.laravel.com)의 완전 관리형 Octane 지원을 고려해볼 수 있습니다.

프로덕션 환경에서는 Octane 애플리케이션을 Nginx나 Apache와 같은 기존의 웹 서버 뒤에서 실행하는 것이 권장됩니다. 이렇게 하면 웹 서버가 이미지, 스타일시트와 같은 정적 파일을 직접 제공하고 SSL 인증서 처리도 맡을 수 있습니다.

아래 예시처럼 Nginx 설정에서는 정적 자산을 직접 제공하고, 나머지 요청을 8000 포트에서 실행 중인 Octane 서버로 프록시 처리합니다.

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

Octane 서버가 시작되면 애플리케이션이 한 번만 메모리에 로딩됩니다. 따라서 이후 애플리케이션의 파일을 수정해도, 브라우저를 새로고침할 때 바로 반영되지 않습니다. 예를 들어, `routes/web.php`에 라우트를 추가해도 서버를 재시작해야 적용됩니다. 이를 자동화하려면, `--watch` 플래그를 사용해 애플리케이션 내 파일이 변경될 때마다 Octane 서버가 자동으로 재시작되도록 설정할 수 있습니다.

```shell
php artisan octane:start --watch
```

이 기능을 이용하기 전에 [Node](https://nodejs.org)가 로컬 개발 환경에 설치되어 있는지 확인해야 합니다. 또한 프로젝트에 [Chokidar](https://github.com/paulmillr/chokidar) 파일 감지 라이브러리도 설치해야 합니다.

```shell
npm install --save-dev chokidar
```

감지할 파일과 디렉터리는 애플리케이션의 `config/octane.php` 설정 파일의 `watch` 옵션에서 지정할 수 있습니다.

<a name="specifying-the-worker-count"></a>
### 워커 개수 지정하기

기본적으로 Octane은 머신에 할당된 CPU 코어 수만큼 요청 워커를 실행합니다. 이 워커들이 들어오는 모든 HTTP 요청을 처리하게 됩니다. 워커 개수를 지정하고 싶다면 `octane:start` 명령 실행 시 `--workers` 옵션을 사용할 수 있습니다.

```shell
php artisan octane:start --workers=4
```

Swoole 애플리케이션 서버를 사용하는 경우, ["태스크 워커"]( #concurrent-tasks ) 개수도 지정할 수 있습니다.

```shell
php artisan octane:start --workers=4 --task-workers=6
```

<a name="specifying-the-max-request-count"></a>
### 최대 요청 처리 개수 지정하기

Memory leak(메모리 누수)을 방지하기 위해 Octane은 기본적으로 워커가 500개의 요청을 처리하면 자동으로 워커를 재시작합니다. 이 숫자는 `--max-requests` 옵션으로 조정할 수 있습니다.

```shell
php artisan octane:start --max-requests=250
```

<a name="reloading-the-workers"></a>
### 워커 재시작하기

배포 후와 같은 상황에서, Octane 서버의 애플리케이션 워커들을 부드럽게 재시작하려면 `octane:reload` 명령어를 사용하세요. 이렇게 하면 새 코드가 메모리에 로딩되어 이후의 요청부터 적용됩니다.

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

Octane은 애플리케이션을 한 번만 부팅한 후 요청을 처리하며, 그 상태를 메모리에 유지합니다. 따라서 애플리케이션을 개발할 때 고려해야 할 몇 가지 주의사항이 있습니다. 예를 들어, 서비스 프로바이더의 `register`와 `boot` 메서드는 워커가 처음 부팅될 때 한 번만 실행됩니다. 이후의 모든 요청에서는 같은 애플리케이션 인스턴스가 재사용됩니다.

이러한 특성 때문에, 애플리케이션 서비스 컨테이너나 요청(Request)을 어떤 객체의 생성자에 직접 주입하면 문제가 발생할 수 있습니다. 그렇게 하면 해당 객체가 이후 요청에서도 오래된(기존) 컨테이너나 요청 인스턴스를 계속 참조할 수 있기 때문입니다.

Octane은 기본적으로 프레임워크 내부 상태는 각 요청마다 자동으로 리셋하지만, 애플리케이션에서 전역 상태를 만든 경우에는 이를 자동으로 감지해서 복원할 수 없습니다. 아래에서 Octane 사용 시 문제가 될 수 있는 주요 상황들을 살펴보겠습니다.

<a name="container-injection"></a>
### 컨테이너 주입

일반적으로, 애플리케이션 서비스 컨테이너나 HTTP 요청 인스턴스를 다른 객체의 생성자에서 주입하는 것은 피해야 합니다. 예를 들어, 아래는 전체 애플리케이션 서비스 컨테이너를 싱글턴 객체에 주입한 코드입니다.

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

이 경우, `Service` 인스턴스가 애플리케이션 부트 과정에서 해결(resolved)된다면, 컨테이너가 서비스에 주입되어 이후 모든 요청에서도 같은 컨테이너 인스턴스가 유지됩니다. 이 방식이 항상 문제를 일으키지 않더라도, 부팅 사이클의 이후나 다음 요청에서 컨테이너에 바인딩된 객체를 찾지 못하는 등, 예기치 않은 상황이 발생할 수 있습니다.

이러한 상황을 방지하기 위해 싱글턴 등록을 피하거나, 현재 컨테이너 인스턴스를 항상 가져오는 클로저(익명 함수)를 서비스에 주입하는 방식을 사용할 수 있습니다.

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

전역 `app` 헬퍼와 `Container::getInstance()` 메서드는 항상 최신의 애플리케이션 컨테이너 인스턴스를 반환하므로, 안전하게 사용할 수 있습니다.

<a name="request-injection"></a>
### Request 주입

역시, 애플리케이션 서비스 컨테이너나 HTTP 요청 인스턴스를 다른 객체의 생성자에 주입하는 것은 피해야 합니다. 다음은 전체 HTTP 요청 인스턴스를 싱글턴 객체에 주입한 예시입니다.

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

이 예시에서, `Service` 인스턴스가 애플리케이션 부트 과정에서 생성된다면, HTTP 요청 인스턴스가 서비스에 주입되어 이후 요청들에서도 같은 요청 데이터를 계속 참조하게 됩니다. 따라서 모든 헤더, 입력값, 쿼리스트링 등 요청 데이터가 잘못될 수 있습니다.

이를 해결하기 위해서는 싱글턴 등록을 피하거나, 항상 최신 요청 인스턴스를 가져오는 클로저를 서비스에 주입해야 합니다. 또는, 가장 권장되는 방법은 객체가 실제로 필요한 정보만을 메서드 호출 시 전달하는 것입니다.

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

전역 `request` 헬퍼는 항상 현재 애플리케이션이 처리하는 요청 인스턴스를 반환하므로, 안전하게 사용할 수 있습니다.

> [!WARNING]
> 컨트롤러 메서드나 라우트 클로저에서 `Illuminate\Http\Request` 인스턴스를 타입힌트로 지정하는 것은 문제없습니다.

<a name="configuration-repository-injection"></a>
### 설정 저장소 주입

마찬가지로, 설정 저장소 인스턴스를 다른 객체의 생성자에 주입하는 것도 피하는 것이 좋습니다. 아래는 설정 저장소를 싱글턴 객체에 주입하는 예시입니다.

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

이 경우, 요청 중간에 설정값이 변경될 경우에도 오리지널 저장소 인스턴스를 계속 참조하기 때문에 최신 값을 사용할 수 없습니다.

이런 상황에서는 싱글턴 등록을 피하거나, 항상 최신 설정 저장소를 반환하는 클로저를 주입해서 해결할 수 있습니다.

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

전역 `config` 헬퍼는 항상 최신 설정 저장소 인스턴스를 반환하므로, 애플리케이션에서 안전하게 사용할 수 있습니다.

<a name="managing-memory-leaks"></a>
### 메모리 누수 관리

Octane은 애플리케이션을 요청마다 메모리에 보관하므로, static 변수에 데이터를 계속 추가하면 메모리 누수가 발생할 수 있습니다. 아래 컨트롤러 예시는 요청이 들어올 때마다 static `$data` 배열에 값이 쌓이며, 이로 인해 메모리 누수가 발생합니다.

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

애플리케이션을 개발할 때 이런 유형의 메모리 누수를 발생시키지 않도록 특별히 주의가 필요합니다. 로컬 개발 환경에서 반드시 메모리 사용량을 모니터링하여, 새로운 메모리 누수가 유입되지 않도록 체크하는 것을 권장합니다.

<a name="concurrent-tasks"></a>
## 동시 실행 작업

> [!WARNING]
> 이 기능은 [Swoole](#swoole)이 필요합니다.

Swoole을 활용하면, 경량화된 백그라운드 태스크(Task)를 통한 동시 작업 처리가 가능합니다. Octane에서 제공하는 `concurrently` 메서드를 이용하면 이를 쉽게 구현할 수 있습니다. PHP의 배열 구조분해를 결합하여, 각 작업의 결과도 손쉽게 받아올 수 있습니다.

```php
use App\Models\User;
use App\Models\Server;
use Laravel\Octane\Facades\Octane;

[$users, $servers] = Octane::concurrently([
    fn () => User::all(),
    fn () => Server::all(),
]);
```

Octane에서 처리되는 동시 작업은 Swoole의 "태스크 워커"를 이용하며, 요청과는 완전히 분리된 별도 프로세스에서 실행됩니다. 동시 작업 처리에 사용되는 워커 개수는 `octane:start` 명령 실행 시 `--task-workers` 옵션으로 지정합니다.

```shell
php artisan octane:start --workers=4 --task-workers=6
```

`concurrently` 메서드에 넘기는 태스크 개수는 Swoole의 태스크 시스템 제약으로 인해 1024개를 초과하지 않는 것이 좋습니다.

<a name="ticks-and-intervals"></a>
## Tick과 Interval

> [!WARNING]
> 이 기능은 [Swoole](#swoole)이 필요합니다.

Swoole을 사용할 때, 지정한 초(간격)마다 주기적으로 실행되는 "tick" 작업을 등록할 수 있습니다. `tick` 메서드를 통해 이러한 콜백을 추가할 수 있으며, 첫 번째 인자는 ticker의 이름을 나타내는 문자열, 두 번째 인자는 지정한 간격에 실행될 콜러블(callable)이어야 합니다.

아래 예시에서는 10초마다 실행되는 클로저를 등록합니다. 일반적으로는 애플리케이션의 서비스 프로바이더 `boot` 메서드에서 `tick` 메서드를 호출합니다.

```php
Octane::tick('simple-ticker', fn () => ray('Ticking...'))
    ->seconds(10);
```

`immediate` 메서드를 사용하면, Octane 서버가 처음 부팅될 때 즉시 tick 콜백을 실행하고, 그 이후에는 지정한 간격마다 실행합니다.

```php
Octane::tick('simple-ticker', fn () => ray('Ticking...'))
    ->seconds(10)
    ->immediate();
```

<a name="the-octane-cache"></a>
## Octane 캐시

> [!WARNING]
> 이 기능은 [Swoole](#swoole)이 필요합니다.

Swoole을 사용하는 경우, Octane 캐시 드라이버를 활용하여 초당 최대 2백만 번에 달하는 읽기/쓰기 속도를 낼 수 있습니다. 즉, 극단적으로 빠른 캐시 레이어가 필요한 애플리케이션에서 매우 유용합니다.

이 캐시 드라이버는 [Swoole 테이블](https://www.swoole.co.uk/docs/modules/swoole-table)에 의해 동작합니다. 서버 내 모든 워커에서 저장된 데이터를 공유할 수 있습니다. 단, 서버가 재시작되면 캐시된 데이터는 모두 초기화됩니다.

```php
Cache::store('octane')->put('framework', 'Laravel', 30);
```

> [!NOTE]
> Octane 캐시에 허용되는 최대 엔트리 수는 애플리케이션의 `octane` 설정 파일에서 지정할 수 있습니다.

<a name="cache-intervals"></a>
### 캐시 Interval

라라벨의 표준 캐시 기능 외에도, Octane 캐시 드라이버는 interval(주기) 기반 캐시 기능을 제공합니다. 이 캐시는 지정한 주기마다 자동으로 갱신되며, 일반적으로 서비스 프로바이더의 `boot` 메서드에서 등록합니다. 예를 들어, 아래 캐시는 5초마다 새로고침됩니다.

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

Swoole을 사용하는 경우, 직접 원하는 [Swoole 테이블](https://www.swoole.co.uk/docs/modules/swoole-table)을 자유롭게 정의하고 사용할 수 있습니다. Swoole 테이블은 매우 높은 처리량을 보장하며, 서버 내 모든 워커가 테이블 내 데이터를 공유할 수 있습니다. 단, 서버 재시작 시 테이블 데이터는 모두 사라집니다.

테이블은 애플리케이션의 `octane` 설정 파일의 `tables` 배열에서 정의합니다. 예시 테이블은 최대 1000개의 행을 허용하며, 문자열 컬럼의 최대 크기도 아래와 같이 지정할 수 있습니다.

```php
'tables' => [
    'example:1000' => [
        'name' => 'string:1000',
        'votes' => 'int',
    ],
],
```

테이블에 접근할 때는 `Octane::table` 메서드를 사용합니다.

```php
use Laravel\Octane\Facades\Octane;

Octane::table('example')->set('uuid', [
    'name' => 'Nuno Maduro',
    'votes' => 1000,
]);

return Octane::table('example')->get('uuid');
```

> [!WARNING]
> Swoole 테이블에서 지원하는 컬럼 타입은 `string`, `int`, `float`입니다.
