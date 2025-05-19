# 데이터베이스 테스트 (Database Testing)

- [소개](#introduction)
    - [각 테스트 후 데이터베이스 초기화](#resetting-the-database-after-each-test)
- [모델 팩토리 정의](#defining-model-factories)
    - [개념 개요](#concept-overview)
    - [팩토리 생성](#generating-factories)
    - [팩토리 상태(State)](#factory-states)
    - [팩토리 콜백](#factory-callbacks)
- [팩토리를 이용한 모델 생성](#creating-models-using-factories)
    - [모델 인스턴스화](#instantiating-models)
    - [모델 저장](#persisting-models)
    - [시퀀스(Sequences)](#sequences)
- [팩토리와 관계 정의](#factory-relationships)
    - [Has Many(1:N) 관계](#has-many-relationships)
    - [Belongs To(소속) 관계](#belongs-to-relationships)
    - [Many To Many(N:M) 관계](#many-to-many-relationships)
    - [폴리모픽(Polymorphic) 관계](#polymorphic-relationships)
    - [팩토리에서 관계 정의하기](#defining-relationships-within-factories)
- [시더(Seeder) 실행하기](#running-seeders)
- [사용 가능한 Assertion](#available-assertions)

<a name="introduction"></a>
## 소개

라라벨은 데이터베이스 기반 애플리케이션을 테스트하기 위한 다양한 유용한 도구와 assertion을 제공합니다. 또한, Eloquent 모델 팩토리와 시더(Seeder)를 사용하면 애플리케이션의 Eloquent 모델과 그 연관관계를 활용해 테스트용 데이터베이스 레코드를 손쉽게 생성할 수 있습니다. 이 문서에서는 이러한 강력한 기능들을 모두 다룹니다.

<a name="resetting-the-database-after-each-test"></a>
### 각 테스트 후 데이터베이스 초기화

본격적으로 살펴보기 전에, 각 테스트 실행 후 데이터베이스를 초기화해 이전 테스트의 데이터가 다음 테스트에 영향을 주지 않도록 하는 방법부터 알아보겠습니다. 라라벨은 `Illuminate\Foundation\Testing\RefreshDatabase` 트레잇을 제공하며, 이 트레잇을 테스트 클래스에 추가하면 알아서 데이터베이스 초기화를 처리해줍니다. 다음과 같이 테스트 클래스에 트레잇을 사용하면 됩니다.

```
<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    /**
     * A basic functional test example.
     *
     * @return void
     */
    public function test_basic_example()
    {
        $response = $this->get('/');

        // ...
    }
}
```

<a name="defining-model-factories"></a>
## 모델 팩토리 정의

<a name="concept-overview"></a>
### 개념 개요

먼저, Eloquent 모델 팩토리에 대해 알아보겠습니다. 테스트를 작성할 때, 데이터를 직접 일일이 컬럼 값으로 지정하지 않고 데이터베이스에 여러 레코드를 삽입해야 하는 경우가 자주 있습니다. 이때 라라벨의 모델 팩토리를 이용하면 각 [Eloquent 모델](/docs/8.x/eloquent)별로 기본 속성(attribute) 세트를 정의해놓고 필요할 때마다 간편하게 테스트 데이터를 생성할 수 있습니다.

팩토리 예시를 보려면 애플리케이션의 `database/factories/UserFactory.php` 파일을 확인해 보십시오. 이 팩토리는 모든 신규 라라벨 프로젝트에 기본 포함되어 있으며, 아래와 같은 팩토리 정의를 가지고 있습니다.

```
namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
            'remember_token' => Str::random(10),
        ];
    }
}
```

보시다시피, 팩토리는 기본적으로 라라벨의 베이스 팩토리 클래스를 상속하며 `definition` 메서드를 정의합니다. 이 `definition` 메서드는 팩토리를 통해 모델을 생성할 때 적용할 기본 속성값 배열을 리턴합니다.

팩토리의 `faker` 프로퍼티를 통해 [Faker](https://github.com/FakerPHP/Faker) PHP 라이브러리에 접근할 수 있기 때문에, 테스트에 활용할 다양한 무작위 데이터를 쉽게 생성할 수 있습니다.

> [!TIP]
> 애플리케이션의 Faker 언어(locale)를 변경하려면 `config/app.php` 설정 파일에 `faker_locale` 옵션을 추가하면 됩니다.

<a name="generating-factories"></a>
### 팩토리 생성

새로운 팩토리를 생성하려면, `make:factory` [Artisan 명령어](/docs/8.x/artisan)를 실행합니다.

```
php artisan make:factory PostFactory
```

이 명령어를 실행하면, 새로 만들어진 팩토리 클래스가 `database/factories` 디렉터리에 생성됩니다.

<a name="factory-and-model-discovery-conventions"></a>
#### 모델 & 팩토리 탐색 규칙

팩토리를 정의했다면, 이제 모델에 포함된 `Illuminate\Database\Eloquent\Factories\HasFactory` 트레잇이 제공하는 `factory` 정적 메서드를 통해 팩토리 인스턴스를 생성할 수 있습니다.

이때 `HasFactory` 트레잇의 `factory` 메서드는 이름 규칙(convention)에 따라 해당 모델을 위한 올바른 팩토리를 자동으로 찾아 사용합니다. 구체적으로, `Database\Factories` 네임스페이스 내에 모델명과 동일하고 `Factory`라는 접미사가 붙은 클래스를 찾습니다. 만약 이 규칙을 따를 수 없는 상황이거나 별도의 팩토리를 지정하고 싶을 때는, 모델 클래스에서 `newFactory` 메서드를 오버라이드해 직접 원하는 팩토리 인스턴스를 반환하면 됩니다.

```
use Database\Factories\Administration\FlightFactory;

/**
 * Create a new factory instance for the model.
 *
 * @return \Illuminate\Database\Eloquent\Factories\Factory
 */
protected static function newFactory()
{
    return FlightFactory::new();
}
```

그리고 해당 팩토리 클래스에는 `model` 프로퍼티를 명시해줍니다:

```
use App\Administration\Flight;
use Illuminate\Database\Eloquent\Factories\Factory;

class FlightFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Flight::class;
}
```

<a name="factory-states"></a>
### 팩토리 상태(State)

상태(state) 조작 메서드를 활용하면, 모델 팩토리에 다양한 속성 변형을 별도로 정의해 두고 자유롭게 조합해서 적용할 수 있습니다. 예를 들어, `Database\Factories\UserFactory`에서 사용자의 기본 속성을 변경하는 `suspended` 상태(state) 메서드를 아래와 같이 만들 수 있습니다.

상태 변환 메서드는 보통 라라벨의 베이스 팩토리 클래스에서 제공하는 `state` 메서드를 호출하여 작성합니다. `state` 메서드는 팩토리 기본 속성 배열을 인자로 받아, 변경할 속성값을 배열로 리턴하는 클로저를 인자로 전달받습니다.

```
/**
 * Indicate that the user is suspended.
 *
 * @return \Illuminate\Database\Eloquent\Factories\Factory
 */
public function suspended()
{
    return $this->state(function (array $attributes) {
        return [
            'account_status' => 'suspended',
        ];
    });
}
```

<a name="factory-callbacks"></a>
### 팩토리 콜백

팩토리 콜백은 `afterMaking`, `afterCreating` 메서드를 활용해 등록할 수 있으며, 모델을 생성(메모리상 만들기)하거나 실제로 저장(데이터베이스에 생성)한 후 추가 작업을 지정할 수 있습니다. 팩토리 클래스에서 `configure` 메서드를 정의해 콜백을 등록해 주세요. 이 메서드는 팩토리 인스턴스화 시 자동으로 호출됩니다.

```
namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    /**
     * Configure the model factory.
     *
     * @return $this
     */
    public function configure()
    {
        return $this->afterMaking(function (User $user) {
            //
        })->afterCreating(function (User $user) {
            //
        });
    }

    // ...
}
```

<a name="creating-models-using-factories"></a>
## 팩토리를 이용한 모델 생성

<a name="instantiating-models"></a>
### 모델 인스턴스화

팩토리를 정의했으면, `Illuminate\Database\Eloquent\Factories\HasFactory` 트레잇이 제공하는 `factory` 정적 메서드를 통해 해당 모델의 팩토리 인스턴스를 생성할 수 있습니다. 예시로, `make` 메서드를 사용하면 데이터베이스에 저장하지 않고 모델 객체만 생성할 수 있습니다.

```
use App\Models\User;

public function test_models_can_be_instantiated()
{
    $user = User::factory()->make();

    // Use model in tests...
}
```

`count` 메서드를 사용해 여러 개의 모델 객체를 한 번에 생성할 수도 있습니다.

```
$users = User::factory()->count(3)->make();
```

<a name="applying-states"></a>
#### 상태(State) 적용하기

원한다면, [팩토리 상태](#factory-states)를 하나 또는 여러 개 조합해서 적용할 수 있습니다. 아래와 같이 여러 상태 변환 메서드를 체이닝해 사용할 수 있습니다.

```
$users = User::factory()->count(5)->suspended()->make();
```

<a name="overriding-attributes"></a>
#### 속성 값 개별 지정(오버라이드)

팩토리로 모델을 생성할 때, 일부 속성값만 따로 지정(overriding)하고 싶은 경우 `make` 메서드에 값을 배열로 넘기면 됩니다. 특정 값만 변경되고, 나머지 속성은 팩토리에 정의한 기본값이 적용됩니다.

```
$user = User::factory()->make([
    'name' => 'Abigail Otwell',
]);
```

또는, 팩토리 인스턴스에서 `state` 메서드를 직접 호출해 즉석에서 속성 변환을 적용할 수도 있습니다.

```
$user = User::factory()->state([
    'name' => 'Abigail Otwell',
])->make();
```

> [!TIP]
> 팩토리로 모델을 생성할 때는 [대량 할당 보호](https://laravel.com/docs/8.x/eloquent#mass-assignment)가 자동으로 비활성화됩니다.

<a name="persisting-models"></a>
### 모델 저장

`create` 메서드는 모델 인스턴스를 만들어 Eloquent의 `save` 메서드를 통해 데이터베이스에 바로 저장합니다.

```
use App\Models\User;

public function test_models_can_be_persisted()
{
    // App\Models\User 인스턴스 하나 생성 및 저장
    $user = User::factory()->create();

    // App\Models\User 인스턴스 세 개 생성 및 저장
    $users = User::factory()->count(3)->create();

    // Use model in tests...
}
```

`create` 메서드에도 속성값 배열을 넘겨, 팩토리 기본값을 원하는 값으로 오버라이드할 수 있습니다.

```
$user = User::factory()->create([
    'name' => 'Abigail',
]);
```

<a name="sequences"></a>
### 시퀀스(Sequences)

때로는 생성하는 여러 모델 객체의 특정 속성값을 번갈아 가며 교차 지정하고 싶을 수 있습니다. 이런 경우 상태 변환을 시퀀스(sequence) 형태로 정의하면 됩니다. 예를 들어, 생성하는 사용자마다 `admin` 컬럼 값을 `Y`와 `N`으로 번갈아 설정하려면 다음과 같이 할 수 있습니다.

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

이렇게 하면 10명의 사용자가 생성되며, `admin` 값이 번갈아가며 5명은 `Y`, 5명은 `N`이 됩니다.

필요하다면, 시퀀스 값으로 클로저를 사용할 수도 있습니다. 시퀀스가 새 값을 필요로 할 때마다 클로저가 호출되어 동적으로 값을 반환할 수 있습니다.

```
$users = User::factory()
                ->count(10)
                ->state(new Sequence(
                    fn ($sequence) => ['role' => UserRoles::all()->random()],
                ))
                ->create();
```

시퀀스 클로저 내부에서는 몇 가지 유용한 속성값을 사용할 수 있습니다. 예를 들어, `$sequence->index`에는 현재까지 시퀀스를 거친 횟수가, `$sequence->count`에는 시퀀스가 호출될 총 횟수가 담겨 있습니다.

```
$users = User::factory()
                ->count(10)
                ->sequence(fn ($sequence) => ['name' => 'Name '.$sequence->index])
                ->create();
```

<a name="factory-relationships"></a>
## 팩토리와 관계 정의

<a name="has-many-relationships"></a>
### Has Many(1:N) 관계

이번에는 라라벨의 플루언트 팩토리 메서드를 사용해 Eloquent 모델 간 연관관계를 만드는 방법을 살펴보겠습니다. 예를 들어, `App\Models\User` 모델과 `App\Models\Post` 모델이 있고, `User` 모델이 `Post`와 1:N(hasMany) 관계를 가진다고 가정해보겠습니다. 라라벨 팩토리의 `has` 메서드를 사용해 하나의 사용자에 세 개의 포스트를 생성하고 연결할 수 있습니다. `has` 메서드에는 팩토리 인스턴스를 전달하면 됩니다.

```
use App\Models\Post;
use App\Models\User;

$user = User::factory()
            ->has(Post::factory()->count(3))
            ->create();
```

일반적으로, `has` 메서드에 `Post` 모델을 전달하면 라라벨은 `User` 모델에 `posts`라는 관계 메서드가 있다고 간주합니다. 만약 다른 이름의 연관관계를 사용하고 싶다면, 두 번째 인자로 직접 관계명을 명시할 수도 있습니다.

```
$user = User::factory()
            ->has(Post::factory()->count(3), 'posts')
            ->create();
```

물론, 연관된 모델에 상태 조작도 적용 가능합니다. 또한, 부모 모델을 참조해야 하는 경우에는, 클로저 기반의 상태 변환을 사용할 수도 있습니다.

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
#### 매직 메서드 활용

편의상 라라벨의 매직 팩토리 관계 메서드도 사용할 수 있습니다. 아래 예시는 컨벤션을 이용해, 연관 모델을 `User` 모델의 `posts` 관계 메서드를 통해 생성하는 동작을 수행합니다.

```
$user = User::factory()
            ->hasPosts(3)
            ->create();
```

매직 메서드를 사용할 때도 관련 모델에 적용할 속성 값을 배열로 지정할 수 있습니다.

```
$user = User::factory()
            ->hasPosts(3, [
                'published' => false,
            ])
            ->create();
```

에서처럼, 클로저 기반의 상태 변환도 사용할 수 있습니다.

```
$user = User::factory()
            ->hasPosts(3, function (array $attributes, User $user) {
                return ['user_type' => $user->type];
            })
            ->create();
```

<a name="belongs-to-relationships"></a>
### Belongs To(소속) 관계

1:N 관계 구축 방법을 살펴봤으니, 이제 반대 방향인 "Belongs To" 관계도 알아보겠습니다. 팩토리의 `for` 메서드를 사용해, 생성된 모델이 특정 부모 모델에 소속되도록 정의할 수 있습니다. 예를 들어, `App\Models\Post` 모델 3개를 한 명의 사용자에 소속되게 생성하는 경우입니다.

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

이미 부모 모델 인스턴스를 가지고 있다면, 그 객체를 직접 `for` 메서드에 넘길 수도 있습니다.

```
$user = User::factory()->create();

$posts = Post::factory()
            ->count(3)
            ->for($user)
            ->create();
```

<a name="belongs-to-relationships-using-magic-methods"></a>
#### 매직 메서드 활용

역시 편의상 "Belongs To" 관계도 라라벨 매직 팩토리 메서드를 써서 구현할 수 있습니다. 아래 예시는 3개의 포스트를 `user`라는 연관관계에 소속되게 만듭니다.

```
$posts = Post::factory()
            ->count(3)
            ->forUser([
                'name' => 'Jessica Archer',
            ])
            ->create();
```

<a name="many-to-many-relationships"></a>
### Many To Many(N:M) 관계

[1:N 관계](#has-many-relationships)와 비슷하게, 다대다(Many to Many) 관계도 팩토리의 `has` 메서드를 이용해 만들 수 있습니다.

```
use App\Models\Role;
use App\Models\User;

$user = User::factory()
            ->has(Role::factory()->count(3))
            ->create();
```

<a name="pivot-table-attributes"></a>
#### Pivot(중간 테이블) 속성 지정

연결 테이블(피벗 테이블)에 값을 지정해야 한다면, `hasAttached` 메서드를 사용하세요. 두 번째 인수로 피벗 테이블 속성명의 배열을 전달할 수 있습니다.

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

연관된 모델을 참조해야 하는 상황에서는 클로저를 활용한 상태 변환도 사용할 수 있습니다.

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

이미 만들어진 모델 인스턴스를 연결하고 싶을 때는, 그 모델들을 `hasAttached`의 첫 번째 인수로 넘겨주면 됩니다. 아래 예시는 3개의 Role을 3명의 사용자 각각에 연결하는 예입니다.

```
$roles = Role::factory()->count(3)->create();

$user = User::factory()
            ->count(3)
            ->hasAttached($roles, ['active' => true])
            ->create();
```

<a name="many-to-many-relationships-using-magic-methods"></a>
#### 매직 메서드 활용

다대다 관계 역시 매직 팩토리 메서드로 정의할 수 있습니다. 아래 예시는 `User` 모델의 `roles` 연관관계를 통해 관련 모델을 생성합니다.

```
$user = User::factory()
            ->hasRoles(1, [
                'name' => 'Editor'
            ])
            ->create();
```

<a name="polymorphic-relationships"></a>
### 폴리모픽(Polymorphic) 관계

[폴리모픽 관계](/docs/8.x/eloquent-relationships#polymorphic-relationships) 또한 팩토리로 생성할 수 있습니다. 폴리모픽 "morph many" 관계 생성법은 1:N 관계와 동일합니다. 예시: `App\Models\Post` 모델이 `App\Models\Comment` 모델과 morphMany 관계를 가진 경우입니다.

```
use App\Models\Post;

$post = Post::factory()->hasComments(3)->create();
```

<a name="morph-to-relationships"></a>
#### Morph To(다형 소속 관계)

매직 메서드로는 `morphTo` 관계를 만들 수 없습니다. 이 경우에는 반드시 `for` 메서드를 사용하고 관계명을 명시해야 합니다. 예를 들어, `Comment` 모델에 `commentable` morphTo 관계가 있다면, 3개의 코멘트를 하나의 포스트에 소속시키는 코드는 아래와 같습니다.

```
$comments = Comment::factory()->count(3)->for(
    Post::factory(), 'commentable'
)->create();
```

<a name="polymorphic-many-to-many-relationships"></a>
#### 폴리모픽 다대다(Many To Many) 관계

폴리모픽 "many to many"(`morphToMany` / `morphedByMany`) 관계도 일반 다대다 관계와 동일하게 생성할 수 있습니다.

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

물론, `has` 매직 메서드를 사용해 폴리모픽 다대다 관계도 생성할 수 있습니다.

```
$videos = Video::factory()
            ->hasTags(3, ['public' => true])
            ->create();
```

<a name="defining-relationships-within-factories"></a>
### 팩토리에서 관계 정의하기

팩토리 내부에서 직접 관계를 정의해야 할 때는, 보통 외래키(foreign key)에 새로운 팩토리 인스턴스를 할당하면 됩니다. 이는 대개 "inverse" 관계인 `belongsTo`나 `morphTo` 관계에서 사용합니다. 예를 들어, 포스트 작성 시 새로운 사용자를 함께 생성하려면 아래와 같이 작성합니다.

```
use App\Models\User;

/**
 * Define the model's default state.
 *
 * @return array
 */
public function definition()
{
    return [
        'user_id' => User::factory(),
        'title' => $this->faker->title(),
        'content' => $this->faker->paragraph(),
    ];
}
```

관계된 컬럼 값이 팩토리의 다른 속성에 따라 동적으로 결정되어야 한다면, 속성값에 클로저를 지정할 수도 있습니다. 이 클로저는 팩토리의 평가된 속성 배열을 인자로 받습니다.

```
/**
 * Define the model's default state.
 *
 * @return array
 */
public function definition()
{
    return [
        'user_id' => User::factory(),
        'user_type' => function (array $attributes) {
            return User::find($attributes['user_id'])->type;
        },
        'title' => $this->faker->title(),
        'content' => $this->faker->paragraph(),
    ];
}
```

<a name="running-seeders"></a>
## 시더(Seeder) 실행하기

[데이터베이스 시더](/docs/8.x/seeding)를 활용해 기능 테스트 중에 데이터베이스를 채우고 싶다면, `seed` 메서드를 호출하면 됩니다. 기본적으로 `seed` 메서드만 실행하면 `DatabaseSeeder` 클래스가 실행되어 다른 모든 시더도 자동 실행됩니다. 특정 시더만 실행하고 싶을 땐 클래스명을 직접 넘겨주면 됩니다.

```
<?php

namespace Tests\Feature;

use Database\Seeders\OrderStatusSeeder;
use Database\Seeders\TransactionStatusSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test creating a new order.
     *
     * @return void
     */
    public function test_orders_can_be_created()
    {
        // Run the DatabaseSeeder...
        $this->seed();

        // Run a specific seeder...
        $this->seed(OrderStatusSeeder::class);

        // ...

        // Run an array of specific seeders...
        $this->seed([
            OrderStatusSeeder::class,
            TransactionStatusSeeder::class,
            // ...
        ]);
    }
}
```

또는, `RefreshDatabase` 트레잇을 사용하는 테스트에서 자동으로 매 테스트마다 시더가 실행되게 하려면, 베이스 테스트 클래스에 `$seed` 프로퍼티를 정의하세요.

```
<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;

    /**
     * Indicates whether the default seeder should run before each test.
     *
     * @var bool
     */
    protected $seed = true;
}
```

`$seed` 프로퍼티가 `true`로 설정되어 있으면, 매 테스트마다 `Database\Seeders\DatabaseSeeder` 클래스가 실행됩니다. 특정한 시더만 실행하고 싶다면, 테스트 클래스에 `$seeder` 프로퍼티를 정의하면 됩니다.

```
use Database\Seeders\OrderStatusSeeder;

/**
 * Run a specific seeder before each test.
 *
 * @var string
 */
protected $seeder = OrderStatusSeeder::class;
```

<a name="available-assertions"></a>
## 사용 가능한 Assertion

라라벨은 [PHPUnit](https://phpunit.de/) 기능 테스트에서 사용할 수 있는 여러 데이터베이스 assertion을 제공합니다. 각 assertion은 아래와 같습니다.

<a name="assert-database-count"></a>
#### assertDatabaseCount

지정한 데이터베이스 테이블에 주어진 개수의 레코드가 존재함을 확인합니다.

```
$this->assertDatabaseCount('users', 5);
```

<a name="assert-database-has"></a>
#### assertDatabaseHas

지정한 키/값 쿼리 조건을 만족하는 레코드가 데이터베이스 테이블에 존재하는지 확인합니다.

```
$this->assertDatabaseHas('users', [
    'email' => 'sally@example.com',
]);
```

<a name="assert-database-missing"></a>
#### assertDatabaseMissing

특정 키/값 쿼리 조건을 만족하는 레코드가 데이터베이스 테이블에 존재하지 않는지 확인합니다.

```
$this->assertDatabaseMissing('users', [
    'email' => 'sally@example.com',
]);
```

<a name="assert-deleted"></a>
#### assertDeleted

지정한 Eloquent 모델이 데이터베이스에서 삭제되었는지 확인합니다.

```
use App\Models\User;

$user = User::find(1);

$user->delete();

$this->assertDeleted($user);
```

`assertSoftDeleted` 메서드는 해당 Eloquent 모델이 "소프트 삭제" 처리되었는지 확인할 때 사용합니다.

```
$this->assertSoftDeleted($user);
```

<a name="assert-model-exists"></a>
#### assertModelExists

지정한 모델 인스턴스가 데이터베이스에 존재하는지 확인합니다.

```
use App\Models\User;

$user = User::factory()->create();

$this->assertModelExists($user);
```

<a name="assert-model-missing"></a>
#### assertModelMissing

지정한 모델 인스턴스가 데이터베이스에 존재하지 않는지 확인합니다.

```
use App\Models\User;

$user = User::factory()->create();

$user->delete();

$this->assertModelMissing($user);
```
