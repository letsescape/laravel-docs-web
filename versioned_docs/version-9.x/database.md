# 데이터베이스: 시작하기 (Database: Getting Started)

- [소개](#introduction)
    - [설정](#configuration)
    - [읽기 및 쓰기 연결](#read-and-write-connections)
- [SQL 쿼리 실행](#running-queries)
    - [복수 데이터베이스 연결 사용](#using-multiple-database-connections)
    - [쿼리 이벤트 리스닝](#listening-for-query-events)
    - [누적 쿼리 시간 모니터링](#monitoring-cumulative-query-time)
- [데이터베이스 트랜잭션](#database-transactions)
- [데이터베이스 CLI 연결](#connecting-to-the-database-cli)
- [데이터베이스 검사](#inspecting-your-databases)
- [데이터베이스 모니터링](#monitoring-your-databases)

<a name="introduction"></a>
## 소개

거의 모든 최신 웹 애플리케이션은 데이터베이스와 상호작용합니다. 라라벨은 다양한 지원 데이터베이스에서 순수 SQL, [유연한 쿼리 빌더](/docs/9.x/queries), 그리고 [Eloquent ORM](/docs/9.x/eloquent)을 활용하여 데이터베이스와의 상호작용을 매우 간단하게 만들어줍니다. 현재 라라벨은 다섯 가지 데이터베이스에 대해 공식적으로 지원합니다.

<div class="content-list" markdown="1">

- MariaDB 10.3+ ([버전 정책](https://mariadb.org/about/#maintenance-policy))
- MySQL 5.7+ ([버전 정책](https://en.wikipedia.org/wiki/MySQL#Release_history))
- PostgreSQL 10.0+ ([버전 정책](https://www.postgresql.org/support/versioning/))
- SQLite 3.8.8+
- SQL Server 2017+ ([버전 정책](https://docs.microsoft.com/en-us/lifecycle/products/?products=sql-server))

</div>

<a name="configuration"></a>
### 설정

라라벨의 데이터베이스 서비스에 대한 설정은 애플리케이션의 `config/database.php` 파일에 위치합니다. 이 파일에서 모든 데이터베이스 연결을 정의할 수 있으며, 기본적으로 사용할 연결도 지정할 수 있습니다. 대부분의 설정 옵션은 애플리케이션의 환경 변수 값을 기반으로 동작합니다. 라라벨에서 지원하는 주요 데이터베이스 시스템의 예제 설정이 이 파일에 포함되어 있습니다.

기본적으로 라라벨의 샘플 [환경 설정](/docs/9.x/configuration#environment-configuration)은 [Laravel Sail](/docs/9.x/sail)과 바로 사용할 수 있도록 준비되어 있습니다. Laravel Sail은 로컬 환경에서 라라벨 애플리케이션 개발을 위한 Docker 설정입니다. 하지만, 필요하다면 여러분의 로컬 데이터베이스 환경에 맞게 해당 설정을 자유롭게 수정해도 됩니다.

<a name="sqlite-configuration"></a>
#### SQLite 설정

SQLite 데이터베이스는 파일 시스템에 하나의 파일로 저장됩니다. 터미널에서 `touch` 명령어를 사용하여 새 SQLite 데이터베이스를 생성할 수 있습니다: `touch database/database.sqlite`. 데이터베이스를 생성한 후에는, 환경 변수 중 `DB_DATABASE`에 데이터베이스의 절대 경로를 지정하여 이 데이터베이스를 사용하도록 쉽게 설정할 수 있습니다.

```ini
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/database.sqlite
```

SQLite 연결에서 외래 키 제약 조건을 활성화하려면, `DB_FOREIGN_KEYS` 환경 변수를 `true`로 설정해야 합니다.

```ini
DB_FOREIGN_KEYS=true
```

<a name="mssql-configuration"></a>
#### Microsoft SQL Server 설정

Microsoft SQL Server 데이터베이스를 사용하려면, `sqlsrv` 및 `pdo_sqlsrv` PHP 확장자와 함께 필요한 모든 의존성(예: Microsoft SQL ODBC 드라이버)이 설치되어 있는지 확인해야 합니다.

<a name="configuration-using-urls"></a>
#### URL을 이용한 설정

일반적으로 데이터베이스 연결은 `host`, `database`, `username`, `password` 등 여러 가지 설정값을 개별적으로 지정합니다. 각각의 설정값에는 환경 변수가 매핑되어 있어, 운영 서버에서 데이터베이스 연결 정보를 설정할 때 여러 환경 변수를 관리해야 합니다.

AWS나 Heroku와 같은 일부 관리형 데이터베이스 서비스에서는 모든 연결 정보를 하나의 문자열에 담은 “데이터베이스 URL”을 제공합니다. 이 URL의 예시는 아래와 같습니다.

```html
mysql://root:password@127.0.0.1/forge?charset=UTF-8
```

이러한 URL은 일반적으로 표준 스키마 형태를 따릅니다.

```html
driver://username:password@host:port/database?options
```

라라벨은 편의를 위해 여러 설정값 대신 이와 같은 URL로 데이터베이스를 설정할 수 있도록 지원합니다. 만약 `url`(혹은 해당하는 `DATABASE_URL` 환경 변수) 옵션이 존재하면, 이 값을 통해 데이터베이스 연결 정보 및 인증 정보가 추출됩니다.

<a name="read-and-write-connections"></a>
### 읽기 및 쓰기 연결

때로는 SELECT 쿼리에는 한 데이터베이스 연결을, INSERT, UPDATE, DELETE 쿼리에는 다른 연결을 사용하고 싶을 수도 있습니다. 라라벨은 이러한 작업을 매우 쉽게 처리할 수 있으며, 쿼리 빌더나 Eloquent ORM, 혹은 순수 쿼리 등 어떤 방법을 사용하더라도 올바른 연결이 자동으로 지정됩니다.

읽기/쓰기 연결을 어떻게 구성하는지 보기 위해 다음 예시를 살펴보겠습니다.

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
    'driver' => 'mysql',
    'database' => 'database',
    'username' => 'root',
    'password' => '',
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'prefix' => '',
],
```

설정 배열에는 `read`, `write`, 그리고 `sticky` 세 가지 키가 추가된 것을 볼 수 있습니다. `read`와 `write` 키는 각각 `host` 키를 가진 배열 값을 가지고 있습니다. `read`와 `write` 연결에 대한 기타 데이터베이스 옵션은 메인 `mysql` 설정 배열에서 병합됩니다.

만약 메인 `mysql` 배열의 값을 덮어쓰고 싶을 때만, `read`와 `write` 배열에 세부 항목을 넣으면 됩니다. 위의 경우에서는 `192.168.1.1`이 "읽기(read)" 연결의 호스트로, `192.168.1.3`이 "쓰기(write)" 연결의 호스트로 사용됩니다. 데이터베이스 인증 정보, prefix, 문자셋 등 다른 모든 옵션은 메인 `mysql` 배열의 값을 두 연결에서 공유합니다. `host` 배열에 여러 값이 있으면, 요청마다 무작위로 하나가 선택됩니다.

<a name="the-sticky-option"></a>
#### `sticky` 옵션

`sticky` 옵션은 *선택적으로* 사용할 수 있는 값으로, 한 요청 사이클 내에서 데이터베이스에 기록된 레코드를 곧바로 읽고 싶을 때 활용할 수 있습니다. 만약 `sticky` 옵션이 활성화되어 있고, 현재 요청에서 "쓰기" 작업이 실행된다면, 이어지는 모든 "읽기" 쿼리는 "쓰기" 연결을 사용하게 됩니다. 이렇게 하면 요청 중에 쓰여진 데이터를 즉시 다시 읽어들일 수 있습니다. 이 기능이 애플리케이션에 꼭 필요한 동작인지는 직접 판단하셔야 합니다.

<a name="running-queries"></a>
## SQL 쿼리 실행

데이터베이스 연결을 설정한 후에는, `DB` 파사드를 이용해 쿼리를 실행할 수 있습니다. `DB` 파사드는 `select`, `update`, `insert`, `delete`, `statement` 등 각각의 쿼리 유형에 맞는 메서드를 제공합니다.

<a name="running-a-select-query"></a>
#### SELECT 쿼리 실행

기본적인 SELECT 쿼리는 `DB` 파사드의 `select` 메서드를 사용해 실행할 수 있습니다.

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    /**
     * Show a list of all of the application's users.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $users = DB::select('select * from users where active = ?', [1]);

        return view('user.index', ['users' => $users]);
    }
}
```

`select` 메서드의 첫 번째 인수는 SQL 쿼리 문자열이며, 두 번째 인수는 쿼리에 바인딩할 파라미터 배열입니다. 일반적으로 WHERE 절의 변수 값들을 여기서 지정합니다. 파라미터 바인딩을 사용하면 SQL 인젝션 공격을 방지할 수 있습니다.

`select` 메서드는 언제나 결과를 `array`로 반환합니다. 반환되는 배열의 각 결과는 데이터베이스의 레코드를 나타내는 PHP `stdClass` 객체입니다.

```
use Illuminate\Support\Facades\DB;

$users = DB::select('select * from users');

foreach ($users as $user) {
    echo $user->name;
}
```

<a name="selecting-scalar-values"></a>
#### 스칼라(단일) 값 조회

쿼리 결과가 하나의 스칼라(단일) 값인 경우도 있습니다. 이럴 때는 결과 객체에서 직접 값을 꺼내지 않고, `scalar` 메서드를 이용해 즉시 그 값을 가져올 수 있습니다.

```
$burgers = DB::scalar(
    "select count(case when food = 'burger' then 1 end) as burgers from menu"
);
```

<a name="using-named-bindings"></a>
#### 명명 바인딩(Named Bindings) 사용

파라미터 바인딩에 `?` 대신 명명된 바인딩을 사용할 수도 있습니다.

```
$results = DB::select('select * from users where id = :id', ['id' => 1]);
```

<a name="running-an-insert-statement"></a>
#### INSERT 문 실행

`insert` 문을 실행하려면 `DB` 파사드의 `insert` 메서드를 사용합니다. `select`와 마찬가지로 첫 번째 인수는 SQL 쿼리, 두 번째 인수는 바인딩할 값 배열입니다.

```
use Illuminate\Support\Facades\DB;

DB::insert('insert into users (id, name) values (?, ?)', [1, 'Marc']);
```

<a name="running-an-update-statement"></a>
#### UPDATE 문 실행

기존 레코드를 수정하고 싶을 때는 `update` 메서드를 사용합니다. 이 메서드는 영향을 받은 행(row)의 개수를 반환합니다.

```
use Illuminate\Support\Facades\DB;

$affected = DB::update(
    'update users set votes = 100 where name = ?',
    ['Anita']
);
```

<a name="running-a-delete-statement"></a>
#### DELETE 문 실행

데이터베이스에서 레코드를 삭제할 때는 `delete` 메서드를 사용합니다. `update`와 마찬가지로, 영향받은 행의 수가 반환됩니다.

```
use Illuminate\Support\Facades\DB;

$deleted = DB::delete('delete from users');
```

<a name="running-a-general-statement"></a>
#### 일반 쿼리 실행

일부 데이터베이스 구문은 별도의 반환값이 없습니다. 이런 작업에는 `DB` 파사드의 `statement` 메서드를 사용합니다.

```
DB::statement('drop table users');
```

<a name="running-an-unprepared-statement"></a>
#### Unprepared 쿼리 실행

때로는 파라미터 바인딩 없이 SQL 문을 바로 실행하고 싶을 때가 있습니다. 이럴 때는 `DB` 파사드의 `unprepared` 메서드를 사용하면 됩니다.

```
DB::unprepared('update users set votes = 100 where name = "Dries"');
```

> [!WARNING]
> unprepared 쿼리는 파라미터 바인딩을 적용하지 않기 때문에, SQL 인젝션에 취약할 수 있습니다. 사용자 입력이 포함된 쿼리에 unprepared 메서드는 절대 사용하지 마십시오.

<a name="implicit-commits-in-transactions"></a>
#### 암묵적 커밋(Implicit Commits)

트랜잭션 내에서 `DB` 파사드의 `statement` 및 `unprepared` 메서드를 사용할 때는, [암묵적 커밋](https://dev.mysql.com/doc/refman/8.0/en/implicit-commit.html)을 발생시킬 수 있는 구문을 주의해야 합니다. 이런 구문이 실행되면 데이터베이스 엔진이 트랜잭션 전체를 암묵적으로 커밋하게 되며, 라라벨은 데이터베이스의 트랜잭션 상태를 알 수 없게 됩니다. 예를 들어, 테이블 생성 문이 해당합니다.

```
DB::unprepared('create table a (col varchar(1) null)');
```

암묵적 커밋을 유발하는 모든 구문에 대한 목록은 MySQL 매뉴얼의 [해당 문서](https://dev.mysql.com/doc/refman/8.0/en/implicit-commit.html)를 참고하세요.

<a name="using-multiple-database-connections"></a>
### 복수 데이터베이스 연결 사용

애플리케이션의 `config/database.php` 파일에서 여러 데이터베이스 연결을 정의했다면, `DB` 파사드의 `connection` 메서드를 사용하여 각 연결을 사용할 수 있습니다. 이때 연결 이름은 `config/database.php` 파일에 정의된 이름이거나, 실행 중에 `config` 헬퍼로 설정한 값이어야 합니다.

```
use Illuminate\Support\Facades\DB;

$users = DB::connection('sqlite')->select(/* ... */);
```

또한, 연결 인스턴스에서 `getPdo` 메서드를 사용하면 원래 PHP의 PDO 인스턴스를 직접 얻을 수 있습니다.

```
$pdo = DB::connection()->getPdo();
```

<a name="listening-for-query-events"></a>
### 쿼리 이벤트 리스닝

애플리케이션에서 실행되는 모든 SQL 쿼리에 대해 호출되는 클로저(익명 함수)를 지정하고 싶다면, `DB` 파사드의 `listen` 메서드를 사용할 수 있습니다. 이 메서드는 쿼리 로깅이나 디버깅에 유용합니다. 쿼리 리스너 클로저는 [서비스 프로바이더](/docs/9.x/providers)의 `boot` 메서드에서 등록할 수 있습니다.

```
<?php

namespace App\Providers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        DB::listen(function ($query) {
            // $query->sql;
            // $query->bindings;
            // $query->time;
        });
    }
}
```

<a name="monitoring-cumulative-query-time"></a>
### 누적 쿼리 시간 모니터링

현대 웹 애플리케이션의 성능 병목 중 하나는 데이터베이스 쿼리에 소요되는 시간입니다. 라라벨은 한 요청에서 데이터베이스 쿼리에 너무 오래 걸릴 경우, 지정한 클로저나 콜백을 호출할 수 있습니다. 시작하려면 `whenQueryingForLongerThan` 메서드에 쿼리 시간 임계값(밀리초 단위)과 클로저를 전달합니다. 이 메서드는 [서비스 프로바이더](/docs/9.x/providers)의 `boot` 메서드에서 호출할 수 있습니다.

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
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        DB::whenQueryingForLongerThan(500, function (Connection $connection, QueryExecuted $event) {
            // 개발 팀에 알림 전송...
        });
    }
}
```

<a name="database-transactions"></a>
## 데이터베이스 트랜잭션

`DB` 파사드가 제공하는 `transaction` 메서드를 사용하면 데이터베이스 트랜잭션 내에서 여러 작업을 실행할 수 있습니다. 만약 트랜잭션 클로저 내에서 예외가 발생하면 트랜잭션이 자동으로 롤백되고, 예외 또한 다시 발생합니다. 클로저가 정상적으로 실행되면 트랜잭션은 자동으로 커밋됩니다. `transaction` 메서드를 사용하는 경우, 트랜잭션의 롤백이나 커밋을 직접 처리할 필요가 없습니다.

```
use Illuminate\Support\Facades\DB;

DB::transaction(function () {
    DB::update('update users set votes = 1');

    DB::delete('delete from posts');
});
```

<a name="handling-deadlocks"></a>
#### 데드락(Deadlock) 처리

`transaction` 메서드는 선택적으로 두 번째 인수에, 데드락이 발생했을 때 트랜잭션을 재시도할 횟수를 지정할 수 있습니다. 지정한 횟수만큼 재시도 후에도 실패하면 예외가 발생합니다.

```
use Illuminate\Support\Facades\DB;

DB::transaction(function () {
    DB::update('update users set votes = 1');

    DB::delete('delete from posts');
}, 5);
```

<a name="manually-using-transactions"></a>
#### 직접 트랜잭션 사용

트랜잭션을 수동으로 시작하여 직접 롤백과 커밋을 제어하고 싶다면, `DB` 파사드의 `beginTransaction` 메서드를 사용하면 됩니다.

```
use Illuminate\Support\Facades\DB;

DB::beginTransaction();
```

트랜잭션을 롤백하려면 `rollBack` 메서드를 호출합니다.

```
DB::rollBack();
```

마지막으로 트랜잭션을 커밋하려면 `commit` 메서드를 사용합니다.

```
DB::commit();
```

> [!NOTE]
> `DB` 파사드의 트랜잭션 메서드는 [쿼리 빌더](/docs/9.x/queries)와 [Eloquent ORM](/docs/9.x/eloquent) 모두에 적용됩니다.

<a name="connecting-to-the-database-cli"></a>
## 데이터베이스 CLI 연결

데이터베이스의 CLI로 직접 연결하고 싶다면, `db` 아티즌 명령어를 사용할 수 있습니다.

```shell
php artisan db
```

필요하다면, 기본 연결이 아닌 다른 데이터베이스 연결 이름을 지정하여 접속할 수도 있습니다.

```shell
php artisan db mysql
```

<a name="inspecting-your-databases"></a>
## 데이터베이스 검사

`db:show` 및 `db:table` 아티즌 명령어를 통해 데이터베이스 및 해당 테이블에 대한 상세 정보를 자세히 확인할 수 있습니다. 데이터베이스의 전체 개요(크기, 타입, 열린 연결 수, 테이블 요약 등)를 보려면 `db:show` 명령어를 사용합니다.

```shell
php artisan db:show
```

명령어에서 `--database` 옵션을 사용해 검사할 데이터베이스 연결 이름을 지정할 수 있습니다.

```shell
php artisan db:show --database=pgsql
```

테이블의 행(row) 개수나 데이터베이스 뷰(view)에 대한 세부 사항도 함께 출력하려면, 각각 `--counts` 및 `--views` 옵션을 사용할 수 있습니다. 다만, 데이터베이스가 크면 이러한 정보 조회는 시간이 다소 걸릴 수 있습니다.

```shell
php artisan db:show --counts --views
```

<a name="table-overview"></a>
#### 테이블 개요

데이터베이스에 있는 특정 테이블의 개요를 보고 싶다면, `db:table` 아티즌 명령어를 실행하면 됩니다. 이 명령은 테이블의 컬럼, 타입, 속성, 키, 인덱스 등에 대한 전반적인 정보를 제공합니다.

```shell
php artisan db:table users
```

<a name="monitoring-your-databases"></a>
## 데이터베이스 모니터링

`db:monitor` 아티즌 명령어를 사용하면 라라벨이 데이터베이스의 열린 연결 수가 특정 임계값을 초과하는 경우 `Illuminate\Database\Events\DatabaseBusy` 이벤트를 발생시킬 수 있습니다.

먼저 [매 분마다 실행되도록](/docs/9.x/scheduling) `db:monitor` 명령어를 스케줄링해야 합니다. 이 명령어는 모니터링할 데이터베이스 연결 이름들과, 이벤트가 발생할 최대 열린 연결 수를 인자로 받습니다.

```shell
php artisan db:monitor --databases=mysql,pgsql --max=100
```

명령어를 스케줄링하는 것만으로는 알림이 자동으로 전송되지 않습니다. 명령어가 임계치를 초과한 연결 수를 가진 데이터베이스를 발견하면, `DatabaseBusy` 이벤트를 발생시킵니다. 해당 이벤트를 애플리케이션의 `EventServiceProvider`에서 수신하여 사용자가 알림을 받을 수 있도록 구현해야 합니다.

```php
use App\Notifications\DatabaseApproachingMaxConnections;
use Illuminate\Database\Events\DatabaseBusy;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;

/**
 * Register any other events for your application.
 *
 * @return void
 */
public function boot()
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
