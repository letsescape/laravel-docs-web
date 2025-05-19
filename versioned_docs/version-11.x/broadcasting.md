# 브로드캐스팅 (Broadcasting)

- [소개](#introduction)
- [서버 사이드 설치](#server-side-installation)
    - [설정](#configuration)
    - [Reverb](#reverb)
    - [Pusher Channels](#pusher-channels)
    - [Ably](#ably)
- [클라이언트 사이드 설치](#client-side-installation)
    - [Reverb](#client-reverb)
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
    - [인가 콜백 정의](#defining-authorization-callbacks)
    - [채널 클래스 정의](#defining-channel-classes)
- [이벤트 브로드캐스팅](#broadcasting-events)
    - [타인에게만 브로드캐스트](#only-to-others)
    - [커넥션 커스터마이징](#customizing-the-connection)
    - [익명 이벤트](#anonymous-events)
- [브로드캐스트 수신](#receiving-broadcasts)
    - [이벤트 수신 대기](#listening-for-events)
    - [채널 나가기](#leaving-a-channel)
    - [네임스페이스](#namespaces)
- [프레즌스 채널](#presence-channels)
    - [프레즌스 채널 인가하기](#authorizing-presence-channels)
    - [프레즌스 채널 조인](#joining-presence-channels)
    - [프레즌스 채널로 브로드캐스트](#broadcasting-to-presence-channels)
- [모델 브로드캐스팅](#model-broadcasting)
    - [모델 브로드캐스팅 관례](#model-broadcasting-conventions)
    - [모델 브로드캐스트 수신](#listening-for-model-broadcasts)
- [클라이언트 이벤트](#client-events)
- [알림(Notification)](#notifications)

<a name="introduction"></a>
## 소개

현대 웹 애플리케이션에서는 WebSocket을 이용해 실시간으로 사용자 인터페이스를 업데이트하는 경우가 많습니다. 서버에서 어떤 데이터가 변경되면, WebSocket 연결을 통해 메시지가 전송되어 클라이언트에서 처리할 수 있습니다. WebSocket은 데이터 변경 사항을 UI에 반영하기 위해 애플리케이션 서버를 지속적으로 폴링하는 것보다 훨씬 효율적인 대안입니다.

예를 들어, 애플리케이션에서 사용자의 데이터를 CSV 파일로 내보내어 이메일로 전송하는 기능이 있다고 가정해봅시다. 하지만 이 CSV 파일을 생성하는 데 시간이 몇 분 걸리기 때문에, [큐 작업](/docs/11.x/queues) 내에서 CSV 파일을 만들고 메일로 보내도록 처리했습니다. CSV가 생성되어 사용자에게 이메일로 전송되면, `App\Events\UserDataExported`라는 이벤트를 브로드캐스팅하여 애플리케이션의 JavaScript 코드에서 이 이벤트를 받을 수 있습니다. 이벤트가 수신되면, 사용자가 페이지를 새로 고치지 않아도 이메일이 발송되었음을 바로 알려줄 수 있습니다.

이처럼 실시간 기능을 쉽게 구현할 수 있도록, 라라벨은 서버 사이드 [이벤트](/docs/11.x/events)를 WebSocket 연결을 통해 손쉽게 "브로드캐스트"할 수 있는 기능을 제공합니다. 브로드캐스팅을 활용하면 동일한 이벤트 이름과 데이터를 서버 사이드의 라라벨 애플리케이션과 클라이언트 사이드의 JavaScript 애플리케이션 모두에서 공유할 수 있습니다.

브로드캐스팅의 핵심 개념은 단순합니다. 프론트엔드에서는 클라이언트가 지정된 이름의 채널에 접속하며, 라라벨 애플리케이션에서는 이러한 채널로 이벤트를 브로드캐스트합니다. 이 이벤트에는 프론트엔드에 전달하고자 하는 원하는 데이터를 자유롭게 포함할 수 있습니다.

<a name="supported-drivers"></a>
#### 지원되는 드라이버

라라벨은 기본적으로 세 가지 서버 사이드 브로드캐스팅 드라이버를 제공합니다: [Laravel Reverb](https://reverb.laravel.com), [Pusher Channels](https://pusher.com/channels), 그리고 [Ably](https://ably.com)가 그것입니다.

> [!NOTE]  
> 이벤트 브로드캐스팅을 시작하기 전에, 반드시 라라벨의 [이벤트와 리스너](/docs/11.x/events)에 관한 문서를 먼저 읽어보시기 바랍니다.

<a name="server-side-installation"></a>
## 서버 사이드 설치

라라벨의 이벤트 브로드캐스팅을 사용하려면, 라라벨 애플리케이션 내에서 몇 가지 설정을 해주고 필요한 패키지를 설치해야 합니다.

이벤트 브로드캐스팅은 서버 사이드 브로드캐스트 드라이버를 통해 구현됩니다. 이 드라이버가 라라벨의 이벤트를 브라우저 클라이언트에서 사용할 수 있도록 전달해주고, 클라이언트에서는 Laravel Echo(JavaScript 라이브러리)를 통해 이를 수신하게 됩니다. 걱정하지 마세요. 설치 과정은 차근차근 안내해드리겠습니다.

<a name="configuration"></a>
### 설정

애플리케이션에서 사용하는 브로드캐스팅 관련 모든 설정은 `config/broadcasting.php` 파일에 저장됩니다. 만약 이 디렉터리가 애플리케이션에 없다면, `install:broadcasting` Artisan 명령어를 실행하면 자동으로 생성됩니다.

라라벨은 기본적으로 여러 브로드캐스트 드라이버를 지원합니다: [Laravel Reverb](/docs/11.x/reverb), [Pusher Channels](https://pusher.com/channels), [Ably](https://ably.com), 그리고 로컬 개발/디버깅 용도의 `log` 드라이버가 제공됩니다. 추가로, 브로드캐스팅을 비활성화할 수 있는 `null` 드라이버도 포함되어 있습니다. 각 드라이버별 설정 예시는 `config/broadcasting.php` 파일 안에 미리 들어 있습니다.

<a name="installation"></a>
#### 설치

기본적으로, 새로 생성된 라라벨 애플리케이션에서는 브로드캐스팅이 활성화되어 있지 않습니다. `install:broadcasting` Artisan 명령어를 실행하여 브로드캐스팅을 활성화할 수 있습니다.

```shell
php artisan install:broadcasting
```

`install:broadcasting` 명령어를 실행하면, `config/broadcasting.php` 설정 파일이 생성됩니다. 또한 `routes/channels.php` 파일도 함께 생성되며, 여기에서 애플리케이션의 브로드캐스트 인가 라우트와 콜백을 등록할 수 있습니다.

<a name="queue-configuration"></a>
#### 큐 설정

이벤트를 브로드캐스트하기 전에, 반드시 [큐 워커](/docs/11.x/queues)를 먼저 설정하고 실행해야 합니다. 모든 이벤트 브로드캐스팅 작업이 큐 작업으로 처리되기 때문에, 이벤트 브로드캐스트가 애플리케이션의 응답 속도에 영향을 주지 않습니다.

<a name="reverb"></a>
### Reverb

`install:broadcasting` 명령어를 실행하면, [Laravel Reverb](/docs/11.x/reverb) 설치 여부를 묻게 됩니다. 물론, Composer 패키지 매니저를 통해 Reverb를 직접 설치할 수도 있습니다.

```sh
composer require laravel/reverb
```

패키지 설치가 완료되면, Reverb의 설치 명령어를 실행하여 설정 파일을 게시하고, 반드시 필요한 환경 변수들을 추가하며, 애플리케이션에서 이벤트 브로드캐스팅을 활성화할 수 있습니다.

```sh
php artisan reverb:install
```

자세한 설치 및 사용 방법은 [Reverb 공식 문서](/docs/11.x/reverb)에서 확인할 수 있습니다.

<a name="pusher-channels"></a>
### Pusher Channels

[Pusher Channels](https://pusher.com/channels)를 이용하여 이벤트를 브로드캐스팅하려면, Composer 패키지 매니저를 통해 Pusher Channels PHP SDK를 설치해야 합니다.

```shell
composer require pusher/pusher-php-server
```

그 다음, `config/broadcasting.php` 파일에서 Pusher Channels 인증 정보를 설정합니다. 이미 예시 설정이 포함되어 있으므로, 여기에 본인의 key, secret, application ID만 직접 입력하면 됩니다. 보통은 이 정보들을 애플리케이션의 `.env` 파일에서 설정합니다.

```ini
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_APP_KEY="your-pusher-key"
PUSHER_APP_SECRET="your-pusher-secret"
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME="https"
PUSHER_APP_CLUSTER="mt1"
```

`config/broadcasting.php` 파일의 `pusher` 설정에서는 클러스터(cluster) 등 Channels에서 지원하는 다양한 추가 옵션을 지정할 수도 있습니다.

그 다음, 애플리케이션의 `.env` 파일에서 `BROADCAST_CONNECTION` 환경 변수를 `pusher`로 설정합니다.

```ini
BROADCAST_CONNECTION=pusher
```

마지막으로, 클라이언트에서 브로드캐스트 이벤트를 수신할 수 있도록 [Laravel Echo](#client-side-installation)를 설치하고 설정해야 합니다.

<a name="ably"></a>
### Ably

> [!NOTE]  
> 아래 설명은 Ably를 "Pusher 호환 모드"로 사용하는 방법입니다. 하지만 Ably 팀에서는 Ably만의 고유한 기능을 활용할 수 있도록 별도의 broadcaster와 Echo 클라이언트를 유지·권장하고 있습니다. Ably에서 공식적으로 제공하는 드라이버를 사용하려면 [Ably의 Laravel broadcaster 문서](https://github.com/ably/laravel-broadcaster)를 참고하세요.

[Ably](https://ably.com)를 통해 이벤트를 브로드캐스트하려면, Composer 패키지 매니저를 통해 Ably PHP SDK를 설치해야 합니다.

```shell
composer require ably/ably-php
```

그리고 나서 `config/broadcasting.php` 파일에 Ably 인증 정보를 설정합니다. 이 파일에는 이미 예시 설정이 포함되어 있으므로, key만 지정하면 됩니다. 일반적으로 `ABLY_KEY` [환경 변수](/docs/11.x/configuration#environment-configuration)를 통해 값을 설정합니다.

```ini
ABLY_KEY=your-ably-key
```

그 다음, 애플리케이션의 `.env` 파일에서 `BROADCAST_CONNECTION` 환경 변수를 `ably`로 설정합니다.

```ini
BROADCAST_CONNECTION=ably
```

준비가 완료되면, 클라이언트 사이드에서 브로드캐스트 이벤트를 받을 [Laravel Echo](#client-side-installation)를 설치하고 구성할 수 있습니다.

<a name="client-side-installation"></a>
## 클라이언트 사이드 설치

<a name="client-reverb"></a>
### Reverb

[Laravel Echo](https://github.com/laravel/echo)는 서버 사이드에서 브로드캐스트된 이벤트를 채널에 손쉽게 구독하고 들을 수 있도록 도와주는 JavaScript 라이브러리입니다. Echo는 NPM 패키지 매니저로 설치할 수 있습니다. 이 예제에서는 Reverb가 WebSocket 구독, 채널, 메시지 전송 시 Pusher 프로토콜을 사용하므로, `pusher-js` 패키지도 함께 설치합니다.

```shell
npm install --save-dev laravel-echo pusher-js
```

Echo 설치가 끝나면, 애플리케이션 JavaScript에서 새 Echo 인스턴스를 생성할 준비가 된 것입니다. 좋은 장소는 라라벨 프레임워크에 기본 포함되어 있는 `resources/js/bootstrap.js` 파일의 하단 부분입니다. 기본적으로 이 파일에는 Echo 설정 예제가 이미 포함되어 있으니, 주석을 해제하고 `broadcaster` 설정 옵션을 `reverb`로만 바꾸면 됩니다.

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

그 다음, 애플리케이션 에셋을 빌드해야 합니다.

```shell
npm run build
```

> [!WARNING]  
> Laravel Echo의 `reverb` 브로드캐스터는 laravel-echo v1.16.0 이상에서 지원됩니다.

<a name="client-pusher-channels"></a>
### Pusher Channels

[Laravel Echo](https://github.com/laravel/echo)는 서버 사이드에서 브로드캐스트된 이벤트를 채널에 손쉽게 구독하고 들을 수 있도록 도와주는 JavaScript 라이브러리입니다. Echo는 `pusher-js` NPM 패키지를 활용해 WebSocket 구독, 채널, 메시지 등을 처리합니다.

`install:broadcasting` Artisan 명령어를 실행하면 `laravel-echo` 및 `pusher-js` 패키지가 자동으로 설치되지만, 직접 NPM을 이용해 수동으로 설치할 수도 있습니다.

```shell
npm install --save-dev laravel-echo pusher-js
```

Echo 설치 후에는, 애플리케이션 JavaScript에서 Echo 인스턴스를 새로 생성합니다. `install:broadcasting` 명령어가 실행되면 예제 설정 파일(`resources/js/echo.js`)도 자동으로 만들어지는데, 이 기본 설정은 Laravel Reverb 용입니다. 아래와 같이 설정을 복사해서 Pusher용으로 바꿔 사용할 수 있습니다.

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

그 다음, 애플리케이션의 `.env` 파일에 Pusher 환경변수를 반드시 알맞게 설정해야 합니다. 만약 아래 값들이 없다면 추가합니다.

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

Echo 설정을 애플리케이션에 맞게 조정했다면, 이제 애플리케이션 에셋을 빌드할 수 있습니다.

```shell
npm run build
```

> [!NOTE]  
> 애플리케이션의 JavaScript 에셋 빌드에 관한 자세한 설명은 [Vite](/docs/11.x/vite) 문서를 참고하세요.

<a name="using-an-existing-client-instance"></a>
#### 기존 클라이언트 인스턴스 사용하기

이미 미리 구성된 Pusher Channels 클라이언트 인스턴스가 있다면, Echo에 `client` 설정 옵션을 통해 넘겨 사용할 수도 있습니다.

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
> 아래 설명은 Ably를 "Pusher 호환 모드"로 사용하는 방법입니다. 하지만 Ably 팀에서는 Ably만의 고유 기능을 활용할 수 있는 broadcaster와 Echo 클라이언트를 공식적으로 권장/관리하고 있습니다. 상세 내용은 [Ably의 Laravel broadcaster 문서](https://github.com/ably/laravel-broadcaster)를 참고하세요.

[Laravel Echo](https://github.com/laravel/echo)는 서버 사이드 브로드캐스팅 드라이버가 브로드캐스트한 이벤트를 채널에서 쉽게 구독하고 들을 수 있도록 해주는 JavaScript 라이브러리입니다. Echo는 `pusher-js` NPM 패키지를 이용해 Pusher 프로토콜 기반의 WebSocket 구독, 채널, 메시징도 구현합니다.

`install:broadcasting` Artisan 명령어를 실행하면 `laravel-echo`와 `pusher-js` 패키지가 자동 설치됩니다. 물론 아래와 같이 NPM을 사용해 직접 설치할 수도 있습니다.

```shell
npm install --save-dev laravel-echo pusher-js
```

**설치 전, 반드시 Ably 대시보드에서 해당 애플리케이션의 Pusher 프로토콜 지원을 활성화해야 합니다. 해당 설정은 "Protocol Adapter Settings" 메뉴에서 할 수 있습니다.**

Echo 설치 후에는 애플리케이션 JavaScript에서 Echo 인스턴스를 생성합니다. `install:broadcasting` 명령어를 실행하면 `resources/js/echo.js` 파일에 기본 Echo 설정이 들어가 있지만, 이 설정은 Laravel Reverb 기준이므로, Ably 방식으로 아래처럼 복사해 적용할 수 있습니다.

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

위 Ably Echo 설정에서는 `VITE_ABLY_PUBLIC_KEY` 환경변수를 참조하는 것을 볼 수 있습니다. 이 값은 Ably public key에 해당하며, 전체 Ably key에서 `:` 문자 앞부분이 public key입니다.

설정을 마치고 나면, 아래 명령어로 애플리케이션 에셋을 빌드할 수 있습니다.

```shell
npm run dev
```

> [!NOTE]  
> JavaScript 에셋 빌드 및 관리에 관한 자세한 내용은 [Vite](/docs/11.x/vite) 문서를 참고하세요.

<a name="concept-overview"></a>
## 개념 개요

라라벨의 이벤트 브로드캐스팅 기능을 이용하면, 서버 사이드에서 발생한 라라벨 이벤트를 WebSocket 기반의 드라이버를 통해 클라이언트 사이드 JavaScript 애플리케이션으로 전송할 수 있습니다. 라라벨은 현재 [Pusher Channels](https://pusher.com/channels)와 [Ably](https://ably.com) 드라이버를 기본 지원합니다. 클라이언트에서는 [Laravel Echo](#client-side-installation) JavaScript 패키지를 활용해 쉽게 이벤트를 수신할 수 있습니다.

이벤트들은 "채널"을 통해 브로드캐스트됩니다. 채널은 public 또는 private로 구분할 수 있습니다. 공개 채널(public channel)은 애플리케이션의 방문자 누구나 인증이나 인가 절차 없이 구독할 수 있지만, private 채널을 구독하려면 해당 사용자에 대해 인증 및 인가(Authorization)가 필요합니다.

<a name="using-example-application"></a>
### 예제 애플리케이션 활용

각 브로드캐스팅 구성 요소를 자세히 살펴보기 전에, 이커머스 스토어(온라인 샵) 예시로 전체 흐름을 먼저 개략적으로 살펴보겠습니다.

예를 들어, 사용자가 자신의 주문 배송 상태를 확인할 수 있는 페이지가 있다고 가정합시다. 이제 애플리케이션에서 배송 상태가 업데이트될 때마다 `OrderShipmentStatusUpdated` 이벤트를 발생시킨다고 설정합니다.

```
use App\Events\OrderShipmentStatusUpdated;

OrderShipmentStatusUpdated::dispatch($order);
```

<a name="the-shouldbroadcast-interface"></a>
#### `ShouldBroadcast` 인터페이스

사용자가 주문 상세 페이지에서 자신의 주문을 보고 있을 때, 상태가 갱신되어도 페이지를 새로 고칠 필요 없이 갱신 정보를 바로 받아보게 하고 싶습니다. 이를 위해 `OrderShipmentStatusUpdated` 이벤트에 `ShouldBroadcast` 인터페이스를 구현합니다. 이렇게 하면 이벤트가 발생할 때 라라벨이 자동으로 브로드캐스트하게 됩니다.

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

`ShouldBroadcast` 인터페이스를 구현하면, 반드시 이벤트 내부에 `broadcastOn` 메서드를 정의해야 합니다. 이 메서드는 이벤트가 브로드캐스트될 채널을 반환하는 역할을 합니다. 새로 생성되는 이벤트 클래스에는 이 메서드의 빈 스텁이 이미 포함되어 있으므로, 직접 내용을 채우기만 하면 됩니다. 이번 예시에서는 해당 주문을 생성한 사용자만 갱신 정보를 볼 수 있도록, 주문별 private 채널로 브로드캐스트하겠습니다.

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

만약 하나의 이벤트를 여러 채널로 브로드캐스트하고 싶다면, `array`를 반환하면 됩니다.

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
#### 채널 인가(Authorization)

private 채널을 구독하려면 반드시 인가되어야 한다는 점을 기억하세요. 채널 인가 규칙은 애플리케이션의 `routes/channels.php` 파일에서 정의할 수 있습니다. 예를 들어, private `orders.1` 채널을 구독하는 사용자가 실제로 해당 주문의 소유자인지를 확인하는 코드는 다음과 같습니다.

```
use App\Models\Order;
use App\Models\User;

Broadcast::channel('orders.{orderId}', function (User $user, int $orderId) {
    return $user->id === Order::findOrNew($orderId)->user_id;
});
```

`channel` 메서드는 두 개의 인자를 받습니다: 첫 번째는 채널 명, 두 번째는 해당 채널을 구독 시 인가할지를 반환하는 콜백입니다(`true`면 인가, `false`면 거부).

모든 인가 콜백은 첫 번째 인수로 현재 인증된 사용자 객체를 받고, 그 뒤에 채널 이름에 와일드카드로 설정한 값(여기서는 `{orderId}`)을 순서대로 전달받습니다.

<a name="listening-for-event-broadcasts"></a>
#### 이벤트 브로드캐스트 수신

이제 남은 것은 JavaScript 애플리케이션에서 이벤트를 수신하는 일입니다. [Laravel Echo](#client-side-installation)를 사용하면 쉽게 처리할 수 있습니다. 먼저 `private` 메서드로 private 채널에 구독(subscribe)하고, `listen` 메서드를 통해 `OrderShipmentStatusUpdated` 이벤트를 수신합니다. 기본적으로 이벤트의 모든 public 속성이 브로드캐스트 데이터에 포함됩니다.

```js
Echo.private(`orders.${orderId}`)
    .listen('OrderShipmentStatusUpdated', (e) => {
        console.log(e.order);
    });
```

<a name="defining-broadcast-events"></a>
## 브로드캐스트 이벤트 정의

특정 이벤트를 브로드캐스트 대상으로 인식시키려면, 해당 이벤트 클래스에 `Illuminate\Contracts\Broadcasting\ShouldBroadcast` 인터페이스를 구현해야 합니다. 이 인터페이스는 프레임워크에서 생성하는 모든 이벤트 클래스에 이미 import되어 있으니, 어떤 이벤트에도 쉽게 추가할 수 있습니다.

`ShouldBroadcast` 인터페이스를 구현하면 반드시 `broadcastOn` 메서드를 작성해야 합니다. 이 메서드는 이벤트를 브로드캐스트할 채널 또는 채널 배열을 반환해야 합니다. 반환 값은 반드시 `Channel`, `PrivateChannel`, `PresenceChannel` 인스턴스여야 하며, `Channel` 인스턴스는 공개 채널, `PrivateChannel` 및 `PresenceChannel` 인스턴스는 [채널 인가](#authorizing-channels)가 필요한 private 채널을 의미합니다.

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

`ShouldBroadcast` 인터페이스를 구현한 뒤에는, 평소와 똑같이 [이벤트를 발생](/docs/11.x/events)시키면 됩니다. 이벤트가 발생하면, [큐 작업](/docs/11.x/queues)을 통해 지정된 브로드캐스트 드라이버로 자동 브로드캐스팅됩니다.

<a name="broadcast-name"></a>
### 브로드캐스트 이름

기본적으로, 라라벨은 이벤트의 클래스명을 브로드캐스트 이름으로 사용합니다. 하지만 이벤트 클래스에 `broadcastAs` 메서드를 추가하면 원하는 이름으로 커스터마이징할 수 있습니다.

```
/**
 * The event's broadcast name.
 */
public function broadcastAs(): string
{
    return 'server.created';
}
```

이벤트 브로드캐스트 이름을 `broadcastAs`로 커스터마이징한 경우, Echo 리스너 등록 시 반드시 앞에 `.`(점)를 붙여야 네임스페이스가 자동으로 붙지 않습니다.

```
.listen('.server.created', function (e) {
    ....
});
```

<a name="broadcast-data"></a>
### 브로드캐스트 데이터

이벤트가 브로드캐스트되면, 해당 이벤트의 모든 `public` 속성이 자동으로 직렬화되어 이벤트의 payload로 전송됩니다. 즉, 이벤트에 public `$user` 속성(예: Eloquent 모델)이 있다면, 브로드캐스트 payload는 다음과 같습니다.

```json
{
    "user": {
        "id": 1,
        "name": "Patrick Stewart"
        ...
    }
}
```

더 세밀하게 브로드캐스트 payload 데이터를 제어하고 싶다면, 이벤트 클래스에 `broadcastWith` 메서드를 추가할 수 있습니다. 이 메서드는 이벤트 payload로 브로드캐스트할 데이터를 배열로 반환해야 합니다.

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

기본적으로 모든 브로드캐스트 이벤트는 `queue.php` 설정 파일에서 지정한 기본 큐 커넥션의 기본 큐에 들어갑니다. 브로드캐스터에서 사용할 큐 커넥션과 큐 이름을 이벤트 클래스에 `connection` 및 `queue` 속성으로 직접 지정할 수도 있습니다.

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

또는, `broadcastQueue` 메서드를 정의해서 브로드캐스팅 작업에 사용할 큐 이름을 커스터마이징할 수도 있습니다.

```
/**
 * The name of the queue on which to place the broadcasting job.
 */
public function broadcastQueue(): string
{
    return 'default';
}
```

만약 해당 이벤트를 기본 큐 드라이버 대신 `sync` 큐로 즉시 브로드캐스팅하고 싶다면, `ShouldBroadcast` 인터페이스 대신 `ShouldBroadcastNow` 인터페이스를 구현하면 됩니다.

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

때로는 특정 조건이 참일 때에만 이벤트를 브로드캐스트하고 싶을 수 있습니다. 이런 경우 이벤트 클래스에 `broadcastWhen` 메서드를 추가하여 조건을 정의할 수 있습니다.

```
/**
 * 이 이벤트를 브로드캐스트할지 결정합니다.
 */
public function broadcastWhen(): bool
{
    return $this->order->value > 100;
}
```

<a name="broadcasting-and-database-transactions"></a>
#### 브로드캐스팅과 데이터베이스 트랜잭션

브로드캐스트 이벤트가 데이터베이스 트랜잭션 내에서 디스패치 되면, 큐에서 해당 이벤트를 데이터베이스 트랜잭션 커밋 이전에 처리할 수 있습니다. 이 경우 트랜잭션 내에서 모델이나 데이터베이스 레코드를 수정한 내용이 아직 데이터베이스에 반영되지 않았을 수 있습니다. 또한 트랜잭션 내에서 생성된 모델이나 레코드가 데이터베이스에 존재하지 않을 수도 있습니다. 만약 이벤트에서 이러한 모델에 의존한다면, 이벤트를 브로드캐스트하는 작업이 실행될 때 예기치 않은 오류가 발생할 수 있습니다.

만약 여러분의 큐 커넥션의 `after_commit` 설정값이 `false`로 되어 있더라도, 이벤트 클래스에 `ShouldDispatchAfterCommit` 인터페이스를 구현하면 해당 브로드캐스트 이벤트가 모든 데이터베이스 트랜잭션 커밋 이후에 디스패치되도록 지정할 수 있습니다.

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
> 이러한 문제를 우회하는 방법에 대해 더 알아보려면 [큐 작업과 데이터베이스 트랜잭션](/docs/11.x/queues#jobs-and-database-transactions)에 대한 문서를 참고하세요.

<a name="authorizing-channels"></a>
## 채널 인가(권한 부여)

프라이빗 채널을 사용할 때는 현재 인증된 사용자가 해당 채널을 실제로 구독(수신)할 수 있는지를 반드시 인가(권한 부여)해야 합니다. 이를 위해 해당 채널 이름과 함께 라라벨 애플리케이션으로 HTTP 요청을 보내고, 애플리케이션이 해당 사용자가 채널을 수신할 수 있는지 판단합니다. [Laravel Echo](#client-side-installation)를 사용할 경우, 프라이빗 채널 구독을 허가하는 HTTP 요청은 자동으로 전송됩니다.

브로드캐스팅이 활성화되면, 라라벨은 인가 요청을 처리할 수 있도록 `/broadcasting/auth` 라우트를 자동으로 등록합니다. 이 라우트는 자동으로 `web` 미들웨어 그룹에 포함됩니다.

<a name="defining-authorization-callbacks"></a>
### 인가 콜백 정의하기

다음으로, 현재 인증된 사용자가 특정 채널을 수신할 수 있는지 실제로 판단할 로직을 정의해야 합니다. 이 작업은 `install:broadcasting` Artisan 명령어로 생성된 `routes/channels.php` 파일에서 수행합니다. 이 파일에서 `Broadcast::channel` 메서드를 사용해 채널 인가 콜백을 등록할 수 있습니다.

```
use App\Models\User;

Broadcast::channel('orders.{orderId}', function (User $user, int $orderId) {
    return $user->id === Order::findOrNew($orderId)->user_id;
});
```

`channel` 메서드는 두 개의 인자를 받습니다: 채널 이름과, 사용자가 해당 채널을 수신할 수 있는지 `true` 또는 `false`를 반환하는 콜백입니다.

모든 인가 콜백은 첫 번째 인자로 현재 인증된 사용자를, 이후 추가 와일드카드(wildcard) 파라미터들을 순서대로 받습니다. 위 예시에서 `{orderId}`는 채널 이름의 "ID" 부분이 와일드카드(변경 가능한 값)임을 나타냅니다.

애플리케이션에 등록된 브로드캐스트 인가 콜백 목록은 `channel:list` Artisan 명령어로 확인할 수 있습니다.

```shell
php artisan channel:list
```

<a name="authorization-callback-model-binding"></a>
#### 인가 콜백의 모델 바인딩

HTTP 라우트와 마찬가지로, 채널도 [라우트 모델 바인딩](/docs/11.x/routing#route-model-binding)(암묵적/명시적)을 활용할 수 있습니다. 예를 들어, 문자열이나 숫자형 주문 ID 대신 실제 `Order` 모델 인스턴스를 받을 수도 있습니다.

```
use App\Models\Order;
use App\Models\User;

Broadcast::channel('orders.{order}', function (User $user, Order $order) {
    return $user->id === $order->user_id;
});
```

> [!WARNING]  
> HTTP 라우트 모델 바인딩과 달리, 채널 모델 바인딩에는 자동 [암묵적 모델 바인딩 스코프](/docs/11.x/routing#implicit-model-binding-scoping)가 지원되지 않습니다. 하지만 대부분의 채널은 하나의 모델 고유(primary key)로 스코프를 지정하므로 일반적으로 문제가 되지 않습니다.

<a name="authorization-callback-authentication"></a>
#### 인가 콜백의 인증

프라이빗 및 프리즌스(presence) 브로드캐스트 채널은 애플리케이션의 기본 인증 가드를 통해 현재 사용자를 인증합니다. 사용자가 인증되어 있지 않으면 채널 인가는 자동으로 거부되어 콜백이 아예 실행되지 않습니다. 그러나 필요하다면 여러 사용자 정의 가드를 지정해 요청을 인증하도록 할 수도 있습니다.

```
Broadcast::channel('channel', function () {
    // ...
}, ['guards' => ['web', 'admin']]);
```

<a name="defining-channel-classes"></a>
### 채널 클래스 정의하기

애플리케이션에서 여러 채널을 사용한다면 `routes/channels.php` 파일이 점점 복잡해질 수 있습니다. 이럴 때는 클로저 대신 채널 클래스를 사용하여 인가 로직을 분리할 수 있습니다. 채널 클래스를 생성하려면 `make:channel` Artisan 명령어를 사용합니다. 이 명령어는 새로운 채널 클래스를 `App/Broadcasting` 디렉터리에 생성합니다.

```shell
php artisan make:channel OrderChannel
```

새로 생성한 채널 클래스를 `routes/channels.php` 파일에 등록합니다.

```
use App\Broadcasting\OrderChannel;

Broadcast::channel('orders.{order}', OrderChannel::class);
```

이제 채널 클래스의 `join` 메서드에 해당 채널의 인가(권한 부여) 로직을 넣으면 됩니다. 이 `join` 메서드는 기존에 채널 인가 클로저에 작성했을 법한 동일한 논리를 담을 수 있습니다. 또한 채널 모델 바인딩도 활용할 수 있습니다.

```
<?php

namespace App\Broadcasting;

use App\Models\Order;
use App\Models\User;

class OrderChannel
{
    /**
     * 새로운 채널 인스턴스를 생성합니다.
     */
    public function __construct() {}

    /**
     * 사용자의 채널 접근 권한을 인증합니다.
     */
    public function join(User $user, Order $order): array|bool
    {
        return $user->id === $order->user_id;
    }
}
```

> [!NOTE]  
> 라라벨의 다른 클래스들과 마찬가지로, 채널 클래스도 [서비스 컨테이너](/docs/11.x/container)를 통해 자동으로 resolve됩니다. 따라서 채널 생성자의 의존성도 타입 힌트로 지정해 사용할 수 있습니다.

<a name="broadcasting-events"></a>
## 이벤트 브로드캐스팅

이벤트를 정의하고 `ShouldBroadcast` 인터페이스를 구현한 후에는 해당 이벤트의 디스패치 메서드를 사용해 이벤트를 발생시키기만 하면 됩니다. 이벤트 디스패처는 해당 이벤트가 `ShouldBroadcast` 인터페이스를 구현하고 있는지 확인한 뒤, 이벤트를 브로드캐스트 큐에 등록합니다.

```
use App\Events\OrderShipmentStatusUpdated;

OrderShipmentStatusUpdated::dispatch($order);
```

<a name="only-to-others"></a>
### 다른 구독자만에게 브로드캐스트

이벤트 브로드캐스팅을 사용하는 애플리케이션을 구축할 때, 가끔 특정 채널의 모든 구독자(수신자) 중 현재 사용자만 제외하고 이벤트를 브로드캐스트해야 할 때가 있습니다. 이럴 땐 `broadcast` 헬퍼와 `toOthers` 메서드를 사용할 수 있습니다.

```
use App\Events\OrderShipmentStatusUpdated;

broadcast(new OrderShipmentStatusUpdated($update))->toOthers();
```

`toOthers` 메서드의 실제 사용 예시를 좀 더 이해하기 위해, 사용자가 새 작업(Task)의 이름을 입력해 추가하는 태스크 리스트 애플리케이션을 가정해 보겠습니다. 새 작업을 만들기 위해 `/task` URL에 요청을 보내는데, 이 과정에서 작업 생성과 함께 작업을 브로드캐스팅하고 새 작업 정보를 JSON으로 반환한다고 가정합니다. 자바스크립트 애플리케이션이 이 응답을 받으면, 바로 태스크 리스트에 새 작업을 추가하겠죠:

```js
axios.post('/task', task)
    .then((response) => {
        this.tasks.push(response.data);
    });
```

하지만 위 과정에서 작업(create) 이벤트가 브로드캐스트되기도 합니다. 만약 자바스크립트 애플리케이션이 해당 이벤트도 리스닝해서 태스크 리스트에 작업을 추가하고 있다면, 한 번은 API 응답으로, 한 번은 브로드캐스트로 중복된 작업이 추가될 수 있습니다. 이런 경우 `toOthers` 메서드를 사용해 브로드캐스터에게 현재 사용자에게는 브로드캐스트하지 말라고 지시할 수 있습니다.

> [!WARNING]  
> 이벤트에서 `toOthers` 메서드를 사용하려면 반드시 `Illuminate\Broadcasting\InteractsWithSockets` 트레이트를 포함해야 합니다.

<a name="only-to-others-configuration"></a>
#### 구성 방법

Laravel Echo 인스턴스가 초기화되면, 커넥션(연결)마다 소켓 ID가 할당됩니다. 자바스크립트 애플리케이션에서 전역 [Axios](https://github.com/axios/axios) 인스턴스를 이용해 HTTP 요청을 보낼 경우, 소켓 ID가 자동으로 모든 요청의 `X-Socket-ID` 헤더에 추가됩니다. 이후 `toOthers` 메서드를 호출하면, 라라벨은 이 헤더에서 소켓 ID를 추출해 같은 소켓 ID를 가진 연결에는 브로드캐스트하지 않습니다.

만약 전역 Axios 인스턴스를 사용하지 않는 경우, 자바스크립트 애플리케이션이 모든 요청에 `X-Socket-ID` 헤더를 수동으로 추가하도록 구성해야 합니다. 소켓 ID는 `Echo.socketId` 메서드로 가져올 수 있습니다.

```js
var socketId = Echo.socketId();
```

<a name="customizing-the-connection"></a>
### 연결 커스터마이즈(브로드캐스트 커넥션 지정)

여러 브로드캐스트 커넥션을 사용하는 애플리케이션에서, 기본값이 아닌 특정 브로드캐스터를 통해 이벤트를 브로드캐스트하고 싶다면 `via` 메서드로 보낼 커넥션을 지정할 수 있습니다.

```
use App\Events\OrderShipmentStatusUpdated;

broadcast(new OrderShipmentStatusUpdated($update))->via('pusher');
```

또는 이벤트 생성자 내에서 `broadcastVia` 메서드를 호출해 이벤트의 브로드캐스트 커넥션을 지정할 수도 있습니다. 단, 이 방법을 사용하려면 이벤트 클래스에서 `InteractsWithBroadcasting` 트레이트를 반드시 사용해야 합니다.

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
     */
    public function __construct()
    {
        $this->broadcastVia('pusher');
    }
}
```

<a name="anonymous-events"></a>
### 익명(Anonymous) 이벤트

가끔 별도의 이벤트 클래스를 만들지 않고 간단히 프론트엔드에 이벤트를 브로드캐스트하고 싶을 때가 있습니다. 이를 위해 `Broadcast` 파사드에서는 "익명(anonymous) 이벤트" 브로드캐스팅을 지원합니다.

```php
Broadcast::on('orders.'.$order->id)->send();
```

위 예시는 다음과 같은 이벤트를 브로드캐스트합니다.

```json
{
    "event": "AnonymousEvent",
    "data": "[]",
    "channel": "orders.1"
}
```

`as`와 `with` 메서드를 활용하면, 이벤트 이름과 데이터도 커스터마이즈할 수 있습니다.

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

익명 이벤트를 프라이빗 또는 프리즌스(presence) 채널에 브로드캐스트 하려면 `private`과 `presence` 메서드를 사용할 수 있습니다.

```php
Broadcast::private('orders.'.$order->id)->send();
Broadcast::presence('channels.'.$channel->id)->send();
```

`send` 메서드는 해당 이벤트를 [큐](/docs/11.x/queues)에 디스패치해서 처리합니다. 만일 이벤트를 즉시 브로드캐스트하려면 `sendNow` 메서드를 사용할 수 있습니다.

```php
Broadcast::on('orders.'.$order->id)->sendNow();
```

현재 인증된 사용자를 제외한 모든 채널 구독자에게만 이벤트를 브로드캐스트하려면 `toOthers` 메서드를 사용할 수 있습니다.

```php
Broadcast::on('orders.'.$order->id)
    ->toOthers()
    ->send();
```

<a name="receiving-broadcasts"></a>
## 브로드캐스트 수신하기

<a name="listening-for-events"></a>
### 이벤트 리스닝

[Laravel Echo를 설치 및 인스턴스화](#client-side-installation)했다면, 이제 라라벨 서버에서 브로드캐스트된 이벤트를 수신할 준비가 되었습니다. 먼저 `channel` 메서드로 채널 인스턴스를 얻은 뒤, `listen` 메서드를 호출해 특정 이벤트를 수신할 수 있습니다.

```js
Echo.channel(`orders.${this.order.id}`)
    .listen('OrderShipmentStatusUpdated', (e) => {
        console.log(e.order.name);
    });
```

프라이빗 채널의 이벤트를 수신하려면 대신 `private` 메서드를 사용합니다. 한 채널에서 여러 이벤트를 수신하려면 `listen` 메서드를 계속 체이닝해서 사용할 수도 있습니다.

```js
Echo.private(`orders.${this.order.id}`)
    .listen(/* ... */)
    .listen(/* ... */)
    .listen(/* ... */);
```

<a name="stop-listening-for-events"></a>
#### 이벤트 리스닝 중단하기

특정 이벤트에 대한 리스닝만 중단하고 싶고, [채널에서 완전히 나가지 않고](#leaving-a-channel) 싶을 때는 `stopListening` 메서드를 사용할 수 있습니다.

```js
Echo.private(`orders.${this.order.id}`)
    .stopListening('OrderShipmentStatusUpdated')
```

<a name="leaving-a-channel"></a>
### 채널에서 나가기

채널을 떠나려면 Echo 인스턴스에서 `leaveChannel` 메서드를 호출하면 됩니다.

```js
Echo.leaveChannel(`orders.${this.order.id}`);
```

채널과 연관된 프라이빗·프리즌스 채널도 함께 떠나고 싶다면 `leave` 메서드를 사용할 수 있습니다.

```js
Echo.leave(`orders.${this.order.id}`);
```
<a name="namespaces"></a>
### 네임스페이스

위의 예시들에서는 이벤트 클래스의 전체 네임스페이스(`App\Events`)를 따로 명시하지 않았습니다. 이는 Echo가 이벤트가 `App\Events` 네임스페이스에 있다고 기본적으로 간주하기 때문입니다. 만약 Echo를 인스턴스화할 때 `namespace` 설정 옵션을 통해 루트 네임스페이스를 변경할 수도 있습니다.

```js
window.Echo = new Echo({
    broadcaster: 'pusher',
    // ...
    namespace: 'App.Other.Namespace'
});
```

또 다른 방법으로, Echo에서 이벤트 클래스를 구독할 때 `.`을 prefix로 붙이면 항상 완전한(fully-qualified) 클래스 이름을 지정할 수도 있습니다.

```js
Echo.channel('orders')
    .listen('.Namespace\\Event\\Class', (e) => {
        // ...
    });
```

<a name="presence-channels"></a>
## 프리즌스(Presence) 채널

프리즌스 채널은 프라이빗 채널의 보안 위에, 해당 채널에 누가 구독 중인지 알 수 있는 기능이 추가된 채널입니다. 이를 활용하면 같은 페이지를 보고 있는 다른 사용자를 알리거나, 채팅방 참가자 명단을 표시하는 등 협업 기능을 쉽게 구현할 수 있습니다.

<a name="authorizing-presence-channels"></a>
### 프리즌스 채널 인가하기

프리즌스 채널은 프라이빗 채널이기 때문에 [인가가 필요](#authorizing-channels)합니다. 하지만 프리즌스 채널의 인가 콜백에서는, 단순히 수신 요건을 만족할 때 `true`를 반환하는 대신, 사용자의 정보를 담은 배열을 반환해야 합니다.

인가 콜백에서 반환한 데이터는 자바스크립트 애플리케이션의 프리즌스 채널 이벤트 리스너에서 활용할 수 있습니다. 만약 사용자가 해당 프리즌스 채널을 수신할 자격이 없다면, `false` 또는 `null`을 반환해야 합니다.

```
use App\Models\User;

Broadcast::channel('chat.{roomId}', function (User $user, int $roomId) {
    if ($user->canJoinRoom($roomId)) {
        return ['id' => $user->id, 'name' => $user->name];
    }
});
```

<a name="joining-presence-channels"></a>
### 프리즌스 채널에 참가하기

프리즌스 채널에 참가하려면 Echo의 `join` 메서드를 사용합니다. `join` 메서드는 `PresenceChannel` 구현체를 반환하며, 이 구현체에서는 `listen` 메서드 뿐 아니라 `here`, `joining`, `leaving` 이벤트 구독도 가능합니다.

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

`here` 콜백은 채널 참가가 성공하면 즉시 실행되며, 채널에 현재 구독 중인 사용자 정보를 배열로 전달합니다. `joining` 메서드는 새로운 사용자가 채널에 참가할 때, `leaving` 메서드는 사용자가 채널을 떠날 때 각각 실행됩니다. `error` 메서드는 인증 엔드포인트에서 200이 아닌 HTTP 상태 코드를 반환하거나, 반환된 JSON을 파싱하는 데 문제가 생겼을 때 실행됩니다.

<a name="broadcasting-to-presence-channels"></a>
### 프리즌스 채널로 브로드캐스트하기

프리즌스 채널도 다른 공개/프라이빗 채널처럼 이벤트를 수신할 수 있습니다. 예를 들어 채팅방에서 `NewMessage` 이벤트를 프리즌스 채널에 브로드캐스트하고 싶다면, 이벤트의 `broadcastOn` 메서드에서 `PresenceChannel` 인스턴스를 반환하면 됩니다.

```
/**
 * 이 이벤트를 브로드캐스트할 채널을 가져옵니다.
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

기타 이벤트와 마찬가지로, 현재 사용자를 제외하고 브로드캐스트 하려면 `broadcast` 헬퍼와 `toOthers` 메서드를 사용할 수 있습니다.

```
broadcast(new NewMessage($message));

broadcast(new NewMessage($message))->toOthers();
```

다른 이벤트와 동일하게 Echo의 `listen` 메서드를 활용해 프리즌스 채널의 이벤트도 수신할 수 있습니다.

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
## 모델 브로드캐스팅

> [!WARNING]  
> 아래 모델 브로드캐스팅 관련 설명을 읽기 전에, 라라벨 모델 브로드캐스트 서비스의 기본 개념과 수동으로 브로드캐스트 이벤트를 생성 및 수신하는 방법을 먼저 숙지하실 것을 권장합니다.

애플리케이션의 [Eloquent 모델](/docs/11.x/eloquent)이 생성, 수정, 삭제될 때마다 이벤트를 브로드캐스트하는 것은 흔히 있는 일입니다. 물론 이런 이벤트는 직접 [Eloquent 모델 상태 변화에 대한 커스텀 이벤트](/docs/11.x/eloquent#events)를 정의하고, 해당 이벤트에 `ShouldBroadcast` 인터페이스를 구현하는 방식으로 쉽게 처리할 수 있습니다.

하지만, 이런 이벤트를 오직 브로드캐스트 용도로만 사용하는 경우, 매번 이벤트 클래스를 만드는 것이 번거로울 수 있습니다. 이를 해결하기 위해, 라라벨은 Eloquent 모델에서 상태 변화가 발생할 때마다 자동으로 이벤트를 브로드캐스트할 수 있도록 지원합니다.

먼저, 브로드캐스트를 원하는 Eloquent 모델에서 `Illuminate\Database\Eloquent\BroadcastsEvents` 트레이트를 사용합니다. 그리고 모델에서 모델 이벤트를 브로드캐스트할 채널을 반환하는 `broadcastOn` 메서드를 정의해야 합니다.

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
     * 이 글이 소속된 사용자를 반환합니다.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * 모델 이벤트가 브로드캐스트될 채널을 반환합니다.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel|\Illuminate\Database\Eloquent\Model>
     */
    public function broadcastOn(string $event): array
    {
        return [$this, $this->user];
    }
}
```

이렇게 트레이트를 포함하고 브로드캐스트 채널을 정의하면, 모델 인스턴스가 생성, 수정, 삭제, 휴지통 이동(trashed), 복구(restored)될 때마다 자동으로 이벤트가 브로드캐스트 됩니다.

또한, `broadcastOn` 메서드는 문자열 `$event` 인자를 받는 것을 볼 수 있습니다. 이 인자는 해당 모델에서 발생한 이벤트의 타입을 담고 있으며, 값은 `created`, `updated`, `deleted`, `trashed`, `restored` 가운데 하나입니다. 이 값을 점검해, 해당 이벤트 발생 시 브로드캐스트할 채널(또는 브로드캐스트할지 여부)을 세밀하게 제어할 수 있습니다.

```php
/**
 * 모델 이벤트가 브로드캐스트될 채널을 반환합니다.
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
#### 모델 브로드캐스팅 이벤트 생성 커스터마이즈

가끔 라라벨이 내부적으로 생성하는 모델 브로드캐스트 이벤트 과정 자체를 사용자 정의하고 싶을 때가 있습니다. 이때는 Eloquent 모델에 `newBroadcastableEvent` 메서드를 구현하면 됩니다. 이 메서드는 반드시 `Illuminate\Database\Eloquent\BroadcastableModelEventOccurred` 인스턴스를 반환해야 합니다.

```php
use Illuminate\Database\Eloquent\BroadcastableModelEventOccurred;

/**
 * 모델의 새로운 브로드캐스팅 이벤트를 생성합니다.
 */
protected function newBroadcastableEvent(string $event): BroadcastableModelEventOccurred
{
    return (new BroadcastableModelEventOccurred(
        $this, $event
    ))->dontBroadcastToCurrentUser();
}
```

<a name="model-broadcasting-conventions"></a>
### 모델 브로드캐스팅 관례(컨벤션)

<a name="model-broadcasting-channel-conventions"></a>
#### 채널 네이밍 컨벤션

앞서 예시에서 보셨듯, 모델의 `broadcastOn` 메서드는 반드시 `Channel` 인스턴스만 반환하지 않고 Eloquent 모델 자체를 반환할 수도 있습니다. 만약 이 메서드에서 Eloquent 모델 인스턴스를 반환하면, 라라벨은 자동으로 해당 모델의 클래스명과 기본키(primary key)를 조합해 프라이빗 채널 인스턴스를 생성합니다.

즉, `id`가 1인 `App\Models\User` 모델은 `App.Models.User.1` 이라는 이름으로 `Illuminate\Broadcasting\PrivateChannel` 인스턴스로 변환됩니다. 물론, `broadcastOn` 메서드에서 Eloquent 모델 인스턴스 외에 직접 `Channel` 인스턴스를 반환해 채널 이름을 직접 지정할 수도 있습니다.

```php
use Illuminate\Broadcasting\PrivateChannel;

/**
 * 모델 이벤트가 브로드캐스트될 채널을 반환합니다.
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

`broadcastOn` 메서드에서 채널 인스턴스를 명시적으로 반환할 때, 채널 생성자에 Eloquent 모델을 인자로 넘길 수도 있습니다. 이 경우 라라벨은 앞서 언급한 모델 채널 컨벤션을 적용해 Eloquent 모델을 채널명 문자열로 변환합니다.

```php
return [new Channel($this->user)];
```

모델의 채널 이름이 궁금하다면, 모델 인스턴스의 `broadcastChannel` 메서드를 호출하면 됩니다. 예를 들어, id가 1인 `App\Models\User` 모델의 경우, 이 메서드는 문자열 `App.Models.User.1`을 반환합니다.

```php
$user->broadcastChannel()
```

<a name="model-broadcasting-event-conventions"></a>

#### 이벤트 명명 규칙

모델 브로드캐스트 이벤트는 애플리케이션의 `App\Events` 디렉터리 내에 "실제" 이벤트로 존재하지 않기 때문에, 이벤트 이름과 페이로드(payload)가 특정 규칙에 따라 자동으로 지정됩니다. 라라벨은 브로드캐스트 시, 모델의 클래스 이름(네임스페이스는 제외)과 해당 브로드캐스트를 트리거한 모델 이벤트 이름을 조합해 이벤트명을 생성합니다.

예를 들어, `App\Models\Post` 모델이 업데이트되면, 브라우저 등 클라이언트 애플리케이션으로 `PostUpdated`라는 이름의 이벤트가 다음과 같은 페이로드와 함께 전송됩니다.

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

`App\Models\User` 모델이 삭제된 경우에는 `UserDeleted`라는 이벤트명으로 브로드캐스트됩니다.

필요하다면, 모델의 `broadcastAs` 및 `broadcastWith` 메서드를 추가하여 직접 커스텀 이벤트명과 페이로드를 정의할 수 있습니다. 이 메서드들은 현재 발생한 모델 이벤트 또는 동작의 이름을 인수로 전달받기 때문에, 각 모델 동작마다 서로 다른 이벤트명과 페이로드를 지정할 수 있습니다. 만약 `broadcastAs`에서 `null`을 반환한다면, 라라벨은 위에서 설명한 모델 이벤트 네이밍 규칙을 그대로 사용합니다.

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
 * 모델의 브로드캐스트 페이로드를 반환합니다.
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

모델에 `BroadcastsEvents` 트레잇을 추가하고 `broadcastOn` 메서드를 정의했다면, 클라이언트 애플리케이션에서 브로드캐스트된 모델 이벤트를 수신할 준비가 된 것입니다. 시작하기 전에, [이벤트 수신](#listening-for-events)에 대한 전체 문서를 함께 참고하면 좋습니다.

먼저, `private` 메서드를 사용해 특정 채널 인스턴스를 가져온 뒤, `listen` 메서드로 원하는 이벤트를 수신할 수 있습니다. 일반적으로, `private` 메서드에 전달하는 채널명은 라라벨의 [모델 브로드캐스트 명명 규칙](#model-broadcasting-conventions)을 따라야 합니다.

채널 인스턴스를 얻었다면, `listen` 메서드로 특정 이벤트를 구독(listen)할 수 있습니다. 모델 브로드캐스트 이벤트는 애플리케이션의 `App\Events` 디렉터리에 "실제" 이벤트로 존재하지 않으므로, [이벤트명](#model-broadcasting-event-conventions) 앞에 `.`(닷)을 붙여서 해당 네임스페이스에 속하지 않음을 표시해야 합니다. 각 모델 브로드캐스트 이벤트에는 모델의 모든 브로드캐스트 속성을 담고 있는 `model` 프로퍼티가 포함되어 있습니다.

```js
Echo.private(`App.Models.User.${this.user.id}`)
    .listen('.PostUpdated', (e) => {
        console.log(e.model);
    });
```

<a name="client-events"></a>
## 클라이언트 이벤트

> [!NOTE]  
> [Pusher Channels](https://pusher.com/channels)를 사용할 경우, [애플리케이션 대시보드](https://dashboard.pusher.com/)에서 "App Settings" 섹션의 "Client Events" 옵션을 반드시 활성화해야 클라이언트 이벤트를 전송할 수 있습니다.

때때로, 라라벨 애플리케이션까지 서버 요청을 보내지 않고 다른 연결된 클라이언트에게 직접 이벤트를 브로드캐스트하고 싶을 때가 있습니다. 대표적으로 "메시지 입력 중" 알림처럼, 한 사용자가 메시지를 입력하고 있다는 것을 실시간으로 다른 사용자에게 알릴 때 매우 유용합니다.

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
## 알림 (Notifications)

이벤트 브로드캐스팅을 [알림](/docs/11.x/notifications) 기능과 조합하면, JavaScript 애플리케이션 사용자가 페이지를 새로고침하지 않아도 새로운 알림을 실시간으로 수신할 수 있습니다. 먼저, [브로드캐스트 알림 채널](/docs/11.x/notifications#broadcast-notifications) 사용법에 대해 충분히 확인하시기 바랍니다.

알림에서 브로드캐스트 채널을 사용하도록 설정했다면, Echo의 `notification` 메서드를 통해 해당 알림 브로드캐스트 이벤트를 수신할 수 있습니다. 이때, 채널명은 알림을 받는 엔티티의 클래스명과 일치해야 합니다.

```js
Echo.private(`App.Models.User.${userId}`)
    .notification((notification) => {
        console.log(notification.type);
    });
```

이 예시에서는, `broadcast` 채널을 통해 `App\Models\User` 인스턴스로 전송된 모든 알림이 콜백에서 수신됩니다. `App.Models.User.{id}` 채널에 대한 인증 콜백은 애플리케이션의 `routes/channels.php` 파일에 이미 포함되어 있습니다.