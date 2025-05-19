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
- [Laravel Cloud 또는 Forge를 이용한 배포](#deploying-with-cloud-or-forge)

<a name="introduction"></a>
## 소개

라라벨 애플리케이션을 실제 운영 환경에 배포할 준비가 되었다면, 애플리케이션이 최대한 효율적으로 동작하도록 몇 가지 중요한 점을 챙겨야 합니다. 이 문서에서는 라라벨 애플리케이션을 올바르게 배포하기 위한 필수 사항들을 소개합니다.

<a name="server-requirements"></a>
## 서버 요구 사항

라라벨 프레임워크를 사용하기 위해서는 몇 가지 시스템 요구 사항이 있습니다. 웹 서버가 다음과 같은 최소한의 PHP 버전 및 확장 기능을 지원하는지 확인해야 합니다.

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

Nginx를 사용해 애플리케이션을 배포하는 경우, 아래에 나온 설정 파일 예시를 참고해 웹 서버를 설정할 수 있습니다. 실제 서버 환경에 따라 이 파일을 반드시 수정해야 할 수 있습니다. **서버 관리가 어려운 경우, [Laravel Cloud](https://cloud.laravel.com)와 같은 완전 관리형 라라벨 플랫폼을 사용해 보시는 것도 좋은 방법입니다.**

아래 예시와 같이 웹 서버가 모든 요청을 애플리케이션의 `public/index.php` 파일로 라우팅하도록 반드시 설정해야 합니다. `index.php` 파일을 프로젝트 루트로 옮겨 사용하는 것은 절대 권장되지 않습니다. 애플리케이션을 프로젝트 루트에서 서비스하면 민감한 설정 파일들이 외부에 노출될 수 있기 때문입니다.

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

[FrankenPHP](https://frankenphp.dev/)를 이용해 라라벨 애플리케이션을 서비스할 수도 있습니다. FrankenPHP는 Go 언어로 작성된 최신 PHP 애플리케이션 서버입니다. FrankenPHP를 사용해 라라벨 애플리케이션을 구동하려면 아래와 같이 `php-server` 명령어를 실행하면 됩니다.

```shell
frankenphp php-server -r public/
```

Laravel Octane 연동, HTTP/3, 최신 압축 기능, 라라벨 애플리케이션을 독립 바이너리로 패키징하는 등 FrankenPHP에서 제공하는 고급 기능을 활용하려면, FrankenPHP의 [라라벨 공식 문서](https://frankenphp.dev/docs/laravel/)를 참고하세요.

<a name="directory-permissions"></a>
### 디렉터리 권한

라라벨은 `bootstrap/cache` 디렉터리와 `storage` 디렉터리에 파일을 기록해야 합니다. 따라서 웹 서버 프로세스의 소유자가 이 디렉터리들에 쓸 수 있는 권한이 있는지 꼭 확인하세요.

<a name="optimization"></a>
## 최적화

운영 환경에 애플리케이션을 배포할 때는 설정 파일, 이벤트, 라우트, 뷰 등 여러 파일들을 캐시하여 성능을 높이는 것이 좋습니다. 라라벨에서는 이 모든 파일을 한 번에 캐시하는 편리한 `optimize` 아티즌 명령어를 제공합니다. 이 명령어는 보통 애플리케이션 배포 프로세스에 포함되어야 합니다.

```shell
php artisan optimize
```

`optimize:clear` 명령어를 사용하면, `optimize` 명령어로 생성된 모든 캐시 파일과, 기본 캐시 드라이버의 모든 키를 제거할 수 있습니다.

```shell
php artisan optimize:clear
```

아래에서는 `optimize` 명령어가 실행하는 각 개별 최적화 명령어에 대해 설명합니다.

<a name="optimizing-configuration-loading"></a>
### 설정 캐싱

운영 환경에 애플리케이션을 배포할 때는 배포 과정에서 반드시 `config:cache` 아티즌 명령어를 실행해야 합니다.

```shell
php artisan config:cache
```

이 명령어는 라라벨의 모든 설정 파일을 하나의 캐시 파일로 결합하여, 설정 값을 읽을 때 파일 시스템 접근 횟수를 크게 줄여줍니다.

> [!WARNING]
> 배포 과정에서 `config:cache` 명령어를 실행한 경우, 설정 파일 내에서만 `env` 함수를 호출해야 합니다. 한 번 설정이 캐시되면 `.env` 파일이 로드되지 않으며, 이후 `.env` 관련 `env` 함수 호출은 모두 `null`을 반환하게 됩니다.

<a name="caching-events"></a>
### 이벤트 캐싱

애플리케이션에서 자동으로 감지된 이벤트 리스너 매핑도 배포 시에 캐시하는 것이 좋습니다. 이것은 배포 과정에서 `event:cache` 아티즌 명령어를 실행하면 됩니다.

```shell
php artisan event:cache
```

<a name="optimizing-route-loading"></a>
### 라우트 캐싱

수많은 라우트를 가진 대규모 애플리케이션이라면, 배포 과정에서 반드시 `route:cache` 아티즌 명령어를 실행해야 합니다.

```shell
php artisan route:cache
```

이 명령어는 모든 라우트 등록 정보를 하나의 캐시 파일에 저장해, 수백 개의 라우트를 등록할 때도 성능을 크게 개선해줍니다.

<a name="optimizing-view-loading"></a>
### 뷰 캐싱

운영 환경에 배포할 때는 반드시 `view:cache` 아티즌 명령어도 실행해야 합니다.

```shell
php artisan view:cache
```

이 명령어는 모든 Blade 뷰 파일을 미리 컴파일해, 실제 요청 때마다 뷰가 매번 컴파일되는 일을 막아주므로 응답 성능이 향상됩니다.

<a name="debug-mode"></a>
## 디버그 모드

`config/app.php` 설정 파일 내의 debug 옵션은 사용자에게 에러 정보를 얼마나 상세하게 출력할지 결정합니다. 기본적으로 이 옵션은 애플리케이션의 `.env` 파일에 저장된 `APP_DEBUG` 환경 변수 값을 따릅니다.

> [!WARNING]
> **운영 환경에서는 이 값이 반드시 `false`로 설정되어 있어야 합니다. 만약 운영 환경에서 `APP_DEBUG` 변수가 `true`로 되어 있다면, 설정 파일의 민감한 정보가 사용자에게 노출될 위험이 있습니다.**

<a name="the-health-route"></a>
## 헬스 체크 라우트

라라벨에는 애플리케이션 상태를 모니터링할 수 있도록 내장된 헬스 체크 라우트가 포함되어 있습니다. 운영 환경에서는 이 라우트를 활용해 업타임 모니터, 로드 밸런서, Kubernetes와 같은 오케스트레이션 시스템에 애플리케이션 상태를 보고할 수 있습니다.

기본적으로 헬스 체크 라우트는 `/up` 경로에서 제공되며, 애플리케이션이 예외 없이 정상적으로 부팅되면 200 HTTP 응답을 반환합니다. 반대로 문제가 있을 경우 500 응답을 돌려줍니다. 이 라우트의 URI는 애플리케이션의 `bootstrap/app` 파일에서 지정할 수 있습니다.

```php
->withRouting(
    web: __DIR__.'/../routes/web.php',
    commands: __DIR__.'/../routes/console.php',
    health: '/up', // [tl! remove]
    health: '/status', // [tl! add]
)
```

이 라우트로 HTTP 요청이 들어오면, 라라벨은 `Illuminate\Foundation\Events\DiagnosingHealth` 이벤트를 디스패치합니다. 이를 통해 원하는 헬스 체크 리스너에서 데이터베이스나 캐시 상태 등을 추가로 점검할 수 있습니다. 만약 애플리케이션에 문제가 감지되면, 리스너에서 예외를 던져 상태를 알릴 수 있습니다.

<a name="deploying-with-cloud-or-forge"></a>
## Laravel Cloud 또는 Forge를 이용한 배포

<a name="laravel-cloud"></a>
#### Laravel Cloud

완전하게 관리되고, 라라벨에 최적화된 오토스케일링 배포 플랫폼이 필요하다면 [Laravel Cloud](https://cloud.laravel.com)를 확인해 보세요. Laravel Cloud는 라라벨 전용으로 설계된 강력한 배포 플랫폼으로, 관리되는 컴퓨트, 데이터베이스, 캐시, 오브젝트 스토리지 서비스를 제공합니다.

Cloud에서 여러분의 라라벨 애플리케이션을 시작해 보세요. 확장성과 단순함에 분명 만족하실 겁니다. Laravel Cloud는 라라벨 제작진이 프레임워크에 맞게 세밀하게 튜닝했으므로, 기존에 하던 그대로 애플리케이션 개발만 집중하실 수 있습니다.

<a name="laravel-forge"></a>
#### Laravel Forge

서버 관리는 스스로 하고 싶지만, 안정적인 라라벨 애플리케이션 구동에 필요한 여러 서비스를 직접 설정하는 게 부담스럽다면 [Laravel Forge](https://forge.laravel.com)가 좋은 선택이 될 수 있습니다. Laravel Forge는 라라벨 애플리케이션을 위한 VPS 서버 관리 플랫폼입니다.

Forge는 DigitalOcean, Linode, AWS 등 다양한 인프라 제공업체에 서버를 생성할 수 있습니다. 또한 Nginx, MySQL, Redis, Memcached, Beanstalk 등 라라벨 애플리케이션을 위한 필수 도구들을 자동으로 설치하고 관리해 줍니다.