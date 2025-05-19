# 라라벨 스카우트 (Laravel Scout)

- [소개](#introduction)
- [설치](#installation)
    - [드라이버 사전 준비 사항](#driver-prerequisites)
    - [큐(Queue) 사용](#queueing)
- [설정](#configuration)
    - [모델 인덱스 설정](#configuring-model-indexes)
    - [검색 대상 데이터 설정](#configuring-searchable-data)
    - [모델 ID 설정](#configuring-the-model-id)
    - [사용자 식별](#identifying-users)
- [로컬 개발 환경](#local-development)
- [인덱싱](#indexing)
    - [일괄(Batch) 임포트](#batch-import)
    - [레코드 추가](#adding-records)
    - [레코드 업데이트](#updating-records)
    - [레코드 제거](#removing-records)
    - [인덱싱 일시 중지](#pausing-indexing)
    - [조건부로 검색 가능한 모델 인스턴스](#conditionally-searchable-model-instances)
- [검색](#searching)
    - [Where 조건절](#where-clauses)
    - [페이지네이션(Pagination)](#pagination)
    - [소프트 삭제(Soft Deleting)](#soft-deleting)
    - [엔진 검색 커스터마이징](#customizing-engine-searches)
- [커스텀 엔진](#custom-engines)
- [빌더 매크로](#builder-macros)

<a name="introduction"></a>
## 소개

[Laravel Scout](https://github.com/laravel/scout)는 [Eloquent 모델](/docs/8.x/eloquent)에 전체 텍스트 검색 기능을 쉽게 추가할 수 있도록 드라이버 기반의 간단한 솔루션을 제공합니다. Scout는 모델 옵저버를 활용하여, Eloquent 레코드와 검색 인덱스가 자동으로 동기화되도록 해줍니다.

현재 Scout는 [Algolia](https://www.algolia.com/)와 [MeiliSearch](https://www.meilisearch.com) 드라이버를 기본으로 제공합니다. 또한, 외부 의존성이나 써드파티 서비스 없이 로컬 개발에 사용할 수 있도록 설계된 "콜렉션(collection)" 드라이버도 포함되어 있습니다. 추가로, 직접 커스텀 드라이버를 작성하는 작업도 간단하므로, 여러분만의 검색 구현으로 Scout를 확장할 수 있습니다.

<a name="installation"></a>
## 설치

먼저, Composer 패키지 매니저를 통해 Scout를 설치합니다.

```
composer require laravel/scout
```

Scout 설치 후, `vendor:publish` Artisan 명령어를 사용해 Scout 설정 파일을 배포해야 합니다. 이 명령어를 실행하면 `scout.php` 설정 파일이 애플리케이션의 `config` 디렉토리에 생성됩니다.

```
php artisan vendor:publish --provider="Laravel\Scout\ScoutServiceProvider"
```

마지막으로, 검색 가능한 모델에 `Laravel\Scout\Searchable` 트레이트(trait)를 추가합니다. 이 트레이트는 모델 옵저버를 등록하여, 해당 모델이 자동으로 검색 드라이버와 동기화되도록 만들어줍니다.

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

Algolia 드라이버를 사용할 경우, 우선 `config/scout.php` 설정 파일에서 Algolia의 `id`와 `secret` 자격 증명을 설정해야 합니다. 자격 증명을 모두 입력한 뒤, Composer를 통해 Algolia PHP SDK도 설치해야 합니다.

```
composer require algolia/algoliasearch-client-php
```

<a name="meilisearch"></a>
#### MeiliSearch

[MeiliSearch](https://www.meilisearch.com)는 매우 빠른 오픈 소스 검색 엔진입니다. 아직 로컬 환경에 MeiliSearch를 설치하는 방법을 잘 모른다면, 라라벨에서 공식적으로 지원하는 Docker 개발 환경인 [Laravel Sail](/docs/8.x/sail#meilisearch)을 활용할 수 있습니다.

MeiliSearch 드라이버를 사용할 경우, Composer로 MeiliSearch PHP SDK를 설치해야 합니다.

```
composer require meilisearch/meilisearch-php http-interop/http-factory-guzzle
```

그리고 애플리케이션의 `.env` 파일에 `SCOUT_DRIVER` 환경 변수와 MeiliSearch의 `host`, `key` 자격 증명을 다음과 같이 설정합니다.

```
SCOUT_DRIVER=meilisearch
MEILISEARCH_HOST=http://127.0.0.1:7700
MEILISEARCH_KEY=masterKey
```

MeiliSearch에 대한 자세한 내용은 [MeiliSearch 공식 문서](https://docs.meilisearch.com/learn/getting_started/quick_start.html)를 참고하시기 바랍니다.

또한, 설치하는 `meilisearch/meilisearch-php` 패키지의 버전이 현재 사용하는 MeiliSearch 바이너리 버전과 호환되는지 반드시 [공식 호환성 문서](https://github.com/meilisearch/meilisearch-php#-compatibility-with-meilisearch)를 확인해야 합니다.

> [!NOTE]
> MeiliSearch를 사용하는 애플리케이션에서 Scout를 업그레이드할 때는, 반드시 MeiliSearch 서비스 자체에 [추가로 생긴 Breaking Change](https://github.com/meilisearch/MeiliSearch/releases)가 있는지 확인하시기 바랍니다.

<a name="queueing"></a>
### 큐(Queue) 사용

Scout를 반드시 큐와 함께 사용해야 하는 것은 아니지만, [큐 드라이버](/docs/8.x/queues)를 별도로 설정하는 것을 강력히 권장합니다. 큐 워커를 실행하면, 모델 정보와 검색 인덱스 동기화 작업이 큐를 통해 처리되어, 애플리케이션의 웹 인터페이스 반응 속도가 훨씬 더 좋아집니다.

큐 드라이버를 설정했다면, `config/scout.php` 파일에서 `queue` 옵션 값을 `true`로 변경합니다.

```
'queue' => true,
```

<a name="configuration"></a>
## 설정

<a name="configuring-model-indexes"></a>
### 모델 인덱스 설정

각 Eloquent 모델은 특정 검색 "인덱스(index)"와 동기화됩니다. 이 인덱스에는 해당 모델의 모든 검색 가능한 레코드들이 저장됩니다. 각 인덱스는 MySQL의 테이블과 유사하게 생각할 수 있습니다. 기본적으로, 각 모델은 모델의 일반적인 테이블명과 같은 이름의 인덱스에 저장됩니다. 보통 모델 이름의 복수형이 사용되지만, 모델에서 `searchableAs` 메서드를 오버라이드하여 인덱스명을 자유롭게 지정할 수 있습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class Post extends Model
{
    use Searchable;

    /**
     * 모델과 연결된 인덱스명을 반환합니다.
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
### 검색 대상 데이터 설정

기본적으로 모델의 `toArray` 결과 전체가 검색 인덱스에 저장됩니다. 만약 검색 인덱스에 동기화할 데이터를 커스터마이즈하고 싶다면, 모델에서 `toSearchableArray` 메서드를 오버라이드하면 됩니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class Post extends Model
{
    use Searchable;

    /**
     * 모델로부터 인덱싱 가능한 데이터 배열을 반환합니다.
     *
     * @return array
     */
    public function toSearchableArray()
    {
        $array = $this->toArray();

        // 데이터 배열을 원하는 대로 수정...

        return $array;
    }
}
```

<a name="configuring-the-model-id"></a>
### 모델 ID 설정

Scout는 기본적으로 모델의 기본 키(primary key)를 검색 인덱스에 저장되는 해당 모델의 고유 ID/키로 사용합니다. 이 동작을 변경하려면, 모델에서 `getScoutKey`와 `getScoutKeyName` 메서드를 오버라이드할 수 있습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class User extends Model
{
    use Searchable;

    /**
     * 모델 인덱싱에 사용할 값 반환
     *
     * @return mixed
     */
    public function getScoutKey()
    {
        return $this->email;
    }

    /**
     * 모델 인덱싱에 사용할 키 이름 반환
     *
     * @return mixed
     */
    public function getScoutKeyName()
    {
        return 'email';
    }
}
```

<a name="identifying-users"></a>
### 사용자 식별

Scout는 [Algolia](https://algolia.com)를 사용할 때 사용자를 자동으로 식별하도록 설정할 수 있습니다. 인증된 사용자를 검색 작업과 연결하면 Algolia의 대시보드에서 검색 분석 정보를 확인할 때 도움이 됩니다. 이 기능을 활성화하려면 애플리케이션의 `.env` 파일에 `SCOUT_IDENTIFY` 환경 변수를 `true`로 추가하십시오.

```
SCOUT_IDENTIFY=true
```

이 기능을 활성화하면, 요청한 사용자의 IP 주소와 인증된 사용자의 기본 식별자가 Algolia로 함께 전송되어, 해당 사용자가 수행한 각 검색 요청과 연결됩니다.

<a name="local-development"></a>
## 로컬 개발 환경

로컬 개발 중에도 Algolia나 MeiliSearch 검색 엔진을 사용할 수 있지만, "collection" 엔진을 사용하면 더 간편하게 시작할 수 있습니다. collection 엔진은 기존 데이터베이스에서 결과를 받아와 "where" 조건과 컬렉션 필터링을 사용해 검색 결과를 도출합니다. 이 엔진을 사용할 때는, 별도로 검색 가능한 모델을 "인덱싱"할 필요 없이, 로컬 데이터베이스에서 직접 데이터를 조회해올 수 있습니다.

collection 엔진을 사용하려면, 환경변수 `SCOUT_DRIVER`의 값을 `collection`으로 설정하거나, 애플리케이션의 scout 설정 파일에서 드라이버를 직접 지정하면 됩니다.

```ini
SCOUT_DRIVER=collection
```

이제 collection 드라이버가 설정되었다면, [검색 쿼리 실행](#searching)을 바로 시작할 수 있습니다. Algolia나 MeiliSearch 인덱싱처럼 별도의 인덱싱 작업 없이 곧바로 사용할 수 있습니다.

<a name="indexing"></a>
## 인덱싱

<a name="batch-import"></a>
### 일괄(Batch) 임포트

기존 프로젝트에 Scout를 도입할 경우, 이미 존재하는 데이터베이스 레코드를 전체 인덱스에 임포트해야 할 수 있습니다. 이럴 때는 Scout가 제공하는 `scout:import` Artisan 명령어를 사용해, 기존 레코드를 모두 검색 인덱스로 가져올 수 있습니다.

```
php artisan scout:import "App\Models\Post"
```

모델의 모든 레코드를 검색 인덱스에서 제거하려면, `flush` 명령어를 사용할 수 있습니다.

```
php artisan scout:flush "App\Models\Post"
```

<a name="modifying-the-import-query"></a>
#### 임포트 쿼리 수정

일괄 임포트에 사용할 쿼리를 커스터마이징하고 싶다면, 모델에 `makeAllSearchableUsing` 메서드를 정의하면 됩니다. 예를 들어, 임포트 전에 Eager 로딩이 필요한 연관관계를 미리 불러올 수 있습니다.

```
/**
 * 모든 모델을 검색 가능하게 만들 때 사용할 쿼리 수정
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

`Laravel\Scout\Searchable` 트레이트가 추가된 모델은, 단순히 인스턴스를 `save` 혹은 `create`만 하면 자동으로 검색 인덱스에 추가됩니다. 만약 Scout를 [큐와 함께 구성했다면](#queueing), 이 작업은 백그라운드 큐 워커가 처리합니다.

```
use App\Models\Order;

$order = new Order;

// ...

$order->save();
```

<a name="adding-records-via-query"></a>
#### 쿼리를 통한 레코드 추가

Eloquent 쿼리를 통해 다수의 모델을 한 번에 검색 인덱스에 추가하고 싶을 때는 Eloquent 쿼리 뒤에 `searchable` 메서드를 체이닝하면 됩니다. 이 메서드는 쿼리 결과를 자동으로 [청크 단위로 처리](/docs/8.x/eloquent#chunking-results)하여, 각 레코드를 인덱스에 추가합니다. 큐가 설정되어 있다면, 모든 청크는 큐 워커가 백그라운드에서 임포트합니다.

```
use App\Models\Order;

Order::where('price', '>', 100)->searchable();
```

Eloquent 연관관계 인스턴스에도 `searchable` 메서드를 사용할 수 있습니다.

```
$user->orders()->searchable();
```

이미 Eloquent 모델 컬렉션을 메모리에 가지고 있다면, 컬렉션 인스턴스에 바로 `searchable` 메서드를 호출해 해당 모델들을 인덱스에 추가할 수 있습니다.

```
$orders->searchable();
```

> [!TIP]
> `searchable` 메서드는 "upsert"(있으면 업데이트, 없으면 새로 추가) 동작을 수행합니다. 이미 인덱스에 존재한다면 업데이트되고, 없으면 새로 추가됩니다.

<a name="updating-records"></a>
### 레코드 업데이트

검색 가능한 모델을 업데이트하려면, 해당 인스턴스의 속성 값을 수정한 뒤 데이터베이스에 `save`만 하면 됩니다. Scout가 자동으로 변경 사항을 인덱스에도 반영합니다.

```
use App\Models\Order;

$order = Order::find(1);

// 주문 정보 변경...

$order->save();
```

여러 모델을 쿼리로 반환받아 한 번에 업데이트할 수도 있습니다. 만약 인덱스에 해당 모델이 없다면 새로 추가됩니다.

```
Order::where('price', '>', 100)->searchable();
```

연관관계 인스턴스에 대해서도 `searchable`을 호출해, 모든 연관 모델의 검색 인덱스를 업데이트할 수 있습니다.

```
$user->orders()->searchable();
```

이미 Eloquent 모델 컬렉션이 있다면, 컬렉션 인스턴스에 `searchable`을 호출하여 해당 모델 인스턴스들을 인덱스에 업데이트합니다.

```
$orders->searchable();
```

<a name="removing-records"></a>
### 레코드 제거

인덱스에서 레코드를 제거하려면 모델을 데이터베이스에서 `delete`하면 됩니다. [소프트 삭제](/docs/8.x/eloquent#soft-deleting) 모델을 사용하는 경우에도 동일하게 동작합니다.

```
use App\Models\Order;

$order = Order::find(1);

$order->delete();
```

모델을 먼저 조회하지 않고 바로 삭제하고 싶을 때는, Eloquent 쿼리 인스턴스에서 `unsearchable` 메서드를 사용할 수 있습니다.

```
Order::where('price', '>', 100)->unsearchable();
```

연관관계의 모든 모델 인스턴스를 인덱스에서 제거하려면, 연관관계 인스턴스에 `unsearchable`을 호출합니다.

```
$user->orders()->unsearchable();
```

이미 모델 컬렉션이 있을 때는, 컬렉션 인스턴스에 `unsearchable`을 호출해 해당 모델들을 인덱스에서 제거할 수 있습니다.

```
$orders->unsearchable();
```

<a name="pausing-indexing"></a>
### 인덱싱 일시 중지

여러 개의 Eloquent 모델을 한꺼번에 다뤄야 하지만, 이 동안에는 검색 인덱스와의 동기화를 일시적으로 중단하고 싶은 경우가 있습니다. 이런 경우에는 `withoutSyncingToSearch` 메서드를 사용하면 됩니다. 이 메서드는 하나의 클로저를 인자로 받으며, 클로저 내부에서 실행되는 모든 모델 동작은 인덱스에 반영되지 않습니다.

```
use App\Models\Order;

Order::withoutSyncingToSearch(function () {
    // 모델 관련 작업 수행...
});
```

<a name="conditionally-searchable-model-instances"></a>
### 조건부로 검색 가능한 모델 인스턴스

특정 조건에서만 모델을 검색 대상으로 만들고 싶은 경우가 있을 수 있습니다. 예를 들어, `App\Models\Post` 모델이 "초안(draft)" 또는 "공개(published)" 상태일 때, "공개" 상태일 때만 검색 가능하게 하고 싶다고 가정해봅시다. 이럴 때는 모델에 `shouldBeSearchable` 메서드를 정의하면 됩니다.

```
/**
 * 모델이 검색 대상이 되어야 하는지 여부 반환
 *
 * @return bool
 */
public function shouldBeSearchable()
{
    return $this->isPublished();
}
```

`shouldBeSearchable` 메서드는 `save`, `create` 메서드, 쿼리, 연관관계를 통해 모델을 처리할 때만 적용됩니다. 모델 인스턴스나 컬렉션에 직접 `searchable` 메서드를 호출하면, `shouldBeSearchable` 결과와 상관없이 인덱싱이 강제됩니다.

<a name="searching"></a>
## 검색

모델 검색은 `search` 메서드로 시작할 수 있습니다. 이 메서드는 하나의 문자열을 입력받아 해당 문자열이 포함된 모델을 검색합니다. 이후, `get` 메서드를 체이닝하여 원하는 검색 쿼리의 Eloquent 모델을 반환받을 수 있습니다.

```
use App\Models\Order;

$orders = Order::search('Star Trek')->get();
```

Scout의 검색 결과는 Eloquent 모델 컬렉션으로 반환되어 별도의 처리 없이 바로 JSON으로 변환해 라우트나 컨트롤러에서 직접 반환할 수 있습니다.

```
use App\Models\Order;
use Illuminate\Http\Request;

Route::get('/search', function (Request $request) {
    return Order::search($request->search)->get();
});
```

검색 결과를 Eloquent 모델로 변환하기 전, 원시 검색 결과를 받아보고 싶다면 `raw` 메서드를 사용하면 됩니다.

```
$orders = Order::search('Star Trek')->raw();
```

<a name="custom-indexes"></a>
#### 커스텀 인덱스

검색 쿼리는 기본적으로 모델의 [`searchableAs`](#configuring-model-indexes) 메서드에서 지정한 인덱스를 대상으로 수행됩니다. 하지만, `within` 메서드를 사용하면 특정 커스텀 인덱스에서 검색하도록 할 수 있습니다.

```
$orders = Order::search('Star Trek')
    ->within('tv_shows_popularity_desc')
    ->get();
```

<a name="where-clauses"></a>
### Where 조건절

Scout는 간단한 "where" 조건을 검색 쿼리에 추가할 수 있습니다. 현재로서는 기본적인 숫자 동등 비교만 지원하며, 주로 owner ID처럼 특정 column에 범위를 한정해 검색할 때 유용합니다.

```
use App\Models\Order;

$orders = Order::search('Star Trek')->where('user_id', 1)->get();
```

`whereIn` 메서드를 사용하면 특정 값 집합을 기준으로 결과를 제한할 수 있습니다.

```
$orders = Order::search('Star Trek')->whereIn(
    'status', ['paid', 'open']
)->get();
```

검색 인덱스는 관계형 데이터베이스가 아니므로, 이 외의 복잡한 where 조건문은 현재 지원하지 않습니다.

<a name="pagination"></a>
### 페이지네이션(Pagination)

모델의 컬렉션을 단순히 반환하는 것 외에도, `paginate` 메서드로 검색 결과를 페이지네이션할 수 있습니다. 이 메서드는 [전통적인 Eloquent 쿼리에서 페이지네이션](/docs/8.x/pagination)할 때와 마찬가지로 `Illuminate\Pagination\LengthAwarePaginator` 인스턴스를 반환합니다.

```
use App\Models\Order;

$orders = Order::search('Star Trek')->paginate();
```

한 페이지에 가져올 모델 개수를 지정하려면, `paginate` 메서드의 첫 번째 인자로 개수를 전달하면 됩니다.

```
$orders = Order::search('Star Trek')->paginate(15);
```

검색 결과를 가져온 뒤에는 [Blade](/docs/8.x/blade)에서 일반 페이지네이션 쿼리와 동일하게 내용을 표시하고 페이지 링크를 그릴 수 있습니다.

```html
<div class="container">
    @foreach ($orders as $order)
        {{ $order->price }}
    @endforeach
</div>

{{ $orders->links() }}
```

당연히, 페이지네이터 인스턴스를 라우트나 컨트롤러에서 바로 반환하면 결과를 JSON으로 받을 수도 있습니다.

```
use App\Models\Order;
use Illuminate\Http\Request;

Route::get('/orders', function (Request $request) {
    return Order::search($request->input('query'))->paginate(15);
});
```

<a name="soft-deleting"></a>
### 소프트 삭제(Soft Deleting)

인덱싱된 모델이 [소프트 삭제](/docs/8.x/eloquent#soft-deleting)를 사용하는 경우, 소프트 삭제된 모델도 검색하고 싶다면 `config/scout.php` 설정 파일의 `soft_delete` 옵션을 `true`로 설정하세요.

```
'soft_delete' => true,
```

이 설정이 `true`면, Scout는 소프트 삭제된 모델을 검색 인덱스에서 제거하지 않고, 인덱스에 숨겨진 `__soft_deleted` 속성을 추가합니다. 그리고 검색할 때는 `withTrashed` 또는 `onlyTrashed` 메서드를 사용해 소프트 삭제된 데이터도 함께 조회할 수 있습니다.

```
use App\Models\Order;

// 휴지통 데이터도 포함해서 결과 반환...
$orders = Order::search('Star Trek')->withTrashed()->get();

// 휴지통 데이터만 포함해서 결과 반환...
$orders = Order::search('Star Trek')->onlyTrashed()->get();
```

> [!TIP]
> 소프트 삭제된 모델을 `forceDelete`로 완전히 삭제하면 Scout가 자동으로 인덱스에서 제거합니다.

<a name="customizing-engine-searches"></a>
### 엔진 검색 커스터마이징

엔진의 검색 동작을 더 세밀하게 커스터마이징해야 할 경우, `search` 메서드의 두 번째 인자로 클로저를 전달할 수 있습니다. 예를 들어, 이 콜백을 이용해 검색 쿼리 옵션에 지리 데이터(geo-location)를 추가해서 Algolia에 넘길 수 있습니다.

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

<a name="custom-engines"></a>
## 커스텀 엔진

<a name="writing-the-engine"></a>
#### 엔진 작성

기본 제공되는 Scout 검색 엔진이 요구 사항에 맞지 않는 경우, 자신만의 커스텀 엔진을 작성해 Scout에 등록할 수 있습니다. 커스텀 엔진은 `Laravel\Scout\Engines\Engine` 추상 클래스를 상속해야 하며, 다음의 8가지 메서드를 반드시 구현해야 합니다.

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

이 메서드들의 구체적인 구현은 `Laravel\Scout\Engines\AlgoliaEngine` 클래스의 예시 코드를 참고하면 도움이 될 수 있습니다. 각 메서드가 실제로 어떻게 동작해야 하는지 참고하는 데 좋은 출발점이 됩니다.

<a name="registering-the-engine"></a>
#### 엔진 등록

커스텀 엔진을 모두 구현했다면, Scout 엔진 매니저의 `extend` 메서드로 Scout에 등록할 수 있습니다. 엔진 매니저는 라라벨 서비스 컨테이너에서 resolve할 수 있습니다. 보통 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드나, 애플리케이션에서 사용하는 다른 서비스 프로바이더의 `boot`에서 `extend`를 호출합니다.

```
use App\ScoutExtensions\MySqlSearchEngine
use Laravel\Scout\EngineManager;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
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

엔진 등록이 완료되면, `config/scout.php` 설정 파일에서 기본 Scout `driver`로 지정할 수 있습니다.

```
'driver' => 'mysql',
```

<a name="builder-macros"></a>
## 빌더 매크로

Scout의 검색 빌더에 커스텀 메서드를 정의하고 싶다면, `Laravel\Scout\Builder` 클래스의 `macro` 메서드를 사용할 수 있습니다. 매크로는 주로 [서비스 프로바이더](/docs/8.x/providers)의 `boot` 메서드에서 정의합니다.

```
use Illuminate\Support\Facades\Response;
use Illuminate\Support\ServiceProvider;
use Laravel\Scout\Builder;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
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

`macro` 함수는 첫 번째 인자로 매크로 이름, 두 번째 인자로 클로저를 받습니다. 이후 정의한 매크로 이름을 `Laravel\Scout\Builder` 구현체에서 호출하면, 해당 클로저가 실행됩니다.

```
use App\Models\Order;

Order::search('Star Trek')->count();
```
