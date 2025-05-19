# Eloquent: 시작하기 (Eloquent: Getting Started)

- [소개](#introduction)
- [모델 클래스 생성](#generating-model-classes)
- [Eloquent 모델 관례](#eloquent-model-conventions)
    - [테이블명](#table-names)
    - [기본 키](#primary-keys)
    - [UUID 및 ULID 키](#uuid-and-ulid-keys)
    - [타임스탬프](#timestamps)
    - [데이터베이스 커넥션](#database-connections)
    - [속성의 기본값](#default-attribute-values)
    - [Eloquent 엄격성 설정](#configuring-eloquent-strictness)
- [모델 조회하기](#retrieving-models)
    - [컬렉션](#collections)
    - [결과 청킹(Chunking)](#chunking-results)
    - [Lazy 컬렉션을 이용한 청킹](#chunking-using-lazy-collections)
    - [커서 사용하기](#cursors)
    - [고급 서브쿼리](#advanced-subqueries)
- [단일 모델 및 집계값 조회](#retrieving-single-models)
    - [모델을 조회하거나 생성하기](#retrieving-or-creating-models)
    - [집계값 조회하기](#retrieving-aggregates)
- [모델 삽입 및 수정](#inserting-and-updating-models)
    - [삽입](#inserts)
    - [수정](#updates)
    - [대량 할당](#mass-assignment)
    - [Upsert](#upserts)
- [모델 삭제하기](#deleting-models)
    - [소프트 삭제](#soft-deleting)
    - [소프트 삭제된 모델 쿼리하기](#querying-soft-deleted-models)
- [모델 가지치기](#pruning-models)
- [모델 복제](#replicating-models)
- [쿼리 스코프](#query-scopes)
    - [글로벌 스코프](#global-scopes)
    - [로컬 스코프](#local-scopes)
- [모델 비교](#comparing-models)
- [이벤트](#events)
    - [클로저 사용하기](#events-using-closures)
    - [옵저버](#observers)
    - [이벤트 음소거](#muting-events)

<a name="introduction"></a>
## 소개

라라벨은 데이터베이스와 즐겁게 상호작용할 수 있도록 해주는 객체 관계 매퍼(ORM)인 Eloquent를 포함하고 있습니다. Eloquent를 사용할 때, 각 데이터베이스 테이블은 그 테이블과 상호작용하는 "모델(Model)" 클래스를 갖게 됩니다. Eloquent 모델을 사용하면 데이터베이스 테이블에서 레코드를 조회할 뿐만 아니라, 레코드를 삽입, 수정, 삭제하는 작업도 수행할 수 있습니다.

> [!NOTE]
> 시작하기 전에, 애플리케이션의 `config/database.php` 구성 파일에서 데이터베이스 커넥션을 반드시 설정해야 합니다. 데이터베이스 설정에 대한 자세한 내용은 [데이터베이스 구성 문서](/docs/9.x/database#configuration)를 참고하세요.

#### 라라벨 부트캠프

라라벨을 처음 접한다면 [라라벨 부트캠프](https://bootcamp.laravel.com)에서 바로 시작해보셔도 좋습니다. 라라벨 부트캠프는 Eloquent를 사용하여 첫 번째 라라벨 애플리케이션을 만드는 과정을 단계별로 안내합니다. 라라벨과 Eloquent의 다양한 기능을 빠르게 체험해보기 좋은 방법입니다.

<a name="generating-model-classes"></a>
## 모델 클래스 생성

이제 Eloquent 모델을 한번 만들어보겠습니다. 모델 클래스는 일반적으로 `app\Models` 디렉터리에 위치하며, `Illuminate\Database\Eloquent\Model` 클래스를 확장합니다. [Artisan 명령어](/docs/9.x/artisan)인 `make:model`을 사용하여 새 모델을 생성할 수 있습니다.

```shell
php artisan make:model Flight
```

모델을 생성할 때 [데이터베이스 마이그레이션](/docs/9.x/migrations)도 함께 생성하고 싶다면, `--migration` 또는 `-m` 옵션을 사용할 수 있습니다.

```shell
php artisan make:model Flight --migration
```

모델 생성 시 팩토리, 시더, 폴리시, 컨트롤러, 폼 요청 등 다양한 유형의 클래스도 함께 생성할 수 있습니다. 이러한 옵션들을 조합하여 여러 클래스를 한 번에 생성하는 것도 가능합니다.

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

# 모델, FlightController 리소스 클래스, 폼 요청 클래스들 생성...
php artisan make:model Flight --controller --resource --requests
php artisan make:model Flight -crR

# 모델과 FlightPolicy 클래스 생성...
php artisan make:model Flight --policy

# 모델, 마이그레이션, 팩토리, 시더, 컨트롤러 한 번에 생성...
php artisan make:model Flight -mfsc

# 모든 관련 클래스(모델, 마이그레이션, 팩토리, 시더, 폴리시, 컨트롤러, 폼 요청) 한 번에 생성하는 단축키...
php artisan make:model Flight --all

# 피벗 모델 생성...
php artisan make:model Member --pivot
```

<a name="inspecting-models"></a>
#### 모델 속성 및 연관관계 확인

모델 코드만 훑어봐서는 어느 속성(attribute)과 연관관계(relation)가 정의되어 있는지 파악하기 어려운 경우가 있습니다. 이럴 땐 `model:show` Artisan 명령어를 사용해 모델의 속성과 관계를 한눈에 확인할 수 있습니다.

```shell
php artisan model:show Flight
```

<a name="eloquent-model-conventions"></a>
## Eloquent 모델 관례

`make:model` 명령어로 생성된 모델은 `app/Models` 디렉터리에 위치하게 됩니다. 기본적인 모델 클래스를 살펴보며, Eloquent의 주요 관례 몇 가지를 알아보겠습니다.

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
### 테이블명

위 예시에서 보듯이, 우리는 `Flight` 모델이 어떤 데이터베이스 테이블과 연결되는지 별도로 지정하지 않았습니다. Eloquent는 관례적으로 "스네이크 케이스" 복수형(class명)을 테이블명으로 사용합니다. 예를 들어, 위의 경우 `Flight` 모델은 `flights` 테이블에 레코드를 저장한다고 간주하고, `AirTrafficController` 모델은 `air_traffic_controllers` 테이블을 사용한다고 판단합니다.

만약 모델과 연결할 데이터베이스 테이블이 이 관례를 따르지 않는다면, 모델의 `table` 속성을 통해 테이블명을 직접 지정할 수 있습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * 모델과 연결된 테이블명입니다.
     *
     * @var string
     */
    protected $table = 'my_flights';
}
```

<a name="primary-keys"></a>
### 기본 키

Eloquent는 각 모델이 연결된 데이터베이스 테이블에 기본 키 컬럼명이 `id`일 것이라 가정합니다. 만약 기본 키로 사용할 컬럼명이 다르다면, 모델에 `protected $primaryKey` 속성을 정의하여 사용할 기본 키 컬럼명을 지정할 수 있습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * 테이블의 기본 키입니다.
     *
     * @var string
     */
    protected $primaryKey = 'flight_id';
}
```

기본적으로 Eloquent는 기본 키가 자동 증가하는 정수(integer) 값이라고 가정하며, 기본 키 값을 자동으로 정수로 캐스팅합니다. 만약 숫자가 아니거나 자동 증가하지 않는 기본 키를 사용하려면, 모델에 `public $incrementing` 속성을 `false`로 지정해야 합니다.

```
<?php

class Flight extends Model
{
    /**
     * 모델의 ID가 자동 증가하는 값인지 여부를 지정합니다.
     *
     * @var bool
     */
    public $incrementing = false;
}
```

기본 키 컬럼이 정수가 아닌 경우에는 모델에 `protected $keyType` 속성을 정의하여 해당 데이터 타입을 `string`으로 설정해야 합니다.

```
<?php

class Flight extends Model
{
    /**
     * 자동 증가하는 ID의 데이터 타입입니다.
     *
     * @var string
     */
    protected $keyType = 'string';
}
```

<a name="composite-primary-keys"></a>
#### "복합" 기본 키(Composite Primary Keys)

Eloquent는 각 모델에 최소 하나의 고유 "ID"가 존재하여 기본 키로 사용될 수 있어야 한다고 요구합니다. 여러 컬럼을 조합한 "복합 기본 키"는 Eloquent 모델에서 지원하지 않습니다. 대신, 데이터베이스 테이블에는 단일 기본 키 외에 여러 컬럼을 조합한 unique 인덱스를 추가할 수 있습니다.

<a name="uuid-and-ulid-keys"></a>
### UUID 및 ULID 키

기본적으로 Eloquent 모델의 기본 키로는 자동 증가하는 정수 값을 사용하지만, UUID도 사용할 수 있습니다. UUID는 36자 길이의 전역적으로 고유한 영숫자 식별자입니다.

모델에서 자동 증가 정수 대신 UUID를 기본 키로 사용하고 싶다면 `Illuminate\Database\Eloquent\Concerns\HasUuids` 트레잇(trait)을 모델에 적용하세요. 이 때, 모델에 [UUID에 해당하는 기본 키 컬럼](/docs/9.x/migrations#column-method-uuid)이 반드시 있어야 합니다.

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

기본적으로 `HasUuids` 트레잇은 ["정렬가능한(Ordered) UUID"](/docs/9.x/helpers#method-str-ordered-uuid)를 생성합니다. 이러한 UUID는 사전식(lexicographical)으로 정렬할 수 있으므로, 데이터베이스 인덱싱에 더 효율적입니다.

모델에 `newUniqueId` 메서드를 정의하면 UUID 생성 방식을 오버라이드(재정의)할 수 있습니다. 또한 `uniqueIds` 메서드를 정의하여 어떤 컬럼에 UUID를 할당할지 지정할 수도 있습니다.

```
use Ramsey\Uuid\Uuid;

/**
 * 모델에 대해 새로운 UUID를 생성합니다.
 *
 * @return string
 */
public function newUniqueId()
{
    return (string) Uuid::uuid4();
}

/**
 * 고유 식별자를 부여할 컬럼 목록을 반환합니다.
 *
 * @return array
 */
public function uniqueIds()
{
    return ['id', 'discount_code'];
}
```

원한다면 UUID 대신 "ULID"도 사용할 수 있습니다. ULID는 UUID와 유사하지만, 26자리만 사용합니다. 정렬 가능한 UUID처럼 ULID도 사전식(lexicographical)으로 정렬이 가능하여 인덱싱 효율이 높습니다. ULID를 사용하려면 `Illuminate\Database\Eloquent\Concerns\HasUlids` 트레잇을 모델에 적용하고, [ULID에 해당하는 기본 키 컬럼](/docs/9.x/migrations#column-method-ulid)이 정의되어 있는지 확인하세요.

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

기본적으로 Eloquent는 `created_at`, `updated_at` 컬럼이 모델과 연결된 테이블에 존재하리라 기대합니다. Eloquent는 모델이 생성되거나 수정될 때 이 컬럼들의 값을 자동으로 설정합니다. 만약 Eloquent가 이러한 컬럼을 자동으로 관리하지 않길 원한다면, 모델에서 `$timestamps` 속성을 `false`로 지정하면 됩니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * 모델에 타임스탬프를 사용할지 여부입니다.
     *
     * @var bool
     */
    public $timestamps = false;
}
```

타임스탬프의 저장 포맷을 맞춤 설정하려면, 모델의 `$dateFormat` 속성을 설정하세요. 이 속성은 데이터베이스에 날짜 속성을 저장하는 포맷과, 모델이 배열이나 JSON으로 직렬화될 때의 포맷 모두에 적용됩니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * 모델의 날짜 컬럼 저장 포맷입니다.
     *
     * @var string
     */
    protected $dateFormat = 'U';
}
```

타임스탬프로 사용할 컬럼명을 커스터마이즈하려면, 모델에 `CREATED_AT` 및 `UPDATED_AT` 상수를 정의해주면 됩니다.

```
<?php

class Flight extends Model
{
    const CREATED_AT = 'creation_date';
    const UPDATED_AT = 'updated_date';
}
```

모델의 `updated_at` 값이 변경되지 않도록 하면서 모델을 조작하려면, `withoutTimestamps` 메서드의 클로저 내부에서 관련 작업을 수행하면 됩니다.

```
Model::withoutTimestamps(fn () => $post->increment(['reads']));
```

<a name="database-connections"></a>
### 데이터베이스 커넥션

기본적으로 모든 Eloquent 모델은 애플리케이션에 설정된 기본 데이터베이스 커넥션을 사용합니다. 특정 모델에 대해 다른 데이터베이스 커넥션을 사용하려면, 모델에 `$connection` 속성을 지정해주면 됩니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * 모델이 사용할 데이터베이스 커넥션입니다.
     *
     * @var string
     */
    protected $connection = 'sqlite';
}
```

<a name="default-attribute-values"></a>
### 속성의 기본값

새로 생성한 모델 인스턴스는 기본적으로 어떤 속성(attribute) 값도 갖고 있지 않습니다. 어떤 속성에 대해 기본값을 지정하고 싶을 때는, 모델에 `$attributes` 속성을 배열로 선언해서 사용할 수 있습니다. 이 배열에 지정한 값은, 데이터베이스에서 읽어온 "저장 가능한" 원시(raw) 형태여야 합니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * 모델 속성의 기본값입니다.
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

라라벨은 Eloquent의 동작 방식과 "엄격성(strictness)"을 다양한 상황에 맞게 조정할 수 있는 여러 메서드를 제공합니다.

먼저, `preventLazyLoading` 메서드는 lazy loading(지연 로딩)을 방지할지 여부를 나타내는 불리언 값을 인수로 받습니다. 예를 들어, 프로덕션 환경에서는 lazy loading이 우연히 실행되어도 애플리케이션이 정상 동작할 수 있게 하기 위해, 비프로덕션 환경에서만 lazy loading을 막을 수 있습니다. 이 메서드는 보통 애플리케이션의 `AppServiceProvider`의 `boot` 메서드 내에서 호출합니다.

```php
use Illuminate\Database\Eloquent\Model;

/**
 * 애플리케이션 서비스 부트스트래핑.
 *
 * @return void
 */
public function boot()
{
    Model::preventLazyLoading(! $this->app->isProduction());
}
```

또한, `preventSilentlyDiscardingAttributes` 메서드를 사용하면, 모델의 `fillable` 배열에 포함되지 않은 속성 값을 할당하려고 할 때 예외를 발생시킬 수 있습니다. 이를 통해 로컬 개발 중 실수로 fillable 속성에 추가되지 않은 속성을 지정했을 때, 예기치 않은 에러를 예방할 수 있습니다.

```php
Model::preventSilentlyDiscardingAttributes(! $this->app->isProduction());
```

마지막으로, 데이터베이스에서 실제로 조회되지 않았거나 존재하지 않는 속성에 접근하려고 시도했을 때 Eloquent가 예외를 던지도록 하려면, `preventAccessingMissingAttributes` 메서드를 사용할 수 있습니다. 예를 들어, Eloquent 쿼리의 `select` 문에 해당 속성을 빼먹고 추가하지 않은 경우 이런 일이 발생할 수 있습니다.

```php
Model::preventAccessingMissingAttributes(! $this->app->isProduction());
```

<a name="enabling-eloquent-strict-mode"></a>
#### Eloquent "엄격 모드" 활성화

위에서 설명한 세 가지 메서드를 모두 한 번에 활성화하려면, `shouldBeStrict` 메서드를 호출하면 간편합니다.

```php
Model::shouldBeStrict(! $this->app->isProduction());
```

<a name="retrieving-models"></a>
## 모델 조회하기

모델과 [연관된 데이터베이스 테이블](/docs/9.x/migrations#writing-migrations)을 만들었다면, 이제 데이터베이스에서 데이터를 조회할 준비가 된 것입니다. 각 Eloquent 모델은 [강력한 쿼리 빌더](/docs/9.x/queries)로서, 모델과 연결된 테이블에 대해 유연하게 쿼리를 작성할 수 있습니다. 모델의 `all` 메서드는 해당 테이블에 있는 모든 레코드를 조회합니다.

```
use App\Models\Flight;

foreach (Flight::all() as $flight) {
    echo $flight->name;
}
```

<a name="building-queries"></a>
#### 쿼리 빌딩

Eloquent의 `all` 메서드는 테이블의 모든 결과를 반환합니다. 하지만, 각각의 Eloquent 모델은 자체적으로 [쿼리 빌더](/docs/9.x/queries)로 동작하기 때문에 쿼리에 제약 조건을 추가한 뒤, `get` 메서드를 호출하여 원하는 결과만 조회할 수 있습니다.

```
$flights = Flight::where('active', 1)
               ->orderBy('name')
               ->take(10)
               ->get();
```

> [!NOTE]
> Eloquent 모델은 쿼리 빌더 역할도 하므로, 라라벨 [쿼리 빌더](/docs/9.x/queries)에서 제공하는 모든 메서드를 사용할 수 있습니다. Eloquent 쿼리 작성 시 이 메서드들을 활용해보세요.

<a name="refreshing-models"></a>
#### 모델 새로 고침

이미 데이터베이스에서 조회한 Eloquent 모델 인스턴스가 있다면, `fresh`나 `refresh` 메서드를 사용해 모델을 "새로 고침"할 수 있습니다. `fresh` 메서드는 데이터베이스에서 해당 모델을 다시 조회하지만, 기존 인스턴스에는 영향을 미치지 않습니다.

```
$flight = Flight::where('number', 'FR 900')->first();

$freshFlight = $flight->fresh();
```

`refresh` 메서드는 현재 모델 인스턴스를 데이터베이스의 최신 데이터로 다시 "하이드레이션"합니다. 또한, 모델과 함께 로드된 모든 연관관계도 최신화됩니다.

```
$flight = Flight::where('number', 'FR 900')->first();

$flight->number = 'FR 456';

$flight->refresh();

$flight->number; // "FR 900"
```

<a name="collections"></a>
### 컬렉션

앞서 살펴본 것처럼, Eloquent의 `all`이나 `get` 같은 메서드는 데이터베이스에서 여러 건의 레코드를 조회합니다. 이때 Eloquent는 단순한 PHP 배열을 반환하지 않고, `Illuminate\Database\Eloquent\Collection` 인스턴스를 반환합니다.

Eloquent의 `Collection` 클래스는 라라벨의 기본 `Illuminate\Support\Collection`을 확장하며, 데이터 컬렉션을 쉽게 다룰 수 있는 [다양한 유틸리티 메서드](/docs/9.x/collections#available-methods)를 제공합니다. 예를 들어, `reject` 메서드는 클로저를 이용해 컬렉션에서 특정 모델을 제외시킬 수 있습니다.

```php
$flights = Flight::where('destination', 'Paris')->get();

$flights = $flights->reject(function ($flight) {
    return $flight->cancelled;
});
```

기본 컬렉션 클래스에서 제공하는 메서드 외에도, Eloquent 컬렉션만의 [특화된 메서드들](/docs/9.x/eloquent-collections#available-methods)이 있어서, Eloquent 모델 컬렉션을 좀 더 유연하게 다룰 수 있습니다.

라라벨의 모든 컬렉션은 PHP의 iterable 인터페이스를 구현하고 있으므로, 배열처럼 반복문으로 순회할 수 있습니다.

```php
foreach ($flights as $flight) {
    echo $flight->name;
}
```

<a name="chunking-results"></a>
### 결과 청킹(Chunking)

`all`이나 `get` 같은 메서드로 수만 건의 Eloquent 레코드를 한 번에 로드하면 애플리케이션이 메모리 부족에 빠질 수 있습니다. 이런 경우 `chunk` 메서드를 사용하면, 대량의 모델을 좀 더 효율적으로 처리할 수 있습니다.

`chunk` 메서드는 Eloquent 모델을 일정 수만큼(청크 단위)만 조회하여, 이를 클로저에 전달합니다. 이렇게 하면 한 번에 전체를 로드할 필요 없이, 현재 청크만 메모리에 올리므로 메모리 사용량이 크게 줄어듭니다.

```php
use App\Models\Flight;

Flight::chunk(200, function ($flights) {
    foreach ($flights as $flight) {
        //
    }
});
```

`chunk` 메서드의 첫 번째 인자는 한 번에 조회할 레코드 수(청크 크기)입니다. 두 번째 인자로는 각 청크가 조회될 때마다 호출되는 클로저를 전달합니다. 데이터베이스 쿼리가 매번 실행되어 각 청크마다 결과를 가져옵니다.

만약 청크 메서드의 필터링 기준이 되는 컬럼을 반복 중에 업데이트하고 있다면, `chunk` 대신 `chunkById` 메서드를 사용해야 결과가 올바르게 나옵니다. `chunkById` 메서드는 내부적으로 매 청크마다 이전 청크의 마지막 모델보다 큰 `id` 값을 가진 레코드만 조회하기 때문입니다.

```php
Flight::where('departed', true)
    ->chunkById(200, function ($flights) {
        $flights->each->update(['departed' => false]);
    }, $column = 'id');
```

<a name="chunking-using-lazy-collections"></a>
### Lazy 컬렉션을 이용한 청킹

`lazy` 메서드는 [chunk 메서드](#chunking-results)와 유사하게, 내부적으로 쿼리를 청크 단위로 실행합니다. 하지만 각 청크 결과를 클로저로 전달하는 대신, `lazy`는 Eloquent 모델들의 평면화(flattened)된 [`LazyCollection`](/docs/9.x/collections#lazy-collections)을 반환합니다. 이를 통해 결과를 하나의 스트림처럼 처리할 수 있습니다.

```php
use App\Models\Flight;

foreach (Flight::lazy() as $flight) {
    //
}
```

`lazy` 메서드를 사용할 때, 순회하면서 업데이트할 컬럼이 쿼리 필터 조건에 포함되어 있다면, `lazyById` 메서드를 사용하는 것이 안전합니다. `lazyById`는 매번 이전 청크의 마지막 모델보다 큰 `id` 값을 가진 레코드만 조회합니다.

```php
Flight::where('departed', true)
    ->lazyById(200, $column = 'id')
    ->each->update(['departed' => false]);
```

내림차순으로 `id`를 기준 삼아 결과를 필터링하려면, `lazyByIdDesc` 메서드를 사용할 수 있습니다.

<a name="cursors"></a>

### 커서(Cursor)

`lazy` 메서드와 유사하게, `cursor` 메서드를 사용하면 수만 건이 넘는 Eloquent 모델 레코드를 반복(iterate)할 때 애플리케이션의 메모리 사용량을 획기적으로 줄일 수 있습니다.

`cursor` 메서드는 단 한 번의 데이터베이스 쿼리만을 실행하지만, 실제로 각 Eloquent 모델이 반복 처리될 때까지 메모리에 로드(하이드레이트)하지 않습니다. 따라서 반복이 진행되는 동안 한 시점에 한 개의 Eloquent 모델만 메모리에 유지됩니다.

> [!WARNING]
> `cursor` 메서드는 항상 한 번에 한 개의 Eloquent 모델만 메모리에 보관하기 때문에, 연관관계(eager loading)를 사용할 수 없습니다. 연관관계를 함께 로드해야 하는 경우 [lazy 메서드](#chunking-using-lazy-collections)를 대신 사용하는 것이 좋습니다.

내부적으로 `cursor` 메서드는 PHP의 [제너레이터(generators)](https://www.php.net/manual/en/language.generators.overview.php)를 사용하여 이 기능을 제공합니다.

```php
use App\Models\Flight;

foreach (Flight::where('destination', 'Zurich')->cursor() as $flight) {
    //
}
```

`cursor` 메서드는 `Illuminate\Support\LazyCollection` 인스턴스를 반환합니다. [Lazy 컬렉션](/docs/9.x/collections#lazy-collections)은 라라벨 컬렉션에서 사용할 수 있는 다양한 메서드를 지원하면서도, 한 번에 오직 하나의 모델만 메모리에 로드합니다.

```php
use App\Models\User;

$users = User::cursor()->filter(function ($user) {
    return $user->id > 500;
});

foreach ($users as $user) {
    echo $user->id;
}
```

`cursor` 메서드는 일반 쿼리보다 훨씬 적은 메모리를 사용하지만(한 번에 하나의 모델만 메모리에 저장), 결국에는 메모리가 모두 사용될 수도 있습니다. 이는 [PHP의 PDO 드라이버가 내부적으로 모든 원시 쿼리 결과를 버퍼에 캐싱하기 때문](https://www.php.net/manual/en/mysqlinfo.concepts.buffering.php)입니다. 매우 많은 수의 Eloquent 레코드를 다뤄야 한다면, [lazy 메서드](#chunking-using-lazy-collections)를 사용하는 것을 고려하세요.

<a name="advanced-subqueries"></a>
### 고급 서브쿼리(Advanced Subqueries)

<a name="subquery-selects"></a>
#### 서브쿼리 셀렉트(Subquery Selects)

Eloquent는 고급 서브쿼리 기능을 제공하여, 연관된 테이블에서 정보를 한 번의 쿼리로 가져올 수 있도록 지원합니다. 예를 들어, flight `destinations`(목적지) 테이블과 목적지로 가는 `flights`(비행편) 테이블이 있다고 가정해봅니다. `flights` 테이블에는 해당 비행기가 목적지에 도착한 시각을 나타내는 `arrived_at` 컬럼이 있습니다.

쿼리 빌더의 `select` 및 `addSelect` 메서드에서 제공하는 서브쿼리 기능을 활용하면, 모든 목적지를 가져오면서 동시에, 해당 목적지에 가장 최근에 도착한 비행편의 이름을 한 번의 쿼리로 조회할 수 있습니다.

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
#### 서브쿼리 정렬(Subquery Ordering)

또한 쿼리 빌더의 `orderBy` 기능에서도 서브쿼리를 사용할 수 있습니다. 앞서 예시로 든 flight 테이블을 기준으로, 각 목적지에 가장 최근에 도착한 비행편의 도착 시각을 기준으로 목적지 목록을 정렬할 수 있습니다. 이 역시 한 번의 쿼리로 처리됩니다.

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

주어진 쿼리 조건에 해당하는 모든 레코드를 조회하는 것 외에도, `find`, `first`, `firstWhere` 메서드를 이용해 단일 레코드만 조회할 수 있습니다. 이 메서드들은 모델 컬렉션 대신 단일 모델 인스턴스를 반환합니다.

```
use App\Models\Flight;

// 프라이머리 키로 모델 하나 조회...
$flight = Flight::find(1);

// 쿼리 조건을 만족하는 첫 번째 모델 조회...
$flight = Flight::where('active', 1)->first();

// 쿼리 조건을 만족하는 첫 번째 모델을 조회하는 또 다른 방법...
$flight = Flight::firstWhere('active', 1);
```

때때로 결과가 존재하지 않을 때 다른 동작을 하고 싶을 수도 있습니다. `findOr`와 `firstOr` 메서드는 조건에 맞는 모델 인스턴스를 반환하거나, 결과가 없을 경우 주어진 클로저를 실행합니다. 클로저가 반환한 값이 메서드의 반환 값으로 사용됩니다.

```
$flight = Flight::findOr(1, function () {
    // ...
});

$flight = Flight::where('legs', '>', 3)->firstOr(function () {
    // ...
});
```

<a name="not-found-exceptions"></a>
#### 모델을 찾을 수 없는 경우 예외 처리

모델을 찾지 못했을 때 예외를 발생시키고 싶은 상황이 있을 수 있습니다. 라우트나 컨트롤러에서 특히 유용합니다. `findOrFail`과 `firstOrFail` 메서드는 쿼리 조건에 맞는 첫 결과를 반환하거나, 결과가 없으면 `Illuminate\Database\Eloquent\ModelNotFoundException` 예외를 발생시킵니다.

```
$flight = Flight::findOrFail(1);

$flight = Flight::where('legs', '>', 3)->firstOrFail();
```

`ModelNotFoundException` 예외를 따로 처리하지 않으면, 라라벨이 자동으로 404 HTTP 응답을 클라이언트로 반환합니다.

```
use App\Models\Flight;

Route::get('/api/flights/{id}', function ($id) {
    return Flight::findOrFail($id);
});
```

<a name="retrieving-or-creating-models"></a>
### 모델을 조회하거나 생성하기

`firstOrCreate` 메서드는 주어진 컬럼/값 쌍(column/value pairs)으로 데이터베이스 레코드를 찾으려 시도합니다. 만약 해당 모델이 데이터베이스에 없다면, 첫 번째 배열 인자와 (선택적으로) 두 번째 배열 인자를 합쳐서 새로운 레코드가 삽입됩니다.

`firstOrNew` 메서드도 `firstOrCreate`와 비슷하게 주어진 속성에 일치하는 레코드를 데이터베이스에서 조회합니다. 다만 모델이 없다면, 새 모델 인스턴스를 반환할 뿐이며 아직 데이터베이스에는 저장되지 않습니다. 이 경우 수동으로 `save` 메서드를 호출해 직접 저장해야 합니다.

```
use App\Models\Flight;

// 이름으로 flight 조회, 없으면 생성...
$flight = Flight::firstOrCreate([
    'name' => 'London to Paris'
]);

// 이름으로 조회, 없으면 name, delayed, arrival_time 속성으로 생성...
$flight = Flight::firstOrCreate(
    ['name' => 'London to Paris'],
    ['delayed' => 1, 'arrival_time' => '11:30']
);

// 이름으로 flight 조회, 없으면 새 Flight 인스턴스 반환(미저장)...
$flight = Flight::firstOrNew([
    'name' => 'London to Paris'
]);

// 이름으로 조회, 없으면 name, delayed, arrival_time 속성값으로 새 인스턴스 반환(미저장)...
$flight = Flight::firstOrNew(
    ['name' => 'Tokyo to Sydney'],
    ['delayed' => 1, 'arrival_time' => '11:30']
);
```

<a name="retrieving-aggregates"></a>
### 집계값 조회하기

Eloquent 모델을 사용할 때도, 라라벨 [쿼리 빌더](/docs/9.x/queries)에서 제공하는 `count`, `sum`, `max` 등 [집계 메서드](/docs/9.x/queries#aggregates)를 사용할 수 있습니다. 이 메서드들은 Eloquent 모델 인스턴스가 아닌 스칼라 값을 반환합니다.

```
$count = Flight::where('active', 1)->count();

$max = Flight::where('active', 1)->max('price');
```

<a name="inserting-and-updating-models"></a>
## 모델 삽입 및 수정

<a name="inserts"></a>
### 레코드 삽입

Eloquent를 사용할 때는 데이터베이스에서 모델을 조회하는 것 외에도 새로운 레코드를 추가할 수 있습니다. 다행히도 Eloquent에서는 이 과정이 매우 간단합니다. 새 레코드를 데이터베이스에 삽입하려면 모델 인스턴스를 생성해 속성 값을 지정하고, 해당 인스턴스에서 `save` 메서드를 호출하면 됩니다.

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
        // 요청 유효성 검증...

        $flight = new Flight;

        $flight->name = $request->name;

        $flight->save();
    }
}
```

위 예시에서는 HTTP 요청에서 넘어온 `name` 값을 `App\Models\Flight` 모델 인스턴스의 `name` 속성에 할당합니다. 이후 `save`를 호출하면 레코드가 데이터베이스에 삽입됩니다. 이때 모델의 `created_at` 및 `updated_at` 타임스탬프도 자동으로 지정되므로, 별도로 설정할 필요가 없습니다.

또한, `create` 메서드를 이용하면 한 줄의 PHP 코드로 새 모델을 "저장"할 수 있습니다. 이때 생성된 모델 인스턴스가 반환됩니다.

```
use App\Models\Flight;

$flight = Flight::create([
    'name' => 'London to Paris',
]);
```

단, `create` 메서드를 사용하려면 모델 클래스에 `fillable` 또는 `guarded` 속성(property)이 반드시 지정되어 있어야 합니다. 이는 모든 Eloquent 모델이 기본적으로 대량 할당 취약점(mass assignment vulnerability)으로부터 보호되기 때문입니다. 대량 할당에 대한 자세한 내용은 [mass assignment 문서](#mass-assignment)를 참고하세요.

<a name="updates"></a>
### 레코드 수정

이미 데이터베이스에 존재하는 모델을 수정할 때도 `save` 메서드를 사용할 수 있습니다. 먼저 수정할 모델을 조회한 뒤, 변경할 속성 값을 지정하고, 모델의 `save` 메서드를 호출하면 됩니다. 이때도 `updated_at` 타임스탬프가 자동으로 갱신되므로, 따로 지정할 필요가 없습니다.

```
use App\Models\Flight;

$flight = Flight::find(1);

$flight->name = 'Paris to London';

$flight->save();
```

<a name="mass-updates"></a>
#### 대량 업데이트(Mass Updates)

주어진 쿼리와 일치하는 여러 모델을 한꺼번에 업데이트할 수도 있습니다. 아래 예시에서는, `active`가 1이고, 목적지(destination)가 `San Diego`인 모든 flight에 대해 `delayed` 값을 1로 지정합니다.

```
Flight::where('active', 1)
      ->where('destination', 'San Diego')
      ->update(['delayed' => 1]);
```

`update` 메서드는 업데이트될 컬럼과 값을 나타내는 연관 배열을 인자로 받습니다. 이 메서드는 영향을 받은(수정된) 행의 개수를 반환합니다.

> [!WARNING]
> Eloquent에서 대량 업데이트를 실행하면, 해당 모델에 대한 `saving`, `saved`, `updating`, `updated` 모델 이벤트가 발생하지 않습니다. 이는 대량 업데이트 시 모델이 실제로 조회되지 않기 때문입니다.

<a name="examining-attribute-changes"></a>
#### 속성 변경 사항 확인하기

Eloquent에서는 모델의 내부 상태를 파악하고, 속성이 조회 당시와 비교해 어떻게 변경되었는지 확인할 수 있도록 `isDirty`, `isClean`, `wasChanged` 등의 메서드를 제공합니다.

`isDirty` 메서드는 모델 조회 이후 한 번이라도 속성(어트리뷰트)이 수정되었는지를 판단합니다. 특정 속성(또는 속성 배열)을 인자로 넘겨, 해당 속성이 변경(더티) 상태인지 판별할 수도 있습니다. `isClean` 메서드는 지정한 속성이 조회된 이후 변경되지 않았는지 확인합니다. 이 메서드 역시 옵션으로 속성명을 지정할 수 있습니다.

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

`wasChanged` 메서드는 모델 인스턴스가 마지막으로 저장(save)됐을 때 속성이 변경되었는지를 확인합니다. 필요하다면 구체적인 속성명을 전달해 특정 속성이 변경되었는지 확인할 수도 있습니다.

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

`getOriginal` 메서드는, 모델 인스턴스를 조회한 이후 현재까지의 변경 사항과 상관없이, 모델의 원래 속성값을 배열로 반환합니다. 특정 속성값만 필요하다면, 속성명을 인자로 넘길 수 있습니다.

```
$user = User::find(1);

$user->name; // John
$user->email; // john@example.com

$user->name = "Jack";
$user->name; // Jack

$user->getOriginal('name'); // John
$user->getOriginal(); // 원본 속성값의 배열...
```

<a name="mass-assignment"></a>
### 대량 할당(Mass Assignment)

`create` 메서드를 활용하면 한 줄의 PHP 코드로 새 모델을 "저장"할 수 있습니다. 이때 생성된 모델 인스턴스가 반환됩니다.

```
use App\Models\Flight;

$flight = Flight::create([
    'name' => 'London to Paris',
]);
```

하지만 `create` 메서드를 사용하기 전, 반드시 모델 클래스에 `fillable` 또는 `guarded` 속성이 지정되어 있어야 합니다. 이는 모든 Eloquent 모델이 기본적으로 대량 할당 취약점(mass assignment vulnerability)에 대비해 보호되기 때문입니다.

대량 할당 취약점(mass assignment vulnerability)은 사용자가 예상치 못한 HTTP 요청 필드를 전달했고, 그 필드가 데이터베이스의 원하는 컬럼을 변경하는 경우 발생합니다. 예를 들어, 악의적인 사용자가 HTTP 요청을 통해 `is_admin` 파라미터를 전달하면, 해당 값이 모델의 `create` 메서드에 전달되어 사용자가 스스로 관리자로 권한을 올릴 수도 있습니다.

따라서 우선, 어떤 모델 속성을 대량 할당이 가능하도록 허용할지 지정해야 합니다. 모델의 `$fillable` 속성에 허용할 속성을 배열로 정의하면 됩니다. 예시로, `Flight` 모델의 `name` 속성을 대량 할당 가능하도록 만들겠습니다.

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

대량 할당 허용 속성을 지정한 뒤에는, `create` 메서드를 통해 데이터베이스에 새 레코드를 삽입할 수 있습니다. `create` 메서드는 새로 생성된 모델 인스턴스를 반환합니다.

```
$flight = Flight::create(['name' => 'London to Paris']);
```

이미 모델 인스턴스가 존재한다면, `fill` 메서드로 한꺼번에 속성을 할당할 수 있습니다.

```
$flight->fill(['name' => 'Amsterdam to Frankfurt']);
```

<a name="mass-assignment-json-columns"></a>
#### 대량 할당 & JSON 컬럼

JSON 컬럼에 값을 할당할 때는, 각 컬럼의 대량 할당 키를 반드시 모델의 `$fillable` 배열에 명시해야 합니다. 보안상의 이유로, 라라벨은 `guarded` 속성을 사용할 때 중첩된(nested) JSON 속성값의 업데이트를 지원하지 않습니다.

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
#### 모든 속성의 대량 할당 허용

모델의 모든 속성을 대량 할당 가능하게 만들고 싶다면, 모델의 `$guarded` 속성을 빈 배열로 지정하면 됩니다. 모델을 보호 해제(unguard)할 경우, Eloquent의 `fill`, `create`, `update` 메서드에 전달하는 배열을 항상 신중하게 직접 작성해야 합니다.

```
/**
 * The attributes that aren't mass assignable.
 *
 * @var array
 */
protected $guarded = [];
```

<a name="mass-assignment-exceptions"></a>
#### 대량 할당 예외 처리

기본적으로, `$fillable` 배열에 포함되지 않은 속성은 대량 할당 시 조용히 무시됩니다. 실제 운영 환경에서는 이것이 기대되는 동작이지만, 개발 환경에서는 종종 모델 변화가 반영되지 않는 이유를 모르고 혼란스럽게 느낄 수 있습니다.

필요하다면, `preventSilentlyDiscardingAttributes` 메서드를 호출해, 허용되지 않은 속성이 할당될 때 예외를 발생시키도록 라라벨에 지시할 수 있습니다. 보통 이 메서드는 애플리케이션의 서비스 프로바이더 중 하나의 `boot` 메서드에서 호출하면 됩니다.

```
use Illuminate\Database\Eloquent\Model;

/**
 * Bootstrap any application services.
 *
 * @return void
 */
public function boot()
{
    Model::preventSilentlyDiscardingAttributes($this->app->isLocal());
}
```

<a name="upserts"></a>
### 업서트(Upserts)

기존 모델을 업데이트해야 할 수도 있고, 일치하는 모델이 없으면 새로 생성해야 할 수도 있습니다. `firstOrCreate`와 유사하게, `updateOrCreate` 메서드는 모델을 데이터베이스에 저장(persist)하기 때문에 수동으로 `save`를 호출할 필요가 없습니다.

아래 예시처럼, `departure`가 `Oakland`, `destination`이 `San Diego`인 flight가 이미 있으면 `price`와 `discounted` 컬럼만 업데이트하고, 해당 조건이 없으면 두 인자 배열을 병합해 새 flight가 생성됩니다.

```
$flight = Flight::updateOrCreate(
    ['departure' => 'Oakland', 'destination' => 'San Diego'],
    ['price' => 99, 'discounted' => 1]
);
```

여러 개의 "업서트"를 단일 쿼리로 처리하려면 `upsert` 메서드를 사용할 수 있습니다. 첫 번째 인자는 삽입 또는 업데이트할 값 배열, 두 번째 인자는 테이블 내 레코드를 고유하게 식별하는 컬럼(들) 목록, 세 번째는 이미 존재하는 레코드일 경우 업데이트할 컬럼 목록입니다. `upsert` 메서드는 모델에 타임스탬프가 활성화된 경우, `created_at` 및 `updated_at` 필드를 자동으로 지정합니다.

```
Flight::upsert([
    ['departure' => 'Oakland', 'destination' => 'San Diego', 'price' => 99],
    ['departure' => 'Chicago', 'destination' => 'New York', 'price' => 150]
], ['departure', 'destination'], ['price']);

```
> [!WARNING]
> SQL Server를 제외한 대부분의 데이터베이스에서는 `upsert` 메서드의 두 번째 인자 컬럼이 반드시 "primary" 또는 "unique" 인덱스를 가져야 합니다. MySQL의 경우, 두 번째 인자 값은 무시되고 해당 테이블의 "primary" 및 "unique" 인덱스를 자동으로 사용해 기존 레코드 판별에 활용합니다.

<a name="deleting-models"></a>
## 모델 삭제하기

모델을 삭제하려면, 해당 모델 인스턴스에서 `delete` 메서드를 호출하면 됩니다.

```
use App\Models\Flight;

$flight = Flight::find(1);

$flight->delete();
```

모델과 연관된 모든 데이터베이스 레코드를 삭제하려면 `truncate` 메서드를 사용할 수 있습니다. `truncate` 작업은 모델의 테이블에서 자동 증가 식별자(auto-incrementing id) 역시 초기화(reset)합니다.

```
Flight::truncate();
```

<a name="deleting-an-existing-model-by-its-primary-key"></a>
#### 프라이머리 키로 기존 모델 삭제

위 예시에서는 모델을 먼저 조회한 뒤 삭제했지만, 프라이머리 키(primary key)를 알고 있다면, 모델을 따로 조회하지 않고 `destroy` 메서드를 호출해 바로 삭제할 수 있습니다. `destroy` 메서드는 단일 프라이머리 키뿐 아니라, 여러 개의 프라이머리 키, 프라이머리 키의 배열, 또는 [컬렉션](/docs/9.x/collections)도 인자로 받을 수 있습니다.

```
Flight::destroy(1);

Flight::destroy(1, 2, 3);

Flight::destroy([1, 2, 3]);

Flight::destroy(collect([1, 2, 3]));
```

> [!WARNING]
> `destroy` 메서드는 각 모델을 개별적으로 로드(load)한 뒤 `delete` 메서드를 호출하므로, 해당 모델의 `deleting` 및 `deleted` 이벤트가 제대로 발생(dispatch)합니다.

<a name="deleting-models-using-queries"></a>
#### 쿼리를 이용한 모델 삭제

물론, Eloquent 쿼리를 작성해 쿼리 조건에 일치하는 모델을 한꺼번에 삭제할 수도 있습니다. 아래 예시에서는, `active`가 0(비활성)으로 표시된 모든 flight를 삭제합니다. 대량 업데이트와 마찬가지로, 대량 삭제 역시 모델 이벤트가 발생하지 않습니다.

```
$deleted = Flight::where('active', 0)->delete();
```

> [!WARNING]
> Eloquent에서 대량 삭제(mass delete) 명령을 실행하면, 삭제된 모델에 대해 `deleting`, `deleted` 이벤트가 발생하지 않습니다. 이는 삭제 명령이 실행될 때 모델을 실제로 조회하지 않기 때문입니다.

<a name="soft-deleting"></a>
### 소프트 삭제(Soft Deleting)

데이터베이스에서 레코드를 실제로 삭제하지 않고, Eloquent를 통해 "소프트 삭제"를 할 수도 있습니다. 소프트 삭제된 모델은 데이터베이스에서 실제로 삭제되지 않으며, 대신 모델에 `deleted_at` 속성(attribute)이 설정되어 "삭제된" 시점을 나타냅니다. 소프트 삭제를 사용하려면, 모델에 `Illuminate\Database\Eloquent\SoftDeletes` 트레잇을 추가하면 됩니다.

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
> `SoftDeletes` 트레잇은 `deleted_at` 속성을 자동으로 `DateTime` 또는 `Carbon` 인스턴스로 변환(cast)해줍니다.

데이터베이스 테이블에도 `deleted_at` 컬럼을 추가해야 합니다. 라라벨 [스키마 빌더](/docs/9.x/migrations)를 사용하면 이 컬럼을 쉽게 추가할 수 있습니다.

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

이제 모델에서 `delete` 메서드를 호출하면 `deleted_at` 컬럼이 현재 시각으로 지정되고, 실제로는 테이블에서 레코드가 남아 있습니다. 소프트 삭제 기능이 적용된 모델을 조회할 때는 자동으로 소프트 삭제된 레코드가 질의 결과에서 제외됩니다.

모델 인스턴스가 소프트 삭제된 상태인지 확인하려면, `trashed` 메서드를 사용할 수 있습니다.

```
if ($flight->trashed()) {
    //
}
```

<a name="restoring-soft-deleted-models"></a>
#### 소프트 삭제된 모델 복원

때때로 소프트 삭제된 모델을 "삭제 취소"(복원)하고 싶을 때가 있습니다. 이럴 때는 모델 인스턴스에서 `restore` 메서드를 호출하면 됩니다. `restore` 메서드는 모델의 `deleted_at` 컬럼 값을 `null`로 재설정합니다.

```
$flight->restore();
```

쿼리 빌더에서 `restore` 메서드를 이용해 여러 모델을 한꺼번에 복원할 수도 있습니다. 마찬가지로, 대량 복원 역시 해당 모델들의 이벤트는 발생하지 않습니다.

```
Flight::withTrashed()
        ->where('airline_id', 1)
        ->restore();
```

[연관관계](/docs/9.x/eloquent-relationships) 쿼리를 작성할 때도 `restore` 메서드를 사용할 수 있습니다.

```
$flight->history()->restore();
```

<a name="permanently-deleting-models"></a>

#### 모델의 영구 삭제

때때로, 모델을 데이터베이스에서 완전히 제거해야 할 때가 있습니다. 소프트 삭제된 모델을 데이터베이스 테이블에서 영구적으로 삭제하려면 `forceDelete` 메서드를 사용할 수 있습니다.

```
$flight->forceDelete();
```

또한, Eloquent의 연관관계 쿼리를 작성할 때도 `forceDelete` 메서드를 사용할 수 있습니다.

```
$flight->history()->forceDelete();
```

<a name="querying-soft-deleted-models"></a>
### 소프트 삭제된 모델 조회하기

<a name="including-soft-deleted-models"></a>
#### 소프트 삭제된 모델을 함께 조회하기

앞서 설명했듯이, 소프트 삭제된 모델은 기본적으로 쿼리 결과에서 자동으로 제외됩니다. 그러나, 쿼리에서 소프트 삭제된 모델도 결과에 포함하려면 `withTrashed` 메서드를 쿼리에 호출하면 됩니다.

```
use App\Models\Flight;

$flights = Flight::withTrashed()
                ->where('account_id', 1)
                ->get();
```

`withTrashed` 메서드는 [연관관계](/docs/9.x/eloquent-relationships) 쿼리를 작성할 때도 사용할 수 있습니다.

```
$flight->history()->withTrashed()->get();
```

<a name="retrieving-only-soft-deleted-models"></a>
#### 소프트 삭제된 모델만 조회하기

`onlyTrashed` 메서드는 소프트 삭제된 모델 **만을** 조회합니다.

```
$flights = Flight::onlyTrashed()
                ->where('airline_id', 1)
                ->get();
```

<a name="pruning-models"></a>
## 모델 가지치기(Pruning)

더 이상 필요하지 않은 모델을 주기적으로 삭제하고 싶은 경우가 있습니다. 이를 위해 삭제가 필요한 모델에 `Illuminate\Database\Eloquent\Prunable` 또는 `Illuminate\Database\Eloquent\MassPrunable` 트레잇을 추가할 수 있습니다. 트레잇을 모델에 추가한 다음, 필요 없는 모델을 조회하는 Eloquent 쿼리 빌더를 반환하는 `prunable` 메서드를 구현해 주세요.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;

class Flight extends Model
{
    use Prunable;

    /**
     * 가지치기 대상이 될 모델 쿼리를 반환합니다.
     *
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function prunable()
    {
        return static::where('created_at', '<=', now()->subMonth());
    }
}
```

`Prunable`로 지정한 모델에는 `pruning` 메서드를 추가로 정의할 수도 있습니다. 이 메서드는 모델이 삭제되기 **전**에 호출되며, 저장된 파일 등 모델과 연관된 추가 리소스를 데이터베이스에서 영구 삭제되기 전에 정리하는 데 유용합니다.

```
/**
 * 가지치기를 위한 준비 동작을 수행합니다.
 *
 * @return void
 */
protected function pruning()
{
    //
}
```

가지치기가 필요한 모델을 설정한 뒤에는, 애플리케이션의 `App\Console\Kernel` 클래스에서 `model:prune` Artisan 명령어가 일정 주기로 실행되도록 스케줄링해야 합니다. 이 스케줄 주기는 자유롭게 선택할 수 있습니다.

```
/**
 * 애플리케이션의 명령 스케줄을 정의합니다.
 *
 * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
 * @return void
 */
protected function schedule(Schedule $schedule)
{
    $schedule->command('model:prune')->daily();
}
```

내부적으로 `model:prune` 명령어는 애플리케이션의 `app/Models` 디렉토리 내에서 "Prunable" 모델을 자동으로 감지합니다. 만약 모델이 다른 위치에 있다면, `--model` 옵션을 사용하여 모델 클래스명을 직접 지정할 수 있습니다.

```
$schedule->command('model:prune', [
    '--model' => [Address::class, Flight::class],
])->daily();
```

반대로, 감지된 모든 모델을 가지치기(Prune)하면서 특정 모델만 제외하고 싶다면, `--except` 옵션을 사용할 수 있습니다.

```
$schedule->command('model:prune', [
    '--except' => [Address::class, Flight::class],
])->daily();
```

`prunable` 쿼리가 제대로 동작하는지 테스트하려면, `--pretend` 옵션과 함께 `model:prune` 명령어를 실행하면 됩니다. 이때 실제로 가지치기를 수행하지 않고, 얼마만큼의 레코드가 가지치기될지 보고만 해줍니다.

```shell
php artisan model:prune --pretend
```

> [!WARNING]
> 소프트 삭제된 모델이라도 prunable 쿼리에 일치할 경우, `forceDelete`로 **영구 삭제**됩니다.

<a name="mass-pruning"></a>
#### 대량 가지치기(Mass Pruning)

모델에 `Illuminate\Database\Eloquent\MassPrunable` 트레잇이 적용되어 있으면, 대량 삭제 쿼리를 통해 모델을 데이터베이스에서 삭제합니다. 이 경우 `pruning` 메서드는 호출되지 않고, `deleting` 및 `deleted`와 같은 모델 이벤트도 발생하지 않습니다. 이는 실제로 삭제 전에 모델이 조회되지 않기 때문에 가지치기 과정이 훨씬 더 효율적으로 동작합니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\MassPrunable;

class Flight extends Model
{
    use MassPrunable;

    /**
     * 가지치기 대상이 될 모델 쿼리를 반환합니다.
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
## 모델 복제

이미 존재하는 모델 인스턴스의 저장되지 않은 복사본을 생성하려면 `replicate` 메서드를 사용할 수 있습니다. 이 메서드는 여러 속성(attribute)이 동일한 모델 인스턴스를 관리할 때 특히 유용합니다.

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

복제 시 새로운 모델에 복사하지 않을 속성(attribute)이 있다면, 배열에 속성명을 담아 `replicate` 메서드의 인수로 전달하면 됩니다.

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
## 조회 스코프(Query Scopes)

<a name="global-scopes"></a>
### 전역 스코프(Global Scopes)

전역 스코프를 사용하면 특정 모델에 대해 모든 쿼리에 제약 조건을 추가할 수 있습니다. 라라벨의 [소프트 삭제](#soft-deleting) 기능도 전역 스코프를 이용해 "삭제되지 않은" 모델만 데이터베이스에서 조회합니다. 직접 전역 스코프를 작성하면, 특정 모델의 모든 쿼리가 반드시 특정 제약 조건을 받도록 손쉽게 만들 수 있습니다.

<a name="writing-global-scopes"></a>
#### 전역 스코프 작성하기

전역 스코프 작성은 간단합니다. 먼저, `Illuminate\Database\Eloquent\Scope` 인터페이스를 구현하는 클래스를 정의하세요. 라라벨에서는 스코프 클래스를 넣어야 할 위치가 정해져 있지 않으므로, 원하는 디렉터리에 클래스를 자유롭게 생성할 수 있습니다.

`Scope` 인터페이스는 반드시 하나의 메서드: `apply`를 구현해야 합니다. `apply` 메서드에서는 쿼리에 필요한 `where` 조건이나 기타 절을 추가할 수 있습니다.

```
<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class AncientScope implements Scope
{
    /**
     * 주어진 Eloquent 쿼리 빌더에 스코프를 적용합니다.
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

> [!NOTE]
> 전역 스코프에서 쿼리의 select 절에 컬럼을 추가하려면, 기존의 `select` 대신 `addSelect` 메서드를 사용하는 것이 좋습니다. `addSelect`를 사용하면 쿼리의 기존 select 절이 의도치 않게 덮어써지는 것을 방지할 수 있습니다.

<a name="applying-global-scopes"></a>
#### 전역 스코프 적용하기

모델에 전역 스코프를 할당하려면, 모델의 `booted` 메서드를 오버라이드하여 내부에서 `addGlobalScope` 메서드를 호출해야 합니다. `addGlobalScope` 메서드에는 앞서 정의한 스코프의 인스턴스를 유일한 인수로 전달합니다.

```
<?php

namespace App\Models;

use App\Models\Scopes\AncientScope;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 모델의 "booted" 메서드입니다.
     *
     * @return void
     */
    protected static function booted()
    {
        static::addGlobalScope(new AncientScope);
    }
}
```

위 예제처럼 `App\Models\User` 모델에 스코프를 추가하면, `User::all()` 호출 시 아래와 같은 SQL 쿼리가 실행됩니다.

```sql
select * from `users` where `created_at` < 0021-02-18 00:00:00
```

<a name="anonymous-global-scopes"></a>
#### 익명 전역 스코프

Eloquent에서는 전역 스코프를 클로저(익명 함수)로도 정의할 수 있습니다. 간단한 스코프의 경우 별도의 클래스를 만들지 않아도 되어 편리합니다. 이때는 `addGlobalScope` 메서드에 첫 번째 인수로 스코프 이름 문자열을 전달하고, 두 번째 인수에 클로저를 전달합니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 모델의 "booted" 메서드입니다.
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
#### 전역 스코프 제거하기

특정 쿼리에 대해 전역 스코프를 제거하려면, `withoutGlobalScope` 메서드를 사용하면 됩니다. 이 메서드에는 전역 스코프 클래스명을 유일한 인수로 전달합니다.

```
User::withoutGlobalScope(AncientScope::class)->get();
```

만약 전역 스코프를 클로저로 정의했다면, 스코프를 추가할 때 지정한 문자열 이름을 전달해야 합니다.

```
User::withoutGlobalScope('ancient')->get();
```

여러 개 또는 모든 전역 스코프를 한 번에 제거하고 싶다면, `withoutGlobalScopes` 메서드를 사용할 수 있습니다.

```
// 모든 전역 스코프를 제거합니다...
User::withoutGlobalScopes()->get();

// 일부 전역 스코프만 선택적으로 제거합니다...
User::withoutGlobalScopes([
    FirstScope::class, SecondScope::class
])->get();
```

<a name="local-scopes"></a>
### 로컬 스코프(Local Scopes)

로컬 스코프를 사용하면 애플리케이션 전반에서 손쉽게 재사용할 수 있는 공통 쿼리 조건 집합을 정의할 수 있습니다. 예를 들어, 자주 "인기 있는" 사용자를 모두 조회해야 하는 상황이 있을 수 있습니다. 스코프를 정의하려면 Eloquent 모델의 메서드명 앞에 `scope`를 붙이면 됩니다.

스코프는 항상 동일한 쿼리 빌더 인스턴스 또는 `void`를 반환해야 합니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 쿼리가 "인기 있는" 사용자만 포함하도록 스코프를 정의합니다.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopePopular($query)
    {
        return $query->where('votes', '>', 100);
    }

    /**
     * 쿼리가 "활성" 사용자만 포함하도록 스코프를 정의합니다.
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
#### 로컬 스코프 사용하기

스코프가 정의되었다면, 모델을 쿼리할 때 해당 스코프 메서드를 호출할 수 있습니다. 이때 메서드를 호출할 때에는 `scope` 접두사는 생략해야 합니다. 여러 스코프를 체이닝해서 사용할 수도 있습니다.

```
use App\Models\User;

$users = User::popular()->active()->orderBy('created_at')->get();
```

여러 개의 Eloquent 모델 스코프를 `or` 쿼리 연산자로 조합하려면, [논리적 그룹화](/docs/9.x/queries#logical-grouping)를 위해 클로저를 사용해야 할 수도 있습니다.

```
$users = User::popular()->orWhere(function (Builder $query) {
    $query->active();
})->get();
```

하지만 이런 방식은 번거로울 수 있으므로, 라라벨은 "고차원" `orWhere` 메서드를 제공해 클로저 없이도 스코프들을 유연하게 체이닝할 수 있게 해줍니다.

```
$users = App\Models\User::popular()->orWhere->active()->get();
```

<a name="dynamic-scopes"></a>
#### 동적 스코프(Dynamic Scopes)

스코프에 파라미터(인수)를 전달하고 싶을 때도 있습니다. 이 경우, 스코프 메서드의 시그니처에 추가 인수를 작성하면 됩니다. 스코프의 인수는 항상 `$query` 인수 뒤에 정의해야 합니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 주어진 타입의 사용자만 포함하도록 쿼리에 스코프를 적용합니다.
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

필요한 인수가 스코프 메서드에 추가되었다면, 스코프를 호출할 때 인수를 전달할 수 있습니다.

```
$users = User::ofType('admin')->get();
```

<a name="comparing-models"></a>
## 모델 비교하기

가끔 두 모델이 "같은" 모델인지 판별해야 할 때가 있습니다. `is` 및 `isNot` 메서드를 이용하면 두 모델의 기본키, 테이블, 데이터베이스 커넥션이 같은지 빠르게 확인할 수 있습니다.

```
if ($post->is($anotherPost)) {
    //
}

if ($post->isNot($anotherPost)) {
    //
}
```

`is`와 `isNot` 메서드는 `belongsTo`, `hasOne`, `morphTo`, `morphOne`과 같은 [관계(relationships)](/docs/9.x/eloquent-relationships)에서도 사용할 수 있습니다. 이 기능은 관련된 모델을 쿼리로 조회하지 않고도 비교할 수 있다는 점에서 유용합니다.

```
if ($post->author()->is($user)) {
    //
}
```

<a name="events"></a>
## 이벤트

> [!NOTE]
> Eloquent 이벤트를 클라이언트 사이드 애플리케이션으로 직접 브로드캐스팅하고 싶으신가요? 라라벨의 [모델 이벤트 브로드캐스팅](/docs/9.x/broadcasting#model-broadcasting)을 참고하세요.

Eloquent 모델은 여러 이벤트를 발생시키며, 이를 통해 모델 생명주기에서 다음과 같은 시점에 후킹(hook)이 가능합니다: `retrieved`, `creating`, `created`, `updating`, `updated`, `saving`, `saved`, `deleting`, `deleted`, `trashed`, `forceDeleting`, `forceDeleted`, `restoring`, `restored`, `replicating`.

- `retrieved`: 기존 모델이 데이터베이스에서 조회될 때 발생합니다.
- 새 모델이 처음 저장될 때는 `creating`과 `created` 이벤트가 발생합니다.
- 기존 모델이 수정되고 `save` 메서드가 호출될 때는 `updating`/`updated` 이벤트가 발생합니다.
- 모델이 생성되거나 수정될 때(속성이 변경되지 않아도) `saving`/`saved` 이벤트가 발생합니다.
- 이벤트 이름이 `-ing`로 끝나는 경우는, 모델에 변경사항이 데이터베이스에 반영되기 **전**에 발생하며, `-ed`로 끝나면 반영된 **후**에 발생합니다.

모델 이벤트를 수신하려면, Eloquent 모델에 `$dispatchesEvents` 속성을 정의해야 합니다. 이 속성은 Eloquent 모델의 생명주기의 여러 지점과 여러분이 작성한 [이벤트 클래스](/docs/9.x/events)를 연결해줍니다. 각 모델 이벤트 클래스는 영향을 받는 모델 인스턴스를 생성자에서 받을 것으로 예상합니다.

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
     * 모델을 위한 이벤트 맵입니다.
     *
     * @var array
     */
    protected $dispatchesEvents = [
        'saved' => UserSaved::class,
        'deleted' => UserDeleted::class,
    ];
}
```

Eloquent 이벤트의 정의와 매핑을 마치면, [이벤트 리스너](/docs/9.x/events#defining-listeners)를 사용해 이벤트를 처리할 수 있습니다.

> [!WARNING]
> Eloquent를 통한 대량 업데이트나 삭제 쿼리를 실행하면, 해당 모델에 대해 `saved`, `updated`, `deleting`, `deleted` 이벤트가 **발생하지 않습니다**. 이는 실제로 대량 업데이트/삭제 시 모델을 조회하지 않기 때문에 그렇습니다.

<a name="events-using-closures"></a>
### 클로저(Closure)를 사용한 이벤트 등록

커스텀 이벤트 클래스 대신, 다양한 모델 이벤트가 발생할 때 실행할 클로저를 등록할 수도 있습니다. 일반적으로 이런 클로저들은 모델의 `booted` 메서드 내에 등록하면 됩니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 모델의 "booted" 메서드입니다.
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

필요하다면, [큐에 저장 가능한 익명 이벤트 리스너](/docs/9.x/events#queuable-anonymous-event-listeners)도 사용할 수 있습니다. 이를 사용하면, 이벤트 리스너가 애플리케이션의 [큐](/docs/9.x/queues)를 통해 백그라운드에서 실행되도록 라라벨에 지정할 수 있습니다.

```
use function Illuminate\Events\queueable;

static::created(queueable(function ($user) {
    //
}));
```

<a name="observers"></a>
### 옵저버(Observers)

<a name="defining-observers"></a>
#### 옵저버 정의하기

하나의 모델에서 여러 이벤트를 동시에 관찰(listen)하고 싶을 경우, 여러 리스너를 하나의 클래스에 그룹화할 수 있는 옵저버를 사용할 수 있습니다. 옵저버 클래스는 감지하고자 하는 Eloquent 이벤트와 이름이 동일한 메서드를 가집니다. 각 메서드는 영향을 받는 모델을 유일한 인수로 받습니다. 새로운 옵저버 클래스를 생성하는 가장 쉬운 방법은 `make:observer` Artisan 명령어를 사용하는 것입니다.

```shell
php artisan make:observer UserObserver --model=User
```

이 명령어는 새로운 옵저버 파일을 `app/Observers` 디렉토리에 생성합니다. 해당 디렉토리가 없다면 Artisan이 자동으로 만들어줍니다. 생성된 옵저버 클래스의 기본 구조는 아래와 같습니다.

```
<?php

namespace App\Observers;

use App\Models\User;

class UserObserver
{
    /**
     * User "created" 이벤트 처리
     *
     * @param  \App\Models\User  $user
     * @return void
     */
    public function created(User $user)
    {
        //
    }

    /**
     * User "updated" 이벤트 처리
     *
     * @param  \App\Models\User  $user
     * @return void
     */
    public function updated(User $user)
    {
        //
    }

    /**
     * User "deleted" 이벤트 처리
     *
     * @param  \App\Models\User  $user
     * @return void
     */
    public function deleted(User $user)
    {
        //
    }
    
    /**
     * User "restored" 이벤트 처리
     *
     * @param  \App\Models\User  $user
     * @return void
     */
    public function restored(User $user)
    {
        //
    }

    /**
     * User "forceDeleted" 이벤트 처리
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

옵저버를 등록하려면, 관찰하고자 하는 모델에서 `observe` 메서드를 호출하면 됩니다. 대개는 애플리케이션의 `App\Providers\EventServiceProvider` 서비스 프로바이더의 `boot` 메서드에서 옵저버를 등록합니다.

```
use App\Models\User;
use App\Observers\UserObserver;

/**
 * 애플리케이션을 위한 이벤트를 등록합니다.
 *
 * @return void
 */
public function boot()
{
    User::observe(UserObserver::class);
}
```

또는, 애플리케이션의 `App\Providers\EventServiceProvider` 클래스의 `$observers` 속성에 옵저버를 나열해 둘 수도 있습니다.

```
use App\Models\User;
use App\Observers\UserObserver;

/**
 * 애플리케이션의 모델 옵저버입니다.
 *
 * @var array
 */
protected $observers = [
    User::class => [UserObserver::class],
];
```

> [!NOTE]
> 옵저버에서 감지할 수 있는 이벤트는 `saving`, `retrieved` 등 더 다양하게 있습니다. 자세한 내용은 [이벤트](#events) 문서에서 확인할 수 있습니다.

<a name="observers-and-database-transactions"></a>

#### 옵저버와 데이터베이스 트랜잭션

모델이 데이터베이스 트랜잭션 내에서 생성될 때, 옵저버의 이벤트 핸들러가 트랜잭션이 커밋된 이후에만 실행되도록 지정하고 싶을 때가 있습니다. 이럴 때는 옵저버 클래스에 `$afterCommit` 속성을 정의하면 됩니다. 만약 데이터베이스 트랜잭션이 진행 중이 아니라면, 이벤트 핸들러는 즉시 실행됩니다.

```
<?php

namespace App\Observers;

use App\Models\User;

class UserObserver
{
    /**
     * 모든 트랜잭션이 커밋된 후에 이벤트를 처리합니다.
     *
     * @var bool
     */
    public $afterCommit = true;

    /**
     * User "created" 이벤트를 처리합니다.
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
### 이벤트 무시(Muting Events)

가끔 모델에서 발생하는 모든 이벤트를 일시적으로 "무시"하고 싶을 때가 있습니다. 이 경우에는 `withoutEvents` 메서드를 사용하면 됩니다. `withoutEvents` 메서드는 하나의 클로저를 인수로 받으며, 해당 클로저 내에서 실행되는 모든 코드는 모델 이벤트를 발생시키지 않습니다. 또한, 클로저가 반환한 값이 곧 `withoutEvents` 메서드의 반환값이 됩니다.

```
use App\Models\User;

$user = User::withoutEvents(function () {
    User::findOrFail(1)->delete();

    return User::find(2);
});
```

<a name="saving-a-single-model-without-events"></a>
#### 단일 모델 저장 시 이벤트 발생하지 않게 하기

특정 모델을 저장하면서 이벤트를 발생시키고 싶지 않을 때도 있습니다. 이럴 때는 `saveQuietly` 메서드를 사용하면 이벤트가 실행되지 않습니다.

```
$user = User::findOrFail(1);

$user->name = 'Victoria Faith';

$user->saveQuietly();
```

또한, 주어진 모델에 대해 이벤트를 발생시키지 않고 "update", "delete", "soft delete", "restore", "replicate" 등도 실행할 수 있습니다.

```
$user->deleteQuietly();
$user->forceDeleteQuietly();
$user->restoreQuietly();
```