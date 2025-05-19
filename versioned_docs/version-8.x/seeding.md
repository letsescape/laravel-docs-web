# 데이터베이스: 시딩 (Database: Seeding)

- [소개](#introduction)
- [시더 작성하기](#writing-seeders)
    - [모델 팩토리 사용하기](#using-model-factories)
    - [추가 시더 호출하기](#calling-additional-seeders)
- [시더 실행하기](#running-seeders)

<a name="introduction"></a>
## 소개

라라벨은 시더 클래스(Seeder Class)를 사용해 데이터베이스에 데이터를 삽입할 수 있도록 지원합니다. 모든 시더 클래스는 `database/seeders` 디렉터리에 보관됩니다. 기본적으로 `DatabaseSeeder`라는 클래스가 미리 정의되어 있습니다. 이 클래스에서 `call` 메서드를 이용해 다른 시더 클래스를 실행할 수 있으며, 이를 통해 데이터 시딩의 실행 순서를 자유롭게 제어할 수 있습니다.

> [!TIP]
> [대량 할당 보호(mass assignment protection)](/docs/8.x/eloquent#mass-assignment)은 데이터베이스 시딩 중에 자동으로 비활성화됩니다.

<a name="writing-seeders"></a>
## 시더 작성하기

시더를 생성하려면 `make:seeder` [Artisan 명령어](/docs/8.x/artisan)를 실행합니다. 프레임워크로 생성한 모든 시더는 `database/seeders` 디렉터리에 저장됩니다.

```
php artisan make:seeder UserSeeder
```

시더 클래스는 기본적으로 하나의 메서드만 포함합니다: `run`. 이 메서드는 `db:seed` [Artisan 명령어](/docs/8.x/artisan)를 실행할 때 호출됩니다. `run` 메서드 안에서는 자유롭게 데이터베이스에 데이터를 삽입할 수 있습니다. [쿼리 빌더](/docs/8.x/queries)를 활용하여 직접 데이터를 추가해도 되고, [Eloquent 모델 팩토리](/docs/8.x/database-testing#defining-model-factories)를 사용할 수도 있습니다.

예를 들어, 기본 제공되는 `DatabaseSeeder` 클래스를 수정해 `run` 메서드에 데이터 삽입 구문을 추가해보겠습니다.

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
     *
     * @return void
     */
    public function run()
    {
        DB::table('users')->insert([
            'name' => Str::random(10),
            'email' => Str::random(10).'@gmail.com',
            'password' => Hash::make('password'),
        ]);
    }
}
```

> [!TIP]
> `run` 메서드 시그니처에 필요한 의존성을 타입힌트로 명시할 수 있습니다. 이 경우 라라벨 [서비스 컨테이너](/docs/8.x/container)를 통해 자동으로 주입됩니다.

<a name="using-model-factories"></a>
### 모델 팩토리 사용하기

각 모델을 시딩할 때마다 속성을 일일이 지정하는 것은 번거로울 수 있습니다. 이럴 때 [모델 팩토리](/docs/8.x/database-testing#defining-model-factories)를 사용하면, 대량의 데이터를 손쉽게 생성할 수 있습니다. 먼저, 팩토리의 정의 방법은 [모델 팩토리 문서](/docs/8.x/database-testing#defining-model-factories)를 참고해 팩토리를 만들어 주세요.

예를 들어, 각각 포스트를 하나씩 가진 사용자 50명을 생성해 보겠습니다.

```
use App\Models\User;

/**
 * Run the database seeders.
 *
 * @return void
 * /
public function run()
{
    User::factory()
            ->count(50)
            ->hasPosts(1)
            ->create();
}
```

<a name="calling-additional-seeders"></a>
### 추가 시더 호출하기

`DatabaseSeeder` 클래스 내에서는 `call` 메서드를 사용해 추가적인 시더 클래스를 실행할 수 있습니다. `call`을 활용하면 시더 클래스를 여러 파일로 분리해 관리할 수 있기 때문에, 하나의 시더가 너무 커지는 것을 방지할 수 있습니다. `call` 메서드에는 실행할 시더 클래스의 배열을 전달합니다.

```
/**
 * Run the database seeders.
 *
 * @return void
 */
public function run()
{
    $this->call([
        UserSeeder::class,
        PostSeeder::class,
        CommentSeeder::class,
    ]);
}
```

<a name="running-seeders"></a>
## 시더 실행하기

`db:seed` 아티즌 명령어를 실행하면 데이터베이스에 시딩을 할 수 있습니다. 기본적으로 `db:seed`는 `Database\Seeders\DatabaseSeeder` 클래스를 실행하며, 이 클래스에서 추가적인 시더들을 호출할 수 있습니다. 단일 시더만 독립적으로 실행하고 싶다면 `--class` 옵션을 사용해 특정 시더 클래스를 지정할 수 있습니다.

```
php artisan db:seed

php artisan db:seed --class=UserSeeder
```

또한, 데이터베이스를 초기화(migrate:fresh)와 동시에 시딩하고 싶다면 `--seed` 옵션을 함께 사용할 수 있습니다. 이 명령어는 모든 테이블을 삭제한 다음, 마이그레이션을 다시 실행하고 데이터를 시딩합니다. 데이터베이스 전체를 재구성할 때 매우 유용합니다.

```
php artisan migrate:fresh --seed
```

<a name="forcing-seeding-production"></a>
#### 운영 환경에서 시더 강제 실행하기

일부 시딩 작업은 데이터가 변경되거나 유실될 수 있습니다. 이를 방지하기 위해, 운영(production) 환경에서는 시더 실행 전 실행 여부를 한 번 더 확인하도록 되어 있습니다. 별도의 확인 절차 없이 시더를 강제로 실행하고 싶다면 `--force` 플래그를 사용하세요.

```
php artisan db:seed --force
```
