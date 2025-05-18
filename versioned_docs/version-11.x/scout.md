# 라라벨 스카우트 (Laravel Scout)

- [소개](#introduction)
- [설치](#installation)
    - [큐잉(Queueing)](#queueing)
- [드라이버 필수 조건](#driver-prerequisites)
    - [Algolia](#algolia)
    - [Meilisearch](#meilisearch)
    - [Typesense](#typesense)
- [설정](#configuration)
    - [모델 인덱스 설정](#configuring-model-indexes)
    - [검색 가능 데이터 설정](#configuring-searchable-data)
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
- [검색(Searching)](#searching)
    - [Where 절](#where-clauses)
    - [페이지네이션](#pagination)
    - [소프트 삭제](#soft-deleting)
    - [엔진 검색 커스터마이징](#customizing-engine-searches)
- [커스텀 엔진](#custom-engines)

<a name="introduction"></a>
## 소개

[라라벨 Scout](https://github.com/laravel/scout)는 [Eloquent 모델](/docs/11.x/eloquent)에 전체 텍스트 검색 기능을 간단하게 추가할 수 있는, 드라이버 기반의 솔루션을 제공합니다. Scout는 모델 옵저버를 활용하여 Eloquent 레코드와 검색 인덱스를 자동으로 동기화해줍니다.

현재 Scout는 [Algolia](https://www.algolia.com/), [Meilisearch](https://www.meilisearch.com), [Typesense](https://typesense.org), 그리고 MySQL / PostgreSQL(`database`) 드라이버를 기본으로 제공합니다. 추가로, 외부 서비스나 별도의 의존성 없이 로컬 개발 환경에서 사용할 수 있는 "collection" 드라이버도 내장되어 있습니다. 또한 커스텀 드라이버를 손쉽게 작성해서 Scout를 원하는 방식으로 확장할 수 있습니다.

<a name="installation"></a>
## 설치

먼저, Composer 패키지 관리자를 통해 Scout를 설치합니다:

```shell
composer require laravel/scout
```

Scout를 설치한 후에는 `vendor:publish` 아티즌 명령어를 사용하여 Scout 설정 파일을 배포해야 합니다. 이 명령을 실행하면 `scout.php` 설정 파일이 애플리케이션의 `config` 디렉터리에 생성됩니다:

```shell
php artisan vendor:publish --provider="Laravel\Scout\ScoutServiceProvider"
```

마지막으로, 검색 기능을 적용할 모델에 `Laravel\Scout\Searchable` 트레이트(trait)를 추가합니다. 이 트레이트는 모델 옵저버를 등록하여, 해당 모델이 검색 드라이버와 자동으로 동기화되도록 만듭니다.

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
### 큐잉(Queueing)

Scout를 사용하기 위해서는 반드시 큐 설정이 필요한 것은 아니지만, 라이브러리를 실제로 적용하기 전에 [큐 드라이버](/docs/11.x/queues)를 설정하는 것을 적극 권장합니다. 큐 워커를 실행하면 모델 정보를 검색 인덱스와 동기화하는 모든 작업을 큐에 쌓아서 처리할 수 있으므로, 애플리케이션 웹 인터페이스의 응답 속도가 훨씬 빨라집니다.

큐 드라이버를 설정했다면 `config/scout.php` 설정 파일의 `queue` 옵션 값을 `true`로 지정하세요:

```
'queue' => true,
```

`queue` 옵션이 `false`로 되어 있더라도, Algolia와 Meilisearch와 같은 일부 Scout 드라이버는 항상 레코드 인덱싱을 비동기적으로 처리한다는 점에 주의해야 합니다. 즉, 라라벨 애플리케이션에서 인덱스 작업이 완료된 것처럼 보여도, 실제로 검색 엔진이 새로운 레코드 또는 수정된 레코드를 반영하는 데에는 약간의 지연이 있을 수 있습니다.

Scout 작업에서 사용할 연결(connection)과 큐(queue)를 지정하려면, `queue` 옵션을 배열로 정의할 수 있습니다:

```
'queue' => [
    'connection' => 'redis',
    'queue' => 'scout'
],
```

당연히, Scout 작업에서 사용하는 연결 및 큐를 커스터마이즈했다면 해당 연결과 큐에서 작업을 처리하기 위해 큐 워커를 실행해야 합니다:

```
php artisan queue:work redis --queue=scout
```

<a name="driver-prerequisites"></a>
## 드라이버 필수 조건

<a name="algolia"></a>
### Algolia

Algolia 드라이버를 사용하는 경우, `config/scout.php` 파일에 Algolia의 `id`와 `secret` 자격 증명을 설정해야 합니다. 자격 증명 설정 후에는 Composer를 통해 Algolia PHP SDK도 설치해야 합니다:

```shell
composer require algolia/algoliasearch-client-php
```

<a name="meilisearch"></a>
### Meilisearch

[Meilisearch](https://www.meilisearch.com)는 매우 빠르고 오픈소스인 검색 엔진입니다. 로컬 머신에 Meilisearch를 어떻게 설치해야 할지 잘 모르겠다면, 라라벨에서 공식적으로 지원하는 Docker 개발 환경인 [Laravel Sail](/docs/11.x/sail#meilisearch)을 사용할 수 있습니다.

Meilisearch 드라이버를 사용하려면 Composer를 통해 Meilisearch PHP SDK를 설치해야 합니다:

```shell
composer require meilisearch/meilisearch-php http-interop/http-factory-guzzle
```

그런 다음, 애플리케이션의 `.env` 파일에 `SCOUT_DRIVER` 환경 변수와 함께 Meilisearch의 `host`, `key` 자격 증명을 설정합니다:

```ini
SCOUT_DRIVER=meilisearch
MEILISEARCH_HOST=http://127.0.0.1:7700
MEILISEARCH_KEY=masterKey
```

Meilisearch에 대한 더 자세한 내용은 [Meilisearch 문서](https://docs.meilisearch.com/learn/getting_started/quick_start.html)를 참고하세요.

또한, 사용하는 Meilisearch 바이너리 버전에 호환되는 `meilisearch/meilisearch-php` 패키지 버전을 설치해야 하므로, [Meilisearch의 바이너리 호환성 문서](https://github.com/meilisearch/meilisearch-php#-compatibility-with-meilisearch)를 반드시 확인하시기 바랍니다.

> [!WARNING]
> Meilisearch를 사용하는 애플리케이션에서 Scout를 업그레이드할 때는, 항상 Meilisearch 서비스 자체에 [추가적으로 발생하는 변경사항](https://github.com/meilisearch/Meilisearch/releases)이 있는지 반드시 확인해야 합니다.

<a name="typesense"></a>
### Typesense

[Typesense](https://typesense.org)는 키워드 검색, 시맨틱 검색, 지오 검색, 벡터 검색을 지원하는 초고속 오픈소스 검색 엔진입니다.

[셀프 호스팅](https://typesense.org/docs/guide/install-typesense.html#option-2-local-machine-self-hosting) 방식이나 [Typesense Cloud](https://cloud.typesense.org)를 이용할 수 있습니다.

Scout와 함께 Typesense를 사용하려면, Composer 패키지 관리자를 통해 Typesense PHP SDK를 설치하세요:

```shell
composer require typesense/typesense-php
```

그리고 애플리케이션의 .env 파일에 `SCOUT_DRIVER` 환경 변수와 Typesense 호스트 및 API 키 자격 증명을 설정하세요:

```ini
SCOUT_DRIVER=typesense
TYPESENSE_API_KEY=masterKey
TYPESENSE_HOST=localhost
```

[Laravel Sail](/docs/11.x/sail)을 사용하는 경우, Docker 컨테이너 이름에 맞게 `TYPESENSE_HOST` 환경 변수를 수정해야 할 수 있습니다. 설치된 Typesense의 포트, 경로, 프로토콜 등을 추가로 지정할 수도 있습니다:

```ini
TYPESENSE_PORT=8108
TYPESENSE_PATH=
TYPESENSE_PROTOCOL=http
```

Typesense 컬렉션에 대한 추가 설정 및 스키마 정의는 애플리케이션의 `config/scout.php` 설정 파일에서 찾을 수 있습니다. Typesense에 대한 더 많은 정보가 필요하다면 [Typesense 공식 문서](https://typesense.org/docs/guide/#quick-start)를 참고하세요.

<a name="preparing-data-for-storage-in-typesense"></a>
#### Typesense에 저장할 데이터 준비

Typesense를 사용할 때는, 검색 대상 모델에 `toSearchableArray` 메서드를 정의하여 해당 모델의 기본 키를 문자열로, 생성일자를 UNIX 타임스탬프로 변환해주어야 합니다:

```php
/**
 * 모델의 인덱싱 대상 데이터 배열 반환
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

Typesense 컬렉션의 스키마도 애플리케이션의 `config/scout.php` 파일 내에 정의해야 합니다. 컬렉션 스키마란 Typesense로 검색할 수 있는 각 필드의 데이터 타입을 기술한 것이라고 생각하면 됩니다. 사용 가능한 모든 스키마 옵션은 [Typesense 공식 문서](https://typesense.org/docs/latest/api/collections.html#schema-parameters)에서 확인하세요.

이미 정의한 Typesense 컬렉션의 스키마를 변경해야 한다면, `scout:flush`와 `scout:import` 명령을 차례로 실행하여 기존에 인덱싱된 모든 데이터를 삭제하고 스키마를 새로 만들 수 있습니다. 또는, Typesense의 API를 직접 이용해 이미 인덱싱된 데이터를 삭제하지 않고 컬렉션 스키마만 수정할 수도 있습니다.

검색 대상 모델이 소프트 딜리트(soft delete)를 지원한다면, 해당 모델의 Typesense 스키마에 `__soft_deleted` 필드를 다음과 같이 정의해야 합니다:

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

Typesense는 검색을 수행할 때 `options` 메서드를 통해 [검색 파라미터](https://typesense.org/docs/latest/api/search.html#search-parameters)를 동적으로 변경할 수 있도록 지원합니다:

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

각 Eloquent 모델은 해당 모델의 모든 검색 가능한 레코드를 담는 특정 "인덱스"와 동기화됩니다. 쉽게 말하면, 인덱스는 MySQL의 테이블과 비슷하다고 생각할 수 있습니다. 기본적으로 각 모델은 모델의 "테이블" 이름과 일치하는 인덱스에 저장됩니다. 일반적으로 이는 모델 이름의 복수형이 됩니다. 물론, 원하는 경우 모델에서 `searchableAs` 메서드를 오버라이드해서 인덱스 이름을 직접 지정할 수 있습니다:

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class Post extends Model
{
    use Searchable;

    /**
     * 해당 모델이 연관된 인덱스의 이름을 반환합니다.
     */
    public function searchableAs(): string
    {
        return 'posts_index';
    }
}
```

<a name="configuring-searchable-data"></a>
### 검색 가능 데이터 설정

기본적으로 Scout는 해당 모델의 `toArray` 결과 전체를 검색 인덱스에 저장합니다. 만약 검색 인덱스에 동기화하는 데이터를 커스터마이즈하고 싶다면, 모델의 `toSearchableArray` 메서드를 오버라이드하여 원하는 필드만 반환하도록 할 수 있습니다:

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class Post extends Model
{
    use Searchable;

    /**
     * 모델의 인덱싱 대상 데이터 배열 반환
     *
     * @return array<string, mixed>
     */
    public function toSearchableArray(): array
    {
        $array = $this->toArray();

        // 필요한 데이터로 배열을 커스터마이즈하세요...

        return $array;
    }
}
```

Meilisearch와 같은 일부 검색 엔진은, 필터 연산자(`>`, `<` 등)를 사용할 때 필드의 데이터 타입이 정확해야만 작동합니다. 따라서 이와 같이 검색 가능 데이터를 커스터마이즈할 때는 숫자형 등을 적절한 타입으로 캐스팅해주어야 합니다:

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

<a name="configuring-indexes-for-algolia"></a>
#### 인덱스 설정 커스터마이즈(Algolia)

Algolia 인덱스에 추가 설정을 적용하고 싶을 때가 있습니다. 이러한 설정은 Algolia UI에서도 관리할 수 있지만, 애플리케이션의 `config/scout.php` 파일에서 직접 관리하는 것이 더 효율적일 때도 많습니다.

이 방식을 활용하면, 배포 파이프라인에서 자동으로 설정을 적용할 수 있어 수동 작업 없이도 다수의 환경에서 일관성을 유지할 수 있습니다. 필터링하고자 하는 속성, 랭킹, facet 등 [지원되는 다른 설정들](https://www.algolia.com/doc/rest-api/search/#tag/Indices/operation/setSettings)도 모두 정의할 수 있습니다.

시작하려면 각 인덱스에 대해, 애플리케이션의 `config/scout.php` 설정 파일에 아래처럼 설정을 추가하세요:

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
            // 다른 설정 필드...
        ],
        Flight::class => [
            'searchableAttributes'=> ['id', 'destination'],
        ],
    ],
],
```

만약 해당 인덱스의 모델이 소프트 딜리트를 지원하고 `index-settings` 배열에 포함되어 있다면, Scout는 그 인덱스에 대해 소프트 삭제 모델에 대한 facet 지원을 자동으로 포함시켜줍니다. facet이 필요한 속성이 없는 경우에도 해당 모델에 대해 빈 항목을 아래처럼 추가하면 됩니다:

```php
'index-settings' => [
    Flight::class => []
],
```

설정이 끝났으면, `scout:sync-index-settings` 아티즌 명령어를 반드시 실행해야 합니다. 이 명령이 Algolia에 현재 설정 내용을 반영해 줍니다. 배포 프로세스 일부로 이 명령을 포함시키면 편리합니다:

```shell
php artisan scout:sync-index-settings
```

<a name="configuring-filterable-data-for-meilisearch"></a>
#### 필터링 가능한 데이터 및 인덱스 설정(Meilisearch)

다른 Scout 드라이버들과 달리, Meilisearch는 필터링 속성, 정렬 속성, [기타 지원되는 설정 필드](https://docs.meilisearch.com/reference/api/settings.html)와 같은 인덱스 검색 설정을 미리 정의해야 합니다.

filterable attributes(필터링 속성)은 Scout의 `where` 메서드를 사용할 때 필터링하려는 속성을 의미하고, sortable attributes(정렬 속성)은 Scout의 `orderBy` 메서드로 정렬할 속성입니다. 인덱스 설정을 정의하려면, 앱의 `scout` 설정 파일 내 `meilisearch` 항목에 있는 `index-settings` 부분을 다음과 같이 조정하세요:

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

해당 인덱스의 모델이 소프트 딜리트를 지원하고 `index-settings` 배열에 포함되어 있다면, Scout가 그 인덱스에서 소프트 삭제 모델에 대한 필터링 지원을 자동으로 처리해줍니다. 별도의 filterable/sortable 속성이 더 이상 필요 없다면, 아래처럼 빈 항목만 추가해도 됩니다:

```php
'index-settings' => [
    Flight::class => []
],
```

설정이 끝난 후에는, 반드시 `scout:sync-index-settings` 아티즌 명령어를 실행해야 합니다. 이 명령은 Meilisearch에 현재 인덱스 설정 내용을 동기화해줍니다. 배포 프로세스에 포함시키면 편리합니다:

```shell
php artisan scout:sync-index-settings
```

<a name="configuring-the-model-id"></a>
### 모델 ID 설정

Scout는 기본적으로 모델의 기본 키(primary key)를 검색 인덱스에 저장되는 고유 ID/키로 사용합니다. 이 동작을 변경하고 싶을 경우, 모델에서 `getScoutKey`와 `getScoutKeyName` 메서드를 오버라이드하면 됩니다:

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class User extends Model
{
    use Searchable;

    /**
     * 인덱싱에 사용할 값 반환
     */
    public function getScoutKey(): mixed
    {
        return $this->email;
    }

    /**
     * 인덱싱에 사용할 키 이름 반환
     */
    public function getScoutKeyName(): mixed
    {
        return 'email';
    }
}
```

<a name="configuring-search-engines-per-model"></a>
### 모델별 검색 엔진 설정

기본적으로 Scout는 앱의 `scout` 설정 파일에서 지정한 디폴트 검색 엔진을 사용합니다. 하지만, 특정 모델만 다른 검색 엔진을 사용하도록 할 수 있습니다. 이럴 때는 해당 모델에서 `searchableUsing` 메서드를 오버라이드하면 됩니다:

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
     * 모델 인덱싱에 사용할 엔진 반환
     */
    public function searchableUsing(): Engine
    {
        return app(EngineManager::class)->engine('meilisearch');
    }
}
```

<a name="identifying-users"></a>
### 사용자 식별

Scout는 [Algolia](https://algolia.com)를 사용할 때 검색 요청에 연관된 사용자를 자동으로 식별하는 기능을 제공합니다. 이 기능은 Algolia의 대시보드에서 검색 분석 통계를 볼 때, 인증된 사용자의 검색 활동과 연관짓는 데 유용할 수 있습니다. 이 기능을 활성화하려면 애플리케이션의 `.env` 파일에 `SCOUT_IDENTIFY` 환경 변수를 `true`로 지정하세요:

```ini
SCOUT_IDENTIFY=true
```

이 옵션을 활성화하면, 요청자의 IP 주소와 인증된 사용자의 기본 식별자(primary identifier)가 Algolia로 전달되어 검색 요청과 함께 연결됩니다.

<a name="database-and-collection-engines"></a>
## 데이터베이스 / 컬렉션 엔진

<a name="database-engine"></a>
### 데이터베이스 엔진

> [!WARNING]
> 데이터베이스 엔진은 현재 MySQL과 PostgreSQL만 지원합니다.

애플리케이션이 소규모 또는 중간 규모의 데이터베이스를 사용하거나 작업 부하가 많지 않은 경우, Scout의 "database" 엔진으로 쉽게 시작할 수 있습니다. 데이터베이스 엔진은 기존 데이터베이스에서 "where like" 절과 풀 텍스트 인덱스를 이용해 쿼리 결과를 필터링하여, 해당 검색어에 맞는 데이터를 찾아 반환합니다.

데이터베이스 엔진을 사용하려면, `.env` 파일의 `SCOUT_DRIVER` 환경 변수를 `database`로 지정하거나, 애플리케이션의 `scout` 설정 파일에서 `database` 드라이버를 직접 명시해 주면 됩니다:

```ini
SCOUT_DRIVER=database
```

데이터베이스 엔진을 기본 드라이버로 지정했다면, [검색 가능 데이터 설정](#configuring-searchable-data)을 꼭 완료해야 합니다. 이후에는 모델에 대해 바로 [검색 쿼리 실행](#searching)이 가능합니다. 별도의 인덱스 생성이나 Algolia/Meilisearch/Typesense와 같은 검색 엔진의 인덱싱 작업은 필요하지 않습니다.

#### 데이터베이스 검색 전략 커스터마이즈

기본적으로 데이터베이스 엔진은 [검색 가능한 것으로 지정한](#configuring-searchable-data) 모든 모델 속성을 사용해 "where like" 쿼리를 실행합니다. 경우에 따라 성능 문제가 발생할 수 있으므로, 데이터베이스 엔진의 검색 전략을 지정된 컬럼은 풀 텍스트 검색 쿼리를 쓰거나, 문자열의 접두사만 검색하는 등(`example%`), 특정 제약을 줄 수도 있습니다(전체 문자열 검색: `%example%` 대신).

이 동작은 모델의 `toSearchableArray` 메서드에 PHP Attributes를 정의하여 지정할 수 있습니다. 추가 검색 전략을 부여하지 않은 컬럼은 기본 "where like" 전략을 그대로 사용합니다:

```php
use Laravel\Scout\Attributes\SearchUsingFullText;
use Laravel\Scout\Attributes\SearchUsingPrefix;

/**
 * 모델의 인덱싱 대상 데이터 배열 반환
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
> 특정 컬럼에 풀 텍스트 쿼리 제약을 부여하기 전에, 해당 컬럼에 [풀 텍스트 인덱스](/docs/11.x/migrations#available-index-types)가 반드시 생성되어 있는지 확인해야 합니다.

<a name="collection-engine"></a>
### 컬렉션 엔진

로컬 개발 환경에서도 Algolia, Meilisearch 또는 Typesense 검색 엔진을 사용할 수 있지만, "collection" 엔진으로 시작하는 것이 훨씬 간편할 수 있습니다. 컬렉션 엔진은 기존 데이터베이스에서 결과를 가져온 후 "where" 절과 컬렉션 필터링을 사용해, 검색 결과를 추려냅니다. 이 엔진을 사용할 때는 검색 대상 모델을 별도로 인덱싱(import)할 필요 없이, 로컬 데이터베이스에서 바로 데이터를 조회합니다.

컬렉션 엔진을 사용하려면 `.env` 파일의 `SCOUT_DRIVER` 환경 변수를 `collection`으로 설정하거나, 앱의 `scout` 설정 파일에서 `collection` 드라이버를 지정하세요:

```ini
SCOUT_DRIVER=collection
```

컬렉션 드라이버를 기본 드라이버로 지정했다면, 바로 [검색 쿼리 실행](#searching)이 가능합니다. Algolia, Meilisearch, Typesense와 같은 검색 엔진에 데이터를 인덱싱할 필요가 없습니다.

#### 데이터베이스 엔진과의 차이점

"database" 및 "collection" 엔진은 모두 데이터베이스에서 직접 검색 결과를 조회한다는 점에서 유사해 보일 수 있습니다. 하지만 컬렉션 엔진은 풀 텍스트 인덱스나 LIKE 절을 활용하지 않고, 가능한 모든 레코드를 가져온 뒤 라라벨의 `Str::is` 헬퍼를 이용해 모델 속성 값 내에 검색어가 포함되어 있는지를 검사합니다.

컬렉션 엔진은 SQLite, SQL Server 등 라라벨에서 지원하는 모든 관계형 데이터베이스에서 사용할 수 있으므로 가장 이식성(portability)이 좋은 검색 엔진입니다. 대신, Scout의 데이터베이스 엔진보다는 효율성이 떨어질 수 있습니다.

<a name="indexing"></a>
## 인덱싱

<a name="batch-import"></a>
### 배치 가져오기(Import)

기존 프로젝트에 Scout를 도입하는 경우, 이미 존재하는 데이터베이스 레코드를 검색 인덱스에 일괄 등록해야 할 수도 있습니다. 이럴 때 사용할 수 있는 Artisan 명령어는 `scout:import`입니다. 아래 예시는 모든 기존 레코드를 검색 인덱스로 가져온다는 의미입니다:

```shell
php artisan scout:import "App\Models\Post"
```

모델의 모든 레코드를 검색 인덱스에서 제거하려면, `flush` 명령어를 사용할 수 있습니다:

```shell
php artisan scout:flush "App\Models\Post"
```

<a name="modifying-the-import-query"></a>
#### 가져오기 쿼리 커스터마이즈

모든 모델을 일괄 검색 가능하게 만들 때 사용하는 쿼리를 수정하고 싶다면, 모델 내에 `makeAllSearchableUsing` 메서드를 정의할 수 있습니다. 이 메서드에서는 일괄 등록 전에 꼭 필요한 관계를 미리 로딩하는 등의 작업을 추가할 수 있습니다:

```
use Illuminate\Database\Eloquent\Builder;

/**
 * 모든 모델을 검색 가능하게 만들 때 사용할 쿼리 수정
 */
protected function makeAllSearchableUsing(Builder $query): Builder
{
    return $query->with('author');
}
```

> [!WARNING]
> 모델을 일괄 등록할 때 큐를 사용한다면 `makeAllSearchableUsing` 메서드가 적용되지 않을 수 있습니다. 큐 작업으로 모델 컬렉션이 처리될 때는 [관계가 복원되지 않습니다](/docs/11.x/queues#handling-relationships).

<a name="adding-records"></a>

### 레코드 추가하기

모델에 `Laravel\Scout\Searchable` 트레이트를 추가했다면, 이제 모델 인스턴스를 `save` 또는 `create` 메서드로 저장하기만 하면 자동으로 검색 인덱스에 등록됩니다. Scout에서 [큐 사용](#queueing)을 설정한 경우, 이 작업은 큐 워커에 의해 백그라운드에서 처리됩니다.

```
use App\Models\Order;

$order = new Order;

// ...

$order->save();
```

<a name="adding-records-via-query"></a>
#### 쿼리를 통한 레코드 추가

Eloquent 쿼리를 통해 여러 모델을 검색 인덱스에 추가하고 싶다면, Eloquent 쿼리에 `searchable` 메서드를 체이닝하여 사용할 수 있습니다. `searchable` 메서드는 쿼리 결과를 [청크(chunk)](/docs/11.x/eloquent#chunking-results) 단위로 분할하여 검색 인덱스에 추가합니다. Scout에서 큐를 사용하도록 설정했다면, 모든 청크가 큐 워커에 의해 백그라운드에서 가져와집니다.

```
use App\Models\Order;

Order::where('price', '>', 100)->searchable();
```

또한, Eloquent 관계 인스턴스에서 `searchable` 메서드를 호출할 수도 있습니다.

```
$user->orders()->searchable();
```

또, 이미 메모리에 여러 Eloquent 모델 컬렉션을 가지고 있다면, 해당 컬렉션 인스턴스에서 `searchable` 메서드를 호출하여 각각 해당하는 인덱스에 모델 인스턴스를 추가할 수 있습니다.

```
$orders->searchable();
```

> [!NOTE]
> `searchable` 메서드는 "업서트(upsert)" 연산으로 볼 수 있습니다. 즉, 인덱스에 이미 모델 레코드가 있으면 업데이트하고, 없으면 인덱스에 새로 추가합니다.

<a name="updating-records"></a>
### 레코드 업데이트하기

검색 가능한 모델을 업데이트하려면, 모델 인스턴스의 속성만 변경한 뒤 모델을 데이터베이스에 `save` 하십시오. Scout가 변경 사항을 검색 인덱스에도 자동으로 반영합니다.

```
use App\Models\Order;

$order = Order::find(1);

// 주문 정보를 업데이트...

$order->save();
```

Eloquent 쿼리 인스턴스에서 `searchable` 메서드를 호출하면, 여러 모델을 한번에 업데이트할 수도 있습니다. 만약 인덱스에 해당 모델이 없다면 자동으로 생성됩니다.

```
Order::where('price', '>', 100)->searchable();
```

관계에 속하는 모든 모델의 검색 인덱스 레코드를 업데이트하고 싶다면, 관계 인스턴스에서 `searchable`을 호출하면 됩니다.

```
$user->orders()->searchable();
```

또, 이미 Eloquent 모델의 컬렉션이 메모리에 있을 경우, 컬렉션 인스턴스에서 `searchable`을 호출하여 해당 인덱스에 있는 모델들을 업데이트할 수 있습니다.

```
$orders->searchable();
```

<a name="modifying-records-before-importing"></a>
#### 임포트 전 레코드 수정

검색 인덱스로 보내기 전, 모델 컬렉션을 준비해야 하는 경우가 있을 수 있습니다. 예를 들어, 연관된 데이터를 미리 조회해서 인덱싱할 때 해당 데이터를 함께 추가하고 싶을 수 있습니다. 이를 위해 모델에 `makeSearchableUsing` 메서드를 정의하면 됩니다.

```
use Illuminate\Database\Eloquent\Collection;

/**
 * 검색 인덱싱 전 모델 컬렉션을 수정합니다.
 */
public function makeSearchableUsing(Collection $models): Collection
{
    return $models->load('author');
}
```

<a name="removing-records"></a>
### 레코드 삭제하기

인덱스에서 레코드를 제거하려면, 데이터베이스에서 모델을 `delete` 하면 됩니다. [소프트 삭제](/docs/11.x/eloquent#soft-deleting) 모델을 사용하는 경우에도 이 방법으로 동작합니다.

```
use App\Models\Order;

$order = Order::find(1);

$order->delete();
```

레코드를 삭제하기 전에 일일이 모델을 조회하지 않고 삭제하고 싶다면, Eloquent 쿼리 인스턴스에서 `unsearchable` 메서드를 사용할 수 있습니다.

```
Order::where('price', '>', 100)->unsearchable();
```

관계에 속한 모든 모델의 검색 인덱스 레코드를 삭제하려는 경우, 관계 인스턴스에서 `unsearchable` 메서드를 호출하면 됩니다.

```
$user->orders()->unsearchable();
```

이미 컬렉션에 보유 중인 Eloquent 모델들을 검색 인덱스에서 제거하고 싶다면, 컬렉션 인스턴스에서 `unsearchable` 메서드를 호출하면 됩니다.

```
$orders->unsearchable();
```

모델 레코드 전체를 해당 인덱스에서 제거하고 싶다면, `removeAllFromSearch` 메서드를 호출하면 됩니다.

```
Order::removeAllFromSearch();
```

<a name="pausing-indexing"></a>
### 인덱싱 일시 중지

특정 모델에 대해 일련의 Eloquent 작업을 하면서, 해당 데이터가 검색 인덱스와 동기화되는 것을 잠시 중지하고 싶을 때가 있습니다. 이럴 때는 `withoutSyncingToSearch` 메서드를 사용할 수 있습니다. 이 메서드는 하나의 클로저를 받아 즉시 실행하며, 클로저 안에서 일어난 모든 모델 작업은 인덱스에 동기화되지 않습니다.

```
use App\Models\Order;

Order::withoutSyncingToSearch(function () {
    // 모델 관련 작업 수행...
});
```

<a name="conditionally-searchable-model-instances"></a>
### 조건부로 인덱싱되는 모델 인스턴스

특정 조건에서만 모델이 검색 가능하도록 만들고 싶을 때가 있습니다. 예를 들어, `App\Models\Post` 모델이 "draft"와 "published" 두 가지 상태를 가질 수 있다고 합시다. 이 중 "published" 상태만 검색 가능하도록 하려면, 모델에 `shouldBeSearchable` 메서드를 정의하면 됩니다.

```
/**
 * 이 모델이 검색 가능한지 여부를 결정합니다.
 */
public function shouldBeSearchable(): bool
{
    return $this->isPublished();
}
```

`shouldBeSearchable` 메서드는 오직 `save`, `create` 메서드, 쿼리, 관계를 통해 모델을 다룰 때만 적용됩니다. 직접 모델 또는 컬렉션에서 `searchable` 메서드를 호출하면, `shouldBeSearchable` 메서드의 결과가 무시되므로 이 점에 유의해야 합니다.

> [!WARNING]
> `shouldBeSearchable` 메서드는 Scout의 "database" 엔진 사용 시에는 적용되지 않습니다. 데이터베이스 엔진을 사용할 때는 모든 검색 가능한 데이터가 항상 데이터베이스에 저장되기 때문입니다. 비슷한 동작을 원한다면 [where절](#where-clauses)을 활용하세요.

<a name="searching"></a>
## 검색하기

`search` 메서드를 사용하여 모델에 대해 검색을 시작할 수 있습니다. 이 메서드는 검색어 문자열 하나를 받아 해당 검색어로 모델을 조회합니다. 검색 쿼리에는 반드시 `get` 메서드를 체이닝하여, 조건에 맞는 Eloquent 모델 컬렉션을 가져올 수 있습니다.

```
use App\Models\Order;

$orders = Order::search('Star Trek')->get();
```

Scout를 이용한 검색은 Eloquent 모델 컬렉션을 반환하므로, 라우트나 컨트롤러에서 결과를 그대로 리턴하면 자동으로 JSON으로 변환됩니다.

```
use App\Models\Order;
use Illuminate\Http\Request;

Route::get('/search', function (Request $request) {
    return Order::search($request->search)->get();
});
```

Eloquent 모델로 변환되기 이전의 원본 검색 결과가 필요하다면, `raw` 메서드를 사용할 수 있습니다.

```
$orders = Order::search('Star Trek')->raw();
```

<a name="custom-indexes"></a>
#### 커스텀 인덱스 사용하기

검색 쿼리는 일반적으로 모델의 [`searchableAs`](#configuring-model-indexes) 메서드에서 지정된 인덱스에 대해 실행됩니다. 그러나, `within` 메서드를 사용해서 별도의 커스텀 인덱스를 지정해 검색할 수 있습니다.

```
$orders = Order::search('Star Trek')
    ->within('tv_shows_popularity_desc')
    ->get();
```

<a name="where-clauses"></a>
### Where 절(조건)

Scout에서는 검색 쿼리에서 간단한 "where" 조건을 추가할 수 있습니다. 현재는, 이 조건문에서 기본적인 숫자 값의 동일성만 지원하며, 주로 사용자 ID 등으로 결과를 한정할 때 가장 유용합니다.

```
use App\Models\Order;

$orders = Order::search('Star Trek')->where('user_id', 1)->get();
```

또한, `whereIn` 메서드를 활용해 특정 컬럼 값이 지정한 배열 안에 포함되는지 확인할 수 있습니다.

```
$orders = Order::search('Star Trek')->whereIn(
    'status', ['open', 'paid']
)->get();
```

`whereNotIn` 메서드는, 지정한 컬럼 값이 해당 배열에 포함되지 않는지 확인합니다.

```
$orders = Order::search('Star Trek')->whereNotIn(
    'status', ['closed']
)->get();
```

검색 인덱스는 관계형 데이터베이스가 아니기 때문에, 이보다 더 복잡한 "where" 조건은 현재 지원되지 않습니다.

> [!WARNING]
> 애플리케이션에서 Meilisearch를 사용한다면, 반드시 [필터링 속성](#configuring-filterable-data-for-meilisearch)을 먼저 설정해야 Scout의 "where" 조건을 사용할 수 있습니다.

<a name="pagination"></a>
### 페이지네이션

모델 컬렉션을 단순히 조회하는 것 뿐만 아니라, `paginate` 메서드로 검색 결과를 페이지네이션할 수 있습니다. 이 메서드는 [일반적인 Eloquent 쿼리 페이지네이션](/docs/11.x/pagination)과 동일하게 `Illuminate\Pagination\LengthAwarePaginator` 인스턴스를 반환합니다.

```
use App\Models\Order;

$orders = Order::search('Star Trek')->paginate();
```

한 페이지에서 가져올 모델 개수를 직접 지정하고 싶다면, `paginate` 메서드의 첫 번째 인수로 개수를 명시하면 됩니다.

```
$orders = Order::search('Star Trek')->paginate(15);
```

검색 결과를 Blade에서 일반 Eloquent 쿼리의 페이지네이션과 동일하게 결과와 페이지 링크로 렌더링할 수 있습니다.

```html
<div class="container">
    @foreach ($orders as $order)
        {{ $order->price }}
    @endforeach
</div>

{{ $orders->links() }}
```

또한, 페이지네이션 결과를 JSON으로 받고 싶다면, 라우트나 컨트롤러에서 페이지네이터 인스턴스를 그대로 반환하면 됩니다.

```
use App\Models\Order;
use Illuminate\Http\Request;

Route::get('/orders', function (Request $request) {
    return Order::search($request->input('query'))->paginate(15);
});
```

> [!WARNING]
> 검색 엔진은 Eloquent 모델의 글로벌 스코프를 인식하지 못하므로, Scout 페이지네이션을 사용하는 애플리케이션에서는 글로벌 스코프를 사용하지 말아야 합니다. 만약 사용한다면, Scout로 검색할 때 글로벌 스코프의 조건을 따로 재구현해야 합니다.

<a name="soft-deleting"></a>
### 소프트 삭제

인덱싱된 모델이 [소프트 삭제](/docs/11.x/eloquent#soft-deleting)를 사용하며, 소프트 삭제된 모델까지 같이 검색하고 싶다면, `config/scout.php` 설정 파일의 `soft_delete` 옵션을 `true`로 설정하세요.

```
'soft_delete' => true,
```

이 옵션이 `true`이면, Scout는 소프트 삭제된 모델을 검색 인덱스에서 제거하지 않고, 인덱싱된 레코드에 숨겨진 `__soft_deleted` 속성을 추가합니다. 그 후, 검색할 때 `withTrashed` 또는 `onlyTrashed` 메서드를 사용해 삭제된 레코드를 포함하거나, 삭제된 레코드만 가져올 수 있습니다.

```
use App\Models\Order;

// 조회 결과에 소프트 삭제된 레코드도 포함
$orders = Order::search('Star Trek')->withTrashed()->get();

// 오직 소프트 삭제된 레코드만 조회
$orders = Order::search('Star Trek')->onlyTrashed()->get();
```

> [!NOTE]
> 소프트 삭제된 모델을 `forceDelete`로 영구 삭제할 때 Scout가 자동으로 검색 인덱스에서 제거합니다.

<a name="customizing-engine-searches"></a>
### 엔진 검색 커스터마이징

엔진의 검색 동작을 세밀하게 제어해야 할 때는, `search` 메서드의 두 번째 인자로 클로저를 전달할 수 있습니다. 예를 들어, 이 콜백을 사용해 검색 쿼리가 Algolia로 전달되기 전에 위치 정보를 추가할 수 있습니다.

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

Scout가 검색 엔진에서 일치하는 Eloquent 모델의 주 키(primary key) 목록을 받아오면, 이를 바탕으로 다시 Eloquent가 전체 모델을 조회합니다. 이 과정에서 `query` 메서드를 사용해 쿼리를 커스터마이징할 수 있습니다. `query` 메서드는 클로저를 인자로 받아, 해당 클로저에서 Eloquent 쿼리 빌더 인스턴스를 사용할 수 있습니다.

```php
use App\Models\Order;
use Illuminate\Database\Eloquent\Builder;

$orders = Order::search('Star Trek')
    ->query(fn (Builder $query) => $query->with('invoices'))
    ->get();
```

이 콜백은 검색 엔진에서 관련 모델들의 주 키를 이미 가져온 이후에 호출되므로, 결과를 "필터"하려면 [Scout의 where 절](#where-clauses)을 사용해야 하며, `query`에서는 필터링 용도로 사용하지 않아야 합니다.

<a name="custom-engines"></a>
## 커스텀 엔진

<a name="writing-the-engine"></a>
#### 커스텀 엔진 구현하기

기본 제공되는 Scout 검색 엔진 중에서 원하는 동작 방식이 없다면, 직접 커스텀 엔진을 만들어 Scout에 등록할 수 있습니다. 커스텀 엔진은 `Laravel\Scout\Engines\Engine` 추상 클래스를 확장해야 하며, 이 클래스에는 아래와 같이 반드시 구현해야 할 8개 메서드가 있습니다.

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

각 메서드를 구체적으로 어떻게 구현하면 되는지 알고 싶다면, 먼저 `Laravel\Scout\Engines\AlgoliaEngine` 클래스의 구현을 참고해보는 것이 좋습니다. 이 클래스는 자신만의 엔진을 구현할 때 좋은 출발점이 되어줍니다.

<a name="registering-the-engine"></a>
#### 커스텀 엔진 등록하기

커스텀 엔진을 작성했다면, Scout 엔진 매니저의 `extend` 메서드를 사용해 등록할 수 있습니다. Scout 엔진 매니저는 라라벨 서비스 컨테이너에서 가져올 수 있습니다. 보통 이 작업은 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드나, 애플리케이션에서 사용하는 다른 서비스 프로바이더의 `boot` 메서드에서 처리하면 됩니다.

```
use App\ScoutExtensions\MySqlSearchEngine;
use Laravel\Scout\EngineManager;

/**
 * 애플리케이션 서비스 초기화 처리.
 */
public function boot(): void
{
    resolve(EngineManager::class)->extend('mysql', function () {
        return new MySqlSearchEngine;
    });
}
```

이렇게 엔진을 등록한 뒤에는, 애플리케이션의 `config/scout.php` 설정 파일에서 디폴트 Scout `driver`로 지정하면 됩니다.

```
'driver' => 'mysql',
```