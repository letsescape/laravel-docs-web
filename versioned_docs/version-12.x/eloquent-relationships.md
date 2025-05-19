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
    - [중간 테이블 컬럼 조회하기](#retrieving-intermediate-table-columns)
    - [중간 테이블 컬럼을 통한 쿼리 필터링](#filtering-queries-via-intermediate-table-columns)
    - [중간 테이블 컬럼을 통한 쿼리 정렬](#ordering-queries-via-intermediate-table-columns)
    - [커스텀 중간 테이블 모델 정의](#defining-custom-intermediate-table-models)
- [폴리모픽 연관관계](#polymorphic-relationships)
    - [일대일](#one-to-one-polymorphic-relations)
    - [일대다](#one-to-many-polymorphic-relations)
    - [One of Many](#one-of-many-polymorphic-relations)
    - [다대다](#many-to-many-polymorphic-relations)
    - [커스텀 폴리모픽 타입](#custom-polymorphic-types)
- [동적 연관관계](#dynamic-relationships)
- [연관관계 쿼리](#querying-relations)
    - [연관관계 메서드와 동적 프로퍼티](#relationship-methods-vs-dynamic-properties)
    - [연관관계 존재 유무 쿼리](#querying-relationship-existence)
    - [연관관계 부재 쿼리](#querying-relationship-absence)
    - [Morph To 연관관계 쿼리](#querying-morph-to-relationships)
- [연관 모델 집계](#aggregating-related-models)
    - [연관 모델 개수 구하기](#counting-related-models)
    - [기타 집계 함수](#other-aggregate-functions)
    - [Morph To 연관 모델 개수 구하기](#counting-related-models-on-morph-to-relationships)
- [즉시 로딩(Eager Loading)](#eager-loading)
    - [즉시 로딩에 제약 추가하기](#constraining-eager-loads)
    - [지연 즉시 로딩(Lazy Eager Loading)](#lazy-eager-loading)
    - [자동 즉시 로딩](#automatic-eager-loading)
    - [지연 로딩 방지하기](#preventing-lazy-loading)
- [연관 모델 삽입 및 수정](#inserting-and-updating-related-models)
    - [`save` 메서드](#the-save-method)
    - [`create` 메서드](#the-create-method)
    - [Belongs To 연관관계](#updating-belongs-to-relationships)
    - [다대다 연관관계](#updating-many-to-many-relationships)
- [부모 타임스탬프 동기화](#touching-parent-timestamps)

<a name="introduction"></a>
## 소개

데이터베이스 테이블은 서로 관계를 맺고 있는 경우가 많습니다. 예를 들어, 블로그 게시글에는 여러 개의 댓글이 달릴 수 있고, 주문 정보는 해당 주문을 한 사용자와 연결되어 있을 수 있습니다. Eloquent는 이러한 다양한 연관관계를 손쉽게 정의하고 관리할 수 있도록 해주며, 다음과 같은 일반적인 연관관계들을 지원합니다.

<div class="content-list" markdown="1">

- [일대일](#one-to-one)
- [일대다](#one-to-many)
- [다대다](#many-to-many)
- [Has One Through](#has-one-through)
- [Has Many Through](#has-many-through)
- [일대일(폴리모픽)](#one-to-one-polymorphic-relations)
- [일대다(폴리모픽)](#one-to-many-polymorphic-relations)
- [다대다(폴리모픽)](#many-to-many-polymorphic-relations)

</div>

<a name="defining-relationships"></a>
## 연관관계 정의하기

Eloquent의 연관관계는 여러분의 Eloquent 모델 클래스에 메서드로 정의합니다. 연관관계 정의는 강력한 [쿼리 빌더](/docs/12.x/queries) 역할도 겸하기 때문에, 메서드 체이닝을 활용한 다양한 조건 쿼리를 손쉽게 작성할 수 있습니다. 예를 들어, 다음과 같이 `posts` 연관관계에 추가 쿼리 조건을 체인해서 사용할 수 있습니다.

```php
$user->posts()->where('active', 1)->get();
```

이제 본격적으로 연관관계를 활용하기 전에, Eloquent에서 지원하는 각 연관관계의 정의 방법을 살펴보겠습니다.

<a name="one-to-one"></a>
### 일대일 / Has One

일대일(One to One) 관계는 가장 기본적인 형태의 데이터베이스 연관관계입니다. 예를 들어, `User` 모델은 하나의 `Phone` 모델과 연결될 수 있습니다. 이 연관관계를 정의하려면, `User` 모델에 `phone` 메서드를 추가해야 하며, 이 메서드에서는 `hasOne` 메서드를 호출해서 그 결과를 반환해야 합니다. `hasOne` 메서드는 모델의 `Illuminate\Database\Eloquent\Model` 기본 클래스에서 제공됩니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Model
{
    /**
     * 사용자와 연결된 전화번호를 가져옵니다.
     */
    public function phone(): HasOne
    {
        return $this->hasOne(Phone::class);
    }
}
```

`hasOne` 메서드의 첫 번째 인수로는 연관 모델의 클래스명을 전달합니다. 이렇게 연관관계를 정의하면, Eloquent의 동적 프로퍼티(dynamic property) 기능을 활용해 관련 레코드를 간편하게 가져올 수 있습니다. 동적 프로퍼티란 연관관계 메서드를 마치 모델의 속성처럼 사용할 수 있도록 해주는 기능입니다.

```php
$phone = User::find(1)->phone;
```

Eloquent는 부모 모델명을 기반으로 연관관계의 외래 키(foreign key)를 자동으로 추론합니다. 이 예시에서는 `Phone` 모델이 `user_id`라는 외래 키를 가진 것으로 간주합니다. 만약 이 규칙 대신 다른 외래 키를 사용하고 싶다면, `hasOne` 메서드의 두 번째 인수로 지정할 수 있습니다.

```php
return $this->hasOne(Phone::class, 'foreign_key');
```

또한, Eloquent는 외래 키가 기본적으로 부모 모델의 기본 키(primary key)와 같은 값을 갖는 것으로 가정합니다. 즉, 사용자의 `id` 필드 값이 `Phone` 레코드의 `user_id` 컬럼에 저장되어 있다고 봅니다. 만약 기본 키가 `id`가 아니거나, 모델의 `$primaryKey` 속성 대신 다른 값으로 연결하고 싶다면, `hasOne` 메서드의 세 번째 인수로 로컬 키(local key)를 지정할 수 있습니다.

```php
return $this->hasOne(Phone::class, 'foreign_key', 'local_key');
```

<a name="one-to-one-defining-the-inverse-of-the-relationship"></a>
#### 연관관계의 역방향 정의하기

이제 `User` 모델에서 `Phone` 모델에 접근할 수 있게 되었습니다. 다음으로는, `Phone` 모델에서 해당 전화번호를 소유한 사용자를 가져올 수 있도록 연관관계를 정의해봅시다. `hasOne` 연관관계의 역방향은 `belongsTo` 메서드로 정의할 수 있습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Phone extends Model
{
    /**
     * 이 전화번호를 소유한 사용자를 가져옵니다.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
```

`user` 메서드를 호출하면, Eloquent는 `Phone` 모델의 `user_id` 컬럼 값과 일치하는 `id`를 가진 `User` 모델을 찾아 반환하려고 시도합니다.

Eloquent는 연관관계 메서드명을 참고해, 메서드명 끝에 `_id`를 붙인 이름을 외래 키로 자동 추론합니다. 이 예시에서는 `Phone` 모델에 `user_id` 컬럼이 있다고 판단합니다. 만약 외래 키가 `user_id`가 아니면, `belongsTo` 메서드의 두 번째 인수로 원하는 키 이름을 지정할 수 있습니다.

```php
/**
 * 이 전화번호를 소유한 사용자를 가져옵니다.
 */
public function user(): BelongsTo
{
    return $this->belongsTo(User::class, 'foreign_key');
}
```

부모 모델에서 기본 키로 `id`가 아닌 다른 컬럼을 사용하거나, 다른 컬럼을 기준으로 연관 모델을 찾고 싶을 때는 세 번째 인수로 부모 테이블의 키 이름을 지정합니다.

```php
/**
 * 이 전화번호를 소유한 사용자를 가져옵니다.
 */
public function user(): BelongsTo
{
    return $this->belongsTo(User::class, 'foreign_key', 'owner_key');
}
```

<a name="one-to-many"></a>
### 일대다 / Has Many

일대다(One to Many) 관계는 한 개의 부모 모델이 하나 이상의 자식 모델을 가질 때 사용합니다. 예를 들어 블로그 게시글(Post)은 무한히 많은 댓글(Comment)을 가질 수 있습니다. 다른 연관관계와 마찬가지로, 일대다 관계 역시 여러분의 Eloquent 모델에 메서드로 정의합니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Post extends Model
{
    /**
     * 블로그 게시글에 달린 댓글들을 가져옵니다.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }
}
```

참고로 Eloquent는 `Comment` 모델의 적절한 외래 키 컬럼을 자동으로 추론해줍니다. 컨벤션상, 부모 모델명을 스네이크 케이스(snake case)로 변환한 뒤 `_id`를 붙인 이름이 외래 키로 간주됩니다. 이 예시에서는 `Comment` 모델의 외래 키 컬럼이 `post_id`라고 간주합니다.

연관관계 메서드를 정의했다면, 이제 `comments` 프로퍼티에 접근하여 관련 댓글의 [컬렉션](/docs/12.x/eloquent-collections)을 쉽게 가져올 수 있습니다. 동적 연관관계 프로퍼티를 통해, 메서드를 마치 속성처럼 사용할 수 있다는 점을 다시 한번 기억하세요.

```php
use App\Models\Post;

$comments = Post::find(1)->comments;

foreach ($comments as $comment) {
    // ...
}
```

모든 연관관계는 쿼리 빌더 역할도 하기 때문에, `comments` 메서드를 호출한 후 체이닝 방식으로 쿼리 조건을 추가할 수 있습니다.

```php
$comment = Post::find(1)->comments()
    ->where('title', 'foo')
    ->first();
```

`hasOne` 메서드와 마찬가지로, 외래 키와 로컬 키를 직접 지정하고 싶을 때는 `hasMany` 메서드에 추가로 인수들을 전달하면 됩니다.

```php
return $this->hasMany(Comment::class, 'foreign_key');

return $this->hasMany(Comment::class, 'foreign_key', 'local_key');
```

<a name="automatically-hydrating-parent-models-on-children"></a>
#### 자식 모델에 부모 모델 자동으로 채워주기

Eloquent 즉시 로딩을 사용하더라도, 자식 모델 반복 처리 중에 부모 모델에 접근하면 "N + 1" 쿼리 문제가 생길 수 있습니다.

```php
$posts = Post::with('comments')->get();

foreach ($posts as $post) {
    foreach ($post->comments as $comment) {
        echo $comment->post->title;
    }
}
```

위 예시처럼, 비록 각 `Post` 모델마다 댓글이 즉시 로딩되었다 하더라도, Eloquent는 각 `Comment` 모델에 부모 `Post`가 자동으로 포함되어 있지 않습니다. 그래서 반복문 안에서 접근할 때 추가 쿼리가 발생하게 됩니다.

Eloquent가 자식 모델에 부모 모델을 자동으로 채워주길 원한다면, `hasMany` 연관관계 정의 시 `chaperone` 메서드를 호출하면 됩니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Post extends Model
{
    /**
     * 블로그 게시글에 달린 댓글들을 가져옵니다.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class)->chaperone();
    }
}
```

또한, 런타임 시 관계를 즉시 로딩할 때 선택적으로 자동 부모 채우기 기능을 활성화하고 싶다면, 관계 즉시 로딩 시점에 `chaperone`을 사용하면 됩니다.

```php
use App\Models\Post;

$posts = Post::with([
    'comments' => fn ($comments) => $comments->chaperone(),
])->get();
```

<a name="one-to-many-inverse"></a>
### 일대다(역방향) / Belongs To

이제 게시글의 모든 댓글에 접근할 수 있게 되었으니, 반대로 각 댓글에서 자신의 부모 게시글에 접근할 수 있도록 관계를 정의해봅시다. `hasMany` 관계의 역방향을 정의하려면, 자식 모델에 `belongsTo` 메서드를 이용한 연관관계 메서드를 추가해야 합니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comment extends Model
{
    /**
     * 이 댓글이 달린 게시글을 가져옵니다.
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }
}
```

이제 연관관계가 정의되었으므로, `post`라는 "동적 연관관계 프로퍼티"에 접근해서 댓글의 부모 게시글을 바로 가져올 수 있습니다.

```php
use App\Models\Comment;

$comment = Comment::find(1);

return $comment->post->title;
```

위 예시에서 Eloquent는, `Comment` 모델의 `post_id` 컬럼 값과 일치하는 `id` 값을 가진 `Post` 모델을 찾아 반환합니다.

Eloquent는 기본적으로, 연관관계 메서드명을 참고하여, 메서드명과 부모 모델의 기본 키(primary key) 컬럼명을 `_`로 연결한 형태(예: `post_id`)를 외래 키로 추론합니다.

만약 이 관례와 다른 외래 키 이름을 사용한다면, `belongsTo` 메서드의 두 번째 인수로 외래 키 이름을 직접 지정할 수 있습니다.

```php
/**
 * 이 댓글이 달린 게시글을 가져옵니다.
 */
public function post(): BelongsTo
{
    return $this->belongsTo(Post::class, 'foreign_key');
}
```

부모 모델에서 `id`가 아닌 다른 컬럼을 기본 키로 사용하거나, 다른 컬럼으로 조인하고 싶을 때는, 세 번째 인수로 부모 테이블의 키 이름을 명시합니다.

```php
/**
 * 이 댓글이 달린 게시글을 가져옵니다.
 */
public function post(): BelongsTo
{
    return $this->belongsTo(Post::class, 'foreign_key', 'owner_key');
}
```

<a name="default-models"></a>
#### 기본 모델(Default Models)

`belongsTo`, `hasOne`, `hasOneThrough`, `morphOne` 연관관계에서는, 해당 관계가 `null`일 경우 반환할 기본 모델을 지정할 수 있습니다. 이 패턴은 [Null Object 패턴](https://en.wikipedia.org/wiki/Null_Object_pattern)이라고 부르며, 코드에서 조건문을 줄이는데 도움이 됩니다. 아래 예시는, `Post` 모델에 사용자 정보가 없을 때 `user` 연관관계가 빈 `App\Models\User` 모델을 반환합니다.

```php
/**
 * 게시글의 작성자를 가져옵니다.
 */
public function user(): BelongsTo
{
    return $this->belongsTo(User::class)->withDefault();
}
```

기본 모델에 속성값을 지정하려면, `withDefault` 메서드에 배열 또는 클로저를 전달하면 됩니다.

```php
/**
 * 게시글의 작성자를 가져옵니다.
 */
public function user(): BelongsTo
{
    return $this->belongsTo(User::class)->withDefault([
        'name' => 'Guest Author',
    ]);
}

/**
 * 게시글의 작성자를 가져옵니다.
 */
public function user(): BelongsTo
{
    return $this->belongsTo(User::class)->withDefault(function (User $user, Post $post) {
        $user->name = 'Guest Author';
    });
}
```

<a name="querying-belongs-to-relationships"></a>
#### Belongs To 관계 쿼리하기

"Belongs To" 연관관계의 자식들을 쿼리할 때, 직접 `where` 조건을 사용해 해당 Eloquent 모델을 가져올 수 있습니다.

```php
use App\Models\Post;

$posts = Post::where('user_id', $user->id)->get();
```

하지만 좀 더 간편하게, `whereBelongsTo` 메서드를 사용하면 관계명과 외래 키를 자동으로 판별해서 쿼리를 구성해줍니다.

```php
$posts = Post::whereBelongsTo($user)->get();
```

또한, `whereBelongsTo` 메서드에는 [컬렉션](/docs/12.x/eloquent-collections) 인스턴스를 넘길 수도 있습니다. 이 경우, 컬렉션 안의 여러 부모 모델에 속하는 모든 자식 모델을 가져오게 됩니다.

```php
$users = User::where('vip', true)->get();

$posts = Post::whereBelongsTo($users)->get();
```

기본적으로 라라벨은 전달된 모델의 클래스명을 바탕으로 관계명을 자동 판별하지만, `whereBelongsTo` 메서드의 두 번째 인수로 관계명을 직접 지정할 수도 있습니다.

```php
$posts = Post::whereBelongsTo($user, 'author')->get();
```

<a name="has-one-of-many"></a>
### Has One of Many

때로는 하나의 모델이 여러 개의 연관된 모델을 가지더라도, "가장 최근" 혹은 "가장 오래된" 연관 모델을 편리하게 가져오고 싶을 때가 있습니다. 예를 들어, `User` 모델이 여러 `Order` 모델과 연결될 수 있지만, 사용자가 가장 최근에 주문한 주문을 쉽게 가져오고 싶을 수 있습니다. 이럴 때는 `hasOne` 관계와 함께 `ofMany` 계열 메서드를 사용할 수 있습니다.

```php
/**
 * 사용자의 가장 최근 주문을 가져옵니다.
 */
public function latestOrder(): HasOne
{
    return $this->hasOne(Order::class)->latestOfMany();
}
```

마찬가지로, "가장 오래된" 또는 첫 번째 연관 모델을 가져오는 메서드도 정의할 수 있습니다.

```php
/**
 * 사용자의 가장 오래된 주문을 가져옵니다.
 */
public function oldestOrder(): HasOne
{
    return $this->hasOne(Order::class)->oldestOfMany();
}
```

기본적으로 `latestOfMany`와 `oldestOfMany` 메서드는 모델의 기본 키(primary key)를 기준으로 정렬해 최신 또는 가장 오래된 연관 모델을 가져옵니다. (기본 키는 정렬 가능한 값이어야 합니다.) 하지만, 다른 정렬 기준으로 한 개의 연관 모델만을 가져오고 싶다면, 아래처럼 사용할 수 있습니다.

예를 들어, `ofMany` 메서드로 사용자의 가장 비싼 주문을 가져오고 싶다면, 정렬할 컬럼과 집계 함수(`min` 또는 `max`)를 첫 번째, 두 번째 인수로 전달하면 됩니다.

```php
/**
 * 사용자의 가장 큰 주문(최고가 주문)을 가져옵니다.
 */
public function largestOrder(): HasOne
{
    return $this->hasOne(Order::class)->ofMany('price', 'max');
}
```

> [!WARNING]
> PostgreSQL은 UUID 컬럼에 대해 `MAX` 집계 함수를 지원하지 않으므로, 현재로서는 PostgreSQL UUID 컬럼과 one-of-many 연관관계를 함께 사용할 수 없습니다.

<a name="converting-many-relationships-to-has-one-relationships"></a>
#### "Many" 관계를 Has One 관계로 변환하기

`latestOfMany`, `oldestOfMany`, `ofMany` 메서드로 한 개의 모델만 가져올 경우, 해당 모델과 이미 "has many" 관계가 정의되어 있다면 이를 바로 "has one" 관계처럼 변환해서 사용하면 편리합니다. 라라벨에서는 `one` 메서드를 호출해서 "has many" 관계를 쉽게 "has one" 관계로 변환할 수 있습니다.

```php
/**
 * 사용자의 주문 목록을 가져옵니다.
 */
public function orders(): HasMany
{
    return $this->hasMany(Order::class);
}

/**
 * 사용자의 가장 큰 주문을 가져옵니다.
 */
public function largestOrder(): HasOne
{
    return $this->orders()->one()->ofMany('price', 'max');
}
```

또한, `one` 메서드를 사용해 `HasManyThrough` 관계를 `HasOneThrough` 관계로 변환하는 것도 가능합니다.

```php
public function latestDeployment(): HasOneThrough
{
    return $this->deployments()->one()->latestOfMany();
}
```

<a name="advanced-has-one-of-many-relationships"></a>
#### 고급 Has One of Many 연관관계

좀 더 복잡한 "has one of many" 연관관계를 구성할 수도 있습니다. 예를 들어, `Product` 모델에는 여러 개의 `Price` 모델이 연결되어 있는데, 새로운 가격이 추가되어도 기존 가격 레코드는 그대로 남아있는 시스템을 가정합시다. 또, `published_at` 컬럼을 이용해 미래 시점에 적용되는 가격도 미리 등록할 수 있다고 해봅시다.

즉, 현재 시점(published_at이 미래가 아님) 기준으로, 가장 최근 공개 가격을 가져오는 것이 목표입니다. 만약 동일한 published_at이 여러 개라면, id가 가장 큰(가장 나중에 등록된) 가격을 우선 선택하도록 합니다. 이를 위해 `ofMany` 메서드에 정렬 기준 컬럼 배열과, 쿼리 제약을 추가하기 위한 클로저를 전달하면 해결할 수 있습니다.

```php
/**
 * 상품의 현재 가격 정보를 가져옵니다.
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

"has-one-through" 연관관계는, 두 모델 사이에 _중간_ 모델을 통해 일대일 연관관계를 정의하는 방식입니다. 즉, 자신과 직접 연관된 모델은 아니지만, 한 번 더 다른 모델을 거쳐 원하는 모델과 연결되는 형태입니다.

예를 들어 자동차 정비소 애플리케이션에서, 각 `Mechanic`(정비공) 모델은 한 대의 `Car`(자동차)와 연결되고, 각 `Car`는 또 한 명의 `Owner`(소유자)와 연관됩니다. 데이터베이스 상에서 mechanic과 owner는 직접 연결되어 있지 않지만, mechanic은 car라는 중간 모델을 통해 owner 정보에 접근할 수 있습니다. 이 관계를 정의하기 위해 필요한 테이블 구조는 아래와 같습니다.

```text
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

구조를 파악했으니, 이제 `Mechanic` 모델에 연관관계를 정의해보겠습니다.

```php
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

`hasOneThrough` 메서드의 첫 번째 인수로는 최종적으로 접근하고자 하는 모델을, 두 번째 인수로는 중간 연결 모델을 지정합니다.

또는, 만약 관계가 이미 관련된 모든 모델에 정의되어 있다면, `through` 메서드에 관계 메서드명을 넘겨 주는 방식으로 유연하게 "has-one-through" 관계를 정의할 수도 있습니다. 예를 들어, `Mechanic` 모델에 `cars`라는 관계가 있고, `Car` 모델에 `owner` 관계가 있다면, 다음과 같이 mechanic과 owner를 연결할 수 있습니다.

```php
// 문자열 기반 문법...
return $this->through('cars')->has('owner');

// 동적 문법...
return $this->throughCars()->hasOwner();
```

<a name="has-one-through-key-conventions"></a>

#### 주요 규칙

관계 쿼리를 수행할 때는 일반적인 Eloquent의 외래 키 규칙이 사용됩니다. 만약 관계에 사용되는 키를 직접 지정하고 싶을 경우, `hasOneThrough` 메서드의 세 번째와 네 번째 인수로 전달할 수 있습니다. 세 번째 인수는 중간 모델에서 사용되는 외래 키의 이름이고, 네 번째 인수는 최종 모델에서 사용되는 외래 키의 이름입니다. 다섯 번째 인수는 로컬 키(현재 모델에서의 기본 키)이며, 여섯 번째 인수는 중간 모델에서의 로컬 키입니다.

```php
class Mechanic extends Model
{
    /**
     * 자동차 소유자를 반환합니다.
     */
    public function carOwner(): HasOneThrough
    {
        return $this->hasOneThrough(
            Owner::class,
            Car::class,
            'mechanic_id', // cars 테이블의 외래 키...
            'car_id', // owners 테이블의 외래 키...
            'id', // mechanics 테이블의 로컬 키...
            'id' // cars 테이블의 로컬 키...
        );
    }
}
```

또는 앞서 설명한 것처럼, 관계에 포함된 모든 모델에 대해 각각의 관계가 이미 정의되어 있다면, `through` 메서드를 사용하고 그 관계의 이름을 전달하여 더 간결하게 "has-one-through" 관계를 정의할 수 있습니다. 이 방법의 장점은 이미 존재하는 관계의 키 규칙을 재활용할 수 있다는 점입니다.

```php
// 문자열 기반 방식...
return $this->through('cars')->has('owner');

// 동적 메서드 방식...
return $this->throughCars()->hasOwner();
```

<a name="has-many-through"></a>
### Has Many Through

"has-many-through" 관계는 중간 관계를 거쳐 먼 거리에 있는 관계에 쉽게 접근할 수 있게 해줍니다. 예를 들어, [Laravel Cloud](https://cloud.laravel.com)와 같은 배포 플랫폼을 만든다고 가정해봅시다. `Application` 모델은 중간에 있는 `Environment` 모델을 거쳐 여러 개의 `Deployment` 모델에 접근할 수 있습니다. 이 예제를 통해, 특정 애플리케이션에 대한 모든 배포 정보를 쉽게 조회할 수 있습니다. 이 관계를 정의하기 위해서는 다음과 같은 테이블 구조가 필요합니다.

```text
applications
    id - integer
    name - string

environments
    id - integer
    application_id - integer
    name - string

deployments
    id - integer
    environment_id - integer
    commit_hash - string
```

이제 관계를 위한 테이블 구조를 살펴보았으니, `Application` 모델에서 관계를 정의해보겠습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Application extends Model
{
    /**
     * 해당 애플리케이션의 모든 배포 정보를 가져옵니다.
     */
    public function deployments(): HasManyThrough
    {
        return $this->hasManyThrough(Deployment::class, Environment::class);
    }
}
```

`hasManyThrough` 메서드의 첫 번째 인수는 최종적으로 접근하고자 하는 모델의 클래스 이름이고, 두 번째 인수는 중간 모델의 클래스 이름입니다.

혹은 관계에 포함된 모든 모델에서 해당 관계가 이미 정의되어 있다면, `through` 메서드에 관계의 이름을 전달하여 더 간결하게 "has-many-through" 관계를 선언할 수도 있습니다. 예를 들어, `Application` 모델에 `environments` 관계가, 그리고 `Environment` 모델에 `deployments` 관계가 이미 정의되어 있다면 아래와 같이 연결할 수 있습니다.

```php
// 문자열 기반 방식...
return $this->through('environments')->has('deployments');

// 동적 메서드 방식...
return $this->throughEnvironments()->hasDeployments();
```

비록 `Deployment` 모델의 테이블에 `application_id` 컬럼이 없더라도, `hasManyThrough` 관계를 사용하면 `$application->deployments`를 통해 해당 애플리케이션의 배포 정보를 조회할 수 있습니다. Eloquent는 중간에 있는 `Environment` 모델의 테이블에서 `application_id` 컬럼을 참조하여 관련된 환경의 ID들을 찾고, 그 환경 ID를 통해 `Deployment` 테이블을 조회합니다.

<a name="has-many-through-key-conventions"></a>
#### 주요 규칙

관계 쿼리를 수행할 때는 일반적인 Eloquent의 외래 키 규칙이 사용됩니다. 만약 관계에 사용되는 키를 직접 지정하고 싶을 경우, `hasManyThrough` 메서드의 세 번째와 네 번째 인수로 전달할 수 있습니다. 세 번째 인수는 중간 모델에서 사용되는 외래 키의 이름이고, 네 번째 인수는 최종 모델에서 사용되는 외래 키의 이름입니다. 다섯 번째 인수는 현재 모델의 로컬 키이며, 여섯 번째 인수는 중간 모델의 로컬 키입니다.

```php
class Application extends Model
{
    public function deployments(): HasManyThrough
    {
        return $this->hasManyThrough(
            Deployment::class,
            Environment::class,
            'application_id', // environments 테이블의 외래 키...
            'environment_id', // deployments 테이블의 외래 키...
            'id', // applications 테이블의 로컬 키...
            'id' // environments 테이블의 로컬 키...
        );
    }
}
```

또는 앞서 설명한 것처럼, 관계에 포함된 모든 모델에 해당 관계가 이미 정의되어 있다면, `through` 메서드를 이용해 간편하게 "has-many-through" 관계를 선언할 수 있습니다. 이 방법은 기존에 정의된 관계의 키 규칙을 재활용할 수 있다는 장점이 있습니다.

```php
// 문자열 기반 방식...
return $this->through('environments')->has('deployments');

// 동적 메서드 방식...
return $this->throughEnvironments()->hasDeployments();
```

<a name="scoped-relationships"></a>
### 범위 지정 관계(Scoped Relationships)

관계를 제한(필터링)하는 추가 메서드를 모델에 정의하는 경우가 많습니다. 예를 들어, `User` 모델에 `posts`라는 기본적인 관계가 있을 때, `featuredPosts`라는 메서드를 만들어 추가적인 `where` 조건으로 범위를 좁힐 수 있습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Model
{
    /**
     * 사용자의 모든 게시글을 가져옵니다.
     */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class)->latest();
    }

    /**
     * 사용자의 대표 게시글(추천 게시글)만 가져옵니다.
     */
    public function featuredPosts(): HasMany
    {
        return $this->posts()->where('featured', true);
    }
}
```

하지만 `featuredPosts` 메서드로 새로운 모델을 생성할 때, `featured` 속성은 자동으로 `true`로 설정되지 않습니다. 만약 관계 메서드를 통해 모델을 생성할 때, 늘 특정 속성을 추가하여 생성하고 싶다면, 관계 쿼리를 빌더에서 `withAttributes` 메서드를 사용할 수 있습니다.

```php
/**
 * 사용자의 대표 게시글(추천 게시글)만 가져옵니다.
 */
public function featuredPosts(): HasMany
{
    return $this->posts()->withAttributes(['featured' => true]);
}
```

`withAttributes` 메서드는 지정한 속성에 대한 `where` 조건을 쿼리에 추가할 뿐만 아니라, 해당 관계 메서드를 통한 모델 생성 시에도 지정된 속성이 적용됩니다.

```php
$post = $user->featuredPosts()->create(['title' => 'Featured Post']);

$post->featured; // true
```

만약 `withAttributes` 메서드가 쿼리에 `where` 조건을 추가하지 않도록 하려면, `asConditions` 인자를 `false`로 설정할 수 있습니다.

```php
return $this->posts()->withAttributes(['featured' => true], asConditions: false);
```

<a name="many-to-many"></a>
## 다대다(Many to Many) 관계

다대다(many-to-many) 관계는 `hasOne` 및 `hasMany` 관계보다 약간 더 복잡합니다. 예를 들어, 사용자(User)와 역할(Role) 사이의 관계를 생각해볼 수 있습니다. 한 사용자는 여러 개의 역할을 가질 수 있고, 하나의 역할 역시 여러 명의 사용자가 공유할 수 있습니다. 즉, 사용자는 "저자(Author)" 그리고 "편집자(Editor)" 역할을 동시에 가질 수 있으며, 해당 역할들은 다른 사용자에게도 부여될 수 있습니다. 이렇게 한 사용자가 여러 역할을, 역할이 다시 여러 사용자와 매칭되는 관계가 다대다입니다.

<a name="many-to-many-table-structure"></a>
#### 테이블 구조

이 관계를 구현하기 위해서는 세 개의 데이터베이스 테이블이 필요합니다: `users`, `roles`, 그리고 `role_user`. 여기서 `role_user` 테이블은 관계된 모델 이름을 알파벳 순으로 이어붙여 생성하며, `user_id`와 `role_id` 컬럼을 포함합니다. 이 테이블은 사용자와 역할을 연결하는 중간 테이블(피벗 테이블) 역할을 합니다.

참고로, 하나의 역할이 여러 사용자와 연결될 수 있으므로, 단순히 `roles` 테이블에 `user_id` 컬럼을 추가하면 한 역할이 오직 한 사용자에게만 속하는 구조가 되어버립니다. 따라서 여러 사용자가 여러 역할을 가질 수 있도록 중간 테이블이 필요합니다. 테이블 구조를 요약하면 아래와 같습니다.

```text
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

다대다 관계는 `belongsToMany` 메서드의 반환값을 갖는 메서드를 정의하여 구현합니다. `belongsToMany` 메서드는 여러분의 모든 Eloquent 모델이 상속하는 `Illuminate\Database\Eloquent\Model` 클래스에서 제공됩니다. 예를 들어, `User` 모델에 `roles`라는 메서드를 아래와 같이 정의할 수 있습니다. 첫 번째 인수로는 관련된 모델 클래스의 이름을 전달합니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Model
{
    /**
     * 사용자와 연결된 역할들입니다.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }
}
```

관계를 정의하면, 다음과 같이 `roles` 동적 관계 프로퍼티를 통해 사용자의 역할들을 조회할 수 있습니다.

```php
use App\Models\User;

$user = User::find(1);

foreach ($user->roles as $role) {
    // ...
}
```

모든 관계(relationship)는 쿼리 빌더 역할도 하므로, 아래처럼 `roles` 메서드를 직접 호출하고 체이닝을 이용해 쿼리를 더 제한할 수 있습니다.

```php
$roles = User::find(1)->roles()->orderBy('name')->get();
```

중간 테이블의 이름은 두 관련 모델명을 알파벳 순으로 이어 조합해 결정하는 것이 기본 규칙입니다. 하지만 이 규칙은 자유롭게 변경할 수 있으며, 두 번째 인수로 중간 테이블명을 넘기면 직접 지정할 수 있습니다.

```php
return $this->belongsToMany(Role::class, 'role_user');
```

또한 중간 테이블에서 사용할 외래 키 이름도 추가 인수로 지정할 수 있습니다. 세 번째 인수는 현재 관계를 정의하는 모델의 외래 키 이름, 네 번째 인수는 연결되는 모델의 외래 키 이름입니다.

```php
return $this->belongsToMany(Role::class, 'role_user', 'user_id', 'role_id');
```

<a name="many-to-many-defining-the-inverse-of-the-relationship"></a>
#### 관계의 역방향 정의하기

다대다 관계의 "역방향(inverse)"을 정의하려면, 관련된 모델에도 `belongsToMany` 메서드로 반환하는 메서드를 정의해야 합니다. User/Role 예제를 마무리하면서, 이번엔 `Role` 모델에 `users` 메서드를 정의해보겠습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    /**
     * 해당 역할을 가진(속한) 사용자들입니다.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }
}
```

이처럼 관계를 정의하는 패턴은 `User` 모델과 거의 동일하며, 클래스 이름만 다릅니다. 동일한 `belongsToMany` 메서드를 재사용하기 때문에, 관계의 역방향을 정의할 때도 테이블이나 키 커스터마이징 옵션들을 동일하게 사용할 수 있습니다.

<a name="retrieving-intermediate-table-columns"></a>
### 중간 테이블 컬럼 조회하기

이미 보았듯, 다대다 관계를 사용하려면 중간 테이블이 존재해야 합니다. Eloquent는 이 중간 테이블을 쉽게 다룰 수 있는 다양한 방법을 제공합니다. 예를 들어, `User` 모델이 여러 `Role` 모델과 연관되어 있다고 가정해보겠습니다. 이 관계를 조회하면 각 `Role` 모델에서 `pivot` 속성(attribute)을 이용해 중간 테이블의 정보를 조회할 수 있습니다.

```php
use App\Models\User;

$user = User::find(1);

foreach ($user->roles as $role) {
    echo $role->pivot->created_at;
}
```

위 예에서 각 `Role` 모델 객체는 자동으로 `pivot` 속성을 갖게 됩니다. 이 속성에는 중간 테이블을 대표하는 모델 객체가 들어 있습니다.

기본적으로 `pivot` 모델에는 외래 키 정보만 담겨 있습니다. 만약 중간 테이블에 추가적인 컬럼이 있다면, 관계를 정의할 때 `withPivot` 메서드로 해당 컬럼명을 명시해야 합니다.

```php
return $this->belongsToMany(Role::class)->withPivot('active', 'created_by');
```

중간 테이블에 Eloquent가 자동으로 관리하는 `created_at`, `updated_at` 타임스탬프 컬럼을 두고 싶다면, 관계 정의 시 `withTimestamps` 메서드를 호출하면 됩니다.

```php
return $this->belongsToMany(Role::class)->withTimestamps();
```

> [!WARNING]
> Eloquent의 자동 타임스탬프 기능을 사용하는 중간 테이블이라면, 반드시 `created_at`과 `updated_at` 컬럼이 모두 존재해야 합니다.

<a name="customizing-the-pivot-attribute-name"></a>
#### `pivot` 속성 이름 커스터마이징

앞서 설명한 것처럼, 중간 테이블의 컬럼 값들은 `pivot` 속성으로 접근할 수 있습니다. 하지만 애플리케이션 상황에 더 어울리는 이름으로 이 속성명을 변경할 수도 있습니다.

예시로, 사용자들이 팟캐스트(podcast)를 구독하는 시스템에서는 사용자와 팟캐스트 사이의 관계가 다대다일 수 있습니다. 이런 경우, 중간 테이블 속성의 이름을 `pivot` 대신 `subscription`으로 지정할 수 있으며, 이는 관계 정의 시 `as` 메서드로 가능합니다.

```php
return $this->belongsToMany(Podcast::class)
    ->as('subscription')
    ->withTimestamps();
```

이렇게 커스텀 속성명을 정의했다면, 이후엔 이 이름을 이용해 중간 테이블 데이터에 접근할 수 있습니다.

```php
$users = User::with('podcasts')->get();

foreach ($users->flatMap->podcasts as $podcast) {
    echo $podcast->subscription->created_at;
}
```

<a name="filtering-queries-via-intermediate-table-columns"></a>
### 중간 테이블 컬럼으로 쿼리 필터링

`belongsToMany` 관계에서 쿼리를 수행할 때, `wherePivot`, `wherePivotIn`, `wherePivotNotIn`, `wherePivotBetween`, `wherePivotNotBetween`, `wherePivotNull`, `wherePivotNotNull` 등의 메서드를 이용해 중간 테이블 컬럼을 조건으로 하여 필터링 할 수 있습니다.

```php
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

`wherePivot`은 쿼리에 where 조건을 추가하지만, 관계를 통해 새 모델을 생성할 때 해당 값을 자동으로 부여하지는 않습니다. 쿼리와 새 모델 모두 지정한 피벗 값을 이용하려면, `withPivotValue` 메서드를 사용할 수 있습니다.

```php
return $this->belongsToMany(Role::class)
    ->withPivotValue('approved', 1);
```

<a name="ordering-queries-via-intermediate-table-columns"></a>
### 중간 테이블 컬럼으로 정렬하기

`belongsToMany` 관계 쿼리 결과는 `orderByPivot` 메서드를 이용해 중간 테이블의 컬럼을 기준으로 정렬할 수 있습니다. 아래 예는 사용자에 관한 최신 뱃지를 모두 불러오는 경우입니다.

```php
return $this->belongsToMany(Badge::class)
    ->where('rank', 'gold')
    ->orderByPivot('created_at', 'desc');
```

<a name="defining-custom-intermediate-table-models"></a>
### 커스텀 중간 테이블(피벗) 모델 정의하기

다대다 관계에서 중간 테이블을 나타내는 모델을 직접 정의하고 싶을 경우, 관계 정의 시 `using` 메서드를 사용할 수 있습니다. 커스텀 피벗 모델을 활용하면 추가적인 메서드나 캐스트 등 고유 동작을 정의할 수 있습니다.

커스텀 다대다 피벗 모델은 반드시 `Illuminate\Database\Eloquent\Relations\Pivot` 클래스를 상속해야 하며, 커스텀 폴리모픽 다대다 피벗 모델의 경우 `Illuminate\Database\Eloquent\Relations\MorphPivot`를 상속해야 합니다. 예시로, 커스텀 `RoleUser` 피벗 모델을 사용하는 `Role` 모델을 아래와 같이 정의할 수 있습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    /**
     * 해당 역할을 가진(속한) 사용자들입니다.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)->using(RoleUser::class);
    }
}
```

`RoleUser` 모델은 다음처럼 `Pivot` 클래스를 상속해야 합니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class RoleUser extends Pivot
{
    // ...
}
```

> [!WARNING]
> 피벗 모델에서는 `SoftDeletes` 트레잇을 사용할 수 없습니다. 중간 테이블의 레코드를 소프트 삭제해야 한다면, 해당 모델을 일반 Eloquent 모델로 전환해 사용하는 것을 고려하세요.

<a name="custom-pivot-models-and-incrementing-ids"></a>
#### 커스텀 피벗 모델과 자동 증가 ID

만약 자동 증가 기본 키가 있는 커스텀 피벗 모델을 사용한다면, 해당 모델에 `incrementing` 속성을 반드시 `true`로 명시해야 합니다.

```php
/**
 * 이 ID가 자동 증가하는지에 대한 설정입니다.
 *
 * @var bool
 */
public $incrementing = true;
```

<a name="polymorphic-relationships"></a>
## 폴리모픽(Polymorphic) 관계

폴리모픽(Polymorphic) 관계는 하나의 자식 모델이 하나 이상의 종류의 부모 모델과 단일 연관을 통해 연결될 수 있게 해줍니다. 예를 들어, 사용자가 블로그 게시글(Post)과 동영상(Video)을 공유할 수 있는 애플리케이션을 만든다고 해봅시다. 이 경우 하나의 `Comment` 모델이 `Post`와 `Video` 둘 다에 속할 수 있습니다.

<a name="one-to-one-polymorphic-relations"></a>
### 1:1(One to One) 폴리모픽 관계

<a name="one-to-one-polymorphic-table-structure"></a>
#### 테이블 구조

1:1 폴리모픽 관계는 일반적인 1:1 관계와 비슷하지만, 자식 모델이 하나 이상의 부모 모델과 연결될 수 있다는 점이 다릅니다. 예를 들면, 블로그 게시글(Post)과 사용자(User)가 모두 동일한 `Image` 모델과 폴리모픽 관계를 맺을 수 있습니다. 이렇게 하면, 포스트와 사용자가 공유하는 단일 이미지 테이블을 운용할 수 있습니다. 테이블 구조는 아래와 같습니다.

```text
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

여기서 `images` 테이블의 `imageable_id`와 `imageable_type` 컬럼에 주목하세요. `imageable_id`에는 포스트나 유저 등 부모 모델의 ID 값이 들어가고, `imageable_type`에는 부모 모델 클래스 이름이 저장됩니다. Eloquent는 `imageable_type` 컬럼을 이용해 어느 부모 모델의 이미지인지 판단합니다. 예를 들어 이 값에는 `App\Models\Post` 또는 `App\Models\User`가 저장될 수 있습니다.

<a name="one-to-one-polymorphic-model-structure"></a>
#### 모델 구조

이제 이 관계를 만들기 위한 모델 정의 방식을 살펴보겠습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Image extends Model
{
    /**
     * 부모 imageable 모델(User 또는 Post)을 반환합니다.
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
     * 포스트의 이미지를 반환합니다.
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
     * 사용자의 이미지를 반환합니다.
     */
    public function image(): MorphOne
    {
        return $this->morphOne(Image::class, 'imageable');
    }
}
```

<a name="one-to-one-polymorphic-retrieving-the-relationship"></a>
#### 관계 조회하기

데이터베이스 테이블 및 모델 정의가 완료됐으면, 이제 모델을 통해 해당 관계에 접근할 수 있습니다. 예를 들어, 포스트의 이미지를 가져오려면 `image` 동적 프로퍼티에 접근하면 됩니다.

```php
use App\Models\Post;

$post = Post::find(1);

$image = $post->image;
```

폴리모픽 모델의 부모를 조회하려면, `morphTo`를 호출하는 메서드명을 동적 관계 프로퍼티로 사용합니다. 즉, `Image` 모델의 `imageable` 메서드를 사용하면 됩니다.

```php
use App\Models\Image;

$image = Image::find(1);

$imageable = $image->imageable;
```

`Image` 모델의 `imageable` 관계는 이미지가 어떤 부모에 속해 있는지에 따라, 즉, 그 이미지의 소유주가 포스트이면 `Post` 인스턴스가, 사용자인 경우에는 `User` 인스턴스를 반환합니다.

<a name="morph-one-to-one-key-conventions"></a>

#### 주요 규칙

필요하다면, 다형성 자식 모델에서 사용되는 "id"와 "type" 컬럼의 이름을 직접 지정할 수 있습니다. 이 경우에는 반드시 관계의 이름을 `morphTo` 메서드의 첫 번째 인수로 전달해야 합니다. 보통 이 값은 메서드 이름과 일치하므로, PHP의 `__FUNCTION__` 상수를 사용하는 것이 일반적입니다.

```php
/**
 * 이미지를 소유한 모델을 반환합니다.
 */
public function imageable(): MorphTo
{
    return $this->morphTo(__FUNCTION__, 'imageable_type', 'imageable_id');
}
```

<a name="one-to-many-polymorphic-relations"></a>
### 1 대 다 (다형성, Polymorphic)

<a name="one-to-many-polymorphic-table-structure"></a>
#### 테이블 구조

1 대 다 다형성 관계는 일반적인 1 대 다 관계와 비슷하지만, 자식 모델이 하나의 연관 컬럼을 통해 여러 종류의 모델에 소속될 수 있다는 차이점이 있습니다. 예를 들어, 여러분의 애플리케이션 사용자들이 포스트(Post)와 비디오(Video)에 "댓글"을 작성할 수 있다고 가정해보겠습니다. 다형성 관계를 사용하면, `comments` 테이블 하나만으로 포스트나 비디오 모두의 댓글을 관리할 수 있습니다. 먼저, 이 관계를 만들기 위한 테이블 구조를 살펴봅시다.

```text
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

다음으로, 이 관계를 구현하기 위해 필요한 모델 정의 예시를 살펴봅니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Comment extends Model
{
    /**
     * 상위 commentable 모델(포스트 또는 비디오)을 반환합니다.
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
     * 해당 포스트의 모든 댓글을 반환합니다.
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
     * 해당 비디오의 모든 댓글을 반환합니다.
     */
    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }
}
```

<a name="one-to-many-polymorphic-retrieving-the-relationship"></a>
#### 관계 조회하기

데이터베이스 테이블과 모델을 정의한 후에는, 모델의 동적 관계 속성을 통해 관계 데이터에 접근할 수 있습니다. 예를 들어, 특정 포스트의 모든 댓글을 조회할 때는 아래와 같이 `comments` 동적 속성을 사용합니다.

```php
use App\Models\Post;

$post = Post::find(1);

foreach ($post->comments as $comment) {
    // ...
}
```

마찬가지로, 다형성 관계의 자식 모델에서 상위 모델(부모 모델)에 접근하고 싶다면, `morphTo`를 호출하는 메서드의 이름(이 예제에서는 `Comment` 모델의 `commentable` 메서드)을 동적 속성으로 사용하면 됩니다.

```php
use App\Models\Comment;

$comment = Comment::find(1);

$commentable = $comment->commentable;
```

`Comment` 모델의 `commentable` 관계는 댓글의 부모가 무엇인지에 따라 `Post` 또는 `Video` 인스턴스를 반환합니다.

<a name="polymorphic-automatically-hydrating-parent-models-on-children"></a>
#### 자식 모델에 부모 모델 자동 연결(hydrate)

Eloquent에서 eager loading(즉시 로딩)을 사용하더라도, 자식 모델을 반복하면서 그 부모 모델에 접근하려고 하면 "N + 1" 쿼리 문제가 발생할 수 있습니다.

```php
$posts = Post::with('comments')->get();

foreach ($posts as $post) {
    foreach ($post->comments as $comment) {
        echo $comment->commentable->title;
    }
}
```

위 예제에서는 각 `Post` 모델의 댓글(Comment)들은 한 번의 쿼리로 미리 로드되었지만, 각 댓글이 자신의 부모(Post)를 필요로 할 때마다 추가 쿼리가 발생하므로 "N + 1" 문제가 발생하게 됩니다.  

만약 Eloquent가 자식 모델에 부모 모델을 자동으로 연결(hydrate)하도록 만들고 싶다면, 관계 정의 시 `morphMany`에 `chaperone` 메서드를 연이어 호출하면 됩니다.

```php
class Post extends Model
{
    /**
     * 해당 포스트의 모든 댓글을 반환합니다.
     */
    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable')->chaperone();
    }
}
```

또는, 관계를 eager load할 때 런타임에서 자동 부모 연결 기능을 활성화하려면, 아래와 같이 `chaperone`을 사용할 수 있습니다.

```php
use App\Models\Post;

$posts = Post::with([
    'comments' => fn ($comments) => $comments->chaperone(),
])->get();
```

<a name="one-of-many-polymorphic-relations"></a>
### 다수 중 하나 (Polymorphic)

때로는 한 모델이 여러 개의 관련 모델을 가질 수 있는데, 그중에서 "가장 최신" 또는 "가장 오래된" 연관 모델 하나만 쉽게 가져오고 싶을 수도 있습니다. 예를 들어, `User` 모델이 여러 `Image` 모델과 연결되어 있다고 할 때, 사용자가 마지막으로 업로드한 이미지만 쉽게 가져오고 싶다면, `morphOne` 관계와 `ofMany` 계열 메서드를 함께 사용할 수 있습니다.

```php
/**
 * 사용자의 최신 이미지를 반환합니다.
 */
public function latestImage(): MorphOne
{
    return $this->morphOne(Image::class, 'imageable')->latestOfMany();
}
```

마찬가지로, 관계에서 "가장 오래된"(첫 번째) 연관 모델을 가져오려면 아래와 같이 메서드를 정의할 수 있습니다.

```php
/**
 * 사용자의 가장 오래된 이미지를 반환합니다.
 */
public function oldestImage(): MorphOne
{
    return $this->morphOne(Image::class, 'imageable')->oldestOfMany();
}
```

기본적으로, `latestOfMany`와 `oldestOfMany` 메서드는 모델의 정렬 가능한 기본 키(primary key)를 기준으로 가장 최신 또는 오래된 연관 모델을 반환합니다. 하지만, 더 다양한 정렬 기준으로 단 하나의 연관 모델을 조회하고 싶다면 `ofMany` 메서드를 사용할 수 있습니다.

예를 들어, `ofMany` 메서드를 이용하면 사용자의 "가장 많이 좋아요(likes)를 받은" 이미지를 가져올 수 있습니다. `ofMany`는 첫 번째 인수로 정렬할 컬럼 이름을, 두 번째 인수로 집계 함수(`min` 또는 `max`)를 받습니다.

```php
/**
 * 사용자의 가장 인기 있는 이미지를 반환합니다.
 */
public function bestImage(): MorphOne
{
    return $this->morphOne(Image::class, 'imageable')->ofMany('likes', 'max');
}
```

> [!NOTE]
> 더욱 고급스러운 "다수 중 하나(one of many)" 관계를 구현할 수도 있습니다. 자세한 내용은 [has one of many 문서](#advanced-has-one-of-many-relationships)를 참고하세요.

<a name="many-to-many-polymorphic-relations"></a>
### 다 대 다 (Polymorphic)

<a name="many-to-many-polymorphic-table-structure"></a>
#### 테이블 구조

다 대 다(polymorphic) 관계는 "morph one" 또는 "morph many" 관계에 비해 구현 방식이 약간 더 복잡합니다. 예를 들어, `Post` 모델과 `Video` 모델이 모두 `Tag` 모델과 다형성으로 연결되어 있다고 가정해보겠습니다. 이 관계를 통해 애플리케이션에서는 포스트와 비디오 모두에 연결 가능한 고유 태그만을 저장하는 하나의 테이블을 만들 수 있습니다. 먼저, 이 관계를 위한 테이블 구조를 살펴봅시다.

```text
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
> 다형성 다 대 다 관계를 자세히 알아보기 전에, 일반적인 [다 대 다 관계](#many-to-many) 문서를 먼저 읽어보면 이해에 도움이 됩니다.

<a name="many-to-many-polymorphic-model-structure"></a>
#### 모델 구조

이제 각 모델에서 관계 정의를 구현할 차례입니다. `Post`와 `Video` 모델은 모두 기본 Eloquent 모델 클래스의 `morphToMany` 메서드를 호출하는 `tags` 메서드를 포함해야 합니다.

`morphToMany` 메서드는 연관 모델명과 "관계 이름"을 인수로 받습니다. 중간 테이블명과 컬럼명에 맞게 이 관계 이름은 "taggable"로 지정하면 됩니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class Post extends Model
{
    /**
     * 해당 포스트에 연결된 모든 태그를 반환합니다.
     */
    public function tags(): MorphToMany
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }
}
```

<a name="many-to-many-polymorphic-defining-the-inverse-of-the-relationship"></a>
#### 반대 방향(Inverse) 관계 정의

다음으로, `Tag` 모델에서는 각각의 상위 모델(이 예제에서는 `Post`, `Video`)에 대한 메서드를 별도로 작성해주어야 합니다. 즉, `posts`와 `videos` 메서드를 만들고, 모두 `morphedByMany` 메서드의 반환값을 리턴해야 합니다.

`morphedByMany` 메서드 역시 연관 모델명과 "관계 이름"을 인수로 받으며, 기존에 설명한 대로 관계 이름은 "taggable"로 지정합니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class Tag extends Model
{
    /**
     * 이 태그가 할당된 모든 포스트를 반환합니다.
     */
    public function posts(): MorphToMany
    {
        return $this->morphedByMany(Post::class, 'taggable');
    }

    /**
     * 이 태그가 할당된 모든 비디오를 반환합니다.
     */
    public function videos(): MorphToMany
    {
        return $this->morphedByMany(Video::class, 'taggable');
    }
}
```

<a name="many-to-many-polymorphic-retrieving-the-relationship"></a>
#### 관계 조회하기

테이블과 모델이 준비되었다면, 이제 각 모델을 통해 관계 데이터를 조회할 수 있습니다. 예를 들어, 특정 포스트에 연결된 모든 태그를 조회하려면 `tags` 동적 속성을 사용할 수 있습니다.

```php
use App\Models\Post;

$post = Post::find(1);

foreach ($post->tags as $tag) {
    // ...
}
```

다형성 관계의 자식 모델에서 부모 모델에 접근하려면, `morphedByMany`를 호출하는 메서드(이 예시에서는 `Tag` 모델의 `posts` 또는 `videos`)를 동적 속성으로 사용하면 됩니다.

```php
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
### 커스텀 다형성 타입

라라벨은 기본적으로 연관 모델의 타입 정보를 저장할 때 "완전한 클래스명(Fully Qualified Class Name)"을 사용합니다. 예를 들어, 위에서 설명한 1 대 다형성 관계에서 `Comment` 모델이 `Post` 또는 `Video` 모델에 소속된 경우, 기본적으로 `commentable_type` 컬럼 값은 `App\Models\Post` 또는 `App\Models\Video`가 됩니다. 그러나 애플리케이션 내부 구조와 이러한 값들의 결합도를 낮추고 싶은 경우, 클래스명이 아닌 단순 문자열(`post`, `video` 등)로도 저장할 수 있습니다.  

이렇게 하면 모델명이 변경되더라도, 데이터베이스에 저장된 다형성 "타입" 컬럼 값은 유효하게 유지됩니다.

```php
use Illuminate\Database\Eloquent\Relations\Relation;

Relation::enforceMorphMap([
    'post' => 'App\Models\Post',
    'video' => 'App\Models\Video',
]);
```

이 코드는 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 호출하거나, 별도의 서비스 프로바이더를 만들어 사용할 수도 있습니다.

특정 모델의 다형성 별칭(morph alias)을 런타임에서 확인하려면 모델의 `getMorphClass` 메서드를 사용하면 되고, 반대로 별칭과 연결된 완전한 클래스명을 구하려면 `Relation::getMorphedModel` 메서드를 사용할 수 있습니다.

```php
use Illuminate\Database\Eloquent\Relations\Relation;

$alias = $post->getMorphClass();

$class = Relation::getMorphedModel($alias);
```

> [!WARNING]
> 기존 애플리케이션에 "morph map"을 추가하는 경우, 데이터베이스 내 모든 morphable `*_type` 컬럼 값이 기존의 완전한 클래스명에서 "맵" 이름으로 변환되어야 합니다.

<a name="dynamic-relationships"></a>
### 동적 관계

`resolveRelationUsing` 메서드를 사용하면 Eloquent 모델 간의 관계를 런타임에 정의할 수 있습니다. 일반적인 애플리케이션 개발에서는 자주 사용되지 않지만, 때때로 라라벨 패키지를 개발할 때 유용할 수 있습니다.

`resolveRelationUsing` 메서드는 첫 번째 인수로 원하는 관계 이름을 받으며, 두 번째 인수로는 모델 인스턴스를 입력받아 유효한 Eloquent 관계 정의를 반환하는 클로저를 전달해야 합니다. 보통 동적 관계는 [서비스 프로바이더](/docs/12.x/providers)의 boot 메서드 내에서 설정합니다.

```php
use App\Models\Order;
use App\Models\Customer;

Order::resolveRelationUsing('customer', function (Order $orderModel) {
    return $orderModel->belongsTo(Customer::class, 'customer_id');
});
```

> [!WARNING]
> 동적 관계를 정의할 때는 항상 관계 메서드에 명시적인 키 이름 인수를 제공해야 합니다.

<a name="querying-relations"></a>
## 관계 쿼리

모든 Eloquent 관계는 메서드로 정의되므로, 해당 메서드를 호출하면 실제 관계 쿼리를 즉시 실행하지 않고도 관계 인스턴스를 얻을 수 있습니다. 또한, 모든 Eloquent 관계는 [쿼리 빌더](/docs/12.x/queries)로서도 동작하므로, 관계 쿼리를 실행하기 전에 추가적인 조건을 연이어 붙일 수 있습니다.

예를 들어, `User` 모델이 여러 `Post` 모델과 연결된 블로그 애플리케이션이 있다고 가정해봅시다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Model
{
    /**
     * 해당 사용자의 모든 포스트를 반환합니다.
     */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }
}
```

이제 아래와 같이 `posts` 관계에 대해 추가 조건을 붙여 쿼리할 수 있습니다.

```php
use App\Models\User;

$user = User::find(1);

$user->posts()->where('active', 1)->get();
```

라라벨 [쿼리 빌더](/docs/12.x/queries)의 다양한 메서드를 관계 쿼리에도 자유롭게 사용할 수 있으니, 쿼리 빌더 문서도 참고하여 여러 기능을 익혀두는 것을 추천합니다.

<a name="chaining-orwhere-clauses-after-relationships"></a>
#### 관계 쿼리에서 `orWhere` 연속 사용 주의

위 예제처럼 관계 쿼리에 추가 조건을 붙일 때는 자유롭게 메서드를 사용할 수 있지만, `orWhere`를 연속 사용하면 `orWhere` 조건이 관계의 제약조건과 동일한 레벨로 묶인다는 점에 주의해야 합니다.

```php
$user->posts()
    ->where('active', 1)
    ->orWhere('votes', '>=', 100)
    ->get();
```

위 쿼리는 다음과 같은 SQL이 생성됩니다. 여기서 `or` 조건이 추가되어, 100개 이상 투표를 받은 모든 포스트(사용자가 다르더라도)까지도 검색 결과에 포함됩니다.

```sql
select *
from posts
where user_id = ? and active = 1 or votes >= 100
```

대부분의 경우, [논리 그룹(Logical Groups)](/docs/12.x/queries#logical-grouping)을 사용하여 조건을 괄호로 묶어야 합니다.

```php
use Illuminate\Database\Eloquent\Builder;

$user->posts()
    ->where(function (Builder $query) {
        return $query->where('active', 1)
            ->orWhere('votes', '>=', 100);
    })
    ->get();
```

이렇게 하면 아래와 같은 SQL이 생성되며, 논리 그룹핑이 제대로 작동하여 "특정 사용자에서 활성 포스트이거나 100표 이상을 받은 포스트"로 결과가 제한됩니다.

```sql
select *
from posts
where user_id = ? and (active = 1 or votes >= 100)
```

<a name="relationship-methods-vs-dynamic-properties"></a>
### 관계 메서드와 동적 속성의 차이

Eloquent 관계 쿼리에 별도의 추가 조건이 필요 없다면, 관계를 속성처럼 접근하여 데이터를 가져올 수 있습니다. 예를 들어, `User`와 `Post` 예시를 계속 활용하면 아래처럼 쓸 수 있습니다.

```php
use App\Models\User;

$user = User::find(1);

foreach ($user->posts as $post) {
    // ...
}
```

이렇게 동적 관계 속성으로 접근하면 "지연 로딩(Lazy Loading)"이 발생합니다. 즉, 해당 속성이 실제로 필요할 때 데이터가 불러와집니다. 이런 특성 때문에, 개발자들은 모델을 미리 로딩할 때 [eager loading](#eager-loading)을 자주 사용합니다. eager loading을 활용하면 전체 쿼리 수가 줄어들어 성능상 큰 이점이 있습니다.

<a name="querying-relationship-existence"></a>
### 관계 존재성 쿼리

모델을 조회할 때, 특정 관계가 존재하는 경우에만 반환하고 싶을 때가 있습니다. 예를 들어, 1개 이상의 댓글이 달린 블로그 포스트만 조회하려면, `has` 또는 `orHas` 메서드에 관계 이름을 전달하면 됩니다.

```php
use App\Models\Post;

// 댓글이 1개 이상 존재하는 모든 포스트 조회...
$posts = Post::has('comments')->get();
```

연산자 및 카운트 값을 추가로 지정해 쿼리를 더욱 세밀하게 할 수도 있습니다.

```php
// 댓글이 3개 이상인 모든 포스트 조회...
$posts = Post::has('comments', '>=', 3)->get();
```

중첩된 `has` 조건은 "점(.)" 표기법을 사용해 만들 수 있습니다. 예를 들어, 이미지를 포함한 댓글이 최소 1개 이상 있는 포스트를 모두 조회하려면 다음과 같이 할 수 있습니다.

```php
// 하나 이상의 이미지를 가진 댓글이 있는 포스트 조회...
$posts = Post::has('comments.images')->get();
```

더 세밀한 조건이 필요하다면, `whereHas` 또는 `orWhereHas` 메서드를 사용해 `has` 쿼리에 추가 조건을 줄 수 있습니다(예시: 댓글의 내용을 검색).

```php
use Illuminate\Database\Eloquent\Builder;

// 내용이 "code%"로 시작하는 댓글이 있는 포스트를 조회...
$posts = Post::whereHas('comments', function (Builder $query) {
    $query->where('content', 'like', 'code%');
})->get();

// 내용이 "code%"로 시작하는 댓글이 10개 이상인 포스트 조회...
$posts = Post::whereHas('comments', function (Builder $query) {
    $query->where('content', 'like', 'code%');
}, '>=', 10)->get();
```

> [!WARNING]
> Eloquent는 현재 다른 데이터베이스에 있는 관계의 존재성 쿼리를 지원하지 않습니다. 관계는 반드시 같은 데이터베이스 내에 있어야만 쿼리가 가능합니다.

<a name="many-to-many-relationship-existence-queries"></a>
#### 다 대 다 관계의 존재성 쿼리

`whereAttachedTo` 메서드는 다 대 다 관계에서 특정 모델(또는 모델 컬렉션)에 연결되어 있는 레코드를 조회할 때 사용합니다.

```php
$users = User::whereAttachedTo($role)->get();
```

`whereAttachedTo` 메서드에는 [컬렉션](/docs/12.x/eloquent-collections) 인스턴스를 인수로 넘길 수도 있습니다. 이 경우 컬렉션 내의 모델들 중 하나에라도 연결된 모든 레코드를 조회합니다.

```php
$tags = Tag::whereLike('name', '%laravel%')->get();

$posts = Post::whereAttachedTo($tags)->get();
```

<a name="inline-relationship-existence-queries"></a>
#### 인라인 관계 존재성 쿼리

특정 관계 쿼리에 간단한 where 조건을 추가하여 관계의 존재여부를 조회하고 싶다면, `whereRelation`, `orWhereRelation`, `whereMorphRelation`, `orWhereMorphRelation` 메서드를 사용하는 것이 더 편리할 수 있습니다. 예를 들어, 승인되지 않은(unapproved) 댓글이 달린 모든 포스트를 조회할 수 있습니다.

```php
use App\Models\Post;

$posts = Post::whereRelation('comments', 'is_approved', false)->get();
```

물론, 쿼리 빌더의 `where` 메서드처럼 연산자를 명시할 수도 있습니다.

```php
$posts = Post::whereRelation(
    'comments', 'created_at', '>=', now()->subHour()
)->get();
```

<a name="querying-relationship-absence"></a>
### 관계 부재(Absence) 쿼리

모델을 조회할 때, 특정 관계가 **없는** 경우만 결과로 반환하고자 할 때가 있습니다. 예를 들어 댓글이 **하나도 없는** 블로그 포스트만 모두 조회하고 싶다면 `doesntHave` 또는 `orDoesntHave` 메서드에 관계 이름을 전달하면 됩니다.

```php
use App\Models\Post;

$posts = Post::doesntHave('comments')->get();
```

더 복잡한 쿼리가 필요하다면, `whereDoesntHave` 또는 `orWhereDoesntHave` 메서드를 사용하여 조건을 걸 수 있습니다. 예를 들어, 댓글 내용에 조건을 붙일 수 있습니다.

```php
use Illuminate\Database\Eloquent\Builder;

$posts = Post::whereDoesntHave('comments', function (Builder $query) {
    $query->where('content', 'like', 'code%');
})->get();
```

"점(.)" 표기법을 사용하면 중첩 관계에도 부재 쿼리를 적용할 수 있습니다. 예를 들어, 아래 쿼리는 댓글이 아예 없는 포스트뿐 아니라, 댓글이 있더라도 댓글 작성자가 `banned`(차단)된 사용자가 **아닌** 댓글만 있는 포스트도 모두 조회합니다.

```php
use Illuminate\Database\Eloquent\Builder;

$posts = Post::whereDoesntHave('comments.author', function (Builder $query) {
    $query->where('banned', 1);
})->get();
```

<a name="querying-morph-to-relationships"></a>

### Morph To 관계 쿼리하기

"morph to" 관계의 존재 여부를 쿼리하려면 `whereHasMorph` 및 `whereDoesntHaveMorph` 메서드를 사용할 수 있습니다. 이 메서드의 첫 번째 인수로는 관계의 이름을 입력합니다. 그 다음, 쿼리에 포함하고자 하는 관련 모델들의 이름을 지정합니다. 마지막으로, 관계 쿼리를 커스터마이징할 수 있도록 클로저를 전달할 수 있습니다.

```php
use App\Models\Comment;
use App\Models\Post;
use App\Models\Video;
use Illuminate\Database\Eloquent\Builder;

// 제목이 code%로 시작하는 post나 video에 연결된 댓글만 조회...
$comments = Comment::whereHasMorph(
    'commentable',
    [Post::class, Video::class],
    function (Builder $query) {
        $query->where('title', 'like', 'code%');
    }
)->get();

// 제목이 code%로 시작하지 않는 post에 연결된 댓글만 조회...
$comments = Comment::whereDoesntHaveMorph(
    'commentable',
    Post::class,
    function (Builder $query) {
        $query->where('title', 'like', 'code%');
    }
)->get();
```

때때로, 관련 다형성 모델의 "타입"에 따라 쿼리 제약 조건을 추가해야 할 수 있습니다. `whereHasMorph` 메서드에 전달하는 클로저의 두 번째 인자로 `$type` 값을 받을 수 있습니다. 이를 통해 어떤 타입의 쿼리를 작성 중인지 확인할 수 있습니다.

```php
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

때로는 "morph to" 관계의 부모를 기준으로 하위 모델을 쿼리하고 싶을 수 있습니다. 이럴 때는 `whereMorphedTo` 및 `whereNotMorphedTo` 메서드를 사용하면 됩니다. 이 메서드는 지정된 모델에 대해 올바른 morph type 매핑을 자동으로 찾습니다. 첫 번째 인자로는 `morphTo` 관계의 이름, 두 번째 인자로는 관련 부모 모델을 입력합니다.

```php
$comments = Comment::whereMorphedTo('commentable', $post)
    ->orWhereMorphedTo('commentable', $video)
    ->get();
```

<a name="querying-all-morph-to-related-models"></a>
#### 모든 관련 모델 쿼리하기

가능한 다형성 모델들의 배열 대신, `*`를 와일드카드 값으로 지정할 수도 있습니다. 이렇게 하면 라라벨이 데이터베이스에서 가능한 모든 다형성 타입을 조회하여 쿼리에 활용합니다. 이 작업을 위해 라라벨은 추가 쿼리를 실행합니다.

```php
use Illuminate\Database\Eloquent\Builder;

$comments = Comment::whereHasMorph('commentable', '*', function (Builder $query) {
    $query->where('title', 'like', 'foo%');
})->get();
```

<a name="aggregating-related-models"></a>
## 관련 모델 집계

<a name="counting-related-models"></a>
### 관련 모델의 개수 세기

특정 관계에 연결된 관련 모델의 개수만 알고 싶고, 실제 모델 데이터를 로드할 필요가 없다면 `withCount` 메서드를 사용할 수 있습니다. `withCount` 메서드는 결과 모델에 `{relation}_count` 속성을 추가합니다.

```php
use App\Models\Post;

$posts = Post::withCount('comments')->get();

foreach ($posts as $post) {
    echo $post->comments_count;
}
```

`withCount` 메서드에 배열을 전달하면 여러 관계의 "개수"도 함께 지정할 수 있으며, 각 쿼리에 추가 제약 조건도 줄 수 있습니다.

```php
use Illuminate\Database\Eloquent\Builder;

$posts = Post::withCount(['votes', 'comments' => function (Builder $query) {
    $query->where('content', 'like', 'code%');
}])->get();

echo $posts[0]->votes_count;
echo $posts[0]->comments_count;
```

관계 개수 결과에 별칭을 지정할 수도 있는데, 이를 통해 같은 관계에 대해 여러 개의 count를 할 수 있습니다.

```php
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
#### 지연된 개수 로드

`loadCount` 메서드를 사용하면 이미 부모 모델을 조회한 후에도 관계 개수를 나중에 로드할 수 있습니다.

```php
$book = Book::first();

$book->loadCount('genres');
```

개수 쿼리에 추가 제약 조건을 주려면, 개수를 세고 싶은 관계명을 키로 하는 배열을 넘깁니다. 배열 값에는 쿼리 빌더 인스턴스를 받는 클로저를 넣습니다.

```php
$book->loadCount(['reviews' => function (Builder $query) {
    $query->where('rating', 5);
}])
```

<a name="relationship-counting-and-custom-select-statements"></a>
#### 관계 개수와 사용자 정의 SELECT 문

`withCount`와 `select` 문을 함께 사용할 때에는, 반드시 `select` 뒤에 `withCount`를 호출해야 합니다.

```php
$posts = Post::select(['title', 'body'])
    ->withCount('comments')
    ->get();
```

<a name="other-aggregate-functions"></a>
### 기타 집계 함수

`withCount` 메서드 외에도 Eloquent는 `withMin`, `withMax`, `withAvg`, `withSum`, `withExists` 등의 집계 메서드를 제공합니다. 이 메서드들은 결과 모델에 `{relation}_{function}_{column}` 형식의 속성을 추가합니다.

```php
use App\Models\Post;

$posts = Post::withSum('comments', 'votes')->get();

foreach ($posts as $post) {
    echo $post->comments_sum_votes;
}
```

집계 함수 결과를 다른 이름으로 접근하고 싶다면 별칭(alias)을 지정할 수 있습니다.

```php
$posts = Post::withSum('comments as total_comments', 'votes')->get();

foreach ($posts as $post) {
    echo $post->total_comments;
}
```

`loadCount`와 마찬가지로, 이 메서드들에도 지연 로딩 버전이 있습니다. 이미 조회한 Eloquent 모델에도 이런 집계 연산을 나중에 수행할 수 있습니다.

```php
$post = Post::first();

$post->loadSum('comments', 'votes');
```

이런 집계 메서드를 `select` 문과 함께 사용할 때도, 반드시 집계 메서드를 `select` 이후에 호출해야 합니다.

```php
$posts = Post::select(['title', 'body'])
    ->withExists('comments')
    ->get();
```

<a name="counting-related-models-on-morph-to-relationships"></a>
### Morph To 관계에서 관련 모델 개수 세기

"morph to" 관계를 eager load(즉시 로딩)하면서, 이 관계가 반환할 수 있는 여러 엔터티의 관련 모델 개수도 함께 불러오고 싶다면, `with` 메서드와 `morphTo` 관계의 `morphWithCount` 메서드를 조합해 사용할 수 있습니다.

이 예제에서는 `Photo`와 `Post` 모델이 `ActivityFeed` 모델을 생성할 수 있다고 가정합니다. `ActivityFeed` 모델에는 부모인 `Photo` 또는 `Post` 모델을 조회할 수 있는 "morph to" 관계인 `parentable`이 정의되어 있다고 가정합니다. 추가로, `Photo` 모델은 `Tag` 모델과 "has many" 관계이며, `Post` 모델은 `Comment` 모델과 "has many" 관계라고 가정합니다.

여기서 우리는 각 `ActivityFeed` 인스턴스에 대해 `parentable` 부모 모델을 eager load 하고, 각 부모 photo에 연결된 태그 개수와, 각 부모 post에 연결된 댓글 개수를 조회하고자 합니다.

```php
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
#### 지연된 Morph To 개수 로드

이미 `ActivityFeed` 모델을 조회했다는 가정 하에, 연관된 여러 `parentable` 모델의 하위 관계 개수를 나중에 로드하고 싶다면 `loadMorphCount` 메서드를 사용할 수 있습니다.

```php
$activities = ActivityFeed::with('parentable')->get();

$activities->loadMorphCount('parentable', [
    Photo::class => ['tags'],
    Post::class => ['comments'],
]);
```

<a name="eager-loading"></a>
## 즉시 로딩(Eager Loading)

Eloquent 관계를 속성으로 접근하면, 관련된 모델이 "지연 로딩(lazy loaded)" 방식으로 불러와집니다. 즉, 처음 속성에 접근할 때까지 관계 데이터가 실제로 로드되지 않습니다. 하지만 Eloquent에서는 부모 모델을 조회하면서 관계도 한 번에 불러오는 "즉시 로딩(eager loading)"을 지원합니다. 즉시 로딩을 사용하면 "N + 1" 쿼리 문제를 해결할 수 있습니다. 예를 들어, `Book` 모델이 `Author` 모델과 "belongs to" 관계라고 가정해봅시다.

```php
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

여기서 모든 책과 각 책의 저자를 조회해보겠습니다.

```php
use App\Models\Book;

$books = Book::all();

foreach ($books as $book) {
    echo $book->author->name;
}
```

위 반복문은 데이터베이스에서 책 전체를 가져오는 쿼리를 1회 실행하고, 각 책마다 저자를 가져오기 위해 추가 쿼리를 실행합니다. 즉, 책이 25권이라면 전체 책 1회 + 저자 25회, 총 26회의 쿼리가 수행됩니다.

다행히, eager loading을 사용하면 이 작업을 단 2번의 쿼리로 줄일 수 있습니다. 쿼리를 작성할 때 `with` 메서드로 즉시 로딩할 관계를 지정합니다.

```php
$books = Book::with('author')->get();

foreach ($books as $book) {
    echo $book->author->name;
}
```

이렇게 하면, 전체 책을 1회, 책에 해당하는 저자를 1회, 총 2건의 쿼리만 실행됩니다.

```sql
select * from books

select * from authors where id in (1, 2, 3, 4, 5, ...)
```

<a name="eager-loading-multiple-relationships"></a>
#### 여러 관계 즉시 로딩

동시에 여러 다른 관계도 즉시 로딩해야 할 때가 있습니다. 이럴 때는 `with` 메서드에 관계명 배열을 전달하면 됩니다.

```php
$books = Book::with(['author', 'publisher'])->get();
```

<a name="nested-eager-loading"></a>
#### 중첩 관계 즉시 로딩

관계의 관계까지 즉시 로딩하려면 "닷(dot) 문법"을 사용합니다. 예를 들어, 모든 책의 저자와, 각각 저자의 연락처도 즉시 로딩하고 싶다면 다음과 같이 작성할 수 있습니다.

```php
$books = Book::with('author.contacts')->get();
```

또는 여러 중첩 관계를 한 번에 불러올 때는 중첩 배열을 `with` 메서드에 전달할 수도 있습니다.

```php
$books = Book::with([
    'author' => [
        'contacts',
        'publisher',
    ],
])->get();
```

<a name="nested-eager-loading-morphto-relationships"></a>
#### `morphTo` 관계의 중첩 즉시 로딩

`morphTo` 관계와, 이 관계가 반환할 수 있는 여러 엔터티의 중첩 관계까지 eager load 하고 싶을 때는, `with` 메서드와 `morphTo` 관계의 `morphWith` 메서드를 조합해 사용할 수 있습니다. 이를 설명하기 위해 다음과 같은 모델을 가정해보겠습니다.

```php
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

이 예제에서는 `Event`, `Photo`, `Post` 모델이 `ActivityFeed` 모델을 생성한다고 가정합니다. 또한 `Event` 모델은 `Calendar` 모델과 연결되어 있고, `Photo` 모델은 `Tag` 모델과, `Post` 모델은 `Author` 모델과 연결되어 있다고 가정합니다.

이 모델 정의와 관계를 바탕으로, 각 `ActivityFeed` 인스턴스와 그에 연결된 `parentable`(각각 해당하는 모델의 중첩 관계 포함)까지 eager load 할 수 있습니다.

```php
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
#### 즉시 로딩 시 특정 컬럼만 가져오기

관계에서 모든 컬럼이 필요하지 않을 때가 있습니다. Eloquent는 즉시 로딩 시 어떤 컬럼만 조회할지 지정할 수 있게 해줍니다.

```php
$books = Book::with('author:id,name,book_id')->get();
```

> [!WARNING]
> 이 기능을 사용할 때는 무조건 `id` 컬럼과 외래 키(foreign key) 컬럼을 반드시 조회 컬럼 목록에 포함해야 합니다.

<a name="eager-loading-by-default"></a>
#### 기본 즉시 로딩

항상 모델을 조회할 때 특정 관계도 기본으로 불러오고 싶을 수 있습니다. 이럴 경우, 모델에 `$with` 속성을 정의하면 됩니다.

```php
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

단일 쿼리에서 `$with` 속성의 일부만 제거하고 싶다면 `without` 메서드를 사용할 수 있습니다.

```php
$books = Book::without('author')->get();
```

특정 쿼리에서 `$with`에 정의된 모든 관계를 오버라이드하고 싶다면 `withOnly` 메서드로 가능합니다.

```php
$books = Book::withOnly('genre')->get();
```

<a name="constraining-eager-loads"></a>
### 즉시 로딩 쿼리에 제약 조건 추가하기

간혹 관계를 즉시 로딩하면서, 불러오는 쿼리에 추가 제약 조건을 주고 싶을 때가 있습니다. 이때는 `with` 메서드에 관계명을 key, 해당 쿼리를 제약하는 클로저를 value로 하는 배열을 전달합니다.

```php
use App\Models\User;
use Illuminate\Contracts\Database\Eloquent\Builder;

$users = User::with(['posts' => function (Builder $query) {
    $query->where('title', 'like', '%code%');
}])->get();
```

이 예제에서, Eloquent는 post의 `title` 컬럼에 'code'라는 단어가 들어 있는 post만을 즉시 로딩합니다. [쿼리 빌더](/docs/12.x/queries)의 다양한 메서드로 쿼리를 더욱 커스터마이징할 수도 있습니다.

```php
$users = User::with(['posts' => function (Builder $query) {
    $query->orderBy('created_at', 'desc');
}])->get();
```

<a name="constraining-eager-loading-of-morph-to-relationships"></a>
#### `morphTo` 관계의 즉시 로딩 쿼리 제약

`morphTo` 관계를 즉시 로딩하면, Eloquent는 각 타입별 관련 모델을 가져오기 위해 여러 쿼리를 실행합니다. 이때 관계의 `constrain` 메서드로 각 쿼리에 개별 제약을 줄 수 있습니다.

```php
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

이 예제에서는, 숨겨지지 않은 post와, `type` 값이 "educational"인 video만 eager load됩니다.

<a name="constraining-eager-loads-with-relationship-existence"></a>
#### 관계 존재 여부로 즉시 로딩 제한하기

관계가 존재하는지 검사하는 동시에, 동일한 조건으로 관계를 즉시 로딩하고 싶을 때도 있습니다. 예를 들어, 특정 조건을 만족하는 child `Post` 모델이 있는 `User`만 불러오면서, 해당 Post들도 모두 eager load 하고 싶다면, 다음과 같이 `withWhereHas` 메서드를 사용하면 됩니다.

```php
use App\Models\User;

$users = User::withWhereHas('posts', function ($query) {
    $query->where('featured', true);
})->get();
```

<a name="lazy-eager-loading"></a>
### 지연된 즉시 로딩(Lazy Eager Loading)

이미 부모 모델을 조회한 뒤에 관계를 eager load 해야 할 때도 있습니다. 예를 들어, 조건에 따라 관련 모델의 로딩 여부를 동적으로 결정해야 할 경우에 유용합니다.

```php
use App\Models\Book;

$books = Book::all();

if ($someCondition) {
    $books->load('author', 'publisher');
}
```

즉시 로딩 쿼리에 추가 제약 조건이 필요하다면, 로드하려는 관계명을 키로, 쿼리 인스턴스를 받는 클로저를 값으로 하는 배열을 전달하면 됩니다.

```php
$author->load(['books' => function (Builder $query) {
    $query->orderBy('published_date', 'asc');
}]);
```

아직 로드되지 않은 관계만을 로드하려면 `loadMissing` 메서드를 사용합니다.

```php
$book->loadMissing('author');
```

<a name="nested-lazy-eager-loading-morphto"></a>
#### 중첩 지연 즉시 로딩과 `morphTo`

`morphTo` 관계와, 이 관계가 반환할 수 있는 여러 엔터티의 중첩 관계까지 eager load 하고 싶을 때는 `loadMorph` 메서드를 사용하면 됩니다.

이 메서드는 첫 번째 인수로 `morphTo` 관계 이름, 두 번째 인수로는 모델/관계 쌍의 배열을 받습니다. 다음과 같은 모델을 예로 들어 설명하겠습니다.

```php
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

이 예제에서는 `Event`, `Photo`, `Post` 모델이 `ActivityFeed` 모델을 생성하며, 각각 `Calendar`, `Tag`, `Author` 모델과 관계를 맺고 있다고 가정합니다.

이러한 모델 정의와 관계를 바탕으로 모든 `ActivityFeed` 인스턴스와 연결된 `parentable` 모델(및 그들의 중첩 관계)을 모두 eager load 할 수 있습니다.

```php
$activities = ActivityFeed::with('parentable')
    ->get()
    ->loadMorph('parentable', [
        Event::class => ['calendar'],
        Photo::class => ['tags'],
        Post::class => ['author'],
    ]);
```

<a name="automatic-eager-loading"></a>
### 자동 즉시 로딩

> [!WARNING]
> 이 기능은 현재 피드백 수집을 위한 베타 버전입니다. 기능 및 동작이 패치 릴리즈에서도 변경될 수 있습니다.

많은 경우, 라라벨이 접근하는 관계를 자동으로 eager load할 수 있습니다. 자동 즉시 로딩을 활성화하려면, 애플리케이션의 `AppServiceProvider`의 `boot` 메서드에서 `Model::automaticallyEagerLoadRelationships` 메서드를 호출하면 됩니다.

```php
use Illuminate\Database\Eloquent\Model;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Model::automaticallyEagerLoadRelationships();
}
```

이 기능이 활성화되면, 라라벨은 아직 로드되지 않은 관계에 접근할 때 자동으로 해당 관계를 eager load 하려고 시도합니다. 예를 들어 다음 시나리오를 살펴보겠습니다.

```php
use App\Models\User;

$users = User::all();

foreach ($users as $user) {
    foreach ($user->posts as $post) {
        foreach ($post->comments as $comment) {
            echo $comment->content;
        }
    }
}
```

일반적으로 위 코드는 각 사용자의 posts를 가져오기 위해 사용자별로 쿼리를 1번씩 실행하며, 각 post의 comments를 가져오기 위해서도 post별로 쿼리가 실행됩니다. 하지만 `automaticallyEagerLoadRelationships` 기능이 활성화된 경우, posts에 처음 접근할 때 모든 사용자에 대한 posts가 한 번에 로드되고, 마찬가지로 comments에 처음 접근할 때 모든 post에 대한 comments가 한 번에 lazy eager load(지연된 즉시 로딩) 됩니다.

이 기능을 전역으로 활성화하고 싶지 않은 경우, Eloquent 컬렉션 인스턴스별로 `withRelationshipAutoloading` 메서드를 통해 자동 즉시 로딩 기능을 켤 수도 있습니다.

```php
$users = User::where('vip', true)->get();

return $users->withRelationshipAutoloading();
```

<a name="preventing-lazy-loading"></a>

### 지연(레이지) 로딩 방지하기

앞서 설명했듯이, 관계를 즉시(Eager) 로딩하는 것은 애플리케이션의 성능을 크게 향상시킬 수 있습니다. 따라서 원한다면 라라벨에게 관계의 지연(레이지) 로딩을 항상 방지하도록 지시할 수 있습니다. 이를 위해, 기본 Eloquent 모델 클래스에서 제공하는 `preventLazyLoading` 메서드를 사용하면 됩니다. 일반적으로 이 메서드는 애플리케이션의 `AppServiceProvider` 클래스의 `boot` 메서드 안에서 호출하는 것이 좋습니다.

`preventLazyLoading` 메서드는 지연 로딩을 방지할지 여부를 나타내는 옵션 불리언 인수를 받습니다. 예를 들어, 운영(프로덕션)이 아닌 환경에서만 지연 로딩을 막고, 운영 환경에서는 코드에 지연 로딩이 있어도 정상적으로 동작하도록 하고 싶을 때 아래와 같이 사용할 수 있습니다.

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

지연 로딩이 방지된 후 애플리케이션에서 Eloquent 관계를 지연 로딩하려고 하면 Eloquent가 `Illuminate\Database\LazyLoadingViolationException` 예외를 발생시킵니다.

또한, `handleLazyLoadingViolationsUsing` 메서드를 사용해서 지연 로딩 위반 발생 시의 동작을 사용자 정의할 수 있습니다. 이 메서드를 통해 예외를 발생시키는 대신 단순히 로그만 남기는 식으로 처리할 수 있습니다.

```php
Model::handleLazyLoadingViolationUsing(function (Model $model, string $relation) {
    $class = $model::class;

    info("Attempted to lazy load [{$relation}] on model [{$class}].");
});
```

<a name="inserting-and-updating-related-models"></a>
## 관련 모델 삽입 및 갱신하기

<a name="the-save-method"></a>
### `save` 메서드

Eloquent는 관계에 새로운 모델을 추가할 수 있는 편리한 메서드를 제공합니다. 예를 들어, 게시물에 새로운 댓글을 추가해야 한다고 가정해봅시다. 직접 `Comment` 모델의 `post_id` 속성을 수동으로 지정하는 대신, 관계의 `save` 메서드를 사용하여 댓글을 추가할 수 있습니다.

```php
use App\Models\Comment;
use App\Models\Post;

$comment = new Comment(['message' => 'A new comment.']);

$post = Post::find(1);

$post->comments()->save($comment);
```

여기서 `comments` 관계를 동적 속성으로 접근하지 않고, 메서드로 호출하여 관계 인스턴스를 얻은 점에 주목하세요. `save` 메서드는 적절한 `post_id` 값을 새 `Comment` 모델에 자동으로 지정해줍니다.

여러 개의 관련 모델을 한 번에 저장하려면 `saveMany` 메서드를 사용할 수 있습니다.

```php
$post = Post::find(1);

$post->comments()->saveMany([
    new Comment(['message' => 'A new comment.']),
    new Comment(['message' => 'Another new comment.']),
]);
```

`save`와 `saveMany` 메서드는 전달한 모델 인스턴스를 저장하지만, 이미 부모 모델에 로드되어 있는 관계의 메모리에는 새롭게 저장된 모델이 자동으로 추가되지는 않습니다. 저장 이후에 관계를 바로 접근할 계획이 있다면, 모델과 관계를 다시 로드하기 위해 `refresh` 메서드를 사용하는 것이 좋습니다.

```php
$post->comments()->save($comment);

$post->refresh();

// 새로 저장된 댓글을 포함하여 모든 댓글...
$post->comments;
```

<a name="the-push-method"></a>
#### 모델과 관계를 재귀적으로 저장하기

모델뿐만 아니라 그와 연관된 관계까지 함께 저장하고 싶다면 `push` 메서드를 사용할 수 있습니다. 아래 예시처럼, `Post` 모델뿐 아니라 댓글, 각각의 댓글의 작성자까지 모두 저장됩니다.

```php
$post = Post::find(1);

$post->comments[0]->message = 'Message';
$post->comments[0]->author->name = 'Author Name';

$post->push();
```

`pushQuietly` 메서드는 이벤트(이벤트 발생)를 일으키지 않고 모델 및 연관 관계를 저장할 때 사용할 수 있습니다.

```php
$post->pushQuietly();
```

<a name="the-create-method"></a>
### `create` 메서드

`save`와 `saveMany` 외에도, 속성 배열을 받아서 모델을 생성하고 데이터베이스에 저장하는 `create` 메서드도 사용할 수 있습니다. `save`는 전체 Eloquent 모델 인스턴스를 전달받는 반면, `create`는 평범한 PHP 배열을 인수로 받습니다. `create` 메서드는 새로 생성된 모델을 반환합니다.

```php
use App\Models\Post;

$post = Post::find(1);

$comment = $post->comments()->create([
    'message' => 'A new comment.',
]);
```

여러 개의 관련 모델을 한 번에 생성하려면 `createMany` 메서드를 사용할 수 있습니다.

```php
$post = Post::find(1);

$post->comments()->createMany([
    ['message' => 'A new comment.'],
    ['message' => 'Another new comment.'],
]);
```

이벤트 발생 없이 모델을 생성할 때는 `createQuietly`나 `createManyQuietly` 메서드를 사용할 수 있습니다.

```php
$user = User::find(1);

$user->posts()->createQuietly([
    'title' => 'Post title.',
]);

$user->posts()->createManyQuietly([
    ['title' => 'First post.'],
    ['title' => 'Second post.'],
]);
```

또한, `findOrNew`, `firstOrNew`, `firstOrCreate`, `updateOrCreate`와 같은 메서드를 사용해서 [관계에서의 모델 생성 및 갱신](/docs/12.x/eloquent#upserts)도 가능합니다.

> [!NOTE]
> `create` 메서드를 사용하기 전에 반드시 [대량 할당](/docs/12.x/eloquent#mass-assignment) 문서를 먼저 참고하셔야 합니다.

<a name="updating-belongs-to-relationships"></a>
### Belongs To(소속) 관계 수정

자식 모델을 새로운 부모 모델에 할당하고 싶다면 `associate` 메서드를 사용할 수 있습니다. 아래 예시에서, `User` 모델은 `Account` 모델과 belongsTo 관계를 가집니다. `associate` 메서드는 자식(여기서는 `User`) 모델의 외래 키(foreign key)를 지정해줍니다.

```php
use App\Models\Account;

$account = Account::find(10);

$user->account()->associate($account);

$user->save();
```

자식 모델에서 부모 모델의 연관을 해제(끊기)하려면 `dissociate` 메서드를 사용합니다. 이 메서드는 해당 관계의 외래 키를 `null`로 설정합니다.

```php
$user->account()->dissociate();

$user->save();
```

<a name="updating-many-to-many-relationships"></a>
### 다대다(Many to Many) 관계 수정

<a name="attaching-detaching"></a>
#### 관계 연결(attach) / 분리(detach)

Eloquent는 다대다 관계 작업을 더 쉽게 할 수 있는 다양한 메서드도 제공합니다. 예를 들어, 사용자는 여러 역할(role)을 가질 수 있고, 역할 역시 여러 사용자를 가질 수 있다고 가정해봅시다. 아래와 같이 `attach` 메서드를 사용해서 사용자의 역할을 중간 테이블에 레코드를 추가하는 방식으로 부여할 수 있습니다.

```php
use App\Models\User;

$user = User::find(1);

$user->roles()->attach($roleId);
```

관계를 연결할 때 중간 테이블에 추가 데이터도 자동으로 넣고 싶다면 아래와 같이 배열 형태로 전달할 수 있습니다.

```php
$user->roles()->attach($roleId, ['expires' => $expires]);
```

가끔은 사용자로부터 특정 역할을 제거해야 할 수도 있습니다. 다대다 관계의 레코드를 삭제하려면 `detach` 메서드를 사용합니다. 이 메서드는 중간 테이블에서 해당 레코드를 삭제하지만, 두 관련 모델(여기서는 사용자와 역할)은 데이터베이스에서 삭제하지 않습니다.

```php
// 사용자로부터 한 역할만 분리(detach)할 때...
$user->roles()->detach($roleId);

// 모든 역할을 사용자로부터 분리할 때...
$user->roles()->detach();
```

편의를 위해, `attach` 및 `detach` 메서드는 ID 배열을 인수로 받을 수도 있습니다.

```php
$user = User::find(1);

$user->roles()->detach([1, 2, 3]);

$user->roles()->attach([
    1 => ['expires' => $expires],
    2 => ['expires' => $expires],
]);
```

<a name="syncing-associations"></a>
#### 관계 동기화(sync)

`sync` 메서드를 사용하면 다대다 관계를 원하는 상태로 한 번에 맞출 수 있습니다. 이 메서드는 중간 테이블에 남길 ID들의 배열을 받으며, 배열에 없는 ID는 중간 테이블에서 삭제됩니다. 즉, 이 연산이 끝난 후 주어진 배열에 있는 ID만 중간 테이블에 남게 됩니다.

```php
$user->roles()->sync([1, 2, 3]);
```

ID와 함께 중간 테이블의 추가 값도 전달할 수 있습니다.

```php
$user->roles()->sync([1 => ['expires' => true], 2, 3]);
```

동기화되는 각 모델 ID에 대해 동일한 중간 테이블 값이 필요하다면 `syncWithPivotValues` 메서드를 사용할 수 있습니다.

```php
$user->roles()->syncWithPivotValues([1, 2, 3], ['active' => true]);
```

주어진 배열에 없는 기존 ID를 자동으로 분리(detach)하지 않고, 새로운 ID만 추가(동기화)하고 싶다면 `syncWithoutDetaching` 메서드를 사용할 수 있습니다.

```php
$user->roles()->syncWithoutDetaching([1, 2, 3]);
```

<a name="toggling-associations"></a>
#### 관계 토글(toggle)

다대다 관계에서는 `toggle` 메서드도 제공합니다. 이 메서드는 전달한 관련 모델 ID의 연결 상태를 "반전"합니다. 즉, 이미 연결(attach)되어 있으면 분리(detach)하고, 분리되어 있으면 연결(attach)합니다.

```php
$user->roles()->toggle([1, 2, 3]);
```

ID와 함께 추가 중간 테이블 값도 전달할 수 있습니다.

```php
$user->roles()->toggle([
    1 => ['expires' => true],
    2 => ['expires' => true],
]);
```

<a name="updating-a-record-on-the-intermediate-table"></a>
#### 중간 테이블 레코드 갱신

연관 관계의 중간 테이블에 이미 존재하는 행을 업데이트해야 한다면 `updateExistingPivot` 메서드를 사용할 수 있습니다. 이 메서드는 중간 테이블 레코드의 외래 키와, 변경할 속성 배열을 인수로 받습니다.

```php
$user = User::find(1);

$user->roles()->updateExistingPivot($roleId, [
    'active' => false,
]);
```

<a name="touching-parent-timestamps"></a>
## 부모 모델의 타임스탬프(timestamps) 업데이트하기

모델이 `belongsTo` 또는 `belongsToMany` 관계를 가질 때(예: 댓글(Comment)이 게시물(Post)에 소속된 경우), 자식 모델이 수정되었을 때 부모의 타임스탬프도 함께 갱신하면 유용할 때가 있습니다.

예를 들어, `Comment` 모델이 업데이트될 때 소유하고 있는 `Post`의 `updated_at` 타임스탬프도 현재 날짜와 시간으로 자동 변경되도록 할 수 있습니다. 이를 위해, 자식 모델에 `$touches` 속성을 추가하고, 변경 시 타임스탬프가 갱신되어야 하는 관계 명을 배열로 지정하면 됩니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comment extends Model
{
    /**
     * 타임스탬프가 갱신되어야 할 모든 관계들
     *
     * @var array
     */
    protected $touches = ['post'];

    /**
     * 댓글이 소속된 게시물을 가져옵니다.
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }
}
```

> [!WARNING]
> 부모 모델의 타임스탬프는 자식 모델이 Eloquent의 `save` 메서드를 이용해 저장될 때에만 갱신됩니다.