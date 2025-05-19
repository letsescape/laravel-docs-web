# 데이터베이스: 마이그레이션 (Database: Migrations)

- [소개](#introduction)
- [마이그레이션 생성](#generating-migrations)
    - [마이그레이션 합치기](#squashing-migrations)
- [마이그레이션 구조](#migration-structure)
- [마이그레이션 실행](#running-migrations)
    - [마이그레이션 롤백](#rolling-back-migrations)
- [테이블](#tables)
    - [테이블 생성](#creating-tables)
    - [테이블 수정](#updating-tables)
    - [테이블 이름 변경 및 삭제](#renaming-and-dropping-tables)
- [컬럼](#columns)
    - [컬럼 생성](#creating-columns)
    - [사용 가능한 컬럼 타입](#available-column-types)
    - [컬럼 수정자](#column-modifiers)
    - [컬럼 수정](#modifying-columns)
    - [컬럼 이름 변경](#renaming-columns)
    - [컬럼 삭제](#dropping-columns)
- [인덱스](#indexes)
    - [인덱스 생성](#creating-indexes)
    - [인덱스 이름 변경](#renaming-indexes)
    - [인덱스 삭제](#dropping-indexes)
    - [외래키 제약](#foreign-key-constraints)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

마이그레이션은 데이터베이스를 위한 버전 관리 시스템과 비슷합니다. 이를 통해 팀원들이 애플리케이션의 데이터베이스 스키마 정의를 정하고, 쉽게 공유할 수 있습니다. 만약 누군가가 소스 컨트롤에서 변경 사항을 받았을 때, 로컬 데이터베이스에 새로운 컬럼을 직접 추가하라고 지시해 본 경험이 있다면, 바로 이런 문제를 마이그레이션이 해결해 줍니다.

라라벨의 `Schema` [파사드](/docs/11.x/facades)는 라라벨이 지원하는 모든 데이터베이스 시스템에서 데이터베이스에 독립적으로 테이블 생성과 조작을 할 수 있도록 도와줍니다. 일반적으로 마이그레이션에서는 이 파사드를 활용하여 데이터베이스의 테이블과 컬럼을 추가·수정합니다.

<a name="generating-migrations"></a>
## 마이그레이션 생성

`make:migration` [Artisan 명령어](/docs/11.x/artisan)를 사용하면 새로운 데이터베이스 마이그레이션 파일을 생성할 수 있습니다. 새로 생성된 마이그레이션 파일은 `database/migrations` 디렉터리에 저장됩니다. 각 마이그레이션 파일의 이름에는 타임스탬프가 포함되어 있어 라라벨이 마이그레이션의 실행 순서를 파악할 수 있습니다.

```shell
php artisan make:migration create_flights_table
```

라라벨은 마이그레이션의 이름을 활용하여 어떤 테이블을 대상으로 하는지, 그리고 해당 마이그레이션이 새 테이블을 생성하는지 여부를 자동으로 추측하려고 시도합니다. 마이그레이션 이름을 통해 테이블명을 파악할 수 있으면, 라라벨은 해당 테이블로 미리 채워진 마이그레이션 파일을 생성합니다. 만약 추측이 불가능한 경우에는 직접 마이그레이션 파일에서 테이블명을 지정해주면 됩니다.

생성된 마이그레이션의 위치를 직접 지정하고 싶을 때는 `make:migration` 명령어 실행 시 `--path` 옵션을 사용할 수 있습니다. 지정하는 경로는 애플리케이션의 기준 경로를 기준으로 하는 상대 경로여야 합니다.

> [!NOTE]  
> 마이그레이션의 스텁(stub)을 커스터마이즈하고 싶다면 [스텁 퍼블리싱](/docs/11.x/artisan#stub-customization) 기능을 활용할 수 있습니다.

<a name="squashing-migrations"></a>
### 마이그레이션 합치기

애플리케이션 개발을 하다 보면, 시간이 지날수록 마이그레이션 파일이 점점 많아질 수 있습니다. 그 결과, `database/migrations` 디렉터리에 수백 개의 마이그레이션 파일이 쌓여서 관리가 어려워질 수 있습니다. 이런 경우 "마이그레이션 합치기(squash)" 기능을 사용하면, 모든 마이그레이션을 하나의 SQL 파일로 합칠 수 있습니다. 다음과 같이 `schema:dump` 명령어를 실행하여 시작할 수 있습니다.

```shell
php artisan schema:dump

# 현재 데이터베이스 스키마를 덤프하고 기존의 모든 마이그레이션을 정리(clean up)합니다...
php artisan schema:dump --prune
```

이 명령어를 실행하면, 라라벨은 애플리케이션의 `database/schema` 디렉터리에 "스키마(schema)" 파일을 만듭니다. 이 스키마 파일의 이름은 데이터베이스 커넥션명과 일치합니다. 이제 데이터베이스에 아직 아무 마이그레이션도 적용된 적이 없다면, 마이그레이션 실행 시 사용 중인 커넥션의 스키마 파일에 들어있는 SQL 구문이 가장 먼저 실행됩니다. 스키마 파일의 SQL 구문이 모두 실행된 이후에는, 해당 덤프에 포함되지 않은 나머지 마이그레이션들만 추가로 실행됩니다.

만약 애플리케이션 테스트 코드에서 로컬 개발과는 다른 데이터베이스 커넥션을 사용한다면, 테스트에서도 데이터베이스 구조를 제대로 생성할 수 있도록 반드시 해당 커넥션용 스키마 파일을 만들어야 합니다. 일반적으로 로컬 개발용 커넥션의 스키마를 먼저 덤프한 후 추가로 아래와 같이 테스트용으로도 덤프 파일을 만들어주면 좋습니다.

```shell
php artisan schema:dump
php artisan schema:dump --database=testing --prune
```

생성된 데이터베이스 스키마 파일은 소스 컨트롤에도 꼭 커밋해야 합니다. 이렇게 하면 팀의 신규 개발자들도 애플리케이션의 초기 데이터베이스 구조를 빠르게 만들 수 있습니다.

> [!WARNING]  
> 마이그레이션 합치기(squashing)는 MariaDB, MySQL, PostgreSQL, SQLite 데이터베이스에서만 지원되며, 데이터베이스의 커맨드라인 클라이언트를 사용합니다.

<a name="migration-structure"></a>
## 마이그레이션 구조

마이그레이션 클래스는 `up`과 `down` 두 개의 메서드를 가집니다. `up` 메서드는 데이터베이스에 새로운 테이블, 컬럼, 인덱스를 추가할 때 사용하고, `down` 메서드는 `up`에서 수행한 동작을 되돌리는 역할을 합니다.

두 메서드 내부에서는 라라벨 스키마 빌더를 사용해 테이블을 간결하게 생성하고 수정할 수 있습니다. `Schema` 빌더에서 제공하는 모든 메서드에 대해 더 알고 싶다면 [관련 문서](#creating-tables)를 참고하세요. 아래는 `flights` 테이블을 생성하는 마이그레이션의 예시입니다.

```
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('flights', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('airline');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::drop('flights');
    }
};
```

<a name="setting-the-migration-connection"></a>
#### 마이그레이션에 사용할 데이터베이스 커넥션 지정

마이그레이션에서 애플리케이션의 기본 데이터베이스 커넥션이 아닌 다른 커넥션을 사용하고 싶을 경우, 마이그레이션 클래스에 `$connection` 속성을 지정하면 됩니다.

```
/**
 * The database connection that should be used by the migration.
 *
 * @var string
 */
protected $connection = 'pgsql';

/**
 * Run the migrations.
 */
public function up(): void
{
    // ...
}
```

<a name="running-migrations"></a>
## 마이그레이션 실행

아직 실행되지 않은 모든 마이그레이션을 적용하려면 `migrate` 아티즌 명령어를 실행하세요.

```shell
php artisan migrate
```

현재까지 적용된 마이그레이션 목록을 확인하려면, `migrate:status` 아티즌 명령어를 사용할 수 있습니다.

```shell
php artisan migrate:status
```

실제 마이그레이션을 실행하지 않고, 어떤 SQL 구문들이 실행될 것인지 미리 확인하고 싶다면 `migrate` 명령어에 `--pretend` 플래그를 사용할 수 있습니다.

```shell
php artisan migrate --pretend
```

#### 마이그레이션 실행 격리(분리)하기

애플리케이션을 여러 서버에 배포하고, 배포 중에 마이그레이션을 실행해야 한다면, 두 서버에서 동시에 마이그레이션이 실행되는 상황을 피하고 싶을 것입니다. 이때는 `migrate` 명령어 실행 시 `isolated` 옵션을 사용할 수 있습니다.

`isolated` 옵션을 지정하면, 라라벨은 마이그레이션 실행 전에 애플리케이션의 캐시 드라이버를 사용해 원자적(atomic) 락을 획득합니다. 락이 걸려 있는 동안에는 다른 서버에서 실행하는 `migrate` 명령어는 실제로 마이그레이션이 수행되지 않습니다. 단, 명령어 자체는 정상적으로 종료되어 성공 코드로 반환됩니다.

```shell
php artisan migrate --isolated
```

> [!WARNING]  
> 이 기능을 사용하려면, 기본 캐시 드라이버로 `memcached`, `redis`, `dynamodb`, `database`, `file`, `array` 중 하나를 설정해야 하며, 모든 서버가 동일한 중앙 캐시 서버와 통신해야 합니다.

<a name="forcing-migrations-to-run-in-production"></a>
#### 운영 환경에서 강제 마이그레이션 실행

일부 마이그레이션 작업은 데이터의 손실을 유발할 수 있습니다. 이런 파괴적인 작업을 운영 데이터베이스에 실수로 실행하는 것을 방지하기 위해, 명령 실행 전 확인을 요구하는 프롬프트가 표시됩니다. 프롬프트 없이 명령을 강제로 실행시키고 싶을 땐 `--force` 플래그를 사용합니다.

```shell
php artisan migrate --force
```

<a name="rolling-back-migrations"></a>
### 마이그레이션 롤백

가장 최근에 적용한 마이그레이션 작업을 되돌리고 싶으면 `rollback` 아티즌 명령어를 사용하세요. 이 명령어는 가장 마지막 "배치(batch)"에 포함된 모든 마이그레이션 파일을 한 번에 롤백합니다.

```shell
php artisan migrate:rollback
```

`step` 옵션으로, 되돌리고 싶은 마이그레이션의 개수를 제한할 수 있습니다. 아래 예시처럼 최근 5개의 마이그레이션만 롤백할 수도 있습니다.

```shell
php artisan migrate:rollback --step=5
```

또한, 특정 "배치 번호"에 해당하는 마이그레이션을 롤백하고 싶을 때는 `batch` 옵션에 롤백할 배치 번호(값)를 지정하면 됩니다. 이 번호는 애플리케이션의 `migrations` 데이터베이스 테이블에 기록돼 있습니다. 예를 들어, 3번 배치의 모든 마이그레이션을 롤백하려면 다음과 같이 실행할 수 있습니다.

 ```shell
php artisan migrate:rollback --batch=3
 ```

실제로 롤백하지 않고, 어떤 SQL 명령어가 실행될 것인지 확인만 하고 싶으면 `migrate:rollback` 명령어에 `--pretend` 플래그를 추가합니다.

```shell
php artisan migrate:rollback --pretend
```

`migrate:reset` 명령어를 사용하면, 애플리케이션에 적용된 모든 마이그레이션을 한 번에 롤백할 수 있습니다.

```shell
php artisan migrate:reset
```

<a name="roll-back-migrate-using-a-single-command"></a>
#### 롤백과 마이그레이션을 한 번에 실행

`migrate:refresh` 명령어를 사용하면, 모든 마이그레이션을 롤백한 다음 다시 마이그레이션을 실행하게 됩니다. 즉, 데이터베이스 전체를 다시 만드는 효과와 같습니다.

```shell
php artisan migrate:refresh

# 데이터베이스를 새로 만든 후 모든 시드(초기 샘플 데이터)도 실행합니다...
php artisan migrate:refresh --seed
```

`refresh` 명령어에 `step` 옵션을 제공하면, 최근 N개의 마이그레이션만 롤백하고 다시 마이그레이션할 수 있습니다. 예를 들어, 최근 5개의 마이그레이션만 대상이면 아래와 같습니다.

```shell
php artisan migrate:refresh --step=5
```

<a name="drop-all-tables-migrate"></a>
#### 모든 테이블 삭제 후 마이그레이션

`migrate:fresh` 명령어는 데이터베이스에서 모든 테이블을 삭제한 후, 다시 마이그레이션을 실행합니다.

```shell
php artisan migrate:fresh

php artisan migrate:fresh --seed
```

기본적으로 `migrate:fresh` 명령어는 기본 데이터베이스 커넥션의 테이블만 삭제합니다. 하지만 `--database` 옵션으로 마이그레이션 대상이 될 커넥션을 지정할 수도 있습니다. 이때 지정하는 이름은 애플리케이션의 `database` [설정 파일](/docs/11.x/configuration)에 정의된 커넥션명이어야 합니다.

```shell
php artisan migrate:fresh --database=admin
```

> [!WARNING]  
> `migrate:fresh` 명령어는 테이블 이름의 프리픽스(접두사)에 관계없이 데이터베이스의 모든 테이블을 삭제합니다. 다른 애플리케이션과 데이터베이스를 공유할 때는 사용에 특히 주의하세요.

<a name="tables"></a>
## 테이블

<a name="creating-tables"></a>
### 테이블 생성

새로운 데이터베이스 테이블을 만들려면, `Schema` 파사드의 `create` 메서드를 사용합니다. `create` 메서드는 두 개의 인수를 받으며, 첫 번째는 테이블 이름이고, 두 번째는 새로운 테이블을 정의할 때 사용할 수 있는 `Blueprint` 객체를 인자로 받는 클로저입니다.

```
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email');
    $table->timestamps();
});
```

테이블을 생성할 때, 스키마 빌더에서 제공하는 다양한 [컬럼 메서드](#creating-columns)를 이용해 테이블의 컬럼을 자유롭게 정의할 수 있습니다.

<a name="determining-table-column-existence"></a>
#### 테이블/컬럼의 존재 유무 확인

`hasTable`, `hasColumn`, `hasIndex` 메서드를 사용해 테이블, 컬럼, 또는 인덱스의 존재 여부를 확인할 수 있습니다.

```
if (Schema::hasTable('users')) {
    // "users" 테이블이 있습니다...
}

if (Schema::hasColumn('users', 'email')) {
    // "users" 테이블이 존재하고, "email" 컬럼을 가지고 있습니다...
}

if (Schema::hasIndex('users', ['email'], 'unique')) {
    // "users" 테이블이 존재하고, "email" 컬럼에 유니크 인덱스가 걸려 있습니다...
}
```

<a name="database-connection-table-options"></a>
#### 데이터베이스 커넥션 및 테이블 옵션

애플리케이션의 기본 커넥션이 아닌 다른 데이터베이스 커넥션에서 스키마 작업을 하고 싶다면, `connection` 메서드를 사용할 수 있습니다.

```
Schema::connection('sqlite')->create('users', function (Blueprint $table) {
    $table->id();
});
```

이외에도 테이블 생성 시 몇몇 속성과 메서드로 테이블의 다양한 설정값을 지정할 수 있습니다. MariaDB나 MySQL을 사용할 때 `engine` 속성을 통해 테이블의 스토리지 엔진을 지정할 수 있습니다.

```
Schema::create('users', function (Blueprint $table) {
    $table->engine('InnoDB');

    // ...
});
```

MariaDB와 MySQL에서는 테이블의 문자 집합(charset)과 정렬 기준(collation)도 `charset`, `collation` 속성으로 지정할 수 있습니다.

```
Schema::create('users', function (Blueprint $table) {
    $table->charset('utf8mb4');
    $table->collation('utf8mb4_unicode_ci');

    // ...
});
```

`temporary` 메서드를 사용하면 임시(temporary) 테이블도 생성할 수 있습니다. 임시 테이블은 현재 커넥션의 세션에서만 보이며, 커넥션이 종료되면 자동으로 삭제됩니다.

```
Schema::create('calculations', function (Blueprint $table) {
    $table->temporary();

    // ...
});
```

데이터베이스 테이블에 "주석(comment)"을 추가하고 싶으면, 테이블 인스턴스의 `comment` 메서드를 호출하면 됩니다. 테이블 주석은 MariaDB, MySQL, PostgreSQL에서 지원됩니다.

```
Schema::create('calculations', function (Blueprint $table) {
    $table->comment('Business calculations');

    // ...
});
```

<a name="updating-tables"></a>
### 테이블 수정

기존 테이블을 수정하려면, `Schema` 파사드의 `table` 메서드를 사용할 수 있습니다. `create` 메서드와 마찬가지로 두 개의 인수를 받으며, 첫 번째는 테이블 이름, 두 번째는 컬럼이나 인덱스를 추가할 수 있는 `Blueprint` 인스턴스를 받는 클로저입니다.

```
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('users', function (Blueprint $table) {
    $table->integer('votes');
});
```

<a name="renaming-and-dropping-tables"></a>
### 테이블 이름 변경 및 삭제

기존 데이터베이스 테이블의 이름을 바꾸려면 `rename` 메서드를 사용하세요.

```
use Illuminate\Support\Facades\Schema;

Schema::rename($from, $to);
```

테이블을 삭제하려면 `drop` 또는 `dropIfExists` 메서드를 사용할 수 있습니다.

```
Schema::drop('users');

Schema::dropIfExists('users');
```

<a name="renaming-tables-with-foreign-keys"></a>
#### 외래키가 있는 테이블 이름 변경

테이블의 이름을 변경하기 전에, 해당 테이블의 외래키 제약 조건(foreign key constraint)이 마이그레이션 파일에서 명시적으로 이름이 지정되어 있는지 반드시 확인해야 합니다. 만약 라라벨의 네이밍 규칙에 따라 자동으로 이름이 할당되었다면, 테이블 이름을 변경해도 외래키 제약 이름은 여전히 이전 테이블명을 사용하게 됩니다.

<a name="columns"></a>
## 컬럼

<a name="creating-columns"></a>
### 컬럼 생성

기존 테이블에 컬럼을 추가할 때는, `Schema` 파사드의 `table` 메서드를 사용할 수 있습니다. `create` 메서드와 마찬가지로 두 개의 인수를 받으며, 첫 번째는 테이블 이름, 두 번째는 `Illuminate\Database\Schema\Blueprint` 인스턴스를 받는 클로저에서 컬럼을 추가할 수 있습니다.

```
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('users', function (Blueprint $table) {
    $table->integer('votes');
});
```

<a name="available-column-types"></a>
### 사용 가능한 컬럼 타입

스키마 빌더의 블루프린트(Blueprint)에서는 데이터베이스 테이블에 추가할 수 있는 다양한 유형의 컬럼을 메서드로 제공합니다. 각 컬럼 타입마다 제공되는 메서드는 아래 표에서 확인할 수 있습니다.



<a name="booleans-method-list"></a>
#### 불리언 타입

<div class="collection-method-list" markdown="1">

[boolean](#column-method-boolean)

</div>

<a name="strings-and-texts-method-list"></a>
#### 문자열 및 텍스트 타입

<div class="collection-method-list" markdown="1">

[char](#column-method-char)
[longText](#column-method-longText)
[mediumText](#column-method-mediumText)
[string](#column-method-string)
[text](#column-method-text)
[tinyText](#column-method-tinyText)

</div>

<a name="numbers--method-list"></a>
#### 숫자 타입

<div class="collection-method-list" markdown="1">

[bigIncrements](#column-method-bigIncrements)
[bigInteger](#column-method-bigInteger)
[decimal](#column-method-decimal)
[double](#column-method-double)
[float](#column-method-float)
[id](#column-method-id)
[increments](#column-method-increments)
[integer](#column-method-integer)
[mediumIncrements](#column-method-mediumIncrements)
[mediumInteger](#column-method-mediumInteger)
[smallIncrements](#column-method-smallIncrements)
[smallInteger](#column-method-smallInteger)
[tinyIncrements](#column-method-tinyIncrements)
[tinyInteger](#column-method-tinyInteger)
[unsignedBigInteger](#column-method-unsignedBigInteger)
[unsignedInteger](#column-method-unsignedInteger)
[unsignedMediumInteger](#column-method-unsignedMediumInteger)
[unsignedSmallInteger](#column-method-unsignedSmallInteger)
[unsignedTinyInteger](#column-method-unsignedTinyInteger)

</div>

<a name="dates-and-times-method-list"></a>
#### 날짜 및 시간 타입

<div class="collection-method-list" markdown="1">

[dateTime](#column-method-dateTime)
[dateTimeTz](#column-method-dateTimeTz)
[date](#column-method-date)
[time](#column-method-time)
[timeTz](#column-method-timeTz)
[timestamp](#column-method-timestamp)
[timestamps](#column-method-timestamps)
[timestampsTz](#column-method-timestampsTz)
[softDeletes](#column-method-softDeletes)
[softDeletesTz](#column-method-softDeletesTz)
[year](#column-method-year)

</div>

<a name="binaries-method-list"></a>
#### 바이너리 타입

<div class="collection-method-list" markdown="1">

[binary](#column-method-binary)

</div>

<a name="object-and-jsons-method-list"></a>
#### 객체 & JSON 타입

<div class="collection-method-list" markdown="1">

[json](#column-method-json)
[jsonb](#column-method-jsonb)

</div>

<a name="uuids-and-ulids-method-list"></a>
#### UUID & ULID 타입

<div class="collection-method-list" markdown="1">

[ulid](#column-method-ulid)
[ulidMorphs](#column-method-ulidMorphs)
[uuid](#column-method-uuid)
[uuidMorphs](#column-method-uuidMorphs)
[nullableUlidMorphs](#column-method-nullableUlidMorphs)
[nullableUuidMorphs](#column-method-nullableUuidMorphs)

</div>

<a name="spatials-method-list"></a>
#### 공간(Spatial) 타입

<div class="collection-method-list" markdown="1">

[geography](#column-method-geography)
[geometry](#column-method-geometry)

</div>

#### 연관관계 타입

<div class="collection-method-list" markdown="1">

[foreignId](#column-method-foreignId)
[foreignIdFor](#column-method-foreignIdFor)
[foreignUlid](#column-method-foreignUlid)
[foreignUuid](#column-method-foreignUuid)
[morphs](#column-method-morphs)
[nullableMorphs](#column-method-nullableMorphs)

</div>

<a name="spacifics-method-list"></a>
#### 특수 타입

<div class="collection-method-list" markdown="1">

[enum](#column-method-enum)
[set](#column-method-set)
[macAddress](#column-method-macAddress)
[ipAddress](#column-method-ipAddress)
[rememberToken](#column-method-rememberToken)
[vector](#column-method-vector)

</div>

<a name="column-method-bigIncrements"></a>
#### `bigIncrements()`

`bigIncrements` 메서드는 자동 증가되는 `UNSIGNED BIGINT`(기본키)와 동등한 컬럼을 생성합니다.

```
$table->bigIncrements('id');
```

<a name="column-method-bigInteger"></a>
#### `bigInteger()`

`bigInteger` 메서드는 `BIGINT`와 동등한 컬럼을 생성합니다.

```
$table->bigInteger('votes');
```

<a name="column-method-binary"></a>

#### `binary()`

`binary` 메서드는 `BLOB`과 동일한 컬럼을 생성합니다.

```
$table->binary('photo');
```

MySQL, MariaDB 또는 SQL Server를 사용할 경우, `length`와 `fixed` 인수를 추가로 지정하여 `VARBINARY` 또는 `BINARY`와 동일한 컬럼을 생성할 수 있습니다.

```
$table->binary('data', length: 16); // VARBINARY(16)

$table->binary('data', length: 16, fixed: true); // BINARY(16)
```

<a name="column-method-boolean"></a>
#### `boolean()`

`boolean` 메서드는 `BOOLEAN`과 같은 컬럼을 생성합니다.

```
$table->boolean('confirmed');
```

<a name="column-method-char"></a>
#### `char()`

`char` 메서드는 지정된 길이의 `CHAR` 컬럼을 생성합니다.

```
$table->char('name', length: 100);
```

<a name="column-method-dateTimeTz"></a>
#### `dateTimeTz()`

`dateTimeTz` 메서드는 (타임존 정보를 포함한) `DATETIME`과 동일한 컬럼을 생성하며, 선택적으로 소수점 이하 초 자릿수(precision)를 지정할 수 있습니다.

```
$table->dateTimeTz('created_at', precision: 0);
```

<a name="column-method-dateTime"></a>
#### `dateTime()`

`dateTime` 메서드는 `DATETIME`과 동일한 컬럼을 생성하며, 선택적으로 소수점 이하 초 자릿수(precision)를 지정할 수 있습니다.

```
$table->dateTime('created_at', precision: 0);
```

<a name="column-method-date"></a>
#### `date()`

`date` 메서드는 `DATE`와 동일한 컬럼을 생성합니다.

```
$table->date('created_at');
```

<a name="column-method-decimal"></a>
#### `decimal()`

`decimal` 메서드는 지정된 전체 자릿수(total)와 소수 자릿수(places)를 갖는 `DECIMAL` 컬럼을 생성합니다.

```
$table->decimal('amount', total: 8, places: 2);
```

<a name="column-method-double"></a>
#### `double()`

`double` 메서드는 `DOUBLE`과 동일한 컬럼을 생성합니다.

```
$table->double('amount');
```

<a name="column-method-enum"></a>
#### `enum()`

`enum` 메서드는 주어진 값 목록을 가진 `ENUM` 컬럼을 생성합니다.

```
$table->enum('difficulty', ['easy', 'hard']);
```

<a name="column-method-float"></a>
#### `float()`

`float` 메서드는 지정된 precision을 가진 `FLOAT` 컬럼을 생성합니다.

```
$table->float('amount', precision: 53);
```

<a name="column-method-foreignId"></a>
#### `foreignId()`

`foreignId` 메서드는 `UNSIGNED BIGINT`와 동일한 컬럼을 생성합니다.

```
$table->foreignId('user_id');
```

<a name="column-method-foreignIdFor"></a>
#### `foreignIdFor()`

`foreignIdFor` 메서드는 주어진 모델 클래스에 대해 `{column}_id` 컬럼을 추가합니다. 컬럼 타입은 모델의 기본 키 타입에 따라 `UNSIGNED BIGINT`, `CHAR(36)` 또는 `CHAR(26)` 중 하나가 됩니다.

```
$table->foreignIdFor(User::class);
```

<a name="column-method-foreignUlid"></a>
#### `foreignUlid()`

`foreignUlid` 메서드는 `ULID`와 동일한 컬럼을 생성합니다.

```
$table->foreignUlid('user_id');
```

<a name="column-method-foreignUuid"></a>
#### `foreignUuid()`

`foreignUuid` 메서드는 `UUID`와 동일한 컬럼을 생성합니다.

```
$table->foreignUuid('user_id');
```

<a name="column-method-geography"></a>
#### `geography()`

`geography` 메서드는 지정된 공간 타입(subtype)과 SRID(공간 기준계 식별자)를 갖는 `GEOGRAPHY` 컬럼을 생성합니다.

```
$table->geography('coordinates', subtype: 'point', srid: 4326);
```

> [!NOTE]  
> 공간 타입(Spatial type) 지원 여부는 사용하는 데이터베이스 드라이버에 따라 다릅니다. 각 데이터베이스의 공식 문서를 참고하세요. PostgreSQL을 사용하는 경우, `geography` 메서드를 사용하려면 반드시 [PostGIS](https://postgis.net) 확장 기능을 사전에 설치해야 합니다.

<a name="column-method-geometry"></a>
#### `geometry()`

`geometry` 메서드는 지정된 공간 타입(subtype)과 SRID(공간 기준계 식별자)를 갖는 `GEOMETRY` 컬럼을 생성합니다.

```
$table->geometry('positions', subtype: 'point', srid: 0);
```

> [!NOTE]  
> 공간 타입(Spatial type) 지원 여부는 사용하는 데이터베이스 드라이버에 따라 다릅니다. 각 데이터베이스의 공식 문서를 참고하세요. PostgreSQL을 사용하는 경우, `geometry` 메서드를 사용하려면 반드시 [PostGIS](https://postgis.net) 확장 기능을 사전에 설치해야 합니다.

<a name="column-method-id"></a>
#### `id()`

`id` 메서드는 `bigIncrements` 메서드의 별칭입니다. 기본적으로 `id` 컬럼이 생성되지만, 원한다면 다른 컬럼명을 인수로 전달하여 커스텀 이름으로 컬럼을 만들 수 있습니다.

```
$table->id();
```

<a name="column-method-increments"></a>
#### `increments()`

`increments` 메서드는 프라이머리 키로 사용되는 자동 증가 `UNSIGNED INTEGER` 컬럼을 생성합니다.

```
$table->increments('id');
```

<a name="column-method-integer"></a>
#### `integer()`

`integer` 메서드는 `INTEGER`와 동일한 컬럼을 생성합니다.

```
$table->integer('votes');
```

<a name="column-method-ipAddress"></a>
#### `ipAddress()`

`ipAddress` 메서드는 `VARCHAR`와 동일한 컬럼을 생성합니다.

```
$table->ipAddress('visitor');
```

PostgreSQL을 사용하는 경우, `INET` 타입의 컬럼이 생성됩니다.

<a name="column-method-json"></a>
#### `json()`

`json` 메서드는 `JSON`과 동일한 컬럼을 생성합니다.

```
$table->json('options');
```

SQLite를 사용하는 경우, 대신 `TEXT` 컬럼이 생성됩니다.

<a name="column-method-jsonb"></a>
#### `jsonb()`

`jsonb` 메서드는 `JSONB`와 동일한 컬럼을 생성합니다.

```
$table->jsonb('options');
```

SQLite를 사용하는 경우, 대신 `TEXT` 컬럼이 생성됩니다.

<a name="column-method-longText"></a>
#### `longText()`

`longText` 메서드는 `LONGTEXT`와 동일한 컬럼을 생성합니다.

```
$table->longText('description');
```

MySQL 또는 MariaDB를 사용할 때는, 컬럼에 `binary` 문자셋을 적용하여 `LONGBLOB`과 동일한 컬럼을 생성할 수 있습니다.

```
$table->longText('data')->charset('binary'); // LONGBLOB
```

<a name="column-method-macAddress"></a>
#### `macAddress()`

`macAddress` 메서드는 MAC 주소를 저장하는 컬럼을 생성합니다. PostgreSQL과 같이 이 타입을 위해 전용 컬럼 타입을 지원하는 데이터베이스도 있으나, 그렇지 않은 경우에는 문자열 컬럼이 사용됩니다.

```
$table->macAddress('device');
```

<a name="column-method-mediumIncrements"></a>
#### `mediumIncrements()`

`mediumIncrements` 메서드는 프라이머리 키로 사용되는 자동 증가 `UNSIGNED MEDIUMINT` 컬럼을 생성합니다.

```
$table->mediumIncrements('id');
```

<a name="column-method-mediumInteger"></a>
#### `mediumInteger()`

`mediumInteger` 메서드는 `MEDIUMINT`와 동일한 컬럼을 생성합니다.

```
$table->mediumInteger('votes');
```

<a name="column-method-mediumText"></a>
#### `mediumText()`

`mediumText` 메서드는 `MEDIUMTEXT`와 동일한 컬럼을 생성합니다.

```
$table->mediumText('description');
```

MySQL 또는 MariaDB를 사용할 때는, 컬럼에 `binary` 문자셋을 적용하여 `MEDIUMBLOB`과 동일한 컬럼을 생성할 수 있습니다.

```
$table->mediumText('data')->charset('binary'); // MEDIUMBLOB
```

<a name="column-method-morphs"></a>
#### `morphs()`

`morphs` 메서드는 `{column}_id` 컬럼과 `{column}_type` `VARCHAR` 컬럼을 함께 생성하는 편의 메서드입니다. `{column}_id` 컬럼의 타입은 모델의 기본 키 타입에 따라 `UNSIGNED BIGINT`, `CHAR(36)`, `CHAR(26)` 중 하나가 됩니다.

이 메서드는 다형성 [Eloquent 연관관계](/docs/11.x/eloquent-relationships)에 필요한 컬럼을 정의할 때 사용됩니다. 다음 예시의 경우, `taggable_id`와 `taggable_type` 컬럼이 생성됩니다.

```
$table->morphs('taggable');
```

<a name="column-method-nullableMorphs"></a>
#### `nullableMorphs()`

이 메서드는 [morphs](#column-method-morphs) 메서드와 유사하지만, 생성되는 컬럼들이 "nullable"로 지정된다는 점이 다릅니다.

```
$table->nullableMorphs('taggable');
```

<a name="column-method-nullableUlidMorphs"></a>
#### `nullableUlidMorphs()`

이 메서드는 [ulidMorphs](#column-method-ulidMorphs) 메서드와 유사하지만, 생성되는 컬럼들이 "nullable"로 지정된다는 점이 다릅니다.

```
$table->nullableUlidMorphs('taggable');
```

<a name="column-method-nullableUuidMorphs"></a>
#### `nullableUuidMorphs()`

이 메서드는 [uuidMorphs](#column-method-uuidMorphs) 메서드와 유사하지만, 생성되는 컬럼들이 "nullable"로 지정된다는 점이 다릅니다.

```
$table->nullableUuidMorphs('taggable');
```

<a name="column-method-rememberToken"></a>
#### `rememberToken()`

`rememberToken` 메서드는 현재 "remember me" [인증 토큰](/docs/11.x/authentication#remembering-users)을 저장하기 위한, nullable `VARCHAR(100)` 컬럼을 생성합니다.

```
$table->rememberToken();
```

<a name="column-method-set"></a>
#### `set()`

`set` 메서드는 주어진 값 목록을 갖는 `SET` 컬럼을 생성합니다.

```
$table->set('flavors', ['strawberry', 'vanilla']);
```

<a name="column-method-smallIncrements"></a>
#### `smallIncrements()`

`smallIncrements` 메서드는 프라이머리 키로 사용되는 자동 증가 `UNSIGNED SMALLINT` 컬럼을 생성합니다.

```
$table->smallIncrements('id');
```

<a name="column-method-smallInteger"></a>
#### `smallInteger()`

`smallInteger` 메서드는 `SMALLINT`와 동일한 컬럼을 생성합니다.

```
$table->smallInteger('votes');
```

<a name="column-method-softDeletesTz"></a>
#### `softDeletesTz()`

`softDeletesTz` 메서드는 nullable `deleted_at` `TIMESTAMP`(타임존 포함) 컬럼을 생성하며, 선택적으로 소수점 이하 초 자릿수(precision)를 지정할 수 있습니다. 이 컬럼은 Eloquent의 "소프트 삭제(soft delete)" 기능에 필요한 `deleted_at` 타임스탬프를 저장하는데 사용됩니다.

```
$table->softDeletesTz('deleted_at', precision: 0);
```

<a name="column-method-softDeletes"></a>
#### `softDeletes()`

`softDeletes` 메서드는 nullable `deleted_at` `TIMESTAMP` 컬럼을 생성하며, 선택적으로 소수점 이하 초 자릿수(precision)를 지정할 수 있습니다. 이 컬럼은 Eloquent의 "소프트 삭제(soft delete)" 기능에 필요한 `deleted_at` 타임스탬프를 저장하는데 사용됩니다.

```
$table->softDeletes('deleted_at', precision: 0);
```

<a name="column-method-string"></a>
#### `string()`

`string` 메서드는 지정된 길이의 `VARCHAR` 컬럼을 생성합니다.

```
$table->string('name', length: 100);
```

<a name="column-method-text"></a>
#### `text()`

`text` 메서드는 `TEXT`와 동일한 컬럼을 생성합니다.

```
$table->text('description');
```

MySQL 또는 MariaDB를 사용할 때는, 컬럼에 `binary` 문자셋을 지정해 `BLOB`과 동일한 컬럼을 생성할 수도 있습니다.

```
$table->text('data')->charset('binary'); // BLOB
```

<a name="column-method-timeTz"></a>
#### `timeTz()`

`timeTz` 메서드는 (타임존 정보를 포함하는) `TIME`과 동일한 컬럼을 생성하며, 선택적으로 소수점 이하 초 자릿수(precision)를 지정할 수 있습니다.

```
$table->timeTz('sunrise', precision: 0);
```

<a name="column-method-time"></a>
#### `time()`

`time` 메서드는 `TIME`과 동일한 컬럼을 생성하며, 선택적으로 소수점 이하 초 자릿수(precision)를 지정할 수 있습니다.

```
$table->time('sunrise', precision: 0);
```

<a name="column-method-timestampTz"></a>
#### `timestampTz()`

`timestampTz` 메서드는 (타임존 정보를 포함하는) `TIMESTAMP`와 동일한 컬럼을 생성하며, 선택적으로 소수점 이하 초 자릿수(precision)를 지정할 수 있습니다.

```
$table->timestampTz('added_at', precision: 0);
```

<a name="column-method-timestamp"></a>
#### `timestamp()`

`timestamp` 메서드는 `TIMESTAMP`와 동일한 컬럼을 생성하며, 선택적으로 소수점 이하 초 자릿수(precision)를 지정할 수 있습니다.

```
$table->timestamp('added_at', precision: 0);
```

<a name="column-method-timestampsTz"></a>
#### `timestampsTz()`

`timestampsTz` 메서드는 `created_at` 및 `updated_at` 컬럼을 (타임존 정보가 포함된) `TIMESTAMP` 컬럼으로 생성하며, 선택적으로 소수점 이하 초 자릿수(precision)를 지정할 수 있습니다.

```
$table->timestampsTz(precision: 0);
```

<a name="column-method-timestamps"></a>
#### `timestamps()`

`timestamps` 메서드는 `created_at`, `updated_at` 두 컬럼을 `TIMESTAMP` 컬럼으로 생성하며, 선택적으로 소수점 이하 초 자릿수(precision)를 지정할 수 있습니다.

```
$table->timestamps(precision: 0);
```

<a name="column-method-tinyIncrements"></a>
#### `tinyIncrements()`

`tinyIncrements` 메서드는 프라이머리 키로 사용되는 자동 증가 `UNSIGNED TINYINT` 컬럼을 생성합니다.

```
$table->tinyIncrements('id');
```

<a name="column-method-tinyInteger"></a>
#### `tinyInteger()`

`tinyInteger` 메서드는 `TINYINT`와 동일한 컬럼을 생성합니다.

```
$table->tinyInteger('votes');
```

<a name="column-method-tinyText"></a>
#### `tinyText()`

`tinyText` 메서드는 `TINYTEXT`와 동일한 컬럼을 생성합니다.

```
$table->tinyText('notes');
```

MySQL 또는 MariaDB를 사용할 때는, 컬럼에 `binary` 문자셋을 적용하여 `TINYBLOB` 컬럼을 생성할 수 있습니다.

```
$table->tinyText('data')->charset('binary'); // TINYBLOB
```

<a name="column-method-unsignedBigInteger"></a>
#### `unsignedBigInteger()`

`unsignedBigInteger` 메서드는 `UNSIGNED BIGINT`와 동일한 컬럼을 생성합니다.

```
$table->unsignedBigInteger('votes');
```

<a name="column-method-unsignedInteger"></a>
#### `unsignedInteger()`

`unsignedInteger` 메서드는 `UNSIGNED INTEGER`와 동일한 컬럼을 생성합니다.

```
$table->unsignedInteger('votes');
```

<a name="column-method-unsignedMediumInteger"></a>
#### `unsignedMediumInteger()`

`unsignedMediumInteger` 메서드는 `UNSIGNED MEDIUMINT`와 동일한 컬럼을 생성합니다.

```
$table->unsignedMediumInteger('votes');
```

<a name="column-method-unsignedSmallInteger"></a>
#### `unsignedSmallInteger()`

`unsignedSmallInteger` 메서드는 `UNSIGNED SMALLINT`와 동일한 컬럼을 생성합니다.

```
$table->unsignedSmallInteger('votes');
```

<a name="column-method-unsignedTinyInteger"></a>
#### `unsignedTinyInteger()`

`unsignedTinyInteger` 메서드는 `UNSIGNED TINYINT`와 동일한 컬럼을 생성합니다.

```
$table->unsignedTinyInteger('votes');
```

<a name="column-method-ulidMorphs"></a>
#### `ulidMorphs()`

`ulidMorphs` 메서드는 `{column}_id` `CHAR(26)` 컬럼과 `{column}_type` `VARCHAR` 컬럼을 함께 생성하는 편의 메서드입니다.

이 메서드는 ULID 식별자를 사용하는 다형성 [Eloquent 연관관계](/docs/11.x/eloquent-relationships)에 필요한 컬럼을 정의할 때 사용됩니다. 아래 예시에서는 `taggable_id` 및 `taggable_type` 두 컬럼이 생성됩니다.

```
$table->ulidMorphs('taggable');
```

<a name="column-method-uuidMorphs"></a>
#### `uuidMorphs()`

`uuidMorphs` 메서드는 `{column}_id` `CHAR(36)` 컬럼과 `{column}_type` `VARCHAR` 컬럼을 함께 생성하는 편의 메서드입니다.

이 메서드는 UUID 식별자를 사용하는 다형성 [Eloquent 연관관계](/docs/11.x/eloquent-relationships)에 필요한 컬럼을 정의할 때 사용됩니다. 아래 예시에서는 `taggable_id` 및 `taggable_type` 두 컬럼이 생성됩니다.

```
$table->uuidMorphs('taggable');
```

<a name="column-method-ulid"></a>
#### `ulid()`

`ulid` 메서드는 `ULID`와 동일한 컬럼을 생성합니다.

```
$table->ulid('id');
```

<a name="column-method-uuid"></a>
#### `uuid()`

`uuid` 메서드는 `UUID`와 동일한 컬럼을 생성합니다.

```
$table->uuid('id');
```

<a name="column-method-vector"></a>

#### `vector()`

`vector` 메서드는 `vector`에 해당하는 컬럼을 생성합니다.

```
$table->vector('embedding', dimensions: 100);
```

<a name="column-method-year"></a>
#### `year()`

`year` 메서드는 `YEAR`에 해당하는 컬럼을 생성합니다.

```
$table->year('birth_year');
```

<a name="column-modifiers"></a>
### 컬럼 수정자(Column Modifiers)

위에서 소개한 컬럼 타입 외에도, 데이터베이스 테이블에 컬럼을 추가할 때 사용할 수 있는 다양한 컬럼 "수정자"가 있습니다. 예를 들어, 컬럼을 "nullable"로 만들고 싶다면 `nullable` 메서드를 사용할 수 있습니다.

```
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('users', function (Blueprint $table) {
    $table->string('email')->nullable();
});
```

다음 표는 사용할 수 있는 모든 컬럼 수정자를 담고 있습니다. 이 목록에는 [인덱스 수정자](#creating-indexes)는 포함되어 있지 않습니다.

<div class="overflow-auto">

| 수정자(Modifier)                    | 설명                                                                                      |
| ----------------------------------- | ---------------------------------------------------------------------------------------- |
| `->after('column')`                 | 컬럼을 다른 컬럼 "뒤"에 배치합니다 (MariaDB / MySQL).                                     |
| `->autoIncrement()`                 | `INTEGER` 컬럼을 자동 증가(주 키)로 설정합니다.                                           |
| `->charset('utf8mb4')`              | 해당 컬럼에 사용할 문자셋을 지정합니다 (MariaDB / MySQL).                                 |
| `->collation('utf8mb4_unicode_ci')` | 해당 컬럼에 사용할 Collation을 지정합니다.                                                |
| `->comment('my comment')`           | 컬럼에 주석을 추가합니다 (MariaDB / MySQL / PostgreSQL).                                 |
| `->default($value)`                 | 컬럼의 "기본값"을 지정합니다.                                                            |
| `->first()`                         | 컬럼을 테이블에서 "첫 번째"로 배치합니다 (MariaDB / MySQL).                              |
| `->from($integer)`                  | 자동 증가 필드의 시작값을 지정합니다 (MariaDB / MySQL / PostgreSQL).                     |
| `->invisible()`                     | 해당 컬럼을 `SELECT *` 조회에서 "보이지 않게" 처리합니다 (MariaDB / MySQL).              |
| `->nullable($value = true)`         | 컬럼에 `NULL` 값이 들어갈 수 있도록 허용합니다.                                          |
| `->storedAs($expression)`           | 저장형(Stored) 생성 컬럼을 추가합니다 (MariaDB / MySQL / PostgreSQL / SQLite).           |
| `->unsigned()`                      | `INTEGER` 컬럼을 `UNSIGNED`로 설정합니다 (MariaDB / MySQL).                              |
| `->useCurrent()`                    | `TIMESTAMP` 컬럼의 기본값으로 `CURRENT_TIMESTAMP`를 사용하도록 설정합니다.               |
| `->useCurrentOnUpdate()`            | 레코드가 수정될 때 `TIMESTAMP` 컬럼에 `CURRENT_TIMESTAMP`를 사용하도록 설정합니다 (MariaDB / MySQL). |
| `->virtualAs($expression)`          | 가상(Virtual) 생성 컬럼을 추가합니다 (MariaDB / MySQL / SQLite).                         |
| `->generatedAs($expression)`        | 지정한 시퀀스 옵션으로 identity 컬럼을 생성합니다 (PostgreSQL).                          |
| `->always()`                        | identity 컬럼에서 입력값보다 시퀀스 값을 우선 적용합니다 (PostgreSQL).                    |

</div>

<a name="default-expressions"></a>
#### 기본 표현식(Default Expressions)

`default` 수정자는 값이나 `Illuminate\Database\Query\Expression` 인스턴스도 받을 수 있습니다. `Expression` 인스턴스를 사용하면 라라벨이 해당 값을 따옴표로 감싸지 않아, 데이터베이스별 특정 함수를 사용할 수 있습니다. 예를 들어, JSON 컬럼에 기본값을 지정할 때 특히 유용합니다.

```
<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Query\Expression;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('flights', function (Blueprint $table) {
            $table->id();
            $table->json('movies')->default(new Expression('(JSON_ARRAY())'));
            $table->timestamps();
        });
    }
};
```

> [!WARNING]  
> 기본 표현식 지원 여부는 사용 중인 데이터베이스 드라이버, 데이터베이스 버전, 그리고 필드 타입에 따라 다릅니다. 반드시 해당 데이터베이스의 공식 문서를 참고하시기 바랍니다.

<a name="column-order"></a>
#### 컬럼 순서 지정(Column Order)

MariaDB 또는 MySQL 데이터베이스에서는 `after` 메서드를 사용해 기존 컬럼 뒤에 새로운 컬럼을 추가할 수 있습니다.

```
$table->after('password', function (Blueprint $table) {
    $table->string('address_line1');
    $table->string('address_line2');
    $table->string('city');
});
```

<a name="modifying-columns"></a>
### 기존 컬럼 속성 변경하기

`change` 메서드는 기존 컬럼의 타입이나 속성을 수정할 수 있게 해줍니다. 예를 들어, `string` 컬럼의 크기를 늘리고 싶을 때 사용할 수 있습니다. 아래에서는 `name` 컬럼의 크기를 25에서 50으로 늘리는 예시를 보여줍니다. 원하는 컬럼의 새로운 상태를 정의한 뒤, `change`를 호출하면 됩니다.

```
Schema::table('users', function (Blueprint $table) {
    $table->string('name', 50)->change();
});
```

컬럼을 수정할 때, 컬럼에 남기고 싶은 모든 수정자를 반드시 명시적으로 작성해야 합니다. 누락된 속성은 제거되므로 주의하세요. 예를 들어, `unsigned`, `default`, `comment` 속성을 유지하고 싶다면, 각각의 수정자를 모두 호출해주어야 합니다.

```
Schema::table('users', function (Blueprint $table) {
    $table->integer('votes')->unsigned()->default(1)->comment('my comment')->change();
});
```

`change` 메서드는 컬럼의 인덱스에는 영향을 주지 않습니다. 따라서 컬럼을 수정하면서 인덱스도 추가하거나 제거하려면, 별도의 인덱스 수정자를 명시적으로 사용해야 합니다.

```php
// 인덱스 추가...
$table->bigIncrements('id')->primary()->change();

// 인덱스 제거...
$table->char('postal_code', 10)->unique(false)->change();
```

<a name="renaming-columns"></a>
### 컬럼 이름 변경하기

컬럼명을 변경하려면, 스키마 빌더에서 제공하는 `renameColumn` 메서드를 사용할 수 있습니다.

```
Schema::table('users', function (Blueprint $table) {
    $table->renameColumn('from', 'to');
});
```

<a name="dropping-columns"></a>
### 컬럼 삭제하기

컬럼을 삭제하려면 스키마 빌더의 `dropColumn` 메서드를 사용하세요.

```
Schema::table('users', function (Blueprint $table) {
    $table->dropColumn('votes');
});
```

컬럼명을 배열로 넘겨 한 번에 여러 컬럼을 삭제하는 것도 가능합니다.

```
Schema::table('users', function (Blueprint $table) {
    $table->dropColumn(['votes', 'avatar', 'location']);
});
```

<a name="available-command-aliases"></a>
#### 사용 가능한 명령어 별칭

라라벨은 자주 사용되는 컬럼 제거 작업을 손쉽게 진행할 수 있도록 여러 편리한 메서드를 제공합니다. 아래 표에서 각각의 메서드를 확인하실 수 있습니다.

<div class="overflow-auto">

| 명령어(Command)                        | 설명                                                      |
| -------------------------------------- | --------------------------------------------------------- |
| `$table->dropMorphs('morphable');`     | `morphable_id`와 `morphable_type` 컬럼을 삭제합니다.       |
| `$table->dropRememberToken();`         | `remember_token` 컬럼을 삭제합니다.                        |
| `$table->dropSoftDeletes();`           | `deleted_at` 컬럼을 삭제합니다.                            |
| `$table->dropSoftDeletesTz();`         | `dropSoftDeletes()` 메서드의 별칭입니다.                    |
| `$table->dropTimestamps();`            | `created_at`, `updated_at` 컬럼을 삭제합니다.              |
| `$table->dropTimestampsTz();`          | `dropTimestamps()` 메서드의 별칭입니다.                     |

</div>

<a name="indexes"></a>
## 인덱스(Index)

<a name="creating-indexes"></a>
### 인덱스 생성하기

라라벨 스키마 빌더는 다양한 유형의 인덱스를 지원합니다. 다음 예제는 새로운 `email` 컬럼을 정의하고 해당 값이 고유하도록 지정하는 방법을 보여줍니다. 인덱스를 생성하려면 컬럼 정의 끝에 `unique` 메서드를 체이닝하면 됩니다.

```
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('users', function (Blueprint $table) {
    $table->string('email')->unique();
});
```

컬럼을 정의한 후에 인덱스를 생성할 수도 있습니다. 이 경우, 스키마 빌더의 blueprint에서 `unique` 메서드를 호출하면 됩니다. 이 메서드는 고유 인덱스를 적용할 컬럼명을 인수로 받습니다.

```
$table->unique('email');
```

여러 컬럼을 배열로 넘겨 결합 인덱스(복합 인덱스)를 생성할 수도 있습니다.

```
$table->index(['account_id', 'created_at']);
```

인덱스를 만들 때 라라벨은 기본적으로 테이블명, 컬럼명, 그리고 인덱스 타입을 조합해 인덱스 이름을 자동으로 생성합니다. 하지만 두 번째 인수로 인덱스 이름을 직접 지정할 수도 있습니다.

```
$table->unique('email', 'unique_email');
```

<a name="available-index-types"></a>
#### 사용 가능한 인덱스 타입

라라벨의 스키마 빌더 blueprint 클래스는 각 인덱스 타입별로 메서드를 제공합니다. 각 인덱스 메서드는 인덱스 이름을 명시할 수 있는 두 번째 인수를 선택적으로 받을 수 있습니다. 인덱스 이름을 생략하면 인덱스에 사용된 테이블명, 컬럼명, 인덱스 타입에서 유래한 이름이 자동으로 생성됩니다. 아래 표에서 각 인덱스 메서드를 확인하실 수 있습니다.

<div class="overflow-auto">

| 명령어(Command)                                 | 설명                                                                   |
| ----------------------------------------------- | ---------------------------------------------------------------------- |
| `$table->primary('id');`                        | 기본 키(Primary key)를 추가합니다.                                      |
| `$table->primary(['id', 'parent_id']);`         | 복합 키(Composite key)를 추가합니다.                                   |
| `$table->unique('email');`                      | 고유 인덱스를 추가합니다.                                              |
| `$table->index('state');`                       | 일반 인덱스를 추가합니다.                                              |
| `$table->fullText('body');`                     | 전문 검색 인덱스를 추가합니다 (MariaDB / MySQL / PostgreSQL).           |
| `$table->fullText('body')->language('english');`| 지정 언어의 전문 검색 인덱스를 추가합니다 (PostgreSQL).                |
| `$table->spatialIndex('location');`             | 공간(Spatial) 인덱스를 추가합니다 (SQLite 제외).                        |

</div>

<a name="renaming-indexes"></a>
### 인덱스 이름 변경하기

인덱스 이름을 변경하려면, 스키마 빌더 blueprint에서 제공하는 `renameIndex` 메서드를 사용할 수 있습니다. 이 메서드는 현재 인덱스 이름을 첫 번째 인수로, 원하는 새로운 이름을 두 번째 인수로 받습니다.

```
$table->renameIndex('from', 'to')
```

<a name="dropping-indexes"></a>
### 인덱스 삭제하기

인덱스를 삭제할 때는, 인덱스 이름을 지정해주어야 합니다. 라라벨은 기본적으로 테이블명, 컬럼명, 인덱스 타입을 조합해 인덱스 이름을 자동으로 부여합니다. 몇 가지 예시는 아래와 같습니다.

<div class="overflow-auto">

| 명령어(Command)                                     | 설명                                                    |
| --------------------------------------------------- | ------------------------------------------------------- |
| `$table->dropPrimary('users_id_primary');`          | "users" 테이블의 기본 키를 삭제합니다.                   |
| `$table->dropUnique('users_email_unique');`         | "users" 테이블의 고유 인덱스를 삭제합니다.               |
| `$table->dropIndex('geo_state_index');`             | "geo" 테이블의 일반 인덱스를 삭제합니다.                 |
| `$table->dropFullText('posts_body_fulltext');`      | "posts" 테이블의 전문 검색 인덱스를 삭제합니다.           |
| `$table->dropSpatialIndex('geo_location_spatialindex');` | "geo" 테이블의 공간 인덱스를 삭제합니다 (SQLite 제외).   |

</div>

인덱스를 삭제하는 메서드에 컬럼명을 배열로 넘길 경우, 라라벨의 규칙에 따라 테이블명, 컬럼명, 인덱스 타입을 조합해 인덱스 이름이 자동 생성됩니다.

```
Schema::table('geo', function (Blueprint $table) {
    $table->dropIndex(['state']); // 'geo_state_index' 인덱스를 삭제
});
```

<a name="foreign-key-constraints"></a>
### 외래 키 제약조건(Foreign Key Constraints)

라라벨은 데이터베이스 레벨에서 참조 무결성을 강제하기 위한 외래 키 제약조건 생성도 지원합니다. 예를 들어, `posts` 테이블에 `user_id` 컬럼을 추가하고, 이 컬럼이 `users` 테이블의 `id` 컬럼을 참조하게 만들 수 있습니다.

```
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('posts', function (Blueprint $table) {
    $table->unsignedBigInteger('user_id');

    $table->foreign('user_id')->references('id')->on('users');
});
```

위와 같이 다소 장황해질 수 있기 때문에, 라라벨에서는 더 간결하게 작성할 수 있는 추가 메서드들도 제공합니다. `foreignId` 메서드를 사용하면, 위 예시를 다음과 같이 줄일 수 있습니다.

```
Schema::table('posts', function (Blueprint $table) {
    $table->foreignId('user_id')->constrained();
});
```

`foreignId` 메서드는 `UNSIGNED BIGINT`에 해당하는 컬럼을 만들며, `constrained` 메서드는 라라벨의 관례에 따라 참조할 테이블과 컬럼을 자동으로 결정합니다. 만약 테이블명이 라라벨의 규칙과 다르다면, `constrained` 메서드에 직접 지정할 수 있고, 생성할 인덱스 이름도 지정할 수 있습니다.

```
Schema::table('posts', function (Blueprint $table) {
    $table->foreignId('user_id')->constrained(
        table: 'users', indexName: 'posts_user_id'
    );
});
```

또한 외래 키 제약조건의 "on delete" 및 "on update" 동작을 원하는 대로 지정할 수도 있습니다.

```
$table->foreignId('user_id')
    ->constrained()
    ->onUpdate('cascade')
    ->onDelete('cascade');
```

동일한 동작을 더 명확하게 표현할 수 있는 대체 문법도 제공합니다.

<div class="overflow-auto">

| 메서드(Method)                     | 설명                                                        |
| ---------------------------------- | ----------------------------------------------------------- |
| `$table->cascadeOnUpdate();`       | 업데이트 시 연쇄(cascade) 동작을 적용합니다.                 |
| `$table->restrictOnUpdate();`      | 업데이트 시 제한(restrict) 동작을 적용합니다.                |
| `$table->nullOnUpdate();`          | 업데이트 시 외래 키 값을 null로 설정합니다.                   |
| `$table->noActionOnUpdate();`      | 업데이트 시 별도 동작을 하지 않습니다.                       |
| `$table->cascadeOnDelete();`       | 삭제 시 연쇄(cascade) 동작을 적용합니다.                     |
| `$table->restrictOnDelete();`      | 삭제 시 제한(restrict) 동작을 적용합니다.                    |
| `$table->nullOnDelete();`          | 삭제 시 외래 키 값을 null로 설정합니다.                       |
| `$table->noActionOnDelete();`      | 하위 레코드가 존재할 때 삭제를 방지합니다.                   |

</div>

추가적인 [컬럼 수정자](#column-modifiers)는 반드시 `constrained` 메서드 호출 전에 체이닝해야 합니다.

```
$table->foreignId('user_id')
    ->nullable()
    ->constrained();
```

<a name="dropping-foreign-keys"></a>
#### 외래 키 삭제하기

외래 키를 삭제하려면, `dropForeign` 메서드에 삭제할 외래 키 제약조건 이름을 전달하면 됩니다. 외래 키 제약조건 이름은 인덱스와 동일한 규칙(테이블명, 컬럼명, '_foreign' 접미사 조합)으로 생성됩니다.

```
$table->dropForeign('posts_user_id_foreign');
```

또는, 외래 키를 가진 컬럼명을 배열로 넘겨도 됩니다. 이 경우 라라벨의 규칙에 따라 외래 키 제약조건 이름이 자동 완성됩니다.

```
$table->dropForeign(['user_id']);
```

<a name="toggling-foreign-key-constraints"></a>
#### 외래 키 제약조건 활성화/비활성화

마이그레이션에서 다음과 같이 외래 키 제약조건을 활성화/비활성화할 수 있습니다.

```
Schema::enableForeignKeyConstraints();

Schema::disableForeignKeyConstraints();

Schema::withoutForeignKeyConstraints(function () {
    // 이 클로저 내부에서는 제약조건이 비활성화됩니다...
});
```

> [!WARNING]  
> SQLite에서는 기본적으로 외래 키 제약조건이 비활성화되어 있습니다. SQLite를 사용할 경우, 마이그레이션에서 외래 키를 생성/사용하기 전에 반드시 데이터베이스 설정에서 [외래 키 지원을 활성화](/docs/11.x/database#configuration)해야 합니다.

<a name="events"></a>
## 이벤트(Events)

편의를 위해, 각 마이그레이션 작업은 [이벤트](/docs/11.x/events)를 디스패치합니다. 아래의 모든 이벤트 클래스는 기본 클래스인 `Illuminate\Database\Events\MigrationEvent`를 상속합니다.

<div class="overflow-auto">

| 클래스(Class)                                   | 설명                                                     |
| ------------------------------------------------| -------------------------------------------------------- |
| `Illuminate\Database\Events\MigrationsStarted`  | 마이그레이션 배치가 곧 실행될 예정임을 알립니다.           |
| `Illuminate\Database\Events\MigrationsEnded`    | 마이그레이션 배치 실행이 완료되었음을 알립니다.            |
| `Illuminate\Database\Events\MigrationStarted`   | 개별 마이그레이션이 곧 실행될 예정임을 알립니다.           |
| `Illuminate\Database\Events\MigrationEnded`     | 개별 마이그레이션 실행이 완료되었음을 알립니다.            |
| `Illuminate\Database\Events\NoPendingMigrations`| 실행할 마이그레이션이 없는 명령어가 감지되었음을 알립니다.  |
| `Illuminate\Database\Events\SchemaDumped`       | 데이터베이스 스키마 덤프 작업이 완료되었음을 알립니다.     |
| `Illuminate\Database\Events\SchemaLoaded`       | 기존 데이터베이스 스키마 덤프가 로드되었음을 알립니다.      |

</div>