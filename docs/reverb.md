# 라라벨 리버브 (Laravel Reverb)

- [소개](#introduction)
- [설치](#installation)
- [설정](#configuration)
    - [애플리케이션 인증 정보](#application-credentials)
    - [허용된 Origin](#allowed-origins)
    - [추가 애플리케이션](#additional-applications)
    - [SSL](#ssl)
- [서버 실행](#running-server)
    - [디버깅](#debugging)
    - [재시작](#restarting)
- [모니터링](#monitoring)
- [프로덕션 환경에서 리버브 실행하기](#production)
    - [Open Files](#open-files)
    - [이벤트 루프](#event-loop)
    - [웹 서버](#web-server)
    - [포트](#ports)
    - [프로세스 관리](#process-management)
    - [스케일링](#scaling)

<a name="introduction"></a>
## 소개

[Laravel Reverb](https://github.com/laravel/reverb)는 초고속이면서 확장 가능한 실시간 WebSocket 통신을 라라벨 애플리케이션에 직접 제공하며, 라라벨이 기본으로 제공하는 [이벤트 브로드캐스팅 도구](/docs/broadcasting)와도 완벽하게 통합되어 작동합니다.

<a name="installation"></a>
## 설치

Reverb는 `install:broadcasting` 아티즌 명령어를 사용해 설치할 수 있습니다.

```shell
php artisan install:broadcasting
```

<a name="configuration"></a>
## 설정

내부적으로, `install:broadcasting` 아티즌 명령어는 `reverb:install` 명령어를 실행하여 Reverb를 합리적인 기본 설정값으로 설치합니다. 별도의 설정 변경이 필요하다면, Reverb의 환경 변수나 `config/reverb.php` 설정 파일을 수정하여 원하는 대로 설정할 수 있습니다.

<a name="application-credentials"></a>
### 애플리케이션 인증 정보

Reverb에 연결하려면, 클라이언트와 서버간에 Reverb "애플리케이션" 인증 정보를 교환해야 합니다. 이 인증 정보는 서버에 설정하며, 클라이언트로부터 요청이 올 때 해당 요청을 검증하는 데 사용됩니다. 다음과 같은 환경 변수를 사용해 인증 정보를 정의할 수 있습니다.

```ini
REVERB_APP_ID=my-app-id
REVERB_APP_KEY=my-app-key
REVERB_APP_SECRET=my-app-secret
```

<a name="allowed-origins"></a>
### 허용된 Origin

클라이언트 요청이 허용될 수 있는 Origin(출처)의 목록도 정의할 수 있습니다. 이 값은 `config/reverb.php` 파일의 `apps` 항목 안에 있는 `allowed_origins` 설정값을 변경하여 지정합니다. 허용된 Origin에 포함되지 않은 곳에서의 요청은 거부됩니다. 모든 Origin을 허용하고 싶다면 `*`로 설정할 수 있습니다.

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

일반적으로 Reverb는 자신이 설치된 애플리케이션을 위한 WebSocket 서버를 제공합니다. 하지만, 하나의 Reverb 설치로 여러 애플리케이션에 서비스를 제공하는 것도 가능합니다.

예를 들어, 하나의 라라벨 애플리케이션이 있고, 이 애플리케이션에서 Reverb를 통해 여러 애플리케이션에 WebSocket 연결을 제공하고 싶을 수 있습니다. 이럴 때는, 애플리케이션의 `config/reverb.php` 설정 파일의 `apps` 항목에 여러 개의 앱 정보를 정의하면 됩니다.

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

대부분의 경우, 보안 WebSocket 연결은 상위 웹 서버(Nginx 등)가 먼저 처리한 뒤, 해당 요청을 Reverb 서버로 프록시합니다.

다만, 로컬 개발처럼 리버브 서버 자체에서 보안 연결을 직접 처리하고 싶을 때도 있습니다. [Laravel Herd](https://herd.laravel.com)의 사이트 보안 설정을 사용하거나, [Laravel Valet](/docs/valet)에서 [secure 명령어](/docs/valet#securing-sites)로 애플리케이션을 보호한 경우, 사이트를 위해 생성된 Herd/Valet 인증서를 리버브 보안 연결에도 이용할 수 있습니다. 이를 위해서는 `REVERB_HOST` 환경 변수를 사이트의 호스트명으로 지정하거나, 리버브 서버 시작 시 명시적으로 호스트네임 옵션을 전달하면 됩니다.

```shell
php artisan reverb:start --host="0.0.0.0" --port=8080 --hostname="laravel.test"
```

Herd 및 Valet 도메인은 `localhost`로 연결되기 때문에, 위 명령어를 실행하면 Reverb 서버는 보안 WebSocket 프로토콜(`wss`)을 통해 `wss://laravel.test:8080`에서 접근할 수 있습니다.

또는, 애플리케이션의 `config/reverb.php` 설정 파일의 `tls` 옵션 배열에서 인증서를 직접 지정할 수도 있습니다. `tls` 옵션에서는 [PHP의 SSL 컨텍스트 옵션](https://www.php.net/manual/en/context.ssl.php)에서 지원하는 값을 사용할 수 있습니다.

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

기본적으로 리버브 서버는 `0.0.0.0:8080`에서 시작되며, 모든 네트워크 인터페이스에서 접속이 가능합니다.

별도의 호스트나 포트를 지정하고 싶다면, 서버 시작 시 `--host`와 `--port` 옵션으로 설정할 수 있습니다.

```shell
php artisan reverb:start --host=127.0.0.1 --port=9000
```

또는, 애플리케이션의 `.env` 설정 파일에서 `REVERB_SERVER_HOST`와 `REVERB_SERVER_PORT` 환경 변수를 지정할 수도 있습니다.

`REVERB_SERVER_HOST`와 `REVERB_SERVER_PORT` 환경 변수는 `REVERB_HOST`와 `REVERB_PORT`와 혼동해서는 안 됩니다. `REVERB_SERVER_HOST`와 `REVERB_SERVER_PORT`는 리버브 서버 자체가 실제로 듣고 있는 호스트와 포트를 의미하고, `REVERB_HOST`와 `REVERB_PORT`는 라라벨이 브로드캐스트 메시지를 보낼 대상(호스트/포트)입니다. 예를 들어, 프로덕션 환경에서 퍼블릭한 Reverb 호스트 네임의 443번 포트로 들어온 요청을 `0.0.0.0:8080`에서 실행 중인 리버브 서버로 라우팅할 수 있습니다. 이 경우, 환경 변수는 다음과 같이 지정합니다.

```ini
REVERB_SERVER_HOST=0.0.0.0
REVERB_SERVER_PORT=8080

REVERB_HOST=ws.laravel.com
REVERB_PORT=443
```

<a name="debugging"></a>
### 디버깅

리버브는 성능 향상을 위해 기본적으로 디버그 정보를 출력하지 않습니다. Reverb 서버를 거치는 데이터 스트림을 직접 보고 싶다면, `reverb:start` 명령어에 `--debug` 옵션을 추가해 실행하면 됩니다.

```shell
php artisan reverb:start --debug
```

<a name="restarting"></a>
### 재시작

Reverb는 장시간 실행되는 프로세스이므로, 코드를 수정해도 서버를 재시작하지 않으면 변경사항이 반영되지 않습니다. 코드를 수정한 경우 `reverb:restart` 아티즌 명령어로 서버를 재시작해야 합니다.

`reverb:restart` 명령어는 모든 연결을 부드럽게 종료한 뒤 서버를 멈춥니다. Supervisor 등과 같은 프로세스 관리자로 Reverb를 실행하는 경우, 모든 연결이 종료된 후 프로세스 관리자가 서버를 자동으로 재시작해줍니다.

```shell
php artisan reverb:restart
```

<a name="monitoring"></a>
## 모니터링

리버브는 [Laravel Pulse](/docs/pulse)와의 통합 monitoring을 지원합니다. Reverb의 Pulse 통합을 활성화하면 서버에서 처리되는 연결과 메시지의 개수를 손쉽게 추적할 수 있습니다.

통합을 활성화하려면 먼저 [Pulse를 설치](/docs/pulse#installation)했는지 확인하세요. 그런 다음, 애플리케이션의 `config/pulse.php` 설정 파일에 Reverb의 리코더를 등록합니다.

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

다음으로, 각 리코더에 대한 Pulse 카드를 [Pulse 대시보드](/docs/pulse#dashboard-customization)에 추가합니다.

```blade
<x-pulse>
    <livewire:reverb.connections cols="full" />
    <livewire:reverb.messages cols="full" />
    ...
</x-pulse>
```

연결 활동 정보는 주기적으로 업데이트를 폴링하여 기록됩니다. Pulse 대시보드에서 이 정보가 올바르게 표시되게 하려면, Reverb 서버에서 `pulse:check` 데몬을 실행해야 합니다. 만약 [수평 확장](#scaling) 구성을 사용 중이라면, 여러 서버 중 한 서버에서만 이 데몬을 실행해야 합니다.

<a name="production"></a>
## 프로덕션 환경에서 리버브 실행하기

WebSocket 서버 특성상 장시간 실행되기 때문에, Reverb 서버가 사용 가능한 리소스 내에서 최적의 연결을 효율적으로 처리할 수 있도록 서버 및 호스팅 환경에서 몇 가지 추가 최적화가 필요할 수 있습니다.

> [!NOTE]
> 사이트가 [Laravel Forge](https://forge.laravel.com)로 관리되고 있다면, "애플리케이션" 패널에서 Reverb 통합을 활성화해 서버를 자동으로 최적화할 수 있습니다. Reverb 통합을 활성화하면 필요한 확장 설치 및 연결 허용 수 증가 등, 프로덕션 환경에 적합하게 서버가 자동으로 준비됩니다.

<a name="open-files"></a>
### Open Files

각 WebSocket 연결은, 클라이언트나 서버가 연결을 종료할 때까지 메모리에 유지됩니다. 유닉스 및 유닉스 계열 환경에서는 각 연결이 파일로 표현됩니다. 그러나 시스템 및 애플리케이션 레벨 모두에서 열린 파일 수에는 제한이 있는 경우가 많습니다.

<a name="operating-system"></a>
#### 운영체제 레벨

유닉스 기반 운영체제에서는 `ulimit` 명령어를 통해 허용된 열린 파일 개수를 확인할 수 있습니다.

```shell
ulimit -n
```

이 명령을 실행하면 서로 다른 사용자에 대해 허용 가능한 열린 파일 수를 확인할 수 있습니다. 값 변경은 `/etc/security/limits.conf` 파일을 수정해 이루어집니다. 예를 들어, `forge` 사용자의 열린 파일 수를 10,000개로 늘리려면 다음과 같이 설정합니다.

```ini
# /etc/security/limits.conf
forge        soft  nofile  10000
forge        hard  nofile  10000
```

<a name="event-loop"></a>
### 이벤트 루프

Reverb는 내부적으로 ReactPHP 이벤트 루프를 사용해 서버에서 WebSocket 연결을 관리합니다. 기본적으로 이 이벤트 루프는 추가 확장 없이 사용할 수 있는 `stream_select`로 동작합니다. 하지만, `stream_select`의 경우 일반적으로 1,024개의 열린 파일로 제한됩니다. 따라서 1,000개를 초과하는 동시 연결을 처리해야 한다면, 더 넓은 제한을 가진 대체 이벤트 루프를 사용해야 합니다.

Reverb는 `ext-uv` 확장이 설치되어 있으면 자동으로 해당 이벤트 루프를 사용하도록 전환합니다. 이 PHP 확장은 PECL을 통해 설치할 수 있습니다.

```shell
pecl install uv
```

<a name="web-server"></a>
### 웹 서버

일반적으로 Reverb는 서버 내에서 외부에 직접 노출되지 않는(port를 별도로 지정한) 포트로 동작합니다. 따라서 외부 트래픽을 Reverb로 전달하려면 역방향 프록시(reverse proxy) 설정이 필요합니다. 예를 들어, Reverb가 호스트 `0.0.0.0`, 포트 `8080`에서 실행 중이고, 서버가 Nginx 웹 서버를 사용한다면 아래의 Nginx 사이트 설정으로 Reverb 서버용 리버스 프록시를 구성할 수 있습니다.

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
> Reverb는 `/app`에서 WebSocket 연결을 받고, `/apps`에서 API 요청을 처리합니다. Reverb 요청을 처리하는 웹 서버가 이 두 URI도 정상적으로 서비스할 수 있도록 반드시 설정되어야 합니다. [Laravel Forge](https://forge.laravel.com)를 사용해 서버를 관리한다면, 기본적으로 올바르게 구성되어 있습니다.

보통 웹 서버는 과부하 방지를 위해 최대 허용 커넥션 수를 제한해 놓습니다. Nginx 웹 서버의 허용 커넥션 수를 10,000개로 늘리려면, `nginx.conf` 파일의 `worker_rlimit_nofile`과 `worker_connections` 값을 다음과 같이 변경해야 합니다.

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

위 설정은 프로세스당 최대 10,000개의 Nginx 워커를 생성할 수 있도록 하며, 동시에 Nginx의 열린 파일 제한도 10,000개로 지정합니다.

<a name="ports"></a>
### 포트

유닉스 계열 운영체제에서는 서버에서 열 수 있는 포트 수에도 제한이 있습니다. 현재 허용된 범위는 다음 명령어로 확인할 수 있습니다.

```shell
cat /proc/sys/net/ipv4/ip_local_port_range
# 32768	60999
```

위 결과는 서버에서 총 28,231(60,999 - 32,768)개의 연결을 처리할 수 있음을 보여줍니다. 각 연결마다 포트가 필요하기 때문입니다. 더 많은 연결을 지원하려면, [수평 확장](#scaling)을 권장하지만, 서버의 `/etc/sysctl.conf` 설정 파일에서 허용 포트 범위를 늘릴 수도 있습니다.

<a name="process-management"></a>
### 프로세스 관리

일반적으로, Reverb 서버가 항상 구동 상태로 유지되도록 Supervisor와 같은 프로세스 관리자를 사용해야 합니다. Supervisor로 Reverb를 실행할 때는, Supervisor의 `supervisor.conf` 파일의 `minfds` 설정을 변경해, Reverb가 연결을 처리하는 데 필요한 파일 개수를 충분히 열 수 있도록 해야 합니다.

```ini
[supervisord]
...
minfds=10000
```

<a name="scaling"></a>
### 스케일링

한 대의 서버에서 처리할 수 있는 연결 수를 초과해야 한다면, Reverb 서버를 수평 확장할 수 있습니다. Redis의 publish/subscribe 기능을 활용해 Reverb는 여러 서버에서 연결을 관리할 수 있습니다. 애플리케이션의 Reverb 서버 중 한 곳에서 메시지를 받으면, 해당 서버는 Redis에 메시지를 publish(발행)해서 나머지 서버들로도 메시지를 전달합니다.

수평 확장을 활성화하려면, 애플리케이션의 `.env` 설정 파일에 `REVERB_SCALING_ENABLED` 환경 변수를 `true`로 설정해야 합니다.

```env
REVERB_SCALING_ENABLED=true
```

그리고, 모든 Reverb 서버가 통신할 수 있는, 별도의 중앙 Redis 서버가 필요합니다. Reverb는 [애플리케이션에 설정된 기본 Redis 연결](/docs/redis#configuration)을 사용해 모든 리버브 서버에 메시지를 발행합니다.

Reverb의 스케일링 옵션을 켜고 Redis 서버를 설정한 후에는, Redis 서버와 통신할 수 있는 여러 서버에서 각각 `reverb:start` 명령어를 실행하면 됩니다. 이렇게 실행한 Reverb 서버들은 로드 밸런서 뒤에 배치하여, 들어오는 요청이 여러 서버에 고르게 분배되도록 해야 합니다.

