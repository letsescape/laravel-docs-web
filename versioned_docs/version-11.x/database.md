# 데이터베이스: 시작하기 (Database: Getting Started)

- [소개](#introduction)
    - [설정](#configuration)
    - [읽기 및 쓰기 연결](#read-and-write-connections)
- [SQL 쿼리 실행하기](#running-queries)
    - [다중 데이터베이스 연결 사용하기](#using-multiple-database-connections)
    - [쿼리 이벤트 리스닝](#listening-for-query-events)
    - [누적 쿼리 시간 모니터링](#monitoring-cumulative-query-time)
- [데이터베이스 트랜잭션](#database-transactions)
- [데이터베이스 CLI 연결하기](#connecting-to-the-database-cli)
- [데이터베이스 점검](#inspecting-your-databases)
- [데이터베이스 모니터링](#monitoring-your-databases)

<a name="introduction"></a>
## 소개

현대의 거의 모든 웹 애플리케이션은 데이터베이스와 상호작용합니다. 라라벨은 다양한 지원 데이터베이스에 대해 Raw SQL, [유창한 쿼리 빌더](/docs/11.x/queries), [Eloquent ORM](/docs/11.x/eloquent)을 사용하여 데이터베이스 작업을 매우 쉽게 할 수 있도록 도와줍니다. 현재 라라벨은 다음 다섯 가지 데이터베이스를 공식적으로 지원합니다.

<div class="content-list" markdown="1">

- MariaDB 10.3+ ([버전 정책](https://mariadb.org/about/#maintenance-policy))
- MySQL 5.7+ ([버전 정책](https://en.wikipedia.org/wiki/MySQL#Release_history))
- PostgreSQL 10.0+ ([버전 정책](https://www.postgresql.org/support/versioning/))
- SQLite 3.26.0+
- SQL Server 2017+ ([버전 정책](https://docs.microsoft.com/en-us/lifecycle/products/?products=sql-server))

</div>

또한 MongoDB는 MongoDB에서 공식적으로 관리하는 `mongodb/laravel-mongodb` 패키지를 통해 사용할 수 있습니다. 더 자세한 내용은 [Laravel MongoDB](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/) 문서를 참고하십시오.

<a name="configuration"></a>
### 설정

라라벨의 데이터베이스 서비스에 대한 설정 파일은 애플리케이션의 `config/database.php` 파일에 위치합니다. 이 파일에서 모든 데이터베이스 연결을 정의할 수 있으며, 어떤 연결을 기본값으로 사용할지 지정할 수 있습니다. 이 설정 파일 내 대부분의 옵션은 애플리케이션의 환경 변수 값에 의해 설정됩니다. 라라벨에서 지원하는 대부분의 데이터베이스 시스템에 대한 예제가 이 파일에 포함되어 있습니다.

기본적으로, 라라벨의 샘플 [환경 설정](/docs/11.x/configuration#environment-configuration)은 [Laravel Sail](/docs/11.x/sail)과 함께 바로 사용할 수 있도록 준비되어 있습니다. Laravel Sail은 로컬 개발 환경에서 라라벨 애플리케이션을 Docker로 실행할 수 있도록 돕는 구성입니다. 하지만 필요에 따라 로컬 데이터베이스 환경에 맞게 데이터베이스 설정을 자유롭게 수정할 수 있습니다.

<a name="sqlite-configuration"></a>
#### SQLite 설정

SQLite 데이터베이스는 파일 시스템상의 단일 파일에 저장됩니다. 터미널에서 `touch` 명령어를 사용하여 새로운 SQLite 데이터베이스 파일을 만들 수 있습니다: `touch database/database.sqlite`. 데이터베이스를 만든 후에는 환경 변수 `DB_DATABASE`에 데이터베이스의 절대 경로를 지정하여 해당 데이터베이스를 설정할 수 있습니다.

```ini
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/database.sqlite
```

기본적으로 SQLite 연결에 대해 외래 키 제약 조건이 활성화되어 있습니다. 만약 이를 비활성화하고 싶다면, 환경 변수 `DB_FOREIGN_KEYS`를 `false`로 설정해야 합니다.

```ini
DB_FOREIGN_KEYS=false
```

> [!NOTE]  
> [라라벨 설치 프로그램](/docs/11.x/installation#creating-a-laravel-project)을 이용해 애플리케이션을 생성하고 데이터베이스로 SQLite를 선택하면, 라라벨은 자동으로 `database/database.sqlite` 파일을 생성하고 기본 [데이터베이스 마이그레이션](/docs/11.x/migrations)을 수행합니다.

<a name="mssql-configuration"></a>
#### Microsoft SQL Server 설정

Microsoft SQL Server 데이터베이스를 사용하려면, `sqlsrv` 및 `pdo_sqlsrv` PHP 확장자와 해당 확장자가 필요로 하는 Microsoft SQL ODBC 드라이버 등의 모든 종속성을 설치해야 합니다.

<a name="configuration-using-urls"></a>
#### URL을 이용한 설정

일반적으로 데이터베이스 연결은 `host`, `database`, `username`, `password` 등 여러 설정 값으로 이루어집니다. 각각의 설정 값은 별도의 환경 변수에 지정합니다. 따라서 운영 서버에서 데이터베이스 연결 정보를 관리할 때에는 여러 개의 환경 변수를 다루게 됩니다.

AWS나 Heroku 같은 일부 관리형 데이터베이스 서비스는 데이터베이스 정보가 모두 하나의 문자열로 포함된 "URL"을 제공합니다. 예를 들어, 다음과 같은 데이터베이스 URL이 나올 수 있습니다.

```html
mysql://root:password@127.0.0.1/forge?charset=UTF-8
```

이러한 URL은 일반적으로 다음과 같은 표준 스키마를 따릅니다.

```html
driver://username:password@host:port/database?options
```

라라벨에서는 이러한 URL 기반 설정도 지원합니다. `url`(또는 `DB_URL` 환경 변수) 설정 옵션이 있으면, 이 값에서 데이터베이스 접속 정보와 인증 정보를 추출합니다.

<a name="read-and-write-connections"></a>
### 읽기 및 쓰기 연결

경우에 따라 SELECT 쿼리는 한 데이터베이스 연결을 사용하고, INSERT, UPDATE, DELETE 쿼리는 다른 연결을 사용하고 싶을 수 있습니다. 라라벨에서는 쿼리 유형에 맞는 적절한 연결을 자동으로 사용하므로, Raw 쿼리, 쿼리 빌더, Eloquent ORM을 사용해도 항상 올바른 연결이 사용됩니다.

읽기/쓰기 연결 구성을 살펴보기 위해 예시를 보겠습니다.

```
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

위 예시에서는 `read`, `write`, `sticky` 세 가지 키가 추가된 것을 볼 수 있습니다. `read` 및 `write` 키는 모두 `host` 값을 가진 배열입니다. 나머지 데이터베이스 옵션들은 메인 `mysql` 설정 배열에서 각각 읽기/쓰기 연결로 병합해서 사용합니다.

기본 설정을 그대로 사용하고 싶다면, `read`와 `write` 배열에는 실제로 오버라이드하고 싶은 항목만 추가하면 됩니다. 예시에서는 "읽기" 연결에 `192.168.1.1`이, "쓰기" 연결에는 `192.168.1.3`이 각각 사용됩니다. 데이터베이스 인증 정보, 접두사, 문자셋 등 기타 옵션은 모두 메인 `mysql` 배열에서 공유됩니다. `host` 값에 여러 개의 IP가 있을 경우, 각 요청마다 랜덤하게 데이터베이스 호스트가 선택되어 사용됩니다.

<a name="the-sticky-option"></a>
#### `sticky` 옵션

`sticky` 옵션은 *선택 사항*으로, 현재 요청 사이클 동안 데이터베이스에 쓰기 작업이 발생했다면 즉시 해당 데이터가 읽기에 반영되도록 "쓰기" 연결을 "읽기"에도 사용할지를 제어합니다. 이 옵션이 활성화되어 있고, 현재 요청 중에 데이터베이스에 "쓰기" 작업이 발생했다면, 이후의 "읽기" 작업도 "쓰기" 연결을 사용하게 됩니다. 이를 통해 요청 내에서 바로 쓴 데이터를 읽을 수 있습니다. 이 동작이 애플리케이션의 의도에 맞는지 고려해 사용하십시오.

<a name="running-queries"></a>
## SQL 쿼리 실행하기

데이터베이스 연결을 설정한 뒤에는, `DB` 파사드를 사용하여 쿼리를 실행할 수 있습니다. `DB` 파사드에는 쿼리 유형별로 `select`, `update`, `insert`, `delete`, `statement` 등의 메서드가 제공됩니다.

<a name="running-a-select-query"></a>
#### SELECT 쿼리 실행

기본 SELECT 쿼리는 `DB` 파사드의 `select` 메서드를 사용해 실행할 수 있습니다.

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * 애플리케이션의 모든 사용자 목록 표시
     */
    public function index(): View
    {
        $users = DB::select('select * from users where active = ?', [1]);

        return view('user.index', ['users' => $users]);
    }
}
```

`select` 메서드의 첫 번째 인자는 SQL 쿼리문이고, 두 번째 인자는 쿼리에 바인딩할 파라미터 배열입니다. 주로 `where` 절에서 사용할 값을 바인딩합니다. 파라미터 바인딩을 사용하면 SQL 인젝션 공격을 예방할 수 있습니다.

`select` 메서드는 항상 결과를 `array` 형태로 반환합니다. 배열의 각 원소는 데이터베이스 레코드를 나타내는 PHP의 `stdClass` 객체입니다.

```
use Illuminate\Support\Facades\DB;

$users = DB::select('select * from users');

foreach ($users as $user) {
    echo $user->name;
}
```

<a name="selecting-scalar-values"></a>
#### 단일 값(스칼라) 조회

가끔 쿼리 결과가 하나의 스칼라 값(단일 값)일 때가 있습니다. 이 경우, 일반적으로 레코드 객체에서 값을 꺼내야 하지만, 라라벨에서는 `scalar` 메서드로 바로 값을 가져올 수 있습니다.

```
$burgers = DB::scalar(
    "select count(case when food = 'burger' then 1 end) as burgers from menu"
);
```

<a name="selecting-multiple-result-sets"></a>
#### 여러 결과 세트 조회

저장 프로시저가 여러 결과 세트를 반환하는 경우, `selectResultSets` 메서드를 사용하여 모든 결과 세트를 받아올 수 있습니다.

```
[$options, $notifications] = DB::selectResultSets(
    "CALL get_user_options_and_notifications(?)", $request->user()->id
);
```

<a name="using-named-bindings"></a>
#### 네임드 바인딩(Named Bindings) 사용

파라미터 바인딩 시 `?` 대신 변수명을 사용할 수도 있습니다.

```
$results = DB::select('select * from users where id = :id', ['id' => 1]);
```

<a name="running-an-insert-statement"></a>
#### INSERT 구문 실행

`insert` 구문은 `DB` 파사드의 `insert` 메서드를 사용합니다. 사용 방법은 `select`와 동일하게 첫 번째 인자로 SQL 쿼리, 두 번째 인자로 바인딩 값을 받습니다.

```
use Illuminate\Support\Facades\DB;

DB::insert('insert into users (id, name) values (?, ?)', [1, 'Marc']);
```

<a name="running-an-update-statement"></a>
#### UPDATE 구문 실행

데이터베이스의 기존 레코드를 수정할 때는 `update` 메서드를 사용합니다. 이 메서드는 영향을 받은 행(row)의 개수를 반환합니다.

```
use Illuminate\Support\Facades\DB;

$affected = DB::update(
    'update users set votes = 100 where name = ?',
    ['Anita']
);
```

<a name="running-a-delete-statement"></a>
#### DELETE 구문 실행

데이터베이스에서 레코드를 삭제할 때는 `delete` 메서드를 사용합니다. `update`와 마찬가지로, 삭제된 행의 개수를 반환합니다.

```
use Illuminate\Support\Facades\DB;

$deleted = DB::delete('delete from users');
```

<a name="running-a-general-statement"></a>
#### 일반 SQL 구문 실행

결과 값을 반환하지 않는 SQL 명령어(예: DROP TABLE) 등은 `statement` 메서드를 사용해 실행할 수 있습니다.

```
DB::statement('drop table users');
```

<a name="running-an-unprepared-statement"></a>
#### 바인딩 없이 쿼리 실행

값을 바인딩할 필요 없이 SQL 문장을 그대로 실행하려면 `unprepared` 메서드를 사용할 수 있습니다.

```
DB::unprepared('update users set votes = 100 where name = "Dries"');
```

> [!WARNING]  
> unprepared 문장은 값을 바인딩하지 않으므로, SQL 인젝션에 취약할 수 있습니다. 사용자 입력값을 unprepared 문장에 직접 포함하는 일은 절대 피해야 합니다.

<a name="implicit-commits-in-transactions"></a>
#### 암묵적 커밋(Implicit Commits)

트랜잭션 내에서 `DB` 파사드의 `statement`나 `unprepared` 메서드를 사용할 때는 자동으로 트랜잭션이 커밋되는 SQL 문을 작성하지 않도록 주의해야 합니다. 이런 SQL 문은 데이터베이스 엔진에 의해 간접적으로 전체 트랜잭션이 커밋되어, 라라벨은 실제 트랜잭션 상태를 인지할 수 없게 됩니다. 예를 들어, 데이터베이스 테이블을 생성하는 명령이 대표적입니다.

```
DB::unprepared('create table a (col varchar(1) null)');
```

어떤 명령이 암묵적 커밋을 발생시키는지는 MySQL 공식 문서를 참고하십시오: [암묵적 커밋이 일어나는 명령 목록](https://dev.mysql.com/doc/refman/8.0/en/implicit-commit.html)

<a name="using-multiple-database-connections"></a>
### 다중 데이터베이스 연결 사용하기

애플리케이션에서 여러 데이터베이스 연결을 `config/database.php` 파일에 정의해뒀다면, `DB` 파사드의 `connection` 메서드를 통해 각 연결에 접근할 수 있습니다. `connection` 메서드에 넘기는 인자는 연결 이름이어야 하며, 이는 `config/database.php`에 정의한 것과 일치해야 합니다. 또는 런타임 시점에 `config` 헬퍼로 설정한 값도 사용할 수 있습니다.

```
use Illuminate\Support\Facades\DB;

$users = DB::connection('sqlite')->select(/* ... */);
```

각 연결의 저수준 PDO 인스턴스가 필요하다면, 연결 인스턴스의 `getPdo` 메서드를 사용할 수 있습니다.

```
$pdo = DB::connection()->getPdo();
```

<a name="listening-for-query-events"></a>
### 쿼리 이벤트 리스닝

애플리케이션에서 실행되는 SQL 쿼리마다 호출되는 클로저(익명 함수)를 등록하려면, `DB` 파사드의 `listen` 메서드를 사용할 수 있습니다. 쿼리 로깅 또는 디버깅 시에 유용하게 사용됩니다. 이 쿼리 리스너 클로저는 [서비스 프로바이더](/docs/11.x/providers)의 `boot` 메서드에서 등록하는 것이 좋습니다.

```
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

현대 웹 애플리케이션의 성능 병목 현상 중 하나는 데이터베이스 쿼리에 소요되는 시간입니다. 라라벨에서는 한 번의 요청 동안 데이터베이스 쿼리 시간이 일정 임계치를 초과하면 특정 클로저(또는 콜백)를 실행할 수 있습니다. 이렇게 하려면, 임계 시간(밀리초 단위)과 실행할 클로저를 `whenQueryingForLongerThan` 메서드에 전달하면 됩니다. 이 메서드는 [서비스 프로바이더](/docs/11.x/providers)의 `boot` 메서드에서 사용할 수 있습니다.

```
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
            // 개발 팀에게 알림 전송 등...
        });
    }
}
```

<a name="database-transactions"></a>
## 데이터베이스 트랜잭션

데이터베이스 트랜잭션 내에서 여러 작업을 실행하려면 `DB` 파사드의 `transaction` 메서드를 사용할 수 있습니다. 트랜잭션 클로저에서 예외가 발생하면, 해당 트랜잭션은 자동으로 롤백되고 예외가 다시 발생합니다. 클로저가 예외 없이 정상적으로 실행될 경우, 트랜잭션이 자동으로 커밋됩니다. 즉, `transaction` 메서드를 사용할 때는 명시적으로 커밋이나 롤백을 신경 쓸 필요가 없습니다.

```
use Illuminate\Support\Facades\DB;

DB::transaction(function () {
    DB::update('update users set votes = 1');

    DB::delete('delete from posts');
});
```

<a name="handling-deadlocks"></a>
#### 교착상태(Deadlock) 처리

`transaction` 메서드는 옵션으로 두 번째 인자에 정수값을 받을 수 있습니다. 이 값은 트랜잭션 중 교착상태(Deadlock)가 발생했을 때 최대 몇 번까지 재시도할지를 지정합니다. 정해진 횟수가 모두 소진되면 예외가 발생합니다.

```
use Illuminate\Support\Facades\DB;

DB::transaction(function () {
    DB::update('update users set votes = 1');

    DB::delete('delete from posts');
}, 5);
```

<a name="manually-using-transactions"></a>
#### 수동 트랜잭션 사용

트랜잭션을 수동으로 시작하고 롤백/커밋을 직접 제어하고 싶다면, `DB` 파사드의 `beginTransaction` 메서드를 사용할 수 있습니다.

```
use Illuminate\Support\Facades\DB;

DB::beginTransaction();
```

트랜잭션을 롤백하려면 `rollBack` 메서드를 사용합니다.

```
DB::rollBack();
```

마지막으로, 트랜잭션을 커밋하려면 `commit` 메서드를 사용합니다.

```
DB::commit();
```

> [!NOTE]  
> `DB` 파사드의 트랜잭션 관련 메서드는 [쿼리 빌더](/docs/11.x/queries)와 [Eloquent ORM](/docs/11.x/eloquent) 모두에 적용됩니다.

<a name="connecting-to-the-database-cli"></a>
## 데이터베이스 CLI 연결하기

데이터베이스의 CLI에 접속하고 싶을 때는 `db` 아티즌 명령어를 사용할 수 있습니다.

```shell
php artisan db
```

기본 연결이 아닌 다른 데이터베이스에 접속하려면, 원하는 연결 이름을 함께 지정할 수 있습니다.

```shell
php artisan db mysql
```

<a name="inspecting-your-databases"></a>
## 데이터베이스 점검

`db:show`와 `db:table` 아티즌 명령어를 사용하면 데이터베이스와 테이블에 대한 유용한 정보를 얻을 수 있습니다. 데이터베이스의 개요(크기, 종류, 열린 연결 수, 테이블 요약 등)를 확인하려면 `db:show` 명령어를 사용하십시오.

```shell
php artisan db:show
```

특정 데이터베이스 연결을 점검하려면 `--database` 옵션으로 연결 이름을 지정할 수 있습니다.

```shell
php artisan db:show --database=pgsql
```

테이블 행 개수나 데이터베이스 뷰 정보를 출력에 포함하려면 `--counts`, `--views` 옵션을 사용할 수 있습니다. 단, 대용량 데이터베이스의 경우 행 개수나 뷰 정보를 조회하는 데 시간이 오래 걸릴 수 있습니다.

```shell
php artisan db:show --counts --views
```

또한 아래와 같은 `Schema` 메서드를 사용해 데이터베이스를 점검할 수도 있습니다.

```
use Illuminate\Support\Facades\Schema;

$tables = Schema::getTables();
$views = Schema::getViews();
$columns = Schema::getColumns('users');
$indexes = Schema::getIndexes('users');
$foreignKeys = Schema::getForeignKeys('users');
```

기본 연결이 아닌 다른 데이터베이스 연결을 점검하려면, `connection` 메서드를 사용할 수 있습니다.

```
$columns = Schema::connection('sqlite')->getColumns('users');
```

<a name="table-overview"></a>
#### 테이블 개요 확인

특정 테이블의 개요를 보고 싶을 때는 `db:table` 아티즌 명령어를 실행하십시오. 이 명령어는 데이터베이스 테이블의 컬럼, 타입, 속성, 키, 인덱스 등을 전반적으로 보여줍니다.

```shell
php artisan db:table users
```

<a name="monitoring-your-databases"></a>
## 데이터베이스 모니터링

`db:monitor` 아티즌 명령어를 사용하면, 데이터베이스의 열린 연결 수가 지정한 최대값을 초과했을 때 `Illuminate\Database\Events\DatabaseBusy` 이벤트가 발생하도록 라라벨에 지시할 수 있습니다.

먼저 이 명령어가 [매 분마다 실행되도록](/docs/11.x/scheduling) 스케줄링해야 합니다. 명령어에는 모니터링 대상 데이터베이스 연결명과 최대 허용 연결 수를 `--databases` 및 `--max` 옵션으로 지정합니다.

```shell
php artisan db:monitor --databases=mysql,pgsql --max=100
```

이 명령어를 스케줄링하는 것만으로는 알림이 전송되지 않습니다. 특정 데이터베이스의 열린 연결 수가 임계치를 넘어서면, `DatabaseBusy` 이벤트가 발생합니다. 이 이벤트를 애플리케이션의 `AppServiceProvider`에서 감지하여, 개발자나 개발팀에게 알림을 전송하도록 설정해야 합니다.

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
