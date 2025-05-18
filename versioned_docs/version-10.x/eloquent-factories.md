# Eloquent: 팩토리 (Eloquent: Factories)

- [소개](#introduction)
- [모델 팩토리 정의하기](#defining-model-factories)
    - [팩토리 생성하기](#generating-factories)
    - [팩토리 상태(state) 사용하기](#factory-states)
    - [팩토리 콜백(callbacks)](#factory-callbacks)
- [팩토리를 사용한 모델 생성](#creating-models-using-factories)
    - [모델 인스턴스화하기](#instantiating-models)
    - [모델 저장하기](#persisting-models)
    - [시퀀스(Sequences)](#sequences)
- [팩토리의 연관관계 다루기](#factory-relationships)
    - [Has Many 연관관계 정의](#has-many-relationships)
    - [Belongs To 연관관계 정의](#belongs-to-relationships)
    - [Many to Many 연관관계 정의](#many-to-many-relationships)
    - [폴리모픽 연관관계(Polymorphic Relationships)](#polymorphic-relationships)
    - [팩토리에서 연관관계 정의하기](#defining-relationships-within-factories)
    - [관계에서 기존 모델 재활용하기](#recycling-an-existing-model-for-relationships)

<a name="introduction"></a>
## 소개

애플리케이션을 테스트하거나 데이터베이스를 시딩할 때, 데이터베이스에 몇 개의 레코드를 삽입해야 할 수 있습니다. 각 컬럼의 값을 일일이 지정하는 대신, 라라벨에서는 각 [Eloquent 모델](/docs/10.x/eloquent)에 대해 모델 팩토리를 정의하여 기본 속성 값을 지정할 수 있습니다.

팩토리 작성 예를 보고 싶다면, 애플리케이션의 `database/factories/UserFactory.php` 파일을 확인해 보시기 바랍니다. 이 팩토리는 모든 새로운 라라벨 프로젝트에 포함되어 있으며 아래와 같은 정의를 가지고 있습니다:

```
namespace Database\Factories;

use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Factories\Factory;

class UserFactory extends Factory
{
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
            'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
            'remember_token' => Str::random(10),
        ];
    }
}
```

보시다시피, 팩토리는 기본적으로 라라벨의 팩토리 기본 클래스를 상속받아 `definition` 메서드를 정의하는 클래스입니다. `definition` 메서드는 팩토리로 모델을 생성할 때 적용할 기본 속성 값을 반환합니다.

팩토리에서는 `fake` 헬퍼를 통해 [Faker](https://github.com/FakerPHP/Faker) PHP 라이브러리를 사용할 수 있습니다. 이를 통해 테스트 및 데이터 시딩을 위해 여러 종류의 임의 데이터를 생성할 수 있습니다.

> [!NOTE]
> 애플리케이션의 Faker 로케일(locale)은 `config/app.php` 설정 파일에 `faker_locale` 옵션을 추가하여 설정할 수 있습니다.

<a name="defining-model-factories"></a>
## 모델 팩토리 정의하기

<a name="generating-factories"></a>
### 팩토리 생성하기

팩토리를 생성하려면, `make:factory` [Artisan 명령어](/docs/10.x/artisan)를 실행합니다:

```shell
php artisan make:factory PostFactory
```

새로 생성된 팩토리 클래스는 `database/factories` 디렉터리에 생성됩니다.

<a name="factory-and-model-discovery-conventions"></a>
#### 모델과 팩토리의 관례

팩토리를 정의한 후에는, 모델에 `Illuminate\Database\Eloquent\Factories\HasFactory` 트레이트를 적용하면 제공되는 정적 `factory` 메서드를 사용하여 해당 모델의 팩토리 인스턴스를 생성할 수 있습니다.

`HasFactory` 트레이트의 `factory` 메서드는 관례를 기반으로, 할당된 모델에 대한 적절한 팩토리를 찾습니다. 구체적으로 이 메서드는 `Database\Factories` 네임스페이스 아래에서 모델명과 동일하면서 `Factory`로 끝나는 클래스를 찾습니다. 만약 이러한 관례가 애플리케이션에 맞지 않으면, 모델에서 `newFactory` 메서드를 직접 오버라이드(재정의)하여 해당 모델에 대한 팩토리 인스턴스를 직접 반환할 수 있습니다:

```
use Illuminate\Database\Eloquent\Factories\Factory;
use Database\Factories\Administration\FlightFactory;

/**
 * Create a new factory instance for the model.
 */
protected static function newFactory(): Factory
{
    return FlightFactory::new();
}
```

그리고, 해당 팩토리에서 `model` 속성을 명시적으로 지정해줍니다:

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
### 팩토리 상태(state) 사용하기

상태(state) 조작 메서드를 사용하면 하나의 모델 팩토리에 대해 다양한 변경점을 조합해서 적용할 수 있습니다. 예를 들어, `Database\Factories\UserFactory` 팩토리에 기본 속성 중 하나를 변경하는 `suspended` 상태 메서드를 정의할 수 있습니다.

상태 변환 메서드는 일반적으로 라라벨의 팩토리 기본 클래스에서 제공하는 `state` 메서드를 호출합니다. `state` 메서드는 팩토리에 정의된 속성 배열을 입력으로 받는 클로저(익명 함수)를 인자로 받고, 수정할 속성을 포함한 배열을 반환해야 합니다:

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

만약 Eloquent 모델이 [소프트 삭제](/docs/10.x/eloquent#soft-deleting)를 지원한다면, 내장된 `trashed` 상태 메서드를 호출하여 생성된 모델이 소프트 삭제된 상태가 되도록 할 수 있습니다. 별도로 `trashed` 상태를 정의하지 않아도 모든 팩토리에서 자동으로 사용할 수 있습니다:

```
use App\Models\User;

$user = User::factory()->trashed()->create();
```

<a name="factory-callbacks"></a>
### 팩토리 콜백(callbacks)

팩토리 콜백은 `afterMaking`과 `afterCreating` 메서드를 사용해 등록하며, 모델을 만들거나 생성한 후에 추가적인 작업을 수행할 수 있도록 도와줍니다. 이러한 콜백은 팩토리 클래스에서 `configure` 메서드를 정의하여 등록하며, 팩토리가 인스턴스화될 때 라라벨이 자동으로 호출합니다:

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

또한, 개별 상태(state) 메서드에서도 팩토리 콜백을 등록할 수 있습니다. 이를 사용하면 특정 상태에서만 필요한 추가 작업을 수행할 수 있습니다:

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
### 모델 인스턴스화하기

팩토리를 정의했다면, `Illuminate\Database\Eloquent\Factories\HasFactory` 트레이트를 추가한 모델의 정적 `factory` 메서드를 사용하여 팩토리 인스턴스를 생성할 수 있습니다. 몇 가지 예시를 살펴보겠습니다. 먼저, `make` 메서드로 데이터베이스에 저장하지 않고 모델 인스턴스만 생성해보겠습니다:

```
use App\Models\User;

$user = User::factory()->make();
```

`count` 메서드를 이용하면 여러 개의 모델 컬렉션을 생성할 수 있습니다:

```
$users = User::factory()->count(3)->make();
```

<a name="applying-states"></a>
#### 상태(state) 적용하기

정의한 [상태](#factory-states)를 모델에 적용할 수도 있습니다. 여러 상태 변환을 동시에 적용하고 싶다면, 원하는 상태 변환 메서드를 연이어 호출하면 됩니다:

```
$users = User::factory()->count(5)->suspended()->make();
```

<a name="overriding-attributes"></a>
#### 속성 덮어쓰기

모델의 기본 값을 일부만 직접 지정하고 싶다면, `make` 메서드에 배열로 값을 지정해주면 됩니다. 지정한 속성만 새 값으로 덮어쓰고, 나머지는 팩토리에서 지정한 기본 값이 유지됩니다:

```
$user = User::factory()->make([
    'name' => 'Abigail Otwell',
]);
```

또는, 팩토리 인스턴스에서 직접 `state` 메서드를 호출하여 인라인 상태 변환을 수행할 수도 있습니다:

```
$user = User::factory()->state([
    'name' => 'Abigail Otwell',
])->make();
```

> [!NOTE]
> 팩토리를 통해 모델을 생성할 때는 [대량 할당 보호](/docs/10.x/eloquent#mass-assignment)가 자동으로 비활성화됩니다.

<a name="persisting-models"></a>
### 모델 저장하기

`create` 메서드를 사용하면, 모델 인스턴스를 생성하고 Eloquent의 `save` 메서드로 데이터베이스에 저장합니다:

```
use App\Models\User;

// 단일 App\Models\User 인스턴스 생성...
$user = User::factory()->create();

// 세 개의 App\Models\User 인스턴스 생성...
$users = User::factory()->count(3)->create();
```

`create` 메서드에도 속성 배열을 넘겨주어 팩토리의 기본 속성 값을 덮어쓸 수 있습니다:

```
$user = User::factory()->create([
    'name' => 'Abigail',
]);
```

<a name="sequences"></a>
### 시퀀스(Sequences)

여러 모델을 생성할 때 특정 속성 값을 반복적으로 교차 변경하고 싶을 때는, 상태 변환을 시퀀스(Sequence)로 정의할 수 있습니다. 예를 들어, 사용자 각각의 `admin` 컬럼 값을 `Y`와 `N`으로 번갈아 설정하고 싶다면 다음과 같이 작성할 수 있습니다:

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

위 예제에서는 5명의 사용자는 `admin` 값이 `Y`, 나머지 5명은 `N`으로 설정됩니다.

필요하다면 시퀀스 값으로 클로저(익명 함수)를 사용할 수도 있습니다. 시퀀스를 사용할 때마다 클로저가 실행되어 새로운 값을 반환합니다:

```
use Illuminate\Database\Eloquent\Factories\Sequence;

$users = User::factory()
                ->count(10)
                ->state(new Sequence(
                    fn (Sequence $sequence) => ['role' => UserRoles::all()->random()],
                ))
                ->create();
```

시퀀스 클로저 내부에서는 `$sequence` 인스턴스의 `$index` 또는 `$count` 속성에 접근할 수 있습니다. `$index`는 지금까지 시퀀스가 몇 번째 순환인지, `$count`는 시퀀스가 전체 몇 번 실행될 것인지를 나타냅니다:

```
$users = User::factory()
                ->count(10)
                ->sequence(fn (Sequence $sequence) => ['name' => 'Name '.$sequence->index])
                ->create();
```

편의상 `sequence` 메서드를 사용해도 동일한 효과를 낼 수 있습니다. `sequence` 메서드는 내부적으로 `state`를 호출하며, 클로저 또는 속성 배열들을 인자로 받습니다:

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
## 팩토리의 연관관계 다루기

<a name="has-many-relationships"></a>
### Has Many 연관관계 정의

이제 라라벨의 fluet한 팩토리 메서드를 사용해서 Eloquent 모델 간의 연관관계를 어떻게 구성할 수 있는지 알아보겠습니다. 먼저, `App\Models\User` 모델과 `App\Models\Post` 모델을 간단히 가정하겠습니다. 그리고 `User` 모델이 `Post`와 `hasMany` 연관관계를 가진다고 하면, 아래와 같이 `has` 메서드로 게시글 3개를 가진 사용자를 생성할 수 있습니다. `has` 메서드에는 팩토리 인스턴스를 전달합니다:

```
use App\Models\Post;
use App\Models\User;

$user = User::factory()
            ->has(Post::factory()->count(3))
            ->create();
```

관례상, `has` 메서드에 `Post` 모델을 전달하면 라라벨은 `User` 모델이 `posts` 메서드를 통해 해당 연관관계를 정의한 것으로 간주합니다. 필요하다면 조작할 연관관계 메서드명을 명시적으로 지정할 수도 있습니다:

```
$user = User::factory()
            ->has(Post::factory()->count(3), 'posts')
            ->create();
```

물론, 연관된 모델에도 상태(state) 변환을 적용할 수 있습니다. 또한, 만약 연관된 모델의 상태 변경 시 상위(부모) 모델에 접근해야 한다면, 클로저 기반 상태 변환도 사용할 수 있습니다:

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
#### 매직 메서드 사용하기

편의상, 라라벨이 제공하는 연관관계용 매직 팩토리 메서드를 이용해 관계를 생성할 수도 있습니다. 아래와 같은 예시는 `posts` 연관관계 메서드를 관례에 따라 자동으로 사용합니다:

```
$user = User::factory()
            ->hasPosts(3)
            ->create();
```

매직 메서드를 사용할 때, 관련 모델의 속성을 배열로 덮어쓸 수도 있습니다:

```
$user = User::factory()
            ->hasPosts(3, [
                'published' => false,
            ])
            ->create();
```

상태 변환에서 부모 모델에 접근이 필요한 경우, 클로저로 두 번째 인자를 전달할 수도 있습니다:

```
$user = User::factory()
            ->hasPosts(3, function (array $attributes, User $user) {
                return ['user_type' => $user->type];
            })
            ->create();
```

<a name="belongs-to-relationships"></a>
### Belongs To 연관관계 정의

"has many" 연관관계를 다루는 방법을 살펴봤다면, 이제 그 반대인 "belongs to" 관계도 정의해보겠습니다. `for` 메서드를 사용하면 팩토리로 생성된 모델이 소속될 부모 모델을 지정할 수 있습니다. 예를 들어, 하나의 사용자에게 속한 3개의 `App\Models\Post` 모델 인스턴스를 만들 수 있습니다:

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

이미 부모 모델 인스턴스를 가지고 있다면, 해당 인스턴스를 직접 `for` 메서드에 전달해도 됩니다:

```
$user = User::factory()->create();

$posts = Post::factory()
            ->count(3)
            ->for($user)
            ->create();
```

<a name="belongs-to-relationships-using-magic-methods"></a>
#### 매직 메서드 사용하기

편리하게도 매직 메서드를 사용해서 "belongs to" 관계도 정의할 수 있습니다. 아래 예시에서는 `user` 관계명을 자동으로 적용해 3개의 게시글이 동일한 사용자를 참조하도록 합니다:

```
$posts = Post::factory()
            ->count(3)
            ->forUser([
                'name' => 'Jessica Archer',
            ])
            ->create();
```

<a name="many-to-many-relationships"></a>
### Many to Many 연관관계 정의

[Has many 연관관계](#has-many-relationships)와 마찬가지로, "many to many" 관계도 `has` 메서드를 사용해서 생성할 수 있습니다:

```
use App\Models\Role;
use App\Models\User;

$user = User::factory()
            ->has(Role::factory()->count(3))
            ->create();
```

<a name="pivot-table-attributes"></a>
#### Pivot 테이블 속성 지정

연결(pivot) 테이블에 값이 기록되어야 한다면, `hasAttached` 메서드를 사용할 수 있습니다. 이 메서드는 두 번째 인자로 피벗(pivot) 테이블에 저장할 속성 배열을 받습니다:

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

관련 모델에 접근해서 클로저 기반 상태 변환을 적용하고 싶을 때도 사용할 수 있습니다:

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

이미 생성된 모델 인스턴스를 연결하고 싶다면, `hasAttached`에 모델 인스턴스를 그대로 넘기면 됩니다. 아래 예시에서는 동일한 3개의 역할(role)이 3명의 사용자 모두와 연결됩니다:

```
$roles = Role::factory()->count(3)->create();

$user = User::factory()
            ->count(3)
            ->hasAttached($roles, ['active' => true])
            ->create();
```

<a name="many-to-many-relationships-using-magic-methods"></a>
#### 매직 메서드 사용하기

매직 팩토리 메서드를 사용해 many to many 관계도 쉽게 정의할 수 있습니다. 아래 예시에서는 관례상 `roles` 연관관계 메서드를 자동으로 사용합니다:

```
$user = User::factory()
            ->hasRoles(1, [
                'name' => 'Editor'
            ])
            ->create();
```

<a name="polymorphic-relationships"></a>
### 폴리모픽 연관관계(Polymorphic Relationships)

[폴리모픽 연관관계](/docs/10.x/eloquent-relationships#polymorphic-relationships) 역시 팩토리로 손쉽게 생성할 수 있습니다. 폴리모픽 "morph many" 관계는 일반적인 "has many"와 같은 방식으로 구현하면 됩니다. 예를 들어, `App\Models\Post` 모델이 `App\Models\Comment`와 morphMany 관계를 가지면:

```
use App\Models\Post;

$post = Post::factory()->hasComments(3)->create();
```

<a name="morph-to-relationships"></a>
#### Morph To 관계

매직 메서드는 `morphTo` 연관관계 생성에는 사용할 수 없습니다. 이 경우에는 `for` 메서드를 명시적으로 사용하고, 관계명을 직접 지정해야 합니다. 예를 들어, `Comment` 모델에 `commentable`이라는 morphTo 관계가 있다면, 아래와 같이 3개의 댓글을 하나의 게시글에 연결할 수 있습니다:

```
$comments = Comment::factory()->count(3)->for(
    Post::factory(), 'commentable'
)->create();
```

<a name="polymorphic-many-to-many-relationships"></a>
#### 폴리모픽 Many to Many 연관관계

폴리모픽 "many to many"(`morphToMany` / `morphedByMany`) 관계도 일반 many to many와 동일하게 생성할 수 있습니다:

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

물론, 매직 `has` 메서드로도 폴리모픽 "many to many" 관계를 생성할 수 있습니다:

```
$videos = Video::factory()
            ->hasTags(3, ['public' => true])
            ->create();
```

<a name="defining-relationships-within-factories"></a>
### 팩토리 내부에서 연관관계 정의하기

모델 팩토리 내에서 연관관계를 정의할 때는 보통 해당 관계의 외래키(foreign key) 필드에 새로운 팩토리 인스턴스를 할당합니다. 이는 `belongsTo`나 `morphTo`와 같은 "역관계(inverse relationship)"에 주로 사용됩니다. 예를 들어, 게시글을 생성할 때 새로운 사용자를 함께 생성하려면 다음과 같이 작성할 수 있습니다:

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

관계 컬럼 값이 팩토리에서 평가된 속성 배열에 따라 달라져야 한다면, 해당 속성에 클로저를 할당하면 됩니다. 이 때 클로저는 팩토리에서 평가된 속성 배열을 인자로 받습니다:

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
### 관계에서 기존 모델 재활용하기

두 개 이상의 모델이 동일한 연관 모델을 공유해야 할 때는 `recycle` 메서드를 사용해, 팩토리가 관계를 생성할 때 항상 동일한 인스턴스를 재사용하도록 할 수 있습니다.

예를 들어, `Airline`, `Flight`, `Ticket` 모델이 있고, 각 티켓과 플라이트가 같은 항공사를 참조해야 하는 경우, 항공사 인스턴스를 `recycle` 메서드에 전달하면 됩니다:

```
Ticket::factory()
    ->recycle(Airline::factory()->create())
    ->create();
```

특정 사용자의 모든 모델, 또는 특정 팀의 모델처럼 공통의 관계 인스턴스를 사용하는 경우 특히 유용합니다.

`recycle` 메서드는 기존 모델의 컬렉션도 받을 수 있습니다. 이 경우 컬렉션에서 무작위로 하나의 모델이 선택되어 팩토리에서 해당 타입의 모델이 필요할 때 사용됩니다:

```
Ticket::factory()
    ->recycle($airlines)
    ->create();
```
