# 이벤트 (Events)

- [소개](#introduction)
- [이벤트 및 리스너 생성](#generating-events-and-listeners)
- [이벤트 및 리스너 등록](#registering-events-and-listeners)
    - [이벤트 자동 감지](#event-discovery)
    - [이벤트 수동 등록](#manually-registering-events)
    - [클로저 리스너](#closure-listeners)
- [이벤트 정의](#defining-events)
- [리스너 정의](#defining-listeners)
- [큐잉되는 이벤트 리스너](#queued-event-listeners)
    - [큐 직접 다루기](#manually-interacting-with-the-queue)
    - [데이터베이스 트랜잭션과 큐잉 리스너](#queued-event-listeners-and-database-transactions)
    - [실패한 작업 처리](#handling-failed-jobs)
- [이벤트 디스패치](#dispatching-events)
    - [데이터베이스 트랜잭션 이후 이벤트 디스패치](#dispatching-events-after-database-transactions)
- [이벤트 구독자](#event-subscribers)
    - [이벤트 구독자 작성](#writing-event-subscribers)
    - [이벤트 구독자 등록](#registering-event-subscribers)
- [테스트](#testing)
    - [특정 이벤트 가짜 처리](#faking-a-subset-of-events)
    - [스코프된 이벤트 페이크](#scoped-event-fakes)

<a name="introduction"></a>
## 소개

라라벨의 이벤트는 간단한 옵저버 패턴(Observer Pattern) 구현을 제공하여, 애플리케이션 내에서 발생하는 다양한 이벤트를 구독하고 리스닝할 수 있도록 해줍니다. 이벤트 클래스는 일반적으로 `app/Events` 디렉터리에, 관련 리스너는 `app/Listeners` 디렉터리에 보관됩니다. 이 디렉터리들이 애플리케이션에 없다면 걱정하지 마십시오. Artisan 콘솔 명령어로 이벤트나 리스너를 생성하면 자동으로 만들어집니다.

이벤트는 애플리케이션의 다양한 기능을 분리(디커플링)할 수 있는 훌륭한 방법입니다. 하나의 이벤트에 여러 개의 리스너가 존재할 수 있으며, 이 리스너들은 서로에게 의존하지 않습니다. 예를 들어, 주문이 배송될 때마다 사용자에게 Slack 알림을 보낼 수 있습니다. 주문 처리 코드와 Slack 알림 코드를 서로 엮지 않고, `App\Events\OrderShipped` 이벤트를 발생시키고, 리스너가 이 이벤트를 받아 Slack 알림을 보낼 수 있습니다.

<a name="generating-events-and-listeners"></a>
## 이벤트 및 리스너 생성

이벤트와 리스너를 빠르게 생성하려면, `make:event`와 `make:listener` Artisan 명령어를 사용할 수 있습니다.

```shell
php artisan make:event PodcastProcessed

php artisan make:listener SendPodcastNotification --event=PodcastProcessed
```

보다 편리하게, `make:event` 또는 `make:listener` 명령어를 인자 없이 실행하면 라라벨에서 클래스명을 입력하도록 안내하고, 리스너 생성 시에는 어떤 이벤트를 리스닝할지 물어봅니다.

```shell
php artisan make:event

php artisan make:listener
```

<a name="registering-events-and-listeners"></a>
## 이벤트 및 리스너 등록

<a name="event-discovery"></a>
### 이벤트 자동 감지

기본적으로 라라벨은 애플리케이션의 `Listeners` 디렉터리를 스캔하여 이벤트 리스너를 자동으로 찾아 등록합니다. 라라벨이 메서드명이 `handle` 또는 `__invoke`로 시작하는 리스너 클래스를 발견하면, 해당 메서드의 시그니처에 타입힌트된 이벤트를 리스닝하는 이벤트 리스너로 자동 등록합니다.

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

PHP의 유니언 타입을 활용해서 여러 이벤트를 동시에 수신할 수도 있습니다.

```
/**
 * Handle the given event.
 */
public function handle(PodcastProcessed|PodcastPublished $event): void
{
    // ...
}
```

리스너를 다른 디렉터리나 여러 디렉터리에 저장하고자 한다면, 애플리케이션의 `bootstrap/app.php` 파일에서 `withEvents` 메서드를 사용해 해당 디렉터리들을 스캔하도록 라라벨에 지시할 수 있습니다.

```
->withEvents(discover: [
    __DIR__.'/../app/Domain/Orders/Listeners',
])
```

`*` 와일드카드 문자를 사용하면 비슷한 여러 디렉터리도 한 번에 스캔할 수 있습니다.

```
->withEvents(discover: [
    __DIR__.'/../app/Domain/*/Listeners',
])
```

`event:list` 명령어를 사용하면 애플리케이션에 등록된 모든 리스너 목록을 확인할 수 있습니다.

```shell
php artisan event:list
```

<a name="event-discovery-in-production"></a>
#### 운영 환경에서의 이벤트 자동 감지

애플리케이션의 속도를 높이기 위해서는 `optimize` 또는 `event:cache` Artisan 명령어로 모든 리스너의 매니페스트를 캐시하는 것이 좋습니다. 이 명령어는 일반적으로 [배포 프로세스](/docs/11.x/deployment#optimization)의 일부로 실행되어야 하며, 만들어진 매니페스트는 프레임워크가 이벤트 등록을 더 빠르게 처리할 수 있게 도와줍니다. 캐시를 비우려면 `event:clear` 명령어를 사용하세요.

<a name="manually-registering-events"></a>
### 이벤트 수동 등록

`Event` 파사드를 사용해 애플리케이션의 `AppServiceProvider`의 `boot` 메서드 내에서 직접 이벤트와 그에 대응하는 리스너를 수동으로 등록할 수 있습니다.

```
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

`event:list` 명령어를 사용하면 애플리케이션에 등록된 모든 리스너를 확인할 수 있습니다.

```shell
php artisan event:list
```

<a name="closure-listeners"></a>
### 클로저 리스너

일반적으로 리스너는 클래스로 정의되지만, `AppServiceProvider`의 `boot` 메서드 내에서 클로저(익명 함수) 기반의 이벤트 리스너도 직접 등록할 수 있습니다.

```
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

클로저 기반 이벤트 리스너를 등록할 때, 해당 리스너 클로저를 `Illuminate\Events\queueable` 함수로 감싸주면 라라벨이 [큐](/docs/11.x/queues)를 사용해 비동기적으로 실행하게 할 수 있습니다.

```
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

큐잉된 작업처럼, `onConnection`, `onQueue`, `delay` 메서드를 활용해서 큐잉된 리스너의 실행 방법도 커스터마이징할 수 있습니다.

```
Event::listen(queueable(function (PodcastProcessed $event) {
    // ...
})->onConnection('redis')->onQueue('podcasts')->delay(now()->addSeconds(10)));
```

익명 큐잉 리스너의 실패를 별도로 처리하고 싶다면, `queueable` 리스너를 정의할 때 `catch` 메서드로 실패 시 실행할 클로저를 전달할 수 있습니다. 이 클로저는 이벤트 인스턴스와 리스너의 실패를 일으킨 `Throwable` 인스턴스를 전달받게 됩니다.

```
use App\Events\PodcastProcessed;
use function Illuminate\Events\queueable;
use Illuminate\Support\Facades\Event;
use Throwable;

Event::listen(queueable(function (PodcastProcessed $event) {
    // ...
})->catch(function (PodcastProcessed $event, Throwable $e) {
    // 큐잉된 리스너가 실패했습니다...
}));
```

<a name="wildcard-event-listeners"></a>
#### 와일드카드 이벤트 리스너

`*` 문자를 와일드카드 파라미터로 사용해, 여러 이벤트를 하나의 리스너에서 처리할 수도 있습니다. 와일드카드 리스너는 이벤트명을 첫 번째 인수, 이벤트 데이터 배열 전체를 두 번째 인수로 전달받습니다.

```
Event::listen('event.*', function (string $eventName, array $data) {
    // ...
});
```

<a name="defining-events"></a>
## 이벤트 정의

이벤트 클래스는 이벤트와 관련된 정보를 담는 데이터 컨테이너라고 할 수 있습니다. 예를 들어, `App\Events\OrderShipped` 이벤트가 [Eloquent ORM](/docs/11.x/eloquent) 객체를 전달받는다고 가정해보겠습니다.

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

보시다시피 이 이벤트 클래스에는 별도의 로직이 없습니다. `App\Models\Order` 인스턴스를 담고 있는 컨테이너 역할을 합니다. 이 이벤트에 사용된 `SerializesModels` 트레이트는, [큐잉 리스너](#queued-event-listeners) 등 이벤트 객체가 PHP의 `serialize` 함수를 통해 직렬화될 때 Eloquent 모델을 안전하게 직렬화할 수 있도록 해줍니다.

<a name="defining-listeners"></a>
## 리스너 정의

다음으로, 예시 이벤트에 대한 리스너를 살펴보겠습니다. 이벤트 리스너는 이벤트 인스턴스를 `handle` 메서드에서 전달받습니다. `make:listener` Artisan 명령어를 `--event` 옵션과 함께 실행하면 핸들 메서드에서 해당 이벤트 타입이 자동으로 임포트되어 타입힌트까지 추가됩니다. `handle` 메서드 내부에서 이벤트에 응답하기 위해 필요한 모든 작업을 수행할 수 있습니다.

```
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
        // $event->order를 사용해 주문 정보에 접근할 수 있습니다...
    }
}
```

> [!NOTE]  
> 이벤트 리스너의 생성자에서도 필요한 의존성을 타입힌트로 지정할 수 있습니다. 모든 이벤트 리스너는 라라벨의 [서비스 컨테이너](/docs/11.x/container)를 통해 생성되므로, 필요한 의존성은 자동으로 주입됩니다.

<a name="stopping-the-propagation-of-an-event"></a>
#### 이벤트 전파 중단하기

때로는 해당 이벤트가 다른 리스너로 더 이상 전달되지 않도록 중단하고 싶을 때가 있을 수 있습니다. 이런 경우 리스너의 `handle` 메서드에서 `false`를 반환하면 이벤트 전파를 중단할 수 있습니다.

<a name="queued-event-listeners"></a>
## 큐잉되는 이벤트 리스너

이벤트 리스너에서 이메일 발송, HTTP 요청 등 시간이 오래 걸리는 작업을 처리한다면, 리스너를 큐잉(비동기 처리)하는 것이 좋습니다. 큐잉 리스너를 사용하기 전에 [큐 설정](/docs/11.x/queues)을 마치고, 서버나 로컬 개발 환경에서 큐 워커를 실행해야 합니다.

특정 리스너를 큐잉하려면, 리스너 클래스에 `ShouldQueue` 인터페이스를 추가합니다. `make:listener` Artisan 명령어로 생성할 경우, 이 인터페이스가 네임스페이스에 이미 임포트되어 있어 바로 사용할 수 있습니다.

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

이것만으로도 충분합니다! 이제 이 리스너에서 처리하는 이벤트가 발생하면, 해당 리스너는 라라벨의 [큐 시스템](/docs/11.x/queues)을 통해 자동으로 큐에 등록됩니다. 리스너 실행 중 예외가 발생하지 않으면, 큐 작업이 성공적으로 끝난 뒤 자동으로 삭제됩니다.

<a name="customizing-the-queue-connection-queue-name"></a>
#### 큐 연결, 큐 이름, 딜레이 커스터마이징

리스너가 사용할 큐 연결명, 큐 이름 또는 딜레이(작업 지연 시간)를 커스터마이징하고 싶다면, 리스너 클래스에서 `$connection`, `$queue`, `$delay` 속성을 정의할 수 있습니다.

```
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendShipmentNotification implements ShouldQueue
{
    /**
     * 작업이 전달될 큐 연결 이름
     *
     * @var string|null
     */
    public $connection = 'sqs';

    /**
     * 작업이 전달될 큐 이름
     *
     * @var string|null
     */
    public $queue = 'listeners';

    /**
     * 작업이 실제로 처리되기 전 대기 시간(초)
     *
     * @var int
     */
    public $delay = 60;
}
```

큐 연결, 큐 이름, 딜레이 값을 런타임에서 동적으로 정하고 싶다면, 리스너 클래스에 `viaConnection`, `viaQueue`, `withDelay` 메서드를 구현하면 됩니다.

```
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
 * 작업이 처리되기까지 대기할 초(second) 단위의 시간을 반환합니다.
 */
public function withDelay(OrderShipped $event): int
{
    return $event->highPriority ? 0 : 60;
}
```

<a name="conditionally-queueing-listeners"></a>
#### 리스너의 큐잉 조건 지정

경우에 따라 리스너가 큐잉되어야 하는지 여부를 런타임 데이터에 따라 정해야 할 때가 있습니다. 이런 경우, 리스너 클래스에 `shouldQueue` 메서드를 추가해 큐잉 여부를 판단할 수 있습니다. `shouldQueue` 메서드가 `false`를 반환하면 해당 리스너는 큐잉되지 않습니다.

```
<?php

namespace App\Listeners;

use App\Events\OrderCreated;
use Illuminate\Contracts\Queue\ShouldQueue;

class RewardGiftCard implements ShouldQueue
{
    /**
     * 고객에게 기프트 카드를 지급합니다.
     */
    public function handle(OrderCreated $event): void
    {
        // ...
    }

    /**
     * 리스너가 큐잉되어야 할지 여부를 판단합니다.
     */
    public function shouldQueue(OrderCreated $event): bool
    {
        return $event->order->subtotal >= 5000;
    }
}
```

<a name="manually-interacting-with-the-queue"></a>
### 큐 직접 다루기

리스너 내부에서 underlying 큐 작업의 `delete`, `release` 메서드에 직접 접근할 필요가 있다면, `Illuminate\Queue\InteractsWithQueue` 트레이트를 사용하면 됩니다. 이 트레이트는 기본적으로 생성된 리스너에 이미 포함되어 있습니다.

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
### 데이터베이스 트랜잭션과 큐잉 리스너

큐잉 리스너가 데이터베이스 트랜잭션 내에서 디스패치 될 때, 큐가 데이터베이스 트랜잭션이 커밋되기 전에 해당 리스너를 처리할 수도 있습니다. 이 경우, 트랜잭션 중에 모델이나 레코드에 대한 변경이 아직 DB에 반영되지 않았을 수 있으며, 트랜잭션 내에서 생성된 모델/레코드가 DB에 없을 수도 있습니다. 리스너가 이런 모델에 의존할 경우, 큐 작업 처리 중 예기치 않은 에러가 발생할 수 있습니다.

큐 연결 설정 파일의 `after_commit` 옵션이 `false`로 되어 있더라도, 리스너 클래스에 `ShouldQueueAfterCommit` 인터페이스를 구현하면 해당 리스너는 모든 열린 트랜잭션이 커밋된 후 디스패치됩니다.

```
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
> 이러한 문제를 안전하게 해결하는 방법은 [큐 작업과 데이터베이스 트랜잭션](/docs/11.x/queues#jobs-and-database-transactions) 문서를 참고하시기 바랍니다.

<a name="handling-failed-jobs"></a>
### 실패한 작업 처리

때로는 큐잉된 이벤트 리스너가 실패할 수 있습니다. 큐 워커가 허용하는 최대 시도 횟수를 초과하면, 리스너의 `failed` 메서드가 호출됩니다. `failed` 메서드는 이벤트 인스턴스와 실패의 원인이 된 `Throwable` 인스턴스를 전달받습니다.

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
     * 이벤트를 처리합니다.
     */
    public function handle(OrderShipped $event): void
    {
        // ...
    }

    /**
     * 큐 작업 실패 시 처리.
     */
    public function failed(OrderShipped $event, Throwable $exception): void
    {
        // ...
    }
}
```

<a name="specifying-queued-listener-maximum-attempts"></a>
#### 큐잉 리스너 최대 시도 횟수 지정

큐잉된 리스너에서 오류가 반복 발생할 경우, 무한으로 재시도하는 것을 방지하기 위해 시도 횟수나 재시도 허용 시간을 지정할 수 있습니다.

리스너 클래스에 `$tries` 속성을 정의하면, 리스너가 실패로 간주되기 전까지 몇 번까지 시도할지 정할 수 있습니다.

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
     * 큐잉 리스너의 최대 시도 횟수
     *
     * @var int
     */
    public $tries = 5;
}
```

실패 전 최대 시도 횟수 대신, 언제까지 시도할 지 타임아웃(만료 시각)을 정하고 싶으면, 리스너 클래스에 `retryUntil` 메서드를 추가하세요. 이 메서드는 `DateTime` 인스턴스를 반환해야 합니다.

```
use DateTime;

/**
 * 리스너의 타임아웃 시각 반환
 */
public function retryUntil(): DateTime
{
    return now()->addMinutes(5);
}
```

<a name="specifying-queued-listener-backoff"></a>
#### 큐잉 리스너 백오프(재시도 대기 시간) 지정

리스너에서 예외가 발생해 재시도가 필요할 때, 라라벨이 몇 초 후에 다시 시도할지 지정하고 싶다면 리스너 클래스에 `backoff` 속성을 설정할 수 있습니다.
```

/**
 * 큐잉 리스너 재시도 전 대기 초(second)
 *
 * @var int
 */
public $backoff = 3;
```

리스너의 백오프 시간을 더 복잡한 방식으로 산출하고 싶다면, 클래스에 `backoff` 메서드를 정의할 수 있습니다.

```
/**
 * 큐잉 리스너 재시도 전 대기 초(second) 반환
 */
public function backoff(): int
{
    return 3;
}
```

배열 형태로 "지수 백오프(exponential backoff)"를 쉽게 설정할 수도 있습니다. 아래 예시에서는 첫 번째 재시도는 1초, 두 번째는 5초, 세 번째와 이후는 10초씩 대기하게 됩니다.

```
/**
 * 큐잉 리스너 재시도 전 대기 초(second) 배열 반환
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

이벤트를 디스패치하려면, 해당 이벤트에서 static `dispatch` 메서드를 호출하면 됩니다. 이 메서드는 `Illuminate\Foundation\Events\Dispatchable` 트레이트를 이벤트에 적용할 때 사용할 수 있습니다. `dispatch` 메서드에 전달한 모든 인수는 이벤트의 생성자로 전달됩니다.

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

        // Order shipment logic...

        OrderShipped::dispatch($order);

        return redirect('/orders');
    }
}
```

조건에 따라 이벤트를 디스패치하고 싶다면, `dispatchIf`와 `dispatchUnless` 메서드를 사용할 수 있습니다.

```
OrderShipped::dispatchIf($condition, $order);

OrderShipped::dispatchUnless($condition, $order);
```

> [!NOTE]  
> 테스트를 작성할 때는 실제로 리스너가 실행되지 않더라도 특정 이벤트가 디스패치됐는지 확인(assert)할 수 있으면 편리합니다. 라라벨의 [내장 테스트 헬퍼](#testing)를 사용하면 매우 쉽게 확인할 수 있습니다.

<a name="dispatching-events-after-database-transactions"></a>
### 데이터베이스 트랜잭션 후 이벤트 디스패치

때로는 데이터베이스의 현재 트랜잭션이 커밋된 이후에만 라라벨이 이벤트를 디스패치하도록 하고 싶을 수 있습니다. 이 경우에는 이벤트 클래스에서 `ShouldDispatchAfterCommit` 인터페이스를 구현하면 됩니다.

이 인터페이스를 구현하면 라라벨은 현재 진행 중인 데이터베이스 트랜잭션이 커밋되기 전까지 이벤트를 디스패치하지 않습니다. 만약 트랜잭션이 실패하면, 이벤트는 폐기됩니다. 이벤트가 디스패치될 때 진행 중인 트랜잭션이 없다면 즉시 이벤트가 디스패치됩니다.

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

이벤트 구독자는 하나의 클래스 안에서 여러 이벤트를 구독(subscribe)할 수 있는 클래스를 의미합니다. 즉, 여러 이벤트 처리 메서드를 하나의 클래스에서 정의할 수 있습니다. 구독자 클래스는 반드시 `subscribe` 메서드를 정의해야 하며, 이 메서드에는 이벤트 디스패처 인스턴스가 전달됩니다. 전달된 디스패처에서 `listen` 메서드를 호출해 이벤트 리스너를 등록합니다.

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

이벤트 리스너 메서드가 구독자 클래스 내에 정의되어 있다면, `subscribe` 메서드에서 이벤트와 메서드명을 배열로 반환하는 것이 좀 더 편리할 수 있습니다. 라라벨은 이벤트 리스너를 등록할 때 구독자 클래스명을 자동으로 결정해줍니다.

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

구독자 클래스를 작성한 후, 해당 구독자의 핸들러 메서드들이 라라벨의 [이벤트 디스커버리 관례](#event-discovery)를 따르도록 정의되어 있다면 라라벨이 자동으로 등록해줍니다. 그렇지 않은 경우, `Event` 파사드의 `subscribe` 메서드를 사용해 구독자를 직접 등록할 수 있습니다. 보통 애플리케이션의 `AppServiceProvider`의 `boot` 메서드에서 이 작업을 수행합니다.

```
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
## 테스트하기(Testing)

이벤트를 디스패치하는 코드를 테스트할 때, 실제로 이벤트의 리스너를 실행시키지 않도록 라라벨에 지시하고 싶을 수 있습니다. 리스너의 코드는 직접적으로, 그리고 이벤트를 디스패치하는 코드와 별개로 테스트할 수 있기 때문입니다. 물론, 리스너 자체를 테스트할 때는 테스트에서 리스너 인스턴스를 생성해서 `handle` 메서드를 직접 호출해주면 됩니다.

`Event` 파사드의 `fake` 메서드를 사용하면, 리스너 실행을 방지하면서 테스트하고자 하는 코드가 실행된 후, `assertDispatched`, `assertNotDispatched`, `assertNothingDispatched` 등의 메서드를 이용해 애플리케이션에서 어떤 이벤트가 디스패치됐는지 확인할 수 있습니다.

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

`assertDispatched`나 `assertNotDispatched` 메서드에 클로저(익명 함수)를 전달하면, 해당 조건(truth test)에 부합하는 이벤트가 디스패치됐는지 확인할 수 있습니다. 조건을 만족하는 이벤트가 하나라도 디스패치됐다면 assert 문은 통과합니다.

```
Event::assertDispatched(function (OrderShipped $event) use ($order) {
    return $event->order->id === $order->id;
});
```

특정 이벤트에 리스너가 바인딩(listen)되어 있는지만 단순히 확인하고 싶다면, `assertListening` 메서드를 사용할 수 있습니다.

```
Event::assertListening(
    OrderShipped::class,
    SendShipmentNotification::class
);
```

> [!WARNING]  
> `Event::fake()`를 호출하면 이벤트 리스너가 모두 실행되지 않습니다. 따라서, 모델의 `creating` 이벤트에서 UUID를 생성하는 등 이벤트에 의존하는 모델 팩토리를 사용하는 경우, 팩토리를 사용한 **이후에** `Event::fake()`를 호출해야 합니다.

<a name="faking-a-subset-of-events"></a>
### 일부 이벤트만 가짜(Fake)로 처리하기

특정 이벤트 리스너만 가짜로 처리하고 싶다면, `fake` 또는 `fakeFor` 메서드에 해당 이벤트 목록을 전달하면 됩니다.

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

`except` 메서드를 사용하면 특정 이벤트를 제외한 나머지 모든 이벤트에 대해 가짜 처리를 할 수 있습니다.

```
Event::fake()->except([
    OrderCreated::class,
]);
```

<a name="scoped-event-fakes"></a>
### 스코프 단위 Fake 이벤트 처리(Scoped Event Fakes)

테스트 코드의 특정 부분에서만 이벤트 리스너를 가짜로 처리하고 싶을 때는, `fakeFor` 메서드를 사용할 수 있습니다.

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