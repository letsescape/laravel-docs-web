# 데이터베이스 테스트 (Database Testing)

- [소개](#introduction)
    - [각 테스트 후 데이터베이스 초기화](#resetting-the-database-after-each-test)
- [모델 팩토리](#model-factories)
- [시더 실행하기](#running-seeders)
- [사용 가능한 assertion](#available-assertions)

<a name="introduction"></a>
## 소개

라라벨은 데이터베이스 기반 애플리케이션을 테스트하는 데 도움이 되는 다양한 도구와 assertion(어설션, 확인 도구)을 제공합니다. 또한 라라벨의 모델 팩토리와 시더를 사용하면 Eloquent 모델과 연관관계를 활용해 테스트 데이터베이스 레코드를 손쉽게 생성할 수 있습니다. 아래 문서에서는 이러한 강력한 기능들을 자세히 살펴보겠습니다.

<a name="resetting-the-database-after-each-test"></a>
### 각 테스트 후 데이터베이스 초기화

더 자세히 들어가기 전에, 각 테스트가 실행된 후 데이터베이스를 어떻게 초기화할 수 있는지 알아보겠습니다. 이전 테스트의 데이터가 이후 테스트에 영향을 주지 않게 하려면 데이터베이스를 매 테스트마다 초기화해야 합니다. 라라벨이 기본으로 제공하는 `Illuminate\Foundation\Testing\RefreshDatabase` 트레잇이 이 작업을 쉽게 해줍니다. 이 트레잇을 테스트 클래스에 추가해 사용하면 됩니다.

```
<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    /**
     * A basic functional test example.
     */
    public function test_basic_example(): void
    {
        $response = $this->get('/');

        // ...
    }
}
```

`Illuminate\Foundation\Testing\RefreshDatabase` 트레잇은 데이터베이스 스키마가 최신 상태이면 추가적으로 마이그레이션을 실행하지 않습니다. 대신 하나의 데이터베이스 트랜잭션에서 테스트를 실행합니다. 따라서 이 트레잇을 사용하지 않는 테스트 케이스에서 추가된 레코드는 여전히 데이터베이스에 남아 있을 수 있습니다.

데이터베이스를 완전히 초기화하고 싶다면, `Illuminate\Foundation\Testing\DatabaseMigrations` 또는 `Illuminate\Foundation\Testing\DatabaseTruncation` 트레잇을 사용할 수 있습니다. 하지만 이 두 방식은 `RefreshDatabase` 트레잇보다 성능이 크게 느릴 수 있다는 점을 참고하세요.

<a name="model-factories"></a>
## 모델 팩토리

테스트를 할 때, 미리 몇 개의 레코드를 데이터베이스에 삽입해야 할 때가 있습니다. 직접 테스트 데이터를 만들 때 컬럼의 값을 일일이 지정하지 않고도, 라라벨의 [모델 팩토리](/docs/10.x/eloquent-factories)를 사용하면 각 [Eloquent 모델](/docs/10.x/eloquent)마다 기본 속성(attribute) 세트를 정의할 수 있습니다.

모델 팩토리를 만들고 사용하는 방법에 대한 자세한 내용은 [모델 팩토리 문서](/docs/10.x/eloquent-factories)를 참고하세요. 팩토리를 정의한 뒤 테스트에서 다음과 같이 활용할 수 있습니다.

```
use App\Models\User;

public function test_models_can_be_instantiated(): void
{
    $user = User::factory()->create();

    // ...
}
```

<a name="running-seeders"></a>
## 시더 실행하기

[데이터베이스 시더](/docs/10.x/seeding)를 사용해 기능 테스트 도중 데이터베이스를 채우고 싶다면, `seed` 메서드를 호출하면 됩니다. 기본적으로 `seed` 메서드는 `DatabaseSeeder`를 실행하며, 이 안에서 모든 시더들이 실행될 수 있습니다. 필요하다면 특정 시더 클래스 이름을 직접 전달해 사용할 수도 있습니다.

```
<?php

namespace Tests\Feature;

use Database\Seeders\OrderStatusSeeder;
use Database\Seeders\TransactionStatusSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test creating a new order.
     */
    public function test_orders_can_be_created(): void
    {
        // DatabaseSeeder 실행
        $this->seed();

        // 특정 시더만 실행
        $this->seed(OrderStatusSeeder::class);

        // ...

        // 여러 시더를 한 번에 실행
        $this->seed([
            OrderStatusSeeder::class,
            TransactionStatusSeeder::class,
            // ...
        ]);
    }
}
```

또는, `RefreshDatabase` 트레잇을 사용하는 모든 테스트 전에 데이터베이스 시더를 자동으로 실행하도록 설정할 수도 있습니다. 이 경우에는 테스트의 베이스 클래스에 `$seed` 프로퍼티를 정의하면 됩니다.

```
<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;

    /**
     * Indicates whether the default seeder should run before each test.
     *
     * @var bool
     */
    protected $seed = true;
}
```

`$seed` 프로퍼티를 `true`로 설정하면, `RefreshDatabase` 트레잇을 사용하는 각 테스트 전에 `Database\Seeders\DatabaseSeeder`가 실행됩니다. 만약 각 테스트마다 특정한 시더만 실행되도록 하고 싶다면, 테스트 클래스에 `$seeder` 프로퍼티를 정의하면 됩니다.

```
use Database\Seeders\OrderStatusSeeder;

/**
 * Run a specific seeder before each test.
 *
 * @var string
 */
protected $seeder = OrderStatusSeeder::class;
```

<a name="available-assertions"></a>
## 사용 가능한 assertion

라라벨은 [PHPUnit](https://phpunit.de/) 기능 테스트에서 사용할 수 있는 여러 데이터베이스 assertion(확인 메서드)을 제공합니다. 아래에서 각 assertion에 대해 설명합니다.

<a name="assert-database-count"></a>
#### assertDatabaseCount

데이터베이스의 특정 테이블에 주어진 개수의 레코드가 존재하는지 확인합니다.

```
$this->assertDatabaseCount('users', 5);
```

<a name="assert-database-has"></a>
#### assertDatabaseHas

데이터베이스의 특정 테이블에, 지정한 키/값 조건에 맞는 레코드가 있는지 확인합니다.

```
$this->assertDatabaseHas('users', [
    'email' => 'sally@example.com',
]);
```

<a name="assert-database-missing"></a>
#### assertDatabaseMissing

데이터베이스의 특정 테이블에, 지정한 키/값 조건에 맞는 레코드가 존재하지 않는지 확인합니다.

```
$this->assertDatabaseMissing('users', [
    'email' => 'sally@example.com',
]);
```

<a name="assert-deleted"></a>
#### assertSoftDeleted

`assertSoftDeleted` 메서드는 주어진 Eloquent 모델이 "소프트 삭제" 되었는지 확인할 때 사용할 수 있습니다.

```
$this->assertSoftDeleted($user);

```
<a name="assert-not-deleted"></a>
#### assertNotSoftDeleted

`assertNotSoftDeleted` 메서드는 주어진 Eloquent 모델이 "소프트 삭제"되지 않았는지를 확인합니다.

```
$this->assertNotSoftDeleted($user);
```

<a name="assert-model-exists"></a>
#### assertModelExists

주어진 모델 인스턴스가 데이터베이스에 존재하는지 확인합니다.

```
use App\Models\User;

$user = User::factory()->create();

$this->assertModelExists($user);
```

<a name="assert-model-missing"></a>
#### assertModelMissing

주어진 모델 인스턴스가 데이터베이스에 존재하지 않는지 확인합니다.

```
use App\Models\User;

$user = User::factory()->create();

$user->delete();

$this->assertModelMissing($user);
```

<a name="expects-database-query-count"></a>
#### expectsDatabaseQueryCount

`expectsDatabaseQueryCount` 메서드는 테스트가 실행되는 동안 발생하기를 기대하는 전체 데이터베이스 쿼리 수를 미리 지정할 수 있게 해줍니다. 실제 실행된 쿼리 수가 지정한 값과 정확히 일치하지 않으면 테스트는 실패하게 됩니다.

```
$this->expectsDatabaseQueryCount(5);

// Test...
```
