# 데이터베이스 테스트 (Database Testing)

- [소개](#introduction)
    - [각 테스트 이후 데이터베이스 초기화](#resetting-the-database-after-each-test)
- [모델 팩토리](#model-factories)
- [시더 실행](#running-seeders)
- [사용 가능한 Assertion](#available-assertions)

<a name="introduction"></a>
## 소개

라라벨은 데이터베이스를 사용하는 애플리케이션을 테스트할 때 유용하게 활용할 수 있는 다양한 도구와 assertion을 제공합니다. 또한, 라라벨의 모델 팩토리와 시더를 이용하면, Eloquent 모델과 연관관계를 활용해서 테스트용 데이터베이스 레코드를 손쉽게 만들 수 있습니다. 아래 문서에서는 이 모든 강력한 기능을 자세히 설명합니다.

<a name="resetting-the-database-after-each-test"></a>
### 각 테스트 이후 데이터베이스 초기화

본격적으로 살펴보기 전에, 먼저 각 테스트 실행 후 데이터베이스를 어떻게 초기화할 수 있는지 알아보겠습니다. 이렇게 하면 이전 테스트의 데이터가 이후 테스트에 영향을 주지 않게 됩니다. 라라벨에서 제공하는 `Illuminate\Foundation\Testing\RefreshDatabase` 트레이트를 사용하면 이 과정을 자동으로 처리합니다. 테스트 클래스에서 이 트레이트를 간단히 적용하면 됩니다.

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

`Illuminate\Foundation\Testing\RefreshDatabase` 트레이트는 데이터베이스 스키마가 최신 상태라면 마이그레이션을 별도로 실행하지 않습니다. 대신, 테스트를 데이터베이스 트랜잭션 안에서 실행합니다. 따라서 이 트레이트를 사용하지 않는 테스트에서 추가한 레코드들은 데이터베이스에 남아 있을 수 있습니다.

데이터베이스를 완전히 초기화하고 싶을 때는, `Illuminate\Foundation\Testing\DatabaseMigrations` 또는 `Illuminate\Foundation\Testing\DatabaseTruncation` 트레이트를 사용할 수 있습니다. 하지만 이 두 방법 모두 `RefreshDatabase` 트레이트보다 훨씬 느리니 주의하시기 바랍니다.

<a name="model-factories"></a>
## 모델 팩토리

테스트를 진행할 때 데이터베이스에 테스트용 레코드를 미리 삽입해야 할 때가 있습니다. 이때, 각 컬럼 값을 일일이 지정하는 대신, 라라벨에서는 [모델 팩토리](/docs/11.x/eloquent-factories)를 활용해 각 [Eloquent 모델](/docs/11.x/eloquent)마다 기본 속성(attribute) 집합을 정의할 수 있습니다.

모델 팩토리를 생성하고 사용하는 방법에 대한 자세한 내용은 [모델 팩토리 공식 문서](/docs/11.x/eloquent-factories)를 참고하세요. 팩토리를 정의한 뒤에는, 테스트에서 다음과 같이 팩토리를 활용해 모델 인스턴스를 생성할 수 있습니다.

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

[데이터베이스 시더](/docs/11.x/seeding)를 사용해서 기능 테스트 중 데이터베이스를 원하는 상태로 채우고 싶다면, `seed` 메서드를 호출하면 됩니다. 기본적으로 `seed` 메서드는 `DatabaseSeeder`를 실행하며, 이 시더 안에서 모든 다른 시더들을 실행하도록 되어 있습니다. 물론, 특정 시더 클래스만 선택해서 실행하도록 지정할 수도 있습니다.

```php tab=Pest
<?php

use Database\Seeders\OrderStatusSeeder;
use Database\Seeders\TransactionStatusSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('orders can be created', function () {
    // DatabaseSeeder를 실행합니다...
    $this->seed();

    // 특정 시더만 실행합니다...
    $this->seed(OrderStatusSeeder::class);

    // ...

    // 여러 개의 특정 시더를 배열로 실행합니다...
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
        // DatabaseSeeder를 실행합니다...
        $this->seed();

        // 특정 시더만 실행합니다...
        $this->seed(OrderStatusSeeder::class);

        // ...

        // 여러 개의 특정 시더를 배열로 실행합니다...
        $this->seed([
            OrderStatusSeeder::class,
            TransactionStatusSeeder::class,
            // ...
        ]);
    }
}
```

또 다른 방법으로, `RefreshDatabase` 트레이트를 사용하는 테스트마다 테스트 실행 전 자동으로 시더를 실행하도록 할 수도 있습니다. 이를 위해, 기본 테스트 클래스에 `$seed` 프로퍼티를 정의하면 됩니다.

```
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

`$seed` 프로퍼티가 `true`이면, `RefreshDatabase` 트레이트를 사용하는 각 테스트 실행 전에 `Database\Seeders\DatabaseSeeder` 클래스가 자동으로 실행됩니다. 만약 실행할 시더를 지정하고 싶다면, 테스트 클래스에 `$seeder` 프로퍼티를 정의할 수 있습니다.

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
## 사용 가능한 Assertion

라라벨은 [Pest](https://pestphp.com)나 [PHPUnit](https://phpunit.de)으로 기능 테스트를 작성할 때 사용할 수 있는 다양한 데이터베이스 assertion을 제공합니다. 각 assertion별로 아래에서 자세히 설명합니다.

<a name="assert-database-count"></a>
#### assertDatabaseCount

특정 데이터베이스 테이블에 지정한 개수만큼 레코드가 존재하는지 확인합니다.

```
$this->assertDatabaseCount('users', 5);
```

<a name="assert-database-empty"></a>
#### assertDatabaseEmpty

특정 데이터베이스 테이블에 레코드가 하나도 없는지 확인합니다.

```
$this->assertDatabaseEmpty('users');

```
<a name="assert-database-has"></a>
#### assertDatabaseHas

주어진 키/값 조건에 맞는 레코드가 데이터베이스 테이블에 존재하는지 확인합니다.

```
$this->assertDatabaseHas('users', [
    'email' => 'sally@example.com',
]);
```

<a name="assert-database-missing"></a>
#### assertDatabaseMissing

주어진 키/값 조건에 맞는 레코드가 데이터베이스 테이블에 존재하지 않는지 확인합니다.

```
$this->assertDatabaseMissing('users', [
    'email' => 'sally@example.com',
]);
```

<a name="assert-deleted"></a>
#### assertSoftDeleted

`assertSoftDeleted` 메서드는 해당 Eloquent 모델이 "소프트 삭제(soft delete)" 처리되었는지 확인할 때 사용합니다.

```
$this->assertSoftDeleted($user);
```

<a name="assert-not-deleted"></a>
#### assertNotSoftDeleted

`assertNotSoftDeleted` 메서드는 해당 Eloquent 모델이 "소프트 삭제(soft delete)" 처리되지 않았는지 확인할 때 사용합니다.

```
$this->assertNotSoftDeleted($user);
```

<a name="assert-model-exists"></a>
#### assertModelExists

지정한 모델 인스턴스가 데이터베이스에 존재하는지 확인합니다.

```
use App\Models\User;

$user = User::factory()->create();

$this->assertModelExists($user);
```

<a name="assert-model-missing"></a>
#### assertModelMissing

지정한 모델 인스턴스가 데이터베이스에 존재하지 않는지 확인합니다.

```
use App\Models\User;

$user = User::factory()->create();

$user->delete();

$this->assertModelMissing($user);
```

<a name="expects-database-query-count"></a>
#### expectsDatabaseQueryCount

`expectsDatabaseQueryCount` 메서드는 테스트 시작 시 사용하며, 테스트 내에서 실행될 것으로 기대하는 전체 데이터베이스 쿼리 수를 지정할 수 있습니다. 실제 실행된 쿼리 수가 여기서 지정한 수와 정확히 일치하지 않으면, 테스트가 실패합니다.

```
$this->expectsDatabaseQueryCount(5);

// Test...
```
