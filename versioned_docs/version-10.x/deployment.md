# 배포 (Deployment)

- [소개](#introduction)
- [서버 요구 사항](#server-requirements)
- [서버 설정](#server-configuration)
    - [Nginx](#nginx)
- [최적화](#optimization)
    - [오토로더 최적화](#autoloader-optimization)
    - [설정 캐싱](#optimizing-configuration-loading)
    - [이벤트 캐싱](#caching-events)
    - [라우트 캐싱](#optimizing-route-loading)
    - [뷰 캐싱](#optimizing-view-loading)
- [디버그 모드](#debug-mode)
- [Forge / Vapor로 쉬운 배포](#deploying-with-forge-or-vapor)

<a name="introduction"></a>
## 소개

라라벨 애플리케이션을 운영 환경에 배포할 준비가 되었다면, 애플리케이션이 최대한 효율적으로 동작하도록 하기 위해 취할 수 있는 중요한 사항들이 있습니다. 이 문서에서는 라라벨 애플리케이션을 올바르게 배포하기 위한 가장 기본적인 출발점들을 다루고 있습니다.

<a name="server-requirements"></a>
## 서버 요구 사항

라라벨 프레임워크는 몇 가지 시스템 요구 사항이 있습니다. 여러분의 웹 서버가 아래 최소 PHP 버전과 확장 모듈을 갖추고 있는지 반드시 확인해야 합니다.

<div class="content-list" markdown="1">

- PHP >= 8.1
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

만약 Nginx가 실행 중인 서버에 애플리케이션을 배포한다면, 아래의 설정 파일을 참고하여 웹 서버를 설정할 수 있습니다. 실제로는 여러분의 서버 환경에 맞게 이 파일을 추가로 수정해야 할 가능성이 높습니다. **서버 관리에 도움이 필요하다면, [Laravel Forge](https://forge.laravel.com)와 같은 라라벨 공식 서버 관리 및 배포 서비스를 사용하는 것도 고려해보시기 바랍니다.**

아래 예시 설정과 같이, 웹 서버가 모든 요청을 애플리케이션의 `public/index.php` 파일로 전달하도록 반드시 설정해야 합니다. 절대로 `index.php` 파일을 프로젝트 루트로 옮기는 시도를 해서는 안 됩니다. 만약 프로젝트의 루트에서 애플리케이션을 서비스하게 되면, 많은 민감한 설정 파일들이 외부에 노출될 수 있습니다.

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
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
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

운영 환경에 배포할 때는 Composer의 클래스 오토로더 맵을 최적화해야 Composer가 클래스를 빠르게 찾아서 로드할 수 있습니다.

```shell
composer install --optimize-autoloader --no-dev
```

> [!NOTE]
> 오토로더를 최적화하는 것과 더불어, 반드시 `composer.lock` 파일도 소스 컨트롤 저장소에 포함시켜야 합니다. `composer.lock` 파일이 있으면 프로젝트 의존성 설치 속도가 훨씬 빨라집니다.

<a name="optimizing-configuration-loading"></a>
### 설정 캐싱

애플리케이션을 운영 환경에 배포할 때는, 배포 과정에서 반드시 `config:cache` 아티즌 명령어를 실행해야 합니다.

```shell
php artisan config:cache
```

이 명령어는 라라벨의 모든 설정 파일을 하나의 캐시 파일에 합쳐서 저장합니다. 덕분에 프레임워크가 설정값을 불러올 때 파일 시스템에 접근하는 횟수가 크게 줄어들어 성능이 향상됩니다.

> [!NOTE]
> 배포 과정에서 `config:cache` 명령어를 실행하는 경우, 반드시 설정 파일 내에서만 `env` 함수를 호출해야 합니다. 설정을 캐시하면 `.env` 파일은 더 이상 로드되지 않으며, 이때부터 `.env` 변수의 값을 `env` 함수로 읽으면 항상 `null`을 반환합니다.

<a name="caching-events"></a>
### 이벤트 캐싱

애플리케이션에서 [이벤트 디스커버리](/docs/10.x/events#event-discovery)를 사용 중이라면, 배포 과정에서 애플리케이션의 이벤트-리스너 매핑도 캐싱해야 합니다. 이를 위해 배포 시 `event:cache` 아티즌 명령어를 실행하면 됩니다.

```shell
php artisan event:cache
```

<a name="optimizing-route-loading"></a>
### 라우트 캐싱

라우트가 많은 대규모 애플리케이션을 빌드할 경우, 배포 과정에서 `route:cache` 아티즌 명령어를 실행해야 합니다.

```shell
php artisan route:cache
```

이 명령어는 모든 라우트 등록 정보를 하나의 캐시 파일 내에서 메서드 호출로 통합하여 저장합니다. 수백 개의 라우트를 등록할 때 라우트 등록 속도를 크게 개선할 수 있습니다.

<a name="optimizing-view-loading"></a>
### 뷰 캐싱

운영 환경에 애플리케이션을 배포할 때는, 배포 과정에서 반드시 `view:cache` 아티즌 명령어를 실행해야 합니다.

```shell
php artisan view:cache
```

이 명령어는 모든 Blade 뷰 파일을 미리 컴파일하여, 실제 요청마다 뷰가 실시간으로 컴파일되는 일이 없도록 하여 각 요청에서의 뷰 렌더링 성능을 높입니다.

<a name="debug-mode"></a>
## 디버그 모드

`config/app.php` 설정 파일의 debug 옵션은 에러 발생 시 사용자에게 어느 정도의 정보가 노출되는지를 결정합니다. 기본적으로 이 옵션은 애플리케이션의 `.env` 파일에 저장된 `APP_DEBUG` 환경 변수 값을 따릅니다.

> [!NOTE]
> **운영 환경에서는 이 값이 반드시 `false`로 설정되어 있어야 합니다. 운영 환경에서 `APP_DEBUG` 변수가 `true`로 설정되어 있으면, 애플리케이션의 엔드 유저에게 민감한 설정 값이 노출될 위험이 있습니다.**

<a name="deploying-with-forge-or-vapor"></a>
## Forge / Vapor로 쉬운 배포

<a name="laravel-forge"></a>
#### Laravel Forge

서버 설정을 직접 관리할 준비가 되어 있지 않거나, 라라벨 애플리케이션을 안정적으로 실행하기 위해 필요한 다양한 서비스를 직접 설정하는 것이 어렵다면, [Laravel Forge](https://forge.laravel.com)는 훌륭한 대안이 될 수 있습니다.

Laravel Forge를 사용하면 DigitalOcean, Linode, AWS 등 여러 인프라 제공업체에 서버를 생성할 수 있습니다. 또한, Forge는 Nginx, MySQL, Redis, Memcached, Beanstalk 등 강력한 라라벨 애플리케이션에 필요한 도구를 자동으로 설치하고 관리해줍니다.

> [!NOTE]
> Laravel Forge로 배포하는 전체 가이드가 필요하다면 [Laravel Bootcamp](https://bootcamp.laravel.com/deploying)나 Forge의 [Laracasts 영상 시리즈](https://laracasts.com/series/learn-laravel-forge-2022-edition)를 참고하세요.

<a name="laravel-vapor"></a>
#### Laravel Vapor

완전히 서버리스(serverless)하며 라라벨에 최적화된 오토스케일링 배포 플랫폼을 원하신다면, [Laravel Vapor](https://vapor.laravel.com)를 확인해 보세요. Laravel Vapor는 AWS 기반의 라라벨 전용 서버리스 배포 플랫폼입니다. Vapor에서 라라벨 인프라를 손쉽게 시작할 수 있으며, 서버 관리의 복잡함 없이 확장 가능한 환경을 즐길 수 있습니다. 라라벨의 제작진이 직접 세밀하게 튜닝했기 때문에 프레임워크와 완벽하게 연동되어, 익숙한 방식으로 라라벨 애플리케이션을 계속 개발할 수 있습니다.