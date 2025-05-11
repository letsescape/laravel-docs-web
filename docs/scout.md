# 라라벨 Scout (Laravel Scout)

- [소개](#introduction)
- [설치](#installation)
    - [큐잉](#queueing)
- [드라이버 필수 조건](#driver-prerequisites)
    - [Algolia](#algolia)
    - [Meilisearch](#meilisearch)
    - [Typesense](#typesense)
- [설정](#configuration)
    - [모델 인덱스 설정](#configuring-model-indexes)
    - [색인 데이터 설정](#configuring-searchable-data)
    - [모델 ID 설정](#configuring-the-model-id)
    - [모델별 검색 엔진 설정](#configuring-search-engines-per-model)
    - [사용자 식별하기](#identifying-users)
- [데이터베이스 / 컬렉션 엔진](#database-and-collection-engines)
    - [데이터베이스 엔진](#database-engine)
    - [컬렉션 엔진](#collection-engine)
- [색인 작업](#indexing)
    - [배치 임포트](#batch-import)
    - [레코드 추가](#adding-records)
    - [레코드 업데이트](#updating-records)
    - [레코드 삭제](#removing-records)
    - [색인 일시 중지](#pausing-indexing)
    - [조건부로 색인되는 모델 인스턴스](#conditionally-searchable-model-instances)
- [검색](#searching)
    - [Where 절](#where-clauses)
    - [페이지네이션](#pagination)
    - [소프트 삭제](#soft-deleting)
    - [엔진 검색 커스터마이즈](#customizing-engine-searches)
- [커스텀 엔진](#custom-engines)

<a name="introduction"></a>
## 소개

[Laravel Scout](https://github.com/laravel/scout)는 [Eloquent 모델](/docs/eloquent)에 전문 검색(Full-Text Search) 기능을 쉽게 추가할 수 있도록 드라이버 기반의 간단한 솔루션을 제공합니다. Scout는 모델 옵저버를 이용해 검색 인덱스를 Eloquent 레코드와 자동으로 동기화해줍니다.

현재 Scout는 [Algolia](https://www.algolia.com/), [Meilisearch](https://www.meilisearch.com), [Typesense](https://typesense.org), 그리고 MySQL / PostgreSQL(`database`) 드라이버를 기본으로 제공합니다. 또한 외부 의존성이나 다른 서드파티 서비스 없이 로컬 개발 용도로 설계된 "collection" 드라이버도 포함되어 있습니다. 추가로, 커스텀 드라이버 작성이 매우 간단하기 때문에 Scout를 사용자가 원하는 검색 구현으로 확장할 수도 있습니다.

<a name="installation"></a>
## 설치

우선 Composer를 이용하여 Scout를 설치합니다:

```shell
composer require laravel/scout
```

설치 후, `vendor:publish` Artisan 명령어를 통해 Scout 설정 파일을 퍼블리시해야 합니다. 이 명령어는 애플리케이션의 `config` 디렉터리에 `scout.php` 설정 파일을 생성합니다:

```shell
php artisan vendor:publish --provider="Laravel\Scout\ScoutServiceProvider"
```

마지막으로, 검색 대상 모델에 `Laravel\Scout\Searchable` 트rait를 추가합니다. 이 트rait를 추가하면 모델 옵저버가 등록되어 해당 모델이 사용 중인 검색 드라이버와 자동으로 동기화됩니다:

```php
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
### 큐잉

Scout 사용을 위해 반드시 필요한 것은 아니지만, [큐 드라이버](/docs/queues) 설정을 strongly 추천합니다. 큐 워커를 실행하면, 모델의 정보를 검색 인덱스와 동기화하는 모든 작업이 큐로 처리되어 웹 인터페이스 응답 속도가 훨씬 향상됩니다.

큐 드라이버를 설정한 후, `config/scout.php` 설정 파일에서 `queue` 옵션 값을 `true`로 지정합니다:

```php
'queue' => true,
```

`queue` 옵션이 `false`인 경우에도, Algolia와 Meilisearch와 같은 일부 Scout 드라이버는 항상 비동기적으로 인덱싱을 처리합니다. 즉, 라라벨 애플리케이션에서는 인덱싱 작업이 끝났다고 해도 해당 검색 엔진에는 업데이트된 레코드가 즉시 반영되지 않을 수 있습니다.

Scout 작업이 사용하는 연결(connection)과 큐(queue)를 직접 지정하려면, `queue` 옵션을 배열로 설정할 수 있습니다:

```php
'queue' => [
    'connection' => 'redis',
    'queue' => 'scout'
],
```

이처럼 Scout 작업의 연결 및 큐를 커스터마이즈했다면, 해당 연결과 큐의 작업을 처리하기 위해 큐 워커를 실행해야 합니다:

```shell
php artisan queue:work redis --queue=scout
```

<a name="driver-prerequisites"></a>
## 드라이버 필수 조건

<a name="algolia"></a>
### Algolia

Algolia 드라이버를 사용할 경우, `config/scout.php` 파일에서 Algolia의 `id`와 `secret` 자격 증명을 반드시 설정해야 합니다. 자격 증명 설정 후, Algolia PHP SDK도 Composer로 설치해야 합니다:

```shell
composer require algolia/algoliasearch-client-php
```

<a name="meilisearch"></a>
### Meilisearch

[Meilisearch](https://www.meilisearch.com)는 매우 빠르고 오픈소스인 검색 엔진입니다. 로컬 머신에 Meilisearch를 설치하는 방법이 잘 모르겠다면, 라라벨 공식 Docker 개발 환경인 [Laravel Sail](/docs/sail#meilisearch)을 사용할 수 있습니다.

Meilisearch 드라이버를 사용할 때에는 Composer로 Meilisearch PHP SDK를 설치해야 합니다:

```shell
composer require meilisearch/meilisearch-php http-interop/http-factory-guzzle
```

그런 다음, 애플리케이션의 `.env` 파일에서 `SCOUT_DRIVER` 환경 변수와 Meilisearch의 `host`, `key` 자격 증명을 지정합니다:

```ini
SCOUT_DRIVER=meilisearch
MEILISEARCH_HOST=http://127.0.0.1:7700
MEILISEARCH_KEY=masterKey
```

Meilisearch 관련 자세한 정보는 [Meilisearch 공식 문서](https://docs.meilisearch.com/learn/getting_started/quick_start.html)를 참고하십시오.

추가로, 사용하는 Meilisearch 바이너리 버전에 호환되는 `meilisearch/meilisearch-php` 버전을 반드시 설치해야 합니다. 호환성 관련 내용은 [Meilisearch 바이너리 호환성 문서](https://github.com/meilisearch/meilisearch-php#-compatibility-with-meilisearch)를 참고하세요.

> [!WARNING]
> Meilisearch를 사용하는 애플리케이션에서 Scout를 업그레이드할 경우, Meilisearch 서비스 자체의 [추가적인 주요 변경사항](https://github.com/meilisearch/Meilisearch/releases)을 반드시 검토해야 합니다.

<a name="typesense"></a>
### Typesense

[Typesense](https://typesense.org)는 매우 빠른 오픈소스 검색 엔진으로, 키워드 검색, 시맨틱 검색, 지오(geo) 검색, 벡터 검색을 지원합니다.

[셀프 호스팅](https://typesense.org/docs/guide/install-typesense.html#option-2-local-machine-self-hosting)하거나, [Typesense Cloud](https://cloud.typesense.org)를 이용할 수 있습니다.

Scout에서 Typesense를 사용하려면 Composer로 Typesense PHP SDK를 설치합니다:

```shell
composer require typesense/typesense-php
```

이후, 애플리케이션의 `.env` 파일에서 `SCOUT_DRIVER` 환경 변수와 Typesense의 호스트와 API 키 자격 증명을 지정합니다:

```ini
SCOUT_DRIVER=typesense
TYPESENSE_API_KEY=masterKey
TYPESENSE_HOST=localhost
```

[Laravel Sail](/docs/sail)을 사용하는 경우, `TYPESENSE_HOST` 환경 변수를 도커 컨테이너 이름에 맞게 조정해야 할 수도 있습니다. 설치 포트, 경로(path), 프로토콜(protocol)도 옵션으로 지정할 수 있습니다:

```ini
TYPESENSE_PORT=8108
TYPESENSE_PATH=
TYPESENSE_PROTOCOL=http
```

Typesense 컬렉션에 대한 추가 설정 및 스키마 정의는 애플리케이션의 `config/scout.php` 파일에서 설정할 수 있습니다. Typesense에 대한 자세한 정보와 스키마 옵션은 [Typesense 공식 문서](https://typesense.org/docs/guide/#quick-start)를 참고하세요.

<a name="preparing-data-for-storage-in-typesense"></a>
#### Typesense 저장 데이터 준비

Typesense를 활용할 때는 검색 대상 모델에서, 모델의 기본 키를 문자열로, 생성 날짜를 UNIX 타임스탬프로 변환하는 `toSearchableArray` 메서드를 정의해야 합니다:

```php
/**
 * Get the indexable data array for the model.
 *
 * @return array<string, mixed>
 */
public function toSearchableArray(): array
{
    return array_merge($this->toArray(),[
        'id' => (string) $this->id,
        'created_at' => $this->created_at->timestamp,
    ]);
}
```

그리고 Typesense 컬렉션 스키마도 `config/scout.php` 파일에 정의해야 합니다. 컬렉션 스키마란 Typesense가 검색할 수 있는 각각의 필드 타입을 설명하는 것입니다. 사용할 수 있는 모든 스키마 옵션은 [Typesense 문서](https://typesense.org/docs/latest/api/collections.html#schema-parameters)를 참고하세요.

컬렉션 스키마를 나중에 변경해야 한다면, `scout:flush`와 `scout:import`를 순차로 실행하여 모든 인덱스 데이터를 삭제하고 스키마를 다시 만들거나, Typesense API를 이용해 인덱스 데이터 삭제 없이 컬렉션 스키마를 수정할 수 있습니다.

검색 모델이 소프트 삭제를 지원하는 경우, 해당 모델의 Typesense 스키마에 `__soft_deleted` 필드를 정의해야 합니다:

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

Typesense는 [search parameters](https://typesense.org/docs/latest/api/search.html#search-parameters) 옵션을 `options` 메서드를 통해 검색 시 동적으로 제어할 수 있습니다:

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

각 Eloquent 모델은 해당 모델의 모든 검색 대상 레코드를 담고 있는 특정 검색 "인덱스"와 동기화됩니다. 각각의 인덱스는 MySQL 테이블과 유사하게 생각하면 됩니다. 기본적으로 각 모델은 모델의 기본 "테이블" 이름과 일치하는 인덱스에 저장됩니다. 일반적으로 이는 모델 이름의 복수형이지만, 필요하다면 모델에 `searchableAs` 메서드를 오버라이드하여 인덱스명을 자유롭게 지정할 수 있습니다:

```php
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
### 색인 데이터 설정

기본적으로 모델의 전체 `toArray` 데이터가 검색 인덱스에 저장됩니다. 만약 검색 인덱스에 동기화할 데이터를 직접 정의하고 싶다면, 모델에서 `toSearchableArray` 메서드를 오버라이드하세요:

```php
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

Meilisearch 등 일부 검색 엔진은 값 타입이 올바른 경우에만 필터 연산(`>`, `<` 등)을 수행합니다. 따라서 이들 검색 엔진 사용 시 검색 데이터 커스터마이징을 한다면, 반드시 숫자 값은 그에 맞는 타입으로 캐스팅해야 합니다:

```php
public function toSearchableArray()
{
    return [
        'id' => (int) $this->id,
        'name' => $this->name,
        'price' => (float) $this->price,
    ];
}
```

<a name="configuring-indexes-for-algolia"></a>
#### 인덱스 설정 구성(Algolia)

Algolia 인덱스에 추가 설정이 필요하다면, Algolia UI로 관리할 수도 있지만, 애플리케이션의 `config/scout.php` 파일에서 직접 관리하는 것이 여러 환경에서 일관성을 유지하고 배포 자동화에 유리합니다. 필터 가능한 attribute, ranking, faceting, 그 외의 [지원되는 설정](https://www.algolia.com/doc/rest-api/search/#tag/Indices/operation/setSettings) 필드들을 지정할 수 있습니다.

시작하려면 각 인덱스에 대한 설정을 `config/scout.php` 파일에 추가하세요:

```php
use App\Models\User;
use App\Models\Flight;

'algolia' => [
    'id' => env('ALGOLIA_APP_ID', ''),
    'secret' => env('ALGOLIA_SECRET', ''),
    'index-settings' => [
        User::class => [
            'searchableAttributes' => ['id', 'name', 'email'],
            'attributesForFaceting'=> ['filterOnly(email)'],
            // 기타 설정 필드...
        ],
        Flight::class => [
            'searchableAttributes'=> ['id', 'destination'],
        ],
    ],
],
```

특정 인덱스의 모델이 소프트 삭제를 지원한다면, 해당 인덱스가 `index-settings` 배열에 포함되어 있으면 Scout가 자동으로 소프트 삭제 모델에 대한 faceting을 활성화합니다. 만약 추가로 정의할 faceting 속성이 없다면, 다음과 같이 빈 엔트리만 포함해도 충분합니다:

```php
'index-settings' => [
    Flight::class => []
],
```

인덱스 설정이 끝나면, `scout:sync-index-settings` Artisan 명령어를 실행해야 합니다. 이 명령어는 Algolia에 현재 설정을 알려줍니다. 배포 자동화 시 해당 명령을 포함시키는 것이 좋습니다:

```shell
php artisan scout:sync-index-settings
```

<a name="configuring-filterable-data-for-meilisearch"></a>
#### 필터링 데이터 및 인덱스 설정 구성(Meilisearch)

Scout의 다른 드라이버들과 달리, Meilisearch는 필터링 가능 attributes, 정렬 가능 attributes, 그리고 [기타 지원 설정 필드들](https://docs.meilisearch.com/reference/api/settings.html) 등 인덱스 검색 설정을 미리 지정해야 합니다.

필터링 속성은 Scout의 `where` 메서드 사용 시, 정렬 속성은 `orderBy` 메서드 사용 시 필요한 값들입니다. 인덱스 설정은 다음과 같이 `meilisearch` 구성 항목에 정의하세요:

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

해당 인덱스의 모델이 소프트 삭제를 지원하고 `index-settings` 배열에 포함되어 있다면, Scout는 소프트 삭제 모델에 대한 필터링을 자동 지원합니다. 추가로 지정할 필터링/정렬 속성이 없다면, 다음과 같이 빈 엔트리만 포함해도 무방합니다:

```php
'index-settings' => [
    Flight::class => []
],
```

설정 후 반드시 `scout:sync-index-settings` Artisan 명령어를 실행해야 하고, 배포 프로세스에 이 명령을 포함시키는 것이 좋습니다:

```shell
php artisan scout:sync-index-settings
```

<a name="configuring-the-model-id"></a>
### 모델 ID 설정

Scout는 기본적으로 모델의 기본 키(primary key)를 검색 인덱스에 저장되는 유일한 키로 사용합니다. 만약 이 동작을 커스터마이징하려면, 모델에서 `getScoutKey`와 `getScoutKeyName` 메서드를 오버라이드하세요:

```php
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

혼합 환경에서 모델에 따라 Scout가 사용하는 검색 엔진을 다르게 적용할 수도 있습니다. 이럴 때는 모델에서 `searchableUsing` 메서드를 오버라이드해서 사용할 엔진을 지정하면 됩니다:

```php
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

Scout는 [Algolia](https://algolia.com) 사용 시 자동으로 사용자를 식별하는 기능도 제공합니다. 이 기능을 활성화하면 인증된 사용자가 검색 작업을 수행할 때, 해당 정보가 Algolia 대시보드의 검색 분석에 표시됩니다. 이 기능을 활성화하려면, 애플리케이션의 `.env` 파일에서 `SCOUT_IDENTIFY` 환경 변수를 `true`로 설정하세요:

```ini
SCOUT_IDENTIFY=true
```

이 설정을 활성화하면 사용자의 요청 IP와 인증된 사용자의 기본 식별자가 함께 Algolia로 전송되어, 각 사용자의 검색 요청에 반영되게 됩니다.

<a name="database-and-collection-engines"></a>
## 데이터베이스 / 컬렉션 엔진

<a name="database-engine"></a>
### 데이터베이스 엔진

> [!WARNING]
> 데이터베이스 엔진은 현재 MySQL과 PostgreSQL만 지원합니다.

애플리케이션 데이터베이스 규모가 작거나 중간 수준이거나, 비교적 가벼운 워크로드라면, Scout의 "database" 엔진으로 간편하게 시작할 수 있습니다. 데이터베이스 엔진은 기존 데이터베이스를 그대로 활용하여, where like 절과 전체텍스트 인덱스를 사용해 검색 결과를 필터링합니다.

데이터베이스 엔진을 사용하려면, `.env` 파일에서 `SCOUT_DRIVER` 환경 변수를 `database`로 설정하거나, `scout` 설정 파일에 직접 지정하면 됩니다:

```ini
SCOUT_DRIVER=database
```

엔진을 지정했다면, [검색 데이터 설정](#configuring-searchable-data)을 완료하세요. 그런 다음, 바로 [검색 쿼리 실행](#searching)이 가능합니다. Algolia, Meilisearch, Typesense처럼 인덱스 시딩 작업이 별도로 필요하지 않습니다.

#### 데이터베이스 검색 전략 커스터마이징

기본적으로 데이터베이스 엔진은 [검색 데이터](#configuring-searchable-data)로 지정한 모델 속성들에 대해 모두 "where like" 쿼리를 실행합니다. 하지만 이 방식이 비효율적인 경우, 일부 컬럼에는 전체텍스트 검색이나 문자열 접두어 검색(`example%`)만 사용하도록 방식(스트래티지)을 조정할 수 있습니다.

이런 동작을 정의하려면, 모델의 `toSearchableArray` 메서드에 PHP attribute를 추가합니다. 별도의 search strategy가 지정되지 않은 컬럼은 기본적으로 "where like" 전략을 따릅니다:

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
> 어떤 컬럼에 전체텍스트 쿼리를 적용하려면, 먼저 해당 컬럼에 [Full Text 인덱스](/docs/migrations#available-index-types)를 생성해두어야 합니다.

<a name="collection-engine"></a>
### 컬렉션 엔진

로컬 개발 환경에서 Algolia, Meilisearch, Typesense 대신 "collection" 엔진을 사용하는 것도 편리합니다. 컬렉션 엔진은 기존 데이터베이스에서 where 절과 컬렉션 필터링만을 활용해 검색 결과를 구하며, 별도의 인덱싱 작업이 필요 없습니다.

컬렉션 엔진 사용을 위해 `.env`의 `SCOUT_DRIVER` 값을 `collection`으로 설정하거나 설정 파일에서 직접 지정하세요:

```ini
SCOUT_DRIVER=collection
```

이제 바로 [검색 쿼리 실행](#searching)이 가능하며, Algolia, Meilisearch, Typesense처럼 색인 시딩 작업이 불필요합니다.

#### 데이터베이스 엔진과 컬렉션 엔진의 차이점

첫 인상은 "database" 엔진과 "collection" 엔진 모두 데이터베이스를 직접 사용하여 검색 결과를 가져온다는 점에서 비슷해 보입니다. 그러나 컬렉션 엔진은 전체텍스트 인덱스나 `LIKE` 절을 활용하지 않고, 모든 레코드를 일단 불러온 뒤, 라라벨의 `Str::is` 헬퍼를 사용해 속성에 검색어가 포함되어 있는지 검사합니다.

컬렉션 엔진은 라라벨에서 지원하는 모든 관계형 데이터베이스(SQLite, SQL Server 포함)에서 동작하므로 이동성이 아주 뛰어나다는 장점이 있습니다. 대신, Scout의 데이터베이스 엔진보다는 효율성이 떨어집니다.

<a name="indexing"></a>
## 색인 작업

<a name="batch-import"></a>
### 배치 임포트

기존 프로젝트에 Scout를 도입하는 경우, 이미 생성된 많은 데이터베이스 레코드를 인덱스에 추가해야 할 수 있습니다. 이때 사용할 수 있도록 Scout는 기존 모든 레코드를 인덱싱하는 `scout:import` Artisan 명령어를 제공합니다:

```shell
php artisan scout:import "App\Models\Post"
```

모든 색인 레코드를 삭제하려면 `flush` 명령어를 사용할 수 있습니다:

```shell
php artisan scout:flush "App\Models\Post"
```

<a name="modifying-the-import-query"></a>
#### 임포트 쿼리 수정

배치 임포트 시 사용되는 쿼리를 커스터마이징하고 싶다면, 모델에 `makeAllSearchableUsing` 메서드를 지정하세요. 이 메서드에서 필요한 관계 미리 로딩 등도 자유롭게 추가할 수 있습니다:

```php
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
> 큐를 이용해 배치 임포트할 때는 `makeAllSearchableUsing` 메서드가 적용되지 않을 수 있습니다. 모델 컬렉션이 큐 작업에서 처리될 때는 [관계가 복원되지 않습니다](/docs/queues#handling-relationships).

<a name="adding-records"></a>
### 레코드 추가

모델에 `Laravel\Scout\Searchable` 트rait를 추가하면, 모델 인스턴스를 `save` 또는 `create`하는 것만으로도 자동으로 검색 인덱스에 추가됩니다. 큐를 사용하도록 설정했다면, 이 작업은 큐 워커에서 백그라운드로 처리됩니다:

```php
use App\Models\Order;

$order = new Order;

// ...

$order->save();
```

<a name="adding-records-via-query"></a>
#### 쿼리를 통한 레코드 추가

쿼리로 한 번에 여러 모델을 색인에 추가하려면, Eloquent 쿼리에 `searchable` 메서드를 체인으로 연결하세요. 이 메서드는 쿼리 결과를 [청크 처리](/docs/eloquent#chunking-results)하여 인덱스에 추가합니다. 큐를 사용중이면, 모든 청크가 큐 워커에서 처리됩니다:

```php
use App\Models\Order;

Order::where('price', '>', 100)->searchable();
```

Eloquent 관계 인스턴스에도 `searchable` 메서드를 쓸 수 있습니다:

```php
$user->orders()->searchable();
```

메모리에 이미 Eloquent 모델 컬렉션이 있다면, 해당 인스턴스에 바로 `searchable`을 호출해 각각의 인덱스에 추가할 수 있습니다:

```php
$orders->searchable();
```

> [!NOTE]
> `searchable` 메서드는 "upsert" 작업에 해당합니다. 즉, 이미 인덱스에 있으면 업데이트하고, 없으면 새로 추가합니다.

<a name="updating-records"></a>
### 레코드 업데이트

색인된 모델을 업데이트할 때는 일반적으로 모델의 속성만 수정하고 데이터베이스에 `save`하면 됩니다. Scout가 자동으로 인덱스의 변경도 반영해줍니다:

```php
use App\Models\Order;

$order = Order::find(1);

// 주문 수정...

$order->save();
```

Eloquent 쿼리 인스턴스에서도 `searchable` 메서드를 호출해 여러 모델을 한 번에 업데이트할 수 있습니다. 모델이 인덱스에 없으면 새로 만들어집니다:

```php
Order::where('price', '>', 100)->searchable();
```

관계 인스턴스에 `searchable`을 호출해 관련 모델 인덱스를 업데이트할 수도 있습니다:

```php
$user->orders()->searchable();
```

이미 컬렉션에 담긴 모델들이 있다면, 컬렉션 인스턴스에 바로 `searchable`을 써서 해당 인덱스를 업데이트할 수 있습니다:

```php
$orders->searchable();
```

<a name="modifying-records-before-importing"></a>
#### 임포트 전 모델 조작하기

검색 가능 모델 컬렉션을 색인에 추가하기 전에 사전 작업이 필요할 때가 있습니다. 예를 들어, 관계를 eager loading해야 할 때 등입니다. 이럴 때는 모델에 `makeSearchableUsing` 메서드를 정의하세요:

```php
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
### 레코드 삭제

모델을 데이터베이스에서 삭제(`delete`)하면 검색 인덱스에서도 레코드가 제거됩니다. [소프트 삭제](/docs/eloquent#soft-deleting)를 사용하는 경우에도 마찬가지입니다:

```php
use App\Models\Order;

$order = Order::find(1);

$order->delete();
```

모델을 직접 조회하지 않고 인덱스에서만 삭제하고 싶다면, Eloquent 쿼리 인스턴스에서 `unsearchable` 메서드를 사용할 수 있습니다:

```php
Order::where('price', '>', 100)->unsearchable();
```

관계 인스턴스에서도 `unsearchable`을 사용할 수 있습니다:

```php
$user->orders()->unsearchable();
```

이미 컬렉션에 담긴 모델들이 있다면, 컬렉션 인스턴스에 `unsearchable`을 써 해당 인덱스에서 제거할 수 있습니다:

```php
$orders->unsearchable();
```

모델의 모든 인덱스 레코드를 한 번에 삭제하고 싶을 때는 `removeAllFromSearch`를 사용하세요:

```php
Order::removeAllFromSearch();
```

<a name="pausing-indexing"></a>
### 색인 일시 중지

여러 Eloquent 작업을 한 번에 처리할 때 인덱스 동기화를 임시로 끄고 싶을 때는 `withoutSyncingToSearch` 메서드를 사용하세요. 이 메서드는 하나의 클로저를 받아서 클로저 내부에서 일어나는 모든 모델 작업이 검색 인덱스에 즉시 반영되지 않도록 합니다:

```php
use App\Models\Order;

Order::withoutSyncingToSearch(function () {
    // 모델 작업 수행...
});
```

<a name="conditionally-searchable-model-instances"></a>
### 조건부로 색인되는 모델 인스턴스

특정 조건에서만 모델을 색인하고 싶을 때, 예를 들어 `App\Models\Post` 모델이 "임시저장(draft)" 혹은 "발행(published)" 상태일 수 있는데, "발행" 상태만 검색 가능하게 만들고 싶을 때는, 모델에 `shouldBeSearchable` 메서드를 추가하세요:

```php
/**
 * Determine if the model should be searchable.
 */
public function shouldBeSearchable(): bool
{
    return $this->isPublished();
}
```

이 메서드는 `save`, `create` 또는 쿼리, 관계를 통한 모델 조작에만 적용됩니다. 직접 모델이나 컬렉션에 `searchable` 메서드를 사용하면 `shouldBeSearchable`의 반환결과가 무시됩니다.

> [!WARNING]
> "database" 엔진 사용 시에는 `shouldBeSearchable` 메서드가 작동하지 않습니다. 데이터는 항상 데이터베이스에 저장되기 때문입니다. 이 경우 [where 절 사용](#where-clauses)으로 동일한 효과를 내세요.

<a name="searching"></a>
## 검색

모델 검색은 `search` 메서드로 시작합니다. 이 메서드는 하나의 문자열을 받아 모델에서 해당 문자열이 포함된 결과를 검색합니다. 이후 `get` 메서드를 연결해 결과를 조회할 수 있습니다:

```php
use App\Models\Order;

$orders = Order::search('Star Trek')->get();
```

Scout 검색 결과는 Eloquent 모델의 컬렉션으로 반환되며, 이를 라우트나 컨트롤러에서 그대로 반환하면 자동으로 JSON으로 변환됩니다:

```php
use App\Models\Order;
use Illuminate\Http\Request;

Route::get('/search', function (Request $request) {
    return Order::search($request->search)->get();
});
```

이 결과를 Eloquent 모델로 변환하지 않은 원본 결과(raw)를 받고 싶다면 `raw` 메서드를 이용하세요:

```php
$orders = Order::search('Star Trek')->raw();
```

<a name="custom-indexes"></a>
#### 커스텀 인덱스

기본적으로 검색은 모델의 [searchableAs](#configuring-model-indexes) 메서드에 지정된 인덱스에서 이루어집니다. 그러나 `within` 메서드를 사용하여 원하는 커스텀 인덱스를 지정할 수 있습니다:

```php
$orders = Order::search('Star Trek')
    ->within('tv_shows_popularity_desc')
    ->get();
```

<a name="where-clauses"></a>
### Where 절

Scout에서는 간단한 "where" 절을 통해 검색 쿼리에 조건을 추가할 수 있습니다. 현재 이 조건은 기본적인 숫자 동등 비교만 지원되며, 주로 소유자 ID로 쿼리 범위를 좁힐 때 유용합니다:

```php
use App\Models\Order;

$orders = Order::search('Star Trek')->where('user_id', 1)->get();
```

지정한 컬럼 값이 배열에 포함되어 있는지 확인하려면 `whereIn` 메서드를 사용할 수 있습니다:

```php
$orders = Order::search('Star Trek')->whereIn(
    'status', ['open', 'paid']
)->get();
```

반대로 배열에 포함되지 않은 값만 조회하려면 `whereNotIn` 메서드를 사용하세요:

```php
$orders = Order::search('Star Trek')->whereNotIn(
    'status', ['closed']
)->get();
```

검색 인덱스는 관계형 데이터베이스가 아니기 때문에, 지금은 이 이상의 고급 "where" 조건은 지원하지 않습니다.

> [!WARNING]
> Meilisearch를 사용하는 경우, 반드시 [필터링 속성](#configuring-filterable-data-for-meilisearch) 설정을 마친 후 Scout의 "where" 절을 사용해야 합니다.

<a name="pagination"></a>
### 페이지네이션

검색 결과를 컬렉션으로 조회할 뿐 아니라, `paginate` 메서드로 페이지네이션도 쉽게 할 수 있습니다. 이 메서드는 [일반 Eloquent 쿼리](/docs/pagination)와 동일하게 `Illuminate\Pagination\LengthAwarePaginator` 인스턴스를 반환합니다:

```php
use App\Models\Order;

$orders = Order::search('Star Trek')->paginate();
```

한 페이지당 가져올 모델 수를 첫 번째 인자로 지정할 수도 있습니다:

```php
$orders = Order::search('Star Trek')->paginate(15);
```

결과를 받아서 [Blade](/docs/blade)에서 바로 페이지 링크까지 자연스럽게 렌더링할 수 있습니다:

```html
<div class="container">
    @foreach ($orders as $order)
        {{ $order->price }}
    @endforeach
</div>

{{ $orders->links() }}
```

페이지네이션 결과를 JSON으로 받으려면, 컨트롤러나 라우트에서 paginator 인스턴스를 그대로 반환하면 됩니다:

```php
use App\Models\Order;
use Illuminate\Http\Request;

Route::get('/orders', function (Request $request) {
    return Order::search($request->input('query'))->paginate(15);
});
```

> [!WARNING]
> 검색 엔진은 Eloquent 모델의 전역 스코프 정의를 알 수 없으므로, Scout의 페이지네이션을 사용할 때는 글로벌 스코프를 피하거나, Scout 검색에서도 스코프 조건을 직접 구현해야 합니다.

<a name="soft-deleting"></a>
### 소프트 삭제

색인된 모델이 [소프트 삭제](/docs/eloquent#soft-deleting) 기능을 사용하면서, 소프트 삭제된 데이터까지 검색해야 한다면, `config/scout.php` 파일의 `soft_delete` 옵션을 `true`로 설정하세요:

```php
'soft_delete' => true,
```

이 옵션이 활성화되면, Scout는 소프트 삭제 모델을 인덱스에서 제거하지 않고, 해당 레코드에 숨김 속성 `__soft_deleted`를 추가합니다. 그리고 검색 시에는 `withTrashed`, `onlyTrashed` 메서드로 소프트 삭제된 레코드를 검색할 수 있습니다:

```php
use App\Models\Order;

// 소프트 삭제 레코드도 포함해서 검색...
$orders = Order::search('Star Trek')->withTrashed()->get();

// 소프트 삭제된 레코드만 검색...
$orders = Order::search('Star Trek')->onlyTrashed()->get();
```

> [!NOTE]
> 소프트 삭제된 모델을 `forceDelete`로 영구 삭제하면, Scout가 자동으로 인덱스에서도 해당 레코드를 삭제합니다.

<a name="customizing-engine-searches"></a>
### 엔진 검색 커스터마이즈

검색 엔진의 동작을 세밀하게 제어해야 할 때는, `search` 메서드의 두 번째 인자로 클로저를 전달하면 됩니다. 예를 들어, Algolia 검색 옵션에 지리정보(geo location)를 추가하려면 다음과 같이 할 수 있습니다:

```php
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
#### Eloquent 결과 쿼리 커스터마이즈

Scout가 검색 엔진으로부터 일치하는 Eloquent 모델의 ID를 받은 후, 실제 모델을 조회할 때의 쿼리를 커스터마이즈할 수도 있습니다. 이때는 `query` 메서드에 클로저를 전달하면 됩니다. 이 클로저는 Eloquent 쿼리 빌더를 인자로 받는데, 예를 들어 관계를 eager loading하는 데 쓸 수 있습니다:

```php
use App\Models\Order;
use Illuminate\Database\Eloquent\Builder;

$orders = Order::search('Star Trek')
    ->query(fn (Builder $query) => $query->with('invoices'))
    ->get();
```

이 콜백은 이미 검색 엔진에서 일치 모델 ID를 확보한 뒤 실행되기 때문에, 실제 "필터링" 용도가 아니라 추가 조회 제약(joins, eager loading 등)에만 사용해야 합니다. 실제 결과 필터링을 원한다면 [Scout where 절](#where-clauses)를 사용하세요.

<a name="custom-engines"></a>
## 커스텀 엔진

<a name="writing-the-engine"></a>
#### 커스텀 엔진 작성

기존 제공되는 Scout 검색 엔진이 적합하지 않다면, 직접 커스텀 엔진을 구현해 사용할 수 있습니다. 커스텀 엔진은 `Laravel\Scout\Engines\Engine` 추상 클래스를 상속해야 하며, 아래 8가지 메서드를 반드시 구현해야 합니다:

```php
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

실제 구현은 `Laravel\Scout\Engines\AlgoliaEngine` 클래스의 예제를 참고하는 것이 좋습니다. 이 클래스에서 각 메서드를 어떻게 구현하는지 살펴볼 수 있습니다.

<a name="registering-the-engine"></a>
#### 커스텀 엔진 등록

커스텀 엔진을 작성했다면, Scout의 엔진 매니저에서 `extend` 메서드를 이용해 등록해야 합니다. 엔진 매니저는 서비스 컨테이너로부터 받아올 수 있습니다. 일반적으로 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드나, 애플리케이션에서 사용하는 다른 서비스 프로바이더에서 호출하면 됩니다:

```php
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

등록이 끝나면, 애플리케이션의 `config/scout.php` 파일에서 기본 Scout `driver`를 커스텀 엔진으로 지정하면 됩니다:

```php
'driver' => 'mysql',
```
