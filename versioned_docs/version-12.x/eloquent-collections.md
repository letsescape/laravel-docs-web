# Eloquent: 컬렉션 (Eloquent: Collections)

- [소개](#introduction)
- [사용 가능한 메서드](#available-methods)
- [커스텀 컬렉션](#custom-collections)

<a name="introduction"></a>
## 소개

여러 개의 모델이 반환되는 모든 Eloquent 메서드는 `Illuminate\Database\Eloquent\Collection` 클래스의 인스턴스를 반환합니다. 이는 `get` 메서드로 데이터를 조회하거나, 모델 간 연관관계를 통해 접근할 때도 마찬가지입니다. Eloquent 컬렉션 객체는 라라벨의 [기본 컬렉션](/docs/12.x/collections)을 확장하므로, Eloquent 모델 배열을 더욱 유연하게 다룰 수 있도록 수십 가지의 메서드를 자연스럽게 사용할 수 있습니다. 유용한 컬렉션 메서드를 모두 익히려면 라라벨 컬렉션 공식 문서를 꼭 참고하시기 바랍니다!

컬렉션은 반복 가능한(이터러블) 객체이기 때문에, 일반 PHP 배열처럼 `foreach` 구문으로 쉽게 순회할 수 있습니다.

```php
use App\Models\User;

$users = User::where('active', 1)->get();

foreach ($users as $user) {
    echo $user->name;
}
```

하지만 앞서 언급했듯이, 컬렉션은 단순한 배열보다 훨씬 강력한 기능을 제공합니다. 다양한 map/reduce 연산을 직관적인 방식으로 이어서 사용할 수 있습니다. 예를 들어, 비활성화된 모델을 모두 걸러내고, 남아있는 각 사용자의 이름만 수집할 수도 있습니다.

```php
$names = User::all()->reject(function (User $user) {
    return $user->active === false;
})->map(function (User $user) {
    return $user->name;
});
```

<a name="eloquent-collection-conversion"></a>
#### Eloquent 컬렉션의 변환

대부분의 Eloquent 컬렉션 메서드는 새로운 Eloquent 컬렉션 인스턴스를 반환하지만, `collapse`, `flatten`, `flip`, `keys`, `pluck`, `zip` 메서드는 [기본 컬렉션](/docs/12.x/collections) 인스턴스를 반환합니다. 마찬가지로, `map` 연산의 결과가 Eloquent 모델을 전혀 포함하지 않을 경우에도 기본 컬렉션 인스턴스로 변환됩니다.

<a name="available-methods"></a>
## 사용 가능한 메서드

모든 Eloquent 컬렉션은 기본 [라라벨 컬렉션](/docs/12.x/collections#available-methods) 객체를 확장합니다. 따라서, 기본 컬렉션 클래스에서 제공하는 강력한 메서드들을 그대로 사용할 수 있습니다.

추가로, `Illuminate\Database\Eloquent\Collection` 클래스는 모델 컬렉션을 관리하기 위한 확장된 메서드 집합을 제공합니다. 대부분의 메서드는 `Illuminate\Database\Eloquent\Collection` 인스턴스를 반환하지만, `modelKeys`와 같은 일부 메서드는 `Illuminate\Support\Collection` 인스턴스를 반환합니다.



<div class="collection-method-list" markdown="1">

[append](#method-append)
[contains](#method-contains)
[diff](#method-diff)
[except](#method-except)
[find](#method-find)
[findOrFail](#method-find-or-fail)
[fresh](#method-fresh)
[intersect](#method-intersect)
[load](#method-load)
[loadMissing](#method-loadMissing)
[modelKeys](#method-modelKeys)
[makeVisible](#method-makeVisible)
[makeHidden](#method-makeHidden)
[only](#method-only)
[partition](#method-partition)
[setVisible](#method-setVisible)
[setHidden](#method-setHidden)
[toQuery](#method-toquery)
[unique](#method-unique)

</div>

<a name="method-append"></a>
#### `append($attributes)`

`append` 메서드는 컬렉션 내 모든 모델에 대해 [지정한 속성(attribute)을 추가적으로 포함](/docs/12.x/eloquent-serialization#appending-values-to-json)하고 싶을 때 사용합니다. 이 메서드는 속성 이름 하나 또는 여러 개의 배열을 인수로 받을 수 있습니다.

```php
$users->append('team');

$users->append(['team', 'is_admin']);
```

<a name="method-contains"></a>
#### `contains($key, $operator = null, $value = null)`

`contains` 메서드는 컬렉션에 특정 모델 인스턴스가 포함되어 있는지 확인할 때 사용합니다. 이때, 인수로는 기본 키 또는 모델 인스턴스를 전달할 수 있습니다.

```php
$users->contains(1);

$users->contains(User::find(1));
```

<a name="method-diff"></a>
#### `diff($items)`

`diff` 메서드는 전달한 컬렉션에 없는 모델만 반환합니다.

```php
use App\Models\User;

$users = $users->diff(User::whereIn('id', [1, 2, 3])->get());
```

<a name="method-except"></a>
#### `except($keys)`

`except` 메서드는 지정한 기본 키를 가진 모델을 컬렉션에서 제외해 반환합니다.

```php
$users = $users->except([1, 2, 3]);
```

<a name="method-find"></a>
#### `find($key)`

`find` 메서드는 전달한 기본 키에 해당하는 모델을 반환합니다. `$key`로 모델 인스턴스를 넘기면 해당 모델의 기본 키에 일치하는 모델을 반환합니다. 배열로 여러 키를 전달하면 각각에 해당하는 모든 모델을 반환합니다.

```php
$users = User::all();

$user = $users->find(1);
```

<a name="method-find-or-fail"></a>
#### `findOrFail($key)`

`findOrFail` 메서드는 지정한 기본 키에 해당하는 모델을 반환하거나, 컬렉션에서 해당 모델을 찾을 수 없는 경우 `Illuminate\Database\Eloquent\ModelNotFoundException` 예외를 발생시킵니다.

```php
$users = User::all();

$user = $users->findOrFail(1);
```

<a name="method-fresh"></a>
#### `fresh($with = [])`

`fresh` 메서드는 컬렉션에 담긴 각 모델을 데이터베이스에서 다시 새로 불러옵니다. 또한 지정한 관계(relations)가 있다면 eager 로드도 함께 수행할 수 있습니다.

```php
$users = $users->fresh();

$users = $users->fresh('comments');
```

<a name="method-intersect"></a>
#### `intersect($items)`

`intersect` 메서드는 전달한 컬렉션에도 포함되어 있는 모든 모델을 반환합니다.

```php
use App\Models\User;

$users = $users->intersect(User::whereIn('id', [1, 2, 3])->get());
```

<a name="method-load"></a>
#### `load($relations)`

`load` 메서드는 컬렉션 내 모든 모델에 대해 지정한 연관관계를 eager 로드합니다.

```php
$users->load(['comments', 'posts']);

$users->load('comments.author');

$users->load(['comments', 'posts' => fn ($query) => $query->where('active', 1)]);
```

<a name="method-loadMissing"></a>
#### `loadMissing($relations)`

`loadMissing` 메서드는 컬렉션 내 모든 모델 중 아직 로드되지 않은 연관관계를 eager 로드합니다.

```php
$users->loadMissing(['comments', 'posts']);

$users->loadMissing('comments.author');

$users->loadMissing(['comments', 'posts' => fn ($query) => $query->where('active', 1)]);
```

<a name="method-modelKeys"></a>
#### `modelKeys()`

`modelKeys` 메서드는 컬렉션 내 모든 모델의 기본 키(primary key)만 배열로 반환합니다.

```php
$users->modelKeys();

// [1, 2, 3, 4, 5]
```

<a name="method-makeVisible"></a>
#### `makeVisible($attributes)`

`makeVisible` 메서드는 컬렉션 내 각 모델에서 평소에 숨겨진(hidden) 속성을 [강제로 노출](/docs/12.x/eloquent-serialization#hiding-attributes-from-json)시키고 싶을 때 사용합니다.

```php
$users = $users->makeVisible(['address', 'phone_number']);
```

<a name="method-makeHidden"></a>
#### `makeHidden($attributes)`

`makeHidden` 메서드는 컬렉션 내 각 모델에서 평소에 보이는(visible) 속성을 [강제로 숨김](/docs/12.x/eloquent-serialization#hiding-attributes-from-json) 처리합니다.

```php
$users = $users->makeHidden(['address', 'phone_number']);
```

<a name="method-only"></a>
#### `only($keys)`

`only` 메서드는 지정한 기본 키를 가진 모델만 컬렉션에서 추려서 반환합니다.

```php
$users = $users->only([1, 2, 3]);
```

<a name="method-partition"></a>
#### `partition`

`partition` 메서드는 `Illuminate\Support\Collection` 인스턴스를 반환하며, 내부적으로는 조건에 따라 `Illuminate\Database\Eloquent\Collection` 컬렉션 두 개로 나누어집니다.

```php
$partition = $users->partition(fn ($user) => $user->age > 18);

dump($partition::class);    // Illuminate\Support\Collection
dump($partition[0]::class); // Illuminate\Database\Eloquent\Collection
dump($partition[1]::class); // Illuminate\Database\Eloquent\Collection
```

<a name="method-setVisible"></a>
#### `setVisible($attributes)`

`setVisible` 메서드는 컬렉션 내 각 모델의 노출 속성을 한시적으로 [임시로 설정](/docs/12.x/eloquent-serialization#temporarily-modifying-attribute-visibility)할 수 있습니다.

```php
$users = $users->setVisible(['id', 'name']);
```

<a name="method-setHidden"></a>
#### `setHidden($attributes)`

`setHidden` 메서드는 컬렉션 내 각 모델에 대해 숨겨질 속성을 [임시로 설정](/docs/12.x/eloquent-serialization#temporarily-modifying-attribute-visibility)합니다.

```php
$users = $users->setHidden(['email', 'password', 'remember_token']);
```

<a name="method-toquery"></a>
#### `toQuery()`

`toQuery` 메서드는 컬렉션에 포함된 모델의 기본 키를 대상으로 `whereIn` 조건이 걸린 Eloquent 쿼리 빌더 인스턴스를 반환합니다.

```php
use App\Models\User;

$users = User::where('status', 'VIP')->get();

$users->toQuery()->update([
    'status' => 'Administrator',
]);
```

<a name="method-unique"></a>
#### `unique($key = null, $strict = false)`

`unique` 메서드는 컬렉션 내에서 중복되는 기본 키를 가진 모델은 하나만 남기고, 나머지를 제거해 반환합니다.

```php
$users = $users->unique();
```

<a name="custom-collections"></a>
## 커스텀 컬렉션

특정 모델과 상호작용할 때 맞춤형 `Collection` 객체를 사용하고 싶다면, 모델에 `CollectedBy` 속성(attribute)을 추가하면 됩니다.

```php
<?php

namespace App\Models;

use App\Support\UserCollection;
use Illuminate\Database\Eloquent\Attributes\CollectedBy;
use Illuminate\Database\Eloquent\Model;

#[CollectedBy(UserCollection::class)]
class User extends Model
{
    // ...
}
```

또는, 모델에 `newCollection` 메서드를 정의해서 커스텀 컬렉션을 반환하도록 지정할 수도 있습니다.

```php
<?php

namespace App\Models;

use App\Support\UserCollection;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 새로운 Eloquent 컬렉션 인스턴스를 생성합니다.
     *
     * @param  array<int, \Illuminate\Database\Eloquent\Model>  $models
     * @return \Illuminate\Database\Eloquent\Collection<int, \Illuminate\Database\Eloquent\Model>
     */
    public function newCollection(array $models = []): Collection
    {
        return new UserCollection($models);
    }
}
```

`newCollection` 메서드 정의 또는 `CollectedBy` 속성 추가 후에는, 기존에 Eloquent가 기본적으로 `Illuminate\Database\Eloquent\Collection` 인스턴스를 반환하던 모든 곳에서 이제 커스텀 컬렉션 인스턴스를 얻게 됩니다.

만약 애플리케이션 내 모든 모델에 대해 커스텀 컬렉션을 사용하고 싶다면, 모든 모델이 상속받는 기반(base) 모델 클래스에 `newCollection` 메서드를 정의해 두면 됩니다.