# 헬퍼 (Helpers)

- [소개](#introduction)
- [사용 가능한 메서드](#available-methods)
- [기타 유틸리티](#other-utilities)
    - [벤치마킹](#benchmarking)
    - [로터리](#lottery)

<a name="introduction"></a>
## 소개

라라벨에는 다양한 전역 "헬퍼" PHP 함수들이 포함되어 있습니다. 이 함수들 중 상당수는 프레임워크 내부에서 사용되지만, 필요에 따라 여러분의 애플리케이션에서도 자유롭게 활용할 수 있습니다.

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
[lang_path](#method-lang-path)
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
[Str::betweenFirst](#method-str-between-first)
[Str::camel](#method-camel-case)
[Str::contains](#method-str-contains)
[Str::containsAll](#method-str-contains-all)
[Str::endsWith](#method-ends-with)
[Str::excerpt](#method-excerpt)
[Str::finish](#method-str-finish)
[Str::headline](#method-str-headline)
[Str::inlineMarkdown](#method-str-inline-markdown)
[Str::is](#method-str-is)
[Str::isAscii](#method-str-is-ascii)
[Str::isJson](#method-str-is-json)
[Str::isUlid](#method-str-is-ulid)
[Str::isUuid](#method-str-is-uuid)
[Str::kebab](#method-kebab-case)
[Str::lcfirst](#method-str-lcfirst)
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
[Str::squish](#method-str-squish)
[Str::start](#method-str-start)
[Str::startsWith](#method-starts-with)
[Str::studly](#method-studly-case)
[Str::substr](#method-str-substr)
[Str::substrCount](#method-str-substrcount)
[Str::substrReplace](#method-str-substrreplace)
[Str::swap](#method-str-swap)
[Str::title](#method-title-case)
[Str::toHtmlString](#method-str-to-html-string)
[Str::ucfirst](#method-str-ucfirst)
[Str::ucsplit](#method-str-ucsplit)
[Str::upper](#method-str-upper)
[Str::ulid](#method-str-ulid)
[Str::uuid](#method-str-uuid)
[Str::wordCount](#method-str-word-count)
[Str::words](#method-str-words)
[str](#method-str)
[trans](#method-trans)
[trans_choice](#method-trans-choice)

</div>

<a name="fluent-strings-method-list"></a>
### 플루언트 문자열

<div class="collection-method-list" markdown="1">

[after](#method-fluent-str-after)
[afterLast](#method-fluent-str-after-last)
[append](#method-fluent-str-append)
[ascii](#method-fluent-str-ascii)
[basename](#method-fluent-str-basename)
[before](#method-fluent-str-before)
[beforeLast](#method-fluent-str-before-last)
[between](#method-fluent-str-between)
[betweenFirst](#method-fluent-str-between-first)
[camel](#method-fluent-str-camel)
[classBasename](#method-fluent-str-class-basename)
[contains](#method-fluent-str-contains)
[containsAll](#method-fluent-str-contains-all)
[dirname](#method-fluent-str-dirname)
[endsWith](#method-fluent-str-ends-with)
[excerpt](#method-fluent-str-excerpt)
[exactly](#method-fluent-str-exactly)
[explode](#method-fluent-str-explode)
[finish](#method-fluent-str-finish)
[headline](#method-fluent-str-headline)
[inlineMarkdown](#method-fluent-str-inline-markdown)
[is](#method-fluent-str-is)
[isAscii](#method-fluent-str-is-ascii)
[isEmpty](#method-fluent-str-is-empty)
[isNotEmpty](#method-fluent-str-is-not-empty)
[isJson](#method-fluent-str-is-json)
[isUlid](#method-fluent-str-is-ulid)
[isUuid](#method-fluent-str-is-uuid)
[kebab](#method-fluent-str-kebab)
[lcfirst](#method-fluent-str-lcfirst)
[length](#method-fluent-str-length)
[limit](#method-fluent-str-limit)
[lower](#method-fluent-str-lower)
[ltrim](#method-fluent-str-ltrim)
[markdown](#method-fluent-str-markdown)
[mask](#method-fluent-str-mask)
[match](#method-fluent-str-match)
[matchAll](#method-fluent-str-match-all)
[newLine](#method-fluent-str-new-line)
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
[squish](#method-fluent-str-squish)
[start](#method-fluent-str-start)
[startsWith](#method-fluent-str-starts-with)
[studly](#method-fluent-str-studly)
[substr](#method-fluent-str-substr)
[substrReplace](#method-fluent-str-substrreplace)
[swap](#method-fluent-str-swap)
[tap](#method-fluent-str-tap)
[test](#method-fluent-str-test)
[title](#method-fluent-str-title)
[trim](#method-fluent-str-trim)
[ucfirst](#method-fluent-str-ucfirst)
[ucsplit](#method-fluent-str-ucsplit)
[upper](#method-fluent-str-upper)
[when](#method-fluent-str-when)
[whenContains](#method-fluent-str-when-contains)
[whenContainsAll](#method-fluent-str-when-contains-all)
[whenEmpty](#method-fluent-str-when-empty)
[whenNotEmpty](#method-fluent-str-when-not-empty)
[whenStartsWith](#method-fluent-str-when-starts-with)
[whenEndsWith](#method-fluent-str-when-ends-with)
[whenExactly](#method-fluent-str-when-exactly)
[whenNotExactly](#method-fluent-str-when-not-exactly)
[whenIs](#method-fluent-str-when-is)
[whenIsAscii](#method-fluent-str-when-is-ascii)
[whenIsUlid](#method-fluent-str-when-is-ulid)
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

<a name="method-listing"></a>
## 메서드 목록



<a name="arrays"></a>
## 배열 & 객체

<a name="method-array-accessible"></a>
#### `Arr::accessible()`

`Arr::accessible` 메서드는 전달한 값이 배열로 접근 가능한지 여부를 판단합니다.

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

`Arr::add` 메서드는 배열에 주어진 키가 존재하지 않거나 값이 `null`인 경우, 해당 키/값 쌍을 배열에 추가합니다.

```
use Illuminate\Support\Arr;

$array = Arr::add(['name' => 'Desk'], 'price', 100);

// ['name' => 'Desk', 'price' => 100]

$array = Arr::add(['name' => 'Desk', 'price' => null], 'price', 100);

// ['name' => 'Desk', 'price' => 100]
```


<a name="method-array-collapse"></a>
#### `Arr::collapse()`

`Arr::collapse` 메서드는 여러 배열로 이루어진 배열을 하나로 평탄화하여 단일 배열로 만들어 반환합니다.

```
use Illuminate\Support\Arr;

$array = Arr::collapse([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);

// [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

<a name="method-array-crossjoin"></a>
#### `Arr::crossJoin()`

`Arr::crossJoin` 메서드는 주어진 여러 배열을 교차 결합하여 가능한 모든 조합(카테시안 곱)을 반환합니다.

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

`Arr::divide` 메서드는 전달받은 배열을 두 개의 배열로 분리합니다. 하나는 키(key)만, 다른 배열은 값(value)만 담아 반환합니다.

```
use Illuminate\Support\Arr;

[$keys, $values] = Arr::divide(['name' => 'Desk']);

// $keys: ['name']

// $values: ['Desk']
```

<a name="method-array-dot"></a>
#### `Arr::dot()`

`Arr::dot` 메서드는 다차원 배열을 점(dot) 표기법을 사용하여 한 단계(1차원) 배열로 평탄화합니다.

```
use Illuminate\Support\Arr;

$array = ['products' => ['desk' => ['price' => 100]]];

$flattened = Arr::dot($array);

// ['products.desk.price' => 100]
```

<a name="method-array-except"></a>
#### `Arr::except()`

`Arr::except` 메서드는 배열에서 지정한 키/값 쌍을 제거합니다.

```
use Illuminate\Support\Arr;

$array = ['name' => 'Desk', 'price' => 100];

$filtered = Arr::except($array, ['price']);

// ['name' => 'Desk']
```

<a name="method-array-exists"></a>
#### `Arr::exists()`

`Arr::exists` 메서드는 주어진 배열에 해당 키가 존재하는지 확인합니다.

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

`Arr::first` 메서드는 배열에서 전달된 조건을 만족하는 첫 번째 요소를 반환합니다.

```
use Illuminate\Support\Arr;

$array = [100, 200, 300];

$first = Arr::first($array, function ($value, $key) {
    return $value >= 150;
});

// 200
```

세 번째 인자로 기본값을 함께 전달할 수도 있습니다. 조건에 맞는 값이 없을 경우 이 기본값이 반환됩니다.

```
use Illuminate\Support\Arr;

$first = Arr::first($array, $callback, $default);
```

<a name="method-array-flatten"></a>
#### `Arr::flatten()`

`Arr::flatten` 메서드는 다차원 배열을 한 단계(1차원) 배열로 평탄화합니다.

```
use Illuminate\Support\Arr;

$array = ['name' => 'Joe', 'languages' => ['PHP', 'Ruby']];

$flattened = Arr::flatten($array);

// ['Joe', 'PHP', 'Ruby']
```

<a name="method-array-forget"></a>
#### `Arr::forget()`

`Arr::forget` 메서드는 점(dot) 표기법을 사용해 깊이 중첩된 배열에서 특정 키/값 쌍을 제거합니다.

```
use Illuminate\Support\Arr;

$array = ['products' => ['desk' => ['price' => 100]]];

Arr::forget($array, 'products.desk');

// ['products' => []]
```

<a name="method-array-get"></a>
#### `Arr::get()`

`Arr::get` 메서드는 점(dot) 표기법을 활용하여 깊이 중첩된 배열에서 값을 가져옵니다.

```
use Illuminate\Support\Arr;

$array = ['products' => ['desk' => ['price' => 100]]];

$price = Arr::get($array, 'products.desk.price');

// 100
```

또한 `Arr::get` 메서드는 기본값을 세 번째 인자로 전달할 수 있습니다. 지정한 키가 배열에 없을 경우 이 값이 반환됩니다.

```
use Illuminate\Support\Arr;

$discount = Arr::get($array, 'products.desk.discount', 0);

// 0
```

<a name="method-array-has"></a>

#### `Arr::has()`

`Arr::has` 메서드는 "dot" 표기법을 사용하여 배열에 지정한 항목이 존재하는지 확인합니다:

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

`Arr::hasAny` 메서드는 "dot" 표기법을 사용하여 지정된 여러 항목 중 하나라도 배열에 존재하는지 확인합니다:

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

`Arr::isAssoc` 메서드는 주어진 배열이 연관 배열(associative array)인지 여부를 `true`로 반환합니다. 배열의 키가 0부터 시작하는 순차적인 숫자가 아니면 연관 배열로 간주합니다:

```
use Illuminate\Support\Arr;

$isAssoc = Arr::isAssoc(['product' => ['name' => 'Desk', 'price' => 100]]);

// true

$isAssoc = Arr::isAssoc([1, 2, 3]);

// false
```

<a name="method-array-islist"></a>
#### `Arr::isList()`

`Arr::isList` 메서드는 배열의 키가 0부터 시작하는 순차적인 정수형이면 `true`를 반환합니다:

```
use Illuminate\Support\Arr;

$isList = Arr::isList(['foo', 'bar', 'baz']);

// true

$isList = Arr::isList(['product' => ['name' => 'Desk', 'price' => 100]]);

// false
```

<a name="method-array-join"></a>
#### `Arr::join()`

`Arr::join` 메서드는 배열 요소들을 문자열로 합칩니다. 두 번째 인수로 구분자를 지정할 수 있으며, 배열의 마지막 요소 앞에 들어갈 구분자도 세 번째 인수로 따로 지정할 수 있습니다:

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

`Arr::keyBy` 메서드는 지정한 키의 값을 배열의 키로 사용하여 배열을 재구성합니다. 동일한 키를 가진 항목이 여러 개면 마지막 항목만 새 배열에 포함됩니다:

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

`Arr::last` 메서드는 전달한 조건(콜백)에 만족하는 배열의 마지막 요소를 반환합니다:

```
use Illuminate\Support\Arr;

$array = [100, 200, 300, 110];

$last = Arr::last($array, function ($value, $key) {
    return $value >= 150;
});

// 300
```

조건에 만족하는 값이 없을 경우, 세 번째 인수로 기본값을 지정할 수 있습니다:

```
use Illuminate\Support\Arr;

$last = Arr::last($array, $callback, $default);
```

<a name="method-array-map"></a>
#### `Arr::map()`

`Arr::map` 메서드는 배열을 순회하면서 각 값과 키를 지정한 콜백에 전달하여, 콜백이 반환한 값으로 배열의 값을 대체합니다:

```
use Illuminate\Support\Arr;

$array = ['first' => 'james', 'last' => 'kirk'];

$mapped = Arr::map($array, function ($value, $key) {
    return ucfirst($value);
});

// ['first' => 'James', 'last' => 'Kirk']
```

<a name="method-array-only"></a>
#### `Arr::only()`

`Arr::only` 메서드는 배열에서 지정한 키에 해당하는 키/값 쌍만 추출하여 반환합니다:

```
use Illuminate\Support\Arr;

$array = ['name' => 'Desk', 'price' => 100, 'orders' => 10];

$slice = Arr::only($array, ['name', 'price']);

// ['name' => 'Desk', 'price' => 100]
```

<a name="method-array-pluck"></a>
#### `Arr::pluck()`

`Arr::pluck` 메서드는 배열에서 지정한 키에 해당하는 값만 모두 가져와서 반환합니다:

```
use Illuminate\Support\Arr;

$array = [
    ['developer' => ['id' => 1, 'name' => 'Taylor']],
    ['developer' => ['id' => 2, 'name' => 'Abigail']],
];

$names = Arr::pluck($array, 'developer.name');

// ['Taylor', 'Abigail']
```

결과 배열의 키를 어떻게 할지 세 번째 인수로 추가 지정할 수도 있습니다:

```
use Illuminate\Support\Arr;

$names = Arr::pluck($array, 'developer.name', 'developer.id');

// [1 => 'Taylor', 2 => 'Abigail']
```

<a name="method-array-prepend"></a>
#### `Arr::prepend()`

`Arr::prepend` 메서드는 항목을 배열의 맨 앞에 추가합니다:

```
use Illuminate\Support\Arr;

$array = ['one', 'two', 'three', 'four'];

$array = Arr::prepend($array, 'zero');

// ['zero', 'one', 'two', 'three', 'four']
```

필요에 따라, 추가할 값에 사용할 키도 지정할 수 있습니다:

```
use Illuminate\Support\Arr;

$array = ['price' => 100];

$array = Arr::prepend($array, 'Desk', 'name');

// ['name' => 'Desk', 'price' => 100]
```

<a name="method-array-prependkeyswith"></a>
#### `Arr::prependKeysWith()`

`Arr::prependKeysWith`는 연관 배열의 모든 키명 앞에 지정한 접두어(prefix)를 붙입니다:

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

`Arr::pull` 메서드는 배열에서 키/값 쌍을 반환하면서 해당 항목을 배열에서 제거합니다:

```
use Illuminate\Support\Arr;

$array = ['name' => 'Desk', 'price' => 100];

$name = Arr::pull($array, 'name');

// $name: Desk

// $array: ['price' => 100]
```

키가 존재하지 않을 경우 반환할 기본값을 세 번째 인수로 지정할 수 있습니다:

```
use Illuminate\Support\Arr;

$value = Arr::pull($array, $key, $default);
```

<a name="method-array-query"></a>
#### `Arr::query()`

`Arr::query` 메서드는 배열을 쿼리 문자열로 변환합니다:

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

`Arr::random` 메서드는 배열에서 무작위로 값을 반환합니다:

```
use Illuminate\Support\Arr;

$array = [1, 2, 3, 4, 5];

$random = Arr::random($array);

// 4 - (무작위로 추출됨)
```

두 번째 인수로 반환받을 항목의 개수를 지정할 수도 있습니다. 이 인수를 지정하면, 하나만 선택하더라도 배열 형태로 반환됩니다:

```
use Illuminate\Support\Arr;

$items = Arr::random($array, 2);

// [2, 5] - (무작위로 추출됨)
```

<a name="method-array-set"></a>
#### `Arr::set()`

`Arr::set` 메서드는 "dot" 표기법을 사용하여 중첩 배열 내부의 값을 설정합니다:

```
use Illuminate\Support\Arr;

$array = ['products' => ['desk' => ['price' => 100]]];

Arr::set($array, 'products.desk.price', 200);

// ['products' => ['desk' => ['price' => 200]]]
```

<a name="method-array-shuffle"></a>
#### `Arr::shuffle()`

`Arr::shuffle` 메서드는 배열의 항목들을 무작위로 섞어서 반환합니다:

```
use Illuminate\Support\Arr;

$array = Arr::shuffle([1, 2, 3, 4, 5]);

// [3, 2, 5, 1, 4] - (무작위로 생성됨)
```

<a name="method-array-sort"></a>
#### `Arr::sort()`

`Arr::sort` 메서드는 배열을 값 기준으로 정렬합니다:

```
use Illuminate\Support\Arr;

$array = ['Desk', 'Table', 'Chair'];

$sorted = Arr::sort($array);

// ['Chair', 'Desk', 'Table']
```

콜백을 전달하여 해당 콜백의 실행 결과를 기준으로 정렬할 수도 있습니다:

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

<a name="method-array-sort-desc"></a>
#### `Arr::sortDesc()`

`Arr::sortDesc` 메서드는 배열을 값 기준으로 내림차순 정렬합니다:

```
use Illuminate\Support\Arr;

$array = ['Desk', 'Table', 'Chair'];

$sorted = Arr::sortDesc($array);

// ['Table', 'Desk', 'Chair']
```

콜백을 전달하여 해당 콜백의 실행 결과를 기준으로 내림차순 정렬할 수도 있습니다:

```
use Illuminate\Support\Arr;

$array = [
    ['name' => 'Desk'],
    ['name' => 'Table'],
    ['name' => 'Chair'],
];

$sorted = array_values(Arr::sortDesc($array, function ($value) {
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

`Arr::sortRecursive` 메서드는 배열 내부를 재귀적으로 정렬합니다. 숫자 인덱스를 가진 하위 배열은 `sort` 함수를, 연관 배열은 `ksort` 함수를 사용해 정렬합니다:

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

`Arr::toCssClasses` 메서드는 조건에 따라 CSS 클래스 문자열을 동적으로 만듭니다. 이 메서드는, 배열의 키에 추가하고 싶은 클래스 이름 또는 클래스들, 값에는 조건식을 설정합니다. 배열 요소의 키가 숫자인 경우에는 해당 항목이 항상 결과 클래스 리스트에 포함됩니다:

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

이 메서드는 라라벨의 [Blade 컴포넌트의 attribute bag에 클래스를 합치는 기능](/docs/9.x/blade#conditionally-merge-classes)이나 `@class` [Blade 디렉티브](/docs/9.x/blade#conditional-classes)에서도 사용됩니다.

<a name="method-array-undot"></a>
#### `Arr::undot()`

`Arr::undot` 메서드는 "dot" 표기법으로 작성된 단일 차원 배열을 다차원 배열로 확장합니다:

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

`Arr::where` 메서드는 지정한 콜백을 사용해 배열을 필터링합니다:

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

`Arr::whereNotNull` 메서드는 배열에서 모든 `null` 값을 제거합니다:

```
use Illuminate\Support\Arr;

$array = [0, null];

$filtered = Arr::whereNotNull($array);

// [0 => 0]
```

<a name="method-array-wrap"></a>
#### `Arr::wrap()`

`Arr::wrap` 메서드는 지정한 값을 배열로 감싸서 반환합니다. 이미 배열인 값이면 그대로 반환됩니다:

```
use Illuminate\Support\Arr;

$string = 'Laravel';

$array = Arr::wrap($string);

// ['Laravel']
```

지정한 값이 `null`인 경우에는 빈 배열을 반환합니다:

```
use Illuminate\Support\Arr;

$array = Arr::wrap(null);

// []
```

<a name="method-data-fill"></a>
#### `data_fill()`

`data_fill` 함수는 "dot" 표기법을 사용해 중첩 배열 또는 객체 내에 아직 없는 값을 설정합니다:

```
$data = ['products' => ['desk' => ['price' => 100]]];

data_fill($data, 'products.desk.price', 200);

// ['products' => ['desk' => ['price' => 100]]]

data_fill($data, 'products.desk.discount', 10);

// ['products' => ['desk' => ['price' => 100, 'discount' => 10]]]
```

이 함수는 와일드카드로 별표(*)도 사용할 수 있으며, 일치하는 모든 대상에 값을 채워줍니다:

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

`data_get` 함수는 "점(dot) 표기법"을 사용하여 중첩된 배열이나 객체에서 원하는 값을 가져옵니다.

```
$data = ['products' => ['desk' => ['price' => 100]]];

$price = data_get($data, 'products.desk.price');

// 100
```

`data_get` 함수는 기본값도 지정할 수 있습니다. 지정한 키가 존재하지 않을 경우 두 번째 인자로 넘긴 기본값이 반환됩니다.

```
$discount = data_get($data, 'products.desk.discount', 0);

// 0
```

이 함수는 별표(`*`)를 이용한 와일드카드도 지원하여, 배열이나 객체의 모든 키를 대상으로 값을 가져올 수 있습니다.

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

`data_set` 함수는 "점(dot) 표기법"을 사용하여 중첩된 배열이나 객체의 값을 설정합니다.

```
$data = ['products' => ['desk' => ['price' => 100]]];

data_set($data, 'products.desk.price', 200);

// ['products' => ['desk' => ['price' => 200]]]
```

이 함수 역시 와일드카드로 별표(`*`)를 사용할 수 있으며, 조건에 맞는 모든 대상에 대해 값을 설정합니다.

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

기본적으로, 기존 값이 있더라도 덮어쓰기가 됩니다. 만약 값이 없을 때만 설정하고 싶다면 네 번째 인자로 `false`를 전달하면 됩니다.

```
$data = ['products' => ['desk' => ['price' => 100]]];

data_set($data, 'products.desk.price', 200, overwrite: false);

// ['products' => ['desk' => ['price' => 100]]]
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

<a name="paths"></a>
## 경로(Paths)

<a name="method-app-path"></a>
#### `app_path()`

`app_path` 함수는 애플리케이션의 `app` 디렉터리에 대한 전체 경로를 반환합니다. 또한, `app` 디렉터리를 기준으로 하는 파일의 전체 경로를 만들 때도 사용할 수 있습니다.

```
$path = app_path();

$path = app_path('Http/Controllers/Controller.php');
```

<a name="method-base-path"></a>
#### `base_path()`

`base_path` 함수는 애플리케이션 루트 디렉터리(프로젝트의 최상위 경로)의 전체 경로를 반환합니다. 또한, 프로젝트 루트 디렉터리 기준으로 특정 파일 경로를 생성할 때도 사용할 수 있습니다.

```
$path = base_path();

$path = base_path('vendor/bin');
```

<a name="method-config-path"></a>
#### `config_path()`

`config_path` 함수는 애플리케이션의 `config` 디렉터리에 대한 전체 경로를 반환합니다. 또한, 설정 디렉터리 내 특정 파일의 전체 경로를 만들 때도 사용할 수 있습니다.

```
$path = config_path();

$path = config_path('app.php');
```

<a name="method-database-path"></a>
#### `database_path()`

`database_path` 함수는 애플리케이션의 `database` 디렉터리에 대한 전체 경로를 반환합니다. 또한, 데이터베이스 디렉터리 내 특정 파일의 전체 경로를 만들 때도 사용할 수 있습니다.

```
$path = database_path();

$path = database_path('factories/UserFactory.php');
```

<a name="method-lang-path"></a>
#### `lang_path()`

`lang_path` 함수는 애플리케이션의 `lang` 디렉터리에 대한 전체 경로를 반환합니다. 또한, 해당 디렉터리 내 특정 파일의 전체 경로를 만들 때도 사용할 수 있습니다.

```
$path = lang_path();

$path = lang_path('en/messages.php');
```

<a name="method-mix"></a>
#### `mix()`

`mix` 함수는 [버전이 지정된 Mix 파일](/docs/9.x/mix)의 경로를 반환합니다.

```
$path = mix('css/app.css');
```

<a name="method-public-path"></a>
#### `public_path()`

`public_path` 함수는 애플리케이션의 `public` 디렉터리에 대한 전체 경로를 반환합니다. 또한, public 디렉터리 내 특정 파일의 전체 경로를 만들 때도 사용할 수 있습니다.

```
$path = public_path();

$path = public_path('css/app.css');
```

<a name="method-resource-path"></a>
#### `resource_path()`

`resource_path` 함수는 애플리케이션의 `resources` 디렉터리에 대한 전체 경로를 반환합니다. 또한, resources 디렉터리 내 특정 파일의 전체 경로를 생성할 때도 사용할 수 있습니다.

```
$path = resource_path();

$path = resource_path('sass/app.scss');
```

<a name="method-storage-path"></a>
#### `storage_path()`

`storage_path` 함수는 애플리케이션의 `storage` 디렉터리에 대한 전체 경로를 반환합니다. 또한, storage 디렉터리 내 특정 파일의 전체 경로를 만들 때도 사용할 수 있습니다.

```
$path = storage_path();

$path = storage_path('app/file.txt');
```

<a name="strings"></a>
## 문자열(Strings)

<a name="method-__"></a>
#### `__()`

`__` 함수는 [다국어 파일](/docs/9.x/localization)을 이용하여 지정한 번역 문자열 또는 키를 번역합니다.

```
echo __('Welcome to our application');

echo __('messages.welcome');
```

만약 지정한 번역 문자열이나 키가 존재하지 않을 경우, `__` 함수는 전달된 값을 그대로 반환합니다. 따라서 위 예시에서 해당 번역 키가 존재하지 않으면 `__` 함수는 `messages.welcome`을 그대로 반환합니다.

<a name="method-class-basename"></a>
#### `class_basename()`

`class_basename` 함수는 네임스페이스를 제외하고, 주어진 클래스의 클래스명만 반환합니다.

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

`preg_replace_array` 함수는 문자열 내의 지정된 패턴을 배열의 값으로 순차적으로 치환합니다.

```
$string = 'The event will take place between :start and :end';

$replaced = preg_replace_array('/:[a-z_]+/', ['8:30', '9:00'], $string);

// The event will take place between 8:30 and 9:00
```

<a name="method-str-after"></a>
#### `Str::after()`

`Str::after` 메서드는 지정한 문자열 뒤에 나오는 모든 값을 반환합니다. 만약 지정한 값이 문자열 내에 없으면 전체 문자열이 반환됩니다.

```
use Illuminate\Support\Str;

$slice = Str::after('This is my name', 'This is');

// ' my name'
```

<a name="method-str-after-last"></a>
#### `Str::afterLast()`

`Str::afterLast` 메서드는 문자열 내에서 지정한 값의 마지막 등장 이후에 나오는 모든 내용을 반환합니다. 지정한 값이 문자열 내에 없으면 전체 문자열이 반환됩니다.

```
use Illuminate\Support\Str;

$slice = Str::afterLast('App\Http\Controllers\Controller', '\\');

// 'Controller'
```

<a name="method-str-ascii"></a>
#### `Str::ascii()`

`Str::ascii` 메서드는 문자열을 ASCII 값으로 변환할 수 있도록 시도합니다.

```
use Illuminate\Support\Str;

$slice = Str::ascii('û');

// 'u'
```

<a name="method-str-before"></a>
#### `Str::before()`

`Str::before` 메서드는 지정한 값 앞의 모든 내용을 반환합니다.

```
use Illuminate\Support\Str;

$slice = Str::before('This is my name', 'my name');

// 'This is '
```

<a name="method-str-before-last"></a>
#### `Str::beforeLast()`

`Str::beforeLast` 메서드는 문자열 내에서 지정한 값의 마지막 등장 이전까지의 모든 내용을 반환합니다.

```
use Illuminate\Support\Str;

$slice = Str::beforeLast('This is my name', 'is');

// 'This '
```

<a name="method-str-between"></a>
#### `Str::between()`

`Str::between` 메서드는 문자열에서 두 값 사이에 있는 부분 문자열을 반환합니다.

```
use Illuminate\Support\Str;

$slice = Str::between('This is my name', 'This', 'name');

// ' is my '
```

<a name="method-str-between-first"></a>
#### `Str::betweenFirst()`

`Str::betweenFirst` 메서드는 주어진 두 값 사이 중 가장 짧게 추출될 수 있는 부분 문자열을 반환합니다.

```
use Illuminate\Support\Str;

$slice = Str::betweenFirst('[a] bc [d]', '[', ']');

// 'a'
```

<a name="method-camel-case"></a>
#### `Str::camel()`

`Str::camel` 메서드는 주어진 문자열을 `camelCase` 형식으로 변환합니다.

```
use Illuminate\Support\Str;

$converted = Str::camel('foo_bar');

// fooBar
```

<a name="method-str-contains"></a>
#### `Str::contains()`

`Str::contains` 메서드는 주어진 문자열에 특정 값이 포함되어 있는지 확인합니다. 이 메서드는 대소문자를 구분합니다.

```
use Illuminate\Support\Str;

$contains = Str::contains('This is my name', 'my');

// true
```

동일한 방식으로 값의 배열을 전달하여, 주어진 문자열이 배열 내의 값들 중 하나라도 포함하고 있는지 검사할 수 있습니다.

```
use Illuminate\Support\Str;

$contains = Str::contains('This is my name', ['my', 'foo']);

// true
```

<a name="method-str-contains-all"></a>
#### `Str::containsAll()`

`Str::containsAll` 메서드는 주어진 문자열이 배열에 있는 모든 값을 모두 포함하는지 확인합니다.

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

동일하게, 값의 배열을 전달하여 문자열이 배열 내 어떤 값으로 끝나는지 확인할 수도 있습니다.

```
use Illuminate\Support\Str;

$result = Str::endsWith('This is my name', ['name', 'foo']);

// true

$result = Str::endsWith('This is my name', ['this', 'foo']);

// false
```

<a name="method-excerpt"></a>
#### `Str::excerpt()`

`Str::excerpt` 메서드는 주어진 문자열에서 특정 구문이 처음으로 등장하는 부분을 기준으로, 반경(`radius`) 만큼의 앞뒤 텍스트와 함께 발췌(excerpt)를 만듭니다.

```
use Illuminate\Support\Str;

$excerpt = Str::excerpt('This is my name', 'my', [
    'radius' => 3
]);

// '...is my na...'
```

`radius` 옵션은 기본값이 100이며, 발췌 문자열의 앞뒤에 표시할 문자 개수를 지정할 수 있습니다.

또한, `omission` 옵션을 사용해 생략 부호 등 발췌 문자열 앞뒤에 어떤 문자열을 붙일 것인지 정할 수 있습니다.

```
use Illuminate\Support\Str;

$excerpt = Str::excerpt('This is my name', 'name', [
    'radius' => 3,
    'omission' => '(...) '
]);

// '(...) my name'
```

<a name="method-str-finish"></a>
#### `Str::finish()`

`Str::finish` 메서드는 주어진 문자열이 지정된 값으로 끝나지 않을 경우, 그 값을 한 번만 덧붙여줍니다.

```
use Illuminate\Support\Str;

$adjusted = Str::finish('this/string', '/');

// this/string/

$adjusted = Str::finish('this/string/', '/');

// this/string/
```

<a name="method-str-headline"></a>
#### `Str::headline()`

`Str::headline` 메서드는 대소문자 구분, 하이픈, 밑줄 등으로 구분되어 있는 문자열을 띄어쓰기로 구분된 문자열로 바꾸고, 각 단어의 첫 글자를 대문자로 변환합니다.

```
use Illuminate\Support\Str;

$headline = Str::headline('steve_jobs');

// Steve Jobs

$headline = Str::headline('EmailNotificationSent');

// Email Notification Sent
```

<a name="method-str-inline-markdown"></a>
#### `Str::inlineMarkdown()`

`Str::inlineMarkdown` 메서드는 [CommonMark](https://commonmark.thephpleague.com/)를 사용하여 GitHub 스타일의 마크다운을 인라인 HTML로 변환합니다. 단, `markdown` 메서드와 달리 모든 HTML을 블록 레벨 요소로 감싸지 않습니다.

```
use Illuminate\Support\Str;

$html = Str::inlineMarkdown('**Laravel**');

// <strong>Laravel</strong>
```

<a name="method-str-is"></a>
#### `Str::is()`

`Str::is` 메서드는 주어진 문자열이 지정한 패턴과 일치하는지 확인합니다. 별표(`*`)를 와일드카드로 사용할 수 있습니다.

```
use Illuminate\Support\Str;

$matches = Str::is('foo*', 'foobar');

// true

$matches = Str::is('baz*', 'foobar');

// false
```

<a name="method-str-is-ascii"></a>
#### `Str::isAscii()`

`Str::isAscii` 메서드는 주어진 문자열이 7비트 ASCII인지 확인합니다.

```
use Illuminate\Support\Str;

$isAscii = Str::isAscii('Taylor');

// true

$isAscii = Str::isAscii('ü');

// false
```

<a name="method-str-is-json"></a>
#### `Str::isJson()`

`Str::isJson` 메서드는 문자열이 올바른 JSON 형식인지 검사합니다.

```
use Illuminate\Support\Str;

$result = Str::isJson('[1,2,3]');

// true

$result = Str::isJson('{"first": "John", "last": "Doe"}');

// true

$result = Str::isJson('{first: "John", last: "Doe"}');

// false
```

<a name="method-str-is-ulid"></a>
#### `Str::isUlid()`

`Str::isUlid` 메서드는 문자열이 올바른 ULID 형식인지 확인합니다.

```
use Illuminate\Support\Str;

$isUlid = Str::isUlid('01gd6r360bp37zj17nxb55yv40');

// true

$isUlid = Str::isUlid('laravel');

// false
```

<a name="method-str-is-uuid"></a>

#### `Str::isUuid()`

`Str::isUuid` 메서드는 주어진 문자열이 유효한 UUID인지 확인합니다.

```
use Illuminate\Support\Str;

$isUuid = Str::isUuid('a0a2a2d2-0b87-4a18-83f2-2529882be2de');

// true

$isUuid = Str::isUuid('laravel');

// false
```

<a name="method-kebab-case"></a>
#### `Str::kebab()`

`Str::kebab` 메서드는 주어진 문자열을 `kebab-case`로 변환합니다.

```
use Illuminate\Support\Str;

$converted = Str::kebab('fooBar');

// foo-bar
```

<a name="method-str-lcfirst"></a>
#### `Str::lcfirst()`

`Str::lcfirst` 메서드는 주어진 문자열에서 첫 번째 문자를 소문자로 변환해서 반환합니다.

```
use Illuminate\Support\Str;

$string = Str::lcfirst('Foo Bar');

// foo Bar
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

`Str::limit` 메서드는 주어진 문자열을 지정한 길이만큼 잘라줍니다.

```
use Illuminate\Support\Str;

$truncated = Str::limit('The quick brown fox jumps over the lazy dog', 20);

// The quick brown fox...
```

이 메서드의 세 번째 인수로, 잘린 문자열 끝에 붙일 문자열을 지정할 수도 있습니다.

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

`Str::markdown` 메서드는 GitHub 스타일의 Markdown을 [CommonMark](https://commonmark.thephpleague.com/)을 사용해 HTML로 변환합니다.

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

`Str::mask` 메서드는 문자열의 일부분을 지정한 문자를 반복해서 마스킹(감춤 처리)할 수 있으며, 이메일 주소나 전화번호 일부를 숨기는데 사용할 수 있습니다.

```
use Illuminate\Support\Str;

$string = Str::mask('taylor@example.com', '*', 3);

// tay***************
```

필요하다면, 세 번째 인수에 음수를 전달해 문자열 끝에서부터 일정 거리를 기준으로 마스킹을 시작할 수도 있습니다.

```
$string = Str::mask('taylor@example.com', '*', -15, 3);

// tay***@example.com
```

<a name="method-str-ordered-uuid"></a>
#### `Str::orderedUuid()`

`Str::orderedUuid` 메서드는 "타임스탬프가 먼저 오는" UUID를 생성하여 인덱스가 설정된 데이터베이스 컬럼에 효율적으로 저장할 수 있도록 합니다. 이 메서드로 생성된 각 UUID는 이전에 생성된 UUID들 뒤에 정렬되어 저장됩니다.

```
use Illuminate\Support\Str;

return (string) Str::orderedUuid();
```

<a name="method-str-padboth"></a>
#### `Str::padBoth()`

`Str::padBoth` 메서드는 PHP의 `str_pad` 함수를 감싸며, 문자열 양쪽을 지정한 문자열로 채워, 원하는 길이만큼 맞춥니다.

```
use Illuminate\Support\Str;

$padded = Str::padBoth('James', 10, '_');

// '__James___'

$padded = Str::padBoth('James', 10);

// '  James   '
```

<a name="method-str-padleft"></a>
#### `Str::padLeft()`

`Str::padLeft` 메서드는 PHP의 `str_pad` 함수를 감싸며, 문자열의 왼쪽을 지정한 문자열로 채워, 원하는 길이만큼 맞춥니다.

```
use Illuminate\Support\Str;

$padded = Str::padLeft('James', 10, '-=');

// '-=-=-James'

$padded = Str::padLeft('James', 10);

// '     James'
```

<a name="method-str-padright"></a>
#### `Str::padRight()`

`Str::padRight` 메서드는 PHP의 `str_pad` 함수를 감싸며, 문자열의 오른쪽을 지정한 문자열로 채워, 원하는 길이만큼 맞춥니다.

```
use Illuminate\Support\Str;

$padded = Str::padRight('James', 10, '-');

// 'James-----'

$padded = Str::padRight('James', 10);

// 'James     '
```

<a name="method-str-plural"></a>
#### `Str::plural()`

`Str::plural` 메서드는 단수형 문자열을 복수형으로 변환합니다. 이 함수는 [라라벨의 복수화 기능이 지원하는 모든 언어](/docs/9.x/localization#pluralization-language)를 지원합니다.

```
use Illuminate\Support\Str;

$plural = Str::plural('car');

// cars

$plural = Str::plural('child');

// children
```

이 함수의 두 번째 인수로 정수를 전달하면, 문자열의 복수 혹은 단수형을 해당 수에 맞추어 반환합니다.

```
use Illuminate\Support\Str;

$plural = Str::plural('child', 2);

// children

$singular = Str::plural('child', 1);

// child
```

<a name="method-str-plural-studly"></a>
#### `Str::pluralStudly()`

`Str::pluralStudly` 메서드는 StudlyCaps(단어마다 대문자로 구분된 형태)의 단수형 문자열을 복수형으로 변환합니다. 이 함수 역시 [라라벨의 복수화 기능이 지원하는 모든 언어](/docs/9.x/localization#pluralization-language)를 지원합니다.

```
use Illuminate\Support\Str;

$plural = Str::pluralStudly('VerifiedHuman');

// VerifiedHumans

$plural = Str::pluralStudly('UserFeedback');

// UserFeedback
```

이 메서드 역시 두 번째 인수로 정수를 전달해 복수 또는 단수형 반환을 제어할 수 있습니다.

```
use Illuminate\Support\Str;

$plural = Str::pluralStudly('VerifiedHuman', 2);

// VerifiedHumans

$singular = Str::pluralStudly('VerifiedHuman', 1);

// VerifiedHuman
```

<a name="method-str-random"></a>
#### `Str::random()`

`Str::random` 메서드는 지정한 길이만큼의 임의의 문자열을 생성합니다. 이 함수는 PHP의 `random_bytes`를 사용합니다.

```
use Illuminate\Support\Str;

$random = Str::random(40);
```

<a name="method-str-remove"></a>
#### `Str::remove()`

`Str::remove` 메서드는 주어진 값(또는 값의 배열)을 문자열에서 제거합니다.

```
use Illuminate\Support\Str;

$string = 'Peter Piper picked a peck of pickled peppers.';

$removed = Str::remove('e', $string);

// Ptr Pipr pickd a pck of pickld ppprs.
```

문자열을 제거할 때 대소문자를 구분하지 않게 하려면, 세 번째 인수로 `false`를 전달할 수 있습니다.

<a name="method-str-replace"></a>
#### `Str::replace()`

`Str::replace` 메서드는 문자열 내의 지정한 값을 새 값으로 교체합니다.

```
use Illuminate\Support\Str;

$string = 'Laravel 8.x';

$replaced = Str::replace('8.x', '9.x', $string);

// Laravel 9.x
```

<a name="method-str-replace-array"></a>
#### `Str::replaceArray()`

`Str::replaceArray` 메서드는 문자열 내의 특정 값을, 배열에 담아서 순차적으로 바꿉니다.

```
use Illuminate\Support\Str;

$string = 'The event will take place between ? and ?';

$replaced = Str::replaceArray('?', ['8:30', '9:00'], $string);

// The event will take place between 8:30 and 9:00
```

<a name="method-str-replace-first"></a>
#### `Str::replaceFirst()`

`Str::replaceFirst` 메서드는 주어진 문자열에서, 첫 번째로 등장하는 값을 새 값으로 교체합니다.

```
use Illuminate\Support\Str;

$replaced = Str::replaceFirst('the', 'a', 'the quick brown fox jumps over the lazy dog');

// a quick brown fox jumps over the lazy dog
```

<a name="method-str-replace-last"></a>
#### `Str::replaceLast()`

`Str::replaceLast` 메서드는 주어진 문자열에서, 마지막으로 등장하는 값을 새 값으로 교체합니다.

```
use Illuminate\Support\Str;

$replaced = Str::replaceLast('the', 'a', 'the quick brown fox jumps over the lazy dog');

// the quick brown fox jumps over a lazy dog
```

<a name="method-str-reverse"></a>
#### `Str::reverse()`

`Str::reverse` 메서드는 주어진 문자열을 거꾸로 뒤집어 반환합니다.

```
use Illuminate\Support\Str;

$reversed = Str::reverse('Hello World');

// dlroW olleH
```

<a name="method-str-singular"></a>
#### `Str::singular()`

`Str::singular` 메서드는 문자열을 단수형으로 변환합니다. 이 함수도 [라라벨의 복수화 기능이 지원하는 모든 언어](/docs/9.x/localization#pluralization-language)를 지원합니다.

```
use Illuminate\Support\Str;

$singular = Str::singular('cars');

// car

$singular = Str::singular('children');

// child
```

<a name="method-str-slug"></a>
#### `Str::slug()`

`Str::slug` 메서드는 주어진 문자열을 URL에 적합한 "슬러그"로 변환합니다.

```
use Illuminate\Support\Str;

$slug = Str::slug('Laravel 5 Framework', '-');

// laravel-5-framework
```

<a name="method-snake-case"></a>
#### `Str::snake()`

`Str::snake` 메서드는 주어진 문자열을 `snake_case` 형태로 변환합니다.

```
use Illuminate\Support\Str;

$converted = Str::snake('fooBar');

// foo_bar

$converted = Str::snake('fooBar', '-');

// foo-bar
```

<a name="method-str-squish"></a>
#### `Str::squish()`

`Str::squish` 메서드는 문자열 내의 불필요한 공백을 모두 제거하고, 단어 사이의 공백도 1칸으로 줄여줍니다.

```
use Illuminate\Support\Str;

$string = Str::squish('    laravel    framework    ');

// laravel framework
```

<a name="method-str-start"></a>
#### `Str::start()`

`Str::start` 메서드는 주어진 값으로 시작하지 않을 경우, 해당 값을 문자열의 맨 앞에 한 번만 추가합니다.

```
use Illuminate\Support\Str;

$adjusted = Str::start('this/string', '/');

// /this/string

$adjusted = Str::start('/this/string', '/');

// /this/string
```

<a name="method-starts-with"></a>
#### `Str::startsWith()`

`Str::startsWith` 메서드는 주어진 문자열이 특정 값으로 시작하는지 여부를 확인합니다.

```
use Illuminate\Support\Str;

$result = Str::startsWith('This is my name', 'This');

// true
```

값을 배열로 전달하면, 전달된 값 중 어떤 값이라도 해당 문자열의 시작에 있으면 `true`를 반환합니다.

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

`Str::substr` 메서드는 지정한 시작 인덱스와 길이만큼, 주어진 문자열의 일부를 반환합니다.

```
use Illuminate\Support\Str;

$converted = Str::substr('The Laravel Framework', 4, 7);

// Laravel
```

<a name="method-str-substrcount"></a>
#### `Str::substrCount()`

`Str::substrCount` 메서드는 주어진 문자열 내에서 특정 값이 몇 번 나타나는지 반환합니다.

```
use Illuminate\Support\Str;

$count = Str::substrCount('If you like ice cream, you will like snow cones.', 'like');

// 2
```

<a name="method-str-substrreplace"></a>
#### `Str::substrReplace()`

`Str::substrReplace` 메서드는 문자열의 일부 구간에, 선택한 텍스트로 교체해줍니다. 세 번째 인수로는 시작 위치를, 네 번째 인수로는 교체할 문자 수를 지정합니다. 네 번째 인수에 `0`을 전달하면, 기존 문자를 지우지 않고 해당 위치에 새로운 문자열을 삽입합니다.

```
use Illuminate\Support\Str;

$result = Str::substrReplace('1300', ':', 2);
// 13:

$result = Str::substrReplace('1300', ':', 2, 0);
// 13:00
```

<a name="method-str-swap"></a>
#### `Str::swap()`

`Str::swap` 메서드는 PHP의 `strtr` 함수를 활용하여, 여러 값을 한 번에 치환합니다.

```
use Illuminate\Support\Str;

$string = Str::swap([
    'Tacos' => 'Burritos',
    'great' => 'fantastic',
], 'Tacos are great!');

// Burritos are fantastic!
```

<a name="method-title-case"></a>
#### `Str::title()`

`Str::title` 메서드는 주어진 문자열을 각 단어의 첫 글자가 대문자인 Title Case로 변환합니다.

```
use Illuminate\Support\Str;

$converted = Str::title('a nice title uses the correct case');

// A Nice Title Uses The Correct Case
```

<a name="method-str-to-html-string"></a>
#### `Str::toHtmlString()`

`Str::toHtmlString` 메서드는 문자열 인스턴스를 `Illuminate\Support\HtmlString` 타입으로 변환하여, Blade 템플릿에서 출력할 수 있도록 합니다.

```
use Illuminate\Support\Str;

$htmlString = Str::of('Nuno Maduro')->toHtmlString();
```

<a name="method-str-ucfirst"></a>
#### `Str::ucfirst()`

`Str::ucfirst` 메서드는 주어진 문자열에서 첫 번째 문자를 대문자로 변환해서 반환합니다.

```
use Illuminate\Support\Str;

$string = Str::ucfirst('foo bar');

// Foo bar
```

<a name="method-str-ucsplit"></a>
#### `Str::ucsplit()`

`Str::ucsplit` 메서드는 문자열을 대문자 기준으로 나누어 배열로 반환합니다.

```
use Illuminate\Support\Str;

$segments = Str::ucsplit('FooBar');

// [0 => 'Foo', 1 => 'Bar']
```

<a name="method-str-upper"></a>

#### `Str::upper()`

`Str::upper` 메서드는 전달된 문자열을 모두 대문자로 변환합니다:

```
use Illuminate\Support\Str;

$string = Str::upper('laravel');

// LARAVEL
```

<a name="method-str-ulid"></a>
#### `Str::ulid()`

`Str::ulid` 메서드는 ULID를 생성합니다:

```
use Illuminate\Support\Str;

return (string) Str::ulid();

// 01gd6r360bp37zj17nxb55yv40
```

<a name="method-str-uuid"></a>
#### `Str::uuid()`

`Str::uuid` 메서드는 UUID(버전 4)를 생성합니다:

```
use Illuminate\Support\Str;

return (string) Str::uuid();
```

<a name="method-str-word-count"></a>
#### `Str::wordCount()`

`Str::wordCount` 메서드는 문자열에 포함된 단어의 개수를 반환합니다:

```php
use Illuminate\Support\Str;

Str::wordCount('Hello, world!'); // 2
```

<a name="method-str-words"></a>
#### `Str::words()`

`Str::words` 메서드는 문자열의 단어 개수를 제한합니다. 세 번째 인수로 추가 문자열을 전달해, 잘린 문자열의 끝에 어떤 문자열을 붙일지 지정할 수 있습니다:

```
use Illuminate\Support\Str;

return Str::words('Perfectly balanced, as all things should be.', 3, ' >>>');

// Perfectly balanced, as >>>
```

<a name="method-str"></a>
#### `str()`

`str` 함수는 전달된 문자열의 `Illuminate\Support\Stringable` 인스턴스를 반환합니다. 이 함수는 `Str::of` 메서드와 동일합니다:

```
$string = str('Taylor')->append(' Otwell');

// 'Taylor Otwell'
```

만약 `str` 함수에 인수를 제공하지 않으면, `Illuminate\Support\Str`의 인스턴스를 반환합니다:

```
$snake = str()->snake('FooBar');

// 'foo_bar'
```

<a name="method-trans"></a>
#### `trans()`

`trans` 함수는 [로컬라이제이션 파일](/docs/9.x/localization)을 사용하여 전달된 번역 키를 번역합니다:

```
echo trans('messages.welcome');
```

지정한 번역 키가 존재하지 않을 경우, `trans` 함수는 전달된 키 자체를 반환합니다. 따라서 위 예시에서 해당 키가 없다면 `trans` 함수는 `messages.welcome`을 반환합니다.

<a name="method-trans-choice"></a>
#### `trans_choice()`

`trans_choice` 함수는 전달된 번역 키를 복수형 규칙에 맞게 번역합니다:

```
echo trans_choice('messages.notifications', $unreadCount);
```

지정한 번역 키가 존재하지 않을 경우, `trans_choice` 함수 역시 전달된 키 자체를 반환합니다. 위 예시에서는 해당 키가 없다면 `messages.notifications`가 반환됩니다.

<a name="fluent-strings"></a>
## 플루언트 문자열(Fluent Strings)

플루언트 문자열은 문자열 값을 더 유창하고 객체 지향적으로 다룰 수 있는 인터페이스를 제공합니다. 이를 사용하면 여러 문자열 작업을 전통적인 방식보다 가독성 높게 체이닝하여 연결해서 사용할 수 있습니다.

<a name="method-fluent-str-after"></a>
#### `after`

`after` 메서드는 문자열에서 지정한 값 다음의 모든 내용을 반환합니다. 만약 지정한 값이 문자열 내에 없다면, 전체 문자열이 반환됩니다:

```
use Illuminate\Support\Str;

$slice = Str::of('This is my name')->after('This is');

// ' my name'
```

<a name="method-fluent-str-after-last"></a>
#### `afterLast`

`afterLast` 메서드는 문자열에서 지정한 값이 마지막으로 등장한 이후의 모든 내용을 반환합니다. 만약 지정한 값이 없다면, 전체 문자열을 반환합니다:

```
use Illuminate\Support\Str;

$slice = Str::of('App\Http\Controllers\Controller')->afterLast('\\');

// 'Controller'
```

<a name="method-fluent-str-append"></a>
#### `append`

`append` 메서드는 전달된 값을 문자열 끝에 덧붙입니다:

```
use Illuminate\Support\Str;

$string = Str::of('Taylor')->append(' Otwell');

// 'Taylor Otwell'
```

<a name="method-fluent-str-ascii"></a>
#### `ascii`

`ascii` 메서드는 문자열을 ASCII 값으로 변환하려고 시도합니다:

```
use Illuminate\Support\Str;

$string = Str::of('ü')->ascii();

// 'u'
```

<a name="method-fluent-str-basename"></a>
#### `basename`

`basename` 메서드는 전달된 문자열의 마지막에 위치한 이름만 반환합니다:

```
use Illuminate\Support\Str;

$string = Str::of('/foo/bar/baz')->basename();

// 'baz'
```

필요하다면, 파일 확장자를 지정하여 마지막 이름에서 확장자를 제거할 수도 있습니다:

```
use Illuminate\Support\Str;

$string = Str::of('/foo/bar/baz.jpg')->basename('.jpg');

// 'baz'
```

<a name="method-fluent-str-before"></a>
#### `before`

`before` 메서드는 문자열에서 지정한 값 앞까지의 모든 내용을 반환합니다:

```
use Illuminate\Support\Str;

$slice = Str::of('This is my name')->before('my name');

// 'This is '
```

<a name="method-fluent-str-before-last"></a>
#### `beforeLast`

`beforeLast` 메서드는 지정한 값이 마지막으로 등장하기 전까지의 모든 내용을 반환합니다:

```
use Illuminate\Support\Str;

$slice = Str::of('This is my name')->beforeLast('is');

// 'This '
```

<a name="method-fluent-str-between"></a>
#### `between`

`between` 메서드는 두 값 사이에 위치한 문자열의 일부를 반환합니다:

```
use Illuminate\Support\Str;

$converted = Str::of('This is my name')->between('This', 'name');

// ' is my '
```

<a name="method-fluent-str-between-first"></a>
#### `betweenFirst`

`betweenFirst` 메서드는 두 값 사이의 최소 구간에 해당하는 문자열의 일부를 반환합니다:

```
use Illuminate\Support\Str;

$converted = Str::of('[a] bc [d]')->betweenFirst('[', ']');

// 'a'
```

<a name="method-fluent-str-camel"></a>
#### `camel`

`camel` 메서드는 전달된 문자열을 `camelCase`로 변환합니다:

```
use Illuminate\Support\Str;

$converted = Str::of('foo_bar')->camel();

// fooBar
```

<a name="method-fluent-str-class-basename"></a>
#### `classBasename`

`classBasename` 메서드는 전달된 클래스에서 네임스페이스를 제거한 클래스명만 반환합니다:

```
use Illuminate\Support\Str;

$class = Str::of('Foo\Bar\Baz')->classBasename();

// Baz
```

<a name="method-fluent-str-contains"></a>
#### `contains`

`contains` 메서드는 문자열에 특정 값이 포함되어 있는지 확인합니다. 이 메서드는 대소문자를 구분합니다:

```
use Illuminate\Support\Str;

$contains = Str::of('This is my name')->contains('my');

// true
```

여러 값을 배열로 전달하여, 그 중 하나라도 포함되어 있는지 확인할 수도 있습니다:

```
use Illuminate\Support\Str;

$contains = Str::of('This is my name')->contains(['my', 'foo']);

// true
```

<a name="method-fluent-str-contains-all"></a>
#### `containsAll`

`containsAll` 메서드는 지정한 배열에 있는 모든 값이 문자열에 포함되어 있는지 확인합니다:

```
use Illuminate\Support\Str;

$containsAll = Str::of('This is my name')->containsAll(['my', 'name']);

// true
```

<a name="method-fluent-str-dirname"></a>
#### `dirname`

`dirname` 메서드는 전달된 문자열에서 상위 디렉터리 부분을 반환합니다:

```
use Illuminate\Support\Str;

$string = Str::of('/foo/bar/baz')->dirname();

// '/foo/bar'
```

필요하다면, 제거할 디렉터리의 레벨 수를 지정할 수도 있습니다:

```
use Illuminate\Support\Str;

$string = Str::of('/foo/bar/baz')->dirname(2);

// '/foo'
```

<a name="method-fluent-str-excerpt"></a>
#### `excerpt`

`excerpt` 메서드는 문자열에서 처음 등장하는 특정 구문과 그 양쪽 일부분을 포함하는 발췌(Excerpt) 문자열을 추출합니다:

```
use Illuminate\Support\Str;

$excerpt = Str::of('This is my name')->excerpt('my', [
    'radius' => 3
]);

// '...is my na...'
```

`radius` 옵션은 좌우로 표시될 문자 수를 지정하며, 기본값은 `100`입니다.

또한, `omission` 옵션을 사용해서 잘린 문자열 앞뒤에 붙는 글자를 변경할 수 있습니다:

```
use Illuminate\Support\Str;

$excerpt = Str::of('This is my name')->excerpt('name', [
    'radius' => 3,
    'omission' => '(...) '
]);

// '(...) my name'
```

<a name="method-fluent-str-ends-with"></a>
#### `endsWith`

`endsWith` 메서드는 문자열이 지정한 값으로 끝나는지를 확인합니다:

```
use Illuminate\Support\Str;

$result = Str::of('This is my name')->endsWith('name');

// true
```

여러 값을 배열로 전달하면, 그 중 하나라도 해당 값으로 끝나는지 확인할 수 있습니다:

```
use Illuminate\Support\Str;

$result = Str::of('This is my name')->endsWith(['name', 'foo']);

// true

$result = Str::of('This is my name')->endsWith(['this', 'foo']);

// false
```

<a name="method-fluent-str-exactly"></a>
#### `exactly`

`exactly` 메서드는 주어진 문자열이 다른 문자열과 정확하게 일치하는지 확인합니다:

```
use Illuminate\Support\Str;

$result = Str::of('Laravel')->exactly('Laravel');

// true
```

<a name="method-fluent-str-explode"></a>
#### `explode`

`explode` 메서드는 지정한 구분자로 문자열을 분할해서, 각 부분을 컬렉션에 담아 반환합니다:

```
use Illuminate\Support\Str;

$collection = Str::of('foo bar baz')->explode(' ');

// collect(['foo', 'bar', 'baz'])
```

<a name="method-fluent-str-finish"></a>
#### `finish`

`finish` 메서드는, 문자열이 지정한 값으로 끝나지 않는 경우, 해당 값을 한 번만 문자열 끝에 덧붙입니다:

```
use Illuminate\Support\Str;

$adjusted = Str::of('this/string')->finish('/');

// this/string/

$adjusted = Str::of('this/string/')->finish('/');

// this/string/
```

<a name="method-fluent-str-headline"></a>
#### `headline`

`headline` 메서드는 대소문자, 하이픈, 언더스코어로 구분된 문자열을 단어별 첫 글자가 대문자인 공백 구분 문자열로 변환합니다:

```
use Illuminate\Support\Str;

$headline = Str::of('taylor_otwell')->headline();

// Taylor Otwell

$headline = Str::of('EmailNotificationSent')->headline();

// Email Notification Sent
```

<a name="method-fluent-str-inline-markdown"></a>
#### `inlineMarkdown`

`inlineMarkdown` 메서드는 GitHub 스타일의 Markdown을 [CommonMark](https://commonmark.thephpleague.com/)를 사용하여 인라인 HTML로 변환합니다. 단, `markdown` 메서드와 달리 생성된 모든 HTML을 블록 레벨 요소로 감싸지 않습니다:

```
use Illuminate\Support\Str;

$html = Str::of('**Laravel**')->inlineMarkdown();

// <strong>Laravel</strong>
```

<a name="method-fluent-str-is"></a>
#### `is`

`is` 메서드는 문자열이 주어진 패턴과 일치하는지 확인합니다. 이때, 별표(*)를 와일드카드로 사용할 수 있습니다

```
use Illuminate\Support\Str;

$matches = Str::of('foobar')->is('foo*');

// true

$matches = Str::of('foobar')->is('baz*');

// false
```

<a name="method-fluent-str-is-ascii"></a>
#### `isAscii`

`isAscii` 메서드는 문자열이 ASCII 문자열인지 확인합니다:

```
use Illuminate\Support\Str;

$result = Str::of('Taylor')->isAscii();

// true

$result = Str::of('ü')->isAscii();

// false
```

<a name="method-fluent-str-is-empty"></a>
#### `isEmpty`

`isEmpty` 메서드는 문자열이 비어있는지 확인합니다:

```
use Illuminate\Support\Str;

$result = Str::of('  ')->trim()->isEmpty();

// true

$result = Str::of('Laravel')->trim()->isEmpty();

// false
```

<a name="method-fluent-str-is-not-empty"></a>
#### `isNotEmpty`

`isNotEmpty` 메서드는 문자열이 비어있지 않은지 확인합니다:

```
use Illuminate\Support\Str;

$result = Str::of('  ')->trim()->isNotEmpty();

// false

$result = Str::of('Laravel')->trim()->isNotEmpty();

// true
```

<a name="method-fluent-str-is-json"></a>
#### `isJson`

`isJson` 메서드는 문자열이 유효한 JSON 형식인지 확인합니다:

```
use Illuminate\Support\Str;

$result = Str::of('[1,2,3]')->isJson();

// true

$result = Str::of('{"first": "John", "last": "Doe"}')->isJson();

// true

$result = Str::of('{first: "John", last: "Doe"}')->isJson();

// false
```

<a name="method-fluent-str-is-ulid"></a>
#### `isUlid`

`isUlid` 메서드는 문자열이 ULID 형식인지 확인합니다:

```
use Illuminate\Support\Str;

$result = Str::of('01gd6r360bp37zj17nxb55yv40')->isUlid();

// true

$result = Str::of('Taylor')->isUlid();

// false
```

<a name="method-fluent-str-is-uuid"></a>
#### `isUuid`

`isUuid` 메서드는 문자열이 UUID 형식인지 확인합니다:

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

<a name="method-fluent-str-lcfirst"></a>
#### `lcfirst`

`lcfirst` 메서드는 주어진 문자열의 첫 글자를 소문자로 바꿔서 반환합니다.

```
use Illuminate\Support\Str;

$string = Str::of('Foo Bar')->lcfirst();

// foo Bar
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

`limit` 메서드는 주어진 문자열을 지정한 길이만큼 잘라서 반환합니다.

```
use Illuminate\Support\Str;

$truncated = Str::of('The quick brown fox jumps over the lazy dog')->limit(20);

// The quick brown fox...
```

문자열 마지막에 붙일 문자열을 두 번째 인수로 전달하여 지정할 수도 있습니다.

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

`ltrim` 메서드는 문자열의 왼쪽 부분(앞쪽)에 있는 공백이나 지정한 문자를 제거합니다.

```
use Illuminate\Support\Str;

$string = Str::of('  Laravel  ')->ltrim();

// 'Laravel  '

$string = Str::of('/Laravel/')->ltrim('/');

// 'Laravel/'
```

<a name="method-fluent-str-markdown"></a>
#### `markdown`

`markdown` 메서드는 GitHub 스타일의 마크다운(Markdown)을 HTML로 변환합니다.

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

`mask` 메서드는 문자열의 일부 구간을 지정한 문자로 덮어서 마스킹(masking)합니다. 이메일 주소나 전화번호 등 민감 정보의 일부를 가릴 때 사용할 수 있습니다.

```
use Illuminate\Support\Str;

$string = Str::of('taylor@example.com')->mask('*', 3);

// tay***************
```

필요하다면, 세 번째나 네 번째 인수에 음수를 지정하여 문자열의 끝에서부터 마스킹을 시작하도록 지정할 수 있습니다.

```
$string = Str::of('taylor@example.com')->mask('*', -15, 3);

// tay***@example.com

$string = Str::of('taylor@example.com')->mask('*', 4, -4);

// tayl**********.com
```

<a name="method-fluent-str-match"></a>
#### `match`

`match` 메서드는 주어진 정규식 패턴과 일치하는 문자열의 일부를 반환합니다.

```
use Illuminate\Support\Str;

$result = Str::of('foo bar')->match('/bar/');

// 'bar'

$result = Str::of('foo bar')->match('/foo (.*)/');

// 'bar'
```

<a name="method-fluent-str-match-all"></a>
#### `matchAll`

`matchAll` 메서드는 주어진 정규식 패턴과 일치하는 모든 부분 문자열을 컬렉션으로 반환합니다.

```
use Illuminate\Support\Str;

$result = Str::of('bar foo bar')->matchAll('/bar/');

// collect(['bar', 'bar'])
```

정규식에 그룹을 지정하면 그 그룹에 해당하는 부분만 컬렉션으로 반환합니다.

```
use Illuminate\Support\Str;

$result = Str::of('bar fun bar fly')->matchAll('/f(\w*)/');

// collect(['un', 'ly']);
```

일치하는 값이 없으면 빈 컬렉션을 반환합니다.

<a name="method-fluent-str-new-line"></a>
#### `newLine`

`newLine` 메서드는 문자열 끝에 개행(줄바꿈) 문자를 추가합니다.

```
use Illuminate\Support\Str;

$padded = Str::of('Laravel')->newLine()->append('Framework');

// 'Laravel
//  Framework'
```

<a name="method-fluent-str-padboth"></a>
#### `padBoth`

`padBoth` 메서드는 PHP의 `str_pad` 함수를 감싸 양쪽(좌우)에서 문자열을 지정한 문자로 채워, 최종 문자열이 원하는 길이가 되도록 만듭니다.

```
use Illuminate\Support\Str;

$padded = Str::of('James')->padBoth(10, '_');

// '__James___'

$padded = Str::of('James')->padBoth(10);

// '  James   '
```

<a name="method-fluent-str-padleft"></a>
#### `padLeft`

`padLeft` 메서드는 PHP의 `str_pad` 함수를 감싸 왼쪽(앞쪽)에서 문자열을 지정한 문자로 채워, 최종 문자열이 원하는 길이가 되도록 만듭니다.

```
use Illuminate\Support\Str;

$padded = Str::of('James')->padLeft(10, '-=');

// '-=-=-James'

$padded = Str::of('James')->padLeft(10);

// '     James'
```

<a name="method-fluent-str-padright"></a>
#### `padRight`

`padRight` 메서드는 PHP의 `str_pad` 함수를 감싸 오른쪽(뒷쪽)에서 문자열을 지정한 문자로 채워, 최종 문자열이 원하는 길이가 되도록 만듭니다.

```
use Illuminate\Support\Str;

$padded = Str::of('James')->padRight(10, '-');

// 'James-----'

$padded = Str::of('James')->padRight(10);

// 'James     '
```

<a name="method-fluent-str-pipe"></a>
#### `pipe`

`pipe` 메서드는 현재 문자열 값을 전달하여, 주어진 콜러블(callable)로 변환할 수 있도록 해줍니다.

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

`plural` 메서드는 단수 형태의 단어를 복수형으로 변환합니다. 이 함수는 [라라벨의 복수화 기능이 지원하는 모든 언어](/docs/9.x/localization#pluralization-language)를 지원합니다.

```
use Illuminate\Support\Str;

$plural = Str::of('car')->plural();

// cars

$plural = Str::of('child')->plural();

// children
```

문자열의 복수형 또는 단수형을 결정하기 위해 두 번째 인수로 정수를 지정할 수 있습니다.

```
use Illuminate\Support\Str;

$plural = Str::of('child')->plural(2);

// children

$plural = Str::of('child')->plural(1);

// child
```

<a name="method-fluent-str-prepend"></a>
#### `prepend`

`prepend` 메서드는 주어진 값들을 문자열 앞에 추가합니다.

```
use Illuminate\Support\Str;

$string = Str::of('Framework')->prepend('Laravel ');

// Laravel Framework
```

<a name="method-fluent-str-remove"></a>
#### `remove`

`remove` 메서드는 주어진 값 또는 값들의 배열을 문자열에서 제거합니다.

```
use Illuminate\Support\Str;

$string = Str::of('Arkansas is quite beautiful!')->remove('quite');

// Arkansas is beautiful!
```

문자열을 제거할 때 대소문자를 무시하고 싶다면 두 번째 인수로 `false`를 전달할 수 있습니다.

<a name="method-fluent-str-replace"></a>
#### `replace`

`replace` 메서드는 문자열 내의 지정한 값을 다른 값으로 교체합니다.

```
use Illuminate\Support\Str;

$replaced = Str::of('Laravel 6.x')->replace('6.x', '7.x');

// Laravel 7.x
```

<a name="method-fluent-str-replace-array"></a>
#### `replaceArray`

`replaceArray` 메서드는 문자열 내에서 지정한 값을 배열 순서대로 하나씩 교체합니다.

```
use Illuminate\Support\Str;

$string = 'The event will take place between ? and ?';

$replaced = Str::of($string)->replaceArray('?', ['8:30', '9:00']);

// The event will take place between 8:30 and 9:00
```

<a name="method-fluent-str-replace-first"></a>
#### `replaceFirst`

`replaceFirst` 메서드는 문자열 내에서 지정한 값이 처음으로 나타나는 부분만 다른 값으로 교체합니다.

```
use Illuminate\Support\Str;

$replaced = Str::of('the quick brown fox jumps over the lazy dog')->replaceFirst('the', 'a');

// a quick brown fox jumps over the lazy dog
```

<a name="method-fluent-str-replace-last"></a>
#### `replaceLast`

`replaceLast` 메서드는 문자열 내에서 지정한 값이 마지막으로 나타나는 부분만 다른 값으로 교체합니다.

```
use Illuminate\Support\Str;

$replaced = Str::of('the quick brown fox jumps over the lazy dog')->replaceLast('the', 'a');

// the quick brown fox jumps over a lazy dog
```

<a name="method-fluent-str-replace-matches"></a>
#### `replaceMatches`

`replaceMatches` 메서드는 지정한 패턴에 일치하는 모든 부분을 주어진 문자열로 교체합니다.

```
use Illuminate\Support\Str;

$replaced = Str::of('(+1) 501-555-1000')->replaceMatches('/[^A-Za-z0-9]++/', '')

// '15015551000'
```

`replaceMatches` 메서드는 클로저를 전달하여 패턴과 일치하는 각 부분에 대해 교체 로직을 직접 작성할 수도 있습니다. 이때 클로저에서 원하는 값으로 반환할 수 있습니다.

```
use Illuminate\Support\Str;

$replaced = Str::of('123')->replaceMatches('/\d/', function ($match) {
    return '['.$match[0].']';
});

// '[1][2][3]'
```

<a name="method-fluent-str-rtrim"></a>
#### `rtrim`

`rtrim` 메서드는 주어진 문자열의 오른쪽(뒤쪽) 공백 또는 지정된 문자를 잘라냅니다.

```
use Illuminate\Support\Str;

$string = Str::of('  Laravel  ')->rtrim();

// '  Laravel'

$string = Str::of('/Laravel/')->rtrim('/');

// '/Laravel'
```

<a name="method-fluent-str-scan"></a>
#### `scan`

`scan` 메서드는 [`sscanf` PHP 함수](https://www.php.net/manual/en/function.sscanf.php)에서 지원하는 형식에 따라 문자열을 파싱하여 컬렉션으로 반환합니다.

```
use Illuminate\Support\Str;

$collection = Str::of('filename.jpg')->scan('%[^.].%s');

// collect(['filename', 'jpg'])
```

<a name="method-fluent-str-singular"></a>
#### `singular`

`singular` 메서드는 문자열을 단수형으로 변환합니다. 이 함수는 [라라벨의 복수화 기능이 지원하는 모든 언어](/docs/9.x/localization#pluralization-language)를 지원합니다.

```
use Illuminate\Support\Str;

$singular = Str::of('cars')->singular();

// car

$singular = Str::of('children')->singular();

// child
```

<a name="method-fluent-str-slug"></a>
#### `slug`

`slug` 메서드는 주어진 문자열을 URL에 사용할 수 있는 슬러그(slug) 형태로 변환합니다.

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

`split` 메서드는 정규 표현식을 사용해 문자열을 컬렉션으로 분할합니다.

```
use Illuminate\Support\Str;

$segments = Str::of('one, two, three')->split('/[\s,]+/');

// collect(["one", "two", "three"])
```

<a name="method-fluent-str-squish"></a>
#### `squish`

`squish` 메서드는 문자열에서 불필요한 모든 공백을 제거하며, 단어 사이에 여분의 공백도 깔끔하게 하나로 정리합니다.

```
use Illuminate\Support\Str;

$string = Str::of('    laravel    framework    ')->squish();

// laravel framework
```

<a name="method-fluent-str-start"></a>
#### `start`

`start` 메서드는 문자열이 이미 지정한 값으로 시작하지 않으면, 그 값을 한 번만 앞에 붙여 반환합니다.

```
use Illuminate\Support\Str;

$adjusted = Str::of('this/string')->start('/');

// /this/string

$adjusted = Str::of('/this/string')->start('/');

// /this/string
```

<a name="method-fluent-str-starts-with"></a>
#### `startsWith`

`startsWith` 메서드는 주어진 문자열이 지정한 값으로 시작하는지 여부를 반환합니다.

```
use Illuminate\Support\Str;

$result = Str::of('This is my name')->startsWith('This');

// true
```

<a name="method-fluent-str-studly"></a>
#### `studly`

`studly` 메서드는 주어진 문자열을 `StudlyCase`(단어별 첫 글자 대문자) 형식으로 변환합니다.

```
use Illuminate\Support\Str;

$converted = Str::of('foo_bar')->studly();

// FooBar
```

<a name="method-fluent-str-substr"></a>
#### `substr`

`substr` 메서드는 주어진 시작 위치와 길이 파라미터로 지정한 부분 문자열을 반환합니다.

```
use Illuminate\Support\Str;

$string = Str::of('Laravel Framework')->substr(8);

// Framework

$string = Str::of('Laravel Framework')->substr(8, 5);

// Frame
```

<a name="method-fluent-str-substrreplace"></a>

#### `substrReplace`

`substrReplace` 메서드는 문자열의 일부를 지정된 위치(두 번째 인자)에서 시작해서, 세 번째 인자로 지정된 문자 수만큼의 텍스트를 대체합니다. 세 번째 인자에 `0`을 전달하면, 기존 문자열의 문자를 삭제하지 않고 지정된 위치에 문자열을 삽입합니다.

```
use Illuminate\Support\Str;

$string = Str::of('1300')->substrReplace(':', 2);

// 13:

$string = Str::of('The Framework')->substrReplace(' Laravel', 3, 0);

// The Laravel Framework
```

<a name="method-fluent-str-swap"></a>
#### `swap`

`swap` 메서드는 PHP의 `strtr` 함수를 사용하여 문자열 내에서 여러 값을 한 번에 치환합니다.

```
use Illuminate\Support\Str;

$string = Str::of('Tacos are great!')
    ->swap([
        'Tacos' => 'Burritos',
        'great' => 'fantastic',
    ]);

// Burritos are fantastic!
```

<a name="method-fluent-str-tap"></a>
#### `tap`

`tap` 메서드는 현재 문자열 인스턴스를 지정한 클로저로 전달하여, 문자열을 직접 변경하지 않고 문자열을 살펴보거나 처리할 수 있게 해줍니다. 클로저에서 어떤 값을 반환하더라도, 원래의 문자열 인스턴스가 `tap` 메서드의 반환값으로 사용됩니다.

```
use Illuminate\Support\Str;

$string = Str::of('Laravel')
    ->append(' Framework')
    ->tap(function ($string) {
        dump('String after append: '.$string);
    })
    ->upper();

// LARAVEL FRAMEWORK
```

<a name="method-fluent-str-test"></a>
#### `test`

`test` 메서드는 주어진 정규 표현식 패턴과 문자열이 일치하는지 확인합니다.

```
use Illuminate\Support\Str;

$result = Str::of('Laravel Framework')->test('/Laravel/');

// true
```

<a name="method-fluent-str-title"></a>
#### `title`

`title` 메서드는 주어진 문자열을 `Title Case`(각 단어의 첫 글자만 대문자)로 변환합니다.

```
use Illuminate\Support\Str;

$converted = Str::of('a nice title uses the correct case')->title();

// A Nice Title Uses The Correct Case
```

<a name="method-fluent-str-trim"></a>
#### `trim`

`trim` 메서드는 문자열 좌우의 공백(또는 지정된 문자)을 제거합니다.

```
use Illuminate\Support\Str;

$string = Str::of('  Laravel  ')->trim();

// 'Laravel'

$string = Str::of('/Laravel/')->trim('/');

// 'Laravel'
```

<a name="method-fluent-str-ucfirst"></a>
#### `ucfirst`

`ucfirst` 메서드는 문자열의 첫 번째 문자만 대문자로 변환하여 반환합니다.

```
use Illuminate\Support\Str;

$string = Str::of('foo bar')->ucfirst();

// Foo bar
```

<a name="method-fluent-str-ucsplit"></a>
#### `ucsplit`

`ucsplit` 메서드는 문자열을 대문자 기준으로 쪼개어 컬렉션으로 반환합니다.

```
use Illuminate\Support\Str;

$string = Str::of('Foo Bar')->ucsplit();

// collect(['Foo', 'Bar'])
```

<a name="method-fluent-str-upper"></a>
#### `upper`

`upper` 메서드는 주어진 문자열을 모두 대문자로 변환합니다.

```
use Illuminate\Support\Str;

$adjusted = Str::of('laravel')->upper();

// LARAVEL
```

<a name="method-fluent-str-when"></a>
#### `when`

`when` 메서드는 주어진 조건이 `true`일 때 지정한 클로저를 실행합니다. 클로저에는 Fluent String 인스턴스가 전달됩니다.

```
use Illuminate\Support\Str;

$string = Str::of('Taylor')
                ->when(true, function ($string) {
                    return $string->append(' Otwell');
                });

// 'Taylor Otwell'
```

필요하다면, `when` 메서드의 세 번째 인자로 또 다른 클로저를 전달할 수 있습니다. 이 클로저는 조건이 `false`일 때 실행됩니다.

<a name="method-fluent-str-when-contains"></a>
#### `whenContains`

`whenContains` 메서드는 문자열에 지정된 값이 포함되어 있을 때, 주어진 클로저를 실행합니다. 클로저에는 Fluent String 인스턴스가 전달됩니다.

```
use Illuminate\Support\Str;

$string = Str::of('tony stark')
            ->whenContains('tony', function ($string) {
                return $string->title();
            });

// 'Tony Stark'
```

필요하다면 `when` 메서드처럼 세 번째 인자로 또 다른 클로저를 전달할 수 있으며, 문자열에 지정한 값이 포함되어 있지 않을 때 이 클로저가 실행됩니다.

또한 배열을 사용해 여러 값을 전달할 수 있으며, 배열 내 값들 중 하나라도 포함되어 있으면 클로저가 실행됩니다.

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

`whenContainsAll` 메서드는 문자열이 지정한 모든 부분 문자열을 포함하고 있을 때, 주어진 클로저를 실행합니다. 클로저에는 Fluent String 인스턴스가 전달됩니다.

```
use Illuminate\Support\Str;

$string = Str::of('tony stark')
                ->whenContainsAll(['tony', 'stark'], function ($string) {
                    return $string->title();
                });

// 'Tony Stark'
```

필요하다면, 세 번째 인자로 또 다른 클로저를 전달할 수 있으며, 조건이 `false`일 때 실행됩니다.

<a name="method-fluent-str-when-empty"></a>
#### `whenEmpty`

`whenEmpty` 메서드는 문자열이 비어 있을 때 지정된 클로저를 실행합니다. 클로저에서 값을 반환하면, 해당 값이 `whenEmpty` 메서드의 결과로 반환됩니다. 클로저에서 값을 반환하지 않을 경우, 원래의 Fluent String 인스턴스가 반환됩니다.

```
use Illuminate\Support\Str;

$string = Str::of('  ')->whenEmpty(function ($string) {
    return $string->trim()->prepend('Laravel');
});

// 'Laravel'
```

<a name="method-fluent-str-when-not-empty"></a>
#### `whenNotEmpty`

`whenNotEmpty` 메서드는 문자열이 비어 있지 않을 때 지정된 클로저를 실행합니다. 클로저에서 값을 반환하면 해당 값이, 반환하지 않을 경우 Fluent String 인스턴스가 반환됩니다.

```
use Illuminate\Support\Str;

$string = Str::of('Framework')->whenNotEmpty(function ($string) {
    return $string->prepend('Laravel ');
});

// 'Laravel Framework'
```

<a name="method-fluent-str-when-starts-with"></a>
#### `whenStartsWith`

`whenStartsWith` 메서드는 문자열이 지정한 부분 문자열로 시작할 때, 해당 클로저를 실행합니다. 클로저에는 Fluent String 인스턴스가 전달됩니다.

```
use Illuminate\Support\Str;

$string = Str::of('disney world')->whenStartsWith('disney', function ($string) {
    return $string->title();
});

// 'Disney World'
```

<a name="method-fluent-str-when-ends-with"></a>
#### `whenEndsWith`

`whenEndsWith` 메서드는 문자열이 지정한 부분 문자열로 끝나는 경우, 주어진 클로저를 실행합니다. 클로저에는 Fluent String 인스턴스가 전달됩니다.

```
use Illuminate\Support\Str;

$string = Str::of('disney world')->whenEndsWith('world', function ($string) {
    return $string->title();
});

// 'Disney World'
```

<a name="method-fluent-str-when-exactly"></a>
#### `whenExactly`

`whenExactly` 메서드는 문자열이 지정한 문자열과 정확히 일치할 때, 주어진 클로저를 실행합니다. 클로저에는 Fluent String 인스턴스가 전달됩니다.

```
use Illuminate\Support\Str;

$string = Str::of('laravel')->whenExactly('laravel', function ($string) {
    return $string->title();
});

// 'Laravel'
```

<a name="method-fluent-str-when-not-exactly"></a>
#### `whenNotExactly`

`whenNotExactly` 메서드는 문자열이 지정한 문자열과 정확히 일치하지 않을 때, 주어진 클로저를 실행합니다. 클로저에는 Fluent String 인스턴스가 전달됩니다.

```
use Illuminate\Support\Str;

$string = Str::of('framework')->whenNotExactly('laravel', function ($string) {
    return $string->title();
});

// 'Framework'
```

<a name="method-fluent-str-when-is"></a>
#### `whenIs`

`whenIs` 메서드는 문자열이 주어진 패턴과 일치할 때(별표(*)를 와일드카드로 사용 가능), 해당 클로저를 실행합니다. 클로저에는 Fluent String 인스턴스가 전달됩니다.

```
use Illuminate\Support\Str;

$string = Str::of('foo/bar')->whenIs('foo/*', function ($string) {
    return $string->append('/baz');
});

// 'foo/bar/baz'
```

<a name="method-fluent-str-when-is-ascii"></a>
#### `whenIsAscii`

`whenIsAscii` 메서드는 문자열이 7비트 ASCII 문자로만 이루어져 있을 때, 주어진 클로저를 실행합니다. 클로저에는 Fluent String 인스턴스가 전달됩니다.

```
use Illuminate\Support\Str;

$string = Str::of('laravel')->whenIsAscii(function ($string) {
    return $string->title();
});

// 'Laravel'
```

<a name="method-fluent-str-when-is-ulid"></a>
#### `whenIsUlid`

`whenIsUlid` 메서드는 문자열이 유효한 ULID인지 확인하여, 맞을 때 주어진 클로저를 실행합니다. 클로저에는 Fluent String 인스턴스가 전달됩니다.

```
use Illuminate\Support\Str;

$string = Str::of('01gd6r360bp37zj17nxb55yv40')->whenIsUlid(function ($string) {
    return $string->substr(0, 8);
});

// '01gd6r36'
```

<a name="method-fluent-str-when-is-uuid"></a>
#### `whenIsUuid`

`whenIsUuid` 메서드는 문자열이 유효한 UUID인지 확인하여, 맞을 때 주어진 클로저를 실행합니다. 클로저에는 Fluent String 인스턴스가 전달됩니다.

```
use Illuminate\Support\Str;

$string = Str::of('a0a2a2d2-0b87-4a18-83f2-2529882be2de')->whenIsUuid(function ($string) {
    return $string->substr(0, 8);
});

// 'a0a2a2d2'
```

<a name="method-fluent-str-when-test"></a>
#### `whenTest`

`whenTest` 메서드는 주어진 정규 표현식과 문자열이 일치할 때, 지정한 클로저를 실행합니다. 클로저에는 Fluent String 인스턴스가 전달됩니다.

```
use Illuminate\Support\Str;

$string = Str::of('laravel framework')->whenTest('/laravel/', function ($string) {
    return $string->title();
});

// 'Laravel Framework'
```

<a name="method-fluent-str-word-count"></a>
#### `wordCount`

`wordCount` 메서드는 문자열에 포함된 단어의 개수를 반환합니다.

```php
use Illuminate\Support\Str;

Str::of('Hello, world!')->wordCount(); // 2
```

<a name="method-fluent-str-words"></a>
#### `words`

`words` 메서드는 문자열의 단어 수를 제한합니다. 필요한 경우, 잘린 부분 뒤에 추가할 문자열을 두 번째 인자로 지정할 수 있습니다.

```
use Illuminate\Support\Str;

$string = Str::of('Perfectly balanced, as all things should be.')->words(3, ' >>>');

// Perfectly balanced, as >>>
```

<a name="urls"></a>
## URL

<a name="method-action"></a>
#### `action()`

`action` 함수는 지정한 컨트롤러 액션에 대한 URL을 생성합니다.

```
use App\Http\Controllers\HomeController;

$url = action([HomeController::class, 'index']);
```

만약 해당 메서드가 라우트 파라미터를 받는다면, 두 번째 인자로 전달할 수 있습니다.

```
$url = action([UserController::class, 'profile'], ['id' => 1]);
```

<a name="method-asset"></a>
#### `asset()`

`asset` 함수는 현재 요청의 스킴(HTTP 또는 HTTPS)에 따라 asset(정적 파일) 경로의 URL을 생성합니다.

```
$url = asset('img/photo.jpg');
```

.asset URL의 호스트는 `.env` 파일의 `ASSET_URL` 변수를 설정하여 변경할 수 있습니다. 이는 Amazon S3나 다른 CDN 등 외부 서비스에서 asset 파일을 제공할 경우 유용하게 사용할 수 있습니다.

```
// ASSET_URL=http://example.com/assets

$url = asset('img/photo.jpg'); // http://example.com/assets/img/photo.jpg
```

<a name="method-route"></a>
#### `route()`

`route` 함수는 [이름이 지정된 라우트](/docs/9.x/routing#named-routes)의 URL을 생성합니다.

```
$url = route('route.name');
```

해당 라우트가 파라미터를 받는 경우, 두 번째 인자로 파라미터 배열을 전달할 수 있습니다.

```
$url = route('route.name', ['id' => 1]);
```

기본적으로, `route` 함수는 절대 URL을 생성합니다. 만약 상대 경로 URL을 만들고 싶다면, 세 번째 인자에 `false`를 전달하면 됩니다.

```
$url = route('route.name', ['id' => 1], false);
```

<a name="method-secure-asset"></a>
#### `secure_asset()`

`secure_asset` 함수는 HTTPS를 사용하여 asset 파일의 URL을 생성합니다.

```
$url = secure_asset('img/photo.jpg');
```

<a name="method-secure-url"></a>
#### `secure_url()`

`secure_url` 함수는 지정된 경로에 대해 전체 HTTPS URL을 생성합니다. 필요하다면, 두 번째 인자에 추가 URL 세그먼트들을 배열로 넘길 수 있습니다.

```
$url = secure_url('user/profile');

$url = secure_url('user/profile', [1]);
```

<a name="method-to-route"></a>
#### `to_route()`

`to_route` 함수는 지정한 [이름이 있는 라우트](/docs/9.x/routing#named-routes)에 대한 [리다이렉트 HTTP 응답](/docs/9.x/responses#redirects)을 생성합니다.

```
return to_route('users.show', ['user' => 1]);
```

필요하다면, 세 번째, 네 번째 인자로 각각 리다이렉트에 사용할 HTTP 상태 코드와 추가 HTTP 응답 헤더를 전달할 수 있습니다.

```
return to_route('users.show', ['user' => 1], 302, ['X-Framework' => 'Laravel']);
```

<a name="method-url"></a>
#### `url()`

`url` 함수는 지정한 경로에 대해 전체 URL을 생성합니다.

```
$url = url('user/profile');

$url = url('user/profile', [1]);
```

만약 경로를 지정하지 않으면, `Illuminate\Routing\UrlGenerator` 인스턴스를 반환합니다.

```
$current = url()->current();

$full = url()->full();

$previous = url()->previous();
```

<a name="miscellaneous"></a>
## 기타

<a name="method-abort"></a>
#### `abort()`

`abort` 함수는 [HTTP 예외](/docs/9.x/errors#http-exceptions)를 발생시켜 [예외 핸들러](/docs/9.x/errors#the-exception-handler)가 해당 예외를 처리하도록 합니다.

```
abort(403);
```

예외 메시지와 원하는 HTTP 응답 헤더를 추가로 지정할 수도 있습니다.

```
abort(403, 'Unauthorized.', $headers);
```

<a name="method-abort-if"></a>
#### `abort_if()`

`abort_if` 함수는 주어진 불리언 표현식이 `true`로 평가될 경우 HTTP 예외를 발생시킵니다.

```
abort_if(! Auth::user()->isAdmin(), 403);
```

`abort` 함수처럼, 세 번째 인자로 예외 메시지를, 네 번째 인자로 사용자 정의 응답 헤더 배열을 전달할 수 있습니다.

<a name="method-abort-unless"></a>
#### `abort_unless()`

`abort_unless` 함수는 주어진 불리언 표현식이 `false`로 평가될 경우 HTTP 예외를 발생시킵니다.

```
abort_unless(Auth::user()->isAdmin(), 403);
```

`abort` 함수처럼, 세 번째 인자로 예외 메시지를, 네 번째 인자로 사용자 정의 응답 헤더 배열을 전달할 수 있습니다.

<a name="method-app"></a>
#### `app()`

`app` 함수는 [서비스 컨테이너](/docs/9.x/container) 인스턴스를 반환합니다.

```
$container = app();
```

클래스나 인터페이스 이름을 전달하면 컨테이너에서 해당 객체를 해결할 수 있습니다.

```
$api = app('HelpSpot\API');
```

<a name="method-auth"></a>
#### `auth()`

`auth` 함수는 [인증기](/docs/9.x/authentication) 인스턴스를 반환합니다. `Auth` 파사드 대신 사용할 수 있습니다.

```
$user = auth()->user();
```

필요하다면, 접근하고 싶은 가드 인스턴스를 지정할 수도 있습니다.

```
$user = auth('admin')->user();
```

<a name="method-back"></a>

#### `back()`

`back` 함수는 사용자를 [이전 위치](/docs/9.x/responses#redirects)로 리디렉션하는 HTTP 응답을 생성합니다.

```
return back($status = 302, $headers = [], $fallback = '/');

return back();
```

<a name="method-bcrypt"></a>
#### `bcrypt()`

`bcrypt` 함수는 주어진 값을 Bcrypt를 사용하여 [해시](/docs/9.x/hashing)합니다. 이 함수는 `Hash` 파사드의 대체로 사용할 수 있습니다.

```
$password = bcrypt('my-secret-password');
```

<a name="method-blank"></a>
#### `blank()`

`blank` 함수는 전달된 값이 "비어있는(blank)" 값인지 판별합니다.

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

`blank`의 반대 동작에는 [`filled`](#method-filled) 메서드를 참고하세요.

<a name="method-broadcast"></a>
#### `broadcast()`

`broadcast` 함수는 주어진 [이벤트](/docs/9.x/events)를 해당 리스너들에게 [브로드캐스트](/docs/9.x/broadcasting)합니다.

```
broadcast(new UserRegistered($user));

broadcast(new UserRegistered($user))->toOthers();
```

<a name="method-cache"></a>
#### `cache()`

`cache` 함수는 [캐시](/docs/9.x/cache)에서 값을 가져오는 데 사용할 수 있습니다. 주어진 키가 캐시에 존재하지 않으면, 선택적으로 기본값(default value)을 반환합니다.

```
$value = cache('key');

$value = cache('key', 'default');
```

함수에 키/값 쌍의 배열을 전달하여 캐시에 아이템을 저장할 수 있습니다. 이때, 캐시된 값이 유효하다고 간주할 시간(초 단위 또는 기간)을 함께 전달해야 합니다.

```
cache(['key' => 'value'], 300);

cache(['key' => 'value'], now()->addSeconds(10));
```

<a name="method-class-uses-recursive"></a>
#### `class_uses_recursive()`

`class_uses_recursive` 함수는 해당 클래스 및 해당 클래스의 모든 부모 클래스에서 사용된 모든 trait를 반환합니다.

```
$traits = class_uses_recursive(App\Models\User::class);
```

<a name="method-collect"></a>
#### `collect()`

`collect` 함수는 전달된 값을 바탕으로 [컬렉션](/docs/9.x/collections) 인스턴스를 생성합니다.

```
$collection = collect(['taylor', 'abigail']);
```

<a name="method-config"></a>
#### `config()`

`config` 함수는 [설정 값](/docs/9.x/configuration)을 가져옵니다. 설정 값은 '점(dot) 표기법'을 사용해 접근하는데, 이는 파일명과 옵션명을 점으로 이어 붙인 방식입니다. 기본값(default)을 함께 지정할 수 있으며, 설정 옵션이 존재하지 않을 때 반환됩니다.

```
$value = config('app.timezone');

$value = config('app.timezone', $default);
```

실행 중에 키/값 쌍의 배열을 전달하여 설정 값을 지정할 수도 있습니다. 단, 이 함수로 변경한 값은 현재 요청에서만 유효하고 실제 설정 파일에는 반영되지 않습니다.

```
config(['app.debug' => true]);
```

<a name="method-cookie"></a>
#### `cookie()`

`cookie` 함수는 새로운 [쿠키](/docs/9.x/requests#cookies) 인스턴스를 생성합니다.

```
$cookie = cookie('name', 'value', $minutes);
```

<a name="method-csrf-field"></a>
#### `csrf_field()`

`csrf_field` 함수는 CSRF 토큰 값을 담고 있는 HTML `hidden` 입력 필드를 생성합니다. 예를 들어, [Blade 문법](/docs/9.x/blade)에서 다음과 같이 사용합니다.

```
{{ csrf_field() }}
```

<a name="method-csrf-token"></a>
#### `csrf_token()`

`csrf_token` 함수는 현재 요청의 CSRF 토큰 값을 반환합니다.

```
$token = csrf_token();
```

<a name="method-decrypt"></a>
#### `decrypt()`

`decrypt` 함수는 주어진 값을 [복호화](/docs/9.x/encryption)합니다. 이 함수는 `Crypt` 파사드의 대체로 사용할 수 있습니다.

```
$password = decrypt($value);
```

<a name="method-dd"></a>
#### `dd()`

`dd` 함수는 전달된 변수를 출력(dump)하고 스크립트 실행을 종료합니다.

```
dd($value);

dd($value1, $value2, $value3, ...);
```

스크립트 실행을 중단하고 싶지 않다면 [`dump`](#method-dump) 함수를 대신 사용하세요.

<a name="method-dispatch"></a>
#### `dispatch()`

`dispatch` 함수는 주어진 [작업(job)](/docs/9.x/queues#creating-jobs)을 라라벨의 [작업 큐(job queue)](/docs/9.x/queues)에 넣습니다.

```
dispatch(new App\Jobs\SendEmails);
```

<a name="method-dump"></a>
#### `dump()`

`dump` 함수는 전달된 변수를 출력(dump)합니다.

```
dump($value);

dump($value1, $value2, $value3, ...);
```

변수 출력 후 스크립트 실행을 중단하려면 [`dd`](#method-dd) 함수를 사용하세요.

<a name="method-encrypt"></a>
#### `encrypt()`

`encrypt` 함수는 주어진 값을 [암호화](/docs/9.x/encryption)합니다. 이 함수는 `Crypt` 파사드의 대체로도 사용할 수 있습니다.

```
$secret = encrypt('my-secret-value');
```

<a name="method-env"></a>
#### `env()`

`env` 함수는 주어진 [환경 변수](/docs/9.x/configuration#environment-configuration)의 값을 가져오거나, 지정한 기본값을 반환합니다.

```
$env = env('APP_ENV');

$env = env('APP_ENV', 'production');
```

> [!WARNING]
> 배포 과정에서 `config:cache` 명령어를 실행했다면, `env` 함수는 반드시 구성 파일 내에서만 사용해야 합니다. 구성 정보가 캐시된 이후에는 `.env` 파일이 로드되지 않으며, 모든 `env` 함수 호출은 `null`을 반환하게 됩니다.

<a name="method-event"></a>
#### `event()`

`event` 함수는 주어진 [이벤트](/docs/9.x/events)를 해당 리스너들에게 디스패치합니다.

```
event(new UserRegistered($user));
```

<a name="method-fake"></a>
#### `fake()`

`fake` 함수는 컨테이너에서 [Faker](https://github.com/FakerPHP/Faker) 싱글턴을 resolve(해결)합니다. 이 함수는 모델 팩토리, 데이터베이스 시딩, 테스트, 프로토타입 뷰를 작성할 때 더미 데이터를 생성하는 데 유용합니다.

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

기본적으로 `fake` 함수는 `config/app.php` 파일의 `app.faker_locale` 설정 값을 사용합니다. 하지만, 필요에 따라 특정 로케일을 함수에 전달하여 사용할 수도 있습니다. 서로 다른 로케일마다 별도의 싱글턴 인스턴스가 반환됩니다.

```
fake('nl_NL')->name()
```

<a name="method-filled"></a>
#### `filled()`

`filled` 함수는 전달된 값이 "비어있지 않은지" 판별합니다.

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

`filled`의 반대 동작은 [`blank`](#method-blank) 메서드를 참고하세요.

<a name="method-info"></a>
#### `info()`

`info` 함수는 애플리케이션의 [로그](/docs/9.x/logging)에 정보를 기록합니다.

```
info('Some helpful information!');
```

이 함수에 추가적인 컨텍스트 데이터 배열을 전달할 수도 있습니다.

```
info('User login attempt failed.', ['id' => $user->id]);
```

<a name="method-logger"></a>
#### `logger()`

`logger` 함수는 `debug` 레벨의 메시지를 [로그](/docs/9.x/logging)에 쓸 때 사용할 수 있습니다.

```
logger('Debug message');
```

컨텍스트 데이터 배열 역시 함께 전달할 수 있습니다.

```
logger('User has logged in.', ['id' => $user->id]);
```

함수에 인수를 전달하지 않으면 [로거 인스턴스](/docs/9.x/errors#logging)가 반환됩니다.

```
logger()->error('You are not allowed here.');
```

<a name="method-method-field"></a>
#### `method_field()`

`method_field` 함수는 폼의 HTTP 메서드 값을 위조한(spoofed) 내용을 담는 HTML `hidden` 입력 필드를 생성합니다. 예를 들어 [Blade 문법](/docs/9.x/blade)에서 아래와 같이 사용할 수 있습니다.

```
<form method="POST">
    {{ method_field('DELETE') }}
</form>
```

<a name="method-now"></a>
#### `now()`

`now` 함수는 현재 시점의 `Illuminate\Support\Carbon` 인스턴스를 생성합니다.

```
$now = now();
```

<a name="method-old"></a>
#### `old()`

`old` 함수는 세션에 플래시된 [이전 입력값](/docs/9.x/requests#old-input)을 [가져옵니다](/docs/9.x/requests#retrieving-input).

```
$value = old('value');

$value = old('value', 'default');
```

`old` 함수에 두 번째 인수로 Eloquent 모델의 속성이 자주 사용되기 때문에, 라라벨에서는 전체 Eloquent 모델을 두 번째 인수로 바로 전달할 수 있게 지원합니다. 이 경우, `old` 함수의 첫 번째 인수는 기본값으로 사용할 Eloquent 속성명을 의미합니다.

```
{{ old('name', $user->name) }}

// 다음과 같습니다...

{{ old('name', $user) }}
```

<a name="method-optional"></a>
#### `optional()`

`optional` 함수는 어떤 인수든 받아 그 객체의 속성이나 메서드에 접근하게 해줍니다. 만약 전달한 객체가 `null`인 경우, 속성이나 메서드를 호출해도 에러가 발생하지 않고 대신 `null`이 반환됩니다.

```
return optional($user->address)->street;

{!! old('name', optional($user)->name) !!}
```

`optional` 함수는 두 번째 인수로 클로저를 받을 수도 있습니다. 첫 번째 인수 값이 null이 아닐 때 클로저가 실행됩니다.

```
return optional(User::find($id), function ($user) {
    return $user->name;
});
```

<a name="method-policy"></a>
#### `policy()`

`policy` 함수는 주어진 클래스에 대한 [정책(Policy)](/docs/9.x/authorization#creating-policies) 인스턴스를 반환합니다.

```
$policy = policy(App\Models\User::class);
```

<a name="method-redirect"></a>
#### `redirect()`

`redirect` 함수는 [리디렉션 HTTP 응답](/docs/9.x/responses#redirects)을 반환하거나, 인수를 전달하지 않으면 Redirector 인스턴스를 반환합니다.

```
return redirect($to = null, $status = 302, $headers = [], $https = null);

return redirect('/home');

return redirect()->route('route.name');
```

<a name="method-report"></a>
#### `report()`

`report` 함수는 [예외 핸들러](/docs/9.x/errors#the-exception-handler)를 사용해 예외를 보고합니다.

```
report($e);
```

또한, 이 함수에 문자열을 전달하면 해당 문자열을 메시지로 가진 예외를 생성해 보고합니다.

```
report('Something went wrong.');
```

<a name="method-report-if"></a>
#### `report_if()`

`report_if` 함수는 지정된 조건이 `true`일 때 [예외 핸들러](/docs/9.x/errors#the-exception-handler)를 사용해 예외를 보고합니다.

```
report_if($shouldReport, $e);

report_if($shouldReport, 'Something went wrong.');
```

<a name="method-report-unless"></a>
#### `report_unless()`

`report_unless` 함수는 지정된 조건이 `false`일 때 [예외 핸들러](/docs/9.x/errors#the-exception-handler)를 사용해 예외를 보고합니다.

```
report_unless($reportingDisabled, $e);

report_unless($reportingDisabled, 'Something went wrong.');
```

<a name="method-request"></a>
#### `request()`

`request` 함수는 현재 [요청 객체](/docs/9.x/requests) 인스턴스를 반환하거나, 현재 요청에서 특정 입력 필드의 값을 가져옵니다.

```
$request = request();

$value = request('key', $default);
```

<a name="method-rescue"></a>
#### `rescue()`

`rescue` 함수는 주어진 클로저를 실행하면서 발생할 수 있는 모든 예외를 잡아냅니다. 잡힌 모든 예외는 [예외 핸들러](/docs/9.x/errors#the-exception-handler)로 전달되지만, 요청은 계속 처리됩니다.

```
return rescue(function () {
    return $this->method();
});
```

`rescue` 함수에 두 번째 인수를 전달하면, 클로저 실행 중 예외가 발생할 때 반환할 "기본값"이 됩니다.

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

`resolve` 함수는 주어진 클래스나 인터페이스 이름을 [서비스 컨테이너](/docs/9.x/container)를 통해 인스턴스로 해결합니다.

```
$api = resolve('HelpSpot\API');
```

<a name="method-response"></a>
#### `response()`

`response` 함수는 [응답(response)](/docs/9.x/responses) 인스턴스를 생성하거나, 응답 팩토리 인스턴스를 반환합니다.

```
return response('Hello World', 200, $headers);

return response()->json(['foo' => 'bar'], 200, $headers);
```

<a name="method-retry"></a>
#### `retry()`

`retry` 함수는 지정된 최대 시도 횟수에 도달할 때까지 콜백을 실행하려 시도합니다. 콜백이 예외를 던지지 않으면 해당 반환값이 반환됩니다. 콜백 실행 중 예외가 발생하면 자동으로 재시도하게 되며, 최대 시도를 초과하면 예외가 다시 던져집니다.

```
return retry(5, function () {
    // 5번까지 시도하며, 각 시도 사이에 100ms 대기...
}, 100);
```

시도 사이 대기 시간을 직접 계산하고 싶다면, `retry` 함수의 세 번째 인수로 클로저를 전달할 수 있습니다.

```
return retry(5, function () {
    // ...
}, function ($attempt, $exception) {
    return $attempt * 100;
});
```

편의상, 첫 번째 인수로 배열을 전달할 수도 있습니다. 이 배열 값이 연속된 시도들 사이의 대기 시간(밀리초 단위)로 사용됩니다.

```
return retry([100, 200], function () {
    // 첫 번째 재시도시 100ms, 두 번째 재시도시 200ms 대기...
});
```

특정 조건에서만 재시도하도록 하려면, `retry` 함수의 네 번째 인수로 클로저를 사용할 수 있습니다.

```
return retry(5, function () {
    // ...
}, 100, function ($exception) {
    return $exception instanceof RetryException;
});
```

<a name="method-session"></a>
#### `session()`

`session` 함수는 [세션](/docs/9.x/session) 값을 가져오거나 설정하는 데 사용할 수 있습니다.

```
$value = session('key');
```

키/값 쌍의 배열을 전달하여 세션 값을 설정할 수도 있습니다.

```
session(['chairs' => 7, 'instruments' => 3]);
```

인수를 전달하지 않으면 세션 스토어 인스턴스가 반환됩니다.

```
$value = session()->get('key');

session()->put('key', $value);
```

<a name="method-tap"></a>
#### `tap()`

`tap` 함수는 두 개의 인수를 받습니다: 임의의 `$value`와 클로저입니다. 전달한 `$value`가 클로저에 전달되고, 함수 실행 후 다시 `$value`가 반환됩니다. 이때 클로저의 반환값은 무시됩니다.

```
$user = tap(User::first(), function ($user) {
    $user->name = 'taylor';

    $user->save();
});
```

만약 클로저를 전달하지 않으면, `$value`에 대해 어떤 메서드든 호출할 수 있습니다. 이때 해당 메서드의 실제 반환값과 무관하게 항상 `$value`가 반환됩니다. 예를 들어, Eloquent의 `update` 메서드는 통상적으로 정수를 반환하지만, `tap`으로 메서드 호출을 체이닝하면 모델 인스턴스 그 자체를 얻을 수 있습니다.

```
$user = tap($user)->update([
    'name' => $name,
    'email' => $email,
]);
```

클래스에 `tap` 메서드를 추가하고 싶다면, `Illuminate\Support\Traits\Tappable` 트레이트를 클래스에 추가하세요. 이 트레이트의 `tap` 메서드는 클로저를 인수로 받고, 인스턴스 자신을 클로저로 전달한 뒤 다시 반환합니다.

```
return $user->tap(function ($user) {
    //
});
```

<a name="method-throw-if"></a>
#### `throw_if()`

`throw_if` 함수는 주어진 불리언 조건이 `true`일 때 지정한 예외를 던집니다.

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

`throw_unless` 함수는 주어진 불린(boolean) 표현식의 값이 `false`일 경우, 지정한 예외를 발생시킵니다.

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

`today` 함수는 현재 날짜에 해당하는 새로운 `Illuminate\Support\Carbon` 인스턴스를 생성합니다.

```
$today = today();
```

<a name="method-trait-uses-recursive"></a>
#### `trait_uses_recursive()`

`trait_uses_recursive` 함수는 특정 트레이트(trait)가 사용하는 모든 트레이트의 목록을 반환합니다.

```
$traits = trait_uses_recursive(\Illuminate\Notifications\Notifiable::class);
```

<a name="method-transform"></a>
#### `transform()`

`transform` 함수는 주어진 값이 [blank](#method-blank)가 아니면 전달받은 클로저(익명 함수)를 실행하고, 그 결과값을 반환합니다.

```
$callback = function ($value) {
    return $value * 2;
};

$result = transform(5, $callback);

// 10
```

값이 blank인 경우 반환할 기본값(또는 클로저)을 세 번째 인자로 전달할 수 있습니다. 이 값은 주어진 값이 blank일 경우 반환됩니다.

```
$result = transform(null, $callback, 'The value is blank');

// The value is blank
```

<a name="method-validator"></a>
#### `validator()`

`validator` 함수는 전달받은 인수로 새로운 [validator](/docs/9.x/validation) 인스턴스를 생성합니다. 이 함수를 `Validator` 파사드의 대체로 사용할 수 있습니다.

```
$validator = validator($data, $rules, $messages);
```

<a name="method-value"></a>
#### `value()`

`value` 함수는 전달한 값을 그대로 반환합니다. 단, 만약 클로저를 전달하면 해당 클로저를 실행한 뒤 반환값을 반환합니다.

```
$result = value(true);

// true

$result = value(function () {
    return false;
});

// false

```
추가적인 인수를 `value` 함수에 넘길 수도 있습니다. 만약 첫 번째 인수가 클로저라면, 나머지 인수들은 클로저에 인자로 전달됩니다. 클로저가 아니면 추가 인수들은 무시됩니다.

```
$result = value(function ($name) {
    return $parameter;
}, 'Taylor');

// 'Taylor'
```

<a name="method-view"></a>
#### `view()`

`view` 함수는 [view](/docs/9.x/views) 인스턴스를 반환합니다.

```
return view('auth.login');
```

<a name="method-with"></a>
#### `with()`

`with` 함수는 전달받은 값을 그대로 반환합니다. 그러나 두 번째 인자로 클로저를 전달하면, 이 클로저가 실행되고 그 반환값이 반환됩니다.

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

<a name="other-utilities"></a>
## 기타 유틸리티

<a name="benchmarking"></a>
### 벤치마킹(Benchmarking)

어떤 코드의 성능(소요 시간 등)을 빠르게 테스트하고 싶을 때가 있습니다. 이럴 때는 `Benchmark` 지원 클래스를 사용하여 지정한 콜백이 완료되는 데 걸린 시간을 밀리초 단위로 측정할 수 있습니다.

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

기본적으로 전달한 콜백은 한 번(한 번의 반복)만 실행되며, 실행에 소요된 시간이 브라우저나 콘솔에 표시됩니다.

콜백을 여러 번 반복 실행하고 싶다면, 메서드의 두 번째 인수로 반복 횟수를 지정할 수 있습니다. 콜백을 여러 번 실행할 경우, `Benchmark` 클래스는 전체 반복에서 평균 실행 소요 시간을 반환합니다.

```
Benchmark::dd(fn () => User::count(), iterations: 10); // 0.5 ms
```

<a name="lottery"></a>
### Lottery(확률 기반 실행)

Laravel의 lottery 클래스는 주어진 확률(odds)에 따라 콜백을 실행할 수 있도록 해줍니다. 예를 들어, 들어오는 요청 중 일부에서만 특정 코드를 실행하려고 할 때 유용하게 사용할 수 있습니다.

```
use Illuminate\Support\Lottery;

Lottery::odds(1, 20)
    ->winner(fn () => $user->won())
    ->loser(fn () => $user->lost())
    ->choose();
```

Laravel의 lottery 클래스를 다른 라라벨 기능들과 함께 사용할 수도 있습니다. 예를 들어, 느린 쿼리 중 소수만 예외 핸들러에 보고하고 싶을 수 있습니다. 그리고 lottery 클래스는 호출 가능한(callable) 객체이므로, 콜러블을 인수로 받을 수 있는 어떤 메서드에도 전달할 수 있습니다.

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

라라벨은 애플리케이션의 lottery 호출을 손쉽게 테스트할 수 있도록 간단한 메서드들도 제공합니다.

```
// Lottery가 항상 이기도록 설정...
Lottery::alwaysWin();

// Lottery가 항상 지도록 설정...
Lottery::alwaysLose();

// Lottery가 처음엔 이기고, 다음엔 지고, 그 후엔 원래 동작으로 돌아감...
Lottery::fix([true, false]);

// Lottery가 원래 동작으로 복원됨...
Lottery::determineResultsNormally();
```