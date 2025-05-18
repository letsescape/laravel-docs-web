# Eloquent: 팩토리 (Eloquent: Factories)

- [소개](#introduction)
- [모델 팩토리 정의하기](#defining-model-factories)
    - [팩토리 생성하기](#generating-factories)
    - [팩토리 상태(State) 지정](#factory-states)
    - [팩토리 콜백](#factory-callbacks)
- [팩토리를 사용한 모델 생성](#creating-models-using-factories)
    - [모델 인스턴스화](#instantiating-models)
    - [모델 영속화](#persisting-models)
    - [시퀀스(Sequences)](#sequences)
- [팩토리 관계 정의하기](#factory-relationships)
    - [일대다(Has Many) 관계](#has-many-relationships)
    - [Belongs To(소속) 관계](#belongs-to-relationships)
    - [다대다(Many to Many) 관계](#many-to-many-relationships)
    - [폴리모픽(Polymorphic) 관계](#polymorphic-relationships)
    - [팩토리 내부에서 관계 정의하기](#defining-relationships-within-factories)
    - [기존 모델 재활용하기](#recycling-an-existing-model-for-relationships)

<a name="introduction"></a>
## 소개

애플리케이션을 테스트하거나 데이터베이스 시딩(Seed)을 진행할 때, 데이터베이스에 몇 개의 레코드를 삽입해야 할 수 있습니다. 라라벨은 [Eloquent 모델](/docs/11.x/eloquent)마다 기본 속성을 정의할 수 있는 모델 팩토리 기능을 제공하여, 각 컬럼 값을 일일이 수동으로 지정하지 않아도 됩니다.

팩토리가 어떻게 작성되는지 예시를 보려면, 애플리케이션의 `database/factories/UserFactory.php` 파일을 확인해 보십시오. 이 팩토리는 모든 새로운 라라벨 애플리케이션에 기본으로 포함되어 있으며, 아래와 같은 팩토리 정의가 들어있습니다.

```
namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
```

보시다시피, 팩토리는 기본적으로 라라벨의 기본 팩토리 클래스를 상속받으며 `definition` 메서드를 정의합니다. `definition` 메서드는 해당 팩토리로 모델을 생성할 때 적용될 기본 속성 값 집합을 반환합니다.

팩토리 내부에서는 `fake` 헬퍼를 통해 [Faker](https://github.com/FakerPHP/Faker) PHP 라이브러리를 사용할 수 있어, 테스트 및 시딩용 무작위 데이터를 손쉽게 생성할 수 있습니다.

> [!NOTE]  
> 애플리케이션의 Faker 로케일은 `config/app.php` 설정 파일의 `faker_locale` 옵션을 수정하여 변경할 수 있습니다.

<a name="defining-model-factories"></a>
## 모델 팩토리 정의하기

<a name="generating-factories"></a>
### 팩토리 생성하기

팩토리를 만들려면, `make:factory` [Artisan 명령어](/docs/11.x/artisan)를 실행하면 됩니다.

```shell
php artisan make:factory PostFactory
```

생성된 팩토리 클래스는 `database/factories` 디렉터리에 위치하게 됩니다.

<a name="factory-and-model-discovery-conventions"></a>
#### 모델과 팩토리 자동 매칭 규칙

팩토리를 정의한 후에는, 모델에 `Illuminate\Database\Eloquent\Factories\HasFactory` 트레이트가 제공하는 정적 `factory` 메서드를 사용하여 해당 모델의 팩토리 인스턴스를 생성할 수 있습니다.

`HasFactory` 트레이트의 `factory` 메서드는 특정 규칙에 따라 해당 모델의 올바른 팩토리를 찾습니다. 즉, 이 메서드는 `Database\Factories` 네임스페이스 아래에, 모델 이름과 동일한 클래스명에 `Factory`가 접미사로 붙은 팩토리 클래스를 찾게 됩니다. 만약 이러한 규칙이 애플리케이션 또는 팩토리에 맞지 않는 경우, 모델에서 `newFactory` 메서드를 오버라이드하여 직접 팩토리 인스턴스를 반환할 수 있습니다.

```
use Database\Factories\Administration\FlightFactory;

/**
 * Create a new factory instance for the model.
 */
protected static function newFactory()
{
    return FlightFactory::new();
}
```

그리고 해당 팩토리 클래스에 `model` 속성을 지정해주어야 합니다.

```
use App\Administration\Flight;
use Illuminate\Database\Eloquent\Factories\Factory;

class FlightFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var class-string<\Illuminate\Database\Eloquent\Model>
     */
    protected $model = Flight::class;
}
```

<a name="factory-states"></a>
### 팩토리 상태(State) 지정

상태(State) 변환 메서드를 활용하면, 모델 팩토리에 원하는 만큼의 다양한 변경사항을 조합하여 적용할 수 있습니다. 예를 들어, `Database\Factories\UserFactory`에 사용자의 기본 속성 값을 수정하는 `suspended` 상태 메서드를 추가할 수 있습니다.

상태 변환 메서드는 라라벨의 기본 팩토리 클래스가 제공하는 `state` 메서드를 주로 호출합니다. `state` 메서드는 팩토리에서 정의된 원시 속성 배열을 받아 변환할 속성 배열을 반환하는 클로저를 인자로 받습니다.

```
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Indicate that the user is suspended.
 */
public function suspended(): Factory
{
    return $this->state(function (array $attributes) {
        return [
            'account_status' => 'suspended',
        ];
    });
}
```

<a name="trashed-state"></a>
#### "Trashed" 상태

Eloquent 모델이 [소프트 삭제](/docs/11.x/eloquent#soft-deleting)를 지원한다면, 모델을 이미 "소프트 삭제"된 상태로 생성할 수 있도록 `trashed` 상태 메서드를 내장하고 있습니다. 직접 `trashed` 상태를 정의할 필요 없이 모든 팩토리에서 기본적으로 사용할 수 있습니다.

```
use App\Models\User;

$user = User::factory()->trashed()->create();
```

<a name="factory-callbacks"></a>
### 팩토리 콜백

팩토리 콜백은 `afterMaking` 및 `afterCreating` 메서드를 통해 등록할 수 있습니다. 이를 이용하여 모델 생성 이후에 추가 작업을 수행할 수 있습니다. 팩토리 클래스에서 `configure` 메서드를 정의하고, 이 안에서 콜백을 등록해야 합니다. 이 메서드는 팩토리 인스턴스화 시 라라벨이 자동으로 호출합니다.

```
namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class UserFactory extends Factory
{
    /**
     * Configure the model factory.
     */
    public function configure(): static
    {
        return $this->afterMaking(function (User $user) {
            // ...
        })->afterCreating(function (User $user) {
            // ...
        });
    }

    // ...
}
```

팩토리의 상태 메서드 내부에서도 콜백을 등록하여 해당 상태에만 적용되는 추가 작업을 정의할 수 있습니다.

```
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Indicate that the user is suspended.
 */
public function suspended(): Factory
{
    return $this->state(function (array $attributes) {
        return [
            'account_status' => 'suspended',
        ];
    })->afterMaking(function (User $user) {
        // ...
    })->afterCreating(function (User $user) {
        // ...
    });
}
```

<a name="creating-models-using-factories"></a>
## 팩토리를 사용한 모델 생성

<a name="instantiating-models"></a>
### 모델 인스턴스화

팩토리를 정의한 후에는, 모델에 정의된 `Illuminate\Database\Eloquent\Factories\HasFactory` 트레이트의 정적 `factory` 메서드를 통하여 해당 모델의 팩토리 인스턴스를 생성할 수 있습니다. 다양한 모델 생성 예시를 살펴보겠습니다. 먼저, `make` 메서드를 사용하여 데이터베이스에 저장하지 않고 모델 인스턴스를 만들 수 있습니다.

```
use App\Models\User;

$user = User::factory()->make();
```

`count` 메서드를 활용하면 여러 개의 모델 인스턴스를 한 번에 컬렉션 형태로 만들 수 있습니다.

```
$users = User::factory()->count(3)->make();
```

<a name="applying-states"></a>
#### 상태(State) 적용하기

정의한 [상태 메서드](#factory-states)를 팩토리에 적용할 수도 있습니다. 여러 가지 상태 변환을 동시에 적용하려면, 해당 상태 변환 메서드를 연속적으로 호출하면 됩니다.

```
$users = User::factory()->count(5)->suspended()->make();
```

<a name="overriding-attributes"></a>
#### 속성 덮어쓰기

모델의 기본 값 일부를 수정하고 싶다면, `make` 메서드에 값 배열을 전달하면 됩니다. 지정한 속성만 덮어쓰고, 나머지 속성은 팩토리에서 정의한 기본값이 유지됩니다.

```
$user = User::factory()->make([
    'name' => 'Abigail Otwell',
]);
```

또는 팩토리 인스턴스에서 `state` 메서드를 직접 호출하여 인라인 방식으로 상태를 변환할 수도 있습니다.

```
$user = User::factory()->state([
    'name' => 'Abigail Otwell',
])->make();
```

> [!NOTE]  
> 팩토리로 모델을 생성할 때는 [대량 할당 보호](/docs/11.x/eloquent#mass-assignment)가 자동으로 비활성화됩니다.

<a name="persisting-models"></a>
### 모델 영속화

`create` 메서드는 모델 인스턴스를 만들고 Eloquent의 `save` 메서드를 이용해 데이터베이스에 저장합니다.

```
use App\Models\User;

// App\Models\User 인스턴스를 하나 생성...
$user = User::factory()->create();

// App\Models\User 인스턴스를 3개 생성...
$users = User::factory()->count(3)->create();
```

`create` 메서드에 속성 배열을 전달하여, 팩토리의 기본 속성을 덮어쓸 수도 있습니다.

```
$user = User::factory()->create([
    'name' => 'Abigail',
]);
```

<a name="sequences"></a>
### 시퀀스(Sequences)

모델을 여러 개 생성할 때 특정 속성의 값을 번갈아 가며 부여하고 싶은 경우, 상태 변환을 시퀀스로 지정할 수 있습니다. 예를 들어 사용자마다 `admin` 컬럼 값을 번갈아 `Y`와 `N`으로 바꾸려면 아래와 같이 작성할 수 있습니다.

```
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Sequence;

$users = User::factory()
    ->count(10)
    ->state(new Sequence(
        ['admin' => 'Y'],
        ['admin' => 'N'],
    ))
    ->create();
```

이 예시에서는 5명의 사용자는 `admin` 값이 `Y`로, 나머지 5명은 `N`으로 생성됩니다.

필요하다면, 시퀀스 값으로 클로저를 지정할 수 있습니다. 새로운 값이 필요할 때마다 클로저가 호출됩니다.

```
use Illuminate\Database\Eloquent\Factories\Sequence;

$users = User::factory()
    ->count(10)
    ->state(new Sequence(
        fn (Sequence $sequence) => ['role' => UserRoles::all()->random()],
    ))
    ->create();
```

시퀀스 클로저 안에서는 클로저로 주입된 시퀀스 인스턴스의 `$index`와 `$count` 속성에 접근할 수 있습니다. `$index` 속성은 현재 순환 횟수를, `$count` 속성은 시퀀스가 총 몇 번 실행될지를 나타냅니다.

```
$users = User::factory()
    ->count(10)
    ->sequence(fn (Sequence $sequence) => ['name' => 'Name '.$sequence->index])
    ->create();
```

편의를 위해 `sequence` 메서드를 쓸 수도 있습니다. 이는 내부적으로 `state` 메서드를 호출합니다. `sequence` 메서드에는 클로저 또는 여러 속성 배열을 인자로 전달할 수 있습니다.

```
$users = User::factory()
    ->count(2)
    ->sequence(
        ['name' => 'First User'],
        ['name' => 'Second User'],
    )
    ->create();
```

<a name="factory-relationships"></a>
## 팩토리 관계 정의하기

<a name="has-many-relationships"></a>
### 일대다(Has Many) 관계

이제 라라벨의 플루언트한 팩토리 메서드로 Eloquent 모델 간의 관계를 어떻게 구축하는지 살펴보겠습니다. 예를 들어, 애플리케이션에 `App\Models\User`와 `App\Models\Post` 모델이 있다고 가정해보겠습니다. 또한, `User` 모델이 `Post`와 일대다(`hasMany`) 관계로 연결되어 있다고 가정합니다. 이 경우, 팩토리의 `has` 메서드를 사용하여 3개의 포스트를 가진 사용자를 생성할 수 있습니다. `has` 메서드에는 팩토리 인스턴스를 전달하면 됩니다.

```
use App\Models\Post;
use App\Models\User;

$user = User::factory()
    ->has(Post::factory()->count(3))
    ->create();
```

관례상, `has` 메서드에 `Post` 모델 팩토리를 전달하면 라라벨은 `User` 모델의 `posts` 메서드(즉, 관계 정의 메서드)가 존재한다고 간주합니다. 필요할 경우, 조작할 관계 메서드의 이름을 두 번째 인자로 명시적으로 지정할 수 있습니다.

```
$user = User::factory()
    ->has(Post::factory()->count(3), 'posts')
    ->create();
```

물론, 연관된 모델에서도 상태 변환을 적용할 수 있습니다. 또한, 상태 변환에 부모 모델에 접근이 필요한 경우, 클로저 기반의 상태 변환을 전달할 수도 있습니다.

```
$user = User::factory()
    ->has(
        Post::factory()
            ->count(3)
            ->state(function (array $attributes, User $user) {
                return ['user_type' => $user->type];
            })
        )
    ->create();
```

<a name="has-many-relationships-using-magic-methods"></a>
#### 매직 메서드(Magic Methods) 사용하기

더 편리하게는, 라라벨의 팩토리 매직 메서드를 사용하여 관계를 생성할 수 있습니다. 예를 들어 아래와 같이 사용하면, `User` 모델에 `posts` 관계 메서드가 있다고 간주하여 연관된 모델이 생성됩니다.

```
$user = User::factory()
    ->hasPosts(3)
    ->create();
```

매직 메서드 방식으로 연관된 모델을 생성할 때, 연관 모델의 속성을 덮어쓸 배열도 전달할 수 있습니다.

```
$user = User::factory()
    ->hasPosts(3, [
        'published' => false,
    ])
    ->create();
```

부모 모델에 접근해야 하는 상태 변환이 필요한 경우, 클로저 기반으로 상태를 지정할 수도 있습니다.

```
$user = User::factory()
    ->hasPosts(3, function (array $attributes, User $user) {
        return ['user_type' => $user->type];
    })
    ->create();
```

<a name="belongs-to-relationships"></a>
### Belongs To(소속) 관계

이제 팩토리를 사용하여 "일대다" 관계의 역방향, 즉 Belongs To 관계를 생성하는 방법을 알아보겠습니다. `for` 메서드를 사용하면, 팩토리로 생성된 모델이 어떤 부모 모델에 속하는지를 지정할 수 있습니다. 예를 들어, 한 명의 유저가 소유한 3개의 `App\Models\Post` 인스턴스를 만들고 싶다면 아래와 같이 작성할 수 있습니다.

```
use App\Models\Post;
use App\Models\User;

$posts = Post::factory()
    ->count(3)
    ->for(User::factory()->state([
        'name' => 'Jessica Archer',
    ]))
    ->create();
```

이미 생성된 부모 모델 인스턴스가 있다면, 해당 인스턴스를 `for` 메서드에 직접 전달할 수도 있습니다.

```
$user = User::factory()->create();

$posts = Post::factory()
    ->count(3)
    ->for($user)
    ->create();
```

<a name="belongs-to-relationships-using-magic-methods"></a>
#### 매직 메서드 사용하기

Belongs To 관계에서도 팩토리 매직 메서드를 사용할 수 있습니다. 아래 예시는 세 개의 포스트가 `Post` 모델의 `user` 관계에 속하도록 생성합니다.

```
$posts = Post::factory()
    ->count(3)
    ->forUser([
        'name' => 'Jessica Archer',
    ])
    ->create();
```

<a name="many-to-many-relationships"></a>
### 다대다(Many to Many) 관계

[일대다 관계](#has-many-relationships)와 마찬가지로, 다대다(Many to Many) 관계도 `has` 메서드를 사용하여 생성할 수 있습니다.

```
use App\Models\Role;
use App\Models\User;

$user = User::factory()
    ->has(Role::factory()->count(3))
    ->create();
```

<a name="pivot-table-attributes"></a>
#### 중간 테이블(Pivot) 속성 정의

두 모델을 연결하는 중간(pivot) 테이블에 값이 들어가야 할 속성이 있다면, `hasAttached` 메서드를 사용할 수 있습니다. 이 메서드는 두 번째 인자로 피벗 테이블 속성 이름과 값을 배열로 전달받습니다.

```
use App\Models\Role;
use App\Models\User;

$user = User::factory()
    ->hasAttached(
        Role::factory()->count(3),
        ['active' => true]
    )
    ->create();
```

연관된 모델의 정보에 따라 상태 변환이 필요한 경우, 상태 변환을 클로저로 전달할 수도 있습니다.

```
$user = User::factory()
    ->hasAttached(
        Role::factory()
            ->count(3)
            ->state(function (array $attributes, User $user) {
                return ['name' => $user->name.' Role'];
            }),
        ['active' => true]
    )
    ->create();
```

이미 생성되어 있는 모델 인스턴스를 다수의 모델에 붙이고 싶다면, `hasAttached` 메서드에 모델 인스턴스(들)를 전달하면 됩니다. 아래 예시에서는 동일한 3개의 역할(role)이 세 명의 사용자에 모두 연결됩니다.

```
$roles = Role::factory()->count(3)->create();

$user = User::factory()
    ->count(3)
    ->hasAttached($roles, ['active' => true])
    ->create();
```

<a name="many-to-many-relationships-using-magic-methods"></a>
#### 매직 메서드 사용하기

다대다 관계 역시 팩토리의 매직 메서드를 쓸 수 있습니다. 아래 예시에서는 `User` 모델의 `roles` 관계 메서드를 통해 연관된 모델을 생성합니다.

```
$user = User::factory()
    ->hasRoles(1, [
        'name' => 'Editor'
    ])
    ->create();
```

<a name="polymorphic-relationships"></a>
### 폴리모픽(Polymorphic) 관계

[폴리모픽 관계](/docs/11.x/eloquent-relationships#polymorphic-relationships)도 팩토리로 생성할 수 있습니다. 폴리모픽의 "morph many" 관계는 일반적인 일대다 관계와 동일하게 작성됩니다. 예를 들어, `App\Models\Post` 모델이 `App\Models\Comment` 모델과 `morphMany` 관계를 가진 경우, 아래와 같이 팩토리에서 사용합니다.

```
use App\Models\Post;

$post = Post::factory()->hasComments(3)->create();
```

<a name="morph-to-relationships"></a>
#### Morph To 관계

`morphTo` 관계를 생성할 때는 매직 메서드를 사용할 수 없으며, 반드시 `for` 메서드를 직접 명시적으로 사용해야 합니다. 예를 들어, `Comment` 모델에 `morphTo` 관계를 정의한 `commentable` 메서드가 있다고 가정하면, 아래와 같이 한 포스트에 속한 댓글 3개를 생성할 수 있습니다.

```
$comments = Comment::factory()->count(3)->for(
    Post::factory(), 'commentable'
)->create();
```

<a name="polymorphic-many-to-many-relationships"></a>
#### 폴리모픽 다대다(Many to Many) 관계

폴리모픽 "다대다"(`morphToMany`/`morphedByMany`) 관계도 일반 다대다와 동일하게 팩토리로 생성할 수 있습니다.

```
use App\Models\Tag;
use App\Models\Video;

$videos = Video::factory()
    ->hasAttached(
        Tag::factory()->count(3),
        ['public' => true]
    )
    ->create();
```

또한, 매직 `has` 메서드를 사용하여 폴리모픽 다대다 관계를 생성할 수도 있습니다.

```
$videos = Video::factory()
    ->hasTags(3, ['public' => true])
    ->create();
```

<a name="defining-relationships-within-factories"></a>
### 팩토리 내부에서 관계 정의하기

팩토리 내부에서 관계를 정의할 때는, 보통 관계의 외래 키(foreign key)에 새로운 팩토리 인스턴스를 할당합니다. 이는 주로 `belongsTo` 및 `morphTo`와 같은 "역방향" 관계에서 활용됩니다. 예를 들어, 포스트를 생성할 때 새로운 유저도 함께 생성하고 싶다면 다음과 같이 작성하면 됩니다.

```
use App\Models\User;

/**
 * Define the model's default state.
 *
 * @return array<string, mixed>
 */
public function definition(): array
{
    return [
        'user_id' => User::factory(),
        'title' => fake()->title(),
        'content' => fake()->paragraph(),
    ];
}
```

관계의 컬럼이 팩토리 내에서 동적으로 결정되어야 한다면, 해당 속성에 클로저를 할당할 수도 있습니다. 클로저에는 팩토리에서 평가된 속성 배열이 전달됩니다.

```
/**
 * Define the model's default state.
 *
 * @return array<string, mixed>
 */
public function definition(): array
{
    return [
        'user_id' => User::factory(),
        'user_type' => function (array $attributes) {
            return User::find($attributes['user_id'])->type;
        },
        'title' => fake()->title(),
        'content' => fake()->paragraph(),
    ];
}
```

<a name="recycling-an-existing-model-for-relationships"></a>
### 기존 모델 재활용하기

여러 모델이 하나의 공통 모델과 관계를 가질 때, `recycle` 메서드를 사용하면 팩토리가 만드는 관계들에 동일한 연관 모델 인스턴스를 재활용할 수 있습니다.

예를 들어, `Airline`, `Flight`, `Ticket` 모델이 있다고 가정해보겠습니다. 티켓은 항공사와 항공편 모두와 관계를 맺고, 항공편 또한 같은 항공사를 참조합니다. 티켓을 생성할 때, 티켓과 항공편 모두 동일한 항공사로 연결하려면, 아래와 같이 `recycle` 메서드에 항공사 인스턴스를 전달할 수 있습니다.

```
Ticket::factory()
    ->recycle(Airline::factory()->create())
    ->create();
```

여러 모델이 동일한 유저 또는 팀에 속할 때도 `recycle` 메서드가 유용하게 사용됩니다.

`recycle` 메서드는 기존 모델의 컬렉션도 인수로 받을 수 있습니다. 만약 컬렉션을 전달하면, 팩토리 실행 시 해당 타입의 모델이 필요할 때마다 컬렉션에서 무작위로 하나를 선택합니다.

```
Ticket::factory()
    ->recycle($airlines)
    ->create();
```
