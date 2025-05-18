# Eloquent: 컬렉션 (Eloquent: Collections)

- [소개](#introduction)
- [사용 가능한 메서드](#available-methods)
- [커스텀 컬렉션](#custom-collections)

<a name="introduction"></a>
## 소개

여러 개의 모델을 반환하는 모든 Eloquent 메서드는 `Illuminate\Database\Eloquent\Collection` 클래스의 인스턴스를 반환합니다. 예를 들어, `get` 메서드로 결과를 조회하거나, 연관관계를 통해 접근하는 경우가 여기에 해당합니다. Eloquent 컬렉션 객체는 라라벨의 [기본 컬렉션](/docs/10.x/collections)을 확장하므로, Eloquent 모델의 배열을 다루기 위해 편리하게 사용할 수 있는 다양한 메서드를 자연스럽게 상속받습니다. 유용한 메서드에 대해 더 알아보고 싶다면 라라벨 컬렉션 문서도 꼭 확인해보시기 바랍니다!

모든 컬렉션은 반복자(iterator)의 역할도 하므로, 일반 PHP 배열처럼 루프를 돌며 각각의 요소에 순회할 수 있습니다.

```
use App\Models\User;

$users = User::where('active', 1)->get();

foreach ($users as $user) {
    echo $user->name;
}
```

하지만 앞서 언급한 것처럼, 컬렉션은 단순 배열보다 훨씬 강력해서, map/reduce와 같은 다양한 연산을 직관적인 인터페이스로 연속해서(체이닝) 사용할 수 있습니다. 예를 들어, 비활성화된(활성 상태가 아닌) 모든 모델을 제거한 뒤, 남아있는 각 사용자의 이름만 추출할 수 있습니다.

```
$names = User::all()->reject(function (User $user) {
    return $user->active === false;
})->map(function (User $user) {
    return $user->name;
});
```

<a name="eloquent-collection-conversion"></a>
#### Eloquent 컬렉션의 변환

대부분의 Eloquent 컬렉션 메서드는 새로운 Eloquent 컬렉션 인스턴스를 반환하지만, `collapse`, `flatten`, `flip`, `keys`, `pluck`, `zip` 메서드는 [기본 컬렉션](/docs/10.x/collections) 인스턴스를 반환합니다. 마찬가지로, `map` 연산을 사용했을 때 반환된 컬렉션에 Eloquent 모델이 하나도 없다면, 자동으로 기본 컬렉션 인스턴스로 변환됩니다.

<a name="available-methods"></a>
## 사용 가능한 메서드

모든 Eloquent 컬렉션은 기본 [라라벨 컬렉션](/docs/10.x/collections#available-methods) 객체를 확장하므로, 기본 컬렉션 클래스에서 제공하는 강력한 메서드를 모두 그대로 사용할 수 있습니다.

뿐만 아니라, `Illuminate\Database\Eloquent\Collection` 클래스는 모델 컬렉션을 관리하는 데 도움이 되는 추가적인 다양한 메서드도 제공합니다. 대부분의 메서드는 `Illuminate\Database\Eloquent\Collection` 인스턴스를 반환하지만, `modelKeys`처럼 몇몇 메서드는 `Illuminate\Support\Collection` 인스턴스를 반환하기도 합니다.



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

`append` 메서드는 컬렉션 내의 모든 모델에 대해 [속성을 추가로 포함](/docs/10.x/eloquent-serialization#appending-values-to-json)할 때 사용할 수 있습니다. 이 메서드는 속성(attribute) 하나 또는 속성 배열을 인수로 받습니다.

```
$users->append('team');

$users->append(['team', 'is_admin']);
```

<a name="method-contains"></a>
#### `contains($key, $operator = null, $value = null)`

`contains` 메서드는 컬렉션에 특정 모델 인스턴스가 포함되어 있는지 여부를 확인합니다. 이 메서드는 기본키 또는 모델 인스턴스를 인수로 받을 수 있습니다.

```
$users->contains(1);

$users->contains(User::find(1));
```

<a name="method-diff"></a>
#### `diff($items)`

`diff` 메서드는 전달된 컬렉션에 포함되어 있지 않은 모든 모델을 반환합니다.

```
use App\Models\User;

$users = $users->diff(User::whereIn('id', [1, 2, 3])->get());
```

<a name="method-except"></a>
#### `except($keys)`

`except` 메서드는 전달된 기본키 값들을 가진 모델을 제외한 모든 모델을 반환합니다.

```
$users = $users->except([1, 2, 3]);
```

<a name="method-find"></a>
#### `find($key)`

`find` 메서드는 매개변수로 전달된 기본키와 일치하는 모델을 반환합니다. 만약 `$key` 값이 모델 인스턴스라면, `find`는 해당 인스턴스의 기본키와 일치하는 모델을 반환합니다. `$key`가 키 배열이면, 해당 배열에 포함된 기본키를 가진 모든 모델을 반환합니다.

```
$users = User::all();

$user = $users->find(1);
```

<a name="method-fresh"></a>
#### `fresh($with = [])`

`fresh` 메서드는 컬렉션의 각 모델을 데이터베이스로부터 새롭게 조회합니다. 추가로, 지정한 연관관계도 함께 eager load 할 수 있습니다.

```
$users = $users->fresh();

$users = $users->fresh('comments');
```

<a name="method-intersect"></a>
#### `intersect($items)`

`intersect` 메서드는 전달된 컬렉션에 모두 포함된 모델만을 반환합니다.

```
use App\Models\User;

$users = $users->intersect(User::whereIn('id', [1, 2, 3])->get());
```

<a name="method-load"></a>
#### `load($relations)`

`load` 메서드는 컬렉션 내의 모든 모델에 대해 지정한 연관관계를 eager load(즉시 로드)합니다.

```
$users->load(['comments', 'posts']);

$users->load('comments.author');

$users->load(['comments', 'posts' => fn ($query) => $query->where('active', 1)]);
```

<a name="method-loadMissing"></a>
#### `loadMissing($relations)`

`loadMissing` 메서드는 아직 로드되지 않은 경우에 한해서, 컬렉션 내의 모든 모델에 대해 지정한 연관관계를 eager load합니다.

```
$users->loadMissing(['comments', 'posts']);

$users->loadMissing('comments.author');

$users->loadMissing(['comments', 'posts' => fn ($query) => $query->where('active', 1)]);
```

<a name="method-modelKeys"></a>
#### `modelKeys()`

`modelKeys` 메서드는 컬렉션 내 모든 모델의 기본키만을 배열로 반환합니다.

```
$users->modelKeys();

// [1, 2, 3, 4, 5]
```

<a name="method-makeVisible"></a>
#### `makeVisible($attributes)`

`makeVisible` 메서드는 일반적으로 "숨김" 처리되어 있던 속성을 [보이도록 설정](/docs/10.x/eloquent-serialization#hiding-attributes-from-json)해줍니다.

```
$users = $users->makeVisible(['address', 'phone_number']);
```

<a name="method-makeHidden"></a>
#### `makeHidden($attributes)`

`makeHidden` 메서드는 일반적으로 "보임" 처리되어 있던 속성을 [숨김 처리](/docs/10.x/eloquent-serialization#hiding-attributes-from-json)합니다.

```
$users = $users->makeHidden(['address', 'phone_number']);
```

<a name="method-only"></a>
#### `only($keys)`

`only` 메서드는 전달된 기본키 값을 가진 모델만을 모두 반환합니다.

```
$users = $users->only([1, 2, 3]);
```

<a name="method-setVisible"></a>
#### `setVisible($attributes)`

`setVisible` 메서드는 각 모델의 보이는 속성 목록을 [일시적으로 재정의](/docs/10.x/eloquent-serialization#temporarily-modifying-attribute-visibility)합니다.

```
$users = $users->setVisible(['id', 'name']);
```

<a name="method-setHidden"></a>
#### `setHidden($attributes)`

`setHidden` 메서드는 각 모델의 숨겨져 있는 속성 목록을 [일시적으로 재정의](/docs/10.x/eloquent-serialization#temporarily-modifying-attribute-visibility)합니다.

```
$users = $users->setHidden(['email', 'password', 'remember_token']);
```

<a name="method-toquery"></a>
#### `toQuery()`

`toQuery` 메서드는 컬렉션에 포함된 모델들의 기본키를 기준으로 `whereIn` 조건을 가진 Eloquent 쿼리 빌더 인스턴스를 반환합니다.

```
use App\Models\User;

$users = User::where('status', 'VIP')->get();

$users->toQuery()->update([
    'status' => 'Administrator',
]);
```

<a name="method-unique"></a>
#### `unique($key = null, $strict = false)`

`unique` 메서드는 컬렉션 내에서 중복된 모델(같은 타입의 모델이면서 기본키가 동일한 경우)을 제거하고, 유일한 모델만을 반환합니다.

```
$users = $users->unique();
```

<a name="custom-collections"></a>
## 커스텀 컬렉션

특정 모델에서 사용되는 컬렉션 객체를 커스텀 컬렉션으로 바꾸고 싶다면, 모델 클래스에 `newCollection` 메서드를 정의하면 됩니다.

```
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

`newCollection` 메서드를 정의하면, Eloquent가 일반적으로 `Illuminate\Database\Eloquent\Collection`을 반환하는 모든 곳에서 이제 여러분이 만든 커스텀 컬렉션 객체를 반환받을 수 있습니다. 만약 애플리케이션의 모든 모델에 대해 커스텀 컬렉션을 사용하고 싶다면, 모든 모델들이 확장하는 베이스 모델 클래스에 `newCollection` 메서드를 정의하면 됩니다.

