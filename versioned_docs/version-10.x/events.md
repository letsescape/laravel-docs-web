# 이벤트 (Events)

- [소개](#introduction)
- [이벤트와 리스너 등록하기](#registering-events-and-listeners)
    - [이벤트 및 리스너 생성하기](#generating-events-and-listeners)
    - [이벤트 수동 등록하기](#manually-registering-events)
    - [이벤트 자동 감지(Event Discovery)](#event-discovery)
- [이벤트 정의하기](#defining-events)
- [리스너 정의하기](#defining-listeners)
- [큐 처리되는(Queued) 이벤트 리스너](#queued-event-listeners)
    - [큐 직접 다루기](#manually-interacting-with-the-queue)
    - [이벤트 리스너와 DB 트랜잭션](#queued-event-listeners-and-database-transactions)
    - [실패한 작업 처리하기](#handling-failed-jobs)
- [이벤트 디스패치(발생)하기](#dispatching-events)
    - [DB 트랜잭션 후 이벤트 디스패치](#dispatching-events-after-database-transactions)
- [이벤트 구독자(Event Subscribers)](#event-subscribers)
    - [이벤트 구독자 작성하기](#writing-event-subscribers)
    - [이벤트 구독자 등록하기](#registering-event-subscribers)
- [테스트하기](#testing)
    - [일부 이벤트만 페이크 처리하기](#faking-a-subset-of-events)
    - [범위 지정 이벤트 페이크(Scoped Event Fakes)](#scoped-event-fakes)

<a name="introduction"></a>
## 소개

라라벨의 이벤트 기능은 단순한 옵저버 패턴을 구현합니다. 이를 통해 애플리케이션 내에서 발생하는 다양한 이벤트를 구독하고, 해당 이벤트에 대해 리스너를 등록할 수 있습니다. 이벤트 클래스는 일반적으로 `app/Events` 디렉터리에, 리스너는 `app/Listeners` 디렉터리에 저장합니다. 만약 애플리케이션 내에 이러한 디렉터리가 아직 없다면, Artisan 콘솔 명령어로 이벤트나 리스너를 생성할 때 자동으로 만들어집니다.

이벤트는 애플리케이션의 다양한 부분을 느슨하게 결합(Decouple)할 수 있게 해줍니다. 하나의 이벤트에 여러 개의 리스너가 등록될 수 있으며, 이들은 서로에게 의존하지 않습니다. 예를 들어, 주문이 발송될 때마다 유저에게 Slack 알림을 보내고 싶다고 가정해 봅시다. 주문 처리 코드와 Slack 알림 코드를 직접 연결하는 대신, `App\Events\OrderShipped`와 같은 이벤트를 발생시키고, 해당 이벤트를 수신하는 리스너에서 Slack 알림을 전송할 수 있습니다.

<a name="registering-events-and-listeners"></a>
## 이벤트와 리스너 등록하기

라라벨 애플리케이션에 포함된 `App\Providers\EventServiceProvider`는 이벤트 리스너를 등록하기 위한 편리한 공간을 제공합니다. 이 클래스의 `listen` 속성에는 모든 이벤트(키)와 그에 대응하는 리스너(값) 배열이 선언되어 있습니다. 애플리케이션에 필요한 만큼의 이벤트와 리스너를 자유롭게 추가할 수 있습니다. 예를 들어, `OrderShipped` 이벤트를 등록해봅시다:

```
use App\Events\OrderShipped;
use App\Listeners\SendShipmentNotification;

/**
 * The event listener mappings for the application.
 *
 * @var array<class-string, array<int, class-string>>
 */
protected $listen = [
    OrderShipped::class => [
        SendShipmentNotification::class,
    ],
];
```

> [!NOTE]
> `event:list` 명령어를 사용하면 애플리케이션에 등록된 모든 이벤트와 리스너를 한눈에 확인할 수 있습니다.

<a name="generating-events-and-listeners"></a>
### 이벤트 및 리스너 생성하기

이벤트와 리스너 파일을 일일이 수동으로 생성하는 것은 번거로운 작업입니다. 대신, 리스너와 이벤트를 `EventServiceProvider`에 미리 추가해둔 뒤, `event:generate` Artisan 명령어를 사용해보세요. 이 명령어는 `EventServiceProvider`에 명시만 해두고 파일이 아직 없는 이벤트나 리스너 파일을 자동으로 생성해줍니다:

```shell
php artisan event:generate
```

또는, 개별적으로 이벤트 및 리스너 파일을 생성하고 싶다면 `make:event`, `make:listener` Artisan 명령어를 사용할 수 있습니다:

```shell
php artisan make:event PodcastProcessed

php artisan make:listener SendPodcastNotification --event=PodcastProcessed
```

<a name="manually-registering-events"></a>
### 이벤트 수동 등록하기

일반적으로는 `EventServiceProvider`의 `$listen` 배열을 통해 이벤트를 등록하지만, 때로는 클래스나 클로저 기반의 이벤트 리스너를 직접 등록해야 할 수도 있습니다. 이럴 땐 `EventServiceProvider`의 `boot` 메서드에서 이벤트를 수동으로 등록할 수 있습니다:

```
use App\Events\PodcastProcessed;
use App\Listeners\SendPodcastNotification;
use Illuminate\Support\Facades\Event;

/**
 * Register any other events for your application.
 */
public function boot(): void
{
    Event::listen(
        PodcastProcessed::class,
        SendPodcastNotification::class,
    );

    Event::listen(function (PodcastProcessed $event) {
        // ...
    });
}
```

<a name="queuable-anonymous-event-listeners"></a>
#### 큐 처리 가능한(Queueable) 익명 이벤트 리스너

클로저 기반의 이벤트 리스너를 직접 등록할 때, `Illuminate\Events\queueable` 함수를 사용하면 해당 리스너를 [큐](/docs/10.x/queues)로 처리하도록 지정할 수 있습니다:

```
use App\Events\PodcastProcessed;
use function Illuminate\Events\queueable;
use Illuminate\Support\Facades\Event;

/**
 * Register any other events for your application.
 */
public function boot(): void
{
    Event::listen(queueable(function (PodcastProcessed $event) {
        // ...
    }));
}
```

큐 작업과 마찬가지로, `onConnection`, `onQueue`, `delay` 메서드를 활용해 큐 리스너의 실행 방식도 자유롭게 지정할 수 있습니다:

```
Event::listen(queueable(function (PodcastProcessed $event) {
    // ...
})->onConnection('redis')->onQueue('podcasts')->delay(now()->addSeconds(10)));
```

익명 큐 리스너에서 에러가 발생했을 때 직접 처리하고 싶다면, `queueable` 리스너를 정의할 때 `catch` 메서드에 클로저를 전달할 수 있습니다. 이 클로저는 이벤트 인스턴스와 예외 인스턴스를 전달받습니다:

```
use App\Events\PodcastProcessed;
use function Illuminate\Events\queueable;
use Illuminate\Support\Facades\Event;
use Throwable;

Event::listen(queueable(function (PodcastProcessed $event) {
    // ...
})->catch(function (PodcastProcessed $event, Throwable $e) {
    // 큐 리스너 처리 실패 시 실행...
}));
```

<a name="wildcard-event-listeners"></a>
#### 와일드카드(Wildcard) 이벤트 리스너

리스너를 등록할 때 `*` 문자를 와일드카드로 사용할 수도 있습니다. 이렇게 하면 하나의 리스너에서 여러 이벤트를 한 번에 처리할 수 있습니다. 와일드카드 리스너는 첫 번째 인자로 이벤트 이름, 두 번째 인자로 전체 이벤트 데이터 배열을 전달받습니다:

```
Event::listen('event.*', function (string $eventName, array $data) {
    // ...
});
```

<a name="event-discovery"></a>
### 이벤트 자동 감지(Event Discovery)

이벤트와 리스너를 `$listen` 배열에 수동으로 등록하지 않고, 자동 감지 기능을 활용할 수도 있습니다. 이벤트 자동 감지(Event Discovery)를 활성화하면 라라벨이 애플리케이션의 `Listeners` 디렉터리를 스캔하여 이벤트와 리스너를 자동으로 찾아 등록합니다. 물론, `EventServiceProvider`에서 명시적으로 등록한 이벤트는 그대로 등록됩니다.

라라벨은 PHP의 리플렉션(reflection) 기능을 사용해 리스너 클래스를 스캔합니다. 각 리스너 클래스에서 `handle` 또는 `__invoke`로 시작하는 메서드를 발견하면, 메서드 시그니처에서 타입 힌트된 이벤트에 해당 메서드를 리스너로 등록합니다:

```
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

이벤트 자동 감지는 기본적으로 비활성화되어 있습니다. 활성화하려면 애플리케이션의 `EventServiceProvider`에서 `shouldDiscoverEvents` 메서드를 오버라이드하여 `true`를 반환하면 됩니다:

```
/**
 * Determine if events and listeners should be automatically discovered.
 */
public function shouldDiscoverEvents(): bool
{
    return true;
}
```

기본적으로 애플리케이션의 `app/Listeners` 디렉터리만 감지 대상으로 스캔되지만, 추가적으로 스캔할 디렉터리를 지정하려면 `EventServiceProvider`의 `discoverEventsWithin` 메서드를 오버라이드할 수 있습니다:

```
/**
 * Get the listener directories that should be used to discover events.
 *
 * @return array<int, string>
 */
protected function discoverEventsWithin(): array
{
    return [
        $this->app->path('Listeners'),
    ];
}
```

<a name="event-discovery-in-production"></a>
#### 운영 환경에서의 이벤트 자동 감지

운영(Production) 환경에서는 모든 요청마다 전체 리스너를 스캔하는 것은 효율적이지 않습니다. 따라서 배포 과정에서 `event:cache` Artisan 명령어로 이벤트와 리스너의 목록(매니페스트)을 캐싱해두어야 합니다. 이 캐시가 프레임워크에서 활용되어 이벤트 등록 속도를 높여줍니다. 캐시를 삭제하려면 `event:clear` 명령어를 사용할 수 있습니다.

<a name="defining-events"></a>
## 이벤트 정의하기

이벤트 클래스는 본질적으로 해당 이벤트와 관련된 데이터를 담는 데이터 컨테이너입니다. 예를 들어, `App\Events\OrderShipped` 이벤트가 [Eloquent ORM](/docs/10.x/eloquent) 객체를 전달받는다고 가정해봅시다:

```
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

위에서 알 수 있듯, 이벤트 클래스에는 어떠한 로직도 없습니다. 오직 구매된 `App\Models\Order` 인스턴스를 담아두는 용도입니다. 이벤트에서 사용하는 `SerializesModels` 트레이트는 이 객체가 PHP의 `serialize` 함수를 통해 직렬화될 때 Eloquent 모델을 올바르게 직렬화하도록 도와줍니다. 이는 [큐 리스너](#queued-event-listeners) 사용시 유용합니다.

<a name="defining-listeners"></a>
## 리스너 정의하기

이제 예시 이벤트를 처리할 리스너를 살펴봅시다. 이벤트 리스너는 `handle` 메서드에서 이벤트 인스턴스를 인자로 전달받아 처리합니다. `event:generate` 및 `make:listener` Artisan 명령어를 통해 생성된 리스너는 올바른 이벤트 클래스를 자동으로 import하고 `handle` 메서드의 타입 힌트도 설정됩니다. `handle` 메서드 내에서 이벤트에 반응하는 행동을 자유롭게 구현할 수 있습니다:

```
<?php

namespace App\Listeners;

use App\Events\OrderShipped;

class SendShipmentNotification
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        // ...
    }

    /**
     * Handle the event.
     */
    public function handle(OrderShipped $event): void
    {
        // $event->order를 사용해 주문 정보에 접근할 수 있습니다...
    }
}
```

> [!NOTE]
> 이벤트 리스너의 생성자에서 의존성이 필요한 경우에도 타입 힌트로 지정할 수 있습니다. 모든 이벤트 리스너는 라라벨 [서비스 컨테이너](/docs/10.x/container)를 통해 자동으로 의존성 주입됩니다.

<a name="stopping-the-propagation-of-an-event"></a>
#### 이벤트 전파 중단하기

특정 상황에서, 이벤트가 다른 리스너들로 전파되는 것을 중단하고자 할 수 있습니다. 이럴 때 리스너의 `handle` 메서드에서 `false`를 반환하면 이벤트 전파가 중단됩니다.

<a name="queued-event-listeners"></a>
## 큐 처리되는(Queued) 이벤트 리스너

이벤트 리스너에서 이메일 전송이나 외부 HTTP 요청 등 시간이 오래 걸리는 작업을 수행하는 경우, 리스너를 큐로 처리하면 애플리케이션의 성능을 높일 수 있습니다. 큐 리스너를 사용하기 전에는 [큐 설정](/docs/10.x/queues)을 완료하고, 서버나 개발 환경에서 큐 워커를 반드시 실행해야 합니다.

이벤트 리스너가 큐에 의해 처리되게 하려면, 리스너 클래스에 `ShouldQueue` 인터페이스를 구현하면 됩니다. `event:generate`와 `make:listener` Artisan 명령어로 생성된 리스너에는 이미 이 인터페이스가 임포트돼 있어 바로 적용할 수 있습니다:

```
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendShipmentNotification implements ShouldQueue
{
    // ...
}
```

이렇게 하면 해당 리스너가 담당하는 이벤트가 발생했을 때, 이벤트 디스패처가 자동으로 리스너를 [라라벨 큐 시스템](/docs/10.x/queues)으로 처리합니다. 큐에서 리스너가 정상적으로 실행된 경우, 처리가 끝난 후 큐 작업은 자동으로 삭제됩니다.

<a name="customizing-the-queue-connection-queue-name"></a>
#### 큐 연결, 이름, 지연 시간 커스터마이즈

특정 리스너가 사용할 큐 연결(connection), 큐 이름(queue), 또는 큐 지연 시간(delay)을 커스터마이즈하려면 리스너 클래스에 각각 `$connection`, `$queue`, `$delay` 속성을 지정할 수 있습니다:

```
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

런타임에서 리스너가 사용할 큐 연결, 큐 이름, 또는 지연 시간을 동적으로 지정하고자 할 땐 각각 `viaConnection`, `viaQueue`, `withDelay` 메서드를 정의할 수 있습니다:

```
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
#### 리스너 큐 처리 조건부 결정

런타임에 특정 데이터에 따라 리스너를 큐 처리할지 결정해야 할 때가 있습니다. 이럴 땐 리스너에 `shouldQueue` 메서드를 추가해 조건을 직접 구현할 수 있습니다. 이 메서드가 `false`를 반환하면 해당 리스너는 실행되지 않습니다:

```
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

리스너의 큐 작업에 대한 `delete`, `release` 메서드를 직접 다루고자 할 때는 `Illuminate\Queue\InteractsWithQueue` 트레이트를 사용하면 됩니다. Artisan 명령어로 생성된 리스너에는 기본적으로 이 트레이트가 포함되어 있고, 관련 메서드에 바로 접근할 수 있습니다:

```
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
### 이벤트 리스너와 DB 트랜잭션

데이터베이스 트랜잭션 내에서 큐 리스너가 디스패치되는 경우, 트랜잭션이 완료(commit)되기 전에 큐가 리스너를 처리할 수 있습니다. 이때 트랜잭션에서 변경된 모델이나 데이터베이스 레코드가 아직 실제로 반영되지 않아, 리스너 실행 도중 예기치 않은 에러가 발생할 수 있습니다.

큐 연결의 `after_commit` 설정 옵션이 `false`여도, 특정 큐 리스너가 데이터베이스 트랜잭션 커밋 이후에만 실행되도록 하고 싶다면, 리스너 클래스에 `ShouldHandleEventsAfterCommit` 인터페이스를 구현하십시오:

```
<?php

namespace App\Listeners;

use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendShipmentNotification implements ShouldQueue, ShouldHandleEventsAfterCommit
{
    use InteractsWithQueue;
}
```

> [!NOTE]
> 이러한 문제의 자세한 해결 방법은 [큐 작업과 데이터베이스 트랜잭션](/docs/10.x/queues#jobs-and-database-transactions) 문서를 참고하세요.

<a name="handling-failed-jobs"></a>
### 실패한 작업 처리하기

때때로 큐 처리 중인 이벤트 리스너가 실패할 수 있습니다. 큐 리스너가 큐 워커에서 지정한 최대 시도 횟수를 초과하면, 리스너의 `failed` 메서드가 호출됩니다. 이 메서드는 이벤트 인스턴스와 해당 실패를 일으킨 `Throwable` 객체를 전달받습니다:

```
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
#### 큐 리스너 최대 재시도 횟수 지정

큐 리스너가 에러로 인해 계속 재시도되는 것을 원치 않을 때, 라라벨은 다양한 방식으로 재시도 횟수 또는 제한시간을 지정할 수 있습니다.

리스너 클래스에 `$tries` 속성을 추가하면, 해당 리스너가 최대 몇 번까지 재시도될지 지정할 수 있습니다:

```
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

몇 번 시도 후 실패할지 대신, 일정 시간까지만 재시도하도록 설정하고 싶다면 리스너 클래스에 `retryUntil` 메서드를 정의할 수 있습니다(이 메서드는 `DateTime` 인스턴스를 반환해야 합니다):

```
use DateTime;

/**
 * Determine the time at which the listener should timeout.
 */
public function retryUntil(): DateTime
{
    return now()->addMinutes(5);
}
```

<a name="dispatching-events"></a>
## 이벤트 디스패치(발생)하기

이벤트를 발생시키려면, 이벤트 클래스의 정적 `dispatch` 메서드를 호출하면 됩니다. 이 메서드는 `Illuminate\Foundation\Events\Dispatchable` 트레이트가 이벤트에 포함되어 있을 때 사용할 수 있습니다. `dispatch` 메서드에 전달된 인수는 이벤트 생성자에 그대로 전달됩니다:

```
<?php

namespace App\Http\Controllers;

use App\Events\OrderShipped;
use App\Http\Controllers\Controller;
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

        // 주문 처리 로직...

        OrderShipped::dispatch($order);

        return redirect('/orders');
    }
}

```
특정 조건일 때만 이벤트를 발생시키고 싶다면, `dispatchIf`와 `dispatchUnless` 메서드를 사용할 수 있습니다:

```
OrderShipped::dispatchIf($condition, $order);

OrderShipped::dispatchUnless($condition, $order);
```

> [!NOTE]
> 테스트 환경에서는 실제로 리스너가 실행되지 않으면서, 특정 이벤트가 발생했는지 검증할 수 있으면 도움이 됩니다. 라라벨의 [내장 테스트 헬퍼](#testing)가 이를 손쉽게 지원합니다.

<a name="dispatching-events-after-database-transactions"></a>
### DB 트랜잭션 후 이벤트 디스패치

때로는 현재 진행 중인 데이터베이스 트랜잭션이 커밋되었을 때만 이벤트가 실제로 발생하도록 하고 싶을 수 있습니다. 이럴 땐 해당 이벤트 클래스에 `ShouldDispatchAfterCommit` 인터페이스를 구현하면 됩니다.

이 인터페이스를 구현하면 현재 트랜잭션이 커밋될 때까지 이벤트 발생이 지연됩니다. 만약 트랜잭션이 실패하면, 이벤트는 무시됩니다. 트랜잭션이 없을 경우에는 즉시 디스패치됩니다:

```
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

이벤트 구독자는 하나의 클래스 내에서 여러 이벤트에 구독(리스너 등록)할 수 있게 해주는 특별한 클래스입니다. 즉, 여러 이벤트를 한 클래스에서 처리할 수 있도록 해줍니다. 구독자 클래스는 `subscribe` 메서드를 정의해야 하며, 이 메서드에는 이벤트 디스패처 인스턴스가 전달됩니다. 전달받은 디스패처의 `listen` 메서드를 사용해 이벤트-리스너 등록이 가능합니다:

```
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

구독자 클래스 내에 이벤트 리스너 메서드를 정의했다면, `subscribe` 메서드에서 이벤트와 메서드명을 매핑한 배열을 반환하는 방법도 있습니다. 라라벨은 구독자 클래스명을 자동으로 추론하여 등록합니다:

```
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

구독자 클래스를 작성했다면, 이제 이벤트 디스패처에 등록할 차례입니다. `EventServiceProvider`의 `$subscribe` 속성에 구독자 클래스를 추가합니다. 예를 들어, `UserEventSubscriber`를 등록해봅시다:

```
<?php

namespace App\Providers;

use App\Listeners\UserEventSubscriber;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event listener mappings for the application.
     *
     * @var array
     */
    protected $listen = [
        // ...
    ];

    /**
     * The subscriber classes to register.
     *
     * @var array
     */
    protected $subscribe = [
        UserEventSubscriber::class,
    ];
}
```

<a name="testing"></a>
## 테스트하기

이벤트를 디스패치하는 코드를 테스트할 때, 실제로 리스너가 실행되기를 원하지 않을 수 있습니다. 왜냐하면 리스너의 동작은 별도로 테스트 가능하기 때문입니다. 리스너 테스트는 직접 인스턴스를 생성해 `handle` 메서드를 호출하는 방식으로 수행할 수 있습니다.

`Event` 파사드의 `fake` 메서드를 사용하면, 리스너 실행을 차단하고, 테스트 대상 코드가 실행된 후 어떤 이벤트가 발생했는지를 `assertDispatched`, `assertNotDispatched`, `assertNothingDispatched` 메서드로 검증할 수 있습니다:

```
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

        // 주문 발송 처리 실행...

        // 이벤트가 발생했는지 확인...
        Event::assertDispatched(OrderShipped::class);

        // 이벤트가 두 번 발생했는지 확인...
        Event::assertDispatched(OrderShipped::class, 2);

        // 이벤트가 발생하지 않았는지 확인...
        Event::assertNotDispatched(OrderFailedToShip::class);

        // 어떠한 이벤트도 발생하지 않았는지 확인...
        Event::assertNothingDispatched();
    }
}
```

`assertDispatched` 또는 `assertNotDispatched` 메서드에는 클로저를 넘겨, 특정 조건을 만족하는 이벤트가 발생했는지 세밀하게 검증할 수 있습니다. 클로저 안의 조건을 충족하는 이벤트가 하나라도 있다면 검증이 통과합니다:

```
Event::assertDispatched(function (OrderShipped $event) use ($order) {
    return $event->order->id === $order->id;
});
```

특정 리스너가 지정한 이벤트에 바인딩되었는지 검증하려면 `assertListening` 메서드를 사용할 수 있습니다:

```
Event::assertListening(
    OrderShipped::class,
    SendShipmentNotification::class
);
```

> [!WARNING]
> `Event::fake()`를 호출하면, 그 이후로 모든 이벤트 리스너가 실행되지 않습니다. 따라서 모델 팩토리 내부에서 이벤트를 활용하는 코드(예: `creating` 이벤트에서 UUID 생성 등)를 테스트할 때에는 팩토리 실행 후에 `Event::fake()`를 호출하세요.

<a name="faking-a-subset-of-events"></a>
### 일부 이벤트만 페이크 처리하기

특정 이벤트에 대해서만 리스너 실행을 막고 싶다면, 해당 이벤트를 `fake` 또는 `fakeFor` 메서드에 배열로 명시하세요:

```
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

    // 그 외 이벤트는 평소대로 발생...
    $order->update([...]);
}
```

모든 이벤트를 페이크 처리하되, 특정 이벤트만 예외로 지정하고 싶다면 `except` 메서드를 사용하세요:

```
Event::fake()->except([
    OrderCreated::class,
]);
```

<a name="scoped-event-fakes"></a>
### 범위 지정 이벤트 페이크(Scoped Event Fakes)

테스트의 일부분에서만 이벤트 리스너 실행을 막고 싶은 경우, `fakeFor` 메서드를 활용할 수 있습니다:

```
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

        // 이후에는 이벤트가 정상적으로 발생, 옵서버도 동작함 ...
        $order->update([...]);
    }
}
```
