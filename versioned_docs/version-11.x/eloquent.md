# Eloquent: 시작하기 (Eloquent: Getting Started)

- [소개](#introduction)
- [모델 클래스 생성](#generating-model-classes)
- [Eloquent 모델 규칙](#eloquent-model-conventions)
    - [테이블명](#table-names)
    - [기본 키](#primary-keys)
    - [UUID 및 ULID 키](#uuid-and-ulid-keys)
    - [타임스탬프](#timestamps)
    - [데이터베이스 연결](#database-connections)
    - [기본 속성값](#default-attribute-values)
    - [Eloquent 엄격성 설정](#configuring-eloquent-strictness)
- [모델 조회하기](#retrieving-models)
    - [컬렉션](#collections)
    - [결과 청크 처리](#chunking-results)
    - [Lazy 컬렉션으로 청크 처리](#chunking-using-lazy-collections)
    - [커서 사용](#cursors)
    - [고급 서브쿼리](#advanced-subqueries)
- [단일 모델/집계 조회하기](#retrieving-single-models)
    - [모델 조회 또는 생성](#retrieving-or-creating-models)
    - [집계 조회](#retrieving-aggregates)
- [모델 삽입 및 수정](#inserting-and-updating-models)
    - [삽입](#inserts)
    - [수정](#updates)
    - [대량 할당](#mass-assignment)
    - [업서트](#upserts)
- [모델 삭제하기](#deleting-models)
    - [소프트 삭제](#soft-deleting)
    - [소프트 삭제된 모델 조회](#querying-soft-deleted-models)
- [모델 정리(Pruning)](#pruning-models)
- [모델 복제(Replicating)](#replicating-models)
- [쿼리 스코프](#query-scopes)
    - [전역 스코프](#global-scopes)
    - [로컬 스코프](#local-scopes)
    - [보류 중인 속성](#pending-attributes)
- [모델 비교](#comparing-models)
- [이벤트](#events)
    - [클로저 사용하기](#events-using-closures)
    - [옵서버](#observers)
    - [이벤트 음소거](#muting-events)

<a name="introduction"></a>
## 소개

라라벨은 Eloquent라는 ORM(Object-Relational Mapper, 객체 관계 매퍼)을 포함하고 있습니다. Eloquent를 사용하면 데이터베이스와 상호작용하는 작업이 훨씬 쉽고 즐거워집니다. Eloquent를 사용하면 데이터베이스의 각 테이블마다 그 테이블과 연결된 별도의 "모델"이 존재하며, 이 모델을 통해 데이터를 조회, 입력, 수정, 삭제할 수 있습니다.

> [!NOTE]  
> 시작하기 전에, 반드시 애플리케이션의 `config/database.php` 설정 파일에서 데이터베이스 연결 정보를 먼저 구성해야 합니다. 데이터베이스 설정에 대한 자세한 내용은 [데이터베이스 설정 문서](/docs/11.x/database#configuration)를 참고하세요.

#### Laravel 부트캠프

라라벨이 처음이라면 [Laravel Bootcamp](https://bootcamp.laravel.com)를 시작해보시길 추천합니다. Laravel Bootcamp는 Eloquent를 활용해 첫 번째 라라벨 애플리케이션을 실습하며 단계별로 안내합니다. 라라벨과 Eloquent의 기능들을 기본부터 둘러볼 수 있는 좋은 입문 코스입니다.

<a name="generating-model-classes"></a>
## 모델 클래스 생성

먼저, Eloquent 모델을 새로 만들어보겠습니다. 모델 클래스들은 일반적으로 `app\Models` 디렉토리에 위치하며, `Illuminate\Database\Eloquent\Model` 클래스를 상속합니다. 새 모델은 `make:model` [Artisan 명령어](/docs/11.x/artisan)로 생성할 수 있습니다.

```shell
php artisan make:model Flight
```

모델을 생성할 때 [데이터베이스 마이그레이션](/docs/11.x/migrations) 파일도 함께 생성하려면, `--migration` 또는 `-m` 옵션을 추가하면 됩니다.

```shell
php artisan make:model Flight --migration
```

모델을 생성할 때 팩토리, 시더, 정책(Policy), 컨트롤러, 폼 리퀘스트와 같은 다양한 유형의 클래스를 동시에 생성할 수도 있습니다. 여러 옵션을 조합하여 한 번에 여러 클래스를 만들 수도 있습니다.

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

# 모델, FlightController 리소스 클래스, 폼 리퀘스트 클래스 한 번에 생성...
php artisan make:model Flight --controller --resource --requests
php artisan make:model Flight -crR

# 모델과 FlightPolicy 클래스 생성...
php artisan make:model Flight --policy

# 모델, 마이그레이션, 팩토리, 시더, 컨트롤러 생성...
php artisan make:model Flight -mfsc

# 단축 명령어로 모델, 마이그레이션, 팩토리, 시더, 정책, 컨트롤러, 폼 리퀘스트까지 전부 생성...
php artisan make:model Flight --all
php artisan make:model Flight -a

# 피벗(pivot) 모델 생성...
php artisan make:model Member --pivot
php artisan make:model Member -p
```

<a name="inspecting-models"></a>
#### 모델 정보 확인하기

코드를 쭉 훑어보는 것만으로는 모델이 어떤 속성(attribute)과 연관관계(relation)를 갖고 있는지 한눈에 파악하기 어려운 경우도 있습니다. 이런 경우에는 `model:show` Artisan 명령어를 사용해보세요. 이 명령어는 모델이 가진 모든 속성 및 연관관계를 한눈에 살펴볼 수 있도록 편리하게 요약 정보를 제공합니다.

```shell
php artisan model:show Flight
```

<a name="eloquent-model-conventions"></a>
## Eloquent 모델 규칙

`make:model` 명령으로 생성된 모델 클래스는 `app/Models` 디렉토리에 저장됩니다. 기본적인 모델 클래스를 예시로 살펴보며, Eloquent의 주요 관례(규칙)들을 알아보겠습니다.

```
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

위 예제를 보면, `Flight` 모델이 어떤 데이터베이스 테이블과 연결되는지 따로 지정하지 않았다는 점을 알 수 있습니다. Eloquent는 기본적으로 클래스 이름을 "스네이크 케이스(snake case·소문자 + 언더스코어)"의 복수형으로 변환하여 테이블명으로 사용합니다. 즉, 이 경우 `Flight` 모델은 `flights` 테이블과 연결되고, `AirTrafficController` 모델은 `air_traffic_controllers` 테이블에 데이터를 저장한다고 간주합니다.

만약 모델과 연결된 데이터베이스 테이블명이 이 규칙을 따르지 않는 경우, 모델 클래스에 `table` 속성을 정의해서 직접 지정할 수 있습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * 모델이 연결된 테이블명
     *
     * @var string
     */
    protected $table = 'my_flights';
}
```

<a name="primary-keys"></a>
### 기본 키

Eloquent는 각 모델의 데이터베이스 테이블에 `id`라는 기본 키(primary key) 컬럼이 있다고 간주합니다. 만약 다른 컬럼을 기본 키로 사용해야 한다면, 모델에 보호된 `$primaryKey` 속성을 정의해서 지정할 수 있습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * 이 테이블의 기본 키 컬럼명
     *
     * @var string
     */
    protected $primaryKey = 'flight_id';
}
```

또한, Eloquent는 기본 키가 자동 증가하는 정수(integer) 값이라고 가정합니다. 즉, Eloquent는 기본 키를 자동으로 정수 타입으로 변환합니다. 만약 자동 증가되지 않거나 숫자가 아닌 값을 기본 키로 사용한다면, 모델 클래스에 공개 `$incrementing` 속성을 `false`로 지정해야 합니다.

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

모델의 기본 키가 정수가 아닌 경우, 보호된 `$keyType` 속성을 `string` 값으로 지정해야 합니다.

```
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

Eloquent 모델은 고유 식별자로 사용할 수 있는 하나 이상의 "ID" 컬럼이 반드시 필요합니다. Eloquent 모델은 "복합" 기본 키(여러 컬럼 조합으로 이루어진 기본 키)를 지원하지 않습니다. 하지만, 데이터베이스 테이블에 복합 유니크 인덱스를 직접 추가하는 것은 가능합니다.

<a name="uuid-and-ulid-keys"></a>
### UUID 및 ULID 키

Eloquent 모델의 기본 키로 자동 증가 정수값 대신 UUID를 사용할 수도 있습니다. UUID는 36자 길이의 전역적으로 고유한 영문+숫자 식별자입니다.

만약 모델의 기본 키로 자동 증가 정수값 대신 UUID를 사용할 계획이라면, 모델에서 `Illuminate\Database\Eloquent\Concerns\HasUuids` 트레이트(trait)를 사용하세요. 물론, 모델의 기본 키 컬럼이 [UUID에 해당하는 컬럼](/docs/11.x/migrations#column-method-uuid)이어야 합니다.

```
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

기본적으로 `HasUuids` 트레이트는 ["순서가 보장된(ordered) UUID"](/docs/11.x/strings#method-str-ordered-uuid)를 모델에 생성해줍니다. 이런 UUID는 인덱스된 데이터베이스에서 정렬이 가능해 저장 효율성이 더 좋습니다.

원한다면, 모델에 `newUniqueId` 메서드를 정의하여 UUID 생성 방식을 직접 오버라이드(재정의)할 수 있습니다. 또한 모델에 `uniqueIds` 메서드를 정의하면 어떤 컬럼에 UUID를 적용할지 지정할 수도 있습니다.

```
use Ramsey\Uuid\Uuid;

/**
 * 모델에 사용할 새로운 UUID 생성
 */
public function newUniqueId(): string
{
    return (string) Uuid::uuid4();
}

/**
 * 고유 식별자를 받아야 하는 컬럼 목록 반환
 *
 * @return array<int, string>
 */
public function uniqueIds(): array
{
    return ['id', 'discount_code'];
}
```

원한다면 UUID 대신 "ULID"를 사용할 수도 있습니다. ULID도 UUID와 유사하지만, 길이가 26자밖에 되지 않습니다. 순서가 보장되는(lexicographically sortable) 특성이 있어서 인덱싱에 효율적입니다. ULID를 사용하려면 모델에서 `Illuminate\Database\Eloquent\Concerns\HasUlids` 트레이트를 적용해야 하고, 모델의 기본 키 컬럼도 [ULID 컬럼](/docs/11.x/migrations#column-method-ulid)이어야 합니다.

```
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

기본적으로 Eloquent는 각 모델의 데이터베이스 테이블에 `created_at`, `updated_at` 컬럼이 존재한다고 가정합니다. 모델이 생성되거나 수정될 때마다 Eloquent가 알아서 이 컬럼들의 값을 자동으로 관리합니다. 만약 Eloquent가 타임스탬프 컬럼을 자동으로 관리하지 않게 하려면, 모델에서 `$timestamps` 속성을 `false`로 지정하세요.

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

모델의 타임스탬프 형식을 커스터마이징해야 한다면, `$dateFormat` 속성에 원하는 값을 지정하면 됩니다. 이 속성은 데이터베이스에 날짜 속성이 저장되는 포맷과, 모델이 배열이나 JSON으로 직렬화될 때 날짜가 어떤 포맷으로 표현될지 모두 결정합니다.

```
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

타임스탬프 컬럼명을 커스터마이즈해야 할 때는 모델에 `CREATED_AT` 및 `UPDATED_AT` 상수를 정의할 수 있습니다.

```
<?php

class Flight extends Model
{
    const CREATED_AT = 'creation_date';
    const UPDATED_AT = 'updated_date';
}
```

모델의 `updated_at` 타임스탬프가 수정되지 않도록 특정 작업을 수행하려면, `withoutTimestamps` 메서드에 클로저로 래핑해서 작업을 진행하면 됩니다.

```
Model::withoutTimestamps(fn () => $post->increment('reads'));
```

<a name="database-connections"></a>
### 데이터베이스 연결

기본적으로 모든 Eloquent 모델은 애플리케이션에 기본으로 설정된 데이터베이스 연결을 사용합니다. 특정 모델만 개별적으로 다른 연결을 사용하려면, 모델에 `$connection` 속성을 지정하면 됩니다.

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
    protected $connection = 'mysql';
}
```

<a name="default-attribute-values"></a>
### 기본 속성값

모델 인스턴스를 새로 생성하면, 기본적으로 아무런 속성값도 포함되어 있지 않습니다. 만약 일부 속성의 기본값을 지정하고 싶다면, 모델에 `$attributes` 속성을 정의하세요. `$attributes` 배열에 입력한 값들은 데이터베이스에서 읽어온 "저장 가능한(storable)" 원시 형태로 지정해야 합니다.

```
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
### Eloquent 엄격성 설정

라라벨은 다양한 상황에서 Eloquent의 동작과 "엄격성(strictness)"을 설정할 수 있는 여러 방법을 제공합니다.

가장 먼저, `preventLazyLoading` 메서드는 옵션으로 불리언 값을 받아서 Lazy 로딩(지연 로딩)을 허용하지 않을지 여부를 설정합니다. 예를 들어, 운영 환경이 아닌 개발 환경에서만 지연 로딩을 금지하고, 운영 환경에서는 우연히 지연 로딩이 발생해도 서비스가 중단되지 않도록 설정할 수 있습니다. 보통 이 메서드는 애플리케이션의 `AppServiceProvider` 내 `boot` 메서드에서 호출합니다.

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

또한, `preventSilentlyDiscardingAttributes` 메서드를 사용하면, `fillable` 배열에 추가되지 않은 속성을 세팅하려고 할 때 예외를 던지도록 라라벨에 지시할 수 있습니다. 이 기능은 로컬 개발 도중 의도하지 않은 속성 누락으로 인한 오류를 예방하는 데 도움이 됩니다.

```php
Model::preventSilentlyDiscardingAttributes(! $this->app->isProduction());
```

<a name="retrieving-models"></a>
## 모델 조회하기

모델을 만들고 [연관된 데이터베이스 테이블](/docs/11.x/migrations#generating-migrations)을 준비했다면, 이제 실제로 데이터베이스에서 데이터를 조회할 수 있습니다. 각 Eloquent 모델은 강력한 [쿼리 빌더](/docs/11.x/queries)처럼 동작하므로, 모델과 연결된 테이블을 간결하게 쿼리할 수 있습니다. 모델의 `all` 메서드를 사용하면 해당 모델이 연결된 테이블의 모든 레코드를 조회할 수 있습니다.

```
use App\Models\Flight;

foreach (Flight::all() as $flight) {
    echo $flight->name;
}
```

<a name="building-queries"></a>
#### 쿼리 작성하기

Eloquent의 `all` 메서드로는 테이블의 모든 데이터를 가져올 수 있습니다. 하지만 각 Eloquent 모델도 [쿼리 빌더](/docs/11.x/queries) 기능을 제공하므로, 쿼리에 조건을 추가하고 `get` 메서드로 원하는 결과만 가져올 수 있습니다.

```
$flights = Flight::where('active', 1)
    ->orderBy('name')
    ->take(10)
    ->get();
```

> [!NOTE]  
> Eloquent 모델은 쿼리 빌더이므로, 라라벨 [쿼리 빌더](/docs/11.x/queries)가 제공하는 모든 메서드를 사용할 수 있습니다. Eloquent 쿼리 작성 시 이 메서드들도 적극 활용해보세요.

<a name="refreshing-models"></a>
#### 모델 새로고침(Refresh)

이미 데이터베이스에서 조회한 Eloquent 모델 인스턴스가 있다면, `fresh` 또는 `refresh` 메서드로 모델을 "새로 고침"할 수 있습니다. `fresh` 메서드는 데이터베이스에서 모델을 다시 읽어와 새 인스턴스로 반환하지만, 기존 인스턴스는 그대로 유지됩니다.

```
$flight = Flight::where('number', 'FR 900')->first();

$freshFlight = $flight->fresh();
```

`refresh` 메서드는 기존 인스턴스를 데이터베이스의 최신 데이터로 다시 채웁니다(re-hydrate). 이때 이미 로딩된 모든 연관관계도 함께 새로 고침됩니다.

```
$flight = Flight::where('number', 'FR 900')->first();

$flight->number = 'FR 456';

$flight->refresh();

$flight->number; // "FR 900"
```

<a name="collections"></a>
### 컬렉션

지금까지 본 것처럼, Eloquent의 `all`이나 `get` 같은 메서드는 여러 레코드를 가져옵니다. 하지만 이 메서드들은 PHP 배열을 반환하지 않고, `Illuminate\Database\Eloquent\Collection` 인스턴스를 반환합니다.

Eloquent의 `Collection` 클래스는 라라벨 기본 `Illuminate\Support\Collection` 클래스를 확장하며, 데이터를 다루는 데 유용한 [다양한 메서드](/docs/11.x/collections#available-methods)를 제공합니다. 예를 들어, `reject` 메서드는 클로저의 조건에 따라 컬렉션에서 특정 모델을 제외할 수 있습니다.

```php
$flights = Flight::where('destination', 'Paris')->get();

$flights = $flights->reject(function (Flight $flight) {
    return $flight->cancelled;
});
```

라라벨의 기본 컬렉션 클래스가 제공하는 메서드 외에도, Eloquent 컬렉션 클래스만의 [추가 메서드](/docs/11.x/eloquent-collections#available-methods)들도 있습니다.

모든 라라벨 컬렉션은 PHP의 이터러블 인터페이스를 구현하므로 배열처럼 반복문으로 순회할 수 있습니다.

```php
foreach ($flights as $flight) {
    echo $flight->name;
}
```

<a name="chunking-results"></a>
### 결과 청크 처리

`all`이나 `get` 메서드로 수만 개 이상의 Eloquent 레코드를 한 번에 불러오면 애플리케이션이 메모리 부족에 빠질 수 있습니다. 이런 경우엔 `chunk` 메서드를 사용해 많은 양의 모델을 좀 더 효율적으로 처리할 수 있습니다.

`chunk` 메서드는 Eloquent 모델을 일정 개수로 잘라서(청크 단위로) 클로저에 전달하며 처리합니다. 이 방식은 한 번에 모든 모델을 메모리에 올리지 않고, 현재 청크만 처리하므로 대용량 데이터도 메모리 부담 없이 처리할 수 있습니다.

```php
use App\Models\Flight;
use Illuminate\Database\Eloquent\Collection;

Flight::chunk(200, function (Collection $flights) {
    foreach ($flights as $flight) {
        // ...
    }
});
```

`chunk` 메서드에 전달되는 첫 번째 인자는 한 번에 처리할 레코드 수입니다. 두 번째 인자인 클로저는 데이터베이스에서 각 청크를 읽어올 때마다 호출됩니다. 각 청크를 위한 데이터베이스 쿼리가 실행되어, 클로저에 전달됩니다.

만약 청크의 특정 컬럼 값을 기준으로 필터링하면서 동시에 해당 컬럼을 수정(업데이트)해야 한다면, `chunk` 대신 `chunkById`를 사용해야 예기치 않은 오류나 비일관적인 결과를 막을 수 있습니다. 내부적으로 `chunkById`는 이전 청크의 마지막 모델의 `id`보다 큰 행만 계속 조회하면서 처리합니다.

```php
Flight::where('departed', true)
    ->chunkById(200, function (Collection $flights) {
        $flights->each->update(['departed' => false]);
    }, column: 'id');
```

`chunkById`와 `lazyById` 메서드는 내부적으로 자체 "where" 조건을 쿼리에 추가하므로, 직접 작성한 조건들을 [클로저로 논리적으로 그룹화](/docs/11.x/queries#logical-grouping)하는 것이 좋습니다.

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
### Lazy 컬렉션으로 청크 처리

`lazy` 메서드는 [chunk 메서드](#chunking-results)와 비슷하게 내부적으로 쿼리를 청크 단위로 실행합니다. 단, 각 청크 결과를 곧바로 콜백 함수로 넘기는 대신, 쿼리 결과 전체를 평탄화(flatten)한 [`LazyCollection`](/docs/11.x/collections#lazy-collections) 객체로 반환하여 하나의 스트림처럼 다룰 수 있습니다.

```php
use App\Models\Flight;

foreach (Flight::lazy() as $flight) {
    // ...
}
```

청크 단위로 순회하면서 해당 컬럼을 업데이트해야 한다면, `lazyById`를 사용하는 것이 좋습니다. 내부적으로 `lazyById`도 이전 청크의 마지막 모델보다 `id`가 큰 모델만 연속해서 조회합니다.

```php
Flight::where('departed', true)
    ->lazyById(200, column: 'id')
    ->each->update(['departed' => false]);
```

`lazyByIdDesc` 메서드를 사용하면 `id` 값의 내림차순으로 결과를 필터링할 수도 있습니다.

<a name="cursors"></a>
### 커서(Cursor)

`lazy` 메서드와 비슷하게, `cursor` 메서드는 수만 건 이상의 Eloquent 레코드를 순회할 때 애플리케이션의 메모리 사용량을 크게 줄여줍니다.

`cursor` 메서드는 단 한 번만 데이터베이스 쿼리를 실행하지만, 실제로 순회(iteration)를 진행할 때마다 그때그때 Eloquent 모델이 "하이드레이션"되어 메모리에 올라옵니다. 따라서 커서를 순회하면서 한 번에 메모리에 올라가는 모델 인스턴스는 항상 1개뿐입니다.

> [!WARNING]  
> 커서(`cursor`) 메서드는 한 번에 하나의 모델만 메모리로 가져오므로, 관계(relationship) 미리 로딩(eager load)은 지원하지 않습니다. 관계도 함께 로딩해야 한다면 [lazy 메서드](#chunking-using-lazy-collections)를 사용하세요.

내부적으로 커서는 PHP [제너레이터(generators)](https://www.php.net/manual/en/language.generators.overview.php) 기능을 활용합니다.

```php
use App\Models\Flight;

foreach (Flight::where('destination', 'Zurich')->cursor() as $flight) {
    // ...
}
```

`cursor`는 `Illuminate\Support\LazyCollection` 인스턴스를 반환합니다. [LazyCollection](/docs/11.x/collections#lazy-collections)은 일반 라라벨 컬렉션의 다양한 메서드를, 단 한 번에 하나의 모델만 메모리로 올리면서 사용할 수 있게 해줍니다.

```php
use App\Models\User;

$users = User::cursor()->filter(function (User $user) {
    return $user->id > 500;
});

foreach ($users as $user) {
    echo $user->id;
}
```

커서(`cursor`) 메서드는 일반 쿼리 방식에 비해 메모리 사용량이 훨씬 적지만, 결국에는 메모리가 고갈될 수 있습니다. 그 이유는 [PHP의 PDO 드라이버가 내부적으로 쿼리의 모든 결과를 버퍼에 캐싱](https://www.php.net/manual/en/mysqlinfo.concepts.buffering.php)하기 때문입니다. 정말 막대한 양의 Eloquent 레코드를 다뤄야 한다면, [lazy 메서드](#chunking-using-lazy-collections) 사용을 고려해보세요.

<a name="advanced-subqueries"></a>

### 고급 서브쿼리

<a name="subquery-selects"></a>
#### 서브쿼리 선택

Eloquent는 고급 서브쿼리 지원을 제공하므로, 하나의 쿼리로 관련 테이블의 정보를 함께 가져올 수 있습니다. 예를 들어, 비행 `destinations`(목적지) 테이블과 해당 목적지로 가는 `flights`(비행편) 테이블이 있다고 가정해봅시다. `flights` 테이블에는 비행편이 목적지에 도착한 시간을 기록하는 `arrived_at` 컬럼이 있습니다.

쿼리 빌더의 `select` 및 `addSelect` 메서드를 활용한 서브쿼리 기능을 이용하면, 모든 `destinations`(목적지)와 해당 목적지에 가장 최근에 도착한 비행편의 이름을 한 번의 쿼리로 선택할 수 있습니다.

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

또한, 쿼리 빌더의 `orderBy` 함수는 서브쿼리를 지원합니다. 앞서 예시의 비행편을 계속 사용하면, 각 목적지에 마지막으로 도착한 비행편의 도착 시간을 기준으로 모든 목적지를 정렬할 수 있습니다. 이 역시 한 번의 데이터베이스 쿼리로 처리할 수 있습니다.

```
return Destination::orderByDesc(
    Flight::select('arrived_at')
        ->whereColumn('destination_id', 'destinations.id')
        ->orderByDesc('arrived_at')
        ->limit(1)
)->get();
```

<a name="retrieving-single-models"></a>
## 단일 모델 및 집계값 조회

특정 쿼리에 일치하는 모든 레코드를 조회하는 것 외에도, `find`, `first`, `firstWhere` 메서드를 사용하여 단일 레코드를 조회할 수 있습니다. 이 메서드들은 모델의 컬렉션이 아닌 **단일 모델 인스턴스**를 반환합니다.

```
use App\Models\Flight;

// 기본 키(primary key)로 모델을 조회합니다...
$flight = Flight::find(1);

// 쿼리 조건에 첫 번째로 일치하는 모델을 조회합니다...
$flight = Flight::where('active', 1)->first();

// 쿼리 조건에 첫 번째로 일치하는 모델을 alternative로 조회합니다...
$flight = Flight::firstWhere('active', 1);
```

경우에 따라, 결과가 없을 경우 별도의 작업을 하고 싶을 때도 있습니다. `findOr`와 `firstOr` 메서드는 단일 모델 인스턴스를 반환하거나, 결과가 없을 경우 지정한 클로저(익명 함수)를 실행합니다. 클로저에서 반환하는 값이 해당 메서드의 결과로 간주됩니다.

```
$flight = Flight::findOr(1, function () {
    // ...
});

$flight = Flight::where('legs', '>', 3)->firstOr(function () {
    // ...
});
```

<a name="not-found-exceptions"></a>
#### 존재하지 않을 때 예외 발생

때로는 모델이 조회되지 않을 경우 예외를 던지도록 하고 싶을 때가 있습니다. 이 방식은 라우트나 컨트롤러에서 특히 유용합니다. `findOrFail` 및 `firstOrFail` 메서드는 쿼리의 첫 번째 결과를 조회하며, 만약 결과가 없으면 `Illuminate\Database\Eloquent\ModelNotFoundException` 예외가 발생합니다.

```
$flight = Flight::findOrFail(1);

$flight = Flight::where('legs', '>', 3)->firstOrFail();
```

`ModelNotFoundException`이 잡히지 않으면, 자동으로 404 HTTP 응답이 클라이언트로 전송됩니다.

```
use App\Models\Flight;

Route::get('/api/flights/{id}', function (string $id) {
    return Flight::findOrFail($id);
});
```

<a name="retrieving-or-creating-models"></a>
### 모델 조회 혹은 생성

`firstOrCreate` 메서드는 주어진 컬럼/값 쌍을 사용하여 데이터베이스 레코드를 조회하려고 시도합니다. 모델을 데이터베이스에서 찾지 못하면, 첫 번째 배열 인수와 옵션으로 제공된 두 번째 배열 인수를 병합하여 새로운 레코드를 삽입합니다.

`firstOrNew` 메서드는 `firstOrCreate`와 비슷하게 주어진 속성에 맞는 레코드를 데이터베이스에서 조회합니다. 하지만 모델을 찾지 못했을 경우, 새로운 모델 인스턴스를 반환합니다. 단, `firstOrNew`가 반환하는 모델은 아직 데이터베이스에 저장되지 않았으므로, 직접 `save` 메서드를 호출해서 저장해야 합니다.

```
use App\Models\Flight;

// 이름으로 flight를 조회하거나, 없으면 새로 생성합니다...
$flight = Flight::firstOrCreate([
    'name' => 'London to Paris'
]);

// 이름, delayed, arrival_time 속성으로 flight를 조회하거나, 없으면 생성합니다...
$flight = Flight::firstOrCreate(
    ['name' => 'London to Paris'],
    ['delayed' => 1, 'arrival_time' => '11:30']
);

// 이름으로 flight를 조회하거나, 없으면 새 Flight 인스턴스만 반환합니다...
$flight = Flight::firstOrNew([
    'name' => 'London to Paris'
]);

// 이름, delayed, arrival_time 속성으로 flight를 조회하거나, 없으면 인스턴스만 반환합니다...
$flight = Flight::firstOrNew(
    ['name' => 'Tokyo to Sydney'],
    ['delayed' => 1, 'arrival_time' => '11:30']
);
```

<a name="retrieving-aggregates"></a>
### 집계값 조회

Eloquent 모델을 사용할 때도, 라라벨 [쿼리 빌더](/docs/11.x/queries)에서 제공하는 `count`, `sum`, `max` 등 [집계 메서드](/docs/11.x/queries#aggregates)를 그대로 사용할 수 있습니다. 이 메서드들은 Eloquent 모델 인스턴스가 아니라, 스칼라 값(숫자 또는 문자열)을 반환합니다.

```
$count = Flight::where('active', 1)->count();

$max = Flight::where('active', 1)->max('price');
```

<a name="inserting-and-updating-models"></a>
## 모델 삽입 및 수정

<a name="inserts"></a>
### 삽입

물론 Eloquent를 사용할 때에는 데이터베이스에서 모델을 조회하는 것뿐 아니라, 새로운 레코드를 삽입하는 경우도 매우 많습니다. Eloquent는 이 작업을 매우 간단하게 처리할 수 있습니다. 데이터베이스에 새 레코드를 삽입하려면, 먼저 모델 인스턴스를 생성하고, 모델의 속성을 설정해준 다음, `save` 메서드를 호출하면 됩니다.

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Flight;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class FlightController extends Controller
{
    /**
     * 새 비행편을 데이터베이스에 저장합니다.
     */
    public function store(Request $request): RedirectResponse
    {
        // 요청 데이터 유효성 검사...

        $flight = new Flight;

        $flight->name = $request->name;

        $flight->save();

        return redirect('/flights');
    }
}
```

이 예제에서 HTTP 요청으로 전달받은 `name` 필드 값을 `App\Models\Flight` 모델 인스턴스의 `name` 속성에 할당합니다. 그리고 `save` 메서드를 호출하면 새로운 레코드가 데이터베이스에 삽입됩니다. `save` 메서드를 사용할 때 모델의 `created_at` 및 `updated_at` 타임스탬프도 자동으로 설정되므로, 별도로 값을 할당할 필요가 없습니다.

또한, `create` 메서드를 사용하면 한 번의 PHP 코드로 새 모델을 "저장"할 수 있습니다. `create` 메서드는 생성된 모델 인스턴스를 반환합니다.

```
use App\Models\Flight;

$flight = Flight::create([
    'name' => 'London to Paris',
]);
```

하지만 `create` 메서드를 사용하기 전에 반드시 모델 클래스의 `fillable` 또는 `guarded` 속성을 지정해야 합니다. 모든 Eloquent 모델은 기본적으로 대량 할당 취약점(Mass Assignment Vulnerability)으로부터 보호됩니다. 대량 할당(mass assignment)에 대해 더 자세히 알고 싶으시면 [대량 할당 문서](#mass-assignment)를 참고하시기 바랍니다.

<a name="updates"></a>
### 수정(업데이트)

`save` 메서드는 또한 데이터베이스에 이미 존재하는 모델을 수정하는 데도 사용할 수 있습니다. 모델을 수정하려면, 먼저 모델을 조회해서 원하는 속성을 변경한 다음, 다시 `save` 메서드를 호출하면 됩니다. 이때도 `updated_at` 타임스탬프가 자동으로 갱신되므로, 별도로 설정할 필요가 없습니다.

```
use App\Models\Flight;

$flight = Flight::find(1);

$flight->name = 'Paris to London';

$flight->save();
```

가끔은 기존 모델을 수정할 수도 있고, 일치하는 모델이 없으면 새 모델을 생성해야 할 때도 있습니다. `firstOrCreate`와 마찬가지로, `updateOrCreate` 메서드는 모델을 데이터베이스에 저장하므로, 따로 `save` 메서드를 호출할 필요가 없습니다.

아래 예시에서, 만약 `departure`가 `Oakland`이고 `destination`이 `San Diego`인 flight가 존재하면, 해당 레코드의 `price`와 `discounted` 컬럼이 업데이트됩니다. 해당 flight가 존재하지 않는 경우, 첫 번째 배열 인수와 두 번째 배열 인수를 병합한 속성값으로 새 flight가 생성됩니다.

```
$flight = Flight::updateOrCreate(
    ['departure' => 'Oakland', 'destination' => 'San Diego'],
    ['price' => 99, 'discounted' => 1]
);
```

<a name="mass-updates"></a>
#### 대량 업데이트

특정 쿼리를 만족하는 모델 전체에 대해 한 번에 업데이트를 수행할 수도 있습니다. 아래 예시에서는, `active`가 1이고 `destination`이 `San Diego`인 모든 flight가 지연(delayed)된 것으로 표시됩니다.

```
Flight::where('active', 1)
    ->where('destination', 'San Diego')
    ->update(['delayed' => 1]);
```

`update` 메서드는 변경할 컬럼과 값 쌍의 배열을 인수로 받습니다. 그리고 적용된(영향을 받은) 레코드의 개수를 반환합니다.

> [!WARNING]  
> Eloquent를 통해 대량 업데이트(mass update)를 수행할 때는, 해당 모델들에 대한 `saving`, `saved`, `updating`, `updated` 모델 이벤트가 **발생하지 않습니다**. 이는 대량 업데이트 시 대상 모델이 실제로 조회되지 않기 때문입니다.

<a name="examining-attribute-changes"></a>
#### 속성 변경 여부 확인

Eloquent는 모델의 내부 상태를 확인하고, 조회 시점 이후 어떤 속성(attribute)이 변경되었는지 파악할 수 있도록 `isDirty`, `isClean`, `wasChanged` 메서드를 제공합니다.

`isDirty` 메서드는, 모델이 조회된 이후 **속성값이 변경된 경우** true를 반환합니다. 특정 속성명이나 속성명 배열을 전달하면 해당 속성의 변경 여부만 확인할 수 있습니다. 반대로, `isClean` 메서드는 조회 이후 **변경되지 않은** 속성이 있는지 확인하는 용도이며, 마찬가지로 속성명 인수를 사용 가능합니다.

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
$user->isDirty(['first_name', 'title']); // true

$user->isClean(); // false
$user->isClean('title'); // false
$user->isClean('first_name'); // true
$user->isClean(['first_name', 'title']); // false

$user->save();

$user->isDirty(); // false
$user->isClean(); // true
```

`wasChanged` 메서드는, **마지막으로 저장(save)했을 때** 어떤 속성이 실제로 변경되었는지 여부를 반환합니다. 특정 속성명이나 배열을 인수로 넘기면 해당 속성이 변경됐는지도 확인할 수 있습니다.

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
$user->wasChanged(['title', 'slug']); // true
$user->wasChanged('first_name'); // false
$user->wasChanged(['first_name', 'title']); // true
```

`getOriginal` 메서드는, 모델이 조회된 시점의 "원본 속성값"을 배열 형태로 반환합니다. 특정 속성명을 인수로 넘기면 해당 속성의 원래 값을 반환합니다.

```
$user = User::find(1);

$user->name; // John
$user->email; // john@example.com

$user->name = "Jack";
$user->name; // Jack

$user->getOriginal('name'); // John
$user->getOriginal(); // 원본 속성 배열...
```

<a name="mass-assignment"></a>
### 대량 할당(Mass Assignment)

`create` 메서드를 사용하면 PHP 코드 한 줄로 새 모델을 "저장"할 수 있습니다. 이 메서드는 생성된 모델 인스턴스를 반환합니다.

```
use App\Models\Flight;

$flight = Flight::create([
    'name' => 'London to Paris',
]);
```

하지만 `create` 메서드를 사용하기 전에, 모델 클래스에서 `fillable` 또는 `guarded` 속성 중 하나를 반드시 지정해야 합니다. 모든 Eloquent 모델은 기본적으로 대량 할당 취약점(mass assignment vulnerability)으로부터 보호됩니다.

대량 할당 취약점이란, 사용자가 예상치 못한 HTTP 요청 필드를 전달할 때 해당 값이 데이터베이스의 컬럼을 변경하게 되는 상황을 의미합니다. 예를 들어, 악의적인 사용자가 HTTP 요청을 통해 `is_admin` 파라미터를 전송하고, 이 파라미터가 바로 모델의 `create` 메서드에 전달되면, 자신을 관리자 권한으로 승격시킬 수 있습니다.

따라서 안전하게 사용하려면, 모델의 어느 속성을 대량 할당(mass assignable) 가능하도록 할지 `$fillable` 속성을 통해 명시적으로 지정하는 것이 좋습니다. 예를 들어, `Flight` 모델에서 `name` 속성만 대량 할당이 가능하도록 지정하려면 다음과 같이 코드를 작성합니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * 대량 할당이 가능한 속성 목록입니다.
     *
     * @var array<int, string>
     */
    protected $fillable = ['name'];
}
```

어떤 속성을 대량 할당 가능하도록 설정했다면, 이제 `create` 메서드를 사용해 새 레코드를 생성할 수 있습니다. 또한 `create`는 생성된 모델 인스턴스를 반환합니다.

```
$flight = Flight::create(['name' => 'London to Paris']);
```

이미 모델 인스턴스를 가지고 있다면, `fill` 메서드를 사용해 여러 속성을 한 번에 할당할 수 있습니다.

```
$flight->fill(['name' => 'Amsterdam to Frankfurt']);
```

<a name="mass-assignment-json-columns"></a>
#### 대량 할당과 JSON 컬럼

JSON 컬럼에 대량 할당을 사용할 때는, 각 컬럼의 대량 할당 키를 모델의 `$fillable` 배열에 반드시 포함시켜야 합니다. 보안을 위해, 라라벨은 `guarded` 속성이 사용될 때 중첩된(네스티드) JSON 속성의 대량 할당 업데이트를 지원하지 않습니다.

```
/**
 * 대량 할당이 가능한 속성 목록입니다.
 *
 * @var array<int, string>
 */
protected $fillable = [
    'options->enabled',
];
```

<a name="allowing-mass-assignment"></a>
#### 전체 대량 할당 허용

모델의 모든 속성을 대량 할당 가능하게 하려면, 모델의 `$guarded` 속성을 빈 배열로 지정하면 됩니다. 다만, 절대적으로 신뢰할 수 있는 데이터만 `fill`, `create`, `update` 등에 넘기는 경우에만 사용해야 하며, 각별히 주의해야 합니다.

```
/**
 * 대량 할당이 불가능한 속성 목록입니다.
 *
 * @var array<string>|bool
 */
protected $guarded = [];
```

<a name="mass-assignment-exceptions"></a>
#### 대량 할당 예외

기본적으로, `$fillable` 배열에 포함되지 않은 속성(field)은 대량 할당 시 자동으로 무시(무반응)됩니다. 실제 운영 환경에서는 이 동작이 일반적이지만, 개발 단계(local)에서는 왜 값이 반영되지 않는지 혼란을 일으킬 수 있습니다.

이 경우, 라라벨이 대량 할당 때 할당 불가능한(unfillable) 속성이 포함되면 아예 예외를 발생시키도록 할 수 있습니다. 이를 위해서는 `preventSilentlyDiscardingAttributes` 메서드를 사용하면 됩니다. 보통 이 코드는 애플리케이션의 `AppServiceProvider` 클래스의 `boot` 메서드에 작성합니다.

```
use Illuminate\Database\Eloquent\Model;

/**
 * 애플리케이션 서비스 초기화
 */
public function boot(): void
{
    Model::preventSilentlyDiscardingAttributes($this->app->isLocal());
}
```

<a name="upserts"></a>
### 업서트(Upserts)

Eloquent의 `upsert` 메서드는 단일 원자적(atomic) 작업으로 레코드를 업데이트하거나 새로 생성할 수 있습니다. 첫 번째 인수에는 삽입 또는 업데이트할 값이 배열로, 두 번째 인수에는 해당 테이블에서 레코드를 고유하게 식별할 컬럼 배열이 들어갑니다. 세 번째 인수는 이미 존재하는 레코드일 경우 어떤 컬럼을 업데이트할지 지정합니다. 모델에 타임스탬프 기능이 활성화되어 있다면, `upsert` 호출 시 `created_at`, `updated_at` 값이 자동으로 설정됩니다.

```
Flight::upsert([
    ['departure' => 'Oakland', 'destination' => 'San Diego', 'price' => 99],
    ['departure' => 'Chicago', 'destination' => 'New York', 'price' => 150]
], uniqueBy: ['departure', 'destination'], update: ['price']);
```

> [!WARNING]  
> SQL Server를 제외한 모든 데이터베이스에서는 `upsert`의 두 번째 인수로 지정된 컬럼이 반드시 "primary" 또는 "unique" 인덱스를 가져야 합니다. 또한, MariaDB 및 MySQL 드라이버는 두 번째 인수를 무시하고, 테이블에 정의된 "primary" 및 "unique" 인덱스를 자동으로 사용하여 기존 레코드를 감지합니다.

<a name="deleting-models"></a>
## 모델 삭제

모델을 삭제하려면, 모델 인스턴스에서 `delete` 메서드를 호출하면 됩니다.

```
use App\Models\Flight;

$flight = Flight::find(1);

$flight->delete();
```

<a name="deleting-an-existing-model-by-its-primary-key"></a>
#### 기본 키로 기존 모델 삭제

위 예시에서는 우선 데이터베이스에서 모델을 조회한 뒤 `delete`를 호출했습니다. 하지만 모델의 기본 키(primary key)를 알고 있다면, 굳이 모델을 조회하지 않고도 `destroy` 메서드로 바로 삭제할 수 있습니다. `destroy` 메서드는 하나의 기본 키 뿐 아니라, 여러 개의 기본 키, 기본 키 배열, 혹은 [컬렉션](/docs/11.x/collections)도 인수로 받을 수 있습니다.

```
Flight::destroy(1);

Flight::destroy(1, 2, 3);

Flight::destroy([1, 2, 3]);

Flight::destroy(collect([1, 2, 3]));
```

[소프트 삭제](#soft-deleting) 모델을 사용할 경우, `forceDestroy` 메서드를 통해 영구적으로 삭제할 수도 있습니다.

```
Flight::forceDestroy(1);
```

> [!WARNING]  
> `destroy` 메서드는 각 모델을 하나씩 불러오고 `delete` 메서드를 개별적으로 호출하므로, 각 모델별로 `deleting`, `deleted` 이벤트가 정상적으로 발생합니다.

<a name="deleting-models-using-queries"></a>
#### 쿼리를 사용한 모델 삭제

물론, Eloquent 쿼리를 이용해서 쿼리 조건에 맞는 모든 모델을 삭제할 수도 있습니다. 다음 예에서는 비활성화된(`active` 값이 0) 모든 flight를 삭제합니다. 대량 업데이트와 마찬가지로, **대량 삭제** 시 삭제되는 모델들에 대한 이벤트는 발생하지 않습니다.

```
$deleted = Flight::where('active', 0)->delete();
```

테이블의 모든 모델을 삭제하려면, 아무 조건도 추가하지 않고 쿼리를 실행하면 됩니다.

```
$deleted = Flight::query()->delete();
```

> [!WARNING]  
> Eloquent를 사용해 대량 삭제(delete)를 실행할 때는, 삭제되는 모델들에 대해 `deleting`, `deleted` 모델 이벤트가 **발생하지 않습니다**. 이는 쿼리 실행 시 모델을 실제로 불러오지 않기 때문입니다.

<a name="soft-deleting"></a>
### 소프트 삭제

데이터베이스에서 실제로 레코드를 제거하지 않고, Eloquent가 "소프트 삭제"를 지원하도록 할 수 있습니다. 소프트 삭제가 적용된 모델은 실제로 데이터베이스에서 삭제되지 않고, 대신 `deleted_at` 속성에 "삭제된" 날짜와 시간이 저장됩니다. 소프트 삭제 기능을 사용하려면, 모델에 `Illuminate\Database\Eloquent\SoftDeletes` 트레이트를 추가하면 됩니다.

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

> [!NOTE]  
> `SoftDeletes` 트레이트는 `deleted_at` 속성을 자동으로 `DateTime` / `Carbon` 인스턴스로 변환(cast)해줍니다.

또한 데이터베이스 테이블에도 `deleted_at` 컬럼을 추가해야 합니다. 라라벨 [스키마 빌더](/docs/11.x/migrations)는 이 컬럼을 생성하는 헬퍼 메서드를 제공합니다.

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

이제 모델에서 `delete` 메서드를 호출하면 `deleted_at` 컬럼에 현재 날짜와 시간이 기록되고, 데이터베이스에서는 레코드가 그대로 남아 있게 됩니다. 소프트 삭제를 사용하는 모델을 쿼리할 때는, 소프트 삭제된 레코드는 자동으로 쿼리 결과에서 제외됩니다.

특정 모델 인스턴스가 소프트 삭제됐는지 확인하려면 `trashed` 메서드를 사용할 수 있습니다.

```
if ($flight->trashed()) {
    // ...
}
```

<a name="restoring-soft-deleted-models"></a>
#### 소프트 삭제된 모델 복원

때로는 소프트 삭제된(삭제 표시만 된) 모델을 복원("undelete")하고 싶은 경우가 있습니다. 이 경우, 모델 인스턴스에서 `restore` 메서드를 호출하면, 해당 모델의 `deleted_at` 컬럼이 `null`로 초기화됩니다.

```
$flight->restore();
```

쿼리 빌더에서 `restore` 메서드를 쓰면 여러 모델을 한 번에 복원할 수도 있습니다. 마찬가지로, 이런 "대량" 복원 역시 개별 모델 이벤트는 발생하지 않습니다.

```
Flight::withTrashed()
        ->where('airline_id', 1)
        ->restore();
```

`restore` 메서드는 [연관관계](/docs/11.x/eloquent-relationships) 쿼리에서도 사용할 수 있습니다.

```
$flight->history()->restore();
```

<a name="permanently-deleting-models"></a>
#### 영구적으로 모델 삭제

때로는 소프트 삭제된 모델을 영구적으로 진짜 삭제하고 싶을 수도 있습니다. 이럴 때는 `forceDelete` 메서드를 사용해 실제 데이터베이스에서 해당 레코드를 완전히 제거할 수 있습니다.

```
$flight->forceDelete();
```

`forceDelete` 메서드는 Eloquent 연관관계 쿼리에서도 사용 가능합니다.

```
$flight->history()->forceDelete();
```

<a name="querying-soft-deleted-models"></a>
### 소프트 삭제된 모델 쿼리하기

<a name="including-soft-deleted-models"></a>
#### 소프트 삭제 모델까지 포함해서 조회

앞서 설명했듯이, 소프트 삭제된 모델은 기본적으로 쿼리 결과에서 자동으로 제외됩니다. 하지만, 쿼리의 결과에 소프트 삭제된 모델까지 모두 포함하고 싶다면 쿼리에서 `withTrashed` 메서드를 호출하면 됩니다.

```
use App\Models\Flight;

$flights = Flight::withTrashed()
    ->where('account_id', 1)
    ->get();
```

`withTrashed` 메서드는 [연관관계](/docs/11.x/eloquent-relationships) 쿼리 작성 시에도 사용할 수 있습니다.

```
$flight->history()->withTrashed()->get();
```

<a name="retrieving-only-soft-deleted-models"></a>

#### 소프트 삭제된 모델만 조회하기

`onlyTrashed` 메서드를 사용하면 **소프트 삭제된** 모델만 조회할 수 있습니다.

```
$flights = Flight::onlyTrashed()
    ->where('airline_id', 1)
    ->get();
```

<a name="pruning-models"></a>
## 모델 가지치기(Pruning Models)

사용하지 않게 된 오래된 모델을 주기적으로 삭제하고 싶을 때가 있습니다. 이 작업을 위해, 주기적으로 삭제할 모델에 `Illuminate\Database\Eloquent\Prunable` 또는 `Illuminate\Database\Eloquent\MassPrunable` 트레이트를 추가할 수 있습니다. 트레이트를 모델에 추가한 뒤에는, 더 이상 필요하지 않은 모델을 조회하는 Eloquent 쿼리 빌더를 반환하는 `prunable` 메서드를 구현해야 합니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;

class Flight extends Model
{
    use Prunable;

    /**
     * 가지치기할 모델을 조회하는 쿼리 리턴.
     */
    public function prunable(): Builder
    {
        return static::where('created_at', '<=', now()->subMonth());
    }
}
```

모델에 `Prunable`을 지정한 경우, `pruning` 메서드를 모델에 추가로 정의할 수도 있습니다. 이 메서드는 모델이 삭제되기 **전**에 호출됩니다. 데이터베이스에서 영구적으로 삭제되기 전에 파일 등 모델과 관련된 추가 리소스를 삭제할 때 활용할 수 있습니다.

```
/**
 * 가지치기(pruning) 전 모델 준비.
 */
protected function pruning(): void
{
    // ...
}
```

가지치기할 모델 구성을 마쳤다면, 애플리케이션의 `routes/console.php` 파일에서 `model:prune` 아티즌 명령어를 스케줄러에 등록해야 합니다. 이 명령어를 얼마 간격으로 실행할지는 자유롭게 지정할 수 있습니다.

```
use Illuminate\Support\Facades\Schedule;

Schedule::command('model:prune')->daily();
```

`model:prune` 명령어는 애플리케이션의 `app/Models` 디렉터리 내에서 `Prunable` 모델을 자동으로 감지합니다. 만약 모델이 다른 위치에 있다면, `--model` 옵션으로 모델 클래스명을 지정할 수 있습니다.

```
Schedule::command('model:prune', [
    '--model' => [Address::class, Flight::class],
])->daily();
```

가지치기가 수행될 때 특정 모델만 **제외**하려면, `--except` 옵션을 사용하세요.

```
Schedule::command('model:prune', [
    '--except' => [Address::class, Flight::class],
])->daily();
```

`prunable` 쿼리가 예상대로 동작하는지 테스트하려면, `model:prune` 명령을 `--pretend` 옵션과 함께 실행하면 됩니다. 이 때 실제로 삭제가 이루어지지 않고, 몇 개의 레코드가 삭제될 것인지 개수만 리포트합니다.

```shell
php artisan model:prune --pretend
```

> [!WARNING]  
> 쿼리에 해당하는 소프트 삭제(soft deleting) 모델들은 영구적으로 삭제(`forceDelete`) 됩니다.

<a name="mass-pruning"></a>
#### 대량 가지치기(Mass Pruning)

모델에 `Illuminate\Database\Eloquent\MassPrunable` 트레이트를 추가하면, 데이터베이스에서 모델을 대량 삭제(mass-deletion) 쿼리로 처리합니다. 이 경우 `pruning` 메서드는 호출되지 않으며, `deleting`과 `deleted` 모델 이벤트도 발생하지 않습니다. 이는 삭제 전에 모델 인스턴스가 실제로 조회되지 않기 때문이며, 이로 인해 가지치기가 훨씬 효율적으로 동작합니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\MassPrunable;

class Flight extends Model
{
    use MassPrunable;

    /**
     * 가지치기할 모델을 조회하는 쿼리 리턴.
     */
    public function prunable(): Builder
    {
        return static::where('created_at', '<=', now()->subMonth());
    }
}
```

<a name="replicating-models"></a>
## 모델 복제(Replicating Models)

이미 존재하는 모델 인스턴스를 복제(저장되지 않은 새 인스턴스 생성)하려면 `replicate` 메서드를 사용할 수 있습니다. 같은 속성(attribute)이 많은 모델을 복사해서 쓸 때 유용합니다.

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

복제 시 특정 속성(attribute)을 복사 대상에서 **제외**하고 싶다면, 복제할 때 속성 배열을 `replicate` 메서드에 전달하면 됩니다.

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
### 전역 스코프(Global Scopes)

전역 스코프는 특정 모델에 대한 모든 쿼리에 제약 조건을 자동으로 추가할 수 있는 기능입니다. 라라벨의 [소프트 삭제](#soft-deleting) 기능도 전역 스코프를 활용해 데이터베이스에서 "삭제되지 않은" 모델만 자동으로 조회하도록 동작합니다. 자체적인 전역 스코프를 작성하면 모든 쿼리에서 특정 제약 조건이 항상 적용되도록 간편하게 만들 수 있습니다.

<a name="generating-scopes"></a>
#### 스코프 생성하기

새 전역 스코프를 생성하려면, `make:scope` 아티즌 명령어를 사용하세요. 생성된 스코프 클래스는 애플리케이션의 `app/Models/Scopes` 디렉터리에 저장됩니다.

```shell
php artisan make:scope AncientScope
```

<a name="writing-global-scopes"></a>
#### 전역 스코프 작성하기

전역 스코프를 작성하는 방법은 간단합니다. 먼저 `make:scope` 명령어로 `Illuminate\Database\Eloquent\Scope` 인터페이스를 구현하는 클래스를 생성하세요. `Scope` 인터페이스는 반드시 `apply` 메서드를 구현해야 하며, 여기서 쿼리에 필요한 `where` 조건이나 기타 절(clause)을 추가할 수 있습니다.

```
<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class AncientScope implements Scope
{
    /**
     * 주어진 Eloquent 쿼리 빌더에 스코프를 적용.
     */
    public function apply(Builder $builder, Model $model): void
    {
        $builder->where('created_at', '<', now()->subYears(2000));
    }
}
```

> [!NOTE]  
> 전역 스코프가 쿼리의 select 절에 컬럼을 추가한다면, `select` 대신 `addSelect` 메서드를 사용해야 합니다. 이를 통해 기존 select 절이 의도치 않게 대체되는 것을 방지할 수 있습니다.

<a name="applying-global-scopes"></a>
#### 전역 스코프 적용하기

모델에 전역 스코프를 적용하려면, 해당 모델에 `ScopedBy` 속성을 추가하면 됩니다.

```
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

또는 모델의 `booted` 메서드를 오버라이드하여 `addGlobalScope` 메서드로 전역 스코프를 수동 등록할 수 있습니다. 이때 스코프의 인스턴스를 인자로 전달합니다.

```
<?php

namespace App\Models;

use App\Models\Scopes\AncientScope;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 모델의 "booted" 메서드.
     */
    protected static function booted(): void
    {
        static::addGlobalScope(new AncientScope);
    }
}
```

위 예시처럼 `App\Models\User` 모델에 스코프를 추가하면, `User::all()`을 호출할 때 아래와 같은 SQL 쿼리가 실행됩니다.

```sql
select * from `users` where `created_at` < 0021-02-18 00:00:00
```

<a name="anonymous-global-scopes"></a>
#### 익명(Anonymous) 전역 스코프

Eloquent에서는 익명 함수(클로저)를 사용해 전역 스코프를 정의할 수도 있습니다. 간단한 조건일 경우 별도의 클래스를 만들 필요 없이 사용할 수 있어 편리합니다. 이 때는 `addGlobalScope` 메서드의 첫 번째 인자로, 원하는 스코프 이름을 문자열로 전달해야 합니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 모델의 "booted" 메서드.
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

특정 쿼리에서 전역 스코프를 제거하려면, `withoutGlobalScope` 메서드를 사용할 수 있습니다. 이 메서드에는 제거하고자 하는 전역 스코프 클래스명을 인자로 전달합니다.

```
User::withoutGlobalScope(AncientScope::class)->get();
```

클로저로 정의한 전역 스코프라면, 등록할 때 썼던 문자열 이름을 인자로 전달하면 됩니다.

```
User::withoutGlobalScope('ancient')->get();
```

여러 전역 스코프, 혹은 모든 전역 스코프를 제거하려면 `withoutGlobalScopes` 메서드를 사용할 수 있습니다.

```
// 모든 전역 스코프를 제거...
User::withoutGlobalScopes()->get();

// 일부 전역 스코프만 제거...
User::withoutGlobalScopes([
    FirstScope::class, SecondScope::class
])->get();
```

<a name="local-scopes"></a>
### 로컬 스코프(Local Scopes)

로컬 스코프는, 자주 사용하는 쿼리 제약 조건 집합을 한 곳에 정의해 애플리케이션 곳곳에서 쉽게 재사용할 수 있게 해줍니다. 예를 들어, "인기 있는 사용자"만 자주 조회해야 한다면, Eloquent 모델 메서드의 이름 앞에 `scope`를 붙여 스코프를 정의할 수 있습니다.

스코프는 항상 같은 쿼리 빌더 인스턴스 또는 `void`를 반환해야 합니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * "인기 있는 사용자"만 포함하는 쿼리 스코프.
     */
    public function scopePopular(Builder $query): void
    {
        $query->where('votes', '>', 100);
    }

    /**
     * "활성 사용자"만 포함하는 쿼리 스코프.
     */
    public function scopeActive(Builder $query): void
    {
        $query->where('active', 1);
    }
}
```

<a name="utilizing-a-local-scope"></a>
#### 로컬 스코프 사용하기

스코프를 정의했다면, 모델 쿼리 시 스코프 메서드를 이름만 써서 호출할 수 있습니다(`scope` 접두사는 생략). 여러 개의 스코프를 체이닝할 수도 있습니다.

```
use App\Models\User;

$users = User::popular()->active()->orderBy('created_at')->get();
```

여러 개의 Eloquent 스코프를 `or` 조건으로 조합할 때는, [논리 그룹핑](/docs/11.x/queries#logical-grouping)을 위해 클로저를 사용할 수도 있습니다.

```
$users = User::popular()->orWhere(function (Builder $query) {
    $query->active();
})->get();
```

그러나 이 방식이 번거로울 때를 대비해, 라라벨은 클로저 없이 스코프 체이닝을 더 간결하게 할 수 있는 "상위(higher order)" `orWhere` 메서드를 제공합니다.

```
$users = User::popular()->orWhere->active()->get();
```

<a name="dynamic-scopes"></a>
#### 동적 스코프(Dynamic Scopes)

스코프에서 파라미터를 받아야 할 때도 있습니다. 이 경우, 스코프 메서드의 시그니처에 추가 파라미터를 정의하면 됩니다. 스코프 파라미터는 `$query` 매개변수 뒤쪽에 정의해야 합니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 주어진 타입의 사용자만 포함하는 쿼리 스코프.
     */
    public function scopeOfType(Builder $query, string $type): void
    {
        $query->where('type', $type);
    }
}
```

스코프 메서드 시그니처에 필요한 인자를 추가하면, 스코프 호출 시에도 해당 인자를 전달할 수 있습니다.

```
$users = User::ofType('admin')->get();
```

<a name="pending-attributes"></a>
### 보류 중인 속성(Pending Attributes)

스코프에서 조건에 사용한 속성과 동일한 속성값을 가진 모델을 생성하려면, 스코프 쿼리 작성 시 `withAttributes` 메서드를 사용할 수 있습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    /**
     * 임시글(draft)만 포함하는 쿼리 스코프.
     */
    public function scopeDraft(Builder $query): void
    {
        $query->withAttributes([
            'hidden' => true,
        ]);
    }
}
```

`withAttributes` 메서드는 주어진 속성으로 `where` 조건을 추가할 뿐 아니라, 이후 스코프를 통해 생성되는 모델에도 해당 속성을 자동으로 포함시켜줍니다.

```
$draft = Post::draft()->create(['title' => 'In Progress']);

$draft->hidden; // true
```

<a name="comparing-models"></a>
## 모델 비교하기

두 모델 인스턴스가 "동일한" 모델인지 판별해야 할 때가 있습니다. `is` 및 `isNot` 메서드를 사용하면 두 모델이 같은 기본 키, 테이블, 데이터베이스 커넥션을 사용하는지 쉽게 확인할 수 있습니다.

```
if ($post->is($anotherPost)) {
    // ...
}

if ($post->isNot($anotherPost)) {
    // ...
}
```

이 메서드는 `belongsTo`, `hasOne`, `morphTo`, `morphOne` [연관관계](/docs/11.x/eloquent-relationships)에서도 사용할 수 있습니다. 관련된 모델을 가져오기 위한 쿼리를 실행하지 않고도 비교할 수 있어서 특히 유용합니다.

```
if ($post->author()->is($user)) {
    // ...
}
```

<a name="events"></a>
## 이벤트(Events)

> [!NOTE]  
> Eloquent 이벤트를 클라이언트 측 애플리케이션으로 바로 브로드캐스트하고 싶으신가요? 라라벨의 [모델 이벤트 브로드캐스팅](/docs/11.x/broadcasting#model-broadcasting) 문서를 참고하세요.

Eloquent 모델은 여러 이벤트를 발생시키며, 이를 통해 모델의 생애주기(lifecycle)에서 다음 순간에 훅(hook)을 걸 수 있습니다: `retrieved`, `creating`, `created`, `updating`, `updated`, `saving`, `saved`, `deleting`, `deleted`, `trashed`, `forceDeleting`, `forceDeleted`, `restoring`, `restored`, `replicating`.

* `retrieved`: 기존 모델이 데이터베이스에서 조회될 때 발생합니다.
* `creating`, `created`: 새 모델을 처음 저장(생성)할 때 발생합니다.
* `updating`, `updated`: 기존 모델이 수정되고 `save` 메서드가 호출되면 발생합니다.
* `saving`, `saved`: 모델이 생성 또는 수정될 때 발생하며, 속성이 변경되지 않아도 실행됩니다.

이벤트 이름이 `-ing`로 끝나면 변경사항이 **디스크에 저장되기 전**에, `-ed`로 끝나면 **저장 이후**에 발생합니다.

모델 이벤트를 수신하려면, Eloquent 모델에 `$dispatchesEvents` 프로퍼티를 정의하면 됩니다. 이 프로퍼티는 Eloquent 모델의 여러 생애주기 이벤트를 [이벤트 클래스](/docs/11.x/events)와 매핑합니다. 각 이벤트 클래스는 생성자에서 영향을 받는 모델 인스턴스를 인자로 받게 됩니다.

```
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
     * 모델을 위한 이벤트 맵.
     *
     * @var array<string, string>
     */
    protected $dispatchesEvents = [
        'saved' => UserSaved::class,
        'deleted' => UserDeleted::class,
    ];
}
```

Eloquent 이벤트를 정의하고 매핑한 뒤에는, [이벤트 리스너](/docs/11.x/events#defining-listeners)로 해당 이벤트를 처리할 수 있습니다.

> [!WARNING]  
> Eloquent를 통해 대량 업데이트(mass update)나 삭제(delete) 쿼리를 실행하면, 해당 모델에서 `saved`, `updated`, `deleting`, `deleted` 이벤트가 **발생하지 않습니다**. 이 경우 대상 모델이 실제로 조회되지 않기 때문입니다.

<a name="events-using-closures"></a>
### 클로저로 이벤트 등록하기

커스텀 이벤트 클래스 대신, 다양한 모델 이벤트가 발생할 때 실행할 클로저(익명 함수)를 직접 등록할 수도 있습니다. 일반적으로는 모델의 `booted` 메서드에서 이 클로저를 등록합니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 모델의 "booted" 메서드.
     */
    protected static function booted(): void
    {
        static::created(function (User $user) {
            // ...
        });
    }
}
```

필요하다면 모델 이벤트 등록 시 [큐(Queue)를 사용하는 익명 이벤트 리스너](/docs/11.x/events#queuable-anonymous-event-listeners)를 사용할 수도 있습니다. 이 경우, 라라벨이 애플리케이션의 [큐](/docs/11.x/queues) 처리 방식에 따라 이벤트를 백그라운드에서 실행하게 됩니다.

```
use function Illuminate\Events\queueable;

static::created(queueable(function (User $user) {
    // ...
}));
```

<a name="observers"></a>
### 옵저버(Observers)

<a name="defining-observers"></a>
#### 옵저버 정의하기

모델에서 여러 이벤트를 수신해야 한다면, 이벤트 리스너를 하나의 클래스(옵저버)에 그룹화할 수 있습니다. 옵저버 클래스에서 메서드 이름은 수신할 Eloquent 이벤트 이름과 동일하게 지정하며, 각 메서드는 영향받는 모델을 인자로 받습니다. `make:observer` 아티즌 명령어로 새로운 옵저버 클래스를 쉽게 만들 수 있습니다.

```shell
php artisan make:observer UserObserver --model=User
```

이 명령어는 새로운 옵저버를 `app/Observers` 디렉터리에 생성합니다. 만약 디렉터리가 없다면 Artisan이 자동으로 생성합니다. 기본적으로 아래와 같은 형태로 만들어집니다.

```
<?php

namespace App\Observers;

use App\Models\User;

class UserObserver
{
    /**
     * User "created" 이벤트 처리.
     */
    public function created(User $user): void
    {
        // ...
    }

    /**
     * User "updated" 이벤트 처리.
     */
    public function updated(User $user): void
    {
        // ...
    }

    /**
     * User "deleted" 이벤트 처리.
     */
    public function deleted(User $user): void
    {
        // ...
    }

    /**
     * User "restored" 이벤트 처리.
     */
    public function restored(User $user): void
    {
        // ...
    }

    /**
     * User "forceDeleted" 이벤트 처리.
     */
    public function forceDeleted(User $user): void
    {
        // ...
    }
}
```

옵저버를 등록하려면, 해당 모델에 `ObservedBy` 속성을 추가하면 됩니다.

```
use App\Observers\UserObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;

#[ObservedBy([UserObserver::class])]
class User extends Authenticatable
{
    //
}
```

또는, 옵저버를 수동으로 등록하려면, 옵저버할 모델의 `observe` 메서드를 이용하면 됩니다. 애플리케이션의 `AppServiceProvider`의 `boot` 메서드에서 옵저버를 등록할 수 있습니다.

```
use App\Models\User;
use App\Observers\UserObserver;

/**
 * 모든 애플리케이션 서비스 부트스트랩.
 */
public function boot(): void
{
    User::observe(UserObserver::class);
}
```

> [!NOTE]  
> 옵저버가 추가로 수신할 수 있는 이벤트(`saving`, `retrieved` 등)도 있습니다. 자세한 내용은 [이벤트](#events) 문서를 참고하세요.

<a name="observers-and-database-transactions"></a>

#### 옵저버와 데이터베이스 트랜잭션

모델이 데이터베이스 트랜잭션 내에서 생성될 때, 옵저버의 이벤트 핸들러가 트랜잭션이 커밋된 이후에만 실행되도록 하고 싶을 수 있습니다. 이를 위해서는 옵저버 클래스에서 `ShouldHandleEventsAfterCommit` 인터페이스를 구현하면 됩니다. 만약 데이터베이스 트랜잭션이 진행 중이지 않다면, 이벤트 핸들러는 즉시 실행됩니다.

```
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
### 이벤트 무시하기

가끔 특정 모델에서 발생하는 모든 이벤트를 일시적으로 "무시"해야 하는 경우가 있습니다. 이럴 때는 `withoutEvents` 메서드를 사용할 수 있습니다. `withoutEvents` 메서드는 클로저(익명 함수)를 하나의 인자로 받습니다. 이 클로저 내부에서 실행되는 코드는 모델 이벤트를 발생시키지 않으며, 클로저에서 반환하는 값은 `withoutEvents` 메서드의 반환값으로 그대로 제공됩니다.

```
use App\Models\User;

$user = User::withoutEvents(function () {
    User::findOrFail(1)->delete();

    return User::find(2);
});
```

<a name="saving-a-single-model-without-events"></a>
#### 단일 모델을 이벤트 없이 저장하기

특정 모델을 "저장"할 때, 불필요한 이벤트를 발생시키고 싶지 않은 경우가 있습니다. 이럴 때는 `saveQuietly` 메서드를 사용하면 이벤트를 발생시키지 않고도 저장할 수 있습니다.

```
$user = User::findOrFail(1);

$user->name = 'Victoria Faith';

$user->saveQuietly();
```

이와 비슷하게, "update(업데이트)", "delete(삭제)", "soft delete(소프트 삭제)", "restore(복원)", "replicate(복제)" 등의 작업도 이벤트를 발생시키지 않고 실행할 수 있습니다.

```
$user->deleteQuietly();
$user->forceDeleteQuietly();
$user->restoreQuietly();
```