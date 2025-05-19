# 라라벨 스카우트 (Laravel Scout)

- [소개](#introduction)
- [설치](#installation)
    - [큐 사용하기](#queueing)
- [드라이버 사전 준비](#driver-prerequisites)
    - [Algolia](#algolia)
    - [Meilisearch](#meilisearch)
    - [Typesense](#typesense)
- [설정](#configuration)
    - [모델 인덱스 설정](#configuring-model-indexes)
    - [검색 대상 데이터 설정](#configuring-searchable-data)
    - [모델 ID 설정](#configuring-the-model-id)
    - [모델별 검색 엔진 설정](#configuring-search-engines-per-model)
    - [사용자 식별하기](#identifying-users)
- [데이터베이스 / 컬렉션 엔진](#database-and-collection-engines)
    - [데이터베이스 엔진](#database-engine)
    - [컬렉션 엔진](#collection-engine)
- [인덱싱](#indexing)
    - [일괄 가져오기](#batch-import)
    - [레코드 추가하기](#adding-records)
    - [레코드 업데이트하기](#updating-records)
    - [레코드 삭제하기](#removing-records)
    - [인덱싱 일시 중단하기](#pausing-indexing)
    - [조건부로 인덱싱할 모델 인스턴스](#conditionally-searchable-model-instances)
- [검색하기](#searching)
    - [Where 절](#where-clauses)
    - [페이지네이션](#pagination)
    - [소프트 삭제 처리](#soft-deleting)
    - [엔진 검색 커스터마이징](#customizing-engine-searches)
- [커스텀 엔진](#custom-engines)

<a name="introduction"></a>
## 소개

[Laravel Scout](https://github.com/laravel/scout)는 [Eloquent 모델](/docs/10.x/eloquent)에 전체 텍스트 검색 기능을 간편하게 추가할 수 있도록 드라이버 기반의 솔루션을 제공합니다. Scout는 모델 옵저버를 활용하여, Eloquent 레코드와 검색 인덱스가 자동으로 동기화되도록 도와줍니다.

현재 Scout는 [Algolia](https://www.algolia.com/), [Meilisearch](https://www.meilisearch.com), [Typesense](https://typesense.org), 그리고 MySQL / PostgreSQL(`database`) 드라이버를 기본 제공하고 있습니다. 또한 별도의 외부 의존성이나 서드파티 서비스가 필요 없는, 로컬 개발용 "collection" 드라이버도 포함되어 있습니다. 그 외에 직접 커스텀 드라이버를 작성하는 것도 간단하여, Scout를 원하는 검색 엔진과 쉽게 확장할 수 있습니다.

<a name="installation"></a>
## 설치

먼저, Composer 패키지 매니저를 사용하여 Scout를 설치합니다.

```shell
composer require laravel/scout
```

설치가 완료되면, `vendor:publish` Artisan 명령어로 Scout의 설정 파일을 애플리케이션의 `config` 디렉토리에 게시해야 합니다. 아래 명령어를 실행하면 `scout.php` 설정 파일이 생성됩니다.

```shell
php artisan vendor:publish --provider="Laravel\Scout\ScoutServiceProvider"
```

마지막으로, 검색이 가능하도록 만들고 싶은 모델에 `Laravel\Scout\Searchable` 트레이트를 추가합니다. 이 트레이트는 모델 옵저버를 등록하여, 모델이 검색 드라이버와 자동으로 동기화되도록 합니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class Post extends Model
{
    use Searchable;
}
```

<a name="queueing"></a>
### 큐 사용하기

Scout를 사용할 때 반드시 필요한 것은 아니지만, [큐 드라이버](/docs/10.x/queues)를 먼저 설정해두는 것이 권장됩니다. 큐 워커를 동작하게 하면, 모델 정보를 검색 인덱스에 동기화하는 모든 작업을 큐잉하여, 애플리케이션의 웹 인터페이스 응답 속도를 훨씬 더 빠르게 만들 수 있습니다.

큐 드라이버를 설정한 후에는 `config/scout.php` 설정 파일의 `queue` 옵션 값을 `true`로 변경합니다.

```
'queue' => true,
```

`queue` 옵션을 `false`로 설정하더라도, Algolia나 Meilisearch와 같은 일부 Scout 드라이버는 항상 비동기적으로 레코드를 인덱싱한다는 점을 기억해야 합니다. 즉, 라라벨 애플리케이션의 인덱스 작업이 완료되어도, 해당 검색 엔진에서는 새로운 레코드나 업데이트된 레코드가 즉시 반영되지 않을 수 있습니다.

Scout 작업에 사용할 연결(connection)과 큐(queue)를 지정하려면, `queue` 설정 항목을 배열로 정의하면 됩니다.

```
'queue' => [
    'connection' => 'redis',
    'queue' => 'scout'
],
```

이렇게 Scout 작업에 사용할 연결과 큐를 커스터마이즈한 경우에는, 반드시 해당 연결과 큐에서 작업을 처리할 큐 워커를 실행해야 합니다.

```
php artisan queue:work redis --queue=scout
```

<a name="driver-prerequisites"></a>
## 드라이버 사전 준비

<a name="algolia"></a>
### Algolia

Algolia 드라이버를 사용할 경우, `config/scout.php` 파일에서 Algolia의 `id`와 `secret` 자격 증명을 설정해야 합니다. 자격 증명을 등록한 후에는 Composer를 통해 Algolia PHP SDK도 설치해야 합니다.

```shell
composer require algolia/algoliasearch-client-php
```

<a name="meilisearch"></a>
### Meilisearch

[Meilisearch](https://www.meilisearch.com)는 매우 빠르고 오픈 소스인 검색 엔진입니다. 로컬 PC에서 Meilisearch를 설치하는 방법을 잘 모르신다면, [Laravel Sail](/docs/10.x/sail#meilisearch)을 활용하실 수 있습니다. Sail은 라라벨 공식 Docker 개발 환경입니다.

Meilisearch 드라이버를 사용하려면 Composer로 Meilisearch PHP SDK를 설치해야 합니다.

```shell
composer require meilisearch/meilisearch-php http-interop/http-factory-guzzle
```

그 다음, `.env` 파일에 `SCOUT_DRIVER` 환경 변수와 Meilisearch의 `host`, `key` 자격 증명을 등록합니다.

```ini
SCOUT_DRIVER=meilisearch
MEILISEARCH_HOST=http://127.0.0.1:7700
MEILISEARCH_KEY=masterKey
```

Meilisearch에 대한 더 자세한 정보는 [Meilisearch 공식 문서](https://docs.meilisearch.com/learn/getting_started/quick_start.html)를 참고하시기 바랍니다.

또한 사용 중인 Meilisearch 바이너리 버전에 호환되는 `meilisearch/meilisearch-php` 버전을 설치하였는지 [Meilisearch의 바이너리 호환성 문서](https://github.com/meilisearch/meilisearch-php#-compatibility-with-meilisearch)에서 확인해야 합니다.

> [!WARNING]
> Meilisearch를 사용하는 애플리케이션에서 Scout를 업그레이드할 때에는, Meilisearch 서비스 자체에 대한 [추가적인 브레이킹 체인지](https://github.com/meilisearch/Meilisearch/releases)가 있는지 반드시 확인해야 합니다.

<a name="typesense"></a>
### Typesense

[Typesense](https://typesense.org)는 매우 빠른 오픈소스 검색 엔진으로, 키워드 검색, 시맨틱 검색, 위치 기반 검색, 벡터 검색 등을 지원합니다.

[Typesense를 직접 호스팅](https://typesense.org/docs/guide/install-typesense.html#option-2-local-machine-self-hosting)하거나, [Typesense Cloud](https://cloud.typesense.org)를 사용할 수 있습니다.

Scout에서 Typesense를 사용하려면 Composer로 Typesense PHP SDK를 설치합니다.

```shell
composer require typesense/typesense-php
```

그리고, `.env` 파일에 `SCOUT_DRIVER` 환경 변수와 Typesense의 host, API key 정보를 다음과 같이 설정합니다.

```env
SCOUT_DRIVER=typesense
TYPESENSE_API_KEY=masterKey
TYPESENSE_HOST=localhost
```

필요하다면 포트, 경로, 프로토콜 옵션도 지정할 수 있습니다.

```env
TYPESENSE_PORT=8108
TYPESENSE_PATH=
TYPESENSE_PROTOCOL=http
```

Typesense 컬렉션을 위한 추가 설정 및 스키마 정의는 애플리케이션의 `config/scout.php` 파일에서 확인할 수 있습니다. Typesense에 관한 더 자세한 안내는 [Typesense 공식 문서](https://typesense.org/docs/guide/#quick-start)를 참고하세요.

<a name="preparing-data-for-storage-in-typesense"></a>
#### Typesense에 저장할 데이터 준비하기

Typesense를 사용할 때는 검색 가능한 모델에서 `toSearchableArray` 메서드를 정의해야 하며, 여기에서는 모델의 기본 키(primary key)를 문자열로, 생성일을 UNIX 타임스탬프로 변환해서 제공해야 합니다.

```php
/**
 * Get the indexable data array for the model.
 *
 * @return array<string, mixed>
 */
public function toSearchableArray()
{
    return array_merge($this->toArray(),[
        'id' => (string) $this->id,
        'created_at' => $this->created_at->timestamp,
    ]);
}
```

또한 `config/scout.php` 파일에 Typesense 컬렉션 스키마를 정의해야 합니다. 컬렉션 스키마는 Typesense에서 검색 가능한 각 필드의 데이터 타입을 묘사합니다. 모든 가능한 스키마 옵션에 대한 자세한 내용은 [Typesense 문서](https://typesense.org/docs/latest/api/collections.html#schema-parameters)를 참고하세요.

정의된 후에 Typesense 컬렉션 스키마를 수정해야 할 경우, `scout:flush`와 `scout:import` 커맨드를 실행할 수 있습니다. 이는 인덱싱된 모든 데이터를 삭제하고 스키마를 재생성합니다. 또는 Typesense API를 사용하여 인덱싱된 데이터를 삭제하지 않고 컬렉션 스키마를 수정할 수도 있습니다.

검색 가능한 모델이 소프트 삭제(soft delete) 기능을 사용한다면, 해당 모델의 Typesense 스키마에 `__soft_deleted` 필드를 정의해야 합니다.

```php
User::class => [
    'collection-schema' => [
        'fields' => [
            // ...
            [
                'name' => '__soft_deleted',
                'type' => 'int32',
                'optional' => true,
            ],
        ],
    ],
],
```

<a name="typesense-dynamic-search-parameters"></a>
#### 동적 검색 파라미터

Typesense에서는 검색 작업을 수행할 때 `options` 메서드를 통해 [검색 파라미터](https://typesense.org/docs/latest/api/search.html#search-parameters)를 동적으로 수정할 수 있습니다.

```php
use App\Models\Todo;

Todo::search('Groceries')->options([
    'query_by' => 'title, description'
])->get();
```

<a name="configuration"></a>
## 설정

<a name="configuring-model-indexes"></a>
### 모델 인덱스 설정

각 Eloquent 모델은 해당 모델의 모든 검색 가능한 레코드를 포함하는 특정 검색 "인덱스"와 자동으로 동기화됩니다. 쉽게 말해, 각 인덱스는 MySQL 테이블과 비슷하다고 볼 수 있습니다. 기본적으로 각 모델은 모델의 보통 "테이블" 이름과 일치하는 인덱스로 저장됩니다. 일반적으로 이는 모델 이름의 복수형입니다. 하지만, 모델의 `searchableAs` 메서드를 오버라이드하여 인덱스 이름을 자유롭게 커스터마이즈할 수 있습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class Post extends Model
{
    use Searchable;

    /**
     * Get the name of the index associated with the model.
     */
    public function searchableAs(): string
    {
        return 'posts_index';
    }
}
```

<a name="configuring-searchable-data"></a>
### 검색 대상 데이터 설정

기본적으로, 모델의 전체 `toArray` 결과가 해당 검색 인덱스에 자동으로 포함됩니다. 만약 검색 인덱스에 동기화할 데이터를 직접 커스터마이즈하고 싶다면, 모델의 `toSearchableArray` 메서드를 오버라이드하면 됩니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class Post extends Model
{
    use Searchable;

    /**
     * Get the indexable data array for the model.
     *
     * @return array<string, mixed>
     */
    public function toSearchableArray(): array
    {
        $array = $this->toArray();

        // 데이터 배열 커스터마이징...

        return $array;
    }
}
```

Meilisearch와 같은 일부 검색 엔진은 데이터 타입이 정확한 경우에만 필터 연산(`>`, `<` 등)을 수행할 수 있습니다. 따라서 이런 엔진을 사용할 때 검색 가능 데이터의 숫자 값은 올바른 타입으로 변환해야 합니다.

```
public function toSearchableArray()
{
    return [
        'id' => (int) $this->id,
        'name' => $this->name,
        'price' => (float) $this->price,
    ];
}
```

<a name="configuring-filterable-data-for-meilisearch"></a>
#### 필터 가능한 데이터 및 인덱스 설정 (Meilisearch)

Scout의 다른 드라이버들과 달리, Meilisearch에서는 미리 인덱스 검색 설정(필터 가능한 속성, 정렬 가능한 속성, 그리고 [기타 지원되는 설정 필드](https://docs.meilisearch.com/reference/api/settings.html) 등)을 정의해야 합니다.

필터 가능한 속성은 Scout의 `where` 메서드로 필터링할 계획이 있는 속성이고, 정렬 가능한 속성은 `orderBy` 메서드로 정렬할 계획이 있는 속성을 의미합니다. 아래와 같이 `scout` 설정 파일의 `meilisearch` 항목에서 `index-settings` 부분을 수정하면 됩니다.

```php
use App\Models\User;
use App\Models\Flight;

'meilisearch' => [
    'host' => env('MEILISEARCH_HOST', 'http://localhost:7700'),
    'key' => env('MEILISEARCH_KEY', null),
    'index-settings' => [
        User::class => [
            'filterableAttributes'=> ['id', 'name', 'email'],
            'sortableAttributes' => ['created_at'],
            // 기타 설정 필드...
        ],
        Flight::class => [
            'filterableAttributes'=> ['id', 'destination'],
            'sortableAttributes' => ['updated_at'],
        ],
    ],
],
```

특정 인덱스의 모델이 소프트 삭제 가능(soft deletable)하고, 해당 모델이 `index-settings` 배열에 포함되어 있다면, Scout는 해당 인덱스에서 소프트 삭제 모델 필터 기능을 자동으로 지원합니다. 필터나 정렬 속성을 별도로 지정할 필요가 없는 경우에는 빈 배열로 해당 모델을 추가해도 됩니다.

```php
'index-settings' => [
    Flight::class => []
],
```

애플리케이션의 인덱스 설정을 완료했다면, `scout:sync-index-settings` Artisan 명령을 실행해야 합니다. 이 명령은 현재 설정된 인덱스 정보를 Meilisearch에 전달합니다. 실제 서비스 배포 과정에 이 명령을 포함시키는 것도 좋은 방법입니다.

```shell
php artisan scout:sync-index-settings
```

<a name="configuring-the-model-id"></a>
### 모델 ID 설정

기본적으로, Scout는 모델의 기본 키(primary key)를 고유 ID/키로 사용하여 검색 인덱스에 저장합니다. 이 동작을 변경하려면 모델의`getScoutKey`와 `getScoutKeyName` 메서드를 오버라이드하면 됩니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class User extends Model
{
    use Searchable;

    /**
     * Get the value used to index the model.
     */
    public function getScoutKey(): mixed
    {
        return $this->email;
    }

    /**
     * Get the key name used to index the model.
     */
    public function getScoutKeyName(): mixed
    {
        return 'email';
    }
}
```

<a name="configuring-search-engines-per-model"></a>
### 모델별 검색 엔진 설정

기본적으로 Scout는 애플리케이션의 `scout` 설정 파일에 지정한 기본 검색 엔진을 사용합니다. 하지만, 특정 모델에 대해 사용할 검색 엔진을 변경하려면, 해당 모델에서 `searchableUsing` 메서드를 오버라이드하면 됩니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Engines\Engine;
use Laravel\Scout\EngineManager;
use Laravel\Scout\Searchable;

class User extends Model
{
    use Searchable;

    /**
     * Get the engine used to index the model.
     */
    public function searchableUsing(): Engine
    {
        return app(EngineManager::class)->engine('meilisearch');
    }
}
```

<a name="identifying-users"></a>
### 사용자 식별하기

Scout는 [Algolia](https://algolia.com) 드라이버를 사용할 때, 검색 연산에 대해 인증된 사용자를 자동으로 식별하는 기능을 제공합니다. 사용자를 검색 요청과 연관지으면 Algolia의 대시보드에서 검색 분석을 할 때 유용합니다. 이 기능을 활성화하려면 애플리케이션의 `.env` 파일에 `SCOUT_IDENTIFY` 환경 변수를 `true`로 설정합니다.

```ini
SCOUT_IDENTIFY=true
```

이 옵션을 활성화하면, 요청자의 IP 주소와 인증된 사용자의 기본 식별자(primary identifier)가 Algolia에 전달되어 검색 요청에 함께 기록됩니다.

<a name="database-and-collection-engines"></a>
## 데이터베이스 / 컬렉션 엔진

<a name="database-engine"></a>
### 데이터베이스 엔진

> [!WARNING]
> 데이터베이스 엔진은 현재 MySQL과 PostgreSQL만 지원합니다.

애플리케이션이 소규모~중간 규모 데이터베이스를 다루거나, 작업 부하가 가벼운 경우에는 Scout의 "database" 엔진을 사용하는 것이 더 편리할 수 있습니다. 데이터베이스 엔진은 기존 데이터베이스에서 "where like" 절과 전체 텍스트 인덱스를 활용하여 적합한 검색 결과를 필터링합니다.

데이터베이스 엔진을 사용하려면 `.env` 파일에 `SCOUT_DRIVER` 환경 변수 값을 `database`로 설정하거나, `scout` 설정 파일에서 `database` 드라이버를 직접 지정하면 됩니다.

```ini
SCOUT_DRIVER=database
```

데이터베이스 엔진을 기본 드라이버로 지정한 후에는 반드시 [검색 대상 데이터 설정](#configuring-searchable-data)을 마쳐야 하며, 이후부터 [검색 쿼리 실행](#searching)을 시작할 수 있습니다. Algolia, Meilisearch, Typesense에 필요한 인덱싱 작업은 데이터베이스 엔진을 사용할 때는 필요하지 않습니다.

#### 데이터베이스 검색 전략 커스터마이징

기본적으로, 데이터베이스 엔진은 [검색 대상으로 지정한](#configuring-searchable-data) 모든 모델 속성에 대해 "where like" 쿼리를 실행합니다. 하지만, 경우에 따라 이렇게 하면 성능이 저하될 수 있습니다. 이를 위해 공통 전략 대신, 일부 컬럼에는 전체 텍스트 검색 쿼리를 사용하거나, 문자열의 접두어만(예: `example%`) 검색하는 "where like" 제약 조건만 사용하도록 지정할 수 있습니다.

이 동작을 지정하려면, 모델의 `toSearchableArray` 메서드 위에 PHP 속성(attributes)을 할당하면 됩니다. 각 컬럼에 별도의 검색 전략을 적용하지 않으면 기본 "where like" 전략이 계속 사용됩니다.

```php
use Laravel\Scout\Attributes\SearchUsingFullText;
use Laravel\Scout\Attributes\SearchUsingPrefix;

/**
 * Get the indexable data array for the model.
 *
 * @return array<string, mixed>
 */
#[SearchUsingPrefix(['id', 'email'])]
#[SearchUsingFullText(['bio'])]
public function toSearchableArray(): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        'bio' => $this->bio,
    ];
}
```

> [!WARNING]
> 컬럼에 전체 텍스트 쿼리 제약 조건을 사용할 경우에는, 해당 컬럼에 [전체 텍스트 인덱스](/docs/10.x/migrations#available-index-types)가 반드시 생성되어 있어야 합니다.

<a name="collection-engine"></a>
### 컬렉션 엔진

로컬 개발 중 Algolia, Meilisearch, Typesense 엔진을 사용하는 것도 자유롭지만, 보다 간단하게 시작하려면 "collection" 엔진을 사용할 수도 있습니다. 컬렉션 엔진은 모델의 검색 결과를 기존 데이터베이스에서 "where" 절과 컬렉션 필터링을 활용하여 결정합니다. 이 엔진에서는 검색 모델을 "인덱싱"할 필요가 없으며, 단순히 로컬 데이터베이스에서 값을 가져옵니다.

컬렉션 엔진을 사용하려면 `.env` 파일에서 `SCOUT_DRIVER` 값을 `collection`으로 설정하거나, `scout` 설정 파일에서 `collection` 드라이버를 직접 지정하면 됩니다.

```ini
SCOUT_DRIVER=collection
```

컬렉션 드라이버를 기본 드라이버로 지정하면, 바로 [검색 쿼리 실행](#searching)을 시작할 수 있습니다. Algolia, Meilisearch, Typesense에서 요구하는 인덱싱 작업은 컬렉션 엔진을 사용할 때 필요하지 않습니다.

#### 데이터베이스 엔진과의 차이점

겉보기에는 "database" 엔진과 "collection" 엔진이 거의 비슷해 보입니다. 둘 다 데이터베이스에서 직접 검색 결과를 가져옵니다. 하지만 컬렉션 엔진은 전체 텍스트 인덱스나 `LIKE` 절을 활용하지 않고, 모든 가능한 레코드를 읽어들인 후 라라벨의 `Str::is` 헬퍼를 이용해 검색어가 속성값 안에 있는지 판단합니다.

컬렉션 엔진은 라라벨이 지원하는 모든 관계형 데이터베이스(SQLite, SQL Server 등)에서 동작하므로 이식성이 가장 높지만, 성능 면에서는 database 엔진보다 효율이 낮습니다.

<a name="indexing"></a>
## 인덱싱

<a name="batch-import"></a>
### 일괄 가져오기

기존 프로젝트에 Scout를 도입하는 경우, 이미 존재하는 데이터베이스 레코드를 검색 인덱스로 가져와야 할 수 있습니다. Scout는 `scout:import` Artisan 명령어를 제공하여, 기존 레코드 전체를 한 번에 인덱싱할 수 있습니다.

```shell
php artisan scout:import "App\Models\Post"
```

`flush` 명령어를 사용하면, 해당 모델의 모든 레코드를 검색 인덱스에서 제거할 수 있습니다.

```shell
php artisan scout:flush "App\Models\Post"
```

<a name="modifying-the-import-query"></a>
#### 가져오기 쿼리 커스터마이징

일괄 인덱싱을 위한 모델 조회 쿼리를 수정하고 싶다면, 모델에 `makeAllSearchableUsing` 메서드를 정의하면 됩니다. 이곳에서는 필요에 따라 관계(relationship)를 미리 로드하는 등 추가 쿼리 설정을 할 수 있습니다.

```
use Illuminate\Database\Eloquent\Builder;

/**
 * Modify the query used to retrieve models when making all of the models searchable.
 */
protected function makeAllSearchableUsing(Builder $query): Builder
{
    return $query->with('author');
}
```

> [!WARNING]
> 모델 일괄 인덱싱 시 큐를 사용하는 경우에는 `makeAllSearchableUsing` 메서드가 적용되지 않을 수 있습니다. 큐에서 작업을 수행하면 [관계 데이터가 복원되지 않기 때문](/docs/10.x/queues#handling-relationships)입니다.

<a name="adding-records"></a>
### 레코드 추가하기

모델에 `Laravel\Scout\Searchable` 트레이트를 적용하고 나면, 단순히 모델 인스턴스를 `save` 또는 `create`할 때마다 검색 인덱스에도 자동으로 추가됩니다. Scout에서 [큐 사용](#queueing)을 설정했다면, 이 작업은 백그라운드에서 큐 워커가 처리하게 됩니다.

```
use App\Models\Order;

$order = new Order;

// ...

$order->save();
```

<a name="adding-records-via-query"></a>
#### 쿼리로 레코드 추가하기

Eloquent 쿼리를 이용해 여러 모델을 한꺼번에 검색 인덱스에 추가하고 싶다면, Eloquent 쿼리 뒤에 `searchable` 메서드를 연결하면 됩니다. 이 메서드는 쿼리 결과를 [청크로 나누어](/docs/10.x/eloquent#chunking-results) 각각 인덱스에 추가합니다. Scout에서 큐를 사용할 때는 각 청크가 큐 워커를 통해 백그라운드에서 처리됩니다.

```
use App\Models\Order;

Order::where('price', '>', 100)->searchable();
```

Eloquent 관계 인스턴스에서도 `searchable` 메서드를 사용할 수 있습니다.

```
$user->orders()->searchable();
```

또는, 이미 Eloquent 모델 컬렉션을 메모리에 가지고 있다면, 컬렉션 인스턴스에서 `searchable` 메서드를 호출하여 각 모델 인스턴스를 인덱스에 추가할 수 있습니다.

```
$orders->searchable();
```

> [!NOTE]
> `searchable` 메서드는 "upsert" 연산과 유사하게 동작합니다. 즉, 인덱스에 이미 해당 모델 레코드가 있으면 업데이트되고, 존재하지 않을 경우 인덱스에 새롭게 추가됩니다.

<a name="updating-records"></a>
### 레코드 업데이트하기

검색 가능한 모델을 업데이트하려면, 단순히 해당 모델 인스턴스의 속성을 수정하고 `save`하면 됩니다. Scout가 변경 내용을 자동으로 검색 인덱스에 반영합니다.

```
use App\Models\Order;

$order = Order::find(1);

// 주문 정보 업데이트...

$order->save();
```

여러 모델을 한꺼번에 업데이트하려면 Eloquent 쿼리에 `searchable` 메서드를 붙이면 됩니다. 만약 인덱스에 존재하지 않는 모델이라면 새로 생성됩니다.

```
Order::where('price', '>', 100)->searchable();
```

관계에 걸친 모든 모델의 검색 인덱스를 업데이트하려면 관계 인스턴스에 `searchable`을 적용합니다.

```
$user->orders()->searchable();
```

이미 메모리에 모델 컬렉션이 있다면, 해당 컬렉션에서 `searchable` 메서드를 호출해 각 인스턴스의 인덱스를 업데이트할 수 있습니다.

```
$orders->searchable();
```

<a name="modifying-records-before-importing"></a>
#### 인덱싱 전 레코드 가공하기

검색 인덱스화 하기 전에, 데이터 컬렉션을 미리 처리(예: 관계 데이터 미리 로드 등)해야 할 필요가 있다면, 해당 모델에 `makeSearchableUsing` 메서드를 정의할 수 있습니다.

```
use Illuminate\Database\Eloquent\Collection;

/**
 * Modify the collection of models being made searchable.
 */
public function makeSearchableUsing(Collection $models): Collection
{
    return $models->load('author');
}
```

<a name="removing-records"></a>
### 레코드 삭제하기

검색 인덱스에서 레코드를 삭제하려면, 데이터베이스에서 해당 모델을 단순히 `delete`하면 됩니다. 소프트 삭제를 사용하는 모델에서도 동일하게 동작합니다.

```
use App\Models\Order;

$order = Order::find(1);

$order->delete();
```

모델을 미리 조회하지 않고 바로 삭제하고 싶다면, Eloquent 쿼리 인스턴스에서 `unsearchable` 메서드를 사용할 수 있습니다.

```
Order::where('price', '>', 100)->unsearchable();
```

관계에 속한 모든 모델의 검색 인덱스를 삭제하고 싶다면, 관계 인스턴스에 `unsearchable`을 호출하면 됩니다.

```
$user->orders()->unsearchable();
```

이미 컬렉션으로 보유한 모델 인스턴스를 모두 검색 인덱스에서 제거하려면 컬렉션에서 `unsearchable`을 호출합니다.

```
$orders->unsearchable();
```

<a name="pausing-indexing"></a>
### 인덱싱 일시 중단하기

여러 Eloquent 작업을 한 번에 수행하되, 해당 작업이 검색 인덱스에 반영되지 않도록 하고 싶을 때는 `withoutSyncingToSearch` 메서드를 사용하면 됩니다. 이 메서드는 바로 실행되는 단일 클로저를 인자로 받으며, 클로저 내부에서 수행한 모든 모델 작업이 검색 엔진에는 반영되지 않습니다.

```
use App\Models\Order;

Order::withoutSyncingToSearch(function () {
    // 여기서 여러 모델 작업 수행...
});
```

<a name="conditionally-searchable-model-instances"></a>
### 조건부로 인덱싱할 모델 인스턴스

어떤 모델은 특정 조건일 때만 검색 가능하게 만들고 싶을 수 있습니다. 예를 들어, `App\Models\Post` 모델이 "draft"(임시저장) 또는 "published"(게시) 상태를 가질 수 있을 때, "published"된 글만 검색 가능하게 하고 싶다면 모델에 `shouldBeSearchable` 메서드를 정의하면 됩니다.

```
/**
 * Determine if the model should be searchable.
 */
public function shouldBeSearchable(): bool
{
    return $this->isPublished();
}
```

`shouldBeSearchable` 메서드는 `save`, `create`, 쿼리, 관계 등을 통해 모델을 다룰 때에만 적용됩니다. 개별적으로 모델이나 컬렉션에 직접적으로 `searchable`을 호출하는 경우에는 이 메서드의 동작이 무시됩니다.

> [!WARNING]
> "database" 엔진을 사용할 때는 `shouldBeSearchable` 메서드가 적용되지 않습니다. "database" 엔진에서는 모든 데이터가 항상 데이터베이스에 저장되기 때문입니다. 이와 유사한 동작이 필요하다면 [where 절](#where-clauses)을 활용해야 합니다.

<a name="searching"></a>
## 검색하기

모델의 `search` 메서드를 이용하여 검색을 시작할 수 있습니다. `search` 메서드는 검색에 사용할 하나의 문자열을 인수로 받고, 이어서 `get` 메서드를 호출하면 해당 쿼리에 매칭되는 Eloquent 모델 컬렉션을 반환합니다.

```
use App\Models\Order;

$orders = Order::search('Star Trek')->get();
```

Scout 검색 결과는 Eloquent 모델의 컬렉션이므로, 라우트나 컨트롤러에서 바로 반환하면 자동으로 JSON으로 변환됩니다.

```
use App\Models\Order;
use Illuminate\Http\Request;

Route::get('/search', function (Request $request) {
    return Order::search($request->search)->get();
});
```

검색 결과를 Eloquent 모델로 변환하기 전의 "원시" 검색 결과를 얻고 싶다면 `raw` 메서드를 사용하면 됩니다.

```
$orders = Order::search('Star Trek')->raw();
```

<a name="custom-indexes"></a>
#### 커스텀 인덱스 사용

일반적으로 검색 쿼리는 모델의 [`searchableAs`](#configuring-model-indexes) 메서드에서 지정한 인덱스에서 실행됩니다. 하지만, `within` 메서드를 사용하면 임의의 커스텀 인덱스에서 검색을 실행할 수도 있습니다.

```
$orders = Order::search('Star Trek')
    ->within('tv_shows_popularity_desc')
    ->get();
```

<a name="where-clauses"></a>
### Where 절

Scout는 검색 쿼리에 간단한 "where" 절을 추가할 수 있습니다. 이 기능은 현재 기본적인 숫자형 동등 비교만 지원되며, 주로 소유자 ID 등에 범위를 제한할 때 유용합니다.

```
use App\Models\Order;

$orders = Order::search('Star Trek')->where('user_id', 1)->get();
```

`whereIn` 메서드를 쓰면, 특정 컬럼의 값이 주어진 배열에 속하는지 검사할 수 있습니다.

```
$orders = Order::search('Star Trek')->whereIn(
    'status', ['open', 'paid']
)->get();
```

`whereNotIn` 메서드는 주어진 컬럼의 값이 배열에 포함되지 않았는지 검사합니다.

```
$orders = Order::search('Star Trek')->whereNotIn(
    'status', ['closed']
)->get();
```

검색 인덱스는 관계형 데이터베이스가 아니기 때문에, 이 외의 더 복잡한 "where" 절은 현재 지원되지 않습니다.

> [!WARNING]
> Meilisearch를 사용할 경우, 반드시 [필터 가능한 속성](#configuring-filterable-data-for-meilisearch)을 먼저 설정해야 Scout의 "where" 절을 정상적으로 사용할 수 있습니다.

<a name="pagination"></a>
### 페이지네이션

검색 결과를 컬렉션으로만 받는 것 외에도, `paginate` 메서드를 활용해 결과를 페이지네이션할 수 있습니다. 이 메서드는 [기존 Eloquent 쿼리에서 페이지네이션할 때](/docs/10.x/pagination)와 동일하게 `Illuminate\Pagination\LengthAwarePaginator` 인스턴스를 반환합니다.

```
use App\Models\Order;

$orders = Order::search('Star Trek')->paginate();
```

페이지 당 모델 수를 지정하려면, `paginate`의 첫 번째 인자로 원하는 숫자를 전달하면 됩니다.

```
$orders = Order::search('Star Trek')->paginate(15);
```

결과를 얻은 후에는, 기존 Blade와 동일하게 결과 목록을 보여주고 페이지 링크를 출력할 수 있습니다.

```html
<div class="container">
    @foreach ($orders as $order)
        {{ $order->price }}
    @endforeach
</div>

{{ $orders->links() }}
```

원하는 경우 페이지네이션 결과를 JSON 형태로 반환하려면, paginator 인스턴스를 라우트나 컨트롤러에서 직접 반환하면 됩니다.

```
use App\Models\Order;
use Illuminate\Http\Request;

Route::get('/orders', function (Request $request) {
    return Order::search($request->input('query'))->paginate(15);
});
```

> [!WARNING]
> 검색 엔진은 Eloquent 모델의 글로벌 스코프 정의를 인식하지 못하므로, Scout 페이지네이션을 사용할 때는 글로벌 스코프를 사용하지 않는 것이 좋습니다. 또는 Scout로 검색할 때 글로벌 스코프의 제약 조건을 직접 쿼리에 추가하는 방식으로 해결해야 합니다.

<a name="soft-deleting"></a>
### 소프트 삭제 처리

인덱스에 등록된 모델이 [소프트 삭제](/docs/10.x/eloquent#soft-deleting) 기능을 사용하고 있고, 소프트 삭제된 모델을 검색 결과에 포함하고 싶을 경우, `config/scout.php` 설정 파일의 `soft_delete` 옵션을 `true`로 설정하세요.

```
'soft_delete' => true,
```

이 옵션이 `true`일 때 Scout는 소프트 삭제된 모델을 검색 인덱스에서 제거하지 않고, 인덱싱된 레코드에 숨김 속성 `__soft_deleted`를 설정합니다. 이후 검색할 때 `withTrashed` 또는 `onlyTrashed` 메서드를 사용하여 소프트 삭제된 레코드를 함께 혹은 전용으로 조회할 수 있습니다.

```
use App\Models\Order;

// 소프트 삭제된 레코드도 함께 가져오기
$orders = Order::search('Star Trek')->withTrashed()->get();

// 오직 소프트 삭제된 레코드만 가져오기
$orders = Order::search('Star Trek')->onlyTrashed()->get();
```

> [!NOTE]
> 소프트 삭제된 모델을 `forceDelete`로 완전히 삭제하면, Scout가 검색 인덱스에서 해당 레코드를 자동으로 제거합니다.

<a name="customizing-engine-searches"></a>
### 엔진 검색 커스터마이징

검색 엔진의 동작을 더욱 세밀하게 제어하고 싶을 때는, `search` 메서드의 두 번째 인수로 클로저를 전달할 수 있습니다. 예를 들어, Algolia에 지오로케이션 데이터를 검색 옵션으로 추가하고 싶다면 다음과 같이 할 수 있습니다.

```
use Algolia\AlgoliaSearch\SearchIndex;
use App\Models\Order;

Order::search(
    'Star Trek',
    function (SearchIndex $algolia, string $query, array $options) {
        $options['body']['query']['bool']['filter']['geo_distance'] = [
            'distance' => '1000km',
            'location' => ['lat' => 36, 'lon' => 111],
        ];

        return $algolia->search($query, $options);
    }
)->get();
```

<a name="customizing-the-eloquent-results-query"></a>
#### Eloquent 결과 쿼리 커스터마이징

Scout는 검색 엔진에서 일치하는 Eloquent 모델의 primary key 목록을 가져온 후, Eloquent를 통해 이 key에 해당하는 모든 모델을 실제로 쿼리합니다. 이때 쿼리를 커스터마이징하고 싶다면 `query` 메서드를 사용할 수 있습니다. 이 메서드는 Eloquent 쿼리 빌더 인스턴스를 인자로 받아 클로저를 실행합니다.

```php
use App\Models\Order;
use Illuminate\Database\Eloquent\Builder;

$orders = Order::search('Star Trek')
    ->query(fn (Builder $query) => $query->with('invoices'))
    ->get();
```

이 콜백은 이미 검색 엔진에서 관련 모델 key를 얻은 이후에 실행되므로, "필터링" 목적이 아니라 쿼리 동작(예: eager loading 관계) 등에만 사용해야 합니다. 실제 필터링은 반드시 [Scout where 절](#where-clauses)을 사용해야 합니다.

<a name="custom-engines"></a>
## 커스텀 엔진

<a name="writing-the-engine"></a>
#### 엔진 작성하기

Scout 기본 제공 검색 엔진이 요구 사항에 맞지 않는 경우, 직접 커스텀 엔진을 만들어 Scout에 등록할 수 있습니다. 엔진을 만들려면 `Laravel\Scout\Engines\Engine` 추상 클래스를 상속받아야 하며, 다음 8가지 메서드를 구현해야 합니다.

```
use Laravel\Scout\Builder;

abstract public function update($models);
abstract public function delete($models);
abstract public function search(Builder $builder);
abstract public function paginate(Builder $builder, $perPage, $page);
abstract public function mapIds($results);
abstract public function map(Builder $builder, $results, $model);
abstract public function getTotalCount($results);
abstract public function flush($model);
```

구현 방법을 자세히 알고 싶다면 `Laravel\Scout\Engines\AlgoliaEngine` 클래스의 구현체를 참고하면 도움이 됩니다. 이 클래스는 각 메서드를 실제로 어떻게 구현할 수 있는지 좋은 출발점이 됩니다.

<a name="registering-the-engine"></a>
#### 엔진 등록하기

커스텀 엔진을 작성했다면, Scout 엔진 매니저의 `extend` 메서드를 사용해 엔진을 등록할 수 있습니다. Scout 엔진 매니저는 라라벨 서비스 컨테이너에서 주입받을 수 있습니다. 보통 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서, 또는 애플리케이션에서 사용하는 다른 서비스 프로바이더에서 아래와 같이 작성합니다.

```
use App\ScoutExtensions\MySqlSearchEngine;
use Laravel\Scout\EngineManager;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    resolve(EngineManager::class)->extend('mysql', function () {
        return new MySqlSearchEngine;
    });
}
```

엔진을 등록했다면, 애플리케이션의 `config/scout.php` 설정 파일에서 기본 Scout `driver`로 해당 엔진을 지정하면 됩니다.

```
'driver' => 'mysql',
```
