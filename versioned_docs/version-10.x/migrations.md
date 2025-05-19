# 데이터베이스: 마이그레이션 (Database: Migrations)

- [소개](#introduction)
- [마이그레이션 생성](#generating-migrations)
    - [마이그레이션 스쿼싱](#squashing-migrations)
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
    - [외래 키 제약](#foreign-key-constraints)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

마이그레이션은 데이터베이스의 버전 관리를 가능하게 해주며, 팀원들이 애플리케이션의 데이터베이스 스키마 정의를 명확히 공유하도록 도와줍니다. 만약 여러분이 소스 컨트롤에서 변경 사항을 받은 동료에게 "데이터베이스에 컬럼을 직접 추가해 주세요"라고 안내했던 경험이 있다면, 바로 그 문제를 마이그레이션으로 해결할 수 있습니다.

라라벨의 `Schema` [파사드](/docs/10.x/facades)는 라라벨에서 지원하는 모든 데이터베이스 시스템에서 데이터베이스 테이블을 생성하고 조작할 수 있도록 데이터베이스에 독립적인 기능을 제공합니다. 일반적으로 마이그레이션은 이 파사드를 활용하여 데이터베이스의 테이블과 컬럼을 생성 및 수정합니다.

<a name="generating-migrations"></a>
## 마이그레이션 생성

`make:migration` [Artisan 명령어](/docs/10.x/artisan)를 사용해 데이터베이스 마이그레이션 파일을 생성할 수 있습니다. 새로 생성된 마이그레이션 파일은 `database/migrations` 디렉터리에 저장됩니다. 각 마이그레이션 파일명에는 타임스탬프가 포함되어 있어 라라벨이 마이그레이션 실행 순서를 결정할 수 있습니다.

```shell
php artisan make:migration create_flights_table
```

라라벨은 마이그레이션 파일의 이름을 참고하여 어떤 테이블을 대상으로 하는지, 그리고 새 테이블을 생성하는지 여부를 추론하려 시도합니다. 라라벨이 마이그레이션 이름에서 테이블명을 알아낼 수 있다면, 생성된 마이그레이션 파일의 내용을 미리 채워줍니다. 만약 자동으로 추론되지 않는다면, 마이그레이션 파일에서 직접 테이블명을 지정하시면 됩니다.

생성된 마이그레이션의 저장 경로를 따로 지정하고 싶다면, `make:migration` 명령어 실행 시 `--path` 옵션을 사용할 수 있습니다. 입력하는 경로는 애플리케이션의 최상위 경로에서 상대경로로 작성해야 합니다.

> [!NOTE]
> 마이그레이션 스텁(stub)은 [스텁 퍼블리싱](/docs/10.x/artisan#stub-customization)을 통해 커스터마이징할 수 있습니다.

<a name="squashing-migrations"></a>
### 마이그레이션 스쿼싱

애플리케이션을 개발하다 보면 시간이 지나면서 마이그레이션 파일이 점점 많아질 수 있습니다. 이로 인해 `database/migrations` 디렉터리에 수백 개의 마이그레이션이 쌓여 비대해질 수 있습니다. 이런 경우, 마이그레이션을 하나의 SQL 파일로 "스쿼시(squash)"하여 관리할 수 있습니다. 시작하려면 `schema:dump` 명령어를 실행하세요.

```shell
php artisan schema:dump

# 현재 데이터베이스 스키마를 덤프하고, 기존 모든 마이그레이션 파일을 정리(clean up)합니다...
php artisan schema:dump --prune
```

이 명령어를 실행하면, 라라벨은 애플리케이션의 `database/schema` 디렉터리에 "스키마" 파일을 생성합니다. 파일명은 데이터베이스 연결 이름과 일치합니다. 이제 데이터베이스에 마이그레이션을 적용하려고 할 때, 아직 마이그레이션이 실행된 적이 없다면 라라벨은 우선 해당 데이터베이스 연결의 스키마 파일에 들어 있는 SQL을 실행합니다. 스키마 파일 실행 후, 스키마 덤프에 포함되지 않은 나머지 마이그레이션만 추가로 실행합니다.

애플리케이션 테스트에서 로컬 개발 시 사용하는 데이터베이스와 다른 데이터베이스 연결을 사용한다면, 반드시 그 데이터베이스 연결을 사용해서도 스키마 파일을 덤프하세요. 이렇게 하면 테스트 실행 시 데이터베이스를 올바르게 구축할 수 있습니다. 일반적으로 로컬 개발용 연결의 스키마를 먼저 덤프한 후, 테스트용 연결에 대해 덤프를 진행합니다.

```shell
php artisan schema:dump
php artisan schema:dump --database=testing --prune
```

생성한 데이터베이스 스키마 파일은 소스 컨트롤에 커밋하는 것이 좋습니다. 이렇게 하면 팀의 신규 개발자가 빠르게 초기 데이터베이스 구조를 생성할 수 있습니다.

> [!WARNING]
> 마이그레이션 스쿼싱 기능은 MySQL, PostgreSQL, SQLite 데이터베이스에서만 지원되며, 데이터베이스의 커맨드라인 클라이언트를 활용합니다.

<a name="migration-structure"></a>
## 마이그레이션 구조

마이그레이션 클래스는 `up`과 `down` 두 개의 메서드를 가집니다. `up` 메서드는 데이터베이스에 새로운 테이블, 컬럼, 인덱스를 추가하는 작업에 사용하며, `down` 메서드는 `up`에서 수행한 작업을 되돌릴 수 있도록 반대로 동작해야 합니다.

이 두 메서드 내부에서는 라라벨 스키마 빌더(schema builder)를 사용하여 직관적으로 테이블을 생성하거나 수정할 수 있습니다. `Schema` 빌더에서 사용할 수 있는 모든 메서드에 대해 더 자세한 정보가 필요하다면 [관련 문서](#creating-tables)를 참고하시기 바랍니다. 예를 들어, 아래 마이그레이션에서는 `flights` 테이블을 생성합니다.

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
#### 마이그레이션 연결 설정

마이그레이션이 애플리케이션의 기본 데이터베이스 연결이 아닌 다른 데이터베이스 연결을 사용해야 한다면, 마이그레이션 클래스의 `$connection` 속성을 설정해 주세요.

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

아직 실행하지 않은 모든 마이그레이션을 한 번에 적용하려면, `migrate` Artisan 명령어를 실행하세요.

```shell
php artisan migrate
```

지금까지 어떤 마이그레이션이 실행되었는지 확인하려면, `migrate:status` Artisan 명령어를 사용할 수 있습니다.

```shell
php artisan migrate:status
```

마이그레이션이 실제로 실행되지는 않고, 어떤 SQL 문이 실행될지 미리 보고 싶다면, `migrate` 명령에 `--pretend` 플래그를 추가할 수 있습니다.

```shell
php artisan migrate --pretend
```

#### 마이그레이션 실행 분리(격리)

여러 서버에 애플리케이션을 배포하고, 배포 과정 중에 마이그레이션을 실행하는 경우, 두 서버가 동시에 같은 데이터베이스에 마이그레이션을 적용하는 상황을 피하고 싶을 수 있습니다. 이러한 경우, `migrate` 명령 실행 시 `isolated` 옵션을 사용할 수 있습니다.

`isolated` 옵션을 지정하면, 라라벨이 마이그레이션을 실행하기 전에 애플리케이션의 캐시 드라이버를 활용하여 원자적(atomic) 락을 획득합니다. 락이 유지되는 동안 다른 모든 마이그레이션 시도는 실제로 수행되지 않으며, 단지 성공적인 종료 코드와 함께 종료됩니다.

```shell
php artisan migrate --isolated
```

> [!WARNING]
> 이 기능을 사용하려면, 애플리케이션의 기본 캐시 드라이버로 `memcached`, `redis`, `dynamodb`, `database`, `file` 또는 `array` 중 하나가 설정되어 있어야 합니다. 또한 모든 서버는 동일한 중앙 캐시 서버와 통신해야 합니다.

<a name="forcing-migrations-to-run-in-production"></a>
#### 프로덕션 환경에서 강제로 마이그레이션 실행

일부 마이그레이션 작업은 파괴적일 수 있어 데이터 손실이 발생할 수도 있습니다. 이를 방지하기 위해, 프로덕션 데이터베이스에서 해당 명령을 실행하려고 하면 추가로 실행 여부를 확인하는 프롬프트가 표시됩니다. 프롬프트 없이 즉시 실행하려면 `--force` 플래그를 사용하세요.

```shell
php artisan migrate --force
```

<a name="rolling-back-migrations"></a>
### 마이그레이션 롤백

가장 최근에 실행된 마이그레이션 작업을 되돌리려면 `rollback` Artisan 명령어를 사용할 수 있습니다. 이 명령은 하나의 "배치(batch)"에 해당하는(여러 마이그레이션 파일 포함 가능) 모든 작업을 롤백합니다.

```shell
php artisan migrate:rollback
```

`rollback` 명령어에 `step` 옵션을 추가하면 최근 N개의 마이그레이션만 롤백할 수도 있습니다. 예를 들어, 다음 명령은 마지막 5개의 마이그레이션만 롤백합니다.

```shell
php artisan migrate:rollback --step=5
```

특정 "배치(batch)"의 마이그레이션만 롤백하려면, `rollback` 명령어에 `batch` 옵션을 추가하면 됩니다. 이때 `batch` 값은 애플리케이션의 `migrations` 데이터베이스 테이블 내 배치 값에 해당합니다. 예를 들어, 다음 명령은 3번 배치에 속한 모든 마이그레이션만 롤백합니다.

 ```shell
 php artisan migrate:rollback --batch=3
 ```

실제로 롤백을 실행하지 않고, 어떤 SQL 문이 실행될지 미리 확인하고 싶다면 `migrate:rollback` 명령에 `--pretend` 플래그를 추가하세요.

```shell
php artisan migrate:rollback --pretend
```

`migrate:reset` 명령어를 사용하면, 애플리케이션의 모든 마이그레이션을 한 번에 롤백할 수 있습니다.

```shell
php artisan migrate:reset
```

<a name="roll-back-migrate-using-a-single-command"></a>
#### 롤백과 마이그레이션을 한 번에 실행하기

`migrate:refresh` 명령어는 모든 마이그레이션을 롤백한 후 `migrate` 명령을 다시 실행합니다. 즉, 전체 데이터베이스를 한 번에 새로 만드는 효과가 있습니다.

```shell
php artisan migrate:refresh

# 데이터베이스를 초기화하고, 모든 시드(seed) 작업을 실행합니다...
php artisan migrate:refresh --seed
```

`refresh` 명령어에 `step` 옵션을 지정하면, 최근 N개의 마이그레이션만 롤백하고 다시 마이그레이션할 수 있습니다. 예를 들어, 아래 명령은 최근 5개의 마이그레이션만 롤백 후 재실행합니다.

```shell
php artisan migrate:refresh --step=5
```

<a name="drop-all-tables-migrate"></a>
#### 모든 테이블을 삭제하고 마이그레이션 실행

`migrate:fresh` 명령어를 사용하면 데이터베이스의 모든 테이블을 완전히 삭제한 뒤, 다시 마이그레이션을 실행합니다.

```shell
php artisan migrate:fresh

php artisan migrate:fresh --seed
```

기본적으로 `migrate:fresh` 명령어는 기본 데이터베이스 연결의 테이블만 삭제합니다. 하지만 `--database` 옵션을 사용해 특정 데이터베이스 연결을 지정할 수도 있습니다. 연결명은 애플리케이션의 `database` [설정 파일](/docs/10.x/configuration)에 정의된 값과 일치해야 합니다.

```shell
php artisan migrate:fresh --database=admin
```

> [!WARNING]
> `migrate:fresh` 명령어는 테이블의 접두사와 상관없이 데이터베이스의 모든 테이블을 삭제합니다. 다른 애플리케이션과 공유하는 데이터베이스에서 사용할 때는 각별히 주의하세요.

<a name="tables"></a>
## 테이블

<a name="creating-tables"></a>
### 테이블 생성

새로운 데이터베이스 테이블을 생성하려면, `Schema` 파사드의 `create` 메서드를 사용하세요. `create` 메서드는 두 개의 인자를 받습니다. 첫 번째는 생성할 테이블명, 두 번째는 신규 테이블을 정의할 수 있도록 `Blueprint` 오브젝트를 전달하는 클로저(익명 함수)입니다.

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

테이블 생성시, 스키마 빌더의 [컬럼 메서드](#creating-columns)를 자유롭게 사용하여 테이블의 컬럼을 정의할 수 있습니다.

<a name="determining-table-column-existence"></a>
#### 테이블 / 컬럼 존재 여부 확인

`hasTable`과 `hasColumn` 메서드를 사용하면, 테이블이나 컬럼이 존재하는지 확인할 수 있습니다.

```
if (Schema::hasTable('users')) {
    // "users" 테이블이 존재합니다...
}

if (Schema::hasColumn('users', 'email')) {
    // "users" 테이블이 존재하고, "email" 컬럼도 존재합니다...
}
```

<a name="database-connection-table-options"></a>
#### 데이터베이스 연결 및 테이블 옵션

기본 데이터베이스 연결이 아닌 다른 연결에 대해 스키마 작업을 수행하고 싶다면, `connection` 메서드를 사용하세요.

```
Schema::connection('sqlite')->create('users', function (Blueprint $table) {
    $table->id();
});
```

추가로, 테이블 생성 시 몇 가지 속성 및 메서드를 통해 다양한 옵션을 지정할 수 있습니다. MySQL에서 스토리지 엔진을 설정하려면 `engine` 속성을 사용하세요.

```
Schema::create('users', function (Blueprint $table) {
    $table->engine = 'InnoDB';

    // ...
});
```

MySQL에서 테이블의 문자셋 및 정렬방식을 지정하려면 `charset`과 `collation` 속성을 사용할 수 있습니다.

```
Schema::create('users', function (Blueprint $table) {
    $table->charset = 'utf8mb4';
    $table->collation = 'utf8mb4_unicode_ci';

    // ...
});
```

테이블을 "임시(temporary)"로 만들고 싶다면, `temporary` 메서드를 사용하세요. 임시 테이블은 현재 연결의 데이터베이스 세션에서만 보이고, 연결을 종료하면 자동으로 삭제됩니다.

```
Schema::create('calculations', function (Blueprint $table) {
    $table->temporary();

    // ...
});
```

데이터베이스 테이블에 "코멘트(comment)"를 추가하고 싶다면, 테이블 인스턴스의 `comment` 메서드를 호출할 수 있습니다. 테이블 코멘트는 현재 MySQL과 Postgres에서만 지원됩니다.

```
Schema::create('calculations', function (Blueprint $table) {
    $table->comment('Business calculations');

    // ...
});
```

<a name="updating-tables"></a>
### 테이블 수정

기존 테이블을 수정하려면 `Schema` 파사드의 `table` 메서드를 사용하세요. `create` 메서드와 마찬가지로, `table` 메서드는 첫 번째 인자로 테이블명, 두 번째 인자로 컬럼이나 인덱스를 추가할 수 있는 `Blueprint` 인스턴스를 전달하는 클로저를 받습니다.

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

기존 테이블을 삭제하려면 `drop` 또는 `dropIfExists` 메서드를 사용할 수 있습니다.

```
Schema::drop('users');

Schema::dropIfExists('users');
```

<a name="renaming-tables-with-foreign-keys"></a>
#### 외래 키가 있는 테이블의 이름 변경

테이블 이름을 변경하기 전에는, 해당 테이블의 외래 키 제약(foreign key constraint)에 대해 마이그레이션 파일 내에서 반드시 명시적으로 이름을 지정했는지 확인해야 합니다. 그렇지 않으면, 외래 키 제약 이름이 이전 테이블명을 참조할 수 있습니다.

<a name="columns"></a>
## 컬럼

<a name="creating-columns"></a>
### 컬럼 생성

기존 테이블에 컬럼을 추가하려면, `Schema` 파사드의 `table` 메서드를 사용하세요. 이 메서드는 `create`와 동일하게 첫 번째 인자로 테이블명, 두 번째 인자로 `Illuminate\Database\Schema\Blueprint` 인스턴스를 받는 클로저를 전달합니다.

```
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('users', function (Blueprint $table) {
    $table->integer('votes');
});
```

<a name="available-column-types"></a>
### 사용 가능한 컬럼 타입

스키마 빌더(Blueprint)는 데이터베이스 테이블에 추가할 수 있는 다양한 컬럼 타입에 해당하는 여러 메서드를 제공합니다. 사용 가능한 각각의 메서드는 아래 표에 정리되어 있습니다.

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

`bigIncrements` 메서드는 자동 증가하는 `UNSIGNED BIGINT` (기본 키) 컬럼을 생성합니다.

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

`char` 메서드는 지정한 길이만큼의 `CHAR` 타입 컬럼을 생성합니다.

```
$table->char('name', 100);
```

<a name="column-method-dateTimeTz"></a>
#### `dateTimeTz()`

`dateTimeTz` 메서드는(정밀도 지정 가능) 타임존이 포함된 `DATETIME` 타입의 컬럼을 생성합니다.

```
$table->dateTimeTz('created_at', $precision = 0);
```

<a name="column-method-dateTime"></a>
#### `dateTime()`

`dateTime` 메서드는(정밀도 지정 가능) `DATETIME` 타입의 컬럼을 생성합니다.

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

`decimal` 메서드는 지정한 전체 자리수(precision)와 소수점 이하 자리수(scale)를 갖는 `DECIMAL` 타입의 컬럼을 생성합니다.

```
$table->decimal('amount', $precision = 8, $scale = 2);
```

<a name="column-method-double"></a>

#### `double()`

`double` 메서드는 지정한 precision(전체 자릿수)과 scale(소수 자릿수)로 `DOUBLE`과 동등한 컬럼을 생성합니다.

```
$table->double('amount', 8, 2);
```

<a name="column-method-enum"></a>
#### `enum()`

`enum` 메서드는 주어진 값 목록으로 제한되는 `ENUM`과 동등한 컬럼을 생성합니다.

```
$table->enum('difficulty', ['easy', 'hard']);
```

<a name="column-method-float"></a>
#### `float()`

`float` 메서드는 지정한 precision(전체 자릿수)과 scale(소수 자릿수)로 `FLOAT`과 동등한 컬럼을 생성합니다.

```
$table->float('amount', 8, 2);
```

<a name="column-method-foreignId"></a>
#### `foreignId()`

`foreignId` 메서드는 `UNSIGNED BIGINT`와 동등한 컬럼을 생성합니다.

```
$table->foreignId('user_id');
```

<a name="column-method-foreignIdFor"></a>
#### `foreignIdFor()`

`foreignIdFor` 메서드는 주어진 모델 클래스에 대해 `{column}_id`와 동등한 컬럼을 추가합니다. 컬럼 타입은 모델의 키 타입에 따라 `UNSIGNED BIGINT`, `CHAR(36)`, 또는 `CHAR(26)`이 됩니다.

```
$table->foreignIdFor(User::class);
```

<a name="column-method-foreignUlid"></a>
#### `foreignUlid()`

`foreignUlid` 메서드는 `ULID`와 동등한 컬럼을 생성합니다.

```
$table->foreignUlid('user_id');
```

<a name="column-method-foreignUuid"></a>
#### `foreignUuid()`

`foreignUuid` 메서드는 `UUID`와 동등한 컬럼을 생성합니다.

```
$table->foreignUuid('user_id');
```

<a name="column-method-geometryCollection"></a>
#### `geometryCollection()`

`geometryCollection` 메서드는 `GEOMETRYCOLLECTION`과 동등한 컬럼을 생성합니다.

```
$table->geometryCollection('positions');
```

<a name="column-method-geometry"></a>
#### `geometry()`

`geometry` 메서드는 `GEOMETRY`와 동등한 컬럼을 생성합니다.

```
$table->geometry('positions');
```

<a name="column-method-id"></a>
#### `id()`

`id` 메서드는 `bigIncrements` 메서드의 별칭입니다. 기본적으로 `id` 컬럼을 생성하지만, 다른 컬럼명을 지정하고 싶다면 이름을 직접 전달할 수 있습니다.

```
$table->id();
```

<a name="column-method-increments"></a>
#### `increments()`

`increments` 메서드는 자동 증가하는 `UNSIGNED INTEGER` 타입의 컬럼을 기본키로 생성합니다.

```
$table->increments('id');
```

<a name="column-method-integer"></a>
#### `integer()`

`integer` 메서드는 `INTEGER`와 동등한 컬럼을 생성합니다.

```
$table->integer('votes');
```

<a name="column-method-ipAddress"></a>
#### `ipAddress()`

`ipAddress` 메서드는 `VARCHAR`와 동등한 컬럼을 생성합니다.

```
$table->ipAddress('visitor');
```
Postgres를 사용할 때는 `INET` 컬럼이 생성됩니다.

<a name="column-method-json"></a>
#### `json()`

`json` 메서드는 `JSON`과 동등한 컬럼을 생성합니다.

```
$table->json('options');
```

<a name="column-method-jsonb"></a>
#### `jsonb()`

`jsonb` 메서드는 `JSONB`와 동등한 컬럼을 생성합니다.

```
$table->jsonb('options');
```

<a name="column-method-lineString"></a>
#### `lineString()`

`lineString` 메서드는 `LINESTRING`과 동등한 컬럼을 생성합니다.

```
$table->lineString('positions');
```

<a name="column-method-longText"></a>
#### `longText()`

`longText` 메서드는 `LONGTEXT`와 동등한 컬럼을 생성합니다.

```
$table->longText('description');
```

<a name="column-method-macAddress"></a>
#### `macAddress()`

`macAddress` 메서드는 MAC 주소를 저장하기 위한 컬럼을 생성합니다. PostgreSQL 등 일부 데이터베이스는 이 용도를 위한 전용 컬럼 타입을 제공합니다. 그 외에는 문자열 타입 컬럼이 사용됩니다.

```
$table->macAddress('device');
```

<a name="column-method-mediumIncrements"></a>
#### `mediumIncrements()`

`mediumIncrements` 메서드는 자동 증가하는 `UNSIGNED MEDIUMINT` 타입의 컬럼을 기본키로 생성합니다.

```
$table->mediumIncrements('id');
```

<a name="column-method-mediumInteger"></a>
#### `mediumInteger()`

`mediumInteger` 메서드는 `MEDIUMINT`와 동등한 컬럼을 생성합니다.

```
$table->mediumInteger('votes');
```

<a name="column-method-mediumText"></a>
#### `mediumText()`

`mediumText` 메서드는 `MEDIUMTEXT`와 동등한 컬럼을 생성합니다.

```
$table->mediumText('description');
```

<a name="column-method-morphs"></a>
#### `morphs()`

`morphs` 메서드는 `{column}_id`와 동등한 컬럼과 `{column}_type` `VARCHAR`와 동등한 컬럼을 함께 추가하는 편의 메서드입니다. `{column}_id` 타입은 모델의 키 타입에 따라 `UNSIGNED BIGINT`, `CHAR(36)`, 또는 `CHAR(26)`이 됩니다.

이 메서드는 다형성 [Eloquent 연관관계](/docs/10.x/eloquent-relationships)를 만들 때 필요한 컬럼을 정의하기 위해 사용됩니다. 아래 예시에서는 `taggable_id`와 `taggable_type` 컬럼이 생성됩니다.

```
$table->morphs('taggable');
```

<a name="column-method-multiLineString"></a>
#### `multiLineString()`

`multiLineString` 메서드는 `MULTILINESTRING`과 동등한 컬럼을 생성합니다.

```
$table->multiLineString('positions');
```

<a name="column-method-multiPoint"></a>
#### `multiPoint()`

`multiPoint` 메서드는 `MULTIPOINT`와 동등한 컬럼을 생성합니다.

```
$table->multiPoint('positions');
```

<a name="column-method-multiPolygon"></a>
#### `multiPolygon()`

`multiPolygon` 메서드는 `MULTIPOLYGON`과 동등한 컬럼을 생성합니다.

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

이 메서드는 [morphs](#column-method-morphs) 메서드와 유사하지만, 생성되는 컬럼들이 "nullable"로 지정된다는 점이 다릅니다.

```
$table->nullableMorphs('taggable');
```

<a name="column-method-nullableUlidMorphs"></a>
#### `nullableUlidMorphs()`

이 메서드는 [ulidMorphs](#column-method-ulidMorphs) 메서드와 유사하지만, 생성되는 컬럼들이 "nullable"로 지정됩니다.

```
$table->nullableUlidMorphs('taggable');
```

<a name="column-method-nullableUuidMorphs"></a>
#### `nullableUuidMorphs()`

이 메서드는 [uuidMorphs](#column-method-uuidMorphs) 메서드와 유사하지만, 생성되는 컬럼들이 "nullable"로 지정됩니다.

```
$table->nullableUuidMorphs('taggable');
```

<a name="column-method-point"></a>
#### `point()`

`point` 메서드는 `POINT`와 동등한 컬럼을 생성합니다.

```
$table->point('position');
```

<a name="column-method-polygon"></a>
#### `polygon()`

`polygon` 메서드는 `POLYGON`과 동등한 컬럼을 생성합니다.

```
$table->polygon('position');
```

<a name="column-method-rememberToken"></a>
#### `rememberToken()`

`rememberToken` 메서드는 현 사용자의 "remember me" [인증 토큰](/docs/10.x/authentication#remembering-users)을 저장하기 위한 nullable, `VARCHAR(100)`과 동등한 컬럼을 생성합니다.

```
$table->rememberToken();
```

<a name="column-method-set"></a>
#### `set()`

`set` 메서드는 전달된 값 목록으로 제한되는 `SET`과 동등한 컬럼을 생성합니다.

```
$table->set('flavors', ['strawberry', 'vanilla']);
```

<a name="column-method-smallIncrements"></a>
#### `smallIncrements()`

`smallIncrements` 메서드는 자동 증가하는 `UNSIGNED SMALLINT` 타입의 컬럼을 기본키로 생성합니다.

```
$table->smallIncrements('id');
```

<a name="column-method-smallInteger"></a>
#### `smallInteger()`

`smallInteger` 메서드는 `SMALLINT`와 동등한 컬럼을 생성합니다.

```
$table->smallInteger('votes');
```

<a name="column-method-softDeletesTz"></a>
#### `softDeletesTz()`

`softDeletesTz` 메서드는 nullable한 `deleted_at` `TIMESTAMP`(타임존 포함)과 동등한 컬럼을 precision(총 자릿수) 옵션과 함께 추가합니다. 이 컬럼은 Eloquent의 "soft delete" 기능에 필요한 `deleted_at` 타임스탬프 값을 저장하는 용도입니다.

```
$table->softDeletesTz($column = 'deleted_at', $precision = 0);
```

<a name="column-method-softDeletes"></a>
#### `softDeletes()`

`softDeletes` 메서드는 nullable한 `deleted_at` `TIMESTAMP`와 동등한 컬럼을 precision(총 자릿수) 옵션과 함께 추가합니다. 이 컬럼은 Eloquent의 "soft delete" 기능에 필요한 `deleted_at` 타임스탬프 값을 저장하는 용도입니다.

```
$table->softDeletes($column = 'deleted_at', $precision = 0);
```

<a name="column-method-string"></a>
#### `string()`

`string` 메서드는 지정한 길이의 `VARCHAR`와 동등한 컬럼을 생성합니다.

```
$table->string('name', 100);
```

<a name="column-method-text"></a>
#### `text()`

`text` 메서드는 `TEXT`와 동등한 컬럼을 생성합니다.

```
$table->text('description');
```

<a name="column-method-timeTz"></a>
#### `timeTz()`

`timeTz` 메서드는 지정된 precision(총 자릿수) 옵션으로 타임존이 포함된 `TIME`과 동등한 컬럼을 생성합니다.

```
$table->timeTz('sunrise', $precision = 0);
```

<a name="column-method-time"></a>
#### `time()`

`time` 메서드는 지정된 precision(총 자릿수) 옵션으로 `TIME`과 동등한 컬럼을 생성합니다.

```
$table->time('sunrise', $precision = 0);
```

<a name="column-method-timestampTz"></a>
#### `timestampTz()`

`timestampTz` 메서드는 지정된 precision(총 자릿수) 옵션으로 타임존이 포함된 `TIMESTAMP`와 동등한 컬럼을 생성합니다.

```
$table->timestampTz('added_at', $precision = 0);
```

<a name="column-method-timestamp"></a>
#### `timestamp()`

`timestamp` 메서드는 지정된 precision(총 자릿수) 옵션으로 `TIMESTAMP`와 동등한 컬럼을 생성합니다.

```
$table->timestamp('added_at', $precision = 0);
```

<a name="column-method-timestampsTz"></a>
#### `timestampsTz()`

`timestampsTz` 메서드는 지정된 precision(총 자릿수) 옵션으로 `created_at`과 `updated_at` 타임존이 있는 `TIMESTAMP`와 동등한 컬럼을 생성합니다.

```
$table->timestampsTz($precision = 0);
```

<a name="column-method-timestamps"></a>
#### `timestamps()`

`timestamps` 메서드는 지정된 precision(총 자릿수) 옵션으로 `created_at`과 `updated_at` `TIMESTAMP`와 동등한 컬럼을 생성합니다.

```
$table->timestamps($precision = 0);
```

<a name="column-method-tinyIncrements"></a>
#### `tinyIncrements()`

`tinyIncrements` 메서드는 자동 증가하는 `UNSIGNED TINYINT` 타입의 컬럼을 기본키로 생성합니다.

```
$table->tinyIncrements('id');
```

<a name="column-method-tinyInteger"></a>
#### `tinyInteger()`

`tinyInteger` 메서드는 `TINYINT`와 동등한 컬럼을 생성합니다.

```
$table->tinyInteger('votes');
```

<a name="column-method-tinyText"></a>
#### `tinyText()`

`tinyText` 메서드는 `TINYTEXT`와 동등한 컬럼을 생성합니다.

```
$table->tinyText('notes');
```

<a name="column-method-unsignedBigInteger"></a>
#### `unsignedBigInteger()`

`unsignedBigInteger` 메서드는 `UNSIGNED BIGINT`와 동등한 컬럼을 생성합니다.

```
$table->unsignedBigInteger('votes');
```

<a name="column-method-unsignedDecimal"></a>
#### `unsignedDecimal()`

`unsignedDecimal` 메서드는 지정된 precision(총 자릿수) 및 scale(소수 자릿수)로 `UNSIGNED DECIMAL`과 동등한 컬럼을 생성합니다.

```
$table->unsignedDecimal('amount', $precision = 8, $scale = 2);
```

<a name="column-method-unsignedInteger"></a>
#### `unsignedInteger()`

`unsignedInteger` 메서드는 `UNSIGNED INTEGER`와 동등한 컬럼을 생성합니다.

```
$table->unsignedInteger('votes');
```

<a name="column-method-unsignedMediumInteger"></a>
#### `unsignedMediumInteger()`

`unsignedMediumInteger` 메서드는 `UNSIGNED MEDIUMINT`와 동등한 컬럼을 생성합니다.

```
$table->unsignedMediumInteger('votes');
```

<a name="column-method-unsignedSmallInteger"></a>
#### `unsignedSmallInteger()`

`unsignedSmallInteger` 메서드는 `UNSIGNED SMALLINT`와 동등한 컬럼을 생성합니다.

```
$table->unsignedSmallInteger('votes');
```

<a name="column-method-unsignedTinyInteger"></a>
#### `unsignedTinyInteger()`

`unsignedTinyInteger` 메서드는 `UNSIGNED TINYINT`와 동등한 컬럼을 생성합니다.

```
$table->unsignedTinyInteger('votes');
```

<a name="column-method-ulidMorphs"></a>
#### `ulidMorphs()`

`ulidMorphs` 메서드는 `{column}_id` `CHAR(26)`과 동등한 컬럼과 `{column}_type` `VARCHAR`와 동등한 컬럼을 한 번에 추가하는 편의 메서드입니다.

이 메서드는 ULID 식별자를 사용하는 다형성 [Eloquent 연관관계](/docs/10.x/eloquent-relationships)에 필요한 컬럼을 정의할 때 사용됩니다. 아래 예시에서는 `taggable_id`와 `taggable_type` 컬럼이 생성됩니다.

```
$table->ulidMorphs('taggable');
```

<a name="column-method-uuidMorphs"></a>
#### `uuidMorphs()`

`uuidMorphs` 메서드는 `{column}_id` `CHAR(36)`과 동등한 컬럼과 `{column}_type` `VARCHAR`와 동등한 컬럼을 한 번에 추가하는 편의 메서드입니다.

이 메서드는 UUID 식별자를 사용하는 다형성 [Eloquent 연관관계](/docs/10.x/eloquent-relationships)에 필요한 컬럼을 정의할 때 사용됩니다. 아래 예시에서는 `taggable_id`와 `taggable_type` 컬럼이 생성됩니다.

```
$table->uuidMorphs('taggable');
```

<a name="column-method-ulid"></a>
#### `ulid()`

`ulid` 메서드는 `ULID`와 동등한 컬럼을 생성합니다.

```
$table->ulid('id');
```

<a name="column-method-uuid"></a>
#### `uuid()`

`uuid` 메서드는 `UUID`와 동등한 컬럼을 생성합니다.

```
$table->uuid('id');
```

<a name="column-method-year"></a>
#### `year()`

`year` 메서드는 `YEAR`와 동등한 컬럼을 생성합니다.

```
$table->year('birth_year');
```

<a name="column-modifiers"></a>
### 컬럼 수정자(Column Modifiers)

위에서 소개한 컬럼 타입 외에도, 데이터베이스 테이블에 컬럼을 추가할 때 사용할 수 있는 다양한 "컬럼 수정자(modifiers)"가 있습니다. 예를 들어 컬럼을 "nullable"로 지정하고 싶을 때는 `nullable` 메서드를 사용할 수 있습니다.

```
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('users', function (Blueprint $table) {
    $table->string('email')->nullable();
});
```

아래 표는 사용 가능한 모든 컬럼 수정자를 정리한 것입니다. 이 목록에는 [인덱스 수정자](#creating-indexes)는 포함되어 있지 않습니다.

Modifier  |  설명
--------  |  -----------
`->after('column')`  |  지정한 컬럼 바로 "뒤"에 해당 컬럼을 배치합니다 (MySQL).
`->autoIncrement()`  |  INTEGER 컬럼을 auto-increment(기본키)로 설정합니다.
`->charset('utf8mb4')`  |  컬럼의 문자셋(charset)을 지정합니다 (MySQL).
`->collation('utf8mb4_unicode_ci')`  |  컬럼의 정렬 방식(collation)을 지정합니다 (MySQL/PostgreSQL/SQL Server).
`->comment('my comment')`  |  컬럼에 주석(comment)을 추가합니다 (MySQL/PostgreSQL).
`->default($value)`  |  컬럼의 "기본값(default)"을 지정합니다.
`->first()`  |  해당 컬럼을 테이블의 "가장 처음"에 배치합니다 (MySQL).
`->from($integer)`  |  자동증가 필드의 시작값을 지정합니다 (MySQL / PostgreSQL).
`->invisible()`  |  `SELECT *` 쿼리에서 해당 컬럼을 "감춤" 상태로 지정합니다 (MySQL).
`->nullable($value = true)`  |  이 컬럼에 NULL 값을 저장할 수 있도록 허용합니다.
`->storedAs($expression)`  |  저장된 계산 컬럼(stored generated column)을 생성합니다 (MySQL / PostgreSQL).
`->unsigned()`  |  INTEGER 컬럼을 UNSIGNED로 지정합니다 (MySQL).
`->useCurrent()`  |  TIMESTAMP 컬럼의 기본값을 CURRENT_TIMESTAMP로 지정합니다.
`->useCurrentOnUpdate()`  |  레코드가 수정될 때 TIMESTAMP 컬럼에 CURRENT_TIMESTAMP가 자동으로 반영되도록 합니다 (MySQL).
`->virtualAs($expression)`  |  가상 생성 컬럼(virtual generated column)을 생성합니다 (MySQL / PostgreSQL / SQLite).
`->generatedAs($expression)`  |  지정한 시퀀스 옵션으로 아이덴티티 컬럼(identity column)을 생성합니다 (PostgreSQL).
`->always()`  |  아이덴티티 컬럼에서 입력값보다 시퀀스 값을 우선적으로 지정합니다 (PostgreSQL).
`->isGeometry()`  |  공간 컬럼의 타입을 기본값인 `geography` 대신 `geometry`로 지정합니다 (PostgreSQL).

<a name="default-expressions"></a>

#### 기본 표현식

`default` 수정자는 값 또는 `Illuminate\Database\Query\Expression` 인스턴스를 인수로 받을 수 있습니다. `Expression` 인스턴스를 사용하면 라라벨이 해당 값을 따옴표로 감싸지 않으므로 데이터베이스 고유의 함수를 사용할 수 있습니다. 이 기능이 특히 유용한 대표적인 사례는 JSON 컬럼에 기본값을 할당해야 할 때입니다.

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
> 기본 표현식의 지원 여부는 데이터베이스 드라이버, 데이터베이스 버전, 컬럼 타입에 따라 다릅니다. 반드시 본인의 데이터베이스 공식 문서를 확인하십시오.

<a name="column-order"></a>
#### 컬럼 순서 지정

MySQL 데이터베이스를 사용할 때, `after` 메서드를 활용하여 기존 컬럼 뒤에 새로운 컬럼들을 추가할 수 있습니다.

```
$table->after('password', function (Blueprint $table) {
    $table->string('address_line1');
    $table->string('address_line2');
    $table->string('city');
});
```

<a name="modifying-columns"></a>
### 컬럼 수정하기

`change` 메서드를 사용하면 기존 컬럼의 타입과 속성을 자유롭게 수정할 수 있습니다. 예를 들어, `string` 타입 컬럼의 길이를 늘리고 싶을 때 사용할 수 있습니다. `change` 메서드의 실제 사용 예를 보겠습니다. 아래처럼 `name` 컬럼의 길이를 25에서 50으로 늘리려면, 해당 컬럼의 새로운 속성을 정의한 후 `change` 메서드를 호출하면 됩니다.

```
Schema::table('users', function (Blueprint $table) {
    $table->string('name', 50)->change();
});
```

컬럼을 수정할 때는, 해당 컬럼에 계속 적용하고 싶은 모든 수정자(modifier)를 명시적으로 포함해야 합니다. 명시하지 않은 속성은 삭제됩니다. 예를 들어, `unsigned`, `default`, `comment` 속성을 그대로 유지하려면 수정 시 각각의 수정자를 반드시 다시 선언해 주어야 합니다.

```
Schema::table('users', function (Blueprint $table) {
    $table->integer('votes')->unsigned()->default(1)->comment('my comment')->change();
});
```

<a name="modifying-columns-on-sqlite"></a>
#### SQLite에서 컬럼 수정하기

애플리케이션에서 SQLite 데이터베이스를 사용 중이라면, 컬럼을 수정하기 전에 Composer 패키지 매니저로 `doctrine/dbal` 패키지를 반드시 설치해야 합니다. Doctrine DBAL 라이브러리를 사용하면 컬럼의 현재 상태를 파악하고, 원하는 변경 작업에 필요한 SQL 쿼리를 생성하게 됩니다.

```
composer require doctrine/dbal
```

만약 `timestamp` 메서드로 생성한 컬럼을 수정하려는 경우, 애플리케이션의 `config/database.php` 설정 파일에 아래와 같은 구성을 추가해야 합니다.

```php
use Illuminate\Database\DBAL\TimestampType;

'dbal' => [
    'types' => [
        'timestamp' => TimestampType::class,
    ],
],
```

> [!WARNING]
> `doctrine/dbal` 패키지를 사용할 때 아래 컬럼 타입만 수정이 가능합니다: `bigInteger`, `binary`, `boolean`, `char`, `date`, `dateTime`, `dateTimeTz`, `decimal`, `double`, `integer`, `json`, `longText`, `mediumText`, `smallInteger`, `string`, `text`, `time`, `tinyText`, `unsignedBigInteger`, `unsignedInteger`, `unsignedSmallInteger`, `ulid`, `uuid`.

<a name="renaming-columns"></a>
### 컬럼 이름 변경하기

컬럼의 이름을 변경하려면, 스키마 빌더가 제공하는 `renameColumn` 메서드를 사용하면 됩니다.

```
Schema::table('users', function (Blueprint $table) {
    $table->renameColumn('from', 'to');
});
```

<a name="renaming-columns-on-legacy-databases"></a>
#### 레거시 데이터베이스에서 컬럼 이름 변경

아래에 안내된 버전보다 낮은 데이터베이스 버전을 사용 중이라면, 컬럼 이름을 변경하기 전에 Composer 패키지 매니저를 통해 `doctrine/dbal` 라이브러리를 설치해야 합니다.

<div class="content-list" markdown="1">

- MySQL < `8.0.3`
- MariaDB < `10.5.2`
- SQLite < `3.25.0`

</div>

<a name="dropping-columns"></a>
### 컬럼 삭제하기

컬럼을 삭제하려면, 스키마 빌더에서 `dropColumn` 메서드를 사용할 수 있습니다.

```
Schema::table('users', function (Blueprint $table) {
    $table->dropColumn('votes');
});
```

여러 개의 컬럼을 한 번에 삭제하려면, 컬럼명 배열을 `dropColumn` 메서드에 전달하면 됩니다.

```
Schema::table('users', function (Blueprint $table) {
    $table->dropColumn(['votes', 'avatar', 'location']);
});
```

<a name="dropping-columns-on-legacy-databases"></a>
#### 레거시 데이터베이스에서 컬럼 삭제

SQLite가 `3.35.0` 미만 버전이라면, `dropColumn` 메서드를 사용하기 전에 Composer로 `doctrine/dbal` 패키지를 설치해야 합니다. 이 패키지를 사용할 때 단일 마이그레이션 내에서 여러 컬럼을 동시에 삭제하거나 수정하는 작업은 지원되지 않습니다.

<a name="available-command-aliases"></a>
#### 사용 가능한 명령어 별칭

라라벨은 자주 사용되는 컬럼을 삭제하기 위한 여러 편리한 메서드를 제공합니다. 아래 표에서 각 명령어의 기능을 확인할 수 있습니다.

Command  |  Description
-------  |  -----------
`$table->dropMorphs('morphable');`  |  `morphable_id`와 `morphable_type` 컬럼을 삭제합니다.
`$table->dropRememberToken();`  |  `remember_token` 컬럼을 삭제합니다.
`$table->dropSoftDeletes();`  |  `deleted_at` 컬럼을 삭제합니다.
`$table->dropSoftDeletesTz();`  |  `dropSoftDeletes()` 메서드의 별칭입니다.
`$table->dropTimestamps();`  |  `created_at`, `updated_at` 컬럼을 삭제합니다.
`$table->dropTimestampsTz();` |  `dropTimestamps()` 메서드의 별칭입니다.

<a name="indexes"></a>
## 인덱스

<a name="creating-indexes"></a>
### 인덱스 생성하기

라라벨의 스키마 빌더는 여러 종류의 인덱스를 지원합니다. 아래 예제에서는 `email` 컬럼을 새로 추가하고 해당 컬럼 값이 유일해야 함을 명시합니다. 이때 `unique` 메서드를 컬럼 정의 뒤에 체이닝하면 인덱스가 생성됩니다.

```
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('users', function (Blueprint $table) {
    $table->string('email')->unique();
});
```

또는, 컬럼을 정의한 이후에 인덱스를 별도로 생성할 수도 있습니다. 이 경우, 스키마 블루프린트에서 `unique` 메서드를 호출하면 됩니다. 이 메서드는 유니크 인덱스를 적용할 컬럼명을 인수로 받습니다.

```
$table->unique('email');
```

인덱스 메서드에 컬럼명 배열을 넘기면 복합(또는 조합) 인덱스도 생성할 수 있습니다.

```
$table->index(['account_id', 'created_at']);
```

인덱스를 생성할 때 라라벨이 기본적으로 테이블명, 컬럼명, 인덱스 타입을 조합해 인덱스명을 자동 생성하지만, 두 번째 인수로 직접 인덱스명을 지정할 수도 있습니다.

```
$table->unique('email', 'unique_email');
```

<a name="available-index-types"></a>
#### 사용 가능한 인덱스 타입

라라벨의 스키마 빌더 블루프린트 클래스는 라라벨에서 지원하는 모든 인덱스 타입을 메서드로 제공합니다. 각 인덱스 메서드는 옵션으로 인덱스명을 두 번째 인수로 받을 수 있습니다. 인덱스명을 생략하면, 테이블명과 컬럼명(들), 인덱스 타입을 조합해 인덱스명이 자동으로 생성됩니다. 아래 표에서 주요 인덱스 메서드를 확인할 수 있습니다.

Command  |  Description
-------  |  -----------
`$table->primary('id');`  |  기본키를 추가합니다.
`$table->primary(['id', 'parent_id']);`  |  복합 기본키를 추가합니다.
`$table->unique('email');`  |  유니크 인덱스를 추가합니다.
`$table->index('state');`  |  일반 인덱스를 추가합니다.
`$table->fullText('body');`  |  전문(full text) 인덱스를 추가합니다 (MySQL/PostgreSQL).
`$table->fullText('body')->language('english');`  |  지정한 언어의 전문 인덱스를 추가합니다 (PostgreSQL).
`$table->spatialIndex('location');`  |  공간 인덱스를 추가합니다 (SQLite 제외).

<a name="index-lengths-mysql-mariadb"></a>
#### 인덱스 길이와 MySQL / MariaDB

라라벨은 기본적으로 `utf8mb4` 문자 집합을 사용합니다. MySQL이 5.7.7 미만 버전이거나 MariaDB가 10.2.2 미만 버전이라면, 마이그레이션에서 생성되는 문자열의 기본 길이를 수동으로 설정해야 인덱스를 정상적으로 생성할 수 있습니다. 이때 `App\Providers\AppServiceProvider`의 `boot` 메서드에서 `Schema::defaultStringLength` 메서드를 호출해 기본 문자열 길이를 설정할 수 있습니다.

```
use Illuminate\Support\Facades\Schema;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Schema::defaultStringLength(191);
}
```

또는 데이터베이스의 `innodb_large_prefix` 옵션을 활성화해서 사용할 수도 있습니다. 해당 옵션 활성화 방법은 데이터베이스 공식 문서를 참조하시기 바랍니다.

<a name="renaming-indexes"></a>
### 인덱스 이름 변경하기

인덱스의 이름을 변경하려면, 스키마 빌더 블루프린트가 제공하는 `renameIndex` 메서드를 사용합니다. 첫 번째 인수로 현재 인덱스명, 두 번째 인수로 원하는 새 인덱스명을 전달하세요.

```
$table->renameIndex('from', 'to')
```

> [!WARNING]
> 애플리케이션이 SQLite 데이터베이스를 사용 중인 경우, `renameIndex` 메서드를 사용하기 전에 반드시 Composer로 `doctrine/dbal` 패키지를 설치해야 합니다.

<a name="dropping-indexes"></a>
### 인덱스 삭제하기

인덱스를 삭제하려면, 반드시 인덱스명을 인수로 지정해야 합니다. 라라벨은 테이블명, 인덱싱되는 컬럼명, 인덱스 타입을 조합해 인덱스명을 자동으로 부여합니다. 아래는 사용 예시입니다.

Command  |  Description
-------  |  -----------
`$table->dropPrimary('users_id_primary');`  |  "users" 테이블의 기본키를 삭제합니다.
`$table->dropUnique('users_email_unique');`  |  "users" 테이블의 유니크 인덱스를 삭제합니다.
`$table->dropIndex('geo_state_index');`  |  "geo" 테이블의 일반 인덱스를 삭제합니다.
`$table->dropFullText('posts_body_fulltext');`  |  "posts" 테이블의 전문 인덱스를 삭제합니다.
`$table->dropSpatialIndex('geo_location_spatialindex');`  |  "geo" 테이블의 공간 인덱스를 삭제합니다 (SQLite 제외).

여러 컬럼명을 배열로 전달해 인덱스를 삭제하면, 지정한 테이블명, 컬럼명, 인덱스 타입 기준으로 라라벨이 인덱스명을 자동으로 생성해 삭제하게 됩니다.

```
Schema::table('geo', function (Blueprint $table) {
    $table->dropIndex(['state']); // 'geo_state_index' 인덱스를 삭제합니다.
});
```

<a name="foreign-key-constraints"></a>
### 외래 키 제약조건

라라벨은 데이터베이스 수준의 참조 무결성을 강제하는 외래 키(foreign key) 제약조건 기능도 제공합니다. 예를 들어, `posts` 테이블의 `user_id` 컬럼이 `users` 테이블의 `id` 컬럼을 참조하도록 정의할 수 있습니다.

```
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('posts', function (Blueprint $table) {
    $table->unsignedBigInteger('user_id');

    $table->foreign('user_id')->references('id')->on('users');
});
```

이 문법은 다소 장황하므로, 라라벨은 규약(convention)을 활용해 더 간결하게 작성할 수 있는 별도의 메서드도 제공합니다. `foreignId` 메서드를 사용하면 위 코드를 아래처럼 줄일 수 있습니다.

```
Schema::table('posts', function (Blueprint $table) {
    $table->foreignId('user_id')->constrained();
});
```

`foreignId` 메서드는 `UNSIGNED BIGINT`에 해당하는 컬럼을 생성하며, `constrained` 메서드는 규약에 따라 참조할 테이블과 컬럼을 자동으로 결정합니다. 만약 테이블명이 라라벨의 규약과 다르다면, `constrained` 메서드에 직접 테이블명을 지정할 수도 있습니다. 또한, 생성되는 인덱스명도 인수로 명시적으로 지정할 수 있습니다.

```
Schema::table('posts', function (Blueprint $table) {
    $table->foreignId('user_id')->constrained(
        table: 'users', indexName: 'posts_user_id'
    );
});
```

제약조건의 "on delete", "on update" 행동도 아래처럼 지정할 수 있습니다.

```
$table->foreignId('user_id')
      ->constrained()
      ->onUpdate('cascade')
      ->onDelete('cascade');
```

이러한 동작을 위한 더욱 명시적이고 직관적인 문법도 제공됩니다.

| Method                        | Description                                        |
|-------------------------------|---------------------------------------------------|
| `$table->cascadeOnUpdate();`  | 업데이트시 연결된 데이터도 함께 수정됩니다.             |
| `$table->restrictOnUpdate();` | 업데이트가 제한됩니다.                               |
| `$table->noActionOnUpdate();` | 업데이트 시 별도의 동작이 없습니다.                  |
| `$table->cascadeOnDelete();`  | 삭제 시 연결된 데이터도 함께 삭제됩니다.              |
| `$table->restrictOnDelete();` | 삭제가 제한됩니다.                                 |
| `$table->nullOnDelete();`     | 삭제 시 외래 키 값을 null로 설정합니다.              |

추가적인 [컬럼 수정자](#column-modifiers)는 반드시 `constrained` 메서드 전에 호출해야 합니다.

```
$table->foreignId('user_id')
      ->nullable()
      ->constrained();
```

<a name="dropping-foreign-keys"></a>
#### 외래 키 삭제하기

외래 키를 삭제하려면, 삭제할 외래 키 제약조건명을 `dropForeign` 메서드에 인수로 전달하면 됩니다. 외래 키 제약조건명은 인덱스와 같은 규칙을 따르며, 테이블명-컬럼명_조합 뒤에 "\_foreign"이 붙는 형태입니다.

```
$table->dropForeign('posts_user_id_foreign');
```

또 다른 방법으로, 외래 키를 보유한 컬럼명을 배열로 전달해도 라라벨의 규칙에 따라 제약조건명이 생성되어 삭제됩니다.

```
$table->dropForeign(['user_id']);
```

<a name="toggling-foreign-key-constraints"></a>
#### 외래 키 제약조건 ON/OFF 전환

마이그레이션 내에서 아래 메서드로 외래 키 제약조건을 전역적으로 활성화하거나 비활성화할 수 있습니다.

```
Schema::enableForeignKeyConstraints();

Schema::disableForeignKeyConstraints();

Schema::withoutForeignKeyConstraints(function () {
    // 이 클로저 내부에서는 제약조건이 비활성화됩니다...
});
```

> [!WARNING]
> SQLite는 기본적으로 외래 키 제약조건이 비활성화되어 있습니다. SQLite를 사용할 경우, 마이그레이션에서 외래 키를 생성하기 전에 [외래 키 지원](/docs/10.x/database#configuration)이 데이터베이스 설정에 활성화되어 있는지 반드시 확인하십시오. 또한, SQLite는 테이블 생성 시에만 외래 키 제약조건을 지원하며, [테이블 수정 시에는 지원하지 않습니다](https://www.sqlite.org/omitted.html).

<a name="events"></a>
## 이벤트

각 마이그레이션 작업은 [이벤트](/docs/10.x/events)를 자동으로 디스패치(dispatch)합니다. 아래 이벤트들은 모두 기본 클래스인 `Illuminate\Database\Events\MigrationEvent`를 상속합니다.

 Class | Description
-------|-------
| `Illuminate\Database\Events\MigrationsStarted` | 여러 개의 마이그레이션 실행이 곧 시작됨을 알립니다. |
| `Illuminate\Database\Events\MigrationsEnded` | 여러 개의 마이그레이션 실행이 모두 완료되었음을 알립니다. |
| `Illuminate\Database\Events\MigrationStarted` | 단일 마이그레이션 시작 직전 이벤트입니다. |
| `Illuminate\Database\Events\MigrationEnded` | 단일 마이그레이션 종료 후 이벤트입니다. |
| `Illuminate\Database\Events\SchemaDumped` | 데이터베이스 스키마 덤프가 완료되었음을 알립니다. |
| `Illuminate\Database\Events\SchemaLoaded` | 기존 데이터베이스 스키마 덤프가 로드되었음을 알립니다. |