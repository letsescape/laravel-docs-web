<!-- # Laravel Scout -->
# Laravel Scout

- [Introduction](#introduction)
- [Installation](#installation)
    - [Queueing](#queueing)
- [Driver Prerequisites](#driver-prerequisites)
    - [Algolia](#algolia)
    - [Meilisearch](#meilisearch)
    - [Typesense](#typesense)
    - [Turbopuffer](#turbopuffer)
- [Configuration](#configuration)
    - [Configuring Searchable Data](#configuring-searchable-data)
- [Database / Collection Engines](#database-and-collection-engines)
    - [Database Engine](#database-engine)
    - [Collection Engine](#collection-engine)
- [Third-Party Engine Configuration](#third-party-engine-configuration)
    - [Configuring Model Indexes](#configuring-model-indexes)
    - [Algolia](#algolia-configuration)
    - [Meilisearch](#meilisearch-configuration)
    - [Typesense](#typesense-configuration)
    - [Turbopuffer](#turbopuffer-configuration)
- [Third-Party Engine Indexing](#indexing)
    - [Batch Import](#batch-import)
    - [Adding Records](#adding-records)
    - [Updating Records](#updating-records)
    - [Removing Records](#removing-records)
    - [Pausing Indexing](#pausing-indexing)
    - [Conditionally Searchable Model Instances](#conditionally-searchable-model-instances)
- [Searching](#searching)
    - [Where Clauses](#where-clauses)
    - [Semantic Search](#semantic-search)
    - [Pagination](#pagination)
    - [Soft Deleting](#soft-deleting)
    - [Customizing Engine Searches](#customizing-engine-searches)
- [Custom Engines](#custom-engines)

<a name="introduction"></a>
<!-- ## Introduction -->
## Introduction

<!-- [Laravel Scout](https://github.com/laravel/scout) provides a simple, driver-based solution for adding full-text search to your [Eloquent models](/docs/13.x/eloquent). Using model observers, Scout will automatically keep your search indexes in sync with your Eloquent records. -->
[Laravel Scout](https://github.com/laravel/scout)는 [Eloquent models](/docs/13.x/eloquent)에 전문 검색 기능을 추가할 수 있는 간단한 드라이버 기반 솔루션을 제공합니다. Scout는 모델 옵저버를 사용해 검색 인덱스를 Eloquent 레코드와 자동으로 동기화합니다.

<!-- Scout ships with a built-in `database` engine that uses MySQL / PostgreSQL full-text indexes and `LIKE` clauses to search your existing database — no external service required. For most applications, this is all you need. For an overview of all search options available in Laravel, consult the [search documentation](/docs/13.x/search). -->
Scout는 MySQL / PostgreSQL 전문 검색 인덱스와 `LIKE` 절을 사용해 기존 데이터베이스를 검색하는 내장 `database` 엔진을 제공합니다. 외부 서비스가 필요하지 않습니다. 대부분의 애플리케이션에서는 이것만으로 충분합니다. Laravel에서 사용할 수 있는 모든 검색 옵션을 간략히 살펴보려면 [search documentation](/docs/13.x/search)를 참고하세요.

<!-- Scout also includes drivers for [Algolia](https://www.algolia.com/), [Meilisearch](https://www.meilisearch.com), [Typesense](https://typesense.org), and [Turbopuffer](https://turbopuffer.com) when you need features like typo tolerance, faceted filtering, vector search, or geo-search at massive scale. A "collection" driver is also available for local development, and you are free to write [custom engines](#custom-engines) as well. -->
Scout에는 대규모 환경에서 오타 허용, 패싯 필터링, 벡터 검색 또는 지리 검색과 같은 기능이 필요할 때 사용할 수 있도록 [Algolia](https://www.algolia.com/), [Meilisearch](https://www.meilisearch.com), [Typesense](https://typesense.org), [Turbopuffer](https://turbopuffer.com)용 드라이버도 포함되어 있습니다. 로컬 개발을 위한 "collection" 드라이버도 제공되며, 직접 [custom engines](#custom-engines)를 작성할 수도 있습니다.

<a name="installation"></a>
<!-- ## Installation -->
## Installation

<!-- First, install Scout via the Composer package manager: -->
먼저 Composer 패키지 관리자를 통해 Scout를 설치합니다.

```shell
composer require laravel/scout
```

<!-- After installing Scout, you should publish the Scout configuration file using the `vendor:publish` Artisan command. This command will publish the `scout.php` configuration file to your application's `config` directory: -->
Scout를 설치한 후에는 `vendor:publish` Artisan 명령어를 사용하여 Scout 설정 파일을 게시해야 합니다. 이 명령어는 `scout.php` 설정 파일을 애플리케이션의 `config` 디렉터리에 게시합니다.

```shell
php artisan vendor:publish --provider="Laravel\Scout\ScoutServiceProvider"
```

<!-- Finally, add the `Laravel\Scout\Searchable` trait to the model you would like to make searchable. This trait will register a model observer that will automatically keep the model in sync with your search driver: -->
마지막으로 검색 가능하게 만들 모델에 `Laravel\Scout\Searchable` 트레이트를 추가합니다. 이 트레이트는 모델 옵저버를 등록하여 모델이 검색 드라이버와 자동으로 동기화되도록 유지합니다.

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
<!-- ### Queueing -->
### Queueing

<!-- When using an engine that is not the `database` or `collection` engine, you should strongly consider configuring a [queue driver](/docs/13.x/queues) before using the library. Running a queue worker will allow Scout to queue all operations that sync your model information to your search indexes, providing much better response times for your application's web interface. -->
`database` 또는 `collection` 엔진이 아닌 엔진을 사용할 때는 라이브러리를 사용하기 전에 [queue driver](/docs/13.x/queues)를 구성하는 것을 적극 권장합니다. 큐 워커를 실행하면 Scout가 모델 정보를 검색 인덱스와 동기화하는 모든 작업을 큐에 추가할 수 있으므로 애플리케이션의 웹 인터페이스 응답 시간이 크게 향상됩니다.

<!-- Once you have configured a queue driver, set the value of the `queue` option in your `config/scout.php` configuration file to `true`: -->
큐 드라이버를 설정한 후에는 `config/scout.php` 설정 파일의 `queue` 옵션 값을 `true`로 설정합니다.

```php
'queue' => true,
```

<!-- Even when the `queue` option is set to `false`, it's important to remember that some Scout drivers like Algolia and Meilisearch always index records asynchronously. In other words, even though the index operation has completed within your Laravel application, the search engine itself may not reflect the new and updated records immediately. -->
`queue` 옵션이 `false`로 설정되어 있더라도 Algolia, Meilisearch 같은 일부 Scout 드라이버는 항상 레코드를 비동기적으로 인덱싱한다는 점을 기억해야 합니다. 즉, Laravel 애플리케이션 안에서 인덱스 작업이 완료되었더라도 검색 엔진 자체에는 새 레코드나 업데이트된 레코드가 즉시 반영되지 않을 수 있습니다.

<!-- To specify the connection and queue that your Scout jobs utilize, you may define the `queue` configuration option as an array: -->
Scout 작업이 사용할 연결과 큐를 지정하려면 `queue` 설정 옵션을 배열로 정의할 수 있습니다.

```php
'queue' => [
    'connection' => 'redis',
    'queue' => 'scout'
],
```

<!-- Of course, if you customize the connection and queue that Scout jobs utilize, you should run a queue worker to process jobs on that connection and queue: -->
물론 Scout 작업이 사용할 연결과 큐를 사용자 정의했다면, 해당 연결과 큐에서 작업을 처리할 큐 워커를 실행해야 합니다.

```shell
php artisan queue:work redis --queue=scout
```

<a name="unique-jobs"></a>
<!-- #### Unique Jobs -->
#### Unique Jobs

<!-- In write-heavy applications, you may wish to prevent Scout from queueing duplicate jobs for the same model records. You may opt into unique indexing jobs by registering the `MakeSearchableUniquely` and `RemoveFromSearchUniquely` job classes, typically within the `boot` method of a service provider: -->
쓰기 작업이 많은 애플리케이션에서는 같은 모델 레코드에 대해 Scout가 중복 잡을 큐에 넣지 못하게 하고 싶을 수 있습니다. 일반적으로 서비스 프로바이더의 `boot` 메서드 안에서 `MakeSearchableUniquely` 및 `RemoveFromSearchUniquely` 잡 클래스를 등록하여 고유 인덱싱 잡을 사용할 수 있습니다.

```php
use Laravel\Scout\Jobs\MakeSearchableUniquely;
use Laravel\Scout\Jobs\RemoveFromSearchUniquely;
use Laravel\Scout\Scout;

Scout::makeSearchableUsing(MakeSearchableUniquely::class);
Scout::removeFromSearchUsing(RemoveFromSearchUniquely::class);
```

<!-- These jobs use Laravel's [unique job locks](/docs/13.x/queues#unique-jobs) to avoid dispatching duplicate queued indexing operations for the same searchable model records while a matching job is already queued. -->
이러한 잡은 일치하는 잡이 이미 큐에 등록되어 있는 동안 동일한 검색 가능한 모델 레코드에 대해 중복된 인덱싱 작업이 큐에 등록되는 것을 방지하기 위해 Laravel의 [unique job locks](/docs/13.x/queues#unique-jobs)를 사용합니다.

<a name="driver-prerequisites"></a>
<!-- ## Driver Prerequisites -->
## Driver Prerequisites

<a name="algolia"></a>
<!-- ### Algolia -->
### Algolia

<!-- When using the Algolia driver, you should configure your Algolia `id` and `secret` credentials in your `config/scout.php` configuration file. Once your credentials have been configured, you will also need to install the Algolia PHP SDK via the Composer package manager: -->
Algolia 드라이버를 사용할 때는 `config/scout.php` 설정 파일에 Algolia `id` 및 `secret` 자격 증명을 설정해야 합니다. 자격 증명을 설정한 후에는 Composer 패키지 관리자를 통해 Algolia PHP SDK도 설치해야 합니다.

```shell
composer require algolia/algoliasearch-client-php
```

<a name="meilisearch"></a>
<!-- ### Meilisearch -->
### Meilisearch

<!-- [Meilisearch](https://www.meilisearch.com) is a fast, open source search engine. If you aren't sure how to install Meilisearch on your local machine, you may use [Laravel Sail](/docs/13.x/sail#meilisearch), Laravel's officially supported Docker development environment. -->
[Meilisearch](https://www.meilisearch.com)는 빠른 오픈 소스 검색 엔진입니다. 로컬 머신에 Meilisearch를 설치하는 방법을 잘 모르겠다면 Laravel에서 공식적으로 지원하는 Docker 개발 환경인 [Laravel Sail](/docs/13.x/sail#meilisearch)을 사용할 수 있습니다.

<!-- When using the Meilisearch driver you will need to install the Meilisearch PHP SDK via the Composer package manager: -->
Meilisearch 드라이버를 사용할 때는 Composer 패키지 관리자를 통해 Meilisearch PHP SDK를 설치해야 합니다.

```shell
composer require meilisearch/meilisearch-php http-interop/http-factory-guzzle
```

<!-- Then, set the `SCOUT_DRIVER` environment variable as well as your Meilisearch `host` and `key` credentials within your application's `.env` file: -->
그런 다음 애플리케이션의 `.env` 파일에서 `SCOUT_DRIVER` 환경 변수와 Meilisearch `host` 및 `key` 자격 증명을 설정합니다.

```ini
SCOUT_DRIVER=meilisearch
MEILISEARCH_HOST=http://127.0.0.1:7700
MEILISEARCH_KEY=masterKey
```

<!-- For more information regarding Meilisearch, please consult the [Meilisearch documentation](https://docs.meilisearch.com/learn/getting_started/quick_start.html). -->
Meilisearch에 대한 자세한 내용은 [Meilisearch documentation](https://docs.meilisearch.com/learn/getting_started/quick_start.html)를 참고하십시오.

<!-- In addition, you should ensure that you install a version of `meilisearch/meilisearch-php` that is compatible with your Meilisearch binary version by reviewing [Meilisearch's documentation regarding binary compatibility](https://github.com/meilisearch/meilisearch-php#-compatibility-with-meilisearch). -->
또한 [Meilisearch's documentation regarding binary compatibility](https://github.com/meilisearch/meilisearch-php#-compatibility-with-meilisearch)를 확인하여, 사용하는 Meilisearch 바이너리 버전과 호환되는 `meilisearch/meilisearch-php` 버전을 설치해야 합니다.

> [!WARNING]
> Meilisearch를 사용하는 애플리케이션에서 Scout를 업그레이드할 때는 항상 Meilisearch 서비스 자체의 [review any additional breaking changes](https://github.com/meilisearch/Meilisearch/releases)를 확인해야 합니다.

<a name="typesense"></a>
<!-- ### Typesense -->
### Typesense

<!-- [Typesense](https://typesense.org) is a lightning-fast, open source search engine and supports keyword search, semantic search, geo search, and vector search. -->
[Typesense](https://typesense.org)는 매우 빠른 오픈 소스 검색 엔진이며, 키워드 검색, 시맨틱 검색, 지리 검색, 벡터 검색을 지원합니다.

<!-- You can [self-host](https://typesense.org/docs/guide/install-typesense.html#option-2-local-machine-self-hosting) Typesense or use [Typesense Cloud](https://cloud.typesense.org). -->
Typesense는 [self-host](https://typesense.org/docs/guide/install-typesense.html#option-2-local-machine-self-hosting)하거나 [Typesense Cloud](https://cloud.typesense.org)를 사용할 수 있습니다.

<!-- To get started using Typesense with Scout, install the Typesense PHP SDK via the Composer package manager: -->
Scout에서 Typesense를 사용하려면 Composer 패키지 관리자를 통해 Typesense PHP SDK를 설치합니다.

```shell
composer require typesense/typesense-php
```

<!-- Then, set the `SCOUT_DRIVER` environment variable as well as your Typesense host and API key credentials within your application's .env file: -->
그런 다음 애플리케이션의 .env 파일에서 `SCOUT_DRIVER` 환경 변수와 Typesense 호스트 및 API 키 자격 증명을 설정합니다.

```ini
SCOUT_DRIVER=typesense
TYPESENSE_API_KEY=masterKey
TYPESENSE_HOST=localhost
```

<!-- If you are using [Laravel Sail](/docs/13.x/sail), you may need to adjust the `TYPESENSE_HOST` environment variable to match the Docker container name. You may also optionally specify your installation's port, path, and protocol: -->
[Laravel Sail](/docs/13.x/sail)을 사용하는 경우 Docker 컨테이너 이름에 맞게 `TYPESENSE_HOST` 환경 변수를 조정해야 할 수 있습니다. 또한 설치 환경의 포트, 경로, 프로토콜을 선택적으로 지정할 수도 있습니다:

```ini
TYPESENSE_PORT=8108
TYPESENSE_PATH=
TYPESENSE_PROTOCOL=http
```

<!-- Additional settings and schema definitions for your Typesense collections can be found within your application's `config/scout.php` configuration file. For more information regarding Typesense, please consult the [Typesense documentation](https://typesense.org/docs/guide/#quick-start). -->
Typesense 컬렉션을 위한 추가 설정과 스키마 정의는 애플리케이션의 `config/scout.php` 설정 파일에서 확인할 수 있습니다. Typesense에 대한 자세한 내용은 [Typesense documentation](https://typesense.org/docs/guide/#quick-start)를 참고하십시오.

<a name="turbopuffer"></a>
<!-- ### Turbopuffer -->
### Turbopuffer

<!-- [Turbopuffer](https://turbopuffer.com) is a search engine that supports full-text, semantic, and hybrid search. To use the Turbopuffer driver, set the `SCOUT_DRIVER` environment variable and provide your Turbopuffer API key: -->
[Turbopuffer](https://turbopuffer.com)는 전문 검색, 시맨틱 검색 및 하이브리드 검색을 지원하는 검색 엔진입니다. Turbopuffer 드라이버를 사용하려면 `SCOUT_DRIVER` 환경 변수를 설정하고 Turbopuffer API 키를 제공하세요:

```ini
SCOUT_DRIVER=turbopuffer
TURBOPUFFER_API_KEY=tpuf_...
TURBOPUFFER_REGION=gcp-us-central1
```

<!-- The `TURBOPUFFER_REGION` environment variable is optional and defaults to `gcp-us-central1`. -->
`TURBOPUFFER_REGION` 환경 변수는 선택 사항이며 기본값은 `gcp-us-central1`입니다.

<a name="configuration"></a>
<!-- ## Configuration -->
## Configuration

<a name="configuring-searchable-data"></a>
<!-- ### Configuring Searchable Data -->
### Configuring Searchable Data

<!-- By default, the entire `toArray` form of a given model will be persisted to its search index. If you would like to customize the data that is synchronized to the search index, you may override the `toSearchableArray` method on the model: -->
기본적으로 특정 모델의 전체 `toArray` 형태가 검색 인덱스에 저장됩니다. 검색 인덱스와 동기화되는 데이터를 사용자 정의하려면 모델의 `toSearchableArray` 메서드를 재정의할 수 있습니다.

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

        // Customize the data array...

        return $array;
    }
}
```

<a name="configuring-search-engines-per-model"></a>
<!-- #### Configuring Model Engines -->
#### Configuring Model Engines

<!-- When searching, Scout will typically use the default search engine specified in your application's `scout` configuration file. However, the search engine for a particular model can be changed by overriding the `searchableUsing` method on the model: -->
검색할 때 Scout는 일반적으로 애플리케이션의 `scout` 설정 파일에 지정된 기본 검색 엔진을 사용합니다. 하지만 특정 모델의 검색 엔진은 모델의 `searchableUsing` 메서드를 재정의하여 변경할 수 있습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Engines\Engine;
use Laravel\Scout\Scout;
use Laravel\Scout\Searchable;

class User extends Model
{
    use Searchable;

    /**
     * Get the engine used to index the model.
     */
    public function searchableUsing(): Engine
    {
        return Scout::engine('meilisearch');
    }
}
```

<a name="database-and-collection-engines"></a>
<!-- ## Database / Collection Engines -->
## Database / Collection Engines

<a name="database-engine"></a>
<!-- ### Database Engine -->
### Database Engine

> [!WARNING]
> 데이터베이스 엔진은 현재 MySQL과 PostgreSQL을 지원하며, 두 데이터베이스 엔진 모두 빠른 전문 컬럼 인덱싱을 지원합니다.

<!-- The `database` engine uses MySQL / PostgreSQL full-text indexes and `LIKE` clauses to search your existing database directly. For many applications, this is the simplest and most practical way to add search — no external service or additional infrastructure required. -->
`database` 엔진은 MySQL / PostgreSQL 전체 텍스트 인덱스와 `LIKE` 절을 사용하여 기존 데이터베이스를 직접 검색합니다. 많은 애플리케이션에서 검색을 추가하는 가장 단순하고 실용적인 방법입니다. 외부 서비스나 추가 인프라가 필요하지 않습니다.

<!-- To use the database engine, set the `SCOUT_DRIVER` environment variable to `database`: -->
데이터베이스 엔진을 사용하려면 `SCOUT_DRIVER` 환경 변수를 `database`로 설정합니다.

```ini
SCOUT_DRIVER=database
```

<!-- Once configured, you may [define your searchable data](#configuring-searchable-data) and start [executing search queries](#searching) against your models. Unlike third-party engines, the database engine requires no separate indexing step — it searches your database tables directly. -->
설정이 끝나면 [define your searchable data](#configuring-searchable-data)를 하고 모델에 대해 [executing search queries](#searching)을 시작할 수 있습니다. 서드파티 엔진과 달리 데이터베이스 엔진은 별도의 인덱싱 단계가 필요하지 않습니다. 데이터베이스 테이블을 직접 검색합니다.

<a name="database-semantic-and-hybrid-search"></a>
<!-- #### Semantic and Hybrid Search -->
#### Semantic and Hybrid Search

<!-- The database engine supports semantic and hybrid search when using PostgreSQL with the `pgvector` extension. To get started, add a nullable vector column and a full-text index to your model's table. The vector column must be nullable because Scout stores the embedding after the model has been persisted: -->
데이터베이스 엔진은 `pgvector` 확장 기능과 함께 PostgreSQL을 사용할 때 시맨틱 검색과 하이브리드 검색을 지원합니다. 시작하려면 모델 테이블에 널 허용 벡터 컬럼과 전문 검색 인덱스를 추가합니다. 모델이 저장된 후 Scout가 임베딩을 저장하므로 벡터 컬럼은 널을 허용해야 합니다:

```php
Schema::ensureVectorExtensionExists();

Schema::table('articles', function (Blueprint $table) {
    // ...

    $table->vector('embedding', dimensions: 1536)->nullable();
    $table->vectorIndex('embedding');
    $table->fullText(['title', 'body']);
});
```

<!-- Next, define a `toSearchableEmbedding` method on the model. This method may return the source text that Scout should embed or a precomputed embedding array. Scout stores embeddings in the `embedding` column by default; to use another column, define a `searchableEmbeddingColumn` method on the model. -->
다음으로 모델에 `toSearchableEmbedding` 메서드를 정의합니다. 이 메서드는 Scout가 임베딩할 원본 텍스트 또는 미리 계산된 임베딩 배열을 반환할 수 있습니다. Scout는 기본적으로 `embedding` 컬럼에 임베딩을 저장하며, 다른 컬럼을 사용하려면 모델에 `searchableEmbeddingColumn` 메서드를 정의합니다.

<!-- #### Customizing Database Searching Strategies -->
#### Customizing Database Searching Strategies

<!-- By default, the database engine will execute a `LIKE` query against every model attribute that you have [configured as searchable](#configuring-searchable-data). However, you can assign more efficient search strategies to specific columns. The `SearchUsingFullText` attribute will use your database's full-text index for that column, while `SearchUsingPrefix` will only match the beginning of strings (`example%`) instead of searching within the entire string (`%example%`). -->
기본적으로 데이터베이스 엔진은 [configured as searchable](#configuring-searchable-data) 모든 모델 속성에 대해 `LIKE` 쿼리를 실행합니다. 하지만 특정 컬럼에는 더 효율적인 검색 전략을 지정할 수 있습니다. `SearchUsingFullText` 속성은 해당 컬럼에 데이터베이스의 전체 텍스트 인덱스를 사용하고, `SearchUsingPrefix`는 전체 문자열 안에서 검색하는 방식(`%example%`) 대신 문자열의 시작 부분(`example%`)만 일치시킵니다.

<!-- To define this behavior, assign PHP attributes to your model's `toSearchableArray` method. Any columns without an attribute will continue to use the default `LIKE` strategy: -->
이 동작을 정의하려면 모델의 `toSearchableArray` 메서드에 PHP 속성을 지정합니다. 속성이 없는 컬럼은 계속 기본 `LIKE` 전략을 사용합니다.

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
> 컬럼에 전문 검색 쿼리 제약 조건을 사용하도록 지정하기 전에 해당 컬럼에 [full text index](/docs/13.x/migrations#available-index-types)가 할당되어 있는지 확인해야 합니다.

<a name="collection-engine"></a>
<!-- ### Collection Engine -->
### Collection Engine

<!-- The "collection" engine is intended for quick prototypes, extremely small datasets (a few hundred records), or running tests. It retrieves all possible records from your database and uses Laravel's `Str::is` helper to filter them in PHP, so it does not require any indexing or database-specific features. For anything beyond trivial use cases, you should use the [database engine](#database-engine) instead. -->
"collection" 엔진은 빠른 프로토타입, 매우 작은 데이터셋(몇백 개의 레코드), 또는 테스트 실행을 위한 용도입니다. 가능한 모든 레코드를 데이터베이스에서 가져온 뒤 Laravel의 `Str::is` 헬퍼를 사용해 PHP에서 필터링하므로, 인덱싱이나 데이터베이스별 기능이 필요하지 않습니다. 아주 단순한 사용 사례를 넘어선다면 대신 [database engine](#database-engine)을 사용해야 합니다.

<!-- To use the collection engine, you may simply set the value of the `SCOUT_DRIVER` environment variable to `collection`, or specify the `collection` driver directly in your application's `scout` configuration file: -->
컬렉션 엔진을 사용하려면 `SCOUT_DRIVER` 환경 변수 값을 `collection`으로 설정하거나, 애플리케이션의 `scout` 설정 파일에서 `collection` 드라이버를 직접 지정하면 됩니다.

```ini
SCOUT_DRIVER=collection
```

<!-- Once you have specified the collection driver as your preferred driver, you may start [executing search queries](#searching) against your models. Search engine indexing, such as the indexing needed to seed Algolia, Meilisearch, or Typesense indexes, is unnecessary when using the collection engine. -->
선호 드라이버로 컬렉션 드라이버를 지정한 후에는 모델에 대해 [executing search queries](#searching)을 시작할 수 있습니다. 컬렉션 엔진을 사용할 때는 Algolia, Meilisearch, Typesense 인덱스를 채우는 데 필요한 인덱싱과 같은 검색 엔진 인덱싱이 필요하지 않습니다.

<!-- #### Differences From Database Engine -->
#### Differences From Database Engine

<!-- While the database engine uses full-text indexes and `LIKE` clauses to find matching records efficiently, the collection engine pulls all records and filters them in PHP. The collection engine is the most portable option as it works across all relational databases supported by Laravel (including SQLite and SQL Server); however, it is significantly less efficient than the database engine and should not be used with large datasets. -->
데이터베이스 엔진은 전체 텍스트 인덱스와 `LIKE` 절을 사용하여 일치하는 레코드를 효율적으로 찾지만, 컬렉션 엔진은 모든 레코드를 가져온 뒤 PHP에서 필터링합니다. 컬렉션 엔진은 Laravel이 지원하는 모든 관계형 데이터베이스(SQLite 및 SQL Server 포함)에서 동작하므로 가장 이식성이 높은 옵션입니다. 하지만 데이터베이스 엔진보다 훨씬 비효율적이므로 큰 데이터셋에는 사용하지 않아야 합니다.

<a name="third-party-engine-configuration"></a>
<!-- ## Third-Party Engine Configuration -->
## Third-Party Engine Configuration

<!-- The following configuration options are only relevant when using a third-party search engine such as Algolia, Meilisearch, or Typesense. If you are using the [database engine](#database-engine), you may skip this section. -->
다음 설정 옵션은 Algolia, Meilisearch, Typesense 같은 서드파티 검색 엔진을 사용할 때만 관련이 있습니다. [database engine](#database-engine)을 사용하고 있다면 이 섹션은 건너뛰어도 됩니다.

<a name="configuring-model-indexes"></a>
<!-- ### Configuring Model Indexes -->
### Configuring Model Indexes

<!-- When using a third-party engine, each Eloquent model is synced with a given search "index", which contains all of the searchable records for that model. By default, each model will be persisted to an index matching the model's typical "table" name. Typically, this is the plural form of the model name; however, you are free to customize the model's index by overriding the `searchableAs` method on the model: -->
서드파티 엔진을 사용할 때 각 Eloquent 모델은 해당 모델의 모든 검색 가능한 레코드를 포함하는 특정 검색 "인덱스"와 동기화됩니다. 기본적으로 각 모델은 모델의 일반적인 "table" 이름과 일치하는 인덱스에 저장됩니다. 일반적으로 이는 모델 이름의 복수형입니다. 하지만 모델의 `searchableAs` 메서드를 재정의하여 모델의 인덱스를 자유롭게 사용자 정의할 수 있습니다.

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

> [!NOTE]
> 데이터베이스 엔진을 사용하는 경우 `searchableAs` 메서드는 아무런 영향을 주지 않습니다. 데이터베이스 엔진은 항상 모델의 데이터베이스 테이블을 직접 검색합니다.

<a name="configuring-the-model-id"></a>
<!-- #### Configuring the Model ID -->
#### Configuring the Model ID

<!-- By default, Scout will use the primary key of the model as the model's unique ID / key that is stored in the search index. If you need to customize this behavior when using a third-party engine, you may override the `getScoutKey` and the `getScoutKeyName` methods on the model: -->
기본적으로 Scout는 모델의 기본 키를 검색 인덱스에 저장되는 모델의 고유 ID / 키로 사용합니다. 서드파티 엔진을 사용할 때 이 동작을 사용자 정의해야 한다면 모델의 `getScoutKey` 및 `getScoutKeyName` 메서드를 재정의할 수 있습니다.

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

> [!NOTE]
> 데이터베이스 엔진을 사용할 때는 `getScoutKey` 및 `getScoutKeyName` 메서드가 아무런 영향을 주지 않습니다. 데이터베이스 엔진은 항상 모델의 기본 키를 사용합니다.

<a name="algolia-configuration"></a>
<!-- ### Algolia -->
### Algolia

<a name="algolia-index-settings"></a>
<!-- #### Index Settings -->
#### Index Settings

<!-- Sometimes you may want to configure additional settings on your Algolia indexes. While you can manage these settings via the Algolia UI, it is sometimes more efficient to manage the desired state of your index configuration directly from your application's `config/scout.php` configuration file. -->
때로는 Algolia 인덱스에 추가 설정을 구성하고 싶을 수 있습니다. Algolia UI를 통해 이러한 설정을 관리할 수 있지만, 원하는 인덱스 설정 상태를 애플리케이션의 `config/scout.php` 설정 파일에서 직접 관리하는 편이 더 효율적일 때도 있습니다.

<!-- This approach allows you to deploy these settings through your application's automated deployment pipeline, avoiding manual configuration and ensuring consistency across multiple environments. You may configure filterable attributes, ranking, faceting, or [any other supported settings](https://www.algolia.com/doc/rest-api/search/#tag/Indices/operation/setSettings). -->
이 접근 방식은 애플리케이션의 자동 배포 파이프라인을 통해 이러한 설정을 배포할 수 있게 해 주며, 수동 설정을 피하고 여러 환경에서 일관성을 보장합니다. 필터링 가능한 속성, 랭킹, 패싯 또는 [any other supported settings](https://www.algolia.com/doc/rest-api/search/#tag/Indices/operation/setSettings)을 구성할 수 있습니다.

<!-- To get started, add settings for each index in your application's `config/scout.php` configuration file: -->
시작하려면 애플리케이션의 `config/scout.php` 설정 파일에 각 인덱스의 설정을 추가합니다.

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
            // Other settings fields...
        ],
        Flight::class => [
            'searchableAttributes'=> ['id', 'destination'],
        ],
    ],
],
```

<!-- If the model underlying a given index is soft deletable and is included in the `index-settings` array, Scout will automatically include support for faceting on soft deleted models on that index. If you have no other faceting attributes to define for a soft deletable model index, you may simply add an empty entry to the `index-settings` array for that model: -->
특정 인덱스의 기반이 되는 모델이 소프트 삭제 가능하고 `index-settings` 배열에 포함되어 있으면, Scout는 해당 인덱스에서 소프트 삭제된 모델에 대한 패싯 지원을 자동으로 포함합니다. 소프트 삭제 가능한 모델 인덱스에 대해 정의할 다른 패싯 속성이 없다면, 해당 모델에 대해 `index-settings` 배열에 빈 항목을 추가하기만 하면 됩니다.

```php
'index-settings' => [
    Flight::class => []
],
```

<!-- After configuring your application's index settings, you must invoke the `scout:sync-index-settings` Artisan command. This command will inform Algolia of your currently configured index settings. For convenience, you may wish to make this command part of your deployment process: -->
애플리케이션의 인덱스 설정을 구성한 후에는 `scout:sync-index-settings` Artisan 명령어를 실행해야 합니다. 이 명령어는 현재 구성된 인덱스 설정을 Algolia에 알려줍니다. 편의를 위해 이 명령어를 배포 프로세스의 일부로 포함할 수 있습니다.

```shell
php artisan scout:sync-index-settings
```

<a name="algolia-identifying-users"></a>
<!-- #### Identifying Users -->
#### Identifying Users

<!-- Scout allows you to auto identify users when using Algolia. Associating the authenticated user with search operations may be helpful when viewing your search analytics within Algolia's dashboard. You can enable user identification by defining a `SCOUT_IDENTIFY` environment variable as `true` in your application's `.env` file: -->
Scout를 사용하면 Algolia를 사용할 때 사용자를 자동으로 식별할 수 있습니다. 인증된 사용자를 검색 작업과 연결하면 Algolia 대시보드에서 검색 분석을 확인할 때 도움이 될 수 있습니다. 사용자 식별을 활성화하려면 애플리케이션의 `.env` 파일에서 `SCOUT_IDENTIFY` 환경 변수를 `true`로 정의하면 됩니다.

```ini
SCOUT_IDENTIFY=true
```

<!-- Enabling this feature will also pass the request's IP address and your authenticated user's primary identifier to Algolia so this data is associated with any search request that is made by the user. -->
이 기능을 활성화하면 요청의 IP 주소와 인증된 사용자의 기본 식별자도 Algolia에 전달되므로, 사용자가 수행한 모든 검색 요청에 이 데이터가 연결됩니다.

<a name="meilisearch-configuration"></a>
<!-- ### Meilisearch -->
### Meilisearch

<a name="meilisearch-index-settings"></a>
<!-- #### Index Settings -->
#### Index Settings

<!-- Meilisearch requires you to pre-define index search settings such as filterable attributes, sortable attributes, and [other supported settings fields](https://docs.meilisearch.com/reference/api/settings.html). -->
Meilisearch에서는 필터링 가능한 속성, 정렬 가능한 속성, 그리고 [other supported settings fields](https://docs.meilisearch.com/reference/api/settings.html)와 같은 인덱스 검색 설정을 미리 정의해야 합니다.

<!-- Filterable attributes are any attributes you plan to filter on when invoking Scout's `where` method, while sortable attributes are any attributes you plan to sort by when invoking Scout's `orderBy` method. To define your index settings, adjust the `index-settings` portion of your `meilisearch` configuration entry in your application's `scout` configuration file: -->
필터링 가능한 속성은 Scout의 `where` 메서드를 호출할 때 필터링에 사용할 속성이며, 정렬 가능한 속성은 Scout의 `orderBy` 메서드를 호출할 때 정렬 기준으로 사용할 속성입니다. 인덱스 설정을 정의하려면 애플리케이션의 `scout` 설정 파일에서 `meilisearch` 설정 항목의 `index-settings` 부분을 조정합니다.

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
            // Other settings fields...
        ],
        Flight::class => [
            'filterableAttributes'=> ['id', 'destination'],
            'sortableAttributes' => ['updated_at'],
        ],
    ],
],
```

<!-- If the model underlying a given index is soft deletable and is included in the `index-settings` array, Scout will automatically include support for filtering on soft deleted models on that index. If you have no other filterable or sortable attributes to define for a soft deletable model index, you may simply add an empty entry to the `index-settings` array for that model: -->
특정 인덱스의 기반이 되는 모델이 소프트 삭제 가능하고 `index-settings` 배열에 포함되어 있으면, Scout는 해당 인덱스에서 소프트 삭제된 모델을 필터링하는 기능을 자동으로 포함합니다. 소프트 삭제 가능한 모델 인덱스에 대해 정의할 다른 필터링 가능 속성이나 정렬 가능 속성이 없다면, 해당 모델에 대해 `index-settings` 배열에 빈 항목을 추가하기만 하면 됩니다.

```php
'index-settings' => [
    Flight::class => []
],
```

<!-- After configuring your application's index settings, you must invoke the `scout:sync-index-settings` Artisan command. This command will inform Meilisearch of your currently configured index settings. For convenience, you may wish to make this command part of your deployment process: -->
애플리케이션의 인덱스 설정을 구성한 후에는 `scout:sync-index-settings` Artisan 명령어를 실행해야 합니다. 이 명령어는 현재 구성된 인덱스 설정을 Meilisearch에 알려줍니다. 편의를 위해 이 명령어를 배포 프로세스의 일부로 포함할 수 있습니다.

```shell
php artisan scout:sync-index-settings
```

<a name="meilisearch-semantic-and-hybrid-search"></a>
<!-- #### Semantic and Hybrid Search -->
#### Semantic and Hybrid Search

<!-- To use semantic or hybrid search with Meilisearch, configure an embedder in the index settings and embedding settings for each searchable model: -->
Meilisearch에서 시맨틱 또는 하이브리드 검색을 사용하려면 검색 가능한 각 모델의 인덱스 설정과 임베딩 설정에서 임베더를 구성합니다:

```php
'meilisearch' => [
    // ...
    'index-settings' => [
        Article::class => [
            'embedders' => [
                'default' => [
                    'source' => 'userProvided',
                    'dimensions' => 1536,
                ],
            ],
        ],
    ],
    'model-settings' => [
        Article::class => [
            'embedding' => [
                'embedder' => 'default',
                'dimensions' => 1536,
            ],
        ],
    ],
],
```

<!-- The model's `toSearchableEmbedding` method may return source text, which Scout embeds using the [Laravel AI SDK](/docs/13.x/ai-sdk), or a precomputed embedding array. After updating the configuration, run the `scout:sync-index-settings` command. -->
모델의 `toSearchableEmbedding` 메서드는 Scout가 [Laravel AI SDK](/docs/13.x/ai-sdk)를 사용해 임베딩하는 원본 텍스트나 미리 계산된 임베딩 배열을 반환할 수 있습니다. 설정을 업데이트한 후 `scout:sync-index-settings` 명령어를 실행하세요.

<a name="meilisearch-data-types"></a>
<!-- #### Searchable Data Types -->
#### Searchable Data Types

<!-- Meilisearch will only perform filter operations (`>`, `<`, etc.) on data of the correct type. When customizing your searchable data, you should ensure that numeric values are cast to their correct type: -->
Meilisearch는 올바른 타입의 데이터에 대해서만 필터 작업(`>`, `<` 등)을 수행합니다. 검색 가능한 데이터를 커스터마이즈할 때는 숫자 값이 올바른 타입으로 casting되도록 해야 합니다.

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

<a name="typesense-configuration"></a>
<!-- ### Typesense -->
### Typesense

<a name="typesense-searchable-data"></a>
<!-- #### Preparing Searchable Data -->
#### Preparing Searchable Data

<!-- When utilizing Typesense, your searchable models must define a `toSearchableArray` method that casts your model's primary key to a string and creation date to a UNIX timestamp: -->
Typesense를 사용할 때 검색 가능한 모델은 모델의 기본 키를 문자열로, 생성일을 UNIX 타임스탬프로 casting하는 `toSearchableArray` 메서드를 정의해야 합니다.

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

<!-- You should also define your Typesense collection schemas in your application's `config/scout.php` file. A collection schema describes the data types of each field that is searchable via Typesense. For more information on all available schema options, please consult the [Typesense documentation](https://typesense.org/docs/latest/api/collections.html#schema-parameters). -->
또한 애플리케이션의 `config/scout.php` 파일에 Typesense 컬렉션 스키마를 정의해야 합니다. 컬렉션 스키마는 Typesense를 통해 검색 가능한 각 필드의 데이터 타입을 설명합니다. 사용 가능한 모든 스키마 옵션에 대한 자세한 내용은 [Typesense documentation](https://typesense.org/docs/latest/api/collections.html#schema-parameters)를 참고하십시오.

<!-- If you need to change your Typesense collection's schema after it has been defined, you may either run `scout:flush` and `scout:import`, which will delete all existing indexed data and recreate the schema. Or, you may use Typesense's API to modify the collection's schema without removing any indexed data. -->
Typesense 컬렉션의 스키마를 정의한 후 변경해야 하는 경우, `scout:flush`와 `scout:import`를 실행할 수 있습니다. 이 방법은 기존에 인덱싱된 모든 데이터를 삭제하고 스키마를 다시 생성합니다. 또는 인덱싱된 데이터를 제거하지 않고 Typesense의 API를 사용하여 컬렉션의 스키마를 수정할 수도 있습니다.

<!-- If your searchable model is soft deletable, you should define a `__soft_deleted` field in the model's corresponding Typesense schema within your application's `config/scout.php` configuration file: -->
검색 가능한 모델이 소프트 삭제 가능하다면, 애플리케이션의 `config/scout.php` 설정 파일 안에서 해당 모델의 Typesense 스키마에 `__soft_deleted` 필드를 정의해야 합니다.

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

<a name="typesense-embeddings"></a>
<!-- #### Embeddings -->
#### Embeddings

<!-- To enable semantic and hybrid search, define an `embedding` setting and vector field in the model's Typesense configuration. By default, Scout uses the [Laravel AI SDK](/docs/13.x/ai-sdk) to generate embeddings: -->
시맨틱 검색과 하이브리드 검색을 활성화하려면 모델의 Typesense 설정에 `embedding` 설정과 벡터 필드를 정의해야 합니다. 기본적으로 Scout는 임베딩을 생성할 때 [Laravel AI SDK](/docs/13.x/ai-sdk)를 사용합니다:

```php
use App\Models\Article;

'model-settings' => [
    Article::class => [
        'collection-schema' => [
            'fields' => [
                ['name' => 'title', 'type' => 'string'],
                ['name' => 'embedding', 'type' => 'float[]', 'num_dim' => 1536],
            ],
        ],
        'search-parameters' => ['query_by' => 'title'],
        'embedding' => [
            'attribute' => 'embedding',
            'dimensions' => 1536,
        ],
    ],
],
```

<!-- Your model's `toSearchableEmbedding` method should return the source text that Scout should embed or a precomputed embedding array: -->
모델의 `toSearchableEmbedding` 메서드는 Scout가 임베딩할 원본 텍스트 또는 미리 계산된 임베딩 배열을 반환해야 합니다:

```php
public function toSearchableEmbedding(): string|array
{
    return $this->title.' '.$this->body;
}
```

<a name="typesense-dynamic-search-parameters"></a>
<!-- #### Dynamic Search Parameters -->
#### Dynamic Search Parameters

<!-- Typesense allows you to modify your [search parameters](https://typesense.org/docs/latest/api/search.html#search-parameters) dynamically when performing a search operation via the `options` method: -->
Typesense에서는 `options` 메서드를 통해 검색 작업을 수행할 때 [search parameters](https://typesense.org/docs/latest/api/search.html#search-parameters)를 동적으로 수정할 수 있습니다.

```php
use App\Models\Todo;

Todo::search('Groceries')->options([
    'query_by' => 'title, description'
])->get();
```

<a name="turbopuffer-configuration"></a>
<!-- ### Turbopuffer -->
### Turbopuffer

<!-- Turbopuffer requires a schema and searchable attributes for each model. Define them in the `model-settings` array of your `turbopuffer` configuration within the `scout` configuration file: -->
Turbopuffer는 각 모델에 스키마와 검색 가능한 속성이 필요합니다. 이를 `scout` 설정 파일의 `turbopuffer` 설정 내 `model-settings` 배열에 정의합니다.

```php
use App\Models\Article;

'turbopuffer' => [
    // ...
    'model-settings' => [
        Article::class => [
            'searchable-attributes' => [
                'title' => 3,
                'body' => 1,
            ],
            'schema' => [
                'title' => ['type' => 'string', 'full_text_search' => true],
                'body' => ['type' => 'string', 'full_text_search' => true],
                'status' => ['type' => 'string'],
            ],
        ],
    ],
],
```

<!-- The numeric values assigned to `searchable-attributes` are relative BM25 weights. In the example above, matches in the article title contribute three times the score of matches in the body. -->
`searchable-attributes`에 할당된 숫자 값은 상대적인 BM25 가중치입니다. 위 예시에서는 문서 제목의 일치 항목이 본문의 일치 항목보다 점수에 세 배 더 크게 기여합니다.

<!-- To enable semantic and hybrid search, add an `embedding` setting and vector schema to the model's configuration: -->
시맨틱 검색과 하이브리드 검색을 활성화하려면 모델 설정에 `embedding` 설정과 벡터 스키마를 추가합니다:

```php
'turbopuffer' => [
    // ...
    'model-settings' => [
        Article::class => [
            'searchable-attributes' => [
                'title' => 3,
                'body' => 1,
            ],
            'embedding' => [
                'attribute' => 'embedding',
                'dimensions' => 1536,
            ],
            'schema' => [
                'title' => ['type' => 'string', 'full_text_search' => true],
                'body' => ['type' => 'string', 'full_text_search' => true],
                'embedding' => ['type' => '[1536]f32', 'ann' => true],
            ],
        ],
    ],
],
```

<!-- Your model's `toSearchableEmbedding` method should return the source text that Scout should embed or a precomputed embedding array. Scout generates source-text embeddings using the [Laravel AI SDK](/docs/13.x/ai-sdk). -->
모델의 `toSearchableEmbedding` 메서드는 Scout가 임베딩할 원본 텍스트 또는 미리 계산된 임베딩 배열을 반환해야 합니다. Scout는 [Laravel AI SDK](/docs/13.x/ai-sdk)를 사용해 원본 텍스트의 임베딩을 생성합니다.

<!-- Alternatively, you may use Turbopuffer's native embeddings without installing the Laravel AI SDK or defining a `toSearchableEmbedding` method. Set the embedding driver to `turbopuffer` and configure an `embed` schema on the searchable source attribute: -->
또는 Laravel AI SDK를 설치하거나 `toSearchableEmbedding` 메서드를 정의하지 않고 Turbopuffer의 기본 임베딩을 사용할 수도 있습니다. 임베딩 드라이버를 `turbopuffer`로 설정하고 검색 가능한 소스 속성에 `embed` 스키마를 구성합니다:

```php
'embedding' => [
    'driver' => 'turbopuffer',
    'attribute' => 'embedding_text',
],

'schema' => [
    // ...
    'embedding_text' => [
        'type' => 'string',
        'embed' => [
            'model' => 'voyage/voyage-4',
            'dimensions' => 1024,
            'attribute' => 'embedding',
        ],
    ],
],
```

<!-- The source attribute must be included in the model's `toSearchableArray` output. -->
source 속성은 모델의 `toSearchableArray` 출력에 포함되어야 합니다.

<a name="indexing"></a>
<!-- ## Third-Party Engine Indexing -->
## Third-Party Engine Indexing

> [!NOTE]
> 이 섹션에서 설명하는 인덱싱 기능은 주로 서드파티 엔진(Algolia, Meilisearch, Typesense 또는 Turbopuffer)을 사용할 때 관련이 있습니다. 데이터베이스 엔진은 데이터베이스 테이블을 직접 검색하므로 인덱스를 수동으로 관리할 필요가 없습니다.

<a name="batch-import"></a>
<!-- ### Batch Import -->
### Batch Import

<!-- If you are installing Scout into an existing project, you may already have database records you need to import into your indexes. Scout provides a `scout:import` Artisan command that you may use to import all of your existing records into your search indexes: -->
기존 프로젝트에 Scout를 설치하는 경우, 이미 인덱스로 가져와야 하는 데이터베이스 레코드가 있을 수 있습니다. Scout는 기존 레코드를 검색 인덱스로 모두 가져오는 데 사용할 수 있는 `scout:import` Artisan 명령어를 제공합니다.

```shell
php artisan scout:import "App\Models\Post"
```

<!-- The `scout:queue-import` command may be used to import all of your existing records using [queued jobs](/docs/13.x/queues): -->
`scout:queue-import` 명령어를 사용하면 [queued jobs](/docs/13.x/queues)을 통해 기존 레코드를 모두 가져올 수 있습니다:

```shell
php artisan scout:queue-import "App\Models\Post" --chunk=500
```

<!-- The `flush` command may be used to remove all of a model's records from your search indexes: -->
`flush` 명령어는 모델의 모든 레코드를 검색 인덱스에서 제거하는 데 사용할 수 있습니다.

```shell
php artisan scout:flush "App\Models\Post"
```

<a name="modifying-the-import-query"></a>
<!-- #### Modifying the Import Query -->
#### Modifying the Import Query

<!-- If you would like to modify the query that is used to retrieve all of your models for batch importing, you may define a `makeAllSearchableUsing` method on your model. This is a great place to add any eager relationship loading that may be necessary before importing your models: -->
일괄 가져오기를 위해 모든 모델을 조회하는 데 사용되는 쿼리를 수정하고 싶다면, 모델에 `makeAllSearchableUsing` 메서드를 정의할 수 있습니다. 이 메서드는 모델을 가져오기 전에 필요한 연관관계를 즉시 로드하는 코드를 추가하기에 좋은 위치입니다.

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
> 큐를 사용해 모델을 일괄 가져오는 경우 `makeAllSearchableUsing` 메서드가 적용되지 않을 수 있습니다. 모델 컬렉션을 잡에서 처리할 때 연관관계는 [not restored](/docs/13.x/queues#handling-relationships) 상태입니다.

<a name="adding-records"></a>
<!-- ### Adding Records -->
### Adding Records

<!-- Once you have added the `Laravel\Scout\Searchable` trait to a model, all you need to do is `save` or `create` a model instance and it will automatically be added to your search index. If you have configured Scout to [use queues](#queueing) this operation will be performed in the background by your queue worker: -->
모델에 `Laravel\Scout\Searchable` trait을 추가한 후에는 모델 인스턴스를 `save`하거나 `create`하기만 하면 자동으로 검색 인덱스에 추가됩니다. Scout가 [use queues](#queueing)하도록 구성되어 있다면, 이 작업은 queue worker에 의해 백그라운드에서 수행됩니다.

```php
use App\Models\Order;

$order = new Order;

// ...

$order->save();
```

<a name="adding-records-via-query"></a>
<!-- #### Adding Records via Query -->
#### Adding Records via Query

<!-- If you would like to add a collection of models to your search index via an Eloquent query, you may chain the `searchable` method onto the Eloquent query. The `searchable` method will [chunk the results](/docs/13.x/eloquent#chunking-results) of the query and add the records to your search index. Again, if you have configured Scout to use queues, all of the chunks will be imported in the background by your queue workers: -->
Eloquent 쿼리를 통해 모델 컬렉션을 검색 인덱스에 추가하려면 Eloquent 쿼리에 `searchable` 메서드를 연결하면 됩니다. `searchable` 메서드는 쿼리 결과를 [chunk the results](/docs/13.x/eloquent#chunking-results)한 다음 레코드를 검색 인덱스에 추가합니다. Scout가 큐를 사용하도록 설정했다면 모든 청크는 큐 워커에 의해 백그라운드에서 가져와집니다.

```php
use App\Models\Order;

Order::where('price', '>', 100)->searchable();
```

<!-- You may also call the `searchable` method on an Eloquent relationship instance: -->
Eloquent 연관관계 인스턴스에서 `searchable` 메서드를 호출할 수도 있습니다.

```php
$user->orders()->searchable();
```

<!-- Or, if you already have a collection of Eloquent models in memory, you may call the `searchable` method on the collection instance to add the model instances to their corresponding index: -->
또는 이미 메모리에 Eloquent 모델 컬렉션이 있다면, 컬렉션 인스턴스에서 `searchable` 메서드를 호출하여 모델 인스턴스를 해당 인덱스에 추가할 수 있습니다.

```php
$orders->searchable();
```

> [!NOTE]
> `searchable` 메서드는 "upsert" 작업으로 볼 수 있습니다. 즉, 모델 레코드가 이미 인덱스에 있다면 업데이트되고, 검색 인덱스에 존재하지 않는다면 인덱스에 추가됩니다.

<a name="updating-records"></a>
<!-- ### Updating Records -->
### Updating Records

<!-- To update a searchable model, you only need to update the model instance's properties and `save` the model to your database. Scout will automatically persist the changes to your search index: -->
검색 가능한 모델을 업데이트하려면 모델 인스턴스의 속성을 업데이트한 후 모델을 데이터베이스에 `save`하기만 하면 됩니다. Scout는 변경 사항을 검색 인덱스에 자동으로 저장합니다.

```php
use App\Models\Order;

$order = Order::find(1);

// Update the order...

$order->save();
```

<!-- You may also invoke the `searchable` method on an Eloquent query instance to update a collection of models. If the models do not exist in your search index, they will be created: -->
Eloquent 쿼리 인스턴스에서 `searchable` 메서드를 호출하여 모델 컬렉션을 업데이트할 수도 있습니다. 모델이 검색 인덱스에 없다면 새로 생성됩니다.

```php
Order::where('price', '>', 100)->searchable();
```

<!-- If you would like to update the search index records for all of the models in a relationship, you may invoke the `searchable` on the relationship instance: -->
연관관계에 있는 모든 모델의 검색 인덱스 레코드를 업데이트하고 싶다면, 연관관계 인스턴스에서 `searchable`을 호출할 수 있습니다.

```php
$user->orders()->searchable();
```

<!-- Or, if you already have a collection of Eloquent models in memory, you may call the `searchable` method on the collection instance to update the model instances in their corresponding index: -->
또는 이미 메모리에 Eloquent 모델 컬렉션이 있다면, 컬렉션 인스턴스에서 `searchable` 메서드를 호출하여 해당 인덱스의 모델 인스턴스를 업데이트할 수 있습니다.

```php
$orders->searchable();
```

<a name="modifying-records-before-importing"></a>
<!-- #### Modifying Records Before Importing -->
#### Modifying Records Before Importing

<!-- Sometimes you may need to prepare the collection of models before they are made searchable. For instance, you may want to eager load a relationship so that the relationship data can be efficiently added to your search index. To accomplish this, define a `makeSearchableUsing` method on the corresponding model: -->
모델이 검색 가능해지기 전에 모델 컬렉션을 준비해야 하는 경우가 있습니다. 예를 들어 연관관계 데이터를 검색 인덱스에 효율적으로 추가할 수 있도록 연관관계를 즉시 로드하고 싶을 수 있습니다. 이를 위해 해당 모델에 `makeSearchableUsing` 메서드를 정의합니다.

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

<a name="conditionally-updating-the-search-index"></a>
<!-- #### Conditionally Updating the Search Index -->
#### Conditionally Updating the Search Index

<!-- By default, Scout will reindex an updated model regardless of which attributes were modified. If you would like to customize this behavior, you may define a `searchIndexShouldBeUpdated` method on your model: -->
기본적으로 Scout는 어떤 속성이 수정되었는지와 관계없이 업데이트된 모델을 다시 인덱싱합니다. 이 동작을 커스터마이즈하고 싶다면 모델에 `searchIndexShouldBeUpdated` 메서드를 정의할 수 있습니다.

```php
/**
 * Determine if the search index should be updated.
 */
public function searchIndexShouldBeUpdated(): bool
{
    return $this->wasRecentlyCreated || $this->wasChanged(['title', 'body']);
}
```

<a name="removing-records"></a>
<!-- ### Removing Records -->
### Removing Records

<!-- To remove a record from your index you may simply `delete` the model from the database. This may be done even if you are using [soft deleted](/docs/13.x/eloquent#soft-deleting) models: -->
인덱스에서 레코드를 제거하려면 데이터베이스에서 모델을 간단히 `delete`하면 됩니다. [soft deleted](/docs/13.x/eloquent#soft-deleting) 모델을 사용하는 경우에도 이렇게 할 수 있습니다.

```php
use App\Models\Order;

$order = Order::find(1);

$order->delete();
```

<!-- If you do not want to retrieve the model before deleting the record, you may use the `unsearchable` method on an Eloquent query instance: -->
레코드를 삭제하기 전에 모델을 조회하고 싶지 않다면, Eloquent 쿼리 인스턴스에서 `unsearchable` 메서드를 사용할 수 있습니다.

```php
Order::where('price', '>', 100)->unsearchable();
```

<!-- If you would like to remove the search index records for all of the models in a relationship, you may invoke the `unsearchable` on the relationship instance: -->
연관관계에 있는 모든 모델의 검색 인덱스 레코드를 제거하고 싶다면, 연관관계 인스턴스에서 `unsearchable`을 호출할 수 있습니다.

```php
$user->orders()->unsearchable();
```

<!-- Or, if you already have a collection of Eloquent models in memory, you may call the `unsearchable` method on the collection instance to remove the model instances from their corresponding index: -->
또는 이미 메모리에 Eloquent 모델 컬렉션이 있다면, 컬렉션 인스턴스에서 `unsearchable` 메서드를 호출하여 모델 인스턴스를 해당 인덱스에서 제거할 수 있습니다.

```php
$orders->unsearchable();
```

<!-- To remove all of the model records from their corresponding index, you may invoke the `removeAllFromSearch` method: -->
모델의 모든 레코드를 해당 인덱스에서 제거하려면 `removeAllFromSearch` 메서드를 호출할 수 있습니다.

```php
Order::removeAllFromSearch();
```

<a name="pausing-indexing"></a>
<!-- ### Pausing Indexing -->
### Pausing Indexing

<!-- Sometimes you may need to perform a batch of Eloquent operations on a model without syncing the model data to your search index. You may do this using the `withoutSyncingToSearch` method. This method accepts a single closure which will be immediately executed. Any model operations that occur within the closure will not be synced to the model's index: -->
모델 데이터를 검색 인덱스와 동기화하지 않고 모델에 대해 Eloquent 작업을 일괄 수행해야 하는 경우가 있습니다. 이때 `withoutSyncingToSearch` 메서드를 사용할 수 있습니다. 이 메서드는 즉시 실행될 단일 클로저를 인수로 받습니다. 클로저 안에서 발생하는 모든 모델 작업은 모델의 인덱스와 동기화되지 않습니다.

```php
use App\Models\Order;

Order::withoutSyncingToSearch(function () {
    // Perform model actions...
});
```

<a name="conditionally-searchable-model-instances"></a>
<!-- ### Conditionally Searchable Model Instances -->
### Conditionally Searchable Model Instances

<!-- Sometimes you may need to only make a model searchable under certain conditions. For example, imagine you have `App\Models\Post` model that may be in one of two states: "draft" and "published". You may only want to allow "published" posts to be searchable. To accomplish this, you may define a `shouldBeSearchable` method on your model: -->
특정 조건에서만 모델을 검색 가능하게 만들어야 하는 경우가 있습니다. 예를 들어 `App\Models\Post` 모델이 "draft"와 "published"라는 두 상태 중 하나일 수 있다고 가정해 보겠습니다. 이때 "published" 게시물만 검색 가능하도록 허용하고 싶을 수 있습니다. 이를 위해 모델에 `shouldBeSearchable` 메서드를 정의할 수 있습니다.

```php
/**
 * Determine if the model should be searchable.
 */
public function shouldBeSearchable(): bool
{
    return $this->isPublished();
}
```

<!-- The `shouldBeSearchable` method is only applied when manipulating models through the `save` and `create` methods, queries, or relationships. Directly making models or collections searchable using the `searchable` method will override the result of the `shouldBeSearchable` method. -->
`shouldBeSearchable` 메서드는 `save` 및 `create` 메서드, 쿼리 또는 연관관계를 통해 모델을 조작할 때만 적용됩니다. `searchable` 메서드를 사용하여 모델이나 컬렉션을 직접 검색 가능하게 만들면 `shouldBeSearchable` 메서드의 결과를 덮어씁니다.

> [!WARNING]
> `shouldBeSearchable` 메서드는 Scout의 "database" 엔진을 사용할 때는 적용되지 않습니다. 검색 가능한 모든 데이터가 항상 데이터베이스에 저장되기 때문입니다. database 엔진에서 비슷한 동작을 구현하려면 대신 [where clauses](#where-clauses)를 사용해야 합니다.

<a name="searching"></a>
<!-- ## Searching -->
## Searching

<!-- You may begin searching a model using the `search` method. The search method accepts a single string that will be used to search your models. You should then chain the `get` method onto the search query to retrieve the Eloquent models that match the given search query: -->
`search` 메서드를 사용하여 모델 검색을 시작할 수 있습니다. 검색 메서드는 모델 검색에 사용할 단일 문자열을 받습니다. 그런 다음 검색 쿼리에 `get` 메서드를 체이닝하여 주어진 검색 쿼리와 일치하는 Eloquent 모델을 조회해야 합니다.

```php
use App\Models\Order;

$orders = Order::search('Star Trek')->get();
```

<!-- Since Scout searches return a collection of Eloquent models, you may even return the results directly from a route or controller and they will automatically be converted to JSON: -->
Scout 검색은 Eloquent 모델 컬렉션을 반환하므로, 라우트나 컨트롤러에서 결과를 직접 반환할 수도 있으며 이 경우 자동으로 JSON으로 변환됩니다.

```php
use App\Models\Order;
use Illuminate\Http\Request;

Route::get('/search', function (Request $request) {
    return Order::search($request->search)->get();
});
```

<!-- If you would like to get the raw search results before they are converted to Eloquent models, you may use the `raw` method: -->
Eloquent 모델로 변환되기 전의 원시 검색 결과를 얻고 싶다면 `raw` 메서드를 사용할 수 있습니다.

```php
$orders = Order::search('Star Trek')->raw();
```

<a name="semantic-search"></a>
<!-- ### Semantic Search -->
### Semantic Search

<!-- The database, Meilisearch, Typesense, and Turbopuffer engines support semantic search, which matches records based on the meaning of a query. When Scout generates embeddings, semantic and hybrid searches require the [Laravel AI SDK](/docs/13.x/ai-sdk). [Typesense's native embeddings](#typesense-embeddings), [Turbopuffer's native embeddings](#turbopuffer-configuration), and precomputed query vectors do not require the Laravel AI SDK. -->
데이터베이스, Meilisearch, Typesense 및 Turbopuffer 엔진은 쿼리의 의미를 기반으로 레코드를 일치시키는 시맨틱 검색을 지원합니다. Scout가 임베딩을 생성하는 경우 시맨틱 검색과 하이브리드 검색에는 [Laravel AI SDK](/docs/13.x/ai-sdk)가 필요합니다. [Typesense's native embeddings](#typesense-embeddings), [Turbopuffer's native embeddings](#turbopuffer-configuration) 및 미리 계산된 쿼리 벡터에는 Laravel AI SDK가 필요하지 않습니다.

<!-- After configuring embeddings for the selected engine, invoke the `semantic` method on a search query: -->
선택한 엔진에 임베딩을 구성한 후, 검색 쿼리에 `semantic` 메서드를 호출합니다:

```php
$articles = Article::search('staying cool in the summer')
    ->semantic()
    ->get();
```

<!-- You may provide a minimum similarity threshold when supported by the selected engine: -->
선택한 엔진이 지원하는 경우 최소 유사도 임계값을 지정할 수 있습니다:

```php
$articles = Article::search('renewable energy storage')
    ->semantic(minSimilarity: 0.6)
    ->get();
```

<!-- To combine full-text and semantic search, use the `hybrid` method. Its first two arguments control the relative weights of text and semantic results: -->
전문 검색과 의미 기반 검색을 결합하려면 `hybrid` 메서드를 사용합니다. 처음 두 인수는 텍스트 결과와 의미 기반 결과의 상대적 가중치를 제어합니다:

```php
$articles = Article::search('renewable energy storage')
    ->hybrid(textWeight: 1, semanticWeight: 2)
    ->get();
```

<a name="custom-indexes"></a>
<!-- #### Custom Indexes -->
#### Custom Indexes

<!-- When searching using third-party engines, search queries will typically be performed on the index specified by the model's [searchableAs](#configuring-model-indexes) method. However, you may use the `within` method to specify a custom index that should be searched instead: -->
서드파티 엔진을 사용하여 검색할 때, 검색 쿼리는 일반적으로 모델의 [searchableAs](#configuring-model-indexes) 메서드에 지정된 인덱스에서 수행됩니다. 하지만 `within` 메서드를 사용하여 대신 검색할 사용자 지정 인덱스를 지정할 수 있습니다.

```php
$orders = Order::search('Star Trek')
    ->within('tv_shows_popularity_desc')
    ->get();
```

<a name="where-clauses"></a>
<!-- ### Where Clauses -->
### Where Clauses

<!-- Scout allows you to add "where" clauses to your search queries. For example, basic equality checks are useful for scoping search queries by an owner ID: -->
Scout를 사용하면 검색 쿼리에 "where" 절을 추가할 수 있습니다. 예를 들어, 기본적인 동등성 검사는 소유자 ID를 기준으로 검색 쿼리의 범위를 제한할 때 유용합니다.

```php
use App\Models\Order;

$orders = Order::search('Star Trek')->where('user_id', 1)->get();
```

<!-- You may also use the `=`, `!=`, `<`, `>`, `>=`, `<=` comparison operators to build more advanced queries: -->
더 고급 쿼리를 만들기 위해 `=`, `!=`, `<`, `>`, `>=`, `<=` 비교 연산자도 사용할 수 있습니다.

```php
Order::search('Star Trek')
  ->where('status', '=', 'completed')
  ->where('is_refunded', '!=', true)
  ->where('total_price', '>', 100)
  ->where('shipping_cost', '<', 20)
  ->where('discount_percent', '>=', 10)
  ->where('item_count', '<=', 5)
  ->get();
```

<!-- In addition, the `whereIn` method may be used to verify that a given column's value is contained within the given array: -->
또한 `whereIn` 메서드를 사용하여 주어진 컬럼의 값이 지정된 배열 안에 포함되어 있는지 확인할 수 있습니다.

```php
$orders = Order::search('Star Trek')->whereIn(
    'status', ['open', 'paid']
)->get();
```

<!-- The `whereNotIn` method verifies that the given column's value is not contained in the given array: -->
`whereNotIn` 메서드는 주어진 컬럼의 값이 지정된 배열 안에 포함되어 있지 않은지 확인합니다.

```php
$orders = Order::search('Star Trek')->whereNotIn(
    'status', ['closed']
)->get();
```

> [!WARNING]
> 애플리케이션에서 Meilisearch를 사용한다면 Scout의 "where" 절을 사용하기 전에 애플리케이션의 [filterable attributes](#meilisearch-index-settings)를 구성해야 합니다.

<a name="customizing-the-eloquent-results-query"></a>
<!-- #### Customizing the Eloquent Results Query -->
#### Customizing the Eloquent Results Query

<!-- After Scout retrieves a list of matching Eloquent models from your application's search engine, Eloquent is used to retrieve all of the matching models by their primary keys. You may customize this query by invoking the `query` method. The `query` method accepts a closure that will receive the Eloquent query builder instance as an argument: -->
Scout가 애플리케이션의 검색 엔진에서 일치하는 Eloquent 모델 목록을 가져온 뒤에는, Eloquent가 해당 모델의 기본 키를 사용하여 일치하는 모든 모델을 조회합니다. 이 쿼리는 `query` 메서드를 호출하여 커스터마이징할 수 있습니다. `query` 메서드는 Eloquent 쿼리 빌더 인스턴스를 인수로 받는 클로저를 전달받습니다.

```php
use App\Models\Order;
use Illuminate\Database\Eloquent\Builder;

$orders = Order::search('Star Trek')
    ->query(fn (Builder $query) => $query->with('invoices'))
    ->get();
```

<!-- When using a third-party engine, this callback is invoked after the relevant models have already been retrieved from the search engine, so it should not be used for "filtering" results — use [Scout where clauses](#where-clauses) instead. However, when using the database engine, the `query` method's constraints are applied directly to the database query, so you may use it for filtering as well. -->
서드파티 엔진을 사용할 때 이 콜백은 관련 모델이 검색 엔진에서 이미 조회된 후에 호출되므로, 결과를 "필터링"하는 용도로 사용해서는 안 됩니다. 대신 [Scout where clauses](#where-clauses)을 사용하십시오. 하지만 데이터베이스 엔진을 사용하는 경우에는 `query` 메서드의 제약 조건이 데이터베이스 쿼리에 직접 적용되므로, 필터링 용도로도 사용할 수 있습니다.

<a name="pagination"></a>
<!-- ### Pagination -->
### Pagination

<!-- In addition to retrieving a collection of models, you may paginate your search results using the `paginate` method. This method will return an `Illuminate\Pagination\LengthAwarePaginator` instance just as if you had [paginated a traditional Eloquent query](/docs/13.x/pagination): -->
모델 컬렉션을 가져오는 것뿐만 아니라 `paginate` 메서드를 사용해 검색 결과를 페이지네이션할 수도 있습니다. 이 메서드는 기존 [paginated a traditional Eloquent query](/docs/13.x/pagination)와 마찬가지로 `Illuminate\Pagination\LengthAwarePaginator` 인스턴스를 반환합니다:

```php
use App\Models\Order;

$orders = Order::search('Star Trek')->paginate();
```

<!-- You may specify how many models to retrieve per page by passing the amount as the first argument to the `paginate` method: -->
`paginate` 메서드의 첫 번째 인수로 개수를 전달하면 페이지마다 조회할 모델 수를 지정할 수 있습니다.

```php
$orders = Order::search('Star Trek')->paginate(15);
```

<!-- When using the database engine, you may also use the `simplePaginate` method. Unlike `paginate`, which retrieves the total number of matching records so it can display page numbers, `simplePaginate` only determines whether there are more results beyond the current page — making it more efficient for large datasets where you only need "previous" and "next" links: -->
데이터베이스 엔진을 사용할 때는 `simplePaginate` 메서드도 사용할 수 있습니다. `paginate`는 페이지 번호를 표시할 수 있도록 일치하는 레코드의 전체 개수를 조회하지만, `simplePaginate`는 현재 페이지 이후에 더 많은 결과가 있는지만 확인합니다. 따라서 "이전" 및 "다음" 링크만 필요할 때, 대용량 데이터셋에서 더 효율적입니다.

```php
$orders = Order::search('Star Trek')->simplePaginate(15);
```

<!-- Once you have retrieved the results, you may display the results and render the page links using [Blade](/docs/13.x/blade) just as if you had paginated a traditional Eloquent query: -->
결과를 가져온 후에는 기존 Eloquent 쿼리를 페이지네이션한 것처럼 [Blade](/docs/13.x/blade)를 사용해 결과를 표시하고 페이지 링크를 렌더링할 수 있습니다:

```html
<div class="container">
    @foreach ($orders as $order)
        {{ $order->price }}
    @endforeach
</div>

{{ $orders->links() }}
```

<!-- Of course, if you would like to retrieve the pagination results as JSON, you may return the paginator instance directly from a route or controller: -->
물론 페이지네이션 결과를 JSON으로 조회하고 싶다면, 라우트나 컨트롤러에서 paginator 인스턴스를 직접 반환하면 됩니다.

```php
use App\Models\Order;
use Illuminate\Http\Request;

Route::get('/orders', function (Request $request) {
    return Order::search($request->input('query'))->paginate(15);
});
```

> [!WARNING]
> 검색 엔진은 Eloquent 모델의 전역 스코프 정의를 인식하지 못하므로 Scout 페이지네이션을 사용하는 애플리케이션에서는 전역 스코프를 사용하지 않아야 합니다. 또는 Scout를 통해 검색할 때 전역 스코프의 제약 조건을 다시 적용해야 합니다.

<a name="soft-deleting"></a>
<!-- ### Soft Deleting -->
### Soft Deleting

<!-- If your indexed models are [soft deleting](/docs/13.x/eloquent#soft-deleting) and you need to search your soft deleted models, set the `soft_delete` option of the `config/scout.php` configuration file to `true`: -->
인덱싱한 모델이 [soft deleting](/docs/13.x/eloquent#soft-deleting)를 사용하며 소프트 삭제된 모델을 검색해야 한다면 `config/scout.php` 설정 파일의 `soft_delete` 옵션을 `true`로 설정합니다.

```php
'soft_delete' => true,
```

<!-- When this configuration option is `true`, Scout will not remove soft deleted models from the search index. Instead, it will set a hidden `__soft_deleted` attribute on the indexed record. Then, you may use the `withTrashed` or `onlyTrashed` methods to retrieve the soft deleted records when searching: -->
이 설정 옵션이 `true`이면 Scout는 소프트 삭제된 모델을 검색 인덱스에서 제거하지 않습니다. 대신 인덱싱된 레코드에 숨겨진 `__soft_deleted` 속성을 설정합니다. 그런 다음 검색할 때 `withTrashed` 또는 `onlyTrashed` 메서드를 사용하여 소프트 삭제된 레코드를 조회할 수 있습니다.

```php
use App\Models\Order;

// Include trashed records when retrieving results...
$orders = Order::search('Star Trek')->withTrashed()->get();

// Only include trashed records when retrieving results...
$orders = Order::search('Star Trek')->onlyTrashed()->get();
```

> [!NOTE]
> 소프트 삭제된 모델을 `forceDelete`로 영구 삭제하면 Scout가 검색 인덱스에서 자동으로 제거합니다.

<a name="customizing-engine-searches"></a>
<!-- ### Customizing Engine Searches -->
### Customizing Engine Searches

<!-- If you need to perform advanced customization of the search behavior of an engine you may pass a closure as the second argument to the `search` method. For example, you could use this callback to add geo-location data to your search options before the search query is passed to Algolia: -->
엔진의 검색 동작을 더 세밀하게 커스터마이징해야 한다면 `search` 메서드의 두 번째 인수로 클로저를 전달할 수 있습니다. 예를 들어, 검색 쿼리가 Algolia로 전달되기 전에 이 콜백을 사용하여 검색 옵션에 지리 위치 데이터를 추가할 수 있습니다.

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

<a name="custom-engines"></a>
<!-- ## Custom Engines -->
## Custom Engines

<a name="writing-the-engine"></a>
<!-- #### Writing the Engine -->
#### Writing the Engine

<!-- If one of the built-in Scout search engines doesn't fit your needs, you may write your own custom engine and register it with Scout. Your engine should extend the `Laravel\Scout\Engines\Engine` abstract class. This abstract class contains eight methods your custom engine must implement: -->
내장된 Scout 검색 엔진 중 요구 사항에 맞는 것이 없다면, 직접 사용자 정의 엔진을 작성하고 Scout에 등록할 수 있습니다. 엔진은 `Laravel\Scout\Engines\Engine` 추상 클래스를 확장해야 합니다. 이 추상 클래스에는 사용자 정의 엔진이 반드시 구현해야 하는 여덟 개의 메서드가 포함되어 있습니다.

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

<!-- You may find it helpful to review the implementations of these methods on the `Laravel\Scout\Engines\AlgoliaEngine` class. This class will provide you with a good starting point for learning how to implement each of these methods in your own engine. -->
`Laravel\Scout\Engines\AlgoliaEngine` 클래스에서 이 메서드들이 어떻게 구현되어 있는지 살펴보면 도움이 될 수 있습니다. 이 클래스는 직접 엔진을 구현할 때 각 메서드를 어떻게 작성해야 하는지 배우기 위한 좋은 출발점이 됩니다.

<a name="registering-the-engine"></a>
<!-- #### Registering the Engine -->
#### Registering the Engine

<!-- Once you have written your custom engine, you may register it with Scout using the `extend` method of the Scout engine manager. Scout's engine manager may be resolved from the Laravel service container. You should call the `extend` method from the `boot` method of your `App\Providers\AppServiceProvider` class or any other service provider used by your application: -->
사용자 정의 엔진을 작성한 뒤에는 Scout 엔진 매니저의 `extend` 메서드를 사용하여 Scout에 등록할 수 있습니다. Scout의 엔진 매니저는 Laravel 서비스 컨테이너에서 resolve할 수 있습니다. `extend` 메서드는 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드나 애플리케이션에서 사용하는 다른 서비스 프로바이더에서 호출해야 합니다.

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

<!-- Once your engine has been registered, you may specify it as your default Scout `driver` in your application's `config/scout.php` configuration file: -->
엔진을 등록한 후에는 애플리케이션의 `config/scout.php` 설정 파일에서 기본 Scout `driver`로 지정할 수 있습니다.

```php
'driver' => 'mysql',
```
