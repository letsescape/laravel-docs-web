# 브로드캐스팅 (Broadcasting)

- [소개](#introduction)
- [서버 사이드 설치](#server-side-installation)
    - [설정](#configuration)
    - [Reverb](#reverb)
    - [Pusher Channels](#pusher-channels)
    - [Ably](#ably)
    - [오픈 소스 대안](#open-source-alternatives)
- [클라이언트 사이드 설치](#client-side-installation)
    - [Reverb](#client-reverb)
    - [Pusher Channels](#client-pusher-channels)
    - [Ably](#client-ably)
- [개념 개요](#concept-overview)
    - [예제 애플리케이션 사용하기](#using-example-application)
- [브로드캐스트 이벤트 정의](#defining-broadcast-events)
    - [브로드캐스트 이름](#broadcast-name)
    - [브로드캐스트 데이터](#broadcast-data)
    - [브로드캐스트 큐](#broadcast-queue)
    - [브로드캐스트 조건](#broadcast-conditions)
    - [브로드캐스팅과 데이터베이스 트랜잭션](#broadcasting-and-database-transactions)
- [채널 인가](#authorizing-channels)
    - [인가 라우트 정의](#defining-authorization-routes)
    - [인가 콜백 정의](#defining-authorization-callbacks)
    - [채널 클래스 정의](#defining-channel-classes)
- [이벤트 브로드캐스팅](#broadcasting-events)
    - [다른 사용자에게만 브로드캐스트하기](#only-to-others)
    - [커스텀 커넥션 사용하기](#customizing-the-connection)
- [브로드캐스트 수신하기](#receiving-broadcasts)
    - [이벤트 리스닝](#listening-for-events)
    - [채널 나가기](#leaving-a-channel)
    - [네임스페이스](#namespaces)
- [프레즌스 채널](#presence-channels)
    - [프레즌스 채널 인가](#authorizing-presence-channels)
    - [프레즌스 채널 참가](#joining-presence-channels)
    - [프레즌스 채널로 브로드캐스트](#broadcasting-to-presence-channels)
- [모델 브로드캐스팅](#model-broadcasting)
    - [모델 브로드캐스팅 규칙](#model-broadcasting-conventions)
    - [모델 브로드캐스트 리스닝](#listening-for-model-broadcasts)
- [클라이언트 이벤트](#client-events)
- [알림(Notification)](#notifications)

<a name="introduction"></a>
## 소개

현대 웹 애플리케이션에서는 실시간으로 사용자 인터페이스를 업데이트하기 위해 WebSocket을 자주 사용합니다. 서버에서 어떤 데이터가 변경될 때, 보통 WebSocket 연결을 통해 메시지를 클라이언트로 보내고 그에 맞게 화면을 갱신합니다. WebSocket은 데이터 변경 사항을 확인하기 위해 애플리케이션의 서버를 반복적으로 폴링하는 것보다 훨씬 효율적입니다.

예를 들어, 사용자의 데이터를 CSV 파일로 내보내고 이메일로 전송하는 기능을 생각해봅시다. CSV 파일을 생성하는 데 몇 분이 걸리기 때문에, [큐를 사용해서 작업](/docs/10.x/queues)을 처리한다고 가정해봅니다. CSV 생성과 발송이 모두 끝나면, 우리는 `App\Events\UserDataExported` 이벤트를 브로드캐스트하여 자바스크립트에서 이 이벤트를 받을 수 있습니다. 이렇게 이벤트가 전달되면, 사용자는 페이지를 새로고침할 필요 없이 "CSV 파일이 이메일로 전송되었습니다"와 같은 메시지를 바로 볼 수 있습니다.

이처럼 실시간 기능을 손쉽게 구현할 수 있도록, 라라벨은 서버 측의 [이벤트](/docs/10.x/events)를 WebSocket 연결을 통해 손쉽게 "브로드캐스트(Broadcast)"할 수 있도록 지원합니다. 브로드캐스트를 사용하면 서버 측 라라벨 애플리케이션과 클라이언트 측 자바스크립트 애플리케이션 간에 동일한 이벤트 이름과 데이터를 공유할 수 있습니다.

브로드캐스트의 기본 개념은 단순합니다. 클라이언트는 프론트엔드에서 이름이 지정된 채널에 연결하고, 라라벨 애플리케이션이 백엔드에서 해당 채널로 이벤트를 브로드캐스트합니다. 이 이벤트에는 프론트엔드에 전달하고 싶은 추가 데이터를 자유롭게 담을 수 있습니다.

<a name="supported-drivers"></a>
#### 지원되는 드라이버

라라벨은 기본적으로 세 가지 서버 사이드 브로드캐스팅 드라이버를 제공합니다: [Laravel Reverb](https://reverb.laravel.com), [Pusher Channels](https://pusher.com/channels), [Ably](https://ably.com).

> [!NOTE]
> 본격적으로 이벤트 브로드캐스팅을 시작하기 전에, 라라벨의 [이벤트와 리스너](/docs/10.x/events)에 대한 문서를 먼저 읽어보는 것을 추천합니다.

<a name="server-side-installation"></a>
## 서버 사이드 설치

라라벨의 이벤트 브로드캐스팅을 사용하려면, 먼저 라라벨 애플리케이션 내에서 몇 가지 설정을 하고 필요한 패키지를 설치해야 합니다.

이벤트 브로드캐스팅은 서버 사이드 브로드캐스트 드라이버가 담당하며, 이 드라이버가 라라벨의 이벤트를 브라우저 클라이언트에서 받을 수 있도록 [Laravel Echo](https://github.com/laravel/echo)라는 자바스크립트 라이브러리로 전송합니다. 설치 과정은 아래에서 하나씩 자세히 안내합니다.

<a name="configuration"></a>
### 설정

애플리케이션의 이벤트 브로드캐스팅 관련 모든 설정은 `config/broadcasting.php` 파일에 저장됩니다. 라라벨은 기본적으로 여러 브로드캐스트 드라이버를 지원합니다: [Pusher Channels](https://pusher.com/channels), [Redis](/docs/10.x/redis), 그리고 로컬 개발 및 디버깅용 `log` 드라이버입니다. 또한, 테스트 시 브로드캐스팅을 완전히 비활성화할 수 있는 `null` 드라이버도 포함되어 있습니다. 각각의 드라이버에 대한 예시 설정이 `config/broadcasting.php` 파일에 들어있으니 참고하면 좋습니다.

<a name="broadcast-service-provider"></a>
#### 브로드캐스트 서비스 프로바이더

이벤트를 브로드캐스트하기 전에, 먼저 `App\Providers\BroadcastServiceProvider`를 등록해야 합니다. 최신 라라벨 애플리케이션에서는 `config/app.php` 설정 파일의 `providers` 배열에서 이 프로바이더의 주석만 해제하면 됩니다. `BroadcastServiceProvider`에는 브로드캐스트 인가(authorization) 라우트와 콜백을 등록하는데 필요한 코드가 들어있습니다.

<a name="queue-configuration"></a>
#### 큐 설정

또한 [큐 워커(worker)](/docs/10.x/queues)를 설정하고 실행해야 합니다. 모든 이벤트 브로드캐스팅 작업은 큐에 쌓인 작업(job)으로 처리되어, 이벤트 브로드캐스팅이 애플리케이션의 응답 속도에 영향을 주지 않도록 설계되어 있습니다.

<a name="reverb"></a>
### Reverb

Reverb는 Composer 패키지 매니저를 사용해 설치할 수 있습니다.

```sh
composer require laravel/reverb
```

패키지 설치가 완료되면, 아래 설치 명령어를 실행하여 설정 파일을 발행하고, 애플리케이션의 브로드캐스팅 설정을 갱신하며, Reverb에 필요한 환경 변수를 추가할 수 있습니다.

```sh
php artisan reverb:install
```

Reverb 설치 및 사용에 대한 자세한 방법은 [Reverb 공식 문서](/docs/10.x/reverb)를 참고하세요.

<a name="pusher-channels"></a>
### Pusher Channels

[Pusher Channels](https://pusher.com/channels)로 이벤트를 브로드캐스트하고자 할 경우, Composer 패키지 매니저를 사용해 Pusher Channels PHP SDK를 설치해야 합니다.

```shell
composer require pusher/pusher-php-server
```

설치 후에는 `config/broadcasting.php` 설정 파일에서 Pusher Channels 자격 증명(키, 시크릿, 앱 ID 등)을 입력해야 합니다. 이 파일에는 이미 Pusher Channels 설정 예시가 포함되어 있어, 키 값만 간편하게 바꾸면 됩니다. 일반적으로 이 값들은 `PUSHER_APP_KEY`, `PUSHER_APP_SECRET`, `PUSHER_APP_ID`와 같은 [환경 변수](/docs/10.x/configuration#environment-configuration)로 설정합니다.

```ini
PUSHER_APP_ID=your-pusher-app-id
PUSHER_APP_KEY=your-pusher-key
PUSHER_APP_SECRET=your-pusher-secret
PUSHER_APP_CLUSTER=mt1
```

`config/broadcasting.php` 파일의 `pusher` 설정 항목에서는 cluster 등 Channels에서 지원하는 다양한 `options` 옵션도 지정할 수 있습니다.

그 다음 `.env` 파일에서 브로드캐스트 드라이버를 `pusher`로 변경해야 합니다.

```ini
BROADCAST_DRIVER=pusher
```

이제 클라이언트에서 브로드캐스트 이벤트를 수신하기 위해 [Laravel Echo](#client-side-installation)를 설치하고 설정할 준비가 되었습니다.

<a name="pusher-compatible-open-source-alternatives"></a>
#### 오픈 소스 Pusher 호환 대안

[soketi](https://docs.soketi.app/)는 라라벨을 위한 Pusher 호환 웹소켓 서버를 제공합니다. 이를 사용하면 상용(WebSocket) 서비스 없이도 라라벨 브로드캐스팅의 강력한 기능을 그대로 활용할 수 있습니다. 오픈 소스 패키지로 브로드캐스팅을 구현하는 방법은 [오픈 소스 대안](#open-source-alternatives) 문서를 참고해주세요.

<a name="ably"></a>
### Ably

> [!NOTE]
> 아래 설명은 Ably를 "Pusher 호환" 모드로 사용할 때에 대한 안내입니다. 하지만 Ably 팀에서는 Ably 고유의 기능을 최대한 활용할 수 있는 자체 브로드캐스터 및 Echo 클라이언트를 직접 제공하고 있습니다. 이에 대해 더 알아보고 싶다면 [Ably의 라라벨 브로드캐스터 공식 문서](https://github.com/ably/laravel-broadcaster)를 참고하시기 바랍니다.

[Ably](https://ably.com)를 통해 이벤트를 브로드캐스트하려면, Composer로 Ably PHP SDK를 설치해야 합니다.

```shell
composer require ably/ably-php
```

설치 후에는 `config/broadcasting.php` 파일에서 Ably 자격 증명을 설정해야 하며, 이미 포함되어 있는 설정 예시를 참고해 키 값을 바꾸면 됩니다. 일반적으로 이 값은 `ABLY_KEY` [환경 변수](/docs/10.x/configuration#environment-configuration)로 지정합니다.

```ini
ABLY_KEY=your-ably-key
```

이후 `.env` 파일에서 브로드캐스트 드라이버를 `ably`로 변경합니다.

```ini
BROADCAST_DRIVER=ably
```

마지막으로, 클라이언트에서 브로드캐스트 이벤트를 받기 위해 [Laravel Echo](#client-side-installation)를 설치하고 설정하면 됩니다.

<a name="open-source-alternatives"></a>
### 오픈 소스 대안

<a name="open-source-alternatives-node"></a>
#### Node

[Soketi](https://github.com/soketi/soketi)는 Node 기반의 라라벨용 Pusher 호환 웹소켓 서버입니다. 내부적으로는 극한의 확장성과 속도를 위해 µWebSockets.js를 사용합니다. 이 패키지를 사용하면 상용 WebSocket 서비스 없이도 라라벨 브로드캐스트의 모든 기능을 누릴 수 있습니다. 패키지 설치 및 사용법에 대한 자세한 정보는 [공식 문서](https://docs.soketi.app/)를 참고하세요.

<a name="client-side-installation"></a>
## 클라이언트 사이드 설치

<a name="client-reverb"></a>
### Reverb

[Laravel Echo](https://github.com/laravel/echo)는 서버 사이드 브로드캐스트 드라이버가 브로드캐스트하는 이벤트를 손쉽게 구독하고 수신할 수 있는 자바스크립트 라이브러리입니다. Echo는 NPM 패키지 매니저를 통해 설치할 수 있습니다. 여기서는 Reverb가 Pusher 프로토콜을 활용하여 WebSocket 구독과 채널, 메시지를 처리하므로, `pusher-js` 패키지도 함께 설치합니다.

```shell
npm install --save-dev laravel-echo pusher-js
```

Echo를 설치하면 이제 애플리케이션의 자바스크립트에서 Echo 인스턴스를 새로 생성할 준비가 된 것입니다. 이 설정은 보통 라라벨에서 기본 제공되는 `resources/js/bootstrap.js` 파일 하단에 하는 것이 좋습니다. 기본적으로 이 파일에 Echo 설정 예시가 주석 처리되어 있으니, 주석을 해제하고 `broadcaster` 옵션만 `reverb`로 변경하면 됩니다.

```js
import Echo from 'laravel-echo';

import Pusher from 'pusher-js';
window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT,
    wssPort: import.meta.env.VITE_REVERB_PORT,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
});
```

그 다음 애플리케이션의 에셋을 빌드합니다.

```shell
npm run build
```

> [!WARNING]
> Laravel Echo의 `reverb` 브로드캐스터는 laravel-echo v1.16.0 이상이 필요합니다.

<a name="client-pusher-channels"></a>
### Pusher Channels

[Laravel Echo](https://github.com/laravel/echo)는 서버 사이드 브로드캐스트 드라이버가 브로드캐스트하는 이벤트를 손쉽게 구독하고 수신할 수 있는 자바스크립트 라이브러리입니다. Echo는 NPM 패키지 매니저로 설치할 수 있으며, Pusher Channels 브로드캐스터를 사용할 것이므로 `pusher-js` 패키지도 함께 설치합니다.

```shell
npm install --save-dev laravel-echo pusher-js
```

Echo 설치가 완료되면, 라라벨 프레임워크에서 기본 제공하는 `resources/js/bootstrap.js` 파일 하단에서 새 Echo 인스턴스를 생성하면 됩니다. 기본적으로 이 파일에는 Echo 설정 예시가 주석 처리되어 있으니, 주석만 해제하면 바로 사용할 수 있습니다.

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

Echo 설정을 필요에 맞게 주석 해제 및 수정하였다면, 이제 애플리케이션의 에셋을 빌드해주십시오.

```shell
npm run build
```

> [!NOTE]
> 자바스크립트 에셋 컴파일 방법에 대한 자세한 내용은 [Vite](/docs/10.x/vite) 문서를 참고하세요.

<a name="using-an-existing-client-instance"></a>
#### 기존 클라이언트 인스턴스 사용하기

이미 구성된 Pusher Channels 클라이언트 인스턴스가 있다면, Echo의 `client` 설정 옵션을 사용해 직접 전달할 수도 있습니다.

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
### Ably

> [!NOTE]
> 아래 설명은 Ably를 "Pusher 호환" 모드로 사용하는 방법을 안내합니다. 그러나 Ably 팀은 Ably만의 특화된 기능을 최대한 활용할 수 있도록 자체 브로드캐스터와 Echo 클라이언트를 제공하므로, 이에 대한 자세한 사항은 [Ably의 라라벨 브로드캐스터 공식 문서](https://github.com/ably/laravel-broadcaster)를 참고해 주세요.

[Laravel Echo](https://github.com/laravel/echo)는 서버 브로드캐스트 드라이버가 브로드캐스트하는 이벤트를 손쉽게 구독하고 수신할 수 있는 자바스크립트 라이브러리입니다. Echo는 NPM 패키지 매니저로 설치할 수 있으며, 이 예시에서도 `pusher-js` 패키지를 함께 설치합니다.

비록 이벤트 브로드캐스트에 Ably를 사용한다 해도, 클라이언트에서는 왜 `pusher-js` 자바스크립트 라이브러리를 설치하는지 궁금할 수 있습니다. 다행히도, Ably는 "Pusher 프로토콜 호환" 모드를 제공하여 클라이언트에서는 Pusher 프로토콜로 이벤트를 받을 수 있습니다.

```shell
npm install --save-dev laravel-echo pusher-js
```

**계속 진행하기 전에 반드시 Ably 대시보드의 애플리케이션 설정 내 "Protocol Adapter Settings"에서 Pusher 프로토콜 지원을 활성화해야 합니다.**

Echo 설치 후에는, 라라벨 프레임워크에서 기본 제공하는 `resources/js/bootstrap.js` 파일 하단에 Echo 인스턴스를 새로 만들어야 합니다. 기본적으로 이 파일에는 Pusher용 기본 설정이 주어지며, 이를 아래 설정으로 교체하면 Ably로 전환할 수 있습니다.

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

여기서 Echo 설정의 `VITE_ABLY_PUBLIC_KEY` 환경 변수는 Ably의 퍼블릭 키여야 하며, Ably 키에서 `:` 문자 앞부분이 퍼블릭 키입니다.

Echo 설정을 수정했다면, 다음과 같이 에셋을 빌드합니다.

```shell
npm run dev
```

> [!NOTE]
> 자바스크립트 에셋 컴파일에 관한 더 많은 정보는 [Vite](/docs/10.x/vite) 문서를 참고하세요.

<a name="concept-overview"></a>
## 개념 개요

라라벨의 이벤트 브로드캐스팅 기능을 사용하면 드라이버 기반의 WebSocket 방식을 통해 서버 사이드의 라라벨 이벤트를 클라이언트 측 자바스크립트 애플리케이션에 브로드캐스트할 수 있습니다. 현재 라라벨은 [Pusher Channels](https://pusher.com/channels), [Ably](https://ably.com) 드라이버를 기본으로 지원합니다. 브로드캐스트된 이벤트는 [Laravel Echo](#client-side-installation) 자바스크립트 패키지를 통해 클라이언트에서 간단히 수신할 수 있습니다.

이벤트는 "채널(channel)"을 통해 브로드캐스트되며, 채널은 공개(public) 또는 비공개(private)로 지정할 수 있습니다. 애플리케이션의 모든 방문자는 인증 없이 공개 채널을 구독할 수 있지만, 비공개 채널을 구독하려면 반드시 사용자가 인증되고 인가를 받아야 합니다.

> [!NOTE]
> Pusher의 오픈 소스 대안에 대해 더 알아보고 싶다면, [오픈 소스 대안](#open-source-alternatives) 항목을 참고하세요.

<a name="using-example-application"></a>
### 예제 애플리케이션 사용하기

이벤트 브로드캐스팅의 각 컴포넌트를 본격적으로 살펴보기 전에, 실제 전자상거래 쇼핑몰을 예로 들어 전체 흐름을 간단하게 살펴보겠습니다.

우리 애플리케이션에는 사용자가 자신의 주문 배송 상태를 확인할 수 있는 페이지가 있다고 가정합시다. 애플리케이션에서 배송 상태가 변경되면 `OrderShipmentStatusUpdated` 이벤트를 발생시키도록 처리합니다.

```
use App\Events\OrderShipmentStatusUpdated;

OrderShipmentStatusUpdated::dispatch($order);
```

<a name="the-shouldbroadcast-interface"></a>
#### `ShouldBroadcast` 인터페이스

사용자가 자신의 주문 내역을 보고 있을 때, 매번 페이지를 새로고침해야만 상태가 갱신된다면 불편하겠죠. 대신 상태 변경이 발생하면 실시간으로 업데이트 내용을 브로드캐스트하고 싶을 것입니다. 이를 위해 `OrderShipmentStatusUpdated` 이벤트에 `ShouldBroadcast` 인터페이스를 추가합니다. 이렇게 하면 이 이벤트가 발생할 때마다 라라벨이 자동으로 이벤트를 브로드캐스트합니다.

```
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
     * The order instance.
     *
     * @var \App\Models\Order
     */
    public $order;
}
```

`ShouldBroadcast` 인터페이스를 구현하면, 반드시 `broadcastOn` 메서드를 정의해야 합니다. 이 메서드는 이벤트를 브로드캐스트할 채널을 반환해야 하며, 이벤트 클래스가 자동으로 생성될 때 이 메서드의 빈 틀도 함께 포함되어 있습니다. 이제 이 메서드에 실제 구현만 추가하면 되는데, 여기서는 주문을 만든 사용자만 자신의 상태를 볼 수 있도록 특정 주문에 연결된 비공개 채널로 이벤트를 브로드캐스트합니다.

```
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;

/**
 * Get the channel the event should broadcast on.
 */
public function broadcastOn(): Channel
{
    return new PrivateChannel('orders.'.$this->order->id);
}
```

이벤트를 여러 채널에 브로드캐스트하고 싶다면, `array`로 반환하면 됩니다.

```
use Illuminate\Broadcasting\PrivateChannel;

/**
 * Get the channels the event should broadcast on.
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

비공개 채널에 대해 사용자가 필요한 권한을 갖추고 있는지 항상 확인해야 합니다. 애플리케이션의 `routes/channels.php` 파일에 채널 인가 규칙을 정의할 수 있습니다. 이번 예제에서는, 비공개 `orders.1` 채널을 수신하려는 사용자가 실제로 해당 주문의 소유자인지 검사하는 과정을 구현합니다.

```
use App\Models\Order;
use App\Models\User;

Broadcast::channel('orders.{orderId}', function (User $user, int $orderId) {
    return $user->id === Order::findOrNew($orderId)->user_id;
});
```

`channel` 메서드는 두 개의 인자를 받습니다: 채널 이름과, 해당 채널에 대한 접근 권한이 있는지 여부를 반환하는 콜백입니다(`true` 또는 `false`).

이 콜백에는 항상 첫 번째 인수로 현재 인증된 사용자 객체가, 그 뒤로는 채널명에서 사용하는 와일드카드 파라미터가 순서대로 넘어옵니다. 위 예시처럼 `{orderId}`와 같은 플레이스홀더는 채널명 뒤쪽의 "ID" 부분이 와일드카드임을 의미합니다.

<a name="listening-for-event-broadcasts"></a>
#### 브로드캐스트 이벤트 수신하기

이제 자바스크립트 애플리케이션에서 이벤트를 수신하기만 하면 됩니다. 이를 위해 [Laravel Echo](#client-side-installation)를 사용합니다. 먼저 `private` 메서드로 해당 비공개 채널을 구독한 뒤, `listen` 메서드로 `OrderShipmentStatusUpdated` 이벤트를 리스닝합니다. 기본적으로 이벤트의 모든 `public` 프로퍼티가 브로드캐스트 데이터에 포함되어 전달됩니다.

```js
Echo.private(`orders.${orderId}`)
    .listen('OrderShipmentStatusUpdated', (e) => {
        console.log(e.order);
    });
```

<a name="defining-broadcast-events"></a>
## 브로드캐스트 이벤트 정의

특정 이벤트를 라라벨이 브로드캐스트 하도록 알리려면, 이벤트 클래스에서 `Illuminate\Contracts\Broadcasting\ShouldBroadcast` 인터페이스를 구현해야 합니다. 이 인터페이스는 라라벨에서 생성하는 모든 이벤트 클래스에 이미 임포트되어 있으므로, 쉽게 추가할 수 있습니다.

`ShouldBroadcast` 인터페이스를 구현할 경우, 반드시 하나의 메서드, 즉 `broadcastOn`을 구현해야 합니다. `broadcastOn`은 이벤트를 브로드캐스트할 채널 또는 채널 배열을 반환해야 합니다. 채널은 `Channel`, `PrivateChannel`, `PresenceChannel` 객체여야 하며, `Channel`은 모든 사용자가 구독할 수 있는 공개 채널, `PrivateChannel`, `PresenceChannel`은 [채널 인가](#authorizing-channels)가 필요한 비공개 채널을 의미합니다.

```
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
     * Create a new event instance.
     */
    public function __construct(
        public User $user,
    ) {}

    /**
     * Get the channels the event should broadcast on.
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

`ShouldBroadcast` 인터페이스를 구현한 뒤에는, [이벤트를 발생](/docs/10.x/events)시키기만 하면 됩니다. 이벤트가 발생하면, [큐에 등록된 작업](/docs/10.x/queues)을 통해 지정한 브로드캐스트 드라이버로 자동 브로드캐스트됩니다.

<a name="broadcast-name"></a>
### 브로드캐스트 이름

라라벨은 기본적으로 이벤트 클래스 이름을 사용해 이벤트를 브로드캐스트합니다. 이름을 직접 지정하고 싶다면, 이벤트 클래스에 `broadcastAs` 메서드를 정의할 수 있습니다.

```
/**
 * The event's broadcast name.
 */
public function broadcastAs(): string
{
    return 'server.created';
}
```

이렇게 `broadcastAs`로 브로드캐스트 이름을 변경하면, 리스너를 등록할 때 반드시 이름 앞에 `.`(점) 문자를 붙여야 합니다. 이는 Echo에게 애플리케이션 네임스페이스를 이벤트 이름 앞에 덧붙이지 않도록 지정해줍니다.

```
.listen('.server.created', function (e) {
    ....
});
```

<a name="broadcast-data"></a>
### 브로드캐스트 데이터

이벤트가 브로드캐스트될 때, 이벤트의 모든 `public` 프로퍼티가 자동으로 직렬화되어 페이로드로 전송됩니다. 즉, 자바스크립트에서 이벤트 데이터의 모든 공개 데이터를 그대로 사용할 수 있습니다. 예를 들어, 이벤트에 Eloquent 모델이 담긴 `public $user` 속성이 있다면, 브로드캐스트로 전달되는 페이로드는 다음과 같습니다.

```json
{
    "user": {
        "id": 1,
        "name": "Patrick Stewart"
        ...
    }
}
```

좀 더 세밀하게 페이로드를 직접 제어하고 싶다면, 이벤트 클래스에 `broadcastWith` 메서드를 추가할 수 있습니다. 이 메서드는 이벤트 페이로드로 브로드캐스트할 데이터를 배열로 반환해야 합니다.

```
/**
 * Get the data to broadcast.
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

기본적으로 각 브로드캐스트 이벤트는 `queue.php` 설정 파일에서 지정한 기본 큐 커넥션 및 큐에 쌓입니다. 원한다면 이벤트 클래스에서 `connection`과 `queue` 프로퍼티를 정의해 어떤 커넥션과 큐를 사용할지 직접 지정할 수 있습니다.

```
/**
 * The name of the queue connection to use when broadcasting the event.
 *
 * @var string
 */
public $connection = 'redis';

/**
 * The name of the queue on which to place the broadcasting job.
 *
 * @var string
 */
public $queue = 'default';
```

또는, `broadcastQueue` 메서드를 정의해서 큐 이름만 지정할 수도 있습니다.

```
/**
 * The name of the queue on which to place the broadcasting job.
 */
public function broadcastQueue(): string
{
    return 'default';
}
```

만약 기본 큐 드라이버 대신 `sync` 큐를 통해 바로 이벤트를 브로드캐스트하고 싶다면, `ShouldBroadcast` 대신 `ShouldBroadcastNow` 인터페이스를 구현하면 됩니다.

```
<?php

use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class OrderShipmentStatusUpdated implements ShouldBroadcastNow
{
    // ...
}
```

<a name="broadcast-conditions"></a>

### 브로드캐스트 조건

특정 조건이 참일 때만 이벤트를 브로드캐스트하고 싶을 때가 있습니다. 이런 경우, 이벤트 클래스에 `broadcastWhen` 메서드를 추가해서 조건을 정의할 수 있습니다.

```
/**
 * Determine if this event should broadcast.
 */
public function broadcastWhen(): bool
{
    return $this->order->value > 100;
}
```

<a name="broadcasting-and-database-transactions"></a>
#### 브로드캐스팅과 데이터베이스 트랜잭션

브로드캐스트 이벤트가 데이터베이스 트랜잭션 안에서 디스패치될 경우, 이러한 이벤트가 트랜잭션 커밋 이전에 큐에서 처리될 수도 있습니다. 이렇게 되면, 트랜잭션 동안 변경된 모델이나 데이터베이스 레코드가 아직 데이터베이스에 반영되지 않은 상태가 될 수 있습니다. 또한 트랜잭션 내에서 새로 생성된 모델이나 레코드가 데이터베이스에 존재하지 않을 수도 있습니다. 만약 이벤트가 이러한 모델에 의존한다면, 이벤트를 브로드캐스트하는 작업이 처리될 때 예기치 않은 오류가 발생할 수 있습니다.

만약 큐 커넥션의 `after_commit` 설정 옵션이 `false`로 되어 있다면, 이벤트 클래스에서 `ShouldDispatchAfterCommit` 인터페이스를 구현함으로써 해당 브로드캐스트 이벤트를 모든 데이터베이스 트랜잭션 커밋 이후에 디스패치되도록 지정할 수 있습니다.

```
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
> 이러한 문제를 우회하는 방법에 대해 더 알아보고 싶다면 [큐 작업과 데이터베이스 트랜잭션](/docs/10.x/queues#jobs-and-database-transactions) 관련 문서를 참고하시기 바랍니다.

<a name="authorizing-channels"></a>
## 채널 인가(권한 확인)

프라이빗 채널은 현재 인증된 사용자가 실제로 해당 채널을 청취(listen)할 수 있는지 확인(인가)해야 합니다. 이를 위해 라라벨 애플리케이션에 채널 이름과 함께 HTTP 요청을 보내고, 애플리케이션이 해당 사용자가 채널을 청취할 수 있는지를 판단하게 합니다. [Laravel Echo](#client-side-installation)를 사용하는 경우, 프라이빗 채널에 대한 구독 인가를 위한 HTTP 요청이 자동으로 이루어집니다. 그러나, 이러한 요청에 응답하기 위해 적절한 라우트를 미리 정의해 두어야 합니다.

<a name="defining-authorization-routes"></a>
### 인가 라우트 정의

다행히도 라라벨에서는 채널 인가 요청에 응답하는 라우트를 쉽게 정의할 수 있습니다. 라라벨 애플리케이션에 기본 포함되어 있는 `App\Providers\BroadcastServiceProvider`에서, `Broadcast::routes` 메서드가 호출되는 것을 볼 수 있습니다. 이 메서드는 인가 요청을 처리하는 `/broadcasting/auth` 라우트를 자동으로 등록합니다.

```
Broadcast::routes();
```

`Broadcast::routes` 메서드는 기본적으로 자신이 등록하는 라우트들을 `web` 미들웨어 그룹에 배치합니다. 만약 라우트에 특정 속성(attribute)을 사용자 정의하고 싶다면, 해당 속성을 배열로 전달할 수 있습니다.

```
Broadcast::routes($attributes);
```

<a name="customizing-the-authorization-endpoint"></a>
#### 인가 엔드포인트 커스터마이징

기본적으로 Echo는 채널 접근 인가를 위해 `/broadcasting/auth` 엔드포인트를 사용합니다. 그러나, Echo 인스턴스 구성 시 `authEndpoint` 설정 옵션을 지정함으로써 자체 인가 엔드포인트를 사용할 수도 있습니다.

```js
window.Echo = new Echo({
    broadcaster: 'pusher',
    // ...
    authEndpoint: '/custom/endpoint/auth'
});
```

<a name="customizing-the-authorization-request"></a>
#### 인가 요청 커스터마이징

Echo 초기화 시 커스텀 authorizer를 제공함으로써, Echo가 인가 요청을 실행하는 방식을 원하는 대로 변경할 수 있습니다.

```js
window.Echo = new Echo({
    // ...
    authorizer: (channel, options) => {
        return {
            authorize: (socketId, callback) => {
                axios.post('/api/broadcasting/auth', {
                    socket_id: socketId,
                    channel_name: channel.name
                })
                .then(response => {
                    callback(null, response.data);
                })
                .catch(error => {
                    callback(error);
                });
            }
        };
    },
})
```

<a name="defining-authorization-callbacks"></a>
### 인가 콜백 정의하기

이제, 현재 인증된 사용자가 특정 채널을 청취할 수 있는지 실제로 판단하는 로직을 정의해야 합니다. 이 작업은 애플리케이션에 기본 포함된 `routes/channels.php` 파일에서 이뤄집니다. 이 파일에서 `Broadcast::channel` 메서드를 사용하여 채널 인가 콜백을 등록할 수 있습니다.

```
use App\Models\User;

Broadcast::channel('orders.{orderId}', function (User $user, int $orderId) {
    return $user->id === Order::findOrNew($orderId)->user_id;
});
```

`channel` 메서드는 두 개의 인수를 받습니다. 첫 번째는 채널 이름이며, 두 번째는 해당 채널을 청취할 권한이 있는지를 `true` 또는 `false`로 반환하는 콜백입니다.

모든 인가 콜백의 첫 번째 인수로는 현재 인증된 사용자가 주어지며, 그 외 와일드카드 파라미터들이 순서대로 이어집니다. 이 예시에서는 채널 이름 중 `{orderId}` 부분을 플레이스홀더로 사용하여, 채널 이름에서 "ID" 자리에 오는 값이 와일드카드임을 의미합니다.

아티즌 명령어를 사용해 애플리케이션 전체의 브로드캐스트 인가 콜백 목록을 조회할 수 있습니다.

```shell
php artisan channel:list
```

<a name="authorization-callback-model-binding"></a>
#### 인가 콜백의 모델 바인딩

HTTP 라우트에서처럼, 채널 라우트에서도 암묵적, 명시적 [라우트 모델 바인딩](/docs/10.x/routing#route-model-binding)을 사용할 수 있습니다. 예를 들어, 문자열 또는 숫자형 주문 ID 대신 실제 `Order` 모델 인스턴스를 인수로 받을 수 있습니다.

```
use App\Models\Order;
use App\Models\User;

Broadcast::channel('orders.{order}', function (User $user, Order $order) {
    return $user->id === $order->user_id;
});
```

> [!NOTE]
> HTTP 라우트 모델 바인딩과 달리, 채널 모델 바인딩에서는 자동 [암묵적 모델 바인딩 범위 지정](/docs/10.x/routing#implicit-model-binding-scoping)을 지원하지 않습니다. 그러나 대부분의 채널은 하나의 모델 기본키로 범위 지정이 가능하기 때문에, 실무에서 큰 문제는 아닙니다.

<a name="authorization-callback-authentication"></a>
#### 인가 콜백과 인증

프라이빗 및 프레즌스 브로드캐스트 채널은 애플리케이션의 기본 인증 가드를 통해 현재 사용자를 인증합니다. 사용자가 인증되어 있지 않다면, 채널 인가는 자동으로 거부되고 인가 콜백이 실행되지 않습니다. 필요하다면, 요청을 인증할 여러 커스텀 가드를 배열로 설정할 수도 있습니다.

```
Broadcast::channel('channel', function () {
    // ...
}, ['guards' => ['web', 'admin']]);
```

<a name="defining-channel-classes"></a>
### 채널 클래스 정의하기

다수의 채널을 운영하는 경우, `routes/channels.php` 파일이 점점 커지고 복잡해질 수 있습니다. 이럴 때는 채널 인가를 클로저 대신 채널 클래스를 사용해서 좀 더 구조적으로 관리할 수 있습니다. 채널 클래스를 생성하려면, `make:channel` 아티즌 명령어를 사용하세요. 이 명령어는 새로운 채널 클래스를 `App/Broadcasting` 디렉터리에 생성합니다.

```shell
php artisan make:channel OrderChannel
```

이제 `routes/channels.php` 파일에 해당 채널을 등록하세요.

```
use App\Broadcasting\OrderChannel;

Broadcast::channel('orders.{order}', OrderChannel::class);
```

마지막으로, 채널 클래스의 `join` 메서드에 채널 인가 로직을 구현합니다. 이 `join` 메서드에는 기존 채널 인가 클로저에서 사용하던 것과 동일한 로직을 작성하면 됩니다. 또한 채널 모델 바인딩도 사용할 수 있습니다.

```
<?php

namespace App\Broadcasting;

use App\Models\Order;
use App\Models\User;

class OrderChannel
{
    /**
     * Create a new channel instance.
     */
    public function __construct()
    {
        // ...
    }

    /**
     * Authenticate the user's access to the channel.
     */
    public function join(User $user, Order $order): array|bool
    {
        return $user->id === $order->user_id;
    }
}
```

> [!NOTE]
> 라라벨의 여러 클래스들과 마찬가지로, 채널 클래스 역시 [서비스 컨테이너](/docs/10.x/container)를 통해 자동으로 해결(resolve)됩니다. 즉, 생성자에서 의존하는 어떠한 객체도 타입힌트로 지정할 수 있습니다.

<a name="broadcasting-events"></a>
## 이벤트 브로드캐스트하기

이벤트를 정의하고 `ShouldBroadcast` 인터페이스를 구현했다면, 이제 해당 이벤트를 디스패치 메서드로 발생시키기만 하면 됩니다. 이벤트 디스패처는 해당 이벤트가 `ShouldBroadcast` 인터페이스를 구현하고 있음을 자동으로 감지하여 브로드캐스트를 위한 큐에 등록합니다.

```
use App\Events\OrderShipmentStatusUpdated;

OrderShipmentStatusUpdated::dispatch($order);
```

<a name="only-to-others"></a>
### 다른 구독자에게만 브로드캐스트

이벤트 브로드캐스트를 사용할 때, 특정 채널의 모든 구독자에게 이벤트를 전송하되, 현재 사용자 자신만은 제외하고 싶을 수 있습니다. 이럴 때는 `broadcast` 헬퍼와 `toOthers` 메서드를 사용하세요.

```
use App\Events\OrderShipmentStatusUpdated;

broadcast(new OrderShipmentStatusUpdated($update))->toOthers();
```

`toOthers` 메서드를 언제 사용해야 할지 이해하기 위해, 할 일 관리 애플리케이션을 예로 들어보겠습니다. 사용자 한 명이 할 일(task) 이름을 입력해 새로운 할 일을 생성할 수 있다고 가정합니다. 이때 애플리케이션은 `/task` URL로 요청을 보내면서 할 일 생성 이벤트를 브로드캐스트하고, 새로 생성된 할 일의 JSON 데이터를 반환합니다. 자바스크립트 애플리케이션에서는 이 응답을 받아 바로 할 일을 목록에 추가할 수 있습니다.

```js
axios.post('/task', task)
    .then((response) => {
        this.tasks.push(response.data);
    });
```

그런데, 할 일 생성 이벤트도 브로드캐스트하므로, 자바스크립트 애플리케이션이 해당 이벤트를 수신해 다시 목록에 추가한다면, 할 일이 중복으로 등록될 수 있습니다. 이럴 땐 `toOthers` 메서드를 사용해서 현재 사용자에게만 브로드캐스트되지 않도록 방지할 수 있습니다.

> [!NOTE]
> 이벤트에서 `toOthers` 메서드를 사용하려면, 반드시 `Illuminate\Broadcasting\InteractsWithSockets` 트레이트를 사용해야 합니다.

<a name="only-to-others-configuration"></a>
#### 구성(설정)

라라벨 Echo 인스턴스를 초기화하면, 소켓 ID가 해당 연결에 할당됩니다. 글로벌 [Axios](https://github.com/mzabriskie/axios) 인스턴스를 사용해 자바스크립트 애플리케이션에서 HTTP 요청을 보낼 경우, 이 소켓 ID는 모든 요청의 `X-Socket-ID` 헤더에 자동으로 첨부됩니다. 이후, `toOthers` 메서드를 호출하면 라라벨은 이 헤더에서 소켓 ID를 추출하여 해당 소켓 ID를 가진 연결에는 브로드캐스트하지 않게 됩니다.

글로벌 Axios 인스턴스를 사용하지 않을 경우, 모든 요청에 `X-Socket-ID` 헤더를 직접 추가해주어야 합니다. 소켓 ID는 `Echo.socketId` 메서드로 얻을 수 있습니다.

```js
var socketId = Echo.socketId();
```

<a name="customizing-the-connection"></a>
### 브로드캐스트 커넥션 지정하기

애플리케이션에서 여러 브로드캐스트 커넥션을 사용 중이고, 기본 커넥션이 아닌 다른 브로드캐스터로 이벤트를 브로드캐스트하고 싶다면, `via` 메서드를 사용하여 대상 커넥션을 지정할 수 있습니다.

```
use App\Events\OrderShipmentStatusUpdated;

broadcast(new OrderShipmentStatusUpdated($update))->via('pusher');
```

또는, 이벤트 클래스의 생성자에서 `broadcastVia` 메서드를 호출하여 브로드캐스트 커넥션을 지정할 수도 있습니다. 이때 이벤트 클래스에는 반드시 `InteractsWithBroadcasting` 트레이트가 포함되어 있어야 합니다.

```
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
     * Create a new event instance.
     */
    public function __construct()
    {
        $this->broadcastVia('pusher');
    }
}
```

<a name="receiving-broadcasts"></a>
## 브로드캐스트 수신

<a name="listening-for-events"></a>
### 이벤트 수신(리스닝)

[라라벨 Echo를 설치 및 인스턴스화](#client-side-installation)했다면, 이제 라라벨 애플리케이션에서 브로드캐스트되는 이벤트를 수신할 준비가 된 것입니다. 먼저, `channel` 메서드로 채널 인스턴스를 가져온 뒤, `listen` 메서드를 호출해 특정 이벤트를 리스닝할 수 있습니다.

```js
Echo.channel(`orders.${this.order.id}`)
    .listen('OrderShipmentStatusUpdated', (e) => {
        console.log(e.order.name);
    });
```

프라이빗 채널에서 이벤트를 수신하려면, `private` 메서드를 사용하세요. 한 채널에서 여러 이벤트를 리스닝하고 싶다면, `listen` 메서드 체이닝도 가능합니다.

```js
Echo.private(`orders.${this.order.id}`)
    .listen(/* ... */)
    .listen(/* ... */)
    .listen(/* ... */);
```

<a name="stop-listening-for-events"></a>
#### 이벤트 리스닝 중지

특정 이벤트에 대한 수신을 중단(채널에서 [나가지 않고](#leaving-a-channel))하고 싶을 때는, `stopListening` 메서드를 사용할 수 있습니다.

```js
Echo.private(`orders.${this.order.id}`)
    .stopListening('OrderShipmentStatusUpdated')
```

<a name="leaving-a-channel"></a>
### 채널에서 나가기

채널에서 나가고 싶다면, Echo 인스턴스의 `leaveChannel` 메서드를 호출하세요.

```js
Echo.leaveChannel(`orders.${this.order.id}`);
```

채널뿐만 아니라 연관된 프라이빗 채널 및 프레즌스 채널까지 모두 나가고 싶다면, `leave` 메서드를 사용할 수 있습니다.

```js
Echo.leave(`orders.${this.order.id}`);
```
<a name="namespaces"></a>
### 네임스페이스

앞선 예시에서 이벤트 클래스의 전체 `App\Events` 네임스페이스를 지정하지 않은 것을 눈치채신 분도 있을 것입니다. 이는 Echo가 기본적으로 이벤트가 `App\Events` 네임스페이스에 있다고 가정하기 때문입니다. 하지만 Echo 인스턴스 생성 시 `namespace` 설정 옵션을 지정하여 루트 네임스페이스를 변경할 수도 있습니다.

```js
window.Echo = new Echo({
    broadcaster: 'pusher',
    // ...
    namespace: 'App.Other.Namespace'
});
```

또는, Echo를 사용해 구독할 때 이벤트 클래스명 앞에 `.`을 붙여 완전한 클래스명을 직접 지정할 수도 있습니다.

```js
Echo.channel('orders')
    .listen('.Namespace\\Event\\Class', (e) => {
        // ...
    });
```

<a name="presence-channels"></a>
## 프레즌스 채널

프레즌스 채널은 프라이빗 채널의 보안 위에, 채널에 누가 구독되어 있는지까지 파악할 수 있는 기능이 추가됩니다. 덕분에, 다른 사용자가 같은 페이지를 보고 있을 때 이를 알리거나, 채팅방 입주자를 알리는 등 강력하면서도 협업적인 애플리케이션 기능을 쉽게 구현할 수 있습니다.

<a name="authorizing-presence-channels"></a>
### 프레즌스 채널 인가

모든 프레즌스 채널은 프라이빗 채널이기도 하므로, [접근 인가](#authorizing-channels)가 필요합니다. 다만, 프레즌스 채널의 인가 콜백을 정의할 때는, 사용자가 채널에 참가(join)할 수 있는 경우 `true`를 반환하는 대신, 사용자에 대한 데이터를 배열 형태로 반환해야 합니다.

인가 콜백에서 반환된 데이터는 자바스크립트 애플리케이션 내 프레즌스 채널 이벤트 리스너에게 전달됩니다. 사용자가 채널 참가 권한이 없다면 `false` 또는 `null`을 반환해야 합니다.

```
use App\Models\User;

Broadcast::channel('chat.{roomId}', function (User $user, int $roomId) {
    if ($user->canJoinRoom($roomId)) {
        return ['id' => $user->id, 'name' => $user->name];
    }
});
```

<a name="joining-presence-channels"></a>
### 프레즌스 채널 참가(Join)

프레즌스 채널에 참가하려면, Echo의 `join` 메서드를 사용하면 됩니다. `join` 메서드는 `PresenceChannel` 인스턴스를 반환하며, `listen` 메서드 뿐 아니라, `here`, `joining`, `leaving` 이벤트에도 구독할 수 있습니다.

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

`here` 콜백은 채널에 성공적으로 참가하자마자 한 번 실행되어, 현재 채널에 구독 중인 모든 사용자의 정보 배열을 전달합니다. `joining`은 새로운 사용자가 채널에 참가할 때, `leaving`은 사용자가 채널을 떠날 때 실행됩니다. `error` 메서드는 인증 엔드포인트가 200이 아닌 HTTP 상태 코드를 반환하거나, 반환된 JSON 파싱에 문제가 있을 때 호출됩니다.

<a name="broadcasting-to-presence-channels"></a>
### 프레즌스 채널로 이벤트 브로드캐스트

프레즌스 채널 또한 퍼블릭/프라이빗 채널처럼 이벤트를 수신할 수 있습니다. 예를 들어, 채팅방에서 `NewMessage` 이벤트를 해당 프레즌스 채널에 브로드캐스트하고자 할 때, 이벤트의 `broadcastOn` 메서드에서 `PresenceChannel` 인스턴스를 반환하면 됩니다.

```
/**
 * Get the channels the event should broadcast on.
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

다른 이벤트와 마찬가지로, `broadcast` 헬퍼와 `toOthers` 메서드를 이용해 현재 사용자를 브로드캐스트 대상에서 제외시킬 수 있습니다.

```
broadcast(new NewMessage($message));

broadcast(new NewMessage($message))->toOthers();
```

프레즌스 채널로 전송된 이벤트도 Echo의 `listen` 메서드로 동일하게 수신할 수 있습니다.

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

> [!NOTE]
> 아래 모델 브로드캐스트 관련 내용을 읽기 전에, 라라벨의 모델 브로드캐스트 서비스 기본 개념과, 수동으로 브로드캐스트 이벤트를 생성 및 리스닝하는 방법에 익숙해지실 것을 추천합니다.

애플리케이션의 [Eloquent 모델](/docs/10.x/eloquent)이 생성, 수정, 삭제될 때마다 이벤트를 브로드캐스트하는 일이 흔히 있습니다. 물론, 이를 수동으로 직접 [Eloquent 모델 상태 변경에 맞는 커스텀 이벤트를 정의](/docs/10.x/eloquent#events)하고, 해당 이벤트에 `ShouldBroadcast` 인터페이스를 구현해서 처리할 수 있습니다.

하지만, 이런 이벤트가 애플리케이션 내 다른 용도로 사용되지 않고 오직 브로드캐스트만을 위해서 존재한다면, 이벤트 클래스를 매번 만드는 것이 번거로울 수 있습니다. 이를 해결하기 위해, 라라벨에서는 Eloquent 모델의 상태 변화가 있을 때 자동으로 브로드캐스트할 수 있는 기능을 제공합니다.

우선, 사용하려는 Eloquent 모델에 `Illuminate\Database\Eloquent\BroadcastsEvents` 트레이트를 추가하세요. 그리고 모델에 `broadcastOn` 메서드를 정의하여, 모델 이벤트가 브로드캐스트되어야 할 채널 배열을 반환하게 만들어야 합니다.

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
     * Get the user that the post belongs to.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the channels that model events should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel|\Illuminate\Database\Eloquent\Model>
     */
    public function broadcastOn(string $event): array
    {
        return [$this, $this->user];
    }
}
```

이렇게 트레이트를 추가하고 브로드캐스트 채널을 정의하면, 해당 모델 인스턴스가 생성, 수정, 삭제, 휴지통에 보내짐(trashed), 복원(restored)될 때마다 자동으로 이벤트가 브로드캐스트됩니다.

또한, `broadcastOn` 메서드가 `$event`라는 문자열 인수를 받는 것도 주목하세요. 이 값에는 해당 모델에서 발생한 이벤트 유형이 담겨 있으며, 값은 `created`, `updated`, `deleted`, `trashed`, `restored` 중 하나가 됩니다. 이 변수를 통해 각 이벤트 별로 어떤 채널에 브로드캐스트할지 세부적으로 지정할 수 있습니다.

```php
/**
 * Get the channels that model events should broadcast on.
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

가끔은 라라벨이 내부적으로 모델 브로드캐스트 이벤트를 생성하는 방식을 커스터마이징해야 할 때가 있습니다. 이럴 땐, Eloquent 모델에서 `newBroadcastableEvent` 메서드를 정의하면 됩니다. 이 메서드는 `Illuminate\Database\Eloquent\BroadcastableModelEventOccurred` 인스턴스를 반환해야 합니다.

```php
use Illuminate\Database\Eloquent\BroadcastableModelEventOccurred;

/**
 * Create a new broadcastable model event for the model.
 */
protected function newBroadcastableEvent(string $event): BroadcastableModelEventOccurred
{
    return (new BroadcastableModelEventOccurred(
        $this, $event
    ))->dontBroadcastToCurrentUser();
}
```

<a name="model-broadcasting-conventions"></a>
### 모델 브로드캐스팅 규칙

<a name="model-broadcasting-channel-conventions"></a>
#### 채널 규칙

위 모델 예시에서 `broadcastOn` 메서드가 `Channel` 인스턴스를 반환하지 않고, Eloquent 모델 자체를 반환하는 것을 볼 수 있습니다. 만약 `broadcastOn` 메서드에서 Eloquent 모델 인스턴스를 반환하면, 라라벨에서는 해당 모델의 클래스명과 기본키(pk)를 조합하여 프라이빗 채널 인스턴스를 자동 생성합니다.

예를 들어, `App\Models\User` 모델의 `id`가 `1`인 경우, 라라벨에서는 이를 `App.Models.User.1`이라는 이름을 가진 `Illuminate\Broadcasting\PrivateChannel` 인스턴스로 변환합니다. 물론, 모델의 `broadcastOn` 메서드에서 Eloquent 모델 인스턴스 대신 직접 `Channel` 인스턴스를 반환해, 채널 이름을 완전히 직접 제어할 수도 있습니다.

```php
use Illuminate\Broadcasting\PrivateChannel;

/**
 * Get the channels that model events should broadcast on.
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

모델의 `broadcastOn` 메서드에서 채널 객체를 반환(명시적 반환)하려 할 때, 채널 생성자에 Eloquent 모델 인스턴스를 직접 전달할 수도 있습니다. 이 경우, 라라벨은 위에서 설명한 모델 채널 규칙을 적용해 해당 모델을 채널 이름 문자열로 변환해줍니다.

```php
return [new Channel($this->user)];
```

만약 모델의 채널 이름이 필요하다면, 어떤 모델 인스턴스에서든 `broadcastChannel` 메서드를 호출하면 됩니다. 예를 들어, `App\Models\User` 모델의 `id`가 `1`인 경우 이 메서드는 문자열 `App.Models.User.1`을 반환합니다.

```php
$user->broadcastChannel()
```

<a name="model-broadcasting-event-conventions"></a>

#### 이벤트 명명 규칙

모델 브로드캐스트 이벤트는 애플리케이션의 `App\Events` 디렉토리에 실제 이벤트가 존재하지 않으므로, 관례(convention)에 따라 이벤트 이름과 페이로드(payload)가 정해집니다. 라라벨에서는 모델의 클래스명(네임스페이스는 제외)과 해당 브로드캐스트를 발생시킨 모델 이벤트명을 조합하여 이벤트 이름으로 사용합니다.

예를 들어, `App\Models\Post` 모델이 업데이트되면, 클라이언트 애플리케이션에는 `PostUpdated`라는 이름의 이벤트가 아래와 같은 페이로드로 브로드캐스트됩니다.

```json
{
    "model": {
        "id": 1,
        "title": "My first post"
        ...
    },
    ...
    "socket": "someSocketId",
}
```

`App\Models\User` 모델이 삭제되면, `UserDeleted`라는 이름의 이벤트가 브로드캐스트됩니다.

원한다면, 모델에 `broadcastAs` 및 `broadcastWith` 메서드를 추가하여 커스텀 브로드캐스트 이름과 페이로드를 정의할 수 있습니다. 이 메서드들은 발생 중인 모델 이벤트/연산의 이름을 인수로 받아, 각 모델 동작별로 이벤트 이름과 페이로드를 자유롭게 커스터마이징할 수 있습니다. 만약 `broadcastAs` 메서드에서 `null`을 반환하면, 라라벨은 위에서 설명한 모델 브로드캐스팅 이벤트 명명 규칙을 사용합니다.

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
 * 모델의 브로드캐스트 데이터를 반환합니다.
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

모델에 `BroadcastsEvents` 트레이트를 추가하고, `broadcastOn` 메서드를 정의했다면, 이제 클라이언트 애플리케이션에서 브로드캐스트된 모델 이벤트를 수신할 수 있습니다. 시작하기 전에, [이벤트 수신하기](#listening-for-events)에 대한 전체 문서를 참고해 보시기 바랍니다.

먼저, `private` 메서드를 사용해 채널 인스턴스를 가져온 뒤, `listen` 메서드를 호출하여 특정 이벤트를 수신할 수 있습니다. 일반적으로 `private` 메서드에 전달하는 채널명은 라라벨의 [모델 브로드캐스팅 명명 규칙](#model-broadcasting-conventions)을 따라야 합니다.

채널 인스턴스를 얻었다면, `listen` 메서드를 통해 특정 이벤트를 수신할 수 있습니다. 모델 브로드캐스트 이벤트는 애플리케이션의 `App\Events` 디렉토리에 실제 이벤트가 존재하지 않으므로, [이벤트 이름](#model-broadcasting-event-conventions) 앞에 반드시 `.`(점)을 붙여 네임스페이스에 속하지 않음을 표시해야 합니다. 각 모델 브로드캐스트 이벤트에는 `model` 프로퍼티가 포함되어 있어, 모델의 모든 브로드캐스팅 가능한 속성을 얻을 수 있습니다.

```js
Echo.private(`App.Models.User.${this.user.id}`)
    .listen('.PostUpdated', (e) => {
        console.log(e.model);
    });
```

<a name="client-events"></a>
## 클라이언트 이벤트

> [!NOTE]
> [Pusher Channels](https://pusher.com/channels)를 사용할 때, 클라이언트 이벤트를 전달하고 싶다면 반드시 [애플리케이션 대시보드](https://dashboard.pusher.com/)의 "App Settings" 섹션에서 "Client Events" 옵션을 활성화해야 합니다.

때로는 라라벨 애플리케이션 서버에 요청을 보내지 않고, 연결된 다른 클라이언트들에게만 이벤트를 브로드캐스팅하고 싶을 때가 있습니다. 예를 들어, 사용자가 특정 화면에서 메시지를 입력하고 있음을 다른 사용자들에게 실시간으로 알려주는 "입력 중" 알림 같은 경우가 그러합니다.

클라이언트 이벤트를 브로드캐스트하려면 Echo의 `whisper` 메서드를 사용할 수 있습니다.

```js
Echo.private(`chat.${roomId}`)
    .whisper('typing', {
        name: this.user.name
    });
```

클라이언트 이벤트를 수신하려면 `listenForWhisper` 메서드를 사용하면 됩니다.

```js
Echo.private(`chat.${roomId}`)
    .listenForWhisper('typing', (e) => {
        console.log(e.name);
    });
```

<a name="notifications"></a>
## 알림(Notifications)

이벤트 브로드캐스팅을 [알림](/docs/10.x/notifications)과 함께 사용하면, 자바스크립트 애플리케이션에서도 새 알림이 실시간으로 도착할 때마다 페이지를 새로고침할 필요 없이 즉시 수신할 수 있습니다. 먼저, [브로드캐스트 알림 채널 사용하기](/docs/10.x/notifications#broadcast-notifications)에 대한 문서를 꼭 읽어보시기 바랍니다.

알림이 브로드캐스트 채널을 사용하도록 설정했다면, Echo의 `notification` 메서드를 이용해 브로드캐스트된 알림을 수신할 수 있습니다. 이때 채널명은 알림을 받는 엔티티의 클래스명과 일치해야 합니다.

```js
Echo.private(`App.Models.User.${userId}`)
    .notification((notification) => {
        console.log(notification.type);
    });
```

이 예제에서는 `broadcast` 채널을 통해 `App\Models\User` 인스턴스에게 전송된 모든 알림을 콜백 함수에서 수신할 수 있습니다. `App.Models.User.{id}` 채널에 대해 필요한 채널 인증 콜백은 라라벨 프레임워크에서 기본적으로 제공하는 `BroadcastServiceProvider`에 포함되어 있습니다.