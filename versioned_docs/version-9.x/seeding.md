# 데이터베이스: 시딩 (Database: Seeding)

- [소개](#introduction)
- [시더 작성하기](#writing-seeders)
    - [모델 팩토리 사용](#using-model-factories)
    - [추가 시더 호출](#calling-additional-seeders)
    - [모델 이벤트 비활성화](#muting-model-events)
- [시더 실행하기](#running-seeders)

<a name="introduction"></a>
## 소개

라라벨은 시더 클래스(Seeder Class)를 사용해 데이터베이스에 데이터를 시드(초기 데이터 입력)할 수 있는 기능을 제공합니다. 모든 시더 클래스는 `database/seeders` 디렉터리에 저장됩니다. 기본적으로 `DatabaseSeeder` 클래스가 정의되어 있으며, 이 클래스에서 `call` 메서드를 사용해 다른 시더 클래스들을 실행할 수 있으므로, 시딩 순서를 원하는 대로 제어할 수 있습니다.

> [!NOTE]
> [대량 할당 보호](/docs/9.x/eloquent#mass-assignment)는 데이터베이스 시딩 중에 자동으로 비활성화됩니다.

<a name="writing-seeders"></a>
## 시더 작성하기

시더를 생성하려면 `make:seeder` [Artisan 명령어](/docs/9.x/artisan)를 실행하면 됩니다. 프레임워크에서 생성된 모든 시더는 `database/seeders` 디렉터리에 저장됩니다.

```shell
php artisan make:seeder UserSeeder
```

시더 클래스에는 기본적으로 오직 한 개의 메서드, 즉 `run` 메서드만 포함되어 있습니다. 이 메서드는 `db:seed` [Artisan 명령어](/docs/9.x/artisan)가 실행될 때 호출됩니다. `run` 메서드 안에서 데이터베이스에 원하는 방식으로 데이터를 삽입할 수 있습니다. [쿼리 빌더](/docs/9.x/queries)를 사용해 직접 데이터를 삽입하거나, [Eloquent 모델 팩토리](/docs/9.x/eloquent-factories)를 활용할 수도 있습니다.

예를 들어, 기본 `DatabaseSeeder` 클래스를 수정해 `run` 메서드에 데이터베이스 삽입 구문을 추가해보겠습니다.

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

> [!NOTE]
> `run` 메서드의 시그니처에 필요한 의존성을 타입힌트로 추가할 수 있습니다. 이 경우, 라라벨 [서비스 컨테이너](/docs/9.x/container)를 통해 자동으로 주입됩니다.

<a name="using-model-factories"></a>
### 모델 팩토리 사용

물론, 각 모델의 속성을 일일이 지정해서 시드 데이터를 만드는 것은 번거로울 수 있습니다. 이럴 때는 [모델 팩토리](/docs/9.x/eloquent-factories)를 활용해 대량의 더미 데이터를 손쉽게 생성할 수 있습니다. 먼저 [모델 팩토리 문서](/docs/9.x/eloquent-factories)를 참고하여 팩토리 사용 방법을 확인하세요.

예를 들어, 각기 하나의 게시글을 가진 50명의 사용자를 생성하고 싶을 때는 다음과 같이 작성할 수 있습니다.

```
use App\Models\User;

/**
 * Run the database seeders.
 *
 * @return void
 */
public function run()
{
    User::factory()
            ->count(50)
            ->hasPosts(1)
            ->create();
}
```

<a name="calling-additional-seeders"></a>
### 추가 시더 호출

`DatabaseSeeder` 클래스 안에서 `call` 메서드를 사용해 추가적인 시더 클래스를 실행할 수 있습니다. `call` 메서드를 활용하면 데이터베이스 시딩 작업을 여러 파일로 분리할 수 있어서, 하나의 시더 클래스가 너무 커지는 것을 방지할 수 있습니다. `call` 메서드는 실행할 시더 클래스의 배열을 인수로 받습니다.

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

<a name="muting-model-events"></a>
### 모델 이벤트 비활성화

시딩 작업 중에는 모델에서 발생하는 이벤트를 비활성화하고 싶을 수 있습니다. 이럴 때는 `WithoutModelEvents` 트레이트를 사용할 수 있습니다. 이 트레이트를 사용하면, `call` 메서드로 추가 시더를 실행하는 경우에도 모든 모델 이벤트가 트리거되지 않습니다.

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
     *
     * @return void
     */
    public function run()
    {
        $this->call([
            UserSeeder::class,
        ]);
    }
}
```

<a name="running-seeders"></a>
## 시더 실행하기

데이터베이스 시딩을 실행하려면 `db:seed` Artisan 명령어를 사용하면 됩니다. 기본적으로 `db:seed` 명령어는 `Database\Seeders\DatabaseSeeder` 클래스를 실행하여, 이 안에서 추가 시더 클래스를 호출할 수 있습니다. 특정한 시더 클래스를 개별적으로 실행하고 싶다면 `--class` 옵션을 사용하면 됩니다.

```shell
php artisan db:seed

php artisan db:seed --class=UserSeeder
```

또한, `migrate:fresh` 명령어와 `--seed` 옵션을 조합해 데이터베이스를 시딩할 수도 있습니다. 이 명령어는 모든 테이블을 삭제한 뒤 모든 마이그레이션을 다시 실행합니다. 데이터베이스를 완전히 리셋하고 싶을 때 유용합니다. 특정 시더만 실행하고 싶다면 `--seeder` 옵션을 사용할 수 있습니다.

```shell
php artisan migrate:fresh --seed

php artisan migrate:fresh --seed --seeder=UserSeeder 
```

<a name="forcing-seeding-production"></a>
#### 프로덕션에서 강제로 시더 실행하기

일부 시딩 작업은 데이터를 변경하거나 잃게 만들 수 있습니다. 이러한 위험을 방지하기 위해, 프로덕션 환경에서 시딩 명령어를 실행하면 실제로 시더가 작동하기 전에 확인 메시지가 표시됩니다. 프롬프트 없이 강제로 시더를 실행하려면 `--force` 플래그를 사용하면 됩니다.

```shell
php artisan db:seed --force
```
