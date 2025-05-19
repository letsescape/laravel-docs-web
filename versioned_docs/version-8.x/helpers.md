# 헬퍼 (Helpers)

- [소개](#introduction)
- [사용 가능한 메서드](#available-methods)

<a name="introduction"></a>
## 소개

라라벨에는 여러 가지 전역 "헬퍼" PHP 함수들이 포함되어 있습니다. 이 함수들 중 상당수는 프레임워크 내부에서 사용되지만, 필요하다면 여러분의 애플리케이션에서도 편리하게 활용할 수 있습니다.

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
[Arr::last](#method-array-last)
[Arr::only](#method-array-only)
[Arr::pluck](#method-array-pluck)
[Arr::prepend](#method-array-prepend)
[Arr::pull](#method-array-pull)
[Arr::query](#method-array-query)
[Arr::random](#method-array-random)
[Arr::set](#method-array-set)
[Arr::shuffle](#method-array-shuffle)
[Arr::sort](#method-array-sort)
[Arr::sortRecursive](#method-array-sort-recursive)
[Arr::toCssClasses](#method-array-to-css-classes)
[Arr::undot](#method-array-undot)
[Arr::where](#method-array-where)
[Arr::whereNotNull](#method-array-where-not-null)
[Arr::wrap](#method-array-wrap)
[data_fill](#method-data-fill)
[data_get](#method-data-get)
[data_set](#method-data-set)
[head](#method-head)
[last](#method-last)
</div>

<a name="paths-method-list"></a>
### 경로

<div class="collection-method-list" markdown="1">

[app_path](#method-app-path)
[base_path](#method-base-path)
[config_path](#method-config-path)
[database_path](#method-database-path)
[mix](#method-mix)
[public_path](#method-public-path)
[resource_path](#method-resource-path)
[storage_path](#method-storage-path)

</div>

<a name="strings-method-list"></a>
### 문자열

<div class="collection-method-list" markdown="1">

[\__](#method-__)
[class_basename](#method-class-basename)
[e](#method-e)
[preg_replace_array](#method-preg-replace-array)
[Str::after](#method-str-after)
[Str::afterLast](#method-str-after-last)
[Str::ascii](#method-str-ascii)
[Str::before](#method-str-before)
[Str::beforeLast](#method-str-before-last)
[Str::between](#method-str-between)
[Str::camel](#method-camel-case)
[Str::contains](#method-str-contains)
[Str::containsAll](#method-str-contains-all)
[Str::endsWith](#method-ends-with)
[Str::finish](#method-str-finish)
[Str::headline](#method-str-headline)
[Str::is](#method-str-is)
[Str::isAscii](#method-str-is-ascii)
[Str::isUuid](#method-str-is-uuid)
[Str::kebab](#method-kebab-case)
[Str::length](#method-str-length)
[Str::limit](#method-str-limit)
[Str::lower](#method-str-lower)
[Str::markdown](#method-str-markdown)
[Str::mask](#method-str-mask)
[Str::orderedUuid](#method-str-ordered-uuid)
[Str::padBoth](#method-str-padboth)
[Str::padLeft](#method-str-padleft)
[Str::padRight](#method-str-padright)
[Str::plural](#method-str-plural)
[Str::pluralStudly](#method-str-plural-studly)
[Str::random](#method-str-random)
[Str::remove](#method-str-remove)
[Str::replace](#method-str-replace)
[Str::replaceArray](#method-str-replace-array)
[Str::replaceFirst](#method-str-replace-first)
[Str::replaceLast](#method-str-replace-last)
[Str::reverse](#method-str-reverse)
[Str::singular](#method-str-singular)
[Str::slug](#method-str-slug)
[Str::snake](#method-snake-case)
[Str::start](#method-str-start)
[Str::startsWith](#method-starts-with)
[Str::studly](#method-studly-case)
[Str::substr](#method-str-substr)
[Str::substrCount](#method-str-substrcount)
[Str::substrReplace](#method-str-substrreplace)
[Str::title](#method-title-case)
[Str::toHtmlString](#method-str-to-html-string)
[Str::ucfirst](#method-str-ucfirst)
[Str::upper](#method-str-upper)
[Str::uuid](#method-str-uuid)
[Str::wordCount](#method-str-word-count)
[Str::words](#method-str-words)
[trans](#method-trans)
[trans_choice](#method-trans-choice)

</div>

<a name="fluent-strings-method-list"></a>
### Fluent 문자열

<div class="collection-method-list" markdown="1">

[after](#method-fluent-str-after)
[afterLast](#method-fluent-str-after-last)
[append](#method-fluent-str-append)
[ascii](#method-fluent-str-ascii)
[basename](#method-fluent-str-basename)
[before](#method-fluent-str-before)
[beforeLast](#method-fluent-str-before-last)
[between](#method-fluent-str-between)
[camel](#method-fluent-str-camel)
[contains](#method-fluent-str-contains)
[containsAll](#method-fluent-str-contains-all)
[dirname](#method-fluent-str-dirname)
[endsWith](#method-fluent-str-ends-with)
[exactly](#method-fluent-str-exactly)
[explode](#method-fluent-str-explode)
[finish](#method-fluent-str-finish)
[is](#method-fluent-str-is)
[isAscii](#method-fluent-str-is-ascii)
[isEmpty](#method-fluent-str-is-empty)
[isNotEmpty](#method-fluent-str-is-not-empty)
[isUuid](#method-fluent-str-is-uuid)
[kebab](#method-fluent-str-kebab)
[length](#method-fluent-str-length)
[limit](#method-fluent-str-limit)
[lower](#method-fluent-str-lower)
[ltrim](#method-fluent-str-ltrim)
[markdown](#method-fluent-str-markdown)
[mask](#method-fluent-str-mask)
[match](#method-fluent-str-match)
[matchAll](#method-fluent-str-match-all)
[padBoth](#method-fluent-str-padboth)
[padLeft](#method-fluent-str-padleft)
[padRight](#method-fluent-str-padright)
[pipe](#method-fluent-str-pipe)
[plural](#method-fluent-str-plural)
[prepend](#method-fluent-str-prepend)
[remove](#method-fluent-str-remove)
[replace](#method-fluent-str-replace)
[replaceArray](#method-fluent-str-replace-array)
[replaceFirst](#method-fluent-str-replace-first)
[replaceLast](#method-fluent-str-replace-last)
[replaceMatches](#method-fluent-str-replace-matches)
[rtrim](#method-fluent-str-rtrim)
[scan](#method-fluent-str-scan)
[singular](#method-fluent-str-singular)
[slug](#method-fluent-str-slug)
[snake](#method-fluent-str-snake)
[split](#method-fluent-str-split)
[start](#method-fluent-str-start)
[startsWith](#method-fluent-str-starts-with)
[studly](#method-fluent-str-studly)
[substr](#method-fluent-str-substr)
[substrReplace](#method-fluent-str-substrreplace)
[tap](#method-fluent-str-tap)
[test](#method-fluent-str-test)
[title](#method-fluent-str-title)
[trim](#method-fluent-str-trim)
[ucfirst](#method-fluent-str-ucfirst)
[upper](#method-fluent-str-upper)
[when](#method-fluent-str-when)
[whenContains](#method-fluent-str-when-contains)
[whenContainsAll](#method-fluent-str-when-contains-all)
[whenEmpty](#method-fluent-str-when-empty)
[whenNotEmpty](#method-fluent-str-when-not-empty)
[whenStartsWith](#method-fluent-str-when-starts-with)
[whenEndsWith](#method-fluent-str-when-ends-with)
[whenExactly](#method-fluent-str-when-exactly)
[whenIs](#method-fluent-str-when-is)
[whenIsAscii](#method-fluent-str-when-is-ascii)
[whenIsUuid](#method-fluent-str-when-is-uuid)
[whenTest](#method-fluent-str-when-test)
[wordCount](#method-fluent-str-word-count)
[words](#method-fluent-str-words)

</div>

<a name="urls-method-list"></a>
### URL

<div class="collection-method-list" markdown="1">

[action](#method-action)
[asset](#method-asset)
[route](#method-route)
[secure_asset](#method-secure-asset)
[secure_url](#method-secure-url)
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
[dd](#method-dd)
[dispatch](#method-dispatch)
[dump](#method-dump)
[env](#method-env)
[event](#method-event)
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

<a name="method-listing"></a>
## 메서드 목록



<a name="arrays"></a>
## 배열 & 객체

<a name="method-array-accessible"></a>
#### `Arr::accessible()`

`Arr::accessible` 메서드는 주어진 값이 배열처럼 접근 가능한지 여부를 확인합니다:

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

`Arr::add` 메서드는 주어진 배열에 대해, 특정 키가 존재하지 않거나 값이 `null`일 경우 지정한 키/값을 추가합니다:

```
use Illuminate\Support\Arr;

$array = Arr::add(['name' => 'Desk'], 'price', 100);

// ['name' => 'Desk', 'price' => 100]

$array = Arr::add(['name' => 'Desk', 'price' => null], 'price', 100);

// ['name' => 'Desk', 'price' => 100]
```


<a name="method-array-collapse"></a>
#### `Arr::collapse()`

`Arr::collapse` 메서드는 다차원 배열의 배열들을 하나의 단일 배열로 평탄하게 만들어줍니다.

```
use Illuminate\Support\Arr;

$array = Arr::collapse([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);

// [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

<a name="method-array-crossjoin"></a>
#### `Arr::crossJoin()`

`Arr::crossJoin` 메서드는 여러 배열을 교차(join)하여 가능한 모든 조합의 데카르트 곱을 반환합니다.

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

`Arr::divide` 메서드는 주어진 배열의 키만을 모은 배열과 값만을 모은 배열, 이렇게 두 개의 배열을 반환합니다:

```
use Illuminate\Support\Arr;

[$keys, $values] = Arr::divide(['name' => 'Desk']);

// $keys: ['name']

// $values: ['Desk']
```

<a name="method-array-dot"></a>
#### `Arr::dot()`

`Arr::dot` 메서드는 다차원 배열을 "점(dot) 표기법"을 사용하여 한 단계로 평탄화(flatten)합니다:

```
use Illuminate\Support\Arr;

$array = ['products' => ['desk' => ['price' => 100]]];

$flattened = Arr::dot($array);

// ['products.desk.price' => 100]
```

<a name="method-array-except"></a>
#### `Arr::except()`

`Arr::except` 메서드는 배열에서 지정한 키와 해당 값을 제거하여 반환합니다:

```
use Illuminate\Support\Arr;

$array = ['name' => 'Desk', 'price' => 100];

$filtered = Arr::except($array, ['price']);

// ['name' => 'Desk']
```

<a name="method-array-exists"></a>
#### `Arr::exists()`

`Arr::exists` 메서드는 주어진 배열에 특정 키가 존재하는지 확인합니다:

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

`Arr::first` 메서드는 주어진 배열에서 특정 조건(진리값 테스트)을 통과하는 첫 번째 요소를 반환합니다:

```
use Illuminate\Support\Arr;

$array = [100, 200, 300];

$first = Arr::first($array, function ($value, $key) {
    return $value >= 150;
});

// 200
```

세 번째 인수로 기본값(default value)을 전달할 수도 있습니다. 만약 진리값 테스트를 통과하는 값이 없다면 이 기본값이 반환됩니다:

```
use Illuminate\Support\Arr;

$first = Arr::first($array, $callback, $default);
```

<a name="method-array-flatten"></a>
#### `Arr::flatten()`

`Arr::flatten` 메서드는 다차원 배열을 한 단계로 평탄하게 만들어줍니다:

```
use Illuminate\Support\Arr;

$array = ['name' => 'Joe', 'languages' => ['PHP', 'Ruby']];

$flattened = Arr::flatten($array);

// ['Joe', 'PHP', 'Ruby']
```

<a name="method-array-forget"></a>
#### `Arr::forget()`

`Arr::forget` 메서드는 "점(dot) 표기법"을 이용해 깊숙하게 중첩된 배열에서 특정 키/값 쌍을 제거합니다:

```
use Illuminate\Support\Arr;

$array = ['products' => ['desk' => ['price' => 100]]];

Arr::forget($array, 'products.desk');

// ['products' => []]
```

<a name="method-array-get"></a>
#### `Arr::get()`

`Arr::get` 메서드는 "점(dot) 표기법"을 사용해 깊숙하게 중첩된 배열에서 값을 가져옵니다:

```
use Illuminate\Support\Arr;

$array = ['products' => ['desk' => ['price' => 100]]];

$price = Arr::get($array, 'products.desk.price');

// 100
```

또한 `Arr::get` 메서드는 기본값을 세 번째 인수로 받을 수 있습니다. 지정한 키가 배열에 존재하지 않을 경우 이 기본값이 반환됩니다:

```
use Illuminate\Support\Arr;

$discount = Arr::get($array, 'products.desk.discount', 0);

// 0
```

<a name="method-array-has"></a>
#### `Arr::has()`

`Arr::has` 메서드는 "점(dot) 표기법"을 사용해서 배열에 특정 요소 또는 여러 요소가 존재하는지 확인합니다:

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

`Arr::hasAny` 메서드는 "점(dot) 표기법"을 활용하여 지정한 요소 중 하나라도 배열에 존재하는지 확인합니다:

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

`Arr::isAssoc` 메서드는 주어진 배열이 연관 배열(associative array)인 경우 `true`를 반환합니다. 배열의 키가 0부터 시작하는 연속 숫자(순차 인덱스)가 아니면 "연관 배열"로 간주합니다.

```
use Illuminate\Support\Arr;

$isAssoc = Arr::isAssoc(['product' => ['name' => 'Desk', 'price' => 100]]);

// true

$isAssoc = Arr::isAssoc([1, 2, 3]);

// false
```

<a name="method-array-last"></a>
#### `Arr::last()`

`Arr::last` 메서드는 주어진 배열에서 지정한 조건(진리성 검사)을 통과하는 마지막 요소를 반환합니다.

```
use Illuminate\Support\Arr;

$array = [100, 200, 300, 110];

$last = Arr::last($array, function ($value, $key) {
    return $value >= 150;
});

// 300
```

메서드의 세 번째 인수로 기본값을 전달할 수 있습니다. 이 값은 조건에 맞는 요소가 없는 경우 반환됩니다.

```
use Illuminate\Support\Arr;

$last = Arr::last($array, $callback, $default);
```

<a name="method-array-only"></a>
#### `Arr::only()`

`Arr::only` 메서드는 주어진 배열에서 지정한 키에 해당하는 키/값 쌍만 추출해 반환합니다.

```
use Illuminate\Support\Arr;

$array = ['name' => 'Desk', 'price' => 100, 'orders' => 10];

$slice = Arr::only($array, ['name', 'price']);

// ['name' => 'Desk', 'price' => 100]
```

<a name="method-array-pluck"></a>
#### `Arr::pluck()`

`Arr::pluck` 메서드는 배열에서 지정한 키에 해당하는 모든 값을 가져옵니다.

```
use Illuminate\Support\Arr;

$array = [
    ['developer' => ['id' => 1, 'name' => 'Taylor']],
    ['developer' => ['id' => 2, 'name' => 'Abigail']],
];

$names = Arr::pluck($array, 'developer.name');

// ['Taylor', 'Abigail']
```

결과 배열의 키를 어떻게 지정할지 추가로 선택할 수도 있습니다.

```
use Illuminate\Support\Arr;

$names = Arr::pluck($array, 'developer.name', 'developer.id');

// [1 => 'Taylor', 2 => 'Abigail']
```

<a name="method-array-prepend"></a>
#### `Arr::prepend()`

`Arr::prepend` 메서드는 주어진 배열의 맨 앞에 값을 추가합니다.

```
use Illuminate\Support\Arr;

$array = ['one', 'two', 'three', 'four'];

$array = Arr::prepend($array, 'zero');

// ['zero', 'one', 'two', 'three', 'four']
```

필요하다면 추가되는 값에 사용할 키도 지정할 수 있습니다.

```
use Illuminate\Support\Arr;

$array = ['price' => 100];

$array = Arr::prepend($array, 'Desk', 'name');

// ['name' => 'Desk', 'price' => 100]
```

<a name="method-array-pull"></a>
#### `Arr::pull()`

`Arr::pull` 메서드는 배열에서 지정한 키에 해당하는 값(키/값 쌍)을 반환하며, 해당 요소를 배열에서 제거합니다.

```
use Illuminate\Support\Arr;

$array = ['name' => 'Desk', 'price' => 100];

$name = Arr::pull($array, 'name');

// $name: Desk

// $array: ['price' => 100]
```

세 번째 인수로 기본값을 전달할 수 있습니다. 지정한 키가 존재하지 않을 때 이 값이 반환됩니다.

```
use Illuminate\Support\Arr;

$value = Arr::pull($array, $key, $default);
```

<a name="method-array-query"></a>
#### `Arr::query()`

`Arr::query` 메서드는 배열을 쿼리 스트링(query string)으로 변환합니다.

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

// 4 - (임의로 반환됨)
```

두 번째 인수로 반환할 항목의 개수를 지정할 수도 있습니다. 이때 반환 값은 요청 개수와 상관없이 항상 배열입니다.

```
use Illuminate\Support\Arr;

$items = Arr::random($array, 2);

// [2, 5] - (임의로 반환됨)
```

<a name="method-array-set"></a>
#### `Arr::set()`

`Arr::set` 메서드는 "점(dot) 표기법"을 사용해 다차원 배열 내에 값을 설정합니다.

```
use Illuminate\Support\Arr;

$array = ['products' => ['desk' => ['price' => 100]]];

Arr::set($array, 'products.desk.price', 200);

// ['products' => ['desk' => ['price' => 200]]]
```

<a name="method-array-shuffle"></a>
#### `Arr::shuffle()`

`Arr::shuffle` 메서드는 배열의 요소 순서를 무작위로 섞습니다.

```
use Illuminate\Support\Arr;

$array = Arr::shuffle([1, 2, 3, 4, 5]);

// [3, 2, 5, 1, 4] - (무작위로 생성됨)
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

클로저(익명 함수)를 전달하여 원하는 방식으로 배열을 정렬할 수도 있습니다.

```
use Illuminate\Support\Arr;

$array = [
    ['name' => 'Desk'],
    ['name' => 'Table'],
    ['name' => 'Chair'],
];

$sorted = array_values(Arr::sort($array, function ($value) {
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

<a name="method-array-sort-recursive"></a>
#### `Arr::sortRecursive()`

`Arr::sortRecursive` 메서드는 배열을 재귀적으로 정렬합니다. 숫자 인덱스가 있는 하위 배열에는 `sort` 함수를, 연관 배열에는 `ksort` 함수를 사용합니다.

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

<a name="method-array-to-css-classes"></a>
#### `Arr::toCssClasses()`

`Arr::toCssClasses` 메서드는 조건에 따라 CSS 클래스 문자열을 조합해줍니다. 이 메서드는 클래스 이름(문자열 또는 배열의 키)과 해당 클래스를 적용할지 여부(불리언 값)를 배열로 전달받습니다. 만약 배열에 숫자 키가 있다면 해당 값은 항상 클래스명으로 포함됩니다.

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

이 메서드는 [Blade 컴포넌트의 attribute bag과 클래스 병합 기능](/docs/8.x/blade#conditionally-merge-classes)이나, `@class` [Blade 지시어](/docs/8.x/blade#conditional-classes)에서 사용됩니다.

<a name="method-array-undot"></a>
#### `Arr::undot()`

`Arr::undot` 메서드는 "점(dot) 표기법"을 사용하는 단일 차원 배열을 다차원 배열로 확장합니다.

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

`Arr::where` 메서드는 전달받은 클로저(콜백 함수)를 통해 배열의 요소를 필터링합니다.

```
use Illuminate\Support\Arr;

$array = [100, '200', 300, '400', 500];

$filtered = Arr::where($array, function ($value, $key) {
    return is_string($value);
});

// [1 => '200', 3 => '400']
```

<a name="method-array-where-not-null"></a>
#### `Arr::whereNotNull()`

`Arr::whereNotNull` 메서드는 배열에서 `null` 값인 요소를 모두 제거합니다.

```
use Illuminate\Support\Arr;

$array = [0, null];

$filtered = Arr::whereNotNull($array);

// [0 => 0]
```

<a name="method-array-wrap"></a>
#### `Arr::wrap()`

`Arr::wrap` 메서드는 주어진 값을 배열로 감쌉니다. 만약 값이 이미 배열이라면 그대로 반환합니다.

```
use Illuminate\Support\Arr;

$string = 'Laravel';

$array = Arr::wrap($string);

// ['Laravel']
```

주어진 값이 `null`이면 빈 배열을 반환합니다.

```
use Illuminate\Support\Arr;

$array = Arr::wrap(null);

// []
```

<a name="method-data-fill"></a>
#### `data_fill()`

`data_fill` 함수는 "점(dot) 표기법"을 사용해 중첩된 배열이나 객체에 비어 있는 값을 설정합니다.

```
$data = ['products' => ['desk' => ['price' => 100]]];

data_fill($data, 'products.desk.price', 200);

// ['products' => ['desk' => ['price' => 100]]]

data_fill($data, 'products.desk.discount', 10);

// ['products' => ['desk' => ['price' => 100, 'discount' => 10]]]
```

이 함수는 `*`(별표)를 와일드카드로 사용할 수 있으며, 대상 위치에 맞춰 값을 채워줍니다.

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

`data_get` 함수는 "점(dot) 표기법"을 사용해 중첩 배열이나 객체에서 값을 가져옵니다.

```
$data = ['products' => ['desk' => ['price' => 100]]];

$price = data_get($data, 'products.desk.price');

// 100
```

`data_get` 함수는 기본값을 세 번째 인수로 받을 수 있으며, 지정한 키가 존재하지 않을 때 해당 값이 반환됩니다.

```
$discount = data_get($data, 'products.desk.discount', 0);

// 0
```

이 함수 역시 `*`(별표) 와일드카드를 사용해 배열이나 객체의 모든 키에 대해 값을 가져올 수 있습니다.

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

`data_set` 함수는 "점(dot) 표기법"을 사용해 중첩 배열이나 객체에 값을 설정합니다.

```
$data = ['products' => ['desk' => ['price' => 100]]];

data_set($data, 'products.desk.price', 200);

// ['products' => ['desk' => ['price' => 200]]]
```

이 함수는 `*`(별표) 와일드카드를 사용하여 여러 위치의 값을 한 번에 설정할 수 있습니다.

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

기본적으로 기존 값을 덮어씁니다. 값이 없을 때만 설정하고 싶다면 네 번째 인수로 `false`를 전달하세요.

```
$data = ['products' => ['desk' => ['price' => 100]]];

data_set($data, 'products.desk.price', 200, $overwrite = false);

// ['products' => ['desk' => ['price' => 100]]]
```

<a name="method-head"></a>
#### `head()`

`head` 함수는 주어진 배열에서 첫 번째 값을 반환합니다.

```
$array = [100, 200, 300];

$first = head($array);

// 100
```

<a name="method-last"></a>
#### `last()`

`last` 함수는 주어진 배열에서 마지막 값을 반환합니다.

```
$array = [100, 200, 300];

$last = last($array);

// 300
```

<a name="paths"></a>
## 경로(패스, Paths)

<a name="method-app-path"></a>
#### `app_path()`

`app_path` 함수는 애플리케이션의 `app` 디렉터리에 대한 전체 경로를 반환합니다. 또한, `app_path` 함수에 파일 경로를 전달하면 애플리케이션 디렉터리를 기준으로 한 파일의 전체 경로를 반환할 수도 있습니다.

```
$path = app_path();

$path = app_path('Http/Controllers/Controller.php');
```

<a name="method-base-path"></a>
#### `base_path()`

`base_path` 함수는 애플리케이션의 루트 디렉터리에 대한 전체 경로를 반환합니다. 또한, 프로젝트 루트 디렉터리를 기준으로 파일 경로를 전달해 전체 경로를 얻을 수도 있습니다.

```
$path = base_path();

$path = base_path('vendor/bin');
```

<a name="method-config-path"></a>
#### `config_path()`

`config_path` 함수는 애플리케이션의 `config` 디렉터리 전체 경로를 반환합니다. 또한, 설정 디렉터리 내 파일의 전체 경로도 얻을 수 있습니다.

```
$path = config_path();

$path = config_path('app.php');
```

<a name="method-database-path"></a>
#### `database_path()`

`database_path` 함수는 애플리케이션의 `database` 디렉터리 전체 경로를 반환합니다. 또한, 데이터베이스 디렉터리 내 특정 파일의 전체 경로도 구할 수 있습니다.

```
$path = database_path();

$path = database_path('factories/UserFactory.php');
```

<a name="method-mix"></a>

#### `mix()`

`mix` 함수는 [버전 관리된 Mix 파일](/docs/8.x/mix)의 경로를 반환합니다.

```
$path = mix('css/app.css');
```

<a name="method-public-path"></a>
#### `public_path()`

`public_path` 함수는 애플리케이션의 `public` 디렉토리에 대한 전체 경로를 반환합니다. 또한, `public_path` 함수에 파일명을 인자로 전달하여 public 디렉토리 내부의 특정 파일에 대한 전체 경로도 생성할 수 있습니다.

```
$path = public_path();

$path = public_path('css/app.css');
```

<a name="method-resource-path"></a>
#### `resource_path()`

`resource_path` 함수는 애플리케이션의 `resources` 디렉토리에 대한 전체 경로를 반환합니다. 또한, `resource_path` 함수에 파일명을 인자로 전달하여 resources 디렉토리 내부의 특정 파일에 대한 전체 경로도 생성할 수 있습니다.

```
$path = resource_path();

$path = resource_path('sass/app.scss');
```

<a name="method-storage-path"></a>
#### `storage_path()`

`storage_path` 함수는 애플리케이션의 `storage` 디렉토리에 대한 전체 경로를 반환합니다. 또한, `storage_path` 함수에 파일명을 인자로 전달하여 storage 디렉토리 내부의 특정 파일에 대한 전체 경로도 생성할 수 있습니다.

```
$path = storage_path();

$path = storage_path('app/file.txt');
```

<a name="strings"></a>
## 문자열(문자열 관련 헬퍼)

<a name="method-__"></a>
#### `__()`

`__` 함수는 [로컬라이제이션 파일](/docs/8.x/localization)을 활용해 주어진 번역 문자열 또는 번역 키를 번역해서 반환합니다.

```
echo __('Welcome to our application');

echo __('messages.welcome');
```

지정한 번역 문자열이나 키가 존재하지 않는 경우, `__` 함수는 입력한 값을 그대로 반환합니다. 예를 들어 위 예시에서 해당 번역 키가 존재하지 않으면 `messages.welcome`을 그대로 반환합니다.

<a name="method-class-basename"></a>
#### `class_basename()`

`class_basename` 함수는 네임스페이스를 제외한 상태로 주어진 클래스의 클래스명만 반환합니다.

```
$class = class_basename('Foo\Bar\Baz');

// Baz
```

<a name="method-e"></a>
#### `e()`

`e` 함수는 PHP의 `htmlspecialchars` 함수를 실행하며, 기본적으로 `double_encode` 옵션이 `true`로 설정되어 있습니다.

```
echo e('<html>foo</html>');

// &lt;html&gt;foo&lt;/html&gt;
```

<a name="method-preg-replace-array"></a>
#### `preg_replace_array()`

`preg_replace_array` 함수는 배열을 이용해 문자열 내의 지정된 패턴을 순차적으로 치환합니다.

```
$string = 'The event will take place between :start and :end';

$replaced = preg_replace_array('/:[a-z_]+/', ['8:30', '9:00'], $string);

// The event will take place between 8:30 and 9:00
```

<a name="method-str-after"></a>
#### `Str::after()`

`Str::after` 메서드는 문자열 내에서 지정한 값 이후의 모든 내용을 반환합니다. 만약 지정한 값이 문자열에 포함되어 있지 않으면 전체 문자열을 반환합니다.

```
use Illuminate\Support\Str;

$slice = Str::after('This is my name', 'This is');

// ' my name'
```

<a name="method-str-after-last"></a>
#### `Str::afterLast()`

`Str::afterLast` 메서드는 문자열 내에서 지정한 값이 마지막으로 나타난 이후의 모든 내용을 반환합니다. 지정한 값이 문자열 내에 없으면 전체 문자열을 반환합니다.

```
use Illuminate\Support\Str;

$slice = Str::afterLast('App\Http\Controllers\Controller', '\\');

// 'Controller'
```

<a name="method-str-ascii"></a>
#### `Str::ascii()`

`Str::ascii` 메서드는 주어진 문자열을 ASCII 문자로 변환하려고 시도합니다.

```
use Illuminate\Support\Str;

$slice = Str::ascii('û');

// 'u'
```

<a name="method-str-before"></a>
#### `Str::before()`

`Str::before` 메서드는 문자열 내에서 지정한 값 이전의 모든 내용을 반환합니다.

```
use Illuminate\Support\Str;

$slice = Str::before('This is my name', 'my name');

// 'This is '
```

<a name="method-str-before-last"></a>
#### `Str::beforeLast()`

`Str::beforeLast` 메서드는 문자열 내에서 지정한 값이 마지막으로 나타나기 전까지의 모든 내용을 반환합니다.

```
use Illuminate\Support\Str;

$slice = Str::beforeLast('This is my name', 'is');

// 'This '
```

<a name="method-str-between"></a>
#### `Str::between()`

`Str::between` 메서드는 문자열 안에서 두 값 사이에 있는 부분 문자열을 반환합니다.

```
use Illuminate\Support\Str;

$slice = Str::between('This is my name', 'This', 'name');

// ' is my '
```

<a name="method-camel-case"></a>
#### `Str::camel()`

`Str::camel` 메서드는 주어진 문자열을 `camelCase` 형태로 변환합니다.

```
use Illuminate\Support\Str;

$converted = Str::camel('foo_bar');

// fooBar
```

<a name="method-str-contains"></a>
#### `Str::contains()`

`Str::contains` 메서드는 주어진 문자열이 특정 값을 포함하고 있는지 확인합니다. 이 메서드는 대소문자를 구분(case sensitive)합니다.

```
use Illuminate\Support\Str;

$contains = Str::contains('This is my name', 'my');

// true
```

값의 배열을 전달할 수도 있으며, 이 경우 주어진 문자열에 배열 중 하나라도 포함돼 있는지 확인합니다.

```
use Illuminate\Support\Str;

$contains = Str::contains('This is my name', ['my', 'foo']);

// true
```

<a name="method-str-contains-all"></a>
#### `Str::containsAll()`

`Str::containsAll` 메서드는 주어진 문자열이 배열 내의 모든 값을 모두 포함하는지 확인합니다.

```
use Illuminate\Support\Str;

$containsAll = Str::containsAll('This is my name', ['my', 'name']);

// true
```

<a name="method-ends-with"></a>
#### `Str::endsWith()`

`Str::endsWith` 메서드는 주어진 문자열이 특정 값으로 끝나는지 확인합니다.

```
use Illuminate\Support\Str;

$result = Str::endsWith('This is my name', 'name');

// true
```

값의 배열을 전달해서, 문자열이 해당 배열 중 하나로 끝나는지 확인할 수도 있습니다.

```
use Illuminate\Support\Str;

$result = Str::endsWith('This is my name', ['name', 'foo']);

// true

$result = Str::endsWith('This is my name', ['this', 'foo']);

// false
```

<a name="method-str-finish"></a>
#### `Str::finish()`

`Str::finish` 메서드는 문자열이 지정한 값으로 끝나지 않는 경우, 해당 값을 문자열 끝에 단 한 번 추가합니다.

```
use Illuminate\Support\Str;

$adjusted = Str::finish('this/string', '/');

// this/string/

$adjusted = Str::finish('this/string/', '/');

// this/string/
```

<a name="method-str-headline"></a>
#### `Str::headline()`

`Str::headline` 메서드는 대소문자, 하이픈(-), 밑줄(_)로 구분된 문자열을 각 단어의 첫 글자가 대문자인 공백 구분 문자열로 변환합니다.

```
use Illuminate\Support\Str;

$headline = Str::headline('steve_jobs');

// Steve Jobs

$headline = Str::headline('EmailNotificationSent');

// Email Notification Sent
```

<a name="method-str-is"></a>
#### `Str::is()`

`Str::is` 메서드는 주어진 문자열이 특정 패턴과 일치하는지 확인합니다. 와일드카드 값으로 별표(*)를 사용할 수 있습니다.

```
use Illuminate\Support\Str;

$matches = Str::is('foo*', 'foobar');

// true

$matches = Str::is('baz*', 'foobar');

// false
```

<a name="method-str-is-ascii"></a>
#### `Str::isAscii()`

`Str::isAscii` 메서드는 주어진 문자열이 7비트 ASCII(ASCII 문자 집합)에 해당하는지 확인합니다.

```
use Illuminate\Support\Str;

$isAscii = Str::isAscii('Taylor');

// true

$isAscii = Str::isAscii('ü');

// false
```

<a name="method-str-is-uuid"></a>
#### `Str::isUuid()`

`Str::isUuid` 메서드는 주어진 문자열이 올바른 UUID 형식인지 확인합니다.

```
use Illuminate\Support\Str;

$isUuid = Str::isUuid('a0a2a2d2-0b87-4a18-83f2-2529882be2de');

// true

$isUuid = Str::isUuid('laravel');

// false
```

<a name="method-kebab-case"></a>
#### `Str::kebab()`

`Str::kebab` 메서드는 문자열을 `kebab-case` 형태로 변환합니다.

```
use Illuminate\Support\Str;

$converted = Str::kebab('fooBar');

// foo-bar
```

<a name="method-str-length"></a>
#### `Str::length()`

`Str::length` 메서드는 주어진 문자열의 길이를 반환합니다.

```
use Illuminate\Support\Str;

$length = Str::length('Laravel');

// 7
```

<a name="method-str-limit"></a>
#### `Str::limit()`

`Str::limit` 메서드는 주어진 문자열을 지정한 길이까지만 잘라 반환합니다.

```
use Illuminate\Support\Str;

$truncated = Str::limit('The quick brown fox jumps over the lazy dog', 20);

// The quick brown fox...
```

세 번째 인자를 전달하여 잘린 문자열 끝에 붙일 문자열을 변경할 수도 있습니다.

```
use Illuminate\Support\Str;

$truncated = Str::limit('The quick brown fox jumps over the lazy dog', 20, ' (...)');

// The quick brown fox (...)
```

<a name="method-str-lower"></a>
#### `Str::lower()`

`Str::lower` 메서드는 주어진 문자열을 모두 소문자로 변환합니다.

```
use Illuminate\Support\Str;

$converted = Str::lower('LARAVEL');

// laravel
```

<a name="method-str-markdown"></a>
#### `Str::markdown()`

`Str::markdown` 메서드는 GitHub 스타일의 마크다운을 HTML로 변환합니다.

```
use Illuminate\Support\Str;

$html = Str::markdown('# Laravel');

// <h1>Laravel</h1>

$html = Str::markdown('# Taylor <b>Otwell</b>', [
    'html_input' => 'strip',
]);

// <h1>Taylor Otwell</h1>
```

<a name="method-str-mask"></a>
#### `Str::mask()`

`Str::mask` 메서드는 문자열의 일부를 지정한 문자로 반복해서 덮어씌워 마스킹합니다. 이 기능은 이메일, 휴대폰 번호 등 문자열의 일부를 숨길 때 유용합니다.

```
use Illuminate\Support\Str;

$string = Str::mask('taylor@example.com', '*', 3);

// tay***************
```

필요하다면 세 번째 인자에 음수를 전달하여 문자열 끝에서부터의 거리로 마스킹을 시작하도록 할 수 있습니다.

```
$string = Str::mask('taylor@example.com', '*', -15, 3);

// tay***@example.com
```

<a name="method-str-ordered-uuid"></a>
#### `Str::orderedUuid()`

`Str::orderedUuid` 메서드는 인덱스가 적용된 데이터베이스 컬럼에 효율적으로 저장될 수 있는 "타임스탬프 우선(timestamp first)" UUID를 생성합니다. 이 메서드를 통해 생성된 각 UUID는 이전에 생성된 UUID보다 정렬상 뒤에 오도록 만들어집니다.

```
use Illuminate\Support\Str;

return (string) Str::orderedUuid();
```

<a name="method-str-padboth"></a>
#### `Str::padBoth()`

`Str::padBoth` 메서드는 PHP의 `str_pad` 함수를 감싸서, 문자열의 양쪽에 지정한 문자열을 붙여 원하는 길이까지 채웁니다.

```
use Illuminate\Support\Str;

$padded = Str::padBoth('James', 10, '_');

// '__James___'

$padded = Str::padBoth('James', 10);

// '  James   '
```

<a name="method-str-padleft"></a>
#### `Str::padLeft()`

`Str::padLeft` 메서드는 PHP의 `str_pad` 함수를 감싸, 문자열의 왼쪽에 지정한 문자열을 덧붙여 원하는 길이까지 채웁니다.

```
use Illuminate\Support\Str;

$padded = Str::padLeft('James', 10, '-=');

// '-=-=-James'

$padded = Str::padLeft('James', 10);

// '     James'
```

<a name="method-str-padright"></a>
#### `Str::padRight()`

`Str::padRight` 메서드는 PHP의 `str_pad` 함수를 감싸, 문자열의 오른쪽에 지정한 문자열을 덧붙여 원하는 길이까지 채웁니다.

```
use Illuminate\Support\Str;

$padded = Str::padRight('James', 10, '-');

// 'James-----'

$padded = Str::padRight('James', 10);

// 'James     '
```

<a name="method-str-plural"></a>
#### `Str::plural()`

`Str::plural` 메서드는 단수 형태의 단어 문자열을 복수형으로 변환합니다. 이 함수는 현재 영어만 지원합니다.

```
use Illuminate\Support\Str;

$plural = Str::plural('car');

// cars

$plural = Str::plural('child');

// children
```

두 번째 인수로 정수를 제공하여, 문자열을 단수 또는 복수형으로 받을 수 있습니다.

```
use Illuminate\Support\Str;

$plural = Str::plural('child', 2);

// children

$singular = Str::plural('child', 1);

// child
```

<a name="method-str-plural-studly"></a>
#### `Str::pluralStudly()`

`Str::pluralStudly` 메서드는 StudlyCaps(각 단어 첫 글자가 대문자인 형태)의 단어 문자열을 복수형으로 변환합니다. 이 함수는 현재 영어만 지원합니다.

```
use Illuminate\Support\Str;

$plural = Str::pluralStudly('VerifiedHuman');

// VerifiedHumans

$plural = Str::pluralStudly('UserFeedback');

// UserFeedback
```

이 함수에도 두 번째 인수로 정수를 제공하여 단수 또는 복수형을 반환하도록 할 수 있습니다.

```
use Illuminate\Support\Str;

$plural = Str::pluralStudly('VerifiedHuman', 2);

// VerifiedHumans

$singular = Str::pluralStudly('VerifiedHuman', 1);

// VerifiedHuman
```

<a name="method-str-random"></a>
#### `Str::random()`

`Str::random` 메서드는 지정한 길이만큼의 임의(random) 문자열을 생성합니다. 이 함수는 PHP의 `random_bytes` 함수를 사용합니다.

```
use Illuminate\Support\Str;

$random = Str::random(40);
```

<a name="method-str-remove"></a>

#### `Str::remove()`

`Str::remove` 메서드는 주어진 값이나 값의 배열을 문자열에서 제거합니다.

```
use Illuminate\Support\Str;

$string = 'Peter Piper picked a peck of pickled peppers.';

$removed = Str::remove('e', $string);

// Ptr Pipr pickd a pck of pickld ppprs.
```

또한 세 번째 인자로 `false`를 전달하면 대소문자를 구분하지 않고 문자열을 제거할 수 있습니다.

<a name="method-str-replace"></a>
#### `Str::replace()`

`Str::replace` 메서드는 문자열 내에서 지정한 문자열을 다른 문자열로 교체합니다.

```
use Illuminate\Support\Str;

$string = 'Laravel 8.x';

$replaced = Str::replace('8.x', '9.x', $string);

// Laravel 9.x
```

<a name="method-str-replace-array"></a>
#### `Str::replaceArray()`

`Str::replaceArray` 메서드는 주어진 문자열에서 지정된 값을 배열의 요소로 순차적으로 교체합니다.

```
use Illuminate\Support\Str;

$string = 'The event will take place between ? and ?';

$replaced = Str::replaceArray('?', ['8:30', '9:00'], $string);

// The event will take place between 8:30 and 9:00
```

<a name="method-str-replace-first"></a>
#### `Str::replaceFirst()`

`Str::replaceFirst` 메서드는 문자열에서 지정한 값이 처음 등장하는 부분만 교체합니다.

```
use Illuminate\Support\Str;

$replaced = Str::replaceFirst('the', 'a', 'the quick brown fox jumps over the lazy dog');

// a quick brown fox jumps over the lazy dog
```

<a name="method-str-replace-last"></a>
#### `Str::replaceLast()`

`Str::replaceLast` 메서드는 문자열에서 지정한 값이 마지막으로 등장하는 부분만 교체합니다.

```
use Illuminate\Support\Str;

$replaced = Str::replaceLast('the', 'a', 'the quick brown fox jumps over the lazy dog');

// the quick brown fox jumps over a lazy dog
```

<a name="method-str-reverse"></a>
#### `Str::reverse()`

`Str::reverse` 메서드는 주어진 문자열을 뒤집어서 반환합니다.

```
use Illuminate\Support\Str;

$reversed = Str::reverse('Hello World');

// dlroW olleH
```

<a name="method-str-singular"></a>
#### `Str::singular()`

`Str::singular` 메서드는 문자열을 단수형으로 변환합니다. 이 기능은 현재 영어만 지원합니다.

```
use Illuminate\Support\Str;

$singular = Str::singular('cars');

// car

$singular = Str::singular('children');

// child
```

<a name="method-str-slug"></a>
#### `Str::slug()`

`Str::slug` 메서드는 주어진 문자열로부터 URL에 적합한 슬러그(slug)를 생성합니다.

```
use Illuminate\Support\Str;

$slug = Str::slug('Laravel 5 Framework', '-');

// laravel-5-framework
```

<a name="method-snake-case"></a>
#### `Str::snake()`

`Str::snake` 메서드는 주어진 문자열을 `snake_case`로 변환합니다.

```
use Illuminate\Support\Str;

$converted = Str::snake('fooBar');

// foo_bar

$converted = Str::snake('fooBar', '-');

// foo-bar
```

<a name="method-str-start"></a>
#### `Str::start()`

`Str::start` 메서드는 주어진 값으로 문자열이 시작하지 않으면 한 번만 그 값을 문자열 앞에 추가합니다.

```
use Illuminate\Support\Str;

$adjusted = Str::start('this/string', '/');

// /this/string

$adjusted = Str::start('/this/string', '/');

// /this/string
```

<a name="method-starts-with"></a>
#### `Str::startsWith()`

`Str::startsWith` 메서드는 주어진 문자열이 특정 값으로 시작하는지 확인합니다.

```
use Illuminate\Support\Str;

$result = Str::startsWith('This is my name', 'This');

// true
```

가능한 값들의 배열을 전달하면 문자열이 배열 내 값들 중 하나로 시작하는 경우 `true`를 반환합니다.

```
$result = Str::startsWith('This is my name', ['This', 'That', 'There']);

// true
```

<a name="method-studly-case"></a>
#### `Str::studly()`

`Str::studly` 메서드는 주어진 문자열을 `StudlyCase`로 변환합니다.

```
use Illuminate\Support\Str;

$converted = Str::studly('foo_bar');

// FooBar
```

<a name="method-str-substr"></a>
#### `Str::substr()`

`Str::substr` 메서드는 시작 위치와 길이 인자로 지정한 부분 문자열을 반환합니다.

```
use Illuminate\Support\Str;

$converted = Str::substr('The Laravel Framework', 4, 7);

// Laravel
```

<a name="method-str-substrcount"></a>
#### `Str::substrCount()`

`Str::substrCount` 메서드는 주어진 문자열에서 지정한 값이 몇 번 나타나는지 반환합니다.

```
use Illuminate\Support\Str;

$count = Str::substrCount('If you like ice cream, you will like snow cones.', 'like');

// 2
```

<a name="method-str-substrreplace"></a>
#### `Str::substrReplace()`

`Str::substrReplace` 메서드는 세 번째 인자로 전달한 위치에서 네 번째 인자로 지정한 문자 수만큼을 새로운 문자열로 교체합니다. 네 번째 인자에 `0`을 전달하면 해당 위치에 문자열을 삽입하고 원래 문자는 남겨둡니다.

```
use Illuminate\Support\Str;

$result = Str::substrReplace('1300', ':', 2); 
// 13:

$result = Str::substrReplace('1300', ':', 2, 0); 
// 13:00
```

<a name="method-title-case"></a>
#### `Str::title()`

`Str::title` 메서드는 주어진 문자열을 Title Case(각 단어의 첫 글자가 대문자)로 변환합니다.

```
use Illuminate\Support\Str;

$converted = Str::title('a nice title uses the correct case');

// A Nice Title Uses The Correct Case
```

<a name="method-str-to-html-string"></a>
#### `Str::toHtmlString()`

`Str::toHtmlString` 메서드는 문자열 인스턴스를 `Illuminate\Support\HtmlString` 인스턴스로 변환하여, Blade 템플릿 등에서 사용할 수 있게 해줍니다.

```
use Illuminate\Support\Str;

$htmlString = Str::of('Nuno Maduro')->toHtmlString();
```

<a name="method-str-ucfirst"></a>
#### `Str::ucfirst()`

`Str::ucfirst` 메서드는 주어진 문자열의 첫 글자를 대문자로 변환하여 반환합니다.

```
use Illuminate\Support\Str;

$string = Str::ucfirst('foo bar');

// Foo bar
```

<a name="method-str-upper"></a>
#### `Str::upper()`

`Str::upper` 메서드는 주어진 문자열을 모두 대문자로 변환합니다.

```
use Illuminate\Support\Str;

$string = Str::upper('laravel');

// LARAVEL
```

<a name="method-str-uuid"></a>
#### `Str::uuid()`

`Str::uuid` 메서드는 UUID(버전 4)를 생성합니다.

```
use Illuminate\Support\Str;

return (string) Str::uuid();
```

<a name="method-str-word-count"></a>
#### `Str::wordCount()`

`Str::wordCount` 메서드는 문자열에 포함된 단어의 개수를 반환합니다.

```php
use Illuminate\Support\Str;

Str::wordCount('Hello, world!'); // 2
```

<a name="method-str-words"></a>
#### `Str::words()`

`Str::words` 메서드는 문자열의 단어 수를 제한합니다. 세 번째 인자로 추가 문자열을 전달하면 잘린 문자열 뒤에 붙입니다.

```
use Illuminate\Support\Str;

return Str::words('Perfectly balanced, as all things should be.', 3, ' >>>');

// Perfectly balanced, as >>>
```

<a name="method-trans"></a>
#### `trans()`

`trans` 함수는 주어진 번역 키를 [로컬라이제이션 파일](/docs/8.x/localization)을 사용하여 번역합니다.

```
echo trans('messages.welcome');
```

지정한 번역 키가 존재하지 않으면, `trans` 함수는 해당 키를 그대로 반환합니다. 위 예시에서 번역 키가 존재하지 않으면 `trans` 함수는 `messages.welcome`을 반환합니다.

<a name="method-trans-choice"></a>
#### `trans_choice()`

`trans_choice` 함수는 주어진 번역 키에서 복수형 처리를 포함하여 번역을 반환합니다.

```
echo trans_choice('messages.notifications', $unreadCount);
```

지정한 번역 키가 존재하지 않으면, `trans_choice` 함수는 해당 키를 그대로 반환합니다. 위 예시에서 번역 키가 존재하지 않으면 `trans_choice` 함수는 `messages.notifications`를 반환합니다.

<a name="fluent-strings"></a>
## Fluent 문자열(Fluent Strings)

Fluent 문자열은 문자열을 다루기 위한 더 읽기 쉽고 명확한, 객체 지향적 방식의 인터페이스를 제공합니다. 여러 문자열 조작을 메서드 체이닝 방식으로 연속해서 수행할 수 있습니다.

<a name="method-fluent-str-after"></a>
#### `after`

`after` 메서드는 문자열에서 지정한 값 이후의 모든 내용을 반환합니다. 지정한 값이 문자열 내에 없으면 전체 문자열이 반환됩니다.

```
use Illuminate\Support\Str;

$slice = Str::of('This is my name')->after('This is');

// ' my name'
```

<a name="method-fluent-str-after-last"></a>
#### `afterLast`

`afterLast` 메서드는 지정한 값이 마지막으로 등장한 이후의 모든 내용을 문자열에서 반환합니다. 지정한 값이 없다면 전체 문자열이 반환됩니다.

```
use Illuminate\Support\Str;

$slice = Str::of('App\Http\Controllers\Controller')->afterLast('\\');

// 'Controller'
```

<a name="method-fluent-str-append"></a>
#### `append`

`append` 메서드는 주어진 값을 문자열에 덧붙입니다.

```
use Illuminate\Support\Str;

$string = Str::of('Taylor')->append(' Otwell');

// 'Taylor Otwell'
```

<a name="method-fluent-str-ascii"></a>
#### `ascii`

`ascii` 메서드는 문자열을 가능한 한 ASCII 값으로 변환(음절 변환)하려고 시도합니다.

```
use Illuminate\Support\Str;

$string = Str::of('ü')->ascii();

// 'u'
```

<a name="method-fluent-str-basename"></a>
#### `basename`

`basename` 메서드는 주어진 문자열에서 마지막 노드(파일 등)의 이름만 반환합니다.

```
use Illuminate\Support\Str;

$string = Str::of('/foo/bar/baz')->basename();

// 'baz'
```

필요하다면 ‘확장자’ 값을 인자로 전달해 마지막 컴포넌트에서 해당 확장자를 제거할 수도 있습니다.

```
use Illuminate\Support\Str;

$string = Str::of('/foo/bar/baz.jpg')->basename('.jpg');

// 'baz'
```

<a name="method-fluent-str-before"></a>
#### `before`

`before` 메서드는 문자열에서 지정한 값 앞의 모든 내용을 반환합니다.

```
use Illuminate\Support\Str;

$slice = Str::of('This is my name')->before('my name');

// 'This is '
```

<a name="method-fluent-str-before-last"></a>
#### `beforeLast`

`beforeLast` 메서드는 지정한 값이 마지막으로 등장하기 전까지의 문자열을 반환합니다.

```
use Illuminate\Support\Str;

$slice = Str::of('This is my name')->beforeLast('is');

// 'This '
```

<a name="method-fluent-str-between"></a>
#### `between`

`between` 메서드는 두 값 사이에 위치한 문자열 부분을 반환합니다.

```
use Illuminate\Support\Str;

$converted = Str::of('This is my name')->between('This', 'name');

// ' is my '
```

<a name="method-fluent-str-camel"></a>
#### `camel`

`camel` 메서드는 주어진 문자열을 `camelCase`로 변환합니다.

```
use Illuminate\Support\Str;

$converted = Str::of('foo_bar')->camel();

// fooBar
```

<a name="method-fluent-str-contains"></a>
#### `contains`

`contains` 메서드는 주어진 문자열이 지정한 값을 포함하고 있는지 판별합니다. 이 메서드는 대소문자를 구분합니다.

```
use Illuminate\Support\Str;

$contains = Str::of('This is my name')->contains('my');

// true
```

값 배열을 전달하면, 배열 중 하나라도 포함되어 있으면 `true`를 반환합니다.

```
use Illuminate\Support\Str;

$contains = Str::of('This is my name')->contains(['my', 'foo']);

// true
```

<a name="method-fluent-str-contains-all"></a>
#### `containsAll`

`containsAll` 메서드는 주어진 문자열이 배열 내 모든 값들을 포함하고 있는지 판별합니다.

```
use Illuminate\Support\Str;

$containsAll = Str::of('This is my name')->containsAll(['my', 'name']);

// true
```

<a name="method-fluent-str-dirname"></a>
#### `dirname`

`dirname` 메서드는 주어진 문자열에서 상위 디렉터리 위치만 반환합니다.

```
use Illuminate\Support\Str;

$string = Str::of('/foo/bar/baz')->dirname();

// '/foo/bar'
```

필요하다면 몇 단계의 디렉터리 레벨까지 잘라낼지를 지정할 수 있습니다.

```
use Illuminate\Support\Str;

$string = Str::of('/foo/bar/baz')->dirname(2);

// '/foo'
```

<a name="method-fluent-str-ends-with"></a>
#### `endsWith`

`endsWith` 메서드는 주어진 문자열이 특정 값으로 끝나는지 확인합니다.

```
use Illuminate\Support\Str;

$result = Str::of('This is my name')->endsWith('name');

// true
```

값의 배열을 전달하면, 배열 내 값 중 하나로 끝나면 `true`를 반환합니다.

```
use Illuminate\Support\Str;

$result = Str::of('This is my name')->endsWith(['name', 'foo']);

// true

$result = Str::of('This is my name')->endsWith(['this', 'foo']);

// false
```

<a name="method-fluent-str-exactly"></a>
#### `exactly`

`exactly` 메서드는 주어진 문자열이 다른 문자열과 정확히 일치하는지 확인합니다.

```
use Illuminate\Support\Str;

$result = Str::of('Laravel')->exactly('Laravel');

// true
```

<a name="method-fluent-str-explode"></a>

#### `explode`

`explode` 메서드는 주어진 구분자(delimiter)로 문자열을 분리하여, 분리된 각 부분을 컬렉션에 담아 반환합니다.

```
use Illuminate\Support\Str;

$collection = Str::of('foo bar baz')->explode(' ');

// collect(['foo', 'bar', 'baz'])
```

<a name="method-fluent-str-finish"></a>
#### `finish`

`finish` 메서드는 문자열이 이미 해당 값으로 끝나지 않는 경우, 주어진 값을 한 번만 문자열 끝에 추가합니다.

```
use Illuminate\Support\Str;

$adjusted = Str::of('this/string')->finish('/');

// this/string/

$adjusted = Str::of('this/string/')->finish('/');

// this/string/
```

<a name="method-fluent-str-is"></a>
#### `is`

`is` 메서드는 주어진 문자열이 특정 패턴과 일치하는지 확인합니다. 이 때 별표(*)를 와일드카드 문자로 사용할 수 있습니다.

```
use Illuminate\Support\Str;

$matches = Str::of('foobar')->is('foo*');

// true

$matches = Str::of('foobar')->is('baz*');

// false
```

<a name="method-fluent-str-is-ascii"></a>
#### `isAscii`

`isAscii` 메서드는 주어진 문자열이 ASCII 문자열인지 판별합니다.

```
use Illuminate\Support\Str;

$result = Str::of('Taylor')->isAscii();

// true

$result = Str::of('ü')->isAscii();

// false
```

<a name="method-fluent-str-is-empty"></a>
#### `isEmpty`

`isEmpty` 메서드는 주어진 문자열이 비어 있는지를 확인합니다.

```
use Illuminate\Support\Str;

$result = Str::of('  ')->trim()->isEmpty();

// true

$result = Str::of('Laravel')->trim()->isEmpty();

// false
```

<a name="method-fluent-str-is-not-empty"></a>
#### `isNotEmpty`

`isNotEmpty` 메서드는 주어진 문자열이 비어 있지 않은지를 확인합니다.

```
use Illuminate\Support\Str;

$result = Str::of('  ')->trim()->isNotEmpty();

// false

$result = Str::of('Laravel')->trim()->isNotEmpty();

// true
```

<a name="method-fluent-str-is-uuid"></a>
#### `isUuid`

`isUuid` 메서드는 주어진 문자열이 UUID인지 판별합니다.

```
use Illuminate\Support\Str;

$result = Str::of('5ace9ab9-e9cf-4ec6-a19d-5881212a452c')->isUuid();

// true

$result = Str::of('Taylor')->isUuid();

// false
```

<a name="method-fluent-str-kebab"></a>
#### `kebab`

`kebab` 메서드는 주어진 문자열을 `kebab-case` 형식으로 변환합니다.

```
use Illuminate\Support\Str;

$converted = Str::of('fooBar')->kebab();

// foo-bar
```

<a name="method-fluent-str-length"></a>
#### `length`

`length` 메서드는 주어진 문자열의 길이를 반환합니다.

```
use Illuminate\Support\Str;

$length = Str::of('Laravel')->length();

// 7
```

<a name="method-fluent-str-limit"></a>
#### `limit`

`limit` 메서드는 주어진 문자열을 지정한 길이만큼만 잘라내어 반환합니다.

```
use Illuminate\Support\Str;

$truncated = Str::of('The quick brown fox jumps over the lazy dog')->limit(20);

// The quick brown fox...
```

잘라낸 문자열 끝에 어떤 문자열을 추가할지 두 번째 인자로 지정할 수도 있습니다.

```
use Illuminate\Support\Str;

$truncated = Str::of('The quick brown fox jumps over the lazy dog')->limit(20, ' (...)');

// The quick brown fox (...)
```

<a name="method-fluent-str-lower"></a>
#### `lower`

`lower` 메서드는 주어진 문자열을 모두 소문자로 변환합니다.

```
use Illuminate\Support\Str;

$result = Str::of('LARAVEL')->lower();

// 'laravel'
```

<a name="method-fluent-str-ltrim"></a>
#### `ltrim`

`ltrim` 메서드는 문자열의 왼쪽(시작 부분)의 공백 또는 지정한 문자를 제거합니다.

```
use Illuminate\Support\Str;

$string = Str::of('  Laravel  ')->ltrim();

// 'Laravel  '

$string = Str::of('/Laravel/')->ltrim('/');

// 'Laravel/'
```

<a name="method-fluent-str-markdown"></a>
#### `markdown`

`markdown` 메서드는 GitHub Flavored Markdown을 HTML로 변환합니다.

```
use Illuminate\Support\Str;

$html = Str::of('# Laravel')->markdown();

// <h1>Laravel</h1>

$html = Str::of('# Taylor <b>Otwell</b>')->markdown([
    'html_input' => 'strip',
]);

// <h1>Taylor Otwell</h1>
```

<a name="method-fluent-str-mask"></a>
#### `mask`

`mask` 메서드는 문자열의 일부를 지정한 문자로 덮어씌웁니다. 이 방법을 사용하면 이메일 주소나 전화번호와 같은 민감한 정보를 일부 가릴 수 있습니다.

```
use Illuminate\Support\Str;

$string = Str::of('taylor@example.com')->mask('*', 3);

// tay***************
```

필요하다면 세 번째 인자에 음수를 전달하여, 문자열 끝에서부터 특정 거리만큼 떨어진 지점부터 마스킹을 시작하도록 할 수 있습니다.

```
$string = Str::of('taylor@example.com')->mask('*', -15, 3);

// tay***@example.com
```

<a name="method-fluent-str-match"></a>
#### `match`

`match` 메서드는 주어진 정규 표현식 패턴과 일치하는 문자열의 일부를 반환합니다.

```
use Illuminate\Support\Str;

$result = Str::of('foo bar')->match('/bar/');

// 'bar'

$result = Str::of('foo bar')->match('/foo (.*)/');

// 'bar'
```

<a name="method-fluent-str-match-all"></a>
#### `matchAll`

`matchAll` 메서드는 주어진 정규 표현식 패턴에 일치하는 문자열의 부분들을 컬렉션으로 반환합니다.

```
use Illuminate\Support\Str;

$result = Str::of('bar foo bar')->matchAll('/bar/');

// collect(['bar', 'bar'])
```

표현식에 그룹을 지정하면 해당 그룹에 일치하는 결과의 컬렉션을 반환합니다.

```
use Illuminate\Support\Str;

$result = Str::of('bar fun bar fly')->matchAll('/f(\w*)/');

// collect(['un', 'ly']);
```

일치하는 결과가 없으면 빈 컬렉션이 반환됩니다.

<a name="method-fluent-str-padboth"></a>
#### `padBoth`

`padBoth` 메서드는 PHP의 `str_pad` 함수를 감싸 양쪽에 문자열을 덧붙여, 최종 문자열 길이가 원하는 길이가 되도록 만듭니다.

```
use Illuminate\Support\Str;

$padded = Str::of('James')->padBoth(10, '_');

// '__James___'

$padded = Str::of('James')->padBoth(10);

// '  James   '
```

<a name="method-fluent-str-padleft"></a>
#### `padLeft`

`padLeft` 메서드는 PHP의 `str_pad` 함수를 감싸, 문자열의 왼쪽에 지정한 문자열을 덧붙여 최종 문자열 길이가 지정한 값이 되도록 만듭니다.

```
use Illuminate\Support\Str;

$padded = Str::of('James')->padLeft(10, '-=');

// '-=-=-James'

$padded = Str::of('James')->padLeft(10);

// '     James'
```

<a name="method-fluent-str-padright"></a>
#### `padRight`

`padRight` 메서드는 PHP의 `str_pad` 함수를 감싸, 문자열의 오른쪽에 지정한 문자열을 덧붙여 최종 문자열 길이가 지정한 값이 되도록 만듭니다.

```
use Illuminate\Support\Str;

$padded = Str::of('James')->padRight(10, '-');

// 'James-----'

$padded = Str::of('James')->padRight(10);

// 'James     '
```

<a name="method-fluent-str-pipe"></a>
#### `pipe`

`pipe` 메서드는 해당 문자열의 현재 값을 전달인자로 하여 주어진 콜러블(callable)로 전달하여 문자열을 변환합니다.

```
use Illuminate\Support\Str;

$hash = Str::of('Laravel')->pipe('md5')->prepend('Checksum: ');

// 'Checksum: a5c95b86291ea299fcbe64458ed12702'

$closure = Str::of('foo')->pipe(function ($str) {
    return 'bar';
});

// 'bar'
```

<a name="method-fluent-str-plural"></a>
#### `plural`

`plural` 메서드는 단수 단어 문자열을 복수형으로 변환합니다. 이 기능은 현재 영어만 지원합니다.

```
use Illuminate\Support\Str;

$plural = Str::of('car')->plural();

// cars

$plural = Str::of('child')->plural();

// children
```

또한 정수 값을 두 번째 인자로 전달하여, 단수형 또는 복수형을 얻을 수도 있습니다.

```
use Illuminate\Support\Str;

$plural = Str::of('child')->plural(2);

// children

$plural = Str::of('child')->plural(1);

// child
```

<a name="method-fluent-str-prepend"></a>
#### `prepend`

`prepend` 메서드는 주어진 값을 문자열 앞에 붙입니다.

```
use Illuminate\Support\Str;

$string = Str::of('Framework')->prepend('Laravel ');

// Laravel Framework
```

<a name="method-fluent-str-remove"></a>
#### `remove`

`remove` 메서드는 문자열에서 주어진 값 또는 값들의 배열을 제거합니다.

```
use Illuminate\Support\Str;

$string = Str::of('Arkansas is quite beautiful!')->remove('quite');

// Arkansas is beautiful!
```

두 번째 인자로 `false`를 전달하면 대소문자를 구분하지 않고 삭제할 수 있습니다.

<a name="method-fluent-str-replace"></a>
#### `replace`

`replace` 메서드는 문자열 내에 존재하는 특정 값을 다른 값으로 교체합니다.

```
use Illuminate\Support\Str;

$replaced = Str::of('Laravel 6.x')->replace('6.x', '7.x');

// Laravel 7.x
```

<a name="method-fluent-str-replace-array"></a>
#### `replaceArray`

`replaceArray` 메서드는 주어진 값을 문자열에서 찾아, 배열에 있는 값들로 차례대로 교체합니다.

```
use Illuminate\Support\Str;

$string = 'The event will take place between ? and ?';

$replaced = Str::of($string)->replaceArray('?', ['8:30', '9:00']);

// The event will take place between 8:30 and 9:00
```

<a name="method-fluent-str-replace-first"></a>
#### `replaceFirst`

`replaceFirst` 메서드는 문자열에서 주어진 값이 처음 등장하는 부분만 다른 값으로 교체합니다.

```
use Illuminate\Support\Str;

$replaced = Str::of('the quick brown fox jumps over the lazy dog')->replaceFirst('the', 'a');

// a quick brown fox jumps over the lazy dog
```

<a name="method-fluent-str-replace-last"></a>
#### `replaceLast`

`replaceLast` 메서드는 문자열에서 주어진 값이 마지막으로 등장하는 부분을 다른 값으로 교체합니다.

```
use Illuminate\Support\Str;

$replaced = Str::of('the quick brown fox jumps over the lazy dog')->replaceLast('the', 'a');

// the quick brown fox jumps over a lazy dog
```

<a name="method-fluent-str-replace-matches"></a>
#### `replaceMatches`

`replaceMatches` 메서드는 주어진 패턴과 일치하는 문자열의 모든 부분을 지정한 값으로 교체합니다.

```
use Illuminate\Support\Str;

$replaced = Str::of('(+1) 501-555-1000')->replaceMatches('/[^A-Za-z0-9]++/', '')

// '15015551000'
```

이 메서드는 콜로저(익명 함수)도 인자로 받을 수 있습니다. 이 경우 패턴과 일치하는 문자열을 인자로 하여 콜로저가 호출되며, 콜로저 내에서 교체 로직을 작성해 반환할 수 있습니다.

```
use Illuminate\Support\Str;

$replaced = Str::of('123')->replaceMatches('/\d/', function ($match) {
    return '['.$match[0].']';
});

// '[1][2][3]'
```

<a name="method-fluent-str-rtrim"></a>
#### `rtrim`

`rtrim` 메서드는 주어진 문자열의 오른쪽(끝부분)에서 공백 또는 지정한 문자를 제거합니다.

```
use Illuminate\Support\Str;

$string = Str::of('  Laravel  ')->rtrim();

// '  Laravel'

$string = Str::of('/Laravel/')->rtrim('/');

// '/Laravel'
```

<a name="method-fluent-str-scan"></a>
#### `scan`

`scan` 메서드는 [`sscanf` PHP 함수](https://www.php.net/manual/en/function.sscanf.php)가 지원하는 포맷을 사용해 문자열에서 입력을 파싱하여 컬렉션으로 반환합니다.

```
use Illuminate\Support\Str;

$collection = Str::of('filename.jpg')->scan('%[^.].%s');

// collect(['filename', 'jpg'])
```

<a name="method-fluent-str-singular"></a>
#### `singular`

`singular` 메서드는 문자열을 단수형으로 변환합니다. 현재 영어만 지원합니다.

```
use Illuminate\Support\Str;

$singular = Str::of('cars')->singular();

// car

$singular = Str::of('children')->singular();

// child
```

<a name="method-fluent-str-slug"></a>
#### `slug`

`slug` 메서드는 주어진 문자열로부터 URL에 사용할 수 있는 "슬러그(slug)" 문자열을 만듭니다.

```
use Illuminate\Support\Str;

$slug = Str::of('Laravel Framework')->slug('-');

// laravel-framework
```

<a name="method-fluent-str-snake"></a>
#### `snake`

`snake` 메서드는 주어진 문자열을 `snake_case` 형식으로 변환합니다.

```
use Illuminate\Support\Str;

$converted = Str::of('fooBar')->snake();

// foo_bar
```

<a name="method-fluent-str-split"></a>
#### `split`

`split` 메서드는 정규 표현식을 사용하여 문자열을 컬렉션으로 분할합니다.

```
use Illuminate\Support\Str;

$segments = Str::of('one, two, three')->split('/[\s,]+/');

// collect(["one", "two", "three"])
```

<a name="method-fluent-str-start"></a>

#### `start`

`start` 메서드는 주어진 값으로 시작하지 않는 경우, 해당 값을 문자열의 맨 앞에 추가합니다:

```
use Illuminate\Support\Str;

$adjusted = Str::of('this/string')->start('/');

// /this/string

$adjusted = Str::of('/this/string')->start('/');

// /this/string
```

<a name="method-fluent-str-starts-with"></a>
#### `startsWith`

`startsWith` 메서드는 주어진 문자열이 특정 값으로 시작하는지 확인합니다:

```
use Illuminate\Support\Str;

$result = Str::of('This is my name')->startsWith('This');

// true
```

<a name="method-fluent-str-studly"></a>
#### `studly`

`studly` 메서드는 주어진 문자열을 `StudlyCase` 형태로 변환합니다:

```
use Illuminate\Support\Str;

$converted = Str::of('foo_bar')->studly();

// FooBar
```

<a name="method-fluent-str-substr"></a>
#### `substr`

`substr` 메서드는 주어진 시작 위치와 길이(length) 파라미터를 사용해 문자열의 일부를 반환합니다:

```
use Illuminate\Support\Str;

$string = Str::of('Laravel Framework')->substr(8);

// Framework

$string = Str::of('Laravel Framework')->substr(8, 5);

// Frame
```

<a name="method-fluent-str-substrreplace"></a>
#### `substrReplace`

`substrReplace` 메서드는 주어진 위치에서 시작하여 지정한 길이만큼 기존 문자열을 대체하거나, 네 번째 인자에 `0`을 주면 주어진 위치에 문자열을 삽입합니다(기존 문자 미대체):

```
use Illuminate\Support\Str;

$string = Str::of('1300')->substrReplace(':', 2);

// 13:

$string = Str::of('The Framework')->substrReplace(' Laravel', 3, 0);

// The Laravel Framework
```

<a name="method-fluent-str-tap"></a>
#### `tap`

`tap` 메서드는 문자열을 주어진 클로저에 전달하여 문자열을 확인하거나 조작할 수 있게 합니다. 클로저에서 무엇이 반환되던지 상관없이, `tap` 메서드는 원본 문자열을 그대로 반환합니다:

```
use Illuminate\Support\Str;

$string = Str::of('Laravel')
    ->append(' Framework')
    ->tap(function ($string) {
        dump('String after append: ' . $string);
    })
    ->upper();

// LARAVEL FRAMEWORK
```

<a name="method-fluent-str-test"></a>
#### `test`

`test` 메서드는 주어진 정규 표현식 패턴에 문자열이 일치하는지 확인합니다:

```
use Illuminate\Support\Str;

$result = Str::of('Laravel Framework')->test('/Laravel/');

// true
```

<a name="method-fluent-str-title"></a>
#### `title`

`title` 메서드는 주어진 문자열을 `Title Case`(각 단어의 첫 글자만 대문자)로 변환합니다:

```
use Illuminate\Support\Str;

$converted = Str::of('a nice title uses the correct case')->title();

// A Nice Title Uses The Correct Case
```

<a name="method-fluent-str-trim"></a>
#### `trim`

`trim` 메서드는 문자열의 양쪽 끝에 있는 공백 또는 지정한 문자를 제거합니다:

```
use Illuminate\Support\Str;

$string = Str::of('  Laravel  ')->trim();

// 'Laravel'

$string = Str::of('/Laravel/')->trim('/');

// 'Laravel'
```

<a name="method-fluent-str-ucfirst"></a>
#### `ucfirst`

`ucfirst` 메서드는 문자열의 첫 글자를 대문자로 변환하여 반환합니다:

```
use Illuminate\Support\Str;

$string = Str::of('foo bar')->ucfirst();

// Foo bar
```

<a name="method-fluent-str-upper"></a>
#### `upper`

`upper` 메서드는 주어진 문자열을 모두 대문자로 변환합니다:

```
use Illuminate\Support\Str;

$adjusted = Str::of('laravel')->upper();

// LARAVEL
```

<a name="method-fluent-str-when"></a>
#### `when`

`when` 메서드는 주어진 조건이 `true`일 때, 지정한 클로저를 실행합니다. 해당 클로저에는 유연한 문자열 인스턴스가 전달됩니다:

```
use Illuminate\Support\Str;

$string = Str::of('Taylor')
                ->when(true, function ($string) {
                    return $string->append(' Otwell');
                });

// 'Taylor Otwell'
```

필요하다면, `when` 메서드의 세 번째 파라미터로 또 다른 클로저를 전달할 수 있습니다. 이 클로저는 조건이 `false`일 때 실행됩니다.

<a name="method-fluent-str-when-contains"></a>
#### `whenContains`

`whenContains` 메서드는 문자열에 주어진 값이 포함되어 있으면 지정한 클로저를 실행합니다. 클로저에는 유연한 문자열 인스턴스가 전달됩니다:

```
use Illuminate\Support\Str;

$string = Str::of('tony stark')
            ->whenContains('tony', function ($string) {
                return $string->title();
            });

// 'Tony Stark'
```

필요하다면, 세 번째 파라미터로 또 다른 클로저를 전달할 수 있습니다. 이 클로저는 문자열에 값이 포함되어 있지 않을 때 실행됩니다.

또한, 값의 배열을 전달하여 배열 내 어떤 값이라도 문자열에 포함되어 있는지 판단할 수 있습니다:

```
use Illuminate\Support\Str;

$string = Str::of('tony stark')
            ->whenContains(['tony', 'hulk'], function ($string) {
                return $string->title();
            });

// Tony Stark
```

<a name="method-fluent-str-when-contains-all"></a>
#### `whenContainsAll`

`whenContainsAll` 메서드는 문자열에 주어진 모든 부분 문자열이 모두 포함되어 있을 때 클로저를 실행합니다. 클로저에는 유연한 문자열 인스턴스가 전달됩니다:

```
use Illuminate\Support\Str;

$string = Str::of('tony stark')
                ->whenContainsAll(['tony', 'stark'], function ($string) {
                    return $string->title();
                });

// 'Tony Stark'
```

필요하다면, 세 번째 파라미터로 또 다른 클로저를 전달할 수 있습니다. 이 클로저는 조건이 `false`일 때 실행됩니다.

<a name="method-fluent-str-when-empty"></a>
#### `whenEmpty`

`whenEmpty` 메서드는 문자열이 비어 있을 때 주어진 클로저를 실행합니다. 클로저가 값을 반환하면 해당 값이 반환되고, 그렇지 않으면 유연한 문자열 인스턴스가 반환됩니다:

```
use Illuminate\Support\Str;

$string = Str::of('  ')->whenEmpty(function ($string) {
    return $string->trim()->prepend('Laravel');
});

// 'Laravel'
```

<a name="method-fluent-str-when-not-empty"></a>
#### `whenNotEmpty`

`whenNotEmpty` 메서드는 문자열이 비어 있지 않을 때 주어진 클로저를 실행합니다. 클로저가 값을 반환하면 해당 값이 반환되고, 그렇지 않으면 유연한 문자열 인스턴스가 반환됩니다:

```
use Illuminate\Support\Str;

$string = Str::of('Framework')->whenNotEmpty(function ($string) {
    return $string->prepend('Laravel ');
});

// 'Laravel Framework'
```

<a name="method-fluent-str-when-starts-with"></a>
#### `whenStartsWith`

`whenStartsWith` 메서드는 문자열이 주어진 하위 문자열로 시작하면 클로저를 실행합니다. 클로저에는 유연한 문자열 인스턴스가 전달됩니다:

```
use Illuminate\Support\Str;

$string = Str::of('disney world')->whenStartsWith('disney', function ($string) {
    return $string->title();
});

// 'Disney World'
```

<a name="method-fluent-str-when-ends-with"></a>
#### `whenEndsWith`

`whenEndsWith` 메서드는 문자열이 주어진 하위 문자열로 끝나면 클로저를 실행합니다. 클로저에는 유연한 문자열 인스턴스가 전달됩니다:

```
use Illuminate\Support\Str;

$string = Str::of('disney world')->whenEndsWith('world', function ($string) {
    return $string->title();
});

// 'Disney World'
```

<a name="method-fluent-str-when-exactly"></a>
#### `whenExactly`

`whenExactly` 메서드는 문자열이 주어진 문자열과 정확히 일치할 때 클로저를 실행합니다. 클로저에는 유연한 문자열 인스턴스가 전달됩니다:

```
use Illuminate\Support\Str;

$string = Str::of('laravel')->whenExactly('laravel', function ($string) {
    return $string->title();
});

// 'Laravel'
```

<a name="method-fluent-str-when-is"></a>
#### `whenIs`

`whenIs` 메서드는 문자열이 주어진 패턴과 일치할 때(별표(*)는 와일드카드로 사용 가능) 클로저를 실행합니다. 클로저에는 유연한 문자열 인스턴스가 전달됩니다:

```
use Illuminate\Support\Str;

$string = Str::of('foo/bar')->whenIs('foo/*', function ($string) {
    return $string->append('/baz');
});

// 'foo/bar/baz'
```

<a name="method-fluent-str-when-is-ascii"></a>
#### `whenIsAscii`

`whenIsAscii` 메서드는 문자열이 7비트 ASCII인 경우 클로저를 실행합니다. 클로저에는 유연한 문자열 인스턴스가 전달됩니다:

```
use Illuminate\Support\Str;

$string = Str::of('foo/bar')->whenIsAscii('laravel', function ($string) {
    return $string->title();
});

// 'Laravel'
```

<a name="method-fluent-str-when-is-uuid"></a>
#### `whenIsUuid`

`whenIsUuid` 메서드는 문자열이 유효한 UUID일 때 클로저를 실행합니다. 클로저에는 유연한 문자열 인스턴스가 전달됩니다:

```
use Illuminate\Support\Str;

$string = Str::of('foo/bar')->whenIsUuid('a0a2a2d2-0b87-4a18-83f2-2529882be2de', function ($string) {
    return $string->substr(0, 8);
});

// 'a0a2a2d2'
```

<a name="method-fluent-str-when-test"></a>
#### `whenTest`

`whenTest` 메서드는 문자열이 주어진 정규 표현식과 매칭될 때 클로저를 실행합니다. 클로저에는 유연한 문자열 인스턴스가 전달됩니다:

```
use Illuminate\Support\Str;

$string = Str::of('laravel framework')->whenTest('/laravel/', function ($string) {
    return $string->title();
});

// 'Laravel Framework'
```

<a name="method-fluent-str-word-count"></a>
#### `wordCount`

`wordCount` 메서드는 문자열이 포함하고 있는 단어의 개수를 반환합니다:

```php
use Illuminate\Support\Str;

Str::of('Hello, world!')->wordCount(); // 2
```

<a name="method-fluent-str-words"></a>
#### `words`

`words` 메서드는 문자열의 단어 개수를 제한합니다. 필요하다면, 잘린 문자열 뒤에 추가로 붙일 내용을 지정할 수도 있습니다:

```
use Illuminate\Support\Str;

$string = Str::of('Perfectly balanced, as all things should be.')->words(3, ' >>>');

// Perfectly balanced, as >>>
```

<a name="urls"></a>
## URL

<a name="method-action"></a>
#### `action()`

`action` 함수는 주어진 컨트롤러 액션의 URL을 생성합니다:

```
use App\Http\Controllers\HomeController;

$url = action([HomeController::class, 'index']);
```

만약 컨트롤러 액션이 라우트 파라미터를 받는다면, 두 번째 인자로 파라미터 배열을 전달할 수 있습니다:

```
$url = action([UserController::class, 'profile'], ['id' => 1]);
```

<a name="method-asset"></a>
#### `asset()`

`asset` 함수는 현재 요청의 스킴(HTTP 또는 HTTPS)을 사용하여 자산(Asset)의 URL을 생성합니다:

```
$url = asset('img/photo.jpg');
```

`.env` 파일에서 `ASSET_URL` 변수를 설정하여 asset URL 호스트를 지정할 수 있습니다. 이는 Amazon S3나 외부 CDN 등 외부 서비스에 자산을 호스팅하는 경우 유용합니다:

```
// ASSET_URL=http://example.com/assets

$url = asset('img/photo.jpg'); // http://example.com/assets/img/photo.jpg
```

<a name="method-route"></a>
#### `route()`

`route` 함수는 [네임드 라우트](/docs/8.x/routing#named-routes)의 URL을 생성합니다:

```
$url = route('route.name');
```

해당 라우트가 파라미터를 받는 경우, 두 번째 인자로 파라미터 배열을 전달할 수 있습니다:

```
$url = route('route.name', ['id' => 1]);
```

기본적으로 `route` 함수는 절대 URL을 생성합니다. 상대 URL을 생성하려면 세 번째 인자에 `false`를 전달하세요:

```
$url = route('route.name', ['id' => 1], false);
```

<a name="method-secure-asset"></a>
#### `secure_asset()`

`secure_asset` 함수는 HTTPS를 사용하여 자산(Asset)의 URL을 생성합니다:

```
$url = secure_asset('img/photo.jpg');
```

<a name="method-secure-url"></a>
#### `secure_url()`

`secure_url` 함수는 주어진 경로에 대해 완전한 HTTPS URL을 생성합니다. 두 번째 인자에 추가 URL 세그먼트를 전달할 수도 있습니다:

```
$url = secure_url('user/profile');

$url = secure_url('user/profile', [1]);
```

<a name="method-url"></a>
#### `url()`

`url` 함수는 주어진 경로에 대해 완전한(절대) URL을 생성합니다:

```
$url = url('user/profile');

$url = url('user/profile', [1]);
```

만약 경로를 지정하지 않으면, `Illuminate\Routing\UrlGenerator` 인스턴스가 반환됩니다:

```
$current = url()->current();

$full = url()->full();

$previous = url()->previous();
```

<a name="miscellaneous"></a>
## 기타

<a name="method-abort"></a>
#### `abort()`

`abort` 함수는 [HTTP 예외](/docs/8.x/errors#http-exceptions)를 발생시키며, [예외 핸들러](/docs/8.x/errors#the-exception-handler)에서 이를 처리하여 렌더링합니다:

```
abort(403);
```

예외 메시지와 브라우저로 전달할 커스텀 HTTP 응답 헤더도 추가로 지정할 수 있습니다:

```
abort(403, 'Unauthorized.', $headers);
```

<a name="method-abort-if"></a>
#### `abort_if()`

`abort_if` 함수는 주어진 불리언 표현식이 `true`일 때 HTTP 예외를 발생시킵니다:

```
abort_if(! Auth::user()->isAdmin(), 403);
```

`abort` 함수와 마찬가지로, 세 번째 인자에 예외 메시지, 네 번째 인자에 추가 응답 헤더를 배열 형태로 전달할 수 있습니다.

<a name="method-abort-unless"></a>
#### `abort_unless()`

`abort_unless` 함수는 주어진 불리언 표현식이 `false`일 때 HTTP 예외를 발생시킵니다:

```
abort_unless(Auth::user()->isAdmin(), 403);
```

`abort` 함수와 마찬가지로, 세 번째 인자에 예외 메시지, 네 번째 인자에 추가 응답 헤더를 배열 형태로 전달할 수 있습니다.

<a name="method-app"></a>
#### `app()`

`app` 함수는 [서비스 컨테이너](/docs/8.x/container) 인스턴스를 반환합니다:

```
$container = app();
```

서비스 컨테이너에 등록된 클래스나 인터페이스명을 전달하면 해당 인스턴스를 반환합니다:

```
$api = app('HelpSpot\API');
```

<a name="method-auth"></a>
#### `auth()`

`auth` 함수는 [인증기](/docs/8.x/authentication) 인스턴스를 반환합니다. `Auth` 파사드 대신 사용할 수 있습니다:

```
$user = auth()->user();
```

필요하다면, 접근하고 싶은 가드 인스턴스를 명시할 수도 있습니다:

```
$user = auth('admin')->user();
```

<a name="method-back"></a>
#### `back()`

`back` 함수는 사용자의 이전 위치로 [리다이렉트 HTTP 응답](/docs/8.x/responses#redirects)을 생성합니다:

```
return back($status = 302, $headers = [], $fallback = '/');

return back();
```

<a name="method-bcrypt"></a>

#### `bcrypt()`

`bcrypt` 함수는 [주어진 값을 Bcrypt로 해싱](/docs/8.x/hashing)합니다. 이 함수는 `Hash` 파사드의 대안으로 사용할 수 있습니다.

```
$password = bcrypt('my-secret-password');
```

<a name="method-blank"></a>
#### `blank()`

`blank` 함수는 주어진 값이 "비어있는지"를 확인합니다.

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

`blank`의 반대 개념 함수로 [`filled`](#method-filled) 메서드를 참고하세요.

<a name="method-broadcast"></a>
#### `broadcast()`

`broadcast` 함수는 주어진 [이벤트](/docs/8.x/events)를 해당 리스너들에게 [브로드캐스트](/docs/8.x/broadcasting)합니다.

```
broadcast(new UserRegistered($user));

broadcast(new UserRegistered($user))->toOthers();
```

<a name="method-cache"></a>
#### `cache()`

`cache` 함수는 [캐시](/docs/8.x/cache)에서 값을 가져올 때 사용할 수 있습니다. 주어진 키가 캐시에 존재하지 않으면 선택적으로 기본값을 반환합니다.

```
$value = cache('key');

$value = cache('key', 'default');
```

배열 형태의 키와 값 쌍을 전달하여 캐시에 항목을 추가할 수도 있습니다. 이때 캐시된 값이 유효하다고 간주될 시간(초 단위나 기간)도 함께 지정해야 합니다.

```
cache(['key' => 'value'], 300);

cache(['key' => 'value'], now()->addSeconds(10));
```

<a name="method-class-uses-recursive"></a>
#### `class_uses_recursive()`

`class_uses_recursive` 함수는 클래스가 사용하는 모든 트레이트와 해당 부모 클래스들이 사용하는 트레이트까지 모두 반환합니다.

```
$traits = class_uses_recursive(App\Models\User::class);
```

<a name="method-collect"></a>
#### `collect()`

`collect` 함수는 주어진 값으로부터 [컬렉션](/docs/8.x/collections) 인스턴스를 생성합니다.

```
$collection = collect(['taylor', 'abigail']);
```

<a name="method-config"></a>
#### `config()`

`config` 함수는 [설정](/docs/8.x/configuration) 변수의 값을 가져옵니다. "도트" 구문을 사용하여 설정 파일명과 옵션명을 포함해 접근할 수 있습니다. 설정 옵션이 존재하지 않을 경우 반환할 기본값도 지정할 수 있습니다.

```
$value = config('app.timezone');

$value = config('app.timezone', $default);
```

실행 중에 배열 형태의 키와 값 쌍을 전달해 설정 값을 변경할 수 있습니다. 단, 이 함수로 변경한 값은 현재 요청에만 적용되며 실제 설정 파일에는 영향을 주지 않습니다.

```
config(['app.debug' => true]);
```

<a name="method-cookie"></a>
#### `cookie()`

`cookie` 함수는 새로운 [쿠키](/docs/8.x/requests#cookies) 인스턴스를 생성합니다.

```
$cookie = cookie('name', 'value', $minutes);
```

<a name="method-csrf-field"></a>
#### `csrf_field()`

`csrf_field` 함수는 CSRF 토큰 값이 담긴 HTML `hidden` 타입 input 필드를 생성합니다. 예를 들어, [Blade 문법](/docs/8.x/blade)을 사용할 때 다음과 같이 사용할 수 있습니다.

```
{{ csrf_field() }}
```

<a name="method-csrf-token"></a>
#### `csrf_token()`

`csrf_token` 함수는 현재 CSRF 토큰 값을 반환합니다.

```
$token = csrf_token();
```

<a name="method-dd"></a>
#### `dd()`

`dd` 함수는 전달된 변수들을 덤프(dump)한 후, 스크립트 실행을 종료합니다.

```
dd($value);

dd($value1, $value2, $value3, ...);
```

스크립트 실행을 중단하지 않고 변수만 출력하고 싶다면 [`dump`](#method-dump) 함수를 사용하세요.

<a name="method-dispatch"></a>
#### `dispatch()`

`dispatch` 함수는 주어진 [잡(job)](/docs/8.x/queues#creating-jobs)을 라라벨 [잡 큐](/docs/8.x/queues)에 넣어 실행합니다.

```
dispatch(new App\Jobs\SendEmails);
```

<a name="method-dump"></a>
#### `dump()`

`dump` 함수는 전달된 변수들을 덤프(dump)합니다.

```
dump($value);

dump($value1, $value2, $value3, ...);
```

덤프한 후 스크립트 실행도 중단하고 싶다면 [`dd`](#method-dd) 함수를 사용하세요.

<a name="method-env"></a>
#### `env()`

`env` 함수는 [환경 변수](/docs/8.x/configuration#environment-configuration)를 가져오거나, 기본값을 반환합니다.

```
$env = env('APP_ENV');

$env = env('APP_ENV', 'production');
```

> [!NOTE]
> 배포 과정에서 `config:cache` 명령어를 실행한다면, 반드시 `env` 함수를 설정 파일 내부에서만 호출해야 합니다. 설정이 캐싱되면 `.env` 파일은 더 이상 로드되지 않으며, 그 이후의 모든 `env` 함수 호출은 `null`을 반환합니다.

<a name="method-event"></a>
#### `event()`

`event` 함수는 주어진 [이벤트](/docs/8.x/events)를 리스너로 디스패치(발생)합니다.

```
event(new UserRegistered($user));
```

<a name="method-filled"></a>
#### `filled()`

`filled` 함수는 주어진 값이 "비어있지 않은지"를 확인합니다.

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

`filled`의 반대 개념 함수로 [`blank`](#method-blank) 메서드를 참고하세요.

<a name="method-info"></a>
#### `info()`

`info` 함수는 애플리케이션의 [로그](/docs/8.x/logging)에 정보를 기록합니다.

```
info('Some helpful information!');
```

컨텍스트 데이터를 배열로 전달해 기록할 수도 있습니다.

```
info('User login attempt failed.', ['id' => $user->id]);
```

<a name="method-logger"></a>
#### `logger()`

`logger` 함수는 `debug` 레벨 메시지를 [로그](/docs/8.x/logging)에 기록할 때 사용할 수 있습니다.

```
logger('Debug message');
```

배열 형태의 컨텍스트 데이터도 함께 전달할 수 있습니다.

```
logger('User has logged in.', ['id' => $user->id]);
```

함수에 아무 값도 전달하지 않으면 [logger](/docs/8.x/errors#logging) 인스턴스가 반환됩니다.

```
logger()->error('You are not allowed here.');
```

<a name="method-method-field"></a>
#### `method_field()`

`method_field` 함수는 폼의 HTTP 메서드 값을 조작(spoof)한 HTML `hidden` 타입 input 필드를 생성합니다. 예를 들어 [Blade 문법](/docs/8.x/blade)에서 다음과 같이 사용할 수 있습니다.

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

`old` 함수는 세션에 플래시된 [이전 입력값](/docs/8.x/requests#old-input)을 [가져옵니다](/docs/8.x/requests#retrieving-input).

```
$value = old('value');

$value = old('value', 'default');
```

<a name="method-optional"></a>
#### `optional()`

`optional` 함수는 어떠한 인수도 받을 수 있으며, 해당 객체의 속성이나 메서드에 접근할 수 있게 합니다. 주어진 객체가 `null`이라면, 속성과 메서드는 에러 대신 `null`을 반환합니다.

```
return optional($user->address)->street;

{!! old('name', optional($user)->name) !!}
```

`optional` 함수는 두 번째 인수로 클로저도 받을 수 있습니다. 첫 번째 인수의 값이 null이 아니면 이 클로저가 실행됩니다.

```
return optional(User::find($id), function ($user) {
    return $user->name;
});
```

<a name="method-policy"></a>
#### `policy()`

`policy` 메서드는 주어진 클래스에 대한 [정책(policy)](/docs/8.x/authorization#creating-policies) 인스턴스를 반환합니다.

```
$policy = policy(App\Models\User::class);
```

<a name="method-redirect"></a>
#### `redirect()`

`redirect` 함수는 [리디렉션 HTTP 응답](/docs/8.x/responses#redirects)을 반환하거나, 인자가 없을 때는 redirector 인스턴스를 반환합니다.

```
return redirect($to = null, $status = 302, $headers = [], $https = null);

return redirect('/home');

return redirect()->route('route.name');
```

<a name="method-report"></a>
#### `report()`

`report` 함수는 애플리케이션의 [예외 처리기](/docs/8.x/errors#the-exception-handler)를 사용하여 예외를 리포팅합니다.

```
report($e);
```

이 함수에 문자열을 전달하면, 해당 문자열을 메시지로 가지는 예외를 생성해 리포팅합니다.

```
report('Something went wrong.');
```

<a name="method-request"></a>
#### `request()`

`request` 함수는 현재 [요청](/docs/8.x/requests) 인스턴스를 반환하거나, 현재 요청에서 입력 필드의 값을 가져옵니다.

```
$request = request();

$value = request('key', $default);
```

<a name="method-rescue"></a>
#### `rescue()`

`rescue` 함수는 전달된 클로저를 실행하면서, 실행 중 발생하는 모든 예외를 잡아냅니다. 잡아낸 예외들은 애플리케이션의 [예외 처리기](/docs/8.x/errors#the-exception-handler)로 전달되지만, 요청 처리는 계속됩니다.

```
return rescue(function () {
    return $this->method();
});
```

`rescue` 함수의 두 번째 인수로 기본값을 전달할 수 있습니다. 클로저 실행 중 예외가 발생하면 이 값을 반환합니다.

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

<a name="method-resolve"></a>
#### `resolve()`

`resolve` 함수는 [서비스 컨테이너](/docs/8.x/container)를 이용해 주어진 클래스나 인터페이스 이름을 인스턴스로 해결(resolve)합니다.

```
$api = resolve('HelpSpot\API');
```

<a name="method-response"></a>
#### `response()`

`response` 함수는 [응답(response)](/docs/8.x/responses) 인스턴스를 생성하거나, 응답 팩토리 인스턴스를 반환합니다.

```
return response('Hello World', 200, $headers);

return response()->json(['foo' => 'bar'], 200, $headers);
```

<a name="method-retry"></a>
#### `retry()`

`retry` 함수는 콜백을 주어진 횟수만큼 반복해서 시도합니다. 콜백이 예외를 던지지 않으면 해당 반환값을 반환하고, 예외가 발생하면 자동으로 재시도합니다. 최대 시도 횟수를 초과하면 예외가 발생합니다.

```
return retry(5, function () {
    // 5번 시도하며, 각 시도 사이에 100ms 대기...
}, 100);
```

시도별 대기시간(ms)을 직접 계산하고 싶을 경우, `retry` 함수의 세 번째 인수로 클로저를 전달하면 됩니다.

```
return retry(5, function () {
    // ...
}, function ($attempt) {
    return $attempt * 100;
});
```

특정 조건이 만족할 때만 재시도하려면 네 번째 인수로 클로저를 전달할 수 있습니다.

```
return retry(5, function () {
    // ...
}, 100, function ($exception) {
    return $exception instanceof RetryException;
});
```

<a name="method-session"></a>
#### `session()`

`session` 함수는 [세션](/docs/8.x/session)에서 값을 가져오거나, 또는 값을 저장할 때 사용할 수 있습니다.

```
$value = session('key');
```

배열 형태의 키와 값 쌍을 전달해 값을 저장할 수 있습니다.

```
session(['chairs' => 7, 'instruments' => 3]);
```

함수에 아무 값을 전달하지 않으면 세션 저장소 인스턴스를 반환합니다.

```
$value = session()->get('key');

session()->put('key', $value);
```

<a name="method-tap"></a>
#### `tap()`

`tap` 함수는 두 개의 인수, 임의의 `$value`와 클로저를 받습니다. `$value`를 클로저에 전달하고, 함수는 항상 `$value`를 반환합니다. 클로저의 반환 값은 무시됩니다.

```
$user = tap(User::first(), function ($user) {
    $user->name = 'taylor';

    $user->save();
});
```

클로저를 전달하지 않으면, 주어진 `$value`에 메서드를 바로 체이닝할 수 있습니다. 호출한 메서드는 원래의 반환값과 관계없이 항상 `$value` 자체를 반환합니다. 예를 들어, Eloquent의 `update` 메서드는 보통 정수를 반환하지만, `tap`을 사용하면 항상 모델 인스턴스를 반환하도록 만들 수 있습니다.

```
$user = tap($user)->update([
    'name' => $name,
    'email' => $email,
]);
```

`tap` 메서드를 클래스에 추가하고 싶다면, `Illuminate\Support\Traits\Tappable` 트레이트를 클래스에 추가하면 됩니다. 이 트레이트의 `tap` 메서드는 오직 한 개의 클로저 인수만 받으며, 객체 인스턴스 자체를 클로저에 전달하고 반환합니다.

```
return $user->tap(function ($user) {
    //
});
```

<a name="method-throw-if"></a>
#### `throw_if()`

`throw_if` 함수는 주어진 불리언 조건식이 `true`인 경우, 지정된 예외를 발생시킵니다.

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

`throw_unless` 함수는 주어진 불리언 조건식이 `false`일 때, 지정된 예외를 발생시킵니다.

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

`today` 함수는 오늘 날짜의 `Illuminate\Support\Carbon` 인스턴스를 생성합니다.

```
$today = today();
```

<a name="method-trait-uses-recursive"></a>
#### `trait_uses_recursive()`

`trait_uses_recursive` 함수는 트레이트가 사용하는 모든 트레이트를 반환합니다.

```
$traits = trait_uses_recursive(\Illuminate\Notifications\Notifiable::class);
```

<a name="method-transform"></a>
#### `transform()`

`transform` 함수는 주어진 값이 [비어 있지 않으면](#method-blank) 클로저를 실행하고, 그 반환값을 돌려줍니다.

```
$callback = function ($value) {
    return $value * 2;
};

$result = transform(5, $callback);

// 10
```

기본값이나 클로저를 세 번째 인수로 전달할 수도 있습니다. 이 값은 주어진 값이 비어 있을 때 반환됩니다.

```
$result = transform(null, $callback, 'The value is blank');

// The value is blank
```

<a name="method-validator"></a>
#### `validator()`

`validator` 함수는 주어진 인수로 [validator](/docs/8.x/validation) 인스턴스를 생성합니다. `Validator` 파사드의 대체로 사용할 수 있습니다.

```
$validator = validator($data, $rules, $messages);
```

<a name="method-value"></a>
#### `value()`

`value` 함수는 전달받은 값을 그대로 반환합니다. 단, 클로저를 전달할 경우 해당 클로저를 실행한 뒤 반환값을 반환합니다.

```
$result = value(true);

// true

$result = value(function () {
    return false;
});

// false
```

<a name="method-view"></a>

#### `view()`

`view` 함수는 [뷰](/docs/8.x/views) 인스턴스를 반환합니다.

```
return view('auth.login');
```

<a name="method-with"></a>
#### `with()`

`with` 함수는 전달된 값을 그대로 반환합니다. 만약 두 번째 인자로 클로저가 전달되면, 해당 클로저가 실행되어 반환값이 반환됩니다.

```
$callback = function ($value) {
    return is_numeric($value) ? $value * 2 : 0;
};

$result = with(5, $callback);

// 10

$result = with(null, $callback);

// 0

$result = with(5, null);

// 5
```