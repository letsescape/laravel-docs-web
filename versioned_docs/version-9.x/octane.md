# 라라벨 Octane (Laravel Octane)

- [소개](#introduction)
- [설치](#installation)
- [서버 필수 조건](#server-prerequisites)
    - [RoadRunner](#roadrunner)
    - [Swoole](#swoole)
- [애플리케이션 실행](#serving-your-application)
    - [HTTPS로 애플리케이션 실행](#serving-your-application-via-https)
    - [Nginx로 애플리케이션 실행](#serving-your-application-via-nginx)
    - [파일 변경 감지하기](#watching-for-file-changes)
    - [워커 개수 지정하기](#specifying-the-worker-count)
    - [최대 요청 수 지정하기](#specifying-the-max-request-count)
    - [워커 재시작하기](#reloading-the-workers)
    - [서버 중지하기](#stopping-the-server)
- [의존성 주입 & Octane](#dependency-injection-and-octane)
    - [컨테이너 주입](#container-injection)
    - [리퀘스트 주입](#request-injection)
    - [설정 리포지토리 주입](#configuration-repository-injection)
- [메모리 누수 관리하기](#managing-memory-leaks)
- [동시 작업 처리](#concurrent-tasks)
- [틱(Tick) & 인터벌(Interval)](#ticks-and-intervals)
- [Octane 캐시](#the-octane-cache)
- [테이블(Table)](#tables)

<a name="introduction"></a>
## 소개

[Laravel Octane](https://github.com/laravel/octane)는 [Open Swoole](https://swoole.co.uk), [Swoole](https://github.com/swoole/swoole-src), [RoadRunner](https://roadrunner.dev)와 같은 고성능 애플리케이션 서버를 이용하여 애플리케이션의 성능을 극대화해 줍니다. Octane은 애플리케이션을 한 번만 부팅한 뒤 메모리에 상주시켜, 이후 초고속으로 요청을 처리합니다.

<a name="installation"></a>
## 설치

Octane은 Composer 패키지 매니저를 통해 설치할 수 있습니다.

```shell
composer require laravel/octane
```

Octane을 설치한 후에는 `octane:install` Artisan 명령을 실행하여 Octane의 설정 파일을 애플리케이션에 추가할 수 있습니다.

```shell
php artisan octane:install
```

<a name="server-prerequisites"></a>
## 서버 필수 조건

> [!WARNING]
> Laravel Octane을 사용하려면 [PHP 8.0 이상](https://php.net/releases/)이 필요합니다.

<a name="roadrunner"></a>
### RoadRunner

[RoadRunner](https://roadrunner.dev)는 Go로 작성된 RoadRunner 바이너리가 동작의 핵심입니다. RoadRunner 기반 Octane 서버를 처음 실행하면, Octane이 필요한 RoadRunner 바이너리를 자동으로 다운로드 및 설치하도록 안내합니다.

<a name="roadrunner-via-laravel-sail"></a>
#### Laravel Sail을 통한 RoadRunner 사용

[Laravel Sail](/docs/9.x/sail) 환경에서 애플리케이션을 개발하려면, 아래 명령어로 Octane과 RoadRunner를 설치할 수 있습니다.

```shell
./vendor/bin/sail up

./vendor/bin/sail composer require laravel/octane spiral/roadrunner
```

다음으로, Sail 쉘을 시작한 후 `rr` 실행 파일을 이용해 최신 리눅스용 RoadRunner 바이너리를 받아야 합니다.

```shell
./vendor/bin/sail shell

# Sail 쉘 내부에서...
./vendor/bin/rr get-binary
```

RoadRunner 바이너리가 설치되면, Sail 쉘에서 나와도 됩니다. 이제 애플리케이션을 계속 실행하려면, Sail에서 사용하는 `supervisor.conf` 파일을 조정해야 합니다. 우선 `sail:publish` Artisan 명령을 실행합니다.

```shell
./vendor/bin/sail artisan sail:publish
```

그 다음, 애플리케이션의 `docker/supervisord.conf` 파일에서 `command` 지시어를 아래와 같이 수정하여 PHP 개발 서버 대신 Octane을 사용하도록 변경합니다.

```ini
command=/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan octane:start --server=roadrunner --host=0.0.0.0 --rpc-port=6001 --port=80
```

마지막으로, `rr` 바이너리의 실행 권한을 부여하고, Sail 이미지를 빌드합니다.

```shell
chmod +x ./rr

./vendor/bin/sail build --no-cache
```

<a name="swoole"></a>
### Swoole

Laravel Octane 애플리케이션을 Swoole 애플리케이션 서버로 실행하려면 Swoole PHP 확장(extension)을 먼저 설치해야 합니다. 보통 PECL을 통해 설치할 수 있습니다.

```shell
pecl install swoole
```

<a name="swoole-via-laravel-sail"></a>
#### Laravel Sail을 통한 Swoole 사용

> [!WARNING]
> Sail에서 Octane 애플리케이션을 실행하기 전에, Laravel Sail의 최신 버전을 사용 중인지 확인하고, 애플리케이션 루트 디렉토리에서 `./vendor/bin/sail build --no-cache` 명령을 실행하십시오.

또는, [Laravel Sail](/docs/9.x/sail) (공식 Docker 기반 개발 환경)을 이용하여 Swoole 기반 Octane 애플리케이션을 개발할 수 있습니다. Laravel Sail에는 Swoole 확장이 기본적으로 포함되어 있습니다. 다만, 애플리케이션을 계속 실행하려면 Sail에서 사용하는 `supervisor.conf` 파일을 조정해야 합니다. 우선 `sail:publish` Artisan 명령을 실행합니다.

```shell
./vendor/bin/sail artisan sail:publish
```

그 다음, 애플리케이션의 `docker/supervisord.conf` 파일에서 `command` 지시어를 아래와 같이 수정하여 PHP 개발 서버 대신 Octane을 사용하도록 변경합니다.

```ini
command=/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan octane:start --server=swoole --host=0.0.0.0 --port=80
```

마지막으로 Sail 이미지를 빌드합니다.

```shell
./vendor/bin/sail build --no-cache
```

<a name="swoole-configuration"></a>
#### Swoole 설정

Swoole은 필요에 따라 `octane` 설정 파일에 추가할 수 있는 몇 가지 추가 옵션을 지원합니다. 이 옵션들은 자주 변경하지 않아도 되므로 기본 설정 파일에는 포함되어 있지 않습니다.

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

Octane 서버는 `octane:start` Artisan 명령을 통해 시작할 수 있습니다. 이 명령은 기본적으로 애플리케이션의 `octane` 설정 파일에서 지정한 서버를 사용합니다.

```shell
php artisan octane:start
```

기본적으로 Octane은 8000번 포트로 서버를 시작하므로, 웹 브라우저에서 `http://localhost:8000` 주소로 애플리케이션에 접속할 수 있습니다.

<a name="serving-your-application-via-https"></a>
### HTTPS로 애플리케이션 실행

기본적으로 Octane으로 실행되는 애플리케이션은 `http://`로 시작하는 링크를 생성합니다. 만약 HTTPS로 서비스를 제공한다면, 애플리케이션의 `config/octane.php` 설정 파일에서 `OCTANE_HTTPS` 환경 변수를 `true`로 설정할 수 있습니다. 이 값을 `true`로 설정하면, Octane이 라라벨에게 모든 링크를 `https://`로 시작하도록 안내합니다.

```php
'https' => env('OCTANE_HTTPS', false),
```

<a name="serving-your-application-via-nginx"></a>
### Nginx로 애플리케이션 실행

> [!NOTE]
> 직접 서버 설정을 관리하거나 라라벨 Octane 애플리케이션을 제대로 운영하기에 아직 익숙하지 않다면, [Laravel Forge](https://forge.laravel.com) 서비스를 검토해 보시기 바랍니다.

운영 환경에서는 Octane 애플리케이션을 Nginx 또는 Apache와 같은 일반적인 웹 서버 뒤에서 서비스하는 것이 좋습니다. 이렇게 하면 웹 서버가 이미지, 스타일시트 등 정적 자산을 제공하고 SSL 인증서 종료도 처리할 수 있습니다.

아래의 Nginx 설정 예시에서는 정적 자산 요청을 Nginx가 처리하고, 나머지 요청은 8000번 포트에서 실행 중인 Octane 서버로 프록시합니다.

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
### 파일 변경 감지하기

Octane 서버가 시작될 때 애플리케이션이 메모리에 적재되므로, 애플리케이션 파일을 변경해도 브라우저를 새로고침하는 것만으로는 반영되지 않습니다. (예를 들어, `routes/web.php` 파일에 라우트를 추가하면 서버를 재시작해야 적용됩니다.) 이러한 번거로움을 줄이기 위해, `--watch` 플래그를 사용하여 애플리케이션 파일이 변경될 때마다 Octane 서버를 자동으로 재시작하도록 할 수 있습니다.

```shell
php artisan octane:start --watch
```

이 기능을 사용하려면, 로컬 개발 환경에 [Node](https://nodejs.org)가 설치되어 있어야 하며, 프로젝트에 [Chokidar](https://github.com/paulmillr/chokidar) 파일 감지 라이브러리도 설치해야 합니다.

```shell
npm install --save-dev chokidar
```

어떤 디렉터리와 파일을 감지할지 여부는 `config/octane.php`의 `watch` 설정 옵션에서 지정할 수 있습니다.

<a name="specifying-the-worker-count"></a>
### 워커 개수 지정하기

기본적으로 Octane은 시스템의 CPU 코어 수에 맞춰 워커(애플리케이션 요청을 담당하는 작업자 프로세스)를 시작합니다. 이 워커들이 HTTP 요청을 받아 애플리케이션을 서비스합니다. 하지만, `octane:start` 명령에서 `--workers` 옵션으로 워커 개수를 직접 지정할 수도 있습니다.

```shell
php artisan octane:start --workers=4
```

Swoole 애플리케이션 서버를 사용할 경우, ["태스크 워커"](concurrent-tasks) 개수도 `--task-workers` 옵션으로 지정할 수 있습니다.

```shell
php artisan octane:start --workers=4 --task-workers=6
```

<a name="specifying-the-max-request-count"></a>
### 최대 요청 수 지정하기

메모리 누수 방지를 돕기 위해, Octane은 각 워커가 500개의 요청을 처리하면 자동으로 모아서 재시작합니다. 이 수치는 `--max-requests` 옵션으로 조정할 수 있습니다.

```shell
php artisan octane:start --max-requests=250
```

<a name="reloading-the-workers"></a>
### 워커 재시작하기

Octane 서버의 애플리케이션 워커는 `octane:reload` 명령을 사용하여 부드럽게 재시작할 수 있습니다. 일반적으로 신규 코드 배포 후, 새로 배포된 애플리케이션 코드가 메모리에 반영되도록 이 명령을 실행하는 것이 좋습니다.

```shell
php artisan octane:reload
```

<a name="stopping-the-server"></a>
### 서버 중지하기

Octane 서버는 `octane:stop` Artisan 명령으로 중지할 수 있습니다.

```shell
php artisan octane:stop
```

<a name="checking-the-server-status"></a>
#### 서버 상태 확인하기

현재 Octane 서버의 상태는 `octane:status` Artisan 명령으로 확인할 수 있습니다.

```shell
php artisan octane:status
```

<a name="dependency-injection-and-octane"></a>
## 의존성 주입 & Octane

Octane은 애플리케이션을 한 번 부팅한 뒤 메모리에 보관하고, 요청을 처리할 때마다 이 인스턴스를 재활용합니다. 이 때문에 애플리케이션을 개발할 때 주의해야 할 점이 있습니다. 예를 들어, 서비스 프로바이더의 `register`와 `boot` 메서드는 요청 워커가 처음 부팅될 때 한 번만 실행됩니다. 이후의 요청에서는 같은 애플리케이션 인스턴스를 반복해서 사용합니다.

이런 이유로, **애플리케이션 서비스 컨테이너나 request 객체를 다른 객체의 생성자에 주입하는 것은 주의해야 합니다.** 그렇게 하면 해당 객체가 이후의 요청에서도 동일한(예전 상태의) 컨테이너나 request를 참조하게 될 수 있습니다.

Octane은 기본적으로 프레임워크가 유지하는 상태는 요청마다 자동으로 초기화합니다. 하지만, 애플리케이션이 전역(글로벌)으로 만든 상태는 Octane이 초기화 방법을 알지 못할 수 있으니 Octane에 맞는 애플리케이션 설계 방식을 유의해야 합니다. 아래에서는 Octane 사용 시 문제가 될 수 있는 대표적인 상황들을 안내합니다.

<a name="container-injection"></a>
### 컨테이너 주입

일반적으로, 애플리케이션 서비스 컨테이너나 HTTP request 인스턴스를 다른 객체의 생성자에 주입하는 것을 피해야 합니다. 예를 들어, 아래 코드는 애플리케이션 서비스 컨테이너 전체를 싱글턴으로 바인딩된 객체의 생성자에 주입합니다.

```php
use App\Service;

/**
 * Register any application services.
 *
 * @return void
 */
public function register()
{
    $this->app->singleton(Service::class, function ($app) {
        return new Service($app);
    });
}
```

이 예시에서 만약 `Service` 인스턴스가 애플리케이션 부트 과정 중에 해석(resolve)된다면, 컨테이너는 서비스에 주입되고, 그 이후의 요청에서도 같은 컨테이너 인스턴스를 계속해서 참조하게 됩니다. 이 방식이 꼭 문제를 일으키는 것은 아니지만, 부트 순서상 나중이나 다른 요청에서 바인딩된 서비스가 누락되는 등의 문제가 될 수 있습니다.

해결 방법으로는, 해당 바인딩을 싱글턴으로 등록하지 않거나, 서비스 객체에 항상 최신 컨테이너를 가져올 수 있는 클로저를 주입하는 것이 있습니다.

```php
use App\Service;
use Illuminate\Container\Container;

$this->app->bind(Service::class, function ($app) {
    return new Service($app);
});

$this->app->singleton(Service::class, function () {
    return new Service(fn () => Container::getInstance());
});
```

전역 `app` 헬퍼와 `Container::getInstance()` 메서드는 항상 최신 애플리케이션 컨테이너 인스턴스를 반환합니다.

<a name="request-injection"></a>
### 리퀘스트 주입

일반적으로, 애플리케이션 서비스 컨테이너나 HTTP request 인스턴스를 다른 객체의 생성자에 주입하는 것을 피해야 합니다. 예를 들어, 아래 예시에서는 싱글턴으로 바인딩된 객체의 생성자에 전체 request 인스턴스를 주입합니다.

```php
use App\Service;

/**
 * Register any application services.
 *
 * @return void
 */
public function register()
{
    $this->app->singleton(Service::class, function ($app) {
        return new Service($app['request']);
    });
}
```

이 경우, `Service` 인스턴스가 애플리케이션 부트 과정 중에 해석되면, HTTP request가 서비스 객체에 주입되고, 이후의 모든 요청에서도 동일한(만들어진 시점의) request를 참조하게 됩니다. 이 때문에 헤더, 입력값, 쿼리스트링 등 모든 요청 데이터가 틀릴 수 있습니다.

해결 방법으로는, 바인딩을 싱글턴으로 등록하지 않거나, 서비스 객체에 언제나 현재 request 인스턴스를 반환하는 클로저를 주입하는 것입니다. 또는, 가장 추천하는 방식은 필요한 request 정보만 런타임에 객체의 메서드로 전달하는 것입니다.

```php
use App\Service;

$this->app->bind(Service::class, function ($app) {
    return new Service($app['request']);
});

$this->app->singleton(Service::class, function ($app) {
    return new Service(fn () => $app['request']);
});

// 또는...

$service->method($request->input('name'));
```

전역 `request` 헬퍼는 현재 애플리케이션에서 처리되는 요청 인스턴스를 항상 반환하므로, 애플리케이션 내에서 안전하게 사용할 수 있습니다.

> [!WARNING]
> 컨트롤러 메서드나 라우트 클로저에서는 `Illuminate\Http\Request` 인스턴스를 타입힌트해도 괜찮습니다.

<a name="configuration-repository-injection"></a>
### 설정 리포지토리 주입

일반적으로, 설정 리포지토리 인스턴스를 다른 객체의 생성자에 주입하는 것은 피해야 합니다. 아래 예시에서는 설정 리포지토리가 싱글턴으로 바인딩된 객체의 생성자에 주입됩니다.

```php
use App\Service;

/**
 * Register any application services.
 *
 * @return void
 */
public function register()
{
    $this->app->singleton(Service::class, function ($app) {
        return new Service($app->make('config'));
    });
}
```

이렇게 하면, 요청 사이에 설정 값이 변경되더라도, 해당 서비스는 최초(바인딩 시점)의 리포지토리만 참조하게 되어 새로운 값을 접근할 수 없게 됩니다.

해결 방법으로는, 해당 바인딩을 싱글턴으로 등록하지 않거나, 항상 최신 리포지토리를 반환하는 클로저를 클래스에 주입하는 것입니다.

```php
use App\Service;
use Illuminate\Container\Container;

$this->app->bind(Service::class, function ($app) {
    return new Service($app->make('config'));
});

$this->app->singleton(Service::class, function () {
    return new Service(fn () => Container::getInstance()->make('config'));
});
```

전역 `config` 헬퍼는 항상 최신 설정 리포지토리를 반환하므로, 애플리케이션 내에서 안전하게 사용할 수 있습니다.

<a name="managing-memory-leaks"></a>
### 메모리 누수 관리하기

Octane은 애플리케이션을 요청 사이에서도 메모리에 보관하므로, 정적(static) 배열에 데이터를 추가하면 메모리 누수가 발생할 수 있습니다. 예를 들어 아래 컨트롤러 코드는 static `$data` 배열에 값을 계속 추가하여 요청이 올 때마다 메모리가 누적됩니다.

```php
use App\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Handle an incoming request.
 *
 * @param  \Illuminate\Http\Request  $request
 * @return void
 */
public function index(Request $request)
{
    Service::$data[] = Str::random(10);

    // ...
}
```

애플리케이션을 개발할 때 이러한 형태의 메모리 누수를 피하도록 주의해야 합니다. 로컬 개발 단계에서 애플리케이션의 메모리 사용량을 주기적으로 모니터링하여, 새로운 메모리 누수가 없는지 확인하는 것이 좋습니다.

<a name="concurrent-tasks"></a>
## 동시 작업 처리

> [!WARNING]
> 이 기능은 [Swoole](#swoole)이 필요합니다.

Swoole을 사용할 때는 경량의 백그라운드 태스크로 작업을 동시에 실행할 수 있습니다. Octane의 `concurrently` 메서드를 활용하면 됩니다. PHP 배열 디스트럭처링 문법과 함께 사용하면 각 작업 결과를 손쉽게 받을 수 있습니다.

```php
use App\Models\User;
use App\Models.Server;
use Laravel\Octane\Facades\Octane;

[$users, $servers] = Octane::concurrently([
    fn () => User::all(),
    fn () => Server::all(),
]);
```

Octane에서 동시 처리하는 태스크는 Swoole의 "태스크 워커"에서 실행되며, 들어오는 요청과는 완전히 분리된 별도의 프로세스에서 처리됩니다. 사용할 수 있는 태스크 워커의 개수는 `octane:start` 명령의 `--task-workers` 옵션으로 지정할 수 있습니다.

```shell
php artisan octane:start --workers=4 --task-workers=6
```

`concurrently` 메서드를 호출할 때는 Swoole 태스크 시스템의 제한으로 인해, 1024개를 초과하는 태스크를 한 번에 실행하면 안 됩니다.

<a name="ticks-and-intervals"></a>
## 틱(Tick) & 인터벌(Interval)

> [!WARNING]
> 이 기능은 [Swoole](#swoole)이 필요합니다.

Swoole 사용 시, 지정한 초마다 반복적으로 실행되는 "tick" 작업을 등록할 수 있습니다. `tick` 메서드를 사용해 콜백을 등록합니다. 첫 번째 인자는 티커의 이름(문자열), 두 번째 인자는 주어진 주기로 실행할 콜러블입니다.

아래 예시는 10초마다 실행될 클로저를 등록하는 방식입니다. 보통 `tick` 메서드는 애플리케이션 서비스 프로바이더의 `boot` 메서드 안에서 호출하는 것이 적합합니다.

```php
Octane::tick('simple-ticker', fn () => ray('Ticking...'))
        ->seconds(10);
```

`immediate` 메서드를 사용하면 Octane 서버가 처음 부팅할 때도 tick 콜백을 즉시 실행하고, 이후에도 지정 간격마다 계속 실행합니다.

```php
Octane::tick('simple-ticker', fn () => ray('Ticking...'))
        ->seconds(10)
        ->immediate();
```

<a name="the-octane-cache"></a>
## Octane 캐시

> [!WARNING]
> 이 기능은 [Swoole](#swoole)이 필요합니다.

Swoole을 사용할 경우, Octane 캐시 드라이버를 사용할 수 있습니다. 이 캐시는 초당 200만 건까지 읽기∙쓰기가 가능할 정도로 매우 빠릅니다. 캐싱 계층에서 극도의 속도가 필요한 애플리케이션에 적합합니다.

이 캐시는 [Swoole 테이블](https://www.swoole.co.uk/docs/modules/swoole-table)에 의해 제공되며, 서버 내 모든 워커에서 데이터에 접근 가능합니다. 하지만, 서버를 재시작하면 캐시된 모든 데이터가 초기화됩니다.

```php
Cache::store('octane')->put('framework', 'Laravel', 30);
```

> [!NOTE]
> Octane 캐시에서 허용되는 최대 엔트리 수는 애플리케이션의 `octane` 설정 파일에서 지정할 수 있습니다.

<a name="cache-intervals"></a>
### 캐시 인터벌

라라벨의 일반적인 캐시 메서드 외에도, Octane 캐시는 인터벌 기반 캐시 기능을 제공합니다. 이 캐시는 설정한 주기마다 자동으로 새로고침되며, 서비스 프로바이더의 `boot` 메서드 안에서 등록하면 됩니다. 아래 예시는 5초마다 갱신되는 캐시입니다.

```php
use Illuminate\Support\Str;

Cache::store('octane')->interval('random', function () {
    return Str::random(10);
}, seconds: 5);
```

<a name="tables"></a>
## 테이블(Table)

> [!WARNING]
> 이 기능은 [Swoole](#swoole)이 필요합니다.

Swoole을 사용할 때, 임의의 [Swoole 테이블](https://www.swoole.co.uk/docs/modules/swoole-table)을 직접 정의하고 사용할 수 있습니다. Swoole 테이블은 초고속 처리 성능을 제공하며, 서버 내 모든 워커에서 데이터를 읽고 쓸 수 있습니다. 단, 서버가 재시작되면 테이블 데이터는 모두 사라집니다.

테이블은 애플리케이션의 `octane` 설정 파일 내 `tables` 설정 배열에서 정의할 수 있습니다. 최대 1000개의 행을 허용하는 샘플 테이블이 기본으로 설정되어 있습니다. 문자열 컬럼의 크기는 아래와 같이 타입 뒤에 크기 값을 지정해 관리할 수 있습니다.

```php
'tables' => [
    'example:1000' => [
        'name' => 'string:1000',
        'votes' => 'int',
    ],
],
```

테이블에 접근하려면 `Octane::table` 메서드를 사용할 수 있습니다.

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
