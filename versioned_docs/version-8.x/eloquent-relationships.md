# Eloquent: 연관관계 (Eloquent: Relationships)

- [소개](#introduction)
- [연관관계 정의하기](#defining-relationships)
    - [일대일(One To One)](#one-to-one)
    - [일대다(One To Many)](#one-to-many)
    - [일대다(역방향) / Belongs To](#one-to-many-inverse)
    - [Has One Of Many](#has-one-of-many)
    - [Has One Through](#has-one-through)
    - [Has Many Through](#has-many-through)
- [다대다 연관관계](#many-to-many)
    - [중간 테이블 컬럼 조회](#retrieving-intermediate-table-columns)
    - [중간 테이블 컬럼을 통한 쿼리 필터링](#filtering-queries-via-intermediate-table-columns)
    - [커스텀 중간 테이블 모델 정의](#defining-custom-intermediate-table-models)
- [다형성 연관관계](#polymorphic-relationships)
    - [일대일](#one-to-one-polymorphic-relations)
    - [일대다](#one-to-many-polymorphic-relations)
    - [One Of Many](#one-of-many-polymorphic-relations)
    - [다대다](#many-to-many-polymorphic-relations)
    - [커스텀 다형성 타입](#custom-polymorphic-types)
- [동적 연관관계](#dynamic-relationships)
- [연관 데이터 쿼리](#querying-relations)
    - [연관관계 메서드 vs. 동적 속성](#relationship-methods-vs-dynamic-properties)
    - [연관 데이터 존재 여부 쿼리](#querying-relationship-existence)
    - [연관 데이터 부재 쿼리](#querying-relationship-absence)
    - [Morph To 연관 쿼리](#querying-morph-to-relationships)
- [연관된 모델 집계](#aggregating-related-models)
    - [연관된 모델 개수 세기](#counting-related-models)
    - [기타 집계 함수](#other-aggregate-functions)
    - [Morph To 연관에서 연관 모델 개수 세기](#counting-related-models-on-morph-to-relationships)
- [즉시 로딩(Eager Loading)](#eager-loading)
    - [즉시 로딩에 조건 추가](#constraining-eager-loads)
    - [지연 즉시 로딩(Lazy Eager Loading)](#lazy-eager-loading)
    - [지연 로딩 방지](#preventing-lazy-loading)
- [연관된 모델 저장 및 업데이트](#inserting-and-updating-related-models)
    - [`save` 메서드](#the-save-method)
    - [`create` 메서드](#the-create-method)
    - [Belongs To 연관관계](#updating-belongs-to-relationships)
    - [다대다 연관관계](#updating-many-to-many-relationships)
- [상위 타임스탬프 갱신(Touching Parent Timestamps)](#touching-parent-timestamps)

<a name="introduction"></a>
## 소개

데이터베이스 테이블은 서로 연관되어 있는 경우가 많습니다. 예를 들어, 하나의 블로그 게시물에는 여러 개의 댓글이 달릴 수 있고, 주문 정보는 주문을 생성한 사용자와 연결될 수 있습니다. Eloquent를 사용하면 이러한 연관관계를 아주 쉽고 편리하게 다룰 수 있으며, 아래와 같은 다양한 일반적인 연관관계를 지원합니다.

<div class="content-list" markdown="1">

- [일대일(One To One)](#one-to-one)
- [일대다(One To Many)](#one-to-many)
- [다대다(Many To Many)](#many-to-many)
- [Has One Through](#has-one-through)
- [Has Many Through](#has-many-through)
- [일대일 다형성(One To One (Polymorphic))](#one-to-one-polymorphic-relations)
- [일대다 다형성(One To Many (Polymorphic))](#one-to-many-polymorphic-relations)
- [다대다 다형성(Many To Many (Polymorphic))](#many-to-many-polymorphic-relations)

</div>

<a name="defining-relationships"></a>
## 연관관계 정의하기

Eloquent에서 연관관계는 Eloquent 모델 클래스의 메서드로 정의합니다. 연관관계 또한 강력한 [쿼리 빌더](/docs/8.x/queries)의 역할을 하므로, 메서드로 정의하면 메서드 체이닝과 편리한 쿼리 작성이 가능합니다. 예를 들어, 아래와 같이 `posts` 연관관계에 추가로 쿼리 조건을 연결할 수 있습니다.

```
$user->posts()->where('active', 1)->get();
```

하지만 본격적으로 연관관계를 활용하기 전에, Eloquent에서 지원하는 각 연관관계 유형을 어떻게 정의하는지부터 살펴보겠습니다.

<a name="one-to-one"></a>
### 일대일(One To One)

일대일 연관관계는 가장 기본적인 데이터베이스 연관관계입니다. 예를 들어, `User` 모델이 `Phone` 모델 하나와 연결되어 있을 수 있습니다. 이 연관관계를 정의하려면, `User` 모델에 `phone`이라는 메서드를 추가해서, 해당 메서드에서 `hasOne` 메서드를 호출한 결과값을 반환하면 됩니다. `hasOne` 메서드는 모델의 기본 클래스인 `Illuminate\Database\Eloquent\Model`을 통해 제공됩니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 사용자와 연결된 전화번호를 가져옵니다.
     */
    public function phone()
    {
        return $this->hasOne(Phone::class);
    }
}
```

`hasOne` 메서드의 첫 번째 인자는 연관된 모델의 클래스명을 전달합니다. 연관관계를 정의하면, Eloquent의 동적 속성을 사용하여 관련된 레코드를 조회할 수 있습니다. 동적 속성을 사용하면 마치 모델에 정의된 일반 속성처럼 연관관계 메서드에 접근할 수 있습니다.

```
$phone = User::find(1)->phone;
```

Eloquent는 부모 모델명을 기준으로 연관된 테이블의 외래 키(foreign key)명을 자동으로 결정합니다. 위 예시에서는 `Phone` 모델이 기본적으로 `user_id` 외래키를 가진 것으로 간주합니다. 만약 이 규칙을 변경하고 싶다면, `hasOne` 메서드의 두 번째 인자로 원하는 외래 키명을 전달하면 됩니다.

```
return $this->hasOne(Phone::class, 'foreign_key');
```

또한 Eloquent는 외래 키에 저장된 값이 부모 모델의 기본키(primary key) 컬럼 값과 일치한다고 가정합니다. 즉, Eloquent는 `Phone` 레코드의 `user_id` 컬럼에서 사용자의 `id` 컬럼 값을 찾아줍니다. 만약 `id`가 아닌 다른 컬럼을 기본키로 사용하고 싶거나, 모델의 `$primaryKey` 속성 외의 값을 사용하고 싶다면, 세 번째 인자로 로컬 키(local key)를 명시하면 됩니다.

```
return $this->hasOne(Phone::class, 'foreign_key', 'local_key');
```

<a name="one-to-one-defining-the-inverse-of-the-relationship"></a>
#### 연관관계의 역방향 정의하기

이제 `User` 모델에서 `Phone` 모델을 참조할 수 있습니다. 이번에는 `Phone` 모델에서 해당 폰의 주인인 사용자를 참조할 수 있도록 연관관계를 정의해보겠습니다. `hasOne`의 반대 관계인 역방향 연관관계는 `belongsTo` 메서드를 사용하여 정의합니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Phone extends Model
{
    /**
     * 이 전화번호의 소유자인 사용자를 반환합니다.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
```

`user` 메서드를 호출하면, Eloquent는 `Phone` 모델의 `user_id` 컬럼 값과 일치하는 `id`를 가진 `User` 모델을 찾아 연결해줍니다.

Eloquent는 연관관계 메서드명을 분석하여 외래 키명을 정합니다. 일반적으로 메서드명에 `_id`를 붙여서 외래키 컬럼을 예상합니다. 즉, 위 예시에서는 Eloquent가 `Phone` 모델에 `user_id` 컬럼이 있다고 간주합니다. 만약 외래키가 `user_id`가 아니라면, 두 번째 인자로 외래 키명을 직접 지정할 수 있습니다.

```
/**
 * 이 전화번호의 소유자인 사용자를 반환합니다.
 */
public function user()
{
    return $this->belongsTo(User::class, 'foreign_key');
}
```

부모 모델이 `id` 이외의 컬럼을 기본키로 사용하거나, 연관 모델을 다른 컬럼 기준으로 찾고 싶을 때는, 세 번째 인자로 부모 테이블의 기본키 컬럼명을 지정할 수 있습니다.

```
/**
 * 이 전화번호의 소유자인 사용자를 반환합니다.
 */
public function user()
{
    return $this->belongsTo(User::class, 'foreign_key', 'owner_key');
}
```

<a name="one-to-many"></a>
### 일대다(One To Many)

일대다 연관관계는 하나의 모델(부모)이 여러 하위 모델(자식)과 관계맺을 때 사용합니다. 예를 들어, 하나의 게시글에는 무한정 많은 댓글이 달릴 수 있습니다. 다른 Eloquent 연관관계와 마찬가지로, 일대다 관계도 모델에 메서드를 정의하는 방식으로 만들 수 있습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    /**
     * 이 게시글에 달린 댓글들을 반환합니다.
     */
    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
}
```

Eloquent는 `Comment` 모델의 외래키 컬럼명을 자동으로 결정합니다. 기본적으로, 부모 모델 이름을 스네이크 케이스(snake case) 변환 후 `_id`를 붙인 컬럼이 외래키로 사용됩니다. 이 예시라면 `Comment` 모델의 외래키 컬럼은 `post_id`가 됩니다.

연관관계 메서드를 정의한 후에는, [컬렉션](/docs/8.x/eloquent-collections) 형태로 관련 댓글들을 쉽게 조회할 수 있습니다. Eloquent의 "동적 연관 속성" 덕분에, 마치 속성처럼 연관관계 메서드에 접근할 수 있습니다.

```
use App\Models\Post;

$comments = Post::find(1)->comments;

foreach ($comments as $comment) {
    //
}
```

모든 연관관계는 쿼리 빌더 역할을 함께 하므로, 메서드 체이닝을 통해 추가 조건을 연결한 쿼리도 작성할 수 있습니다.

```
$comment = Post::find(1)->comments()
                    ->where('title', 'foo')
                    ->first();
```

`hasOne` 메서드와 마찬가지로, `hasMany`에도 외래키와 로컬키를 추가 인자로 전달하여 기본 키 규칙을 재정의할 수 있습니다.

```
return $this->hasMany(Comment::class, 'foreign_key');

return $this->hasMany(Comment::class, 'foreign_key', 'local_key');
```

<a name="one-to-many-inverse"></a>
### 일대다(역방향) / Belongs To

이제 게시글의 댓글을 모두 조회할 수 있게 되었으니, 댓글에서 상위 게시글(부모)을 참조하는 연관관계도 만들어보겠습니다. `hasMany`의 반대로, 자식 모델에서 부모 모델을 바라보게 하려면 `belongsTo` 메서드를 이용해 연관관계 메서드를 정의하면 됩니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    /**
     * 이 댓글이 달린 게시글을 반환합니다.
     */
    public function post()
    {
        return $this->belongsTo(Post::class);
    }
}
```

이제 연관관계가 정의되었으니, 댓글 인스턴스에서 부모 게시글을 다음과 같이 동적 속성(dynamc property)으로 접근할 수 있습니다.

```
use App\Models\Comment;

$comment = Comment::find(1);

return $comment->post->title;
```

위 예시에서 Eloquent는 `Comment` 모델의 `post_id` 컬럼 값과 일치하는 `id`를 가진 `Post` 모델을 찾아 연결합니다.

Eloquent는 연관관계 메서드명을 기준으로, `_`와 부모 모델의 기본키 컬럼명을 조합해 외래키 컬럼명을 정합니다. 이 예시에서는 `comments` 테이블의 외래키가 `post_id`로 간주됩니다.

하지만, 연관관계의 외래키 이름이 이 규칙을 따르지 않는 경우라면 `belongsTo` 메서드의 두 번째 인자로 직접 외래키 이름을 지정할 수 있습니다.

```
/**
 * 이 댓글이 달린 게시글을 반환합니다.
 */
public function post()
{
    return $this->belongsTo(Post::class, 'foreign_key');
}
```

마찬가지로 부모 모델이 `id`가 아닌 다른 컬럼을 기본키로 사용하거나, 연관 모델을 다른 기준 컬럼으로 찾고 싶다면 세 번째 인자로 지정할 수 있습니다.

```
/**
 * 이 댓글이 달린 게시글을 반환합니다.
 */
public function post()
{
    return $this->belongsTo(Post::class, 'foreign_key', 'owner_key');
}
```

<a name="default-models"></a>
#### 기본(Default) 모델 반환

`belongsTo`, `hasOne`, `hasOneThrough`, `morphOne` 연관관계에서는 해당 관계가 `null`일 때 반환할 기본 모델을 정의할 수 있습니다. 이 패턴은 흔히 [널 객체 패턴(Null Object pattern)](https://en.wikipedia.org/wiki/Null_Object_pattern)이라 불리며, 코드에서 조건문 검사를 줄이는 데 도움이 됩니다. 아래 예시에서는 `Post` 모델이 `user` 모델과 연결되어 있지 않더라도, 빈 `App\Models\User` 모델이 반환됩니다.

```
/**
 * 게시글의 작성자를 반환합니다.
 */
public function user()
{
    return $this->belongsTo(User::class)->withDefault();
}
```

기본 모델을 특정 속성값으로 채우고 싶을 때는, `withDefault` 메서드에 배열이나 클로저를 전달할 수 있습니다.

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
#### Belongs To 연관관계 쿼리하기

"Belongs To" 관계의 하위 모델을 쿼리할 때, 조건을 직접 지정해서 Eloquent 모델을 조회할 수 있습니다.

```
use App\Models\Post;

$posts = Post::where('user_id', $user->id)->get();
```

하지만 이보다 더 편리하게, `whereBelongsTo` 메서드를 사용하면 모델과 연관된 관계 및 외래키를 자동으로 판단하여 쿼리를 만들어줍니다.

```
$posts = Post::whereBelongsTo($user)->get();
```

기본적으로 Laravel은 전달된 모델의 클래스명을 기준으로 연관관계를 찾아줍니다. 하지만, 연관관계명을 직접 지정할 수도 있으며, 이 경우 두 번째 인자로 명칭을 넘기면 됩니다.

```
$posts = Post::whereBelongsTo($user, 'author')->get();
```

<a name="has-one-of-many"></a>
### Has One Of Many

어떤 모델이 여러 연관 모델을 가질 때, 그 중에서 "가장 최근" 혹은 "가장 오래된" 한 개의 연관 모델을 편리하게 가져오고 싶을 때가 있습니다. 예를 들어, `User` 모델은 여러 개의 `Order`와 관계가 있지만, 가장 최근 주문만 간편하게 조회하고 싶을 수 있습니다. 이럴 때는 `hasOne`과 `ofMany` 메서드를 조합해서 사용하면 됩니다.

```php
/**
 * 사용자의 가장 최근 주문을 반환합니다.
 */
public function latestOrder()
{
    return $this->hasOne(Order::class)->latestOfMany();
}
```

마찬가지로, "가장 오래된" 즉, 가장 먼저 생성된 연관 모델도 아래와 같이 가져올 수 있습니다.

```php
/**
 * 사용자의 가장 오래된 주문을 반환합니다.
 */
public function oldestOrder()
{
    return $this->hasOne(Order::class)->oldestOfMany();
}
```

기본적으로 `latestOfMany`와 `oldestOfMany`는 모델의 기본키(primary key)를 오름차순 또는 내림차순으로 정렬해 가장 최근 혹은 가장 오래된 레코드를 반환합니다. (기본키는 정렬이 가능한 값이어야 합니다.) 하지만 때로는 다른 컬럼을 기준으로 특정 모델을 선택해야 할 수도 있습니다.

예를 들어, `ofMany` 메서드를 활용해 사용자의 가장 비싼 주문을 조회할 수도 있습니다. `ofMany`의 첫 번째 인자로 정렬에 사용할 컬럼명을, 두 번째 인자로 적용할 집계 함수(`min` 또는 `max`)를 지정합니다.

```php
/**
 * 사용자의 가장 비싼 주문을 반환합니다.
 */
public function largestOrder()
{
    return $this->hasOne(Order::class)->ofMany('price', 'max');
}
```

> [!NOTE]
> PostgreSQL은 UUID 컬럼에 대해 `MAX` 함수를 지원하지 않으므로, PostgreSQL UUID 컬럼과 one-of-many 관계를 조합해서는 사용할 수 없습니다.

<a name="advanced-has-one-of-many-relationships"></a>
#### 고급 Has One Of Many 연관관계

더 복잡한 "has one of many" 연관관계도 만들 수 있습니다. 예를 들어, `Product` 모델이 여러 개의 `Price` 모델과 관계를 맺고 있고, 새로운 가격 정보가 미리 등록되어 미래의 특정 시점부터 적용될 수 있다고 해보겠습니다. 이때는 `published_at` 컬럼을 활용해 미래가 아닌, 이미 퍼블리싱된 최신 가격만 조회해야 합니다. 또한, 같은 퍼블리시 날짜라면 id값이 가장 큰 가격을 우선시한다고 가정합시다.

이렇게 여러 기준을 활용하려면, `ofMany`에 정렬 컬럼과 집계 함수를 배열로 전달하고, 추가 조건은 두 번째 인자에 클로저로 담아 정의하면 됩니다.

```php
/**
 * 이 상품의 현재 가격 정보를 반환합니다.
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

"has-one-through" 관계는 최종적으로 한 개의 다른 모델과 일대일 관계를 맺지만, 그 사이에 중간 모델을 한 번 거쳐야 할 때 사용합니다.

예를 들어, 자동차 수리소 애플리케이션에서 `Mechanic` 모델과 `Car` 모델이 1:1 관계이고, `Car`와 `Owner` 모델도 1:1 관계라고 해봅시다. 이 경우 정비공과 차의 소유주는 DB상 직접적인 관계가 없지만, 정비공은 `Car` 모델을 통해 소유주 모델에 접근할 수 있습니다. 관련 테이블 구조는 아래와 같습니다.

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

테이블 구조를 살펴봤으니, 이제 `Mechanic` 모델에 관계를 정의해봅시다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mechanic extends Model
{
    /**
     * 정비하는 자동차의 소유주를 반환합니다.
     */
    public function carOwner()
    {
        return $this->hasOneThrough(Owner::class, Car::class);
    }
}
```

`hasOneThrough`의 첫 번째 인자는 최종적으로 접근할 모델, 두 번째 인자는 중간에 거치는 모델의 클래스명을 전달합니다.

<a name="has-one-through-key-conventions"></a>
#### 키 네이밍 규칙

기본적으로 Eloquent는 외래키 명명 규칙을 활용해 쿼리를 작성합니다. 만약 관계에 사용할 키를 직접 커스터마이징하고 싶다면, `hasOneThrough` 메서드의 세 번째와 네 번째 인자로 키명을 넘기면 됩니다. 세 번째 인자는 중간 모델(예: cars)의 외래키, 네 번째 인자는 최종 모델(owners)의 외래키, 다섯 번째 인자는 mechanics 테이블의 로컬키, 여섯 번째 인자는 cars 테이블의 로컬키입니다.

```
class Mechanic extends Model
{
    /**
     * 정비하는 자동차의 소유주를 반환합니다.
     */
    public function carOwner()
    {
        return $this->hasOneThrough(
            Owner::class,
            Car::class,
            'mechanic_id', // cars 테이블의 외래키...
            'car_id', // owners 테이블의 외래키...
            'id', // mechanics 테이블의 로컬키...
            'id' // cars 테이블의 로컬키...
        );
    }
}
```

<a name="has-many-through"></a>
### Has Many Through

"has-many-through" 관계는 중간 모델을 통해 먼 거리의 연관 데이터를 간편하게 액세스할 수 있게 해줍니다. 예를 들어, [Laravel Vapor](https://vapor.laravel.com)와 같은 배포 플랫폼을 만든다고 가정합니다. `Project` 모델에서 중간에 있는 `Environment` 모델을 거쳐, 여러 개의 `Deployment` 모델을 연결해야 할 수 있습니다. 아래와 같은 테이블 구조가 필요합니다.

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

이제 테이블 구조를 살펴봤으니, `Project` 모델에서 연관관계를 아래와 같이 정의할 수 있습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    /**
     * 이 프로젝트의 모든 배포를 반환합니다.
     */
    public function deployments()
    {
        return $this->hasManyThrough(Deployment::class, Environment::class);
    }
}
```

첫 번째 인자로 최종적으로 접근할 모델명을, 두 번째 인자로 중간 모델명을 전달합니다.

`Deployment` 모델의 테이블에는 `project_id` 컬럼이 존재하지 않지만, `hasManyThrough` 관계를 활용하면 `$project->deployments`로 해당 프로젝트의 모든 배포를 손쉽게 조회할 수 있습니다. 이를 위해 Eloquent는 `Environment` 모델의 `project_id` 컬럼을 활용해 관련 환경들의 id를 찾고, 이 id들을 기준으로 `Deployment` 데이터를 조회합니다.

<a name="has-many-through-key-conventions"></a>
#### 키 네이밍 규칙

Eloquent의 기본 외래키 네이밍 규칙이 여기서도 사용됩니다. 만약 직접 키를 지정하고 싶다면, `hasManyThrough` 메서드의 세 번째, 네 번째 인자를 사용하세요. 세 번째 인자는 중간 모델(environments)의 외래키, 네 번째 인자는 최종 모델(deployments)의 외래키, 다섯 번째 인자는 projects 테이블의 로컬키, 여섯 번째 인자는 environments 테이블의 로컬키입니다.

```
class Project extends Model
{
    public function deployments()
    {
        return $this->hasManyThrough(
            Deployment::class,
            Environment::class,
            'project_id', // environments 테이블의 외래키...
            'environment_id', // deployments 테이블의 외래키...
            'id', // projects 테이블의 로컬키...
            'id' // environments 테이블의 로컬키...
        );
    }
}
```

<a name="many-to-many"></a>
## 다대다 연관관계

다대다(many-to-many) 관계는 `hasOne`이나 `hasMany`에 비해 다소 복잡할 수 있습니다. 대표적인 예로 사용자가 여러 역할(role)을 가질 수 있고, 그 역할이 여러 사용자에게 공유되는 경우를 들 수 있습니다. 예를 들어 어떤 사용자는 "Author"와 "Editor" 역할을 가질 수 있지만, 이 역할은 다른 사용자에도 할당될 수 있습니다. 즉, 한 사용자가 여러 역할을 가질 수 있고, 한 역할도 여러 사용자와 연관될 수 있습니다.

<a name="many-to-many-table-structure"></a>
#### 테이블 구조

이 관계를 정의하려면 세 개의 데이터베이스 테이블이 필요합니다: `users`, `roles`, 그리고 `role_user`입니다. `role_user` 테이블은 연관 모델 이름을 알파벳순으로 조합한 이름이며, `user_id`와 `role_id` 컬럼을 포함합니다. 이 테이블은 사용자와 역할을 연결해주는 중간 역할을 합니다.

한 역할이 여러 사용자와 연결될 수 있으므로, `roles` 테이블에 단순히 `user_id` 컬럼을 추가할 수는 없습니다. 그럴 경우 하나의 역할이 한 명의 사용자와만 연결될 수 있기 때문입니다. 여러 사용자가 역할을 공유할 수 있도록 하기 위해 별도의 중간 테이블(`role_user`)이 필요합니다. 테이블 구조를 정리하면 아래와 같습니다.

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

다대다(many-to-many) 연관관계는 `belongsToMany` 메서드의 반환값을 리턴하는 메서드를 작성하여 정의합니다. `belongsToMany` 메서드는 애플리케이션의 모든 Eloquent 모델이 상속받는 `Illuminate\Database\Eloquent\Model` 기본 클래스에서 제공됩니다. 예를 들어, `User` 모델에 `roles` 메서드를 정의해보겠습니다. 이 메서드의 첫 번째 인수에는 연관된 모델 클래스명을 전달합니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 사용자에 속한 역할 목록을 가져옵니다.
     */
    public function roles()
    {
        return $this->belongsToMany(Role::class);
    }
}
```

이렇게 연관관계를 정의한 후에는, `roles`라는 동적 연관관계 프로퍼티를 통해 사용자의 역할 목록을 조회할 수 있습니다.

```
use App\Models\User;

$user = User::find(1);

foreach ($user->roles as $role) {
    //
}
```

모든 연관관계 메서드는 쿼리 빌더 역할도 하기 때문에, `roles` 메서드를 호출하고 이어서 조건을 체이닝하여 연관관계에 추가적인 제한을 걸 수 있습니다.

```
$roles = User::find(1)->roles()->orderBy('name')->get();
```

연관관계를 위한 중간 테이블의 이름을 결정할 때, Eloquent는 두 모델의 이름을 알파벳순으로 결합해 생성합니다. 그러나 이 방식은 자유롭게 재정의할 수 있습니다. 중간 테이블명을 직접 지정하려면, `belongsToMany` 메서드의 두 번째 인수로 테이블명을 전달하면 됩니다.

```
return $this->belongsToMany(Role::class, 'role_user');
```

중간 테이블의 이름뿐만 아니라, 테이블 내에서 사용할 외래 키의 컬럼명도 추가 인수를 전달하여 커스터마이즈할 수 있습니다. 세 번째 인수는 현재 연관관계를 정의하고 있는 모델의 외래 키 컬럼명이고, 네 번째 인수는 조인하려는 모델의 외래 키 컬럼명입니다.

```
return $this->belongsToMany(Role::class, 'role_user', 'user_id', 'role_id');
```

<a name="many-to-many-defining-the-inverse-of-the-relationship"></a>
#### 연관관계의 반대편(Inverse) 정의하기

다대다 연관관계의 "반대편"을 정의하려면, 연관된 모델에 역시 `belongsToMany` 메서드의 반환값을 리턴하는 메서드를 정의하면 됩니다. 사용자/역할 예제를 완성해보면, 이번에는 `Role` 모델에 `users` 메서드를 정의할 수 있습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    /**
     * 역할에 속한 사용자 목록을 가져옵니다.
     */
    public function users()
    {
        return $this->belongsToMany(User::class);
    }
}
```

보시다시피, 연관관계는 기본적으로 `User` 모델에서 정의한 방식과 거의 동일하지만, 참조하는 모델만 `App\Models\User`로 다릅니다. 동일하게 `belongsToMany` 메서드를 활용하기 때문에, 다대다 연관관계의 "반대편"을 정의할 때도 테이블과 키를 커스터마이즈할 수 있는 모든 옵션을 사용할 수 있습니다.

<a name="retrieving-intermediate-table-columns"></a>
### 중간 테이블 컬럼 값 조회하기

이미 배운 것처럼, 다대다 연결을 다루려면 중간 테이블이 필요합니다. Eloquent는 이 중간 테이블과 쉽게 상호작용할 수 있는 다양한 방법을 제공합니다. 예를 들어, `User` 모델이 여러 `Role` 모델과 연관되어 있다고 가정해 보겠습니다. 연관관계를 조회한 후에는, 모델의 `pivot` 속성을 이용해 중간 테이블의 데이터를 접근할 수 있습니다.

```
use App\Models\User;

$user = User::find(1);

foreach ($user->roles as $role) {
    echo $role->pivot->created_at;
}
```

각 `Role` 모델에는 자동으로 `pivot` 속성이 할당됩니다. 이 속성에는 중간 테이블을 대표하는 모델 인스턴스가 담깁니다.

기본적으로 `pivot` 모델에는 두 관련 모델의 키만 포함됩니다. 만약 중간 테이블에 추가적인 컬럼이 있다면, 연관관계를 정의할 때 해당 컬럼명을 `withPivot` 메서드로 명시적으로 지정해야 합니다.

```
return $this->belongsToMany(Role::class)->withPivot('active', 'created_by');
```

Eloquent가 중간 테이블의 `created_at` 및 `updated_at` 타임스탬프를 자동으로 관리하게 하고 싶다면, 연관관계를 정의할 때 `withTimestamps` 메서드를 호출하면 됩니다.

```
return $this->belongsToMany(Role::class)->withTimestamps();
```

> [!NOTE]
> Eloquent의 자동화된 타임스탬프를 사용하는 중간 테이블에는 반드시 `created_at`과 `updated_at` 컬럼이 모두 존재해야 합니다.

<a name="customizing-the-pivot-attribute-name"></a>
#### `pivot` 속성명 커스터마이징

앞서 설명했듯이, 중간 테이블의 컬럼 값은 모델의 `pivot` 속성을 통해 접근할 수 있습니다. 하지만 애플리케이션의 용도에 맞게 이 속성명을 좀 더 의미 있게 변경할 수 있습니다.

예를 들어, 사용자가 팟캐스트를 구독할 수 있는 시스템이라면 사용자와 팟캐스트는 다대다 관계를 갖습니다. 이런 경우, `pivot` 대신 `subscription` 같은 이름으로 중간 테이블 속성명을 변경하고 싶을 수 있습니다. 이럴 때는 연관관계 정의 시 `as` 메서드를 사용하면 됩니다.

```
return $this->belongsToMany(Podcast::class)
                ->as('subscription')
                ->withTimestamps();
```

이렇게 중간 테이블 속성명을 커스터마이즈한 이후에는, 해당 이름으로 중간 테이블 데이터를 접근할 수 있습니다.

```
$users = User::with('podcasts')->get();

foreach ($users->flatMap->podcasts as $podcast) {
    echo $podcast->subscription->created_at;
}
```

<a name="filtering-queries-via-intermediate-table-columns"></a>
### 중간 테이블 컬럼을 이용한 쿼리 필터링

`wherePivot`, `wherePivotIn`, `wherePivotNotIn`, `wherePivotBetween`, `wherePivotNotBetween`, `wherePivotNull`, `wherePivotNotNull` 등의 메서드를 사용하면, `belongsToMany` 연관관계 쿼리 결과를 중간 테이블의 컬럼값을 기준으로 필터링할 수 있습니다.

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

<a name="defining-custom-intermediate-table-models"></a>
### 커스텀 중간 테이블 모델 정의하기

다대다 연관관계의 중간 테이블을 표현하는 커스텀 모델을 정의하고 싶다면, 연관관계 정의 시 `using` 메서드를 사용하면 됩니다. 커스텀 피벗(pivot) 모델을 활용하면, 피벗 모델에 추가적인 메서드도 정의할 수 있습니다.

커스텀 다대다 피벗 모델은 반드시 `Illuminate\Database\Eloquent\Relations\Pivot` 클래스를 상속해야 하고, 커스텀 다형 다대다 피벗 모델은 `Illuminate\Database\Eloquent\Relations\MorphPivot` 클래스를 상속해야 합니다. 예를 들어, `Role` 모델에서 커스텀 `RoleUser` 피벗 모델을 사용하는 코드는 다음과 같습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    /**
     * 역할에 속한 사용자 목록을 가져옵니다.
     */
    public function users()
    {
        return $this->belongsToMany(User::class)->using(RoleUser::class);
    }
}
```

`RoleUser` 모델을 정의할 때는 `Illuminate\Database\Eloquent\Relations\Pivot` 클래스를 상속해야 합니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class RoleUser extends Pivot
{
    //
}
```

> [!NOTE]
> 피벗 모델에는 `SoftDeletes` 트레이트를 사용할 수 없습니다. 피벗 레코드에 소프트 삭제 기능이 필요하다면 피벗 모델 대신 실제 Eloquent 모델로 전환하는 방식을 고려하세요.

<a name="custom-pivot-models-and-incrementing-ids"></a>
#### 커스텀 피벗 모델과 자동 증가 ID

만약 커스텀 피벗 모델에서 자동 증가(primary key auto-increment)되는 ID 컬럼을 사용한다면, 해당 모델 클래스 내에 `incrementing` 속성을 반드시 `true`로 지정해야 합니다.

```
/**
 * ID가 자동 증가하는지 여부를 지정합니다.
 *
 * @var bool
 */
public $incrementing = true;
```

<a name="polymorphic-relationships"></a>
## 다형적(Polymorphic) 관계

다형적(polymorphic) 관계란 하나의 자식 모델이 단일 연관관계를 통해 여러 종류의 다른 모델에 속할 수 있도록 하는 방식입니다. 예를 들어, 사용자가 블로그 글과 영상을 공유하는 애플리케이션을 만든다고 가정해 봅시다. 이때 `Comment` 모델은 `Post`와 `Video` 모델 모두와 관계를 맺을 수 있습니다.

<a name="one-to-one-polymorphic-relations"></a>
### 일대일(One To One) 다형적(Polymorphic) 관계

<a name="one-to-one-polymorphic-table-structure"></a>
#### 테이블 구조

일대일 다형적 관계는 일반적인 일대일 관계와 비슷하지만, 자식 모델이 단일 연관관계를 통해 다양한 종류의 부모 모델에 속할 수 있다는 점이 다릅니다. 예를 들어, 블로그 `Post`와 `User`가 하나의 `Image` 모델과 다형적 관계를 맺을 수 있습니다. 일대일 다형적 관계를 활용하면, 여러 게시글이나 사용자가 고유한 이미지들을 한 테이블에서 공유하면서 관리할 수 있습니다. 테이블 구조 예시는 다음과 같습니다.

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

`images` 테이블의 `imageable_id`와 `imageable_type` 컬럼을 주목하세요. `imageable_id`에는 해당 이미지의 부모가 되는 게시글 또는 사용자의 ID가 저장되고, `imageable_type`에는 부모 모델의 클래스명이 저장됩니다. 이 `imageable_type` 컬럼이 Eloquent에서 어떤 "종류"의 부모 모델을 반환해야 하는지 결정하는 데 사용됩니다. 이 경우, 컬럼 값은 `App\Models\Post` 또는 `App\Models\User`가 됩니다.

<a name="one-to-one-polymorphic-model-structure"></a>
#### 모델 구조

이 연관관계를 구축하기 위해 필요한 모델 정의는 다음과 같습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Image extends Model
{
    /**
     * 부모 imageable(사용자 또는 게시글) 모델을 가져옵니다.
     */
    public function imageable()
    {
        return $this->morphTo();
    }
}

class Post extends Model
{
    /**
     * 게시글의 이미지를 가져옵니다.
     */
    public function image()
    {
        return $this->morphOne(Image::class, 'imageable');
    }
}

class User extends Model
{
    /**
     * 사용자의 이미지를 가져옵니다.
     */
    public function image()
    {
        return $this->morphOne(Image::class, 'imageable');
    }
}
```

<a name="one-to-one-polymorphic-retrieving-the-relationship"></a>
#### 연관관계 조회하기

데이터베이스 테이블과 모델이 준비되었다면, 이제 모델에서 연관관계를 직접 활용할 수 있습니다. 예를 들어, 게시글에 연관된 이미지를 조회하려면 `image`라는 동적 연관관계 프로퍼티를 사용할 수 있습니다.

```
use App\Models\Post;

$post = Post::find(1);

$image = $post->image;
```

다형적 모델의 부모를 조회하려면, `morphTo`를 호출하는 메서드명을 동적 연관관계 프로퍼티로 접근하면 됩니다. 여기서는 `Image` 모델의 `imageable` 메서드가 해당 역할을 하므로, 아래처럼 사용합니다.

```
use App\Models\Image;

$image = Image::find(1);

$imageable = $image->imageable;
```

`Image` 모델의 `imageable` 연관관계는 실제 이미지를 소유한 모델이 `Post`인지 `User`인지에 따라 각각의 인스턴스를 반환합니다.

<a name="morph-one-to-one-key-conventions"></a>
#### 키 컬럼 관례 설정

필요하다면, 다형적 자식 모델에 사용되는 "id"와 "type" 컬럼의 이름을 직접 지정할 수도 있습니다. 이때는 반드시 `morphTo` 메서드의 첫 번째 인수로 연관관계명을 전달해야 합니다. 보통 이 값은 메서드명과 일치해야 하므로, PHP의 `__FUNCTION__` 상수를 활용할 수 있습니다.

```
/**
 * 이미지가 속한 모델을 가져옵니다.
 */
public function imageable()
{
    return $this->morphTo(__FUNCTION__, 'imageable_type', 'imageable_id');
}
```

<a name="one-to-many-polymorphic-relations"></a>
### 일대다(One To Many) 다형적(Polymorphic) 관계

<a name="one-to-many-polymorphic-table-structure"></a>
#### 테이블 구조

일대다 다형적 관계는 기본적인 일대다 관계와 비슷하지만, 자식 모델이 하나의 연관관계를 통해 여러 종류의 부모 모델에 속할 수 있습니다. 예를 들어, 애플리케이션의 사용자들이 '게시글'과 '비디오'에 모두 "댓글"을 남길 수 있다고 가정해 보겠습니다. 다형적 관계를 활용하면, 하나의 `comments` 테이블에서 게시글과 비디오의 모든 댓글을 저장할 수 있습니다. 아래는 필요한 테이블 구조 예시입니다.

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

이 연관관계를 구축하기 위한 모델 정의는 다음과 같습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    /**
     * 부모 commentable(게시글 또는 비디오) 모델을 가져옵니다.
     */
    public function commentable()
    {
        return $this->morphTo();
    }
}

class Post extends Model
{
    /**
     * 게시글의 모든 댓글을 가져옵니다.
     */
    public function comments()
    {
        return $this->morphMany(Comment::class, 'commentable');
    }
}

class Video extends Model
{
    /**
     * 비디오의 모든 댓글을 가져옵니다.
     */
    public function comments()
    {
        return $this->morphMany(Comment::class, 'commentable');
    }
}
```

<a name="one-to-many-polymorphic-retrieving-the-relationship"></a>
#### 연관관계 조회하기

테이블과 모델을 정의했다면, 모델의 동적 연관관계 프로퍼티를 통해 쉽게 데이터를 접근할 수 있습니다. 예를 들어, 게시글의 모든 댓글을 조회하려면 `comments` 동적 프로퍼티를 사용할 수 있습니다.

```
use App\Models\Post;

$post = Post::find(1);

foreach ($post->comments as $comment) {
    //
}
```

또한, 다형적 자식 모델의 부모를 조회할 때도, `morphTo`를 호출하는 메서드명을 동적 연관관계 프로퍼티로 접근하면 됩니다. 이 예시에서는 `Comment` 모델의 `commentable`을 사용합니다.

```
use App\Models\Comment;

$comment = Comment::find(1);

$commentable = $comment->commentable;
```

`Comment` 모델의 `commentable` 연관관계는 해당 댓글이 속한 부모가 `Post`인지 `Video`인지에 따라 각각의 인스턴스를 반환합니다.

<a name="one-of-many-polymorphic-relations"></a>
### 일대다 중 하나(One Of Many) 다형적 관계

모델이 여러 관련 모델을 가질 수 있지만, 이 중에서 "최신" 또는 "가장 오래된" 연관된 모델을 간편하게 조회하고 싶을 때가 있습니다. 예를 들어, `User` 모델이 여러 개의 `Image` 모델과 연관되어 있을 때, 사용자가 마지막에 업로드한 이미지만을 편리하게 가져오고 싶을 수 있습니다. 이런 기능은 `morphOne` 관계와 `ofMany` 관련 메서드를 조합하여 구현할 수 있습니다.

```php
/**
 * 사용자의 가장 최근 이미지를 가져옵니다.
 */
public function latestImage()
{
    return $this->morphOne(Image::class, 'imageable')->latestOfMany();
}
```

마찬가지로, 가장 오래된 이미지(최초 업로드 이미지 등)를 조회하는 메서드도 아래와 같이 정의할 수 있습니다.

```php
/**
 * 사용자의 가장 오래된 이미지를 가져옵니다.
 */
public function oldestImage()
{
    return $this->morphOne(Image::class, 'imageable')->oldestOfMany();
}
```

`latestOfMany`와 `oldestOfMany` 메서드는 기본적으로 관련 모델의 기본 키(정렬이 가능한 값)를 기준으로 가장 최신 또는 가장 오래된 인스턴스를 조회합니다. 하지만, 더 복잡한 조건으로 단 하나의 연관 모델을 선택해서 가져오고 싶을 수도 있습니다.

예를 들어, `ofMany` 메서드를 사용하면 사용자의 "가장 많은 좋아요를 받은" 이미지를 조회할 수 있습니다. `ofMany`의 첫 번째 인수로 정렬 기준이 될 컬럼명을, 두 번째 인수로 집계 함수(`min` 또는 `max`)를 지정합니다.

```php
/**
 * 사용자의 가장 인기있는 이미지를 가져옵니다.
 */
public function bestImage()
{
    return $this->morphOne(Image::class, 'imageable')->ofMany('likes', 'max');
}
```

> [!TIP]
> 더 복잡한 "one of many" 연관관계도 구현할 수 있습니다. 자세한 내용은 [has one of many 문서](#advanced-has-one-of-many-relationships)를 참고하시기 바랍니다.

<a name="many-to-many-polymorphic-relations"></a>
### 다대다(Polymorphic) 관계

<a name="many-to-many-polymorphic-table-structure"></a>
#### 테이블 구조

다대다(polymorphic) 관계는 "morph one" 및 "morph many" 관계보다 조금 더 복잡합니다. 예를 들어, `Post` 모델과 `Video` 모델이 `Tag` 모델과 다형성 다대다 관계를 가질 수 있습니다. 이런 경우 하나의 태그 테이블을 통해 게시글과 비디오 모두에 고유한 태그를 연결할 수 있습니다. 아래는 이 관계를 구현하기에 필요한 테이블 구조입니다.

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

> [!TIP]
> 다형 다대다 관계 예제를 본격적으로 다루기 전에, 일반적인 [다대다 관계 문서](#many-to-many)를 먼저 학습하면 더욱 이해가 잘 됩니다.

<a name="many-to-many-polymorphic-model-structure"></a>
#### 모델 구조

이제 각 모델에 연관관계를 정의할 차례입니다. `Post`와 `Video` 모델 모두 기본 Eloquent 모델 클래스에서 제공하는 `morphToMany` 메서드를 호출하는 `tags` 메서드를 포함해야 합니다.

`morphToMany` 메서드는 연관된 모델명과 "연관관계 이름"을 인수로 받습니다. 중간 테이블의 이름과 키를 기준으로 이 연관관계에서는 "taggable"이라는 이름을 사용하게 됩니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    /**
     * 게시글에 연결된 모든 태그를 가져옵니다.
     */
    public function tags()
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }
}
```

<a name="many-to-many-polymorphic-defining-the-inverse-of-the-relationship"></a>
#### 연관관계의 반대편(Inverse) 정의하기

이제 `Tag` 모델에 각 부모 모델에 해당하는 메서드를 각각 정의해야 합니다. 즉, 이 예시에서는 `posts`와 `videos` 메서드를 만들어야 하며, 두 메서드 모두 `morphedByMany` 메서드의 반환값을 리턴해야 합니다.

`morphedByMany`는 연관된 모델명과 "연관관계 이름"을 인수로 받습니다. 중간 테이블 및 관련 키에서 이미 사용했던 "taggable"이라는 이름을 그대로 사용합니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    /**
     * 이 태그가 연결된 모든 게시글을 가져옵니다.
     */
    public function posts()
    {
        return $this->morphedByMany(Post::class, 'taggable');
    }

    /**
     * 이 태그가 연결된 모든 비디오를 가져옵니다.
     */
    public function videos()
    {
        return $this->morphedByMany(Video::class, 'taggable');
    }
}
```

<a name="many-to-many-polymorphic-retrieving-the-relationship"></a>

#### 관계 데이터 조회

데이터베이스 테이블과 모델을 정의한 이후에는 모델을 통해 손쉽게 관계 데이터를 조회할 수 있습니다. 예를 들어, 게시글에 연결된 모든 태그를 가져오려면 `tags` 동적 관계 속성을 사용할 수 있습니다.

```
use App\Models\Post;

$post = Post::find(1);

foreach ($post->tags as $tag) {
    //
}
```

다형성 관계의 부모를 조회하려면, 다형성 자식 모델에서 `morphedByMany`를 호출하는 메서드의 이름을 통해 접근할 수 있습니다. 이번 예시에서는 `Tag` 모델의 `posts` 또는 `videos` 메서드가 여기에 해당합니다.

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
### 사용자 정의 다형성 타입

기본적으로 라라벨은 연관된 모델의 "타입" 정보를 저장할 때 완전히 한정된 클래스명을 사용합니다. 앞서 살펴본 일대다 다형성 관계에서 `Comment` 모델이 `Post` 또는 `Video` 모델에 속한다면, 기본적인 `commentable_type` 컬럼에는 각각 `App\Models\Post` 또는 `App\Models\Video` 값이 저장됩니다. 하지만, 이런 값들을 애플리케이션의 내부 구조와 분리하려고 할 수 있습니다.

예를 들어, 모델명을 타입으로 사용하는 대신 단순한 문자열 `post`, `video` 등으로도 지정할 수 있습니다. 이렇게 하면 나중에 모델명을 변경해도 데이터베이스의 다형성 타입 컬럼 값이 유효하게 유지됩니다.

```
use Illuminate\Database\Eloquent\Relations\Relation;

Relation::enforceMorphMap([
    'post' => 'App\Models\Post',
    'video' => 'App\Models\Video',
]);
```

`enforceMorphMap` 메서드는 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 호출하거나, 별도의 서비스 프로바이더를 만들어 정의해도 됩니다.

런타임에 특정 모델의 다형성 별칭(별칭, alias)을 확인하려면, 해당 모델의 `getMorphClass` 메서드를 사용할 수 있습니다. 반대로, 다형성 맵에 등록된 별칭으로부터 완전한 클래스명을 얻고 싶다면 `Relation::getMorphedModel` 메서드를 사용하면 됩니다.

```
use Illuminate\Database\Eloquent\Relations\Relation;

$alias = $post->getMorphClass();

$class = Relation::getMorphedModel($alias);
```

> [!NOTE]
> 기존 애플리케이션에 "morph map"을 추가할 때에는, 데이터베이스의 모든 다형성 `*_type` 컬럼 값(완전한 클래스명이 저장되어 있던 값들)을 반드시 맵에서 정의한 "별칭" 값으로 변경해주어야 합니다.

<a name="dynamic-relationships"></a>
### 동적 관계(Dynamic Relationships)

`resolveRelationUsing` 메서드를 사용하면 Eloquent 모델 간의 관계를 런타임에 동적으로 정의할 수 있습니다. 일반적인 애플리케이션 개발에서는 주로 권장되지 않지만, 라라벨 패키지 개발 등에서는 유용할 수 있습니다.

`resolveRelationUsing`의 첫 번째 인수로 원하는 관계명을 지정하고, 두 번째 인수로는 모델 인스턴스를 받아 유효한 Eloquent 관계 정의를 반환하는 클로저를 전달해야 합니다. 보통 이런 동적 관계 정의는 [서비스 프로바이더](/docs/8.x/providers) 클래스의 boot 메서드에서 수행합니다.

```
use App\Models\Order;
use App\Models\Customer;

Order::resolveRelationUsing('customer', function ($orderModel) {
    return $orderModel->belongsTo(Customer::class, 'customer_id');
});
```

> [!NOTE]
> 동적 관계를 정의할 때는 Eloquent 관계 메서드에 키 이름을 명확하게 지정하는 것이 좋습니다.

<a name="querying-relations"></a>
## 관계 데이터 쿼리하기

모든 Eloquent 관계는 메서드로 정의하므로, 실제 쿼리를 실행하지 않고도 관계 인스턴스를 얻을 수 있습니다. 또한 모든 종류의 Eloquent 관계는 [쿼리 빌더](/docs/8.x/queries)로 동작하므로, 데이터베이스에 최종적으로 쿼리를 실행하기 전까지 관계 쿼리에 다양한 조건을 메서드 체이닝 방식으로 추가할 수 있습니다.

예를 들어, 블로그 애플리케이션에서 `User` 모델이 여러 개의 `Post` 모델을 가지고 있다고 가정하겠습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 해당 사용자의 모든 게시글(post)을 가져옵니다.
     */
    public function posts()
    {
        return $this->hasMany(Post::class);
    }
}
```

이제 다음과 같이 `posts` 관계에 쿼리 조건을 체이닝하여 추가할 수 있습니다.

```
use App\Models\User;

$user = User::find(1);

$user->posts()->where('active', 1)->get();
```

라라벨의 [쿼리 빌더](/docs/8.x/queries) 메서드는 관계 쿼리에도 모두 사용할 수 있으니, 쿼리 빌더 문서를 확인해 다양한 메서드를 익히시기 바랍니다.

<a name="chaining-orwhere-clauses-after-relationships"></a>
#### 관계 쿼리에서 `orWhere` 체이닝 시 주의점

앞서 예제에서 보았듯이, 관계 쿼리에 조건을 자유롭게 추가할 수 있습니다. 하지만, 관계 쿼리에 `orWhere` 절을 체이닝할 때에는 주의가 필요합니다. `orWhere` 절은 관계의 기본 조건과 같은 수준에서 묶이기 때문입니다.

```
$user->posts()
        ->where('active', 1)
        ->orWhere('votes', '>=', 100)
        ->get();
```

위의 코드가 생성하는 SQL 문을 보면, `or`절 때문에 "100표 이상 받은 모든 사용자(user_id와 관계없이)"의 게시글도 결과에 포함되게 됩니다. 즉, 원래 특정 사용자에 한정되어야 할 쿼리 범위가 벗어나게 됩니다.

```sql
select *
from posts
where user_id = ? and active = 1 or votes >= 100
```

대부분의 경우, 조건들을 괄호로 묶어서 [논리 그룹](/docs/8.x/queries#logical-grouping)을 활용해 별도로 묶어주는 것이 좋습니다.

```
use Illuminate\Database\Eloquent\Builder;

$user->posts()
        ->where(function (Builder $query) {
            return $query->where('active', 1)
                         ->orWhere('votes', '>=', 100);
        })
        ->get();
```

이 방식으로 생성되는 SQL은 아래와 같으며, 각 조건이 올바르게 그룹화되어 특정 사용자의 게시글로 제한됩니다.

```sql
select *
from posts
where user_id = ? and (active = 1 or votes >= 100)
```

<a name="relationship-methods-vs-dynamic-properties"></a>
### 관계 메서드 vs 동적 속성

관계 쿼리에 별도의 제약 조건을 추가하지 않는다면, 관계를 마치 모델의 일반 속성처럼 접근할 수 있습니다. 앞서 살펴본 `User`와 `Post` 예제를 이어, 한 사용자의 모든 게시글에 접근하는 코드는 다음과 같습니다.

```
use App\Models\User;

$user = User::find(1);

foreach ($user->posts as $post) {
    //
}
```

동적 관계 속성은 "지연 로딩(레이지 로딩)" 방식으로 동작하므로, 실제로 속성에 접근할 때에만 관계 데이터가 로딩됩니다. 이 때문에, 개발자들은 보통 [즉시 로딩(eager loading)](#eager-loading) 기능을 활용해 모델을 로딩할 때 미리 관계 데이터를 함께 불러와 SQL 쿼리 실행 횟수를 크게 줄입니다.

<a name="querying-relationship-existence"></a>
### 관계 존재 여부 쿼리

모델 레코드를 조회할 때, 특정 관계의 존재 여부로 결과를 제한하고 싶을 수 있습니다. 예를 들어, 하나 이상의 댓글이 달린 블로그 게시글만 조회하고 싶을 때, `has` 또는 `orHas` 메서드에 관계명을 전달해 사용할 수 있습니다.

```
use App\Models\Post;

// 하나 이상의 댓글이 달려있는 게시글만 조회
$posts = Post::has('comments')->get();
```

연산자와 개수를 지정하면 더욱 세밀한 조건으로 결과를 조정할 수 있습니다.

```
// 3개 이상의 댓글이 달린 게시글만 조회
$posts = Post::has('comments', '>=', 3)->get();
```

중첩된 `has` 조건문은 "점(dot) 표기법"을 활용해 손쉽게 작성할 수 있습니다. 예를 들어, 최소 한 개 이상의 이미지가 첨부된 댓글이 있는 모든 게시글을 조회할 수 있습니다.

```
// 이미지가 첨부된 댓글이 있는 게시글만 조회
$posts = Post::has('comments.images')->get();
```

더 강력한 제약 조건이 필요하다면, `whereHas`와 `orWhereHas` 메서드를 사용해 관계 쿼리에 추가적인 조건도 지정할 수 있습니다. 예를 들어 댓글의 내용을 검사하는 경우가 이에 해당합니다.

```
use Illuminate\Database\Eloquent\Builder;

// 내용에 'code%'가 포함된 댓글이 최소 한 개 이상 달린 게시글을 조회
$posts = Post::whereHas('comments', function (Builder $query) {
    $query->where('content', 'like', 'code%');
})->get();

// 내용에 'code%'가 포함된 댓글이 최소 10개 이상 달린 게시글을 조회
$posts = Post::whereHas('comments', function (Builder $query) {
    $query->where('content', 'like', 'code%');
}, '>=', 10)->get();
```

> [!NOTE]
> 현재 Eloquent는 데이터베이스 간의 관계 존재 여부 쿼리를 지원하지 않습니다. 반드시 같은 데이터베이스 내에 관계가 존재해야 합니다.

<a name="inline-relationship-existence-queries"></a>
#### 인라인 관계 존재 쿼리

관계 쿼리에 단일 where 조건을 곁들여 있고 싶을 때는 `whereRelation`과 `whereMorphRelation` 메서드를 활용하면 더 간결한 코드를 작성할 수 있습니다. 예를 들어, 승인되지 않은 댓글이 달린 게시글을 다음과 같이 조회할 수 있습니다.

```
use App\Models\Post;

$posts = Post::whereRelation('comments', 'is_approved', false)->get();
```

물론, 쿼리 빌더의 `where` 메서드처럼 연산자도 지정할 수 있습니다.

```
$posts = Post::whereRelation(
    'comments', 'created_at', '>=', now()->subHour()
)->get();
```

<a name="querying-relationship-absence"></a>
### 관계 부재 쿼리

모델 레코드를 조회할 때 특정 관계가 **존재하지 않는** 경우로 결과를 제한하고 싶을 때도 있습니다. 예를 들어, 댓글이 한 개도 없는 게시글만 조회하려면, `doesntHave` 또는 `orDoesntHave` 메서드에 관계명을 전달합니다.

```
use App\Models\Post;

$posts = Post::doesntHave('comments')->get();
```

더 정교한 제약 조건이 필요하다면 `whereDoesntHave`와 `orWhereDoesntHave` 메서드를 활용해 게시글에 달린 댓글의 내용을 기준으로 필터링할 수 있습니다.

```
use Illuminate\Database\Eloquent\Builder;

$posts = Post::whereDoesntHave('comments', function (Builder $query) {
    $query->where('content', 'like', 'code%');
})->get();
```

"점(dot) 표기법"을 사용하면 중첩 관계에서도 쿼리가 가능합니다. 아래 예시는 댓글이 없는 게시글을 조회하지만, "밴 처리되지 않은(banned=0) 작성자가 단 댓글"은 있는 게시글 또한 결과에 포함됩니다.

```
use Illuminate\Database\Eloquent\Builder;

$posts = Post::whereDoesntHave('comments.author', function (Builder $query) {
    $query->where('banned', 0);
})->get();
```

<a name="querying-morph-to-relationships"></a>
### 다형성(Morph To) 관계 쿼리

"morph to" 관계에 대해 존재 쿼리를 작성하려면, `whereHasMorph`와 `whereDoesntHaveMorph` 메서드를 사용하면 됩니다. 이들 메서드의 첫 번째 인수는 관계명, 두 번째 인수는 쿼리에 포함하고자 하는 관련 모델명들이며, 마지막 인수로는 관계 쿼리를 추가로 커스터마이즈 할 수 있는 클로저를 전달할 수 있습니다.

```
use App\Models\Comment;
use App\Models\Post;
use App\Models\Video;
use Illuminate\Database\Eloquent\Builder;

// 제목에 'code%'가 포함된 게시글(Post)이나 비디오(Video)에 연관된 댓글 조회
$comments = Comment::whereHasMorph(
    'commentable',
    [Post::class, Video::class],
    function (Builder $query) {
        $query->where('title', 'like', 'code%');
    }
)->get();

// 제목에 'code%'가 포함되지 않은 게시글(Post)에 연관된 댓글만 조회
$comments = Comment::whereDoesntHaveMorph(
    'commentable',
    Post::class,
    function (Builder $query) {
        $query->where('title', 'like', 'code%');
    }
)->get();
```

경우에 따라서는 다형성 모델의 "타입"에 따라 쿼리 조건을 다르게 걸어야 할 수도 있습니다. 이때 `whereHasMorph`에 전달하는 클로저는 두 번째 인수로 `$type` 값을 받을 수 있으며, 이를 통해 빌드되는 쿼리 타입을 동적으로 분기할 수 있습니다.

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
#### 모든 다형성 관련 모델 쿼리

특정 다형성 모델 배열을 전달하는 대신, `*`(애스터리스크)를 와일드카드로 넘길 수 있습니다. 이 경우 라라벨은 데이터베이스에서 존재하는 모든 다형성 타입을 조회하며, 이를 위해 별도의 쿼리가 추가로 실행됩니다.

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

관계에 속한 모델의 전체 개수를 가져오되, 실제 모델 전체를 로드하지 않고 싶을 수도 있습니다. 이럴 때는 `withCount` 메서드를 이용하세요. 이 메서드는 결과 모델에 `{relation}_count` 형태의 속성을 추가해줍니다.

```
use App\Models\Post;

$posts = Post::withCount('comments')->get();

foreach ($posts as $post) {
    echo $post->comments_count;
}
```

`withCount`에 배열을 전달하면 여러 관계의 개수를 한 번에 가져오거나, 추가 쿼리 조건도 걸 수 있습니다.

```
use Illuminate\Database\Eloquent\Builder;

$posts = Post::withCount(['votes', 'comments' => function (Builder $query) {
    $query->where('content', 'like', 'code%');
}])->get();

echo $posts[0]->votes_count;
echo $posts[0]->comments_count;
```

또한, 관계 카운트를 별칭(alias)으로 지정할 수도 있어, 동일한 관계에 대해 여러 개의 카운트를 구할 수 있습니다.

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
#### 카운트의 지연 로딩(Deferred Count Loading)

`loadCount` 메서드를 사용하면, 부모 모델을 이미 조회한 후에 관계 개수만 별도로 추가 로딩할 수 있습니다.

```
$book = Book::first();

$book->loadCount('genres');
```

카운트 쿼리에 추가 제약 조건을 지정하고 싶으면, 배열의 키에 관계명을, 값으로 쿼리 빌더를 받는 클로저를 넘겨주면 됩니다.

```
$book->loadCount(['reviews' => function ($query) {
    $query->where('rating', 5);
}])
```

<a name="relationship-counting-and-custom-select-statements"></a>
#### 관계 카운트와 커스텀 select 조합

`withCount`를 `select` 구문과 함께 쓸 때는 반드시 `select` 메서드 이후에 `withCount`를 호출해야 합니다.

```
$posts = Post::select(['title', 'body'])
                ->withCount('comments')
                ->get();
```

<a name="other-aggregate-functions"></a>
### 기타 집계 함수

`withCount` 외에도, Eloquent는 `withMin`, `withMax`, `withAvg`, `withSum`, `withExists` 등의 메서드를 제공합니다. 이 메서드들은 `{relation}_{function}_{column}` 형태의 속성을 결과 모델에 추가합니다.

```
use App\Models\Post;

$posts = Post::withSum('comments', 'votes')->get();

foreach ($posts as $post) {
    echo $post->comments_sum_votes;
}
```

집계 함수 결과를 다른 이름으로 접근하고 싶을 경우, 별칭을 사용할 수 있습니다.

```
$posts = Post::withSum('comments as total_comments', 'votes')->get();

foreach ($posts as $post) {
    echo $post->total_comments;
}
```

`loadCount` 처럼, 이렇게 집계된 정보를 조회 후에 별도로 로드할 수도 있습니다.

```
$post = Post::first();

$post->loadSum('comments', 'votes');
```

만약 이러한 집계 메서드들을 `select`와 조합하고자 한다면, 역시 select 이후에 집계 메서드를 호출해야 합니다.

```
$posts = Post::select(['title', 'body'])
                ->withExists('comments')
                ->get();
```

<a name="counting-related-models-on-morph-to-relationships"></a>
### Morph To 관계에서 연관 모델 개수 세기

"morph to" 관계뿐만 아니라 각 관계가 반환할 수 있는 여러 엔티티의 카운트도 즉시 로딩하여 보고 싶을 때는, `with`와 morphTo 관계의 `morphWithCount` 메서드를 조합하면 됩니다.

예를 들어, `Photo`, `Post` 모델이 각각 `ActivityFeed` 모델을 만들 수 있다고 합시다. `ActivityFeed` 모델에는 부모 `Photo` 또는 `Post` 모델에 접근할 수 있는 `parentable` morphTo 관계가 있습니다. 추가적으로, `Photo` 모델은 여러 `Tag`와, `Post` 모델은 여러 `Comment`와 각각 연관 관계를 맺고 있다고 가정합니다.

이렇게 설정된 경우, `ActivityFeed` 인스턴스를 조회하면서 각 인스턴스의 부모 `parentable` 모델을 즉시 로딩하고, 각 부모마다 연결된 태그나 댓글 개수까지 함께 조회하려면 다음과 같이 하면 됩니다.

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
#### Morph To 관계에서의 지연 카운트 로딩

이미 여러 개의 `ActivityFeed` 모델을 먼저 조회했다면, 나중에 각 `parentable` 부모 모델의 하위 관계 개수를 지연 로딩 방식으로 가져올 수도 있습니다. 이때는 `loadMorphCount` 메서드를 사용하면 됩니다.

```
$activities = ActivityFeed::with('parentable')->get();

$activities->loadMorphCount('parentable', [
    Photo::class => ['tags'],
    Post::class => ['comments'],
]);
```

<a name="eager-loading"></a>
## 즉시 로딩(Eager Loading)

Eloquent 관계에 속성처럼 접근하면 연관된 데이터는 "지연 로딩"됩니다. 즉, 실제로 해당 속성에 접근할 때 쿼리가 발생합니다. 반면, Eloquent는 부모 모델을 쿼리할 때 특정 관계를 "즉시 로딩(eager loading)"할 수 있는 기능도 지원합니다. 즉시 로딩을 활용하면 이른바 "N + 1" 쿼리 문제를 해결할 수 있습니다. 이 문제를 설명하기 위해, 한 `Book` 모델이 `Author` 모델에 "belongs to" 관계를 맺고 있다고 가정해 보겠습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    /**
     * 책의 저자(Author)를 반환합니다.
     */
    public function author()
    {
        return $this->belongsTo(Author::class);
    }
}
```

이제 모든 책과 각 책의 저자를 조회하는 코드를 작성해 보겠습니다.

```
use App\Models\Book;

$books = Book::all();

foreach ($books as $book) {
    echo $book->author->name;
}
```

이 루프에서는 데이터베이스에서 책 목록을 한 번 조회하고, 각 책마다 추가로 저자 정보를 조회하기 위해 반복적으로 쿼리가 실행됩니다. 만약 책이 25권이라면, 총 26번(책 전체 1번 + 책마다 저자 25번) 쿼리가 실행됩니다.

이때 "즉시 로딩"을 활용하면 이 작업을 단 두 번의 쿼리로 줄일 수 있습니다. 쿼리를 작성할 때 `with` 메서드를 사용해 관계를 명시적으로 즉시 로딩할 수 있습니다.

```
$books = Book::with('author')->get();

foreach ($books as $book) {
    echo $book->author->name;
}
```

이렇게 하면 실제로 실행되는 쿼리는 두 번뿐입니다. 한 번은 모든 책을, 한 번은 해당하는 저자들을 조회합니다.

```sql
select * from books

select * from authors where id in (1, 2, 3, 4, 5, ...)
```

<a name="eager-loading-multiple-relationships"></a>
#### 여러 관계 한 번에 즉시 로딩

여러 관계를 한 번에 즉시 로딩하려면, `with` 메서드에 관계명을 배열로 넘기면 됩니다.

```
$books = Book::with(['author', 'publisher'])->get();
```

<a name="nested-eager-loading"></a>
#### 중첩 관계 즉시 로딩

관계의 또 다른 관계까지 즉시 로딩하고 싶을 때는 "점(dot) 표기법"을 활용할 수 있습니다. 예를 들어, 모든 책의 저자와, 저자의 연락처까지 즉시 로딩하려면 다음과 같이 작성합니다.

```
$books = Book::with('author.contacts')->get();
```

<a name="nested-eager-loading-morphto-relationships"></a>
#### 중첩 morphTo 관계의 즉시 로딩

`morphTo` 관계와, 해당 morphTo가 반환할 수 있는 다양한 엔티티의 추가 관계까지 함께 즉시 로딩하려면, `with`와 morphTo 관계의 `morphWith` 메서드를 결합해서 사용할 수 있습니다. 다음 예시를 참고하세요.

```
<?php

use Illuminate\Database\Eloquent\Model;

class ActivityFeed extends Model
{
    /**
     * 이 액티비티 피드의 부모를 반환합니다.
     */
    public function parentable()
    {
        return $this->morphTo();
    }
}
```

이 예시에서 `Event`, `Photo`, `Post` 모델이 `ActivityFeed` 모델을 생성할 수 있다고 가정합니다. 또한 `Event` 모델은 `Calendar`와, `Photo`는 `Tag`와, `Post`는 `Author`와 각각 연결되어 있습니다.

이런 모델/관계 구성을 한다면, 아래 코드처럼 `ActivityFeed` 모델을 조회하면서 각각의 `parentable` 모델과, 해당 부모 모델의 중첩 관계까지 한 번에 즉시 로딩할 수 있습니다.

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

#### 특정 컬럼만 Eager Loading 하기

연관관계를 통해 데이터를 불러올 때, 항상 모든 컬럼이 필요한 것은 아닙니다. 이런 경우, Eloquent에서는 연관관계에서 어떤 컬럼만 조회할지 명시적으로 지정할 수 있습니다.

```
$books = Book::with('author:id,name,book_id')->get();
```

> [!NOTE]
> 이 기능을 사용할 때는 반드시 `id` 컬럼과 적절한 외래키 컬럼을 컬럼 목록에 포함시켜야 합니다.

<a name="eager-loading-by-default"></a>
#### 기본적으로 Eager Loading 적용하기

모델을 조회할 때마다 항상 특정 연관관계를 로드하고 싶을 때가 있습니다. 이럴 때는 모델에 `$with` 속성을 정의하면 됩니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    /**
     * 항상 로드할 연관관계 목록
     *
     * @var array
     */
    protected $with = ['author'];

    /**
     * 이 책을 쓴 저자를 반환합니다.
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

단일 쿼리에서 `$with` 속성에 지정된 항목을 제외하고 싶다면 `without` 메서드를 사용할 수 있습니다.

```
$books = Book::without('author')->get();
```

단일 쿼리에서 `$with`에 지정된 모든 항목을 원하는 값으로 다 덮어쓰고 싶으면 `withOnly` 메서드를 사용합니다.

```
$books = Book::withOnly('genre')->get();
```

<a name="constraining-eager-loads"></a>
### Eager Loading에 조건 추가하기

연관관계를 eager load 하면서 동시에 해당 쿼리에 추가 조건을 걸고 싶을 수도 있습니다. 이럴 때에는 `with` 메서드에 배열을 전달하고, 배열의 키는 연관관계 이름, 값은 조건을 추가하는 클로저로 작성할 수 있습니다.

```
use App\Models\User;

$users = User::with(['posts' => function ($query) {
    $query->where('title', 'like', '%code%');
}])->get();
```

이 예시에서는, 게시글의 `title` 컬럼에 `code`라는 단어가 포함된 게시글만 eager load 하게 됩니다. 또한, [쿼리 빌더](/docs/8.x/queries)의 다른 메서드들을 활용해 eager loading 쿼리를 원하는 대로 커스터마이즈할 수 있습니다.

```
$users = User::with(['posts' => function ($query) {
    $query->orderBy('created_at', 'desc');
}])->get();
```

> [!NOTE]
> `limit`과 `take` 쿼리 빌더 메서드는 eager load 제약 조건에서 사용할 수 없습니다.

<a name="constraining-eager-loading-of-morph-to-relationships"></a>
#### `morphTo` 연관관계 Eager Loading 제약 조건 추가하기

`morphTo` 연관관계를 eager load 할 때는, Eloquent가 각 관련된 모델별로 여러 쿼리를 실행합니다. 이 경우 각 쿼리에 제약 조건을 추가하려면, `MorphTo` 관계의 `constrain` 메서드를 이용할 수 있습니다:

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

위 예시에서 Eloquent는 숨겨지지 않은(Post의 경우) 게시글과, `type` 값이 "educational"인 비디오만 eager load 하게 됩니다.

<a name="lazy-eager-loading"></a>
### Lazy Eager Loading

간혹 상위(부모) 모델을 이미 조회한 뒤에 연관관계의 eager load가 필요한 경우가 있습니다. 예를 들어, 관련 모델을 로드할지 동적으로 결정해야 할 때 이런 방식이 유용합니다.

```
use App\Models\Book;

$books = Book::all();

if ($someCondition) {
    $books->load('author', 'publisher');
}
```

eager load 쿼리에 조건을 추가해야 한다면, 로드할 연관관계를 키로, 클로저를 값으로 가지는 배열을 전달할 수 있습니다.

```
$author->load(['books' => function ($query) {
    $query->orderBy('published_date', 'asc');
}]);
```

이미 로드되지 않은 관계만 로드하고자 한다면 `loadMissing` 메서드를 사용하세요.

```
$book->loadMissing('author');
```

<a name="nested-lazy-eager-loading-morphto"></a>
#### 중첩 Lazy Eager Loading & `morphTo`

`morphTo` 연관관계뿐만 아니라, 그 안에 등장할 수 있는 다양한 엔티티의 중첩 관계까지 eager load 하고 싶다면 `loadMorph` 메서드를 사용할 수 있습니다.

이 메서드는 첫 번째 인자로 `morphTo` 관계의 이름을, 두 번째 인자로 모델 및 해당 연관관계 목록의 배열을 받습니다. 아래 예시를 참고하세요.

```
<?php

use Illuminate\Database\Eloquent\Model;

class ActivityFeed extends Model
{
    /**
     * Activity Feed 기록의 상위(parent) 객체를 반환합니다.
     */
    public function parentable()
    {
        return $this->morphTo();
    }
}
```

여기서 예를 들어, `Event`, `Photo`, `Post` 모델들이 모두 `ActivityFeed`를 생성할 수 있다고 가정합니다. 또한 `Event` 모델은 `Calendar` 모델과, `Photo` 모델은 `Tag` 모델과, `Post`는 `Author` 모델과 각각 연관되어 있다고 하면, 다음과 같이 사용할 수 있습니다.

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
### Lazy Loading 방지하기

앞서 다룬 것처럼, eager loading을 적극적으로 활용하면 애플리케이션의 성능을 크게 높일 수 있습니다. 그래서 라라벨에서는 관계의 lazy loading을 항상 방지하도록 설정할 수 있습니다. 이를 위해 Eloquent 기본 모델 클래스의 `preventLazyLoading` 메서드를 사용합니다. 보통 이 코드는 애플리케이션의 `AppServiceProvider` 클래스의 `boot` 메서드에서 호출하는 것이 일반적입니다.

`preventLazyLoading` 메서드는 lazy loading을 방지할지 여부를 나타내는 (불리언) 인자를 선택적으로 받습니다. 예를 들어, 프로덕션 환경이 아닐 때만 lazy loading을 막고 싶을 수도 있습니다. 이런 경우에도 프로덕션 환경에서는 기존 코드가 영향을 받지 않도록 처리할 수 있습니다.

```php
use Illuminate\Database\Eloquent\Model;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 *
 * @return void
 */
public function boot()
{
    Model::preventLazyLoading(! $this->app->isProduction());
}
```

lazy loading을 방지하도록 설정하면, Eloquent가 관계를 lazy load 하려고 시도할 때마다 `Illuminate\Database\LazyLoadingViolationException` 예외가 발생하게 됩니다.

lazy loading 위반 발생 시의 동작을 `handleLazyLoadingViolationsUsing` 메서드로 커스터마이즈할 수도 있습니다. 예를 들어, 예외를 발생시키는 대신 로그만 남기도록 하려면 아래와 같이 할 수 있습니다.

```php
Model::handleLazyLoadingViolationUsing(function ($model, $relation) {
    $class = get_class($model);

    info("Attempted to lazy load [{$relation}] on model [{$class}].");
});
```

<a name="inserting-and-updating-related-models"></a>
## 연관관계 모델 삽입 및 수정

<a name="the-save-method"></a>
### `save` 메서드

Eloquent는 연관관계에 새 모델을 추가하기 위한 편리한 메서드를 제공합니다. 예를 들어, 기존 게시글에 새 댓글을 추가해야 한다고 할 때, 굳이 `Comment` 모델의 `post_id` 속성을 직접 지정하지 않아도, 연관관계의 `save` 메서드를 사용해서 댓글을 추가할 수 있습니다.

```
use App\Models\Comment;
use App\Models\Post;

$comment = new Comment(['message' => 'A new comment.']);

$post = Post::find(1);

$post->comments()->save($comment);
```

여기서는 `comments` 관계에 동적 프로퍼티로 접근하지 않고, 메서드로 호출해 관계 인스턴스를 얻은 뒤 `save`를 사용했습니다. 이때 `save` 메서드는 새 `Comment` 모델의 `post_id` 값을 자동으로 채워줍니다.

여러 개의 연관 모델을 한 번에 저장하려면 `saveMany` 메서드를 사용할 수 있습니다.

```
$post = Post::find(1);

$post->comments()->saveMany([
    new Comment(['message' => 'A new comment.']),
    new Comment(['message' => 'Another new comment.']),
]);
```

`save`와 `saveMany` 메서드는 주어진 모델 인스턴스들을 데이터베이스에 저장하기는 하지만, 이미 로드된 부모 모델의 in-memory(메모리 상의) 관계에 새로 저장한 모델을 자동으로 추가하지는 않습니다. 저장 이후에 해당 관계에 바로 접근해야 한다면, `refresh`를 사용해 모델과 관계를 다시 로드하는 것이 좋습니다.

```
$post->comments()->save($comment);

$post->refresh();

// 새롭게 저장된 댓글을 포함해서 모든 댓글을 조회함
$post->comments;
```

<a name="the-push-method"></a>
#### 모델과 연관관계 재귀적으로 저장하기

모델과 그와 연결된 모든 연관 모델까지 한 번에 저장하려면 `push` 메서드를 사용할 수 있습니다. 아래 예시에서, `Post` 모델뿐 아니라 그에 연결된 댓글, 그리고 각 댓글의 작성자까지 한 번에 저장됩니다.

```
$post = Post::find(1);

$post->comments[0]->message = 'Message';
$post->comments[0]->author->name = 'Author Name';

$post->push();
```

<a name="the-create-method"></a>
### `create` 메서드

`save`와 `saveMany` 외에도, 속성 배열을 전달해 새 모델을 생성하고 데이터베이스에 바로 저장하는 `create` 메서드를 사용할 수도 있습니다. `save`가 전체 Eloquent 모델 인스턴스를 받는 것과 달리, `create`는 일반 PHP 배열을 인자로 받습니다. 또한, `create` 호출 결과로 새롭게 생성된 모델 인스턴스가 반환됩니다.

```
use App\Models\Post;

$post = Post::find(1);

$comment = $post->comments()->create([
    'message' => 'A new comment.',
]);
```

`createMany` 메서드를 사용해 여러 연관 모델을 한 번에 생성할 수도 있습니다.

```
$post = Post::find(1);

$post->comments()->createMany([
    ['message' => 'A new comment.'],
    ['message' => 'Another new comment.'],
]);
```

또한, 연관관계에 대해 [findOrNew, firstOrNew, firstOrCreate, updateOrCreate](/docs/8.x/eloquent#upserts) 등의 메서드도 사용할 수 있습니다.

> [!TIP]
> `create` 메서드를 사용하기 전에 [Mass Assignment](/docs/8.x/eloquent#mass-assignment) 관련 문서를 꼭 살펴보시기 바랍니다.

<a name="updating-belongs-to-relationships"></a>
### Belongs To 연관관계

자식 모델에 새로운 부모 모델을 할당하고 싶다면 `associate` 메서드를 사용하면 됩니다. 아래 예시는 `User` 모델이 `Account` 모델과 `belongsTo` 관계를 가진 상황입니다. `associate` 메서드는 자식 모델에서 관계의 외래키를 자동으로 설정합니다.

```
use App\Models\Account;

$account = Account::find(10);

$user->account()->associate($account);

$user->save();
```

자식 모델에서 부모 모델 연결을 해제하고 싶을 때는 `dissociate` 메서드를 사용하면 되며, 해당 관계의 외래키가 `null`로 설정됩니다.

```
$user->account()->dissociate();

$user->save();
```

<a name="updating-many-to-many-relationships"></a>
### 다대다(Many To Many) 연관관계

<a name="attaching-detaching"></a>
#### Attach / Detach

Eloquent는 다대다 연관관계를 손쉽게 다룰 수 있는 여러 메서드를 제공합니다. 예를 들어, 한 사용자가 여러 역할(roles)을 가질 수 있고, 역할도 여러 사용자를 가질 수 있는 구조라면, 중간 테이블에 데이터를 기록하려면 `attach` 메서드를 사용할 수 있습니다.

```
use App\Models\User;

$user = User::find(1);

$user->roles()->attach($roleId);
```

`attach` 시 중간 테이블에 추가로 기록할 데이터를 배열 형태로 함께 전달할 수도 있습니다.

```
$user->roles()->attach($roleId, ['expires' => $expires]);
```

역할을 사용자로부터 분리(detach)하려면 `detach` 메서드를 사용합니다. 이 메서드는 해당 중간 테이블의 레코드만 삭제하며, 실제 모델 자체는 데이터베이스에 남아 있습니다.

```
// 특정 역할만 분리
$user->roles()->detach($roleId);

// 모든 역할 분리
$user->roles()->detach();
```

참고로, `attach` 및 `detach`는 모두 ID 배열을 인자로 받는 것도 가능합니다.

```
$user = User::find(1);

$user->roles()->detach([1, 2, 3]);

$user->roles()->attach([
    1 => ['expires' => $expires],
    2 => ['expires' => $expires],
]);
```

<a name="syncing-associations"></a>
#### 연관 데이터 동기화(Sync)

다대다 관계의 연결을 만들 때는 `sync` 메서드로 더욱 편리하게 여러 관계를 한 번에 동기화할 수 있습니다. 이 메서드는 중간 테이블에 지정한 ID 배열만 남도록 자동으로 처리해줍니다. 배열에 없는 ID는 중간 테이블에서 제거됩니다. 즉, sync 이후에는 전달한 ID들만 관계에 남게 됩니다.

```
$user->roles()->sync([1, 2, 3]);
```

동기화 시 중간 테이블에 저장할 추가 데이터를 함께 전달할 수도 있습니다.

```
$user->roles()->sync([1 => ['expires' => true], 2, 3]);
```

모든 동기화된 ID에 동일한 중간 테이블 데이터를 기록하고 싶다면 `syncWithPivotValues` 메서드를 쓸 수 있습니다.

```
$user->roles()->syncWithPivotValues([1, 2, 3], ['active' => true]);
```

주어진 배열에 포함되지 않은 기존 ID를 분리(detach)하지 않고 유지하고 싶다면, `syncWithoutDetaching`을 사용하세요.

```
$user->roles()->syncWithoutDetaching([1, 2, 3]);
```

<a name="toggling-associations"></a>
#### 연관 데이터 토글(Toggle)

다대다 관계에는 토글(toggle) 메서드도 있습니다. 이 메서드는 전달된 ID가 이미 연결되어 있다면 분리하고, 연결되어 있지 않다면 새로 attach 합니다.

```
$user->roles()->toggle([1, 2, 3]);
```

<a name="updating-a-record-on-the-intermediate-table"></a>
#### 중간 테이블의 데이터 수정하기

이미 존재하는 중간 테이블의 레코드를 수정하려면, `updateExistingPivot` 메서드를 사용할 수 있습니다. 이 메서드는 중간 테이블의 외래키, 그리고 수정할 속성 배열을 받습니다.

```
$user = User::find(1);

$user->roles()->updateExistingPivot($roleId, [
    'active' => false,
]);
```

<a name="touching-parent-timestamps"></a>
## 부모 타임스탬프(Timestamp) 자동 업데이트

`belongsTo` 또는 `belongsToMany` 관계를 정의할 때(예: `Comment` → `Post`), 자식 모델이 수정될 때 부모 모델의 타임스탬프를 자동으로 업데이트하는 것이 유용할 때가 있습니다.

예를 들어, `Comment` 모델을 수정하면 소유하고 있는 `Post`의 `updated_at` 값도 현재 시간으로 자동 업데이트하고 싶을 수 있습니다. 이런 경우, 자식 모델에 `touches` 속성을 추가하고, 업데이트가 필요한 관계 이름을 배열로 지정하면 됩니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    /**
     * 변경될 때 타임스탬프를 touch할 관계 목록
     *
     * @var array
     */
    protected $touches = ['post'];

    /**
     * 이 댓글이 소속된 게시글을 반환합니다.
     */
    public function post()
    {
        return $this->belongsTo(Post::class);
    }
}
```

> [!NOTE]
> 부모 모델의 타임스탬프는 Eloquent의 `save` 메서드로 자식 모델이 수정될 때만 자동으로 업데이트됩니다.