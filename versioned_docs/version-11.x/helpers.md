# 헬퍼 (Helpers)

- [소개](#introduction)
- [사용 가능한 메서드](#available-methods)
- [기타 유틸리티](#other-utilities)
    - [벤치마킹](#benchmarking)
    - [날짜](#dates)
    - [지연 함수](#deferred-functions)
    - [로터리](#lottery)
    - [파이프라인](#pipeline)
    - [슬립](#sleep)
    - [타임박스](#timebox)

<a name="introduction"></a>
## 소개

라라벨에는 다양한 전역 "헬퍼" PHP 함수들이 포함되어 있습니다. 이 함수들 중 상당수는 라라벨 프레임워크 내부에서 활용되지만, 여러분이 편리하다고 판단한다면 자신의 애플리케이션에서도 자유롭게 사용할 수 있습니다.

<a name="available-methods"></a>
## 사용 가능한 메서드



<a name="arrays-and-objects-method-list"></a>
### 배열 & 오브젝트

<div class="collection-method-list" markdown="1">

[Arr::accessible](#method-array-accessible)
[Arr::add](#method-array-add)
[Arr::collapse](#method-array-collapse)
[Arr::crossJoin](#method-array-crossjoin)
[Arr::divide](#method-array-divide)
[Arr::dot](#method-array-dot)
[Arr::except](#method-array-except)
[Arr::exists](#method-array-exists)
[Arr::first](#method-array-first)
[Arr::flatten](#method-array-flatten)
[Arr::forget](#method-array-forget)
[Arr::get](#method-array-get)
[Arr::has](#method-array-has)
[Arr::hasAny](#method-array-hasany)
[Arr::isAssoc](#method-array-isassoc)
[Arr::isList](#method-array-islist)
[Arr::join](#method-array-join)
[Arr::keyBy](#method-array-keyby)
[Arr::last](#method-array-last)
[Arr::map](#method-array-map)
[Arr::mapSpread](#method-array-map-spread)
[Arr::mapWithKeys](#method-array-map-with-keys)
[Arr::only](#method-array-only)
[Arr::pluck](#method-array-pluck)
[Arr::prepend](#method-array-prepend)
[Arr::prependKeysWith](#method-array-prependkeyswith)
[Arr::pull](#method-array-pull)
[Arr::query](#method-array-query)
[Arr::random](#method-array-random)
[Arr::reject](#method-array-reject)
[Arr::set](#method-array-set)
[Arr::shuffle](#method-array-shuffle)
[Arr::sort](#method-array-sort)
[Arr::sortDesc](#method-array-sort-desc)
[Arr::sortRecursive](#method-array-sort-recursive)
[Arr::take](#method-array-take)
[Arr::toCssClasses](#method-array-to-css-classes)
[Arr::toCssStyles](#method-array-to-css-styles)
[Arr::undot](#method-array-undot)
[Arr::where](#method-array-where)
[Arr::whereNotNull](#method-array-where-not-null)
[Arr::wrap](#method-array-wrap)
[data_fill](#method-data-fill)
[data_get](#method-data-get)
[data_set](#method-data-set)
[data_forget](#method-data-forget)
[head](#method-head)
[last](#method-last)
</div>

<a name="numbers-method-list"></a>
### 숫자

<div class="collection-method-list" markdown="1">

[Number::abbreviate](#method-number-abbreviate)
[Number::clamp](#method-number-clamp)
[Number::currency](#method-number-currency)
[Number::defaultCurrency](#method-default-currency)
[Number::defaultLocale](#method-default-locale)
[Number::fileSize](#method-number-file-size)
[Number::forHumans](#method-number-for-humans)
[Number::format](#method-number-format)
[Number::ordinal](#method-number-ordinal)
[Number::pairs](#method-number-pairs)
[Number::percentage](#method-number-percentage)
[Number::spell](#method-number-spell)
[Number::trim](#method-number-trim)
[Number::useLocale](#method-number-use-locale)
[Number::withLocale](#method-number-with-locale)
[Number::useCurrency](#method-number-use-currency)
[Number::withCurrency](#method-number-with-currency)

</div>

<a name="paths-method-list"></a>
### 경로

<div class="collection-method-list" markdown="1">

[app_path](#method-app-path)
[base_path](#method-base-path)
[config_path](#method-config-path)
[database_path](#method-database-path)
[lang_path](#method-lang-path)
[mix](#method-mix)
[public_path](#method-public-path)
[resource_path](#method-resource-path)
[storage_path](#method-storage-path)

</div>

<a name="urls-method-list"></a>
### URL

<div class="collection-method-list" markdown="1">

[action](#method-action)
[asset](#method-asset)
[route](#method-route)
[secure_asset](#method-secure-asset)
[secure_url](#method-secure-url)
[to_route](#method-to-route)
[url](#method-url)

</div>

<a name="miscellaneous-method-list"></a>
### 기타

<div class="collection-method-list" markdown="1">

[abort](#method-abort)
[abort_if](#method-abort-if)
[abort_unless](#method-abort-unless)
[app](#method-app)
[auth](#method-auth)
[back](#method-back)
[bcrypt](#method-bcrypt)
[blank](#method-blank)
[broadcast](#method-broadcast)
[cache](#method-cache)
[class_uses_recursive](#method-class-uses-recursive)
[collect](#method-collect)
[config](#method-config)
[context](#method-context)
[cookie](#method-cookie)
[csrf_field](#method-csrf-field)
[csrf_token](#method-csrf-token)
[decrypt](#method-decrypt)
[dd](#method-dd)
[dispatch](#method-dispatch)
[dispatch_sync](#method-dispatch-sync)
[dump](#method-dump)
[encrypt](#method-encrypt)
[env](#method-env)
[event](#method-event)
[fake](#method-fake)
[filled](#method-filled)
[info](#method-info)
[literal](#method-literal)
[logger](#method-logger)
[method_field](#method-method-field)
[now](#method-now)
[old](#method-old)
[once](#method-once)
[optional](#method-optional)
[policy](#method-policy)
[redirect](#method-redirect)
[report](#method-report)
[report_if](#method-report-if)
[report_unless](#method-report-unless)
[request](#method-request)
[rescue](#method-rescue)
[resolve](#method-resolve)
[response](#method-response)
[retry](#method-retry)
[session](#method-session)
[tap](#method-tap)
[throw_if](#method-throw-if)
[throw_unless](#method-throw-unless)
[today](#method-today)
[trait_uses_recursive](#method-trait-uses-recursive)
[transform](#method-transform)
[validator](#method-validator)
[value](#method-value)
[view](#method-view)
[with](#method-with)
[when](#method-when)

</div>

<a name="arrays"></a>
## 배열 & 오브젝트

<a name="method-array-accessible"></a>
#### `Arr::accessible()`

`Arr::accessible` 메서드는 주어진 값이 배열로 접근 가능한지 판단합니다:

```
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;

$isAccessible = Arr::accessible(['a' => 1, 'b' => 2]);

// true

$isAccessible = Arr::accessible(new Collection);

// true

$isAccessible = Arr::accessible('abc');

// false

$isAccessible = Arr::accessible(new stdClass);

// false
```

<a name="method-array-add"></a>
#### `Arr::add()`

`Arr::add` 메서드는 주어진 배열에 해당 키가 존재하지 않거나 값이 `null`로 설정된 경우, 지정한 키/값 쌍을 추가합니다:

```
use Illuminate\Support\Arr;

$array = Arr::add(['name' => 'Desk'], 'price', 100);

// ['name' => 'Desk', 'price' => 100]

$array = Arr::add(['name' => 'Desk', 'price' => null], 'price', 100);

// ['name' => 'Desk', 'price' => 100]
```

<a name="method-array-collapse"></a>
#### `Arr::collapse()`

`Arr::collapse` 메서드는 다차원 배열(배열의 배열들)을 하나의 배열로 합쳐줍니다:

```
use Illuminate\Support\Arr;

$array = Arr::collapse([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);

// [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

<a name="method-array-crossjoin"></a>
#### `Arr::crossJoin()`

`Arr::crossJoin` 메서드는 주어진 배열들의 교차 곱(카테시안 곱)을 만들어, 가능한 모든 조합을 반환합니다:

```
use Illuminate\Support\Arr;

$matrix = Arr::crossJoin([1, 2], ['a', 'b']);

/*
    [
        [1, 'a'],
        [1, 'b'],
        [2, 'a'],
        [2, 'b'],
    ]
*/

$matrix = Arr::crossJoin([1, 2], ['a', 'b'], ['I', 'II']);

/*
    [
        [1, 'a', 'I'],
        [1, 'a', 'II'],
        [1, 'b', 'I'],
        [1, 'b', 'II'],
        [2, 'a', 'I'],
        [2, 'a', 'II'],
        [2, 'b', 'I'],
        [2, 'b', 'II'],
    ]
*/
```

<a name="method-array-divide"></a>
#### `Arr::divide()`

`Arr::divide` 메서드는 주어진 배열에서 키와 값으로 각각 이루어진 두 개의 배열을 반환합니다:

```
use Illuminate\Support\Arr;

[$keys, $values] = Arr::divide(['name' => 'Desk']);

// $keys: ['name']

// $values: ['Desk']
```

<a name="method-array-dot"></a>
#### `Arr::dot()`

`Arr::dot` 메서드는 다차원 배열을 "점(dot) 표기법"을 이용해 단일 수준의 배열로 평탄화합니다:

```
use Illuminate\Support\Arr;

$array = ['products' => ['desk' => ['price' => 100]]];

$flattened = Arr::dot($array);

// ['products.desk.price' => 100]
```

<a name="method-array-except"></a>
#### `Arr::except()`

`Arr::except` 메서드는 입력된 배열에서 지정된 키/값 쌍을 제거합니다:

```
use Illuminate\Support\Arr;

$array = ['name' => 'Desk', 'price' => 100];

$filtered = Arr::except($array, ['price']);

// ['name' => 'Desk']
```

<a name="method-array-exists"></a>
#### `Arr::exists()`

`Arr::exists` 메서드는 주어진 키가 해당 배열에 존재하는지 확인합니다:

```
use Illuminate\Support\Arr;

$array = ['name' => 'John Doe', 'age' => 17];

$exists = Arr::exists($array, 'name');

// true

$exists = Arr::exists($array, 'salary');

// false
```

<a name="method-array-first"></a>
#### `Arr::first()`

`Arr::first` 메서드는 지정한 조건(콜백 함수)을 만족하는 배열의 첫 번째 요소를 반환합니다:

```
use Illuminate\Support\Arr;

$array = [100, 200, 300];

$first = Arr::first($array, function (int $value, int $key) {
    return $value >= 150;
});

// 200
```

조건을 통과하는 값이 없을 경우에 반환할 기본값을 세 번째 인자로 전달할 수 있습니다:

```
use Illuminate\Support\Arr;

$first = Arr::first($array, $callback, $default);
```

<a name="method-array-flatten"></a>
#### `Arr::flatten()`

`Arr::flatten` 메서드는 다차원 배열을 한 단계의 배열로 만들어줍니다:

```
use Illuminate\Support\Arr;

$array = ['name' => 'Joe', 'languages' => ['PHP', 'Ruby']];

$flattened = Arr::flatten($array);

// ['Joe', 'PHP', 'Ruby']
```

<a name="method-array-forget"></a>
#### `Arr::forget()`

`Arr::forget` 메서드는 "점(dot) 표기법"을 활용하여, 깊게 중첩된 배열에서 특정 키/값 쌍을 제거합니다:

```
use Illuminate\Support\Arr;

$array = ['products' => ['desk' => ['price' => 100]]];

Arr::forget($array, 'products.desk');

// ['products' => []]
```

<a name="method-array-get"></a>
#### `Arr::get()`

`Arr::get` 메서드는 "점(dot) 표기법"을 사용해 깊게 중첩된 배열에서 값을 가져옵니다:

```
use Illuminate\Support\Arr;

$array = ['products' => ['desk' => ['price' => 100]]];

$price = Arr::get($array, 'products.desk.price');

// 100
```

또한, `Arr::get` 메서드는 하나의 기본값도 인자로 받을 수 있습니다. 지정한 키가 배열에 없을 경우 이 값을 반환합니다:

```
use Illuminate\Support\Arr;

$discount = Arr::get($array, 'products.desk.discount', 0);

// 0
```

<a name="method-array-has"></a>
#### `Arr::has()`

`Arr::has` 메서드는 "점(dot) 표기법"을 사용하여, 지정한 항목(들)이 배열에 존재하는지 확인합니다:

```
use Illuminate\Support\Arr;

$array = ['product' => ['name' => 'Desk', 'price' => 100]];

$contains = Arr::has($array, 'product.name');

// true

$contains = Arr::has($array, ['product.price', 'product.discount']);

// false
```

<a name="method-array-hasany"></a>
#### `Arr::hasAny()`

`Arr::hasAny` 메서드는 "점(dot) 표기법"을 이용하여, 지정한 항목들 중 하나라도 배열에 존재하는지 확인합니다:

```
use Illuminate\Support\Arr;

$array = ['product' => ['name' => 'Desk', 'price' => 100]];

$contains = Arr::hasAny($array, 'product.name');

// true

$contains = Arr::hasAny($array, ['product.name', 'product.discount']);

// true

$contains = Arr::hasAny($array, ['category', 'product.discount']);

// false
```

<a name="method-array-isassoc"></a>
#### `Arr::isAssoc()`

`Arr::isAssoc` 메서드는 주어진 배열이 연관 배열(associative array)인지 여부를 반환합니다. 배열의 키가 0부터 시작해서 순차적이지 않은 경우, 연관 배열로 간주됩니다:

```
use Illuminate\Support\Arr;

$isAssoc = Arr::isAssoc(['product' => ['name' => 'Desk', 'price' => 100]]);

// true

$isAssoc = Arr::isAssoc([1, 2, 3]);

// false
```

<a name="method-array-islist"></a>
#### `Arr::isList()`

`Arr::isList` 메서드는 배열의 키들이 0부터 시작하는 연속된 정수일 때 `true`를 반환합니다:

```
use Illuminate\Support\Arr;

$isList = Arr::isList(['foo', 'bar', 'baz']);

// true

$isList = Arr::isList(['product' => ['name' => 'Desk', 'price' => 100]]);

// false
```

<a name="method-array-join"></a>
#### `Arr::join()`

`Arr::join` 메서드는 배열의 요소들을 문자열로 합쳐줍니다. 두 번째 인자로 구분자를, 세 번째 인자로 마지막 요소 앞에 사용할 구분자를 지정할 수 있습니다:

```
use Illuminate\Support\Arr;

$array = ['Tailwind', 'Alpine', 'Laravel', 'Livewire'];

$joined = Arr::join($array, ', ');

// Tailwind, Alpine, Laravel, Livewire

$joined = Arr::join($array, ', ', ' and ');

// Tailwind, Alpine, Laravel and Livewire
```

<a name="method-array-keyby"></a>
#### `Arr::keyBy()`

`Arr::keyBy` 메서드는 배열의 지정된 키를 이용해 새로운 배열의 키로 할당합니다. 동일한 키가 여러 번 등장할 경우, 마지막 값만의 값이 최종적으로 할당됩니다:

```
use Illuminate\Support\Arr;

$array = [
    ['product_id' => 'prod-100', 'name' => 'Desk'],
    ['product_id' => 'prod-200', 'name' => 'Chair'],
];

$keyed = Arr::keyBy($array, 'product_id');

/*
    [
        'prod-100' => ['product_id' => 'prod-100', 'name' => 'Desk'],
        'prod-200' => ['product_id' => 'prod-200', 'name' => 'Chair'],
    ]
*/
```

<a name="method-array-last"></a>
#### `Arr::last()`

`Arr::last` 메서드는 주어진 조건(콜백 함수)을 만족하는 배열의 마지막 요소를 반환합니다:

```
use Illuminate\Support\Arr;

$array = [100, 200, 300, 110];

$last = Arr::last($array, function (int $value, int $key) {
    return $value >= 150;
});

// 300
```

조건을 만족하는 값이 없는 경우 반환할 기본값을 세 번째 인자로 지정할 수 있습니다:

```
use Illuminate\Support\Arr;

$last = Arr::last($array, $callback, $default);
```

<a name="method-array-map"></a>

#### `Arr::map()`

`Arr::map` 메서드는 배열을 반복하면서 각 값과 키를 전달된 콜백 함수에 넘깁니다. 콜백 함수가 반환하는 값으로 배열의 값을 교체합니다.

```
use Illuminate\Support\Arr;

$array = ['first' => 'james', 'last' => 'kirk'];

$mapped = Arr::map($array, function (string $value, string $key) {
    return ucfirst($value);
});

// ['first' => 'James', 'last' => 'Kirk']
```

<a name="method-array-map-spread"></a>
#### `Arr::mapSpread()`

`Arr::mapSpread` 메서드는 배열을 반복하면서, 각 중첩된 요소의 값을 전달된 클로저에 전달합니다. 클로저 내에서 각 요소를 자유롭게 수정하여 반환할 수 있으며, 그 반환값들로 새로운 배열이 만들어집니다.

```
use Illuminate\Support\Arr;

$array = [
    [0, 1],
    [2, 3],
    [4, 5],
    [6, 7],
    [8, 9],
];

$mapped = Arr::mapSpread($array, function (int $even, int $odd) {
    return $even + $odd;
});

/*
    [1, 5, 9, 13, 17]
*/
```

<a name="method-array-map-with-keys"></a>
#### `Arr::mapWithKeys()`

`Arr::mapWithKeys` 메서드는 배열을 반복하면서 각 값을 전달된 콜백 함수에 넘깁니다. 콜백 함수는 반드시 하나의 키/값 쌍이 들어 있는 연관 배열을 반환해야 합니다.

```
use Illuminate\Support\Arr;

$array = [
    [
        'name' => 'John',
        'department' => 'Sales',
        'email' => 'john@example.com',
    ],
    [
        'name' => 'Jane',
        'department' => 'Marketing',
        'email' => 'jane@example.com',
    ]
];

$mapped = Arr::mapWithKeys($array, function (array $item, int $key) {
    return [$item['email'] => $item['name']];
});

/*
    [
        'john@example.com' => 'John',
        'jane@example.com' => 'Jane',
    ]
*/
```

<a name="method-array-only"></a>
#### `Arr::only()`

`Arr::only` 메서드는 지정한 키/값 쌍만을 배열에서 반환합니다.

```
use Illuminate\Support\Arr;

$array = ['name' => 'Desk', 'price' => 100, 'orders' => 10];

$slice = Arr::only($array, ['name', 'price']);

// ['name' => 'Desk', 'price' => 100]
```

<a name="method-array-pluck"></a>
#### `Arr::pluck()`

`Arr::pluck` 메서드는 배열에서 지정한 키의 모든 값을 추출해 반환합니다.

```
use Illuminate\Support\Arr;

$array = [
    ['developer' => ['id' => 1, 'name' => 'Taylor']],
    ['developer' => ['id' => 2, 'name' => 'Abigail']],
];

$names = Arr::pluck($array, 'developer.name');

// ['Taylor', 'Abigail']
```

결과 배열의 키를 어떻게 지정할지도 선택할 수 있습니다.

```
use Illuminate\Support\Arr;

$names = Arr::pluck($array, 'developer.name', 'developer.id');

// [1 => 'Taylor', 2 => 'Abigail']
```

<a name="method-array-prepend"></a>
#### `Arr::prepend()`

`Arr::prepend` 메서드는 배열의 맨 앞에 값을 추가합니다.

```
use Illuminate\Support\Arr;

$array = ['one', 'two', 'three', 'four'];

$array = Arr::prepend($array, 'zero');

// ['zero', 'one', 'two', 'three', 'four']
```

필요하다면, 값에 사용할 키를 지정할 수도 있습니다.

```
use Illuminate\Support\Arr;

$array = ['price' => 100];

$array = Arr::prepend($array, 'Desk', 'name');

// ['name' => 'Desk', 'price' => 100]
```

<a name="method-array-prependkeyswith"></a>
#### `Arr::prependKeysWith()`

`Arr::prependKeysWith` 메서드는 연관 배열의 모든 키 이름 앞에 지정한 접두사를 붙입니다.

```
use Illuminate\Support\Arr;

$array = [
    'name' => 'Desk',
    'price' => 100,
];

$keyed = Arr::prependKeysWith($array, 'product.');

/*
    [
        'product.name' => 'Desk',
        'product.price' => 100,
    ]
*/
```

<a name="method-array-pull"></a>
#### `Arr::pull()`

`Arr::pull` 메서드는 배열에서 키/값 쌍을 반환하고 해당 항목을 배열에서 제거합니다.

```
use Illuminate\Support\Arr;

$array = ['name' => 'Desk', 'price' => 100];

$name = Arr::pull($array, 'name');

// $name: Desk

// $array: ['price' => 100]
```

세 번째 인수로 기본값을 지정할 수 있습니다. 해당 키가 배열에 없다면 이 값이 반환됩니다.

```
use Illuminate\Support\Arr;

$value = Arr::pull($array, $key, $default);
```

<a name="method-array-query"></a>
#### `Arr::query()`

`Arr::query` 메서드는 배열을 쿼리 문자열로 변환합니다.

```
use Illuminate\Support\Arr;

$array = [
    'name' => 'Taylor',
    'order' => [
        'column' => 'created_at',
        'direction' => 'desc'
    ]
];

Arr::query($array);

// name=Taylor&order[column]=created_at&order[direction]=desc
```

<a name="method-array-random"></a>
#### `Arr::random()`

`Arr::random` 메서드는 배열에서 임의의 값을 반환합니다.

```
use Illuminate\Support\Arr;

$array = [1, 2, 3, 4, 5];

$random = Arr::random($array);

// 4 - (랜덤으로 선택)
```

두 번째 인수로 반환할 항목의 개수를 지정할 수도 있습니다. 이 인수를 지정하면 단일 항목만을 원해도 항상 배열 형태로 반환됩니다.

```
use Illuminate\Support\Arr;

$items = Arr::random($array, 2);

// [2, 5] - (랜덤으로 선택)
```

<a name="method-array-reject"></a>
#### `Arr::reject()`

`Arr::reject` 메서드는 전달된 클로저를 이용해 배열에서 항목들을 제거합니다.

```
use Illuminate\Support\Arr;

$array = [100, '200', 300, '400', 500];

$filtered = Arr::reject($array, function (string|int $value, int $key) {
    return is_string($value);
});

// [0 => 100, 2 => 300, 4 => 500]
```

<a name="method-array-set"></a>
#### `Arr::set()`

`Arr::set` 메서드는 "dot" 표기법을 사용해 다차원 배열의 값을 설정합니다.

```
use Illuminate\Support\Arr;

$array = ['products' => ['desk' => ['price' => 100]]];

Arr::set($array, 'products.desk.price', 200);

// ['products' => ['desk' => ['price' => 200]]]
```

<a name="method-array-shuffle"></a>
#### `Arr::shuffle()`

`Arr::shuffle` 메서드는 배열의 항목을 임의로 뒤섞습니다.

```
use Illuminate\Support\Arr;

$array = Arr::shuffle([1, 2, 3, 4, 5]);

// [3, 2, 5, 1, 4] - (랜덤하게 생성)
```

<a name="method-array-sort"></a>
#### `Arr::sort()`

`Arr::sort` 메서드는 배열의 값을 기준으로 정렬합니다.

```
use Illuminate\Support\Arr;

$array = ['Desk', 'Table', 'Chair'];

$sorted = Arr::sort($array);

// ['Chair', 'Desk', 'Table']
```

전달된 클로저의 결과에 따라 배열을 정렬하도록 할 수도 있습니다.

```
use Illuminate\Support\Arr;

$array = [
    ['name' => 'Desk'],
    ['name' => 'Table'],
    ['name' => 'Chair'],
];

$sorted = array_values(Arr::sort($array, function (array $value) {
    return $value['name'];
}));

/*
    [
        ['name' => 'Chair'],
        ['name' => 'Desk'],
        ['name' => 'Table'],
    ]
*/
```

<a name="method-array-sort-desc"></a>
#### `Arr::sortDesc()`

`Arr::sortDesc` 메서드는 배열의 값을 기준으로 내림차순 정렬합니다.

```
use Illuminate\Support\Arr;

$array = ['Desk', 'Table', 'Chair'];

$sorted = Arr::sortDesc($array);

// ['Table', 'Desk', 'Chair']
```

전달된 클로저의 결과에 따라 배열을 내림차순 정렬할 수도 있습니다.

```
use Illuminate\Support\Arr;

$array = [
    ['name' => 'Desk'],
    ['name' => 'Table'],
    ['name' => 'Chair'],
];

$sorted = array_values(Arr::sortDesc($array, function (array $value) {
    return $value['name'];
}));

/*
    [
        ['name' => 'Table'],
        ['name' => 'Desk'],
        ['name' => 'Chair'],
    ]
*/
```

<a name="method-array-sort-recursive"></a>
#### `Arr::sortRecursive()`

`Arr::sortRecursive` 메서드는 숫자 인덱스가 있는 하위 배열에는 `sort` 함수, 연관 배열에는 `ksort` 함수를 이용해 재귀적으로 배열을 정렬합니다.

```
use Illuminate\Support\Arr;

$array = [
    ['Roman', 'Taylor', 'Li'],
    ['PHP', 'Ruby', 'JavaScript'],
    ['one' => 1, 'two' => 2, 'three' => 3],
];

$sorted = Arr::sortRecursive($array);

/*
    [
        ['JavaScript', 'PHP', 'Ruby'],
        ['one' => 1, 'three' => 3, 'two' => 2],
        ['Li', 'Roman', 'Taylor'],
    ]
*/
```

내림차순으로 정렬된 결과가 필요하다면 `Arr::sortRecursiveDesc` 메서드를 사용할 수 있습니다.

```
$sorted = Arr::sortRecursiveDesc($array);
```

<a name="method-array-take"></a>
#### `Arr::take()`

`Arr::take` 메서드는 지정한 개수만큼의 항목을 포함하는 새로운 배열을 반환합니다.

```
use Illuminate\Support\Arr;

$array = [0, 1, 2, 3, 4, 5];

$chunk = Arr::take($array, 3);

// [0, 1, 2]
```

음수를 전달하면, 배열의 끝에서부터 해당 개수만큼 반환합니다.

```
$array = [0, 1, 2, 3, 4, 5];

$chunk = Arr::take($array, -2);

// [4, 5]
```

<a name="method-array-to-css-classes"></a>
#### `Arr::toCssClasses()`

`Arr::toCssClasses` 메서드는 조건적으로 CSS 클래스 문자열을 만들어냅니다. 이 메서드는 클래스 또는 클래스들의 이름을 배열의 키에, 불리언 값을 값으로 담은 배열을 받습니다. 만약 배열 항목의 키가 숫자라면, 해당 항목은 조건과 상관없이 항상 클래스 목록에 포함됩니다.

```
use Illuminate\Support\Arr;

$isActive = false;
$hasError = true;

$array = ['p-4', 'font-bold' => $isActive, 'bg-red' => $hasError];

$classes = Arr::toCssClasses($array);

/*
    'p-4 bg-red'
*/
```

<a name="method-array-to-css-styles"></a>
#### `Arr::toCssStyles()`

`Arr::toCssStyles` 메서드는 조건적으로 CSS 스타일 문자열을 만들어냅니다. 이 메서드 역시 클래스 또는 클래스들의 이름을 배열의 키에, 불리언 값을 값으로 담은 배열을 받습니다. 배열 항목의 키가 숫자일 경우, 해당 스타일 항목은 항상 포함됩니다.

```php
use Illuminate\Support\Arr;

$hasColor = true;

$array = ['background-color: blue', 'color: blue' => $hasColor];

$classes = Arr::toCssStyles($array);

/*
    'background-color: blue; color: blue;'
*/
```

이 메서드는 라라벨의 [Blade 컴포넌트 속성 가방에서 클래스 병합](/docs/11.x/blade#conditionally-merge-classes) 및 `@class` [Blade 디렉티브](/docs/11.x/blade#conditional-classes) 기능을 지원합니다.

<a name="method-array-undot"></a>
#### `Arr::undot()`

`Arr::undot` 메서드는 "dot" 표기법을 사용하는 1차원 배열을 다차원 배열로 확장합니다.

```
use Illuminate\Support\Arr;

$array = [
    'user.name' => 'Kevin Malone',
    'user.occupation' => 'Accountant',
];

$array = Arr::undot($array);

// ['user' => ['name' => 'Kevin Malone', 'occupation' => 'Accountant']]
```

<a name="method-array-where"></a>
#### `Arr::where()`

`Arr::where` 메서드는 전달된 클로저로 배열에서 항목을 필터링합니다.

```
use Illuminate\Support\Arr;

$array = [100, '200', 300, '400', 500];

$filtered = Arr::where($array, function (string|int $value, int $key) {
    return is_string($value);
});

// [1 => '200', 3 => '400']
```

<a name="method-array-where-not-null"></a>
#### `Arr::whereNotNull()`

`Arr::whereNotNull` 메서드는 전달된 배열에서 모든 `null` 값을 제거합니다.

```
use Illuminate\Support\Arr;

$array = [0, null];

$filtered = Arr::whereNotNull($array);

// [0 => 0]
```

<a name="method-array-wrap"></a>
#### `Arr::wrap()`

`Arr::wrap` 메서드는 전달된 값을 배열로 감쌉니다. 전달값이 이미 배열이면 그대로 반환합니다.

```
use Illuminate\Support\Arr;

$string = 'Laravel';

$array = Arr::wrap($string);

// ['Laravel']
```

전달값이 `null`일 경우 빈 배열을 반환합니다.

```
use Illuminate\Support\Arr;

$array = Arr::wrap(null);

// []
```

<a name="method-data-fill"></a>
#### `data_fill()`

`data_fill` 함수는 "dot" 표기법을 사용하여 중첩 배열 또는 객체에서 값이 없는 곳에 값을 설정합니다.

```
$data = ['products' => ['desk' => ['price' => 100]]];

data_fill($data, 'products.desk.price', 200);

// ['products' => ['desk' => ['price' => 100]]]

data_fill($data, 'products.desk.discount', 10);

// ['products' => ['desk' => ['price' => 100, 'discount' => 10]]]
```

이 함수는 별표(*)를 와일드카드로 사용할 수 있으며, 해당 대상이 여러 개라면 모두 채워줍니다.

```
$data = [
    'products' => [
        ['name' => 'Desk 1', 'price' => 100],
        ['name' => 'Desk 2'],
    ],
];

data_fill($data, 'products.*.price', 200);

/*
    [
        'products' => [
            ['name' => 'Desk 1', 'price' => 100],
            ['name' => 'Desk 2', 'price' => 200],
        ],
    ]
*/
```

<a name="method-data-get"></a>

#### `data_get()`

`data_get` 함수는 "dot" 표기법을 사용하여 중첩된 배열이나 객체에서 값을 가져옵니다.

```
$data = ['products' => ['desk' => ['price' => 100]]];

$price = data_get($data, 'products.desk.price');

// 100
```

`data_get` 함수는 기본값도 받을 수 있으며, 지정한 키를 찾을 수 없을 때 이 기본값을 반환합니다.

```
$discount = data_get($data, 'products.desk.discount', 0);

// 0
```

또한, 이 함수는 별표(`*`)를 사용해 와일드카드도 사용할 수 있으며, 배열이나 객체 내 모든 키를 대상으로 값을 가져올 수 있습니다.

```
$data = [
    'product-one' => ['name' => 'Desk 1', 'price' => 100],
    'product-two' => ['name' => 'Desk 2', 'price' => 150],
];

data_get($data, '*.name');

// ['Desk 1', 'Desk 2'];
```

`{first}` 및 `{last}` 플레이스홀더를 사용하면 배열의 첫 번째 또는 마지막 항목을 가져올 수 있습니다.

```
$flight = [
    'segments' => [
        ['from' => 'LHR', 'departure' => '9:00', 'to' => 'IST', 'arrival' => '15:00'],
        ['from' => 'IST', 'departure' => '16:00', 'to' => 'PKX', 'arrival' => '20:00'],
    ],
];

data_get($flight, 'segments.{first}.arrival');

// 15:00
```

<a name="method-data-set"></a>
#### `data_set()`

`data_set` 함수는 "dot" 표기법을 사용하여 중첩된 배열 또는 객체 내에 값을 설정합니다.

```
$data = ['products' => ['desk' => ['price' => 100]]];

data_set($data, 'products.desk.price', 200);

// ['products' => ['desk' => ['price' => 200]]]
```

이 함수 또한 별표(`*`) 와일드카드를 지원하며, 대상이 되는 모든 값에 변경을 적용합니다.

```
$data = [
    'products' => [
        ['name' => 'Desk 1', 'price' => 100],
        ['name' => 'Desk 2', 'price' => 150],
    ],
];

data_set($data, 'products.*.price', 200);

/*
    [
        'products' => [
            ['name' => 'Desk 1', 'price' => 200],
            ['name' => 'Desk 2', 'price' => 200],
        ],
    ]
*/
```

기본적으로 기존 값이 있으면 덮어씁니다. 만약 값이 아직 없을 때만 설정하고 싶다면, 네 번째 인자로 `false`를 전달하면 됩니다.

```
$data = ['products' => ['desk' => ['price' => 100]]];

data_set($data, 'products.desk.price', 200, overwrite: false);

// ['products' => ['desk' => ['price' => 100]]]
```

<a name="method-data-forget"></a>
#### `data_forget()`

`data_forget` 함수는 "dot" 표기법을 사용하여 중첩된 배열 또는 객체에서 값을 제거합니다.

```
$data = ['products' => ['desk' => ['price' => 100]]];

data_forget($data, 'products.desk.price');

// ['products' => ['desk' => []]]
```

이 함수 또한 별표(`*`) 와일드카드를 지원하여, 대상에 맞게 여러 값을 제거할 수 있습니다.

```
$data = [
    'products' => [
        ['name' => 'Desk 1', 'price' => 100],
        ['name' => 'Desk 2', 'price' => 150],
    ],
];

data_forget($data, 'products.*.price');

/*
    [
        'products' => [
            ['name' => 'Desk 1'],
            ['name' => 'Desk 2'],
        ],
    ]
*/
```

<a name="method-head"></a>
#### `head()`

`head` 함수는 전달된 배열의 첫 번째 요소를 반환합니다.

```
$array = [100, 200, 300];

$first = head($array);

// 100
```

<a name="method-last"></a>
#### `last()`

`last` 함수는 전달된 배열의 마지막 요소를 반환합니다.

```
$array = [100, 200, 300];

$last = last($array);

// 300
```

<a name="numbers"></a>
## 숫자 관련 함수

<a name="method-number-abbreviate"></a>
#### `Number::abbreviate()`

`Number::abbreviate` 메서드는 전달된 숫자 값을 사람에게 읽기 쉬운 형식(단위가 축약된 형태)으로 변환해 반환합니다.

```
use Illuminate\Support\Number;

$number = Number::abbreviate(1000);

// 1K

$number = Number::abbreviate(489939);

// 490K

$number = Number::abbreviate(1230000, precision: 2);

// 1.23M
```

<a name="method-number-clamp"></a>
#### `Number::clamp()`

`Number::clamp` 메서드는 지정한 숫자가 특정 범위 내에 있도록 제한해줍니다. 만약 숫자가 최소값보다 작으면 최소값을, 최대값보다 크면 최대값을 반환합니다.

```
use Illuminate\Support\Number;

$number = Number::clamp(105, min: 10, max: 100);

// 100

$number = Number::clamp(5, min: 10, max: 100);

// 10

$number = Number::clamp(10, min: 10, max: 100);

// 10

$number = Number::clamp(20, min: 10, max: 100);

// 20
```

<a name="method-number-currency"></a>
#### `Number::currency()`

`Number::currency` 메서드는 전달된 값을 화폐 단위로 변환하여 문자열로 반환합니다.

```
use Illuminate\Support\Number;

$currency = Number::currency(1000);

// $1,000.00

$currency = Number::currency(1000, in: 'EUR');

// €1,000.00

$currency = Number::currency(1000, in: 'EUR', locale: 'de');

// 1.000,00 €
```

<a name="method-default-currency"></a>
#### `Number::defaultCurrency()`

`Number::defaultCurrency` 메서드는 `Number` 클래스에서 사용 중인 기본 통화 단위를 반환합니다.

```
use Illuminate\Support\Number;

$currency = Number::defaultCurrency();

// USD
```

<a name="method-default-locale"></a>
#### `Number::defaultLocale()`

`Number::defaultLocale` 메서드는 `Number` 클래스에서 사용 중인 기본 로케일(언어/지역 설정)을 반환합니다.

```
use Illuminate\Support\Number;

$locale = Number::defaultLocale();

// en
```

<a name="method-number-file-size"></a>
#### `Number::fileSize()`

`Number::fileSize` 메서드는 바이트(byte) 단위의 값을 사람이 읽기 쉬운 파일 크기 문자열로 변환해 반환합니다.

```
use Illuminate\Support\Number;

$size = Number::fileSize(1024);

// 1 KB

$size = Number::fileSize(1024 * 1024);

// 1 MB

$size = Number::fileSize(1024, precision: 2);

// 1.00 KB
```

<a name="method-number-for-humans"></a>
#### `Number::forHumans()`

`Number::forHumans` 메서드는 입력된 숫자를 사람이 읽기 쉬운 서술형 형식으로 반환합니다.

```
use Illuminate\Support\Number;

$number = Number::forHumans(1000);

// 1 thousand

$number = Number::forHumans(489939);

// 490 thousand

$number = Number::forHumans(1230000, precision: 2);

// 1.23 million
```

<a name="method-number-format"></a>
#### `Number::format()`

`Number::format` 메서드는 전달된 숫자를 지정된 로케일에 맞게 문자열로 포맷팅합니다.

```
use Illuminate\Support\Number;

$number = Number::format(100000);

// 100,000

$number = Number::format(100000, precision: 2);

// 100,000.00

$number = Number::format(100000.123, maxPrecision: 2);

// 100,000.12

$number = Number::format(100000, locale: 'de');

// 100.000
```

<a name="method-number-ordinal"></a>
#### `Number::ordinal()`

`Number::ordinal` 메서드는 숫자의 서수(순서 표현)를 반환합니다.

```
use Illuminate\Support\Number;

$number = Number::ordinal(1);

// 1st

$number = Number::ordinal(2);

// 2nd

$number = Number::ordinal(21);

// 21st
```

<a name="method-number-pairs"></a>
#### `Number::pairs()`

`Number::pairs` 메서드는 지정한 범위와 단위(스텝)를 기준으로 숫자 쌍(하위 범위) 배열을 만듭니다. 이 메서드는 많은 숫자 범위를 페이지네이션, 일괄 작업 등으로 나누고자 할 때 유용하게 사용할 수 있습니다. 반환값은 각 쌍(하위 범위)이 배열로 이루어진 다차원 배열입니다.

```php
use Illuminate\Support\Number;

$result = Number::pairs(25, 10);

// [[1, 10], [11, 20], [21, 25]]

$result = Number::pairs(25, 10, offset: 0);

// [[0, 10], [10, 20], [20, 25]]
```

<a name="method-number-percentage"></a>
#### `Number::percentage()`

`Number::percentage` 메서드는 전달된 값을 백분율 형식의 문자열로 반환합니다.

```
use Illuminate\Support\Number;

$percentage = Number::percentage(10);

// 10%

$percentage = Number::percentage(10, precision: 2);

// 10.00%

$percentage = Number::percentage(10.123, maxPrecision: 2);

// 10.12%

$percentage = Number::percentage(10, precision: 2, locale: 'de');

// 10,00%
```

<a name="method-number-spell"></a>
#### `Number::spell()`

`Number::spell` 메서드는 전달된 숫자를 단어로 변환하여 문자열로 반환합니다.

```
use Illuminate\Support\Number;

$number = Number::spell(102);

// one hundred and two

$number = Number::spell(88, locale: 'fr');

// quatre-vingt-huit
```

`after` 인수를 사용하면, 특정 값 이상부터는 숫자로 표기하고 그 미만은 모두 단어로 변환할 수 있습니다.

```
$number = Number::spell(10, after: 10);

// 10

$number = Number::spell(11, after: 10);

// eleven
```

`until` 인수를 사용하면, 특정 값 이하까지는 단어로, 그 이상은 숫자로 표기할 수 있습니다.

```
$number = Number::spell(5, until: 10);

// five

$number = Number::spell(10, until: 10);

// 10
```

<a name="method-number-trim"></a>
#### `Number::trim()`

`Number::trim` 메서드는 전달된 소수점 숫자의 끝에 붙은 0을 제거한 결과를 반환합니다.

```
use Illuminate\Support\Number;

$number = Number::trim(12.0);

// 12

$number = Number::trim(12.30);

// 12.3
```

<a name="method-number-use-locale"></a>
#### `Number::useLocale()`

`Number::useLocale` 메서드는 기본 숫자 로케일을 전역적으로 지정합니다. 이 설정은 이후 `Number` 클래스의 메서드에서 숫자나 화폐를 포맷할 때 영향을 줍니다.

```
use Illuminate\Support\Number;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Number::useLocale('de');
}
```

<a name="method-number-with-locale"></a>
#### `Number::withLocale()`

`Number::withLocale` 메서드는 지정한 로케일로 클로저(콜백) 내부 코드를 실행하고, 실행이 끝난 후에는 원래의 로케일로 되돌립니다.

```
use Illuminate\Support\Number;

$number = Number::withLocale('de', function () {
    return Number::format(1500);
});
```

<a name="method-number-use-currency"></a>
#### `Number::useCurrency()`

`Number::useCurrency` 메서드는 기본 통화 단위를 전역적으로 설정합니다. 이 설정은 이후 `Number` 클래스의 메서드로 화폐를 표시할 때 모두 적용됩니다.

```
use Illuminate\Support\Number;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Number::useCurrency('GBP');
}
```

<a name="method-number-with-currency"></a>
#### `Number::withCurrency()`

`Number::withCurrency` 메서드는 지정한 통화로 클로저(콜백) 내부 코드를 실행하고, 실행이 끝난 후에는 원래의 통화로 되돌립니다.

```
use Illuminate\Support\Number;

$number = Number::withCurrency('GBP', function () {
    // ...
});
```

<a name="paths"></a>
## 경로 관련 함수

<a name="method-app-path"></a>
#### `app_path()`

`app_path` 함수는 애플리케이션의 `app` 디렉토리에 대한 전체 경로를 반환합니다. 또한 `app_path`에 매개변수를 전달해, 애플리케이션 디렉토리 기준의 파일 전체 경로를 생성할 수도 있습니다.

```
$path = app_path();

$path = app_path('Http/Controllers/Controller.php');
```

<a name="method-base-path"></a>
#### `base_path()`

`base_path` 함수는 애플리케이션의 프로젝트 루트 디렉토리에 대한 전체 경로를 반환합니다. 추가 인자를 사용해 프로젝트 루트에서 특정 파일에 대한 경로도 만들 수 있습니다.

```
$path = base_path();

$path = base_path('vendor/bin');
```

<a name="method-config-path"></a>
#### `config_path()`

`config_path` 함수는 애플리케이션의 `config` 디렉토리 전체 경로를 반환합니다. 추가 인자를 넣으면 설정 디렉토리 내의 특정 파일 경로도 생성할 수 있습니다.

```
$path = config_path();

$path = config_path('app.php');
```

<a name="method-database-path"></a>
#### `database_path()`

`database_path` 함수는 애플리케이션의 `database` 디렉토리에 대한 전체 경로를 반환합니다. 추가 매개변수로, 데이터베이스 디렉토리 내 특정 파일의 전체 경로도 얻을 수 있습니다.

```
$path = database_path();

$path = database_path('factories/UserFactory.php');
```

<a name="method-lang-path"></a>
#### `lang_path()`

`lang_path` 함수는 애플리케이션의 `lang` 디렉토리에 대한 전체 경로를 반환합니다. 또한 추가 파일명을 지정해 해당 폴더 내 특정 파일의 경로로 확장할 수 있습니다.

```
$path = lang_path();

$path = lang_path('en/messages.php');
```

> [!NOTE]  
> 기본적으로 라라벨 애플리케이션의 골격(skeleton)에는 `lang` 디렉토리가 포함되어 있지 않습니다. 라라벨의 언어 파일을 직접 커스터마이즈하려면, `lang:publish` Artisan 명령어를 사용해 언어 파일을 배포(publish)할 수 있습니다.

<a name="method-mix"></a>

#### `mix()`

`mix` 함수는 [버전 관리된 Mix 파일](/docs/11.x/mix)의 경로를 반환합니다.

```
$path = mix('css/app.css');
```

<a name="method-public-path"></a>
#### `public_path()`

`public_path` 함수는 애플리케이션의 `public` 디렉터리에 대한 전체 경로(절대 경로)를 반환합니다. 또한, `public_path` 함수에 파일 경로를 전달하여 public 디렉터리 내부의 특정 파일에 대한 전체 경로도 생성할 수 있습니다.

```
$path = public_path();

$path = public_path('css/app.css');
```

<a name="method-resource-path"></a>
#### `resource_path()`

`resource_path` 함수는 애플리케이션의 `resources` 디렉터리에 대한 전체 경로를 반환합니다. 마찬가지로, `resource_path` 함수에 파일명을 전달하여 resources 디렉터리 내 특정 파일의 전체 경로도 만들 수 있습니다.

```
$path = resource_path();

$path = resource_path('sass/app.scss');
```

<a name="method-storage-path"></a>
#### `storage_path()`

`storage_path` 함수는 애플리케이션의 `storage` 디렉터리 전체 경로를 반환합니다. 이 함수에도 파일명을 추가로 전달하여 storage 디렉터리 내 특정 파일의 전체 경로를 얻을 수 있습니다.

```
$path = storage_path();

$path = storage_path('app/file.txt');
```

<a name="urls"></a>
## URL

<a name="method-action"></a>
#### `action()`

`action` 함수는 주어진 컨트롤러 액션에 대한 URL을 생성합니다.

```
use App\Http\Controllers\HomeController;

$url = action([HomeController::class, 'index']);
```

만약 해당 메서드가 라우트 파라미터를 받는다면, 두 번째 인수로 파라미터 배열을 전달할 수 있습니다.

```
$url = action([UserController::class, 'profile'], ['id' => 1]);
```

<a name="method-asset"></a>
#### `asset()`

`asset` 함수는 현재 요청의 스킴(HTTP 또는 HTTPS)을 사용하여, 에셋(asset)의 URL을 생성합니다.

```
$url = asset('img/photo.jpg');
```

에셋의 호스트 URL은 `.env` 파일의 `ASSET_URL` 변수로 설정할 수 있습니다. 예를 들어, 에셋 파일을 Amazon S3 같은 외부 서비스나 다른 CDN에 호스팅하는 경우에 유용합니다.

```
// ASSET_URL=http://example.com/assets

$url = asset('img/photo.jpg'); // http://example.com/assets/img/photo.jpg
```

<a name="method-route"></a>
#### `route()`

`route` 함수는 지정한 [이름 붙은 라우트](/docs/11.x/routing#named-routes)에 대한 URL을 생성합니다.

```
$url = route('route.name');
```

해당 라우트가 파라미터를 받는다면 두 번째 인수로 파라미터 배열을 전달할 수 있습니다.

```
$url = route('route.name', ['id' => 1]);
```

기본적으로 `route` 함수는 절대 URL을 반환합니다. 상대 경로 URL을 생성하려면 세 번째 인수로 `false`를 전달할 수 있습니다.

```
$url = route('route.name', ['id' => 1], false);
```

<a name="method-secure-asset"></a>
#### `secure_asset()`

`secure_asset` 함수는 HTTPS를 사용하여 에셋의 URL을 생성합니다.

```
$url = secure_asset('img/photo.jpg');
```

<a name="method-secure-url"></a>
#### `secure_url()`

`secure_url` 함수는 전달된 경로에 대해 HTTPS로 전체 URL을 생성합니다. 두 번째 인수로 추가 URL 세그먼트를 배열로 전달할 수 있습니다.

```
$url = secure_url('user/profile');

$url = secure_url('user/profile', [1]);
```

<a name="method-to-route"></a>
#### `to_route()`

`to_route` 함수는 주어진 [이름 붙은 라우트](/docs/11.x/routing#named-routes)로의 [리디렉션 HTTP 응답](/docs/11.x/responses#redirects)을 생성합니다.

```
return to_route('users.show', ['user' => 1]);
```

필요하다면, 리디렉션에 사용할 HTTP 상태 코드와 추가 응답 헤더를 각각 세 번째, 네 번째 인수로 전달할 수 있습니다.

```
return to_route('users.show', ['user' => 1], 302, ['X-Framework' => 'Laravel']);
```

<a name="method-url"></a>
#### `url()`

`url` 함수는 주어진 경로에 대해 전체(절대) URL을 생성합니다.

```
$url = url('user/profile');

$url = url('user/profile', [1]);
```

경로를 지정하지 않으면 `Illuminate\Routing\UrlGenerator` 인스턴스가 반환됩니다.

```
$current = url()->current();

$full = url()->full();

$previous = url()->previous();
```

<a name="miscellaneous"></a>
## 기타

<a name="method-abort"></a>
#### `abort()`

`abort` 함수는 [HTTP 예외](/docs/11.x/errors#http-exceptions)를 발생시키며, 이는 [예외 핸들러](/docs/11.x/errors#handling-exceptions)에 의해 렌더링됩니다.

```
abort(403);
```

필요하다면 예외 메시지와 브라우저로 전송할 사용자 정의 HTTP 응답 헤더를 추가로 지정할 수 있습니다.

```
abort(403, 'Unauthorized.', $headers);
```

<a name="method-abort-if"></a>
#### `abort_if()`

`abort_if` 함수는 주어진 불리언 식의 값이 `true`일 때 HTTP 예외를 발생시킵니다.

```
abort_if(! Auth::user()->isAdmin(), 403);
```

`abort` 메서드와 마찬가지로, 세 번째 인수로 예외의 메시지, 네 번째 인수로 커스텀 응답 헤더 배열을 전달할 수 있습니다.

<a name="method-abort-unless"></a>
#### `abort_unless()`

`abort_unless` 함수는 주어진 불리언 식이 `false`일 때 HTTP 예외를 발생시킵니다.

```
abort_unless(Auth::user()->isAdmin(), 403);
```

`abort` 메서드와 마찬가지로, 세 번째 인수로 예외의 메시지, 네 번째 인수로 커스텀 응답 헤더 배열을 전달할 수 있습니다.

<a name="method-app"></a>
#### `app()`

`app` 함수는 [서비스 컨테이너](/docs/11.x/container) 인스턴스를 반환합니다.

```
$container = app();
```

클래스나 인터페이스 이름을 인수로 전달하면 컨테이너에서 해당 인스턴스를 해결(resolving)할 수도 있습니다.

```
$api = app('HelpSpot\API');
```

<a name="method-auth"></a>
#### `auth()`

`auth` 함수는 [인증기](/docs/11.x/authentication) 인스턴스를 반환합니다. `Auth` 파사드의 대체 방법으로도 사용할 수 있습니다.

```
$user = auth()->user();
```

필요하다면 접근하고자 하는 가드 인스턴스의 이름을 지정할 수도 있습니다.

```
$user = auth('admin')->user();
```

<a name="method-back"></a>
#### `back()`

`back` 함수는 사용자의 이전 위치로 [리디렉션 HTTP 응답](/docs/11.x/responses#redirects)을 생성합니다.

```
return back($status = 302, $headers = [], $fallback = '/');

return back();
```

<a name="method-bcrypt"></a>
#### `bcrypt()`

`bcrypt` 함수는 주어진 값을 Bcrypt로 [해싱](/docs/11.x/hashing)합니다. 이 함수는 `Hash` 파사드의 대체 방법으로 사용할 수 있습니다.

```
$password = bcrypt('my-secret-password');
```

<a name="method-blank"></a>
#### `blank()`

`blank` 함수는 주어진 값이 "비어있는 값(blank)"인지 확인합니다.

```
blank('');
blank('   ');
blank(null);
blank(collect());

// true

blank(0);
blank(true);
blank(false);

// false
```

`blank`와 반대 동작이 필요한 경우 [`filled`](#method-filled) 메서드를 참고하세요.

<a name="method-broadcast"></a>
#### `broadcast()`

`broadcast` 함수는 주어진 [이벤트](/docs/11.x/events)를 [브로드캐스트](/docs/11.x/broadcasting)하여 리스너들에게 전달합니다.

```
broadcast(new UserRegistered($user));

broadcast(new UserRegistered($user))->toOthers();
```

<a name="method-cache"></a>
#### `cache()`

`cache` 함수는 [캐시](/docs/11.x/cache)에서 값을 가져올 때 사용할 수 있습니다. 전달한 키가 캐시에 없으면, 두 번째 인수로 지정한 기본값이 반환됩니다.

```
$value = cache('key');

$value = cache('key', 'default');
```

캐시에 값을 저장하려면, 키/값 쌍의 배열과 값을 유효하다고 간주할 기간(초나 `DateTime` 객체 등)을 전달하면 됩니다.

```
cache(['key' => 'value'], 300);

cache(['key' => 'value'], now()->addSeconds(10));
```

<a name="method-class-uses-recursive"></a>
#### `class_uses_recursive()`

`class_uses_recursive` 함수는 클래스가 사용하는 모든 trait을 반환하며, 상위 클래스(부모 클래스)에서 사용하는 trait도 모두 포함됩니다.

```
$traits = class_uses_recursive(App\Models\User::class);
```

<a name="method-collect"></a>
#### `collect()`

`collect` 함수는 전달된 값에서 [컬렉션](/docs/11.x/collections) 인스턴스를 생성합니다.

```
$collection = collect(['taylor', 'abigail']);
```

<a name="method-config"></a>
#### `config()`

`config` 함수는 [설정](/docs/11.x/configuration) 변수의 값을 가져옵니다. 설정 값은 "dot" 구문을 사용하여 파일 이름과 접근할 옵션을 지정할 수 있습니다. 해당 설정 키가 존재하지 않을 경우 사용할 기본값을 두 번째 인수로 지정할 수 있습니다.

```
$value = config('app.timezone');

$value = config('app.timezone', $default);
```

실행 중에 설정값을 변경하려면, 키/값 쌍의 배열을 전달하면 됩니다. 단, 이 함수로 변경된 값은 현재 요청에서만 적용되며 실제 설정 파일은 변경되지 않습니다.

```
config(['app.debug' => true]);
```

<a name="method-context"></a>
#### `context()`

`context` 함수는 [현재 컨텍스트](/docs/11.x/context)에서 값을 가져옵니다. 컨텍스트 키가 없다면 기본값을 두 번째 인수로 지정할 수 있습니다.

```
$value = context('trace_id');

$value = context('trace_id', $default);
```

키/값 쌍의 배열을 전달해 컨텍스트 값을 설정할 수도 있습니다.

```
use Illuminate\Support\Str;

context(['trace_id' => Str::uuid()->toString()]);
```

<a name="method-cookie"></a>
#### `cookie()`

`cookie` 함수는 새로운 [쿠키](/docs/11.x/requests#cookies) 인스턴스를 생성합니다.

```
$cookie = cookie('name', 'value', $minutes);
```

<a name="method-csrf-field"></a>
#### `csrf_field()`

`csrf_field` 함수는 CSRF 토큰 값을 담는 HTML `hidden` input 필드를 생성합니다. 예를 들어, [Blade 문법](/docs/11.x/blade)에서 사용하면 다음과 같습니다.

```
{{ csrf_field() }}
```

<a name="method-csrf-token"></a>
#### `csrf_token()`

`csrf_token` 함수는 현재의 CSRF 토큰 값을 가져옵니다.

```
$token = csrf_token();
```

<a name="method-decrypt"></a>
#### `decrypt()`

`decrypt` 함수는 전달된 값을 [복호화](/docs/11.x/encryption)합니다. 이 함수는 `Crypt` 파사드의 대체 방법으로 사용할 수 있습니다.

```
$password = decrypt($value);
```

<a name="method-dd"></a>
#### `dd()`

`dd` 함수는 전달된 변수 값을 덤프(dump)하고 스크립트의 실행을 즉시 중단(종료)합니다.

```
dd($value);

dd($value1, $value2, $value3, ...);
```

스크립트 실행을 중단하지 않고 변수 값만 출력하려면 [`dump`](#method-dump) 함수를 사용하세요.

<a name="method-dispatch"></a>
#### `dispatch()`

`dispatch` 함수는 주어진 [잡(job)](/docs/11.x/queues#creating-jobs)을 라라벨의 [작업 큐](/docs/11.x/queues)에 푸시합니다.

```
dispatch(new App\Jobs\SendEmails);
```

<a name="method-dispatch-sync"></a>
#### `dispatch_sync()`

`dispatch_sync` 함수는 주어진 작업을 [동기(sync) 큐](/docs/11.x/queues#synchronous-dispatching)에 바로 푸시하여 즉시 처리하게 합니다.

```
dispatch_sync(new App\Jobs\SendEmails);
```

<a name="method-dump"></a>
#### `dump()`

`dump` 함수는 전달된 변수의 값을 출력(덤프)합니다.

```
dump($value);

dump($value1, $value2, $value3, ...);
```

값을 출력한 뒤 스크립트 실행도 멈추고 싶다면 [`dd`](#method-dd) 함수를 사용하세요.

<a name="method-encrypt"></a>
#### `encrypt()`

`encrypt` 함수는 전달된 값을 [암호화](/docs/11.x/encryption)합니다. 이 함수는 `Crypt` 파사드의 대체 방법으로 사용할 수 있습니다.

```
$secret = encrypt('my-secret-value');
```

<a name="method-env"></a>
#### `env()`

`env` 함수는 [환경 변수](/docs/11.x/configuration#environment-configuration)의 값을 가져오거나, 해당 값이 없으면 기본값을 반환합니다.

```
$env = env('APP_ENV');

$env = env('APP_ENV', 'production');
```

> [!WARNING]  
> 배포 과정에서 `config:cache` 명령어를 실행하는 경우, 반드시 `env` 함수를 설정 파일 내부에서만 호출해야 합니다. 구성이 캐시되면 `.env` 파일이 로드되지 않으며, 이 함수의 반환값은 모두 `null`이 됩니다.

<a name="method-event"></a>
#### `event()`

`event` 함수는 전달한 [이벤트](/docs/11.x/events)를 리스너들에게 디스패치(전달)합니다.

```
event(new UserRegistered($user));
```

<a name="method-fake"></a>
#### `fake()`

`fake` 함수는 컨테이너에서 [Faker](https://github.com/FakerPHP/Faker) 싱글턴을 가져옵니다. 이 함수는 모델 팩토리, DB 시드(seed), 테스트, 뷰 프로토타이핑 등에서 더미 데이터를 생성할 때 유용하게 사용할 수 있습니다.

```blade
@for($i = 0; $i < 10; $i++)
    <dl>
        <dt>Name</dt>
        <dd>{{ fake()->name() }}</dd>

        <dt>Email</dt>
        <dd>{{ fake()->unique()->safeEmail() }}</dd>
    </dl>
@endfor
```

기본적으로 `fake` 함수는 `config/app.php`의 `app.faker_locale` 설정값을 사용합니다. 일반적으로 이 설정은 `APP_FAKER_LOCALE` 환경 변수로 지정됩니다. 직접 로케일(locale)을 지정하려면, `fake` 함수에 로케일을 인수로 전달하세요. 각 로케일마다 별도의 싱글턴이 생성됩니다.

```
fake('nl_NL')->name()
```

<a name="method-filled"></a>
#### `filled()`

`filled` 함수는 주어진 값이 "비어있지 않은 값"인지 확인합니다.

```
filled(0);
filled(true);
filled(false);

// true

filled('');
filled('   ');
filled(null);
filled(collect());

// false
```

`filled`와 반대 동작이 필요한 경우 [`blank`](#method-blank) 메서드를 참고하세요.

<a name="method-info"></a>
#### `info()`

`info` 함수는 애플리케이션의 [로그](/docs/11.x/logging)에 정보를 기록합니다.

```
info('Some helpful information!');
```

이 함수에 컨텍스트 데이터를 배열로 함께 전달할 수도 있습니다.

```
info('User login attempt failed.', ['id' => $user->id]);
```

<a name="method-literal"></a>
#### `literal()`

`literal` 함수는 제공된 이름 있는 인수들을 property로 가지는 새로운 [stdClass](https://www.php.net/manual/en/class.stdclass.php) 인스턴스를 생성합니다.

```
$obj = literal(
    name: 'Joe',
    languages: ['PHP', 'Ruby'],
);

$obj->name; // 'Joe'
$obj->languages; // ['PHP', 'Ruby']
```

<a name="method-logger"></a>
#### `logger()`

`logger` 함수는 [로그](/docs/11.x/logging)에 `debug` 레벨 메시지를 기록할 때 사용할 수 있습니다.

```
logger('Debug message');
```

이 함수에도 컨텍스트 데이터를 배열로 함께 전달할 수 있습니다.

```
logger('User has logged in.', ['id' => $user->id]);
```

값을 전달하지 않으면 [logger](/docs/11.x/logging) 인스턴스가 반환됩니다.

```
logger()->error('You are not allowed here.');
```

<a name="method-method-field"></a>

#### `method_field()`

`method_field` 함수는 폼의 HTTP 메서드를 위조(spoof)하는 값을 담은 HTML `hidden` 입력 필드를 생성합니다. 예를 들어, [Blade 문법](/docs/11.x/blade)을 사용할 때 다음과 같이 활용할 수 있습니다.

```
<form method="POST">
    {{ method_field('DELETE') }}
</form>
```

<a name="method-now"></a>
#### `now()`

`now` 함수는 현재 시각을 나타내는 새로운 `Illuminate\Support\Carbon` 인스턴스를 생성합니다.

```
$now = now();
```

<a name="method-old"></a>
#### `old()`

`old` 함수는 [세션에 플래시된](/docs/11.x/requests#retrieving-input) [이전 입력값(old input)](/docs/11.x/requests#old-input)을 조회합니다.

```
$value = old('value');

$value = old('value', 'default');
```

`old` 함수에 두 번째 인자로 "기본값"을 지정하는 경우, 이 값이 종종 Eloquent 모델의 속성(property)일 때가 많기 때문에, 라라벨에서는 두 번째 인자에 전체 Eloquent 모델을 바로 전달할 수 있습니다. 이렇게 전달하면, `old` 함수의 첫 번째 인자를 Eloquent의 속성명으로 간주하여, 이를 기본값으로 사용하게 됩니다.

```
{{ old('name', $user->name) }}

// 다음과 동일합니다...

{{ old('name', $user) }}
```

<a name="method-once"></a>
#### `once()`

`once` 함수는 전달받은 콜백을 실행하고, 그 결과를 해당 요청 동안 메모리에 캐시합니다. 이후 동일한 콜백으로 `once`를 다시 호출하면 이미 캐시된 결과가 반환됩니다.

```
function random(): int
{
    return once(function () {
        return random_int(1, 1000);
    });
}

random(); // 123
random(); // 123 (캐시된 결과)
random(); // 123 (캐시된 결과)
```

객체 인스턴스 내에서 `once` 함수를 실행하면, 각 객체 인스턴스별로 고유한 캐시 결과를 가집니다.

```php
<?php

class NumberService
{
    public function all(): array
    {
        return once(fn () => [1, 2, 3]);
    }
}

$service = new NumberService;

$service->all();
$service->all(); // (캐시된 결과)

$secondService = new NumberService;

$secondService->all();
$secondService->all(); // (캐시된 결과)
```
<a name="method-optional"></a>
#### `optional()`

`optional` 함수는 어떤 인자든 받아 해당 객체의 속성이나 메서드에 접근할 수 있게 해줍니다. 만약 전달된 객체가 `null`이면, 속성이나 메서드도 `null`을 반환하므로 에러가 발생하지 않습니다.

```
return optional($user->address)->street;

{!! old('name', optional($user)->name) !!}
```

또한 `optional` 함수의 두 번째 인자로 클로저를 넘길 수도 있습니다. 첫 번째 인자로 받은 값이 null이 아니면 이 클로저가 실행됩니다.

```
return optional(User::find($id), function (User $user) {
    return $user->name;
});
```

<a name="method-policy"></a>
#### `policy()`

`policy` 함수는 주어진 클래스에 대한 [정책(Policy)](/docs/11.x/authorization#creating-policies) 인스턴스를 반환합니다.

```
$policy = policy(App\Models\User::class);
```

<a name="method-redirect"></a>
#### `redirect()`

`redirect` 함수는 [리디렉션 HTTP 응답](/docs/11.x/responses#redirects)을 반환하거나, 인자를 지정하지 않으면 리디렉터 인스턴스를 반환합니다.

```
return redirect($to = null, $status = 302, $headers = [], $https = null);

return redirect('/home');

return redirect()->route('route.name');
```

<a name="method-report"></a>
#### `report()`

`report` 함수는 [예외 핸들러](/docs/11.x/errors#handling-exceptions)를 사용하여 예외를 보고(report)합니다.

```
report($e);
```

이 함수는 문자열을 인자로 받을 수도 있습니다. 문자열이 주어지면 해당 문자열을 메시지로 가지는 예외가 생성되어 보고됩니다.

```
report('Something went wrong.');
```

<a name="method-report-if"></a>
#### `report_if()`

`report_if` 함수는 주어진 조건이 `true`인 경우, [예외 핸들러](/docs/11.x/errors#handling-exceptions)를 사용하여 예외를 보고합니다.

```
report_if($shouldReport, $e);

report_if($shouldReport, 'Something went wrong.');
```

<a name="method-report-unless"></a>
#### `report_unless()`

`report_unless` 함수는 주어진 조건이 `false`인 경우, [예외 핸들러](/docs/11.x/errors#handling-exceptions)를 사용하여 예외를 보고합니다.

```
report_unless($reportingDisabled, $e);

report_unless($reportingDisabled, 'Something went wrong.');
```

<a name="method-request"></a>
#### `request()`

`request` 함수는 현재 [요청 객체](/docs/11.x/requests) 인스턴스를 반환하거나, 현재 요청에서 특정 입력 필드의 값을 가져옵니다.

```
$request = request();

$value = request('key', $default);
```

<a name="method-rescue"></a>
#### `rescue()`

`rescue` 함수는 전달된 클로저를 실행하고, 내부에서 발생하는 예외를 포착합니다. 포착한 모든 예외는 [예외 핸들러](/docs/11.x/errors#handling-exceptions)에 전달되지만, 요청 처리는 계속됩니다.

```
return rescue(function () {
    return $this->method();
});
```

`rescue` 함수에 두 번째 인자를 전달하면, 이 값은 클로저 실행 중 예외가 발생했을 때 반환되는 "기본값"이 됩니다.

```
return rescue(function () {
    return $this->method();
}, false);

return rescue(function () {
    return $this->method();
}, function () {
    return $this->failure();
});
```

예외를 `report` 함수로 보고할지 여부를 결정하는 `report` 인자를 추가로 지정할 수도 있습니다.

```
return rescue(function () {
    return $this->method();
}, report: function (Throwable $throwable) {
    return $throwable instanceof InvalidArgumentException;
});
```

<a name="method-resolve"></a>
#### `resolve()`

`resolve` 함수는 [서비스 컨테이너](/docs/11.x/container)를 이용해 주어진 클래스 또는 인터페이스명을 인스턴스로 해결합니다.

```
$api = resolve('HelpSpot\API');
```

<a name="method-response"></a>
#### `response()`

`response` 함수는 [응답(Response)](/docs/11.x/responses) 인스턴스를 생성하거나, 응답 팩토리 인스턴스를 획득합니다.

```
return response('Hello World', 200, $headers);

return response()->json(['foo' => 'bar'], 200, $headers);
```

<a name="method-retry"></a>
#### `retry()`

`retry` 함수는 지정한 최대 시도 횟수만큼 콜백을 반복 실행합니다. 콜백이 예외를 발생시키지 않으면 해당 반환값이 반환됩니다. 만약 예외가 발생하면 자동으로 재시도하며, 최대 시도 횟수를 초과하면 예외가 다시 발생합니다.

```
return retry(5, function () {
    // 최대 5번 시도하고 각 시도 사이에 100ms 대기...
}, 100);
```

시도 간 대기 시간을 직접 계산해서 지정하고 싶다면, `retry`의 세 번째 인자로 클로저를 전달할 수 있습니다.

```
use Exception;

return retry(5, function () {
    // ...
}, function (int $attempt, Exception $exception) {
    return $attempt * 100;
});
```

편의상, `retry` 함수의 첫 번째 인자로 배열을 전달할 수 있습니다. 이 배열의 각 값이 각 시도 간 대기할 밀리초 단위 시간으로 사용됩니다.

```
return retry([100, 200], function () {
    // 첫 번째 재시도는 100ms, 두 번째는 200ms 대기...
});
```

특정 조건에서만 재시도를 원한다면, 네 번째 인자로 클로저를 전달할 수 있습니다.

```
use Exception;

return retry(5, function () {
    // ...
}, 100, function (Exception $exception) {
    return $exception instanceof RetryException;
});
```

<a name="method-session"></a>
#### `session()`

`session` 함수는 [세션](/docs/11.x/session) 값을 조회하거나 설정하는 데 사용할 수 있습니다.

```
$value = session('key');
```

키/값 쌍의 배열을 넘겨 값을 설정할 수도 있습니다.

```
session(['chairs' => 7, 'instruments' => 3]);
```

값을 지정하지 않으면 세션 스토어 인스턴스가 반환됩니다.

```
$value = session()->get('key');

session()->put('key', $value);
```

<a name="method-tap"></a>
#### `tap()`

`tap` 함수는 두 개의 인자, 임의의 `$value`와 클로저를 받습니다. `$value`를 클로저의 인자로 넘긴 후, 클로저의 반환값과 상관없이 `$value`를 그대로 반환합니다.

```
$user = tap(User::first(), function (User $user) {
    $user->name = 'taylor';

    $user->save();
});
```

만약 클로저를 넘기지 않으면, 전달한 `$value`에 메서드 체이닝으로 메서드를 호출할 수 있습니다. 이때 메서드의 실제 반환값과 관계없이 항상 `$value`가 반환됩니다. 예를 들어, Eloquent의 `update` 메서드는 보통 정수를 반환하지만, `tap`을 통해 항상 모델 인스턴스를 반환하게 만들 수 있습니다.

```
$user = tap($user)->update([
    'name' => $name,
    'email' => $email,
]);
```

클래스에 `tap` 메서드를 추가하려면, `Illuminate\Support\Traits\Tappable` 트레이트를 해당 클래스에 추가하면 됩니다. 이 트레이트의 `tap` 메서드는 유일한 인자로 클로저를 받고, 객체 인스턴스를 클로저로 전달한 후 자기 자신을 반환합니다.

```
return $user->tap(function (User $user) {
    // ...
});
```

<a name="method-throw-if"></a>
#### `throw_if()`

`throw_if` 함수는 주어진 불리언 표현식이 `true`이면 주어진 예외를 던집니다.

```
throw_if(! Auth::user()->isAdmin(), AuthorizationException::class);

throw_if(
    ! Auth::user()->isAdmin(),
    AuthorizationException::class,
    'You are not allowed to access this page.'
);
```

<a name="method-throw-unless"></a>
#### `throw_unless()`

`throw_unless` 함수는 주어진 불리언 표현식이 `false`이면 주어진 예외를 던집니다.

```
throw_unless(Auth::user()->isAdmin(), AuthorizationException::class);

throw_unless(
    Auth::user()->isAdmin(),
    AuthorizationException::class,
    'You are not allowed to access this page.'
);
```

<a name="method-today"></a>
#### `today()`

`today` 함수는 오늘 날짜를 나타내는 새로운 `Illuminate\Support\Carbon` 인스턴스를 생성합니다.

```
$today = today();
```

<a name="method-trait-uses-recursive"></a>
#### `trait_uses_recursive()`

`trait_uses_recursive` 함수는 지정한 트레이트가 사용하는 모든 트레이트 목록을 반환합니다.

```
$traits = trait_uses_recursive(\Illuminate\Notifications\Notifiable::class);
```

<a name="method-transform"></a>
#### `transform()`

`transform` 함수는 주어진 값이 [비어있지 않은 경우](#method-blank), 해당 값에 클로저를 실행하고, 그 결과를 반환합니다.

```
$callback = function (int $value) {
    return $value * 2;
};

$result = transform(5, $callback);

// 10
```

값이 비어있을 때 반환할 "기본값"이나 클로저를 세 번째 인자로 지정할 수도 있습니다. 이 값은 첫 번째 인자가 비어있을 때 대신 반환됩니다.

```
$result = transform(null, $callback, 'The value is blank');

// The value is blank
```

<a name="method-validator"></a>
#### `validator()`

`validator` 함수는 전달받은 인자들을 사용해 새로운 [유효성 검사기(validator)](/docs/11.x/validation) 인스턴스를 생성합니다. 이를 `Validator` 파사드의 대안으로 사용할 수 있습니다.

```
$validator = validator($data, $rules, $messages);
```

<a name="method-value"></a>
#### `value()`

`value` 함수는 주어진 값을 바로 반환합니다. 단, 클로저를 전달한 경우에는 해당 클로저를 실행해서 나온 결과를 반환합니다.

```
$result = value(true);

// true

$result = value(function () {
    return false;
});

// false
```

추가 인자를 넘길 경우, 첫 번째 인자가 클로저라면 이 추가 인자들이 클로저의 인수로 전달됩니다. 그렇지 않으면 무시됩니다.

```
$result = value(function (string $name) {
    return $name;
}, 'Taylor');

// 'Taylor'
```

<a name="method-view"></a>
#### `view()`

`view` 함수는 [뷰](/docs/11.x/views) 인스턴스를 반환합니다.

```
return view('auth.login');
```

<a name="method-with"></a>
#### `with()`

`with` 함수는 전달한 값을 반환합니다. 만약 두 번째 인자로 클로저가 전달되면, 해당 클로저를 실행하여 반환된 값을 반환합니다.

```
$callback = function (mixed $value) {
    return is_numeric($value) ? $value * 2 : 0;
};

$result = with(5, $callback);

// 10

$result = with(null, $callback);

// 0

$result = with(5, null);

// 5
```

<a name="method-when"></a>
#### `when()`

`when` 함수는 주어진 조건이 `true`일 때 전달한 값을 반환하고, 그렇지 않으면 `null`을 반환합니다. 두 번째 인자로 클로저를 넘기면, 해당 조건이 `true`일 때 클로저를 실행하여 나온 값을 반환합니다.

```
$value = when(true, 'Hello World');

$value = when(true, fn () => 'Hello World');
```

`when` 함수는 HTML 속성 등을 조건부로 렌더링해야 할 때 유용하게 사용할 수 있습니다.

```blade
<div {!! when($condition, 'wire:poll="calculate"') !!}>
    ...
</div>
```

<a name="other-utilities"></a>
## 기타 유틸리티

<a name="benchmarking"></a>
### 벤치마킹

애플리케이션의 특정 부분 성능을 빠르게 테스트하고 싶은 경우가 있습니다. 그럴 때에는 `Benchmark` 지원 클래스를 활용해 지정한 콜백이 완료되는 데 걸린 밀리초(ms) 시간을 측정할 수 있습니다.

```
<?php

use App\Models\User;
use Illuminate\Support\Benchmark;

Benchmark::dd(fn () => User::find(1)); // 0.1 ms

Benchmark::dd([
    '시나리오 1' => fn () => User::count(), // 0.5 ms
    '시나리오 2' => fn () => User::all()->count(), // 20.0 ms
]);
```

기본적으로 전달받은 콜백은 한 번(1회 반복) 실행되며, 그 소요 시간이 브라우저/콘솔에 표시됩니다.

콜백을 여러 번 실행하고 싶다면, 두 번째 인자로 반복 횟수를 지정하면 됩니다. 여러 번 실행하는 경우, `Benchmark` 클래스는 전체 반복 동안 콜백 실행에 걸린 평균 밀리초(ms) 시간을 반환합니다.

```
Benchmark::dd(fn () => User::count(), iterations: 10); // 0.5 ms
```

콜백 실행 시간을 측정하되, 콜백의 반환값도 함께 받고 싶다면, `value` 메서드를 사용하면 됩니다. 이 메서드는 콜백의 반환값과 실행에 걸린 밀리초 단위 시간을 튜플로 반환합니다.

```
[$count, $duration] = Benchmark::value(fn () => User::count());
```

<a name="dates"></a>
### 날짜

라라벨에는 [Carbon](https://carbon.nesbot.com/docs/)이라는 강력한 날짜 및 시간 처리 라이브러리가 기본 탑재되어 있습니다. 새로운 `Carbon` 인스턴스를 만들기 위해 `now` 함수를 사용할 수 있습니다. 이 함수는 라라벨 애플리케이션 전체에서 전역적으로 사용할 수 있습니다.

```php
$now = now();
```

또는 `Illuminate\Support\Carbon` 클래스를 직접 사용해 새 인스턴스를 만들 수 있습니다.

```php
use Illuminate\Support\Carbon;

$now = Carbon::now();
```

Carbon과 관련한 자세한 사용법은 [공식 Carbon 문서](https://carbon.nesbot.com/docs/)를 참고하시기 바랍니다.

<a name="deferred-functions"></a>
### 지연 함수(Deferred Functions)

> [!WARNING]
> 지연 함수(Deferred Functions)는 현재 베타 상태입니다. 커뮤니티 피드백을 받고 있습니다.

라라벨의 [큐 처리 작업(queued jobs)](/docs/11.x/queues)을 이용하면 작업을 백그라운드에서 실행할 수 있지만, 별도의 장기 실행 큐 워커를 구성·관리하지 않고 간단히 실행을 미루고 싶은 작업도 있을 수 있습니다.

지연 함수(Deferred functions)는 클로저 실행을 HTTP 응답이 사용자에게 보내진 후로 미루어, 애플리케이션이 더 빠르고 반응성 있게 느껴지도록 만들어 줍니다. 클로저를 `Illuminate\Support\defer` 함수로 감싸면 쉽게 실행을 늦출 수 있습니다.

```php
use App\Services\Metrics;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use function Illuminate\Support\defer;

Route::post('/orders', function (Request $request) {
    // 주문 생성...

    defer(fn () => Metrics::reportOrder($order));

    return $order;
});
```

기본적으로, 지연 함수는 `Illuminate\Support\defer`가 호출된 HTTP 응답, 아티즌 명령, 또는 큐 작업이 정상적으로 완료된 경우에만 실행됩니다. 즉, 요청이 `4xx`나 `5xx` HTTP 응답으로 종료되면 지연 함수는 실행되지 않습니다. 지연 함수가 항상 실행되도록 하려면, `always` 메서드를 사용하면 됩니다.

```php
defer(fn () => Metrics::reportOrder($order))->always();
```

<a name="cancelling-deferred-functions"></a>

#### 지연 함수 취소하기

지연 함수가 실행되기 전에 취소해야 할 필요가 있다면, `forget` 메서드를 사용하여 해당 함수의 이름으로 취소할 수 있습니다. 지연 함수에 이름을 지정하려면 `Illuminate\Support\defer` 함수에 두 번째 인수를 전달하면 됩니다.

```php
defer(fn () => Metrics::report(), 'reportMetrics');

defer()->forget('reportMetrics');
```

<a name="deferred-function-compatibility"></a>
#### 지연 함수 호환성

라라벨 10.x 애플리케이션에서 라라벨 11.x로 업그레이드했으며, 프로젝트 구조에 아직 `app/Http/Kernel.php` 파일이 남아 있다면, 커널의 `$middleware` 속성 맨 앞에 `InvokeDeferredCallbacks` 미들웨어를 추가해야 합니다.

```php
protected $middleware = [
    \Illuminate\Foundation\Http\Middleware\InvokeDeferredCallbacks::class, // [tl! add]
    \App\Http\Middleware\TrustProxies::class,
    // ...
];
```

<a name="disabling-deferred-functions-in-tests"></a>
#### 테스트에서 지연 함수 비활성화하기

테스트를 작성할 때, 지연 함수를 비활성화하는 것이 필요할 수 있습니다. 테스트 내에서 `withoutDefer`를 호출하면, 라라벨이 모든 지연 함수를 즉시 실행하도록 할 수 있습니다.

```php tab=Pest
test('without defer', function () {
    $this->withoutDefer();

    // ...
});
```

```php tab=PHPUnit
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_without_defer(): void
    {
        $this->withoutDefer();

        // ...
    }
}
```

테스트 케이스 내의 모든 테스트에서 지연 함수를 비활성화하고 싶다면, 기본 `TestCase` 클래스의 `setUp` 메서드에서 `withoutDefer` 메서드를 호출할 수 있습니다.

```php
<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void// [tl! add:start]
    {
        parent::setUp();

        $this->withoutDefer();
    }// [tl! add:end]
}
```

<a name="lottery"></a>
### Lottery

라라벨의 Lottery 클래스는 지정한 확률에 따라 콜백을 실행할 수 있게 해줍니다. 이는 들어오는 요청의 일부 비율에서만 특정 코드를 실행하고 싶을 때 유용하게 사용할 수 있습니다.

```
use Illuminate\Support\Lottery;

Lottery::odds(1, 20)
    ->winner(fn () => $user->won())
    ->loser(fn () => $user->lost())
    ->choose();
```

라라벨의 Lottery 클래스를 다른 라라벨 기능과 조합하여 사용할 수도 있습니다. 예를 들어, 느린 쿼리를 처리할 때 일부 사례만 익셉션 핸들러로 보고하도록 만들 수 있습니다. 또한 Lottery 클래스는 "호출 가능한 객체(callable)"이기 때문에, 콜러블을 받을 수 있는 모든 메서드에 인스턴스를 바로 전달할 수도 있습니다.

```
use Carbon\CarbonInterval;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Lottery;

DB::whenQueryingForLongerThan(
    CarbonInterval::seconds(2),
    Lottery::odds(1, 100)->winner(fn () => report('Querying > 2 seconds.')),
);
```

<a name="testing-lotteries"></a>
#### Lottery 테스트하기

라라벨에서는 Lottery 호출을 손쉽게 테스트할 수 있도록 간단한 메서드를 제공합니다.

```
// 항상 당첨...
Lottery::alwaysWin();

// 항상 꽝...
Lottery::alwaysLose();

// 한 번은 당첨, 다음은 꽝, 이후는 일반 동작...
Lottery::fix([true, false]);

// 일반 동작으로 복원...
Lottery::determineResultsNormally();
```

<a name="pipeline"></a>
### Pipeline

라라벨의 `Pipeline` 파사드는 주어진 입력값을 일련의 인보커블(호출 가능한) 클래스, 클로저, 콜러블을 통해 "파이프" 형태로 전달할 수 있는 편리한 방법을 제공합니다. 각 클래스는 입력값을 검사하거나 수정할 기회를 가지며, 이어서 파이프라인의 다음 콜러블을 호출하게 됩니다.

```php
use Closure;
use App\Models\User;
use Illuminate\Support\Facades\Pipeline;

$user = Pipeline::send($user)
    ->through([
        function (User $user, Closure $next) {
            // ...
    
            return $next($user);
        },
        function (User $user, Closure $next) {
            // ...
    
            return $next($user);
        },
    ])
    ->then(fn (User $user) => $user);
```

보시다시피, 파이프라인 안의 각 인보커블 클래스나 클로저에는 입력값과 `$next` 클로저가 전달됩니다. `$next` 클로저를 호출하면 파이프라인의 다음 콜러블이 이어서 실행됩니다. 이 구조는 [미들웨어](/docs/11.x/middleware)와 매우 유사합니다.

파이프라인의 마지막 콜러블에서 `$next` 클로저가 호출되면, `then` 메서드에 전달한 콜러블이 실행됩니다. 대개 이 콜러블은 전달받은 입력값을 그대로 반환하게 됩니다.

물론, 클로저뿐 아니라 인보커블 클래스를 파이프라인에 사용할 수도 있습니다. 클래스 이름을 전달하면, 해당 클래스가 라라벨의 [서비스 컨테이너](/docs/11.x/container)를 통해 인스턴스화되므로, 의존성 주입을 이용할 수 있습니다.

```php
$user = Pipeline::send($user)
    ->through([
        GenerateProfilePhoto::class,
        ActivateSubscription::class,
        SendWelcomeEmail::class,
    ])
    ->then(fn (User $user) => $user);
```

<a name="sleep"></a>
### Sleep

라라벨의 `Sleep` 클래스는 PHP의 내장 `sleep` 및 `usleep` 함수의 경량 래퍼로, 테스트의 용이성과 개발자 친화적 API를 제공합니다. 이를 통해 시간을 다루는 코드를 더 편하게 작성할 수 있습니다.

```
use Illuminate\Support\Sleep;

$waiting = true;

while ($waiting) {
    Sleep::for(1)->second();

    $waiting = /* ... */;
}
```

`Sleep` 클래스에는 다양한 시간 단위로 사용할 수 있는 여러 메서드가 준비되어 있습니다.

```
// 일정 시간 후 값 반환...
$result = Sleep::for(1)->second()->then(fn () => 1 + 1);

// 주어진 값이 true일 동안 sleep...
Sleep::for(1)->second()->while(fn () => shouldKeepSleeping());

// 90초 동안 일시정지...
Sleep::for(1.5)->minutes();

// 2초 동안 일시정지...
Sleep::for(2)->seconds();

// 500밀리초 동안 일시정지...
Sleep::for(500)->milliseconds();

// 5,000마이크로초 동안 일시정지...
Sleep::for(5000)->microseconds();

// 지정한 시각까지 일시정지...
Sleep::until(now()->addMinute());

// PHP 내장 sleep 함수의 별칭...
Sleep::sleep(2);

// PHP 내장 usleep 함수의 별칭...
Sleep::usleep(5000);
```

여러 시간 단위를 쉽게 조합하려면 `and` 메서드를 사용할 수 있습니다.

```
Sleep::for(1)->second()->and(10)->milliseconds();
```

<a name="testing-sleep"></a>
#### Sleep 테스트하기

`Sleep` 클래스나 PHP의 내장 sleep 함수를 사용하는 코드를 테스트할 때, 테스트가 실제로 일시정지되기 때문에 테스트 실행 속도가 느려질 수 있습니다. 예를 들어 아래와 같은 코드를 테스트한다고 가정해 봅시다.

```
$waiting = /* ... */;

$seconds = 1;

while ($waiting) {
    Sleep::for($seconds++)->seconds();

    $waiting = /* ... */;
}
```

이 코드를 일반적으로 테스트하면 최소 1초 이상이 걸릴 수 있습니다. 다행히 `Sleep` 클래스는 "sleep"을 가짜로 처리할 수 있어서 테스트 속도를 빠르게 유지할 수 있습니다.

```php tab=Pest
it('waits until ready', function () {
    Sleep::fake();

    // ...
});
```

```php tab=PHPUnit
public function test_it_waits_until_ready()
{
    Sleep::fake();

    // ...
}
```

`Sleep` 클래스를 가짜(faked)로 만들면, 실제 일시정지가 발생하지 않아 테스트 실행속도가 매우 빨라집니다.

`Sleep` 클래스를 가짜로 만든 후, 실제로 "sleep"이 호출됐는지에 대한 assertion도 할 수 있습니다. 예를 들어, 실행을 세 번 일시정지하고 각각 1초씩 시간이 늘어나는 코드를 테스트한다고 가정해 봅시다. `assertSequence` 메서드를 사용하면 우리 코드가 올바른 시간만큼 "sleep"했다는 것을 검증할 수 있습니다.

```php tab=Pest
it('checks if ready three times', function () {
    Sleep::fake();

    // ...

    Sleep::assertSequence([
        Sleep::for(1)->second(),
        Sleep::for(2)->seconds(),
        Sleep::for(3)->seconds(),
    ]);
}
```

```php tab=PHPUnit
public function test_it_checks_if_ready_three_times()
{
    Sleep::fake();

    // ...

    Sleep::assertSequence([
        Sleep::for(1)->second(),
        Sleep::for(2)->seconds(),
        Sleep::for(3)->seconds(),
    ]);
}
```

이 외에도 `Sleep` 클래스는 테스트 시 활용할 수 있는 다양한 assertion 메서드를 제공합니다.

```
use Carbon\CarbonInterval as Duration;
use Illuminate\Support\Sleep;

// sleep이 3회 호출됐는지 확인...
Sleep::assertSleptTimes(3);

// sleep의 지속 시간 검증...
Sleep::assertSlept(function (Duration $duration): bool {
    return /* ... */;
}, times: 1);

// Sleep 클래스가 한 번도 호출되지 않았는지 확인...
Sleep::assertNeverSlept();

// Sleep이 호출됐더라도 실제 일시정지는 없었는지 확인...
Sleep::assertInsomniac();
```

경우에 따라, 애플리케이션 코드에서 가짜 sleep이 발생할 때마다 추가 동작을 하고 싶을 수 있습니다. 이를 위해 `whenFakingSleep` 메서드에 콜백을 전달할 수 있습니다. 아래 예시에서는 라라벨의 [시간 조작 헬퍼](/docs/11.x/mocking#interacting-with-time)를 사용하여, sleep된 시간만큼 즉시 시간을 진행시킵니다.

```php
use Carbon\CarbonInterval as Duration;

$this->freezeTime();

Sleep::fake();

Sleep::whenFakingSleep(function (Duration $duration) {
    // 가짜 sleep 시 시간 진행...
    $this->travel($duration->totalMilliseconds)->milliseconds();
});
```

이처럼 시간 진행이 필요한 경우가 많기 때문에, `fake` 메서드의 `syncWithCarbon` 인자를 활용하면 test 내 sleep 동작 시 Carbon 시간과 자동으로 동기화할 수 있습니다.

```php
Sleep::fake(syncWithCarbon: true);

$start = now();

Sleep::for(1)->second();

$start->diffForHumans(); // 1초 전
```

라라벨은 내부적으로 실행 대기를 할 때 항상 `Sleep` 클래스를 사용합니다. 예를 들어 [`retry`](#method-retry) 헬퍼는 sleep 시 `Sleep` 클래스를 사용하게 되므로, 이 헬퍼를 쓸 때도 테스트의 유연성을 얻을 수 있습니다.

<a name="timebox"></a>
### Timebox

라라벨의 `Timebox` 클래스는 주어진 콜백이 실제 실행이 더 빨리 끝나더라도, 언제나 고정된 시간 동안 실행이 되도록 보장합니다. 암호화 작업이나 사용자 인증처럼, 실행 시간에 따른 민감 정보를 노출하지 않아야 하는 경우에 매우 유용합니다.

만약 실행 시간이 고정 시간(딜레이)보다 오래 걸리면, `Timebox` 는 아무런 영향을 미치지 않습니다. 최악의 실행 시간을 고려해 충분히 넉넉한 고정 시간을 직접 지정해야 합니다.

`call` 메서드는 클로저와 마이크로초 단위의 시간 제한을 받아서, 클로저를 호출한 뒤 시간 제한에 도달할 때까지 대기합니다.

```php
use Illuminate\Support\Timebox;

(new Timebox)->call(function ($timebox) {
    // ...
}, microseconds: 10000);
```

콜백 내에서 예외가 발생해도, Timebox는 지정한 대기 시간을 지켜준 후 예외를 다시 던집니다.