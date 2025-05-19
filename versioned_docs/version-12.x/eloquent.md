# Eloquent: 시작하기 (Eloquent: Getting Started)

- [소개](#introduction)
- [모델 클래스 생성](#generating-model-classes)
- [Eloquent 모델 관례](#eloquent-model-conventions)
    - [테이블명](#table-names)
    - [기본 키](#primary-keys)
    - [UUID 및 ULID 키](#uuid-and-ulid-keys)
    - [타임스탬프](#timestamps)
    - [데이터베이스 연결](#database-connections)
    - [속성의 기본값](#default-attribute-values)
    - [Eloquent 엄격성 설정](#configuring-eloquent-strictness)
- [모델 조회](#retrieving-models)
    - [컬렉션](#collections)
    - [결과 청크 처리](#chunking-results)
    - [Lazy 컬렉션을 활용한 청크 처리](#chunking-using-lazy-collections)
    - [커서](#cursors)
    - [고급 서브쿼리](#advanced-subqueries)
- [단일 모델 / 집계값 조회](#retrieving-single-models)
    - [모델 조회 또는 생성](#retrieving-or-creating-models)
    - [집계값 조회](#retrieving-aggregates)
- [모델 삽입 및 수정](#inserting-and-updating-models)
    - [삽입](#inserts)
    - [수정](#updates)
    - [대량 할당](#mass-assignment)
    - [업서트(Upserts)](#upserts)
- [모델 삭제](#deleting-models)
    - [소프트 삭제](#soft-deleting)
    - [소프트 삭제 모델 조회](#querying-soft-deleted-models)
- [모델 정리(Pruning)](#pruning-models)
- [모델 복제(Replicating)](#replicating-models)
- [쿼리 스코프](#query-scopes)
    - [글로벌 스코프](#global-scopes)
    - [로컬 스코프](#local-scopes)
    - [대기 속성(Pending Attributes)](#pending-attributes)
- [모델 비교](#comparing-models)
- [이벤트](#events)
    - [클로저 활용](#events-using-closures)
    - [옵서버(Observers)](#observers)
    - [이벤트 무시(Muting)](#muting-events)

<a name="introduction"></a>
## 소개

Laravel에는 Eloquent라는 객체-관계 매퍼(ORM)가 포함되어 있어 데이터베이스와 상호작용하는 작업이 매우 즐거워집니다. Eloquent를 사용할 때, 각 데이터베이스 테이블에는 해당 테이블과 연동되는 "모델"이 지정됩니다. 모델을 사용하면 데이터베이스 테이블에서 레코드를 조회하는 것은 물론, 테이블에 레코드를 삽입, 수정, 삭제하는 작업도 손쉽게 처리할 수 있습니다.

> [!NOTE]
> 시작하기 전에 반드시 애플리케이션의 `config/database.php` 설정 파일에서 데이터베이스 연결을 구성해야 합니다. 데이터베이스 구성에 대한 자세한 내용은 [데이터베이스 설정 문서](/docs/12.x/database#configuration)를 참고하세요.

<a name="generating-model-classes"></a>
## 모델 클래스 생성

먼저 Eloquent 모델을 하나 만들어보겠습니다. 모델 클래스는 일반적으로 `app\Models` 디렉터리에 위치하며, `Illuminate\Database\Eloquent\Model` 클래스를 상속합니다. 새로운 모델을 생성할 때는 `make:model` [Artisan 명령어](/docs/12.x/artisan)를 사용할 수 있습니다.

```shell
php artisan make:model Flight
```

모델을 생성하면서 동시에 [데이터베이스 마이그레이션](/docs/12.x/migrations) 파일도 만들고 싶다면 `--migration` 또는 `-m` 옵션을 사용할 수 있습니다.

```shell
php artisan make:model Flight --migration
```

모델을 생성할 때, 팩토리(factory), 시더(seeder), 정책(policy), 컨트롤러, 폼 요청(form request) 등 다양한 유형의 클래스를 함께 만들 수도 있습니다. 이러한 옵션들은 조합하여 한 번에 여러 클래스를 생성하는 것도 가능합니다.

```shell
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

# 모델, 마이그레이션, 팩토리, 시더, 컨트롤러 동시 생성...
php artisan make:model Flight -mfsc

# 모델, 마이그레이션, 팩토리, 시더, 정책, 컨트롤러, 폼 요청까지 모두 생성하는 단축키...
php artisan make:model Flight --all
php artisan make:model Flight -a

# 피벗(pivot) 모델 생성...
php artisan make:model Member --pivot
php artisan make:model Member -p
```

<a name="inspecting-models"></a>
#### 모델 속성 및 연관관계 확인

모델 코드만 보고 가용한 모든 속성과 연관관계를 한눈에 파악하기 어려울 때가 있습니다. 이럴 땐 `model:show` Artisan 명령어를 활용해, 모델의 속성과 관계를 한눈에 확인할 수 있습니다.

```shell
php artisan model:show Flight
```

<a name="eloquent-model-conventions"></a>
## Eloquent 모델 관례

`make:model` 명령어로 생성된 모델은 `app/Models` 디렉터리에 위치하게 됩니다. 기본적인 모델 클래스를 살펴보며, Eloquent가 따르는 주요 관례를 알아보겠습니다.

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

위의 예시를 보면, `Flight` 모델이 어떤 데이터베이스 테이블과 연동되는지 별도로 지정하지 않은 것을 볼 수 있습니다. Eloquent는 관례에 따라 클래스명을 "스네이크 케이스(snake case, 소문자+언더스코어)"로 변환하고 복수형을 적용해서 테이블명을 자동으로 매칭합니다. 즉, `Flight` 모델은 `flights` 테이블을, `AirTrafficController` 모델은 `air_traffic_controllers` 테이블을 사용한다고 간주합니다.

만약 모델에 대응하는 테이블명이 이 관례를 따르지 않는다면, 모델에 `table` 속성을 직접 지정하여 원하는 테이블명을 명시할 수 있습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * 모델과 연관된 테이블명
     *
     * @var string
     */
    protected $table = 'my_flights';
}
```

<a name="primary-keys"></a>
### 기본 키

Eloquent는 기본적으로 각 모델이 연동되는 테이블에 `id`라는 기본 키(primary key) 컬럼이 있다고 가정합니다. 만약 기본 키로 사용하는 컬럼명이 다르다면, 모델의 `$primaryKey` 속성에 해당 컬럼명을 지정할 수 있습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * 모델에 연관된 테이블의 기본 키
     *
     * @var string
     */
    protected $primaryKey = 'flight_id';
}
```

또한, Eloquent는 기본 키 컬럼이 증가하는(자동 증가) 정수(integer) 값이라고 간주합니다. 즉, Eloquent는 기본 키를 자동으로 정수형으로 변환(cast)합니다. 만약 증가하지 않거나, 숫자가 아닌 기본 키를 사용하려면 모델에 `public $incrementing = false;`를 명시해 주어야 합니다.

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

만약 기본 키가 정수형이 아니라면, 모델의 `$keyType` 속성에 `'string'` 값을 지정해야 합니다.

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
#### "복합" 기본 키(Composite Primary Keys)

Eloquent의 각 모델은 최소한 하나의 고유하게 식별되는 "ID"를 기본 키로 가져야 합니다. 즉, Eloquent 모델은 "복합(composite) 기본 키"를 지원하지 않습니다. 단, 테이블에 복합(여러 컬럼을 조합한) 유니크 인덱스를 추가하는 것은 가능합니다. 하지만 이 경우에도 Eloquent는 하나의 기본 키만을 인식합니다.

<a name="uuid-and-ulid-keys"></a>
### UUID 및 ULID 키

Eloquent 모델의 기본 키로 증가하는 정수값 대신 UUID를 사용할 수도 있습니다. UUID는 전역적으로 고유한 36자 길이의 영숫자 식별자입니다.

모델에서 자동 증가 정수키 대신 UUID 키를 사용하려면, 해당 모델에 `Illuminate\Database\Eloquent\Concerns\HasUuids` 트레이트(trait)를 추가하면 됩니다. 물론, 모델의 기본 키 컬럼이 [UUID에 맞는 컬럼 타입](/docs/12.x/migrations#column-method-uuid)이어야만 제대로 동작합니다.

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

기본적으로 `HasUuids` 트레이트는 ["정렬 가능한(ordered)" UUID](/docs/12.x/strings#method-str-ordered-uuid)를 생성합니다. 이 ID들은 인덱스된 데이터베이스 컬럼에서 효율적으로 정렬이 가능하도록 설계되어 있습니다.

UUID 생성 방식을 커스터마이즈하고 싶다면, 모델에 `newUniqueId` 메서드를 정의하면 됩니다. 또한 어떤 컬럼에 UUID를 적용할지 지정하려면, `uniqueIds` 메서드를 모델에 추가합니다.

```php
use Ramsey\Uuid\Uuid;

/**
 * 모델의 새로운 UUID를 생성합니다.
 */
public function newUniqueId(): string
{
    return (string) Uuid::uuid4();
}

/**
 * 고유 식별자를 부여할 컬럼 목록을 반환합니다.
 *
 * @return array<int, string>
 */
public function uniqueIds(): array
{
    return ['id', 'discount_code'];
}
```

원한다면 UUID 대신 "ULID"를 사용할 수도 있습니다. ULID는 UUID와 유사하며, 길이는 26자입니다. 정렬 가능한 UUID와 마찬가지로, ULID도 데이터베이스 인덱싱을 위해 레코그래픽 정렬이 가능합니다. ULID를 사용하려면, 모델에 `Illuminate\Database\Eloquent\Concerns\HasUlids` 트레이트를 추가하고, [ULID에 맞는 기본 키 컬럼](/docs/12.x/migrations#column-method-ulid)을 만들어야 합니다.

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

Eloquent는 기본적으로 모델이 속한 테이블에 `created_at`과 `updated_at` 컬럼이 존재할 것이라 기대합니다. 모델이 생성되거나 갱신될 때 Eloquent가 이 컬럼들의 값을 자동으로 설정해줍니다. 만약 Eloquent가 이 컬럼을 자동으로 관리하지 않도록 하려면, 모델에 `$timestamps` 속성을 `false`로 지정하면 됩니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * 모델의 타임스탬프 자동 관리 여부
     *
     * @var bool
     */
    public $timestamps = false;
}
```

모델의 타임스탬프 포맷을 커스터마이즈하고 싶다면, `$dateFormat` 속성을 지정하세요. 이 설정에 따라 데이터베이스에 저장되는 날짜 형식과, 배열이나 JSON으로 변환 시의 포맷이 결정됩니다.

```php
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

타임스탬프를 저장하는 컬럼명을 변경하고 싶을 때는, 모델에 `CREATED_AT`, `UPDATED_AT` 상수를 정의해 원하는 컬럼명을 지정할 수 있습니다.

```php
<?php

class Flight extends Model
{
    const CREATED_AT = 'creation_date';
    const UPDATED_AT = 'updated_date';
}
```

`updated_at` 컬럼의 값이 변경되지 않도록 모델 연산을 수행하고 싶다면, `withoutTimestamps` 메서드에 클로저를 전달해 해당 메서드 안에서만 타임스탬프 자동 갱신이 중지되도록 할 수 있습니다.

```php
Model::withoutTimestamps(fn () => $post->increment('reads'));
```

<a name="database-connections"></a>
### 데이터베이스 연결

기본적으로 모든 Eloquent 모델은 애플리케이션에 설정된 기본 데이터베이스 연결을 사용합니다. 특정 모델이 다른 데이터베이스 연결을 사용하도록 하고 싶을 때는, 모델에 `$connection` 속성을 명시하면 됩니다.

```php
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
    protected $connection = 'mysql';
}
```

<a name="default-attribute-values"></a>
### 속성의 기본값

새롭게 인스턴스화(생성)된 모델의 속성은 기본적으로 아무 값도 갖지 않습니다. 특정 속성에 기본값을 지정하려면, 모델의 `$attributes` 속성에 지정할 수 있습니다. `$attributes` 배열에 넣는 값은 데이터베이스에서 읽혀온 원본 형태(저장 형태)로 입력해야 합니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * 속성의 기본값 설정
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
### Eloquent 엄격성 설정

Laravel은 Eloquent의 동작 방식과 "엄격성"을 여러 측면에서 설정할 수 있는 다양한 메서드를 제공합니다.

먼저 `preventLazyLoading` 메서드는 Lazy 로딩(지연 로딩)을 차단할지 여부를 설정하는 불린 값 인수를 받습니다. 예를 들어, 실제 운영환경에서는 지연 로딩이 실수로 포함되어도 서비스에 문제없이 동작하도록 하고, 개발 환경에서만 지연 로딩을 막고 싶을 수 있습니다. 보통 이 메서드는 애플리케이션의 `AppServiceProvider`의 `boot` 메서드에서 호출합니다.

```php
use Illuminate\Database\Eloquent\Model;

/**
 * 애플리케이션 서비스 부트스트랩
 */
public function boot(): void
{
    Model::preventLazyLoading(! $this->app->isProduction());
}
```

또한, `preventSilentlyDiscardingAttributes` 메서드를 사용하면, 모델의 `fillable` 배열에 등록되지 않은 속성에 값을 할당하려 할 때 Laravel이 예외를 발생시키도록 설정할 수 있습니다. 이는 예기치 않은 속성 할당 문제를 빠르게 발견하는 데 도움이 됩니다.

```php
Model::preventSilentlyDiscardingAttributes(! $this->app->isProduction());
```

<a name="retrieving-models"></a>
## 모델 조회

모델을 만들고 [해당하는 데이터베이스 테이블](/docs/12.x/migrations#generating-migrations)을 준비했다면, 이제 데이터베이스에서 데이터를 조회할 수 있습니다. 각 Eloquent 모델은 [강력한 쿼리 빌더](/docs/12.x/queries) 역할도 하기 때문에, 연결된 테이블을 손쉽게 쿼리할 수 있습니다. 모델의 `all` 메서드를 사용하면 테이블의 모든 레코드를 조회할 수 있습니다.

```php
use App\Models\Flight;

foreach (Flight::all() as $flight) {
    echo $flight->name;
}
```

<a name="building-queries"></a>
#### 쿼리 빌딩

Eloquent의 `all` 메서드는 테이블의 모든 데이터를 반환합니다. 하지만 Eloquent 모델은 [쿼리 빌더](/docs/12.x/queries)와 동일한 메서드를 사용할 수 있으므로, 쿼리에 조건을 추가한 후 `get` 메서드로 결과를 조회할 수 있습니다.

```php
$flights = Flight::where('active', 1)
    ->orderBy('name')
    ->take(10)
    ->get();
```

> [!NOTE]
> Eloquent 모델이 바로 쿼리 빌더 역할을 하므로, Laravel 쿼리 빌더에서 제공하는 모든 메서드를 사용할 수 있습니다. Eloquent 쿼리를 작성할 때 이 메서드들도 함께 참고하면 좋습니다. 자세한 내용은 [쿼리 빌더 문서](/docs/12.x/queries)를 확인하세요.

<a name="refreshing-models"></a>
#### 모델 새로고침

이미 데이터베이스에서 가져온 Eloquent 모델 인스턴스가 있다면, `fresh`와 `refresh` 메서드로 모델을 새로 고칠 수 있습니다. `fresh` 메서드는 데이터베이스에서 모델을 새로 가져오고, 기존 인스턴스에는 영향을 주지 않습니다.

```php
$flight = Flight::where('number', 'FR 900')->first();

$freshFlight = $flight->fresh();
```

`refresh` 메서드는 기존 모델 인스턴스를 데이터베이스의 최신 값으로 다시 채웁니다. 또한, 이미 로드된 모든 연관관계도 함께 새로고침됩니다.

```php
$flight = Flight::where('number', 'FR 900')->first();

$flight->number = 'FR 456';

$flight->refresh();

$flight->number; // "FR 900"
```

<a name="collections"></a>
### 컬렉션

`all`, `get` 등 Eloquent 메서드는 데이터베이스에서 여러 레코드를 조회할 때 일반 PHP 배열이 아닌, `Illuminate\Database\Eloquent\Collection` 객체를 반환합니다.

Eloquent의 `Collection` 클래스는 Laravel의 기본 `Illuminate\Support\Collection` 클래스를 상속하며, [컬렉션 관련 다양한 편의 메서드](/docs/12.x/collections#available-methods)를 제공합니다. 예를 들어, `reject` 메서드를 통해 콜백 함수의 반환값에 따라 컬렉션에서 특정 모델을 제외할 수 있습니다.

```php
$flights = Flight::where('destination', 'Paris')->get();

$flights = $flights->reject(function (Flight $flight) {
    return $flight->cancelled;
});
```

기본 컬렉션 클래스에서 제공하는 메서드 외에도, Eloquent 컬렉션 전용 [추가 메서드](/docs/12.x/eloquent-collections#available-methods)도 마련되어 있습니다.

Laravel의 모든 컬렉션은 PHP의 이터러블 인터페이스를 구현하므로, 일반 배열처럼 반복문으로 순회할 수도 있습니다.

```php
foreach ($flights as $flight) {
    echo $flight->name;
}
```

<a name="chunking-results"></a>
### 결과 청크 처리

`all`이나 `get` 메서드로 수만 개의 Eloquent 레코드를 한 번에 불러오면 애플리케이션 메모리가 부족해질 수 있습니다. 이런 경우에는 `chunk` 메서드를 활용해 대량의 레코드를 효율적으로 처리하는 것이 좋습니다.

`chunk` 메서드는 지정한 만큼의 Eloquent 모델 레코드 묶음(청크)을 가져와서, 해당 청크를 클로저에 전달해 처리합니다. 청크 단위로만 데이터를 메모리에 올리므로, 많은 데이터를 다룰 때 메모리 사용량을 크게 줄일 수 있습니다.

```php
use App\Models\Flight;
use Illuminate\Database\Eloquent\Collection;

Flight::chunk(200, function (Collection $flights) {
    foreach ($flights as $flight) {
        // ...
    }
});
```

`chunk` 메서드의 첫 번째 인수는 청크마다 처리할 레코드 수이며, 두 번째 인수로 전달되는 클로저는 각 청크가 처리될 때마다 호출됩니다. 매번 데이터베이스 쿼리가 실행되어, 각 청크가 클로저에 전달됩니다.

만약 `chunk` 메서드로 결과를 필터링하면서, 순회 중 같이 필터 조건이 되는 컬럼을 업데이트한다면 결과가 일치하지 않거나 예상치 못한 문제가 생길 수 있습니다. 이럴 때는 `chunkById` 메서드를 사용하는 것이 안전합니다. 내부적으로 `chunkById`는 이전 청크의 마지막 모델보다 `id`가 더 큰 행만 반복해서 조회합니다.

```php
Flight::where('departed', true)
    ->chunkById(200, function (Collection $flights) {
        $flights->each->update(['departed' => false]);
    }, column: 'id');
```

`chunkById`와 `lazyById` 메서드는 내부적으로 쿼리에 자체적으로 "where" 조건을 추가하므로, 직접 작성한 조건문은 [클로저로 묶어 그룹화](/docs/12.x/queries#logical-grouping)하는 것이 좋습니다.

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

`lazy` 메서드는 [chunk 메서드](#chunking-results)와 비슷하게 내부적으로 데이터를 청크 단위로 쿼리합니다. 하지만 `chunk`가 각 청크를 클로저로 바로 전달하는 것과 달리, `lazy`는 결과 전체를 [평탄화된 LazyCollection](/docs/12.x/collections#lazy-collections)으로 반환하여 마치 하나의 데이터 스트림처럼 다룰 수 있게 해줍니다.

```php
use App\Models\Flight;

foreach (Flight::lazy() as $flight) {
    // ...
}
```

`lazy`에서도 결과를 필터링하면서 반복 중 필터 컬럼을 갱신해야 한다면, `lazyById` 메서드를 사용해야 합니다. 이 메서드는 내부적으로 각 청크에서 마지막 모델보다 `id`가 더 큰 행만 이어서 조회합니다.

```php
Flight::where('departed', true)
    ->lazyById(200, column: 'id')
    ->each->update(['departed' => false]);
```

또한, `lazyByIdDesc` 메서드를 사용하면 `id` 값을 내림차순으로 정렬하여 결과를 필터링할 수 있습니다.

<a name="cursors"></a>
### 커서

`lazy` 메서드와 유사하게, `cursor` 메서드를 사용하면 수만 개의 Eloquent 레코드를 반복 처리할 때 메모리 사용량을 크게 줄일 수 있습니다.

`cursor` 메서드는 단 한 번의 데이터베이스 쿼리만 실행하며, 조회된 각 모델 인스턴스는 실제로 반복문에서 사용할 때까지 메모리에 로딩되지 않습니다. 따라서 반복문을 돌면서 한 번에 단 하나의 모델 인스턴스만 메모리에 유지하게 됩니다.

> [!WARNING]
> `cursor` 메서드는 한 번에 하나의 Eloquent 모델만 메모리에 올리므로, 연관관계(eager load)는 지원하지 않습니다. 연관관계까지 로딩이 필요하다면 [lazy 메서드](#chunking-using-lazy-collections)를 대신 사용하는 것이 좋습니다.

`cursor` 메서드는 내부적으로 PHP [제너레이터(generator)](https://www.php.net/manual/en/language.generators.overview.php)를 이용합니다.

```php
use App\Models\Flight;

foreach (Flight::where('destination', 'Zurich')->cursor() as $flight) {
    // ...
}
```

`cursor`가 반환하는 것은 `Illuminate\Support\LazyCollection` 인스턴스입니다. [Lazy 컬렉션](/docs/12.x/collections#lazy-collections)을 이용하면, 일반 컬렉션에서 제공하는 다양한 메서드도 하나의 모델만 메모리에서 유지하면서 효과적으로 사용할 수 있습니다.

```php
use App\Models\User;

$users = User::cursor()->filter(function (User $user) {
    return $user->id > 500;
});

foreach ($users as $user) {
    echo $user->id;
}
```

비록 `cursor`는 일반 쿼리보다 훨씬 적은 메모리만 사용하지만(단일 모델만 유지), 결국에는 메모리가 소진될 수 있습니다. 이는 [PHP의 PDO 드라이버가 내부적으로 모든 원시 쿼리 결과를 버퍼링하기 때문](https://www.php.net/manual/en/mysqlinfo.concepts.buffering.php)입니다. 정말 많은 Eloquent 레코드를 처리해야 한다면, [lazy 메서드](#chunking-using-lazy-collections)를 사용하는 것이 더 적합할 수 있습니다.

<a name="advanced-subqueries"></a>

### 고급 서브쿼리

<a name="subquery-selects"></a>
#### 서브쿼리 선택

Eloquent는 고급 서브쿼리 기능도 제공합니다. 이 기능을 사용하면 하나의 쿼리로 연관된 테이블에서 정보를 가져올 수 있습니다. 예를 들어, `destinations`라는 항공편 목적지 테이블과 이 목적지로 가는 `flights` 테이블이 있다고 가정해봅니다. `flights` 테이블에는 해당 항공편이 목적지에 도착한 시점을 나타내는 `arrived_at` 컬럼이 있습니다.

쿼리 빌더의 `select` 및 `addSelect` 메서드에서 제공하는 서브쿼리 기능을 사용하면, 모든 `destinations`와 가장 최근에 해당 목적지에 도착한 항공편의 이름을 한 번의 쿼리로 가져올 수 있습니다:

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
#### 서브쿼리를 이용한 정렬

또한, 쿼리 빌더의 `orderBy` 함수에서도 서브쿼리를 사용할 수 있습니다. 앞에서 예로 들었던 항공편 사례를 계속 활용하여, 각 목적지에 가장 최근에 도착한 항공편의 도착 시간을 기준으로 모든 목적지를 정렬할 수 있습니다. 역시 하나의 데이터베이스 쿼리만 실행하면 됩니다:

```php
return Destination::orderByDesc(
    Flight::select('arrived_at')
        ->whereColumn('destination_id', 'destinations.id')
        ->orderByDesc('arrived_at')
        ->limit(1)
)->get();
```

<a name="retrieving-single-models"></a>
## 단일 모델 및 집계 값 조회

주어진 쿼리에 일치하는 모든 레코드를 조회하는 것 외에, `find`, `first`, `firstWhere` 메서드를 사용하여 단일 레코드를 조회할 수도 있습니다. 이 메서드들은 모델 컬렉션 대신 모델 인스턴스 하나만 반환합니다:

```php
use App\Models\Flight;

// 기본 키로 모델 조회...
$flight = Flight::find(1);

// 쿼리 조건에 맞는 첫 번째 모델 조회...
$flight = Flight::where('active', 1)->first();

// 쿼리 조건에 맞는 첫 번째 모델을 좀 더 간편하게 조회...
$flight = Flight::firstWhere('active', 1);
```

경우에 따라, 결과가 없을 때 다른 작업을 하고 싶을 수 있습니다. `findOr`, `firstOr` 메서드는 일치하는 레코드가 있으면 모델 인스턴스를 반환하고, 없으면 전달한 클로저를 실행하여 그 반환값을 메서드의 결과로 사용합니다:

```php
$flight = Flight::findOr(1, function () {
    // ...
});

$flight = Flight::where('legs', '>', 3)->firstOr(function () {
    // ...
});
```

<a name="not-found-exceptions"></a>
#### 찾을 수 없음 예외 발생

때로는 모델을 찾을 수 없을 때 예외를 발생시키고 싶을 수 있습니다. 이는 특히 라우트나 컨트롤러에서 유용합니다. `findOrFail`, `firstOrFail` 메서드는 쿼리 결과의 첫 번째 레코드를 반환하며, 결과가 없을 경우 `Illuminate\Database\Eloquent\ModelNotFoundException` 예외를 던집니다:

```php
$flight = Flight::findOrFail(1);

$flight = Flight::where('legs', '>', 3)->firstOrFail();
```

`ModelNotFoundException`이 잡히지 않으면, 클라이언트에게 404 HTTP 응답이 자동으로 전송됩니다:

```php
use App\Models\Flight;

Route::get('/api/flights/{id}', function (string $id) {
    return Flight::findOrFail($id);
});
```

<a name="retrieving-or-creating-models"></a>
### 모델 조회 또는 생성

`firstOrCreate` 메서드는 주어진 컬럼/값 쌍을 이용하여 데이터베이스 레코드를 찾으려고 시도합니다. 모델을 찾을 수 없는 경우, 첫 번째 배열 인수와 두 번째(옵션) 배열 인수를 합쳐서 새 레코드를 추가합니다.

`firstOrNew` 메서드는 `firstOrCreate`와 마찬가지로 해당 속성에 맞는 레코드를 검색합니다. 하지만 일치하는 모델이 없을 경우, 새 모델 인스턴스만 반환합니다. 단, `firstOrNew`가 반환하는 모델 인스턴스는 아직 데이터베이스에 저장되지 않았으므로, 수동으로 `save` 메서드를 호출해야 저장됩니다:

```php
use App\Models\Flight;

// 이름으로 항공편 검색, 없으면 생성
$flight = Flight::firstOrCreate([
    'name' => 'London to Paris'
]);

// 이름으로 검색, 없으면 해당 속성값으로 생성
$flight = Flight::firstOrCreate(
    ['name' => 'London to Paris'],
    ['delayed' => 1, 'arrival_time' => '11:30']
);

// 이름으로 항공편 검색, 없으면 새 인스턴스만 반환
$flight = Flight::firstOrNew([
    'name' => 'London to Paris'
]);

// 이름으로 검색, 없으면 해당 속성값으로 새 인스턴스 반환
$flight = Flight::firstOrNew(
    ['name' => 'Tokyo to Sydney'],
    ['delayed' => 1, 'arrival_time' => '11:30']
);
```

<a name="retrieving-aggregates"></a>
### 집계 값 조회

Eloquent 모델을 사용할 때, 라라벨 [쿼리 빌더](/docs/12.x/queries)가 제공하는 `count`, `sum`, `max` 등 [집계 메서드](/docs/12.x/queries#aggregates)를 활용할 수 있습니다. 예상하듯, 이 메서드들은 Eloquent 모델 인스턴스가 아닌 스칼라 값을 반환합니다:

```php
$count = Flight::where('active', 1)->count();

$max = Flight::where('active', 1)->max('price');
```

<a name="inserting-and-updating-models"></a>
## 모델 삽입 및 수정

<a name="inserts"></a>
### 레코드 삽입

Eloquent를 사용할 때는 데이터베이스에서 모델을 조회하는 것뿐만 아니라, 새로운 레코드를 삽입해야 할 때도 있습니다. 다행히 Eloquent는 이 작업을 매우 간단하게 처리할 수 있게 도와줍니다. 새 레코드를 데이터베이스에 삽입하려면 새로운 모델 인스턴스를 생성한 뒤, 속성(attribute) 값을 할당하고 `save` 메서드를 호출하면 됩니다:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Flight;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class FlightController extends Controller
{
    /**
     * 새 항공편을 데이터베이스에 저장.
     */
    public function store(Request $request): RedirectResponse
    {
        // 요청 유효성 검사...

        $flight = new Flight;

        $flight->name = $request->name;

        $flight->save();

        return redirect('/flights');
    }
}
```

이 예제에서는, 들어온 HTTP 요청의 `name` 필드를 `App\Models\Flight` 모델 인스턴스의 `name` 속성에 할당합니다. 그리고 나서 `save` 메서드를 호출하면 데이터베이스에 레코드가 삽입됩니다. 이때 `created_at`과 `updated_at` 타임스탬프가 자동으로 설정되므로, 별도로 직접 설정할 필요가 없습니다.

또는, `create` 메서드를 사용하여 한 줄의 코드로 새로운 모델을 저장할 수 있습니다. `create` 메서드는 삽입된 모델 인스턴스를 반환합니다:

```php
use App\Models\Flight;

$flight = Flight::create([
    'name' => 'London to Paris',
]);
```

단, `create` 메서드를 사용하기 전에 모델 클래스에 `fillable` 또는 `guarded` 속성(property)을 반드시 지정해야 합니다. 모든 Eloquent 모델은 기본적으로 대량 할당(mass assignment) 취약점으로부터 보호되기 때문입니다. 대량 할당에 대해 더 알아보려면 [대량 할당 문서](#mass-assignment)를 참고해 주세요.

<a name="updates"></a>
### 레코드 수정

이미 데이터베이스에 존재하는 모델을 수정할 때도 역시 `save` 메서드를 사용할 수 있습니다. 모델을 먼저 조회한 뒤 변경하려는 속성을 할당하고, 모델의 `save` 메서드를 호출하면 됩니다. 이때 `updated_at` 타임스탬프 역시 자동으로 갱신되므로 별도로 값을 지정할 필요가 없습니다:

```php
use App\Models\Flight;

$flight = Flight::find(1);

$flight->name = 'Paris to London';

$flight->save();
```

가끔, 일치하는 모델을 업데이트하거나 없으면 새로 생성해야 하는 경우가 있습니다. `firstOrCreate` 메서드와 비슷하게, `updateOrCreate` 메서드는 모델의 저장도 함께 처리하므로 별도의 `save` 호출은 필요 없습니다.

아래 예제를 보면, 만약 `departure`가 `Oakland`이고 `destination`이 `San Diego`인 항공편이 이미 존재하면 해당 레코드의 `price`와 `discounted` 컬럼 값이 수정됩니다. 해당 조건에 맞는 레코드가 없으면 두 인수의 배열을 합친 속성값으로 새 레코드가 생성됩니다:

```php
$flight = Flight::updateOrCreate(
    ['departure' => 'Oakland', 'destination' => 'San Diego'],
    ['price' => 99, 'discounted' => 1]
);
```

<a name="mass-updates"></a>
#### 대량 수정

특정 쿼리에 일치하는 여러 모델을 대상으로 한 번에 수정 작업을 실행할 수도 있습니다. 아래 예제에서는 `active`가 1이고 `destination`이 `San Diego`인 모든 항공편이 지연(delayed) 상태로 표시됩니다:

```php
Flight::where('active', 1)
    ->where('destination', 'San Diego')
    ->update(['delayed' => 1]);
```

`update` 메서드는 수정할 컬럼과 값을 배열 형식으로 받습니다. 이 메서드는 영향을 받은(수정된) 레코드 수를 반환합니다.

> [!WARNING]
> Eloquent의 대량 업데이트를 사용할 때에는, 해당 모델에 대해 `saving`, `saved`, `updating`, `updated` 이벤트가 발생하지 않습니다. 이는 대량 업데이트 시 실제로 각 모델이 개별적으로 조회되지 않기 때문입니다.

<a name="examining-attribute-changes"></a>
#### 속성 변경 사항 확인

Eloquent는 `isDirty`, `isClean`, `wasChanged` 메서드를 통해 모델의 내부 상태를 점검하고, 모델이 처음 조회된 이후 속성(attribute)에 어떤 변화가 있었는지 확인할 수 있습니다.

`isDirty` 메서드는 모델의 속성 중 하나라도 조회 이후 변경된 게 있는지 확인합니다. 특정 속성명이나 속성명 배열을 전달하면, 해당 속성에 "변경"이 있었는지 확인할 수 있습니다. 반대로 `isClean` 메서드는 지정한 속성이 변경되지 않았는지 확인합니다. 역시 속성명을 전달할 수 있습니다:

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

`wasChanged` 메서드는 해당 모델이 최근 저장되었을 때(현재 요청 사이클 내에서) 어떤 속성이 실제로 변경되었는지 확인합니다. 속성명을 지정할 수도 있습니다:

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

`getOriginal` 메서드는 모델이 처음 조회되었을 때의 원본 속성값을 배열로 반환합니다. 특정 속성명을 전달하면 해당 속성의 원본값을 반환합니다:

```php
$user = User::find(1);

$user->name; // John
$user->email; // john@example.com

$user->name = 'Jack';
$user->name; // Jack

$user->getOriginal('name'); // John
$user->getOriginal(); // 원본 속성값 배열 반환...
```

`getChanges` 메서드는 최근 모델이 저장될 때 변경된 속성들만 배열로 반환합니다:

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

`create` 메서드를 사용하면 한 줄의 코드로 새 모델을 저장할 수 있습니다. `create` 메서드는 삽입된 모델 인스턴스를 반환합니다:

```php
use App\Models\Flight;

$flight = Flight::create([
    'name' => 'London to Paris',
]);
```

단, `create` 메서드를 사용하기 전에, 모델 클래스에서 `fillable` 또는 `guarded` 속성(property)을 반드시 지정해야 합니다. 모든 Eloquent 모델은 기본적으로 대량 할당 취약점(mass assignment vulnerabilities)을 방지하기 때문입니다.

대량 할당 취약점은 사용자가 예상하지 못한 HTTP 요청 필드를 전달하여, 예상치 못한 데이터베이스 컬럼이 변경되는 상황에서 발생합니다. 예를 들어, 악의적인 사용자가 HTTP 요청에 `is_admin` 파라미터를 추가해 제출하고, 이 값이 `create` 메서드로 그대로 넘어가면 관리 권한이 부여되는 문제가 생길 수 있습니다.

따라서 대량 할당을 안전하게 적용하려면, 어떤 속성이 대량 할당될 수 있는지 모델의 `$fillable` 속성에 명시해야 합니다. 예를 들어, `Flight` 모델의 `name` 속성만 대량 할당을 허용하려면 다음과 같이 작성합니다:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * 대량 할당이 허용된 속성들
     *
     * @var array<int, string>
     */
    protected $fillable = ['name'];
}
```

이제 어떤 속성이든 `$fillable` 에 명시한 경우에만 `create`로 레코드를 안전하게 작성할 수 있습니다. `create` 메서드는 새로 생성된 모델 인스턴스를 반환합니다:

```php
$flight = Flight::create(['name' => 'London to Paris']);
```

이미 생성된 모델 인스턴스가 있다면, `fill` 메서드를 사용해 여러 속성을 한 번에 할당할 수 있습니다:

```php
$flight->fill(['name' => 'Amsterdam to Frankfurt']);
```

<a name="mass-assignment-json-columns"></a>
#### 대량 할당과 JSON 컬럼

JSON 컬럼을 할당할 때, 각 JSON 컬럼 키를 모델의 `$fillable` 배열에 반드시 명시해야 합니다. 보안을 위해, 라라벨에서는 `guarded` 속성을 사용할 경우 중첩된 JSON 속성의 대량 업데이트를 지원하지 않습니다:

```php
/**
 * 대량 할당이 허용된 속성들
 *
 * @var array<int, string>
 */
protected $fillable = [
    'options->enabled',
];
```

<a name="allowing-mass-assignment"></a>
#### 모든 속성 대량 할당 허용

모델의 모든 속성에 대해 대량 할당을 허용하고 싶다면, 모델의 `$guarded` 속성을 빈 배열로 설정하면 됩니다. 단, 모델을 보호하지 않기로 선택한 경우에는 Eloquent의 `fill`, `create`, `update` 메서드에 전달하는 배열은 반드시 직접 신중하게 구성해야 합니다:

```php
/**
 * 대량 할당이 불가능한 속성
 *
 * @var array<string>|bool
 */
protected $guarded = [];
```

<a name="mass-assignment-exceptions"></a>
#### 대량 할당 예외 설정

기본적으로는 `$fillable` 배열에 포함되지 않은 속성은 대량 할당 시 조용히 무시됩니다. 운영 환경에서는 이는 예상된 동작이지만, 개발 중에는 모델 변경 사항이 적용되지 않는 원인 파악이 어려워질 수 있습니다.

원한다면, Eloquent가 대량 할당 가능한 속성이 아닌 필드를 할당하려 할 때 예외를 발생시키도록 설정할 수 있습니다. 보통 이 설정은 애플리케이션의 `AppServiceProvider` 클래스의 `boot` 메서드에서 적용합니다:

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
### Upsert(업서트)

Eloquent의 `upsert` 메서드는 한 번의 원자적 연산(atomic operation)으로 레코드를 업데이트하거나 새로 생성할 수 있습니다. 첫 번째 인수에는 삽입 또는 업데이트할 값의 배열을, 두 번째 인수에는 해당 테이블 내에서 레코드를 유일하게 구분하는 컬럼(들)을 넘깁니다. 마지막 세 번째 인수로는, 이미 존재하는 레코드를 업데이트할 때 어떤 컬럼을 변경할지 배열로 지정합니다. `upsert` 메서드는 타임스탬프가 활성화된 모델이라면 `created_at, updated_at` 값도 자동으로 처리합니다:

```php
Flight::upsert([
    ['departure' => 'Oakland', 'destination' => 'San Diego', 'price' => 99],
    ['departure' => 'Chicago', 'destination' => 'New York', 'price' => 150]
], uniqueBy: ['departure', 'destination'], update: ['price']);
```

> [!WARNING]
> SQL Server를 제외한 모든 데이터베이스는 `upsert` 메서드의 두 번째 인수에 포함된 컬럼에 "PRIMARY" 또는 "UNIQUE" 인덱스가 지정되어 있어야 합니다. 또한, MariaDB와 MySQL 드라이버는 `upsert`의 두 번째 인수를 무시하고, 항상 테이블의 "PRIMARY" 및 "UNIQUE" 인덱스를 사용하여 기존 레코드를 판별합니다.

<a name="deleting-models"></a>
## 모델 삭제

모델을 삭제하려면, 모델 인스턴스에서 `delete` 메서드를 호출하면 됩니다:

```php
use App\Models\Flight;

$flight = Flight::find(1);

$flight->delete();
```

<a name="deleting-an-existing-model-by-its-primary-key"></a>
#### 기본 키로 기존 모델 삭제

위 예제처럼 모델을 조회한 후 삭제할 수도 있지만, 이미 모델의 기본 키를 알고 있다면 굳이 조회하지 않고도 `destroy` 메서드를 호출해 바로 삭제할 수 있습니다. `destroy` 메서드는 하나의 기본 키, 여러 개의 기본 키, 기본 키 배열, 또는 [컬렉션](/docs/12.x/collections)을 모두 지원합니다:

```php
Flight::destroy(1);

Flight::destroy(1, 2, 3);

Flight::destroy([1, 2, 3]);

Flight::destroy(collect([1, 2, 3]));
```

[소프트 삭제](#soft-deleting)를 사용하는 경우, `forceDestroy` 메서드를 이용해 모델을 영구적으로 삭제할 수 있습니다:

```php
Flight::forceDestroy(1);
```

> [!WARNING]
> `destroy` 메서드는 각 모델을 하나씩 조회한 뒤 `delete` 메서드를 호출하므로, `deleting`, `deleted` 이벤트가 각 모델마다 제대로 발생하게 됩니다.

<a name="deleting-models-using-queries"></a>
#### 쿼리를 이용한 모델 삭제

물론, Eloquent 쿼리를 구성해서 조건에 맞는 모델을 대량으로 삭제할 수 있습니다. 아래 예제에서는 비활성 항공편(`active` 값이 0인 모든 레코드)을 한 번에 삭제합니다. 대량 수정처럼, 대량 삭제(mass delete) 역시 삭제된 모델에 대한 이벤트는 발생하지 않습니다:

```php
$deleted = Flight::where('active', 0)->delete();
```

테이블의 모든 모델을 삭제하려면 조건 없이 쿼리를 실행하면 됩니다:

```php
$deleted = Flight::query()->delete();
```

> [!WARNING]
> Eloquent로 대량 삭제를 수행할 때에는, 해당 모델에 대해 `deleting`, `deleted` 이벤트가 발생하지 않습니다. 대량 삭제 시에는 각 모델이 실제로 조회되지 않기 때문입니다.

<a name="soft-deleting"></a>
### 소프트 삭제

실제 데이터베이스에서 레코드를 삭제하는 것 외에도, Eloquent는 모델의 "소프트 삭제"도 지원합니다. 소프트 삭제란 데이터베이스에서 레코드를 삭제하지 않고, `deleted_at` 속성에 삭제된 날짜와 시간을 기록하는 방식입니다. 모델에서 소프트 삭제를 활성화하려면, `Illuminate\Database\Eloquent\SoftDeletes` 트레이트를 추가하면 됩니다:

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
> `SoftDeletes` 트레이트는 `deleted_at` 속성을 자동으로 `DateTime`/`Carbon` 인스턴스로 캐스팅해줍니다.

데이터베이스 테이블에도 `deleted_at` 컬럼을 추가해야 합니다. 라라벨 [스키마 빌더](/docs/12.x/migrations)에는 이 컬럼을 만드는 헬퍼 메서드가 있습니다:

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

이제 모델의 `delete` 메서드를 호출하면, 해당 모델의 `deleted_at` 컬럼에 현재 날짜와 시간이 기록됩니다. 실제 레코드는 그대로 테이블에 남아 있지만, 소프트 삭제가 적용된 모델은 모든 쿼리 결과에서 자동으로 제외됩니다.

특정 모델 인스턴스가 소프트 삭제되었는지 확인하려면, `trashed` 메서드를 사용할 수 있습니다:

```php
if ($flight->trashed()) {
    // ...
}
```

<a name="restoring-soft-deleted-models"></a>
#### 소프트 삭제된 모델 복원

가끔 소프트 삭제된 모델을 다시 "복원"하고 싶을 수 있습니다. 복원하려면 모델 인스턴스에서 `restore` 메서드를 호출하면 됩니다. 이 메서드는 모델의 `deleted_at` 값을 `null`로 설정합니다:

```php
$flight->restore();
```

복수의 모델을 한 번에 복원하고 싶다면, 쿼리에서도 `restore` 메서드를 사용할 수 있습니다. 마찬가지로 대량 복원은 이벤트가 발생하지 않습니다:

```php
Flight::withTrashed()
    ->where('airline_id', 1)
    ->restore();
```

`restore` 메서드는 [연관관계](/docs/12.x/eloquent-relationships) 쿼리에도 사용할 수 있습니다:

```php
$flight->history()->restore();
```

<a name="permanently-deleting-models"></a>
#### 영구적으로 모델 삭제

정말로 데이터베이스에서 레코드를 영구적으로 삭제해야 하는 경우에는 `forceDelete` 메서드를 사용하면 모델을 완전히 제거할 수 있습니다:

```php
$flight->forceDelete();
```

Eloquent 연관관계 쿼리에서도 `forceDelete` 메서드를 사용할 수 있습니다:

```php
$flight->history()->forceDelete();
```

<a name="querying-soft-deleted-models"></a>

### 소프트 삭제된 모델 쿼리하기

<a name="including-soft-deleted-models"></a>
#### 소프트 삭제된 모델 포함하기

앞서 설명한 것처럼, 소프트 삭제된 모델은 기본적으로 쿼리 결과에서 자동으로 제외됩니다. 하지만, 쿼리에서 소프트 삭제된 모델도 결과에 포함하고 싶다면 쿼리에서 `withTrashed` 메서드를 호출하면 됩니다.

```php
use App\Models\Flight;

$flights = Flight::withTrashed()
    ->where('account_id', 1)
    ->get();
```

`withTrashed` 메서드는 [연관관계](/docs/12.x/eloquent-relationships) 쿼리를 작성할 때도 사용할 수 있습니다.

```php
$flight->history()->withTrashed()->get();
```

<a name="retrieving-only-soft-deleted-models"></a>
#### 소프트 삭제된 모델만 가져오기

`onlyTrashed` 메서드를 사용하면 **오직** 소프트 삭제된 모델만 조회할 수 있습니다.

```php
$flights = Flight::onlyTrashed()
    ->where('airline_id', 1)
    ->get();
```

<a name="pruning-models"></a>
## 모델 정리(Pruning Models)

때로는 더 이상 필요하지 않은 모델을 주기적으로 삭제하고 싶을 때가 있습니다. 이를 위해, 주기적으로 정리하고 싶은 모델에 `Illuminate\Database\Eloquent\Prunable` 또는 `Illuminate\Database\Eloquent\MassPrunable` 트레이트를 추가할 수 있습니다. 트레이트를 추가한 뒤에는, 더 이상 필요 없는 모델을 판별하는 Eloquent 쿼리 빌더를 반환하는 `prunable` 메서드를 구현해야 합니다.

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
     * 정리할 모델 쿼리 반환
     */
    public function prunable(): Builder
    {
        return static::where('created_at', '<=', now()->subMonth());
    }
}
```

모델을 `Prunable`로 지정할 때는 `pruning` 메서드를 모델에 정의할 수도 있습니다. 이 메서드는 모델이 삭제되기 전에 호출되며, 해당 모델이 영구적으로 데이터베이스에서 삭제되기 이전에 파일 등 추가적으로 연결된 리소스를 삭제하는 용도로 사용할 수 있습니다.

```php
/**
 * 모델 정리 전 준비 작업
 */
protected function pruning(): void
{
    // ...
}
```

정리 대상 모델을 설정했으면, 애플리케이션의 `routes/console.php` 파일에서 `model:prune` 아티즌 명령어를 스케줄링해야 합니다. 이 명령어 실행 주기는 자유롭게 선택할 수 있습니다.

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('model:prune')->daily();
```

내부적으로, `model:prune` 명령은 애플리케이션의 `app/Models` 디렉터리 내에서 "Prunable" 모델을 자동으로 감지합니다. 만약 모델이 다른 위치에 있다면, `--model` 옵션을 사용해 모델 클래스명을 지정할 수 있습니다.

```php
Schedule::command('model:prune', [
    '--model' => [Address::class, Flight::class],
])->daily();
```

모든 감지된 모델을 정리할 때, 일부 모델만 제외하고 싶다면 `--except` 옵션을 사용할 수 있습니다.

```php
Schedule::command('model:prune', [
    '--except' => [Address::class, Flight::class],
])->daily();
```

`model:prune` 명령어가 삭제할 쿼리를 실제로 수행하지 않고, 삭제될 레코드 수만 확인하려면 `--pretend` 옵션을 사용하여 미리 테스트할 수 있습니다.

```shell
php artisan model:prune --pretend
```

> [!WARNING]
> 소프트 삭제된 모델도 정리(Prunable) 쿼리에 일치하면 영구 삭제(`forceDelete`)됩니다.

<a name="mass-pruning"></a>
#### 대량 정리(Mass Pruning)

모델에 `Illuminate\Database\Eloquent\MassPrunable` 트레이트를 지정하면, 모델이 데이터베이스에서 대량 삭제 쿼리로 한 번에 삭제됩니다. 이 경우에는 `pruning` 메서드가 호출되지 않으며, `deleting` 및 `deleted` 모델 이벤트도 발생하지 않습니다. 이는 모델 자체가 삭제 전에 실제로 조회되지 않기 때문에, 더욱 효율적으로 정리를 진행할 수 있습니다.

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
     * 정리할 모델 쿼리 반환
     */
    public function prunable(): Builder
    {
        return static::where('created_at', '<=', now()->subMonth());
    }
}
```

<a name="replicating-models"></a>
## 모델 복제(Replicating Models)

`replicate` 메서드를 사용하면 이미 존재하는 모델 인스턴스를 저장되지 않은 상태로 복제할 수 있습니다. 이 기능은 여러 속성(attribute)이 동일한 모델 인스턴스를 생성하려 할 때 특히 유용합니다.

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

복제할 때 일부 속성을 제외하려면 `replicate` 메서드에 속성명 배열을 전달하면 됩니다.

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
### 글로벌 스코프(Global Scopes)

글로벌 스코프를 사용하면 특정 모델에 대한 모든 쿼리에 제약 조건을 추가할 수 있습니다. 라라벨의 자체 [소프트 삭제](#soft-deleting) 기능도 글로벌 스코프를 활용하여 "삭제되지 않은" 모델만 데이터베이스에서 조회하도록 동작합니다. 직접 글로벌 스코프를 작성하면, 해당 모델에 대한 모든 쿼리에 특정 제약 조건이 자동으로 적용되어 편리합니다.

<a name="generating-scopes"></a>
#### 스코프 클래스 생성하기

새로운 글로벌 스코프를 생성하려면, `make:scope` 아티즌 명령어를 실행하세요. 생성된 스코프는 애플리케이션의 `app/Models/Scopes` 디렉터리에 위치합니다.

```shell
php artisan make:scope AncientScope
```

<a name="writing-global-scopes"></a>
#### 글로벌 스코프 작성하기

글로벌 스코프를 작성하는 방법은 매우 간단합니다. 먼저, `make:scope` 명령으로 생성한 클래스에서 `Illuminate\Database\Eloquent\Scope` 인터페이스를 구현합니다. `Scope` 인터페이스는 반드시 하나의 메서드, 즉 `apply` 메서드를 구현해야 하며, 이 메서드에서 필요에 따라 쿼리에 `where` 또는 기타 절을 추가할 수 있습니다.

```php
<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class AncientScope implements Scope
{
    /**
     * Eloquent 쿼리 빌더에 스코프 적용
     */
    public function apply(Builder $builder, Model $model): void
    {
        $builder->where('created_at', '<', now()->subYears(2000));
    }
}
```

> [!NOTE]
> 글로벌 스코프에서 쿼리의 select 절에 컬럼을 추가해야 한다면, `select` 대신 반드시 `addSelect` 메서드를 사용해야 합니다. 이렇게 하면 기존 select 절이 의도치 않게 대체되는 것을 방지할 수 있습니다.

<a name="applying-global-scopes"></a>
#### 글로벌 스코프 적용하기

모델에 글로벌 스코프를 적용하려면, 해당 모델 클래스에 `ScopedBy` 속성을 지정하면 됩니다.

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

또는, 모델의 `booted` 메서드를 오버라이드하여 수동으로 글로벌 스코프를 등록할 수도 있습니다. 이때는 모델의 `addGlobalScope` 메서드에 스코프 인스턴스를 인자로 전달합니다.

```php
<?php

namespace App\Models;

use App\Models\Scopes\AncientScope;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 모델의 "booted" 메서드
     */
    protected static function booted(): void
    {
        static::addGlobalScope(new AncientScope);
    }
}
```

위 예시처럼 `App\Models\User` 모델에 스코프를 추가하면, `User::all()` 메서드 호출 시 다음과 같은 SQL 쿼리가 실행됩니다.

```sql
select * from `users` where `created_at` < 0021-02-18 00:00:00
```

<a name="anonymous-global-scopes"></a>
#### 익명(Anonymous) 글로벌 스코프

Eloquent에서는 별도의 클래스를 만들 필요 없이, 클로저(익명 함수)를 이용해 간단하게 글로벌 스코프를 정의할 수도 있습니다. 클로저를 글로벌 스코프로 정의할 경우, `addGlobalScope` 메서드의 첫 번째 인자로 스코프 이름을 직접 지정해야 합니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 모델의 "booted" 메서드
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
#### 글로벌 스코프 제거하기

특정 쿼리에서 글로벌 스코프를 제거하고 싶은 경우, `withoutGlobalScope` 메서드를 사용하면 됩니다. 이 메서드에는 제거하고 싶은 글로벌 스코프의 클래스 이름을 인자로 넘깁니다.

```php
User::withoutGlobalScope(AncientScope::class)->get();
```

클로저로 정의된 글로벌 스코프의 경우, 스코프를 추가할 때 지정한 이름을 문자열로 넘겨서 제거할 수 있습니다.

```php
User::withoutGlobalScope('ancient')->get();
```

여러 개 또는 모든 글로벌 스코프를 제거하고 싶다면, `withoutGlobalScopes` 메서드를 활용하세요.

```php
// 모든 글로벌 스코프 제거
User::withoutGlobalScopes()->get();

// 일부 글로벌 스코프만 제거
User::withoutGlobalScopes([
    FirstScope::class, SecondScope::class
])->get();
```

<a name="local-scopes"></a>
### 로컬 스코프(Local Scopes)

로컬 스코프를 사용하면, 애플리케이션 곳곳에서 반복적으로 쓰이는 쿼리 제약 조건 집합을 정의하고 재활용할 수 있습니다. 예를 들어, "인기 있는" 사용자만 자주 조회해야 한다면, Eloquent 메서드에 `Scope` 속성을 추가해서 스코프를 정의할 수 있습니다.

스코프는 항상 동일한 쿼리 빌더 인스턴스 또는 `void`를 반환해야 합니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 인기 사용자인 유저만 쿼리 (popular)
     */
    #[Scope]
    protected function popular(Builder $query): void
    {
        $query->where('votes', '>', 100);
    }

    /**
     * 활성화된 사용자만 쿼리 (active)
     */
    #[Scope]
    protected function active(Builder $query): void
    {
        $query->where('active', 1);
    }
}
```

<a name="utilizing-a-local-scope"></a>
#### 로컬 스코프 사용하기

스코프를 정의한 뒤에는, 모델을 쿼리할 때 스코프 메서드를 호출할 수 있습니다. 여러 스코프를 체이닝해서 호출하는 것도 가능합니다.

```php
use App\Models\User;

$users = User::popular()->active()->orderBy('created_at')->get();
```

여러 Eloquent 모델 스코프를 `or` 쿼리 연산자로 조합하려면, [논리 그룹화](/docs/12.x/queries#logical-grouping)를 위해 클로저를 사용할 수 있습니다.

```php
$users = User::popular()->orWhere(function (Builder $query) {
    $query->active();
})->get();
```

그러나 이 방법은 번거로울 수 있으므로, 라라벨에서는 클로저를 사용하지 않고도 스코프를 유연하게 체인으로 연결할 수 있는 "고차 orWhere" 메서드를 제공합니다.

```php
$users = User::popular()->orWhere->active()->get();
```

<a name="dynamic-scopes"></a>
#### 동적 스코프(Dynamic Scopes)

파라미터를 받을 수 있는 스코프를 정의하고 싶을 때도 있습니다. 이 경우, 스코프 메서드의 시그니처에 `$query` 파라미터 다음에 추가 파라미터를 정의하면 됩니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 전달된 타입의 사용자만 쿼리
     */
    #[Scope]
    protected function ofType(Builder $query, string $type): void
    {
        $query->where('type', $type);
    }
}
```

이제 스코프 메서드의 시그니처에 추가 인자를 정의했다면, 쿼리 호출 시 인자를 넘겨 사용할 수 있습니다.

```php
$users = User::ofType('admin')->get();
```

<a name="pending-attributes"></a>
### Pending Attributes

스코프를 사용해, 스코프에 사용된 제약 조건과 동일한 속성이 적용된 새로운 모델을 생성하고 싶을 때 `withAttributes` 메서드를 사용할 수 있습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    /**
     * 임시 저장글(초안, draft)만 쿼리
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

`withAttributes` 메서드는 지정된 속성으로 `where` 조건을 쿼리에 추가하며, 이 속성들은 해당 스코프로 생성되는 모델에도 자동으로 적용됩니다.

```php
$draft = Post::draft()->create(['title' => 'In Progress']);

$draft->hidden; // true
```

만약 `withAttributes` 메서드로 쿼리에 `where` 조건을 추가하지 않고 속성만 모델에 적용하고 싶다면, `asConditions` 인자를 `false`로 지정하면 됩니다.

```php
$query->withAttributes([
    'hidden' => true,
], asConditions: false);
```

<a name="comparing-models"></a>
## 모델 비교하기

두 모델 인스턴스가 "동일한지" 확인해야 할 때가 있습니다. 이때 `is` 및 `isNot` 메서드를 사용하면, 두 모델이 같은 기본 키, 테이블, 데이터베이스 연결을 사용하는지 빠르게 비교할 수 있습니다.

```php
if ($post->is($anotherPost)) {
    // ...
}

if ($post->isNot($anotherPost)) {
    // ...
}
```

`is`와 `isNot` 메서드는 `belongsTo`, `hasOne`, `morphTo`, `morphOne` 같은 [연관관계](/docs/12.x/eloquent-relationships)에서도 사용할 수 있습니다. 이 메서드는 쿼리로 실제로 관련 모델을 조회하지 않고 비교할 수 있어 효율적입니다.

```php
if ($post->author()->is($user)) {
    // ...
}
```

<a name="events"></a>
## 이벤트(Events)

> [!NOTE]
> Eloquent 이벤트를 프론트엔드 클라이언트에 직접 브로드캐스트(broadcast)하고 싶으신가요? 라라벨의 [모델 이벤트 브로드캐스팅](/docs/12.x/broadcasting#model-broadcasting) 문서를 참고하세요.

Eloquent 모델은 다양한 이벤트를 발생시켜, 모델 라이프사이클의 다음과 같은 시점에서 후킹(hooking)이 가능합니다: `retrieved`, `creating`, `created`, `updating`, `updated`, `saving`, `saved`, `deleting`, `deleted`, `trashed`, `forceDeleting`, `forceDeleted`, `restoring`, `restored`, `replicating`.

- `retrieved` 이벤트는 기존 모델이 데이터베이스에서 조회될 때 발생합니다.
- 새 모델이 처음 저장되면 `creating` 및 `created` 이벤트가 발생합니다.
- 기존 모델이 수정되어 `save`를 호출할 때는 `updating` / `updated` 이벤트가 발생합니다.
- 모델이 생성되거나 수정될 때(속성의 변경 여부와 무관하게)는 `saving` / `saved` 이벤트가 발생합니다.
- 이벤트 이름이 `-ing`로 끝나면 변경이 영구 저장되기 **이전에**, `-ed`로 끝나면 저장 **이후에** 발생합니다.

모델 이벤트를 수신하려면, Eloquent 모델에 `$dispatchesEvents` 프로퍼티를 정의합니다. 이 프로퍼티는 Eloquent 모델 라이프사이클의 다양한 지점을 여러분만의 [이벤트 클래스](/docs/12.x/events)와 매핑합니다. 각 모델 이벤트 클래스는 생성자에서 해당 모델 인스턴스를 받아야 합니다.

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
     * 모델의 이벤트 맵
     *
     * @var array<string, string>
     */
    protected $dispatchesEvents = [
        'saved' => UserSaved::class,
        'deleted' => UserDeleted::class,
    ];
}
```

이벤트를 정의하고 매핑했다면, [이벤트 리스너](/docs/12.x/events#defining-listeners)를 구현해 실제 이벤트를 처리할 수 있습니다.

> [!WARNING]
> Eloquent에서 대량 업데이트 또는 삭제 쿼리를 실행하면 해당 모델의 `saved`, `updated`, `deleting`, `deleted` 이벤트가 발생하지 않습니다. 이는 대량 업데이트/삭제는 모델을 실제로 조회하지 않고 바로 동작하기 때문입니다.

<a name="events-using-closures"></a>
### 클로저를 이용한 이벤트 등록

별도의 이벤트 클래스를 만들지 않고, 다양한 모델 이벤트가 발생할 때 실행될 클로저(익명 함수)를 등록할 수도 있습니다. 일반적으로 이러한 클로저는 모델의 `booted` 메서드에서 등록하는 것이 좋습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 모델의 "booted" 메서드
     */
    protected static function booted(): void
    {
        static::created(function (User $user) {
            // ...
        });
    }
}
```

필요하다면, [큐잉 가능한 익명 이벤트 리스너](/docs/12.x/events#queuable-anonymous-event-listeners)를 사용해 모델 이벤트 리스너가 [큐](/docs/12.x/queues)를 통해 백그라운드에서 실행되도록 할 수 있습니다.

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

특정 모델에서 여러 이벤트를 감지하고 싶을 때는, 각 이벤트 리스너를 하나의 클래스로 묶어 관리할 수 있는 옵저버(observer)를 사용할 수 있습니다. 옵저버 클래스는 리스닝하고자 하는 Eloquent 이벤트명과 동일한 이름의 메서드를 가집니다. 각 메서드는 영향을 받는 모델 인스턴스를 유일한 인수로 전달받습니다. 새로운 옵저버 클래스를 만들기 위해서는 `make:observer` Artisan 명령어를 사용하는 것이 가장 간단합니다.

```shell
php artisan make:observer UserObserver --model=User
```

이 명령어를 실행하면 새로운 옵저버 클래스가 `app/Observers` 디렉터리에 생성됩니다. 만약 해당 디렉터리가 없다면 Artisan이 자동으로 만들어줍니다. 생성된 기본 옵저버 클래스의 형태는 아래와 같습니다.

```php
<?php

namespace App\Observers;

use App\Models\User;

class UserObserver
{
    /**
     * User "created" 이벤트 처리용 메서드
     */
    public function created(User $user): void
    {
        // ...
    }

    /**
     * User "updated" 이벤트 처리용 메서드
     */
    public function updated(User $user): void
    {
        // ...
    }

    /**
     * User "deleted" 이벤트 처리용 메서드
     */
    public function deleted(User $user): void
    {
        // ...
    }

    /**
     * User "restored" 이벤트 처리용 메서드
     */
    public function restored(User $user): void
    {
        // ...
    }

    /**
     * User "forceDeleted" 이벤트 처리용 메서드
     */
    public function forceDeleted(User $user): void
    {
        // ...
    }
}
```

옵저버를 등록하려면 해당 모델에 `ObservedBy` 속성(attribute)을 추가할 수 있습니다.

```php
use App\Observers\UserObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;

#[ObservedBy([UserObserver::class])]
class User extends Authenticatable
{
    //
}
```

또는, 옵저버를 직접 수동으로 등록할 수도 있습니다. 관찰하고자 하는 모델의 `observe` 메서드를 호출하면 됩니다. 일반적으로 애플리케이션의 `AppServiceProvider` 클래스의 `boot` 메서드에서 옵저버를 등록합니다.

```php
use App\Models\User;
use App\Observers\UserObserver;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    User::observe(UserObserver::class);
}
```

> [!NOTE]
> 옵저버가 감지할 수 있는 추가 이벤트로는 `saving`, `retrieved` 등이 있습니다. 이러한 이벤트에 대한 자세한 설명은 [이벤트 문서](#events)에서 확인할 수 있습니다.

<a name="observers-and-database-transactions"></a>
#### 옵저버와 데이터베이스 트랜잭션

모델이 데이터베이스 트랜잭션 내에서 생성되고 있는 경우, 옵저버가 해당 트랜잭션이 커밋된 후에만 이벤트 핸들러를 실행하도록 설정하고 싶을 수 있습니다. 이를 위해 옵저버 클래스에서 `ShouldHandleEventsAfterCommit` 인터페이스를 구현하면 됩니다. 만약 데이터베이스 트랜잭션이 진행 중이 아니라면, 이벤트 핸들러는 즉시 실행됩니다.

```php
<?php

namespace App\Observers;

use App\Models\User;
use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;

class UserObserver implements ShouldHandleEventsAfterCommit
{
    /**
     * User "created" 이벤트 처리용 메서드
     */
    public function created(User $user): void
    {
        // ...
    }
}
```

<a name="muting-events"></a>
### 이벤트 무시(뮤트)하기

일시적으로 모델에서 발생하는 모든 이벤트를 "뮤트"해야 하는 경우가 있을 수 있습니다. 이럴 때는 `withoutEvents` 메서드를 사용할 수 있습니다. `withoutEvents`는 클로저를 인수로 받아, 클로저 내부에서 실행되는 모든 코드에서 발생하는 모델 이벤트를 발생시키지 않습니다. 또한, 클로저에서 반환된 값은 그대로 `withoutEvents`의 반환값이 됩니다.

```php
use App\Models\User;

$user = User::withoutEvents(function () {
    User::findOrFail(1)->delete();

    return User::find(2);
});
```

<a name="saving-a-single-model-without-events"></a>
#### 단일 모델의 저장을 이벤트 없이 실행하기

특정 모델을 저장할 때 이벤트를 발생시키지 않고 처리하고 싶을 때가 있습니다. 이럴 때는 `saveQuietly` 메서드를 사용할 수 있습니다.

```php
$user = User::findOrFail(1);

$user->name = 'Victoria Faith';

$user->saveQuietly();
```

마찬가지로, 모델의 "업데이트", "삭제", "소프트 삭제", "복원", "복제" 작업도 이벤트를 발생시키지 않고 실행할 수 있습니다.

```php
$user->deleteQuietly();
$user->forceDeleteQuietly();
$user->restoreQuietly();
```