# Eloquent: 시작하기 (Eloquent: Getting Started)

- [소개](#introduction)
- [모델 클래스 생성](#generating-model-classes)
- [Eloquent 모델 관례](#eloquent-model-conventions)
    - [테이블 이름](#table-names)
    - [기본 키](#primary-keys)
    - [타임스탬프](#timestamps)
    - [데이터베이스 연결](#database-connections)
    - [기본 속성 값](#default-attribute-values)
- [모델 조회](#retrieving-models)
    - [컬렉션](#collections)
    - [결과 덩어리로 조회(청킹)](#chunking-results)
    - [지연 스트리밍 조회](#streaming-results-lazily)
    - [커서](#cursors)
    - [고급 서브쿼리](#advanced-subqueries)
- [단일 모델 / 집계 조회](#retrieving-single-models)
    - [모델 조회 또는 생성](#retrieving-or-creating-models)
    - [집계값 조회](#retrieving-aggregates)
- [모델 삽입 및 수정](#inserting-and-updating-models)
    - [삽입](#inserts)
    - [수정](#updates)
    - [대량 할당](#mass-assignment)
    - [업서트(upserts)](#upserts)
- [모델 삭제](#deleting-models)
    - [소프트 삭제](#soft-deleting)
    - [소프트 삭제된 모델 조회](#querying-soft-deleted-models)
- [모델 가지치기](#pruning-models)
- [모델 복제](#replicating-models)
- [쿼리 스코프(query scopes)](#query-scopes)
    - [전역 스코프](#global-scopes)
    - [로컬 스코프](#local-scopes)
- [모델 비교](#comparing-models)
- [이벤트](#events)
    - [클로저 사용](#events-using-closures)
    - [옵저버](#observers)
    - [이벤트 음소거](#muting-events)

<a name="introduction"></a>
## 소개

Laravel은 데이터베이스를 더 쉽게 다룰 수 있도록 해주는 객체 관계 매퍼(ORM)인 Eloquent를 기본으로 제공합니다. Eloquent를 사용할 때, 데이터베이스의 각 테이블은 해당 테이블과 상호작용하는 "모델(Model)"에 매핑됩니다. Eloquent 모델을 사용하면 데이터베이스로부터 레코드를 조회하는 것뿐만 아니라 레코드의 삽입, 수정, 삭제 등 다양한 작업도 간편하게 처리할 수 있습니다.

> [!TIP]
> 시작하기 전에, 애플리케이션의 `config/database.php` 설정 파일에서 데이터베이스 연결을 반드시 설정해야 합니다. 데이터베이스 설정에 대한 더 자세한 내용은 [데이터베이스 설정 문서](/docs/8.x/database#configuration)를 참고하세요.

<a name="generating-model-classes"></a>
## 모델 클래스 생성

먼저, Eloquent 모델을 하나 생성해보겠습니다. 모델 클래스는 보통 `app\Models` 디렉터리에 위치하며, `Illuminate\Database\Eloquent\Model` 클래스를 상속합니다. 새로운 모델을 생성하려면 `make:model` [Artisan 명령어](/docs/8.x/artisan)를 사용할 수 있습니다.

```
php artisan make:model Flight
```

모델을 생성할 때 동시에 [데이터베이스 마이그레이션](/docs/8.x/migrations) 파일도 함께 만들고 싶다면, `--migration` 또는 `-m` 옵션을 사용하세요.

```
php artisan make:model Flight --migration
```

모델 생성 시 팩토리, 시더, 정책, 컨트롤러, 폼 요청 등 다양한 클래스를 함께 만들 수도 있습니다. 여러 옵션을 조합해 한 번에 여러 클래스를 만들 수도 있습니다.

```bash
# 모델과 FlightFactory 클래스 생성...
php artisan make:model Flight --factory
php artisan make:model Flight -f

# 모델과 FlightSeeder 클래스 생성...
php artisan make:model Flight --seed
php artisan make:model Flight -s

# 모델과 FlightController 클래스 생성...
php artisan make:model Flight --controller
php artisan make:model Flight -c

# 모델, FlightController 리소스 클래스, 폼 요청 클래스 생성...
php artisan make:model Flight --controller --resource --requests
php artisan make:model Flight -crR

# 모델과 FlightPolicy 클래스 생성...
php artisan make:model Flight --policy

# 모델과 마이그레이션, 팩토리, 시더, 컨트롤러까지 생성...
php artisan make:model Flight -mfsc

# 모델, 마이그레이션, 팩토리, 시더, 정책, 컨트롤러, 폼 요청을 한번에 생성하는 단축키...
php artisan make:model Flight --all

# 피벗(pivot) 모델 생성...
php artisan make:model Member --pivot
```

<a name="eloquent-model-conventions"></a>
## Eloquent 모델 관례

`make:model` 명령어로 생성된 모델은 `app/Models` 디렉터리에 위치합니다. 이제 기본적인 모델 클래스 코드와, Eloquent의 중요한 관례들에 대해 알아보겠습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    //
}
```

<a name="table-names"></a>
### 테이블 이름

위 예시를 보면, `Flight` 모델이 어떤 데이터베이스 테이블과 연결되는지 직접 지정하지 않았습니다. Eloquent에서는 기본적으로 클래스명을 "스네이크 케이스 + 복수형"으로 변환한 이름을 테이블명으로 사용합니다. 즉, 이 경우 `Flight` 모델은 `flights` 테이블을, `AirTrafficController` 모델은 `air_traffic_controllers` 테이블을 사용하게 됩니다.

만약 모델과 매칭되는 데이터베이스 테이블 이름이 이 규칙을 따르지 않는 경우, 모델의 `table` 속성(property)을 정의하여 테이블 이름을 직접 지정할 수 있습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * 모델이 참조하는 테이블명
     *
     * @var string
     */
    protected $table = 'my_flights';
}
```

<a name="primary-keys"></a>
### 기본 키

Eloquent는 기본적으로 데이터베이스 테이블에 `id`라는 이름의 기본 키 컬럼이 있을 것으로 가정합니다. 다른 컬럼을 기본 키로 사용하고 싶을 경우, 모델에서 프로퍼티 `$primaryKey`를 정의해 해당 컬럼명을 지정할 수 있습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * 테이블의 기본 키 컬럼명
     *
     * @var string
     */
    protected $primaryKey = 'flight_id';
}
```

또한, Eloquent는 기본 키가 자동 증가하는 정수형(integer) 값이라고 가정하기 때문에, 기본 키 값을 자동으로 integer로 변환합니다. 만약 자동 증가가 아니거나 숫자가 아닌 값을 기본 키로 사용하고자 한다면, 모델에 public `$incrementing` 속성을 `false`로 설정해야 합니다.

```
<?php

class Flight extends Model
{
    /**
     * 모델의 ID가 자동 증가하는지 여부
     *
     * @var bool
     */
    public $incrementing = false;
}
```

그리고 기본 키가 정수가 아니라면, 모델에 protected `$keyType` 속성을 `string`으로 지정하면 됩니다.

```
<?php

class Flight extends Model
{
    /**
     * 자동 증가 ID의 데이터타입
     *
     * @var string
     */
    protected $keyType = 'string';
}
```

<a name="composite-primary-keys"></a>
#### "복합" 기본 키

Eloquent는 각 모델이 최소 하나의 고유하게 식별 가능한 "ID" 값을 가져야 한다고 요구합니다. 즉, Eloquent 모델은 "복합(Composite)" 기본 키(여러 컬럼으로 이루어진 기본 키)를 지원하지 않습니다. 그러나, 기본 키 외에 여러 컬럼으로 구성된 유니크 인덱스를 데이터베이스에 추가하는 것은 자유롭게 할 수 있습니다.

<a name="timestamps"></a>
### 타임스탬프

Eloquent는 기본적으로 모델과 매칭되는 데이터베이스 테이블에 `created_at`과 `updated_at` 컬럼이 있다고 가정합니다. 모델이 생성되거나 수정될 때 이 컬럼의 값은 Eloquent가 자동으로 관리해줍니다. Eloquent가 이러한 컬럼을 자동으로 관리하지 않도록 하려면, 모델에 `$timestamps` 속성을 `false`로 설정하면 됩니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * 모델이 타임스탬프를 사용할지 여부
     *
     * @var bool
     */
    public $timestamps = false;
}
```

타임스탬프의 저장 형식을 커스텀하고 싶으면, 모델의 `$dateFormat` 속성을 정의할 수 있습니다. 이 속성은 날짜 관련 속성들이 데이터베이스에 저장될 때나, 배열 또는 JSON으로 직렬화될 때 어떤 형식으로 변환되는지 결정합니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * 모델의 날짜 컬럼 저장 형식
     *
     * @var string
     */
    protected $dateFormat = 'U';
}
```

타임스탬프로 사용되는 컬럼명 자체를 커스텀하고 싶으면, 모델에 `CREATED_AT` 및 `UPDATED_AT` 상수를 정의할 수 있습니다.

```
<?php

class Flight extends Model
{
    const CREATED_AT = 'creation_date';
    const UPDATED_AT = 'updated_date';
}
```

<a name="database-connections"></a>
### 데이터베이스 연결

Eloquent 모델은 기본적으로 애플리케이션에 설정된 기본 데이터베이스 연결을 사용합니다. 특정 모델에서 별도의 데이터베이스 연결을 사용하고 싶으면, 모델에 `$connection` 속성을 정의하여 원하는 연결명을 지정하세요.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * 모델이 사용할 데이터베이스 연결명
     *
     * @var string
     */
    protected $connection = 'sqlite';
}
```

<a name="default-attribute-values"></a>
### 기본 속성 값

새로운 모델 인스턴스를 생성하면 기본적으로 속성(attribute) 값이 비어 있게 됩니다. 만약 일부 속성의 기본값을 지정하고 싶다면, 모델에 `$attributes` 속성을 배열로 정의하면 됩니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * 모델의 기본 속성 값들
     *
     * @var array
     */
    protected $attributes = [
        'delayed' => false,
    ];
}
```

<a name="retrieving-models"></a>
## 모델 조회

모델과 [연관된 데이터베이스 테이블](/docs/8.x/migrations#writing-migrations)을 생성했다면, 이제 데이터베이스에서 데이터를 조회할 준비가 된 것입니다. 각각의 Eloquent 모델은 매우 강력한 [쿼리 빌더](/docs/8.x/queries) 역할을 하며, 해당 모델이 매핑된 테이블에 대해 자유롭게 쿼리를 작성할 수 있습니다. 모델의 `all` 메서드를 사용하면 모델과 관련된 테이블의 모든 레코드를 가져옵니다.

```
use App\Models\Flight;

foreach (Flight::all() as $flight) {
    echo $flight->name;
}
```

<a name="building-queries"></a>
#### 쿼리 작성

Eloquent의 `all` 메서드는 모델 테이블의 모든 결과를 반환합니다. 하지만, 각 Eloquent 모델은 [쿼리 빌더](/docs/8.x/queries)로 동작하기 때문에, 쿼리에 다양한 조건을 추가하고 `get` 메서드를 호출해 원하는 결과만 조회할 수도 있습니다.

```
$flights = Flight::where('active', 1)
               ->orderBy('name')
               ->take(10)
               ->get();
```

> [!TIP]
> Eloquent 모델은 쿼리 빌더이기도 하므로, Laravel의 [쿼리 빌더](/docs/8.x/queries)가 제공하는 모든 메서드를 사용할 수 있습니다. Eloquent 쿼리를 작성할 때 이 메서드들을 적극적으로 활용해 보세요.

<a name="refreshing-models"></a>
#### 모델 새로고침

이미 데이터베이스로부터 조회해온 Eloquent 모델 인스턴스가 있다면, `fresh` 또는 `refresh` 메서드를 사용해 모델을 "새로고침"할 수 있습니다. `fresh` 메서드는 모델을 데이터베이스에서 다시 가져오며, 기존 인스턴스에는 아무 영향도 주지 않습니다.

```
$flight = Flight::where('number', 'FR 900')->first();

$freshFlight = $flight->fresh();
```

`refresh` 메서드는 기존 모델 인스턴스 자체를 데이터베이스의 최신 정보로 갱신합니다. 또한 해당 모델에서 이미 로드된 연관관계 정보도 함께 갱신됩니다.

```
$flight = Flight::where('number', 'FR 900')->first();

$flight->number = 'FR 456';

$flight->refresh();

$flight->number; // "FR 900"
```

<a name="collections"></a>
### 컬렉션

`all`이나 `get`과 같이 여러 레코드를 조회하는 메서드는 단순한 PHP 배열을 반환하지 않고, `Illuminate\Database\Eloquent\Collection` 인스턴스를 반환합니다.

Eloquent의 `Collection` 클래스는 Laravel의 기본 클래스인 `Illuminate\Support\Collection`을 확장하며, [데이터 컬렉션을 다루는 다양한 유용한 메서드](/docs/8.x/collections#available-methods)를 제공합니다. 예를 들어, `reject` 메서드를 사용하면 클로저에서 반환된 값에 따라 조건에 맞는 모델만 컬렉션에서 걸러낼 수 있습니다.

```php
$flights = Flight::where('destination', 'Paris')->get();

$flights = $flights->reject(function ($flight) {
    return $flight->cancelled;
});
```

Laravel의 기본 컬렉션 클래스에서 제공하는 메서드 외에도, Eloquent용 컬렉션 클래스는 [Eloquent 모델 컬렉션에 특화된 몇 가지 추가 메서드](/docs/8.x/eloquent-collections#available-methods)도 제공합니다.

Laravel의 모든 컬렉션은 PHP의 반복 가능(iterable) 인터페이스를 구현하므로, 마치 배열처럼 자유롭게 반복문을 사용할 수 있습니다.

```php
foreach ($flights as $flight) {
    echo $flight->name;
}
```

<a name="chunking-results"></a>
### 결과 덩어리로 조회(청킹)

`all` 또는 `get` 메서드로 수만 개 이상의 Eloquent 레코드를 한꺼번에 불러오면 메모리가 부족해질 수 있습니다. 이런 경우에는 `chunk` 메서드를 사용하면 훨씬 효율적으로 대량의 모델을 다룰 수 있습니다.

`chunk` 메서드는 Eloquent 모델의 일부만 가져와서, 이를 클로저에 전달하여 처리하게 해줍니다. 한 번에 현재 덩어리(chunk)의 데이터만을 메모리에 올리기 때문에, 많은 모델을 다룰 때 메모리 사용량을 크게 줄일 수 있습니다.

```php
use App\Models\Flight;

Flight::chunk(200, function ($flights) {
    foreach ($flights as $flight) {
        //
    }
});
```

`chunk` 메서드의 첫 번째 인자는 한 번에 가져올 레코드 수이며, 두 번째 인자로 전달된 클로저는 데이터베이스에서 각각의 덩어리가 반환될 때마다 호출됩니다. 덩어리마다 별도의 쿼리가 실행되어 레코드가 반환되고, 이 레코드들은 클로저로 전달됩니다.

만약 결과 집합에서 특정 컬럼을 기준으로, 해당 컬럼을 반복문에서 직접 업데이트할 때는, `chunk` 대신 `chunkById` 메서드를 사용하는 것이 안전합니다. 이런 경우에 `chunk`를 사용하면 예기치 못한 결과가 나올 수 있습니다. 내부적으로 `chunkById`는 이전 덩어리의 마지막 모델보다 큰 `id` 값을 가진 모델만 조회하여 안전하게 동작합니다.

```php
Flight::where('departed', true)
    ->chunkById(200, function ($flights) {
        $flights->each->update(['departed' => false]);
    }, $column = 'id');
```

<a name="streaming-results-lazily"></a>
### 지연 스트리밍 조회

`lazy` 메서드는 [chunk 메서드](#chunking-results)와 비슷하게 내부적으로 데이터를 덩어리 단위로 쿼리합니다. 그러나 각 덩어리를 즉시 콜백에 넘겨주는 대신, `lazy`는 Eloquent 모델의 평탄화된 [`LazyCollection`](/docs/8.x/collections#lazy-collections)을 반환합니다. 이를 통해 하나의 스트림처럼 결과에 연속적으로 접근할 수 있습니다.

```php
use App\Models\Flight;

foreach (Flight::lazy() as $flight) {
    //
}
```

`lazy` 메서드로 반환된 데이터를 반복하면서, 동시에 해당 컬럼을 업데이트하는 경우에는 `lazyById` 메서드를 사용해야 합니다. `lazyById`는 내부적으로 이전 덩어리의 마지막 모델보다 큰 `id`를 가진 레코드만을 조회하여, 일관성을 보장합니다.

```php
Flight::where('departed', true)
    ->lazyById(200, $column = 'id')
    ->each->update(['departed' => false]);
```

`lazyByIdDesc` 메서드를 사용하면, `id` 컬럼의 내림차순 기준으로 결과를 필터링할 수도 있습니다.

<a name="cursors"></a>
### 커서

`lazy` 메서드와 유사하게, `cursor` 메서드를 사용하면 수만 개에 달하는 Eloquent 모델을 반복 처리할 때 애플리케이션의 메모리 사용량을 크게 줄일 수 있습니다.

`cursor` 메서드는 단 하나의 데이터베이스 쿼리만 실행하지만, 실제로 데이터를 반복할 때마다 한 번씩 한 개의 Eloquent 모델이 적재되어 메모리에 오릅니다. 따라서 순회 도중에는 항상 오직 하나의 모델만 메모리에 유지됩니다.

> [!NOTE]
> `cursor` 메서드는 한 번에 하나의 모델만 메모리 상에 올려놓기 때문에, 연관관계(eager loading)는 지원하지 않습니다. 연관관계를 미리 로드해야 한다면 [lazy 메서드](#streaming-results-lazily)를 사용하는 것이 좋습니다.

내부적으로 `cursor` 메서드는 PHP의 [제너레이터(generator)](https://www.php.net/manual/en/language.generators.overview.php)를 사용하여 이 기능을 구현합니다.

```php
use App\Models\Flight;

foreach (Flight::where('destination', 'Zurich')->cursor() as $flight) {
    //
}
```

`cursor` 메서드는 `Illuminate\Support\LazyCollection` 인스턴스를 반환합니다. [Lazy 컬렉션](/docs/8.x/collections#lazy-collections)은 일반 Laravel 컬렉션에서 사용 가능한 다양한 메서드를 사용할 수 있지만, 한 번에 단 하나의 모델만 메모리에 올려 효율성을 높입니다.

```php
use App\Models\User;

$users = User::cursor()->filter(function ($user) {
    return $user->id > 500;
});

foreach ($users as $user) {
    echo $user->id;
}
```

비록 `cursor` 메서드는 일반 쿼리보다 훨씬 적은 메모리를 사용하지만, 결국에는 메모리가 부족할 수 있습니다. 이는 [PHP의 PDO 드라이버가 쿼리 결과(raw query results)를 내부 버퍼에 모두 캐싱하기 때문](https://www.php.net/manual/en/mysqlinfo.concepts.buffering.php)입니다. 정말 방대한 수의 Eloquent 레코드를 다뤄야 한다면 [lazy 메서드](#streaming-results-lazily)를 사용하는 것이 더 안전합니다.

<a name="advanced-subqueries"></a>
### 고급 서브쿼리

<a name="subquery-selects"></a>
#### 서브쿼리 Select

Eloquent는 고급 서브쿼리 기능도 제공합니다. 이를 이용하면 연관 테이블의 정보를 한 번의 쿼리로 가져올 수 있습니다. 예를 들어, 비행기 `destinations` 테이블과 각 목적지로 향하는 `flights` 테이블이 있다고 가정하겠습니다. `flights` 테이블에는 해당 비행편이 도착한 시각인 `arrived_at` 컬럼이 포함되어 있습니다.

쿼리 빌더의 `select`와 `addSelect` 메서드를 활용하여, 각 목적지별로 가장 최근에 도착한 비행편의 이름을 한 번에 조회해 가져올 수 있습니다.

```
use App\Models\Destination;
use App\Models\Flight;

return Destination::addSelect(['last_flight' => Flight::select('name')
    ->whereColumn('destination_id', 'destinations.id')
    ->orderByDesc('arrived_at')
    ->limit(1)
])->get();
```

<a name="subquery-ordering"></a>
#### 서브쿼리 정렬

또한, 쿼리 빌더의 `orderBy` 함수도 서브쿼리를 지원합니다. 앞선 예시로, 마지막 비행기가 언제 도착했는지 기준으로 목적지 테이블을 정렬할 수 있습니다. 역시 단 한 번의 데이터베이스 쿼리로 가능합니다.

```
return Destination::orderByDesc(
    Flight::select('arrived_at')
        ->whereColumn('destination_id', 'destinations.id')
        ->orderByDesc('arrived_at')
        ->limit(1)
)->get();
```

<a name="retrieving-single-models"></a>
## 단일 모델 / 집계 조회

특정 쿼리에 일치하는 모든 레코드를 조회하는 것 외에도, `find`, `first`, `firstWhere`와 같은 메서드를 사용하면 단일 레코드를 가져올 수도 있습니다. 이 경우 컬렉션이 아닌, 하나의 모델 인스턴스가 반환됩니다.

```
use App\Models\Flight;

// 기본 키로 모델 조회...
$flight = Flight::find(1);

// 쿼리 조건에 일치하는 첫 번째 모델 조회...
$flight = Flight::where('active', 1)->first();

// 쿼리 조건에 일치하는 첫 번째 모델을 조회하는 또 다른 방법...
$flight = Flight::firstWhere('active', 1);
```

가끔 쿼리의 첫 번째 결과를 가져오거나, 결과가 없으면 다른 작업을 수행하고 싶을 수 있습니다. `firstOr` 메서드는 조건에 맞는 첫 번째 결과를 반환하거나, 결과가 없을 경우 제공한 클로저를 실행합니다. 이 클로저에서 반환된 값이 `firstOr`의 결과가 됩니다.

```
$model = Flight::where('legs', '>', 3)->firstOr(function () {
    // ...
});
```

<a name="not-found-exceptions"></a>
#### Not Found 예외

모델이 존재하지 않을 때 예외를 발생시키고 싶을 때가 있습니다. 라우트나 컨트롤러에서 특히 유용합니다. `findOrFail`, `firstOrFail` 메서드는 쿼리의 첫 번째 결과를 조회하며, 결과가 존재하지 않을 경우 `Illuminate\Database\Eloquent\ModelNotFoundException` 예외가 발생합니다.

```
$flight = Flight::findOrFail(1);

$flight = Flight::where('legs', '>', 3)->firstOrFail();
```

`ModelNotFoundException` 예외가 잡히지 않으면, 클라이언트에 HTTP 404 응답이 자동으로 반환됩니다.

```
use App\Models\Flight;

Route::get('/api/flights/{id}', function ($id) {
    return Flight::findOrFail($id);
});
```

<a name="retrieving-or-creating-models"></a>
### 모델 조회 또는 생성

`firstOrCreate` 메서드는 지정된 컬럼/값 조합으로 데이터베이스 레코드를 찾으려고 시도합니다. 해당 모델이 데이터베이스에 존재하지 않으면, 첫 번째 배열 인자와 두 번째(선택) 배열 인자를 병합하여 레코드를 새로 삽입합니다.

`firstOrNew` 메서드는 `firstOrCreate`와 비슷하게 지정한 속성에 맞는 레코드를 찾으려고 하지만, 모델이 존재하지 않을 경우 새 모델 인스턴스만 반환합니다. 주의할 점은, `firstOrNew`가 반환하는 모델 인스턴스는 아직 데이터베이스에 저장되지 않았으므로, 직접 `save` 메서드를 호출하여 저장해야 합니다.

```
use App\Models\Flight;

// 이름으로 flight 조회, 없으면 새로 생성...
$flight = Flight::firstOrCreate([
    'name' => 'London to Paris'
]);

// 이름으로 flight 조회, 없으면 name, delayed, arrival_time까지 설정해 생성...
$flight = Flight::firstOrCreate(
    ['name' => 'London to Paris'],
    ['delayed' => 1, 'arrival_time' => '11:30']
);

// 이름으로 flight 조회, 없으면 새 Flight 인스턴스 반환...
$flight = Flight::firstOrNew([
    'name' => 'London to Paris'
]);

// 이름으로 flight 조회, 없으면 name, delayed, arrival_time까지 설정해 새 인스턴스 반환...
$flight = Flight::firstOrNew(
    ['name' => 'Tokyo to Sydney'],
    ['delayed' => 1, 'arrival_time' => '11:30']
);
```

<a name="retrieving-aggregates"></a>

### 집계값 조회하기

Eloquent 모델을 사용할 때, Laravel [쿼리 빌더](/docs/8.x/queries)가 제공하는 `count`, `sum`, `max`와 같은 [집계 메서드](/docs/8.x/queries#aggregates)를 사용할 수도 있습니다. 예상할 수 있듯이, 이러한 메서드는 Eloquent 모델 인스턴스를 반환하는 대신 스칼라(단일 값) 값을 반환합니다.

```
$count = Flight::where('active', 1)->count();

$max = Flight::where('active', 1)->max('price');
```

<a name="inserting-and-updating-models"></a>
## 모델 삽입 & 업데이트

<a name="inserts"></a>
### 레코드 삽입

물론 Eloquent를 사용할 때 데이터베이스에서 모델을 조회하는 것뿐 아니라, 새로운 레코드를 추가해야 하는 경우도 있습니다. Eloquent는 이를 아주 쉽게 처리할 수 있게 도와줍니다. 데이터베이스에 새 레코드를 삽입하려면, 먼저 모델 인스턴스를 생성하고 원하는 속성(attribute)을 설정한 뒤, 그 인스턴스에서 `save` 메서드를 호출하면 됩니다.

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Flight;
use Illuminate\Http\Request;

class FlightController extends Controller
{
    /**
     * Store a new flight in the database.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        // Validate the request...

        $flight = new Flight;

        $flight->name = $request->name;

        $flight->save();
    }
}
```

위 예제에서는, 들어온 HTTP 요청의 `name` 필드를 `App\Models\Flight` 모델 인스턴스의 `name` 속성에 할당합니다. `save` 메서드를 호출하면 해당 값이 데이터베이스에 삽입됩니다. 또한, `save` 메서드가 호출될 때 모델의 `created_at` 및 `updated_at` 타임스탬프가 자동으로 설정되므로 직접 값을 지정할 필요가 없습니다.

또한, `create` 메서드를 사용해 한 줄의 PHP 코드만으로도 새로운 모델을 "저장"할 수 있습니다. `create` 메서드는 삽입된 모델 인스턴스를 반환합니다.

```
use App\Models\Flight;

$flight = Flight::create([
    'name' => 'London to Paris',
]);
```

단, `create` 메서드를 사용하기 전에 모델에 `fillable` 또는 `guarded` 속성을 정의해주어야 합니다. Eloquent 모델은 기본적으로 대량 할당(mass assignment) 보안 취약점으로부터 보호되기 때문입니다. 대량 할당에 대해 더 자세히 알고 싶다면 [대량 할당 문서](#mass-assignment)를 참고하시기 바랍니다.

<a name="updates"></a>
### 레코드 업데이트

`save` 메서드는 이미 데이터베이스에 존재하는 모델을 업데이트할 때도 사용할 수 있습니다. 모델을 업데이트하려면, 먼저 해당 모델을 조회한 뒤, 수정할 속성을 변경하고 다시 `save` 메서드를 호출하면 됩니다. 이때도 `updated_at` 타임스탬프가 자동으로 갱신되니 별도로 관리할 필요가 없습니다.

```
use App\Models\Flight;

$flight = Flight::find(1);

$flight->name = 'Paris to London';

$flight->save();
```

<a name="mass-updates"></a>
#### 대량 업데이트

특정 조건에 맞는 여러 모델을 한 번에 업데이트할 수도 있습니다. 아래 예제에서는 `active`가 1이고, `destination` 컬럼 값이 `San Diego`인 모든 항공편을 지연(delayed) 상태로 변경합니다.

```
Flight::where('active', 1)
      ->where('destination', 'San Diego')
      ->update(['delayed' => 1]);
```

`update` 메서드는 '컬럼명 => 값' 꼴의 배열을 받아, 해당 컬럼들을 수정합니다. 또한, 이 메서드는 영향을 받은 행(row)의 개수를 반환합니다.

> [!NOTE]
> Eloquent를 통해 대량 업데이트를 실행할 때는, 해당 모델에 대해 `saving`, `saved`, `updating`, `updated` 이벤트가 발생하지 않습니다. 이는 대량 업데이트에서는 실제로 모델을 조회하지 않기 때문입니다.

<a name="examining-attribute-changes"></a>
#### 속성 변경 사항 확인하기

Eloquent는 모델의 내부 상태를 확인하고, 모델이 처음 조회되었을 때와 비교하여 속성이 어떻게 변경되었는지 파악할 수 있도록 `isDirty`, `isClean`, `wasChanged` 메서드를 제공합니다.

`isDirty` 메서드는 모델 인스턴스가 조회된 이후, 속성이 변경되었는지 여부를 판단합니다. 특정 속성을 지정하여 그 속성만 변경되었는지 확인할 수도 있습니다. 반대로, `isClean` 메서드는 속성이 변경되지 않았음을 확인하는 데 사용하며, 이 역시 속성명을 인수로 받을 수 있습니다.

```
use App\Models\User;

$user = User::create([
    'first_name' => 'Taylor',
    'last_name' => 'Otwell',
    'title' => 'Developer',
]);

$user->title = 'Painter';

$user->isDirty(); // true
$user->isDirty('title'); // true
$user->isDirty('first_name'); // false

$user->isClean(); // false
$user->isClean('title'); // false
$user->isClean('first_name'); // true

$user->save();

$user->isDirty(); // false
$user->isClean(); // true
```

`wasChanged` 메서드는 현재 요청 사이클에서 마지막으로 저장(save)될 때 어떤 속성이 실제로 변경되었는지를 확인합니다. 필요하다면 속성명을 지정해, 특정 속성이 변경되었는지 알 수 있습니다.

```
$user = User::create([
    'first_name' => 'Taylor',
    'last_name' => 'Otwell',
    'title' => 'Developer',
]);

$user->title = 'Painter';

$user->save();

$user->wasChanged(); // true
$user->wasChanged('title'); // true
$user->wasChanged('first_name'); // false
```

`getOriginal` 메서드를 사용하면, 모델이 조회된 이후 어떤 변경이 있더라도, 모델의 원본 속성값(들)을 배열로 얻을 수 있습니다. 특정 속성의 원래 값을 조회하고 싶다면 속성명을 인수로 전달할 수 있습니다.

```
$user = User::find(1);

$user->name; // John
$user->email; // john@example.com

$user->name = "Jack";
$user->name; // Jack

$user->getOriginal('name'); // John
$user->getOriginal(); // 모든 원본 속성의 배열...
```

<a name="mass-assignment"></a>
### 대량 할당(Mass Assignment)

하나의 PHP 구문으로 새로운 모델을 "저장"하려면 `create` 메서드를 사용할 수 있습니다. 이 메서드는 삽입된 모델 인스턴스를 반환합니다.

```
use App\Models\Flight;

$flight = Flight::create([
    'name' => 'London to Paris',
]);
```

단, 위에서처럼 `create` 메서드를 사용하려면 모델 클래스에 반드시 `fillable` 또는 `guarded` 속성을 지정해주어야 합니다. Eloquent 모델은 기본적으로 대량 할당 취약점으로부터 보호되기 때문입니다.

대량 할당 취약점이란, 사용자가 예상하지 않은 HTTP 요청 필드를 전달할 경우, 당신이 의도하지 않은 데이터베이스 컬럼이 변경되는 현상을 말합니다. 예를 들어, 악의적인 사용자가 HTTP 요청에 `is_admin` 값까지 전달하면, 이 값이 모델의 `create` 메서드에 그대로 넘어가 관리자 권한이 부여될 수도 있습니다.

따라서 대량 할당을 안전하게 사용하려면, 어떤 속성을 대량 할당 가능하게 할지 `$fillable` 속성에 지정해야 합니다. 아래와 같이 `Flight` 모델의 `name` 속성을 대량 할당 가능하게 지정해 보겠습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['name'];
}
```

어떤 속성들이 대량 할당 가능한지 지정했다면, 이제 `create` 메서드를 자유롭게 사용할 수 있습니다. `create` 메서드는 새로 생성된 모델 인스턴스를 반환합니다.

```
$flight = Flight::create(['name' => 'London to Paris']);
```

이미 모델 인스턴스를 가지고 있을 때는 `fill` 메서드를 이용해 속성값을 한 번에 할당할 수 있습니다.

```
$flight->fill(['name' => 'Amsterdam to Frankfurt']);
```

<a name="mass-assignment-json-columns"></a>
#### 대량 할당과 JSON 컬럼

JSON 컬럼에 대량 할당을 적용할 때는, 각 컬럼명을 모델의 `$fillable` 배열에 반드시 명시해야 합니다. 보안상, Laravel은 `guarded` 속성을 사용할 때 중첩된 JSON 속성에 대한 대량 업데이트를 지원하지 않습니다.

```
/**
 * The attributes that are mass assignable.
 *
 * @var array
 */
protected $fillable = [
    'options->enabled',
];
```

<a name="allowing-mass-assignment"></a>
#### 전체 대량 할당 허용하기

모델의 모든 속성을 대량 할당 가능하게 하려면, `$guarded` 속성을 빈 배열로 설정하면 됩니다. 모델을 대량 할당 허용(unguard) 상태로 둘 경우, `fill`, `create`, `update` 메서드에 전달하는 배열을 항상 직접 엄격하게 관리해야 한다는 점에 주의해야 합니다.

```
/**
 * The attributes that aren't mass assignable.
 *
 * @var array
 */
protected $guarded = [];
```

<a name="upserts"></a>
### 업서트(Upserts)

가끔, 이미 존재하는 모델이 있다면 그 모델을 업데이트하고, 없다면 새로 생성해야 할 때가 있습니다. 이러한 작업은 `firstOrCreate` 메서드처럼 모델을 데이터베이스에 영구적으로 저장하며, 따라서 별도의 `save` 호출이 필요하지 않습니다.

아래 예제에서, `departure`가 `Oakland`이고 `destination`이 `San Diego`인 항공편이 이미 존재한다면, 해당 레코드의 `price`와 `discounted` 컬럼 값을 수정합니다. 만약 해당 조건에 맞는 레코드가 없다면, 두 인수 배열을 합쳐서 새로운 항공편이 생성됩니다.

```
$flight = Flight::updateOrCreate(
    ['departure' => 'Oakland', 'destination' => 'San Diego'],
    ['price' => 99, 'discounted' => 1]
);
```

한 번의 쿼리로 여러 "업서트"를 수행하려면 `upsert` 메서드를 사용할 수 있습니다. 첫 번째 인수는 삽입 또는 업데이트할 값(들), 두 번째 인수는 레코드를 고유하게 식별할 컬럼(들), 세 번째 마지막 인수는 일치하는 레코드가 이미 있을 때 업데이트할 컬럼(들)로 구성되어 있습니다. 만약 타임스탬프 사용이 활성화되어 있다면, `upsert` 메서드는 `created_at`과 `updated_at` 값을 자동으로 지정해줍니다.

```
Flight::upsert([
    ['departure' => 'Oakland', 'destination' => 'San Diego', 'price' => 99],
    ['departure' => 'Chicago', 'destination' => 'New York', 'price' => 150]
], ['departure', 'destination'], ['price']);
```

<a name="deleting-models"></a>
## 모델 삭제하기

모델을 삭제하려면, 해당 모델 인스턴스에서 `delete` 메서드를 호출하면 됩니다.

```
use App\Models\Flight;

$flight = Flight::find(1);

$flight->delete();
```

모델에 연관된 모든 데이터베이스 레코드를 삭제하려면 `truncate` 메서드를 사용할 수 있습니다. 이 작업은 테이블의 오토 인크리먼트(ID 자동 증가) 값도 리셋합니다.

```
Flight::truncate();
```

<a name="deleting-an-existing-model-by-its-primary-key"></a>
#### 기본 키로 모델 삭제하기

위 예제에서는 모델을 먼저 데이터베이스에서 조회한 뒤, `delete` 메서드를 호출했습니다. 하지만 모델의 기본 키(primary key)를 알고 있다면, 굳이 모델을 수동으로 조회하지 않아도 바로 `destroy` 메서드를 사용해 삭제할 수 있습니다. `destroy` 메서드는 단일 기본 키뿐 아니라 여러 키(여러 개의 인수, 배열, 또는 [컬렉션](/docs/8.x/collections))도 받을 수 있습니다.

```
Flight::destroy(1);

Flight::destroy(1, 2, 3);

Flight::destroy([1, 2, 3]);

Flight::destroy(collect([1, 2, 3]));
```

> [!NOTE]
> `destroy` 메서드는 각 모델을 개별적으로 조회한 뒤 `delete` 메서드를 호출하여, `deleting`, `deleted` 이벤트가 각 모델마다 정상적으로 발생하도록 처리합니다.

<a name="deleting-models-using-queries"></a>
#### 쿼리로 모델 삭제하기

물론, 쿼리를 작성해 조건에 맞는 모든 모델을 한 번에 삭제할 수도 있습니다. 아래 예제는 `active`가 0으로 표시된 모든 항공편을 삭제합니다. 대량 업데이트와 마찬가지로, 대량 삭제에서도 삭제된 모델에 대해 이벤트가 발생하지 않습니다.

```
$deleted = Flight::where('active', 0)->delete();
```

> [!NOTE]
> Eloquent로 대량 삭제(delete) 쿼리를 실행할 때는,
> 삭제된 모델에 대한 `deleting`, `deleted` 이벤트가 발생하지 않습니다.
> (실제 모델을 조회하지 않고 바로 삭제 쿼리를 실행하기 때문입니다.)

<a name="soft-deleting"></a>
### 소프트 삭제(Soft Deleting)

데이터베이스에서 실제로 레코드를 제거하는 것 외에도, Eloquent는 모델의 "소프트 삭제" 기능을 지원합니다. 소프트 삭제란 데이터베이스에서 해당 레코드를 실제로 지우는 것이 아니라, 해당 모델의 `deleted_at` 속성에 삭제 시각을 저장하는 방식입니다. 모델에 소프트 삭제를 적용하려면 해당 모델에 `Illuminate\Database\Eloquent\SoftDeletes` 트레이트(trait)를 추가하면 됩니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Flight extends Model
{
    use SoftDeletes;
}
```

> [!TIP]
> `SoftDeletes` 트레이트는 `deleted_at` 속성을 자동으로 `DateTime` 또는 `Carbon` 인스턴스로 캐스팅해줍니다.

또한 데이터베이스 테이블에 `deleted_at` 컬럼을 추가해야 합니다. Laravel의 [스키마 빌더](/docs/8.x/migrations)를 이용하면 쉽게 생성할 수 있습니다.

```
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('flights', function (Blueprint $table) {
    $table->softDeletes();
});

Schema::table('flights', function (Blueprint $table) {
    $table->dropSoftDeletes();
});
```

이제 모델 인스턴스에서 `delete` 메서드를 호출하면, `deleted_at` 컬럼이 현재 날짜와 시각으로 설정됩니다. 하지만 실제 데이터베이스 레코드는 테이블에서 사라지지 않고 남아 있습니다. 소프트 삭제가 활성화된 모델을 조회할 때는, 소프트 삭제된 레코드가 자동으로 결과에서 제외됩니다.

특정 모델 인스턴스가 소프트 삭제된 상태인지 확인하려면 `trashed` 메서드를 사용할 수 있습니다.

```
if ($flight->trashed()) {
    //
}
```

<a name="restoring-soft-deleted-models"></a>
#### 소프트 삭제된 모델 복원하기

때로는 소프트 삭제된 모델을 복원("삭제 취소")하고 싶은 경우도 있습니다. 이때는 모델 인스턴스에서 `restore` 메서드를 호출하면 됩니다. 이 메서드는 해당 모델의 `deleted_at` 값을 `null`로 변경합니다.

```
$flight->restore();
```

또한 쿼리를 활용해 여러 모델을 한 번에 복원할 수도 있습니다. 다른 "대량" 처리와 마찬가지로, 복원된 모델에 대한 이벤트는 발생하지 않는다는 점에 유의하세요.

```
Flight::withTrashed()
        ->where('airline_id', 1)
        ->restore();
```

[연관관계](/docs/8.x/eloquent-relationships) 쿼리에서도 `restore` 메서드를 사용할 수 있습니다.

```
$flight->history()->restore();
```

<a name="permanently-deleting-models"></a>
#### 모델 영구 삭제하기

때로는 모델을 데이터베이스에서 정말로 영구적으로 삭제해야 하는 경우가 있습니다. 이때는 소프트 삭제가 적용된 모델 인스턴스에서 `forceDelete` 메서드를 호출하세요.

```
$flight->forceDelete();
```

Eloquent 연관관계 쿼리에서도 `forceDelete` 메서드를 사용할 수 있습니다.

```
$flight->history()->forceDelete();
```

<a name="querying-soft-deleted-models"></a>
### 소프트 삭제된 모델 조회하기

<a name="including-soft-deleted-models"></a>
#### 소프트 삭제된 모델 '함께' 조회하기

앞서 설명했듯이, 소프트 삭제된 모델은 쿼리 결과에서 자동으로 제외됩니다. 하지만 필요하다면, 쿼리에서 `withTrashed` 메서드를 호출해 소프트 삭제된 모델도 결과에 포함시킬 수 있습니다.

```
use App\Models\Flight;

$flights = Flight::withTrashed()
                ->where('account_id', 1)
                ->get();
```

[연관관계](/docs/8.x/eloquent-relationships) 쿼리에서도 `withTrashed` 메서드를 사용할 수 있습니다.

```
$flight->history()->withTrashed()->get();
```

<a name="retrieving-only-soft-deleted-models"></a>
#### 소프트 삭제된 모델만 조회하기

`onlyTrashed` 메서드를 사용하면 오직 "소프트 삭제된" 모델만 조회할 수 있습니다.

```
$flights = Flight::onlyTrashed()
                ->where('airline_id', 1)
                ->get();
```

<a name="pruning-models"></a>
## 모델 가지치기(Pruning)

때때로 더 이상 필요하지 않은 모델을 주기적으로 정리(삭제)하고 싶을 수 있습니다. 이를 위해 정기적으로 가지치기를 수행할 모델에 `Illuminate\Database\Eloquent\Prunable` 또는 `Illuminate\Database\Eloquent\MassPrunable` 트레이트를 추가할 수 있습니다. 트레이트를 추가한 후, 더 이상 필요 없는 모델을 조회하는 Eloquent 쿼리 빌더를 반환하는 `prunable` 메서드를 구현해야 합니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;

class Flight extends Model
{
    use Prunable;

    /**
     * Get the prunable model query.
     *
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function prunable()
    {
        return static::where('created_at', '<=', now()->subMonth());
    }
}
```

모델에 `Prunable`을 지정하면, `pruning` 메서드도 정의할 수 있습니다. 이 메서드는 모델이 실제 삭제되기 전에 호출되며, 모델에 연결된 기타 리소스(예: 저장된 파일 등)를 데이터베이스에서 영구적으로 제거하기 전에 미리 삭제하는 용도로 사용할 수 있습니다.

```
/**
 * Prepare the model for pruning.
 *
 * @return void
 */
protected function pruning()
{
    //
}
```

가지치기 대상 모델 설정이 끝났으면, 애플리케이션의 `App\Console\Kernel` 클래스에서 `model:prune` Artisan 명령어를 스케줄링(예약 실행)해야 합니다. 이 명령어를 얼마 간격으로 실행할지는 자유롭게 정할 수 있습니다.

```
/**
 * Define the application's command schedule.
 *
 * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
 * @return void
 */
protected function schedule(Schedule $schedule)
{
    $schedule->command('model:prune')->daily();
}
```

내부적으로, `model:prune` 명령어는 애플리케이션의 `app/Models` 디렉터리 내 "Prunable" 모델을 자동으로 감지합니다. 만약 모델이 다른 위치에 있다면, `--model` 옵션으로 명시적으로 클래스명을 지정할 수 있습니다.

```
$schedule->command('model:prune', [
    '--model' => [Address::class, Flight::class],
])->daily();
```

특정 모델만 가지치기 대상에서 제외하고, 나머지 감지된 모델을 모두 가지치기하고 싶다면 `--except` 옵션을 사용합니다.

```
$schedule->command('model:prune', [
    '--except' => [Address::class, Flight::class],
])->daily();
```

`model:prune` 명령어가 실제로 실행된다면 얼마나 많은 레코드가 삭제될지 확인하고 싶을 경우, `--pretend` 옵션을 붙여 실행해 결과만 시뮬레이션할 수 있습니다.

```
php artisan model:prune --pretend
```

> [!NOTE]
> 소프트 삭제된 모델이 프루너블(prunable) 쿼리에 해당될 경우, 실제로 영구 삭제(`forceDelete`) 처리가 됩니다.

<a name="mass-pruning"></a>
#### 대량 가지치기(Mass Pruning)

모델에 `Illuminate\Database\Eloquent\MassPrunable` 트레이트가 지정되면, 대량 삭제 쿼리를 사용해 데이터베이스에서 모델이 제거됩니다. 이 경우, 개별 모델에 대해 `pruning` 메서드가 호출되지 않으며, 모델 이벤트(`deleting` 및 `deleted`)도 발생하지 않습니다. 그 이유는 삭제 전에 모델을 실제로 조회하지 않기 때문이며, 이로 인해 전체 가지치기 과정이 훨씬 효율적이 됩니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\MassPrunable;

class Flight extends Model
{
    use MassPrunable;

    /**
     * Get the prunable model query.
     *
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function prunable()
    {
        return static::where('created_at', '<=', now()->subMonth());
    }
}
```

<a name="replicating-models"></a>
## 모델 복제하기(Replicating Models)

기존 모델 인스턴스를 사용해, 저장되지 않은 새로운 복사본을 만들어야 할 때는 `replicate` 메서드를 사용할 수 있습니다. 이 기능은 여러 속성이 유사한 모델 인스턴스를 여러 개 만들어야 할 때 유용합니다.

```
use App\Models\Address;

$shipping = Address::create([
    'type' => 'shipping',
    'line_1' => '123 Example Street',
    'city' => 'Victorville',
    'state' => 'CA',
    'postcode' => '90001',
]);

$billing = $shipping->replicate()->fill([
    'type' => 'billing'
]);

$billing->save();
```

특정 속성을 복제에서 제외하고 싶다면, `replicate` 메서드에 배열로 제외할 속성명을 전달할 수 있습니다.

```
$flight = Flight::create([
    'destination' => 'LAX',
    'origin' => 'LHR',
    'last_flown' => '2020-03-04 11:00:00',
    'last_pilot_id' => 747,
]);

$flight = $flight->replicate([
    'last_flown',
    'last_pilot_id'
]);
```

<a name="query-scopes"></a>

## 쿼리 스코프(Query Scopes)

<a name="global-scopes"></a>
### 글로벌 스코프

글로벌 스코프를 사용하면 특정 모델에 대한 모든 쿼리에 제약 조건을 일괄적으로 적용할 수 있습니다. 라라벨의 [소프트 삭제](#soft-deleting) 기능도 글로벌 스코프를 활용해 "삭제되지 않은" 모델만 데이터베이스에서 조회하도록 동작합니다. 글로벌 스코프를 직접 작성하면, 특정 모델에 대해 매 쿼리마다 반드시 반영되어야 하는 제약 조건을 간편하게 설정할 수 있습니다.

<a name="writing-global-scopes"></a>
#### 글로벌 스코프 작성하기

글로벌 스코프를 작성하는 방법은 매우 간단합니다. 우선 `Illuminate\Database\Eloquent\Scope` 인터페이스를 구현하는 클래스를 정의해야 합니다. 라라벨에서는 스코프 클래스를 별도로 보관하는 디렉터리를 규정하지 않으므로, 원하는 위치에 자유롭게 클래스를 생성하셔도 됩니다.

`Scope` 인터페이스에서는 반드시 `apply` 메서드를 구현해야 합니다. 이 `apply` 메서드는 필요에 따라 `where` 조건이나 다른 종류의 쿼리 절을 추가할 수 있습니다.

```
<?php

namespace App\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class AncientScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $builder
     * @param  \Illuminate\Database\Eloquent\Model  $model
     * @return void
     */
    public function apply(Builder $builder, Model $model)
    {
        $builder->where('created_at', '<', now()->subYears(2000));
    }
}
```

> [!TIP]
> 글로벌 스코프 내부에서 쿼리의 select 절에 컬럼을 추가하고자 한다면, 단순히 `select`를 사용하는 대신 `addSelect` 메서드를 사용해야 합니다. 이렇게 하면 기존 select 절이 의도치 않게 대체되는 것을 방지할 수 있습니다.

<a name="applying-global-scopes"></a>
#### 글로벌 스코프 적용하기

글로벌 스코프를 모델에 할당하려면, 해당 모델의 `booted` 메서드를 오버라이드하고 그 안에서 `addGlobalScope` 메서드를 호출해야 합니다. `addGlobalScope`는 단 하나의 인자로 스코프의 인스턴스를 받습니다.

```
<?php

namespace App\Models;

use App\Scopes\AncientScope;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * The "booted" method of the model.
     *
     * @return void
     */
    protected static function booted()
    {
        static::addGlobalScope(new AncientScope);
    }
}
```

위 예시처럼 `App\Models\User` 모델에 스코프를 추가하면, `User::all()` 메서드를 호출할 때 아래와 같은 SQL 쿼리가 실행됩니다.

```sql
select * from `users` where `created_at` < 0021-02-18 00:00:00
```

<a name="anonymous-global-scopes"></a>
#### 익명 글로벌 스코프

Eloquent에서는 별도의 클래스를 만들 필요 없이 클로저(익명 함수)를 활용해 글로벌 스코프를 정의할 수도 있습니다. 단순한 스코프의 경우 이런 방식이 매우 편리합니다. 이때 `addGlobalScope` 메서드의 첫 번째 인자로 스코프의 이름(문자열), 두 번째 인자로 클로저를 전달하세요.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * The "booted" method of the model.
     *
     * @return void
     */
    protected static function booted()
    {
        static::addGlobalScope('ancient', function (Builder $builder) {
            $builder->where('created_at', '<', now()->subYears(2000));
        });
    }
}
```

<a name="removing-global-scopes"></a>
#### 글로벌 스코프 제거하기

특정 쿼리에서 글로벌 스코프를 제거하고 싶을 때는 `withoutGlobalScope` 메서드를 사용합니다. 이 메서드에는 제거할 글로벌 스코프의 클래스명을 인자로 전달합니다.

```
User::withoutGlobalScope(AncientScope::class)->get();
```

클로저 형태로 글로벌 스코프를 정의했다면, 글로벌 스코프를 추가할 때 사용한 이름(문자열 값)을 지정해주면 됩니다.

```
User::withoutGlobalScope('ancient')->get();
```

여러 개 또는 모든 글로벌 스코프를 한 번에 제거하고 싶다면 `withoutGlobalScopes` 메서드를 사용할 수 있습니다.

```
// 모든 글로벌 스코프 제거
User::withoutGlobalScopes()->get();

// 일부 글로벌 스코프만 제거
User::withoutGlobalScopes([
    FirstScope::class, SecondScope::class
])->get();
```

<a name="local-scopes"></a>
### 로컬 스코프

로컬 스코프를 활용하면 자주 사용되는 쿼리 조건 집합을 하나의 메서드로 쉽게 재사용할 수 있습니다. 예를 들어, "인기 있는" 사용자만 자주 조회해야 하는 경우가 있다면 로컬 스코프를 정의해두는 것이 좋습니다. 로컬 스코프는 Eloquent 모델 메서드의 이름 앞에 `scope`를 붙여 만듭니다.

스코프에서 반환값은 반드시 동일한 쿼리 빌더 인스턴스이거나 `void`이어야 합니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * Scope a query to only include popular users.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopePopular($query)
    {
        return $query->where('votes', '>', 100);
    }

    /**
     * Scope a query to only include active users.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return void
     */
    public function scopeActive($query)
    {
        $query->where('active', 1);
    }
}
```

<a name="utilizing-a-local-scope"></a>
#### 로컬 스코프 활용하기

스코프를 정의한 뒤에는, 해당 모델을 쿼리할 때 스코프 메서드를 곧바로 사용할 수 있습니다. 이때 메서드 호출 시에는 `scope` 접두사는 생략합니다. 여러 개의 스코프 호출 또한 체이닝으로 이어붙일 수 있습니다.

```
use App\Models\User;

$users = User::popular()->active()->orderBy('created_at')->get();
```

여러 로컬 스코프를 `or` 조건으로 조합해서 사용하고 싶은 경우, 아래와 같이 클로저를 사용하여 [논리 그룹화](/docs/8.x/queries#logical-grouping)를 구현할 수 있습니다.

```
$users = User::popular()->orWhere(function (Builder $query) {
    $query->active();
})->get();
```

하지만 이 방식이 번거로울 수 있기 때문에, 라라벨에서는 클로저 없이도 스코프를 유연하게 이어 붙이도록 "higher order" `orWhere` 메서드를 제공합니다.

```
$users = App\Models\User::popular()->orWhere->active()->get();
```

<a name="dynamic-scopes"></a>
#### 동적 스코프

스코프에 파라미터를 넘겨가며 활용하고 싶은 경우도 있습니다. 이럴 때는 스코프 메서드의 시그니처에서 `$query` 인자 다음에 추가 파라미터를 선언하면 됩니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * Scope a query to only include users of a given type.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  mixed  $type
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }
}
```

이처럼 스코프 메서드에 파라미터를 정의해두면, 아래와 같이 해당 인수를 전달하여 사용할 수 있습니다.

```
$users = User::ofType('admin')->get();
```

<a name="comparing-models"></a>
## 모델 간 비교

두 개의 모델이 "같은 것인지" 비교해야 할 때가 있습니다. `is`와 `isNot` 메서드를 사용하면 두 모델이 같은 기본 키, 같은 테이블, 동일한 데이터베이스 커넥션을 가졌는지 손쉽게 판별할 수 있습니다.

```
if ($post->is($anotherPost)) {
    //
}

if ($post->isNot($anotherPost)) {
    //
}
```

`is` 및 `isNot` 메서드는 `belongsTo`, `hasOne`, `morphTo`, `morphOne` 등 [연관관계](/docs/8.x/eloquent-relationships)에서도 사용할 수 있습니다. 이 메서드는 쿼리 없이 연관된 모델끼리 비교하고 싶을 때 특히 유용합니다.

```
if ($post->author()->is($user)) {
    //
}
```

<a name="events"></a>
## 이벤트(Events)

> [!TIP]
> Eloquent 이벤트를 프론트엔드 애플리케이션에 바로 전파(브로드캐스트)하고 싶으신가요? 라라벨의 [모델 이벤트 브로드캐스팅](/docs/8.x/broadcasting#model-broadcasting) 기능도 참고해 보세요.

Eloquent 모델은 모델의 라이프사이클에서 특정 순간마다 여러 이벤트를 발생시킵니다. 발생 가능한 이벤트는 다음과 같습니다: `retrieved`, `creating`, `created`, `updating`, `updated`, `saving`, `saved`, `deleting`, `deleted`, `restoring`, `restored`, `replicating`.

기존 모델이 데이터베이스에서 조회되면 `retrieved` 이벤트가 발생합니다. 새 모델이 처음 저장될 때는 `creating`과 `created` 이벤트가 발생합니다. 기존 모델에서 수정 사항을 저장하면 `updating`/`updated` 이벤트가, 모델이 생성 또는 업데이트될 때는(속성이 변경되지 않았더라도) `saving`/`saved` 이벤트가 발생합니다. 이벤트 이름이 `-ing`로 끝나면 실제 데이터가 반영되기 전에, `-ed`로 끝나면 반영된 후에 발생합니다.

모델 이벤트를 처리하려면, Eloquent 모델에 `$dispatchesEvents` 프로퍼티를 정의하세요. 이 프로퍼티에는 Eloquent 라이프사이클의 각 시점과 여러분이 직접 만든 [이벤트 클래스](/docs/8.x/events)가 매핑됩니다. 각 모델 이벤트 클래스는 생성자에서 해당 모델 인스턴스를 전달받게 됩니다.

```
<?php

namespace App\Models;

use App\Events\UserDeleted;
use App\Events\UserSaved;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * The event map for the model.
     *
     * @var array
     */
    protected $dispatchesEvents = [
        'saved' => UserSaved::class,
        'deleted' => UserDeleted::class,
    ];
}
```

이와 같이 Eloquent 이벤트를 정의 및 매핑한 후, [이벤트 리스너](/docs/8.x/events#defining-listeners)를 사용해 해당 이벤트를 처리할 수 있습니다.

> [!NOTE]
> Eloquent를 통해 대량 업데이트나 대량 삭제 쿼리를 수행할 경우, 해당 모델에 적용되는 `saved`, `updated`, `deleting`, `deleted` 이벤트는 발생하지 않습니다. 이는 대량 쿼리에서는 실제로 모델 인스턴스가 조회되지 않기 때문입니다.

<a name="events-using-closures"></a>
### 클로저를 이용한 이벤트 리스닝

커스텀 이벤트 클래스를 별도로 만드는 대신, 다양한 모델 이벤트 발생 시 바로 실행될 클로저(익명 함수)를 등록할 수도 있습니다. 클로저는 일반적으로 해당 모델의 `booted` 메서드 안에서 등록합니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * The "booted" method of the model.
     *
     * @return void
     */
    protected static function booted()
    {
        static::created(function ($user) {
            //
        });
    }
}
```

필요하다면 [큐 처리 가능한 익명 이벤트 리스너](/docs/8.x/events#queuable-anonymous-event-listeners)를 이용할 수도 있습니다. 이를 활용하면 라라벨이 이벤트 리스너를 [큐](/docs/8.x/queues)를 통해 백그라운드에서 실행하도록 지정할 수 있습니다.

```
use function Illuminate\Events\queueable;

static::created(queueable(function ($user) {
    //
}));
```

<a name="observers"></a>
### 옵서버(Observers)

<a name="defining-observers"></a>
#### 옵서버 정의하기

한 모델에 대한 여러 이벤트를 모아서 처리하고 싶을 때는 옵서버를 사용해 여러 리스너를 하나의 클래스로 묶을 수 있습니다. 옵서버 클래스는 듣고자 하는 Eloquent 이벤트 이름과 동일한 메서드를 만듭니다. 각 메서드는 영향을 받는 모델 인스턴스를 유일한 인수로 전달받습니다. 새로운 옵서버 클래스를 만들려면 Artisan 명령어인 `make:observer`를 사용합니다.

```
php artisan make:observer UserObserver --model=User
```

이 명령어는 새 옵서버 클래스를 `App/Observers` 디렉터리에 생성합니다. 디렉터리가 없다면 Artisan이 자동으로 만들어 줍니다. 생성된 옵서버 클래스는 다음과 비슷한 형태입니다.

```
<?php

namespace App\Observers;

use App\Models\User;

class UserObserver
{
    /**
     * Handle the User "created" event.
     *
     * @param  \App\Models\User  $user
     * @return void
     */
    public function created(User $user)
    {
        //
    }

    /**
     * Handle the User "updated" event.
     *
     * @param  \App\Models\User  $user
     * @return void
     */
    public function updated(User $user)
    {
        //
    }

    /**
     * Handle the User "deleted" event.
     *
     * @param  \App\Models\User  $user
     * @return void
     */
    public function deleted(User $user)
    {
        //
    }

    /**
     * Handle the User "forceDeleted" event.
     *
     * @param  \App\Models\User  $user
     * @return void
     */
    public function forceDeleted(User $user)
    {
        //
    }
}
```

옵서버를 등록하려면, 관찰하고자 하는 모델에서 `observe` 메서드를 호출하면 됩니다. 옵서버 등록은 보통 `App\Providers\EventServiceProvider` 서비스 프로바이더의 `boot` 메서드에서 진행합니다.

```
use App\Models\User;
use App\Observers\UserObserver;

/**
 * Register any events for your application.
 *
 * @return void
 */
public function boot()
{
    User::observe(UserObserver::class);
}
```

> [!TIP]
> 옵서버에서 청취할 수 있는 이벤트는 `saving`, `retrieved` 등 추가적으로 더 있습니다. 자세한 내용은 [이벤트](#events) 문서를 참고하세요.

<a name="observers-and-database-transactions"></a>
#### 옵서버와 데이터베이스 트랜잭션

데이터베이스 트랜잭션 내에서 모델이 생성되는 경우, 옵서버가 이벤트를 트랜잭션 커밋 이후에 처리하도록 하고 싶을 수 있습니다. 이럴 때는 옵서버 클래스에 `$afterCommit` 프로퍼티를 정의하여 사용할 수 있습니다. 만약 트랜잭션이 진행 중이 아니면, 이벤트 핸들러는 즉시 실행됩니다.

```
<?php

namespace App\Observers;

use App\Models\User;

class UserObserver
{
    /**
     * Handle events after all transactions are committed.
     *
     * @var bool
     */
    public $afterCommit = true;

    /**
     * Handle the User "created" event.
     *
     * @param  \App\Models\User  $user
     * @return void
     */
    public function created(User $user)
    {
        //
    }
}
```

<a name="muting-events"></a>
### 이벤트 일시 중지(Muting Events)

때로는 특정 시점에 모델에서 발생하는 모든 이벤트를 일시적으로 "중지"하고 싶을 수 있습니다. 이럴 때는 `withoutEvents` 메서드를 사용하세요. 이 메서드는 클로저를 인수로 받아, 해당 클로저 내부에서 실행되는 코드는 어떠한 이벤트도 발생시키지 않습니다. 또한 클로저 내부의 반환값이 곧 `withoutEvents`의 반환값이 됩니다.

```
use App\Models\User;

$user = User::withoutEvents(function () use () {
    User::findOrFail(1)->delete();

    return User::find(2);
});
```

<a name="saving-a-single-model-without-events"></a>
#### 단일 모델을 이벤트 없이 저장하기

특정 모델을 저장할 때만 이벤트를 발생시키지 않으려면 `saveQuietly` 메서드를 사용하면 됩니다.

```
$user = User::findOrFail(1);

$user->name = 'Victoria Faith';

$user->saveQuietly();
```