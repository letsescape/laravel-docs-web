# 모킹 (Mocking)

- [소개](#introduction)
- [객체 목(mock) 사용하기](#mocking-objects)
- [파사드 목(mock) 사용하기](#mocking-facades)
    - [파사드 스파이 사용하기](#facade-spies)
- [시간 다루기](#interacting-with-time)

<a name="introduction"></a>
## 소개

라라벨 애플리케이션을 테스트할 때, 실제로 실행되지 않기를 원하는 애플리케이션의 특정 부분을 "목(mock)" 처리하고 싶을 때가 있습니다. 예를 들어, 이벤트를 디스패치(dispatch)하는 컨트롤러를 테스트할 때 이벤트 리스너가 실제로 실행되지 않게 모킹함으로써, 해당 컨트롤러의 HTTP 응답만 검증하고, 이벤트 리스너에 대한 검증은 별도의 테스트에서 수행할 수 있습니다.

라라벨은 기본적으로 이벤트, 잡(job), 그 외 다양한 파사드 등을 쉽게 목(mock) 처리할 수 있는 편리한 헬퍼 메서드를 제공합니다. 이 헬퍼들은 주로 [Mockery](https://github.com/padraic/mockery)를 더 쉽게 쓸 수 있게 해주는 편의 기능으로, 복잡한 Mockery 호출을 직접 작성할 필요를 줄여줍니다.

<a name="mocking-objects"></a>
## 객체 목(mock) 사용하기

라라벨의 [서비스 컨테이너](/docs/12.x/container)를 통해 의존성으로 주입(inject)되는 객체를 모킹하려면, 해당 객체의 모킹 인스턴스를 컨테이너에 `instance` 바인딩으로 등록해야 합니다. 이렇게 하면 컨테이너가 직접 객체를 생성하는 대신, 여러분이 지정한 모킹 인스턴스를 사용하게 됩니다.

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

이를 더 간단하게 만들기 위해, 라라벨의 기본 테스트 케이스 클래스는 `mock` 메서드를 제공합니다. 아래 예시는 위의 코드와 동일한 동작을 합니다.

```php
use App\Service;
use Mockery\MockInterface;

$mock = $this->mock(Service::class, function (MockInterface $mock) {
    $mock->expects('process');
});
```

특정 객체의 일부 메서드만 목(mock) 처리하고 나머지는 실제로 동작하게 하고 싶다면 `partialMock` 메서드를 사용할 수 있습니다. 목 처리하지 않은 메서드는 원래 방식대로 그대로 실행됩니다.

```php
use App\Service;
use Mockery\MockInterface;

$mock = $this->partialMock(Service::class, function (MockInterface $mock) {
    $mock->expects('process');
});
```

또한, 객체에 대해 [스파이(spy)](http://docs.mockery.io/en/latest/reference/spies.html)를 사용하고 싶다면, 라라벨의 기본 테스트 케이스 클래스에서 `Mockery::spy`를 간편하게 사용할 수 있도록 `spy` 메서드를 제공합니다. 스파이는 목과 비슷하지만, 테스트하는 코드가 스파이 객체와 상호작용한 내역을 기록하여, 코드 실행 후 상호작용을 쉽게 검증/assertion 할 수 있습니다.

```php
use App\Service;

$spy = $this->spy(Service::class);

// ...

$spy->shouldHaveReceived('process');
```

<a name="mocking-facades"></a>
## 파사드 목(mock) 사용하기

전통적인 정적 메서드 호출과 달리, [파사드](/docs/12.x/facades) (그리고 [실시간(real-time) 파사드](/docs/12.x/facades#real-time-facades) 포함)는 모킹이 가능합니다. 이는 기존의 정적 메서드보다 훨씬 뛰어난 테스트 용이성을 제공하며, 전통적인 의존성 주입을 사용할 때와 동일한 테스트의 유연성을 누릴 수 있습니다. 컨트롤러에서 라라벨 파사드를 호출하는 부분을 테스트할 때, 해당 파사드의 호출을 목 처리하고 싶을 때가 많습니다. 예를 들어 아래와 같은 컨트롤러 액션이 있다고 합시다.

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

`Cache` 파사드의 호출을 모킹하려면 `expects` 메서드를 사용할 수 있으며, 이 메서드는 [Mockery](https://github.com/padraic/mockery)의 목 객체를 반환합니다. 파사드는 실제로 라라벨의 [서비스 컨테이너](/docs/12.x/container)에 의해 해석되고 관리되기 때문에 일반 정적 클래스보다 훨씬 쉽게 테스트할 수 있습니다. 예를 들어, 아래는 `Cache` 파사드의 `get` 메서드 호출을 모킹하는 예시입니다.

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
> `Request` 파사드는 모킹해서는 안 됩니다. 테스트할 때는 원하는 입력값을 [HTTP 테스트 메서드](/docs/12.x/http-tests)인 `get`, `post` 등에 직접 전달하시기 바랍니다. 마찬가지로, `Config` 파사드를 모킹하는 대신 테스트 내에서 `Config::set` 메서드를 사용해 설정 값을 변경하세요.

<a name="facade-spies"></a>
### 파사드 스파이 사용하기

파사드에 대해 [스파이(spy)](http://docs.mockery.io/en/latest/reference/spies.html)를 적용하고 싶다면, 해당 파사드의 `spy` 메서드를 호출하면 됩니다. 스파이는 목(mock)과 비슷하지만, 테스트하는 코드가 스파이 객체와 어떤 상호작용을 했는지 모두 기록해주기 때문에, 코드 실행 이후에 그 상호작용을 기반으로 assertion을 진행할 수 있습니다.

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
## 시간 다루기

테스트를 하다 보면, `now`나 `Illuminate\Support\Carbon::now()`와 같은 헬퍼가 반환하는 시간을 임의로 변경해야 할 때가 있습니다. 다행히도, 라라벨의 기본 feature 테스트 클래스에서는 현재 시각을 쉽게 조작할 수 있는 다양한 헬퍼 메서드를 제공합니다.

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

    // 특정 시각으로 이동...
    $this->travelTo(now()->subHours(6));

    // 현재 시각으로 복귀...
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

    // 특정 시각으로 이동...
    $this->travelTo(now()->subHours(6));

    // 현재 시각으로 복귀...
    $this->travelBack();
}
```

각종 시간 이동 메서드에는 클로저를 전달할 수도 있습니다. 이런 경우, 해당 클로저 내부에서는 지정한 시각이 고정(freeze)된 상태로 동작하며, 클로저 실행이 끝나면 시간이 원래대로 돌아옵니다.

```php
$this->travel(5)->days(function () {
    // 5일 뒤 미래에서 어떤 테스트를 수행...
});

$this->travelTo(now()->subDays(10), function () {
    // 특정 시점에서 테스트를 수행...
});
```

`freezeTime` 메서드를 사용하면 현재 시각을 그대로 고정(freeze)할 수 있습니다. 비슷하게, `freezeSecond`는 현재 초 단위로 시각을 고정합니다.

```php
use Illuminate\Support\Carbon;

// 현재 시각을 고정했다가, 클로저 실행 후 다시 정상 시간으로 복귀...
$this->freezeTime(function (Carbon $time) {
    // ...
});

// 현재 초 단위로 고정, 클로저 실행 후 복귀...
$this->freezeSecond(function (Carbon $time) {
    // ...
})
```

이러한 메서드들은 시간에 따라 동작이 달라지는 애플리케이션의 테스트, 예를 들어 포럼에서 비활성 스레드를 일정 기간 후 자동으로 잠그는 기능 등을 검증할 때 유용합니다.

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
