# 배포 (Deployment)

- [소개](#introduction)
- [서버 요구 사항](#server-requirements)
- [서버 구성](#server-configuration)
    - [Nginx](#nginx)
- [최적화](#optimization)
    - [오토로더 최적화](#autoloader-optimization)
    - [설정 로딩 최적화](#optimizing-configuration-loading)
    - [라우트 로딩 최적화](#optimizing-route-loading)
    - [뷰 로딩 최적화](#optimizing-view-loading)
- [디버그 모드](#debug-mode)
- [Forge / Vapor로 배포하기](#deploying-with-forge-or-vapor)

<a name="introduction"></a>
## 소개

라라벨 애플리케이션을 실제 운영 환경에 배포할 준비가 되었다면, 애플리케이션이 최대한 효율적으로 동작하도록 몇 가지 중요한 작업을 수행해야 합니다. 이 문서에서는 라라벨 애플리케이션을 올바르게 배포하기 위해 알아두면 좋은 주요 사항들을 소개합니다.

<a name="server-requirements"></a>
## 서버 요구 사항

라라벨 프레임워크는 몇 가지 시스템 요구 사항이 있습니다. 웹 서버가 아래의 최소한의 PHP 버전과 확장 기능을 갖추고 있는지 반드시 확인해야 합니다.

<div class="content-list" markdown="1">

- PHP >= 8.0
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
## 서버 구성

<a name="nginx"></a>
### Nginx

만약 Nginx가 설치된 서버에 애플리케이션을 배포하려면, 아래에 있는 구성 파일을 참고하여 웹 서버를 설정할 수 있습니다. 대부분의 경우, 이 파일은 실제 서버 환경에 맞게 약간의 커스터마이징이 필요합니다. **서버 관리와 배포에 도움이 필요하다면, [Laravel Forge](https://forge.laravel.com)와 같은 라라벨 공식 서버 관리 및 배포 서비스를 사용하는 것도 고려해보시기 바랍니다.**

다음의 예시와 같이, 반드시 웹 서버가 애플리케이션의 `public/index.php` 파일로 모든 요청을 연결하도록 설정해야 합니다. 절대로 `index.php` 파일을 루트 디렉토리로 옮겨서 애플리케이션을 서비스하지 마십시오. 프로젝트 루트에서 애플리케이션을 서비스하면 여러 민감한 설정 파일들이 외부에 노출될 수 있습니다.

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

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.0-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

<a name="optimization"></a>
## 최적화

<a name="autoloader-optimization"></a>
### 오토로더 최적화

운영 환경에 배포할 때는 Composer의 클래스 오토로더 맵을 최적화하여, Composer가 클래스 로딩 시 필요한 파일을 더 빠르게 찾을 수 있도록 해야 합니다.

```shell
composer install --optimize-autoloader --no-dev
```

> [!NOTE]
> 오토로더를 최적화하는 것에 더해, 프로젝트의 소스 관리 저장소에 반드시 `composer.lock` 파일이 포함되어야 합니다. `composer.lock` 파일이 있을 경우, 프로젝트의 의존성 설치가 훨씬 더 빠르게 진행됩니다.

<a name="optimizing-configuration-loading"></a>
### 설정 로딩 최적화

애플리케이션을 운영 환경에 배포할 때는 배포 프로세스 중에 `config:cache` 아티즌 명령어를 반드시 실행해야 합니다.

```shell
php artisan config:cache
```

이 명령어는 라라벨의 모든 설정 파일을 하나의 캐시 파일로 합쳐, 프레임워크가 설정값을 로드할 때 파일 시스템에 접근하는 횟수를 크게 줄여줍니다.

> [!WARNING]
> 배포 과정에서 `config:cache` 명령어를 실행하는 경우, 반드시 설정 파일 안에서만 `env` 함수를 호출하도록 해야 합니다. 설정이 캐싱된 후에는 `.env` 파일이 더 이상 로드되지 않으며, `.env` 변수에 대해 `env` 함수를 호출하면 항상 `null`이 반환됩니다.

<a name="optimizing-route-loading"></a>
### 라우트 로딩 최적화

많은 라우트를 가진 대규모 애플리케이션을 구축할 때는 배포 과정에서 `route:cache` 아티즌 명령어를 실행해야 합니다.

```shell
php artisan route:cache
```

이 명령어는 모든 라우트 등록을 하나의 캐시 파일 내 단일 메서드 호출로 통합하여, 수백 개의 라우트를 등록하는 상황에서 라우트 등록 속도를 크게 높여줍니다.

<a name="optimizing-view-loading"></a>
### 뷰 로딩 최적화

애플리케이션을 운영 환경에 배포할 때는 배포 프로세스 중에 반드시 `view:cache` 아티즌 명령어를 실행해야 합니다.

```shell
php artisan view:cache
```

이 명령은 모든 Blade 뷰를 미리 컴파일해서, 요청이 들어올 때마다 뷰를 새로 컴파일하지 않아도 되도록 하여 뷰 반환 속도를 높여줍니다.

<a name="debug-mode"></a>
## 디버그 모드

`config/app.php` 설정 파일 내의 디버그 옵션은 에러 발생 시 유저에게 실제로 표시되는 정보의 수준을 결정합니다. 기본적으로 이 옵션은 애플리케이션의 `.env` 파일에 있는 `APP_DEBUG` 환경 변수의 값을 따릅니다.

**운영 환경에서는 반드시 이 값을 `false`로 설정해야 합니다. 운영 서버에서 `APP_DEBUG` 변수가 `true`로 되어 있으면, 민감한 설정 정보들이 최종 사용자에게 노출될 위험이 있습니다.**

<a name="deploying-with-forge-or-vapor"></a>
## Forge / Vapor로 배포하기

<a name="laravel-forge"></a>
#### Laravel Forge

직접 서버를 구성하거나, 라라벨 애플리케이션을 운영하기 위해 필요한 다양한 서비스를 직접 세팅하는 것이 익숙하지 않다면, [Laravel Forge](https://forge.laravel.com)는 훌륭한 대안이 될 수 있습니다.

Laravel Forge는 DigitalOcean, Linode, AWS 등 다양한 인프라 공급자 위에 서버를 생성할 수 있습니다. 또한 Forge는 Nginx, MySQL, Redis, Memcached, Beanstalk 등 강력한 라라벨 애플리케이션 구축에 필요한 모든 툴을 설치하고 관리해줍니다.

> [!NOTE]
> Laravel Forge로 배포하는 전체 가이드가 필요하다면, [Laravel Bootcamp](https://bootcamp.laravel.com/deploying)와 Forge [Laracasts 공식 영상 시리즈](https://laracasts.com/series/learn-laravel-forge-2022-edition)를 참고해보세요.

<a name="laravel-vapor"></a>
#### Laravel Vapor

서버리스 환경에서, 라라벨에 최적화된 자동 확장 배포 플랫폼이 필요하다면 [Laravel Vapor](https://vapor.laravel.com)를 확인해보세요. Laravel Vapor는 AWS 기반의 라라벨 서버리스 배포 플랫폼으로, 라라벨 인프라를 클릭 한 번으로 손쉽게 구축할 수 있어 서버리스를 통한 뛰어난 확장성과 단순함을 경험할 수 있습니다. Laravel Vapor는 라라벨 제작자들이 직접 프레임워크와의 완벽한 연동을 제공하므로, 기존처럼 라라벨 애플리케이션을 개발하는 익숙한 방식 그대로 작업을 이어갈 수 있습니다.