# Eloquent: 컬렉션 (Eloquent: Collections)

- [소개](#introduction)
- [사용 가능한 메서드](#available-methods)
- [커스텀 컬렉션](#custom-collections)

<a name="introduction"></a>
## 소개

여러 개의 모델 결과를 반환하는 모든 Eloquent 메서드는 `Illuminate\Database\Eloquent\Collection` 클래스의 인스턴스를 반환합니다. 이는 `get` 메서드를 사용하거나, 연관관계를 통해 데이터를 가져올 때도 마찬가지입니다. Eloquent 컬렉션 객체는 라라벨의 [기본 컬렉션](/docs/9.x/collections)을 확장하여, Eloquent 모델 배열을 쉽게 다룰 수 있도록 다양한 메서드를 자연스럽게 상속받습니다. 유용한 컬렉션 메서드에 대해 더 잘 이해하고 싶으시다면 라라벨 컬렉션 문서를 꼭 읽어보시기 바랍니다.

모든 컬렉션은 이터레이터(Iterator) 역할도 하므로, 일반 PHP 배열처럼 반복문을 사용하여 순회할 수 있습니다.

```
use App\Models\User;

$users = User::where('active', 1)->get();

foreach ($users as $user) {
    echo $user->name;
}
```

하지만 앞서 언급했듯, 컬렉션은 배열보다 훨씬 강력합니다. 컬렉션은 map이나 reduce와 같은 다양한 연산을 직관적인 인터페이스로 체이닝하여 사용할 수 있습니다. 예를 들어, 비활성화된 모델을 모두 제외한 후 남은 사용자 각각의 이름만 뽑아낼 수도 있습니다.

```
$names = User::all()->reject(function ($user) {
    return $user->active === false;
})->map(function ($user) {
    return $user->name;
});
```

<a name="eloquent-collection-conversion"></a>
#### Eloquent 컬렉션 변환

대부분의 Eloquent 컬렉션 메서드는 새로운 Eloquent 컬렉션 인스턴스를 반환하지만, `collapse`, `flatten`, `flip`, `keys`, `pluck`, `zip` 메서드는 [기본 컬렉션](/docs/9.x/collections) 인스턴스를 반환합니다. 마찬가지로, 만약 `map` 작업 결과가 Eloquent 모델을 포함하지 않는 컬렉션이면, 해당 결과는 기본 컬렉션 인스턴스로 변환됩니다.

<a name="available-methods"></a>
## 사용 가능한 메서드

모든 Eloquent 컬렉션은 기본 [라라벨 컬렉션](/docs/9.x/collections#available-methods) 객체를 확장하므로, 기본 컬렉션 클래스에서 제공하는 강력한 메서드를 모두 사용할 수 있습니다.

추가로, `Illuminate\Database\Eloquent\Collection` 클래스는 모델 컬렉션 관리에 도움이 될 수 있도록 몇 가지 추가 메서드를 제공합니다. 대부분의 메서드는 `Illuminate\Database\Eloquent\Collection` 인스턴스를 반환하지만, `modelKeys`와 같은 일부 메서드는 `Illuminate\Support\Collection` 인스턴스를 반환합니다.



<div class="collection-method-list" markdown="1">

[append](#method-append)
[contains](#method-contains)
[diff](#method-diff)
[except](#method-except)
[find](#method-find)
[fresh](#method-fresh)
[intersect](#method-intersect)
[load](#method-load)
[loadMissing](#method-loadMissing)
[modelKeys](#method-modelKeys)
[makeVisible](#method-makeVisible)
[makeHidden](#method-makeHidden)
[only](#method-only)
[setVisible](#method-setVisible)
[setHidden](#method-setHidden)
[toQuery](#method-toquery)
[unique](#method-unique)

</div>

<a name="method-append"></a>
#### `append($attributes)`

`append` 메서드는 컬렉션의 각 모델에 [속성을 추가로 포함](/docs/9.x/eloquent-serialization#appending-values-to-json)시킵니다. 이 메서드는 속성의 배열 또는 단일 속성을 인수로 받을 수 있습니다.

```
$users->append('team');

$users->append(['team', 'is_admin']);
```

<a name="method-contains"></a>
#### `contains($key, $operator = null, $value = null)`

`contains` 메서드는 지정한 모델 인스턴스가 컬렉션에 포함되어 있는지 확인할 수 있습니다. 이 메서드는 기본 키 또는 모델 인스턴스를 인수로 받을 수 있습니다.

```
$users->contains(1);

$users->contains(User::find(1));
```

<a name="method-diff"></a>
#### `diff($items)`

`diff` 메서드는 지정된 컬렉션에 포함되지 않은 모든 모델만 반환합니다.

```
use App\Models\User;

$users = $users->diff(User::whereIn('id', [1, 2, 3])->get());
```

<a name="method-except"></a>
#### `except($keys)`

`except` 메서드는 지정한 기본 키를 가지지 않은 모든 모델만 반환합니다.

```
$users = $users->except([1, 2, 3]);
```

<a name="method-find"></a>
#### `find($key)`

`find` 메서드는 주어진 키와 일치하는 기본 키를 가진 모델을 반환합니다. `$key`가 모델 인스턴스라면, 해당 모델의 기본 키와 일치하는 모델을 찾으려고 시도합니다. `$key`가 여러 키로 이루어진 배열이면, 해당 배열에 포함된 기본 키를 가진 모든 모델을 반환합니다.

```
$users = User::all();

$user = $users->find(1);
```

<a name="method-fresh"></a>
#### `fresh($with = [])`

`fresh` 메서드는 컬렉션의 각 모델에 대해 데이터베이스에서 새롭게 인스턴스를 가져옵니다. 추가로 특정 연관관계를 eager load 할 수도 있습니다.

```
$users = $users->fresh();

$users = $users->fresh('comments');
```

<a name="method-intersect"></a>
#### `intersect($items)`

`intersect` 메서드는 주어진 컬렉션에도 포함되어 있는 모든 모델만 반환합니다.

```
use App\Models\User;

$users = $users->intersect(User::whereIn('id', [1, 2, 3])->get());
```

<a name="method-load"></a>
#### `load($relations)`

`load` 메서드는 컬렉션에 포함된 모든 모델에 대해 지정한 연관관계를 eager load합니다.

```
$users->load(['comments', 'posts']);

$users->load('comments.author');

$users->load(['comments', 'posts' => fn ($query) => $query->where('active', 1)]);
```

<a name="method-loadMissing"></a>
#### `loadMissing($relations)`

`loadMissing` 메서드는 컬렉션에 포함된 모든 모델에 대해 아직 로드되지 않은 연관관계만 eager load합니다.

```
$users->loadMissing(['comments', 'posts']);

$users->loadMissing('comments.author');

$users->loadMissing(['comments', 'posts' => fn ($query) => $query->where('active', 1)]);
```

<a name="method-modelKeys"></a>
#### `modelKeys()`

`modelKeys` 메서드는 컬렉션에 포함된 모든 모델의 기본 키 목록을 반환합니다.

```
$users->modelKeys();

// [1, 2, 3, 4, 5]
```

<a name="method-makeVisible"></a>
#### `makeVisible($attributes)`

`makeVisible` 메서드는 컬렉션의 각 모델에서 기본적으로 "숨겨져 있는" 속성들을 [보이게 만듭니다](/docs/9.x/eloquent-serialization#hiding-attributes-from-json).

```
$users = $users->makeVisible(['address', 'phone_number']);
```

<a name="method-makeHidden"></a>
#### `makeHidden($attributes)`

`makeHidden` 메서드는 컬렉션의 각 모델에서 기본적으로 "보이는" 속성들을 [숨깁니다](/docs/9.x/eloquent-serialization#hiding-attributes-from-json).

```
$users = $users->makeHidden(['address', 'phone_number']);
```

<a name="method-only"></a>
#### `only($keys)`

`only` 메서드는 지정된 기본 키를 가진 모델들만 모두 반환합니다.

```
$users = $users->only([1, 2, 3]);
```

<a name="method-setVisible"></a>
#### `setVisible($attributes)`

`setVisible` 메서드는 컬렉션의 각 모델에 대해 표시할 속성을 [일시적으로 재정의](/docs/9.x/eloquent-serialization#temporarily-modifying-attribute-visibility)합니다.

```
$users = $users->setVisible(['id', 'name']);
```

<a name="method-setHidden"></a>
#### `setHidden($attributes)`

`setHidden` 메서드는 컬렉션의 각 모델에 대해 숨길 속성을 [일시적으로 재정의](/docs/9.x/eloquent-serialization#temporarily-modifying-attribute-visibility)합니다.

```
$users = $users->setHidden(['email', 'password', 'remember_token']);
```

<a name="method-toquery"></a>
#### `toQuery()`

`toQuery` 메서드는 컬렉션에 포함된 모델의 기본 키에 `whereIn` 조건을 추가한 Eloquent 쿼리 빌더 인스턴스를 반환합니다.

```
use App\Models\User;

$users = User::where('status', 'VIP')->get();

$users->toQuery()->update([
    'status' => 'Administrator',
]);
```

<a name="method-unique"></a>
#### `unique($key = null, $strict = false)`

`unique` 메서드는 컬렉션에서 고유한 모델만 반환합니다. 같은 타입에 같은 기본 키를 가진 모델이 여러 개 있다면, 중복되는 항목은 제거됩니다.

```
$users = $users->unique();
```

<a name="custom-collections"></a>
## 커스텀 컬렉션

특정 모델과 작업할 때 사용자 정의 `Collection` 객체를 사용하고 싶다면, 해당 모델에 `newCollection` 메서드를 정의할 수 있습니다.

```
<?php

namespace App\Models;

use App\Support\UserCollection;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 새로운 Eloquent Collection 인스턴스를 생성합니다.
     *
     * @param  array  $models
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function newCollection(array $models = [])
    {
        return new UserCollection($models);
    }
}
```

`newCollection` 메서드를 정의하면, Eloquent가 일반적으로 `Illuminate\Database\Eloquent\Collection` 인스턴스를 반환하는 모든 상황에서 여러분이 정의한 커스텀 컬렉션 인스턴스를 반환하게 됩니다. 만약 애플리케이션의 모든 모델에 대해 커스텀 컬렉션을 사용하고 싶다면, 모든 모델의 부모 역할을 하는 기반 모델 클래스에 `newCollection` 메서드를 정의하면 됩니다.
