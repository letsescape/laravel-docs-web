# 데이터베이스: 시딩(Database: Seeding)

- [소개](#introduction)
- [시더 작성하기](#writing-seeders)
    - [모델 팩토리 사용하기](#using-model-factories)
    - [추가 시더 호출하기](#calling-additional-seeders)
    - [모델 이벤트 비활성화](#muting-model-events)
- [시더 실행하기](#running-seeders)

<a name="introduction"></a>
## 소개

라라벨은 시더 클래스(seeder class)를 이용해 데이터베이스에 데이터를 쉽게 삽입(시딩)할 수 있는 기능을 제공합니다. 모든 시더 클래스는 `database/seeders` 디렉터리에 저장됩니다. 기본적으로 `DatabaseSeeder` 클래스가 미리 정의되어 있습니다. 이 클래스에서 `call` 메서드를 이용해 다른 시더 클래스를 실행할 수 있으므로 시딩 실행 순서를 원하는 대로 제어할 수 있습니다.

> [!NOTE]
> 데이터베이스 시딩 도중에는 [대량 할당(mass assignment) 보호](/docs/12.x/eloquent#mass-assignment)가 자동으로 비활성화됩니다.

<a name="writing-seeders"></a>
## 시더 작성하기

시더를 생성하려면 `make:seeder` [Artisan 명령어](/docs/12.x/artisan)를 실행합니다. 프레임워크가 생성한 모든 시더는 `database/seeders` 디렉터리에 저장됩니다.

```shell
php artisan make:seeder UserSeeder
```

시더 클래스에는 기본적으로 하나의 메서드, 즉 `run` 메서드만 포함되어 있습니다. 이 메서드는 `db:seed` [Artisan 명령어](/docs/12.x/artisan)가 실행될 때 호출됩니다. `run` 메서드 안에서는 원하는 방식으로 데이터베이스에 데이터를 삽입할 수 있습니다. [쿼리 빌더](/docs/12.x/queries)를 사용해 직접 데이터를 삽입할 수도 있고, [Eloquent 모델 팩토리](/docs/12.x/eloquent-factories)를 사용할 수도 있습니다.

예를 들어, 기본 제공되는 `DatabaseSeeder` 클래스를 수정하여 `run` 메서드에 데이터베이스 삽입 구문을 추가해 보겠습니다.

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
> `run` 메서드의 시그니처에 필요한 의존성을 타입힌트하면, 라라벨 [서비스 컨테이너](/docs/12.x/container)를 통해 자동으로 주입됩니다.

<a name="using-model-factories"></a>
### 모델 팩토리 사용하기

각 모델에 대한 데이터를 일일이 직접 지정하는 것은 매우 번거로운 작업입니다. [모델 팩토리](/docs/12.x/eloquent-factories)를 이용하면 대량의 데이터베이스 레코드를 손쉽게 생성할 수 있습니다. 먼저 공장(팩토리) 정의 방법은 [모델 팩토리 문서](/docs/12.x/eloquent-factories)를 참고하세요.

예를 들어, 50명의 유저를 생성하고 각 유저마다 하나의 관련 게시글(post)이 있도록 하려면 다음과 같이 작성할 수 있습니다.

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

`DatabaseSeeder` 클래스 내에서는 `call` 메서드를 사용하여 추가로 여러 시더 클래스를 실행할 수 있습니다. `call` 메서드를 이용하면 데이터베이스 시딩 작업을 여러 파일로 분리하여 각각의 시더 클래스가 너무 커지지 않도록 관리할 수 있습니다. `call` 메서드는 실행할 시더 클래스들의 배열을 인수로 받습니다.

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
### 모델 이벤트 비활성화

시딩을 실행할 때 모델의 이벤트가 발생하는 것을 막고 싶을 때가 있습니다. 이 경우 `WithoutModelEvents` 트레이트(trait)를 사용할 수 있습니다. 이 트레이트를 적용하면, `call` 메서드를 통해 추가적인 시더 클래스를 실행하더라도 어떤 모델 이벤트도 발생하지 않습니다.

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

데이터베이스에 시더를 적용하려면 `db:seed` Artisan 명령어를 실행하면 됩니다. 기본적으로 `db:seed` 명령어는 `Database\Seeders\DatabaseSeeder` 클래스를 실행하며, 이 클래스 안에서 다른 시더를 호출할 수 있습니다. 특정 시더 클래스만 별도로 실행하려면 `--class` 옵션으로 시더 클래스를 지정할 수 있습니다.

```shell
php artisan db:seed

php artisan db:seed --class=UserSeeder
```

또한, 데이터베이스의 모든 테이블을 삭제하고 마이그레이션을 다시 적용하는 `migrate:fresh` 명령어와 `--seed` 옵션을 함께 사용할 수도 있습니다. 이 명령은 데이터베이스를 완전히 새로 빌드하고 싶을 때 유용합니다. `--seeder` 옵션을 통해 특정 시더만 실행할 수도 있습니다.

```shell
php artisan migrate:fresh --seed

php artisan migrate:fresh --seed --seeder=UserSeeder
```

<a name="forcing-seeding-production"></a>
#### 프로덕션 환경에서 시더 강제 실행

일부 시딩 작업은 데이터가 변경되거나 손실될 수 있습니다. 이러한 위험을 방지하기 위해, 프로덕션 환경에서 시더를 실행하면 실제로 실행되기 전에 한 번 더 확인(prompt)을 요청합니다. 확인 없이 바로 시더를 실행하려면 `--force` 플래그를 사용하세요.

```shell
php artisan db:seed --force
```
