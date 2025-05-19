# 목(mock) 테스트 (Mocking)

- [소개](#introduction)
- [객체 목킹](#mocking-objects)
- [파사드 목킹](#mocking-facades)
    - [파사드 스파이](#facade-spies)
- [시간 조작하기](#interacting-with-time)

<a name="introduction"></a>
## 소개

라라벨 애플리케이션을 테스트할 때는, 실제로 실행되길 원하지 않는 애플리케이션의 특정 동작을 "목(mock)"으로 대체해서 테스트할 수 있습니다. 예를 들어, 이벤트를 디스패치하는 컨트롤러를 테스트할 때, 테스트가 실행되는 동안 이벤트 리스너가 실제로 동작하지 않도록 목 처리하고 싶을 수 있습니다. 이렇게 하면 컨트롤러의 HTTP 응답만 집중해서 테스트할 수 있으며, 이벤트 리스너 자체는 별도의 테스트 케이스에서 검증할 수 있습니다.

라라벨은 이벤트, 잡(job), 기타 다양한 파사드를 목킹할 수 있는 편리한 메서드들을 기본적으로 제공합니다. 이 헬퍼들은 복잡한 Mockery 메서드를 수동으로 작성할 필요 없이, Mockery 위에 편의 계층을 제공해줍니다.

<a name="mocking-objects"></a>
## 객체 목킹

라라벨의 [서비스 컨테이너](/docs/container)를 통해 애플리케이션에 주입될 객체를 목킹해야 할 경우, 해당 객체의 목(mock) 인스턴스를 `인스턴스(instance)` 바인딩으로 컨테이너에 바인딩해주어야 합니다. 이렇게 하면 컨테이너는 객체를 직접 생성하는 대신, 여러분이 등록한 목 인스턴스를 사용하게 됩니다.

```php tab=Pest
use App\Service;
use Mockery;
use Mockery\MockInterface;

test('something can be mocked', function () {
    $this->instance(
        Service::class,
        Mockery::mock(Service::class, function (MockInterface $mock) {
            $mock->expects('process');
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
            $mock->expects('process');
        })
    );
}
```

이 과정을 더 간편하게 하기 위해, 라라벨의 기본 테스트 케이스 클래스에서는 `mock` 메서드를 제공합니다. 아래 예시는 앞선 예제와 동일한 동작을 수행합니다.

```php
use App\Service;
use Mockery\MockInterface;

$mock = $this->mock(Service::class, function (MockInterface $mock) {
    $mock->expects('process');
});
```

객체의 일부 메서드만 목킹하고 싶을 때는 `partialMock` 메서드를 사용할 수 있습니다. 지정하지 않은 메서드는 평소처럼 정상적으로 실행됩니다.

```php
use App\Service;
use Mockery\MockInterface;

$mock = $this->partialMock(Service::class, function (MockInterface $mock) {
    $mock->expects('process');
});
```

또한 [스파이(spy)](http://docs.mockery.io/en/latest/reference/spies.html)를 이용해 객체에 어떤 상호작용이 일어났는지 추적하고 싶다면, 라라벨의 기본 테스트 케이스 클래스에서 제공하는 `spy` 메서드를 사용할 수 있습니다. 스파이는 목과 유사하지만, 테스트 중에 발생한 상호작용을 기록해서 코드 실행 이후에 assert를 할 수 있습니다.

```php
use App\Service;

$spy = $this->spy(Service::class);

// ...

$spy->shouldHaveReceived('process');
```

<a name="mocking-facades"></a>
## 파사드 목킹

전통적인 정적(static) 메서드 호출과 다르게, [파사드](/docs/facades) (그리고 [실시간 파사드](/docs/facades#real-time-facades))는 목킹할 수 있습니다. 이는 일반적인 정적 메서드에 비해 매우 큰 장점이며, 의존성 주입 방식을 사용하는 것과 마찬가지로 테스트가 편리해집니다. 실무에서는 컨트롤러 코드에서 사용하는 라라벨 파사드의 호출을 자주 목킹해야 할 것입니다. 예를 들어 아래와 같은 컨트롤러 액션을 보겠습니다.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Cache;

class UserController extends Controller
{
    /**
     * Retrieve a list of all users of the application.
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

이런 경우, `Cache` 파사드의 호출을 `expects` 메서드로 목킹할 수 있습니다. 이 메서드는 [Mockery](https://github.com/padraic/mockery) 목 객체를 반환합니다. 파사드는 라라벨의 [서비스 컨테이너](/docs/container)에서 실제로 resolve되고 관리되므로, 전통적인 정적 클래스에 비해 훨씬 더 테스트가 용이합니다. 아래는 `Cache` 파사드의 `get` 메서드를 목킹하는 예시입니다.

```php tab=Pest
<?php

use Illuminate\Support\Facades\Cache;

test('get index', function () {
    Cache::expects('get')
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
        Cache::expects('get')
            ->with('key')
            ->andReturn('value');

        $response = $this->get('/users');

        // ...
    }
}
```

> [!WARNING]
> `Request` 파사드는 목킹해서는 안 됩니다. 대신 테스트 시 [HTTP 테스트 메서드](/docs/http-tests)에서 원하는 입력값을 `get`, `post`와 같은 메서드로 직접 전달해야 합니다. 마찬가지로, `Config` 파사드를 목킹하는 대신 테스트 내에서 `Config::set` 메서드를 사용하세요.

<a name="facade-spies"></a>
### 파사드 스파이

파사드에서 [스파이(spy)](http://docs.mockery.io/en/latest/reference/spies.html) 기능을 사용하려면, 해당 파사드에서 `spy` 메서드를 호출하면 됩니다. 스파이는 목과 비슷하지만, 테스트 도중 파사드와 코드 사이의 모든 상호작용을 기록해서 테스트가 끝난 뒤 assert를 할 수 있게 해줍니다.

```php tab=Pest
<?php

use Illuminate\Support\Facades\Cache;

test('values are be stored in cache', function () {
    Cache::spy();

    $response = $this->get('/');

    $response->assertStatus(200);

    Cache::shouldHaveReceived('put')->with('name', 'Taylor', 10);
});
```

```php tab=PHPUnit
use Illuminate\Support\Facades\Cache;

public function test_values_are_be_stored_in_cache(): void
{
    Cache::spy();

    $response = $this->get('/');

    $response->assertStatus(200);

    Cache::shouldHaveReceived('put')->with('name', 'Taylor', 10);
}
```

<a name="interacting-with-time"></a>
## 시간 조작하기

테스트를 하다 보면 `now` 헬퍼나 `Illuminate\Support\Carbon::now()`에서 반환하는 시간을 임시로 변경해야 하는 경우가 있습니다. 다행히 라라벨의 기본 기능 테스트 클래스에서는 현재 시간을 편리하게 조작할 수 있는 다양한 메서드를 제공합니다.

```php tab=Pest
test('time can be manipulated', function () {
    // 미래로 이동하기...
    $this->travel(5)->milliseconds();
    $this->travel(5)->seconds();
    $this->travel(5)->minutes();
    $this->travel(5)->hours();
    $this->travel(5)->days();
    $this->travel(5)->weeks();
    $this->travel(5)->years();

    // 과거로 이동하기...
    $this->travel(-5)->hours();

    // 특정 시각으로 이동하기...
    $this->travelTo(now()->subHours(6));

    // 현재 시각으로 다시 돌아오기...
    $this->travelBack();
});
```

```php tab=PHPUnit
public function test_time_can_be_manipulated(): void
{
    // 미래로 이동하기...
    $this->travel(5)->milliseconds();
    $this->travel(5)->seconds();
    $this->travel(5)->minutes();
    $this->travel(5)->hours();
    $this->travel(5)->days();
    $this->travel(5)->weeks();
    $this->travel(5)->years();

    // 과거로 이동하기...
    $this->travel(-5)->hours();

    // 특정 시각으로 이동하기...
    $this->travelTo(now()->subHours(6));

    // 현재 시각으로 다시 돌아오기...
    $this->travelBack();
}
```

이러한 시간 이동 메서드에는 클로저를 인자로 전달할 수도 있습니다. 이 경우, 지정한 시간으로 고정(freeze)된 상태에서 클로저가 실행되며, 클로저 실행이 끝나면 시간이 정상적으로 다시 흐릅니다.

```php
$this->travel(5)->days(function () {
    // 5일 뒤의 미래 시점에서 테스트...
});

$this->travelTo(now()->subDays(10), function () {
    // 특정 시점에서 테스트...
});
```

현재 시간을 완전히 고정(freeze)하려면 `freezeTime` 메서드를 사용할 수 있습니다. 비슷하게, `freezeSecond`는 현재 초(second) 단위로 시간을 고정합니다.

```php
use Illuminate\Support\Carbon;

// 시간을 고정하고, 클로저 실행 후 정상적인 시간 흐름으로 복귀...
$this->freezeTime(function (Carbon $time) {
    // ...
});

// 현재 초 단위로 시간을 고정하고, 클로저 실행 후 시간 복귀...
$this->freezeSecond(function (Carbon $time) {
    // ...
})
```

위에서 설명한 모든 방법들은 주로 시간에 민감한 애플리케이션 동작을 테스트할 때 유용합니다. 예를 들어, 포럼에서 비활성 게시물이 일정 시간 동안 움직임이 없으면 자동으로 잠기는 기능을 테스트하려 할 때 활용할 수 있습니다.

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
