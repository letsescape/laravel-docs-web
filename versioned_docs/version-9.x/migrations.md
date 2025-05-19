# 데이터베이스: 마이그레이션 (Database: Migrations)

- [소개](#introduction)
- [마이그레이션 생성](#generating-migrations)
    - [마이그레이션 병합(Squashing)](#squashing-migrations)
- [마이그레이션 구조](#migration-structure)
- [마이그레이션 실행](#running-migrations)
    - [마이그레이션 롤백](#rolling-back-migrations)
- [테이블](#tables)
    - [테이블 생성](#creating-tables)
    - [테이블 수정](#updating-tables)
    - [테이블 이름 변경/삭제](#renaming-and-dropping-tables)
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
    - [외래 키 제약조건](#foreign-key-constraints)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

마이그레이션은 데이터베이스 버전 관리 시스템과 비슷하여, 팀원들이 애플리케이션의 데이터베이스 스키마를 정의하고 공유할 수 있게 해줍니다. 예를 들어, 소스 컨트롤에서 변경사항을 받은 후 동료에게 로컬 데이터베이스의 컬럼을 수동으로 추가하라고 안내한 적이 있다면, 그때 마이그레이션이 해결해 주는 문제를 경험한 것입니다.

라라벨의 `Schema` [파사드](/docs/9.x/facades)는 라라벨이 지원하는 모든 데이터베이스 시스템에서 데이터베이스에 독립적으로 테이블을 생성하고 조작할 수 있도록 지원합니다. 일반적으로 마이그레이션에서는 이 파사드를 사용하여 데이터베이스 테이블과 컬럼을 만들거나 수정하게 됩니다.

<a name="generating-migrations"></a>
## 마이그레이션 생성

데이터베이스 마이그레이션을 생성하려면 `make:migration` [Artisan 명령어](/docs/9.x/artisan)를 사용할 수 있습니다. 새로 생성된 마이그레이션 파일은 `database/migrations` 디렉토리에 저장됩니다. 각 마이그레이션 파일 이름에는 타임스탬프가 포함되어 있어, 라라벨이 마이그레이션의 실행 순서를 판단하는 데 사용됩니다.

```shell
php artisan make:migration create_flights_table
```

라라벨은 마이그레이션의 이름을 바탕으로, 어떤 테이블을 대상으로 하는지 그리고 새로운 테이블을 생성하려는 것인지 추측을 시도합니다. 만약 라라벨이 마이그레이션 이름에서 테이블명을 파악할 수 있다면, 해당 테이블로 미리 채워진 마이그레이션 파일이 생성됩니다. 그렇지 않은 경우, 마이그레이션 파일에서 직접 테이블명을 지정하면 됩니다.

마이그레이션을 생성할 때, 원하는 경로를 직접 지정하고 싶다면 `make:migration` 명령어 실행 시 `--path` 옵션을 사용할 수 있습니다. 지정하는 경로는 애플리케이션의 기본 경로를 기준으로 상대 경로여야 합니다.

> [!NOTE]
> 마이그레이션 스텁은 [스텁 퍼블리싱](/docs/9.x/artisan#stub-customization)을 통해 직접 커스터마이징 할 수 있습니다.

<a name="squashing-migrations"></a>
### 마이그레이션 병합(Squashing)

애플리케이션을 개발할수록 시간에 따라 점점 더 많은 마이그레이션 파일이 쌓일 수 있습니다. 이렇게 되면 `database/migrations` 디렉토리가 수백 개의 파일로 인해 너무 복잡해질 수 있습니다. 이럴 때는 여러 마이그레이션을 하나의 SQL 파일로 "병합(squash)"할 수 있습니다. 먼저, `schema:dump` 명령어를 실행해보세요.

```shell
php artisan schema:dump

# 현재 데이터베이스 스키마를 덤프하고 기존의 모든 마이그레이션 파일을 정리합니다...
php artisan schema:dump --prune
```

이 명령어를 실행하면, 라라벨이 애플리케이션의 `database/schema` 디렉토리에 "스키마" 파일을 생성합니다. 이 파일의 이름은 데이터베이스 커넥션과 매칭됩니다. 이제 데이터베이스에 아직 실행된 마이그레이션이 없을 때 마이그레이션을 시도하면, 라라벨은 먼저 사용하는 데이터베이스 커넥션에 맞는 스키마 파일의 SQL 구문을 실행합니다. 그리고 나서, 스키마 덤프에 포함되지 않은 나머지 마이그레이션을 차례로 실행합니다.

애플리케이션의 테스트가 로컬 개발에 사용하는 데이터베이스 커넥션과 다른 커넥션을 사용한다면, 해당 커넥션으로도 스키마 파일을 덤프해 테스트 환경에서도 데이터베이스를 올릴 수 있도록 해야 합니다. 이 경우, 로컬 개발용 커넥션의 스키마를 덤프한 후 아래와 같이 테스트용 커넥션도 추가로 덤프할 수 있습니다.

```shell
php artisan schema:dump
php artisan schema:dump --database=testing --prune
```

생성된 데이터베이스 스키마 파일은 반드시 소스 컨트롤에 커밋하여 팀의 다른 신규 개발자들도 빠르게 애플리케이션의 초기 데이터베이스 구조를 만들 수 있도록 해야 합니다.

> [!WARNING]
> 마이그레이션 병합(Squashing)은 MySQL, PostgreSQL, SQLite 데이터베이스에서만 사용할 수 있으며, 각 데이터베이스의 커맨드 라인 클라이언트를 활용합니다. 스키마 덤프 파일은 메모리 기반 SQLite 데이터베이스로는 복원할 수 없습니다.

<a name="migration-structure"></a>
## 마이그레이션 구조

마이그레이션 클래스에는 `up`과 `down` 두 가지 메서드가 들어 있습니다. `up` 메서드는 데이터베이스에 새 테이블, 컬럼, 인덱스를 추가할 때 사용하고, `down` 메서드는 `up` 메서드에서 실행한 작업을 되돌릴 때 사용합니다.

이 두 메서드 안에서는 라라벨의 스키마 빌더(schema builder)를 활용해 테이블을 간결하게 만들고 수정할 수 있습니다. `Schema` 빌더에서 사용할 수 있는 모든 메서드가 궁금하다면 [관련 문서](#creating-tables)를 참고하세요. 예를 들어, 다음 마이그레이션은 `flights` 테이블을 생성합니다.

```
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
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
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('flights');
    }
};
```

<a name="setting-the-migration-connection"></a>
#### 마이그레이션 연결설정

마이그레이션이 애플리케이션의 기본 데이터베이스 커넥션이 아닌 다른 커넥션을 대상으로 동작해야 한다면, 마이그레이션 클래스 내에 `$connection` 속성을 설정해야 합니다.

```
/**
 * The database connection that should be used by the migration.
 *
 * @var string
 */
protected $connection = 'pgsql';

/**
 * Run the migrations.
 *
 * @return void
 */
public function up()
{
    //
}
```

<a name="running-migrations"></a>
## 마이그레이션 실행

모든 미실행 마이그레이션을 실행하려면 `migrate` Artisan 명령어를 실행하세요.

```shell
php artisan migrate
```

지금까지 수행된 마이그레이션 목록을 확인하고 싶다면 `migrate:status` Artisan 명령어를 사용할 수 있습니다.

```shell
php artisan migrate:status
```

마이그레이션을 실제로 실행하지 않고 어떤 SQL문이 실행될지 미리 확인하려면, `migrate` 명령에 `--pretend` 플래그를 추가하세요.

```shell
php artisan migrate --pretend
```

#### 마이그레이션 실행 격리

여러 서버에 애플리케이션을 배포하면서 마이그레이션을 자동으로 실행하는 경우, 두 서버가 동시에 마이그레이션을 시도하지 않도록 하고 싶을 수 있습니다. 이럴 땐 `migrate` 명령 실행 시 `isolated` 옵션을 사용할 수 있습니다.

`isolated` 옵션을 전달하면, 라라벨은 마이그레이션 실행 전에 애플리케이션의 캐시 드라이버를 이용해서 원자적(atomic) 락을 획득합니다. 락이 걸린 동안 다른 마이그레이션 실행 시도는 실행되지 않지만, 명령은 정상 종료 상태로 마무리됩니다.

```shell
php artisan migrate --isolated
```

> [!WARNING]
> 이 기능을 사용하려면, 애플리케이션의 기본 캐시 드라이버가 `memcached`, `redis`, `dynamodb`, `database`, `file`, `array` 중 하나여야 합니다. 게다가, 모든 서버가 동일한 중앙 캐시 서버와 통신해야 합니다.

<a name="forcing-migrations-to-run-in-production"></a>
#### 운영 환경에서 마이그레이션 강제 실행

일부 마이그레이션 작업은 데이터 손실을 유발할 수 있으므로, 실수로 운영 데이터베이스에 실행하는 것을 방지하기 위해 명령이 수행되기 전에 확인을 요청합니다. 확인 없이 명령을 강제로 실행하려면 `--force` 플래그를 사용하세요.

```shell
php artisan migrate --force
```

<a name="rolling-back-migrations"></a>
### 마이그레이션 롤백

가장 최근에 수행한 마이그레이션 작업을 되돌리려면 `rollback` Artisan 명령어를 사용할 수 있습니다. 이 명령은 가장 마지막 "배치(batch)"의 마이그레이션을 롤백하는데, 한 번에 여러 파일을 포함할 수 있습니다.

```shell
php artisan migrate:rollback
```

`rollback` 명령에 `step` 옵션을 추가하면 되돌릴 마이그레이션 수를 제한할 수 있습니다. 예를 들어, 다음 명령은 최근 5개의 마이그레이션만 롤백합니다.

```shell
php artisan migrate:rollback --step=5
```

`migrate:reset` 명령은 애플리케이션의 모든 마이그레이션을 롤백합니다.

```shell
php artisan migrate:reset
```

<a name="roll-back-migrate-using-a-single-command"></a>
#### 한 번에 롤백 및 마이그레이트 실행

`migrate:refresh` 명령어는 모든 마이그레이션을 롤백한 뒤 다시 줄지어 마이그레이션을 실행합니다. 이 명령을 통해 애플리케이션의 전체 데이터베이스를 새로 구축할 수 있습니다.

```shell
php artisan migrate:refresh

# 데이터베이스를 리프레시하고 모든 시드를 실행합니다...
php artisan migrate:refresh --seed
```

`refresh` 명령에도 `step` 옵션을 추가하여, 최근 N개의 마이그레이션만 롤백 후 재실행할 수 있습니다. 예를 들어, 최근 5개의 마이그레이션만 롤백하고 다시 마이그레이트하려면 아래와 같이 실행하세요.

```shell
php artisan migrate:refresh --step=5
```

<a name="drop-all-tables-migrate"></a>
#### 모든 테이블 삭제 & 마이그레이션

`migrate:fresh` 명령어는 데이터베이스 내의 모든 테이블을 삭제하고, 그 후에 다시 마이그레이션을 실행합니다.

```shell
php artisan migrate:fresh

php artisan migrate:fresh --seed
```

> [!WARNING]
> `migrate:fresh` 명령은 테이블 프리픽스와 관계없이 데이터베이스의 모든 테이블을 삭제합니다. 여러 애플리케이션에서 공유하는 데이터베이스를 개발 환경에서 사용할 때는 주의하여 사용해야 합니다.

<a name="tables"></a>
## 테이블

<a name="creating-tables"></a>
### 테이블 생성

새 데이터베이스 테이블을 생성하려면 `Schema` 파사드에서 `create` 메서드를 사용하세요. `create` 메서드는 두 개의 인수를 받는데, 첫 번째는 테이블 이름이고, 두 번째는 새 테이블을 정의할 수 있도록 `Blueprint` 객체를 받는 클로저입니다.

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

테이블을 만들 때는, 스키마 빌더의 [컬럼 메서드](#creating-columns)를 자유롭게 사용해 테이블의 컬럼을 정의할 수 있습니다.

<a name="checking-for-table-column-existence"></a>
#### 테이블/컬럼 존재 여부 확인

테이블이나 컬럼이 존재하는지 확인하려면, `hasTable`과 `hasColumn` 메서드를 사용할 수 있습니다.

```
if (Schema::hasTable('users')) {
    // "users" 테이블이 존재합니다...
}

if (Schema::hasColumn('users', 'email')) {
    // "users" 테이블이 존재하고 "email" 컬럼이 있습니다...
}
```

<a name="database-connection-table-options"></a>
#### 데이터베이스 연결 및 테이블 옵션

기본 커넥션이 아닌 다른 데이터베이스 커넥션에 대해 스키마 작업을 하고 싶다면, `connection` 메서드를 사용하세요.

```
Schema::connection('sqlite')->create('users', function (Blueprint $table) {
    $table->id();
});
```

추가적으로, 테이블 생성 방식에 영향을 주는 몇 가지 속성과 메서드가 있습니다. MySQL을 사용할 때는 `engine` 속성으로 스토리지 엔진을 지정할 수 있습니다.

```
Schema::create('users', function (Blueprint $table) {
    $table->engine = 'InnoDB';

    // ...
});
```

MySQL에서 테이블의 문자셋과 콜레이션을 지정하려면, `charset`과 `collation` 속성을 사용할 수 있습니다.

```
Schema::create('users', function (Blueprint $table) {
    $table->charset = 'utf8mb4';
    $table->collation = 'utf8mb4_unicode_ci';

    // ...
});
```

테이블을 "임시 테이블"로 만들고 싶다면, `temporary` 메서드를 사용할 수 있습니다. 임시 테이블은 현재 커넥션의 세션에서만 보이고, 커넥션이 종료되면 자동으로 삭제됩니다.

```
Schema::create('calculations', function (Blueprint $table) {
    $table->temporary();

    // ...
});
```

테이블에 "주석(comment)"을 추가하고 싶다면, 테이블 인스턴스에서 `comment` 메서드를 호출하면 됩니다. 테이블 주석은 현재 MySQL과 Postgres에서만 지원됩니다.

```
Schema::create('calculations', function (Blueprint $table) {
    $table->comment('Business calculations');

    // ...
});
```

<a name="updating-tables"></a>
### 테이블 수정

기존 테이블을 수정하려면 `Schema` 파사드에서 `table` 메서드를 사용할 수 있습니다. 사용 방식은 `create` 메서드와 동일하며, 첫 번째 인수에는 테이블명을, 두 번째 인수로는 컬럼이나 인덱스를 수정할 수 있는 `Blueprint` 인스턴스를 받는 클로저를 전달합니다.

```
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('users', function (Blueprint $table) {
    $table->integer('votes');
});
```

<a name="renaming-and-dropping-tables"></a>
### 테이블 이름 변경/삭제

기존 데이터베이스 테이블의 이름을 변경하려면 `rename` 메서드를 사용하세요.

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
#### 외래 키가 있는 테이블의 이름 변경

테이블 이름을 변경하기 전에는, 해당 테이블의 외래 키 제약조건이 마이그레이션 파일에서 명시적으로 이름이 지정되어 있는지 반드시 확인해야 합니다. 만약 그렇지 않고 라라벨의 기본 관례(convention)대로 이름이 부여되었다면, 외래 키 제약조건 이름이 이전 테이블명을 그대로 참조하게 됩니다.

<a name="columns"></a>
## 컬럼

<a name="creating-columns"></a>
### 컬럼 생성

기존 테이블에 컬럼을 추가하려면 `Schema` 파사드의 `table` 메서드를 사용할 수 있습니다. 사용 방법은 `create` 메서드와 같으며, 첫 번째 인수에는 테이블 명, 두 번째 인수에는 컬럼을 추가할 수 있도록 `Illuminate\Database\Schema\Blueprint` 인스턴스를 받는 클로저를 전달합니다.

```
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('users', function (Blueprint $table) {
    $table->integer('votes');
});
```

<a name="available-column-types"></a>
### 사용 가능한 컬럼 타입

스키마 빌더의 Blueprint에서는 데이터베이스 테이블에 추가할 수 있는 다양한 컬럼 타입에 해당하는 메서드를 제공합니다. 다음 표에서 사용할 수 있는 메서드들을 확인할 수 있습니다.

<div class="collection-method-list" markdown="1">

[bigIncrements](#column-method-bigIncrements)
[bigInteger](#column-method-bigInteger)
[binary](#column-method-binary)
[boolean](#column-method-boolean)
[char](#column-method-char)
[dateTimeTz](#column-method-dateTimeTz)
[dateTime](#column-method-dateTime)
[date](#column-method-date)
[decimal](#column-method-decimal)
[double](#column-method-double)
[enum](#column-method-enum)
[float](#column-method-float)
[foreignId](#column-method-foreignId)
[foreignIdFor](#column-method-foreignIdFor)
[foreignUlid](#column-method-foreignUlid)
[foreignUuid](#column-method-foreignUuid)
[geometryCollection](#column-method-geometryCollection)
[geometry](#column-method-geometry)
[id](#column-method-id)
[increments](#column-method-increments)
[integer](#column-method-integer)
[ipAddress](#column-method-ipAddress)
[json](#column-method-json)
[jsonb](#column-method-jsonb)
[lineString](#column-method-lineString)
[longText](#column-method-longText)
[macAddress](#column-method-macAddress)
[mediumIncrements](#column-method-mediumIncrements)
[mediumInteger](#column-method-mediumInteger)
[mediumText](#column-method-mediumText)
[morphs](#column-method-morphs)
[multiLineString](#column-method-multiLineString)
[multiPoint](#column-method-multiPoint)
[multiPolygon](#column-method-multiPolygon)
[nullableMorphs](#column-method-nullableMorphs)
[nullableTimestamps](#column-method-nullableTimestamps)
[nullableUlidMorphs](#column-method-nullableUlidMorphs)
[nullableUuidMorphs](#column-method-nullableUuidMorphs)
[point](#column-method-point)
[polygon](#column-method-polygon)
[rememberToken](#column-method-rememberToken)
[set](#column-method-set)
[smallIncrements](#column-method-smallIncrements)
[smallInteger](#column-method-smallInteger)
[softDeletesTz](#column-method-softDeletesTz)
[softDeletes](#column-method-softDeletes)
[string](#column-method-string)
[text](#column-method-text)
[timeTz](#column-method-timeTz)
[time](#column-method-time)
[timestampTz](#column-method-timestampTz)
[timestamp](#column-method-timestamp)
[timestampsTz](#column-method-timestampsTz)
[timestamps](#column-method-timestamps)
[tinyIncrements](#column-method-tinyIncrements)
[tinyInteger](#column-method-tinyInteger)
[tinyText](#column-method-tinyText)
[unsignedBigInteger](#column-method-unsignedBigInteger)
[unsignedDecimal](#column-method-unsignedDecimal)
[unsignedInteger](#column-method-unsignedInteger)
[unsignedMediumInteger](#column-method-unsignedMediumInteger)
[unsignedSmallInteger](#column-method-unsignedSmallInteger)
[unsignedTinyInteger](#column-method-unsignedTinyInteger)
[ulidMorphs](#column-method-ulidMorphs)
[uuidMorphs](#column-method-uuidMorphs)
[ulid](#column-method-ulid)
[uuid](#column-method-uuid)
[year](#column-method-year)

</div>

<a name="column-method-bigIncrements"></a>
#### `bigIncrements()`

`bigIncrements` 메서드는 자동 증가 `UNSIGNED BIGINT`(기본키) 타입의 컬럼을 생성합니다.

```
$table->bigIncrements('id');
```

<a name="column-method-bigInteger"></a>
#### `bigInteger()`

`bigInteger` 메서드는 `BIGINT` 타입의 컬럼을 생성합니다.

```
$table->bigInteger('votes');
```

<a name="column-method-binary"></a>
#### `binary()`

`binary` 메서드는 `BLOB` 타입의 컬럼을 생성합니다.

```
$table->binary('photo');
```

<a name="column-method-boolean"></a>
#### `boolean()`

`boolean` 메서드는 `BOOLEAN` 타입의 컬럼을 생성합니다.

```
$table->boolean('confirmed');
```

<a name="column-method-char"></a>
#### `char()`

`char` 메서드는 지정된 길이의 `CHAR` 타입 컬럼을 생성합니다.

```
$table->char('name', 100);
```

<a name="column-method-dateTimeTz"></a>
#### `dateTimeTz()`

`dateTimeTz` 메서드는 선택적으로 정밀도를 지정할 수 있는(전체 자릿수) `DATETIME` (타임존 포함) 타입의 컬럼을 생성합니다.

```
$table->dateTimeTz('created_at', $precision = 0);
```

<a name="column-method-dateTime"></a>
#### `dateTime()`

`dateTime` 메서드는 선택적으로 정밀도를 지정할 수 있는(전체 자릿수) `DATETIME` 타입의 컬럼을 생성합니다.

```
$table->dateTime('created_at', $precision = 0);
```

<a name="column-method-date"></a>
#### `date()`

`date` 메서드는 `DATE` 타입의 컬럼을 생성합니다.

```
$table->date('created_at');
```

<a name="column-method-decimal"></a>
#### `decimal()`

`decimal` 메서드는 지정한 전체 자릿수(precision) 및 소수 자릿수(scale)로 이루어진 `DECIMAL` 타입의 컬럼을 생성합니다.

```
$table->decimal('amount', $precision = 8, $scale = 2);
```

<a name="column-method-double"></a>
#### `double()`

`double` 메서드는 지정한 전체 자릿수(precision) 및 소수 자릿수(scale)로 이루어진 `DOUBLE` 타입의 컬럼을 생성합니다.

```
$table->double('amount', 8, 2);
```

<a name="column-method-enum"></a>
#### `enum()`

`enum` 메서드는 지정한 유효값 배열로 `ENUM` 타입의 컬럼을 생성합니다.

```
$table->enum('difficulty', ['easy', 'hard']);
```

<a name="column-method-float"></a>

#### `float()`

`float` 메서드는 지정한 정밀도(총 자릿수)와 소수점 자릿수(스케일)을 가지는 `FLOAT` 컬럼을 생성합니다.

```
$table->float('amount', 8, 2);
```

<a name="column-method-foreignId"></a>
#### `foreignId()`

`foreignId` 메서드는 `UNSIGNED BIGINT`에 해당하는 컬럼을 생성합니다.

```
$table->foreignId('user_id');
```

<a name="column-method-foreignIdFor"></a>
#### `foreignIdFor()`

`foreignIdFor` 메서드는 지정한 모델 클래스에 대해 `{column}_id UNSIGNED BIGINT`에 해당하는 컬럼을 추가합니다.

```
$table->foreignIdFor(User::class);
```

<a name="column-method-foreignUlid"></a>
#### `foreignUlid()`

`foreignUlid` 메서드는 `ULID`에 해당하는 컬럼을 생성합니다.

```
$table->foreignUlid('user_id');
```

<a name="column-method-foreignUuid"></a>
#### `foreignUuid()`

`foreignUuid` 메서드는 `UUID`에 해당하는 컬럼을 생성합니다.

```
$table->foreignUuid('user_id');
```

<a name="column-method-geometryCollection"></a>
#### `geometryCollection()`

`geometryCollection` 메서드는 `GEOMETRYCOLLECTION`에 해당하는 컬럼을 생성합니다.

```
$table->geometryCollection('positions');
```

<a name="column-method-geometry"></a>
#### `geometry()`

`geometry` 메서드는 `GEOMETRY`에 해당하는 컬럼을 생성합니다.

```
$table->geometry('positions');
```

<a name="column-method-id"></a>
#### `id()`

`id` 메서드는 `bigIncrements` 메서드의 별칭입니다. 기본적으로 `id`라는 컬럼이 생성되지만, 컬럼 이름을 바꾸고 싶다면 다른 이름을 인수로 전달할 수 있습니다.

```
$table->id();
```

<a name="column-method-increments"></a>
#### `increments()`

`increments` 메서드는 자동 증가하는 `UNSIGNED INTEGER`(기본키) 컬럼을 생성합니다.

```
$table->increments('id');
```

<a name="column-method-integer"></a>
#### `integer()`

`integer` 메서드는 `INTEGER`에 해당하는 컬럼을 생성합니다.

```
$table->integer('votes');
```

<a name="column-method-ipAddress"></a>
#### `ipAddress()`

`ipAddress` 메서드는 `VARCHAR`에 해당하는 컬럼을 생성합니다.

```
$table->ipAddress('visitor');
```

<a name="column-method-json"></a>
#### `json()`

`json` 메서드는 `JSON`에 해당하는 컬럼을 생성합니다.

```
$table->json('options');
```

<a name="column-method-jsonb"></a>
#### `jsonb()`

`jsonb` 메서드는 `JSONB`에 해당하는 컬럼을 생성합니다.

```
$table->jsonb('options');
```

<a name="column-method-lineString"></a>
#### `lineString()`

`lineString` 메서드는 `LINESTRING`에 해당하는 컬럼을 생성합니다.

```
$table->lineString('positions');
```

<a name="column-method-longText"></a>
#### `longText()`

`longText` 메서드는 `LONGTEXT`에 해당하는 컬럼을 생성합니다.

```
$table->longText('description');
```

<a name="column-method-macAddress"></a>
#### `macAddress()`

`macAddress` 메서드는 MAC 주소를 저장할 컬럼을 생성합니다. PostgreSQL과 같은 일부 데이터베이스 시스템은 이 타입을 위한 전용 컬럼 타입을 제공하며, 다른 데이터베이스 시스템은 문자열 컬럼으로 대체합니다.

```
$table->macAddress('device');
```

<a name="column-method-mediumIncrements"></a>
#### `mediumIncrements()`

`mediumIncrements` 메서드는 자동 증가하는 `UNSIGNED MEDIUMINT`(기본키) 컬럼을 생성합니다.

```
$table->mediumIncrements('id');
```

<a name="column-method-mediumInteger"></a>
#### `mediumInteger()`

`mediumInteger` 메서드는 `MEDIUMINT`에 해당하는 컬럼을 생성합니다.

```
$table->mediumInteger('votes');
```

<a name="column-method-mediumText"></a>
#### `mediumText()`

`mediumText` 메서드는 `MEDIUMTEXT`에 해당하는 컬럼을 생성합니다.

```
$table->mediumText('description');
```

<a name="column-method-morphs"></a>
#### `morphs()`

`morphs` 메서드는 `{column}_id` `UNSIGNED BIGINT`에 해당하는 컬럼과 `{column}_type` `VARCHAR`에 해당하는 컬럼을 추가하는 편의 메서드입니다.

이 메서드는 다형성 [Eloquent 연관관계](/docs/9.x/eloquent-relationships)에 필요한 컬럼을 정의할 때 사용합니다. 아래 예시에서는 `taggable_id`와 `taggable_type` 컬럼이 생성됩니다.

```
$table->morphs('taggable');
```

<a name="column-method-multiLineString"></a>
#### `multiLineString()`

`multiLineString` 메서드는 `MULTILINESTRING`에 해당하는 컬럼을 생성합니다.

```
$table->multiLineString('positions');
```

<a name="column-method-multiPoint"></a>
#### `multiPoint()`

`multiPoint` 메서드는 `MULTIPOINT`에 해당하는 컬럼을 생성합니다.

```
$table->multiPoint('positions');
```

<a name="column-method-multiPolygon"></a>
#### `multiPolygon()`

`multiPolygon` 메서드는 `MULTIPOLYGON`에 해당하는 컬럼을 생성합니다.

```
$table->multiPolygon('positions');
```

<a name="column-method-nullableTimestamps"></a>
#### `nullableTimestamps()`

`nullableTimestamps` 메서드는 [timestamps](#column-method-timestamps) 메서드의 별칭입니다.

```
$table->nullableTimestamps(0);
```

<a name="column-method-nullableMorphs"></a>
#### `nullableMorphs()`

이 메서드는 [morphs](#column-method-morphs) 메서드와 유사하나, 생성되는 컬럼들이 "nullable" 처리됩니다.

```
$table->nullableMorphs('taggable');
```

<a name="column-method-nullableUlidMorphs"></a>
#### `nullableUlidMorphs()`

이 메서드는 [ulidMorphs](#column-method-ulidMorphs) 메서드와 유사하나, 생성되는 컬럼들이 "nullable" 처리됩니다.

```
$table->nullableUlidMorphs('taggable');
```

<a name="column-method-nullableUuidMorphs"></a>
#### `nullableUuidMorphs()`

이 메서드는 [uuidMorphs](#column-method-uuidMorphs) 메서드와 유사하나, 생성되는 컬럼들이 "nullable" 처리됩니다.

```
$table->nullableUuidMorphs('taggable');
```

<a name="column-method-point"></a>
#### `point()`

`point` 메서드는 `POINT`에 해당하는 컬럼을 생성합니다.

```
$table->point('position');
```

<a name="column-method-polygon"></a>
#### `polygon()`

`polygon` 메서드는 `POLYGON`에 해당하는 컬럼을 생성합니다.

```
$table->polygon('position');
```

<a name="column-method-rememberToken"></a>
#### `rememberToken()`

`rememberToken` 메서드는 현재 "remember me" [인증 토큰](/docs/9.x/authentication#remembering-users)을 저장하기 위한 nullable `VARCHAR(100)` 컬럼을 생성합니다.

```
$table->rememberToken();
```

<a name="column-method-set"></a>
#### `set()`

`set` 메서드는 지정한 값 목록으로 `SET` 타입의 컬럼을 생성합니다.

```
$table->set('flavors', ['strawberry', 'vanilla']);
```

<a name="column-method-smallIncrements"></a>
#### `smallIncrements()`

`smallIncrements` 메서드는 자동 증가하는 `UNSIGNED SMALLINT`(기본키) 컬럼을 생성합니다.

```
$table->smallIncrements('id');
```

<a name="column-method-smallInteger"></a>
#### `smallInteger()`

`smallInteger` 메서드는 `SMALLINT`에 해당하는 컬럼을 생성합니다.

```
$table->smallInteger('votes');
```

<a name="column-method-softDeletesTz"></a>
#### `softDeletesTz()`

`softDeletesTz` 메서드는 nullable `deleted_at` `TIMESTAMP`(타임존 포함) 컬럼을 추가하며, 선택적으로 정밀도(총 자릿수)를 지정할 수 있습니다. 이 컬럼은 Eloquent의 "소프트 삭제" 기능에서 필요한 `deleted_at` 타임스탬프를 저장하는 데 사용됩니다.

```
$table->softDeletesTz($column = 'deleted_at', $precision = 0);
```

<a name="column-method-softDeletes"></a>
#### `softDeletes()`

`softDeletes` 메서드는 nullable `deleted_at` `TIMESTAMP` 컬럼을 추가하며, 선택적으로 정밀도(총 자릿수)를 지정할 수 있습니다. 이 컬럼은 Eloquent의 "소프트 삭제" 기능에서 필요한 `deleted_at` 타임스탬프를 저장하는 데 사용됩니다.

```
$table->softDeletes($column = 'deleted_at', $precision = 0);
```

<a name="column-method-string"></a>
#### `string()`

`string` 메서드는 지정한 길이의 `VARCHAR` 컬럼을 생성합니다.

```
$table->string('name', 100);
```

<a name="column-method-text"></a>
#### `text()`

`text` 메서드는 `TEXT`에 해당하는 컬럼을 생성합니다.

```
$table->text('description');
```

<a name="column-method-timeTz"></a>
#### `timeTz()`

`timeTz` 메서드는 타임존을 포함한 `TIME` 컬럼을 생성하며, 선택적으로 정밀도(총 자릿수)를 지정할 수 있습니다.

```
$table->timeTz('sunrise', $precision = 0);
```

<a name="column-method-time"></a>
#### `time()`

`time` 메서드는 정밀도(총 자릿수)를 선택적으로 지정할 수 있는 `TIME` 컬럼을 생성합니다.

```
$table->time('sunrise', $precision = 0);
```

<a name="column-method-timestampTz"></a>
#### `timestampTz()`

`timestampTz` 메서드는 타임존을 포함한 `TIMESTAMP` 컬럼을 생성하며, 선택적으로 정밀도(총 자릿수)를 지정할 수 있습니다.

```
$table->timestampTz('added_at', $precision = 0);
```

<a name="column-method-timestamp"></a>
#### `timestamp()`

`timestamp` 메서드는 선택적으로 정밀도(총 자릿수)를 지정할 수 있는 `TIMESTAMP` 컬럼을 생성합니다.

```
$table->timestamp('added_at', $precision = 0);
```

<a name="column-method-timestampsTz"></a>
#### `timestampsTz()`

`timestampsTz` 메서드는 `created_at`과 `updated_at` 타임존이 포함된 `TIMESTAMP` 컬럼을 각각 생성하며, 선택적으로 정밀도(총 자릿수)를 지정할 수 있습니다.

```
$table->timestampsTz($precision = 0);
```

<a name="column-method-timestamps"></a>
#### `timestamps()`

`timestamps` 메서드는 `created_at`과 `updated_at`에 해당하는 `TIMESTAMP` 컬럼을 각각 생성하며, 선택적으로 정밀도(총 자릿수)를 지정할 수 있습니다.

```
$table->timestamps($precision = 0);
```

<a name="column-method-tinyIncrements"></a>
#### `tinyIncrements()`

`tinyIncrements` 메서드는 자동 증가하는 `UNSIGNED TINYINT`(기본키) 컬럼을 생성합니다.

```
$table->tinyIncrements('id');
```

<a name="column-method-tinyInteger"></a>
#### `tinyInteger()`

`tinyInteger` 메서드는 `TINYINT`에 해당하는 컬럼을 생성합니다.

```
$table->tinyInteger('votes');
```

<a name="column-method-tinyText"></a>
#### `tinyText()`

`tinyText` 메서드는 `TINYTEXT`에 해당하는 컬럼을 생성합니다.

```
$table->tinyText('notes');
```

<a name="column-method-unsignedBigInteger"></a>
#### `unsignedBigInteger()`

`unsignedBigInteger` 메서드는 `UNSIGNED BIGINT`에 해당하는 컬럼을 생성합니다.

```
$table->unsignedBigInteger('votes');
```

<a name="column-method-unsignedDecimal"></a>
#### `unsignedDecimal()`

`unsignedDecimal` 메서드는 선택적으로 정밀도(총 자릿수)와 소수점 자릿수(스케일)를 지정할 수 있는 `UNSIGNED DECIMAL` 컬럼을 생성합니다.

```
$table->unsignedDecimal('amount', $precision = 8, $scale = 2);
```

<a name="column-method-unsignedInteger"></a>
#### `unsignedInteger()`

`unsignedInteger` 메서드는 `UNSIGNED INTEGER`에 해당하는 컬럼을 생성합니다.

```
$table->unsignedInteger('votes');
```

<a name="column-method-unsignedMediumInteger"></a>
#### `unsignedMediumInteger()`

`unsignedMediumInteger` 메서드는 `UNSIGNED MEDIUMINT`에 해당하는 컬럼을 생성합니다.

```
$table->unsignedMediumInteger('votes');
```

<a name="column-method-unsignedSmallInteger"></a>
#### `unsignedSmallInteger()`

`unsignedSmallInteger` 메서드는 `UNSIGNED SMALLINT`에 해당하는 컬럼을 생성합니다.

```
$table->unsignedSmallInteger('votes');
```

<a name="column-method-unsignedTinyInteger"></a>
#### `unsignedTinyInteger()`

`unsignedTinyInteger` 메서드는 `UNSIGNED TINYINT`에 해당하는 컬럼을 생성합니다.

```
$table->unsignedTinyInteger('votes');
```

<a name="column-method-ulidMorphs"></a>
#### `ulidMorphs()`

`ulidMorphs` 메서드는 `{column}_id` `CHAR(26)` 컬럼과 `{column}_type` `VARCHAR` 컬럼을 추가하는 편의 메서드입니다.

이 메서드는 ULID 식별자를 사용하는 다형성 [Eloquent 연관관계](/docs/9.x/eloquent-relationships)에 필요한 컬럼을 정의할 때 사용합니다. 아래 예시에서는 `taggable_id`와 `taggable_type` 컬럼이 생성됩니다.

```
$table->ulidMorphs('taggable');
```

<a name="column-method-uuidMorphs"></a>
#### `uuidMorphs()`

`uuidMorphs` 메서드는 `{column}_id` `CHAR(36)` 컬럼과 `{column}_type` `VARCHAR` 컬럼을 추가하는 편의 메서드입니다.

이 메서드는 UUID 식별자를 사용하는 다형성 [Eloquent 연관관계](/docs/9.x/eloquent-relationships)에 필요한 컬럼을 정의할 때 사용합니다. 아래 예시에서는 `taggable_id`와 `taggable_type` 컬럼이 생성됩니다.

```
$table->uuidMorphs('taggable');
```

<a name="column-method-ulid"></a>
#### `ulid()`

`ulid` 메서드는 `ULID`에 해당하는 컬럼을 생성합니다.

```
$table->ulid('id');
```

<a name="column-method-uuid"></a>
#### `uuid()`

`uuid` 메서드는 `UUID`에 해당하는 컬럼을 생성합니다.

```
$table->uuid('id');
```

<a name="column-method-year"></a>
#### `year()`

`year` 메서드는 `YEAR`에 해당하는 컬럼을 생성합니다.

```
$table->year('birth_year');
```

<a name="column-modifiers"></a>
### 컬럼 수정자(Column Modifiers)

위의 컬럼 타입 외에도, 데이터베이스 테이블에 컬럼을 추가할 때 사용할 수 있는 다양한 컬럼 "수정자"가 있습니다. 예를 들어, 컬럼을 "널 허용"으로 지정하고 싶을 때는 `nullable` 메서드를 사용할 수 있습니다.

```
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('users', function (Blueprint $table) {
    $table->string('email')->nullable();
});
```

아래 표는 사용 가능한 모든 컬럼 수정자를 정리한 것입니다. 이 목록에는 [인덱스 수정자](#creating-indexes)는 포함되지 않습니다.

수정자     |  설명
--------  |  -----------------------------------
`->after('column')`  |  다른 컬럼 "뒤"에 이 컬럼을 배치합니다 (MySQL).
`->autoIncrement()`  |  INTEGER 컬럼을 자동 증가(기본키)로 설정합니다.
`->charset('utf8mb4')`  |  이 컬럼의 문자셋을 지정합니다 (MySQL).
`->collation('utf8mb4_unicode_ci')`  |  이 컬럼의 정렬(collation)을 지정합니다 (MySQL/PostgreSQL/SQL Server).
`->comment('my comment')`  |  컬럼에 주석을 추가합니다 (MySQL/PostgreSQL).
`->default($value)`  |  이 컬럼의 "기본값"을 지정합니다.
`->first()`  |  테이블에서 해당 컬럼을 "첫 번째" 위치에 배치합니다 (MySQL).
`->from($integer)`  |  자동 증가 필드의 시작 값을 지정합니다 (MySQL / PostgreSQL).
`->invisible()`  |  이 컬럼을 `SELECT *` 쿼리에서 "숨김" 처리합니다 (MySQL).
`->nullable($value = true)`  |  컬럼 값에 NULL을 허용하도록 설정합니다.
`->storedAs($expression)`  |  생성 컬럼을 저장형(stored)으로 만듭니다 (MySQL / PostgreSQL).
`->unsigned()`  |  INTEGER 컬럼을 UNSIGNED로 설정합니다 (MySQL).
`->useCurrent()`  |  TIMESTAMP 컬럼의 기본값을 CURRENT_TIMESTAMP로 지정합니다.
`->useCurrentOnUpdate()`  |  레코드가 수정될 때 TIMESTAMP 컬럼의 값을 CURRENT_TIMESTAMP로 갱신합니다.
`->virtualAs($expression)`  |  생성 컬럼을 가상형(virtual)으로 만듭니다 (MySQL / PostgreSQL / SQLite).
`->generatedAs($expression)`  |  지정한 시퀀스 옵션으로 ID 컬럼을 생성합니다 (PostgreSQL).
`->always()`  |  ID 컬럼에 대해 시퀀스 값이 입력값보다 우선하도록 지정합니다 (PostgreSQL).
`->isGeometry()`  |  공간 컬럼 타입을 `geometry`로 지정합니다(기본값은 `geography`) (PostgreSQL).

<a name="default-expressions"></a>
#### 기본값 표현식(Default Expressions)

`default` 수정자는 값 또는 `Illuminate\Database\Query\Expression` 인스턴스를 받을 수 있습니다. `Expression` 인스턴스를 사용할 경우, Laravel은 해당 값을 따옴표로 감싸지 않고 데이터베이스 고유의 함수를 사용할 수 있도록 처리합니다. 이 방식은 특히 JSON 컬럼에 기본값을 할당해야 할 때 유용합니다.

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
     *
     * @return void
     */
    public function up()
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
> 기본값 표현식 지원 여부는 사용 중인 데이터베이스 드라이버, 데이터베이스 버전, 그리고 필드 타입에 따라 다릅니다. 자세한 내용은 각 데이터베이스의 공식 문서를 참고하시기 바랍니다. 또한, 원시 `default` 표현식(`DB::raw` 사용)을 컬럼 변경과 동시에 `change` 메서드로 조합하는 것은 불가능합니다.

<a name="column-order"></a>

#### 컬럼 순서 지정

MySQL 데이터베이스를 사용할 때는 `after` 메서드를 이용하여 기존 컬럼 뒤에 새 컬럼을 추가할 수 있습니다.

```
$table->after('password', function ($table) {
    $table->string('address_line1');
    $table->string('address_line2');
    $table->string('city');
});
```

<a name="modifying-columns"></a>
### 컬럼 수정

<a name="prerequisites"></a>
#### 사전 준비 사항

컬럼을 수정하기 전에 Composer 패키지 매니저를 사용하여 `doctrine/dbal` 패키지를 설치해야 합니다. Doctrine DBAL 라이브러리는 컬럼의 현재 상태를 파악하고, 요청한 변경을 적용하기 위한 SQL 쿼리를 생성하는 데 사용됩니다.

```
composer require doctrine/dbal
```

`timestamp` 메서드를 사용해 생성한 컬럼을 수정할 계획이 있다면, 애플리케이션의 `config/database.php` 설정 파일에 다음 구성을 추가해야 합니다.

```php
use Illuminate\Database\DBAL\TimestampType;

'dbal' => [
    'types' => [
        'timestamp' => TimestampType::class,
    ],
],
```

> [!WARNING]
> 애플리케이션에서 Microsoft SQL Server를 사용하는 경우에는 반드시 `doctrine/dbal:^3.0`을 설치해야 합니다.

<a name="updating-column-attributes"></a>
#### 컬럼 속성 업데이트

`change` 메서드를 사용하면 기존 컬럼의 타입과 속성을 변경할 수 있습니다. 예를 들어, `string` 컬럼의 길이를 늘리고 싶을 수 있습니다. 아래 예제와 같이 `name` 컬럼의 크기를 25에서 50으로 늘리겠습니다. 이를 위해서는 컬럼의 새 상태를 정의한 뒤, `change` 메서드를 호출하면 됩니다.

```
Schema::table('users', function (Blueprint $table) {
    $table->string('name', 50)->change();
});
```

또한, 컬럼을 nullable로 변경할 수도 있습니다.

```
Schema::table('users', function (Blueprint $table) {
    $table->string('name', 50)->nullable()->change();
});
```

> [!WARNING]
> 아래와 같은 컬럼 타입만 변경이 가능합니다: `bigInteger`, `binary`, `boolean`, `char`, `date`, `dateTime`, `dateTimeTz`, `decimal`, `double`, `integer`, `json`, `longText`, `mediumText`, `smallInteger`, `string`, `text`, `time`, `tinyText`, `unsignedBigInteger`, `unsignedInteger`, `unsignedSmallInteger`, `uuid`. `timestamp` 타입 컬럼은 [Doctrine 타입 등록](#prerequisites)이 필요합니다.

<a name="renaming-columns"></a>
### 컬럼 이름 변경

컬럼의 이름을 바꾸려면 스키마 빌더의 `renameColumn` 메서드를 사용할 수 있습니다.

```
Schema::table('users', function (Blueprint $table) {
    $table->renameColumn('from', 'to');
});
```

<a name="renaming-columns-on-legacy-databases"></a>
#### 구버전 데이터베이스에서의 컬럼 이름 변경

아래 버전보다 오래된 데이터베이스를 사용하고 있다면, 컬럼 이름을 변경하기 전에 반드시 Composer 패키지 매니저를 통해 `doctrine/dbal` 라이브러리를 설치해야 합니다.

<div class="content-list" markdown="1">

- MySQL < `8.0.3`
- MariaDB < `10.5.2`
- SQLite < `3.25.0`

</div>

<a name="dropping-columns"></a>
### 컬럼 삭제

컬럼을 삭제하려면, 스키마 빌더의 `dropColumn` 메서드를 사용하면 됩니다.

```
Schema::table('users', function (Blueprint $table) {
    $table->dropColumn('votes');
});
```

`dropColumn` 메서드에 컬럼명 배열을 인자로 전달하여 테이블에서 여러 컬럼을 한 번에 삭제할 수도 있습니다.

```
Schema::table('users', function (Blueprint $table) {
    $table->dropColumn(['votes', 'avatar', 'location']);
});
```

<a name="dropping-columns-on-legacy-databases"></a>
#### 구버전 데이터베이스에서의 컬럼 삭제

SQLite 3.35.0 버전 이전을 사용하고 있는 경우, `dropColumn` 메서드를 사용하기 전에 Composer 패키지 매니저로 `doctrine/dbal` 패키지를 반드시 설치해야 합니다. 또한, 이 패키지 사용 시 하나의 마이그레이션에서 여러 컬럼을 삭제하거나 수정하는 것은 지원되지 않습니다.

<a name="available-command-aliases"></a>
#### 지원되는 명령어 별칭

라라벨에서는 자주 사용되는 타입의 컬럼을 삭제할 때 쓸 수 있는 여러 편리한 별칭 메서드를 제공합니다. 각 메서드는 아래 표와 같습니다.

명령어  |  설명
-------  |  -----------
`$table->dropMorphs('morphable');`  |  `morphable_id`와 `morphable_type` 컬럼을 삭제합니다.
`$table->dropRememberToken();`  |  `remember_token` 컬럼을 삭제합니다.
`$table->dropSoftDeletes();`  |  `deleted_at` 컬럼을 삭제합니다.
`$table->dropSoftDeletesTz();`  |  `dropSoftDeletes()` 메서드의 별칭입니다.
`$table->dropTimestamps();`  |  `created_at`와 `updated_at` 컬럼을 삭제합니다.
`$table->dropTimestampsTz();` |  `dropTimestamps()` 메서드의 별칭입니다.

<a name="indexes"></a>
## 인덱스

<a name="creating-indexes"></a>
### 인덱스 생성

라라벨의 스키마 빌더는 여러 종류의 인덱스를 지원합니다. 아래 예제에서는 새 `email` 컬럼을 만들고, 해당 컬럼 값이 유일하도록 지정합니다. 인덱스를 생성하려면, 컬럼 정의에 `unique` 메서드를 체이닝하면 됩니다.

```
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('users', function (Blueprint $table) {
    $table->string('email')->unique();
});
```

또는, 컬럼을 정의한 후에 인덱스를 따로 생성할 수 있습니다. 이때는 스키마 빌더 Blueprint에서 `unique` 메서드를 호출하며, 인덱스를 생성할 컬럼의 이름을 전달합니다.

```
$table->unique('email');
```

복수 컬럼에 대해 복합(혹은 조합) 인덱스를 만들 때는, 인덱스 메서드에 컬럼명 배열을 전달하면 됩니다.

```
$table->index(['account_id', 'created_at']);
```

인덱스를 생성할 때 라라벨은 기본적으로 테이블명, 컬럼명, 인덱스 타입을 기반으로 인덱스 이름을 자동 생성합니다. 직접 인덱스 이름을 지정하고 싶다면, 메서드의 두 번째 인자로 이름을 전달할 수 있습니다.

```
$table->unique('email', 'unique_email');
```

<a name="available-index-types"></a>
#### 지원되는 인덱스 타입

라라벨의 스키마 빌더 Blueprint 클래스에서는 라라벨에서 지원하는 각 인덱스 타입별로 메서드를 제공합니다. 각 인덱스 메서드는 두 번째 인자로 인덱스 이름을 지정할 수 있으며, 생략하면 기본적으로 테이블명, 컬럼명, 인덱스 타입을 조합하여 이름이 만들어집니다. 아래 표는 지원되는 인덱스 메서드입니다.

명령어  |  설명
-------  |  -----------
`$table->primary('id');`  |  기본키(primary key)를 추가합니다.
`$table->primary(['id', 'parent_id']);`  |  복합 키(composite key)를 추가합니다.
`$table->unique('email');`  |  유니크 인덱스를 추가합니다.
`$table->index('state');`  |  일반 인덱스를 추가합니다.
`$table->fullText('body');`  |  전문(Full text) 인덱스를 추가합니다 (MySQL/PostgreSQL).
`$table->fullText('body')->language('english');`  |  특정 언어로 전문 인덱스를 추가합니다 (PostgreSQL).
`$table->spatialIndex('location');`  |  공간(Spatial) 인덱스를 추가합니다 (SQLite 제외).

<a name="index-lengths-mysql-mariadb"></a>
#### 인덱스 길이 & MySQL / MariaDB

기본적으로 라라벨은 `utf8mb4` 문자셋을 사용합니다. 만약 MySQL 5.7.7 미만이나 MariaDB 10.2.2 미만 버전을 사용한다면, 인덱스 생성을 위해 마이그레이션에서 생성되는 기본 문자열 길이를 수동으로 지정해야 할 수 있습니다. 이때는 `App\Providers\AppServiceProvider`의 `boot` 메서드 내에서 `Schema::defaultStringLength` 메서드를 호출하여 기본 문자열 길이를 지정할 수 있습니다.

```
use Illuminate\Support\Facades\Schema;

/**
 * Bootstrap any application services.
 *
 * @return void
 */
public function boot()
{
    Schema::defaultStringLength(191);
}
```

또는, 데이터베이스의 `innodb_large_prefix` 옵션을 활성화해도 됩니다. 관련 설정은 사용 중인 데이터베이스의 공식 문서를 참고해 주세요.

<a name="renaming-indexes"></a>
### 인덱스 이름 변경

인덱스의 이름을 변경하려면 스키마 빌더 Blueprint에서 제공하는 `renameIndex` 메서드를 사용할 수 있습니다. 첫 번째 인수로 현재 인덱스 이름, 두 번째 인수로 변경할 이름을 전달합니다.

```
$table->renameIndex('from', 'to')
```

> [!WARNING]
> SQLite 데이터베이스를 사용할 경우, `renameIndex` 메서드를 사용하기 전에 Composer 패키지 매니저로 `doctrine/dbal` 패키지를 반드시 설치해야 합니다.

<a name="dropping-indexes"></a>
### 인덱스 삭제

인덱스를 삭제하려면 삭제할 인덱스의 이름을 지정해야 합니다. 기본적으로 라라벨은 테이블명, 컬럼명, 인덱스 타입을 조합해 인덱스 이름을 자동 부여합니다. 다음은 몇 가지 예시입니다.

명령어  |  설명
-------  |  -----------
`$table->dropPrimary('users_id_primary');`  |  "users" 테이블에서 기본키를 삭제합니다.
`$table->dropUnique('users_email_unique');`  |  "users" 테이블에서 유니크 인덱스를 삭제합니다.
`$table->dropIndex('geo_state_index');`  |  "geo" 테이블에서 일반 인덱스를 삭제합니다.
`$table->dropFullText('posts_body_fulltext');`  |  "posts" 테이블에서 전문 인덱스를 삭제합니다.
`$table->dropSpatialIndex('geo_location_spatialindex');`  |  "geo" 테이블에서 공간 인덱스를 삭제합니다 (SQLite 제외).

여러 컬럼을 인자로 전달해 인덱스를 삭제할 경우, 일반 인덱스 이름 생성 규칙에 따라 이름이 자동 조합되어 삭제됩니다.

```
Schema::table('geo', function (Blueprint $table) {
    $table->dropIndex(['state']); // 'geo_state_index' 인덱스를 삭제
});
```

<a name="foreign-key-constraints"></a>
### 외래 키(FOREIGN KEY) 제약 조건

라라벨은 데이터베이스 레벨에서 참조 무결성을 보장하는 외래 키 제약 조건 생성도 지원합니다. 예를 들어, `posts` 테이블에 `users` 테이블의 `id` 컬럼을 참조하는 `user_id` 컬럼을 추가하려면 다음과 같이 작성합니다.

```
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('posts', function (Blueprint $table) {
    $table->unsignedBigInteger('user_id');

    $table->foreign('user_id')->references('id')->on('users');
});
```

이 문법이 다소 장황할 수 있어, 라라벨은 더 짧고 관습적인 방법을 제공합니다. `foreignId` 메서드를 사용하면 위 코드를 아래와 같이 간결하게 만들 수 있습니다.

```
Schema::table('posts', function (Blueprint $table) {
    $table->foreignId('user_id')->constrained();
});
```

`foreignId` 메서드는 `UNSIGNED BIGINT` 타입과 동일한 컬럼을 생성하며, `constrained` 메서드는 관습에 따라 참조할 테이블과 컬럼 이름을 자동으로 결정합니다. 테이블 이름이 라라벨의 관습과 다르다면, `constrained` 메서드에 참조할 테이블명을 인자로 전달할 수 있습니다.

```
Schema::table('posts', function (Blueprint $table) {
    $table->foreignId('user_id')->constrained('users');
});
```

또한, 외래 키의 "on delete"와 "on update" 속성에 원하는 동작을 지정할 수도 있습니다.

```
$table->foreignId('user_id')
      ->constrained()
      ->onUpdate('cascade')
      ->onDelete('cascade');
```

이 동작을 위한 좀 더 표현적인 메서드들도 제공됩니다.

메서드  |  설명
-------  |  -----------
`$table->cascadeOnUpdate();` | 업데이트 시 참조 행도 함께 변경됩니다.
`$table->restrictOnUpdate();`| 업데이트가 제한됩니다.
`$table->cascadeOnDelete();` | 삭제 시 참조 행도 함께 삭제됩니다.
`$table->restrictOnDelete();`| 삭제가 제한됩니다.
`$table->nullOnDelete();`    | 삭제 시 외래 키 값을 null로 설정합니다.

[컬럼 수정자](#column-modifiers)와 관련된 추가 메서드는 반드시 `constrained` 메서드 이전에 호출해야 합니다.

```
$table->foreignId('user_id')
      ->nullable()
      ->constrained();
```

<a name="dropping-foreign-keys"></a>
#### 외래 키 삭제

외래 키를 삭제할 때는 `dropForeign` 메서드를 사용하며, 삭제할 외래 키 제약 조건의 이름을 인자로 전달합니다. 외래 키 제약 조건의 이름은 인덱스의 명명 규칙과 동일하게, 테이블 이름과 컬럼명, 마지막에 "\_foreign"이 붙는 방식입니다.

```
$table->dropForeign('posts_user_id_foreign');
```

또 다른 방법으로, 외래 키가 걸려 있는 컬럼명을 배열로 `dropForeign`에 전달해도 됩니다. 배열은 라라벨의 제약 조건 네이밍 규칙에 따라 외래 키 제약 조건 이름으로 변환됩니다.

```
$table->dropForeign(['user_id']);
```

<a name="toggling-foreign-key-constraints"></a>
#### 외래 키 제약 조건 활성화/비활성화

마이그레이션 내에서 아래 메서드를 사용해 외래 키 제약 조건을 활성화하거나 비활성화할 수 있습니다.

```
Schema::enableForeignKeyConstraints();

Schema::disableForeignKeyConstraints();

Schema::withoutForeignKeyConstraints(function () {
    // 이 클로저 내부에서는 외래 키 제약 조건이 비활성화됩니다...
});
```

> [!WARNING]
> SQLite는 기본적으로 외래 키 제약 조건이 비활성화되어 있습니다. SQLite를 사용할 때는 마이그레이션에서 외래 키를 생성하기 전 데이터베이스 설정에서 [외래 키 지원을 활성화](/docs/9.x/database#configuration)해야 합니다. 또한, SQLite는 테이블 생성시에만 외래 키를 지원하며 [테이블이 변경될 때 외래 키 제약 조건을 지원하지 않습니다](https://www.sqlite.org/omitted.html).

<a name="events"></a>
## 이벤트

편의를 위해 각 마이그레이션 동작은 [이벤트](/docs/9.x/events)를 발생시킵니다. 다음 모든 이벤트는 기본 `Illuminate\Database\Events\MigrationEvent` 클래스를 확장합니다.

 클래스 | 설명
-------|-------
| `Illuminate\Database\Events\MigrationsStarted` | 마이그레이션 일괄 작업이 곧 실행될 예정입니다. |
| `Illuminate\Database\Events\MigrationsEnded` | 마이그레이션 일괄 작업이 실행을 마쳤습니다. |
| `Illuminate\Database\Events\MigrationStarted` | 단일 마이그레이션이 곧 실행될 예정입니다. |
| `Illuminate\Database\Events\MigrationEnded` | 단일 마이그레이션이 실행을 마쳤습니다. |
| `Illuminate\Database\Events\SchemaDumped` | 데이터베이스 스키마 덤프가 완료되었습니다. |
| `Illuminate\Database\Events\SchemaLoaded` | 기존 데이터베이스 스키마 덤프를 로드했습니다. |