# 컬렉션 (Collections)

- [소개](#introduction)
    - [컬렉션 생성](#creating-collections)
    - [컬렉션 확장](#extending-collections)
- [사용 가능한 메서드](#available-methods)
- [고차 메시지(Higher Order Messages)](#higher-order-messages)
- [지연 컬렉션(Lazy Collections)](#lazy-collections)
    - [소개](#lazy-collection-introduction)
    - [지연 컬렉션 생성](#creating-lazy-collections)
    - [Enumerable 계약](#the-enumerable-contract)
    - [지연 컬렉션 메서드](#lazy-collection-methods)

<a name="introduction"></a>
## 소개

`Illuminate\Support\Collection` 클래스는 데이터 배열을 다룰 때 유연하면서도 편리하게 사용할 수 있는 래퍼를 제공합니다. 예를 들어, 아래의 코드를 살펴보면 `collect` 헬퍼를 통해 배열로부터 새로운 컬렉션 인스턴스를 생성하고, 각 요소에 `strtoupper` 함수를 적용한 뒤, 비어있는 요소들을 모두 제거하고 있습니다.

```php
$collection = collect(['taylor', 'abigail', null])->map(function (?string $name) {
    return strtoupper($name);
})->reject(function (string $name) {
    return empty($name);
});
```

보시는 것처럼 `Collection` 클래스는 메서드들을 체이닝하여 배열을 유연하게 변환(map)하고, 축소(reduce)할 수 있도록 해줍니다. 일반적으로 컬렉션은 불변(immutable) 방식으로 동작하므로, 모든 `Collection`의 메서드는 완전히 새로운 `Collection` 인스턴스를 반환합니다.

<a name="creating-collections"></a>
### 컬렉션 생성

앞서 언급했듯이, `collect` 헬퍼는 주어진 배열을 기반으로 새로운 `Illuminate\Support\Collection` 인스턴스를 반환합니다. 따라서 컬렉션을 만드는 것은 아래처럼 간단합니다.

```php
$collection = collect([1, 2, 3]);
```

또한 [make](#method-make) 또는 [fromJson](#method-fromjson) 메서드를 이용해 컬렉션을 생성할 수도 있습니다.

> [!NOTE]
> [Eloquent](/docs/eloquent) 쿼리의 반환 결과는 항상 `Collection` 인스턴스로 제공됩니다.

<a name="extending-collections"></a>
### 컬렉션 확장

컬렉션은 "매크로(macro) 가능"하므로, 실행 중에 `Collection` 클래스에 추가 메서드를 동적으로 등록할 수 있습니다. `Illuminate\Support\Collection` 클래스의 `macro` 메서드는 클로저를 인자로 받아, 해당 매크로 호출 시 실행됩니다. 매크로 클로저 내에서는 `$this`를 통해 컬렉션의 다른 메서드들을 실제 컬렉션 메서드처럼 활용할 수 있습니다. 예를 들어, 아래 코드는 `Collection` 클래스에 `toUpper`라는 메서드를 추가합니다.

```php
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

Collection::macro('toUpper', function () {
    return $this->map(function (string $value) {
        return Str::upper($value);
    });
});

$collection = collect(['first', 'second']);

$upper = $collection->toUpper();

// ['FIRST', 'SECOND']
```

일반적으로 컬렉션 매크로는 [서비스 프로바이더](/docs/providers)의 `boot` 메서드에서 선언하는 것이 좋습니다.

<a name="macro-arguments"></a>
#### 매크로 인수

필요하다면 매크로에 추가 인수를 받을 수 있도록 정의할 수도 있습니다.

```php
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Lang;

Collection::macro('toLocale', function (string $locale) {
    return $this->map(function (string $value) use ($locale) {
        return Lang::get($value, [], $locale);
    });
});

$collection = collect(['first', 'second']);

$translated = $collection->toLocale('es');
```

<a name="available-methods"></a>
## 사용 가능한 메서드

이후의 컬렉션 문서에서는 `Collection` 클래스에서 사용할 수 있는 각 메서드에 대해 다룹니다. 이 모든 메서드는 원본 배열을 유연하게 조작할 수 있도록 메서드 체이닝이 가능하다는 점을 기억하시기 바랍니다. 또한 대부분의 메서드는 새로운 `Collection` 인스턴스를 반환하므로, 필요하다면 컬렉션의 원본 상태를 안전하게 보관할 수 있습니다.

<div class="collection-method-list" markdown="1">

[after](#method-after)
[all](#method-all)
[average](#method-average)
[avg](#method-avg)
[before](#method-before)
[chunk](#method-chunk)
[chunkWhile](#method-chunkwhile)
[collapse](#method-collapse)
[collapseWithKeys](#method-collapsewithkeys)
[collect](#method-collect)
[combine](#method-combine)
[concat](#method-concat)
[contains](#method-contains)
[containsOneItem](#method-containsoneitem)
[containsStrict](#method-containsstrict)
[count](#method-count)
[countBy](#method-countBy)
[crossJoin](#method-crossjoin)
[dd](#method-dd)
[diff](#method-diff)
[diffAssoc](#method-diffassoc)
[diffAssocUsing](#method-diffassocusing)
[diffKeys](#method-diffkeys)
[doesntContain](#method-doesntcontain)
[dot](#method-dot)
[dump](#method-dump)
[duplicates](#method-duplicates)
[duplicatesStrict](#method-duplicatesstrict)
[each](#method-each)
[eachSpread](#method-eachspread)
[ensure](#method-ensure)
[every](#method-every)
[except](#method-except)
[filter](#method-filter)
[first](#method-first)
[firstOrFail](#method-first-or-fail)
[firstWhere](#method-first-where)
[flatMap](#method-flatmap)
[flatten](#method-flatten)
[flip](#method-flip)
[forget](#method-forget)
[forPage](#method-forpage)
[fromJson](#method-fromjson)
[get](#method-get)
[groupBy](#method-groupby)
[has](#method-has)
[hasAny](#method-hasany)
[implode](#method-implode)
[intersect](#method-intersect)
[intersectUsing](#method-intersectusing)
[intersectAssoc](#method-intersectAssoc)
[intersectAssocUsing](#method-intersectassocusing)
[intersectByKeys](#method-intersectbykeys)
[isEmpty](#method-isempty)
[isNotEmpty](#method-isnotempty)
[join](#method-join)
[keyBy](#method-keyby)
[keys](#method-keys)
[last](#method-last)
[lazy](#method-lazy)
[macro](#method-macro)
[make](#method-make)
[map](#method-map)
[mapInto](#method-mapinto)
[mapSpread](#method-mapspread)
[mapToGroups](#method-maptogroups)
[mapWithKeys](#method-mapwithkeys)
[max](#method-max)
[median](#method-median)
[merge](#method-merge)
[mergeRecursive](#method-mergerecursive)
[min](#method-min)
[mode](#method-mode)
[multiply](#method-multiply)
[nth](#method-nth)
[only](#method-only)
[pad](#method-pad)
[partition](#method-partition)
[percentage](#method-percentage)
[pipe](#method-pipe)
[pipeInto](#method-pipeinto)
[pipeThrough](#method-pipethrough)
[pluck](#method-pluck)
[pop](#method-pop)
[prepend](#method-prepend)
[pull](#method-pull)
[push](#method-push)
[put](#method-put)
[random](#method-random)
[range](#method-range)
[reduce](#method-reduce)
[reduceSpread](#method-reduce-spread)
[reject](#method-reject)
[replace](#method-replace)
[replaceRecursive](#method-replacerecursive)
[reverse](#method-reverse)
[search](#method-search)
[select](#method-select)
[shift](#method-shift)
[shuffle](#method-shuffle)
[skip](#method-skip)
[skipUntil](#method-skipuntil)
[skipWhile](#method-skipwhile)
[slice](#method-slice)
[sliding](#method-sliding)
[sole](#method-sole)
[some](#method-some)
[sort](#method-sort)
[sortBy](#method-sortby)
[sortByDesc](#method-sortbydesc)
[sortDesc](#method-sortdesc)
[sortKeys](#method-sortkeys)
[sortKeysDesc](#method-sortkeysdesc)
[sortKeysUsing](#method-sortkeysusing)
[splice](#method-splice)
[split](#method-split)
[splitIn](#method-splitin)
[sum](#method-sum)
[take](#method-take)
[takeUntil](#method-takeuntil)
[takeWhile](#method-takewhile)
[tap](#method-tap)
[times](#method-times)
[toArray](#method-toarray)
[toJson](#method-tojson)
[transform](#method-transform)
[undot](#method-undot)
[union](#method-union)
[unique](#method-unique)
[uniqueStrict](#method-uniquestrict)
[unless](#method-unless)
[unlessEmpty](#method-unlessempty)
[unlessNotEmpty](#method-unlessnotempty)
[unwrap](#method-unwrap)
[value](#method-value)
[values](#method-values)
[when](#method-when)
[whenEmpty](#method-whenempty)
[whenNotEmpty](#method-whennotempty)
[where](#method-where)
[whereStrict](#method-wherestrict)
[whereBetween](#method-wherebetween)
[whereIn](#method-wherein)
[whereInStrict](#method-whereinstrict)
[whereInstanceOf](#method-whereinstanceof)
[whereNotBetween](#method-wherenotbetween)
[whereNotIn](#method-wherenotin)
[whereNotInStrict](#method-wherenotinstrict)
[whereNotNull](#method-wherenotnull)
[whereNull](#method-wherenull)
[wrap](#method-wrap)
[zip](#method-zip)

</div>

<a name="method-listing"></a>
## 메서드 목록



<a name="method-after"></a>
#### `after()`

`after` 메서드는 지정한 값 바로 다음에 위치한 요소를 반환합니다. 만약 지정한 값이 없거나 컬렉션의 마지막 요소라면 `null`을 반환합니다.

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->after(3);

// 4

$collection->after(5);

// null
```

이 메서드는 지정한 값의 위치를 찾을 때 "느슨한(loose)" 비교를 사용합니다. 즉, 문자열로 된 정수가 실제 정수와 같은 값일 경우 동일하게 취급합니다. "엄격한(strict)" 비교를 원한다면 `strict` 인수를 메서드에 전달할 수 있습니다.

```php
collect([2, 4, 6, 8])->after('4', strict: true);

// null
```

또한, 콜백을 직접 전달해서 조건을 만족하는 첫 번째 요소 다음 값을 가져올 수도 있습니다.

```php
collect([2, 4, 6, 8])->after(function (int $item, int $key) {
    return $item > 5;
});

// 8
```

<a name="method-all"></a>
#### `all()`

`all` 메서드는 컬렉션이 표현하는 내부 배열 전체를 반환합니다.

```php
collect([1, 2, 3])->all();

// [1, 2, 3]
```

<a name="method-average"></a>
#### `average()`

[avg](#method-avg) 메서드의 별칭입니다.

<a name="method-avg"></a>
#### `avg()`

`avg` 메서드는 주어진 키의 [평균값](https://en.wikipedia.org/wiki/Average)을 반환합니다.

```php
$average = collect([
    ['foo' => 10],
    ['foo' => 10],
    ['foo' => 20],
    ['foo' => 40]
])->avg('foo');

// 20

$average = collect([1, 1, 2, 4])->avg();

// 2
```

<a name="method-before"></a>
#### `before()`

`before` 메서드는 [after](#method-after) 메서드와 반대로, 지정한 값 바로 "이전" 요소를 반환합니다. 값이 존재하지 않거나 컬렉션의 첫 요소라면 `null`을 반환합니다.

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->before(3);

// 2

$collection->before(1);

// null

collect([2, 4, 6, 8])->before('4', strict: true);

// null

collect([2, 4, 6, 8])->before(function (int $item, int $key) {
    return $item > 5;
});

// 4
```

<a name="method-chunk"></a>
#### `chunk()`

`chunk` 메서드는 컬렉션을 지정한 크기의 여러 하위 컬렉션으로 분할합니다.

```php
$collection = collect([1, 2, 3, 4, 5, 6, 7]);

$chunks = $collection->chunk(4);

$chunks->all();

// [[1, 2, 3, 4], [5, 6, 7]]
```

이 메서드는 [뷰](/docs/views)에서 [Bootstrap](https://getbootstrap.com/docs/5.3/layout/grid/)과 같은 그리드 시스템을 사용할 때 특히 유용합니다. 예를 들어, 여러 [Eloquent](/docs/eloquent) 모델을 그리드 형태로 출력하려는 상황을 생각해 보세요.

```blade
@foreach ($products->chunk(3) as $chunk)
    <div class="row">
        @foreach ($chunk as $product)
            <div class="col-xs-4">{{ $product->name }}</div>
        @endforeach
    </div>
@endforeach
```

<a name="method-chunkwhile"></a>
#### `chunkWhile()`

`chunkWhile` 메서드는 지정한 콜백의 평가 결과를 기준으로 컬렉션을 여러 하위 컬렉션으로 분리합니다. 클로저에 전달되는 `$chunk` 변수를 통해 이전 요소의 값을 확인할 수 있습니다.

```php
$collection = collect(str_split('AABBCCCD'));

$chunks = $collection->chunkWhile(function (string $value, int $key, Collection $chunk) {
    return $value === $chunk->last();
});

$chunks->all();

// [['A', 'A'], ['B', 'B'], ['C', 'C', 'C'], ['D']]
```

<a name="method-collapse"></a>
#### `collapse()`

`collapse` 메서드는 배열이나 컬렉션의 컬렉션을 단일, 평평한(flat) 컬렉션으로 합쳐줍니다.

```php
$collection = collect([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
]);

$collapsed = $collection->collapse();

$collapsed->all();

// [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

<a name="method-collapsewithkeys"></a>
#### `collapseWithKeys()`

`collapseWithKeys` 메서드는 여러 배열 또는 컬렉션을 하나의 컬렉션으로 평탄화(flatten)하면서, 원래의 키를 그대로 유지해줍니다.

```php
$collection = collect([
    ['first'  => collect([1, 2, 3])],
    ['second' => [4, 5, 6]],
    ['third'  => collect([7, 8, 9])]
]);

$collapsed = $collection->collapseWithKeys();

$collapsed->all();

// [
//     'first'  => [1, 2, 3],
//     'second' => [4, 5, 6],
//     'third'  => [7, 8, 9],
// ]
```

<a name="method-collect"></a>
#### `collect()`

`collect` 메서드는 현재 컬렉션에 들어있는 항목으로 새로운 `Collection` 인스턴스를 반환합니다.

```php
$collectionA = collect([1, 2, 3]);

$collectionB = $collectionA->collect();

$collectionB->all();

// [1, 2, 3]
```

이 메서드는 [지연 컬렉션](#lazy-collections)을 일반적인 `Collection` 인스턴스로 변환할 때 특히 유용합니다.

```php
$lazyCollection = LazyCollection::make(function () {
    yield 1;
    yield 2;
    yield 3;
});

$collection = $lazyCollection->collect();

$collection::class;

// 'Illuminate\Support\Collection'

$collection->all();

// [1, 2, 3]
```

> [!NOTE]
> `collect` 메서드는 `Enumerable` 인스턴스를 다루면서 일반(비-지연) 컬렉션 인스턴스가 필요할 때 유용하게 사용할 수 있습니다. `collect()`는 `Enumerable` 계약의 일부이기 때문에, 안전하게 `Collection` 인스턴스 획득 용도로 사용할 수 있습니다.

<a name="method-combine"></a>
#### `combine()`

`combine` 메서드는 컬렉션의 값들을 키로, 다른 배열이나 컬렉션의 값을 값(value)으로 결합합니다.

```php
$collection = collect(['name', 'age']);

$combined = $collection->combine(['George', 29]);

$combined->all();

// ['name' => 'George', 'age' => 29]
```

<a name="method-concat"></a>
#### `concat()`

`concat` 메서드는 전달한 배열이나 컬렉션의 값을, 다른 컬렉션의 끝에 이어붙입니다.

```php
$collection = collect(['John Doe']);

$concatenated = $collection->concat(['Jane Doe'])->concat(['name' => 'Johnny Doe']);

$concatenated->all();

// ['John Doe', 'Jane Doe', 'Johnny Doe']
```

`concat` 메서드는 추가된 항목들의 키를 숫자 인덱스로 다시 매깁니다. 연관 배열의 키를 유지하려면 [merge](#method-merge) 메서드 사용을 고려하세요.

<a name="method-contains"></a>
#### `contains()`

`contains` 메서드는 컬렉션에 해당 항목이 존재하는지 판별합니다. 콜백을 전달하면 조건을 만족하는 항목이 있는지 확인합니다.

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->contains(function (int $value, int $key) {
    return $value > 5;
});

// false
```

또는 단순히 문자열을 전달하여 컬렉션에 해당 값이 있는지 판단할 수도 있습니다.

```php
$collection = collect(['name' => 'Desk', 'price' => 100]);

$collection->contains('Desk');

// true

$collection->contains('New York');

// false
```

키/값 쌍을 인수로 전달하면 해당하는 쌍이 존재하는지 판단할 수 있습니다.

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 100],
]);

$collection->contains('product', 'Bookcase');

// false
```

`contains` 메서드는 값 비교 시 "느슨한(loose)" 비교 방식을 사용합니다. 즉, 정수값을 포함하는 문자열도 같은 정수와 동일하게 인식합니다. "엄격한(strict)" 비교는 [containsStrict](#method-containsstrict) 메서드를 참고하세요.

`contains`의 반대 동작은 [doesntContain](#method-doesntcontain) 메서드를 참고하세요.

<a name="method-containsoneitem"></a>
#### `containsOneItem()`

`containsOneItem` 메서드는 컬렉션에 항목이 단 하나만 존재하는지 여부를 판별합니다.

```php
collect([])->containsOneItem();

// false

collect(['1'])->containsOneItem();

// true

collect(['1', '2'])->containsOneItem();

// false
```

<a name="method-containsstrict"></a>

#### `containsStrict()`

이 메서드는 [contains](#method-contains) 메서드와 같은 시그니처를 가지지만, 모든 값을 "엄격한(strict)" 비교로 판단합니다.

> [!NOTE]
> 이 메서드는 [Eloquent 컬렉션](/docs/eloquent-collections#method-contains)에서 동작 방식이 다르게 동작합니다.

<a name="method-count"></a>
#### `count()`

`count` 메서드는 컬렉션의 전체 아이템 개수를 반환합니다.

```php
$collection = collect([1, 2, 3, 4]);

$collection->count();

// 4
```

<a name="method-countBy"></a>
#### `countBy()`

`countBy` 메서드는 컬렉션에 있는 값들의 출현 횟수를 센 결과를 반환합니다. 기본적으로 컬렉션의 모든 요소를 집계하며, 이를 통해 각 "유형"별로 개수를 세는 기능을 할 수 있습니다.

```php
$collection = collect([1, 2, 2, 2, 3]);

$counted = $collection->countBy();

$counted->all();

// [1 => 1, 2 => 3, 3 => 1]
```

또한, `countBy` 메서드에 클로저를 전달하면 원하는 기준에 따라 개수를 셀 수 있습니다.

```php
$collection = collect(['alice@gmail.com', 'bob@yahoo.com', 'carlos@gmail.com']);

$counted = $collection->countBy(function (string $email) {
    return substr(strrchr($email, '@'), 1);
});

$counted->all();

// ['gmail.com' => 2, 'yahoo.com' => 1]
```

<a name="method-crossjoin"></a>
#### `crossJoin()`

`crossJoin` 메서드는 컬렉션의 값들과 전달한 배열 또는 컬렉션들을 교차 결합(cross join)하여, 가능한 모든 조합(카테시안 곱, Cartesian product)을 반환합니다.

```php
$collection = collect([1, 2]);

$matrix = $collection->crossJoin(['a', 'b']);

$matrix->all();

/*
    [
        [1, 'a'],
        [1, 'b'],
        [2, 'a'],
        [2, 'b'],
    ]
*/

$collection = collect([1, 2]);

$matrix = $collection->crossJoin(['a', 'b'], ['I', 'II']);

$matrix->all();

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

<a name="method-dd"></a>
#### `dd()`

`dd` 메서드는 컬렉션의 아이템들을 출력(dump)하고, 이후 스크립트 실행을 즉시 종료합니다.

```php
$collection = collect(['John Doe', 'Jane Doe']);

$collection->dd();

/*
    Collection {
        #items: array:2 [
            0 => "John Doe"
            1 => "Jane Doe"
        ]
    }
*/
```

스크립트 실행을 중단하지 않고 컬렉션만 출력하고 싶다면, [dump](#method-dump) 메서드를 사용하십시오.

<a name="method-diff"></a>
#### `diff()`

`diff` 메서드는 컬렉션을 다른 컬렉션이나 일반 PHP `array`와 값 기준으로 비교합니다. 이 메서드는 원본 컬렉션에서 지정한 컬렉션에 없는 값들만 반환합니다.

```php
$collection = collect([1, 2, 3, 4, 5]);

$diff = $collection->diff([2, 4, 6, 8]);

$diff->all();

// [1, 3, 5]
```

> [!NOTE]
> 이 메서드는 [Eloquent 컬렉션](/docs/eloquent-collections#method-diff)에서 동작 방식이 다르게 동작합니다.

<a name="method-diffassoc"></a>
#### `diffAssoc()`

`diffAssoc` 메서드는 컬렉션을 다른 컬렉션이나 일반 PHP `array`와 "키와 값"을 모두 기준으로 비교합니다. 이 메서드는 원본 컬렉션에서 전달한 컬렉션에 없는 키/값 쌍만 반환합니다.

```php
$collection = collect([
    'color' => 'orange',
    'type' => 'fruit',
    'remain' => 6,
]);

$diff = $collection->diffAssoc([
    'color' => 'yellow',
    'type' => 'fruit',
    'remain' => 3,
    'used' => 6,
]);

$diff->all();

// ['color' => 'orange', 'remain' => 6]
```

<a name="method-diffassocusing"></a>
#### `diffAssocUsing()`

`diffAssoc`와 달리, `diffAssocUsing`은 인덱스 비교를 사용자가 지정한 콜백 함수로 수행할 수 있습니다.

```php
$collection = collect([
    'color' => 'orange',
    'type' => 'fruit',
    'remain' => 6,
]);

$diff = $collection->diffAssocUsing([
    'Color' => 'yellow',
    'Type' => 'fruit',
    'Remain' => 3,
], 'strnatcasecmp');

$diff->all();

// ['color' => 'orange', 'remain' => 6]
```

콜백 함수는 비교 함수여야 하며, 0보다 작거나, 같거나, 크거나 한 정수를 반환해야 합니다. 자세한 내용은 PHP 공식문서의 [array_diff_uassoc](https://www.php.net/array_diff_uassoc#refsect1-function.array-diff-uassoc-parameters) 관련 자료를 참고하세요. 이 메서드는 내부적으로 해당 PHP 함수를 사용합니다.

<a name="method-diffkeys"></a>
#### `diffKeys()`

`diffKeys` 메서드는 컬렉션을 다른 컬렉션이나 일반 PHP `array`와 "키"만을 기준으로 비교합니다. 이 메서드는 원본 컬렉션에서 전달한 컬렉션에 없는 키/값 쌍만 반환합니다.

```php
$collection = collect([
    'one' => 10,
    'two' => 20,
    'three' => 30,
    'four' => 40,
    'five' => 50,
]);

$diff = $collection->diffKeys([
    'two' => 2,
    'four' => 4,
    'six' => 6,
    'eight' => 8,
]);

$diff->all();

// ['one' => 10, 'three' => 30, 'five' => 50]
```

<a name="method-doesntcontain"></a>
#### `doesntContain()`

`doesntContain` 메서드는 컬렉션에 특정 아이템이 **포함되어 있지 않은지** 확인합니다. 클로저를 전달해 컬렉션에 조건에 맞는 요소가 존재하지 않는지 검사할 수 있습니다.

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->doesntContain(function (int $value, int $key) {
    return $value < 5;
});

// false
```

또는, 값을 직접 지정하여 해당 값이 컬렉션에 포함되지 않았는지 여부를 확인할 수도 있습니다.

```php
$collection = collect(['name' => 'Desk', 'price' => 100]);

$collection->doesntContain('Table');

// true

$collection->doesntContain('Desk');

// false
```

키/값 쌍을 전달하여 해당 쌍이 컬렉션에 없는지 검사할 수도 있습니다.

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 100],
]);

$collection->doesntContain('product', 'Bookcase');

// true
```

이 메서드는 비교 시 "느슨한(loose)" 비교를 사용하므로, 문자열과 정수 등 값이 같으면 동일하다고 간주합니다.

<a name="method-dot"></a>
#### `dot()`

`dot` 메서드는 다차원 컬렉션을 한 단계로 평탄화(flatten)하며, 중첩된 깊이를 "도트(dot) 표기법"으로 표시된 키로 변환합니다.

```php
$collection = collect(['products' => ['desk' => ['price' => 100]]]);

$flattened = $collection->dot();

$flattened->all();

// ['products.desk.price' => 100]
```

<a name="method-dump"></a>
#### `dump()`

`dump` 메서드는 컬렉션의 아이템을 화면에 출력(dump)합니다.

```php
$collection = collect(['John Doe', 'Jane Doe']);

$collection->dump();

/*
    Collection {
        #items: array:2 [
            0 => "John Doe"
            1 => "Jane Doe"
        ]
    }
*/
```

컬렉션 출력 후 스크립트 실행까지 즉시 중단하려면 [dd](#method-dd) 메서드를 사용하세요.

<a name="method-duplicates"></a>
#### `duplicates()`

`duplicates` 메서드는 컬렉션에서 중복되는 값을 찾아 반환합니다.

```php
$collection = collect(['a', 'b', 'a', 'c', 'b']);

$collection->duplicates();

// [2 => 'a', 4 => 'b']
```

컬렉션이 배열 혹은 객체로 구성되어 있다면, 중복된 값을 확인할 속성의 키를 인자로 넘길 수 있습니다.

```php
$employees = collect([
    ['email' => 'abigail@example.com', 'position' => 'Developer'],
    ['email' => 'james@example.com', 'position' => 'Designer'],
    ['email' => 'victoria@example.com', 'position' => 'Developer'],
]);

$employees->duplicates('position');

// [2 => 'Developer']
```

<a name="method-duplicatesstrict"></a>
#### `duplicatesStrict()`

이 메서드는 [duplicates](#method-duplicates) 메서드와 시그니처가 동일하지만, 값을 "엄격하게(strict)" 비교하여 판단합니다.

<a name="method-each"></a>
#### `each()`

`each` 메서드는 컬렉션을 순회하며 각 아이템을 클로저에 전달합니다.

```php
$collection = collect([1, 2, 3, 4]);

$collection->each(function (int $item, int $key) {
    // ...
});
```

순회 중 특정 조건에서 반복을 중지하고 싶다면, 클로저에서 `false`를 반환하면 됩니다.

```php
$collection->each(function (int $item, int $key) {
    if (/* condition */) {
        return false;
    }
});
```

<a name="method-eachspread"></a>
#### `eachSpread()`

`eachSpread` 메서드는 컬렉션의 각 아이템(배열 형태)의 내부 값을 분해하여 콜백에 각각 인수로 전달하며, 순회합니다.

```php
$collection = collect([['John Doe', 35], ['Jane Doe', 33]]);

$collection->eachSpread(function (string $name, int $age) {
    // ...
});
```

순회를 멈추고 싶을 때는 콜백에서 `false`를 반환하면 됩니다.

```php
$collection->eachSpread(function (string $name, int $age) {
    return false;
});
```

<a name="method-ensure"></a>
#### `ensure()`

`ensure` 메서드는 컬렉션의 모든 요소가 지정한 타입(또는 타입 목록)인지 검증합니다. 아닌 경우 `UnexpectedValueException`이 발생합니다.

```php
return $collection->ensure(User::class);

return $collection->ensure([User::class, Customer::class]);
```

`string`, `int`, `float`, `bool`, `array` 등과 같은 원시 타입도 지정할 수 있습니다.

```php
return $collection->ensure('int');
```

> [!WARNING]
> `ensure` 메서드는 이후에 컬렉션에 다른 타입의 요소가 추가되는 것을 막아주는 것은 아닙니다.

<a name="method-every"></a>
#### `every()`

`every` 메서드는 컬렉션의 모든 요소가 주어진 조건을 만족하는지 검증합니다.

```php
collect([1, 2, 3, 4])->every(function (int $value, int $key) {
    return $value > 2;
});

// false
```

컬렉션이 비어 있다면, `every`는 항상 true를 반환합니다.

```php
$collection = collect([]);

$collection->every(function (int $value, int $key) {
    return $value > 2;
});

// true
```

<a name="method-except"></a>
#### `except()`

`except` 메서드는 지정한 키를 제외한 나머지 컬렉션 아이템을 반환합니다.

```php
$collection = collect(['product_id' => 1, 'price' => 100, 'discount' => false]);

$filtered = $collection->except(['price', 'discount']);

$filtered->all();

// ['product_id' => 1]
```

`except`와 반대되는 동작을 하려면 [only](#method-only) 메서드를 참고하세요.

> [!NOTE]
> 이 메서드는 [Eloquent 컬렉션](/docs/eloquent-collections#method-except)에서 동작 방식이 다르게 동작합니다.

<a name="method-filter"></a>
#### `filter()`

`filter` 메서드는 전달된 콜백을 사용해 조건을 만족하는 아이템만 남겨 컬렉션을 필터링합니다.

```php
$collection = collect([1, 2, 3, 4]);

$filtered = $collection->filter(function (int $value, int $key) {
    return $value > 2;
});

$filtered->all();

// [3, 4]
```

콜백을 전달하지 않으면, `false`로 취급되는 모든 요소(null, false, 빈 문자열, 0, 빈 배열 등)는 컬렉션에서 제거됩니다.

```php
$collection = collect([1, 2, 3, null, false, '', 0, []]);

$collection->filter()->all();

// [1, 2, 3]
```

`filter`와 반대 동작을 하려면 [reject](#method-reject) 메서드를 참고하세요.

<a name="method-first"></a>
#### `first()`

`first` 메서드는 컬렉션에서 주어진 조건을 처음 만족하는 요소를 반환합니다.

```php
collect([1, 2, 3, 4])->first(function (int $value, int $key) {
    return $value > 2;
});

// 3
```

인자를 전달하지 않으면, 첫 번째 요소를 반환합니다. 컬렉션이 비어 있으면 `null`을 반환합니다.

```php
collect([1, 2, 3, 4])->first();

// 1
```

<a name="method-first-or-fail"></a>
#### `firstOrFail()`

`firstOrFail` 메서드는 `first` 메서드와 동일하지만, 조건을 만족하는 요소가 없을 경우 `Illuminate\Support\ItemNotFoundException` 예외를 발생시킵니다.

```php
collect([1, 2, 3, 4])->firstOrFail(function (int $value, int $key) {
    return $value > 5;
});

// Throws ItemNotFoundException...
```

또한, 인수를 전달하지 않고 호출하면, 컬렉션이 비어 있을 경우 `Illuminate\Support\ItemNotFoundException` 예외가 발생합니다.

```php
collect([])->firstOrFail();

// Throws ItemNotFoundException...
```

<a name="method-first-where"></a>
#### `firstWhere()`

`firstWhere` 메서드는 지정한 키/값 쌍을 갖는 컬렉션의 첫 번째 요소를 반환합니다.

```php
$collection = collect([
    ['name' => 'Regena', 'age' => null],
    ['name' => 'Linda', 'age' => 14],
    ['name' => 'Diego', 'age' => 23],
    ['name' => 'Linda', 'age' => 84],
]);

$collection->firstWhere('name', 'Linda');

// ['name' => 'Linda', 'age' => 14]
```

비교 연산자를 추가로 지정해 사용할 수도 있습니다.

```php
$collection->firstWhere('age', '>=', 18);

// ['name' => 'Diego', 'age' => 23]
```

또한, [where](#method-where) 메서드처럼 하나의 인자만 전달하면, 해당 키가 "참(truthy)"인 첫 번째 요소를 반환합니다.

```php
$collection->firstWhere('age');

// ['name' => 'Linda', 'age' => 14]
```

<a name="method-flatmap"></a>
#### `flatMap()`

`flatMap` 메서드는 컬렉션을 순회하며 각 값을 클로저에 전달하고, 클로저의 반환값을 새로운 배열로 만들어 한 단계(flat)로 평탄화하여 반환합니다. 클로저 내에서 값을 자유롭게 변형할 수 있습니다.

```php
$collection = collect([
    ['name' => 'Sally'],
    ['school' => 'Arkansas'],
    ['age' => 28]
]);

$flattened = $collection->flatMap(function (array $values) {
    return array_map('strtoupper', $values);
});

$flattened->all();

// ['name' => 'SALLY', 'school' => 'ARKANSAS', 'age' => '28'];
```

<a name="method-flatten"></a>
#### `flatten()`

`flatten` 메서드는 다차원 컬렉션을 한 단계(flat)로 평탄화합니다.

```php
$collection = collect([
    'name' => 'taylor',
    'languages' => [
        'php', 'javascript'
    ]
]);

$flattened = $collection->flatten();

$flattened->all();

// ['taylor', 'php', 'javascript'];
```

필요하다면 `flatten` 메서드에 "depth"(깊이) 인자를 지정할 수도 있습니다.

```php
$collection = collect([
    'Apple' => [
        [
            'name' => 'iPhone 6S',
            'brand' => 'Apple'
        ],
    ],
    'Samsung' => [
        [
            'name' => 'Galaxy S7',
            'brand' => 'Samsung'
        ],
    ],
]);

$products = $collection->flatten(1);

$products->values()->all();

/*
    [
        ['name' => 'iPhone 6S', 'brand' => 'Apple'],
        ['name' => 'Galaxy S7', 'brand' => 'Samsung'],
    ]
*/
```

이 예시처럼, `flatten`을 깊이인자 없이 호출하면 내부의 배열까지 모두 평탄화하여 `['iPhone 6S', 'Apple', 'Galaxy S7', 'Samsung']`이 됩니다. 깊이를 명시하면 중첩 배열을 원하는 단계까지만 평탄화할 수 있습니다.

<a name="method-flip"></a>

#### `flip()`

`flip` 메서드는 컬렉션의 키와 값을 서로 뒤바꿉니다.

```php
$collection = collect(['name' => 'taylor', 'framework' => 'laravel']);

$flipped = $collection->flip();

$flipped->all();

// ['taylor' => 'name', 'laravel' => 'framework']
```

<a name="method-forget"></a>
#### `forget()`

`forget` 메서드는 지정한 키에 해당하는 항목을 컬렉션에서 제거합니다.

```php
$collection = collect(['name' => 'taylor', 'framework' => 'laravel']);

// 하나의 키 제거...
$collection->forget('name');

// ['framework' => 'laravel']

// 여러 키 제거...
$collection->forget(['name', 'framework']);

// []
```

> [!WARNING]
> 대부분의 다른 컬렉션 메서드와는 달리, `forget`는 변경된 새 컬렉션을 반환하지 않고, 호출된 컬렉션 자체를 직접 수정하고 반환합니다.

<a name="method-forpage"></a>
#### `forPage()`

`forPage` 메서드는 특정 페이지에 해당하는 항목들만을 포함하는 새 컬렉션을 반환합니다. 첫 번째 인수로 페이지 번호, 두 번째 인수로 한 페이지에 보여줄 항목의 개수를 입력합니다.

```php
$collection = collect([1, 2, 3, 4, 5, 6, 7, 8, 9]);

$chunk = $collection->forPage(2, 3);

$chunk->all();

// [4, 5, 6]
```

<a name="method-fromjson"></a>
#### `fromJson()`

정적 메서드인 `fromJson`은 주어진 JSON 문자열을 PHP의 `json_decode` 함수를 사용해 디코딩하여 새 컬렉션 인스턴스를 만듭니다.

```php
use Illuminate\Support\Collection;

$json = json_encode([
    'name' => 'Taylor Otwell',
    'role' => 'Developer',
    'status' => 'Active',
]);

$collection = Collection::fromJson($json);
```

<a name="method-get"></a>
#### `get()`

`get` 메서드는 지정한 키에 해당하는 항목을 반환합니다. 해당 키가 존재하지 않으면 `null`을 반환합니다.

```php
$collection = collect(['name' => 'taylor', 'framework' => 'laravel']);

$value = $collection->get('name');

// taylor
```

두 번째 인수로 기본값을 전달할 수도 있습니다.

```php
$collection = collect(['name' => 'taylor', 'framework' => 'laravel']);

$value = $collection->get('age', 34);

// 34
```

기본값으로 콜백을 전달할 수도 있습니다. 지정한 키가 존재하지 않는 경우 콜백의 반환값이 사용됩니다.

```php
$collection->get('email', function () {
    return 'taylor@example.com';
});

// taylor@example.com
```

<a name="method-groupby"></a>
#### `groupBy()`

`groupBy` 메서드는 컬렉션의 항목들을 주어진 키로 그룹화합니다.

```php
$collection = collect([
    ['account_id' => 'account-x10', 'product' => 'Chair'],
    ['account_id' => 'account-x10', 'product' => 'Bookcase'],
    ['account_id' => 'account-x11', 'product' => 'Desk'],
]);

$grouped = $collection->groupBy('account_id');

$grouped->all();

/*
    [
        'account-x10' => [
            ['account_id' => 'account-x10', 'product' => 'Chair'],
            ['account_id' => 'account-x10', 'product' => 'Bookcase'],
        ],
        'account-x11' => [
            ['account_id' => 'account-x11', 'product' => 'Desk'],
        ],
    ]
*/
```

문자열 `key` 대신 콜백을 전달할 수도 있습니다. 콜백에서는 그룹화에 사용할 값을 반환해야 합니다.

```php
$grouped = $collection->groupBy(function (array $item, int $key) {
    return substr($item['account_id'], -3);
});

$grouped->all();

/*
    [
        'x10' => [
            ['account_id' => 'account-x10', 'product' => 'Chair'],
            ['account_id' => 'account-x10', 'product' => 'Bookcase'],
        ],
        'x11' => [
            ['account_id' => 'account-x11', 'product' => 'Desk'],
        ],
    ]
*/
```

여러 개의 그룹핑 기준을 배열로 전달할 수도 있습니다. 배열의 각 요소는 다차원 배열의 해당 레벨에 적용됩니다.

```php
$data = new Collection([
    10 => ['user' => 1, 'skill' => 1, 'roles' => ['Role_1', 'Role_3']],
    20 => ['user' => 2, 'skill' => 1, 'roles' => ['Role_1', 'Role_2']],
    30 => ['user' => 3, 'skill' => 2, 'roles' => ['Role_1']],
    40 => ['user' => 4, 'skill' => 2, 'roles' => ['Role_2']],
]);

$result = $data->groupBy(['skill', function (array $item) {
    return $item['roles'];
}], preserveKeys: true);

/*
[
    1 => [
        'Role_1' => [
            10 => ['user' => 1, 'skill' => 1, 'roles' => ['Role_1', 'Role_3']],
            20 => ['user' => 2, 'skill' => 1, 'roles' => ['Role_1', 'Role_2']],
        ],
        'Role_2' => [
            20 => ['user' => 2, 'skill' => 1, 'roles' => ['Role_1', 'Role_2']],
        ],
        'Role_3' => [
            10 => ['user' => 1, 'skill' => 1, 'roles' => ['Role_1', 'Role_3']],
        ],
    ],
    2 => [
        'Role_1' => [
            30 => ['user' => 3, 'skill' => 2, 'roles' => ['Role_1']],
        ],
        'Role_2' => [
            40 => ['user' => 4, 'skill' => 2, 'roles' => ['Role_2']],
        ],
    ],
];
*/
```

<a name="method-has"></a>
#### `has()`

`has` 메서드는 주어진 키가 컬렉션에 존재하는지 판단합니다.

```php
$collection = collect(['account_id' => 1, 'product' => 'Desk', 'amount' => 5]);

$collection->has('product');

// true

$collection->has(['product', 'amount']);

// true

$collection->has(['amount', 'price']);

// false
```

<a name="method-hasany"></a>
#### `hasAny()`

`hasAny` 메서드는 인수로 전달된 여러 키 중 하나라도 컬렉션에 존재하는지 확인합니다.

```php
$collection = collect(['account_id' => 1, 'product' => 'Desk', 'amount' => 5]);

$collection->hasAny(['product', 'price']);

// true

$collection->hasAny(['name', 'price']);

// false
```

<a name="method-implode"></a>
#### `implode()`

`implode` 메서드는 컬렉션의 항목들을 연결해서 하나의 문자열로 만듭니다. 전달하는 인수는 컬렉션의 각 항목이 배열이나 객체인지, 아니면 단순 값인지에 따라 달라집니다. 만약 컬렉션 항목이 배열이나 객체라면, 연결할 속성의 키와 각 값 사이에 넣을 "구분자" 문자열을 전달해야 합니다.

```php
$collection = collect([
    ['account_id' => 1, 'product' => 'Desk'],
    ['account_id' => 2, 'product' => 'Chair'],
]);

$collection->implode('product', ', ');

// 'Desk, Chair'
```

컬렉션이 단순 문자열이나 숫자라면 "구분자"만을 인수로 전달하면 됩니다.

```php
collect([1, 2, 3, 4, 5])->implode('-');

// '1-2-3-4-5'
```

또한 `implode` 메서드에 클로저(콜백)를 전달하여 각 값을 원하는 형태로 변환하여 연결할 수도 있습니다.

```php
$collection->implode(function (array $item, int $key) {
    return strtoupper($item['product']);
}, ', ');

// 'DESK, CHAIR'
```

<a name="method-intersect"></a>
#### `intersect()`

`intersect` 메서드는 원본 컬렉션에 존재하는 값 중, 전달받은 배열 또는 컬렉션에도 존재하는 값만 남기고 나머지를 제거합니다. 결과 컬렉션은 원본 컬렉션의 키를 그대로 유지합니다.

```php
$collection = collect(['Desk', 'Sofa', 'Chair']);

$intersect = $collection->intersect(['Desk', 'Chair', 'Bookcase']);

$intersect->all();

// [0 => 'Desk', 2 => 'Chair']
```

> [!NOTE]
> [Eloquent 컬렉션](/docs/eloquent-collections#method-intersect)에서는 이 메서드의 동작이 일부 달라집니다.

<a name="method-intersectusing"></a>
#### `intersectUsing()`

`intersectUsing` 메서드는 전달받은 배열 또는 컬렉션에 존재하는 값만 남기되, 값을 비교할 때 사용자 정의 콜백을 사용합니다. 결과 컬렉션은 원본 컬렉션의 키를 유지합니다.

```php
$collection = collect(['Desk', 'Sofa', 'Chair']);

$intersect = $collection->intersectUsing(['desk', 'chair', 'bookcase'], function ($a, $b) {
    return strcasecmp($a, $b);
});

$intersect->all();

// [0 => 'Desk', 2 => 'Chair']
```

<a name="method-intersectAssoc"></a>
#### `intersectAssoc()`

`intersectAssoc` 메서드는 원본 컬렉션과 또 다른 컬렉션(또는 배열)을 비교하여, 양쪽 모두에 존재하는 키/값 쌍만 반환합니다.

```php
$collection = collect([
    'color' => 'red',
    'size' => 'M',
    'material' => 'cotton'
]);

$intersect = $collection->intersectAssoc([
    'color' => 'blue',
    'size' => 'M',
    'material' => 'polyester'
]);

$intersect->all();

// ['size' => 'M']
```

<a name="method-intersectassocusing"></a>
#### `intersectAssocUsing()`

`intersectAssocUsing` 메서드는 원본 컬렉션과 또 다른 컬렉션(또는 배열)을 비교하여, 양쪽 모두에 존재하는 키/값 쌍만 반환하되, 키와 값을 비교할 때 사용자 정의 콜백을 사용합니다.

```php
$collection = collect([
    'color' => 'red',
    'Size' => 'M',
    'material' => 'cotton',
]);

$intersect = $collection->intersectAssocUsing([
    'color' => 'blue',
    'size' => 'M',
    'material' => 'polyester',
], function ($a, $b) {
    return strcasecmp($a, $b);
});

$intersect->all();

// ['Size' => 'M']
```

<a name="method-intersectbykeys"></a>
#### `intersectByKeys()`

`intersectByKeys` 메서드는 전달된 배열 또는 컬렉션에 존재하지 않는 키와 해당 값을 원본 컬렉션에서 모두 제거합니다.

```php
$collection = collect([
    'serial' => 'UX301', 'type' => 'screen', 'year' => 2009,
]);

$intersect = $collection->intersectByKeys([
    'reference' => 'UX404', 'type' => 'tab', 'year' => 2011,
]);

$intersect->all();

// ['type' => 'screen', 'year' => 2009]
```

<a name="method-isempty"></a>
#### `isEmpty()`

`isEmpty` 메서드는 컬렉션이 비어 있다면 `true`, 항목이 하나라도 있으면 `false`를 반환합니다.

```php
collect([])->isEmpty();

// true
```

<a name="method-isnotempty"></a>
#### `isNotEmpty()`

`isNotEmpty` 메서드는 컬렉션에 항목이 하나라도 있으면 `true`, 비어 있으면 `false`를 반환합니다.

```php
collect([])->isNotEmpty();

// false
```

<a name="method-join"></a>
#### `join()`

`join` 메서드는 컬렉션의 값을 문자열로 연결합니다. 두 번째 인수를 사용해 마지막 항목 앞에 붙일 문자열을 지정할 수도 있습니다.

```php
collect(['a', 'b', 'c'])->join(', '); // 'a, b, c'
collect(['a', 'b', 'c'])->join(', ', ', and '); // 'a, b, and c'
collect(['a', 'b'])->join(', ', ' and '); // 'a and b'
collect(['a'])->join(', ', ' and '); // 'a'
collect([])->join(', ', ' and '); // ''
```

<a name="method-keyby"></a>
#### `keyBy()`

`keyBy` 메서드는 컬렉션을 주어진 키로 인덱스화합니다. 동일한 키를 가진 항목이 여러 개 있을 경우, 마지막 항목만 새 컬렉션에 남게 됩니다.

```php
$collection = collect([
    ['product_id' => 'prod-100', 'name' => 'Desk'],
    ['product_id' => 'prod-200', 'name' => 'Chair'],
]);

$keyed = $collection->keyBy('product_id');

$keyed->all();

/*
    [
        'prod-100' => ['product_id' => 'prod-100', 'name' => 'Desk'],
        'prod-200' => ['product_id' => 'prod-200', 'name' => 'Chair'],
    ]
*/
```

이 메서드에도 콜백을 전달할 수 있습니다. 콜백에서 반환하는 값이 컬렉션의 키로 사용됩니다.

```php
$keyed = $collection->keyBy(function (array $item, int $key) {
    return strtoupper($item['product_id']);
});

$keyed->all();

/*
    [
        'PROD-100' => ['product_id' => 'prod-100', 'name' => 'Desk'],
        'PROD-200' => ['product_id' => 'prod-200', 'name' => 'Chair'],
    ]
*/
```

<a name="method-keys"></a>
#### `keys()`

`keys` 메서드는 컬렉션의 모든 키를 반환합니다.

```php
$collection = collect([
    'prod-100' => ['product_id' => 'prod-100', 'name' => 'Desk'],
    'prod-200' => ['product_id' => 'prod-200', 'name' => 'Chair'],
]);

$keys = $collection->keys();

$keys->all();

// ['prod-100', 'prod-200']
```

<a name="method-last"></a>
#### `last()`

`last` 메서드는 주어진 조건을 만족하는 컬렉션의 마지막 항목을 반환합니다.

```php
collect([1, 2, 3, 4])->last(function (int $value, int $key) {
    return $value < 3;
});

// 2
```

인수를 전달하지 않으면 컬렉션의 마지막 항목을 반환합니다. 컬렉션이 비어 있는 경우 `null`을 반환합니다.

```php
collect([1, 2, 3, 4])->last();

// 4
```

<a name="method-lazy"></a>
#### `lazy()`

`lazy` 메서드는 내부 아이템 배열로부터 새로운 [LazyCollection](#lazy-collections) 인스턴스를 반환합니다.

```php
$lazyCollection = collect([1, 2, 3, 4])->lazy();

$lazyCollection::class;

// Illuminate\Support\LazyCollection

$lazyCollection->all();

// [1, 2, 3, 4]
```

이 기능은 수많은 항목을 갖는 큰 `Collection`에 변환 작업을 수행할 때 매우 유용합니다.

```php
$count = $hugeCollection
    ->lazy()
    ->where('country', 'FR')
    ->where('balance', '>', '100')
    ->count();
```

컬렉션을 `LazyCollection`으로 변환하면 불필요하게 많은 메모리가 할당되는 것을 피할 수 있습니다. 원본 컬렉션만 자신의 값을 메모리에 보유하고, 그 이후의 필터링 작업에서는 사실상 별도의 추가 메모리가 할당되지 않습니다.

<a name="method-macro"></a>
#### `macro()`

정적 메서드인 `macro`를 사용하면 런타임에 `Collection` 클래스에 메서드를 동적으로 추가할 수 있습니다. 자세한 내용은 [컬렉션 확장하기](#extending-collections) 문서를 참고하십시오.

<a name="method-make"></a>
#### `make()`

정적 메서드인 `make`는 새 컬렉션 인스턴스를 생성합니다. 자세한 내용은 [컬렉션 생성하기](#creating-collections) 섹션에서 확인할 수 있습니다.

```php
use Illuminate\Support\Collection;

$collection = Collection::make([1, 2, 3]);
```

<a name="method-map"></a>
#### `map()`

`map` 메서드는 컬렉션의 각 항목을 순회하며 콜백에 전달합니다. 콜백 함수에서 항목을 자유롭게 수정하여 반환할 수 있으며, 이렇게 변환된 새 항목들로 구성된 컬렉션이 반환됩니다.

```php
$collection = collect([1, 2, 3, 4, 5]);

$multiplied = $collection->map(function (int $item, int $key) {
    return $item * 2;
});

$multiplied->all();

// [2, 4, 6, 8, 10]
```

> [!WARNING]
> 대부분의 다른 컬렉션 메서드와 마찬가지로, `map`은 컬렉션 인스턴스를 새로 만들어 반환합니다. 원래의 컬렉션에는 영향을 주지 않습니다. 원본 컬렉션을 직접 변환하고 싶다면 [transform](#method-transform) 메서드를 사용하세요.

<a name="method-mapinto"></a>
#### `mapInto()`

`mapInto()` 메서드는 컬렉션을 순회하면서 각 값으로 전달된 클래스의 새 인스턴스를 생성합니다. 즉, 각 항목이 해당 클래스의 생성자에 전달됩니다.

```php
class Currency
{
    /**
     * 새 통화 인스턴스 생성.
     */
    function __construct(
        public string $code,
    ) {}
}

$collection = collect(['USD', 'EUR', 'GBP']);

$currencies = $collection->mapInto(Currency::class);

$currencies->all();

// [Currency('USD'), Currency('EUR'), Currency('GBP')]
```

<a name="method-mapspread"></a>

#### `mapSpread()`

`mapSpread` 메서드는 컬렉션의 각 아이템(중첩된 값들)을 주어진 클로저에 각각의 인수로 전달하면서 순회합니다. 클로저에서는 각 아이템 값을 자유롭게 수정해서 반환할 수 있으며, 그 결과 새로운(수정된) 아이템들의 컬렉션이 만들어집니다.

```php
$collection = collect([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

$chunks = $collection->chunk(2);

$sequence = $chunks->mapSpread(function (int $even, int $odd) {
    return $even + $odd;
});

$sequence->all();

// [1, 5, 9, 13, 17]
```

<a name="method-maptogroups"></a>
#### `mapToGroups()`

`mapToGroups` 메서드는 컬렉션의 아이템들을 주어진 클로저를 통해 그룹별로 묶습니다. 클로저는 단일 키-값 쌍을 담은 연관 배열을 반환해야 하며, 이로써 그룹화된 값들의 새로운 컬렉션이 완성됩니다.

```php
$collection = collect([
    [
        'name' => 'John Doe',
        'department' => 'Sales',
    ],
    [
        'name' => 'Jane Doe',
        'department' => 'Sales',
    ],
    [
        'name' => 'Johnny Doe',
        'department' => 'Marketing',
    ]
]);

$grouped = $collection->mapToGroups(function (array $item, int $key) {
    return [$item['department'] => $item['name']];
});

$grouped->all();

/*
    [
        'Sales' => ['John Doe', 'Jane Doe'],
        'Marketing' => ['Johnny Doe'],
    ]
*/

$grouped->get('Sales')->all();

// ['John Doe', 'Jane Doe']
```

<a name="method-mapwithkeys"></a>
#### `mapWithKeys()`

`mapWithKeys` 메서드는 컬렉션을 순회하며 각 값을 콜백 함수에 전달합니다. 콜백 함수에서는 단일 키-값 쌍을 갖는 연관 배열을 반환해야 합니다.

```php
$collection = collect([
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
]);

$keyed = $collection->mapWithKeys(function (array $item, int $key) {
    return [$item['email'] => $item['name']];
});

$keyed->all();

/*
    [
        'john@example.com' => 'John',
        'jane@example.com' => 'Jane',
    ]
*/
```

<a name="method-max"></a>
#### `max()`

`max` 메서드는 지정한 키에 대해 가장 큰 값을 반환합니다.

```php
$max = collect([
    ['foo' => 10],
    ['foo' => 20]
])->max('foo');

// 20

$max = collect([1, 2, 3, 4, 5])->max();

// 5
```

<a name="method-median"></a>
#### `median()`

`median` 메서드는 지정한 키의 [중앙값(median)](https://en.wikipedia.org/wiki/Median)을 반환합니다.

```php
$median = collect([
    ['foo' => 10],
    ['foo' => 10],
    ['foo' => 20],
    ['foo' => 40]
])->median('foo');

// 15

$median = collect([1, 1, 2, 4])->median();

// 1.5
```

<a name="method-merge"></a>
#### `merge()`

`merge` 메서드는 주어진 배열 또는 컬렉션을 원본 컬렉션과 합칩니다. 만약 주어진 아이템에 문자열 키가 있고, 그 키가 원본 컬렉션에도 존재한다면, 주어진 아이템의 값이 원본의 값을 덮어씁니다.

```php
$collection = collect(['product_id' => 1, 'price' => 100]);

$merged = $collection->merge(['price' => 200, 'discount' => false]);

$merged->all();

// ['product_id' => 1, 'price' => 200, 'discount' => false]
```

만약 주어진 아이템의 키가 숫자라면, 해당 값은 컬렉션의 끝에 추가됩니다.

```php
$collection = collect(['Desk', 'Chair']);

$merged = $collection->merge(['Bookcase', 'Door']);

$merged->all();

// ['Desk', 'Chair', 'Bookcase', 'Door']
```

<a name="method-mergerecursive"></a>
#### `mergeRecursive()`

`mergeRecursive` 메서드는 주어진 배열이나 컬렉션을 원본 컬렉션에 재귀적으로 병합합니다. 만약 주어진 항목과 원본 컬렉션에 동일한 문자열 키가 있다면, 해당 키의 값들은 배열로 합쳐지고, 이 동작은 재귀적으로 실행됩니다.

```php
$collection = collect(['product_id' => 1, 'price' => 100]);

$merged = $collection->mergeRecursive([
    'product_id' => 2,
    'price' => 200,
    'discount' => false
]);

$merged->all();

// ['product_id' => [1, 2], 'price' => [100, 200], 'discount' => false]
```

<a name="method-min"></a>
#### `min()`

`min` 메서드는 지정한 키의 최소값을 반환합니다.

```php
$min = collect([['foo' => 10], ['foo' => 20]])->min('foo');

// 10

$min = collect([1, 2, 3, 4, 5])->min();

// 1
```

<a name="method-mode"></a>
#### `mode()`

`mode` 메서드는 지정한 키의 [최빈값(mode)](https://en.wikipedia.org/wiki/Mode_(statistics))을 반환합니다.

```php
$mode = collect([
    ['foo' => 10],
    ['foo' => 10],
    ['foo' => 20],
    ['foo' => 40]
])->mode('foo');

// [10]

$mode = collect([1, 1, 2, 4])->mode();

// [1]

$mode = collect([1, 1, 2, 2])->mode();

// [1, 2]
```

<a name="method-multiply"></a>
#### `multiply()`

`multiply` 메서드는 컬렉션 내 모든 아이템을 지정한 횟수만큼 복사해서 반환합니다.

```php
$users = collect([
    ['name' => 'User #1', 'email' => 'user1@example.com'],
    ['name' => 'User #2', 'email' => 'user2@example.com'],
])->multiply(3);

/*
    [
        ['name' => 'User #1', 'email' => 'user1@example.com'],
        ['name' => 'User #2', 'email' => 'user2@example.com'],
        ['name' => 'User #1', 'email' => 'user1@example.com'],
        ['name' => 'User #2', 'email' => 'user2@example.com'],
        ['name' => 'User #1', 'email' => 'user1@example.com'],
        ['name' => 'User #2', 'email' => 'user2@example.com'],
    ]
*/
```

<a name="method-nth"></a>
#### `nth()`

`nth` 메서드는 컬렉션에서 n번째마다 하나씩 요소를 뽑아 새로운 컬렉션을 만듭니다.

```php
$collection = collect(['a', 'b', 'c', 'd', 'e', 'f']);

$collection->nth(4);

// ['a', 'e']
```

두 번째 인자로 시작 오프셋을 넘겨줄 수도 있습니다.

```php
$collection->nth(4, 1);

// ['b', 'f']
```

<a name="method-only"></a>
#### `only()`

`only` 메서드는 지정한 키들에 해당하는 아이템만 반환합니다.

```php
$collection = collect([
    'product_id' => 1,
    'name' => 'Desk',
    'price' => 100,
    'discount' => false
]);

$filtered = $collection->only(['product_id', 'name']);

$filtered->all();

// ['product_id' => 1, 'name' => 'Desk']
```

`only`의 반대 동작을 위해서는 [except](#method-except) 메서드를 참고하세요.

> [!NOTE]
> [Eloquent 컬렉션](/docs/eloquent-collections#method-only)에서 사용할 때는 이 메서드의 동작 방식이 달라질 수 있습니다.

<a name="method-pad"></a>
#### `pad()`

`pad` 메서드는 컬렉션의 크기가 지정한 길이에 도달할 때까지 주어진 값으로 채웁니다. 이 메서드는 PHP의 [array_pad](https://secure.php.net/manual/en/function.array-pad.php) 함수와 비슷하게 동작합니다.

좌측(앞부분)으로 채우고 싶을 때는 음수 크기를 지정하세요. 만약 지정한 크기의 절댓값이 배열의 길이보다 작거나 같으면 패딩이 적용되지 않습니다.

```php
$collection = collect(['A', 'B', 'C']);

$filtered = $collection->pad(5, 0);

$filtered->all();

// ['A', 'B', 'C', 0, 0]

$filtered = $collection->pad(-5, 0);

$filtered->all();

// [0, 0, 'A', 'B', 'C']
```

<a name="method-partition"></a>
#### `partition()`

`partition` 메서드는 PHP 배열 분해(destructuring) 문법과 함께 사용해, 주어진 조건에 따라 각각의 그룹(조건을 통과한 요소 / 통과하지 못한 요소)으로 분리하는 데 사용할 수 있습니다.

```php
$collection = collect([1, 2, 3, 4, 5, 6]);

[$underThree, $equalOrAboveThree] = $collection->partition(function (int $i) {
    return $i < 3;
});

$underThree->all();

// [1, 2]

$equalOrAboveThree->all();

// [3, 4, 5, 6]
```

> [!NOTE]
> [Eloquent 컬렉션](/docs/eloquent-collections#method-partition)에서 사용할 때는 이 메서드의 동작이 다를 수 있습니다.

<a name="method-percentage"></a>
#### `percentage()`

`percentage` 메서드는 컬렉션에서 주어진 조건을 통과하는 아이템의 비율(%)을 간편하게 구할 수 있게 해줍니다.

```php
$collection = collect([1, 1, 2, 2, 2, 3]);

$percentage = $collection->percentage(fn ($value) => $value === 1);

// 33.33
```

기본적으로 소수점 이하 두 자리까지 반올림하여 결과를 반환합니다. 이 동작을 변경하고 싶을 때는 두 번째 인자로 정밀도(precision)를 지정할 수 있습니다.

```php
$percentage = $collection->percentage(fn ($value) => $value === 1, precision: 3);

// 33.333
```

<a name="method-pipe"></a>
#### `pipe()`

`pipe` 메서드는 컬렉션 내용을 주어진 클로저에 전달하고, 클로저가 반환한 값을 그대로 반환합니다.

```php
$collection = collect([1, 2, 3]);

$piped = $collection->pipe(function (Collection $collection) {
    return $collection->sum();
});

// 6
```

<a name="method-pipeinto"></a>
#### `pipeInto()`

`pipeInto` 메서드는 주어진 클래스의 새 인스턴스를 만들고, 컬렉션을 생성자에 전달합니다.

```php
class ResourceCollection
{
    /**
     * Create a new ResourceCollection instance.
     */
    public function __construct(
        public Collection $collection,
    ) {}
}

$collection = collect([1, 2, 3]);

$resource = $collection->pipeInto(ResourceCollection::class);

$resource->collection->all();

// [1, 2, 3]
```

<a name="method-pipethrough"></a>
#### `pipeThrough()`

`pipeThrough` 메서드는 컬렉션을 주어진 클로저 배열에 차례로 전달하여, 클로저 실행 결과를 반환합니다.

```php
use Illuminate\Support\Collection;

$collection = collect([1, 2, 3]);

$result = $collection->pipeThrough([
    function (Collection $collection) {
        return $collection->merge([4, 5]);
    },
    function (Collection $collection) {
        return $collection->sum();
    },
]);

// 15
```

<a name="method-pluck"></a>
#### `pluck()`

`pluck` 메서드는 지정한 키의 모든 값을 추출합니다.

```php
$collection = collect([
    ['product_id' => 'prod-100', 'name' => 'Desk'],
    ['product_id' => 'prod-200', 'name' => 'Chair'],
]);

$plucked = $collection->pluck('name');

$plucked->all();

// ['Desk', 'Chair']
```

추출된 컬렉션의 키를 별도로 지정할 수도 있습니다.

```php
$plucked = $collection->pluck('name', 'product_id');

$plucked->all();

// ['prod-100' => 'Desk', 'prod-200' => 'Chair']
```

`pluck` 메서드는 "dot" 표기법을 사용해 중첩된 값을 추출하는 것도 지원합니다.

```php
$collection = collect([
    [
        'name' => 'Laracon',
        'speakers' => [
            'first_day' => ['Rosa', 'Judith'],
        ],
    ],
    [
        'name' => 'VueConf',
        'speakers' => [
            'first_day' => ['Abigail', 'Joey'],
        ],
    ],
]);

$plucked = $collection->pluck('speakers.first_day');

$plucked->all();

// [['Rosa', 'Judith'], ['Abigail', 'Joey']]
```

중복된 키가 존재할 경우, 마지막에 일치한 아이템만 추출된 컬렉션에 저장됩니다.

```php
$collection = collect([
    ['brand' => 'Tesla',  'color' => 'red'],
    ['brand' => 'Pagani', 'color' => 'white'],
    ['brand' => 'Tesla',  'color' => 'black'],
    ['brand' => 'Pagani', 'color' => 'orange'],
]);

$plucked = $collection->pluck('color', 'brand');

$plucked->all();

// ['Tesla' => 'black', 'Pagani' => 'orange']
```

<a name="method-pop"></a>
#### `pop()`

`pop` 메서드는 컬렉션에서 마지막 아이템을 제거한 뒤 반환합니다.

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->pop();

// 5

$collection->all();

// [1, 2, 3, 4]
```

`pop` 메서드에 정수를 인자로 전달하면, 컬렉션 끝에서 여러 아이템을 한 번에 제거하고 반환할 수 있습니다.

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->pop(3);

// collect([5, 4, 3])

$collection->all();

// [1, 2]
```

<a name="method-prepend"></a>
#### `prepend()`

`prepend` 메서드는 컬렉션 시작 부분(맨 앞)에 아이템을 추가합니다.

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->prepend(0);

$collection->all();

// [0, 1, 2, 3, 4, 5]
```

추가하는 아이템의 키를 두 번째 인자로 지정할 수도 있습니다.

```php
$collection = collect(['one' => 1, 'two' => 2]);

$collection->prepend(0, 'zero');

$collection->all();

// ['zero' => 0, 'one' => 1, 'two' => 2]
```

<a name="method-pull"></a>
#### `pull()`

`pull` 메서드는 컬렉션에서 지정한 키의 아이템을 제거하여 반환합니다.

```php
$collection = collect(['product_id' => 'prod-100', 'name' => 'Desk']);

$collection->pull('name');

// 'Desk'

$collection->all();

// ['product_id' => 'prod-100']
```

<a name="method-push"></a>
#### `push()`

`push` 메서드는 컬렉션 끝에 아이템을 추가합니다.

```php
$collection = collect([1, 2, 3, 4]);

$collection->push(5);

$collection->all();

// [1, 2, 3, 4, 5]
```

<a name="method-put"></a>

#### `put()`

`put` 메서드는 컬렉션에 주어진 키와 값을 저장합니다.

```php
$collection = collect(['product_id' => 1, 'name' => 'Desk']);

$collection->put('price', 100);

$collection->all();

// ['product_id' => 1, 'name' => 'Desk', 'price' => 100]
```

<a name="method-random"></a>
#### `random()`

`random` 메서드는 컬렉션에서 무작위로 항목 하나를 반환합니다.

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->random();

// 4 - (임의로 가져온 값)
```

몇 개의 항목을 무작위로 추출할지 정수로 지정할 수도 있습니다. 명시적으로 숫자를 지정하면, 항상 해당 개수만큼의 항목이 담긴 컬렉션이 반환됩니다.

```php
$random = $collection->random(3);

$random->all();

// [2, 4, 5] - (임의로 가져온 값)
```

컬렉션에 요청한 개수보다 적은 항목만 존재할 경우, `random` 메서드는 `InvalidArgumentException` 예외를 발생시킵니다.

또한 `random` 메서드는 현재 컬렉션 인스턴스를 전달받는 클로저(익명 함수)도 인자로 받을 수 있습니다.

```php
use Illuminate\Support\Collection;

$random = $collection->random(fn (Collection $items) => min(10, count($items)));

$random->all();

// [1, 2, 3, 4, 5] - (임의로 가져온 값)
```

<a name="method-range"></a>
#### `range()`

`range` 메서드는 지정된 범위의 정수로 이루어진 컬렉션을 반환합니다.

```php
$collection = collect()->range(3, 6);

$collection->all();

// [3, 4, 5, 6]
```

<a name="method-reduce"></a>
#### `reduce()`

`reduce` 메서드는 컬렉션의 모든 항목을 반복하며 누적 결과를 다음 반복에 전달해, 하나의 값으로 줄여줍니다.

```php
$collection = collect([1, 2, 3]);

$total = $collection->reduce(function (?int $carry, int $item) {
    return $carry + $item;
});

// 6
```

첫 번째 반복에서 `$carry`의 값은 `null`이지만, 두 번째 인자로 초기값을 지정할 수도 있습니다.

```php
$collection->reduce(function (int $carry, int $item) {
    return $carry + $item;
}, 4);

// 10
```

`reduce` 메서드는 콜백 함수로 배열의 키도 전달합니다.

```php
$collection = collect([
    'usd' => 1400,
    'gbp' => 1200,
    'eur' => 1000,
]);

$ratio = [
    'usd' => 1,
    'gbp' => 1.37,
    'eur' => 1.22,
];

$collection->reduce(function (int $carry, int $value, string $key) use ($ratio) {
    return $carry + ($value * $ratio[$key]);
}, 0);

// 4264
```

<a name="method-reduce-spread"></a>
#### `reduceSpread()`

`reduceSpread` 메서드는 컬렉션의 항목들을 반복하며 여러 개의 값을 누적으로 전달한다는 점에서 `reduce`와 비슷하지만, 여러 개의 초기 값과 결과를 배열 형태로 반환합니다.

```php
[$creditsRemaining, $batch] = Image::where('status', 'unprocessed')
    ->get()
    ->reduceSpread(function (int $creditsRemaining, Collection $batch, Image $image) {
        if ($creditsRemaining >= $image->creditsRequired()) {
            $batch->push($image);

            $creditsRemaining -= $image->creditsRequired();
        }

        return [$creditsRemaining, $batch];
    }, $creditsAvailable, collect());
```

<a name="method-reject"></a>
#### `reject()`

`reject` 메서드는 전달한 클로저(조건식)에 따라 컬렉션의 항목을 필터링합니다. 클로저가 `true`를 반환하는 항목은 결과 컬렉션에서 제거됩니다.

```php
$collection = collect([1, 2, 3, 4]);

$filtered = $collection->reject(function (int $value, int $key) {
    return $value > 2;
});

$filtered->all();

// [1, 2]
```

`reject` 메서드와 반대로 동작하는 메서드는 [filter](#method-filter)에서 확인하세요.

<a name="method-replace"></a>
#### `replace()`

`replace` 메서드는 `merge`와 비슷하게 동작하지만, 문자열 키뿐 아니라 숫자 키가 일치하는 항목도 덮어쓴다는 차이가 있습니다.

```php
$collection = collect(['Taylor', 'Abigail', 'James']);

$replaced = $collection->replace([1 => 'Victoria', 3 => 'Finn']);

$replaced->all();

// ['Taylor', 'Victoria', 'James', 'Finn']
```

<a name="method-replacerecursive"></a>
#### `replaceRecursive()`

이 메서드는 `replace`처럼 동작하지만, 배열의 하위 값(중첩된 값)까지 재귀적으로 동일한 대체 작업을 수행합니다.

```php
$collection = collect([
    'Taylor',
    'Abigail',
    [
        'James',
        'Victoria',
        'Finn'
    ]
]);

$replaced = $collection->replaceRecursive([
    'Charlie',
    2 => [1 => 'King']
]);

$replaced->all();

// ['Charlie', 'Abigail', ['James', 'King', 'Finn']]
```

<a name="method-reverse"></a>
#### `reverse()`

`reverse` 메서드는 컬렉션의 항목 순서를 반대로 뒤집습니다. 이때 기존의 키는 그대로 유지됩니다.

```php
$collection = collect(['a', 'b', 'c', 'd', 'e']);

$reversed = $collection->reverse();

$reversed->all();

/*
    [
        4 => 'e',
        3 => 'd',
        2 => 'c',
        1 => 'b',
        0 => 'a',
    ]
*/
```

<a name="method-search"></a>
#### `search()`

`search` 메서드는 컬렉션에서 지정한 값의 키를 찾아 반환합니다. 값을 찾지 못하면 `false`를 반환합니다.

```php
$collection = collect([2, 4, 6, 8]);

$collection->search(4);

// 1
```

기본적으로 "느슨한(loose)" 비교가 사용되므로, 문자열로 구성된 숫자와 정수 값이 같으면 일치로 간주됩니다. "엄격한(strict)" 비교를 사용하려면 두 번째 인자에 `true`를 전달하세요.

```php
collect([2, 4, 6, 8])->search('4', strict: true);

// false
```

또는 자신만의 클로저(익명 함수)를 전달해서, 조건에 일치하는 첫 번째 항목의 키를 반환받을 수도 있습니다.

```php
collect([2, 4, 6, 8])->search(function (int $item, int $key) {
    return $item > 5;
});

// 2
```

<a name="method-select"></a>
#### `select()`

`select` 메서드는 주어진 키 목록에 해당하는 값만 컬렉션에서 선택합니다. 마치 SQL의 `SELECT` 구문과 비슷하게 동작합니다.

```php
$users = collect([
    ['name' => 'Taylor Otwell', 'role' => 'Developer', 'status' => 'active'],
    ['name' => 'Victoria Faith', 'role' => 'Researcher', 'status' => 'active'],
]);

$users->select(['name', 'role']);

/*
    [
        ['name' => 'Taylor Otwell', 'role' => 'Developer'],
        ['name' => 'Victoria Faith', 'role' => 'Researcher'],
    ],
*/
```

<a name="method-shift"></a>
#### `shift()`

`shift` 메서드는 컬렉션에서 첫 번째 항목을 제거하고 반환합니다.

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->shift();

// 1

$collection->all();

// [2, 3, 4, 5]
```

`shift` 메서드에 정수를 전달하면 컬렉션의 앞에서 지정한 개수만큼 항목을 제거해 반환합니다.

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->shift(3);

// collect([1, 2, 3])

$collection->all();

// [4, 5]
```

<a name="method-shuffle"></a>
#### `shuffle()`

`shuffle` 메서드는 컬렉션의 항목을 무작위로 섞어서 반환합니다.

```php
$collection = collect([1, 2, 3, 4, 5]);

$shuffled = $collection->shuffle();

$shuffled->all();

// [3, 2, 5, 1, 4] - (랜덤하게 생성됨)
```

<a name="method-skip"></a>
#### `skip()`

`skip` 메서드는 지정한 개수만큼 처음부터 항목을 건너뛴 새로운 컬렉션을 반환합니다.

```php
$collection = collect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

$collection = $collection->skip(4);

$collection->all();

// [5, 6, 7, 8, 9, 10]
```

<a name="method-skipuntil"></a>
#### `skipUntil()`

`skipUntil` 메서드는 주어진 콜백이 `false`를 반환하는 동안 컬렉션의 항목을 건너뜁니다. 콜백이 처음으로 `true`를 반환하는 시점부터 남은 모든 항목을 새로운 컬렉션으로 반환합니다.

```php
$collection = collect([1, 2, 3, 4]);

$subset = $collection->skipUntil(function (int $item) {
    return $item >= 3;
});

$subset->all();

// [3, 4]
```

또한, 간단한 값을 전달해서 해당 값이 나올 때까지 항목들을 건너뛸 수도 있습니다.

```php
$collection = collect([1, 2, 3, 4]);

$subset = $collection->skipUntil(3);

$subset->all();

// [3, 4]
```

> [!WARNING]
> 지정한 값이 존재하지 않거나 콜백이 한 번도 `true`를 반환하지 않는 경우, `skipUntil` 메서드는 빈 컬렉션을 반환합니다.

<a name="method-skipwhile"></a>
#### `skipWhile()`

`skipWhile` 메서드는 주어진 콜백이 `true`를 반환하는 동안 컬렉션의 항목을 계속 건너뜁니다. 콜백이 처음으로 `false`를 반환하면, 이후 남은 모든 항목을 새로운 컬렉션으로 반환합니다.

```php
$collection = collect([1, 2, 3, 4]);

$subset = $collection->skipWhile(function (int $item) {
    return $item <= 3;
});

$subset->all();

// [4]
```

> [!WARNING]
> 만약 콜백이 한 번도 `false`를 반환하지 않으면, `skipWhile` 메서드는 빈 컬렉션을 반환합니다.

<a name="method-slice"></a>
#### `slice()`

`slice` 메서드는 주어진 인덱스부터 시작하는 컬렉션의 일부(슬라이스)를 반환합니다.

```php
$collection = collect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

$slice = $collection->slice(4);

$slice->all();

// [5, 6, 7, 8, 9, 10]
```

슬라이스의 크기를 제한하고 싶다면, 메서드의 두 번째 인자로 원하는 크기를 전달하세요.

```php
$slice = $collection->slice(4, 2);

$slice->all();

// [5, 6]
```

슬라이스는 기본적으로 키를 유지합니다. 만약 키를 새로 매기고 싶다면 [values](#method-values) 메서드를 사용할 수 있습니다.

<a name="method-sliding"></a>
#### `sliding()`

`sliding` 메서드는 컬렉션의 항목을 "슬라이딩 윈도" 방식으로 연속된 조각(chunk)들로 나눈 새로운 컬렉션을 반환합니다.

```php
$collection = collect([1, 2, 3, 4, 5]);

$chunks = $collection->sliding(2);

$chunks->toArray();

// [[1, 2], [2, 3], [3, 4], [4, 5]]
```

이 기능은 [eachSpread](#method-eachspread) 메서드와 함께 사용할 때 특히 유용합니다.

```php
$transactions->sliding(2)->eachSpread(function (Collection $previous, Collection $current) {
    $current->total = $previous->total + $current->amount;
});
```

옵션으로 두 번째 인자에 "step" 값을 전달해, 각 조각의 첫 번째 항목이 떨어질 간격을 조정할 수 있습니다.

```php
$collection = collect([1, 2, 3, 4, 5]);

$chunks = $collection->sliding(3, step: 2);

$chunks->toArray();

// [[1, 2, 3], [3, 4, 5]]
```

<a name="method-sole"></a>
#### `sole()`

`sole` 메서드는 조건에 정확히 하나의 항목만 통과될 때, 해당 첫 번째 항목을 반환합니다.

```php
collect([1, 2, 3, 4])->sole(function (int $value, int $key) {
    return $value === 2;
});

// 2
```

`sole` 메서드는 키와 값의 쌍을 인자로 받아서, 해당 조건에 정확히 하나만 일치할 경우 그 항목을 반환할 수도 있습니다.

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 100],
]);

$collection->sole('product', 'Chair');

// ['product' => 'Chair', 'price' => 100]
```

또한, 컬렉션에 항목이 단 하나만 있다면 인자 없이 `sole`을 호출하여 바로 그 항목을 가져올 수 있습니다.

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
]);

$collection->sole();

// ['product' => 'Desk', 'price' => 200]
```

컬렉션에 조건을 만족하는 항목이 전혀 없으면 `\Illuminate\Collections\ItemNotFoundException` 예외가 발생하며, 여러 개가 일치하면 `\Illuminate\Collections\MultipleItemsFoundException` 예외가 발생합니다.

<a name="method-some"></a>
#### `some()`

[contains](#method-contains) 메서드의 별칭(alias)입니다.

<a name="method-sort"></a>
#### `sort()`

`sort` 메서드는 컬렉션의 항목을 정렬합니다. 정렬된 컬렉션은 원래 배열의 키를 그대로 유지합니다. 아래 예시처럼 [values](#method-values) 메서드를 함께 사용해 키를 0부터 연속된 인덱스로 재설정할 수 있습니다.

```php
$collection = collect([5, 3, 1, 2, 4]);

$sorted = $collection->sort();

$sorted->values()->all();

// [1, 2, 3, 4, 5]
```

좀 더 복잡한 정렬이 필요하다면 콜백을 넘겨서 자신만의 정렬 알고리즘을 지정할 수도 있습니다. 내부적으로 컬렉션의 `sort` 메서드는 PHP의 [uasort](https://secure.php.net/manual/en/function.uasort.php#refsect1-function.uasort-parameters) 함수를 사용합니다.

> [!NOTE]
> 컬렉션 내부의 배열이나 객체를 정렬하려면 [sortBy](#method-sortby) 또는 [sortByDesc](#method-sortbydesc) 메서드를 참고하세요.

<a name="method-sortby"></a>
#### `sortBy()`

`sortBy` 메서드는 지정한 키를 기준으로 컬렉션을 정렬합니다. 정렬된 컬렉션은 기존의 배열 키를 유지합니다. 아래 예시에서는 [values](#method-values) 메서드로 키를 재설정하여 결과를 확인합니다.

```php
$collection = collect([
    ['name' => 'Desk', 'price' => 200],
    ['name' => 'Chair', 'price' => 100],
    ['name' => 'Bookcase', 'price' => 150],
]);

$sorted = $collection->sortBy('price');

$sorted->values()->all();

/*
    [
        ['name' => 'Chair', 'price' => 100],
        ['name' => 'Bookcase', 'price' => 150],
        ['name' => 'Desk', 'price' => 200],
    ]
*/
```

`sortBy` 메서드는 두 번째 인자로 [정렬 플래그(sort flags)](https://www.php.net/manual/en/function.sort.php)를 받을 수 있습니다.

```php
$collection = collect([
    ['title' => 'Item 1'],
    ['title' => 'Item 12'],
    ['title' => 'Item 3'],
]);

$sorted = $collection->sortBy('title', SORT_NATURAL);

$sorted->values()->all();

/*
    [
        ['title' => 'Item 1'],
        ['title' => 'Item 3'],
        ['title' => 'Item 12'],
    ]
*/
```

또는 자신만의 정렬 기준을 클로저로 전달할 수 있습니다.

```php
$collection = collect([
    ['name' => 'Desk', 'colors' => ['Black', 'Mahogany']],
    ['name' => 'Chair', 'colors' => ['Black']],
    ['name' => 'Bookcase', 'colors' => ['Red', 'Beige', 'Brown']],
]);

$sorted = $collection->sortBy(function (array $product, int $key) {
    return count($product['colors']);
});

$sorted->values()->all();

/*
    [
        ['name' => 'Chair', 'colors' => ['Black']],
        ['name' => 'Desk', 'colors' => ['Black', 'Mahogany']],
        ['name' => 'Bookcase', 'colors' => ['Red', 'Beige', 'Brown']],
    ]
*/
```

여러 속성을 기준으로 정렬하고 싶으면, `sortBy` 메서드에 정렬 작업을 배열로 전달할 수 있습니다. 각 정렬 작업은 정렬 대상 속성과 방향을 배열로 구성합니다.

```php
$collection = collect([
    ['name' => 'Taylor Otwell', 'age' => 34],
    ['name' => 'Abigail Otwell', 'age' => 30],
    ['name' => 'Taylor Otwell', 'age' => 36],
    ['name' => 'Abigail Otwell', 'age' => 32],
]);

$sorted = $collection->sortBy([
    ['name', 'asc'],
    ['age', 'desc'],
]);

$sorted->values()->all();

/*
    [
        ['name' => 'Abigail Otwell', 'age' => 32],
        ['name' => 'Abigail Otwell', 'age' => 30],
        ['name' => 'Taylor Otwell', 'age' => 36],
        ['name' => 'Taylor Otwell', 'age' => 34],
    ]
*/
```

여러 속성 기준의 정렬에서도 아래처럼 각 기준을 정의하는 클로저를 전달할 수 있습니다.

```php
$collection = collect([
    ['name' => 'Taylor Otwell', 'age' => 34],
    ['name' => 'Abigail Otwell', 'age' => 30],
    ['name' => 'Taylor Otwell', 'age' => 36],
    ['name' => 'Abigail Otwell', 'age' => 32],
]);

$sorted = $collection->sortBy([
    fn (array $a, array $b) => $a['name'] <=> $b['name'],
    fn (array $a, array $b) => $b['age'] <=> $a['age'],
]);

$sorted->values()->all();

/*
    [
        ['name' => 'Abigail Otwell', 'age' => 32],
        ['name' => 'Abigail Otwell', 'age' => 30],
        ['name' => 'Taylor Otwell', 'age' => 36],
        ['name' => 'Taylor Otwell', 'age' => 34],
    ]
*/
```

#### `sortByDesc()`

이 메서드는 [sortBy](#method-sortby) 메서드와 동일한 시그니처를 가지지만, 컬렉션을 반대 순서로 정렬합니다.

<a name="method-sortdesc"></a>
#### `sortDesc()`

이 메서드는 [sort](#method-sort) 메서드와 반대 순서로 컬렉션을 정렬합니다.

```php
$collection = collect([5, 3, 1, 2, 4]);

$sorted = $collection->sortDesc();

$sorted->values()->all();

// [5, 4, 3, 2, 1]
```

`sort`와는 다르게, `sortDesc`에는 클로저를 전달할 수 없습니다. 직접 비교를 뒤집고 싶다면 [sort](#method-sort) 메서드를 사용해야 합니다.

<a name="method-sortkeys"></a>
#### `sortKeys()`

`sortKeys` 메서드는 컬렉션을 내부의 연관 배열의 키 기준으로 정렬합니다.

```php
$collection = collect([
    'id' => 22345,
    'first' => 'John',
    'last' => 'Doe',
]);

$sorted = $collection->sortKeys();

$sorted->all();

/*
    [
        'first' => 'John',
        'id' => 22345,
        'last' => 'Doe',
    ]
*/
```

<a name="method-sortkeysdesc"></a>
#### `sortKeysDesc()`

이 메서드는 [sortKeys](#method-sortkeys) 메서드와 동일한 시그니처를 가지지만, 반대 순서로 컬렉션을 정렬합니다.

<a name="method-sortkeysusing"></a>
#### `sortKeysUsing()`

`sortKeysUsing` 메서드는 주어진 콜백 함수를 사용하여 내부 연관 배열의 키 기준으로 컬렉션을 정렬합니다.

```php
$collection = collect([
    'ID' => 22345,
    'first' => 'John',
    'last' => 'Doe',
]);

$sorted = $collection->sortKeysUsing('strnatcasecmp');

$sorted->all();

/*
    [
        'first' => 'John',
        'ID' => 22345,
        'last' => 'Doe',
    ]
*/
```

콜백 함수는 반드시 0보다 작거나 같거나 큰 정수를 반환하는 비교 함수여야 합니다. 자세한 내용은 PHP 공식 문서의 [uksort](https://www.php.net/manual/en/function.uksort.php#refsect1-function.uksort-parameters) 항목을 참고하세요. 이 메서드는 내부적으로 PHP의 `uksort` 함수를 사용합니다.

<a name="method-splice"></a>
#### `splice()`

`splice` 메서드는 지정한 인덱스부터 항목 일부를 잘라내어 반환합니다.

```php
$collection = collect([1, 2, 3, 4, 5]);

$chunk = $collection->splice(2);

$chunk->all();

// [3, 4, 5]

$collection->all();

// [1, 2]
```

두 번째 인수를 전달해 반환되는 컬렉션의 크기를 제한할 수도 있습니다.

```php
$collection = collect([1, 2, 3, 4, 5]);

$chunk = $collection->splice(2, 1);

$chunk->all();

// [3]

$collection->all();

// [1, 2, 4, 5]
```

또한 세 번째 인수로 잘라낸 항목을 대체할 새 항목 배열을 전달할 수 있습니다.

```php
$collection = collect([1, 2, 3, 4, 5]);

$chunk = $collection->splice(2, 1, [10, 11]);

$chunk->all();

// [3]

$collection->all();

// [1, 2, 10, 11, 4, 5]
```

<a name="method-split"></a>
#### `split()`

`split` 메서드는 컬렉션을 지정한 개수의 그룹으로 분할합니다.

```php
$collection = collect([1, 2, 3, 4, 5]);

$groups = $collection->split(3);

$groups->all();

// [[1, 2], [3, 4], [5]]
```

<a name="method-splitin"></a>
#### `splitIn()`

`splitIn` 메서드는 컬렉션을 지정한 개수의 그룹으로 분할합니다. 이때 마지막 그룹을 제외한 나머지 그룹들을 모두 완전히 채우고, 나머지는 마지막 그룹에 할당합니다.

```php
$collection = collect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

$groups = $collection->splitIn(3);

$groups->all();

// [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10]]
```

<a name="method-sum"></a>
#### `sum()`

`sum` 메서드는 컬렉션 내 모든 항목의 합계를 반환합니다.

```php
collect([1, 2, 3, 4, 5])->sum();

// 15
```

컬렉션에 중첩 배열이나 객체가 포함된 경우, 어떤 값을 합산할지 결정하는 키를 전달할 수 있습니다.

```php
$collection = collect([
    ['name' => 'JavaScript: The Good Parts', 'pages' => 176],
    ['name' => 'JavaScript: The Definitive Guide', 'pages' => 1096],
]);

$collection->sum('pages');

// 1272
```

또한 직접 콜백을 전달하여, 어떤 값을 더할지 정할 수도 있습니다.

```php
$collection = collect([
    ['name' => 'Chair', 'colors' => ['Black']],
    ['name' => 'Desk', 'colors' => ['Black', 'Mahogany']],
    ['name' => 'Bookcase', 'colors' => ['Red', 'Beige', 'Brown']],
]);

$collection->sum(function (array $product) {
    return count($product['colors']);
});

// 6
```

<a name="method-take"></a>
#### `take()`

`take` 메서드는 지정한 개수만큼의 항목으로 이루어진 새 컬렉션을 반환합니다.

```php
$collection = collect([0, 1, 2, 3, 4, 5]);

$chunk = $collection->take(3);

$chunk->all();

// [0, 1, 2]
```

음수 값을 전달하면 컬렉션의 끝에서부터 지정한 개수만큼 반환됩니다.

```php
$collection = collect([0, 1, 2, 3, 4, 5]);

$chunk = $collection->take(-2);

$chunk->all();

// [4, 5]
```

<a name="method-takeuntil"></a>
#### `takeUntil()`

`takeUntil` 메서드는 주어진 콜백이 `true`를 반환하기 전까지 컬렉션의 항목을 가져옵니다.

```php
$collection = collect([1, 2, 3, 4]);

$subset = $collection->takeUntil(function (int $item) {
    return $item >= 3;
});

$subset->all();

// [1, 2]
```

콜백 대신 특정 값을 전달하면, 해당 값이 나올 때까지 항목을 가져올 수도 있습니다.

```php
$collection = collect([1, 2, 3, 4]);

$subset = $collection->takeUntil(3);

$subset->all();

// [1, 2]
```

> [!WARNING]
> 만약 주어진 값이 컬렉션에 없거나, 콜백이 한 번도 `true`를 반환하지 않는다면, `takeUntil` 메서드는 컬렉션의 모든 항목을 반환합니다.

<a name="method-takewhile"></a>
#### `takeWhile()`

`takeWhile` 메서드는 주어진 콜백이 `false`를 반환할 때까지 컬렉션의 항목을 가져옵니다.

```php
$collection = collect([1, 2, 3, 4]);

$subset = $collection->takeWhile(function (int $item) {
    return $item < 3;
});

$subset->all();

// [1, 2]
```

> [!WARNING]
> 콜백이 한 번도 `false`를 반환하지 않으면, `takeWhile` 메서드는 컬렉션의 모든 항목을 반환합니다.

<a name="method-tap"></a>
#### `tap()`

`tap` 메서드는 컬렉션을 주어진 콜백에 전달해, 컬렉션을 중간에 "탭"하여 무언가 작업을 수행할 수 있게 하고, 이 작업이 끝난 뒤 컬렉션을 그대로 반환합니다.

```php
collect([2, 4, 3, 1, 5])
    ->sort()
    ->tap(function (Collection $collection) {
        Log::debug('Values after sorting', $collection->values()->all());
    })
    ->shift();

// 1
```

<a name="method-times"></a>
#### `times()`

정적 메서드인 `times`는 주어진 클로저를 지정한 횟수만큼 호출하여 새로운 컬렉션을 생성합니다.

```php
$collection = Collection::times(10, function (int $number) {
    return $number * 9;
});

$collection->all();

// [9, 18, 27, 36, 45, 54, 63, 72, 81, 90]
```

<a name="method-toarray"></a>
#### `toArray()`

`toArray` 메서드는 컬렉션을 일반 PHP `array`로 변환합니다. 만약 컬렉션의 값이 [Eloquent](/docs/eloquent) 모델이라면, 모델도 배열로 변환됩니다.

```php
$collection = collect(['name' => 'Desk', 'price' => 200]);

$collection->toArray();

/*
    [
        ['name' => 'Desk', 'price' => 200],
    ]
*/
```

> [!WARNING]
> `toArray`는 컬렉션 내에 `Arrayable`인 중첩 객체도 전부 배열로 변환합니다. 컬렉션의 내부 원시 배열을 그대로 얻고 싶다면 [all](#method-all) 메서드를 사용하세요.

<a name="method-tojson"></a>
#### `toJson()`

`toJson` 메서드는 컬렉션을 JSON 직렬화된 문자열로 변환합니다.

```php
$collection = collect(['name' => 'Desk', 'price' => 200]);

$collection->toJson();

// '{"name":"Desk", "price":200}'
```

<a name="method-transform"></a>
#### `transform()`

`transform` 메서드는 컬렉션을 반복(iterate)하면서 각 항목을 콜백에 전달하고, 콜백이 반환한 값으로 해당 항목을 대체합니다.

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->transform(function (int $item, int $key) {
    return $item * 2;
});

$collection->all();

// [2, 4, 6, 8, 10]
```

> [!WARNING]
> 대부분의 다른 컬렉션 메서드와 달리, `transform`은 컬렉션 자신을 변경(modify)합니다. 새로운 컬렉션을 생성하고 싶다면 [map](#method-map) 메서드를 사용하세요.

<a name="method-undot"></a>
#### `undot()`

`undot` 메서드는 "도트(dot) 표기법"을 사용한 단일 차원 컬렉션을 다차원 컬렉션으로 확장합니다.

```php
$person = collect([
    'name.first_name' => 'Marie',
    'name.last_name' => 'Valentine',
    'address.line_1' => '2992 Eagle Drive',
    'address.line_2' => '',
    'address.suburb' => 'Detroit',
    'address.state' => 'MI',
    'address.postcode' => '48219'
]);

$person = $person->undot();

$person->toArray();

/*
    [
        "name" => [
            "first_name" => "Marie",
            "last_name" => "Valentine",
        ],
        "address" => [
            "line_1" => "2992 Eagle Drive",
            "line_2" => "",
            "suburb" => "Detroit",
            "state" => "MI",
            "postcode" => "48219",
        ],
    ]
*/
```

<a name="method-union"></a>
#### `union()`

`union` 메서드는 주어진 배열을 컬렉션에 더합니다. 만약 추가되는 배열에 기존 컬렉션과 동일한 키가 있다면, 기존 컬렉션의 값이 우선적으로 유지됩니다.

```php
$collection = collect([1 => ['a'], 2 => ['b']]);

$union = $collection->union([3 => ['c'], 1 => ['d']]);

$union->all();

// [1 => ['a'], 2 => ['b'], 3 => ['c']]
```

<a name="method-unique"></a>
#### `unique()`

`unique` 메서드는 컬렉션의 중복 항목을 제거하고, 고유한 항목만 반환합니다. 반환된 컬렉션에는 원래 배열의 키가 그대로 유지되므로, 아래 예시에서는 [values](#method-values) 메서드로 키를 연속적인 숫자로 재설정하고 있습니다.

```php
$collection = collect([1, 1, 2, 2, 3, 4, 2]);

$unique = $collection->unique();

$unique->values()->all();

// [1, 2, 3, 4]
```

중첩 배열이나 객체가 포함된 경우, 고유성을 판단할 때 사용할 키를 지정할 수 있습니다.

```php
$collection = collect([
    ['name' => 'iPhone 6', 'brand' => 'Apple', 'type' => 'phone'],
    ['name' => 'iPhone 5', 'brand' => 'Apple', 'type' => 'phone'],
    ['name' => 'Apple Watch', 'brand' => 'Apple', 'type' => 'watch'],
    ['name' => 'Galaxy S6', 'brand' => 'Samsung', 'type' => 'phone'],
    ['name' => 'Galaxy Gear', 'brand' => 'Samsung', 'type' => 'watch'],
]);

$unique = $collection->unique('brand');

$unique->values()->all();

/*
    [
        ['name' => 'iPhone 6', 'brand' => 'Apple', 'type' => 'phone'],
        ['name' => 'Galaxy S6', 'brand' => 'Samsung', 'type' => 'phone'],
    ]
*/
```

마지막으로, 항목의 고유성을 판단하는 값을 직접 지정하려면 클로저를 `unique` 메서드에 전달할 수 있습니다.

```php
$unique = $collection->unique(function (array $item) {
    return $item['brand'].$item['type'];
});

$unique->values()->all();

/*
    [
        ['name' => 'iPhone 6', 'brand' => 'Apple', 'type' => 'phone'],
        ['name' => 'Apple Watch', 'brand' => 'Apple', 'type' => 'watch'],
        ['name' => 'Galaxy S6', 'brand' => 'Samsung', 'type' => 'phone'],
        ['name' => 'Galaxy Gear', 'brand' => 'Samsung', 'type' => 'watch'],
    ]
*/
```

`unique` 메서드는 항목 값을 비교할 때 "느슨한(loose) 비교"를 사용합니다. 즉, 값이 동일한 문자열과 숫자는 같은 값으로 간주합니다. 보다 엄격한 비교를 하고 싶다면 [uniqueStrict](#method-uniquestrict) 메서드를 사용하세요.

> [!NOTE]
> 이 메서드는 [Eloquent 컬렉션](/docs/eloquent-collections#method-unique)에서 동작 방식이 달라집니다.

<a name="method-uniquestrict"></a>
#### `uniqueStrict()`

이 메서드는 [unique](#method-unique) 메서드와 동일한 시그니처를 가지지만, 모든 값을 "엄격(strict) 비교"로 필터링합니다.

<a name="method-unless"></a>
#### `unless()`

`unless` 메서드는 첫 번째 인수가 `true`로 평가되지 않을 때 주어진 콜백을 실행합니다. 이 콜백에는 컬렉션 인스턴스와 `unless` 메서드에 전달한 첫 번째 인수가 함께 전달됩니다.

```php
$collection = collect([1, 2, 3]);

$collection->unless(true, function (Collection $collection, bool $value) {
    return $collection->push(4);
});

$collection->unless(false, function (Collection $collection, bool $value) {
    return $collection->push(5);
});

$collection->all();

// [1, 2, 3, 5]
```

`unless` 메서드에는 두 번째 콜백도 전달할 수 있습니다. 이 두 번째 콜백은 첫 번째 인수가 `true`로 평가될 때 실행됩니다.

```php
$collection = collect([1, 2, 3]);

$collection->unless(true, function (Collection $collection, bool $value) {
    return $collection->push(4);
}, function (Collection $collection, bool $value) {
    return $collection->push(5);
});

$collection->all();

// [1, 2, 3, 5]
```

`unless`의 반대 동작을 원한다면 [when](#method-when) 메서드를 참고하세요.

<a name="method-unlessempty"></a>
#### `unlessEmpty()`

[whenNotEmpty](#method-whennotempty) 메서드의 별칭입니다.

<a name="method-unlessnotempty"></a>
#### `unlessNotEmpty()`

[whenEmpty](#method-whenempty) 메서드의 별칭입니다.

<a name="method-unwrap"></a>
#### `unwrap()`

정적 메서드 `unwrap`은 가능하다면 주어진 값에서 컬렉션의 내부 항목을 반환합니다.

```php
Collection::unwrap(collect('John Doe'));

// ['John Doe']

Collection::unwrap(['John Doe']);

// ['John Doe']

Collection::unwrap('John Doe');

// 'John Doe'
```

<a name="method-value"></a>
#### `value()`

`value` 메서드는 컬렉션의 첫 번째 요소에서 지정한 값을 반환합니다.

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Speaker', 'price' => 400],
]);

$value = $collection->value('price');

// 200
```

<a name="method-values"></a>

#### `values()`

`values` 메서드는 키를 0부터 시작하는 연속된 정수로 재설정한 새로운 컬렉션을 반환합니다.

```php
$collection = collect([
    10 => ['product' => 'Desk', 'price' => 200],
    11 => ['product' => 'Desk', 'price' => 200],
]);

$values = $collection->values();

$values->all();

/*
    [
        0 => ['product' => 'Desk', 'price' => 200],
        1 => ['product' => 'Desk', 'price' => 200],
    ]
*/
```

<a name="method-when"></a>
#### `when()`

`when` 메서드는 첫 번째 인자로 전달된 값이 `true`로 평가될 때 주어진 콜백을 실행합니다. 이 때, 컬렉션 인스턴스와 `when` 메서드에 전달된 첫 번째 인자가 클로저에 전달됩니다.

```php
$collection = collect([1, 2, 3]);

$collection->when(true, function (Collection $collection, bool $value) {
    return $collection->push(4);
});

$collection->when(false, function (Collection $collection, bool $value) {
    return $collection->push(5);
});

$collection->all();

// [1, 2, 3, 4]
```

`when` 메서드에는 두 번째 콜백을 전달할 수도 있습니다. 이 두 번째 콜백은 첫 번째 인자가 `false`로 평가될 때 실행됩니다.

```php
$collection = collect([1, 2, 3]);

$collection->when(false, function (Collection $collection, bool $value) {
    return $collection->push(4);
}, function (Collection $collection, bool $value) {
    return $collection->push(5);
});

$collection->all();

// [1, 2, 3, 5]
```

`when`의 반대 동작을 원한다면 [unless](#method-unless) 메서드를 참조하세요.

<a name="method-whenempty"></a>
#### `whenEmpty()`

`whenEmpty` 메서드는 컬렉션이 비어 있을 때 주어진 콜백을 실행합니다.

```php
$collection = collect(['Michael', 'Tom']);

$collection->whenEmpty(function (Collection $collection) {
    return $collection->push('Adam');
});

$collection->all();

// ['Michael', 'Tom']

$collection = collect();

$collection->whenEmpty(function (Collection $collection) {
    return $collection->push('Adam');
});

$collection->all();

// ['Adam']
```

또한, `whenEmpty` 메서드에는 컬렉션이 비어있지 않을 때 실행되는 두 번째 클로저를 전달할 수도 있습니다.

```php
$collection = collect(['Michael', 'Tom']);

$collection->whenEmpty(function (Collection $collection) {
    return $collection->push('Adam');
}, function (Collection $collection) {
    return $collection->push('Taylor');
});

$collection->all();

// ['Michael', 'Tom', 'Taylor']
```

`whenEmpty`의 반대 동작을 원한다면 [whenNotEmpty](#method-whennotempty) 메서드를 참조하세요.

<a name="method-whennotempty"></a>
#### `whenNotEmpty()`

`whenNotEmpty` 메서드는 컬렉션이 비어 있지 않을 때 주어진 콜백을 실행합니다.

```php
$collection = collect(['michael', 'tom']);

$collection->whenNotEmpty(function (Collection $collection) {
    return $collection->push('adam');
});

$collection->all();

// ['michael', 'tom', 'adam']

$collection = collect();

$collection->whenNotEmpty(function (Collection $collection) {
    return $collection->push('adam');
});

$collection->all();

// []
```

또한, `whenNotEmpty` 메서드에는 컬렉션이 비어 있을 때 실행되는 두 번째 클로저를 전달할 수 있습니다.

```php
$collection = collect();

$collection->whenNotEmpty(function (Collection $collection) {
    return $collection->push('adam');
}, function (Collection $collection) {
    return $collection->push('taylor');
});

$collection->all();

// ['taylor']
```

`whenNotEmpty`와 반대 동작을 원하신다면 [whenEmpty](#method-whenempty) 메서드를 참고하세요.

<a name="method-where"></a>
#### `where()`

`where` 메서드는 주어진 키/값 쌍으로 컬렉션을 필터링합니다.

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 100],
    ['product' => 'Bookcase', 'price' => 150],
    ['product' => 'Door', 'price' => 100],
]);

$filtered = $collection->where('price', 100);

$filtered->all();

/*
    [
        ['product' => 'Chair', 'price' => 100],
        ['product' => 'Door', 'price' => 100],
    ]
*/
```

`where` 메서드는 아이템 값을 비교할 때 "느슨한(loose)" 비교를 사용합니다. 즉, 문자열로 된 숫자와 정수 값이 같다고 판단할 수 있습니다. "엄격한(strict)" 비교를 위해서는 [whereStrict](#method-wherestrict) 메서드를 사용하세요.

또한, 두 번째 인자로 비교 연산자를 전달할 수 있습니다. 지원되는 연산자: `===`, `!==`, `!=`, `==`, `=`, `<>`, `>`, `<`, `>=`, `<=`.

```php
$collection = collect([
    ['name' => 'Jim', 'deleted_at' => '2019-01-01 00:00:00'],
    ['name' => 'Sally', 'deleted_at' => '2019-01-02 00:00:00'],
    ['name' => 'Sue', 'deleted_at' => null],
]);

$filtered = $collection->where('deleted_at', '!=', null);

$filtered->all();

/*
    [
        ['name' => 'Jim', 'deleted_at' => '2019-01-01 00:00:00'],
        ['name' => 'Sally', 'deleted_at' => '2019-01-02 00:00:00'],
    ]
*/
```

<a name="method-wherestrict"></a>
#### `whereStrict()`

이 메서드는 [where](#method-where) 메서드와 동일한 시그니처를 가지지만, 모든 값 비교를 "엄격한(strict)" 방식으로 수행합니다.

<a name="method-wherebetween"></a>
#### `whereBetween()`

`whereBetween` 메서드는 지정한 아이템 값이 주어진 범위 안에 있는지에 따라 컬렉션을 필터링합니다.

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 80],
    ['product' => 'Bookcase', 'price' => 150],
    ['product' => 'Pencil', 'price' => 30],
    ['product' => 'Door', 'price' => 100],
]);

$filtered = $collection->whereBetween('price', [100, 200]);

$filtered->all();

/*
    [
        ['product' => 'Desk', 'price' => 200],
        ['product' => 'Bookcase', 'price' => 150],
        ['product' => 'Door', 'price' => 100],
    ]
*/
```

<a name="method-wherein"></a>
#### `whereIn()`

`whereIn` 메서드는 컬렉션에서 주어진 배열 안에 포함된 값이 아닌 아이템을 제거합니다.

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 100],
    ['product' => 'Bookcase', 'price' => 150],
    ['product' => 'Door', 'price' => 100],
]);

$filtered = $collection->whereIn('price', [150, 200]);

$filtered->all();

/*
    [
        ['product' => 'Desk', 'price' => 200],
        ['product' => 'Bookcase', 'price' => 150],
    ]
*/
```

`whereIn` 메서드 또한 값 비교에 "느슨한(loose)" 비교를 사용합니다. 보다 엄격한 비교를 원할 경우 [whereInStrict](#method-whereinstrict) 메서드를 사용하세요.

<a name="method-whereinstrict"></a>
#### `whereInStrict()`

이 메서드는 [whereIn](#method-wherein)과 동일한 시그니처를 가지지만, 값 비교는 "엄격한(strict)" 모드로 실행됩니다.

<a name="method-whereinstanceof"></a>
#### `whereInstanceOf()`

`whereInstanceOf` 메서드는 주어진 클래스 타입으로 컬렉션을 필터링합니다.

```php
use App\Models\User;
use App\Models\Post;

$collection = collect([
    new User,
    new User,
    new Post,
]);

$filtered = $collection->whereInstanceOf(User::class);

$filtered->all();

// [App\Models\User, App\Models\User]
```

<a name="method-wherenotbetween"></a>
#### `whereNotBetween()`

`whereNotBetween` 메서드는 지정한 아이템 값이 주어진 범위 밖에 있는지에 따라 컬렉션을 필터링합니다.

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 80],
    ['product' => 'Bookcase', 'price' => 150],
    ['product' => 'Pencil', 'price' => 30],
    ['product' => 'Door', 'price' => 100],
]);

$filtered = $collection->whereNotBetween('price', [100, 200]);

$filtered->all();

/*
    [
        ['product' => 'Chair', 'price' => 80],
        ['product' => 'Pencil', 'price' => 30],
    ]
*/
```

<a name="method-wherenotin"></a>
#### `whereNotIn()`

`whereNotIn` 메서드는 주어진 배열 안에 포함된 값과 일치하는 아이템을 컬렉션에서 제거합니다.

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 100],
    ['product' => 'Bookcase', 'price' => 150],
    ['product' => 'Door', 'price' => 100],
]);

$filtered = $collection->whereNotIn('price', [150, 200]);

$filtered->all();

/*
    [
        ['product' => 'Chair', 'price' => 100],
        ['product' => 'Door', 'price' => 100],
    ]
*/
```

`whereNotIn` 메서드 역시 값 비교에 "느슨한(loose)" 비교를 사용합니다. 보다 엄격히 비교하려면 [whereNotInStrict](#method-wherenotinstrict) 메서드를 이용하세요.

<a name="method-wherenotinstrict"></a>
#### `whereNotInStrict()`

이 메서드는 [whereNotIn](#method-wherenotin)과 동일한 시그니처를 가지며, 값 비교는 "엄격한(strict)" 방식으로 진행됩니다.

<a name="method-wherenotnull"></a>
#### `whereNotNull()`

`whereNotNull` 메서드는 주어진 키의 값이 `null`이 아닌 아이템들만 반환합니다.

```php
$collection = collect([
    ['name' => 'Desk'],
    ['name' => null],
    ['name' => 'Bookcase'],
]);

$filtered = $collection->whereNotNull('name');

$filtered->all();

/*
    [
        ['name' => 'Desk'],
        ['name' => 'Bookcase'],
    ]
*/
```

<a name="method-wherenull"></a>
#### `whereNull()`

`whereNull` 메서드는 주어진 키의 값이 `null`인 아이템들만 반환합니다.

```php
$collection = collect([
    ['name' => 'Desk'],
    ['name' => null],
    ['name' => 'Bookcase'],
]);

$filtered = $collection->whereNull('name');

$filtered->all();

/*
    [
        ['name' => null],
    ]
*/
```

<a name="method-wrap"></a>
#### `wrap()`

정적 메서드인 `wrap`은 주어진 값을 적절하게 컬렉션으로 감쌉니다.

```php
use Illuminate\Support\Collection;

$collection = Collection::wrap('John Doe');

$collection->all();

// ['John Doe']

$collection = Collection::wrap(['John Doe']);

$collection->all();

// ['John Doe']

$collection = Collection::wrap(collect('John Doe'));

$collection->all();

// ['John Doe']
```

<a name="method-zip"></a>
#### `zip()`

`zip` 메서드는 원래 컬렉션의 값과 전달된 배열의 값을 같은 인덱스끼리 묶어서 병합합니다.

```php
$collection = collect(['Chair', 'Desk']);

$zipped = $collection->zip([100, 200]);

$zipped->all();

// [['Chair', 100], ['Desk', 200]]
```

<a name="higher-order-messages"></a>
## 하이어 오더 메시지(Higher Order Messages)

컬렉션은 "하이어 오더 메시지(higher order messages)"도 지원합니다. 이는 컬렉션에서 자주 사용되는 동작을 간단하게 수행할 수 있는 단축 방법입니다. 하이어 오더 메시지를 지원하는 컬렉션 메서드에는 다음과 같은 것들이 있습니다: [average](#method-average), [avg](#method-avg), [contains](#method-contains), [each](#method-each), [every](#method-every), [filter](#method-filter), [first](#method-first), [flatMap](#method-flatmap), [groupBy](#method-groupby), [keyBy](#method-keyby), [map](#method-map), [max](#method-max), [min](#method-min), [partition](#method-partition), [reject](#method-reject), [skipUntil](#method-skipuntil), [skipWhile](#method-skipwhile), [some](#method-some), [sortBy](#method-sortby), [sortByDesc](#method-sortbydesc), [sum](#method-sum), [takeUntil](#method-takeuntil), [takeWhile](#method-takewhile), [unique](#method-unique).

각 하이어 오더 메시지는 컬렉션 인스턴스에서 동적 속성처럼 접근할 수 있습니다. 예를 들어, 아래와 같이 컬렉션에 담긴 각 객체의 메서드를 호출할 때 `each` 하이어 오더 메시지를 사용할 수 있습니다.

```php
use App\Models\User;

$users = User::where('votes', '>', 500)->get();

$users->each->markAsVip();
```

마찬가지로, 컬렉션에 담긴 모든 유저의 "votes" 합계를 `sum` 하이어 오더 메시지로 구할 수도 있습니다.

```php
$users = User::where('group', 'Development')->get();

return $users->sum->votes;
```

<a name="lazy-collections"></a>
## 레이지 컬렉션(Lazy Collections)

<a name="lazy-collection-introduction"></a>
### 소개

> [!WARNING]
> 라라벨의 레이지 컬렉션을 학습하기 전에 [PHP 제너레이터(PHP generators)](https://www.php.net/manual/en/language.generators.overview.php)를 먼저 알아두는 것을 추천합니다.

기존의 강력한 `Collection` 클래스와 더불어 `LazyCollection` 클래스는 PHP의 [제너레이터(generator)](https://www.php.net/manual/en/language.generators.overview.php)를 활용하여, 매우 큰 데이터셋을 메모리 사용을 최소화하며 다룰 수 있게 해줍니다.

예를 들어, 애플리케이션에서 수 기가바이트 크기의 로그 파일을 읽고, 라라벨의 컬렉션 메서드로 로그를 처리해야 한다고 가정해 봅시다. 파일 전체를 한 번에 메모리에 올리는 대신, 레이지 컬렉션을 사용하면 한 번에 파일의 일부 조각만 메모리에 적재하면서 처리할 수 있습니다.

```php
use App\Models\LogEntry;
use Illuminate\Support\LazyCollection;

LazyCollection::make(function () {
    $handle = fopen('log.txt', 'r');

    while (($line = fgets($handle)) !== false) {
        yield $line;
    }

    fclose($handle);
})->chunk(4)->map(function (array $lines) {
    return LogEntry::fromLines($lines);
})->each(function (LogEntry $logEntry) {
    // 로그 엔트리 처리...
});
```

또는, 1만 개의 Eloquent 모델을 반복 처리해야 할 상황이라면, 기존 컬렉션을 사용할 때는 1만 개의 Eloquent 모델 전체를 한 번에 메모리에 올려야 했습니다.

```php
use App\Models\User;

$users = User::all()->filter(function (User $user) {
    return $user->id > 500;
});
```

하지만 쿼리 빌더의 `cursor` 메서드는 `LazyCollection` 인스턴스를 반환합니다. 즉, 데이터베이스 쿼리를 한 번만 실행하면서, 동시에 메모리에는 한 번에 한 개의 Eloquent 모델만 유지할 수 있습니다. 아래 예제에서 `filter` 콜백은 각 유저를 직접 순회할 때까지 실제로 실행되지 않아, 메모리 사용량을 크게 줄일 수 있습니다.

```php
use App\Models\User;

$users = User::cursor()->filter(function (User $user) {
    return $user->id > 500;
});

foreach ($users as $user) {
    echo $user->id;
}
```

<a name="creating-lazy-collections"></a>
### 레이지 컬렉션 인스턴스 생성

레이지 컬렉션 인스턴스를 생성하려면 PHP의 제너레이터 함수를 컬렉션의 `make` 메서드에 전달하면 됩니다.

```php
use Illuminate\Support\LazyCollection;

LazyCollection::make(function () {
    $handle = fopen('log.txt', 'r');

    while (($line = fgets($handle)) !== false) {
        yield $line;
    }

    fclose($handle);
});
```

<a name="the-enumerable-contract"></a>
### Enumerable 계약

`Collection` 클래스에서 사용할 수 있는 거의 모든 메서드는 `LazyCollection` 클래스에서도 사용할 수 있습니다. 두 클래스 모두 `Illuminate\Support\Enumerable` 계약(Contract)을 구현하고 있으며, 여기에 정의된 메서드는 다음과 같습니다:

<div class="collection-method-list" markdown="1">

[all](#method-all)
[average](#method-average)
[avg](#method-avg)
[chunk](#method-chunk)
[chunkWhile](#method-chunkwhile)
[collapse](#method-collapse)
[collect](#method-collect)
[combine](#method-combine)
[concat](#method-concat)
[contains](#method-contains)
[containsStrict](#method-containsstrict)
[count](#method-count)
[countBy](#method-countBy)
[crossJoin](#method-crossjoin)
[dd](#method-dd)
[diff](#method-diff)
[diffAssoc](#method-diffassoc)
[diffKeys](#method-diffkeys)
[dump](#method-dump)
[duplicates](#method-duplicates)
[duplicatesStrict](#method-duplicatesstrict)
[each](#method-each)
[eachSpread](#method-eachspread)
[every](#method-every)
[except](#method-except)
[filter](#method-filter)
[first](#method-first)
[firstOrFail](#method-first-or-fail)
[firstWhere](#method-first-where)
[flatMap](#method-flatmap)
[flatten](#method-flatten)
[flip](#method-flip)
[forPage](#method-forpage)
[get](#method-get)
[groupBy](#method-groupby)
[has](#method-has)
[implode](#method-implode)
[intersect](#method-intersect)
[intersectAssoc](#method-intersectAssoc)
[intersectByKeys](#method-intersectbykeys)
[isEmpty](#method-isempty)
[isNotEmpty](#method-isnotempty)
[join](#method-join)
[keyBy](#method-keyby)
[keys](#method-keys)
[last](#method-last)
[macro](#method-macro)
[make](#method-make)
[map](#method-map)
[mapInto](#method-mapinto)
[mapSpread](#method-mapspread)
[mapToGroups](#method-maptogroups)
[mapWithKeys](#method-mapwithkeys)
[max](#method-max)
[median](#method-median)
[merge](#method-merge)
[mergeRecursive](#method-mergerecursive)
[min](#method-min)
[mode](#method-mode)
[nth](#method-nth)
[only](#method-only)
[pad](#method-pad)
[partition](#method-partition)
[pipe](#method-pipe)
[pluck](#method-pluck)
[random](#method-random)
[reduce](#method-reduce)
[reject](#method-reject)
[replace](#method-replace)
[replaceRecursive](#method-replacerecursive)
[reverse](#method-reverse)
[search](#method-search)
[shuffle](#method-shuffle)
[skip](#method-skip)
[slice](#method-slice)
[sole](#method-sole)
[some](#method-some)
[sort](#method-sort)
[sortBy](#method-sortby)
[sortByDesc](#method-sortbydesc)
[sortKeys](#method-sortkeys)
[sortKeysDesc](#method-sortkeysdesc)
[split](#method-split)
[sum](#method-sum)
[take](#method-take)
[tap](#method-tap)
[times](#method-times)
[toArray](#method-toarray)
[toJson](#method-tojson)
[union](#method-union)
[unique](#method-unique)
[uniqueStrict](#method-uniquestrict)
[unless](#method-unless)
[unlessEmpty](#method-unlessempty)
[unlessNotEmpty](#method-unlessnotempty)
[unwrap](#method-unwrap)
[values](#method-values)
[when](#method-when)
[whenEmpty](#method-whenempty)
[whenNotEmpty](#method-whennotempty)
[where](#method-where)
[whereStrict](#method-wherestrict)
[whereBetween](#method-wherebetween)
[whereIn](#method-wherein)
[whereInStrict](#method-whereinstrict)
[whereInstanceOf](#method-whereinstanceof)
[whereNotBetween](#method-wherenotbetween)
[whereNotIn](#method-wherenotin)
[whereNotInStrict](#method-wherenotinstrict)
[wrap](#method-wrap)
[zip](#method-zip)

</div>

> [!WARNING]
> 컬렉션을 변경하는 메서드(예: `shift`, `pop`, `prepend` 등)는 `LazyCollection` 클래스에서는 **지원되지 않습니다**.

<a name="lazy-collection-methods"></a>

### 지연 컬렉션(Lazy Collection) 메서드

`Enumerable` 인터페이스에 정의된 메서드 외에도, `LazyCollection` 클래스는 다음과 같은 메서드들을 제공합니다.

<a name="method-takeUntilTimeout"></a>
#### `takeUntilTimeout()`

`takeUntilTimeout` 메서드는 지정한 시간까지 값들을 열거(enumerate)하는 새로운 지연 컬렉션을 반환합니다. 설정한 시간이 지나면, 컬렉션의 값 열거가 중단됩니다.

```php
$lazyCollection = LazyCollection::times(INF)
    ->takeUntilTimeout(now()->addMinute());

$lazyCollection->each(function (int $number) {
    dump($number);

    sleep(1);
});

// 1
// 2
// ...
// 58
// 59
```

이 메서드의 사용 예시로, 데이터베이스에서 커서를 이용해 송장(invoice)을 전송하는 애플리케이션을 생각해볼 수 있습니다. 매 15분마다 실행되는 [예약 작업](/docs/scheduling)을 정의해서, 최대 14분 동안만 송장 처리를 진행하도록 할 수 있습니다.

```php
use App\Models\Invoice;
use Illuminate\Support\Carbon;

Invoice::pending()->cursor()
    ->takeUntilTimeout(
        Carbon::createFromTimestamp(LARAVEL_START)->add(14, 'minutes')
    )
    ->each(fn (Invoice $invoice) => $invoice->submit());
```

<a name="method-tapEach"></a>
#### `tapEach()`

`each` 메서드는 컬렉션의 각 항목에 대해 즉시 콜백을 실행하지만, `tapEach` 메서드는 리스트에서 항목이 하나씩 꺼내질 때마다 콜백이 호출됩니다.

```php
// 아직 아무것도 dump되지 않았습니다...
$lazyCollection = LazyCollection::times(INF)->tapEach(function (int $value) {
    dump($value);
});

// 세 개의 항목이 dump됩니다...
$array = $lazyCollection->take(3)->all();

// 1
// 2
// 3
```

<a name="method-throttle"></a>
#### `throttle()`

`throttle` 메서드는 지연 컬렉션에서 지정한 초(second)만큼의 간격을 두고 각 값을 반환하도록 만듭니다. 이 메서드는 외부 API와 같이 요청에 속도 제한(rate limit)이 적용되는 환경에서 특히 유용하게 사용할 수 있습니다.

```php
use App\Models\User;

User::where('vip', true)
    ->cursor()
    ->throttle(seconds: 1)
    ->each(function (User $user) {
        // 외부 API 호출...
    });
```

<a name="method-remember"></a>
#### `remember()`

`remember` 메서드는 이미 열거한 값을 내부적으로 기억하여, 이후 컬렉션을 다시 열거할 때 해당 값을 새로 가져오는 대신 캐시에서 제공하는 새로운 지연 컬렉션을 반환합니다.

```php
// 아직 쿼리가 실행되지 않았습니다...
$users = User::cursor()->remember();

// 이제 쿼리가 실행됩니다...
// 첫 번째 5명의 사용자만 데이터베이스에서 불러옵니다...
$users->take(5)->all();

// 첫 5명 사용자는 컬렉션의 캐시에서 바로 반환됩니다...
// 이후 남은 사용자들은 데이터베이스에서 불러옵니다...
$users->take(20)->all();
```