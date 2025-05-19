# 라라벨 리버브 (Laravel Reverb)

- [소개](#introduction)
- [설치](#installation)
- [구성](#configuration)
    - [애플리케이션 자격 증명](#application-credentials)
    - [허용된 오리진](#allowed-origins)
    - [추가 애플리케이션](#additional-applications)
    - [SSL](#ssl)
- [서버 실행하기](#running-server)
    - [디버깅](#debugging)
    - [재시작](#restarting)
- [모니터링](#monitoring)
- [운영 환경에서 리버브 실행하기](#production)
    - [오픈 파일](#open-files)
    - [이벤트 루프](#event-loop)
    - [웹 서버](#web-server)
    - [포트](#ports)
    - [프로세스 관리](#process-management)
    - [스케일링](#scaling)

<a name="introduction"></a>
## 소개

[Laravel Reverb](https://github.com/laravel/reverb)는 매우 빠르고 확장 가능한 실시간 WebSocket 통신을 여러분의 라라벨 애플리케이션에 직접 제공합니다. 또한 라라벨이 제공하는 기존 [이벤트 브로드캐스팅 도구](/docs/11.x/broadcasting)와도 완벽하게 통합됩니다.

<a name="installation"></a>
## 설치

Reverb는 `install:broadcasting` 아티즌 명령어를 사용해 설치할 수 있습니다.

```
php artisan install:broadcasting
```

<a name="configuration"></a>
## 구성

사실상, `install:broadcasting` 아티즌 명령어는 내부적으로 `reverb:install` 명령어를 실행하여 기본적으로 적절한 설정 옵션을 사용해 Reverb를 설치합니다. 만약 설정을 변경하고 싶다면, Reverb 관련 환경 변수나 `config/reverb.php` 설정 파일을 수정하면 됩니다.

<a name="application-credentials"></a>
### 애플리케이션 자격 증명

Reverb에 연결하기 위해서는 클라이언트와 서버 간에 Reverb "애플리케이션" 자격 증명 세트가 교환되어야 합니다. 이 자격 증명은 서버에서 설정하며, 클라이언트의 요청을 검증하는 데 사용됩니다. 아래 환경 변수로 자격 증명을 설정할 수 있습니다.

```ini
REVERB_APP_ID=my-app-id
REVERB_APP_KEY=my-app-key
REVERB_APP_SECRET=my-app-secret
```

<a name="allowed-origins"></a>
### 허용된 오리진

클라이언트 요청을 허용할 오리진을 지정하려면, `config/reverb.php` 설정 파일의 `apps` 섹션 안에 있는 `allowed_origins` 값을 수정하면 됩니다. 명시되지 않은 오리진에서 들어오는 모든 요청은 거부됩니다. 모든 오리진을 허용하려면 `*` 를 사용할 수 있습니다.

```php
'apps' => [
    [
        'app_id' => 'my-app-id',
        'allowed_origins' => ['laravel.com'],
        // ...
    ]
]
```

<a name="additional-applications"></a>
### 추가 애플리케이션

일반적으로 Reverb는 설치된 애플리케이션에 대해 WebSocket 서버를 제공합니다. 하지만 단일 Reverb 설치로 여러 애플리케이션을 동시에 서비스할 수도 있습니다.

예를 들어, 단일 라라벨 애플리케이션이 여러 애플리케이션을 위해 Reverb를 통해 WebSocket 연결을 제공하도록 운영할 수 있습니다. 이를 위해서는 애플리케이션의 `config/reverb.php` 설정 파일에 여러 개의 `apps`를 정의하면 됩니다.

```php
'apps' => [
    [
        'app_id' => 'my-app-one',
        // ...
    ],
    [
        'app_id' => 'my-app-two',
        // ...
    ],
],
```

<a name="ssl"></a>
### SSL

대부분의 경우, WebSocket 보안 연결(SSL/TLS)은 요청이 Reverb 서버로 프록시되기 전에 Nginx 등 업스트림 웹 서버가 처리합니다.

하지만, 로컬 개발 환경과 같이 Reverb 서버가 직접 보안 연결을 처리해야 하는 상황도 있을 수 있습니다. 만약 [Laravel Herd](https://herd.laravel.com)의 보안 사이트 기능을 사용하거나 [Laravel Valet](/docs/11.x/valet)에서 [secure 명령어](/docs/11.x/valet#securing-sites)를 실행해 애플리케이션을 보호했다면, Herd 또는 Valet이 사이트를 위해 생성한 인증서를 Reverb 연결에도 사용할 수 있습니다. 이 경우, `REVERB_HOST` 환경 변수를 사이트의 호스트명으로 지정하거나, Reverb 서버를 시작할 때 명령어 옵션으로 직접 호스트명을 지정합니다.

```sh
php artisan reverb:start --host="0.0.0.0" --port=8080 --hostname="laravel.test"
```

Herd 및 Valet 도메인은 `localhost`로 연결되므로, 위와 같이 명령어를 실행하면 Reverb 서버에 보안 WebSocket 프로토콜(`wss`)로 `wss://laravel.test:8080`을 통해 접근할 수 있습니다.

또는, 애플리케이션의 `config/reverb.php` 설정 파일에서 `tls` 옵션을 추가해 인증서를 직접 지정할 수도 있습니다. `tls` 옵션 배열에는 [PHP의 SSL 컨텍스트 옵션](https://www.php.net/manual/en/context.ssl.php)에서 지원하는 모든 옵션을 사용할 수 있습니다.

```php
'options' => [
    'tls' => [
        'local_cert' => '/path/to/cert.pem'
    ],
],
```

<a name="running-server"></a>
## 서버 실행하기

Reverb 서버는 `reverb:start` 아티즌 명령어로 실행할 수 있습니다.

```sh
php artisan reverb:start
```

기본적으로 Reverb 서버는 `0.0.0.0:8080`에서 시작되며, 모든 네트워크 인터페이스에서 접근할 수 있습니다.

만약 별도의 호스트나 포트를 지정하고 싶다면 서버 시작 시 `--host` 와 `--port` 옵션을 쓸 수 있습니다.

```sh
php artisan reverb:start --host=127.0.0.1 --port=9000
```

또는, 애플리케이션의 `.env` 설정 파일에 `REVERB_SERVER_HOST`와 `REVERB_SERVER_PORT` 환경 변수를 지정할 수 있습니다.

`REVERB_SERVER_HOST`, `REVERB_SERVER_PORT` 환경 변수는 `REVERB_HOST`, `REVERB_PORT`와 혼동해서는 안 됩니다. 전자는 Reverb 서버 자체가 실행될 호스트와 포트를 지정하고, 후자는 라라벨이 브로드캐스트 메시지를 보낼 위치를 알려주는 역할을 합니다. 예를 들어 운영 환경에서는, 공개 Reverb 호스트네임의 `443` 포트로 들어온 요청을 실제 동작 중인 `0.0.0.0:8080`의 Reverb 서버로 프록시 할 수 있습니다. 이때 환경 변수는 아래와 같이 설정합니다.

```ini
REVERB_SERVER_HOST=0.0.0.0
REVERB_SERVER_PORT=8080

REVERB_HOST=ws.laravel.com
REVERB_PORT=443
```

<a name="debugging"></a>
### 디버깅

성능 향상을 위해, Reverb는 기본적으로 어떠한 디버그 정보도 출력하지 않습니다. 서버를 통과하는 데이터 스트림을 확인하고 싶다면, `reverb:start` 명령어에 `--debug` 옵션을 추가하면 됩니다.

```sh
php artisan reverb:start --debug
```

<a name="restarting"></a>
### 재시작

Reverb는 장시간 동작하는 프로세스이기 때문에, 코드 변경 사항이 서버에 바로 반영되지 않습니다. 따라서, 서버 코드를 변경한 경우 `reverb:restart` 아티즌 명령어로 서버를 재시작해야 합니다.

`reverb:restart` 명령어는 서버를 중지하기 전에 모든 연결이 정상적으로 종료될 수 있도록 처리합니다. 만약 Supervisor와 같은 프로세스 관리 도구를 사용해 Reverb를 실행 중이라면, 모든 연결이 종료된 후 프로세스 관리자에 의해 서버가 자동으로 재시작됩니다.

```sh
php artisan reverb:restart
```

<a name="monitoring"></a>
## 모니터링

Reverb는 [Laravel Pulse](/docs/11.x/pulse)와의 통합을 통해 서버의 연결 수와 메시지 처리 현황을 모니터링할 수 있습니다.

통합을 활성화하려면, 먼저 [Pulse를 설치](/docs/11.x/pulse#installation)한 뒤, Reverb의 recorder를 애플리케이션의 `config/pulse.php` 설정 파일에 추가해야 합니다.

```php
use Laravel\Reverb\Pulse\Recorders\ReverbConnections;
use Laravel\Reverb\Pulse\Recorders\ReverbMessages;

'recorders' => [
    ReverbConnections::class => [
        'sample_rate' => 1,
    ],

    ReverbMessages::class => [
        'sample_rate' => 1,
    ],

    ...
],
```

그리고 각각의 recorder에 맞는 Pulse 카드를 [Pulse 대시보드](/docs/11.x/pulse#dashboard-customization)에 추가합니다.

```blade
<x-pulse>
    <livewire:reverb.connections cols="full" />
    <livewire:reverb.messages cols="full" />
    ...
</x-pulse>
```

연결 활동 정보는 주기적으로 새로운 업데이트를 폴링하여 기록됩니다. Pulse 대시보드에 이 정보가 올바르게 표시되려면, Reverb 서버에서 `pulse:check` 데몬을 반드시 실행해야 합니다. 만약 [수평 확장(스케일링)](#scaling) 환경에서 여러 대의 서버를 운영하고 있다면, 데몬은 하나의 서버에서만 실행하면 됩니다.

<a name="production"></a>
## 운영 환경에서 리버브 실행하기

WebSocket 서버의 특성상 오랜 시간 실행되는 프로세스이므로, 서버의 자원(메모리 등) 상황에서 적절한 연결 수를 효과적으로 처리할 수 있도록 서버와 호스팅 환경에 몇 가지 최적화가 필요합니다.

> [!NOTE]  
> 여러분의 사이트를 [Laravel Forge](https://forge.laravel.com)에서 관리 중이라면, "Application" 패널에서 Reverb 통합 기능을 활성화하여 서버를 자동으로 최적화할 수 있습니다. 해당 통합을 켜면 Forge에서 필요한 확장 프로그램 설치와 연결 수 한도 조정까지 자동으로 처리해주어 운영 환경 준비가 완료됩니다.

<a name="open-files"></a>
### 오픈 파일

각 WebSocket 연결은 클라이언트나 서버에서 연결이 끊길 때까지 메모리에 유지됩니다. 유닉스 계열 환경에서는 각 연결이 파일로 취급되며, 시스템 및 애플리케이션 레벨에서 열 수 있는 파일 수에 제한이 있을 수 있습니다.

<a name="operating-system"></a>
#### 운영체제

유닉스 기반 운영체제에서는 `ulimit` 명령어로 허용된 열 수 있는 파일 개수를 확인할 수 있습니다.

```sh
ulimit -n
```

이 명령어로 사용자의 오픈 파일 수 제한을 확인할 수 있습니다. 값을 수정하려면 `/etc/security/limits.conf` 파일을 편집하면 됩니다. 예를 들어, `forge` 사용자의 오픈 파일 수를 10,000개로 늘리려면 다음과 같이 작성합니다.

```ini
# /etc/security/limits.conf
forge        soft  nofile  10000
forge        hard  nofile  10000
```

<a name="event-loop"></a>
### 이벤트 루프

Reverb는 서버에서 WebSocket 연결을 관리하기 위해 ReactPHP 이벤트 루프를 사용합니다. 기본적으로 이 이벤트 루프는 `stream_select` 기반으로 동작하며, 별도의 확장 프로그램 없이 사용할 수 있습니다. 하지만, `stream_select`는 일반적으로 1,024개의 오픈 파일 제한을 가지므로, 1,000개가 넘는 동시 연결을 처리하려면 이러한 제약이 없는 다른 이벤트 루프를 사용해야 합니다.

Reverb는 `ext-uv` 확장 프로그램이 설치되어 있는 경우 자동으로 해당 로프로 전환합니다. 이 PHP 확장은 PECL을 통해 설치할 수 있습니다.

```sh
pecl install uv
```

<a name="web-server"></a>
### 웹 서버

일반적으로 리버브는 서버의 외부에서 바로 접근할 수 없는 포트에서 동작합니다. 따라서 트래픽을 리버브로 전달하려면 리버스 프록시를 설정해야 합니다. Reverb가 `0.0.0.0`의 `8080` 포트에서 동작하고, 서버에 Nginx 웹서버를 사용하고 있다면, 아래와 같이 Nginx 사이트 설정에서 리버스 프록시를 지정할 수 있습니다.

```nginx
server {
    ...

    location / {
        proxy_http_version 1.1;
        proxy_set_header Host $http_host;
        proxy_set_header Scheme $scheme;
        proxy_set_header SERVER_PORT $server_port;
        proxy_set_header REMOTE_ADDR $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";

        proxy_pass http://0.0.0.0:8080;
    }

    ...
}
```

> [!WARNING]  
> Reverb는 `/app`에서 WebSocket 연결을 받고 `/apps`에서 API 요청을 처리합니다. Reverb 연결을 처리하는 웹 서버가 두 URI 모두를 지원할 수 있도록 설정해야 합니다. [Laravel Forge](https://forge.laravel.com)에서 서버를 관리 중이라면, 기본적으로 Reverb 서버가 올바르게 구성됩니다.

일반적으로 웹 서버는 서버 과부하를 방지하기 위해 연결 수에 제한을 두고 있습니다. 만약 Nginx 웹 서버에서 연결 수를 10,000개까지 늘리고 싶다면, `nginx.conf` 파일에서 `worker_rlimit_nofile` 및 `worker_connections` 값을 다음과 같이 수정해야 합니다.

```nginx
user forge;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;
worker_rlimit_nofile 10000;

events {
  worker_connections 10000;
  multi_accept on;
}
```

위 설정은 프로세스당 Nginx 워커를 최대 10,000개까지 사용할 수 있게 하며, 동시에 Nginx의 오픈 파일 제한도 10,000개로 맞춰줍니다.

<a name="ports"></a>
### 포트

유닉스 기반 운영체제는 서버에서 오픈할 수 있는 포트의 개수에도 제한이 있습니다. 현재 허용된 포트 범위는 다음 명령어로 확인 가능합니다.

 ```sh
cat /proc/sys/net/ipv4/ip_local_port_range
# 32768	60999
```

위와 같은 출력이라면, 서버는 최대 28,231개(60,999 - 32,768)의 연결을 동시에 처리할 수 있습니다. 각 연결마다 하나의 포트가 필요하기 때문입니다. 더 많은 연결을 지원하려면 [수평 확장(스케일링)](#scaling)을 권장하지만, 서버의 `/etc/sysctl.conf` 파일에서 허용 포트 범위를 늘려 더 많은 포트를 사용할 수도 있습니다.

<a name="process-management"></a>
### 프로세스 관리

대부분의 경우, Reverb 서버가 항상 실행 상태를 유지하도록 Supervisor와 같은 프로세스 관리 도구를 이용하는 것이 좋습니다. Supervisor로 Reverb를 실행하는 경우, `supervisor.conf` 파일의 `minfds` 설정을 늘려서 Supervisor가 연결을 관리하는데 필요한 만큼 파일을 열 수 있도록 해야 합니다.

```ini
[supervisord]
...
minfds=10000
```

<a name="scaling"></a>
### 스케일링

단일 서버에서 허용 가능한 연결 수가 부족하다면, Reverb 서버를 수평 확장(여러 대로 분산)할 수 있습니다. Redis의 pub/sub 기능을 활용해, 여러 서버에서 연결을 동시에 관리할 수 있습니다. 메시지가 애플리케이션의 어떤 Reverb 서버에 도착하더라도, 해당 서버가 Redis를 통해 다른 모든 서버에도 메시지를 전달합니다.

수평 확장을 활성화하려면, 애플리케이션의 `.env` 설정 파일에 `REVERB_SCALING_ENABLED` 환경 변수를 `true`로 지정하세요.

```env
REVERB_SCALING_ENABLED=true
```

그리고 모든 Reverb 서버가 통신할 수 있게, 하나의 중앙 Redis 서버를 반드시 운영해야 합니다. 메시지 전파에는 [애플리케이션에서 기본으로 설정한 Redis 연결](/docs/11.x/redis#configuration)이 자동으로 사용됩니다.

이제 리버브 스케일링 옵션과 Redis 서버를 준비했다면, Redis 서버와 통신 가능한 여러 서버에서 동시에 `reverb:start` 명령어를 실행하면 됩니다. 이들 Reverb 서버는 반드시 로드밸런서 뒤에 위치하여, 들어오는 요청이 서버들 사이에 고르게 분산되도록 해야 합니다.
