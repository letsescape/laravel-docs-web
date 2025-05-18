# 헬퍼 (Helpers)

- [소개](#introduction)
- [사용 가능한 메서드](#available-methods)
- [기타 유틸리티](#other-utilities)
    - [벤치마킹](#benchmarking)
    - [날짜](#dates)
    - [추첨](#lottery)
    - [파이프라인](#pipeline)
    - [일시 중지(Sleep)](#sleep)

<a name="introduction"></a>
## 소개

라라벨에는 다양한 형태의 전역 "헬퍼(helper)" PHP 함수들이 내장되어 있습니다. 이 함수들 중 상당수는 프레임워크 자체에서 사용되지만, 여러분도 프로젝트에서 편리하게 사용할 수 있습니다.

<a name="available-methods"></a>
## 사용 가능한 메서드

<a name="arrays-and-objects-method-list"></a>
### 배열 & 객체

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
[Arr::mapWithKeys](#method-array-map-with-keys)
[Arr::only](#method-array-only)
[Arr::pluck](#method-array-pluck)
[Arr::prepend](#method-array-prepend)
[Arr::prependKeysWith](#method-array-prependkeyswith)
[Arr::pull](#method-array-pull)
[Arr::query](#method-array-query)
[Arr::random](#method-array-random)
[Arr::set](#method-array-set)
[Arr::shuffle](#method-array-shuffle)
[Arr::sort](#method-array-sort)
[Arr::sortDesc](#method-array-sort-desc)
[Arr::sortRecursive](#method-array-sort-recursive)
[Arr::sortRecursiveDesc](#method-array-sort-recursive-desc)
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
[Number::fileSize](#method-number-file-size)
[Number::forHumans](#method-number-for-humans)
[Number::format](#method-number-format)
[Number::ordinal](#method-number-ordinal)
[Number::percentage](#method-number-percentage)
[Number::spell](#method-number-spell)
[Number::useLocale](#method-number-use-locale)
[Number::withLocale](#method-number-with-locale)

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
[logger](#method-logger)
[method_field](#method-method-field)
[now](#method-now)
[old](#method-old)
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

</div>

<a name="arrays"></a>
## 배열 & 객체

<a name="method-array-accessible"></a>
#### `Arr::accessible()`

`Arr::accessible` 메서드는 전달된 값이 배열로 접근 가능한지 확인합니다.

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

`Arr::add` 메서드는 배열에 지정한 키가 없거나 해당 키의 값이 `null`일 경우, 해당 키와 값을 배열에 추가합니다.

```
use Illuminate\Support\Arr;

$array = Arr::add(['name' => 'Desk'], 'price', 100);

// ['name' => 'Desk', 'price' => 100]

$array = Arr::add(['name' => 'Desk', 'price' => null], 'price', 100);

// ['name' => 'Desk', 'price' => 100]
```

<a name="method-array-collapse"></a>
#### `Arr::collapse()`

`Arr::collapse` 메서드는 여러 배열로 이루어진 배열을 하나의 배열로 납작하게 만듭니다.

```
use Illuminate\Support\Arr;

$array = Arr::collapse([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);

// [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

<a name="method-array-crossjoin"></a>
#### `Arr::crossJoin()`

`Arr::crossJoin` 메서드는 전달된 배열들로 데카르트 곱을 수행하여 가능한 모든 조합을 반환합니다.

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

`Arr::divide` 메서드는 전달된 배열의 키들만 모은 배열과 값들만 모은 배열, 이렇게 두 개의 배열을 반환합니다.

```
use Illuminate\Support\Arr;

[$keys, $values] = Arr::divide(['name' => 'Desk']);

// $keys: ['name']

// $values: ['Desk']
```

<a name="method-array-dot"></a>
#### `Arr::dot()`

`Arr::dot` 메서드는 여러 단계로 중첩된 배열을 "닷(dot)" 표기법을 사용하여 1차원 배열로 평탄화합니다.

```
use Illuminate\Support\Arr;

$array = ['products' => ['desk' => ['price' => 100]]];

$flattened = Arr::dot($array);

// ['products.desk.price' => 100]
```

<a name="method-array-except"></a>
#### `Arr::except()`

`Arr::except` 메서드는 전달한 키/값 쌍을 배열에서 제거합니다.

```
use Illuminate\Support\Arr;

$array = ['name' => 'Desk', 'price' => 100];

$filtered = Arr::except($array, ['price']);

// ['name' => 'Desk']
```

<a name="method-array-exists"></a>
#### `Arr::exists()`

`Arr::exists` 메서드는 주어진 배열에 특정 키가 존재하는지 확인합니다.

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

`Arr::first` 메서드는 배열 요소 중에서 제공된 콜백(조건 함수)을 통과하는 첫 번째 요소를 반환합니다.

```
use Illuminate\Support\Arr;

$array = [100, 200, 300];

$first = Arr::first($array, function (int $value, int $key) {
    return $value >= 150;
});

// 200
```

필요하다면 세 번째 인자로 기본 값을 지정할 수 있으며, 조건을 만족하는 값이 없을 때는 이 기본 값이 반환됩니다.

```
use Illuminate\Support\Arr;

$first = Arr::first($array, $callback, $default);
```

<a name="method-array-flatten"></a>
#### `Arr::flatten()`

`Arr::flatten` 메서드는 다차원 배열을 한 단계로 평탄화하여, 하나의 1차원 배열로 만듭니다.

```
use Illuminate\Support\Arr;

$array = ['name' => 'Joe', 'languages' => ['PHP', 'Ruby']];

$flattened = Arr::flatten($array);

// ['Joe', 'PHP', 'Ruby']
```

<a name="method-array-forget"></a>
#### `Arr::forget()`

`Arr::forget` 메서드는 깊게 중첩된 배열에서 "닷(dot)" 표기법을 사용해 특정 키/값 쌍을 제거합니다.

```
use Illuminate\Support\Arr;

$array = ['products' => ['desk' => ['price' => 100]]];

Arr::forget($array, 'products.desk');

// ['products' => []]
```

<a name="method-array-get"></a>
#### `Arr::get()`

`Arr::get` 메서드는 깊게 중첩된 배열에서 "닷(dot)" 표기법을 사용하여 값을 가져옵니다.

```
use Illuminate\Support\Arr;

$array = ['products' => ['desk' => ['price' => 100]]];

$price = Arr::get($array, 'products.desk.price');

// 100
```

또한, 지정한 키가 배열에 없으면 기본 값도 세 번째 인자로 지정하여 반환할 수 있습니다.

```
use Illuminate\Support\Arr;

$discount = Arr::get($array, 'products.desk.discount', 0);

// 0
```

<a name="method-array-has"></a>
#### `Arr::has()`

`Arr::has` 메서드는 "닷(dot)" 표기법을 사용해 배열에 원하는 항목 또는 여러 항목이 존재하는지 확인합니다.

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

`Arr::hasAny` 메서드는 "닷(dot)" 표기법으로 지정한 여러 항목 중 하나라도 배열에 존재하는지 확인합니다.

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

`Arr::isAssoc` 메서드는 전달된 배열이 연관 배열인지 확인하여, 연관 배열인 경우 `true`를 반환합니다. "연관 배열"이란 0부터 시작하는 순차적인 숫자 인덱스를 갖지 않는 배열을 의미합니다.

```
use Illuminate\Support\Arr;

$isAssoc = Arr::isAssoc(['product' => ['name' => 'Desk', 'price' => 100]]);

// true

$isAssoc = Arr::isAssoc([1, 2, 3]);

// false
```

<a name="method-array-islist"></a>
#### `Arr::isList()`

`Arr::isList` 메서드는 배열의 키가 0부터 시작하는 연속된 정수라면 `true`를 반환합니다.

```
use Illuminate\Support\Arr;

$isList = Arr::isList(['foo', 'bar', 'baz']);

// true

$isList = Arr::isList(['product' => ['name' => 'Desk', 'price' => 100]]);

// false
```

<a name="method-array-join"></a>
#### `Arr::join()`

`Arr::join` 메서드는 배열의 요소들을 문자열로 합쳐줍니다. 두 번째 인자로 기본 구분 문자를, 세 번째 인자로 마지막 요소 앞에 사용할 구분 문자를 지정할 수도 있습니다.

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

`Arr::keyBy` 메서드는 배열의 값을 특정 키의 값으로 묶어 새로운 배열을 만듭니다. 여러 항목에 같은 키가 있을 경우 마지막 항목만 새로운 배열에 남게 됩니다.

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

`Arr::last` 메서드는 배열 중에서 제공한 콜백(진리값 함수)을 만족하는 마지막 요소를 반환합니다.

```
use Illuminate\Support\Arr;

$array = [100, 200, 300, 110];

$last = Arr::last($array, function (int $value, int $key) {
    return $value >= 150;
});

// 300
```

필요하다면 세 번째 인자로 기본 값을 지정할 수 있으며, 조건을 만족하는 값이 없을 때는 이 기본 값이 반환됩니다.

```
use Illuminate\Support\Arr;

$last = Arr::last($array, $callback, $default);
```

<a name="method-array-map"></a>

#### `Arr::map()`

`Arr::map` 메서드는 배열을 반복(iterate)하면서 각 값과 키를 전달된 콜백에 넘겨줍니다. 콜백에서 반환된 값으로 배열의 값이 대체됩니다.

```
use Illuminate\Support\Arr;

$array = ['first' => 'james', 'last' => 'kirk'];

$mapped = Arr::map($array, function (string $value, string $key) {
    return ucfirst($value);
});

// ['first' => 'James', 'last' => 'Kirk']
```

<a name="method-array-map-with-keys"></a>
#### `Arr::mapWithKeys()`

`Arr::mapWithKeys` 메서드는 배열을 반복하면서 각 값을 전달된 콜백에 넘겨줍니다. 콜백은 한 쌍의 키/값을 포함하는 연관 배열(associative array)을 반환해야 합니다.

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

`Arr::only` 메서드는 전달된 배열에서 지정한 키/값 쌍만 반환합니다.

```
use Illuminate\Support\Arr;

$array = ['name' => 'Desk', 'price' => 100, 'orders' => 10];

$slice = Arr::only($array, ['name', 'price']);

// ['name' => 'Desk', 'price' => 100]
```

<a name="method-array-pluck"></a>
#### `Arr::pluck()`

`Arr::pluck` 메서드는 배열에서 지정한 키의 모든 값을 가져옵니다.

```
use Illuminate\Support\Arr;

$array = [
    ['developer' => ['id' => 1, 'name' => 'Taylor']],
    ['developer' => ['id' => 2, 'name' => 'Abigail']],
];

$names = Arr::pluck($array, 'developer.name');

// ['Taylor', 'Abigail']
```

원하는 경우 결과 리스트의 키를 어떻게 할지 지정할 수도 있습니다.

```
use Illuminate\Support\Arr;

$names = Arr::pluck($array, 'developer.name', 'developer.id');

// [1 => 'Taylor', 2 => 'Abigail']
```

<a name="method-array-prepend"></a>
#### `Arr::prepend()`

`Arr::prepend` 메서드는 배열의 맨 앞에 항목을 추가합니다.

```
use Illuminate\Support\Arr;

$array = ['one', 'two', 'three', 'four'];

$array = Arr::prepend($array, 'zero');

// ['zero', 'one', 'two', 'three', 'four']
```

필요하다면 추가된 값에 사용할 키를 지정할 수도 있습니다.

```
use Illuminate\Support\Arr;

$array = ['price' => 100];

$array = Arr::prepend($array, 'Desk', 'name');

// ['name' => 'Desk', 'price' => 100]
```

<a name="method-array-prependkeyswith"></a>
#### `Arr::prependKeysWith()`

`Arr::prependKeysWith` 메서드는 연관 배열의 모든 키 이름에 지정한 접두사를 붙여 반환합니다.

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

`Arr::pull` 메서드는 지정한 키의 값(키/값 쌍)을 배열에서 가져오고, 해당 항목을 배열에서 제거합니다.

```
use Illuminate\Support\Arr;

$array = ['name' => 'Desk', 'price' => 100];

$name = Arr::pull($array, 'name');

// $name: Desk

// $array: ['price' => 100]
```

키가 존재하지 않을 경우 반환할 기본값을 세 번째 인수로 전달할 수 있습니다. 키가 없을 경우 이 값이 반환됩니다.

```
use Illuminate\Support\Arr;

$value = Arr::pull($array, $key, $default);
```

<a name="method-array-query"></a>
#### `Arr::query()`

`Arr::query` 메서드는 배열을 쿼리 스트링(query string) 형태로 변환합니다.

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

// 4 - (임의로 반환된 값)
```

또한, 두 번째 인수로 반환할 항목의 개수를 지정할 수도 있습니다. 이 인수를 지정하면 한 개만 반환하더라도 항상 배열로 반환합니다.

```
use Illuminate\Support\Arr;

$items = Arr::random($array, 2);

// [2, 5] - (임의로 반환된 값)
```

<a name="method-array-set"></a>
#### `Arr::set()`

`Arr::set` 메서드는 "닷(dot) 표기법"을 사용하여 다차원 배열 안의 값을 설정합니다.

```
use Illuminate\Support\Arr;

$array = ['products' => ['desk' => ['price' => 100]]];

Arr::set($array, 'products.desk.price', 200);

// ['products' => ['desk' => ['price' => 200]]]
```

<a name="method-array-shuffle"></a>
#### `Arr::shuffle()`

`Arr::shuffle` 메서드는 배열 안의 항목들을 임의의 순서로 섞어서 반환합니다.

```
use Illuminate\Support\Arr;

$array = Arr::shuffle([1, 2, 3, 4, 5]);

// [3, 2, 5, 1, 4] - (임의로 섞인 결과)
```

<a name="method-array-sort"></a>
#### `Arr::sort()`

`Arr::sort` 메서드는 배열을 값 기준으로 정렬합니다.

```
use Illuminate\Support\Arr;

$array = ['Desk', 'Table', 'Chair'];

$sorted = Arr::sort($array);

// ['Chair', 'Desk', 'Table']
```

지정한 클로저의 반환값을 기준으로 정렬할 수도 있습니다.

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

`Arr::sortDesc` 메서드는 배열을 값 기준으로 내림차순 정렬합니다.

```
use Illuminate\Support\Arr;

$array = ['Desk', 'Table', 'Chair'];

$sorted = Arr::sortDesc($array);

// ['Table', 'Desk', 'Chair']
```

정렬 기준으로 사용할 클로저를 전달할 수도 있습니다.

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

`Arr::sortRecursive` 메서드는 배열에 대해 재귀적으로 정렬을 수행합니다. 숫자 인덱스 배열은 `sort` 함수로, 연관 배열은 `ksort` 함수로 정렬합니다.

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

결과를 내림차순으로 정렬하려면 `Arr::sortRecursiveDesc` 메서드를 사용할 수 있습니다.

```
$sorted = Arr::sortRecursiveDesc($array);
```

<a name="method-array-take"></a>
#### `Arr::take()`

`Arr::take` 메서드는 지정한 개수만큼의 항목을 포함하는 새 배열을 반환합니다.

```
use Illuminate\Support\Arr;

$array = [0, 1, 2, 3, 4, 5];

$chunk = Arr::take($array, 3);

// [0, 1, 2]
```

음수 정수를 전달하면 배열 끝에서부터 그만큼의 항목이 반환됩니다.

```
$array = [0, 1, 2, 3, 4, 5];

$chunk = Arr::take($array, -2);

// [4, 5]
```

<a name="method-array-to-css-classes"></a>
#### `Arr::toCssClasses()`

`Arr::toCssClasses` 메서드는 조건에 따라 CSS 클래스 문자열을 동적으로 조합해 반환합니다. 이 메서드는 배열로 클래스를 받아들이며, 배열의 키는 추가할 클래스(여러 개 가능)를, 값은 불리언 표현식입니다. 만약 배열 요소의 키가 숫자라면, 해당 항목은 언제나 최종 클래스 리스트에 포함됩니다.

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

`Arr::toCssStyles` 메서드는 조건에 따라 CSS 스타일 문자열을 동적으로 조합합니다. 이 메서드 역시 배열로 스타일을 받아들이며, 배열의 키는 추가할 스타일(여러 개 가능)을, 값은 불리언 표현식입니다. 만약 배열 요소의 키가 숫자라면, 해당 항목은 언제나 최종 스타일 리스트에 포함됩니다.

```php
use Illuminate\Support\Arr;

$hasColor = true;

$array = ['background-color: blue', 'color: blue' => $hasColor];

$classes = Arr::toCssStyles($array);

/*
    'background-color: blue; color: blue;'
*/
```

이 메서드는 라라벨의 [Blade 컴포넌트의 attribute bag에서 클래스 병합](/docs/10.x/blade#conditionally-merge-classes) 기능과 `@class` [Blade 지시어](/docs/10.x/blade#conditional-classes) 내부적으로도 사용됩니다.

<a name="method-array-undot"></a>
#### `Arr::undot()`

`Arr::undot` 메서드는 "닷(dot) 표기법"으로 작성된 1차원 배열을 다차원 배열로 확장합니다.

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

`Arr::where` 메서드는 전달된 클로저를 사용해서 배열을 필터링합니다.

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

`Arr::whereNotNull` 메서드는 전달된 배열에서 `null` 값을 가진 항목을 모두 제거합니다.

```
use Illuminate\Support\Arr;

$array = [0, null];

$filtered = Arr::whereNotNull($array);

// [0 => 0]
```

<a name="method-array-wrap"></a>
#### `Arr::wrap()`

`Arr::wrap` 메서드는 전달된 값을 배열로 감싸서 반환합니다. 만약 이미 배열이라면 원본 배열을 그대로 반환합니다.

```
use Illuminate\Support\Arr;

$string = 'Laravel';

$array = Arr::wrap($string);

// ['Laravel']
```

전달한 값이 `null`인 경우, 빈 배열이 반환됩니다.

```
use Illuminate\Support\Arr;

$array = Arr::wrap(null);

// []
```

<a name="method-data-fill"></a>
#### `data_fill()`

`data_fill` 함수는 "닷(dot) 표기법"을 사용하여 중첩된 배열이나 객체 안에 값이 없는 위치에 새 값을 설정합니다.

```
$data = ['products' => ['desk' => ['price' => 100]]];

data_fill($data, 'products.desk.price', 200);

// ['products' => ['desk' => ['price' => 100]]]

data_fill($data, 'products.desk.discount', 10);

// ['products' => ['desk' => ['price' => 100, 'discount' => 10]]]
```

이 함수는 와일드카드(`*`) 기호도 사용할 수 있으며, 해당 위치에 모두 값을 채워줍니다.

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

`data_get` 함수는 "닷(dot) 표기법"을 사용하여 중첩된 배열이나 객체에서 값을 가져옵니다.

```
$data = ['products' => ['desk' => ['price' => 100]]];

$price = data_get($data, 'products.desk.price');

// 100
```

`data_get` 함수는 기본값도 지정할 수 있으며, 지정한 키가 없을 경우 해당 기본값을 반환합니다.

```
$discount = data_get($data, 'products.desk.discount', 0);

// 0
```

이 함수 역시 와일드카드(`*`)를 사용할 수 있어, 배열이나 객체의 어느 키에 대해서도 값을 가져올 수 있습니다.

```
$data = [
    'product-one' => ['name' => 'Desk 1', 'price' => 100],
    'product-two' => ['name' => 'Desk 2', 'price' => 150],
];

data_get($data, '*.name');

// ['Desk 1', 'Desk 2'];
```

<a name="method-data-set"></a>

#### `data_set()`

`data_set` 함수는 "닷(dot) 표기법"을 사용하여 중첩된 배열이나 객체 내의 값을 설정합니다.

```
$data = ['products' => ['desk' => ['price' => 100]]];

data_set($data, 'products.desk.price', 200);

// ['products' => ['desk' => ['price' => 200]]]
```

이 함수는 또한 별표(*)를 이용한 와일드카드를 지원하며, 대상 데이터에서 해당 위치에 맞게 값을 설정할 수 있습니다.

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

기본적으로 기존 값은 덮어씁니다. 값이 존재하지 않을 때만 설정하고 싶다면, 네 번째 인수로 `false`를 전달하면 됩니다.

```
$data = ['products' => ['desk' => ['price' => 100]]];

data_set($data, 'products.desk.price', 200, overwrite: false);

// ['products' => ['desk' => ['price' => 100]]]
```

<a name="method-data-forget"></a>
#### `data_forget()`

`data_forget` 함수는 "닷(dot) 표기법"을 사용하여 중첩된 배열이나 객체 내의 값을 제거합니다.

```
$data = ['products' => ['desk' => ['price' => 100]]];

data_forget($data, 'products.desk.price');

// ['products' => ['desk' => []]]
```

이 함수 역시 별표(*)를 이용한 와일드카드를 지원하며, 대상 데이터에서 해당 위치에 맞게 값을 제거할 수 있습니다.

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

`head` 함수는 주어진 배열에서 첫 번째 요소를 반환합니다.

```
$array = [100, 200, 300];

$first = head($array);

// 100
```

<a name="method-last"></a>
#### `last()`

`last` 함수는 주어진 배열에서 마지막 요소를 반환합니다.

```
$array = [100, 200, 300];

$last = last($array);

// 300
```

<a name="numbers"></a>
## 숫자(Number)

<a name="method-number-abbreviate"></a>
#### `Number::abbreviate()`

`Number::abbreviate` 메서드는 전달된 숫자 값을 단위 약어와 함께 사람이 읽기 쉬운 형식으로 반환합니다.

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

`Number::clamp` 메서드는 주어진 수가 지정한 범위 안에 있도록 보장합니다. 숫자가 최솟값보다 작으면 그 최솟값을, 최댓값보다 크면 그 최댓값을 반환합니다.

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

`Number::currency` 메서드는 주어진 값을 통화 형식의 문자열로 반환합니다.

```
use Illuminate\Support\Number;

$currency = Number::currency(1000);

// $1,000

$currency = Number::currency(1000, in: 'EUR');

// €1,000

$currency = Number::currency(1000, in: 'EUR', locale: 'de');

// 1.000 €
```

<a name="method-number-file-size"></a>
#### `Number::fileSize()`

`Number::fileSize` 메서드는 주어진 바이트(byte) 값을 파일 크기 형식의 문자열로 반환합니다.

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

`Number::forHumans` 메서드는 전달된 숫자 값을 사람이 읽기 쉬운 형식으로 반환합니다.

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

`Number::format` 메서드는 전달된 숫자를 로케일(locale)에 맞는 형식의 문자열로 변환합니다.

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

`Number::ordinal` 메서드는 숫자에 서수(순서를 나타내는 형태)를 붙인 결과를 반환합니다.

```
use Illuminate\Support\Number;

$number = Number::ordinal(1);

// 1st

$number = Number::ordinal(2);

// 2nd

$number = Number::ordinal(21);

// 21st
```

<a name="method-number-percentage"></a>
#### `Number::percentage()`

`Number::percentage` 메서드는 주어진 값을 퍼센트(%) 형식의 문자열로 반환합니다.

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

`Number::spell` 메서드는 주어진 숫자를 단어(영어 등 텍스트)로 변환합니다.

```
use Illuminate\Support\Number;

$number = Number::spell(102);

// one hundred and two

$number = Number::spell(88, locale: 'fr');

// quatre-vingt-huit
```

`after` 인수를 사용하면, 해당 값보다 큰 숫자만 단어로 변환하도록 지정할 수 있습니다.

```
$number = Number::spell(10, after: 10);

// 10

$number = Number::spell(11, after: 10);

// eleven
```

`until` 인수를 사용하면, 해당 값보다 작은 숫자만 단어로 변환하도록 지정할 수 있습니다.

```
$number = Number::spell(5, until: 10);

// five

$number = Number::spell(10, until: 10);

// 10
```

<a name="method-number-use-locale"></a>
#### `Number::useLocale()`

`Number::useLocale` 메서드는 기본 숫자 로케일(locale)을 전역적으로 설정합니다. 이후 `Number` 클래스의 숫자 및 통화 관련 메서드에서 이 설정을 사용합니다.

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

`Number::withLocale` 메서드는 지정한 로케일(locale)로 클로저를 실행한 후, 콜백 실행이 끝나면 원래의 로케일로 되돌립니다.

```
use Illuminate\Support\Number;

$number = Number::withLocale('de', function () {
    return Number::format(1500);
});
```

<a name="paths"></a>
## 경로(Paths)

<a name="method-app-path"></a>
#### `app_path()`

`app_path` 함수는 애플리케이션의 `app` 디렉터리에 대한 전체 경로를 반환합니다. 또한, `app_path` 함수에 상대 파일 경로를 전달하면, 해당 파일의 전체 경로를 생성할 수도 있습니다.

```
$path = app_path();

$path = app_path('Http/Controllers/Controller.php');
```

<a name="method-base-path"></a>
#### `base_path()`

`base_path` 함수는 애플리케이션의 루트 디렉터리에 대한 전체 경로를 반환합니다. 마찬가지로, `base_path` 함수에 특정 파일 경로를 전달하면 프로젝트 루트에 대한 전체 경로를 생성할 수 있습니다.

```
$path = base_path();

$path = base_path('vendor/bin');
```

<a name="method-config-path"></a>
#### `config_path()`

`config_path` 함수는 애플리케이션의 `config` 디렉터리에 대한 전체 경로를 반환합니다. 특정 파일명을 인수로 전달하면, 해당 설정 파일의 전체 경로를 쉽게 얻을 수 있습니다.

```
$path = config_path();

$path = config_path('app.php');
```

<a name="method-database-path"></a>
#### `database_path()`

`database_path` 함수는 애플리케이션의 `database` 디렉터리에 대한 전체 경로를 반환합니다. 특정 파일을 지정하여 데이터베이스 디렉터리 내 경로도 생성할 수 있습니다.

```
$path = database_path();

$path = database_path('factories/UserFactory.php');
```

<a name="method-lang-path"></a>
#### `lang_path()`

`lang_path` 함수는 애플리케이션의 `lang` 디렉터리에 대한 전체 경로를 반환합니다. 또한, 디렉터리 내 특정 파일 경로도 쉽게 생성할 수 있습니다.

```
$path = lang_path();

$path = lang_path('en/messages.php');
```

> [!NOTE]
> 기본적으로 Laravel 애플리케이션 스캐폴딩에는 `lang` 디렉터리가 포함돼 있지 않습니다. Laravel의 언어 파일을 커스터마이즈하고 싶다면, `lang:publish` Artisan 명령어를 통해 배포할 수 있습니다.

<a name="method-mix"></a>
#### `mix()`

`mix` 함수는 [버전이 적용된 Mix 파일](/docs/10.x/mix)의 경로를 반환합니다.

```
$path = mix('css/app.css');
```

<a name="method-public-path"></a>
#### `public_path()`

`public_path` 함수는 애플리케이션의 `public` 디렉터리에 대한 전체 경로를 반환합니다. 특정 파일명을 인수로 전달하면, 해당 파일의 전체 경로도 반환할 수 있습니다.

```
$path = public_path();

$path = public_path('css/app.css');
```

<a name="method-resource-path"></a>
#### `resource_path()`

`resource_path` 함수는 애플리케이션의 `resources` 디렉터리에 대한 전체 경로를 반환합니다. 또한, 디렉터리 내 특정 파일 경로도 쉽게 얻을 수 있습니다.

```
$path = resource_path();

$path = resource_path('sass/app.scss');
```

<a name="method-storage-path"></a>
#### `storage_path()`

`storage_path` 함수는 애플리케이션의 `storage` 디렉터리에 대한 전체 경로를 반환합니다. 저장소 디렉터리 내 특정 파일 경로 역시 생성할 수 있습니다.

```
$path = storage_path();

$path = storage_path('app/file.txt');
```

<a name="urls"></a>
## URL

<a name="method-action"></a>
#### `action()`

`action` 함수는 특정 컨트롤러 액션에 대한 URL을 생성합니다.

```
use App\Http\Controllers\HomeController;

$url = action([HomeController::class, 'index']);
```

만약 해당 메서드(액션)가 라우트 파라미터를 받는 경우, 두 번째 인수로 파라미터 배열을 전달할 수 있습니다.

```
$url = action([UserController::class, 'profile'], ['id' => 1]);
```

<a name="method-asset"></a>
#### `asset()`

`asset` 함수는 현재 요청의 스킴(HTTP 또는 HTTPS)에 따라, 애플리케이션의 에셋에 대한 URL을 생성합니다.

```
$url = asset('img/photo.jpg');
```

`.env` 파일의 `ASSET_URL` 변수로 에셋 URL 호스트를 지정할 수 있습니다. 외부 서비스(예: Amazon S3, CDN 등)에 에셋을 호스팅할 경우에 유용하게 사용할 수 있습니다.

```
// ASSET_URL=http://example.com/assets

$url = asset('img/photo.jpg'); // http://example.com/assets/img/photo.jpg
```

<a name="method-route"></a>
#### `route()`

`route` 함수는 지정한 [이름이 있는 라우트](/docs/10.x/routing#named-routes)에 대해 URL을 생성합니다.

```
$url = route('route.name');
```

만약 해당 라우트가 파라미터를 받는다면, 두 번째 인수로 파라미터 배열을 전달할 수 있습니다.

```
$url = route('route.name', ['id' => 1]);
```

기본적으로 `route` 함수는 절대 URL을 생성합니다. 상대 URL을 생성하고 싶다면, 세 번째 인수로 `false`를 전달하세요.

```
$url = route('route.name', ['id' => 1], false);
```

<a name="method-secure-asset"></a>
#### `secure_asset()`

`secure_asset` 함수는 HTTPS를 사용하여 에셋에 대한 URL을 생성합니다.

```
$url = secure_asset('img/photo.jpg');
```

<a name="method-secure-url"></a>
#### `secure_url()`

`secure_url` 함수는 주어진 경로에 대해 완전한(fully qualified) HTTPS URL을 생성합니다. 추가적인 URL 세그먼트를 두 번째 인수로 전달할 수도 있습니다.

```
$url = secure_url('user/profile');

$url = secure_url('user/profile', [1]);
```

<a name="method-to-route"></a>
#### `to_route()`

`to_route` 함수는 지정한 [이름이 있는 라우트](/docs/10.x/routing#named-routes)에 대해 [리다이렉트 HTTP 응답](/docs/10.x/responses#redirects)을 생성합니다.

```
return to_route('users.show', ['user' => 1]);
```

필요하다면 세 번째, 네 번째 인수로 리다이렉트 시에 사용할 HTTP 상태 코드와 추가적인 응답 헤더를 전달할 수 있습니다.

```
return to_route('users.show', ['user' => 1], 302, ['X-Framework' => 'Laravel']);
```

<a name="method-url"></a>
#### `url()`

`url` 함수는 주어진 경로에 대해 완전한(fully qualified) URL을 생성합니다.

```
$url = url('user/profile');

$url = url('user/profile', [1]);
```

만약 경로를 전달하지 않으면, `Illuminate\Routing\UrlGenerator` 인스턴스를 반환합니다.

```
$current = url()->current();

$full = url()->full();

$previous = url()->previous();
```

<a name="miscellaneous"></a>

## 기타(Miscellaneous)

<a name="method-abort"></a>
#### `abort()`

`abort` 함수는 [HTTP 예외](/docs/10.x/errors#http-exceptions)를 발생시키며, 이 예외는 [예외 핸들러](/docs/10.x/errors#the-exception-handler)에 의해 렌더링됩니다.

```
abort(403);
```

예외의 메시지와 브라우저로 전송할 커스텀 HTTP 응답 헤더도 추가로 지정할 수 있습니다.

```
abort(403, 'Unauthorized.', $headers);
```

<a name="method-abort-if"></a>
#### `abort_if()`

`abort_if` 함수는 주어진 불리언 표현식이 `true`로 평가되면 HTTP 예외를 발생시킵니다.

```
abort_if(! Auth::user()->isAdmin(), 403);
```

`abort` 메서드와 마찬가지로, 세 번째 인자로 예외의 응답 메시지 텍스트를, 네 번째 인자로는 커스텀 응답 헤더의 배열을 전달할 수 있습니다.

<a name="method-abort-unless"></a>
#### `abort_unless()`

`abort_unless` 함수는 주어진 불리언 표현식이 `false`로 평가되면 HTTP 예외를 발생시킵니다.

```
abort_unless(Auth::user()->isAdmin(), 403);
```

`abort` 메서드와 동일하게, 세 번째 인자로는 예외 응답 텍스트를, 네 번째 인자로는 커스텀 응답 헤더 배열을 전달할 수 있습니다.

<a name="method-app"></a>
#### `app()`

`app` 함수는 [서비스 컨테이너](/docs/10.x/container) 인스턴스를 반환합니다.

```
$container = app();
```

클래스나 인터페이스명을 전달하면 컨테이너에서 해당 인스턴스를 해결하여 반환합니다.

```
$api = app('HelpSpot\API');
```

<a name="method-auth"></a>
#### `auth()`

`auth` 함수는 [인증기](/docs/10.x/authentication) 인스턴스를 반환합니다. 이 함수는 `Auth` 파사드를 대체하여 사용할 수 있습니다.

```
$user = auth()->user();
```

필요에 따라 접근하고자 하는 가드 인스턴스를 지정할 수도 있습니다.

```
$user = auth('admin')->user();
```

<a name="method-back"></a>
#### `back()`

`back` 함수는 사용자의 이전 위치로 [리디렉션 HTTP 응답](/docs/10.x/responses#redirects)을 생성합니다.

```
return back($status = 302, $headers = [], $fallback = '/');

return back();
```

<a name="method-bcrypt"></a>
#### `bcrypt()`

`bcrypt` 함수는 [주어진 값을 Bcrypt로 해시](/docs/10.x/hashing)합니다. 이 함수는 `Hash` 파사드의 대체로 사용할 수 있습니다.

```
$password = bcrypt('my-secret-password');
```

<a name="method-blank"></a>
#### `blank()`

`blank` 함수는 주어진 값이 "비어 있는지"를 판단합니다.

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

`blank`의 반대 동작을 하려면 [`filled`](#method-filled) 메서드를 참고하세요.

<a name="method-broadcast"></a>
#### `broadcast()`

`broadcast` 함수는 주어진 [이벤트](/docs/10.x/events)를 리스너들에게 [브로드캐스트](/docs/10.x/broadcasting)합니다.

```
broadcast(new UserRegistered($user));

broadcast(new UserRegistered($user))->toOthers();
```

<a name="method-cache"></a>
#### `cache()`

`cache` 함수는 [캐시](/docs/10.x/cache)에서 값을 조회할 때 사용할 수 있습니다. 만약 주어진 키가 캐시에 존재하지 않으면, 선택적으로 지정한 기본값이 반환됩니다.

```
$value = cache('key');

$value = cache('key', 'default');
```

키/값 쌍의 배열을 함수에 전달하여 캐시에 항목을 추가할 수 있습니다. 이때 캐시 값의 유효 시간을(초 단위 또는 기간 객체로) 함께 전달해야 합니다.

```
cache(['key' => 'value'], 300);

cache(['key' => 'value'], now()->addSeconds(10));
```

<a name="method-class-uses-recursive"></a>
#### `class_uses_recursive()`

`class_uses_recursive` 함수는 해당 클래스에서 사용된 모든 트레잇(trait)을 반환하며, 부모 클래스에서 사용된 트레잇도 모두 포함합니다.

```
$traits = class_uses_recursive(App\Models\User::class);
```

<a name="method-collect"></a>
#### `collect()`

`collect` 함수는 주어진 값으로부터 [컬렉션](/docs/10.x/collections) 인스턴스를 생성합니다.

```
$collection = collect(['taylor', 'abigail']);
```

<a name="method-config"></a>
#### `config()`

`config` 함수는 [설정](/docs/10.x/configuration) 변수의 값을 가져옵니다. 설정값은 "점(dot) 표기법"을 사용하여 접근할 수 있습니다. 즉, 파일명과 옵션명을 조합해 접근하며, 두 번째 인자로 기본값을 지정할 수 있습니다. 만약 설정 옵션이 존재하지 않는 경우 지정한 기본값이 반환됩니다.

```
$value = config('app.timezone');

$value = config('app.timezone', $default);
```

동작 중에 키/값 쌍의 배열을 전달하면 설정 값을 변경할 수도 있습니다. 단, 이 함수로 설정을 변경해도 실제 설정 파일은 변경되지 않으며, 현재 요청에 한해서만 값이 반영됩니다.

```
config(['app.debug' => true]);
```

<a name="method-cookie"></a>
#### `cookie()`

`cookie` 함수는 새로운 [쿠키](/docs/10.x/requests#cookies) 인스턴스를 생성합니다.

```
$cookie = cookie('name', 'value', $minutes);
```

<a name="method-csrf-field"></a>
#### `csrf_field()`

`csrf_field` 함수는 현재 CSRF 토큰 값을 담고 있는 HTML `hidden` 타입의 입력 필드를 생성합니다. 예를 들어, [Blade 문법](/docs/10.x/blade)에서 다음과 같이 사용할 수 있습니다.

```
{{ csrf_field() }}
```

<a name="method-csrf-token"></a>
#### `csrf_token()`

`csrf_token` 함수는 현재 CSRF 토큰의 값을 가져옵니다.

```
$token = csrf_token();
```

<a name="method-decrypt"></a>
#### `decrypt()`

`decrypt` 함수는 [주어진 값을 복호화](/docs/10.x/encryption)합니다. 이 함수는 `Crypt` 파사드의 대체로 사용할 수 있습니다.

```
$password = decrypt($value);
```

<a name="method-dd"></a>
#### `dd()`

`dd` 함수는 주어진 변수들을 덤프(dump)하고 스크립트 실행을 즉시 중단합니다.

```
dd($value);

dd($value1, $value2, $value3, ...);
```

스크립트 실행을 중단하지 않고 변수만 출력하고 싶다면 [`dump`](#method-dump) 함수를 사용하세요.

<a name="method-dispatch"></a>
#### `dispatch()`

`dispatch` 함수는 주어진 [잡(job)](/docs/10.x/queues#creating-jobs)을 라라벨의 [잡 큐](/docs/10.x/queues)에 푸시합니다.

```
dispatch(new App\Jobs\SendEmails);
```

<a name="method-dispatch-sync"></a>
#### `dispatch_sync()`

`dispatch_sync` 함수는 주어진 잡을 [동기(sync)](/docs/10.x/queues#synchronous-dispatching) 큐에 푸시하여 즉시 처리합니다.

```
dispatch_sync(new App\Jobs\SendEmails);
```

<a name="method-dump"></a>
#### `dump()`

`dump` 함수는 주어진 변수들을 덤프(dump)합니다.

```
dump($value);

dump($value1, $value2, $value3, ...);
```

변수를 출력한 후 즉시 실행을 중단하고 싶으면 [`dd`](#method-dd) 함수를 사용하세요.

<a name="method-encrypt"></a>
#### `encrypt()`

`encrypt` 함수는 [주어진 값을 암호화](/docs/10.x/encryption)합니다. 이 함수는 `Crypt` 파사드의 대체로 사용할 수 있습니다.

```
$secret = encrypt('my-secret-value');
```

<a name="method-env"></a>
#### `env()`

`env` 함수는 [환경변수](/docs/10.x/configuration#environment-configuration)의 값을 조회하거나, 지정한 기본값을 반환합니다.

```
$env = env('APP_ENV');

$env = env('APP_ENV', 'production');
```

> [!WARNING]
> 배포 과정 중 `config:cache` 명령어를 실행하는 경우, 반드시 `env` 함수를 설정 파일 내에서만 호출해야 합니다. 설정이 캐시된 이후에는 `.env` 파일이 더 이상 불러와지지 않으며, `env` 함수의 모든 호출이 `null`을 반환하게 됩니다.

<a name="method-event"></a>
#### `event()`

`event` 함수는 주어진 [이벤트](/docs/10.x/events)를 해당 리스너들에게 디스패치(dispatch)합니다.

```
event(new UserRegistered($user));
```

<a name="method-fake"></a>
#### `fake()`

`fake` 함수는 컨테이너에서 [Faker](https://github.com/FakerPHP/Faker) 싱글톤 인스턴스를 가져옵니다. 이 함수는 모델 팩토리(factory), 데이터베이스 시더(seeding), 테스트, 프로토타입용 뷰 등에서 더미 데이터를 생성할 때 유용하게 사용할 수 있습니다.

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

기본적으로 `fake` 함수는 `config/app.php` 설정 파일의 `app.faker_locale` 옵션을 따릅니다. 하지만 원하는 로케일(locale)을 직접 전달해 사용할 수도 있습니다. 각각의 로케일은 개별 싱글톤 인스턴스로 관리됩니다.

```
fake('nl_NL')->name()
```

<a name="method-filled"></a>
#### `filled()`

`filled` 함수는 주어진 값이 "비어 있지 않은지"를 확인합니다.

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

`filled`의 반대 동작을 하고 싶을 때는 [`blank`](#method-blank) 메서드를 참고하세요.

<a name="method-info"></a>
#### `info()`

`info` 함수는 애플리케이션의 [로그](/docs/10.x/logging)에 정보를 기록합니다.

```
info('Some helpful information!');
```

컨텍스트 데이터의 배열을 추가적으로 전달할 수도 있습니다.

```
info('User login attempt failed.', ['id' => $user->id]);
```

<a name="method-logger"></a>
#### `logger()`

`logger` 함수는 [로그](/docs/10.x/logging)에 `debug` 레벨의 메시지를 작성할 때 사용할 수 있습니다.

```
logger('Debug message');
```

컨텍스트 데이터의 배열을 인자로 전달할 수도 있습니다.

```
logger('User has logged in.', ['id' => $user->id]);
```

아무런 값을 전달하지 않고 호출하면 [로거 객체](/docs/10.x/errors#logging) 인스턴스를 반환합니다.

```
logger()->error('You are not allowed here.');
```

<a name="method-method-field"></a>
#### `method_field()`

`method_field` 함수는 폼의 HTTP 메서드를 스푸핑(가짜로 설정)하기 위해 사용되는 값으로, HTML `hidden` 타입의 입력 필드를 생성합니다. 예를 들어, [Blade 문법](/docs/10.x/blade)에서는 아래와 같이 사용할 수 있습니다.

```
<form method="POST">
    {{ method_field('DELETE') }}
</form>
```

<a name="method-now"></a>
#### `now()`

`now` 함수는 현재 시각의 `Illuminate\Support\Carbon` 인스턴스를 생성합니다.

```
$now = now();
```

<a name="method-old"></a>
#### `old()`

`old` 함수는 세션에 플래시된 [이전 입력값](/docs/10.x/requests#old-input)을 [가져옵니다](/docs/10.x/requests#retrieving-input).

```
$value = old('value');

$value = old('value', 'default');
```

두 번째 인자로 전달하는 "기본값"은 종종 Eloquent 모델의 속성(attribute)일 수 있습니다. 라라벨에서는 이러한 경우 전체 Eloquent 모델을 두 번째 인자로 전달할 수 있으며, 이때 첫 번째 인자를 Eloquent 속성명으로 간주해 해당 속성 값이 기본값으로 사용됩니다.

```
{{ old('name', $user->name) }}

// 다음과 동일하게 동작합니다...

{{ old('name', $user) }}
```

<a name="method-optional"></a>
#### `optional()`

`optional` 함수는 아무 값이나 인자로 받아 해당 객체의 속성이나 메서드에 접근할 수 있도록 합니다. 만약 전달된 객체가 `null`이라면, 속성이나 메서드를 호출해도 에러를 발생시키는 대신 `null`을 반환합니다.

```
return optional($user->address)->street;

{!! old('name', optional($user)->name) !!}
```

`optional` 함수는 두 번째 인자로 클로저(익명함수)도 받을 수 있습니다. 첫 번째 인자로 전달된 값이 null이 아니라면, 해당 클로저가 실행됩니다.

```
return optional(User::find($id), function (User $user) {
    return $user->name;
});
```

<a name="method-policy"></a>
#### `policy()`

`policy` 메서드는 지정한 클래스에 대한 [정책(Policy)](/docs/10.x/authorization#creating-policies) 인스턴스를 반환합니다.

```
$policy = policy(App\Models\User::class);
```

<a name="method-redirect"></a>
#### `redirect()`

`redirect` 함수는 [리디렉션 HTTP 응답](/docs/10.x/responses#redirects)을 반환하거나, 인자가 없이 호출할 경우 리디렉터 인스턴스를 반환합니다.

```
return redirect($to = null, $status = 302, $headers = [], $https = null);

return redirect('/home');

return redirect()->route('route.name');
```

<a name="method-report"></a>
#### `report()`

`report` 함수는 [예외 핸들러](/docs/10.x/errors#the-exception-handler)를 이용해 예외를 리포트합니다.

```
report($e);
```

`report` 함수에는 문자열도 인자로 전달할 수 있습니다. 문자열을 전달하면, 해당 메시지를 가진 예외 객체가 생성되어 리포트됩니다.

```
report('Something went wrong.');
```

<a name="method-report-if"></a>
#### `report_if()`

`report_if` 함수는, 주어진 조건이 `true`인 경우 [예외 핸들러](/docs/10.x/errors#the-exception-handler)를 이용해 예외를 리포트합니다.

```
report_if($shouldReport, $e);

report_if($shouldReport, 'Something went wrong.');
```

<a name="method-report-unless"></a>
#### `report_unless()`

`report_unless` 함수는, 주어진 조건이 `false`인 경우 [예외 핸들러](/docs/10.x/errors#the-exception-handler)를 이용해 예외를 리포트합니다.

```
report_unless($reportingDisabled, $e);

report_unless($reportingDisabled, 'Something went wrong.');
```

<a name="method-request"></a>
#### `request()`

`request` 함수는 현재 [요청](/docs/10.x/requests) 인스턴스를 반환하거나, 현재 요청에서 입력 필드 값을 가져옵니다.

```
$request = request();

$value = request('key', $default);
```

<a name="method-rescue"></a>
#### `rescue()`

`rescue` 함수는 전달된 클로저를 실행하고, 실행 중 발생하는 예외를 자동으로 포착하여 처리합니다. 포착된 모든 예외는 [예외 핸들러](/docs/10.x/errors#the-exception-handler)로 전달되지만, 요청 처리는 계속 이어집니다.

```
return rescue(function () {
    return $this->method();
});
```

`rescue` 함수에는 두 번째 인자를 전달할 수 있습니다. 이 인자는 클로저 실행 중에 예외가 발생한 경우 반환할 "기본값" 또는 동작을 정의하는 값입니다.

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

예외를 `report` 함수로 리포트할지 여부를 결정하는 `report` 인자를 추가로 전달할 수도 있습니다.

```
return rescue(function () {
    return $this->method();
}, report: function (Throwable $throwable) {
    return $throwable instanceof InvalidArgumentException;
});
```

<a name="method-resolve"></a>
#### `resolve()`

`resolve` 함수는 [서비스 컨테이너](/docs/10.x/container)를 활용해 주어진 클래스 또는 인터페이스명을 인스턴스로 해결합니다.

```
$api = resolve('HelpSpot\API');
```

<a name="method-response"></a>
#### `response()`

`response` 함수는 [응답](/docs/10.x/responses) 인스턴스를 생성하거나, 응답 팩토리 인스턴스를 반환합니다.

```
return response('Hello World', 200, $headers);

return response()->json(['foo' => 'bar'], 200, $headers);
```

<a name="method-retry"></a>
#### `retry()`

`retry` 함수는 지정한 최대 시도 횟수에 도달할 때까지 주어진 콜백을 실행합니다. 콜백에서 예외가 발생하지 않으면 해당 반환값이 그대로 반환됩니다. 예외가 발생하면 자동으로 재시도하며, 최대 시도 횟수를 초과하면 예외가 던져집니다.

```
return retry(5, function () {
    // 5번까지 시도하며, 각 시도 사이에 100ms 대기...
}, 100);
```

시도 사이에 대기할 밀리초(ms)를 직접 계산하고 싶다면, 세 번째 인자로 클로저를 전달할 수 있습니다.

```
use Exception;

return retry(5, function () {
    // ...
}, function (int $attempt, Exception $exception) {
    return $attempt * 100;
});
```

편의를 위해, 첫 번째 인자에 배열을 전달할 수도 있습니다. 배열 내 각 값은 각각의 재시도 사이에 대기할 밀리초를 지정합니다.

```
return retry([100, 200], function () {
    // 첫 번째 재시도 시 100ms, 두 번째 시 200ms 대기...
});
```

특정 조건일 때만 재시도를 하도록, 네 번째 인자로 클로저를 전달할 수도 있습니다.

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

`session` 함수는 [세션](/docs/10.x/session) 값을 가져오거나 설정할 때 사용할 수 있습니다.

```
$value = session('key');
```

함수에 키/값 쌍으로 이루어진 배열을 전달하면 값을 설정할 수 있습니다.

```
session(['chairs' => 7, 'instruments' => 3]);
```

함수에 아무런 값도 전달하지 않으면 세션 저장소 자체가 반환됩니다.

```
$value = session()->get('key');

session()->put('key', $value);
```

<a name="method-tap"></a>
#### `tap()`

`tap` 함수는 두 개의 인수를 받습니다: 임의의 `$value`와 클로저입니다. `$value`가 클로저에 전달된 후, `tap` 함수는 다시 그 `$value`를 반환합니다. 이때, 클로저가 무엇을 반환하든 상관 없습니다.

```
$user = tap(User::first(), function (User $user) {
    $user->name = 'taylor';

    $user->save();
});
```

만약 클로저를 전달하지 않으면, 해당 `$value`에 어떤 메서드든 호출할 수 있습니다. 이때 호출된 메서드가 반환하는 값과 관계없이, 항상 `$value`가 반환됩니다. 예를 들어, Eloquent의 `update` 메서드는 일반적으로 정수를 반환하지만, `tap`과 함께 사용하면 항상 모델 인스턴스를 반환하도록 할 수 있습니다.

```
$user = tap($user)->update([
    'name' => $name,
    'email' => $email,
]);
```

클래스에 `tap` 메서드를 추가하고 싶다면, `Illuminate\Support\Traits\Tappable` 트레잇을 해당 클래스에 추가하면 됩니다. 이 트레잇의 `tap` 메서드는 클로저 하나만 인수로 받고, 오브젝트 인스턴스 자신이 클로저에 전달되며, 그 후 다시 해당 인스턴스를 반환합니다.

```
return $user->tap(function (User $user) {
    // ...
});
```

<a name="method-throw-if"></a>
#### `throw_if()`

`throw_if` 함수는 주어진 불리언 표현식이 `true`가 될 경우, 지정한 예외를 발생시킵니다.

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

`throw_unless` 함수는 주어진 불리언 표현식이 `false`가 될 때 지정한 예외를 발생시킵니다.

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

`today` 함수는 현재 날짜의 새로운 `Illuminate\Support\Carbon` 인스턴스를 생성합니다.

```
$today = today();
```

<a name="method-trait-uses-recursive"></a>
#### `trait_uses_recursive()`

`trait_uses_recursive` 함수는 지정한 트레잇이 사용하는 모든 트레잇 목록을 반환합니다.

```
$traits = trait_uses_recursive(\Illuminate\Notifications\Notifiable::class);
```

<a name="method-transform"></a>
#### `transform()`

`transform` 함수는 전달된 값이 [blank](#method-blank)가 아니면, 해당 값에 클로저를 실행하고 그 결과를 반환합니다.

```
$callback = function (int $value) {
    return $value * 2;
};

$result = transform(5, $callback);

// 10
```

세 번째 인수로 기본값이나 클로저를 추가로 전달할 수 있습니다. 만약 주어진 값이 blank라면, 기본값이 반환됩니다.

```
$result = transform(null, $callback, 'The value is blank');

// The value is blank
```

<a name="method-validator"></a>
#### `validator()`

`validator` 함수는 전달된 인수로 [validator](/docs/10.x/validation) 인스턴스를 하나 생성합니다. 이 함수는 `Validator` 파사드의 대체로 사용할 수 있습니다.

```
$validator = validator($data, $rules, $messages);
```

<a name="method-value"></a>
#### `value()`

`value` 함수는 전달받은 값을 그대로 반환합니다. 하지만 클로저를 전달하면, 해당 클로저를 실행한 결과값을 반환합니다.

```
$result = value(true);

// true

$result = value(function () {
    return false;
});

// false
```

추가 인수를 `value` 함수에 전달할 수 있습니다. 첫 번째 인수가 클로저라면, 추가 인자들은 클로저에 인수로 전달되고, 그렇지 않은 경우 무시됩니다.

```
$result = value(function (string $name) {
    return $name;
}, 'Taylor');

// 'Taylor'
```

<a name="method-view"></a>
#### `view()`

`view` 함수는 [뷰](/docs/10.x/views) 인스턴스를 반환합니다.

```
return view('auth.login');
```

<a name="method-with"></a>
#### `with()`

`with` 함수는 전달받은 값을 그대로 반환합니다. 두 번째 인수로 클로저가 넘어오면, 해당 클로저를 실행한 결과값을 반환합니다.

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

<a name="other-utilities"></a>
## 기타 유틸리티

<a name="benchmarking"></a>
### 벤치마킹(Benchmarking)

애플리케이션의 특정 부분의 성능을 빠르게 테스트해야 할 때가 있습니다. 이럴 때, `Benchmark` 지원 클래스를 사용해서 지정한 콜백이 완료되는 데 걸리는 밀리초(ms) 시간을 측정할 수 있습니다.

```
<?php

use App\Models\User;
use Illuminate\Support\Benchmark;

Benchmark::dd(fn () => User::find(1)); // 0.1 ms

Benchmark::dd([
    'Scenario 1' => fn () => User::count(), // 0.5 ms
    'Scenario 2' => fn () => User::all()->count(), // 20.0 ms
]);
```

기본적으로, 전달된 콜백은 한 번만 실행(1회 반복)되며, 실행 시간은 브라우저 또는 콘솔에 표시됩니다.

콜백을 여러 번 실행하고 싶다면, 반복 횟수를 메서드의 두 번째 인수로 지정할 수 있습니다. 콜백을 여러 번 실행하면, 전체 반복에 걸친 평균 실행 시간이 반환됩니다.

```
Benchmark::dd(fn () => User::count(), iterations: 10); // 0.5 ms
```

콜백의 실행 시간을 측정하면서도, 해당 콜백의 반환 값을 그대로 얻고 싶을 때가 있습니다. 이런 경우 `value` 메서드는 콜백이 반환한 값과 실행하는 데 걸린 밀리초를 튜플로 반환합니다.

```
[$count, $duration] = Benchmark::value(fn () => User::count());
```

<a name="dates"></a>
### 날짜

라라벨은 [Carbon](https://carbon.nesbot.com/docs/)이라는 강력한 날짜 및 시간 조작 라이브러리를 내장하고 있습니다. 새로운 `Carbon` 인스턴스를 만들려면 `now` 함수를 사용할 수 있습니다. 이 함수는 라라벨 애플리케이션 어디서든 사용할 수 있습니다.

```php
$now = now();
```

또는, `Illuminate\Support\Carbon` 클래스를 사용해 직접 인스턴스를 생성할 수 있습니다.

```php
use Illuminate\Support\Carbon;

$now = Carbon::now();
```

Carbon 및 그 기능에 대한 자세한 설명은 [공식 Carbon 문서](https://carbon.nesbot.com/docs/)를 참고하시기 바랍니다.

<a name="lottery"></a>
### 로터리(Lottery)

라라벨의 Lottery 클래스는 설정한 확률에 따라 콜백을 실행하는 데 사용할 수 있습니다. 이는 전체 요청 중 일부(예: 2%만)에서만 특정 코드를 실행하고 싶을 때 특히 유용합니다.

```
use Illuminate\Support\Lottery;

Lottery::odds(1, 20)
    ->winner(fn () => $user->won())
    ->loser(fn () => $user->lost())
    ->choose();
```

라라벨의 Lottery 클래스는 다른 라라벨 기능과 함께 사용할 수도 있습니다. 예를 들어, 느린 쿼리가 전체 요청 중 극히 일부에서만 예외 핸들러로 보고되길 원할 수 있습니다. 또, Lottery 클래스는 자체적으로 호출 가능한 객체(callable)이기 때문에, 콜러블을 받을 수 있는 어떤 메서드에도 넘길 수 있습니다.

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
#### 로터리 테스트하기

라라벨은 애플리케이션의 Lottery 호출을 쉽게 테스트할 수 있도록 간단한 메서드를 제공합니다.

```
// Lottery는 항상 당첨 처리됩니다...
Lottery::alwaysWin();

// Lottery는 항상 낙첨 처리됩니다...
Lottery::alwaysLose();

// Lottery가 당첨, 낙첨 순서로 동작한 뒤, 다시 정상 동작으로 복귀합니다...
Lottery::fix([true, false]);

// Lottery가 정상 동작으로 복귀합니다...
Lottery::determineResultsNormally();
```

<a name="pipeline"></a>
### 파이프라인(Pipeline)

라라벨의 `Pipeline` 파사드는 주어진 입력 값을 일련의 인보커블(invokable) 클래스, 클로저, 콜러블(함수형 객체)로 "파이프"처럼 전달할 수 있는 편리한 방법을 제공합니다. 각 클래스는 전달된 입력을 검사하거나 수정할 수 있고, 파이프라인의 다음 콜러블을 호출할 수 있습니다.

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

이 코드에서 볼 수 있듯이 파이프라인 내 각 클래스(또는 클로저)는 입력과 `$next` 클로저를 받고, `$next`를 호출하면 다음 콜러블이 실행됩니다. 이런 구조는 [미들웨어](/docs/10.x/middleware)와 매우 유사합니다.

파이프라인의 마지막 콜러블이 `$next`를 호출하면, `then` 메서드에 전달한 콜러블이 실행됩니다. 보통 이 콜러블은 입력값을 그대로 반환합니다.

물론, 파이프라인에는 클로저뿐 아니라 클래스 이름도 전달할 수 있습니다. 클래스 이름이 주어지면 라라벨의 [서비스 컨테이너](/docs/10.x/container)로 인스턴스화되어 의존성을 주입받을 수 있습니다.

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
### Sleep(슬립)

라라벨의 `Sleep` 클래스는 PHP의 기본 `sleep` 및 `usleep` 함수에 간편한 개발자 친화적 API를 제공하며, 테스트 가능성도 함께 높여줍니다.

```
use Illuminate\Support\Sleep;

$waiting = true;

while ($waiting) {
    Sleep::for(1)->second();

    $waiting = /* ... */;
}
```

`Sleep` 클래스는 다양한 시간 단위를 사용할 수 있도록 여러 메서드를 제공합니다.

```
// 90초 동안 실행을 일시 중지합니다...
Sleep::for(1.5)->minutes();

// 2초 동안 실행을 일시 중지합니다...
Sleep::for(2)->seconds();

// 500밀리초 동안 실행을 일시 중지합니다...
Sleep::for(500)->milliseconds();

// 5,000마이크로초 동안 실행을 일시 중지합니다...
Sleep::for(5000)->microseconds();

// 지정된 시각까지 실행을 일시 중지합니다...
Sleep::until(now()->addMinute());

// PHP의 기본 "sleep" 함수 별칭...
Sleep::sleep(2);

// PHP의 기본 "usleep" 함수 별칭...
Sleep::usleep(5000);
```

여러 시간 단위를 쉽게 조합하고 싶다면, `and` 메서드를 사용할 수 있습니다.

```
Sleep::for(1)->second()->and(10)->milliseconds();
```

<a name="testing-sleep"></a>
#### Sleep 테스트하기

`Sleep` 클래스 또는 PHP의 `sleep` 함수를 사용하는 코드를 테스트하면 실제로 실행이 일시 중지되기 때문에, 테스트 속도가 현저히 느려지게 됩니다. 예를 들어, 아래 코드를 테스트한다고 가정해봅시다.

```
$waiting = /* ... */;

$seconds = 1;

while ($waiting) {
    Sleep::for($seconds++)->seconds();

    $waiting = /* ... */;
}
```

이 코드를 테스트하면 최소 1초 이상의 시간이 소요됩니다. 다행히, `Sleep` 클래스는 "Sleep"을 가짜(fake)로 처리하여 테스트가 훨씬 빨라지도록 해줍니다.

```
public function test_it_waits_until_ready()
{
    Sleep::fake();

    // ...
}
```

`Sleep` 클래스를 fake로 만들면, 실제로 실행이 중단되지 않아 테스트가 크게 빨라집니다.

`Sleep` 클래스가 fake가 된 상태에서는, 테스트 중에 ‘잠들었던(Sleep)' 내역(assertion)도 얼마든지 검증할 수 있습니다. 예를 들어, 1초, 2초, 3초씩 총 세 번 일시 중지되었다면, `assertSequence`를 사용해서 이를 검증할 수 있습니다.

```
public function test_it_checks_if_ready_four_times()
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

물론, `Sleep` 클래스는 이 외에도 다양한 assertion 기능을 지원합니다.

```
use Carbon\CarbonInterval as Duration;
use Illuminate\Support\Sleep;

// Sleep이 3번 호출되었는지 검증합니다...
Sleep::assertSleptTimes(3);

// sleep의 실행 시간이 예상과 일치하는지 검증합니다...
Sleep::assertSlept(function (Duration $duration): bool {
    return /* ... */;
}, times: 1);

// Sleep이 단 한 번도 호출되지 않았는지 검증합니다...
Sleep::assertNeverSlept();

// Sleep이 호출되었더라도 실제 일시 중지는 발생하지 않았는지 검증합니다...
Sleep::assertInsomniac();
```

애플리케이션 코드에서 fake sleep이 발생할 때마다, 추가 동작을 실행하고 싶을 때도 있습니다. 이런 경우 `whenFakingSleep` 메서드에 콜백을 지정할 수 있습니다. 아래 예제에서는 라라벨의 [시간 조작 헬퍼](/docs/10.x/mocking#interacting-with-time)를 사용해 fake sleep이 발생할 때마다 시간도 즉시 진행시키는 방법을 보여줍니다.

```php
use Carbon\CarbonInterval as Duration;

$this->freezeTime();

Sleep::fake();

Sleep::whenFakingSleep(function (Duration $duration) {
    // fake로 sleep 중엔 시간도 즉시 진행하기
    $this->travel($duration->totalMilliseconds)->milliseconds();
});
```

라라벨은 실행을 일시 중지할 때 내부적으로 항상 `Sleep` 클래스를 사용합니다. 예를 들어, [`retry`](#method-retry) 헬퍼도 sleep 시 이 클래스를 사용하므로, 해당 헬퍼를 테스트할 때도 보다 나은 테스트 환경을 제공합니다.