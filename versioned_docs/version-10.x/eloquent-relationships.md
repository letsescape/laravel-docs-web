# Eloquent: 연관관계 (Eloquent: Relationships)

- [소개](#introduction)
- [연관관계 정의하기](#defining-relationships)
    - [일대일 관계](#one-to-one)
    - [일대다 관계](#one-to-many)
    - [일대다(역방향) / Belongs To](#one-to-many-inverse)
    - [여러 개 중 하나(Has One of Many)](#has-one-of-many)
    - [중간 테이블을 통한 일대일(Has One Through)](#has-one-through)
    - [중간 테이블을 통한 일대다(Has Many Through)](#has-many-through)
- [다대다 연관관계](#many-to-many)
    - [중간 테이블 컬럼 조회](#retrieving-intermediate-table-columns)
    - [중간 테이블 컬럼으로 쿼리 필터링](#filtering-queries-via-intermediate-table-columns)
    - [중간 테이블 컬럼으로 쿼리 정렬](#ordering-queries-via-intermediate-table-columns)
    - [커스텀 중간 테이블 모델 정의](#defining-custom-intermediate-table-models)
- [폴리모픽(Polymorphic) 연관관계](#polymorphic-relationships)
    - [일대일](#one-to-one-polymorphic-relations)
    - [일대다](#one-to-many-polymorphic-relations)
    - [여러 개 중 하나](#one-of-many-polymorphic-relations)
    - [다대다](#many-to-many-polymorphic-relations)
    - [커스텀 폴리모픽 타입](#custom-polymorphic-types)
- [동적 연관관계](#dynamic-relationships)
- [연관관계 쿼리](#querying-relations)
    - [연관관계 메서드 vs. 동적 속성](#relationship-methods-vs-dynamic-properties)
    - [연관관계 존재 쿼리](#querying-relationship-existence)
    - [연관관계 부재 쿼리](#querying-relationship-absence)
    - [Morph To 연관관계 쿼리](#querying-morph-to-relationships)
- [연관된 모델 집계](#aggregating-related-models)
    - [연관된 모델 개수 세기](#counting-related-models)
    - [기타 집계 함수](#other-aggregate-functions)
    - [Morph To 연관관계에서 개수 세기](#counting-related-models-on-morph-to-relationships)
- [즉시 로딩(Eager Loading)](#eager-loading)
    - [즉시 로딩 제한하기](#constraining-eager-loads)
    - [지연 즉시 로딩(Lazy Eager Loading)](#lazy-eager-loading)
    - [지연 로딩 방지](#preventing-lazy-loading)
- [연관된 모델 추가 및 갱신](#inserting-and-updating-related-models)
    - [`save` 메서드](#the-save-method)
    - [`create` 메서드](#the-create-method)
    - [Belongs To 연관관계](#updating-belongs-to-relationships)
    - [다대다 연관관계](#updating-many-to-many-relationships)
- [상위 모델 타임스탬프 동기화](#touching-parent-timestamps)

<a name="introduction"></a>
## 소개

데이터베이스 테이블들은 종종 서로 연관되어 있습니다. 예를 들어, 블로그 포스트에는 여러 개의 댓글이 달릴 수 있고, 주문은 주문을 한 사용자와 연결될 수 있습니다. Eloquent는 이러한 연관관계를 쉽게 관리하고 사용할 수 있게 해주며, 다음과 같은 다양한 일반적인 연관관계들을 지원합니다.

<div class="content-list" markdown="1">

- [일대일 관계](#one-to-one)
- [일대다 관계](#one-to-many)
- [다대다 관계](#many-to-many)
- [중간 테이블을 통한 일대일(Has One Through)](#has-one-through)
- [중간 테이블을 통한 일대다(Has Many Through)](#has-many-through)
- [일대일(폴리모픽)](#one-to-one-polymorphic-relations)
- [일대다(폴리모픽)](#one-to-many-polymorphic-relations)
- [다대다(폴리모픽)](#many-to-many-polymorphic-relations)

</div>

<a name="defining-relationships"></a>
## 연관관계 정의하기

Eloquent의 연관관계는 각 Eloquent 모델 클래스 안에 메서드로 정의합니다. 연관관계 메서드는 강력한 [쿼리 빌더](/docs/10.x/queries) 역할도 하기 때문에, 메서드로 정의하면 다양한 메서드 체이닝 및 쿼리 기능을 편리하게 활용할 수 있습니다. 예를 들어, 다음과 같이 `posts` 연관관계에 추가적인 쿼리 조건을 연결해서 사용할 수 있습니다.

```
$user->posts()->where('active', 1)->get();
```

이제 본격적으로 연관관계를 사용하는 법을 살펴보기 전에, Eloquent가 지원하는 각 연관관계 유형을 어떻게 정의하는지 먼저 알아보겠습니다.

<a name="one-to-one"></a>
### 일대일 관계

일대일 관계는 가장 기본적인 데이터베이스 연관관계입니다. 예를 들어, `User` 모델이 하나의 `Phone` 모델과 연결되어 있을 수 있습니다. 이런 관계를 정의하려면, `User` 모델에 `phone` 메서드를 추가합니다. 이 `phone` 메서드는 `hasOne` 메서드를 호출하고 그 결과를 반환해야 합니다. `hasOne` 메서드는 `Illuminate\Database\Eloquent\Model` 클래스에 정의되어 있어 모든 모델에서 사용할 수 있습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Model
{
    /**
     * 사용자와 연관된 전화번호를 가져옵니다.
     */
    public function phone(): HasOne
    {
        return $this->hasOne(Phone::class);
    }
}
```

`hasOne` 메서드의 첫 번째 인수에는 연관된 모델 클래스명을 지정합니다. 일대일 관계가 정의되면, Eloquent의 동적 속성(dyanmic property) 기능을 사용해서 관련된 레코드를 불러올 수 있습니다. 동적 속성 덕분에 연관관계 메서드를 모델의 속성처럼 접근할 수 있습니다.

```
$phone = User::find(1)->phone;
```

Eloquent는 부모 모델 이름을 기반으로 연관관계의 외래 키(foreign key)를 자동으로 결정합니다. 이 예시에서는 `Phone` 모델에 기본적으로 `user_id`라는 외래 키가 있다고 가정합니다. 만약 이 규칙을 오버라이드하고 싶다면, `hasOne` 메서드의 두 번째 인수로 원하는 외래 키 이름을 넘겨줄 수 있습니다.

```
return $this->hasOne(Phone::class, 'foreign_key');
```

또한 Eloquent는 외래 키의 값이 부모의 기본 키 컬럼 값과 일치해야 한다고 가정합니다. 즉, Eloquent는 `Phone` 레코드의 `user_id` 컬럼에서 사용자의 `id` 값을 찾게 됩니다. 만약 기본 키 컬럼이 `id`가 아니거나, `$primaryKey` 속성에 지정된 값과 다르다면, `hasOne` 메서드의 세 번째 인수로 원하는 로컬 키(local key) 이름을 지정할 수 있습니다.

```
return $this->hasOne(Phone::class, 'foreign_key', 'local_key');
```

<a name="one-to-one-defining-the-inverse-of-the-relationship"></a>
#### 연관관계의 역방향 정의하기

이제 `User` 모델에서 `Phone` 모델을 접근할 수 있게 되었습니다. 다음으로, `Phone` 모델에서 해당 전화의 주인인 사용자를 가져올 수 있게 연관관계를 정의해보겠습니다. 일대일(`hasOne`) 관계의 역방향은 `belongsTo` 메서드를 사용해 정의합니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Phone extends Model
{
    /**
     * 전화번호의 주인인 사용자를 가져옵니다.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
```

`user` 메서드를 호출하면, Eloquent는 `Phone` 모델의 `user_id` 컬럼 값과 일치하는 `id`를 가진 `User` 모델을 찾으려고 시도합니다.

Eloquent는 연관관계 메서드 이름에 `_id`를 붙여 외래 키 이름을 추론합니다. 즉, 이 경우 `Phone` 모델에는 자동으로 `user_id` 컬럼이 있다고 가정하게 됩니다. 하지만 만약 외래 키 컬럼명이 `user_id`가 아니라면, `belongsTo` 메서드의 두 번째 인수로 원하는 외래 키 이름을 지정할 수 있습니다.

```
/**
 * 전화번호의 주인인 사용자를 가져옵니다.
 */
public function user(): BelongsTo
{
    return $this->belongsTo(User::class, 'foreign_key');
}
```

또한 부모 모델의 기본 키가 `id`가 아니거나, 연관된 모델을 찾을 때 다른 컬럼을 기반으로 하고 싶다면, `belongsTo` 메서드의 세 번째 인수로 부모 테이블의 원하는 키를 지정할 수 있습니다.

```
/**
 * 전화번호의 주인인 사용자를 가져옵니다.
 */
public function user(): BelongsTo
{
    return $this->belongsTo(User::class, 'foreign_key', 'owner_key');
}
```

<a name="one-to-many"></a>
### 일대다 관계

일대다 연관관계는 하나의 모델이 여러 개의 하위 모델(자식 모델)을 가질 때 사용합니다. 예를 들어, 하나의 블로그 포스트에는 무한히 많은 댓글이 달릴 수 있습니다. 다른 Eloquent 연관관계와 마찬가지로, 일대다 관계도 모델에 메서드로 정의하면 됩니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Post extends Model
{
    /**
     * 블로그 포스트의 댓글들을 가져옵니다.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }
}
```

Eloquent는 `Comment` 모델의 적절한 외래 키 컬럼명을 자동으로 결정합니다. 기본적으로 부모 모델명을 '스네이크 케이스(snake case)'로 변환한 뒤, 뒤에 `_id`를 붙여서 컬럼명을 만듭니다. 따라서 이 예시에서 Eloquent는 `Comment` 모델에 `post_id` 컬럼이 있다고 가정합니다.

이렇게 연관관계 메서드를 정의하면, 관련된 댓글들을 [컬렉션](/docs/10.x/eloquent-collections) 객체로 접근할 수 있습니다. Eloquent의 "동적 연관관계 속성" 덕분에, 연관관계 메서드를 마치 속성처럼 사용할 수 있습니다.

```
use App\Models\Post;

$comments = Post::find(1)->comments;

foreach ($comments as $comment) {
    // ...
}
```

모든 연관관계는 쿼리 빌더 역할도 하므로, `comments` 메서드를 바로 호출해서 체이닝으로 쿼리 조건을 추가할 수 있습니다.

```
$comment = Post::find(1)->comments()
                    ->where('title', 'foo')
                    ->first();
```

`hasOne` 메서드와 마찬가지로, `hasMany` 메서드에도 추가 인수를 전달해서 외래 키 및 로컬 키를 오버라이드할 수 있습니다.

```
return $this->hasMany(Comment::class, 'foreign_key');

return $this->hasMany(Comment::class, 'foreign_key', 'local_key');
```

<a name="one-to-many-inverse"></a>
### 일대다(역방향) / Belongs To

이제 포스트의 모든 댓글에 접근할 수 있으니, 이번에는 댓글에서 상위 포스트(부모)에 접근할 수 있게 연관관계를 정의해봅니다. 일대다(`hasMany`) 관계의 역방향은, 자식 모델(댓글)에 연관관계 메서드를 만들고 그 안에서 `belongsTo` 메서드를 사용하면 됩니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comment extends Model
{
    /**
     * 댓글이 소속된 포스트를 가져옵니다.
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }
}
```

연관관계를 정의하면, 댓글의 '동적 연관관계 속성'을 통해 상위 포스트에 접근할 수 있습니다.

```
use App\Models\Comment;

$comment = Comment::find(1);

return $comment->post->title;
```

위 예시에서 Eloquent는 `Comment` 모델의 `post_id` 컬럼 값과 일치하는 `id`를 가진 `Post` 모델을 찾게 됩니다.

Eloquent는 기본 외래 키 컬럼명을, 연관관계 메서드 이름 뒤에 `_`와 상위 모델의 기본 키 컬럼명을 붙여서 생성합니다. 즉, 이 예시에서는 `comments` 테이블의 `post_id` 컬럼이 `Post` 모델의 외래 키로 사용됩니다.

만약 연관관계의 외래 키가 이런 규칙을 따르지 않는 경우, `belongsTo` 메서드의 두 번째 인수로 커스텀 외래 키를 지정할 수 있습니다.

```
/**
 * 댓글이 소속된 포스트를 가져옵니다.
 */
public function post(): BelongsTo
{
    return $this->belongsTo(Post::class, 'foreign_key');
}
```

상위(부모) 모델의 기본 키가 `id`가 아니거나, 연관된 모델 탐색에 다른 컬럼을 사용하고 싶을 때는 `belongsTo` 메서드의 세 번째 인수로 상위 테이블의 원하는 키를 지정할 수 있습니다.

```
/**
 * 댓글이 소속된 포스트를 가져옵니다.
 */
public function post(): BelongsTo
{
    return $this->belongsTo(Post::class, 'foreign_key', 'owner_key');
}
```

<a name="default-models"></a>
#### 기본(Default) 모델

`belongsTo`, `hasOne`, `hasOneThrough`, 그리고 `morphOne` 연관관계에서는, 만약 연관관계가 `null`이면 지정한 기본 모델을 반환하도록 할 수 있습니다. 이런 패턴을 [Null Object 패턴](https://en.wikipedia.org/wiki/Null_Object_pattern)이라고 하며, 코드에서 조건문을 줄여줄 수 있습니다. 아래 예시에서는, 만약 `Post` 모델에 연결된 사용자가 없다면 `user` 연관관계는 비어 있는 `App\Models\User` 모델을 반환하게 됩니다.

```
/**
 * 게시글의 작성자를 가져옵니다.
 */
public function user(): BelongsTo
{
    return $this->belongsTo(User::class)->withDefault();
}
```

기본 모델에 속성 값을 채워넣고 싶다면, 배열이나 클로저를 `withDefault` 메서드에 전달하면 됩니다.

```
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
#### Belongs To 연관관계 쿼리하기

"belongs to" 관계의 하위 모델을 쿼리할 때, 수동으로 `where`절을 이용해 원하는 Eloquent 모델들을 조회할 수 있습니다.

```
use App\Models\Post;

$posts = Post::where('user_id', $user->id)->get();
```

하지만, 더 편하게 `whereBelongsTo` 메서드를 사용할 수 있습니다. 이 메서드는 주어진 모델에 대한 적절한 연관관계와 외래 키를 자동으로 찾아줍니다.

```
$posts = Post::whereBelongsTo($user)->get();
```

또한 `whereBelongsTo` 메서드에 [컬렉션](/docs/10.x/eloquent-collections) 인스턴스를 넘길 수도 있습니다. 이렇게 하면 컬렉션 안에 포함된 여러 상위 모델에 속한 자식 모델들도 한 번에 조회할 수 있습니다.

```
$users = User::where('vip', true)->get();

$posts = Post::whereBelongsTo($users)->get();
```

기본적으로, Laravel은 주어진 모델의 클래스 이름을 기준으로 연관관계를 판단합니다. 하지만, 두 번째 인수로 연관관계 이름을 직접 지정할 수도 있습니다.

```
$posts = Post::whereBelongsTo($user, 'author')->get();
```

<a name="has-one-of-many"></a>
### 여러 개 중 하나(Has One of Many)

어떤 모델이 여러 개의 관련 모델을 가지고 있을 때, 그 중 최신 또는 가장 오래된(첫 번째) 모델 하나만 쉽게 가져오고 싶은 경우가 있습니다. 예를 들어, `User` 모델이 다수의 `Order` 모델과 연관될 수 있지만, 그중 사용자가 가장 최근에 주문한 주문 하나만 간편하게 가져오고 싶은 경우가 있겠죠. 이런 상황에는 `hasOne` 관계와 `ofMany` 계열 메서드를 함께 사용할 수 있습니다.

```php
/**
 * 사용자의 가장 최근 주문을 가져옵니다.
 */
public function latestOrder(): HasOne
{
    return $this->hasOne(Order::class)->latestOfMany();
}
```

이와 마찬가지로, "가장 오래된" 즉 첫 번째 연관 모델을 가져오는 메서드도 추가할 수 있습니다.

```php
/**
 * 사용자의 가장 오래된 주문을 가져옵니다.
 */
public function oldestOrder(): HasOne
{
    return $this->hasOne(Order::class)->oldestOfMany();
}
```

`latestOfMany`와 `oldestOfMany` 메서드는 기본적으로 모델의 기본 키(primary key)를 기준으로 최신 또는 가장 오래된 모델을 찾아옵니다. 하지만, 더 복잡한 정렬 기준으로 하나만 가져오고 싶을 때도 있습니다.

예를 들어, `ofMany` 메서드를 사용해 사용자의 가장 비싼 주문(가격 기준)을 가져올 수 있습니다. `ofMany` 메서드는 첫 번째 인수로 정렬 기준이 될 컬럼명을, 두 번째 인수로(`min` 또는 `max`) 사용할 집계 함수를 받습니다.

```php
/**
 * 사용자의 가장 큰 금액의 주문을 가져옵니다.
 */
public function largestOrder(): HasOne
{
    return $this->hasOne(Order::class)->ofMany('price', 'max');
}
```

> [!WARNING]
> PostgreSQL은 UUID 컬럼에 대해 `MAX` 함수를 지원하지 않기 때문에, PostgreSQL UUID 컬럼과 "여러 개 중 하나(One-of-many)" 연관관계를 함께 사용할 수 없습니다.

<a name="converting-many-relationships-to-has-one-relationships"></a>
#### "다수" 연관관계를 Has One 연관관계로 변환하기

실제로는 이미 같은 모델에 대한 "has many" 연관관계를 정의해 두었는데, `latestOfMany`, `oldestOfMany`, `ofMany` 메서드를 이용해 단일 모델만 가져오고 싶은 경우가 많습니다. 이런 경우, 기존의 "has many" 연관관계를 `one` 메서드를 추가로 호출하여 쉽게 "has one" 연관관계로 변환할 수 있습니다.

```php
/**
 * 사용자의 주문 목록을 가져옵니다.
 */
public function orders(): HasMany
{
    return $this->hasMany(Order::class);
}

/**
 * 사용자의 가장 큰 금액의 주문을 가져옵니다.
 */
public function largestOrder(): HasOne
{
    return $this->orders()->one()->ofMany('price', 'max');
}
```

<a name="advanced-has-one-of-many-relationships"></a>
#### 고급 Has One of Many 연관관계

좀 더 복잡한 "여러 개 중 하나" 연관관계도 정의할 수 있습니다. 예를 들면, `Product` 모델이 여러 `Price` 모델(과거 가격 정보까지 모두 저장됨)과 연관되어 있고, 새로운 가격 정보가 미래 시점에 미리 발행(publish)될 수도 있습니다(`published_at` 컬럼 사용).

정리하자면, 우리는 "발행일이 미래가 아닌 현재까지 중 가장 최신으로 발행된 가격"을 가져오고 싶습니다. 추가로, 발행일이 같은 가격이 여러 개라면, 그 중에서 `id` 값이 가장 큰(최신 등록된) 가격을 우선합니다. 이를 위해서, `ofMany` 메서드에 정렬 기준이 될 컬럼들을 배열로 넘기고, 두 번째 인수로 클로저를 전달하면 관계 쿼리에 추가적인 조건까지 적용할 수 있습니다.

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
### 중간 테이블을 통한 일대일(Has One Through)

"has-one-through" 연관관계는 다른 모델과의 일대일 관계를 정의합니다. 단, 이 관계는 중간 모델을 _거쳐서(through)_ 최종 모델과 이어질 수 있다는 점이 특징입니다.

예를 들어 차량 정비소 애플리케이션에서, 각 `Mechanic`(정비공)은 하나의 `Car`(자동차)와 연결될 수 있으며, 각 `Car`는 하나의 `Owner`(차주)와 연결될 수 있습니다. 정비공과 차주 사이에는 직접적인 관계가 없지만, 정비공은 `Car` 모델을 _거쳐서_ 그 주인(차주)에 접근할 수 있습니다. 이런 관계를 위한 테이블 구조는 다음과 같습니다.

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

테이블 구조를 확인했으니, 이제 `Mechanic` 모델에 연관관계를 정의해보겠습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;

class Mechanic extends Model
{
    /**
     * 자동차 소유주를 가져옵니다.
     */
    public function carOwner(): HasOneThrough
    {
        return $this->hasOneThrough(Owner::class, Car::class);
    }
}
```

`hasOneThrough` 메서드의 첫 번째 인수는 최종적으로 접근하고 싶은 모델, 두 번째 인수는 중간에 거치는 모델입니다.

또, 연관된 모든 모델에 이미 해당 연관관계가 각각 정의되어 있는 경우라면, `through` 메서드와 연관관계 이름을 사용해서 좀 더 유연하게 "has-one-through" 연관관계를 정의할 수도 있습니다. 예를 들어, 만약 `Mechanic` 모델에 `cars` 관계가 있고, `Car` 모델에 `owner` 관계가 있다면, 다음과 같이 정의할 수 있습니다.

```php
// 문자열 기반 방식...
return $this->through('cars')->has('owner');

// 동적 메서드 방식...
return $this->throughCars()->hasOwner();
```

<a name="has-one-through-key-conventions"></a>
#### 키 네이밍 규칙

관계 쿼리를 수행할 때는 Eloquent의 일반 외래 키 네이밍 규칙이 적용됩니다. 만약 관계 키를 직접 커스터마이즈하고 싶다면, `hasOneThrough` 메서드의 세 번째, 네 번째 인수에 각 foreign key를 지정하면 됩니다. 세 번째 인수는 중간 모델의 외래 키, 네 번째 인수는 최종 모델의 외래 키입니다. 다섯 번째 인수는 Mechanics 테이블의 로컬 키, 여섯 번째 인수는 중간 테이블(여기선 cars)의 로컬 키입니다.

```
class Mechanic extends Model
{
    /**
     * 자동차 소유주를 가져옵니다.
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

앞서 설명한 것처럼, 모든 참여 모델에 연관관계가 이미 정의되어 있다면, `through` 메서드를 활용해서 키 규칙을 재활용할 수 있습니다.

```php
// 문자열 기반 방식...
return $this->through('cars')->has('owner');

// 동적 메서드 방식...
return $this->throughCars()->hasOwner();
```

<a name="has-many-through"></a>
### 중간 테이블을 통한 일대다(Has Many Through)

"has-many-through" 연관관계는 중간 연관관계를 통해 멀리 떨어진 연관관계를 편리하게 접근할 수 있게 해줍니다. 예를 들어, [Laravel Vapor](https://vapor.laravel.com)와 같은 배포 플랫폼을 만든다고 가정해봅시다. 이때 `Project` 모델은 중간의 `Environment` 모델을 통해 여러 개의 `Deployment` 모델(배포 이력)에 접근할 수 있습니다. 이를 활용하면, 하나의 프로젝트에 속한 모든 배포 이력을 쉽게 조회할 수 있습니다. 테이블 구조는 다음과 같이 정의할 수 있습니다.

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

이제 테이블 구조를 확인했으니, `Project` 모델에 연관관계를 정의해보겠습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Project extends Model
{
    /**
     * 프로젝트의 모든 배포 이력을 가져옵니다.
     */
    public function deployments(): HasManyThrough
    {
        return $this->hasManyThrough(Deployment::class, Environment::class);
    }
}
```

`hasManyThrough` 메서드의 첫 번째 인수는 최종적으로 접근하고 싶은 모델, 두 번째 인수는 중간 모델입니다.

앞서 설명한 것처럼, 모든 참여 모델에 각각 관련 연관관계가 이미 정의되어 있다면, `through` 메서드와 연관관계 이름을 사용해 더 유연하게 "has-many-through" 연관관계를 정의할 수도 있습니다. 예를 들어, `Project` 모델에 `environments`, `Environment` 모델에 `deployments` 관계가 있다면 다음과 같이 쓸 수 있습니다.

```php
// 문자열 기반 방식...
return $this->through('environments')->has('deployments');

// 동적 메서드 방식...
return $this->throughEnvironments()->hasDeployments();
```

`Deployment` 모델의 테이블에 `project_id` 컬럼이 직접 존재하지 않더라도, `hasManyThrough` 관계를 통해 `$project->deployments`로 프로젝트의 배포 이력을 가져올 수 있습니다. 이때 Eloquent는 중간 모델인 `environments` 테이블의 `project_id` 컬럼을 먼저 조회해서 관련된 환경(environment)들의 id를 찾고, 그 id들을 이용해 `deployments` 테이블에서 원하는 정보를 조회합니다.

<a name="has-many-through-key-conventions"></a>

#### 주요 규칙

관계 쿼리를 수행할 때는 일반적인 Eloquent 외래 키 규칙이 사용됩니다. 만약 관계의 키를 커스터마이징하고 싶다면, `hasManyThrough` 메서드의 세 번째와 네 번째 인수로 키를 전달할 수 있습니다. 세 번째 인수는 중간 모델의 외래 키 이름을, 네 번째 인수는 최종 모델의 외래 키 이름을 의미합니다. 다섯 번째 인수는 로컬 키, 여섯 번째 인수는 중간 모델의 로컬 키입니다:

```
class Project extends Model
{
    public function deployments(): HasManyThrough
    {
        return $this->hasManyThrough(
            Deployment::class,
            Environment::class,
            'project_id', // environments 테이블의 외래 키...
            'environment_id', // deployments 테이블의 외래 키...
            'id', // projects 테이블의 로컬 키...
            'id' // environments 테이블의 로컬 키...
        );
    }
}
```

또는, 앞서 설명한 것처럼 관계에 참여하는 모든 모델에 대해 이미 해당 관계가 정의되어 있다면, `through` 메서드에 관계 이름을 전달하여 더욱 간결하게 "has-many-through" 관계를 정의할 수 있습니다. 이 방식은 기존 관계에서 이미 정의한 키 규칙을 재사용할 수 있다는 장점이 있습니다:

```php
// 문자열 기반 문법...
return $this->through('environments')->has('deployments');

// 동적 문법...
return $this->throughEnvironments()->hasDeployments();
```

<a name="many-to-many"></a>
## 다대다(Many to Many) 관계

다대다 관계는 `hasOne`이나 `hasMany` 관계보다 조금 더 복잡합니다. 일반적인 다대다 관계의 예시로는 한 사용자가 여러 역할을 가질 수 있고, 이 역할들이 애플리케이션 내의 다른 사용자들과도 공유되는 경우가 있습니다. 예를 들어, 한 사용자가 "Author"와 "Editor" 역할을 부여받을 수 있고, 이러한 역할은 다른 사용자에게도 할당될 수 있습니다. 즉, 한 사용자는 여러 역할을, 한 역할은 여러 사용자를 가질 수 있습니다.

<a name="many-to-many-table-structure"></a>
#### 테이블 구조

이 관계를 정의하려면 세 개의 데이터베이스 테이블이 필요합니다: `users`, `roles`, 그리고 `role_user`. `role_user` 테이블은 관련 모델 이름의 알파벳 순서에 따라 파생되며, `user_id`와 `role_id` 컬럼을 포함합니다. 이 테이블은 users와 roles를 연결해 주는 중간(연결) 테이블입니다.

역할이 여러 사용자에게 속할 수 있기 때문에, `roles` 테이블에 단순히 `user_id` 컬럼을 추가하면 안 됩니다. 그렇게 하면 하나의 역할은 단 하나의 사용자만 가질 수밖에 없습니다. 여러 사용자가 하나의 역할을 부여받을 수 있도록 하려면 반드시 `role_user` 테이블이 필요합니다. 관계의 테이블 구조는 다음과 같이 요약할 수 있습니다.

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

다대다 관계는 `belongsToMany` 메서드의 결과를 반환하는 메서드를 작성하여 정의합니다. `belongsToMany` 메서드는 모든 애플리케이션의 Eloquent 모델이 사용하는 `Illuminate\Database\Eloquent\Model` 기본 클래스에서 제공합니다. 예를 들어, `User` 모델에 `roles` 메서드를 정의해보겠습니다. 이 메서드의 첫 번째 인수에는 관련 모델 클래스명을 전달합니다:

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Model
{
    /**
     * 사용자와 관련된 모든 역할을 반환합니다.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }
}
```

관계를 정의하고 나면, 동적 관계 프로퍼티인 `roles`를 사용해 사용자의 역할에 접근할 수 있습니다:

```
use App\Models\User;

$user = User::find(1);

foreach ($user->roles as $role) {
    // ...
}
```

모든 관계는 쿼리 빌더 역할도 하기 때문에, `roles` 메서드를 호출한 뒤에 체이닝을 통해 추가적인 조건을 걸 수 있습니다:

```
$roles = User::find(1)->roles()->orderBy('name')->get();
```

관계의 중간 테이블 이름은 두 관련 모델 이름을 알파벳 순서로 조합하여 결정됩니다. 하지만, 이 규칙을 직접 지정할 수도 있습니다. `belongsToMany` 메서드의 두 번째 인수에 테이블 이름을 전달하면 됩니다:

```
return $this->belongsToMany(Role::class, 'role_user');
```

테이블 이름 외에도, 키 컬럼의 이름 역시 추가 인수로 직접 지정할 수 있습니다. 세 번째 인수는 현재 모델(관계를 정의하는 쪽)의 외래 키 이름, 네 번째 인수는 연결되는(상대) 모델의 외래 키 이름입니다:

```
return $this->belongsToMany(Role::class, 'role_user', 'user_id', 'role_id');
```

<a name="many-to-many-defining-the-inverse-of-the-relationship"></a>
#### 관계의 '반대편' 정의

다대다 관계의 "반대편"을 정의하려면, 관련 모델에도 역시 `belongsToMany` 메서드의 결과를 반환하는 메서드를 작성해주면 됩니다. 사용자/역할 예시를 완성하기 위해, 이번엔 `Role` 모델에 `users` 메서드를 정의합니다:

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    /**
     * 역할에 속한 모든 사용자를 반환합니다.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }
}
```

보시다시피, 관계의 정의 방법은 `User` 모델에서와 거의 동일하며, 다른 점은 참조하는 모델 클래스가 `App\Models\User`라는 점뿐입니다. `belongsToMany` 메서드를 그대로 재사용하기 때문에, 테이블명이나 키 커스터마이징 등 모든 옵션이 이 "반대편" 정의에도 그대로 적용됩니다.

<a name="retrieving-intermediate-table-columns"></a>
### 중간 테이블 컬럼 조회하기

앞서 설명했듯, 다대다 관계를 활용할 때는 중간 테이블이 필요합니다. Eloquent는 이 테이블을 다루기 위한 몇 가지 유용한 방법을 제공합니다. 예를 들어, `User` 모델이 여러 `Role` 모델과 관계를 가질 때, 이 관계에 접근하면 각 모델에서 `pivot` 속성을 통해 중간 테이블의 내용을 접근할 수 있습니다:

```
use App\Models\User;

$user = User::find(1);

foreach ($user->roles as $role) {
    echo $role->pivot->created_at;
}
```

각각의 `Role` 모델은 자동으로 `pivot` 속성을 가지게 됩니다. 이 속성은 중간 테이블을 나타내는 모델을 포함하고 있습니다.

기본적으로 `pivot` 모델에는 관계를 위한 키 컬럼만 포함됩니다. 만약 중간 테이블에 추가 속성이 있다면, 관계를 정의할 때 해당 컬럼들을 명시해 주어야 합니다:

```
return $this->belongsToMany(Role::class)->withPivot('active', 'created_by');
```

중간 테이블에 `created_at`과 `updated_at` 타임스탬프 컬럼이 있고, Eloquent가 이를 자동으로 관리하도록 하려면 관계 정의 시 `withTimestamps` 메서드를 호출하면 됩니다:

```
return $this->belongsToMany(Role::class)->withTimestamps();
```

> [!NOTE]
> Eloquent의 자동 타임스탬프를 사용하는 중간 테이블에는 반드시 `created_at`과 `updated_at` 컬럼이 모두 존재해야 합니다.

<a name="customizing-the-pivot-attribute-name"></a>
#### `pivot` 속성 이름 커스터마이징

앞서 설명했듯, 중간 테이블의 속성들은 모델에서 `pivot` 속성을 통해 접근할 수 있습니다. 하지만, 이 속성 이름은 용도에 따라 더 알맞게 커스터마이징할 수 있습니다.

예를 들어, 사용자와 팟캐스트 간에 구독(구매) 관계가 있는 경우, 중간 테이블 속성의 이름을 `pivot` 대신 `subscription`으로 변경하고 싶을 수 있습니다. 이때는 관계를 정의할 때 `as` 메서드를 사용하면 됩니다:

```
return $this->belongsToMany(Podcast::class)
                ->as('subscription')
                ->withTimestamps();
```

이렇게 중간 테이블 속성명을 변경해주면, 이제 지정한 이름으로 중간 테이블 데이터를 사용할 수 있습니다:

```
$users = User::with('podcasts')->get();

foreach ($users->flatMap->podcasts as $podcast) {
    echo $podcast->subscription->created_at;
}
```

<a name="filtering-queries-via-intermediate-table-columns"></a>
### 중간 테이블 컬럼을 통한 쿼리 필터링

`belongsToMany` 관계 쿼리를 수행할 때, `wherePivot`, `wherePivotIn`, `wherePivotNotIn`, `wherePivotBetween`, `wherePivotNotBetween`, `wherePivotNull`, `wherePivotNotNull` 등의 메서드를 이용하여 중간 테이블의 컬럼들로 결과를 필터링할 수 있습니다:

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

<a name="ordering-queries-via-intermediate-table-columns"></a>
### 중간 테이블 컬럼으로 쿼리 결과 정렬하기

`belongsToMany` 관계 쿼리에서 `orderByPivot` 메서드를 사용하면 결과를 중간 테이블의 컬럼 기준으로 정렬할 수 있습니다. 아래 예시에서는 사용자의 최신 배지를 가져옵니다:

```
return $this->belongsToMany(Badge::class)
                ->where('rank', 'gold')
                ->orderByPivot('created_at', 'desc');
```

<a name="defining-custom-intermediate-table-models"></a>
### 커스텀 중간 테이블(피벗) 모델 정의

다대다 관계의 중간 테이블에 해당하는 커스텀 모델을 정의하고 싶다면, 관계 정의 시 `using` 메서드를 호출하면 됩니다. 커스텀 피벗(pivot) 모델은 추가적인 메서드나 casts 등 다양한 동작을 직접 추가할 수 있는 장점이 있습니다.

커스텀 다대다 pivot 모델은 `Illuminate\Database\Eloquent\Relations\Pivot` 클래스를 상속받아야 하며, 폴리모픽 다대다의 경우에는 `Illuminate\Database\Eloquent\Relations\MorphPivot` 클래스를 상속받아야 합니다. 예를 들어, `Role` 모델이 커스텀 `RoleUser` pivot 모델을 사용하는 경우를 보겠습니다:

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    /**
     * 역할에 속한 모든 사용자를 반환합니다.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)->using(RoleUser::class);
    }
}
```

`RoleUser` 모델은 `Illuminate\Database\Eloquent\Relations\Pivot` 클래스를 상속하여 정의해야 합니다:

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class RoleUser extends Pivot
{
    // ...
}
```

> [!NOTE]
> Pivot 모델에는 `SoftDeletes` 트레이트를 사용할 수 없습니다. 피벗 레코드에서 soft delete가 필요하다면, 해당 피벗 모델을 실제 Eloquent 모델로 전환하는 방법을 고려해야 합니다.

<a name="custom-pivot-models-and-incrementing-ids"></a>
#### 커스텀 피벗 모델과 자동 증가 ID

커스텀 피벗 모델을 사용하는 다대다 관계에서 이 피벗 모델이 자동 증가(primary key) ID를 가진다면, 반드시 해당 클래스에 `incrementing` 프로퍼티를 `true`로 설정해 주어야 합니다.

```
/**
 * ID가 자동 증가하는지 여부.
 *
 * @var bool
 */
public $incrementing = true;
```

<a name="polymorphic-relationships"></a>
## 폴리모픽(Polymorphic) 관계

폴리모픽 관계는 자식 모델이 단일 연관을 통해 둘 이상의 다른 모델에 속할 수 있도록 해줍니다. 예를 들어, 사용자가 블로그 게시글과 동영상을 공유할 수 있는 애플리케이션을 만든다고 가정해봅니다. 이때 `Comment` 모델은 `Post`와 `Video`, 두 모델 모두에 속할 수 있습니다.

<a name="one-to-one-polymorphic-relations"></a>
### 일대일(One to One, 폴리모픽) 관계

<a name="one-to-one-polymorphic-table-structure"></a>
#### 테이블 구조

일대일 폴리모픽 관계는 일반적인 일대일 관계와 유사하지만, 자식 모델이 여러 종류의 부모 모델과 단일 연관을 맺을 수 있다는 점이 다릅니다. 예를 들어, 블로그의 `Post`와 `User` 모델이 모두 `Image` 모델과 폴리모픽 관계를 가질 수 있습니다. 일대일 폴리모픽 관계를 사용하면 여러 게시글과 사용자에 연결된 고유한 이미지들을 하나의 images 테이블로 관리할 수 있습니다. 우선 테이블 구조를 살펴보겠습니다:

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

`images` 테이블의 `imageable_id`와 `imageable_type` 컬럼에 주목하세요. `imageable_id`에는 게시글(post) 또는 사용자(user)의 ID 값이, `imageable_type`에는 부모 모델의 클래스명이 저장됩니다. `imageable_type` 컬럼은 Eloquent가 `imageable` 관계에 접근할 때 어떤 부모 모델 타입(Post인지 User인지)을 반환해야 하는지 판단하는 용도로 사용됩니다. 이 컬럼에는 `App\Models\Post` 또는 `App\Models\User`와 같은 값이 저장됩니다.

<a name="one-to-one-polymorphic-model-structure"></a>
#### 모델 구조

다음으로, 이 관계를 구성하기 위해 필요한 모델 정의를 살펴보겠습니다:

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Image extends Model
{
    /**
     * 상위 imageable 모델(사용자 또는 게시글)을 반환합니다.
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
     * 게시글에 해당하는 이미지를 반환합니다.
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
     * 사용자에 해당하는 이미지를 반환합니다.
     */
    public function image(): MorphOne
    {
        return $this->morphOne(Image::class, 'imageable');
    }
}
```

<a name="one-to-one-polymorphic-retrieving-the-relationship"></a>
#### 관계 조회하기

데이터베이스 테이블과 모델을 정의했다면, 이제 모델을 통해서 관계에 접근할 수 있습니다. 예를 들어, 게시글에 연결된 이미지를 가져오려면 다음과 같이 `image` 동적 프로퍼티를 사용하면 됩니다:

```
use App\Models\Post;

$post = Post::find(1);

$image = $post->image;
```

폴리모픽 모델의 부모에 접근하려면, `morphTo`를 호출하는 메서드 이름을 동적 프로퍼티로 사용하면 됩니다. 이 경우 `Image` 모델의 `imageable` 메서드이므로, 다음과 같이 접근합니다:

```
use App\Models\Image;

$image = Image::find(1);

$imageable = $image->imageable;
```

`Image` 모델의 `imageable` 관계는 실제로 이미지를 소유한 부모가 무엇이냐에 따라 `Post`나 `User` 인스턴스를 반환합니다.

<a name="morph-one-to-one-key-conventions"></a>
#### 키 규칙

필요하다면, 폴리모픽 자식 모델에 사용되는 "id" 및 "type" 컬럼의 이름을 커스터마이징할 수도 있습니다. 이때는 항상 관계 이름을 `morphTo` 메서드의 첫 번째 인수로 전달해주어야 합니다. 일반적으로 이 값은 메서드 이름과 일치해야 하므로, PHP의 `__FUNCTION__` 상수를 사용할 수 있습니다:

```
/**
 * 이미지가 속한 모델을 반환합니다.
 */
public function imageable(): MorphTo
{
    return $this->morphTo(__FUNCTION__, 'imageable_type', 'imageable_id');
}
```

<a name="one-to-many-polymorphic-relations"></a>
### 일대다(One to Many, 폴리모픽) 관계

<a name="one-to-many-polymorphic-table-structure"></a>
#### 테이블 구조

일대다 폴리모픽 관계는 일반적인 일대다 관계와 유사하지만, 자식 모델이 단일 연관을 통해 여러 종류의 부모 모델에 속할 수 있습니다. 예를 들어, 애플리케이션의 사용자들이 게시글(post)과 동영상(video)에 "댓글"을 남길 수 있다고 가정합시다. 이때 폴리모픽 관계를 사용하면 하나의 `comments` 테이블에서 게시글과 동영상 모두의 댓글을 함께 관리할 수 있습니다. 이 관계에 필요한 테이블 구조는 다음과 같습니다:

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

다음으로, 이 관계를 구현하기 위해 필요한 모델 정의를 살펴보겠습니다:

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Comment extends Model
{
    /**
     * 상위 commentable 모델(게시글 또는 동영상)을 반환합니다.
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
     * 게시글의 모든 댓글을 반환합니다.
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
     * 동영상의 모든 댓글을 반환합니다.
     */
    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }
}
```

<a name="one-to-many-polymorphic-retrieving-the-relationship"></a>
#### 관계 조회하기

데이터베이스 테이블과 모델 정의가 완료됐다면, 이제 모델의 동적 관계 프로퍼티를 사용해서 관계에 접근할 수 있습니다. 예를 들어, 게시글의 모든 댓글에 접근하려면 `comments` 동적 프로퍼티를 사용하면 됩니다:

```
use App\Models\Post;

$post = Post::find(1);

foreach ($post->comments as $comment) {
    // ...
}
```

또한, 폴리모픽 자식 모델의 부모를 조회하려면, `morphTo`를 호출하는 메서드 이름을 동적 프로퍼티로 접근하면 됩니다. 이 예시에서는 `Comment` 모델의 `commentable` 메서드가 해당합니다. 이를 이용해 댓글의 상위(부모) 모델에 접근할 수 있습니다:

```
use App\Models\Comment;

$comment = Comment::find(1);

$commentable = $comment->commentable;
```

`Comment` 모델의 `commentable` 관계는 댓글의 부모가 무엇이냐에 따라 `Post` 또는 `Video` 인스턴스를 반환합니다.

<a name="one-of-many-polymorphic-relations"></a>
### 일대다 중 ‘가장 최신/가장 오래된’(One of Many, 폴리모픽) 관계

때때로 하나의 모델이 여러 관련 모델을 가질 수 있지만, 그중 "가장 최신" 또는 "가장 오래된" 관련 모델을 간편하게 조회하고 싶은 경우가 있습니다. 예를 들어, `User` 모델이 여러 `Image` 모델과 관계를 가질 수 있지만, 사용자가 업로드한 이미지 중 가장 최근 이미지를 빠르게 가져오고 싶다면, `morphOne` 관계와 `ofMany` 계열 메서드를 조합해 사용할 수 있습니다:

```php
/**
 * 사용자의 가장 최근 이미지를 반환합니다.
 */
public function latestImage(): MorphOne
{
    return $this->morphOne(Image::class, 'imageable')->latestOfMany();
}
```

반대로, "가장 오래된", 즉 첫 번째 관련 모델을 조회하는 메서드도 정의할 수 있습니다:

```php
/**
 * 사용자의 가장 오래된 이미지를 반환합니다.
 */
public function oldestImage(): MorphOne
{
    return $this->morphOne(Image::class, 'imageable')->oldestOfMany();
}
```

기본적으로 `latestOfMany`와 `oldestOfMany` 메서드는 해당 모델의 기본 키(정렬 가능한 값)를 기준으로 가장 최신/오래된 관련 모델을 가져옵니다. 하지만, 더 복잡한 정렬 기준이 필요할 때는 `ofMany` 메서드를 사용할 수 있습니다.

예를 들어, 사용자의 가장 "좋아요(likes)"가 많은 이미지를 가져오려면, `ofMany` 메서드에 정렬할 컬럼명과 사용할 집계 함수(`min` 또는 `max`)를 인수로 전달하면 됩니다:

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
> 더 복잡한 "one of many" 관계도 구성할 수 있습니다. 자세한 내용은 [has one of many 문서](#advanced-has-one-of-many-relationships)를 참고하세요.

<a name="many-to-many-polymorphic-relations"></a>

### 다대다(폴리모픽)

<a name="many-to-many-polymorphic-table-structure"></a>
#### 테이블 구조

다대다 폴리모픽(다형성) 관계는 "morph one"이나 "morph many" 관계에 비해 약간 더 복잡합니다. 예를 들어, `Post` 모델과 `Video` 모델이 하나의 `Tag` 모델과 폴리모픽 관계를 공유한다고 생각해 보겠습니다. 이런 상황에서 다대다 폴리모픽 관계를 사용하면, 게시글(post)이나 동영상(video) 모두에 연결될 수 있는 고유 태그(tags) 테이블 하나만으로 모든 관계를 관리할 수 있습니다. 먼저, 이 관계를 구축하는 데 필요한 테이블 구조를 살펴보겠습니다.

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
> 폴리모픽 다대다 관계를 본격적으로 살펴보기 전에, 일반적인 [다대다 관계](#many-to-many) 문서를 먼저 읽어보는 것이 도움이 될 수 있습니다.

<a name="many-to-many-polymorphic-model-structure"></a>
#### 모델 구조

다음으로, 각 모델에서 관계를 정의해보겠습니다. `Post`와 `Video` 모델에는 모두 `tags`라는 메서드가 들어가며, 이 메서드는 기본 Eloquent 모델 클래스가 제공하는 `morphToMany` 메서드를 호출합니다.

`morphToMany` 메서드는 연결할 관련 모델의 이름과 "관계 이름"을 인수로 받습니다. 우리가 중간 테이블의 이름과 포함된 키에 붙인 이름에 따라, 이 관계를 "taggable"이라고 지칭하게 됩니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class Post extends Model
{
    /**
     * 게시글의 모든 태그를 가져옵니다.
     */
    public function tags(): MorphToMany
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }
}
```

<a name="many-to-many-polymorphic-defining-the-inverse-of-the-relationship"></a>
#### 관계의 역방향 정의

이제 `Tag` 모델에서 각각의 부모 모델에 대한 메서드를 정의해야 합니다. 즉, 이 예시에서는 `posts` 메서드와 `videos` 메서드를 정의합니다. 이 두 메서드는 모두 `morphedByMany` 메서드의 결과를 반환해야 합니다.

`morphedByMany` 메서드는 관련 모델의 이름과 "관계 이름"을 인수로 받습니다. 중간 테이블의 이름과 키에 따라 이 관계도 "taggable"로 불리게 됩니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class Tag extends Model
{
    /**
     * 이 태그가 할당된 모든 게시글을 가져옵니다.
     */
    public function posts(): MorphToMany
    {
        return $this->morphedByMany(Post::class, 'taggable');
    }

    /**
     * 이 태그가 할당된 모든 동영상을 가져옵니다.
     */
    public function videos(): MorphToMany
    {
        return $this->morphedByMany(Video::class, 'taggable');
    }
}
```

<a name="many-to-many-polymorphic-retrieving-the-relationship"></a>
#### 관계 조회하기

데이터베이스의 테이블 구조와 모델 구성이 끝났다면, 각 모델에서 관계를 쉽게 접근할 수 있습니다. 예를 들어, 게시글에 연결된 모든 태그를 얻으려면 `tags` 동적 관계 프로퍼티를 사용할 수 있습니다.

```
use App\Models\Post;

$post = Post::find(1);

foreach ($post->tags as $tag) {
    // ...
}
```

폴리모픽 자식 모델에서 관계의 부모를 조회하려면, `morphedByMany`를 호출하는 메서드 이름(여기선 `posts` 또는 `videos`)에 접근하면 됩니다:

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
### 커스텀 폴리모픽 타입 지정

라라벨은 기본적으로 관련 모델의 완전 수식 클래스명(full qualified class name)을 "type" 컬럼 값으로 사용합니다. 예를 들어, 위에 설명한 일대다(폴리모픽) 예시에서 `Comment` 모델이 `Post` 또는 `Video` 모델에 속할 수 있다면, 기본적으로 `commentable_type` 컬럼 값은 각각 `App\Models\Post` 또는 `App\Models\Video`가 됩니다. 그러나 이러한 값을 애플리케이션 내부 구조와 분리하고 싶을 수도 있습니다.

예를 들어, 모델 이름 대신 간단한 문자열(`post`, `video`)을 "type"으로 사용할 수 있습니다. 이렇게 하면 나중에 모델명을 변경해도 데이터베이스의 폴리모픽 "type" 컬럼 값은 여전히 유효합니다.

```
use Illuminate\Database\Eloquent\Relations\Relation;

Relation::enforceMorphMap([
    'post' => 'App\Models\Post',
    'video' => 'App\Models\Video',
]);
```

이 코드는 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 실행하거나, 별도의 서비스 프로바이더를 만들어 호출할 수도 있습니다.

실행 중에 모델의 morph 별칭(별명)을 알고 싶다면, 해당 모델의 `getMorphClass` 메서드를 사용할 수 있습니다. 반대로 morph 별칭이 가리키는 완전 수식 클래스명을 얻고 싶다면 `Relation::getMorphedModel` 메서드를 사용하면 됩니다.

```
use Illuminate\Database\Eloquent\Relations\Relation;

$alias = $post->getMorphClass();

$class = Relation::getMorphedModel($alias);
```

> [!WARNING]
> 기존 애플리케이션에 "morph map"을 추가하려면, 데이터베이스의 모든 폴리모픽 `*_type` 컬럼 값(아직 완전 수식 클래스명이 저장되어 있는 값)들을 각 "map" 이름 값으로 변환해주어야 합니다.

<a name="dynamic-relationships"></a>
### 동적(런타임) 관계 정의

`resolveRelationUsing` 메서드를 사용하면 Eloquent 모델들 사이의 관계를 실행 중에 동적으로 정의할 수 있습니다. 일반적인 애플리케이션 개발에서는 자주 사용하지 않지만, 라라벨 패키지를 개발할 때 가끔 유용하게 사용할 수 있습니다.

`resolveRelationUsing` 메서드의 첫 번째 인수는 원하는 관계 이름이며, 두 번째 인수로는 모델 인스턴스를 받아서 유효한 Eloquent 관계 정의를 반환하는 클로저를 넘깁니다. 보통 이런 동적 관계 정의는 [서비스 프로바이더](/docs/10.x/providers)의 boot 메서드 내부에서 설정합니다.

```
use App\Models\Order;
use App\Models\Customer;

Order::resolveRelationUsing('customer', function (Order $orderModel) {
    return $orderModel->belongsTo(Customer::class, 'customer_id');
});
```

> [!WARNING]
> 동적 관계를 정의할 때는 항상 Eloquent 관계 메서드에 명시적으로 키 이름 인수를 전달해야 합니다.

<a name="querying-relations"></a>
## 관계 쿼리하기

Eloquent의 모든 관계는 메서드로 정의되어 있으므로, 관계 메서드를 직접 호출해서 실제로 관련 모델을 데이터베이스로부터 조회하지 않고도 관계의 인스턴스를 얻을 수 있습니다. 그리고, 모든 종류의 Eloquent 관계는 [쿼리 빌더](/docs/10.x/queries) 역할도 하므로, 관계 쿼리에서 추가 조건을 계속 체이닝해서 최종적으로 데이터베이스에 실제 SQL 쿼리를 실행할 수 있습니다.

예를 들어, `User` 모델이 여러 개의 `Post` 모델과 연결된 블로그 애플리케이션을 생각해 보겠습니다.

```
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
        return $this->hasMany(Post::class);
    }
}
```

`posts` 관계에서 쿼리의 추가 제약 조건을 손쉽게 추가할 수 있습니다.

```
use App\Models\User;

$user = User::find(1);

$user->posts()->where('active', 1)->get();
```

라라벨의 [쿼리 빌더](/docs/10.x/queries) 메서드는 모두 사용 가능하니, 쿼리 빌더 문서를 참고하여 다양한 메서드를 활용할 수 있습니다.

<a name="chaining-orwhere-clauses-after-relationships"></a>
#### 관계 쿼리에서 `orWhere` 체이닝 주의

위 예시처럼, 관계 쿼리에서 추가 제약 조건을 자유롭게 체이닝할 수 있지만, `orWhere` 절을 관계 쿼리에 추가할 때는 주의가 필요합니다. `orWhere` 절은 관계의 제약조건과 같은 논리 레벨로 그룹화되기 때문입니다.

```
$user->posts()
        ->where('active', 1)
        ->orWhere('votes', '>=', 100)
        ->get();
```

위의 예시 코드는 아래와 같은 SQL을 생성하게 됩니다. 보시다시피, `or` 절로 인해 100개 이상의 표(vote)가 있는 **모든** 게시글도 결과에 포함되어, 쿼리가 더 이상 특정 유저에만 국한되지 않게 됩니다.

```sql
select *
from posts
where user_id = ? and active = 1 or votes >= 100
```

일반적으로는 [논리 그룹핑](/docs/10.x/queries#logical-grouping) 기능을 사용해 괄호로 조건을 묶어 주는 것이 좋습니다.

```
use Illuminate\Database\Eloquent\Builder;

$user->posts()
        ->where(function (Builder $query) {
            return $query->where('active', 1)
                         ->orWhere('votes', '>=', 100);
        })
        ->get();
```

위와 같이 하면, 아래의 SQL이 생성되고, 논리 그룹핑으로 인해 결과가 여전히 특정 유저의 게시글로 제한됩니다.

```sql
select *
from posts
where user_id = ? and (active = 1 or votes >= 100)
```

<a name="relationship-methods-vs-dynamic-properties"></a>
### 관계 메서드 vs. 동적 프로퍼티

Eloquent 관계 쿼리에 추가 조건이 필요 없다면, 관계를 단순히 프로퍼티처럼 접근할 수 있습니다. 예를 들어, 앞서 사용한 `User`와 `Post` 모델에서 한 사용자의 모든 게시글을 다음과 같이 가져올 수 있습니다.

```
use App\Models\User;

$user = User::find(1);

foreach ($user->posts as $post) {
    // ...
}
```

동적 관계 프로퍼티는 "지연 로딩(lazy loading)" 방식으로 동작합니다. 즉, 실제로 프로퍼티에 접근할 때 관련된 관계 데이터가 로드됩니다. 덕분에 개발자는 모델을 로드한 이후 접근이 예상되는 관계들을 [즉시 로딩(eager loading)](#eager-loading)으로 미리 불러두곤 합니다. 즉시 로딩을 사용하면 관계 데이터를 불러올 때 SQL 쿼리 수를 대폭 줄일 수 있습니다.

<a name="querying-relationship-existence"></a>
### 관계 존재 여부로 조회하기

모델 레코드를 조회할 때, 특정 관계가 존재하는지에 따라 결과를 제한하고 싶을 때가 있습니다. 예를 들어, 적어도 하나 이상의 댓글이 달린 모든 블로그 게시글을 가져오고 싶다고 합시다. 이럴 때는 관계 이름을 `has` 또는 `orHas` 메서드에 넘기면 됩니다.

```
use App\Models\Post;

// 최소 댓글이 하나라도 달린 모든 게시글 조회...
$posts = Post::has('comments')->get();
```

연산자와 개수를 직접 지정해 쿼리를 더 세밀하게 조정할 수도 있습니다.

```
// 댓글이 세 개 이상 달린 모든 게시글 조회...
$posts = Post::has('comments', '>=', 3)->get();
```

중첩된 `has` 구문도 "dot" 표기법을 사용해 만들 수 있습니다. 예를 들어, 댓글에 이미지가 하나 이상 존재하는 모든 게시글을 조회할 수도 있습니다.

```
// 댓글에 이미지가 달려 있는 게시글만 조회...
$posts = Post::has('comments.images')->get();
```

좀 더 복잡한 조건이 필요하다면, `whereHas`나 `orWhereHas` 메서드로 관계 쿼리 내의 내용을 참고해서 추가 제약 조건을 줄 수 있습니다. 예를 들어, 댓글의 내용에 특정 단어가 포함된 게시글만 조회할 수 있습니다.

```
use Illuminate\Database\Eloquent\Builder;

// 댓글 내용이 'code%'로 시작하는 게시글만 조회...
$posts = Post::whereHas('comments', function (Builder $query) {
    $query->where('content', 'like', 'code%');
})->get();

// 댓글 내용이 'code%'로 시작하는 댓글이 10개 이상인 게시글 조회...
$posts = Post::whereHas('comments', function (Builder $query) {
    $query->where('content', 'like', 'code%');
}, '>=', 10)->get();
```

> [!WARNING]
> Eloquent는 현재 다른 데이터베이스에 걸친 관계 존재 쿼리를 지원하지 않습니다. 모든 관계는 같은 데이터베이스 내에 존재해야 합니다.

<a name="inline-relationship-existence-queries"></a>
#### 인라인 관계 존재 쿼리

관계 쿼리에 단순한 조건 하나를 같이 걸고 싶을 때는 `whereRelation`, `orWhereRelation`, `whereMorphRelation`, `orWhereMorphRelation` 메서드를 사용하는 것이 더 편리할 수 있습니다. 예를 들어, 승인되지 않은(unapproved) 댓글이 달린 모든 게시글을 조회하려면 다음과 같이 하면 됩니다.

```
use App\Models\Post;

$posts = Post::whereRelation('comments', 'is_approved', false)->get();
```

물론 쿼리 빌더의 `where` 메서드처럼 연산자도 직접 지정할 수 있습니다.

```
$posts = Post::whereRelation(
    'comments', 'created_at', '>=', now()->subHour()
)->get();
```

<a name="querying-relationship-absence"></a>
### 관계가 없는 경우로 쿼리하기

특정 관계가 **존재하지 않는** 모델만 조회하고 싶을 때도 있습니다. 예를 들어 댓글이 **아무것도 없는** 게시글 전체를 조회하려면, 관계 이름을 `doesntHave` 또는 `orDoesntHave` 메서드에 넘기면 됩니다.

```
use App\Models\Post;

$posts = Post::doesntHave('comments')->get();
```

더 복잡한 조건이 필요하다면, `whereDoesntHave`나 `orWhereDoesntHave` 메서드로 관계 쿼리에도 제약 조건을 건 쿼리를 만들 수 있습니다.

```
use Illuminate\Database\Eloquent\Builder;

$posts = Post::whereDoesntHave('comments', function (Builder $query) {
    $query->where('content', 'like', 'code%');
})->get();
```

"dot" 표기법을 써서 중첩된 관계 쿼리를 실행할 수도 있습니다. 예를 들어, 아래 쿼리는 댓글이 없는 게시글을 조회하는데, 만약 댓글이 있더라도 저자(author)가 차단되지 않은(banned = 0) 댓글은 결과에 포함됩니다.

```
use Illuminate\Database\Eloquent\Builder;

$posts = Post::whereDoesntHave('comments.author', function (Builder $query) {
    $query->where('banned', 0);
})->get();
```

<a name="querying-morph-to-relationships"></a>
### Morph To 관계 쿼리

"morph to"(다형성) 관계의 존재 여부를 쿼리하려면 `whereHasMorph`와 `whereDoesntHaveMorph` 메서드를 사용할 수 있습니다. 첫 번째 인수는 관계 이름이고, 두 번째 인수로는 조건에 포함할 관련 모델의 이름을 넘깁니다. 마지막으로, 관계 쿼리를 커스터마이징할 수 있는 클로저를 전달할 수 있습니다.

```
use App\Models\Comment;
use App\Models\Post;
use App\Models\Video;
use Illuminate\Database\Eloquent\Builder;

// 제목이 'code%'로 시작하는 게시글 또는 동영상에 연결된 댓글 모두 조회...
$comments = Comment::whereHasMorph(
    'commentable',
    [Post::class, Video::class],
    function (Builder $query) {
        $query->where('title', 'like', 'code%');
    }
)->get();

// 제목이 'code%'로 시작하지 않는 게시글에 연결된 댓글 모두 조회...
$comments = Comment::whereDoesntHaveMorph(
    'commentable',
    Post::class,
    function (Builder $query) {
        $query->where('title', 'like', 'code%');
    }
)->get();
```

가끔은 연결된 폴리모픽 모델의 "type(타입)"에 따라 쿼리 조건을 다르게 추가해야 할 수도 있습니다. 이럴 때는 `whereHasMorph`에 넘기는 클로저의 두 번째 인수로 `$type` 값을 받아서 쿼리의 타입을 판별할 수 있습니다.

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

<a name="querying-all-morph-to-related-models"></a>
#### 모든 관련 모델 쿼리하기

특정 폴리모픽 모델 배열을 직접 넘겨주는 대신, `*`를 와일드카드(wildcard) 값으로 사용할 수도 있습니다. 이렇게 하면 라라벨이 데이터베이스에서 가능한 모든 폴리모픽 타입을 찾아서 추가 쿼리를 실행해 줍니다.

```
use Illuminate\Database\Eloquent\Builder;

$comments = Comment::whereHasMorph('commentable', '*', function (Builder $query) {
    $query->where('title', 'like', 'foo%');
})->get();
```

<a name="aggregating-related-models"></a>
## 관련 모델 집계

<a name="counting-related-models"></a>
### 관련 모델 수 세기

경우에 따라, 실제 모델 데이터를 모두 불러오지 않고 특정 관계에 연결된 모델의 수만 파악하고 싶을 때가 있습니다. 이럴 때는 `withCount` 메서드를 사용하면 됩니다. `withCount` 메서드는 결과 모델에 `{relation}_count` 속성을 추가합니다.

```
use App\Models\Post;

$posts = Post::withCount('comments')->get();

foreach ($posts as $post) {
    echo $post->comments_count;
}
```

배열 형태로 넘겨주면 여러 관계에 대해 동시에 카운트할 수 있고, 관계별로 추가 쿼리 조건도 정의할 수 있습니다.

```
use Illuminate\Database\Eloquent\Builder;

$posts = Post::withCount(['votes', 'comments' => function (Builder $query) {
    $query->where('content', 'like', 'code%');
}])->get();

echo $posts[0]->votes_count;
echo $posts[0]->comments_count;
```

관계 카운트에 별칭(alias)을 사용하면, 같은 관계에 대해 여러 개의 카운트를 동시에 구하는 것도 가능합니다.

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

`loadCount` 메서드를 사용하면 이미 조회된 부모 모델에 대해서도 관계 카운트를 따로 불러올 수 있습니다.

```
$book = Book::first();

$book->loadCount('genres');
```

카운트 쿼리에 추가 제약 조건이 필요하다면, 카운트할 관계명을 키로 하고, 쿼리 빌더를 받는 클로저를 값으로 하는 배열을 넘기면 됩니다.

```
$book->loadCount(['reviews' => function (Builder $query) {
    $query->where('rating', 5);
}])
```

<a name="relationship-counting-and-custom-select-statements"></a>
#### 관계 카운트와 커스텀 Select 구문

`withCount`를 직접 `select` 구문과 조합해서 사용할 때는, 반드시 `select` 다음에 `withCount`를 호출해야 합니다.

```
$posts = Post::select(['title', 'body'])
                ->withCount('comments')
                ->get();
```

<a name="other-aggregate-functions"></a>
### 기타 집계 함수

`withCount` 외에도 라라벨은 `withMin`, `withMax`, `withAvg`, `withSum`, `withExists` 메서드도 제공합니다. 이들 메서드는 결과 모델에 `{relation}_{function}_{column}` 형태의 속성을 추가합니다.

```
use App\Models\Post;

$posts = Post::withSum('comments', 'votes')->get();

foreach ($posts as $post) {
    echo $post->comments_sum_votes;
}
```

집계 함수의 결과를 다른 이름으로 접근하고 싶다면 별칭을 지정할 수 있습니다.

```
$posts = Post::withSum('comments as total_comments', 'votes')->get();

foreach ($posts as $post) {
    echo $post->total_comments;
}
```

`loadCount`와 마찬가지로, 이미 조회된 모델에도 집계 집합 연산을 적용할 수 있는 지연 실행용 메서드도 있습니다.

```
$post = Post::first();

$post->loadSum('comments', 'votes');
```

집계 메서드를 커스텀 `select` 구문과 같이 쓸 때는, 반드시 `select` 다음에 집계 메서드를 호출해야 합니다.

```
$posts = Post::select(['title', 'body'])
                ->withExists('comments')
                ->get();
```

<a name="counting-related-models-on-morph-to-relationships"></a>
### Morph To 관계에서 관련 모델 수 세기

"morph to" 관계에 대해 즉시 로딩(eager loading)과 동시에, 관계로 연결된 다양한 엔티티 각각에 대해 관련 모델의 개수까지 불러오고 싶을 때는, `with` 메서드와 `morphTo` 관계의 `morphWithCount` 메서드를 함께 사용할 수 있습니다.

예를 들어, `Photo`와 `Post` 모델이 모두 `ActivityFeed` 모델을 생성한다고 가정해 보겠습니다. 이때 `ActivityFeed` 모델은 `parentable`이라는 "morph to" 관계를 정의하고 있고, 이를 통해 각 피드가 상위 `Photo` 또는 `Post` 모델을 가져올 수 있습니다. 또, `Photo` 모델은 여러 개의 `Tag` 모델을, `Post` 모델은 여러 개의 `Comment` 모델을 가지고 있다고 합시다.

이제 각 `ActivityFeed` 인스턴스를 불러올 때, 각각의 `parentable` 부모 모델도 즉시 로딩하고, 부모 포토에는 각 태그의 개수를, 부모 게시글에는 각 댓글의 개수까지 불러오고 싶다면 아래와 같이 할 수 있습니다.

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

#### 지연된 카운트 로딩(Deferred Count Loading)

이미 여러 개의 `ActivityFeed` 모델을 조회한 상황에서, 이 활동 피드에 연관된 다양한 `parentable` 모델의 중첩된 관계에 대한 개수 정보를 불러오고 싶을 때가 있습니다. 이럴 때는 `loadMorphCount` 메서드를 사용할 수 있습니다.

```
$activities = ActivityFeed::with('parentable')->get();

$activities->loadMorphCount('parentable', [
    Photo::class => ['tags'],
    Post::class => ['comments'],
]);
```

<a name="eager-loading"></a>
## 즉시 로딩(Eager Loading)

Eloquent 관계를 속성으로 접근하면, 연관된 모델이 "지연 로딩(lazy loaded)"됩니다. 즉, 해당 속성에 처음 접근할 때까지는 관계 데이터가 실제로 로드되지 않습니다. 하지만, Eloquent는 부모 모델을 쿼리할 때 관계를 "즉시 로딩(eager load)"할 수도 있습니다. 즉시 로딩을 하면 소위 "N + 1" 쿼리 문제를 해결할 수 있습니다.

N + 1 쿼리 문제를 설명하기 위해, `Book` 모델이 `Author` 모델에 "belongs to"로 연결되어 있다고 가정해봅시다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Book extends Model
{
    /**
     * 책을 작성한 저자를 반환합니다.
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(Author::class);
    }
}
```

이제 모든 책과 그 저자를 조회해보겠습니다.

```
use App\Models\Book;

$books = Book::all();

foreach ($books as $book) {
    echo $book->author->name;
}
```

위 코드의 반복문은 먼저 데이터베이스에서 모든 책을 조회하는 쿼리 1회가 실행되고, 각 책마다 저자를 조회하기 위한 쿼리가 각각 한번씩 더 실행됩니다. 즉, 책이 25권 있다면 총 26번의 쿼리가 발생합니다. (책 전체를 조회하는 쿼리 1회 + 각 책마다 저자 조회 쿼리 25회)

다행히 Eloquent에서는 즉시 로딩을 사용하여 쿼리 수를 단 2번으로 줄일 수 있습니다. 쿼리를 만들 때 `with` 메서드를 사용하여 어떤 관계를 즉시 로딩할지 지정할 수 있습니다.

```
$books = Book::with('author')->get();

foreach ($books as $book) {
    echo $book->author->name;
}
```

이렇게 하면 오직 두 번의 쿼리만 실행됩니다. 한 번은 모든 책을, 또 한 번은 모든 책의 저자를 가져오는 쿼리입니다.

```sql
select * from books

select * from authors where id in (1, 2, 3, 4, 5, ...)
```

<a name="eager-loading-multiple-relationships"></a>
#### 여러 관계 즉시 로딩

여러 관계를 동시에 즉시 로딩해야 할 수도 있습니다. 이때는 `with` 메서드에 관계 이름을 담은 배열을 전달하면 됩니다.

```
$books = Book::with(['author', 'publisher'])->get();
```

<a name="nested-eager-loading"></a>
#### 중첩 즉시 로딩

관계의 하위 관계까지 즉시 로딩하고 싶을 때는 "점(dot) 표기법"을 사용할 수 있습니다. 예를 들어, 각 책의 저자와 그 저자의 연락처를 모두 즉시 로딩하려면 다음과 같이 작성합니다.

```
$books = Book::with('author.contacts')->get();
```

또는, 여러 중첩 관계를 즉시 로딩해야 한다면, `with` 메서드에 중첩 배열을 전달하면 좀 더 명확하게 표현할 수 있습니다.

```
$books = Book::with([
    'author' => [
        'contacts',
        'publisher',
    ],
])->get();
```

<a name="nested-eager-loading-morphto-relationships"></a>
#### `morphTo` 관계의 중첩 즉시 로딩

`morphTo` 관계와, 해당 관계가 반환할 수 있는 각 엔티티의 중첩 관계까지 즉시 로딩하고 싶다면, `with`와 `morphWith` 메서드를 조합해 사용할 수 있습니다. 다음 예시를 참고하세요.

```
<?php

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ActivityFeed extends Model
{
    /**
     * 활동 피드 레코드의 상위 모델을 반환합니다.
     */
    public function parentable(): MorphTo
    {
        return $this->morphTo();
    }
}
```

여기서, `Event`, `Photo`, `Post` 모델이 각각 `ActivityFeed`를 생성할 수 있다고 가정합시다. 각각의 모델은 아래와 같은 관계를 추가로 가집니다.

- `Event` 모델은 `Calendar` 모델에 소속
- `Photo` 모델은 `Tag` 모델과 연관
- `Post` 모델은 `Author` 모델에 속함

이 관계를 활용해서, `ActivityFeed` 인스턴스를 조회할 때 모든 `parentable` 모델과 각 모델의 중첩 관계까지 한 번에 즉시 로딩할 수 있습니다.

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
#### 특정 컬럼만 즉시 로딩하기

관계에서 모든 컬럼이 필요하지 않을 수 있습니다. 이럴 때는 Eloquent에서 가져올 관계 컬럼을 지정할 수 있습니다.

```
$books = Book::with('author:id,name,book_id')->get();
```

> [!NOTE]
> 이 기능을 사용할 때는 항상 `id` 컬럼과 관련 외래키 컬럼이 선택 목록에 포함되어야 합니다.

<a name="eager-loading-by-default"></a>
#### 기본적으로 즉시 로딩하기

모델을 조회할 때 항상 특정 관계를 함께 로딩하고 싶을 때가 있습니다. 이를 위해 모델 클래스에 `$with` 속성을 정의할 수 있습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Book extends Model
{
    /**
     * 항상 즉시 로딩해야 할 관계
     *
     * @var array
     */
    protected $with = ['author'];

    /**
     * 책을 작성한 저자를 반환합니다.
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(Author::class);
    }

    /**
     * 책의 장르를 반환합니다.
     */
    public function genre(): BelongsTo
    {
        return $this->belongsTo(Genre::class);
    }
}
```

특정 쿼리에서만 `$with` 속성에 지정된 관계를 제외하고 싶다면, `without` 메서드를 사용할 수 있습니다.

```
$books = Book::without('author')->get();
```

특정 쿼리에서만 `$with`에 있는 모든 관계를 덮어쓰고 싶다면, `withOnly` 메서드로 대체할 수 있습니다.

```
$books = Book::withOnly('genre')->get();
```

<a name="constraining-eager-loads"></a>
### 즉시 로딩 시 조건 추가

관계를 즉시 로딩하면서 해당 쿼리에 조건을 추가하고 싶을 때가 있습니다. 이때는 `with` 메서드에 관계 이름을 키로, 클로저를 값으로 하는 배열을 전달하면 됩니다.

```
use App\Models\User;
use Illuminate\Contracts\Database\Eloquent\Builder;

$users = User::with(['posts' => function (Builder $query) {
    $query->where('title', 'like', '%code%');
}])->get();
```

이 예시에선, 게시글(`posts`)의 `title` 컬럼에 'code'라는 단어가 포함된 포스트만 즉시 로딩합니다. 더 다양한 [쿼리 빌더](/docs/10.x/queries) 메서드도 사용할 수 있습니다.

```
$users = User::with(['posts' => function (Builder $query) {
    $query->orderBy('created_at', 'desc');
}])->get();
```

> [!NOTE]
> `limit` 및 `take` 쿼리 빌더 메서드는 즉시 로딩 시 조건 추가에 사용할 수 없습니다.

<a name="constraining-eager-loading-of-morph-to-relationships"></a>
#### `morphTo` 관계에 조건 추가

`morphTo` 관계를 즉시 로딩할 때, Eloquent는 연관된 각각의 모델 유형마다 별도 쿼리를 실행합니다. 이때 `MorphTo` 관계의 `constrain` 메서드를 사용해 각 쿼리에 조건을 추가할 수 있습니다.

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

이 예시에서는 `hidden_at` 값이 null인 포스트와, `type` 값이 "educational"인 비디오만 즉시 로딩됩니다.

<a name="constraining-eager-loads-with-relationship-existence"></a>
#### 관계 존재 조건과 함께 즉시 로딩하기

때로는 관계가 존재하는지 확인하면서, 동시에 해당 조건으로 관계를 즉시 로딩하고 싶을 수 있습니다. 예를 들어, 특정 조건을 만족하는 `Post` 모델이 자식인 `User` 모델만 조회하고, 매칭되는 게시글만 즉시 로딩하려는 경우입니다. 이 때는 `withWhereHas` 메서드를 사용할 수 있습니다.

```
use App\Models\User;

$users = User::withWhereHas('posts', function ($query) {
    $query->where('featured', true);
})->get();
```

<a name="lazy-eager-loading"></a>
### 느린 즉시 로딩(Lazy Eager Loading)

부모 모델을 이미 조회한 뒤, 나중에 관계를 즉시 로딩해야 할 때가 있습니다. 예를 들어, 동적으로 관계를 로딩할지 여부를 결정해야 하는 경우가 해당합니다.

```
use App\Models\Book;

$books = Book::all();

if ($someCondition) {
    $books->load('author', 'publisher');
}
```

즉시 로딩 시 쿼리에 추가 조건이 필요하다면, 배열의 키로 관계명을, 값으로 쿼리 인스턴스를 받는 클로저를 전달하면 됩니다.

```
$author->load(['books' => function (Builder $query) {
    $query->orderBy('published_date', 'asc');
}]);
```

관계가 아직 로딩되지 않은 경우에만 로딩하려면, `loadMissing` 메서드를 사용합니다.

```
$book->loadMissing('author');
```

<a name="nested-lazy-eager-loading-morphto"></a>
#### 중첩된 느린 즉시 로딩과 `morphTo`

`morphTo` 관계와, 해당 관계가 반환할 수 있는 엔티티의 중첩 관계까지 즉시 로딩하고 싶다면, `loadMorph` 메서드를 사용할 수 있습니다.

이 메서드는 첫 번째 인수로 `morphTo` 관계 이름, 두 번째 인수로는 모델/관계 쌍의 배열을 받습니다. 다음 예시를 참고하세요.

```
<?php

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ActivityFeed extends Model
{
    /**
     * 활동 피드 레코드의 상위 모델을 반환합니다.
     */
    public function parentable(): MorphTo
    {
        return $this->morphTo();
    }
}
```

여기서도 마찬가지로, `Event`, `Photo`, `Post` 모델 각각은 다음과 같은 관계를 가집니다.

- `Event` 모델은 `Calendar` 모델에 소속
- `Photo` 모델은 `Tag` 모델과 연관
- `Post` 모델은 `Author` 모델에 속함

이 관계 정보를 바탕으로, 이미 조회한 `ActivityFeed` 인스턴스들의 모든 `parentable` 중첩 관계까지 한 번에 즉시 로딩할 수 있습니다.

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
### 지연 로딩 항상 방지하기

앞서 설명한 것처럼, 관계를 즉시 로딩하는 것은 애플리케이션의 성능에 크게 도움이 될 수 있습니다. 따라서, 필요하다면 Eloquent가 관계를 지연 로딩하지 못하도록 강제할 수 있습니다. 이를 위해, Eloquent 모델의 기본 클래스가 제공하는 `preventLazyLoading` 메서드를 사용할 수 있습니다. 이 메서드는 보통 애플리케이션의 `AppServiceProvider`의 `boot` 메서드 내에서 호출합니다.

`preventLazyLoading` 메서드는 선택적으로 불리언 인수를 받아, 지연 로딩 금지 여부를 지정할 수 있습니다. 예를 들어, 개발환경(비프로덕션)에서만 지연 로딩을 금지하여, 코드상에서 실수로 지연 로딩이 발생해도 운영 환경에서는 정상 동작하도록 할 수 있습니다.

```php
use Illuminate\Database\Eloquent\Model;

/**
 * 모든 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Model::preventLazyLoading(! $this->app->isProduction());
}
```

지연 로딩을 방지하면, Eloquent가 관계를 지연 로딩하려고 시도할 때 `Illuminate\Database\LazyLoadingViolationException` 예외가 발생합니다.

지연 로딩 위반 발생 시 동작을 `handleLazyLoadingViolationsUsing` 메서드로 커스터마이즈할 수 있습니다. 예를 들어, 예외를 발생시키는 대신 위반 내역만 로그로 남길 수도 있습니다.

```php
Model::handleLazyLoadingViolationUsing(function (Model $model, string $relation) {
    $class = $model::class;

    info("Attempted to lazy load [{$relation}] on model [{$class}].");
});
```

<a name="inserting-and-updating-related-models"></a>
## 연관 모델의 삽입 및 수정

<a name="the-save-method"></a>
### `save` 메서드

Eloquent는 관계에 새로운 모델을 추가하기 위한 편리한 메서드를 제공합니다. 예를 들어, 게시글에 새로운 댓글을 추가하고 싶다면, `Comment` 모델의 `post_id` 속성을 직접 지정할 필요 없이 관계의 `save` 메서드를 사용할 수 있습니다.

```
use App\Models\Comment;
use App\Models\Post;

$comment = new Comment(['message' => 'A new comment.']);

$post = Post::find(1);

$post->comments()->save($comment);
```

여기서 관계에 동적 속성으로 접근하지 않고, `comments` 메서드를 직접 호출하여 관계 인스턴스를 받았다는 점에 유의하세요. `save` 메서드는 새로 생성된 `Comment` 모델에 적절한 `post_id` 값을 자동으로 채워줍니다.

여러 개의 연관 모델을 한꺼번에 저장해야 한다면, `saveMany` 메서드를 사용할 수 있습니다.

```
$post = Post::find(1);

$post->comments()->saveMany([
    new Comment(['message' => 'A new comment.']),
    new Comment(['message' => 'Another new comment.']),
]);
```

`save`와 `saveMany`는 주어진 모델 인스턴스를 데이터베이스에 저장하지만, 이미 부모 모델에 로드된 관계 메모리에 새로 저장된 모델을 추가하지는 않습니다. 저장 이후 관계를 다시 접근하려면, `refresh` 메서드로 모델 및 관계를 재로드하는 것이 좋습니다.

```
$post->comments()->save($comment);

$post->refresh();

// 새로 저장한 댓글을 포함한 모든 댓글 조회
$post->comments;
```

<a name="the-push-method"></a>
#### 모델과 관계 재귀 저장

모델과 그 연관 관계까지 모두 재귀적으로 저장하려면, `push` 메서드를 사용할 수 있습니다. 아래 예시에서는, `Post` 모델, 연결된 댓글, 각각 댓글의 작성자까지 한 번에 저장합니다.

```
$post = Post::find(1);

$post->comments[0]->message = 'Message';
$post->comments[0]->author->name = 'Author Name';

$post->push();
```

이벤트 발생 없이 모델과 연관 관계를 저장하려면 `pushQuietly` 메서드를 사용할 수 있습니다.

```
$post->pushQuietly();
```

<a name="the-create-method"></a>
### `create` 메서드

`save`, `saveMany` 외에도, 배열 형태의 속성을 받아 모델을 생성 및 저장하는 `create` 메서드도 사용할 수 있습니다. `save`와 `create`의 차이는, `save`는 전체 Eloquent 모델 인스턴스를 받는 반면, `create`는 단순 PHP 배열을 인수로 받는다는 점입니다. `create`는 새로 생성된 모델 인스턴스를 반환합니다.

```
use App\Models\Post;

$post = Post::find(1);

$comment = $post->comments()->create([
    'message' => 'A new comment.',
]);
```

여러 개의 연관 모델을 한 번에 생성할 때는 `createMany` 메서드를 사용할 수 있습니다.

```
$post = Post::find(1);

$post->comments()->createMany([
    ['message' => 'A new comment.'],
    ['message' => 'Another new comment.'],
]);
```

이벤트를 발생시키지 않고 모델을 생성하려면, `createQuietly`, `createManyQuietly` 메서드를 사용할 수 있습니다.

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

또한, `findOrNew`, `firstOrNew`, `firstOrCreate`, `updateOrCreate` 등의 메서드를 사용하여 [관계에서 모델 생성 및 수정](/docs/10.x/eloquent#upserts)도 가능합니다.

> [!NOTE]
> `create` 메서드를 사용하기 전에 [대량 할당(mass assignment)](/docs/10.x/eloquent#mass-assignment) 문서를 꼭 읽어보시기 바랍니다.

<a name="updating-belongs-to-relationships"></a>
### Belongs To(하나에 속함) 관계

자식 모델을 새로운 부모 모델에 할당하고 싶을 때는 `associate` 메서드를 사용할 수 있습니다. 아래 예시에서 `User` 모델은 `Account` 모델에 `belongsTo`로 연결되어 있습니다. `associate` 메서드는 자식 모델의 외래키를 설정해줍니다.

```
use App\Models\Account;

$account = Account::find(10);

$user->account()->associate($account);

$user->save();
```

자식 모델에서 부모 모델 설정을 해제(관계 끊기)하고 싶다면, `dissociate` 메서드를 사용할 수 있습니다. 이 메서드를 사용하면, 관계의 외래키가 `null`로 변경됩니다.

```
$user->account()->dissociate();

$user->save();
```

<a name="updating-many-to-many-relationships"></a>
### 다대다(Many to Many) 관계

<a name="attaching-detaching"></a>
#### 연결(Attaching) / 해제(Detaching)

Eloquent에서는 다대다 관계를 다루기 위한 다양한 메서드를 제공합니다. 예를 들어, 유저는 여러 개의 역할(Role)을 가질 수 있고, 한 역할도 여러 유저에 연결될 수 있습니다. `attach` 메서드를 사용해 특정 역할을 중간 테이블에 추가(연결)할 수 있습니다.

```
use App\Models\User;

$user = User::find(1);

$user->roles()->attach($roleId);
```

관계를 연결할 때, 연결 테이블에 추가 데이터를 넣으려면 배열로 함께 전달할 수 있습니다.

```
$user->roles()->attach($roleId, ['expires' => $expires]);
```

역할(Role)을 유저에서 제거해야 할 때는 `detach` 메서드를 사용합니다. 이 메서드는 중간 테이블에서 해당 레코드만 삭제하고, 두 모델은 데이터베이스에서 그대로 유지됩니다.

```
// 특정 역할만 유저에서 해제
$user->roles()->detach($roleId);

// 해당 유저의 모든 역할 관계 해제
$user->roles()->detach();
```

`attach`와 `detach`는 아이디 배열도 인수로 받을 수 있어, 여러 개를 한 번에 처리할 수 있습니다.

```
$user = User::find(1);

$user->roles()->detach([1, 2, 3]);

$user->roles()->attach([
    1 => ['expires' => $expires],
    2 => ['expires' => $expires],
]);
```

<a name="syncing-associations"></a>
#### 연결 동기화(Syncing Associations)

`sync` 메서드를 사용해 다대다 관계를 "동기화"할 수 있습니다. 이 메서드는 중간 테이블에 남길 ID 배열을 받으며, 배열에 없는 ID들은 모두 테이블에서 제거됩니다. 동기화 후에는 배열에 담긴 ID만 중간 테이블에 남습니다.

```
$user->roles()->sync([1, 2, 3]);
```

ID 배열과 함께 추가 데이터도 전달할 수 있습니다.

```
$user->roles()->sync([1 => ['expires' => true], 2, 3]);
```

동기화 시 모든 ID에 동일한 값을 추가하고 싶다면, `syncWithPivotValues` 메서드를 사용할 수 있습니다.

```
$user->roles()->syncWithPivotValues([1, 2, 3], ['active' => true]);
```

동기화할 때 배열에 없는 기존 ID를 해제하지 않고 유지하려면, `syncWithoutDetaching` 메서드를 사용하세요.

```
$user->roles()->syncWithoutDetaching([1, 2, 3]);
```

<a name="toggling-associations"></a>

#### 연관관계 상태 토글하기

다대다(many-to-many) 연관관계에서는 `toggle` 메서드를 제공하여, 지정한 관련 모델 ID의 연결 상태를 "토글"(즉, 전환)할 수 있습니다. 만약 지정한 ID가 현재 연결되어 있다면 연결이 해제되고, 연결되어 있지 않다면 새로 연결됩니다.

```
$user->roles()->toggle([1, 2, 3]);
```

또한, ID와 함께 중간 테이블에 저장할 추가 데이터를 전달할 수도 있습니다.

```
$user->roles()->toggle([
    1 => ['expires' => true],
    2 => ['expires' => true],
]);
```

<a name="updating-a-record-on-the-intermediate-table"></a>
#### 중간 테이블의 레코드 업데이트하기

연관관계의 중간 테이블에 이미 존재하는 행을 수정해야 하는 경우, `updateExistingPivot` 메서드를 사용할 수 있습니다. 이 메서드는 수정하려는 중간 레코드의 외래 키와, 업데이트할 속성 배열을 인수로 받습니다.

```
$user = User::find(1);

$user->roles()->updateExistingPivot($roleId, [
    'active' => false,
]);
```

<a name="touching-parent-timestamps"></a>
## 부모 타임스탬프 동기화하기

모델이 다른 모델과 `belongsTo` 또는 `belongsToMany` 관계를 정의할 때(예: `Comment`가 `Post`에 소속된 경우), 자식 모델이 수정될 때 부모의 타임스탬프를 함께 갱신하고 싶은 경우가 종종 있습니다.

예를 들어, `Comment` 모델이 업데이트될 때, 관련된 `Post`의 `updated_at` 타임스탬프도 자동으로 현재 날짜와 시간으로 변경되길 바랄 수 있습니다. 이를 위해, 자식 모델에 `touches` 속성을 추가하고, 자식이 업데이트될 때 함께 `updated_at` 타임스탬프가 갱신되어야 하는 연관관계의 이름을 배열로 지정해 주면 됩니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comment extends Model
{
    /**
     * 동기화할(갱신할) 모든 연관관계 이름
     *
     * @var array
     */
    protected $touches = ['post'];

    /**
     * 댓글이 소속된 게시글의 연관관계 반환
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }
}
```

> [!WARNING]
> 부모 모델의 타임스탬프는 자식 모델이 Eloquent의 `save` 메서드로 업데이트될 때만 갱신됩니다.