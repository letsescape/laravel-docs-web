# 브로드캐스팅 (Broadcasting)

- [소개](#introduction)
- [서버 사이드 설치](#server-side-installation)
    - [환경설정](#configuration)
    - [리버브](#reverb)
    - [푸셔 채널](#pusher-channels)
    - [애블리](#ably)
- [클라이언트 사이드 설치](#client-side-installation)
    - [리버브(클라이언트)](#client-reverb)
    - [푸셔 채널(클라이언트)](#client-pusher-channels)
    - [애블리(클라이언트)](#client-ably)
- [개념 개요](#concept-overview)
    - [예제 애플리케이션 활용하기](#using-example-application)
- [브로드캐스트 이벤트 정의](#defining-broadcast-events)
    - [브로드캐스트 이름](#broadcast-name)
    - [브로드캐스트 데이터](#broadcast-data)
    - [브로드캐스트 큐](#broadcast-queue)
    - [브로드캐스트 조건](#broadcast-conditions)
    - [브로드캐스팅과 데이터베이스 트랜잭션](#broadcasting-and-database-transactions)
- [채널 인가](#authorizing-channels)
    - [인가 콜백 정의하기](#defining-authorization-callbacks)
    - [채널 클래스 정의하기](#defining-channel-classes)
- [이벤트 브로드캐스팅](#broadcasting-events)
    - [다른 사용자에게만 브로드캐스팅](#only-to-others)
    - [커넥션 커스터마이징](#customizing-the-connection)
    - [익명 이벤트](#anonymous-events)
- [브로드캐스트 수신하기](#receiving-broadcasts)
    - [이벤트 리스닝](#listening-for-events)
    - [채널 떠나기](#leaving-a-channel)
    - [네임스페이스](#namespaces)
- [프레즌스 채널](#presence-channels)
    - [프레즌스 채널 인가](#authorizing-presence-channels)
    - [프레즌스 채널 참여](#joining-presence-channels)
    - [프레즌스 채널로 브로드캐스팅](#broadcasting-to-presence-channels)
- [모델 브로드캐스팅](#model-broadcasting)
    - [모델 브로드캐스팅 관례](#model-broadcasting-conventions)
    - [모델 브로드캐스트 리스닝](#listening-for-model-broadcasts)
- [클라이언트 이벤트](#client-events)
- [알림](#notifications)

<a name="introduction"></a>
## 소개

많은 최신 웹 애플리케이션에서는 WebSocket을 활용해 실시간으로 사용자 인터페이스를 업데이트합니다. 서버에서 데이터가 변경되면, 일반적으로 WebSocket 연결을 통해 메시지가 전송되어 클라이언트에서 이를 처리합니다. WebSocket은 UI에 반영할 데이터 변화를 확인하기 위해 애플리케이션 서버를 지속적으로 폴링(polling)하는 방식보다 훨씬 효율적입니다.

예를 들어, 여러분의 애플리케이션에서 사용자의 데이터를 CSV 파일로 내보내고 이메일로 전송해주는 기능이 있다고 가정해 보겠습니다. 하지만 이 CSV 파일을 생성하는 데 시간이 몇 분 정도 소요되기 때문에, [큐 작업](/docs/queues)으로 분리하여 CSV 파일을 생성하고 메일을 발송하게 만듭니다. CSV 파일 생성 및 이메일 전송이 완료되면, `App\Events\UserDataExported` 라는 이벤트를 브로드캐스팅해 애플리케이션의 JavaScript에서 이를 받을 수 있습니다. 이벤트를 수신하면, 사용자가 굳이 페이지를 새로 고침하지 않아도 "CSV 파일이 이메일로 전송되었습니다"와 같은 메시지를 바로 보여줄 수 있습니다.

이러한 기능 개발을 돕기 위해, 라라벨에서는 서버 측의 라라벨 [이벤트](/docs/events)를 WebSocket 연결을 통해 쉽게 "브로드캐스트"할 수 있습니다. 라라벨의 이벤트 브로드캐스팅을 활용하면, 서버 사이드 라라벨 애플리케이션과 클라이언트 사이드 JavaScript 애플리케이션이 동일한 이벤트 이름과 데이터를 쉽게 공유할 수 있습니다.

브로드캐스팅의 핵심 개념은 매우 간단합니다. 프런트엔드 쪽 클라이언트는 이름이 지정된 채널에 연결되고, 라라벨 애플리케이션에서는 이 채널들로 이벤트를 백엔드에서 브로드캐스트하게 됩니다. 이 이벤트에는 프런트엔드에서 활용할 수 있는 다양한 추가 데이터를 원하는 만큼 담을 수 있습니다.

<a name="supported-drivers"></a>
#### 지원하는 드라이버

라라벨은 기본적으로 세 가지 서버 사이드 브로드캐스팅 드라이버를 제공합니다: [Laravel Reverb](https://reverb.laravel.com), [Pusher Channels](https://pusher.com/channels), [Ably](https://ably.com).

> [!NOTE]
> 이벤트 브로드캐스팅을 시작하기 전에, 먼저 라라벨의 [이벤트 및 리스너](/docs/events) 문서를 읽어 두는 것이 좋습니다.

<a name="server-side-installation"></a>
## 서버 사이드 설치

라라벨의 이벤트 브로드캐스팅을 사용하려면, 라라벨 애플리케이션에서 몇 가지 환경 설정을 해주고, 필요한 패키지를 설치해야 합니다.

이벤트 브로드캐스팅은 서버 사이드에서 이벤트를 브로드캐스트하는 드라이버를 통해 이루어지며, 이를 통해 Laravel Echo(JavaScript 라이브러리)가 브라우저 클라이언트에서 이벤트를 받을 수 있게 됩니다. 걱정하지 마세요. 설치 과정은 아래와 같이 단계별로 안내해 드립니다.

<a name="configuration"></a>
### 환경설정

애플리케이션의 이벤트 브로드캐스팅 관련 설정은 모두 `config/broadcasting.php` 설정 파일에 저장됩니다. 만약 이 파일이 애플리케이션에 없더라도, `install:broadcasting` 아티즌 명령어를 실행하면 자동으로 생성됩니다.

라라벨은 기본적으로 여러 가지 브로드캐스트 드라이버를 지원합니다: [Laravel Reverb](/docs/reverb), [Pusher Channels](https://pusher.com/channels), [Ably](https://ably.com), 그리고 로컬 개발 및 디버깅을 위한 `log` 드라이버가 준비되어 있습니다. 또한 테스트 중 브로드캐스팅을 비활성화할 수 있도록 `null` 드라이버도 포함되어 있습니다. 각 드라이버에 대한 설정 예제는 `config/broadcasting.php` 파일에 담겨 있습니다.

<a name="installation"></a>
#### 설치

기본적으로 새로운 라라벨 애플리케이션에서는 브로드캐스팅이 활성화되어 있지 않습니다. `install:broadcasting` 아티즌 명령어로 브로드캐스팅을 활성화할 수 있습니다.

```shell
php artisan install:broadcasting
```

`install:broadcasting` 명령어를 실행하면, `config/broadcasting.php` 설정 파일이 생성됩니다. 또한 브로드캐스트 채널의 인가(authorization) 관련 라우트와 콜백을 등록할 수 있는 `routes/channels.php` 파일도 함께 생성됩니다.

<a name="queue-configuration"></a>
#### 큐 설정

이벤트를 브로드캐스팅하기 전에, 먼저 [큐 워커](/docs/queues)를 설정하고 실행해야 합니다. 모든 이벤트 브로드캐스팅 작업은 큐에 할당된 잡(jobs)으로 처리되어, 이벤트 브로드캐스팅 때문에 애플리케이션의 응답 속도가 저하되지 않도록 보장합니다.

<a name="reverb"></a>
### 리버브

`install:broadcasting` 명령어를 실행하면 [Laravel Reverb](/docs/reverb) 설치에 대한 안내 메시지가 표시됩니다. 물론 Composer 패키지 매니저를 사용해 직접 리버브를 설치할 수도 있습니다.

```shell
composer require laravel/reverb
```

패키지를 설치한 후에는, 리버브의 설치 명령어를 실행하여 환경설정 파일을 발행하고, 필요한 환경 변수들을 추가하며, 이벤트 브로드캐스팅을 애플리케이션에서 사용할 수 있도록 활성화할 수 있습니다.

```shell
php artisan reverb:install
```

리버브의 자세한 설치 및 사용 방법은 [Reverb 공식 문서](/docs/reverb)에서 확인하실 수 있습니다.

<a name="pusher-channels"></a>
### 푸셔 채널

이벤트를 [Pusher Channels](https://pusher.com/channels)로 브로드캐스트하려면, Composer 패키지 매니저를 사용해 Pusher Channels PHP SDK를 설치해야 합니다.

```shell
composer require pusher/pusher-php-server
```

다음으로, `config/broadcasting.php` 설정 파일에서 Pusher Channels 자격 증명(credentials)을 입력해야 합니다. 예시 Pusher Channels 설정이 이미 이 파일에 포함되어 있으므로, 키, 시크릿, 앱 ID만 빠르게 지정하면 됩니다. 일반적으로는 애플리케이션의 `.env` 파일에 Pusher Channels 자격 증명을 아래와 같이 등록합니다.

```ini
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_APP_KEY="your-pusher-key"
PUSHER_APP_SECRET="your-pusher-secret"
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME="https"
PUSHER_APP_CLUSTER="mt1"
```

`config/broadcasting.php` 파일의 `pusher` 설정에는 클러스터(cluster) 등 Channels가 지원하는 추가 `options`도 지정할 수 있습니다.

그 다음, 애플리케이션의 `.env` 파일에서 `BROADCAST_CONNECTION` 환경 변수를 `pusher`로 설정합니다.

```ini
BROADCAST_CONNECTION=pusher
```

이제 클라이언트 측에서 브로드캐스트 이벤트를 받을 [Laravel Echo](#client-side-installation)를 설치하고 환경설정할 준비가 완료되었습니다.

<a name="ably"></a>
### 애블리

> [!NOTE]
> 아래 문서는 애블리를 "Pusher 호환" 모드로 사용하는 방법을 다룹니다. 하지만 애블리(Ably) 팀에서는 자사 기술 고유의 기능을 잘 활용할 수 있는 별도의 브로드캐스터와 Echo 클라이언트를 권장 및 관리하고 있습니다. 해당 드라이버 사용법은 [애블리 공식 라라벨 브로드캐스터 문서](https://github.com/ably/laravel-broadcaster)를 참고해 주세요.

[Ably](https://ably.com)로 이벤트를 브로드캐스팅하려는 경우에는 Composer 패키지 매니저를 이용해 Ably PHP SDK를 설치해야 합니다.

```shell
composer require ably/ably-php
```

다음으로 `config/broadcasting.php` 설정 파일에 Ably 자격 증명을 기입합니다. 이 파일에도 이미 Ably 설정 예제가 포함되어 있으므로 key 정보만 입력하면 됩니다. 대개 이 값은 [환경 변수](/docs/configuration#environment-configuration)인 `ABLY_KEY`로 지정합니다.

```ini
ABLY_KEY=your-ably-key
```

그 다음, 애플리케이션의 `.env` 파일에서 `BROADCAST_CONNECTION` 환경 변수를 `ably`로 설정합니다.

```ini
BROADCAST_CONNECTION=ably
```

이제 클라이언트 측에서 브로드캐스트 이벤트를 받을 [Laravel Echo](#client-side-installation)를 설치하고 환경설정할 준비가 완료되었습니다.

<a name="client-side-installation"></a>
## 클라이언트 사이드 설치

<a name="client-reverb"></a>
### 리버브(클라이언트)

[Laravel Echo](https://github.com/laravel/echo)는 서버 측 브로드캐스트 드라이버가 브로드캐스트한 이벤트 채널을 JavaScript에서 쉽게 구독(subscribe)하고 수신(listen)할 수 있게 해주는 라이브러리입니다. Echo는 NPM 패키지 매니저로 설치할 수 있습니다. 이 예제에서는 리버브가 WebSocket 구독 및 메시지 전송에 Pusher 프로토콜을 사용하므로 `pusher-js` 패키지도 함께 설치합니다.

```shell
npm install --save-dev laravel-echo pusher-js
```

Echo를 설치한 후에는, 애플리케이션의 JavaScript에서 Echo 인스턴스를 생성할 수 있습니다. 보통 라라벨 프레임워크에 포함된 `resources/js/bootstrap.js` 파일 하단에 이 코드를 두는 것이 좋습니다. 기본적으로 이 파일에는 Echo 설정 예제가 주석 처리된 채로 포함되어 있으므로 주석만 해제하고 `broadcaster` 옵션을 `reverb`로 바꿔주면 설정이 완료됩니다.

```js
import Echo from 'laravel-echo';

import Pusher from 'pusher-js';
window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
});
```

이제 아래 명령어로 애플리케이션의 에셋을 빌드합니다.

```shell
npm run build
```

> [!WARNING]
> 라라벨 Echo의 `reverb` 브로드캐스터를 사용하려면 laravel-echo v1.16.0 이상이 필요합니다.

<a name="client-pusher-channels"></a>
### 푸셔 채널(클라이언트)

[Laravel Echo](https://github.com/laravel/echo)는 서버 측 브로드캐스트 드라이버가 브로드캐스트한 이벤트 채널을 JavaScript에서 쉽게 구독(subscribe)하고 수신(listen)할 수 있게 해주는 라이브러리입니다. Echo는 또한 NPM의 `pusher-js` 패키지를 활용해 Pusher 프로토콜(WebSocket 구독, 채널, 메시지)을 구현합니다.

`install:broadcasting` 아티즌 명령어를 통해 `laravel-echo`와 `pusher-js` 패키지가 자동으로 설치됩니다. 물론 필요하다면 다음과 같이 NPM을 이용해 수동으로 설치할 수도 있습니다.

```shell
npm install --save-dev laravel-echo pusher-js
```

Echo를 설치하면, JavaScript에서 Echo 인스턴스를 새롭게 생성할 수 있습니다. `install:broadcasting` 명령어를 실행하면 `resources/js/echo.js` 에 Echo 환경설정 파일이 생성되지만, 기본 설정은 Laravel Reverb용입니다. 설정을 아래 예시처럼 수정해 Pusher에 맞게 바꿔 사용할 수 있습니다.

```js
import Echo from 'laravel-echo';

import Pusher from 'pusher-js';
window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true
});
```

그 다음, 애플리케이션의 `.env` 파일에 적절한 Pusher 환경 변수를 정의해야 합니다. 만약 해당 변수가 이미 없다면 아래와 같이 추가합니다.

```ini
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_APP_KEY="your-pusher-key"
PUSHER_APP_SECRET="your-pusher-secret"
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME="https"
PUSHER_APP_CLUSTER="mt1"

VITE_APP_NAME="${APP_NAME}"
VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
VITE_PUSHER_HOST="${PUSHER_HOST}"
VITE_PUSHER_PORT="${PUSHER_PORT}"
VITE_PUSHER_SCHEME="${PUSHER_SCHEME}"
VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
```

Echo 설정을 실제 애플리케이션 환경에 맞게 조정했다면, 다음과 같이 에셋을 빌드하면 됩니다.

```shell
npm run build
```

> [!NOTE]
> 애플리케이션의 JavaScript 에셋 빌드에 대한 자세한 내용은 [Vite](/docs/vite) 문서를 참고하세요.

<a name="using-an-existing-client-instance"></a>
#### 기존 클라이언트 인스턴스 사용

이미 환경설정이 완료된 Pusher Channels 클라이언트 인스턴스가 있다면, Echo의 `client` 옵션을 통해 이 인스턴스를 Echo에서 그대로 사용할 수 있습니다.

```js
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

const options = {
    broadcaster: 'pusher',
    key: 'your-pusher-channels-key'
}

window.Echo = new Echo({
    ...options,
    client: new Pusher(options.key, options)
});
```

<a name="client-ably"></a>
### 애블리(클라이언트)

> [!NOTE]
> 아래 문서는 애블리를 "Pusher 호환" 모드로 사용하는 방법을 다룹니다. 하지만 애블리(Ably) 팀에서는 자체적으로 제공하는 브로드캐스터 및 Echo 클라이언트를 통해 애블리의 고유한 기능을 최대한 활용하는 것을 권장합니다. 자세한 내용은 [애블리 공식 라라벨 브로드캐스터 문서](https://github.com/ably/laravel-broadcaster)를 참고하세요.

[Laravel Echo](https://github.com/laravel/echo)는 서버 측 브로드캐스트 드라이버가 브로드캐스트한 이벤트 채널을 JavaScript에서 쉽게 구독(subscribe)하고 수신(listen)할 수 있게 해주는 라이브러리입니다. Echo는 NPM의 `pusher-js` 패키지를 활용해 Pusher 프로토콜을 WebSocket 구독, 채널, 메시지 구현에 사용합니다.

`install:broadcasting` 아티즌 명령어를 실행하면 `laravel-echo` 및 `pusher-js` 패키지가 자동 설치됩니다. 물론 필요하다면 NPM을 이용해 직접 설치도 가능합니다.

```shell
npm install --save-dev laravel-echo pusher-js
```

**다음 단계로 진행하기 전, 애블리 대시보드의 "Protocol Adapter Settings"에서 Pusher 프로토콜 지원을 반드시 활성화해야 합니다.**

Echo를 설치한 뒤에는 JavaScript에서 Echo 인스턴스를 새롭게 정의할 수 있습니다. `install:broadcasting` 명령어를 실행하면 `resources/js/echo.js`에 Echo 환경설정 파일이 만들어지지만, 기본 설정은 Laravel Reverb를 대상으로 합니다. 아래와 같이 설정을 복사하여 애블리용으로 적용할 수 있습니다.

```js
import Echo from 'laravel-echo';

import Pusher from 'pusher-js';
window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_ABLY_PUBLIC_KEY,
    wsHost: 'realtime-pusher.ably.io',
    wsPort: 443,
    disableStats: true,
    encrypted: true,
});
```

이때 Echo 환경설정에서는 `VITE_ABLY_PUBLIC_KEY` 라는 환경 변수를 참고하고 있습니다. 이 값에는 애블리 퍼블릭 키(public key, 콜론(:) 앞 부분)를 입력해야 합니다.

환경설정이 끝났다면, 아래 명령어로 에셋 빌드를 진행하면 됩니다.

```shell
npm run dev
```

> [!NOTE]
> 애플리케이션의 JavaScript 에셋 빌드에 대한 자세한 내용은 [Vite](/docs/vite) 문서를 참고하세요.

<a name="concept-overview"></a>
## 개념 개요

라라벨의 이벤트 브로드캐스팅은 서버 측 라라벨 이벤트를 클라이언트 측 JavaScript 애플리케이션에서 드라이버 기반 WebSocket 구조로 손쉽게 브로드캐스트 할 수 있도록 해줍니다. 현재 라라벨에는 [Laravel Reverb](https://reverb.laravel.com), [Pusher Channels](https://pusher.com/channels), [Ably](https://ably.com) 드라이버가 기본 탑재되어 있습니다. 클라이언트 측에서는 [Laravel Echo](#client-side-installation) JavaScript 패키지를 통해 쉽게 수신할 수 있습니다.

이벤트들은 "채널" 기반으로 브로드캐스트됩니다. 채널은 공개(public) 또는 비공개(private)로 지정할 수 있습니다. 애플리케이션의 모든 방문자는 인증/인가 과정 없이 공개 채널을 구독할 수 있지만, 비공개 채널을 구독하려면 해당 채널을 청취(listen)할 권한이 있는 사용자여야 합니다.

<a name="using-example-application"></a>
### 예제 애플리케이션 활용하기

이벤트 브로드캐스팅의 전체 구성을 살펴보기 전에, 예시로 전자상거래 스토어를 들어 브로드캐스팅 동작을 간단히 살펴보겠습니다.

애플리케이션에 사용자가 자신의 주문 배송 현황을 볼 수 있는 페이지가 있다고 가정해 보세요. 또한, 애플리케이션이 배송 상태를 업데이트할 때마다 `OrderShipmentStatusUpdated` 이벤트가 발생한다고 해봅니다.

```php
use App\Events\OrderShipmentStatusUpdated;

OrderShipmentStatusUpdated::dispatch($order);
```

<a name="the-shouldbroadcast-interface"></a>
#### `ShouldBroadcast` 인터페이스

사용자가 자기 주문을 확인할 때, 배송 상태가 업데이트될 때마다 페이지를 새로 고침하지 않아도 즉시 확인이 가능하도록 만들고 싶습니다. 이런 경우, `OrderShipmentStatusUpdated` 이벤트에 `ShouldBroadcast` 인터페이스를 구현하면 됩니다. 이를 통해 이벤트가 발생할 때 자동으로 브로드캐스팅됩니다.

```php
<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class OrderShipmentStatusUpdated implements ShouldBroadcast
{
    /**
     * 주문 인스턴스.
     *
     * @var \App\Models\Order
     */
    public $order;
}
```

`ShouldBroadcast` 인터페이스는 이벤트에 반드시 `broadcastOn` 메서드를 정의하도록 요구합니다. 이 메서드는 이벤트를 어떤 채널로 브로드캐스트할지 반환해야 합니다. 기본적으로 생성된 이벤트 클래스에는 비어 있는 `broadcastOn` 메서드가 있기 때문에, 직접 내용을 작성해주기만 하면 됩니다. 이 예제에서는 주문 생성자만 배송 상태를 볼 수 있도록, 주문별로 연결된 비공개 채널로 이벤트를 브로드캐스트합니다.

```php
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;

/**
 * 이벤트가 브로드캐스트될 채널을 반환합니다.
 */
public function broadcastOn(): Channel
{
    return new PrivateChannel('orders.'.$this->order->id);
}
```

만약 이벤트를 여러 채널로 브로드캐스트하려면 배열을 반환하면 됩니다.

```php
use Illuminate\Broadcasting\PrivateChannel;

/**
 * 이벤트가 브로드캐스트될 채널(들)을 반환합니다.
 *
 * @return array<int, \Illuminate\Broadcasting\Channel>
 */
public function broadcastOn(): array
{
    return [
        new PrivateChannel('orders.'.$this->order->id),
        // ...
    ];
}
```

<a name="example-application-authorizing-channels"></a>
#### 채널 인가

비공개 채널을 청취하려면 반드시 사용자가 인가되어야 합니다. 애플리케이션의 `routes/channels.php` 파일에서 채널 인가 규칙을 정의할 수 있습니다. 아래 예제에서는, 어떤 사용자가 `orders.1`과 같은 비공개 채널을 청취하려 할 때, 실제로 그 주문을 생성한 사용자인지 확인하는 인가 콜백을 정의합니다.

```php
use App\Models\Order;
use App\Models\User;

Broadcast::channel('orders.{orderId}', function (User $user, int $orderId) {
    return $user->id === Order::findOrNew($orderId)->user_id;
});
```

`channel` 메서드는 두 개의 인자를 받습니다: 채널 이름, 그리고 사용자가 해당 채널을 청취할 수 있는지 여부를 반환하는 콜백입니다.

모든 인가 콜백의 첫 번째 인자로는 현재 인증된 사용자 객체가, 그 이후 인자로는 와일드카드 값이 각각 전달됩니다. 이 예제처럼 채널 이름에 `{orderId}` 플레이스홀더를 사용하면, 채널명 일부가 와일드카드로 동작합니다.

<a name="listening-for-event-broadcasts"></a>
#### 이벤트 브로드캐스트 수신하기

이제 남은 작업은 JavaScript 애플리케이션에서 해당 이벤트를 수신하면 됩니다. [Laravel Echo](#client-side-installation)를 활용하면 간단합니다. 먼저, `private` 메서드로 비공개 채널에 구독한 후, `listen` 메서드로 `OrderShipmentStatusUpdated` 이벤트를 리슨할 수 있습니다. 기본적으로 해당 이벤트의 모든 public 속성이 브로드캐스트 데이터에 포함됩니다.

```js
Echo.private(`orders.${orderId}`)
    .listen('OrderShipmentStatusUpdated', (e) => {
        console.log(e.order);
    });
```

<a name="defining-broadcast-events"></a>
## 브로드캐스트 이벤트 정의

특정 이벤트를 브로드캐스트하도록 라라벨에 알리려면, 해당 이벤트 클래스에서 `Illuminate\Contracts\Broadcasting\ShouldBroadcast` 인터페이스를 구현해야 합니다. 이 인터페이스는 라라벨에서 생성하는 모든 이벤트 클래스에 이미 import되어 있으므로, 손쉽게 추가할 수 있습니다.

`ShouldBroadcast` 인터페이스에는 반드시 하나의 메서드인 `broadcastOn`을 구현해야 합니다. 이 메서드는 이벤트가 브로드캐스트될 채널 또는 채널 배열을 반환해야 합니다. 크게 `Channel`, `PrivateChannel`, `PresenceChannel` 세 종류의 인스턴스를 반환할 수 있습니다. `Channel` 인스턴스는 모든 사용자가 구독할 수 있는 공개 채널을 나타내고, `PrivateChannel`과 `PresenceChannel`은 [채널 인가](#authorizing-channels)를 거쳐야 하는 비공개 채널입니다.

```php
<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class ServerCreated implements ShouldBroadcast
{
    use SerializesModels;

    /**
     * 새로운 이벤트 인스턴스 생성자.
     */
    public function __construct(
        public User $user,
    ) {}

    /**
     * 이벤트가 브로드캐스트될 채널(들)을 반환합니다.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.'.$this->user->id),
        ];
    }
}
```

`ShouldBroadcast` 인터페이스를 구현했다면, 그냥 평소처럼 [이벤트를 발생](/docs/events)시키기만 하면 됩니다. 이벤트가 발생하면, [큐 작업](/docs/queues)을 통해 자동으로 지정된 브로드캐스트 드라이버로 이벤트가 전송됩니다.

<a name="broadcast-name"></a>
### 브로드캐스트 이름

기본적으로 라라벨은 이벤트 클래스의 이름을 그대로 브로드캐스트 이름으로 사용합니다. 만약 브로드캐스트할 때의 이름을 직접 지정하고 싶다면, 이벤트 클래스에 `broadcastAs` 메서드를 정의하면 됩니다.

```php
/**
 * 이벤트 브로드캐스트 이름을 반환합니다.
 */
public function broadcastAs(): string
{
    return 'server.created';
}
```

`broadcastAs` 메서드로 브로드캐스트 이름을 커스터마이징한 경우, 이벤트 리스너를 등록할 때는 반드시 이름 앞에 `.` (dot) 문자를 붙여야 합니다. 이렇게 하면 Echo가 이벤트 이름 앞에 애플리케이션 네임스페이스를 자동으로 덧붙이지 않게 됩니다.

```javascript
.listen('.server.created', function (e) {
    // ...
});
```

<a name="broadcast-data"></a>
### 브로드캐스트 데이터

이벤트가 브로드캐스트될 때, 해당 이벤트의 모든 `public` 속성(property)은 자동으로 직렬화되어 브로드캐스트 페이로드(payload)로 전송됩니다. 이를 통해 JavaScript 애플리케이션에서 public 속성의 데이터를 쉽게 활용할 수 있습니다. 예를 들어, 이벤트에 public `$user`프로퍼티가 있고, 그 안에 Eloquent 모델이 들어 있다면, 브로드캐스트 페이로드는 아래와 같습니다.

```json
{
    "user": {
        "id": 1,
        "name": "Patrick Stewart"
        ...
    }
}
```

한편, 브로드캐스트 페이로드를 세밀하게 컨트롤하고 싶다면, 이벤트 클래스에 `broadcastWith` 메서드를 추가할 수 있습니다. 이 메서드는 브로드캐스트 페이로드로 전송할 데이터 배열을 반환해야 합니다.

```php
/**
 * 브로드캐스트할 데이터를 반환합니다.
 *
 * @return array<string, mixed>
 */
public function broadcastWith(): array
{
    return ['id' => $this->user->id];
}
```

<a name="broadcast-queue"></a>
### 브로드캐스트 큐

기본적으로 모든 브로드캐스트 이벤트는 `queue.php` 설정 파일에서 지정한 기본 큐 커넥션의 기본 큐에 할당됩니다. 브로드캐스터가 사용할 큐 커넥션과 이름을 커스터마이징하고 싶다면, 이벤트 클래스에 `connection`과 `queue` 속성을 지정할 수 있습니다.

```php
/**
 * 브로드캐스트 이벤트에 사용할 큐 커넥션 이름.
 *
 * @var string
 */
public $connection = 'redis';

/**
 * 브로드캐스팅 작업이 할당될 큐 이름.
 *
 * @var string
 */
public $queue = 'default';
```

또는, 이벤트 클래스에 `broadcastQueue` 메서드를 정의해서 큐 이름을 지정할 수도 있습니다.

```php
/**
 * 브로드캐스팅 작업이 할당될 큐 이름을 반환합니다.
 */
public function broadcastQueue(): string
{
    return 'default';
}
```

만약 기본 큐 드라이버 대신 `sync` 큐로 이벤트를 브로드캐스트하고 싶다면, `ShouldBroadcast` 대신 `ShouldBroadcastNow` 인터페이스를 구현하면 됩니다.

```php
<?php

namespace App\Events;

use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class OrderShipmentStatusUpdated implements ShouldBroadcastNow
{
    // ...
}
```

<a name="broadcast-conditions"></a>

### 브로드캐스트 조건

특정 조건이 참일 때만 이벤트를 브로드캐스트하고 싶을 때가 있습니다. 이를 위해 이벤트 클래스에 `broadcastWhen` 메서드를 추가하여 조건을 정의할 수 있습니다.

```php
/**
 * 이 이벤트를 브로드캐스트할지 여부를 결정합니다.
 */
public function broadcastWhen(): bool
{
    return $this->order->value > 100;
}
```

<a name="broadcasting-and-database-transactions"></a>
#### 브로드캐스팅과 데이터베이스 트랜잭션

브로드캐스트 이벤트가 데이터베이스 트랜잭션 내에서 디스패치될 때, 해당 이벤트가 대기열에서 데이터베이스 트랜잭션이 커밋되기 전에 처리될 수도 있습니다. 이런 경우 트랜잭션 중에 모델이나 DB 레코드가 수정된 내용이 데이터베이스에 아직 반영되지 않았을 수 있습니다. 또한, 트랜잭션 내에서 새로 생성된 모델이나 레코드가 데이터베이스에 아직 존재하지 않을 수도 있습니다. 만약 이벤트가 이런 모델에 의존하고 있다면, 브로드캐스트 이벤트가 처리되는 시점에 예기치 않은 오류가 발생할 수 있습니다.

만약 대기열 연결의 `after_commit` 설정 옵션이 `false`로 되어 있어도, 이벤트 클래스에 `ShouldDispatchAfterCommit` 인터페이스를 구현하면 해당 브로드캐스트 이벤트가 모든 열린 데이터베이스 트랜잭션이 커밋된 후에 디스패치되도록 지정할 수 있습니다.

```php
<?php

namespace App\Events;

use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Queue\SerializesModels;

class ServerCreated implements ShouldBroadcast, ShouldDispatchAfterCommit
{
    use SerializesModels;
}
```

> [!NOTE]
> 이런 문제를 회피하는 방법에 대해 더 알아보고 싶다면 [대기열 작업과 데이터베이스 트랜잭션](/docs/queues#jobs-and-database-transactions) 문서를 참고해 주세요.

<a name="authorizing-channels"></a>
## 채널 인가하기

Private 채널에서는 현재 인증된 사용자가 해당 채널을 실제로 수신할 수 있는지 확인(인가)해야 합니다. 이를 위해 라라벨 애플리케이션에 채널 이름을 포함한 HTTP 요청을 보내고, 애플리케이션이 사용자의 채널 청취 권한 유무를 판단합니다. [Laravel Echo](#client-side-installation)를 사용하는 경우, 프라이빗 채널 구독을 위한 HTTP 인가 요청은 자동으로 진행됩니다.

브로드캐스팅이 활성화되면 라라벨은 인가 요청을 처리하기 위해 `/broadcasting/auth` 라우트를 자동으로 등록합니다. 이 라우트는 `web` 미들웨어 그룹에 자동으로 포함됩니다.

<a name="defining-authorization-callbacks"></a>
### 인가 콜백 정의하기

다음으로, 현재 인증된 사용자가 특정 채널을 수신할 수 있는지 실제로 판단하는 로직을 정의해야 합니다. 이 작업은 `install:broadcasting` Artisan 명령어로 생성된 `routes/channels.php` 파일에서 수행합니다. 이 파일 내에서 `Broadcast::channel` 메서드를 사용해 채널 인가 콜백을 등록할 수 있습니다.

```php
use App\Models\User;

Broadcast::channel('orders.{orderId}', function (User $user, int $orderId) {
    return $user->id === Order::findOrNew($orderId)->user_id;
});
```

`channel` 메서드는 채널 이름과 콜백 함수 두 가지 인수를 받습니다. 콜백이 `true`를 반환하면 사용자가 채널 수신을 허용하고, `false`를 반환하면 거부합니다.

모든 인가 콜백은 첫 번째 인수로 현재 인증된 사용자를 받으며, 와일드카드로 선언한 추가 파라미터들은 그 다음 인수로 전달됩니다. 이 예시에서는 채널 이름의 "ID" 부분을 와일드카드로 처리하기 위해 `{orderId}` 플레이스홀더를 사용했습니다.

애플리케이션에 등록된 브로드캐스트 인가 콜백 목록은 `channel:list` Artisan 명령어로 확인할 수 있습니다.

```shell
php artisan channel:list
```

<a name="authorization-callback-model-binding"></a>
#### 인가 콜백과 모델 바인딩

HTTP 라우트와 마찬가지로 채널 라우트에서도 암묵적 및 명시적 [라우트 모델 바인딩](/docs/routing#route-model-binding)을 활용할 수 있습니다. 예를 들어, 문자열 또는 숫자 형태의 주문 ID를 받는 대신 실제 `Order` 모델 인스턴스를 바로 사용할 수 있습니다.

```php
use App\Models\Order;
use App\Models\User;

Broadcast::channel('orders.{order}', function (User $user, Order $order) {
    return $user->id === $order->user_id;
});
```

> [!WARNING]
> HTTP 라우트 모델 바인딩과는 달리, 채널 모델 바인딩에서는 자동 [암묵적 모델 바인딩 범위 지정](/docs/routing#implicit-model-binding-scoping)이 지원되지 않습니다. 하지만 대부분의 경우, 채널 자체가 고유한 단일 모델의 식별자로 범위가 지정되므로 큰 문제가 되지 않습니다.

<a name="authorization-callback-authentication"></a>
#### 인가 콜백과 인증

Private 및 Presence 브로드캐스트 채널에서는 라라벨 애플리케이션의 기본 인증 가드를 통해 현재 사용자를 인증합니다. 인증되지 않은 사용자는 자동으로 채널 인가가 거부되고, 인가 콜백은 실행되지 않습니다. 그러나 필요에 따라, 인가 시 사용할 여러 커스텀 가드를 지정할 수도 있습니다.

```php
Broadcast::channel('channel', function () {
    // ...
}, ['guards' => ['web', 'admin']]);
```

<a name="defining-channel-classes"></a>
### 채널 클래스 정의하기

애플리케이션에서 다양한 채널을 처리하면 `routes/channels.php` 파일이 너무 방대해질 수 있습니다. 이럴 때는 클로저 대신 채널 클래스를 사용하여 인가 로직을 분리할 수 있습니다. 채널 클래스 생성은 `make:channel` Artisan 명령어로 간단하게 할 수 있으며, 이 명령어는 `App/Broadcasting` 디렉터리에 새 클래스를 생성합니다.

```shell
php artisan make:channel OrderChannel
```

그 다음, `routes/channels.php` 파일에서 채널을 등록합니다.

```php
use App\Broadcasting\OrderChannel;

Broadcast::channel('orders.{order}', OrderChannel::class);
```

마지막으로, 채널 클래스의 `join` 메서드에서 인가 로직을 작성하면 됩니다. 이 `join` 메서드에는 기존의 채널 인가 클로저와 동일한 로직을 사용할 수 있고, 모델 바인딩도 활용할 수 있습니다.

```php
<?php

namespace App\Broadcasting;

use App\Models\Order;
use App\Models\User;

class OrderChannel
{
    /**
     * 새 채널 인스턴스 생성자.
     */
    public function __construct() {}

    /**
     * 사용자의 채널 접근 인가 처리.
     */
    public function join(User $user, Order $order): array|bool
    {
        return $user->id === $order->user_id;
    }
}
```

> [!NOTE]
> 라라벨의 다른 많은 클래스와 마찬가지로, 채널 클래스도 [서비스 컨테이너](/docs/container)에 의해 자동으로 해석(resolved)됩니다. 따라서 필요하다면 생성자에서 의존성 주입을 자유롭게 사용할 수 있습니다.

<a name="broadcasting-events"></a>
## 이벤트 브로드캐스트

이벤트를 정의하고 `ShouldBroadcast` 인터페이스로 표시했다면, 해당 이벤트의 디스패치 메서드를 사용하여 이벤트를 발생시키기만 하면 됩니다. 이벤트 디스패처는 이벤트가 `ShouldBroadcast` 인터페이스로 표시된 것을 감지하여 브로드캐스트를 위해 자동으로 큐에 추가합니다.

```php
use App\Events\OrderShipmentStatusUpdated;

OrderShipmentStatusUpdated::dispatch($order);
```

<a name="only-to-others"></a>
### 다른 사용자에게만 브로드캐스트

이벤트 브로드캐스팅을 활용하는 애플리케이션에서는, 해당 채널의 모든 구독자에게 이벤트를 보내면서 현재 사용자만 제외하고 싶을 때가 있습니다. 이 때는 `broadcast` 헬퍼와 `toOthers` 메서드를 사용하면 됩니다.

```php
use App\Events\OrderShipmentStatusUpdated;

broadcast(new OrderShipmentStatusUpdated($update))->toOthers();
```

`toOthers` 메서드를 언제 사용해야 하는지 이해하기 위해, 예를 들어 사용자가 할 일(task) 이름을 입력해 새 할 일을 생성하는 업무 관리 애플리케이션을 생각해 볼 수 있습니다. 할 일을 생성할 때, 애플리케이션은 `/task` URL로 요청을 보내고 새 할 일을 브로드캐스트하며, JSON 형태로 결과를 반환합니다. 자바스크립트 애플리케이션이 이 엔드포인트로부터 응답을 받으면 아래와 같이 할 일 목록에 직접 추가할 수 있습니다.

```js
axios.post('/task', task)
    .then((response) => {
        this.tasks.push(response.data);
    });
```

하지만, 할 일 생성 이벤트를 브로드캐스트하기도 한다는 점을 잊지 마세요. 만약 자바스크립트 애플리케이션이 해당 이벤트도 수신해서 할 일 목록에 추가한다면, 리스트에 동일한 할 일이 두 번 나타날 수 있습니다(엔드포인트와 브로드캐스트 양쪽 모두에서 추가됨). 이 문제는 `toOthers` 메서드를 사용하여, 브로드캐스터가 현재 사용자에게는 이벤트를 보내지 않도록 함으로써 해결할 수 있습니다.

> [!WARNING]
> 이벤트에서 `toOthers` 메서드를 사용하려면, 반드시 `Illuminate\Broadcasting\InteractsWithSockets` 트레이트를 적용해야 합니다.

<a name="only-to-others-configuration"></a>
#### 설정 방법

Laravel Echo 인스턴스를 초기화하면 소켓 ID가 연결에 할당됩니다. 전역 [Axios](https://github.com/axios/axios) 인스턴스를 통한 HTTP 요청에서는 소켓 ID가 모든 요청에 자동으로 `X-Socket-ID` 헤더로 포함됩니다. 이후 `toOthers` 메서드 호출 시, 라라벨은 헤더에서 해당 소켓 ID를 추출하여 동일 ID의 연결에서는 브로드캐스트하지 않도록 지시합니다.

전역 Axios 인스턴스를 사용하지 않는 경우에는, 모든 HTTP 요청에 `X-Socket-ID` 헤더를 포함시키도록 자바스크립트 애플리케이션을 직접 설정해야 합니다. 소켓 ID는 `Echo.socketId` 메서드를 통해 얻을 수 있습니다.

```js
var socketId = Echo.socketId();
```

<a name="customizing-the-connection"></a>
### 연결(커넥션) 지정하여 브로드캐스트하기

애플리케이션에서 여러 브로드캐스트 연결을 사용하고, 기본 브로드캐스터 이외의 연결에서 이벤트를 브로드캐스트하고 싶을 경우, `via` 메서드를 통해 해당 이벤트를 보낼 연결을 지정할 수 있습니다.

```php
use App\Events\OrderShipmentStatusUpdated;

broadcast(new OrderShipmentStatusUpdated($update))->via('pusher');
```

또한, 이벤트 생성자 메서드 내에서 `broadcastVia` 메서드를 호출하여 이벤트의 브로드캐스트 연결을 지정할 수도 있습니다. 다만, 이 방법을 사용하려면 이벤트 클래스에 `InteractsWithBroadcasting` 트레이트가 적용되어 있어야 합니다.

```php
<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithBroadcasting;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class OrderShipmentStatusUpdated implements ShouldBroadcast
{
    use InteractsWithBroadcasting;

    /**
     * 새 이벤트 인스턴스 생성자.
     */
    public function __construct()
    {
        $this->broadcastVia('pusher');
    }
}
```

<a name="anonymous-events"></a>
### 익명 이벤트(Anonymous Events)

가끔은 전용 이벤트 클래스를 만들지 않고 간단하게 프론트엔드로 이벤트를 브로드캐스트하고 싶을 때도 있습니다. 이런 경우 `Broadcast` 파사드를 사용해 "익명 이벤트"를 브로드캐스트할 수 있습니다.

```php
Broadcast::on('orders.'.$order->id)->send();
```

위 코드는 다음과 같은 이벤트를 브로드캐스트합니다.

```json
{
    "event": "AnonymousEvent",
    "data": "[]",
    "channel": "orders.1"
}
```

이벤트의 이름이나 데이터를 커스터마이징하고 싶다면 `as`, `with` 메서드를 사용할 수 있습니다.

```php
Broadcast::on('orders.'.$order->id)
    ->as('OrderPlaced')
    ->with($order)
    ->send();
```

위 코드는 아래와 같은 이벤트를 브로드캐스트합니다.

```json
{
    "event": "OrderPlaced",
    "data": "{ id: 1, total: 100 }",
    "channel": "orders.1"
}
```

익명 이벤트를 프라이빗 또는 프레즌스 채널로 브로드캐스트하고자 할 때는 `private`, `presence` 메서드를 사용할 수 있습니다.

```php
Broadcast::private('orders.'.$order->id)->send();
Broadcast::presence('channels.'.$channel->id)->send();
```

`send` 메서드로 익명 이벤트를 브로드캐스트하면, 애플리케이션의 [대기열](/docs/queues)로 디스패치됩니다. 이벤트를 즉시 브로드캐스트하려면 `sendNow` 메서드를 사용하세요.

```php
Broadcast::on('orders.'.$order->id)->sendNow();
```

현재 인증된 사용자를 제외한 모든 채널 구독자에게 브로드캐스트하려면 `toOthers` 메서드를 사용할 수 있습니다.

```php
Broadcast::on('orders.'.$order->id)
    ->toOthers()
    ->send();
```

<a name="receiving-broadcasts"></a>
## 브로드캐스트 수신하기

<a name="listening-for-events"></a>
### 이벤트 리스닝

[Laravel Echo를 설치 및 인스턴스화](#client-side-installation)한 후에는, 이제 라라벨 애플리케이션에서 브로드캐스트된 이벤트를 수신할 수 있습니다. 먼저 `channel` 메서드로 채널 인스턴스를 얻고, `listen` 메서드로 특정 이벤트를 리스닝 하면 됩니다.

```js
Echo.channel(`orders.${this.order.id}`)
    .listen('OrderShipmentStatusUpdated', (e) => {
        console.log(e.order.name);
    });
```

프라이빗 채널의 이벤트를 리스닝하고 싶다면 `private` 메서드를 사용하세요. 하나의 채널에서 여러 이벤트를 리스닝하려면 `listen` 메서드를 체이닝할 수 있습니다.

```js
Echo.private(`orders.${this.order.id}`)
    .listen(/* ... */)
    .listen(/* ... */)
    .listen(/* ... */);
```

<a name="stop-listening-for-events"></a>
#### 이벤트 리스닝 중단하기

특정 이벤트를 [채널에서 나가지 않고도](#leaving-a-channel) 더 이상 리스닝하지 않으려면, `stopListening` 메서드를 사용하면 됩니다.

```js
Echo.private(`orders.${this.order.id}`)
    .stopListening('OrderShipmentStatusUpdated');
```

<a name="leaving-a-channel"></a>
### 채널에서 나가기

채널에서 나가려면 Echo 인스턴스의 `leaveChannel` 메서드를 호출하세요.

```js
Echo.leaveChannel(`orders.${this.order.id}`);
```

채널뿐 아니라 그와 연결된 프라이빗 및 프레즌스 채널에서도 모두 나가고 싶다면, `leave` 메서드를 사용하세요.

```js
Echo.leave(`orders.${this.order.id}`);
```
<a name="namespaces"></a>
### 네임스페이스(Namespace)

위의 예제들에서 이벤트 클래스의 전체 `App\Events` 네임스페이스를 명시하지 않은 것을 볼 수 있습니다. 이는 Echo가 기본적으로 이벤트가 `App\Events` 네임스페이스에 있다고 가정하기 때문입니다. 만약 Echo 인스턴스를 생성할 때 `namespace` 설정 옵션을 지정하면 루트 네임스페이스를 변경할 수도 있습니다.

```js
window.Echo = new Echo({
    broadcaster: 'pusher',
    // ...
    namespace: 'App.Other.Namespace'
});
```

또한, Echo로 구독할 때 이벤트 클래스 앞에 `.`을 붙이면 항상 완전히 한정된(fully qualified) 클래스명을 지정할 수 있습니다.

```js
Echo.channel('orders')
    .listen('.Namespace\\Event\\Class', (e) => {
        // ...
    });
```

<a name="presence-channels"></a>
## 프레즌스 채널

프레즌스(presence) 채널은 프라이빗 채널의 보안성을 기반으로, 채널에 누가 구독되어 있는지까지 알 수 있게 해주는 추가 기능을 제공합니다. 이를 통해 "같은 페이지를 보고 있는 사용자를 알리기", "채팅방에 누가 들어와 있는지 보여주기"와 같은 강력한 협업 기능을 쉽게 만들 수 있습니다.

<a name="authorizing-presence-channels"></a>
### 프레즌스 채널 인가

모든 프레즌스 채널은 프라이빗 채널이기도 하므로, 사용자가 접근하려면 [인가가 필요](#authorizing-channels)합니다. 그러나 프레즌스 채널의 인가 콜백에서는 사용자가 채널에 조인할 수 있는지 `true` 대신, 사용자에 대한 배열 데이터를 반환하도록 해야 합니다.

이 콜백이 반환한 데이터는 자바스크립트에서 프레즌스 채널의 이벤트 리스너를 통해 접근할 수 있습니다. 사용자가 채널에 조인할 권한이 없을 경우, `false`나 `null`을 반환해야 합니다.

```php
use App\Models\User;

Broadcast::channel('chat.{roomId}', function (User $user, int $roomId) {
    if ($user->canJoinRoom($roomId)) {
        return ['id' => $user->id, 'name' => $user->name];
    }
});
```

<a name="joining-presence-channels"></a>
### 프레즌스 채널 입장(join)하기

프레즌스 채널에 조인하려면 Echo의 `join` 메서드를 사용합니다. 이 메서드는 `PresenceChannel` 구현체를 반환하며, 여기서 `listen`뿐만 아니라 `here`, `joining`, `leaving` 이벤트에도 연결할 수 있습니다.

```js
Echo.join(`chat.${roomId}`)
    .here((users) => {
        // ...
    })
    .joining((user) => {
        console.log(user.name);
    })
    .leaving((user) => {
        console.log(user.name);
    })
    .error((error) => {
        console.error(error);
    });
```

`here` 콜백은 채널에 성공적으로 조인한 직후 한 번 실행되며, 현재 채널에 참여하는 모든 사용자의 정보를 배열 형태로 전달받습니다. `joining` 메서드는 다른 사용자가 입장할 때마다, `leaving` 메서드는 사용자가 퇴장할 때마다 실행됩니다. `error` 메서드는 인증 엔드포인트에서 200이 아닌 상태 코드를 반환하거나, 반환된 JSON 파싱에 문제가 있을 때 호출됩니다.

<a name="broadcasting-to-presence-channels"></a>
### 프레즌스 채널로 브로드캐스트하기

프레즌스 채널도 퍼블릭, 프라이빗 채널처럼 이벤트를 받을 수 있습니다. 예를 들어, 채팅방 애플리케이션에서 `NewMessage` 이벤트를 프레즌스 채널로 브로드캐스트할 수 있습니다. 이를 위해 이벤트의 `broadcastOn` 메서드에서 `PresenceChannel` 인스턴스를 반환하면 됩니다.

```php
/**
 * 이벤트가 브로드캐스트될 채널 반환.
 *
 * @return array<int, \Illuminate\Broadcasting\Channel>
 */
public function broadcastOn(): array
{
    return [
        new PresenceChannel('chat.'.$this->message->room_id),
    ];
}
```

다른 이벤트와 마찬가지로, 현재 사용자를 제외하고 브로드캐스트하려면 `broadcast` 헬퍼와 `toOthers` 메서드를 함께 사용할 수 있습니다.

```php
broadcast(new NewMessage($message));

broadcast(new NewMessage($message))->toOthers();
```

프레즌스 채널로 전송된 이벤트도 Echo의 `listen` 메서드로 수신할 수 있습니다.

```js
Echo.join(`chat.${roomId}`)
    .here(/* ... */)
    .joining(/* ... */)
    .leaving(/* ... */)
    .listen('NewMessage', (e) => {
        // ...
    });
```

<a name="model-broadcasting"></a>
## 모델 브로드캐스트

> [!WARNING]
> 아래 모델 브로드캐스트 관련 문서를 읽기 전에, 라라벨의 모델 브로드캐스트 서비스의 기본 개념과, 브로드캐스트 이벤트를 수동으로 생성/수신하는 방법을 먼저 숙지할 것을 권장합니다.

애플리케이션에서 [Eloquent 모델](/docs/eloquent)이 생성, 수정, 삭제될 때마다 이벤트를 브로드캐스트하는 경우가 많습니다. 물론, 상태 변경마다 커스텀 이벤트를 직접 정의하고, 해당 이벤트마다 `ShouldBroadcast` 인터페이스를 지정해서 사용할 수도 있습니다.

하지만, 이런 이벤트 클래스를 순수히 브로드캐스트만을 위해 계속 만드는 것은 부담스러울 수 있습니다. 이를 간편하게 해결하기 위해, 라라벨에서는 Eloquent 모델의 상태가 변경될 때마다 자동으로 브로드캐스트하도록 지정할 수 있습니다.

시작하려면, Eloquent 모델에서 `Illuminate\Database\Eloquent\BroadcastsEvents` 트레이트를 사용하세요. 그리고 모델에 `broadcastOn` 메서드를 정의하여, 모델의 이벤트를 브로드캐스트할 채널 배열을 반환해야 합니다.

```php
<?php

namespace App\Models;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Database\Eloquent\BroadcastsEvents;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Post extends Model
{
    use BroadcastsEvents, HasFactory;

    /**
     * 포스트를 소유한 사용자 반환.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * 모델 이벤트가 브로드캐스트될 채널 반환.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel|\Illuminate\Database\Eloquent\Model>
     */
    public function broadcastOn(string $event): array
    {
        return [$this, $this->user];
    }
}
```

이처럼 트레이트와 채널 배열을 반환하는 `broadcastOn` 메서드를 추가하면, 모델 인스턴스가 생성, 수정, 삭제, soft delete(휴지통), 복원될 때마다 자동으로 브로드캐스트됩니다.

또한, `broadcastOn` 메서드는 `$event`라는 문자열 인수를 받는데, 이 인수에는 모델에 발생한 이벤트 타입(예: `created`, `updated`, `deleted`, `trashed`, `restored`)이 들어옵니다. 이 변수를 확인하여 특정 이벤트마다 어떤 채널(혹은 아무 채널도 아님)로 브로드캐스트할지 결정할 수도 있습니다.

```php
/**
 * 모델 이벤트가 브로드캐스트될 채널 반환.
 *
 * @return array<string, array<int, \Illuminate\Broadcasting\Channel|\Illuminate\Database\Eloquent\Model>>
 */
public function broadcastOn(string $event): array
{
    return match ($event) {
        'deleted' => [],
        default => [$this, $this->user],
    };
}
```

<a name="customizing-model-broadcasting-event-creation"></a>
#### 모델 브로드캐스트 이벤트 생성 커스터마이징

때로는 라라벨이 내부적으로 생성하는 모델 브로드캐스트 이벤트의 생성 방식을 커스터마이징하고 싶을 수 있습니다. 이럴 때는 Eloquent 모델에 `newBroadcastableEvent` 메서드를 직접 정의하면 됩니다. 이 메서드는 반드시 `Illuminate\Database\Eloquent\BroadcastableModelEventOccurred` 인스턴스를 반환해야 합니다.

```php
use Illuminate\Database\Eloquent\BroadcastableModelEventOccurred;

/**
 * 모델을 위한 새로운 브로드캐스트 가능 이벤트 생성.
 */
protected function newBroadcastableEvent(string $event): BroadcastableModelEventOccurred
{
    return (new BroadcastableModelEventOccurred(
        $this, $event
    ))->dontBroadcastToCurrentUser();
}
```

<a name="model-broadcasting-conventions"></a>
### 모델 브로드캐스트 규약

<a name="model-broadcasting-channel-conventions"></a>
#### 채널 네이밍 규약

위의 모델 예제에서 `broadcastOn` 메서드가 `Channel` 인스턴스가 아닌 Eloquent 모델 그 자체를 반환한 것을 볼 수 있습니다. 만약 모델 인스턴스를 반환하거나 배열로 포함하면, 라라벨은 자동으로 해당 모델의 클래스명과 기본 키 식별자를 조합해 프라이빗 채널 인스턴스를 생성합니다.

예를 들어, `App\Models\User` 모델의 `id`가 `1`이라면, `App.Models.User.1`이라는 이름의 `Illuminate\Broadcasting\PrivateChannel` 인스턴스로 변환됩니다. 물론, `broadcastOn` 메서드에서 직접 `Channel` 인스턴스를 반환하면 채널 이름을 완전히 원하는 대로 지정할 수도 있습니다.

```php
use Illuminate\Broadcasting\PrivateChannel;

/**
 * 모델 이벤트가 브로드캐스트될 채널 반환.
 *
 * @return array<int, \Illuminate\Broadcasting\Channel>
 */
public function broadcastOn(string $event): array
{
    return [
        new PrivateChannel('user.'.$this->id)
    ];
}
```

오히려 채널 인스턴스를 직접 반환할 때, Eloquent 모델 인스턴스를 생성자에 전달할 수도 있습니다. 이 경우 앞서 설명한 모델 채널 네이밍 규약에 따라 자동으로 채널 이름 문자열이 생성됩니다.

```php
return [new Channel($this->user)];
```

특정 모델의 채널 이름을 확인하려면, 모델 인스턴스에서 `broadcastChannel` 메서드를 호출하면 됩니다. 예를 들어, `id`가 `1`인 `App\Models\User`의 경우 `App.Models.User.1` 이 반환됩니다.

```php
$user->broadcastChannel();
```

<a name="model-broadcasting-event-conventions"></a>

#### 이벤트 명명 규칙

모델 브로드캐스트 이벤트는 애플리케이션의 `App\Events` 디렉터리 내의 "실제" 이벤트와 연결되어 있지 않기 때문에, 이름과 페이로드가 특정 규칙에 따라 자동으로 지정됩니다. 라라벨의 기본 규칙은, 해당 모델의 클래스 이름(네임스페이스 제외)과 브로드캐스트를 트리거한 모델 이벤트 이름을 합쳐 이벤트명을 정하는 방식입니다.

예를 들어, `App\Models\Post` 모델이 업데이트되는 경우, 클라이언트 애플리케이션에는 `PostUpdated`라는 이벤트명과 아래와 같은 페이로드가 브로드캐스트됩니다.

```json
{
    "model": {
        "id": 1,
        "title": "My first post"
        ...
    },
    ...
    "socket": "someSocketId"
}
```

또한, `App\Models\User` 모델이 삭제될 경우에는 `UserDeleted`라는 이름의 이벤트가 브로드캐스트됩니다.

필요하다면, 모델에 `broadcastAs`와 `broadcastWith` 메서드를 추가하여 브로드캐스트할 이벤트명과 페이로드를 직접 정의할 수 있습니다. 이 메서드들은 해당 모델 이벤트/동작의 이름을 인수로 받아, 각 모델 동작에 대해 이벤트 이름과 페이로드를 커스터마이즈할 수 있도록 해줍니다. 만약 `broadcastAs` 메서드에서 `null`이 반환되면, 라라벨은 위에서 설명한 기본 이벤트 명명 규칙을 따라 이벤트를 브로드캐스트합니다.

```php
/**
 * 모델 이벤트의 브로드캐스트 이름을 반환합니다.
 */
public function broadcastAs(string $event): string|null
{
    return match ($event) {
        'created' => 'post.created',
        default => null,
    };
}

/**
 * 모델의 브로드캐스트 데이터 반환.
 *
 * @return array<string, mixed>
 */
public function broadcastWith(string $event): array
{
    return match ($event) {
        'created' => ['title' => $this->title],
        default => ['model' => $this],
    };
}
```

<a name="listening-for-model-broadcasts"></a>
### 모델 브로드캐스트 이벤트 수신하기

모델에 `BroadcastsEvents` 트레이트를 추가하고, `broadcastOn` 메서드를 정의했다면, 이제 클라이언트 애플리케이션에서 브로드캐스트된 모델 이벤트를 수신할 준비가 된 것입니다. 본격적으로 시작하기 전에, [이벤트 수신](#listening-for-events) 관련 전체 문서를 참고하시면 도움이 됩니다.

우선, `private` 메서드를 사용해 채널 인스턴스를 가져온 뒤, `listen` 메서드를 통해 특정 이벤트를 수신할 수 있습니다. 일반적으로, `private` 메서드에 지정하는 채널 이름은 라라벨의 [모델 브로드캐스팅 규칙](#model-broadcasting-conventions)을 따라야 합니다.

채널 인스턴스를 얻은 후에는 `listen` 메서드로 특정 이벤트를 수신할 수 있습니다. 모델 브로드캐스트 이벤트는 애플리케이션의 `App\Events` 디렉터리에 실제로 존재하는 이벤트와 연결되어 있지 않기 때문에, [이벤트 이름](#model-broadcasting-event-conventions)은 네임스페이스에 속하지 않음을 나타내기 위해 반드시 `.`(점)으로 시작해야 합니다. 각 모델 브로드캐스트 이벤트에는 `model` 속성이 포함되어 있으며, 이 속성에 모델의 모든 브로드캐스트 가능한 속성들이 담깁니다.

```js
Echo.private(`App.Models.User.${this.user.id}`)
    .listen('.PostUpdated', (e) => {
        console.log(e.model);
    });
```

<a name="client-events"></a>
## 클라이언트 이벤트

> [!NOTE]
> [Pusher Channels](https://pusher.com/channels)를 사용할 때, 클라이언트 이벤트를 전송하려면 [애플리케이션 대시보드](https://dashboard.pusher.com/)의 "App Settings" 섹션에서 "Client Events" 옵션을 반드시 활성화해야 합니다.

때로는 라라벨 애플리케이션으로 요청을 보내지 않고도, 다른 연결된 클라이언트들에게 이벤트를 브로드캐스트하고 싶을 때가 있습니다. 대표적으로 "입력 중" 알림 기능 등에서 사용될 수 있는데, 사용자들에게 특정 화면에서 다른 사용자가 메시지를 입력 중임을 실시간으로 알려주고 싶을 때 활용됩니다.

이런 클라이언트 이벤트를 브로드캐스트하려면 Echo의 `whisper` 메서드를 사용할 수 있습니다.

```js
Echo.private(`chat.${roomId}`)
    .whisper('typing', {
        name: this.user.name
    });
```

클라이언트 이벤트를 수신하려면 `listenForWhisper` 메서드를 사용합니다.

```js
Echo.private(`chat.${roomId}`)
    .listenForWhisper('typing', (e) => {
        console.log(e.name);
    });
```

<a name="notifications"></a>
## 알림

이벤트 브로드캐스팅을 [알림](/docs/notifications) 기능과 조합하면, 자바스크립트 애플리케이션은 페이지를 새로고침하지 않고도 새로운 알림이 발생하는 즉시 수신할 수 있습니다. 시작하기 전에 [브로드캐스트 알림 채널](/docs/notifications#broadcast-notifications) 관련 문서를 먼저 읽어 두시기 바랍니다.

알림에서 브로드캐스트 채널을 사용하도록 설정했다면, Echo의 `notification` 메서드로 해당 브로드캐스트 이벤트를 손쉽게 수신할 수 있습니다. 이때 채널 이름은 알림을 수신하는 엔티티의 클래스명과 일치해야 합니다.

```js
Echo.private(`App.Models.User.${userId}`)
    .notification((notification) => {
        console.log(notification.type);
    });
```

이 예제에서는 `broadcast` 채널을 통해 `App\Models\User` 인스턴스에 전송된 모든 알림이 콜백으로 전달됩니다. `App.Models.User.{id}` 채널에 대한 채널 권한 부여 콜백은 애플리케이션의 `routes/channels.php` 파일에 이미 포함되어 있습니다.