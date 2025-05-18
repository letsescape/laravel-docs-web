# 라라벨 스카우트 (Laravel Scout)

- [소개](#introduction)
- [설치](#installation)
    - [드라이버 사전 준비 사항](#driver-prerequisites)
    - [큐잉(Queueing)](#queueing)
- [설정](#configuration)
    - [모델 인덱스 설정](#configuring-model-indexes)
    - [색인 데이터 설정](#configuring-searchable-data)
    - [모델 ID 설정](#configuring-the-model-id)
    - [모델별 검색 엔진 설정](#configuring-search-engines-per-model)
    - [사용자 식별](#identifying-users)
- [데이터베이스 / 컬렉션 엔진](#database-and-collection-engines)
    - [데이터베이스 엔진](#database-engine)
    - [컬렉션 엔진](#collection-engine)
- [색인화(Indexing)](#indexing)
    - [배치 임포트](#batch-import)
    - [레코드 추가](#adding-records)
    - [레코드 업데이트](#updating-records)
    - [레코드 제거](#removing-records)
    - [색인화 일시 중지](#pausing-indexing)
    - [조건부 색인 모델 인스턴스](#conditionally-searchable-model-instances)
- [검색](#searching)
    - [Where 절](#where-clauses)
    - [페이지네이션](#pagination)
    - [소프트 삭제](#soft-deleting)
    - [엔진 검색 사용자 정의](#customizing-engine-searches)
- [커스텀 엔진](#custom-engines)
- [빌더 매크로](#builder-macros)

<a name="introduction"></a>
## 소개

[Laravel Scout](https://github.com/laravel/scout)는 [Eloquent 모델](/docs/9.x/eloquent)에 전체 텍스트 검색 기능을 손쉽게 추가할 수 있도록 드라이버 기반의 간단한 솔루션을 제공합니다. 모델 옵저버를 활용하여, Scout는 Eloquent 레코드와 검색 인덱스를 항상 자동으로 동기화해줍니다.

현재 Scout는 [Algolia](https://www.algolia.com/), [MeiliSearch](https://www.meilisearch.com), 그리고 MySQL / PostgreSQL(`database`) 드라이버를 기본으로 제공합니다. 또한, 외부 의존성 없이 로컬 개발 환경에서 사용할 수 있는 "collection" 드라이버도 포함되어 있습니다. 만약 필요하다면, 커스텀 드라이버도 간편하게 구현하여 Scout 기능을 확장할 수 있습니다.

<a name="installation"></a>
## 설치

먼저 Composer 패키지 매니저를 사용하여 Scout를 설치합니다.

```shell
composer require laravel/scout
```

Scout 설치 후, `vendor:publish` 아티즌 명령어를 실행하여 Scout 설정 파일을 배포합니다. 이 명령어를 실행하면 `scout.php` 설정 파일이 애플리케이션의 `config` 디렉터리에 생성됩니다.

```shell
php artisan vendor:publish --provider="Laravel\Scout\ScoutServiceProvider"
```

마지막으로, 검색 가능한 모델에 `Laravel\Scout\Searchable` 트레이트를 추가합니다. 이 트레이트는 모델 옵저버를 등록하여, 해당 모델의 데이터가 자동으로 검색 드라이버와 동기화되도록 해줍니다.

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

<a name="driver-prerequisites"></a>
### 드라이버 사전 준비 사항

<a name="algolia"></a>
#### Algolia

Algolia 드라이버를 사용하려면 `config/scout.php` 파일에서 Algolia의 `id`와 `secret` 자격증명을 반드시 설정해야 합니다. 자격증명을 지정한 후, Composer로 Algolia PHP SDK도 설치해야 합니다.

```shell
composer require algolia/algoliasearch-client-php
```

<a name="meilisearch"></a>
#### MeiliSearch

[MeiliSearch](https://www.meilisearch.com)는 매우 빠른 오픈소스 검색 엔진입니다. 만약 로컬 환경에 MeiliSearch를 설치하는 방법을 잘 모른다면, [Laravel Sail](/docs/9.x/sail#meilisearch)(라라벨 공식 도커 개발 환경)을 사용할 수 있습니다.

MeiliSearch 드라이버를 사용할 때는 Composer로 MeiliSearch PHP SDK를 설치해야 합니다.

```shell
composer require meilisearch/meilisearch-php http-interop/http-factory-guzzle
```

그리고 `.env` 파일에 `SCOUT_DRIVER` 환경 변수와, MeiliSearch의 `host`, `key` 자격증명을 다음과 같이 추가합니다.

```ini
SCOUT_DRIVER=meilisearch
MEILISEARCH_HOST=http://127.0.0.1:7700
MEILISEARCH_KEY=masterKey
```

MeiliSearch에 대한 더 자세한 정보는 [MeiliSearch 공식 문서](https://docs.meilisearch.com/learn/getting_started/quick_start.html)를 참고하십시오.

또한, 사용하는 MeiliSearch 바이너리 버전에 호환되는 버전의 `meilisearch/meilisearch-php`를 설치했는지 반드시 [MeiliSearch의 바이너리 호환성 관련 문서](https://github.com/meilisearch/meilisearch-php#-compatibility-with-meilisearch)를 확인해야 합니다.

> [!WARNING]
> MeiliSearch를 사용하는 애플리케이션에서 Scout를 업그레이드할 때는 [MeiliSearch 서비스 자체의 추가적인 주요 변경사항](https://github.com/meilisearch/MeiliSearch/releases)을 반드시 확인해야 합니다.

<a name="queueing"></a>
### 큐잉(Queueing)

Scout를 사용하는 데 꼭 필요한 것은 아니지만, [큐 드라이버](/docs/9.x/queues) 설정을 강력히 권장합니다. 큐 워커를 실행하면 모델을 검색 인덱스에 동기화하는 작업을 큐에 담아, 애플리케이션의 웹 인터페이스에서 훨씬 빠른 응답 속도를 얻을 수 있습니다.

큐 드라이버 설정 후에는, `config/scout.php` 파일에서 `queue` 옵션 값을 `true`로 지정합니다.

```
'queue' => true,
```

`queue` 옵션을 `false`로 설정해도, Algolia나 Meilisearch와 같은 일부 Scout 드라이버는 항상 비동기식으로 인덱싱을 수행함을 기억해야 합니다. 즉, 라라벨 애플리케이션에서는 인덱싱 작업이 완료된 후에도 실제 검색 엔진에서는 변경 내용이 바로 반영되지 않을 수 있습니다.

Scout 작업이 사용하는 연결 및 큐를 지정하려면, `queue` 옵션을 배열 형태로 설정할 수도 있습니다.

```
'queue' => [
    'connection' => 'redis',
    'queue' => 'scout'
],
```

<a name="configuration"></a>
## 설정

<a name="configuring-model-indexes"></a>
### 모델 인덱스 설정

각 Eloquent 모델은 특정 검색 "인덱스"와 연동되어, 해당 모델의 모든 검색 가능한 레코드가 이 인덱스에 저장됩니다. 즉, 각 인덱스는 MySQL의 테이블처럼 생각할 수 있습니다. 기본적으로 각 모델은 모델의 "테이블" 이름과 같은 이름의 인덱스에 저장됩니다. 보통 모델 이름의 복수형 형태입니다. 하지만 필요에 따라 모델의 `searchableAs` 메서드를 오버라이드해서 인덱스 이름을 원하는 대로 지정할 수 있습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class Post extends Model
{
    use Searchable;

    /**
     * 모델에 연결된 인덱스의 이름을 반환합니다.
     *
     * @return string
     */
    public function searchableAs()
    {
        return 'posts_index';
    }
}
```

<a name="configuring-searchable-data"></a>
### 색인 데이터 설정

기본적으로, 모델의 `toArray` 형태 전체가 검색 인덱스에 저장됩니다. 만약 동기화할 데이터를 원하는 대로 제어하고 싶다면, 모델에서 `toSearchableArray` 메서드를 오버라이드할 수 있습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class Post extends Model
{
    use Searchable;

    /**
     * 이 모델을 색인화할 데이터 배열을 반환합니다.
     *
     * @return array
     */
    public function toSearchableArray()
    {
        $array = $this->toArray();

        // 데이터 배열을 커스터마이즈하세요...

        return $array;
    }
}
```

MeiliSearch와 같은 일부 검색 엔진은 데이터 타입에 따라(`>`, `<` 등) 필터 연산이 가능한 데이터에 제한을 둡니다. 따라서 이러한 검색 엔진에서 데이터를 커스터마이즈할 경우, 숫자 값은 올바른 타입으로 캐스팅해야 합니다.

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
#### 필터 가능한 데이터 및 인덱스 설정(MeiliSearch)

Scout의 다른 드라이버와 달리, MeiliSearch는 필터링 가능한 속성(filterable attribute), 정렬 가능 속성(sortable attribute), 그리고 [기타 지원 옵션 필드들](https://docs.meilisearch.com/reference/api/settings.html)을 반드시 사전에 인덱스 설정으로 정의해야 합니다.

필터링 가능한 속성은 Scout의 `where` 메서드를 사용할 때 필터링할 속성이며, 정렬 가능한 속성은 `orderBy` 메서드로 정렬할 때 참조되는 속성입니다. 인덱스 설정은 애플리케이션의 `scout` 설정 파일의 `meilisearch` 구성 항목 아래 `index-settings` 부분에서 정의하면 됩니다.

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
            // 그 외 설정 필드...
        ],
        Flight::class => [
            'filterableAttributes'=> ['id', 'destination'],
            'sortableAttributes' => ['updated_at'],
        ],
    ],
],
```

지정한 인덱스에 연결된 모델에 소프트 삭제가 적용되어 있고, 해당 모델이 `index-settings` 배열에 포함되어 있다면, Scout는 해당 인덱스에 소프트 삭제 모델 필터링도 자동으로 지원합니다. 소프트 삭제만 적용하고 별도의 필터/정렬 속성을 지정하지 않으려면, 아래와 같이 빈 항목으로 추가할 수 있습니다.

```php
'index-settings' => [
    Flight::class => []
],
```

설정을 마친 후에는 반드시 `scout:sync-index-settings` 아티즌 명령어를 실행해야 합니다. 이 명령어를 통해 MeiliSearch에 현재 설정된 인덱스 옵션이 전달됩니다. 편의상 이 명령어를 배포(deployment) 프로세스에 포함시킬 것을 권장합니다.

```shell
php artisan scout:sync-index-settings
```

<a name="configuring-the-model-id"></a>
### 모델 ID 설정

Scout는 기본적으로 모델의 기본 키(primary key)를 검색 인덱스에 저장할 모델의 고유 ID/키로 사용합니다. 만약 이 동작을 변경하고 싶다면, 모델에서 `getScoutKey` 및 `getScoutKeyName` 메서드를 오버라이드하면 됩니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class User extends Model
{
    use Searchable;

    /**
     * 인덱스에 사용할 값 반환.
     *
     * @return mixed
     */
    public function getScoutKey()
    {
        return $this->email;
    }

    /**
     * 인덱스에 사용할 키 이름 반환.
     *
     * @return mixed
     */
    public function getScoutKeyName()
    {
        return 'email';
    }
}
```

<a name="configuring-search-engines-per-model"></a>
### 모델별 검색 엔진 설정

검색 시 Scout는 보통 애플리케이션의 `scout` 설정 파일에서 지정한 기본 검색 엔진을 사용합니다. 그러나 특정 모델에 대해 사용할 검색 엔진을 바꾸고 싶다면, 모델의 `searchableUsing` 메서드를 오버라이드할 수 있습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\EngineManager;
use Laravel\Scout\Searchable;

class User extends Model
{
    use Searchable;

    /**
     * 이 모델을 색인화할 때 사용할 엔진 인스턴스 반환.
     *
     * @return \Laravel\Scout\Engines\Engine
     */
    public function searchableUsing()
    {
        return app(EngineManager::class)->engine('meilisearch');
    }
}
```

<a name="identifying-users"></a>
### 사용자 식별

Scout에서는 [Algolia](https://algolia.com) 사용 시, 검색 작업과 인증된 사용자를 자동으로 연결하여 분석할 수 있습니다. 이 기능을 활성화하면 Algolia의 대시보드에서 검색 분석 시 인증 유저 정보를 참고할 수 있습니다. `.env` 파일에 `SCOUT_IDENTIFY` 환경 변수를 `true`로 지정하면 사용 가능합니다.

```ini
SCOUT_IDENTIFY=true
```

이 기능이 활성화되면 요청의 IP 주소와 인증된 사용자의 고유 식별자가 Algolia로 전송되어, 해당 사용자가 검색할 때마다 이 데이터가 참조됩니다.

<a name="database-and-collection-engines"></a>
## 데이터베이스 / 컬렉션 엔진

<a name="database-engine"></a>
### 데이터베이스 엔진

> [!WARNING]
> 데이터베이스 엔진은 현재 MySQL 및 PostgreSQL만 지원합니다.

애플리케이션에서 소규모~중간 규모 데이터베이스를 사용하거나, 부하가 적은 경우에는 Scout의 "database" 엔진을 쉽게 시작점으로 사용할 수 있습니다. 데이터베이스 엔진은 "where like" 조건과 전체 텍스트 인덱스를 활용하여 기존 데이터베이스에서 쿼리 결과를 필터링한 후, 해당 검색 결과를 반환합니다.

데이터베이스 엔진을 사용하려면, `.env` 파일에서 `SCOUT_DRIVER` 환경 변수를 `database`로 지정하거나, 애플리케이션의 `scout` 설정 파일에서 드라이버를 직접 지정하면 됩니다.

```ini
SCOUT_DRIVER=database
```

데이터베이스 엔진을 기본 드라이버로 지정하면, [색인 데이터 설정](#configuring-searchable-data)을 완료한 뒤 [검색 쿼리 실행](#searching)이 가능합니다. Algolia나 MeiliSearch와 달리, 인덱스 구축이 별도로 필요하지 않습니다.

#### 데이터베이스 검색 전략 커스터마이징

기본적으로 데이터베이스 엔진은 [색인 데이터로 지정한](#configuring-searchable-data) 모든 속성에 대해 "where like" 쿼리를 실행합니다. 하지만 이 방식은 상황에 따라 성능 저하를 유발할 수 있습니다. 따라서 특정 컬럼은 전체 텍스트 검색을, 또 어떤 컬럼은 문자열 접두어로만 "where like" 제한을 적용하도록 전략을 지정할 수 있습니다(예: `example%`로 접두어 검색, `%example%`처럼 전체 문자열 내부 검색 대상 아님).

이 동작은 모델의 `toSearchableArray` 메서드에 PHP attributes를 추가해서 정의할 수 있습니다. 별도 전략이 할당되지 않은 컬럼은 기본 "where like" 전략을 사용합니다.

```php
use Laravel\Scout\Attributes\SearchUsingFullText;
use Laravel\Scout\Attributes\SearchUsingPrefix;

/**
 * 이 모델을 색인화할 데이터 배열 반환.
 *
 * @return array
 */
#[SearchUsingPrefix(['id', 'email'])]
#[SearchUsingFullText(['bio'])]
public function toSearchableArray()
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
> 컬럼에 전체 텍스트 쿼리 제약을 지정하려면, 반드시 해당 컬럼이 [Full Text 인덱스](/docs/9.x/migrations#available-index-types)를 보유하고 있어야 합니다.

<a name="collection-engine"></a>
### 컬렉션 엔진

로컬 개발 환경에서 Algolia나 MeiliSearch를 사용해도 되지만, "collection" 엔진을 사용하는 편이 더 간편할 수 있습니다. 컬렉션 엔진은 기존 데이터베이스에서 결과를 조회한 다음, "where" 절 및 컬렉션 필터링을 이용해 검색 결과를 결정합니다. 이 엔진을 사용할 때는 별도로 검색 인덱싱을 수행할 필요 없이, 검색 가능한 모델이 로컬 데이터베이스에서 바로 조회됩니다.

컬렉션 엔진을 사용하려면, `.env` 파일의 `SCOUT_DRIVER` 값을 `collection`으로 지정하거나, `scout` 설정 파일에서 드라이버를 직접 지정합니다.

```ini
SCOUT_DRIVER=collection
```

컬렉션 드라이버를 선택 후에는, [검색 쿼리 실행](#searching)이 가능합니다. 이 엔진은 Algolia/MeiliSearch와 달리 별도의 인덱싱 작업이 필요하지 않습니다.

#### 데이터베이스 엔진과의 차이점

겉보기에 "database"와 "collection" 두 엔진은 비슷해 보이지만, 중요한 차이점이 있습니다. 둘 다 DB에서 직접 데이터를 조회하긴 하지만, 컬렉션 엔진은 전체 텍스트 인덱스나 `LIKE` 조건을 활용하지 않고, 가능한 모든 레코드를 조회한 후 라라벨의 `Str::is` 헬퍼를 이용해 검색 문자열이 모델 속성 값에 포함되는지 판별합니다.

컬렉션 엔진은 SQLite, SQL Server 등 라라벨이 지원하는 모든 관계형 DB에서 동작하기 때문에 가장 이식성이 높지만, 성능 면에서는 database 엔진보다 비효율적입니다.

<a name="indexing"></a>
## 색인화(Indexing)

<a name="batch-import"></a>
### 배치 임포트

기존 프로젝트에 Scout를 도입했다면, 이미 생성된 DB 레코드를 인덱스에 가져올 필요가 있을 수 있습니다. 이때는 `scout:import` 아티즌 명령어를 사용해 모든 기존 레코드를 검색 인덱스에 임포트할 수 있습니다.

```shell
php artisan scout:import "App\Models\Post"
```

모델의 모든 레코드를 검색 인덱스에서 제거하려면, `flush` 명령어를 사용합니다.

```shell
php artisan scout:flush "App\Models\Post"
```

<a name="modifying-the-import-query"></a>
#### 임포트 쿼리 커스터마이징

배치 임포트 시 모든 모델을 가져오는 쿼리를 수정하고 싶다면, 모델에 `makeAllSearchableUsing` 메서드를 정의할 수 있습니다. 예를 들어, 모델 임포트 이전에 관련된 연관관계를 eager 로딩하려는 경우에 적합합니다.

```
/**
 * 모든 모델을 검색 가능한 상태로 만들 때 사용하는 쿼리 커스터마이즈.
 *
 * @param  \Illuminate\Database\Eloquent\Builder  $query
 * @return \Illuminate\Database\Eloquent\Builder
 */
protected function makeAllSearchableUsing($query)
{
    return $query->with('author');
}
```

<a name="adding-records"></a>
### 레코드 추가

모델에 `Laravel\Scout\Searchable` 트레이트를 추가한 뒤에는, 단순히 모델 인스턴스를 `save` 또는 `create` 하면 자동으로 검색 인덱스에 추가됩니다. 만약 [큐를 사용하도록 Scout를 설정](#queueing)했다면, 이 작업은 큐 워커가 백그라운드에서 처리하게 됩니다.

```
use App\Models\Order;

$order = new Order;

// ...

$order->save();
```

<a name="adding-records-via-query"></a>
#### 쿼리를 통한 레코드 추가

Eloquent 쿼리로 모델 컬렉션을 검색 인덱스에 추가하고 싶으면, `searchable` 메서드를 쿼리에 체이닝해서 사용할 수 있습니다. `searchable` 메서드는 해당 쿼리 결과를 [청크 단위](/docs/9.x/eloquent#chunking-results)로 나누어 인덱스에 추가합니다. 역시 큐를 사용하도록 설정했다면, 모든 청크가 큐 워커에 의해 백그라운드에서 처리됩니다.

```
use App\Models\Order;

Order::where('price', '>', 100)->searchable();
```

또한 Eloquent 연관관계 인스턴스에서 바로 `searchable`을 호출할 수도 있습니다.

```
$user->orders()->searchable();
```

이미 메모리에 컬렉션(Eloquent 모델 컬렉션)이 있다면, 컬렉션 인스턴스에서 `searchable`을 호출하여 각 모델을 인덱스에 추가할 수 있습니다.

```
$orders->searchable();
```

> [!NOTE]
> `searchable` 메서드는 "upsert" 작업으로 볼 수 있습니다. 즉, 인덱스에 이미 모델 레코드가 있으면 업데이트되고, 없으면 새로 추가됩니다.

<a name="updating-records"></a>
### 레코드 업데이트

검색 가능한 모델을 업데이트하려면, 모델 인스턴스의 속성 값을 변경한 뒤 `save` 하면 됩니다. Scout가 자동으로 변경 내용을 검색 인덱스에도 반영해줍니다.

```
use App\Models\Order;

$order = Order::find(1);

// 주문 정보 수정...

$order->save();
```

또는, Eloquent 쿼리 인스턴스에서 `searchable`을 호출하여 여러 모델을 일괄 업데이트할 수 있습니다. 인덱스에 해당 모델이 없으면 새로 추가됩니다.

```
Order::where('price', '>', 100)->searchable();
```

연관관계 전체에 대해 검색 인덱스를 업데이트하려면, 연관관계 인스턴스에서 `searchable`을 호출하면 됩니다.

```
$user->orders()->searchable();
```

또는 컬렉션(Eloquent 모델 컬렉션)이 메모리에 있다면, 컬렉션에서 `searchable`을 호출해 인덱스를 업데이트할 수 있습니다.

```
$orders->searchable();
```

<a name="removing-records"></a>
### 레코드 제거

인덱스에서 레코드를 제거하려면, 데이터베이스에서 해당 모델을 `delete` 하면 됩니다. [소프트 삭제](/docs/9.x/eloquent#soft-deleting) 모델도 동일하게 동작합니다.

```
use App\Models\Order;

$order = Order::find(1);

$order->delete();
```

레코드를 먼저 조회하지 않고 바로 삭제하고 싶다면, Eloquent 쿼리에서 `unsearchable` 메서드를 사용할 수 있습니다.

```
Order::where('price', '>', 100)->unsearchable();
```

연관관계 전체에 대해 검색 인덱스에서 레코드를 제거하려면, 연관관계 인스턴스에서 `unsearchable`을 호출합니다.

```
$user->orders()->unsearchable();
```

또는 컬렉션이 메모리에 있다면, 컬렉션에서 `unsearchable`을 호출하여 해당 모델 인스턴스들을 인덱스에서 제거할 수 있습니다.

```
$orders->unsearchable();
```

<a name="pausing-indexing"></a>
### 색인화 일시 중지

때로는 한 번에 여러 Eloquent 작업을 수행하되, 이 작업들이 일시적으로 검색 인덱스와 동기화되지 않도록 하고 싶을 수 있습니다. 이럴 때는 `withoutSyncingToSearch` 메서드를 사용하면 됩니다. 이 메서드는 하나의 클로저를 인자로 받고, 해당 클로저 안에서 일어난 모든 모델 작업은 인덱스로 동기화되지 않습니다.

```
use App\Models\Order;

Order::withoutSyncingToSearch(function () {
    // 모델 작업 수행...
});
```

<a name="conditionally-searchable-model-instances"></a>
### 조건부 색인 모델 인스턴스

모델이 특정 조건을 만족할 때만 검색 인덱스에 포함되도록 제어하고 싶을 때가 있습니다. 예를 들어, `App\Models\Post` 모델이 "draft" 또는 "published" 상태일 수 있다고 가정해 보겠습니다. "published" 상태인 포스트만 검색 가능하게 하려면, 모델에 `shouldBeSearchable` 메서드를 정의하면 됩니다.

```
/**
 * 이 모델이 검색 가능해야 하는지 여부 반환.
 *
 * @return bool
 */
public function shouldBeSearchable()
{
    return $this->isPublished();
}
```

`shouldBeSearchable` 메서드는 `save`, `create` 메서드, 쿼리, 또는 연관관계를 통한 모델 조작 시에만 적용됩니다. 컬렉션이나 모델을 직접 `searchable`로 만들면 이 결과가 무시됩니다.

> [!WARNING]
> `shouldBeSearchable` 메서드는 Scout의 "database" 엔진에서는 적용되지 않습니다. "database" 엔진에서는 모든 검색 가능 데이터가 DB에 저장되기 때문입니다. database 엔진에서 유사한 기능이 필요하다면 [where 절](#where-clauses)을 사용해야 합니다.

<a name="searching"></a>
## 검색

모델을 검색하려면 `search` 메서드를 사용합니다. 이 메서드는 검색어를 인자로 받아 모델을 검색합니다. 이후 `get` 메서드를 체이닝하여, 해당 쿼리에 매칭되는 Eloquent 모델들을 조회합니다.

```
use App\Models\Order;

$orders = Order::search('Star Trek')->get();
```

Scout의 검색 결과는 Eloquent 모델 컬렉션으로 반환되므로, 라우트나 컨트롤러에서 결과를 그대로 리턴하면 자동으로 JSON 형태로 변환됩니다.

```
use App\Models\Order;
use Illuminate\Http\Request;

Route::get('/search', function (Request $request) {
    return Order::search($request->search)->get();
});
```

Eloquent 모델로 변환되기 전의 원시 검색 결과를 직접 받고 싶다면 `raw` 메서드를 사용할 수 있습니다.

```
$orders = Order::search('Star Trek')->raw();
```

<a name="custom-indexes"></a>
#### 커스텀 인덱스

검색 쿼리는 보통 모델의 [`searchableAs`](#configuring-model-indexes) 메서드에서 지정한 인덱스에서 수행됩니다. 하지만 `within` 메서드를 사용하면 특정 커스텀 인덱스에서 검색할 수 있습니다.

```
$orders = Order::search('Star Trek')
    ->within('tv_shows_popularity_desc')
    ->get();
```

<a name="where-clauses"></a>
### Where 절

Scout는 검색 쿼리에 간단한 "where" 절을 추가할 수 있는 기능을 제공합니다. 현재 이 where 절은 기본적인 숫자형 동등(equal) 연산만 지원하며, 보통 소유자 ID 등으로 범위를 제한할 때 활용합니다.

```
use App\Models\Order;

$orders = Order::search('Star Trek')->where('user_id', 1)->get();
```

`whereIn` 메서드를 사용하면 주어진 값 집합에 매칭되는 결과만 검색할 수 있습니다.

```
$orders = Order::search('Star Trek')->whereIn(
    'status', ['paid', 'open']
)->get();
```

검색 인덱스는 관계형 DB가 아니기 때문에, 복잡한 조건의 where 절은 사용할 수 없습니다.

> [!WARNING]
> 애플리케이션에서 MeiliSearch를 사용 중이라면, 반드시 Scout의 "where" 절을 사용하기 전에 [필터링 가능한 속성](#configuring-filterable-data-for-meilisearch) 설정을 완료해야 합니다.

<a name="pagination"></a>
### 페이지네이션

컬렉션을 단순 조회하는 대신, `paginate` 메서드를 사용해 검색 결과를 페이지네이션할 수 있습니다. 이 메서드는 [전통적인 Eloquent 쿼리 페이지네이션](/docs/9.x/pagination)과 동일하게 `Illuminate\Pagination\LengthAwarePaginator` 인스턴스를 반환합니다.

```
use App\Models\Order;

$orders = Order::search('Star Trek')->paginate();
```

한 페이지에 가져올 모델 수를 지정하려면 `paginate` 메서드의 첫 번째 인자로 개수를 넘겨줍니다.

```
$orders = Order::search('Star Trek')->paginate(15);
```

검색 결과를 받아 [Blade](/docs/9.x/blade) 템플릿에서 페이지네이션 링크까지 기존 Eloquent 쿼리와 동일하게 사용할 수 있습니다.

```html
<div class="container">
    @foreach ($orders as $order)
        {{ $order->price }}
    @endforeach
</div>

{{ $orders->links() }}
```

물론, 페이지네이션 결과를 JSON으로 반환하고 싶다면 라우트나 컨트롤러에서 paginator 인스턴스를 그대로 반환하면 됩니다.

```
use App\Models\Order;
use Illuminate\Http\Request;

Route::get('/orders', function (Request $request) {
    return Order::search($request->input('query'))->paginate(15);
});
```

> [!WARNING]
> 검색 엔진은 Eloquent 모델의 글로벌 스코프 정의를 알지 못하므로, Scout의 페이지네이션 기능을 사용하는 앱에서는 글로벌 스코프 사용을 피해야 합니다. 또는 검색 시 Scout에서도 동일하게 스코프 제약조건을 재구현해야 합니다.

<a name="soft-deleting"></a>
### 소프트 삭제

색인화된 모델에 [소프트 삭제](/docs/9.x/eloquent#soft-deleting)를 적용했고, 이 소프트 삭제 모델까지 검색하고 싶다면 `config/scout.php` 파일의 `soft_delete` 옵션을 `true`로 설정하면 됩니다.

```
'soft_delete' => true,
```

이 옵션이 `true`일 경우, Scout는 소프트 삭제 모델을 인덱스에서 제거하지 않고, 색인 레코드에 숨겨진 `__soft_deleted` 속성을 설정합니다. 그 다음, 검색 시 `withTrashed` 또는 `onlyTrashed` 메서드를 사용하여 소프트 삭제된 레코드도 함께 가져오거나, 소프트 삭제 레코드만 조회할 수 있습니다.

```
use App\Models\Order;

// 삭제된 레코드를 포함하여 조회
$orders = Order::search('Star Trek')->withTrashed()->get();

// 삭제된 레코드만 조회
$orders = Order::search('Star Trek')->onlyTrashed()->get();
```

> [!NOTE]
> 소프트 삭제 모델을 `forceDelete`로 완전 삭제하면, Scout가 인덱스에서 해당 레코드를 자동으로 제거합니다.

<a name="customizing-engine-searches"></a>
### 엔진 검색 사용자 정의

검색 엔진에서 더욱 고급 검색 동작을 구현하고 싶을 때는, `search` 메서드의 두 번째 인자로 클로저(callback)를 넘길 수 있습니다. 예를 들어, 이 콜백에서 검색 쿼리가 Algolia로 전달되기 전에 지리정보 데이터(geo-location data)를 검색 옵션에 추가할 수도 있습니다.

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
#### Eloquent 결과 쿼리 사용자 지정

Scout가 검색 엔진으로부터 일치하는 Eloquent 기본 키 목록을 받아오면, Eloquent를 통해 실제 모델을 조회합니다. 이 쿼리를 커스터마이즈하려면 `query` 메서드를 사용할 수 있으며, 이 메서드는 쿼리 빌더 인스턴스를 인자로 받는 클로저를 전달받습니다.

```php
use App\Models\Order;

$orders = Order::search('Star Trek')
    ->query(fn ($query) => $query->with('invoices'))
    ->get();
```

이 콜백은 검색 엔진에서 모델 목록을 이미 받은 후 호출되므로, 결과를 "필터링" 용도로는 사용하지 않고 [Scout의 where 절](#where-clauses)을 활용하는 것이 좋습니다.

<a name="custom-engines"></a>
## 커스텀 엔진

<a name="writing-the-engine"></a>
#### 엔진 구현하기

기본 제공되는 Scout의 검색 엔진 외에, 직접 커스텀 엔진을 구현하여 등록할 수도 있습니다. 커스텀 엔진은 `Laravel\Scout\Engines\Engine` 추상 클래스를 상속해야 하며, 다음 8가지 메서드를 반드시 구현해야 합니다.

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

이 메서드 각각의 구현 방법은 `Laravel\Scout\Engines\AlgoliaEngine` 클래스를 참고하면 이해에 도움이 됩니다. 각 메서드를 새로운 엔진에서 어떻게 구현하는지 예시로 삼을 수 있습니다.

<a name="registering-the-engine"></a>
#### 엔진 등록하기

커스텀 엔진을 구현했다면, Scout 엔진 매니저의 `extend` 메서드를 사용해서 등록하면 됩니다. Scout 엔진 매니저는 라라벨 서비스 컨테이너에서 해결할 수 있습니다. 이 메서드는 보통 `App\Providers\AppServiceProvider`의 `boot` 메서드나, 기타 서비스 프로바이더에서 호출할 수 있습니다.

```
use App\ScoutExtensions\MySqlSearchEngine
use Laravel\Scout\EngineManager;

/**
 * 애플리케이션 서비스 부트스트랩.
 *
 * @return void
 */
public function boot()
{
    resolve(EngineManager::class)->extend('mysql', function () {
        return new MySqlSearchEngine;
    });
}
```

등록이 끝나면, 애플리케이션의 `config/scout.php` 설정 파일에서 기본 Scout `driver`를 해당 이름으로 지정하면 됩니다.

```
'driver' => 'mysql',
```

<a name="builder-macros"></a>
## 빌더 매크로

Scout의 검색 빌더에 커스텀 메서드를 정의하고 싶을 때는, `Laravel\Scout\Builder` 클래스의 `macro` 메서드를 사용할 수 있습니다. 보통 이런 "매크로"는 [서비스 프로바이더](/docs/9.x/providers)의 `boot` 메서드 안에서 정의합니다.

```
use Illuminate\Support\Facades\Response;
use Illuminate\Support\ServiceProvider;
use Laravel\Scout\Builder;

/**
 * 애플리케이션 서비스 부트스트랩.
 *
 * @return void
 */
public function boot()
{
    Builder::macro('count', function () {
        return $this->engine()->getTotalCount(
            $this->engine()->search($this)
        );
    });
}
```

`macro` 함수는 첫 번째 인자로 매크로 이름, 두 번째 인자로 클로저를 받습니다. 정의된 매크로 이름을 `Laravel\Scout\Builder` 인스턴스에서 호출하면 해당 클로저가 실행됩니다.

```
use App\Models\Order;

Order::search('Star Trek')->count();
```
