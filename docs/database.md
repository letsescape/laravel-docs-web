# 데이터베이스: 시작하기 (Database: Getting Started)

- [소개](#introduction)
    - [구성](#configuration)
    - [읽기 및 쓰기 연결](#read-and-write-connections)
- [SQL 쿼리 실행하기](#running-queries)
    - [여러 데이터베이스 연결 사용하기](#using-multiple-database-connections)
    - [쿼리 이벤트 리스닝](#listening-for-query-events)
    - [누적 쿼리 시간 모니터링](#monitoring-cumulative-query-time)
- [데이터베이스 트랜잭션](#database-transactions)
- [데이터베이스 CLI에 연결하기](#connecting-to-the-database-cli)
- [데이터베이스 정보 확인](#inspecting-your-databases)
- [데이터베이스 모니터링](#monitoring-your-databases)

<a name="introduction"></a>
## 소개

대부분의 최신 웹 애플리케이션은 데이터베이스와 상호작용합니다. 라라벨은 다양한 데이터베이스를 지원하며, 원시 SQL, [유연한 쿼리 빌더](/docs/queries), [Eloquent ORM](/docs/eloquent)를 통해 데이터베이스와 매우 쉽게 연동할 수 있습니다. 현재 라라벨은 다음 5가지 데이터베이스를 공식적으로 지원합니다.

<div class="content-list" markdown="1">

- MariaDB 10.3+ ([버전 정책](https://mariadb.org/about/#maintenance-policy))
- MySQL 5.7+ ([버전 정책](https://en.wikipedia.org/wiki/MySQL#Release_history))
- PostgreSQL 10.0+ ([버전 정책](https://www.postgresql.org/support/versioning/))
- SQLite 3.26.0+
- SQL Server 2017+ ([버전 정책](https://docs.microsoft.com/en-us/lifecycle/products/?products=sql-server))

</div>

추가로, MongoDB를 사용하고자 한다면 공식적으로 MongoDB에서 관리하는 `mongodb/laravel-mongodb` 패키지를 통해 지원받을 수 있습니다. 더 자세한 내용은 [Laravel MongoDB](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/) 문서를 참고하세요.

<a name="configuration"></a>
### 구성

라라벨의 데이터베이스 서비스 설정 파일은 애플리케이션의 `config/database.php` 내에 있습니다. 이 파일에서 모든 데이터베이스 연결을 정의할 수 있으며, 기본적으로 사용할 연결도 지정할 수 있습니다. 이 파일 내 대부분의 설정 값은 애플리케이션의 환경 변수 값을 기반으로 합니다. 라라벨에서 지원하는 여러 데이터베이스 시스템에 대한 예시도 이 설정 파일에 포함되어 있습니다.

기본적으로, 라라벨의 샘플 [환경 설정](/docs/configuration#environment-configuration)은 [Laravel Sail](/docs/sail)과 바로 사용할 수 있도록 구성되어 있습니다. Sail은 로컬 환경에서 라라벨 애플리케이션 개발을 위한 Docker 구성입니다. 하지만 로컬 데이터베이스에 맞게 설정을 자유롭게 수정할 수 있습니다.

<a name="sqlite-configuration"></a>
#### SQLite 구성

SQLite 데이터베이스는 파일 시스템 내 단일 파일에 저장됩니다. 터미널에서 `touch database/database.sqlite` 명령어로 새 SQLite 데이터베이스 파일을 만들 수 있습니다. 데이터베이스가 생성된 후에는, 환경 변수 `DB_DATABASE`에 해당 데이터베이스의 **절대 경로**를 지정하여 쉽게 사용할 수 있습니다.

```ini
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/database.sqlite
```

기본적으로 SQLite 연결은 외래키 제약 조건이 활성화되어 있습니다. 만약 외래키를 비활성화하고 싶다면, `DB_FOREIGN_KEYS` 환경 변수를 `false`로 설정하면 됩니다.

```ini
DB_FOREIGN_KEYS=false
```

> [!NOTE]
> [라라벨 인스톨러](/docs/installation#creating-a-laravel-project)를 사용해 라라벨 애플리케이션 생성 시 데이터베이스로 SQLite를 선택하면, 라라벨이 자동으로 `database/database.sqlite` 파일을 만들어주고, 기본 [데이터베이스 마이그레이션](/docs/migrations)도 실행합니다.

<a name="mssql-configuration"></a>
#### Microsoft SQL Server 구성

Microsoft SQL Server 데이터베이스를 사용하려면, `sqlsrv`, `pdo_sqlsrv` PHP 확장과 그에 필요한 Microsoft SQL ODBC 드라이버 등 모든 종속성이 설치되어 있어야 합니다.

<a name="configuration-using-urls"></a>
#### URL을 이용한 구성

일반적으로 데이터베이스 연결은 `host`, `database`, `username`, `password` 등 여러 개의 설정값을 각각 환경 변수로 지정하여 구성합니다. 즉, 운영 서버에서 데이터베이스 연결 정보를 설정할 때 여러 환경 변수를 관리해야 합니다.

AWS나 Heroku 같은 일부 관리형 데이터베이스 제공업체들은 모든 연결 정보를 하나의 문자열로 제공하는 데이터베이스 "URL"을 지원합니다. 예시 URL은 다음과 같습니다.

```html
mysql://root:password@127.0.0.1/forge?charset=UTF-8
```

이 URL은 다음과 같은 형태의 표준 스키마를 따릅니다.

```html
driver://username:password@host:port/database?options
```

라라벨은 이러한 URL 형태의 구성을 지원합니다. 환경 변수에 `url`(또는 `DB_URL`) 설정값이 있으면, 이 값을 활용해 데이터베이스 연결 정보와 인증 정보를 추출합니다.

<a name="read-and-write-connections"></a>
### 읽기 및 쓰기 연결

때로는 SELECT문(읽기)과 INSERT/UPDATE/DELETE문(쓰기)에 서로 다른 데이터베이스 연결을 사용하고 싶을 수 있습니다. 라라벨에서는 원시 쿼리, 쿼리 빌더, Eloquent ORM을 사용할 때도 각각에 맞는 연결을 항상 적절히 자동으로 사용합니다.

읽기/쓰기 연결을 어떻게 설정하는지 예시를 살펴보겠습니다.

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

위 설정에서 세 개의 주요 키(`read`, `write`, `sticky`)가 추가되었습니다. `read`와 `write` 키에는 각각 하나의 하위 키로 `host`가 지정되어 있습니다. 나머지 데이터베이스 옵션은 메인 `mysql` 설정 배열에서 각각의 연결로 병합됩니다.

만약 특정 값을 덮어쓰고 싶을 때만 `read`와 `write` 배열에 값을 추가하면 됩니다. 위 예시에서는 "read" 연결에는 `192.168.1.1`, "write" 연결에는 `192.168.1.3`이 각각 사용됩니다. 데이터베이스 인증 정보, 프리픽스, 문자셋 등은 메인 `mysql` 배열의 값이 공유됩니다. 또한 `host` 배열에 여러 값을 지정하면, 요청마다 데이터베이스 호스트가 랜덤하게 선택됩니다.

<a name="the-sticky-option"></a>
#### `sticky` 옵션

`sticky` 옵션은 *선택 사항*이며, 현재 요청 처리 중에 데이터베이스에 "쓰기" 작업을 한 경우, 바로 이어지는 "읽기" 작업에서 자동으로 "쓰기" 연결을 사용하도록 해줍니다. 이 옵션을 활성화하면, 한 요청 안에서 데이터베이스에 값을 썼을 때 바로 그 값을 다시 읽어올 수 있습니다. 이 동작이 애플리케이션에 필요하다면 `sticky` 옵션을 사용하면 됩니다.

<a name="running-queries"></a>
## SQL 쿼리 실행하기

데이터베이스 연결을 설정한 이후에는, `DB` 파사드를 이용해 쿼리를 실행할 수 있습니다. `DB` 파사드는 `select`, `update`, `insert`, `delete`, `statement` 등 쿼리 유형별 메서드를 제공합니다.

<a name="running-a-select-query"></a>
#### Select 쿼리 실행

기본적인 SELECT 쿼리는 `DB` 파사드의 `select` 메서드를 이용해 실행할 수 있습니다.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * 애플리케이션의 모든 사용자 목록 보여주기
     */
    public function index(): View
    {
        $users = DB::select('select * from users where active = ?', [1]);

        return view('user.index', ['users' => $users]);
    }
}
```

`select` 메서드의 첫 번째 인수는 SQL 쿼리이며, 두 번째 인수는 바인딩할 파라미터 배열입니다. 보통 WHERE 절에 들어가는 값들을 바인딩합니다. 파라미터 바인딩을 사용하면 SQL 인젝션 공격을 예방할 수 있습니다.

`select` 메서드는 항상 결과를 `array`로 반환합니다. 배열의 각 항목은 데이터베이스 레코드를 나타내는 PHP의 `stdClass` 객체입니다.

```php
use Illuminate\Support\Facades\DB;

$users = DB::select('select * from users');

foreach ($users as $user) {
    echo $user->name;
}
```

<a name="selecting-scalar-values"></a>
#### 스칼라 값 조회

쿼리 결과가 하나의 스칼라 값(숫자, 문자열)일 때, 객체에서 값을 꺼내는 대신 `scalar` 메서드를 사용해 바로 값을 얻을 수 있습니다.

```php
$burgers = DB::scalar(
    "select count(case when food = 'burger' then 1 end) as burgers from menu"
);
```

<a name="selecting-multiple-result-sets"></a>
#### 다중 결과 집합 조회

프로시저 등에서 여러 결과 집합을 반환하는 경우, `selectResultSets` 메서드를 사용해 각각의 결과 집합을 모두 받아올 수 있습니다.

```php
[$options, $notifications] = DB::selectResultSets(
    "CALL get_user_options_and_notifications(?)", $request->user()->id
);
```

<a name="using-named-bindings"></a>
#### 명명된 바인딩 사용

파라미터 바인딩 시, `?` 대신 이름 지정 바인딩 방식도 사용할 수 있습니다.

```php
$results = DB::select('select * from users where id = :id', ['id' => 1]);
```

<a name="running-an-insert-statement"></a>
#### Insert 문 실행

`insert` 문을 실행할 때는 `DB` 파사드의 `insert` 메서드를 사용합니다. 사용법은 `select`와 동일합니다.

```php
use Illuminate\Support\Facades\DB;

DB::insert('insert into users (id, name) values (?, ?)', [1, 'Marc']);
```

<a name="running-an-update-statement"></a>
#### Update 문 실행

기존 레코드를 수정하려면 `update` 메서드를 사용합니다. 이 메서드는 영향을 받은 행(row)의 수를 반환합니다.

```php
use Illuminate\Support\Facades\DB;

$affected = DB::update(
    'update users set votes = 100 where name = ?',
    ['Anita']
);
```

<a name="running-a-delete-statement"></a>
#### Delete 문 실행

레코드를 삭제하려면 `delete` 메서드를 사용합니다. `update`와 마찬가지로 영향받은 행의 수를 반환합니다.

```php
use Illuminate\Support\Facades\DB;

$deleted = DB::delete('delete from users');
```

<a name="running-a-general-statement"></a>
#### 일반 쿼리 실행

값을 반환하지 않는 명령문(예: 테이블 삭제 등)은 `statement` 메서드를 사용할 수 있습니다.

```php
DB::statement('drop table users');
```

<a name="running-an-unprepared-statement"></a>
#### Preparer 없이 쿼리 실행

값을 바인딩하지 않고 SQL을 바로 실행하고 싶을 때는 `DB` 파사드의 `unprepared` 메서드를 사용할 수 있습니다.

```php
DB::unprepared('update users set votes = 100 where name = "Dries"');
```

> [!WARNING]
> `unprepared` 메서드는 파라미터 바인딩을 하지 않으므로, SQL 인젝션에 취약할 수 있습니다. 사용자 입력 값을 직접 포함해서는 절대 안 됩니다.

<a name="implicit-commits-in-transactions"></a>
#### 암묵적 커밋(Implicit Commits)

`DB` 파사드의 `statement`나 `unprepared` 메서드를 트랜잭션 내에서 사용할 때, 일부 쿼리는 [암묵적 커밋](https://dev.mysql.com/doc/refman/8.0/en/implicit-commit.html)을 유발할 수 있으니 주의하세요. 이런 쿼리는 데이터베이스의 전체 트랜잭션을 자동으로 커밋해버리며, 라라벨에서는 이를 추적할 수 없습니다. 예를 들어, 테이블을 생성하는 쿼리가 해당됩니다.

```php
DB::unprepared('create table a (col varchar(1) null)');
```

암묵적 커밋을 유발하는 모든 명령문 목록은 MySQL 매뉴얼의 [해당 문서](https://dev.mysql.com/doc/refman/8.0/en/implicit-commit.html)를 참고하세요.

<a name="using-multiple-database-connections"></a>
### 여러 데이터베이스 연결 사용하기

애플리케이션의 `config/database.php`에 여러 연결을 정의했다면, `DB` 파사드의 `connection` 메서드를 사용해 각 연결에 접근할 수 있습니다. 인수에는 연결 이름을 지정하며, 해당 이름은 설정 파일에 나와 있거나 런타임에 `config` 헬퍼로 지정할 수 있습니다.

```php
use Illuminate\Support\Facades\DB;

$users = DB::connection('sqlite')->select(/* ... */);
```

연결 인스턴스의 `getPdo` 메서드를 사용하면 원시 PDO 인스턴스를 직접 사용할 수도 있습니다.

```php
$pdo = DB::connection()->getPdo();
```

<a name="listening-for-query-events"></a>
### 쿼리 이벤트 리스닝

애플리케이션에서 실행되는 모든 SQL 쿼리에 대해 클로저(함수)를 실행하고 싶다면, `DB` 파사드의 `listen` 메서드를 이용할 수 있습니다. 이 메서드는 로그 기록이나 디버깅에 유용합니다. 쿼리 리스너는 [서비스 프로바이더](/docs/providers)의 `boot` 메서드에서 등록하면 됩니다.

```php
<?php

namespace App\Providers;

use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * 서비스 등록
     */
    public function register(): void
    {
        // ...
    }

    /**
     * 서비스 부트스트랩
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

모던 웹 애플리케이션에서 성능 병목의 대표적인 원인 중 하나는 데이터베이스 쿼리에 소요되는 시간입니다. 라라벨은 단일 요청 중 데이터베이스 쿼리에 너무 많은 시간이 소모될 경우, 지정한 클로저(콜백 함수)를 호출할 수 있습니다. 사용 방법은 `whenQueryingForLongerThan` 메서드에 임계값(밀리초 단위)과 콜백을 넘기면 됩니다. 이 메서드는 [서비스 프로바이더](/docs/providers)의 `boot` 메서드에서 호출할 수 있습니다.

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
     * 서비스 등록
     */
    public function register(): void
    {
        // ...
    }

    /**
     * 서비스 부트스트랩
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

여러 작업을 하나의 데이터베이스 트랜잭션 내에서 실행하려면, `DB` 파사드가 제공하는 `transaction` 메서드를 사용할 수 있습니다. 트랜잭션 클로저 내에서 예외가 발생하면 트랜잭션은 자동으로 롤백되고, 예외가 다시 던져집니다. 클로저가 정상적으로 끝나면 자동으로 커밋됩니다. 즉, 수동으로 롤백이나 커밋을 신경 쓰지 않아도 됩니다.

```php
use Illuminate\Support\Facades\DB;

DB::transaction(function () {
    DB::update('update users set votes = 1');

    DB::delete('delete from posts');
});
```

<a name="handling-deadlocks"></a>
#### 데드락 처리

`transaction` 메서드는 선택적으로 두 번째 인수로, 데드락이 발생했을 때 트랜잭션을 재시도할 횟수를 지정할 수 있습니다. 지정한 횟수만큼 모두 시도해도 문제가 해결되지 않으면 예외가 발생합니다.

```php
use Illuminate\Support\Facades\DB;

DB::transaction(function () {
    DB::update('update users set votes = 1');

    DB::delete('delete from posts');
}, 5);
```

<a name="manually-using-transactions"></a>
#### 수동으로 트랜잭션 사용

직접 트랜잭션을 시작하고, 롤백과 커밋을 수동으로 제어하고 싶다면, `DB` 파사드의 `beginTransaction` 메서드를 사용할 수 있습니다.

```php
use Illuminate\Support\Facades\DB;

DB::beginTransaction();
```

트랜잭션을 롤백하려면 `rollBack` 메서드를 호출합니다.

```php
DB::rollBack();
```

마지막으로, 트랜잭션을 커밋하려면 `commit` 메서드를 사용합니다.

```php
DB::commit();
```

> [!NOTE]
> `DB` 파사드의 트랜잭션 제어 메서드는 [쿼리 빌더](/docs/queries), [Eloquent ORM](/docs/eloquent) 양쪽 모두에 적용됩니다.

<a name="connecting-to-the-database-cli"></a>
## 데이터베이스 CLI에 연결하기

데이터베이스의 CLI에 직접 연결하고 싶다면, `db` Artisan 명령어를 사용할 수 있습니다.

```shell
php artisan db
```

기본 연결이 아닌 다른 데이터베이스를 사용하고 싶다면, 연결 이름을 명령어에 추가해주면 됩니다.

```shell
php artisan db mysql
```

<a name="inspecting-your-databases"></a>
## 데이터베이스 정보 확인

`db:show` 및 `db:table` Artisan 명령어를 사용하면 데이터베이스와 연관된 테이블에 대한 다양한 정보를 확인할 수 있습니다. 데이터베이스 개요(크기, 타입, 열려 있는 연결 수, 테이블 요약 등)를 확인하려면 `db:show` 명령어를 사용하세요.

```shell
php artisan db:show
```

점검할 데이터베이스 연결을 명령어의 `--database` 옵션을 사용해 지정할 수도 있습니다.

```shell
php artisan db:show --database=pgsql
```

테이블의 행 개수나 뷰(View) 정보까지 포함해 출력하려면 `--counts`, `--views` 옵션을 사용할 수 있습니다. 대용량 데이터베이스에서는 행 개수와 뷰 정보 조회가 느릴 수 있습니다.

```shell
php artisan db:show --counts --views
```

추가적으로, 다음과 같은 `Schema` 메서드를 통해 프로그램 코드에서도 데이터베이스 정보를 점검할 수 있습니다.

```php
use Illuminate\Support\Facades\Schema;

$tables = Schema::getTables();
$views = Schema::getViews();
$columns = Schema::getColumns('users');
$indexes = Schema::getIndexes('users');
$foreignKeys = Schema::getForeignKeys('users');
```

기본 연결이 아닌 다른 연결 정보를 점검하고 싶다면 `connection` 메서드를 사용할 수 있습니다.

```php
$columns = Schema::connection('sqlite')->getColumns('users');
```

<a name="table-overview"></a>
#### 테이블 요약

데이터베이스 내 특정 테이블의 개요를 보고 싶다면, `db:table` Artisan 명령어를 실행하면 됩니다. 이 명령어는 테이블의 컬럼, 타입, 속성, 키, 인덱스 등을 일람으로 보여줍니다.

```shell
php artisan db:table users
```

<a name="monitoring-your-databases"></a>
## 데이터베이스 모니터링

`db:monitor` Artisan 명령어를 사용하면, 데이터베이스에서 열린 연결이 특정 개수 이상이 될 경우 `Illuminate\Database\Events\DatabaseBusy` 이벤트를 디스패치하도록 할 수 있습니다.

먼저, `db:monitor` 명령어를 [매분 실행](/docs/scheduling)되도록 예약하세요. 명령어는 모니터링할 데이터베이스 연결 이름과 이벤트 발생 임계값(열린 연결 수)을 인수로 받을 수 있습니다.

```shell
php artisan db:monitor --databases=mysql,pgsql --max=100
```

이 명령어만으로는 알림이 자동으로 전송되지 않습니다. 연결 개수가 임계값을 초과하는 데이터베이스를 감지하면 `DatabaseBusy` 이벤트를 발생시키며, 알림을 받고 싶다면 애플리케이션의 `AppServiceProvider`에서 이 이벤트를 리스닝하여 팀원이나 자신에게 직접 알릴 수 있도록 해야 합니다.

```php
use App\Notifications\DatabaseApproachingMaxConnections;
use Illuminate\Database\Events\DatabaseBusy;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;

/**
 * 서비스 부트스트랩
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
