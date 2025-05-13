# 엘로퀀트: 컬렉션 (Eloquent: Collections)

- [소개](#introduction)
- [사용 가능한 메서드](#available-methods)
- [커스텀 컬렉션](#custom-collections)

<a name="introduction"></a>
## 소개

한 번에 둘 이상의 모델을 반환하는 모든 엘로퀀트(Eloquent) 메서드는 `Illuminate\Database\Eloquent\Collection` 클래스의 인스턴스를 반환합니다. 여기에는 `get` 메서드로 조회하거나, 관계(relationship)를 통해 접근한 결과 등이 포함됩니다. 엘로퀀트 컬렉션 객체는 라라벨의 [기본 컬렉션](/docs/collections)을 확장하기 때문에, 기본 컬렉션 클래스가 제공하는 여러 가지 편리한 메서드들을 그대로 사용할 수 있습니다. 유용한 메서드들에 대해 알아보려면 라라벨 컬렉션 문서도 꼭 참고해 주세요!

컬렉션은 반복자(iterator)로 동작하므로, 마치 PHP 배열처럼 반복문으로 순회할 수 있습니다:

```php
use App\Models\User;

$users = User::where('active', 1)->get();

foreach ($users as $user) {
    echo $user->name;
}
```

하지만 앞서 언급했듯이, 컬렉션은 배열보다 훨씬 강력하며, 다양한 map / reduce 연산을 직관적인 인터페이스로 이어서 사용할 수 있습니다. 예를 들어, 비활성화된 모델을 모두 제거한 뒤 남은 사용자의 이름만 모으는 작업을 할 수 있습니다:

```php
$names = User::all()->reject(function (User $user) {
    return $user->active === false;
})->map(function (User $user) {
    return $user->name;
});
```

<a name="eloquent-collection-conversion"></a>
#### 엘로퀀트 컬렉션 변환

대부분의 엘로퀀트 컬렉션 메서드는 새로운 엘로퀀트 컬렉션 인스턴스를 반환합니다. 하지만 `collapse`, `flatten`, `flip`, `keys`, `pluck`, `zip` 메서드는 [기본 컬렉션](/docs/collections) 인스턴스를 반환합니다. 마찬가지로, `map` 연산 결과가 엘로퀀트 모델을 전혀 포함하지 않는 컬렉션일 경우 기본 컬렉션 인스턴스로 변환됩니다.

<a name="available-methods"></a>
## 사용 가능한 메서드

모든 엘로퀀트 컬렉션은 [라라벨 기본 컬렉션](/docs/collections#available-methods) 객체를 확장하므로, 기본 컬렉션 클래스가 제공하는 강력한 메서드들을 모두 그대로 사용할 수 있습니다.

추가로, `Illuminate\Database\Eloquent\Collection` 클래스는 모델 컬렉션을 더욱 쉽게 관리할 수 있도록 여러 메서드를 제공합니다. 대부분의 메서드는 `Illuminate\Database\Eloquent\Collection` 인스턴스를 반환하지만, `modelKeys`와 같은 일부 메서드는 `Illuminate\Support\Collection` 인스턴스를 반환합니다.



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

`append` 메서드는 컬렉션의 모든 모델에 대해 [속성(attribute)를 추가](/docs/eloquent-serialization#appending-values-to-json)할 수 있도록 해줍니다. 이 메서드는 속성의 배열이나 단일 속성을 인수로 받을 수 있습니다:

```php
$users->append('team');

$users->append(['team', 'is_admin']);
```

<a name="method-contains"></a>
#### `contains($key, $operator = null, $value = null)`

`contains` 메서드는 컬렉션에 특정 모델 인스턴스가 포함되어 있는지 확인할 때 사용합니다. 이 메서드는 기본 키(primary key)나 모델 인스턴스를 인수로 받을 수 있습니다:

```php
$users->contains(1);

$users->contains(User::find(1));
```

<a name="method-diff"></a>
#### `diff($items)`

`diff` 메서드는 전달한 컬렉션에 없는 모델만 모두 반환합니다:

```php
use App\Models\User;

$users = $users->diff(User::whereIn('id', [1, 2, 3])->get());
```

<a name="method-except"></a>
#### `except($keys)`

`except` 메서드는 특정 기본 키를 가진 모델을 제외한 나머지 모델들을 반환합니다:

```php
$users = $users->except([1, 2, 3]);
```

<a name="method-find"></a>
#### `find($key)`

`find` 메서드는 전달한 기본 키와 일치하는 모델을 반환합니다. `$key`가 모델 인스턴스인 경우에는 해당 인스턴스와 같은 기본 키를 가진 모델을 반환하려고 시도합니다. `$key`가 키의 배열이라면 해당 기본 키를 가진 모든 모델을 반환합니다:

```php
$users = User::all();

$user = $users->find(1);
```

<a name="method-find-or-fail"></a>
#### `findOrFail($key)`

`findOrFail` 메서드는 전달한 기본 키와 일치하는 모델을 반환하거나, 일치하는 모델이 없으면 `Illuminate\Database\Eloquent\ModelNotFoundException` 예외를 발생시킵니다:

```php
$users = User::all();

$user = $users->findOrFail(1);
```

<a name="method-fresh"></a>
#### `fresh($with = [])`

`fresh` 메서드는 컬렉션에 있는 각 모델의 새 인스턴스를 데이터베이스에서 다시 조회합니다. 추가로, 지정한 관계도 함께 eager loading 할 수 있습니다:

```php
$users = $users->fresh();

$users = $users->fresh('comments');
```

<a name="method-intersect"></a>
#### `intersect($items)`

`intersect` 메서드는 전달한 컬렉션에도 존재하는 모델만 모두 반환합니다:

```php
use App\Models\User;

$users = $users->intersect(User::whereIn('id', [1, 2, 3])->get());
```

<a name="method-load"></a>
#### `load($relations)`

`load` 메서드는 컬렉션 내 모든 모델에 대해 지정한 관계를 eager loading(즉시 로딩)합니다:

```php
$users->load(['comments', 'posts']);

$users->load('comments.author');

$users->load(['comments', 'posts' => fn ($query) => $query->where('active', 1)]);
```

<a name="method-loadMissing"></a>
#### `loadMissing($relations)`

`loadMissing` 메서드는 컬렉션의 각 모델에 대해, 아직 로드하지 않은 관계만 eager loading합니다:

```php
$users->loadMissing(['comments', 'posts']);

$users->loadMissing('comments.author');

$users->loadMissing(['comments', 'posts' => fn ($query) => $query->where('active', 1)]);
```

<a name="method-modelKeys"></a>
#### `modelKeys()`

`modelKeys` 메서드는 컬렉션 내 모든 모델의 기본 키(primary key) 값을 배열로 반환합니다:

```php
$users->modelKeys();

// [1, 2, 3, 4, 5]
```

<a name="method-makeVisible"></a>
#### `makeVisible($attributes)`

`makeVisible` 메서드는 컬렉션의 각 모델에서 보통 "숨겨진(hidden)" 상태인 [속성들을 표시](/docs/eloquent-serialization#hiding-attributes-from-json)하도록 만듭니다:

```php
$users = $users->makeVisible(['address', 'phone_number']);
```

<a name="method-makeHidden"></a>
#### `makeHidden($attributes)`

`makeHidden` 메서드는 컬렉션의 각 모델에서 보통 "표시되는(visible)" [속성들을 숨기도록](/docs/eloquent-serialization#hiding-attributes-from-json) 변경합니다:

```php
$users = $users->makeHidden(['address', 'phone_number']);
```

<a name="method-only"></a>
#### `only($keys)`

`only` 메서드는 지정한 기본 키를 가진 모델만 반환합니다:

```php
$users = $users->only([1, 2, 3]);
```

<a name="method-partition"></a>
#### `partition`

`partition` 메서드는 `Illuminate\Support\Collection`의 인스턴스를 반환하며, 이 컬렉션에는 `Illuminate\Database\Eloquent\Collection` 인스턴스들이 들어 있습니다:

```php
$partition = $users->partition(fn ($user) => $user->age > 18);

dump($partition::class);    // Illuminate\Support\Collection
dump($partition[0]::class); // Illuminate\Database\Eloquent\Collection
dump($partition[1]::class); // Illuminate\Database\Eloquent\Collection
```

<a name="method-setVisible"></a>
#### `setVisible($attributes)`

`setVisible` 메서드는 컬렉션에 있는 각 모델의 표시 속성을 [일시적으로 덮어씁니다](/docs/eloquent-serialization#temporarily-modifying-attribute-visibility):

```php
$users = $users->setVisible(['id', 'name']);
```

<a name="method-setHidden"></a>
#### `setHidden($attributes)`

`setHidden` 메서드는 컬렉션에 있는 각 모델의 숨김 속성을 [일시적으로 덮어씁니다](/docs/eloquent-serialization#temporarily-modifying-attribute-visibility):

```php
$users = $users->setHidden(['email', 'password', 'remember_token']);
```

<a name="method-toquery"></a>
#### `toQuery()`

`toQuery` 메서드는 컬렉션에 들어있는 모델의 기본 키 값을 기준으로 `whereIn` 조건이 걸린 엘로퀀트 쿼리 빌더 인스턴스를 반환합니다:

```php
use App\Models\User;

$users = User::where('status', 'VIP')->get();

$users->toQuery()->update([
    'status' => 'Administrator',
]);
```

<a name="method-unique"></a>
#### `unique($key = null, $strict = false)`

`unique` 메서드는 컬렉션에서 중복되지 않는(고유한) 모델만 반환합니다. 동일한 기본 키를 갖는 모델은 하나만 남고, 나머지는 제거됩니다:

```php
$users = $users->unique();
```

<a name="custom-collections"></a>
## 커스텀 컬렉션

특정 모델에서 커스텀 `Collection` 객체를 사용하고 싶다면, 해당 모델에 `CollectedBy` 속성을 추가하면 됩니다:

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

또는, 모델에 `newCollection` 메서드를 직접 정의할 수도 있습니다:

```php
<?php

namespace App\Models;

use App\Support\UserCollection;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 새로운 엘로퀀트 컬렉션 인스턴스를 생성합니다.
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

`newCollection` 메서드를 정의하거나 모델에 `CollectedBy` 속성을 추가하고 나면, Eloquent가 원래 `Illuminate\Database\Eloquent\Collection` 인스턴스를 반환하는 모든 상황에서 여러분이 만든 커스텀 컬렉션 인스턴스를 반환하게 됩니다.

애플리케이션 전체에서 모든 모델에 커스텀 컬렉션을 사용하고 싶다면, 모든 앱 모델이 상속하는 기본 모델 클래스에 `newCollection` 메서드를 정의하면 됩니다.
