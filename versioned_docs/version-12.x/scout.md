# 라라벨 스카우트 (Laravel Scout)

- [소개](#introduction)
- [설치](#installation)
    - [큐잉](#queueing)
- [드라이버 사전 준비](#driver-prerequisites)
    - [Algolia](#algolia)
    - [Meilisearch](#meilisearch)
    - [Typesense](#typesense)
- [설정](#configuration)
    - [모델 인덱스 설정](#configuring-model-indexes)
    - [검색 가능한 데이터 설정](#configuring-searchable-data)
    - [모델 ID 설정](#configuring-the-model-id)
    - [모델별 검색 엔진 설정](#configuring-search-engines-per-model)
    - [사용자 식별](#identifying-users)
- [데이터베이스 / 컬렉션 엔진](#database-and-collection-engines)
    - [데이터베이스 엔진](#database-engine)
    - [컬렉션 엔진](#collection-engine)
- [인덱싱](#indexing)
    - [배치 가져오기(Import)](#batch-import)
    - [레코드 추가](#adding-records)
    - [레코드 업데이트](#updating-records)
    - [레코드 삭제](#removing-records)
    - [인덱싱 일시 중지](#pausing-indexing)
    - [조건부로 검색 가능한 모델 인스턴스](#conditionally-searchable-model-instances)
- [검색](#searching)
    - [Where 절 사용](#where-clauses)
    - [페이지네이션](#pagination)
    - [소프트 삭제](#soft-deleting)
    - [엔진 검색 커스터마이징](#customizing-engine-searches)
- [커스텀 엔진](#custom-engines)

<a name="introduction"></a>
## 소개

[라라벨 Scout](https://github.com/laravel/scout)는 [Eloquent 모델](/docs/12.x/eloquent)에 전문 검색(Full-text Search) 기능을 추가할 수 있는, 드라이버 기반의 간단한 솔루션을 제공합니다. Scout는 모델 옵저버를 활용해 Eloquent 레코드가 변경될 때마다 검색 인덱스를 자동으로 동기화해줍니다.

현재 Scout는 [Algolia](https://www.algolia.com/), [Meilisearch](https://www.meilisearch.com), [Typesense](https://typesense.org), 그리고 MySQL / PostgreSQL(`database`) 드라이버를 기본으로 지원합니다. 또한, 로컬 개발 환경에서 외부 서비스나 추가 의존성 없이 사용할 수 있는 "collection" 드라이버도 제공합니다. 더불어, Scout는 자신만의 검색 구현체를 쉽게 추가할 수 있도록 커스텀 드라이버 작성 방법도 제공합니다.

<a name="installation"></a>
## 설치

먼저, Composer 패키지 매니저를 통해 Scout를 설치합니다.

```shell
composer require laravel/scout
```

설치가 완료되면, `vendor:publish` Artisan 명령어를 이용해 Scout 설정 파일을 애플리케이션의 `config` 디렉터리에 배포해야 합니다. 이 명령어는 `scout.php` 설정 파일을 생성합니다.

```shell
php artisan vendor:publish --provider="Laravel\Scout\ScoutServiceProvider"
```

마지막으로, 검색 대상이 될 모델에 `Laravel\Scout\Searchable` 트레잇을 추가합니다. 이 트레잇은 모델 옵저버를 등록해, 해당 모델이 검색 드라이버와 자동으로 동기화되도록 만들어줍니다.

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

Scout를 사용할 때 필수는 아니지만, [큐 드라이버](/docs/12.x/queues)를 사전에 설정해두는 것이 적극 권장됩니다. 큐 워커를 실행하면, 모델 정보를 검색 인덱스와 동기화하는 모든 작업을 큐에 넣을 수 있으므로, 애플리케이션의 웹 인터페이스 응답 속도가 훨씬 빨라집니다.

큐 드라이버를 설정했다면, `config/scout.php` 설정 파일의 `queue` 옵션 값을 `true`로 지정하세요.

```php
'queue' => true,
```

`queue` 옵션이 `false`여도, Algolia 및 Meilisearch와 같은 일부 Scout 드라이버는 항상 비동기적으로 레코드를 인덱싱합니다. 즉, 라라벨 애플리케이션 내부에서 인덱스 작업이 완료되어도, 실제 검색 엔진에 새로운 레코드가 반영되는 것은 시간 차가 있을 수 있습니다.

Scout 작업에 사용할 연결(connection) 및 큐(queue)를 지정하려면, `queue` 옵션을 배열 형태로 설정할 수 있습니다.

```php
'queue' => [
    'connection' => 'redis',
    'queue' => 'scout'
],
```

이처럼 연결과 큐를 직접 지정한 경우, 해당 연결과 큐에서 작업을 처리할 수 있도록 큐 워커를 실행해야 합니다.

```shell
php artisan queue:work redis --queue=scout
```

<a name="driver-prerequisites"></a>
## 드라이버 사전 준비

<a name="algolia"></a>
### Algolia

Algolia 드라이버를 사용할 경우, Algolia `id` 및 `secret` 자격증명을 `config/scout.php` 설정 파일에 지정해야 합니다. 자격증명 설정이 완료되면, Composer 패키지 매니저를 통해 Algolia PHP SDK도 설치해야 합니다.

```shell
composer require algolia/algoliasearch-client-php
```

<a name="meilisearch"></a>
### Meilisearch

[Meilisearch](https://www.meilisearch.com)는 매우 빠르고 오픈 소스인 검색 엔진입니다. 로컬 머신에 Meilisearch를 설치하는 방법이 익숙하지 않다면, 라라벨의 공식 도커 개발 환경인 [Laravel Sail](/docs/12.x/sail#meilisearch)을 활용할 수 있습니다.

Meilisearch 드라이버를 사용하려면, Composer 패키지를 통해 Meilisearch PHP SDK를 설치해야 합니다.

```shell
composer require meilisearch/meilisearch-php http-interop/http-factory-guzzle
```

그리고 `.env` 파일에 `SCOUT_DRIVER` 환경 변수와 함께 Meilisearch의 `host`, `key` 자격증명을 지정하세요.

```ini
SCOUT_DRIVER=meilisearch
MEILISEARCH_HOST=http://127.0.0.1:7700
MEILISEARCH_KEY=masterKey
```

Meilisearch에 대한 더 자세한 내용은 [Meilisearch 공식 문서](https://docs.meilisearch.com/learn/getting_started/quick_start.html)를 참고하세요.

또한, 사용하는 Meilisearch 바이너리 버전과 호환되는 `meilisearch/meilisearch-php` 버전을 설치해야 합니다. 자세한 내용은 [Meilisearch 바이너리 호환성 문서](https://github.com/meilisearch/meilisearch-php#-compatibility-with-meilisearch)를 확인하십시오.

> [!WARNING]
> Meilisearch를 사용하는 애플리케이션에서 Scout 업그레이드 시, 항상 Meilisearch 서비스 자체의 [주요 변경 사항(Breaking Changes)](https://github.com/meilisearch/Meilisearch/releases)을 반드시 검토해야 합니다.

<a name="typesense"></a>
### Typesense

[Typesense](https://typesense.org)는 매우 빠른 오픈 소스 검색 엔진으로, 키워드 검색, 시맨틱(의미 기반) 검색, 지오(위치 기반) 검색, 벡터 검색 등을 모두 지원합니다.

직접 [Typesense를 호스팅](https://typesense.org/docs/guide/install-typesense.html#option-2-local-machine-self-hosting)하거나, [Typesense Cloud](https://cloud.typesense.org)를 사용할 수 있습니다.

Scout에서 Typesense를 사용하려면, 우선 Composer 패키지 매니저로 Typesense PHP SDK를 설치하세요.

```shell
composer require typesense/typesense-php
```

그리고 `.env` 파일에 `SCOUT_DRIVER` 환경 변수 및 Typesense 호스트와 API 키를 추가합니다.

```ini
SCOUT_DRIVER=typesense
TYPESENSE_API_KEY=masterKey
TYPESENSE_HOST=localhost
```

[Laravel Sail](/docs/12.x/sail)을 사용하는 경우, `TYPESENSE_HOST` 환경 변수를 도커 컨테이너 이름에 맞게 조정해야 할 수 있습니다. 포트, 경로, 프로토콜도 선택적으로 지정할 수 있습니다.

```ini
TYPESENSE_PORT=8108
TYPESENSE_PATH=
TYPESENSE_PROTOCOL=http
```

Typesense 컬렉션에 대한 추가 설정 및 스키마 정의는 `config/scout.php` 설정 파일에서 관리하면 됩니다. 더 자세한 내용은 [Typesense 공식 문서](https://typesense.org/docs/guide/#quick-start)를 참고하세요.

<a name="preparing-data-for-storage-in-typesense"></a>
#### Typesense용 데이터 저장 준비

Typesense를 사용할 때, 검색 가능한 모델에는 모델의 기본 키를 문자열로, 생성 일시를 유닉스 타임스탬프로 변환하여 반환하는 `toSearchableArray` 메서드를 반드시 정의해야 합니다.

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

Typesense 컬렉션 스키마는 `config/scout.php` 파일에 정의해야 합니다. 이는 Typesense가 어떤 필드를 어떤 데이터 타입으로 검색할 수 있는지 지정하기 위한 것으로, 자세한 스키마 옵션은 [Typesense 공식 문서](https://typesense.org/docs/latest/api/collections.html#schema-parameters)를 참고하시기 바랍니다.

컬렉션 스키마를 변경해야 할 경우, `scout:flush`, `scout:import` 명령어로 기존 인덱스 데이터를 모두 삭제 후 스키마를 재생성하거나, Typesense의 API를 활용해 인덱스 데이터를 유지한 채 직접 스키마를 수정할 수 있습니다.

만약 검색 대상 모델이 소프트 삭제를 지원한다면, 해당 모델에 대한 Typesense 스키마에는 반드시 `__soft_deleted` 필드를 추가해야 합니다.

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

Typesense는 검색 시점에 `options` 메서드를 통해 [검색 파라미터](https://typesense.org/docs/latest/api/search.html#search-parameters)를 동적으로 지정할 수 있습니다.

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

각 Eloquent 모델은 해당 모델의 모든 검색 가능한 레코드를 저장하는 특정 "인덱스"에 동기화됩니다. 즉, 인덱스는 MySQL 테이블과 비슷하다고 생각하면 됩니다. 기본적으로 각 모델은 일반적으로 그 모델의 테이블 이름(복수형)과 일치하는 인덱스에 저장됩니다. 그러나 원하는 경우, 모델의 `searchableAs` 메서드를 오버라이드해 인덱스 이름을 커스터마이즈할 수 있습니다.

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
### 검색 가능한 데이터 설정

기본적으로 모델의 `toArray` 결과 전체가 검색 인덱스에 저장됩니다. 인덱스에 동기화할 데이터를 직접 지정하고 싶다면, 모델의 `toSearchableArray` 메서드를 오버라이드하면 됩니다.

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

        // 이 부분에서 데이터 배열을 커스터마이즈하세요...

        return $array;
    }
}
```

Meilisearch와 같이 일부 검색 엔진은 필터 연산(`>`, `<` 등)을 올바른 데이터 타입에만 적용할 수 있습니다. 이런 엔진을 사용할 때는 숫자 타입 등 검색 필드 값을 명확하게 캐스팅해주어야 정확한 필터가 가능합니다.

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
#### 인덱스 설정 구성 (Algolia)

경우에 따라 Algolia 인덱스에 대해 추가 설정이 필요할 수 있습니다. 이런 설정은 Algolia UI를 통해 할 수도 있지만, `config/scout.php` 설정 파일을 통해 관리하면 배포 자동화 및 여러 환경에서 일관성을 보다 쉽게 유지할 수 있습니다. 여기서 필터링 가능한 속성, 랭킹, 패싯(faceting), [기타 다양한 설정](https://www.algolia.com/doc/rest-api/search/#tag/Indices/operation/setSettings) 등을 직접 지정할 수 있습니다.

예를 들어, `config/scout.php` 파일에서 각 인덱스별로 설정을 추가할 수 있습니다.

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

소프트 삭제가 가능한 모델이 `index-settings` 배열에 포함되어 있다면, Scout는 해당 인덱스에 대해 소프트 삭제 모델에 대한 'faceting'도 자동 설정합니다. 별다른 faceting 속성이 없는 경우, 다음처럼 빈 항목만 추가해도 됩니다.

```php
'index-settings' => [
    Flight::class => []
],
```

설정이 완료되면, `scout:sync-index-settings` Artisan 명령어를 실행해야 합니다. 이 명령어는 Algolia에 현재 설정 정보를 전달합니다. 편의를 위해 이 명령어를 배포 과정에 포함시키는 것도 좋은 방법입니다.

```shell
php artisan scout:sync-index-settings
```

<a name="configuring-filterable-data-for-meilisearch"></a>
#### 필터링 가능한 데이터 및 인덱스 설정 구성 (Meilisearch)

Scout의 다른 드라이버와 달리, Meilisearch에서는 필터링할 속성, 정렬할 속성, [기타 다양한 설정 필드](https://docs.meilisearch.com/reference/api/settings.html) 등을 사전에 정의해야 합니다.

필터링 속성은 Scout의 `where` 메서드에서 사용할 컬럼, 정렬 속성은 `orderBy`로 정렬할 때 사용할 컬럼입니다. 인덱스 설정은 `scout` 설정 파일에서 `meilisearch` 항목의 `index-settings` 부분을 수정해 정의할 수 있습니다.

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

소프트 삭제가 가능한 모델이 `index-settings` 배열에 포함되어 있다면, 해당 인덱스에 대해 소프트 삭제 모델 필터링 지원이 자동으로 추가됩니다. 별다른 필터 또는 정렬 속성이 없는 경우, 아래처럼 빈 항목만 추가해도 괜찮습니다.

```php
'index-settings' => [
    Flight::class => []
],
```

설정이 완료되면, `scout:sync-index-settings` Artisan 명령어를 실행해 Meilisearch에 현재 인덱스 설정을 동기화하세요. 배포 프로세스에 이 명령을 포함시켜 두는 것이 편리합니다.

```shell
php artisan scout:sync-index-settings
```

<a name="configuring-the-model-id"></a>
### 모델 ID 설정

기본적으로 Scout는 모델의 프라이머리 키(primary key)를 인덱스의 고유 ID/키로 사용합니다. 만약 이 동작을 변경하고 싶다면, 모델에서 `getScoutKey` 및 `getScoutKeyName` 메서드를 직접 오버라이드할 수 있습니다.

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

기본적으로 Scout는 `scout` 설정 파일에 지정된 기본 검색 엔진을 사용해 모델을 검색합니다. 하지만, 특정 모델만 다른 검색 엔진을 사용하고 싶다면, 모델에서 `searchableUsing` 메서드를 오버라이드해 지정할 수 있습니다.

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
### 사용자 식별

Scout는 [Algolia](https://algolia.com)를 사용할 때, 사용자 인증 정보를 자동으로 식별해 전달할 수 있습니다. 이 기능을 활성화하면, Algolia 대시보드에서 검색 관련 분석 정보를 사용자(로그인한 사용자별)와 연동해 볼 수 있습니다. 활성화하려면, `.env` 파일에서 `SCOUT_IDENTIFY` 환경 변수를 `true`로 지정하면 됩니다.

```ini
SCOUT_IDENTIFY=true
```

이 기능을 활성화하면, 요청자의 IP 주소와 인증된 사용자의 기본 식별자(primary identifier)가 Algolia로 전달되어, 해당 사용자가 수행한 검색 요청과 연동됩니다.

<a name="database-and-collection-engines"></a>
## 데이터베이스 / 컬렉션 엔진

<a name="database-engine"></a>
### 데이터베이스 엔진

> [!WARNING]
> 데이터베이스 엔진은 현재 MySQL과 PostgreSQL만 지원합니다.

작은 데이터베이스나 부하가 적은 애플리케이션에서는 Scout의 "database" 엔진이 더 간편할 수 있습니다. 이 엔진은 기존 데이터베이스에서 "where like" 절 및 전문 검색 인덱스를 활용하여 쿼리 결과를 필터링합니다.

데이터베이스 엔진을 사용하려면, `.env` 파일에서 `SCOUT_DRIVER` 환경 변수를 `database`로 지정하거나, `scout` 설정 파일에서 직접 `database` 드라이버를 지정하세요.

```ini
SCOUT_DRIVER=database
```

드라이버를 지정한 후에는 [검색 대상 데이터 구성](#configuring-searchable-data)을 완료해야 하며, 이후에는 [검색 쿼리 실행](#searching)이 가능합니다. Algolia, Meilisearch, Typesense와 달리 인덱싱 시드를 따로 하실 필요는 없습니다.

#### 데이터베이스 검색 전략 커스터마이징

데이터베이스 엔진은 기본적으로 각 모델의 [검색 가능한 속성](#configuring-searchable-data) 전체에 대해 "where like" 쿼리를 수행합니다. 하지만, 데이터가 많거나 퍼포먼스 문제가 있다면 일부 컬럼에 Full Text 검색 쿼리를 사용하거나, 문자열 접두어(prefix)만 검색하도록 전략을 조정할 수 있습니다.

이런 동작을 지정하려면, 모델의 `toSearchableArray` 메서드에 PHP 어트리뷰트를 지정해주면 됩니다. 별도로 지정하지 않은 컬럼은 "where like" 기본 전략을 그대로 사용합니다.

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
> 컬럼에 Full Text 쿼리 제약을 지정하기 전, 해당 컬럼이 [Full Text 인덱스](/docs/12.x/migrations#available-index-types)로 생성되었는지 반드시 확인해야 합니다.

<a name="collection-engine"></a>
### 컬렉션 엔진

로컬 개발 환경에서는 Algolia, Meilisearch, Typesense처럼 외부 검색 엔진을 굳이 사용하지 않아도, "collection" 엔진이 더 간편할 수 있습니다. 이 엔진은 기존 데이터베이스에서 결과를 가져온 뒤, Laravel의 컬렉션 메서드와 "where" 조건을 사용해 검색 결과를 필터링합니다. 따로 검색 인덱싱을 하지 않아도, 검색 대상 모델을 바로 로컬 데이터베이스에서 조회합니다.

컬렉션 엔진을 사용하려면, `.env` 파일의 `SCOUT_DRIVER` 환경 변수를 `collection`으로 설정하거나, `scout` 설정 파일에서 직접 드라이버를 지정하면 됩니다.

```ini
SCOUT_DRIVER=collection
```

드라이버 지정 후 바로 모델에 대해 [검색 쿼리 실행](#searching)이 가능합니다. Algolia, Meilisearch, Typesense와 달리, 별도의 검색 인덱싱이 필요하지 않습니다.

#### 데이터베이스 엔진과의 차이점

"database"와 "collection" 엔진은 모두 데이터베이스를 직접 사용해 검색 결과를 가져옵니다. 그런데 컬렉션 엔진은 Full Text 인덱스나 `LIKE` 절을 사용하지 않고, 모든 레코드를 가져온 뒤 Laravel의 `Str::is` 헬퍼를 이용해 문자열 일치 여부를 검사합니다.

컬렉션 엔진은 SQLite, SQL Server 등 라라벨이 지원하는 모든 관계형 DB에서 동작합니다. 반면, 데이터가 많을 경우 효율은 낮으니 참고하시기 바랍니다.

<a name="indexing"></a>
## 인덱싱

<a name="batch-import"></a>
### 배치 가져오기(Import)

기존 프로젝트에 Scout를 도입하는 경우, 이미 있는 데이터베이스 레코드들을 검색 인덱스에 가져와야 할 수 있습니다. 이럴 때는 `scout:import` Artisan 명령어를 사용해, 기존 모든 레코드를 인덱스로 가져올 수 있습니다.

```shell
php artisan scout:import "App\Models\Post"
```

모델의 레코드를 전체 삭제하려면, `flush` 명령어를 사용하세요.

```shell
php artisan scout:flush "App\Models\Post"
```

<a name="modifying-the-import-query"></a>
#### 배치 가져오기 쿼리 수정

배치 가져오기에 사용할 쿼리를 커스터마이즈하고 싶다면, 모델에 `makeAllSearchableUsing` 메서드를 정의하면 됩니다. 예를 들어, 미리 연관관계를 함께 로드해두고 싶을 때 이 메서드에서 쿼리를 수정할 수 있습니다.

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
> `makeAllSearchableUsing` 메서드는 큐를 사용해 배치로 모델을 가져올 때는 적용되지 않을 수 있습니다. 큐 작업으로 모델 컬렉션을 처리할 때는 [관계가 복원되지 않습니다](/docs/12.x/queues#handling-relationships).

### 레코드 추가

`Laravel\Scout\Searchable` 트레이트를 모델에 추가했다면, 이제 모델 인스턴스를 `save` 또는 `create` 하면 자동으로 검색 인덱스에 추가됩니다. Scout를 [큐 사용](#queueing)으로 설정한 경우, 이 작업은 큐 워커에 의해 백그라운드에서 처리됩니다.

```php
use App\Models\Order;

$order = new Order;

// ...

$order->save();
```

<a name="adding-records-via-query"></a>
#### 쿼리를 통한 레코드 추가

Eloquent 쿼리를 사용해 여러 모델을 검색 인덱스에 추가하고 싶다면, Eloquent 쿼리 뒤에 `searchable` 메서드를 체이닝하면 됩니다. `searchable` 메서드는 쿼리 결과를 [청킹(chunking)](/docs/12.x/eloquent#chunking-results)하여 검색 인덱스에 추가합니다. Scout에 큐 사용이 설정되어 있다면, 모든 청크가 큐 워커에서 백그라운드로 임포트됩니다.

```php
use App\Models\Order;

Order::where('price', '>', 100)->searchable();
```

Eloquent 연관관계 인스턴스에서도 `searchable` 메서드를 호출할 수 있습니다.

```php
$user->orders()->searchable();
```

또는, 이미 메모리에 Eloquent 모델 컬렉션을 가지고 있다면 컬렉션 인스턴스에 `searchable` 메서드를 호출해 해당 모델 인스턴스를 인덱스에 추가할 수 있습니다.

```php
$orders->searchable();
```

> [!NOTE]
> `searchable` 메서드는 "업서트(upsert)" 동작을 한다고 볼 수 있습니다. 즉, 모델 레코드가 이미 인덱스에 존재하면 업데이트되고, 없다면 새로 추가됩니다.

<a name="updating-records"></a>
### 레코드 업데이트

검색 가능한 모델의 정보를 업데이트하려면, 모델 인스턴스의 속성 값을 수정한 후 데이터베이스에 `save`하면 됩니다. Scout는 변경 사항을 자동으로 검색 인덱스에 반영합니다.

```php
use App\Models\Order;

$order = Order::find(1);

// 주문 정보 수정...

$order->save();
```

Eloquent 쿼리 인스턴스에서 `searchable` 메서드를 사용하여 여러 모델을 한 번에 업데이트할 수도 있습니다. 만약 해당 모델이 검색 인덱스에 존재하지 않으면 새로 생성됩니다.

```php
Order::where('price', '>', 100)->searchable();
```

특정 연관관계에 속한 모든 모델의 검색 인덱스 레코드를 업데이트하려면, 연관관계 인스턴스에서 `searchable`을 호출하면 됩니다.

```php
$user->orders()->searchable();
```

또는, 이미 메모리 내에 Eloquent 모델 컬렉션이 있다면, 컬렉션 인스턴스에서 `searchable`을 호출하여 해당 인덱스를 업데이트할 수 있습니다.

```php
$orders->searchable();
```

<a name="modifying-records-before-importing"></a>
#### 임포트 전 레코드 수정

때로는 모델 컬렉션을 검색 인덱스에 추가하기 전에 필요한 준비 작업이 있을 수 있습니다. 예를 들어, 연관 데이터도 인덱스에 효율적으로 추가하기 위해 관계를 "즉시 로딩(eager load)"하고 싶을 수 있습니다. 이를 위해 해당 모델에 `makeSearchableUsing` 메서드를 정의할 수 있습니다.

```php
use Illuminate\Database\Eloquent\Collection;

/**
 * 검색 인덱스에 추가될 모델 컬렉션을 수정합니다.
 */
public function makeSearchableUsing(Collection $models): Collection
{
    return $models->load('author');
}
```

<a name="removing-records"></a>
### 레코드 삭제

검색 인덱스에서 레코드를 제거하려면 모델을 데이터베이스에서 `delete` 하면 됩니다. [소프트 삭제](/docs/12.x/eloquent#soft-deleting) 모델을 사용하는 경우에도 동일하게 동작합니다.

```php
use App\Models\Order;

$order = Order::find(1);

$order->delete();
```

레코드를 삭제할 때 모델을 미리 조회하고 싶지 않다면, Eloquent 쿼리 인스턴스에서 `unsearchable` 메서드를 사용할 수 있습니다.

```php
Order::where('price', '>', 100)->unsearchable();
```

특정 연관관계에 속한 모든 모델의 검색 인덱스 레코드를 삭제하려면, 연관관계 인스턴스에서 `unsearchable`을 호출하십시오.

```php
$user->orders()->unsearchable();
```

또는, 이미 컬렉션 내에 모델이 있다면, 컬렉션 인스턴스에서 `unsearchable` 메서드를 호출해 각 인스턴스를 인덱스에서 제거할 수 있습니다.

```php
$orders->unsearchable();
```

모든 모델 레코드를 해당 인덱스에서 한꺼번에 제거하고 싶다면 `removeAllFromSearch` 메서드를 사용할 수 있습니다.

```php
Order::removeAllFromSearch();
```

<a name="pausing-indexing"></a>
### 인덱싱 일시 중단

때로는 모델에 대해 여러 Eloquent 작업을 수행하면서, 인덱스와 동기화(sync)를 잠시 멈추고 싶을 수 있습니다. 이럴 때는 `withoutSyncingToSearch` 메서드를 사용할 수 있습니다. 이 메서드는 단일 클로저를 인수로 받아서, 클로저 안에서 일어나는 모든 모델 작업은 인덱스에 반영되지 않습니다.

```php
use App\Models\Order;

Order::withoutSyncingToSearch(function () {
    // 여러 모델 작업 수행...
});
```

<a name="conditionally-searchable-model-instances"></a>
### 조건부로 검색 가능한 모델 인스턴스

경우에 따라 특정 조건을 만족할 때만 모델을 검색 가능하게 하고 싶을 수 있습니다. 예를 들어, `App\Models\Post` 모델에 "임시저장(draft)" 상태와 "공개(published)" 상태가 있다고 할 때, "공개" 상태만 검색되도록 만들고 싶을 수 있습니다. 이런 경우, 모델에 `shouldBeSearchable` 메서드를 정의할 수 있습니다.

```php
/**
 * 해당 모델이 검색 인덱스에 추가 가능한지 여부를 반환합니다.
 */
public function shouldBeSearchable(): bool
{
    return $this->isPublished();
}
```

`shouldBeSearchable` 메서드는 모델을 `save` 및 `create` 또는 쿼리, 연관관계 등으로 조작할 때만 적용됩니다. 직접적으로 모델 또는 컬렉션에 대해 `searchable` 메서드를 호출하는 경우에는 `shouldBeSearchable`의 결과가 무시되고 덮어써집니다.

> [!WARNING]
> `shouldBeSearchable` 메서드는 Scout의 "database" 엔진에는 적용되지 않습니다. database 엔진은 모든 데이터가 항상 데이터베이스에 저장되기 때문입니다. database 엔진에서는 이와 유사한 기능을 사용하고 싶다면 [where 절](#where-clauses)을 사용해야 합니다.

<a name="searching"></a>
## 검색

`search` 메서드를 사용해 모델 검색을 시작할 수 있습니다. `search` 메서드는 검색어로 사용할 문자열 하나를 인수로 받습니다. 이어서 `get` 메서드를 체이닝하여, 해당 검색어에 부합하는 Eloquent 모델을 가져올 수 있습니다.

```php
use App\Models\Order;

$orders = Order::search('Star Trek')->get();
```

Scout의 검색은 Eloquent 모델의 컬렉션을 반환하므로, 이 결과를 라우트나 컨트롤러에서 바로 반환하면 자동으로 JSON으로 변환됩니다.

```php
use App\Models\Order;
use Illuminate\Http\Request;

Route::get('/search', function (Request $request) {
    return Order::search($request->search)->get();
});
```

검색 시 Eloquent 모델로 변환되기 전, 원시(raw) 검색 결과를 받고 싶다면 `raw` 메서드를 사용할 수 있습니다.

```php
$orders = Order::search('Star Trek')->raw();
```

<a name="custom-indexes"></a>
#### 사용자 지정 인덱스

검색 쿼리는 기본적으로 모델의 [searchableAs](#configuring-model-indexes) 메서드에서 지정한 인덱스에서 수행됩니다. 그러나 `within` 메서드를 사용해 다른 사용자 지정 인덱스를 지정할 수 있습니다.

```php
$orders = Order::search('Star Trek')
    ->within('tv_shows_popularity_desc')
    ->get();
```

<a name="where-clauses"></a>
### Where 절

Scout는 검색 쿼리에 간단한 "where" 절을 추가할 수 있게 해줍니다. 현재 이 where 절은 기본 숫자값 일치(equality)만 지원하며, 주로 소유자 ID로 검색 범위를 제한하는 용도로 쓰입니다.

```php
use App\Models\Order;

$orders = Order::search('Star Trek')->where('user_id', 1)->get();
```

또한, `whereIn` 메서드를 사용하면 특정 컬럼 값이 지정한 배열 안에 있는지 확인할 수 있습니다.

```php
$orders = Order::search('Star Trek')->whereIn(
    'status', ['open', 'paid']
)->get();
```

`whereNotIn` 메서드는 특정 컬럼 값이 지정한 배열에 포함되지 않는지 확인합니다.

```php
$orders = Order::search('Star Trek')->whereNotIn(
    'status', ['closed']
)->get();
```

검색 인덱스는 관계형 데이터베이스가 아니기 때문에, 이보다 더 복잡한 "where" 절은 지원하지 않습니다.

> [!WARNING]
> 애플리케이션에서 Meilisearch를 사용하는 경우, Scout의 "where" 절을 사용하기 전에 반드시 [필터링 가능한 속성](#configuring-filterable-data-for-meilisearch)을 설정해야 합니다.

<a name="pagination"></a>
### 페이지네이션

모델 컬렉션을 조회하는 것 외에도, `paginate` 메서드를 사용해 검색 결과를 페이지네이션 할 수 있습니다. 이 메서드는 기존의 [Eloquent 쿼리 페이지네이션](/docs/12.x/pagination)처럼 `Illuminate\Pagination\LengthAwarePaginator` 인스턴스를 반환합니다.

```php
use App\Models\Order;

$orders = Order::search('Star Trek')->paginate();
```

한 페이지에 가져올 모델 개수를 지정하려면 첫 번째 인수로 개수를 전달하면 됩니다.

```php
$orders = Order::search('Star Trek')->paginate(15);
```

검색 결과를 받은 후에는, 기존 Eloquent 페이지네이션과 마찬가지로 [Blade](/docs/12.x/blade)를 이용해 결과와 페이지 링크를 표시할 수 있습니다.

```html
<div class="container">
    @foreach ($orders as $order)
        {{ $order->price }}
    @endforeach
</div>

{{ $orders->links() }}
```

또한, 페이지네이션 결과를 JSON으로 받고 싶다면 라우트나 컨트롤러에서 paginator 인스턴스를 바로 반환하면 됩니다.

```php
use App\Models\Order;
use Illuminate\Http\Request;

Route::get('/orders', function (Request $request) {
    return Order::search($request->input('query'))->paginate(15);
});
```

> [!WARNING]
> 검색 엔진은 Eloquent 모델의 글로벌 스코프(global scope) 정의를 인식하지 못하기 때문에, Scout 페이지네이션을 사용하는 애플리케이션에서는 글로벌 스코프를 이용해서는 안 됩니다. 또는, Scout 검색 시 글로벌 스코프의 조건을 직접 재구현해야 합니다.

<a name="soft-deleting"></a>
### 소프트 삭제

인덱싱된 모델에 [소프트 삭제](/docs/12.x/eloquent#soft-deleting)를 적용하고, 소프트 삭제된 모델까지 같이 검색하고 싶다면 `config/scout.php` 설정 파일의 `soft_delete` 옵션을 `true`로 바꾸십시오.

```php
'soft_delete' => true,
```

이 설정이 `true`인 경우, Scout는 소프트 삭제된 모델을 검색 인덱스에서 제거하지 않고, 인덱스된 레코드에 숨겨진 `__soft_deleted` 속성만 추가합니다. 이후 검색 시에는 `withTrashed` 또는 `onlyTrashed` 메서드를 사용해 소프트 삭제된 레코드를 포함시켜 가져올 수 있습니다.

```php
use App\Models\Order;

// 삭제된(trashed) 레코드도 결과에 포함...
$orders = Order::search('Star Trek')->withTrashed()->get();

// 오직 삭제된(trashed) 레코드만 결과에 포함...
$orders = Order::search('Star Trek')->onlyTrashed()->get();
```

> [!NOTE]
> 소프트 삭제된 모델을 `forceDelete`로 영구적으로 삭제하면, Scout가 검색 인덱스에서 해당 레코드를 자동으로 제거합니다.

<a name="customizing-engine-searches"></a>
### 엔진 검색 커스터마이징

검색 엔진의 동작을 더 상세히 조정해야 할 경우, `search` 메서드의 두 번째 인수로 클로저를 전달할 수 있습니다. 예를 들어, Algolia에 쿼리를 넘기기 전에 검색 옵션에 지리 위치(geo-location) 데이터를 추가할 수 있습니다.

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
#### Eloquent 결과 쿼리 커스터마이징

Scout가 검색 엔진에서 일치하는 Eloquent 모델 목록을 가져온 후에는, 이 결과를 활용하여 Eloquent가 프라이머리 키 기준으로 모든 모델을 다시 조회합니다. 이 때의 쿼리를 커스터마이징하려면 `query` 메서드를 사용하면 됩니다. `query` 메서드는 하나의 클로저를 인수로 받고, 이 클로저에는 Eloquent 쿼리 빌더 인스턴스가 전달됩니다.

```php
use App\Models\Order;
use Illuminate\Database\Eloquent\Builder;

$orders = Order::search('Star Trek')
    ->query(fn (Builder $query) => $query->with('invoices'))
    ->get();
```

이 콜백은 애플리케이션의 검색 엔진에서 관련 모델을 이미 조회한 후에 실행되기 때문에, 결과 "필터링"에는 사용하지 않아야 합니다. 결과 필터링에는 반드시 [Scout where 절](#where-clauses)을 사용해 주세요.

<a name="custom-engines"></a>
## 커스텀 엔진

<a name="writing-the-engine"></a>
#### 커스텀 엔진 작성하기

내장된 Scout 검색 엔진이 요구사항을 충족하지 못한다면, 직접 커스텀 엔진을 만들어 Scout에 등록할 수 있습니다. 커스텀 엔진은 `Laravel\Scout\Engines\Engine` 추상 클래스를 상속해야 하며, 이 추상 클래스는 반드시 구현해야 하는 8개의 메서드를 포함하고 있습니다.

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

각 메서드의 구현 방법을 알기 위해서는 `Laravel\Scout\Engines\AlgoliaEngine` 클래스의 소스 코드를 참고하는 것이 좋습니다. 이 클래스의 코드는 각 메서드를 어떻게 구현해야 할지 상당히 유용한 출발점이 될 것입니다.

<a name="registering-the-engine"></a>
#### 커스텀 엔진 등록하기

커스텀 엔진 구현이 끝났다면, Scout 엔진 매니저의 `extend` 메서드를 사용해 Scout에 등록합니다. Scout 엔진 매니저는 라라벨 서비스 컨테이너에서 사용할 수 있으며, `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드 또는 애플리케이션에서 사용하는 다른 서비스 프로바이더 내에서 `extend`를 호출해야 합니다.

```php
use App\ScoutExtensions\MySqlSearchEngine;
use Laravel\Scout\EngineManager;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    resolve(EngineManager::class)->extend('mysql', function () {
        return new MySqlSearchEngine;
    });
}
```

이제 엔진을 등록했다면, 애플리케이션의 `config/scout.php` 설정 파일에서 Scout의 기본 `driver`로 지정할 수 있습니다.

```php
'driver' => 'mysql',
```