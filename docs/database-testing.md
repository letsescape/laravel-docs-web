# 데이터베이스 테스트 (Database Testing)

- [소개](#introduction)
    - [각 테스트 후 데이터베이스 초기화](#resetting-the-database-after-each-test)
- [모델 팩토리](#model-factories)
- [시더 실행](#running-seeders)
- [사용 가능한 assertion](#available-assertions)

<a name="introduction"></a>
## 소개

라라벨은 데이터베이스 기반 애플리케이션을 테스트할 때 유용한 다양한 도구와 assertion(검증 메서드)을 제공합니다. 또한, 라라벨의 모델 팩토리와 시더를 활용하면 애플리케이션의 Eloquent 모델과 관계를 이용하여 테스트용 데이터베이스 레코드를 손쉽게 생성할 수 있습니다. 이 문서에서는 이러한 강력한 기능들에 대해 자세히 다루겠습니다.

<a name="resetting-the-database-after-each-test"></a>
### 각 테스트 후 데이터베이스 초기화

본격적으로 살펴보기 전에, 각 테스트가 끝난 뒤 이전 테스트에서 생성된 데이터가 이후 테스트에 영향을 주지 않도록 데이터베이스를 초기화하는 방법부터 알아보겠습니다. 라라벨에 기본 포함된 `Illuminate\Foundation\Testing\RefreshDatabase` 트레이트를 사용하면 이 작업을 쉽게 처리할 수 있습니다. 테스트 클래스에서 해당 트레이트를 아래와 같이 추가하면 됩니다.

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

`Illuminate\Foundation\Testing\RefreshDatabase` 트레이트는 데이터베이스 스키마가 최신인 경우에는 마이그레이션을 실행하지 않습니다. 대신, 데이터베이스 트랜잭션 내에서 테스트를 수행합니다. 따라서, 이 트레이트를 사용하지 않는 테스트 케이스에서 추가된 레코드는 데이터베이스에 여전히 남아 있을 수 있습니다.

데이터베이스를 완전히 초기화하고 싶다면, `Illuminate\Foundation\Testing\DatabaseMigrations` 또는 `Illuminate\Foundation\Testing\DatabaseTruncation` 트레이트를 사용할 수 있습니다. 다만, 이 두 방법은 `RefreshDatabase` 트레이트보다 속도가 현저히 느리다는 점에 유의해야 합니다.

<a name="model-factories"></a>
## 모델 팩토리

테스트를 진행할 때, 테스트 실행 전에 데이터베이스에 몇 개의 레코드를 추가해야 할 때가 있습니다. 이때 테스트 데이터를 만들 때 각각의 컬럼 값을 직접 지정하는 대신, 라라벨의 [모델 팩토리](/docs/eloquent-factories)를 통해 각 [Eloquent 모델](/docs/eloquent)에 대한 기본 속성(attribute) 집합을 미리 정의할 수 있습니다.

모델 팩토리 생성 및 활용법에 대해 더 자세히 알고 싶다면, [모델 팩토리 공식 문서](/docs/eloquent-factories)를 참고하십시오. 모델 팩토리를 정의한 뒤에는 아래와 같이 테스트 내에서 간단하게 팩토리를 이용해 모델 인스턴스를 생성할 수 있습니다.

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
## 시더 실행

[데이터베이스 시더](/docs/seeding)를 이용해 기능 테스트를 수행하는 동안 데이터베이스를 채우고 싶을 때는 `seed` 메서드를 사용하면 됩니다. 기본적으로 `seed` 메서드는 `DatabaseSeeder`를 실행하며, 이 파일이 모든 다른 시더를 호출하도록 설정되어 있어야 합니다. 또는 특정 시더 클래스 이름을 `seed` 메서드에 전달하여 선택적으로 실행할 수도 있습니다.

```php tab=Pest
<?php

use Database\Seeders\OrderStatusSeeder;
use Database\Seeders\TransactionStatusSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('orders can be created', function () {
    // DatabaseSeeder 실행...
    $this->seed();

    // 특정 시더 실행...
    $this->seed(OrderStatusSeeder::class);

    // ...

    // 여러 시더 배열로 실행...
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
        // DatabaseSeeder 실행...
        $this->seed();

        // 특정 시더 실행...
        $this->seed(OrderStatusSeeder::class);

        // ...

        // 여러 시더 배열로 실행...
        $this->seed([
            OrderStatusSeeder::class,
            TransactionStatusSeeder::class,
            // ...
        ]);
    }
}
```

또한, `RefreshDatabase` 트레이트를 사용하는 각 테스트가 실행되기 전에 자동으로 시더를 실행하도록 라라벨에 지시할 수도 있습니다. 이를 위해서는 테스트의 베이스 클래스에 `$seed` 속성을 정의해주면 됩니다.

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

`$seed` 속성을 `true`로 지정하면, `RefreshDatabase` 트레이트를 사용하는 모든 테스트마다 `Database\Seeders\DatabaseSeeder` 클래스가 실행됩니다. 만약 특정 시더만 실행하고 싶다면, 테스트 클래스 내에 `$seeder` 속성을 아래와 같이 설정할 수 있습니다.

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
## 사용 가능한 assertion

라라벨은 [Pest](https://pestphp.com)나 [PHPUnit](https://phpunit.de) 기반의 기능 테스트에서 활용할 수 있는 다양한 데이터베이스 assertion(검증 메서드)을 제공합니다. 각각의 assertion에 대해 아래에서 자세히 설명하겠습니다.

<a name="assert-database-count"></a>
#### assertDatabaseCount

데이터베이스의 특정 테이블에 주어진 개수의 레코드가 존재하는지 검증합니다.

```php
$this->assertDatabaseCount('users', 5);
```

<a name="assert-database-empty"></a>
#### assertDatabaseEmpty

데이터베이스의 특정 테이블에 레코드가 하나도 없는지 검증합니다.

```php
$this->assertDatabaseEmpty('users');
```

<a name="assert-database-has"></a>
#### assertDatabaseHas

특정 테이블에 지정한 키/값 조건을 만족하는 레코드가 존재하는지 검증합니다.

```php
$this->assertDatabaseHas('users', [
    'email' => 'sally@example.com',
]);
```

<a name="assert-database-missing"></a>
#### assertDatabaseMissing

특정 테이블에 지정한 키/값 조건을 만족하는 레코드가 존재하지 않는지 검증합니다.

```php
$this->assertDatabaseMissing('users', [
    'email' => 'sally@example.com',
]);
```

<a name="assert-deleted"></a>
#### assertSoftDeleted

`assertSoftDeleted` 메서드는 지정한 Eloquent 모델 인스턴스가 "소프트 삭제" 처리되었는지 검증할 때 사용할 수 있습니다.

```php
$this->assertSoftDeleted($user);
```

<a name="assert-not-deleted"></a>
#### assertNotSoftDeleted

`assertNotSoftDeleted` 메서드는 지정한 Eloquent 모델 인스턴스가 "소프트 삭제"되지 않았는지 검증할 때 사용할 수 있습니다.

```php
$this->assertNotSoftDeleted($user);
```

<a name="assert-model-exists"></a>
#### assertModelExists

지정한 모델 인스턴스가 데이터베이스에 실제로 존재하는지 검증합니다.

```php
use App\Models\User;

$user = User::factory()->create();

$this->assertModelExists($user);
```

<a name="assert-model-missing"></a>
#### assertModelMissing

지정한 모델 인스턴스가 데이터베이스에 존재하지 않는지 검증합니다.

```php
use App\Models\User;

$user = User::factory()->create();

$user->delete();

$this->assertModelMissing($user);
```

<a name="expects-database-query-count"></a>
#### expectsDatabaseQueryCount

`expectsDatabaseQueryCount` 메서드는 테스트가 실행되는 동안 기대하는 전체 데이터베이스 쿼리 수를 테스트 시작 시 지정할 때 사용할 수 있습니다. 실제 실행된 쿼리 수가 이 기대치와 정확히 일치하지 않으면 테스트는 실패하게 됩니다.

```php
$this->expectsDatabaseQueryCount(5);

// Test...
```
