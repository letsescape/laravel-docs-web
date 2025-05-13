# 일러퀀트: 관계 (Eloquent: Relationships)

- [소개](#introduction)
- [관계 정의하기](#defining-relationships)
    - [일대일 / hasOne](#one-to-one)
    - [일대다 / hasMany](#one-to-many)
    - [일대다 (역방향) / belongsTo](#one-to-many-inverse)
    - [여러 개 중 하나(hasOne of Many)](#has-one-of-many)
    - [중간 테이블을 통한 일대일(hasOneThrough)](#has-one-through)
    - [중간 테이블을 통한 일대다(hasManyThrough)](#has-many-through)
- [스코프 관계(Scoped Relationships)](#scoped-relationships)
- [다대다 관계](#many-to-many)
    - [중간 테이블 컬럼 조회](#retrieving-intermediate-table-columns)
    - [중간 테이블 컬럼을 통한 쿼리 필터링](#filtering-queries-via-intermediate-table-columns)
    - [중간 테이블 컬럼을 통한 쿼리 정렬](#ordering-queries-via-intermediate-table-columns)
    - [사용자 정의 중간 테이블 모델 정의](#defining-custom-intermediate-table-models)
- [폴리모픽 관계](#polymorphic-relationships)
    - [일대일](#one-to-one-polymorphic-relations)
    - [일대다](#one-to-many-polymorphic-relations)
    - [여러 개 중 하나 (One of Many)](#one-of-many-polymorphic-relations)
    - [다대다](#many-to-many-polymorphic-relations)
    - [사용자 정의 폴리모픽 타입](#custom-polymorphic-types)
- [동적 관계](#dynamic-relationships)
- [관계 쿼리](#querying-relations)
    - [관계 메서드 vs. 동적 프로퍼티](#relationship-methods-vs-dynamic-properties)
    - [관계 존재 쿼리](#querying-relationship-existence)
    - [관계 부재 쿼리](#querying-relationship-absence)
    - [Morph To 관계 쿼리](#querying-morph-to-relationships)
- [관계된 모델 집계](#aggregating-related-models)
    - [관계된 모델 개수 세기](#counting-related-models)
    - [기타 집계 함수](#other-aggregate-functions)
    - [Morph To 관계에서 관계된 모델 개수 세기](#counting-related-models-on-morph-to-relationships)
- [Eager 로딩](#eager-loading)
    - [Eager 로딩 제약](#constraining-eager-loads)
    - [지연 Eager 로딩](#lazy-eager-loading)
    - [자동 Eager 로딩](#automatic-eager-loading)
    - [지연 로딩 방지](#preventing-lazy-loading)
- [관계된 모델 추가 및 수정](#inserting-and-updating-related-models)
    - [`save` 메서드](#the-save-method)
    - [`create` 메서드](#the-create-method)
    - [Belongs To 관계](#updating-belongs-to-relationships)
    - [다대다 관계](#updating-many-to-many-relationships)
- [부모 타임스탬프 동기화](#touching-parent-timestamps)

<a name="introduction"></a>
## 소개

데이터베이스 테이블은 서로 관계를 맺는 경우가 많습니다. 예를 들어, 블로그 포스트는 여러 개의 댓글을 가질 수 있고, 주문은 주문을 생성한 사용자와 연결될 수 있습니다. Eloquent는 이러한 관계를 쉽게 관리하고 사용할 수 있게 해주며, 여러 가지 일반적인 관계 유형을 지원합니다.

<div class="content-list" markdown="1">

- [일대일](#one-to-one)
- [일대다](#one-to-many)
- [다대다](#many-to-many)
- [중간 테이블을 통한 일대일](#has-one-through)
- [중간 테이블을 통한 일대다](#has-many-through)
- [일대일(폴리모픽)](#one-to-one-polymorphic-relations)
- [일대다(폴리모픽)](#one-to-many-polymorphic-relations)
- [다대다(폴리모픽)](#many-to-many-polymorphic-relations)

</div>

<a name="defining-relationships"></a>
## 관계 정의하기

Eloquent의 관계는 Eloquent 모델 클래스 안에서 메서드로 정의합니다. 관계는 동시에 강력한 [쿼리 빌더](/docs/queries)의 역할도 하며, 메서드로 정의할 경우 강력한 메서드 체이닝과 쿼리 기능을 활용할 수 있습니다. 예를 들어, 다음과 같이 `posts` 관계에 추가 쿼리 제한을 체이닝할 수 있습니다.

```php
$user->posts()->where('active', 1)->get();
```

관계를 본격적으로 사용해보기 전에, Eloquent에서 지원하는 각각의 관계 유형을 어떻게 정의하는지 먼저 살펴보겠습니다.

<a name="one-to-one"></a>
### 일대일 / hasOne

일대일 관계는 매우 기본적인 데이터베이스 관계 유형입니다. 예를 들어, `User` 모델이 하나의 `Phone` 모델과 연관되어 있을 수 있습니다. 이 관계를 정의하려면 `User` 모델에 `phone`이라는 메서드를 추가하고, 이 메서드에서 `hasOne` 메서드를 호출하여 반환하면 됩니다. `hasOne`은 모델의 `Illuminate\Database\Eloquent\Model` 기본 클래스에서 사용할 수 있습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Model
{
    /**
     * 사용자와 연관된 전화번호를 반환합니다.
     */
    public function phone(): HasOne
    {
        return $this->hasOne(Phone::class);
    }
}
```

`hasOne` 메서드의 첫 번째 인수로는 관계된 모델 클래스명을 전달합니다. 이렇게 관계를 정의하면, Eloquent의 동적 프로퍼티(dynamically properties)를 사용하여 관련 레코드를 조회할 수 있습니다. 동적 프로퍼티란, 관계 메서드를 마치 모델의 프로퍼티처럼 접근할 수 있게 해주는 기능입니다.

```php
$phone = User::find(1)->phone;
```

Eloquent는 부모 모델의 이름을 바탕으로 관계의 외래 키를 자동으로 결정합니다. 위 예시에서는 `Phone` 모델이 자동으로 `user_id` 외래 키를 갖는 것으로 간주됩니다. 만약 이 규칙을 변경하고 싶다면, `hasOne` 메서드의 두 번째 인수로 외래 키 이름을 지정할 수 있습니다.

```php
return $this->hasOne(Phone::class, 'foreign_key');
```

또한, Eloquent는 외래 키의 값이 기본적으로 부모(즉, User)의 기본 키 컬럼 값과 일치한다고 가정합니다. 즉, `Phone` 레코드의 `user_id` 컬럼에서 사용자의 `id` 값을 찾게 됩니다. 만약 관계에서 `id`가 아닌 다른 컬럼값(또는 모델의 `$primaryKey` 속성값)을 사용하고 싶다면, `hasOne`의 세 번째 인수로 로컬 키 컬럼명을 전달할 수 있습니다.

```php
return $this->hasOne(Phone::class, 'foreign_key', 'local_key');
```

<a name="one-to-one-defining-the-inverse-of-the-relationship"></a>
#### 관계의 역방향 정의하기

이제 `User` 모델에서 `Phone` 모델에 접근할 수 있습니다. 다음으로, `Phone` 모델에서 해당 휴대폰의 소유자(사용자)에 접근할 수 있는 관계를 정의해봅시다. 일대일(hasOne) 관계의 역방향은 `belongsTo` 메서드를 이용해서 정의할 수 있습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Phone extends Model
{
    /**
     * 이 전화번호의 소유자인 사용자를 반환합니다.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
```

`user` 메서드를 호출하면, Eloquent는 `Phone` 모델의 `user_id` 컬럼 값과 일치하는 `id`를 가진 `User` 모델을 찾으려고 시도합니다.

Eloquent는 관계 메서드의 이름에 `_id`를 붙여 외래 키 이름을 자동으로 추론합니다. 즉, 여기서는 `Phone` 모델이 `user_id` 컬럼을 가지고 있다고 가정합니다. 만약 `Phone` 모델의 외래 키가 `user_id`가 아니라면, `belongsTo` 메서드의 두 번째 인수로 원하는 이름을 전달할 수 있습니다.

```php
/**
 * 이 전화번호의 소유자인 사용자를 반환합니다.
 */
public function user(): BelongsTo
{
    return $this->belongsTo(User::class, 'foreign_key');
}
```

만약 부모 모델의 기본 키가 `id`가 아니거나, 연관된 모델을 다른 컬럼으로 찾고 싶다면 `belongsTo`의 세 번째 인수로 부모 테이블의 커스텀 키를 지정할 수 있습니다.

```php
/**
 * 이 전화번호의 소유자인 사용자를 반환합니다.
 */
public function user(): BelongsTo
{
    return $this->belongsTo(User::class, 'foreign_key', 'owner_key');
}
```

<a name="one-to-many"></a>
### 일대다 / hasMany

일대다 관계는 하나의 모델이 하나 이상(여러 개)의 자식 모델을 가질 때 사용하는 관계입니다. 예를 들어, 블로그 포스트는 무한정 많은 댓글을 가질 수 있습니다. 다른 모든 Eloquent 관계처럼 일대다 관계도 모델에 메서드를 추가하여 정의합니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Post extends Model
{
    /**
     * 블로그 포스트에 달린 댓글들을 반환합니다.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }
}
```

Eloquent는 자동으로 `Comment` 모델의 올바른 외래 키 컬럼명을 추론합니다. 기본 규칙으로 Eloquent는 부모 모델 이름을 스네이크 케이스(snake_case)로 변환하고 여기에 `_id`를 붙입니다. 이 예시에서는 `Comment` 모델이 `post_id` 외래 키 컬럼을 가지고 있다고 가정합니다.

관계 메서드를 정의하고 나면, `comments` 프로퍼티를 통해 관련된 [컬렉션](/docs/eloquent-collections)을 조회할 수 있습니다. Eloquent의 "동적 관계 프로퍼티" 덕분에, 관계 메서드를 마치 모델의 프로퍼티처럼 사용할 수 있습니다.

```php
use App\Models\Post;

$comments = Post::find(1)->comments;

foreach ($comments as $comment) {
    // ...
}
```

모든 관계는 동시에 쿼리 빌더 역할도 하므로, `comments` 메서드에 쿼리 조건을 추가로 체이닝하여 조회 결과를 제한할 수 있습니다.

```php
$comment = Post::find(1)->comments()
    ->where('title', 'foo')
    ->first();
```

`hasOne`과 마찬가지로, `hasMany` 메서드에 추가 인수를 전달하여 외래 키와 로컬 키를 직접 지정할 수도 있습니다.

```php
return $this->hasMany(Comment::class, 'foreign_key');

return $this->hasMany(Comment::class, 'foreign_key', 'local_key');
```

<a name="automatically-hydrating-parent-models-on-children"></a>
#### 자식 모델에 부모 모델 자동 주입하기

Eloquent의 eager 로딩을 사용하더라도, 자식 모델에서 루프를 돌며 부모 모델에 접근하는 경우 "N + 1" 쿼리 문제가 발생할 수 있습니다.

```php
$posts = Post::with('comments')->get();

foreach ($posts as $post) {
    foreach ($post->comments as $comment) {
        echo $comment->post->title;
    }
}
```

위의 예시에서, `Post` 모델 각각에 대해 댓글들을 eager 로드(미리 불러오기) 했더라도, Eloquent는 각 `Comment` 모델의 부모 모델인 `Post`를 자동으로 주입(hydrate)하지 않기 때문에 "N + 1" 쿼리 문제가 발생하게 됩니다.

자식 모델에 자동으로 부모 모델을 주입하고 싶다면, `hasMany` 관계 정의 시 `chaperone` 메서드를 사용하면 됩니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Post extends Model
{
    /**
     * 블로그 포스트에 달린 댓글들을 반환합니다.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class)->chaperone();
    }
}
```

또는, 런타임 시점에 자동 부모 주입 기능을 켜고 싶다면, 관계를 eager 로드할 때 `chaperone`을 호출하면 됩니다.

```php
use App\Models\Post;

$posts = Post::with([
    'comments' => fn ($comments) => $comments->chaperone(),
])->get();
```

<a name="one-to-many-inverse"></a>
### 일대다 (역방향) / belongsTo

이제 포스트의 모든 댓글에 접근할 수 있게 되었으니, 이번엔 댓글에서 그 부모 포스트에 접근할 수 있는 관계를 정의해봅시다. 일대다(hasMany) 관계의 역방향은 자식 모델에 `belongsTo` 메서드를 사용하는 별도의 관계 메서드를 추가해서 구현합니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comment extends Model
{
    /**
     * 이 댓글이 달린 포스트를 반환합니다.
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }
}
```

이렇게 관계를 정의하면, `post`라는 "동적 관계 프로퍼티"를 통해 댓글의 부모 포스트를 가져올 수 있습니다.

```php
use App\Models\Comment;

$comment = Comment::find(1);

return $comment->post->title;
```

위 예시에서, Eloquent는 `Comment` 모델의 `post_id` 컬럼 값과 일치하는 `id`를 가진 `Post` 모델을 찾으려고 합니다.

Eloquent는 기본적으로 관계 메서드의 이름에 `_`와 부모 모델의 기본 키 컬럼명을 붙여서 외래 키 컬럼 이름을 추론합니다. 이 예시에서는 `comments` 테이블의 외래 키 컬럼이 `post_id`라고 가정합니다.

만약 이 규칙을 사용하지 않고 싶다면, `belongsTo` 메서드의 두 번째 인수로 외래 키명을 직접 지정할 수 있습니다.

```php
/**
 * 이 댓글이 달린 포스트를 반환합니다.
 */
public function post(): BelongsTo
{
    return $this->belongsTo(Post::class, 'foreign_key');
}
```

부모 모델이 기본 키로 `id`가 아닌 값을 사용하거나, 연관된 모델을 다른 컬럼으로 찾고 싶을 때에는 `belongsTo`의 세 번째 인수로 부모 테이블의 커스텀 키를 명시하면 됩니다.

```php
/**
 * 이 댓글이 달린 포스트를 반환합니다.
 */
public function post(): BelongsTo
{
    return $this->belongsTo(Post::class, 'foreign_key', 'owner_key');
}
```

<a name="default-models"></a>
#### 기본 모델 지정하기

`belongsTo`, `hasOne`, `hasOneThrough`, `morphOne` 관계에서는 만약 관계가 `null`일 때 반환할 "기본 모델"을 지정할 수 있습니다. 이런 패턴은 [Null Object 패턴](https://en.wikipedia.org/wiki/Null_Object_pattern)이라고 부르며, 코드에서 조건문을 줄이는 데 도움이 됩니다. 아래 예시에서는, `Post` 모델에 연결된 사용자가 없으면 빈 `App\Models\User` 모델이 반환됩니다.

```php
/**
 * 이 포스트의 작성자(Author)를 반환합니다.
 */
public function user(): BelongsTo
{
    return $this->belongsTo(User::class)->withDefault();
}
```

기본 모델에 속성 값을 미리 지정하고 싶을 때에는 `withDefault` 메서드에 배열이나 클로저를 전달할 수 있습니다.

```php
/**
 * 이 포스트의 작성자(Author)를 반환합니다.
 */
public function user(): BelongsTo
{
    return $this->belongsTo(User::class)->withDefault([
        'name' => 'Guest Author',
    ]);
}

/**
 * 이 포스트의 작성자(Author)를 반환합니다.
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

"belongs to" 관계의 자식 모델들을 쿼리할 때, 직접 `where` 절을 사용해 해당 Eloquent 모델을 조회할 수 있습니다.

```php
use App\Models\Post;

$posts = Post::where('user_id', $user->id)->get();
```

하지만 더 편리하게, `whereBelongsTo` 메서드를 사용하면 해당 모델의 관계와 외래 키를 자동으로 파악하여 쿼리를 실행할 수 있습니다.

```php
$posts = Post::whereBelongsTo($user)->get();
```

`whereBelongsTo` 메서드에는 [컬렉션](/docs/eloquent-collections) 인스턴스를 전달할 수 있습니다. 이 경우 컬렉션 안에 포함된 모든 부모 모델 중 하나에 속하는 모델을 자동으로 조회해줍니다.

```php
$users = User::where('vip', true)->get();

$posts = Post::whereBelongsTo($users)->get();
```

기본적으로 Laravel은 전달된 모델의 클래스명을 기준으로 관계 이름을 파악하지만, 두 번째 인수에 관계명을 직접 지정할 수도 있습니다.

```php
$posts = Post::whereBelongsTo($user, 'author')->get();
```

<a name="has-one-of-many"></a>
### 여러 개 중 하나 (Has One of Many)

하나의 모델이 여러 개의 관련 모델을 가지고 있지만, 그 중에서 "최신"이나 "가장 오래된" 하나의 관련 모델만 간편하게 가져오고 싶을 때가 있습니다. 예를 들어, `User` 모델이 여러 개의 `Order` 모델과 연관되어 있지만, 사용자가 최근 주문한 내역만 간편하게 조회하고 싶은 경우입니다. 이런 경우 `hasOne` 관계와 `ofMany` 메서드를 조합해서 해결할 수 있습니다.

```php
/**
 * 사용자의 가장 최근 주문 내역을 반환합니다.
 */
public function latestOrder(): HasOne
{
    return $this->hasOne(Order::class)->latestOfMany();
}
```

마찬가지로, 관계에서 "가장 오래된", 즉 가장 먼저 생성된 관련 모델을 조회하는 메서드도 정의할 수 있습니다.

```php
/**
 * 사용자의 가장 오래된 주문 내역을 반환합니다.
 */
public function oldestOrder(): HasOne
{
    return $this->hasOne(Order::class)->oldestOfMany();
}
```

기본적으로 `latestOfMany`와 `oldestOfMany`는 모델의 기본 키(정렬 가능한 값임을 전제)를 기준으로 최신/최고 또는 가장 오래된(최소) 값을 가져옵니다. 하지만 더 다양한 정렬 기준을 사용해서 관련 관계 중 하나만 가져오고 싶을 때도 있습니다.

예를 들어, `ofMany` 메서드를 이용해 사용자의 주문 내역 중 "가장 비싼" 주문만 가져올 수도 있습니다. `ofMany`는 첫 번째 인수로 정렬할 컬럼, 두 번째 인수로 사용할 집계 함수(`min` 또는 `max`)를 지정합니다.

```php
/**
 * 사용자의 가장 큰 주문 내역을 반환합니다.
 */
public function largestOrder(): HasOne
{
    return $this->hasOne(Order::class)->ofMany('price', 'max');
}
```

> [!WARNING]
> PostgreSQL은 UUID 컬럼에 대해 `MAX` 함수를 지원하지 않기 때문에, PostgreSQL UUID 컬럼과 연동해서 one-of-many 관계를 사용할 수 없습니다.

<a name="converting-many-relationships-to-has-one-relationships"></a>
#### "Many" 관계를 Has One 관계로 변환하기

이미 동일한 모델에 대해 "hasMany" 관계가 정의되어 있을 때, `latestOfMany`, `oldestOfMany`, `ofMany`를 사용해 단일 모델을 조회한다면 기존 관계를 그대로 재활용할 수도 있습니다. 라라벨에서는 이런 경우 관계에서 `one` 메서드를 이용해 기존 "hasMany" 관계를 "hasOne" 관계로 쉽게 변환할 수 있습니다.

```php
/**
 * 사용자의 모든 주문 내역을 반환합니다.
 */
public function orders(): HasMany
{
    return $this->hasMany(Order::class);
}

/**
 * 사용자의 가장 큰 주문 내역을 반환합니다.
 */
public function largestOrder(): HasOne
{
    return $this->orders()->one()->ofMany('price', 'max');
}
```

또한, `one` 메서드를 이용해 `HasManyThrough` 관계를 `HasOneThrough` 관계로 변환하여 사용할 수도 있습니다.

```php
public function latestDeployment(): HasOneThrough
{
    return $this->deployments()->one()->latestOfMany();
}
```

<a name="advanced-has-one-of-many-relationships"></a>
#### 고급 Has One of Many 관계

더 복잡한 "has one of many" 관계도 구현할 수 있습니다. 예를 들어, `Product` 모델에 여러 개의 `Price` 모델이 연결되어 있고, 새로운 가격 정책이 발표된 이후에도 이전 가격 데이터가 시스템에 남아 있는 경우를 생각해 보겠습니다. 그리고, 새로운 가격 정보를 미리 등록하여 나중에(`published_at` 컬럼을 통해) 적용될 수 있도록 할 수도 있습니다.

즉, 정리하면 `published_at` 날짜가 미래가 아닌(이미 발표된) "최근 가격 정책"을 가져와야 하며, 만약 published_at 값이 같은 경우에는 가장 큰 id 값을 가진 `Price`를 선호해야 합니다. 이를 위해서는 `ofMany` 메서드에 정렬 기준 컬럼 배열을 전달하고, 두 번째 인수로 추가 제약(예: 날짜)에 대한 클로저를 전달하면 됩니다.

```php
/**
 * 이 상품의 현재 적용 가격 정보를 반환합니다.
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
### 중간 테이블을 통한 일대일 (Has One Through)

"has-one-through" 관계는 다른 모델과의 일대일 관계를 정의하지만, 해당 관계가 중간에 또 다른 모델을 _거쳐서_ 연결되어 있을 때 사용합니다.

예를 들어, 자동차 정비소 애플리케이션에서 각 `Mechanic` 모델은 하나의 `Car` 모델과 연결될 수 있고, 각 `Car` 모델은 하나의 `Owner` 모델과 연결될 수 있다고 가정해봅시다. 이때 정비공(mechanic)과 소유자(owner)는 데이터베이스상 직접적인 관계가 없지만, 정비공이 `Car` 모델을 _통해_ 소유자에 접근할 수 있습니다. 관계를 정의하기 위해 필요한 테이블 구조는 다음과 같습니다.

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

각 테이블 구조를 이해했다면, 이제 `Mechanic` 모델에서 해당 관계를 정의해보겠습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;

class Mechanic extends Model
{
    /**
     * 담당 차량의 소유자를 반환합니다.
     */
    public function carOwner(): HasOneThrough
    {
        return $this->hasOneThrough(Owner::class, Car::class);
    }
}
```

`hasOneThrough` 메서드의 첫 번째 인수로는 최종적으로 접근하고자 하는(결과를 반환할) 모델명을, 두 번째 인수로는 중간에 위치한 모델명을 지정합니다.

또는, 관계에 연관된 모든 모델에서 해당 관계가 이미 정의되어 있다면, `through` 메서드를 사용해 관계 이름을 이용한 방식으로도 "has-one-through" 관계를 간결하게 정의할 수 있습니다. 예를 들어, `Mechanic` 모델에 `cars` 관계가 있고, `Car` 모델에 `owner` 관계가 있다면, 아래처럼 체이닝으로도 정의할 수 있습니다.

```php
// 문자열 기반 문법...
return $this->through('cars')->has('owner');

// 동적 문법...
return $this->throughCars()->hasOwner();
```

<a name="has-one-through-key-conventions"></a>

#### 키 규칙

관계 쿼리를 수행할 때는 일반적인 Eloquent의 외래 키 규칙이 적용됩니다. 만약 관계의 키를 커스터마이즈하고 싶다면, `hasOneThrough` 메서드의 세 번째와 네 번째 인수로 직접 지정할 수 있습니다. 세 번째 인수는 중간 모델의 외래 키 이름이며, 네 번째 인수는 최종 모델의 외래 키 이름입니다. 다섯 번째 인수는 로컬 키, 여섯 번째 인수는 중간 모델의 로컬 키입니다.

```php
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
            'mechanic_id', // cars 테이블의 외래 키...
            'car_id', // owners 테이블의 외래 키...
            'id', // mechanics 테이블의 로컬 키...
            'id' // cars 테이블의 로컬 키...
        );
    }
}
```

또는 앞서 설명한 것처럼, 관계에 포함될 모든 모델에서 관련된 관계가 미리 정의되어 있다면, `through` 메서드에 해당 관계명(relationship name)을 전달하는 방식으로 "has-one-through" 관계를 더욱 간결하게 지정할 수 있습니다. 이 방식의 장점은 이미 정의된 관계의 키 규칙을 재사용할 수 있다는 점입니다.

```php
// 문자열 기반 문법...
return $this->through('cars')->has('owner');

// 동적 메서드 문법...
return $this->throughCars()->hasOwner();
```

<a name="has-many-through"></a>
### Has Many Through

"has-many-through" 관계는 중간 관계를 거쳐서 멀리 있는 모델과의 연결을 쉽게 다룰 수 있게 해줍니다. 예를 들어, [Laravel Cloud](https://cloud.laravel.com)와 같은 배포 플랫폼을 만든다고 가정해봅시다. `Application` 모델이 중간 모델인 `Environment`를 통해 여러 개의 `Deployment` 모델에 접근해야 할 수 있습니다. 이 예시를 활용하면 특정 애플리케이션의 모든 배포 이력을 쉽게 모을 수 있습니다. 관계를 정의하기 위해 필요한 테이블은 다음과 같습니다.

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

관계에 사용할 테이블 구조를 살펴봤으니, 이제 `Application` 모델에서 해당 관계를 정의해보겠습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Application extends Model
{
    /**
     * 해당 애플리케이션의 모든 배포 이력을 가져옵니다.
     */
    public function deployments(): HasManyThrough
    {
        return $this->hasManyThrough(Deployment::class, Environment::class);
    }
}
```

`hasManyThrough` 메서드의 첫 번째 인수는 접근하려는 최종 모델의 클래스 이름이고, 두 번째 인수는 중간 모델의 클래스 이름입니다.

또한 앞서 설명한 것처럼, 관계에 포함되는 모든 모델에서 관련된 관계가 미리 정의되어 있으면, `through` 메서드에 관계명(relationship name)을 전달하는 방식으로 "has-many-through" 관계를 간결하게 정의할 수 있습니다. 예를 들어, `Application` 모델에 `environments` 관계가, 그리고 `Environment` 모델에 `deployments` 관계가 정의된 경우, 다음과 같이 관계를 연결할 수 있습니다.

```php
// 문자열 기반 문법...
return $this->through('environments')->has('deployments');

// 동적 메서드 문법...
return $this->throughEnvironments()->hasDeployments();
```

`Deployment` 모델의 테이블에는 `application_id` 컬럼이 없지만, `hasManyThrough` 관계를 활용하면 `$application->deployments`를 통해 해당 애플리케이션의 배포 내역을 조회할 수 있습니다. 이때 Eloquent는 중간 테이블인 `Environment`의 `application_id` 컬럼을 조회해 올바른 environment ID들을 찾고, 이 ID들로 `Deployment` 테이블에서 데이터를 조회합니다.

<a name="has-many-through-key-conventions"></a>
#### 키 규칙

관계 쿼리를 수행할 때는 일반적인 Eloquent 외래 키 규칙이 적용됩니다. 하지만 관계의 키를 원하는 대로 지정하고 싶다면, `hasManyThrough` 메서드의 세 번째와 네 번째 인수로 커스터마이즈할 수 있습니다. 세 번째 인수는 중간 모델의 외래 키, 네 번째 인수는 최종 모델의 외래 키입니다. 다섯 번째는 로컬 키, 여섯 번째는 중간 모델의 로컬 키입니다.

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

앞서 설명한 것처럼, 관계에 필요한 모든 모델에 이미 관계가 정의되어 있다면, `through` 메서드에 관계명을 전달하는 방식으로 "has-many-through" 관계를 정의할 수 있습니다. 이 방법의 장점은 기존 관계의 키 규칙을 그대로 재사용할 수 있다는 점입니다.

```php
// 문자열 기반 문법...
return $this->through('environments')->has('deployments');

// 동적 메서드 문법...
return $this->throughEnvironments()->hasDeployments();
```

<a name="scoped-relationships"></a>
### 제한된(Scoped) 관계

모델에 쿼리 범위가 제한된 추가 메서드를 정의하는 것은 매우 흔한 일입니다. 예를 들어, `User` 모델에 `posts` 전체를 반환하는 `posts` 메서드 외에, `where` 절을 추가로 적용하여 특정 게시글만 반환하는 `featuredPosts` 메서드를 별도로 만들 수 있습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Model
{
    /**
     * 사용자의 모든 게시글을 반환합니다.
     */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class)->latest();
    }

    /**
     * 사용자의 대표 게시글만 반환합니다.
     */
    public function featuredPosts(): HasMany
    {
        return $this->posts()->where('featured', true);
    }
}
```

하지만 이렇게 정의한 `featuredPosts` 메서드를 통해 모델을 새로 생성할 경우, 자동으로 `featured` 속성이 `true`로 지정되지는 않습니다. 관계 메서드를 통해 생성되는 모든 모델에 추가 속성을 지정하려면, 쿼리를 빌드할 때 `withAttributes` 메서드를 사용할 수 있습니다.

```php
/**
 * 사용자의 대표 게시글을 반환합니다.
 */
public function featuredPosts(): HasMany
{
    return $this->posts()->withAttributes(['featured' => true]);
}
```

`withAttributes` 메서드는 지정한 속성값으로 쿼리에 `where` 조건을 추가할 뿐만 아니라, 해당 관계를 통해 모델을 생성할 때도 동일한 속성을 자동으로 부여합니다.

```php
$post = $user->featuredPosts()->create(['title' => 'Featured Post']);

$post->featured; // true
```

만약 `withAttributes` 메서드가 쿼리에 `where` 조건을 추가하지 않도록 하고 싶다면, `asConditions` 인자를 `false`로 지정하면 됩니다.

```php
return $this->posts()->withAttributes(['featured' => true], asConditions: false);
```

<a name="many-to-many"></a>
## 다대다(Many to Many) 관계

`hasOne`이나 `hasMany` 관계보다 다대다(many-to-many) 관계는 약간 더 복잡합니다. 예를 들어, 하나의 사용자가 여러 역할(roles)을 가질 수 있고, 동시에 여러 사용자가 동일한 역할을 공유할 수 있습니다. 예를 들어, 한 사용자는 "Author"와 "Editor" 역할을 가질 수 있으며, 이 역할들은 다른 사용자에게도 할당될 수 있습니다. 즉, 한 사용자는 여러 역할을, 하나의 역할은 여러 사용자를 가질 수 있습니다.

<a name="many-to-many-table-structure"></a>
#### 테이블 구조

이 관계를 정의하려면 `users`, `roles`, `role_user` 세 개의 데이터베이스 테이블이 필요합니다. `role_user` 테이블은 관련 모델 이름을 사전순으로 조합한 이름이며, `user_id`와 `role_id` 컬럼을 포함합니다. 이 테이블은 users와 roles를 연결하는 중간(연결) 테이블입니다.

역할이 여러 사용자에게 속할 수 있기 때문에, 단순히 `roles` 테이블에 `user_id` 컬럼을 추가하는 방식으로는 안 됩니다. 해당 방식은 하나의 역할이 단 한 명의 사용자에게만 속할 수 있음을 의미하기 때문입니다. 여러 사용자에게 여러 역할을 지정하려면 별도의 연결 테이블이 꼭 필요합니다. 관계의 테이블 구조를 정리하면 다음과 같습니다.

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

다대다(many-to-many) 관계는 `belongsToMany` 메서드의 반환값을 리턴하는 메서드를 모델에 정의함으로써 생성할 수 있습니다. `belongsToMany`는 모든 Eloquent 모델이 확장하는 `Illuminate\Database\Eloquent\Model` 클래스에서 제공됩니다. 예를 들어, `User` 모델에 `roles` 메서드를 다음과 같이 정의할 수 있습니다. 이때 첫 번째 인수는 관련 모델의 클래스입니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Model
{
    /**
     * 사용자가 가지고 있는 역할들.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }
}
```

관계가 정의되면, 동적 관계 속성인 `roles`를 통해 사용자의 역할 목록에 접근할 수 있습니다.

```php
use App\Models\User;

$user = User::find(1);

foreach ($user->roles as $role) {
    // ...
}
```

모든 관계는 쿼리 빌더 역할도 하므로, 예를 들어 `roles` 메서드를 호출한 뒤 체이닝으로 추가 조건을 걸 수도 있습니다.

```php
$roles = User::find(1)->roles()->orderBy('name')->get();
```

Eloquent는 중간 테이블의 이름을 두 모델의 이름을 사전순으로 붙여서 결정합니다. 이 규칙을 직접 바꾸고 싶다면, `belongsToMany`의 두 번째 인수로 테이블 이름을 지정할 수 있습니다.

```php
return $this->belongsToMany(Role::class, 'role_user');
```

또한, 연결 테이블의 키 컬럼 이름도 추가 인수를 통해 커스터마이즈할 수 있습니다. 세 번째 인수는 관계를 정의하는 모델의 외래 키, 네 번째 인수는 연결 대상 모델의 외래 키입니다.

```php
return $this->belongsToMany(Role::class, 'role_user', 'user_id', 'role_id');
```

<a name="many-to-many-defining-the-inverse-of-the-relationship"></a>
#### 관계의 반대(Inverse) 정의

"다대다" 관계의 반대 방향 역시 `belongsToMany` 메서드를 사용해서 정의할 수 있습니다. 예를 들어, user/role 예시에서 `Role` 모델에 `users` 메서드를 다음과 같이 추가합니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    /**
     * 해당 역할에 속한 사용자들.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }
}
```

보시는 것처럼, 관계의 정의 방식은 `User` 모델에서와 완전히 동일하되, 참조하는 모델 클래스만 다릅니다. `belongsToMany` 메서드를 그대로 재사용하므로, 테이블/키 커스터마이즈 역시 동일하게 설정할 수 있습니다.

<a name="retrieving-intermediate-table-columns"></a>
### 중간 테이블 컬럼 조회

이미 배운 것처럼, 다대다 관계를 사용하려면 중간 테이블이 필요합니다. Eloquent는 이 중간 테이블과 상호작용하기 위한 매우 유용한 방식을 제공합니다. 예를 들어, `User` 모델이 여러 `Role` 모델과 관계가 있을 때, 중간 테이블의 데이터를 각 모델에서 `pivot` 속성을 통해 접근할 수 있습니다.

```php
use App\Models\User;

$user = User::find(1);

foreach ($user->roles as $role) {
    echo $role->pivot->created_at;
}
```

각 `Role` 모델에는 자동으로 `pivot` 속성이 부여되며, 이 속성은 중간 테이블(row)을 나타내는 모델을 담고 있습니다.

기본적으로는, 중간 테이블의 키 값들만 `pivot` 모델에 포함됩니다. 만약 중간 테이블에 추가 컬럼이 있다면, 관계 정의 시 `withPivot` 메서드를 이용해 반드시 명시해야 합니다.

```php
return $this->belongsToMany(Role::class)->withPivot('active', 'created_by');
```

중간 테이블에 `created_at`, `updated_at` 등 자동 관리되는 타임스탬프 컬럼이 필요하다면, 관계 정의시 `withTimestamps` 메서드를 호출해줄 수 있습니다.

```php
return $this->belongsToMany(Role::class)->withTimestamps();
```

> [!WARNING]
> Eloquent가 자동으로 관리하는 타임스탬프의 경우, 중간 테이블에는 `created_at` 및 `updated_at` 컬럼이 모두 반드시 있어야 합니다.

<a name="customizing-the-pivot-attribute-name"></a>
#### `pivot` 속성 이름 커스터마이징

앞서 설명했듯이, 중간 테이블의 속성은 모델에서 `pivot` 속성을 통해 접근할 수 있습니다. 하지만, 이 속성명을 애플리케이션의 목적에 맞게 자유롭게 변경할 수 있습니다.

예를 들어, 사용자가 팟캐스트를 구독하는 다대다 관계를 가지고 있다면, 중간 테이블 속성명을 `pivot` 대신 `subscription`으로 바꾸고 싶을 수 있습니다. 이럴 땐 관계 정의 시 `as` 메서드를 사용합니다.

```php
return $this->belongsToMany(Podcast::class)
    ->as('subscription')
    ->withTimestamps();
```

속성 이름을 커스터마이즈했다면 이후에는 해당 이름으로 중간 테이블 데이터를 사용할 수 있습니다.

```php
$users = User::with('podcasts')->get();

foreach ($users->flatMap->podcasts as $podcast) {
    echo $podcast->subscription->created_at;
}
```

<a name="filtering-queries-via-intermediate-table-columns"></a>
### 중간 테이블 컬럼을 이용한 쿼리 필터링

다대다 관계 쿼리에서 중간 테이블의 컬럼을 기준으로 결과를 필터링할 수도 있습니다. `wherePivot`, `wherePivotIn`, `wherePivotNotIn`, `wherePivotBetween`, `wherePivotNotBetween`, `wherePivotNull`, `wherePivotNotNull` 메서드를 사용할 수 있습니다.

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

`wherePivot`은 쿼리에 where 절을 추가하지만, 해당 값을 새로운 모델 생성 시 자동으로 할당하지는 않습니다. 쿼리와 동시에 pivot 값을 지정해서 관계를 만들고 싶으면 `withPivotValue` 메서드를 사용하세요.

```php
return $this->belongsToMany(Role::class)
    ->withPivotValue('approved', 1);
```

<a name="ordering-queries-via-intermediate-table-columns"></a>
### 중간 테이블 컬럼을 이용한 정렬

다대다 관계 쿼리에서 반환된 결과를 중간 테이블의 컬럼 기준으로 정렬할 수도 있습니다. 아래 예시에서는 사용자의 가장 최근 배지를 정렬해서 가져옵니다.

```php
return $this->belongsToMany(Badge::class)
    ->where('rank', 'gold')
    ->orderByPivot('created_at', 'desc');
```

<a name="defining-custom-intermediate-table-models"></a>
### 사용자 정의 중간 테이블 모델

다대다 관계의 중간 테이블을 표현하기 위해 별도의 커스텀 모델을 정의할 수도 있습니다. 이를 위해 관계를 정의할 때 `using` 메서드를 호출해줍니다. 커스텀 pivot 모델을 활용하면 추가 메서드나 타입 캐스팅 등 다양한 동작을 구현할 수 있습니다.

커스텀 다대다 pivot 모델은 `Illuminate\Database\Eloquent\Relations\Pivot` 클래스를 확장해야 하며, 커스텀 다형성(polimorphic) pivot 모델은 `Illuminate\Database\Eloquent\Relations\MorphPivot` 클래스를 확장해야 합니다. 예를 들어, 커스텀 `RoleUser` 피벗 모델을 사용하는 `Role` 모델을 다음과 같이 정의할 수 있습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    /**
     * 해당 역할에 속한 사용자들.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)->using(RoleUser::class);
    }
}
```

`RoleUser` 모델은 다음과 같이 `Pivot` 클래스를 확장하여 정의해야 합니다.

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
> Pivot 모델에서는 `SoftDeletes` 트레이트를 사용할 수 없습니다. Pivot 레코드의 소프트 삭제가 필요하다면, 해당 pivot 모델을 일반 Eloquent 모델로 전환하는 것을 고려하세요.

<a name="custom-pivot-models-and-incrementing-ids"></a>
#### 커스텀 Pivot 모델과 자동 증가 키

커스텀 pivot 모델을 사용하는 다대다 관계라면, 그리고 그 pivot 모델에 자동 증가(autoincrement) 기본 키가 있다면, 반드시 모델 클래스에 `incrementing` 속성을 `true`로 정의해야 합니다.

```php
/**
 * ID가 자동 증가되는지 여부.
 *
 * @var bool
 */
public $incrementing = true;
```

<a name="polymorphic-relationships"></a>
## 다형성(Polymorphic) 관계

다형성(polymorphic) 관계를 이용하면 하나의 하위 모델이 단일 연관 컬럼(association)을 통해 여러 타입의 모델에 속할 수 있습니다. 예를 들어, 블로그 포스트와 동영상 모두에 댓글을 달 수 있는 애플리케이션을 만든다고 할 때, 하나의 `Comment` 모델이 `Post`와 `Video` 모두에 연결될 수 있습니다.

<a name="one-to-one-polymorphic-relations"></a>
### 일대일(One to One) 다형성 관계

<a name="one-to-one-polymorphic-table-structure"></a>
#### 테이블 구조

일대일 다형성 관계는 일반적인 일대일 관계와 유사하지만, 하위 모델(여기서는 `Image`)이 하나의 연관 컬럼으로 여러 모델(Post, User 등)에 연결될 수 있습니다. 즉, 블로그 게시글(Post)과 사용자(User)가 모두 하나의 `Image` 모델과 다형성 관계를 가질 수 있습니다. 이렇게 하면 여러 객체(Post, User)가 하나의 이미지 테이블을 공유할 수 있습니다. 테이블 구조는 아래와 같습니다.

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

`images` 테이블의 `imageable_id`와 `imageable_type` 컬럼에 주목하세요. `imageable_id`는 post나 user의 ID 값을 저장하며, `imageable_type`은 부모 모델의 클래스명을 저장합니다. Eloquent는 이 `imageable_type` 컬럼을 토대로 어떤 종류의 부모 모델을 반환할지 판단합니다. 이 예시에서는 `App\Models\Post` 혹은 `App\Models\User`가 저장될 수 있습니다.

<a name="one-to-one-polymorphic-model-structure"></a>
#### 모델 구조

이제 이 관계를 구현하기 위해 필요한 모델 정의를 살펴보겠습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Image extends Model
{
    /**
     * 부모 imageable 모델 (user 또는 post)을 가져옵니다.
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
     * 게시글의 이미지를 가져옵니다.
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
     * 사용자의 이미지를 가져옵니다.
     */
    public function image(): MorphOne
    {
        return $this->morphOne(Image::class, 'imageable');
    }
}
```

<a name="one-to-one-polymorphic-retrieving-the-relationship"></a>
#### 관계 조회

데이터베이스 테이블과 모델이 정의되면, 각 모델을 통해 관계 데이터를 쉽게 조회할 수 있습니다. 예를 들어, 게시글에 연결된 이미지를 가져오려면 동적 관계 속성인 `image`를 단순히 접근하면 됩니다.

```php
use App\Models\Post;

$post = Post::find(1);

$image = $post->image;
```

다형성 모델의 부모를 가져오려면, `morphTo`를 호출하는 메서드 이름(`imageable`)을 통해 접근하면 됩니다. 즉, `Image` 모델에서 `imageable`라는 동적 관계 속성을 이용합니다.

```php
use App\Models\Image;

$image = Image::find(1);

$imageable = $image->imageable;
```

`Image` 모델의 `imageable` 관계는 해당 이미지를 소유한 부모가 Post 인스턴스인지 User 인스턴스인지에 따라 각각 반환합니다.

<a name="morph-one-to-one-key-conventions"></a>

#### 주요 규칙

필요하다면, 다형성 자식 모델에서 사용하는 "id" 및 "type" 컬럼의 이름을 명시할 수 있습니다. 이 경우, 반드시 `morphTo` 메서드의 첫 번째 인자로 항상 관계의 이름을 전달해야 합니다. 이 값은 보통 메서드명과 일치해야 하므로, PHP의 `__FUNCTION__` 상수를 사용할 수 있습니다.

```php
/**
 * Get the model that the image belongs to.
 */
public function imageable(): MorphTo
{
    return $this->morphTo(__FUNCTION__, 'imageable_type', 'imageable_id');
}
```

<a name="one-to-many-polymorphic-relations"></a>
### 일대다(다형성) 관계

<a name="one-to-many-polymorphic-table-structure"></a>
#### 테이블 구조

일대다 다형성 관계는 일반적인 일대다 관계와 비슷하지만, 자식 모델이 하나의 연관 컬럼만으로 여러 종류의 모델에 속할 수 있다는 점이 다릅니다. 예를 들어, 여러분의 애플리케이션에서 사용자들이 게시글과 동영상 모두에 "댓글"을 달 수 있다고 가정해봅니다. 다형성 관계를 사용하면, `comments` 테이블 하나만으로 게시글과 동영상의 댓글을 모두 저장할 수 있습니다. 우선 이 관계 구성을 위해 필요한 테이블 구조를 살펴보겠습니다.

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

이제 이 관계를 구현하기 위한 모델 정의를 살펴보겠습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Comment extends Model
{
    /**
     * Get the parent commentable model (post or video).
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
     * Get all of the post's comments.
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
     * Get all of the video's comments.
     */
    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }
}
```

<a name="one-to-many-polymorphic-retrieving-the-relationship"></a>
#### 관계 조회하기

데이터베이스 테이블과 모델이 준비되면, 동적 관계 속성을 사용해 관계 데이터를 조회할 수 있습니다. 예를 들어, 특정 게시글의 모든 댓글을 조회하려면 `comments` 동적 속성을 사용할 수 있습니다.

```php
use App\Models\Post;

$post = Post::find(1);

foreach ($post->comments as $comment) {
    // ...
}
```

또한 다형성 자식 모델에서, `morphTo`를 호출하는 메서드명을 통해 부모 모델에 접근할 수 있습니다. 이 예시에서는 `Comment` 모델의 `commentable` 메서드가 해당 역할을 합니다. 동적 관계 속성으로 이 메서드에 접근하면 댓글의 부모 모델을 가져올 수 있습니다.

```php
use App\Models\Comment;

$comment = Comment::find(1);

$commentable = $comment->commentable;
```

`Comment` 모델의 `commentable` 관계는 해당 댓글의 부모가 `Post` 또는 `Video` 인스턴스 중 어느 것인지를 반환합니다.

<a name="polymorphic-automatically-hydrating-parent-models-on-children"></a>
#### 자식 모델에 부모 모델 자동 하이드레이팅하기

Eloquent의 eager loading(즉시 로딩)을 활용해도, 반복문에서 자식 모델에서 부모 모델에 접근하면 "N + 1" 쿼리 문제가 발생할 수 있습니다.

```php
$posts = Post::with('comments')->get();

foreach ($posts as $post) {
    foreach ($post->comments as $comment) {
        echo $comment->commentable->title;
    }
}
```

위 예제에서는 모든 `Post` 모델에 대해 댓글들을 eager load 했음에도 불구하고, 각각의 자식 `Comment` 모델에서 부모 `Post`를 가져올 때 자동으로 하이드레이팅되지 않아서 "N + 1" 쿼리 문제가 발생합니다.

Eloquent가 자식 모델에 자동으로 부모 모델을 하이드레이팅하도록 하려면, `morphMany` 관계를 정의할 때 `chaperone` 메서드를 호출하면 됩니다.

```php
class Post extends Model
{
    /**
     * Get all of the post's comments.
     */
    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable')->chaperone();
    }
}
```

또한, 런타임 시점에서 자동 부모 하이드레이팅을 적용하려면 관계를 eager load 할 때 `chaperone` 메서드를 호출할 수 있습니다.

```php
use App\Models\Post;

$posts = Post::with([
    'comments' => fn ($comments) => $comments->chaperone(),
])->get();
```

<a name="one-of-many-polymorphic-relations"></a>
### 다형성 One of Many(여러 개 중 하나) 관계

때때로 한 모델이 여러 개의 연관 모델을 가질 수 있지만, 관계 중에서 가장 "최신" 혹은 "가장 오래된" 관련 모델을 쉽게 가져오고 싶을 때가 있습니다. 예를 들어, `User` 모델이 여러 `Image` 모델과 연관되어 있지만, 사용자가 가장 최근에 업로드한 이미지를 간편하게 조회하고 싶을 수 있습니다. 이런 경우 `morphOne` 관계 타입과 `ofMany` 계열 메서드를 조합해 사용할 수 있습니다.

```php
/**
 * Get the user's most recent image.
 */
public function latestImage(): MorphOne
{
    return $this->morphOne(Image::class, 'imageable')->latestOfMany();
}
```

마찬가지로, 관계에서 "가장 오래된" 또는 첫 번째 관련 모델을 조회하는 메서드도 정의할 수 있습니다.

```php
/**
 * Get the user's oldest image.
 */
public function oldestImage(): MorphOne
{
    return $this->morphOne(Image::class, 'imageable')->oldestOfMany();
}
```

기본적으로 `latestOfMany`와 `oldestOfMany` 메서드는 모델의 기본 키(정렬이 가능한 값 기준)로 최신/오래된 관련 모델을 찾아줍니다. 하지만, 관계가 더 많을 때 다른 정렬 기준으로 단일 모델을 가져오고 싶을 수 있습니다.

예를 들어, `ofMany` 메서드를 활용하여 사용자의 "좋아요"가 가장 많은 이미지를 가져올 수도 있습니다. `ofMany`는 첫 번째 인자로 정렬할 대상 컬럼명, 두 번째 인자로 집계 함수(`min` 또는 `max`)를 받습니다.

```php
/**
 * Get the user's most popular image.
 */
public function bestImage(): MorphOne
{
    return $this->morphOne(Image::class, 'imageable')->ofMany('likes', 'max');
}
```

> [!NOTE]
> 보다 고급스러운 "one of many" 관계도 구현할 수 있습니다. 자세한 방법은 [one of many 관계 고급 문서](#advanced-has-one-of-many-relationships)를 참고하세요.

<a name="many-to-many-polymorphic-relations"></a>
### 다대다(다형성) 관계

<a name="many-to-many-polymorphic-table-structure"></a>
#### 테이블 구조

다대다 다형성 관계는 "morph one", "morph many" 관계보다 살짝 더 복잡합니다. 예를 들어, `Post`와 `Video` 모델이 `Tag` 모델과 다형성 관계로 연결될 수 있습니다. 다대다 다형성 관계를 활용하면 게시글과 동영상 모두와 연결될 수 있는 고유 태그를 하나의 테이블로 관리할 수 있습니다. 우선, 이러한 관계를 위해 필요한 테이블 구조를 살펴보겠습니다.

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
> 다형성 다대다 관계를 시작하기 전에, 먼저 [일반적인 다대다 관계](#many-to-many) 문서를 읽어보면 도움이 됩니다.

<a name="many-to-many-polymorphic-model-structure"></a>
#### 모델 구조

이제 모델에서 관계를 정의해봅니다. `Post`와 `Video` 모델 모두 Eloquent가 제공하는 `morphToMany` 메서드를 호출하는 `tags` 메서드를 포함하게 됩니다.

`morphToMany` 메서드는 연관 모델명과 "관계 이름"을 인자로 받습니다. 우리가 중간 테이블 이름과 키에서 정한 "관계 이름"에 따라 "taggable"로 지정하면 됩니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class Post extends Model
{
    /**
     * Get all of the tags for the post.
     */
    public function tags(): MorphToMany
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }
}
```

<a name="many-to-many-polymorphic-defining-the-inverse-of-the-relationship"></a>
#### 관계의 반대편 정의하기

다음으로, `Tag` 모델에서는 각각의 가능한 부모 모델에 대해 메서드를 별도로 정의해야 합니다. 이 예시에서는 `posts` 메서드와 `videos` 메서드를 정의하는 방식입니다. 두 메서드는 모두 `morphedByMany` 메서드의 결과를 반환해야 합니다.

`morphedByMany`도 연관 모델명과 "관계 이름"을 인자로 받습니다. 마찬가지로 "관계 이름"은 "taggable"로 지정합니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class Tag extends Model
{
    /**
     * Get all of the posts that are assigned this tag.
     */
    public function posts(): MorphToMany
    {
        return $this->morphedByMany(Post::class, 'taggable');
    }

    /**
     * Get all of the videos that are assigned this tag.
     */
    public function videos(): MorphToMany
    {
        return $this->morphedByMany(Video::class, 'taggable');
    }
}
```

<a name="many-to-many-polymorphic-retrieving-the-relationship"></a>
#### 관계 조회하기

데이터베이스 테이블과 모델이 정의되면, 각 모델을 통해 다형성 관계를 조회할 수 있습니다. 예를 들어, 게시글의 모든 태그를 확인하려면 `tags` 동적 관계 속성을 사용하면 됩니다.

```php
use App\Models\Post;

$post = Post::find(1);

foreach ($post->tags as $tag) {
    // ...
}
```

다형성 자식 모델에서 `morphedByMany`를 호출하는 메서드명을 통해 부모 관계도 조회할 수 있습니다. 이 예시에서는 `Tag` 모델에서 `posts` 또는 `videos` 메서드를 호출합니다.

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

기본적으로 라라벨은 관련 모델의 "type"을 저장할 때, 완전히 네임스페이스가 지정된 클래스명을 사용합니다. 예를 들어 앞서 설명한 일대다 관계에서, `Comment` 모델이 `Post` 혹은 `Video`와 연결되는 경우, 기본적으로 `commentable_type` 값은 각각 `App\Models\Post` 또는 `App\Models\Video`가 됩니다. 하지만, 이런 값을 애플리케이션 내부 구조와 완전히 분리하여 보다 단순한 값을 쓰고 싶을 수 있습니다.

예를 들어, "type" 칼럼에는 모델명 대신 `post`, `video`등 기초적인 문자열을 사용할 수 있습니다. 이렇게 하면, 나중에 모델명을 변경해도 데이터베이스 내의 다형성 "type" 값이 계속 유효하게 유지됩니다.

```php
use Illuminate\Database\Eloquent\Relations\Relation;

Relation::enforceMorphMap([
    'post' => 'App\Models\Post',
    'video' => 'App\Models\Video',
]);
```

`enforceMorphMap` 메서드는 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 호출하거나, 별도의 서비스 프로바이더를 생성해서 넣어도 됩니다.

런타임에 모델의 morph alias(별칭)을 확인하려면 모델의 `getMorphClass` 메서드를 사용하면 됩니다. 반대로, morph alias에 해당하는 전체 네임스페이스 경로의 클래스명을 알아내려면 `Relation::getMorphedModel` 메서드를 사용할 수 있습니다.

```php
use Illuminate\Database\Eloquent\Relations\Relation;

$alias = $post->getMorphClass();

$class = Relation::getMorphedModel($alias);
```

> [!WARNING]
> 기존 애플리케이션에 "morph map"을 추가할 경우, 데이터베이스 내의 모든 다형성 `*_type` 컬럼 값이 여전히 완전히 네임스페이스가 지정된 클래스명인 경우, 반드시 "맵 이름"으로 변환해야 합니다.

<a name="dynamic-relationships"></a>
### 동적 관계(Dynamic Relationships)

`resolveRelationUsing` 메서드를 활용하면 런타임에 Eloquent 모델 간의 관계를 정의할 수 있습니다. 일반적인 애플리케이션 개발에서는 잘 사용하지 않지만, 라라벨 패키지를 개발할 때는 가끔 유용하게 활용할 수 있습니다.

`resolveRelationUsing` 메서드는 첫 번째 인자로 원하는 관계명을 전달하며, 두 번째 인자로는 모델 인스턴스를 받아서 적절한 Eloquent 관계 정의를 반환하는 클로저를 넘깁니다. 일반적으로 이런 동적 관계 정의는 [서비스 프로바이더](/docs/providers)의 boot 메서드 내에서 설정해야 합니다.

```php
use App\Models\Order;
use App\Models\Customer;

Order::resolveRelationUsing('customer', function (Order $orderModel) {
    return $orderModel->belongsTo(Customer::class, 'customer_id');
});
```

> [!WARNING]
> 동적 관계를 정의할 때는 반드시 Eloquent 관계 메서드에 명시적으로 키 이름(컬럼명) 인자를 전달해야 합니다.

<a name="querying-relations"></a>
## 관계 쿼리(Querying Relations)

모든 Eloquent 관계는 메서드로 정의되어 있으므로, 이 메서드를 호출하면 실제로 관계 모델을 로드하지 않고 관계 인스턴스를 바로 얻을 수 있습니다. 또한, 모든 종류의 Eloquent 관계는 [쿼리 빌더](/docs/queries) 역할도 하므로, 실제 SQL 쿼리를 실행하기 전에 관계 쿼리에 추가 제약 조건을 체이닝할 수 있습니다.

예를 들어, 블로그 애플리케이션에서 `User` 모델이 여러 `Post` 모델을 가지고 있다고 가정해봅시다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Model
{
    /**
     * Get all of the posts for the user.
     */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }
}
```

`posts` 관계에 쿼리 제약 조건을 추가하려면 아래처럼 할 수 있습니다.

```php
use App\Models\User;

$user = User::find(1);

$user->posts()->where('active', 1)->get();
```

모든 라라벨 [쿼리 빌더](/docs/queries) 메서드를 관계에 적용할 수 있으니, 쿼리 빌더 문서도 꼭 참고하세요.

<a name="chaining-orwhere-clauses-after-relationships"></a>
#### 관계에서 `orWhere` 체이닝 주의

앞서 예시처럼 관계 쿼리에도 제약 조건을 자유롭게 추가할 수 있습니다. 하지만, `orWhere` 문을 체이닝할 때는 주의해야 합니다. `orWhere`는 관계 제약과 같은 레벨로 논리적으로 묶이기 때문에 예상치 못한 결과가 나올 수 있습니다.

```php
$user->posts()
    ->where('active', 1)
    ->orWhere('votes', '>=', 100)
    ->get();
```

위의 쿼리는 아래와 같은 SQL을 생성합니다. 여기서 `or` 조건이 전체 쿼리의 범위를 넓혀서, `votes`가 100 이상인 모든 글까지 결과에 포함됩니다. 쿼리가 특정 사용자의 글로 제한되지 않습니다.

```sql
select *
from posts
where user_id = ? and active = 1 or votes >= 100
```

대부분의 경우에는 [논리적 그룹화](/docs/queries#logical-grouping)를 활용하여 조건들을 괄호로 묶어야 합니다.

```php
use Illuminate\Database\Eloquent\Builder;

$user->posts()
    ->where(function (Builder $query) {
        return $query->where('active', 1)
            ->orWhere('votes', '>=', 100);
    })
    ->get();
```

이렇게 하면 아래와 같은 SQL이 생성되어 조건이 올바르게 묶여서, 쿼리가 특정 사용자에게만 적용됩니다.

```sql
select *
from posts
where user_id = ? and (active = 1 or votes >= 100)
```

<a name="relationship-methods-vs-dynamic-properties"></a>
### 관계 메서드 vs. 동적 속성

추가적인 제약 조건을 따로 지정할 필요가 없다면, 관계를 마치 속성처럼 바로 접근할 수 있습니다. 예를 들어 `User`와 `Post` 예시에서, 아래처럼 모든 사용자의 게시글에 반복 접근할 수 있습니다.

```php
use App\Models\User;

$user = User::find(1);

foreach ($user->posts as $post) {
    // ...
}
```

동적 관계 속성은 접근할 때 관계 데이터를 "지연 로딩"합니다. 즉, 실제로 이 속성에 접근하는 순간에만 관계 데이터가 쿼리되어 불러옵니다. 이 때문에, 많은 개발자들이 [eager loading](#eager-loading)을 통해서, 모델을 로드한 직후 필요한 모든 관계를 미리 불러오기도 합니다. eager loading을 사용하면 모델의 관계를 로드하는 데 필요한 SQL 쿼리 수를 크게 줄일 수 있습니다.

<a name="querying-relationship-existence"></a>
### 관계 존재 여부 쿼리

모델 레코드를 조회할 때, 특정 관계가 존재하는 경우만 결과를 제한하고 싶을 때가 있습니다. 예를 들어, 한 개 이상의 댓글이 있는 블로그 게시글만 조회하려면, 관계명을 `has` 또는 `orHas` 메서드에 넘기면 됩니다.

```php
use App\Models\Post;

// 댓글이 한 개 이상 달린 모든 게시글 조회...
$posts = Post::has('comments')->get();
```

또한, 원하는 연산자와 개수 값을 전달하여 쿼리를 좀 더 세밀하게 설정할 수도 있습니다.

```php
// 댓글이 세 개 이상 달린 모든 게시글 조회...
$posts = Post::has('comments', '>=', 3)->get();
```

중첩된 `has` 조건은 "도트" 표기법을 사용할 수 있습니다. 예를 들어, 댓글 중에 적어도 하나의 이미지를 가진 게시글만 조회할 수 있습니다.

```php
// 이미지가 포함된 최소 하나의 댓글이 있는 게시글 조회...
$posts = Post::has('comments.images')->get();
```

더 세밀한 제약 조건이 필요하다면, `whereHas` 또는 `orWhereHas` 메서드를 사용하여 관계 쿼리에 추가 조건을 걸 수 있습니다. 예를 들어, 댓글 내용에 특정 단어가 포함된 게시글만 조회하려면 다음과 같이 할 수 있습니다.

```php
use Illuminate\Database\Eloquent\Builder;

// 내용이 'code%'로 시작하는 댓글이 최소 하나 있는 게시글 조회...
$posts = Post::whereHas('comments', function (Builder $query) {
    $query->where('content', 'like', 'code%');
})->get();

// 내용이 'code%'로 시작하는 댓글이 10개 이상 있는 게시글 조회...
$posts = Post::whereHas('comments', function (Builder $query) {
    $query->where('content', 'like', 'code%');
}, '>=', 10)->get();
```

> [!WARNING]
> Eloquent는 현재 데이터베이스를 넘나드는 관계 존재 쿼리를 지원하지 않습니다. 관계는 반드시 같은 데이터베이스 안에 존재해야 합니다.

<a name="many-to-many-relationship-existence-queries"></a>
#### 다대다 관계 존재 여부 쿼리

`whereAttachedTo` 메서드를 사용하여, 특정 모델이나 모델 컬렉션에 연결된 다대다 관계를 가진 모델만 조회할 수 있습니다.

```php
$users = User::whereAttachedTo($role)->get();
```

`whereAttachedTo` 메서드에는 [컬렉션](/docs/eloquent-collections) 인스턴스를 넘길 수도 있습니다. 이때는 컬렉션 내의 어느 모델에 연결돼 있어도 모두 찾아줍니다.

```php
$tags = Tag::whereLike('name', '%laravel%')->get();

$posts = Post::whereAttachedTo($tags)->get();
```

<a name="inline-relationship-existence-queries"></a>
#### 인라인 관계 존재 쿼리

특정 관계에 대해 간단한 where 조건 하나만 추가해 존재 여부 쿼리를 하고 싶다면, `whereRelation`, `orWhereRelation`, `whereMorphRelation`, `orWhereMorphRelation` 메서드를 쓰면 더 편리할 수 있습니다. 예를 들어, 승인되지 않은(unapproved) 댓글이 있는 모든 게시글을 조회하고 싶을 때 다음과 같이 할 수 있습니다.

```php
use App\Models\Post;

$posts = Post::whereRelation('comments', 'is_approved', false)->get();
```

물론, 쿼리 빌더의 where 메서드처럼 연산자도 지정할 수 있습니다.

```php
$posts = Post::whereRelation(
    'comments', 'created_at', '>=', now()->subHour()
)->get();
```

<a name="querying-relationship-absence"></a>
### 관계 부존재(없는 경우) 쿼리

모델 레코드 조회 시, 특정 관계가 없는 경우만 결과에 포함시키고 싶을 때가 있습니다. 예를 들어, 댓글이 하나도 없는 블로그 게시글만 조회하고 싶을 때, 관계명을 `doesntHave` 또는 `orDoesntHave` 메서드에 넘기면 됩니다.

```php
use App\Models\Post;

$posts = Post::doesntHave('comments')->get();
```

더 복잡한 제한 조건이 필요하다면 `whereDoesntHave` 또는 `orWhereDoesntHave` 메서드에 추가 쿼리 제약을 넣을 수 있습니다. 예를 들어, 댓글 내용이 'code%'로 시작하는 경우만 제외하고 싶다면 다음과 같이 할 수 있습니다.

```php
use Illuminate\Database\Eloquent\Builder;

$posts = Post::whereDoesntHave('comments', function (Builder $query) {
    $query->where('content', 'like', 'code%');
})->get();
```

"도트" 표기법을 사용하여 중첩 관계에도 쿼리를 실행할 수 있습니다. 예를 들어, 아래 쿼리는 댓글이 아예 없는 게시글을 조회하지만, 댓글 작성자가 "차단된(banned)" 상태가 아닌 경우에는 그 게시글도 결과에 포함됩니다.

```php
use Illuminate\Database\Eloquent\Builder;

$posts = Post::whereDoesntHave('comments.author', function (Builder $query) {
    $query->where('banned', 0);
})->get();
```

<a name="querying-morph-to-relationships"></a>

### Morph To 관계 쿼리하기

"morph to" 관계의 존재 여부를 쿼리하려면 `whereHasMorph`와 `whereDoesntHaveMorph` 메서드를 사용할 수 있습니다. 이 메서드들은 첫 번째 인수로 관계의 이름을 받습니다. 이어서 쿼리에 포함할 관련 모델의 이름(여러 개도 가능)을 인수로 전달할 수 있습니다. 마지막으로, 관계 쿼리를 커스터마이즈할 수 있는 클로저를 전달할 수 있습니다.

```php
use App\Models\Comment;
use App\Models\Post;
use App\Models\Video;
use Illuminate\Database\Eloquent\Builder;

// 제목이 code%로 시작하는 post 또는 video에 연관되어 있는 comment 조회...
$comments = Comment::whereHasMorph(
    'commentable',
    [Post::class, Video::class],
    function (Builder $query) {
        $query->where('title', 'like', 'code%');
    }
)->get();

// 제목이 code%로 시작하는 post에 연관되어 있지 않은 comment 조회...
$comments = Comment::whereDoesntHaveMorph(
    'commentable',
    Post::class,
    function (Builder $query) {
        $query->where('title', 'like', 'code%');
    }
)->get();
```

연관된 다형적 모델의 "type"에 따라 쿼리 제약 조건을 걸어야 하는 경우도 있습니다. `whereHasMorph` 메서드에 전달하는 클로저는 두 번째 인수로 `$type` 값을 받을 수 있습니다. 이 인수를 통해 어떤 타입의 쿼리가 구성되는지 확인할 수 있습니다.

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

때로는 "morph to" 관계의 부모의 하위 자식들을 쿼리해야 할 때가 있습니다. 이럴 때는 `whereMorphedTo`와 `whereNotMorphedTo` 메서드를 사용할 수 있으며, 이 메서드들은 주어진 모델에 맞는 적절한 morph type 매핑을 자동으로 결정합니다. 첫 번째 인수로 `morphTo` 관계의 이름을, 두 번째 인수로 연관된 부모 모델을 넘기면 됩니다.

```php
$comments = Comment::whereMorphedTo('commentable', $post)
    ->orWhereMorphedTo('commentable', $video)
    ->get();
```

<a name="querying-all-morph-to-related-models"></a>
#### 모든 관련 모델 쿼리하기

가능한 다형적 모델의 배열 대신, `*` 와일드카드 값을 사용할 수 있습니다. 이렇게 하면 라라벨이 데이터베이스에서 가능한 모든 다형적 타입들을 조회하여 쿼리를 수행합니다. 이를 위해 라라벨은 추가 쿼리를 실행하게 됩니다.

```php
use Illuminate\Database\Eloquent\Builder;

$comments = Comment::whereHasMorph('commentable', '*', function (Builder $query) {
    $query->where('title', 'like', 'foo%');
})->get();
```

<a name="aggregating-related-models"></a>
## 연관 모델 집계

<a name="counting-related-models"></a>
### 연관 모델 개수 세기

특정 관계에 대해 실제로 연관된 모델을 불러오지 않고, 연관 모델의 개수만 알고 싶을 때가 있습니다. 이럴 때는 `withCount` 메서드를 사용할 수 있습니다. `withCount`를 사용하면 결과 모델에 `{relation}_count` 속성이 추가됩니다.

```php
use App\Models\Post;

$posts = Post::withCount('comments')->get();

foreach ($posts as $post) {
    echo $post->comments_count;
}
```

`withCount`에 배열을 전달하면 여러 관계의 개수를 한 번에 구할 수도 있고, 쿼리에 추가 제약 조건을 걸 수도 있습니다.

```php
use Illuminate\Database\Eloquent\Builder;

$posts = Post::withCount(['votes', 'comments' => function (Builder $query) {
    $query->where('content', 'like', 'code%');
}])->get();

echo $posts[0]->votes_count;
echo $posts[0]->comments_count;
```

관계 개수 결과에 별칭을 줄 수도 있습니다. 이렇게 하면 같은 관계에 여러 개의 카운트 결과를 만들 수 있습니다.

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
#### 지연된 카운트 로딩

`loadCount` 메서드를 사용하면 부모 모델을 먼저 조회한 후에 관계의 개수만 추가로 불러올 수 있습니다.

```php
$book = Book::first();

$book->loadCount('genres');
```

카운트 쿼리에 추가 제약 조건을 걸어야 할 땐, 원하는 관계명을 키로 하는 배열을 전달할 수 있습니다. 배열의 값으로는 쿼리 빌더 인스턴스를 인수로 받는 클로저를 사용합니다.

```php
$book->loadCount(['reviews' => function (Builder $query) {
    $query->where('rating', 5);
}])
```

<a name="relationship-counting-and-custom-select-statements"></a>
#### 사용자 정의 select 문과 함께 관계 카운트 사용

`withCount`와 `select` 구문을 함께 사용할 경우, 반드시 `select` 호출 이후에 `withCount`를 호출해야 결과가 올바르게 반환됩니다.

```php
$posts = Post::select(['title', 'body'])
    ->withCount('comments')
    ->get();
```

<a name="other-aggregate-functions"></a>
### 기타 집계 함수

`withCount` 메서드 외에도, Eloquent는 `withMin`, `withMax`, `withAvg`, `withSum`, `withExists` 등의 메서드를 제공합니다. 이 메서드들을 사용하면 결과 모델에 `{relation}_{function}_{column}` 형태의 속성이 추가됩니다.

```php
use App\Models\Post;

$posts = Post::withSum('comments', 'votes')->get();

foreach ($posts as $post) {
    echo $post->comments_sum_votes;
}
```

집계 함수 결과에 별칭을 사용하고 싶으면 별칭 이름을 직접 지정할 수도 있습니다.

```php
$posts = Post::withSum('comments as total_comments', 'votes')->get();

foreach ($posts as $post) {
    echo $post->total_comments;
}
```

`loadCount`와 마찬가지로, 이 집계 메서드들에도 지연 호출 버전이 존재합니다. 이미 조회한 Eloquent 모델에 집계 연산을 추가로 수행할 수 있다는 의미입니다.

```php
$post = Post::first();

$post->loadSum('comments', 'votes');
```

이 집계 메서드들을 `select` 구문과 함께 사용할 때도 반드시 집계 메서드는 `select` 후에 호출해야 합니다.

```php
$posts = Post::select(['title', 'body'])
    ->withExists('comments')
    ->get();
```

<a name="counting-related-models-on-morph-to-relationships"></a>
### Morph To 관계의 연관 모델 개수 세기

"morph to" 관계를 eager load 하면서, 해당 관계를 통해 반환되는 여러 개의 엔티티에 대해 연관 모델의 카운트도 함께 불러오고 싶을 때가 있습니다. 이럴 땐 `with` 메서드와 morphTo 관계의 `morphWithCount` 메서드를 조합해서 사용할 수 있습니다.

예를 들어, `Photo`와 `Post` 모델이 `ActivityFeed` 모델을 생성할 수 있다고 가정해 보겠습니다. 그리고 `ActivityFeed` 모델이 `parentable`이라는 morphTo 관계를 통해, 특정 ActivityFeed 인스턴스가 어떤 Photo 또는 Post 모델에 속했는지 가져올 수 있다고 가정합니다. 또, Photo는 여러 Tag를, Post는 여러 Comment를 가질 수 있다고 합시다.

이제 각 `ActivityFeed` 인스턴스별로 부모 `parentable` 모델(즉 Photo 또는 Post)을 eager load 하고, 각 부모 Photo에는 연결된 tag의 개수를, 각 부모 Post에는 연결된 comment의 개수를 함께 불러오려면 다음과 같이 할 수 있습니다.

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
#### 지연된 카운트 로딩

이미 여러 `ActivityFeed` 모델을 조회한 상태에서, 이 ActivityFeed들의 다양한 `parentable` 모델과 연관된 하위 관계들의 카운트 값을 불러오고 싶을 때는 `loadMorphCount` 메서드를 사용할 수 있습니다.

```php
$activities = ActivityFeed::with('parentable')->get();

$activities->loadMorphCount('parentable', [
    Photo::class => ['tags'],
    Post::class => ['comments'],
]);
```

<a name="eager-loading"></a>
## Eager Loading(즉시 로딩)

Eloquent 관계를 속성으로 접근하면, 해당 관계의 모델이 "지연 로드(lazy loaded)"됩니다. 즉, 관계 데이터는 처음 해당 속성에 접근할 때 실제로 쿼리가 실행되어 불러옵니다. 반면, Eloquent는 부모 모델을 쿼리할 때 관계 모델을 "즉시 로드(eager load)"할 수 있습니다. 즉시 로딩은 "N+1 쿼리 문제"를 해결하는 데 매우 유용합니다.

예를 들어, `Book` 모델이 `Author` 모델과 "belongs to" 관계로 연결되어 있다고 가정해 봅시다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Book extends Model
{
    /**
     * 이 책을 쓴 작가를 가져옵니다.
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(Author::class);
    }
}
```

이제 모든 책과 각 책의 작가를 조회해 보겠습니다.

```php
use App\Models\Book;

$books = Book::all();

foreach ($books as $book) {
    echo $book->author->name;
}
```

위 반복문은 데이터베이스에서 책 전체를 한 번에 가져오는 쿼리 1회, 각 책별로 작가를 가져오는 쿼리(책의 개수만큼) 총 N+1회 쿼리를 실행하게 됩니다. 예를 들어 책이 25권이라면, 위 코드는 총 26번의 쿼리를 실행합니다.

다행히 즉시 로딩을 사용하면 이 동작을 딱 두 번의 쿼리만으로 줄일 수 있습니다. 쿼리 작성 시 `with` 메서드를 통해 즉시 로드할 관계명을 명시하면 됩니다.

```php
$books = Book::with('author')->get();

foreach ($books as $book) {
    echo $book->author->name;
}
```

이 경우엔 다음과 같이 단 두 번의 쿼리만 실행됩니다. 하나는 책 전체를, 다른 하나는 모든 책의 작가를 한꺼번에 불러옵니다.

```sql
select * from books

select * from authors where id in (1, 2, 3, 4, 5, ...)
```

<a name="eager-loading-multiple-relationships"></a>
#### 여러 관계 즉시 로딩

여러 관계를 즉시 로딩해야 할 때는, `with` 메서드에 배열로 관계명을 전달하면 됩니다.

```php
$books = Book::with(['author', 'publisher'])->get();
```

<a name="nested-eager-loading"></a>
#### 중첩 관계 즉시 로딩

관계의 관계까지도 즉시 로딩하고 싶을 땐, "점(.) 문법"을 사용할 수 있습니다. 예를 들어, 모든 책의 작가와 그 작가의 연락처까지 불러오려면 다음과 같이 작성할 수 있습니다.

```php
$books = Book::with('author.contacts')->get();
```

또는 여러 중첩 관계를 효율적으로 eager load 해야 할 경우, 중첩 배열 형태로 관계를 정의할 수도 있습니다.

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

`morphTo` 관계를 즉시 로딩할 때, 그 관계로 반환될 수 있는 다양한 엔티티의 중첩 관계까지 불러오고 싶으면, `with` 메서드와 morphTo 관계의 `morphWith` 메서드를 조합해 사용하면 됩니다. 예제 모델을 살펴보겠습니다.

```php
<?php

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ActivityFeed extends Model
{
    /**
     * 활동 피드 레코드의 부모를 가져옵니다.
     */
    public function parentable(): MorphTo
    {
        return $this->morphTo();
    }
}
```

여기서, `Event`, `Photo`, `Post` 모델이 모두 `ActivityFeed`를 생성할 수 있다고 가정합니다. 또, `Event` 모델은 `Calendar` 모델과 연결되어 있고, `Photo` 모델은 `Tag` 모델과, `Post` 모델은 `Author` 모델과 관계를 맺고 있습니다.

이 조건에서, `ActivityFeed` 인스턴스들을 조회하고 각각의 `parentable` 모델과, 그들의 하위 관계까지 한 번에 가져올 수 있습니다.

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

항상 모든 컬럼이 필요한 것은 아닙니다. 필요한 컬럼만 조회하고 싶으면, 관계명 다음에 조회할 컬럼 목록을 지정할 수 있습니다.

```php
$books = Book::with('author:id,name,book_id')->get();
```

> [!WARNING]
> 이 기능을 사용할 때는 반드시 `id` 컬럼과 필요한 모든 외래 키 컬럼을 컬럼 목록에 포함해야 합니다.

<a name="eager-loading-by-default"></a>
#### 기본 즉시 로딩 설정하기

어떤 모델을 조회할 때마다 항상 특정 관계를 즉시 로딩하고 싶을 때가 있습니다. 이럴 땐 모델에 `$with` 속성을 설정하면 됩니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Book extends Model
{
    /**
     * 항상 로드할 관계 목록
     *
     * @var array
     */
    protected $with = ['author'];

    /**
     * 이 책의 저자를 반환합니다.
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(Author::class);
    }

    /**
     * 이 책의 장르를 반환합니다.
     */
    public function genre(): BelongsTo
    {
        return $this->belongsTo(Genre::class);
    }
}
```

단일 쿼리 내에서 `$with` 속성에서 특정 관계를 제외하려면 `without` 메서드를 사용하세요.

```php
$books = Book::without('author')->get();
```

한 쿼리에서 `$with`에 명시된 모든 관계를 덮어쓰고 싶다면 `withOnly` 메서드를 사용하세요.

```php
$books = Book::withOnly('genre')->get();
```

<a name="constraining-eager-loads"></a>
### 즉시 로딩 쿼리 제약

관계별로 즉시 로딩 조건을 추가하고 싶을 때, `with` 메서드에 배열을 전달하되, 배열의 키는 관계명, 값은 쿼리 조건을 추가하는 클로저를 지정하면 됩니다.

```php
use App\Models\User;
use Illuminate\Contracts\Database\Eloquent\Builder;

$users = User::with(['posts' => function (Builder $query) {
    $query->where('title', 'like', '%code%');
}])->get();
```

위 예시에서는, 게시글(Posts) 중에서 제목에 `code`가 들어간 게시글만 eager load 하게 됩니다. 또한 [쿼리 빌더](/docs/queries)의 다른 메서드도 호출할 수 있어 eager loading 쿼리를 다양하게 커스터마이즈할 수 있습니다.

```php
$users = User::with(['posts' => function (Builder $query) {
    $query->orderBy('created_at', 'desc');
}])->get();
```

<a name="constraining-eager-loading-of-morph-to-relationships"></a>
#### `morphTo` 관계의 즉시 로딩 쿼리 제약

`morphTo` 관계를 즉시 로딩할 경우, Eloquent는 각 타입의 관련 모델별로 여러 쿼리를 실행합니다. 이때, `MorphTo` 관계의 `constrain` 메서드를 사용해 각 타입별로 조건을 추가할 수 있습니다.

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

이 예시에서는, 숨겨지지 않은(Post) 게시물과 type이 "educational"인(Video) 비디오만 eager load 하게 됩니다.

<a name="constraining-eager-loads-with-relationship-existence"></a>
#### 관계 존재 조건으로 즉시 로딩 쿼리 제약

관계의 존재 여부를 확인하면서, 동시에 해당 조건을 만족하는 관계 데이터만 eager load 하고 싶을 때가 있습니다. 예를 들어, 특정 조건을 만족하는 자식 Post가 있는 User 모델만 가져오고, 동시에 조건에 맞는 게시글만 eager load 하고 싶다면 `withWhereHas` 메서드를 사용하면 됩니다.

```php
use App\Models\User;

$users = User::withWhereHas('posts', function ($query) {
    $query->where('featured', true);
})->get();
```

<a name="lazy-eager-loading"></a>
### Lazy Eager Loading(동적 즉시 로딩)

부모 모델을 미리 조회한 뒤, 상황에 따라 관계를 즉시 로딩해야 할 때가 있습니다. 예를 들어, 동적으로 연결된 모델을 불러올 필요가 있을 때 유용합니다.

```php
use App\Models\Book;

$books = Book::all();

if ($someCondition) {
    $books->load('author', 'publisher');
}
```

즉시 로딩 쿼리에 추가 조건을 걸고 싶다면, 배열을 전달하되 키는 eager load할 관계명, 값은 쿼리 인스턴스를 받는 클로저를 지정할 수 있습니다.

```php
$author->load(['books' => function (Builder $query) {
    $query->orderBy('published_date', 'asc');
}]);
```

이미 로드되지 않은 관계만 불러오고 싶을 때는 `loadMissing` 메서드를 사용하세요.

```php
$book->loadMissing('author');
```

<a name="nested-lazy-eager-loading-morphto"></a>
#### Nested Lazy Eager Loading 및 `morphTo`

`morphTo` 관계와, 그것에 연결된 다양한 모델들의 하위 관계까지 lazy eager loading 하고 싶다면, `loadMorph` 메서드를 사용할 수 있습니다.

이 메서드는 첫 번째 인수로 `morphTo` 관계의 이름을, 두 번째 인수로는 [모델 => 관계 배열] 형태의 배열을 받습니다. 이해를 돕기 위해 아래 모델 예시를 참고하세요.

```php
<?php

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ActivityFeed extends Model
{
    /**
     * 활동 피드의 부모를 반환합니다.
     */
    public function parentable(): MorphTo
    {
        return $this->morphTo();
    }
}
```

여기서는 `Event`, `Photo`, `Post` 모델이 모두 `ActivityFeed`를 생성하고, 각 모델마다 고유한 하위 관계들을 갖고 있다고 가정합니다. 아래 예시처럼 parentable 모델의 각 하위 관계까지 한 번에 로드할 수 있습니다.

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
### 자동 Eager Loading

> [!WARNING]
> 이 기능은 현재 커뮤니티 피드백 수집을 위해 베타 버전으로 제공되고 있습니다. 이 기능의 동작 및 기능은 향후 패치 릴리스에서도 변경될 수 있습니다.

많은 경우 라라벨은 여러분이 접근하는 관계를 자동으로 eager load 할 수 있습니다. 자동 eager loading을 활성화하려면, 애플리케이션의 `AppServiceProvider`의 `boot` 메서드 안에서 `Model::automaticallyEagerLoadRelationships` 메서드를 호출하세요.

```php
use Illuminate\Database\Eloquent\Model;

/**
 * 애플리케이션 서비스 부트스트랩
 */
public function boot(): void
{
    Model::automaticallyEagerLoadRelationships();
}
```

이 기능이 활성화되면, 아직 로드되지 않은 관계에 접근할 때마다 라라벨이 자동으로 해당 관계를 로드합니다. 아래의 예제를 살펴보세요.

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

보통 위의 코드는 각 유저별로 posts를, 각 post별로 comments를 조회하는 쿼리를 실행하며 N+1 문제가 발생합니다. 하지만 `automaticallyEagerLoadRelationships` 기능이 활성화되면, 유저를 조회한 컬렉션에서 posts를 한 번이라도 접근하면 해당 컬렉션 내 모든 유저의 posts를 한 번에 lazy eager loading 합니다. 마찬가지로 어떠한 post의 comments에 접근하면, 처음 조회한 모든 post의 comments가 한 번에 lazy eager loading 됩니다.

이 기능을 전체 프로젝트에 적용하고 싶지 않다면, 특정 Eloquent 컬렉션 인스턴스에만 부분적으로 적용할 수도 있습니다. 이때는 컬렉션에서 `withRelationshipAutoloading` 메서드를 호출하세요.

```php
$users = User::where('vip', true)->get();

return $users->withRelationshipAutoloading();
```

<a name="preventing-lazy-loading"></a>

### 지연 로딩 방지

앞서 설명했듯이, 리레이션을 즉시 로딩(eager loading)하는 것이 애플리케이션의 성능에 큰 이점을 가져다줄 수 있습니다. 따라서 필요하다면, 라라벨이 항상 리레이션의 지연 로딩(lazy loading)을 방지하도록 설정할 수도 있습니다. 이 작업을 위해서는 Eloquent 기본 모델 클래스에서 제공하는 `preventLazyLoading` 메서드를 호출하면 됩니다. 일반적으로 이 메서드는 애플리케이션의 `AppServiceProvider` 클래스 내 `boot` 메서드에서 호출하는 것이 좋습니다.

`preventLazyLoading` 메서드는 지연 로딩을 방지할지 여부를 나타내는 불리언 값을 인수로 받습니다. 예를 들어, 지연 로딩을 비생산 환경(로컬, 개발, 스테이징 등)에서만 비활성화하고, 프로덕션 환경에서는 우연히 지연 로딩이 발생하더라도 정상 동작하게 만들고 싶을 때 아래와 같이 설정할 수 있습니다.

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

지연 로딩이 방지된 상태에서 애플리케이션이 Eloquent 리레이션을 지연 로딩하려고 하면, 라라벨은 `Illuminate\Database\LazyLoadingViolationException` 예외를 발생시킵니다.

지연 로딩 위반이 발생했을 때의 동작을 커스터마이즈하려면 `handleLazyLoadingViolationsUsing` 메서드를 사용할 수 있습니다. 예를 들어, 아래처럼 예외를 발생시키는 대신 로그만 남기도록 동작을 바꿀 수도 있습니다.

```php
Model::handleLazyLoadingViolationUsing(function (Model $model, string $relation) {
    $class = $model::class;

    info("Attempted to lazy load [{$relation}] on model [{$class}].");
});
```

<a name="inserting-and-updating-related-models"></a>
## 연관된 모델 삽입 및 갱신

<a name="the-save-method"></a>
### `save` 메서드

Eloquent에서는 새로운 모델을 리레이션에 쉽게 추가할 수 있도록 여러 편리한 메서드를 제공합니다. 예를 들어, 게시글(post)에 새로운 댓글(comment)을 추가해야 한다고 가정해 보겠습니다. 이때 `Comment` 모델에 `post_id` 속성을 직접 지정하는 대신, 리레이션의 `save` 메서드를 사용해 댓글을 추가할 수 있습니다.

```php
use App\Models\Comment;
use App\Models\Post;

$comment = new Comment(['message' => 'A new comment.']);

$post = Post::find(1);

$post->comments()->save($comment);
```

이 예제에서 `comments` 리레이션을 동적 속성처럼 사용하지 않고, 메서드 호출 형태(`comments()`)로 사용하여 리레이션 인스턴스를 얻은 사실에 주목해야 합니다. `save` 메서드는 새로운 `Comment` 모델에 적절한 `post_id` 값을 자동으로 채워줍니다.

여러 개의 연관된 모델을 한 번에 저장하고 싶을 경우에는 `saveMany` 메서드를 사용할 수 있습니다.

```php
$post = Post::find(1);

$post->comments()->saveMany([
    new Comment(['message' => 'A new comment.']),
    new Comment(['message' => 'Another new comment.']),
]);
```

`save`와 `saveMany` 메서드는 전달된 모델 인스턴스를 데이터베이스에 저장하지만, 이미 부모 모델에 로드되어 있던 리레이션(메모리상의 컬렉션)에는 새로 저장한 모델이 자동으로 추가되지는 않습니다. 만약 저장 후 바로 리레이션을 다시 조회하려면, `refresh` 메서드로 모델과 리레이션을 새로 로드하는 것이 좋습니다.

```php
$post->comments()->save($comment);

$post->refresh();

// 새로 저장된 댓글을 포함한 모든 댓글을 가져옵니다.
$post->comments;
```

<a name="the-push-method"></a>
#### 모델과 리레이션을 재귀적으로 저장하기

모델 자신과 연관된 모든 리레이션의 내용까지 한 번에 저장하고 싶다면, `push` 메서드를 사용할 수 있습니다. 예를 들어, 아래 코드는 `Post` 모델, 해당 게시글의 첫 번째 댓글, 그리고 그 댓글의 작성자를 모두 저장합니다.

```php
$post = Post::find(1);

$post->comments[0]->message = 'Message';
$post->comments[0]->author->name = 'Author Name';

$post->push();
```

이벤트를 발생시키지 않고 모델 및 연관 데이터만 조용히 저장하려면 `pushQuietly` 메서드를 사용할 수 있습니다.

```php
$post->pushQuietly();
```

<a name="the-create-method"></a>
### `create` 메서드

`save`와 `saveMany` 외에도, 속성 배열을 받아 새 모델을 생성하고 데이터베이스에 추가해주는 `create` 메서드를 사용할 수도 있습니다. `save`와의 차이는 `save`는 완성된 Eloquent 모델 인스턴스를 인수로 받지만, `create`는 PHP의 일반 배열을 받아 처리한다는 점입니다. `create` 메서드는 새로 생성된 모델 인스턴스를 반환합니다.

```php
use App\Models\Post;

$post = Post::find(1);

$comment = $post->comments()->create([
    'message' => 'A new comment.',
]);
```

여러 개의 연관 모델을 한 번에 생성하려면 `createMany`를 쓸 수 있습니다.

```php
$post = Post::find(1);

$post->comments()->createMany([
    ['message' => 'A new comment.'],
    ['message' => 'Another new comment.'],
]);
```

이벤트를 발생시키지 않고 조용히 새 모델을 추가하려면 `createQuietly` 및 `createManyQuietly` 메서드를 사용할 수 있습니다.

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

또한, `findOrNew`, `firstOrNew`, `firstOrCreate`, `updateOrCreate` 등 다양한 메서드로 [리레이션을 통해 모델을 생성하거나 갱신](/docs/eloquent#upserts)할 수 있습니다.

> [!NOTE]
> `create` 메서드를 사용하기 전에 [대량 할당(mass assignment)](/docs/eloquent#mass-assignment) 관련 문서를 꼭 숙지하시기 바랍니다.

<a name="updating-belongs-to-relationships"></a>
### Belongs To(소속) 리레이션

자식 모델을 새로운 부모 모델에 연결하고 싶을 경우, `associate` 메서드를 이용할 수 있습니다. 아래 예시처럼 `User` 모델이 `Account` 모델과 `belongsTo` 리레이션 관계를 맺고 있을 때, `associate` 메서드는 자식 모델의 외래키 값을 설정해줍니다.

```php
use App\Models\Account;

$account = Account::find(10);

$user->account()->associate($account);

$user->save();
```

반대로, 자식 모델에서 부모 모델의 연결을 끊으려면 `dissociate` 메서드를 사용하면 됩니다. 이 메서드는 해당 리레이션의 외래키 값을 `null`로 설정합니다.

```php
$user->account()->dissociate();

$user->save();
```

<a name="updating-many-to-many-relationships"></a>
### 다대다(Many to Many) 리레이션

<a name="attaching-detaching"></a>
#### 연결(Attach) / 분리(Detach)

Eloquent는 다대다 리레이션 작업도 아주 쉽게 처리할 수 있도록 여러 메서드를 제공합니다. 예를 들어, 한 사용자는 여러 역할(role)을 가질 수 있고, 하나의 역할도 여러 사용자를 가질 수 있다고 합시다. 이때 `attach` 메서드로 중간 테이블에 레코드를 추가하여 사용자를 역할에 연결할 수 있습니다.

```php
use App\Models\User;

$user = User::find(1);

$user->roles()->attach($roleId);
```

연결할 때 중간 테이블에 추가적으로 저장해야 할 데이터가 있다면 배열로 넘길 수 있습니다.

```php
$user->roles()->attach($roleId, ['expires' => $expires]);
```

역할을 사용자로부터 분리할 필요가 있다면, `detach` 메서드를 사용해 해당 중간 테이블의 레코드를 삭제하면 됩니다. 이 작업은 리레이션 레코드만 삭제하며, 두 모델 자체는 데이터베이스에 그대로 남아 있습니다.

```php
// 사용자에서 특정 역할을 하나만 분리...
$user->roles()->detach($roleId);

// 사용자에서 모든 역할을 분리...
$user->roles()->detach();
```

실제로는 `attach`, `detach` 모두 ID의 배열을 입력 값으로 받을 수도 있습니다.

```php
$user = User::find(1);

$user->roles()->detach([1, 2, 3]);

$user->roles()->attach([
    1 => ['expires' => $expires],
    2 => ['expires' => $expires],
]);
```

<a name="syncing-associations"></a>
#### 연관관계 동기화

중간 테이블의 다대다 관계를 한 번에 맞추고 싶을 때는 `sync` 메서드를 사용할 수 있습니다. `sync`는 ID 배열을 받아 중간 테이블의 데이터와 동기화합니다. 입력된 배열에 없는 ID는 중간 테이블에서 전부 삭제되고, 입력된 ID만 남게 됩니다.

```php
$user->roles()->sync([1, 2, 3]);
```

동시에 중간 테이블에 추가적인 값을 넣어야 할 경우 아래와 같이 사용할 수 있습니다.

```php
$user->roles()->sync([1 => ['expires' => true], 2, 3]);
```

모든 ID에 동일한 중간 테이블 값을 넣고 싶다면 `syncWithPivotValues`를 사용할 수 있습니다.

```php
$user->roles()->syncWithPivotValues([1, 2, 3], ['active' => true]);
```

입력한 배열에 없는 기존 ID들을 분리(삭제)하지 않으려면 `syncWithoutDetaching` 메서드를 사용하면 됩니다.

```php
$user->roles()->syncWithoutDetaching([1, 2, 3]);
```

<a name="toggling-associations"></a>
#### 연관관계 토글

다대다 리레이션은 지정한 모델 ID들의 연결 상태를 “반전”하는 `toggle` 메서드도 제공합니다. 즉, 주어진 ID가 현재 연결되어 있으면 분리하고, 분리되어 있으면 연결합니다.

```php
$user->roles()->toggle([1, 2, 3]);
```

마찬가지로 추가적인 중간 테이블 값을 함께 전달할 수도 있습니다.

```php
$user->roles()->toggle([
    1 => ['expires' => true],
    2 => ['expires' => true],
]);
```

<a name="updating-a-record-on-the-intermediate-table"></a>
#### 중간 테이블의 레코드 수정하기

중간 테이블에 이미 존재하는 데이터(예: 역할의 부가 데이터 등)를 수정하고 싶을 때는, `updateExistingPivot` 메서드를 사용합니다. 이 메서드는 중간 레코드의 외래 키 값과, 수정할 속성 배열을 인수로 받습니다.

```php
$user = User::find(1);

$user->roles()->updateExistingPivot($roleId, [
    'active' => false,
]);
```

<a name="touching-parent-timestamps"></a>
## 부모 타임스탬프 갱신(Touch)하기

어떤 모델이 다른 모델과 `belongsTo` 또는 `belongsToMany` 리레이션을 맺고 있을 때(예: `Comment`가 `Post`에 소속되어 있는 경우), 자식 모델이 갱신될 때 부모 모델의 타임스탬프를 자동으로 갱신해주고 싶을 때가 있습니다.

예를 들어, `Comment` 모델이 업데이트될 때마다 소유 `Post`의 `updated_at` 값을 현재 날짜·시간으로 자동 변경하려면, 자식 모델에 `touches` 속성을 배열로 추가하고, 갱신할 리레이션명을 명시하면 됩니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comment extends Model
{
    /**
     * 업데이트 시 타임스탬프를 갱신할 리레이션 목록
     *
     * @var array
     */
    protected $touches = ['post'];

    /**
     * 댓글이 소속된 게시글 리레이션 정의
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }
}
```

> [!WARNING]
> 부모 모델의 타임스탬프는 자식 모델을 Eloquent의 `save` 메서드로 갱신할 때만 업데이트됩니다.