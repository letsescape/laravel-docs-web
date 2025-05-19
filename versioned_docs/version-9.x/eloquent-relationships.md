# Eloquent: 관계 (Eloquent: Relationships)

- [소개](#introduction)
- [관계 정의하기](#defining-relationships)
    - [일대일(One To One)](#one-to-one)
    - [일대다(One To Many)](#one-to-many)
    - [일대다(역방향) / Belongs To](#one-to-many-inverse)
    - [Has One Of Many](#has-one-of-many)
    - [Has One Through](#has-one-through)
    - [Has Many Through](#has-many-through)
- [다대다(Many To Many) 관계](#many-to-many)
    - [중간 테이블 컬럼 조회](#retrieving-intermediate-table-columns)
    - [중간 테이블 컬럼을 통한 쿼리 필터링](#filtering-queries-via-intermediate-table-columns)
    - [중간 테이블 컬럼을 통한 쿼리 정렬](#ordering-queries-via-intermediate-table-columns)
    - [사용자 정의 중간 테이블 모델 정의하기](#defining-custom-intermediate-table-models)
- [폴리모픽 관계](#polymorphic-relationships)
    - [일대일](#one-to-one-polymorphic-relations)
    - [일대다](#one-to-many-polymorphic-relations)
    - [One Of Many](#one-of-many-polymorphic-relations)
    - [다대다](#many-to-many-polymorphic-relations)
    - [커스텀 폴리모픽 타입](#custom-polymorphic-types)
- [동적 관계](#dynamic-relationships)
- [관계 쿼리](#querying-relations)
    - [관계 메서드 vs. 동적 프로퍼티](#relationship-methods-vs-dynamic-properties)
    - [관계 존재 쿼리](#querying-relationship-existence)
    - [관계 부재 쿼리](#querying-relationship-absence)
    - [Morph To 관계 쿼리](#querying-morph-to-relationships)
- [관련 모델 집계](#aggregating-related-models)
    - [관련 모델 개수 세기](#counting-related-models)
    - [기타 집계 함수](#other-aggregate-functions)
    - [Morph To 관계에서 관련 모델 개수 세기](#counting-related-models-on-morph-to-relationships)
- [즉시 로딩(Eager Loading)](#eager-loading)
    - [즉시 로드 제약](#constraining-eager-loads)
    - [지연 즉시 로딩](#lazy-eager-loading)
    - [지연 로딩 방지](#preventing-lazy-loading)
- [관련 모델 삽입 및 업데이트](#inserting-and-updating-related-models)
    - [`save` 메서드](#the-save-method)
    - [`create` 메서드](#the-create-method)
    - [Belongs To 관계](#updating-belongs-to-relationships)
    - [다대다 관계](#updating-many-to-many-relationships)
- [부모 타임스탬프 동기화하기](#touching-parent-timestamps)

<a name="introduction"></a>
## 소개

데이터베이스 테이블은 서로 연관되어 있는 경우가 많습니다. 예를 들어, 블로그 게시글은 여러 개의 댓글을 가질 수 있고, 하나의 주문은 그 주문을 생성한 사용자와 연관될 수 있습니다. Eloquent를 사용하면 이러한 관계를 쉽고 효율적으로 관리할 수 있으며, 아래와 같은 다양한 일반적인 관계 유형을 지원합니다.

<div class="content-list" markdown="1">

- [일대일(One To One)](#one-to-one)
- [일대다(One To Many)](#one-to-many)
- [다대다(Many To Many)](#many-to-many)
- [Has One Through](#has-one-through)
- [Has Many Through](#has-many-through)
- [일대일(폴리모픽)](#one-to-one-polymorphic-relations)
- [일대다(폴리모픽)](#one-to-many-polymorphic-relations)
- [다대다(폴리모픽)](#many-to-many-polymorphic-relations)

</div>

<a name="defining-relationships"></a>
## 관계 정의하기

Eloquent의 관계는 여러분의 Eloquent 모델 클래스에서 메서드로 정의합니다. 관계는 동시에 강력한 [쿼리 빌더](/docs/9.x/queries)이기도 하므로, 메서드 형태로 관계를 정의하면 메서드 체이닝 및 쿼리 조작을 자유롭게 활용할 수 있습니다. 예를 들어, 아래와 같이 `posts` 관계에 추가적인 쿼리 조건을 쉽게 체이닝할 수 있습니다.

```
$user->posts()->where('active', 1)->get();
```

각 관계별 자세한 사용 방법을 살펴보기 전에, Eloquent에서 지원하는 다양한 관계 타입을 정의하는 방법부터 알아보겠습니다.

<a name="one-to-one"></a>
### 일대일(One To One)

일대일 관계는 가장 기본적인 데이터베이스 관계 중 하나입니다. 예를 들어, `User` 모델이 하나의 `Phone` 모델과 연관될 수 있습니다. 이런 관계를 정의하려면 `User` 모델에 `phone`이라는 메서드를 만들고, 이 메서드에서 `hasOne` 메서드를 호출한 결과를 반환하면 됩니다. `hasOne` 메서드는 모델의 `Illuminate\Database\Eloquent\Model` 기본 클래스에서 제공됩니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 유저와 연관된 휴대폰을 반환합니다.
     */
    public function phone()
    {
        return $this->hasOne(Phone::class);
    }
}
```

`hasOne` 메서드의 첫 번째 인수는 연관 모델 클래스명을 전달합니다. 이 관계가 정의되고 나면, Eloquent의 동적 프로퍼티 기능을 사용해 관련 레코드를 간편하게 불러올 수 있습니다. 동적 프로퍼티란, 관계 메서드를 마치 모델의 속성처럼 접근하는 기능을 의미합니다.

```
$phone = User::find(1)->phone;
```

Eloquent는 기본적으로 부모 모델명을 기준으로 관계의 외래 키(foreign key)를 결정합니다. 위 예제에서는 `Phone` 모델에 `user_id` 외래 키가 있다고 자동으로 간주합니다. 만약 이 규칙을 오버라이드하고 싶을 경우, `hasOne`의 두 번째 인수로 원하는 외래 키 컬럼을 지정할 수 있습니다.

```
return $this->hasOne(Phone::class, 'foreign_key');
```

또한, Eloquent는 기본적으로 부모 모델의 프라이머리 키(primary key) 컬럼 값을 외래 키와 매칭합니다. 즉, 위 예제에서는 `User` 모델의 `id` 컬럼의 값이 `Phone` 모델의 `user_id` 컬럼에 저장되어 있다고 간주합니다. 만약 `id`가 아닌 다른 컬럼을 프라이머리 키로 활용하거나, `$primaryKey` 속성을 별도로 지정하고 싶다면, `hasOne`의 세 번째 인수로 로컬(부모) 키 컬럼명을 넘기면 됩니다.

```
return $this->hasOne(Phone::class, 'foreign_key', 'local_key');
```

<a name="one-to-one-defining-the-inverse-of-the-relationship"></a>
#### 관계의 역방향 정의하기

이제 `User` 모델에서 `Phone` 모델에 접근하는 방법을 알아보았습니다. 이번에는 반대로, `Phone` 모델에서 자신이 속한 사용자(User)에 접근하는 관계를 정의해보겠습니다. `hasOne` 관계의 역방향(즉, 소유자를 찾는 쪽)은 `belongsTo` 메서드를 이용하여 정의합니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Phone extends Model
{
    /**
     * 이 휴대폰의 소유 유저를 반환합니다.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
```

이제 `user` 메서드를 호출하면, Eloquent는 `Phone` 모델의 `user_id` 컬럼 값과 일치하는 `User` 모델의 `id` 값을 가진 레코드를 찾아 반환합니다.

Eloquent는 관계 메서드명을 분석해서 해당 외래 키명을 결정합니다. 즉, 메서드명에 `_id`를 붙여서 외래 키명으로 간주합니다. 위 예제에서도 `user_id` 컬럼이 있을 것으로 예상합니다. 만약 외래 키명이 `user_id`가 아니라면, `belongsTo`의 두 번째 인수로 원하는 외래 키명을 지정할 수 있습니다.

```
/**
 * 이 휴대폰의 소유 유저를 반환합니다.
 */
public function user()
{
    return $this->belongsTo(User::class, 'foreign_key');
}
```

부모 모델이 `id` 외의 컬럼을 프라이머리 키로 사용하고 있거나, 관계의 대상 모델을 찾는 칼럼을 변경하고 싶은 경우, 세 번째 인수로 부모 테이블의 키 컬럼명을 지정할 수 있습니다.

```
/**
 * 이 휴대폰의 소유 유저를 반환합니다.
 */
public function user()
{
    return $this->belongsTo(User::class, 'foreign_key', 'owner_key');
}
```

<a name="one-to-many"></a>
### 일대다(One To Many)

일대다 관계는 한 모델이 여러 자식 모델을 소유하는 구조를 정의할 때 사용합니다. 예를 들어, 하나의 블로그 게시글(Post)은 여러 개의 댓글(Comment)을 가질 수 있습니다. 다른 Eloquent 관계처럼, 일대다 관계 역시 모델에서 메서드를 정의하는 방식으로 만들 수 있습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    /**
     * 게시글에 달린 댓글 목록을 반환합니다.
     */
    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
}
```

Eloquent는 자동으로 `Comment` 모델의 외래 키 컬럼명을 결정합니다. 관례적으로, 부모 모델명을 스네이크 케이스(snake_case)로 변환한 뒤 `_id`를 붙여서 외래 키명으로 사용합니다. 위 예제의 경우, 외래 키 컬럼은 `post_id`로 간주합니다.

관계 메서드를 정의한 후, 관련 댓글들을 [컬렉션](/docs/9.x/eloquent-collections) 형태로 `comments` 프로퍼티에 접근하여 조회할 수 있습니다. 앞에서 언급한 동적 관계 프로퍼티를 활용하면, 마치 속성처럼 사용할 수 있습니다.

```
use App\Models\Post;

$comments = Post::find(1)->comments;

foreach ($comments as $comment) {
    //
}
```

관계도 쿼리 빌더의 역할을 하므로, `comments` 메서드에 쿼리 조건을 추가하여 더 세밀하게 결과를 제어할 수도 있습니다.

```
$comment = Post::find(1)->comments()
                    ->where('title', 'foo')
                    ->first();
```

`hasOne`과 마찬가지로, `hasMany` 메서드에도 두 번째, 세 번째 인수로 외래 키와 로컬 키를 직접 지정해서 사용할 수 있습니다.

```
return $this->hasMany(Comment::class, 'foreign_key');

return $this->hasMany(Comment::class, 'foreign_key', 'local_key');
```

<a name="one-to-many-inverse"></a>
### 일대다(역방향) / Belongs To

게시글의 댓글들을 모두 조회할 수 있게 되었으니, 이제는 댓글에서 자신의 부모 게시글에 접근하는 관계도 정의해 보겠습니다. `hasMany` 관계의 역방향은 자식 모델에서 `belongsTo` 메서드를 호출해 사용하는 방식으로 정의합니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    /**
     * 이 댓글의 소유 게시글을 반환합니다.
     */
    public function post()
    {
        return $this->belongsTo(Post::class);
    }
}
```

관계가 정의되면, `post`라는 동적 관계 프로퍼티를 이용해 해당 댓글의 소유 게시글을 조회할 수 있습니다.

```
use App\Models\Comment;

$comment = Comment::find(1);

return $comment->post->title;
```

위 예제에서 Eloquent는 `Comment` 모델의 `post_id` 값과 일치하는 `Post` 모델의 `id` 값을 찾아 반환합니다.

Eloquent는 관계 메서드명을 기반으로 기본 외래 키명을 결정합니다. 메서드명 다음에 `_`와 부모 모델 프라이머리 키명을 붙인 형태가 됩니다. 위 예제라면 `comments` 테이블에 `post_id` 컬럼이 있다고 간주합니다.

만약 여러분의 관계에서 외래 키가 이런 관례를 따르지 않는다면, `belongsTo` 메서드의 두 번째 인수로 원하는 외래 키명을 지정할 수 있습니다.

```
/**
 * 이 댓글의 소유 게시글을 반환합니다.
 */
public function post()
{
    return $this->belongsTo(Post::class, 'foreign_key');
}
```

마찬가지로, 부모 모델이 `id` 이외의 컬럼을 프라이머리 키로 사용하거나, 다른 컬럼으로 연관시키고 싶은 경우, 세 번째 인수로 부모 테이블의 프라이머리 키명을 지정할 수 있습니다.

```
/**
 * 이 댓글의 소유 게시글을 반환합니다.
 */
public function post()
{
    return $this->belongsTo(Post::class, 'foreign_key', 'owner_key');
}
```

<a name="default-models"></a>
#### 기본 모델(Default Models)

`belongsTo`, `hasOne`, `hasOneThrough`, `morphOne` 관계에서는 관계가 `null`일 때 반환할 기본 모델(default model)을 정의할 수 있습니다. 이런 패턴은 종종 [Null Object 패턴](https://en.wikipedia.org/wiki/Null_Object_pattern)이라고도 하며, 코드에서 조건문을 줄여주어 더욱 간결하게 만들어줍니다. 아래 예제에서는 `Post` 모델에 연결된 사용자가 없을 경우, 빈 `App\Models\User` 모델이 반환됩니다.

```
/**
 * 게시글의 작성자를 반환합니다.
 */
public function user()
{
    return $this->belongsTo(User::class)->withDefault();
}
```

기본 모델에 속성값을 채워주고 싶다면, `withDefault` 메서드에 배열이나 클로저를 전달하면 됩니다.

```
/**
 * 게시글의 작성자를 반환합니다.
 */
public function user()
{
    return $this->belongsTo(User::class)->withDefault([
        'name' => 'Guest Author',
    ]);
}

/**
 * 게시글의 작성자를 반환합니다.
 */
public function user()
{
    return $this->belongsTo(User::class)->withDefault(function ($user, $post) {
        $user->name = 'Guest Author';
    });
}
```

<a name="querying-belongs-to-relationships"></a>
#### Belongs To 관계 쿼리하기

"belongs to" 관계의 자식 모델들을 쿼리할 때, `where` 절을 직접 작성해서 관련된 Eloquent 모델을 조회할 수 있습니다.

```
use App\Models\Post;

$posts = Post::where('user_id', $user->id)->get();
```

하지만, `whereBelongsTo` 메서드를 활용하면 적절한 관계 및 외래 키를 프레임워크에서 자동으로 결정하므로 더욱 편리합니다.

```
$posts = Post::whereBelongsTo($user)->get();
```

또한, `whereBelongsTo` 메서드에 [컬렉션](/docs/9.x/eloquent-collections) 인스턴스를 넘길 수도 있습니다. 이 경우 컬렉션 내의 부모 모델들 중 어느 것과 연관된 모델이든 모두 조회할 수 있습니다.

```
$users = User::where('vip', true)->get();

$posts = Post::whereBelongsTo($users)->get();
```

기본적으로 라라벨은 전달된 모델의 클래스명을 기준으로 관계명을 판단하지만, 두 번째 인수로 직접 관계명을 지정할 수도 있습니다.

```
$posts = Post::whereBelongsTo($user, 'author')->get();
```

<a name="has-one-of-many"></a>
### Has One Of Many

어떤 모델이 여러 연관 모델을 가질 수 있지만, 이 중 "가장 최근" 또는 "가장 오래된" 관계 모델 하나만을 쉽고 빠르게 조회하고 싶을 때가 있습니다. 예를 들어, `User` 모델은 여러 개의 `Order` 모델과 연관될 수 있지만, 그 중 사용자가 가장 최근에 주문한 한 건만 빠르게 조회하고 싶은 경우가 있습니다. 이런 상황에서는 `hasOne` 관계에 `ofMany` 관련 메서드를 조합해서 사용할 수 있습니다.

```php
/**
 * 사용자의 가장 최근 주문을 반환합니다.
 */
public function latestOrder()
{
    return $this->hasOne(Order::class)->latestOfMany();
}
```

마찬가지로, "가장 오래된" 혹은 첫 번째 연관 모델을 조회하는 메서드도 정의할 수 있습니다.

```php
/**
 * 사용자의 가장 오래된 주문을 반환합니다.
 */
public function oldestOrder()
{
    return $this->hasOne(Order::class)->oldestOfMany();
}
```

기본적으로 `latestOfMany` 및 `oldestOfMany` 메서드는 프라이머리 키를 기준으로 내림차순 또는 오름차순으로 정렬하여 가장 최신 또는 가장 오래된 연관 모델을 찾습니다(프라이머리 키가 정렬 가능한 데이터여야 합니다). 하지만, 더 복잡한 정렬 기준으로 원하는 단일 모델을 선택해야 할 경우가 있습니다.

예를 들어, `ofMany` 메서드를 사용하여 사용자가 주문한 금액이 가장 큰 주문을 조회할 수도 있습니다. `ofMany`의 첫 번째 인수는 정렬에 사용할 컬럼, 두 번째 인수는 사용할 집계 함수(`min` 또는 `max`)를 의미합니다.

```php
/**
 * 사용자의 가장 큰 금액의 주문을 반환합니다.
 */
public function largestOrder()
{
    return $this->hasOne(Order::class)->ofMany('price', 'max');
}
```

> [!WARNING]
> PostgreSQL에서는 UUID 칼럼에 대해 `MAX` 함수를 실행하는 것을 지원하지 않으므로, PostgreSQL UUID 칼럼과 one-of-many 관계를 조합하여 사용하는 것은 현재 불가능합니다.

<a name="advanced-has-one-of-many-relationships"></a>
#### 고급 Has One Of Many 관계

좀 더 복잡한 "has one of many" 관계도 정의할 수 있습니다. 예를 들어, `Product` 모델이 여러 개의 `Price` 모델과 연관되어 있고, 새로운 가격은 미리 등록해서 지정한 `published_at` 날짜가 되어야 효력이 발생하도록 되어 있다고 가정해봅시다. 즉, 미래의 효력이 발생할 가격도 미리 저장해둘 수 있습니다.

이 경우, `published_at` 컬럼이 미래가 아닌 가장 최근의 가격 정보만을 조회해야 하고, 만약 발행일이 같은 가격이 여러 개라면 id가 가장 높은(즉, 가장 마지막에 입력된) 가격을 선택하고 싶습니다. 이런 경우에는 `ofMany` 메서드에 여러 개의 정렬 기준 컬럼을 배열로 넘기고, 두 번째 인수로 클로저를 전달해 추가적인 쿼리 조건(예: 발행일이 미래가 아닌 것)을 적용할 수 있습니다.

```php
/**
 * 이 상품의 현재 가격을 반환합니다.
 */
public function currentPricing()
{
    return $this->hasOne(Price::class)->ofMany([
        'published_at' => 'max',
        'id' => 'max',
    ], function ($query) {
        $query->where('published_at', '<', now());
    });
}
```

<a name="has-one-through"></a>
### Has One Through

"has-one-through" 관계는 한 모델이, 중간에 다른 모델을 경유하여, 마지막 외부 모델과 일대일(one-to-one) 연결되는 구조입니다. 즉, 관계 선언을 한 모델이 중간 모델을 _통해_ 다른 한 모델과 연관됩니다.

예를 들어, 정비소(차량수리점) 애플리케이션에서 각각의 `Mechanic`(정비사) 모델은 하나의 `Car`(차) 모델과 연결되어 있고, 각각의 `Car` 모델은 하나의 `Owner`(차주) 모델과 연결되어 있다고 합시다. 이 경우 정비사와 차주는 데이터베이스상 직접 연결되어 있지 않지만, 정비사는 `Car` 모델을 _경유해서_ 차주에게 접근할 수 있습니다. 필요한 테이블 구조는 다음과 같습니다.

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

테이블 구조를 확인했다면, 이제 `Mechanic` 모델에 관계를 정의해보겠습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mechanic extends Model
{
    /**
     * 정비사가 정비하는 차량의 차주 정보를 반환합니다.
     */
    public function carOwner()
    {
        return $this->hasOneThrough(Owner::class, Car::class);
    }
}
```

`hasOneThrough`의 첫 번째 인수는 접근하고자 하는 최종(target) 모델명이며, 두 번째 인수는 중간 모델명입니다.

또는, 관계에 참여하는 모든 모델에 해당 관계가 이미 정의되어 있을 경우, `through` 메서드를 사용하여 관계명을 문자열로 지정해 좀 더 선언적으로 "has-one-through" 관계를 정의할 수 있습니다. 예를 들어, `Mechanic` 모델에 `cars` 관계가, `Car` 모델에 `owner` 관계가 정의되어 있으면 아래처럼 사용할 수 있습니다.

```php
// 문자열 방식...
return $this->through('cars')->has('owner');

// 동적 방식...
return $this->throughCars()->hasOwner();
```

<a name="has-one-through-key-conventions"></a>
#### 키 명명 규칙(Key Conventions)

관계 쿼리를 수행할 때는 Eloquent의 일반적인 외래 키 명명 규칙이 적용됩니다. 만약 관계에 사용할 키를 직접 지정하고 싶다면, `hasOneThrough`의 세 번째와 네 번째 인수로 각각 중간 모델의 외래 키와 최종(target) 모델의 외래 키명을 넘기면 됩니다. 다섯 번째 인수는 원래(로컬) 키, 여섯 번째 인수는 중간 모델의 로컬 키입니다.

```
class Mechanic extends Model
{
    /**
     * 정비사가 정비하는 차량의 차주 정보를 반환합니다.
     */
    public function carOwner()
    {
        return $this->hasOneThrough(
            Owner::class,
            Car::class,
            'mechanic_id', // cars 테이블 내 외래 키
            'car_id', // owners 테이블 내 외래 키
            'id', // mechanics 테이블의 로컬 키
            'id' // cars 테이블의 로컬 키
        );
    }
}
```

앞서 설명한 것처럼, 관계에 참여하는 모든 모델에 해당 관계가 정의되어 있다면, `through` 메서드와 관계명 지정으로 키 명명 규칙을 간결하게 재사용할 수 있습니다.

```php
// 문자열 방식...
return $this->through('cars')->has('owner');

// 동적 방식...
return $this->throughCars()->hasOwner();
```

<a name="has-many-through"></a>
### Has Many Through

"has-many-through" 관계는 중간 관계를 통해 멀리 떨어진 연관 데이터를 간편하게 조회하는 방법을 제공합니다. 예를 들어, [Laravel Vapor](https://vapor.laravel.com)와 같은 배포 플랫폼을 개발한다고 가정해봅시다. `Project` 모델은 중간에 `Environment` 모델을 경유하여 여러 개의 `Deployment`(배포) 모델에 접근할 수 있습니다. 이 구조를 활용하면 하나의 프로젝트에 대한 모든 배포 내역을 손쉽게 모을 수 있습니다. 필요한 테이블은 아래와 같습니다.

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

테이블 구조를 확인했다면, 관계를 `Project` 모델에 다음과 같이 정의할 수 있습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    /**
     * 이 프로젝트의 모든 배포 내역을 반환합니다.
     */
    public function deployments()
    {
        return $this->hasManyThrough(Deployment::class, Environment::class);
    }
}
```

`hasManyThrough`의 첫 번째 인수는 최종적으로 접근하려는 모델명, 두 번째 인수는 중간 모델명입니다.

또는, 모든 모델에 관계가 이미 정의되어 있다면, `through` 메서드와 관계명을 사용해 더 간결하게 선언할 수도 있습니다.

```php
// 문자열 방식...
return $this->through('environments')->has('deployments');

// 동적 방식...
return $this->throughEnvironments()->hasDeployments();
```

`Deployment` 모델 테이블에는 `project_id` 컬럼이 직접 있지 않지만, `hasManyThrough` 관계 덕분에 `$project->deployments`처럼 프로젝트의 모든 배포 정보를 간편하게 조회할 수 있습니다. 내부적으로 Eloquent는 중간 테이블인 `environments`의 `project_id` 칼럼을 먼저 조회해 관련 환경의 id를 찾고, 그 id들을 이용해 `deployments` 테이블에서 데이터를 가져옵니다.

<a name="has-many-through-key-conventions"></a>

#### 주요 규칙

관계 쿼리를 수행할 때는 일반적인 Eloquent 외래 키 규칙이 사용됩니다. 관계의 키를 커스터마이즈하고 싶다면, `hasManyThrough` 메서드의 세 번째와 네 번째 인수로 지정할 수 있습니다. 세 번째 인수는 중간 모델에 있는 외래 키의 이름이고, 네 번째 인수는 마지막 모델에 있는 외래 키의 이름입니다. 다섯 번째 인수는 로컬 키이고, 여섯 번째 인수는 중간 모델의 로컬 키입니다.

```
class Project extends Model
{
    public function deployments()
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

또는, 앞서 설명한 것처럼, 관계에 참여하는 모든 모델에서 필요한 관계가 이미 정의되어 있다면 `through` 메서드에 해당 관계들의 이름을 전달하여 "has-many-through" 관계를 더욱 유연하게 정의할 수 있습니다. 이 방법의 장점은 이미 기존 관계에 정의된 키 규칙을 재사용할 수 있다는 점입니다.

```php
// 문자열 기반 문법...
return $this->through('environments')->has('deployments');

// 동적 문법...
return $this->throughEnvironments()->hasDeployments();
```

<a name="many-to-many"></a>
## 다대다(Many To Many) 관계

다대다(Many-to-many) 관계는 `hasOne`이나 `hasMany` 관계보다 약간 더 복잡합니다. 예를 들어, 하나의 사용자가 여러 역할(Role)을 가질 수 있고, 해당 역할들은 다른 사용자와도 공유될 수 있습니다. 즉, 한 사용자가 "Author"와 "Editor" 역할을 부여받을 수 있고, 이 역할들은 다른 사용자에게도 부여될 수 있습니다. 따라서 하나의 사용자는 여러 역할을, 하나의 역할은 여러 사용자를 가집니다.

<a name="many-to-many-table-structure"></a>
#### 테이블 구조

이 관계를 정의하려면 `users`, `roles`, `role_user`의 3개 데이터베이스 테이블이 필요합니다. `role_user` 테이블은 관련 모델 이름의 알파벳 순으로 만들어지며, `user_id`와 `role_id` 컬럼을 가집니다. 이 테이블은 사용자와 역할을 연결하는 중간 테이블로 사용됩니다.

역할이 여러 사용자에게 속할 수 있으므로, `roles` 테이블에 단순히 `user_id` 컬럼을 추가해서는 안됩니다. 그렇게 하면 한 역할이 오직 한 사용자에게만 속하는 의미가 되기 때문입니다. 여러 사용자에게 역할을 할당하려면 반드시 `role_user` 중간 테이블이 필요합니다. 관계의 테이블 구조를 요약하면 다음과 같습니다.

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

다대다 관계는 `belongsToMany` 메서드의 결과를 반환하는 메서드를 작성하여 정의합니다. `belongsToMany` 메서드는 애플리케이션의 모든 Eloquent 모델이 상속 받는 `Illuminate\Database\Eloquent\Model` 기본 클래스에서 제공됩니다. 예를 들어, `User` 모델에 `roles` 메서드를 정의할 수 있습니다. 이 메서드의 첫 번째 인수는 연결할 모델 클래스의 이름입니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 사용자와 연결된 역할 목록.
     */
    public function roles()
    {
        return $this->belongsToMany(Role::class);
    }
}
```

관계를 정의한 후에는, `roles` 동적 관계 속성을 사용해 사용자의 역할에 접근할 수 있습니다.

```
use App\Models\User;

$user = User::find(1);

foreach ($user->roles as $role) {
    //
}
```

모든 관계는 쿼리 빌더 역할도 하므로, `roles` 메서드를 호출하고 조건을 체이닝해서 추가 제약 조건을 쿼리에 붙일 수 있습니다.

```
$roles = User::find(1)->roles()->orderBy('name')->get();
```

관계의 중간 테이블명을 결정할 때, Eloquent는 두 관련 모델 이름을 알파벳 순으로 조합합니다. 하지만 이 규칙을 직접 오버라이드할 수 있습니다. `belongsToMany`의 두 번째 인수로 테이블명을 지정하면 됩니다.

```
return $this->belongsToMany(Role::class, 'role_user');
```

중간 테이블의 이름뿐만이 아니라, 테이블의 키 컬럼명 역시 추가 인수로 지정할 수 있습니다. 세 번째 인수는 현재 모델의 외래 키, 네 번째 인수는 조인할 모델의 외래 키입니다.

```
return $this->belongsToMany(Role::class, 'role_user', 'user_id', 'role_id');
```

<a name="many-to-many-defining-the-inverse-of-the-relationship"></a>
#### 관계의 반대(Inverse) 정의하기

다대다 관계의 "반대"를 정의하려면, 관련 모델에도 `belongsToMany` 메서드를 반환하는 메서드를 정의해야 합니다. 사용자/역할 예시를 완성하기 위해 `Role` 모델에 `users` 메서드를 정의해봅시다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    /**
     * 역할을 가진 사용자 목록.
     */
    public function users()
    {
        return $this->belongsToMany(User::class);
    }
}
```

보시다시피, 관계 정의 방식은 `User` 모델의 경우와 거의 동일하며, 단지 `App\Models\User`을 참조한다는 점만 다릅니다. `belongsToMany`를 재사용하기 때문에, 다대다 관계의 "반대"를 정의할 때도 테이블과 키의 커스터마이징 옵션을 모두 사용할 수 있습니다.

<a name="retrieving-intermediate-table-columns"></a>
### 중간 테이블 컬럼 조회하기

이미 살펴봤듯, 다대다 관계를 사용하려면 중간 테이블이 필요합니다. Eloquent는 이 중간 테이블을 다루기 위한 다양한 방법을 제공합니다. 예를 들어, `User` 모델이 여러 `Role` 모델과 연결되어 있다면, 이 관계를 통해 중간 테이블의 값에 `pivot` 속성으로 접근할 수 있습니다.

```
use App\Models\User;

$user = User::find(1);

foreach ($user->roles as $role) {
    echo $role->pivot->created_at;
}
```

조회된 각 `Role` 모델에는 자동으로 `pivot` 속성이 할당됩니다. 이 속성은 중간 테이블을 나타내는 모델을 포함합니다.

기본적으로 `pivot` 모델에는 키 컬럼만 포함됩니다. 만약 중간 테이블에 추가 속성이 있다면, 관계 정의 시 `withPivot` 메서드로 명시해주어야 접근이 가능합니다.

```
return $this->belongsToMany(Role::class)->withPivot('active', 'created_by');
```

중간 테이블에 `created_at`과 `updated_at` 타임스탬프가 존재하고, Eloquent가 이를 자동으로 관리하게 하려면 관계 정의 시 `withTimestamps` 메서드를 호출하면 됩니다.

```
return $this->belongsToMany(Role::class)->withTimestamps();
```

> [!WARNING]
> Eloquent가 자동으로 관리하는 타임스탬프를 사용하는 중간 테이블에는 반드시 `created_at`과 `updated_at` 컬럼이 모두 존재해야 합니다.

<a name="customizing-the-pivot-attribute-name"></a>
#### `pivot` 속성 이름 커스터마이즈하기

앞에서 언급했듯, 중간 테이블의 속성은 모델에서 `pivot` 속성으로 접근 가능합니다. 그러나 필요하다면, 이 속성 이름을 애플리케이션에 더 적합한 이름으로 변경할 수 있습니다.

예를 들어, 사용자가 팟캐스트를 구독(subscribe)할 수 있는 구조라면, 사용자와 팟캐스트 간의 다대다 관계에서 중간 테이블 속성을 `pivot` 대신 `subscription`처럼 의미 있는 이름으로 정의하고 싶을 수 있습니다. 이를 위해 관계 정의 시 `as` 메서드를 활용할 수 있습니다.

```
return $this->belongsToMany(Podcast::class)
                ->as('subscription')
                ->withTimestamps();
```

이렇게 커스텀 중간 테이블 속성을 지정하면, 해당 이름으로 중간 테이블 데이터를 조회할 수 있습니다.

```
$users = User::with('podcasts')->get();

foreach ($users->flatMap->podcasts as $podcast) {
    echo $podcast->subscription->created_at;
}
```

<a name="filtering-queries-via-intermediate-table-columns"></a>
### 중간 테이블 컬럼으로 쿼리 필터링하기

`belongsToMany` 관계 쿼리에 대해 `wherePivot`, `wherePivotIn`, `wherePivotNotIn`, `wherePivotBetween`, `wherePivotNotBetween`, `wherePivotNull`, `wherePivotNotNull` 메서드를 사용하여, 중간 테이블 컬럼의 값을 기준으로 결과를 필터링할 수 있습니다.

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
### 중간 테이블 컬럼 기준 정렬하기

`belongsToMany` 관계 쿼리의 반환 결과를, 중간 테이블 컬럼 기준으로 정렬할 수 있습니다. 다음 예시에서는 사용자의 최신 배지를 조회합니다.

```
return $this->belongsToMany(Badge::class)
                ->where('rank', 'gold')
                ->orderByPivot('created_at', 'desc');
```

<a name="defining-custom-intermediate-table-models"></a>
### 커스텀 중간 테이블 모델 정의하기

다대다 관계의 중간 테이블을 나타내는 커스텀 모델을 정의하고 싶다면, 관계 정의 시 `using` 메서드를 사용할 수 있습니다. 커스텀 pivot 모델을 사용하면, 그 모델에 메서드나 속성 변환(casts) 등 추가 동작을 정의할 수 있습니다.

커스텀 다대다 pivot 모델은 `Illuminate\Database\Eloquent\Relations\Pivot` 클래스를 상속해야 하며, 커스텀 다형 다대다(polimorphic many-to-many) pivot 모델은 `Illuminate\Database\Eloquent\Relations\MorphPivot` 클래스를 상속해야 합니다. 예를 들어, 커스텀 `RoleUser` pivot 모델을 사용하는 `Role` 모델을 정의할 수 있습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    /**
     * 역할을 가진 사용자 목록.
     */
    public function users()
    {
        return $this->belongsToMany(User::class)->using(RoleUser::class);
    }
}
```

`RoleUser` 모델을 정의할 때에는 `Illuminate\Database\Eloquent\Relations\Pivot` 클래스를 반드시 상속해야 합니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class RoleUser extends Pivot
{
    //
}
```

> [!WARNING]
> Pivot 모델은 `SoftDeletes` 트레이트를 사용할 수 없습니다. Pivot 레코드를 소프트 삭제해야 한다면, pivot 모델을 실제 Eloquent 모델로 변환하는 것을 고려해보십시오.

<a name="custom-pivot-models-and-incrementing-ids"></a>
#### 커스텀 Pivot 모델과 자동 증가 ID

만약 커스텀 pivot 모델을 사용하는 다대다 관계를 정의했고, 해당 pivot 모델에 자동 증가(autoincrement) 기본 키가 있다면, 해당 pivot 모델 클래스에서 `incrementing` 속성이 `true`로 설정되어 있어야 합니다.

```
/**
 * ID가 자동 증가하는지 여부를 나타냅니다.
 *
 * @var bool
 */
public $incrementing = true;
```

<a name="polymorphic-relationships"></a>
## 다형(Polymorphic) 관계

다형(Polymorphic) 관계를 사용하면 자식 모델이 여러 타입의 모델에 하나의 연관으로 속할 수 있습니다. 예를 들어, 사용자가 블로그 게시글과 동영상을 공유하는 애플리케이션을 만든다고 가정해봅시다. 이런 경우, `Comment` 모델이 `Post` 모델과 `Video` 모델 모두에 속할 수 있습니다.

<a name="one-to-one-polymorphic-relations"></a>
### 일대일(다형) 관계

<a name="one-to-one-polymorphic-table-structure"></a>
#### 테이블 구조

일대일 다형 관계는 일반적인 일대일 관계와 비슷하지만, 한 자식 모델이 여러 타입의 모델과 하나의 연관을 가질 수 있다는 차이가 있습니다. 예를 들어, 블로그의 `Post`와 `User`가 모두 하나의 `Image` 모델과 다형 관계를 가질 수 있습니다. 일대일 다형 관계를 이용하면, 게시글이나 사용자에 연결될 수 있는 고유한 이미지들을 단일 테이블에 관리할 수 있습니다. 먼저, 테이블 구조를 살펴보겠습니다.

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

`images` 테이블에 있는 `imageable_id`와 `imageable_type` 컬럼에 주목하세요. `imageable_id` 컬럼에는 게시글이나 사용자의 ID가 저장되고, `imageable_type` 컬럼에는 부모 모델의 클래스명이 저장됩니다. `imageable_type` 컬럼을 통해 Eloquent는 어떤 "타입"의 부모 모델을 반환해야 할지 판단하게 됩니다. 이 경우, 컬럼 값은 `App\Models\Post` 또는 `App\Models\User` 중 하나가 됩니다.

<a name="one-to-one-polymorphic-model-structure"></a>
#### 모델 구조

이제 이 관계를 구성하기 위해 필요한 모델 정의를 확인해봅시다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Image extends Model
{
    /**
     * 부모 imageable 모델 (user 또는 post)을 반환.
     */
    public function imageable()
    {
        return $this->morphTo();
    }
}

class Post extends Model
{
    /**
     * 게시글의 이미지를 반환.
     */
    public function image()
    {
        return $this->morphOne(Image::class, 'imageable');
    }
}

class User extends Model
{
    /**
     * 사용자의 이미지를 반환.
     */
    public function image()
    {
        return $this->morphOne(Image::class, 'imageable');
    }
}
```

<a name="one-to-one-polymorphic-retrieving-the-relationship"></a>
#### 관계 조회하기

데이터베이스 테이블과 모델이 준비되면, 모델을 통해 관계에 접근할 수 있습니다. 예를 들어, 게시글의 이미지를 가져오려면 `image` 동적 관계 속성을 사용하면 됩니다.

```
use App\Models\Post;

$post = Post::find(1);

$image = $post->image;
```

다형 모델의 부모를 조회하려면, 내부적으로 `morphTo`를 호출하는 메서드의 이름을 동적 관계 속성으로 사용하면 됩니다. 이 예시에서는 `Image` 모델의 `imageable` 메서드입니다. 따라서 아래와 같이 접근할 수 있습니다.

```
use App\Models\Image;

$image = Image::find(1);

$imageable = $image->imageable;
```

`Image` 모델의 `imageable` 관계는 해당 이미지를 소유하는 모델이 `Post`이면 `Post` 인스턴스를, `User`이면 `User` 인스턴스를 반환합니다.

<a name="morph-one-to-one-key-conventions"></a>
#### 키 규칙

필요하다면, 다형 자식 모델이 사용하는 "id"와 "type" 컬럼명을 직접 지정할 수 있습니다. 이 경우에는 `morphTo` 메서드의 첫 번째 인수로 관계의 이름을 꼭 전달해야 합니다. 일반적으로 이 값은 메서드명과 동일하게 하면 되므로, PHP의 `__FUNCTION__` 상수를 사용할 수 있습니다.

```
/**
 * 이미지가 속한 모델을 반환.
 */
public function imageable()
{
    return $this->morphTo(__FUNCTION__, 'imageable_type', 'imageable_id');
}
```

<a name="one-to-many-polymorphic-relations"></a>
### 일대다(다형) 관계

<a name="one-to-many-polymorphic-table-structure"></a>
#### 테이블 구조

일대다 다형 관계는 일반적인 일대다 관계와 유사하지만, 자식 모델이 하나의 연관을 통해 여러 타입의 모델에 속할 수 있다는 점이 다릅니다. 예를 들어, 애플리케이션에서 사용자가 게시글이나 동영상에 댓글(comment)을 남길 수 있다고 가정해봅시다. 이럴 때 다형 관계를 사용하면, `comments` 테이블 하나로 게시글과 동영상 모두에 달린 댓글을 관리할 수 있습니다. 먼저, 아래와 같은 테이블 구조가 필요합니다.

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

이제 이 관계를 구현하기 위한 모델 정의를 살펴보겠습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    /**
     * 부모 commentable 모델 (post 또는 video)을 반환.
     */
    public function commentable()
    {
        return $this->morphTo();
    }
}

class Post extends Model
{
    /**
     * 게시글의 모든 댓글을 반환.
     */
    public function comments()
    {
        return $this->morphMany(Comment::class, 'commentable');
    }
}

class Video extends Model
{
    /**
     * 동영상의 모든 댓글을 반환.
     */
    public function comments()
    {
        return $this->morphMany(Comment::class, 'commentable');
    }
}
```

<a name="one-to-many-polymorphic-retrieving-the-relationship"></a>
#### 관계 조회하기

데이터베이스 테이블과 모델이 준비되었다면, 동적 관계 속성을 통해 관계에 접근할 수 있습니다. 예를 들어, 게시글의 모든 댓글에 접근하려면 `comments` 동적 속성을 사용할 수 있습니다.

```
use App\Models\Post;

$post = Post::find(1);

foreach ($post->comments as $comment) {
    //
}
```

다형 자식 모델의 부모를 조회할 때도, 내부적으로 `morphTo`를 호출하는 메서드명(여기서는 `Comment` 모델의 `commentable` 메서드)을 동적 속성으로 사용하면 됩니다.

```
use App\Models\Comment;

$comment = Comment::find(1);

$commentable = $comment->commentable;
```

`Comment` 모델의 `commentable` 관계는 해당 댓글의 부모 모델이 `Post`이면 `Post` 인스턴스를, `Video`이면 `Video` 인스턴스를 반환합니다.

<a name="one-of-many-polymorphic-relations"></a>
### 다수 중 하나(One Of Many, 다형) 관계

때때로 하나의 모델이 여러 관련 모델을 가질 수 있지만, 그 중에서 "가장 최신" 또는 "가장 오래된" 하나의 관련 모델만 쉽게 가져오고 싶을 때가 있습니다. 예를 들어, `User` 모델이 여러 `Image` 모델과 연결되어 있지만, 사용자가 마지막으로 업로드한 이미지를 편하게 가져오고 싶을 수 있습니다. 이럴 때는 `morphOne` 관계와 `ofMany` 메서드를 조합해 구현할 수 있습니다.

```php
/**
 * 사용자가 가장 최근에 업로드한 이미지를 반환.
 */
public function latestImage()
{
    return $this->morphOne(Image::class, 'imageable')->latestOfMany();
}
```

마찬가지로, 관계에서 "가장 오래된" 또는 첫 번째 관련 모델을 조회하는 메서드도 정의할 수 있습니다.

```php
/**
 * 사용자의 가장 오래된 이미지를 반환.
 */
public function oldestImage()
{
    return $this->morphOne(Image::class, 'imageable')->oldestOfMany();
}
```

기본적으로 `latestOfMany`와 `oldestOfMany` 메서드는 해당 모델의 기본 키(정렬 가능한 값)를 기준으로 가장 최신 또는 가장 오래된 관련 모델을 가져옵니다. 하지만, 다른 정렬 기준으로 더 큰 집합 중 하나의 모델만 조회하고 싶을 때는 `ofMany` 메서드를 사용할 수 있습니다.

예를 들어, 사용자의 "좋아요"가 가장 많은 이미지를 가져오고 싶다면, `ofMany` 메서드의 첫 번째 인수로 정렬 기준 컬럼을, 두 번째 인수로 사용할 집계 함수(예: `min` 또는 `max`)를 각각 전달하면 됩니다.

```php
/**
 * 사용자가 가장 많이 좋아한 이미지를 반환.
 */
public function bestImage()
{
    return $this->morphOne(Image::class, 'imageable')->ofMany('likes', 'max');
}
```

> [!NOTE]
> 더 고급스러운 "다수 중 하나" 관계도 구성할 수 있습니다. 자세한 내용은 [has one of many 문서](#advanced-has-one-of-many-relationships)를 참고하세요.

<a name="many-to-many-polymorphic-relations"></a>
### 다대다(다형) 관계

<a name="many-to-many-polymorphic-table-structure"></a>
#### 테이블 구조

다형 다대다(many-to-many polymorphic) 관계는 "morph one"이나 "morph many" 관계보다 조금 더 복잡합니다. 예를 들어, `Post` 모델과 `Video` 모델이 모두 `Tag` 모델과 다형 다대다 관계를 맺을 수 있습니다. 이 구조를 사용하면, 게시글과 동영상 모두에 연결되는 고유한 태그를 하나의 테이블에서 관리할 수 있습니다. 아래는 이 관계를 구성하는 데 필요한 테이블 구조 예시입니다.

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
> 다형 다대다 관계를 본격적으로 살펴보기 전에, 일반적인 [다대다 관계](#many-to-many) 문서를 먼저 읽어보는 것이 도움이 될 수 있습니다.

<a name="many-to-many-polymorphic-model-structure"></a>

#### 모델 구조

이제 모델에 관계를 정의할 준비가 되었습니다. `Post`와 `Video` 모델 모두 기본 Eloquent 모델 클래스에서 제공하는 `morphToMany` 메서드를 호출하는 `tags` 메서드를 포함하게 됩니다.

`morphToMany` 메서드는 연관 모델의 이름과 "관계 이름"을 인자로 받습니다. 우리가 중간 테이블명과 키에 지정한 이름을 기준으로, 이 관계의 이름은 "taggable"로 참조합니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    /**
     * 게시글에 대한 모든 태그를 가져옵니다.
     */
    public function tags()
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }
}
```

<a name="many-to-many-polymorphic-defining-the-inverse-of-the-relationship"></a>
#### 역(反)관계 정의하기

다음으로, `Tag` 모델에서 각 부모 모델에 대한 메서드를 정의해야 합니다. 이 예시에서는 `posts` 메서드와 `videos` 메서드를 생성합니다. 이들 메서드는 모두 `morphedByMany` 메서드의 결과를 반환해야 합니다.

`morphedByMany` 메서드 역시 연관 모델 이름과 "관계 이름"을 인자로 받습니다. 우리가 중간 테이블명과 키에 지정한 이름을 기준으로, 이 관계의 이름 역시 "taggable"로 참조합니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    /**
     * 이 태그가 할당된 모든 게시글을 가져옵니다.
     */
    public function posts()
    {
        return $this->morphedByMany(Post::class, 'taggable');
    }

    /**
     * 이 태그가 할당된 모든 비디오를 가져옵니다.
     */
    public function videos()
    {
        return $this->morphedByMany(Video::class, 'taggable');
    }
}
```

<a name="many-to-many-polymorphic-retrieving-the-relationship"></a>
#### 관계 조회하기

데이터베이스 테이블과 모델을 모두 정의했다면, 이제 모델을 통해 관계에 접근할 수 있습니다. 예를 들어, 하나의 게시글에 연결된 모든 태그를 조회하려면 `tags` 동적 관계 프로퍼티를 사용할 수 있습니다.

```
use App\Models\Post;

$post = Post::find(1);

foreach ($post->tags as $tag) {
    //
}
```

다형성(Polymorphic) 자식 모델에서 `morphedByMany`를 호출하는 메서드 이름에 접근하여, 다형성 관계의 부모 모델을 조회할 수도 있습니다. 이 예시에서는 `Tag` 모델의 `posts` 또는 `videos` 메서드가 해당됩니다.

```
use App\Models\Tag;

$tag = Tag::find(1);

foreach ($tag->posts as $post) {
    //
}

foreach ($tag->videos as $video) {
    //
}
```

<a name="custom-polymorphic-types"></a>
### 사용자 지정 다형성 타입

기본적으로 라라벨은 연관된 모델의 "타입"을 저장할 때 **완전히 수식된 클래스명(fully qualified class name)** 을 사용합니다. 예를 들어, 앞서 소개한 일대다(One To Many) 관계 예시에서 `Comment` 모델이 `Post` 또는 `Video` 모델에 속하는 경우, 기본 `commentable_type` 값에는 각각 `App\Models\Post` 또는 `App\Models\Video`가 저장됩니다. 하지만, 애플리케이션의 내부 구조와 이 값들을 분리하고 싶을 수 있습니다.

예를 들어, 모델의 이름 대신에 `post`나 `video` 같은 간단한 문자열을 "타입"으로 사용할 수도 있습니다. 이렇게 하면 데이터베이스의 다형성 "타입" 컬럼 값이 모델의 이름이 바뀌더라도 여전히 유효하게 유지됩니다.

```
use Illuminate\Database\Eloquent\Relations\Relation;

Relation::enforceMorphMap([
    'post' => 'App\Models\Post',
    'video' => 'App\Models\Video',
]);
```

`enforceMorphMap` 메서드는 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드 내에서 호출하거나, 필요에 따라 별도의 서비스 프로바이더를 만들어 호출할 수도 있습니다.

실행 중에 모델에서 사용하는 morph 별칭(alias)을 확인하려면 모델의 `getMorphClass` 메서드를 사용할 수 있습니다. 반대로, morph 별칭에 연결된 완전히 수식된 클래스명을 알아내려면 `Relation::getMorphedModel` 메서드를 이용하면 됩니다.

```
use Illuminate\Database\Eloquent\Relations\Relation;

$alias = $post->getMorphClass();

$class = Relation::getMorphedModel($alias);
```

> [!WARNING]
> 기존 애플리케이션에 "morph map"을 추가할 때, 데이터베이스 내의 모든 `*_type` 컬럼 값이 기존의 완전히 수식된 클래스명을 포함하고 있다면 반드시 새로 지정한 "맵" 이름으로 변환해주어야 합니다.

<a name="dynamic-relationships"></a>
### 동적(런타임) 관계 정의

`resolveRelationUsing` 메서드를 사용하면 Eloquent 모델 간의 관계를 런타임에 정의할 수 있습니다. 일반적인 애플리케이션 개발에서는 자주 사용하지 않지만, 라라벨 패키지 개발 시에는 가끔 유용하게 쓸 수 있습니다.

`resolveRelationUsing`는 첫 번째 인자로 원하는 관계 이름을 받고, 두 번째 인자로는 해당 모델 인스턴스를 받아 유효한 Eloquent 관계 정의를 반환하는 클로저를 받습니다. 보통 이 동적 관계 설정은 [서비스 프로바이더](/docs/9.x/providers)의 boot 메서드 내에서 구성해야 합니다.

```
use App\Models\Order;
use App\Models\Customer;

Order::resolveRelationUsing('customer', function ($orderModel) {
    return $orderModel->belongsTo(Customer::class, 'customer_id');
});
```

> [!WARNING]
> 동적 관계를 정의할 때는 반드시 Eloquent 관계 메서드에 명시적으로 키 이름 인자를 제공해야 합니다.

<a name="querying-relations"></a>
## 관계 조회(Querying Relations)

Eloquent의 모든 관계는 메서드를 통해 정의되어 있으므로, 해당 메서드를 호출하면 연관된 모델을 실제로 조회하지 않고도 관계의 인스턴스를 얻을 수 있습니다. 또한 모든 종류의 Eloquent 관계는 [쿼리 빌더](/docs/9.x/queries)로 동작하므로, 최종적으로 DB에 쿼리를 실행하기 전에 관계 쿼리에 조건을 계속 체이닝할 수 있습니다.

예를 들어, 블로그 애플리케이션에서 `User` 모델이 여러 개의 `Post` 모델과 관계가 있다고 가정해봅시다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 사용자와 연결된 모든 게시글을 가져옵니다.
     */
    public function posts()
    {
        return $this->hasMany(Post::class);
    }
}
```

`posts` 관계를 조회하면서 추가 조건을 더할 수도 있습니다.

```
use App\Models\User;

$user = User::find(1);

$user->posts()->where('active', 1)->get();
```

관계에서 라라벨 [쿼리 빌더](/docs/9.x/queries)의 모든 메서드를 자유롭게 사용할 수 있으니, 사용 가능한 모든 메서드는 쿼리 빌더 문서를 참고해 익혀두는 것이 좋습니다.

<a name="chaining-orwhere-clauses-after-relationships"></a>
#### 관계 이후 `orWhere` 절 체이닝 주의

앞선 예시처럼, 관계 쿼리에서 추가 조건을 자유롭게 체이닝할 수 있습니다. 다만, 관계에서 `orWhere` 절을 사용할 때는 특별히 주의해야 합니다. `orWhere`는 관계 조건과 같은 레벨로 논리적으로 그룹화되기 때문입니다.

```
$user->posts()
        ->where('active', 1)
        ->orWhere('votes', '>=', 100)
        ->get();
```

위의 예시는 다음과 같은 SQL을 생성하게 됩니다. 보시다시피, `or` 절 때문에 투표 수가 100 이상인 **어느 사용자든** 결과에 포함될 수 있습니다. 이제 쿼리가 특정 사용자로 제한되지 않습니다.

```sql
select *
from posts
where user_id = ? and active = 1 or votes >= 100
```

대부분의 경우, [논리 그룹](/docs/9.x/queries#logical-grouping)을 사용해 조건을 괄호로 그룹화하는 것이 좋습니다.

```
use Illuminate\Database\Eloquent\Builder;

$user->posts()
        ->where(function (Builder $query) {
            return $query->where('active', 1)
                         ->orWhere('votes', '>=', 100);
        })
        ->get();
```

위의 예시는 다음과 같은 SQL을 생성합니다. 논리 그룹핑이 올바르게 되어 특정 사용자로 쿼리가 제한됩니다.

```sql
select *
from posts
where user_id = ? and (active = 1 or votes >= 100)
```

<a name="relationship-methods-vs-dynamic-properties"></a>
### 관계 메서드 vs. 동적 프로퍼티

Eloquent 관계 쿼리에 추가 조건이 필요 없다면, 해당 관계를 속성처럼 접근할 수 있습니다. 예를 들어, 앞에서 사용한 `User`와 `Post` 모델 예시에서, 한 사용자의 모든 게시글을 아래와 같이 가져올 수 있습니다.

```
use App\Models\User;

$user = User::find(1);

foreach ($user->posts as $post) {
    //
}
```

동적 관계 프로퍼티는 "지연 로딩(lazy loading)"으로 동작하므로, 실제로 해당 속성에 접근하기 전까지는 관계 데이터가 로딩되지 않습니다. 이런 이유로, 개발자들은 모델을 불러온 후 반드시 접근할 연관관계를 미리 조회(즉시 로딩, eager loading)하는 [즉시 로딩](#eager-loading) 기법을 자주 사용합니다. 즉시 로딩을 이용하면, 모델의 연관 데이터를 불러오기 위해 실행해야 하는 SQL 쿼리 수가 크게 줄어듭니다.

<a name="querying-relationship-existence"></a>
### 관계 존재 여부로 조건 쿼리

모델 레코드를 조회할 때, 특정 관계가 존재하는지 여부로 결과를 제한하고 싶을 수 있습니다. 예를 들어, 댓글이 최소 하나 이상 달린 블로그 게시글만을 조회하고 싶다면, `has`와 `orHas` 메서드에 관계 이름을 인자로 전달하면 됩니다.

```
use App\Models\Post;

// 하나 이상의 댓글이 달린 모든 게시글 조회...
$posts = Post::has('comments')->get();
```

추가로, 연산자와 개수 값을 지정해 쿼리를 조정할 수도 있습니다.

```
// 세 개 이상의 댓글이 달린 게시글 모두 조회...
$posts = Post::has('comments', '>=', 3)->get();
```

중첩된 `has` 조건문은 "닷(dot) 표기법"을 사용해 만들 수 있습니다. 예를 들어, 최소 한 개 이상의 이미지가 달린 댓글이 있는 게시글을 모두 조회할 수 있습니다.

```
// 이미지를 포함한 댓글이 최소 하나라도 있는 게시글 조회...
$posts = Post::has('comments.images')->get();
```

더 복잡한 쿼리가 필요하다면, `has` 쿼리에 대해 `whereHas`와 `orWhereHas` 메서드를 사용해 추가 제약 조건(예: 댓글 내용 검사 등)을 지정할 수 있습니다.

```
use Illuminate\Database\Eloquent\Builder;

// code%로 시작하는 내용의 댓글이 하나라도 있는 게시글 조회...
$posts = Post::whereHas('comments', function (Builder $query) {
    $query->where('content', 'like', 'code%');
})->get();

// code%로 시작하는 내용의 댓글이 10개 이상인 게시글 조회...
$posts = Post::whereHas('comments', function (Builder $query) {
    $query->where('content', 'like', 'code%');
}, '>=', 10)->get();
```

> [!WARNING]
> Eloquent는 현재 데이터베이스를 넘나드는 관계 존재 쿼리를 지원하지 않습니다. 관계는 반드시 동일한 데이터베이스 내에 존재해야 합니다.

<a name="inline-relationship-existence-queries"></a>
#### 인라인 관계 존재 조건 쿼리

관계 쿼리에 매우 간단한 `where` 조건을 하나만 추가하고 싶을 때는 `whereRelation`, `orWhereRelation`, `whereMorphRelation`, `orWhereMorphRelation` 메서드가 더 편리할 수 있습니다. 예를 들어, 승인되지 않은(unapproved) 댓글이 달린 모든 게시글을 조회할 수 있습니다.

```
use App\Models\Post;

$posts = Post::whereRelation('comments', 'is_approved', false)->get();
```

물론, 쿼리 빌더의 `where` 메서드처럼 연산자를 지정할 수도 있습니다.

```
$posts = Post::whereRelation(
    'comments', 'created_at', '>=', now()->subHour()
)->get();
```

<a name="querying-relationship-absence"></a>
### 관계 미존재(부재) 조건 쿼리

모델 레코드를 조회할 때, 특정 관계가 **존재하지 않는** 경우만 결과에 포함하고 싶을 수 있습니다. 예를 들어, **댓글이 하나도 없는** 블로그 게시글만 조회하려면, `doesntHave`와 `orDoesntHave` 메서드에 관계 이름을 전달하면 됩니다.

```
use App\Models\Post;

$posts = Post::doesntHave('comments')->get();
```

더 복잡한 쿼리가 필요하다면, `doesntHave` 쿼리에 대해 `whereDoesntHave`와 `orWhereDoesntHave` 메서드를 사용해 추가 제약 조건(예: 댓글 내용 검사 등)을 지정할 수 있습니다.

```
use Illuminate\Database\Eloquent\Builder;

$posts = Post::whereDoesntHave('comments', function (Builder $query) {
    $query->where('content', 'like', 'code%');
})->get();
```

"닷(dot)" 표기법을 사용해 중첩 관계에도 쿼리를 적용할 수 있습니다. 아래 쿼리는 댓글이 없는 게시글을 가져오는 대신, 금지(banned)되지 않은 저자가 쓴 댓글이 있는 게시글은 결과에 포함합니다.

```
use Illuminate\Database\Eloquent\Builder;

$posts = Post::whereDoesntHave('comments.author', function (Builder $query) {
    $query->where('banned', 0);
})->get();
```

<a name="querying-morph-to-relationships"></a>
### Morph To 관계 쿼리

"morph to" 관계의 존재를 쿼리할 때는 `whereHasMorph`와 `whereDoesntHaveMorph` 메서드를 사용할 수 있습니다. 이 메서드들은 첫 번째 인자로 관계 이름, 이어서 쿼리에 포함하고자 하는 연관 모델 이름 목록을 받습니다. 마지막으로, 관계 쿼리를 커스터마이즈할 수 있는 클로저를 전달할 수도 있습니다.

```
use App\Models\Comment;
use App\Models\Post;
use App\Models\Video;
use Illuminate\Database\Eloquent\Builder;

// 제목이 code%로 시작하는 포스트 또는 비디오에 연결된 댓글 조회...
$comments = Comment::whereHasMorph(
    'commentable',
    [Post::class, Video::class],
    function (Builder $query) {
        $query->where('title', 'like', 'code%');
    }
)->get();

// 제목이 code%로 시작하지 않는 포스트에 연결된 댓글 조회...
$comments = Comment::whereDoesntHaveMorph(
    'commentable',
    Post::class,
    function (Builder $query) {
        $query->where('title', 'like', 'code%');
    }
)->get();
```

경우에 따라, 연관 다형성 모델의 "타입"에 기반해 쿼리 조건을 추가해야 할 수 있습니다. `whereHasMorph` 메서드에 전달하는 클로저는 두 번째 인자로 `$type` 값을 받을 수 있습니다. 이를 이용해 쿼리가 어떤 타입에 대해 만들어지고 있는지 검사할 수 있습니다.

```
use Illuminate\Database\Eloquent\Builder;

$comments = Comment::whereHasMorph(
    'commentable',
    [Post::class, Video::class],
    function (Builder $query, $type) {
        $column = $type === Post::class ? 'content' : 'title';

        $query->where($column, 'like', 'code%');
    }
)->get();
```

<a name="querying-all-morph-to-related-models"></a>
#### 모든 연관된 다형성 모델 쿼리

다형성 관계에 연결 가능한 모델들을 배열로 전달하는 대신, `*`를 와일드카드 값으로 전달할 수도 있습니다. 그러면 라라벨은 데이터베이스에서 가능한 모든 다형성 타입을 조회해 자동으로 적용합니다. 이를 위해 라라벨이 한 번 더 쿼리를 실행합니다.

```
use Illuminate\Database\Eloquent\Builder;

$comments = Comment::whereHasMorph('commentable', '*', function (Builder $query) {
    $query->where('title', 'like', 'foo%');
})->get();
```

<a name="aggregating-related-models"></a>
## 연관 모델 집계

<a name="counting-related-models"></a>
### 연관 모델 개수 세기

어떤 관계에 연결된 모델의 실제 데이터를 불러오지 않고도, 해당 개수가 몇 개인지 알고 싶을 때가 있습니다. 이럴 때는 `withCount` 메서드를 사용할 수 있습니다. `withCount`를 사용하면 결과 모델에 `{relation}_count` 속성이 추가됩니다.

```
use App\Models\Post;

$posts = Post::withCount('comments')->get();

foreach ($posts as $post) {
    echo $post->comments_count;
}
```

`withCount`에 배열을 전달하면 여러 관계의 개수와 함께 쿼리에 추가 조건도 넣을 수 있습니다.

```
use Illuminate\Database\Eloquent\Builder;

$posts = Post::withCount(['votes', 'comments' => function (Builder $query) {
    $query->where('content', 'like', 'code%');
}])->get();

echo $posts[0]->votes_count;
echo $posts[0]->comments_count;
```

관계 개수 결과에 별칭(alias)을 지정할 수도 있어서, 같은 관계에 대해 여러 번 개수를 셀 수도 있습니다.

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
#### 지연(deferred) 총계 로딩

`loadCount` 메서드를 이용해, 이미 조회한 부모 모델에서 나중에 관계 개수를 불러올 수 있습니다.

```
$book = Book::first();

$book->loadCount('genres');
```

개수 쿼리에 추가 제약 조건을 넣고 싶다면, 카운트할 관계명을 키로 하는 배열을 전달하면 됩니다. 배열 값은 쿼리 빌더 인스턴스를 받는 클로저여야 합니다.

```
$book->loadCount(['reviews' => function ($query) {
    $query->where('rating', 5);
}])
```

<a name="relationship-counting-and-custom-select-statements"></a>
#### 관계 개수 집계와 커스텀 select 사용

`withCount`와 `select`를 함께 쓸 경우, 반드시 `select` 호출 뒤에 `withCount`를 호출해야 합니다.

```
$posts = Post::select(['title', 'body'])
                ->withCount('comments')
                ->get();
```

<a name="other-aggregate-functions"></a>
### 그 외 집계 함수

`withCount` 외에도 Eloquent에는 `withMin`, `withMax`, `withAvg`, `withSum`, `withExists` 메서드가 준비되어 있습니다. 이 메서드들은 결과 모델에 `{relation}_{function}_{column}` 속성을 추가합니다.

```
use App\Models\Post;

$posts = Post::withSum('comments', 'votes')->get();

foreach ($posts as $post) {
    echo $post->comments_sum_votes;
}
```

집계 함수 결과를 다른 이름으로 접근하고 싶다면, 별칭(alias)을 지정할 수도 있습니다.

```
$posts = Post::withSum('comments as total_comments', 'votes')->get();

foreach ($posts as $post) {
    echo $post->total_comments;
}
```

`loadCount`와 마찬가지로, 이 집계 메서드들도 지연 버전이 제공됩니다. 이미 조회한 모델에 추가로 집계 연산을 적용할 수 있습니다.

```
$post = Post::first();

$post->loadSum('comments', 'votes');
```

이 집계 메서드들을 `select`와 함께 사용할 때는 반드시 `select` 호출 뒤에 집계 메서드를 호출해야 합니다.

```
$posts = Post::select(['title', 'body'])
                ->withExists('comments')
                ->get();
```

<a name="counting-related-models-on-morph-to-relationships"></a>
### Morph To 관계의 연관 모델 개수 카운팅

"morph to" 관계를 즉시 로딩함과 동시에, 해당 관계가 반환할 수 있는 여러 엔티티별 연관 모델 개수를 함께 불러오고 싶을 때가 있습니다. 이때는 `with` 메서드와 morphTo 관계의 `morphWithCount` 메서드를 조합해 사용할 수 있습니다.

여기서는 `Photo`와 `Post` 모델이 `ActivityFeed` 모델을 생성할 수 있다고 가정합니다. `ActivityFeed` 모델에는 주어진 인스턴스에 대한 부모 `Photo` 또는 `Post` 모델을 가져올 수 있도록 `parentable`이라는 morphTo 관계가 정의되어 있다고 합시다. 또한, `Photo` 모델은 "여러" `Tag` 모델을, `Post` 모델은 "여러" `Comment` 모델을 가집니다.

이제, `ActivityFeed` 인스턴스들을 가져오면서 각 인스턴스에 연결된 부모 모델(`parentable`)을 즉시 로딩하고, 각 부모 사진의 태그 수와 각 부모 게시글의 댓글 수까지 함께 불러오고 싶다고 해봅시다.

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
#### 지연 총계 로딩

이미 `ActivityFeed` 모델 세트를 조회한 이후에, 관련된 `parentable` 모델들의 관계 개수를 불러오고 싶다면, `loadMorphCount` 메서드를 사용할 수 있습니다.

```
$activities = ActivityFeed::with('parentable')->get();

$activities->loadMorphCount('parentable', [
    Photo::class => ['tags'],
    Post::class => ['comments'],
]);
```

<a name="eager-loading"></a>
## 즉시 로딩(Eager Loading)

Eloquent 관계에 속성으로 접근할 때, 연관된 모델은 "지연 로딩(lazy loading)"됩니다. 즉, 해당 속성에 처음 접근할 때까지는 관계 데이터가 실제로 로드되지 않습니다. 하지만, Eloquent에서는 부모 모델을 쿼리할 때 관계를 "즉시 로딩"할 수 있습니다. 즉시 로딩을 사용하면 "N + 1" 쿼리 문제를 완화할 수 있습니다. N + 1 문제의 예로, 한 `Book` 모델이 하나의 `Author` 모델(저자)에 속한다고 가정해 보겠습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    /**
     * 책을 쓴 저자를 가져옵니다.
     */
    public function author()
    {
        return $this->belongsTo(Author::class);
    }
}
```

이제 모든 책과 그 저자를 조회해 보겠습니다.

```
use App\Models\Book;

$books = Book::all();

foreach ($books as $book) {
    echo $book->author->name;
}
```

위 반복문은 데이터베이스 테이블에서 모든 책을 가져오는 쿼리 하나를 실행하고, 각 책마다 해당 책의 저자를 조회하기 위해 또 다른 쿼리를 실행합니다. 즉, 책이 25권이라면, 총 26번(원본 쿼리 1번 + 저자 쿼리 25번) 쿼리가 실행됩니다.

다행히, 즉시 로딩을 사용하면 이 과정이 단 2개의 쿼리로 줄어듭니다. 쿼리를 작성할 때 `with` 메서드를 통해 즉시 로딩할 관계를 지정할 수 있습니다.

```
$books = Book::with('author')->get();

foreach ($books as $book) {
    echo $book->author->name;
}
```

이렇게 하면 책 전체를 가져오는 쿼리 1번, 모든 책 저자를 한 번에 가져오는 쿼리 1번만 실행됩니다.

```sql
select * from books

select * from authors where id in (1, 2, 3, 4, 5, ...)
```

<a name="eager-loading-multiple-relationships"></a>

#### 다중 관계를 Eager 로딩하기

여러 종류의 관계를 한 번에 eager 로딩해야 할 때가 있습니다. 이 경우, `with` 메서드에 관계들을 배열로 전달하면 됩니다.

```
$books = Book::with(['author', 'publisher'])->get();
```

<a name="nested-eager-loading"></a>
#### 중첩 Eager 로딩

관계의 하위 관계까지 eager 로딩하려면 "점(dot) 표기법"을 사용할 수 있습니다. 예를 들어, 모든 책의 저자와 저자의 개인 연락처까지 eager 로딩하고 싶을 때 다음과 같이 작성할 수 있습니다.

```
$books = Book::with('author.contacts')->get();
```

또는, 여러 중첩 관계를 한 번에 eager 로딩해야 할 경우, `with` 메서드에 중첩 배열 형태로 관계를 지정할 수 있습니다.

```
$books = Book::with([
    'author' => [
        'contacts',
        'publisher',
    ],
])->get();
```

<a name="nested-eager-loading-morphto-relationships"></a>
#### `morphTo` 관계의 중첩 Eager 로딩

`morphTo` 관계와 해당 관계가 반환할 수 있는 다양한 엔티티에 대한 하위 관계까지 eager 로딩하고 싶을 경우, `with` 메서드와 `morphTo` 관계의 `morphWith` 메서드를 함께 사용할 수 있습니다. 설명을 돕기 위해 아래 모델을 예로 들어보겠습니다.

```
<?php

use Illuminate\Database\Eloquent\Model;

class ActivityFeed extends Model
{
    /**
     * 해당 ActivityFeed 레코드의 상위(parent) 엔티티를 반환합니다.
     */
    public function parentable()
    {
        return $this->morphTo();
    }
}
```

여기서 `Event`, `Photo`, `Post` 모델이 각각 `ActivityFeed` 모델을 생성할 수 있다고 가정합니다. 추가로, `Event` 모델은 `Calendar` 모델과 관계가 있고, `Photo` 모델은 `Tag` 모델에 연결되어 있으며, `Post` 모델은 `Author` 모델과 관계가 있다고 하겠습니다.

이 관계들을 바탕으로, 모든 `ActivityFeed` 인스턴스를 조회하고, 각각의 `parentable` 모델 및 이에 해당하는 하위 관계까지 eager 로딩하려면 다음과 같이 코드를 작성합니다.

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
#### Eager 로딩 시 특정 컬럼만 불러오기

모든 관계 모델의 모든 컬럼을 항상 사용할 필요는 없습니다. 이럴 때는, Eloquent에서 관계 모델의 필요한 컬럼만 지정해서 가져올 수 있습니다.

```
$books = Book::with('author:id,name,book_id')->get();
```

> [!WARNING]
> 이 기능을 사용할 때는 반드시 `id` 컬럼과, 해당 관계에 필요한 외래 키 컬럼을 컬럼 목록에 포함해야 합니다.

<a name="eager-loading-by-default"></a>
#### 기본적으로 Eager 로딩하기

특정 관계를 모델을 조회할 때마다 항상 함께 불러오길 원할 때가 있습니다. 이럴 경우, 모델에 `$with` 속성을 정의하면 됩니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    /**
     * 항상 로딩되어야 할 관계 목록입니다.
     *
     * @var array
     */
    protected $with = ['author'];

    /**
     * 책의 저자를 반환합니다.
     */
    public function author()
    {
        return $this->belongsTo(Author::class);
    }

    /**
     * 책의 장르를 반환합니다.
     */
    public function genre()
    {
        return $this->belongsTo(Genre::class);
    }
}
```

특정 쿼리에서만 `$with`에 정의된 항목을 제외하고 싶을 때는 `without` 메서드를 사용할 수 있습니다.

```
$books = Book::without('author')->get();
```

한 번의 쿼리에서 `$with` 속성에 있는 모든 관계를 재정의하려면, `withOnly` 메서드를 사용합니다.

```
$books = Book::withOnly('genre')->get();
```

<a name="constraining-eager-loads"></a>
### Eager 로딩에 조건 추가하기

관계를 eager 로딩하면서 해당 쿼리에 추가 조건을 지정하고 싶을 때가 있습니다. 이 경우, `with` 메서드에 관계명-클로저 쌍으로 이루어진 배열을 전달하면 원하는 쿼리 제약 조건을 추가할 수 있습니다.

```
use App\Models\User;

$users = User::with(['posts' => function ($query) {
    $query->where('title', 'like', '%code%');
}])->get();
```

위 예시에서는, 게시물의 `title` 컬럼에 'code'라는 단어가 포함된 게시글만 eager 로딩합니다. 다른 [쿼리 빌더](/docs/9.x/queries) 메서드도 함께 사용할 수 있습니다.

```
$users = User::with(['posts' => function ($query) {
    $query->orderBy('created_at', 'desc');
}])->get();
```

> [!WARNING]
> `limit` 및 `take` 쿼리 빌더 메서드는 eager 로딩 쿼리를 제약할 때 사용할 수 없습니다.

<a name="constraining-eager-loading-of-morph-to-relationships"></a>
#### `morphTo` 관계의 Eager 로딩 제약 조건 추가하기

`morphTo` 관계를 eager 로딩하면, Eloquent는 각 관련 모델 타입마다 별도의 쿼리를 실행합니다. 이러한 각각의 쿼리에 별도의 제약조건을 추가하고 싶다면, `MorphTo` 관계의 `constrain` 메서드를 사용할 수 있습니다.

```
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\MorphTo;

$comments = Comment::with(['commentable' => function (MorphTo $morphTo) {
    $morphTo->constrain([
        Post::class => function (Builder $query) {
            $query->whereNull('hidden_at');
        },
        Video::class => function (Builder $query) {
            $query->where('type', 'educational');
        },
    ]);
}])->get();
```

이 예시에서는, 숨겨지지 않은(Post의 `hidden_at` 컬럼이 null인) 게시글과, `type`이 'educational'인 비디오만 eager 로딩됩니다.

<a name="constraining-eager-loads-with-relationship-existence"></a>
#### 관계 존재 조건에 따른 Eager 로딩 제약

관계가 존재하는지 확인하면서 동시에 해당 관계를 같은 조건으로 eager 로딩해야 할 때도 있습니다. 예를 들어, 자식 `Post` 모델이 특정 조건을 만족하는 경우에만 해당 `User` 모델을 조회하고, 그 게시글도 eager 로딩하고 싶을 때 `withWhereHas` 메서드를 사용할 수 있습니다.

```
use App\Models\User;

$users = User::withWhereHas('posts', function ($query) {
    $query->where('featured', true);
})->get();
```

<a name="lazy-eager-loading"></a>
### Lazy Eager 로딩

경우에 따라, 부모 모델을 이미 조회한 뒤에 관계를 나중에 eager 로딩해야 할 수도 있습니다. 예를 들어, 동적으로 관련 모델을 불러올지 결정해야 하는 경우에 유용합니다.

```
use App\Models\Book;

$books = Book::all();

if ($someCondition) {
    $books->load('author', 'publisher');
}
```

이 때 조건을 추가하고 싶다면, 로딩할 관계들을 키로 하고, 각 관계에 클로저를 값으로 갖는 배열을 전달할 수 있습니다.

```
$author->load(['books' => function ($query) {
    $query->orderBy('published_date', 'asc');
}]);
```

이미 로딩된 적이 없는 관계만 불러오고 싶을 경우 `loadMissing` 메서드를 사용합니다.

```
$book->loadMissing('author');
```

<a name="nested-lazy-eager-loading-morphto"></a>
#### 중첩 Lazy Eager 로딩 & `morphTo`

`morphTo` 관계와, 그 관계가 반환하는 다양한 엔티티에 대한 하위 관계까지 한 번에 lazy eager 로딩하려면 `loadMorph` 메서드를 사용할 수 있습니다.

이 메서드는 첫 번째 인자로 `morphTo` 관계명을, 두 번째 인자로는 `[모델 => 불러올 관계 배열]`의 형태로 관계를 지정합니다. 이해를 돕기 위해 이전의 `ActivityFeed` 모델 예시를 참고하겠습니다.

```
<?php

use Illuminate\Database\Eloquent\Model;

class ActivityFeed extends Model
{
    /**
     * 해당 ActivityFeed 레코드의 상위(parent) 엔티티를 반환합니다.
     */
    public function parentable()
    {
        return $this->morphTo();
    }
}
```

앞서 설명한 모델 관계를 바탕으로, 모든 `ActivityFeed` 인스턴스를 불러오고 각각의 `parentable` 모델 및 하위 관계까지 eager 로딩하려면 다음과 같이 작성합니다.

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
### Lazy 로딩 방지하기

앞서 살펴본 것처럼, 관계를 eager 로딩하면 애플리케이션의 성능이 크게 향상될 수 있습니다. 따라서 필요하다면, 라라벨이 관계의 lazy 로딩을 항상 방지하도록 설정할 수도 있습니다. 이를 위해 Eloquent의 기본 모델 클래스가 제공하는 `preventLazyLoading` 메서드를 사용할 수 있습니다. 보통은 애플리케이션의 `AppServiceProvider` 클래스의 `boot` 메서드에서 호출하면 됩니다.

`preventLazyLoading` 메서드는 첫 번째 인자로 lazy 로딩을 방지할지 여부를 결정하는 불리언 값을 받습니다. 예를 들어, 운영(프로덕션) 환경이 아닐 때에만 lazy 로딩을 차단하도록 설정할 수 있습니다. 이렇게 하면 운영 환경에서 실수로 lazy 로딩 코드가 남아있더라도 장애가 발생하지 않습니다.

```php
use Illuminate\Database\Eloquent\Model;

/**
 * 애플리케이션 서비스 부트스트랩.
 *
 * @return void
 */
public function boot()
{
    Model::preventLazyLoading(! $this->app->isProduction());
}
```

이후 lazy 로딩을 방지하면, Eloquent가 관계를 lazy 로딩하려 하면 `Illuminate\Database\LazyLoadingViolationException` 예외를 발생시킵니다.

또한, lazy 로딩 위반 발생 시의 동작을 `handleLazyLoadingViolationsUsing` 메서드로 커스터마이즈할 수 있습니다. 예를 들어, 이 메서드를 통해 애플리케이션 동작을 멈추는 대신, violation을 로그로만 남기도록 할 수도 있습니다.

```php
Model::handleLazyLoadingViolationUsing(function ($model, $relation) {
    $class = get_class($model);

    info("Attempted to lazy load [{$relation}] on model [{$class}].");
});
```

<a name="inserting-and-updating-related-models"></a>
## 연관된 모델의 삽입 및 수정

<a name="the-save-method"></a>
### `save` 메서드

Eloquent는 관계에 새 모델을 추가하는 편리한 메서드를 제공합니다. 예를 들어, 게시물에 새 댓글을 추가해야 할 때가 있다고 해봅시다. 이때 직접 `Comment` 모델의 `post_id` 속성을 지정할 필요 없이, 관계의 `save` 메서드를 사용할 수 있습니다.

```
use App\Models\Comment;
use App\Models\Post;

$comment = new Comment(['message' => 'A new comment.']);

$post = Post::find(1);

$post->comments()->save($comment);
```

위 코드에서, 동적 속성으로서 `comments` 관계에 접근한 것이 아니라, `comments` 메서드를 호출해 관계 인스턴스를 얻었습니다. `save` 메서드는 새 `Comment` 모델에 적절한 `post_id` 값을 자동으로 채워줍니다.

여러 연관된 모델을 한 번에 저장해야 한다면 `saveMany` 메서드를 사용할 수 있습니다.

```
$post = Post::find(1);

$post->comments()->saveMany([
    new Comment(['message' => 'A new comment.']),
    new Comment(['message' => 'Another new comment.']),
]);
```

`save`와 `saveMany` 메서드는 전달한 모델 인스턴스를 영구적으로 데이터베이스에 저장하지만, 이 과정에서 부모 모델에 이미 로드된 in-memory 관계에 새로 저장된 모델이 자동으로 추가되지는 않습니다. 만약 저장 후 관계에 접근할 계획이 있다면, `refresh` 메서드로 모델과 그 관계를 다시 로드하는 것이 좋습니다.

```
$post->comments()->save($comment);

$post->refresh();

// 새로 저장된 댓글을 포함한 모든 댓글...
$post->comments;
```

<a name="the-push-method"></a>
#### 모델과 하위 관계까지 재귀적으로 저장하기

자신의 모델과, 연결된 관계까지 한 번에 모두 `save`하고 싶을 때는 `push` 메서드를 사용할 수 있습니다. 아래 예시에서는 `Post` 모델과, 그 댓글 및 각 댓글의 작성자까지 모두 저장됩니다.

```
$post = Post::find(1);

$post->comments[0]->message = 'Message';
$post->comments[0]->author->name = 'Author Name';

$post->push();
```

이벤트를 발생시키지 않고 조용히 모델과 관계를 저장하고 싶다면 `pushQuietly` 메서드를 사용할 수 있습니다.

```
$post->pushQuietly();
```

<a name="the-create-method"></a>
### `create` 메서드

`save`, `saveMany` 메서드 외에, 배열을 받아서 모델을 생성하고 데이터베이스에 바로 저장하는 `create` 메서드도 사용할 수 있습니다. `save`는 완전한 Eloquent 모델 인스턴스를 요구하는 반면, `create`는 단순 PHP 배열을 argument로 받습니다. `create`는 새로 생성한 모델을 반환합니다.

```
use App\Models\Post;

$post = Post::find(1);

$comment = $post->comments()->create([
    'message' => 'A new comment.',
]);
```

여러 연관된 모델을 한 번에 생성하려면 `createMany` 메서드를 사용할 수 있습니다.

```
$post = Post::find(1);

$post->comments()->createMany([
    ['message' => 'A new comment.'],
    ['message' => 'Another new comment.'],
]);
```

또한, `findOrNew`, `firstOrNew`, `firstOrCreate`, `updateOrCreate` 등의 메서드를 이용하여 [관계에 속한 모델을 생성 및 업데이트](/docs/9.x/eloquent#upserts)할 수도 있습니다.

> [!NOTE]
> `create` 메서드를 사용하기 전에, 반드시 [대량 할당(mass assignment)](/docs/9.x/eloquent#mass-assignment) 문서를 확인해야 합니다.

<a name="updating-belongs-to-relationships"></a>
### Belongs To 관계

자식 모델을 새 부모 모델에 연결하려면 `associate` 메서드를 사용할 수 있습니다. 예를 들어, `User` 모델이 `Account` 모델과 `belongsTo` 관계를 정의한다고 가정하고, `associate` 메서드를 통해 자식 모델의 외래 키 값을 설정합니다.

```
use App\Models\Account;

$account = Account::find(10);

$user->account()->associate($account);

$user->save();
```

자식 모델에서 부모 모델을 제거하려면 `dissociate` 메서드를 사용합니다. 이 메서드는 관계의 외래 키를 `null`로 설정합니다.

```
$user->account()->dissociate();

$user->save();
```

<a name="updating-many-to-many-relationships"></a>
### 다대다(Many To Many) 관계

<a name="attaching-detaching"></a>
#### 연결(Attaching) / 분리(Detaching)

Eloquent는 다대다 관계를 좀 더 쉽게 다룰 수 있도록 여러 메서드를 제공합니다. 예를 들어, 한 사용자가 여러 역할(role)을 가질 수 있고, 하나의 역할도 여러 사용자를 가질 수 있다고 가정합니다. 사용자를 역할에 연결하려면, 관계의 중간 테이블에 레코드를 삽입하는 `attach` 메서드를 사용합니다.

```
use App\Models\User;

$user = User::find(1);

$user->roles()->attach($roleId);
```

관계를 연결할 때, 중간 테이블에 추가로 저장해야 할 데이터가 있다면 배열로 전달할 수 있습니다.

```
$user->roles()->attach($roleId, ['expires' => $expires]);
```

때로는 사용자의 역할을 제거해야 할 필요도 있습니다. 이때는 `detach` 메서드를 사용하면 됩니다. `detach`는 관계의 중간 테이블에서 해당 레코드만 삭제하고, 두 모델은 그대로 남아있습니다.

```
// 특정 역할을 사용자에게서 분리...
$user->roles()->detach($roleId);

// 사용자의 모든 역할 분리...
$user->roles()->detach();
```

`attach`와 `detach` 메서드는 편의상 ID 배열을 인자로 받아 여러 관계를 한 번에 처리할 수도 있습니다.

```
$user = User::find(1);

$user->roles()->detach([1, 2, 3]);

$user->roles()->attach([
    1 => ['expires' => $expires],
    2 => ['expires' => $expires],
]);
```

<a name="syncing-associations"></a>
#### 관계 동기화(syncing associations)

다대다 관계를 더 쉽게 구성하려면 `sync` 메서드를 사용할 수 있습니다. 이 메서드는 중간 테이블에 포함해야 할 ID 배열을 받으며, 배열에 없는 ID는 중간 테이블에서 삭제합니다. 즉, 이 작업이 끝나면 지정한 ID들만 중간 테이블에 남게 됩니다.

```
$user->roles()->sync([1, 2, 3]);
```

ID와 함께 중간 테이블에 값을 추가로 저장하고 싶다면 다음처럼 작성할 수 있습니다.

```
$user->roles()->sync([1 => ['expires' => true], 2, 3]);
```

여러 ID에 대해 같은 중간 테이블 값을 삽입하려면 `syncWithPivotValues` 메서드를 사용할 수 있습니다.

```
$user->roles()->syncWithPivotValues([1, 2, 3], ['active' => true]);
```

이미 연결된 ID 중, 배열에 없는 걸 제거하고 싶지 않다면 `syncWithoutDetaching` 메서드를 사용할 수 있습니다.

```
$user->roles()->syncWithoutDetaching([1, 2, 3]);
```

<a name="toggling-associations"></a>
#### 관계 토글(toggling associations)

다대다 관계는 지정한 관련 모델 ID의 연결 상태를 "토글"하는 `toggle` 메서드도 제공합니다. 현재 연결되어 있으면 분리, 분리되어 있으면 연결합니다.

```
$user->roles()->toggle([1, 2, 3]);
```

ID와 함께 중간 테이블 값을 추가로 저장해야 할 땐 이렇게 사용할 수도 있습니다.

```
$user->roles()->toggle([
    1 => ['expires' => true],
    2 => ['expires' => true],
]);
```

<a name="updating-a-record-on-the-intermediate-table"></a>
#### 중간 테이블 레코드 업데이트하기

관계의 중간 테이블에 존재하는 특정 행을 업데이트해야 한다면, `updateExistingPivot` 메서드를 사용할 수 있습니다. 이 메서드는 중간 레코드의 외래 키와, 업데이트할 속성 배열을 받습니다.

```
$user = User::find(1);

$user->roles()->updateExistingPivot($roleId, [
    'active' => false,
]);
```

<a name="touching-parent-timestamps"></a>
## 부모 타임스탬프 갱신(touching)

모델이 `belongsTo` 또는 `belongsToMany` 관계를 가지고 있을 경우, 예를 들어, `Comment`가 `Post`에 속해 있다면, 자식 모델이 업데이트될 때 부모 모델의 타임스탬프도 같이 업데이트되고 싶을 때가 있습니다.

예를 들어, `Comment` 모델이 업데이트될 때 소유한 `Post`의 `updated_at` 타임스탬프를 현재 시각으로 자동 갱신하고 싶을 경우, 자식 모델에 `touches` 속성을 추가하여, 해당 모델이 업데이트될 때 같이 `updated_at` 타임스탬프를 갱신할 관계명을 지정하면 됩니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    /**
     * 갱신해야 할 관계들의 목록입니다.
     *
     * @var array
     */
    protected $touches = ['post'];

    /**
     * 댓글이 소속된 게시글을 반환합니다.
     */
    public function post()
    {
        return $this->belongsTo(Post::class);
    }
}
```

> [!WARNING]
> 부모 모델의 타임스탬프는 자식 모델을 Eloquent의 `save` 메서드로 업데이트 할 때만 갱신됩니다.