# 브로드캐스팅 (Broadcasting)

- [소개](#introduction)
- [빠른 시작](#quickstart)
- [서버 사이드 설치](#server-side-installation)
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
- [채널 인가](#authorizing-channels)
    - [인가 콜백 정의](#defining-authorization-callbacks)
    - [채널 클래스 정의](#defining-channel-classes)
- [이벤트 브로드캐스팅](#broadcasting-events)
    - [다른 사용자에게만](#only-to-others)
    - [커넥션 커스터마이징](#customizing-the-connection)
    - [익명 이벤트](#anonymous-events)
- [브로드캐스트 수신](#receiving-broadcasts)
    - [이벤트 청취](#listening-for-events)
    - [채널 나가기](#leaving-a-channel)
    - [네임스페이스](#namespaces)
    - [React 또는 Vue에서 사용하기](#using-react-or-vue)
- [프레즌스 채널](#presence-channels)
    - [프레즌스 채널 인가](#authorizing-presence-channels)
    - [프레즌스 채널 가입](#joining-presence-channels)
    - [프레즌스 채널로 브로드캐스팅](#broadcasting-to-presence-channels)
- [모델 브로드캐스팅](#model-broadcasting)
    - [모델 브로드캐스팅 규칙](#model-broadcasting-conventions)
    - [모델 브로드캐스트 청취](#listening-for-model-broadcasts)
- [클라이언트 이벤트](#client-events)
- [알림](#notifications)

<a name="introduction"></a>
## 소개

많은 현대 웹 애플리케이션에서는 WebSocket을 이용해 실시간으로 사용자 인터페이스를 업데이트하는 기능을 구현합니다. 서버에서 데이터가 변경되면, 이는 일반적으로 WebSocket 연결을 통해 메시지로 클라이언트에 전달되어 처리됩니다. WebSocket은 애플리케이션에서 UI에 반영될 데이터 변경 사항을 계속해서 서버에 폴링하는 것보다 훨씬 효율적인 대안입니다.

예를 들어, 여러분의 애플리케이션이 사용자의 데이터를 CSV 파일로 내보내고 이메일로 전송하는 기능이 있다고 가정해 보겠습니다. 그러나 이 CSV 파일을 만드는 데 몇 분이 걸린다면, [큐에 등록된 작업](/docs/12.x/queues)으로 생성과 메일 전송을 처리할 수 있습니다. CSV가 생성되어 사용자에게 보내지면, `App\Events\UserDataExported` 이벤트를 브로드캐스트하여 애플리케이션의 JavaScript에서 수신하도록 할 수 있습니다. 이 이벤트가 도착하면 사용자는 페이지를 새로 고침하지 않아도 CSV가 이메일로 전송되었다는 안내 메시지를 받을 수 있습니다.

이런 실시간 기능 개발을 돕기 위해, 라라벨은 서버 사이드의 [이벤트](/docs/12.x/events)를 WebSocket 연결을 통해 브로드캐스트하는 것을 쉽게 만들어 줍니다. 이벤트 브로드캐스팅을 사용하면 서버사이드 라라벨 애플리케이션과 클라이언트사이드 JavaScript 애플리케이션이 동일한 이벤트 이름과 데이터를 공유할 수 있게 됩니다.

브로드캐스팅의 핵심 개념은 아주 단순합니다. 클라이언트는 프론트엔드에서 특정 이름의 채널에 연결하고, 라라벨 애플리케이션은 백엔드에서 이 채널로 이벤트를 브로드캐스트합니다. 이 이벤트에는 프론트엔드에서 활용할 추가 데이터가 얼마든지 포함될 수 있습니다.

<a name="supported-drivers"></a>
#### 지원 드라이버

기본적으로 라라벨은 세 가지 서버 사이드 브로드캐스팅 드라이버를 지원합니다: [Laravel Reverb](https://reverb.laravel.com), [Pusher Channels](https://pusher.com/channels), [Ably](https://ably.com).

> [!NOTE]
> 이벤트 브로드캐스팅을 시작하기 전에, [이벤트와 리스너](/docs/12.x/events)에 대한 라라벨 공식 문서를 먼저 읽어 보시기 바랍니다.

<a name="quickstart"></a>
## 빠른 시작

기본적으로 새로운 라라벨 애플리케이션에서는 브로드캐스팅 기능이 활성화되어 있지 않습니다. `install:broadcasting` Artisan 명령어를 사용해 브로드캐스팅을 활성화할 수 있습니다.

```shell
php artisan install:broadcasting
```

`install:broadcasting` 명령어를 실행하면, 사용할 이벤트 브로드캐스팅 서비스를 선택하라는 안내가 표시됩니다. 또한, `config/broadcasting.php` 설정 파일과 `routes/channels.php` 파일이 생성되어, 애플리케이션의 브로드캐스트 인가(authorization) 경로와 콜백을 등록할 수 있게 됩니다.

라라벨은 기본적으로 여러 가지 브로드캐스트 드라이버를 지원합니다: [Laravel Reverb](/docs/12.x/reverb), [Pusher Channels](https://pusher.com/channels), [Ably](https://ably.com), 그리고 로컬 개발 및 디버깅용 `log` 드라이버가 제공됩니다. 추가로, 테스트 시 브로드캐스팅을 비활성화할 수 있는 `null` 드라이버도 포함되어 있습니다. 각 드라이버의 설정 예시는 `config/broadcasting.php` 파일 내에 포함되어 있습니다.

애플리케이션에서 사용하는 모든 브로드캐스트 관련 설정은 `config/broadcasting.php` 파일에 저장됩니다. 만약 이 파일이 없다면, `install:broadcasting` Artisan 명령어 실행 시 자동으로 생성되니 걱정하지 않으셔도 됩니다.

<a name="quickstart-next-steps"></a>
#### 다음 단계

이벤트 브로드캐스팅을 활성화했다면, [브로드캐스트할 이벤트 정의](#defining-broadcast-events)와 [이벤트를 청취하는 방법](#listening-for-events)에 대해 자세히 배워보면 좋습니다. 라라벨의 React 또는 Vue [스타터 키트](/docs/12.x/starter-kits)를 사용한다면 Echo의 [useEcho hook](#using-react-or-vue)을 활용해 쉽게 이벤트를 청취할 수 있습니다.

> [!NOTE]
> 이벤트를 브로드캐스트하기 전에 [큐 워커](/docs/12.x/queues)를 먼저 설정하고 실행해야 합니다. 모든 이벤트 브로드캐스팅은 큐에 등록된 작업(queued jobs)을 통해 처리되므로, 이벤트 브로드캐스팅이 애플리케이션의 응답 속도에 영향을 주지 않도록 합니다.

<a name="server-side-installation"></a>
## 서버 사이드 설치

라라벨의 이벤트 브로드캐스팅을 사용하려면, 라라벨 애플리케이션에서 몇 가지 설정 작업을 하고 추가 패키지를 설치해야 합니다.

이벤트 브로드캐스팅은 서버 사이드 브로드캐스트 드라이버가 라라벨 이벤트를 브라우저 클라이언트로 송출해 주는 방식으로 동작합니다. 브라우저에서는 JavaScript 라이브러리인 Laravel Echo가 이를 수신하게 됩니다. 걱정하지 않으셔도 됩니다. 설치 과정의 모든 부분을 단계별로 안내해 드리겠습니다.

<a name="reverb"></a>
### Reverb

Reverb를 이벤트 브로드캐스터로 사용하여 라라벨의 브로드캐스팅 기능을 빠르게 활성화하려면, `install:broadcasting` Artisan 명령어에 `--reverb` 옵션을 추가하세요. 이 명령어는 Reverb에 필요한 Composer 및 NPM 패키지를 자동으로 설치하고, `.env` 파일에 필수 환경 변수를 추가합니다.

```shell
php artisan install:broadcasting --reverb
```

<a name="reverb-manual-installation"></a>
#### 수동 설치

`install:broadcasting` 명령어를 실행하면 [Laravel Reverb](/docs/12.x/reverb)를 설치할 것인지 안내가 표시됩니다. 물론 Reverb를 Composer 패키지 매니저를 사용하여 직접 설치할 수도 있습니다.

```shell
composer require laravel/reverb
```

패키지를 설치한 후에는 Reverb의 설치 명령어를 실행해 설정 파일을 발행(publish)하고, 필요한 환경 변수를 추가하며, 애플리케이션에서 이벤트 브로드캐스팅을 활성화할 수 있습니다.

```shell
php artisan reverb:install
```

자세한 Reverb 설치 및 사용 방법은 [Reverb 공식 문서](/docs/12.x/reverb)에서 확인하실 수 있습니다.

<a name="pusher-channels"></a>
### Pusher Channels

Pusher를 이벤트 브로드캐스터로 사용하여 라라벨의 브로드캐스팅 기능을 빠르게 활성화하려면, `install:broadcasting` Artisan 명령어에 `--pusher` 옵션을 추가하여 실행하세요. 이 명령어는 Pusher 자격증명(credential)을 입력받고, Pusher PHP 및 JavaScript SDK를 설치하며, `.env` 파일에 관련 환경 변수를 추가합니다.

```shell
php artisan install:broadcasting --pusher
```

<a name="pusher-manual-installation"></a>
#### 수동 설치

Pusher를 수동으로 설치하려면 Composer 패키지 매니저로 Pusher Channels PHP SDK를 설치해야 합니다.

```shell
composer require pusher/pusher-php-server
```

그런 다음, `config/broadcasting.php` 설정 파일에서 Pusher Channels의 자격증명을 설정해야 합니다. 이 파일에는 이미 샘플 Pusher Channels 설정이 포함되어 있으므로, key, secret, application ID만 빠르게 지정하면 됩니다. 일반적으로는, 다음과 같이 `.env` 파일에서 Pusher Channels 관련 환경 변수를 설정합니다.

```ini
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_APP_KEY="your-pusher-key"
PUSHER_APP_SECRET="your-pusher-secret"
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME="https"
PUSHER_APP_CLUSTER="mt1"
```

`config/broadcasting.php`의 `pusher` 설정에서는 클러스터 등 Channels에서 지원하는 추가 `options`도 지정할 수 있습니다.

이후, `.env` 파일에서 `BROADCAST_CONNECTION` 환경 변수를 `pusher`로 설정하세요.

```ini
BROADCAST_CONNECTION=pusher
```

이제 [Laravel Echo](#client-side-installation)를 설치 및 설정하면 클라이언트에서 브로드캐스트 이벤트를 받을 수 있습니다.

<a name="ably"></a>
### Ably

> [!NOTE]
> 아래 설명은 "Pusher 호환 모드"에서 Ably를 사용하는 방법에 대한 안내입니다. 하지만 Ably 팀에서는 Ably 고유의 기능을 온전히 사용할 수 있는 별도의 브로드캐스터와 Echo 클라이언트의 사용을 권장하며 직접 관리하고 있습니다. 더 자세한 내용은 [Ably의 Laravel 브로드캐스터 공식 문서](https://github.com/ably/laravel-broadcaster)를 참고하세요.

[Ably](https://ably.com)를 이벤트 브로드캐스터로 선택하여 라라벨의 브로드캐스팅 기능을 빠르게 활성화하려면, `install:broadcasting` Artisan 명령어에 `--ably` 옵션을 추가하여 실행합니다. 이 명령어는 Ably 자격증명을 입력받고, Ably PHP 및 JavaScript SDK를 설치하며, `.env` 파일에 필수 환경 변수를 등록합니다.

```shell
php artisan install:broadcasting --ably
```

**계속 진행하기 전에, Ably 애플리케이션 설정의 "Protocol Adapter Settings"에서 Pusher 프로토콜 지원을 반드시 활성화해야 합니다. 이 설정은 Ably 애플리케이션 대시보드에서 확인할 수 있습니다.**

<a name="ably-manual-installation"></a>
#### 수동 설치

Ably를 수동으로 설치하려면 Composer 패키지 매니저로 Ably PHP SDK를 설치해야 합니다.

```shell
composer require ably/ably-php
```

이제 `config/broadcasting.php` 설정 파일에서 Ably 자격증명을 입력해야 합니다. 이미 샘플 Ably 설정이 포함되어 있으므로, key 값만 빠르게 지정할 수 있습니다. 일반적으로 이 값은 `ABLY_KEY` [환경 변수](/docs/12.x/configuration#environment-configuration)를 통해 설정합니다.

```ini
ABLY_KEY=your-ably-key
```

이후, `.env` 파일에서 `BROADCAST_CONNECTION` 환경 변수를 `ably`로 지정하세요.

```ini
BROADCAST_CONNECTION=ably
```

이제 [Laravel Echo](#client-side-installation)를 설치 및 설정하여, 클라이언트에서 브로드캐스트 이벤트를 받을 수 있습니다.

<a name="client-side-installation"></a>
## 클라이언트 사이드 설치

<a name="client-reverb"></a>
### Reverb

[Laravel Echo](https://github.com/laravel/echo)는 서버 사이드 브로드캐스팅 드라이버가 송출한 이벤트를 채널 구독하고 청취하는 과정을 매우 간편하게 만들어주는 JavaScript 라이브러리입니다.

`install:broadcasting` Artisan 명령어로 Laravel Reverb를 설치하는 경우, Reverb와 Echo의 스캐폴딩(scaffolding) 및 설정이 자동으로 애플리케이션에 적용됩니다. 그러나 필요하다면, 아래 안내에 따라 Laravel Echo를 수동으로 직접 설정할 수도 있습니다.

<a name="reverb-client-manual-installation"></a>
#### 수동 설치

프론트엔드에서 Laravel Echo를 수동으로 설정하려면, 먼저 `pusher-js` 패키지를 설치해야 합니다. Reverb는 WebSocket 구독, 채널, 메시지 전송에 Pusher 프로토콜을 사용하기 때문입니다.

```shell
npm install --save-dev laravel-echo pusher-js
```

Echo 설치가 완료되면, 애플리케이션의 JavaScript에서 새로운 Echo 인스턴스를 생성해 설정합니다. 보통은 Laravel 프레임워크에 포함된 `resources/js/bootstrap.js` 파일 하단이 좋은 위치입니다.

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

```js
import { configureEcho } from "@laravel/echo-react";

configureEcho({
    broadcaster: "reverb",
    // key: import.meta.env.VITE_REVERB_APP_KEY,
    // wsHost: import.meta.env.VITE_REVERB_HOST,
    // wsPort: import.meta.env.VITE_REVERB_PORT,
    // wssPort: import.meta.env.VITE_REVERB_PORT,
    // forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    // enabledTransports: ['ws', 'wss'],
});
```

```js
import { configureEcho } from "@laravel/echo-vue";

configureEcho({
    broadcaster: "reverb",
    // key: import.meta.env.VITE_REVERB_APP_KEY,
    // wsHost: import.meta.env.VITE_REVERB_HOST,
    // wsPort: import.meta.env.VITE_REVERB_PORT,
    // wssPort: import.meta.env.VITE_REVERB_PORT,
    // forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    // enabledTransports: ['ws', 'wss'],
});
```

이제 애플리케이션의 자바스크립트 에셋을 빌드하면 됩니다.

```shell
npm run build
```

> [!WARNING]
> Laravel Echo의 `reverb` 브로드캐스터 사용을 위해서는 laravel-echo v1.16.0 이상이 필요합니다.

<a name="client-pusher-channels"></a>
### Pusher Channels

[Laravel Echo](https://github.com/laravel/echo)는 서버 사이드 브로드캐스팅 드라이버가 송출한 이벤트를 채널 구독하고 청취하는 과정을 매우 간편하게 만들어주는 JavaScript 라이브러리입니다.

`install:broadcasting --pusher` Artisan 명령어로 브로드캐스트 지원을 설치하면, Pusher와 Echo의 스캐폴딩 및 설정이 애플리케이션에 자동으로 적용됩니다. 그러나 필요하다면, 아래 지침에 따라 Laravel Echo를 수동으로 직접 설정할 수도 있습니다.

<a name="pusher-client-manual-installation"></a>
#### 수동 설치

프론트엔드에서 Laravel Echo를 수동으로 사용하려면, 먼저 `laravel-echo`와 `pusher-js` 패키지를 설치해야 합니다. 이 두 패키지는 Pusher 프로토콜을 이용해 WebSocket 구독과 메시지 전송을 지원합니다.

```shell
npm install --save-dev laravel-echo pusher-js
```

Echo 설치가 완료되면, 애플리케이션의 `resources/js/bootstrap.js` 파일에서 새로운 Echo 인스턴스를 다음과 같이 생성할 수 있습니다.

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

```js
import { configureEcho } from "@laravel/echo-react";

configureEcho({
    broadcaster: "pusher",
    // key: import.meta.env.VITE_PUSHER_APP_KEY,
    // cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    // forceTLS: true,
    // wsHost: import.meta.env.VITE_PUSHER_HOST,
    // wsPort: import.meta.env.VITE_PUSHER_PORT,
    // wssPort: import.meta.env.VITE_PUSHER_PORT,
    // enabledTransports: ["ws", "wss"],
});
```

```js
import { configureEcho } from "@laravel/echo-vue";

configureEcho({
    broadcaster: "pusher",
    // key: import.meta.env.VITE_PUSHER_APP_KEY,
    // cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    // forceTLS: true,
    // wsHost: import.meta.env.VITE_PUSHER_HOST,
    // wsPort: import.meta.env.VITE_PUSHER_PORT,
    // wssPort: import.meta.env.VITE_PUSHER_PORT,
    // enabledTransports: ["ws", "wss"],
});
```

다음으로, 애플리케이션의 `.env` 파일에 Pusher 관련 환경변수 값을 정의해야 합니다. 해당 값들이 없으면 추가해주세요:

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

Echo 설정을 애플리케이션에 맞게 조정했다면, 자바스크립트 에셋을 빌드할 수 있습니다.

```shell
npm run build
```

> [!NOTE]
> 자바스크립트 에셋 빌드에 대한 더 자세한 내용은 [Vite](/docs/12.x/vite) 문서를 참고하세요.

<a name="using-an-existing-client-instance"></a>
#### 기존 클라이언트 인스턴스 사용하기

이미 미리 설정된 Pusher Channels 클라이언트 인스턴스가 있다면, Echo의 `client` 옵션으로 해당 인스턴스를 전달해 활용할 수 있습니다.

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
> 아래 내용은 "Pusher 호환 모드"에서 Ably를 사용하는 방법을 설명하고 있습니다. 하지만 Ably 팀은 Ably 고유의 기능을 극대화할 수 있는 별도의 브로드캐스터와 Echo 클라이언트의 사용을 권장하며, 직접 관리하고 있습니다. 더 자세한 사항은 [Ably의 Laravel 브로드캐스터 공식 문서](https://github.com/ably/laravel-broadcaster)에서 확인할 수 있습니다.

[Laravel Echo](https://github.com/laravel/echo)는 서버 사이드 브로드캐스팅 드라이버가 송출한 이벤트를 채널 구독하고 청취하는 과정을 매우 간편하게 만들어주는 JavaScript 라이브러리입니다.

`install:broadcasting --ably` Artisan 명령어로 브로드캐스트 지원을 설치하면, Ably와 Echo의 스캐폴딩과 설정이 자동으로 애플리케이션에 적용됩니다. 그러나 필요하다면, 아래 안내에 따라 Laravel Echo를 수동으로 직접 설정할 수도 있습니다.

<a name="ably-client-manual-installation"></a>
#### 수동 설치

프론트엔드에서 Laravel Echo를 수동으로 활용하려면, 먼저 `laravel-echo` 및 `pusher-js` 패키지를 설치해야 합니다. 이 패키지들은 WebSocket 구독, 채널, 메시지 송수신에 Pusher 프로토콜을 사용합니다.

```shell
npm install --save-dev laravel-echo pusher-js
```

**계속 진행하기 전에 Ably 애플리케이션 설정의 "Protocol Adapter Settings"에서 Pusher 프로토콜 지원을 반드시 활성화해야 합니다.**

Echo 설치가 완료되면, 애플리케이션의 `resources/js/bootstrap.js` 파일에서 새로운 Echo 인스턴스를 다음과 같이 생성할 수 있습니다.

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

```js
import { configureEcho } from "@laravel/echo-react";

configureEcho({
    broadcaster: "ably",
    // key: import.meta.env.VITE_ABLY_PUBLIC_KEY,
    // wsHost: "realtime-pusher.ably.io",
    // wsPort: 443,
    // disableStats: true,
    // encrypted: true,
});
```

```js
import { configureEcho } from "@laravel/echo-vue";

configureEcho({
    broadcaster: "ably",
    // key: import.meta.env.VITE_ABLY_PUBLIC_KEY,
    // wsHost: "realtime-pusher.ably.io",
    // wsPort: 443,
    // disableStats: true,
    // encrypted: true,
});
```

Ably Echo 설정에서는 `VITE_ABLY_PUBLIC_KEY` 환경 변수를 참조하는 것을 볼 수 있습니다. 이 변수 값에는 Ably public key를 넣어야 하며, public key는 Ably key에서 `:` 앞부분이 해당됩니다.

Echo 설정을 요구에 맞게 조정했다면, 애플리케이션의 에셋을 빌드해 주세요.

```shell
npm run dev
```

> [!NOTE]
> 자바스크립트 에셋 빌드에 대한 자세한 내용은 [Vite](/docs/12.x/vite) 문서를 참고해주세요.

<a name="concept-overview"></a>
## 개념 개요

라라벨의 이벤트 브로드캐스팅 기능은, 서버 사이드 라라벨 이벤트를 드라이버 기반 WebSocket 방식으로 클라이언트 사이드 JavaScript 애플리케이션에 전달할 수 있게 해줍니다. 현재, 라라벨은 [Laravel Reverb](https://reverb.laravel.com), [Pusher Channels](https://pusher.com/channels), [Ably](https://ably.com) 드라이버를 기본으로 제공합니다. 그리고 클라이언트 측에서는 [Laravel Echo](#client-side-installation) 자바스크립트 패키지를 이용해 이벤트를 쉽고 간편하게 수신할 수 있습니다.

이벤트는 "채널(channel)"을 통해 브로드캐스트됩니다. 채널은 퍼블릭 또는 프라이빗으로 구분할 수 있습니다. 퍼블릭 채널은 애플리케이션의 누구나 별도의 인증이나 인가 과정 없이 구독할 수 있습니다. 반면, 프라이빗 채널을 구독하려면 해당 사용자가 인증 및 인가되어 있어야 합니다.

<a name="using-example-application"></a>
### 예제 애플리케이션 활용

이벤트 브로드캐스팅의 각 요소를 본격적으로 살펴보기 전에, 예시로 전자상거래(e-commerce) 매장을 생각해 보며 전체 구조를 요약해 보겠습니다.

우리의 애플리케이션에 사용자가 주문의 배송 상태를 볼 수 있는 페이지가 있다고 가정합니다. 또한, 배송 상태가 갱신되면 `OrderShipmentStatusUpdated` 이벤트가 애플리케이션에서 발생한다고 두겠습니다.

```php
use App\Events\OrderShipmentStatusUpdated;

OrderShipmentStatusUpdated::dispatch($order);
```

<a name="the-shouldbroadcast-interface"></a>
#### `ShouldBroadcast` 인터페이스

사용자가 자신의 주문을 보고 있을 때, 페이지를 새로 고치지 않아도 상태가 바로 반영되었으면 합니다. 그러기 위해서는, `OrderShipmentStatusUpdated` 이벤트에 `ShouldBroadcast` 인터페이스를 구현해야 합니다. 이렇게 하면 해당 이벤트가 발생할 때 라라벨이 자동으로 이를 브로드캐스트해줍니다.

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

`ShouldBroadcast` 인터페이스를 사용하면 반드시 `broadcastOn` 메서드를 정의해야 합니다. 이 메서드는 해당 이벤트를 브로드캐스트할 채널을 반환하는 역할을 합니다. 이 메서드의 빈 틀이 이벤트 클래스 생성 시 자동으로 생성되므로, 여러분은 안에 로직만 구현하면 됩니다. 오직 주문 생성자만 상태를 확인할 수 있게 하려면, 각 주문에 연결된 프라이빗 채널로 이벤트를 브로드캐스트합니다.

```php
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;

/**
 * 이벤트를 브로드캐스트할 채널 반환.
 */
public function broadcastOn(): Channel
{
    return new PrivateChannel('orders.'.$this->order->id);
}
```

만약 이벤트를 여러 채널에 브로드캐스트하고자 하면, `array`를 반환하면 됩니다.

```php
use Illuminate\Broadcasting\PrivateChannel;

/**
 * 이벤트를 브로드캐스트할 채널들 반환.
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

프라이빗 채널을 구독하려면 사용자가 해당 채널을 청취할 자격이 있는지 확인해야 합니다. 이때 채널 인가(authorization) 규칙은 애플리케이션의 `routes/channels.php` 파일에 정의합니다. 예를 들어, 개인적인 `orders.1` 프라이빗 채널을 구독하려는 사용자가 정말 그 주문의 소유자인지 검증할 수 있습니다.

```php
use App\Models\Order;
use App\Models\User;

Broadcast::channel('orders.{orderId}', function (User $user, int $orderId) {
    return $user->id === Order::findOrNew($orderId)->user_id;
});
```

`channel` 메서드는 채널 이름과 사용자가 해당 채널을 구독할 자격이 있는지 boolean 값(true/false)를 반환하는 콜백 함수를 받습니다.

모든 인가 콜백에는 해당 요청의 인증된 사용자(첫 번째 인수)와, 와일드카드 파라미터 등 추가 인자(두 번째 이후 인수)가 전달됩니다. 위 예시에서는 `{orderId}` 플레이스홀더가 채널명 중 "ID" 부분이 와일드카드 변수임을 의미합니다.

<a name="listening-for-event-broadcasts"></a>
#### 이벤트 브로드캐스트 청취

마지막으로, 자바스크립트 애플리케이션에서 이벤트를 청취하면 모든 준비가 끝납니다. [Laravel Echo](#client-side-installation)를 사용하면 이를 쉽게 구현할 수 있습니다. Echo는 React와 Vue용 hook도 내장하고 있으므로, 간단하게 시작할 수 있습니다. 기본 설정에서는 이벤트의 모든 public 속성이 브로드캐스트 이벤트에 포함됩니다.

```js
import { useEcho } from "@laravel/echo-react";

useEcho(
    `orders.${orderId}`,
    "OrderShipmentStatusUpdated",
    (e) => {
        console.log(e.order);
    },
);
```

```vue
<script setup lang="ts">
import { useEcho } from "@laravel/echo-vue";

useEcho(
    `orders.${orderId}`,
    "OrderShipmentStatusUpdated",
    (e) => {
        console.log(e.order);
    },
);
</script>
```

<a name="defining-broadcast-events"></a>

## 브로드캐스트 이벤트 정의하기

라라벨에 특정 이벤트를 브로드캐스트해야 한다는 사실을 알리려면, 해당 이벤트 클래스에 `Illuminate\Contracts\Broadcasting\ShouldBroadcast` 인터페이스를 구현해야 합니다. 이 인터페이스는 프레임워크가 생성하는 모든 이벤트 클래스에 이미 임포트되어 있으므로, 원하는 이벤트에 손쉽게 추가할 수 있습니다.

`ShouldBroadcast` 인터페이스를 구현할 때는 반드시 `broadcastOn`이라는 메서드를 작성해야 합니다. 이 `broadcastOn` 메서드는 이벤트가 브로드캐스트되어야 할 채널(`Channel`), 혹은 채널 목록(배열)을 반환해야 합니다. 이 채널들은 `Channel`, `PrivateChannel`, `PresenceChannel` 클래스의 인스턴스여야 합니다. `Channel` 인스턴스는 모든 사용자가 구독할 수 있는 공개 채널을 의미하며, `PrivateChannel`과 `PresenceChannel`은 인증된 사용자만 접근할 수 있는 비공개 채널로, [채널 인가](#authorizing-channels)가 필요합니다.

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
     * 새 이벤트 인스턴스 생성
     */
    public function __construct(
        public User $user,
    ) {}

    /**
     * 이 이벤트를 브로드캐스트할 채널들 반환
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

`ShouldBroadcast` 인터페이스를 구현한 후에는 [이벤트를 평소와 같이 발생시켜주기](/docs/12.x/events)만 하면 됩니다. 이벤트가 발생하면, [큐 작업](/docs/12.x/queues)이 자동으로 생성되어, 설정해둔 브로드캐스트 드라이버를 통해 해당 이벤트를 브로드캐스트합니다.

<a name="broadcast-name"></a>
### 브로드캐스트 이름 지정하기

기본적으로 라라벨은 이벤트의 클래스명을 사용하여 이벤트를 브로드캐스트합니다. 하지만, 이벤트에 `broadcastAs` 메서드를 정의하여 브로드캐스트할 이름을 커스텀할 수 있습니다.

```php
/**
 * 이 이벤트의 브로드캐스트 명칭.
 */
public function broadcastAs(): string
{
    return 'server.created';
}
```

만약 `broadcastAs`를 사용해서 이름을 커스텀했다면, 리스너 등록 시 앞에 점(`.`)을 붙여야 합니다. 이렇게 하면 Echo가 애플리케이션의 네임스페이스를 앞에 덧붙이지 않도록 할 수 있습니다.

```javascript
.listen('.server.created', function (e) {
    // ...
});
```

<a name="broadcast-data"></a>
### 브로드캐스트 데이터

이벤트가 브로드캐스트될 때, 모든 `public` 속성들은 자동으로 직렬화되어 이벤트 페이로드로 전송됩니다. 따라서 자바스크립트 애플리케이션에서 해당 public 데이터를 바로 접근할 수 있습니다. 예를 들어, 이벤트에 `$user`라는 public 속성이 있고, 여기에 Eloquent 모델이 저장되어 있다면, 이벤트의 브로드캐스트 페이로드는 다음과 같이 됩니다.

```json
{
    "user": {
        "id": 1,
        "name": "Patrick Stewart"
        ...
    }
}
```

하지만 브로드캐스트 페이로드의 형태를 세밀하게 제어하고 싶다면, 이벤트에 `broadcastWith` 메서드를 추가할 수 있습니다. 이 메서드는 브로드캐스트 페이로드로 보낼 데이터를 배열로 반환해야 합니다.

```php
/**
 * 브로드캐스트할 데이터 반환.
 *
 * @return array<string, mixed>
 */
public function broadcastWith(): array
{
    return ['id' => $this->user->id];
}
```

<a name="broadcast-queue"></a>
### 브로드캐스트 큐 지정

기본적으로 브로드캐스트 이벤트는 `queue.php` 설정 파일에서 지정한 기본 큐 연결 및 기본 큐에 할당됩니다. 이벤트 클래스 내에 `connection` 및 `queue` 속성을 정의하면, 사용되는 큐 연결 이름과 큐명을 직접 지정할 수 있습니다.

```php
/**
 * 브로드캐스트할 때 사용할 큐 연결 이름
 *
 * @var string
 */
public $connection = 'redis';

/**
 * 브로드캐스트 작업을 할당할 큐 이름
 *
 * @var string
 */
public $queue = 'default';
```

또는, 이벤트 클래스에서 `broadcastQueue` 메서드를 정의하여 큐 이름만 커스텀할 수도 있습니다.

```php
/**
 * 브로드캐스트 작업을 할당할 큐 이름 반환
 */
public function broadcastQueue(): string
{
    return 'default';
}
```

또한, 이벤트를 기본 큐 드라이버가 아닌 `sync` 큐를 이용해 브로드캐스트하고 싶다면, `ShouldBroadcast` 대신 `ShouldBroadcastNow` 인터페이스를 구현하면 됩니다.

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
### 브로드캐스트 조건 지정

특정 조건을 만족할 때만 이벤트를 브로드캐스트하고 싶을 수도 있습니다. 이럴 때는 이벤트 클래스에 `broadcastWhen` 메서드를 추가하면 됩니다.

```php
/**
 * 이 이벤트를 브로드캐스트할지 여부 결정
 */
public function broadcastWhen(): bool
{
    return $this->order->value > 100;
}
```

<a name="broadcasting-and-database-transactions"></a>
#### 브로드캐스팅과 데이터베이스 트랜잭션

이벤트가 데이터베이스 트랜잭션 내부에서 브로드캐스트로 디스패치되는 경우, 이 이벤트를 처리하는 큐 작업이 데이터베이스 트랜잭션이 커밋되기 전에 실행될 수 있습니다. 이 경우, 트랜잭션 내에서 모델이나 데이터베이스 레코드에 적용한 변경사항이 아직 커밋되지 않아 데이터베이스에 반영되지 않았을 수 있습니다. 또한, 트랜잭션 내에서 생성한 모델이나 레코드가 실제 데이터베이스에 존재하지 않을 수도 있습니다. 이러한 상황에 의존하는 이벤트라면, 이벤트 브로드캐스트 작업이 실행될 때 예기치 않은 에러가 발생할 수 있습니다.

큐 연결 설정인 `after_commit` 옵션이 `false`로 되어 있어도, 특정 브로드캐스트 이벤트만 트랜잭션 커밋 후에 디스패치되도록 하고 싶다면 이벤트 클래스에 `ShouldDispatchAfterCommit` 인터페이스를 구현하면 됩니다.

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
> 이러한 문제에 대한 더 자세한 우회 방법은 [큐 작업과 데이터베이스 트랜잭션](/docs/12.x/queues#jobs-and-database-transactions) 문서를 참고해 주세요.

<a name="authorizing-channels"></a>
## 채널 인가(Authorization)하기

비공개 채널(Private Channel)에 대해서는, 현재 인증된 사용자가 해당 채널을 실제로 들을(구독할) 수 있는지 인가 처리가 필요합니다. 이 인가 과정은, 클라이언트가 채널 이름과 함께 라라벨 애플리케이션에 HTTP 요청을 보내면, 애플리케이션이 그 사용자가 구독 권한이 있는지를 확인해서 결정합니다. [Laravel Echo](#client-side-installation)를 사용할 경우, 비공개 채널에 구독을 시도하면 인가를 위한 HTTP 요청이 자동으로 전송됩니다.

브로드캐스트 기능이 활성화되면, 라라벨은 `/broadcasting/auth` 라우트를 자동으로 등록하여 인가 요청을 처리합니다. `/broadcasting/auth` 라우트는 기본적으로 `web` 미들웨어 그룹으로 보호됩니다.

<a name="defining-authorization-callbacks"></a>
### 인가 콜백 정의하기

이제 실제로 현재 인증된 사용자가 특정 채널을 구독할 수 있는지를 판별하는 로직을 정의해야 합니다. 이 처리는 `install:broadcasting` Artisan 명령어 실행 시 생성되는 `routes/channels.php` 파일에서 할 수 있습니다. 이 파일에서, `Broadcast::channel` 메서드를 사용하면 채널 인가 콜백을 등록할 수 있습니다.

```php
use App\Models\User;

Broadcast::channel('orders.{orderId}', function (User $user, int $orderId) {
    return $user->id === Order::findOrNew($orderId)->user_id;
});
```

`channel` 메서드는 두 개의 인수를 받습니다: 채널 이름과, 사용자가 해당 채널을 구독할 수 있는지 `true` 또는 `false`를 반환하는 콜백 함수입니다.

모든 인가 콜백에는 항상 첫 번째 인수로 현재 인증된 사용자가 전달되며, 추가적인 와일드카드 파라미터들이 뒤따라 전달될 수 있습니다. 위 예제에서는 `{orderId}` 플레이스홀더를 사용하여, 채널 이름의 "ID" 부분이 와일드카드임을 나타내고 있습니다.

애플리케이션의 브로드캐스트 인가 콜백 목록을 확인하려면 `channel:list` Artisan 명령어를 사용할 수 있습니다.

```shell
php artisan channel:list
```

<a name="authorization-callback-model-binding"></a>
#### 인가 콜백에서의 모델 바인딩

HTTP 라우트와 마찬가지로, 채널 라우트에서도 [암묵적 및 명시적 라우트 모델 바인딩](/docs/12.x/routing#route-model-binding)을 사용할 수 있습니다. 예를 들어, 문자열이나 숫자형 order ID 대신 실제 `Order` 모델 인스턴스를 자동으로 전달받을 수 있습니다.

```php
use App\Models\Order;
use App\Models\User;

Broadcast::channel('orders.{order}', function (User $user, Order $order) {
    return $user->id === $order->user_id;
});
```

> [!WARNING]
> HTTP 라우트 모델 바인딩과 달리, 채널 모델 바인딩은 [암묵적 모델 바인딩 스코핑](/docs/12.x/routing#implicit-model-binding-scoping)을 자동으로 지원하지 않습니다. 하지만 대부분의 경우 채널은 단일 모델의 고유한 기본키로 범위를 한정할 수 있으므로, 실무에 큰 문제는 없습니다.

<a name="authorization-callback-authentication"></a>
#### 인가 콜백의 인증 처리

비공개와 프레즌스(존재) 브로드캐스트 채널은 애플리케이션의 기본 인증 가드를 통해 현재 사용자를 인증합니다. 만약 사용자가 인증되어 있지 않다면, 인가 처리는 자동으로 거부되며 인가 콜백은 절대 실행되지 않습니다. 필요하다면 요청을 다중 커스텀 가드로 인증할 수도 있습니다.

```php
Broadcast::channel('channel', function () {
    // ...
}, ['guards' => ['web', 'admin']]);
```

<a name="defining-channel-classes"></a>
### 채널 클래스 정의하기

애플리케이션에서 관리하는 채널이 많아지면 `routes/channels.php` 파일이 지나치게 비대해질 수 있습니다. 이럴 때는, 클로저 대신 채널 클래스를 사용할 수 있습니다. 채널 클래스를 생성하려면 `make:channel` Artisan 명령어를 사용합니다. 이 명령어는 `App/Broadcasting` 디렉터리에 새 채널 클래스를 생성합니다.

```shell
php artisan make:channel OrderChannel
```

다음으로, `routes/channels.php` 파일에서 채널을 등록해줍니다.

```php
use App\Broadcasting\OrderChannel;

Broadcast::channel('orders.{order}', OrderChannel::class);
```

이제 인가 로직은 채널 클래스의 `join` 메서드에 작성할 수 있습니다. 이 `join` 메서드는 원래 클로저에 작성했던 것과 동일한 인가 로직을 포함하며, 채널에서 모델 바인딩 기능도 사용할 수 있습니다.

```php
<?php

namespace App\Broadcasting;

use App\Models\Order;
use App\Models\User;

class OrderChannel
{
    /**
     * 채널 인스턴스 생성자
     */
    public function __construct() {}

    /**
     * 사용자의 채널 접근 권한 인가 처리
     */
    public function join(User $user, Order $order): array|bool
    {
        return $user->id === $order->user_id;
    }
}
```

> [!NOTE]
> 라라벨의 많은 클래스들과 마찬가지로, 채널 클래스도 [서비스 컨테이너](/docs/12.x/container)가 자동으로 의존성을 주입해줍니다. 따라서 생성자에서 type-hint를 이용해 필요한 의존성 인스턴스를 자유롭게 선언할 수 있습니다.

<a name="broadcasting-events"></a>
## 이벤트 브로드캐스트하기

이벤트에 `ShouldBroadcast` 인터페이스를 지정(구현)했다면, 이벤트의 dispatch 메서드를 이용해 이벤트를 발생시키기만 하면 됩니다. 이벤트 디스패처는 해당 이벤트가 `ShouldBroadcast` 인터페이스를 가지고 있음을 감지하여, 브로드캐스트할 수 있도록 큐 작업에 할당합니다.

```php
use App\Events\OrderShipmentStatusUpdated;

OrderShipmentStatusUpdated::dispatch($order);
```

<a name="only-to-others"></a>
### 다른 구독자에게만 브로드캐스트하기

이벤트 브로드캐스팅을 사용하는 애플리케이션을 구축할 때, 특정 채널의 모든 구독자에게 이벤트를 브로드캐스트하되 현재 사용자 본인만은 제외하고 싶은 경우가 종종 있습니다. 이런 경우에는 `broadcast` 헬퍼와 `toOthers` 메서드를 함께 활용하면 됩니다.

```php
use App\Events\OrderShipmentStatusUpdated;

broadcast(new OrderShipmentStatusUpdated($update))->toOthers();
```

이해를 돕기 위해 예를 들어 보겠습니다. 만약 사용자가 신규 작업(Task)을 추가할 수 있는 작업 목록 애플리케이션을 만든다고 가정합시다. 사용자가 작업을 생성하면, `/task` 엔드포인트에 요청을 보내서 작업이 생성되고, 그 결과로 Json 형태의 새 작업 정보가 반환됩니다. 이 때, 자바스크립트 애플리케이션은 그 응답을 받아 즉시 작업 목록에 해당 작업을 추가할 수 있습니다.

```js
axios.post('/task', task)
    .then((response) => {
        this.tasks.push(response.data);
    });
```

하지만, 동일한 작업 생성 이벤트를 브로드캐스트도 하고 있다면, 자바스크립트 앱이 이 이벤트를 리스닝해서 작업을 추가하는 코드를 가지고 있을 경우, 작업이 중복해서 추가될 위험이 있습니다(엔드포인트 응답, 브로드캐스트 이벤트 양쪽에서 모두 추가함). 이럴 때, 브로드캐스트 이벤트를 현재 사용자를 제외한 다른 모든 구독자에게만 보내고 싶다면 `toOthers` 메서드를 사용하면 됩니다.

> [!WARNING]
> `toOthers` 메서드를 사용하려면, 이벤트에 `Illuminate\Broadcasting\InteractsWithSockets` 트레이트가 포함되어 있어야 합니다.

<a name="only-to-others-configuration"></a>
#### 설정 방법

Laravel Echo 인스턴스가 생성될 때, 각 연결에는 고유한 소켓 ID가 할당됩니다. 자바스크립트 앱이 [Axios](https://github.com/axios/axios) 글로벌 인스턴스를 사용해 HTTP 요청을 보내는 경우, 이 소켓 ID는 모든 요청의 `X-Socket-ID` 헤더에 자동으로 포함됩니다. 그 뒤 `toOthers`를 호출하면, 라라벨은 해당 헤더에서 소켓 ID를 추출하여, 같은 소켓에서의 브로드캐스트는 제외하도록 처리합니다.

글로벌 Axios 인스턴스를 사용하지 않는 경우, 자바스크립트 애플리케이션이 모든 요청에 수동으로 `X-Socket-ID` 헤더를 추가하도록 직접 설정해야 합니다. 이 때, Echo 인스턴스의 `Echo.socketId` 메서드로 소켓 ID 값을 얻을 수 있습니다.

```js
var socketId = Echo.socketId();
```

<a name="customizing-the-connection"></a>
### 사용 브로드캐스터 연결 지정하기

애플리케이션이 여러 개의 브로드캐스트 연결을 사용하는데, 기본 브로드캐스터가 아니라 다른 브로드캐스터를 통해 이벤트를 브로드캐스트하고 싶다면, `via` 메서드로 사용할 연결명을 지정할 수 있습니다.

```php
use App\Events\OrderShipmentStatusUpdated;

broadcast(new OrderShipmentStatusUpdated($update))->via('pusher');
```

또는, 이벤트 클래스의 생성자에서 `broadcastVia` 메서드를 호출하여 사용할 브로드캐스터 연결을 설정할 수 있습니다. 단, 이 방법을 사용하기 전에 반드시 `InteractsWithBroadcasting` 트레이트가 이벤트 클래스에 포함되어 있어야 합니다.

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
     * 새 이벤트 인스턴스 생성자
     */
    public function __construct()
    {
        $this->broadcastVia('pusher');
    }
}
```

<a name="anonymous-events"></a>
### 익명 이벤트(Anonymous Event) 브로드캐스트

종종, 별도의 이벤트 클래스를 만들지 않고도 프론트엔드로 간단히 이벤트를 브로드캐스트하고 싶은 경우가 있습니다. 이런 상황에서는 `Broadcast` 파사드를 사용하여 "익명 이벤트"를 브로드캐스트할 수 있습니다.

```php
Broadcast::on('orders.'.$order->id)->send();
```

위 예제는 다음과 같은 이벤트를 브로드캐스트합니다.

```json
{
    "event": "AnonymousEvent",
    "data": "[]",
    "channel": "orders.1"
}
```

이벤트 이름 및 데이터는 `as` 및 `with` 메서드로 커스텀할 수 있습니다.

```php
Broadcast::on('orders.'.$order->id)
    ->as('OrderPlaced')
    ->with($order)
    ->send();
```

위 코드는 다음과 같은 이벤트를 브로드캐스트하게 됩니다.

```json
{
    "event": "OrderPlaced",
    "data": "{ id: 1, total: 100 }",
    "channel": "orders.1"
}
```

익명 이벤트를 비공개 또는 프레즌스 채널에서 브로드캐스트하고 싶다면, `private` 및 `presence` 메서드를 사용할 수 있습니다.

```php
Broadcast::private('orders.'.$order->id)->send();
Broadcast::presence('channels.'.$channel->id)->send();
```

`send` 메서드로 익명 이벤트를 브로드캐스트하면, 이벤트가 [큐](/docs/12.x/queues)에 올라가 처리됩니다. 즉시 브로드캐스트하고 싶다면 `sendNow` 메서드를 사용할 수 있습니다.

```php
Broadcast::on('orders.'.$order->id)->sendNow();
```

현재 인증된 사용자를 제외한 모든 채널 구독자에게 브로드캐스트하려면, `toOthers` 메서드를 사용할 수 있습니다.

```php
Broadcast::on('orders.'.$order->id)
    ->toOthers()
    ->send();
```

<a name="receiving-broadcasts"></a>
## 브로드캐스트 수신하기

<a name="listening-for-events"></a>
### 이벤트 리스닝

[Laravel Echo 설치 및 인스턴스화](#client-side-installation)까지 완료했다면, 라라벨 애플리케이션에서 브로드캐스트되는 이벤트를 바로 들을 준비가 된 것입니다. 먼저 `channel` 메서드로 특정 채널 인스턴스를 얻고, 이어서 `listen` 메서드로 원하는 이벤트를 리스닝할 수 있습니다.

```js
Echo.channel(`orders.${this.order.id}`)
    .listen('OrderShipmentStatusUpdated', (e) => {
        console.log(e.order.name);
    });
```

비공개 채널에서 이벤트를 듣고 싶다면, 대신 `private` 메서드를 사용하세요. `listen` 메서드를 계속 체이닝해서 한 채널에서 여러 이벤트를 동시에 들을 수도 있습니다.

```js
Echo.private(`orders.${this.order.id}`)
    .listen(/* ... */)
    .listen(/* ... */)
    .listen(/* ... */);
```

<a name="stop-listening-for-events"></a>
#### 이벤트 리스닝 중단하기

특정 채널에서 [채널을 떠나지 않고](#leaving-a-channel) 이벤트 리스닝만 중단하고 싶다면, `stopListening` 메서드를 사용합니다.

```js
Echo.private(`orders.${this.order.id}`)
    .stopListening('OrderShipmentStatusUpdated');
```

<a name="leaving-a-channel"></a>
### 채널에서 떠나기

채널에서 나가고 싶을 때는, Echo 인스턴스에서 `leaveChannel` 메서드를 호출합니다.

```js
Echo.leaveChannel(`orders.${this.order.id}`);
```

채널뿐 아니라 그 채널과 관련된 비공개 및 프레즌스 채널까지 모두 나가려면, `leave` 메서드를 사용합니다.

```js
Echo.leave(`orders.${this.order.id}`);
```

<a name="namespaces"></a>
### 네임스페이스 설정

위 예제들에서는 이벤트 클래스의 전체 네임스페이스(`App\Events`)를 명시하지 않아도 된다는 점을 눈치채셨을 수 있습니다. 이는 Echo가 기본적으로 이벤트 클래스가 `App\Events` 네임스페이스에 있다고 가정하기 때문입니다. 하지만 Echo 인스턴스를 생성할 때 `namespace` 옵션을 지정하여 루트 네임스페이스를 직접 설정할 수도 있습니다.

```js
window.Echo = new Echo({
    broadcaster: 'pusher',
    // ...
    namespace: 'App.Other.Namespace'
});
```

또는, Echo로 이벤트를 구독할 때 이벤트 클래스명 앞에 점(`.`)을 붙이면, 전체 수식된 클래스명을 항상 직접 지정할 수 있습니다.

```js
Echo.channel('orders')
    .listen('.Namespace\\Event\\Class', (e) => {
        // ...
    });
```

<a name="using-react-or-vue"></a>
### React 또는 Vue에서 사용하기

Laravel Echo는 React, Vue용 훅(hook)을 제공하여 이벤트 리스닝을 매우 쉽게 만들어줍니다. React에서는 `useEcho` 훅을, Vue에서는 `useEcho` 훅을 사용할 수 있으며, 이들은 모두 비공개 이벤트 리스닝을 매우 간단하게 할 수 있게 해줍니다. 또한, 해당 컴포넌트가 언마운트될 때 자동으로 채널을 떠나도록 처리됩니다.

```js tab=React
import { useEcho } from "@laravel/echo-react";

useEcho(
    `orders.${orderId}`,
    "OrderShipmentStatusUpdated",
    (e) => {
        console.log(e.order);
    },
);
```

```vue tab=Vue
<script setup lang="ts">
import { useEcho } from "@laravel/echo-vue";

useEcho(
    `orders.${orderId}`,
    "OrderShipmentStatusUpdated",
    (e) => {
        console.log(e.order);
    },
);
</script>
```

이벤트 배열을 넘기면 여러 이벤트를 한 번에 리스닝할 수도 있습니다.

```js
useEcho(
    `orders.${orderId}`,
    ["OrderShipmentStatusUpdated", "OrderShipped"],
    (e) => {
        console.log(e.order);
    },
);
```

브로드캐스트 이벤트 페이로드의 타입(데이터 구조)도 명확히 지정하여 타입 안전성과 편집 편의성을 높일 수 있습니다.

```ts
type OrderData = {
    order: {
        id: number;
        user: {
            id: number;
            name: string;
        };
        created_at: string;
    };
};

useEcho<OrderData>(`orders.${orderId}`, "OrderShipmentStatusUpdated", (e) => {
    console.log(e.order.id);
    console.log(e.order.user.id);
});
```

`useEcho` 훅은 컴포넌트가 언마운트될 때 자동으로 채널을 떠나지만, 필요하다면 반환값의 여러 함수들을 통해 수동으로 채널 리스닝을 제어할 수도 있습니다.

```js tab=React
import { useEcho } from "@laravel/echo-react";

const { leaveChannel, leave, stopListening, listen } = useEcho(
    `orders.${orderId}`,
    "OrderShipmentStatusUpdated",
    (e) => {
        console.log(e.order);
    },
);

// 리스닝만 중단(채널은 떠나지 않음)
stopListening();

// 다시 리스닝 시작
listen();

// 채널 나가기
leaveChannel();

// 채널 및 연관 비공개, 프레즌스 채널 모두 나가기
leave();
```

```vue tab=Vue
<script setup lang="ts">
import { useEcho } from "@laravel/echo-vue";

const { leaveChannel, leave, stopListening, listen } = useEcho(
    `orders.${orderId}`,
    "OrderShipmentStatusUpdated",
    (e) => {
        console.log(e.order);
    },
);

// 리스닝만 중단(채널은 떠나지 않음)
stopListening();

// 다시 리스닝 시작
listen();

// 채널 나가기
leaveChannel();

// 채널 및 연관 비공개, 프레즌스 채널 모두 나가기
leave();
</script>
```

<a name="react-vue-connecting-to-public-channels"></a>

#### 퍼블릭 채널에 연결하기

퍼블릭 채널에 연결하려면 `useEchoPublic` 훅을 사용할 수 있습니다.

```js tab=React
import { useEchoPublic } from "@laravel/echo-react";

useEchoPublic("posts", "PostPublished", (e) => {
    console.log(e.post);
});
```

```vue tab=Vue
<script setup lang="ts">
import { useEchoPublic } from "@laravel/echo-vue";

useEchoPublic("posts", "PostPublished", (e) => {
    console.log(e.post);
});
</script>
```

<a name="react-vue-connecting-to-presence-channels"></a>
#### 프레젠스 채널에 연결하기

프레젠스(presence) 채널에 연결하려면 `useEchoPresence` 훅을 사용할 수 있습니다.

```js tab=React
import { useEchoPresence } from "@laravel/echo-react";

useEchoPresence("posts", "PostPublished", (e) => {
    console.log(e.post);
});
```

```vue tab=Vue
<script setup lang="ts">
import { useEchoPresence } from "@laravel/echo-vue";

useEchoPresence("posts", "PostPublished", (e) => {
    console.log(e.post);
});
</script>
```

<a name="presence-channels"></a>
## 프레젠스 채널

프레젠스 채널은 프라이빗 채널의 보안성에 더해, 현재 채널에 접속해 있는 사용자가 누구인지 확인할 수 있는 추가 기능을 제공합니다. 이를 활용하면 같은 페이지를 보고 있는 사용자를 실시간으로 알리거나, 채팅방에 있는 참여자 목록을 표시하는 등 협업 기능을 손쉽게 구현할 수 있습니다.

<a name="authorizing-presence-channels"></a>
### 프레젠스 채널 인가

모든 프레젠스 채널은 프라이빗 채널이기도 하므로, [접근 권한이 인가된 사용자만 접근할 수 있습니다](#authorizing-channels). 하지만 프레젠스 채널에 대한 인가 콜백을 정의할 때는, 사용자가 채널에 참여할 수 있도록 인가되었을 경우 `true`를 반환하는 것이 아니라, 사용자에 대한 정보를 담은 배열을 반환해야 합니다.

인가 콜백에서 반환한 데이터는 여러분의 JavaScript 애플리케이션에서 프레젠스 채널 이벤트 리스너를 통해 사용할 수 있습니다. 사용자가 프레젠스 채널에 참여할 수 없는 경우에는 `false` 또는 `null`을 반환하면 됩니다.

```php
use App\Models\User;

Broadcast::channel('chat.{roomId}', function (User $user, int $roomId) {
    if ($user->canJoinRoom($roomId)) {
        return ['id' => $user->id, 'name' => $user->name];
    }
});
```

<a name="joining-presence-channels"></a>
### 프레젠스 채널 참여하기

프레젠스 채널에 참여하려면 Echo의 `join` 메서드를 사용할 수 있습니다. 이 메서드는 `PresenceChannel` 구현 객체를 반환하며, `listen` 메서드 외에도 `here`, `joining`, `leaving` 이벤트에 구독할 수 있습니다.

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

`here` 콜백은 채널에 성공적으로 참여했을 때 즉시 실행되며, 현재 채널에 참여해 있는 모든 사용자 정보가 배열로 전달됩니다. `joining` 메서드는 새 사용자가 채널에 참여할 때, `leaving` 메서드는 사용자가 채널을 나갈 때 호출됩니다. `error` 메서드는 인증 엔드포인트가 200이 아닌 상태 코드를 반환하거나, 반환된 JSON을 파싱하는 데 문제가 있을 때 실행됩니다.

<a name="broadcasting-to-presence-channels"></a>
### 프레젠스 채널로 이벤트 브로드캐스트하기

프레젠스 채널도 퍼블릭/프라이빗 채널과 마찬가지로 이벤트를 받을 수 있습니다. 예를 들어, 채팅방 기능을 구현할 때 해당 방의 프레젠스 채널로 `NewMessage` 이벤트를 브로드캐스트하고 싶을 수 있습니다. 이 경우, 이벤트의 `broadcastOn` 메서드에서 `PresenceChannel` 인스턴스를 반환하면 됩니다.

```php
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

다른 이벤트와 마찬가지로 `broadcast` 헬퍼 및 `toOthers` 메서드를 사용하면 현재 사용자는 브로드캐스트 대상에서 제외할 수 있습니다.

```php
broadcast(new NewMessage($message));

broadcast(new NewMessage($message))->toOthers();
```

프레젠스 채널로 보낸 이벤트도 Echo의 `listen` 메서드를 통해 리스닝할 수 있습니다.

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
> 아래의 모델 브로드캐스팅 관련 설명을 읽기 전에, 라라벨의 모델 브로드캐스팅 서비스의 기본 개념과, 브로드캐스트 이벤트를 수동으로 생성하고 리스닝하는 방법에 익숙해지는 것을 권장합니다.

애플리케이션의 [Eloquent 모델](/docs/12.x/eloquent)이 생성, 수정, 삭제될 때 이벤트를 브로드캐스트하는 경우가 많습니다. 물론 이는 Eloquent 모델 상태 변화에 대해 [커스텀 이벤트를 정의](/docs/12.x/eloquent#events)하고 해당 이벤트에 `ShouldBroadcast` 인터페이스를 구현하면 쉽게 처리할 수 있습니다.

하지만 해당 이벤트들을 다른 용도로는 사용하지 않고, 단지 브로드캐스팅을 위해서만 이벤트 클래스를 생성하는 것이 번거로울 수 있습니다. 이를 해결하기 위해 라라벨은 Eloquent 모델의 상태 변화가 발생할 때 자동으로 이벤트를 브로드캐스트하도록 설정할 수 있습니다.

시작하려면, Eloquent 모델에서 `Illuminate\Database\Eloquent\BroadcastsEvents` 트레이트를 사용하세요. 그리고 모델이 브로드캐스트할 채널을 반환하는 `broadcastOn` 메서드를 정의해야 합니다.

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

모델에 이 트레이트를 포함하고, 브로드캐스트할 채널을 정의하면 해당 모델 인스턴스가 생성, 수정, 삭제, 휴지통 이동, 복원될 때마다 자동으로 이벤트를 브로드캐스트합니다.

또한, 위 예시에서 `broadcastOn` 메서드가 문자열 `$event` 인자를 받는 것을 볼 수 있습니다. 이 인자는 해당 모델에서 발생한 이벤트의 타입을 나타내며, 값으로는 `created`, `updated`, `deleted`, `trashed`, `restored` 중 하나가 전달됩니다. 이 값을 통해 상황에 따라 어떤 채널에 어떤 이벤트를 브로드캐스트할지 결정할 수 있습니다.

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
#### 모델 브로드캐스팅 이벤트 생성 커스터마이즈

가끔은 라라벨이 모델 브로드캐스팅 이벤트를 생성하는 방식을 직접 커스터마이즈하고 싶을 수 있습니다. 이럴 때는 Eloquent 모델에 `newBroadcastableEvent` 메서드를 정의하면 됩니다. 이 메서드는 `Illuminate\Database\Eloquent\BroadcastableModelEventOccurred` 인스턴스를 반환해야 합니다.

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
#### 채널 네이밍 규칙

위 예시에서 보듯 `broadcastOn` 메서드는 `Channel` 인스턴스를 직접 반환하지 않고, Eloquent 모델 인스턴스를 그대로 반환했습니다. 만약 Eloquent 모델 인스턴스를 반환하면, 라라벨은 모델의 클래스명과 기본 키(primary key)를 조합하여 해당 모델에 대해 자동으로 프라이빗 채널 인스턴스를 생성합니다.

예를 들어, `App\Models\User` 모델의 `id`가 1이라면, 채널 이름은 `App.Models.User.1`이 되어 `Illuminate\Broadcasting\PrivateChannel` 인스턴스로 변환됩니다. 물론, 모델의 `broadcastOn`에서 Eloquent 모델 인스턴스 대신 직접 `Channel` 객체를 반환하여 채널 이름을 상세하게 제어할 수도 있습니다.

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

또한, `broadcastOn` 메서드에서 채널 인스턴스를 명시적으로 반환할 때, Eloquent 모델 인스턴스를 채널 생성자에 전달할 수도 있습니다. 이 경우 라라벨은 위에서 설명한 규칙을 적용하여 Eloquent 모델 인스턴스를 채널 이름 문자열로 변환합니다.

```php
return [new Channel($this->user)];
```

모델의 채널 이름 문자열이 필요하다면, 아무 모델 인스턴스에서든 `broadcastChannel` 메서드를 호출하여 얻을 수 있습니다. 예를 들어, `App\Models\User` 모델(`id`가 1)의 경우 `App.Models.User.1` 문자열이 반환됩니다.

```php
$user->broadcastChannel();
```

<a name="model-broadcasting-event-conventions"></a>
#### 이벤트 규칙

모델 브로드캐스트 이벤트는 애플리케이션의 `App\Events` 디렉터리에 실제로 존재하는 "이벤트" 클래스와 연결된 것이 아니기 때문에, 라라벨에서는 이벤트의 이름과 페이로드(전달 데이터)를 규칙에 따라 자동으로 지정합니다. 라라벨의 기본 규칙은 "모델 클래스명(네임스페이스 미포함)"과 "모델 이벤트명"을 조합하여 이벤트명을 설정합니다.

예를 들어, `App\Models\Post` 모델이 수정되면 프론트엔드로 `PostUpdated`라는 이벤트명이 브로드캐스트되고, 페이로드는 다음과 같습니다.

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

`App\Models\User` 모델이 삭제되면 `UserDeleted`라는 이벤트명이 브로드캐스팅됩니다.

원한다면 `broadcastAs`와 `broadcastWith` 메서드를 정의해서 이벤트 이름과 페이로드 데이터를 직접 커스터마이즈할 수 있습니다. 이 두 메서드는 모두 발생한 이벤트/연산의 이름을 인자로 받아, 각 모델 동작마다 구체적으로 이름과 데이터를 구성할 수 있습니다. 만약 `broadcastAs`에서 `null`을 반환하면, 라라벨이 앞서 설명한 기본 규칙대로 이벤트명을 결정합니다.

```php
/**
 * The model event's broadcast name.
 */
public function broadcastAs(string $event): string|null
{
    return match ($event) {
        'created' => 'post.created',
        default => null,
    };
}

/**
 * Get the data to broadcast for the model.
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
### 모델 브로드캐스트 이벤트 리스닝하기

`BroadcastsEvents` 트레이트를 모델에 추가하고, 모델의 `broadcastOn` 메서드를 정의했다면, 이제 프론트엔드에서 브로드캐스트된 모델 이벤트를 리스닝할 수 있습니다. 본격적으로 시작하기 전에 [이벤트 리스닝](#listening-for-events) 문서를 한 번 읽어보시길 권장합니다.

먼저, `private` 메서드로 채널 인스턴스를 가져온 뒤, `listen` 메서드를 호출해 원하는 이벤트를 수신할 수 있습니다. 이 때, `private` 메서드에 전달하는 채널명은 라라벨의 [모델 브로드캐스트 규칙](#model-broadcasting-conventions)과 일치해야 합니다.

이렇게 채널 인스턴스를 얻었다면, `listen` 메서드로 특정 이벤트를 리스닝할 수 있습니다. 모델 브로드캐스트 이벤트는 앱의 `App\Events` 디렉터리에 실제 존재하는 이벤트와 연결된 것이 아니므로, [이벤트 이름](#model-broadcasting-event-conventions) 앞에 `.`(점)을 붙여 네임스페이스에 속하지 않음을 나타내야 합니다. 모델 브로드캐스트 이벤트의 `model` 속성에는 해당 모델의 모든 브로드캐스트 가능한 속성이 담겨 있습니다.

```js
Echo.private(`App.Models.User.${this.user.id}`)
    .listen('.UserUpdated', (e) => {
        console.log(e.model);
    });
```

<a name="model-broadcasts-with-react-or-vue"></a>
#### React 또는 Vue에서 사용하기

React나 Vue를 사용한다면, 라라벨 Echo에서 제공하는 `useEchoModel` 훅을 활용하여 모델 브로드캐스트 이벤트를 간편하게 리스닝할 수 있습니다.

```js tab=React
import { useEchoModel } from "@laravel/echo-react";

useEchoModel("App.Models.User", userId, ["UserUpdated"], (e) => {
    console.log(e.model);
});
```

```vue tab=Vue
<script setup lang="ts">
import { useEchoModel } from "@laravel/echo-vue";

useEchoModel("App.Models.User", userId, ["UserUpdated"], (e) => {
    console.log(e.model);
});
</script>
```

모델 이벤트 페이로드의 데이터 타입을 명시해 타입 안정성과 작성 편의성을 높일 수도 있습니다.

```ts
type User = {
    id: number;
    name: string;
    email: string;
};

useEchoModel<User, "App.Models.User">("App.Models.User", userId, ["UserUpdated"], (e) => {
    console.log(e.model.id);
    console.log(e.model.name);
});
```

<a name="client-events"></a>
## 클라이언트 이벤트

> [!NOTE]
> [Pusher Channels](https://pusher.com/channels)를 사용할 경우, [application dashboard](https://dashboard.pusher.com/)의 "App Settings"에서 "Client Events" 옵션을 활성화해야 클라이언트 이벤트를 발송할 수 있습니다.

때때로 라라벨 애플리케이션 서버를 거치지 않고, 연결된 다른 클라이언트에게만 이벤트를 브로드캐스트하고 싶을 때가 있습니다. 대표적인 예로 "입력 중 알림(typing notification)" 기능이 있습니다. 사용자가 특정 화면에서 메시지를 입력하고 있다는 사실을 다른 사용자에게 실시간으로 알리고 싶을 때 활용할 수 있습니다.

클라이언트 이벤트를 브로드캐스트하려면 Echo의 `whisper` 메서드를 사용하세요.

```js tab=JavaScript
Echo.private(`chat.${roomId}`)
    .whisper('typing', {
        name: this.user.name
    });
```

```js tab=React
import { useEcho } from "@laravel/echo-react";

const { channel } = useEcho(`chat.${roomId}`, ['update'], (e) => {
    console.log('Chat event received:', e);
});

channel().whisper('typing', { name: user.name });
```

```vue tab=Vue
<script setup lang="ts">
import { useEcho } from "@laravel/echo-vue";

const { channel } = useEcho(`chat.${roomId}`, ['update'], (e) => {
    console.log('Chat event received:', e);
});

channel().whisper('typing', { name: user.name });
</script>
```

클라이언트 이벤트를 수신하려면 `listenForWhisper` 메서드를 사용하면 됩니다.

```js tab=JavaScript
Echo.private(`chat.${roomId}`)
    .listenForWhisper('typing', (e) => {
        console.log(e.name);
    });
```

```js tab=React
import { useEcho } from "@laravel/echo-react";

const { channel } = useEcho(`chat.${roomId}`, ['update'], (e) => {
    console.log('Chat event received:', e);
});

channel().listenForWhisper('typing', (e) => {
    console.log(e.name);
});
```

```vue tab=Vue
<script setup lang="ts">
import { useEcho } from "@laravel/echo-vue";

const { channel } = useEcho(`chat.${roomId}`, ['update'], (e) => {
    console.log('Chat event received:', e);
});

channel().listenForWhisper('typing', (e) => {
    console.log(e.name);
});
</script>
```

<a name="notifications"></a>
## 알림(Notifications)

이벤트 브로드캐스팅과 [알림 기능](/docs/12.x/notifications)을 조합하면, JavaScript 애플리케이션에서 페이지 새로고침 없이도 새 알림을 실시간으로 받을 수 있습니다. 먼저 [브로드캐스트 알림 채널 사용법](/docs/12.x/notifications#broadcast-notifications) 문서를 읽어보시길 권장합니다.

알림이 브로드캐스트 채널을 사용하도록 설정했다면, Echo의 `notification` 메서드로 브로드캐스트된 알림 이벤트를 리스닝할 수 있습니다. 이때 채널 이름은 알림을 받는 엔티티의 클래스명 규칙과 일치해야 합니다.

```js tab=JavaScript
Echo.private(`App.Models.User.${userId}`)
    .notification((notification) => {
        console.log(notification.type);
    });
```

```js tab=React
import { useEchoModel } from "@laravel/echo-react";

const { channel } = useEchoModel('App.Models.User', userId);

channel().notification((notification) => {
    console.log(notification.type);
});
```

```vue tab=Vue
<script setup lang="ts">
import { useEchoModel } from "@laravel/echo-vue";

const { channel } = useEchoModel('App.Models.User', userId);

channel().notification((notification) => {
    console.log(notification.type);
});
</script>
```

이 예시에서는 `App\Models\User` 인스턴스에 대해 `broadcast` 채널로 전송된 모든 알림이 콜백에서 수신됩니다. `App.Models.User.{id}` 채널에 대한 채널 인가 콜백은 애플리케이션의 `routes/channels.php` 파일에 포함되어 있습니다.