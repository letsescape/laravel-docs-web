# 이벤트 (Events)

- [소개](#introduction)
- [이벤트와 리스너 생성](#generating-events-and-listeners)
- [이벤트와 리스너 등록](#registering-events-and-listeners)
    - [이벤트 자동 감지(Event Discovery)](#event-discovery)
    - [이벤트 수동 등록](#manually-registering-events)
    - [클로저 리스너](#closure-listeners)
- [이벤트 정의](#defining-events)
- [리스너 정의](#defining-listeners)
- [큐를 사용하는 이벤트 리스너](#queued-event-listeners)
    - [큐 수동 조작](#manually-interacting-with-the-queue)
    - [큐 리스너와 데이터베이스 트랜잭션](#queued-event-listeners-and-database-transactions)
    - [실패한 작업 처리](#handling-failed-jobs)
- [이벤트 디스패치(발행)](#dispatching-events)
    - [데이터베이스 트랜잭션 이후 이벤트 발행](#dispatching-events-after-database-transactions)
- [이벤트 구독자](#event-subscribers)
    - [이벤트 구독자 작성](#writing-event-subscribers)
    - [이벤트 구독자 등록](#registering-event-subscribers)
- [테스트](#testing)
    - [특정 이벤트만 페이크 처리](#faking-a-subset-of-events)
    - [스코프된 이벤트 페이크](#scoped-event-fakes)

<a name="introduction"></a>
## 소개

라라벨의 이벤트 기능은 단순한 옵저버 패턴을 구현하여, 애플리케이션 내에서 발생하는 다양한 이벤트를 구독하고 감지할 수 있도록 해줍니다. 이벤트 클래스는 보통 `app/Events` 디렉토리에, 해당 이벤트를 처리하는 리스너는 `app/Listeners` 디렉토리에 위치합니다. 만약 애플리케이션에 이 디렉토리가 존재하지 않는 경우, Artisan 콘솔 명령어를 사용해 이벤트나 리스너를 생성하면 자동으로 만들어집니다.

이벤트는 애플리케이션의 여러 부분을 느슨하게 결합(loose coupling)할 수 있는 효과적인 방법입니다. 하나의 이벤트에 여러 리스너가 등록될 수 있는데, 이들은 서로에게 의존하지 않습니다. 예를 들어, 주문이 발송될 때마다 사용자에게 Slack 알림을 발송하고 싶다면, 주문 처리 코드와 Slack 알림 코드를 직접 연결하는 대신 `App\Events\OrderShipped` 이벤트를 발행하고, 이 이벤트를 감지하는 리스너에서 Slack 알림을 전송할 수 있습니다.

<a name="generating-events-and-listeners"></a>
## 이벤트와 리스너 생성

이벤트와 리스너를 빠르게 생성하려면, `make:event` 및 `make:listener` Artisan 명령어를 사용할 수 있습니다.

```shell
php artisan make:event PodcastProcessed

php artisan make:listener SendPodcastNotification --event=PodcastProcessed
```

편의를 위해, `make:event`와 `make:listener` Artisan 명령어를 추가 인자 없이 실행할 수도 있습니다. 이 경우 라라벨이 클래스 이름과(리스너 생성 시) 어떤 이벤트를 감지할 것인지 직접 입력하도록 안내합니다.

```shell
php artisan make:event

php artisan make:listener
```

<a name="registering-events-and-listeners"></a>
## 이벤트와 리스너 등록

<a name="event-discovery"></a>
### 이벤트 자동 감지(Event Discovery)

기본적으로 라라벨은 애플리케이션의 `Listeners` 디렉토리를 스캔하여 이벤트 리스너를 자동으로 찾아 등록합니다. 라라벨은 리스너 클래스에서 `handle` 또는 `__invoke`로 시작하는 메서드를 발견하면, 해당 메서드의 시그니처에 타입힌트된 이벤트 클래스를 감지하여 이벤트 리스너로 자동 등록합니다.

```php
use App\Events\PodcastProcessed;

class SendPodcastNotification
{
    /**
     * 이벤트를 처리합니다.
     */
    public function handle(PodcastProcessed $event): void
    {
        // ...
    }
}
```

PHP의 유니언 타입을 사용하면 여러 이벤트를 하나의 리스너에서 감지할 수 있습니다.

```php
/**
 * 이벤트를 처리합니다.
 */
public function handle(PodcastProcessed|PodcastPublished $event): void
{
    // ...
}
```

리스너를 다른 디렉토리 또는 여러 디렉토리 내에 보관하고자 하는 경우, 애플리케이션의 `bootstrap/app.php` 파일에서 `withEvents` 메서드를 이용해 라라벨이 감지할 경로를 지정할 수 있습니다.

```php
->withEvents(discover: [
    __DIR__.'/../app/Domain/Orders/Listeners',
])
```

여러 유사 디렉토리에서 리스너를 감지하려면 `*`(와일드카드)를 사용할 수 있습니다.

```php
->withEvents(discover: [
    __DIR__.'/../app/Domain/*/Listeners',
])
```

`event:list` 명령어를 사용하면, 애플리케이션에 등록된 모든 리스너를 확인할 수 있습니다.

```shell
php artisan event:list
```

<a name="event-discovery-in-production"></a>
#### 운영 환경에서의 이벤트 자동 감지

애플리케이션의 성능을 높이려면, `optimize` 또는 `event:cache` Artisan 명령어를 통해 등록된 모든 리스너의 목록(매니페스트)을 캐싱해야 합니다. 이 명령어는 보통 [배포 과정](/docs/12.x/deployment#optimization)에서 실행되는 것이 좋습니다. 이 매니페스트는 프레임워크가 이벤트 등록 속도를 높이는 데 사용됩니다. 이벤트 캐시를 제거하려면 `event:clear` 명령어를 사용할 수 있습니다.

<a name="manually-registering-events"></a>
### 이벤트 수동 등록

`Event` 파사드를 사용하면, 애플리케이션의 `AppServiceProvider`의 `boot` 메서드에서 이벤트와 해당 리스너를 직접 등록할 수도 있습니다.

```php
use App\Domain\Orders\Events\PodcastProcessed;
use App\Domain\Orders\Listeners\SendPodcastNotification;
use Illuminate\Support\Facades\Event;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Event::listen(
        PodcastProcessed::class,
        SendPodcastNotification::class,
    );
}
```

`event:list` 명령어를 사용해 등록된 모든 리스너를 확인할 수 있습니다.

```shell
php artisan event:list
```

<a name="closure-listeners"></a>
### 클로저 리스너

일반적으로 리스너는 클래스로 정의하지만, 애플리케이션의 `AppServiceProvider`의 `boot` 메서드에서 클로저(익명 함수) 기반 이벤트 리스너를 직접 등록할 수도 있습니다.

```php
use App\Events\PodcastProcessed;
use Illuminate\Support\Facades\Event;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Event::listen(function (PodcastProcessed $event) {
        // ...
    });
}
```

<a name="queuable-anonymous-event-listeners"></a>
#### 큐를 사용하는 익명 이벤트 리스너

클로저 기반 이벤트 리스너를 등록할 때, 리스너 클로저를 `Illuminate\Events\queueable` 함수로 감싸면 라라벨이 해당 리스너를 [큐](/docs/12.x/queues)를 통해 실행하도록 지정할 수 있습니다.

```php
use App\Events\PodcastProcessed;
use function Illuminate\Events\queueable;
use Illuminate\Support\Facades\Event;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Event::listen(queueable(function (PodcastProcessed $event) {
        // ...
    }));
}
```

큐 작업처럼, `onConnection`, `onQueue`, `delay` 메서드를 사용해 큐 리스너의 실행 방식을 세부적으로 설정할 수 있습니다.

```php
Event::listen(queueable(function (PodcastProcessed $event) {
    // ...
})->onConnection('redis')->onQueue('podcasts')->delay(now()->addSeconds(10)));
```

익명 큐 리스너 실행 중 실패 상황을 처리하고 싶다면, `queueable` 리스너 정의 시 `catch` 메서드에 클로저를 전달하면 됩니다. 이 클로저는 실패 원인과 함께 이벤트 인스턴스, 그리고 예외 객체(`Throwable`)를 전달받습니다.

```php
use App\Events\PodcastProcessed;
use function Illuminate\Events\queueable;
use Illuminate\Support\Facades\Event;
use Throwable;

Event::listen(queueable(function (PodcastProcessed $event) {
    // ...
})->catch(function (PodcastProcessed $event, Throwable $e) {
    // 큐 리스너가 실패했을 때 처리...
}));
```

<a name="wildcard-event-listeners"></a>
#### 와일드카드 이벤트 리스너

`*` 문자를 와일드카드 매개변수로 활용하여, 여러 이벤트를 동시에 감지하는 리스너를 등록할 수도 있습니다. 와일드카드 리스너는 첫 번째 인자로 이벤트 이름, 두 번째 인자로 전체 이벤트 데이터 배열을 받습니다.

```php
Event::listen('event.*', function (string $eventName, array $data) {
    // ...
});
```

<a name="defining-events"></a>
## 이벤트 정의

이벤트 클래스는 기본적으로 이벤트와 관련된 데이터를 담는 컨테이너 역할을 합니다. 예를 들어, `App\Events\OrderShipped` 이벤트가 [Eloquent ORM](/docs/12.x/eloquent) 객체 하나를 받는다고 가정해보겠습니다.

```php
<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderShipped
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * 새 이벤트 인스턴스를 생성합니다.
     */
    public function __construct(
        public Order $order,
    ) {}
}
```

위 예시에서 알 수 있듯, 이벤트 클래스는 별도의 로직 없이 `App\Models\Order` 인스턴스만 담고 있습니다. 이벤트에 사용된 `SerializesModels` 트레이트는, 이벤트 객체가 PHP의 `serialize` 함수로 직렬화될 때(주로 [큐 리스너](#queued-event-listeners)에서 사용됨) Eloquent 모델을 올바르게 직렬화할 수 있도록 도와줍니다.

<a name="defining-listeners"></a>
## 리스너 정의

다음으로, 위에서 정의한 이벤트를 처리할 리스너를 살펴보겠습니다. 이벤트 리스너는 `handle` 메서드에서 이벤트 인스턴스를 전달받습니다. `make:listener` Artisan 명령어에 `--event` 옵션을 붙여 실행하면, 이벤트 클래스가 자동으로 import되고, `handle` 메서드 내에 이벤트 타입이 자동으로 지정됩니다. 이 `handle` 메서드 내에서 이벤트에 대한 필요한 처리를 구현하면 됩니다.

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;

class SendShipmentNotification
{
    /**
     * 이벤트 리스너 인스턴스를 생성합니다.
     */
    public function __construct() {}

    /**
     * 이벤트를 처리합니다.
     */
    public function handle(OrderShipped $event): void
    {
        // $event->order로 주문 정보에 접근 가능...
    }
}
```

> [!NOTE]
> 이벤트 리스너의 생성자에서 필요한 의존성을 타입힌트로 지정할 수도 있습니다. 모든 이벤트 리스너는 라라벨 [서비스 컨테이너](/docs/12.x/container)를 통해 자동으로 의존성이 주입됩니다.

<a name="stopping-the-propagation-of-an-event"></a>
#### 이벤트 전파 중단

때로는 이벤트가 다른 리스너로 전달되는 것을 중단하고 싶을 수 있습니다. 이럴 때는 리스너의 `handle` 메서드에서 `false`를 반환하면 이벤트 전파가 중지됩니다.

<a name="queued-event-listeners"></a>
## 큐를 사용하는 이벤트 리스너

이메일 발송이나 HTTP 요청과 같이 시간이 오래 걸리는 작업을 리스너에서 처리해야 할 경우, 리스너를 큐에 넣어 비동기적으로 처리할 수 있습니다. 큐 리스너를 사용하려면, 먼저 [큐 설정](/docs/12.x/queues)과 서버 또는 개발 환경에서 큐 워커(작업 처리기)를 실행해야 합니다.

리스너가 큐에 넣어져야 함을 지정하려면, 리스너 클래스에 `ShouldQueue` 인터페이스를 구현합니다. `make:listener` Artisan 명령어로 생성된 리스너에는 이 인터페이스가 이미 임포트되어 있으니 바로 사용할 수 있습니다.

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendShipmentNotification implements ShouldQueue
{
    // ...
}
```

이제 이 리스너가 처리하는 이벤트가 디스패치(발행)되면, 이벤트 디스패처가 라라벨 [큐 시스템](/docs/12.x/queues)을 사용해 자동으로 리스너를 큐에 넣습니다. 큐에서 리스너 실행 시 예외가 발생하지 않으면, 처리가 끝난 후 해당 큐 작업은 자동으로 삭제됩니다.

<a name="customizing-the-queue-connection-queue-name"></a>
#### 큐 연결, 이름, 지연 시간 커스터마이즈

큐 리스너의 큐 연결(connection), 큐 이름, 큐 지연 시간(delay)를 커스터마이즈하려면, 리스너 클래스에 `$connection`, `$queue`, `$delay` 속성을 정의하면 됩니다.

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendShipmentNotification implements ShouldQueue
{
    /**
     * 작업이 전송될 연결의 이름입니다.
     *
     * @var string|null
     */
    public $connection = 'sqs';

    /**
     * 작업이 전송될 큐의 이름입니다.
     *
     * @var string|null
     */
    public $queue = 'listeners';

    /**
     * 작업 처리가 시작되기 전까지 대기할 시간(초)입니다.
     *
     * @var int
     */
    public $delay = 60;
}
```

동적으로 큐 연결, 큐 이름, 지연 시간을 지정하고 싶을 때는, 리스너 클래스에 `viaConnection`, `viaQueue`, `withDelay` 메서드를 정의하면 됩니다.

```php
/**
 * 리스너의 큐 연결 이름을 반환합니다.
 */
public function viaConnection(): string
{
    return 'sqs';
}

/**
 * 리스너가 사용할 큐 이름을 반환합니다.
 */
public function viaQueue(): string
{
    return 'listeners';
}

/**
 * 작업 처리까지 남은 시간을(초 단위로) 반환합니다.
 */
public function withDelay(OrderShipped $event): int
{
    return $event->highPriority ? 0 : 60;
}
```

<a name="conditionally-queueing-listeners"></a>
#### 조건부 큐 리스너

때때로 리스너를 큐에 넣을지 여부를 런타임 데이터에 따라 판단하고 싶을 때가 있습니다. 이를 위해, 리스너에 `shouldQueue` 메서드를 정의해서 필요 조건에 따라 리스너가 큐에 들어갈지 여부를 제어할 수 있습니다. 이 메서드가 `false`를 반환하면 해당 리스너는 큐에 들어가지 않습니다.

```php
<?php

namespace App\Listeners;

use App\Events\OrderCreated;
use Illuminate\Contracts\Queue\ShouldQueue;

class RewardGiftCard implements ShouldQueue
{
    /**
     * 고객에게 기프트 카드를 리워드로 제공합니다.
     */
    public function handle(OrderCreated $event): void
    {
        // ...
    }

    /**
     * 리스너를 큐에 넣을지 여부를 판단합니다.
     */
    public function shouldQueue(OrderCreated $event): bool
    {
        return $event->order->subtotal >= 5000;
    }
}
```

<a name="manually-interacting-with-the-queue"></a>
### 큐 수동 조작

리스너 내부에서 기본 큐 작업의 `delete`와 `release` 메서드에 직접 접근할 필요가 있다면, `Illuminate\Queue\InteractsWithQueue` 트레이트를 사용할 수 있습니다. 이 트레이트는 생성된 리스너에 기본적으로 import되어 있어, 관련 메서드에 쉽게 접근할 수 있습니다.

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendShipmentNotification implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * 이벤트를 처리합니다.
     */
    public function handle(OrderShipped $event): void
    {
        if (true) {
            $this->release(30);
        }
    }
}
```

<a name="queued-event-listeners-and-database-transactions"></a>
### 큐 리스너와 데이터베이스 트랜잭션

큐 리스너가 데이터베이스 트랜잭션 내에서 디스패치될 때, 트랜잭션이 커밋되기 전에 큐에서 해당 리스너가 처리될 수 있습니다. 이 경우, 트랜잭션 과정에서 변경된 모델이나 DB 레코드가 아직 DB에 반영되지 않았을 수 있습니다. 또한, 트랜잭션 안에서 생성된 모델이나 레코드는 실제로 DB에 존재하지 않을 수도 있습니다. 이런 모델을 리스너가 참조해야 한다면, 큐 작업 처리 시 예기치 않은 오류가 발생할 수 있습니다.

큐 연결의 `after_commit` 설정 옵션이 `false`로 되어 있는 경우에도, 특정 큐 리스너가 모든 데이터베이스 트랜잭션이 커밋된 뒤에 디스패치되도록 하려면, 리스너 클래스에 `ShouldQueueAfterCommit` 인터페이스를 구현하면 됩니다.

```php
<?php

namespace App\Listeners;

use Illuminate\Contracts\Queue\ShouldQueueAfterCommit;
use Illuminate\Queue\InteractsWithQueue;

class SendShipmentNotification implements ShouldQueueAfterCommit
{
    use InteractsWithQueue;
}
```

> [!NOTE]
> 이러한 문제를 우회하는 방법에 대해 더 알고 싶다면 [큐 작업과 데이터베이스 트랜잭션](/docs/12.x/queues#jobs-and-database-transactions) 문서를 참고하세요.

<a name="handling-failed-jobs"></a>
### 실패한 작업 처리

때때로 큐에서 처리되는 이벤트 리스너가 실패할 수 있습니다. 큐 리스너가 큐 워커가 정한 최대 재시도 횟수를 초과하면, 리스너의 `failed` 메서드가 호출됩니다. 이 메서드는 이벤트 인스턴스와 실패 원인이 된 예외(`Throwable`)를 인자로 받습니다.

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Throwable;

class SendShipmentNotification implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * 이벤트를 처리합니다.
     */
    public function handle(OrderShipped $event): void
    {
        // ...
    }

    /**
     * 작업 실패 시 처리합니다.
     */
    public function failed(OrderShipped $event, Throwable $exception): void
    {
        // ...
    }
}
```

<a name="specifying-queued-listener-maximum-attempts"></a>
#### 큐 리스너 최대 재시도 횟수 지정

큐 리스너에서 오류가 발생하면 무한히 재시도되는 것을 막고 싶을 수 있습니다. 라라벨에서는 리스너가 몇 번까지, 또는 얼마 동안 재시도될지 여러 가지 방법으로 지정할 수 있습니다.

리스너 클래스에 `$tries` 속성을 정의해, 실패로 간주되기 전까지 리스너가 시도될 횟수를 설정할 수 있습니다.

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendShipmentNotification implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * 큐 리스너가 재시도될 최대 횟수입니다.
     *
     * @var int
     */
    public $tries = 5;
}
```

반복 횟수 대신, 리스너가 더 이상 재시도되지 않을 시점을 지정할 수도 있습니다. 리스너가 정해진 시간 내에 무한정 재시도될 수 있도록 하려면, 리스너 클래스에 `retryUntil` 메서드를 추가하세요. 이 메서드는 `DateTime` 인스턴스를 반환해야 합니다.

```php
use DateTime;

/**
 * 리스너가 종료되어야 하는 시각을 지정합니다.
 */
public function retryUntil(): DateTime
{
    return now()->addMinutes(5);
}
```

<a name="specifying-queued-listener-backoff"></a>
#### 큐 리스너 백오프(지연) 시간 지정

예외가 발생한 후 라라벨이 큐 리스너 재시도를 몇 초 후에 할지 지정하고 싶다면, 리스너 클래스에 `backoff` 속성을 선언하면 됩니다.

```php
/**
 * 큐 리스너 재시도까지 대기할 시간(초)입니다.
 *
 * @var int
 */
public $backoff = 3;
```

리스너의 백오프 시간을 더 복잡한 로직으로 계산하고 싶다면, 리스너 클래스에 `backoff` 메서드를 정의하면 됩니다.

```php
/**
 * 큐 리스너 재시도 전 대기 시간(초)을 계산합니다.
 */
public function backoff(): int
{
    return 3;
}
```

"지수(backoff)" 방식으로 각 재시도마다 지연 시간을 점점 늘리고 싶을 때는, `backoff` 메서드에서 배열을 반환하면 간단히 설정할 수 있습니다. 예를 들어, 아래 예시처럼 하면 첫 재시도는 1초, 두 번째는 5초, 세 번째 이후부터는 10초가 각각 지연됩니다.

```php
/**
 * 큐 리스너 재시도 전 대기 시간(초)을 배열로 반환합니다.
 *
 * @return array<int, int>
 */
public function backoff(): array
{
    return [1, 5, 10];
}
```

<a name="dispatching-events"></a>

## 이벤트 디스패치(Dispatching Events)

이벤트를 디스패치(발생)하려면, 해당 이벤트에서 static 메서드인 `dispatch`를 호출하면 됩니다. 이 메서드는 `Illuminate\Foundation\Events\Dispatchable` 트레이트를 이벤트 클래스에 사용할 때 자동으로 제공됩니다. `dispatch` 메서드에 전달하는 모든 인수는 이벤트 생성자에 그대로 전달됩니다.

```php
<?php

namespace App\Http\Controllers;

use App\Events\OrderShipped;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class OrderShipmentController extends Controller
{
    /**
     * Ship the given order.
     */
    public function store(Request $request): RedirectResponse
    {
        $order = Order::findOrFail($request->order_id);

        // Order shipment logic...

        OrderShipped::dispatch($order);

        return redirect('/orders');
    }
}
```

조건에 따라 이벤트를 디스패치하고 싶다면, `dispatchIf`와 `dispatchUnless` 메서드를 사용할 수 있습니다.

```php
OrderShipped::dispatchIf($condition, $order);

OrderShipped::dispatchUnless($condition, $order);
```

> [!NOTE]
> 테스트 시에는 이벤트 리스너가 실제로 실행되지 않으면서, 특정 이벤트가 디스패치되었는지 확인(assert)하는 것이 도움이 될 수 있습니다. 라라벨의 [내장 테스트 헬퍼](#testing)를 사용하면 이를 매우 쉽게 구현할 수 있습니다.

<a name="dispatching-events-after-database-transactions"></a>
### 데이터베이스 트랜잭션 이후에 이벤트 디스패치하기

때로는 현재 진행 중인 데이터베이스 트랜잭션이 커밋된 후에만 이벤트를 디스패치하도록 라라벨에 지시하고 싶을 수 있습니다. 이를 위해 이벤트 클래스에 `ShouldDispatchAfterCommit` 인터페이스를 구현하면 됩니다.

이 인터페이스를 적용하면, 현재 데이터베이스 트랜잭션이 커밋될 때까지 이벤트는 디스패치되지 않습니다. 만일 트랜잭션이 실패하면, 해당 이벤트는 무시되고 실행되지 않습니다. 이벤트가 디스패치될 때 트랜잭션이 없다면, 즉시 이벤트가 디스패치됩니다.

```php
<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderShipped implements ShouldDispatchAfterCommit
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public Order $order,
    ) {}
}
```

<a name="event-subscribers"></a>
## 이벤트 구독자(Event Subscribers)

<a name="writing-event-subscribers"></a>
### 이벤트 구독자 작성하기

이벤트 구독자는 구독자 클래스 내부에서 여러 이벤트를 한 번에 구독할 수 있는 클래스입니다. 즉, 한 클래스에서 여러 개의 이벤트 핸들러(이벤트 처리 메서드)를 정의할 수 있습니다. 구독자 클래스는 반드시 `subscribe` 메서드를 정의해야 하며, 이 메서드에는 이벤트 디스패처(dispatcher) 인스턴스가 전달됩니다. 전달받은 디스패처의 `listen` 메서드를 호출해, 이벤트 리스너(핸들러)를 등록할 수 있습니다.

```php
<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Events\Dispatcher;

class UserEventSubscriber
{
    /**
     * Handle user login events.
     */
    public function handleUserLogin(Login $event): void {}

    /**
     * Handle user logout events.
     */
    public function handleUserLogout(Logout $event): void {}

    /**
     * Register the listeners for the subscriber.
     */
    public function subscribe(Dispatcher $events): void
    {
        $events->listen(
            Login::class,
            [UserEventSubscriber::class, 'handleUserLogin']
        );

        $events->listen(
            Logout::class,
            [UserEventSubscriber::class, 'handleUserLogout']
        );
    }
}
```

이벤트 리스너 메서드가 구독자 클래스 안에 정의되어 있다면, 구독자의 `subscribe` 메서드에서 이벤트와 메서드명을 배열로 반환하는 방법이 더 간편할 수 있습니다. 이 경우 라라벨이 구독자의 클래스명을 자동으로 인식하고 이벤트 리스너를 등록합니다.

```php
<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Events\Dispatcher;

class UserEventSubscriber
{
    /**
     * Handle user login events.
     */
    public function handleUserLogin(Login $event): void {}

    /**
     * Handle user logout events.
     */
    public function handleUserLogout(Logout $event): void {}

    /**
     * Register the listeners for the subscriber.
     *
     * @return array<string, string>
     */
    public function subscribe(Dispatcher $events): array
    {
        return [
            Login::class => 'handleUserLogin',
            Logout::class => 'handleUserLogout',
        ];
    }
}
```

<a name="registering-event-subscribers"></a>
### 이벤트 구독자 등록하기

구독자를 작성한 후, 만약 구독자의 다양한 핸들러 메서드가 라라벨의 [이벤트 자동 탐색 규약](#event-discovery)을 따르고 있다면 라라벨이 자동으로 등록해줍니다. 그렇지 않은 경우, `Event` 파사드의 `subscribe` 메서드를 사용해 구독자를 직접 등록해야 합니다. 일반적으로는 애플리케이션의 `AppServiceProvider` 클래스의 `boot` 메서드에서 아래와 같이 등록합니다.

```php
<?php

namespace App\Providers;

use App\Listeners\UserEventSubscriber;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Event::subscribe(UserEventSubscriber::class);
    }
}
```

<a name="testing"></a>
## 테스트(Testing)

이벤트를 디스패치하는 코드를 테스트할 때는, 실제로 이벤트 리스너가 실행되는 것을 막고 싶을 수 있습니다. 이벤트 리스너의 코드는 별도로 독립적으로 테스트할 수 있으므로, 이벤트를 디스패치하는 코드와 리스너 코드를 분리해서 테스트하는 것이 좋습니다. 물론 리스너 자체를 테스트할 때는 리스너 인스턴스를 직접 생성해 `handle` 메서드를 호출하면 됩니다.

`Event` 파사드의 `fake` 메서드를 사용하면, 리스너를 실제로 실행하지 않고도 테스트를 진행할 수 있습니다. 테스트에서 검증하고 싶은 코드를 실행한 후, 어떤 이벤트가 디스패치되었는지 `assertDispatched`, `assertNotDispatched`, `assertNothingDispatched` 등의 메서드를 사용해 검증할 수 있습니다.

```php tab=Pest
<?php

use App\Events\OrderFailedToShip;
use App\Events\OrderShipped;
use Illuminate\Support\Facades\Event;

test('orders can be shipped', function () {
    Event::fake();

    // Perform order shipping...

    // Assert that an event was dispatched...
    Event::assertDispatched(OrderShipped::class);

    // Assert an event was dispatched twice...
    Event::assertDispatched(OrderShipped::class, 2);

    // Assert an event was not dispatched...
    Event::assertNotDispatched(OrderFailedToShip::class);

    // Assert that no events were dispatched...
    Event::assertNothingDispatched();
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use App\Events\OrderFailedToShip;
use App\Events\OrderShipped;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * Test order shipping.
     */
    public function test_orders_can_be_shipped(): void
    {
        Event::fake();

        // Perform order shipping...

        // Assert that an event was dispatched...
        Event::assertDispatched(OrderShipped::class);

        // Assert an event was dispatched twice...
        Event::assertDispatched(OrderShipped::class, 2);

        // Assert an event was not dispatched...
        Event::assertNotDispatched(OrderFailedToShip::class);

        // Assert that no events were dispatched...
        Event::assertNothingDispatched();
    }
}
```

`assertDispatched`나 `assertNotDispatched` 메서드에는 클로저를 전달하여, 특정 조건을 만족하는 이벤트가 디스패치됐는지를 검증할 수도 있습니다. 클로저에 전달된 이벤트 중 한 건이라도 조건을 통과하면, 해당 어서션은 성공하게 됩니다.

```php
Event::assertDispatched(function (OrderShipped $event) use ($order) {
    return $event->order->id === $order->id;
});
```

특정 이벤트에 대해 지정한 리스너가 실제로 "리스닝(대기)" 상태인지 확인하려면, `assertListening` 메서드를 사용할 수 있습니다.

```php
Event::assertListening(
    OrderShipped::class,
    SendShipmentNotification::class
);
```

> [!WARNING]
> `Event::fake()`를 호출하면, 어떠한 이벤트 리스너도 실행되지 않습니다. 따라서, 만약 테스트에서 팩토리를 사용해 모델을 생성할 때, 모델의 `creating` 이벤트(예: UUID 자동 생성) 등에 의존한다면, 팩토리 사용 이후에 `Event::fake()`를 호출해야 합니다.

<a name="faking-a-subset-of-events"></a>
### 일부 이벤트만 페이크로 처리하기

특정 이벤트만 페이크(fake)로 처리하고 싶다면, 해당 이벤트를 배열로 `fake` 혹은 `fakeFor` 메서드에 전달하면 됩니다.

```php tab=Pest
test('orders can be processed', function () {
    Event::fake([
        OrderCreated::class,
    ]);

    $order = Order::factory()->create();

    Event::assertDispatched(OrderCreated::class);

    // Other events are dispatched as normal...
    $order->update([...]);
});
```

```php tab=PHPUnit
/**
 * Test order process.
 */
public function test_orders_can_be_processed(): void
{
    Event::fake([
        OrderCreated::class,
    ]);

    $order = Order::factory()->create();

    Event::assertDispatched(OrderCreated::class);

    // Other events are dispatched as normal...
    $order->update([...]);
}
```

특정 이벤트만 제외하고 나머지 모든 이벤트를 페이크로 처리하려면, `except` 메서드를 사용할 수 있습니다.

```php
Event::fake()->except([
    OrderCreated::class,
]);
```

<a name="scoped-event-fakes"></a>
### 범위 기반(Scoped) 이벤트 페이크

테스트의 특정 구간에서만 이벤트 리스너를 페이크로 처리하고 싶다면, `fakeFor` 메서드를 사용할 수 있습니다.

```php tab=Pest
<?php

use App\Events\OrderCreated;
use App\Models\Order;
use Illuminate\Support\Facades\Event;

test('orders can be processed', function () {
    $order = Event::fakeFor(function () {
        $order = Order::factory()->create();

        Event::assertDispatched(OrderCreated::class);

        return $order;
    });

    // Events are dispatched as normal and observers will run ...
    $order->update([...]);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use App\Events\OrderCreated;
use App\Models\Order;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * Test order process.
     */
    public function test_orders_can_be_processed(): void
    {
        $order = Event::fakeFor(function () {
            $order = Order::factory()->create();

            Event::assertDispatched(OrderCreated::class);

            return $order;
        });

        // Events are dispatched as normal and observers will run ...
        $order->update([...]);
    }
}
```