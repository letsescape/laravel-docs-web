# Eloquent: 컬렉션 (Eloquent: Collections)

- [소개](#introduction)
- [사용 가능한 메서드](#available-methods)
- [커스텀 컬렉션](#custom-collections)

<a name="introduction"></a>
## 소개

여러 개의 모델 결과를 반환하는 모든 Eloquent 메서드는 `get` 메서드로 데이터를 조회할 때나, 관계를 통해 접근할 때와 같이 항상 `Illuminate\Database\Eloquent\Collection` 클래스의 인스턴스를 반환합니다. 이 Eloquent 컬렉션 객체는 라라벨의 [기본 컬렉션](/docs/8.x/collections)을 확장하고 있으므로, Eloquent 모델로 이루어진 내부 배열을 유연하게 다룰 수 있는 다양한 메서드를 그대로 사용할 수 있습니다. 이 유용한 메서드들에 대해서는 라라벨 컬렉션 공식 문서를 꼭 참고해보시기 바랍니다.

Eloquent 컬렉션도 반복자(iterator)이기 때문에, 간단한 PHP 배열처럼 컬렉션을 순회할 수도 있습니다:

```
use App\Models\User;

$users = User::where('active', 1)->get();

foreach ($users as $user) {
    echo $user->name;
}
```

하지만 앞서 언급한 것처럼, 컬렉션은 배열보다 훨씬 강력하며, 직관적인 인터페이스를 통해 다양한 map/reduce(배열 변환/축소) 연산을 체이닝 방식으로 사용할 수 있습니다. 예를 들어, 아래 예시처럼 비활성화된 모델은 모두 제외하고 남은 유저들의 이름만 모을 수도 있습니다.

```
$names = User::all()->reject(function ($user) {
    return $user->active === false;
})->map(function ($user) {
    return $user->name;
});
```

<a name="eloquent-collection-conversion"></a>
#### Eloquent 컬렉션 변환

대부분의 Eloquent 컬렉션 메서드는 새로운 Eloquent 컬렉션 인스턴스를 반환하지만, `collapse`, `flatten`, `flip`, `keys`, `pluck`, `zip` 메서드는 [기본 컬렉션](/docs/8.x/collections) 인스턴스를 반환합니다. 비슷하게, `map` 연산 결과에 Eloquent 모델이 하나도 없다면, 결과가 기본 컬렉션 인스턴스로 변환됩니다.

<a name="available-methods"></a>
## 사용 가능한 메서드

모든 Eloquent 컬렉션은 기본 [라라벨 컬렉션](/docs/8.x/collections#available-methods) 객체를 확장하므로, 기본 컬렉션 클래스에서 제공하는 강력한 메서드들을 그대로 사용할 수 있습니다.

추가로, `Illuminate\Database\Eloquent\Collection` 클래스는 모델 컬렉션을 편리하게 다룰 수 있도록 몇 가지 확장 메서드도 제공합니다. 대부분의 메서드는 `Illuminate\Database\Eloquent\Collection` 인스턴스를 반환하지만, `modelKeys`와 같은 일부 메서드는 `Illuminate\Support\Collection` 인스턴스를 반환합니다.



<div id="collection-method-list" markdown="1">

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
[toQuery](#method-toquery)
[unique](#method-unique)

</div>

<a name="method-contains"></a>
#### `contains($key, $operator = null, $value = null)`

`contains` 메서드는 컬렉션에 특정 모델 인스턴스가 포함되어 있는지 확인할 수 있습니다. 이 메서드는 기본키 또는 모델 인스턴스를 인수로 받을 수 있습니다.

```
$users->contains(1);

$users->contains(User::find(1));
```

<a name="method-diff"></a>
#### `diff($items)`

`diff` 메서드는 주어진 컬렉션에 없는 모든 모델들을 반환합니다.

```
use App\Models\User;

$users = $users->diff(User::whereIn('id', [1, 2, 3])->get());
```

<a name="method-except"></a>
#### `except($keys)`

`except` 메서드는 주어진 기본키를 가진 모델을 제외한 나머지 모델들을 반환합니다.

```
$users = $users->except([1, 2, 3]);
```

<a name="method-find"></a>
#### `find($key)`

`find` 메서드는 인자로 전달된 값과 기본키가 일치하는 모델을 반환합니다. `$key`가 모델 인스턴스라면, 내부적으로 해당 기본키와 일치하는 모델을 반환합니다. `$key`가 키 값의 배열일 경우, 해당 배열에 포함된 기본키를 가진 모델들을 모두 반환합니다.

```
$users = User::all();

$user = $users->find(1);
```

<a name="method-fresh"></a>
#### `fresh($with = [])`

`fresh` 메서드는 컬렉션에 포함된 각 모델의 최신 데이터를 데이터베이스에서 새로 조회해 반환합니다. 추가로 특정 관계도 함께 eager load 할 수 있습니다.

```
$users = $users->fresh();

$users = $users->fresh('comments');
```

<a name="method-intersect"></a>
#### `intersect($items)`

`intersect` 메서드는 주어진 컬렉션에도 존재하는 모델만 반환합니다.

```
use App\Models\User;

$users = $users->intersect(User::whereIn('id', [1, 2, 3])->get());
```

<a name="method-load"></a>
#### `load($relations)`

`load` 메서드는 컬렉션의 모든 모델에서 지정한 관계를 eager load(즉시 로드)합니다.

```
$users->load(['comments', 'posts']);

$users->load('comments.author');
```

<a name="method-loadMissing"></a>
#### `loadMissing($relations)`

`loadMissing` 메서드는 컬렉션의 모든 모델에서 지정한 관계가 아직 로드되지 않았다면 eager load 합니다.

```
$users->loadMissing(['comments', 'posts']);

$users->loadMissing('comments.author');
```

<a name="method-modelKeys"></a>
#### `modelKeys()`

`modelKeys` 메서드는 컬렉션 내 모든 모델의 기본키(Primary Key)만 배열로 반환합니다.

```
$users->modelKeys();

// [1, 2, 3, 4, 5]
```

<a name="method-makeVisible"></a>
#### `makeVisible($attributes)`

`makeVisible` 메서드는 컬렉션 내 각 모델에서 평소 "숨겨진" 상태인 [속성들을 보이도록 처리](/docs/8.x/eloquent-serialization#hiding-attributes-from-json)합니다.

```
$users = $users->makeVisible(['address', 'phone_number']);
```

<a name="method-makeHidden"></a>
#### `makeHidden($attributes)`

`makeHidden` 메서드는 컬렉션 내 각 모델에서 평소 "보이는" 상태인 [속성들을 숨기도록 처리](/docs/8.x/eloquent-serialization#hiding-attributes-from-json)합니다.

```
$users = $users->makeHidden(['address', 'phone_number']);
```

<a name="method-only"></a>
#### `only($keys)`

`only` 메서드는 전달받은 기본키를 가진 모델만을 남기고 반환합니다.

```
$users = $users->only([1, 2, 3]);
```

<a name="method-toquery"></a>
#### `toQuery()`

`toQuery` 메서드는 컬렉션에 포함된 모델들의 기본키를 기준으로 `whereIn` 조건이 적용된 Eloquent 쿼리 빌더 인스턴스를 반환합니다.

```
use App\Models\User;

$users = User::where('status', 'VIP')->get();

$users->toQuery()->update([
    'status' => 'Administrator',
]);
```

<a name="method-unique"></a>
#### `unique($key = null, $strict = false)`

`unique` 메서드는 컬렉션 내에서 중복되는 모델을 제거하고, 고유한 모델만 반환합니다. 같은 타입의 모델 중 기본키가 동일한 경우 하나만 남게 됩니다.

```
$users = $users->unique();
```

<a name="custom-collections"></a>
## 커스텀 컬렉션

특정 모델에서 커스텀 `Collection` 객체를 사용하고 싶다면, 모델 클래스 안에 `newCollection` 메서드를 정의할 수 있습니다.

```
<?php

namespace App\Models;

use App\Support\UserCollection;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 새로운 Eloquent 컬렉션 인스턴스를 생성합니다.
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

`newCollection` 메서드를 정의하면, 해당 모델에서 Eloquent가 원래 `Illuminate\Database\Eloquent\Collection`을 반환하는 모든 동작에서 이제 커스텀 컬렉션 인스턴스를 반환하게 됩니다. 만약 애플리케이션 내의 모든 모델에서 공통적으로 커스텀 컬렉션을 사용하고 싶다면, 각 모델이 상속받는 베이스 모델 클래스에 `newCollection` 메서드를 정의하면 됩니다.
