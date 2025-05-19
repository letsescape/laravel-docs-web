# 브로드캐스팅 (Broadcasting)

- [소개](#introduction)
- [서버 측 설치](#server-side-installation)
    - [설정](#configuration)
    - [푸셔 채널](#pusher-channels)
    - [Ably](#ably)
    - [오픈 소스 대안](#open-source-alternatives)
- [클라이언트 측 설치](#client-side-installation)
    - [푸셔 채널](#client-pusher-channels)
    - [Ably](#client-ably)
- [개념 개요](#concept-overview)
    - [예제 애플리케이션 활용](#using-example-application)
- [브로드캐스트 이벤트 정의](#defining-broadcast-events)
    - [브로드캐스트 이름](#broadcast-name)
    - [브로드캐스트 데이터](#broadcast-data)
    - [브로드캐스트 큐](#broadcast-queue)
    - [브로드캐스트 조건](#broadcast-conditions)
    - [브로드캐스팅 & 데이터베이스 트랜잭션](#broadcasting-and-database-transactions)
- [채널 인가](#authorizing-channels)
    - [인가 라우트 정의](#defining-authorization-routes)
    - [인가 콜백 정의](#defining-authorization-callbacks)
    - [채널 클래스 정의](#defining-channel-classes)
- [이벤트 브로드캐스팅](#broadcasting-events)
    - [다른 사용자에게만 전송](#only-to-others)
    - [커넥션 커스터마이징](#customizing-the-connection)
- [브로드캐스트 수신](#receiving-broadcasts)
    - [이벤트 리스닝](#listening-for-events)
    - [채널에서 나가기](#leaving-a-channel)
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

많은 최신 웹 애플리케이션에서는 WebSocket을 활용해 실시간(Realtime)으로 사용자 인터페이스를 업데이트합니다. 서버에서 데이터가 변경되면, 일반적으로 WebSocket 연결을 통해 메시지가 전송되어 클라이언트 쪽에서 처리하게 됩니다. WebSocket은 변경 사항을 UI에 반영하기 위해 애플리케이션 서버에 계속해서 폴링(polling)하는 방식보다 훨씬 효율적입니다.

예를 들어, 여러분의 애플리케이션이 사용자의 데이터를 CSV 파일로 내보내 이메일로 전달하는 기능을 제공한다고 가정해봅시다. 그런데 이 파일 생성에는 몇 분이 소요되므로, [큐 작업](/docs/9.x/queues)으로 CSV 생산 및 전송을 처리하게 선택할 수 있습니다. CSV가 생성되어 사용자에게 메일이 발송되면, `App\Events\UserDataExported` 이벤트를 브로드캐스트하여, 이 이벤트를 애플리케이션의 JavaScript에서 수신할 수 있습니다. 이벤트 수신 후, 사용자는 페이지를 새로 고침하지 않아도 파일이 이메일로 전송되었다는 메시지를 바로 확인할 수 있습니다.

이처럼 실시간 기능 개발을 돕기 위해, 라라벨은 서버 측의 라라벨 [이벤트](/docs/9.x/events)를 WebSocket 연결을 통해 "브로드캐스트"하는 기능을 쉽게 제공합니다. 브로드캐스팅을 통해 서버 라라벨 애플리케이션과 클라이언트 JavaScript 애플리케이션 사이에서 동일한 이벤트명과 데이터를 손쉽게 공유할 수 있습니다.

브로드캐스트의 핵심 개념은 매우 간단합니다. 클라이언트는 프론트엔드에서 특정 이름의 채널에 연결하고, 여러분의 라라벨 애플리케이션은 백엔드에서 이 채널로 이벤트를 브로드캐스트합니다. 이 이벤트에는 프론트엔드에서 활용할 수 있는 다양한 데이터를 담을 수 있습니다.

<a name="supported-drivers"></a>
#### 지원 드라이버

라라벨은 기본적으로 두 가지 서버 사이드 브로드캐스팅 드라이버를 제공합니다: [Pusher Channels](https://pusher.com/channels)와 [Ably](https://ably.com). 이 외에도, 커뮤니티에서 제작된 [laravel-websockets](https://beyondco.de/docs/laravel-websockets/getting-started/introduction), [soketi](https://docs.soketi.app/)와 같은 패키지로 상용 브로드캐스트 서비스 없이도 사용할 수 있는 드라이버를 선택할 수 있습니다.

> [!NOTE]
> 이벤트 브로드캐스팅을 본격적으로 시작하기 전에, 라라벨의 [이벤트와 리스너](/docs/9.x/events) 문서를 먼저 읽어 보시기 바랍니다.

<a name="server-side-installation"></a>
## 서버 측 설치

라라벨의 이벤트 브로드캐스팅을 사용하려면, 먼저 라라벨 애플리케이션에 몇 가지 설정을 하고 필요한 패키지를 설치해야 합니다.

이벤트 브로드캐스팅은 서버 측 브로드캐스팅 드라이버에서 처리하며, 이 드라이버는 라라벨 이벤트를 브로드캐스트하게 됩니다. 클라이언트 측에서는 브라우저에서 [Laravel Echo](#client-side-installation) 라이브러리로 이 이벤트를 받을 수 있습니다. 걱정하지 마세요! 아래에 따라 각 설치 단계를 하나씩 차근차근 안내해 드립니다.

<a name="configuration"></a>
### 설정

앱의 모든 브로드캐스트 설정은 `config/broadcasting.php` 파일에 저장됩니다. 라라벨은 기본적으로 여러 가지 브로드캐스트 드라이버를 지원합니다: [Pusher Channels](https://pusher.com/channels), [Redis](/docs/9.x/redis), 그리고 로컬 개발 및 디버깅용 `log` 드라이버가 있습니다. 추가로, 테스트 중 브로드캐스팅을 완전히 비활성화할 수 있는 `null` 드라이버도 제공됩니다. 각 드라이버별 설정 예시는 `config/broadcasting.php` 파일에 포함되어 있으므로 참고하실 수 있습니다.

<a name="broadcast-service-provider"></a>
#### 브로드캐스트 서비스 프로바이더

이벤트를 브로드캐스트하기 전에 먼저 `App\Providers\BroadcastServiceProvider`를 등록해야 합니다. 신규 라라벨 프로젝트에서는 `config/app.php`의 `providers` 배열에서 해당 프로바이더의 주석만 해제하면 됩니다. 이 `BroadcastServiceProvider`는 브로드캐스트 인가 라우트 및 콜백을 등록하는 데 필요한 모든 코드를 포함합니다.

<a name="queue-configuration"></a>
#### 큐 설정

[큐 워커](/docs/9.x/queues)를 설정하고 실행하는 것도 필요합니다. 모든 브로드캐스트 로직은 큐에 저장된 작업을 통해 처리되며, 이를 통해 브로드캐스트 작업이 애플리케이션의 응답 속도에 영향을 주지 않도록 할 수 있습니다.

<a name="pusher-channels"></a>
### 푸셔 채널

브로드캐스팅에 [Pusher Channels](https://pusher.com/channels)를 사용할 계획이라면, Composer 패키지 관리자를 이용해 Pusher Channels PHP SDK를 설치해야 합니다.

```shell
composer require pusher/pusher-php-server
```

그 다음, `config/broadcasting.php` 설정 파일에서 푸셔 채널 인증 정보를 입력해야 합니다. 이 파일에는 예시 설정이 이미 포함되어 있어 `key`, `secret`, `application ID`만 지정하면 바로 사용할 수 있습니다. 일반적으로, 이런 값들은 `PUSHER_APP_KEY`, `PUSHER_APP_SECRET`, `PUSHER_APP_ID` [환경 변수](/docs/9.x/configuration#environment-configuration)로 관리합니다.

```ini
PUSHER_APP_ID=your-pusher-app-id
PUSHER_APP_KEY=your-pusher-key
PUSHER_APP_SECRET=your-pusher-secret
PUSHER_APP_CLUSTER=mt1
```

`config/broadcasting.php`의 `pusher` 설정에는 클러스터(cluster) 등 Channels에서 지원하는 추가적인 `options`도 지정할 수 있습니다.

이제 `.env` 파일에서 브로드캐스트 드라이버를 `pusher`로 바꿔야 합니다.

```ini
BROADCAST_DRIVER=pusher
```

마지막으로, [Laravel Echo](#client-side-installation)를 설치하고 설정하면 클라이언트에서 브로드캐스트 이벤트를 받을 준비가 됩니다.

<a name="pusher-compatible-open-source-alternatives"></a>
#### 오픈 소스 Pusher 대안

[laravel-websockets](https://github.com/beyondcode/laravel-websockets)와 [soketi](https://docs.soketi.app/) 패키지는 Pusher와 호환되는 WebSocket 서버를 라라벨에서 직접 실행할 수 있도록 해줍니다. 이로써 상용 WebSocket 제공자가 필요 없이 라라벨 브로드캐스팅의 모든 기능을 자유롭게 활용할 수 있습니다. 설치 및 사용 방법에 대한 자세한 내용은 [오픈 소스 대안](#open-source-alternatives) 문서를 참고해 주세요.

<a name="ably"></a>
### Ably

브로드캐스팅에 [Ably](https://ably.com)를 사용할 경우, Composer 패키지 관리자를 통해 Ably PHP SDK를 설치해야 합니다.

```shell
composer require ably/ably-php
```

이후, `config/broadcasting.php` 설정 파일에서 Ably 인증 정보를 입력해야 합니다. 이 파일에서도 예시 설정이 포함되어 있으므로 key만 간단히 지정하면 됩니다. 일반적으로 이 값은 `ABLY_KEY` [환경 변수](/docs/9.x/configuration#environment-configuration)로 관리합니다.

```ini
ABLY_KEY=your-ably-key
```

다음으로, `.env` 파일에서 브로드캐스트 드라이버를 `ably`로 변경해야 합니다.

```ini
BROADCAST_DRIVER=ably
```

이제 [Laravel Echo](#client-side-installation)를 설치하고 설정하면 클라이언트에서 브로드캐스트 이벤트를 받을 준비가 완료됩니다.

<a name="open-source-alternatives"></a>
### 오픈 소스 대안

<a name="open-source-alternatives-php"></a>
#### PHP

[laravel-websockets](https://github.com/beyondcode/laravel-websockets) 패키지는 순수 PHP만으로 동작하는, Pusher와 호환되는 라라벨용 WebSocket 서버입니다. 이 패키지를 사용하면 상용 WebSocket 서비스를 사용하지 않고도 라라벨 브로드캐스팅의 이점을 모두 누릴 수 있습니다. 설치 및 사용 방법 등 자세한 내용은 [공식 문서](https://beyondco.de/docs/laravel-websockets)를 참고하세요.

<a name="open-source-alternatives-node"></a>
#### Node

[Soketi](https://github.com/soketi/soketi)는 Node 기반의, Pusher와 호환되는 라라벨용 WebSocket 서버입니다. 내부적으로는 µWebSockets.js를 활용하여 고성능과 높은 확장성을 제공합니다. Soketi 역시 상용 WebSocket 서비스가 필요하지 않도록 지원합니다. 설치 및 사용법 등 추가 정보는 [공식 문서](https://docs.soketi.app/)를 참고하시기 바랍니다.

<a name="client-side-installation"></a>
## 클라이언트 측 설치

<a name="client-pusher-channels"></a>
### 푸셔 채널

[Laravel Echo](https://github.com/laravel/echo)는 서버 측 브로드캐스팅 드라이버가 브로드캐스트하는 이벤트를 구독하고 리스닝하는 작업을 쉽게 만들어주는 JavaScript 라이브러리입니다. Echo는 NPM 패키지 관리자를 통해 설치할 수 있습니다. 아래 예제에서는 `pusher-js` 패키지도 함께 설치합니다. 이는 푸셔 채널 브로드캐스터를 사용할 계획이기 때문입니다.

```shell
npm install --save-dev laravel-echo pusher-js
```

Echo 설치가 완료되면, 애플리케이션의 JavaScript에서 새로운 Echo 인스턴스를 생성할 수 있습니다. 일반적으로 이것은 라라벨 프레임워크에 포함된 `resources/js/bootstrap.js` 파일 하단에 작성하는 것이 좋습니다. 기본적으로 이 파일에는 Echo 설정 예제가 이미 포함되어 있으므로, 필요한 부분의 주석만 해제하면 됩니다.

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

예제의 Echo 설정을 해제(=주석 제거)하고, 필요한 대로 값을 조정한 뒤, 애플리케이션 에셋을 컴파일하면 됩니다.

```shell
npm run dev
```

> [!NOTE]
> 애플리케이션의 JavaScript 에셋 컴파일에 대해 더 자세히 알고 싶다면, [Vite](/docs/9.x/vite) 관련 문서를 참고하세요.

<a name="using-an-existing-client-instance"></a>
#### 기존 클라이언트 인스턴스 활용

이미 설정이 완료된 Pusher Channels 클라이언트 인스턴스가 있다면, Echo의 `client` 옵션을 통해 해당 인스턴스를 사용할 수 있습니다.

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

[Laravel Echo](https://github.com/laravel/echo)는 서버 측 브로드캐스팅 드라이버가 브로드캐스트하는 이벤트를 구독하고 리스닝하는 작업을 간편하게 해주는 JavaScript 라이브러리입니다. Echo는 NPM 패키지 관리자를 통해 설치할 수 있습니다. 이 예제에서도 `pusher-js` 패키지를 함께 설치합니다.

여러분은 "왜 Ably를 사용하는데 pusher-js JavaScript 라이브러리도 설치하지?"라고 궁금할 수 있습니다. 다행히도, Ably는 Pusher 호환 모드를 내장하고 있어서, 클라이언트 애플리케이션에서 이벤트를 받을 때 Pusher 프로토콜을 그대로 사용할 수 있습니다.

```shell
npm install --save-dev laravel-echo pusher-js
```

**다음 단계로 진행하기 전에, Ably의 애플리케이션 설정에서 Pusher 프로토콜 지원을 반드시 활성화해야 합니다. 이 기능은 Ably 애플리케이션의 설정 대시보드에서 'Protocol Adapter Settings' 부분에서 활성화할 수 있습니다.**

Echo를 설치한 후에는 애플리케이션의 JavaScript에서 새로운 Echo 인스턴스를 생성할 수 있습니다. 대체로 이 작업은 라라벨에 포함된 `resources/js/bootstrap.js` 파일 하단에서 진행하는 것이 좋습니다. 기본적으로 이 파일에는 예제 Echo 설정이 포함되어 있지만, 기본 설정은 Pusher용이기 때문에 아래의 설정 예시로 Ably에 맞춰 구성할 수 있습니다.

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

이때 Echo의 Ably 설정에서 사용되는 `VITE_ABLY_PUBLIC_KEY` 환경 변수는 여러분의 Ably public key 값이어야 합니다. public key는 Ably 키에서 `:` 문자 앞부분에 해당합니다.

Echo 설정을 주석 해제 및 수정한 뒤에는 애플리케이션 에셋을 아래 명령어로 컴파일할 수 있습니다.

```shell
npm run dev
```

> [!NOTE]
> 애플리케이션의 JavaScript 에셋 컴파일에 대한 자세한 내용은 [Vite](/docs/9.x/vite) 관련 문서를 참고하세요.

<a name="concept-overview"></a>
## 개념 개요

라라벨의 이벤트 브로드캐스팅을 사용하면 서버 측 라라벨 이벤트를 드라이버 기반으로 WebSocket을 통해 클라이언트 측 JavaScript 애플리케이션에 전달할 수 있습니다. 현재 라라벨은 [Pusher Channels](https://pusher.com/channels), [Ably](https://ably.com) 드라이버를 기본으로 제공합니다. 클라이언트 측에서는 [Laravel Echo](#client-side-installation) JavaScript 패키지로 브로드캐스트되는 이벤트를 쉽게 수신할 수 있습니다.

이벤트는 "채널"을 통해 브로드캐스트됩니다. 채널은 공개(public) 또는 비공개(private)로 지정할 수 있습니다. 애플리케이션의 방문자는 인증이나 인가 없이 공개 채널에 자유롭게 구독할 수 있지만, 비공개 채널에 구독하려면 반드시 인증 및 인가를 받아야 합니다.

> [!NOTE]
> Pusher의 오픈 소스 대안을 찾고 있다면 [오픈 소스 대안](#open-source-alternatives) 문서를 참고해보세요.

<a name="using-example-application"></a>
### 예제 애플리케이션 활용

각 브로드캐스팅 구성요소의 기능을 본격적으로 살펴보기 전에, 먼저 전자상거래 스토어(e-commerce store) 예제를 통해 큰 그림을 함께 살펴보겠습니다.

애플리케이션에 사용자가 자신의 주문 배송 상태를 확인할 수 있는 페이지가 있다고 가정해봅시다. 그리고 배송 상태가 갱신될 때마다 `OrderShipmentStatusUpdated` 이벤트가 애플리케이션에서 발생한다고 가정합니다.

```
use App\Events\OrderShipmentStatusUpdated;

OrderShipmentStatusUpdated::dispatch($order);
```

<a name="the-shouldbroadcast-interface"></a>
#### `ShouldBroadcast` 인터페이스

사용자가 자신의 주문서를 보고 있을 때, 매번 새로고침하지 않아도 상태 변화가 실시간으로 반영되면 좋을 것입니다. 그래서 우리는 `OrderShipmentStatusUpdated` 이벤트에 `ShouldBroadcast` 인터페이스를 추가하여, 이벤트가 발생할 때마다 라라벨이 해당 이벤트를 브로드캐스트하도록 설정해야 합니다.

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
     * 주문 인스턴스.
     *
     * @var \App\Order
     */
    public $order;
}
```

`ShouldBroadcast` 인터페이스는 이벤트에 `broadcastOn` 메서드를 반드시 구현하도록 요구합니다. 이 메서드는 이벤트를 브로드캐스트할 채널을 반환해야 합니다. 라라벨에서 이벤트 클래스를 생성할 때 이미 이 메서드의 틀(stub)이 생성되므로, 세부 내용만 채우면 됩니다. 주문 생성자만 상태 변경사항을 볼 수 있도록, 특정 주문에 연결된 비공개 채널로 이벤트를 브로드캐스트합니다.

```
/**
 * 이 이벤트를 브로드캐스트할 채널을 반환합니다.
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

비공개 채널에 구독하려면 인증이 필요하다는 점을 꼭 기억하세요. 애플리케이션의 `routes/channels.php` 파일에서 채널 인가 규칙을 정의할 수 있습니다. 아래 예제에서는, `orders.1` 비공개 채널을 구독하려는 사용자가 해당 주문의 실제 작성자인지 확인하는 검증 로직입니다.

```
use App\Models\Order;

Broadcast::channel('orders.{orderId}', function ($user, $orderId) {
    return $user->id === Order::findOrNew($orderId)->user_id;
});
```

`channel` 메서드는 두 개의 인자를 받습니다: 채널 이름, 그리고 해당 채널에 사용자가 구독할 자격이 있는지를 true/false로 반환하는 콜백 함수입니다.

모든 인가 콜백은 첫 번째 인자로 현재 인증된 사용자 객체가, 두 번째 이후에는 채널명 내 와일드카드에 해당하는 값을 파라미터로 전달 받습니다. 예제의 `{orderId}` 플레이스홀더는 채널명 중 아이디 부분이 와일드카드임을 의미합니다.

<a name="listening-for-event-broadcasts"></a>
#### 이벤트 브로드캐스트 리스닝

마지막 단계로, 이제 JavaScript 애플리케이션에서 해당 이벤트를 수신(listen)하면 됩니다. 여기서 [Laravel Echo](#client-side-installation)를 활용할 수 있습니다. 먼저 `private` 메서드로 비공개 채널에 구독한 후, `listen` 메서드로 `OrderShipmentStatusUpdated` 이벤트를 수신하면 됩니다. 기본적으로 이벤트의 모든 public 속성은 브로드캐스트 페이로드에 포함됩니다.

```js
Echo.private(`orders.${orderId}`)
    .listen('OrderShipmentStatusUpdated', (e) => {
        console.log(e.order);
    });
```

<a name="defining-broadcast-events"></a>
## 브로드캐스트 이벤트 정의

특정 이벤트를 브로드캐스트 대상으로 만들려면 이벤트 클래스에 `Illuminate\Contracts\Broadcasting\ShouldBroadcast` 인터페이스를 구현해야 합니다. 이 인터페이스는 라라벨 프레임워크에서 생성하는 모든 이벤트 클래스의 임포트 목록에 이미 포함되어 있으므로, 필요한 이벤트에 손쉽게 추가할 수 있습니다.

`ShouldBroadcast` 인터페이스는 오직 하나의 메서드, 즉 `broadcastOn`만 구현하면 됩니다. 이 메서드는 이벤트가 브로드캐스트될 채널 혹은 채널 배열을 반환해야 합니다. 반환되는 값은 `Channel`, `PrivateChannel`, 혹은 `PresenceChannel`의 인스턴스여야 합니다. `Channel`은 누구나 구독할 수 있는 공개 채널이며, `PrivateChannel`과 `PresenceChannel`은 [채널 인가](#authorizing-channels)가 필요한 비공개 채널입니다.

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
     * 서버를 생성한 사용자.
     *
     * @var \App\Models\User
     */
    public $user;

    /**
     * 새로운 이벤트 인스턴스 생성자.
     *
     * @param  \App\Models\User  $user
     * @return void
     */
    public function __construct(User $user)
    {
        $this->user = $user;
    }

    /**
     * 이 이벤트를 브로드캐스트할 채널을 반환합니다.
     *
     * @return Channel|array
     */
    public function broadcastOn()
    {
        return new PrivateChannel('user.'.$this->user->id);
    }
}
```

`ShouldBroadcast` 인터페이스를 구현한 후에는, 이벤트를 [일반적인 방식](/docs/9.x/events)으로 발생시키기만 하면 됩니다. 이벤트가 발생되면, [큐 작업](/docs/9.x/queues)이 자동으로 해당 브로드캐스트 드라이버를 사용해 이벤트를 브로드캐스트합니다.

<a name="broadcast-name"></a>
### 브로드캐스트 이름

기본적으로 라라벨은 이벤트의 클래스명을 이용해 이벤트를 브로드캐스트합니다. 하지만 `broadcastAs` 메서드를 이벤트 클래스에 정의하여 브로드캐스트 이름을 원하는 대로 지정할 수도 있습니다.

```
/**
 * 이벤트의 브로드캐스트 이름을 반환합니다.
 *
 * @return string
 */
public function broadcastAs()
{
    return 'server.created';
}
```

`broadcastAs` 메서드로 브로드캐스트 이름을 커스터마이징한 경우, 리스너를 등록할 때 이벤트명 앞에 마침표(`.`)를 반드시 붙여야 합니다. 이를 통해 Echo가 이벤트명 앞에 애플리케이션 네임스페이스를 붙이지 않도록 할 수 있습니다.

```
.listen('.server.created', function (e) {
    ....
});
```

<a name="broadcast-data"></a>
### 브로드캐스트 데이터

이벤트가 브로드캐스트되면, 해당 이벤트의 모든 `public` 속성이 자동으로 직렬화되어 이벤트 페이로드에 포함됩니다. 즉, JavaScript 애플리케이션에서 이벤트의 공개(public) 데이터를 편리하게 활용할 수 있습니다. 예를 들어, 이벤트에 단일 public `$user` 속성이 있고 이 속성이 Eloquent 모델일 경우, 브로드캐스트되는 페이로드는 다음과 같습니다.

```json
{
    "user": {
        "id": 1,
        "name": "Patrick Stewart"
        ...
    }
}
```

하지만 브로드캐스트되는 페이로드 데이터를 좀 더 세밀하게 제어하고 싶다면, 이벤트 클래스에 `broadcastWith` 메서드를 추가할 수 있습니다. 이 메서드는 브로드캐스트 페이로드로 사용할 데이터 배열을 반환해야 합니다.

```
/**
 * 브로드캐스트할 데이터 반환.
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

각 브로드캐스트 이벤트는 기본적으로 `queue.php` 설정 파일에 지정된 기본 큐 커넥션 및 기본 큐에 저장됩니다. 만약 브로드캐스터가 사용할 큐 커넥션과 큐 이름을 맞춤 지정하고 싶다면, 이벤트 클래스에 `connection` 및 `queue` 속성을 추가할 수 있습니다.

```
/**
 * 이벤트 브로드캐스팅 시 사용할 큐 커넥션 이름.
 *
 * @var string
 */
public $connection = 'redis';

/**
 * 브로드캐스트 작업이 들어갈 큐 이름.
 *
 * @var string
 */
public $queue = 'default';
```

또는, 큐 이름만 따로 지정하려면 이벤트 클래스에 `broadcastQueue` 메서드를 구현할 수도 있습니다.

```
/**
 * 브로드캐스트 작업을 넣을 큐 이름을 반환합니다.
 *
 * @return string
 */
public function broadcastQueue()
{
    return 'default';
}
```

만약 기본 큐 드라이버 대신 `sync` 큐를 이용해 이벤트를 브로드캐스트하고 싶다면, `ShouldBroadcast` 대신 `ShouldBroadcastNow` 인터페이스를 구현하면 됩니다.

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

특정 조건이 참일 때만 이벤트를 브로드캐스트하고 싶을 때가 있습니다. 이때는 `broadcastWhen` 메서드를 이벤트 클래스에 추가해 조건을 정의할 수 있습니다.

```
/**
 * 이 이벤트를 브로드캐스트할지 여부를 반환합니다.
 *
 * @return bool
 */
public function broadcastWhen()
{
    return $this->order->value > 100;
}
```

<a name="broadcasting-and-database-transactions"></a>
#### 브로드캐스팅 & 데이터베이스 트랜잭션

브로드캐스트 이벤트가 데이터베이스 트랜잭션 내에서 발생할 경우, 큐에서 그 이벤트를 실제로 처리하는 시점이 트랜잭션 커밋 전에 이루어질 수 있습니다. 이럴 때 트랜잭션 내에서 모델이나 레코드에 업데이트를 했더라도 실제 DB에는 반영되지 않은 상태일 수 있습니다. 또한 트랜잭션에서 새로 생성된 모델이나 레코드는 데이터베이스에 아직 존재하지 않을 수도 있습니다. 이벤트가 이런 모델들에 의존한다면, 브로드캐스트 작업을 처리할 때 예기치 못한 오류가 발생할 수 있습니다.

만약 사용 중인 큐 커넥션에서 `after_commit` 설정이 `false` 라면, 특정 브로드캐스트 이벤트만이라도 모든 오픈된 데이터베이스 트랜잭션 커밋 후에 디스패치되도록 이벤트 클래스에 `$afterCommit` 속성을 명시할 수 있습니다.

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

> [!NOTE]
> 이런 이슈를 안전하게 처리하는 방법에 대해 더 자세히 알고 싶다면 [큐 작업과 데이터베이스 트랜잭션](/docs/9.x/queues#jobs-and-database-transactions) 문서를 참고하세요.

<a name="authorizing-channels"></a>
## 채널 인가

비공개 채널은 현재 인증된 사용자가 실제로 이 채널을 수신(listen)할 수 있는지 인가 과정을 요구합니다. 이 과정은 라라벨 애플리케이션에 채널명을 포함하는 HTTP 요청을 보내고, 애플리케이션이 사용자의 구독 권한을 판단하는 방식으로 이루어집니다. [Laravel Echo](#client-side-installation)를 활용하면, 비공개 채널 구독에 필요한 인가 HTTP 요청이 자동으로 처리되지만, 여러분은 반드시 적절한 라우트를 정의해 이 요청을 처리해주어야 합니다.

<a name="defining-authorization-routes"></a>
### 인가 라우트 정의

라라벨에서는 채널 인가 요청을 처리할 라우트를 손쉽게 정의할 수 있도록 도와줍니다. 라라벨 애플리케이션에 포함된 `App\Providers\BroadcastServiceProvider`에서는 `Broadcast::routes` 메서드를 호출하는 코드가 있습니다. 이 메서드는 자동으로 `/broadcasting/auth` 라우트를 등록하여 인가 요청을 처리합니다.

```
Broadcast::routes();
```

`Broadcast::routes` 메서드는 자동으로 등록되는 라우트들을 `web` 미들웨어 그룹으로 묶어줍니다. 하지만 필요한 경우, 인자로 라우트 속성 배열을 전달해 할당되는 속성을 커스터마이징할 수도 있습니다.

```
Broadcast::routes($attributes);
```

<a name="customizing-the-authorization-endpoint"></a>

#### 인증 엔드포인트 커스터마이즈하기

기본적으로 Echo는 채널 접근 권한을 인증하기 위해 `/broadcasting/auth` 엔드포인트를 사용합니다. 하지만, `authEndpoint` 설정 옵션을 Echo 인스턴스에 전달하여 직접 원하는 인증 엔드포인트를 지정할 수도 있습니다.

```js
window.Echo = new Echo({
    broadcaster: 'pusher',
    // ...
    authEndpoint: '/custom/endpoint/auth'
});
```

<a name="customizing-the-authorization-request"></a>
#### 인증 요청 커스터마이즈하기

Echo를 초기화할 때 커스텀 authorizer를 제공하여, Laravel Echo가 인증 요청을 수행하는 방식을 직접 커스터마이즈할 수 있습니다.

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
### 인증 콜백 정의하기

다음에는 현재 인증된 사용자가 특정 채널을 들을 수 있는지 실제로 판단하는 로직을 정의해야 합니다. 이 작업은 애플리케이션에 기본으로 포함된 `routes/channels.php` 파일에서 진행합니다. 이 파일에서는 `Broadcast::channel` 메서드를 사용해서 채널 인증 콜백을 등록할 수 있습니다.

```
Broadcast::channel('orders.{orderId}', function ($user, $orderId) {
    return $user->id === Order::findOrNew($orderId)->user_id;
});
```

`channel` 메서드는 두 개의 인수를 받습니다: 채널명과, 사용자가 해당 채널을 들을 수 있는지 여부를 `true` 또는 `false`로 반환하는 콜백입니다.

모든 인증 콜백은 첫 번째 인수로 현재 인증된 사용자 객체를, 추가 와일드카드 인수(예: `{orderId}` 등)를 그 이후의 인수로 차례대로 전달받습니다. 이 예시에서는 `{orderId}` 플레이스홀더를 사용해 채널 이름의 "ID" 부분이 와일드카드임을 나타냅니다.

<a name="authorization-callback-model-binding"></a>
#### 인증 콜백의 모델 바인딩

HTTP 라우트와 마찬가지로, 채널 라우트에서도 암묵적 및 명시적 [라우트 모델 바인딩](/docs/9.x/routing#route-model-binding)을 사용할 수 있습니다. 예를 들어, 문자열 또는 숫자 형태의 주문 ID를 받는 대신, 실제 `Order` 모델 인스턴스를 직접 주입받도록 요청할 수 있습니다.

```
use App\Models\Order;

Broadcast::channel('orders.{order}', function ($user, Order $order) {
    return $user->id === $order->user_id;
});
```

> [!WARNING]
> HTTP 라우트 모델 바인딩과 달리, 채널 모델 바인딩은 자동 [암묵적 모델 바인딩 스코핑](/docs/9.x/routing#implicit-model-binding-scoping)을 지원하지 않습니다. 하지만 대부분의 경우, 단일 모델의 고유 기본 키를 활용하여 채널을 충분히 스코프할 수 있으므로 큰 문제가 되지 않습니다.

<a name="authorization-callback-authentication"></a>
#### 인증 콜백에서의 인증 처리

프라이빗 채널과 프레즌스 채널은 애플리케이션의 기본 인증 가드를 이용하여 현재 사용자를 인증합니다. 사용자가 인증되지 않은 경우에는 채널 인증이 자동으로 거부되며, 인증 콜백은 절대 실행되지 않습니다. 만약 요청에 대해 여러 개의 커스텀 가드가 인증 절차에 사용되길 원하면, 필요한 만큼 `guards` 옵션을 추가할 수 있습니다.

```
Broadcast::channel('channel', function () {
    // ...
}, ['guards' => ['web', 'admin']]);
```

<a name="defining-channel-classes"></a>
### 채널 클래스 정의하기

애플리케이션이 여러 채널을 다뤄야 한다면, `routes/channels.php` 파일이 금세 복잡해질 수 있습니다. 이때는 클로저 대신 채널 클래스를 만들어 인증 로직을 분리할 수 있습니다. 채널 클래스를 생성하려면 `make:channel` 아티즌 명령어를 사용하세요. 이 명령은 새로운 채널 클래스를 `App/Broadcasting` 디렉터리에 생성합니다.

```shell
php artisan make:channel OrderChannel
```

그리고 나서, `routes/channels.php` 파일에 해당 채널을 등록하세요.

```
use App\Broadcasting\OrderChannel;

Broadcast::channel('orders.{order}', OrderChannel::class);
```

마지막으로, 인증 관련 로직은 채널 클래스의 `join` 메서드 안에 구현할 수 있습니다. 이 `join` 메서드에는, 원래는 인증 클로저에 두었던 동일한 로직을 작성하면 됩니다. 또한, 채널 모델 바인딩 기능도 그대로 사용할 수 있습니다.

```
<?php

namespace App\Broadcasting;

use App\Models\Order;
use App\Models\User;

class OrderChannel
{
    /**
     * 새로운 채널 인스턴스를 생성합니다.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * 사용자의 채널 접근을 인증합니다.
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

> [!NOTE]
> 라라벨의 여러 다른 클래스와 마찬가지로, 채널 클래스도 [서비스 컨테이너](/docs/9.x/container)에 의해 자동으로 의존성 해결이 이루어집니다. 따라서 채널 클래스의 생성자에서 필요한 의존성을 타입힌트로 지정할 수 있습니다.

<a name="broadcasting-events"></a>
## 이벤트 브로드캐스팅

이벤트를 정의하고 `ShouldBroadcast` 인터페이스를 구현했다면, 이제 해당 이벤트의 dispatch 메서드를 사용해서 이벤트를 트리거하기만 하면 됩니다. 라라벨 이벤트 디스패처는 해당 이벤트가 `ShouldBroadcast` 인터페이스를 구현하고 있음을 감지하면, 브로드캐스팅을 위해 이벤트를 큐에 올립니다.

```
use App\Events\OrderShipmentStatusUpdated;

OrderShipmentStatusUpdated::dispatch($order);
```

<a name="only-to-others"></a>
### 현재 사용자 제외(Only To Others)

이벤트 브로드캐스팅을 활용하는 애플리케이션을 개발하다 보면, 특정 채널의 모든 구독자에게 이벤트를 전송하되 현재 사용자만은 예외로 두길 원할 때도 있습니다. 이럴 때는 `broadcast` 헬퍼와 `toOthers` 메서드를 함께 사용할 수 있습니다.

```
use App\Events\OrderShipmentStatusUpdated;

broadcast(new OrderShipmentStatusUpdated($update))->toOthers();
```

`toOthers` 메서드를 언제 사용해야 하는지 더 이해하기 위해, 예를 들어 작업(Task) 리스트 애플리케이션을 생각해봅니다. 사용자가 새 작업(Task)을 추가하면, 애플리케이션은 `/task` 엔드포인트로 요청을 보내고, 해당 작업의 생성 사실을 브로드캐스트 한 뒤 새 작업을 JSON으로 반환할 수 있습니다. 프론트엔드 자바스크립트는 이 응답을 받아 다음과 같이 작업 목록에 추가할 수 있습니다.

```js
axios.post('/task', task)
    .then((response) => {
        this.tasks.push(response.data);
    });
```

그런데 앞서 작업 생성 이벤트도 브로드캐스트하고 있음을 기억해야 합니다. 만약 자바스크립트 애플리케이션이 이 이벤트도 들으면서 작업을 추가하도록 되어 있다면, 결국 한 작업이 두 번 추가될 것입니다: 한 번은 엔드포인트의 응답으로, 한 번은 브로드캐스트된 이벤트로. 이런 상황에서 `toOthers` 메서드를 사용해 현재 사용자에게는 이벤트가 브로드캐스트되지 않도록 설정하면 중복 문제를 해결할 수 있습니다.

> [!WARNING]
> 이벤트가 `toOthers` 메서드를 호출하려면 반드시 `Illuminate\Broadcasting\InteractsWithSockets` 트레이트를 사용해야 합니다.

<a name="only-to-others-configuration"></a>
#### 설정 방법

Laravel Echo 인스턴스를 초기화하면 연결에 소켓 ID가 부여됩니다. 자바스크립트 애플리케이션이 전역 [Axios](https://github.com/mzabriskie/axios) 인스턴스를 사용해 HTTP 요청을 보낸다면, 이 소켓 ID가 자동으로 모든 요청의 `X-Socket-ID` 헤더에 포함됩니다. 이후 서버에서 `toOthers` 메서드를 호출하면, 라라벨은 해당 헤더에서 소켓 ID를 추출해 같은 소켓 ID를 가진 연결에는 이벤트를 브로드캐스트하지 않도록 처리합니다.

전역 Axios 인스턴스를 사용하지 않는 경우, 자바스크립트 애플리케이션이 모든 요청에 `X-Socket-ID` 헤더를 직접 추가하도록 설정해야 합니다. 소켓 ID는 `Echo.socketId` 메서드로 불러올 수 있습니다.

```js
var socketId = Echo.socketId();
```

<a name="customizing-the-connection"></a>
### 브로드캐스트 연결 커스터마이즈하기

애플리케이션에서 여러 종류의 브로드캐스트 연결을 사용하며, 기본 연결이 아닌 다른 브로드캐스터로 이벤트를 전송하고 싶을 때는 `via` 메서드로 이벤트를 보낼 연결을 지정할 수 있습니다.

```
use App\Events\OrderShipmentStatusUpdated;

broadcast(new OrderShipmentStatusUpdated($update))->via('pusher');
```

또는, 이벤트의 생성자에서 `broadcastVia` 메서드를 호출해 명시적으로 브로드캐스트 연결을 지정할 수도 있습니다. 다만, 이 전에 해당 이벤트 클래스가 `InteractsWithBroadcasting` 트레이트를 사용하는지 확인해야 합니다.

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
     * 새로운 이벤트 인스턴스를 생성합니다.
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
## 브로드캐스트 이벤트 수신하기

<a name="listening-for-events"></a>
### 이벤트 리스닝

[Laravel Echo를 설치 및 인스턴스화](#client-side-installation)했다면, 이제 Laravel 애플리케이션에서 브로드캐스트하는 이벤트를 들을 준비가 완료되었습니다. 먼저 `channel` 메서드로 채널 인스턴스를 얻은 뒤, `listen` 메서드에 이벤트명을 전달해서 리스닝할 수 있습니다.

```js
Echo.channel(`orders.${this.order.id}`)
    .listen('OrderShipmentStatusUpdated', (e) => {
        console.log(e.order.name);
    });
```

프라이빗 채널에서 이벤트를 듣고 싶으면 `private` 메서드를 사용하면 됩니다. 한 채널에 여러 이벤트를 리스닝하려면 `listen` 메서드 체인을 이어나갈 수 있습니다.

```js
Echo.private(`orders.${this.order.id}`)
    .listen(/* ... */)
    .listen(/* ... */)
    .listen(/* ... */);
```

<a name="stop-listening-for-events"></a>
#### 이벤트 리스닝 중단하기

특정 이벤트 리스닝만 중지하고 [채널에서 아예 나가지 않고](#leaving-a-channel) 싶다면, `stopListening` 메서드를 사용할 수 있습니다.

```js
Echo.private(`orders.${this.order.id}`)
    .stopListening('OrderShipmentStatusUpdated')
```

<a name="leaving-a-channel"></a>
### 채널에서 나가기

채널을 떠나려면 Echo 인스턴스에서 `leaveChannel` 메서드를 호출하세요.

```js
Echo.leaveChannel(`orders.${this.order.id}`);
```

만약 프라이빗 또는 프레즌스 채널 등 관련된 모든 채널을 한꺼번에 나가고 싶다면 `leave` 메서드를 사용할 수 있습니다.

```js
Echo.leave(`orders.${this.order.id}`);
```
<a name="namespaces"></a>
### 네임스페이스

예제 코드에서 이벤트 클래스의 전체 네임스페이스(`App\Events`)를 별도로 지정하지 않은 것을 눈치챘을 수도 있습니다. 이는 Echo가 이벤트가 `App\Events` 네임스페이스 내에 있다고 자동으로 간주하기 때문입니다. Echo를 인스턴스화할 때 `namespace` 설정 옵션을 전달하면, 루트 네임스페이스를 직접 지정할 수도 있습니다.

```js
window.Echo = new Echo({
    broadcaster: 'pusher',
    // ...
    namespace: 'App.Other.Namespace'
});
```

또는, Echo로 이벤트 구독 시 이벤트 클래스명 앞에 `.`을 붙여 완전한 클래스명을 항상 지정할 수도 있습니다.

```js
Echo.channel('orders')
    .listen('.Namespace\\Event\\Class', (e) => {
        //
    });
```

<a name="presence-channels"></a>
## 프레즌스 채널(Presence Channels)

프레즌스 채널은 프라이빗 채널의 보안은 그대로 유지하면서, 누가 채널에 구독 중인지-aware(인지)할 수 있도록 해주는 추가 기능을 제공합니다. 예를 들어, 같은 페이지를 보고 있는 사용자를 실시간 알림으로 보여주거나, 채팅방의 참가자 목록을 실시간으로 나열하는 등 협업 기능을 간편하게 구현할 수 있습니다.

<a name="authorizing-presence-channels"></a>
### 프레즌스 채널 권한 부여

모든 프레즌스 채널은 프라이빗 채널이기도 하므로, 반드시 [채널 접근 권한을 인증](#authorizing-channels)해야만 접근할 수 있습니다. 단, 프레즌스 채널의 인증 콜백을 정의할 때는, 사용자가 채널에 참여할 수 있을 경우 `true`를 반환하는 대신, 사용자에 대한 정보를 담은 배열을 반환해야 합니다.

이렇게 콜백에서 반환된 데이터는 JavaScript에서 프레즌스 채널에 구독할 때 이벤트 리스너에서 활용할 수 있습니다. 만약 사용자가 채널에 참여할 권한이 없다면 `false` 또는 `null`을 반환해야 합니다.

```
Broadcast::channel('chat.{roomId}', function ($user, $roomId) {
    if ($user->canJoinRoom($roomId)) {
        return ['id' => $user->id, 'name' => $user->name];
    }
});
```

<a name="joining-presence-channels"></a>
### 프레즌스 채널 참여하기

프레즌스 채널에 가입하려면 Echo의 `join` 메서드를 사용하면 됩니다. `join` 메서드는 `PresenceChannel` 구현체를 반환하며, 여기에 `listen` 메서드는 물론, `here`, `joining`, `leaving` 같은 이벤트를 구독할 수 있습니다.

```js
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

`here` 콜백은 채널에 성공적으로 참여하자마자 호출되며, 현재 해당 채널에 구독 중인 모든 다른 사용자 정보를 담은 배열을 전달받습니다. `joining` 메서드는 새로운 사용자가 채널에 가입할 때, `leaving` 메서드는 사용자가 채널을 떠날 때 호출됩니다. `error` 메서드는 인증 엔드포인트가 200 이외의 HTTP 상태 코드를 반환하거나, 반환된 JSON 파싱에 문제가 있을 때 호출됩니다.

<a name="broadcasting-to-presence-channels"></a>
### 프레즌스 채널로 이벤트 브로드캐스트하기

프레즌스 채널 역시 퍼블릭 또는 프라이빗 채널처럼 이벤트를 받을 수 있습니다. 예를 들어, 채팅방에서 `NewMessage` 이벤트를 해당 방의 프레즌스 채널로 브로드캐스트하고자 한다면, 이벤트의 `broadcastOn` 메서드에서 `PresenceChannel` 인스턴스를 반환하면 됩니다.

```
/**
 * 이벤트가 브로드캐스트될 채널을 반환합니다.
 *
 * @return Channel|array
 */
public function broadcastOn()
{
    return new PresenceChannel('room.'.$this->message->room_id);
}
```

다른 이벤트와 마찬가지로, `broadcast` 헬퍼와 `toOthers` 메서드를 함께 써서 현재 사용자를 제외할 수도 있습니다.

```
broadcast(new NewMessage($message));

broadcast(new NewMessage($message))->toOthers();
```

그리고 다른 유형의 이벤트와 똑같이, Echo의 `listen` 메서드로 프레즌스 채널에서 송신되는 이벤트를 리스닝할 수 있습니다.

```js
Echo.join(`chat.${roomId}`)
    .here(/* ... */)
    .joining(/* ... */)
    .leaving(/* ... */)
    .listen('NewMessage', (e) => {
        //
    });
```

<a name="model-broadcasting"></a>
## 모델 브로드캐스팅(Model Broadcasting)

> [!WARNING]
> 아래 모델 브로드캐스팅 문서를 읽기 전에, 라라벨 모델 브로드캐스팅의 기본 개념과 브로드캐스트 이벤트를 직접 생성 및 리스닝하는 방법을 먼저 숙지하시길 권장합니다.

애플리케이션에서 [Eloquent 모델](/docs/9.x/eloquent)이 생성, 수정, 삭제될 때마다 이벤트를 브로드캐스트하는 경우가 많습니다. 물론, 이를 위해 [Eloquent 모델 상태 변화를 위한 커스텀 이벤트](/docs/9.x/eloquent#events)를 수동으로 정의한 뒤 `ShouldBroadcast` 인터페이스를 구현하는 방식으로 쉽게 처리할 수 있습니다.

하지만, 애플리케이션 내에서 해당 이벤트를 브로드캐스팅 이외의 용도로 사용하지 않는다면, 단지 브로드캐스트를 위해 따로 이벤트 클래스를 만드는 일이 번거로울 수 있습니다. 이런 경우를 위해 라라벨은 Eloquent 모델이 상태 변화 시 자동으로 브로드캐스트하도록 지원합니다.

시작하려면, Eloquent 모델에 `Illuminate\Database\Eloquent\BroadcastsEvents` 트레이트를 사용하면 됩니다. 그리고, `broadcastOn` 메서드를 정의해서, 이 모델의 이벤트가 어떤 채널로 브로드캐스트될 것인지 배열 형태로 반환하면 됩니다.

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
     * 포스트가 소속된 사용자를 반환합니다.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * 모델 이벤트가 브로드캐스트될 채널을 반환합니다.
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

모델에 이 트레이트와 브로드캐스트 채널을 정의해두면, 해당 모델 인스턴스가 생성, 수정, 삭제, 휴지통 이동, 복구될 때 자동으로 이벤트가 브로드캐스트되기 시작합니다.

또한 `broadcastOn` 메서드에 전달되는 `$event` 문자열 인수를 볼 수 있습니다. 이 인수는 모델에서 발생한 이벤트 타입(`created`, `updated`, `deleted`, `trashed`, `restored`) 중 하나의 값을 가지며, 이 값을 토대로 각 이벤트별로 어떤 채널에 브로드캐스트할지 결정할 수 있습니다.

```php
/**
 * 모델 이벤트가 브로드캐스트될 채널을 반환합니다.
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
#### 모델 브로드캐스팅 이벤트 생성 커스터마이즈

간혹 라라벨이 내부적으로 모델 브로드캐스팅 이벤트를 생성하는 과정을 커스터마이즈하고 싶을 때가 있습니다. 이때는 Eloquent 모델에 `newBroadcastableEvent` 메서드를 정의하면 됩니다. 이 메서드는 반드시 `Illuminate\Database\Eloquent\BroadcastableModelEventOccurred` 인스턴스를 반환해야 합니다.

```php
use Illuminate\Database\Eloquent\BroadcastableModelEventOccurred;

/**
 * 모델에 대한 새 브로드캐스팅 이벤트를 생성합니다.
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
#### 채널명 관례

위의 예시에서 확인했듯이, 모델의 `broadcastOn` 메서드는 `Channel` 인스턴스 대신 Eloquent 모델 인스턴스를 반환할 수도 있습니다. 만약 Eloquent 모델 인스턴스를 반환하거나, 배열에 포함시켜 반환하면, 라라벨은 해당 모델의 클래스명과 기본 키(primary key)를 이용해 자동으로 프라이빗 채널 인스턴스를 생성합니다.

예를 들어, `App\Models\User` 모델의 `id`가 `1`이라면, 이 모델 인스턴스는 `App.Models.User.1`이라는 이름의 `Illuminate\Broadcasting\PrivateChannel`로 변환됩니다. 물론, 모델의 `broadcastOn` 메서드에서 Eloquent 모델 인스턴스가 아닌 직접 `Channel` 인스턴스를 반환하면, 채널 이름을 더욱 세밀하게 제어할 수도 있습니다.

```php
use Illuminate\Broadcasting\PrivateChannel;

/**
 * 모델 이벤트가 브로드캐스트될 채널을 반환합니다.
 *
 * @param  string  $event
 * @return \Illuminate\Broadcasting\Channel|array
 */
public function broadcastOn($event)
{
    return [new PrivateChannel('user.'.$this->id)];
}
```

채널 인스턴스를 명시적으로 반환할 때, 생성자에 Eloquent 모델 인스턴스를 전달할 수 있습니다. 이 경우, 라라벨은 앞서 설명한 모델 채널명 관례를 활용해 적절한 채널명 문자열로 변환합니다.

```php
return [new Channel($this->user)];
```

모델의 채널명을 직접 알아내고 싶다면, 어떤 모델 인스턴스에서든 `broadcastChannel` 메서드를 호출하면 됩니다. 예를 들어, `App\Models\User` 모델의 `id`가 `1`이라면 이 메서드는 `App.Models.User.1` 문자열을 반환합니다.

```php
$user->broadcastChannel()
```

<a name="model-broadcasting-event-conventions"></a>
#### 이벤트명 및 페이로드 관례

모델 브로드캐스트 이벤트는 애플리케이션의 `App\Events` 디렉터리에 존재하는 "실제" 이벤트와 연계되어 있지 않으므로, 이름과 페이로드가 관례에 따라 자동 할당됩니다. 라라벨의 관례는, 브로드캐스트 이벤트를 해당 모델의 클래스명(네임스페이스 제외)과, 브로드캐스트를 트리거한 이벤트명을 조합해서 송신하는 것입니다.

예를 들어, `App\Models\Post` 모델이 업데이트된다면, 이 행위는 프론트엔드 애플리케이션에 `PostUpdated`라는 이름과 아래와 같은 페이로드로 브로드캐스트됩니다.

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

`App\Models\User` 모델이 삭제될 때는 `UserDeleted`라는 이벤트명이 브로드캐스트됩니다.

원한다면, `broadcastAs`, `broadcastWith` 메서드를 모델에 추가하여 브로드캐스트되는 이름과 페이로드를 원하는 대로 정의할 수도 있습니다. 이 메서드들은 현재 발생중인 모델 이벤트명/동작명을 인수로 받아, 각각 이벤트 별로 커스터마이즈할 수 있습니다. 만약 `broadcastAs`에서 `null`을 반환하면, 라라벨이 위 관례에 따라 이벤트명을 자동 할당합니다.

```php
/**
 * 모델 이벤트의 브로드캐스트 이름을 반환합니다.
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
 * 모델 브로드캐스트 시 전송할 데이터 반환.
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
### 모델 브로드캐스팅 이벤트 리스닝

모델에 `BroadcastsEvents` 트레이트를 추가하고, `broadcastOn` 메서드를 구현했다면 이제 클라이언트 애플리케이션에서 브로드캐스트 이벤트를 들을 수 있습니다. 시작하기 전 [이벤트 리스닝에 대한 전체 문서](#listening-for-events)를 참고하는 것도 좋습니다.

먼저 `private` 메서드로 채널 인스턴스를 획득한 뒤, `listen` 메서드에 수신할 이벤트명을 전달하세요. 대개 `private` 메서드로 지정하는 채널명은 라라벨의 [모델 브로드캐스팅 관례](#model-broadcasting-conventions)를 따라야 합니다.

채널 인스턴스를 얻었으면, 그 위에 `listen` 메서드를 호출해 원하는 이벤트명을 전송받을 수 있습니다. 모델 브로드캐스트 이벤트는 앱의 `App\Events` 폴더 내에 실제 이벤트가 존재하지 않으므로, [이벤트명](#model-broadcasting-event-conventions) 앞에는 반드시 `.`(점)을 붙여 네임스페이스가 없음을 명시해야 합니다. 각 모델 브로드캐스트 이벤트는 `model` 속성에 모델의 브로드캐스트 가능한 모든 속성을 담고 있습니다.

```js
Echo.private(`App.Models.User.${this.user.id}`)
    .listen('.PostUpdated', (e) => {
        console.log(e.model);
    });
```

<a name="client-events"></a>

## 클라이언트 이벤트

> [!NOTE]
> [Pusher Channels](https://pusher.com/channels)를 사용하는 경우, [애플리케이션 대시보드](https://dashboard.pusher.com/)의 "App Settings" 섹션에서 "Client Events" 옵션을 반드시 활성화해야 클라이언트 이벤트를 전송할 수 있습니다.

애플리케이션에서 라라벨 서버를 전혀 거치지 않고, 연결된 다른 클라이언트에게 직접 이벤트를 브로드캐스트하고 싶을 때가 있습니다. 이는 특히 "입력 중" 알림처럼, 사용자가 어떤 화면의 입력창에 메시지를 작성 중임을 다른 사용자에게 바로 알려주고 싶을 때 매우 유용하게 사용할 수 있습니다.

클라이언트 이벤트를 브로드캐스트하려면, Echo의 `whisper` 메서드를 사용할 수 있습니다:

```js
Echo.private(`chat.${roomId}`)
    .whisper('typing', {
        name: this.user.name
    });
```

클라이언트 이벤트를 수신하려면, `listenForWhisper` 메서드를 사용하세요:

```js
Echo.private(`chat.${roomId}`)
    .listenForWhisper('typing', (e) => {
        console.log(e.name);
    });
```

<a name="notifications"></a>
## 알림(Notifications)

이벤트 브로드캐스팅을 [알림](/docs/9.x/notifications)과 결합하면, 자바스크립트 애플리케이션에서 새 알림이 발생할 때마다 페이지를 새로고침하지 않고도 바로 알림을 받을 수 있습니다. 시작하기 전에, [브로드캐스트 알림 채널 사용법](/docs/9.x/notifications#broadcast-notifications) 문서를 반드시 미리 읽어보시기 바랍니다.

알림에서 브로드캐스트 채널을 사용하도록 설정한 후에는, Echo의 `notification` 메서드를 이용해 브로드캐스트 이벤트를 수신할 수 있습니다. 이때 채널 이름은 알림을 받는 엔티티의 클래스 이름과 일치해야 합니다:

```js
Echo.private(`App.Models.User.${userId}`)
    .notification((notification) => {
        console.log(notification.type);
    });
```

위 예시에서, `broadcast` 채널을 통해 `App\Models\User` 인스턴스에 전송되는 모든 알림이 해당 콜백에서 수신됩니다. 라라벨 프레임워크에 기본 포함된 `BroadcastServiceProvider`에는 `App.Models.User.{id}` 채널에 대한 채널 인가 콜백도 이미 내장되어 있습니다.