# 데이터베이스: 시더(Seeding) (Database: Seeding)

- [소개](#introduction)
- [시더 작성하기](#writing-seeders)
    - [모델 팩토리 사용하기](#using-model-factories)
    - [추가 시더 호출하기](#calling-additional-seeders)
    - [모델 이벤트 비활성화하기](#muting-model-events)
- [시더 실행하기](#running-seeders)

<a name="introduction"></a>
## 소개

라라벨은 시드 클래스(seed class)를 사용해 데이터베이스에 데이터를 미리 채울 수 있는 기능을 제공합니다. 모든 시드 클래스는 `database/seeders` 디렉터리에 저장됩니다. 기본적으로 `DatabaseSeeder` 클래스가 미리 정의되어 있습니다. 이 클래스에서 `call` 메서드를 활용해 다른 시드 클래스를 실행할 수 있으며, 이를 통해 데이터 시드 실행 순서를 제어할 수 있습니다.

> [!NOTE]
> [대량 할당 보호(mass assignment protection)](/docs/eloquent#mass-assignment)는 데이터베이스 시딩 작업 중 자동으로 비활성화됩니다.

<a name="writing-seeders"></a>
## 시더 작성하기

시더를 생성하려면 `make:seeder` [Artisan 명령어](/docs/artisan)를 실행하세요. 프레임워크에서 생성하는 모든 시더는 `database/seeders` 디렉터리에 저장됩니다.

```shell
php artisan make:seeder UserSeeder
```

시더 클래스에는 기본적으로 하나의 메서드, `run`만 포함되어 있습니다. 이 메서드는 `db:seed` [Artisan 명령어](/docs/artisan)를 실행할 때 호출됩니다. `run` 메서드 안에서는 원하는 방식대로 데이터베이스에 데이터를 삽입할 수 있습니다. [쿼리 빌더](/docs/queries)를 사용해 직접 데이터를 추가하거나, [Eloquent 모델 팩토리](/docs/eloquent-factories)를 활용할 수도 있습니다.

예를 들어, 기본 `DatabaseSeeder` 클래스를 수정하여 `run` 메서드에 데이터 삽입 구문을 추가해 보겠습니다.

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeders.
     */
    public function run(): void
    {
        DB::table('users')->insert([
            'name' => Str::random(10),
            'email' => Str::random(10).'@example.com',
            'password' => Hash::make('password'),
        ]);
    }
}
```

> [!NOTE]
> `run` 메서드의 시그니처에 필요로 하는 의존성을 타입힌트할 수 있습니다. 이 경우, 라라벨 [서비스 컨테이너](/docs/container)를 통해 자동으로 주입됩니다.

<a name="using-model-factories"></a>
### 모델 팩토리 사용하기

각 모델 시드에 필요한 속성을 일일이 지정하는 것은 번거로운 작업입니다. 대신에 [모델 팩토리](/docs/eloquent-factories)를 사용하면 대량의 데이터베이스 레코드를 손쉽게 생성할 수 있습니다. 먼저, [모델 팩토리 문서](/docs/eloquent-factories)를 참고해 팩토리를 어떻게 정의하는지 확인하세요.

예를 들어, 각각 하나의 관련 게시물을 가진 사용자 50명을 생성하는 코드는 다음과 같습니다.

```php
use App\Models\User;

/**
 * Run the database seeders.
 */
public function run(): void
{
    User::factory()
        ->count(50)
        ->hasPosts(1)
        ->create();
}
```

<a name="calling-additional-seeders"></a>
### 추가 시더 호출하기

`DatabaseSeeder` 클래스 내에서 `call` 메서드를 사용해 추가적인 시드 클래스를 실행할 수 있습니다. `call` 메서드를 이용하면 데이터베이스 시딩 로직을 여러 파일로 분산시켜, 하나의 시더 클래스가 너무 커지는 것을 방지할 수 있습니다. `call` 메서드는 실행할 시더 클래스의 배열을 인수로 받습니다.

```php
/**
 * Run the database seeders.
 */
public function run(): void
{
    $this->call([
        UserSeeder::class,
        PostSeeder::class,
        CommentSeeder::class,
    ]);
}
```

<a name="muting-model-events"></a>
### 모델 이벤트 비활성화하기

시더를 실행할 때, 모델에서 이벤트가 발생하는 것을 막고 싶을 때가 있습니다. 이럴 때는 `WithoutModelEvents` 트레이트를 사용하면 됩니다. 이 트레이트를 적용하면, 추가적인 시드 클래스를 `call` 메서드로 실행하더라도 어떤 모델 이벤트도 발생하지 않습니다.

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeders.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
        ]);
    }
}
```

<a name="running-seeders"></a>
## 시더 실행하기

`db:seed` 아티즌 명령어를 실행하면 데이터베이스에 시드를 적용할 수 있습니다. 기본적으로 `db:seed` 명령어는 `Database\Seeders\DatabaseSeeder` 클래스를 실행하며, 이 클래스에서 다른 시더 클래스를 호출할 수 있습니다. 특정 시더 클래스를 직접 지정해 실행하려면 `--class` 옵션을 사용하세요.

```shell
php artisan db:seed

php artisan db:seed --class=UserSeeder
```

또한, `migrate:fresh` 명령어에 `--seed` 옵션을 함께 사용하면 모든 테이블을 삭제하고 마이그레이션과 시딩을 한 번에 재실행할 수 있습니다. 전체 데이터베이스를 처음부터 새로 만드는 데 유용한 방법입니다. `--seeder` 옵션을 사용하면 지정한 시더만 실행할 수도 있습니다.

```shell
php artisan migrate:fresh --seed

php artisan migrate:fresh --seed --seeder=UserSeeder
```

<a name="forcing-seeding-production"></a>
#### 프로덕션 환경에서 시더 실행 강제하기

일부 시딩 작업은 데이터 변경이나 손실을 야기할 수 있습니다. 프로덕션 데이터베이스에서 시더 명령어를 실수로 실행하는 일을 방지하기 위해, `production` 환경에서는 시더 실행 전 항상 확인 메시지가 표시됩니다. 확인 절차 없이 바로 시더를 실행하려면 `--force` 플래그를 사용하세요.

```shell
php artisan db:seed --force
```
