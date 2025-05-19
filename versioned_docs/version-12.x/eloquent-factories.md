# Eloquent: 팩토리 (Eloquent: Factories)

- [소개](#introduction)
- [모델 팩토리 정의하기](#defining-model-factories)
    - [팩토리 생성하기](#generating-factories)
    - [팩토리 상태(state) 활용](#factory-states)
    - [팩토리 콜백](#factory-callbacks)
- [팩토리를 이용한 모델 생성하기](#creating-models-using-factories)
    - [모델 인스턴스화](#instantiating-models)
    - [모델 영속화(저장)](#persisting-models)
    - [시퀀스(Sequences)](#sequences)
- [팩토리와 연관관계](#factory-relationships)
    - [Has Many 연관관계](#has-many-relationships)
    - [Belongs To 연관관계](#belongs-to-relationships)
    - [Many to Many 연관관계](#many-to-many-relationships)
    - [다형성(polymorphic) 연관관계](#polymorphic-relationships)
    - [팩토리 내에서 연관관계 정의하기](#defining-relationships-within-factories)
    - [기존 모델 재활용하기](#recycling-an-existing-model-for-relationships)

<a name="introduction"></a>
## 소개

애플리케이션을 테스트하거나 데이터베이스를 시딩할 때, 데이터베이스에 여러 레코드를 삽입해야 할 수 있습니다. 이때 각 컬럼의 값을 하나하나 직접 지정하는 대신, 라라벨에서는 각 [Eloquent 모델](/docs/12.x/eloquent)에 대해 모델 팩토리를 통해 기본 속성(attribute) 집합을 정의할 수 있습니다.

팩토리 작성 예시는 애플리케이션의 `database/factories/UserFactory.php` 파일에서 확인할 수 있습니다. 이 팩토리는 새로 생성되는 모든 라라벨 애플리케이션에 포함되어 있으며 다음과 같은 팩토리 정의를 가지고 있습니다.

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

보시다시피, 팩토리는 기본적으로 라라벨의 최상위 팩토리 클래스를 상속받아 `definition` 메서드를 정의하는 클래스입니다. `definition` 메서드는 팩토리를 통해 모델을 생성할 때 적용될 속성의 기본값 집합을 반환합니다.

팩토리에서는 `fake` 헬퍼를 통해 [Faker](https://github.com/FakerPHP/Faker) PHP 라이브러리에 접근할 수 있으므로, 각종 랜덤 데이터를 간편하게 생성하여 테스트나 시드 데이터로 활용할 수 있습니다.

> [!NOTE]
> `config/app.php` 설정 파일의 `faker_locale` 옵션을 수정하면 애플리케이션의 Faker 언어 설정을 변경할 수 있습니다.

<a name="defining-model-factories"></a>
## 모델 팩토리 정의하기

<a name="generating-factories"></a>
### 팩토리 생성하기

팩토리를 만들려면 `make:factory` [Artisan 명령어](/docs/12.x/artisan)를 실행합니다.

```shell
php artisan make:factory PostFactory
```

새 팩토리 클래스는 `database/factories` 디렉터리에 생성됩니다.

<a name="factory-and-model-discovery-conventions"></a>
#### 모델과 팩토리 자동 연결 규칙

팩토리를 정의한 후에는, 모델에 적용된 `Illuminate\Database\Eloquent\Factories\HasFactory` 트레이트가 제공하는 정적 `factory` 메서드를 통해 해당 모델의 팩토리 인스턴스를 생성할 수 있습니다.

`HasFactory` 트레이트의 `factory` 메서드는 자동 규칙(convention)을 사용해 해당 모델의 올바른 팩토리를 찾아 반환합니다. 구체적으로, 이 메서드는 `Database\Factories` 네임스페이스 내에서, 모델명과 동일하며 접미어가 `Factory`인 클래스를 찾습니다. 만약 이러한 규칙이 애플리케이션 구조와 맞지 않는 경우, 모델에서 `newFactory` 메서드를 오버라이드하여 직접 팩토리 인스턴스를 반환하도록 할 수 있습니다.

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

그런 다음, 해당 팩토리에서 `model` 속성을 정의해야 합니다.

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
### 팩토리 상태(state) 활용

상태 변환 메서드를 사용하면 모델 팩토리에 다양한 속성 조합을 쉽게 정의하고, 필요에 따라 자유롭게 적용할 수 있습니다. 예를 들어, `Database\Factories\UserFactory` 팩토리에서 하나의 기본 속성을 수정하는 `suspended` 상태 메서드를 제공할 수 있습니다.

상태 변환 메서드는 주로 라라벨의 기본 팩토리 클래스가 제공하는 `state` 메서드를 호출합니다. `state` 메서드는 팩토리에서 정의된 속성의 배열을 전달받는 클로저를 인수로 받고, 수정할 속성의 배열을 반환해야 합니다.

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

만약 Eloquent 모델이 [소프트 삭제](/docs/12.x/eloquent#soft-deleting)를 지원한다면, 내장된 `trashed` 상태 메서드를 호출해 생성되는 모델의 상태를 이미 "소프트 삭제됨"으로 나타낼 수 있습니다. `trashed` 상태는 팩토리에 자동으로 제공되므로 별도로 정의할 필요가 없습니다.

```php
use App\Models\User;

$user = User::factory()->trashed()->create();
```

<a name="factory-callbacks"></a>
### 팩토리 콜백

팩토리 콜백은 `afterMaking`과 `afterCreating` 메서드를 사용해 등록하며, 모델을 생성(make)하거나 저장(create)한 뒤에 추가 동작을 수행할 수 있게 합니다. 보통 팩토리 클래스에 `configure` 메서드를 정의하여 콜백을 등록하며, 이 메서드는 팩토리 인스턴스화 시 자동 호출됩니다.

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

또한 상태 메서드 내부에서도 팩토리 콜백을 등록하여, 특정 상태에서만 수행할 추가 작업을 지정할 수 있습니다.

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
## 팩토리를 이용한 모델 생성하기

<a name="instantiating-models"></a>
### 모델 인스턴스화

팩토리를 정의한 뒤에는, 모델에 적용된 `Illuminate\Database\Eloquent\Factories\HasFactory` 트레이트가 제공하는 정적 `factory` 메서드를 사용해 팩토리 인스턴스를 생성할 수 있습니다. 실제 모델을 생성하는 몇 가지 예시를 살펴보겠습니다. 먼저, `make` 메서드를 이용해 모델 인스턴스를 데이터베이스에 저장하지 않고 생성할 수 있습니다.

```php
use App\Models\User;

$user = User::factory()->make();
```

`count` 메서드를 사용하면 여러 개의 모델 컬렉션도 만들 수 있습니다.

```php
$users = User::factory()->count(3)->make();
```

<a name="applying-states"></a>
#### 상태(state) 적용하기

정의한 [상태(state)](#factory-states) 메서드를 적용할 수도 있습니다. 여러 상태 변환을 동시에 적용하려면 상태 메서드를 연속으로 호출하면 됩니다.

```php
$users = User::factory()->count(5)->suspended()->make();
```

<a name="overriding-attributes"></a>
#### 속성 덮어쓰기(Overriding)

모델의 기본값 중 일부만 직접 지정하고 싶은 경우, 배열 형태로 값을 `make` 메서드에 넘기면 됩니다. 지정한 속성만 기본값이 대체되고, 나머지는 팩토리에서 정의한 기본값이 사용됩니다.

```php
$user = User::factory()->make([
    'name' => 'Abigail Otwell',
]);
```

또는, 팩토리 인스턴스에서 직접 `state` 메서드를 호출해 인라인 상태 변환도 가능합니다.

```php
$user = User::factory()->state([
    'name' => 'Abigail Otwell',
])->make();
```

> [!NOTE]
> 팩토리를 이용해 모델을 생성할 땐 [대량 할당 보호](/docs/12.x/eloquent#mass-assignment)가 자동으로 비활성화됩니다.

<a name="persisting-models"></a>
### 모델 영속화(저장)

`create` 메서드는 모델 인스턴스를 생성한 후, Eloquent의 `save` 메서드를 사용해 데이터베이스에 저장합니다.

```php
use App\Models\User;

// App\Models\User 인스턴스 한 개를 생성하고 저장
$user = User::factory()->create();

// App\Models\User 인스턴스 세 개 생성, 저장
$users = User::factory()->count(3)->create();
```

`create` 메서드에도 배열로 속성을 넘겨 팩토리의 기본 속성 값을 덮어쓸 수 있습니다.

```php
$user = User::factory()->create([
    'name' => 'Abigail',
]);
```

<a name="sequences"></a>
### 시퀀스(Sequences)

여러 개의 모델을 생성할 때, 특정 속성의 값을 번갈아가며 설정하고 싶을 때가 있습니다. 이때 상태 변환을 시퀀스로 정의할 수 있습니다. 예를 들어, 사용자마다 `admin` 컬럼 값을 번갈아 `Y`와 `N`으로 지정하고 싶다면 다음처럼 할 수 있습니다.

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

위 예시에서, 10명의 사용자 중 5명은 `admin` 값이 `Y`, 나머지 5명은 `N`이 됩니다.

필요하다면 시퀀스 값으로 클로저(익명 함수)를 사용할 수 있는데, 시퀀스가 새 값을 필요로 할 때마다 클로저가 호출됩니다.

```php
use Illuminate\Database\Eloquent\Factories\Sequence;

$users = User::factory()
    ->count(10)
    ->state(new Sequence(
        fn (Sequence $sequence) => ['role' => UserRoles::all()->random()],
    ))
    ->create();
```

시퀀스 클로저에서는 시퀀스 인스턴스에 주입되는 `$index`(지금까지 순환한 횟수) 및 `$count`(총 반복 횟수) 속성을 활용할 수 있습니다.

```php
$users = User::factory()
    ->count(10)
    ->sequence(fn (Sequence $sequence) => ['name' => 'Name '.$sequence->index])
    ->create();
```

또한, 편의상 `sequence` 메서드를 사용해 시퀀스를 적용할 수도 있습니다. 이 메서드는 내부적으로 `state` 메서드를 호출하며, 클로저 또는 속성 배열을 인수로 받을 수 있습니다.

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
## 팩토리와 연관관계

<a name="has-many-relationships"></a>
### Has Many 연관관계

라라벨의 플루언트한 팩토리 메서드를 사용해 Eloquent 모델간 연관관계도 쉽게 만들 수 있습니다. 예를 들어, 애플리케이션에 `App\Models\User` 모델과 `App\Models\Post` 모델이 있고, `User` 모델이 `Post`와 1:N(Has Many) 연관관계를 정의한다고 가정해봅시다. 라라벨 팩토리의 `has` 메서드를 이용해 3개의 포스트를 가진 사용자를 생성할 수 있습니다. `has` 메서드는 팩토리 인스턴스를 인수로 받습니다.

```php
use App\Models\Post;
use App\Models\User;

$user = User::factory()
    ->has(Post::factory()->count(3))
    ->create();
```

일반적으로 `has` 메서드에 `Post` 모델을 넘기면 라라벨은 `User` 모델에 `posts` 메서드가 있어야 한다고 간주하고 이를 통해 연관관계를 설정합니다. 만약 다른 이름의 연관관계를 조작하고 싶다면 두 번째 인수로 관계명을 지정할 수 있습니다.

```php
$user = User::factory()
    ->has(Post::factory()->count(3), 'posts')
    ->create();
```

당연히, 연관된 모델에도 상태 변환을 적용할 수 있습니다. 또한 상태 변환 시 parent 모델에 접근해야 하는 경우, 클로저 기반의 상태 변환을 쓸 수도 있습니다.

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

더 편리하게, 라라벨의 팩토리 매직 연관관계 메서드를 사용할 수 있습니다. 아래 예시는 관례에 따라 `User` 모델의 `posts` 연관관계 메서드를 이용해 관련 모델을 생성합니다.

```php
$user = User::factory()
    ->hasPosts(3)
    ->create();
```

매직 메서드로 연관 모델을 생성할 때, 두 번째 인자로 연관 모델의 속성값 배열을 지정해 덮어쓸 수도 있습니다.

```php
$user = User::factory()
    ->hasPosts(3, [
        'published' => false,
    ])
    ->create();
```

연관 모델의 상태 변환에서 부모 모델에 접근이 필요한 경우, 클로저 기반으로도 처리할 수 있습니다.

```php
$user = User::factory()
    ->hasPosts(3, function (array $attributes, User $user) {
        return ['user_type' => $user->type];
    })
    ->create();
```

<a name="belongs-to-relationships"></a>
### Belongs To 연관관계

"has many" 연관관계를 팩토리로 만드는 방법을 살펴봤으니, 이제 반대쪽인 "Belongs To" 연관관계를 만드는 방법을 알아보겠습니다. `for` 메서드를 사용하면 팩토리로 생성되는 모델이 소속될 부모 모델을 지정할 수 있습니다. 예를 들어, 한 사용자가 소유한 세 개의 `App\Models\Post` 모델을 만들어보겠습니다.

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

이미 부모 모델 인스턴스가 준비되어 있다면, 해당 인스턴스를 `for` 메서드에 넘기면 됩니다.

```php
$user = User::factory()->create();

$posts = Post::factory()
    ->count(3)
    ->for($user)
    ->create();
```

<a name="belongs-to-relationships-using-magic-methods"></a>
#### 매직 메서드 활용

Belongs To 연관관계도 라라벨 팩토리의 매직 메서드를 통해 더 간편하게 정의할 수 있습니다. 아래 예시는 관례에 따라 세 개의 포스트가 `Post` 모델의 `user` 연관관계에 소속되게 만듭니다.

```php
$posts = Post::factory()
    ->count(3)
    ->forUser([
        'name' => 'Jessica Archer',
    ])
    ->create();
```

<a name="many-to-many-relationships"></a>
### Many to Many 연관관계

[Has many 연관관계](#has-many-relationships)와 마찬가지로, N:N(Many to Many) 연관관계 역시 `has` 메서드를 통해 생성할 수 있습니다.

```php
use App\Models\Role;
use App\Models\User;

$user = User::factory()
    ->has(Role::factory()->count(3))
    ->create();
```

<a name="pivot-table-attributes"></a>
#### Pivot 테이블 속성

모델을 연결하는 pivot(중간) 테이블의 속성을 설정해야 할 경우, `hasAttached` 메서드를 사용하면 됩니다. 이 메서드의 두 번째 인수로 pivot 테이블에 설정할 속성의 이름과 값을 배열로 전달할 수 있습니다.

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

또한, 관계된 모델에 따라 상태 변환이 필요하다면 클로저 기반의 상태 변환도 가능합니다.

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

이미 생성된 모델 인스턴스를 새로 만들 모델에 연결하고자 할 때는, 해당 모델 인스턴스들을 `hasAttached`에 넘길 수 있습니다. 아래 예시에서는 동일한 세 개의 역할(role)이 세 사용자의 모델에 모두 연결됩니다.

```php
$roles = Role::factory()->count(3)->create();

$user = User::factory()
    ->count(3)
    ->hasAttached($roles, ['active' => true])
    ->create();
```

<a name="many-to-many-relationships-using-magic-methods"></a>
#### 매직 메서드 활용

Many to Many 연관관계도 매직 팩토리 메서드를 통해 간결하게 정의할 수 있습니다. 아래 예시는 관례에 따라 `User` 모델의 `roles` 연관관계 메서드를 통해 관련 모델을 생성합니다.

```php
$user = User::factory()
    ->hasRoles(1, [
        'name' => 'Editor'
    ])
    ->create();
```

<a name="polymorphic-relationships"></a>
### 다형성(polymorphic) 연관관계

[다형성(polymorphic) 연관관계](/docs/12.x/eloquent-relationships#polymorphic-relationships) 또한 팩토리를 사용해 만들 수 있습니다. 다형성 morph many 연관관계는 일반 has many와 같은 방식으로 생성합니다. 예를 들어 `App\Models\Post` 모델이 `App\Models\Comment` 모델과 morphMany 연관관계를 가진 경우 다음과 같이 작성할 수 있습니다.

```php
use App\Models\Post;

$post = Post::factory()->hasComments(3)->create();
```

<a name="morph-to-relationships"></a>
#### Morph To 연관관계

`morphTo` 연관관계를 생성할 때는 매직 메서드를 사용할 수 없습니다. 대신, `for` 메서드를 직접 사용해야 하며 관계 이름을 명시적으로 지정해야 합니다. 예를 들어, `Comment` 모델에 `morphTo` 관계인 `commentable` 메서드가 있다면, 아래처럼 `for` 메서드를 활용해 특정 포스트를 부모로 하는 댓글 3개를 만들 수 있습니다.

```php
$comments = Comment::factory()->count(3)->for(
    Post::factory(), 'commentable'
)->create();
```

<a name="polymorphic-many-to-many-relationships"></a>
#### 다형성 Many to Many 연관관계

다형성(MorphToMany / MorphedByMany) N:N 연관관계는 일반 N:N 연관관계와 동일하게 정의할 수 있습니다.

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

물론, 매직 `has` 메서드를 활용해 다형성 N:N 관계도 생성 가능합니다.

```php
$videos = Video::factory()
    ->hasTags(3, ['public' => true])
    ->create();
```

<a name="defining-relationships-within-factories"></a>
### 팩토리 내에서 연관관계 정의하기

팩토리 내부에서 연관관계를 정의하려면, 보통 외래키(foreign key) 위치에 새 팩토리 인스턴스를 할당합니다. 이는 주로 `belongsTo`, `morphTo`와 같은 "반대쪽" 연관관계에 쓰이는 방법입니다. 예를 들어, 포스트를 생성할 때 새로운 사용자를 함께 생성하려면 다음과 같이 작성할 수 있습니다.

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

관계된 컬럼 값이 팩토리에서 동적으로 결정되어야 한다면, 클로저를 할당하여 팩토리의 평가된 속성 배열을 받아 사용할 수 있습니다.

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
### 기존 모델 재활용하기

여러 모델이 동일한 연관관계를 가질 때, `recycle` 메서드를 사용하면 팩토리에서 생성하는 모든 관계에 대해 같은 연관 모델 인스턴스를 재활용할 수 있습니다.

예를 들어, `Airline`, `Flight`, `Ticket` 모델이 있고, 티켓은 항공사와 비행편에 속하며, 비행편도 항공사에 속한다고 가정해봅시다. 티켓을 생성할 때 티켓과 비행편 모두 동일한 항공사에 속하게 하고 싶다면, `recycle` 메서드에 항공사 인스턴스를 넘길 수 있습니다.

```php
Ticket::factory()
    ->recycle(Airline::factory()->create())
    ->create();
```

특히 여러 모델이 같은 사용자나 팀에 소속되어야 할 때 `recycle` 메서드가 매우 유용할 수 있습니다.

`recycle` 메서드는 기존 모델의 컬렉션도 받을 수 있습니다. 이 경우 팩토리에서 해당 유형의 모델이 필요할 때마다 컬렉션 중 무작위 항목이 선택됩니다.

```php
Ticket::factory()
    ->recycle($airlines)
    ->create();
```
