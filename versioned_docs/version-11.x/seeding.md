# 데이터베이스: 시딩 (Database: Seeding)

- [소개](#introduction)
- [시더 작성하기](#writing-seeders)
    - [모델 팩토리 사용하기](#using-model-factories)
    - [추가 시더 호출하기](#calling-additional-seeders)
    - [모델 이벤트 끄기](#muting-model-events)
- [시더 실행하기](#running-seeders)

<a name="introduction"></a>
## 소개

라라벨은 시더 클래스(Seeder Class)를 이용해 데이터베이스에 데이터를 쉽게 삽입(시딩)할 수 있는 기능을 제공합니다. 모든 시더 클래스는 `database/seeders` 디렉터리에 저장됩니다. 기본적으로 `DatabaseSeeder` 클래스가 미리 정의되어 있습니다. 이 클래스에서는 `call` 메서드를 이용해 다른 시더 클래스를 실행할 수 있으며, 이를 통해 시더의 실행 순서를 제어할 수 있습니다.

> [!NOTE]  
> 데이터베이스 시딩을 수행할 때는 [대량 할당 보호](/docs/11.x/eloquent#mass-assignment)가 자동으로 비활성화됩니다.

<a name="writing-seeders"></a>
## 시더 작성하기

시더를 생성하려면 `make:seeder` [Artisan 명령어](/docs/11.x/artisan)를 실행합니다. 프레임워크에서 생성된 모든 시더는 `database/seeders` 디렉터리 아래에 생성됩니다.

```shell
php artisan make:seeder UserSeeder
```

시더 클래스에는 기본적으로 `run`이라는 한 가지 메서드만 포함되어 있습니다. 이 메서드는 `db:seed` [Artisan 명령어](/docs/11.x/artisan)를 실행할 때 호출됩니다. `run` 메서드 내부에서는 원하는 대로 데이터베이스에 데이터를 삽입할 수 있습니다. 직접 [쿼리 빌더](/docs/11.x/queries)를 사용해서 데이터를 넣거나, [Eloquent 모델 팩토리](/docs/11.x/eloquent-factories)를 활용할 수도 있습니다.

예를 들어, 기본 `DatabaseSeeder` 클래스를 수정하여 `run` 메서드에 데이터 삽입 구문을 추가해 보겠습니다.

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
> `run` 메서드 시그니처에 필요한 의존성을 타입힌트로 지정할 수 있습니다. 지정 시, 라라벨 [서비스 컨테이너](/docs/11.x/container)에서 자동으로 주입해줍니다.

<a name="using-model-factories"></a>
### 모델 팩토리 사용하기

직접 모델의 각 속성을 하나씩 지정해서 시드를 작성하는 것은 번거로운 작업입니다. 대신, [모델 팩토리](/docs/11.x/eloquent-factories)를 사용하면 대량의 데이터베이스 레코드를 훨씬 쉽게 생성할 수 있습니다. 먼저 [모델 팩토리 문서](/docs/11.x/eloquent-factories)를 참고하여 팩토리 정의 방법을 익혀두시기 바랍니다.

예를 들어, 각각 하나의 연관된 포스트를 가진 사용자 50명을 생성하려면 다음과 같이 작성합니다.

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

`DatabaseSeeder` 클래스 안에서는 `call` 메서드를 이용해 추가 시더 클래스를 실행할 수 있습니다. `call` 메서드를 활요하면 데이터베이스 시딩 로직을 여러 파일로 쪼개어, 한 시더 클래스가 너무 방대해지는 것을 방지할 수 있습니다. `call` 메서드는 실행해야 할 시더 클래스를 배열로 받습니다.

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
### 모델 이벤트 끄기

시드를 실행하는 동안 모델이 이벤트를 발생시키지 않도록 하고 싶을 때가 있습니다. 이럴 때는 `WithoutModelEvents` 트레이트를 사용할 수 있습니다. 이 트레이트를 사용하면, `call` 메서드를 통해 추가 시더를 실행하는 경우에도 모델 이벤트가 전혀 발생하지 않도록 보장해줍니다.

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

`db:seed` Artisan 명령어를 실행하여 데이터베이스 시딩을 시작할 수 있습니다. 기본적으로 `db:seed` 명령은 `Database\Seeders\DatabaseSeeder` 클래스를 실행하고, 여기서 다른 시더들을 불러올 수 있습니다. 하지만 `--class` 옵션을 사용하면 특정 시더 클래스만 따로 지정해서 실행할 수도 있습니다.

```shell
php artisan db:seed

php artisan db:seed --class=UserSeeder
```

또한, `migrate:fresh` 명령과 `--seed` 옵션을 함께 사용하면 모든 테이블을 삭제하고 모든 마이그레이션을 다시 수행한 후 시더를 실행할 수 있습니다. 이 명령어는 데이터베이스를 완전히 리빌드하고 싶을 때 유용합니다. 또한 `--seeder` 옵션을 사용하면 특정 시더만 선택적으로 실행할 수도 있습니다.

```shell
php artisan migrate:fresh --seed

php artisan migrate:fresh --seed --seeder=UserSeeder
```

<a name="forcing-seeding-production"></a>
#### 운영 환경에서 강제로 시더 실행하기

일부 시딩 작업은 기존 데이터를 변경하거나 손실시킬 수도 있습니다. 여러분이 실수로 운영(프로덕션) 데이터베이스에 시딩 명령을 실행하지 않도록, `production` 환경에서 명령어를 실행할 때는 먼저 확인 메시지가 뜨게 됩니다. 확인 프롬프트 없이 강제로 시더를 실행하고 싶다면 `--force` 플래그를 사용하면 됩니다.

```shell
php artisan db:seed --force
```
