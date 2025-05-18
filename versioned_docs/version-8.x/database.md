# 데이터베이스: 시작하기 (Database: Getting Started)

- [소개](#introduction)
    - [설정](#configuration)
    - [읽기/쓰기 연결](#read-and-write-connections)
- [SQL 쿼리 실행](#running-queries)
    - [여러 데이터베이스 연결 사용](#using-multiple-database-connections)
    - [쿼리 이벤트 리스닝](#listening-for-query-events)
- [데이터베이스 트랜잭션](#database-transactions)
- [데이터베이스 CLI 연결](#connecting-to-the-database-cli)

<a name="introduction"></a>
## 소개

대부분의 최신 웹 애플리케이션은 데이터베이스와 상호작용합니다. 라라벨은 지원하는 다양한 데이터베이스에서 원시 SQL, [유연한 쿼리 빌더](/docs/8.x/queries), [Eloquent ORM](/docs/8.x/eloquent)을 사용하여 데이터베이스와 쉽게 연동할 수 있도록 해줍니다. 현재 라라벨은 아래 다섯 가지 데이터베이스를 공식적으로 지원합니다.

<div class="content-list" markdown="1">

- MariaDB 10.2+ ([버전 정책](https://mariadb.org/about/#maintenance-policy))
- MySQL 5.7+ ([버전 정책](https://en.wikipedia.org/wiki/MySQL#Release_history))
- PostgreSQL 9.6+ ([버전 정책](https://www.postgresql.org/support/versioning/))
- SQLite 3.8.8+
- SQL Server 2017+ ([버전 정책](https://docs.microsoft.com/en-us/lifecycle/products/?products=sql-server))

</div>

<a name="configuration"></a>
### 설정

라라벨의 데이터베이스 서비스 설정은 애플리케이션의 `config/database.php` 설정 파일에 위치합니다. 이 파일에서 모든 데이터베이스 연결을 정의할 수 있으며, 기본적으로 사용할 연결도 지정할 수 있습니다. 이 파일 내 대부분의 설정 옵션은 애플리케이션의 환경 변수 값을 기반으로 동작합니다. 라라벨에서 지원하는 대부분의 데이터베이스 시스템에 대한 예시가 이 파일에 포함되어 있습니다.

기본적으로, 라라벨의 샘플 [환경 설정](/docs/8.x/configuration#environment-configuration)은 로컬 환경에서 라라벨 애플리케이션을 개발할 수 있도록 도와주는 도커 환경인 [Laravel Sail](/docs/8.x/sail)과 바로 사용할 수 있도록 되어 있습니다. 물론, 필요에 따라 로컬 데이터베이스에 맞게 데이터베이스 설정을 자유롭게 변경하실 수 있습니다.

<a name="sqlite-configuration"></a>
#### SQLite 설정

SQLite 데이터베이스는 하나의 파일로 파일 시스템에 저장됩니다. 터미널에서 `touch` 명령어를 사용해 새로운 SQLite 데이터베이스를 만들 수 있습니다: `touch database/database.sqlite`. 데이터베이스를 만든 뒤에는 환경 변수 파일에서 `DB_DATABASE`에 해당 데이터베이스의 절대 경로를 저장하면 쉽게 연결할 수 있습니다.

```
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/database.sqlite
```

SQLite 연결에서 외래 키 제약조건을 활성화하려면, `DB_FOREIGN_KEYS` 환경 변수를 `true`로 설정해야 합니다.

```
DB_FOREIGN_KEYS=true
```

<a name="mssql-configuration"></a>
#### Microsoft SQL Server 설정

Microsoft SQL Server 데이터베이스를 사용하려면 반드시 `sqlsrv`와 `pdo_sqlsrv` PHP 확장 모듈이 설치되어 있어야 하며, Microsoft SQL ODBC 드라이버와 같은 관련 의존성도 함께 설치해야 합니다.

<a name="configuration-using-urls"></a>
#### URL을 이용한 설정

일반적으로 데이터베이스 연결은 `host`, `database`, `username`, `password` 등과 같은 여러 설정 값으로 구성합니다. 각각의 값은 별도의 환경 변수로 지정됩니다. 따라서 운영 서버에서 데이터베이스 연결 정보를 설정할 때 여러 환경 변수를 따로 관리해야 합니다.

AWS, Heroku 같은 일부 관리형 데이터베이스 제공자는 데이터베이스 연결 정보를 하나의 문자열로 포함하는 단일 "URL" 방식으로 제공합니다. 예를 들어, 다음과 같은 형태입니다.

```html
mysql://root:password@127.0.0.1/forge?charset=UTF-8
```

이러한 URL은 일반적으로 아래와 같은 표준 스키마 형태를 따릅니다.

```html
driver://username:password@host:port/database?options
```

라라벨은 편의를 위해 여러 설정 항목을 개별적으로 지정하는 대신, 이러한 URL을 통한 데이터베이스 설정도 지원합니다. 만약 설정 파일에 `url`(또는 해당 환경 변수인 `DATABASE_URL`) 옵션이 있다면, 이 값으로부터 연결 및 인증 정보를 자동으로 추출해 사용합니다.

<a name="read-and-write-connections"></a>
### 읽기/쓰기 연결

때로는 SELECT 쿼리를 위한 데이터베이스 연결과 INSERT, UPDATE, DELETE 쿼리를 위한 연결을 별도로 사용하고 싶을 수 있습니다. 라라벨에서는 이 과정을 매우 쉽게 처리할 수 있습니다. 원시 쿼리, 쿼리 빌더, Eloquent ORM 모두에서 적절한 연결이 항상 자동으로 사용됩니다.

읽기/쓰기 연결을 어떻게 설정하는지 아래 예시를 살펴보십시오.

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

여기서 설정 배열에 `read`, `write`, `sticky`라는 세 가지 키가 추가된 것을 확인할 수 있습니다. `read`와 `write` 키에는 `host` 키를 가진 배열이 들어 있습니다. `read`/`write` 연결의 나머지 데이터베이스 설정 항목들은 기본 `mysql` 설정 배열에서 병합되어 사용됩니다.

즉, 기본 `mysql` 배열에서 값들을 재정의하고 싶을 때만 `read`/`write` 배열에 별도의 값을 입력하면 됩니다. 위 예시에서는 "읽기" 연결은 `192.168.1.1`을, "쓰기" 연결은 `192.168.1.3`을 호스트로 사용합니다. 데이터베이스 인증 정보, 접두어, 문자셋 등 다른 옵션들은 기본 `mysql` 설정이 두 연결 모두에 공유됩니다. 만약 `host` 배열에 여러 개의 값이 있을 경우, 요청마다 무작위로 하나의 데이터베이스 호스트가 선택됩니다.

<a name="the-sticky-option"></a>
#### `sticky` 옵션

`sticky` 옵션은 *선택적* 항목으로, 현재 요청에서 데이터베이스에 데이터를 기록(쓰기)한 후 바로 그 데이터를 읽고 싶을 때 사용할 수 있습니다. 만약 이 옵션이 활성화된 상태에서 "쓰기" 작업이 수행되면, 이후에 발생하는 모든 "읽기" 작업은 "쓰기" 연결을 사용하게 됩니다. 즉, 같은 요청 내에서 쓰여진 데이터를 바로 읽을 수 있습니다. 이 동작이 여러분 애플리케이션에 필요한지 여부는 상황에 따라 결정하면 됩니다.

<a name="running-queries"></a>
## SQL 쿼리 실행

데이터베이스 연결을 설정한 후에는 `DB` 파사드(facade)를 사용해 쿼리를 실행할 수 있습니다. `DB` 파사드는 `select`, `update`, `insert`, `delete`, `statement` 등 각 쿼리 타입에 맞는 메서드를 제공합니다.

<a name="running-a-select-query"></a>
#### SELECT 쿼리 실행

기본적인 SELECT 쿼리를 실행하려면 `DB` 파사드의 `select` 메서드를 사용할 수 있습니다.

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

`select` 메서드의 첫 번째 인수는 SQL 쿼리이며, 두 번째 인수는 쿼리에 바인딩해야 할 파라미터 배열입니다. 주로 `where` 절에 들어가는 값들을 바인딩하기 위해 사용됩니다. 파라미터 바인딩 기능은 SQL 인젝션 공격을 방지하는 역할을 합니다.

`select` 메서드는 항상 결과를 `array`로 반환합니다. 이 배열의 각 요소는 데이터베이스 레코드를 나타내는 PHP의 `stdClass` 객체입니다.

```
use Illuminate\Support\Facades\DB;

$users = DB::select('select * from users');

foreach ($users as $user) {
    echo $user->name;
}
```

<a name="using-named-bindings"></a>
#### 이름 있는 바인딩 사용

바인딩 파라미터 자리에 `?` 대신, 이름을 붙인 바인딩도 사용할 수 있습니다.

```
$results = DB::select('select * from users where id = :id', ['id' => 1]);
```

<a name="running-an-insert-statement"></a>
#### INSERT 문 실행

`insert` 문을 실행하려면 `DB` 파사드의 `insert` 메서드를 사용합니다. `select`와 동일하게 첫 번째 인수로 SQL 쿼리, 두 번째 인수로 바인딩할 값들을 넘깁니다.

```
use Illuminate\Support\Facades\DB;

DB::insert('insert into users (id, name) values (?, ?)', [1, 'Marc']);
```

<a name="running-an-update-statement"></a>
#### UPDATE 문 실행

기존 레코드를 수정하려면 `update` 메서드를 사용합니다. 이 메서드는 영향받은 행(row) 수를 반환합니다.

```
use Illuminate\Support\Facades\DB;

$affected = DB::update(
    'update users set votes = 100 where name = ?',
    ['Anita']
);
```

<a name="running-a-delete-statement"></a>
#### DELETE 문 실행

데이터베이스에서 레코드를 삭제할 때는 `delete` 메서드를 사용합니다. 역시 영향받은 행의 개수를 반환합니다.

```
use Illuminate\Support\Facades\DB;

$deleted = DB::delete('delete from users');
```

<a name="running-a-general-statement"></a>
#### 일반 명령문 실행

값을 반환하지 않는 데이터베이스 명령문도 있습니다. 이러한 경우에는 `DB` 파사드의 `statement` 메서드를 사용할 수 있습니다.

```
DB::statement('drop table users');
```

<a name="running-an-unprepared-statement"></a>
#### 바인딩 없이 쿼리 실행

특정 상황에서는 값을 바인딩하지 않고 SQL을 실행하고 싶을 때도 있습니다. 이럴 때는 `DB` 파사드의 `unprepared` 메서드를 사용할 수 있습니다.

```
DB::unprepared('update users set votes = 100 where name = "Dries"');
```

> [!NOTE]
> `unprepared` 문은 파라미터 바인딩을 사용하지 않기 때문에 SQL 인젝션에 취약할 수 있습니다. 사용자 입력값을 그대로 사용하는 경우에는 절대 사용하지 마십시오.

<a name="implicit-commits-in-transactions"></a>
#### 암묵적 커밋(Implicit Commits)

트랜잭션 내부에서 `DB` 파사드의 `statement`나 `unprepared` 메서드를 사용할 때에는, [암묵적으로 커밋이 발생하는 쿼리](https://dev.mysql.com/doc/refman/8.0/en/implicit-commit.html)를 주의해야 합니다. 이런 명령문은 데이터베이스 엔진이 트랜잭션 전체를 자동으로 커밋하게 만들어, 라라벨이 더 이상 트랜잭션 상태를 추적할 수 없게 됩니다. 예컨대 아래처럼 테이블을 생성하는 쿼리가 대표적인 예시입니다.

```
DB::unprepared('create table a (col varchar(1) null)');
```

암묵적 커밋을 유발하는 쿼리에 대해서는 MySQL 공식 문서를 참조하세요.  
[암묵적 커밋이 발생하는 쿼리 전체 목록](https://dev.mysql.com/doc/refman/8.0/en/implicit-commit.html)

<a name="using-multiple-database-connections"></a>
### 여러 데이터베이스 연결 사용

애플리케이션에서 `config/database.php` 파일에 여러 연결을 정의했다면, `DB` 파사드의 `connection` 메서드를 통해 각 연결에 접근할 수 있습니다. 이때 전달하는 연결 이름은 설정 파일에 정의된 값이어야 하며, 또는 `config` 헬퍼를 이용해 런타임에 동적으로 지정할 수 있습니다.

```
use Illuminate\Support\Facades\DB;

$users = DB::connection('sqlite')->select(...);
```

또한, 연결 인스턴스의 `getPdo` 메서드를 통해 원시 PDO 인스턴스도 사용할 수 있습니다.

```
$pdo = DB::connection()->getPdo();
```

<a name="listening-for-query-events"></a>
### 쿼리 이벤트 리스닝

애플리케이션에서 실행되는 각 SQL 쿼리마다 특정 클로저(익명 함수)를 호출하고 싶을 때에는, `DB` 파사드의 `listen` 메서드를 사용할 수 있습니다. 이 기능은 쿼리 로깅이나 디버깅에 유용합니다. 쿼리 리스너 클로저는 [서비스 프로바이더](/docs/8.x/providers)의 `boot` 메서드에서 등록할 수 있습니다.

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

<a name="database-transactions"></a>
## 데이터베이스 트랜잭션

여러 데이터베이스 작업을 하나의 트랜잭션으로 묶어서 실행하려면, `DB` 파사드가 제공하는 `transaction` 메서드를 사용할 수 있습니다. 트랜잭션 클로저 내부에서 예외가 던져지면, 트랜잭션은 자동으로 롤백되고 예외가 다시 던져집니다. 클로저가 정상적으로 실행되었다면 트랜잭션이 자동으로 커밋됩니다. 즉, `transaction` 메서드를 사용할 때는 명시적으로 롤백이나 커밋을 직접 처리할 필요가 없습니다.

```
use Illuminate\Support\Facades\DB;

DB::transaction(function () {
    DB::update('update users set votes = 1');

    DB::delete('delete from posts');
});
```

<a name="handling-deadlocks"></a>
#### 교착 상태(Deadlock) 처리

`transaction` 메서드는 두 번째 인수로 트랜잭션 중 교착 상태가 발생했을 때 재시도할 횟수를 지정할 수 있습니다. 지정 횟수만큼 재시도했는데도 문제가 해결되지 않으면 예외가 발생합니다.

```
use Illuminate\Support\Facades\DB;

DB::transaction(function () {
    DB::update('update users set votes = 1');

    DB::delete('delete from posts');
}, 5);
```

<a name="manually-using-transactions"></a>
#### 트랜잭션 수동 제어

트랜잭션을 명시적으로 시작하고, 롤백이나 커밋을 직접 제어하고 싶다면 `DB` 파사드의 `beginTransaction` 메서드를 사용할 수 있습니다.

```
use Illuminate\Support\Facades\DB;

DB::beginTransaction();
```

트랜잭션을 롤백하려면 `rollBack` 메서드를 호출합니다.

```
DB::rollBack();
```

마지막으로, 트랜잭션을 커밋하려면 `commit` 메서드를 사용합니다.

```
DB::commit();
```

> [!TIP]
> `DB` 파사드의 트랜잭션 관련 메서드는 [쿼리 빌더](/docs/8.x/queries)와 [Eloquent ORM](/docs/8.x/eloquent) 모두에 적용됩니다.

<a name="connecting-to-the-database-cli"></a>
## 데이터베이스 CLI 연결

데이터베이스의 CLI에 직접 연결하고 싶다면, 다음과 같이 `db` 아티즌 명령어를 사용할 수 있습니다.

```
php artisan db
```

필요하다면, 연결하고 싶은 데이터베이스 연결 이름을 추가로 지정할 수 있습니다. 이럴 경우 기본 연결이 아닌 다른 데이터베이스에 접속할 수 있습니다.

```
php artisan db mysql
```
