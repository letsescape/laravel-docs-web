# 배포 (Deployment)

- [소개](#introduction)
- [서버 요구 사항](#server-requirements)
- [서버 설정](#server-configuration)
    - [Nginx](#nginx)
    - [FrankenPHP](#frankenphp)
    - [디렉터리 권한](#directory-permissions)
- [최적화](#optimization)
    - [설정 캐싱](#optimizing-configuration-loading)
    - [이벤트 캐싱](#caching-events)
    - [라우트 캐싱](#optimizing-route-loading)
    - [뷰 캐싱](#optimizing-view-loading)
- [디버그 모드](#debug-mode)
- [헬스 체크 라우트](#the-health-route)
- [Laravel Cloud 나 Forge로 배포하기](#deploying-with-cloud-or-forge)

<a name="introduction"></a>
## 소개

라라벨 애플리케이션을 운영 환경에 배포할 준비가 되면, 애플리케이션을 최대한 효율적으로 실행할 수 있도록 반드시 확인해야 할 몇 가지 중요한 사항이 있습니다. 이 문서에서는 라라벨 애플리케이션을 올바르게 배포하기 위한 좋은 출발점을 설명합니다.

<a name="server-requirements"></a>
## 서버 요구 사항

라라벨 프레임워크를 사용하려면 몇 가지 시스템 요구 사항이 있습니다. 웹 서버에 아래의 최소 PHP 버전 및 익스텐션이 설치되어 있는지 반드시 확인해야 합니다.

<div class="content-list" markdown="1">

- PHP >= 8.2
- Ctype PHP Extension
- cURL PHP Extension
- DOM PHP Extension
- Fileinfo PHP Extension
- Filter PHP Extension
- Hash PHP Extension
- Mbstring PHP Extension
- OpenSSL PHP Extension
- PCRE PHP Extension
- PDO PHP Extension
- Session PHP Extension
- Tokenizer PHP Extension
- XML PHP Extension

</div>

<a name="server-configuration"></a>
## 서버 설정

<a name="nginx"></a>
### Nginx

애플리케이션을 Nginx가 실행 중인 서버에 배포하는 경우, 아래의 설정 파일을 참고하여 웹 서버를 설정할 수 있습니다. 실 환경에서는 서버 환경에 따라 이 파일을 반드시 커스터마이징해야 할 수도 있습니다. **서버 관리에 도움이 필요하다면, [Laravel Cloud](https://cloud.laravel.com)와 같은 완전 관리형 라라벨 플랫폼을 사용하는 것을 고려해보시기 바랍니다.**

아래 설정과 같이, 웹 서버는 모든 요청을 애플리케이션의 `public/index.php` 파일로 전달하도록 구성해야 합니다. 절대로 `index.php` 파일을 프로젝트 루트로 옮기려고 해서는 안 됩니다. 프로젝트 루트에서 애플리케이션을 서빙하는 경우, 민감한 설정 파일들이 외부 인터넷에 노출될 위험이 있습니다.

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name example.com;
    root /srv/example.com/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ ^/index\.php(/|$) {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

<a name="frankenphp"></a>
### FrankenPHP

[FrankenPHP](https://frankenphp.dev/)를 사용하여 라라벨 애플리케이션을 서비스할 수도 있습니다. FrankenPHP는 Go 언어로 작성된 최신 PHP 애플리케이션 서버입니다. Laravel PHP 애플리케이션을 FrankenPHP로 서비스하려면, 아래와 같이 `php-server` 명령어를 실행하면 됩니다.

```shell
frankenphp php-server -r public/
```

FrankenPHP가 제공하는 HTTP/3, 최신 압축 기능, Laravel Octane 연동, 라라벨 애플리케이션을 독립 실행 파일로 패키징하는 기능 등 더 강력한 고급 기능을 사용하려면, FrankenPHP의 [라라벨 문서](https://frankenphp.dev/docs/laravel/)를 참고하세요.

<a name="directory-permissions"></a>
### 디렉터리 권한

라라벨은 `bootstrap/cache`와 `storage` 디렉터리에 데이터를 쓸 수 있어야 하므로, 반드시 웹 서버 프로세스의 소유자가 이 디렉터리에 쓸 수 있는 권한을 갖고 있는지 확인해야 합니다.

<a name="optimization"></a>
## 최적화

애플리케이션을 운영 환경에 배포할 때는 설정, 이벤트, 라우트, 뷰 파일 등 다양한 파일들을 캐싱해야 합니다. 라라벨은 이 모든 파일을 한 번에 캐싱해주는 간편한 `optimize` Artisan 명령어를 제공합니다. 이 명령어는 일반적으로 배포 프로세스에 포함해 사용해야 합니다.

```shell
php artisan optimize
```

`optimize:clear` 명령어는 `optimize` 명령어로 생성된 모든 캐시 파일과 기본 캐시 드라이버의 모든 키를 제거합니다.

```shell
php artisan optimize:clear
```

아래 문서에서는 `optimize` 명령어가 내부적으로 실행하는 개별 최적화 명령어에 대해 자세히 설명합니다.

<a name="optimizing-configuration-loading"></a>
### 설정 캐싱

애플리케이션을 운영 환경에 배포할 때는, 배포 과정에서 반드시 `config:cache` Artisan 명령어를 실행해야 합니다.

```shell
php artisan config:cache
```

이 명령어는 라라벨의 모든 설정 파일을 하나의 캐시된 파일로 합쳐줍니다. 덕분에 프레임워크가 설정 값을 로드할 때 파일 시스템을 여러 번 접근할 필요 없이 성능이 크게 향상됩니다.

> [!WARNING]
> 배포 중에 `config:cache` 명령어를 실행하는 경우, 설정 파일 내에서만 `env` 함수를 호출해야 합니다. 한번 설정이 캐시되면 `.env` 파일은 더 이상 사용되지 않으며, `.env` 변수에 대해 `env` 함수를 호출해도 `null`이 반환됩니다.

<a name="caching-events"></a>
### 이벤트 캐싱

애플리케이션의 자동 탐색 이벤트와 리스너 매핑도 배포 과정에서 캐싱해야 합니다. 배포 시 `event:cache` Artisan 명령어를 실행하면 됩니다.

```shell
php artisan event:cache
```

<a name="optimizing-route-loading"></a>
### 라우트 캐싱

규모가 크고 라우트가 많은 애플리케이션을 개발할 경우, 배포 과정에서 반드시 `route:cache` Artisan 명령어를 실행해야 합니다.

```shell
php artisan route:cache
```

이 명령어는 모든 라우트 등록 정보를 하나의 캐시 파일에서 단일 메서드 호출로 축약해 저장함으로써, 수백 개의 라우트 등록 시 성능이 크게 향상됩니다.

<a name="optimizing-view-loading"></a>
### 뷰 캐싱

애플리케이션을 배포할 때는 `view:cache` Artisan 명령어를 실행해야 합니다.

```shell
php artisan view:cache
```

이 명령어는 모든 Blade 뷰 파일을 미리 컴파일하여, 각 요청마다 뷰가 즉석에서 컴파일되지 않아도 되게 만들어줍니다. 그 결과, 뷰를 반환하는 요청 처리 속도가 빨라집니다.

<a name="debug-mode"></a>
## 디버그 모드

`config/app.php` 설정 파일의 debug 옵션은 오류 발생 시 사용자에게 얼마나 많은 정보를 보여줄지 결정합니다. 기본적으로 이 옵션은 애플리케이션의 `.env` 파일에 저장된 `APP_DEBUG` 환경 변수 값을 따릅니다.

> [!WARNING]
> **운영 환경에서는 반드시 이 값을 `false`로 설정해야 합니다. 만약 운영 환경에서 `APP_DEBUG`가 `true`로 설정되어 있다면, 애플리케이션의 민감한 설정 값이 최종 사용자에게 노출될 수 있습니다.**

<a name="the-health-route"></a>
## 헬스 체크 라우트

라라벨에는 애플리케이션 상태를 모니터링할 수 있는 내장 헬스 체크 라우트가 포함되어 있습니다. 운영 환경에서는 이 라우트를 이용해 가용성 모니터, 로드 밸런서, 쿠버네티스와 같은 오케스트레이션 시스템에 애플리케이션 상태를 보고할 수 있습니다.

기본적으로 헬스 체크 라우트는 `/up` 경로에서 제공되며, 애플리케이션이 예외 없이 부팅된 경우 200 HTTP 응답 코드를 반환합니다. 그렇지 않으면 500 HTTP 응답이 반환됩니다. 이 라우트의 URI는 애플리케이션의 `bootstrap/app` 파일에서 설정할 수 있습니다.

```php
->withRouting(
    web: __DIR__.'/../routes/web.php',
    commands: __DIR__.'/../routes/console.php',
    health: '/up', // [tl! remove]
    health: '/status', // [tl! add]
)
```

이 라우트로 HTTP 요청이 오면, 라라벨은 `Illuminate\Foundation\Events\DiagnosingHealth` 이벤트도 발생시킵니다. 이를 통해, 추가적으로 필요한 헬스 체크 로직을 구현할 수 있습니다. 예를 들어, [리스너](/docs/events) 안에서 데이터베이스나 캐시 상태를 점검할 수 있습니다. 만약 애플리케이션에 문제가 감지되면, 리스너 내에서 예외를 발생시키기만 하면 됩니다.

<a name="deploying-with-cloud-or-forge"></a>
## Laravel Cloud 나 Forge로 배포하기

<a name="laravel-cloud"></a>
#### Laravel Cloud

라라벨에 최적화된 완전 관리형, 자동 확장 배포 플랫폼이 필요하다면 [Laravel Cloud](https://cloud.laravel.com)를 확인해보세요. Laravel Cloud는 매니지드 컴퓨트, 데이터베이스, 캐시, 오브젝트 스토리지를 제공하는 강력한 라라벨 전용 배포 플랫폼입니다.

Cloud에서 라라벨 애플리케이션을 바로 실행하고, 확장에 신경 쓰지 않아도 되는 간편함을 경험해보세요. Laravel Cloud는 라라벨 제작팀이 직접 프레임워크와 완벽하게 맞도록 튜닝했기 때문에, 평소처럼 라라벨 애플리케이션을 개발하면 됩니다.

<a name="laravel-forge"></a>
#### Laravel Forge

직접 서버를 관리하고 싶지만, 라라벨 애플리케이션 구동에 필요한 다양한 서비스를 일일이 설정하는 것이 부담스럽다면 [Laravel Forge](https://forge.laravel.com)가 좋은 선택이 될 수 있습니다. Forge는 라라벨 애플리케이션을 위한 VPS 서버 관리 플랫폼입니다.

Forge는 DigitalOcean, Linode, AWS 등 여러 인프라 제공업체에 서버를 생성할 수 있으며, Nginx, MySQL, Redis, Memcached, Beanstalk 등 신뢰성 높은 라라벨 애플리케이션 구성을 위해 필요한 다양한 도구를 설치하고 관리해줍니다.