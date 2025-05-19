# 모킹 (Mocking)

- [소개](#introduction)
- [객체 목(mock) 생성](#mocking-objects)
- [파사드 목(mock) 생성](#mocking-facades)
    - [파사드 스파이](#facade-spies)
- [버스(Bus) 파사드 페이크](#bus-fake)
    - [잡 체인(체이닝)](#bus-job-chains)
    - [잡 배치(batch)](#job-batches)
- [이벤트(Event) 페이크](#event-fake)
    - [범위 지정 이벤트 페이크](#scoped-event-fakes)
- [HTTP 페이크](#http-fake)
- [메일(Mail) 페이크](#mail-fake)
- [알림(Notification) 페이크](#notification-fake)
- [큐(Queue) 페이크](#queue-fake)
    - [잡 체인(체이닝)](#job-chains)
- [스토리지(Storage) 페이크](#storage-fake)
- [시간 제어와 테스트](#interacting-with-time)

<a name="introduction"></a>
## 소개

라라벨 애플리케이션을 테스트할 때, 테스트 실행 중 실제로 실행되지 않도록 애플리케이션의 특정 부분을 "목(mock)"으로 대체하고 싶을 때가 있습니다. 예를 들어, 이벤트를 디스패치하는 컨트롤러를 테스트할 때는 이벤트 리스너가 실제로 실행되는 걸 막고, 오직 컨트롤러의 HTTP 응답만 테스트하고 싶을 수 있습니다. 이벤트 리스너는 별도의 테스트 케이스에서 따로 검증할 수 있기 때문입니다.

라라벨에는 이벤트, 잡, 그리고 기타 파사드(facade) 등을 손쉽게 목 처리할 수 있는 다양한 메서드가 내장되어 있습니다. 이러한 헬퍼들은 Mockery보다 훨씬 간편하게 목 객체를 만들고 사용할 수 있게 해줍니다.

<a name="mocking-objects"></a>
## 객체 목(mock) 생성

라라벨의 [서비스 컨테이너](/docs/8.x/container)를 통해 주입되는 객체를 목(mock)으로 테스트하려면, 목 객체를 `instance` 바인딩으로 컨테이너에 등록해야 합니다. 이렇게 하면 컨테이너는 객체를 직접 생성하는 대신, 여러분이 생성한 목 객체를 주입하게 됩니다.

```
use App\Service;
use Mockery;
use Mockery\MockInterface;

public function test_something_can_be_mocked()
{
    $this->instance(
        Service::class,
        Mockery::mock(Service::class, function (MockInterface $mock) {
            $mock->shouldReceive('process')->once();
        })
    );
}
```

이 과정을 더 편리하게 하기 위해, 라라벨의 기본 테스트 케이스 클래스에는 `mock` 메서드가 준비되어 있습니다. 아래 예시는 위와 같은 효과를 갖습니다.

```
use App\Service;
use Mockery\MockInterface;

$mock = $this->mock(Service::class, function (MockInterface $mock) {
    $mock->shouldReceive('process')->once();
});
```

객체의 일부 메서드만 목으로 대체하고 싶다면, `partialMock` 메서드를 사용할 수 있습니다. 목 처리하지 않은 다른 메서드들은 호출 시 실제로 동작합니다.

```
use App\Service;
use Mockery\MockInterface;

$mock = $this->partialMock(Service::class, function (MockInterface $mock) {
    $mock->shouldReceive('process')->once();
});
```

비슷하게, [spy](http://docs.mockery.io/en/latest/reference/spies.html)를 사용해 객체의 실제 동작을 기록만 하고 싶을 때는, 라라벨 테스트 기본 클래스의 `spy` 메서드를 이용할 수 있습니다. 스파이는 목과 유사하지만, 테스트 코드 실행 후 해당 메서드가 실제로 호출됐는지 검증할 수 있도록 상호작용을 기록합니다.

```
use App\Service;

$spy = $this->spy(Service::class);

// ...

$spy->shouldHaveReceived('process');
```

<a name="mocking-facades"></a>
## 파사드 목(mock) 생성

전통적인 static 메서드 호출과 달리, [파사드(facade)](/docs/8.x/facades)와 [실시간(Real-time) 파사드](/docs/8.x/facades#real-time-facades)는 목(mock) 처리가 가능합니다. 이는 전통적인 static 메서드보다 뛰어난 테스트 작성 가능성을 제공하며, DI(의존성 주입)처럼 쉽게 테스트할 수 있도록 해줍니다.

테스트 중 컨트롤러 등에서 파사드 메서드 호출을 대체하고 싶다면, 아래와 같이 사용할 수 있습니다.

```
<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Cache;

class UserController extends Controller
{
    /**
     * 애플리케이션에 등록된 모든 사용자의 목록을 조회합니다.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $value = Cache::get('key');

        //
    }
}
```

`Cache` 파사드에 대한 호출을 목으로 대체하려면 `shouldReceive` 메서드를 사용하면 됩니다. 이는 [Mockery](https://github.com/padraic/mockery)의 목 객체를 반환합니다. 파사드는 실제로 라라벨 [서비스 컨테이너](/docs/8.x/container)에서 resolve(해결)되고 관리되므로, 일반 static 클래스보다 높은 테스트 유연성을 제공합니다. `Cache` 파사드의 `get` 메서드 호출을 목 처리하려면 다음과 같이 작성할 수 있습니다.

```
<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    public function testGetIndex()
    {
        Cache::shouldReceive('get')
                    ->once()
                    ->with('key')
                    ->andReturn('value');

        $response = $this->get('/users');

        // ...
    }
}
```

> [!NOTE]
> `Request` 파사드는 목(mock) 처리하지 마시기 바랍니다. 대신, 테스트할 때 [HTTP 테스트 메서드](/docs/8.x/http-tests)에 원하는 입력값을 전달하세요. 마찬가지로, `Config` 파사드를 목 처리하는 대신 테스트 안에서 `Config::set` 메서드를 호출하면 됩니다.

<a name="facade-spies"></a>
### 파사드 스파이

파사드를 [spy](http://docs.mockery.io/en/latest/reference/spies.html)로 감시하고 싶다면, 해당 파사드에서 `spy` 메서드를 호출하면 됩니다. 스파이는 목 객체와 유사하지만, 실제 호출 기록이 남아 이후 검증(assertion)이 가능합니다.

```
use Illuminate\Support\Facades\Cache;

public function test_values_are_be_stored_in_cache()
{
    Cache::spy();

    $response = $this->get('/');

    $response->assertStatus(200);

    Cache::shouldHaveReceived('put')->once()->with('name', 'Taylor', 10);
}
```

<a name="bus-fake"></a>
## 버스(Bus) 파사드 페이크

잡(jobs)을 디스패치(dispatch)하는 코드를 테스트할 때, 실제로 잡이 큐(queue)에 들어가거나 실행되는 것까지 테스트하고 싶지 않을 수 있습니다. 잡 자체의 실행은 대개 별도의 테스트에서 검증할 수 있기 때문입니다.

잡이 실제로 큐에 들어가지 않게 하려면, `Bus` 파사드의 `fake` 메서드를 사용할 수 있습니다. 이후 테스트 코드 실행 후 `assertDispatched`, `assertNotDispatched` 등의 메서드로 어떤 잡이 디스패치되려고 했는지 간단히 검증할 수 있습니다.

```
<?php

namespace Tests\Feature;

use App\Jobs\ShipOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Support\Facades\Bus;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_orders_can_be_shipped()
    {
        Bus::fake();

        // Perform order shipping...

        // 잡이 디스패치 되었는지 검증...
        Bus::assertDispatched(ShipOrder::class);

        // 특정 잡이 디스패치되지 않았는지 검증...
        Bus::assertNotDispatched(AnotherJob::class);

        // 잡이 동기적으로 디스패치 되었는지 검증...
        Bus::assertDispatchedSync(AnotherJob::class);

        // 잡이 동기적으로 디스패치되지 않았는지 검증...
        Bus::assertNotDispatchedSync(AnotherJob::class);

        // 응답 전송 후 잡이 디스패치 되었는지 검증...
        Bus::assertDispatchedAfterResponse(AnotherJob::class);

        // 응답 전송 후 잡이 디스패치되지 않았는지 검증...
        Bus::assertNotDispatchedAfterResponse(AnotherJob::class);

        // 아무런 잡이 디스패치되지 않았는지 검증...
        Bus::assertNothingDispatched();
    }
}
```

이러한 메서드들에는 클로저를 전달하여, 주어진 "조건"을 만족하는 잡이 실제로 디스패치됐는지 세밀하게 검증할 수도 있습니다. 예를 들어, 특정 주문에 대한 잡이 디스패치됐는지 확인하려면 다음과 같이 작성합니다.

```
Bus::assertDispatched(function (ShipOrder $job) use ($order) {
    return $job->order->id === $order->id;
});
```

<a name="bus-job-chains"></a>
### 잡 체인(체이닝)

`Bus` 파사드의 `assertChained` 메서드를 사용하면, [잡 체인](/docs/8.x/queues#job-chaining)이 디스패치 되었는지 검증할 수 있습니다. 첫 번째 인자로 체인에 포함된 잡들의 배열을 받습니다.

```
use App\Jobs\RecordShipment;
use App\Jobs\ShipOrder;
use App\Jobs\UpdateInventory;
use Illuminate\Support\Facades\Bus;

Bus::assertChained([
    ShipOrder::class,
    RecordShipment::class,
    UpdateInventory::class
]);
```

위 예시처럼, 잡 클래스명을 배열로 제공할 수도 있고, 실제 잡 인스턴스의 배열을 넘겨도 됩니다. 잡 인스턴스를 사용할 경우 라라벨은 인스턴스의 클래스명과 속성 값이 실제 디스패치된 잡과 동일한지까지 확인합니다.

```
Bus::assertChained([
    new ShipOrder,
    new RecordShipment,
    new UpdateInventory,
]);
```

<a name="job-batches"></a>
### 잡 배치(batch)

`Bus` 파사드의 `assertBatched` 메서드는 [잡 배치](/docs/8.x/queues#job-batching)가 디스패치 되었는지 검증합니다. 전달한 클로저에는 `Illuminate\Bus\PendingBatch` 인스턴스가 전달되며, 배치에 포함된 잡을 확인할 수 있습니다.

```
use Illuminate\Bus\PendingBatch;
use Illuminate\Support\Facades\Bus;

Bus::assertBatched(function (PendingBatch $batch) {
    return $batch->name == 'import-csv' &&
           $batch->jobs->count() === 10;
});
```

<a name="event-fake"></a>
## 이벤트(Event) 페이크

이벤트를 디스패치하는 코드를 테스트할 때 실제로 이벤트 리스너가 실행되지 않도록 하려면, `Event` 파사드의 `fake` 메서드를 사용하세요. 이렇게 하면, 리스너가 동작하지 않고도 테스트 코드를 실행한 뒤, 어떤 이벤트가 디스패치 됐는지를 `assertDispatched`, `assertNotDispatched`, `assertNothingDispatched` 메서드로 검증할 수 있습니다.

```
<?php

namespace Tests\Feature;

use App\Events\OrderFailedToShip;
use App\Events\OrderShipped;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * 주문 배송 테스트
     */
    public function test_orders_can_be_shipped()
    {
        Event::fake();

        // Perform order shipping...

        // 이벤트가 디스패치 되었는지 검증...
        Event::assertDispatched(OrderShipped::class);

        // 이벤트가 두 번 디스패치 되었는지 검증...
        Event::assertDispatched(OrderShipped::class, 2);

        // 특정 이벤트가 디스패치되지 않았는지 검증...
        Event::assertNotDispatched(OrderFailedToShip::class);

        // 아무런 이벤트도 디스패치되지 않았는지 검증...
        Event::assertNothingDispatched();
    }
}
```

`assertDispatched`, `assertNotDispatched` 등의 메서드에도 클로저를 전달할 수 있습니다. 클로저는 "조건"을 만족하는 이벤트가 디스패치 됐는지를 세부적으로 검증할 때 유용합니다.

```
Event::assertDispatched(function (OrderShipped $event) use ($order) {
    return $event->order->id === $order->id;
});
```

이벤트 리스너가 특정 이벤트를 청취(listen)하는지 검증하고 싶다면, `assertListening` 메서드를 사용할 수 있습니다.

```
Event::assertListening(
    OrderShipped::class,
    SendShipmentNotification::class
);
```

> [!NOTE]
> `Event::fake()`를 호출하면 모든 이벤트 리스너가 실제로 실행되지 않습니다. 만약 테스트에서 이벤트에 의존하는 모델 팩토리(예: 모델 `creating` 이벤트에서 UUID를 생성) 등을 사용하는 경우, 팩토리를 먼저 사용한 뒤 `Event::fake()`를 호출해야 합니다.

<a name="faking-a-subset-of-events"></a>
#### 일부 이벤트만 페이크 처리하기

특정 이벤트에 대해서만 리스너가 실행되지 않도록 하고 싶다면, `fake` 또는 `fakeFor` 메서드에 해당 이벤트 목록을 배열로 전달하면 됩니다.

```
/**
 * 주문 처리 테스트
 */
public function test_orders_can_be_processed()
{
    Event::fake([
        OrderCreated::class,
    ]);

    $order = Order::factory()->create();

    Event::assertDispatched(OrderCreated::class);

    // 그 외의 이벤트는 평소처럼 디스패치되고 리스너가 실행됩니다...
    $order->update([...]);
}
```

<a name="scoped-event-fakes"></a>
### 범위 지정 이벤트 페이크

테스트의 특정 구간에서만 이벤트 리스너를 실행하지 않도록 페이크 처리하려면, `fakeFor` 메서드를 사용하면 됩니다.

```
<?php

namespace Tests\Feature;

use App\Events\OrderCreated;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * 주문 처리 테스트
     */
    public function test_orders_can_be_processed()
    {
        $order = Event::fakeFor(function () {
            $order = Order::factory()->create();

            Event::assertDispatched(OrderCreated::class);

            return $order;
        });

        // 이후부터는 이벤트가 정상적으로 디스패치되고 옵저버가 실행됩니다 ...
        $order->update([...]);
    }
}
```

<a name="http-fake"></a>
## HTTP 페이크

`Http` 파사드의 `fake` 메서드를 사용하면, HTTP 클라이언트가 외부로 요청을 보내는 대신 미리 준비한 더미/가짜 응답을 반환하도록 변경할 수 있습니다. 외부 HTTP 요청 페이크 처리 방법은 [HTTP 클라이언트 테스트 문서](/docs/8.x/http-client#testing)를 참고하세요.

<a name="mail-fake"></a>
## 메일(Mail) 페이크

`Mail` 파사드의 `fake` 메서드를 사용하면, 실제로 메일이 전송되는 것을 막을 수 있습니다. 일반적으로 메일 전송 자체는 실제로 테스트할 대상과는 직접적 관련이 없는 경우가 많으니, 라라벨이 특정 전달 객체(mailable)를 전송하도록 지시했는지만 검증하는 것으로 충분합니다.

`Mail::fake()`를 호출한 후에는, [mailable](/docs/8.x/mail)가 실제로 전송 요청됐는지 여부를 검증하거나, 전달된 데이터까지 확인할 수 있습니다.

```
<?php

namespace Tests\Feature;

use App\Mail\OrderShipped;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_orders_can_be_shipped()
    {
        Mail::fake();

        // Perform order shipping...

        // 아무런 mailable이 전송되지 않았는지 확인...
        Mail::assertNothingSent();

        // 특정 mailable이 전송됐는지 확인...
        Mail::assertSent(OrderShipped::class);

        // 특정 mailable이 두 번 전송됐는지 확인...
        Mail::assertSent(OrderShipped::class, 2);

        // 다른 mailable이 전송되지 않았는지 확인...
        Mail::assertNotSent(AnotherMailable::class);
    }
}
```

만약 mailable을 백그라운드에서 큐로 전송한다면, `assertSent` 대신 `assertQueued` 메서드를 사용해야 합니다.

```
Mail::assertQueued(OrderShipped::class);

Mail::assertNotQueued(OrderShipped::class);

Mail::assertNothingQueued();
```

`assertSent`, `assertNotSent`, `assertQueued`, `assertNotQueued` 등에는 클로저를 전달해, 조건을 만족하는 mailable이 실제 전송됐는지 세밀하게 검증할 수 있습니다.

```
Mail::assertSent(function (OrderShipped $mail) use ($order) {
    return $mail->order->id === $order->id;
});
```

메일 수신자 정보를 확인하려면, 클로저 인자로 전달된 mailable 인스턴스의 편의 메서드를 활용할 수 있습니다.

```
Mail::assertSent(OrderShipped::class, function ($mail) use ($user) {
    return $mail->hasTo($user->email) &&
           $mail->hasCc('...') &&
           $mail->hasBcc('...');
});
```

메시지가 전송되지 않았음을 검증하는 메서드는 `assertNotSent`와 `assertNotQueued` 두 가지가 있습니다. 메일이 전송되지 **않았고** 큐에도 들어가지 않았음을 한 번에 확인하려면, `assertNothingOutgoing` 또는 `assertNotOutgoing` 메서드를 사용할 수 있습니다.

```
Mail::assertNothingOutgoing();

Mail::assertNotOutgoing(function (OrderShipped $mail) use ($order) {
    return $mail->order->id === $order->id;
});
```

<a name="notification-fake"></a>
## 알림(Notification) 페이크

`Notification` 파사드의 `fake` 메서드를 사용하면, 실제로 알림이 전송되지 않도록 할 수 있습니다. 거의 대부분의 경우, 전달된 알림이 실제로 사용자에게 전송되는지 보다는, "라라벨이 해당 알림을 전송하도록 지시했는가"만을 확인하는 것으로 충분합니다.

`Notification::fake()` 호출 후에는, [알림](/docs/8.x/notifications)이 실제로 전송됐는지, 그리고 어떤 데이터가 전달됐는지 아래와 같이 검증할 수 있습니다.

```
<?php

namespace Tests\Feature;

use App\Notifications\OrderShipped;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_orders_can_be_shipped()
    {
        Notification::fake();

        // Perform order shipping...

        // 아무런 알림도 전송되지 않았는지 검증...
        Notification::assertNothingSent();

        // 주어진 사용자에게 알림이 전송됐는지 검증...
        Notification::assertSentTo(
            [$user], OrderShipped::class
        );

        // 다른 알림이 전송되지 않았는지 검증...
        Notification::assertNotSentTo(
            [$user], AnotherNotification::class
        );
    }
}
```

`assertSentTo`, `assertNotSentTo`에 클로저를 전달해, 특정 조건을 만족하는 알림이 실제 전송됐는지 세부적으로 검증할 수 있습니다.

```
Notification::assertSentTo(
    $user,
    function (OrderShipped $notification, $channels) use ($order) {
        return $notification->order->id === $order->id;
    }
);
```

<a name="on-demand-notifications"></a>
#### 온디맨드(즉시) 알림

테스트하는 코드가 [온디맨드 알림](/docs/8.x/notifications#on-demand-notifications)을 전송했다면, 알림이 `Illuminate\Notifications\AnonymousNotifiable` 인스턴스에 전송됐는지 검증해야 합니다.

```
use Illuminate\Notifications\AnonymousNotifiable;

Notification::assertSentTo(
    new AnonymousNotifiable, OrderShipped::class
);
```

알림 검증 메서드의 세 번째 인자로 클로저를 전달하면, 온디맨드 알림이 올바른 "route" 주소로 전송됐는지 추가적으로 확인할 수 있습니다.

```
Notification::assertSentTo(
    new AnonymousNotifiable,
    OrderShipped::class,
    function ($notification, $channels, $notifiable) use ($user) {
        return $notifiable->routes['mail'] === $user->email;
    }
);
```

<a name="queue-fake"></a>
## 큐(Queue) 페이크

`Queue` 파사드의 `fake` 메서드를 사용하면, 큐에 들어가는 잡이 실제로 큐에 push 되지 않도록 막을 수 있습니다. 대부분의 경우, "라라벨이 특정 잡을 큐에 푸시(push)하도록 지시했는가"만 따져 보고, 잡의 구현 및 실행은 별도 테스트에서 검증하면 충분합니다.

`Queue::fake()` 호출 후에는, 애플리케이션에서 잡을 큐에 보내려 했는지 다양하게 검증할 수 있습니다.

```
<?php

namespace Tests\Feature;

use App\Jobs\AnotherJob;
use App\Jobs\FinalJob;
use App\Jobs\ShipOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_orders_can_be_shipped()
    {
        Queue::fake();

        // Perform order shipping...

        // 아무 잡도 푸시되지 않았는지 검증...
        Queue::assertNothingPushed();

        // 특정 큐에 잡이 푸시됐는지 검증...
        Queue::assertPushedOn('queue-name', ShipOrder::class);

        // 잡이 두 번 푸시됐는지 검증...
        Queue::assertPushed(ShipOrder::class, 2);

        // 잡이 푸시되지 않았는지 검증...
        Queue::assertNotPushed(AnotherJob::class);
    }
}
```

`assertPushed`, `assertNotPushed` 등의 메서드에는 클로저를 활용해, 조건을 만족하는 잡이 실제로 푸시됐는지 세밀하게 확인할 수 있습니다.

```
Queue::assertPushed(function (ShipOrder $job) use ($order) {
    return $job->order->id === $order->id;
});
```

<a name="job-chains"></a>
### 잡 체인(체이닝)

`Queue` 파사드의 `assertPushedWithChain` 및 `assertPushedWithoutChain` 메서드는, 큐에 푸시된 잡의 체인(chain)을 검증하는 용도로 활용할 수 있습니다. `assertPushedWithChain`는 첫 번째 인자로 기본 잡, 두 번째 인자로 체인에 연결될 잡들의 배열을 받습니다.

```
use App\Jobs\RecordShipment;
use App\Jobs\ShipOrder;
use App\Jobs\UpdateInventory;
use Illuminate\Support\Facades\Queue;

Queue::assertPushedWithChain(ShipOrder::class, [
    RecordShipment::class,
    UpdateInventory::class
]);
```

위 예시처럼 잡 클래스명을 배열로 넘길 수도 있고, 실제 잡 인스턴스의 배열도 막힘없이 사용할 수 있습니다. 잡 인스턴스를 넘기면, 라라벨이 해당 인스턴스의 클래스와 속성 값이 실제 체인과 같은지까지 확인합니다.

```
Queue::assertPushedWithChain(ShipOrder::class, [
    new RecordShipment,
    new UpdateInventory,
]);
```

잡 체인 없이 잡이 푸시됐는지 확인하려면 `assertPushedWithoutChain` 메서드를 사용할 수 있습니다.

```
Queue::assertPushedWithoutChain(ShipOrder::class);
```

<a name="storage-fake"></a>
## 스토리지(Storage) 페이크

`Storage` 파사드의 `fake` 메서드를 활용하면, 가짜 디스크를 쉽게 생성해 테스트 파일 업로드를 훨씬 쉽고 빠르게 진행할 수 있습니다. `Illuminate\Http\UploadedFile` 클래스의 파일 생성 기능과 조합해 사용하면 매우 편리합니다.

```
<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_albums_can_be_uploaded()
    {
        Storage::fake('photos');

        $response = $this->json('POST', '/photos', [
            UploadedFile::fake()->image('photo1.jpg'),
            UploadedFile::fake()->image('photo2.jpg')
        ]);

        // 한 개 파일 또는 여러 파일이 저장됐는지 확인...
        Storage::disk('photos')->assertExists('photo1.jpg');
        Storage::disk('photos')->assertExists(['photo1.jpg', 'photo2.jpg']);

        // 파일이 저장되지 않았는지 확인...
        Storage::disk('photos')->assertMissing('missing.jpg');
        Storage::disk('photos')->assertMissing(['missing.jpg', 'non-existing.jpg']);
    }
}
```

파일 업로드 테스트에 대한 자세한 내용은 [HTTP 테스트 문서의 파일 업로드](/docs/8.x/http-tests#testing-file-uploads) 항목을 참고하세요.

> [!TIP]
> 기본적으로 `fake` 메서드는 임시 디렉토리 내의 파일을 모두 삭제합니다. 테스트가 끝난 후에도 파일을 유지하고 싶다면, "persistentFake" 메서드를 사용하세요.

<a name="interacting-with-time"></a>
## 시간 제어와 테스트

테스트 도중, `now` 또는 `Illuminate\Support\Carbon::now()`와 같은 헬퍼가 반환하는 시간을 임의로 조정해야 할 때가 있습니다. 다행히 라라벨의 기본 feature 테스트 클래스에는 현재 시간을 쉽게 조작할 수 있는 헬퍼 메서드가 포함되어 있습니다.

```
public function testTimeCanBeManipulated()
{
    // 미래로 이동...
    $this->travel(5)->milliseconds();
    $this->travel(5)->seconds();
    $this->travel(5)->minutes();
    $this->travel(5)->hours();
    $this->travel(5)->days();
    $this->travel(5)->weeks();
    $this->travel(5)->years();

    // 과거로 이동...
    $this->travel(-5)->hours();

    // 특정 시점으로 이동...
    $this->travelTo(now()->subHours(6));

    // 현재 시간으로 복귀...
    $this->travelBack();
}
```
