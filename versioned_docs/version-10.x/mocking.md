# 모킹 (Mocking)

- [소개](#introduction)
- [객체 모킹](#mocking-objects)
- [파사드 모킹](#mocking-facades)
    - [파사드 스파이](#facade-spies)
- [시간과의 상호작용](#interacting-with-time)

<a name="introduction"></a>
## 소개

라라벨 애플리케이션을 테스트할 때, 특정 부분이 실제로 실행되지 않도록 "목(mock)"을 사용할 수 있습니다. 예를 들어, 이벤트를 디스패치하는 컨트롤러를 테스트할 때, 이벤트 리스너가 실제로 실행되지 않도록 모킹하여 테스트가 가능하도록 할 수 있습니다. 이렇게 하면 이벤트 리스너의 실제 동작은 신경 쓰지 않고도 컨트롤러의 HTTP 응답만 테스트할 수 있습니다. 이벤트 리스너 자체는 별도의 테스트에서 충분히 검증하면 됩니다.

라라벨은 이벤트, 잡(job), 그리고 기타 파사드 등을 손쉽게 모킹할 수 있는 여러 메서드를 기본으로 제공합니다. 이 헬퍼들은 Mockery의 복잡한 메서드 호출을 직접 작성하지 않아도 되어 편리하게 모킹을 도와줍니다.

<a name="mocking-objects"></a>
## 객체 모킹

라라벨의 [서비스 컨테이너](/docs/10.x/container)를 통해 주입되는 객체를 모킹하고자 할 때에는, 모킹한 인스턴스를 `instance` 바인딩으로 컨테이너에 등록해야 합니다. 이렇게 하면, 컨테이너가 해당 객체를 직접 생성하는 대신 여러분이 준비한 목(Mock) 객체를 사용하도록 할 수 있습니다.

```
use App\Service;
use Mockery;
use Mockery\MockInterface;

public function test_something_can_be_mocked(): void
{
    $this->instance(
        Service::class,
        Mockery::mock(Service::class, function (MockInterface $mock) {
            $mock->shouldReceive('process')->once();
        })
    );
}
```

더 간편하게 모킹할 수 있도록, 라라벨 테스트 케이스의 기본 클래스에서는 `mock` 메서드를 제공합니다. 아래 예시는 위의 방법과 동일하게 작동합니다.

```
use App\Service;
use Mockery\MockInterface;

$mock = $this->mock(Service::class, function (MockInterface $mock) {
    $mock->shouldReceive('process')->once();
});
```

특정 메서드만 모킹하고 나머지 메서드는 실제 로직대로 동작시키고 싶다면 `partialMock` 메서드를 사용할 수 있습니다. 모킹하지 않은 메서드는 호출 시 원래의 동작 그대로 실행됩니다.

```
use App\Service;
use Mockery\MockInterface;

$mock = $this->partialMock(Service::class, function (MockInterface $mock) {
    $mock->shouldReceive('process')->once();
});
```

이와 비슷하게, 객체의 동작을 [스파이(spy)](http://docs.mockery.io/en/latest/reference/spies.html)하고 싶을 때에는, `Mockery::spy`의 편리한 래퍼로 라라벨 테스트 케이스의 `spy` 메서드를 사용할 수 있습니다. 스파이는 목(Mocking)과 유사하지만, 실제 코드가 수행된 뒤에 그 상호작용(어떤 메서드가 몇 번 호출됐는지 등)을 기록해두었다가, 그 단위 테스트 끝에 assert로 검증할 수 있습니다.

```
use App\Service;

$spy = $this->spy(Service::class);

// ...

$spy->shouldHaveReceived('process');
```

<a name="mocking-facades"></a>
## 파사드 모킹

전통적인 static 메서드 호출과 달리, [파사드](/docs/10.x/facades)([실시간 파사드](/docs/10.x/facades#real-time-facades) 포함)는 모킹이 가능합니다. 이로 인해 전통적인 static 메서드보다 훨씬 더 테스트하기 쉬우며, 의존성 주입을 이용한 경우와 동일 수준의 테스트 용이성을 누릴 수 있습니다. 예를 들어, 컨트롤러 내부에서 라라벨 파사드를 호출하는 코드를 테스트할 때 파사드의 메서드 호출을 간편하게 모킹할 수 있습니다.

예를 들어, 다음과 같은 컨트롤러 액션을 보겠습니다.

```
<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Cache;

class UserController extends Controller
{
    /**
     * 애플리케이션의 모든 사용자 목록을 조회합니다.
     */
    public function index(): array
    {
        $value = Cache::get('key');

        return [
            // ...
        ];
    }
}
```

위 코드의 `Cache` 파사드 호출은 `shouldReceive` 메서드를 사용해 모킹할 수 있습니다. 이 메서드는 [Mockery](https://github.com/padraic/mockery)가 제공하는 mock 객체 인스턴스를 반환합니다. 파사드는 실제로 라라벨의 [서비스 컨테이너](/docs/10.x/container)를 통해 해석되고 관리되기 때문에, 일반적인 static 클래스보다 훨씬 뛰어난 테스트 용이성을 가집니다. 아래 예시에서는 `Cache` 파사드의 `get` 메서드 호출을 모킹하는 방법을 보여줍니다.

```
<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    public function test_get_index(): void
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

> [!WARNING]
> `Request` 파사드는 모킹하지 말아야 합니다. 대신 원하는 입력값을 [HTTP 테스트 메서드](/docs/10.x/http-tests)인 `get`이나 `post`에 전달해 테스트를 진행하세요. 이와 마찬가지로 `Config` 파사드도 모킹하지 않고, 테스트 내에서 `Config::set` 메서드를 호출하여 값을 설정하는 것이 바람직합니다.

<a name="facade-spies"></a>
### 파사드 스파이

파사드에 대해 [스파이](http://docs.mockery.io/en/latest/reference/spies.html)를 사용하고 싶다면, 해당 파사드의 `spy` 메서드를 호출하면 됩니다. 스파이는 목(Mocking)과 유사하지만, 실제로 해당 메서드가 호출되는지 여부와 인자, 호출 횟수 등을 기록해 뒀다가, 코드 실행 후 assert로 검증할 수 있습니다.

```
use Illuminate\Support\Facades\Cache;

public function test_values_are_be_stored_in_cache(): void
{
    Cache::spy();

    $response = $this->get('/');

    $response->assertStatus(200);

    Cache::shouldHaveReceived('put')->once()->with('name', 'Taylor', 10);
}
```

<a name="interacting-with-time"></a>
## 시간과의 상호작용

테스트를 작성할 때, `now` 또는 `Illuminate\Support\Carbon::now()` 같은 헬퍼가 반환하는 시간을 임의로 변경해야 할 상황이 있을 수 있습니다. 다행히도, 라라벨의 기본 기능 테스트 클래스에서는 현재 시간을 손쉽게 조작할 수 있는 헬퍼들을 지원합니다.

```
use Illuminate\Support\Carbon;

public function test_time_can_be_manipulated(): void
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

    // 현재 시점으로 복귀...
    $this->travelBack();
}
```

또한 다양한 시간 이동 메서드에 클로저를 전달할 수도 있습니다. 이때, 클로저가 실행되는 동안 시간은 지정한 시점에 멈춰 있게 됩니다. 클로저 실행이 끝나면 다시 시간이 정상적으로 흐르기 시작합니다.

```
$this->travel(5)->days(function () {
    // 5일 후의 시점을 테스트...
});

$this->travelTo(now()->subDays(10), function () {
    // 지정한 시점으로 이동하여 로직을 테스트...
});
```

`freezeTime` 메서드를 사용하면 현재 시간을 고정(freeze)할 수 있습니다. 유사하게 `freezeSecond` 메서드는 현재 초의 시작 시점으로 시간을 고정할 수 있습니다.

```
use Illuminate\Support\Carbon;

// 시간을 고정하고, 클로저 실행 후 정상 시간으로 복귀...
$this->freezeTime(function (Carbon $time) {
    // ...
});

// 현재 초의 시작으로 시간을 고정한 뒤, 클로저 실행 후 정상 시간으로 복귀...
$this->freezeSecond(function (Carbon $time) {
    // ...
})
```

위에서 설명한 메서드들은, 토론 포럼에서 일정 시간 이상 활동이 없는 글을 잠그는 등, 시간에 민감하게 반응해야 하는 애플리케이션 동작을 테스트할 때 매우 유용하게 활용할 수 있습니다.

```
use App\Models\Thread;

public function test_forum_threads_lock_after_one_week_of_inactivity()
{
    $thread = Thread::factory()->create();
    
    $this->travel(1)->week();
    
    $this->assertTrue($thread->isLockedByInactivity());
}
```
