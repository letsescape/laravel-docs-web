# 데이터베이스 테스트 (Database Testing)

- [소개](#introduction)
    - [각 테스트 후 데이터베이스 리셋](#resetting-the-database-after-each-test)
- [모델 팩토리](#model-factories)
- [시더 실행하기](#running-seeders)
- [사용 가능한 어서션](#available-assertions)

<a name="introduction"></a>
## 소개

라라벨은 데이터베이스를 사용하는 애플리케이션의 테스트를 더 쉽고 편리하게 진행할 수 있도록 다양한 도구와 어서션을 제공합니다. 또한, 라라벨의 모델 팩토리와 시더를 활용하면, Eloquent 모델과 연관관계를 통해 테스트 데이터베이스 레코드를 손쉽게 생성할 수 있습니다. 아래 문서에서는 이러한 강력한 기능들에 대해 자세히 안내합니다.

<a name="resetting-the-database-after-each-test"></a>
### 각 테스트 후 데이터베이스 리셋

본격적으로 진행하기에 앞서, 각 테스트가 실행될 때마다 데이터베이스를 리셋해서 이전 테스트의 데이터가 이후 테스트에 영향을 주지 않도록 처리하는 방법을 알아보겠습니다. 라라벨에 내장된 `Illuminate\Foundation\Testing\RefreshDatabase` 트레이트가 이 작업을 자동으로 처리합니다. 테스트 클래스에서 이 트레이트를 사용하면 됩니다.

```php tab=Pest
<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('basic example', function () {
    $response = $this->get('/');

    // ...
});
```

```php tab=PHPUnit
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

`Illuminate\Foundation\Testing\RefreshDatabase` 트레이트는 데이터베이스의 스키마가 최신 상태라면 마이그레이션을 수행하지 않습니다. 대신, 테스트를 데이터베이스 트랜잭션 내에서 실행합니다. 따라서 이 트레이트를 사용하지 않은 테스트 케이스에서 추가된 레코드는 데이터베이스에 남아 있을 수 있습니다.

데이터베이스를 완전히 리셋하고 싶다면, `Illuminate\Foundation\Testing\DatabaseMigrations` 또는 `Illuminate\Foundation\Testing\DatabaseTruncation` 트레이트를 사용할 수 있습니다. 그러나 이 두 방식은 `RefreshDatabase` 트레이트보다 실행 속도가 훨씬 느립니다.

<a name="model-factories"></a>
## 모델 팩토리

테스트 시, 먼저 데이터베이스에 몇 개의 레코드를 추가해야 할 때가 있습니다. 이때 테스트 데이터를 생성할 때마다 각 컬럼의 값을 직접 지정하지 않고, 라라벨의 [모델 팩토리](/docs/12.x/eloquent-factories)를 이용하면, [Eloquent 모델](/docs/12.x/eloquent)의 기본 속성(attribute) 정의를 통해 간편하게 레코드를 만들 수 있습니다.

모델 팩토리 생성 및 활용에 대해 더 알고 싶다면 [모델 팩토리 공식 문서](/docs/12.x/eloquent-factories)를 참고하시기 바랍니다. 팩토리를 정의한 후에는 테스트 코드에서 다음처럼 팩토리를 활용해 모델을 생성할 수 있습니다.

```php tab=Pest
use App\Models\User;

test('models can be instantiated', function () {
    $user = User::factory()->create();

    // ...
});
```

```php tab=PHPUnit
use App\Models\User;

public function test_models_can_be_instantiated(): void
{
    $user = User::factory()->create();

    // ...
}
```

<a name="running-seeders"></a>
## 시더 실행하기

[데이터베이스 시더](/docs/12.x/seeding)를 이용해 기능 테스트 중 데이터베이스를 초기화하거나 데이터를 채우고 싶다면, `seed` 메서드를 사용할 수 있습니다. 기본적으로 `seed` 메서드는 `DatabaseSeeder`를 실행하며, 이 클래스에서 다른 모든 시더를 호출하도록 구성되어야 합니다. 특정 시더 클래스만 실행하고 싶다면 시더 클래스명을 `seed` 메서드에 인자로 넘길 수 있습니다.

```php tab=Pest
<?php

use Database\Seeders\OrderStatusSeeder;
use Database\Seeders\TransactionStatusSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('orders can be created', function () {
    // DatabaseSeeder 실행
    $this->seed();

    // 특정 시더 실행
    $this->seed(OrderStatusSeeder::class);

    // ...

    // 여러 개의 시더 배열로 실행
    $this->seed([
        OrderStatusSeeder::class,
        TransactionStatusSeeder::class,
        // ...
    ]);
});
```

```php tab=PHPUnit
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

        // 특정 시더 실행
        $this->seed(OrderStatusSeeder::class);

        // ...

        // 여러 개의 시더 배열로 실행
        $this->seed([
            OrderStatusSeeder::class,
            TransactionStatusSeeder::class,
            // ...
        ]);
    }
}
```

또한, `RefreshDatabase` 트레이트를 사용하는 각 테스트 전에 자동으로 시더를 실행하도록 라라벨에 지정할 수도 있습니다. 이를 위해서는, 기본 테스트 클래스에 `$seed` 프로퍼티를 정의하면 됩니다.

```php
<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Indicates whether the default seeder should run before each test.
     *
     * @var bool
     */
    protected $seed = true;
}
```

`$seed` 프로퍼티가 `true`로 설정되어 있으면, 해당 테스트에서 `RefreshDatabase` 트레이트를 사용할 때마다 `Database\Seeders\DatabaseSeeder` 클래스가 실행됩니다. 만약 특정 시더만 매번 실행하도록 하고 싶다면, 테스트 클래스에 `$seeder` 프로퍼티를 정의해 지정할 수 있습니다.

```php
use Database\Seeders\OrderStatusSeeder;

/**
 * Run a specific seeder before each test.
 *
 * @var string
 */
protected $seeder = OrderStatusSeeder::class;
```

<a name="available-assertions"></a>
## 사용 가능한 어서션

라라벨은 [Pest](https://pestphp.com) 또는 [PHPUnit](https://phpunit.de) 기능 테스트에서 사용할 수 있는 여러 가지 데이터베이스 어서션을 제공합니다. 아래에서 각각의 어서션에 대해 설명합니다.

<a name="assert-database-count"></a>
#### assertDatabaseCount

데이터베이스의 특정 테이블에 지정한 개수의 레코드가 존재하는지 확인합니다.

```php
$this->assertDatabaseCount('users', 5);
```

<a name="assert-database-empty"></a>
#### assertDatabaseEmpty

데이터베이스의 특정 테이블에 레코드가 전혀 존재하지 않는지 확인합니다.

```php
$this->assertDatabaseEmpty('users');
```

<a name="assert-database-has"></a>
#### assertDatabaseHas

주어진 키/값 쿼리 조건에 맞는 레코드가 데이터베이스의 특정 테이블에 존재하는지 확인합니다.

```php
$this->assertDatabaseHas('users', [
    'email' => 'sally@example.com',
]);
```

<a name="assert-database-missing"></a>
#### assertDatabaseMissing

주어진 키/값 쿼리 조건에 맞는 레코드가 데이터베이스의 특정 테이블에 존재하지 않는지 확인합니다.

```php
$this->assertDatabaseMissing('users', [
    'email' => 'sally@example.com',
]);
```

<a name="assert-deleted"></a>
#### assertSoftDeleted

`assertSoftDeleted` 메서드를 사용하면, 특정 Eloquent 모델이 "소프트 삭제"된 상태임을 확인할 수 있습니다.

```php
$this->assertSoftDeleted($user);
```

<a name="assert-not-deleted"></a>
#### assertNotSoftDeleted

`assertNotSoftDeleted` 메서드는, 특정 Eloquent 모델이 "소프트 삭제"되지 않았음을 확인할 때 사용합니다.

```php
$this->assertNotSoftDeleted($user);
```

<a name="assert-model-exists"></a>
#### assertModelExists

특정 모델 인스턴스가 데이터베이스에 실제로 존재하는지 확인합니다.

```php
use App\Models\User;

$user = User::factory()->create();

$this->assertModelExists($user);
```

<a name="assert-model-missing"></a>
#### assertModelMissing

특정 모델 인스턴스가 데이터베이스에 존재하지 않는지(즉, 삭제되었는지) 확인합니다.

```php
use App\Models\User;

$user = User::factory()->create();

$user->delete();

$this->assertModelMissing($user);
```

<a name="expects-database-query-count"></a>
#### expectsDatabaseQueryCount

`expectsDatabaseQueryCount` 메서드는 테스트가 실행되는 동안 데이터베이스 쿼리가 총 몇 번 실행될 것인지 예상 값을 지정할 수 있습니다. 실제 쿼리 실행 횟수가 이 값과 정확히 일치하지 않으면 테스트는 실패하게 됩니다.

```php
$this->expectsDatabaseQueryCount(5);

// Test...
```
