# 라라벨 리버브 (Laravel Reverb)

- [소개](#introduction)
- [설치](#installation)
- [설정](#configuration)
    - [애플리케이션 인증 정보](#application-credentials)
    - [허용된 오리진](#allowed-origins)
    - [추가 애플리케이션](#additional-applications)
    - [SSL](#ssl)
- [서버 실행](#running-server)
    - [디버깅](#debugging)
    - [재시작](#restarting)
- [모니터링](#monitoring)
- [프로덕션 환경에서 Reverb 실행](#production)
    - [Open Files](#open-files)
    - [이벤트 루프](#event-loop)
    - [웹 서버](#web-server)
    - [포트](#ports)
    - [프로세스 관리](#process-management)
    - [스케일링](#scaling)

<a name="introduction"></a>
## 소개

[Laravel Reverb](https://github.com/laravel/reverb)는 라라벨 애플리케이션에 초고속, 확장성 높은 실시간 WebSocket 통신을 직접 제공하며, 라라벨의 기존 [이벤트 브로드캐스팅 도구](/docs/12.x/broadcasting)와도 완벽하게 통합됩니다.

<a name="installation"></a>
## 설치

`install:broadcasting` 아티즌 명령어를 사용하여 Reverb를 설치할 수 있습니다.

```shell
php artisan install:broadcasting
```

<a name="configuration"></a>
## 설정

`install:broadcasting` 아티즌 명령어는 내부적으로 `reverb:install` 명령어를 실행하여 Reverb를 합리적인 기본 설정 옵션과 함께 설치합니다. 설정을 변경하고 싶다면, Reverb의 환경 변수 또는 `config/reverb.php` 설정 파일을 수정하면 됩니다.

<a name="application-credentials"></a>
### 애플리케이션 인증 정보

클라이언트가 Reverb에 연결하기 위해서는 클라이언트와 서버 사이에 Reverb "애플리케이션" 인증 정보가 교환되어야 합니다. 이 인증 정보는 서버에서 설정되며, 클라이언트의 요청을 검증하는 데 사용됩니다. 다음 환경 변수들을 통해 인증 정보를 정의할 수 있습니다.

```ini
REVERB_APP_ID=my-app-id
REVERB_APP_KEY=my-app-key
REVERB_APP_SECRET=my-app-secret
```

<a name="allowed-origins"></a>
### 허용된 오리진

클라이언트 요청을 허용할 오리진(origin)을 지정하고 싶다면 `config/reverb.php` 파일의 `apps` 섹션 안에 있는 `allowed_origins` 설정 값을 수정하면 됩니다. 허용 오리진에 포함되지 않은 오리진에서 오는 요청은 모두 거부됩니다. 모든 오리진을 허용하려면 `*`를 사용할 수 있습니다.

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

일반적으로 Reverb는 설치된 애플리케이션만을 위한 WebSocket 서버를 제공합니다. 그러나 하나의 Reverb 인스턴스를 통해 여러 애플리케이션에 서비스를 제공하는 것도 가능합니다.

예를 들어, 하나의 라라벨 애플리케이션에서 Reverb를 통해 여러 개의 애플리케이션에 WebSocket 연결을 제공하고 싶을 수 있습니다. 이를 위해서는 애플리케이션의 `config/reverb.php` 파일에서 여러 개의 `apps`를 정의하면 됩니다.

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

대부분의 경우, 보안 WebSocket 연결은 요청이 Reverb 서버로 프록시되기 전에 상위 웹 서버(Nginx 등)에서 처리됩니다.

하지만, 로컬 개발 환경 등에서는 Reverb 서버가 직접 보안 연결을 처리해야 할 때도 있습니다. [Laravel Herd](https://herd.laravel.com)의 보안 사이트 기능을 사용 중이거나, [Laravel Valet](/docs/12.x/valet)를 사용하면서 [secure 명령어](/docs/12.x/valet#securing-sites)로 애플리케이션을 보안 처리한 경우, 해당 사이트의 Herd/Valet 인증서를 이용해 Reverb 연결을 보호할 수 있습니다. 이를 위해 `REVERB_HOST` 환경 변수를 사이트 호스트명으로 설정하거나, Reverb 서버를 시작할 때 —hostname 옵션으로 명시적으로 지정해야 합니다.

```shell
php artisan reverb:start --host="0.0.0.0" --port=8080 --hostname="laravel.test"
```

Herd와 Valet 도메인은 `localhost`로 resolve되기 때문에 위와 같이 실행하면 Reverb 서버에 보안 WebSocket 프로토콜(`wss`)로 `wss://laravel.test:8080` 주소를 통해 접속할 수 있습니다.

또한 원하는 인증서를 직접 선택하려면 애플리케이션의 `config/reverb.php` 파일에서 `tls` 옵션을 추가하면 됩니다. `tls` 옵션 배열에는 [PHP의 SSL context 옵션](https://www.php.net/manual/en/context.ssl.php)에 해당하는 값을 지정할 수 있습니다.

```php
'options' => [
    'tls' => [
        'local_cert' => '/path/to/cert.pem'
    ],
],
```

<a name="running-server"></a>
## 서버 실행

Reverb 서버는 `reverb:start` 아티즌 명령어로 실행할 수 있습니다.

```shell
php artisan reverb:start
```

기본적으로 Reverb 서버는 `0.0.0.0:8080`에서 시작되며, 모든 네트워크 인터페이스에서 접근 가능합니다.

특정 호스트나 포트를 지정하고 싶다면 서버를 시작할 때 `--host`와 `--port` 옵션을 사용할 수 있습니다.

```shell
php artisan reverb:start --host=127.0.0.1 --port=9000
```

또는 애플리케이션의 `.env` 설정 파일에 `REVERB_SERVER_HOST`와 `REVERB_SERVER_PORT` 환경 변수를 지정할 수도 있습니다.

`REVERB_SERVER_HOST`와 `REVERB_SERVER_PORT` 환경 변수는 `REVERB_HOST`, `REVERB_PORT`와 혼동하면 안 됩니다. 전자는 실제로 Reverb 서버를 구동할 호스트와 포트에 대한 설정이고, 후자는 라라벨이 브로드캐스트 메시지를 전송할 위치를 지정하는 값입니다. 예를 들어, 운영 환경에서는 공용 Reverb 호스트네임의 443 포트에서 요청을 받아, `0.0.0.0:8080`에서 동작하는 Reverb 서버로 라우팅할 수 있습니다. 이 경우 환경 변수는 아래와 같이 설정할 수 있습니다.

```ini
REVERB_SERVER_HOST=0.0.0.0
REVERB_SERVER_PORT=8080

REVERB_HOST=ws.laravel.com
REVERB_PORT=443
```

<a name="debugging"></a>
### 디버깅

성능 향상을 위해 Reverb는 기본적으로 디버그 정보를 출력하지 않습니다. 서버를 통해 흐르는 데이터 스트림을 확인하고 싶다면 `reverb:start` 명령어에 `--debug` 옵션을 추가할 수 있습니다.

```shell
php artisan reverb:start --debug
```

<a name="restarting"></a>
### 재시작

Reverb는 장시간 실행되는 프로세스이기 때문에, 코드에 변경이 생길 경우 서버를 재시작해야 변경 사항이 적용됩니다. 재시작은 `reverb:restart` 아티즌 명령어를 통해 할 수 있습니다.

`reverb:restart` 명령어는 모든 연결을 안전하게 종료한 후 서버를 중지시킵니다. Supervisor 등 프로세스 관리자로 Reverb를 구동 중이라면, 모든 연결 종료 후 서버가 자동으로 재시작됩니다.

```shell
php artisan reverb:restart
```

<a name="monitoring"></a>
## 모니터링

Reverb는 [Laravel Pulse](/docs/12.x/pulse)와의 통합을 통해 모니터링할 수 있습니다. Pulse 통합을 활성화하면, 서버가 처리하는 연결 수 및 메시지 수를 추적할 수 있습니다.

이 통합을 사용하려면 먼저 [Pulse를 설치](/docs/12.x/pulse#installation)해야 합니다. 그 후, Reverb의 레코더(recorders)를 애플리케이션의 `config/pulse.php` 설정 파일에 추가합니다.

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

    // ...
],
```

그리고 각 레코더에 해당하는 Pulse 카드(cards)를 [Pulse 대시보드](/docs/12.x/pulse#dashboard-customization)에 추가합니다.

```blade
<x-pulse>
    <livewire:reverb.connections cols="full" />
    <livewire:reverb.messages cols="full" />
    ...
</x-pulse>
```

연결 활동 정보는 주기적으로 업데이트를 폴링(polling)하여 기록됩니다. 이 정보가 Pulse 대시보드에 올바르게 표시되도록 하려면, Reverb 서버에서 `pulse:check` 데몬을 실행해야 합니다. [수평 스케일링](#scaling) 환경에서는 여러 서버 중 한 곳에서만 이 데몬을 실행해야 합니다.

<a name="production"></a>
## 프로덕션 환경에서 Reverb 실행

WebSocket 서버는 장시간 실행되는 특성이 있기 때문에, Reverb 서버가 가능한 최적의 연결 수를 처리할 수 있도록 서버 및 호스팅 환경을 최적화해야 할 수 있습니다.

> [!NOTE]
> 사이트가 [Laravel Forge](https://forge.laravel.com)로 관리되는 경우, "Application" 패널에서 Reverb 통합을 활성화하면 서버가 자동으로 최적화됩니다. 이 과정에는 필요한 확장 설치, 동시 연결 수 증가 등 프로덕션 준비 작업이 포함됩니다.

<a name="open-files"></a>
### Open Files

각 WebSocket 연결은 클라이언트 또는 서버가 연결을 해제할 때까지 메모리에 유지됩니다. 유닉스 및 유닉스 계열 환경에서는 각각의 연결이 파일로 표현됩니다. 하지만 운영체제와 애플리케이션 레벨 모두에서 허용 가능한 열린 파일 수에 제한이 있습니다.

<a name="operating-system"></a>
#### 운영체제

유닉스 기반 운영체제에서 허용되는 열린 파일 수는 `ulimit` 명령어로 확인할 수 있습니다.

```shell
ulimit -n
```

이 명령어는 여러 사용자에 대해 열린 파일 제한을 보여줍니다. 제한값 변경은 `/etc/security/limits.conf` 파일을 직접 수정해서 할 수 있습니다. 예를 들어, `forge` 사용자에 대해 열린 파일 최대치를 10,000으로 변경하려면 아래와 같이 설정합니다.

```ini
# /etc/security/limits.conf
forge        soft  nofile  10000
forge        hard  nofile  10000
```

<a name="event-loop"></a>
### 이벤트 루프

Reverb는 내부적으로 ReactPHP 이벤트 루프를 사용해 서버의 WebSocket 연결을 관리합니다. 기본적으로는 별도의 확장 없이 동작하는 `stream_select`로 작동하지만, `stream_select`는 일반적으로 1,024개의 열린 파일만 지원합니다. 따라서 1,000개 이상의 동시 연결을 처리하려면 이 제한에 묶이지 않는 대안 이벤트 루프가 필요합니다.

Reverb는 `ext-uv` 확장이 있으면 자동으로 해당 루프를 사용합니다. 해당 PHP 확장은 PECL을 통해 설치할 수 있습니다.

```shell
pecl install uv
```

<a name="web-server"></a>
### 웹 서버

일반적으로 Reverb는 서버의 외부에서 접근할 수 없는 포트에서 실행됩니다. 때문에 Reverb로 트래픽을 전달하려면 역방향 프록시(reverse proxy) 설정이 필요합니다. 예를 들어 Reverb가 `0.0.0.0`의 8080 포트에서 동작하고, 서버에서 Nginx를 사용하는 경우 다음과 같은 Nginx 사이트 설정으로 리버브 서버에 대한 프록시를 만들 수 있습니다.

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
> Reverb는 `/app` 경로에서 WebSocket 연결 요청을 받고, `/apps` 경로에서 API 요청을 처리합니다. 따라서 Reverb 요청을 처리하는 웹 서버가 이 두 URI 모두를 제공할 수 있어야 합니다. [Laravel Forge](https://forge.laravel.com)로 서버를 관리한다면, Reverb 서버는 기본적으로 올바르게 설정되어 있습니다.

웹 서버는 대량의 연결로 과부하되는 것을 방지하기 위해 일반적으로 제한을 둡니다. Nginx에서 동시 연결 허용량을 10,000으로 늘리려면 `nginx.conf`의 `worker_rlimit_nofile`과 `worker_connections` 값을 업데이트해야 합니다.

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

위 설정은 프로세스당 최대 10,000개의 Nginx 워커가 생성될 수 있도록 하며, Nginx의 열린 파일 수 제한도 10,000으로 설정합니다.

<a name="ports"></a>
### 포트

유닉스 기반 운영체제는 서버에서 열 수 있는 포트의 개수에도 제한을 둡니다. 현재 허용 범위는 다음 명령어로 확인할 수 있습니다.

```shell
cat /proc/sys/net/ipv4/ip_local_port_range
# 32768	60999
```

위 출력은 각 연결당 포트가 필요하므로 최대 28,231개(60,999 - 32,768)의 연결을 지원할 수 있음을 보여줍니다. 더 많은 연결을 처리하려면 [수평 스케일링](#scaling)을 권장하지만, `/etc/sysctl.conf`에서 허용 포트 범위를 확장하여 열린 포트 수를 늘릴 수도 있습니다.

<a name="process-management"></a>
### 프로세스 관리

대부분의 경우, Supervisor 같은 프로세스 관리자를 사용해 Reverb 서버가 항상 실행되도록 관리하는 것이 좋습니다. Supervisor를 사용하는 경우 접속 처리에 필요한 파일을 충분히 열 수 있도록 `supervisor.conf` 파일의 `minfds` 값을 설정해야 합니다.

```ini
[supervisord]
...
minfds=10000
```

<a name="scaling"></a>
### 스케일링

하나의 서버만으로 처리할 수 있는 연결 수가 부족할 경우, Reverb 서버를 수평 확장할 수 있습니다. Redis의 pub/sub 기능을 활용해 여러 서버에서 연결을 관리할 수 있습니다. 애플리케이션의 Reverb 서버 중 한 곳에서 메시지를 수신하면, 해당 서버가 Redis를 통해 메시지를 모든 다른 서버에 전달하게 됩니다.

수평 스케일링을 활성화하려면 애플리케이션의 `.env` 파일에 `REVERB_SCALING_ENABLED` 환경 변수를 `true`로 설정해야 합니다.

```env
REVERB_SCALING_ENABLED=true
```

그 다음, 모든 Reverb 서버가 통신할 수 있는 전용 중앙 Redis 서버가 필요합니다. Reverb는 [애플리케이션에 설정된 기본 Redis 연결](/docs/12.x/redis#configuration)을 사용해 모든 Reverb 서버로 메시지를 브로드캐스트합니다.

스케일링 옵션을 활성화하고 Redis 서버를 구성했다면, Redis 서버와 통신 가능한 여러 서버에서 `reverb:start` 명령어를 실행하면 됩니다. 이때 Reverb 서버들은 로드 밸런서를 통해 요청이 고르게 분산되도록 구성해야 합니다.
