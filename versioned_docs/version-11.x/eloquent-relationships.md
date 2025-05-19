# Eloquent: 연관관계 (Eloquent: Relationships)

- [소개](#introduction)
- [연관관계 정의하기](#defining-relationships)
    - [일대일 / Has One](#one-to-one)
    - [일대다 / Has Many](#one-to-many)
    - [일대다(역방향) / Belongs To](#one-to-many-inverse)
    - [Has One of Many](#has-one-of-many)
    - [Has One Through](#has-one-through)
    - [Has Many Through](#has-many-through)
- [스코프된 연관관계](#scoped-relationships)
- [다대다 연관관계](#many-to-many)
    - [중간 테이블 컬럼 조회](#retrieving-intermediate-table-columns)
    - [중간 테이블 컬럼을 사용한 쿼리 필터링](#filtering-queries-via-intermediate-table-columns)
    - [중간 테이블 컬럼을 사용한 쿼리 정렬](#ordering-queries-via-intermediate-table-columns)
    - [사용자 정의 중간 테이블 모델 정의](#defining-custom-intermediate-table-models)
- [다형성 연관관계](#polymorphic-relationships)
    - [일대일](#one-to-one-polymorphic-relations)
    - [일대다](#one-to-many-polymorphic-relations)
    - [One of Many](#one-of-many-polymorphic-relations)
    - [다대다](#many-to-many-polymorphic-relations)
    - [사용자 정의 다형성 타입](#custom-polymorphic-types)
- [동적 연관관계](#dynamic-relationships)
- [연관관계 쿼리하기](#querying-relations)
    - [연관관계 메서드 vs. 동적 속성](#relationship-methods-vs-dynamic-properties)
    - [연관관계 존재 여부 쿼리](#querying-relationship-existence)
    - [연관관계 부재 쿼리](#querying-relationship-absence)
    - [Morph To 연관관계 쿼리](#querying-morph-to-relationships)
- [연관된 모델 집계](#aggregating-related-models)
    - [연관된 모델 개수 세기](#counting-related-models)
    - [기타 집계 함수](#other-aggregate-functions)
    - [Morph To 연관관계의 모델 개수 세기](#counting-related-models-on-morph-to-relationships)
- [Eager Loading](#eager-loading)
    - [Eager Load 제약](#constraining-eager-loads)
    - [Lazy Eager Loading](#lazy-eager-loading)
    - [Lazy Loading 방지](#preventing-lazy-loading)
- [관련 모델 삽입 및 갱신](#inserting-and-updating-related-models)
    - [`save` 메서드](#the-save-method)
    - [`create` 메서드](#the-create-method)
    - [Belongs To 연관관계](#updating-belongs-to-relationships)
    - [다대다 연관관계](#updating-many-to-many-relationships)
- [상위 모델 타임스탬프 자동 변경](#touching-parent-timestamps)

<a name="introduction"></a>
## 소개

데이터베이스 테이블은 서로 연관되어 있는 경우가 많습니다. 예를 들어, 블로그 글에는 여러 개의 댓글이 달릴 수 있고, 주문은 주문한 사용자와 연결되어 있습니다. Eloquent는 이러한 연관관계를 쉽게 관리하고 사용할 수 있도록 다양한 기본 연관관계를 제공합니다.

<div class="content-list" markdown="1">

- [일대일](#one-to-one)
- [일대다](#one-to-many)
- [다대다](#many-to-many)
- [Has One Through](#has-one-through)
- [Has Many Through](#has-many-through)
- [일대일(다형성)](#one-to-one-polymorphic-relations)
- [일대다(다형성)](#one-to-many-polymorphic-relations)
- [다대다(다형성)](#many-to-many-polymorphic-relations)

</div>

<a name="defining-relationships"></a>
## 연관관계 정의하기

Eloquent의 연관관계는 Eloquent 모델 클래스에서 메서드 형태로 정의합니다. 연관관계 메서드는 강력한 [쿼리 빌더](/docs/11.x/queries) 역할도 하므로, 메서드 체이닝을 통해 다양한 질의 조건을 추가로 지정할 수 있습니다. 예를 들어, 아래와 같이 `posts` 연관관계에 추가 쿼리 제약을 체이닝할 수 있습니다.

```
$user->posts()->where('active', 1)->get();
```

본격적으로 연관관계를 사용해보기 전에, Eloquent가 지원하는 각 연관관계의 정의 방법부터 살펴보겠습니다.

<a name="one-to-one"></a>
### 일대일 / Has One

일대일(One-to-One) 연관관계는 가장 기본적인 데이터베이스 관계입니다. 예를 들어, `User` 모델은 하나의 `Phone` 모델과 연결될 수 있습니다. 이 관계를 정의하려면 `User` 모델에 `phone`이라는 메서드를 추가하고, 이 메서드에서 `hasOne` 메서드를 호출해 반환하면 됩니다. `hasOne` 메서드는 모델의 부모 클래스인 `Illuminate\Database\Eloquent\Model`을 통해 제공됩니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Model
{
    /**
     * 사용자와 연결된 전화 번호를 가져옵니다.
     */
    public function phone(): HasOne
    {
        return $this->hasOne(Phone::class);
    }
}
```

`hasOne` 메서드의 첫 번째 인수로는 관련 모델 클래스명을 전달합니다. 연관관계를 정의한 후에는, Eloquent의 동적 속성(Dynamic Property) 기능을 이용해 관련 레코드를 바로 조회할 수 있습니다. 동적 속성은, 연관관계 메서드를 마치 모델의 속성처럼 접근할 수 있게 해주는 기능입니다.

```
$phone = User::find(1)->phone;
```

Eloquent는 연관관계의 외래 키(foreign key)를 부모 모델의 이름을 기준으로 자동으로 결정합니다. 위 예시의 경우, `Phone` 모델에 기본적으로 `user_id`라는 외래 키가 있다고 간주합니다. 이 규칙을 변경하고 싶다면, `hasOne` 메서드의 두 번째 인수로 외래 키 이름을 지정할 수 있습니다.

```
return $this->hasOne(Phone::class, 'foreign_key');
```

또한 Eloquent는 기본적으로 외래 키의 값은 부모 모델의 기본 키 컬럼(primary key) 값과 일치해야 한다고 가정합니다. 즉, Eloquent는 `Phone` 레코드의 `user_id` 컬럼 값이 사용자의 `id` 컬럼과 동일한지를 기준으로 연관관계를 찾습니다. 만약 기본 키 컬럼이 `id`가 아니거나, 모델의 `$primaryKey` 속성 이외의 값을 사용하고 싶다면, `hasOne` 메서드의 세 번째 인수로 로컬 키를 지정할 수 있습니다.

```
return $this->hasOne(Phone::class, 'foreign_key', 'local_key');
```

<a name="one-to-one-defining-the-inverse-of-the-relationship"></a>
#### 연관관계의 역방향 정의하기

이제 `User` 모델에서 `Phone` 모델을 조회할 수 있게 되었습니다. 다음으로, `Phone` 모델에서 이 전화번호의 소유자인 사용자를 조회할 수 있도록 역방향 연관관계를 정의해봅시다. 이때는 `hasOne`의 역방향인 `belongsTo` 메서드를 사용합니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Phone extends Model
{
    /**
     * 전화번호의 소유자(사용자)를 가져옵니다.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
```

`user` 메서드를 호출하면, Eloquent는 `Phone` 모델의 `user_id` 컬럼 값과 일치하는 `id` 값을 가진 `User` 모델을 찾아 반환합니다.

Eloquent는 연관관계 메서드의 이름에 `_id`를 붙여 외래 키 이름을 추론합니다. 즉, 위 예제에서는 `Phone` 모델에 `user_id` 컬럼이 있다고 간주합니다. 만약 `Phone` 모델의 실제 외래 키가 `user_id`가 아니라면, `belongsTo`의 두 번째 인수로 외래 키를 지정할 수 있습니다.

```
/**
 * 전화번호의 소유자(사용자)를 가져옵니다.
 */
public function user(): BelongsTo
{
    return $this->belongsTo(User::class, 'foreign_key');
}
```

마찬가지로, 상위(부모) 모델의 기본 키가 `id`가 아니거나, 다른 컬럼을 기준으로 부모 모델을 찾고 싶다면, `belongsTo`의 세 번째 인수로 상위 테이블의 사용자 정의 키를 전달할 수 있습니다.

```
/**
 * 전화번호의 소유자(사용자)를 가져옵니다.
 */
public function user(): BelongsTo
{
    return $this->belongsTo(User::class, 'foreign_key', 'owner_key');
}
```

<a name="one-to-many"></a>
### 일대다 / Has Many

일대다(One-to-Many) 연관관계는 하나의 모델이 여러 개의 하위 모델을 소유할 때 사용합니다. 예를 들어, 블로그 글에는 무한정 많은 댓글이 달릴 수 있습니다. 다른 Eloquent 연관관계와 마찬가지로, 일대다 관계 역시 모델에 메서드를 정의해서 구현합니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Post extends Model
{
    /**
     * 블로그 글에 달린 댓글들을 가져옵니다.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }
}
```

Eloquent는 `Comment` 모델의 적절한 외래 키 컬럼을 자동으로 결정합니다. 기본적으로는 상위 모델의 이름(스네이크 케이스 처리)에 `_id`를 붙여 외래 키 이름을 만듭니다. 즉, 예시에서는 `Comment` 모델에 `post_id` 컬럼이 있다고 가정합니다.

연관관계 메서드를 정의한 후에는, `comments` 속성을 사용해 관련 댓글들의 [컬렉션](/docs/11.x/eloquent-collections)을 조회할 수 있습니다. 여기서도 Eloquent가 제공하는 동적 속성(Dynamic Property)을 통해, 마치 속성처럼 `comments`에 바로 접근할 수 있습니다.

```
use App\Models\Post;

$comments = Post::find(1)->comments;

foreach ($comments as $comment) {
    // ...
}
```

모든 연관관계는 쿼리 빌더 역할을 하기 때문에, `comments` 메서드를 통해 쿼리 제약 조건을 추가로 체이닝할 수도 있습니다.

```
$comment = Post::find(1)->comments()
    ->where('title', 'foo')
    ->first();
```

`hasOne` 메서드와 마찬가지로, `hasMany`에도 추가 인수를 넘겨 외래 키, 로컬 키를 직접 지정할 수 있습니다.

```
return $this->hasMany(Comment::class, 'foreign_key');

return $this->hasMany(Comment::class, 'foreign_key', 'local_key');
```

<a name="automatically-hydrating-parent-models-on-children"></a>
#### 자식 모델에 부모 모델 자동 할당(Hydration)

Eloquent에서 eager loading을 사용하더라도, 자식 모델에서 부모 모델을 참조하는 과정에서 "N + 1" 쿼리 문제가 발생할 수 있습니다. 예를 들어, 다음과 같이 반복문에서 자식 모델의 부모 모델에 접근하면 문제가 생길 수 있습니다.

```php
$posts = Post::with('comments')->get();

foreach ($posts as $post) {
    foreach ($post->comments as $comment) {
        echo $comment->post->title;
    }
}
```

위 예시에서는 각 `Post` 모델의 `comments`가 eager loading되지만, 각 댓글의 부모인 `Post` 모델은 자동으로 할당되지 않기 때문에 "N + 1" 쿼리 문제가 발생합니다.

자식 모델에 부모 모델을 자동으로 할당하고 싶다면, `hasMany` 연관관계를 정의할 때 `chaperone` 메서드를 호출하면 됩니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Post extends Model
{
    /**
     * 블로그 글에 달린 댓글들을 가져옵니다.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class)->chaperone();
    }
}
```

또는, 런타임에서 관계를 eager load할 때 `chaperone` 메서드를 체이닝하여 부모 자동 할당 기능을 사용할 수도 있습니다.

```php
use App\Models\Post;

$posts = Post::with([
    'comments' => fn ($comments) => $comments->chaperone(),
])->get();
```

<a name="one-to-many-inverse"></a>
### 일대다(역방향) / Belongs To

이제 특정 게시글의 모든 댓글을 조회할 수 있게 되었으니, 이번에는 댓글별로 자신의 부모 게시글을 조회할 수 있는 관계를 정의해보겠습니다. `hasMany` 관계의 역방향 연관관계는, 자식 모델에서 `belongsTo` 메서드를 사용해 관계 메서드를 정의하면 됩니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comment extends Model
{
    /**
     * 댓글이 달린 게시글을 가져옵니다.
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }
}
```

관계를 정의한 뒤에는, 댓글 인스턴스에서 동적 속성으로 부모 게시글을 바로 조회할 수 있습니다.

```
use App\Models\Comment;

$comment = Comment::find(1);

return $comment->post->title;
```

위 예시에서, Eloquent는 `Comment` 모델의 `post_id` 컬럼 값과 일치하는 `id` 값을 가진 `Post` 모델을 찾아 반환합니다.

Eloquent는 관계 메서드의 이름에 `_`와 부모 모델 기본 키 컬럼명을 붙여 외래 키를 추론합니다. 즉, 여기서는 댓글 테이블(`comments`)에 `post_id` 컬럼이 있다고 간주합니다.

만약 외래 키 컬럼 이름이 이 규칙을 따르지 않는다면, `belongsTo` 메서드의 두 번째 인수로 외래 키 이름을 직접 지정할 수 있습니다.

```
/**
 * 댓글이 달린 게시글을 가져옵니다.
 */
public function post(): BelongsTo
{
    return $this->belongsTo(Post::class, 'foreign_key');
}
```

부모 모델의 기본 키가 `id`가 아닌 다른 컬럼이거나, 다른 컬럼으로 부모 모델을 찾고 싶은 경우에는, 세 번째 인수로 부모 테이블의 키를 지정할 수 있습니다.

```
/**
 * 댓글이 달린 게시글을 가져옵니다.
 */
public function post(): BelongsTo
{
    return $this->belongsTo(Post::class, 'foreign_key', 'owner_key');
}
```

<a name="default-models"></a>
#### 기본 모델(Default Models)

`belongsTo`, `hasOne`, `hasOneThrough`, `morphOne` 연관관계에서는, 관계 결과가 `null`일 경우 대신 반환될 기본(default) 모델을 정의할 수 있습니다. 이 패턴은 [Null Object 패턴](https://en.wikipedia.org/wiki/Null_Object_pattern)이라고도 하며, 조건문을 줄여 코드를 간결하게 만들 수 있습니다. 아래 예시에서, `Post` 모델에 연결된 사용자가 없을 경우, 빈 `App\Models\User` 모델을 반환하게 됩니다.

```
/**
 * 글의 작성자를 가져옵니다.
 */
public function user(): BelongsTo
{
    return $this->belongsTo(User::class)->withDefault();
}
```

기본 모델의 속성 값을 미리 채우고 싶다면, `withDefault` 메서드에 배열이나 클로저를 전달할 수 있습니다.

```
/**
 * 글의 작성자를 가져옵니다.
 */
public function user(): BelongsTo
{
    return $this->belongsTo(User::class)->withDefault([
        'name' => 'Guest Author',
    ]);
}

/**
 * 글의 작성자를 가져옵니다.
 */
public function user(): BelongsTo
{
    return $this->belongsTo(User::class)->withDefault(function (User $user, Post $post) {
        $user->name = 'Guest Author';
    });
}
```

<a name="querying-belongs-to-relationships"></a>
#### Belongs To 연관관계 쿼리하기

"Belongs To" 관계의 자식 모델들(즉, 특정 상위 모델에 소속된 모든 하위 모델)을 쿼리할 때는, 다음과 같이 수동으로 `where` 조건을 작성할 수 있습니다.

```
use App\Models\Post;

$posts = Post::where('user_id', $user->id)->get();
```

하지만, 라라벨의 `whereBelongsTo` 메서드를 사용하면, 적절한 연관관계와 외래 키를 자동으로 판별해줘서 더욱 편리하게 쿼리를 작성할 수 있습니다.

```
$posts = Post::whereBelongsTo($user)->get();
```

또한, `whereBelongsTo` 메서드에는 [컬렉션](/docs/11.x/eloquent-collections) 인스턴스를 바로 전달할 수 있습니다. 이럴 경우, 컬렉션에 포함된 모든 부모 모델에 소속된 하위 모델을 한 번에 불러옵니다.

```
$users = User::where('vip', true)->get();

$posts = Post::whereBelongsTo($users)->get();
```

기본적으로 라라벨은 전달된 모델의 클래스명을 기준으로 적절한 연관관계를 찾지만, 두 번째 인수로 연관관계 이름을 직접 지정할 수도 있습니다.

```
$posts = Post::whereBelongsTo($user, 'author')->get();
```

<a name="has-one-of-many"></a>
### Has One of Many

때때로 하나의 모델이 여러 개의 관련 모델을 가질 수 있지만, 연관된 모델 중 가장 최근(recent) 또는 가장 오래된(oldest) 단일 모델만 쉽고 빠르게 가져오고 싶을 때가 있습니다. 예를 들어, `User` 모델은 여러 개의 `Order` 모델과 연관될 수 있지만, 사용자가 마지막으로 주문한 가장 최근 주문 건에 쉽게 접근하고 싶은 경우가 있습니다. 이럴 때는 `hasOne` 관계와 `ofMany` 계열 메서드를 조합해서 사용할 수 있습니다.

```php
/**
 * 사용자의 가장 최근 주문을 가져옵니다.
 */
public function latestOrder(): HasOne
{
    return $this->hasOne(Order::class)->latestOfMany();
}
```

마찬가지로, "가장 오래된"(first) 연관 모델을 가져오는 메서드도 다음과 같이 정의할 수 있습니다.

```php
/**
 * 사용자의 가장 오래된 주문을 가져옵니다.
 */
public function oldestOrder(): HasOne
{
    return $this->hasOne(Order::class)->oldestOfMany();
}
```

`latestOfMany`와 `oldestOfMany` 메서드는 기본적으로 모델의 기본 키(정렬 가능한 값 기준)로 가장 최근 또는 오래된 모델을 찾습니다. 하지만 때로는 다른 기준으로 정렬해 단일 모델을 가져오고 싶을 수 있습니다.

예를 들어, `ofMany` 메서드를 사용해서 사용자의 "가장 비싼" 주문 건을 조회할 수도 있습니다. 이때 `ofMany`의 첫 번째 인수로 정렬 대상 컬럼, 두 번째 인수로 집계 함수(`min` 또는 `max`)를 전달합니다.

```php
/**
 * 사용자의 가장 큰 주문 건을 가져옵니다.
 */
public function largestOrder(): HasOne
{
    return $this->hasOne(Order::class)->ofMany('price', 'max');
}
```

> [!WARNING]
> PostgreSQL은 UUID 컬럼에 대해 `MAX` 함수를 지원하지 않으므로, PostgreSQL UUID 컬럼을 사용하는 환경에서는 one-of-many 관계를 사용할 수 없습니다.

<a name="converting-many-relationships-to-has-one-relationships"></a>
#### "Many" 연관관계를 Has One 관계로 변환하기

이미 "has many" 연관관계가 정의되어 있을 때, `latestOfMany`, `oldestOfMany`, `ofMany`와 같은 메서드를 통해 단일 모델을 불러오는 패턴이 자주 필요하다면, 라라벨에서는 기존의 "has many" 관계를 간단히 "has one" 관계로 변환할 수 있습니다. 이를 위해 관계에서 `one` 메서드를 호출하면 됩니다.

```php
/**
 * 사용자의 주문 목록을 가져옵니다.
 */
public function orders(): HasMany
{
    return $this->hasMany(Order::class);
}

/**
 * 사용자의 가장 큰 주문 건을 가져옵니다.
 */
public function largestOrder(): HasOne
{
    return $this->orders()->one()->ofMany('price', 'max');
}
```

<a name="advanced-has-one-of-many-relationships"></a>
#### 고급 Has One of Many 연관관계

조금 더 복잡한 "has one of many" 관계도 정의할 수 있습니다. 예를 들어, `Product` 모델에는 여러 개의 `Price` 모델이 연관되어 있으며, 신제품 가격이 미리 등록되어 미래 시점에 적용될 수도 있습니다(`published_at` 컬럼 참고). 이런 상황에서는, 아직 적용되지 않은 미래 가격은 제외하고, 가장 마지막에 등록된(발행일이 현재보다 이전인) 가격 중, 발행일이 같으면 ID가 큰 가격을 가져오고 싶을 수 있습니다.

이럴 때는, `ofMany` 메서드에 배열 형태로 여러 기준 컬럼을 지정하고, 두 번째 인수로 Publish Date에 대한 추가 제약이 포함된 클로저를 전달해서 복잡한 관계를 정의할 수 있습니다.

```php
/**
 * 상품의 현재 적용 가격을 가져옵니다.
 */
public function currentPricing(): HasOne
{
    return $this->hasOne(Price::class)->ofMany([
        'published_at' => 'max',
        'id' => 'max',
    ], function (Builder $query) {
        $query->where('published_at', '<', now());
    });
}
```

<a name="has-one-through"></a>
### Has One Through

"has-one-through" 관계는, 한 모델이 다른 모델과 일대일 연관관계를 가지되, _중간 모델을 거쳐서_ 최종 모델과 연결되는 구조를 의미합니다.

예를 들어, 차량 정비소 애플리케이션에서, 각각의 `Mechanic`(정비공) 모델은 하나의 `Car`(자동차) 모델과 연결되어 있고, 각각의 `Car`는 하나의 `Owner`(차주) 모델과 연결될 수 있습니다. 이처럼 `mechanic`과 `owner`는 데이터베이스상 직접 연결되어 있지 않지만, `Car` 모델을 _경유해서_ owner에 접근할 수 있습니다. 아래는 이런 관계를 구성하는 테이블 예시입니다.

```
mechanics
    id - integer
    name - string

cars
    id - integer
    model - string
    mechanic_id - integer

owners
    id - integer
    name - string
    car_id - integer
```

테이블 구조를 확인했으니, 이제 `Mechanic` 모델에 관계를 정의해봅니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;

class Mechanic extends Model
{
    /**
     * 자동차의 소유자를 가져옵니다.
     */
    public function carOwner(): HasOneThrough
    {
        return $this->hasOneThrough(Owner::class, Car::class);
    }
}
```

`hasOneThrough` 메서드의 첫 번째 인수는 최종적으로 접근하고자 하는 모델, 두 번째 인수는 중간에 거치는 모델입니다.

또는, 이미 각 모델에 관계가 정의되어 있다면, `through` 메서드에 관계 이름을 전달해 좀 더 간결하게 Has One Through 관계를 정의할 수도 있습니다. 예를 들어, `Mechanic` 모델에 `cars` 관계가 있고, `Car` 모델에 `owner` 관계가 있다면, 아래와 같이 두 가지 방식으로 정의할 수 있습니다.

```php
// 문자열 방식
return $this->through('cars')->has('owner');

// 동적 방식
return $this->throughCars()->hasOwner();
```

<a name="has-one-through-key-conventions"></a>
#### 키 네이밍 규칙(Key Conventions)

관계 쿼리를 수행할 때는 일반적인 Eloquent의 외래 키 명명 규칙이 적용됩니다. 하지만, 관계의 키를 직접 지정하고 싶다면 `hasOneThrough` 메서드의 세 번째, 네 번째 인수로 전달할 수 있습니다. 세 번째 인수는 중간 테이블의 외래 키, 네 번째 인수는 마지막 테이블의 외래 키입니다. 다섯 번째, 여섯 번째 인수는 각각 기점(로컬) 테이블, 중간 테이블의 로컬 키입니다.

```
class Mechanic extends Model
{
    /**
     * 자동차의 소유자를 가져옵니다.
     */
    public function carOwner(): HasOneThrough
    {
        return $this->hasOneThrough(
            Owner::class,
            Car::class,
            'mechanic_id', // cars 테이블의 외래 키
            'car_id', // owners 테이블의 외래 키
            'id', // mechanics 테이블의 로컬 키
            'id' // cars 테이블의 로컬 키
        );
    }
}
```

앞서 설명한 것처럼, 이미 각 모델에 관계가 정의되어 있다면, `through` 메서드에 관계 이름을 전달해 더욱 간결하게 Has One Through 관계를 구현할 수도 있습니다. 이 방식은 기존에 정의된 키 규칙을 재사용할 수 있다는 점이 장점입니다.

```php
// 문자열 방식
return $this->through('cars')->has('owner');

// 동적 방식
return $this->throughCars()->hasOwner();
```

<a name="has-many-through"></a>

### 다중 중간 테이블(Has Many Through)

"has-many-through" 관계는 중간 관계를 통해 먼 거리에 있는 연관 관계의 데이터를 쉽게 조회할 수 있게 해줍니다. 예를 들어, [Laravel Vapor](https://vapor.laravel.com)와 같은 배포 플랫폼을 만든다고 가정해보겠습니다. 이때 `Project` 모델은 중간에 위치한 `Environment` 모델을 통해 여러 개의 `Deployment` 모델에 접근할 수 있습니다. 이 구조를 활용하면 하나의 프로젝트에 속한 모든 배포 정보를 손쉽게 조회할 수 있습니다. 이 관계를 정의하기 위해 필요한 데이터베이스 테이블들은 다음과 같습니다.

```
projects
    id - integer
    name - string

environments
    id - integer
    project_id - integer
    name - string

deployments
    id - integer
    environment_id - integer
    commit_hash - string
```

이제 테이블 구조를 살펴보았으니, `Project` 모델에서 이 관계를 어떻게 정의할 수 있는지 알아보겠습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Project extends Model
{
    /**
     * 프로젝트의 모든 배포(deployment) 정보 가져오기
     */
    public function deployments(): HasManyThrough
    {
        return $this->hasManyThrough(Deployment::class, Environment::class);
    }
}
```

`hasManyThrough` 메서드의 첫 번째 인수는 실제로 최종적으로 접근하고 싶은 모델이며, 두 번째 인수는 중간에 위치한 모델을 지정합니다.

또는, 연관된 모든 모델에 이미 관계 메서드가 정의되어 있다면, `through` 메서드에 관계 명을 전달하여 더욱 간결하게 "has-many-through" 관계를 정의할 수 있습니다. 예를 들어, 만약 `Project` 모델에 `environments` 관계가 있고, `Environment` 모델에 `deployments` 관계가 있다면, 다음과 같이 프로젝트와 배포 사이의 "has-many-through" 관계를 정의할 수 있습니다.

```php
// 문자열 기반 문법...
return $this->through('environments')->has('deployments');

// 동적 문법...
return $this->throughEnvironments()->hasDeployments();
```

`Deployment` 모델의 테이블에는 `project_id` 컬럼이 존재하지 않지만, `hasManyThrough` 관계를 이용하면 `$project->deployments`를 통해 프로젝트에 속한 배포 정보를 조회할 수 있습니다. 이때 Eloquent는 중간에 위치한 `Environment` 모델의 테이블에서 `project_id` 컬럼을 활용해 환경 ID 목록을 찾은 뒤, 해당 환경 ID로 `Deployment` 테이블을 조회하게 됩니다.

<a name="has-many-through-key-conventions"></a>
#### 키 명명 규칙(Key Conventions)

관계형 쿼리를 실행할 때는 Eloquent의 기본 외래 키 명명 규칙이 사용됩니다. 만약 관계의 키를 직접 지정하고 싶다면, `hasManyThrough` 메서드의 세 번째 및 네 번째 인수로 키 이름을 전달하면 됩니다. 세 번째 인수는 중간 테이블의 외래 키, 네 번째 인수는 최종 테이블의 외래 키, 다섯 번째 인수는 로컬 키, 여섯 번째 인수는 중간 모델의 로컬 키입니다.

```
class Project extends Model
{
    public function deployments(): HasManyThrough
    {
        return $this->hasManyThrough(
            Deployment::class,
            Environment::class,
            'project_id', // environments 테이블의 외래 키
            'environment_id', // deployments 테이블의 외래 키
            'id', // projects 테이블의 로컬 키
            'id' // environments 테이블의 로컬 키
        );
    }
}
```

또 앞서 설명한 것처럼, 모든 모델에 필요한 관계가 이미 정의되어 있다면, `through` 메서드에 관계명을 전달해 더욱 간단하게 "has-many-through" 관계를 설정할 수 있습니다. 이 방법을 사용하면 기존에 정의된 관계의 키 명명 규칙도 재활용할 수 있다는 장점이 있습니다.

```php
// 문자열 기반 문법...
return $this->through('environments')->has('deployments');

// 동적 문법...
return $this->throughEnvironments()->hasDeployments();
```

<a name="scoped-relationships"></a>
### 조건이 적용된 관계 메서드(Scoped Relationships)

모델에 조건이 적용된 관계 메서드를 추가하는 경우가 자주 있습니다. 예를 들어, `User` 모델에 `posts` 관계가 있다고 할 때, 여기에 추가적인 `where` 조건을 적용하여 특정 조건의 `featuredPosts` 메서드를 만들 수 있습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Model
{
    /**
     * 사용자의 전체 게시물(posts) 가져오기
     */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class)->latest();
    }

    /**
     * 사용자의 추천 게시물(featured posts) 가져오기
     */
    public function featuredPosts(): HasMany
    {
        return $this->posts()->where('featured', true);
    }
}
```

하지만 이렇게 정의된 `featuredPosts` 메서드로 새로운 모델을 생성할 경우, `featured` 속성이 `true`로 자동 설정되지 않습니다. 만약 관계 메서드를 통해 모델을 생성하면서도 해당 관계로 만들어진 모든 모델에 특정 속성을 자동으로 지정하고 싶다면, 관계 쿼리를 구성할 때 `withAttributes` 메서드를 사용할 수 있습니다.

```
/**
 * 사용자의 추천 게시물 가져오기
 */
public function featuredPosts(): HasMany
{
    return $this->posts()->withAttributes(['featured' => true]);
}
```

`withAttributes` 메서드는 주어진 속성을 기반으로 쿼리에 `where` 절을 추가하며, 해당 관계로 모델을 생성하는 경우에도 해당 속성을 자동으로 추가합니다.

```
$post = $user->featuredPosts()->create(['title' => 'Featured Post']);

$post->featured; // true
```

<a name="many-to-many"></a>
## 다대다(Many to Many) 관계

다대다(many-to-many) 관계는 `hasOne`, `hasMany` 관계보다 구현이 약간 더 복잡합니다. 대표적인 예로, 하나의 사용자가 여러 역할을 가질 수 있고, 그 역할 역시 여러 사용자가 가질 수 있는 구조가 있습니다. 예를 들어 사용자 한 명이 "Author", "Editor" 역할을 가질 수 있으며, 이 역할들은 다른 사용자에게도 부여될 수 있습니다. 즉, 한 사용자는 여러 역할을 가질 수 있고, 하나의 역할 역시 여러 사용자와 연결됩니다.

<a name="many-to-many-table-structure"></a>
#### 테이블 구조

이 관계를 정의하려면 `users`, `roles`, `role_user`라는 세 개의 테이블이 필요합니다. `role_user` 테이블은 서로 연관된 모델명의 알파벳 순서에 따라 이름이 정해지며, 이 테이블에는 `user_id`, `role_id` 컬럼이 존재합니다. 이 테이블은 사용자와 역할을 연결하는 중간 테이블로 기능합니다.

여기서 주의할 점은, 하나의 역할이 여러 사용자에 속할 수 있으므로, 단순히 `roles` 테이블에 `user_id` 칼럼을 추가하는 방식으로 구현할 수 없다는 것입니다. 만약 그렇게 한다면 한 역할이 한 명의 사용자만 갖게 되는 구조가 되어버립니다. 여러 사용자에게 권한을 부여하려면 반드시 중간 테이블(`role_user`)이 필요합니다. 관계형 테이블 구조는 다음과 같이 요약할 수 있습니다.

```
users
    id - integer
    name - string

roles
    id - integer
    name - string

role_user
    user_id - integer
    role_id - integer
```

<a name="many-to-many-model-structure"></a>
#### 모델 구조

다대다 관계는 `belongsToMany` 메서드에서 반환되는 결과를 리턴하는 메서드를 정의함으로써 설정할 수 있습니다. `belongsToMany` 메서드는 여러분의 모든 Eloquent 모델이 기본적으로 상속하는 `Illuminate\Database\Eloquent\Model` 클래스에서 제공됩니다. 예를 들어, `User` 모델에 `roles` 메서드를 다음과 같이 정의할 수 있습니다. 이 메서드의 첫 번째 인수로는 연관되는 모델 클래스명을 전달합니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Model
{
    /**
     * 해당 사용자가 보유한 역할들
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }
}
```

이렇게 관계를 정의하면, 사용자 객체의 동적 속성으로 `roles`를 통해 역할 목록에 접근할 수 있습니다.

```
use App\Models\User;

$user = User::find(1);

foreach ($user->roles as $role) {
    // ...
}
```

모든 관계는 쿼리 빌더 역할도 하므로, `roles` 메서드를 호출한 후 체이닝으로 추가 조건을 붙여 쿼리를 세밀하게 제어할 수도 있습니다.

```
$roles = User::find(1)->roles()->orderBy('name')->get();
```

중간 테이블의 이름은 Eloquent가 두 관련 모델의 이름을 알파벳 순서대로 결합하여 결정합니다. 하지만 이 규칙은 자유롭게 재정의할 수 있습니다. 두 번째 인수로 직접 테이블 이름을 지정할 수 있습니다.

```
return $this->belongsToMany(Role::class, 'role_user');
```

또한, 중간 테이블의 외래 키 컬럼명도 추가 인수로 지정하여 오버라이드할 수 있습니다. 세 번째 인수는 현재 모델 기준의 외래 키, 네 번째 인수는 관계를 맺고자 하는 대상 모델의 외래 키입니다.

```
return $this->belongsToMany(Role::class, 'role_user', 'user_id', 'role_id');
```

<a name="many-to-many-defining-the-inverse-of-the-relationship"></a>
#### 관계의 반대(Inverse) 정의하기

다대다 관계의 "반대"도 역시 `belongsToMany` 메서드를 사용해 정의하면 됩니다. 예시를 완성해보면, `Role` 모델에 `users` 메서드를 정의할 수 있습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    /**
     * 이 역할을 가진 사용자들
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }
}
```

보시는 것처럼, 관계 정의 방식은 `User` 모델에서와 동일하며, 단지 참조되는 모델만 `App\Models\User`로 바뀌는 점이 다릅니다. `belongsToMany` 메서드를 재사용하기 때문에, 테이블명이나 키 컬럼명 커스터마이징 역시 언제든 동일하게 적용할 수 있습니다.

<a name="retrieving-intermediate-table-columns"></a>
### 중간 테이블 컬럼 조회하기

이미 살펴본 것처럼, 다대다 관계를 사용할 때는 중간 테이블이 반드시 필요합니다. Eloquent는 이 중간 테이블과 상호작용할 수 있는 다양한 유용한 기능을 제공합니다. 예를 들어, `User` 모델이 여러 `Role` 모델과 연결되어 있다면, 역할을 조회한 후 각 `Role` 모델의 `pivot` 속성을 이용해 중간 테이블 데이터에 접근할 수 있습니다.

```
use App\Models\User;

$user = User::find(1);

foreach ($user->roles as $role) {
    echo $role->pivot->created_at;
}
```

이 예제처럼, 조회한 각각의 `Role` 모델에는 자동으로 `pivot` 속성이 부여됩니다. 이 속성은 중간 테이블(피벗 테이블)의 데이터를 담고 있는 모델입니다.

기본적으로는 모델 키 정보만 `pivot` 모델에 포함됩니다. 만약 중간 테이블에 추가적인 컬럼(예: `active`, `created_by` 등)이 있다면, 관계 정의 시 `withPivot` 메서드를 통해 별도로 지정해주어야 합니다.

```
return $this->belongsToMany(Role::class)->withPivot('active', 'created_by');
```

또한 중간 테이블에 `created_at`, `updated_at` 타임스탬프가 있고 이를 Eloquent에서 자동 관리하고 싶다면, 관계에 `withTimestamps` 메서드를 추가하세요.

```
return $this->belongsToMany(Role::class)->withTimestamps();
```

> [!WARNING]  
> Eloquent에서 자동으로 타임스탬프를 관리하는 중간 테이블은 `created_at`, `updated_at` 컬럼을 반드시 포함해야 합니다.

<a name="customizing-the-pivot-attribute-name"></a>
#### `pivot` 속성명 커스터마이징

앞서 설명했듯이, 중간 테이블의 속성은 모델의 `pivot` 속성을 통해 접근할 수 있습니다. 하지만, 필요에 따라 이 속성명을 여러분의 애플리케이션 상황에 맞게 변경하는 것도 가능합니다.

예를 들어, 사용자가 팟캐스트를 구독하는 경우가 있을 때, users와 podcasts 간의 다대다 관계를 가지게 되는데, 이때 중간 테이블 속성명을 `pivot` 대신 `subscription`으로 바꾸고 싶을 수 있습니다. 관계 정의 때 `as` 메서드를 사용하면 됩니다.

```
return $this->belongsToMany(Podcast::class)
    ->as('subscription')
    ->withTimestamps();
```

이렇게 커스텀 속성명을 지정했다면, 관계 데이터를 해당 이름으로 접근할 수 있습니다.

```
$users = User::with('podcasts')->get();

foreach ($users->flatMap->podcasts as $podcast) {
    echo $podcast->subscription->created_at;
}
```

<a name="filtering-queries-via-intermediate-table-columns"></a>
### 중간 테이블 컬럼을 통한 쿼리 필터링

`belongsToMany` 관계 쿼리에서는 중간 테이블 컬럼을 기준으로 결과를 필터링할 수 있습니다. 이를 위해 `wherePivot`, `wherePivotIn`, `wherePivotNotIn`, `wherePivotBetween`, `wherePivotNotBetween`, `wherePivotNull`, `wherePivotNotNull` 등의 메서드를 사용할 수 있습니다.

```
return $this->belongsToMany(Role::class)
    ->wherePivot('approved', 1);

return $this->belongsToMany(Role::class)
    ->wherePivotIn('priority', [1, 2]);

return $this->belongsToMany(Role::class)
    ->wherePivotNotIn('priority', [1, 2]);

return $this->belongsToMany(Podcast::class)
    ->as('subscriptions')
    ->wherePivotBetween('created_at', ['2020-01-01 00:00:00', '2020-12-31 00:00:00']);

return $this->belongsToMany(Podcast::class)
    ->as('subscriptions')
    ->wherePivotNotBetween('created_at', ['2020-01-01 00:00:00', '2020-12-31 00:00:00']);

return $this->belongsToMany(Podcast::class)
    ->as('subscriptions')
    ->wherePivotNull('expired_at');

return $this->belongsToMany(Podcast::class)
    ->as('subscriptions')
    ->wherePivotNotNull('expired_at');
```

`wherePivot`은 쿼리에 where 조건을 추가해주지만, 관계를 통해 새 모델을 생성할 때 지정된 값을 자동으로 추가하지는 않습니다. 쿼리와 생성 모두에 같은 pivot 값을 적용하고 싶다면 `withPivotValue` 메서드를 사용할 수 있습니다.

```
return $this->belongsToMany(Role::class)
        ->withPivotValue('approved', 1);
```

<a name="ordering-queries-via-intermediate-table-columns"></a>
### 중간 테이블 컬럼을 통한 쿼리 정렬

`belongsToMany` 관계 쿼리에서 `orderByPivot` 메서드를 사용해 중간 테이블 컬럼을 기준으로 결과를 정렬할 수 있습니다. 다음 예제는 사용자의 뱃지 중 최신 뱃지를 조회하는 방법을 보여줍니다.

```
return $this->belongsToMany(Badge::class)
    ->where('rank', 'gold')
    ->orderByPivot('created_at', 'desc');
```

<a name="defining-custom-intermediate-table-models"></a>
### 커스텀 중간 테이블(피벗) 모델 정의

다대다 관계의 중간 테이블을 대표하는 커스텀 모델을 별도로 정의하고 싶다면, 관계 정의 시 `using` 메서드를 통해 피벗 모델을 지정할 수 있습니다. 커스텀 피벗 모델을 사용하면, 특정 메서드나 값 변환(cast) 등 부가적인 동작을 추가로 정의할 수 있습니다.

커스텀 다대다 피벗 모델은 `Illuminate\Database\Eloquent\Relations\Pivot` 클래스를 반드시 상속해야 하며, 다형성 다대다 피벗 모델은 `Illuminate\Database\Eloquent\Relations\MorphPivot`을 상속해야 합니다. 예시로, `Role` 모델이 `RoleUser`라는 커스텀 피벗 모델을 사용하는 경우를 살펴봅시다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    /**
     * 이 역할을 가진 사용자들
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)->using(RoleUser::class);
    }
}
```

이제 `RoleUser` 모델을 정의할 때는 `Illuminate\Database\Eloquent\Relations\Pivot` 클래스를 상속해야 합니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class RoleUser extends Pivot
{
    // ...
}
```

> [!WARNING]  
> 피벗(pivot) 모델에서는 `SoftDeletes` 트레이트를 사용할 수 없습니다. 피벗 레코드에 소프트 딜리트 기능이 필요한 경우, 해당 피벗 모델을 실제 Eloquent 모델로 전환하는 것을 고려하세요.

<a name="custom-pivot-models-and-incrementing-ids"></a>
#### 커스텀 피벗 모델과 자동 증가 ID

만약 자동 증가되는(primary key가 auto-increment) 기본키를 가진 커스텀 피벗 모델을 정의한다면, 반드시 해당 피벗 모델 클래스에 `incrementing` 속성을 `true`로 명시해야 합니다.

```
/**
 * ID가 자동 증가하는지 여부를 지정합니다.
 *
 * @var bool
 */
public $incrementing = true;
```

<a name="polymorphic-relationships"></a>
## 다형성 관계(Polymorphic Relationships)

다형성(polymorphic) 관계를 사용하면, 하나의 자식 모델이 단일 연관 컬럼을 통해 여러 타입의 부모 모델과 연결될 수 있습니다. 예를 들어, 블로그 게시글과 동영상을 공유할 수 있는 애플리케이션을 만든다고 가정하면, `Comment` 모델은 `Post` 모델과 `Video` 모델 모두와 연관될 수 있습니다.

<a name="one-to-one-polymorphic-relations"></a>
### 일대일 다형성(One to One Polymorphic)

<a name="one-to-one-polymorphic-table-structure"></a>
#### 테이블 구조

일대일 다형성 관계는 일반적인 일대일(one-to-one) 관계와 유사하지만, 자식 모델이 단일 연관 컬럼을 사용해 여러 타입의 부모 모델과 연관될 수 있다는 점이 다릅니다. 예를 들어, 블로그의 `Post`와 `User`는 공통적으로 `Image` 모델과 다형성 관계를 가질 수 있습니다. 이를 통해 하나의 이미지 테이블을 두고, 게시글이나 유저 모두 특정 이미지에 연결 가능한 구조가 됩니다. 테이블 구조는 다음과 같습니다.

```
posts
    id - integer
    name - string

users
    id - integer
    name - string

images
    id - integer
    url - string
    imageable_id - integer
    imageable_type - string
```

여기서 `images` 테이블의 `imageable_id`, `imageable_type` 컬럼에 주목하세요. `imageable_id` 컬럼은 게시글 혹은 사용자의 ID 값을 저장하고, `imageable_type` 컬럼은 부모 모델의 클래스명을 저장합니다. Eloquent는 이 `imageable_type`을 이용해 어떤 유형의 부모 모델을 가져와야 하는지 결정하며, 예를 들어 이 값이 `App\Models\Post` 또는 `App\Models\User`가 될 수 있습니다.

<a name="one-to-one-polymorphic-model-structure"></a>
#### 모델 구조

이제 이 관계를 구현하기 위해 어떤 모델 정의가 필요한지 살펴봅니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Image extends Model
{
    /**
     * 상위 imageable 모델(사용자 또는 게시글)을 가져옵니다.
     */
    public function imageable(): MorphTo
    {
        return $this->morphTo();
    }
}

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class Post extends Model
{
    /**
     * 게시글의 이미지 가져오기
     */
    public function image(): MorphOne
    {
        return $this->morphOne(Image::class, 'imageable');
    }
}

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class User extends Model
{
    /**
     * 사용자의 이미지 가져오기
     */
    public function image(): MorphOne
    {
        return $this->morphOne(Image::class, 'imageable');
    }
}
```

<a name="one-to-one-polymorphic-retrieving-the-relationship"></a>
#### 관계 조회하기

데이터베이스 테이블과 모델이 준비되었다면, 이제 각 모델의 동적 관계 속성을 활용해 연관 데이터를 조회할 수 있습니다. 예를 들어, 게시글의 이미지를 가져오려면 아래와 같이 접근합니다.

```
use App\Models\Post;

$post = Post::find(1);

$image = $post->image;
```

반대로 다형성 모델의 부모 모델을 조회하려면, `morphTo`를 호출하는 메서드의 이름(여기선 `imageable`)을 동적 속성처럼 사용하면 됩니다.

```
use App\Models\Image;

$image = Image::find(1);

$imageable = $image->imageable;
```

`Image` 모델의 `imageable` 관계는 해당 이미지를 소유한 `Post` 또는 `User` 중 하나의 인스턴스를 반환합니다.

<a name="morph-one-to-one-key-conventions"></a>
#### 키 명명 규칙

필요하다면, 다형성 자식 모델에 사용되는 "id" 및 "type" 컬럼의 이름을 직접 지정할 수도 있습니다. 이 경우 반드시 관계 메서드 이름을 첫 인수로 `morphTo`에 전달해야 하며, 일반적으로는 메서드명과 일치시키기 위해 PHP의 `__FUNCTION__` 상수를 사용할 수 있습니다.

```
/**
 * 이미지가 소속된 모델을 가져옵니다.
 */
public function imageable(): MorphTo
{
    return $this->morphTo(__FUNCTION__, 'imageable_type', 'imageable_id');
}
```

<a name="one-to-many-polymorphic-relations"></a>
### 일대다 다형성(One to Many Polymorphic)

<a name="one-to-many-polymorphic-table-structure"></a>
#### 테이블 구조

일대다 다형성 관계 역시 일반적인 일대다 관계와 유사하지만, 자식 모델이 단일 연관 컬럼을 통해 여러 타입의 부모 모델과 연결될 수 있다는 점이 다릅니다. 예를 들어, 여러분의 애플리케이션에서 사용자가 게시글과 동영상 모두에 "댓글(comment)"을 남길 수 있다고 가정해봅시다. 다형성 관계를 사용하면, 단 하나의 `comments` 테이블이 게시글과 동영상을 모두 참조하는 구조를 만들 수 있습니다. 요구되는 테이블 구조는 다음과 같습니다.

```
posts
    id - integer
    title - string
    body - text

videos
    id - integer
    title - string
    url - string

comments
    id - integer
    body - text
    commentable_id - integer
    commentable_type - string
```

<a name="one-to-many-polymorphic-model-structure"></a>

#### 모델 구조

다음으로, 이 관계를 구축하는 데 필요한 모델 정의를 살펴보겠습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Comment extends Model
{
    /**
     * 부모 commentable 모델(포스트 또는 비디오)을 가져옵니다.
     */
    public function commentable(): MorphTo
    {
        return $this->morphTo();
    }
}

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Post extends Model
{
    /**
     * 이 포스트의 모든 댓글을 가져옵니다.
     */
    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }
}

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Video extends Model
{
    /**
     * 이 비디오의 모든 댓글을 가져옵니다.
     */
    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }
}
```

<a name="one-to-many-polymorphic-retrieving-the-relationship"></a>
#### 관계 조회하기

데이터베이스 테이블과 모델이 정의되면, 모델의 동적 관계 속성을 통해 관계를 조회할 수 있습니다. 예를 들어, 특정 포스트의 모든 댓글을 조회하고 싶다면 `comments` 동적 속성을 사용할 수 있습니다.

```
use App\Models\Post;

$post = Post::find(1);

foreach ($post->comments as $comment) {
    // ...
}
```

다형적(child) 모델에서 부모 모델을 조회할 때는 `morphTo`를 호출하는 메서드명을 동적 속성으로 조회하면 됩니다. 이 예시의 경우 `Comment` 모델의 `commentable` 메서드가 해당합니다. 즉, 이 메서드를 동적 관계 속성으로 접근함으로써 댓글의 부모 모델을 얻을 수 있습니다.

```
use App\Models\Comment;

$comment = Comment::find(1);

$commentable = $comment->commentable;
```

`Comment` 모델의 `commentable` 관계는, 어떤 타입의 모델이 부모인지에 따라 `Post` 인스턴스 또는 `Video` 인스턴스를 반환하게 됩니다.

<a name="polymorphic-automatically-hydrating-parent-models-on-children"></a>
#### 자식 모델에서 부모 모델 자동 바인딩(Hydrating)

Eloquent의 eager loading을 사용하더라도, 자식 모델에서 부모 모델을 반복문 내에서 접근하면 "N + 1" 쿼리 문제가 발생할 수 있습니다.

```php
$posts = Post::with('comments')->get();

foreach ($posts as $post) {
    foreach ($post->comments as $comment) {
        echo $comment->commentable->title;
    }
}
```

위 예시에서는 모든 `Post` 모델에 대해 댓글이 eager load되었음에도 불구하고, 자식 `Comment` 모델에서는 부모 `Post`가 자동으로 hydrate되지 않기 때문에 "N + 1" 쿼리 문제가 발생합니다.

Eloquent가 부모 모델을 자식에게 자동으로 hydrate(연결)하도록 하고 싶다면, `morphMany` 관계를 정의할 때 `chaperone` 메서드를 호출하면 됩니다.

```
class Post extends Model
{
    /**
     * 이 포스트의 모든 댓글을 가져옵니다.
     */
    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable')->chaperone();
    }
}
```

또는 런타임에 자동 부모 바인딩을 직접 opt-in 하고 싶다면, 관계를 eager load할 때 `chaperone` 메서드를 사용할 수 있습니다.

```php
use App\Models\Post;

$posts = Post::with([
    'comments' => fn ($comments) => $comments->chaperone(),
])->get();
```

<a name="one-of-many-polymorphic-relations"></a>
### One of Many (다형적)

하나의 모델이 여러 관련 모델을 가질 수 있지만, 그 중 "가장 최신" 혹은 "가장 오래된" 모델을 쉽게 조회하고 싶을 때가 있습니다. 예를 들어 `User` 모델이 여러 `Image` 모델과 관계를 맺고 있지만, 사용자가 마지막으로 업로드한 이미지를 편리하게 조회하고 싶을 수 있습니다. 이런 경우 `morphOne` 관계 타입과 `ofMany` 메서드를 조합하여 사용할 수 있습니다.

```php
/**
 * 사용자의 가장 최신 이미지를 가져옵니다.
 */
public function latestImage(): MorphOne
{
    return $this->morphOne(Image::class, 'imageable')->latestOfMany();
}
```

이와 비슷하게, "가장 오래된" 혹은 첫 번째 관련 모델을 조회하는 메서드를 정의할 수도 있습니다.

```php
/**
 * 사용자의 가장 오래된 이미지를 가져옵니다.
 */
public function oldestImage(): MorphOne
{
    return $this->morphOne(Image::class, 'imageable')->oldestOfMany();
}
```

기본적으로, `latestOfMany`와 `oldestOfMany` 메서드는 모델의 기본 키(primary key, 정렬 가능한 값)를 기준으로 최신 혹은 오래된 관련 모델을 가져옵니다. 하지만, 더 다양한 정렬 기준으로 단일 모델을 조회하고 싶을 때도 있습니다.

예를 들어, `ofMany` 메서드를 사용하면 사용자의 "좋아요"가 가장 많은 이미지를 가져올 수 있습니다. `ofMany` 메서드는 첫 번째 인수로 정렬할 컬럼명을, 두 번째 인수로 집계 함수(`min` 또는 `max`)를 받습니다.

```php
/**
 * 사용자의 가장 인기 있는 이미지를 가져옵니다.
 */
public function bestImage(): MorphOne
{
    return $this->morphOne(Image::class, 'imageable')->ofMany('likes', 'max');
}
```

> [!NOTE]  
> 보다 고급스러운 "one of many" 관계도 구성할 수 있습니다. 자세한 내용은 [has one of many 문서](#advanced-has-one-of-many-relationships)를 참고하시기 바랍니다.

<a name="many-to-many-polymorphic-relations"></a>
### 다대다(Polymorphic) 관계

<a name="many-to-many-polymorphic-table-structure"></a>
#### 테이블 구조

다대다(polymorphic) 관계는 "morph one"이나 "morph many" 관계보다 약간 더 복잡합니다. 예를 들어, `Post` 모델과 `Video` 모델이 공통의 다형적 관계를 통해 `Tag` 모델과 연결될 수 있습니다. 이렇게 하면, 포스트나 비디오에 공통적으로 태그를 단일 테이블에 저장하여 재활용할 수 있습니다. 먼저, 이 관계를 구성하기 위한 테이블 구조를 살펴보겠습니다.

```
posts
    id - integer
    name - string

videos
    id - integer
    name - string

tags
    id - integer
    name - string

taggables
    tag_id - integer
    taggable_id - integer
    taggable_type - string
```

> [!NOTE]  
> 다형 다대다 관계를 본격적으로 다루기 전에 일반적인 [many-to-many 관계](#many-to-many)에 대한 문서를 읽어보시면 도움이 됩니다.

<a name="many-to-many-polymorphic-model-structure"></a>
#### 모델 구조

다음으로, 각 모델에 관계를 정의합니다. `Post`와 `Video` 모델 모두 Eloquent 기반 클래스가 제공하는 `morphToMany` 메서드를 사용하는 `tags` 메서드를 포함하게 됩니다.

`morphToMany` 메서드는 관계맺을 모델명과 "관계 이름"을 인수로 받습니다. 중간 테이블명과 포함된 키명에 따라 관계 이름은 "taggable"로 지정합니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class Post extends Model
{
    /**
     * 이 포스트의 모든 태그를 가져옵니다.
     */
    public function tags(): MorphToMany
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }
}
```

<a name="many-to-many-polymorphic-defining-the-inverse-of-the-relationship"></a>
#### 관계의 반대(Inverse) 정의하기

이번에는 `Tag` 모델에서 각각의 부모 모델에 대해 메서드를 정의해야 합니다. 이 예시에서는 `posts` 메서드와 `videos` 메서드를 정의하게 되며, 두 메서드 모두 `morphedByMany` 메서드를 반환해야 합니다.

`morphedByMany` 메서드는 관계맺을 모델명과 "관계 이름"을 인수로 받습니다. 관계명은 "taggable"로 지정합니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class Tag extends Model
{
    /**
     * 이 태그가 지정된 모든 포스트를 가져옵니다.
     */
    public function posts(): MorphToMany
    {
        return $this->morphedByMany(Post::class, 'taggable');
    }

    /**
     * 이 태그가 지정된 모든 비디오를 가져옵니다.
     */
    public function videos(): MorphToMany
    {
        return $this->morphedByMany(Video::class, 'taggable');
    }
}
```

<a name="many-to-many-polymorphic-retrieving-the-relationship"></a>
#### 관계 조회하기

데이터베이스 테이블과 모델이 정의되면, 모델을 통해 관계를 조회할 수 있습니다. 예를 들어, 포스트의 모든 태그를 가져오고 싶다면 `tags` 동적 속성을 사용할 수 있습니다.

```
use App\Models\Post;

$post = Post::find(1);

foreach ($post->tags as $tag) {
    // ...
}
```

다형적 관계의 자식 모델에서 부모 모델을 조회할 때는 `morphedByMany`를 호출하는 메서드명을 이용합니다. 이번 예시에서는 `Tag` 모델의 `posts` 또는 `videos` 메서드가 해당합니다.

```
use App\Models\Tag;

$tag = Tag::find(1);

foreach ($tag->posts as $post) {
    // ...
}

foreach ($tag->videos as $video) {
    // ...
}
```

<a name="custom-polymorphic-types"></a>
### 사용자 정의 다형 타입(Custom Polymorphic Types)

라라벨에서 "타입" 정보를 저장할 때는 기본적으로 완전히 네임스페이스가 적용된 클래스명을 사용합니다. 예를 들어, 앞서 다룬 일대다 관계 예시에서 `Comment` 모델이 `Post` 또는 `Video`에 속해 있을 경우, 기본적으로 `commentable_type` 컬럼에는 각각 `App\Models\Post` 또는 `App\Models\Video`가 저장됩니다. 하지만 모델명과 내부 구조를 분리하고 싶을 때도 있습니다.

예를 들어, 타입 정보로 모델명이 아닌 간단한 문자열(`post`, `video`)을 사용할 수 있습니다. 이렇게 하면, 모델명을 변경해도 데이터베이스의 다형 타입 컬럼 값이 유효하게 유지됩니다.

```
use Illuminate\Database\Eloquent\Relations\Relation;

Relation::enforceMorphMap([
    'post' => 'App\Models\Post',
    'video' => 'App\Models\Video',
]);
```

`enforceMorphMap` 메서드는 `App\Providers\AppServiceProvider`의 `boot` 메서드에서 호출하거나, 필요하다면 별도의 서비스 프로바이더에서 호출할 수도 있습니다.

런타임에 모델별로 morph alias를 알아내고 싶다면 모델의 `getMorphClass` 메서드를 사용할 수 있습니다. 반대로, morph alias로부터 완전한 클래스명을 얻으려면 `Relation::getMorphedModel` 메서드를 이용할 수 있습니다.

```
use Illuminate\Database\Eloquent\Relations\Relation;

$alias = $post->getMorphClass();

$class = Relation::getMorphedModel($alias);
```

> [!WARNING]  
> 기존 애플리케이션에 "morph map"을 추가할 경우, 데이터베이스 내 morphable `*_type` 컬럼 값 중 클래스명을 포함하는 값들은 반드시 "맵"에 사용된 이름으로 변환해주어야 합니다.

<a name="dynamic-relationships"></a>
### 동적 관계(Dynamic Relationships)

`resolveRelationUsing` 메서드를 사용하면 Eloquent 모델 간의 관계를 런타임 시점에 정의할 수 있습니다. 일반적인 애플리케이션 개발에서는 자주 사용하지 않지만, 라라벨 패키지 개발 시에는 유용할 수 있습니다.

`resolveRelationUsing` 메서드는 첫 번째 인수로 관계명을, 두 번째 인수로 모델 인스턴스를 받아 유효한 Eloquent 관계를 반환하는 클로저를 받습니다. 보통 동적 관계는 [서비스 프로바이더](/docs/11.x/providers)의 boot 메서드에서 설정합니다.

```
use App\Models\Order;
use App\Models\Customer;

Order::resolveRelationUsing('customer', function (Order $orderModel) {
    return $orderModel->belongsTo(Customer::class, 'customer_id');
});
```

> [!WARNING]  
> 동적 관계를 정의할 때는 항상 Eloquent 관계 메서드에 명시적으로 키 이름을 전달해 주어야 합니다.

<a name="querying-relations"></a>
## 관계(relationship) 쿼리하기

모든 Eloquent 관계는 메서드 형태로 정의되어 있기 때문에, 실제 쿼리를 실행하지 않고도 해당 관계 인스턴스를 얻을 수 있습니다. 또한 모든 Eloquent 관계는 [쿼리 빌더](/docs/11.x/queries)의 역할도 하며, 관계 쿼리에 다양한 제약 조건을 체이닝한 후 최종적으로 SQL 쿼리를 실행할 수 있습니다.

예를 들어, 블로그 애플리케이션에서 `User` 모델이 여러 `Post` 모델과 관계를 가진다고 가정해봅니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Model
{
    /**
     * 사용자의 모든 포스트를 가져옵니다.
     */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }
}
```

`posts` 관계에 쿼리 조건을 추가하려면 아래와 같이 하면 됩니다.

```
use App\Models\User;

$user = User::find(1);

$user->posts()->where('active', 1)->get();
```

모든 라라벨 [쿼리 빌더](/docs/11.x/queries) 메서드는 관계 쿼리에도 사용할 수 있으므로, 쿼리 빌더 문서를 참고해 다양한 메서드를 활용하시기 바랍니다.

<a name="chaining-orwhere-clauses-after-relationships"></a>
#### 관계 쿼리에서 `orWhere` 절 체이닝 하기

위 예시처럼 관계 쿼리에 추가로 제약 조건을 붙일 수 있지만, `orWhere` 절을 체이닝할 때는 주의가 필요합니다. `orWhere` 절은 관계 제약과 논리적으로 동일 레벨에서 그룹화되기 때문입니다.

```
$user->posts()
        ->where('active', 1)
        ->orWhere('votes', '>=', 100)
        ->get();
```

위 예시는 다음과 같은 SQL을 생성합니다. `or` 절에 의해 100표 이상인 모든 포스트가 반환되므로, 쿼리가 특정 사용자에 한정되지 않게 됩니다.

```sql
select *
from posts
where user_id = ? and active = 1 or votes >= 100
```

대부분의 상황에서는 [논리 그룹](https://laravel.com/docs/11.x/queries#logical-grouping)을 사용하여 조건을 괄호로 묶어주어야 합니다.

```
use Illuminate\Database\Eloquent\Builder;

$user->posts()
    ->where(function (Builder $query) {
        return $query->where('active', 1)
            ->orWhere('votes', '>=', 100);
    })
    ->get();
```

위 방식에서는 다음과 같은 SQL이 생성되어, 논리 그룹이 올바르게 처리되고 쿼리 결과가 특정 사용자에 한정됩니다.

```sql
select *
from posts
where user_id = ? and (active = 1 or votes >= 100)
```

<a name="relationship-methods-vs-dynamic-properties"></a>
### 관계 메서드와 동적 속성의 차이

Eloquent 관계 쿼리에 추가 제약 조건을 줄 필요가 없다면, 기껏 쿼리 메서드를 호출할 필요 없이 관계를 속성처럼 접근할 수 있습니다. 예를 들어 `User`와 `Post` 예시에서, 사용자 모든 포스트를 아래와 같이 간단하게 조회할 수 있습니다.

```
use App\Models\User;

$user = User::find(1);

foreach ($user->posts as $post) {
    // ...
}
```

동적 관계 속성은 "지연 로딩(lazy loading)" 방식으로 동작합니다. 즉, 실제로 속성에 접근할 때에만 관련 데이터가 쿼리되어 가져옵니다. 이런 이유로, 모델을 미리 로딩한 뒤 곧바로 관계 데이터를 사용할 경우 [eager loading](#eager-loading)을 자주 활용합니다. eager loading은 쿼리 수를 크게 줄여 주므로 성능에 많은 도움이 됩니다.

<a name="querying-relationship-existence"></a>
### 관계 존재 쿼리(Querying Relationship Existence)

모델 레코드를 조회할 때, 특정 관계가 존재하는 경우에만 결과를 제한하고 싶을 수 있습니다. 예를 들어, 최소한 하나 이상의 댓글이 달린 모든 블로그 포스트를 조회하려면, `has` 또는 `orHas` 메서드에 관계명을 인수로 전달하면 됩니다.

```
use App\Models\Post;

// 최소 하나 이상의 댓글이 달린 모든 포스트 조회...
$posts = Post::has('comments')->get();
```

연산자와 수치를 추가로 지정해 조건을 더욱 세밀하게 커스터마이징할 수도 있습니다.

```
// 3개 이상의 댓글이 달린 모든 포스트 조회...
$posts = Post::has('comments', '>=', 3)->get();
```

중첩된 `has` 조건은 "닷(dot) 표기법"을 이용해 만들 수 있습니다. 예를 들어, 최소한 하나의 댓글이 있으면서 그 댓글에 최소 하나의 이미지가 있는 포스트를 조회하려면:

```
// 댓글이 있고, 그 댓글이 이미지를 가지고 있는 포스트를 조회...
$posts = Post::has('comments.images')->get();
```

더 강력한 쿼리가 필요하다면, `has` 쿼리 안에서 관계의 내용을 검사할 수 있도록 `whereHas` 또는 `orWhereHas` 메서드를 사용할 수 있습니다. 예를 들면:

```
use Illuminate\Database\Eloquent\Builder;

// "code%"로 시작하는 콘텐츠가 있는 댓글을 하나 이상 가진 포스트 조회...
$posts = Post::whereHas('comments', function (Builder $query) {
    $query->where('content', 'like', 'code%');
})->get();

// "code%"로 시작하는 콘텐츠가 있는 댓글을 10개 이상 가진 포스트 조회...
$posts = Post::whereHas('comments', function (Builder $query) {
    $query->where('content', 'like', 'code%');
}, '>=', 10)->get();
```

> [!WARNING]  
> Eloquent에서는 현재 다른 데이터베이스 간 관계 존재 쿼리를 지원하지 않습니다. 관계 모델은 반드시 동일한 데이터베이스 내에 존재해야 합니다.

<a name="inline-relationship-existence-queries"></a>
#### 인라인 관계 존재 쿼리

관계의 존재를 간단한 단일 where 조건과 함께 쿼리하고 싶을 때는 `whereRelation`, `orWhereRelation`, `whereMorphRelation`, `orWhereMorphRelation` 메서드가 더욱 편리할 수 있습니다. 예를 들어, 승인되지 않은(unapproved) 댓글이 달린 모든 포스트를 조회하는 예시는 아래와 같습니다.

```
use App\Models\Post;

$posts = Post::whereRelation('comments', 'is_approved', false)->get();
```

물론, `where` 메서드와 마찬가지로 연산자도 지정할 수 있습니다.

```
$posts = Post::whereRelation(
    'comments', 'created_at', '>=', now()->subHour()
)->get();
```

<a name="querying-relationship-absence"></a>
### 관계 부재 쿼리(Querying Relationship Absence)

반대로, 특정 관계가 "존재하지 않는" 결과만 조회하고 싶은 경우도 있습니다. 예를 들어, **댓글이 하나도 없는** 모든 블로그 포스트를 조회하려면 `doesntHave`나 `orDoesntHave` 메서드에 관계명을 전달하면 됩니다.

```
use App\Models\Post;

$posts = Post::doesntHave('comments')->get();
```

더 고급 쿼리가 필요하다면, `doesntHave` 쿼리 내에서 관계 내용을 검사할 수 있도록 `whereDoesntHave` 또는 `orWhereDoesntHave` 메서드를 사용할 수 있습니다.

```
use Illuminate\Database\Eloquent\Builder;

$posts = Post::whereDoesntHave('comments', function (Builder $query) {
    $query->where('content', 'like', 'code%');
})->get();
```

"닷(dot) 표기법"을 사용하면 중첩 관계에도 쿼리를 실행할 수 있습니다. 아래 쿼리는 댓글이 전혀 없는 포스트를 조회하는데, "댓글 작성자가 밴(banned)되지 않은" 경우에는 해당 포스트도 결과에 포함된다는 점에 유의해야 합니다.

```
use Illuminate\Database\Eloquent\Builder;

$posts = Post::whereDoesntHave('comments.author', function (Builder $query) {
    $query->where('banned', 0);
})->get();
```

<a name="querying-morph-to-relationships"></a>
### Morph To 관계 쿼리하기

"Morph To" 관계의 존재 여부를 쿼리할 때는 `whereHasMorph`와 `whereDoesntHaveMorph` 메서드를 사용할 수 있습니다. 이 메서드는 첫 번째 인수로 관계명을, 그 다음 인수로 쿼리에 포함시킬 관련 모델명을, 그리고 마지막으로 관계 쿼리를 커스터마이징하기 위한 클로저를 받습니다.

```
use App\Models\Comment;
use App\Models\Post;
use App\Models\Video;
use Illuminate\Database\Eloquent\Builder;

// 포스트나 비디오 중 제목이 'code%'로 시작하는 콘텐츠와 연관된 모든 댓글을 조회...
$comments = Comment::whereHasMorph(
    'commentable',
    [Post::class, Video::class],
    function (Builder $query) {
        $query->where('title', 'like', 'code%');
    }
)->get();

// 포스트 중 제목이 'code%'로 시작하지 않는 것과 연관된 모든 댓글을 조회...
$comments = Comment::whereDoesntHaveMorph(
    'commentable',
    Post::class,
    function (Builder $query) {
        $query->where('title', 'like', 'code%');
    }
)->get();
```

경우에 따라 다형적(parent) 모델의 "타입"에 따라 추가 쿼리 조건을 지정하고 싶을 수도 있습니다. 이럴 때는 `whereHasMorph`에 넘기는 클로저의 두 번째 인수로 `$type` 값을 받을 수 있습니다. 이 값을 이용해 해당 쿼리 대상의 타입에 따라 컬럼이나 조건을 다르게 지정할 수 있습니다.

```
use Illuminate\Database\Eloquent\Builder;

$comments = Comment::whereHasMorph(
    'commentable',
    [Post::class, Video::class],
    function (Builder $query, string $type) {
        $column = $type === Post::class ? 'content' : 'title';

        $query->where($column, 'like', 'code%');
    }
)->get();
```

경우에 따라 "morph to" 관계의 부모로부터 자식들을 조회하고 싶을 때가 있습니다. 이런 경우에는 `whereMorphedTo`와 `whereNotMorphedTo` 메서드를 활용하면, 해당 모델에 맞는 morph 타입을 자동으로 매핑하여 쿼리를 실행합니다. 이 메서드는 첫 번째 인수로 `morphTo` 관계명, 두 번째 인수로 부모 모델을 받습니다.

```
$comments = Comment::whereMorphedTo('commentable', $post)
    ->orWhereMorphedTo('commentable', $video)
    ->get();
```

<a name="querying-all-morph-to-related-models"></a>

#### 모든 관련 모델 조회

복수의 다형적(polymorphic) 모델 배열 대신, `*`를 와일드카드(wildcard) 값으로 전달할 수 있습니다. 이렇게 하면 라라벨이 데이터베이스에서 가능한 모든 다형적 타입을 조회하도록 지시합니다. 이 작업을 위해 라라벨은 추가 쿼리를 실행하게 됩니다.

```
use Illuminate\Database\Eloquent\Builder;

$comments = Comment::whereHasMorph('commentable', '*', function (Builder $query) {
    $query->where('title', 'like', 'foo%');
})->get();
```

<a name="aggregating-related-models"></a>
## 관련 모델 합계 집계

<a name="counting-related-models"></a>
### 관련 모델 수 세기

특정 관계에 대해 실제로 모델을 로드하지 않고도 관련 모델의 개수를 세고 싶을 때가 있습니다. 이럴 때는 `withCount` 메서드를 사용할 수 있습니다. `withCount` 메서드는 결과 모델에 `{relation}_count` 속성을 추가합니다.

```
use App\Models\Post;

$posts = Post::withCount('comments')->get();

foreach ($posts as $post) {
    echo $post->comments_count;
}
```

`withCount` 메서드에 배열을 전달하면 여러 관계의 "개수"를 추가할 수 있으며, 쿼리에 추가 제약도 걸 수 있습니다.

```
use Illuminate\Database\Eloquent\Builder;

$posts = Post::withCount(['votes', 'comments' => function (Builder $query) {
    $query->where('content', 'like', 'code%');
}])->get();

echo $posts[0]->votes_count;
echo $posts[0]->comments_count;
```

또한 관계의 개수 결과에 별칭(alias)을 지정할 수 있어, 같은 관계에 여러 개수를 집계할 수도 있습니다.

```
use Illuminate\Database\Eloquent\Builder;

$posts = Post::withCount([
    'comments',
    'comments as pending_comments_count' => function (Builder $query) {
        $query->where('approved', false);
    },
])->get();

echo $posts[0]->comments_count;
echo $posts[0]->pending_comments_count;
```

<a name="deferred-count-loading"></a>
#### 지연 카운트 로딩

`loadCount` 메서드를 사용하면 상위(parent) 모델을 이미 조회한 이후에도 관계의 개수를 로드할 수 있습니다.

```
$book = Book::first();

$book->loadCount('genres');
```

카운트 쿼리에 추가 조건을 걸어야 할 때는, 카운트하고 싶은 관계명을 키로 지정한 배열을 전달합니다. 배열의 값은 쿼리 빌더 인스턴스를 받는 클로저여야 합니다.

```
$book->loadCount(['reviews' => function (Builder $query) {
    $query->where('rating', 5);
}])
```

<a name="relationship-counting-and-custom-select-statements"></a>
#### 관계 개수 집계와 커스텀 select 문

`withCount`를 `select` 문과 함께 사용할 경우, 반드시 `select` 메서드 호출 이후에 `withCount`를 호출해야 합니다.

```
$posts = Post::select(['title', 'body'])
    ->withCount('comments')
    ->get();
```

<a name="other-aggregate-functions"></a>
### 기타 집계 함수

`withCount` 메서드 외에도, Eloquent는 `withMin`, `withMax`, `withAvg`, `withSum`, `withExists` 등의 메서드를 제공합니다. 이 메서드들은 결과 모델 객체에 `{relation}_{function}_{column}` 형식의 속성을 추가합니다.

```
use App\Models\Post;

$posts = Post::withSum('comments', 'votes')->get();

foreach ($posts as $post) {
    echo $post->comments_sum_votes;
}
```

집계 함수의 결과를 다른 이름으로 사용하고 싶을 경우, 별칭을 지정할 수 있습니다.

```
$posts = Post::withSum('comments as total_comments', 'votes')->get();

foreach ($posts as $post) {
    echo $post->total_comments;
}
```

`loadCount` 메서드처럼, 이미 조회한 Eloquent 모델에서 지연 집계 작업을 할 수도 있습니다.

```
$post = Post::first();

$post->loadSum('comments', 'votes');
```

이러한 집계 메서드를 `select` 문과 함께 사용할 때는, 반드시 `select` 후에 집계 메서드를 호출해야 합니다.

```
$posts = Post::select(['title', 'body'])
    ->withExists('comments')
    ->get();
```

<a name="counting-related-models-on-morph-to-relationships"></a>
### Morph To 관계의 관련 모델 개수 세기

`morph to` 관계와, 해당 관계로 반환될 수 있는 여러 엔티티의 관련 모델 개수도 사전 로딩(eager load)하고 싶을 때가 있습니다. 이 경우, `with` 메서드와 `morphTo` 관계의 `morphWithCount` 메서드를 조합해 사용할 수 있습니다.

이 예제에서는 `Photo` 모델과 `Post` 모델이 `ActivityFeed` 모델을 생성한다고 가정합니다. 그리고 `ActivityFeed` 모델에 `parentable`이라는 `morph to` 관계가 정의되어 있다고 가정하면, 이는 특정 `ActivityFeed` 인스턴스에 대해 부모 `Photo` 또는 `Post` 모델을 가져올 수 있게 해줍니다. 또한, `Photo` 모델은 다수의 `Tag` 모델과, `Post` 모델은 다수의 `Comment` 모델과 연관되어 있다고 가정합니다.

이제 여러 `ActivityFeed` 인스턴스를 조회하면서 각각의 부모 모델(`parentable`)을 eager load하고, 해당 부모 포토의 태그 개수와, 부모 포스트의 코멘트 개수도 함께 가져오고자 한다면 아래와 같이 할 수 있습니다.

```
use Illuminate\Database\Eloquent\Relations\MorphTo;

$activities = ActivityFeed::with([
    'parentable' => function (MorphTo $morphTo) {
        $morphTo->morphWithCount([
            Photo::class => ['tags'],
            Post::class => ['comments'],
        ]);
    }])->get();
```

<a name="morph-to-deferred-count-loading"></a>
#### 지연 카운트 로딩

이미 여러 `ActivityFeed` 모델을 조회했다면, 이후에 이들에 연결된 각기 다른 `parentable` 모델의 내부 관계(태그/댓글 등) 개수도 로드하고 싶을 수 있습니다. 이를 위해 `loadMorphCount` 메서드를 사용할 수 있습니다.

```
$activities = ActivityFeed::with('parentable')->get();

$activities->loadMorphCount('parentable', [
    Photo::class => ['tags'],
    Post::class => ['comments'],
]);
```

<a name="eager-loading"></a>
## 사전 로딩(eager loading)

Eloquent 관계를 프로퍼티처럼 접근하면, 관련 모델은 "지연 로드(lazy loaded)"됩니다. 즉, 관계 데이터를 처음 접근하기 전까지는 실제로 로드되지 않습니다. 하지만, 부모 모델을 쿼리할 때 `사전 로딩(eager loading)`을 할 수도 있습니다. 사전 로딩은 이른바 "N + 1" 쿼리 문제를 해결합니다. N + 1 쿼리 문제를 보여주는 예로, `Book` 모델이 `Author` 모델에 "belongs to" 관계를 맺고 있다고 가정해봅니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Book extends Model
{
    /**
     * Get the author that wrote the book.
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(Author::class);
    }
}
```

이제 모든 책과 저자의 정보를 조회한다고 해봅니다.

```
use App\Models\Book;

$books = Book::all();

foreach ($books as $book) {
    echo $book->author->name;
}
```

이 루프는 우선 전체 책 목록을 한 번 쿼리하고, 각 책의 저자를 각각 개별 쿼리로 가져옵니다. 만약 25권의 책이 있다면, 위 코드는 총 26번의 쿼리(책 1번 + 책마다 저자 25번)를 실행합니다.

다행히도, 사전 로딩을 사용하면 쿼리를 단 2번으로 줄일 수 있습니다. 쿼리를 작성할 때 사전에 로딩하고 싶은 관계를 `with` 메서드로 지정하면 됩니다.

```
$books = Book::with('author')->get();

foreach ($books as $book) {
    echo $book->author->name;
}
```

이 과정에서는 단 2번의 쿼리만 실행됩니다. 첫 번째는 모든 책을, 두 번째는 모든 책에 해당하는 저자들을 한 번에 가져오는 쿼리입니다.

```sql
select * from books

select * from authors where id in (1, 2, 3, 4, 5, ...)
```

<a name="eager-loading-multiple-relationships"></a>
#### 여러 관계 동시 사전 로딩

한 번에 여러 관계를 사전 로딩하고 싶다면, `with` 메서드에 관계명을 배열로 전달하면 됩니다.

```
$books = Book::with(['author', 'publisher'])->get();
```

<a name="nested-eager-loading"></a>
#### 중첩 사전 로딩(Nested Eager Loading)

관계의 관계, 즉 중첩 관계까지 사전 로딩하고 싶을 경우 "dot" 문법을 사용할 수 있습니다. 예를 들어, 모든 책의 저자와, 또 저자의 연락처(personal contacts)까지 한 번에 가져오려면 아래와 같이 작성합니다.

```
$books = Book::with('author.contacts')->get();
```

또는 사전 로딩할 중첩 관계가 많다면, `with` 메서드에 중첩 배열을 사용할 수도 있습니다. 이 방법은 여러 단계의 관계를 더욱 명확하게 작성할 때 유용합니다.

```
$books = Book::with([
    'author' => [
        'contacts',
        'publisher',
    ],
])->get();
```

<a name="nested-eager-loading-morphto-relationships"></a>
#### `morphTo` 관계의 중첩 사전 로딩

`morphTo` 관계와, 해당 관계로 반환될 수 있는 다양한 엔티티의 중첩 관계 역시 사전 로딩하고 싶을 수 있습니다. 이럴 땐 `with` 메서드를 `morphTo` 관계의 `morphWith` 메서드와 조합해 사용합니다. 이해를 돕기 위해 아래와 같은 모델 구조를 생각해봅니다.

```
<?php

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ActivityFeed extends Model
{
    /**
     * Get the parent of the activity feed record.
     */
    public function parentable(): MorphTo
    {
        return $this->morphTo();
    }
}
```

이 예시에서는 `Event`, `Photo`, `Post` 모델이 모두 `ActivityFeed` 모델을 생성할 수 있다고 가정합니다. 또한, `Event` 모델은 `Calendar` 모델과, `Photo`는 `Tag` 모델과, `Post`는 `Author` 모델과 각각 관계가 있다고 가정합니다.

이런 모델 구조를 바탕으로, `ActivityFeed` 모델 인스턴스를 가져오면서 각 `parentable` 모델과, 그에 대한 중첩 관계까지 모두 사전 로딩하고 싶다면 아래와 같이 하면 됩니다.

```
use Illuminate\Database\Eloquent\Relations\MorphTo;

$activities = ActivityFeed::query()
    ->with(['parentable' => function (MorphTo $morphTo) {
        $morphTo->morphWith([
            Event::class => ['calendar'],
            Photo::class => ['tags'],
            Post::class => ['author'],
        ]);
    }])->get();
```

<a name="eager-loading-specific-columns"></a>
#### 사전 로딩시 특정 컬럼만 조회

관계에서 모든 컬럼이 필요하지 않을 수도 있습니다. 이런 경우, Eloquent의 기능을 사용해 원하는 컬럼만 선택적으로 가져올 수 있습니다.

```
$books = Book::with('author:id,name,book_id')->get();
```

> [!WARNING]  
> 이 기능을 사용할 때는 반드시 `id` 컬럼과, 필요한 경우 외래 키(foreign key) 컬럼도 목록에 포함해야 합니다.

<a name="eager-loading-by-default"></a>
#### 기본적으로 관계 사전 로딩하기

특정 모델을 조회할 때 항상 일부 관계도 함께 로드하고 싶다면, 모델에 `$with` 프로퍼티를 정의하면 됩니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Book extends Model
{
    /**
     * The relationships that should always be loaded.
     *
     * @var array
     */
    protected $with = ['author'];

    /**
     * Get the author that wrote the book.
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(Author::class);
    }

    /**
     * Get the genre of the book.
     */
    public function genre(): BelongsTo
    {
        return $this->belongsTo(Genre::class);
    }
}
```

단일 쿼리에서 `$with` 프로퍼티에 등록된 관계 중 일부만 제거하고 싶을 때는 `without` 메서드를 사용할 수 있습니다.

```
$books = Book::without('author')->get();
```

특정 쿼리에서 `$with`에 포함된 모든 관계를 대체하고 싶으면, `withOnly` 메서드를 사용합니다.

```
$books = Book::withOnly('genre')->get();
```

<a name="constraining-eager-loads"></a>
### 사전 로딩 쿼리 제약조건 추가

관계를 eager load 하면서 쿼리에 추가 제약조건도 걸고 싶을 때가 있습니다. 이럴 때는 `with` 메서드에 관계명과 함께, 추가 제약조건을 정의한 클로저를 값으로 가지는 배열을 전달하면 됩니다.

```
use App\Models\User;
use Illuminate\Contracts\Database\Eloquent\Builder;

$users = User::with(['posts' => function (Builder $query) {
    $query->where('title', 'like', '%code%');
}])->get();
```

이 예제에서는 게시글의 `title` 컬럼에 `code`라는 단어가 포함된 경우에만 posts 관계가 eager load 됩니다. [쿼리 빌더](/docs/11.x/queries)에서 제공하는 다른 메서드도 자유롭게 사용할 수 있습니다.

```
$users = User::with(['posts' => function (Builder $query) {
    $query->orderBy('created_at', 'desc');
}])->get();
```

<a name="constraining-eager-loading-of-morph-to-relationships"></a>
#### `morphTo` 관계의 사전 로딩 쿼리 제약

`morphTo` 관계를 eager load 할 때, Eloquent는 각 관련 모델 타입마다 각각 쿼리를 실행합니다. 각 쿼리에 추가 조건을 걸고 싶다면, `MorphTo` 관계의 `constrain` 메서드를 사용할 수 있습니다.

```
use Illuminate\Database\Eloquent\Relations\MorphTo;

$comments = Comment::with(['commentable' => function (MorphTo $morphTo) {
    $morphTo->constrain([
        Post::class => function ($query) {
            $query->whereNull('hidden_at');
        },
        Video::class => function ($query) {
            $query->where('type', 'educational');
        },
    ]);
}])->get();
```

위 예제의 경우, Eloquent는 숨김(`hidden_at` 값이 null)되지 않은 포스트와, `type` 값이 "educational"인 비디오만 eager load 합니다.

<a name="constraining-eager-loads-with-relationship-existence"></a>
#### 관계 존재 조건으로 사전 로딩 제약

관계의 존재 여부를 체크하면서 동시에 동일 조건으로 관계를 eager load 해야 하는 경우도 있습니다. 예를 들어, 특정 조건을 만족하는 하위 게시글(Post)이 존재하는 User만 조회하면서, 조건에 맞는 posts만 함께 eager load하고 싶을 때는 `withWhereHas` 메서드를 활용할 수 있습니다.

```
use App\Models\User;

$users = User::withWhereHas('posts', function ($query) {
    $query->where('featured', true);
})->get();
```

<a name="lazy-eager-loading"></a>
### 지연 사전 로딩(Lazy Eager Loading)

이미 상위(parent) 모델을 조회한 후에 관계를 사전 로딩해야 할 때도 있습니다. 예를 들어, 관계 데이터를 로드할 필요가 있는지 동적으로 결정해야 할 경우에 유용합니다.

```
use App\Models\Book;

$books = Book::all();

if ($someCondition) {
    $books->load('author', 'publisher');
}
```

eager loading 쿼리에 추가 제약을 걸고 싶다면, 로드하고 싶은 관계명을 키로 한 배열을 전달하면 됩니다. 배열의 값은 쿼리 인스턴스를 받는 클로저여야 합니다.

```
$author->load(['books' => function (Builder $query) {
    $query->orderBy('published_date', 'asc');
}]);
```

관계가 아직 로드되지 않은 경우에만 로드하려면, `loadMissing` 메서드를 사용하세요.

```
$book->loadMissing('author');
```

<a name="nested-lazy-eager-loading-morphto"></a>
#### 중첩 지연 로딩과 `morphTo`

`morphTo` 관계와, 해당 관계로 반환될 수 있는 여러 엔티티의 중첩 관계까지 지연 로딩하고 싶을 경우 `loadMorph` 메서드를 사용할 수 있습니다.

이 메서드는 첫 번째 인자로 `morphTo` 관계명을, 두 번째 인자로 모델/관계 쌍의 배열을 받습니다. 이해를 돕기 위해 아래와 같은 모델 구조를 참고하세요.

```
<?php

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ActivityFeed extends Model
{
    /**
     * Get the parent of the activity feed record.
     */
    public function parentable(): MorphTo
    {
        return $this->morphTo();
    }
}
```

예를 들어, `Event`, `Photo`, `Post` 모델이 모두 `ActivityFeed`를 만들 수 있고, 각각이 다른 관계(`calendar`, `tags`, `author`)를 가진다고 가정합니다.

이 경우, 다음과 같이 `ActivityFeed` 모델 인스턴스를 조회한 후 각 parentable 모델의 중첩 관계도 모두 지연 로딩할 수 있습니다.

```
$activities = ActivityFeed::with('parentable')
    ->get()
    ->loadMorph('parentable', [
        Event::class => ['calendar'],
        Photo::class => ['tags'],
        Post::class => ['author'],
    ]);
```

<a name="preventing-lazy-loading"></a>
### 지연 로딩 차단

앞서 언급했듯, 관계의 사전 로딩은 애플리케이션 성능에 큰 도움이 됩니다. 따라서, 원한다면 라라벨이 관계의 지연 로딩을 아예 차단하도록 만들 수도 있습니다. 이를 위해서는 기본 Eloquent 모델 클래스가 제공하는 `preventLazyLoading` 메서드를 사용하세요. 일반적으로 이 메서드는 애플리케이션의 `AppServiceProvider` 클래스의 `boot` 메서드에서 호출하게 됩니다.

`preventLazyLoading` 메서드는 옵션으로 불리언 값을 받을 수 있으며, 이 값에 따라 지연 로딩 금지 여부를 제어합니다. 예를 들어, 운영 환경(production) 이외에서만 지연 로딩을 차단하고 싶다면 아래처럼 작성할 수 있습니다.

```php
use Illuminate\Database\Eloquent\Model;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Model::preventLazyLoading(! $this->app->isProduction());
}
```

지연 로딩이 차단된 상태에서 Eloquent 관계를 지연 로딩하려 하면, 라라벨은 `Illuminate\Database\LazyLoadingViolationException` 예외를 발생시킵니다.

지연 로딩 위반 시 동작을 커스터마이즈하려면, `handleLazyLoadingViolationsUsing` 메서드를 활용할 수 있습니다. 예를 들어, 예외로 인해 실행이 중단되지 않고 로그만 남도록 설정할 수 있습니다.

```php
Model::handleLazyLoadingViolationUsing(function (Model $model, string $relation) {
    $class = $model::class;

    info("Attempted to lazy load [{$relation}] on model [{$class}].");
});
```

<a name="inserting-and-updating-related-models"></a>
## 관련 모델 삽입 및 수정

<a name="the-save-method"></a>
### `save` 메서드

Eloquent는 관계에 새로운 모델을 추가하는 편리한 메서드들을 제공합니다. 예를 들어, 게시글(Post)에 새로운 코멘트를 추가하고 싶다면, 코멘트 모델에서 직접 `post_id` 속성을 설정하지 않고도, 관계의 `save` 메서드를 이용해 코멘트를 추가할 수 있습니다.

```
use App\Models\Comment;
use App\Models\Post;

$comment = new Comment(['message' => 'A new comment.']);

$post = Post::find(1);

$post->comments()->save($comment);
```

여기서 `comments` 관계를 동적 프로퍼티로 접근하지 않고, 메서드 호출로 관계 인스턴스를 얻은 뒤 `save`를 사용한 점을 확인하세요. `save` 메서드는 새로운 `Comment` 모델에 적절한 `post_id` 값을 자동으로 추가해줍니다.

여러 개의 관련 모델을 저장하려면, `saveMany` 메서드를 사용할 수 있습니다.

```
$post = Post::find(1);

$post->comments()->saveMany([
    new Comment(['message' => 'A new comment.']),
    new Comment(['message' => 'Another new comment.']),
]);
```

`save`와 `saveMany`는 해당 모델 인스턴스는 저장하지만, 상위 모델에 이미 로드된 관계(메모리 내)의 데이터에는 새로 추가된 모델을 덧붙이지 않습니다. 이후에 관계를 다시 접근해야 한다면, `refresh` 메서드를 사용해 상위 모델과 관계를 다시 불러오는 것이 좋습니다.

```
$post->comments()->save($comment);

$post->refresh();

// 신규 저장된 코멘트까지 포함한 전체 코멘트 리스트...
$post->comments;
```

<a name="the-push-method"></a>
#### 모델과 관계 전체 재귀적 저장

모델과 그에 연결된 모든 관계까지 한 번에 `save` 하고 싶다면 `push` 메서드를 사용하면 됩니다. 아래 예제에서는 `Post` 모델, 해당 포스트의 코멘트, 코멘트의 저자까지 모두 한 번에 저장됩니다.

```
$post = Post::find(1);

$post->comments[0]->message = 'Message';
$post->comments[0]->author->name = 'Author Name';

$post->push();
```

이벤트를 발생시키지 않고 모델과 관계를 저장해야 한다면, `pushQuietly` 메서드를 사용할 수 있습니다.

```
$post->pushQuietly();
```

<a name="the-create-method"></a>

### `create` 메서드

`save`와 `saveMany` 메서드 외에도, `create` 메서드를 사용할 수 있습니다. 이 메서드는 속성(attribute) 배열을 받아 모델을 생성한 뒤 데이터베이스에 저장합니다. `save`와 `create`의 차이점은, `save`는 전체 Eloquent 모델 인스턴스를 받지만, `create`는 일반 PHP `array`를 받는다는 점입니다. `create` 메서드는 새로 생성된 모델을 반환합니다.

```
use App\Models\Post;

$post = Post::find(1);

$comment = $post->comments()->create([
    'message' => 'A new comment.',
]);
```

여러 관련 모델을 한 번에 생성하고 싶다면 `createMany` 메서드를 사용할 수 있습니다.

```
$post = Post::find(1);

$post->comments()->createMany([
    ['message' => 'A new comment.'],
    ['message' => 'Another new comment.'],
]);
```

이벤트를 발생시키지 않고 모델을 생성하려면 `createQuietly`와 `createManyQuietly` 메서드를 사용할 수 있습니다.

```
$user = User::find(1);

$user->posts()->createQuietly([
    'title' => 'Post title.',
]);

$user->posts()->createManyQuietly([
    ['title' => 'First post.'],
    ['title' => 'Second post.'],
]);
```

또한 관계에서 [모델을 생성하거나 업데이트](/docs/11.x/eloquent#upserts)할 때 `findOrNew`, `firstOrNew`, `firstOrCreate`, `updateOrCreate` 메서드를 사용할 수도 있습니다.

> [!NOTE]  
> `create` 메서드를 사용하기 전에 [대량 할당(mass assignment)](/docs/11.x/eloquent#mass-assignment) 관련 문서를 반드시 참고하시기 바랍니다.

<a name="updating-belongs-to-relationships"></a>
### Belongs To 관계 업데이트

자식 모델을 새로운 부모 모델에 할당하려면 `associate` 메서드를 사용할 수 있습니다. 예를 들어 `User` 모델이 `Account` 모델과 `belongsTo` 관계를 가지고 있다면, `associate` 메서드는 자식 모델의 외래 키를 설정해줍니다.

```
use App\Models\Account;

$account = Account::find(10);

$user->account()->associate($account);

$user->save();
```

자식 모델에서 부모 모델을 해제하려면 `dissociate` 메서드를 사용하면 됩니다. 이 메서드는 관계의 외래 키를 `null`로 설정합니다.

```
$user->account()->dissociate();

$user->save();
```

<a name="updating-many-to-many-relationships"></a>
### 다대다(Many to Many) 관계 업데이트

<a name="attaching-detaching"></a>
#### 관계 연결 및 해제(Attaching / Detaching)

Eloquent는 다대다(many-to-many) 관계를 더욱 편리하게 다룰 수 있도록 여러 메서드를 제공합니다. 예를 들어, 한 사용자가 여러 역할(role)을 가질 수 있고, 한 역할도 여러 사용자를 가질 수 있다고 가정해봅시다. 이때 `attach` 메서드를 사용하면 관계의 중간 테이블에 새로운 레코드를 추가하여 사용자의 역할을 연결할 수 있습니다.

```
use App\Models\User;

$user = User::find(1);

$user->roles()->attach($roleId);
```

관계를 연결할 때, 추가로 중간 테이블에 저장할 데이터를 배열로 전달할 수도 있습니다.

```
$user->roles()->attach($roleId, ['expires' => $expires]);
```

역할을 사용자로부터 제거해야 할 때도 있습니다. 다대다 관계의 레코드를 제거하려면 `detach` 메서드를 사용하면 됩니다. 이 메서드는 중간 테이블에서 해당 레코드를 삭제하며, 두 모델 자체는 데이터베이스에서 삭제되지 않습니다.

```
// 사용자의 특정 역할을 해제합니다.
$user->roles()->detach($roleId);

// 사용자의 모든 역할을 해제합니다.
$user->roles()->detach();
```

편의를 위해, `attach`와 `detach`는 ID 배열도 입력으로 받을 수 있습니다.

```
$user = User::find(1);

$user->roles()->detach([1, 2, 3]);

$user->roles()->attach([
    1 => ['expires' => $expires],
    2 => ['expires' => $expires],
]);
```

<a name="syncing-associations"></a>
#### 관계 동기화(Syncing Associations)

다대다 관계를 관리할 때 `sync` 메서드를 사용할 수도 있습니다. `sync`는 관계의 중간 테이블에 남길 ID들의 배열을 받아, 해당 배열에 없는 ID들은 중간 테이블에서 삭제합니다. 즉, 이 작업이 끝나면 중간 테이블에는 지정한 ID만 남게 됩니다.

```
$user->roles()->sync([1, 2, 3]);
```

ID와 함께 중간 테이블에 저장할 추가 데이터도 함께 전달할 수 있습니다.

```
$user->roles()->sync([1 => ['expires' => true], 2, 3]);
```

만약 동기화하는 모든 ID에 같은 중간 테이블 값을 추가하고 싶다면 `syncWithPivotValues` 메서드를 사용할 수 있습니다.

```
$user->roles()->syncWithPivotValues([1, 2, 3], ['active' => true]);
```

지정한 배열에 존재하지 않는 ID를 중간 테이블에서 삭제하고 싶지 않다면 `syncWithoutDetaching` 메서드를 사용할 수 있습니다.

```
$user->roles()->syncWithoutDetaching([1, 2, 3]);
```

<a name="toggling-associations"></a>
#### 관계 토글(Toggling Associations)

다대다 관계에서는 `toggle` 메서드도 제공되며, 이는 전달한 관련 모델 ID의 연결 상태를 "토글"합니다. 즉, 해당 ID가 이미 연결되어 있으면 연결을 해제하고, 연결되어 있지 않으면 연결합니다.

```
$user->roles()->toggle([1, 2, 3]);
```

ID와 함께 중간 테이블에 저장할 추가 데이터도 함께 전달할 수 있습니다.

```
$user->roles()->toggle([
    1 => ['expires' => true],
    2 => ['expires' => true],
]);
```

<a name="updating-a-record-on-the-intermediate-table"></a>
#### 중간 테이블의 레코드 업데이트

관계의 중간 테이블의 기존 행을 업데이트해야 한다면, `updateExistingPivot` 메서드를 사용할 수 있습니다. 이 메서드는 중간 테이블의 외래 키와 함께 업데이트할 속성 배열을 받습니다.

```
$user = User::find(1);

$user->roles()->updateExistingPivot($roleId, [
    'active' => false,
]);
```

<a name="touching-parent-timestamps"></a>
## 부모 타임스탬프 동기화(Touching Parent Timestamps)

모델이 `belongsTo` 또는 `belongsToMany` 관계를 통해 다른 모델과 연결되어 있는 경우(예: `Comment` 모델이 `Post` 모델에 소속된 경우), 자식 모델이 업데이트될 때 부모 모델의 타임스탬프를 함께 갱신하면 유용한 경우가 있습니다.

예를 들어, `Comment` 모델이 업데이트될 때, 그에 소속된 `Post`의 `updated_at` 타임스탬프를 현재 일시로 자동 갱신하고 싶을 수 있습니다. 이를 위해 자식 모델에 `touches` 속성을 추가하고, 업데이트 시 함께 타임스탬프를 갱신할 관계의 이름을 배열로 지정하면 됩니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comment extends Model
{
    /**
     * 업데이트 시 함께 타임스탬프를 갱신할 모든 관계 목록입니다.
     *
     * @var array
     */
    protected $touches = ['post'];

    /**
     * 이 댓글이 소속된 게시물(post) 관계를 반환합니다.
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }
}
```

> [!WARNING]  
> 부모 모델의 타임스탬프는 자식 모델을 Eloquent의 `save` 메서드로 업데이트할 때에만 갱신됩니다.