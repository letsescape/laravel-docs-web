# 이벤트 (Events)

- [소개](#introduction)
- [이벤트와 리스너 생성하기](#generating-events-and-listeners)
- [이벤트와 리스너 등록하기](#registering-events-and-listeners)
    - [이벤트 자동 탐색](#event-discovery)
    - [이벤트 수동 등록하기](#manually-registering-events)
    - [클로저 리스너](#closure-listeners)
- [이벤트 정의하기](#defining-events)
- [리스너 정의하기](#defining-listeners)
- [큐잉된(Queued) 이벤트 리스너](#queued-event-listeners)
    - [큐 직접 다루기](#manually-interacting-with-the-queue)
    - [큐잉된 이벤트 리스너와 데이터베이스 트랜잭션](#queued-event-listeners-and-database-transactions)
    - [실패한 작업 처리하기](#handling-failed-jobs)
- [이벤트 디스패치하기](#dispatching-events)
    - [데이터베이스 트랜잭션 커밋 후 이벤트 디스패치](#dispatching-events-after-database-transactions)
- [이벤트 구독자](#event-subscribers)
    - [이벤트 구독자 작성하기](#writing-event-subscribers)
    - [이벤트 구독자 등록하기](#registering-event-subscribers)
- [테스트](#testing)
    - [일부 이벤트만 페이크하기](#faking-a-subset-of-events)
    - [범위 지정 이벤트 페이크](#scoped-event-fakes)

<a name="introduction"></a>
## 소개

라라벨의 이벤트는 옵저버 패턴(Observer pattern)을 간단하게 구현할 수 있게 해주며, 애플리케이션에서 발생하는 다양한 이벤트를 구독하고 청취(listen)할 수 있습니다. 이벤트 클래스는 일반적으로 `app/Events` 디렉터리에, 리스너는 `app/Listeners` 디렉터리에 위치합니다. 만약 이 디렉터리가 애플리케이션에 없다면 Artisan 콘솔 명령어를 사용해 이벤트와 리스너를 생성할 때 자동으로 만들어집니다.

이벤트는 애플리케이션의 여러 부분을 느슨하게 결합(loose coupling)하는 데 유용합니다. 하나의 이벤트에 의존하지 않는 여러 리스너를 연결할 수 있기 때문입니다. 예를 들어, 주문이 발송될 때마다 사용자에게 Slack 알림을 보내고 싶다고 가정해봅시다. 주문 처리 코드와 Slack 알림 코드를 직접 연결하지 않고도, `App\Events\OrderShipped` 이벤트를 발생시키면, 리스너가 이 이벤트를 받아 Slack 알림을 전송할 수 있습니다.

<a name="generating-events-and-listeners"></a>
## 이벤트와 리스너 생성하기

이벤트와 리스너를 빠르게 생성하려면 `make:event` 와 `make:listener` Artisan 명령어를 사용할 수 있습니다.

```shell
php artisan make:event PodcastProcessed

php artisan make:listener SendPodcastNotification --event=PodcastProcessed
```

더 간편하게 명령어에 추가 인수를 전달하지 않고 실행할 수도 있습니다. 이 경우, 라라벨이 클래스명을 입력하라고 물으며, 리스너를 생성할 때는 어떤 이벤트를 청취할지 입력하라고 안내합니다.

```shell
php artisan make:event

php artisan make:listener
```

<a name="registering-events-and-listeners"></a>
## 이벤트와 리스너 등록하기

<a name="event-discovery"></a>
### 이벤트 자동 탐색

기본적으로 라라벨은 애플리케이션의 `Listeners` 디렉터리를 스캔하여 이벤트 리스너를 자동으로 탐색하고 등록합니다. 클래스의 메서드명이 `handle` 또는 `__invoke`로 시작한다면, 라라벨은 해당 메서드의 시그니처에 타입힌트된 이벤트를 리스너로 등록합니다.

```php
use App\Events\PodcastProcessed;

class SendPodcastNotification
{
    /**
     * Handle the given event.
     */
    public function handle(PodcastProcessed $event): void
    {
        // ...
    }
}
```

PHP의 유니온 타입을 활용하여 여러 이벤트를 동시에 감지할 수도 있습니다.

```php
/**
 * Handle the given event.
 */
public function handle(PodcastProcessed|PodcastPublished $event): void
{
    // ...
}
```

리스너를 다른 디렉터리 또는 여러 디렉터리에 저장하려는 경우, 애플리케이션의 `bootstrap/app.php` 파일에서 `withEvents` 메서드를 사용해 라라벨이 해당 디렉터리를 스캔하도록 지정할 수 있습니다.

```php
->withEvents(discover: [
    __DIR__.'/../app/Domain/Orders/Listeners',
])
```

`*` 문자를 와일드카드로 사용해 유사 디렉터리 여러 곳을 한 번에 스캔할 수도 있습니다.

```php
->withEvents(discover: [
    __DIR__.'/../app/Domain/*/Listeners',
])
```

`event:list` 명령어를 사용하면 현재 애플리케이션에 등록된 모든 리스너 목록을 볼 수 있습니다.

```shell
php artisan event:list
```

<a name="event-discovery-in-production"></a>
#### 운영 환경에서의 이벤트 탐색

애플리케이션의 성능을 높이려면, `optimize` 또는 `event:cache` Artisan 명령어를 이용해 모든 리스너의 매니페스트를 캐싱해야 합니다. 이 명령어는 일반적으로 [배포 프로세스](/docs/deployment#optimization)에서 실행하는 것이 좋습니다. 캐시된 매니페스트는 프레임워크가 이벤트 등록을 더 빠르게 처리하도록 돕습니다. 이벤트 캐시를 삭제하려면 `event:clear` 명령어를 사용하면 됩니다.

<a name="manually-registering-events"></a>
### 이벤트 수동 등록하기

`Event` 파사드를 이용하면, 애플리케이션의 `AppServiceProvider`의 `boot` 메서드 안에서 이벤트와 대응되는 리스너를 직접 등록할 수 있습니다.

```php
use App\Domain\Orders\Events\PodcastProcessed;
use App\Domain\Orders\Listeners\SendPodcastNotification;
use Illuminate\Support\Facades\Event;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Event::listen(
        PodcastProcessed::class,
        SendPodcastNotification::class,
    );
}
```

`event:list` 명령어로 현재 애플리케이션에 등록된 리스너를 모두 확인할 수 있습니다.

```shell
php artisan event:list
```

<a name="closure-listeners"></a>
### 클로저 리스너

보통 리스너는 클래스로 정의하지만, `AppServiceProvider`의 `boot` 메서드에서 클로저(closure)로 리스너를 직접 등록하는 것도 가능합니다.

```php
use App\Events\PodcastProcessed;
use Illuminate\Support\Facades\Event;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Event::listen(function (PodcastProcessed $event) {
        // ...
    });
}
```

<a name="queuable-anonymous-event-listeners"></a>
#### 큐잉 가능한 익명 이벤트 리스너

클로저 기반 이벤트 리스너를 등록할 때, `Illuminate\Events\queueable` 함수를 사용해 리스너를 [큐](/docs/queues)에서 실행하도록 지정할 수 있습니다.

```php
use App\Events\PodcastProcessed;
use function Illuminate\Events\queueable;
use Illuminate\Support\Facades\Event;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Event::listen(queueable(function (PodcastProcessed $event) {
        // ...
    }));
}
```

큐에 등록되는 작업처럼, `onConnection`, `onQueue`, `delay` 메서드로 큐 옵션을 설정할 수 있습니다.

```php
Event::listen(queueable(function (PodcastProcessed $event) {
    // ...
})->onConnection('redis')->onQueue('podcasts')->delay(now()->addSeconds(10)));
```

익명 큐 리스너에서 실패 처리도 가능합니다. `queueable` 리스너 정의 시 `catch` 메서드에 클로저를 넘기면, 리스너 실패시 해당 이벤트 인스턴스와 예외가 전달됩니다.

```php
use App\Events\PodcastProcessed;
use function Illuminate\Events\queueable;
use Illuminate\Support\Facades\Event;
use Throwable;

Event::listen(queueable(function (PodcastProcessed $event) {
    // ...
})->catch(function (PodcastProcessed $event, Throwable $e) {
    // 큐 리스너가 실패한 경우...
}));
```

<a name="wildcard-event-listeners"></a>
#### 와일드카드 이벤트 리스너

`*` 문자를 와일드카드 파라미터로 활용하면 동일한 리스너로 여러 이벤트를 한 번에 감지할 수도 있습니다. 와일드카드 리스너는 첫 번째 인수로 이벤트 이름, 두 번째 인수로 전체 이벤트 데이터 배열을 받습니다.

```php
Event::listen('event.*', function (string $eventName, array $data) {
    // ...
});
```

<a name="defining-events"></a>
## 이벤트 정의하기

이벤트 클래스는 이벤트와 관련된 데이터를 담는 컨테이너 역할을 합니다. 예를 들어, `App\Events\OrderShipped` 이벤트가 [Eloquent ORM](/docs/eloquent) 오브젝트를 전달받는다고 가정해봅니다.

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
     * Create a new event instance.
     */
    public function __construct(
        public Order $order,
    ) {}
}
```

보시다시피 이벤트 클래스 자체에 별다른 로직은 없습니다. 구매된 `App\Models\Order` 인스턴스를 담는 역할입니다. 이벤트에서 사용하는 `SerializesModels` 트레이트는 이벤트 오브젝트가 PHP의 `serialize` 함수로 직렬화될 때(예: [큐잉된 리스너](#queued-event-listeners) 사용 시) Eloquent 모델을 자동으로 적절히 직렬화해줍니다.

<a name="defining-listeners"></a>
## 리스너 정의하기

이제 예제 이벤트에 대응되는 리스너를 살펴보겠습니다. 리스너 클래스는 `handle` 메서드로 이벤트 인스턴스를 전달받습니다. `make:listener` Artisan 명령어를 `--event` 옵션과 함께 실행하면 이벤트 클래스가 자동으로 임포트되고, `handle` 메서드에도 올바르게 타입힌트가 추가됩니다. `handle` 메서드에서는 이벤트에 대해 필요한 작업을 자유롭게 하시면 됩니다.

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;

class SendShipmentNotification
{
    /**
     * Create the event listener.
     */
    public function __construct() {}

    /**
     * Handle the event.
     */
    public function handle(OrderShipped $event): void
    {
        // $event->order를 이용해 주문 접근...
    }
}
```

> [!NOTE]
> 이벤트 리스너의 생성자에서 추가적인 의존성을 타입힌트로 지정할 수도 있습니다. 모든 이벤트 리스너는 라라벨 [서비스 컨테이너](/docs/container)에서 해석되므로, 의존성 주입이 자동 지원됩니다.

<a name="stopping-the-propagation-of-an-event"></a>
#### 이벤트 전파(Propagation) 중단하기

때로는 한 이벤트에 여러 리스너가 연결되어 있을 때, 특정 리스너에서 더 이상 이후 리스너로 이벤트가 전달되지 않도록 막고 싶을 수 있습니다. 이런 경우, 리스너의 `handle` 메서드에서 `false`를 반환하면 이벤트 전파가 중단됩니다.

<a name="queued-event-listeners"></a>
## 큐잉된(Queued) 이벤트 리스너

리스너가 이메일 발송이나 외부 HTTP 요청처럼 시간이 오래 걸리는 작업을 수행한다면, 큐잉하는 것이 유리합니다. 큐잉된 리스너를 사용하려면 [큐를 설정](/docs/queues)하고, 서버나 로컬 개발 환경에서 큐 워커를 구동해야 합니다.

리스너가 큐에 맡겨지도록 하려면, 해당 리스너 클래스에 `ShouldQueue` 인터페이스를 추가하면 됩니다. `make:listener` Artisan 명령어로 생성한 리스너에는 이 인터페이스를 즉시 사용할 수 있도록 자동 임포트되어 있습니다.

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

이제 이 리스너가 처리하는 이벤트가 발생하면, 이벤트 디스패처가 자동으로 이 리스너를 라라벨의 [큐 시스템](/docs/queues)에 큐잉합니다. 큐에서 리스너가 정상적으로 실행되면, 해당 작업은 자동으로 삭제됩니다.

<a name="customizing-the-queue-connection-queue-name"></a>
#### 큐 연결, 큐 이름, 지연 시간(custom delay) 지정

이벤트 리스너가 사용할 큐 연결, 큐 이름(queue), 대기(delay) 시간을 직접 지정할 수도 있습니다. 이를 위해 리스너 클래스에 `$connection`, `$queue`, `$delay` 속성을 추가합니다.

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendShipmentNotification implements ShouldQueue
{
    /**
     * The name of the connection the job should be sent to.
     *
     * @var string|null
     */
    public $connection = 'sqs';

    /**
     * The name of the queue the job should be sent to.
     *
     * @var string|null
     */
    public $queue = 'listeners';

    /**
     * The time (seconds) before the job should be processed.
     *
     * @var int
     */
    public $delay = 60;
}
```

큐 연결, 큐 이름, 대기 시간을 실행 중 동적으로 지정하려면 `viaConnection`, `viaQueue`, `withDelay` 메서드를 추가하면 됩니다.

```php
/**
 * Get the name of the listener's queue connection.
 */
public function viaConnection(): string
{
    return 'sqs';
}

/**
 * Get the name of the listener's queue.
 */
public function viaQueue(): string
{
    return 'listeners';
}

/**
 * Get the number of seconds before the job should be processed.
 */
public function withDelay(OrderShipped $event): int
{
    return $event->highPriority ? 0 : 60;
}
```

<a name="conditionally-queueing-listeners"></a>
#### 리스너의 큐잉 조건 지정

런타임 데이터에 따라 리스너가 큐에 넣어질지 여부를 동적으로 판단해야 할 때가 있습니다. 이럴 때는 리스너에 `shouldQueue` 메서드를 정의하면 됩니다. 만약 `shouldQueue` 메서드가 `false`를 반환하면, 해당 리스너는 큐에 들어가지 않습니다.

```php
<?php

namespace App\Listeners;

use App\Events\OrderCreated;
use Illuminate\Contracts\Queue\ShouldQueue;

class RewardGiftCard implements ShouldQueue
{
    /**
     * Reward a gift card to the customer.
     */
    public function handle(OrderCreated $event): void
    {
        // ...
    }

    /**
     * Determine whether the listener should be queued.
     */
    public function shouldQueue(OrderCreated $event): bool
    {
        return $event->order->subtotal >= 5000;
    }
}
```

<a name="manually-interacting-with-the-queue"></a>
### 큐 직접 다루기

리스너가 큐 작업의 `delete`나 `release` 메서드에 직접 접근해야 할 경우, `Illuminate\Queue\InteractsWithQueue` 트레이트를 사용하면 됩니다. Artisan으로 생성한 리스너에는 이 트레이트가 자동으로 포함되어 있습니다.

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
     * Handle the event.
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
### 큐잉된 이벤트 리스너와 데이터베이스 트랜잭션

큐잉된 리스너가 데이터베이스 트랜잭션 중에 디스패치되면, 트랜잭션이 커밋되기 전에 큐에서 리스너가 처리될 수도 있습니다. 이렇게 되면 트랜잭션 내에서 변경된 모델이나 데이터베이스 레코드는 아직 실제로 데이터베이스에 반영되지 않았을 수 있습니다. 또한 트랜잭션 중에 새로 생성한 모델이나 레코드가 아직 존재하지 않을 수도 있습니다. 만약 리스너가 이런 모델에 의존한다면, 큐에서 해당 작업이 실행될 때 예기치 않은 오류가 발생할 수 있습니다.

큐 연결의 `after_commit` 설정이 `false`라면, 특정 큐잉된 리스너만 트랜잭션 커밋 이후 실행되도록 하려면 리스너 클래스에 `ShouldQueueAfterCommit` 인터페이스를 구현하면 됩니다.

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
> 이와 관련된 자세한 안내는 [큐 작업과 데이터베이스 트랜잭션](/docs/queues#jobs-and-database-transactions) 문서를 참고하시기 바랍니다.

<a name="handling-failed-jobs"></a>
### 실패한 작업 처리하기

큐잉된 이벤트 리스너가 실패할 수도 있습니다. 큐에서 리스너가 지정된 최대 시도 횟수만큼 실행된 뒤에도 작업이 성공하지 않으면, 리스너의 `failed` 메서드가 호출됩니다. 이 메서드에는 이벤트 인스턴스와 실패 원인이 된 예외(throwable)가 전달됩니다.

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
     * Handle the event.
     */
    public function handle(OrderShipped $event): void
    {
        // ...
    }

    /**
     * Handle a job failure.
     */
    public function failed(OrderShipped $event, Throwable $exception): void
    {
        // ...
    }
}
```

<a name="specifying-queued-listener-maximum-attempts"></a>
#### 큐 리스너 최대 시도 횟수 지정

큐잉된 리스너에서 에러가 반복적으로 발생한다면, 무한정 재시도하는 것을 방지하고 싶을 것입니다. 라라벨은 리스너가 몇 번까지(또는 얼마 동안) 시도될 수 있는지를 지정할 수 있는 여러 방법을 제공합니다.

리스너 클래스에 `$tries` 속성을 지정하면, 해당 리스너는 정해진 횟수만큼 시도한 후 실패로 처리됩니다.

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
     * The number of times the queued listener may be attempted.
     *
     * @var int
     */
    public $tries = 5;
}
```

정확히 몇 번 시도할지 대신, 지정한 시각 이후로는 더 이상 시도하지 않도록 할 수도 있습니다. 이를 위해 `retryUntil` 메서드를 리스너에 추가하면 됩니다. 이 메서드는 `DateTime` 인스턴스를 반환해야 합니다.

```php
use DateTime;

/**
 * Determine the time at which the listener should timeout.
 */
public function retryUntil(): DateTime
{
    return now()->addMinutes(5);
}
```

<a name="specifying-queued-listener-backoff"></a>
#### 큐 리스너 백오프(Backoff) 지정

예외가 발생한 큐 리스너를 다시 재시도하기까지 대기할 시간을 지정하려면, 리스너 클래스에 `backoff` 속성을 추가하면 됩니다.

```php
/**
 * The number of seconds to wait before retrying the queued listener.
 *
 * @var int
 */
public $backoff = 3;
```

더 복잡한 백오프 로직이 필요하다면, `backoff` 메서드를 정의할 수도 있습니다.

```php
/**
 * Calculate the number of seconds to wait before retrying the queued listener.
 */
public function backoff(): int
{
    return 3;
}
```

"지수적(backoff)" 방식의 백오프도 쉽게 설정할 수 있습니다. `backoff` 메서드에서 배열을 반환하면, 첫 번째 재시도는 1초, 두 번째는 5초, 세 번째는 10초, 그 이후에는 10초 간격으로 재시도합니다.

```php
/**
 * Calculate the number of seconds to wait before retrying the queued listener.
 *
 * @return array<int, int>
 */
public function backoff(): array
{
    return [1, 5, 10];
}
```

<a name="dispatching-events"></a>
## 이벤트 디스패치하기

이벤트를 발생시키려면, 이벤트 클래스에서 정적 메서드인 `dispatch`를 호출하면 됩니다. 이 메서드는 `Illuminate\Foundation\Events\Dispatchable` 트레이트를 통해 이벤트 클래스에 추가됩니다. `dispatch` 메서드에 전달한 인수들은 이벤트의 생성자로 그대로 전달됩니다.

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

        // 주문 배송 처리 로직...

        OrderShipped::dispatch($order);

        return redirect('/orders');
    }
}
```

조건적으로 이벤트를 디스패치하고 싶다면 `dispatchIf`와 `dispatchUnless` 메서드를 사용할 수 있습니다.

```php
OrderShipped::dispatchIf($condition, $order);

OrderShipped::dispatchUnless($condition, $order);
```

> [!NOTE]
> 테스트 시, 실제로 리스너를 실행시키지 않고 특정 이벤트가 발생했는지만 확인하고 싶을 때가 있습니다. 라라벨의 [테스트 헬퍼](#testing)를 이용하면 쉽게 처리할 수 있습니다.

<a name="dispatching-events-after-database-transactions"></a>
### 데이터베이스 트랜잭션 커밋 후 이벤트 디스패치

때로는 현재 진행 중인 데이터베이스 트랜잭션이 커밋된 이후에만 이벤트를 디스패치하고 싶을 수 있습니다. 이럴 땐 이벤트 클래스에 `ShouldDispatchAfterCommit` 인터페이스를 구현하면 됩니다.

이 인터페이스를 사용하면, 현재 트랜잭션이 커밋될 때까지 라라벨이 이벤트 디스패치를 미루고, 커밋에 실패하면 이벤트가 폐기됩니다. 만약 이벤트를 디스패치할 때 트랜잭션이 없다면, 이벤트는 즉시 디스패치됩니다.

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
## 이벤트 구독자

<a name="writing-event-subscribers"></a>
### 이벤트 구독자 작성하기

이벤트 구독자(subscriber)는 하나의 클래스에서 여러 이벤트를 구독할 수 있으며, 한 클래스에서 여러 이벤트 핸들러를 정의할 수 있습니다. 구독자 클래스에는 반드시 `subscribe` 메서드가 정의되어야 하며, 이 메서드에는 이벤트 디스패처 인스턴스가 전달됩니다. 전달받은 디스패처에서 `listen` 메서드를 호출해 이벤트 리스너를 등록할 수 있습니다.

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

리스너 메서드가 구독자 클래스 내에 정의되어 있다면, `subscribe` 메서드에서 이벤트와 메서드명을 배열 형태로 반환해 좀 더 간단하게 등록할 수도 있습니다. 라라벨이 리스너 등록 시 구독자 클래스명을 자동으로 추론합니다.

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

구독자를 작성한 후, 구독자 메서드명이 라라벨 [이벤트 탐색 규칙](#event-discovery)을 따르고 있다면 라라벨이 자동으로 구독자를 등록합니다. 그렇지 않은 경우에는 `Event` 파사드의 `subscribe` 메서드로 수동 등록할 수 있습니다. 일반적으로 이 처리는 애플리케이션의 `AppServiceProvider`의 `boot` 메서드 안에서 이루어집니다.

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
## 테스트

이벤트를 디스패치하는 코드를 테스트할 때, 이벤트의 리스너 코드가 실제로 실행되는 것을 막고 싶을 때가 있습니다. 리스너의 동작은 별도로 유닛 테스트할 수 있기 때문입니다. 리스너 자체를 테스트하고자 할 때는 테스트 코드에서 리스너 인스턴스를 생성한 뒤 직접 `handle` 메서드를 호출하면 됩니다.

`Event` 파사드의 `fake` 메서드를 사용하면 리스너 실행을 차단하고, 테스트하려는 코드가 이벤트를 발생시키는지 `assertDispatched`, `assertNotDispatched`, `assertNothingDispatched` 메서드로 검증할 수 있습니다.

```php tab=Pest
<?php

use App\Events\OrderFailedToShip;
use App\Events\OrderShipped;
use Illuminate\Support\Facades\Event;

test('orders can be shipped', function () {
    Event::fake();

    // 주문 배송 수행...

    // 이벤트가 발생했는지(assertDispatched) 확인...
    Event::assertDispatched(OrderShipped::class);

    // 같은 이벤트가 두 번 발생했는지 확인...
    Event::assertDispatched(OrderShipped::class, 2);

    // 특정 이벤트가 발생하지 않았는지 확인...
    Event::assertNotDispatched(OrderFailedToShip::class);

    // 이벤트가 전혀 발생하지 않았는지 확인...
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

        // 주문 배송 수행...

        // 이벤트가 발생했는지(assertDispatched) 확인...
        Event::assertDispatched(OrderShipped::class);

        // 같은 이벤트가 두 번 발생했는지 확인...
        Event::assertDispatched(OrderShipped::class, 2);

        // 특정 이벤트가 발생하지 않았는지 확인...
        Event::assertNotDispatched(OrderFailedToShip::class);

        // 이벤트가 전혀 발생하지 않았는지 확인...
        Event::assertNothingDispatched();
    }
}
```

`assertDispatched` 또는 `assertNotDispatched` 메서드에 클로저를 전달하면, 특정 조건을 만족하는 이벤트가 발생했는지 검사할 수 있습니다. 조건을 만족하는 이벤트가 한 번이라도 디스패치되었다면 이 검증은 통과합니다.

```php
Event::assertDispatched(function (OrderShipped $event) use ($order) {
    return $event->order->id === $order->id;
});
```

특정 이벤트에 리스너가 올바로 연결되어 있는지만 확인하고 싶을 땐 `assertListening` 메서드를 사용할 수 있습니다.

```php
Event::assertListening(
    OrderShipped::class,
    SendShipmentNotification::class
);
```

> [!WARNING]
> `Event::fake()`를 호출하면 이벤트 리스너가 실행되지 않습니다. 따라서, 모델 팩토리에서 모델의 `creating` 이벤트를 활용해 UUID 생성 등 이벤트가 필요한 로직이 있을 경우, 팩토리 사용 이후에 `Event::fake()`를 호출해야 합니다.

<a name="faking-a-subset-of-events"></a>
### 일부 이벤트만 페이크하기

특정 이벤트에 대해서만 리스너 실행을 차단하고 싶을 때, `fake` 또는 `fakeFor` 메서드에 해당 이벤트 클래스 목록을 인수로 넘기면 됩니다.

```php tab=Pest
test('orders can be processed', function () {
    Event::fake([
        OrderCreated::class,
    ]);

    $order = Order::factory()->create();

    Event::assertDispatched(OrderCreated::class);

    // 다른 이벤트는 평소처럼 디스패치됩니다...
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

    // 다른 이벤트는 평소처럼 디스패치됩니다...
    $order->update([...]);
}
```

반대로, 일부 이벤트만을 제외하고 모두 페이크하려면 `except` 메서드를 사용하면 됩니다.

```php
Event::fake()->except([
    OrderCreated::class,
]);
```

<a name="scoped-event-fakes"></a>
### 범위 지정 이벤트 페이크

테스트의 일부 구간에서만 이벤트 리스너를 페이크하고 싶다면, `fakeFor` 메서드를 활용할 수 있습니다.

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

    // 이제 이벤트는 평소처럼 디스패치되고, 옵저버도 동작합니다...
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

        // 이제 이벤트는 평소처럼 디스패치되고, 옵저버도 동작합니다...
        $order->update([...]);
    }
}
```
