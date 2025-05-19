# Eloquent: 시작하기 (Eloquent: Getting Started)

- [소개](#introduction)
- [모델 클래스 생성](#generating-model-classes)
- [Eloquent 모델 관례](#eloquent-model-conventions)
    - [테이블 이름](#table-names)
    - [기본 키](#primary-keys)
    - [UUID 및 ULID 키](#uuid-and-ulid-keys)
    - [타임스탬프](#timestamps)
    - [데이터베이스 연결](#database-connections)
    - [속성의 기본값 지정](#default-attribute-values)
    - [Eloquent 엄격 모드 설정](#configuring-eloquent-strictness)
- [모델 조회하기](#retrieving-models)
    - [컬렉션](#collections)
    - [결과 청킹(덩어리 처리)](#chunking-results)
    - [Lazy 컬렉션으로 청킹 처리](#chunking-using-lazy-collections)
    - [커서(Cursor)](#cursors)
    - [고급 서브쿼리](#advanced-subqueries)
- [단일 모델/집계 조회](#retrieving-single-models)
    - [모델 조회 또는 생성](#retrieving-or-creating-models)
    - [집계값 조회](#retrieving-aggregates)
- [모델 삽입 및 수정](#inserting-and-updating-models)
    - [삽입](#inserts)
    - [수정](#updates)
    - [대량 할당](#mass-assignment)
    - [업서트(Upsert)](#upserts)
- [모델 삭제](#deleting-models)
    - [소프트 삭제](#soft-deleting)
    - [소프트 삭제 모델 쿼리](#querying-soft-deleted-models)
- [모델 가지치기(Pruning)](#pruning-models)
- [모델 복제(Replicating)](#replicating-models)
- [쿼리 스코프](#query-scopes)
    - [전역 스코프](#global-scopes)
    - [로컬 스코프](#local-scopes)
- [모델 비교](#comparing-models)
- [이벤트](#events)
    - [클로저 사용](#events-using-closures)
    - [옵저버(Observers)](#observers)
    - [이벤트 음소거(Muting Events)](#muting-events)

<a name="introduction"></a>
## 소개

라라벨에는 Eloquent라는 객체-관계 매퍼(ORM)가 포함되어 있어 데이터베이스와 더욱 즐겁고 쉽게 상호작용할 수 있습니다. Eloquent를 사용할 때 각 데이터베이스 테이블에는 해당 테이블과 연동되는 "모델"이 하나씩 만들어집니다. Eloquent 모델을 통해 데이터베이스 테이블에서 레코드를 조회할 뿐만 아니라, 레코드를 삽입, 수정, 삭제하는 작업도 할 수 있습니다.

> [!NOTE]
> 시작하기 전에 애플리케이션의 `config/database.php` 설정 파일에서 데이터베이스 연결을 반드시 구성해야 합니다. 데이터베이스 설정에 관한 자세한 내용은 [데이터베이스 구성 문서](/docs/10.x/database#configuration)를 참고하십시오.

#### 라라벨 부트캠프

라라벨이 처음이라면 [라라벨 부트캠프](https://bootcamp.laravel.com)에 참여해 보시기 바랍니다. 라라벨 부트캠프에서는 Eloquent를 사용하여 여러분의 첫 번째 라라벨 애플리케이션을 만드는 과정을 안내해 드립니다. 라라벨과 Eloquent에서 제공하는 다양한 기능을 둘러볼 수 있는 좋은 방법입니다.

<a name="generating-model-classes"></a>
## 모델 클래스 생성

이제 Eloquent 모델을 만들어 보겠습니다. 모델 클래스는 보통 `app\Models` 디렉터리에 위치하며, `Illuminate\Database\Eloquent\Model` 클래스를 확장합니다(extends). 새로운 모델을 생성하려면 `make:model` [Artisan 명령어](/docs/10.x/artisan)를 사용할 수 있습니다.

```shell
php artisan make:model Flight
```

모델을 생성할 때 [데이터베이스 마이그레이션](/docs/10.x/migrations)도 함께 만들고 싶다면 `--migration` 또는 `-m` 옵션을 사용할 수 있습니다.

```shell
php artisan make:model Flight --migration
```

모델을 생성할 때 팩토리(factory), 시더(seeder), 정책(policy), 컨트롤러(controller), 폼 요청(form request) 등 다양한 클래스를 함께 생성할 수도 있습니다. 이러한 옵션들은 조합해서 한 번에 여러 클래스를 만들 수 있습니다.

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

# 모델, 마이그레이션, 팩토리, 시더, 컨트롤러까지 한 번에 생성...
php artisan make:model Flight -mfsc

# 모델, 마이그레이션, 팩토리, 시더, 정책, 컨트롤러, 폼 요청까지 한 번에 생성하는 단축키...
php artisan make:model Flight --all

# 피벗(pivot) 모델 생성...
php artisan make:model Member --pivot
php artisan make:model Member -p
```

<a name="inspecting-models"></a>
#### 모델 속성 및 연관관계 확인

때때로 코드만 훑어봐서는 모델이 가진 모든 속성과 연관관계를 파악하기 어려울 수 있습니다. 이럴 때는 `model:show` Artisan 명령어를 사용해 보세요. 해당 명령어는 모델의 속성 및 연관관계(relationships)를 한눈에 볼 수 있도록 요약해 보여줍니다.

```shell
php artisan model:show Flight
```

<a name="eloquent-model-conventions"></a>
## Eloquent 모델 관례

`make:model` 명령어로 생성된 모델은 `app/Models` 디렉터리에 저장됩니다. 기본적인 모델 클래스를 살펴보고, Eloquent에서 사용하는 주요 관례에 대해 알아보겠습니다.

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
### 테이블 이름

위 예시에서 보셨듯이, Eloquent에 `Flight` 모델이 어느 테이블과 연결되어 있는지 별도로 지정하지 않았다는 점에 주목해 주세요. Eloquent는 별도로 지정하지 않으면 클래스 이름을 "스네이크 케이스(snake case)"의 복수형으로 변환해서 테이블 이름으로 사용합니다. 즉, `Flight` 모델은 자동으로 `flights` 테이블을 사용하고, `AirTrafficController` 모델은 `air_traffic_controllers` 테이블을 사용하게 됩니다.

만약 모델과 연결할 데이터베이스 테이블 이름이 이런 규칙을 따르지 않는다면, 모델의 `table` 속성을 정의하여 직접 테이블 이름을 지정할 수 있습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * 모델과 연결된 테이블 이름
     *
     * @var string
     */
    protected $table = 'my_flights';
}
```

<a name="primary-keys"></a>
### 기본 키

Eloquent는 각 모델이 대응되는 데이터베이스 테이블에 `id`라는 이름의 기본 키(primary key) 컬럼이 있다고 간주합니다. 만약 다른 컬럼을 기본 키로 사용하려면 모델에서 보호된 `$primaryKey` 속성을 정의해 해당 컬럼명을 지정할 수 있습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * 테이블에 연결된 기본 키
     *
     * @var string
     */
    protected $primaryKey = 'flight_id';
}
```

또한, Eloquent는 기본 키가 자동 증가하는 정수(integer) 값이라고 가정하며, 이 때문에 기본 키 값을 자동으로 정수형으로 변환해줍니다. 만약 자동 증가하지 않거나 숫자가 아닌 기본 키를 사용하려면, 모델에 `public $incrementing = false;`로 지정하여 자동 증가를 비활성화해야 합니다.

```
<?php

class Flight extends Model
{
    /**
     * 모델의 ID가 자동 증가되는지 여부
     *
     * @var bool
     */
    public $incrementing = false;
}
```

모델의 기본 키가 정수가 아니라면, 모델에서 보호된 `$keyType` 속성에 `string` 값을 지정해야 합니다.

```
<?php

class Flight extends Model
{
    /**
     * 기본 키의 데이터 타입
     *
     * @var string
     */
    protected $keyType = 'string';
}
```

<a name="composite-primary-keys"></a>
#### "복합" 기본 키

Eloquent에서 각 모델에는 최소 하나의 고유 식별 "ID"가 필요하며, 이는 기본 키로 사용됩니다. Eloquent는 "복합(Composite) 기본 키"를 지원하지 않습니다. 그러나, 테이블에 고유하게 식별되는 기본 키 이외에도 여러 컬럼을 조합한 유니크 인덱스를 추가해서 사용할 수는 있습니다.

<a name="uuid-and-ulid-keys"></a>
### UUID 및 ULID 키

Eloquent 모델의 기본 키로 자동 증가하는 정수값 대신 UUID를 사용할 수도 있습니다. UUID(범용 고유 식별자)는 36자리의 영숫자 문자열로 전 세계에서 유일하게 생성되는 값입니다.

모델에서 자동 증가 정수 대신 UUID를 기본 키로 사용하려면, 모델에 `Illuminate\Database\Eloquent\Concerns\HasUuids` 트레이트(trait)를 추가하면 됩니다. 물론, 모델에 [UUID에 해당하는 기본 키 컬럼](/docs/10.x/migrations#column-method-uuid)이 있어야 합니다.

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

기본적으로 `HasUuids` 트레이트는 모델에 ["순서형(ordered) UUID"](/docs/10.x/strings#method-str-ordered-uuid)를 생성해 저장합니다. 순서형 UUID는 인덱싱할 때 사전순(lexicographical)으로 정렬이 가능해 데이터베이스의 인덱스 저장에 더 효율적입니다.

특정 모델의 UUID 생성 방식을 오버라이드(재정의)하고 싶다면, 모델에 `newUniqueId` 메서드를 정의하면 됩니다. 그리고 어떤 컬럼이 UUID를 받아야 할지 지정하고 싶다면, 모델에 `uniqueIds` 메서드를 추가하세요.

```
use Ramsey\Uuid\Uuid;

/**
 * 모델을 위한 새로운 UUID 생성
 */
public function newUniqueId(): string
{
    return (string) Uuid::uuid4();
}

/**
 * 고유 식별자가 부여되어야 할 컬럼 목록 반환
 *
 * @return array<int, string>
 */
public function uniqueIds(): array
{
    return ['id', 'discount_code'];
}
```

UUID 대신 "ULID"를 사용할 수도 있습니다. ULID는 UUID와 유사하지만, 26자리로 더 짧게 구성되며, 순서형 UUID와 마찬가지로 효율적인 인덱싱을 위해 사전순 정렬이 가능합니다. ULID를 사용하려면 `Illuminate\Database\Eloquent\Concerns\HasUlids` 트레이트를 모델에 적용하고, 모델에 [ULID에 해당하는 기본 키 컬럼](/docs/10.x/migrations#column-method-ulid)을 준비해야 합니다.

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

기본적으로 Eloquent는 모델이 연관된 데이터베이스 테이블에 `created_at`과 `updated_at` 컬럼이 있다고 간주합니다.  Eloquent는 모델이 생성되거나 수정될 때 이 컬럼의 값을 자동으로 설정합니다. 만약 Eloquent가 이 컬럼들을 자동으로 관리하지 않게 하려면, 모델에서 `$timestamps` 속성을 `false`로 지정하세요.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * 모델에서 타임스탬프를 사용여부 지정
     *
     * @var bool
     */
    public $timestamps = false;
}
```

모델의 타임스탬프 포맷을 커스터마이징하려면, `$dateFormat` 속성을 설정하세요. 이 속성은 날짜 속성이 데이터베이스에 저장되는 방식과 모델을 배열 또는 JSON으로 직렬화(serialization)할 때의 포맷을 결정합니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * 모델의 날짜 컬럼 저장 포맷
     *
     * @var string
     */
    protected $dateFormat = 'U';
}
```

타임스탬프 컬럼의 이름을 변경하려면, 모델에 `CREATED_AT`와 `UPDATED_AT` 상수를 정의하면 됩니다.

```
<?php

class Flight extends Model
{
    const CREATED_AT = 'creation_date';
    const UPDATED_AT = 'updated_date';
}
```

`updated_at` 타임스탬프 값이 변경되지 않도록 모델 작업을 수행하고 싶다면, `withoutTimestamps` 메서드에 클로저(익명 함수)를 전달하여 해당 블록 안에서 조작할 수 있습니다.

```
Model::withoutTimestamps(fn () => $post->increment(['reads']));
```

<a name="database-connections"></a>
### 데이터베이스 연결

별도의 지정이 없으면 모든 Eloquent 모델은 애플리케이션에 설정된 기본 데이터베이스 연결을 사용합니다. 특정 모델에서 다른 연결을 사용하게 하고 싶다면, 모델에 `$connection` 속성을 정의해 주세요.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * 모델에서 사용할 데이터베이스 연결 이름
     *
     * @var string
     */
    protected $connection = 'sqlite';
}
```

<a name="default-attribute-values"></a>
### 속성의 기본값 지정

새로 인스턴스화된 모델 인스턴스는 기본적으로 아무 속성 값도 가지지 않습니다. 일부 속성에 기본값을 미리 지정하려면, 모델에 `$attributes` 속성을 정의하면 됩니다. 이때 값은 데이터베이스에서 꺼내 온 "저장 가능한(storable)" 원본 형식이어야 합니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * 모델 속성의 기본값 지정
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
### Eloquent 엄격 모드 설정

라라벨에서는 Eloquent의 다양한 동작과 "엄격함(strictness)"을 설정할 수 있는 여러 메서드를 제공합니다.

먼저, `preventLazyLoading` 메서드는 lazy loading(지연 로딩) 자체를 방지하려는지 Boolean 값으로 지정할 수 있습니다. 예를 들어, 실수로 production 환경 코드에 lazy loading이 남아있더라도 운영 환경에는 영향을 주지 않으면서 개발/테스트 환경에서만 지연 로딩을 막고 싶을 때 활용할 수 있습니다. 이 메서드는 주로 애플리케이션의 `AppServiceProvider` 클래스의 `boot` 메서드에서 호출합니다.

```php
use Illuminate\Database\Eloquent\Model;

/**
 * 모든 애플리케이션 서비스 부트스트랩
 */
public function boot(): void
{
    Model::preventLazyLoading(! $this->app->isProduction());
}
```

또한, 모델에 없는 속성을 할당하려 하면 에러를 던지도록 `preventSilentlyDiscardingAttributes` 메서드를 사용할 수 있습니다. 이 설정은 모델의 `fillable` 배열에 추가되지 않은 속성에 값을 할당할 때 발생하는 예기치 않은 에러를 개발 단계에서 미리 방지하는 데 도움이 됩니다.

```php
Model::preventSilentlyDiscardingAttributes(! $this->app->isProduction());
```

<a name="retrieving-models"></a>
## 모델 조회하기

모델과 [관련 데이터베이스 테이블](/docs/10.x/migrations#writing-migrations)을 생성했다면, 데이터베이스에서 데이터를 조회할 준비가 끝난 것입니다. 각 Eloquent 모델은 강력한 [쿼리 빌더](/docs/10.x/queries)처럼 작동하므로, 메서드 체이닝을 통해 모델과 연결된 테이블을 유연하게 조회할 수 있습니다. `all` 메서드를 사용하면 해당 모델과 연결된 테이블의 모든 레코드를 한 번에 가져올 수 있습니다.

```
use App\Models\Flight;

foreach (Flight::all() as $flight) {
    echo $flight->name;
}
```

<a name="building-queries"></a>
#### 쿼리 빌딩하기

Eloquent의 `all` 메서드는 테이블의 모든 결과를 반환합니다. 하지만, 각 Eloquent 모델은 [쿼리 빌더](/docs/10.x/queries)의 역할도 겸하기 때문에, 쿼리에 다양한 조건을 추가하고 `.get()` 메서드를 호출하여 결과를 조회할 수도 있습니다.

```
$flights = Flight::where('active', 1)
               ->orderBy('name')
               ->take(10)
               ->get();
```

> [!NOTE]
> Eloquent 모델은 쿼리 빌더이기도 하므로, 라라벨의 [쿼리 빌더](/docs/10.x/queries)가 제공하는 모든 메서드를 사용할 수 있습니다. Eloquent 쿼리를 작성할 때 이들을 자유롭게 활용하세요.

<a name="refreshing-models"></a>
#### 모델 새로고침

데이터베이스에서 이미 조회한 Eloquent 모델 인스턴스가 있다면, `fresh` 또는 `refresh` 메서드를 사용하여 모델을 "새로고침"할 수 있습니다. `fresh` 메서드는 데이터베이스에서 새로 조회한 모델 인스턴스를 반환하며, 기존 인스턴스는 영향을 받지 않습니다.

```
$flight = Flight::where('number', 'FR 900')->first();

$freshFlight = $flight->fresh();
```

`refresh` 메서드는 데이터베이스의 최신 데이터로 기존 모델 인스턴스를 다시 채웁니다(재하이드레이션). 또한, 로딩된 모든 연관관계(relationships)도 함께 새로고침됩니다.

```
$flight = Flight::where('number', 'FR 900')->first();

$flight->number = 'FR 456';

$flight->refresh();

$flight->number; // "FR 900"
```

<a name="collections"></a>
### 컬렉션

앞서 살펴본 `all`과 `get` 같은 Eloquent 메서드는 여러 레코드를 한꺼번에 반환합니다. 하지만, 반환되는 것은 일반 PHP 배열이 아니라 `Illuminate\Database\Eloquent\Collection` 인스턴스입니다.

Eloquent의 `Collection` 클래스는 Laravel의 기본 `Illuminate\Support\Collection` 클래스를 확장한 것이며, [다양한 유용한 메서드](/docs/10.x/collections#available-methods)로 데이터 컬렉션을 다룰 수 있습니다. 예를 들어, `reject` 메서드를 사용하면 지정한 조건(클로저)에 따라 컬렉션에서 모델을 걸러낼 수 있습니다.

```php
$flights = Flight::where('destination', 'Paris')->get();

$flights = $flights->reject(function (Flight $flight) {
    return $flight->cancelled;
});
```

Eloquent 컬렉션 클래스에는 기본 컬렉션 클래스가 제공하는 메서드 외에도, [Eloquent 모델 집합에 특화된 몇 가지 추가 메서드](/docs/10.x/eloquent-collections#available-methods)가 포함되어 있습니다.

라라벨의 모든 컬렉션은 PHP의 iterable 인터페이스를 구현하고 있기 때문에, 배열처럼 foreach로 순회할 수 있습니다.

```php
foreach ($flights as $flight) {
    echo $flight->name;
}
```

<a name="chunking-results"></a>
### 결과 청킹(덩어리 처리)

`all`이나 `get` 메서드를 사용해 수만, 수십만 개의 Eloquent 레코드를 한꺼번에 조회하면 애플리케이션이 메모리 부족에 직면할 수 있습니다. 이런 경우, `chunk` 메서드를 사용하여 대량의 모델을 보다 효율적으로 처리할 수 있습니다.

`chunk` 메서드는 Eloquent 모델의 일부분(subset)씩을 데이터베이스에서 조회하여, 각 청크를 클로저에 전달해 처리합니다. 이 방식은 한 번에 모든 레코드를 메모리에 불러오는 것이 아니기 때문에, 대량 데이터 처리 시 메모리 사용량을 크게 줄여줍니다.

```php
use App\Models\Flight;
use Illuminate\Database\Eloquent\Collection;

Flight::chunk(200, function (Collection $flights) {
    foreach ($flights as $flight) {
        // ...
    }
});
```

`chunk` 메서드의 첫 번째 인자는 한 번에 불러올 "청크"의 레코드 수입니다. 두 번째 인자는 각 청크를 처리할 때 호출되는 클로저입니다. 각 청크별로 데이터베이스 쿼리가 실행되어 레코드가 전달됩니다.

`chunk` 메서드로 필터링된 컬럼 값을 반복 처리 중에 동시에 수정(업데이트)해야 할 경우에는, 예상치 못한 결과나 불일치가 발생할 수 있으니 `chunkById` 메서드를 사용해야 합니다. `chunkById`는 내부적으로 항상 이전 청크의 마지막 모델보다 큰 `id` 값을 가진 모델만을 새로 불러옵니다.

```php
Flight::where('departed', true)
    ->chunkById(200, function (Collection $flights) {
        $flights->each->update(['departed' => false]);
    }, $column = 'id');
```

<a name="chunking-using-lazy-collections"></a>
### Lazy 컬렉션으로 청킹 처리

`lazy` 메서드는 [chunk 메서드](#chunking-results)와 유사하게, 내부적으로 쿼리를 청크 단위로 실행합니다. 그러나, 각 청크를 바로 콜백으로 전달하는 대신, 모든 모델이 하나의 평면화된 [`LazyCollection`](/docs/10.x/collections#lazy-collections) 객체로 묶여 반환되어 결과를 스트림 형태로 순회할 수 있습니다.

```php
use App\Models\Flight;

foreach (Flight::lazy() as $flight) {
    // ...
}
```

`lazy` 메서드의 필터링 기준이 되는 컬럼을 반복문에서 동시에 업데이트하려는 경우에는, `lazyById` 메서드를 사용하는 것이 안전합니다. `lazyById`는 내부적으로, 이전 청크의 마지막 모델보다 큰 `id` 값을 가진 모델만을 계속해서 불러옵니다.

```php
Flight::where('departed', true)
    ->lazyById(200, $column = 'id')
    ->each->update(['departed' => false]);
```

`lazyByIdDesc` 메서드를 사용하면 `id`의 내림차순(역순)으로 결과를 필터링할 수 있습니다.

<a name="cursors"></a>
### 커서(Cursor)

`lazy` 메서드와 마찬가지로, `cursor` 메서드를 사용하면 수만 개의 Eloquent 모델 레코드를 반복처리할 때 애플리케이션의 메모리 사용량을 크게 줄일 수 있습니다.

`cursor` 메서드는 단 한 번만 데이터베이스 쿼리를 실행하지만, 각각의 Eloquent 모델은 실제로 반복문에서 접근될 때까지 하이드레이션(데이터 주입)되지 않습니다. 따라서 루프를 도는 동안 어느 한 시점에는 단 하나의 Eloquent 모델만 메모리에 남게 됩니다.

> [!NOTE]
> `cursor` 메서드는 한 번에 하나의 모델만 메모리에 보관하기 때문에, 연관관계(eager loading)는 사용할 수 없습니다. 연관관계를 미리 로드해야 한다면 [lazy 메서드](#chunking-using-lazy-collections) 사용을 권장합니다.

내부적으로, `cursor` 메서드는 PHP의 [제너레이터(generator)](https://www.php.net/manual/en/language.generators.overview.php)를 활용해 동작합니다.

```php
use App\Models\Flight;

foreach (Flight::where('destination', 'Zurich')->cursor() as $flight) {
    // ...
}
```

`cursor`는 `Illuminate\Support\LazyCollection` 인스턴스를 반환합니다. [Lazy 컬렉션](/docs/10.x/collections#lazy-collections)을 사용하면 라라벨 컬렉션에서 제공하는 다양한 메서드를, 한 번에 하나의 모델만 메모리에 올리면서도 사용할 수 있습니다.

```php
use App\Models\User;

$users = User::cursor()->filter(function (User $user) {
    return $user->id > 500;
});

foreach ($users as $user) {
    echo $user->id;
}
```

비록 `cursor` 메서드는 한 번에 한 개의 모델만 메모리에 보관하기 때문에 일반 쿼리보다 메모리 사용량이 훨씬 적지만, 결국에는 메모리가 모두 소모될 수 있습니다. 그 이유는 PHP의 PDO 드라이버가 [모든 원본 쿼리 결과를 내부 버퍼에 캐싱하기 때문](https://www.php.net/manual/en/mysqlinfo.concepts.buffering.php)입니다. 아주 많은 Eloquent 레코드를 다루고 있다면, [lazy 메서드](#chunking-using-lazy-collections) 사용을 고려하시기 바랍니다.

<a name="advanced-subqueries"></a>

### 고급 서브쿼리

<a name="subquery-selects"></a>
#### 서브쿼리 Select

Eloquent는 고급 서브쿼리 기능도 제공합니다. 이를 통해 한 번의 쿼리로 연관된 테이블에서 정보를 가져올 수 있습니다. 예를 들어, `destinations`(목적지) 테이블과 목적지로 가는 `flights`(항공편) 테이블이 있다고 가정해보겠습니다. `flights` 테이블에는 항공편이 목적지에 도착한 시점을 나타내는 `arrived_at` 컬럼이 있습니다.

쿼리 빌더의 `select` 및 `addSelect` 메서드에서 제공하는 서브쿼리 기능을 활용하면, 한 번의 쿼리로 모든 `destinations`와 해당 목적지에 가장 최근 도착한 항공편의 이름을 가져올 수 있습니다.

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

또한, 쿼리 빌더의 `orderBy` 함수도 서브쿼리를 지원합니다. 앞서 예시에서 사용한 항공편 예시를 이어, 이 기능을 사용하여 각 목적지에 마지막으로 항공편이 도착한 시간을 기준으로 목적지들을 정렬할 수 있습니다. 이 역시 하나의 데이터베이스 쿼리로 처리할 수 있습니다.

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

특정 쿼리 조건에 부합하는 모든 레코드를 조회하는 것 외에도, `find`, `first`, `firstWhere` 메서드를 사용하여 단일 레코드만 조회할 수도 있습니다. 이들 메서드는 Eloquent 모델 컬렉션이 아니라, 단일 모델 인스턴스를 반환합니다.

```
use App\Models\Flight;

// 기본키로 모델을 조회합니다...
$flight = Flight::find(1);

// 쿼리 조건에 맞는 첫 번째 모델을 조회합니다...
$flight = Flight::where('active', 1)->first();

// 쿼리 조건에 맞는 첫 번째 모델을 조회하는 다른 방법...
$flight = Flight::firstWhere('active', 1);
```

조회 결과가 없을 경우, 다른 처리를 하고 싶을 때도 있습니다. `findOr` 및 `firstOr` 메서드는 단일 모델 인스턴스를 반환하거나, 결과가 없을 경우 지정한 클로저를 실행합니다. 클로저에서 반환되는 값이 메서드의 반환값이 됩니다.

```
$flight = Flight::findOr(1, function () {
    // ...
});

$flight = Flight::where('legs', '>', 3)->firstOr(function () {
    // ...
});
```

<a name="not-found-exceptions"></a>
#### 조회 실패 예외 처리

때로는, 모델을 찾지 못할 경우 예외를 던지길 원할 수 있습니다. 이는 라우트나 컨트롤러에서 특히 유용합니다. `findOrFail`과 `firstOrFail` 메서드는 쿼리 결과가 있을 경우 첫 번째 결과를 반환하지만, 결과가 없으면 `Illuminate\Database\Eloquent\ModelNotFoundException` 예외를 발생시킵니다.

```
$flight = Flight::findOrFail(1);

$flight = Flight::where('legs', '>', 3)->firstOrFail();
```

만약 `ModelNotFoundException`이 캐치되지 않을 경우, 클라이언트에게 자동으로 404 HTTP 응답이 반환됩니다.

```
use App\Models\Flight;

Route::get('/api/flights/{id}', function (string $id) {
    return Flight::findOrFail($id);
});
```

<a name="retrieving-or-creating-models"></a>
### 모델 조회 및 생성

`firstOrCreate` 메서드는, 지정한 컬럼/값 쌍으로 데이터베이스 레코드를 찾으려 시도합니다. 만약 해당 모델을 데이터베이스에서 찾을 수 없다면, 첫 번째 배열 인수와(선택적으로 두 번째 배열 인수와) 합쳐진 값으로 새로운 레코드를 삽입합니다.

`firstOrNew` 메서드 역시 지정한 속성값에 해당하는 레코드를 데이터베이스에서 찾으려 시도합니다. 다만, 만약 모델을 찾지 못했다면, 새로운 모델 인스턴스만 반환합니다. 즉, `firstOrNew`로 반환된 모델은 데이터베이스에 저장되지 않은 상태이므로, 직접 `save` 메서드를 호출해 저장해야 합니다.

```
use App\Models\Flight;

// 이름으로 항공편 조회 또는 없으면 생성
$flight = Flight::firstOrCreate([
    'name' => 'London to Paris'
]);

// 이름으로 항공편 조회, 없으면 name/delayed/arrival_time 을 포함해 생성
$flight = Flight::firstOrCreate(
    ['name' => 'London to Paris'],
    ['delayed' => 1, 'arrival_time' => '11:30']
);

// 이름으로 항공편 조회 또는 새 Flight 인스턴스 생성
$flight = Flight::firstOrNew([
    'name' => 'London to Paris'
]);

// 이름으로 항공편 조회 또는 새로운 속성값들과 함께 인스턴스 생성
$flight = Flight::firstOrNew(
    ['name' => 'Tokyo to Sydney'],
    ['delayed' => 1, 'arrival_time' => '11:30']
);
```

<a name="retrieving-aggregates"></a>
### 집계값 조회

Eloquent 모델과 상호작용할 때, 라라벨 [쿼리 빌더](/docs/10.x/queries)가 제공하는 `count`, `sum`, `max`와 같은 [집계 메서드](/docs/10.x/queries#aggregates)도 사용할 수 있습니다. 이 메서드들은 기대하신 대로 Eloquent 모델 인스턴스가 아니라 스칼라 값(숫자 등)을 반환합니다.

```
$count = Flight::where('active', 1)->count();

$max = Flight::where('active', 1)->max('price');
```

<a name="inserting-and-updating-models"></a>
## 모델 삽입과 수정

<a name="inserts"></a>
### 레코드 삽입

Eloquent를 사용할 때는, 데이터베이스에서 모델만 조회하는 것이 아니라 새로운 레코드를 삽입하는 작업도 필요합니다. Eloquent 덕분에 이러한 작업을 매우 간단하게 처리할 수 있습니다. 새로운 레코드를 삽입하려면 새 모델 인스턴스를 생성한 뒤, 원하는 속성을 지정하고, `save` 메서드를 호출하면 됩니다.

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
     * Store a new flight in the database.
     */
    public function store(Request $request): RedirectResponse
    {
        // 요청값 유효성 검사...

        $flight = new Flight;

        $flight->name = $request->name;

        $flight->save();

        return redirect('/flights');
    }
}
```

이 예시에서는, HTTP 요청으로부터 들어온 `name` 값을 `App\Models\Flight` 모델 인스턴스의 `name` 속성에 할당했습니다. 그리고 `save` 메서드를 호출하면 해당 레코드가 데이터베이스에 삽입됩니다. 이때 모델의 `created_at`과 `updated_at` 타임스탬프도 자동으로 설정되므로, 수동으로 별도 지정할 필요가 없습니다.

또한, `create` 메서드를 사용하면 하나의 PHP 문장으로 새로운 모델을 "저장"할 수도 있습니다. `create` 메서드는 저장된 모델 인스턴스를 반환합니다.

```
use App\Models\Flight;

$flight = Flight::create([
    'name' => 'London to Paris',
]);
```

단, `create` 메서드를 사용하려면 모델 클래스에 `fillable` 또는 `guarded` 속성(property)을 반드시 지정해야 합니다. 이는 기본적으로 Eloquent 모델이 대량 할당(vulnerabilities)로부터 보호되기 때문입니다. 대량 할당(mass assignment) 보안에 대한 자세한 내용은 [대량 할당 문서](#mass-assignment)를 참고하시기 바랍니다.

<a name="updates"></a>
### 레코드 수정

이미 데이터베이스에 존재하는 모델에 대해서도 `save` 메서드를 사용해 수정을 할 수 있습니다. 수정을 위해서는 먼저 모델을 조회한 다음, 원하는 속성을 지정해 수정합니다. 그리고 모델의 `save` 메서드를 호출하면 됩니다. 역시 `updated_at` 타임스탬프는 자동으로 갱신되므로 수동으로 지정할 필요가 없습니다.

```
use App\Models\Flight;

$flight = Flight::find(1);

$flight->name = 'Paris to London';

$flight->save();
```

<a name="mass-updates"></a>
#### 대량 업데이트

주어진 조건에 부합하는 여러 모델에 대해 한번에 업데이트를 수행할 수도 있습니다. 다음 예시에서는 `active` 값이 1이고, `destination`이 'San Diego'인 모든 항공편을 지연 상태로 표시합니다.

```
Flight::where('active', 1)
      ->where('destination', 'San Diego')
      ->update(['delayed' => 1]);
```

`update` 메서드는 수정할 컬럼과 값의 쌍을 배열로 받아 컬럼을 업데이트합니다. 반환값은 영향을 받은 레코드(행)의 수입니다.

> [!WARNING]
> Eloquent를 통해 대량 업데이트(mass update)를 수행할 때는, 수정 대상 모델에 대해 `saving`, `saved`, `updating`, `updated` 등의 모델 이벤트가 **실행되지 않습니다**. 이는 대량 업데이트 시 실제로 각 모델이 조회되어 처리되는 것이 아니기 때문입니다.

<a name="examining-attribute-changes"></a>
#### 속성 변경사항 확인

Eloquent는 모델의 내부 상태를 검사하고, 조회 후 모델 속성이 어떻게 변경되었는지 확인할 수 있도록 `isDirty`, `isClean`, `wasChanged` 메서드를 제공합니다.

`isDirty` 메서드는 특정 속성이 조회 후 변경되었는지 여부를 확인합니다. 특정 속성 이름이나 속성 이름 배열을 인수로 넘겨, 해당 속성 중 하나라도 "dirty"(값이 바뀐 상태)인지 검사할 수 있습니다. `isClean` 메서드는 속성이 조회 이후 변경되지 않았는지 여부를 확인하며, 마찬가지로 속성명을 인수로 넘길 수 있습니다.

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

`wasChanged` 메서드는 현재 요청 사이클에서 모델이 마지막으로 저장될 때, 어느 속성이라도 바뀌었는지 확인합니다. 필요하다면 속성 이름을 넘겨 해당 속성이 바뀐 것인지 개별적으로 확인할 수 있습니다.

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

`getOriginal` 메서드는 모델을 조회한 이후 변경된 사항과 관계없이, 원래 모델의 속성값을 담은 배열을 반환합니다. 선택적으로 특정 속성명을 넘기면 그 속성의 원래 값을 반환합니다.

```
$user = User::find(1);

$user->name; // John
$user->email; // john@example.com

$user->name = "Jack";
$user->name; // Jack

$user->getOriginal('name'); // John
$user->getOriginal(); // 원래 속성값 전체 배열...
```

<a name="mass-assignment"></a>
### 대량 할당(Mass Assignment)

하나의 PHP 구문으로 새로운 모델을 "저장"할 때 `create` 메서드를 사용할 수 있습니다. 이 메서드는 삽입된 모델 인스턴스를 반환합니다.

```
use App\Models\Flight;

$flight = Flight::create([
    'name' => 'London to Paris',
]);
```

단, 위에서 안내한 것처럼 `create` 메서드를 사용하기 전에, 반드시 모델 클래스에 `fillable` 또는 `guarded` 속성을 명시해야 합니다. 모든 Eloquent 모델은 대량 할당 취약점(mass assignment vulnerabilities)을 기본적으로 방지하기 위해 이러한 속성 설정이 필요합니다.

대량 할당 취약점은, 사용자가 예상치 못한 HTTP 요청 필드를 전송했을 때 발생할 수 있습니다. 예를 들어, 악의적인 사용자가 `is_admin` 파라미터를 HTTP 요청에 추가해서, 이 값이 모델의 `create` 메서드로 전달되어 데이터베이스 내에서 관리 권한을 갖게 될 수 있습니다.

따라서, 보호해야 할 속성 이외에 어떤 속성을 대량 할당 형태로 허용할지 직접 지정해야 합니다. 이를 위해 모델의 `$fillable` 속성에 대량 할당이 허용될 속성명을 배열로 정의합니다. 예를 들어, `Flight` 모델의 `name` 속성을 대량 할당 가능하게 만들려면 다음과 같이 설정합니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * 대량 할당이 가능한 속성 배열
     *
     * @var array
     */
    protected $fillable = ['name'];
}
```

`fillable` 속성을 설정한 뒤에는 `create` 메서드를 사용해 새로운 레코드를 삽입할 수 있으며, 반환값은 새로 생성된 모델 인스턴스입니다.

```
$flight = Flight::create(['name' => 'London to Paris']);
```

만약 이미 모델 인스턴스가 존재한다면, `fill` 메서드를 사용해 여러 속성을 배열로 한꺼번에 지정할 수 있습니다.

```
$flight->fill(['name' => 'Amsterdam to Frankfurt']);
```

<a name="mass-assignment-json-columns"></a>
#### 대량 할당과 JSON 컬럼

JSON 컬럼에 값을 할당할 때는 각 컬럼의 대량 할당용 키를 모델의 `$fillable` 배열에 반드시 포함시켜야 합니다. 보안을 위해, 라라벨은 `guarded` 속성을 사용할 때 중첩된 JSON 속성의 업데이트를 지원하지 않습니다.

```
/**
 * 대량 할당이 가능한 속성 배열
 *
 * @var array
 */
protected $fillable = [
    'options->enabled',
];
```

<a name="allowing-mass-assignment"></a>
#### 전체 속성 대량 할당 허용

모델의 모든 속성을 대량 할당 가능하게 만들고 싶다면, 모델의 `$guarded` 속성을 빈 배열로 정의하면 됩니다. 하지만 모델의 보호를 해제(unguard)할 경우, Eloquent의 `fill`, `create`, `update` 메서드에 전달하는 배열을 항상 신중하게 수작업으로 관리해야 합니다.

```
/**
 * 대량 할당이 불가능한 속성 배열
 *
 * @var array
 */
protected $guarded = [];
```

<a name="mass-assignment-exceptions"></a>
#### 대량 할당 예외

기본적으로 `$fillable` 배열에 포함되지 않은 속성은 대량 할당 연산 시 조용히 무시됩니다(silently discarded). 운영 환경에서는 이런 동작이 정상입니다. 그러나 개발 환경에서는 모델 변경이 적용되지 않아 혼란을 줄 수 있습니다.

원한다면, 라라벨이 안전하지 않은 속성에 대량 할당 시 예외를 발생시키도록 설정할 수 있습니다. 이를 위해 `preventSilentlyDiscardingAttributes` 메서드를 호출하세요. 이 메서드는 보통 애플리케이션 서비스 프로바이더의 `boot` 메서드에서 호출합니다.

```
use Illuminate\Database\Eloquent\Model;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Model::preventSilentlyDiscardingAttributes($this->app->isLocal());
}
```

<a name="upserts"></a>
### Upsert

때로는, 이미 존재하는 모델을 업데이트하거나, 해당 모델이 없으면 새로 생성하는 동작이 필요할 수 있습니다. `firstOrCreate`와 비슷하게 `updateOrCreate` 메서드는 모델을 저장(persist)하므로, 별도의 `save` 호출이 필요 없습니다.

아래 예시에서, 만약 `departure`가 `Oakland`이고, `destination`이 `San Diego`인 항공편이 이미 존재한다면, 해당 레코드의 `price` 및 `discounted` 컬럼이 수정됩니다. 만약 존재하지 않으면, 두 배열 인수의 값을 합쳐 새로운 항공편 레코드를 생성합니다.

```
$flight = Flight::updateOrCreate(
    ['departure' => 'Oakland', 'destination' => 'San Diego'],
    ['price' => 99, 'discounted' => 1]
);
```

만약 여러 개의 "upsert" 작업(여러 레코드의 대량 upsert)을 한 번에 처리하고 싶다면 `upsert` 메서드를 사용할 수 있습니다. 첫 번째 인수는 삽입 또는 업데이트할 값들의 집합이며, 두 번째 인수는 해당 테이블에서 레코드를 고유하게 식별하는 컬럼 목록입니다. 마지막 세 번째 인수는 이미 존재하는 경우 갱신될 컬럼 목록입니다. `upsert` 메서드는 타임스탬프가 설정되어 있을 경우 `created_at`, `updated_at` 필드도 자동으로 세팅합니다.

```
Flight::upsert([
    ['departure' => 'Oakland', 'destination' => 'San Diego', 'price' => 99],
    ['departure' => 'Chicago', 'destination' => 'New York', 'price' => 150]
], ['departure', 'destination'], ['price']);

```
> [!WARNING]
> SQL Server를 제외한 모든 데이터베이스는, `upsert` 메서드의 두 번째 인수로 넘기는 컬럼에 반드시 "primary" 또는 "unique" 인덱스가 생성되어 있어야 합니다. 또한, MySQL 데이터베이스 드라이버는 `upsert` 메서드의 두 번째 인수를 무시하고, 테이블의 "primary"/"unique" 인덱스를 사용해 기존 레코드를 판별합니다.

<a name="deleting-models"></a>
## 모델 삭제

모델을 삭제하려면, 모델 인스턴스에서 `delete` 메서드를 호출하면 됩니다.

```
use App\Models\Flight;

$flight = Flight::find(1);

$flight->delete();
```

모델의 모든 관련 데이터베이스 레코드를 삭제하려면 `truncate` 메서드를 사용할 수 있습니다. `truncate` 작업은 관련 테이블의 자동 증가 ID도 함께 초기화합니다.

```
Flight::truncate();
```

<a name="deleting-an-existing-model-by-its-primary-key"></a>
#### 기본키로 기존 모델 삭제

앞선 예시에서는 먼저 데이터베이스에서 모델을 조회한 뒤, `delete`를 호출했습니다. 하지만, 만약 해당 모델의 기본 키를 알고 있다면, `destroy` 메서드를 이용해 별도의 조회 없이 바로 삭제할 수 있습니다. `destroy`는 단일 기본키뿐 아니라, 다수의 기본키, 기본키 배열, [컬렉션](/docs/10.x/collections) 형태까지 모두 인자로 받을 수 있습니다.

```
Flight::destroy(1);

Flight::destroy(1, 2, 3);

Flight::destroy([1, 2, 3]);

Flight::destroy(collect([1, 2, 3]));
```

> [!WARNING]
> `destroy` 메서드는 각 모델을 개별적으로 불러와서 `delete` 메서드를 호출합니다. 이로 인해, 각 모델에 대해 `deleting`, `deleted` 이벤트가 올바르게 발생합니다.

<a name="deleting-models-using-queries"></a>
#### 쿼리를 이용한 모델 삭제

원한다면 Eloquent 쿼리를 작성하여, 쿼리 조건에 부합하는 모든 모델을 한 번에 삭제할 수 있습니다. 예를 들어, 비활성화된 모든 항공편을 삭제할 수 있습니다. 대량 업데이트(mass update)와 마찬가지로, 대량 삭제는 삭제된 모델에 대해 모델 이벤트가 발생하지 않습니다.

```
$deleted = Flight::where('active', 0)->delete();
```

> [!WARNING]
> Eloquent를 통해 대량 삭제(mass delete) 구문을 실행할 때는, 삭제 대상 모델에 대해 `deleting`, `deleted` 모델 이벤트가 **실행되지 않습니다**. 이는 대량 삭제 시 실제로 각 모델을 조회하는 과정 없이, 바로 삭제가 일어나기 때문입니다.

<a name="soft-deleting"></a>
### 소프트 삭제(Soft Deleting)

데이터베이스에서 실제로 레코드를 삭제하는 것 외에도, Eloquent는 "소프트 삭제"도 지원합니다. 소프트 삭제된 모델은 실제로 데이터베이스에서 제거되지 않고, 대신 `deleted_at` 속성에 "삭제된 시각"이 저장됩니다. 소프트 삭제를 활성화하려면 모델에 `Illuminate\Database\Eloquent\SoftDeletes` 트레이트를 추가하면 됩니다.

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
> `SoftDeletes` 트레이트는 `deleted_at` 속성을 자동으로 `DateTime` / `Carbon` 인스턴스로 변환해줍니다.

그리고 데이터베이스 테이블에 `deleted_at` 컬럼도 추가해야 합니다. 라라벨 [스키마 빌더](/docs/10.x/migrations)에는 이 컬럼을 편리하게 생성할 수 있는 헬퍼 메서드가 준비되어 있습니다.

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

이제 모델에서 `delete` 메서드를 호출하면, `deleted_at` 컬럼이 현재 날짜/시간으로 설정됩니다. 하지만 실제로 데이터베이스 레코드는 테이블에 남아 있게 됩니다. 소프트 삭제가 적용된 모델을 조회할 때는, 소프트 삭제된 레코드는 기본적으로 쿼리 결과에서 자동으로 제외됩니다.

특정 모델 인스턴스가 소프트 삭제되었는지 확인하려면, `trashed` 메서드를 사용할 수 있습니다.

```
if ($flight->trashed()) {
    // ...
}
```

<a name="restoring-soft-deleted-models"></a>
#### 소프트 삭제된 모델 복구

가끔 소프트 삭제된 모델을 다시 "복구"하고 싶을 때가 있습니다. 소프트 삭제된 모델의 인스턴스에서 `restore` 메서드를 호출하면 `deleted_at` 컬럼이 `null`로 되돌아갑니다.

```
$flight->restore();
```

또한, 쿼리로 여러 모델을 한꺼번에 복구할 수도 있습니다. 이 경우, 다른 대량 작업과 마찬가지로 복구 모델에 대해 이벤트가 발생하지 않습니다.

```
Flight::withTrashed()
        ->where('airline_id', 1)
        ->restore();
```

`restore` 메서드는 [연관관계](/docs/10.x/eloquent-relationships) 쿼리를 작성할 때도 사용할 수 있습니다.

```
$flight->history()->restore();
```

<a name="permanently-deleting-models"></a>
#### 모델 완전 삭제(영구 삭제)

데이터베이스에서 모델을 완전히 제거해야 할 경우, `forceDelete` 메서드를 사용하면 소프트 삭제 모델도 완전히 삭제할 수 있습니다.

```
$flight->forceDelete();
```

이 메서드는 Eloquent 연관관계 쿼리에서도 사용할 수 있습니다.

```
$flight->history()->forceDelete();
```

<a name="querying-soft-deleted-models"></a>
### 소프트 삭제 모델 쿼리

<a name="including-soft-deleted-models"></a>
#### 소프트 삭제 모델 포함해 조회

앞서 설명한 대로, 소프트 삭제된 모델은 쿼리 결과에서 기본적으로 제외됩니다. 그러나, `withTrashed` 메서드를 쿼리에서 사용하면 소프트 삭제 레코드도 결과에 포함시킬 수 있습니다.

```
use App\Models\Flight;

$flights = Flight::withTrashed()
                ->where('account_id', 1)
                ->get();
```

`withTrashed` 메서드는 [연관관계](/docs/10.x/eloquent-relationships) 쿼리에서도 사용할 수 있습니다.

```
$flight->history()->withTrashed()->get();
```

<a name="retrieving-only-soft-deleted-models"></a>

#### 소프트 삭제된 모델만 조회하기

`onlyTrashed` 메서드를 사용하면 **오직** 소프트 삭제된 모델만 조회할 수 있습니다.

```
$flights = Flight::onlyTrashed()
                ->where('airline_id', 1)
                ->get();
```

<a name="pruning-models"></a>
## 모델 가지치기(Pruning Models)

주기적으로 더 이상 필요하지 않은 모델을 삭제해야 할 경우가 있습니다. 이를 위해 가지치기를 원하는 모델에 `Illuminate\Database\Eloquent\Prunable` 또는 `Illuminate\Database\Eloquent\MassPrunable` 트레이트를 추가할 수 있습니다. 트레이트를 모델에 추가한 뒤, 더 이상 필요하지 않은 모델을 판별할 수 있는 Eloquent 쿼리 빌더를 반환하는 `prunable` 메서드를 구현합니다.

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
     * 가지치기할 모델 쿼리를 반환합니다.
     */
    public function prunable(): Builder
    {
        return static::where('created_at', '<=', now()->subMonth());
    }
}
```

모델에 `Prunable`을 지정한 경우, 모델에서 `pruning` 메서드를 추가로 정의할 수 있습니다. 이 메서드는 모델이 삭제되기 전에 호출되며, 영구적으로 모델이 데이터베이스에서 삭제되기 전에 파일 등 모델에 연관된 기타 리소스를 정리할 때 유용합니다.

```
/**
 * 모델을 가지치기 전에 준비합니다.
 */
protected function pruning(): void
{
    // ...
}
```

가지치기할 모델 구성이 끝나면, 애플리케이션의 `App\Console\Kernel` 클래스에서 `model:prune` Artisan 명령어를 스케줄링해야 합니다. 이 명령어가 실행될 적절한 간격은 자유롭게 지정할 수 있습니다.

```
/**
 * 애플리케이션 명령어 스케줄을 정의합니다.
 */
protected function schedule(Schedule $schedule): void
{
    $schedule->command('model:prune')->daily();
}
```

`model:prune` 명령어는 내부적으로 애플리케이션의 `app/Models` 디렉토리에서 "Prunable" 모델을 자동으로 감지합니다. 만약 모델이 다른 경로에 있다면, `--model` 옵션으로 모델 클래스명을 직접 지정할 수 있습니다.

```
$schedule->command('model:prune', [
    '--model' => [Address::class, Flight::class],
])->daily();
```

가지치기 시에 특정 모델은 제외하고 나머지 감지된 모든 모델을 가지치기하려면 `--except` 옵션을 사용할 수 있습니다.

```
$schedule->command('model:prune', [
    '--except' => [Address::class, Flight::class],
])->daily();
```

`prunable` 쿼리가 의도한 대로 동작하는지 테스트하려면, `model:prune` 명령어를 `--pretend` 옵션과 함께 실행하면 됩니다. 이 옵션을 사용하면 실제로 명령어가 실행된다면 몇 개의 레코드가 삭제될 것인지 결과만 알려줍니다.

```shell
php artisan model:prune --pretend
```

> [!WARNING]
> 소프트 삭제된 모델이 prunable 쿼리에 해당된다면, 해당 모델은 영구적으로 삭제(`forceDelete`)됩니다.

<a name="mass-pruning"></a>
#### 대량 가지치기(Mass Pruning)

모델에 `Illuminate\Database\Eloquent\MassPrunable` 트레이트를 적용한 경우, 대량 삭제 쿼리를 사용해 모델이 데이터베이스에서 삭제됩니다. 이때 `pruning` 메서드는 호출되지 않으며, `deleting` 및 `deleted` 모델 이벤트도 발생하지 않습니다. 이는 삭제 전에 실제로 모델을 조회하지 않기 때문에, 가지치기 작업이 훨씬 더 빠르게 진행됩니다.

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
     * 가지치기할 모델 쿼리를 반환합니다.
     */
    public function prunable(): Builder
    {
        return static::where('created_at', '<=', now()->subMonth());
    }
}
```

<a name="replicating-models"></a>
## 모델 복제(Replicating Models)

이미 존재하는 모델 인스턴스를 `replicate` 메서드로 저장되지 않은 복사본으로 만들 수 있습니다. 이 방법은 여러 속성이 유사한 모델 인스턴스를 사용할 때 특히 유용합니다.

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

복제 시 일부 속성을 제외하고 싶다면, 제외할 속성명을 배열로 `replicate` 메서드에 전달할 수 있습니다.

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

전역 스코프를 사용하면 특정 모델에 대한 모든 쿼리에 제약 조건을 추가할 수 있습니다. 라라벨의 [소프트 삭제](#soft-deleting) 기능도 전역 스코프를 활용하여 데이터베이스에서 "삭제되지 않은" 모델만 조회하도록 동작합니다. 직접 전역 스코프를 작성하면, 특정 모델에 대한 모든 쿼리에 원하는 제약 조건을 간편하게 적용할 수 있습니다.

<a name="generating-scopes"></a>
#### 스코프 생성하기

새로운 전역 스코프를 생성하려면 `make:scope` Artisan 명령어를 실행합니다. 생성된 스코프 클래스는 애플리케이션의 `app/Models/Scopes` 디렉토리에 저장됩니다.

```shell
php artisan make:scope AncientScope
```

<a name="writing-global-scopes"></a>
#### 전역 스코프 작성하기

전역 스코프를 작성하는 방법은 간단합니다. 먼저 `make:scope` 명령어로 `Illuminate\Database\Eloquent\Scope` 인터페이스를 구현하는 클래스를 생성합니다. `Scope` 인터페이스는 하나의 메서드, `apply`,만 구현하면 됩니다. `apply` 메서드에서 쿼리에 필요한 `where` 조건이나 기타 절을 추가하면 됩니다.

```
<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class AncientScope implements Scope
{
    /**
     * Eloquent 쿼리 빌더에 스코프를 적용합니다.
     */
    public function apply(Builder $builder, Model $model): void
    {
        $builder->where('created_at', '<', now()->subYears(2000));
    }
}
```

> [!NOTE]
> 전역 스코프가 쿼리의 select 절에 컬럼을 추가하는 경우 `select` 대신 `addSelect` 메서드를 사용해야 합니다. 그래야 기존 select 절이 의도치 않게 대체되는 일을 방지할 수 있습니다.

<a name="applying-global-scopes"></a>
#### 전역 스코프 적용하기

모델에 전역 스코프를 지정하려면, 해당 모델에 `ScopedBy` 속성을 추가하면 됩니다.

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

또는, 모델의 `booted` 메서드를 오버라이드한 뒤 모델의 `addGlobalScope` 메서드를 직접 호출해서 전역 스코프를 등록할 수도 있습니다. `addGlobalScope` 메서드는 스코프 인스턴스를 인자로 받습니다.

```
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

위 예제처럼 `App\Models\User` 모델에 스코프를 추가하면, `User::all()` 메서드를 호출할 때 아래와 같은 SQL 쿼리가 실행됩니다.

```sql
select * from `users` where `created_at` < 0021-02-18 00:00:00
```

<a name="anonymous-global-scopes"></a>
#### 익명 전역 스코프

Eloquent에서는 클래스 없이 클로저(익명 함수)만으로도 전역 스코프를 정의할 수 있습니다. 이 방법은 간단한 스코프를 사용할 때 클래스 파일을 따로 만들지 않아도 되어 유용합니다. 클로저를 이용해 전역 스코프를 정의할 때는, `addGlobalScope` 메서드의 첫 번째 인자로 원하는 스코프 이름을 문자열로 지정해야 합니다.

```
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
#### 전역 스코프 해제하기

특정 쿼리에서 전역 스코프를 제거하고 싶다면, `withoutGlobalScope` 메서드를 사용합니다. 이 메서드는 전역 스코프 클래스명을 인자로 받습니다.

```
User::withoutGlobalScope(AncientScope::class)->get();
```

만약 전역 스코프를 클로저로 정의했다면, 등록할 때 지정했던 문자열 스코프 이름을 인자로 넘겨줘야 합니다.

```
User::withoutGlobalScope('ancient')->get();
```

여러 개 또는 모든 전역 스코프를 제거하고 싶은 경우, `withoutGlobalScopes` 메서드를 사용할 수 있습니다.

```
// 모든 전역 스코프 제거
User::withoutGlobalScopes()->get();

// 일부 전역 스코프만 제거
User::withoutGlobalScopes([
    FirstScope::class, SecondScope::class
])->get();
```

<a name="local-scopes"></a>
### 지역 스코프(Local Scopes)

지역 스코프를 사용하면, 애플리케이션 내에서 반복적으로 사용되는 쿼리 제약 조건 집합을 재사용할 수 있습니다. 예를 들어 "인기 있는(popular)" 사용자만 자주 조회하고 싶을 수 있습니다. 스코프를 정의하려면, Eloquent 모델 메서드에 `scope` 접두어를 붙여 만드십시오.

스코프 메서드는 항상 쿼리 빌더 인스턴스 또는 `void`를 반환해야 합니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 쿼리를 인기 있는 사용자로만 제한하는 스코프입니다.
     */
    public function scopePopular(Builder $query): void
    {
        $query->where('votes', '>', 100);
    }

    /**
     * 쿼리를 활성 사용자로만 제한하는 스코프입니다.
     */
    public function scopeActive(Builder $query): void
    {
        $query->where('active', 1);
    }
}
```

<a name="utilizing-a-local-scope"></a>
#### 지역 스코프 사용하기

스코프를 정의한 뒤에는, 모델을 쿼리할 때 해당 스코프 메서드를 호출할 수 있습니다. 이때 `scope` 접두어는 생략하고 사용합니다. 여러 스코프를 체이닝해서 사용할 수도 있습니다.

```
use App\Models\User;

$users = User::popular()->active()->orderBy('created_at')->get();
```

여러 개의 Eloquent 모델 스코프를 `or` 쿼리 연산자와 함께 조합하려면, [논리적 그룹화](/docs/10.x/queries#logical-grouping)를 위해 클로저를 사용해야 할 수 있습니다.

```
$users = User::popular()->orWhere(function (Builder $query) {
    $query->active();
})->get();
```

하지만 이렇게 하는 것이 번거로울 수 있으므로, 라라벨에서는 클로저 없이도 스코프를 유연하게 연결할 수 있도록 "하이어 오더" `orWhere` 메서드를 제공합니다.

```
$users = User::popular()->orWhere->active()->get();
```

<a name="dynamic-scopes"></a>
#### 동적 스코프(Dynamic Scopes)

경우에 따라 파라미터를 받아서 동작하는 스코프를 정의하고 싶을 수 있습니다. 이 경우, 스코프 메서드 시그니처의 `$query` 파라미터 뒤에 추가로 원하는 파라미터를 선언하면 됩니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 특정 타입의 사용자만 쿼리하는 스코프입니다.
     */
    public function scopeOfType(Builder $query, string $type): void
    {
        $query->where('type', $type);
    }
}
```

이제 스코프 메서드에 정의된 파라미터 개수에 맞춰, 스코프를 호출할 때 값을 전달하면 됩니다.

```
$users = User::ofType('admin')->get();
```

<a name="comparing-models"></a>
## 모델 비교(Comparing Models)

두 모델이 같은 모델 객체인지 판별해야 할 때가 있습니다. `is` 및 `isNot` 메서드는 두 모델이 동일한 기본키(primary key), 테이블, 그리고 데이터베이스 연결까지 모두 같은지 신속하게 확인할 수 있습니다.

```
if ($post->is($anotherPost)) {
    // ...
}

if ($post->isNot($anotherPost)) {
    // ...
}
```

`is` 및 `isNot` 메서드는 `belongsTo`, `hasOne`, `morphTo`, `morphOne` [연관관계](/docs/10.x/eloquent-relationships)에서도 사용할 수 있습니다. 이 기능은 연관된 모델을 굳이 쿼리해서 가져오지 않고도 두 모델을 비교할 수 있어서 유용합니다.

```
if ($post->author()->is($user)) {
    // ...
}
```

<a name="events"></a>
## 이벤트(Events)

> [!NOTE]
> Eloquent 모델 이벤트를 클라이언트 측 애플리케이션으로 바로 브로드캐스트하고 싶으신가요? 라라벨의 [모델 이벤트 브로드캐스팅](/docs/10.x/broadcasting#model-broadcasting) 문서를 참고하세요.

Eloquent 모델은 여러 이벤트를 발생시키며, 이를 통해 모델 생명주기의 다양한 시점에 후킹할 수 있습니다. 대표적으로 다음 이벤트들이 있습니다: `retrieved`, `creating`, `created`, `updating`, `updated`, `saving`, `saved`, `deleting`, `deleted`, `trashed`, `forceDeleting`, `forceDeleted`, `restoring`, `restored`, `replicating`.

* `retrieved`: 데이터베이스에서 기존 모델을 조회할 때 발생합니다.
* `creating`, `created`: 새 모델을 처음 저장할 때 발생합니다.
* `updating` / `updated`: 기존 모델이 수정되고 `save` 메서드가 호출될 때 발생합니다.
* `saving` / `saved`: 모델을 생성하거나 수정할 때 (속성이 실제로 변경되지 않았어도) 발생합니다.

이벤트 이름이 `-ing`로 끝나면 변경 사항이 실제로 반영되기 **전**에, `-ed`로 끝나면 변경 사항 반영이 완료된 **후**에 발생합니다.

모델 이벤트를 리스닝하려면, Eloquent 모델에 `$dispatchesEvents` 프로퍼티를 정의하세요. 이 프로퍼티에 모델 생명주기의 각 지점과 연결할 [이벤트 클래스](/docs/10.x/events)를 매핑합니다. 각 모델 이벤트 클래스는 생성자를 통해 영향을 받는 모델 인스턴스를 전달받아야 합니다.

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
     * 모델 이벤트 맵
     *
     * @var array
     */
    protected $dispatchesEvents = [
        'saved' => UserSaved::class,
        'deleted' => UserDeleted::class,
    ];
}
```

이처럼 Eloquent 이벤트를 정의하고 매핑한 후에는, [이벤트 리스너](/docs/10.x/events#defining-listeners)로 실제 이벤트를 처리할 수 있습니다.

> [!WARNING]
> Eloquent를 통해 대량의 update 또는 delete 쿼리를 실행할 경우, 해당 모델 이벤트(`saved`, `updated`, `deleting`, `deleted`)는 발생하지 않습니다. 이는 대량 연산 시 모델이 실제로 조회되지 않기 때문입니다.

<a name="events-using-closures"></a>
### 클로저를 활용한 이벤트 리스닝

별도의 이벤트 클래스 대신, 다양한 모델 이벤트가 발생할 때 실행할 클로저를 등록할 수도 있습니다. 보통 이 클로저 등록은 모델의 `booted` 메서드에서 수행합니다.

```
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

필요하다면 [큐 처리 가능한 익명 이벤트 리스너](/docs/10.x/events#queuable-anonymous-event-listeners)도 활용할 수 있습니다. 이를 통해 라라벨이 이벤트 리스너를 애플리케이션의 [큐](/docs/10.x/queues)에서 백그라운드로 실행할 수 있습니다.

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

하나의 모델에서 여러 이벤트를 듣고 싶다면, 옵저버 클래스를 만들어 관련 리스너들을 하나의 클래스에 모을 수 있습니다. 옵저버 클래스에는 리스닝할 Eloquent 이벤트와 일치하는 이름의 메서드를 만듭니다. 각 메서드는 영향을 받는 모델 인스턴스를 인자로 받습니다. 새로운 옵저버 클래스를 만들 때는 `make:observer` Artisan 명령어를 사용하면 가장 편리합니다.

```shell
php artisan make:observer UserObserver --model=User
```

이 명령어를 실행하면, 새로운 옵저버 클래스가 `app/Observers` 디렉터리에 생성됩니다. 해당 디렉터리가 없다면 Artisan이 자동으로 만들어줍니다. 생성된 기본 옵저버는 아래와 같습니다.

```
<?php

namespace App\Observers;

use App\Models\User;

class UserObserver
{
    /**
     * User "created" 이벤트를 처리합니다.
     */
    public function created(User $user): void
    {
        // ...
    }

    /**
     * User "updated" 이벤트를 처리합니다.
     */
    public function updated(User $user): void
    {
        // ...
    }

    /**
     * User "deleted" 이벤트를 처리합니다.
     */
    public function deleted(User $user): void
    {
        // ...
    }
    
    /**
     * User "restored" 이벤트를 처리합니다.
     */
    public function restored(User $user): void
    {
        // ...
    }

    /**
     * User "forceDeleted" 이벤트를 처리합니다.
     */
    public function forceDeleted(User $user): void
    {
        // ...
    }
}
```

옵저버를 등록하려면 해당 모델에 `ObservedBy` 속성을 추가합니다.

```
use App\Observers\UserObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;

#[ObservedBy([UserObserver::class])]
class User extends Authenticatable
{
    //
}
```

또는, 옵저버로 등록하려는 모델의 `observe` 메서드를 직접 호출해서 수동으로 등록할 수도 있습니다. 보통 애플리케이션의 `App\Providers\EventServiceProvider` 서비스 프로바이더의 `boot` 메서드에서 옵저버를 등록합니다.

```
use App\Models\User;
use App\Observers\UserObserver;

/**
 * 애플리케이션 이벤트를 등록합니다.
 */
public function boot(): void
{
    User::observe(UserObserver::class);
}
```

> [!NOTE]
> 옵저버가 리스닝할 수 있는 추가 이벤트가 있습니다. 예를 들어 `saving`, `retrieved` 등인데, 상세 목록은 [이벤트](#events) 문서에 나와 있습니다.

<a name="observers-and-database-transactions"></a>

#### 옵저버와 데이터베이스 트랜잭션

모델이 데이터베이스 트랜잭션 내에서 생성될 때, 옵저버의 이벤트 핸들러를 데이터베이스 트랜잭션이 **커밋된 이후에만** 실행하도록 지정하고 싶을 수 있습니다. 이를 위해 옵저버 클래스에서 `ShouldHandleEventsAfterCommit` 인터페이스를 구현하면 됩니다. 만약 데이터베이스 트랜잭션이 진행 중이 아니라면, 이벤트 핸들러는 즉시 실행됩니다.

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
### 이벤트 일시 비활성화

특정 상황에서는 모델에서 발생하는 **모든 이벤트를 일시적으로 "비활성화"**(mute)하고 싶을 때가 있습니다. 이럴 때는 `withoutEvents` 메서드를 사용할 수 있습니다. `withoutEvents` 메서드는 하나의 클로저를 인수로 받으며, 해당 클로저 블록 내에서 실행되는 모든 코드에 대해 모델 이벤트가 발생하지 않습니다. 또한, 클로저에서 반환된 값이 그대로 `withoutEvents` 메서드의 반환값이 됩니다.

```
use App\Models\User;

$user = User::withoutEvents(function () {
    User::findOrFail(1)->delete();

    return User::find(2);
});
```

<a name="saving-a-single-model-without-events"></a>
#### 단일 모델을 이벤트 없이 저장하기

특정 모델 인스턴스를 저장할 때, **이벤트를 발생시키지 않고 저장**하고 싶은 경우가 있습니다. 이럴 때는 `saveQuietly` 메서드를 사용하면 됩니다.

```
$user = User::findOrFail(1);

$user->name = 'Victoria Faith';

$user->saveQuietly();
```

마찬가지로, 주어진 모델에 대해 "update", "delete", "soft delete", "restore", "replicate" 등의 동작도 이벤트를 발생시키지 않고 수행할 수 있습니다.

```
$user->deleteQuietly();
$user->forceDeleteQuietly();
$user->restoreQuietly();
```