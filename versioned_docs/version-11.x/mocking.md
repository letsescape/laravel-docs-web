# 모킹 (Mocking)

- [소개](#introduction)
- [오브젝트 모킹](#mocking-objects)
- [파사드 모킹](#mocking-facades)
    - [파사드 스파이](#facade-spies)
- [시간과 상호작용하기](#interacting-with-time)

<a name="introduction"></a>
## 소개

라라벨 애플리케이션을 테스트할 때, 특정 부분이 실제로 실행되지 않도록 "모킹(mock)"하고 싶을 때가 있습니다. 예를 들어, 이벤트를 디스패치하는 컨트롤러를 테스트할 때 이벤트 리스너가 실제로 동작하지 않길 원할 수 있습니다. 이렇게 하면 컨트롤러의 HTTP 응답만 테스트할 수 있고, 이벤트 리스너의 동작은 별도의 테스트 케이스에서 검증할 수 있습니다.

라라벨은 이벤트, 잡(jobs), 기타 파사드(facade)를 쉽게 모킹할 수 있는 편리한 메서드를 기본적으로 제공합니다. 이 도우미들은 복잡한 Mockery 코드 호출을 직접 작성하지 않아도 되도록 Mockery 위에 얇은 래퍼 역할을 해줍니다.

<a name="mocking-objects"></a>
## 오브젝트 모킹

라라벨의 [서비스 컨테이너](/docs/11.x/container)를 통해 애플리케이션에 주입될 오브젝트를 모킹할 때는, 모킹된 인스턴스를 `instance` 바인딩으로 컨테이너에 등록해야 합니다. 이렇게 하면 컨테이너가 직접 오브젝트를 생성하는 대신, 여러분이 만든 모킹 인스턴스를 사용하게 됩니다.

```php tab=Pest
use App\Service;
use Mockery;
use Mockery\MockInterface;

test('something can be mocked', function () {
    $this->instance(
        Service::class,
        Mockery::mock(Service::class, function (MockInterface $mock) {
            $mock->shouldReceive('process')->once();
        })
    );
});
```

```php tab=PHPUnit
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

더 쉽게 오브젝트를 모킹하려면 라라벨의 기본 테스트 케이스 클래스에서 제공하는 `mock` 메서드를 사용할 수 있습니다. 아래 예제는 위의 코드와 동일한 동작을 합니다.

```
use App\Service;
use Mockery\MockInterface;

$mock = $this->mock(Service::class, function (MockInterface $mock) {
    $mock->shouldReceive('process')->once();
});
```

오브젝트의 몇몇 메서드만 모킹하고 나머지는 원래 동작대로 실행하고 싶다면 `partialMock` 메서드를 사용할 수 있습니다. 이 메서드를 사용할 때, 모킹하지 않은 메서드는 호출 시 정상적으로 실행됩니다.

```
use App\Service;
use Mockery\MockInterface;

$mock = $this->partialMock(Service::class, function (MockInterface $mock) {
    $mock->shouldReceive('process')->once();
});
```

또한, 오브젝트에 대해 [스파이(spy)](http://docs.mockery.io/en/latest/reference/spies.html)를 사용하고 싶을 때는 라라벨 테스트 케이스의 `spy` 메서드를 이용할 수 있습니다. 스파이는 모킹과 비슷하지만, 테스트하는 코드와의 모든 상호작용을 기록하므로 코드 실행 이후에 assert를 할 수 있게 해줍니다.

```
use App\Service;

$spy = $this->spy(Service::class);

// ...

$spy->shouldHaveReceived('process');
```

<a name="mocking-facades"></a>
## 파사드 모킹

전통적인 static 메서드 호출과 달리, [파사드](/docs/11.x/facades) (그리고 [실시간 파사드](/docs/11.x/facades#real-time-facades))는 모킹이 가능합니다. 이는 기존 static 메서드보다 큰 장점이며, 의존성 주입을 사용하는 경우와 마찬가지로 뛰어난 테스트 가능성을 제공합니다. 컨트롤러에서 발생하는 파사드 호출을 테스트할 때 이런 방식이 자주 활용됩니다. 예를 들어, 다음과 같은 컨트롤러 액션을 살펴보겠습니다.

```
<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Cache;

class UserController extends Controller
{
    /**
     * 애플리케이션의 모든 사용자 목록을 가져옵니다.
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

`shouldReceive` 메서드를 사용하면 [Mockery](https://github.com/padraic/mockery)의 모킹 인스턴스를 통해 `Cache` 파사드 호출을 모킹할 수 있습니다. 파사드는 실제로 라라벨 [서비스 컨테이너](/docs/11.x/container)에서 해결(resolved)되고 관리되므로, 일반 static 클래스보다 훨씬 더 쉽게 테스트할 수 있습니다. 예를 들어, 아래는 `Cache` 파사드의 `get` 메서드 호출을 모킹하는 방법입니다.

```php tab=Pest
<?php

use Illuminate\Support\Facades\Cache;

test('get index', function () {
    Cache::shouldReceive('get')
        ->once()
        ->with('key')
        ->andReturn('value');

    $response = $this->get('/users');

    // ...
});
```

```php tab=PHPUnit
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
> `Request` 파사드는 모킹하지 않는 것이 좋습니다. 대신, 테스트를 실행할 때 [HTTP 테스트 메서드](/docs/11.x/http-tests)인 `get`, `post` 등에 원하는 입력값을 전달해주십시오. 또한, `Config` 파사드를 모킹하는 대신 테스트 내에서 `Config::set` 메서드를 호출해 설정을 변경하십시오.

<a name="facade-spies"></a>
### 파사드 스파이

파사드에 대해 [스파이](http://docs.mockery.io/en/latest/reference/spies.html)를 사용하고 싶을 때는 해당 파사드에서 `spy` 메서드를 호출하면 됩니다. 스파이는 모킹과 비슷하지만, 테스트하는 코드와의 모든 상호작용을 기록하므로 코드 실행 이후에 assert를 작성할 수 있습니다.

```php tab=Pest
<?php

use Illuminate\Support\Facades\Cache;

test('values are be stored in cache', function () {
    Cache::spy();

    $response = $this->get('/');

    $response->assertStatus(200);

    Cache::shouldHaveReceived('put')->once()->with('name', 'Taylor', 10);
});
```

```php tab=PHPUnit
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
## 시간과 상호작용하기

테스트를 할 때는 종종, `now` 헬퍼나 `Illuminate\Support\Carbon::now()`에서 반환하는 시간을 조작해야 할 수도 있습니다. 다행히 라라벨의 기본 feature 테스트 클래스에는 현재 시간을 쉽게 다룰 수 있는 여러 도우미 메서드가 포함되어 있습니다.

```php tab=Pest
test('time can be manipulated', function () {
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

    // 특정 시간으로 이동...
    $this->travelTo(now()->subHours(6));

    // 현재 시간으로 다시 돌아옴...
    $this->travelBack();
});
```

```php tab=PHPUnit
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

    // 특정 시간으로 이동...
    $this->travelTo(now()->subHours(6));

    // 현재 시간으로 다시 돌아옴...
    $this->travelBack();
}
```

다양한 시간 이동 메서드에 클로저를 전달할 수도 있습니다. 이 경우, 해당 시간에 시간이 고정된 채로 클로저가 실행되며, 클로저가 끝나면 시간이 정상적으로 다시 흐르기 시작합니다.

```
$this->travel(5)->days(function () {
    // 5일 뒤 미래에서 동작을 테스트...
});

$this->travelTo(now()->subDays(10), function () {
    // 특정 시점에서의 동작을 테스트...
});
```

현재 시간을 고정(freeze)하려면 `freezeTime` 메서드를 사용할 수 있습니다. 이와 비슷하게, `freezeSecond` 메서드는 현재 초 단위에서 시간을 고정합니다.

```
use Illuminate\Support\Carbon;

// 시간을 고정하고, 클로저 실행 후 다시 현재 시간으로 복귀...
$this->freezeTime(function (Carbon $time) {
    // ...
});

// 현재 초에서 시간을 고정하고, 클로저 실행 후 복귀...
$this->freezeSecond(function (Carbon $time) {
    // ...
})
```

이처럼 앞서 설명한 메서드들은 주로, 디스커션 포럼에서 비활성 게시글이 일정 기간 후 자동으로 잠기는 등, 시간에 민감한 애플리케이션 동작을 테스트하는 데 유용합니다.

```php tab=Pest
use App\Models\Thread;

test('forum threads lock after one week of inactivity', function () {
    $thread = Thread::factory()->create();

    $this->travel(1)->week();

    expect($thread->isLockedByInactivity())->toBeTrue();
});
```

```php tab=PHPUnit
use App\Models\Thread;

public function test_forum_threads_lock_after_one_week_of_inactivity()
{
    $thread = Thread::factory()->create();

    $this->travel(1)->week();

    $this->assertTrue($thread->isLockedByInactivity());
}
```
