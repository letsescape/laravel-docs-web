# 이벤트 (Events)

- [소개](#introduction)
- [이벤트 및 리스너 등록](#registering-events-and-listeners)
    - [이벤트 및 리스너 생성](#generating-events-and-listeners)
    - [이벤트 수동 등록](#manually-registering-events)
    - [이벤트 자동 탐색(Event Discovery)](#event-discovery)
- [이벤트 정의](#defining-events)
- [리스너 정의](#defining-listeners)
- [큐 처리 리스너](#queued-event-listeners)
    - [큐와의 직접 상호작용](#manually-interacting-with-the-queue)
    - [큐 리스너와 데이터베이스 트랜잭션](#queued-event-listeners-and-database-transactions)
    - [실패한 작업 처리](#handling-failed-jobs)
- [이벤트 디스패치(발송)](#dispatching-events)
- [이벤트 구독자](#event-subscribers)
    - [이벤트 구독자 작성](#writing-event-subscribers)
    - [이벤트 구독자 등록](#registering-event-subscribers)

<a name="introduction"></a>
## 소개

라라벨의 이벤트는 간단한 옵저버 패턴(observer pattern)을 구현하여, 애플리케이션 내에서 발생하는 다양한 이벤트를 구독하고 수신할 수 있도록 해줍니다. 이벤트 클래스는 일반적으로 `app/Events` 디렉터리에 저장되며, 해당 이벤트의 리스너(listener)는 `app/Listeners` 디렉터리에 저장됩니다. 만약 이 디렉터리들이 애플리케이션에 아직 없다면, Artisan 콘솔 명령어로 이벤트와 리스너를 생성할 때 자동으로 만들어지니 걱정하지 않으셔도 됩니다.

이벤트는 애플리케이션의 여러 부분을 느슨하게 결합하는 매우 효과적인 방법입니다. 하나의 이벤트에 여러 개의 리스너가 지정될 수 있는데, 각 리스너는 서로에게 의존하지 않습니다. 예를 들어, 주문이 발송될 때마다 사용자에게 Slack 알림을 보내고 싶다고 해봅시다. 주문 처리 코드와 알림 전송 코드를 하나로 묶는 대신, `App\Events\OrderShipped`와 같은 이벤트를 발생시키고, 해당 이벤트를 감지하는 리스너가 Slack 알림 전송을 처리하도록 분리할 수 있습니다.

<a name="registering-events-and-listeners"></a>
## 이벤트 및 리스너 등록

라라벨 애플리케이션에는 `App\Providers\EventServiceProvider`가 기본으로 포함되어 있으며, 이곳은 애플리케이션에서 사용할 모든 이벤트 리스너를 등록하기에 아주 편리한 장소입니다. `listen` 속성에는 이벤트(키)와 그에 연결된 리스너(값)들의 배열이 들어 있습니다. 애플리케이션에 필요한 만큼 이벤트를 자유롭게 추가하실 수 있습니다. 예를 들어, `OrderShipped` 이벤트를 다음과 같이 추가할 수 있습니다.

```
use App\Events\OrderShipped;
use App\Listeners\SendShipmentNotification;

/**
 * The event listener mappings for the application.
 *
 * @var array
 */
protected $listen = [
    OrderShipped::class => [
        SendShipmentNotification::class,
    ],
];
```

> [!TIP]
> `event:list` 명령어를 사용하면 애플리케이션에 등록된 모든 이벤트와 리스너 목록을 확인할 수 있습니다.

<a name="generating-events-and-listeners"></a>
### 이벤트 및 리스너 생성

이벤트와 리스너 파일을 일일이 직접 만드는 것은 번거롭기 때문에, `EventServiceProvider`에 리스너와 이벤트를 등록한 후 `event:generate` 아티즌 명령어를 사용하는 것이 좋습니다. 이 명령어는 `EventServiceProvider`에 등재되어 있으나 아직 존재하지 않는 이벤트나 리스너 파일을 자동으로 생성해줍니다.

```
php artisan event:generate
```

또는, 각각의 이벤트와 리스너를 생성하고자 한다면 다음과 같이 `make:event`와 `make:listener` 명령어를 사용할 수 있습니다.

```
php artisan make:event PodcastProcessed

php artisan make:listener SendPodcastNotification --event=PodcastProcessed
```

<a name="manually-registering-events"></a>
### 이벤트 수동 등록

일반적으로 이벤트는 `EventServiceProvider`의 `$listen` 배열을 통해 등록해야 하지만, 필요한 경우 `EventServiceProvider`의 `boot` 메서드에서 클래스 기반 또는 클로저(익명 함수) 기반 이벤트 리스너를 수동으로 등록할 수도 있습니다.

```
use App\Events\PodcastProcessed;
use App\Listeners\SendPodcastNotification;
use Illuminate\Support\Facades\Event;

/**
 * Register any other events for your application.
 *
 * @return void
 */
public function boot()
{
    Event::listen(
        PodcastProcessed::class,
        [SendPodcastNotification::class, 'handle']
    );

    Event::listen(function (PodcastProcessed $event) {
        //
    });
}
```

<a name="queuable-anonymous-event-listeners"></a>
#### 큐 처리 가능한 익명 이벤트 리스너

클로저 기반 이벤트 리스너를 직접 등록할 때, `Illuminate\Events\queueable` 함수로 감싸면 라라벨이 해당 리스너를 [큐](/docs/8.x/queues)로 처리하도록 할 수 있습니다.

```
use App\Events\PodcastProcessed;
use function Illuminate\Events\queueable;
use Illuminate\Support\Facades\Event;

/**
 * Register any other events for your application.
 *
 * @return void
 */
public function boot()
{
    Event::listen(queueable(function (PodcastProcessed $event) {
        //
    }));
}
```

일반적인 큐 작업처럼, `onConnection`, `onQueue`, `delay` 등의 메서드를 사용하여 큐 리스너의 실행 환경을 세밀하게 조정할 수 있습니다.

```
Event::listen(queueable(function (PodcastProcessed $event) {
    //
})->onConnection('redis')->onQueue('podcasts')->delay(now()->addSeconds(10)));
```

익명 큐 리스너에서 오류가 발생할 경우를 처리하고 싶다면, `queueable` 리스너를 정의할 때 `catch` 메서드에 클로저를 전달할 수 있습니다. 이 클로저는 이벤트 인스턴스와 예외(`Throwable`) 인스턴스를 받습니다.

```
use App\Events\PodcastProcessed;
use function Illuminate\Events\queueable;
use Illuminate\Support\Facades\Event;
use Throwable;

Event::listen(queueable(function (PodcastProcessed $event) {
    //
})->catch(function (PodcastProcessed $event, Throwable $e) {
    // 큐 리스너 처리 실패 시 실행...
}));
```

<a name="wildcard-event-listeners"></a>
#### 와일드카드 이벤트 리스너

`*`를 와일드카드 파라미터로 사용해 하나의 리스너가 여러 이벤트를 포착할 수 있도록 할 수도 있습니다. 와일드카드 리스너는 첫 번째 인자로 이벤트 이름을, 두 번째 인자로 전체 이벤트 데이터 배열을 받습니다.

```
Event::listen('event.*', function ($eventName, array $data) {
    //
});
```

<a name="event-discovery"></a>
### 이벤트 자동 탐색(Event Discovery)

이벤트와 리스너를 `EventServiceProvider`의 `$listen` 배열에 일일이 등록하지 않고, 자동으로 찾아 등록하는 기능도 있습니다. 이 기능을 활성화하면 라라벨이 자동으로 애플리케이션의 `Listeners` 디렉터리를 스캔해 이벤트와 리스너를 등록합니다. 물론 `EventServiceProvider`에 명시적으로 정의된 이벤트도 그대로 등록됩니다.

라라벨은 PHP의 리플렉션(reflection) 기능을 이용해 리스너 클래스를 탐색하며, `handle`로 시작하는 메서드가 있으면, 시그니처에 타입힌트된 이벤트에 대응하도록 해당 메서드를 자동 리스너로 등록합니다.

```
use App\Events\PodcastProcessed;

class SendPodcastNotification
{
    /**
     * Handle the given event.
     *
     * @param  \App\Events\PodcastProcessed  $event
     * @return void
     */
    public function handle(PodcastProcessed $event)
    {
        //
    }
}
```

이벤트 자동 탐색 기능은 기본적으로 비활성화되어 있지만, 애플리케이션의 `EventServiceProvider`에서 `shouldDiscoverEvents` 메서드를 오버라이드해서 활성화할 수 있습니다.

```
/**
 * Determine if events and listeners should be automatically discovered.
 *
 * @return bool
 */
public function shouldDiscoverEvents()
{
    return true;
}
```

기본적으로 애플리케이션의 `app/Listeners` 디렉터리 전체가 스캔 대상입니다. 만약 추가로 탐색할 디렉터리를 지정하고 싶다면, `EventServiceProvider`에서 `discoverEventsWithin` 메서드를 오버라이드하세요.

```
/**
 * Get the listener directories that should be used to discover events.
 *
 * @return array
 */
protected function discoverEventsWithin()
{
    return [
        $this->app->path('Listeners'),
    ];
}
```

<a name="event-discovery-in-production"></a>
#### 운영 환경에서의 이벤트 자동 탐색

운영 환경에서는 요청마다 모든 리스너를 스캔하는 것은 비효율적입니다. 따라서 배포 과정에서 반드시 `event:cache` 아티즌 명령어를 실행하여 모든 이벤트와 리스너 정보를 캐시로 저장하는 것을 권장합니다. 이 캐시 정보는 프레임워크가 이벤트 등록을 보다 신속하게 처리하도록 도와줍니다. 기존 캐시를 삭제하려면 `event:clear` 명령어를 사용하면 됩니다.

<a name="defining-events"></a>
## 이벤트 정의

이벤트 클래스는 실제로 이벤트와 관련된 정보를 담는 데이터 컨테이너 역할을 합니다. 예를 들어, `App\Events\OrderShipped` 이벤트가 [Eloquent ORM](/docs/8.x/eloquent) 객체를 전달받는다고 가정해보겠습니다.

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
     * The order instance.
     *
     * @var \App\Models\Order
     */
    public $order;

    /**
     * Create a new event instance.
     *
     * @param  \App\Models\Order  $order
     * @return void
     */
    public function __construct(Order $order)
    {
        $this->order = $order;
    }
}
```

위 예시에서 볼 수 있듯이 이벤트 클래스 자체에는 별다른 로직이 없습니다. 단순히 구매된 `App\Models\Order` 인스턴스를 담아두는 컨테이너입니다. 이벤트에서 사용하는 `SerializesModels` 트레이트는, [큐 리스너](#queued-event-listeners)를 사용할 때처럼 이벤트 객체를 PHP의 `serialize` 함수로 직렬화할 경우 Eloquent 모델 인스턴스를 알맞게 직렬화해줍니다.

<a name="defining-listeners"></a>
## 리스너 정의

다음은 예시 이벤트에 대한 리스너를 살펴보겠습니다. 이벤트 리스너는 `handle` 메서드에서 이벤트 인스턴스를 전달받습니다. `event:generate`와 `make:listener` 아티즌 명령어를 사용하면 해당 이벤트 클래스를 자동으로 import하며, `handle` 메서드에 적절한 타입힌트도 추가해줍니다. `handle`에서는 이벤트에 응답하여 필요한 작업을 자유롭게 수행할 수 있습니다.

```
<?php

namespace App\Listeners;

use App\Events\OrderShipped;

class SendShipmentNotification
{
    /**
     * Create the event listener.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     *
     * @param  \App\Events\OrderShipped  $event
     * @return void
     */
    public function handle(OrderShipped $event)
    {
        // $event->order로 주문 정보에 접근할 수 있습니다...
    }
}
```

> [!TIP]
> 이벤트 리스너의 생성자(constructor)에서 필요한 의존성도 타입힌트할 수 있습니다. 모든 이벤트 리스너는 라라벨의 [서비스 컨테이너](/docs/8.x/container)를 통해 resolve되므로, 의존성이 자동으로 주입됩니다.

<a name="stopping-the-propagation-of-an-event"></a>
#### 이벤트 전파(Propagation) 중지

특정 리스너에서 더 이상 이벤트가 다른 리스너에 전달되길 원하지 않을 때가 있습니다. 이럴 때는 리스너의 `handle` 메서드에서 `false`를 반환하세요.

<a name="queued-event-listeners"></a>
## 큐 처리 리스너

리스너가 이메일 전송이나 HTTP 요청처럼 시간이 오래 걸리는 작업을 수행한다면, 리스너를 큐로 처리하는 것이 좋습니다. 큐 리스너를 사용하기 전에 [큐를 설정](/docs/8.x/queues)하고 서버나 로컬 개발 환경에서 큐 워커를 실행해야 합니다.

리스너를 큐에 넣으려면 리스너 클래스에 `ShouldQueue` 인터페이스를 구현하세요. `event:generate`와 `make:listener`로 생성한 리스너에는 이미 이 인터페이스가 import되어 있으므로 바로 사용할 수 있습니다.

```
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendShipmentNotification implements ShouldQueue
{
    //
}
```

이렇게 하면 해당 리스너가 처리하는 이벤트가 디스패치(발송)될 때, 이벤트 디스패처가 라라벨의 [큐 시스템](/docs/8.x/queues)을 이용해 자동으로 리스너를 큐에 넣습니다. 리스너가 예외 없이 정상적으로 실행되면 처리 후 큐 작업은 자동으로 삭제됩니다.

<a name="customizing-the-queue-connection-queue-name"></a>
#### 큐 커넥션 및 큐 이름 커스터마이징

리스너가 사용할 큐 커넥션, 큐 이름, 큐 딜레이(지연) 시간 등을 커스터마이징하고 싶다면, 리스너 클래스에 `$connection`, `$queue`, `$delay` 속성을 정의하세요.

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

실행 시점에 큐 커넥션이나 큐 이름을 동적으로 지정하고 싶다면, `viaConnection` 또는 `viaQueue` 메서드를 리스너에 정의하세요.

```
/**
 * Get the name of the listener's queue connection.
 *
 * @return string
 */
public function viaConnection()
{
    return 'sqs';
}

/**
 * Get the name of the listener's queue.
 *
 * @return string
 */
public function viaQueue()
{
    return 'listeners';
}
```

<a name="conditionally-queueing-listeners"></a>
#### 리스너 큐 처리 여부 조건부 결정

경우에 따라서는 런타임에만 알 수 있는 데이터에 따라 리스너를 큐에 넣을지 판단해야 할 때가 있습니다. 이를 위해 리스너에 `shouldQueue` 메서드를 정의하여, 이 메서드가 `false`를 반환하면 해당 리스너는 실행되지 않습니다.

```
<?php

namespace App\Listeners;

use App\Events\OrderCreated;
use Illuminate\Contracts\Queue\ShouldQueue;

class RewardGiftCard implements ShouldQueue
{
    /**
     * Reward a gift card to the customer.
     *
     * @param  \App\Events\OrderCreated  $event
     * @return void
     */
    public function handle(OrderCreated $event)
    {
        //
    }

    /**
     * Determine whether the listener should be queued.
     *
     * @param  \App\Events\OrderCreated  $event
     * @return bool
     */
    public function shouldQueue(OrderCreated $event)
    {
        return $event->order->subtotal >= 5000;
    }
}
```

<a name="manually-interacting-with-the-queue"></a>
### 큐와의 직접 상호작용

리스너 내부에서 큐 작업의 `delete`와 `release` 메서드에 직접 접근해야 할 경우, `Illuminate\Queue\InteractsWithQueue` 트레이트를 사용하세요. 이 트레이트는 기본적으로 생성된 리스너에 추가되어 있으며, 위 두 메서드에 쉽게 접근할 수 있도록 해줍니다.

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
     *
     * @param  \App\Events\OrderShipped  $event
     * @return void
     */
    public function handle(OrderShipped $event)
    {
        if (true) {
            $this->release(30);
        }
    }
}
```

<a name="queued-event-listeners-and-database-transactions"></a>
### 큐 리스너와 데이터베이스 트랜잭션

큐 리스너가 데이터베이스 트랜잭션 내에서 디스패치될 경우, 큐 워커가 트랜잭션이 커밋 되기 전에 해당 리스너를 처리할 수도 있습니다. 이럴 때는 트랜잭션 내에서 업데이트한 모델이나 DB 레코드가 아직 커밋되지 않은 상태일 수 있습니다. 또한 트랜잭션 내에서 새롭게 생성한 모델이나 레코드는 DB에 실제로 존재하지 않을 수도 있습니다. 만약 리스너가 이런 모델이나 데이터를 필요로 한다면 예기치 않은 오류가 발생할 수 있습니다.

큐 커넥션의 `after_commit` 설정이 `false`일 때, 특정 큐 리스너만 트랜잭션 커밋 후에 디스패치되길 원한다면 리스너 클래스에 `$afterCommit` 속성을 지정하면 됩니다.

```
<?php

namespace App\Listeners;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendShipmentNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public $afterCommit = true;
}
```

> [!TIP]
> 이와 같은 문제를 해결하려면 [큐 작업과 데이터베이스 트랜잭션](/docs/8.x/queues#jobs-and-database-transactions) 관련 문서를 참고하세요.

<a name="handling-failed-jobs"></a>
### 실패한 작업 처리

가끔 큐에 들어간 이벤트 리스너가 실패할 수 있습니다. 큐 리스너가 큐 워커에 설정된 최대 시도 횟수를 넘기면, 리스너의 `failed` 메서드가 호출됩니다. 이 메서드는 이벤트 인스턴스와 예외(`Throwable`)를 인자로 받습니다.

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
     *
     * @param  \App\Events\OrderShipped  $event
     * @return void
     */
    public function handle(OrderShipped $event)
    {
        //
    }

    /**
     * Handle a job failure.
     *
     * @param  \App\Events\OrderShipped  $event
     * @param  \Throwable  $exception
     * @return void
     */
    public function failed(OrderShipped $event, $exception)
    {
        //
    }
}
```

<a name="specifying-queued-listener-maximum-attempts"></a>
#### 큐 리스너 최대 시도 횟수 지정

큐 리스너가 계속 오류를 발생시키는 경우, 무한히 재시도 되는 것을 피하고 싶을 수 있습니다. 라라벨은 이런 상황을 대비해 리스너가 몇 번 혹은 얼마 동안만 재시도되도록 제한하는 여러 방법을 제공합니다.

리스너 클래스에 `$tries` 속성을 지정해 주면, 해당 리스너가 최대 몇 번까지 시도한 뒤 실패로 처리될지 설정할 수 있습니다.

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

또는, 재시도 횟수가 아니라 리스너가 더 이상 시도되지 않아야 하는 시점을 지정할 수도 있습니다. 즉, 어떤 시간 한도 안에서만 무제한 시도하도록 만들 수 있습니다. 이를 위해 `retryUntil` 메서드를 리스너 클래스에 추가하고, `DateTime` 인스턴스를 반환하게 하세요.

```
/**
 * Determine the time at which the listener should timeout.
 *
 * @return \DateTime
 */
public function retryUntil()
{
    return now()->addMinutes(5);
}
```

<a name="dispatching-events"></a>
## 이벤트 디스패치(발송)

이벤트를 발생시키려면 이벤트 클래스의 정적 `dispatch` 메서드를 호출하면 됩니다. 이 메서드는 이벤트에 포함된 `Illuminate\Foundation\Events\Dispatchable` 트레이트가 제공합니다. `dispatch`에 전달되는 모든 인수는 이벤트의 생성자로 그대로 전달됩니다.

```
<?php

namespace App\Http\Controllers;

use App\Events\OrderShipped;
use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderShipmentController extends Controller
{
    /**
     * Ship the given order.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $order = Order::findOrFail($request->order_id);

        // 주문 배송 처리...

        OrderShipped::dispatch($order);
    }
}
```

> [!TIP]
> 테스트 시에는 실제로 리스너를 실행하지 않고 특정 이벤트가 발생했는지만 확인하고 싶을 때가 있습니다. 라라벨의 [내장 테스트 도우미](/docs/8.x/mocking#event-fake)를 사용하면 간단하게 처리할 수 있습니다.

<a name="event-subscribers"></a>
## 이벤트 구독자

<a name="writing-event-subscribers"></a>
### 이벤트 구독자 작성

이벤트 구독자는 하나의 클래스에서 여러 이벤트를 직접 구독할 수 있도록 해줍니다. 즉, 한 구독자 클래스 안에 여러 이벤트 핸들러를 정의할 수 있습니다. 구독자 클래스는 반드시 `subscribe` 메서드를 정의해야 하며, 이 메서드에 이벤트 디스패처 인스턴스가 전달됩니다. 해당 디스패처의 `listen` 메서드를 호출해 이벤트 리스너를 등록하면 됩니다.

```
<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;

class UserEventSubscriber
{
    /**
     * Handle user login events.
     */
    public function handleUserLogin($event) {}

    /**
     * Handle user logout events.
     */
    public function handleUserLogout($event) {}

    /**
     * Register the listeners for the subscriber.
     *
     * @param  \Illuminate\Events\Dispatcher  $events
     * @return void
     */
    public function subscribe($events)
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

구독자 내부에 리스너 메서드를 정의했다면, `subscribe` 메서드에서 이벤트와 메서드명을 배열로 반환하는 방식이 더 편할 수 있습니다. 라라벨이 자동으로 구독자 클래스명을 파악하여 이벤트 리스너를 등록해줍니다.

```
<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;

class UserEventSubscriber
{
    /**
     * Handle user login events.
     */
    public function handleUserLogin($event) {}

    /**
     * Handle user logout events.
     */
    public function handleUserLogout($event) {}

    /**
     * Register the listeners for the subscriber.
     *
     * @param  \Illuminate\Events\Dispatcher  $events
     * @return array
     */
    public function subscribe($events)
    {
        return [
            Login::class => 'handleUserLogin',
            Logout::class => 'handleUserLogout',
        ];
    }
}
```

<a name="registering-event-subscribers"></a>
### 이벤트 구독자 등록

구독자 작성을 마쳤다면, 이제 해당 구독자를 이벤트 디스패처에 등록해주어야 합니다. `EventServiceProvider`의 `$subscribe` 속성에 구독자 클래스를 등재하면 됩니다. 예를 들어, `UserEventSubscriber`를 등록하는 경우는 다음과 같습니다.

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
        //
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