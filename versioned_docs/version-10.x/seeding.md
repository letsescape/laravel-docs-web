# 데이터베이스: 시더(Seeding) (Database: Seeding)

- [소개](#introduction)
- [시더 작성하기](#writing-seeders)
    - [모델 팩토리 사용하기](#using-model-factories)
    - [추가 시더 호출하기](#calling-additional-seeders)
    - [모델 이벤트 비활성화하기](#muting-model-events)
- [시더 실행하기](#running-seeders)

<a name="introduction"></a>
## 소개

라라벨에서는 시더(Seeder) 클래스를 사용하여 데이터베이스에 데이터를 손쉽게 삽입할 수 있는 기능을 제공합니다. 모든 시더 클래스는 `database/seeders` 디렉토리에 저장됩니다. 기본적으로 `DatabaseSeeder` 클래스가 이미 정의되어 있습니다. 이 클래스에서 `call` 메서드를 사용해 다른 시더 클래스를 실행할 수 있으므로, 시더 실행 순서를 자유롭게 제어할 수 있습니다.

> [!NOTE]
> 데이터베이스 시딩을 진행하는 동안에는 [대량 할당(Mass assignment) 보호](/docs/10.x/eloquent#mass-assignment)가 자동으로 비활성화됩니다.

<a name="writing-seeders"></a>
## 시더 작성하기

시더를 생성하려면 `make:seeder` [Artisan 명령어](/docs/10.x/artisan)를 실행하세요. 프레임워크에서 생성한 모든 시더는 `database/seeders` 디렉토리에 저장됩니다.

```shell
php artisan make:seeder UserSeeder
```

시더 클래스는 기본적으로 하나의 메서드(`run`)만 포함합니다. 이 메서드는 `db:seed` [Artisan 명령어](/docs/10.x/artisan)가 실행될 때 호출됩니다. `run` 메서드 내에서 원하시는 방식으로 데이터베이스에 데이터를 추가할 수 있습니다. [쿼리 빌더](/docs/10.x/queries)를 사용해 직접 데이터를 삽입하거나, [Eloquent 모델 팩토리](/docs/10.x/eloquent-factories)를 사용할 수도 있습니다.

예시로, 기본 `DatabaseSeeder` 클래스의 `run` 메서드에서 데이터베이스 삽입 구문을 추가해보겠습니다.

```
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
> `run` 메서드 시그니처에 필요한 의존성을 타입힌트로 지정할 수 있습니다. 라라벨 [서비스 컨테이너](/docs/10.x/container)를 통해 자동으로 주입됩니다.

<a name="using-model-factories"></a>
### 모델 팩토리 사용하기

물론, 각 모델의 시드 데이터를 직접 지정하는 것은 번거로운 일입니다. 대신, [모델 팩토리](/docs/10.x/eloquent-factories)를 사용하면 대량의 데이터베이스 레코드를 손쉽게 생성할 수 있습니다. 먼저, [모델 팩토리 문서](/docs/10.x/eloquent-factories)를 참고해 팩토리를 정의하는 방법을 확인하세요.

예를 들어, 50명의 사용자 각각이 하나의 게시글을 가지고 있도록 생성하려면 다음과 같이 할 수 있습니다.

```
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

`DatabaseSeeder` 클래스 내에서는 `call` 메서드를 사용해 추가 시더 클래스를 실행할 수 있습니다. `call` 메서드를 활용하면 시더 코드를 여러 파일로 분리하여 단일 시더 클래스가 지나치게 커지는 것을 방지할 수 있습니다. `call` 메서드는 실행할 시더 클래스의 배열을 인자로 받습니다.

```
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

시딩을 수행하는 동안, 모델에서 이벤트가 디스패치되는 것을 막고 싶을 수 있습니다. 이럴 때는 `WithoutModelEvents` 트레이트를 사용할 수 있습니다. 이 트레이트를 사용하면, `call` 메서드를 통해 추가 시더가 실행되는 경우에도 어떠한 모델 이벤트도 발생하지 않도록 할 수 있습니다.

```
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

`db:seed` Artisan 명령어를 실행하여 데이터베이스 시더를 동작시킬 수 있습니다. 기본적으로 `db:seed` 명령은 `Database\Seeders\DatabaseSeeder` 클래스를 실행하며, 이 클래스 내에서 다른 시더들이 호출될 수 있습니다. 하지만 `--class` 옵션을 사용하면 특정 시더 클래스만 개별적으로 실행할 수도 있습니다.

```shell
php artisan db:seed

php artisan db:seed --class=UserSeeder
```

또한, `migrate:fresh` 명령과 `--seed` 옵션을 함께 사용하여 데이터베이스의 모든 테이블을 삭제하고 마이그레이션을 재실행한 뒤 시더까지 적용할 수 있습니다. 이 명령은 데이터베이스를 완전히 새로 빌드해야 할 때 유용합니다. `--seeder` 옵션으로 특정 시더만 실행하도록 지정할 수도 있습니다.

```shell
php artisan migrate:fresh --seed

php artisan migrate:fresh --seed --seeder=UserSeeder 
```

<a name="forcing-seeding-production"></a>
#### 운영환경(Production)에서 시더 강제 실행하기

일부 시딩 작업은 데이터가 변경되거나 손실될 수 있습니다. 실수로 운영 데이터베이스에 시더를 실행하는 것을 방지하기 위해, `production` 환경에서는 시더 실행 전 반드시 확인 메시지가 표시됩니다. 확인 없이 강제로 시더를 실행하려면 `--force` 플래그를 사용하세요.

```shell
php artisan db:seed --force
```
