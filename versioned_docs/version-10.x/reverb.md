# 라라벨 리버브 (Laravel Reverb)

- [소개](#introduction)
- [설치](#installation)
- [구성](#configuration)
    - [애플리케이션 자격 증명](#application-credentials)
    - [허용된 오리진](#allowed-origins)
    - [추가 애플리케이션](#additional-applications)
    - [SSL](#ssl)
- [서버 실행](#running-server)
    - [디버깅](#debugging)
    - [재시작](#restarting)
- [운영 환경에서 리버브 실행](#production)
    - [Open Files](#open-files)
    - [이벤트 루프](#event-loop)
    - [웹 서버](#web-server)
    - [포트](#ports)
    - [프로세스 관리](#process-management)
    - [스케일링](#scaling)

<a name="introduction"></a>
## 소개

[Laravel Reverb](https://github.com/laravel/reverb)는 라라벨 애플리케이션에 초고속이면서 확장 가능한 실시간 WebSocket 통신 기능을 직접 제공하며, 라라벨의 기존 이벤트 브로드캐스팅 도구와도 완벽하게 통합됩니다.

<a name="installation"></a>
## 설치

> [!WARNING]
> 라라벨 리버브는 PHP 8.2 이상, 라라벨 10.47 이상이 필요합니다.

Composer 패키지 매니저를 사용하여 라라벨 프로젝트에 리버브를 설치할 수 있습니다.

```sh
composer require laravel/reverb
```

패키지 설치가 완료되면, 리버브의 설치 명령어를 실행하여 설정 파일을 배포하고, 리버브에 필요한 환경 변수들을 추가하며, 애플리케이션의 이벤트 브로드캐스트가 활성화되도록 할 수 있습니다.

```sh
php artisan reverb:install
```

<a name="configuration"></a>
## 구성

`reverb:install` 명령어는 합리적인 기본 옵션으로 리버브를 자동으로 설정해줍니다. 만약 설정을 변경하고 싶다면, 리버브와 관련된 환경 변수나 `config/reverb.php` 설정 파일을 직접 수정하면 됩니다.

<a name="application-credentials"></a>
### 애플리케이션 자격 증명

리버브 서버와 연결을 맺으려면 클라이언트와 서버 간에 리버브 "애플리케이션" 자격 증명을 교환해야 합니다. 이 자격 증명은 서버 측에서 설정되며, 클라이언트의 요청을 검증하는 데 사용됩니다. 다음과 같은 환경 변수로 이 자격 증명을 지정할 수 있습니다.

```ini
REVERB_APP_ID=my-app-id
REVERB_APP_KEY=my-app-key
REVERB_APP_SECRET=my-app-secret
```

<a name="allowed-origins"></a>
### 허용된 오리진

클라이언트 요청이 허용되는 오리진(origin)을 지정하고 싶다면, `config/reverb.php` 설정 파일의 `apps` 섹션에 있는 `allowed_origins` 값을 수정하면 됩니다. 해당 리스트에 포함되지 않은 오리진에서의 요청은 모두 거부됩니다. 모든 오리진에서의 요청을 허용하고 싶다면 `*`를 사용할 수 있습니다.

```php
'apps' => [
    [
        'id' => 'my-app-id',
        'allowed_origins' => ['laravel.com'],
        // ...
    ]
]
```

<a name="additional-applications"></a>
### 추가 애플리케이션

일반적으로 리버브는 설치된 애플리케이션의 WebSocket 서버 역할만 수행합니다. 그러나 하나의 리버브 인스턴스로 여러 애플리케이션을 동시에 서비스할 수도 있습니다.

예를 들어, 하나의 라라벨 애플리케이션이 리버브를 통해 여러 개의 다른 애플리케이션에 WebSocket 연결을 제공하도록 구성할 수 있습니다. 이를 위해서는 `config/reverb.php` 파일 내에 여러 개의 `apps`를 정의하면 됩니다.

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

대부분의 경우, 보안 WebSocket 연결(wss://)은 리버브 서버 앞단의 웹 서버(Nginx 등)에서 처리한 후, 리버브 서버로 프록시 요청을 전달하는 방식으로 동작합니다.

하지만, 예를 들어 로컬 개발 환경처럼 리버브 서버가 직접 보안 연결을 처리해야 하는 상황이 있을 수 있습니다. 만약 [Laravel Herd](https://herd.laravel.com)의 보안 사이트 기능을 사용하거나, [Laravel Valet](/docs/10.x/valet)에서 [secure 명령어](/docs/10.x/valet#securing-sites)를 실행했다면, 사이트용으로 생성된 Herd/Valet 인증서를 리버브 연결 보안에 그대로 사용할 수 있습니다. 이때는 `REVERB_HOST` 환경 변수를 사이트의 호스트명으로 설정하거나, 리버브 서버 실행 시 `--hostname` 옵션을 명시적으로 전달하면 됩니다.

```sh
php artisan reverb:start --host="0.0.0.0" --port=8080 --hostname="laravel.test"
```

Herd와 Valet의 도메인은 `localhost`로 resolve되므로, 위 명령을 실행하면 리버브 서버는 보안 WebSocket 프로토콜(wss)로 `wss://laravel.test:8080`에서 접속이 가능합니다.

또한, `config/reverb.php` 설정 파일의 `tls` 옵션을 직접 지정하여 원하는 인증서를 지정할 수도 있습니다. 이 옵션 배열에는 [PHP의 SSL 컨텍스트 옵션](https://www.php.net/manual/en/context.ssl.php)에서 지원하는 어떤 옵션이든 지정할 수 있습니다.

```php
'options' => [
    'tls' => [
        'local_cert' => '/path/to/cert.pem'
    ],
],
```

<a name="running-server"></a>
## 서버 실행

리버브 서버는 `reverb:start` 아티즌 명령어로 실행할 수 있습니다.

```sh
php artisan reverb:start
```

기본적으로 리버브 서버는 `0.0.0.0:8080`에서 시작되며, 이로 인해 모든 네트워크 인터페이스에서 접근할 수 있습니다.

별도의 호스트나 포트를 지정해야 한다면, 서버 실행 시 `--host`와 `--port` 옵션을 사용할 수 있습니다.

```sh
php artisan reverb:start --host=127.0.0.1 --port=9000
```

또는, 애플리케이션의 `.env` 설정 파일에 `REVERB_SERVER_HOST`와 `REVERB_SERVER_PORT` 환경 변수를 정의할 수도 있습니다.

여기서 `REVERB_SERVER_HOST`와 `REVERB_SERVER_PORT`는 리버브 서버 자체가 운영되는 호스트와 포트를 지정하는 것이고, `REVERB_HOST`와 `REVERB_PORT`는 라라벨이 브로드캐스트 메시지를 보낼 대상을 지정하는 것임에 주의해야 합니다. 예를 들어 운영 환경에서는, 퍼블릭 리버브 호스트(443 포트)에서 받아온 요청을 내부의 `0.0.0.0:8080` 리버브 서버로 전달할 수 있습니다. 이런 경우 환경 변수는 다음과 같이 정의됩니다.

```ini
REVERB_SERVER_HOST=0.0.0.0
REVERB_SERVER_PORT=8080

REVERB_HOST=ws.laravel.com
REVERB_PORT=443
```

<a name="debugging"></a>
### 디버깅

성능을 높이기 위해 리버브는 기본적으로 디버그 정보를 출력하지 않습니다. 리버브 서버를 통과하는 데이터 스트림을 확인하고 싶을 때는, `reverb:start` 명령어에 `--debug` 옵션을 추가하면 됩니다.

```sh
php artisan reverb:start --debug
```

<a name="restarting"></a>
### 재시작

리버브는 장시간 실행되는 프로세스이므로, 코드를 변경해도 서버를 재시작하지 않으면 변경 사항이 적용되지 않습니다. 이럴 때는 `reverb:restart` 아티즌 명령어를 사용해 서버를 재시작해야 합니다.

`reverb:restart` 명령은 모든 연결을 정상적으로 종료한 후 서버를 종료합니다. Supervisor 같은 프로세스 관리 도구로 리버브를 실행 중이라면, 연결이 모두 종료된 후 프로세스 관리자가 자동으로 서버를 다시 시작하게 됩니다.

```sh
php artisan reverb:restart
```

<a name="production"></a>
## 운영 환경에서 리버브 실행

WebSocket 서버의 특성상, 리버브 서버가 각 서버의 리소스에 맞게 충분한 수의 연결을 처리할 수 있도록 하기 위해, 서버 및 호스팅 환경에 추가 최적화 작업이 필요할 수 있습니다.

> [!NOTE]
> 만약 [Laravel Forge](https://forge.laravel.com)로 사이트를 관리 중이라면, "Application" 패널에서 리버브 통합 기능을 활성화하여 서버를 자동으로 최적화할 수 있습니다. 이 기능을 켜면, 필요한 확장 프로그램 설치 및 연결 허용 수 조정 등 서버를 운영 환경에 맞게 자동으로 구성해줍니다.

<a name="open-files"></a>
### Open Files

각 WebSocket 연결은 클라이언트나 서버가 연결을 끊을 때까지 메모리에 유지됩니다. 유닉스 및 유닉스 계열 환경에서는, 각 연결이 하나의 파일로 표현됩니다. 그런데 운영 체제 및 애플리케이션 수준에서 동시에 열 수 있는 파일 수에는 보통 제한이 있습니다.

<a name="operating-system"></a>
#### 운영 체제

유닉스 계열 운영체제에서는 `ulimit` 명령어를 통해 허용된 오픈 파일 수를 확인할 수 있습니다.

```sh
ulimit -n
```

이 명령어는 사용자별로 허용된 오픈 파일 제한을 보여줍니다. 제한값을 변경하려면 `/etc/security/limits.conf` 파일을 편집하면 됩니다. 예를 들어, `forge` 사용자에 대한 오픈 파일 최대치를 10,000으로 늘리려면 다음과 같이 설정합니다.

```ini
# /etc/security/limits.conf
forge        soft  nofile  10000
forge        hard  nofile  10000
```

<a name="event-loop"></a>
### 이벤트 루프

리버브는 내부적으로 ReactPHP 이벤트 루프(event loop)를 사용해 서버에서 WebSocket 연결을 관리합니다. 기본적으로는 추가 확장 모듈이 필요 없는 `stream_select` 기반의 루프가 동작합니다. 하지만 이 방식은 일반적으로 1,024개의 오픈 파일까지만 지원합니다. 따라서 1,000개 이상의 동시 연결이 필요하다면 제한을 받지 않는 다른 이벤트 루프를 사용해야 합니다.

리버브는 `ext-event`, `ext-ev`, 또는 `ext-uv` PHP 확장 프로그램이 설치되어 있을 경우 자동으로 이를 사용하도록 전환합니다. 이 확장들은 PECL을 통해 설치할 수 있습니다.

```sh
pecl install event
# 또는
pecl install ev
# 또는
pecl install uv
```

<a name="web-server"></a>
### 웹 서버

대부분의 경우, 리버브는 서버에서 직접 외부에 노출되지 않는 비공개 포트에서 실행됩니다. 따라서 트래픽을 리버브로 라우팅하려면 리버스 프록시를 설정해야 합니다. 예를 들어 리버브를 `0.0.0.0:8080`에서 실행 중이고 서버가 Nginx 웹 서버를 사용한다면, 다음과 같이 해당 사이트의 Nginx 설정 파일에서 리버스 프록시를 지정할 수 있습니다.

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

대부분의 웹 서버에는 과도한 서버 리소스 사용을 막기 위해 연결 수 제한이 기본적으로 적용되어 있습니다. Nginx에서 허용 가능한 연결 수를 10,000개로 늘리려면, `nginx.conf` 파일 내 `worker_rlimit_nofile` 및 `worker_connections` 값을 다음과 같이 조정하면 됩니다.

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

위 설정을 적용하면 Nginx 프로세스당 최대 10,000개의 워커가 생성될 수 있으며, 오픈 파일 제한도 10,000개로 설정됩니다.

<a name="ports"></a>
### 포트

유닉스 계열 운영체제에서는 서버에서 열 수 있는 포트 수에도 한계가 있습니다. 아래 명령어를 통해 현재 허용된 포트 범위를 확인할 수 있습니다.

 ```sh
 cat /proc/sys/net/ipv4/ip_local_port_range
# 32768	60999
```

위 출력에서 60,999에서 32,768을 뺀 28,231개의 연결이 가능함을 알 수 있습니다. (각 연결마다 사용 가능한 포트가 필요하기 때문입니다.) 더 많은 연결이 필요할 경우, [수평 확장](#scaling)을 권장하지만, 서버의 `/etc/sysctl.conf` 파일에서 포트 범위를 늘려 허용 가능한 오픈 포트 수 자체를 늘릴 수도 있습니다.

<a name="process-management"></a>
### 프로세스 관리

대부분의 경우, 리버브 서버가 항상 실행되도록 Supervisor 같은 프로세스 관리 도구를 사용하는 것이 좋습니다. Supervisor로 리버브를 실행하는 경우, 서버의 `supervisor.conf` 파일에서 `minfds` 옵션 값을 늘려, 리버브 서버가 필요한 만큼 파일을 열 수 있도록 해야 합니다.

```ini
[supervisord]
...
minfds=10000
```

<a name="scaling"></a>
### 스케일링

단일 서버에서 처리할 수 있는 연결 수 이상의 동시 연결이 필요하다면, 리버브 서버를 수평 확장할 수 있습니다. Redis의 publish/subscribe 기능을 활용하여, 여러 서버에 걸쳐 연결을 처리할 수 있습니다. 하나의 리버브 서버가 메시지를 수신하면, Redis를 통해 해당 메시지를 모든 다른 서버에도 브로드캐스팅합니다.

수평 확장을 활성화하려면, 애플리케이션의 `.env` 파일에서 `REVERB_SCALING_ENABLED` 환경 변수를 `true`로 설정해야 합니다.

```env
REVERB_SCALING_ENABLED=true
```

그 다음, 모든 리버브 서버가 접근할 수 있는 전용 중앙 Redis 서버를 준비해야 합니다. 리버브는 [애플리케이션에 설정된 기본 Redis 연결](/docs/10.x/redis#configuration)을 사용해 모든 리버브 서버에 메시지를 전파합니다.

이제 리버브 스케일링 옵션을 활성화하고 Redis 서버 설정까지 완료했다면, Redis와 통신 가능한 여러 대의 서버에서 각각 `reverb:start` 명령을 실행하면 됩니다. 이러한 리버브 서버들은 로드 밸런서 뒤에 두어, 들어오는 요청이 여러 서버에 균등하게 분산되도록 해야 합니다.
