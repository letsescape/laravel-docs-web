# 데이터베이스: 시작하기 (Database: Getting Started)

- [소개](#introduction)
    - [설정](#configuration)
    - [읽기 및 쓰기 연결](#read-and-write-connections)
- [SQL 쿼리 실행](#running-queries)
    - [여러 데이터베이스 연결 사용](#using-multiple-database-connections)
    - [쿼리 이벤트 리스닝](#listening-for-query-events)
    - [누적 쿼리 시간 모니터링](#monitoring-cumulative-query-time)
- [데이터베이스 트랜잭션](#database-transactions)
- [데이터베이스 CLI 연결](#connecting-to-the-database-cli)
- [데이터베이스 점검](#inspecting-your-databases)
- [데이터베이스 모니터링](#monitoring-your-databases)

<a name="introduction"></a>
## 소개

대부분의 현대 웹 애플리케이션은 데이터베이스와 상호작용합니다. 라라벨은 원시 SQL, [유연한 쿼리 빌더](/docs/12.x/queries), 그리고 [Eloquent ORM](/docs/12.x/eloquent)을 이용해 다양한 지원 데이터베이스와 쉽게 연동할 수 있도록 해줍니다. 현재 라라벨은 다음 5가지 데이터베이스에 대해 공식적으로 지원합니다.

<div class="content-list" markdown="1">

- MariaDB 10.3+ ([버전 정책](https://mariadb.org/about/#maintenance-policy))
- MySQL 5.7+ ([버전 정책](https://en.wikipedia.org/wiki/MySQL#Release_history))
- PostgreSQL 10.0+ ([버전 정책](https://www.postgresql.org/support/versioning/))
- SQLite 3.26.0+
- SQL Server 2017+ ([버전 정책](https://docs.microsoft.com/en-us/lifecycle/products/?products=sql-server))

</div>

또한, MongoDB는 `mongodb/laravel-mongodb` 패키지를 통해 지원되며, 이 패키지는 MongoDB에서 공식적으로 관리하고 있습니다. 자세한 정보는 [Laravel MongoDB 문서](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/)를 참고하십시오.

<a name="configuration"></a>
### 설정

라라벨의 데이터베이스 서비스 설정은 애플리케이션의 `config/database.php` 설정 파일에 있습니다. 이 파일에서 모든 데이터베이스 연결을 정의할 수 있으며, 기본으로 사용할 연결도 지정할 수 있습니다. 이 파일의 대부분의 설정 옵션은 애플리케이션의 환경 변수 값에 의해 제어됩니다. 라라벨이 지원하는 대부분의 데이터베이스 시스템에 대한 예시도 이 파일에 포함되어 있습니다.

기본적으로 라라벨의 샘플 [환경 설정](/docs/12.x/configuration#environment-configuration)은 [Laravel Sail](/docs/12.x/sail)과 함께 바로 사용할 수 있습니다. Laravel Sail은 로컬 개발을 위한 라라벨의 Docker 설정입니다. 하지만, 로컬 데이터베이스에 맞게 데이터베이스 설정을 자유롭게 변경하셔도 됩니다.

<a name="sqlite-configuration"></a>
#### SQLite 설정

SQLite 데이터베이스는 파일 시스템의 단일 파일로 구성됩니다. 터미널에서 `touch` 명령어를 사용해 새로운 SQLite 데이터베이스 파일을 만들 수 있습니다: `touch database/database.sqlite`. 데이터베이스가 생성된 후에는 환경 변수의 `DB_DATABASE`에 해당 데이터베이스의 절대 경로를 지정하면 됩니다:

```ini
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/database.sqlite
```

기본적으로 SQLite 연결에서는 외래 키 제약 조건이 활성화되어 있습니다. 만약 이를 비활성화하고 싶다면, `DB_FOREIGN_KEYS` 환경 변수를 `false`로 설정하면 됩니다:

```ini
DB_FOREIGN_KEYS=false
```

> [!NOTE]
> [라라벨 설치 도구](/docs/12.x/installation#creating-a-laravel-project)를 사용해 프로젝트를 생성하고 데이터베이스로 SQLite를 선택하면, 라라벨이 자동으로 `database/database.sqlite` 파일을 만들고 기본 [데이터베이스 마이그레이션](/docs/12.x/migrations)을 실행합니다.

<a name="mssql-configuration"></a>
#### Microsoft SQL Server 설정

Microsoft SQL Server를 사용하려면, `sqlsrv` 및 `pdo_sqlsrv` PHP 확장 모듈과 그에 필요한 Microsoft SQL ODBC 드라이버 등 모든 필수 의존성을 설치해야 합니다.

<a name="configuration-using-urls"></a>
#### URL을 이용한 설정

일반적으로 데이터베이스 연결은 `host`, `database`, `username`, `password` 등 여러 설정 값을 각각 환경 변수에 지정해 구성합니다. 즉, 운영 서버에서 데이터베이스 정보를 설정할 때 여러 환경 변수를 동시에 관리해야 합니다.

하지만 AWS나 Heroku와 같은 일부 매니지드 데이터베이스 제공 업체는 모든 접속 정보를 하나의 문자열인 데이터베이스 "URL"로 제공합니다. 예시로 아래와 같은 형태가 있습니다:

```html
mysql://root:password@127.0.0.1/forge?charset=UTF-8
```

이러한 URL은 보통 다음의 규칙을 따릅니다:

```html
driver://username:password@host:port/database?options
```

라라벨은 여러 가지 개별 옵션 설정 대신 이런 URL을 지원하여 편리하게 데이터베이스 연결 정보를 관리할 수 있도록 합니다. 만약 `url`(또는 해당하는 `DB_URL` 환경 변수) 설정 값이 있다면, 이 값에서 연결 및 인증 정보를 자동으로 추출해 사용하게 됩니다.

<a name="read-and-write-connections"></a>
### 읽기 및 쓰기 연결

경우에 따라 SELECT 문에는 한 데이터베이스 연결을, INSERT, UPDATE, DELETE와 같은 쓰기 작업에는 다른 연결을 사용하고 싶을 때가 있습니다. 라라벨에서는 이를 매우 쉽게 설정할 수 있으며, 원시 쿼리, 쿼리 빌더, Eloquent ORM 중 어느 것을 사용해도 항상 적절한 연결이 자동으로 사용됩니다.

읽기/쓰기 연결을 어떻게 설정하는지 아래 예제를 통해 살펴보겠습니다:

```php
'mysql' => [
    'read' => [
        'host' => [
            '192.168.1.1',
            '196.168.1.2',
        ],
    ],
    'write' => [
        'host' => [
            '196.168.1.3',
        ],
    ],
    'sticky' => true,

    'database' => env('DB_DATABASE', 'laravel'),
    'username' => env('DB_USERNAME', 'root'),
    'password' => env('DB_PASSWORD', ''),
    'unix_socket' => env('DB_SOCKET', ''),
    'charset' => env('DB_CHARSET', 'utf8mb4'),
    'collation' => env('DB_COLLATION', 'utf8mb4_unicode_ci'),
    'prefix' => '',
    'prefix_indexes' => true,
    'strict' => true,
    'engine' => null,
    'options' => extension_loaded('pdo_mysql') ? array_filter([
        PDO::MYSQL_ATTR_SSL_CA => env('MYSQL_ATTR_SSL_CA'),
    ]) : [],
],
```

위 예제에서는 세 가지 키(`read`, `write`, `sticky`)가 추가된 것을 볼 수 있습니다. `read`와 `write`에는 각자 하나의 `host` 키가 있고, 나머지 데이터베이스 설정은 기본 `mysql` 배열에서 가져와 병합됩니다.

기본 배열에서 별도로 덮어쓰고 싶은 값만 `read`, `write` 배열에 넣으면 되고, 그렇지 않으면 공유됩니다. 예를 들어, "읽기" 연결은 `192.168.1.1`을, "쓰기" 연결은 `192.168.1.3`을 각각 호스트로 사용하게 됩니다. 데이터베이스 인증 정보, 프리픽스, 문자 집합 등 그 외의 옵션은 두 연결 모두에서 공유됩니다. `host`가 여러 개일 경우 요청마다 무작위로 데이터베이스 호스트가 선택됩니다.

<a name="the-sticky-option"></a>
#### `sticky` 옵션

`sticky` 옵션은 선택적으로 사용할 수 있는 설정으로, 현재 요청 사이클 동안 데이터베이스에 기록된 데이터를 즉시 읽고 싶을 때 유용합니다. 이 옵션을 활성화하면 "쓰기" 작업이 수행된 후 같은 요청 내에서 "읽기" 작업이 발생할 경우 "쓰기" 연결을 사용하게 됩니다. 즉, 같은 요청 중에 갓 저장된 데이터를 바로 읽어야 할 필요가 있을 때 사용합니다. 이 동작이 필요한지 여부는 애플리케이션의 요구에 따라 결정하면 됩니다.

<a name="running-queries"></a>
## SQL 쿼리 실행

데이터베이스 연결을 설정한 뒤에는 `DB` 파사드를 사용해 쿼리를 실행할 수 있습니다. `DB` 파사드는 각 쿼리 유형별로 `select`, `update`, `insert`, `delete`, `statement` 메서드를 제공합니다.

<a name="running-a-select-query"></a>
#### SELECT 쿼리 실행

기본적인 SELECT 쿼리는 `DB` 파사드의 `select` 메서드를 사용해 실행할 수 있습니다:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * 애플리케이션의 모든 사용자 목록을 보여줍니다.
     */
    public function index(): View
    {
        $users = DB::select('select * from users where active = ?', [1]);

        return view('user.index', ['users' => $users]);
    }
}
```

`select` 메서드의 첫 번째 인수는 SQL 쿼리이고, 두 번째 인수는 쿼리의 파라미터 바인딩 값입니다. 보통은 `where` 절에 들어가는 값들입니다. 파라미터 바인딩을 통해 SQL 인젝션 공격을 방지할 수 있습니다.

`select` 메서드는 항상 결과를 `array` 형태로 반환합니다. 배열 내 각 원소는 데이터베이스의 한 레코드를 나타내는 PHP `stdClass` 객체가 됩니다:

```php
use Illuminate\Support\Facades\DB;

$users = DB::select('select * from users');

foreach ($users as $user) {
    echo $user->name;
}
```

<a name="selecting-scalar-values"></a>
#### 스칼라 값 조회

쿼리 결과가 하나의 스칼라 값(예: 숫자 한 개, 문자열 한 개 등)인 경우, 일반적으로 레코드 객체에서 값을 추출해야 하지만, 라라벨의 `scalar` 메서드를 사용하면 결과값만 바로 받아올 수 있습니다:

```php
$burgers = DB::scalar(
    "select count(case when food = 'burger' then 1 end) as burgers from menu"
);
```

<a name="selecting-multiple-result-sets"></a>
#### 다중 결과 집합 조회

저장 프로시저와 같이 여러 개의 결과 집합을 반환하는 경우, `selectResultSets` 메서드를 사용해 반환된 모든 결과 집합을 받을 수 있습니다:

```php
[$options, $notifications] = DB::selectResultSets(
    "CALL get_user_options_and_notifications(?)", $request->user()->id
);
```

<a name="using-named-bindings"></a>
#### 네임드 바인딩 사용

파라미터 바인딩 값에 `?` 문자를 사용하는 대신, 이름을 지정하는 방식으로 바인딩할 수도 있습니다:

```php
$results = DB::select('select * from users where id = :id', ['id' => 1]);
```

<a name="running-an-insert-statement"></a>
#### INSERT 문 실행

`insert` 문은 `DB` 파사드의 `insert` 메서드로 실행할 수 있습니다. 사용법은 `select`와 동일하게, 첫 번째 인수에 쿼리문, 두 번째에 바인딩 값을 전달합니다:

```php
use Illuminate\Support\Facades\DB;

DB::insert('insert into users (id, name) values (?, ?)', [1, 'Marc']);
```

<a name="running-an-update-statement"></a>
#### UPDATE 문 실행

`update` 메서드는 데이터베이스 내 기존 레코드를 업데이트할 때 사용하며, 실행된 쿼리에 의해 영향을 받은 행의 수를 반환합니다:

```php
use Illuminate\Support\Facades\DB;

$affected = DB::update(
    'update users set votes = 100 where name = ?',
    ['Anita']
);
```

<a name="running-a-delete-statement"></a>
#### DELETE 문 실행

`delete` 메서드는 데이터베이스에서 레코드를 삭제할 때 사용하며, `update`와 마찬가지로 영향을 받은 행의 수를 반환합니다:

```php
use Illuminate\Support\Facades\DB;

$deleted = DB::delete('delete from users');
```

<a name="running-a-general-statement"></a>
#### 일반 구문 실행

반환값이 필요없는 데이터베이스 명령의 경우, `DB` 파사드의 `statement` 메서드를 사용할 수 있습니다:

```php
DB::statement('drop table users');
```

<a name="running-an-unprepared-statement"></a>
#### 바인딩 없는 구문 실행

파라미터 바인딩 없이 SQL을 실행해야 하는 경우에는 `DB` 파사드의 `unprepared` 메서드를 사용할 수 있습니다:

```php
DB::unprepared('update users set votes = 100 where name = "Dries"');
```

> [!WARNING]
> `unprepared` 문은 파라미터를 바인딩하지 않으므로, SQL 인젝션에 취약할 수 있습니다. 절대 사용자가 제어하는 값을 직접 삽입해선 안 됩니다.

<a name="implicit-commits-in-transactions"></a>
#### 암묵적 커밋

트랜잭션 내에서 `DB` 파사드의 `statement` 및 `unprepared` 메서드를 사용할 때는 [암묵적 커밋(implicit commits)](https://dev.mysql.com/doc/refman/8.0/en/implicit-commit.html)을 유발하는 구문을 주의해야 합니다. 이런 쿼리가 실행되면 데이터베이스 엔진이 트랜잭션 전체를 강제로 커밋하여, 라라벨이 트랜잭션 상태를 인지할 수 없게 됩니다. 예를 들어 테이블을 생성하는 구문이 이에 해당됩니다:

```php
DB::unprepared('create table a (col varchar(1) null)');
```

암묵적 커밋을 유발하는 모든 구문 목록은 MySQL 매뉴얼의 [관련 문서](https://dev.mysql.com/doc/refman/8.0/en/implicit-commit.html)를 참고하시기 바랍니다.

<a name="using-multiple-database-connections"></a>
### 여러 데이터베이스 연결 사용

애플리케이션에서 `config/database.php`에 여러 연결을 정의하면, `DB` 파사드의 `connection` 메서드를 사용하여 각 연결을 사용할 수 있습니다. 전달하는 연결 이름은 `config/database.php` 파일에 정의되어 있거나, 런타임에 `config` 헬퍼로 등록된 이름이어야 합니다:

```php
use Illuminate\Support\Facades\DB;

$users = DB::connection('sqlite')->select(/* ... */);
```

또한, 연결 인스턴스에서 `getPdo` 메서드를 사용하면 해당 PDO(저수준 데이터베이스 연결) 인스턴스에 직접 접근할 수 있습니다:

```php
$pdo = DB::connection()->getPdo();
```

<a name="listening-for-query-events"></a>
### 쿼리 이벤트 리스닝

애플리케이션에서 실행된 모든 SQL 쿼리마다 호출되는 클로저를 지정하고 싶다면, `DB` 파사드의 `listen` 메서드를 사용할 수 있습니다. 이 기능은 쿼리 로그를 남기거나 디버깅할 때 유용합니다. 이 리스너는 [서비스 프로바이더](/docs/12.x/providers)의 `boot` 메서드 내에서 등록하시면 됩니다:

```php
<?php

namespace App\Providers;

use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * 애플리케이션 서비스 등록
     */
    public function register(): void
    {
        // ...
    }

    /**
     * 애플리케이션 서비스 부트스트랩
     */
    public function boot(): void
    {
        DB::listen(function (QueryExecuted $query) {
            // $query->sql;
            // $query->bindings;
            // $query->time;
            // $query->toRawSql();
        });
    }
}
```

<a name="monitoring-cumulative-query-time"></a>
### 누적 쿼리 시간 모니터링

현대 웹 애플리케이션의 성능 병목 요소 중 하나는 데이터베이스 쿼리에 소요되는 시간입니다. 라라벨에서는 한 번의 요청에서 데이터베이스 쿼리로 너무 많은 시간이 소모되는 경우, 지정한 임계값을 초과하면 선택한 콜백이나 클로저가 호출되도록 할 수 있습니다. 사용 방법은 [서비스 프로바이더](/docs/12.x/providers)의 `boot` 메서드에서 임계값(밀리초 단위)과 클로저를 `whenQueryingForLongerThan` 메서드에 전달하는 것입니다:

```php
<?php

namespace App\Providers;

use Illuminate\Database\Connection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Events\QueryExecuted;

class AppServiceProvider extends ServiceProvider
{
    /**
     * 애플리케이션 서비스 등록
     */
    public function register(): void
    {
        // ...
    }

    /**
     * 애플리케이션 서비스 부트스트랩
     */
    public function boot(): void
    {
        DB::whenQueryingForLongerThan(500, function (Connection $connection, QueryExecuted $event) {
            // 개발팀에 알림 전송 등...
        });
    }
}
```

<a name="database-transactions"></a>
## 데이터베이스 트랜잭션

`DB` 파사드가 제공하는 `transaction` 메서드를 이용하면, 여러 작업을 트랜잭션 안에서 실행할 수 있습니다. 트랜잭션 클로저 내에서 예외가 발생하면 트랜잭션 전체가 자동으로 롤백되고 예외가 다시 발생합니다. 클로저가 성공적으로 실행되면 자동으로 커밋되므로, 직접 롤백이나 커밋을 신경 쓸 필요가 없습니다:

```php
use Illuminate\Support\Facades\DB;

DB::transaction(function () {
    DB::update('update users set votes = 1');

    DB::delete('delete from posts');
});
```

<a name="handling-deadlocks"></a>
#### 데드락 처리

`transaction` 메서드는 데드락이 발생했을 때 트랜잭션을 몇 번 재시도할지 지정하는 선택적 두 번째 인수를 받을 수 있습니다. 지정한 횟수만큼 재시도해도 해결되지 않으면 예외가 발생합니다:

```php
use Illuminate\Support\Facades\DB;

DB::transaction(function () {
    DB::update('update users set votes = 1');

    DB::delete('delete from posts');
}, 5);
```

<a name="manually-using-transactions"></a>
#### 수동 트랜잭션 사용

트랜잭션의 롤백과 커밋을 직접 제어하고 싶다면, `DB` 파사드의 `beginTransaction` 메서드를 사용해 트랜잭션을 시작할 수 있습니다:

```php
use Illuminate\Support\Facades\DB;

DB::beginTransaction();
```

트랜잭션을 롤백하려면 `rollBack` 메서드를 사용합니다:

```php
DB::rollBack();
```

트랜잭션을 커밋하려면 `commit` 메서드를 호출합니다:

```php
DB::commit();
```

> [!NOTE]
> `DB` 파사드의 트랜잭션 메서드는 [쿼리 빌더](/docs/12.x/queries)와 [Eloquent ORM](/docs/12.x/eloquent) 양쪽에 대해 모두 트랜잭션을 제어합니다.

<a name="connecting-to-the-database-cli"></a>
## 데이터베이스 CLI 연결

데이터베이스의 CLI에 접속하려면, `db` 아티즌 명령어를 사용할 수 있습니다:

```shell
php artisan db
```

필요하다면, 기본 연결이 아닌 다른 데이터베이스 연결 이름을 지정해 해당 연결로 접속할 수도 있습니다:

```shell
php artisan db mysql
```

<a name="inspecting-your-databases"></a>
## 데이터베이스 점검

`db:show` 및 `db:table` 아티즌 명령어를 통해 데이터베이스 및 관련 테이블에 대한 유용한 정보를 얻을 수 있습니다. 데이터베이스의 개요, 용량, 종류, 오픈된 연결 수, 테이블 요약을 확인하려면 `db:show` 명령어를 사용하면 됩니다:

```shell
php artisan db:show
```

명령어에 `--database` 옵션을 전달하면 어떤 데이터베이스 연결을 점검할지 지정할 수 있습니다:

```shell
php artisan db:show --database=pgsql
```

테이블의 행 수, 데이터베이스 뷰 정보를 결과에 포함하려면 각각 `--counts`, `--views` 옵션을 추가합니다. 대형 데이터베이스의 경우 행 수 및 뷰 조회 작업이 느릴 수 있습니다:

```shell
php artisan db:show --counts --views
```

또한, 다음과 같은 `Schema` 메서드를 이용해 데이터베이스를 점검할 수 있습니다:

```php
use Illuminate\Support\Facades\Schema;

$tables = Schema::getTables();
$views = Schema::getViews();
$columns = Schema::getColumns('users');
$indexes = Schema::getIndexes('users');
$foreignKeys = Schema::getForeignKeys('users');
```

기본 데이터베이스 연결이 아닌 다른 연결을 점검하고 싶다면, `connection` 메서드를 사용할 수도 있습니다:

```php
$columns = Schema::connection('sqlite')->getColumns('users');
```

<a name="table-overview"></a>
#### 테이블 개요

특정 테이블에 대한 개요 정보를 얻으려면 `db:table` 아티즌 명령어를 실행하면 됩니다. 이 명령어는 지정된 데이터베이스 테이블의 컬럼, 타입, 속성, 키, 인덱스 등의 일반 정보를 제공합니다:

```shell
php artisan db:table users
```

<a name="monitoring-your-databases"></a>
## 데이터베이스 모니터링

`db:monitor` 아티즌 명령어를 사용하여 데이터베이스의 오픈 연결 수가 지정된 개수 이상이 될 경우, 라라벨이 `Illuminate\Database\Events\DatabaseBusy` 이벤트를 발생시키도록 할 수 있습니다.

우선, 이 명령어가 [매분 실행](/docs/12.x/scheduling)되도록 스케줄링해야 합니다. 명령어에는 모니터링할 데이터베이스 연결 설정의 이름과, 이벤트가 발생할 임계치(최대 오픈 연결 수)를 지정합니다:

```shell
php artisan db:monitor --databases=mysql,pgsql --max=100
```

이 명령어를 단독으로 실행한다고 해서 경고 알림이 발생하는 것은 아닙니다. 명령어 실행 시 연결 수가 임계치를 초과하는 데이터베이스가 있으면 `DatabaseBusy` 이벤트가 발생합니다. 이 이벤트를 서비스 프로바이더의 `AppServiceProvider`에서 감지하여 개발팀 또는 본인에게 알림을 보낼 수 있습니다:

```php
use App\Notifications\DatabaseApproachingMaxConnections;
use Illuminate\Database\Events\DatabaseBusy;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;

/**
 * 애플리케이션 서비스 부트스트랩
 */
public function boot(): void
{
    Event::listen(function (DatabaseBusy $event) {
        Notification::route('mail', 'dev@example.com')
            ->notify(new DatabaseApproachingMaxConnections(
                $event->connectionName,
                $event->connections
            ));
    });
}
```
