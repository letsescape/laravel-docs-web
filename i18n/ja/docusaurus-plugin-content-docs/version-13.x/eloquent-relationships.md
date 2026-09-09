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
多くの場合、データベース テーブルは相互に関連しています。たとえば、ブログ投稿に多くのコメントが含まれている場合や、注文がその注文を行ったユーザーに関連している場合があります。 Eloquent を使用すると、これらの関係の管理と操作が簡単になり、さまざまな一般的な関係がサポートされます。

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
Eloquent リレーションは、Eloquent モデルクラスのメソッドとして定義します。リレーションは強力な [query builders](/docs/13.x/queries) としても機能するため、リレーションをメソッドとして定義すると、メソッドチェーンやクエリの組み立てに関する強力な機能を利用できます。たとえば、この `posts` リレーションに追加のクエリ条件をチェーンできます。

```php
$user->posts()->where('active', 1)->get();
```

<!-- But, before diving too deep into using relationships, let's learn how to define each type of relationship supported by Eloquent. -->
ただし、リレーションシップの使用について深く掘り下げる前に、Eloquent がサポートする各タイプのリレーションシップを定義する方法を学びましょう。

<a name="one-to-one"></a>
<!-- ### One to One / Has One -->
### One to One / Has One

<!-- A one-to-one relationship is a very basic type of database relationship. For example, a `User` model might be associated with one `Phone` model. To define this relationship, we will place a `phone` method on the `User` model. The `phone` method should call the `hasOne` method and return its result. The `hasOne` method is available to your model via the model's `Illuminate\Database\Eloquent\Model` base class: -->
1 対 1 の関係は、非常に基本的なタイプのデータベース関係です。たとえば、`User` モデルは 1 つの `Phone` モデルに関連付けられる場合があります。この関係を定義するために、`phone` メソッドを `User` モデルに配置します。 `phone` メソッドは、`hasOne` メソッドを呼び出し、その結果を返す必要があります。 `hasOne` メソッドは、モデルの `Illuminate\Database\Eloquent\Model` 基本クラスを介してモデルで使用できます。

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
`hasOne` メソッドに渡される最初の引数は、関連するモデル クラスの名前です。関係が定義されたら、Eloquent の動的プロパティを使用して関連レコードを取得できます。動的プロパティを使用すると、モデル上で定義されたプロパティであるかのように、リレーションシップ メソッドにアクセスできます。

```php
$phone = User::find(1)->phone;
```

<!-- Eloquent determines the foreign key of the relationship based on the parent model name. In this case, the `Phone` model is automatically assumed to have a `user_id` foreign key. If you wish to override this convention, you may pass a second argument to the `hasOne` method: -->
Eloquent は、親モデル名に基づいてリレーションシップの外部キーを決定します。この場合、`Phone` モデルには、`user_id` 外部キーがあると自動的に想定されます。この規則をオーバーライドしたい場合は、`hasOne` メソッドに 2 番目の引数を渡すことができます。

```php
return $this->hasOne(Phone::class, 'foreign_key');
```

<!-- Additionally, Eloquent assumes that the foreign key should have a value matching the primary key column of the parent. In other words, Eloquent will look for the value of the user's `id` column in the `user_id` column of the `Phone` record. If you would like the relationship to use a primary key value other than `id` or your model's primary key, you may pass a third argument to the `hasOne` method: -->
さらに、Eloquent は、外部キーの値が親の主キー列と一致する必要があると想定しています。つまり、Eloquent は、`Phone` レコードの `user_id` 列でユーザーの `id` 列の値を検索します。リレーションシップで `id` 以外の主キー値またはモデルの主キーを使用したい場合は、3 番目の引数を `hasOne` メソッドに渡すことができます。

```php
return $this->hasOne(Phone::class, 'foreign_key', 'local_key');
```

<a name="one-to-one-defining-the-inverse-of-the-relationship"></a>
<!-- #### Defining the Inverse of the Relationship -->
#### Defining the Inverse of the Relationship

<!-- So, we can access the `Phone` model from our `User` model. Next, let's define a relationship on the `Phone` model that will let us access the user that owns the phone. We can define the inverse of a `hasOne` relationship using the `belongsTo` method: -->
したがって、`User` モデルから `Phone` モデルにアクセスできます。次に、電話機を所有するユーザーにアクセスできる関係を `Phone` モデルで定義しましょう。 `belongsTo` メソッドを使用して、`hasOne` 関係の逆を定義できます。

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
`user` メソッドを呼び出すと、Eloquent は、`Phone` モデルの `user_id` 列と一致する `id` を持つ `User` モデルを検索しようとします。

<!-- Eloquent determines the foreign key name by examining the name of the relationship method and suffixing the method name with `_id`. So, in this case, Eloquent assumes that the `Phone` model has a `user_id` column. However, if the foreign key on the `Phone` model is not `user_id`, you may pass a custom key name as the second argument to the `belongsTo` method: -->
Eloquent は、リレーションシップ メソッドの名前を調べ、メソッド名の末尾に `_id` を付けることで、外部キー名を決定します。したがって、この場合、Eloquent は、`Phone` モデルに `user_id` 列があると想定します。ただし、`Phone` モデルの外部キーが `user_id` ではない場合は、カスタム キー名を 2 番目の引数として `belongsTo` メソッドに渡すことができます。

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
親モデルが主キーとして `id` を使用していない場合、または別の列を使用して関連モデルを検索したい場合は、親テーブルのカスタム キーを指定する 3 番目の引数を `belongsTo` メソッドに渡すことができます。

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
1 対多の関係は、単一のモデルが 1 つ以上の子モデルの親となる関係を定義するために使用されます。たとえば、ブログ投稿には無限の数のコメントが含まれる場合があります。他のすべての Eloquent リレーションシップと同様に、1 対多のリレーションシップは、Eloquent モデルでメソッドを定義することによって定義されます。

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
Eloquent は、`Comment` モデルに適切な外部キー列を自動的に決定することに注意してください。慣例により、Eloquent は親モデルの「スネーク ケース」名を取得し、接尾辞として `_id` を付けます。したがって、この例では、Eloquent は、`Comment` モデルの外部キー列が `post_id` であると想定します。

<!-- Once the relationship method has been defined, we can access the [collection](/docs/13.x/eloquent-collections) of related comments by accessing the `comments` property. Remember, since Eloquent provides "dynamic relationship properties", we can access relationship methods as if they were defined as properties on the model: -->
リレーションメソッドを定義すると、`comments` プロパティにアクセスして関連するコメントの [collection](/docs/13.x/eloquent-collections) を取得できます。Eloquent は「動的リレーションプロパティ」を提供しているため、リレーションメソッドをモデルのプロパティとして定義されているかのように利用できることを覚えておいてください。

```php
use App\Models\Post;

$comments = Post::find(1)->comments;

foreach ($comments as $comment) {
    // ...
}
```

<!-- Since all relationships also serve as query builders, you may add further constraints to the relationship query by calling the `comments` method and continuing to chain conditions onto the query: -->
すべてのリレーションシップはクエリビルダとしても機能するため、`comments` メソッドを呼び出してクエリに条件を連鎖させ続けることで、リレーションシップ クエリにさらに制約を追加できます。

```php
$comment = Post::find(1)->comments()
    ->where('title', 'foo')
    ->first();
```

<!-- Like the `hasOne` method, you may also override the foreign and local keys by passing additional arguments to the `hasMany` method: -->
`hasOne` メソッドと同様に、追加の引数を `hasMany` メソッドに渡すことで、外部キーとローカル キーをオーバーライドすることもできます。

```php
return $this->hasMany(Comment::class, 'foreign_key');

return $this->hasMany(Comment::class, 'foreign_key', 'local_key');
```

<a name="automatically-hydrating-parent-models-on-children"></a>
<!-- #### Automatically Hydrating Parent Models on Children -->
#### Automatically Hydrating Parent Models on Children

<!-- Even when utilizing Eloquent eager loading, "N + 1" query problems can arise if you try to access the parent model from a child model while looping through the child models: -->
Eloquent の eager loading を利用していても、子モデルをループ処理する中で子モデルから親モデルへアクセスしようとすると、「N + 1」クエリ問題が発生することがあります。

```php
$posts = Post::with('comments')->get();

foreach ($posts as $post) {
    foreach ($post->comments as $comment) {
        echo $comment->post->title;
    }
}
```

<!-- In the example above, an "N + 1" query problem has been introduced because, even though comments were eager loaded for every `Post` model, Eloquent does not automatically hydrate the parent `Post` on each child `Comment` model. -->
上記の例では、「N + 1」クエリ問題が発生しています。すべての `Post` モデルでコメントを Eager Load しているにもかかわらず、Eloquent は各子 `Comment` モデルに親の `Post` を自動的にハイドレートしないためです。

<!-- If you would like Eloquent to automatically hydrate parent models onto their children, you may invoke the `chaperone` method when defining a `hasMany` relationship: -->
Eloquent が親モデルをその子に自動的にハイドレートするようにしたい場合は、`hasMany` 関係を定義するときに `chaperone` メソッドを呼び出すことができます。

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
または、実行時に親モデルの自動ハイドレーションを有効にしたい場合は、リレーションをEagerロードする際に `chaperone` モデルを呼び出します。

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
投稿のすべてのコメントにアクセスできるようになったので、コメントが親投稿にアクセスできるように関係を定義しましょう。 `hasMany` リレーションシップの逆を定義するには、`belongsTo` メソッドを呼び出すリレーションシップ メソッドを子モデルに定義します。

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
関係が定義されたら、`post` の「動的関係プロパティ」にアクセスして、コメントの親投稿を取得できます。

```php
use App\Models\Comment;

$comment = Comment::find(1);

return $comment->post->title;
```

<!-- In the example above, Eloquent will attempt to find a `Post` model that has an `id` which matches the `post_id` column on the `Comment` model. -->
上記の例では、Eloquent は、`Comment` モデルの `post_id` 列と一致する `id` を持つ `Post` モデルを検索しようとします。

<!-- Eloquent determines the default foreign key name by examining the name of the relationship method and suffixing the method name with a `_` followed by the name of the parent model's primary key column. So, in this example, Eloquent will assume the `Post` model's foreign key on the `comments` table is `post_id`. -->
Eloquent は、リレーションシップ メソッドの名前を調べ、メソッド名の末尾に `_` を付け、その後に親モデルの主キー列の名前を付けることで、デフォルトの外部キー名を決定します。したがって、この例では、Eloquent は、`comments` テーブル上の `Post` モデルの外部キーが `post_id` であると想定します。

