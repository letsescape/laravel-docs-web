# 이벤트 (Events)

- [소개](#introduction)
- [이벤트와 리스너 등록하기](#registering-events-and-listeners)
    - [이벤트와 리스너 생성하기](#generating-events-and-listeners)
    - [이벤트 수동 등록하기](#manually-registering-events)
    - [이벤트 디스커버리](#event-discovery)
- [이벤트 정의하기](#defining-events)
- [리스너 정의하기](#defining-listeners)
- [큐잉된(Queued) 이벤트 리스너](#queued-event-listeners)
    - [큐 직접 다루기](#manually-interacting-with-the-queue)
    - [큐잉된 이벤트 리스너와 데이터베이스 트랜잭션](#queued-event-listeners-and-database-transactions)
    - [실패한 작업 처리하기](#handling-failed-jobs)
- [이벤트 디스패치하기](#dispatching-events)
- [이벤트 구독자(Event Subscribers)](#event-subscribers)
    - [이벤트 구독자 작성하기](#writing-event-subscribers)
    - [이벤트 구독자 등록하기](#registering-event-subscribers)

<a name="introduction"></a>
## 소개

라라벨의 이벤트 기능은 간단한 옵저버 패턴을 구현하여, 애플리케이션 내에서 발생하는 다양한 이벤트를 구독(subscribe)하고, 리스닝(listen)할 수 있도록 지원합니다. 일반적으로 이벤트 클래스는 `app/Events` 디렉터리에, 이벤트 리스너는 `app/Listeners` 디렉터리에 저장됩니다. 만약 해당 디렉터리가 프로젝트에 존재하지 않더라도, Artisan 콘솔 명령어를 사용해 이벤트와 리스너를 생성하면 자동으로 만들어집니다.

이벤트는 애플리케이션의 여러 부분을 서로 느슨하게 결합시켜줍니다. 하나의 이벤트에 여러 리스너를 연결할 수 있고, 이 리스너들은 서로에게 의존하지 않습니다. 예를 들어, 주문이 발송될 때마다 사용자의 Slack으로 알림을 보내고 싶을 때, 주문 처리 코드와 Slack 알림 코드를 직접 연결시키는 대신, `App\Events\OrderShipped` 이벤트를 발생시키도록 할 수 있습니다. 그러면 별도의 리스너가 이 이벤트를 받아 Slack 알림을 보냅니다.

<a name="registering-events-and-listeners"></a>
## 이벤트와 리스너 등록하기

라라벨 애플리케이션에 기본 제공되는 `App\Providers\EventServiceProvider`는 모든 이벤트 리스너를 편리하게 등록할 수 있는 공간을 제공합니다. `listen` 속성에는 이벤트(키)와 그에 상응하는 리스너(값)들의 배열이 들어 있습니다. 애플리케이션이 요구하는 만큼 이 배열에 이벤트를 추가할 수 있습니다. 예를 들어, `OrderShipped` 이벤트를 추가하는 방식은 아래와 같습니다:

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

> [!NOTE]
> `event:list` 명령어를 사용하면 애플리케이션에 등록된 모든 이벤트와 리스너 목록을 확인할 수 있습니다.

<a name="generating-events-and-listeners"></a>
### 이벤트와 리스너 생성하기

각 이벤트와 리스너 파일을 직접 생성하는 것은 번거로운 작업이 될 수 있습니다. 대신, `EventServiceProvider`에 리스너와 이벤트를 추가한 후, `event:generate` Artisan 명령어를 사용하세요. 이 명령어는 `EventServiceProvider`에 등록되어 있지만 아직 존재하지 않는 이벤트나 리스너 파일을 자동으로 생성합니다.

```shell
php artisan event:generate
```

또는, 개별적으로 이벤트와 리스너를 생성하고 싶다면 `make:event`와 `make:listener` Artisan 명령어를 사용할 수 있습니다:

```shell
php artisan make:event PodcastProcessed

php artisan make:listener SendPodcastNotification --event=PodcastProcessed
```

<a name="manually-registering-events"></a>
### 이벤트 수동 등록하기

일반적으로 이벤트는 `EventServiceProvider`의 `$listen` 배열에 등록해야 하지만, 필요하다면 `EventServiceProvider`의 `boot` 메서드 안에서 클래스 혹은 클로저 기반의 리스너를 직접 수동 등록할 수도 있습니다:

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
#### 큐잉 가능한 익명 이벤트 리스너

클로저(익명 함수) 기반의 이벤트 리스너를 수동 등록할 때, 이 리스너 클로저를 `Illuminate\Events\queueable` 함수로 감싸면, 라라벨이 해당 리스너를 [큐](/docs/9.x/queues)를 통해 실행하도록 지정할 수 있습니다.

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

큐잉된 작업과 마찬가지로, `onConnection`, `onQueue`, `delay` 메서드를 사용해 큐 리스너의 실행 환경을 세밀하게 조정할 수 있습니다.

```
Event::listen(queueable(function (PodcastProcessed $event) {
    //
})->onConnection('redis')->onQueue('podcasts')->delay(now()->addSeconds(10)));
```

익명 큐 리스너에 실패 처리 로직을 추가하고 싶다면, 리스너를 정의할 때 `catch` 메서드에 클로저를 전달할 수 있습니다. 이 클로저는 이벤트 인스턴스와 실패 원인이 되는 `Throwable` 인스턴스를 받게 됩니다.

```
use App\Events\PodcastProcessed;
use function Illuminate\Events\queueable;
use Illuminate\Support\Facades\Event;
use Throwable;

Event::listen(queueable(function (PodcastProcessed $event) {
    //
})->catch(function (PodcastProcessed $event, Throwable $e) {
    // The queued listener failed...
}));
```

<a name="wildcard-event-listeners"></a>
#### 와일드카드 이벤트 리스너

리스너 등록 시, 이벤트 이름에 `*`를 와일드카드로 사용할 수 있습니다. 이를 통해 하나의 리스너가 여러 이벤트를 한 번에 받아 처리할 수 있습니다. 와일드카드 리스너는 첫 번째 인자로 이벤트 이름을, 두 번째 인자로 전체 이벤트 데이터 배열을 전달받습니다.

```
Event::listen('event.*', function ($eventName, array $data) {
    //
});
```

<a name="event-discovery"></a>
### 이벤트 디스커버리

`EventServiceProvider`의 `$listen` 배열에 이벤트와 리스너를 직접 등록하는 대신, 자동 이벤트 디스커버리 기능을 활성화할 수 있습니다. 이 기능이 활성화되면, 라라벨이 애플리케이션의 `Listeners` 디렉터리를 스캔해 이벤트와 리스너를 자동으로 찾아 등록합니다. 물론, `EventServiceProvider`에 명시적으로 정의된 이벤트도 함께 등록됩니다.

라라벨은 PHP의 리플렉션(reflection) 기능을 사용해 리스너 클래스 내에서 이름이 `handle` 또는 `__invoke`로 시작하는 메서드를 찾아, 해당 메서드를 이벤트 리스너로 자동 등록합니다. 이때, 메서드의 시그니처에 있는 타입힌트로 어떤 이벤트를 리스닝할지 결정합니다.

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

이벤트 디스커버리는 기본적으로 비활성화되어 있습니다. 활성화하려면 `EventServiceProvider`에서 `shouldDiscoverEvents` 메서드를 오버라이드하여 `true`를 반환하도록 하면 됩니다.

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

기본적으로 애플리케이션의 `app/Listeners` 디렉터리 내의 모든 리스너가 스캔됩니다. 추가로 스캔할 디렉터리를 지정하고 싶다면, `EventServiceProvider`에서 `discoverEventsWithin` 메서드를 오버라이드하면 됩니다:

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
#### 프로덕션 환경에서의 이벤트 디스커버리

프로덕션 환경에서 매 요청마다 모든 리스너를 일일이 스캔하는 것은 비효율적입니다. 따라서 배포(delpoy) 시점에 `event:cache` Artisan 명령어를 실행하여, 모든 이벤트와 리스너 정보를 캐시(Manifest)로 저장해 두는 것이 좋습니다. 이렇게 하면 프레임워크가 이벤트 등록을 훨씬 빠르게 처리할 수 있습니다. 저장해둔 캐시는 `event:clear` 명령어로 제거할 수 있습니다.

<a name="defining-events"></a>
## 이벤트 정의하기

이벤트 클래스는 본질적으로, 이벤트와 관련된 데이터를 담는 컨테이너 역할을 합니다. 예를 들어, `App\Events\OrderShipped` 이벤트가 [Eloquent ORM](/docs/9.x/eloquent) 객체를 받는 상황을 가정해볼 수 있습니다:

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

이처럼 이벤트 클래스에는 실제 로직이 들어있지 않습니다. 단순히 주문이 완료된 `App\Models\Order` 인스턴스를 담고 있을 뿐입니다. 이벤트에서 사용하는 `SerializesModels` 트레잇은, 이벤트 객체를 PHP의 `serialize` 함수로 직렬화해야 할 때(Eloquent 모델이 큐잉되는 상황 등) 모델을 안전하게 직렬화해줍니다.

<a name="defining-listeners"></a>
## 리스너 정의하기

다음은 방금 정의한 이벤트를 리스닝하는 리스너 예시입니다. 이벤트 리스너는 `handle` 메서드를 통해 이벤트 인스턴스를 전달받습니다. `event:generate` 및 `make:listener` Artisan 명령어를 사용하면 올바른 이벤트 클래스 임포트와 타입힌트가 자동으로 처리됩니다. `handle` 메서드 안에서는 해당 이벤트에 응답하기 위한 어떠한 로직도 자유롭게 작성할 수 있습니다:

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
        // $event->order를 통해 주문 객체에 접근할 수 있습니다.
    }
}
```

> [!NOTE]
> 이벤트 리스너 생성자의 의존성도 자유롭게 타입힌트 할 수 있습니다. 모든 이벤트 리스너는 라라벨 [서비스 컨테이너](/docs/9.x/container)에서 해석되므로, 의존성 주입이 자동으로 이뤄집니다.

<a name="stopping-the-propagation-of-an-event"></a>
#### 이벤트 전파 멈추기

특정 이벤트가 다른 리스너들에게 더 이상 전달되지 않도록 하고 싶을 때가 있습니다. 그런 경우, 리스너의 `handle` 메서드에서 `false`를 반환하면 해당 이벤트의 전파를 중단할 수 있습니다.

<a name="queued-event-listeners"></a>
## 큐잉된(Queued) 이벤트 리스너

리스너가 이메일 전송, HTTP 요청 등 느린 작업을 수행해야 할 때, 리스너를 큐잉해서 처리하면 효율적입니다. 큐잉된 리스너를 사용하려면, [큐 설정](/docs/9.x/queues)을 먼저 완료하고, 서버 또는 개발환경에서 큐 워커(queue worker)를 실행해야 합니다.

리스너 클래스를 큐잉 대상으로 지정하려면, 해당 클래스에 `ShouldQueue` 인터페이스를 구현하세요. `event:generate` 및 `make:listener` Artisan 명령어로 생성된 리스너는 이 인터페이스가 이미 네임스페이스에 포함되어 바로 사용할 수 있습니다:

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

이렇게만 하면, 이 리스너가 처리하는 이벤트가 발생할 때 라라벨 이벤트 디스패처가 자동으로 [큐 시스템](/docs/9.x/queues)을 이용해 리스너를 큐잉합니다. 큐에서 리스너가 실행되어 예외 없이 완료되면, 해당 작업은 자동으로 큐에서 삭제됩니다.

<a name="customizing-the-queue-connection-queue-name"></a>
#### 큐 연결명과 큐 이름 커스터마이징

이벤트 리스너의 큐 연결명(connection), 큐 이름(queue), 큐 지연시간(delay)을 커스터마이징하고 싶다면, 리스너 클래스에 `$connection`, `$queue`, `$delay` 속성을 정의하면 됩니다:

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

실행 시점에 연결명이나 큐 이름을 동적으로 지정하고 싶다면, 리스너 클래스에서 `viaConnection` 또는 `viaQueue` 메서드를 정의할 수도 있습니다.

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
#### 조건부 큐잉

가끔 리스너가 큐잉되어야 할지 말지, 실행 시점의 데이터에 따라 다르게 결정해야 할 때도 있습니다. 이를 위해, 리스너 클래스에 `shouldQueue` 메서드를 추가하여 큐잉 여부를 동적으로 정할 수 있습니다. `shouldQueue` 메서드가 `false`를 반환하면, 해당 리스너는 실행되지 않습니다.

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
### 큐 직접 다루기

리스너의 underlying queue job이 제공하는 `delete`, `release` 메서드에 직접 접근해야 할 때는, `Illuminate\Queue\InteractsWithQueue` 트레잇을 활용하세요. 이 트레잇은 기본적으로 생성되는 리스너에 이미 포함되어 있으며, 관련 메서드에 접근할 수 있도록 도와줍니다.

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
### 큐잉된 이벤트 리스너와 데이터베이스 트랜잭션

데이터베이스 트랜잭션 안에서 큐잉된 리스너를 디스패치하면, 큐 워커가 작업을 처리할 때 아직 트랜잭션이 커밋되지 않은 상태일 수 있습니다. 이 경우, 트랜잭션에서 변경된 모델이나 레코드가 실제 DB에 반영되지 않았을 수 있습니다. 만약 리스너가 해당 모델에 의존한다면, 예상치 못한 오류가 발생할 수 있습니다. 또한 트랜잭션 내에서 생성된 레코드 역시 아직 DB에 존재하지 않을 수도 있습니다.

만약 큐 연결의 `after_commit` 옵션이 `false`로 되어 있어도 특정 큐 리스너만은 트랜잭션 커밋 이후에 디스패치되도록 하려면, 리스너 클래스에 `$afterCommit` 속성을 추가하세요:

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

> [!NOTE]
> 이런 상황의 자세한 해결 방법은 [큐잉 작업과 데이터베이스 트랜잭션](/docs/9.x/queues#jobs-and-database-transactions) 문서를 참고하세요.

<a name="handling-failed-jobs"></a>
### 실패한 작업 처리하기

큐잉된 이벤트 리스너가 실패할 때도 있습니다. 큐 리스너가 큐 워커에서 설정한 최대 시도 횟수에 도달하면, 리스너의 `failed` 메서드가 호출됩니다. 이때 `failed` 메서드는 이벤트 객체와 예외(`Throwable`) 인스턴스를 인자로 받게 됩니다:

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
#### 큐잉된 리스너의 최대 시도 횟수 지정

큐잉된 리스너가 계속 에러를 일으킬 경우, 무한정 재시도되는 것을 원하지 않을 수 있습니다. 라라벨은 리스너가 몇 번까지 혹은 얼마동안 재시도될 수 있을지 지정하는 다양한 방법을 제공합니다.

리스너 클래스에 `$tries` 속성을 추가하면, 최대 시도 횟수를 지정할 수 있습니다. 횟수를 초과하면 실패로 간주합니다.

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

시도 횟수 대신, 특정 시간까지 리스너가 재시도될 수 있도록 할 수도 있습니다. 이 방법은 특정 시간 내에 원하는 만큼 시도회를 허용할 수 있게 해줍니다. 종료 시점을 지정하려면, 리스너 클래스에 `retryUntil` 메서드를 추가하고, `DateTime` 인스턴스를 반환하도록 하세요:

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
## 이벤트 디스패치하기

이벤트를 디스패치하려면, 이벤트 클래스에서 static `dispatch` 메서드를 호출하면 됩니다. 이 메서드는 이벤트에 `Illuminate\Foundation\Events\Dispatchable` 트레잇이 있으면 자동으로 사용할 수 있습니다. `dispatch` 메서드에 전달한 인수들은 이벤트의 생성자에 그대로 전달됩니다:

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

        // Order shipment logic...

        OrderShipped::dispatch($order);
    }
}

```
이벤트를 조건적으로 디스패치하고 싶다면, `dispatchIf`와 `dispatchUnless` 메서드를 사용할 수 있습니다:

```
OrderShipped::dispatchIf($condition, $order);

OrderShipped::dispatchUnless($condition, $order);
```

> [!NOTE]
> 테스트 시, 실제로 리스너를 실행하지 않고 특정 이벤트가 디스패치되었는지 확인하고 싶을 때는 라라벨의 [내장 테스트 헬퍼](/docs/9.x/mocking#event-fake)를 활용하면 쉽게 처리할 수 있습니다.

<a name="event-subscribers"></a>
## 이벤트 구독자(Event Subscribers)

<a name="writing-event-subscribers"></a>
### 이벤트 구독자 작성하기

이벤트 구독자는 여러 이벤트를 한번에 처리할 수 있도록, 리스너를 하나의 클래스 내에 모아 정의할 수 있습니다. 구독자는 `subscribe` 메서드를 반드시 정의해야 하며, 이 메서드는 이벤트 디스패처 인스턴스를 인자로 받습니다. `listen` 메서드를 이용해 개별 이벤트와 해당 처리 메서드를 등록할 수 있습니다:

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

구독자 내부에 이벤트 처리 메서드를 정의했다면, `subscribe` 메서드에서 처리할 이벤트 및 메서드 목록을 배열로 반환하는 방식이 더 편리할 수 있습니다. 라라벨은 자동으로 구독자 클래스명을 파악하여 등록합니다:

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
### 이벤트 구독자 등록하기

구독자 클래스를 작성했다면, 이제 이벤트 디스패처에 등록할 차례입니다. `EventServiceProvider`의 `$subscribe` 속성에 구독자 클래스를 추가하면 됩니다. 예를 들어, `UserEventSubscriber`를 등록하는 방법은 다음과 같습니다:

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