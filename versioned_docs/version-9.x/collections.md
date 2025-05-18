# 컬렉션 (Collections)

- [소개](#introduction)
    - [컬렉션 생성하기](#creating-collections)
    - [컬렉션 확장하기](#extending-collections)
- [사용 가능한 메서드](#available-methods)
- [하이어 오더 메시지](#higher-order-messages)
- [레이지 컬렉션](#lazy-collections)
    - [소개](#lazy-collection-introduction)
    - [레이지 컬렉션 생성하기](#creating-lazy-collections)
    - [Enumerable 계약](#the-enumerable-contract)
    - [레이지 컬렉션 메서드](#lazy-collection-methods)

<a name="introduction"></a>
## 소개

`Illuminate\Support\Collection` 클래스는 데이터 배열을 다룰 때 유연하고 편리한 래퍼를 제공합니다. 예를 들어, 아래 코드를 확인해 보십시오. `collect` 헬퍼를 사용해 배열로부터 새로운 컬렉션 인스턴스를 생성하고, 각 요소에 `strtoupper` 함수를 실행한 뒤, 비어 있는 요소를 모두 제거해봅니다.

```
$collection = collect(['taylor', 'abigail', null])->map(function ($name) {
    return strtoupper($name);
})->reject(function ($name) {
    return empty($name);
});
```

보시다시피, `Collection` 클래스는 메서드 체이닝을 통해 기본 배열에 대한 다양한 매핑과 축소 작업을 자연스럽게 연결해서 수행할 수 있습니다. 일반적으로 컬렉션은 불변(immutable) 객체이므로, 모든 `Collection` 메서드는 항상 완전히 새로운 `Collection` 인스턴스를 반환합니다.

<a name="creating-collections"></a>
### 컬렉션 생성하기

위에서 언급한 것처럼, `collect` 헬퍼는 주어진 배열로부터 새로운 `Illuminate\Support\Collection` 인스턴스를 반환합니다. 따라서 컬렉션을 생성하는 것은 다음처럼 매우 간단합니다.

```
$collection = collect([1, 2, 3]);
```

> [!NOTE]
> [Eloquent](/docs/9.x/eloquent) 쿼리의 결과는 항상 `Collection` 인스턴스로 반환됩니다.

<a name="extending-collections"></a>
### 컬렉션 확장하기

컬렉션은 "매크로 가능(macroable)"하기 때문에, 실행 중에 `Collection` 클래스에 새로운 메서드를 추가할 수 있습니다. `Illuminate\Support\Collection` 클래스의 `macro` 메서드는 클로저를 인자로 받으며, 이 클로저는 매크로가 호출될 때 실행됩니다. 매크로 클로저 내부에서 `$this`를 사용해 컬렉션의 다른 메서드에 접근할 수 있으므로, 실제 컬렉션 클래스의 메서드처럼 동작합니다. 예를 들어, 아래 코드는 `Collection` 클래스에 `toUpper` 메서드를 추가하는 예시입니다.

```
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

Collection::macro('toUpper', function () {
    return $this->map(function ($value) {
        return Str::upper($value);
    });
});

$collection = collect(['first', 'second']);

$upper = $collection->toUpper();

// ['FIRST', 'SECOND']
```

일반적으로 컬렉션 매크로는 [서비스 프로바이더](/docs/9.x/providers)의 `boot` 메서드 안에서 선언하는 것이 가장 좋습니다.

<a name="macro-arguments"></a>
#### 매크로 인수

필요하다면, 추가 인수를 받을 수 있는 매크로를 정의할 수도 있습니다.

```
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Lang;

Collection::macro('toLocale', function ($locale) {
    return $this->map(function ($value) use ($locale) {
        return Lang::get($value, [], $locale);
    });
});

$collection = collect(['first', 'second']);

$translated = $collection->toLocale('es');
```

<a name="available-methods"></a>
## 사용 가능한 메서드

이후의 컬렉션 문서 대부분에서는, `Collection` 클래스에서 사용할 수 있는 각 메서드에 대해 설명합니다. 이 모든 메서드들은 기본 배열을 유연하게 조작하기 위해 체이닝이 가능하다는 점을 기억하세요. 또한, 거의 모든 메서드는 새로운 `Collection` 인스턴스를 반환하므로, 필요할 때마다 원본 컬렉션을 보존할 수 있습니다.

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
[containsOneItem](#method-containsoneitem)
[containsStrict](#method-containsstrict)
[count](#method-count)
[countBy](#method-countBy)
[crossJoin](#method-crossjoin)
[dd](#method-dd)
[diff](#method-diff)
[diffAssoc](#method-diffassoc)
[diffKeys](#method-diffkeys)
[doesntContain](#method-doesntcontain)
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
[forget](#method-forget)
[forPage](#method-forpage)
[get](#method-get)
[groupBy](#method-groupby)
[has](#method-has)
[hasAny](#method-hasany)
[implode](#method-implode)
[intersect](#method-intersect)
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
[nth](#method-nth)
[only](#method-only)
[pad](#method-pad)
[partition](#method-partition)
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



<a name="method-all"></a>
#### `all()`

`all` 메서드는 컬렉션이 표현하는 원본 배열을 반환합니다.

```
collect([1, 2, 3])->all();

// [1, 2, 3]
```

<a name="method-average"></a>
#### `average()`

[`avg`](#method-avg) 메서드의 별칭입니다.

<a name="method-avg"></a>
#### `avg()`

`avg` 메서드는 주어진 키의 [평균값](https://en.wikipedia.org/wiki/Average)을 반환합니다.

```
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

<a name="method-chunk"></a>
#### `chunk()`

`chunk` 메서드는 컬렉션을 지정한 크기의 여러 개의 작은 컬렉션으로 분할합니다.

```
$collection = collect([1, 2, 3, 4, 5, 6, 7]);

$chunks = $collection->chunk(4);

$chunks->all();

// [[1, 2, 3, 4], [5, 6, 7]]
```

이 메서드는 [Bootstrap](https://getbootstrap.com/docs/4.1/layout/grid/)과 같은 그리드 시스템을 사용하는 [뷰](/docs/9.x/views)에서 특히 유용합니다. 예를 들어, 여러 개의 [Eloquent](/docs/9.x/eloquent) 모델을 그리드 형식으로 표시하고 싶을 때 사용할 수 있습니다.

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

`chunkWhile` 메서드는 전달한 콜백의 결과에 따라 컬렉션을 여러 개의 작은 컬렉션으로 분할합니다. 클로저로 전달되는 `$chunk` 변수는 이전 요소를 확인할 때 사용할 수 있습니다.

```
$collection = collect(str_split('AABBCCCD'));

$chunks = $collection->chunkWhile(function ($value, $key, $chunk) {
    return $value === $chunk->last();
});

$chunks->all();

// [['A', 'A'], ['B', 'B'], ['C', 'C', 'C'], ['D']]
```

<a name="method-collapse"></a>
#### `collapse()`

`collapse` 메서드는 여러 배열로 구성된 컬렉션을 하나의 평탄한(flat) 컬렉션으로 합쳐줍니다.

```
$collection = collect([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
]);

$collapsed = $collection->collapse();

$collapsed->all();

// [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

<a name="method-collect"></a>
#### `collect()`

`collect` 메서드는 현재 컬렉션 객체에 들어 있는 아이템들로 새로운 `Collection` 인스턴스를 반환합니다.

```
$collectionA = collect([1, 2, 3]);

$collectionB = $collectionA->collect();

$collectionB->all();

// [1, 2, 3]
```

`collect` 메서드는 주로 [레이지 컬렉션](#lazy-collections)을 일반 `Collection` 인스턴스로 변환할 때 유용합니다.

```
$lazyCollection = LazyCollection::make(function () {
    yield 1;
    yield 2;
    yield 3;
});

$collection = $lazyCollection->collect();

get_class($collection);

// 'Illuminate\Support\Collection'

$collection->all();

// [1, 2, 3]
```

> [!NOTE]
> `collect` 메서드는 `Enumerable` 인스턴스가 있고, 레이지가 아닌 컬렉션 객체가 필요할 때 특히 유용합니다. `collect()`는 `Enumerable` 계약의 일부이므로, 항상 안전하게 `Collection` 인스턴스를 얻는 데 사용할 수 있습니다.

<a name="method-combine"></a>
#### `combine()`

`combine` 메서드는 컬렉션의 값을 키로 하고, 두 번째 배열(또는 컬렉션)의 값을 값으로 결합합니다.

```
$collection = collect(['name', 'age']);

$combined = $collection->combine(['George', 29]);

$combined->all();

// ['name' => 'George', 'age' => 29]
```

<a name="method-concat"></a>
#### `concat()`

`concat` 메서드는 지정한 `array` 또는 컬렉션의 값을 기존 컬렉션 끝에 덧붙입니다.

```
$collection = collect(['John Doe']);

$concatenated = $collection->concat(['Jane Doe'])->concat(['name' => 'Johnny Doe']);

$concatenated->all();

// ['John Doe', 'Jane Doe', 'Johnny Doe']
```

`concat` 메서드는 덧붙인 아이템들에 대해 숫자 인덱스를 다시 부여합니다. 연관(associative) 컬렉션의 키를 유지하려면 [merge](#method-merge) 메서드를 참고하세요.

<a name="method-contains"></a>
#### `contains()`

`contains` 메서드는 컬렉션에 주어진 아이템이 포함되어 있는지 여부를 판단합니다. 콜백을 전달해서, 특정 조건에 부합하는 요소가 컬렉션에 있는지 검사할 수도 있습니다.

```
$collection = collect([1, 2, 3, 4, 5]);

$collection->contains(function ($value, $key) {
    return $value > 5;
});

// false
```

또는, 검사하려는 아이템 값을 문자열로 바로 전달할 수도 있습니다.

```
$collection = collect(['name' => 'Desk', 'price' => 100]);

$collection->contains('Desk');

// true

$collection->contains('New York');

// false
```

키/값 쌍을 전달해서 해당 조합이 컬렉션에 존재하는지도 확인할 수 있습니다.

```
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 100],
]);

$collection->contains('product', 'Bookcase');

// false
```

`contains` 메서드는 값 비교 시 "느슨한(loose) 비교"를 사용하므로, 정수 값이 들어있는 문자열과 동일한 정수는 같은 값으로 처리됩니다. 보다 엄격한 비교가 필요하다면 [`containsStrict`](#method-containsstrict) 메서드를 사용하십시오.

`contains`와 반대 역할을 하는 메서드는 [doesntContain](#method-doesntcontain)입니다.

<a name="method-containsoneitem"></a>
#### `containsOneItem()`

`containsOneItem` 메서드는 컬렉션이 하나의 아이템만 포함하는지 확인합니다.

```
collect([])->containsOneItem();

// false

collect(['1'])->containsOneItem();

// true

collect(['1', '2'])->containsOneItem();

// false
```

<a name="method-containsstrict"></a>
#### `containsStrict()`

이 메서드는 [`contains`](#method-contains) 메서드와 동일한 시그니처를 가지지만, 모든 값을 "엄격한(strict) 비교"로 판별합니다.

> [!NOTE]
> 이 메서드는 [Eloquent 컬렉션](/docs/9.x/eloquent-collections#method-contains)을 사용할 때 동작이 달라집니다.

<a name="method-count"></a>
#### `count()`

`count` 메서드는 컬렉션에 포함된 전체 아이템 개수를 반환합니다.

```
$collection = collect([1, 2, 3, 4]);

$collection->count();

// 4
```

<a name="method-countBy"></a>
#### `countBy()`

`countBy` 메서드는 컬렉션 내 값의 등장 횟수를 셉니다. 기본적으로 각 요소의 등장 횟수를 세므로, 컬렉션 안에 특정 "유형"의 요소가 얼마나 있는지 집계할 수 있습니다.

```
$collection = collect([1, 2, 2, 2, 3]);

$counted = $collection->countBy();

$counted->all();

// [1 => 1, 2 => 3, 3 => 1]
```

콜백을 전달해서 특정 값 기준으로 등장 횟수를 집계할 수도 있습니다.

```
$collection = collect(['alice@gmail.com', 'bob@yahoo.com', 'carlos@gmail.com']);

$counted = $collection->countBy(function ($email) {
    return substr(strrchr($email, "@"), 1);
});

$counted->all();

// ['gmail.com' => 2, 'yahoo.com' => 1]
```

<a name="method-crossjoin"></a>
#### `crossJoin()`

`crossJoin` 메서드는 컬렉션의 값과 전달한 배열(또는 컬렉션)들을 교차 결합하여, 가능한 모든 순열의 데카르트 곱(Cartesian product)을 반환합니다.

```
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

`dd` 메서드는 컬렉션의 아이템을 출력하고 스크립트 실행을 종료합니다.

```
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

만약 스크립트 실행을 중단하지 않고 컬렉션의 내용을 출력하고 싶다면, [`dump`](#method-dump) 메서드를 사용하십시오.

<a name="method-diff"></a>
#### `diff()`

`diff` 메서드는 컬렉션을 다른 컬렉션이나 일반 PHP `array`와 값(value)을 기준으로 비교합니다. 이 메서드는 현재 컬렉션에는 있지만, 비교 대상으로 전달된 컬렉션에는 없는 값을 반환합니다.

```
$collection = collect([1, 2, 3, 4, 5]);

$diff = $collection->diff([2, 4, 6, 8]);

$diff->all();

// [1, 3, 5]
```

> [!NOTE]
> 이 메서드는 [Eloquent 컬렉션](/docs/9.x/eloquent-collections#method-diff)을 사용할 때 동작이 달라집니다.

<a name="method-diffassoc"></a>
#### `diffAssoc()`

`diffAssoc` 메서드는 컬렉션을 다른 컬렉션이나 일반 PHP `array`와 "키(key)와 값(value)"을 모두 기준으로 비교합니다. 이 메서드는 컬렉션에만 존재하는 키/값 쌍을 반환합니다.

```
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

<a name="method-diffkeys"></a>
#### `diffKeys()`

`diffKeys` 메서드는 컬렉션을 다른 컬렉션이나 일반 PHP `array`와 "키(key)"만을 기준으로 비교합니다. 컬렉션의 키 중 비교 대상에 없는 키와 그 값을 반환합니다.

```
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

`doesntContain` 메서드는 컬렉션에 특정 아이템이 **포함되어 있지 않은지**를 검사합니다. 클로저(익명 함수)를 전달하여 원하는 조건에 일치하는 요소가 컬렉션에 없는지 확인할 수도 있습니다.

```
$collection = collect([1, 2, 3, 4, 5]);

$collection->doesntContain(function ($value, $key) {
    return $value < 5;
});

// false
```

또한, 문자열을 직접 전달하여 특정 값이 컬렉션에 없는지 검사할 수 있습니다.

```
$collection = collect(['name' => 'Desk', 'price' => 100]);

$collection->doesntContain('Table');

// true

$collection->doesntContain('Desk');

// false
```

키/값 쌍을 전달하여 해당 쌍이 컬렉션에 존재하지 않는지 확인할 수도 있습니다.

```
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 100],
]);

$collection->doesntContain('product', 'Bookcase');

// true
```

`doesntContain` 메서드는 값 비교 시 "느슨한(loose)" 비교를 사용합니다. 예를 들어, 문자열로 된 정수와 실제 정수는 같은 값으로 간주됩니다.

<a name="method-dump"></a>
#### `dump()`

`dump` 메서드는 컬렉션의 아이템을 출력합니다.

```
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

컬렉션을 출력한 후 스크립트 실행도 바로 중단하고 싶다면 [`dd`](#method-dd) 메서드를 사용하세요.

<a name="method-duplicates"></a>
#### `duplicates()`

`duplicates` 메서드는 컬렉션에서 중복된 값을 찾아 반환합니다.

```
$collection = collect(['a', 'b', 'a', 'c', 'b']);

$collection->duplicates();

// [2 => 'a', 4 => 'b']
```

컬렉션이 배열이나 객체로 구성되어 있다면, 중복 체크를 할 속성의 키를 지정할 수 있습니다.

```
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

이 메서드는 [`duplicates`](#method-duplicates) 메서드와 사용법이 동일하지만, 값 비교 시 "엄격한(strict)" 비교 연산을 사용합니다.

<a name="method-each"></a>
#### `each()`

`each` 메서드는 컬렉션의 모든 아이템을 반복하면서 각 아이템을 클로저에 전달합니다.

```
$collection->each(function ($item, $key) {
    //
});
```

반복을 중단하고 싶을 때는, 클로저에서 `false`를 반환하면 됩니다.

```
$collection->each(function ($item, $key) {
    if (/* condition */) {
        return false;
    }
});
```

<a name="method-eachspread"></a>
#### `eachSpread()`

`eachSpread` 메서드는 컬렉션의 각 아이템을 반복 처리하면서, 중첩된 아이템의 각 값을 콜백의 개별 인자로 전달합니다.

```
$collection = collect([['John Doe', 35], ['Jane Doe', 33]]);

$collection->eachSpread(function ($name, $age) {
    //
});
```

반복을 중단하고 싶을 경우 콜백에서 `false`를 반환하면 됩니다.

```
$collection->eachSpread(function ($name, $age) {
    return false;
});
```

<a name="method-every"></a>
#### `every()`

`every` 메서드는 컬렉션의 **모든 요소**가 주어진 조건을 만족하는지 확인할 때 사용할 수 있습니다.

```
collect([1, 2, 3, 4])->every(function ($value, $key) {
    return $value > 2;
});

// false
```

컬렉션이 비어 있다면, `every` 메서드는 항상 true를 반환합니다.

```
$collection = collect([]);

$collection->every(function ($value, $key) {
    return $value > 2;
});

// true
```

<a name="method-except"></a>
#### `except()`

`except` 메서드는 지정된 키에 해당하는 아이템을 제외한 컬렉션을 반환합니다.

```
$collection = collect(['product_id' => 1, 'price' => 100, 'discount' => false]);

$filtered = $collection->except(['price', 'discount']);

$filtered->all();

// ['product_id' => 1]
```

`except`와 반대 동작을 원한다면, [only](#method-only) 메서드를 참고하세요.

> [!NOTE]
> 이 메서드는 [Eloquent 컬렉션](/docs/9.x/eloquent-collections#method-except) 사용 시 동작이 달라집니다.

<a name="method-filter"></a>
#### `filter()`

`filter` 메서드는 주어진 콜백(조건 함수)에 따라 조건을 만족하는 아이템만 남겨서 새로운 컬렉션을 생성합니다.

```
$collection = collect([1, 2, 3, 4]);

$filtered = $collection->filter(function ($value, $key) {
    return $value > 2;
});

$filtered->all();

// [3, 4]
```

콜백을 생략하면, 컬렉션에서 `false`와 동등한 값(예: null, false, 빈 문자열, 0, 빈 배열 등)이 모두 제거됩니다.

```
$collection = collect([1, 2, 3, null, false, '', 0, []]);

$collection->filter()->all();

// [1, 2, 3]
```

`filter`와 반대 동작을 원한다면 [reject](#method-reject) 메서드를 참고하세요.

<a name="method-first"></a>
#### `first()`

`first` 메서드는 컬렉션에서 주어진 조건을 처음으로 만족하는 요소를 반환합니다.

```
collect([1, 2, 3, 4])->first(function ($value, $key) {
    return $value > 2;
});

// 3
```

인수 없이 호출하면, 컬렉션의 첫 번째 요소를 반환합니다. 컬렉션이 비어 있다면 `null`을 반환합니다.

```
collect([1, 2, 3, 4])->first();

// 1
```

<a name="method-first-or-fail"></a>
#### `firstOrFail()`

`firstOrFail` 메서드는 `first` 메서드와 동일하게 동작합니다. 단, 결과가 없으면 `Illuminate\Support\ItemNotFoundException` 예외를 발생시킵니다.

```
collect([1, 2, 3, 4])->firstOrFail(function ($value, $key) {
    return $value > 5;
});

// Throws ItemNotFoundException...
```

인수 없이 호출하면, 컬렉션의 첫 번째 요소를 반환합니다. 컬렉션이 비어 있으면 `Illuminate\Support\ItemNotFoundException` 예외가 발생합니다.

```
collect([])->firstOrFail();

// Throws ItemNotFoundException...
```

<a name="method-first-where"></a>
#### `firstWhere()`

`firstWhere` 메서드는 지정한 키/값 쌍을 처음으로 충족하는 요소를 반환합니다.

```
$collection = collect([
    ['name' => 'Regena', 'age' => null],
    ['name' => 'Linda', 'age' => 14],
    ['name' => 'Diego', 'age' => 23],
    ['name' => 'Linda', 'age' => 84],
]);

$collection->firstWhere('name', 'Linda');

// ['name' => 'Linda', 'age' => 14]
```

비교 연산자(operator)를 함께 사용할 수도 있습니다.

```
$collection->firstWhere('age', '>=', 18);

// ['name' => 'Diego', 'age' => 23]
```

[where](#method-where) 메서드처럼, 인수를 하나만 전달하면 해당 키가 "참(truthy)"인 첫 아이템을 반환합니다.

```
$collection->firstWhere('age');

// ['name' => 'Linda', 'age' => 14]
```

<a name="method-flatmap"></a>
#### `flatMap()`

`flatMap` 메서드는 컬렉션의 각 값을 주어진 클로저 함수에 전달하며, 클로저에서 값을 임의로 수정하여 반환할 수 있습니다. 이렇게 반환된 변경된 값들로 새 컬렉션을 만든 후, 결과 배열을 한 단계(flatten)만큼 평탄화합니다.

```
$collection = collect([
    ['name' => 'Sally'],
    ['school' => 'Arkansas'],
    ['age' => 28]
]);

$flattened = $collection->flatMap(function ($values) {
    return array_map('strtoupper', $values);
});

$flattened->all();

// ['name' => 'SALLY', 'school' => 'ARKANSAS', 'age' => '28'];
```

<a name="method-flatten"></a>
#### `flatten()`

`flatten` 메서드는 다차원 컬렉션을 한 단계(flat)로 평탄화(단일 배열로 만듦)합니다.

```
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

필요하다면, `flatten` 메서드의 인수로 "깊이(depth)"를 지정할 수 있습니다.

```
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

이 예시에서, `flatten`을 깊이 인수 없이 사용하면 위에 중첩된 배열까지 모두 평탄화해서 `['iPhone 6S', 'Apple', 'Galaxy S7', 'Samsung']` 결과를 얻게 됩니다. 깊이(depth)를 지정하면, 어느 단계까지 평탄화할지 설정할 수 있습니다.

<a name="method-flip"></a>
#### `flip()`

`flip` 메서드는 컬렉션의 키와 값을 서로 뒤바꿉니다.

```
$collection = collect(['name' => 'taylor', 'framework' => 'laravel']);

$flipped = $collection->flip();

$flipped->all();

// ['taylor' => 'name', 'laravel' => 'framework']
```

<a name="method-forget"></a>
#### `forget()`

`forget` 메서드는 컬렉션에서 지정한 키의 아이템을 제거합니다.

```
$collection = collect(['name' => 'taylor', 'framework' => 'laravel']);

$collection->forget('name');

$collection->all();

// ['framework' => 'laravel']
```

> [!WARNING]
> 대부분의 다른 컬렉션 메서드와 달리, `forget`은 새로운 컬렉션을 반환하지 않습니다. 바로 자신(원본 컬렉션)을 변경합니다.

<a name="method-forpage"></a>
#### `forPage()`

`forPage` 메서드는 지정한 페이지 번호에 해당하는 아이템만으로 새로운 컬렉션을 반환합니다. 첫 번째 인수로 페이지 번호, 두 번째 인수로 "한 페이지에 보여줄 아이템 개수"를 전달합니다.

```
$collection = collect([1, 2, 3, 4, 5, 6, 7, 8, 9]);

$chunk = $collection->forPage(2, 3);

$chunk->all();

// [4, 5, 6]
```

<a name="method-get"></a>
#### `get()`

`get` 메서드는 전달된 키에 해당하는 아이템을 반환합니다. 키가 존재하지 않으면 `null`을 반환합니다.

```
$collection = collect(['name' => 'taylor', 'framework' => 'laravel']);

$value = $collection->get('name');

// taylor
```

옵션으로 두 번째 인수로 기본값을 전달할 수 있습니다.

```
$collection = collect(['name' => 'taylor', 'framework' => 'laravel']);

$value = $collection->get('age', 34);

// 34
```

또한, 기본값 자리에 콜백 함수를 넘길 수도 있습니다. 지정한 키가 없을 때 콜백의 결과가 반환됩니다.

```
$collection->get('email', function () {
    return 'taylor@example.com';
});

// taylor@example.com
```

<a name="method-groupby"></a>
#### `groupBy()`

`groupBy` 메서드는 컬렉션의 아이템을 지정한 키 기준으로 그룹화합니다.

```
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

문자열 키 대신 콜백을 전달해서, 그룹화할 기준값을 동적으로 지정할 수도 있습니다.

```
$grouped = $collection->groupBy(function ($item, $key) {
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

여러 조건으로 그룹화해야 할 경우, 배열로 여러 기준을 전달할 수 있습니다. 각 배열 요소는 다차원 배열에서 각각의 레벨에 그룹화 기준이 적용됩니다.

```
$data = new Collection([
    10 => ['user' => 1, 'skill' => 1, 'roles' => ['Role_1', 'Role_3']],
    20 => ['user' => 2, 'skill' => 1, 'roles' => ['Role_1', 'Role_2']],
    30 => ['user' => 3, 'skill' => 2, 'roles' => ['Role_1']],
    40 => ['user' => 4, 'skill' => 2, 'roles' => ['Role_2']],
]);

$result = $data->groupBy(['skill', function ($item) {
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

`has` 메서드는 주어진 키가 컬렉션에 존재하는지 여부를 확인합니다.

```
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

`hasAny` 메서드는 전달한 여러 키 중 하나라도 컬렉션에 존재하는지 확인합니다.

```
$collection = collect(['account_id' => 1, 'product' => 'Desk', 'amount' => 5]);

$collection->hasAny(['product', 'price']);

// true

$collection->hasAny(['name', 'price']);

// false
```

<a name="method-implode"></a>
#### `implode()`

`implode` 메서드는 컬렉션의 항목들을 하나의 문자열로 이어붙입니다. 사용 방법은 컬렉션에 담긴 항목의 타입에 따라 다릅니다. 컬렉션이 배열이나 객체를 담고 있다면, 연결하고자 하는 속성의 키와 각 값 사이에 둘 "구분자" 문자열을 인자로 전달해야 합니다.

```
$collection = collect([
    ['account_id' => 1, 'product' => 'Desk'],
    ['account_id' => 2, 'product' => 'Chair'],
]);

$collection->implode('product', ', ');

// Desk, Chair
```

컬렉션이 단순 문자열이나 숫자로만 구성된 경우에는, 구분자만 인자로 전달하면 됩니다.

```
collect([1, 2, 3, 4, 5])->implode('-');

// '1-2-3-4-5'
```

또한, `implode` 메서드에 클로저를 전달하여 각 항목의 값을 변형한 후 이어붙일 수도 있습니다.

```
$collection->implode(function ($item, $key) {
    return strtoupper($item['product']);
}, ', ');

// DESK, CHAIR
```

<a name="method-intersect"></a>
#### `intersect()`

`intersect` 메서드는 전달한 `array` 또는 컬렉션에 존재하지 않는 값들을 원본 컬렉션에서 제거합니다. 결과 컬렉션은 원본의 키를 그대로 유지합니다.

```
$collection = collect(['Desk', 'Sofa', 'Chair']);

$intersect = $collection->intersect(['Desk', 'Chair', 'Bookcase']);

$intersect->all();

// [0 => 'Desk', 2 => 'Chair']
```

> [!NOTE]
> 이 메서드는 [Eloquent 컬렉션](/docs/9.x/eloquent-collections#method-intersect)에서 사용할 때 동작 방식이 다릅니다.

<a name="method-intersectbykeys"></a>
#### `intersectByKeys()`

`intersectByKeys` 메서드는 전달된 `array` 또는 컬렉션에 존재하지 않는 키와 해당 값을 원본 컬렉션에서 제거합니다.

```
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

`isEmpty` 메서드는 컬렉션이 비어 있으면 `true`를, 아니면 `false`를 반환합니다.

```
collect([])->isEmpty();

// true
```

<a name="method-isnotempty"></a>
#### `isNotEmpty()`

`isNotEmpty` 메서드는 컬렉션에 항목이 하나라도 있으면 `true`, 아니면 `false`를 반환합니다.

```
collect([])->isNotEmpty();

// false
```

<a name="method-join"></a>
#### `join()`

`join` 메서드는 컬렉션의 값들을 문자열로 결합합니다. 이 메서드의 두 번째 인자를 사용하면, 마지막 요소를 문자열에 붙일 때 사용할 접속사를 지정할 수 있습니다.

```
collect(['a', 'b', 'c'])->join(', '); // 'a, b, c'
collect(['a', 'b', 'c'])->join(', ', ', and '); // 'a, b, and c'
collect(['a', 'b'])->join(', ', ' and '); // 'a and b'
collect(['a'])->join(', ', ' and '); // 'a'
collect([])->join(', ', ' and '); // ''
```

<a name="method-keyby"></a>
#### `keyBy()`

`keyBy` 메서드는 지정한 키를 기준으로 컬렉션의 항목을 새로운 컬렉션의 키로 지정합니다. 같은 키를 가진 항목이 여러 개일 경우, 마지막 항목만 남게 됩니다.

```
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

이 메서드에는 콜백을 전달할 수도 있습니다. 콜백은 각 항목에 대해 새로운 키로 사용할 값을 반환해야 합니다.

```
$keyed = $collection->keyBy(function ($item, $key) {
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

```
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

`last` 메서드는 주어진 조건을 통과하는 컬렉션의 마지막 요소를 반환합니다.

```
collect([1, 2, 3, 4])->last(function ($value, $key) {
    return $value < 3;
});

// 2
```

아무 인자도 전달하지 않으면 컬렉션의 마지막 요소를 반환합니다. 컬렉션이 비어 있으면 `null`을 반환합니다.

```
collect([1, 2, 3, 4])->last();

// 4
```

<a name="method-lazy"></a>
#### `lazy()`

`lazy` 메서드는 컬렉션의 내부 배열로부터 새로운 [`LazyCollection`](#lazy-collections) 인스턴스를 반환합니다.

```
$lazyCollection = collect([1, 2, 3, 4])->lazy();

get_class($lazyCollection);

// Illuminate\Support\LazyCollection

$lazyCollection->all();

// [1, 2, 3, 4]
```

이 방법은 많은 항목을 가진 방대한 `Collection`을 변환해야 할 때 특히 유용합니다.

```
$count = $hugeCollection
    ->lazy()
    ->where('country', 'FR')
    ->where('balance', '>', '100')
    ->count();
```

컬렉션을 `LazyCollection`으로 변환하면 추가적인 메모리 할당을 최소화할 수 있습니다. 원본 컬렉션은 여전히 데이터를 메모리에 보관하지만, 이후의 필터링 과정에서는 별도의 메모리를 거의 사용하지 않습니다. 따라서 결과 필터링 시 실제로 추가적인 메모리 사용이 거의 발생하지 않습니다.

<a name="method-macro"></a>
#### `macro()`

정적 메서드인 `macro`를 사용하면 실행 중에 `Collection` 클래스에 새로운 메서드를 추가할 수 있습니다. 자세한 내용은 [컬렉션 확장하기](#extending-collections) 문서를 참고하십시오.

<a name="method-make"></a>
#### `make()`

정적 메서드인 `make`는 새로운 컬렉션 인스턴스를 생성합니다. [컬렉션 생성](#creating-collections) 섹션을 참고하십시오.

<a name="method-map"></a>
#### `map()`

`map` 메서드는 컬렉션을 순회하면서 각 값과 키를 지정한 콜백에 전달합니다. 콜백 안에서 항목을 변형하여 반환할 수 있으며, 변형된 값들로 새로운 컬렉션이 만들어집니다.

```
$collection = collect([1, 2, 3, 4, 5]);

$multiplied = $collection->map(function ($item, $key) {
    return $item * 2;
});

$multiplied->all();

// [2, 4, 6, 8, 10]
```

> [!WARNING]
> 대부분의 다른 컬렉션 메서드와 마찬가지로, `map`은 항상 새로운 컬렉션 인스턴스를 반환하며, 원본 컬렉션 자체를 변경하지 않습니다. 만약 원본 컬렉션을 변형하고 싶다면 [`transform`](#method-transform) 메서드를 사용하세요.

<a name="method-mapinto"></a>
#### `mapInto()`

`mapInto()` 메서드는 컬렉션을 순회하며, 각 항목의 값을 지정한 클래스의 생성자로 전달해 새로운 인스턴스를 생성합니다.

```
class Currency
{
    /**
     * Create a new currency instance.
     *
     * @param  string  $code
     * @return void
     */
    function __construct(string $code)
    {
        $this->code = $code;
    }
}

$collection = collect(['USD', 'EUR', 'GBP']);

$currencies = $collection->mapInto(Currency::class);

$currencies->all();

// [Currency('USD'), Currency('EUR'), Currency('GBP')]
```

<a name="method-mapspread"></a>
#### `mapSpread()`

`mapSpread` 메서드는 컬렉션의 각 항목(중첩된 값 포함)을 각각의 인자로 클로저에 전달합니다. 클로저 안에서는 이 항목들을 변형하여 반환할 수 있으며, 반환된 값들로 새로운 컬렉션을 만듭니다.

```
$collection = collect([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

$chunks = $collection->chunk(2);

$sequence = $chunks->mapSpread(function ($even, $odd) {
    return $even + $odd;
});

$sequence->all();

// [1, 5, 9, 13, 17]
```

<a name="method-maptogroups"></a>
#### `mapToGroups()`

`mapToGroups` 메서드는 주어진 클로저에 따라 컬렉션의 항목들을 그룹화합니다. 클로저는 단일 키-값 쌍을 포함하는 연관 배열을 반환해야 하며, 이 형태로 그룹화된 새로운 컬렉션이 만들어집니다.

```
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

$grouped = $collection->mapToGroups(function ($item, $key) {
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

`mapWithKeys` 메서드는 컬렉션을 순회하며 각 값을 주어진 콜백에 전달합니다. 콜백은 반드시 단일 키-값 쌍을 갖는 연관 배열을 반환해야 합니다.

```
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

$keyed = $collection->mapWithKeys(function ($item, $key) {
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

`max` 메서드는 지정한 키의 최대 값을 반환합니다.

```
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

`median` 메서드는 지정한 키에 대한 [중앙값(메디안)](https://en.wikipedia.org/wiki/Median)을 반환합니다.

```
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

`merge` 메서드는 전달한 배열 또는 컬렉션을 원본 컬렉션과 합칩니다. 전달된 항목의 키가 원본 컬렉션의 문자열 키와 같으면, 전달된 항목의 값이 원본 값을 덮어씁니다.

```
$collection = collect(['product_id' => 1, 'price' => 100]);

$merged = $collection->merge(['price' => 200, 'discount' => false]);

$merged->all();

// ['product_id' => 1, 'price' => 200, 'discount' => false]
```

전달된 항목의 키가 숫자라면, 해당 값들은 컬렉션 마지막에 이어 붙여집니다.

```
$collection = collect(['Desk', 'Chair']);

$merged = $collection->merge(['Bookcase', 'Door']);

$merged->all();

// ['Desk', 'Chair', 'Bookcase', 'Door']
```

<a name="method-mergerecursive"></a>
#### `mergeRecursive()`

`mergeRecursive` 메서드는 전달된 배열이나 컬렉션을 원본 컬렉션에 재귀적으로 병합합니다. 전달된 항목의 키가 원본의 문자열 키와 같다면, 각 키에 해당하는 값들이 배열로 병합됩니다. 이 과정은 재귀적으로 이루어집니다.

```
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

`min` 메서드는 지정한 키의 최소 값을 반환합니다.

```
$min = collect([['foo' => 10], ['foo' => 20]])->min('foo');

// 10

$min = collect([1, 2, 3, 4, 5])->min();

// 1
```

<a name="method-mode"></a>
#### `mode()`

`mode` 메서드는 지정한 키의 [최빈값(모드)](https://en.wikipedia.org/wiki/Mode_(statistics))을 반환합니다.

```
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

<a name="method-nth"></a>
#### `nth()`

`nth` 메서드는 N번째마다 한 번씩만 남기는 새로운 컬렉션을 만듭니다.

```
$collection = collect(['a', 'b', 'c', 'd', 'e', 'f']);

$collection->nth(4);

// ['a', 'e']
```

두 번째 인자로 시작 오프셋을 지정할 수도 있습니다.

```
$collection->nth(4, 1);

// ['b', 'f']
```

<a name="method-only"></a>
#### `only()`

`only` 메서드는 지정된 키에 해당하는 항목들만을 추출해 반환합니다.

```
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

반대로, `only`와 반대 기능을 원한다면 [except](#method-except) 메서드를 참고하세요.

> [!NOTE]
> 이 메서드는 [Eloquent 컬렉션](/docs/9.x/eloquent-collections#method-only)에서 사용하면 동작 방식이 다릅니다.

<a name="method-pad"></a>

#### `pad()`

`pad` 메서드는 배열의 크기가 지정한 크기에 도달할 때까지 주어진 값으로 배열을 채웁니다. 이 메서드는 PHP의 [array_pad](https://secure.php.net/manual/en/function.array-pad.php) 함수와 유사하게 동작합니다.

왼쪽(앞쪽)으로 패딩을 하고 싶다면 음수 값을 크기로 지정해야 합니다. 만약 지정한 크기의 절대값이 배열의 길이보다 작거나 같으면 아무런 패딩도 일어나지 않습니다.

```
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

`partition` 메서드는 PHP 배열 구조 분해와 결합하여, 특정 조건을 만족하는 요소와 만족하지 않는 요소를 각각 분리할 수 있게 해줍니다.

```
$collection = collect([1, 2, 3, 4, 5, 6]);

[$underThree, $equalOrAboveThree] = $collection->partition(function ($i) {
    return $i < 3;
});

$underThree->all();

// [1, 2]

$equalOrAboveThree->all();

// [3, 4, 5, 6]
```

<a name="method-pipe"></a>
#### `pipe()`

`pipe` 메서드는 컬렉션을 전달받은 클로저에 넘겨 실행한 결과를 반환합니다.

```
$collection = collect([1, 2, 3]);

$piped = $collection->pipe(function ($collection) {
    return $collection->sum();
});

// 6
```

<a name="method-pipeinto"></a>
#### `pipeInto()`

`pipeInto` 메서드는 지정한 클래스의 새 인스턴스를 생성한 뒤, 컬렉션을 생성자에 전달합니다.

```
class ResourceCollection
{
    /**
     * The Collection instance.
     */
    public $collection;

    /**
     * Create a new ResourceCollection instance.
     *
     * @param  Collection  $collection
     * @return void
     */
    public function __construct(Collection $collection)
    {
        $this->collection = $collection;
    }
}

$collection = collect([1, 2, 3]);

$resource = $collection->pipeInto(ResourceCollection::class);

$resource->collection->all();

// [1, 2, 3]
```

<a name="method-pipethrough"></a>
#### `pipeThrough()`

`pipeThrough` 메서드는 컬렉션을 지정한 클로저 배열에 연속적으로 전달하며, 실행된 클로저의 결과를 반환합니다.

```
$collection = collect([1, 2, 3]);

$result = $collection->pipeThrough([
    function ($collection) {
        return $collection->merge([4, 5]);
    },
    function ($collection) {
        return $collection->sum();
    },
]);

// 15
```

<a name="method-pluck"></a>
#### `pluck()`

`pluck` 메서드는 지정한 키의 모든 값을 추출합니다.

```
$collection = collect([
    ['product_id' => 'prod-100', 'name' => 'Desk'],
    ['product_id' => 'prod-200', 'name' => 'Chair'],
]);

$plucked = $collection->pluck('name');

$plucked->all();

// ['Desk', 'Chair']
```

결과로 반환되는 컬렉션의 키를 지정하려면 두 번째 인자를 추가할 수 있습니다.

```
$plucked = $collection->pluck('name', 'product_id');

$plucked->all();

// ['prod-100' => 'Desk', 'prod-200' => 'Chair']
```

`pluck` 메서드는 "점(dot) 표기법"을 사용하여 중첩된 값을 가져올 수도 있습니다.

```
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

만약 중복되는 키가 있다면, 마지막 요소가 결과 컬렉션에 저장됩니다.

```
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

`pop` 메서드는 컬렉션에서 마지막 아이템을 제거하고 반환합니다.

```
$collection = collect([1, 2, 3, 4, 5]);

$collection->pop();

// 5

$collection->all();

// [1, 2, 3, 4]
```

`pop` 메서드에 정수를 전달하면, 컬렉션의 끝에서 여러 개의 아이템을 제거해 반환할 수 있습니다.

```
$collection = collect([1, 2, 3, 4, 5]);

$collection->pop(3);

// collect([5, 4, 3])

$collection->all();

// [1, 2]
```

<a name="method-prepend"></a>
#### `prepend()`

`prepend` 메서드는 컬렉션의 맨 앞에 아이템을 추가합니다.

```
$collection = collect([1, 2, 3, 4, 5]);

$collection->prepend(0);

$collection->all();

// [0, 1, 2, 3, 4, 5]
```

또한 두 번째 인자로 추가할 아이템의 키를 지정할 수도 있습니다.

```
$collection = collect(['one' => 1, 'two' => 2]);

$collection->prepend(0, 'zero');

$collection->all();

// ['zero' => 0, 'one' => 1, 'two' => 2]
```

<a name="method-pull"></a>
#### `pull()`

`pull` 메서드는 지정한 키에 해당하는 아이템을 컬렉션에서 제거하고, 그 값을 반환합니다.

```
$collection = collect(['product_id' => 'prod-100', 'name' => 'Desk']);

$collection->pull('name');

// 'Desk'

$collection->all();

// ['product_id' => 'prod-100']
```

<a name="method-push"></a>
#### `push()`

`push` 메서드는 컬렉션의 맨 끝에 아이템을 추가합니다.

```
$collection = collect([1, 2, 3, 4]);

$collection->push(5);

$collection->all();

// [1, 2, 3, 4, 5]
```

<a name="method-put"></a>
#### `put()`

`put` 메서드는 컬렉션에 주어진 키와 값을 설정합니다.

```
$collection = collect(['product_id' => 1, 'name' => 'Desk']);

$collection->put('price', 100);

$collection->all();

// ['product_id' => 1, 'name' => 'Desk', 'price' => 100]
```

<a name="method-random"></a>
#### `random()`

`random` 메서드는 컬렉션에서 임의의 아이템 하나를 반환합니다.

```
$collection = collect([1, 2, 3, 4, 5]);

$collection->random();

// 4 - (랜덤으로 선택된 값)
```

`random` 메서드에 정수를 전달하면, 지정한 개수만큼 임의의 아이템을 반환합니다. 이 경우 항상 컬렉션이 반환됩니다.

```
$random = $collection->random(3);

$random->all();

// [2, 4, 5] - (랜덤으로 선택된 값)
```

컬렉션의 원소 개수가 요청한 수보다 적으면, `random` 메서드는 `InvalidArgumentException`을 발생시킵니다.

`random` 메서드는 클로저도 인수로 받을 수 있으며, 이 클로저에는 현재 컬렉션 인스턴스가 전달됩니다.

```
$random = $collection->random(fn ($items) => min(10, count($items)));

$random->all();

// [1, 2, 3, 4, 5] - (랜덤으로 선택된 값)
```

<a name="method-range"></a>
#### `range()`

`range` 메서드는 지정한 범위 내의 정수들로 구성된 컬렉션을 반환합니다.

```
$collection = collect()->range(3, 6);

$collection->all();

// [3, 4, 5, 6]
```

<a name="method-reduce"></a>
#### `reduce()`

`reduce` 메서드는 컬렉션을 하나의 값으로 줄여줍니다. 각 반복의 결과값을 다음 반복의 입력값으로 전달합니다.

```
$collection = collect([1, 2, 3]);

$total = $collection->reduce(function ($carry, $item) {
    return $carry + $item;
});

// 6
```

첫 번째 반복에서 `$carry`의 값은 `null`입니다. 하지만 두 번째 인자로 초기값을 지정할 수도 있습니다.

```
$collection->reduce(function ($carry, $item) {
    return $carry + $item;
}, 4);

// 10
```

연관 배열 컬렉션의 경우, `reduce` 메서드는 배열의 키도 콜백에 전달합니다.

```
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

$collection->reduce(function ($carry, $value, $key) use ($ratio) {
    return $carry + ($value * $ratio[$key]);
});

// 4264

```
<a name="method-reduce-spread"></a>
#### `reduceSpread()`

`reduceSpread` 메서드는 컬렉션을 값들의 배열로 줄여줍니다. 각 반복의 결과값(들)이 이후 반복의 입력으로 사용됩니다. 이 메서드는 `reduce`와 유사하지만, 여러 초기값을 받을 수 있다는 차이가 있습니다.

```
[$creditsRemaining, $batch] = Image::where('status', 'unprocessed')
    ->get()
    ->reduceSpread(function ($creditsRemaining, $batch, $image) {
        if ($creditsRemaining >= $image->creditsRequired()) {
            $batch->push($image);

            $creditsRemaining -= $image->creditsRequired();
        }

        return [$creditsRemaining, $batch];
    }, $creditsAvailable, collect());
```

<a name="method-reject"></a>
#### `reject()`

`reject` 메서드는 전달받은 클로저를 이용해 컬렉션을 걸러냅니다. 클로저가 `true`를 반환하는 아이템은 결과 컬렉션에서 제외됩니다.

```
$collection = collect([1, 2, 3, 4]);

$filtered = $collection->reject(function ($value, $key) {
    return $value > 2;
});

$filtered->all();

// [1, 2]
```

`reject` 메서드의 반대 동작을 하는 메서드는 [`filter`](#method-filter)입니다.

<a name="method-replace"></a>
#### `replace()`

`replace` 메서드는 `merge`와 비슷하게 동작합니다. 하지만 `replace` 메서드는 문자열 키뿐만 아니라 숫자 키가 일치하는 항목들도 기존 값을 덮어씁니다.

```
$collection = collect(['Taylor', 'Abigail', 'James']);

$replaced = $collection->replace([1 => 'Victoria', 3 => 'Finn']);

$replaced->all();

// ['Taylor', 'Victoria', 'James', 'Finn']
```

<a name="method-replacerecursive"></a>
#### `replaceRecursive()`

이 메서드는 `replace`와 유사하지만, 배열 구조 내부로 들어가서도 동일한 방식으로 값을 교체합니다.

```
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

`reverse` 메서드는 컬렉션의 아이템 순서를 반대로 뒤집지만, 원래의 키는 그대로 유지합니다.

```
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

`search` 메서드는 컬렉션에서 지정한 값을 찾아, 해당 키를 반환합니다. 값을 찾지 못하면 `false`를 반환합니다.

```
$collection = collect([2, 4, 6, 8]);

$collection->search(4);

// 1
```

검색은 "느슨한(loose) 비교"로 이루어지므로, 정수값 문자열도 같은 정수값으로 간주됩니다. "엄격한(strict) 비교"를 사용하려면 메서드의 두 번째 인수로 `true`를 전달하면 됩니다.

```
collect([2, 4, 6, 8])->search('4', $strict = true);

// false
```

또는, 직접 클로저를 전달하여 지정한 조건을 만족하는 첫 번째 아이템을 찾도록 할 수도 있습니다.

```
collect([2, 4, 6, 8])->search(function ($item, $key) {
    return $item > 5;
});

// 2
```

<a name="method-shift"></a>
#### `shift()`

`shift` 메서드는 컬렉션의 첫 번째 아이템을 제거하고 반환합니다.

```
$collection = collect([1, 2, 3, 4, 5]);

$collection->shift();

// 1

$collection->all();

// [2, 3, 4, 5]
```

`shift` 메서드에 정수를 전달하면, 컬렉션의 앞에서 여러 개의 아이템을 제거해 반환할 수 있습니다.

```
$collection = collect([1, 2, 3, 4, 5]);

$collection->shift(3);

// collect([1, 2, 3])

$collection->all();

// [4, 5]
```

<a name="method-shuffle"></a>
#### `shuffle()`

`shuffle` 메서드는 컬렉션의 아이템 순서를 무작위(랜덤)로 섞어줍니다.

```
$collection = collect([1, 2, 3, 4, 5]);

$shuffled = $collection->shuffle();

$shuffled->all();

// [3, 2, 5, 1, 4] - (랜덤으로 섞인 값)
```

<a name="method-skip"></a>

#### `skip()`

`skip` 메서드는 컬렉션의 처음부터 지정한 개수만큼의 요소를 제외한 새로운 컬렉션을 반환합니다.

```
$collection = collect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

$collection = $collection->skip(4);

$collection->all();

// [5, 6, 7, 8, 9, 10]
```

<a name="method-skipuntil"></a>
#### `skipUntil()`

`skipUntil` 메서드는 주어진 콜백이 `true`를 반환할 때까지 컬렉션의 항목을 건너뛴 뒤, 남은 항목들로 구성된 새로운 컬렉션 인스턴스를 반환합니다.

```
$collection = collect([1, 2, 3, 4]);

$subset = $collection->skipUntil(function ($item) {
    return $item >= 3;
});

$subset->all();

// [3, 4]
```

`skipUntil` 메서드에는 단순한 값을 전달하여, 해당 값이 나타날 때까지 모든 항목을 건너뛸 수도 있습니다.

```
$collection = collect([1, 2, 3, 4]);

$subset = $collection->skipUntil(3);

$subset->all();

// [3, 4]
```

> [!WARNING]
> 전달한 값이 존재하지 않거나, 콜백이 한 번도 `true`를 반환하지 않으면 `skipUntil` 메서드는 빈 컬렉션을 반환합니다.

<a name="method-skipwhile"></a>
#### `skipWhile()`

`skipWhile` 메서드는 주어진 콜백이 `true`를 반환하는 동안 컬렉션의 항목을 건너뛴 뒤, 남은 항목들로 새로운 컬렉션을 반환합니다.

```
$collection = collect([1, 2, 3, 4]);

$subset = $collection->skipWhile(function ($item) {
    return $item <= 3;
});

$subset->all();

// [4]
```

> [!WARNING]
> 만약 콜백이 한 번도 `false`를 반환하지 않으면, `skipWhile` 메서드는 빈 컬렉션을 반환합니다.

<a name="method-slice"></a>
#### `slice()`

`slice` 메서드는 지정한 인덱스부터 컬렉션을 잘라 반환합니다.

```
$collection = collect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

$slice = $collection->slice(4);

$slice->all();

// [5, 6, 7, 8, 9, 10]
```

만약 반환되는 슬라이스(조각)의 크기를 제한하고 싶다면, 두 번째 인자로 원하는 크기를 전달하면 됩니다.

```
$slice = $collection->slice(4, 2);

$slice->all();

// [5, 6]
```

반환된 슬라이스는 기본적으로 원래의 키를 유지합니다. 만약 원본 키를 유지하고 싶지 않다면, [`values`](#method-values) 메서드를 사용하여 인덱스를 다시 매길 수 있습니다.

<a name="method-sliding"></a>
#### `sliding()`

`sliding` 메서드는 컬렉션의 항목들을 "슬라이딩 윈도우" 방식으로 구분하여, 청크(조각)들의 새로운 컬렉션을 반환합니다.

```
$collection = collect([1, 2, 3, 4, 5]);

$chunks = $collection->sliding(2);

$chunks->toArray();

// [[1, 2], [2, 3], [3, 4], [4, 5]]
```

이 메서드는 [`eachSpread`](#method-eachspread)와 함께 사용할 때 특히 유용합니다.

```
$transactions->sliding(2)->eachSpread(function ($previous, $current) {
    $current->total = $previous->total + $current->amount;
});
```

옵션으로 두 번째 "step(스텝)" 값을 전달할 수 있습니다. 이 값은 각 청크의 첫 번째 요소 간의 거리를 지정합니다.

```
$collection = collect([1, 2, 3, 4, 5]);

$chunks = $collection->sliding(3, step: 2);

$chunks->toArray();

// [[1, 2, 3], [3, 4, 5]]
```

<a name="method-sole"></a>
#### `sole()`

`sole` 메서드는 주어진 조건을 만족하는 요소가 정확히 하나만 있을 때, 그 첫 번째 요소를 반환합니다.

```
collect([1, 2, 3, 4])->sole(function ($value, $key) {
    return $value === 2;
});

// 2
```

또는, 키/값 쌍을 전달하여 조건에 맞는 요소가 단 하나뿐일 때 해당 요소를 반환할 수 있습니다.

```
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 100],
]);

$collection->sole('product', 'Chair');

// ['product' => 'Chair', 'price' => 100]
```

또한, 인자를 전달하지 않고 `sole` 메서드를 호출하면 컬렉션에 요소가 하나만 있는 경우 그 요소를 반환합니다.

```
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
]);

$collection->sole();

// ['product' => 'Desk', 'price' => 200]
```

`sole` 메서드로 반환할 요소가 없다면 `\Illuminate\Collections\ItemNotFoundException` 예외가 발생합니다. 만약 조건에 맞는 요소가 둘 이상 존재하면 `\Illuminate\Collections\MultipleItemsFoundException` 예외가 발생합니다.

<a name="method-some"></a>
#### `some()`

[`contains`](#method-contains) 메서드의 별칭입니다.

<a name="method-sort"></a>
#### `sort()`

`sort` 메서드는 컬렉션을 정렬합니다. 정렬된 컬렉션은 원래의 배열 키를 유지하므로, 아래 예시에서는 [`values`](#method-values) 메서드를 사용하여 키를 0부터 순차적으로 재배열하고 있습니다.

```
$collection = collect([5, 3, 1, 2, 4]);

$sorted = $collection->sort();

$sorted->values()->all();

// [1, 2, 3, 4, 5]
```

좀 더 복잡하게 정렬을 하고 싶다면 콜백을 `sort` 메서드에 전달할 수 있습니다. 컬렉션의 `sort` 메서드는 내부적으로 [`uasort`](https://secure.php.net/manual/en/function.uasort.php#refsect1-function.uasort-parameters)를 호출하므로, 자세한 내용은 PHP 공식 문서를 참고하세요.

> [!NOTE]
> 컬렉션의 중첩 배열이나 객체를 정렬하려면 [`sortBy`](#method-sortby) 또는 [`sortByDesc`](#method-sortbydesc) 메서드를 참고하세요.

<a name="method-sortby"></a>
#### `sortBy()`

`sortBy` 메서드는 주어진 키(속성)를 기준으로 컬렉션을 정렬합니다. 정렬된 컬렉션은 원래 배열 키를 유지하므로, 예시에서는 [`values`](#method-values) 메서드로 인덱스를 초기화하고 있습니다.

```
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

`sortBy` 메서드에는 [정렬 플래그](https://www.php.net/manual/en/function.sort.php)도 두 번째 인자로 넘길 수 있습니다.

```
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

또는, 직접 정렬 기준을 정하고 싶다면 클로저를 전달해 정렬 방식을 지정할 수도 있습니다.

```
$collection = collect([
    ['name' => 'Desk', 'colors' => ['Black', 'Mahogany']],
    ['name' => 'Chair', 'colors' => ['Black']],
    ['name' => 'Bookcase', 'colors' => ['Red', 'Beige', 'Brown']],
]);

$sorted = $collection->sortBy(function ($product, $key) {
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

여러 속성을 기준으로 컬렉션을 정렬하려면, 각 정렬 기준(속성과 정렬 방향)을 배열 형태로 넘겨줄 수 있습니다.

```
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

여러 속성별 정렬 기준을 클로저로 직접 지정하는 것도 가능합니다.

```
$collection = collect([
    ['name' => 'Taylor Otwell', 'age' => 34],
    ['name' => 'Abigail Otwell', 'age' => 30],
    ['name' => 'Taylor Otwell', 'age' => 36],
    ['name' => 'Abigail Otwell', 'age' => 32],
]);

$sorted = $collection->sortBy([
    fn ($a, $b) => $a['name'] <=> $b['name'],
    fn ($a, $b) => $b['age'] <=> $a['age'],
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

<a name="method-sortbydesc"></a>
#### `sortByDesc()`

이 메서드는 [`sortBy`](#method-sortby)와 동일한 시그니처를 가지고 있으며, 정렬 결과만 반대로 반환합니다.

<a name="method-sortdesc"></a>
#### `sortDesc()`

이 메서드는 [`sort`](#method-sort) 메서드와 반대 순서로 컬렉션을 정렬합니다.

```
$collection = collect([5, 3, 1, 2, 4]);

$sorted = $collection->sortDesc();

$sorted->values()->all();

// [5, 4, 3, 2, 1]
```

`sort`와는 다르게, `sortDesc`에는 클로저를 전달할 수 없습니다. 커스텀 정렬이 필요하다면 [`sort`](#method-sort) 메서드를 사용하고 비교식을 반대로 작성해야 합니다.

<a name="method-sortkeys"></a>
#### `sortKeys()`

`sortKeys` 메서드는 내부의 연관 배열의 키를 기준으로 컬렉션을 정렬합니다.

```
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

이 메서드는 [`sortKeys`](#method-sortkeys) 메서드와 동일한 시그니처를 가지지만, 반대 순서로 정렬합니다.

<a name="method-sortkeysusing"></a>
#### `sortKeysUsing()`

`sortKeysUsing` 메서드는 내부 연관 배열의 키를, 제공한 콜백 함수를 사용하여 정렬합니다.

```
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

여기서 콜백 함수는 0보다 작거나, 같은 값, 또는 0보다 큰 정수를 반환하는 비교 함수여야 합니다. 자세한 내용은 PHP의 [`uksort`](https://www.php.net/manual/en/function.uksort.php#refsect1-function.uksort-parameters) 문서를 참고하세요. `sortKeysUsing` 메서드는 내부적으로 해당 PHP 함수를 사용합니다.

<a name="method-splice"></a>
#### `splice()`

`splice` 메서드는 지정한 인덱스부터 항목을 잘라내어 반환하며, 잘라낸 항목을 컬렉션에서 제거합니다.

```
$collection = collect([1, 2, 3, 4, 5]);

$chunk = $collection->splice(2);

$chunk->all();

// [3, 4, 5]

$collection->all();

// [1, 2]
```

잘라낼 항목의 개수를 제한하려면 두 번째 인자를 사용할 수 있습니다.

```
$collection = collect([1, 2, 3, 4, 5]);

$chunk = $collection->splice(2, 1);

$chunk->all();

// [3]

$collection->all();

// [1, 2, 4, 5]
```

또한, 세 번째 인자에 대체할 새로운 항목 배열을 전달하면, 잘라낸 자리 대신 새로운 항목으로 채워 넣을 수 있습니다.

```
$collection = collect([1, 2, 3, 4, 5]);

$chunk = $collection->splice(2, 1, [10, 11]);

$chunk->all();

// [3]

$collection->all();

// [1, 2, 10, 11, 4, 5]
```

<a name="method-split"></a>
#### `split()`

`split` 메서드는 컬렉션을 지정한 그룹 수만큼 나누어 반환합니다.

```
$collection = collect([1, 2, 3, 4, 5]);

$groups = $collection->split(3);

$groups->all();

// [[1, 2], [3, 4], [5]]
```

<a name="method-splitin"></a>
#### `splitIn()`

`splitIn` 메서드는 컬렉션을 지정한 그룹 수만큼 나누는데, 마지막 그룹에 남은 항목을 할당하기 전에 나머지 그룹을 최대한 채웁니다.

```
$collection = collect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

$groups = $collection->splitIn(3);

$groups->all();

// [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10]]
```

<a name="method-sum"></a>
#### `sum()`

`sum` 메서드는 컬렉션 내 모든 항목의 합계를 반환합니다.

```
collect([1, 2, 3, 4, 5])->sum();

// 15
```

컬렉션이 중첩 배열이나 객체를 포함하고 있다면, 합계를 구할 때 사용할 키를 지정할 수 있습니다.

```
$collection = collect([
    ['name' => 'JavaScript: The Good Parts', 'pages' => 176],
    ['name' => 'JavaScript: The Definitive Guide', 'pages' => 1096],
]);

$collection->sum('pages');

// 1272
```

직접 어떤 값을 더할지 클로저를 전달하여 지정할 수도 있습니다.

```
$collection = collect([
    ['name' => 'Chair', 'colors' => ['Black']],
    ['name' => 'Desk', 'colors' => ['Black', 'Mahogany']],
    ['name' => 'Bookcase', 'colors' => ['Red', 'Beige', 'Brown']],
]);

$collection->sum(function ($product) {
    return count($product['colors']);
});

// 6
```

<a name="method-take"></a>
#### `take()`

`take` 메서드는 지정한 개수만큼의 항목을 포함한 새로운 컬렉션을 반환합니다.

```
$collection = collect([0, 1, 2, 3, 4, 5]);

$chunk = $collection->take(3);

$chunk->all();

// [0, 1, 2]
```

음수를 전달하면, 컬렉션의 끝에서부터 지정한 개수만큼의 항목을 반환합니다.

```
$collection = collect([0, 1, 2, 3, 4, 5]);

$chunk = $collection->take(-2);

$chunk->all();

// [4, 5]
```

<a name="method-takeuntil"></a>
#### `takeUntil()`

`takeUntil` 메서드는 주어진 콜백이 `true`를 반환할 때까지 컬렉션의 항목을 반환합니다.

```
$collection = collect([1, 2, 3, 4]);

$subset = $collection->takeUntil(function ($item) {
    return $item >= 3;
});

$subset->all();

// [1, 2]
```

`takeUntil` 메서드에는 단순한 값을 전달해, 해당 값이 나올 때까지 항목을 반환할 수도 있습니다.

```
$collection = collect([1, 2, 3, 4]);

$subset = $collection->takeUntil(3);

$subset->all();

// [1, 2]
```

> [!WARNING]
> 주어진 값이 존재하지 않거나, 콜백이 한 번도 `true`를 반환하지 않으면, `takeUntil` 메서드는 컬렉션의 모든 항목을 반환합니다.

<a name="method-takewhile"></a>

#### `takeWhile()`

`takeWhile` 메서드는 주어진 콜백이 `false`를 반환할 때까지 컬렉션에서 항목을 반환합니다.

```
$collection = collect([1, 2, 3, 4]);

$subset = $collection->takeWhile(function ($item) {
    return $item < 3;
});

$subset->all();

// [1, 2]
```

> [!WARNING]
> 콜백이 한 번도 `false`를 반환하지 않으면, `takeWhile` 메서드는 컬렉션의 모든 항목을 반환합니다.

<a name="method-tap"></a>
#### `tap()`

`tap` 메서드는 컬렉션을 주어진 콜백에 전달하여, 컬렉션 자체에는 영향을 주지 않으면서 특정 시점에서 컬렉션의 항목을 "탭(tap)"하여 무언가를 할 수 있게 해줍니다. 이후 컬렉션은 `tap` 메서드에서 그대로 반환됩니다.

```
collect([2, 4, 3, 1, 5])
    ->sort()
    ->tap(function ($collection) {
        Log::debug('Values after sorting', $collection->values()->all());
    })
    ->shift();

// 1
```

<a name="method-times"></a>
#### `times()`

정적(static) 메서드인 `times`는 주어진 클로저를 지정한 횟수만큼 실행하여, 새 컬렉션을 생성합니다.

```
$collection = Collection::times(10, function ($number) {
    return $number * 9;
});

$collection->all();

// [9, 18, 27, 36, 45, 54, 63, 72, 81, 90]
```

<a name="method-toarray"></a>
#### `toArray()`

`toArray` 메서드는 컬렉션을 일반 PHP `array`로 변환합니다. 만약 컬렉션의 값이 [Eloquent](/docs/9.x/eloquent) 모델이라면, 그 모델들도 배열로 변환됩니다.

```
$collection = collect(['name' => 'Desk', 'price' => 200]);

$collection->toArray();

/*
    [
        ['name' => 'Desk', 'price' => 200],
    ]
*/
```

> [!WARNING]
> `toArray`는 컬렉션 내의 모든 중첩된 객체 중 `Arrayable` 인스턴스에 대해서도 배열로 변환합니다. 컬렉션에 내장된 원시 배열을 반환하려면 [`all`](#method-all) 메서드를 대신 사용하세요.

<a name="method-tojson"></a>
#### `toJson()`

`toJson` 메서드는 컬렉션을 JSON 직렬화된 문자열로 변환합니다.

```
$collection = collect(['name' => 'Desk', 'price' => 200]);

$collection->toJson();

// '{"name":"Desk", "price":200}'
```

<a name="method-transform"></a>
#### `transform()`

`transform` 메서드는 컬렉션을 순회하면서 해당 콜백을 각 항목에 실행하고, 콜백이 반환한 값으로 컬렉션의 항목을 변경합니다.

```
$collection = collect([1, 2, 3, 4, 5]);

$collection->transform(function ($item, $key) {
    return $item * 2;
});

$collection->all();

// [2, 4, 6, 8, 10]
```

> [!WARNING]
> 대부분의 다른 컬렉션 메서드와 달리, `transform`은 컬렉션 자체를 직접 변경합니다. 새로운 컬렉션을 생성하고 싶다면 [`map`](#method-map) 메서드를 사용하세요.

<a name="method-undot"></a>
#### `undot()`

`undot` 메서드는 "dot" 표기법을 사용하는 1차원 컬렉션을 다차원 컬렉션으로 확장합니다.

```
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

`union` 메서드는 주어진 배열을 컬렉션에 합칩니다. 만약 주어진 배열의 키가 기존 컬렉션에도 있다면, 기존 컬렉션의 값이 우선 사용됩니다.

```
$collection = collect([1 => ['a'], 2 => ['b']]);

$union = $collection->union([3 => ['c'], 1 => ['d']]);

$union->all();

// [1 => ['a'], 2 => ['b'], 3 => ['c']]
```

<a name="method-unique"></a>
#### `unique()`

`unique` 메서드는 컬렉션에서 중복되지 않는 모든 항목을 반환합니다. 반환되는 컬렉션은 원래의 키를 유지하므로, 아래 예제에선 키를 연속적인 인덱스로 재정렬하기 위해 [`values`](#method-values) 메서드를 함께 사용합니다.

```
$collection = collect([1, 1, 2, 2, 3, 4, 2]);

$unique = $collection->unique();

$unique->values()->all();

// [1, 2, 3, 4]
```

중첩된 배열이나 객체를 다룰 때는 고유성을 판단할 키를 지정할 수 있습니다.

```
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

마지막으로, 고유성을 판단하는 값을 지정하기 위해 직접 클로저를 전달할 수도 있습니다.

```
$unique = $collection->unique(function ($item) {
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

`unique` 메서드는 값 비교 시 "느슨한(loose)" 비교를 사용합니다. 즉, 정수 값의 문자열과 정수가 같은 값으로 간주됩니다. "엄격한(strict)" 비교를 사용해 필터링하려면 [`uniqueStrict`](#method-uniquestrict) 메서드를 사용하세요.

> [!NOTE]
> 이 메서드는 [Eloquent 컬렉션](/docs/9.x/eloquent-collections#method-unique)에서 사용할 때 동작 방식이 다를 수 있습니다.

<a name="method-uniquestrict"></a>
#### `uniqueStrict()`

이 메서드는 [`unique`](#method-unique) 메서드와 시그니처가 동일하나, 모든 값을 비교할 때 "엄격한(strict)" 비교를 사용합니다.

<a name="method-unless"></a>
#### `unless()`

`unless` 메서드는 첫 번째 인자로 전달된 값이 `true`로 평가되지 않는 경우, 주어진 콜백을 실행합니다.

```
$collection = collect([1, 2, 3]);

$collection->unless(true, function ($collection) {
    return $collection->push(4);
});

$collection->unless(false, function ($collection) {
    return $collection->push(5);
});

$collection->all();

// [1, 2, 3, 5]
```

또한 `unless` 메서드에는 두 번째 콜백을 전달할 수 있습니다. 두 번째 콜백은 첫 번째 인자가 `true`로 평가되는 경우 실행됩니다.

```
$collection = collect([1, 2, 3]);

$collection->unless(true, function ($collection) {
    return $collection->push(4);
}, function ($collection) {
    return $collection->push(5);
});

$collection->all();

// [1, 2, 3, 5]
```

`unless`의 반대 개념은 [`when`](#method-when) 메서드를 참고하세요.

<a name="method-unlessempty"></a>
#### `unlessEmpty()`

[`whenNotEmpty`](#method-whennotempty) 메서드의 별칭입니다.

<a name="method-unlessnotempty"></a>
#### `unlessNotEmpty()`

[`whenEmpty`](#method-whenempty) 메서드의 별칭입니다.

<a name="method-unwrap"></a>
#### `unwrap()`

정적 메서드인 `unwrap`은 가능하다면, 주어진 값에서 컬렉션의 원본 항목을 반환합니다.

```
Collection::unwrap(collect('John Doe'));

// ['John Doe']

Collection::unwrap(['John Doe']);

// ['John Doe']

Collection::unwrap('John Doe');

// 'John Doe'
```

<a name="method-value"></a>
#### `value()`

`value` 메서드는 컬렉션의 첫 번째 요소에서 지정한 키의 값을 반환합니다.

```
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Speaker', 'price' => 400],
]);

$value = $collection->value('price');

// 200
```

<a name="method-values"></a>
#### `values()`

`values` 메서드는 키가 연속된 정수로 재설정된 새로운 컬렉션을 반환합니다.

```
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

`when` 메서드는 첫 번째 인자로 전달된 값이 `true`로 평가되는 경우, 주어진 콜백을 실행합니다. 컬렉션 인스턴스와 함께 첫 번째 인자의 값도 클로저로 전달됩니다.

```
$collection = collect([1, 2, 3]);

$collection->when(true, function ($collection, $value) {
    return $collection->push(4);
});

$collection->when(false, function ($collection, $value) {
    return $collection->push(5);
});

$collection->all();

// [1, 2, 3, 4]
```

`when` 메서드에는 두 번째 콜백을 전달할 수 있습니다. 이 콜백은 첫 번째 인자가 `false`로 평가되는 경우 실행됩니다.

```
$collection = collect([1, 2, 3]);

$collection->when(false, function ($collection, $value) {
    return $collection->push(4);
}, function ($collection) {
    return $collection->push(5);
});

$collection->all();

// [1, 2, 3, 5]
```

`when`의 반대 개념은 [`unless`](#method-unless) 메서드를 참고하세요.

<a name="method-whenempty"></a>
#### `whenEmpty()`

컬렉션이 비어 있을 때, `whenEmpty` 메서드는 주어진 콜백을 실행합니다.

```
$collection = collect(['Michael', 'Tom']);

$collection->whenEmpty(function ($collection) {
    return $collection->push('Adam');
});

$collection->all();

// ['Michael', 'Tom']
```


```
$collection = collect();

$collection->whenEmpty(function ($collection) {
    return $collection->push('Adam');
});

$collection->all();

// ['Adam']
```

또한, `whenEmpty` 메서드에는 두 번째 클로저를 전달할 수 있습니다. 컬렉션이 비어 있지 않으면 이 클로저가 실행됩니다.

```
$collection = collect(['Michael', 'Tom']);

$collection->whenEmpty(function ($collection) {
    return $collection->push('Adam');
}, function ($collection) {
    return $collection->push('Taylor');
});

$collection->all();

// ['Michael', 'Tom', 'Taylor']
```

`whenEmpty`의 반대 개념은 [`whenNotEmpty`](#method-whennotempty) 메서드를 참고하세요.

<a name="method-whennotempty"></a>
#### `whenNotEmpty()`

컬렉션이 비어 있지 않을 때, `whenNotEmpty` 메서드는 주어진 콜백을 실행합니다.

```
$collection = collect(['michael', 'tom']);

$collection->whenNotEmpty(function ($collection) {
    return $collection->push('adam');
});

$collection->all();

// ['michael', 'tom', 'adam']
```


```
$collection = collect();

$collection->whenNotEmpty(function ($collection) {
    return $collection->push('adam');
});

$collection->all();

// []
```

또한, `whenNotEmpty` 메서드에는 두 번째 클로저를 전달할 수 있습니다. 컬렉션이 비어 있으면 이 클로저가 실행됩니다.

```
$collection = collect();

$collection->whenNotEmpty(function ($collection) {
    return $collection->push('adam');
}, function ($collection) {
    return $collection->push('taylor');
});

$collection->all();

// ['taylor']
```

`whenNotEmpty`의 반대 개념은 [`whenEmpty`](#method-whenempty) 메서드를 참고하세요.

<a name="method-where"></a>
#### `where()`

`where` 메서드는 주어진 키/값 쌍으로 컬렉션을 필터링합니다.

```
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

`where` 메서드는 값 비교 시 "느슨한(loose)" 비교를 사용합니다. 즉, 정수 값의 문자열과 정수가 같은 값으로 간주됩니다. "엄격한(strict)" 비교를 사용해 필터링하려면 [`whereStrict`](#method-wherestrict) 메서드를 사용하세요.

옵션으로, 두 번째 인자에 비교 연산자를 전달할 수 있습니다. 지원되는 연산자는: '===', '!==', '!=', '==', '=', '<>', '>', '<', '>=', '<=' 입니다.

```
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

이 메서드는 [`where`](#method-where) 메서드와 시그니처가 동일하나, 모든 값을 비교할 때 "엄격한(strict)" 비교를 사용합니다.

<a name="method-wherebetween"></a>
#### `whereBetween()`

`whereBetween` 메서드는 지정된 항목의 값이 주어진 범위 내에 있는지 판단하여 컬렉션을 필터링합니다.

```
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

`whereIn` 메서드는 항목의 값이 주어진 배열에 포함되지 않은 요소를 컬렉션에서 제거합니다.

```
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

`whereIn` 메서드 역시 값 비교 시 "느슨한(loose)" 비교를 사용합니다. "엄격한(strict)" 비교를 사용해 필터링하려면 [`whereInStrict`](#method-whereinstrict) 메서드를 사용하세요.

<a name="method-whereinstrict"></a>

#### `whereInStrict()`

이 메서드는 [`whereIn`](#method-wherein) 메서드와 동일한 시그니처를 가지지만, 모든 값을 "엄격" 비교(strict comparison) 방식으로 비교합니다.

<a name="method-whereinstanceof"></a>
#### `whereInstanceOf()`

`whereInstanceOf` 메서드는 컬렉션에서 지정한 클래스 타입의 인스턴스만 필터링하여 반환합니다.

```
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

`whereNotBetween` 메서드는 지정한 항목 값이 특정 범위 바깥에 있을 때만 해당 항목을 컬렉션에 남깁니다.

```
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

`whereNotIn` 메서드는 주어진 배열에 포함된 값을 가진 항목을 컬렉션에서 제거하여 반환합니다.

```
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

`whereNotIn` 메서드는 항목의 값을 확인할 때 "느슨한(loose)" 비교를 사용합니다. 즉, 정수값을 가진 문자열은 같은 값의 정수와 같다고 간주합니다. "엄격(strict)" 비교로 필터링하려면 [`whereNotInStrict`](#method-wherenotinstrict) 메서드를 사용하세요.

<a name="method-wherenotinstrict"></a>
#### `whereNotInStrict()`

이 메서드는 [`whereNotIn`](#method-wherenotin) 메서드와 동일한 시그니처를 가지지만, 모든 값을 "엄격" 비교(strict comparison)로 비교합니다.

<a name="method-wherenotnull"></a>
#### `whereNotNull()`

`whereNotNull` 메서드는 지정한 키의 값이 `null`이 아닌 항목만 컬렉션에 남깁니다.

```
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

`whereNull` 메서드는 지정한 키의 값이 `null`인 항목만 컬렉션에 남깁니다.

```
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

정적 메서드인 `wrap`은 가능한 경우, 전달받은 값을 컬렉션으로 감쌉니다.

```
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

`zip` 메서드는 원본 컬렉션 값과 전달받은 배열의 값을 각 인덱스별로 묶어서 새로운 컬렉션을 만듭니다.

```
$collection = collect(['Chair', 'Desk']);

$zipped = $collection->zip([100, 200]);

$zipped->all();

// [['Chair', 100], ['Desk', 200]]
```

<a name="higher-order-messages"></a>
## 고차 메시지(Higher Order Messages)

컬렉션에서는 "고차 메시지(Higher Order Messages)" 기능도 제공하여, 자주 사용하는 작업을 간단하게 작성할 수 있습니다. 고차 메시지를 지원하는 메서드는 다음과 같습니다: [`average`](#method-average), [`avg`](#method-avg), [`contains`](#method-contains), [`each`](#method-each), [`every`](#method-every), [`filter`](#method-filter), [`first`](#method-first), [`flatMap`](#method-flatmap), [`groupBy`](#method-groupby), [`keyBy`](#method-keyby), [`map`](#method-map), [`max`](#method-max), [`min`](#method-min), [`partition`](#method-partition), [`reject`](#method-reject), [`skipUntil`](#method-skipuntil), [`skipWhile`](#method-skipwhile), [`some`](#method-some), [`sortBy`](#method-sortby), [`sortByDesc`](#method-sortbydesc), [`sum`](#method-sum), [`takeUntil`](#method-takeuntil), [`takeWhile`](#method-takewhile), [`unique`](#method-unique).

각 고차 메시지는 컬렉션 인스턴스의 동적 프로퍼티처럼 사용할 수 있습니다. 예를 들어, 컬렉션 안에 있는 각 객체의 메서드를 호출할 때 `each` 고차 메시지를 사용할 수 있습니다.

```
use App\Models\User;

$users = User::where('votes', '>', 500)->get();

$users->each->markAsVip();
```

마찬가지로, `sum` 고차 메시지를 활용하여 사용자 컬렉션에서 "votes"의 총합을 쉽게 구할 수도 있습니다.

```
$users = User::where('group', 'Development')->get();

return $users->sum->votes;
```

<a name="lazy-collections"></a>
## 지연 컬렉션(Lazy Collections)

<a name="lazy-collection-introduction"></a>
### 소개

> [!WARNING]
> 라라벨의 지연 컬렉션(Lazy Collection)을 학습하기 전에, 반드시 [PHP 제너레이터](https://www.php.net/manual/en/language.generators.overview.php)에 대해 먼저 익숙해지는 것이 좋습니다.

이미 강력한 `Collection` 클래스를 보완하기 위해, `LazyCollection` 클래스는 PHP의 [제너레이터(generator)](https://www.php.net/manual/en/language.generators.overview.php)를 활용하여, 매우 큰 데이터셋을 다루면서도 메모리 사용량을 낮게 유지할 수 있도록 해줍니다.

예를 들어, 애플리케이션에서 여러 기가바이트 크기의 로그 파일을 처리하면서 라라벨의 컬렉션 메서드로 로그를 파싱해야 한다고 가정해봅시다. 전체 파일을 한 번에 메모리로 읽어들이는 대신, 지연 컬렉션을 사용하면 한 번에 파일의 일부만 메모리에 올리면서 처리할 수 있습니다.

```
use App\Models\LogEntry;
use Illuminate\Support\LazyCollection;

LazyCollection::make(function () {
    $handle = fopen('log.txt', 'r');

    while (($line = fgets($handle)) !== false) {
        yield $line;
    }
})->chunk(4)->map(function ($lines) {
    return LogEntry::fromLines($lines);
})->each(function (LogEntry $logEntry) {
    // 로그 항목을 처리...
});
```

또 다른 예로, 10,000개의 Eloquent 모델을 반복해야 할 때, 기존의 라라벨 컬렉션을 사용하면 10,000개의 모델이 한 번에 모두 메모리에 적재됩니다.

```
use App\Models\User;

$users = User::all()->filter(function ($user) {
    return $user->id > 500;
});
```

하지만 쿼리 빌더의 `cursor` 메서드는 `LazyCollection` 인스턴스를 반환하므로, 데이터베이스에는 쿼리를 한 번만 실행하고 메모리에는 한 번에 하나의 Eloquent 모델만 남길 수 있습니다. 다음 예제에서처럼, 실제로 각 사용자를 반복(iterate)할 때마다 `filter` 콜백이 실행되기 때문에, 메모리 사용량이 대폭 줄어듭니다.

```
use App\Models\User;

$users = User::cursor()->filter(function ($user) {
    return $user->id > 500;
});

foreach ($users as $user) {
    echo $user->id;
}
```

<a name="creating-lazy-collections"></a>
### 지연 컬렉션 생성하기

지연 컬렉션 인스턴스를 생성하려면, 컬렉션의 `make` 메서드에 PHP 제너레이터 함수를 전달해야 합니다.

```
use Illuminate\Support\LazyCollection;

LazyCollection::make(function () {
    $handle = fopen('log.txt', 'r');

    while (($line = fgets($handle)) !== false) {
        yield $line;
    }
});
```

<a name="the-enumerable-contract"></a>
### Enumerable 계약(Contract)

`Collection` 클래스에서 제공되는 거의 모든 메서드는 `LazyCollection` 클래스에서도 사용할 수 있습니다. 이 두 클래스는 모두 `Illuminate\Support\Enumerable` 계약을 구현하며, 이 계약에는 다음과 같은 메서드들이 정의되어 있습니다.

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
> 컬렉션을 변형(뮤테이트)하는 메서드(예: `shift`, `pop`, `prepend` 등)는 `LazyCollection` 클래스에서는 **지원되지 않습니다**.

<a name="lazy-collection-methods"></a>
### 지연 컬렉션(LazyCollection)의 메서드

`Enumerable` 계약에 정의된 메서드 외에도, `LazyCollection` 클래스에는 다음과 같은 메서드가 추가로 제공됩니다.

<a name="method-takeUntilTimeout"></a>
#### `takeUntilTimeout()`

`takeUntilTimeout` 메서드는 지정한 시간까지 값을 열거하다가, 그 시간이 지나면 컬렉션 순회를 중단하는 새로운 지연 컬렉션을 반환합니다.

```
$lazyCollection = LazyCollection::times(INF)
    ->takeUntilTimeout(now()->addMinute());

$lazyCollection->each(function ($number) {
    dump($number);

    sleep(1);
});

// 1
// 2
// ...
// 58
// 59
```

이 메서드의 사용 예시로, 데이터베이스에서 송장(invoices)을 커서(cursor)로 꺼내와 제출하는 애플리케이션이 있다고 가정해봅시다. 15분마다 실행되는 [스케줄링 작업](/docs/9.x/scheduling)을 정의하고, 한 번 실행할 때 최대 14분까지만 송장을 처리하도록 할 수 있습니다.

```
use App\Models\Invoice;
use Illuminate\Support\Carbon;

Invoice::pending()->cursor()
    ->takeUntilTimeout(
        Carbon::createFromTimestamp(LARAVEL_START)->add(14, 'minutes')
    )
    ->each(fn ($invoice) => $invoice->submit());
```

<a name="method-tapEach"></a>
#### `tapEach()`

`each` 메서드는 컬렉션의 모든 항목에 즉시 콜백을 실행하는 반면, `tapEach` 메서드는 항목이 컬렉션에서 하나씩 꺼내질 때마다 콜백을 실행합니다.

```
// 아직 아무것도 dump되지 않은 상태...
$lazyCollection = LazyCollection::times(INF)->tapEach(function ($value) {
    dump($value);
});

// 3개의 값만 dump됨...
$array = $lazyCollection->take(3)->all();

// 1
// 2
// 3
```

<a name="method-remember"></a>
#### `remember()`

`remember` 메서드는 한 번 열거한 값은 기억하고, 컬렉션을 다시 순회할 때 이미 열거한 값을 다시 가져오지 않는 새로운 지연 컬렉션을 반환합니다.

```
// 아직 쿼리가 실행되지 않음...
$users = User::cursor()->remember();

// 쿼리가 실행됨...
// 처음 5명의 사용자가 데이터베이스에서 조회됨...
$users->take(5)->all();

// 처음 5명의 사용자는 컬렉션의 캐시에서 가져옴...
// 나머지는 데이터베이스에서 조회됨...
$users->take(20)->all();
```