<!-- However, if the foreign key for your relationship does not follow these conventions, you may pass a custom foreign key name as the second argument to the `belongsTo` method: -->
ただし、リレーションシップの外部キーがこれらの規則に従っていない場合は、カスタム外部キー名を `belongsTo` メソッドの 2 番目の引数として渡すことができます。

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
親モデルが主キーとして `id` を使用していない場合、または別の列を使用して関連モデルを検索したい場合は、親テーブルのカスタム キーを指定する 3 番目の引数を `belongsTo` メソッドに渡すことができます。

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
`belongsTo`、`hasOne`、`hasOneThrough`、および `morphOne` 関係を使用すると、指定された関係が `null` の場合に返されるデフォルト モデルを定義できます。このパターンは [Null Object pattern](https://en.wikipedia.org/wiki/Null_Object_pattern) と呼ばれることが多く、コード内の条件チェックを削除するのに役立ちます。次の例では、`Post` モデルにユーザーがアタッチされていない場合、`user` リレーションは空の `App\Models\User` モデルを返します。

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
デフォルトのモデルに属性を設定するには、配列またはクロージャを `withDefault` メソッドに渡すことができます。

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
「belongs to」関係の子をクエリする場合、`where` 句を手動で構築して、対応する Eloquent モデルを取得できます。

```php
use App\Models\Post;

$posts = Post::where('user_id', $user->id)->get();
```

<!-- However, you may find it more convenient to use the `whereBelongsTo` method, which will automatically determine the proper relationship and foreign key for the given model: -->
ただし、指定されたモデルの適切な関係と外部キーを自動的に決定する `whereBelongsTo` メソッドを使用する方が便利な場合があります。

```php
$posts = Post::whereBelongsTo($user)->get();
```

<!-- You may also provide a [collection](/docs/13.x/eloquent-collections) instance to the `whereBelongsTo` method. When doing so, Laravel will retrieve models that belong to any of the parent models within the collection: -->
`whereBelongsTo` メソッドには、[collection](/docs/13.x/eloquent-collections) のインスタンスも渡せます。この場合、Laravel はコレクション内のいずれかの親モデルに属するモデルを取得します。

```php
$users = User::where('vip', true)->get();

$posts = Post::whereBelongsTo($users)->get();
```

<!-- By default, Laravel will determine the relationship associated with the given model based on the class name of the model; however, you may specify the relationship name manually by providing it as the second argument to the `whereBelongsTo` method: -->
デフォルトでは、Laravel はモデルのクラス名に基づいて、指定されたモデルに関連付けられた関係を決定します。ただし、関係名を `whereBelongsTo` メソッドの 2 番目の引数として指定することで、手動で指定することもできます。

```php
$posts = Post::whereBelongsTo($user, 'author')->get();
```

<a name="has-one-of-many"></a>
<!-- ### Has One of Many -->
### Has One of Many

<!-- Sometimes a model may have many related models, yet you want to easily retrieve the "latest" or "oldest" related model of the relationship. For example, a `User` model may be related to many `Order` models, but you want to define a convenient way to interact with the most recent order the user has placed. You may accomplish this using the `hasOne` relationship type combined with the `ofMany` methods: -->
場合によっては、モデルに多数の関連モデルがある場合でも、関係の「最新」または「最も古い」関連モデルを簡単に取得したいことがあります。たとえば、`User` モデルは多くの `Order` モデルに関連している可能性がありますが、ユーザーが行った最新の注文を操作する便利な方法を定義したいとします。これは、`hasOne` 関係タイプと `ofMany` メソッドを組み合わせて使用​​することで実現できます。

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
同様に、リレーションの「最古」、つまり最初の関連モデルを取得するメソッドを定義できます。

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
デフォルトでは、`latestOfMany` メソッドと `oldestOfMany` メソッドは、ソート可能である必要があるモデルの主キーを基準に、関連するモデルのうち最新または最古のものを取得します。ただし、大きなリレーションから、別のソート条件を使って単一のモデルを取得したい場合もあります。

<!-- For example, using the `ofMany` method, you may retrieve the user's most expensive order. The `ofMany` method accepts the sortable column as its first argument and which aggregate function (`min` or `max`) to apply when querying for the related model: -->
たとえば、`ofMany` メソッドを使用すると、ユーザーの最も高価な注文を取得できます。 `ofMany` メソッドは、最初の引数としてソート可能な列を受け入れ、関連モデルのクエリを実行するときに適用する集計関数 (`min` または `max`) を受け取ります。

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
> PostgreSQL は UUID カラムに対する `MAX` 関数の実行をサポートしていないため、現在、one-of-many リレーションと PostgreSQL の UUID カラムを組み合わせて使用することはできません。

<a name="converting-many-relationships-to-has-one-relationships"></a>
<!-- #### Converting "Many" Relationships to Has One Relationships -->
#### Converting "Many" Relationships to Has One Relationships

<!-- Often, when retrieving a single model using the `latestOfMany`, `oldestOfMany`, or `ofMany` methods, you already have a "has many" relationship defined for the same model. For convenience, Laravel allows you to easily convert this relationship into a "has one" relationship by invoking the `one` method on the relationship: -->
`latestOfMany`、`oldestOfMany`、または `ofMany` メソッドを使用して単一のモデルを取得する場合、多くの場合、同じモデルに対して「多数を持つ」関係がすでに定義されています。便宜上、Laravel では、関係に対して `one` メソッドを呼び出すことで、この関係を「has one」関係に簡単に変換できます。

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
`one` メソッドを使用して、`HasManyThrough` 関係を `HasOneThrough` 関係に変換することもできます。

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
より高度な「多数のうちの 1 つを有する」関係を構築することが可能です。たとえば、`Product` モデルには、新しい価格が公開された後でもシステムに保持される多くの関連する `Price` モデルがある場合があります。さらに、製品の新しい価格データを事前に公開して、`published_at` 列を介して将来の日付に有効にすることができる場合があります。

<!-- So, in summary, we need to retrieve the latest published pricing where the published date is not in the future. In addition, if two prices have the same published date, we will prefer the price with the greatest ID. To accomplish this, we must pass an array to the `ofMany` method that contains the sortable columns which determine the latest price. In addition, a closure will be provided as the second argument to the `ofMany` method. This closure will be responsible for adding additional publish date constraints to the relationship query: -->
したがって、要約すると、公開日が将来ではない最新の公開価格を取得する必要があります。さらに、2 つの価格の発行日が同じ場合は、ID が最も大きい価格が優先されます。これを実現するには、最新の価格を決定する並べ替え可能な列を含む配列を `ofMany` メソッドに渡す必要があります。さらに、クロージャは `ofMany` メソッドの 2 番目の引数として提供されます。このクロージャは、リレーションシップ クエリに追加の公開日制約を追加する役割を果たします。

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
「has-one-through」関係は、別のモデルとの 1 対 1 の関係を定義します。ただし、この関係は、3 番目のモデルを通過することで、宣言モデルを別のモデルの 1 つのインスタンスと照合できることを示しています。

<!-- For example, in a vehicle repair shop application, each `Mechanic` model may be associated with one `Car` model, and each `Car` model may be associated with one `Owner` model. While the mechanic and the owner have no direct relationship within the database, the mechanic can access the owner _through_ the `Car` model. Let's look at the tables necessary to define this relationship: -->
たとえば、自動車修理工場アプリケーションでは、各 `Mechanic` モデルが 1 つの `Car` モデルに関連付けられ、各 `Car` モデルが 1 つの `Owner` モデルに関連付けられる場合があります。整備士と所有者にはデータベース内で直接の関係はありませんが、整備士は `Car` モデルを介して所有者にアクセスできます。この関係を定義するために必要なテーブルを見てみましょう。

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
リレーションシップのテーブル構造を調べたので、`Mechanic` モデルでリレーションシップを定義しましょう。

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
`hasOneThrough` メソッドに渡される最初の引数はアクセスする最終モデルの名前であり、2 番目の引数は中間モデルの名前です。

<!-- Or, if the relevant relationships have already been defined on all of the models involved in the relationship, you may fluently define a "has-one-through" relationship by invoking the `through` method and supplying the names of those relationships. For example, if the `Mechanic` model has a `cars` relationship and the `Car` model has an `owner` relationship, you may define a "has-one-through" relationship connecting the mechanic and the owner like so: -->
または、関連するリレーションシップがそのリレーションシップに関与するすべてのモデルですでに定義されている場合は、`through` メソッドを呼び出してそれらのリレーションシップの名前を指定することによって、「has-one-through」リレーションシップをスムーズに定義できます。たとえば、`Mechanic` モデルに `cars` 関係があり、`Car` モデルに `owner` 関係がある場合、次のように整備士と所有者を接続する「has-one-through」関係を定義できます。

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
関係のクエリを実行するときは、一般的な Eloquent 外部キー規則が使用されます。関係のキーをカスタマイズしたい場合は、それらを `hasOneThrough` メソッドの 3 番目と 4 番目の引数として渡すことができます。 3 番目の引数は、中間モデルの外部キーの名前です。 4 番目の引数は、最終モデルの外部キーの名前です。 5 番目の引数はローカル キーであり、6 番目の引数は中間モデルのローカル キーです。

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
または、前に説明したように、関係に関係するすべてのモデルで関連する関係がすでに定義されている場合は、`through` メソッドを呼び出してそれらの関係の名前を指定することによって、「has-one-through」関係をスムーズに定義できます。このアプローチには、既存の関係ですでに定義されている主要な規則を再利用できるという利点があります。

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
「has-many-through」関係は、中間関係を介して離れた関係にアクセスする便利な方法を提供します。たとえば、[Laravel Cloud](https://cloud.laravel.com) のような展開プラットフォームを構築していると仮定します。 `Application` モデルは、中間の `Environment` モデルを介して多くの `Deployment` モデルにアクセスする可能性があります。この例を使用すると、特定のアプリケーションのすべてのデプロイメントを簡単に収集できます。この関係を定義するために必要なテーブルを見てみましょう。

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
リレーションシップのテーブル構造を調べたので、`Application` モデルでリレーションシップを定義しましょう。

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
`hasManyThrough` メソッドに渡される最初の引数はアクセスする最終モデルの名前であり、2 番目の引数は中間モデルの名前です。

<!-- Or, if the relevant relationships have already been defined on all of the models involved in the relationship, you may fluently define a "has-many-through" relationship by invoking the `through` method and supplying the names of those relationships. For example, if the `Application` model has a `environments` relationship and the `Environment` model has a `deployments` relationship, you may define a "has-many-through" relationship connecting the application and the deployments like so: -->
または、関連するリレーションシップがそのリレーションシップに関与するすべてのモデルですでに定義されている場合は、`through` メソッドを呼び出してそれらのリレーションシップの名前を指定することで、「has-many-through」リレーションシップをスムーズに定義できます。たとえば、`Application` モデルに `environments` 関係があり、`Environment` モデルに `deployments` 関係がある場合、次のようにアプリケーションとデプロイメントを接続する「has-many-through」関係を定義できます。

```php
// String based syntax...
return $this->through('environments')->has('deployments');

// Dynamic syntax...
return $this->throughEnvironments()->hasDeployments();
```

<!-- Though the `Deployment` model's table does not contain a `application_id` column, the `hasManyThrough` relation provides access to an application's deployments via `$application->deployments`. To retrieve these models, Eloquent inspects the `application_id` column on the intermediate `Environment` model's table. After finding the relevant environment IDs, they are used to query the `Deployment` model's table. -->
`Deployment` モデルのテーブルには `application_id` 列が含まれていませんが、`hasManyThrough` リレーションにより、`$application->deployments` を介してアプリケーションのデプロイメントへのアクセスが提供されます。これらのモデルを取得するために、Eloquent は中間 `Environment` モデルのテーブルの `application_id` 列を検査します。関連する環境 ID を見つけた後、それらを使用して `Deployment` モデルのテーブルをクエリします。

<a name="has-many-through-key-conventions"></a>
<!-- #### Key Conventions -->
#### Key Conventions

<!-- Typical Eloquent foreign key conventions will be used when performing the relationship's queries. If you would like to customize the keys of the relationship, you may pass them as the third and fourth arguments to the `hasManyThrough` method. The third argument is the name of the foreign key on the intermediate model. The fourth argument is the name of the foreign key on the final model. The fifth argument is the local key, while the sixth argument is the local key of the intermediate model: -->
関係のクエリを実行するときは、一般的な Eloquent 外部キー規則が使用されます。関係のキーをカスタマイズしたい場合は、それらを `hasManyThrough` メソッドの 3 番目と 4 番目の引数として渡すことができます。 3 番目の引数は、中間モデルの外部キーの名前です。 4 番目の引数は、最終モデルの外部キーの名前です。 5 番目の引数はローカル キーであり、6 番目の引数は中間モデルのローカル キーです。

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
または、前に説明したように、関係に関係するすべてのモデルで関連する関係がすでに定義されている場合は、`through` メソッドを呼び出してそれらの関係の名前を指定することによって、「has-many-through」関係をスムーズに定義できます。このアプローチには、既存の関係ですでに定義されている主要な規則を再利用できるという利点があります。

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
関係を制約する追加のメソッドをモデルに追加するのが一般的です。たとえば、追加の `where` 制約を使用して、より広範な `posts` 関係を制約する `featuredPosts` メソッドを `User` モデルに追加できます。

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
ただし、`featuredPosts` メソッドを使用してモデルを作成しようとすると、その `featured` 属性は `true` に設定されません。リレーションシップ メソッドを使用してモデルを作成し、そのリレーションシップを介して作成されたすべてのモデルに追加する属性も指定したい場合は、リレーションシップ クエリを構築するときに `withAttributes` メソッドを使用できます。

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
`withAttributes` メソッドは、指定された属性を使用して `where` 条件をクエリに追加し、また、リレーションシップ メソッドを介して作成されたモデルに指定された属性を追加します。

```php
$post = $user->featuredPosts()->create(['title' => 'Featured Post']);

$post->featured; // true
```

<!-- To instruct the `withAttributes` method to not add `where` conditions to the query, you may set the `asConditions` argument to `false`: -->
`withAttributes` メソッドに `where` 条件をクエリに追加しないように指示するには、`asConditions` 引数を `false` に設定します。

```php
return $this->posts()->withAttributes(['featured' => true], asConditions: false);
```

<a name="many-to-many"></a>
<!-- ## Many to Many Relationships -->
## Many to Many Relationships

<!-- Many-to-many relations are slightly more complicated than `hasOne` and `hasMany` relationships. An example of a many-to-many relationship is a user that has many roles and those roles are also shared by other users in the application. For example, a user may be assigned the role of "Author" and "Editor"; however, those roles may also be assigned to other users as well. So, a user has many roles and a role has many users. -->
多対多のリレーションは、`hasOne` および `hasMany` のリレーションよりも少し複雑です。多対多の関係の例としては、ユーザーが多くのロールを持ち、それらのロールがアプリケーション内の他のユーザーによって共有される場合があります。たとえば、ユーザーに「作成者」と「編集者」の役割を割り当てることができます。ただし、これらの役割は他のユーザーにも割り当てられる場合があります。したがって、ユーザーには多くのロールがあり、ロールには多くのユーザーが含まれます。

<a name="many-to-many-table-structure"></a>
<!-- #### Table Structure -->
#### Table Structure

<!-- To define this relationship, three database tables are needed: `users`, `roles`, and `role_user`. The `role_user` table is derived from the alphabetical order of the related model names and contains `user_id` and `role_id` columns. This table is used as an intermediate table linking the users and roles. -->
この関係を定義するには、`users`、`roles`、および `role_user` の 3 つのデータベース テーブルが必要です。 `role_user` テーブルは、関連するモデル名のアルファベット順から派生し、`user_id` 列と `role_id` 列が含まれます。このテーブルは、ユーザーとロールを結び付ける中間テーブルとして使用されます。

<!-- Remember, since a role can belong to many users, we cannot simply place a `user_id` column on the `roles` table. This would mean that a role could only belong to a single user. In order to provide support for roles being assigned to multiple users, the `role_user` table is needed. We can summarize the relationship's table structure like so: -->
ロールは多くのユーザーに属することができるため、単純に `user_id` 列を `roles` テーブルに配置することはできないことに注意してください。これは、ロールは 1 人のユーザーにのみ属することができることを意味します。複数のユーザーに割り当てられるロールのサポートを提供するには、`role_user` テーブルが必要です。リレーションシップのテーブル構造は次のように要約できます。

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
多対多の関係は、`belongsToMany` メソッドの結果を返すメソッドを作成することによって定義されます。 `belongsToMany` メソッドは、アプリケーションのすべての Eloquent モデルで使用される `Illuminate\Database\Eloquent\Model` 基本クラスによって提供されます。たとえば、`User` モデルで `roles` メソッドを定義してみましょう。このメソッドに渡される最初の引数は、関連するモデル クラスの名前です。

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
関係が定義されたら、`roles` 動的関係プロパティを使用してユーザーのロールにアクセスできます。

```php
use App\Models\User;

$user = User::find(1);

foreach ($user->roles as $role) {
    // ...
}
```

<!-- Since all relationships also serve as query builders, you may add further constraints to the relationship query by calling the `roles` method and continuing to chain conditions onto the query: -->
すべてのリレーションシップはクエリビルダとしても機能するため、`roles` メソッドを呼び出してクエリに条件を連鎖させ続けることで、リレーションシップ クエリにさらに制約を追加できます。

```php
$roles = User::find(1)->roles()->orderBy('name')->get();
```

<!-- To determine the table name of the relationship's intermediate table, Eloquent will join the two related model names in alphabetical order. However, you are free to override this convention. You may do so by passing a second argument to the `belongsToMany` method: -->
リレーションシップの中間テーブルのテーブル名を決定するために、Eloquent は 2 つの関連するモデル名をアルファベット順に結合します。ただし、この規則は自由にオーバーライドできます。これを行うには、2 番目の引数を `belongsToMany` メソッドに渡します。

```php
return $this->belongsToMany(Role::class, 'role_user');
```

<!-- In addition to customizing the name of the intermediate table, you may also customize the column names of the keys on the table by passing additional arguments to the `belongsToMany` method. The third argument is the foreign key name of the model on which you are defining the relationship, while the fourth argument is the foreign key name of the model that you are joining to: -->
中間テーブルの名前をカスタマイズするだけでなく、追加の引数を `belongsToMany` メソッドに渡すことで、テーブルのキーの列名もカスタマイズできます。 3 番目の引数はリレーションシップを定義するモデルの外部キー名で、4 番目の引数は結合先のモデルの外部キー名です。

```php
return $this->belongsToMany(Role::class, 'role_user', 'user_id', 'role_id');
```

<a name="many-to-many-defining-the-inverse-of-the-relationship"></a>
<!-- #### Defining the Inverse of the Relationship -->
#### Defining the Inverse of the Relationship

<!-- To define the "inverse" of a many-to-many relationship, you should define a method on the related model which also returns the result of the `belongsToMany` method. To complete our user / role example, let's define the `users` method on the `Role` model: -->
多対多の関係の「逆」を定義するには、`belongsToMany` メソッドの結果も返す関連モデル上でメソッドを定義する必要があります。ユーザー/ロールの例を完成させるために、`Role` モデルで `users` メソッドを定義しましょう。

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
ご覧のとおり、関係は、`App\Models\User` モデルの参照を除き、対応する `User` モデルとまったく同じように定義されています。 `belongsToMany` メソッドを再利用しているため、多対多のリレーションシップの「逆」を定義するときに、通常のテーブルとキーのカスタマイズ オプションがすべて利用可能です。

<a name="retrieving-intermediate-table-columns"></a>
<!-- ### Retrieving Intermediate Table Columns -->
### Retrieving Intermediate Table Columns

<!-- As you have already learned, working with many-to-many relations requires the presence of an intermediate table. Eloquent provides some very helpful ways of interacting with this table. For example, let's assume our `User` model has many `Role` models that it is related to. After accessing this relationship, we may access the intermediate table using the `pivot` attribute on the models: -->
すでに学習したように、多対多のリレーションを操作するには、中間テーブルの存在が必要です。 Eloquent は、このテーブルを操作するための非常に役立つ方法をいくつか提供します。たとえば、`User` モデルに関連する `Role` モデルが多数あると仮定します。このリレーションシップにアクセスした後、モデルの `pivot` 属性を使用して中間テーブルにアクセスできます。

```php
use App\Models\User;

$user = User::find(1);

foreach ($user->roles as $role) {
    echo $role->pivot->created_at;
}
```

<!-- Notice that each `Role` model we retrieve is automatically assigned a `pivot` attribute. This attribute contains a model representing the intermediate table. -->
取得した各 `Role` モデルには、自動的に `pivot` 属性が割り当てられることに注意してください。この属性には、中間テーブルを表すモデルが含まれています。

<!-- By default, only the model keys will be present on the `pivot` model. If your intermediate table contains extra attributes, you must specify them when defining the relationship: -->
デフォルトでは、`pivot` モデルにはモデル キーのみが存在します。中間テーブルに追加の属性が含まれている場合は、リレーションシップを定義するときにそれらを指定する必要があります。

```php
return $this->belongsToMany(Role::class)->withPivot('active', 'created_by');
```

<!-- If you would like your intermediate table to have `created_at` and `updated_at` timestamps that are automatically maintained by Eloquent, call the `withTimestamps` method when defining the relationship: -->
中間テーブルに Eloquent によって自動的に維持される `created_at` および `updated_at` タイムスタンプを持たせたい場合は、関係を定義するときに `withTimestamps` メソッドを呼び出します。

```php
return $this->belongsToMany(Role::class)->withTimestamps();
```

> [!WARNING]
> Eloquent が自動的に管理するタイムスタンプを利用する中間テーブルには、`created_at` と `updated_at` の両方のタイムスタンプカラムが必要です。

<a name="customizing-the-pivot-attribute-name"></a>
<!-- #### Customizing the `pivot` Attribute Name -->
#### Customizing the `pivot` Attribute Name

<!-- As noted previously, attributes from the intermediate table may be accessed on models via the `pivot` attribute. However, you are free to customize the name of this attribute to better reflect its purpose within your application. -->
前述したように、中間テーブルの属性には、`pivot` 属性を介してモデル上でアクセスできます。ただし、アプリケーション内での目的をより適切に反映するために、この属性の名前を自由にカスタマイズできます。

<!-- For example, if your application contains users that may subscribe to podcasts, you likely have a many-to-many relationship between users and podcasts. If this is the case, you may wish to rename your intermediate table attribute to `subscription` instead of `pivot`. This can be done using the `as` method when defining the relationship: -->
たとえば、アプリケーションにポッドキャストを購読する可能性のあるユーザーが含まれている場合、ユーザーとポッドキャストの間に多対多の関係が存在する可能性があります。この場合、中間テーブル属性の名前を `pivot` ではなく `subscription` に変更するとよいでしょう。これは、関係を定義するときに `as` メソッドを使用して行うことができます。

```php
return $this->belongsToMany(Podcast::class)
    ->as('subscription')
    ->withTimestamps();
```

<!-- Once the custom intermediate table attribute has been specified, you may access the intermediate table data using the customized name: -->
カスタム中間テーブル属性を指定すると、カスタマイズされた名前を使用して中間テーブル データにアクセスできます。

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
関係を定義するときに、`wherePivot`、`wherePivotIn`、`wherePivotNotIn`、`wherePivotBetween`、`wherePivotNotBetween`、`wherePivotNull`、および `wherePivotNotNull` メソッドを使用して、`belongsToMany` 関係クエリによって返された結果をフィルターすることもできます。

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
`wherePivot` はクエリに where 句制約を追加しますが、定義された関係を介して新しいモデルを作成するときに指定された値は追加しません。特定のピボット値のクエリと関係の作成の両方が必要な場合は、`withPivotValue` メソッドを使用できます。

```php
return $this->belongsToMany(Role::class)
    ->withPivotValue('approved', 1);
```

<a name="ordering-queries-via-intermediate-table-columns"></a>
<!-- ### Ordering Queries via Intermediate Table Columns -->
### Ordering Queries via Intermediate Table Columns

<!-- You can order the results returned by `belongsToMany` relationship queries using the `orderByPivot` and `orderByPivotDesc` methods. In the following example, we will retrieve all of the latest badges for the user: -->
`orderByPivot` メソッドと `orderByPivotDesc` メソッドを使用して、`belongsToMany` 関係クエリによって返された結果を並べ替えることができます。次の例では、ユーザーの最新のバッジをすべて取得します。

```php
return $this->belongsToMany(Badge::class)
    ->where('rank', 'gold')
    ->orderByPivotDesc('created_at');
```

<a name="defining-custom-intermediate-table-models"></a>
<!-- ### Defining Custom Intermediate Table Models -->
### Defining Custom Intermediate Table Models

<!-- If you would like to define a custom model to represent the intermediate table of your many-to-many relationship, you may call the `using` method when defining the relationship. Custom pivot models give you the opportunity to define additional behavior on the pivot model, such as methods and casts. -->
多対多のリレーションシップの中間テーブルを表すカスタム モデルを定義したい場合は、リレーションシップを定義するときに `using` メソッドを呼び出すことができます。カスタム ピボット モデルを使用すると、ピボット モデルでメソッドやcastなどの追加の動作を定義できます。

<!-- Custom many-to-many pivot models should extend the `Illuminate\Database\Eloquent\Relations\Pivot` class while custom polymorphic many-to-many pivot models should extend the `Illuminate\Database\Eloquent\Relations\MorphPivot` class. For example, we may define a `Role` model which uses a custom `RoleUser` pivot model: -->
カスタム多対多ピボット モデルは `Illuminate\Database\Eloquent\Relations\Pivot` クラスを拡張する必要があり、カスタムの多態性多対多ピボット モデルは `Illuminate\Database\Eloquent\Relations\MorphPivot` クラスを拡張する必要があります。たとえば、カスタム `RoleUser` ピボット モデルを使用する `Role` モデルを定義できます。

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
`RoleUser` モデルを定義するときは、`Illuminate\Database\Eloquent\Relations\Pivot` クラスを拡張する必要があります。

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
> ピボットモデルでは `SoftDeletes` トレイトを使用できません。ピボットレコードをソフトデリートする必要がある場合は、ピボットモデルを実際の Eloquent モデルに変換することを検討してください。

<a name="custom-pivot-models-and-incrementing-ids"></a>
<!-- #### Custom Pivot Models and Incrementing IDs -->
#### Custom Pivot Models and Incrementing IDs

<!-- If you have defined a many-to-many relationship that uses a custom pivot model, and that pivot model has an auto-incrementing primary key, you should ensure your custom pivot model class uses the `Table` attribute with `incrementing` set to `true`: -->
カスタム ピボット モデルを使用する多対多の関係を定義しており、そのピボット モデルに自動インクリメント主キーがある場合は、カスタム ピボット モデル クラスで、`incrementing` が `true` に設定された `Table` 属性を使用していることを確認する必要があります。

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
カスタムピボットモデルで、リレーションを定義しているモデルと関連モデルに対する `belongsTo` リレーションを定義している場合、`chaperone` を呼び出すことで、各ピボットモデルにそれらのリレーションを自動的に設定できます。これにより、ピボット経由でモデルにアクセスするときの追加クエリを回避できます。

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
Eloquent はピボットリレーションの名前を推測しようとします。ピボットモデルで標準とは異なる名前を使用している場合は、リレーションを定義しているモデルと関連モデルのリレーション名を `chaperone` に渡してください。

```php
return $this->belongsToMany(User::class)
    ->using(RoleUser::class)
    ->chaperone(declaring: 'role', related: 'user');
```

<a name="polymorphic-relationships"></a>
<!-- ## Polymorphic Relationships -->
## Polymorphic Relationships

<!-- A polymorphic relationship allows the child model to belong to more than one type of model using a single association. For example, imagine you are building an application that allows users to share blog posts and videos. In such an application, a `Comment` model might belong to both the `Post` and `Video` models. -->
ポリモーフィックな関係により、子モデルは単一の関連付けを使用して複数のタイプのモデルに属することができます。たとえば、ユーザーがブログ投稿やビデオを共有できるアプリケーションを構築していると想像してください。このようなアプリケーションでは、`Comment` モデルが `Post` モデルと `Video` モデルの両方に属する可能性があります。

<a name="one-to-one-polymorphic-relations"></a>
<!-- ### One to One (Polymorphic) -->
### One to One (Polymorphic)

<a name="one-to-one-polymorphic-table-structure"></a>
<!-- #### Table Structure -->
#### Table Structure

<!-- A one-to-one polymorphic relation is similar to a typical one-to-one relation; however, the child model can belong to more than one type of model using a single association. For example, a blog `Post` and a `User` may share a polymorphic relation to an `Image` model. Using a one-to-one polymorphic relation allows you to have a single table of unique images that may be associated with posts and users. First, let's examine the table structure: -->
1 対 1 の多態性リレーションは、典型的な 1 対 1 のリレーションと似ています。ただし、子モデルは、単一の関連付けを使用して複数のタイプのモデルに属することができます。たとえば、ブログ `Post` と `User` は、`Image` モデルとの多態性関係を共有する場合があります。 1 対 1 のポリモーフィックな関係を使用すると、投稿やユーザーに関連付けられる一意の画像を含む単一のテーブルを作成できます。まず、テーブル構造を調べてみましょう。

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
`images` テーブルの `imageable_id` 列と `imageable_type` 列に注目してください。 `imageable_id` 列には投稿またはユーザーの ID 値が含まれ、`imageable_type` 列には親モデルのクラス名が含まれます。 `imageable_type` 列は、`imageable` リレーションにアクセスするときに、親モデルのどの「タイプ」を返すかを決定するために Eloquent によって使用されます。この場合、列には `App\Models\Post` または `App\Models\User` のいずれかが含まれます。

<a name="one-to-one-polymorphic-model-structure"></a>
<!-- #### Model Structure -->
#### Model Structure

<!-- Next, let's examine the model definitions needed to build this relationship: -->
次に、このリレーションを構築するために必要なモデル定義を確認しましょう。

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
データベースのテーブルとモデルを定義したら、モデルを介してリレーションシップにアクセスできるようになります。たとえば、投稿の画像を取得するには、`image` 動的関係プロパティにアクセスします。

```php
use App\Models\Post;

$post = Post::find(1);

$image = $post->image;
```

<!-- You may retrieve the parent of the polymorphic model by accessing the name of the method that performs the call to `morphTo`. In this case, that is the `imageable` method on the `Image` model. So, we will access that method as a dynamic relationship property: -->
`morphTo` への呼び出しを実行するメソッドの名前にアクセスすることで、多態性モデルの親を取得できます。この場合、それは `Image` モデルの `imageable` メソッドです。したがって、動的関係プロパティとしてそのメソッドにアクセスします。

```php
use App\Models\Image;

$image = Image::find(1);

$imageable = $image->imageable;
```

<!-- The `imageable` relation on the `Image` model will return either a `Post` or `User` instance, depending on which type of model owns the image. -->
`Image` モデルの `imageable` リレーションは、イメージを所有するモデルのタイプに応じて、`Post` インスタンスまたは `User` インスタンスを返します。

<a name="morph-one-to-one-key-conventions"></a>
<!-- #### Key Conventions -->
#### Key Conventions

<!-- If necessary, you may specify the name of the "id" and "type" columns utilized by your polymorphic child model. If you do so, ensure that you always pass the name of the relationship as the first argument to the `morphTo` method. Typically, this value should match the method name, so you may use PHP's `__FUNCTION__` constant: -->
必要に応じて、多態性子モデルで使用される「id」列と「type」列の名前を指定できます。その場合は、常にリレーションシップの名前を最初の引数として `morphTo` メソッドに渡すようにしてください。通常、この値はメソッド名と一致する必要があるため、PHP の `__FUNCTION__` 定数を使用できます。

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
1 対多のポリモーフィックな関係は、典型的な 1 対多の関係と似ています。ただし、子モデルは、単一の関連付けを使用して複数のタイプのモデルに属することができます。たとえば、アプリケーションのユーザーが投稿やビデオに「コメント」できると想像してください。ポリモーフィックな関係を使用すると、単一の `comments` テーブルを使用して、投稿とビデオの両方のコメントを含めることができます。まず、この関係を構築するために必要なテーブル構造を調べてみましょう。

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
次に、このリレーションを構築するために必要なモデル定義を確認してみましょう。

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
データベース テーブルとモデルを定義したら、モデルの動的関係プロパティを介して関係にアクセスできます。たとえば、投稿のすべてのコメントにアクセスするには、`comments` 動的プロパティを使用できます。

```php
use App\Models\Post;

$post = Post::find(1);

foreach ($post->comments as $comment) {
    // ...
}
```

<!-- You may also retrieve the parent of a polymorphic child model by accessing the name of the method that performs the call to `morphTo`. In this case, that is the `commentable` method on the `Comment` model. So, we will access that method as a dynamic relationship property in order to access the comment's parent model: -->
`morphTo` への呼び出しを実行するメソッドの名前にアクセスして、多態性子モデルの親を取得することもできます。この場合、それは `Comment` モデルの `commentable` メソッドです。したがって、コメントの親モデルにアクセスするために、動的関係プロパティとしてそのメソッドにアクセスします。

```php
use App\Models\Comment;

$comment = Comment::find(1);

$commentable = $comment->commentable;
```

<!-- The `commentable` relation on the `Comment` model will return either a `Post` or `Video` instance, depending on which type of model is the comment's parent. -->
`Comment` モデルの `commentable` リレーションは、コメントの親であるモデルのタイプに応じて、`Post` インスタンスまたは `Video` インスタンスを返します。

<a name="polymorphic-automatically-hydrating-parent-models-on-children"></a>
<!-- #### Automatically Hydrating Parent Models on Children -->
#### Automatically Hydrating Parent Models on Children

<!-- Even when utilizing Eloquent eager loading, "N + 1" query problems can arise if you try to access the parent model from a child model while looping through the child models: -->
Eloquent の eager loading を利用していても、子モデルをループ処理しながら子モデルから親モデルへアクセスしようとすると、「N + 1」クエリ問題が発生することがあります。

```php
$posts = Post::with('comments')->get();

foreach ($posts as $post) {
    foreach ($post->comments as $comment) {
        echo $comment->commentable->title;
    }
}
```

<!-- In the example above, an "N + 1" query problem has been introduced because, even though comments were eager loaded for every `Post` model, Eloquent does not automatically hydrate the parent `Post` on each child `Comment` model. -->
上の例では、すべての `Post` モデルに対してコメントを eager load しているにもかかわらず、Eloquent が各子 `Comment` モデルに親の `Post` を自動的に hydrate しないため、「N + 1」クエリ問題が発生しています。

<!-- If you would like Eloquent to automatically hydrate parent models onto their children, you may invoke the `chaperone` method when defining a `morphMany` relationship: -->
Eloquent が親モデルをその子に自動的にハイドレートするようにしたい場合は、`morphMany` 関係を定義するときに `chaperone` メソッドを呼び出すことができます。

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
または、実行時に親モデルの自動ハイドレーションを有効にする場合は、リレーションを Eager ロードする際に `chaperone` モデルを呼び出せます。

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
場合によっては、モデルに多数の関連モデルがある場合でも、関係の「最新」または「最も古い」関連モデルを簡単に取得したいことがあります。たとえば、`User` モデルは多くの `Image` モデルに関連している可能性がありますが、ユーザーがアップロードした最新の画像を操作する便利な方法を定義したいとします。これは、`morphOne` 関係タイプと `ofMany` メソッドを組み合わせて使用​​することで実現できます。

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
同様に、リレーションの「最古」、つまり最初の関連モデルを取得するメソッドも定義できます。

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
デフォルトでは、`latestOfMany` と `oldestOfMany` メソッドは、ソート可能なモデルの主キーを基準に、関連するモデルの中から最新または最古のモデルを取得します。ただし、より大きなリレーションから、別のソート基準を使って1つのモデルを取得したい場合もあります。

<!-- For example, using the `ofMany` method, you may retrieve the user's most "liked" image. The `ofMany` method accepts the sortable column as its first argument and which aggregate function (`min` or `max`) to apply when querying for the related model: -->
たとえば、`ofMany` メソッドを使用すると、ユーザーが最も「気に入った」画像を取得できます。 `ofMany` メソッドは、最初の引数としてソート可能な列を受け入れ、関連モデルのクエリを実行するときに適用する集計関数 (`min` または `max`) を受け取ります。

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
> より高度な「複数の中から1つ」のリレーションを構築することもできます。詳しくは、[has one of many documentation](#advanced-has-one-of-many-relationships)を参照してください。

<a name="many-to-many-polymorphic-relations"></a>
<!-- ### Many to Many (Polymorphic) -->
### Many to Many (Polymorphic)

<a name="many-to-many-polymorphic-table-structure"></a>
<!-- #### Table Structure -->
#### Table Structure

<!-- Many-to-many polymorphic relations are slightly more complicated than "morph one" and "morph many" relationships. For example, a `Post` model and `Video` model could share a polymorphic relation to a `Tag` model. Using a many-to-many polymorphic relation in this situation would allow your application to have a single table of unique tags that may be associated with posts or videos. First, let's examine the table structure required to build this relationship: -->
多対多のポリモーフィック リレーションは、「モーフ 1」および「モーフ メニー」リレーションシップよりも少し複雑です。たとえば、`Post` モデルと `Video` モデルは、`Tag` モデルに対する多態性リレーションを共有できます。この状況で多対多のポリモーフィックな関係を使用すると、アプリケーションは投稿やビデオに関連付けられる可能性のある一意のタグの単一のテーブルを持つことができます。まず、この関係を構築するために必要なテーブル構造を調べてみましょう。

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
> ポリモーフィックな多対多リレーションについて詳しく学ぶ前に、一般的な [many-to-many relationships](#many-to-many) のドキュメントを読むとよいでしょう。

<a name="many-to-many-polymorphic-model-structure"></a>
<!-- #### Model Structure -->
#### Model Structure

<!-- Next, we're ready to define the relationships on the models. The `Post` and `Video` models will both contain a `tags` method that calls the `morphToMany` method provided by the base Eloquent model class. -->
次に、モデル上の関係を定義する準備が整います。 `Post` モデルと `Video` モデルには両方とも、基本 Eloquent モデル クラスによって提供される `morphToMany` メソッドを呼び出す `tags` メソッドが含まれます。

<!-- The `morphToMany` method accepts the name of the related model as well as the "relationship name". Based on the name we assigned to our intermediate table name and the keys it contains, we will refer to the relationship as "taggable": -->
`morphToMany` メソッドは、関連モデルの名前と「関係名」を受け入れます。中間テーブル名に割り当てた名前とそれに含まれるキーに基づいて、この関係を「タグ付け可能」と呼びます。

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
次に、`Tag` モデルで、考えられる親モデルごとにメソッドを定義する必要があります。したがって、この例では、`posts` メソッドと `videos` メソッドを定義します。これらのメソッドは両方とも、`morphedByMany` メソッドの結果を返す必要があります。

<!-- The `morphedByMany` method accepts the name of the related model as well as the "relationship name". Based on the name we assigned to our intermediate table name and the keys it contains, we will refer to the relationship as "taggable": -->
`morphedByMany` メソッドは、関連モデルの名前と「関係名」を受け入れます。中間テーブル名に割り当てた名前とそれに含まれるキーに基づいて、この関係を「タグ付け可能」と呼びます。

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
データベースのテーブルとモデルを定義したら、モデルを介してリレーションシップにアクセスできるようになります。たとえば、投稿のすべてのタグにアクセスするには、`tags` 動的関係プロパティを使用できます。

```php
use App\Models\Post;

$post = Post::find(1);

foreach ($post->tags as $tag) {
    // ...
}
```

<!-- You may retrieve the parent of a polymorphic relation from the polymorphic child model by accessing the name of the method that performs the call to `morphedByMany`. In this case, that is the `posts` or `videos` methods on the `Tag` model: -->
`morphedByMany` への呼び出しを実行するメソッドの名前にアクセスすることで、多態性子モデルから多態性関係の親を取得できます。この場合、それは `Tag` モデルの `posts` メソッドまたは `videos` メソッドです。

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
デフォルトでは、Laravel は完全修飾クラス名を使用して関連モデルの「タイプ」を保存します。たとえば、`Comment` モデルが `Post` モデルまたは `Video` モデルに属する上記の 1 対多の関係の例を考えると、デフォルトの `commentable_type` はそれぞれ `App\Models\Post` または `App\Models\Video` になります。ただし、これらの値をアプリケーションの内部構造から切り離したい場合があります。

<!-- For example, instead of using the model names as the "type", we may use simple strings such as `post` and `video`. By doing so, the polymorphic "type" column values in our database will remain valid even if the models are renamed: -->
たとえば、「タイプ」としてモデル名を使用する代わりに、`post` や `video` などの単純な文字列を使用することもできます。そうすることで、モデルの名前が変更されても、データベース内の多態性の「type」列の値は有効なままになります。

```php
use Illuminate\Database\Eloquent\Relations\Relation;

Relation::enforceMorphMap([
    'post' => 'App\Models\Post',
    'video' => 'App\Models\Video',
]);
```

<!-- You may call the `enforceMorphMap` method in the `boot` method of your `App\Providers\AppServiceProvider` class or create a separate service provider if you wish. -->
必要に応じて、`App\Providers\AppServiceProvider` クラスの `boot` メソッドで `enforceMorphMap` メソッドを呼び出すことも、別のサービスプロバイダを作成することもできます。

<!-- You may determine the morph alias of a given model at runtime using the model's `getMorphClass` method. Conversely, you may determine the fully-qualified class name associated with a morph alias using the `Relation::getMorphedModel` method: -->
モデルの `getMorphClass` メソッドを使用して、実行時に特定のモデルのモーフ エイリアスを決定できます。逆に、`Relation::getMorphedModel` メソッドを使用して、モーフ エイリアスに関連付けられた完全修飾クラス名を決定することもできます。

```php
use Illuminate\Database\Eloquent\Relations\Relation;

$alias = $post->getMorphClass();

$class = Relation::getMorphedModel($alias);
```

> [!WARNING]
> 既存のアプリケーションに「morph map」を追加する場合、データベース内のすべての morphable な `*_type` カラム値のうち、完全修飾クラス名が残っているものを「map」名に変換する必要があります。

<a name="dynamic-relationships"></a>
<!-- ### Dynamic Relationships -->
### Dynamic Relationships

<!-- You may use the `resolveRelationUsing` method to define relations between Eloquent models at runtime. While not typically recommended for normal application development, this may occasionally be useful when developing Laravel packages. -->
`resolveRelationUsing` メソッドを使用して、実行時に Eloquent モデル間の関係を定義できます。通常のアプリケーション開発には通常推奨されませんが、Laravel パッケージを開発する場合にはこれが役立つ場合があります。

<!-- The `resolveRelationUsing` method accepts the desired relationship name as its first argument. The second argument passed to the method should be a closure that accepts the model instance and returns a valid Eloquent relationship definition. Typically, you should configure dynamic relationships within the boot method of a [service provider](/docs/13.x/providers): -->
`resolveRelationUsing` メソッドの第1引数には、使用するリレーション名を指定します。メソッドの第2引数には、モデルインスタンスを受け取り、有効な Eloquent リレーション定義を返すクロージャを指定します。通常、動的なリレーションは [service provider](/docs/13.x/providers) の boot メソッド内で設定します。

```php
use App\Models\Order;
use App\Models\Customer;

Order::resolveRelationUsing('customer', function (Order $orderModel) {
    return $orderModel->belongsTo(Customer::class, 'customer_id');
});
```

> [!WARNING]
> 動的なリレーションを定義する場合は、Eloquent のリレーションメソッドに必ず明示的なキー名の引数を指定してください。

<a name="querying-relations"></a>
<!-- ## Querying Relations -->
## Querying Relations

<!-- Since all Eloquent relationships are defined via methods, you may call those methods to obtain an instance of the relationship without actually executing a query to load the related models. In addition, all types of Eloquent relationships also serve as [query builders](/docs/13.x/queries), allowing you to continue to chain constraints onto the relationship query before finally executing the SQL query against your database. -->
Eloquent のリレーションはすべてメソッドとして定義されているため、関連モデルを読み込むクエリを実際に実行せずに、それらのメソッドを呼び出してリレーションのインスタンスを取得できます。さらに、Eloquent のすべてのリレーションは [query builders](/docs/13.x/queries) としても機能するため、データベースに対して SQL クエリを最終的に実行する前に、リレーションのクエリへ条件を続けて追加できます。

<!-- For example, imagine a blog application in which a `User` model has many associated `Post` models: -->
たとえば、`User` モデルに多くの関連する `Post` モデルがあるブログ アプリケーションを想像してください。

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
次のように、`posts` 関係をクエリし、関係に追加の制約を追加できます。

```php
use App\Models\User;

$user = User::find(1);

$user->posts()->where('active', 1)->get();
```

<!-- You are able to use any of the Laravel [query builder's](/docs/13.x/queries) methods on the relationship, so be sure to explore the query builder documentation to learn about all of the methods that are available to you. -->
リレーションでは Laravel の [query builder's](/docs/13.x/queries) のメソッドをすべて使用できます。利用できるメソッドを把握するために、query builder のドキュメントも確認してみてください。

<a name="chaining-orwhere-clauses-after-relationships"></a>
<!-- #### Chaining `orWhere` Clauses After Relationships -->
#### Chaining `orWhere` Clauses After Relationships

<!-- As demonstrated in the example above, you are free to add additional constraints to relationships when querying them. However, use caution when chaining `orWhere` clauses onto a relationship, as the `orWhere` clauses will be logically grouped at the same level as the relationship constraint: -->
上の例で示したように、関係をクエリするときに、関係に制約を自由に追加できます。ただし、`orWhere` 句をリレーションシップにチェーンする場合は、`orWhere` 句がリレーションシップ制約と同じレベルで論理的にグループ化されるため、注意してください。

```php
$user->posts()
    ->where('active', 1)
    ->orWhere('votes', '>=', 100)
    ->get();
```

<!-- The example above will generate the following SQL. As you can see, the `or` clause instructs the query to return _any_ post with greater than 100 votes. The query is no longer constrained to a specific user: -->
上記の例では、次の SQL が生成されます。ご覧のとおり、`or` 句は、100 票を超える投票を含むすべての投稿を返すようにクエリに指示します。クエリは特定のユーザーに制限されなくなりました。

```sql
select *
from posts
where user_id = ? and active = 1 or votes >= 100
```

<!-- In most situations, you should use [logical groups](/docs/13.x/queries#logical-grouping) to group the conditional checks between parentheses: -->
ほとんどの場合、条件チェックを括弧でグループ化するには、[logical groups](/docs/13.x/queries#logical-grouping) を使用してください。

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
上記の例では、次の SQL が生成されます。論理グループ化により制約が適切にグループ化され、クエリは特定のユーザーに制限されたままであることに注意してください。

```sql
select *
from posts
where user_id = ? and (active = 1 or votes >= 100)
```

<a name="relationship-methods-vs-dynamic-properties"></a>
<!-- ### Relationship Methods vs. Dynamic Properties -->
### Relationship Methods vs. Dynamic Properties

<!-- If you do not need to add additional constraints to an Eloquent relationship query, you may access the relationship as if it were a property. For example, continuing to use our `User` and `Post` example models, we may access all of a user's posts like so: -->
Eloquent リレーションシップ クエリに追加の制約を追加する必要がない場合は、プロパティであるかのようにリレーションシップにアクセスできます。たとえば、`User` および `Post` サンプル モデルを引き続き使用すると、次のようにユーザーのすべての投稿にアクセスできます。

```php
use App\Models\User;

$user = User::find(1);

foreach ($user->posts as $post) {
    // ...
}
```

<!-- Dynamic relationship properties perform "lazy loading", meaning they will only load their relationship data when you actually access them. Because of this, developers often use [eager loading](#eager-loading) to pre-load relationships they know will be accessed after loading the model. Eager loading provides a significant reduction in SQL queries that must be executed to load a model's relations. -->
動的関係プロパティは「遅延読み込み」を実行します。つまり、実際にアクセスしたときにのみ関係データが読み込まれます。このため、開発者は多くの場合、[eager loading](#eager-loading) を使用して、モデルのロード後にアクセスされることがわかっている関係を事前にロードします。積極的な読み込みにより、モデルの関係を読み込むために実行する必要がある SQL クエリが大幅に削減されます。

<a name="querying-relationship-existence"></a>
<!-- ### Querying Relationship Existence -->
### Querying Relationship Existence

<!-- When retrieving model records, you may wish to limit your results based on the existence of a relationship. For example, imagine you want to retrieve all blog posts that have at least one comment. To do so, you may pass the name of the relationship to the `has` and `orHas` methods: -->
モデル レコードを取得するとき、関係の存在に基づいて結果を制限したい場合があります。たとえば、少なくとも 1 つのコメントがあるすべてのブログ投稿を取得するとします。これを行うには、関係の名前を `has` メソッドと `orHas` メソッドに渡すことができます。

```php
use App\Models\Post;

// Retrieve all posts that have at least one comment...
$posts = Post::has('comments')->get();
```

<!-- You may also specify an operator and count value to further customize the query: -->
演算子とカウント値を指定して、クエリをさらにカスタマイズすることもできます。

```php
// Retrieve all posts that have three or more comments...
$posts = Post::has('comments', '>=', 3)->get();
```

<!-- Nested `has` statements may be constructed using "dot" notation. For example, you may retrieve all posts that have at least one comment that has at least one image: -->
ネストされた `has` ステートメントは、「ドット」表記を使用して構築できます。たとえば、少なくとも 1 つの画像を含む少なくとも 1 つのコメントを持つすべての投稿を取得できます。

```php
// Retrieve posts that have at least one comment with images...
$posts = Post::has('comments.images')->get();
```

<!-- If you need even more power, you may use the `whereHas` and `orWhereHas` methods to define additional query constraints on your `has` queries, such as inspecting the content of a comment: -->
さらに強力な機能が必要な場合は、`whereHas` メソッドと `orWhereHas` メソッドを使用して、コメントの内容を検査するなど、`has` クエリに追加のクエリ制約を定義できます。

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
> Eloquent は現在、データベースをまたいでリレーションの存在をクエリする機能をサポートしていません。リレーションは同じデータベース内に存在している必要があります。

<a name="many-to-many-relationship-existence-queries"></a>
<!-- #### Many to Many Relationship Existence Queries -->
#### Many to Many Relationship Existence Queries

<!-- The `whereAttachedTo` method may be used to query for models that have a many to many attachment to a model or collection of models: -->
`whereAttachedTo` メソッドは、モデルまたはモデルのコレクションに多対多のアタッチメントを持つモデルをクエリするために使用できます。

```php
$users = User::whereAttachedTo($role)->get();
```

<!-- You may also provide a [collection](/docs/13.x/eloquent-collections) instance to the `whereAttachedTo` method. When doing so, Laravel will retrieve models that are attached to any of the models within the collection: -->
`whereAttachedTo` メソッドには、[collection](/docs/13.x/eloquent-collections) のインスタンスも渡せます。その場合、Laravel はコレクション内のいずれかのモデルに関連付けられているモデルを取得します。

```php
$tags = Tag::whereLike('name', '%laravel%')->get();

$posts = Post::whereAttachedTo($tags)->get();
```

<a name="inline-relationship-existence-queries"></a>
<!-- #### Inline Relationship Existence Queries -->
#### Inline Relationship Existence Queries

<!-- If you would like to query for a relationship's existence with a single, simple where condition attached to the relationship query, you may find it more convenient to use the `whereRelation`, `orWhereRelation`, `whereMorphRelation`, and `orWhereMorphRelation` methods. For example, we may query for all posts that have unapproved comments: -->
関係クエリに関連付けられた単一の単純な where 条件を使用して関係の存在をクエリする場合は、`whereRelation`、`orWhereRelation`、`whereMorphRelation`、および `orWhereMorphRelation` メソッドを使用する方が便利な場合があります。たとえば、未承認のコメントが含まれるすべての投稿をクエリすることができます。

```php
use App\Models\Post;

$posts = Post::whereRelation('comments', 'is_approved', false)->get();
```

<!-- Of course, like calls to the query builder's `where` method, you may also specify an operator: -->
もちろん、クエリビルダの `where` メソッドの呼び出しと同様に、演算子を指定することもできます。

```php
$posts = Post::whereRelation(
    'comments', 'created_at', '>=', now()->minus(hours: 1)
)->get();
```

<a name="querying-relationship-absence"></a>
<!-- ### Querying Relationship Absence -->
### Querying Relationship Absence

<!-- When retrieving model records, you may wish to limit your results based on the absence of a relationship. For example, imagine you want to retrieve all blog posts that **don't** have any comments. To do so, you may pass the name of the relationship to the `doesntHave` and `orDoesntHave` methods: -->
モデル レコードを取得するとき、関係がないことに基づいて結果を制限したい場合があります。たとえば、**コメントのない**すべてのブログ投稿を取得するとします。これを行うには、関係の名前を `doesntHave` メソッドと `orDoesntHave` メソッドに渡すことができます。

```php
use App\Models\Post;

$posts = Post::doesntHave('comments')->get();
```

<!-- If you need even more power, you may use the `whereDoesntHave` and `orWhereDoesntHave` methods to add additional query constraints to your `doesntHave` queries, such as inspecting the content of a comment: -->
さらに強力な機能が必要な場合は、`whereDoesntHave` メソッドと `orWhereDoesntHave` メソッドを使用して、コメントの内容を検査するなど、追加のクエリ制約を `doesntHave` クエリに追加できます。

```php
use Illuminate\Database\Eloquent\Builder;

$posts = Post::whereDoesntHave('comments', function (Builder $query) {
    $query->where('content', 'like', 'code%');
})->get();
```

<!-- You may use "dot" notation to execute a query against a nested relationship. For example, the following query will retrieve all posts that do not have comments as well as posts that have comments where none of the comments are from banned users: -->
「ドット」表記を使用して、ネストされた関係に対してクエリを実行できます。たとえば、次のクエリは、コメントのない投稿と、禁止されたユーザーからのコメントがないコメントのある投稿をすべて取得します。

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
「モーフ先」関係の存在を照会するには、`whereHasMorph` メソッドと `whereDoesntHaveMorph` メソッドを使用できます。これらのメソッドは、最初の引数として関係の名前を受け入れます。次に、メソッドはクエリに含める関連モデルの名前を受け取ります。最後に、関係クエリをカスタマイズするクロージャを提供できます。

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
関連する多態性モデルの「タイプ」に基づいてクエリ制約を追加することが必要になる場合があります。 `whereHasMorph` メソッドに渡されるクロージャは、2 番目の引数として `$type` 値を受け取る場合があります。この引数を使用すると、構築されているクエリの「タイプ」を検査できます。

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
場合によっては、「モーフ」関係の親の子をクエリしたい場合があります。これは、`whereMorphedTo` メソッドと `whereNotMorphedTo` メソッドを使用して実行できます。これにより、指定されたモデルの適切なモーフ タイプ マッピングが自動的に決定されます。これらのメソッドは、`morphTo` 関係の名前を最初の引数として受け入れ、関連する親モデルを 2 番目の引数として受け入れます。

```php
$comments = Comment::whereMorphedTo('commentable', $post)
    ->orWhereMorphedTo('commentable', $video)
    ->get();
```

<a name="querying-all-morph-to-related-models"></a>
<!-- #### Querying All Related Models -->
#### Querying All Related Models

<!-- Instead of passing an array of possible polymorphic models, you may provide `*` as a wildcard value. This will instruct Laravel to retrieve all of the possible polymorphic types from the database. Laravel will execute an additional query in order to perform this operation: -->
可能な多態性モデルの配列を渡す代わりに、ワイルドカード値として `*` を指定できます。これにより、Laravel はデータベースから可能なすべての多態性型を取得するように指示されます。 Laravel は、この操作を実行するために追加のクエリを実行します。

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
実際にモデルをロードせずに、特定の関係に関連するモデルの数を数えたい場合があります。これを実現するには、`withCount` メソッドを使用できます。 `withCount` メソッドは、結果のモデルに `{relation}_count` 属性を配置します。

```php
use App\Models\Post;

$posts = Post::withCount('comments')->get();

foreach ($posts as $post) {
    echo $post->comments_count;
}
```

<!-- By passing an array to the `withCount` method, you may add the "counts" for multiple relations as well as add additional constraints to the queries: -->
配列を `withCount` メソッドに渡すことで、複数のリレーションの「カウント」を追加したり、クエリに追加の制約を追加したりできます。

```php
use Illuminate\Database\Eloquent\Builder;

$posts = Post::withCount(['votes', 'comments' => function (Builder $query) {
    $query->where('content', 'like', 'code%');
}])->get();

echo $posts[0]->votes_count;
echo $posts[0]->comments_count;
```

<!-- You may also alias the relationship count result, allowing multiple counts on the same relationship: -->
関係カウントの結果にエイリアスを付けて、同じ関係に対して複数のカウントを許可することもできます。

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
`loadCount` メソッドを使用すると、親モデルがすでに取得された後で関係数をロードできます。

```php
$book = Book::first();

$book->loadCount('genres');
```

<!-- If you need to set additional query constraints on the count query, you may pass an array keyed by the relationships you wish to count. The array values should be closures which receive the query builder instance: -->
カウント クエリに追加のクエリ制約を設定する必要がある場合は、カウントしたい関係をキーとする配列を渡すことができます。配列値は、クエリビルダ インスタンスを受け取るクロージャである必要があります。

```php
$book->loadCount(['reviews' => function (Builder $query) {
    $query->where('rating', 5);
}])
```

<a name="relationship-counting-and-custom-select-statements"></a>
<!-- #### Relationship Counting and Custom Select Statements -->
#### Relationship Counting and Custom Select Statements

<!-- If you're combining `withCount` with a `select` statement, ensure that you call `withCount` after the `select` method: -->
`withCount` を `select` ステートメントと組み合わせている場合は、必ず `select` メソッドの後に `withCount` を呼び出してください。

```php
$posts = Post::select(['title', 'body'])
    ->withCount('comments')
    ->get();
```

<a name="other-aggregate-functions"></a>
<!-- ### Other Aggregate Functions -->
### Other Aggregate Functions

<!-- In addition to the `withCount` method, Eloquent provides `withMin`, `withMax`, `withAvg`, `withSum`, and `withExists` methods. These methods will place a `{relation}_{function}_{column}` attribute on your resulting models: -->
`withCount` メソッドに加えて、Eloquent は `withMin`、`withMax`、`withAvg`、`withSum`、および `withExists` メソッドを提供します。これらのメソッドは、結果のモデルに `{relation}_{function}_{column}` 属性を配置します。

```php
use App\Models\Post;

$posts = Post::withSum('comments', 'votes')->get();

foreach ($posts as $post) {
    echo $post->comments_sum_votes;
}
```

<!-- If you wish to access the result of the aggregate function using another name, you may specify your own alias: -->
別の名前を使用して集計関数の結果にアクセスしたい場合は、独自のエイリアスを指定できます。

```php
$posts = Post::withSum('comments as total_comments', 'votes')->get();

foreach ($posts as $post) {
    echo $post->total_comments;
}
```

<!-- Like the `loadCount` method, deferred versions of these methods are also available. These additional aggregate operations may be performed on Eloquent models that have already been retrieved: -->
`loadCount` メソッドと同様に、これらのメソッドの遅延バージョンも使用できます。これらの追加の集計操作は、すでに取得されている Eloquent モデルに対して実行できます。

```php
$post = Post::first();

$post->loadSum('comments', 'votes');
```

<!-- If you're combining these aggregate methods with a `select` statement, ensure that you call the aggregate methods after the `select` method: -->
これらの集計メソッドを `select` ステートメントと組み合わせている場合は、必ず `select` メソッドの後に集計メソッドを呼び出してください。

```php
$posts = Post::select(['title', 'body'])
    ->withExists('comments')
    ->get();
```

<a name="counting-related-models-on-morph-to-relationships"></a>
<!-- ### Counting Related Models on Morph To Relationships -->
### Counting Related Models on Morph To Relationships

<!-- If you would like to eager load a "morph to" relationship, as well as related model counts for the various entities that may be returned by that relationship, you may utilize the `with` method in combination with the `morphTo` relationship's `morphWithCount` method. -->
「モーフ」関係、およびその関係によって返されるさまざまなエンティティの関連モデル数を一括ロードしたい場合は、`with` メソッドを `morphTo` 関係の `morphWithCount` メソッドと組み合わせて利用できます。

<!-- In this example, let's assume that `Photo` and `Post` models may create `ActivityFeed` models. We will assume the `ActivityFeed` model defines a "morph to" relationship named `parentable` that allows us to retrieve the parent `Photo` or `Post` model for a given `ActivityFeed` instance. Additionally, let's assume that `Photo` models "have many" `Tag` models and `Post` models "have many" `Comment` models. -->
この例では、`Photo` モデルと `Post` モデルが `ActivityFeed` モデルを作成すると仮定します。 `ActivityFeed` モデルは、特定の `ActivityFeed` インスタンスの親 `Photo` または `Post` モデルを取得できる `parentable` という名前の「モーフ」関係を定義していると仮定します。さらに、`Photo` モデルには `Tag` モデルが「多数」あり、`Post` モデルには `Comment` モデルが「多数」あると仮定します。

<!-- Now, let's imagine we want to retrieve `ActivityFeed` instances and eager load the `parentable` parent models for each `ActivityFeed` instance. In addition, we want to retrieve the number of tags that are associated with each parent photo and the number of comments that are associated with each parent post: -->
ここで、`ActivityFeed` インスタンスを取得し、各 `ActivityFeed` インスタンスの `parentable` 親モデルを一括ロードするとします。さらに、各親写真に関連付けられているタグの数と、各親投稿に関連付けられているコメントの数を取得したいと考えています。

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
すでに `ActivityFeed` モデルのセットを取得しており、アクティビティ フィードに関連付けられたさまざまな `parentable` モデルのネストされた関係数をロードしたいとします。これを実現するには、`loadMorphCount` メソッドを使用できます。

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
Eloquent 関係にプロパティとしてアクセスすると、関連モデルは「遅延読み込み」されます。これは、最初にプロパティにアクセスするまで、リレーションシップ データが実際には読み込まれないことを意味します。ただし、Eloquent は、親モデルをクエリするときに関係を「熱心にロード」できます。積極的な読み込みにより、「N + 1」クエリの問題が軽減されます。 N + 1 クエリの問題を説明するために、`Author` モデルに「属する」 `Book` モデルを考えてみましょう。

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
次に、すべての書籍とその著者を取得しましょう。

```php
use App\Models\Book;

$books = Book::all();

foreach ($books as $book) {
    echo $book->author->name;
}
```

<!-- This loop will execute one query to retrieve all of the books within the database table, then another query for each book in order to retrieve the book's author. So, if we have 25 books, the code above would run 26 queries: one for the original book, and 25 additional queries to retrieve the author of each book. -->
このループは、データベース テーブル内のすべての書籍を取得するために 1 つのクエリを実行し、次に書籍ごとに別のクエリを実行して書籍の著者を取得します。したがって、書籍が 25 冊ある場合、上記のコードは 26 のクエリを実行します。1 つは元の書籍に対して 1 クエリで、各書籍の著者を取得するために 25 の追加クエリが実行されます。

<!-- Thankfully, we can use eager loading to reduce this operation to just two queries. When building a query, you may specify which relationships should be eager loaded using the `with` method: -->
ありがたいことに、積極的な読み込みを使用すると、この操作を 2 つのクエリのみに減らすことができます。クエリを構築するとき、`with` メソッドを使用して、どのリレーションシップを積極的にロードする必要があるかを指定できます。

```php
$books = Book::with('author')->get();

foreach ($books as $book) {
    echo $book->author->name;
}
```

<!-- For this operation, only two queries will be executed - one query to retrieve all of the books and one query to retrieve all of the authors for all of the books: -->
この操作では、2 つのクエリのみが実行されます。1 つはすべての書籍を取得するクエリ、もう 1 つはすべての書籍のすべての著者を取得するクエリです。

```sql
select * from books

select * from authors where id in (1, 2, 3, 4, 5, ...)
```

<a name="eager-loading-multiple-relationships"></a>
<!-- #### Eager Loading Multiple Relationships -->
#### Eager Loading Multiple Relationships

<!-- Sometimes you may need to eager load several different relationships. To do so, just pass an array of relationships to the `with` method: -->
場合によっては、複数の異なる関係を積極的にロードする必要があるかもしれません。これを行うには、関係の配列を `with` メソッドに渡すだけです。

```php
$books = Book::with(['author', 'publisher'])->get();
```

<a name="nested-eager-loading"></a>
<!-- #### Nested Eager Loading -->
#### Nested Eager Loading

<!-- To eager load a relationship's relationships, you may use "dot" syntax. For example, let's eager load all of the book's authors and all of the author's personal contacts: -->
関係の関係を積極的にロードするには、「ドット」構文を使用できます。たとえば、本の著者すべてと著者の個人的な連絡先すべてを熱心にロードしてみましょう。

```php
$books = Book::with('author.contacts')->get();
```

<!-- Alternatively, you may specify nested eager loaded relationships by providing a nested array to the `with` method, which can be convenient when eager loading multiple nested relationships: -->
あるいは、ネストされた配列を `with` メソッドに提供することで、ネストされた一括ロードされた関係を指定することもできます。これは、複数のネストされた関係を一括ロードするときに便利です。

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
`morphTo` 関係、およびその関係によって返されるさまざまなエンティティのネストされた関係を一括ロードしたい場合は、`with` メソッドを `morphTo` 関係の `morphWith` メソッドと組み合わせて使用​​できます。この方法を説明するために、次のモデルを考えてみましょう。

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
この例では、`Event`、`Photo`、`Post` モデルが `ActivityFeed` モデルを作成するとします。また、`Event` モデルは `Calendar` モデルに属し、`Photo` モデルは `Tag` モデルと関連付けられ、`Post` モデルは `Author` モデルに属するとします。

<!-- Using these model definitions and relationships, we may retrieve `ActivityFeed` model instances and eager load all `parentable` models and their respective nested relationships: -->
これらのモデル定義とリレーションを使うと、`ActivityFeed` モデルのインスタンスを取得し、すべての `parentable` モデルと、それぞれのネストされたリレーションをEagerロードできます。

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
取得するリレーションシップのすべての列が必ずしも必要であるとは限りません。このため、Eloquent では、関係のどの列を取得するかを指定できます。

```php
$books = Book::with('author:id,name,book_id')->get();
```

> [!WARNING]
> この機能を使用する場合、取得するカラムの一覧には必ず `id` カラムと、関連する外部キーのカラムを含めてください。

<a name="eager-loading-by-default"></a>
<!-- #### Eager Loading by Default -->
#### Eager Loading by Default

<!-- Sometimes you might want to always load some relationships when retrieving a model. To accomplish this, you may define a `$with` property on the model: -->
場合によっては、モデルを取得するときに常にいくつかの関係をロードしたい場合があります。これを実現するには、モデルに `$with` プロパティを定義します。

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
単一のクエリの `$with` プロパティから項目を削除したい場合は、`without` メソッドを使用できます。

```php
$books = Book::without('author')->get();
```

<!-- If you would like to override all items within the `$with` property for a single query, you may use the `withOnly` method: -->
単一のクエリの `$with` プロパティ内のすべての項目をオーバーライドする場合は、`withOnly` メソッドを使用できます。

```php
$books = Book::withOnly('genre')->get();
```

<a name="constraining-eager-loads"></a>
<!-- ### Constraining Eager Loads -->
### Constraining Eager Loads

<!-- Sometimes you may wish to eager load a relationship but also specify additional query conditions for the eager loading query. You can accomplish this by passing an array of relationships to the `with` method where the array key is a relationship name and the array value is a closure that adds additional constraints to the eager loading query: -->
場合によっては、リレーションシップを一括読み込みしたいときに、一括読み込みクエリに追加のクエリ条件を指定することもできます。これを実現するには、関係の配列を `with` メソッドに渡します。ここで、配列のキーは関係名、配列の値は、熱心な読み込みクエリに追加の制約を追加するクロージャです。

```php
use App\Models\User;

$users = User::with(['posts' => function ($query) {
    $query->where('title', 'like', '%code%');
}])->get();
```

<!-- In this example, Eloquent will only eager load posts where the post's `title` column contains the word `code`. You may call other [query builder](/docs/13.x/queries) methods to further customize the eager loading operation: -->
この例では、Eloquentは投稿の `title` カラムに `code` という単語が含まれる投稿だけを eager load します。eager loading の処理をさらにカスタマイズするには、他の [query builder](/docs/13.x/queries) メソッドも呼び出せます。

```php
$users = User::with(['posts' => function ($query) {
    $query->orderBy('created_at', 'desc');
}])->get();
```

<a name="constraining-eager-loading-of-morph-to-relationships"></a>
<!-- #### Constraining Eager Loading of `morphTo` Relationships -->
#### Constraining Eager Loading of `morphTo` Relationships

<!-- If you are eager loading a `morphTo` relationship, Eloquent will run multiple queries to fetch each type of related model. You may add additional constraints to each of these queries using the `MorphTo` relation's `constrain` method: -->
`morphTo` 関係を積極的にロードしている場合、Eloquent は複数のクエリを実行して、各タイプの関連モデルを取得します。 `MorphTo` リレーションの `constrain` メソッドを使用して、これらのクエリのそれぞれに追加の制約を追加できます。

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
この例では、Eloquent は、非表示になっていない投稿と、`type` 値が「教育」であるビデオのみを積極的に読み込みます。

<a name="constraining-eager-loads-with-relationship-existence"></a>
<!-- #### Constraining Eager Loads With Relationship Existence -->
#### Constraining Eager Loads With Relationship Existence

<!-- You may sometimes find yourself needing to check for the existence of a relationship while simultaneously loading the relationship based on the same conditions. For example, you may wish to only retrieve `User` models that have child `Post` models matching a given query condition while also eager loading the matching posts. You may accomplish this using the `withWhereHas` method: -->
同じ条件に基づいて関係を読み込むと同時に、関係の存在を確認する必要がある場合があります。たとえば、指定されたクエリ条件に一致する子 `Post` モデルを持つ `User` モデルのみを取得し、一致する投稿を一括読み込みすることもできます。これは、`withWhereHas` メソッドを使用して実行できます。

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
場合によっては、親モデルがすでに取得された後でリレーションシップを積極的にロードする必要がある場合があります。たとえば、これは、関連モデルをロードするかどうかを動的に決定する必要がある場合に便利です。

```php
use App\Models\Book;

$books = Book::all();

if ($condition) {
    $books->load('author', 'publisher');
}
```

<!-- If you need to set additional query constraints on the eager loading query, you may pass an array keyed by the relationships you wish to load. The array values should be closure instances which receive the query instance: -->
熱心な読み込みクエリに追加のクエリ制約を設定する必要がある場合は、読み込みたい関係をキーとする配列を渡すことができます。配列値は、クエリ インスタンスを受け取るクロージャ インスタンスである必要があります。

```php
$author->load(['books' => function ($query) {
    $query->orderBy('published_date', 'asc');
}]);
```

<!-- To load a relationship only when it has not already been loaded, use the `loadMissing` method: -->
関係がまだロードされていない場合にのみ関係をロードするには、`loadMissing` メソッドを使用します。

```php
$book->loadMissing('author');
```

<a name="nested-lazy-eager-loading-morphto"></a>
<!-- #### Nested Lazy Eager Loading and `morphTo` -->
#### Nested Lazy Eager Loading and `morphTo`

<!-- If you would like to eager load a `morphTo` relationship, as well as nested relationships on the various entities that may be returned by that relationship, you may use the `loadMorph` method. -->
`morphTo` 関係、およびその関係によって返される可能性のあるさまざまなエンティティのネストされた関係を一括ロードしたい場合は、`loadMorph` メソッドを使用できます。

<!-- This method accepts the name of the `morphTo` relationship as its first argument, and an array of model / relationship pairs as its second argument. To help illustrate this method, let's consider the following model: -->
このメソッドは、最初の引数として `morphTo` 関係の名前を受け入れ、2 番目の引数としてモデルと関係のペアの配列を受け入れます。この方法を説明するために、次のモデルを考えてみましょう。

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
この例では、`Event`、`Photo`、`Post` モデルが `ActivityFeed` モデルを作成するとします。さらに、`Event` モデルは `Calendar` モデルに属し、`Photo` モデルは `Tag` モデルに関連付けられ、`Post` モデルは `Author` モデルに属するとします。

<!-- Using these model definitions and relationships, we may retrieve `ActivityFeed` model instances and eager load all `parentable` models and their respective nested relationships: -->
これらのモデル定義とリレーションを使うと、`ActivityFeed` モデルのインスタンスを取得し、すべての `parentable` モデルと各モデルのネストしたリレーションを一括で読み込めます。

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
多くの場合、Laravel はアクセスする関係を自動的に積極的にロードできます。自動熱心な読み込みを有効にするには、アプリケーションの `AppServiceProvider` の `boot` メソッド内で `Model::automaticallyEagerLoadRelationships` メソッドを呼び出す必要があります。

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
この機能を有効にすると、Laravel は、アクセスしたときにまだロードされていない関係を自動的にロードしようとします。たとえば、次のシナリオを考えてみましょう。

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
通常、上記のコードは、投稿を取得するために各ユーザーに対してクエリを実行し、コメントを取得するために各投稿に対してクエリを実行します。ただし、`automaticallyEagerLoadRelationships` 機能が有効になっている場合、取得したユーザーのいずれかの投稿にアクセスしようとすると、Laravel はユーザーコレクション内のすべてのユーザーの投稿を自動的に [lazy eager load](#lazy-eager-loading) します。同様に、取得した投稿のコメントにアクセスしようとすると、最初に取得したすべての投稿に対して、すべてのコメントが遅延熱心にロードされます。

<!-- If you do not want to globally enable automatic eager loading, you can still enable this feature for a single Eloquent collection instance by invoking the `withRelationshipAutoloading` method on the collection: -->
自動熱心な読み込みをグローバルに有効にしたくない場合でも、コレクションで `withRelationshipAutoloading` メソッドを呼び出すことで、単一の Eloquent コレクション インスタンスに対してこの機能を有効にすることができます。

```php
$users = User::where('vip', true)->get();

return $users->withRelationshipAutoloading();
```

<a name="preventing-lazy-loading"></a>
<!-- ### Preventing Lazy Loading -->
### Preventing Lazy Loading

<!-- As previously discussed, eager loading relationships can often provide significant performance benefits to your application. Therefore, if you would like, you may instruct Laravel to always prevent the lazy loading of relationships. To accomplish this, you may invoke the `preventLazyLoading` method offered by the base Eloquent model class. Typically, you should call this method within the `boot` method of your application's `AppServiceProvider` class. -->
前述したように、積極的な読み込み関係により、多くの場合、アプリケーションに大幅なパフォーマンス上の利点がもたらされます。したがって、必要に応じて、リレーションシップの遅延読み込みを常に防止するように Laravel に指示することもできます。これを実現するには、基本 Eloquent モデル クラスによって提供される `preventLazyLoading` メソッドを呼び出すことができます。通常、このメソッドはアプリケーションの `AppServiceProvider` クラスの `boot` メソッド内で呼び出す必要があります。

<!-- The `preventLazyLoading` method accepts an optional boolean argument that indicates if lazy loading should be prevented. For example, you may wish to only disable lazy loading in non-production environments so that your production environment will continue to function normally even if a lazy loaded relationship is accidentally present in production code: -->
`preventLazyLoading` メソッドは、遅延読み込みを防止する必要があるかどうかを示すオプションのブール引数を受け入れます。たとえば、非実稼働環境でのみ遅延ロードを無効にして、実稼働コードに遅延ロード関係が誤って存在した場合でも実稼働環境が正常に機能し続けるようにすることができます。

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
遅延ロードを防止した後、アプリケーションが Eloquent 関係を遅延ロードしようとすると、Eloquent は `Illuminate\Database\LazyLoadingViolationException` 例外をスローします。

<!-- You may customize the behavior of lazy loading violations using the `handleLazyLoadingViolationsUsing` method. For example, using this method, you may instruct lazy loading violations to only be logged instead of interrupting the application's execution with exceptions: -->
`handleLazyLoadingViolationsUsing` メソッドを使用して、遅延読み込み違反の動作をカスタマイズできます。たとえば、このメソッドを使用すると、例外を発生させてアプリケーションの実行を中断するのではなく、遅延読み込み違反のみをログに記録するように指示できます。

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
Eloquent は、関係に新しいモデルを追加するための便利な方法を提供します。たとえば、投稿に新しいコメントを追加する必要がある場合があります。 `Comment` モデルの `post_id` 属性を手動で設定する代わりに、リレーションシップの `save` メソッドを使用してコメントを挿入できます。

```php
use App\Models\Comment;
use App\Models\Post;

$comment = new Comment(['message' => 'A new comment.']);

$post = Post::find(1);

$post->comments()->save($comment);
```

<!-- Note that we did not access the `comments` relationship as a dynamic property. Instead, we called the `comments` method to obtain an instance of the relationship. The `save` method will automatically add the appropriate `post_id` value to the new `Comment` model. -->
`comments` 関係に動的プロパティとしてアクセスしていないことに注意してください。代わりに、`comments` メソッドを呼び出して関係のインスタンスを取得しました。 `save` メソッドは、適切な `post_id` 値を新しい `Comment` モデルに自動的に追加します。

<!-- If you need to save multiple related models, you may use the `saveMany` method: -->
複数の関連モデルを保存する必要がある場合は、`saveMany` メソッドを使用できます。

```php
$post = Post::find(1);

$post->comments()->saveMany([
    new Comment(['message' => 'A new comment.']),
    new Comment(['message' => 'Another new comment.']),
]);
```

<!-- The `save` and `saveMany` methods will persist the given model instances, but will not add the newly persisted models to any in-memory relationships that are already loaded onto the parent model. If you plan on accessing the relationship after using the `save` or `saveMany` methods, you may wish to use the `refresh` method to reload the model and its relationships: -->
`save` メソッドと `saveMany` メソッドは、指定されたモデル インスタンスを永続化しますが、親モデルに既にロードされているメモリ内の関係に、新しく永続化されたモデルを追加しません。 `save` メソッドまたは `saveMany` メソッドを使用した後にリレーションシップにアクセスする予定がある場合は、`refresh` メソッドを使用してモデルとそのリレーションシップをリロードすることをお勧めします。

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
モデルとそのすべての関連関係を `save` したい場合は、`push` メソッドを使用できます。この例では、`Post` モデルとそのコメント、およびコメントの作成者が保存されます。

```php
$post = Post::find(1);

$post->comments[0]->message = 'Message';
$post->comments[0]->author->name = 'Author Name';

$post->push();
```

<!-- The `pushQuietly` method may be used to save a model and its associated relationships without raising any events: -->
`pushQuietly` メソッドは、イベントを発生させずにモデルとその関連関係を保存するために使用できます。

```php
$post->pushQuietly();
```

<a name="the-create-method"></a>
<!-- ### The `create` Method -->
### The `create` Method

<!-- In addition to the `save` and `saveMany` methods, you may also use the `create` method, which accepts an array of attributes, creates a model, and inserts it into the database. The difference between `save` and `create` is that `save` accepts a full Eloquent model instance while `create` accepts a plain PHP `array`. The newly created model will be returned by the `create` method: -->
`save` メソッドと `saveMany` メソッドに加えて、属性の配列を受け取り、モデルを作成してデータベースに挿入する `create` メソッドも使用できます。 `save` と `create` の違いは、`save` は完全な Eloquent モデル インスタンスを受け入れるのに対し、`create` はプレーンな PHP `array` を受け入れることです。新しく作成されたモデルは、`create` メソッドによって返されます。

```php
use App\Models\Post;

$post = Post::find(1);

$comment = $post->comments()->create([
    'message' => 'A new comment.',
]);
```

<!-- You may use the `createMany` method to create multiple related models: -->
`createMany` メソッドを使用して、複数の関連モデルを作成できます。

```php
$post = Post::find(1);

$post->comments()->createMany([
    ['message' => 'A new comment.'],
    ['message' => 'Another new comment.'],
]);
```

<!-- The `createQuietly` and `createManyQuietly` methods may be used to create a model(s) without dispatching any events: -->
`createQuietly` メソッドと `createManyQuietly` メソッドは、イベントをディスパッチせずにモデルを作成するために使用できます。

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
`findOrNew`、`firstOrNew`、`firstOrCreate`、`updateOrCreate` メソッドを使用して、リレーション上のモデルを[create and update models on relationships](/docs/13.x/eloquent#upserts)することもできます。

> [!NOTE]
> `create` メソッドを使用する前に、[mass assignment](/docs/13.x/eloquent#mass-assignment) のドキュメントを必ず確認してください。

<a name="updating-belongs-to-relationships"></a>
<!-- ### Belongs To Relationships -->
### Belongs To Relationships

<!-- If you would like to assign a child model to a new parent model, you may use the `associate` method. In this example, the `User` model defines a `belongsTo` relationship to the `Account` model. This `associate` method will set the foreign key on the child model: -->
子モデルを新しい親モデルに割り当てたい場合は、`associate` メソッドを使用できます。この例では、`User` モデルは、`Account` モデルに対する `belongsTo` 関係を定義します。この `associate` メソッドは、子モデルに外部キーを設定します。

```php
use App\Models\Account;

$account = Account::find(10);

$user->account()->associate($account);

$user->save();
```

<!-- To remove a parent model from a child model, you may use the `dissociate` method. This method will set the relationship's foreign key to `null`: -->
子モデルから親モデルを削除するには、`dissociate` メソッドを使用できます。このメソッドは、リレーションシップの外部キーを `null` に設定します。

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
Eloquent は、多対多の関係の操作をより便利にするメソッドも提供します。たとえば、1 人のユーザーが多数のロールを持つことができ、1 つのロールが多数のユーザーを持つことができると考えてみましょう。 `attach` メソッドを使用して、関係の中間テーブルにレコードを挿入することでユーザーにロールをアタッチできます。

```php
use App\Models\User;

$user = User::find(1);

$user->roles()->attach($roleId);
```

<!-- When attaching a relationship to a model, you may also pass an array of additional data to be inserted into the intermediate table: -->
リレーションシップをモデルにアタッチするときに、中間テーブルに挿入する追加データの配列を渡すこともできます。

```php
$user->roles()->attach($roleId, ['expires' => $expires]);
```

<!-- Sometimes it may be necessary to remove a role from a user. To remove a many-to-many relationship record, use the `detach` method. The `detach` method will delete the appropriate record out of the intermediate table; however, both models will remain in the database: -->
場合によっては、ユーザーから役割を削除することが必要になる場合があります。多対多の関係レコードを削除するには、`detach` メソッドを使用します。 `detach` メソッドは、中間テーブルから適切なレコードを削除します。ただし、両方のモデルがデータベースに残ります。

```php
// Detach a single role from the user...
$user->roles()->detach($roleId);

// Detach all roles from the user...
$user->roles()->detach();
```

<!-- For convenience, `attach` and `detach` also accept arrays of IDs as input: -->
便宜上、`attach` と `detach` は入力として ID の配列も受け入れます。

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
`sync` メソッドを使用して多対多の関連付けを構築することもできます。 `sync` メソッドは、中間テーブルに配置する ID の配列を受け入れます。指定された配列にない ID は中間テーブルから削除されます。したがって、この操作が完了すると、指定された配列内の ID のみが中間テーブルに存在します。

```php
$user->roles()->sync([1, 2, 3]);
```

<!-- You may also pass additional intermediate table values with the IDs: -->
ID とともに追加の中間テーブル値を渡すこともできます。

```php
$user->roles()->sync([1 => ['expires' => true], 2, 3]);
```

<!-- If you would like to insert the same intermediate table values with each of the synced model IDs, you may use the `syncWithPivotValues` method: -->
同期されたモデル ID のそれぞれに同じ中間テーブル値を挿入したい場合は、`syncWithPivotValues` メソッドを使用できます。

```php
$user->roles()->syncWithPivotValues([1, 2, 3], ['active' => true]);
```

<!-- If you do not want to detach existing IDs that are missing from the given array, you may use the `syncWithoutDetaching` method: -->
指定された配列から欠落している既存の ID を切り離したくない場合は、`syncWithoutDetaching` メソッドを使用できます。

```php
$user->roles()->syncWithoutDetaching([1, 2, 3]);
```

<a name="toggling-associations"></a>
<!-- #### Toggling Associations -->
#### Toggling Associations

<!-- The many-to-many relationship also provides a `toggle` method which "toggles" the attachment status of the given related model IDs. If the given ID is currently attached, it will be detached. Likewise, if it is currently detached, it will be attached: -->
多対多の関係では、指定された関連モデル ID の接続ステータスを「切り替える」`toggle` メソッドも提供されます。指定された ID が現在アタッチされている場合は、デタッチされます。同様に、現在デタッチされている場合は、アタッチされます。

```php
$user->roles()->toggle([1, 2, 3]);
```

<!-- You may also pass additional intermediate table values with the IDs: -->
ID とともに追加の中間テーブル値を渡すこともできます。

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
上で説明した各ピボット操作には、操作をデータベース トランザクション内にラップする `OrFail` バリアント (`attachOrFail`、`detachOrFail`、`syncOrFail`、`syncWithoutDetachingOrFail`、および `toggleOrFail`) もあり、例外がスローされた場合にすべての変更が自動的にロールバックされます。

```php
$user->roles()->attachOrFail([1, 2, 3]);

$user->roles()->syncOrFail([1, 2, 3]);
```

<a name="updating-a-record-on-the-intermediate-table"></a>
<!-- #### Updating a Record on the Intermediate Table -->
#### Updating a Record on the Intermediate Table

<!-- If you need to update an existing row in your relationship's intermediate table, you may use the `updateExistingPivot` method. This method accepts the intermediate record foreign key and an array of attributes to update: -->
リレーションシップの中間テーブル内の既存の行を更新する必要がある場合は、`updateExistingPivot` メソッドを使用できます。このメソッドは、中間レコードの外部キーと更新する属性の配列を受け取ります。

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
モデルが、`Post` に属する `Comment` など、別のモデルとの `belongsTo` または `belongsToMany` 関係を定義する場合、子モデルが更新されるときに親のタイムスタンプを更新すると役立つ場合があります。

<!-- For example, when a `Comment` model is updated, you may want to automatically "touch" the `updated_at` timestamp of the owning `Post` so that it is set to the current date and time. To accomplish this, you may use the `Touches` attribute on your child model containing the names of the relationships that should have their `updated_at` timestamps updated when the child model is updated: -->
たとえば、`Comment` モデルが更新されるとき、所有する `Post` の `updated_at` タイムスタンプを自動的に「タッチ」して、現在の日付と時刻に設定することができます。これを実現するには、子モデルの更新時に `updated_at` タイムスタンプを更新する必要があるリレーションシップの名前を含む子モデルの `Touches` 属性を使用できます。

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
> 子モデルを Eloquent の `save` メソッドで更新した場合にのみ、親モデルのタイムスタンプも更新されます。
