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
[Laravel Scout](https://github.com/laravel/scout) は、[Eloquent models](/docs/13.x/eloquent) に全文検索を追加するための、シンプルなドライバベースのソリューションを提供します。モデルオブザーバを使用すると、Scout が検索インデックスと Eloquent のレコードを自動的に同期します。

<!-- Scout ships with a built-in `database` engine that uses MySQL / PostgreSQL full-text indexes and `LIKE` clauses to search your existing database — no external service required. For most applications, this is all you need. For an overview of all search options available in Laravel, consult the [search documentation](/docs/13.x/search). -->
Scout には、MySQL / PostgreSQL の全文検索インデックスと `LIKE` 句を使って既存のデータベースを検索する、組み込みの `database` エンジンが用意されています。外部サービスは必要ありません。ほとんどのアプリケーションでは、これだけで十分です。Laravel で利用できる検索オプションの概要については、[search documentation](/docs/13.x/search)を参照してください。

<!-- Scout also includes drivers for [Algolia](https://www.algolia.com/), [Meilisearch](https://www.meilisearch.com), [Typesense](https://typesense.org), and [Turbopuffer](https://turbopuffer.com) when you need features like typo tolerance, faceted filtering, vector search, or geo-search at massive scale. A "collection" driver is also available for local development, and you are free to write [custom engines](#custom-engines) as well. -->
Scout には、非常に大規模な環境でのタイプミス耐性、ファセットフィルタリング、ベクトル検索、地理検索などの機能が必要な場合に利用できる [Algolia](https://www.algolia.com/)、[Meilisearch](https://www.meilisearch.com)、[Typesense](https://typesense.org)、[Turbopuffer](https://turbopuffer.com) 用のドライバも含まれています。ローカル開発用には「コレクション」ドライバも利用でき、[custom engines](#custom-engines) を自由に作成することもできます。

<a name="installation"></a>
<!-- ## Installation -->
## Installation

<!-- First, install Scout via the Composer package manager: -->
まず、Composer パッケージ マネージャーを介して Scout をインストールします。

```shell
composer require laravel/scout
```

<!-- After installing Scout, you should publish the Scout configuration file using the `vendor:publish` Artisan command. This command will publish the `scout.php` configuration file to your application's `config` directory: -->
Scout をインストールした後、`vendor:publish` Artisan コマンドを使用して Scout 構成ファイルを公開する必要があります。このコマンドは、`scout.php` 構成ファイルをアプリケーションの `config` ディレクトリに公開します。

```shell
php artisan vendor:publish --provider="Laravel\Scout\ScoutServiceProvider"
```

<!-- Finally, add the `Laravel\Scout\Searchable` trait to the model you would like to make searchable. This trait will register a model observer that will automatically keep the model in sync with your search driver: -->
最後に、検索可能にしたいモデルに `Laravel\Scout\Searchable` トレイトを追加します。このトレイトは、モデルと検索ドライバの同期を自動的に維持するモデル オブザーバを登録します。

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
`database` エンジンまたは `collection` エンジン以外のエンジンを使用する場合は、ライブラリを使用する前に [queue driver](/docs/13.x/queues) を設定することを強くおすすめします。キューワーカーを実行すると、モデルの情報を検索インデックスに同期するすべての処理を Scout のキューに入れられるため、アプリケーションのWebインターフェイスのレスポンスタイムを大幅に改善できます。

<!-- Once you have configured a queue driver, set the value of the `queue` option in your `config/scout.php` configuration file to `true`: -->
キュードライバを構成したら、`config/scout.php` 構成ファイルの `queue` オプションの値を `true` に設定します。

```php
'queue' => true,
```

<!-- Even when the `queue` option is set to `false`, it's important to remember that some Scout drivers like Algolia and Meilisearch always index records asynchronously. In other words, even though the index operation has completed within your Laravel application, the search engine itself may not reflect the new and updated records immediately. -->
`queue` オプションが `false` に設定されている場合でも、Algolia や Meil​​isearch などの一部の Scout ドライバは常に非同期でレコードのインデックスを作成することに留意することが重要です。言い換えれば、Laravel アプリケーション内でインデックス操作が完了したとしても、検索エンジン自体には新しいレコードや更新されたレコードがすぐに反映されない可能性があります。

<!-- To specify the connection and queue that your Scout jobs utilize, you may define the `queue` configuration option as an array: -->
Scout ジョブが使用する接続とキューを指定するには、`queue` 構成オプションを配列として定義できます。

```php
'queue' => [
    'connection' => 'redis',
    'queue' => 'scout'
],
```

<!-- Of course, if you customize the connection and queue that Scout jobs utilize, you should run a queue worker to process jobs on that connection and queue: -->
もちろん、Scout ジョブが使用する接続とキューをカスタマイズする場合は、キューワーカーを実行して、その接続とキューでジョブを処理する必要があります。

```shell
php artisan queue:work redis --queue=scout
```

<a name="unique-jobs"></a>
<!-- #### Unique Jobs -->
#### Unique Jobs

<!-- In write-heavy applications, you may wish to prevent Scout from queueing duplicate jobs for the same model records. You may opt into unique indexing jobs by registering the `MakeSearchableUniquely` and `RemoveFromSearchUniquely` job classes, typically within the `boot` method of a service provider: -->
書き込みの多いアプリケーションでは、同じモデルレコードに対して Scout が重複したジョブをキューに入れるのを防ぎたい場合があります。`MakeSearchableUniquely` と `RemoveFromSearchUniquely` のジョブクラスを、通常はサービスプロバイダの `boot` メソッド内で登録することで、ユニークなインデックス作成ジョブを有効にできます。

```php
use Laravel\Scout\Jobs\MakeSearchableUniquely;
use Laravel\Scout\Jobs\RemoveFromSearchUniquely;
use Laravel\Scout\Scout;

Scout::makeSearchableUsing(MakeSearchableUniquely::class);
Scout::removeFromSearchUsing(RemoveFromSearchUniquely::class);
```

<!-- These jobs use Laravel's [unique job locks](/docs/13.x/queues#unique-jobs) to avoid dispatching duplicate queued indexing operations for the same searchable model records while a matching job is already queued. -->
これらのジョブは Laravel の [unique job locks](/docs/13.x/queues#unique-jobs) を使用し、対応するジョブがすでにキューに入っている間、同じ検索可能なモデルレコードに対する重複したインデックス作成操作がディスパッチされるのを防ぎます。

<a name="driver-prerequisites"></a>
<!-- ## Driver Prerequisites -->
## Driver Prerequisites

<a name="algolia"></a>
<!-- ### Algolia -->
### Algolia

<!-- When using the Algolia driver, you should configure your Algolia `id` and `secret` credentials in your `config/scout.php` configuration file. Once your credentials have been configured, you will also need to install the Algolia PHP SDK via the Composer package manager: -->
Algolia ドライバを使用する場合は、`config/scout.php` 構成ファイルで Algolia `id` および `secret` 資格情報を構成する必要があります。認証情報を設定したら、Composer パッケージ マネージャーを介して Algolia PHP SDK をインストールする必要もあります。

```shell
composer require algolia/algoliasearch-client-php
```

<a name="meilisearch"></a>
<!-- ### Meilisearch -->
### Meilisearch

<!-- [Meilisearch](https://www.meilisearch.com) is a fast, open source search engine. If you aren't sure how to install Meilisearch on your local machine, you may use [Laravel Sail](/docs/13.x/sail#meilisearch), Laravel's officially supported Docker development environment. -->
[Meilisearch](https://www.meilisearch.com) は高速なオープンソース検索エンジンです。ローカルマシンへの Meilisearch のインストール方法がわからない場合は、Laravel が公式にサポートしている Docker 開発環境の [Laravel Sail](/docs/13.x/sail#meilisearch) を使用できます。

<!-- When using the Meilisearch driver you will need to install the Meilisearch PHP SDK via the Composer package manager: -->
Meilisearch ドライバを使用する場合は、Composer パッケージ マネージャーを介して Meil​​isearch PHP SDK をインストールする必要があります。

```shell
composer require meilisearch/meilisearch-php http-interop/http-factory-guzzle
```

<!-- Then, set the `SCOUT_DRIVER` environment variable as well as your Meilisearch `host` and `key` credentials within your application's `.env` file: -->
次に、アプリケーションの `.env` ファイル内で、`SCOUT_DRIVER` 環境変数と Meil​​isearch `host` および `key` 資格情報を設定します。

```ini
SCOUT_DRIVER=meilisearch
MEILISEARCH_HOST=http://127.0.0.1:7700
MEILISEARCH_KEY=masterKey
```

<!-- For more information regarding Meilisearch, please consult the [Meilisearch documentation](https://docs.meilisearch.com/learn/getting_started/quick_start.html). -->
Meilisearch の詳細については、[Meilisearch documentation](https://docs.meilisearch.com/learn/getting_started/quick_start.html) を参照してください。

<!-- In addition, you should ensure that you install a version of `meilisearch/meilisearch-php` that is compatible with your Meilisearch binary version by reviewing [Meilisearch's documentation regarding binary compatibility](https://github.com/meilisearch/meilisearch-php#-compatibility-with-meilisearch). -->
さらに、[Meilisearch's documentation regarding binary compatibility](https://github.com/meilisearch/meilisearch-php#-compatibility-with-meilisearch) を確認して、Meilisearch バイナリ バージョンと互換性のある `meilisearch/meilisearch-php` のバージョンをインストールしていることを確認する必要があります。

> [!WARNING]
> Meilisearch を利用するアプリケーションで Scout をアップグレードする場合は、Meilisearch サービス自体に関する [review any additional breaking changes](https://github.com/meilisearch/Meilisearch/releases) も必ず確認してください。

<a name="typesense"></a>
<!-- ### Typesense -->
### Typesense

<!-- [Typesense](https://typesense.org) is a lightning-fast, open source search engine and supports keyword search, semantic search, geo search, and vector search. -->
[Typesense](https://typesense.org) は超高速のオープンソース検索エンジンで、キーワード検索、セマンティック検索、地理検索、ベクトル検索をサポートしています。

<!-- You can [self-host](https://typesense.org/docs/guide/install-typesense.html#option-2-local-machine-self-hosting) Typesense or use [Typesense Cloud](https://cloud.typesense.org). -->
[self-host](https://typesense.org/docs/guide/install-typesense.html#option-2-local-machine-self-hosting) Typesense または [Typesense Cloud](https://cloud.typesense.org) を使用できます。

<!-- To get started using Typesense with Scout, install the Typesense PHP SDK via the Composer package manager: -->
Scout で Typesense の使用を開始するには、Composer パッケージ マネージャーを介して Typesense PHP SDK をインストールします。

```shell
composer require typesense/typesense-php
```

<!-- Then, set the `SCOUT_DRIVER` environment variable as well as your Typesense host and API key credentials within your application's .env file: -->
次に、アプリケーションの .env ファイル内で `SCOUT_DRIVER` 環境変数と Typesense ホストおよび API キーの資格情報を設定します。

```ini
SCOUT_DRIVER=typesense
TYPESENSE_API_KEY=masterKey
TYPESENSE_HOST=localhost
```

<!-- If you are using [Laravel Sail](/docs/13.x/sail), you may need to adjust the `TYPESENSE_HOST` environment variable to match the Docker container name. You may also optionally specify your installation's port, path, and protocol: -->
[Laravel Sail](/docs/13.x/sail) を使用している場合は、Docker コンテナ名に合わせて `TYPESENSE_HOST` 環境変数を調整する必要がある場合があります。また、インストール時のポート、パス、プロトコルを指定することもできます。

```ini
TYPESENSE_PORT=8108
TYPESENSE_PATH=
TYPESENSE_PROTOCOL=http
```

<!-- Additional settings and schema definitions for your Typesense collections can be found within your application's `config/scout.php` configuration file. For more information regarding Typesense, please consult the [Typesense documentation](https://typesense.org/docs/guide/#quick-start). -->
Typesense コレクションの追加の設定とスキーマ定義は、アプリケーションの `config/scout.php` 構成ファイル内にあります。 Typesense の詳細については、[Typesense documentation](https://typesense.org/docs/guide/#quick-start) を参照してください。

<a name="turbopuffer"></a>
<!-- ### Turbopuffer -->
### Turbopuffer

<!-- [Turbopuffer](https://turbopuffer.com) is a search engine that supports full-text, semantic, and hybrid search. To use the Turbopuffer driver, set the `SCOUT_DRIVER` environment variable and provide your Turbopuffer API key: -->
[Turbopuffer](https://turbopuffer.com) は、全文検索、セマンティック検索、ハイブリッド検索をサポートする検索エンジンです。Turbopuffer ドライバを使用するには、`SCOUT_DRIVER` 環境変数を設定し、Turbopuffer の API キーを指定してください。

```ini
SCOUT_DRIVER=turbopuffer
TURBOPUFFER_API_KEY=tpuf_...
TURBOPUFFER_REGION=gcp-us-central1
```

<!-- The `TURBOPUFFER_REGION` environment variable is optional and defaults to `gcp-us-central1`. -->
`TURBOPUFFER_REGION` 環境変数は省略可能で、デフォルト値は `gcp-us-central1` です。

<a name="configuration"></a>
<!-- ## Configuration -->
## Configuration

<a name="configuring-searchable-data"></a>
<!-- ### Configuring Searchable Data -->
### Configuring Searchable Data

<!-- By default, the entire `toArray` form of a given model will be persisted to its search index. If you would like to customize the data that is synchronized to the search index, you may override the `toSearchableArray` method on the model: -->
デフォルトでは、特定のモデルの `toArray` フォーム全体が検索インデックスに保存されます。検索インデックスに同期されるデータをカスタマイズしたい場合は、モデルの `toSearchableArray` メソッドをオーバーライドできます。

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
検索する場合、Scout は通常、アプリケーションの `scout` 構成ファイルで指定されたデフォルトの検索エンジンを使用します。ただし、特定のモデルの検索エンジンは、モデルの `searchableUsing` メソッドをオーバーライドすることで変更できます。

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
> 現在、データベースエンジンは MySQL と PostgreSQL をサポートしており、どちらも高速な全文カラムインデックスをサポートしています。

<!-- The `database` engine uses MySQL / PostgreSQL full-text indexes and `LIKE` clauses to search your existing database directly. For many applications, this is the simplest and most practical way to add search — no external service or additional infrastructure required. -->
`database` エンジンは、MySQL / PostgreSQL フルテキスト インデックスと `LIKE` 句を使用して、既存のデータベースを直接検索します。多くのアプリケーションにとって、これは検索を追加する最も簡単で実用的な方法であり、外部サービスや追加のインフラストラクチャは必要ありません。

<!-- To use the database engine, set the `SCOUT_DRIVER` environment variable to `database`: -->
データベース エンジンを使用するには、`SCOUT_DRIVER` 環境変数を `database` に設定します。

```ini
SCOUT_DRIVER=database
```

<!-- Once configured, you may [define your searchable data](#configuring-searchable-data) and start [executing search queries](#searching) against your models. Unlike third-party engines, the database engine requires no separate indexing step — it searches your database tables directly. -->
構成が完了したら、[define your searchable data](#configuring-searchable-data) を実行し、モデルに対して [executing search queries](#searching) を開始できます。サードパーティ エンジンとは異なり、データベース エンジンは個別のインデックス作成手順を必要とせず、データベース テーブルを直接検索します。

<a name="database-semantic-and-hybrid-search"></a>
<!-- #### Semantic and Hybrid Search -->
#### Semantic and Hybrid Search

<!-- The database engine supports semantic and hybrid search when using PostgreSQL with the `pgvector` extension. To get started, add a nullable vector column and a full-text index to your model's table. The vector column must be nullable because Scout stores the embedding after the model has been persisted: -->
データベースエンジンは、`pgvector` 拡張機能を使用した PostgreSQL で、セマンティック検索とハイブリッド検索をサポートしています。まず、モデルのテーブルに NULL を許容するベクターカラムと全文検索インデックスを追加します。モデルが保存された後に Scout が埋め込みを保存するため、ベクターカラムは NULL を許容しなければなりません。

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
次に、モデルに `toSearchableEmbedding` メソッドを定義します。このメソッドは、Scoutが埋め込むソーステキスト、または事前計算した埋め込み配列を返します。Scoutはデフォルトで埋め込みを `embedding` カラムに保存します。別のカラムを使用するには、モデルに `searchableEmbeddingColumn` メソッドを定義してください。

<!-- #### Customizing Database Searching Strategies -->
#### Customizing Database Searching Strategies

<!-- By default, the database engine will execute a `LIKE` query against every model attribute that you have [configured as searchable](#configuring-searchable-data). However, you can assign more efficient search strategies to specific columns. The `SearchUsingFullText` attribute will use your database's full-text index for that column, while `SearchUsingPrefix` will only match the beginning of strings (`example%`) instead of searching within the entire string (`%example%`). -->
デフォルトでは、データベース エンジンは、[configured as searchable](#configuring-searchable-data) を持つすべてのモデル属性に対して `LIKE` クエリを実行します。ただし、より効率的な検索戦略を特定の列に割り当てることができます。 `SearchUsingFullText` 属性はその列に対してデータベースのフルテキスト インデックスを使用しますが、`SearchUsingPrefix` は文字列全体 (`%example%`) 内を検索するのではなく、文字列の先頭 (`example%`) のみに一致します。

<!-- To define this behavior, assign PHP attributes to your model's `toSearchableArray` method. Any columns without an attribute will continue to use the default `LIKE` strategy: -->
この動作を定義するには、モデルの `toSearchableArray` メソッドに PHP 属性を割り当てます。属性のない列は、引き続きデフォルトの `LIKE` 戦略を使用します。

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
> カラムでフルテキストクエリの制約を使用するよう指定する前に、そのカラムに [full text index](/docs/13.x/migrations#available-index-types) が割り当てられていることを確認してください。

<a name="collection-engine"></a>
<!-- ### Collection Engine -->
### Collection Engine

<!-- The "collection" engine is intended for quick prototypes, extremely small datasets (a few hundred records), or running tests. It retrieves all possible records from your database and uses Laravel's `Str::is` helper to filter them in PHP, so it does not require any indexing or database-specific features. For anything beyond trivial use cases, you should use the [database engine](#database-engine) instead. -->
「コレクション」エンジンは、迅速なプロトタイプ、非常に小さなデータセット (数百レコード)、またはテストの実行を目的としています。データベースからすべての可能なレコードを取得し、Laravel の `Str::is` ヘルパを使用してそれらを PHP でフィルタリングするため、インデックス作成やデータベース固有の機能は必要ありません。些細な使用例を超える場合は、代わりに [database engine](#database-engine) を使用する必要があります。

<!-- To use the collection engine, you may simply set the value of the `SCOUT_DRIVER` environment variable to `collection`, or specify the `collection` driver directly in your application's `scout` configuration file: -->
収集エンジンを使用するには、単に `SCOUT_DRIVER` 環境変数の値を `collection` に設定するか、アプリケーションの `scout` 構成ファイルで `collection` ドライバを直接指定します。

```ini
SCOUT_DRIVER=collection
```

<!-- Once you have specified the collection driver as your preferred driver, you may start [executing search queries](#searching) against your models. Search engine indexing, such as the indexing needed to seed Algolia, Meilisearch, or Typesense indexes, is unnecessary when using the collection engine. -->
コレクション ドライバを優先ドライバとして指定したら、モデルに対して [executing search queries](#searching) を開始できます。コレクション エンジンを使用する場合、Algolia、Meilisearch、または Typesense インデックスのシードに必要なインデックス作成などの検索エンジンのインデックス作成は不要です。

<!-- #### Differences From Database Engine -->
#### Differences From Database Engine

<!-- While the database engine uses full-text indexes and `LIKE` clauses to find matching records efficiently, the collection engine pulls all records and filters them in PHP. The collection engine is the most portable option as it works across all relational databases supported by Laravel (including SQLite and SQL Server); however, it is significantly less efficient than the database engine and should not be used with large datasets. -->
データベース エンジンはフルテキスト インデックスと `LIKE` 句を使用して一致するレコードを効率的に検索しますが、コレクション エンジンはすべてのレコードを取得し、PHP でフィルタリングします。コレクション エンジンは、Laravel でサポートされるすべてのリレーショナル データベース (SQLite および SQL Server を含む) で動作するため、最も移植性の高いオプションです。ただし、データベース エンジンよりも効率が大幅に低いため、大規模なデータセットでは使用しないでください。

<a name="third-party-engine-configuration"></a>
<!-- ## Third-Party Engine Configuration -->
## Third-Party Engine Configuration

<!-- The following configuration options are only relevant when using a third-party search engine such as Algolia, Meilisearch, or Typesense. If you are using the [database engine](#database-engine), you may skip this section. -->
次の構成オプションは、Algolia、Meilisearch、Typesense などのサードパーティの検索エンジンを使用する場合にのみ関係します。 [database engine](#database-engine) を使用している場合は、このセクションをスキップしてください。

<a name="configuring-model-indexes"></a>
<!-- ### Configuring Model Indexes -->
### Configuring Model Indexes

<!-- When using a third-party engine, each Eloquent model is synced with a given search "index", which contains all of the searchable records for that model. By default, each model will be persisted to an index matching the model's typical "table" name. Typically, this is the plural form of the model name; however, you are free to customize the model's index by overriding the `searchableAs` method on the model: -->
サードパーティ エンジンを使用する場合、各 Eloquent モデルは、そのモデルの検索可能なすべてのレコードを含む特定の検索「インデックス」と同期されます。デフォルトでは、各モデルは、モデルの一般的な「テーブル」名に一致するインデックスに保存されます。通常、これはモデル名の複数形です。ただし、モデルの `searchableAs` メソッドをオーバーライドすることで、モデルのインデックスを自由にカスタマイズできます。

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
> データベースエンジンを使用する場合、`searchableAs` メソッドは効果がありません。データベースエンジンは常にモデルのデータベーステーブルを直接検索します。

<a name="configuring-the-model-id"></a>
<!-- #### Configuring the Model ID -->
#### Configuring the Model ID

<!-- By default, Scout will use the primary key of the model as the model's unique ID / key that is stored in the search index. If you need to customize this behavior when using a third-party engine, you may override the `getScoutKey` and the `getScoutKeyName` methods on the model: -->
デフォルトでは、Scout はモデルの主キーを、検索インデックスに保存されるモデルの一意の ID/キーとして使用します。サードパーティ エンジンの使用時にこの動作をカスタマイズする必要がある場合は、モデルの `getScoutKey` メソッドと `getScoutKeyName` メソッドをオーバーライドできます。

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
> データベースエンジンを使用する場合、`getScoutKey` と `getScoutKeyName` メソッドは効果がありません。データベースエンジンは常にモデルの主キーを使用します。

<a name="algolia-configuration"></a>
<!-- ### Algolia -->
### Algolia

<a name="algolia-index-settings"></a>
<!-- #### Index Settings -->
#### Index Settings

<!-- Sometimes you may want to configure additional settings on your Algolia indexes. While you can manage these settings via the Algolia UI, it is sometimes more efficient to manage the desired state of your index configuration directly from your application's `config/scout.php` configuration file. -->
Algolia インデックスに追加の設定を構成することが必要になる場合があります。これらの設定は Algolia UI を介して管理できますが、場合によっては、アプリケーションの `config/scout.php` 構成ファイルから直接、インデックス構成の望ましい状態を管理する方が効率的です。

<!-- This approach allows you to deploy these settings through your application's automated deployment pipeline, avoiding manual configuration and ensuring consistency across multiple environments. You may configure filterable attributes, ranking, faceting, or [any other supported settings](https://www.algolia.com/doc/rest-api/search/#tag/Indices/operation/setSettings). -->
このアプローチにより、アプリケーションの自動展開パイプラインを通じてこれらの設定を展開できるため、手動による構成が回避され、複数の環境間での一貫性が確保されます。フィルター可能な属性、ランキング、ファセット、または [any other supported settings](https://www.algolia.com/doc/rest-api/search/#tag/Indices/operation/setSettings) を構成できます。

<!-- To get started, add settings for each index in your application's `config/scout.php` configuration file: -->
まず、アプリケーションの `config/scout.php` 構成ファイルに各インデックスの設定を追加します。

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
特定のインデックスの基礎となるモデルが論理的に削除可能で、`index-settings` 配列に含まれている場合、Scout はそのインデックス上の論理的に削除されたモデルのファセットのサポートを自動的に組み込みます。ソフト削除可能なモデル インデックスに対して定義する他のファセット属性がない場合は、そのモデルの `index-settings` 配列に空のエントリを追加するだけで済みます。

```php
'index-settings' => [
    Flight::class => []
],
```

<!-- After configuring your application's index settings, you must invoke the `scout:sync-index-settings` Artisan command. This command will inform Algolia of your currently configured index settings. For convenience, you may wish to make this command part of your deployment process: -->
アプリケーションのインデックス設定を構成した後、`scout:sync-index-settings` Artisan コマンドを呼び出す必要があります。このコマンドは、現在構成されているインデックス設定を Algolia に通知します。便宜上、このコマンドを展開プロセスの一部にするとよいでしょう。

```shell
php artisan scout:sync-index-settings
```

<a name="algolia-identifying-users"></a>
<!-- #### Identifying Users -->
#### Identifying Users

<!-- Scout allows you to auto identify users when using Algolia. Associating the authenticated user with search operations may be helpful when viewing your search analytics within Algolia's dashboard. You can enable user identification by defining a `SCOUT_IDENTIFY` environment variable as `true` in your application's `.env` file: -->
Scout を使用すると、Algolia の使用時にユーザーを自動識別できます。認証されたユーザーを検索操作に関連付けると、Algolia のダッシュボード内で検索分析を表示するときに役立つ場合があります。ユーザー識別を有効にするには、アプリケーションの `.env` ファイルで `SCOUT_IDENTIFY` 環境変数を `true` として定義します。

```ini
SCOUT_IDENTIFY=true
```

<!-- Enabling this feature will also pass the request's IP address and your authenticated user's primary identifier to Algolia so this data is associated with any search request that is made by the user. -->
この機能を有効にすると、リクエストの IP アドレスと認証されたユーザーのプライマリ識別子も Algolia に渡されるため、このデータはユーザーが行った検索リクエストに関連付けられます。

<a name="meilisearch-configuration"></a>
<!-- ### Meilisearch -->
### Meilisearch

<a name="meilisearch-index-settings"></a>
<!-- #### Index Settings -->
#### Index Settings

<!-- Meilisearch requires you to pre-define index search settings such as filterable attributes, sortable attributes, and [other supported settings fields](https://docs.meilisearch.com/reference/api/settings.html). -->
Meilisearch では、フィルター可能な属性、並べ替え可能な属性、[other supported settings fields](https://docs.meilisearch.com/reference/api/settings.html) などのインデックス検索設定を事前に定義する必要があります。

<!-- Filterable attributes are any attributes you plan to filter on when invoking Scout's `where` method, while sortable attributes are any attributes you plan to sort by when invoking Scout's `orderBy` method. To define your index settings, adjust the `index-settings` portion of your `meilisearch` configuration entry in your application's `scout` configuration file: -->
フィルター可能な属性は、Scout の `where` メソッドを呼び出すときにフィルター処理する予定の属性であり、並べ替え可能な属性は、Scout の `orderBy` メソッドを呼び出すときに並べ替える予定の属性です。インデックス設定を定義するには、アプリケーションの `scout` 構成ファイル内の `meilisearch` 構成エントリの `index-settings` 部分を調整します。

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
特定のインデックスの基礎となるモデルが論理的に削除可能で、`index-settings` 配列に含まれている場合、Scout はそのインデックス上の論理的に削除されたモデルのフィルター処理のサポートを自動的に組み込みます。ソフト削除可能なモデル インデックスに対して定義するフィルター可能または並べ替え可能な属性が他にない場合は、そのモデルの `index-settings` 配列に空のエントリを追加するだけで済みます。

```php
'index-settings' => [
    Flight::class => []
],
```

<!-- After configuring your application's index settings, you must invoke the `scout:sync-index-settings` Artisan command. This command will inform Meilisearch of your currently configured index settings. For convenience, you may wish to make this command part of your deployment process: -->
アプリケーションのインデックス設定を構成した後、`scout:sync-index-settings` Artisan コマンドを呼び出す必要があります。このコマンドは、Meilisearch に現在構成されているインデックス設定を通知します。便宜上、このコマンドを展開プロセスの一部にするとよいでしょう。

```shell
php artisan scout:sync-index-settings
```

<a name="meilisearch-semantic-and-hybrid-search"></a>
<!-- #### Semantic and Hybrid Search -->
#### Semantic and Hybrid Search

<!-- To use semantic or hybrid search with Meilisearch, configure an embedder in the index settings and embedding settings for each searchable model: -->
Meilisearch でセマンティック検索またはハイブリッド検索を使用するには、インデックス設定でエンベッダを構成し、検索可能な各モデルの埋め込み設定を構成します。

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
モデルの `toSearchableEmbedding` メソッドは、Scout が [Laravel AI SDK](/docs/13.x/ai-sdk) を使って埋め込むソーステキスト、または事前計算済みの埋め込み配列を返せます。設定を更新したら、`scout:sync-index-settings` コマンドを実行してください。

<a name="meilisearch-data-types"></a>
<!-- #### Searchable Data Types -->
#### Searchable Data Types

<!-- Meilisearch will only perform filter operations (`>`, `<`, etc.) on data of the correct type. When customizing your searchable data, you should ensure that numeric values are cast to their correct type: -->
Meilisearch は、正しいタイプのデータに対してフィルター操作 (`>`、`<` など) のみを実行します。検索可能なデータをカスタマイズするときは、数値が正しい型にcastされていることを確認する必要があります。

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
Typesense を利用する場合、検索可能なモデルは、モデルの主キーを文字列にcastし、作成日を UNIX タイムスタンプにcastする `toSearchableArray` メソッドを定義する必要があります。

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
また、アプリケーションの `config/scout.php` ファイルで Typesense コレクション スキーマを定義する必要があります。コレクション スキーマは、Typesense を介して検索可能な各フィールドのデータ型を記述します。利用可能なすべてのスキーマ オプションの詳細については、[Typesense documentation](https://typesense.org/docs/latest/api/collections.html#schema-parameters) を参照してください。

<!-- If you need to change your Typesense collection's schema after it has been defined, you may either run `scout:flush` and `scout:import`, which will delete all existing indexed data and recreate the schema. Or, you may use Typesense's API to modify the collection's schema without removing any indexed data. -->
Typesense コレクションのスキーマを定義した後に変更する必要がある場合は、`scout:flush` および `scout:import` を実行します。これにより、既存のインデックス付きデータがすべて削除され、スキーマが再作成されます。または、Typesense の API を使用して、インデックス付きデータを削除せずにコレクションのスキーマを変更することもできます。

<!-- If your searchable model is soft deletable, you should define a `__soft_deleted` field in the model's corresponding Typesense schema within your application's `config/scout.php` configuration file: -->
検索可能なモデルが論理的に削除可能な場合は、アプリケーションの `config/scout.php` 構成ファイル内のモデルに対応する Typesense スキーマで `__soft_deleted` フィールドを定義する必要があります。

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
セマンティック検索とハイブリッド検索を有効にするには、モデルの Typesense 設定で `embedding` 設定とベクトルフィールドを定義します。デフォルトでは、Scout は [Laravel AI SDK](/docs/13.x/ai-sdk) を使用して埋め込みを生成します。

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
モデルの `toSearchableEmbedding` メソッドは、Scout が埋め込みを生成する対象のソーステキスト、または事前計算済みの埋め込み配列を返す必要があります。

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
Typesense を使用すると、`options` メソッド経由で検索操作を実行するときに、[search parameters](https://typesense.org/docs/latest/api/search.html#search-parameters) を動的に変更できます。

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
Turbopuffer では、モデルごとにスキーマと検索可能な属性が必要です。`scout` 設定ファイル内の `turbopuffer` 設定にある `model-settings` 配列で、これらを定義してください。

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
`searchable-attributes` に割り当てる数値は、相対的な BM25 の重みです。上の例では、記事タイトルの一致は本文の一致の 3 倍のスコアに加算されます。

<!-- To enable semantic and hybrid search, add an `embedding` setting and vector schema to the model's configuration: -->
セマンティック検索とハイブリッド検索を有効にするには、モデルの設定に `embedding` 設定とベクトルスキーマを追加します。

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
モデルの `toSearchableEmbedding` メソッドは、Scout が埋め込むソーステキスト、または事前計算済みの埋め込み配列を返す必要があります。Scout は[Laravel AI SDK](/docs/13.x/ai-sdk)を使ってソーステキストの埋め込みを生成します。

<!-- Alternatively, you may use Turbopuffer's native embeddings without installing the Laravel AI SDK or defining a `toSearchableEmbedding` method. Set the embedding driver to `turbopuffer` and configure an `embed` schema on the searchable source attribute: -->
また、Laravel AI SDK をインストールしたり、`toSearchableEmbedding` メソッドを定義したりせずに、Turbopuffer のネイティブ埋め込みを使用することもできます。埋め込みドライバを `turbopuffer` に設定し、検索可能なソース属性に `embed` スキーマを設定してください。

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
モデルの `toSearchableArray` 出力には、ソース属性を含める必要があります。

<a name="indexing"></a>
<!-- ## Third-Party Engine Indexing -->
## Third-Party Engine Indexing

> [!NOTE]
> このセクションで説明するインデックス機能は、主にサードパーティ製エンジン（Algolia、Meilisearch、Typesense、Turbopuffer）を使用する場合に関係します。データベースエンジンはデータベースのテーブルを直接検索するため、手動でインデックスを管理する必要はありません。

<a name="batch-import"></a>
<!-- ### Batch Import -->
### Batch Import

<!-- If you are installing Scout into an existing project, you may already have database records you need to import into your indexes. Scout provides a `scout:import` Artisan command that you may use to import all of your existing records into your search indexes: -->
既存のプロジェクトに Scout をインストールする場合は、インデックスにインポートする必要があるデータベース レコードがすでに存在する可能性があります。 Scout は、既存のすべてのレコードを検索インデックスにインポートするために使用できる `scout:import` Artisan コマンドを提供します。

```shell
php artisan scout:import "App\Models\Post"
```

<!-- The `scout:queue-import` command may be used to import all of your existing records using [queued jobs](/docs/13.x/queues): -->
既存のすべてのレコードを [queued jobs](/docs/13.x/queues) を使用してインポートするには、`scout:queue-import` コマンドを使用できます。

```shell
php artisan scout:queue-import "App\Models\Post" --chunk=500
```

<!-- The `flush` command may be used to remove all of a model's records from your search indexes: -->
`flush` コマンドを使用して、モデルのすべてのレコードを検索インデックスから削除できます。

```shell
php artisan scout:flush "App\Models\Post"
```

<a name="modifying-the-import-query"></a>
<!-- #### Modifying the Import Query -->
#### Modifying the Import Query

<!-- If you would like to modify the query that is used to retrieve all of your models for batch importing, you may define a `makeAllSearchableUsing` method on your model. This is a great place to add any eager relationship loading that may be necessary before importing your models: -->
バッチインポート用にすべてのモデルを取得するために使用されるクエリを変更したい場合は、モデルに `makeAllSearchableUsing` メソッドを定義できます。ここは、モデルをインポートする前に必要となる可能性のある積極的な関係の読み込みを追加するのに最適な場所です。

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
> キューを使用してモデルをバッチインポートする場合、`makeAllSearchableUsing` メソッドは適用できないことがあります。モデルのコレクションをジョブで処理すると、リレーションは [not restored](/docs/13.x/queues#handling-relationships) されません。

<a name="adding-records"></a>
<!-- ### Adding Records -->
### Adding Records

<!-- Once you have added the `Laravel\Scout\Searchable` trait to a model, all you need to do is `save` or `create` a model instance and it will automatically be added to your search index. If you have configured Scout to [use queues](#queueing) this operation will be performed in the background by your queue worker: -->
`Laravel\Scout\Searchable` トレイトをモデルに追加したら、モデル インスタンスに `save` または `create` を追加するだけで、検索インデックスに自動的に追加されます。 Scout を [use queues](#queueing) に構成した場合、この操作はキューワーカーによってバックグラウンドで実行されます。

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
Eloquent クエリを使ってモデルのコレクションを検索インデックスに追加する場合は、Eloquent クエリに `searchable` メソッドをチェーンできます。`searchable` メソッドはクエリの [chunk the results](/docs/13.x/eloquent#chunking-results) を実行し、レコードを検索インデックスに追加します。また、Scout でキューを使用するよう設定している場合は、すべてのチャンクがキューワーカーによってバックグラウンドでインポートされます。

```php
use App\Models\Order;

Order::where('price', '>', 100)->searchable();
```

<!-- You may also call the `searchable` method on an Eloquent relationship instance: -->
Eloquent リレーションシップ インスタンスで `searchable` メソッドを呼び出すこともできます。

```php
$user->orders()->searchable();
```

<!-- Or, if you already have a collection of Eloquent models in memory, you may call the `searchable` method on the collection instance to add the model instances to their corresponding index: -->
または、メモリ内に Eloquent モデルのコレクションがすでにある場合は、コレクション インスタンスで `searchable` メソッドを呼び出して、モデル インスタンスを対応するインデックスに追加することもできます。

```php
$orders->searchable();
```

> [!NOTE]
> `searchable` メソッドは、「アップサート」操作と考えることができます。つまり、モデルのレコードがすでにインデックスに存在する場合は更新され、検索インデックスに存在しない場合はインデックスに追加されます。

<a name="updating-records"></a>
<!-- ### Updating Records -->
### Updating Records

<!-- To update a searchable model, you only need to update the model instance's properties and `save` the model to your database. Scout will automatically persist the changes to your search index: -->
検索可能なモデルを更新するには、モデル インスタンスのプロパティとデータベースのモデルを `save` 更新するだけです。 Scout は、検索インデックスへの変更を自動的に永続化します。

```php
use App\Models\Order;

$order = Order::find(1);

// Update the order...

$order->save();
```

<!-- You may also invoke the `searchable` method on an Eloquent query instance to update a collection of models. If the models do not exist in your search index, they will be created: -->
Eloquent クエリ インスタンスで `searchable` メソッドを呼び出して、モデルのコレクションを更新することもできます。モデルが検索インデックスに存在しない場合は、作成されます。

```php
Order::where('price', '>', 100)->searchable();
```

<!-- If you would like to update the search index records for all of the models in a relationship, you may invoke the `searchable` on the relationship instance: -->
関係内のすべてのモデルの検索インデックス レコードを更新したい場合は、関係インスタンスで `searchable` を呼び出します。

```php
$user->orders()->searchable();
```

<!-- Or, if you already have a collection of Eloquent models in memory, you may call the `searchable` method on the collection instance to update the model instances in their corresponding index: -->
または、メモリ内に Eloquent モデルのコレクションがすでにある場合は、コレクション インスタンスで `searchable` メソッドを呼び出して、対応するインデックス内のモデル インスタンスを更新することもできます。

```php
$orders->searchable();
```

<a name="modifying-records-before-importing"></a>
<!-- #### Modifying Records Before Importing -->
#### Modifying Records Before Importing

<!-- Sometimes you may need to prepare the collection of models before they are made searchable. For instance, you may want to eager load a relationship so that the relationship data can be efficiently added to your search index. To accomplish this, define a `makeSearchableUsing` method on the corresponding model: -->
場合によっては、モデルのコレクションを検索可能にする前に準備する必要がある場合があります。たとえば、関係データを検索インデックスに効率的に追加できるように、関係を一括ロードすることができます。これを実現するには、対応するモデルで `makeSearchableUsing` メソッドを定義します。

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
デフォルトでは、Scout は、どの属性が変更されたかに関係なく、更新されたモデルのインデックスを再作成します。この動作をカスタマイズしたい場合は、モデルに `searchIndexShouldBeUpdated` メソッドを定義できます。

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
インデックスからレコードを削除するには、データベースからモデルを `delete` するだけです。[soft deleted](/docs/13.x/eloquent#soft-deleting) モデルを使用している場合でも、この方法で削除できます。

```php
use App\Models\Order;

$order = Order::find(1);

$order->delete();
```

<!-- If you do not want to retrieve the model before deleting the record, you may use the `unsearchable` method on an Eloquent query instance: -->
レコードを削除する前にモデルを取得したくない場合は、Eloquent クエリ インスタンスで `unsearchable` メソッドを使用できます。

```php
Order::where('price', '>', 100)->unsearchable();
```

<!-- If you would like to remove the search index records for all of the models in a relationship, you may invoke the `unsearchable` on the relationship instance: -->
関係内のすべてのモデルの検索インデックス レコードを削除したい場合は、関係インスタンスで `unsearchable` を呼び出します。

```php
$user->orders()->unsearchable();
```

<!-- Or, if you already have a collection of Eloquent models in memory, you may call the `unsearchable` method on the collection instance to remove the model instances from their corresponding index: -->
または、メモリ内に Eloquent モデルのコレクションがすでにある場合は、コレクション インスタンスで `unsearchable` メソッドを呼び出して、対応するインデックスからモデル インスタンスを削除することもできます。

```php
$orders->unsearchable();
```

<!-- To remove all of the model records from their corresponding index, you may invoke the `removeAllFromSearch` method: -->
対応するインデックスからすべてのモデル レコードを削除するには、`removeAllFromSearch` メソッドを呼び出します。

```php
Order::removeAllFromSearch();
```

<a name="pausing-indexing"></a>
<!-- ### Pausing Indexing -->
### Pausing Indexing

<!-- Sometimes you may need to perform a batch of Eloquent operations on a model without syncing the model data to your search index. You may do this using the `withoutSyncingToSearch` method. This method accepts a single closure which will be immediately executed. Any model operations that occur within the closure will not be synced to the model's index: -->
場合によっては、モデル データを検索インデックスに同期せずに、モデルに対して Eloquent 操作のバッチを実行する必要がある場合があります。これは、`withoutSyncingToSearch` メソッドを使用して行うことができます。このメソッドは、ただちに実行される単一のクロージャを受け入れます。クロージャ内で発生するモデル操作はモデルのインデックスに同期されません。

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
場合によっては、特定の条件下でのみモデルを検索可能にすることが必要な場合があります。たとえば、「ドラフト」と「公開」の 2 つの状態のいずれかにある `App\Models\Post` モデルがあるとします。 「公開された」投稿のみを検索可能にしたい場合があります。これを実現するには、モデルに `shouldBeSearchable` メソッドを定義します。

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
`shouldBeSearchable` メソッドは、`save` および `create` メソッド、クエリ、または関係を通じてモデルを操作する場合にのみ適用されます。 `searchable` メソッドを使用してモデルまたはコレクションを直接検索可能にすると、`shouldBeSearchable` メソッドの結果がオーバーライドされます。

> [!WARNING]
> Scout の "database" エンジンを使用する場合、検索可能なデータは常にデータベースに保存されるため、`shouldBeSearchable` メソッドは使用できません。database エンジンで同様の動作を実現するには、代わりに [where clauses](#where-clauses) を使用してください。

<a name="searching"></a>
<!-- ## Searching -->
## Searching

<!-- You may begin searching a model using the `search` method. The search method accepts a single string that will be used to search your models. You should then chain the `get` method onto the search query to retrieve the Eloquent models that match the given search query: -->
`search` メソッドを使用してモデルの検索を開始できます。検索メソッドは、モデルの検索に使用される単一の文字列を受け入れます。次に、`get` メソッドを検索クエリに連鎖させて、指定された検索クエリに一致する Eloquent モデルを取得する必要があります。

```php
use App\Models\Order;

$orders = Order::search('Star Trek')->get();
```

<!-- Since Scout searches return a collection of Eloquent models, you may even return the results directly from a route or controller and they will automatically be converted to JSON: -->
Scout 検索では Eloquent モデルのコレクションが返されるため、ルートまたはコントローラから直接結果を返すこともでき、結果は自動的に JSON に変換されます。

```php
use App\Models\Order;
use Illuminate\Http\Request;

Route::get('/search', function (Request $request) {
    return Order::search($request->search)->get();
});
```

<!-- If you would like to get the raw search results before they are converted to Eloquent models, you may use the `raw` method: -->
Eloquent モデルに変換される前に生の検索結果を取得したい場合は、`raw` メソッドを使用できます。

```php
$orders = Order::search('Star Trek')->raw();
```

<a name="semantic-search"></a>
<!-- ### Semantic Search -->
### Semantic Search

<!-- The database, Meilisearch, Typesense, and Turbopuffer engines support semantic search, which matches records based on the meaning of a query. When Scout generates embeddings, semantic and hybrid searches require the [Laravel AI SDK](/docs/13.x/ai-sdk). [Typesense's native embeddings](#typesense-embeddings), [Turbopuffer's native embeddings](#turbopuffer-configuration), and precomputed query vectors do not require the Laravel AI SDK. -->
データベース、Meilisearch、Typesense、Turbopuffer の各エンジンは、クエリの意味に基づいてレコードを照合するセマンティック検索をサポートしています。Scout が埋め込みを生成する場合、セマンティック検索とハイブリッド検索には [Laravel AI SDK](/docs/13.x/ai-sdk) が必要です。[Typesense's native embeddings](#typesense-embeddings)、[Turbopuffer's native embeddings](#turbopuffer-configuration)、および事前計算済みのクエリベクトルには Laravel AI SDK は必要ありません。

<!-- After configuring embeddings for the selected engine, invoke the `semantic` method on a search query: -->
選択したエンジンの埋め込みを設定したら、検索クエリに対して `semantic` メソッドを呼び出します。

```php
$articles = Article::search('staying cool in the summer')
    ->semantic()
    ->get();
```

<!-- You may provide a minimum similarity threshold when supported by the selected engine: -->
選択したエンジンが対応している場合は、最小類似度のしきい値を指定できます。

```php
$articles = Article::search('renewable energy storage')
    ->semantic(minSimilarity: 0.6)
    ->get();
```

<!-- To combine full-text and semantic search, use the `hybrid` method. Its first two arguments control the relative weights of text and semantic results: -->
全文検索とセマンティック検索を組み合わせるには、`hybrid` メソッドを使用します。最初の2つの引数で、テキスト検索結果とセマンティック検索結果の相対的な重みを指定します。

```php
$articles = Article::search('renewable energy storage')
    ->hybrid(textWeight: 1, semanticWeight: 2)
    ->get();
```

<a name="custom-indexes"></a>
<!-- #### Custom Indexes -->
#### Custom Indexes

<!-- When searching using third-party engines, search queries will typically be performed on the index specified by the model's [searchableAs](#configuring-model-indexes) method. However, you may use the `within` method to specify a custom index that should be searched instead: -->
サードパーティ エンジンを使用して検索する場合、通常、検索クエリはモデルの [searchableAs](#configuring-model-indexes) メソッドで指定されたインデックスに対して実行されます。ただし、代わりに `within` メソッドを使用して、検索するカスタム インデックスを指定することもできます。

```php
$orders = Order::search('Star Trek')
    ->within('tv_shows_popularity_desc')
    ->get();
```

<a name="where-clauses"></a>
<!-- ### Where Clauses -->
### Where Clauses

<!-- Scout allows you to add "where" clauses to your search queries. For example, basic equality checks are useful for scoping search queries by an owner ID: -->
Scout を使用すると、検索クエリに「where」句を追加できます。たとえば、基本的な等価性チェックは、所有者 ID によって検索クエリの範囲を指定する場合に役立ちます。

```php
use App\Models\Order;

$orders = Order::search('Star Trek')->where('user_id', 1)->get();
```

<!-- You may also use the `=`, `!=`, `<`, `>`, `>=`, `<=` comparison operators to build more advanced queries: -->
`=`、`!=`、`<`、`>`、`>=`、`<=` 比較演算子を使用して、より高度なクエリを構築することもできます。

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
さらに、`whereIn` メソッドを使用して、指定された列の値が指定された配列内に含まれていることを確認できます。

```php
$orders = Order::search('Star Trek')->whereIn(
    'status', ['open', 'paid']
)->get();
```

<!-- The `whereNotIn` method verifies that the given column's value is not contained in the given array: -->
`whereNotIn` メソッドは、指定された列の値が指定された配列に含まれていないことを検証します。

```php
$orders = Order::search('Star Trek')->whereNotIn(
    'status', ['closed']
)->get();
```

> [!WARNING]
> アプリケーションで Meilisearch を使用している場合は、Scout の「where」句を利用する前に、アプリケーションの [filterable attributes](#meilisearch-index-settings) を設定する必要があります。

<a name="customizing-the-eloquent-results-query"></a>
<!-- #### Customizing the Eloquent Results Query -->
#### Customizing the Eloquent Results Query

<!-- After Scout retrieves a list of matching Eloquent models from your application's search engine, Eloquent is used to retrieve all of the matching models by their primary keys. You may customize this query by invoking the `query` method. The `query` method accepts a closure that will receive the Eloquent query builder instance as an argument: -->
Scout がアプリケーションの検索エンジンから一致する Eloquent モデルのリストを取得した後、Eloquent を使用して主キーによって一致するすべてのモデルを取得します。 `query` メソッドを呼び出して、このクエリをカスタマイズできます。 `query` メソッドは、Eloquent クエリビルダ インスタンスを引数として受け取るクロージャを受け入れます。

```php
use App\Models\Order;
use Illuminate\Database\Eloquent\Builder;

$orders = Order::search('Star Trek')
    ->query(fn (Builder $query) => $query->with('invoices'))
    ->get();
```

<!-- When using a third-party engine, this callback is invoked after the relevant models have already been retrieved from the search engine, so it should not be used for "filtering" results — use [Scout where clauses](#where-clauses) instead. However, when using the database engine, the `query` method's constraints are applied directly to the database query, so you may use it for filtering as well. -->
サードパーティ エンジンを使用する場合、このコールバックは関連モデルが検索エンジンからすでに取得された後に呼び出されるため、結果の「フィルタリング」には使用しないでください。代わりに [Scout where clauses](#where-clauses) を使用してください。ただし、データベース エンジンを使用する場合、`query` メソッドの制約はデータベース クエリに直接適用されるため、フィルタリングにも使用できます。

<a name="pagination"></a>
<!-- ### Pagination -->
### Pagination

<!-- In addition to retrieving a collection of models, you may paginate your search results using the `paginate` method. This method will return an `Illuminate\Pagination\LengthAwarePaginator` instance just as if you had [paginated a traditional Eloquent query](/docs/13.x/pagination): -->
モデルのコレクションを取得するだけでなく、`paginate` メソッドを使って検索結果をページネーションすることもできます。このメソッドは、[paginated a traditional Eloquent query](/docs/13.x/pagination)と同様に、`Illuminate\Pagination\LengthAwarePaginator` インスタンスを返します。

```php
use App\Models\Order;

$orders = Order::search('Star Trek')->paginate();
```

<!-- You may specify how many models to retrieve per page by passing the amount as the first argument to the `paginate` method: -->
`paginate` メソッドの最初の引数として量を渡すことで、ページごとに取得するモデルの数を指定できます。

```php
$orders = Order::search('Star Trek')->paginate(15);
```

<!-- When using the database engine, you may also use the `simplePaginate` method. Unlike `paginate`, which retrieves the total number of matching records so it can display page numbers, `simplePaginate` only determines whether there are more results beyond the current page — making it more efficient for large datasets where you only need "previous" and "next" links: -->
データベース エンジンを使用する場合は、`simplePaginate` メソッドを使用することもできます。ページ番号を表示できるように一致するレコードの総数を取得する `paginate` とは異なり、`simplePaginate` は現在のページの先に結果があるかどうかだけを判断するため、「前」と「次」のリンクのみが必要な大規模なデータセットの場合はより効率的になります。

```php
$orders = Order::search('Star Trek')->simplePaginate(15);
```

<!-- Once you have retrieved the results, you may display the results and render the page links using [Blade](/docs/13.x/blade) just as if you had paginated a traditional Eloquent query: -->
結果を取得したら、従来の Eloquent クエリをページネーションした場合と同じように、結果を表示し、[Blade](/docs/13.x/blade) を使ってページリンクをレンダリングできます。

```html
<div class="container">
    @foreach ($orders as $order)
        {{ $order->price }}
    @endforeach
</div>

{{ $orders->links() }}
```

<!-- Of course, if you would like to retrieve the pagination results as JSON, you may return the paginator instance directly from a route or controller: -->
もちろん、ページネーションの結果を JSON として取得したい場合は、ルートまたはコントローラから直接ページネータ インスタンスを返すこともできます。

```php
use App\Models\Order;
use Illuminate\Http\Request;

Route::get('/orders', function (Request $request) {
    return Order::search($request->input('query'))->paginate(15);
});
```

> [!WARNING]
> 検索エンジンは Eloquent モデルのグローバルスコープ定義を認識しないため、Scout のページネーションを利用するアプリケーションではグローバルスコープを使用しないでください。または、Scout で検索する際にグローバルスコープの制約を再現してください。

<a name="soft-deleting"></a>
<!-- ### Soft Deleting -->
### Soft Deleting

<!-- If your indexed models are [soft deleting](/docs/13.x/eloquent#soft-deleting) and you need to search your soft deleted models, set the `soft_delete` option of the `config/scout.php` configuration file to `true`: -->
インデックス対象のモデルで[soft deleting](/docs/13.x/eloquent#soft-deleting)を使用しており、ソフトデリート済みのモデルも検索する必要がある場合は、`config/scout.php` 設定ファイルの `soft_delete` オプションを `true` に設定します。

```php
'soft_delete' => true,
```

<!-- When this configuration option is `true`, Scout will not remove soft deleted models from the search index. Instead, it will set a hidden `__soft_deleted` attribute on the indexed record. Then, you may use the `withTrashed` or `onlyTrashed` methods to retrieve the soft deleted records when searching: -->
この構成オプションが `true` の場合、Scout は検索インデックスから論理的に削除されたモデルを削除しません。代わりに、インデックス付きレコードに非表示の `__soft_deleted` 属性を設定します。次に、検索時に `withTrashed` メソッドまたは `onlyTrashed` メソッドを使用して、論理的に削除されたレコードを取得できます。

```php
use App\Models\Order;

// Include trashed records when retrieving results...
$orders = Order::search('Star Trek')->withTrashed()->get();

// Only include trashed records when retrieving results...
$orders = Order::search('Star Trek')->onlyTrashed()->get();
```

> [!NOTE]
> ソフトデリートされたモデルを `forceDelete` で完全に削除すると、Scout が検索インデックスから自動的に削除します。

<a name="customizing-engine-searches"></a>
<!-- ### Customizing Engine Searches -->
### Customizing Engine Searches

<!-- If you need to perform advanced customization of the search behavior of an engine you may pass a closure as the second argument to the `search` method. For example, you could use this callback to add geo-location data to your search options before the search query is passed to Algolia: -->
エンジンの検索動作の高度なカスタマイズを実行する必要がある場合は、`search` メソッドの 2 番目の引数としてクロージャーを渡すことができます。たとえば、このコールバックを使用して、検索クエリが Algolia に渡される前に、地理的位置データを検索オプションに追加できます。

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
組み込みの Scout 検索エンジンの 1 つがニーズに合わない場合は、独自のカスタム エンジンを作成して Scout に登録できます。エンジンは `Laravel\Scout\Engines\Engine` 抽象クラスを拡張する必要があります。この抽象クラスには、カスタム エンジンが実装する必要がある 8 つのメソッドが含まれています。

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
`Laravel\Scout\Engines\AlgoliaEngine` クラスでのこれらのメソッドの実装を確認すると役立つ場合があります。このクラスは、これらの各メソッドを独自のエンジンに実装する方法を学習するための良い出発点となります。

<a name="registering-the-engine"></a>
<!-- #### Registering the Engine -->
#### Registering the Engine

<!-- Once you have written your custom engine, you may register it with Scout using the `extend` method of the Scout engine manager. Scout's engine manager may be resolved from the Laravel service container. You should call the `extend` method from the `boot` method of your `App\Providers\AppServiceProvider` class or any other service provider used by your application: -->
カスタム エンジンを作成したら、Scout エンジン マネージャーの `extend` メソッドを使用して、Scout に登録できます。 Scout のエンジン マネージャーは、Laravel サービスコンテナーから解決される場合があります。 `App\Providers\AppServiceProvider` クラスの `boot` メソッド、またはアプリケーションで使用される他のサービスプロバイダから `extend` メソッドを呼び出す必要があります。

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
エンジンが登録されたら、アプリケーションの `config/scout.php` 構成ファイルでデフォルトの Scout `driver` として指定できます。

```php
'driver' => 'mysql',
```
