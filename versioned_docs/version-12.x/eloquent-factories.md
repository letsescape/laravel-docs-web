# 일러쿼언트: 팩토리 (Eloquent: Factories)

- [소개](#introduction)
- [모델 팩토리 정의하기](#defining-model-factories)
    - [팩토리 생성하기](#generating-factories)
    - [팩토리 상태(state)](#factory-states)
    - [팩토리 콜백(callback)](#factory-callbacks)
- [팩토리를 사용한 모델 생성](#creating-models-using-factories)
    - [모델 인스턴스화](#instantiating-models)
    - [모델 영속화(persisting)](#persisting-models)
    - [시퀀스(Sequences)](#sequences)
- [팩토리 관계 생성](#factory-relationships)
    - [Has Many 관계](#has-many-relationships)
    - [Belongs To 관계](#belongs-to-relationships)
    - [Many to Many 관계](#many-to-many-relationships)
    - [다형성 관계](#polymorphic-relationships)
    - [팩토리 내부에서 관계 정의하기](#defining-relationships-within-factories)
    - [관계를 위해 기존 모델 재활용하기](#recycling-an-existing-model-for-relationships)

<a name="introduction"></a>
## 소개

애플리케이션을 테스트하거나 데이터베이스를 시드(seed)할 때, 데이터베이스에 여러 레코드를 삽입해야 할 때가 있습니다. 모든 컬럼의 값을 직접 지정하는 대신, 라라벨에서는 각 [Eloquent 모델](/docs/eloquent)에 대해 기본 속성 집합을 모델 팩토리로 정의할 수 있습니다.

팩토리를 직접 작성하는 예제를 보려면 애플리케이션의 `database/factories/UserFactory.php` 파일을 참고해 보세요. 이 팩토리는 모든 신규 라라벨 애플리케이션에 기본적으로 포함되어 있으며, 다음과 같은 팩토리 정의를 담고 있습니다:

```php
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

보시는 것처럼, 팩토리는 가장 기본적으로 라라벨의 기본 팩토리 클래스를 상속하고, `definition` 메서드를 정의하는 클래스입니다. `definition` 메서드는 팩토리를 사용해 모델을 생성할 때 적용할 기본 속성 값 집합을 반환합니다.

`fake` 헬퍼를 통해 팩토리에서는 [Faker](https://github.com/FakerPHP/Faker) PHP 라이브러리를 사용할 수 있습니다. 이를 활용해 테스트와 시드 데이터를 손쉽게 무작위로 만들어낼 수 있습니다.

> [!NOTE]
> 애플리케이션의 Faker 로케일(locale)을 변경하려면 `config/app.php` 설정 파일에서 `faker_locale` 옵션을 수정하면 됩니다.

<a name="defining-model-factories"></a>
## 모델 팩토리 정의하기

<a name="generating-factories"></a>
### 팩토리 생성하기

팩토리를 생성하려면 `make:factory` [Artisan 명령어](/docs/artisan)를 실행합니다:

```shell
php artisan make:factory PostFactory
```

새로운 팩토리 클래스는 `database/factories` 디렉토리에 생성됩니다.

<a name="factory-and-model-discovery-conventions"></a>
#### 모델과 팩토리 자동 연결 규칙

팩토리를 정의한 뒤에는, 모델에 `Illuminate\Database\Eloquent\Factories\HasFactory` 트레이트가 제공하는 static `factory` 메서드를 사용해 해당 모델용 팩토리 인스턴스를 만들 수 있습니다.

`HasFactory` 트레이트의 `factory` 메서드는 컨벤션(명명 규칙)에 따라 해당 모델의 적절한 팩토리를 찾습니다. 구체적으로, 이 메서드는 `Database\Factories` 네임스페이스에서 모델 이름과 일치하고, `Factory`로 끝나는 클래스명을 가진 팩토리를 찾게 됩니다. 만약 이런 컨벤션이 애플리케이션이나 팩토리에 맞지 않는 경우, 모델의 `newFactory` 메서드를 오버라이드하여 해당 모델의 팩토리 인스턴스를 직접 반환하도록 할 수 있습니다:

```php
use Database\Factories\Administration\FlightFactory;

/**
 * Create a new factory instance for the model.
 */
protected static function newFactory()
{
    return FlightFactory::new();
}
```

그리고 팩토리 클래스에 적절한 `model` 속성을 정의해야 합니다:

```php
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
### 팩토리 상태(state)

상태 변형 메서드는 다양한 조합으로 모델 팩토리에 적용할 수 있는 별도의 속성 변형을 정의할 수 있게 합니다. 예를 들어, `Database\Factories\UserFactory` 팩토리에 기본 속성 값을 바꾸는 `suspended` 상태 메서드를 추가할 수 있습니다.

상태 변환 메서드는 보통 라라벨의 기본 팩토리 클래스가 제공하는 `state` 메서드를 호출합니다. `state` 메서드는 팩토리에서 정의한 원시 속성 배열을 전달받는 클로저를 인자로 받고, 변경할 속성의 배열을 반환해야 합니다:

```php
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

일러쿼언트 모델이 [소프트 딜리트](/docs/eloquent#soft-deleting)를 지원하는 경우, 내장된 `trashed` 상태 메서드를 사용해 생성되는 모델이 "소프트 딜리트" 상태가 되도록 지정할 수 있습니다. 이 `trashed` 상태는 모든 팩토리에서 자동으로 제공되므로 별도로 정의할 필요가 없습니다:

```php
use App\Models\User;

$user = User::factory()->trashed()->create();
```

<a name="factory-callbacks"></a>
### 팩토리 콜백(callback)

팩토리 콜백은 `afterMaking`과 `afterCreating` 메서드를 통해 등록할 수 있으며, 모델을 만든 이후 추가 작업을 처리하는 데 사용합니다. 이 콜백들은 팩토리 클래스에 `configure` 메서드를 정의함으로써 등록할 수 있으며, 이 메서드는 팩토리 인스턴스가 생성될 때 라라벨이 자동으로 호출합니다:

```php
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

또한, 상태 메서드 내부에서도 해당 상태에 특화된 팩토리 콜백을 등록할 수 있습니다:

```php
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

팩토리를 정의한 후에는, 모델에 부여된 `Illuminate\Database\Eloquent\Factories\HasFactory` 트레이트의 static `factory` 메서드를 통해 해당 모델의 팩토리 인스턴스를 만들 수 있습니다. 예제를 통해 실제 모델 생성을 살펴보겠습니다. 먼저, `make` 메서드를 사용하면 데이터베이스에 저장하지 않고 모델 객체만 생성합니다:

```php
use App\Models\User;

$user = User::factory()->make();
```

`count` 메서드를 사용해서 여러 모델을 한 번에 생성할 수도 있습니다:

```php
$users = User::factory()->count(3)->make();
```

<a name="applying-states"></a>
#### 상태(state) 적용하기

모델에 [상태](#factory-states)를 적용할 수도 있습니다. 여러 상태 변환을 적용하려면 각 상태 메서드를 차례로 호출하면 됩니다:

```php
$users = User::factory()->count(5)->suspended()->make();
```

<a name="overriding-attributes"></a>
#### 속성(attribute) 재정의

모델의 기본 값을 일부 재정의하고 싶다면, `make` 메서드에 값의 배열을 전달하면 됩니다. 지정한 속성만 변경되고, 나머지는 팩토리에서 정한 기본 값이 유지됩니다:

```php
$user = User::factory()->make([
    'name' => 'Abigail Otwell',
]);
```

또는, `state` 메서드를 팩토리 인스턴스에서 직접 호출해 즉석에서 상태를 변형할 수도 있습니다:

```php
$user = User::factory()->state([
    'name' => 'Abigail Otwell',
])->make();
```

> [!NOTE]
> 팩토리로 모델을 생성할 때는 [대량 할당 보호](/docs/eloquent#mass-assignment)가 자동으로 비활성화됩니다.

<a name="persisting-models"></a>
### 모델 영속화(persisting)

`create` 메서드는 모델 인스턴스를 생성하고, 일러쿼언트의 `save` 메서드를 통해 데이터베이스에 저장합니다:

```php
use App\Models\User;

// App\Models\User 인스턴스 하나 생성...
$user = User::factory()->create();

// App\Models\User 인스턴스 세 개 생성...
$users = User::factory()->count(3)->create();
```

팩토리의 기본 모델 속성을 재정의하려면 `create` 메서드에 속성 배열을 전달하면 됩니다:

```php
$user = User::factory()->create([
    'name' => 'Abigail',
]);
```

<a name="sequences"></a>
### 시퀀스(Sequences)

여러 모델을 생성할 때, 특정 속성 값을 번갈아가며 할당하고 싶을 때가 있습니다. 이럴 때는 상태 변환을 시퀀스로 정의하면 됩니다. 예를 들어, 각 사용자의 `admin` 컬럼 값을 `Y`와 `N`으로 번갈아가며 할당하려면 아래와 같이 작성할 수 있습니다:

```php
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

이 예제에서는, 다섯 명은 `admin` 값이 `Y`, 다섯 명은 `N`인 사용자로 생성됩니다.

필요하다면 시퀀스 값으로 클로저를 전달할 수도 있습니다. 이 클로저는 시퀀스가 값을 새로 할당해야 할 때마다 호출됩니다:

```php
use Illuminate\Database\Eloquent\Factories\Sequence;

$users = User::factory()
    ->count(10)
    ->state(new Sequence(
        fn (Sequence $sequence) => ['role' => UserRoles::all()->random()],
    ))
    ->create();
```

시퀀스 클로저 안에서는 `$sequence` 인스턴스의 `$index`(지금까지 시퀀스가 반복된 횟수) 또는 `$count`(전체 반복 횟수) 속성에 접근할 수 있습니다:

```php
$users = User::factory()
    ->count(10)
    ->sequence(fn (Sequence $sequence) => ['name' => 'Name '.$sequence->index])
    ->create();
```

편의를 위해, `sequence` 메서드를 사용해도 시퀀스를 적용할 수 있습니다. 이 메서드는 내부적으로 `state` 메서드를 호출합니다. `sequence` 메서드는 클로저나 배열 형태의 시퀀스 속성들을 인자로 받을 수 있습니다:

```php
$users = User::factory()
    ->count(2)
    ->sequence(
        ['name' => 'First User'],
        ['name' => 'Second User'],
    )
    ->create();
```

<a name="factory-relationships"></a>
## 팩토리 관계 생성

<a name="has-many-relationships"></a>
### Has Many 관계

이제 라라벨의 유연한 팩토리 메서드로 Eloquent 모델 관계를 만드는 방법을 살펴봅니다. 예를 들어, `App\Models\User` 모델과 `App\Models\Post` 모델이 있다고 가정합시다. 그리고 `User` 모델이 `Post`와 `hasMany` 관계를 정의한다고 할 때, `has` 메서드를 사용해 게시글(Post) 3개를 가진 사용자를 만들 수 있습니다. `has` 메서드는 팩토리 인스턴스를 인자로 받습니다:

```php
use App\Models\Post;
use App\Models\User;

$user = User::factory()
    ->has(Post::factory()->count(3))
    ->create();
```

컨벤션상, `has` 메서드에 `Post` 모델을 전달하면 라라벨은 `User` 모델에 `posts` 메서드(관계 메서드)가 정의되어 있다고 가정합니다. 만약 다루고자 하는 관계 메서드의 이름을 직접 정해야 한다면 두 번째 인자로 해당 이름을 명시할 수 있습니다:

```php
$user = User::factory()
    ->has(Post::factory()->count(3), 'posts')
    ->create();
```

물론, 관계 모델에도 상태 변환을 적용할 수 있습니다. 그리고, 상태 변화에 부모 모델의 정보가 필요하다면 클로저를 사용하여 상태 변환을 처리할 수도 있습니다:

```php
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
#### 매직 메서드(Magic Methods) 활용

편의를 위해, 라라벨의 매직 팩토리 관계 메서드를 활용해 관계를 쉽게 만들 수 있습니다. 아래 예시는 컨벤션에 따라 관련 모델이 `User` 모델의 `posts` 관계 메서드를 통해 생성됨을 의미합니다:

```php
$user = User::factory()
    ->hasPosts(3)
    ->create();
```

매직 메서드로 팩토리 관계를 만들 때, 관계 모델에 적용할 속성 배열을 전달해서 덮어쓸 수도 있습니다:

```php
$user = User::factory()
    ->hasPosts(3, [
        'published' => false,
    ])
    ->create();
```

상태 변환이 부모 모델의 값에 의존한다면 클로저 기반의 상태 변환도 매직 메서드에서 사용할 수 있습니다:

```php
$user = User::factory()
    ->hasPosts(3, function (array $attributes, User $user) {
        return ['user_type' => $user->type];
    })
    ->create();
```

<a name="belongs-to-relationships"></a>
### Belongs To 관계

이제 "has many" 관계를 팩토리로 만드는 방법에 이어, 그 반대인 관계도 살펴봅니다. 팩토리에서 생성된 모델이 소속될 부모 모델을 정의하려면 `for` 메서드를 사용할 수 있습니다. 아래는 세 개의 `App\Models\Post` 인스턴스를 하나의 사용자에 소속되도록 생성하는 예제입니다:

```php
use App\Models\Post;
use App\Models\User;

$posts = Post::factory()
    ->count(3)
    ->for(User::factory()->state([
        'name' => 'Jessica Archer',
    ]))
    ->create();
```

이미 생성된 부모 모델 인스턴스가 있다면, `for` 메서드에 해당 모델 인스턴스를 전달할 수도 있습니다:

```php
$user = User::factory()->create();

$posts = Post::factory()
    ->count(3)
    ->for($user)
    ->create();
```

<a name="belongs-to-relationships-using-magic-methods"></a>
#### 매직 메서드 활용

편의상, "belongs to" 관계도 라라벨의 매직 팩토리 관계 메서드로 정의할 수 있습니다. 아래 예시에서는 세 게시글이 모두 `Post` 모델의 `user` 관계에 소속된다고 컨벤션에 따라 처리합니다:

```php
$posts = Post::factory()
    ->count(3)
    ->forUser([
        'name' => 'Jessica Archer',
    ])
    ->create();
```

<a name="many-to-many-relationships"></a>
### Many to Many 관계

[Has Many 관계](#has-many-relationships)와 마찬가지로, "many to many" 관계 역시 `has` 메서드를 사용해 생성할 수 있습니다:

```php
use App\Models\Role;
use App\Models\User;

$user = User::factory()
    ->has(Role::factory()->count(3))
    ->create();
```

<a name="pivot-table-attributes"></a>
#### Pivot(중간) 테이블 속성

모델을 연결하는 pivot(중간) 테이블에 속성을 지정해야 할 때는, `hasAttached` 메서드를 사용합니다. 이 메서드는 두 번째 인자로 pivot 테이블의 컬럼 값 배열을 받습니다:

```php
use App\Models\Role;
use App\Models\User;

$user = User::factory()
    ->hasAttached(
        Role::factory()->count(3),
        ['active' => true]
    )
    ->create();
```

상태 변환이 관계 모델 값에 따라 달라져야 한다면, 클로저 기반의 상태 변환을 사용할 수도 있습니다:

```php
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

이미 생성된 모델 인스턴스가 있을 때, 해당 인스턴스들을 `hasAttached` 메서드에 전달해 여러 사용자에게 동일한 역할(role)을 부여할 수도 있습니다. 아래 예제처럼, 3개의 Role이 3명 사용자 모두에 연결됩니다:

```php
$roles = Role::factory()->count(3)->create();

$user = User::factory()
    ->count(3)
    ->hasAttached($roles, ['active' => true])
    ->create();
```

<a name="many-to-many-relationships-using-magic-methods"></a>
#### 매직 메서드 활용

매직 팩토리 관계 메서드를 활용하여 다대다(many to many) 관계도 정의할 수 있습니다. 아래 예시에서는 `User` 모델의 `roles` 관계 메서드를 통해 관련 모델이 생성됩니다:

```php
$user = User::factory()
    ->hasRoles(1, [
        'name' => 'Editor'
    ])
    ->create();
```

<a name="polymorphic-relationships"></a>
### 다형성 관계

[다형성 관계](/docs/eloquent-relationships#polymorphic-relationships) 역시 팩토리로 만들 수 있습니다. 다형성 "morph many" 관계는 일반 "has many" 관계와 동일한 방식으로 생성합니다. 예를 들어, `App\Models\Post` 모델이 `App\Models\Comment`와 `morphMany` 관계를 가진다면:

```php
use App\Models\Post;

$post = Post::factory()->hasComments(3)->create();
```

<a name="morph-to-relationships"></a>
#### Morph To 관계

매직 메서드는 `morphTo` 관계 생성에 사용할 수 없습니다. 대신 `for` 메서드를 직접 사용하고, 관계의 이름도 명시적으로 지정해야 합니다. 예를 들어, `Comment` 모델에 `morphTo` 관계를 정의한 `commentable` 메서드가 있다면, 아래와 같이 사용합니다:

```php
$comments = Comment::factory()->count(3)->for(
    Post::factory(), 'commentable'
)->create();
```

<a name="polymorphic-many-to-many-relationships"></a>
#### 다형성 many to many 관계

다형성 "many to many"(`morphToMany`, `morphedByMany`) 관계도 일반 "many to many" 관계와 똑같이 생성할 수 있습니다:

```php
use App\Models\Tag;
use App\Models\Video;

$videos = Video::factory()
    ->hasAttached(
        Tag::factory()->count(3),
        ['public' => true]
    )
    ->create();
```

물론, 매직 `has` 메서드를 사용해 다형성 "many to many" 관계도 만들 수 있습니다:

```php
$videos = Video::factory()
    ->hasTags(3, ['public' => true])
    ->create();
```

<a name="defining-relationships-within-factories"></a>
### 팩토리 내부에서 관계 정의하기

팩토리 안에서 관계를 정의하려면, 보통 관계의 외래키(foreign key)에 새 팩토리 인스턴스를 할당합니다. 이는 "belongsTo" 또는 "morphTo" 같은 역방향(inverse) 관계에서 주로 사용됩니다. 예를 들어, 게시글(Post) 생성 시 사용자를 함께 만들고 싶을 때는 다음과 같이 작성할 수 있습니다:

```php
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

만약 관계 컬럼 값이 팩토리를 정의할 때 동적으로 변해야 한다면, 속성에 클로저를 할당할 수 있습니다. 이 클로저는 팩토리에서 평가된 속성 배열을 인자로 받습니다:

```php
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
### 관계를 위해 기존 모델 재활용하기

여러 모델이 동일한 관계 모델을 공유해야 한다면, `recycle` 메서드를 사용해 팩토리가 생성하는 모든 관계에 같은 모델 인스턴스를 재활용할 수 있습니다.

예를 들어, `Airline`, `Flight`, `Ticket` 모델이 있고, 티켓은 항공사와 항공편에 소속되며, 항공편 또한 항공사에 소속된다고 가정합니다. 티켓을 생성할 때 티켓과 항공편 모두에 같은 항공사를 할당하려면, `recycle` 메서드에 하나의 항공사 인스턴스를 전달하면 됩니다:

```php
Ticket::factory()
    ->recycle(Airline::factory()->create())
    ->create();
```

`recycle` 메서드는 모델이 하나의 공통 사용자(user)나 팀(team)에 소속되는 경우 등 다양한 상황에서 매우 유용합니다.

또한 `recycle` 메서드에는 기존 모델의 컬렉션도 전달할 수 있습니다. 컬렉션을 전달하면 팩토리가 해당 타입의 모델이 필요할 때마다 컬렉션에서 임의의 모델을 선택하게 됩니다:

```php
Ticket::factory()
    ->recycle($airlines)
    ->create();
```
