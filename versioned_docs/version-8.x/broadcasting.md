# 브로드캐스팅 (Broadcasting)

- [소개](#introduction)
- [서버 사이드 설치](#server-side-installation)
    - [설정](#configuration)
    - [Pusher Channels](#pusher-channels)
    - [Ably](#ably)
    - [오픈 소스 대안](#open-source-alternatives)
- [클라이언트 사이드 설치](#client-side-installation)
    - [Pusher Channels](#client-pusher-channels)
    - [Ably](#client-ably)
- [개념 개요](#concept-overview)
    - [예제 애플리케이션 활용](#using-example-application)
- [브로드캐스트 이벤트 정의](#defining-broadcast-events)
    - [브로드캐스트 이름](#broadcast-name)
    - [브로드캐스트 데이터](#broadcast-data)
    - [브로드캐스트 큐](#broadcast-queue)
    - [브로드캐스트 조건](#broadcast-conditions)
    - [브로드캐스팅과 데이터베이스 트랜잭션](#broadcasting-and-database-transactions)
- [채널 인가(Authorization)](#authorizing-channels)
    - [인가 라우트 정의](#defining-authorization-routes)
    - [인가 콜백 정의](#defining-authorization-callbacks)
    - [채널 클래스 정의](#defining-channel-classes)
- [이벤트 브로드캐스팅하기](#broadcasting-events)
    - [다른 사용자에게만 브로드캐스팅](#only-to-others)
    - [커넥션 커스터마이징](#customizing-the-connection)
- [브로드캐스트 수신](#receiving-broadcasts)
    - [이벤트 리스닝](#listening-for-events)
    - [채널 나가기](#leaving-a-channel)
    - [네임스페이스](#namespaces)
- [프레즌스 채널(Presence Channels)](#presence-channels)
    - [프레즌스 채널 인가](#authorizing-presence-channels)
    - [프레즌스 채널 참여](#joining-presence-channels)
    - [프레즌스 채널로 브로드캐스팅](#broadcasting-to-presence-channels)
- [모델 브로드캐스팅](#model-broadcasting)
    - [모델 브로드캐스팅 컨벤션](#model-broadcasting-conventions)
    - [모델 브로드캐스트 리스닝](#listening-for-model-broadcasts)
- [클라이언트 이벤트](#client-events)
- [알림(Notifications)](#notifications)

<a name="introduction"></a>
## 소개

최근 웹 애플리케이션에서는 실시간(Realtime), 라이브 업데이트 UI를 구현하기 위해 WebSocket을 널리 사용합니다. 서버에서 데이터가 변경되면, 일반적으로 WebSocket 연결을 통해 메시지가 전송되며, 클라이언트는 이를 받아 UI를 즉시 갱신할 수 있습니다. 이러한 방식은 데이터 변경 사항을 확인하기 위해 애플리케이션 서버에 반복적으로 요청(polling)하는 것보다 훨씬 효율적입니다.

예를 들어, 여러분의 애플리케이션이 사용자의 데이터를 CSV 파일로 내보내고 해당 파일을 이메일로 발송하는 기능을 제공한다고 가정해보겠습니다. CSV 파일 생성에는 몇 분이 소요될 수 있으므로, 이 작업을 [큐에 등록된 작업](/docs/8.x/queues)으로 처리한다고 해봅니다. CSV 파일이 완성되어 사용자의 이메일로 발송되면, 우리는 `App\Events\UserDataExported` 이벤트를 브로드캐스팅하여 애플리케이션의 JavaScript에서 수신하도록 할 수 있습니다. 이 이벤트를 수신하면, 사용자는 페이지를 새로고침하지 않아도 CSV가 이메일로 전송되었다는 안내 메시지를 실시간으로 확인할 수 있습니다.

이와 같은 기능을 쉽게 구현할 수 있도록, 라라벨은 서버 사이드의 [이벤트](/docs/8.x/events)를 WebSocket 연결을 통해 간단하게 “브로드캐스트”할 수 있는 기능을 제공합니다. 라라벨 이벤트를 브로드캐스팅하면 서버 사이드의 라라벨 애플리케이션과 클라이언트 사이드의 JavaScript 애플리케이션 모두에서 동일한 이벤트 이름과 데이터를 손쉽게 공유할 수 있습니다.

브로드캐스팅의 핵심 개념은 단순합니다. 클라이언트는 프론트엔드에서 정의된 채널에 접속하고, 라라벨 애플리케이션은 백엔드에서 해당 채널로 이벤트를 브로드캐스트합니다. 이 이벤트에는 프론트엔드에서 사용할 수 있도록 원하는 추가 데이터를 포함할 수 있습니다.

<a name="supported-drivers"></a>
#### 지원되는 드라이버

라라벨은 기본적으로 두 가지 서버 사이드 브로드캐스팅 드라이버를 제공합니다: [Pusher Channels](https://pusher.com/channels)과 [Ably](https://ably.io)가 이에 해당합니다. 그 외에도, 커뮤니티에서 제공하는 [laravel-websockets](https://beyondco.de/docs/laravel-websockets/getting-started/introduction), [soketi](https://docs.soketi.app/) 등은 상용 브로드캐스팅 서비스에 의존하지 않아도 사용할 수 있는 브로드캐스팅 드라이버를 제공합니다.

> [!TIP]
> 이벤트 브로드캐스팅을 시작하기 전에, 라라벨 [이벤트와 리스너](/docs/8.x/events) 문서를 먼저 읽어보시기 바랍니다.

<a name="server-side-installation"></a>
## 서버 사이드 설치

라라벨의 이벤트 브로드캐스팅을 사용하려면, 라라벨 애플리케이션 내에서 몇 가지 설정을 해주고, 일부 패키지를 설치해야 합니다.

이벤트 브로드캐스팅은 서버 사이드 ‘브로드캐스트 드라이버’를 통해 이루어집니다. 이 드라이버가 라라벨 이벤트를 브라우저의 JavaScript 라이브러리인 Laravel Echo에서 수신할 수 있게 브로드캐스트해줍니다. 걱정하지 마세요! 설치 과정은 하나씩 차근차근 안내해드리니 쉽게 따라오실 수 있습니다.

<a name="configuration"></a>
### 설정

애플리케이션의 이벤트 브로드캐스트와 관련된 모든 설정은 `config/broadcasting.php` 설정 파일에 저장됩니다. 라라벨은 기본적으로 [Pusher Channels](https://pusher.com/channels), [Redis](/docs/8.x/redis), 그리고 로컬 개발 및 디버깅용 `log` 드라이버 등 여러 브로드캐스트 드라이버를 지원합니다. 또한, 테스트 환경에서 브로드캐스팅을 완전히 비활성화하고 싶을 때 사용할 수 있는 `null` 드라이버도 포함되어 있습니다. 각 드라이버에 대한 설정 예시는 `config/broadcasting.php` 파일에 미리 준비되어 있습니다.

<a name="broadcast-service-provider"></a>
#### 브로드캐스트 서비스 프로바이더

이벤트를 브로드캐스트하기 전에, 먼저 `App\Providers\BroadcastServiceProvider`를 등록해야 합니다. 새로운 라라벨 애플리케이션에서는, 이 프로바이더가 `config/app.php` 파일의 `providers` 배열에 주석 처리되어 있으니 해당 주석만 해제하면 됩니다. 이 `BroadcastServiceProvider`는 브로드캐스트 인가(authorization) 라우트 및 콜백을 등록하는 데 필요한 코드를 포함하고 있습니다.

<a name="queue-configuration"></a>
#### 큐 설정

또한, [큐 워커](/docs/8.x/queues)를 설정하고 실행해야 합니다. 모든 이벤트 브로드캐스팅은 큐에 등록된 작업(queued job)을 통해 이루어지므로, 이벤트 브로드캐스트로 인해 애플리케이션 응답속도에 영향을 미치지 않게 할 수 있습니다.

<a name="pusher-channels"></a>
### Pusher Channels

이벤트를 [Pusher Channels](https://pusher.com/channels)로 브로드캐스트할 계획이라면, Composer 패키지 매니저를 사용하여 Pusher Channels PHP SDK를 설치해야 합니다:

```
composer require pusher/pusher-php-server
```

그 다음, `config/broadcasting.php` 설정 파일에 Pusher Channels 인증 정보를 추가해줍니다. 이 파일에는 이미 Pusher Channels 설정 예시가 포함되어 있으므로, 여러분은 키(key), 시크릿(secret), 애플리케이션 ID만 지정해주면 빠르게 시작할 수 있습니다. 일반적으로 이러한 값들은 `PUSHER_APP_KEY`, `PUSHER_APP_SECRET`, `PUSHER_APP_ID`와 같은 [환경 변수](/docs/8.x/configuration#environment-configuration)를 통해 설정합니다:

```
PUSHER_APP_ID=your-pusher-app-id
PUSHER_APP_KEY=your-pusher-key
PUSHER_APP_SECRET=your-pusher-secret
PUSHER_APP_CLUSTER=mt1
```

`config/broadcasting.php` 파일의 `pusher` 설정 내에는 cluster 등 Pusher Channels에서 지원하는 추가 `options`도 지정할 수 있습니다.

설정이 끝나면, `.env` 파일에서 브로드캐스트 드라이버를 `pusher`로 변경해야 합니다:

```
BROADCAST_DRIVER=pusher
```

이제 [Laravel Echo](#client-side-installation)를 설치하고 설정하면, 클라이언트에서 브로드캐스트 이벤트를 수신할 준비가 완료됩니다.

<a name="pusher-compatible-open-source-alternatives"></a>
#### 오픈 소스 Pusher 대안

[laravel-websockets](https://github.com/beyondcode/laravel-websockets)와 [soketi](https://docs.soketi.app/) 패키지는 라라벨에서 사용할 수 있는 Pusher 호환 WebSocket 서버를 제공합니다. 이 패키지들을 활용하면 상용 WebSocket 서비스 없이도 라라벨 브로드캐스팅의 모든 기능을 자유롭게 사용할 수 있습니다. 설치 및 사용법에 대한 더 자세한 내용은 [오픈 소스 대안](#open-source-alternatives) 문서를 참고하시기 바랍니다.

<a name="ably"></a>
### Ably

이벤트를 [Ably](https://ably.io)로 브로드캐스트하려는 경우, Composer 패키지 매니저를 사용해 Ably PHP SDK를 설치해야 합니다:

```
composer require ably/ably-php
```

그 다음, `config/broadcasting.php` 설정 파일에 Ably 인증 정보를 추가해야 합니다. 이 파일에도 이미 Ably 설정 예시가 포함되어 있어, key만 빠르게 지정해주면 됩니다. 일반적으로 이 값은 `ABLY_KEY` [환경 변수](/docs/8.x/configuration#environment-configuration)로 설정합니다:

```
ABLY_KEY=your-ably-key
```

마찬가지로, `.env` 파일에서 브로드캐스트 드라이버를 `ably`로 변경해야 합니다:

```
BROADCAST_DRIVER=ably
```

이제 [Laravel Echo](#client-side-installation)를 설치하고 설정하면, 클라이언트에서 브로드캐스트 이벤트를 받을 준비가 완료됩니다.

<a name="open-source-alternatives"></a>
### 오픈 소스 대안

<a name="open-source-alternatives-php"></a>
#### PHP

[laravel-websockets](https://github.com/beyondcode/laravel-websockets) 패키지는 라라벨용 순수 PHP로 작성된 Pusher 호환 WebSocket 패키지입니다. 이 패키지를 사용하면 상용 WebSocket 서비스 없이 라라벨 브로드캐스팅의 모든 기능을 자유롭게 활용할 수 있습니다. 설치 및 사용 방법에 대해서는 [공식 문서](https://beyondco.de/docs/laravel-websockets)를 참고하세요.

<a name="open-source-alternatives-node"></a>
#### Node

[Soketi](https://github.com/soketi/soketi)는 Node 기반, Pusher 호환 WebSocket 서버로 µWebSockets.js를 활용하여 매우 높은 확장성과 속도를 자랑합니다. 이 역시 상용 WebSocket 서비스 없이도 라라벨 브로드캐스팅의 모든 기능을 활용할 수 있습니다. 설치 및 사용법에 대해서는 [공식 문서](https://docs.soketi.app/)를 참고하세요.

<a name="client-side-installation"></a>
## 클라이언트 사이드 설치

<a name="client-pusher-channels"></a>
### Pusher Channels

[Laravel Echo](https://github.com/laravel/echo)는 서버 사이드 브로드캐스토가 브로드캐스트하는 이벤트를 손쉽게 구독하고 수신할 수 있게 해주는 JavaScript 라이브러리입니다. Echo는 NPM 패키지 매니저로 설치할 수 있습니다. 여기서는 Pusher Channels 브로드캐스터를 사용할 것이므로, `pusher-js` 패키지도 함께 설치합니다:

```bash
npm install --save-dev laravel-echo pusher-js
```

Echo 설치가 완료되면, 여러분의 애플리케이션 JavaScript에서 새로운 Echo 인스턴스를 생성하면 됩니다. 보통 이는 라라벨 프레임워크에 기본 포함된 `resources/js/bootstrap.js` 파일 하단에 추가하는 것이 가장 좋습니다. 기본적으로 이 파일에는 Echo 설정 예시가 이미 주석 처리되어 있으니, 주석을 해제하기만 하면 됩니다:

```js
import Echo from 'laravel-echo';

window.Pusher = require('pusher-js');

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: process.env.MIX_PUSHER_APP_KEY,
    cluster: process.env.MIX_PUSHER_APP_CLUSTER,
    forceTLS: true
});
```

Echo 설정을 주석 해제하고, 프로젝트 환경에 맞게 필요한 부분을 조정했다면, 애플리케이션 에셋을 컴파일합니다:

```
npm run dev
```

> [!TIP]
> 애플리케이션의 JavaScript 에셋 컴파일 방법에 대해서는 [Laravel Mix](/docs/8.x/mix) 문서를 참고하세요.

<a name="using-an-existing-client-instance"></a>
#### 기존 클라이언트 인스턴스 사용하기

이미 사전에 설정된 Pusher Channels 클라이언트 인스턴스가 있다면, Echo에 `client` 설정 옵션으로 전달해 사용할 수 있습니다:

```js
import Echo from 'laravel-echo';

const client = require('pusher-js');

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: 'your-pusher-channels-key',
    client: client
});
```

<a name="client-ably"></a>
### Ably

[Laravel Echo](https://github.com/laravel/echo)는 서버 사이드 브로드캐스트 드라이버가 브로드캐스트하는 이벤트를 손쉽게 구독하고 수신할 수 있는 JavaScript 라이브러리입니다. Echo는 NPM 패키지 매니저로 설치할 수 있습니다. 이 예제에서도 `pusher-js` 패키지를 함께 설치합니다.

혹시 Ably 전용인데도 불구하고 왜 `pusher-js` JavaScript 라이브러리를 설치해야 하는지 궁금하실 수 있습니다. 다행히도 Ably에는 Pusher 호환 모드가 있어서, 클라이언트 애플리케이션에서 Pusher 프로토콜을 사용해 이벤트를 수신할 수 있도록 해줍니다.

```bash
npm install --save-dev laravel-echo pusher-js
```

**계속 진행하기 전에, Ably 애플리케이션 설정의 "Protocol Adapter Settings" 섹션에서 Pusher 프로토콜 지원을 활성화해주셔야 합니다.**

Echo 설치가 완료되면, 여러분의 애플리케이션 JavaScript에서 새로운 Echo 인스턴스를 생성합니다. 보통 `resources/js/bootstrap.js` 파일 하단에 추가하는 것이 가장 좋습니다. 이 파일에는 기본적으로 Echo 설정 예제가 포함되어 있지만, `bootstrap.js` 내 기본 설정은 Pusher용이니, 아래 설정처럼 Ably에 맞게 복사해 변경해주면 됩니다:

```js
import Echo from 'laravel-echo';

window.Pusher = require('pusher-js');

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: process.env.MIX_ABLY_PUBLIC_KEY,
    wsHost: 'realtime-pusher.ably.io',
    wsPort: 443,
    disableStats: true,
    encrypted: true,
});
```

참고로, 이 예제의 Ably Echo 설정에서 사용된 `MIX_ABLY_PUBLIC_KEY` 환경 변수 값은 Ably의 public key여야 하며, Ably 전체 키 중 `:` 문자 앞 부분에 해당합니다.

Echo 설정을 주석 해제하고 프로젝트 환경에 맞게 조정했다면, 다음 명령어로 애플리케이션 에셋을 컴파일할 수 있습니다:

```
npm run dev
```

> [!TIP]
> 애플리케이션의 JavaScript 에셋 컴파일 방법에 대해서는 [Laravel Mix](/docs/8.x/mix) 문서를 참고하세요.

<a name="concept-overview"></a>
## 개념 개요

라라벨의 이벤트 브로드캐스팅은 드라이버 기반으로 설계되어 있어, 서버 사이드의 라라벨 이벤트를 클라이언트 사이드 JavaScript 애플리케이션으로 매우 손쉽게 브로드캐스트할 수 있습니다. 라라벨에는 기본적으로 [Pusher Channels](https://pusher.com/channels)와 [Ably](https://ably.io) 드라이버가 포함되어 있습니다. 클라이언트에서는 [Laravel Echo](#client-side-installation) JavaScript 패키지를 사용하여 쉽게 이벤트를 수신할 수 있습니다.

이벤트는 "채널"을 통해 브로드캐스트됩니다. 채널은 공용(public) 또는 비공용(private)으로 지정할 수 있습니다. 누구나 인증이나 인가 과정 없이 공용 채널에 구독할 수 있지만, 비공용(프라이빗) 채널을 구독하려면 반드시 인증 및 인가를 받아야 합니다.

> [!TIP]
> Pusher의 오픈 소스 대안이 궁금하다면 [오픈 소스 대안](#open-source-alternatives) 문서를 참고하세요.

<a name="using-example-application"></a>
### 예제 애플리케이션 활용

이벤트 브로드캐스팅의 각 컴포넌트를 본격적으로 살펴보기 전에, 먼저 통합 예시로 개념을 빠르게 훑어보겠습니다. 예로 들어 전자상거래(이커머스) 스토어를 다루는 애플리케이션을 생각해봅시다.

이 애플리케이션에는 사용자가 자신의 주문 상태(배송 현황 등)를 볼 수 있는 페이지가 있습니다. 그리고 주문의 발송 상태가 갱신되는 시점에 `OrderShipmentStatusUpdated` 이벤트가 발생한다고 가정해봅니다:

```
use App\Events\OrderShipmentStatusUpdated;

OrderShipmentStatusUpdated::dispatch($order);
```

<a name="the-shouldbroadcast-interface"></a>
#### `ShouldBroadcast` 인터페이스

사용자가 특정 주문을 조회하고 있을 때, 새로고침 없이 배송 상태 업데이트를 실시간으로 받고 싶을 경우가 많습니다. 이를 위해서는, `OrderShipmentStatusUpdated` 이벤트에 `ShouldBroadcast` 인터페이스를 구현해야 합니다. 이 인터페이스를 구현하면, 이벤트가 발생했을 때 라라벨이 자동으로 해당 이벤트를 브로드캐스트합니다:

```
<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class OrderShipmentStatusUpdated implements ShouldBroadcast
{
    /**
     * 주문 인스턴스
     *
     * @var \App\Order
     */
    public $order;
}
```

`ShouldBroadcast` 인터페이스를 구현하면 반드시 `broadcastOn` 메서드를 정의해야 합니다. 이 메서드는 이벤트를 브로드캐스트할 채널(들)을 반환하는 역할을 합니다. 이벤트 클래스를 생성할 때 이미 비어있는 `broadcastOn` 메서드가 포함되어 있으니, 세부 내용을 채워주기만 하면 됩니다. 여기서는 주문의 생성자만 해당 주문 상태를 볼 수 있어야 하므로, 주문에 연결된 프라이빗 채널에서만 브로드캐스트하도록 합니다:

```
/**
 * 이벤트가 브로드캐스트될 채널을 반환합니다.
 *
 * @return \Illuminate\Broadcasting\PrivateChannel
 */
public function broadcastOn()
{
    return new PrivateChannel('orders.'.$this->order->id);
}
```

<a name="example-application-authorizing-channels"></a>
#### 채널 인가

프라이빗 채널을 수신하려면, 사용자가 해당 채널을 구독할 수 있는 인가를 반드시 받아야 함을 기억하세요. 애플리케이션의 `routes/channels.php` 파일에서 채널 인가 규칙을 정의할 수 있습니다. 아래 예제에서는, 프라이빗 채널인 `orders.1`을 구독하려는 사용자가 실제로 해당 주문의 생성자인지 검증합니다:

```
use App\Models\Order;

Broadcast::channel('orders.{orderId}', function ($user, $orderId) {
    return $user->id === Order::findOrNew($orderId)->user_id;
});
```

`channel` 메서드는 채널의 이름과, 사용자의 인가 여부를 반환하는 콜백을 인수로 받습니다. 콜백에는 현재 인증된 사용자(첫 번째 인수)와, 채널 이름에 포함된 와일드카드 파라미터({orderId} 등)가 추가 인수로 전달됩니다. 위 예시에서는 `{orderId}` 자리에서 해당 주문 번호가 전달되어 실제로 채널을 구독할 자격이 있는지 확인합니다.

<a name="listening-for-event-broadcasts"></a>
#### JavaScript에서 이벤트 브로드캐스트 수신하기

이제 남은 일은, JavaScript 애플리케이션에서 이 이벤트를 수신하는 것입니다. 이는 [Laravel Echo](#client-side-installation)를 활용하여 간단히 구현할 수 있습니다. 먼저 `private` 메서드로 프라이빗 채널에 구독하고, 이어서 `listen` 메서드를 통해 `OrderShipmentStatusUpdated` 이벤트를 수신합니다. 기본적으로 이벤트의 `public` 속성은 모두 브로드캐스트 데이터로 전송됩니다:

```js
Echo.private(`orders.${orderId}`)
    .listen('OrderShipmentStatusUpdated', (e) => {
        console.log(e.order);
    });
```

<a name="defining-broadcast-events"></a>
## 브로드캐스트 이벤트 정의

특정 이벤트를 브로드캐스팅해야 함을 라라벨에 알리려면, 해당 이벤트 클래스에 `Illuminate\Contracts\Broadcasting\ShouldBroadcast` 인터페이스를 구현해야 합니다. 이 인터페이스는 프레임워크가 생성하는 모든 이벤트 클래스에서 이미 임포트되어 있으므로, 간단히 implements 키워드만 추가하면 됩니다.

`ShouldBroadcast` 인터페이스를 구현하면 반드시 하나의 메서드, 즉 `broadcastOn`을 정의해야 합니다. 이 메서드는 이벤트를 브로드캐스트할 채널(또는 채널 배열)을 반환해야 합니다. 여기서 반환하는 채널 객체는 `Channel`, `PrivateChannel`, 또는 `PresenceChannel`의 인스턴스가 되어야 합니다. `Channel`은 누구든 구독할 수 있는 공용 채널을 나타내며, `PrivateChannel`과 `PresenceChannel`은 [채널 인가](#authorizing-channels)가 반드시 필요한 프라이빗 채널을 의미합니다:

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
     * 서버를 생성한 사용자
     *
     * @var \App\Models\User
     */
    public $user;

    /**
     * 새 이벤트 인스턴스 생성자
     *
     * @param  \App\Models\User  $user
     * @return void
     */
    public function __construct(User $user)
    {
        $this->user = $user;
    }

    /**
     * 이벤트가 브로드캐스트될 채널 반환
     *
     * @return Channel|array
     */
    public function broadcastOn()
    {
        return new PrivateChannel('user.'.$this->user->id);
    }
}
```

`ShouldBroadcast` 인터페이스를 구현했다면, 이제 일반 이벤트와 똑같이 [이벤트를 발생](/docs/8.x/events)시키면 됩니다. 이벤트가 발생하면, [큐에 등록된 작업](/docs/8.x/queues)을 통해 자동으로 지정한 브로드캐스트 드라이버로 이벤트가 브로드캐스팅됩니다.

<a name="broadcast-name"></a>
### 브로드캐스트 이름

기본적으로 라라벨은 이벤트 클래스의 이름을 그대로 브로드캐스트 이름으로 사용합니다. 하지만, 이벤트의 `broadcastAs` 메서드를 정의하면 브로드캐스트 이름을 커스터마이징할 수 있습니다:

```
/**
 * 이벤트의 브로드캐스트 이름 반환
 *
 * @return string
 */
public function broadcastAs()
{
    return 'server.created';
}
```

`broadcastAs` 메서드를 통해 브로드캐스트 이름을 별도로 지정했다면, 리스너를 등록할 때 앞에 `.`(점) 문자를 붙여야 합니다. 이렇게 하면 Echo가 애플리케이션 네임스페이스를 이벤트 이름 앞에 덧붙이지 않도록 지정할 수 있습니다:

```
.listen('.server.created', function (e) {
    ....
});
```

<a name="broadcast-data"></a>
### 브로드캐스트 데이터

이벤트가 브로드캐스트될 때, 해당 이벤트의 모든 `public` 속성(property)은 자동으로 직렬화되어 브로드캐스트 데이터(payload)에 포함됩니다. 따라서 JavaScript 애플리케이션에서 이 속성값들을 바로 사용할 수 있습니다. 예를 들어, 이벤트에 Eloquent 모델이 담긴 `public $user` 속성 하나만 있다면, 브로드캐스트 데이터는 아래와 같이 구성됩니다:

```
{
    "user": {
        "id": 1,
        "name": "Patrick Stewart"
        ...
    }
}
```

하지만, 브로드캐스트 데이터(payload)를 더 세밀하게 제어하고 싶다면 이벤트에 `broadcastWith` 메서드를 정의할 수 있습니다. 이 메서드는 이벤트로 브로드캐스트할 데이터를 배열 형태로 반환하면 됩니다:

```
/**
 * 브로드캐스트할 데이터 반환
 *
 * @return array
 */
public function broadcastWith()
{
    return ['id' => $this->user->id];
}
```

<a name="broadcast-queue"></a>
### 브로드캐스트 큐

기본적으로 모든 브로드캐스트 이벤트는 `queue.php` 설정 파일에 지정된 기본 큐의 기본 커넥션에 등록됩니다. 브로드캐스터에서 사용할 큐 커넥션과 큐 이름을 이벤트 클래스의 `connection` 및 `queue` 속성을 통해 직접 지정할 수도 있습니다:

```
/**
 * 이벤트 브로드캐스트에 사용할 큐 커넥션 이름
 *
 * @var string
 */
public $connection = 'redis';

/**
 * 브로드캐스팅 작업을 등록할 큐 이름
 *
 * @var string
 */
public $queue = 'default';
```

또는, 이벤트에 `broadcastQueue` 메서드를 정의해 큐 이름을 커스터마이징할 수도 있습니다:

```
/**
 * 브로드캐스팅 작업을 등록할 큐 이름 반환
 *
 * @return string
 */
public function broadcastQueue()
{
    return 'default';
}
```

만약 브로드캐스트 이벤트를 기본 큐 드라이버가 아닌 `sync` 큐를 통해 즉시 처리하고 싶다면, `ShouldBroadcast` 대신 `ShouldBroadcastNow` 인터페이스를 구현하면 됩니다:

```
<?php

use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class OrderShipmentStatusUpdated implements ShouldBroadcastNow
{
    //
}
```

<a name="broadcast-conditions"></a>
### 브로드캐스트 조건

특정 상황에서만 이벤트를 브로드캐스트하고 싶을 때는, 이벤트 클래스에 `broadcastWhen` 메서드를 추가하면 됩니다:

```
/**
 * 이 이벤트를 브로드캐스트할지 결정합니다.
 *
 * @return bool
 */
public function broadcastWhen()
{
    return $this->order->value > 100;
}
```

<a name="broadcasting-and-database-transactions"></a>
#### 브로드캐스팅과 데이터베이스 트랜잭션

데이터베이스 트랜잭션 내부에서 브로드캐스팅 이벤트가 디스패치(dispatch)될 때, 브로드캐스트 작업이 큐에서 실제 트랜잭션 커밋보다 먼저 처리될 수도 있습니다. 이 경우 트랜잭션 중에 변경된 모델이나 DB 레코드가 아직 DB에 반영되지 않았거나, 트랜잭션 내에서 생성된 레코드가 DB에 존재하지 않을 수 있습니다. 만약 브로드캐스트 이벤트가 이런 모델이나 데이터에 의존한다면, 예상치 못한 에러가 발생할 수 있습니다.

만약 큐 커넥션의 `after_commit` 설정이 `false`라면, 이벤트 클래스에 `$afterCommit` 속성을 설정하여 해당 브로드캐스트 작업이 모든 트랜잭션 커밋 이후에 처리되도록 지정할 수 있습니다:

```
<?php

namespace App\Events;

use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class ServerCreated implements ShouldBroadcast
{
    use SerializesModels;

    public $afterCommit = true;
}
```

> [!TIP]
> 이러한 문제를 우회하는 방법에 대해 더 자세히 알고 싶다면, [큐 작업과 데이터베이스 트랜잭션](/docs/8.x/queues#jobs-and-database-transactions) 문서를 참고하세요.

<a name="authorizing-channels"></a>
## 채널 인가(Authorization)

프라이빗 채널을 사용하려면, 현재 인증된 사용자가 해당 채널을 실제로 수신(listen)할 수 있는 자격이 있는지 반드시 인가해야 합니다. 이 과정은 채널 이름을 포함한 HTTP 요청을 라라벨 애플리케이션에 보내고, 애플리케이션이 사용자의 구독 권한을 검증하는 방식으로 이루어집니다. [Laravel Echo](#client-side-installation)를 사용할 경우, 프라이빗 채널 구독 인가를 위한 HTTP 요청이 자동으로 전송되지만, 애플리케이션에서 이 요청에 응답할 라우트를 별도로 정의해주어야 합니다.

<a name="defining-authorization-routes"></a>
### 인가 라우트 정의

라라벨에서는 채널 인가 요청에 응답할 라우트를 매우 쉽게 정의할 수 있습니다. 라라벨 애플리케이션에 기본 포함된 `App\Providers\BroadcastServiceProvider`에는 `Broadcast::routes` 메서드가 호출되어 있습니다. 이 메서드는 `/broadcasting/auth` 라우트를 등록해 브로드캐스트 인가 요청을 처리합니다:

```
Broadcast::routes();
```

`Broadcast::routes` 메서드는 기본적으로 등록하는 모든 라우트를 `web` 미들웨어 그룹에 포함시킵니다. 만약 라우트 속성을 커스터마이징하고 싶다면, 메서드에 속성(attributes) 배열을 전달할 수도 있습니다:

```
Broadcast::routes($attributes);
```

<a name="customizing-the-authorization-endpoint"></a>

#### 인증 엔드포인트 커스터마이즈하기

기본적으로 Echo는 채널 접근 권한을 인증하기 위해 `/broadcasting/auth` 엔드포인트를 사용합니다. 하지만 `authEndpoint` 설정 옵션을 Echo 인스턴스에 전달함으로써 여러분만의 인증 엔드포인트를 사용할 수 있습니다.

```
window.Echo = new Echo({
    broadcaster: 'pusher',
    // ...
    authEndpoint: '/custom/endpoint/auth'
});
```

<a name="customizing-the-authorization-request"></a>
#### 인증 요청 커스터마이즈하기

Laravel Echo가 인증 요청을 수행하는 방식을 커스터마이즈하려면 Echo를 초기화할 때 사용자 지정 authorizer를 제공할 수 있습니다.

```
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
                    callback(false, response.data);
                })
                .catch(error => {
                    callback(true, error);
                });
            }
        };
    },
})
```

<a name="defining-authorization-callbacks"></a>
### 인증 콜백 정의하기

다음으로, 현재 인증된 사용자가 특정 채널을 청취할 권한이 있는지 실제로 판단하는 로직을 정의해야 합니다. 이 로직은 애플리케이션에 기본으로 포함된 `routes/channels.php` 파일에서 작성합니다. 이 파일 내에서, `Broadcast::channel` 메서드를 사용하여 채널 인증 콜백을 등록할 수 있습니다.

```
Broadcast::channel('orders.{orderId}', function ($user, $orderId) {
    return $user->id === Order::findOrNew($orderId)->user_id;
});
```

`channel` 메서드는 두 개의 인수를 받습니다. 채널 이름과, 사용자가 해당 채널을 청취할 권한이 있는지를 나타내는 `true` 또는 `false` 값을 반환하는 콜백입니다.

모든 인증 콜백은 첫 번째 인수로 현재 인증된 사용자를, 그리고 이후 인수로는 와일드카드 파라미터를 받습니다. 이 예제에서는 `{orderId}` 플레이스홀더를 사용하여 채널 이름의 "ID" 부분이 와일드카드임을 나타냅니다.

<a name="authorization-callback-model-binding"></a>
#### 인증 콜백과 모델 바인딩

HTTP 라우트와 마찬가지로, 채널 라우트에서도 [라우트 모델 바인딩](/docs/8.x/routing#route-model-binding)의 명시적 및 암묵적 방식 모두를 활용할 수 있습니다. 예를 들어, 문자열이나 숫자 형태의 주문 ID 대신 실제 `Order` 모델 인스턴스를 받을 수도 있습니다.

```
use App\Models\Order;

Broadcast::channel('orders.{order}', function ($user, Order $order) {
    return $user->id === $order->user_id;
});
```

> [!NOTE]
> HTTP 라우트 모델 바인딩과 달리, 채널 모델 바인딩은 자동 [암묵적 모델 바인딩 스코프](/docs/8.x/routing#implicit-model-binding-scoping)를 지원하지 않습니다. 하지만 대부분의 경우, 채널은 단일 모델의 고유 기본 키로 범위가 지정되기 때문에 이 점이 문제되는 경우는 드뭅니다.

<a name="authorization-callback-authentication"></a>
#### 인증 콜백의 인증 처리

프라이빗 및 프리즌스 브로드캐스트 채널은 애플리케이션의 기본 인증 가드(guard)를 통해 현재 사용자를 인증합니다. 사용자가 인증되지 않았다면 채널 인증은 자동으로 거부되며, 인증 콜백이 실행되지 않습니다. 하지만 필요하다면 여러 개의 커스텀 가드를 지정해서, 해당 요청을 인증 처리하도록 할 수 있습니다.

```
Broadcast::channel('channel', function () {
    // ...
}, ['guards' => ['web', 'admin']]);
```

<a name="defining-channel-classes"></a>
### 채널 클래스 정의하기

애플리케이션이 다양한 채널을 많이 사용한다면 `routes/channels.php` 파일이 복잡해질 수 있습니다. 이럴 때는 클로저 대신 채널 클래스를 사용할 수 있습니다. 채널 클래스를 생성하려면 `make:channel` Artisan 명령어를 사용합니다. 이렇게 하면 `App/Broadcasting` 디렉터리에 새로운 채널 클래스가 생성됩니다.

```
php artisan make:channel OrderChannel
```

다음으로, `routes/channels.php` 파일에서 해당 채널을 등록합니다.

```
use App\Broadcasting\OrderChannel;

Broadcast::channel('orders.{order}', OrderChannel::class);
```

마지막으로, 채널 클래스의 `join` 메서드에 채널 인증 로직을 작성할 수 있습니다. 이 `join` 메서드에는 보통 클로저로 등록하던 동일한 로직을 포함하면 됩니다. 또한 채널 모델 바인딩도 활용할 수 있습니다.

```
<?php

namespace App\Broadcasting;

use App\Models\Order;
use App\Models\User;

class OrderChannel
{
    /**
     * Create a new channel instance.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Authenticate the user's access to the channel.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Order  $order
     * @return array|bool
     */
    public function join(User $user, Order $order)
    {
        return $user->id === $order->user_id;
    }
}
```

> [!TIP]
> 라라벨의 여러 클래스와 마찬가지로, 채널 클래스도 [서비스 컨테이너](/docs/8.x/container)에 의해 자동으로 resolve됩니다. 따라서 생성자에서 필요한 의존성을 타입 힌트로 명시하면, 자동으로 주입받을 수 있습니다.

<a name="broadcasting-events"></a>
## 이벤트 브로드캐스팅

이벤트를 정의하고 `ShouldBroadcast` 인터페이스를 구현한 후에는, 해당 이벤트의 dispatch 메서드를 사용해 이벤트를 발생시키면 됩니다. 이벤트 디스패처는 이벤트에 `ShouldBroadcast` 인터페이스가 구현되어 있음을 감지하고, 해당 이벤트를 브로드캐스팅 대기열에 추가합니다.

```
use App\Events\OrderShipmentStatusUpdated;

OrderShipmentStatusUpdated::dispatch($order);
```

<a name="only-to-others"></a>
### 다른 사용자에게만 브로드캐스트하기

이벤트 브로드캐스팅을 사용하는 애플리케이션에서는, 때때로 현재 사용자를 제외한 모두에게 이벤트를 브로드캐스트해야 할 때가 있습니다. 이럴 때는 `broadcast` 헬퍼와 `toOthers` 메서드를 활용할 수 있습니다.

```
use App\Events\OrderShipmentStatusUpdated;

broadcast(new OrderShipmentStatusUpdated($update))->toOthers();
```

언제 `toOthers` 메서드를 사용하면 좋은지 이해하기 위해, 할일 목록 애플리케이션을 예로 들어 보겠습니다. 사용자가 새로운 작업을 추가할 때, 애플리케이션에서는 `/task` URL에 요청을 보내 작업 생성을 처리하고, 새 작업의 JSON 데이터를 반환할 수 있습니다. 클라이언트(예: 자바스크립트 앱)는 응답을 받아 작업 목록에 새 작업을 직접 추가할 수 있습니다.

```
axios.post('/task', task)
    .then((response) => {
        this.tasks.push(response.data);
    });
```

하지만 작업 생성 시 이벤트도 브로드캐스트된다면, 자바스크립트 앱이 이벤트를 청취해 또 한 번 작업을 추가할 수 있기 때문에, 같은 작업이 두 번 추가되는 문제가 발생할 수 있습니다. 이런 중복을 방지하려면 `toOthers` 메서드를 사용하여 브로드캐스트 대상에서 현재 사용자를 제외하면 됩니다.

> [!NOTE]
> 이벤트에서 `toOthers` 메서드를 사용하려면, 반드시 해당 이벤트 클래스가 `Illuminate\Broadcasting\InteractsWithSockets` 트레잇을 사용해야 합니다.

<a name="only-to-others-configuration"></a>
#### 설정

Laravel Echo 인스턴스를 초기화하면, 연결에 socket ID가 부여됩니다. 자바스크립트 애플리케이션에서 [Axios](https://github.com/mzabriskie/axios)와 같은 전역 인스턴스를 사용해 HTTP 요청을 보낼 경우, 각 요청 헤더에 자동으로 `X-Socket-ID` 값이 추가됩니다. 그러면 `toOthers` 메서드는 이 socket ID를 활용해, 해당 ID를 가진 접속자에게는 브로드캐스트를 하지 않도록 지시합니다.

전역 Axios 인스턴스를 사용하지 않는 경우, 자바스크립트 애플리케이션에서 모든 요청 시 수동으로 `X-Socket-ID` 헤더를 추가해야 합니다. 이때는 `Echo.socketId` 메서드를 사용해 socket ID를 얻을 수 있습니다.

```
var socketId = Echo.socketId();
```

<a name="customizing-the-connection"></a>
### 브로드캐스트 연결 커스터마이즈하기

여러 브로드캐스트 커넥션을 사용하는 애플리케이션에서, 기본 브로드캐스터 이외의 브로드캐스터로 이벤트를 전송하려면 `via` 메서드를 사용할 수 있습니다.

```
use App\Events\OrderShipmentStatusUpdated;

broadcast(new OrderShipmentStatusUpdated($update))->via('pusher');
```

또한, 이벤트의 생성자 내부에서 `broadcastVia` 메서드를 호출하여, 이벤트의 브로드캐스트 커넥션을 지정할 수도 있습니다. 이 전에, 이벤트 클래스가 `InteractsWithBroadcasting` 트레잇을 사용하고 있는지 확인해야 합니다.

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
     *
     * @return void
     */
    public function __construct()
    {
        $this->broadcastVia('pusher');
    }
}
```

<a name="receiving-broadcasts"></a>
## 브로드캐스트 수신하기

<a name="listening-for-events"></a>
### 이벤트 청취하기

[Laravel Echo를 설치하고 인스턴스를 생성](#client-side-installation)했다면, 라라벨 애플리케이션에서 브로드캐스트된 이벤트를 청취할 준비가 된 것입니다. 먼저, `channel` 메서드를 사용해 채널 인스턴스를 가져온 뒤, `listen` 메서드를 호출해서 원하는 이벤트를 구독하면 됩니다.

```js
Echo.channel(`orders.${this.order.id}`)
    .listen('OrderShipmentStatusUpdated', (e) => {
        console.log(e.order.name);
    });
```

프라이빗 채널의 이벤트를 듣고 싶다면 `private` 메서드를 사용하세요. 여러 이벤트를 하나의 채널에서 연속으로 `listen` 체이닝 방식으로 청취할 수도 있습니다.

```js
Echo.private(`orders.${this.order.id}`)
    .listen(...)
    .listen(...)
    .listen(...);
```

<a name="stop-listening-for-events"></a>
#### 특정 이벤트 청취 중단하기

특정 이벤트의 청취만 중단하고 [채널 자체에서 나가고 싶지 않은 경우](#leaving-a-channel)에는 `stopListening` 메서드를 사용할 수 있습니다.

```js
Echo.private(`orders.${this.order.id}`)
    .stopListening('OrderShipmentStatusUpdated')
```

<a name="leaving-a-channel"></a>
### 채널에서 나가기

채널에서 나가려면 Echo 인스턴스의 `leaveChannel` 메서드를 호출합니다.

```js
Echo.leaveChannel(`orders.${this.order.id}`);
```

주어진 채널뿐 아니라 그와 연관된 프라이빗 및 프리즌스 채널 모두에서 나가고 싶을 때는, `leave` 메서드를 사용하세요.

```js
Echo.leave(`orders.${this.order.id}`);
```
<a name="namespaces"></a>
### 네임스페이스

위 예제들에서 이벤트 클래스의 전체 `App\Events` 네임스페이스를 따로 지정하지 않은 점을 눈치챘을 수도 있습니다. 이는 Echo가 기본적으로 이벤트가 `App\Events` 네임스페이스에 있다고 간주하기 때문입니다. 하지만 Echo를 인스턴스화할 때 `namespace` 옵션을 전달해 루트 네임스페이스를 직접 설정할 수 있습니다.

```js
window.Echo = new Echo({
    broadcaster: 'pusher',
    // ...
    namespace: 'App.Other.Namespace'
});
```

또는, 이벤트를 구독할 때 Echo의 `listen` 메서드에 클래스를 `.` 으로 시작해 접두사 형태로 붙여 항상 전체 수식 네임스페이스를 사용할 수도 있습니다.

```js
Echo.channel('orders')
    .listen('.Namespace\\Event\\Class', (e) => {
        //
    });
```

<a name="presence-channels"></a>
## 프리즌스 채널(Presence Channels)

프리즌스 채널은 프라이빗 채널의 보안 위에, 채널에 누가 구독 중인지 인지할 수 있는 기능이 더해진 채널입니다. 이를 통해 같은 페이지를 보고 있는 다른 사용자가 누구인지 알리는 기능이나, 채팅방 입장 멤버 목록 등의 강력한 협업 기능을 쉽게 구축할 수 있습니다.

<a name="authorizing-presence-channels"></a>
### 프리즌스 채널 인가(Authorization)

프리즌스 채널은 프라이빗 채널이기도 하므로, [접근 인가](#authorizing-channels)가 필요합니다. 그러나 프라이빗 채널과 달리, 프리즌스 채널의 인증 콜백에서는 사용자가 채널에 참여할 수 있는 경우 `true`를 반환하는 것이 아니라, 사용자에 대한 데이터를 배열로 반환해야 합니다.

이 콜백에서 반환된 데이터는 자바스크립트 애플리케이션의 프리즌스 채널 이벤트 리스너에서 사용할 수 있습니다. 사용자가 채널 참여를 인가받지 못하면, `false` 또는 `null`을 반환하면 됩니다.

```
Broadcast::channel('chat.{roomId}', function ($user, $roomId) {
    if ($user->canJoinRoom($roomId)) {
        return ['id' => $user->id, 'name' => $user->name];
    }
});
```

<a name="joining-presence-channels"></a>
### 프리즌스 채널 참여하기

프리즌스 채널에 참여하려면 Echo의 `join` 메서드를 사용합니다. `join` 메서드는 `PresenceChannel` 구현체를 반환합니다. 이 구현체는 `listen` 메서드뿐 아니라, `here`, `joining`, `leaving` 이벤트 구독 메서드도 함께 제공합니다.

```
Echo.join(`chat.${roomId}`)
    .here((users) => {
        //
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

`here` 콜백은 채널에 성공적으로 참여하자마자 즉시 실행되며, 현재 채널에 구독 중인 모든 다른 사용자의 정보를 담은 배열을 인자로 받습니다. `joining` 메서드는 새로운 사용자가 채널에 들어올 때 실행되고, `leaving` 메서드는 사용자가 나갈 때 실행됩니다. `error` 메서드는 인증 엔드포인트가 200이 아닌 상태 코드를 반환하거나, 반환된 JSON을 파싱하는 데 문제가 발생할 때 실행됩니다.

<a name="broadcasting-to-presence-channels"></a>
### 프리즌스 채널로 브로드캐스팅하기

프리즌스 채널도 퍼블릭이나 프라이빗 채널처럼 이벤트를 수신할 수 있습니다. 예를 들어, 채팅방에서 `NewMessage` 이벤트를 해당 방의 프리즌스 채널로 브로드캐스트할 수 있습니다. 이벤트의 `broadcastOn` 메서드에서 `PresenceChannel` 인스턴스를 반환하면 됩니다.

```
/**
 * Get the channels the event should broadcast on.
 *
 * @return Channel|array
 */
public function broadcastOn()
{
    return new PresenceChannel('room.'.$this->message->room_id);
}
```

다른 이벤트와 마찬가지로, `broadcast` 헬퍼와 `toOthers` 메서드를 사용하면 현재 사용자를 브로드캐스트 대상에서 제외할 수 있습니다.

```
broadcast(new NewMessage($message));

broadcast(new NewMessage($message))->toOthers();
```

다른 종류의 이벤트와 마찬가지로, 프리즌스 채널로 전송된 이벤트를 Echo의 `listen` 메서드로 청취할 수 있습니다.

```
Echo.join(`chat.${roomId}`)
    .here(...)
    .joining(...)
    .leaving(...)
    .listen('NewMessage', (e) => {
        //
    });
```

<a name="model-broadcasting"></a>
## 모델 브로드캐스팅(Model Broadcasting)

> [!NOTE]
> 모델 브로드캐스팅 관련 섹션을 읽기 전에, 라라벨의 모델 브로드캐스팅 서비스의 기본 개념과, 브로드캐스트 이벤트를 직접 생성 및 청취하는 방법을 충분히 숙지하시길 권장합니다.

애플리케이션의 [Eloquent 모델](/docs/8.x/eloquent)이 생성, 수정, 삭제될 때 이벤트를 브로드캐스트하는 것은 매우 일반적입니다. 물론, 이런 처리를 위해 [Eloquent 모델 상태 변화에 대한 커스텀 이벤트](/docs/8.x/eloquent#events)를 직접 정의하고, 이 이벤트에 `ShouldBroadcast` 인터페이스를 구현하는 방식도 사용할 수 있습니다.

그렇지만, 다른 용도가 없이 오직 브로드캐스트만을 위해 이벤트 클래스를 만드는 것이 번거로울 수 있습니다. 이를 해결하기 위해, 라라벨은 Eloquent 모델이 상태 변화를 자동으로 브로드캐스트할 수 있도록 지원합니다.

우선, Eloquent 모델에서 `Illuminate\Database\Eloquent\BroadcastsEvents` 트레잇을 사용하세요. 그리고 `broadcastsOn` 메서드를 정의해, 모델의 이벤트가 브로드캐스트될 채널 배열을 반환하도록 설정합니다.

```php
<?php

namespace App\Models;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Database\Eloquent\BroadcastsEvents;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use BroadcastsEvents, HasFactory;

    /**
     * Get the user that the post belongs to.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the channels that model events should broadcast on.
     *
     * @param  string  $event
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn($event)
    {
        return [$this, $this->user];
    }
}
```

이렇게 트레잇을 추가하고 브로드캐스트 채널을 정의하면, 모델 인스턴스가 생성, 수정, 삭제, 휴지통 이동(trashed), 복원(restored)될 때마다 자동으로 관련 이벤트가 브로드캐스트됩니다.

또한, `broadcastOn` 메서드에 문자열 `$event` 인수가 전달되는 점에 주목해주세요. 이 인수에는 현재 발생한 모델 이벤트의 타입(예: `created`, `updated`, `deleted`, `trashed`, `restored`)이 담깁니다. 이 값을 활용해, 어떤 이벤트에 대해 어떤 채널을 브로드캐스트할지 판단할 수 있습니다.

```php
/**
 * Get the channels that model events should broadcast on.
 *
 * @param  string  $event
 * @return \Illuminate\Broadcasting\Channel|array
 */
public function broadcastOn($event)
{
    return match ($event) {
        'deleted' => [],
        default => [$this, $this->user],
    };
}
```

<a name="customizing-model-broadcasting-event-creation"></a>
#### 모델 브로드캐스팅 이벤트 생성 커스터마이즈하기

때때로 라라벨이 내부적으로 모델 브로드캐스팅 이벤트를 생성하는 방식을 커스터마이즈하고 싶을 수 있습니다. 이럴 때는 Eloquent 모델에 `newBroadcastableEvent` 메서드를 정의할 수 있습니다. 이 메서드는 반드시 `Illuminate\Database\Eloquent\BroadcastableModelEventOccurred` 인스턴스를 반환해야 합니다.

```php
use Illuminate\Database\Eloquent\BroadcastableModelEventOccurred

/**
 * Create a new broadcastable model event for the model.
 *
 * @param  string  $event
 * @return \Illuminate\Database\Eloquent\BroadcastableModelEventOccurred
 */
protected function newBroadcastableEvent($event)
{
    return (new BroadcastableModelEventOccurred(
        $this, $event
    ))->dontBroadcastToCurrentUser();
}
```

<a name="model-broadcasting-conventions"></a>
### 모델 브로드캐스팅 관례

<a name="model-broadcasting-channel-conventions"></a>
#### 채널 네이밍 관례

앞선 예시에서 모델의 `broadcastOn` 메서드가 `Channel` 인스턴스 대신 Eloquent 모델 인스턴스를 반환한 것을 확인할 수 있습니다. 모델의 `broadcastOn` 메서드에서 Eloquent 모델 인스턴스(혹은 이를 포함하는 배열)를 반환하면, 라라벨은 자동으로 모델의 클래스명과 기본 키 식별자를 채널 이름으로 사용해 프라이빗 채널 인스턴스를 생성합니다.

예를 들어, `App\Models\User` 모델의 `id`가 `1`이라면, `Illuminate\Broadcasting\PrivateChannel` 인스턴스가 `App.Models.User.1`이라는 이름으로 만들어집니다. 물론, 모델의 `broadcastOn` 메서드에서 Eloquent 모델 대신 직접 `Channel` 인스턴스를 반환해, 채널 이름을 완전히 제어하는 것도 가능합니다.

```php
use Illuminate\Broadcasting\PrivateChannel;

/**
 * Get the channels that model events should broadcast on.
 *
 * @param  string  $event
 * @return \Illuminate\Broadcasting\Channel|array
 */
public function broadcastOn($event)
{
    return [new PrivateChannel('user.'.$this->id)];
}
```

`broadcastOn` 메서드에서 채널 인스턴스를 명시적으로 반환할 계획이라면, 이를 생성할 때 Eloquent 모델 인스턴스를 인수로 전달할 수 있습니다. 이렇게 하면 라라벨은 모델 브로드캐스팅 관례를 사용해, 해당 모델을 채널 이름 문자열로 자동 변환합니다.

```php
return [new Channel($this->user)];
```

모델의 실제 채널 이름이 궁금하다면, 어떤 모델 인스턴스에서도 `broadcastChannel` 메서드를 호출하여 확인할 수 있습니다. 예를 들어, `App\Models\User` 모델의 `id`가 `1`인 경우, 해당 메서드는 `App.Models.User.1` 문자열을 반환합니다.

```php
$user->broadcastChannel()
```

<a name="model-broadcasting-event-conventions"></a>
#### 이벤트 네이밍 관례

모델 브로드캐스트 이벤트는 애플리케이션 `App\Events` 디렉터리에 "실제" 이벤트가 존재하는 것이 아니므로, 관례에 따라 이름과 페이로드가 할당됩니다. 라라벨은 모델의 클래스명(네임스페이스 제외)과 해당 이벤트 타입을 조합해 이벤트 이름을 구성합니다.

예를 들어, `App\Models\Post` 모델이 수정되면 클라이언트 애플리케이션에는 `PostUpdated`라는 이름으로 아래와 같은 페이로드가 전송됩니다.

```
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

`App\Models\User` 모델이 삭제될 경우에는 `UserDeleted` 이벤트 이름이 사용됩니다.

원한다면, 모델에 `broadcastAs` 및 `broadcastWith` 메서드를 추가해, 브로드캐스트되는 이름과 페이로드를 커스터마이즈할 수 있습니다. 이 메서드는 해당 모델 이벤트/작업의 이름을 인수로 받아, 각 작업 유형별 명칭과 페이로드를 원하는 대로 세밀하게 제어할 수 있습니다. `broadcastAs`에서 `null`을 반환하면, 라라벨은 위에 설명한 기본 네이밍 관례를 따릅니다.

```php
/**
 * The model event's broadcast name.
 *
 * @param  string  $event
 * @return string|null
 */
public function broadcastAs($event)
{
    return match ($event) {
        'created' => 'post.created',
        default => null,
    };
}

/**
 * Get the data to broadcast for the model.
 *
 * @param  string  $event
 * @return array
 */
public function broadcastWith($event)
{
    return match ($event) {
        'created' => ['title' => $this->title],
        default => ['model' => $this],
    };
}
```

<a name="listening-for-model-broadcasts"></a>
### 모델 브로드캐스트 이벤트 청취하기

모델에 `BroadcastsEvents` 트레잇을 추가하고 `broadcastOn` 메서드를 정의했다면, 이제 클라이언트 애플리케이션에서 브로드캐스트된 모델 이벤트를 청취할 수 있습니다. 시작에 앞서 [이벤트 청취 방법](#listening-for-events)에 대한 전체 문서를 참고하면 좋습니다.

먼저, `private` 메서드를 사용해 채널 인스턴스를 얻은 다음, `listen` 메서드로 원하는 이벤트를 구독하세요. 일반적으로 `private` 메서드에 지정하는 채널 이름은 라라벨의 [모델 브로드캐스팅 관례](#model-broadcasting-conventions)를 따라야 합니다.

채널 인스턴스를 얻었다면, `listen` 메서드에서 원하는 이벤트를 구독할 수 있습니다. 모델 브로드캐스트 이벤트는 애플리케이션의 `App\Events` 디렉터리에 실제 이벤트 클래스가 존재하지 않으므로, [이벤트 이름](#model-broadcasting-event-conventions)에 반드시 `.`(점)을 접두사로 붙여 네임스페이스에 소속되지 않았음을 표시해야 합니다. 각 모델 브로드캐스트 이벤트에는 `model` 속성이 포함되어, 모델의 브로드캐스트 속성 전체가 전달됩니다.

```js
Echo.private(`App.Models.User.${this.user.id}`)
    .listen('.PostUpdated', (e) => {
        console.log(e.model);
    });
```

<a name="client-events"></a>

## 클라이언트 이벤트

> [!TIP]
> [Pusher Channels](https://pusher.com/channels)를 사용할 때는, 클라이언트 이벤트를 전송하려면 [애플리케이션 대시보드](https://dashboard.pusher.com/)의 "App Settings" 섹션에서 "Client Events" 옵션을 반드시 활성화해야 합니다.

때로는 라라벨 애플리케이션 서버를 거치지 않고, 다른 연결된 클라이언트들에게 직접 이벤트를 브로드캐스트하고 싶을 때가 있습니다. 예를 들어, 어떤 사용자가 화면에서 메시지를 입력하고 있다는 사실을 다른 사용자에게 알리는 "입력 중" 알림과 같은 경우에 매우 유용하게 사용할 수 있습니다.

클라이언트 이벤트를 브로드캐스트하려면 Echo의 `whisper` 메서드를 사용할 수 있습니다.

```
Echo.private(`chat.${roomId}`)
    .whisper('typing', {
        name: this.user.name
    });
```

클라이언트 이벤트를 수신하려면 `listenForWhisper` 메서드를 사용합니다.

```
Echo.private(`chat.${roomId}`)
    .listenForWhisper('typing', (e) => {
        console.log(e.name);
    });
```

<a name="notifications"></a>
## 알림

이벤트 브로드캐스팅을 [알림](/docs/8.x/notifications) 기능과 연동하면, 자바스크립트 애플리케이션이 페이지를 새로고침하지 않아도 새로운 알림이 도착하면 실시간으로 받아볼 수 있습니다. 시작하기 전에 [브로드캐스트 알림 채널](/docs/8.x/notifications#broadcast-notifications) 사용법에 관한 문서를 반드시 먼저 살펴보시기 바랍니다.

알림이 브로드캐스트 채널을 사용하도록 설정됐다면, Echo의 `notification` 메서드를 사용해 브로드캐스트 알림 이벤트를 수신할 수 있습니다. 이때, 채널 이름은 알림을 받는 엔티티의 클래스명을 기준으로 해야 합니다.

```
Echo.private(`App.Models.User.${userId}`)
    .notification((notification) => {
        console.log(notification.type);
    });
```

이 예시에서는, `broadcast` 채널을 통해 `App\Models\User` 인스턴스에 전달되는 모든 알림이 위 콜백에서 받아집니다. 라라벨 프레임워크에서는 기본적으로 제공하는 `BroadcastServiceProvider`에 `App.Models.User.{id}` 채널에 대한 채널 인가 콜백이 포함되어 있습니다.