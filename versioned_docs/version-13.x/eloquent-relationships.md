<!-- # Eloquent: Relationships -->
# Eloquent: Relationships

- [Introduction](#introduction)
- [Defining Relationships](#defining-relationships)
    - [One to One / Has One](#one-to-one)
    - [One to Many / Has Many](#one-to-many)
    - [One to Many (Inverse) / Belongs To](#one-to-many-inverse)
    - [Has One of Many](#has-one-of-many)
    - [Has One Through](#has-one-through)
    - [Has Many Through](#has-many-through)
- [Scoped Relationships](#scoped-relationships)
- [Many to Many Relationships](#many-to-many)
    - [Retrieving Intermediate Table Columns](#retrieving-intermediate-table-columns)
    - [Filtering Queries via Intermediate Table Columns](#filtering-queries-via-intermediate-table-columns)
    - [Ordering Queries via Intermediate Table Columns](#ordering-queries-via-intermediate-table-columns)
    - [Defining Custom Intermediate Table Models](#defining-custom-intermediate-table-models)
        - [Automatically Hydrating Pivot Relationships](#automatically-hydrating-pivot-relationships)
- [Polymorphic Relationships](#polymorphic-relationships)
    - [One to One](#one-to-one-polymorphic-relations)
    - [One to Many](#one-to-many-polymorphic-relations)
    - [One of Many](#one-of-many-polymorphic-relations)
    - [Many to Many](#many-to-many-polymorphic-relations)
    - [Custom Polymorphic Types](#custom-polymorphic-types)
- [Dynamic Relationships](#dynamic-relationships)
- [Querying Relations](#querying-relations)
    - [Relationship Methods vs. Dynamic Properties](#relationship-methods-vs-dynamic-properties)
    - [Querying Relationship Existence](#querying-relationship-existence)
    - [Querying Relationship Absence](#querying-relationship-absence)
    - [Querying Morph To Relationships](#querying-morph-to-relationships)
- [Aggregating Related Models](#aggregating-related-models)
    - [Counting Related Models](#counting-related-models)
    - [Other Aggregate Functions](#other-aggregate-functions)
    - [Counting Related Models on Morph To Relationships](#counting-related-models-on-morph-to-relationships)
- [Eager Loading](#eager-loading)
    - [Constraining Eager Loads](#constraining-eager-loads)
    - [Lazy Eager Loading](#lazy-eager-loading)
    - [Automatic Eager Loading](#automatic-eager-loading)
    - [Preventing Lazy Loading](#preventing-lazy-loading)
- [Inserting and Updating Related Models](#inserting-and-updating-related-models)
    - [The `save` Method](#the-save-method)
    - [The `create` Method](#the-create-method)
    - [Belongs To Relationships](#updating-belongs-to-relationships)
    - [Many to Many Relationships](#updating-many-to-many-relationships)
- [Touching Parent Timestamps](#touching-parent-timestamps)

<a name="introduction"></a>
<!-- ## Introduction -->
## Introduction

<!-- Database tables are often related to one another. For example, a blog post may have many comments or an order could be related to the user who placed it. Eloquent makes managing and working with these relationships easy, and supports a variety of common relationships: -->
데이터베이스 테이블은 서로 관련되어 있는 경우가 많습니다. 예를 들어 블로그 게시물에는 여러 댓글이 있을 수 있고, 주문은 그 주문을 생성한 사용자와 관련될 수 있습니다. Eloquent는 이러한 연관관계를 쉽게 관리하고 다룰 수 있게 해주며, 자주 사용하는 다양한 연관관계를 지원합니다.

<div class="content-list" markdown="1">

- [One To One](#one-to-one)
- [One To Many](#one-to-many)
- [Many To Many](#many-to-many)
- [Has One Through](#has-one-through)
- [Has Many Through](#has-many-through)
- [One To One (Polymorphic)](#one-to-one-polymorphic-relations)
- [One To Many (Polymorphic)](#one-to-many-polymorphic-relations)
- [Many To Many (Polymorphic)](#many-to-many-polymorphic-relations)

</div>

<a name="defining-relationships"></a>
<!-- ## Defining Relationships -->
## Defining Relationships

<!-- Eloquent relationships are defined as methods on your Eloquent model classes. Since relationships also serve as powerful [query builders](/docs/13.x/queries), defining relationships as methods provides powerful method chaining and querying capabilities. For example, we may chain additional query constraints on this `posts` relationship: -->
Eloquent 연관관계는 Eloquent 모델 클래스의 메서드로 정의합니다. 연관관계는 강력한 [query builders](/docs/13.x/queries) 역할도 하므로, 연관관계를 메서드로 정의하면 메서드 체이닝과 쿼리 기능을 강력하게 활용할 수 있습니다. 예를 들어, 다음처럼 이 `posts` 연관관계에 추가 쿼리 제약 조건을 연결할 수 있습니다:

```php
$user->posts()->where('active', 1)->get();
```

<!-- But, before diving too deep into using relationships, let's learn how to define each type of relationship supported by Eloquent. -->
하지만 연관관계를 사용하는 방법을 더 깊이 살펴보기 전에, Eloquent가 지원하는 각 연관관계 타입을 정의하는 방법부터 알아보겠습니다.

<a name="one-to-one"></a>
<!-- ### One to One / Has One -->
### One to One / Has One

<!-- A one-to-one relationship is a very basic type of database relationship. For example, a `User` model might be associated with one `Phone` model. To define this relationship, we will place a `phone` method on the `User` model. The `phone` method should call the `hasOne` method and return its result. The `hasOne` method is available to your model via the model's `Illuminate\Database\Eloquent\Model` base class: -->
일대일 연관관계는 매우 기본적인 데이터베이스 연관관계 유형입니다. 예를 들어 `User` 모델은 하나의 `Phone` 모델과 연결될 수 있습니다. 이 연관관계를 정의하려면 `User` 모델에 `phone` 메서드를 추가합니다. `phone` 메서드는 `hasOne` 메서드를 호출하고 그 결과를 반환해야 합니다. `hasOne` 메서드는 모델의 `Illuminate\Database\Eloquent\Model` 기본 클래스를 통해 사용할 수 있습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Model
{
    /**
     * Get the phone associated with the user.
     */
    public function phone(): HasOne
    {
        return $this->hasOne(Phone::class);
    }
}
```

<!-- The first argument passed to the `hasOne` method is the name of the related model class. Once the relationship is defined, we may retrieve the related record using Eloquent's dynamic properties. Dynamic properties allow you to access relationship methods as if they were properties defined on the model: -->
`hasOne` 메서드에 전달하는 첫 번째 인수는 관련 모델 클래스의 이름입니다. 연관관계를 정의한 뒤에는 Eloquent의 동적 속성을 사용하여 관련 레코드를 조회할 수 있습니다. 동적 속성을 사용하면 연관관계 메서드를 모델에 정의된 속성처럼 접근할 수 있습니다.

```php
$phone = User::find(1)->phone;
```

<!-- Eloquent determines the foreign key of the relationship based on the parent model name. In this case, the `Phone` model is automatically assumed to have a `user_id` foreign key. If you wish to override this convention, you may pass a second argument to the `hasOne` method: -->
Eloquent는 부모 모델 이름을 기준으로 연관관계의 외래 키를 결정합니다. 이 경우 `Phone` 모델에는 `user_id` 외래 키가 있다고 자동으로 가정합니다. 이 규칙을 재정의하고 싶다면 `hasOne` 메서드의 두 번째 인수로 외래 키를 전달할 수 있습니다.

```php
return $this->hasOne(Phone::class, 'foreign_key');
```

<!-- Additionally, Eloquent assumes that the foreign key should have a value matching the primary key column of the parent. In other words, Eloquent will look for the value of the user's `id` column in the `user_id` column of the `Phone` record. If you would like the relationship to use a primary key value other than `id` or your model's primary key, you may pass a third argument to the `hasOne` method: -->
또한 Eloquent는 외래 키가 부모 모델의 기본 키 컬럼과 일치하는 값을 가져야 한다고 가정합니다. 다시 말해 Eloquent는 `Phone` 레코드의 `user_id` 컬럼에서 사용자의 `id` 컬럼 값을 찾습니다. 연관관계에서 `id` 또는 모델의 기본 키가 아닌 다른 기본 키 값을 사용하고 싶다면 `hasOne` 메서드의 세 번째 인수로 값을 전달할 수 있습니다.

```php
return $this->hasOne(Phone::class, 'foreign_key', 'local_key');
```

<a name="one-to-one-defining-the-inverse-of-the-relationship"></a>
<!-- #### Defining the Inverse of the Relationship -->
#### Defining the Inverse of the Relationship

<!-- So, we can access the `Phone` model from our `User` model. Next, let's define a relationship on the `Phone` model that will let us access the user that owns the phone. We can define the inverse of a `hasOne` relationship using the `belongsTo` method: -->
이제 `User` 모델에서 `Phone` 모델에 접근할 수 있습니다. 다음으로는 전화번호를 소유한 사용자에 접근할 수 있도록 `Phone` 모델에 연관관계를 정의해 보겠습니다. `hasOne` 연관관계의 역방향은 `belongsTo` 메서드를 사용하여 정의할 수 있습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Phone extends Model
{
    /**
     * Get the user that owns the phone.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
```

<!-- When invoking the `user` method, Eloquent will attempt to find a `User` model that has an `id` which matches the `user_id` column on the `Phone` model. -->
`user` 메서드를 호출하면 Eloquent는 `Phone` 모델의 `user_id` 컬럼과 일치하는 `id`를 가진 `User` 모델을 찾으려고 시도합니다.

<!-- Eloquent determines the foreign key name by examining the name of the relationship method and suffixing the method name with `_id`. So, in this case, Eloquent assumes that the `Phone` model has a `user_id` column. However, if the foreign key on the `Phone` model is not `user_id`, you may pass a custom key name as the second argument to the `belongsTo` method: -->
Eloquent는 연관관계 메서드의 이름을 확인한 뒤 메서드 이름에 `_id`를 붙여 외래 키 이름을 결정합니다. 따라서 이 경우 Eloquent는 `Phone` 모델에 `user_id` 컬럼이 있다고 가정합니다. 하지만 `Phone` 모델의 외래 키가 `user_id`가 아니라면 `belongsTo` 메서드의 두 번째 인수로 커스텀 키 이름을 전달할 수 있습니다.

```php
/**
 * Get the user that owns the phone.
 */
public function user(): BelongsTo
{
    return $this->belongsTo(User::class, 'foreign_key');
}
```

<!-- If the parent model does not use `id` as its primary key, or you wish to find the associated model using a different column, you may pass a third argument to the `belongsTo` method specifying the parent table's custom key: -->
부모 모델이 기본 키로 `id`를 사용하지 않거나, 다른 컬럼을 사용해 연결된 모델을 찾고 싶다면 `belongsTo` 메서드의 세 번째 인수로 부모 테이블의 커스텀 키를 지정할 수 있습니다.

```php
/**
 * Get the user that owns the phone.
 */
public function user(): BelongsTo
{
    return $this->belongsTo(User::class, 'foreign_key', 'owner_key');
}
```

<a name="one-to-many"></a>
<!-- ### One to Many / Has Many -->
### One to Many / Has Many

<!-- A one-to-many relationship is used to define relationships where a single model is the parent to one or more child models. For example, a blog post may have an infinite number of comments. Like all other Eloquent relationships, one-to-many relationships are defined by defining a method on your Eloquent model: -->
일대다 연관관계는 하나의 모델이 하나 이상의 자식 모델의 부모가 되는 관계를 정의할 때 사용합니다. 예를 들어 블로그 게시물에는 댓글이 무한히 많이 달릴 수 있습니다. 다른 모든 Eloquent 연관관계와 마찬가지로, 일대다 연관관계도 Eloquent 모델에 메서드를 정의하여 만듭니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Post extends Model
{
    /**
     * Get the comments for the blog post.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }
}
```

<!-- Remember, Eloquent will automatically determine the proper foreign key column for the `Comment` model. By convention, Eloquent will take the "snake case" name of the parent model and suffix it with `_id`. So, in this example, Eloquent will assume the foreign key column on the `Comment` model is `post_id`. -->
Eloquent는 `Comment` 모델에 맞는 외래 키 컬럼을 자동으로 결정한다는 점을 기억하세요. 관례에 따라 Eloquent는 부모 모델 이름을 "snake case"로 바꾸고 뒤에 `_id`를 붙입니다. 따라서 이 예제에서 Eloquent는 `Comment` 모델의 외래 키 컬럼이 `post_id`라고 가정합니다.

<!-- Once the relationship method has been defined, we can access the [collection](/docs/13.x/eloquent-collections) of related comments by accessing the `comments` property. Remember, since Eloquent provides "dynamic relationship properties", we can access relationship methods as if they were defined as properties on the model: -->
연관관계 메서드를 정의하면 `comments` 프로퍼티에 접근해 관련 댓글의 [collection](/docs/13.x/eloquent-collections)에 접근할 수 있습니다. Eloquent는 "동적 연관관계 프로퍼티"를 제공하므로, 연관관계 메서드가 모델의 프로퍼티로 정의된 것처럼 접근할 수 있습니다.

```php
use App\Models\Post;

$comments = Post::find(1)->comments;

foreach ($comments as $comment) {
    // ...
}
```

<!-- Since all relationships also serve as query builders, you may add further constraints to the relationship query by calling the `comments` method and continuing to chain conditions onto the query: -->
모든 연관관계는 쿼리 빌더 역할도 하므로, `comments` 메서드를 호출한 뒤 쿼리에 조건을 계속 체이닝하여 연관관계 쿼리에 추가 제약을 적용할 수 있습니다.

```php
$comment = Post::find(1)->comments()
    ->where('title', 'foo')
    ->first();
```

<!-- Like the `hasOne` method, you may also override the foreign and local keys by passing additional arguments to the `hasMany` method: -->
`hasOne` 메서드와 마찬가지로, `hasMany` 메서드에 추가 인수를 전달하여 외래 키와 로컬 키를 재정의할 수도 있습니다.

```php
return $this->hasMany(Comment::class, 'foreign_key');

return $this->hasMany(Comment::class, 'foreign_key', 'local_key');
```

<a name="automatically-hydrating-parent-models-on-children"></a>
<!-- #### Automatically Hydrating Parent Models on Children -->
#### Automatically Hydrating Parent Models on Children

<!-- Even when utilizing Eloquent eager loading, "N + 1" query problems can arise if you try to access the parent model from a child model while looping through the child models: -->
Eloquent의 eager loading을 사용하더라도 자식 모델을 순회하면서 자식 모델에서 부모 모델에 접근하려고 하면 "N + 1" 쿼리 문제가 발생할 수 있습니다:

```php
$posts = Post::with('comments')->get();

foreach ($posts as $post) {
    foreach ($post->comments as $comment) {
        echo $comment->post->title;
    }
}
```

<!-- In the example above, an "N + 1" query problem has been introduced because, even though comments were eager loaded for every `Post` model, Eloquent does not automatically hydrate the parent `Post` on each child `Comment` model. -->
위 예제에서는 모든 `Post` 모델에 대해 comments를 즉시 로드했지만, Eloquent가 각 자식 `Comment` 모델에 부모 `Post`를 자동으로 하이드레이션하지 않기 때문에 "N + 1" 쿼리 문제가 발생합니다.

<!-- If you would like Eloquent to automatically hydrate parent models onto their children, you may invoke the `chaperone` method when defining a `hasMany` relationship: -->
Eloquent가 부모 모델을 자식 모델에 자동으로 하이드레이션하도록 하려면 `hasMany` 연관관계를 정의할 때 `chaperone` 메서드를 호출하면 됩니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Post extends Model
{
    /**
     * Get the comments for the blog post.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class)->chaperone();
    }
}
```

<!-- Or, if you would like to opt-in to automatic parent hydration at run time, you may invoke the `chaperone` model when eager loading the relationship: -->
또는 런타임에 자동 부모 하이드레이션을 활성화하려면 관계를 eager loading할 때 `chaperone` 모델을 호출할 수 있습니다:

```php
use App\Models\Post;

$posts = Post::with([
    'comments' => fn ($comments) => $comments->chaperone(),
])->get();
```

<a name="one-to-many-inverse"></a>
<!-- ### One to Many (Inverse) / Belongs To -->
### One to Many (Inverse) / Belongs To

<!-- Now that we can access all of a post's comments, let's define a relationship to allow a comment to access its parent post. To define the inverse of a `hasMany` relationship, define a relationship method on the child model which calls the `belongsTo` method: -->
이제 게시물의 모든 댓글에 접근할 수 있으므로, 댓글이 자신의 부모 게시물에 접근할 수 있도록 연관관계를 정의해 보겠습니다. `hasMany` 연관관계의 역방향을 정의하려면 자식 모델에 `belongsTo` 메서드를 호출하는 연관관계 메서드를 정의합니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comment extends Model
{
    /**
     * Get the post that owns the comment.
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }
}
```

<!-- Once the relationship has been defined, we can retrieve a comment's parent post by accessing the `post` "dynamic relationship property": -->
연관관계를 정의한 뒤에는 `post` "동적 연관관계 속성"에 접근하여 댓글의 부모 게시물을 조회할 수 있습니다.

```php
use App\Models\Comment;

$comment = Comment::find(1);

return $comment->post->title;
```

<!-- In the example above, Eloquent will attempt to find a `Post` model that has an `id` which matches the `post_id` column on the `Comment` model. -->
위 예제에서 Eloquent는 `Comment` 모델의 `post_id` 컬럼과 일치하는 `id`를 가진 `Post` 모델을 찾으려고 시도합니다.

<!-- Eloquent determines the default foreign key name by examining the name of the relationship method and suffixing the method name with a `_` followed by the name of the parent model's primary key column. So, in this example, Eloquent will assume the `Post` model's foreign key on the `comments` table is `post_id`. -->
Eloquent는 연관관계 메서드의 이름을 확인한 뒤, 메서드 이름에 `_`와 부모 모델의 기본 키 컬럼 이름을 붙여 기본 외래 키 이름을 결정합니다. 따라서 이 예제에서 Eloquent는 `comments` 테이블에 있는 `Post` 모델의 외래 키가 `post_id`라고 가정합니다.

<!-- However, if the foreign key for your relationship does not follow these conventions, you may pass a custom foreign key name as the second argument to the `belongsTo` method: -->
하지만 연관관계의 외래 키가 이러한 관례를 따르지 않는다면 `belongsTo` 메서드의 두 번째 인수로 커스텀 외래 키 이름을 전달할 수 있습니다.

```php
/**
 * Get the post that owns the comment.
 */
public function post(): BelongsTo
{
    return $this->belongsTo(Post::class, 'foreign_key');
}
```

<!-- If your parent model does not use `id` as its primary key, or you wish to find the associated model using a different column, you may pass a third argument to the `belongsTo` method specifying your parent table's custom key: -->
부모 모델이 기본 키로 `id`를 사용하지 않거나, 다른 컬럼을 사용해 연결된 모델을 찾고 싶다면 `belongsTo` 메서드의 세 번째 인수로 부모 테이블의 커스텀 키를 지정할 수 있습니다.

```php
/**
 * Get the post that owns the comment.
 */
public function post(): BelongsTo
{
    return $this->belongsTo(Post::class, 'foreign_key', 'owner_key');
}
```

<a name="default-models"></a>
<!-- #### Default Models -->
#### Default Models

<!-- The `belongsTo`, `hasOne`, `hasOneThrough`, and `morphOne` relationships allow you to define a default model that will be returned if the given relationship is `null`. This pattern is often referred to as the [Null Object pattern](https://en.wikipedia.org/wiki/Null_Object_pattern) and can help remove conditional checks in your code. In the following example, the `user` relation will return an empty `App\Models\User` model if no user is attached to the `Post` model: -->
`belongsTo`, `hasOne`, `hasOneThrough`, `morphOne` 연관관계에서는 주어진 연관관계가 `null`일 때 반환할 기본 모델을 정의할 수 있습니다. 이 패턴은 흔히 [Null Object pattern](https://en.wikipedia.org/wiki/Null_Object_pattern)이라고 부르며, 코드에서 조건문 검사를 줄이는 데 도움이 됩니다. 다음 예제에서 `Post` 모델에 연결된 사용자가 없으면 `user` 연관관계는 빈 `App\Models\User` 모델을 반환합니다.

```php
/**
 * Get the author of the post.
 */
public function user(): BelongsTo
{
    return $this->belongsTo(User::class)->withDefault();
}
```

<!-- To populate the default model with attributes, you may pass an array or closure to the `withDefault` method: -->
기본 모델에 속성을 채우려면 `withDefault` 메서드에 배열이나 클로저를 전달할 수 있습니다.

```php
/**
 * Get the author of the post.
 */
public function user(): BelongsTo
{
    return $this->belongsTo(User::class)->withDefault([
        'name' => 'Guest Author',
    ]);
}

/**
 * Get the author of the post.
 */
public function user(): BelongsTo
{
    return $this->belongsTo(User::class)->withDefault(function (User $user, Post $post) {
        $user->name = 'Guest Author';
    });
}
```

<a name="querying-belongs-to-relationships"></a>
<!-- #### Querying Belongs To Relationships -->
#### Querying Belongs To Relationships

<!-- When querying for the children of a "belongs to" relationship, you may manually build the `where` clause to retrieve the corresponding Eloquent models: -->
"belongs to" 연관관계의 자식 모델을 쿼리할 때는 해당 Eloquent 모델을 조회하기 위해 `where` 절을 직접 작성할 수 있습니다.

```php
use App\Models\Post;

$posts = Post::where('user_id', $user->id)->get();
```

<!-- However, you may find it more convenient to use the `whereBelongsTo` method, which will automatically determine the proper relationship and foreign key for the given model: -->
하지만 `whereBelongsTo` 메서드를 사용하면 더 편리할 수 있습니다. 이 메서드는 주어진 모델에 맞는 연관관계와 외래 키를 자동으로 결정합니다.

```php
$posts = Post::whereBelongsTo($user)->get();
```

<!-- You may also provide a [collection](/docs/13.x/eloquent-collections) instance to the `whereBelongsTo` method. When doing so, Laravel will retrieve models that belong to any of the parent models within the collection: -->
[collection](/docs/13.x/eloquent-collections) 인스턴스를 `whereBelongsTo` 메서드에 전달할 수도 있습니다. 이 경우 Laravel은 컬렉션에 포함된 부모 모델 중 하나에 속하는 모델을 조회합니다:

```php
$users = User::where('vip', true)->get();

$posts = Post::whereBelongsTo($users)->get();
```

<!-- By default, Laravel will determine the relationship associated with the given model based on the class name of the model; however, you may specify the relationship name manually by providing it as the second argument to the `whereBelongsTo` method: -->
기본적으로 Laravel은 모델의 클래스 이름을 기준으로 주어진 모델과 연결된 연관관계를 결정합니다. 하지만 `whereBelongsTo` 메서드의 두 번째 인수로 연관관계 이름을 전달해 수동으로 지정할 수도 있습니다.

```php
$posts = Post::whereBelongsTo($user, 'author')->get();
```

<a name="has-one-of-many"></a>
<!-- ### Has One of Many -->
### Has One of Many

<!-- Sometimes a model may have many related models, yet you want to easily retrieve the "latest" or "oldest" related model of the relationship. For example, a `User` model may be related to many `Order` models, but you want to define a convenient way to interact with the most recent order the user has placed. You may accomplish this using the `hasOne` relationship type combined with the `ofMany` methods: -->
때로는 한 모델에 여러 관련 모델이 있지만, 그 관계에서 "최신" 또는 "가장 오래된" 관련 모델을 쉽게 가져오고 싶을 수 있습니다. 예를 들어 `User` 모델은 여러 `Order` 모델과 관련될 수 있지만, 사용자가 가장 최근에 생성한 주문과 편리하게 상호작용하는 방법을 정의하고 싶을 수 있습니다. `hasOne` 관계 타입과 `ofMany` 메서드를 함께 사용하면 이를 구현할 수 있습니다.

```php
/**
 * Get the user's most recent order.
 */
public function latestOrder(): HasOne
{
    return $this->hasOne(Order::class)->latestOfMany();
}
```

<!-- Likewise, you may define a method to retrieve the "oldest", or first, related model of a relationship: -->
마찬가지로 연관관계에서 "가장 오래된", 즉 첫 번째 연관 모델을 조회하는 메서드를 정의할 수도 있습니다:

```php
/**
 * Get the user's oldest order.
 */
public function oldestOrder(): HasOne
{
    return $this->hasOne(Order::class)->oldestOfMany();
}
```

<!-- By default, the `latestOfMany` and `oldestOfMany` methods will retrieve the latest or oldest related model based on the model's primary key, which must be sortable. However, sometimes you may wish to retrieve a single model from a larger relationship using a different sorting criteria. -->
기본적으로 `latestOfMany` 및 `oldestOfMany` 메서드는 정렬할 수 있어야 하는 모델의 기본 키를 기준으로 가장 최신 또는 가장 오래된 연관 모델을 가져옵니다. 그러나 때로는 다른 정렬 기준을 사용해 더 큰 연관관계에서 단일 모델을 가져오고 싶을 수 있습니다.

<!-- For example, using the `ofMany` method, you may retrieve the user's most expensive order. The `ofMany` method accepts the sortable column as its first argument and which aggregate function (`min` or `max`) to apply when querying for the related model: -->
예를 들어 `ofMany` 메서드를 사용하면 사용자의 가장 비싼 주문을 가져올 수 있습니다. `ofMany` 메서드는 첫 번째 인수로 정렬 가능한 컬럼을 받고, 관련 모델을 조회할 때 적용할 집계 함수(`min` 또는 `max`)를 두 번째 인수로 받습니다.

```php
/**
 * Get the user's largest order.
 */
public function largestOrder(): HasOne
{
    return $this->hasOne(Order::class)->ofMany('price', 'max');
}
```

> [!WARNING]
> PostgreSQL은 UUID 컬럼에 대해 `MAX` 함수를 실행하는 기능을 지원하지 않으므로, 현재 PostgreSQL UUID 컬럼과 one-of-many 연관관계를 함께 사용할 수 없습니다.

<a name="converting-many-relationships-to-has-one-relationships"></a>
<!-- #### Converting "Many" Relationships to Has One Relationships -->
#### Converting "Many" Relationships to Has One Relationships

<!-- Often, when retrieving a single model using the `latestOfMany`, `oldestOfMany`, or `ofMany` methods, you already have a "has many" relationship defined for the same model. For convenience, Laravel allows you to easily convert this relationship into a "has one" relationship by invoking the `one` method on the relationship: -->
`latestOfMany`, `oldestOfMany`, 또는 `ofMany` 메서드를 사용해 단일 모델을 가져올 때, 같은 모델에 대해 이미 "has many" 관계가 정의되어 있는 경우가 많습니다. 편의를 위해 Laravel은 관계에서 `one` 메서드를 호출하여 이 관계를 "has one" 관계로 쉽게 변환할 수 있도록 합니다.

```php
/**
 * Get the user's orders.
 */
public function orders(): HasMany
{
    return $this->hasMany(Order::class);
}

/**
 * Get the user's largest order.
 */
public function largestOrder(): HasOne
{
    return $this->orders()->one()->ofMany('price', 'max');
}
```

<!-- You may also use the `one` method to convert `HasManyThrough` relationships to `HasOneThrough` relationships: -->
또한 `one` 메서드를 사용해 `HasManyThrough` 관계를 `HasOneThrough` 관계로 변환할 수도 있습니다.

```php
public function latestDeployment(): HasOneThrough
{
    return $this->deployments()->one()->latestOfMany();
}
```

<a name="advanced-has-one-of-many-relationships"></a>
<!-- #### Advanced Has One of Many Relationships -->
#### Advanced Has One of Many Relationships

<!-- It is possible to construct more advanced "has one of many" relationships. For example, a `Product` model may have many associated `Price` models that are retained in the system even after new pricing is published. In addition, new pricing data for the product may be able to be published in advance to take effect at a future date via a `published_at` column. -->
더 고급 형태의 "다수 중 하나의 has one" 관계를 구성할 수도 있습니다. 예를 들어 `Product` 모델은 여러 관련 `Price` 모델을 가질 수 있으며, 새로운 가격이 게시된 뒤에도 기존 가격 데이터가 시스템에 보관될 수 있습니다. 또한 제품의 새로운 가격 데이터는 `published_at` 컬럼을 통해 미래 시점부터 적용되도록 미리 게시될 수도 있습니다.

<!-- So, in summary, we need to retrieve the latest published pricing where the published date is not in the future. In addition, if two prices have the same published date, we will prefer the price with the greatest ID. To accomplish this, we must pass an array to the `ofMany` method that contains the sortable columns which determine the latest price. In addition, a closure will be provided as the second argument to the `ofMany` method. This closure will be responsible for adding additional publish date constraints to the relationship query: -->
정리하면, 게시일이 미래가 아닌 가격 중에서 가장 최근에 게시된 가격을 가져와야 합니다. 또한 두 가격의 게시일이 같다면 ID가 더 큰 가격을 우선해야 합니다. 이를 구현하려면 최신 가격을 결정하는 정렬 가능한 컬럼이 포함된 배열을 `ofMany` 메서드에 전달해야 합니다. 또한 `ofMany` 메서드의 두 번째 인수로 클로저를 제공합니다. 이 클로저는 관계 쿼리에 추가적인 게시일 제약 조건을 더하는 역할을 합니다.

```php
/**
 * Get the current pricing for the product.
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
<!-- ### Has One Through -->
### Has One Through

<!-- The "has-one-through" relationship defines a one-to-one relationship with another model. However, this relationship indicates that the declaring model can be matched with one instance of another model by proceeding _through_ a third model. -->
"has-one-through" 관계는 다른 모델과의 일대일 관계를 정의합니다. 다만 이 관계는 선언하는 모델이 세 번째 모델을 _거쳐_ 다른 모델의 한 인스턴스와 연결될 수 있음을 나타냅니다.

<!-- For example, in a vehicle repair shop application, each `Mechanic` model may be associated with one `Car` model, and each `Car` model may be associated with one `Owner` model. While the mechanic and the owner have no direct relationship within the database, the mechanic can access the owner _through_ the `Car` model. Let's look at the tables necessary to define this relationship: -->
예를 들어 차량 수리점 애플리케이션에서 각 `Mechanic` 모델은 하나의 `Car` 모델과 연결될 수 있고, 각 `Car` 모델은 하나의 `Owner` 모델과 연결될 수 있습니다. 정비사와 소유자는 데이터베이스 안에서 직접적인 관계를 갖고 있지 않지만, 정비사는 `Car` 모델을 _통해_ 소유자에 접근할 수 있습니다. 이 관계를 정의하는 데 필요한 테이블을 살펴보겠습니다.

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

<!-- Now that we have examined the table structure for the relationship, let's define the relationship on the `Mechanic` model: -->
이제 관계의 테이블 구조를 살펴보았으니, `Mechanic` 모델에 관계를 정의해 보겠습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;

class Mechanic extends Model
{
    /**
     * Get the car's owner.
     */
    public function carOwner(): HasOneThrough
    {
        return $this->hasOneThrough(Owner::class, Car::class);
    }
}
```

<!-- The first argument passed to the `hasOneThrough` method is the name of the final model we wish to access, while the second argument is the name of the intermediate model. -->
`hasOneThrough` 메서드에 전달되는 첫 번째 인수는 접근하려는 최종 모델의 이름이며, 두 번째 인수는 중간 모델의 이름입니다.

<!-- Or, if the relevant relationships have already been defined on all of the models involved in the relationship, you may fluently define a "has-one-through" relationship by invoking the `through` method and supplying the names of those relationships. For example, if the `Mechanic` model has a `cars` relationship and the `Car` model has an `owner` relationship, you may define a "has-one-through" relationship connecting the mechanic and the owner like so: -->
또는 관계에 포함된 모든 모델에 관련 관계가 이미 정의되어 있다면, `through` 메서드를 호출하고 해당 관계 이름을 제공하여 "has-one-through" 관계를 유창하게 정의할 수 있습니다. 예를 들어 `Mechanic` 모델에 `cars` 관계가 있고 `Car` 모델에 `owner` 관계가 있다면, 다음과 같이 정비사와 소유자를 연결하는 "has-one-through" 관계를 정의할 수 있습니다.

```php
// String based syntax...
return $this->through('cars')->has('owner');

// Dynamic syntax...
return $this->throughCars()->hasOwner();
```

<a name="has-one-through-key-conventions"></a>
<!-- #### Key Conventions -->
#### Key Conventions

<!-- Typical Eloquent foreign key conventions will be used when performing the relationship's queries. If you would like to customize the keys of the relationship, you may pass them as the third and fourth arguments to the `hasOneThrough` method. The third argument is the name of the foreign key on the intermediate model. The fourth argument is the name of the foreign key on the final model. The fifth argument is the local key, while the sixth argument is the local key of the intermediate model: -->
관계 쿼리를 수행할 때는 일반적인 Eloquent 외래 키 규칙이 사용됩니다. 관계의 키를 직접 지정하고 싶다면 `hasOneThrough` 메서드의 세 번째와 네 번째 인수로 전달할 수 있습니다. 세 번째 인수는 중간 모델에 있는 외래 키의 이름입니다. 네 번째 인수는 최종 모델에 있는 외래 키의 이름입니다. 다섯 번째 인수는 로컬 키이며, 여섯 번째 인수는 중간 모델의 로컬 키입니다.

```php
class Mechanic extends Model
{
    /**
     * Get the car's owner.
     */
    public function carOwner(): HasOneThrough
    {
        return $this->hasOneThrough(
            Owner::class,
            Car::class,
            'mechanic_id', // Foreign key on the cars table...
            'car_id', // Foreign key on the owners table...
            'id', // Local key on the mechanics table...
            'id' // Local key on the cars table...
        );
    }
}
```

<!-- Or, as discussed earlier, if the relevant relationships have already been defined on all of the models involved in the relationship, you may fluently define a "has-one-through" relationship by invoking the `through` method and supplying the names of those relationships. This approach offers the advantage of reusing the key conventions already defined on the existing relationships: -->
또는 앞서 설명한 것처럼, 관계에 포함된 모든 모델에 관련 관계가 이미 정의되어 있다면 `through` 메서드를 호출하고 해당 관계 이름을 제공하여 "has-one-through" 관계를 유창하게 정의할 수 있습니다. 이 접근 방식은 기존 관계에 이미 정의된 키 규칙을 재사용할 수 있다는 장점이 있습니다.

```php
// String based syntax...
return $this->through('cars')->has('owner');

// Dynamic syntax...
return $this->throughCars()->hasOwner();
```

<a name="has-many-through"></a>
<!-- ### Has Many Through -->
### Has Many Through

<!-- The "has-many-through" relationship provides a convenient way to access distant relations via an intermediate relation. For example, let's assume we are building a deployment platform like [Laravel Cloud](https://cloud.laravel.com). An `Application` model might access many `Deployment` models through an intermediate `Environment` model. Using this example, you could easily gather all deployments for a given application. Let's look at the tables required to define this relationship: -->
"has-many-through" 관계는 중간 관계를 통해 멀리 떨어진 관계에 편리하게 접근할 수 있는 방법을 제공합니다. 예를 들어 [Laravel Cloud](https://cloud.laravel.com) 같은 배포 플랫폼을 만들고 있다고 가정해 보겠습니다. `Application` 모델은 중간 `Environment` 모델을 통해 여러 `Deployment` 모델에 접근할 수 있습니다. 이 예시를 사용하면 특정 애플리케이션의 모든 배포를 쉽게 모을 수 있습니다. 이 관계를 정의하는 데 필요한 테이블을 살펴보겠습니다.

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

<!-- Now that we have examined the table structure for the relationship, let's define the relationship on the `Application` model: -->
이제 관계의 테이블 구조를 살펴보았으니, `Application` 모델에 관계를 정의해 보겠습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Application extends Model
{
    /**
     * Get all of the deployments for the application.
     */
    public function deployments(): HasManyThrough
    {
        return $this->hasManyThrough(Deployment::class, Environment::class);
    }
}
```

<!-- The first argument passed to the `hasManyThrough` method is the name of the final model we wish to access, while the second argument is the name of the intermediate model. -->
`hasManyThrough` 메서드에 전달되는 첫 번째 인수는 접근하려는 최종 모델의 이름이며, 두 번째 인수는 중간 모델의 이름입니다.

<!-- Or, if the relevant relationships have already been defined on all of the models involved in the relationship, you may fluently define a "has-many-through" relationship by invoking the `through` method and supplying the names of those relationships. For example, if the `Application` model has a `environments` relationship and the `Environment` model has a `deployments` relationship, you may define a "has-many-through" relationship connecting the application and the deployments like so: -->
또는 관계에 포함된 모든 모델에 관련 관계가 이미 정의되어 있다면, `through` 메서드를 호출하고 해당 관계 이름을 제공하여 "has-many-through" 관계를 유창하게 정의할 수 있습니다. 예를 들어 `Application` 모델에 `environments` 관계가 있고 `Environment` 모델에 `deployments` 관계가 있다면, 다음과 같이 애플리케이션과 배포를 연결하는 "has-many-through" 관계를 정의할 수 있습니다.

```php
// String based syntax...
return $this->through('environments')->has('deployments');

// Dynamic syntax...
return $this->throughEnvironments()->hasDeployments();
```

<!-- Though the `Deployment` model's table does not contain a `application_id` column, the `hasManyThrough` relation provides access to an application's deployments via `$application->deployments`. To retrieve these models, Eloquent inspects the `application_id` column on the intermediate `Environment` model's table. After finding the relevant environment IDs, they are used to query the `Deployment` model's table. -->
`Deployment` 모델의 테이블에는 `application_id` 컬럼이 없지만, `hasManyThrough` 관계를 사용하면 `$application->deployments`를 통해 애플리케이션의 배포에 접근할 수 있습니다. 이러한 모델을 가져오기 위해 Eloquent는 중간 `Environment` 모델의 테이블에서 `application_id` 컬럼을 확인합니다. 관련 환경 ID를 찾은 뒤, 그 ID를 사용해 `Deployment` 모델의 테이블을 조회합니다.

<a name="has-many-through-key-conventions"></a>
<!-- #### Key Conventions -->
#### Key Conventions

<!-- Typical Eloquent foreign key conventions will be used when performing the relationship's queries. If you would like to customize the keys of the relationship, you may pass them as the third and fourth arguments to the `hasManyThrough` method. The third argument is the name of the foreign key on the intermediate model. The fourth argument is the name of the foreign key on the final model. The fifth argument is the local key, while the sixth argument is the local key of the intermediate model: -->
관계 쿼리를 수행할 때는 일반적인 Eloquent 외래 키 규칙이 사용됩니다. 관계의 키를 직접 지정하고 싶다면 `hasManyThrough` 메서드의 세 번째와 네 번째 인수로 전달할 수 있습니다. 세 번째 인수는 중간 모델에 있는 외래 키의 이름입니다. 네 번째 인수는 최종 모델에 있는 외래 키의 이름입니다. 다섯 번째 인수는 로컬 키이며, 여섯 번째 인수는 중간 모델의 로컬 키입니다.

```php
class Application extends Model
{
    public function deployments(): HasManyThrough
    {
        return $this->hasManyThrough(
            Deployment::class,
            Environment::class,
            'application_id', // Foreign key on the environments table...
            'environment_id', // Foreign key on the deployments table...
            'id', // Local key on the applications table...
            'id' // Local key on the environments table...
        );
    }
}
```

<!-- Or, as discussed earlier, if the relevant relationships have already been defined on all of the models involved in the relationship, you may fluently define a "has-many-through" relationship by invoking the `through` method and supplying the names of those relationships. This approach offers the advantage of reusing the key conventions already defined on the existing relationships: -->
또는 앞서 설명한 것처럼, 관계에 포함된 모든 모델에 관련 관계가 이미 정의되어 있다면 `through` 메서드를 호출하고 해당 관계 이름을 제공하여 "has-many-through" 관계를 유창하게 정의할 수 있습니다. 이 접근 방식은 기존 관계에 이미 정의된 키 규칙을 재사용할 수 있다는 장점이 있습니다.

```php
// String based syntax...
return $this->through('environments')->has('deployments');

// Dynamic syntax...
return $this->throughEnvironments()->hasDeployments();
```

<a name="scoped-relationships"></a>
<!-- ### Scoped Relationships -->
### Scoped Relationships

<!-- It's common to add additional methods to models that constrain relationships. For example, you might add a `featuredPosts` method to a `User` model which constrains the broader `posts` relationship with an additional `where` constraint: -->
관계에 제약을 추가하는 메서드를 모델에 더하는 일은 흔합니다. 예를 들어 `User` 모델에 `featuredPosts` 메서드를 추가해, 더 넓은 `posts` 관계에 추가 `where` 제약을 적용할 수 있습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Model
{
    /**
     * Get the user's posts.
     */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class)->latest();
    }

    /**
     * Get the user's featured posts.
     */
    public function featuredPosts(): HasMany
    {
        return $this->posts()->where('featured', true);
    }
}
```

<!-- However, if you attempt to create a model via the `featuredPosts` method, its `featured` attribute would not be set to `true`. If you would like to create models via relationship methods and also specify attributes that should be added to all models created via that relationship, you may use the `withAttributes` method when building the relationship query: -->
하지만 `featuredPosts` 메서드를 통해 모델을 생성하려고 하면 해당 모델의 `featured` 속성은 `true`로 설정되지 않습니다. 관계 메서드를 통해 모델을 생성하면서, 그 관계를 통해 생성되는 모든 모델에 추가되어야 하는 속성도 함께 지정하고 싶다면, 관계 쿼리를 만들 때 `withAttributes` 메서드를 사용할 수 있습니다.

```php
/**
 * Get the user's featured posts.
 */
public function featuredPosts(): HasMany
{
    return $this->posts()->withAttributes(['featured' => true]);
}
```

<!-- The `withAttributes` method will add `where` conditions to the query using the given attributes, and it will also add the given attributes to any models created via the relationship method: -->
`withAttributes` 메서드는 주어진 속성을 사용해 쿼리에 `where` 조건을 추가하며, 관계 메서드를 통해 생성되는 모든 모델에도 해당 속성을 추가합니다.

```php
$post = $user->featuredPosts()->create(['title' => 'Featured Post']);

$post->featured; // true
```

<!-- To instruct the `withAttributes` method to not add `where` conditions to the query, you may set the `asConditions` argument to `false`: -->
`withAttributes` 메서드가 쿼리에 `where` 조건을 추가하지 않도록 하려면 `asConditions` 인수를 `false`로 설정하면 됩니다.

```php
return $this->posts()->withAttributes(['featured' => true], asConditions: false);
```

<a name="many-to-many"></a>
<!-- ## Many to Many Relationships -->
## Many to Many Relationships

<!-- Many-to-many relations are slightly more complicated than `hasOne` and `hasMany` relationships. An example of a many-to-many relationship is a user that has many roles and those roles are also shared by other users in the application. For example, a user may be assigned the role of "Author" and "Editor"; however, those roles may also be assigned to other users as well. So, a user has many roles and a role has many users. -->
다대다 관계는 `hasOne`과 `hasMany` 관계보다 조금 더 복잡합니다. 다대다 관계의 예로는 여러 역할을 가진 사용자가 있고, 그 역할들이 애플리케이션의 다른 사용자에게도 공유되는 경우가 있습니다. 예를 들어 한 사용자에게 "Author"와 "Editor" 역할을 할당할 수 있습니다. 하지만 그 역할들은 다른 사용자에게도 할당될 수 있습니다. 따라서 사용자는 여러 역할을 가지고, 역할도 여러 사용자를 가집니다.

<a name="many-to-many-table-structure"></a>
<!-- #### Table Structure -->
#### Table Structure

<!-- To define this relationship, three database tables are needed: `users`, `roles`, and `role_user`. The `role_user` table is derived from the alphabetical order of the related model names and contains `user_id` and `role_id` columns. This table is used as an intermediate table linking the users and roles. -->
이 관계를 정의하려면 `users`, `roles`, `role_user`라는 세 개의 데이터베이스 테이블이 필요합니다. `role_user` 테이블은 관련 모델 이름을 알파벳 순서로 배열해 만든 이름이며, `user_id`와 `role_id` 컬럼을 포함합니다. 이 테이블은 사용자와 역할을 연결하는 중간 테이블로 사용됩니다.

<!-- Remember, since a role can belong to many users, we cannot simply place a `user_id` column on the `roles` table. This would mean that a role could only belong to a single user. In order to provide support for roles being assigned to multiple users, the `role_user` table is needed. We can summarize the relationship's table structure like so: -->
역할은 여러 사용자에 속할 수 있으므로, 단순히 `roles` 테이블에 `user_id` 컬럼을 둘 수는 없습니다. 그렇게 하면 하나의 역할이 단 한 명의 사용자에게만 속할 수 있다는 뜻이 됩니다. 역할을 여러 사용자에게 할당할 수 있도록 지원하려면 `role_user` 테이블이 필요합니다. 관계의 테이블 구조를 다음과 같이 요약할 수 있습니다.

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
<!-- #### Model Structure -->
#### Model Structure

<!-- Many-to-many relationships are defined by writing a method that returns the result of the `belongsToMany` method. The `belongsToMany` method is provided by the `Illuminate\Database\Eloquent\Model` base class that is used by all of your application's Eloquent models. For example, let's define a `roles` method on our `User` model. The first argument passed to this method is the name of the related model class: -->
다대다 관계는 `belongsToMany` 메서드의 결과를 반환하는 메서드를 작성하여 정의합니다. `belongsToMany` 메서드는 애플리케이션의 모든 Eloquent 모델이 사용하는 `Illuminate\Database\Eloquent\Model` 기본 클래스에서 제공됩니다. 예를 들어 `User` 모델에 `roles` 메서드를 정의해 보겠습니다. 이 메서드에 전달되는 첫 번째 인수는 관련 모델 클래스의 이름입니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Model
{
    /**
     * The roles that belong to the user.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }
}
```

<!-- Once the relationship is defined, you may access the user's roles using the `roles` dynamic relationship property: -->
관계를 정의한 뒤에는 `roles` 동적 관계 속성을 사용해 사용자의 역할에 접근할 수 있습니다.

```php
use App\Models\User;

$user = User::find(1);

foreach ($user->roles as $role) {
    // ...
}
```

<!-- Since all relationships also serve as query builders, you may add further constraints to the relationship query by calling the `roles` method and continuing to chain conditions onto the query: -->
모든 연관관계는 쿼리 빌더 역할도 하므로, `roles` 메서드를 호출한 뒤 쿼리에 조건을 계속 체이닝하여 연관관계 쿼리에 추가 제약 조건을 더할 수 있습니다:

```php
$roles = User::find(1)->roles()->orderBy('name')->get();
```

<!-- To determine the table name of the relationship's intermediate table, Eloquent will join the two related model names in alphabetical order. However, you are free to override this convention. You may do so by passing a second argument to the `belongsToMany` method: -->
연관관계의 중간 테이블 이름을 결정할 때, Eloquent는 관련된 두 모델 이름을 알파벳 순서로 결합합니다. 하지만 이 규칙은 자유롭게 재정의할 수 있습니다. `belongsToMany` 메서드에 두 번째 인수를 전달하면 됩니다:

```php
return $this->belongsToMany(Role::class, 'role_user');
```

<!-- In addition to customizing the name of the intermediate table, you may also customize the column names of the keys on the table by passing additional arguments to the `belongsToMany` method. The third argument is the foreign key name of the model on which you are defining the relationship, while the fourth argument is the foreign key name of the model that you are joining to: -->
중간 테이블 이름을 사용자 지정하는 것뿐만 아니라, `belongsToMany` 메서드에 추가 인수를 전달하여 테이블에 있는 키의 컬럼 이름도 사용자 지정할 수 있습니다. 세 번째 인수는 이 연관관계를 정의하고 있는 모델의 외래 키 이름이고, 네 번째 인수는 조인할 모델의 외래 키 이름입니다:

```php
return $this->belongsToMany(Role::class, 'role_user', 'user_id', 'role_id');
```

<a name="many-to-many-defining-the-inverse-of-the-relationship"></a>
<!-- #### Defining the Inverse of the Relationship -->
#### Defining the Inverse of the Relationship

<!-- To define the "inverse" of a many-to-many relationship, you should define a method on the related model which also returns the result of the `belongsToMany` method. To complete our user / role example, let's define the `users` method on the `Role` model: -->
다대다 연관관계의 "역방향"을 정의하려면, 관련 모델에 `belongsToMany` 메서드의 결과를 반환하는 메서드를 정의해야 합니다. 사용자 / 역할 예제를 완성하기 위해 `Role` 모델에 `users` 메서드를 정의해 보겠습니다:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    /**
     * The users that belong to the role.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }
}
```

<!-- As you can see, the relationship is defined exactly the same as its `User` model counterpart with the exception of referencing the `App\Models\User` model. Since we're reusing the `belongsToMany` method, all of the usual table and key customization options are available when defining the "inverse" of many-to-many relationships. -->
보시다시피 `App\Models\User` 모델을 참조한다는 점을 제외하면, 연관관계는 대응되는 `User` 모델의 연관관계와 정확히 같은 방식으로 정의됩니다. `belongsToMany` 메서드를 재사용하므로, 다대다 연관관계의 "역방향"을 정의할 때도 일반적인 테이블 및 키 사용자 지정 옵션을 모두 사용할 수 있습니다.

<a name="retrieving-intermediate-table-columns"></a>
<!-- ### Retrieving Intermediate Table Columns -->
### Retrieving Intermediate Table Columns

<!-- As you have already learned, working with many-to-many relations requires the presence of an intermediate table. Eloquent provides some very helpful ways of interacting with this table. For example, let's assume our `User` model has many `Role` models that it is related to. After accessing this relationship, we may access the intermediate table using the `pivot` attribute on the models: -->
이미 살펴본 것처럼 다대다 연관관계를 다루려면 중간 테이블이 필요합니다. Eloquent는 이 테이블과 상호작용할 수 있는 매우 유용한 방법을 제공합니다. 예를 들어 `User` 모델이 여러 `Role` 모델과 관련되어 있다고 가정해 보겠습니다. 이 연관관계에 접근한 뒤에는 모델의 `pivot` 속성을 사용하여 중간 테이블에 접근할 수 있습니다:

```php
use App\Models\User;

$user = User::find(1);

foreach ($user->roles as $role) {
    echo $role->pivot->created_at;
}
```

<!-- Notice that each `Role` model we retrieve is automatically assigned a `pivot` attribute. This attribute contains a model representing the intermediate table. -->
조회된 각 `Role` 모델에 `pivot` 속성이 자동으로 할당된다는 점에 주목하세요. 이 속성은 중간 테이블을 나타내는 모델을 담고 있습니다.

<!-- By default, only the model keys will be present on the `pivot` model. If your intermediate table contains extra attributes, you must specify them when defining the relationship: -->
기본적으로 `pivot` 모델에는 모델 키만 포함됩니다. 중간 테이블에 추가 속성이 있다면, 연관관계를 정의할 때 해당 속성을 지정해야 합니다:

```php
return $this->belongsToMany(Role::class)->withPivot('active', 'created_by');
```

<!-- If you would like your intermediate table to have `created_at` and `updated_at` timestamps that are automatically maintained by Eloquent, call the `withTimestamps` method when defining the relationship: -->
중간 테이블에 `created_at` 및 `updated_at` 타임스탬프를 두고 Eloquent가 자동으로 관리하게 하려면, 연관관계를 정의할 때 `withTimestamps` 메서드를 호출하세요:

```php
return $this->belongsToMany(Role::class)->withTimestamps();
```

> [!WARNING]
> Eloquent가 자동으로 관리하는 타임스탬프를 사용하는 중간 테이블에는 `created_at` 및 `updated_at` 타임스탬프 컬럼이 모두 있어야 합니다.

<a name="customizing-the-pivot-attribute-name"></a>
<!-- #### Customizing the `pivot` Attribute Name -->
#### Customizing the `pivot` Attribute Name

<!-- As noted previously, attributes from the intermediate table may be accessed on models via the `pivot` attribute. However, you are free to customize the name of this attribute to better reflect its purpose within your application. -->
앞서 설명했듯이, 중간 테이블의 속성은 모델에서 `pivot` 속성을 통해 접근할 수 있습니다. 하지만 애플리케이션 안에서의 목적을 더 잘 드러내도록 이 속성의 이름을 자유롭게 사용자 지정할 수 있습니다.

<!-- For example, if your application contains users that may subscribe to podcasts, you likely have a many-to-many relationship between users and podcasts. If this is the case, you may wish to rename your intermediate table attribute to `subscription` instead of `pivot`. This can be done using the `as` method when defining the relationship: -->
예를 들어 애플리케이션에 팟캐스트를 구독할 수 있는 사용자가 있다면, 사용자와 팟캐스트 사이에는 다대다 연관관계가 있을 가능성이 높습니다. 이런 경우 중간 테이블 속성의 이름을 `pivot` 대신 `subscription`으로 바꾸고 싶을 수 있습니다. 연관관계를 정의할 때 `as` 메서드를 사용하면 됩니다:

```php
return $this->belongsToMany(Podcast::class)
    ->as('subscription')
    ->withTimestamps();
```

<!-- Once the custom intermediate table attribute has been specified, you may access the intermediate table data using the customized name: -->
사용자 지정 중간 테이블 속성이 지정되면, 사용자 지정한 이름으로 중간 테이블 데이터에 접근할 수 있습니다:

```php
$users = User::with('podcasts')->get();

foreach ($users->flatMap->podcasts as $podcast) {
    echo $podcast->subscription->created_at;
}
```

<a name="filtering-queries-via-intermediate-table-columns"></a>
<!-- ### Filtering Queries via Intermediate Table Columns -->
### Filtering Queries via Intermediate Table Columns

<!-- You can also filter the results returned by `belongsToMany` relationship queries using the `wherePivot`, `wherePivotIn`, `wherePivotNotIn`, `wherePivotBetween`, `wherePivotNotBetween`, `wherePivotNull`, and `wherePivotNotNull` methods when defining the relationship: -->
연관관계를 정의할 때 `wherePivot`, `wherePivotIn`, `wherePivotNotIn`, `wherePivotBetween`, `wherePivotNotBetween`, `wherePivotNull`, `wherePivotNotNull` 메서드를 사용하여 `belongsToMany` 연관관계 쿼리가 반환하는 결과를 필터링할 수도 있습니다:

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

<!-- The `wherePivot` adds a where clause constraint to the query, but does not add the specified value when creating new models via the defined relationship. If you need to both query and create relationships with a particular pivot value, you may use the `withPivotValue` method: -->
`wherePivot`는 쿼리에 where 절 제약 조건을 추가하지만, 정의된 연관관계를 통해 새 모델을 생성할 때 지정된 값을 추가하지는 않습니다. 특정 pivot 값으로 연관관계를 조회하면서 생성도 해야 한다면 `withPivotValue` 메서드를 사용할 수 있습니다:

```php
return $this->belongsToMany(Role::class)
    ->withPivotValue('approved', 1);
```

<a name="ordering-queries-via-intermediate-table-columns"></a>
<!-- ### Ordering Queries via Intermediate Table Columns -->
### Ordering Queries via Intermediate Table Columns

<!-- You can order the results returned by `belongsToMany` relationship queries using the `orderByPivot` and `orderByPivotDesc` methods. In the following example, we will retrieve all of the latest badges for the user: -->
`orderByPivot` 및 `orderByPivotDesc` 메서드를 사용하여 `belongsToMany` 연관관계 쿼리가 반환하는 결과를 정렬할 수 있습니다. 다음 예제에서는 사용자의 최신 배지를 모두 조회합니다:

```php
return $this->belongsToMany(Badge::class)
    ->where('rank', 'gold')
    ->orderByPivotDesc('created_at');
```

<a name="defining-custom-intermediate-table-models"></a>
<!-- ### Defining Custom Intermediate Table Models -->
### Defining Custom Intermediate Table Models

<!-- If you would like to define a custom model to represent the intermediate table of your many-to-many relationship, you may call the `using` method when defining the relationship. Custom pivot models give you the opportunity to define additional behavior on the pivot model, such as methods and casts. -->
다대다 연관관계의 중간 테이블을 나타내는 사용자 지정 모델을 정의하고 싶다면, 연관관계를 정의할 때 `using` 메서드를 호출하면 됩니다. 사용자 지정 pivot 모델을 사용하면 메서드나 cast처럼 pivot 모델에 추가 동작을 정의할 수 있습니다.

<!-- Custom many-to-many pivot models should extend the `Illuminate\Database\Eloquent\Relations\Pivot` class while custom polymorphic many-to-many pivot models should extend the `Illuminate\Database\Eloquent\Relations\MorphPivot` class. For example, we may define a `Role` model which uses a custom `RoleUser` pivot model: -->
사용자 지정 다대다 pivot 모델은 `Illuminate\Database\Eloquent\Relations\Pivot` 클래스를 확장해야 하며, 사용자 지정 다형성 다대다 pivot 모델은 `Illuminate\Database\Eloquent\Relations\MorphPivot` 클래스를 확장해야 합니다. 예를 들어 사용자 지정 `RoleUser` pivot 모델을 사용하는 `Role` 모델을 정의할 수 있습니다:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    /**
     * The users that belong to the role.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)->using(RoleUser::class);
    }
}
```

<!-- When defining the `RoleUser` model, you should extend the `Illuminate\Database\Eloquent\Relations\Pivot` class: -->
`RoleUser` 모델을 정의할 때는 `Illuminate\Database\Eloquent\Relations\Pivot` 클래스를 확장해야 합니다:

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
> Pivot 모델은 `SoftDeletes` 트레이트를 사용할 수 없습니다. Pivot 레코드를 소프트 삭제해야 한다면 pivot 모델을 실제 Eloquent 모델로 변환하는 것을 고려하세요.

<a name="custom-pivot-models-and-incrementing-ids"></a>
<!-- #### Custom Pivot Models and Incrementing IDs -->
#### Custom Pivot Models and Incrementing IDs

<!-- If you have defined a many-to-many relationship that uses a custom pivot model, and that pivot model has an auto-incrementing primary key, you should ensure your custom pivot model class uses the `Table` attribute with `incrementing` set to `true`: -->
사용자 지정 pivot 모델을 사용하는 다대다 연관관계를 정의했고, 그 pivot 모델에 자동 증가 기본 키가 있다면, 사용자 지정 pivot 모델 클래스가 `incrementing`이 `true`로 설정된 `Table` 속성을 사용하도록 해야 합니다:

```php
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Relations\Pivot;

#[Table(incrementing: true)]
class RoleUser extends Pivot
{
    // ...
}
```

<a name="automatically-hydrating-pivot-relationships"></a>
<!-- #### Automatically Hydrating Pivot Relationships -->
#### Automatically Hydrating Pivot Relationships

<!-- When a custom pivot model defines `belongsTo` relationships for the declaring and related models, you may invoke `chaperone` to automatically hydrate those relationships on each pivot model. This avoids additional queries when accessing the models through the pivot: -->
사용자 정의 피벗 모델이 선언 모델과 연관 모델에 대한 `belongsTo` 연관관계를 정의한 경우, `chaperone`을 호출하여 각 피벗 모델에서 해당 연관관계를 자동으로 하이드레이션할 수 있습니다. 이렇게 하면 피벗을 통해 모델에 접근할 때 추가 쿼리를 실행하지 않아도 됩니다.

```php
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\Pivot;

class RoleUser extends Pivot
{
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

class Role extends Model
{
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->using(RoleUser::class)
            ->chaperone();
    }
}
```

<!-- Eloquent will attempt to infer the pivot relationship names. If your pivot model uses non-standard names, pass the declaring and related relationship names to `chaperone`: -->
Eloquent는 피벗 연관관계 이름을 추론합니다. 피벗 모델에서 표준이 아닌 이름을 사용한다면, 선언 연관관계와 연관 연관관계의 이름을 `chaperone`에 전달합니다.

```php
return $this->belongsToMany(User::class)
    ->using(RoleUser::class)
    ->chaperone(declaring: 'role', related: 'user');
```

<a name="polymorphic-relationships"></a>
<!-- ## Polymorphic Relationships -->
## Polymorphic Relationships

<!-- A polymorphic relationship allows the child model to belong to more than one type of model using a single association. For example, imagine you are building an application that allows users to share blog posts and videos. In such an application, a `Comment` model might belong to both the `Post` and `Video` models. -->
다형성 연관관계를 사용하면 자식 모델이 하나의 연결만으로 여러 타입의 모델에 속할 수 있습니다. 예를 들어 사용자가 블로그 게시글과 동영상을 공유할 수 있는 애플리케이션을 만든다고 가정해 보겠습니다. 이런 애플리케이션에서는 `Comment` 모델이 `Post` 모델과 `Video` 모델 모두에 속할 수 있습니다.

<a name="one-to-one-polymorphic-relations"></a>
<!-- ### One to One (Polymorphic) -->
### One to One (Polymorphic)

<a name="one-to-one-polymorphic-table-structure"></a>
<!-- #### Table Structure -->
#### Table Structure

<!-- A one-to-one polymorphic relation is similar to a typical one-to-one relation; however, the child model can belong to more than one type of model using a single association. For example, a blog `Post` and a `User` may share a polymorphic relation to an `Image` model. Using a one-to-one polymorphic relation allows you to have a single table of unique images that may be associated with posts and users. First, let's examine the table structure: -->
일대일 다형성 연관관계는 일반적인 일대일 연관관계와 비슷합니다. 하지만 자식 모델이 하나의 연결만으로 여러 타입의 모델에 속할 수 있다는 차이가 있습니다. 예를 들어 블로그 `Post`와 `User`가 `Image` 모델에 대한 다형성 연관관계를 공유할 수 있습니다. 일대일 다형성 연관관계를 사용하면 게시글과 사용자에 연결될 수 있는 고유한 이미지들을 하나의 테이블에 둘 수 있습니다. 먼저 테이블 구조를 살펴보겠습니다:

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
    imageable_type - string
    imageable_id - integer
```

<!-- Note the `imageable_id` and `imageable_type` columns on the `images` table. The `imageable_id` column will contain the ID value of the post or user, while the `imageable_type` column will contain the class name of the parent model. The `imageable_type` column is used by Eloquent to determine which "type" of parent model to return when accessing the `imageable` relation. In this case, the column would contain either `App\Models\Post` or `App\Models\User`. -->
`images` 테이블의 `imageable_id` 및 `imageable_type` 컬럼에 주목하세요. `imageable_id` 컬럼에는 게시글 또는 사용자의 ID 값이 들어가며, `imageable_type` 컬럼에는 부모 모델의 클래스 이름이 들어갑니다. `imageable_type` 컬럼은 `imageable` 연관관계에 접근할 때 어떤 "타입"의 부모 모델을 반환해야 하는지 Eloquent가 판단하는 데 사용됩니다. 이 경우 컬럼에는 `App\Models\Post` 또는 `App\Models\User`가 들어갑니다.

<a name="one-to-one-polymorphic-model-structure"></a>
<!-- #### Model Structure -->
#### Model Structure

<!-- Next, let's examine the model definitions needed to build this relationship: -->
다음으로, 이 연관관계를 구성하는 데 필요한 모델 정의를 살펴보겠습니다:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Image extends Model
{
    /**
     * Get the parent imageable model (user or post).
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
     * Get the post's image.
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
     * Get the user's image.
     */
    public function image(): MorphOne
    {
        return $this->morphOne(Image::class, 'imageable');
    }
}
```

<a name="one-to-one-polymorphic-retrieving-the-relationship"></a>
<!-- #### Retrieving the Relationship -->
#### Retrieving the Relationship

<!-- Once your database table and models are defined, you may access the relationships via your models. For example, to retrieve the image for a post, we can access the `image` dynamic relationship property: -->
데이터베이스 테이블과 모델이 정의되면, 모델을 통해 연관관계에 접근할 수 있습니다. 예를 들어 게시글의 이미지를 조회하려면 `image` 동적 연관관계 속성에 접근하면 됩니다:

```php
use App\Models\Post;

$post = Post::find(1);

$image = $post->image;
```

<!-- You may retrieve the parent of the polymorphic model by accessing the name of the method that performs the call to `morphTo`. In this case, that is the `imageable` method on the `Image` model. So, we will access that method as a dynamic relationship property: -->
`morphTo` 호출을 수행하는 메서드 이름에 접근하여 다형성 모델의 부모를 조회할 수 있습니다. 이 경우에는 `Image` 모델의 `imageable` 메서드입니다. 따라서 이 메서드에 동적 연관관계 속성처럼 접근합니다:

```php
use App\Models\Image;

$image = Image::find(1);

$imageable = $image->imageable;
```

<!-- The `imageable` relation on the `Image` model will return either a `Post` or `User` instance, depending on which type of model owns the image. -->
`Image` 모델의 `imageable` 연관관계는 이미지를 소유한 모델 타입에 따라 `Post` 또는 `User` 인스턴스를 반환합니다.

<a name="morph-one-to-one-key-conventions"></a>
<!-- #### Key Conventions -->
#### Key Conventions

<!-- If necessary, you may specify the name of the "id" and "type" columns utilized by your polymorphic child model. If you do so, ensure that you always pass the name of the relationship as the first argument to the `morphTo` method. Typically, this value should match the method name, so you may use PHP's `__FUNCTION__` constant: -->
필요하다면 다형성 자식 모델에서 사용하는 "id" 및 "type" 컬럼의 이름을 지정할 수 있습니다. 이렇게 하는 경우, 항상 연관관계 이름을 `morphTo` 메서드의 첫 번째 인수로 전달해야 합니다. 일반적으로 이 값은 메서드 이름과 일치해야 하므로 PHP의 `__FUNCTION__` 상수를 사용할 수 있습니다:

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
<!-- ### One to Many (Polymorphic) -->
### One to Many (Polymorphic)

<a name="one-to-many-polymorphic-table-structure"></a>
<!-- #### Table Structure -->
#### Table Structure

<!-- A one-to-many polymorphic relation is similar to a typical one-to-many relation; however, the child model can belong to more than one type of model using a single association. For example, imagine users of your application can "comment" on posts and videos. Using polymorphic relationships, you may use a single `comments` table to contain comments for both posts and videos. First, let's examine the table structure required to build this relationship: -->
일대다 다형성 연관관계는 일반적인 일대다 연관관계와 비슷합니다. 하지만 자식 모델이 하나의 연결만으로 여러 타입의 모델에 속할 수 있다는 차이가 있습니다. 예를 들어 애플리케이션의 사용자가 게시글과 동영상에 "댓글"을 남길 수 있다고 가정해 보겠습니다. 다형성 연관관계를 사용하면 하나의 `comments` 테이블에 게시글과 동영상의 댓글을 모두 담을 수 있습니다. 먼저 이 연관관계를 만들기 위해 필요한 테이블 구조를 살펴보겠습니다:

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
    commentable_type - string
    commentable_id - integer
```

<a name="one-to-many-polymorphic-model-structure"></a>
<!-- #### Model Structure -->
#### Model Structure

<!-- Next, let's examine the model definitions needed to build this relationship: -->
다음으로 이 연관관계를 구성하는 데 필요한 모델 정의를 살펴보겠습니다.

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
<!-- #### Retrieving the Relationship -->
#### Retrieving the Relationship

<!-- Once your database table and models are defined, you may access the relationships via your model's dynamic relationship properties. For example, to access all of the comments for a post, we can use the `comments` dynamic property: -->
데이터베이스 테이블과 모델을 정의한 후에는 모델의 동적 연관관계 속성을 통해 연관관계에 접근할 수 있습니다. 예를 들어 게시글의 모든 댓글에 접근하려면 `comments` 동적 속성을 사용할 수 있습니다.

```php
use App\Models\Post;

$post = Post::find(1);

foreach ($post->comments as $comment) {
    // ...
}
```

<!-- You may also retrieve the parent of a polymorphic child model by accessing the name of the method that performs the call to `morphTo`. In this case, that is the `commentable` method on the `Comment` model. So, we will access that method as a dynamic relationship property in order to access the comment's parent model: -->
또한 `morphTo` 호출을 수행하는 메서드 이름에 접근하여 다형성 자식 모델의 부모를 조회할 수도 있습니다. 이 경우에는 `Comment` 모델의 `commentable` 메서드입니다. 따라서 댓글의 부모 모델에 접근하기 위해 이 메서드를 동적 연관관계 속성처럼 사용합니다.

```php
use App\Models\Comment;

$comment = Comment::find(1);

$commentable = $comment->commentable;
```

<!-- The `commentable` relation on the `Comment` model will return either a `Post` or `Video` instance, depending on which type of model is the comment's parent. -->
`Comment` 모델의 `commentable` 연관관계는 댓글의 부모가 어떤 모델 타입인지에 따라 `Post` 또는 `Video` 인스턴스를 반환합니다.

<a name="polymorphic-automatically-hydrating-parent-models-on-children"></a>
<!-- #### Automatically Hydrating Parent Models on Children -->
#### Automatically Hydrating Parent Models on Children

<!-- Even when utilizing Eloquent eager loading, "N + 1" query problems can arise if you try to access the parent model from a child model while looping through the child models: -->
Eloquent eager loading을 사용하더라도 자식 모델을 순회하면서 자식 모델에서 부모 모델에 접근하려 하면 "N + 1" 쿼리 문제가 발생할 수 있습니다:

```php
$posts = Post::with('comments')->get();

foreach ($posts as $post) {
    foreach ($post->comments as $comment) {
        echo $comment->commentable->title;
    }
}
```

<!-- In the example above, an "N + 1" query problem has been introduced because, even though comments were eager loaded for every `Post` model, Eloquent does not automatically hydrate the parent `Post` on each child `Comment` model. -->
위 예제에서는 모든 `Post` 모델의 comments를 즉시 로드했지만, Eloquent가 각 자식 `Comment` 모델에 부모 `Post`를 자동으로 하이드레이션하지 않기 때문에 "N + 1" 쿼리 문제가 발생합니다.

<!-- If you would like Eloquent to automatically hydrate parent models onto their children, you may invoke the `chaperone` method when defining a `morphMany` relationship: -->
Eloquent가 부모 모델을 자식 모델에 자동으로 하이드레이션하도록 하려면 `morphMany` 연관관계를 정의할 때 `chaperone` 메서드를 호출하면 됩니다.

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

<!-- Or, if you would like to opt-in to automatic parent hydration at run time, you may invoke the `chaperone` model when eager loading the relationship: -->
또는 런타임에 자동 부모 하이드레이션을 사용하도록 선택하려면 연관관계를 Eager 로딩할 때 `chaperone` 모델을 호출하면 됩니다.

```php
use App\Models\Post;

$posts = Post::with([
    'comments' => fn ($comments) => $comments->chaperone(),
])->get();
```

<a name="one-of-many-polymorphic-relations"></a>
<!-- ### One of Many (Polymorphic) -->
### One of Many (Polymorphic)

<!-- Sometimes a model may have many related models, yet you want to easily retrieve the "latest" or "oldest" related model of the relationship. For example, a `User` model may be related to many `Image` models, but you want to define a convenient way to interact with the most recent image the user has uploaded. You may accomplish this using the `morphOne` relationship type combined with the `ofMany` methods: -->
때로는 한 모델이 여러 관련 모델을 가지고 있지만, 그 연관관계에서 "가장 최신" 또는 "가장 오래된" 관련 모델을 쉽게 조회하고 싶을 수 있습니다. 예를 들어 `User` 모델이 여러 `Image` 모델과 연관될 수 있지만, 사용자가 업로드한 가장 최근 이미지를 편리하게 다룰 방법을 정의하고 싶을 수 있습니다. 이는 `morphOne` 연관관계 타입과 `ofMany` 메서드를 함께 사용하여 구현할 수 있습니다.

```php
/**
 * Get the user's most recent image.
 */
public function latestImage(): MorphOne
{
    return $this->morphOne(Image::class, 'imageable')->latestOfMany();
}
```

<!-- Likewise, you may define a method to retrieve the "oldest", or first, related model of a relationship: -->
마찬가지로, 연관관계에서 "가장 오래된", 즉 첫 번째 연관 모델을 가져오는 메서드를 정의할 수 있습니다:

```php
/**
 * Get the user's oldest image.
 */
public function oldestImage(): MorphOne
{
    return $this->morphOne(Image::class, 'imageable')->oldestOfMany();
}
```

<!-- By default, the `latestOfMany` and `oldestOfMany` methods will retrieve the latest or oldest related model based on the model's primary key, which must be sortable. However, sometimes you may wish to retrieve a single model from a larger relationship using a different sorting criteria. -->
기본적으로 `latestOfMany` 및 `oldestOfMany` 메서드는 정렬할 수 있어야 하는 모델의 기본 키를 기준으로 가장 최신 또는 가장 오래된 연관 모델을 가져옵니다. 그러나 경우에 따라 다른 정렬 기준을 사용해 더 큰 연관관계에서 단일 모델을 가져오고 싶을 수 있습니다.

<!-- For example, using the `ofMany` method, you may retrieve the user's most "liked" image. The `ofMany` method accepts the sortable column as its first argument and which aggregate function (`min` or `max`) to apply when querying for the related model: -->
예를 들어 `ofMany` 메서드를 사용하면 사용자의 가장 많은 "좋아요"를 받은 이미지를 조회할 수 있습니다. `ofMany` 메서드는 첫 번째 인수로 정렬 가능한 컬럼을 받고, 관련 모델을 쿼리할 때 적용할 집계 함수(`min` 또는 `max`)를 받습니다.

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
> 더 고급 "여러 항목 중 하나" 연관관계를 구성할 수도 있습니다. 자세한 내용은 [has one of many documentation](#advanced-has-one-of-many-relationships)를 참고하세요.

<a name="many-to-many-polymorphic-relations"></a>
<!-- ### Many to Many (Polymorphic) -->
### Many to Many (Polymorphic)

<a name="many-to-many-polymorphic-table-structure"></a>
<!-- #### Table Structure -->
#### Table Structure

<!-- Many-to-many polymorphic relations are slightly more complicated than "morph one" and "morph many" relationships. For example, a `Post` model and `Video` model could share a polymorphic relation to a `Tag` model. Using a many-to-many polymorphic relation in this situation would allow your application to have a single table of unique tags that may be associated with posts or videos. First, let's examine the table structure required to build this relationship: -->
다대다 다형성 연관관계는 "morph one" 및 "morph many" 연관관계보다 약간 더 복잡합니다. 예를 들어 `Post` 모델과 `Video` 모델이 `Tag` 모델에 대한 다형성 연관관계를 공유할 수 있습니다. 이 상황에서 다대다 다형성 연관관계를 사용하면 애플리케이션은 게시글이나 동영상에 연결될 수 있는 고유한 태그의 단일 테이블을 가질 수 있습니다. 먼저 이 연관관계를 구성하는 데 필요한 테이블 구조를 살펴보겠습니다.

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
    taggable_type - string
    taggable_id - integer
```

> [!NOTE]
> 다형 다대다 연관관계를 살펴보기 전에 일반적인 [many-to-many relationships](#many-to-many)에 대한 문서를 읽어보면 도움이 될 수 있습니다.

<a name="many-to-many-polymorphic-model-structure"></a>
<!-- #### Model Structure -->
#### Model Structure

<!-- Next, we're ready to define the relationships on the models. The `Post` and `Video` models will both contain a `tags` method that calls the `morphToMany` method provided by the base Eloquent model class. -->
다음으로 모델에 연관관계를 정의할 준비가 되었습니다. `Post`와 `Video` 모델은 모두 기본 Eloquent 모델 클래스가 제공하는 `morphToMany` 메서드를 호출하는 `tags` 메서드를 포함합니다.

<!-- The `morphToMany` method accepts the name of the related model as well as the "relationship name". Based on the name we assigned to our intermediate table name and the keys it contains, we will refer to the relationship as "taggable": -->
`morphToMany` 메서드는 관련 모델의 이름과 "연관관계 이름"을 받습니다. 중간 테이블 이름과 그 테이블이 포함하는 키에 지정한 이름을 기준으로, 이 연관관계를 "taggable"이라고 부르겠습니다.

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
<!-- #### Defining the Inverse of the Relationship -->
#### Defining the Inverse of the Relationship

<!-- Next, on the `Tag` model, you should define a method for each of its possible parent models. So, in this example, we will define a `posts` method and a `videos` method. Both of these methods should return the result of the `morphedByMany` method. -->
다음으로 `Tag` 모델에는 가능한 각 부모 모델에 대한 메서드를 정의해야 합니다. 따라서 이 예제에서는 `posts` 메서드와 `videos` 메서드를 정의합니다. 이 두 메서드는 모두 `morphedByMany` 메서드의 결과를 반환해야 합니다.

<!-- The `morphedByMany` method accepts the name of the related model as well as the "relationship name". Based on the name we assigned to our intermediate table name and the keys it contains, we will refer to the relationship as "taggable": -->
`morphedByMany` 메서드는 관련 모델의 이름과 "연관관계 이름"을 받습니다. 중간 테이블 이름과 그 테이블이 포함하는 키에 지정한 이름을 기준으로, 이 연관관계를 "taggable"이라고 부르겠습니다.

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
<!-- #### Retrieving the Relationship -->
#### Retrieving the Relationship

<!-- Once your database table and models are defined, you may access the relationships via your models. For example, to access all of the tags for a post, you may use the `tags` dynamic relationship property: -->
데이터베이스 테이블과 모델을 정의한 후에는 모델을 통해 연관관계에 접근할 수 있습니다. 예를 들어 게시글의 모든 태그에 접근하려면 `tags` 동적 연관관계 속성을 사용할 수 있습니다.

```php
use App\Models\Post;

$post = Post::find(1);

foreach ($post->tags as $tag) {
    // ...
}
```

<!-- You may retrieve the parent of a polymorphic relation from the polymorphic child model by accessing the name of the method that performs the call to `morphedByMany`. In this case, that is the `posts` or `videos` methods on the `Tag` model: -->
다형성 자식 모델에서 `morphedByMany` 호출을 수행하는 메서드 이름에 접근하여 다형성 연관관계의 부모를 조회할 수 있습니다. 이 경우에는 `Tag` 모델의 `posts` 또는 `videos` 메서드입니다.

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
<!-- ### Custom Polymorphic Types -->
### Custom Polymorphic Types

<!-- By default, Laravel will use the fully qualified class name to store the "type" of the related model. For instance, given the one-to-many relationship example above where a `Comment` model may belong to a `Post` or a `Video` model, the default `commentable_type` would be either `App\Models\Post` or `App\Models\Video`, respectively. However, you may wish to decouple these values from your application's internal structure. -->
기본적으로 Laravel은 관련 모델의 "타입"을 저장하기 위해 정규화된 클래스 이름을 사용합니다. 예를 들어 위의 일대다 연관관계 예제에서 `Comment` 모델이 `Post` 또는 `Video` 모델에 속할 수 있다면, 기본 `commentable_type`은 각각 `App\Models\Post` 또는 `App\Models\Video`가 됩니다. 하지만 이러한 값을 애플리케이션의 내부 구조와 분리하고 싶을 수 있습니다.

<!-- For example, instead of using the model names as the "type", we may use simple strings such as `post` and `video`. By doing so, the polymorphic "type" column values in our database will remain valid even if the models are renamed: -->
예를 들어 모델 이름을 "타입"으로 사용하는 대신 `post`와 `video` 같은 간단한 문자열을 사용할 수 있습니다. 이렇게 하면 모델 이름이 변경되더라도 데이터베이스의 다형성 "타입" 컬럼 값은 계속 유효하게 유지됩니다.

```php
use Illuminate\Database\Eloquent\Relations\Relation;

Relation::enforceMorphMap([
    'post' => 'App\Models\Post',
    'video' => 'App\Models\Video',
]);
```

<!-- You may call the `enforceMorphMap` method in the `boot` method of your `App\Providers\AppServiceProvider` class or create a separate service provider if you wish. -->
`enforceMorphMap` 메서드는 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 호출하거나, 원한다면 별도의 서비스 프로바이더를 만들어 호출할 수 있습니다.

<!-- You may determine the morph alias of a given model at runtime using the model's `getMorphClass` method. Conversely, you may determine the fully-qualified class name associated with a morph alias using the `Relation::getMorphedModel` method: -->
런타임에는 모델의 `getMorphClass` 메서드를 사용하여 특정 모델의 morph alias를 확인할 수 있습니다. 반대로 morph alias와 연결된 정규화된 클래스 이름은 `Relation::getMorphedModel` 메서드를 사용하여 확인할 수 있습니다.

```php
use Illuminate\Database\Eloquent\Relations\Relation;

$alias = $post->getMorphClass();

$class = Relation::getMorphedModel($alias);
```

> [!WARNING]
> 기존 애플리케이션에 "morph map"을 추가할 때는 데이터베이스에서 정규화된 클래스명을 여전히 포함하고 있는 모든 morphable `*_type` 컬럼 값을 해당 "map" 이름으로 변환해야 합니다.

<a name="dynamic-relationships"></a>
<!-- ### Dynamic Relationships -->
### Dynamic Relationships

<!-- You may use the `resolveRelationUsing` method to define relations between Eloquent models at runtime. While not typically recommended for normal application development, this may occasionally be useful when developing Laravel packages. -->
`resolveRelationUsing` 메서드를 사용하여 런타임에 Eloquent 모델 간의 연관관계를 정의할 수 있습니다. 일반적인 애플리케이션 개발에서는 보통 권장되지 않지만, Laravel 패키지를 개발할 때 가끔 유용할 수 있습니다.

<!-- The `resolveRelationUsing` method accepts the desired relationship name as its first argument. The second argument passed to the method should be a closure that accepts the model instance and returns a valid Eloquent relationship definition. Typically, you should configure dynamic relationships within the boot method of a [service provider](/docs/13.x/providers): -->
`resolveRelationUsing` 메서드는 원하는 연관관계 이름을 첫 번째 인수로 받습니다. 메서드에 전달하는 두 번째 인수는 모델 인스턴스를 받아 유효한 Eloquent 연관관계 정의를 반환하는 클로저여야 합니다. 일반적으로 [service provider](/docs/13.x/providers)의 boot 메서드에서 동적 연관관계를 설정해야 합니다:

```php
use App\Models\Order;
use App\Models\Customer;

Order::resolveRelationUsing('customer', function (Order $orderModel) {
    return $orderModel->belongsTo(Customer::class, 'customer_id');
});
```

> [!WARNING]
> 동적 연관관계를 정의할 때는 Eloquent 연관관계 메서드에 항상 명시적인 키 이름 인수를 제공해야 합니다.

<a name="querying-relations"></a>
<!-- ## Querying Relations -->
## Querying Relations

<!-- Since all Eloquent relationships are defined via methods, you may call those methods to obtain an instance of the relationship without actually executing a query to load the related models. In addition, all types of Eloquent relationships also serve as [query builders](/docs/13.x/queries), allowing you to continue to chain constraints onto the relationship query before finally executing the SQL query against your database. -->
모든 Eloquent 연관관계는 메서드로 정의되므로, 연관된 모델을 로드하는 쿼리를 실제로 실행하지 않고도 해당 메서드를 호출해 연관관계 인스턴스를 가져올 수 있습니다. 또한 모든 유형의 Eloquent 연관관계는 [query builders](/docs/13.x/queries) 역할도 하므로, 데이터베이스에 대해 SQL 쿼리를 최종적으로 실행하기 전에 연관관계 쿼리에 제약 조건을 계속 연결할 수 있습니다.

<!-- For example, imagine a blog application in which a `User` model has many associated `Post` models: -->
예를 들어 `User` 모델이 여러 관련 `Post` 모델을 가지는 블로그 애플리케이션을 생각해 보겠습니다.

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

<!-- You may query the `posts` relationship and add additional constraints to the relationship like so: -->
다음과 같이 `posts` 연관관계를 쿼리하고 연관관계에 추가 제약 조건을 더할 수 있습니다.

```php
use App\Models\User;

$user = User::find(1);

$user->posts()->where('active', 1)->get();
```

<!-- You are able to use any of the Laravel [query builder's](/docs/13.x/queries) methods on the relationship, so be sure to explore the query builder documentation to learn about all of the methods that are available to you. -->
관계에서 Laravel [query builder's](/docs/13.x/queries) 메서드를 사용할 수 있으므로, 사용할 수 있는 모든 메서드를 알아보려면 쿼리 빌더 문서를 살펴보시기 바랍니다.

<a name="chaining-orwhere-clauses-after-relationships"></a>
<!-- #### Chaining `orWhere` Clauses After Relationships -->
#### Chaining `orWhere` Clauses After Relationships

<!-- As demonstrated in the example above, you are free to add additional constraints to relationships when querying them. However, use caution when chaining `orWhere` clauses onto a relationship, as the `orWhere` clauses will be logically grouped at the same level as the relationship constraint: -->
위 예제에서 보았듯이 연관관계를 쿼리할 때 추가 제약 조건을 자유롭게 더할 수 있습니다. 하지만 연관관계에 `orWhere` 절을 체이닝할 때는 주의해야 합니다. `orWhere` 절은 연관관계 제약 조건과 같은 수준에서 논리적으로 그룹화되기 때문입니다.

```php
$user->posts()
    ->where('active', 1)
    ->orWhere('votes', '>=', 100)
    ->get();
```

<!-- The example above will generate the following SQL. As you can see, the `or` clause instructs the query to return _any_ post with greater than 100 votes. The query is no longer constrained to a specific user: -->
위 예제는 다음 SQL을 생성합니다. 보시다시피 `or` 절은 100표 이상을 받은 _모든_ 게시글을 반환하도록 쿼리에 지시합니다. 이 쿼리는 더 이상 특정 사용자로 제한되지 않습니다.

```sql
select *
from posts
where user_id = ? and active = 1 or votes >= 100
```

<!-- In most situations, you should use [logical groups](/docs/13.x/queries#logical-grouping) to group the conditional checks between parentheses: -->
대부분의 경우 조건 검사를 괄호로 묶으려면 [logical groups](/docs/13.x/queries#logical-grouping)를 사용해야 합니다:

```php
use Illuminate\Database\Eloquent\Builder;

$user->posts()
    ->where(function (Builder $query) {
        return $query->where('active', 1)
            ->orWhere('votes', '>=', 100);
    })
    ->get();
```

<!-- The example above will produce the following SQL. Note that the logical grouping has properly grouped the constraints and the query remains constrained to a specific user: -->
위 예제는 다음 SQL을 생성합니다. 논리 그룹화가 제약 조건을 올바르게 묶었으며, 쿼리가 여전히 특정 사용자로 제한된다는 점에 주목하십시오.

```sql
select *
from posts
where user_id = ? and (active = 1 or votes >= 100)
```

<a name="relationship-methods-vs-dynamic-properties"></a>
<!-- ### Relationship Methods vs. Dynamic Properties -->
### Relationship Methods vs. Dynamic Properties

<!-- If you do not need to add additional constraints to an Eloquent relationship query, you may access the relationship as if it were a property. For example, continuing to use our `User` and `Post` example models, we may access all of a user's posts like so: -->
Eloquent 연관관계 쿼리에 추가 제약 조건을 더할 필요가 없다면, 연관관계를 속성처럼 접근할 수 있습니다. 예를 들어 앞서 사용한 `User`와 `Post` 예제 모델을 계속 사용하면, 다음과 같이 사용자의 모든 게시글에 접근할 수 있습니다.

```php
use App\Models\User;

$user = User::find(1);

foreach ($user->posts as $post) {
    // ...
}
```

<!-- Dynamic relationship properties perform "lazy loading", meaning they will only load their relationship data when you actually access them. Because of this, developers often use [eager loading](#eager-loading) to pre-load relationships they know will be accessed after loading the model. Eager loading provides a significant reduction in SQL queries that must be executed to load a model's relations. -->
동적 연관관계 속성은 "지연 로딩(lazy loading)"을 수행합니다. 즉, 실제로 속성에 접근할 때에만 연관관계 데이터를 로드합니다. 이 때문에 개발자들은 모델을 로드한 후 접근할 것이라고 알고 있는 연관관계를 미리 로드하기 위해 [eager loading](#eager-loading)을 자주 사용합니다. 즉시 로딩은 모델의 연관관계를 로드하기 위해 실행해야 하는 SQL 쿼리 수를 크게 줄여 줍니다.

<a name="querying-relationship-existence"></a>
<!-- ### Querying Relationship Existence -->
### Querying Relationship Existence

<!-- When retrieving model records, you may wish to limit your results based on the existence of a relationship. For example, imagine you want to retrieve all blog posts that have at least one comment. To do so, you may pass the name of the relationship to the `has` and `orHas` methods: -->
모델 레코드를 조회할 때 연관관계의 존재 여부를 기준으로 결과를 제한하고 싶을 수 있습니다. 예를 들어 댓글이 하나 이상 있는 모든 블로그 게시글을 조회하고 싶다고 가정해 보겠습니다. 이렇게 하려면 연관관계 이름을 `has` 및 `orHas` 메서드에 전달하면 됩니다.

```php
use App\Models\Post;

// Retrieve all posts that have at least one comment...
$posts = Post::has('comments')->get();
```

<!-- You may also specify an operator and count value to further customize the query: -->
쿼리를 더 세밀하게 조정하기 위해 연산자와 개수 값을 지정할 수도 있습니다.

```php
// Retrieve all posts that have three or more comments...
$posts = Post::has('comments', '>=', 3)->get();
```

<!-- Nested `has` statements may be constructed using "dot" notation. For example, you may retrieve all posts that have at least one comment that has at least one image: -->
중첩된 `has` 문은 "점" 표기법을 사용하여 구성할 수 있습니다. 예를 들어, 이미지가 하나 이상 있는 댓글을 하나 이상 가진 모든 게시물을 조회할 수 있습니다.

```php
// Retrieve posts that have at least one comment with images...
$posts = Post::has('comments.images')->get();
```

<!-- If you need even more power, you may use the `whereHas` and `orWhereHas` methods to define additional query constraints on your `has` queries, such as inspecting the content of a comment: -->
더 강력한 기능이 필요하다면 `whereHas` 및 `orWhereHas` 메서드를 사용하여 `has` 쿼리에 추가 쿼리 제약을 정의할 수 있습니다. 예를 들어 댓글의 내용을 검사할 수 있습니다.

```php
use Illuminate\Database\Eloquent\Builder;

// Retrieve posts with at least one comment containing words like code%...
$posts = Post::whereHas('comments', function (Builder $query) {
    $query->where('content', 'like', 'code%');
})->get();

// Retrieve posts with at least ten comments containing words like code%...
$posts = Post::whereHas('comments', function (Builder $query) {
    $query->where('content', 'like', 'code%');
}, '>=', 10)->get();
```

> [!WARNING]
> Eloquent는 현재 데이터베이스 간 연관관계 존재 여부를 쿼리할 수 없습니다. 연관관계는 동일한 데이터베이스 내에 존재해야 합니다.

<a name="many-to-many-relationship-existence-queries"></a>
<!-- #### Many to Many Relationship Existence Queries -->
#### Many to Many Relationship Existence Queries

<!-- The `whereAttachedTo` method may be used to query for models that have a many to many attachment to a model or collection of models: -->
`whereAttachedTo` 메서드는 특정 모델 또는 모델 컬렉션과 다대다로 연결된 모델을 쿼리할 때 사용할 수 있습니다.

```php
$users = User::whereAttachedTo($role)->get();
```

<!-- You may also provide a [collection](/docs/13.x/eloquent-collections) instance to the `whereAttachedTo` method. When doing so, Laravel will retrieve models that are attached to any of the models within the collection: -->
`whereAttachedTo` 메서드에 [collection](/docs/13.x/eloquent-collections) 인스턴스를 전달할 수도 있습니다. 이 경우 Laravel은 컬렉션에 포함된 모델 중 하나에 연결된 모델을 조회합니다:

```php
$tags = Tag::whereLike('name', '%laravel%')->get();

$posts = Post::whereAttachedTo($tags)->get();
```

<a name="inline-relationship-existence-queries"></a>
<!-- #### Inline Relationship Existence Queries -->
#### Inline Relationship Existence Queries

<!-- If you would like to query for a relationship's existence with a single, simple where condition attached to the relationship query, you may find it more convenient to use the `whereRelation`, `orWhereRelation`, `whereMorphRelation`, and `orWhereMorphRelation` methods. For example, we may query for all posts that have unapproved comments: -->
연관관계 쿼리에 단순한 where 조건 하나만 붙여 연관관계의 존재 여부를 쿼리하고 싶다면 `whereRelation`, `orWhereRelation`, `whereMorphRelation`, `orWhereMorphRelation` 메서드를 사용하는 것이 더 편리할 수 있습니다. 예를 들어 승인되지 않은 댓글이 있는 모든 게시물을 쿼리할 수 있습니다.

```php
use App\Models\Post;

$posts = Post::whereRelation('comments', 'is_approved', false)->get();
```

<!-- Of course, like calls to the query builder's `where` method, you may also specify an operator: -->
물론 쿼리 빌더의 `where` 메서드를 호출할 때처럼 연산자를 지정할 수도 있습니다.

```php
$posts = Post::whereRelation(
    'comments', 'created_at', '>=', now()->minus(hours: 1)
)->get();
```

<a name="querying-relationship-absence"></a>
<!-- ### Querying Relationship Absence -->
### Querying Relationship Absence

<!-- When retrieving model records, you may wish to limit your results based on the absence of a relationship. For example, imagine you want to retrieve all blog posts that **don't** have any comments. To do so, you may pass the name of the relationship to the `doesntHave` and `orDoesntHave` methods: -->
모델 레코드를 조회할 때 연관관계가 없는 경우를 기준으로 결과를 제한하고 싶을 수 있습니다. 예를 들어 댓글이 하나도 **없는** 모든 블로그 게시물을 조회한다고 가정해 보겠습니다. 이를 위해 연관관계의 이름을 `doesntHave` 및 `orDoesntHave` 메서드에 전달할 수 있습니다.

```php
use App\Models\Post;

$posts = Post::doesntHave('comments')->get();
```

<!-- If you need even more power, you may use the `whereDoesntHave` and `orWhereDoesntHave` methods to add additional query constraints to your `doesntHave` queries, such as inspecting the content of a comment: -->
더 강력한 기능이 필요하다면 `whereDoesntHave` 및 `orWhereDoesntHave` 메서드를 사용하여 `doesntHave` 쿼리에 추가 쿼리 제약을 더할 수 있습니다. 예를 들어 댓글의 내용을 검사할 수 있습니다.

```php
use Illuminate\Database\Eloquent\Builder;

$posts = Post::whereDoesntHave('comments', function (Builder $query) {
    $query->where('content', 'like', 'code%');
})->get();
```

<!-- You may use "dot" notation to execute a query against a nested relationship. For example, the following query will retrieve all posts that do not have comments as well as posts that have comments where none of the comments are from banned users: -->
"점" 표기법을 사용하여 중첩된 연관관계에 대해 쿼리를 실행할 수 있습니다. 예를 들어 다음 쿼리는 댓글이 없는 모든 게시물과, 댓글은 있지만 그 댓글 중 어느 것도 차단된 사용자가 작성하지 않은 게시물을 조회합니다.

```php
use Illuminate\Database\Eloquent\Builder;

$posts = Post::whereDoesntHave('comments.author', function (Builder $query) {
    $query->where('banned', 1);
})->get();
```

<a name="querying-morph-to-relationships"></a>
<!-- ### Querying Morph To Relationships -->
### Querying Morph To Relationships

<!-- To query the existence of "morph to" relationships, you may use the `whereHasMorph` and `whereDoesntHaveMorph` methods. These methods accept the name of the relationship as their first argument. Next, the methods accept the names of the related models that you wish to include in the query. Finally, you may provide a closure which customizes the relationship query: -->
"morph to" 연관관계의 존재 여부를 쿼리하려면 `whereHasMorph` 및 `whereDoesntHaveMorph` 메서드를 사용할 수 있습니다. 이 메서드들은 첫 번째 인수로 연관관계의 이름을 받습니다. 그다음 쿼리에 포함하려는 관련 모델의 이름을 받습니다. 마지막으로 연관관계 쿼리를 커스터마이징하는 클로저를 제공할 수 있습니다.

```php
use App\Models\Comment;
use App\Models\Post;
use App\Models\Video;
use Illuminate\Database\Eloquent\Builder;

// Retrieve comments associated to posts or videos with a title like code%...
$comments = Comment::whereHasMorph(
    'commentable',
    [Post::class, Video::class],
    function (Builder $query) {
        $query->where('title', 'like', 'code%');
    }
)->get();

// Retrieve comments associated to posts with a title not like code%...
$comments = Comment::whereDoesntHaveMorph(
    'commentable',
    Post::class,
    function (Builder $query) {
        $query->where('title', 'like', 'code%');
    }
)->get();
```

<!-- You may occasionally need to add query constraints based on the "type" of the related polymorphic model. The closure passed to the `whereHasMorph` method may receive a `$type` value as its second argument. This argument allows you to inspect the "type" of the query that is being built: -->
때로는 관련 다형성 모델의 "type"에 따라 쿼리 제약을 추가해야 할 수 있습니다. `whereHasMorph` 메서드에 전달되는 클로저는 두 번째 인수로 `$type` 값을 받을 수 있습니다. 이 인수를 사용하면 현재 만들어지고 있는 쿼리의 "type"을 검사할 수 있습니다.

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

<!-- Sometimes you may want to query for the children of a "morph to" relationship's parent. You may accomplish this using the `whereMorphedTo` and `whereNotMorphedTo` methods, which will automatically determine the proper morph type mapping for the given model. These methods accept the name of the `morphTo` relationship as their first argument and the related parent model as their second argument: -->
때로는 "morph to" 연관관계의 부모에 속한 자식 모델을 쿼리하고 싶을 수 있습니다. 이 작업은 `whereMorphedTo` 및 `whereNotMorphedTo` 메서드를 사용하여 수행할 수 있으며, 이 메서드들은 주어진 모델에 맞는 적절한 morph type 매핑을 자동으로 결정합니다. 이 메서드들은 첫 번째 인수로 `morphTo` 연관관계의 이름을 받고, 두 번째 인수로 관련 부모 모델을 받습니다.

```php
$comments = Comment::whereMorphedTo('commentable', $post)
    ->orWhereMorphedTo('commentable', $video)
    ->get();
```

<a name="querying-all-morph-to-related-models"></a>
<!-- #### Querying All Related Models -->
#### Querying All Related Models

<!-- Instead of passing an array of possible polymorphic models, you may provide `*` as a wildcard value. This will instruct Laravel to retrieve all of the possible polymorphic types from the database. Laravel will execute an additional query in order to perform this operation: -->
가능한 다형성 모델의 배열을 전달하는 대신, 와일드카드 값으로 `*`를 제공할 수 있습니다. 이렇게 하면 Laravel은 데이터베이스에서 가능한 모든 다형성 타입을 조회합니다. Laravel은 이 작업을 수행하기 위해 추가 쿼리를 실행합니다.

```php
use Illuminate\Database\Eloquent\Builder;

$comments = Comment::whereHasMorph('commentable', '*', function (Builder $query) {
    $query->where('title', 'like', 'foo%');
})->get();
```

<a name="aggregating-related-models"></a>
<!-- ## Aggregating Related Models -->
## Aggregating Related Models

<a name="counting-related-models"></a>
<!-- ### Counting Related Models -->
### Counting Related Models

<!-- Sometimes you may want to count the number of related models for a given relationship without actually loading the models. To accomplish this, you may use the `withCount` method. The `withCount` method will place a `{relation}_count` attribute on the resulting models: -->
때로는 실제로 모델을 로드하지 않고도 특정 연관관계에 연결된 관련 모델의 개수를 세고 싶을 수 있습니다. 이를 위해 `withCount` 메서드를 사용할 수 있습니다. `withCount` 메서드는 결과 모델에 `{relation}_count` 속성을 추가합니다.

```php
use App\Models\Post;

$posts = Post::withCount('comments')->get();

foreach ($posts as $post) {
    echo $post->comments_count;
}
```

<!-- By passing an array to the `withCount` method, you may add the "counts" for multiple relations as well as add additional constraints to the queries: -->
`withCount` 메서드에 배열을 전달하면 여러 연관관계의 "개수"를 추가할 수 있으며, 쿼리에 추가 제약도 더할 수 있습니다.

```php
use Illuminate\Database\Eloquent\Builder;

$posts = Post::withCount(['votes', 'comments' => function (Builder $query) {
    $query->where('content', 'like', 'code%');
}])->get();

echo $posts[0]->votes_count;
echo $posts[0]->comments_count;
```

<!-- You may also alias the relationship count result, allowing multiple counts on the same relationship: -->
연관관계 개수 결과에 별칭을 지정할 수도 있으므로, 같은 연관관계에 대해 여러 개수를 가져올 수 있습니다.

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
<!-- #### Deferred Count Loading -->
#### Deferred Count Loading

<!-- Using the `loadCount` method, you may load a relationship count after the parent model has already been retrieved: -->
`loadCount` 메서드를 사용하면 부모 모델을 이미 조회한 뒤에 연관관계 개수를 로드할 수 있습니다.

```php
$book = Book::first();

$book->loadCount('genres');
```

<!-- If you need to set additional query constraints on the count query, you may pass an array keyed by the relationships you wish to count. The array values should be closures which receive the query builder instance: -->
개수 쿼리에 추가 쿼리 제약을 설정해야 한다면, 개수를 세려는 연관관계를 키로 가지는 배열을 전달할 수 있습니다. 배열의 값은 쿼리 빌더 인스턴스를 받는 클로저여야 합니다.

```php
$book->loadCount(['reviews' => function (Builder $query) {
    $query->where('rating', 5);
}])
```

<a name="relationship-counting-and-custom-select-statements"></a>
<!-- #### Relationship Counting and Custom Select Statements -->
#### Relationship Counting and Custom Select Statements

<!-- If you're combining `withCount` with a `select` statement, ensure that you call `withCount` after the `select` method: -->
`withCount`를 `select` 문과 함께 사용하는 경우, 반드시 `select` 메서드 뒤에 `withCount`를 호출해야 합니다.

```php
$posts = Post::select(['title', 'body'])
    ->withCount('comments')
    ->get();
```

<a name="other-aggregate-functions"></a>
<!-- ### Other Aggregate Functions -->
### Other Aggregate Functions

<!-- In addition to the `withCount` method, Eloquent provides `withMin`, `withMax`, `withAvg`, `withSum`, and `withExists` methods. These methods will place a `{relation}_{function}_{column}` attribute on your resulting models: -->
`withCount` 메서드 외에도 Eloquent는 `withMin`, `withMax`, `withAvg`, `withSum`, `withExists` 메서드를 제공합니다. 이 메서드들은 결과 모델에 `{relation}_{function}_{column}` 속성을 추가합니다.

```php
use App\Models\Post;

$posts = Post::withSum('comments', 'votes')->get();

foreach ($posts as $post) {
    echo $post->comments_sum_votes;
}
```

<!-- If you wish to access the result of the aggregate function using another name, you may specify your own alias: -->
집계 함수의 결과를 다른 이름으로 접근하고 싶다면 직접 별칭을 지정할 수 있습니다.

```php
$posts = Post::withSum('comments as total_comments', 'votes')->get();

foreach ($posts as $post) {
    echo $post->total_comments;
}
```

<!-- Like the `loadCount` method, deferred versions of these methods are also available. These additional aggregate operations may be performed on Eloquent models that have already been retrieved: -->
`loadCount` 메서드와 마찬가지로, 이 메서드들의 지연 로딩 버전도 사용할 수 있습니다. 이미 조회한 Eloquent 모델에 대해 이러한 추가 집계 작업을 수행할 수 있습니다.

```php
$post = Post::first();

$post->loadSum('comments', 'votes');
```

<!-- If you're combining these aggregate methods with a `select` statement, ensure that you call the aggregate methods after the `select` method: -->
이러한 집계 메서드를 `select` 문과 함께 사용하는 경우, 반드시 `select` 메서드 뒤에 집계 메서드를 호출해야 합니다.

```php
$posts = Post::select(['title', 'body'])
    ->withExists('comments')
    ->get();
```

<a name="counting-related-models-on-morph-to-relationships"></a>
<!-- ### Counting Related Models on Morph To Relationships -->
### Counting Related Models on Morph To Relationships

<!-- If you would like to eager load a "morph to" relationship, as well as related model counts for the various entities that may be returned by that relationship, you may utilize the `with` method in combination with the `morphTo` relationship's `morphWithCount` method. -->
"morph to" 연관관계를 즉시 로딩하면서, 해당 연관관계가 반환할 수 있는 다양한 엔티티의 관련 모델 개수도 함께 로드하고 싶다면 `with` 메서드와 `morphTo` 연관관계의 `morphWithCount` 메서드를 함께 사용할 수 있습니다.

<!-- In this example, let's assume that `Photo` and `Post` models may create `ActivityFeed` models. We will assume the `ActivityFeed` model defines a "morph to" relationship named `parentable` that allows us to retrieve the parent `Photo` or `Post` model for a given `ActivityFeed` instance. Additionally, let's assume that `Photo` models "have many" `Tag` models and `Post` models "have many" `Comment` models. -->
이 예제에서는 `Photo` 및 `Post` 모델이 `ActivityFeed` 모델을 생성할 수 있다고 가정하겠습니다. `ActivityFeed` 모델은 `parentable`이라는 "morph to" 연관관계를 정의하며, 이를 통해 특정 `ActivityFeed` 인스턴스의 부모 `Photo` 또는 `Post` 모델을 조회할 수 있다고 가정합니다. 또한 `Photo` 모델은 `Tag` 모델을 "have many" 하고, `Post` 모델은 `Comment` 모델을 "have many" 한다고 가정하겠습니다.

<!-- Now, let's imagine we want to retrieve `ActivityFeed` instances and eager load the `parentable` parent models for each `ActivityFeed` instance. In addition, we want to retrieve the number of tags that are associated with each parent photo and the number of comments that are associated with each parent post: -->
이제 `ActivityFeed` 인스턴스를 조회하면서 각 `ActivityFeed` 인스턴스의 `parentable` 부모 모델을 즉시 로딩하고 싶다고 가정해 보겠습니다. 추가로 각 부모 사진에 연결된 태그 수와 각 부모 게시물에 연결된 댓글 수를 조회하고 싶습니다.

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
<!-- #### Deferred Count Loading -->
#### Deferred Count Loading

<!-- Let's assume we have already retrieved a set of `ActivityFeed` models and now we would like to load the nested relationship counts for the various `parentable` models associated with the activity feeds. You may use the `loadMorphCount` method to accomplish this: -->
이미 `ActivityFeed` 모델 집합을 조회했고, 이제 활동 피드와 연결된 여러 `parentable` 모델의 중첩 연관관계 개수를 로드하고 싶다고 가정하겠습니다. 이를 위해 `loadMorphCount` 메서드를 사용할 수 있습니다.

```php
$activities = ActivityFeed::with('parentable')->get();

$activities->loadMorphCount('parentable', [
    Photo::class => ['tags'],
    Post::class => ['comments'],
]);
```

<a name="eager-loading"></a>
<!-- ## Eager Loading -->
## Eager Loading

<!-- When accessing Eloquent relationships as properties, the related models are "lazy loaded". This means the relationship data is not actually loaded until you first access the property. However, Eloquent can "eager load" relationships at the time you query the parent model. Eager loading alleviates the "N + 1" query problem. To illustrate the N + 1 query problem, consider a `Book` model that "belongs to" to an `Author` model: -->
Eloquent 연관관계를 속성처럼 접근하면 관련 모델은 "지연 로딩"됩니다. 이는 해당 속성에 처음 접근하기 전까지 연관관계 데이터가 실제로 로드되지 않는다는 뜻입니다. 하지만 Eloquent는 부모 모델을 쿼리하는 시점에 연관관계를 "즉시 로딩"할 수 있습니다. 즉시 로딩은 "N + 1" 쿼리 문제를 완화합니다. N + 1 쿼리 문제를 설명하기 위해 `Author` 모델에 "belongs to" 하는 `Book` 모델을 살펴보겠습니다.

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

<!-- Now, let's retrieve all books and their authors: -->
이제 모든 책과 그 저자를 조회해 보겠습니다.

```php
use App\Models\Book;

$books = Book::all();

foreach ($books as $book) {
    echo $book->author->name;
}
```

<!-- This loop will execute one query to retrieve all of the books within the database table, then another query for each book in order to retrieve the book's author. So, if we have 25 books, the code above would run 26 queries: one for the original book, and 25 additional queries to retrieve the author of each book. -->
이 반복문은 데이터베이스 테이블 안의 모든 책을 조회하기 위해 쿼리 하나를 실행한 다음, 각 책의 저자를 조회하기 위해 책마다 추가 쿼리를 실행합니다. 따라서 책이 25권 있다면 위 코드는 총 26개의 쿼리를 실행합니다. 책을 조회하는 원래 쿼리 1개와 각 책의 저자를 조회하는 추가 쿼리 25개입니다.

<!-- Thankfully, we can use eager loading to reduce this operation to just two queries. When building a query, you may specify which relationships should be eager loaded using the `with` method: -->
다행히 즉시 로딩을 사용하면 이 작업을 단 두 개의 쿼리로 줄일 수 있습니다. 쿼리를 만들 때 `with` 메서드를 사용하여 즉시 로딩할 연관관계를 지정할 수 있습니다.

```php
$books = Book::with('author')->get();

foreach ($books as $book) {
    echo $book->author->name;
}
```

<!-- For this operation, only two queries will be executed - one query to retrieve all of the books and one query to retrieve all of the authors for all of the books: -->
이 작업에서는 모든 책을 조회하는 쿼리 하나와 모든 책의 모든 저자를 조회하는 쿼리 하나, 총 두 개의 쿼리만 실행됩니다.

```sql
select * from books

select * from authors where id in (1, 2, 3, 4, 5, ...)
```

<a name="eager-loading-multiple-relationships"></a>
<!-- #### Eager Loading Multiple Relationships -->
#### Eager Loading Multiple Relationships

<!-- Sometimes you may need to eager load several different relationships. To do so, just pass an array of relationships to the `with` method: -->
때로는 여러 개의 서로 다른 연관관계를 즉시 로딩해야 할 수 있습니다. 이를 위해 `with` 메서드에 연관관계 배열을 전달하면 됩니다.

```php
$books = Book::with(['author', 'publisher'])->get();
```

<a name="nested-eager-loading"></a>
<!-- #### Nested Eager Loading -->
#### Nested Eager Loading

<!-- To eager load a relationship's relationships, you may use "dot" syntax. For example, let's eager load all of the book's authors and all of the author's personal contacts: -->
어떤 연관관계의 또 다른 연관관계를 즉시 로딩하려면 "점" 문법을 사용할 수 있습니다. 예를 들어 모든 책의 저자와 모든 저자의 개인 연락처를 즉시 로딩해 보겠습니다.

```php
$books = Book::with('author.contacts')->get();
```

<!-- Alternatively, you may specify nested eager loaded relationships by providing a nested array to the `with` method, which can be convenient when eager loading multiple nested relationships: -->
또는 `with` 메서드에 중첩 배열을 제공하여 중첩 즉시 로딩 연관관계를 지정할 수도 있습니다. 여러 중첩 연관관계를 즉시 로딩할 때 이 방식이 편리할 수 있습니다.

```php
$books = Book::with([
    'author' => [
        'contacts',
        'publisher',
    ],
])->get();
```

<a name="nested-eager-loading-morphto-relationships"></a>
<!-- #### Nested Eager Loading `morphTo` Relationships -->
#### Nested Eager Loading `morphTo` Relationships

<!-- If you would like to eager load a `morphTo` relationship, as well as nested relationships on the various entities that may be returned by that relationship, you may use the `with` method in combination with the `morphTo` relationship's `morphWith` method. To help illustrate this method, let's consider the following model: -->
`morphTo` 연관관계와 함께, 해당 연관관계가 반환할 수 있는 여러 엔티티의 중첩된 연관관계도 즉시 로드하려면 `with` 메서드와 `morphTo` 연관관계의 `morphWith` 메서드를 함께 사용할 수 있습니다. 이 메서드를 설명하기 위해 다음 모델을 살펴보겠습니다.

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

<!-- In this example, let's assume `Event`, `Photo`, and `Post` models may create `ActivityFeed` models. Additionally, let's assume that `Event` models belong to a `Calendar` model, `Photo` models are associated with `Tag` models, and `Post` models belong to an `Author` model. -->
이 예시에서는 `Event`, `Photo`, `Post` 모델이 `ActivityFeed` 모델을 생성할 수 있다고 가정하겠습니다. 또한 `Event` 모델은 `Calendar` 모델에 속하고, `Photo` 모델은 `Tag` 모델과 연관되며, `Post` 모델은 `Author` 모델에 속한다고 가정하겠습니다.

<!-- Using these model definitions and relationships, we may retrieve `ActivityFeed` model instances and eager load all `parentable` models and their respective nested relationships: -->
이러한 모델 정의와 연관관계를 사용하면 `ActivityFeed` 모델 인스턴스를 조회하고 모든 `parentable` 모델과 각각의 중첩 연관관계를 미리 로드할 수 있습니다:

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
<!-- #### Eager Loading Specific Columns -->
#### Eager Loading Specific Columns

<!-- You may not always need every column from the relationships you are retrieving. For this reason, Eloquent allows you to specify which columns of the relationship you would like to retrieve: -->
조회하는 연관관계의 모든 컬럼이 항상 필요한 것은 아닙니다. 이런 경우를 위해 Eloquent는 연관관계에서 조회할 컬럼을 지정할 수 있도록 합니다.

```php
$books = Book::with('author:id,name,book_id')->get();
```

> [!WARNING]
> 이 기능을 사용할 때는 조회하려는 컬럼 목록에 항상 `id` 컬럼과 관련된 외래 키 컬럼을 포함해야 합니다.

<a name="eager-loading-by-default"></a>
<!-- #### Eager Loading by Default -->
#### Eager Loading by Default

<!-- Sometimes you might want to always load some relationships when retrieving a model. To accomplish this, you may define a `$with` property on the model: -->
모델을 조회할 때마다 특정 연관관계를 항상 로드하고 싶을 때가 있습니다. 이를 위해 모델에 `$with` 속성을 정의할 수 있습니다.

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

<!-- If you would like to remove an item from the `$with` property for a single query, you may use the `without` method: -->
단일 쿼리에서 `$with` 속성에 포함된 항목을 제거하고 싶다면 `without` 메서드를 사용할 수 있습니다.

```php
$books = Book::without('author')->get();
```

<!-- If you would like to override all items within the `$with` property for a single query, you may use the `withOnly` method: -->
단일 쿼리에서 `$with` 속성 안의 모든 항목을 재정의하고 싶다면 `withOnly` 메서드를 사용할 수 있습니다.

```php
$books = Book::withOnly('genre')->get();
```

<a name="constraining-eager-loads"></a>
<!-- ### Constraining Eager Loads -->
### Constraining Eager Loads

<!-- Sometimes you may wish to eager load a relationship but also specify additional query conditions for the eager loading query. You can accomplish this by passing an array of relationships to the `with` method where the array key is a relationship name and the array value is a closure that adds additional constraints to the eager loading query: -->
연관관계를 즉시 로드하면서, 즉시 로드 쿼리에 추가 쿼리 조건을 지정하고 싶을 때가 있습니다. 이를 위해 `with` 메서드에 연관관계 배열을 전달할 수 있습니다. 배열의 키는 연관관계 이름이고, 값은 즉시 로드 쿼리에 추가 제약 조건을 더하는 클로저입니다.

```php
use App\Models\User;

$users = User::with(['posts' => function ($query) {
    $query->where('title', 'like', '%code%');
}])->get();
```

<!-- In this example, Eloquent will only eager load posts where the post's `title` column contains the word `code`. You may call other [query builder](/docs/13.x/queries) methods to further customize the eager loading operation: -->
이 예제에서 Eloquent는 게시글의 `title` 컬럼에 `code`라는 단어가 포함된 게시글만 즉시 로딩합니다. 즉시 로딩 작업을 추가로 세부 조정하려면 다른 [query builder](/docs/13.x/queries) 메서드를 호출할 수 있습니다.

```php
$users = User::with(['posts' => function ($query) {
    $query->orderBy('created_at', 'desc');
}])->get();
```

<a name="constraining-eager-loading-of-morph-to-relationships"></a>
<!-- #### Constraining Eager Loading of `morphTo` Relationships -->
#### Constraining Eager Loading of `morphTo` Relationships

<!-- If you are eager loading a `morphTo` relationship, Eloquent will run multiple queries to fetch each type of related model. You may add additional constraints to each of these queries using the `MorphTo` relation's `constrain` method: -->
`morphTo` 연관관계를 즉시 로드하면 Eloquent는 관련 모델의 각 타입을 가져오기 위해 여러 쿼리를 실행합니다. `MorphTo` 관계의 `constrain` 메서드를 사용하면 각 쿼리에 추가 제약 조건을 지정할 수 있습니다.

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

<!-- In this example, Eloquent will only eager load posts that have not been hidden and videos that have a `type` value of "educational". -->
이 예제에서 Eloquent는 숨겨지지 않은 게시물과 `type` 값이 "educational"인 비디오만 즉시 로드합니다.

<a name="constraining-eager-loads-with-relationship-existence"></a>
<!-- #### Constraining Eager Loads With Relationship Existence -->
#### Constraining Eager Loads With Relationship Existence

<!-- You may sometimes find yourself needing to check for the existence of a relationship while simultaneously loading the relationship based on the same conditions. For example, you may wish to only retrieve `User` models that have child `Post` models matching a given query condition while also eager loading the matching posts. You may accomplish this using the `withWhereHas` method: -->
때로는 같은 조건을 기준으로 연관관계의 존재 여부를 확인하면서 동시에 해당 연관관계를 로드해야 할 수 있습니다. 예를 들어, 주어진 쿼리 조건과 일치하는 자식 `Post` 모델을 가진 `User` 모델만 조회하면서, 일치하는 게시물도 함께 즉시 로드하고 싶을 수 있습니다. 이 작업은 `withWhereHas` 메서드를 사용하여 수행할 수 있습니다.

```php
use App\Models\User;

$users = User::withWhereHas('posts', function ($query) {
    $query->where('featured', true);
})->get();
```

<a name="lazy-eager-loading"></a>
<!-- ### Lazy Eager Loading -->
### Lazy Eager Loading

<!-- Sometimes you may need to eager load a relationship after the parent model has already been retrieved. For example, this may be useful if you need to dynamically decide whether to load related models: -->
부모 모델을 이미 조회한 뒤에 연관관계를 즉시 로드해야 할 때가 있습니다. 예를 들어, 관련 모델을 로드할지 여부를 동적으로 결정해야 하는 경우 유용할 수 있습니다.

```php
use App\Models\Book;

$books = Book::all();

if ($condition) {
    $books->load('author', 'publisher');
}
```

<!-- If you need to set additional query constraints on the eager loading query, you may pass an array keyed by the relationships you wish to load. The array values should be closure instances which receive the query instance: -->
즉시 로드 쿼리에 추가 쿼리 제약 조건을 설정해야 한다면, 로드하려는 연관관계를 키로 하는 배열을 전달할 수 있습니다. 배열의 값은 쿼리 인스턴스를 받는 클로저 인스턴스여야 합니다.

```php
$author->load(['books' => function ($query) {
    $query->orderBy('published_date', 'asc');
}]);
```

<!-- To load a relationship only when it has not already been loaded, use the `loadMissing` method: -->
연관관계가 아직 로드되지 않았을 때만 로드하려면 `loadMissing` 메서드를 사용합니다.

```php
$book->loadMissing('author');
```

<a name="nested-lazy-eager-loading-morphto"></a>
<!-- #### Nested Lazy Eager Loading and `morphTo` -->
#### Nested Lazy Eager Loading and `morphTo`

<!-- If you would like to eager load a `morphTo` relationship, as well as nested relationships on the various entities that may be returned by that relationship, you may use the `loadMorph` method. -->
`morphTo` 연관관계와 함께, 해당 연관관계가 반환할 수 있는 여러 엔티티의 중첩된 연관관계도 즉시 로드하려면 `loadMorph` 메서드를 사용할 수 있습니다.

<!-- This method accepts the name of the `morphTo` relationship as its first argument, and an array of model / relationship pairs as its second argument. To help illustrate this method, let's consider the following model: -->
이 메서드는 첫 번째 인수로 `morphTo` 연관관계의 이름을 받고, 두 번째 인수로 모델 / 연관관계 쌍의 배열을 받습니다. 이 메서드를 설명하기 위해 다음 모델을 살펴보겠습니다.

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

<!-- In this example, let's assume `Event`, `Photo`, and `Post` models may create `ActivityFeed` models. Additionally, let's assume that `Event` models belong to a `Calendar` model, `Photo` models are associated with `Tag` models, and `Post` models belong to an `Author` model. -->
이 예시에서는 `Event`, `Photo`, `Post` 모델이 `ActivityFeed` 모델을 생성할 수 있다고 가정하겠습니다. 또한 `Event` 모델은 `Calendar` 모델에 속하고, `Photo` 모델은 `Tag` 모델과 연결되며, `Post` 모델은 `Author` 모델에 속한다고 가정하겠습니다.

<!-- Using these model definitions and relationships, we may retrieve `ActivityFeed` model instances and eager load all `parentable` models and their respective nested relationships: -->
이러한 모델 정의와 연관관계를 사용하면 `ActivityFeed` 모델 인스턴스를 조회하고 모든 `parentable` 모델과 각 모델의 중첩된 연관관계를 즉시 로드할 수 있습니다:

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
<!-- ### Automatic Eager Loading -->
### Automatic Eager Loading

<!-- In many cases, Laravel can automatically eager load the relationships you access. To enable automatic eager loading, you should invoke the `Model::automaticallyEagerLoadRelationships` method within the `boot` method of your application's `AppServiceProvider`: -->
많은 경우 Laravel은 사용자가 접근하는 연관관계를 자동으로 즉시 로드할 수 있습니다. 자동 즉시 로드를 활성화하려면 애플리케이션의 `AppServiceProvider`에 있는 `boot` 메서드 안에서 `Model::automaticallyEagerLoadRelationships` 메서드를 호출해야 합니다.

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

<!-- When this feature is enabled, Laravel will attempt to automatically load any relationships you access that have not been previously loaded. For example, consider the following scenario: -->
이 기능이 활성화되면 Laravel은 이전에 로드되지 않은 연관관계에 접근할 때 해당 연관관계를 자동으로 로드하려고 시도합니다. 예를 들어 다음 상황을 살펴보겠습니다.

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

<!-- Typically, the code above would execute a query for each user in order to retrieve their posts, as well as a query for each post to retrieve its comments. However, when the `automaticallyEagerLoadRelationships` feature has been enabled, Laravel will automatically [lazy eager load](#lazy-eager-loading) the posts for all users in the user collection when you attempt to access the posts on any of the retrieved users. Likewise, when you attempt to access the comments for any retrieved post, all comments will be lazy eager loaded for all posts that were originally retrieved. -->
일반적으로 위 코드는 각 사용자의 게시물을 조회하기 위해 사용자마다 쿼리를 실행하고, 각 게시물의 댓글을 조회하기 위해 게시물마다 쿼리를 실행합니다. 하지만 `automaticallyEagerLoadRelationships` 기능이 활성화되어 있으면, 조회된 사용자 중 하나의 게시물에 접근하는 순간 Laravel은 사용자 컬렉션의 모든 사용자에 대한 게시물을 자동으로 [lazy eager load](#lazy-eager-loading)합니다. 마찬가지로 조회된 게시물 중 하나의 댓글에 접근하면, 원래 조회된 모든 게시물에 대한 모든 댓글이 지연 즉시 로드됩니다.

<!-- If you do not want to globally enable automatic eager loading, you can still enable this feature for a single Eloquent collection instance by invoking the `withRelationshipAutoloading` method on the collection: -->
자동 즉시 로드를 전역으로 활성화하고 싶지 않다면, 컬렉션에서 `withRelationshipAutoloading` 메서드를 호출하여 단일 Eloquent 컬렉션 인스턴스에 대해서만 이 기능을 활성화할 수도 있습니다.

```php
$users = User::where('vip', true)->get();

return $users->withRelationshipAutoloading();
```

<a name="preventing-lazy-loading"></a>
<!-- ### Preventing Lazy Loading -->
### Preventing Lazy Loading

<!-- As previously discussed, eager loading relationships can often provide significant performance benefits to your application. Therefore, if you would like, you may instruct Laravel to always prevent the lazy loading of relationships. To accomplish this, you may invoke the `preventLazyLoading` method offered by the base Eloquent model class. Typically, you should call this method within the `boot` method of your application's `AppServiceProvider` class. -->
앞서 설명했듯이, 연관관계를 즉시 로드하면 애플리케이션 성능에 큰 이점을 제공하는 경우가 많습니다. 따라서 원한다면 Laravel이 연관관계의 지연 로딩을 항상 방지하도록 지시할 수 있습니다. 이를 위해 기본 Eloquent 모델 클래스가 제공하는 `preventLazyLoading` 메서드를 호출할 수 있습니다. 일반적으로 이 메서드는 애플리케이션의 `AppServiceProvider` 클래스에 있는 `boot` 메서드 안에서 호출해야 합니다.

<!-- The `preventLazyLoading` method accepts an optional boolean argument that indicates if lazy loading should be prevented. For example, you may wish to only disable lazy loading in non-production environments so that your production environment will continue to function normally even if a lazy loaded relationship is accidentally present in production code: -->
`preventLazyLoading` 메서드는 지연 로딩을 방지할지 여부를 나타내는 선택적 불리언 인수를 받습니다. 예를 들어, 운영 환경에서는 실수로 지연 로드되는 연관관계가 프로덕션 코드에 있더라도 애플리케이션이 정상적으로 계속 동작하도록 하고, 비운영 환경에서만 지연 로딩을 비활성화하고 싶을 수 있습니다.

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

<!-- After preventing lazy loading, Eloquent will throw a `Illuminate\Database\LazyLoadingViolationException` exception when your application attempts to lazy load any Eloquent relationship. -->
지연 로딩을 방지한 뒤에는 애플리케이션이 Eloquent 연관관계를 지연 로드하려고 시도할 때 Eloquent가 `Illuminate\Database\LazyLoadingViolationException` 예외를 발생시킵니다.

<!-- You may customize the behavior of lazy loading violations using the `handleLazyLoadingViolationsUsing` method. For example, using this method, you may instruct lazy loading violations to only be logged instead of interrupting the application's execution with exceptions: -->
`handleLazyLoadingViolationsUsing` 메서드를 사용하여 지연 로딩 위반 동작을 사용자 정의할 수 있습니다. 예를 들어 이 메서드를 사용하면 지연 로딩 위반이 예외로 애플리케이션 실행을 중단하지 않고 로그에만 기록되도록 지시할 수 있습니다.

```php
Model::handleLazyLoadingViolationUsing(function (Model $model, string $relation) {
    $class = $model::class;

    info("Attempted to lazy load [{$relation}] on model [{$class}].");
});
```

<a name="inserting-and-updating-related-models"></a>
<!-- ## Inserting and Updating Related Models -->
## Inserting and Updating Related Models

<a name="the-save-method"></a>
<!-- ### The `save` Method -->
### The `save` Method

<!-- Eloquent provides convenient methods for adding new models to relationships. For example, perhaps you need to add a new comment to a post. Instead of manually setting the `post_id` attribute on the `Comment` model you may insert the comment using the relationship's `save` method: -->
Eloquent는 연관관계에 새 모델을 추가하기 위한 편리한 메서드를 제공합니다. 예를 들어 게시물에 새 댓글을 추가해야 한다고 가정해 보겠습니다. `Comment` 모델의 `post_id` 속성을 수동으로 설정하는 대신, 연관관계의 `save` 메서드를 사용하여 댓글을 삽입할 수 있습니다.

```php
use App\Models\Comment;
use App\Models\Post;

$comment = new Comment(['message' => 'A new comment.']);

$post = Post::find(1);

$post->comments()->save($comment);
```

<!-- Note that we did not access the `comments` relationship as a dynamic property. Instead, we called the `comments` method to obtain an instance of the relationship. The `save` method will automatically add the appropriate `post_id` value to the new `Comment` model. -->
여기서 `comments` 연관관계를 동적 속성으로 접근하지 않았다는 점에 주의하세요. 대신 `comments` 메서드를 호출하여 연관관계 인스턴스를 얻었습니다. `save` 메서드는 새 `Comment` 모델에 적절한 `post_id` 값을 자동으로 추가합니다.

<!-- If you need to save multiple related models, you may use the `saveMany` method: -->
여러 관련 모델을 저장해야 한다면 `saveMany` 메서드를 사용할 수 있습니다.

```php
$post = Post::find(1);

$post->comments()->saveMany([
    new Comment(['message' => 'A new comment.']),
    new Comment(['message' => 'Another new comment.']),
]);
```

<!-- The `save` and `saveMany` methods will persist the given model instances, but will not add the newly persisted models to any in-memory relationships that are already loaded onto the parent model. If you plan on accessing the relationship after using the `save` or `saveMany` methods, you may wish to use the `refresh` method to reload the model and its relationships: -->
`save`와 `saveMany` 메서드는 전달된 모델 인스턴스를 영구 저장하지만, 새로 저장된 모델을 부모 모델에 이미 로드되어 있는 인메모리 연관관계에는 추가하지 않습니다. `save` 또는 `saveMany` 메서드를 사용한 뒤 연관관계에 접근할 계획이라면, `refresh` 메서드를 사용하여 모델과 연관관계를 다시 로드하는 것이 좋습니다.

```php
$post->comments()->save($comment);

$post->refresh();

// All comments, including the newly saved comment...
$post->comments;
```

<a name="the-push-method"></a>
<!-- #### Recursively Saving Models and Relationships -->
#### Recursively Saving Models and Relationships

<!-- If you would like to `save` your model and all of its associated relationships, you may use the `push` method. In this example, the `Post` model will be saved as well as its comments and the comment's authors: -->
모델과 그에 연결된 모든 연관관계를 `save`하고 싶다면 `push` 메서드를 사용할 수 있습니다. 이 예제에서는 `Post` 모델뿐 아니라 댓글과 댓글의 작성자도 함께 저장됩니다.

```php
$post = Post::find(1);

$post->comments[0]->message = 'Message';
$post->comments[0]->author->name = 'Author Name';

$post->push();
```

<!-- The `pushQuietly` method may be used to save a model and its associated relationships without raising any events: -->
`pushQuietly` 메서드는 이벤트를 발생시키지 않고 모델과 연결된 연관관계를 저장할 때 사용할 수 있습니다.

```php
$post->pushQuietly();
```

<a name="the-create-method"></a>
<!-- ### The `create` Method -->
### The `create` Method

<!-- In addition to the `save` and `saveMany` methods, you may also use the `create` method, which accepts an array of attributes, creates a model, and inserts it into the database. The difference between `save` and `create` is that `save` accepts a full Eloquent model instance while `create` accepts a plain PHP `array`. The newly created model will be returned by the `create` method: -->
`save`와 `saveMany` 메서드 외에도 `create` 메서드를 사용할 수 있습니다. 이 메서드는 속성 배열을 받아 모델을 생성하고 데이터베이스에 삽입합니다. `save`와 `create`의 차이는 `save`는 완전한 Eloquent 모델 인스턴스를 받는 반면, `create`는 일반 PHP `array`를 받는다는 점입니다. 새로 생성된 모델은 `create` 메서드에서 반환됩니다.

```php
use App\Models\Post;

$post = Post::find(1);

$comment = $post->comments()->create([
    'message' => 'A new comment.',
]);
```

<!-- You may use the `createMany` method to create multiple related models: -->
여러 관련 모델을 생성하려면 `createMany` 메서드를 사용할 수 있습니다.

```php
$post = Post::find(1);

$post->comments()->createMany([
    ['message' => 'A new comment.'],
    ['message' => 'Another new comment.'],
]);
```

<!-- The `createQuietly` and `createManyQuietly` methods may be used to create a model(s) without dispatching any events: -->
`createQuietly`와 `createManyQuietly` 메서드는 이벤트를 디스패치하지 않고 모델을 생성할 때 사용할 수 있습니다.

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

<!-- You may also use the `findOrNew`, `firstOrNew`, `firstOrCreate`, and `updateOrCreate` methods to [create and update models on relationships](/docs/13.x/eloquent#upserts). -->
`findOrNew`, `firstOrNew`, `firstOrCreate`, `updateOrCreate` 메서드를 사용해 [create and update models on relationships](/docs/13.x/eloquent#upserts)할 수도 있습니다.

> [!NOTE]
> `create` 메서드를 사용하기 전에 반드시 [mass assignment](/docs/13.x/eloquent#mass-assignment) 문서를 검토하세요.

<a name="updating-belongs-to-relationships"></a>
<!-- ### Belongs To Relationships -->
### Belongs To Relationships

<!-- If you would like to assign a child model to a new parent model, you may use the `associate` method. In this example, the `User` model defines a `belongsTo` relationship to the `Account` model. This `associate` method will set the foreign key on the child model: -->
자식 모델을 새 부모 모델에 할당하려면 `associate` 메서드를 사용할 수 있습니다. 이 예제에서 `User` 모델은 `Account` 모델에 대한 `belongsTo` 연관관계를 정의합니다. 이 `associate` 메서드는 자식 모델의 외래 키를 설정합니다.

```php
use App\Models\Account;

$account = Account::find(10);

$user->account()->associate($account);

$user->save();
```

<!-- To remove a parent model from a child model, you may use the `dissociate` method. This method will set the relationship's foreign key to `null`: -->
자식 모델에서 부모 모델을 제거하려면 `dissociate` 메서드를 사용할 수 있습니다. 이 메서드는 연관관계의 외래 키를 `null`로 설정합니다.

```php
$user->account()->dissociate();

$user->save();
```

<a name="updating-many-to-many-relationships"></a>
<!-- ### Many to Many Relationships -->
### Many to Many Relationships

<a name="attaching-detaching"></a>
<!-- #### Attaching / Detaching -->
#### Attaching / Detaching

<!-- Eloquent also provides methods to make working with many-to-many relationships more convenient. For example, let's imagine a user can have many roles and a role can have many users. You may use the `attach` method to attach a role to a user by inserting a record in the relationship's intermediate table: -->
Eloquent는 다대다 연관관계를 더 편리하게 다룰 수 있는 메서드도 제공합니다. 예를 들어, 한 사용자가 여러 역할을 가질 수 있고 한 역할도 여러 사용자를 가질 수 있다고 생각해 보겠습니다. `attach` 메서드를 사용하면 연관관계의 중간 테이블에 레코드를 삽입하여 사용자에게 역할을 연결할 수 있습니다.

```php
use App\Models\User;

$user = User::find(1);

$user->roles()->attach($roleId);
```

<!-- When attaching a relationship to a model, you may also pass an array of additional data to be inserted into the intermediate table: -->
모델에 연관관계를 연결할 때, 중간 테이블에 함께 삽입할 추가 데이터 배열을 전달할 수도 있습니다.

```php
$user->roles()->attach($roleId, ['expires' => $expires]);
```

<!-- Sometimes it may be necessary to remove a role from a user. To remove a many-to-many relationship record, use the `detach` method. The `detach` method will delete the appropriate record out of the intermediate table; however, both models will remain in the database: -->
때로는 사용자에게서 역할을 제거해야 할 수 있습니다. 다대다 연관관계 레코드를 제거하려면 `detach` 메서드를 사용합니다. `detach` 메서드는 중간 테이블에서 해당 레코드를 삭제하지만, 두 모델은 모두 데이터베이스에 그대로 남아 있습니다.

```php
// Detach a single role from the user...
$user->roles()->detach($roleId);

// Detach all roles from the user...
$user->roles()->detach();
```

<!-- For convenience, `attach` and `detach` also accept arrays of IDs as input: -->
편의를 위해 `attach`와 `detach`는 ID 배열도 입력으로 받을 수 있습니다.

```php
$user = User::find(1);

$user->roles()->detach([1, 2, 3]);

$user->roles()->attach([
    1 => ['expires' => $expires],
    2 => ['expires' => $expires],
]);
```

<a name="syncing-associations"></a>
<!-- #### Syncing Associations -->
#### Syncing Associations

<!-- You may also use the `sync` method to construct many-to-many associations. The `sync` method accepts an array of IDs to place on the intermediate table. Any IDs that are not in the given array will be removed from the intermediate table. So, after this operation is complete, only the IDs in the given array will exist in the intermediate table: -->
`sync` 메서드를 사용하여 다대다 연결을 구성할 수도 있습니다. `sync` 메서드는 중간 테이블에 배치할 ID 배열을 받습니다. 주어진 배열에 없는 ID는 중간 테이블에서 제거됩니다. 따라서 이 작업이 완료되면, 중간 테이블에는 주어진 배열에 있는 ID만 존재하게 됩니다.

```php
$user->roles()->sync([1, 2, 3]);
```

<!-- You may also pass additional intermediate table values with the IDs: -->
ID와 함께 추가적인 중간 테이블 값도 전달할 수 있습니다:

```php
$user->roles()->sync([1 => ['expires' => true], 2, 3]);
```

<!-- If you would like to insert the same intermediate table values with each of the synced model IDs, you may use the `syncWithPivotValues` method: -->
동기화되는 각 모델 ID에 동일한 중간 테이블 값을 삽입하려면 `syncWithPivotValues` 메서드를 사용할 수 있습니다.

```php
$user->roles()->syncWithPivotValues([1, 2, 3], ['active' => true]);
```

<!-- If you do not want to detach existing IDs that are missing from the given array, you may use the `syncWithoutDetaching` method: -->
주어진 배열에 없는 기존 ID를 분리하고 싶지 않다면 `syncWithoutDetaching` 메서드를 사용할 수 있습니다.

```php
$user->roles()->syncWithoutDetaching([1, 2, 3]);
```

<a name="toggling-associations"></a>
<!-- #### Toggling Associations -->
#### Toggling Associations

<!-- The many-to-many relationship also provides a `toggle` method which "toggles" the attachment status of the given related model IDs. If the given ID is currently attached, it will be detached. Likewise, if it is currently detached, it will be attached: -->
다대다 연관관계는 주어진 관련 모델 ID의 연결 상태를 "토글"하는 `toggle` 메서드도 제공합니다. 주어진 ID가 현재 연결되어 있으면 분리됩니다. 마찬가지로 현재 분리되어 있으면 연결됩니다.

```php
$user->roles()->toggle([1, 2, 3]);
```

<!-- You may also pass additional intermediate table values with the IDs: -->
ID와 함께 추가적인 중간 테이블 값도 전달할 수 있습니다:

```php
$user->roles()->toggle([
    1 => ['expires' => true],
    2 => ['expires' => true],
]);
```

<a name="transactional-pivot-operations"></a>
<!-- #### Transactional Pivot Operations -->
#### Transactional Pivot Operations

<!-- Each of the pivot operations discussed above also has an `OrFail` variant (`attachOrFail`, `detachOrFail`, `syncOrFail`, `syncWithoutDetachingOrFail`, and `toggleOrFail`) that wraps the operation within a database transaction, so that all changes are automatically rolled back if an exception is thrown: -->
위에서 설명한 각 Pivot 작업에는 `OrFail` 변형(`attachOrFail`, `detachOrFail`, `syncOrFail`, `syncWithoutDetachingOrFail`, `toggleOrFail`)도 있습니다. 이 변형들은 작업을 데이터베이스 트랜잭션 안에서 실행하므로, 예외가 발생하면 모든 변경 사항이 자동으로 롤백됩니다.

```php
$user->roles()->attachOrFail([1, 2, 3]);

$user->roles()->syncOrFail([1, 2, 3]);
```

<a name="updating-a-record-on-the-intermediate-table"></a>
<!-- #### Updating a Record on the Intermediate Table -->
#### Updating a Record on the Intermediate Table

<!-- If you need to update an existing row in your relationship's intermediate table, you may use the `updateExistingPivot` method. This method accepts the intermediate record foreign key and an array of attributes to update: -->
연관관계의 중간 테이블에 있는 기존 행을 업데이트해야 한다면 `updateExistingPivot` 메서드를 사용할 수 있습니다. 이 메서드는 중간 레코드의 외래 키와 업데이트할 속성 배열을 받습니다.

```php
$user = User::find(1);

$user->roles()->updateExistingPivot($roleId, [
    'active' => false,
]);
```

<a name="touching-parent-timestamps"></a>
<!-- ## Touching Parent Timestamps -->
## Touching Parent Timestamps

<!-- When a model defines a `belongsTo` or `belongsToMany` relationship to another model, such as a `Comment` which belongs to a `Post`, it is sometimes helpful to update the parent's timestamp when the child model is updated. -->
모델이 다른 모델에 대한 `belongsTo` 또는 `belongsToMany` 연관관계를 정의하는 경우가 있습니다. 예를 들어 `Comment`가 `Post`에 속하는 상황처럼 말입니다. 이런 경우 자식 모델이 업데이트될 때 부모 모델의 타임스탬프도 함께 업데이트하면 유용할 때가 있습니다.

<!-- For example, when a `Comment` model is updated, you may want to automatically "touch" the `updated_at` timestamp of the owning `Post` so that it is set to the current date and time. To accomplish this, you may use the `Touches` attribute on your child model containing the names of the relationships that should have their `updated_at` timestamps updated when the child model is updated: -->
예를 들어 `Comment` 모델이 업데이트될 때, 소유자인 `Post`의 `updated_at` 타임스탬프를 자동으로 "touch"하여 현재 날짜와 시간으로 설정하고 싶을 수 있습니다. 이를 위해 자식 모델에 `Touches` 속성을 사용할 수 있습니다. 이 속성에는 자식 모델이 업데이트될 때 `updated_at` 타임스탬프도 함께 업데이트되어야 하는 연관관계 이름을 지정합니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Touches;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Touches(['post'])]
class Comment extends Model
{
    /**
     * Get the post that the comment belongs to.
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }
}
```

> [!WARNING]
> 부모 모델의 타임스탬프는 자식 모델을 Eloquent의 `save` 메서드를 사용해 업데이트한 경우에만 업데이트됩니다.
