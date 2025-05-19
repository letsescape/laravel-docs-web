# 일러쿼언트: 시작하기 (Eloquent: Getting Started)

- [소개](#introduction)
- [모델 클래스 생성](#generating-model-classes)
- [일러쿼언트 모델 관례](#eloquent-model-conventions)
    - [테이블명](#table-names)
    - [기본 키](#primary-keys)
    - [UUID와 ULID 키](#uuid-and-ulid-keys)
    - [타임스탬프](#timestamps)
    - [데이터베이스 커넥션](#database-connections)
    - [속성 기본값](#default-attribute-values)
    - [일러쿼언트 strictness 구성](#configuring-eloquent-strictness)
- [모델 조회](#retrieving-models)
    - [컬렉션](#collections)
    - [결과 청크 처리](#chunking-results)
    - [Lazy 컬렉션을 활용한 청크 처리](#chunking-using-lazy-collections)
    - [커서](#cursors)
    - [고급 서브쿼리](#advanced-subqueries)
- [단일 모델/집계 값 조회](#retrieving-single-models)
    - [모델 조회 또는 생성](#retrieving-or-creating-models)
    - [집계 값 조회](#retrieving-aggregates)
- [모델 삽입 및 갱신](#inserting-and-updating-models)
    - [삽입](#inserts)
    - [갱신](#updates)
    - [Mass Assignment](#mass-assignment)
    - [Upsert](#upserts)
- [모델 삭제](#deleting-models)
    - [Soft Deleting](#soft-deleting)
    - [Soft Delete된 모델 쿼리](#querying-soft-deleted-models)
- [모델 가지치기(Pruning)](#pruning-models)
- [모델 복제](#replicating-models)
- [쿼리 스코프](#query-scopes)
    - [글로벌 스코프](#global-scopes)
    - [로컬 스코프](#local-scopes)
    - [Pending 속성](#pending-attributes)
- [모델 비교](#comparing-models)
- [이벤트](#events)
    - [클로저 사용](#events-using-closures)
    - [Observer](#observers)
    - [이벤트 비활성화](#muting-events)

<a name="introduction"></a>
## 소개

라라벨은 Eloquent라는 ORM(Object-Relational Mapper)을 기본적으로 제공합니다. 이를 통해 데이터베이스 작업이 한결 즐겁고 쉬워집니다. Eloquent를 사용할 때는 각 데이터베이스 테이블별로 "모델(Model)" 클래스를 만들어 해당 테이블과 상호작용합니다. 모델을 사용하면 데이터 조회뿐만 아니라, 삽입, 갱신, 삭제 등 다양한 작업도 손쉽게 처리할 수 있습니다.

> [!NOTE]
> 시작하기 전에, 반드시 애플리케이션의 `config/database.php` 설정 파일에서 데이터베이스 커넥션을 구성했는지 확인하십시오. 데이터베이스 구성에 대한 더 자세한 내용은 [데이터베이스 구성 문서](/docs/database#configuration)를 참고하세요.

<a name="generating-model-classes"></a>
## 모델 클래스 생성

먼저 Eloquent 모델을 생성해봅시다. 모델 클래스는 보통 `app\Models` 디렉터리에 위치하며, `Illuminate\Database\Eloquent\Model` 클래스를 확장(extend)합니다. 새로운 모델은 `make:model` [Artisan 명령어](/docs/artisan)를 사용하여 생성할 수 있습니다.

```shell
php artisan make:model Flight
```

모델을 생성할 때 [데이터베이스 마이그레이션](/docs/migrations)도 함께 만들고 싶다면, `--migration` 또는 `-m` 옵션을 사용하면 됩니다.

```shell
php artisan make:model Flight --migration
```

모델 생성 시 팩토리(factory), 시더(seeder), 정책(policy), 컨트롤러(controller), 폼 요청(form request) 등 다양한 클래스를 한꺼번에 생성할 수도 있습니다. 이런 옵션은 함께 조합해서 사용할 수도 있습니다.

```shell
# 모델과 FlightFactory 클래스 생성
php artisan make:model Flight --factory
php artisan make:model Flight -f

# 모델과 FlightSeeder 클래스 생성
php artisan make:model Flight --seed
php artisan make:model Flight -s

# 모델과 FlightController 클래스 생성
php artisan make:model Flight --controller
php artisan make:model Flight -c

# 모델, FlightController 리소스 클래스, 폼 요청 클래스 생성
php artisan make:model Flight --controller --resource --requests
php artisan make:model Flight -crR

# 모델과 FlightPolicy 클래스 생성
php artisan make:model Flight --policy

# 모델, 마이그레이션, 팩토리, 시더, 컨트롤러 생성
php artisan make:model Flight -mfsc

# 모델, 마이그레이션, 팩토리, 시더, 정책, 컨트롤러, 폼 요청 클래스까지 모두 생성
php artisan make:model Flight --all
php artisan make:model Flight -a

# 피벗 모델 생성
php artisan make:model Member --pivot
php artisan make:model Member -p
```

<a name="inspecting-models"></a>
#### 모델 속성 및 관계 확인

모델의 코드만 보고 모든 속성이나 관계를 파악하기가 어려운 경우가 많습니다. 이럴 때는 `model:show` Artisan 명령어를 사용하면 해당 모델의 속성과 관계를 한눈에 확인할 수 있습니다.

```shell
php artisan model:show Flight
```

<a name="eloquent-model-conventions"></a>
## 일러쿼언트 모델 관례

`make:model` 명령어로 생성한 모델 클래스는 기본적으로 `app/Models` 디렉터리에 위치하게 됩니다. 아래는 간단한 모델 클래스 예제와 함께 Eloquent의 주요 관례(convention) 몇 가지를 설명합니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    // ...
}
```

<a name="table-names"></a>
### 테이블명

위 코드 예제를 보면, Eloquent에 어떤 데이터베이스 테이블과 연결될지 별도로 지정하지 않았다는 점을 알 수 있습니다. Eloquent에서는 기본적으로 모델 클래스 이름을 스네이크 케이스(snake_case) 복수형으로 변환하여 테이블명으로 사용합니다. 예를 들어 `Flight` 모델은 `flights` 테이블을, `AirTrafficController` 모델은 `air_traffic_controllers` 테이블을 자동으로 사용합니다.

모델이 연결되는 테이블명이 이런 관례와 다를 경우, 모델의 `table` 속성을 직접 지정해줄 수 있습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * 모델이 참조할 테이블명
     *
     * @var string
     */
    protected $table = 'my_flights';
}
```

<a name="primary-keys"></a>
### 기본 키

Eloquent는 각 모델이 연결된 테이블에 `id`라는 이름의 기본 키 컬럼이 있다고 가정합니다. 만약 기본 키 컬럼 이름이 다르다면, 모델의 `$primaryKey` 보호 속성을 정의해 사용하면 됩니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * 모델이 참조할 기본 키 컬럼
     *
     * @var string
     */
    protected $primaryKey = 'flight_id';
}
```

Eloquent는 기본적으로 기본 키가 자동 증가하는 정수(integer)라고 간주하여 값을 정수형으로 캐스팅합니다. 만약 자동 증가하지 않거나, 숫자가 아닌 기본 키를 사용하려면, 모델에 `$incrementing` 속성을 `false`로 설정해야 합니다.

```php
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

또한, 기본 키가 정수형이 아니라면 모델에 `$keyType` 보호 속성을 정의해야 합니다. 이 속성에는 `'string'`을 지정합니다.

```php
<?php

class Flight extends Model
{
    /**
     * 기본 키 ID의 데이터 타입
     *
     * @var string
     */
    protected $keyType = 'string';
}
```

<a name="composite-primary-keys"></a>
#### "복합" 기본 키

Eloquent는 각 모델에 식별 가능한 "ID"(primary key)가 반드시 하나 존재해야 한다고 가정합니다. "복합" 기본 키(여러 컬럼을 결합하여 기본 키로 사용)는 Eloquent 모델에서 지원되지 않습니다. 그러나, 테이블의 고유 식별을 위한 기본 키 외에 여러 컬럼으로 구성된 복합 유니크 인덱스를 추가하는 것은 자유롭게 할 수 있습니다.

<a name="uuid-and-ulid-keys"></a>
### UUID와 ULID 키

Eloquent 모델의 기본 키로 자동 증가하는 정수형 대신 UUID를 사용할 수도 있습니다. UUID는 36자의 영숫자(알파벳+숫자)로 이루어진, 전역적으로 고유한 식별자입니다.

모델의 기본 키를 자동 증가 정수형 대신 UUID로 사용하려면, 모델에 `Illuminate\Database\Eloquent\Concerns\HasUuids` 트레이트를 사용합니다. 물론, 모델의 [UUID 기반 기본 키 컬럼](/docs/migrations#column-method-uuid)도 미리 준비되어 있어야 합니다.

```php
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use HasUuids;

    // ...
}

$article = Article::create(['title' => 'Traveling to Europe']);

$article->id; // "8f8e8478-9035-4d23-b9a7-62f4d2612ce5"
```

기본적으로 `HasUuids` 트레이트는 ["정렬 가능한" UUID](/docs/strings#method-str-ordered-uuid)를 생성합니다. 이런 UUID는 정렬이 가능하므로 인덱스 기반의 데이터베이스 저장 시 더 효율적입니다.

특정 모델에서 UUID 생성 방식을 직접 제어하고 싶다면 `newUniqueId` 메서드를 정의하면 되고, 어떤 컬럼에 UUID를 할당할지 지정하려면 `uniqueIds` 메서드를 모델에 정의할 수 있습니다.

```php
use Ramsey\Uuid\Uuid;

/**
 * 새로운 UUID를 생성합니다.
 */
public function newUniqueId(): string
{
    return (string) Uuid::uuid4();
}

/**
 * 고유 식별자를 부여할 컬럼 목록
 *
 * @return array<int, string>
 */
public function uniqueIds(): array
{
    return ['id', 'discount_code'];
}
```

UUID 대신 "ULID"를 사용할 수도 있습니다. ULID는 UUID와 비슷하지만, 길이가 26자이며 역시 정렬이 가능하여 인덱싱에 효율적입니다. ULID를 사용하려면 `Illuminate\Database\Eloquent\Concerns\HasUlids` 트레이트를 모델에 적용하고, 컬럼도 [ULID 기반 컬럼](/docs/migrations#column-method-ulid)으로 준비해야 합니다.

```php
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use HasUlids;

    // ...
}

$article = Article::create(['title' => 'Traveling to Asia']);

$article->id; // "01gd4d3tgrrfqeda94gdbtdk5c"
```

<a name="timestamps"></a>
### 타임스탬프

Eloquent는 모델이 참조하는 데이터베이스 테이블에 기본적으로 `created_at`과 `updated_at` 컬럼이 있다고 가정합니다. 그리고 모델이 생성되거나 갱신될 때 이 컬럼들의 값을 자동으로 관리합니다. 만약 이런 타임스탬프 컬럼의 자동 관리 기능이 필요 없다면, 모델의 `$timestamps` 속성을 `false`로 설정하면 됩니다.

```php
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

모델의 타임스탬프 형식을 커스터마이즈 하고 싶다면 `$dateFormat` 속성을 설정하세요. 이 속성은 해당 데이터가 데이터베이스에 저장되거나, 모델이 배열 또는 JSON으로 직렬화될 때 사용되는 날짜 형식을 지정합니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * 날짜 컬럼의 저장 포맷
     *
     * @var string
     */
    protected $dateFormat = 'U';
}
```

타임스탬프 컬럼명을 변경하려면, 모델에 `CREATED_AT`과 `UPDATED_AT` 상수를 정의하면 됩니다.

```php
<?php

class Flight extends Model
{
    const CREATED_AT = 'creation_date';
    const UPDATED_AT = 'updated_date';
}
```

모델의 `updated_at` 타임스탬프를 수정하지 않고 작업을 처리하고 싶다면, `withoutTimestamps` 메서드 내에서 해당 작업을 클로저로 전달하면 됩니다.

```php
Model::withoutTimestamps(fn () => $post->increment('reads'));
```

<a name="database-connections"></a>
### 데이터베이스 커넥션

기본적으로 모든 Eloquent 모델은 애플리케이션에서 설정한 기본 데이터베이스 커넥션을 사용합니다. 특정 모델만 별도의 커넥션을 사용하도록 지정하려면 모델에 `$connection` 속성을 정의하면 됩니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * 모델이 사용할 데이터베이스 커넥션명
     *
     * @var string
     */
    protected $connection = 'mysql';
}
```

<a name="default-attribute-values"></a>
### 속성 기본값

새로 인스턴스화한 모델에는 기본적으로 아무런 속성값도 담겨 있지 않습니다. 모델의 일부 속성에 기본값을 지정하려면 `$attributes` 속성 배열을 모델에 정의해두면 됩니다. `$attributes` 배열에는 데이터베이스에 저장될 수 있는 원시(raw) 값 형태로 적어야 합니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * 모델 속성의 기본값
     *
     * @var array
     */
    protected $attributes = [
        'options' => '[]',
        'delayed' => false,
    ];
}
```

<a name="configuring-eloquent-strictness"></a>
### 일러쿼언트 strictness 구성

라라벨은 다양한 상황에서 Eloquent의 동작 방식과 "strictness(엄격함)"를 설정할 수 있는 여러 메서드를 제공합니다.

먼저, `preventLazyLoading` 메서드는 지연 로딩(lazy loading)을 금지할지의 여부를 불리언 인수로 받습니다. 예를 들어, 프로덕션 환경에서는 지연 로딩을 허용하지만, 개발 환경에서는 우발적인 지연 로딩을 막고 싶은 경우에 유용합니다. 이 메서드는 보통 애플리케이션의 `AppServiceProvider`의 `boot` 메서드에서 호출합니다.

```php
use Illuminate\Database\Eloquent\Model;

/**
 * 부트스트랩(초기화) 서비스
 */
public function boot(): void
{
    Model::preventLazyLoading(! $this->app->isProduction());
}
```

또한, `preventSilentlyDiscardingAttributes` 메서드를 사용하면 모델에서 `fillable` 배열에 없는 속성을 할당하려고 할 때 에러를 발생시킬 수 있습니다. 개발 환경에서 실수로 fillable에 없는 속성을 할당해 발생하는 오류를 조기에 잡는 데 도움이 됩니다.

```php
Model::preventSilentlyDiscardingAttributes(! $this->app->isProduction());
```

<a name="retrieving-models"></a>
## 모델 조회

모델과 [연관된 데이터베이스 테이블](/docs/migrations#generating-migrations)을 생성했다면 이제 데이터 조회를 시작할 수 있습니다. 각 Eloquent 모델은 강력한 [쿼리 빌더](/docs/queries) 역할도 하므로, 관련된 테이블에 대해 매우 유연하고 간편하게 쿼리할 수 있습니다. 가장 기본적인 `all` 메서드를 사용하면 해당 모델이 연결된 테이블의 모든 레코드를 한 번에 가져올 수 있습니다.

```php
use App\Models\Flight;

foreach (Flight::all() as $flight) {
    echo $flight->name;
}
```

<a name="building-queries"></a>
#### 쿼리 작성하기

Eloquent의 `all` 메서드는 테이블 내 모든 결과를 반환합니다. 하지만 Eloquent 모델은 [쿼리 빌더](/docs/queries)이기도 하기 때문에, 쿼리에 다양한 조건을 추가하고, 마지막에 `get` 메서드를 호출해 원하는 결과만 조회할 수도 있습니다.

```php
$flights = Flight::where('active', 1)
    ->orderBy('name')
    ->take(10)
    ->get();
```

> [!NOTE]
> Eloquent 모델은 쿼리 빌더이므로, 라라벨의 [쿼리 빌더](/docs/queries)가 제공하는 모든 메서드를 자유롭게 사용할 수 있습니다. Eloquent를 사용할 때도 쿼리 빌더의 다양한 기능을 참고하세요.

<a name="refreshing-models"></a>
#### 모델 새로고침(Refresh)

이미 데이터베이스에서 조회된 Eloquent 모델 인스턴스가 있다면, `fresh` 및 `refresh` 메서드를 사용해 새로고침할 수 있습니다. `fresh` 메서드는 데이터베이스에서 모델을 다시 조회해서 반환하며, 기존 모델 인스턴스를 변경하지 않습니다.

```php
$flight = Flight::where('number', 'FR 900')->first();

$freshFlight = $flight->fresh();
```

`refresh` 메서드는 데이터베이스의 최신 상태로 현재 모델 인스턴스를 재구성(re-hydrate)합니다. 그뿐만 아니라, 이미 로드된 모든 관계(relationship)들도 함께 새로고침됩니다.

```php
$flight = Flight::where('number', 'FR 900')->first();

$flight->number = 'FR 456';

$flight->refresh();

$flight->number; // "FR 900"
```

<a name="collections"></a>
### 컬렉션

지금까지 살펴본 `all`이나 `get`과 같은 Eloquent 메서드는 여러 레코드를 조회합니다. 하지만 이 메서드들은 단순한 PHP 배열이 아니라 `Illuminate\Database\Eloquent\Collection` 인스턴스를 반환합니다.

Eloquent의 `Collection` 클래스는 라라벨의 기본 `Illuminate\Support\Collection` 클래스를 확장하며, 데이터 컬렉션을 다룰 때 유용한 [다양한 메서드](/docs/collections#available-methods)를 제공합니다. 예를 들어, `reject` 메서드를 사용하면 클로저 조건에 따라 컬렉션의 일부 모델을 걸러낼 수 있습니다.

```php
$flights = Flight::where('destination', 'Paris')->get();

$flights = $flights->reject(function (Flight $flight) {
    return $flight->cancelled;
});
```

여기에 더해 Eloquent 전용 [추가 컬렉션 메서드](/docs/eloquent-collections#available-methods)도 일부 제공됩니다.  
그리고 라라벨의 모든 컬렉션은 PHP의 반복(iterable) 인터페이스를 구현하므로 배열처럼 쉽게 반복문을 돌릴 수 있습니다.

```php
foreach ($flights as $flight) {
    echo $flight->name;
}
```

<a name="chunking-results"></a>
### 결과 청크 처리

`all`이나 `get` 메서드로 수만 건의 Eloquent 레코드를 한 번에 불러오면 애플리케이션의 메모리가 부족해질 수 있습니다. 이럴 때는 `chunk` 메서드를 사용해 많은 양의 모델을 효율적으로 처리할 수 있습니다.

`chunk` 메서드는 Eloquent 모델을 지정한 수만큼만 부분적으로 조회해서, 그 청크(조각)를 클로저로 넘깁니다. 즉, 한 번에 전체 데이터를 다 읽는 대신, 청크 단위로 순서대로 처리하므로 메모리 사용량이 크게 줄어듭니다.

```php
use App\Models\Flight;
use Illuminate\Database\Eloquent\Collection;

Flight::chunk(200, function (Collection $flights) {
    foreach ($flights as $flight) {
        // ...
    }
});
```

`chunk` 메서드의 첫 번째 인수는 "한 번에 조회할 레코드 개수"이고, 두 번째 인수인 클로저는 각 청크마다 한 번씩 호출됩니다. 청크마다 데이터베이스 쿼리가 실행되어, 그 결과가 클로저에 전달됩니다.

만약 반복처리하면서 어떤 컬럼을 기준으로 결과를 필터링하고, 동시에 그 컬럼값을 업데이트한다면 `chunk` 대신 `chunkById` 메서드를 사용해야 합니다. `chunk`를 이런 상황에서 쓰면 예상치 못한 결과가 발생할 수도 있기 때문입니다. 내부적으로 `chunkById`는 이전 청크에서 마지막으로 조회한 모델의 `id`보다 큰 값을 가진 모델만 다음 조회에서 불러옵니다.

```php
Flight::where('departed', true)
    ->chunkById(200, function (Collection $flights) {
        $flights->each->update(['departed' => false]);
    }, column: 'id');
```

그리고 `chunkById`와 `lazyById`는 쿼리 내에 자체적인 "where" 조건을 추가하므로, 여러 조건을 직접 추가할 때는 보통 클로저로 [논리적으로 그룹핑](/docs/queries#logical-grouping)해서 작성하는 것이 좋습니다.

```php
Flight::where(function ($query) {
    $query->where('delayed', true)->orWhere('cancelled', true);
})->chunkById(200, function (Collection $flights) {
    $flights->each->update([
        'departed' => false,
        'cancelled' => true
    ]);
}, column: 'id');
```

<a name="chunking-using-lazy-collections"></a>
### Lazy 컬렉션을 활용한 청크 처리

`lazy` 메서드는 [chunk 메서드와](#chunking-results) 비슷하게 백엔드에서는 쿼리를 청크 단위로 실행합니다. 하지만 각 청크를 바로 콜백으로 넘기는 대신, 하나로 펼쳐진(Flattened) [LazyCollection](/docs/collections#lazy-collections) 객체로 반환하여, 전체 결과를 하나의 스트림으로 자유롭게 다룰 수 있습니다.

```php
use App\Models\Flight;

foreach (Flight::lazy() as $flight) {
    // ...
}
```

만약 필터 조건에 사용할 컬럼을 반복 중에 업데이트할 필요가 있다면, `lazy` 대신 `lazyById`를 사용하세요. 이 메서드는 `chunkById`와 마찬가지로, 이전 청크 마지막의 `id`보다 큰 모델만 그다음 검색에서 가져옵니다.

```php
Flight::where('departed', true)
    ->lazyById(200, column: 'id')
    ->each->update(['departed' => false]);
```

`lazyByIdDesc` 메서드를 사용하면 `id` 컬럼의 내림차순 정렬 기준으로도 결과를 필터링할 수 있습니다.

<a name="cursors"></a>
### 커서(cursor)

`lazy` 메서드와 비슷하게, `cursor` 메서드를 사용하면 수만 건의 Eloquent 레코드를 반복하면서도 메모리 사용량을 크게 줄일 수 있습니다.

`cursor` 메서드는 데이터베이스에서 한 번만 쿼리를 실행하지만, 각 모델 데이터는 실제로 반복문이 돌며 필요해질 때마다 하나씩 메모리에 적재됩니다. 즉, 반복문을 진행하는 동안 한 번에 하나의 모델만 메모리에 존재하므로, 매우 많은 데이터를 처리할 때 효율적입니다.

> [!WARNING]
> `cursor` 메서드는 항상 단일 모델만 메모리에 유지하므로, 관계(eager load) 데이터를 미리 불러올 수 없습니다. 관계를 미리 불러와야 한다면, [lazy 메서드](#chunking-using-lazy-collections)를 사용해야 합니다.

내부적으로 `cursor` 메서드는 PHP의 [generator](https://www.php.net/manual/en/language.generators.overview.php) 기능을 이용합니다.

```php
use App\Models\Flight;

foreach (Flight::where('destination', 'Zurich')->cursor() as $flight) {
    // ...
}
```

`cursor`는 `Illuminate\Support\LazyCollection` 인스턴스를 반환합니다. [Lazy 컬렉션](/docs/collections#lazy-collections)을 활용하면, 평소 라라벨 컬렉션에서 쓸 수 있는 다양한 메서드를 각 모델이 하나씩 스트림으로 메모리에 로드되면서도 사용 가능합니다.

```php
use App\Models\User;

$users = User::cursor()->filter(function (User $user) {
    return $user->id > 500;
});

foreach ($users as $user) {
    echo $user->id;
}
```

비록 `cursor` 메서드를 이용하면 일반 쿼리보다 훨씬 적은 메모리를 사용하지만, 결국에는 [PHP의 PDO 드라이버가 쿼리 결과를 내부 버퍼에 모두 캐싱](https://www.php.net/manual/en/mysqlinfo.concepts.buffering.php)하기 때문에 아주 방대한 레코드를 조회하면 메모리가 부족해질 수 있습니다. 엄청나게 큰 레코드를 처리해야 한다면 [lazy 메서드](#chunking-using-lazy-collections)를 고려해보는 것이 좋습니다.

<a name="advanced-subqueries"></a>

### 고급 서브쿼리

<a name="subquery-selects"></a>
#### 서브쿼리 셀렉트

Eloquent는 고급 서브쿼리 기능도 지원합니다. 이를 활용하면 관련 테이블의 정보를 한 번의 쿼리로 가져올 수 있습니다. 예를 들어, 목적지(`destinations`) 테이블과 각 목적지에 비행하는 항공편(`flights`) 테이블이 있다고 가정해 봅시다. `flights` 테이블에는 해당 항공편이 목적지에 도착한 시간을 나타내는 `arrived_at` 컬럼이 있습니다.

쿼리 빌더의 `select` 및 `addSelect` 메서드에서 제공하는 서브쿼리 기능을 사용하면, 단일 쿼리로 모든 목적지와 해당 목적지에 가장 최근에 도착한 항공편의 이름을 조회할 수 있습니다.

```php
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

또한, 쿼리 빌더의 `orderBy` 함수는 서브쿼리를 지원합니다. 앞서 예시로 들었던 항공편 테이블을 계속 사용해서, 각 목적지에 마지막 항공편이 도착한 시간을 기준으로 모든 목적지를 정렬하고 싶을 때 이 기능을 활용할 수 있습니다. 역시 하나의 데이터베이스 쿼리로 실행됩니다.

```php
return Destination::orderByDesc(
    Flight::select('arrived_at')
        ->whereColumn('destination_id', 'destinations.id')
        ->orderByDesc('arrived_at')
        ->limit(1)
)->get();
```

<a name="retrieving-single-models"></a>
## 단일 모델 및 집계 조회

특정 쿼리에 매칭되는 모든 레코드를 조회하는 것 외에도, `find`, `first`, `firstWhere` 메서드를 이용해 단일 레코드를 조회할 수도 있습니다. 이 메서드들은 모델 컬렉션 대신 단일 모델 인스턴스를 반환합니다.

```php
use App\Models\Flight;

// 기본 키로 모델을 조회...
$flight = Flight::find(1);

// 쿼리 조건에 맞는 첫 번째 모델을 조회...
$flight = Flight::where('active', 1)->first();

// 쿼리 조건에 맞는 첫 번째 모델을 다른 방식으로 조회...
$flight = Flight::firstWhere('active', 1);
```

가끔은 원하는 결과가 없을 경우 다른 작업을 수행하고 싶을 때가 있습니다. `findOr`와 `firstOr` 메서드는 결과가 있으면 단일 모델 인스턴스를 반환하며, 결과가 없으면 전달된 클로저를 실행합니다. 클로저에서 반환되는 값이 이 메서드의 반환값이 됩니다.

```php
$flight = Flight::findOr(1, function () {
    // ...
});

$flight = Flight::where('legs', '>', 3)->firstOr(function () {
    // ...
});
```

<a name="not-found-exceptions"></a>
#### Not Found 예외

가끔 모델을 찾지 못했을 때 예외를 발생시키고 싶을 수 있습니다. 이는 라우트나 컨트롤러에서 매우 유용하게 쓰입니다. `findOrFail` 및 `firstOrFail` 메서드는 쿼리 결과 중 첫 번째를 반환하지만, 결과가 없으면 `Illuminate\Database\Eloquent\ModelNotFoundException` 예외를 발생시킵니다.

```php
$flight = Flight::findOrFail(1);

$flight = Flight::where('legs', '>', 3)->firstOrFail();
```

`ModelNotFoundException`이 잡히지 않으면, 404 HTTP 응답이 자동으로 클라이언트에 반환됩니다.

```php
use App\Models\Flight;

Route::get('/api/flights/{id}', function (string $id) {
    return Flight::findOrFail($id);
});
```

<a name="retrieving-or-creating-models"></a>
### 모델 조회 또는 생성

`firstOrCreate` 메서드는 주어진 컬럼/값 쌍을 사용해 데이터베이스 레코드를 찾으려고 시도합니다. 만약 데이터베이스에 해당 모델이 없으면, 첫 번째 배열 인자와 선택적으로 전달한 두 번째 배열 인자를 합한 속성값으로 새로운 레코드를 생성합니다.

`firstOrNew` 메서드 역시 `firstOrCreate`와 비슷하게 동작하지만, 데이터베이스에서 해당 레코드를 찾을 수 없을 때는 새 모델 인스턴스만 반환합니다. 반환된 모델은 아직 데이터베이스에 저장되지 않았으므로, 별도로 `save` 메서드를 호출해야 실제 저장됩니다.

```php
use App\Models\Flight;

// 이름으로 flight 조회. 없을 경우 새로 생성...
$flight = Flight::firstOrCreate([
    'name' => 'London to Paris'
]);

// 이름, delayed, arrival_time 속성으로 flight 조회 또는 생성...
$flight = Flight::firstOrCreate(
    ['name' => 'London to Paris'],
    ['delayed' => 1, 'arrival_time' => '11:30']
);

// 이름으로 flight 조회. 없으면 새 인스턴스 반환...
$flight = Flight::firstOrNew([
    'name' => 'London to Paris'
]);

// 이름, delayed, arrival_time 속성으로 flight 조회 또는 새 인스턴스 반환...
$flight = Flight::firstOrNew(
    ['name' => 'Tokyo to Sydney'],
    ['delayed' => 1, 'arrival_time' => '11:30']
);
```

<a name="retrieving-aggregates"></a>
### 집계값 조회

Eloquent 모델을 사용할 때도 Laravel [쿼리 빌더](/docs/queries)에서 제공하는 `count`, `sum`, `max` 등 [집계 메서드](/docs/queries#aggregates)를 활용할 수 있습니다. 예상할 수 있듯이, 이 메서드들은 Eloquent 모델 인스턴스가 아닌 스칼라 값을 반환합니다.

```php
$count = Flight::where('active', 1)->count();

$max = Flight::where('active', 1)->max('price');
```

<a name="inserting-and-updating-models"></a>
## 모델 생성 및 수정

<a name="inserts"></a>
### 생성

Eloquent를 사용할 때는 데이터베이스에서 모델을 조회하는 것만이 아니라, 새 레코드를 삽입해야 할 때도 있습니다. 다행히 Eloquent에서는 매우 쉽게 이를 처리할 수 있습니다. 새 레코드를 데이터베이스에 저장하려면, 새로운 모델 인스턴스를 생성하고 속성 값을 할당한 뒤, 인스턴스의 `save` 메서드를 호출하면 됩니다.

```php
<?php

namespace App\Http\Controllers;

use App\Models\Flight;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class FlightController extends Controller
{
    /**
     * 새 항공편을 데이터베이스에 저장합니다.
     */
    public function store(Request $request): RedirectResponse
    {
        // 요청 유효성 검증...

        $flight = new Flight;

        $flight->name = $request->name;

        $flight->save();

        return redirect('/flights');
    }
}
```

이 예제에서는 들어오는 HTTP 요청의 `name` 값을 `App\Models\Flight` 모델 인스턴스의 `name` 속성에 할당합니다. 그리고 `save` 메서드를 호출하면 레코드가 데이터베이스에 삽입됩니다. `save` 메서드가 호출될 때 모델의 `created_at` 및 `updated_at` 타임스탬프는 자동으로 설정되므로, 직접 지정할 필요가 없습니다.

또는, `create` 메서드를 이용하여 한 줄의 PHP 코드로 새 모델을 "저장"할 수도 있습니다. `create` 메서드는 삽입된 모델 인스턴스를 반환합니다.

```php
use App\Models\Flight;

$flight = Flight::create([
    'name' => 'London to Paris',
]);
```

단, `create` 메서드를 사용하기 전에 모델 클래스에 `fillable` 또는 `guarded` 속성(property)을 지정해야 합니다. 이 속성은 모든 Eloquent 모델이 기본적으로 대량 할당 취약점(mass assignment vulnerabilities)으로부터 보호받기 때문입니다. 대량 할당에 대한 자세한 설명은 [대량 할당 문서](#mass-assignment)를 참고하세요.

<a name="updates"></a>
### 수정

기존의 데이터베이스 모델을 수정할 때도 `save` 메서드를 사용할 수 있습니다. 수정하려는 모델을 조회한 뒤, 원하는 속성값을 변경하고, 다시 `save` 메서드를 호출하면 됩니다. 이때 `updated_at` 타임스탬프도 자동으로 갱신되므로, 따로 값을 지정할 필요가 없습니다.

```php
use App\Models\Flight;

$flight = Flight::find(1);

$flight->name = 'Paris to London';

$flight->save();
```

때로는 기존 모델을 수정하거나, 해당 모델이 없으면 새로 생성해야 할 수도 있습니다. `firstOrCreate`와 마찬가지로, `updateOrCreate` 메서드는 모델을 실제로 저장하므로 별도의 `save` 호출이 필요 없습니다.

아래 예제에서는, `departure` 위치가 `Oakland`이고, `destination`이 `San Diego`인 비행편이 이미 존재하면 `price`와 `discounted` 컬럼이 업데이트됩니다. 해당 조건을 만족하는 항공편이 없으면, 첫 번째 배열과 두 번째 배열을 합친 속성으로 새 항공편 레코드가 생성됩니다.

```php
$flight = Flight::updateOrCreate(
    ['departure' => 'Oakland', 'destination' => 'San Diego'],
    ['price' => 99, 'discounted' => 1]
);
```

<a name="mass-updates"></a>
#### 대량 수정(Mass Updates)

특정 쿼리에 매칭되는 모델들 역시 한 번에 일괄 수정할 수 있습니다. 아래 예제에서는 `active` 상태이고, 목적지(`destination`)가 `San Diego`인 모든 항공편을 지연(delayed) 상태로 표시합니다.

```php
Flight::where('active', 1)
    ->where('destination', 'San Diego')
    ->update(['delayed' => 1]);
```

`update` 메서드는 수정할 컬럼과 값의 쌍이 포함된 배열을 인자로 받습니다. `update`는 영향을 받은 행(row)의 수를 반환합니다.

> [!WARNING]
> Eloquent에서 대량 수정(mass update)을 실행할 때는, 수정 대상 모델에 대해 `saving`, `saved`, `updating`, `updated` 모델 이벤트가 발생하지 않습니다. 대량 수정시에는 실제로 모델을 조회하지 않고 곧바로 쿼리를 실행하기 때문입니다.

<a name="examining-attribute-changes"></a>
#### 속성 변경 내역 확인

모델의 내부 상태를 점검하고, 속성이 언제 어떻게 바뀌었는지 알아보기 위해 Eloquent는 `isDirty`, `isClean`, `wasChanged` 메서드를 제공합니다.

`isDirty` 메서드는 해당 모델이 조회된 이후 속성값이 변경되었는지 확인합니다. 특정 속성명이나 속성명 배열을 인자로 전달하면, 해당 속성들이 "더럽다(dirty)"(즉, 값이 바뀌었다)인지 검사합니다. `isClean` 메서드는 조회된 이후 속성값이 바뀌지 않았는지 확인합니다. 이 메서드 역시 속성명을 전달할 수 있습니다.

```php
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
$user->isDirty(['first_name', 'title']); // true

$user->isClean(); // false
$user->isClean('title'); // false
$user->isClean('first_name'); // true
$user->isClean(['first_name', 'title']); // false

$user->save();

$user->isDirty(); // false
$user->isClean(); // true
```

`wasChanged` 메서드는 해당 모델이 마지막으로 저장(save)되었을 때, 속성값이 실제로 변경되었는지 확인합니다. 필요하다면 인자로 속성명을 지정해, 특정 속성이 변경됐는지 확인할 수 있습니다.

```php
$user = User::create([
    'first_name' => 'Taylor',
    'last_name' => 'Otwell',
    'title' => 'Developer',
]);

$user->title = 'Painter';

$user->save();

$user->wasChanged(); // true
$user->wasChanged('title'); // true
$user->wasChanged(['title', 'slug']); // true
$user->wasChanged('first_name'); // false
$user->wasChanged(['first_name', 'title']); // true
```

`getOriginal` 메서드는, 모델이 조회된 이후 속성이 변경되었더라도, 변경 전의 원래 속성값 배열을 반환합니다. 특정 속성명의 원래 값을 얻고 싶다면 인자로 속성명을 지정할 수 있습니다.

```php
$user = User::find(1);

$user->name; // John
$user->email; // john@example.com

$user->name = 'Jack';
$user->name; // Jack

$user->getOriginal('name'); // John
$user->getOriginal(); // 원본 속성 전체 배열...
```

`getChanges` 메서드는 마지막으로 저장됐을 때 변경된 속성의 배열을 반환합니다.

```php
$user = User::find(1);

$user->name; // John
$user->email; // john@example.com

$user->update([
    'name' => 'Jack',
    'email' => 'jack@example.com',
]);

$user->getChanges();

/*
    [
        'name' => 'Jack',
        'email' => 'jack@example.com',
    ]
*/
```

<a name="mass-assignment"></a>
### 대량 할당(Mass Assignment)

`create` 메서드를 사용하면 PHP 한 줄로 새 모델을 "저장"할 수 있습니다. 이렇게 하면 삽입된 모델 인스턴스가 반환됩니다.

```php
use App\Models\Flight;

$flight = Flight::create([
    'name' => 'London to Paris',
]);
```

단, `create` 메서드를 사용하기 전에 반드시 모델 클래스에 `fillable` 또는 `guarded` 속성을 지정해야 합니다. 이는 모든 Eloquent 모델이 기본적으로 대량 할당 취약점에서 보호받기 때문입니다.

대량 할당 취약점은 사용자가 의도하지 않은 HTTP 요청 필드를 전달해서, 그 필드가 데이터베이스의 컬럼을 승격시키거나 변조할 수 있을 때 발생합니다. 예를 들어 악의적인 사용자가 HTTP 요청에 `is_admin` 파라미터를 추가해서, 이를 모델의 `create` 메서드로 전달하면 자기 자신을 관리자 권한으로 변경할 수 있습니다.

따라서 우선, 어떤 모델 속성을 대량 할당 가능하게 만들지 `$fillable` 속성에 지정해야 합니다. 예를 들어 다음과 같이 `Flight` 모델의 `name` 속성을 대량 할당 가능하게 지정할 수 있습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * 대량 할당이 가능한 속성 지정
     *
     * @var array<int, string>
     */
    protected $fillable = ['name'];
}
```

대량 할당 가능 속성을 지정한 뒤에는, `create` 메서드로 새 레코드를 삽입할 수 있습니다. `create` 메서드는 새로 생성된 모델 인스턴스를 반환합니다.

```php
$flight = Flight::create(['name' => 'London to Paris']);
```

이미 생성된 모델 인스턴스가 있다면, `fill` 메서드로 여러 속성을 한 번에 할당할 수도 있습니다.

```php
$flight->fill(['name' => 'Amsterdam to Frankfurt']);
```

<a name="mass-assignment-json-columns"></a>
#### 대량 할당과 JSON 컬럼

JSON 컬럼을 대량 할당할 때도, 각 컬럼의 키를 `$fillable` 배열에 반드시 명시해야 합니다. 보안을 위해, 라라벨은 `guarded` 속성을 사용할 때 중첩된 JSON 속성의 대량 할당은 지원하지 않습니다.

```php
/**
 * 대량 할당이 가능한 속성 지정
 *
 * @var array<int, string>
 */
protected $fillable = [
    'options->enabled',
];
```

<a name="allowing-mass-assignment"></a>
#### 모든 속성의 대량 할당 허용

모델의 모든 속성을 대량 할당 가능하게 하고 싶다면, `$guarded` 속성을 빈 배열로 설정할 수 있습니다. 단, 모델의 보호를 해제한 경우, Eloquent의 `fill`, `create`, `update` 메서드에 전달하는 배열을 항상 신중하게 직접 작성해야 합니다.

```php
/**
 * 대량 할당에서 제외할 속성 지정
 *
 * @var array<string>|bool
 */
protected $guarded = [];
```

<a name="mass-assignment-exceptions"></a>
#### 대량 할당 예외

기본적으로, `$fillable` 배열에 포함되지 않은 속성은 대량 할당 작업 중 자동으로 무시(무반응)됩니다. 운영 환경에서는 이 방식을 기대하는 것이 맞지만, 개발 중에는 모델 변경이 왜 반영되지 않는지 혼란을 줄 수 있습니다.

원할 경우, 채워질 수 없는(unfillable) 속성을 대량 할당하려고 할 때 예외를 발생하도록 라라벨에 지시할 수 있습니다. 이를 위해 `preventSilentlyDiscardingAttributes` 메서드를 호출하면 됩니다. 일반적으로, 이 메서드는 애플리케이션의 `AppServiceProvider` 클래스의 `boot` 메서드에서 호출합니다.

```php
use Illuminate\Database\Eloquent\Model;

/**
 * 애플리케이션 서비스 부트스트랩
 */
public function boot(): void
{
    Model::preventSilentlyDiscardingAttributes($this->app->isLocal());
}
```

<a name="upserts"></a>
### Upserts

Eloquent의 `upsert` 메서드를 사용하면 단일 원자적(atomic) 작업으로 레코드를 생성 또는 업데이트할 수 있습니다. 첫 번째 인자는 삽입 또는 수정할 값들, 두 번째 인자는 레코드를 고유하게 구분할 컬럼명 배열, 마지막 세 번째 인자는 기존 레코드가 이미 존재할 때 업데이트할 컬럼명 배열입니다. `upsert` 메서드는 타임스탬프가 활성화된 경우 `created_at`과 `updated_at` 컬럼도 자동으로 설정됩니다.

```php
Flight::upsert([
    ['departure' => 'Oakland', 'destination' => 'San Diego', 'price' => 99],
    ['departure' => 'Chicago', 'destination' => 'New York', 'price' => 150]
], uniqueBy: ['departure', 'destination'], update: ['price']);
```

> [!WARNING]
> SQL Server를 제외한 모든 데이터베이스에서는, `upsert`의 두 번째 인자로 전달한 컬럼에 "기본키" 또는 "유니크" 인덱스가 반드시 있어야 합니다. 또한 MariaDB와 MySQL 드라이버는 `upsert`의 두 번째 인자를 무시하고, 테이블의 "기본키"와 "유니크" 인덱스를 항상 사용해서 기존 레코드의 존재 여부를 판단합니다.

<a name="deleting-models"></a>
## 모델 삭제

모델을 삭제하려면, 해당 모델 인스턴스의 `delete` 메서드를 호출하면 됩니다.

```php
use App\Models\Flight;

$flight = Flight::find(1);

$flight->delete();
```

<a name="deleting-an-existing-model-by-its-primary-key"></a>
#### 기본 키로 기존 모델 삭제

위 예제처럼 먼저 모델을 조회한 뒤 `delete`를 호출할 수도 있고, 모델의 기본 키를 알고 있다면 조회하지 않고 바로 `destroy` 메서드로 삭제할 수 있습니다. `destroy`는 단일 기본 키뿐 아니라, 여러 개의 기본 키, 기본 키 배열, 또는 [컬렉션](/docs/collections)을 인자로 받을 수 있습니다.

```php
Flight::destroy(1);

Flight::destroy(1, 2, 3);

Flight::destroy([1, 2, 3]);

Flight::destroy(collect([1, 2, 3]));
```

[소프트 삭제 모델](#soft-deleting)을 사용하는 경우, `forceDestroy` 메서드를 사용하면 모델을 완전히 삭제(영구 삭제)할 수 있습니다.

```php
Flight::forceDestroy(1);
```

> [!WARNING]
> `destroy` 메서드는 각각의 모델을 개별적으로 조회하고 `delete` 메서드를 호출하므로, 삭제 이벤트(`deleting`, `deleted`)가 모델마다 제대로 실행됩니다.

<a name="deleting-models-using-queries"></a>
#### 쿼리를 이용한 모델 삭제

물론, Eloquent 쿼리로 조건에 맞는 모든 모델을 한 번에 삭제할 수도 있습니다. 아래 예제에서는 `inactive` 상태로 표시된 모든 항공편을 삭제합니다. 대량 수정과 마찬가지로, 대량 삭제에서도 삭제된 모델에 대한 이벤트가 발생하지 않습니다.

```php
$deleted = Flight::where('active', 0)->delete();
```

테이블 내 모든 모델을 삭제하려면, 조건을 지정하지 않고 쿼리를 실행하면 됩니다.

```php
$deleted = Flight::query()->delete();
```

> [!WARNING]
> Eloquent에서 대량 삭제를 실행할 때는, 삭제되는 모델에 대해 `deleting`, `deleted` 모델 이벤트가 발생하지 않습니다. 대량 삭제 시에도 실제로 모델을 로드하지 않고 그대로 삭제 쿼리를 실행하기 때문입니다.

<a name="soft-deleting"></a>
### 소프트 삭제(Soft Deleting)

데이터베이스에서 레코드를 실제로 제거하는 것 외에도, Eloquent는 "소프트 삭제"도 지원합니다. 소프트 삭제된 모델은 데이터베이스에서 실제로 삭제되지 않고, 대신 `deleted_at` 속성에 삭제된 날짜와 시간이 기록됩니다. 모델에 소프트 삭제를 적용하려면, `Illuminate\Database\Eloquent\SoftDeletes` 트레잇을 추가하면 됩니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Flight extends Model
{
    use SoftDeletes;
}
```

> [!NOTE]
> `SoftDeletes` 트레잇은 `deleted_at` 속성을 자동으로 `DateTime`/`Carbon` 인스턴스로 변환(cast)해줍니다.

또한, 테이블에 `deleted_at` 컬럼을 추가해야 합니다. 라라벨 [스키마 빌더](/docs/migrations)에는 이 컬럼을 쉽게 추가할 수 있는 헬퍼 메서드가 있습니다.

```php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('flights', function (Blueprint $table) {
    $table->softDeletes();
});

Schema::table('flights', function (Blueprint $table) {
    $table->dropSoftDeletes();
});
```

이제 모델의 `delete` 메서드를 호출하면, `deleted_at` 컬럼이 현재 날짜와 시간으로 설정됩니다. 하지만 데이터베이스 레코드는 테이블에 그대로 남아 있습니다. 소프트 삭제를 사용하는 모델을 쿼리할 때, 소프트 삭제된 모델은 자동으로 모든 쿼리 결과에서 제외됩니다.

특정 모델 인스턴스가 소프트 삭제되었는지 확인하려면, `trashed` 메서드를 사용하면 됩니다.

```php
if ($flight->trashed()) {
    // ...
}
```

<a name="restoring-soft-deleted-models"></a>
#### 소프트 삭제 모델 복원

가끔은 소프트 삭제된 모델을 "취소", 즉 복원하고 싶을 때가 있습니다. 소프트 삭제된 모델을 복원하려면, 모델 인스턴스의 `restore` 메서드를 호출하면 됩니다. `restore`는 모델의 `deleted_at` 컬럼을 `null`로 변경합니다.

```php
$flight->restore();
```

여러 개의 모델을 쿼리로 한 번에 복원할 수도 있습니다. 이 역시 대량 작업이므로, 복원되는 모델에 대한 이벤트들은 발생하지 않습니다.

```php
Flight::withTrashed()
    ->where('airline_id', 1)
    ->restore();
```

[관계](/docs/eloquent-relationships) 쿼리에서도 `restore` 메서드를 사용할 수 있습니다.

```php
$flight->history()->restore();
```

<a name="permanently-deleting-models"></a>
#### 영구적으로 모델 삭제

데이터베이스에서 모델을 완전히 제거해야 하는 경우도 있습니다. 이럴 때는 `forceDelete` 메서드를 사용하면 소프트 삭제된 모델을 영구적으로 테이블에서 제거할 수 있습니다.

```php
$flight->forceDelete();
```

Eloquent 관계 쿼리에서도 `forceDelete`를 함께 사용할 수 있습니다.

```php
$flight->history()->forceDelete();
```

<a name="querying-soft-deleted-models"></a>

### 소프트 삭제된 모델 쿼리하기

<a name="including-soft-deleted-models"></a>
#### 소프트 삭제된 모델 포함하기

앞서 설명한 것처럼, 소프트 삭제된 모델은 기본적으로 쿼리 결과에서 자동으로 제외됩니다. 그러나 쿼리에서 소프트 삭제된 모델도 함께 조회하려면 쿼리에 `withTrashed` 메서드를 호출하면 됩니다.

```php
use App\Models\Flight;

$flights = Flight::withTrashed()
    ->where('account_id', 1)
    ->get();
```

`withTrashed` 메서드는 [관계](/docs/eloquent-relationships) 쿼리를 생성할 때도 사용할 수 있습니다.

```php
$flight->history()->withTrashed()->get();
```

<a name="retrieving-only-soft-deleted-models"></a>
#### 소프트 삭제된 모델만 조회하기

`onlyTrashed` 메서드를 사용하면 **오직** 소프트 삭제된 모델만 조회할 수 있습니다.

```php
$flights = Flight::onlyTrashed()
    ->where('airline_id', 1)
    ->get();
```

<a name="pruning-models"></a>
## 모델 정리(Pruning)

더 이상 필요하지 않은 모델을 주기적으로 삭제하고 싶을 때가 있습니다. 이럴 때는 삭제하려는 모델에 `Illuminate\Database\Eloquent\Prunable` 또는 `Illuminate\Database\Eloquent\MassPrunable` 트레이트를 추가할 수 있습니다. 트레이트를 추가한 후, 더 이상 필요하지 않은 모델을 정의하는 Eloquent 쿼리 빌더를 반환하는 `prunable` 메서드를 구현해야 합니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;

class Flight extends Model
{
    use Prunable;

    /**
     * 정리가 필요한 모델을 조회하는 쿼리를 반환합니다.
     */
    public function prunable(): Builder
    {
        return static::where('created_at', '<=', now()->subMonth());
    }
}
```

모델을 `Prunable`로 지정할 때는, 모델에 `pruning` 메서드를 정의할 수도 있습니다. 이 메서드는 모델이 삭제되기 전에 호출됩니다. 데이터베이스에서 모델이 영구적으로 삭제되기 전에, 모델과 연관된 추가 리소스(예: 저장된 파일 등)를 함께 삭제하고 싶을 때 유용합니다.

```php
/**
 * 정리를 위해 모델을 준비합니다.
 */
protected function pruning(): void
{
    // ...
}
```

정리할 수 있는(prunable) 모델을 구성한 후에는, 애플리케이션의 `routes/console.php` 파일에서 `model:prune` Artisan 명령어를 스케줄링해야 합니다. 이 명령이 실행될 주기는 자유롭게 선택할 수 있습니다.

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('model:prune')->daily();
```

내부적으로 `model:prune` 명령은 애플리케이션의 `app/Models` 디렉터리 내에서 "Prunable" 모델을 자동으로 감지합니다. 만약 모델이 다른 위치에 있다면, `--model` 옵션을 사용하여 모델 클래스명을 지정할 수 있습니다.

```php
Schedule::command('model:prune', [
    '--model' => [Address::class, Flight::class],
])->daily();
```

특정 모델은 정리 대상에서 제외하고 나머지 모델만 일괄 정리하려면 `--except` 옵션을 사용할 수 있습니다.

```php
Schedule::command('model:prune', [
    '--except' => [Address::class, Flight::class],
])->daily();
```

`prunable` 쿼리를 테스트하려면 `model:prune` 명령을 `--pretend` 옵션과 함께 실행하면 됩니다. 이 옵션을 사용하면 실제로 삭제를 실행하지 않고, 얼마나 많은 레코드가 삭제될 수 있는지 결과만 보여줍니다.

```shell
php artisan model:prune --pretend
```

> [!WARNING]
> 소프트 삭제된 모델이 pruning 쿼리에 일치하면 영구적으로(`forceDelete`) 삭제됩니다.

<a name="mass-pruning"></a>
#### 대량 정리(Mass Pruning)

`Illuminate\Database\Eloquent\MassPrunable` 트레이트가 적용된 모델은 대량 삭제 쿼리를 사용하여 데이터베이스에서 모델을 삭제합니다. 따라서 `pruning` 메서드는 호출되지 않고, `deleting` 및 `deleted`와 같은 모델 이벤트도 발생하지 않습니다. 이는 삭제 전 실제로 모델 데이터를 조회하지 않으므로 정리 작업을 훨씬 효율적으로 만들어 줍니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\MassPrunable;

class Flight extends Model
{
    use MassPrunable;

    /**
     * 정리가 필요한 모델을 조회하는 쿼리를 반환합니다.
     */
    public function prunable(): Builder
    {
        return static::where('created_at', '<=', now()->subMonth());
    }
}
```

<a name="replicating-models"></a>
## 모델 복제하기(Replicating Models)

기존 모델 인스턴스를 저장하지 않은 복제본으로 만들고 싶을 때는 `replicate` 메서드를 사용할 수 있습니다. 이 방법은 여러 속성이 동일한 모델 인스턴스를 여러 개 생성하려는 경우에 특히 유용합니다.

```php
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

복제 시, 특정 속성을 새 모델에 복사하지 않으려면 `replicate` 메서드에 배열로 속성명을 전달하면 됩니다.

```php
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
### 전역 스코프(Global Scopes)

전역 스코프를 사용하면 특정 모델에 대한 모든 쿼리에 제약 조건을 추가할 수 있습니다. 라라벨의 [소프트 삭제](#soft-deleting) 기능 역시 전역 스코프를 이용해 "삭제되지 않은" 모델만 데이터베이스에서 조회합니다. 전역 스코프를 직접 정의하면 특정 모델의 모든 쿼리에 반복적으로 동일한 조건을 자동으로 추가할 수 있어 매우 편리합니다.

<a name="generating-scopes"></a>
#### 스코프 생성하기

새로운 전역 스코프를 생성하려면, `make:scope` Artisan 명령어를 실행하면 됩니다. 이렇게 생성된 스코프 클래스는 애플리케이션의 `app/Models/Scopes` 디렉터리에 위치하게 됩니다.

```shell
php artisan make:scope AncientScope
```

<a name="writing-global-scopes"></a>
#### 전역 스코프 작성하기

전역 스코프를 작성하는 방법은 매우 간단합니다. 먼저, `make:scope` 명령으로 `Illuminate\Database\Eloquent\Scope` 인터페이스를 구현하는 클래스를 생성합니다. `Scope` 인터페이스는 하나의 메서드, 즉 `apply` 메서드 구현이 필요합니다. 이 메서드에서는 필요에 따라 쿼리에 `where` 조건이나 다양한 절(clause)을 추가할 수 있습니다.

```php
<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class AncientScope implements Scope
{
    /**
     * 주어진 Eloquent 쿼리 빌더에 스코프를 적용합니다.
     */
    public function apply(Builder $builder, Model $model): void
    {
        $builder->where('created_at', '<', now()->subYears(2000));
    }
}
```

> [!NOTE]
> 전역 스코프에서 select 절에 컬럼을 추가하려면 `select` 대신 `addSelect` 메서드를 사용해야 합니다. 그래야 기존 select 절이 의도치 않게 대체되는 것을 방지할 수 있습니다.

<a name="applying-global-scopes"></a>
#### 전역 스코프 적용하기

모델에 전역 스코프를 적용하려면, 모델 클래스에 `ScopedBy` 속성을 추가하면 됩니다.

```php
<?php

namespace App\Models;

use App\Models\Scopes\AncientScope;
use Illuminate\Database\Eloquent\Attributes\ScopedBy;

#[ScopedBy([AncientScope::class])]
class User extends Model
{
    //
}
```

또는 모델의 `booted` 메서드를 오버라이드하고, 해당 메서드 내에서 `addGlobalScope` 메서드로 스코프 인스턴스를 직접 등록할 수도 있습니다. `addGlobalScope`는 단 하나의 인수로 스코프 인스턴스를 받습니다.

```php
<?php

namespace App\Models;

use App\Models\Scopes\AncientScope;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 모델의 "booted" 메서드입니다.
     */
    protected static function booted(): void
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
#### 익명 전역 스코프(Anonymous Global Scopes)

Eloquent는 익명 함수(클로저)를 사용하여 전역 스코프를 정의할 수도 있습니다. 이는 별도의 스코프 클래스를 만들 필요가 없는 간단한 스코프에 특히 유용합니다. 클로저를 사용할 때는 `addGlobalScope` 메서드의 첫 번째 인수로 원하는 스코프 이름을 지정해 주어야 합니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 모델의 "booted" 메서드입니다.
     */
    protected static function booted(): void
    {
        static::addGlobalScope('ancient', function (Builder $builder) {
            $builder->where('created_at', '<', now()->subYears(2000));
        });
    }
}
```

<a name="removing-global-scopes"></a>
#### 전역 스코프 제거하기

특정 쿼리에서 전역 스코프를 제거하려면 `withoutGlobalScope` 메서드를 사용합니다. 이때 인수로는 전역 스코프 클래스명을 전달합니다.

```php
User::withoutGlobalScope(AncientScope::class)->get();
```

클로저를 사용해 전역 스코프를 정의한 경우에는, 전역 스코프에 할당한 문자열 이름을 인수로 전달해야 합니다.

```php
User::withoutGlobalScope('ancient')->get();
```

여러 개 또는 모든 전역 스코프를 제거하고 싶다면, `withoutGlobalScopes` 메서드를 사용할 수 있습니다.

```php
// 모든 전역 스코프 제거...
User::withoutGlobalScopes()->get();

// 일부 전역 스코프만 제거...
User::withoutGlobalScopes([
    FirstScope::class, SecondScope::class
])->get();
```

<a name="local-scopes"></a>
### 로컬 스코프(Local Scopes)

로컬 스코프를 사용하면 애플리케이션 곳곳에서 쉽게 재사용할 수 있는 쿼리 제약 조건 집합을 정의할 수 있습니다. 예를 들어, "인기 있는" 사용자들만 자주 조회해야 할 때 로컬 스코프가 유용합니다. 스코프를 정의하려면, Eloquent 메서드 위에 `Scope` 속성을 추가해 주세요.

스코프 메서드는 항상 동일한 쿼리 빌더 인스턴스 또는 `void`를 반환해야 합니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 쿼리에 인기 있는 사용자만 포함하도록 합니다.
     */
    #[Scope]
    protected function popular(Builder $query): void
    {
        $query->where('votes', '>', 100);
    }

    /**
     * 쿼리에 활성 사용자만 포함하도록 합니다.
     */
    #[Scope]
    protected function active(Builder $query): void
    {
        $query->where('active', 1);
    }
}
```

<a name="utilizing-a-local-scope"></a>
#### 로컬 스코프 활용하기

스코프가 정의되면, 모델을 쿼리할 때 스코프 메서드를 그대로 호출할 수 있습니다. 여러 개의 스코프 호출도 체이닝 할 수 있습니다.

```php
use App\Models\User;

$users = User::popular()->active()->orderBy('created_at')->get();
```

여러 Eloquent 스코프를 `or` 쿼리 연산자로 결합하려면, [논리적 그룹화](/docs/queries#logical-grouping)를 위해 클로저를 사용해야 할 수 있습니다.

```php
$users = User::popular()->orWhere(function (Builder $query) {
    $query->active();
})->get();
```

하지만, 이런 방식이 번거로울 수 있으므로, 라라벨에서는 클로저 없이 스코프 체이닝이 가능한 "상위 수준(higher order)" `orWhere` 메서드를 제공합니다.

```php
$users = User::popular()->orWhere->active()->get();
```

<a name="dynamic-scopes"></a>
#### 동적 스코프(Dynamic Scopes)

스코프에서 매개변수를 받아 사용하고 싶을 때도 있습니다. 추가 매개변수를 스코프 메서드 시그니처(함수 정의)에 `$query` 뒤에 써주면 됩니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 쿼리에 지정한 타입의 사용자만 포함합니다.
     */
    #[Scope]
    protected function ofType(Builder $query, string $type): void
    {
        $query->where('type', $type);
    }
}
```

스코프 메서드에 원하는 인수를 추가했다면, 쿼리에서 스코프 호출 시 해당 인수를 넘기면 됩니다.

```php
$users = User::ofType('admin')->get();
```

<a name="pending-attributes"></a>
### Pending Attributes

스코프를 활용하여 스코프에서 제약 조건으로 사용한 속성 값을 가진 모델을 만들고 싶을 때는 `withAttributes` 메서드를 사용할 수 있습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    /**
     * 쿼리에 임시 글만 포함합니다.
     */
    #[Scope]
    protected function draft(Builder $query): void
    {
        $query->withAttributes([
            'hidden' => true,
        ]);
    }
}
```

`withAttributes` 메서드는 쿼리에 주어진 속성으로 `where` 조건을 추가함과 동시에, 스코프를 이용해 생성된 모델에도 해당 속성을 추가합니다.

```php
$draft = Post::draft()->create(['title' => 'In Progress']);

$draft->hidden; // true
```

`withAttributes` 메서드가 쿼리에 `where` 조건을 추가하지 않도록 하려면, `asConditions` 인수를 `false`로 지정하면 됩니다.

```php
$query->withAttributes([
    'hidden' => true,
], asConditions: false);
```

<a name="comparing-models"></a>
## 모델 비교하기

두 모델 인스턴스가 "동일한지" 확인해야 할 때가 있습니다. 이럴 때는 `is`와 `isNot` 메서드를 사용하면 두 모델이 같은 기본 키, 테이블, 데이터베이스 커넥션을 사용하는지 빠르게 비교할 수 있습니다.

```php
if ($post->is($anotherPost)) {
    // ...
}

if ($post->isNot($anotherPost)) {
    // ...
}
```

`is`와 `isNot` 메서드는 `belongsTo`, `hasOne`, `morphTo`, `morphOne`과 같은 [관계](/docs/eloquent-relationships)를 사용할 때도 이용할 수 있습니다. 이 메서드는 쿼리 없이도 관련 모델과 비교하고 싶을 때 특히 유용합니다.

```php
if ($post->author()->is($user)) {
    // ...
}
```

<a name="events"></a>
## 이벤트(Events)

> [!NOTE]
> Eloquent 이벤트를 클라이언트 애플리케이션으로 직접 브로드캐스트하고 싶으신가요? 라라벨의 [모델 이벤트 브로드캐스팅](/docs/broadcasting#model-broadcasting) 문서를 참고해 보세요.

Eloquent 모델은 여러 이벤트를 발생시켜, 모델 생명주기에서 아래와 같은 시점에 직접 작업을 연결할 수 있습니다. `retrieved`, `creating`, `created`, `updating`, `updated`, `saving`, `saved`, `deleting`, `deleted`, `trashed`, `forceDeleting`, `forceDeleted`, `restoring`, `restored`, `replicating`.

- `retrieved` 이벤트는 기존 모델을 데이터베이스에서 조회할 때 발생합니다.
- 새로운 모델을 처음 저장할 때는 `creating`과 `created` 이벤트가 차례로 발생합니다.
- 이미 존재하는 모델의 데이터를 변경해서 `save`를 호출하면 `updating` / `updated` 이벤트가 발생합니다.
- 모델을 새로 생성하거나 수정할 때(속성 값이 변경되지 않아도) `saving` / `saved` 이벤트가 발생합니다.
- 이벤트명 끝에 `-ing`가 붙은 이벤트는 데이터베이스에 반영되기 *전*에, `-ed`로 끝나는 이벤트는 반영된 *후*에 발생합니다.

모델 이벤트를 수신하기 위해서는 Eloquent 모델의 `$dispatchesEvents` 속성에 이벤트와 이벤트 클래스의 매핑을 정의하면 됩니다. 각 이벤트 클래스는 생성자에서 영향을 받는 모델 인스턴스를 전달받습니다.

```php
<?php

namespace App\Models;

use App\Events\UserDeleted;
use App\Events\UserSaved;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * 모델 이벤트 매핑입니다.
     *
     * @var array<string, string>
     */
    protected $dispatchesEvents = [
        'saved' => UserSaved::class,
        'deleted' => UserDeleted::class,
    ];
}
```

Eloquent 이벤트를 정의하고 매핑했다면, [이벤트 리스너](/docs/events#defining-listeners)를 이용해 해당 이벤트를 처리할 수 있습니다.

> [!WARNING]
> Eloquent의 대량 수정(mass update)이나 삭제(mass delete) 쿼리를 실행할 때는, 영향을 받는 모델에 대해 `saved`, `updated`, `deleting`, `deleted` 등의 모델 이벤트가 발생하지 않습니다. 이는 이러한 작업이 실제로 모델을 조회하지 않고 바로 처리되기 때문입니다.

<a name="events-using-closures"></a>
### 클로저를 이용한 이벤트 사용

커스텀 이벤트 클래스를 사용하지 않고, 각 이벤트에 대해 클로저를 등록하여 처리할 수도 있습니다. 보통 이런 클로저는 모델의 `booted` 메서드 내부에서 등록하는 것이 일반적입니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 모델의 "booted" 메서드입니다.
     */
    protected static function booted(): void
    {
        static::created(function (User $user) {
            // ...
        });
    }
}
```

필요하다면, [큐어블(Queueable) 익명 이벤트 리스너](/docs/events#queuable-anonymous-event-listeners)를 활용할 수도 있습니다. 이 방법을 사용하면, 모델 이벤트 리스너를 애플리케이션의 [큐](/docs/queues)로 백그라운드에서 실행하도록 지정할 수 있습니다.

```php
use function Illuminate\Events\queueable;

static::created(queueable(function (User $user) {
    // ...
}));
```

<a name="observers"></a>

### 옵저버

<a name="defining-observers"></a>
#### 옵저버 정의하기

하나의 모델에서 여러 이벤트를 리스닝해야 하는 경우, 옵저버를 사용하여 관련된 모든 이벤트 리스너를 하나의 클래스에 그룹화할 수 있습니다. 옵저버 클래스는 Eloquent 이벤트명을 메서드 이름으로 사용하며, 각 메서드는 해당 이벤트로 영향을 받은 모델을 단일 인수로 전달받습니다. 새로운 옵저버 클래스를 생성하는 가장 쉬운 방법은 `make:observer` Artisan 명령어를 사용하는 것입니다.

```shell
php artisan make:observer UserObserver --model=User
```

이 명령어를 실행하면 새 옵저버가 `app/Observers` 디렉터리에 생성됩니다. 해당 디렉터리가 없는 경우 Artisan이 자동으로 만들어줍니다. 기본적으로 생성되는 옵저버 클래스는 아래와 같습니다.

```php
<?php

namespace App\Observers;

use App\Models\User;

class UserObserver
{
    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
        // ...
    }

    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user): void
    {
        // ...
    }

    /**
     * Handle the User "deleted" event.
     */
    public function deleted(User $user): void
    {
        // ...
    }

    /**
     * Handle the User "restored" event.
     */
    public function restored(User $user): void
    {
        // ...
    }

    /**
     * Handle the User "forceDeleted" event.
     */
    public function forceDeleted(User $user): void
    {
        // ...
    }
}
```

옵저버를 등록하려면 해당 모델에 `ObservedBy` 속성(attribute)을 선언하면 됩니다.

```php
use App\Observers\UserObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;

#[ObservedBy([UserObserver::class])]
class User extends Authenticatable
{
    //
}
```

또는, `observe` 메서드를 통해 수동으로 옵저버를 등록할 수도 있습니다. 주로 애플리케이션의 `AppServiceProvider` 클래스의 `boot` 메서드에서 옵저버를 등록합니다.

```php
use App\Models\User;
use App\Observers\UserObserver;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    User::observe(UserObserver::class);
}
```

> [!NOTE]
> 옵저버가 리스닝할 수 있는 이벤트에는 `saving`, `retrieved` 등 추가적인 이벤트도 있습니다. 이들 이벤트에 대한 자세한 내용은 [이벤트](#events) 문서에서 다룹니다.

<a name="observers-and-database-transactions"></a>
#### 옵저버와 데이터베이스 트랜잭션

모델이 데이터베이스 트랜잭션 내에서 생성되는 경우, 옵저버의 이벤트 핸들러가 트랜잭션 커밋 이후에만 실행되도록 하고 싶을 때가 있습니다. 이런 경우 옵저버 클래스에서 `ShouldHandleEventsAfterCommit` 인터페이스를 구현하면 됩니다. 트랜잭션이 진행 중이 아니라면, 이벤트 핸들러는 즉시 실행됩니다.

```php
<?php

namespace App\Observers;

use App\Models\User;
use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;

class UserObserver implements ShouldHandleEventsAfterCommit
{
    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
        // ...
    }
}
```

<a name="muting-events"></a>
### 이벤트 일시 정지(Muting)

경우에 따라 모델에서 발생하는 모든 이벤트를 일시적으로 "정지(mute)"해야 할 때가 있습니다. 이때는 `withoutEvents` 메서드를 사용할 수 있습니다. `withoutEvents` 메서드는 클로저를 유일한 인수로 받아서, 해당 클로저 안에서 실행되는 모든 코드가 모델 이벤트를 발생시키지 않게 처리합니다. 클로저에서 반환된 값은 그대로 `withoutEvents` 메서드의 반환값이 됩니다.

```php
use App\Models\User;

$user = User::withoutEvents(function () {
    User::findOrFail(1)->delete();

    return User::find(2);
});
```

<a name="saving-a-single-model-without-events"></a>
#### 단일 모델을 이벤트 없이 저장하기

특정 모델을 이벤트를 발생시키지 않고 "저장"하고 싶을 때가 있습니다. 이럴 때는 `saveQuietly` 메서드를 사용하면 됩니다.

```php
$user = User::findOrFail(1);

$user->name = 'Victoria Faith';

$user->saveQuietly();
```

또한 동일한 방식으로 모델을 "업데이트", "삭제", "소프트 삭제", "복원", "복제"할 때도 이벤트를 발생시키지 않도록 할 수 있습니다.

```php
$user->deleteQuietly();
$user->forceDeleteQuietly();
$user->restoreQuietly();
```