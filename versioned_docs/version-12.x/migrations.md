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

마이그레이션(Migration)은 데이터베이스의 버전 관리를 가능하게 해주는 도구로, 팀원들과 애플리케이션의 데이터베이스 스키마 정의를 쉽고 명확하게 공유할 수 있도록 도와줍니다. 만약 소스 컨트롤에서 코드를 받아온 팀원에게 로컬 데이터베이스 스키마에 특정 컬럼을 직접 추가해달라고 안내한 경험이 있다면, 이것이 바로 마이그레이션이 해결하는 문제입니다.

라라벨의 `Schema` [파사드](/docs/12.x/facades)는 모든 라라벨 지원 데이터베이스 시스템에서 테이블을 생성 및 수정할 때 데이터베이스 종류에 상관없이 동일하게 사용할 수 있도록 지원합니다. 일반적으로 마이그레이션에서는 이 파사드를 활용하여 데이터베이스 테이블과 컬럼을 추가하거나 변경합니다.

<a name="generating-migrations"></a>
## 마이그레이션 생성

데이터베이스 마이그레이션을 생성하려면 `make:migration` [Artisan 명령어](/docs/12.x/artisan)를 사용하면 됩니다. 새로 생성된 마이그레이션 파일은 `database/migrations` 디렉터리에 저장되며, 각 마이그레이션 파일명에는 타임스탬프가 포함되어 라라벨이 마이그레이션 실행 순서를 올바르게 판별할 수 있습니다.

```shell
php artisan make:migration create_flights_table
```

라라벨은 마이그레이션 파일의 이름을 분석하여 테이블 이름과 해당 마이그레이션이 새 테이블을 생성하는지 예측하려고 시도합니다. 만약 마이그레이션 이름에서 테이블 이름을 파악할 수 있다면, 라라벨이 해당 테이블 이름을 미리 생성 코드에 채워줍니다. 그렇지 않은 경우 마이그레이션 파일에서 직접 테이블 이름을 지정하면 됩니다.

마이그레이션 파일을 특정 경로에 생성하고 싶다면, `make:migration` 실행 시 `--path` 옵션을 사용할 수 있습니다. 여기서 지정하는 경로는 애플리케이션의 기본 경로를 기준으로 한 상대 경로여야 합니다.

> [!NOTE]
> 마이그레이션 스텁 파일은 [스텁 퍼블리싱](/docs/12.x/artisan#stub-customization) 기능을 통해 커스터마이즈할 수 있습니다.

<a name="squashing-migrations"></a>
### 마이그레이션 스쿼싱

애플리케이션이 발전하면서 시간이 지남에 따라 `database/migrations` 디렉터리에 수백 개의 마이그레이션 파일이 누적될 수 있습니다. 이러한 경우, 필요하다면 마이그레이션 파일들을 하나의 SQL 파일로 "스쿼싱(합치기)"할 수 있습니다. 이 기능을 사용하려면 `schema:dump` 명령어를 실행하세요.

```shell
php artisan schema:dump

# 현재 데이터베이스 스키마를 덤프하고 기존 마이그레이션을 정리...
php artisan schema:dump --prune
```

이 명령어를 실행하면 라라벨은 애플리케이션의 `database/schema` 디렉터리에 "스키마" 파일을 작성합니다. 이 파일의 이름은 데이터베이스 커넥션에 맞게 지정됩니다. 이제 데이터베이스에 아무런 마이그레이션이 실행된 이력이 없는 경우, 라라벨은 해당 커넥션의 스키마 파일에 포함된 SQL 문을 먼저 실행합니다. 이후, 이 스키마 덤프에 포함되지 않은 나머지 마이그레이션만 추가로 실행됩니다.

만약 테스트에서 로컬 개발과는 다른 데이터베이스 커넥션을 사용한다면, 해당 커넥션에 맞게 스키마 파일도 반드시 덤프해두어야 테스트 시 데이터베이스 생성이 정확히 이뤄집니다. 따라서, 로컬 개발용 데이터베이스 스키마를 덤프한 후, 테스트용 데이터베이스 커넥션도 추가로 덤프하는 것이 좋습니다.

```shell
php artisan schema:dump
php artisan schema:dump --database=testing --prune
```

데이터베이스 스키마 파일은 반드시 소스 컨트롤에 커밋하여 다른 팀원이 빠르게 초기 데이터베이스 구조를 구성할 수 있도록 해야 합니다.

> [!WARNING]
> 마이그레이션 스쿼싱 기능은 MariaDB, MySQL, PostgreSQL, SQLite 데이터베이스에서만 사용할 수 있으며, 데이터베이스의 커맨드라인 클라이언트를 활용합니다.

<a name="migration-structure"></a>
## 마이그레이션 구조

마이그레이션 클래스에는 `up`과 `down` 두 가지 메서드가 포함되어 있습니다. `up` 메서드는 새로운 테이블, 컬럼, 인덱스 등을 데이터베이스에 추가할 때 사용하며, `down` 메서드는 `up`에서 수행한 작업을 반대로 되돌릴 때 사용합니다.

이 두 메서드 내부에서는 라라벨 스키마 빌더를 활용해 다양한 방식으로 테이블을 생성하거나 수정할 수 있습니다. `Schema` 빌더에서 제공하는 모든 메서드는 [해당 문서](#creating-tables)에서 확인할 수 있습니다. 다음은 `flights` 테이블을 생성하는 예시입니다.

```php
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
#### 마이그레이션 커넥션 설정

마이그레이션이 애플리케이션의 기본 데이터베이스 커넥션이 아닌 다른 커넥션을 사용해야 하는 경우, 마이그레이션 클래스의 `$connection` 속성을 설정해주어야 합니다.

```php
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

<a name="skipping-migrations"></a>
#### 마이그레이션 건너뛰기

특정 마이그레이션이 아직 활성화되지 않은 기능을 지원하기 위해 작성되어, 당장 실행하고 싶지 않은 경우가 있습니다. 이럴 때는 마이그레이션 클래스에 `shouldRun` 메서드를 정의할 수 있습니다. 이 메서드가 `false`를 반환하면 해당 마이그레이션은 스킵됩니다.

```php
use App\Models\Flights;
use Laravel\Pennant\Feature;

/**
 * Determine if this migration should run.
 */
public function shouldRun(): bool
{
    return Feature::active(Flights::class);
}
```

<a name="running-migrations"></a>
## 마이그레이션 실행

지금까지 생성된 모든 마이그레이션을 실행하려면 `migrate` Artisan 명령어를 사용합니다.

```shell
php artisan migrate
```

현재까지 실행된 마이그레이션 목록을 보고 싶다면 `migrate:status` Artisan 명령어를 사용할 수 있습니다.

```shell
php artisan migrate:status
```

마이그레이션을 실제로 실행하지 않고, 어떤 SQL 문이 실행될지 미리 보고 싶다면 `migrate` 명령어에 `--pretend` 플래그를 추가하면 됩니다.

```shell
php artisan migrate --pretend
```

#### 마이그레이션 실행 격리

여러 서버에 애플리케이션을 배포하고, 배포 과정에서 마이그레이션을 실행하는 경우라면, 동시에 두 서버에서 데이터베이스 마이그레이션이 충돌하지 않도록 해야 합니다. 이럴 때는 `migrate` 명령을 실행할 때 `isolated` 옵션을 사용할 수 있습니다.

`isolated` 옵션이 지정되면, 라라벨은 마이그레이션 실행 전에 애플리케이션의 캐시 드라이버를 이용해 원자적(atomic) 락을 획득합니다. 락이 잡혀있는 동안 다른 모든 `migrate` 명령 시도는 실제로 실행되지 않지만, 명령어 자체는 정상적으로 종료됩니다.

```shell
php artisan migrate --isolated
```

> [!WARNING]
> 이 기능을 사용하려면 앱의 기본 캐시 드라이버로 `memcached`, `redis`, `dynamodb`, `database`, `file`, `array` 중 하나를 사용해야 합니다. 또한 서버들이 반드시 동일한 중앙 캐시 서버와 통신해야 합니다.

<a name="forcing-migrations-to-run-in-production"></a>
#### 운영 환경에서 강제로 마이그레이션 실행

마이그레이션 작업 중 일부는 파괴적(destructive)이어서 데이터 손실을 유발할 수 있습니다. 이를 방지하기 위해 운영 데이터베이스에서 위험한 명령을 실행하면 커맨드 실행 전 확인 메시지가 출력됩니다. 하지만 아무런 확인 없이 강제로 실행하려면 `--force` 플래그를 사용하세요.

```shell
php artisan migrate --force
```

<a name="rolling-back-migrations"></a>
### 마이그레이션 롤백

가장 최근에 실행한 마이그레이션 작업을 되돌리려면 `rollback` Artisan 명령어를 사용하면 됩니다. 이 명령은 하나의 "배치(batch)"에 해당하는 여러 마이그레이션 파일을 한 번에 롤백합니다.

```shell
php artisan migrate:rollback
```

`step` 옵션을 사용하면 원하는 개수만큼의 마이그레이션만 롤백할 수 있습니다. 예를 들어 다음 명령은 최근 5개의 마이그레이션을 롤백합니다.

```shell
php artisan migrate:rollback --step=5
```

특정 "배치(batch)"의 마이그레이션만 롤백하려면 `batch` 옵션을 사용할 수 있습니다. `batch` 값은 애플리케이션의 `migrations` 데이터베이스 테이블의 값과 동일해야 합니다. 다음 예시는 배치 3에 속한 모든 마이그레이션을 롤백합니다.

```shell
php artisan migrate:rollback --batch=3
```

실제 롤백을 수행하지 않고, 어떤 SQL 문이 실행될지 미리 보고 싶다면 `migrate:rollback` 명령에 `--pretend` 플래그를 추가하세요.

```shell
php artisan migrate:rollback --pretend
```

`migrate:reset` 명령을 사용하면 애플리케이션의 모든 마이그레이션을 일괄 롤백할 수 있습니다.

```shell
php artisan migrate:reset
```

<a name="roll-back-migrate-using-a-single-command"></a>
#### 롤백과 마이그레이션을 한번에 실행

`migrate:refresh` 명령은 모든 마이그레이션을 롤백한 뒤 다시 실행합니다. 이 명령으로 데이터베이스 전체를 다시 생성할 수 있습니다.

```shell
php artisan migrate:refresh

# 데이터베이스를 새로 생성하고 모든 시드(seed) 실행...
php artisan migrate:refresh --seed
```

또한, `refresh` 명령의 `step` 옵션을 통해 지정한 개수만큼만 롤백 및 다시 마이그레이션할 수 있습니다. 예를 들어, 최근 5개의 마이그레이션만 롤백 후 재실행하려면 아래와 같이 실행합니다.

```shell
php artisan migrate:refresh --step=5
```

<a name="drop-all-tables-migrate"></a>
#### 모든 테이블 삭제 후 마이그레이션

`migrate:fresh` 명령은 데이터베이스의 모든 테이블을 삭제한 뒤, 마이그레이션을 새로 실행합니다.

```shell
php artisan migrate:fresh

php artisan migrate:fresh --seed
```

기본적으로 `migrate:fresh` 명령은 기본 데이터베이스 커넥션에만 적용됩니다. 다른 데이터베이스 커넥션에서 마이그레이션을 실행하려면 `--database` 옵션을 추가하고, 그 값은 애플리케이션의 `database` [설정 파일](/docs/12.x/configuration)에 정의된 커넥션명이어야 합니다.

```shell
php artisan migrate:fresh --database=admin
```

> [!WARNING]
> `migrate:fresh` 명령은 모든 테이블을 접두사와 관계없이 삭제하므로, 다른 애플리케이션과 데이터베이스를 공유하는 경우 주의해서 사용하십시오.

<a name="tables"></a>
## 테이블

<a name="creating-tables"></a>
### 테이블 생성

새 데이터베이스 테이블을 생성하려면 `Schema` 파사드의 `create` 메서드를 사용하세요. `create` 메서드는 첫 번째 인수로 테이블 이름을, 두 번째 인수로는 무명 함수(클로저)를 받는데, 이 함수에게는 새 테이블의 구조를 정의할 수 있는 `Blueprint` 객체가 전달됩니다.

```php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email');
    $table->timestamps();
});
```

테이블 생성 시에는 스키마 빌더의 [컬럼 메서드](#creating-columns)를 사용해 테이블의 컬럼을 다양하게 정의할 수 있습니다.

<a name="determining-table-column-existence"></a>
#### 테이블 및 컬럼 존재 여부 확인

테이블, 컬럼, 인덱스의 존재 여부를 확인하려면 `hasTable`, `hasColumn`, `hasIndex` 메서드를 사용할 수 있습니다.

```php
if (Schema::hasTable('users')) {
    // "users" 테이블이 존재합니다...
}

if (Schema::hasColumn('users', 'email')) {
    // "users" 테이블이 존재하며 "email" 컬럼도 존재합니다...
}

if (Schema::hasIndex('users', ['email'], 'unique')) {
    // "users" 테이블에 "email" 컬럼에 대한 unique 인덱스가 존재합니다...
}
```

<a name="database-connection-table-options"></a>
#### 데이터베이스 커넥션 및 테이블 옵션

기본 데이터베이스 커넥션이 아닌 다른 커넥션에서 스키마 작업을 수행하려면 `connection` 메서드를 사용하면 됩니다.

```php
Schema::connection('sqlite')->create('users', function (Blueprint $table) {
    $table->id();
});
```

이 외에도, 테이블 생성의 다양한 옵션을 정의할 수 있는 속성과 메서드들이 있습니다. MariaDB 또는 MySQL을 사용할 때 테이블 엔진을 지정하려면 `engine` 속성을 사용하세요.

```php
Schema::create('users', function (Blueprint $table) {
    $table->engine('InnoDB');

    // ...
});
```

MariaDB나 MySQL에서 생성되는 테이블의 문자 집합이나 정렬 조건(collation)을 지정하려면 `charset`과 `collation` 속성을 사용하면 됩니다.

```php
Schema::create('users', function (Blueprint $table) {
    $table->charset('utf8mb4');
    $table->collation('utf8mb4_unicode_ci');

    // ...
});
```

테이블을 "임시(temporary)"로 지정하고 싶다면 `temporary` 메서드를 사용할 수 있습니다. 임시 테이블은 현재 커넥션 세션에서만 보이고 커넥션이 종료되면 자동으로 삭제됩니다.

```php
Schema::create('calculations', function (Blueprint $table) {
    $table->temporary();

    // ...
});
```

데이터베이스 테이블에 "설명(comment)"을 남기고 싶을 때는, 테이블 인스턴스에서 `comment` 메서드를 호출하면 됩니다. 테이블 설명 기능은 현재 MariaDB, MySQL, PostgreSQL에서만 지원됩니다.

```php
Schema::create('calculations', function (Blueprint $table) {
    $table->comment('Business calculations');

    // ...
});
```

<a name="updating-tables"></a>
### 테이블 수정

기존 테이블을 수정하려면 `Schema` 파사드의 `table` 메서드를 사용하세요. `create`와 마찬가지로, 첫 번째 인수는 테이블 이름, 두 번째 인수는 컬럼이나 인덱스 추가 등에 사용할 수 있는 `Blueprint` 인스턴스가 주어집니다.

```php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('users', function (Blueprint $table) {
    $table->integer('votes');
});
```

<a name="renaming-and-dropping-tables"></a>
### 테이블 이름 변경/삭제

기존 데이터베이스 테이블의 이름을 변경하려면 `rename` 메서드를 사용하면 됩니다.

```php
use Illuminate\Support\Facades\Schema;

Schema::rename($from, $to);
```

테이블을 삭제하려면 `drop` 또는 `dropIfExists` 메서드를 사용하세요.

```php
Schema::drop('users');

Schema::dropIfExists('users');
```

<a name="renaming-tables-with-foreign-keys"></a>
#### 외래 키가 있는 테이블 이름 변경 시 주의

테이블 이름을 변경하기 전에는 마이그레이션 파일에서 외래 키 제약조건의 이름을 반드시 명시적으로 지정했는지 확인해야 합니다. 만약 라라벨이 관례에 따라 이름을 자동으로 지정했다면, 외래 키 제약조건의 이름이 기존 테이블 이름을 참조할 수 있기 때문입니다.

<a name="columns"></a>
## 컬럼

<a name="creating-columns"></a>
### 컬럼 생성

기존 테이블에 컬럼을 추가하려면 `Schema` 파사드의 `table` 메서드를 사용하면 됩니다. 이 메서드는 `create`와 동일하게, 첫 번째 인수는 테이블 이름, 두 번째 인수는 `Illuminate\Database\Schema\Blueprint` 인스턴스를 받아 컬럼 추가를 수행합니다.

```php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('users', function (Blueprint $table) {
    $table->integer('votes');
});
```

<a name="available-column-types"></a>
### 사용 가능한 컬럼 타입

스키마 빌더의 블루프린트(Blueprint)에서는 데이터베이스 테이블에 추가할 수 있는 다양한 컬럼 타입을 메서드 형태로 제공합니다. 아래 표에서 각 타입별로 사용할 수 있는 메서드를 확인할 수 있습니다.

<a name="booleans-method-list"></a>
#### 불리언(Boolean) 타입

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
#### 숫자(Number) 타입

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
#### 날짜 및 시간(Date & Time) 타입

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
#### 바이너리(Binary) 타입

<div class="collection-method-list" markdown="1">

[binary](#column-method-binary)

</div>

<a name="object-and-jsons-method-list"></a>
#### 객체 및 JSON 타입

<div class="collection-method-list" markdown="1">

[json](#column-method-json)
[jsonb](#column-method-jsonb)

</div>

<a name="uuids-and-ulids-method-list"></a>
#### UUID 및 ULID 타입

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

#### 연관관계(Relationship) 타입

<div class="collection-method-list" markdown="1">

[foreignId](#column-method-foreignId)
[foreignIdFor](#column-method-foreignIdFor)
[foreignUlid](#column-method-foreignUlid)
[foreignUuid](#column-method-foreignUuid)
[morphs](#column-method-morphs)
[nullableMorphs](#column-method-nullableMorphs)

</div>

<a name="spacifics-method-list"></a>
#### 특수(Specialty) 타입

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

`bigIncrements` 메서드는 자동 증가하는 `UNSIGNED BIGINT`(기본 키) 타입의 컬럼을 생성합니다.

```php
$table->bigIncrements('id');
```

<a name="column-method-bigInteger"></a>
#### `bigInteger()`

`bigInteger` 메서드는 `BIGINT` 타입에 해당하는 컬럼을 생성합니다.

```php
$table->bigInteger('votes');
```

<a name="column-method-binary"></a>
#### `binary()`

`binary` 메서드는 `BLOB` 타입에 해당하는 컬럼을 생성합니다.

```php
$table->binary('photo');
```

MySQL, MariaDB, SQL Server를 사용할 때는 `length`와 `fixed` 인수를 전달하여 `VARBINARY` 또는 `BINARY` 타입의 컬럼을 만들 수 있습니다.

```php
$table->binary('data', length: 16); // VARBINARY(16)

$table->binary('data', length: 16, fixed: true); // BINARY(16)
```

<a name="column-method-boolean"></a>
#### `boolean()`

`boolean` 메서드는 `BOOLEAN` 타입에 해당하는 컬럼을 생성합니다.

```php
$table->boolean('confirmed');
```

<a name="column-method-char"></a>
#### `char()`

`char` 메서드는 지정한 길이만큼의 `CHAR` 타입 컬럼을 생성합니다.

```php
$table->char('name', length: 100);
```

<a name="column-method-dateTimeTz"></a>
#### `dateTimeTz()`

`dateTimeTz` 메서드는 선택적으로 소수 초 정밀도를 지정할 수 있는, 타임존 정보가 포함된 `DATETIME` 타입에 해당하는 컬럼을 생성합니다.

```php
$table->dateTimeTz('created_at', precision: 0);
```

<a name="column-method-dateTime"></a>
#### `dateTime()`

`dateTime` 메서드는 선택적으로 소수 초 정밀도를 지정할 수 있는 `DATETIME` 타입 컬럼을 생성합니다.

```php
$table->dateTime('created_at', precision: 0);
```

<a name="column-method-date"></a>
#### `date()`

`date` 메서드는 `DATE` 타입에 해당하는 컬럼을 생성합니다.

```php
$table->date('created_at');
```

<a name="column-method-decimal"></a>
#### `decimal()`

`decimal` 메서드는 지정한 정밀도(전체 자릿수)와 소수점 자릿수(scale)를 가진 `DECIMAL` 타입의 컬럼을 생성합니다.

```php
$table->decimal('amount', total: 8, places: 2);
```

<a name="column-method-double"></a>
#### `double()`

`double` 메서드는 `DOUBLE` 타입에 해당하는 컬럼을 생성합니다.

```php
$table->double('amount');
```

<a name="column-method-enum"></a>
#### `enum()`

`enum` 메서드는 지정한 유효한 값 목록을 가지는 `ENUM` 타입의 컬럼을 생성합니다.

```php
$table->enum('difficulty', ['easy', 'hard']);
```

<a name="column-method-float"></a>
#### `float()`

`float` 메서드는 지정한 정밀도를 가진 `FLOAT` 타입 컬럼을 생성합니다.

```php
$table->float('amount', precision: 53);
```

<a name="column-method-foreignId"></a>
#### `foreignId()`

`foreignId` 메서드는 `UNSIGNED BIGINT` 타입의 컬럼을 생성합니다.

```php
$table->foreignId('user_id');
```

<a name="column-method-foreignIdFor"></a>
#### `foreignIdFor()`

`foreignIdFor` 메서드는 지정한 모델 클래스의 키 타입에 따라 `{column}_id` 형태의 컬럼을 추가합니다. 실제로 생성되는 컬럼 타입은 모델의 키 타입별로 `UNSIGNED BIGINT`, `CHAR(36)`, `CHAR(26)` 중 하나입니다.

```php
$table->foreignIdFor(User::class);
```

<a name="column-method-foreignUlid"></a>
#### `foreignUlid()`

`foreignUlid` 메서드는 `ULID` 타입에 해당하는 컬럼을 생성합니다.

```php
$table->foreignUlid('user_id');
```

<a name="column-method-foreignUuid"></a>
#### `foreignUuid()`

`foreignUuid` 메서드는 `UUID` 타입에 해당하는 컬럼을 생성합니다.

```php
$table->foreignUuid('user_id');
```

<a name="column-method-geography"></a>
#### `geography()`

`geography` 메서드는 지정한 공간 타입과 SRID(Spatial Reference System Identifier)를 갖는 `GEOGRAPHY` 타입 컬럼을 생성합니다.

```php
$table->geography('coordinates', subtype: 'point', srid: 4326);
```

> [!NOTE]
> 공간(Spatial) 타입 지원 여부는 사용 중인 데이터베이스 드라이버에 따라 다릅니다. 각 데이터베이스의 문서를 참고하세요. PostgreSQL을 사용하는 경우, `geography` 메서드를 사용하기 전에 [PostGIS](https://postgis.net) 확장 프로그램을 설치해야 합니다.

<a name="column-method-geometry"></a>
#### `geometry()`

`geometry` 메서드는 지정한 공간 타입과 SRID(Spatial Reference System Identifier)를 갖는 `GEOMETRY` 타입 컬럼을 생성합니다.

```php
$table->geometry('positions', subtype: 'point', srid: 0);
```

> [!NOTE]
> 공간(Spatial) 타입 지원 여부는 사용 중인 데이터베이스 드라이버에 따라 다릅니다. 각 데이터베이스의 문서를 참고하세요. PostgreSQL을 사용하는 경우, `geometry` 메서드를 사용하기 전에 [PostGIS](https://postgis.net) 확장 프로그램을 설치해야 합니다.

<a name="column-method-id"></a>
#### `id()`

`id` 메서드는 `bigIncrements` 메서드의 별칭입니다. 기본적으로는 `id` 컬럼을 생성하지만, 컬럼 이름을 변경하고 싶은 경우 직접 이름을 전달할 수도 있습니다.

```php
$table->id();
```

<a name="column-method-increments"></a>
#### `increments()`

`increments` 메서드는 자동 증가하는 `UNSIGNED INTEGER` 타입의 기본 키 컬럼을 생성합니다.

```php
$table->increments('id');
```

<a name="column-method-integer"></a>
#### `integer()`

`integer` 메서드는 `INTEGER` 타입에 해당하는 컬럼을 생성합니다.

```php
$table->integer('votes');
```

<a name="column-method-ipAddress"></a>
#### `ipAddress()`

`ipAddress` 메서드는 `VARCHAR` 타입에 해당하는 컬럼을 생성합니다.

```php
$table->ipAddress('visitor');
```

PostgreSQL을 사용할 경우에는 `INET` 타입의 컬럼이 생성됩니다.

<a name="column-method-json"></a>
#### `json()`

`json` 메서드는 `JSON` 타입에 해당하는 컬럼을 생성합니다.

```php
$table->json('options');
```

SQLite를 사용할 경우 `TEXT` 컬럼이 생성됩니다.

<a name="column-method-jsonb"></a>
#### `jsonb()`

`jsonb` 메서드는 `JSONB` 타입에 해당하는 컬럼을 생성합니다.

```php
$table->jsonb('options');
```

SQLite에서는 `TEXT` 컬럼이 생성됩니다.

<a name="column-method-longText"></a>
#### `longText()`

`longText` 메서드는 `LONGTEXT` 타입에 해당하는 컬럼을 생성합니다.

```php
$table->longText('description');
```

MySQL이나 MariaDB를 사용한다면 컬럼에 `binary` 문자셋을 적용하면 `LONGBLOB` 컬럼을 생성할 수 있습니다.

```php
$table->longText('data')->charset('binary'); // LONGBLOB
```

<a name="column-method-macAddress"></a>
#### `macAddress()`

`macAddress` 메서드는 MAC 주소를 저장하기 위한 컬럼을 생성합니다. PostgreSQL 등 일부 데이터베이스는 전용 타입을 제공하며, 그 외의 데이터베이스는 문자열 타입 컬럼을 사용합니다.

```php
$table->macAddress('device');
```

<a name="column-method-mediumIncrements"></a>
#### `mediumIncrements()`

`mediumIncrements` 메서드는 자동 증가하는 `UNSIGNED MEDIUMINT` 타입의 기본 키 컬럼을 생성합니다.

```php
$table->mediumIncrements('id');
```

<a name="column-method-mediumInteger"></a>
#### `mediumInteger()`

`mediumInteger` 메서드는 `MEDIUMINT` 타입에 해당하는 컬럼을 생성합니다.

```php
$table->mediumInteger('votes');
```

<a name="column-method-mediumText"></a>
#### `mediumText()`

`mediumText` 메서드는 `MEDIUMTEXT` 타입에 해당하는 컬럼을 생성합니다.

```php
$table->mediumText('description');
```

MySQL이나 MariaDB를 사용할 때 컬럼에 `binary` 문자셋을 적용하면 `MEDIUMBLOB` 컬럼을 생성할 수 있습니다.

```php
$table->mediumText('data')->charset('binary'); // MEDIUMBLOB
```

<a name="column-method-morphs"></a>
#### `morphs()`

`morphs` 메서드는 `{column}_id` 컬럼과 `{column}_type` `VARCHAR` 컬럼을 함께 생성하는 편의 메서드입니다. `{column}_id` 컬럼의 타입은 모델의 키 타입에 따라 `UNSIGNED BIGINT`, `CHAR(36)`, `CHAR(26)` 중 하나가 됩니다.

이 메서드는 다형성 [Eloquent 연관관계](/docs/12.x/eloquent-relationships)에 필요한 컬럼을 정의할 때 사용합니다. 아래 예시에서는 `taggable_id`와 `taggable_type` 컬럼이 생성됩니다.

```php
$table->morphs('taggable');
```

<a name="column-method-nullableMorphs"></a>
#### `nullableMorphs()`

이 메서드는 [morphs](#column-method-morphs) 메서드와 유사하지만, 생성되는 컬럼이 "nullable"로 지정됩니다.

```php
$table->nullableMorphs('taggable');
```

<a name="column-method-nullableUlidMorphs"></a>
#### `nullableUlidMorphs()`

이 메서드는 [ulidMorphs](#column-method-ulidMorphs) 메서드와 유사하지만, 생성되는 컬럼이 "nullable"로 지정됩니다.

```php
$table->nullableUlidMorphs('taggable');
```

<a name="column-method-nullableUuidMorphs"></a>
#### `nullableUuidMorphs()`

이 메서드는 [uuidMorphs](#column-method-uuidMorphs) 메서드와 유사하지만, 생성되는 컬럼이 "nullable"로 지정됩니다.

```php
$table->nullableUuidMorphs('taggable');
```

<a name="column-method-rememberToken"></a>
#### `rememberToken()`

`rememberToken` 메서드는 로그인 유지(remember me) [인증 토큰](/docs/12.x/authentication#remembering-users)을 저장하는 용도의, nullable한 `VARCHAR(100)` 컬럼을 생성합니다.

```php
$table->rememberToken();
```

<a name="column-method-set"></a>
#### `set()`

`set` 메서드는 지정한 유효 값 목록으로 구성된 `SET` 타입 컬럼을 생성합니다.

```php
$table->set('flavors', ['strawberry', 'vanilla']);
```

<a name="column-method-smallIncrements"></a>
#### `smallIncrements()`

`smallIncrements` 메서드는 자동 증가하는 `UNSIGNED SMALLINT` 타입의 기본 키 컬럼을 생성합니다.

```php
$table->smallIncrements('id');
```

<a name="column-method-smallInteger"></a>
#### `smallInteger()`

`smallInteger` 메서드는 `SMALLINT` 타입에 해당하는 컬럼을 생성합니다.

```php
$table->smallInteger('votes');
```

<a name="column-method-softDeletesTz"></a>
#### `softDeletesTz()`

`softDeletesTz` 메서드는 nullable한 `deleted_at` `TIMESTAMP`(타임존 포함) 타입의 컬럼을 소수 초 정밀도 옵션과 함께 추가합니다. 이 컬럼은 Eloquent의 "소프트 삭제" 기능을 위해 `deleted_at` 타임스탬프 값을 저장하는 용도입니다.

```php
$table->softDeletesTz('deleted_at', precision: 0);
```

<a name="column-method-softDeletes"></a>
#### `softDeletes()`

`softDeletes` 메서드는 nullable한 `deleted_at` `TIMESTAMP` 타입 컬럼을 소수 초 정밀도 옵션과 함께 추가합니다. 이 컬럼은 Eloquent의 "소프트 삭제" 기능에서 `deleted_at` 타임스탬프를 저장하는 데 사용됩니다.

```php
$table->softDeletes('deleted_at', precision: 0);
```

<a name="column-method-string"></a>
#### `string()`

`string` 메서드는 지정한 길이만큼의 `VARCHAR` 타입 컬럼을 생성합니다.

```php
$table->string('name', length: 100);
```

<a name="column-method-text"></a>
#### `text()`

`text` 메서드는 `TEXT` 타입에 해당하는 컬럼을 생성합니다.

```php
$table->text('description');
```

MySQL이나 MariaDB를 사용할 때 컬럼에 `binary` 문자셋을 적용하면 `BLOB` 컬럼을 생성할 수 있습니다.

```php
$table->text('data')->charset('binary'); // BLOB
```

<a name="column-method-timeTz"></a>
#### `timeTz()`

`timeTz` 메서드는 선택적으로 소수 초 정밀도를 지정할 수 있는, 타임존 정보가 포함된 `TIME` 타입에 해당하는 컬럼을 생성합니다.

```php
$table->timeTz('sunrise', precision: 0);
```

<a name="column-method-time"></a>
#### `time()`

`time` 메서드는 선택적으로 소수 초 정밀도를 지정할 수 있는 `TIME` 타입 컬럼을 생성합니다.

```php
$table->time('sunrise', precision: 0);
```

<a name="column-method-timestampTz"></a>
#### `timestampTz()`

`timestampTz` 메서드는 선택적으로 소수 초 정밀도를 지정할 수 있는, 타임존 정보가 포함된 `TIMESTAMP` 타입의 컬럼을 생성합니다.

```php
$table->timestampTz('added_at', precision: 0);
```

<a name="column-method-timestamp"></a>
#### `timestamp()`

`timestamp` 메서드는 선택적으로 소수 초 정밀도를 설정할 수 있는 `TIMESTAMP` 타입에 해당하는 컬럼을 생성합니다.

```php
$table->timestamp('added_at', precision: 0);
```

<a name="column-method-timestampsTz"></a>
#### `timestampsTz()`

`timestampsTz` 메서드는 `created_at`과 `updated_at` 두 컬럼을 생성하며, 이 두 컬럼 모두 타임존이 포함된 `TIMESTAMP` 타입으로, 선택적으로 소수 초 정밀도를 지정할 수 있습니다.

```php
$table->timestampsTz(precision: 0);
```

<a name="column-method-timestamps"></a>
#### `timestamps()`

`timestamps` 메서드는 `created_at`과 `updated_at` 두 `TIMESTAMP` 타입 컬럼을 생성하며, 선택적으로 소수 초 정밀도를 지정할 수 있습니다.

```php
$table->timestamps(precision: 0);
```

<a name="column-method-tinyIncrements"></a>
#### `tinyIncrements()`

`tinyIncrements` 메서드는 자동 증가하는 `UNSIGNED TINYINT` 타입의 기본 키 컬럼을 생성합니다.

```php
$table->tinyIncrements('id');
```

<a name="column-method-tinyInteger"></a>
#### `tinyInteger()`

`tinyInteger` 메서드는 `TINYINT` 타입에 해당하는 컬럼을 생성합니다.

```php
$table->tinyInteger('votes');
```

<a name="column-method-tinyText"></a>
#### `tinyText()`

`tinyText` 메서드는 `TINYTEXT` 타입에 해당하는 컬럼을 생성합니다.

```php
$table->tinyText('notes');
```

MySQL이나 MariaDB를 사용할 때 컬럼에 `binary` 문자셋을 적용하면 `TINYBLOB` 컬럼을 생성할 수 있습니다.

```php
$table->tinyText('data')->charset('binary'); // TINYBLOB
```

<a name="column-method-unsignedBigInteger"></a>
#### `unsignedBigInteger()`

`unsignedBigInteger` 메서드는 `UNSIGNED BIGINT` 타입에 해당하는 컬럼을 생성합니다.

```php
$table->unsignedBigInteger('votes');
```

<a name="column-method-unsignedInteger"></a>
#### `unsignedInteger()`

`unsignedInteger` 메서드는 `UNSIGNED INTEGER` 타입의 컬럼을 생성합니다.

```php
$table->unsignedInteger('votes');
```

<a name="column-method-unsignedMediumInteger"></a>
#### `unsignedMediumInteger()`

`unsignedMediumInteger` 메서드는 `UNSIGNED MEDIUMINT` 타입의 컬럼을 생성합니다.

```php
$table->unsignedMediumInteger('votes');
```

<a name="column-method-unsignedSmallInteger"></a>
#### `unsignedSmallInteger()`

`unsignedSmallInteger` 메서드는 `UNSIGNED SMALLINT` 타입의 컬럼을 생성합니다.

```php
$table->unsignedSmallInteger('votes');
```

<a name="column-method-unsignedTinyInteger"></a>
#### `unsignedTinyInteger()`

`unsignedTinyInteger` 메서드는 `UNSIGNED TINYINT` 타입의 컬럼을 생성합니다.

```php
$table->unsignedTinyInteger('votes');
```

<a name="column-method-ulidMorphs"></a>
#### `ulidMorphs()`

`ulidMorphs` 메서드는 `{column}_id` `CHAR(26)` 타입 컬럼과 `{column}_type` `VARCHAR` 타입 컬럼을 함께 추가하는 편의 메서드입니다.

이 메서드는 ULID 식별자를 사용하는 다형성 [Eloquent 연관관계](/docs/12.x/eloquent-relationships)에 필요한 컬럼을 정의할 때 사용합니다. 아래 예시에서는 `taggable_id`와 `taggable_type` 컬럼이 생성됩니다.

```php
$table->ulidMorphs('taggable');
```

<a name="column-method-uuidMorphs"></a>
#### `uuidMorphs()`

`uuidMorphs` 메서드는 `{column}_id` `CHAR(36)` 타입 컬럼과 `{column}_type` `VARCHAR` 타입 컬럼을 함께 추가하는 편의 메서드입니다.

이 메서드는 UUID 식별자를 사용하는 다형성 [Eloquent 연관관계](/docs/12.x/eloquent-relationships)에 필요한 컬럼을 정의할 때 사용합니다. 아래 예시에서는 `taggable_id`와 `taggable_type` 컬럼이 생성됩니다.

```php
$table->uuidMorphs('taggable');
```

<a name="column-method-ulid"></a>

#### `ulid()`

`ulid` 메서드는 `ULID`와 동등한 컬럼을 생성합니다.

```php
$table->ulid('id');
```

<a name="column-method-uuid"></a>
#### `uuid()`

`uuid` 메서드는 `UUID`와 동등한 컬럼을 생성합니다.

```php
$table->uuid('id');
```

<a name="column-method-vector"></a>
#### `vector()`

`vector` 메서드는 `vector`와 동등한 컬럼을 생성합니다.

```php
$table->vector('embedding', dimensions: 100);
```

<a name="column-method-year"></a>
#### `year()`

`year` 메서드는 `YEAR` 타입에 해당하는 컬럼을 생성합니다.

```php
$table->year('birth_year');
```

<a name="column-modifiers"></a>
### 컬럼 수정자

앞서 소개한 컬럼 타입 외에도, 데이터베이스 테이블에 컬럼을 추가할 때 사용할 수 있는 여러 가지 컬럼 "수정자(modifier)"가 있습니다. 예를 들어, 컬럼을 "널 허용"으로 만들고 싶다면 `nullable` 메서드를 사용할 수 있습니다.

```php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('users', function (Blueprint $table) {
    $table->string('email')->nullable();
});
```

다음 표에는 사용 가능한 모든 컬럼 수정자들이 정리되어 있습니다. ([인덱스 관련 수정자](#creating-indexes)는 포함되어 있지 않습니다.)

<div class="overflow-auto">

| 수정자                                 | 설명                                                                                   |
| ------------------------------------- | -------------------------------------------------------------------------------------- |
| `->after('column')`                   | 컬럼을 다른 컬럼 "뒤"에 배치합니다. (MariaDB / MySQL)                                   |
| `->autoIncrement()`                   | `INTEGER` 컬럼을 자동 증가(Primary Key)로 설정합니다.                                   |
| `->charset('utf8mb4')`                | 컬럼에 사용할 문자셋을 지정합니다. (MariaDB / MySQL)                                    |
| `->collation('utf8mb4_unicode_ci')`   | 컬럼에 사용할 콜레이션을 지정합니다.                                                    |
| `->comment('my comment')`             | 컬럼에 주석을 추가합니다. (MariaDB / MySQL / PostgreSQL)                                |
| `->default($value)`                   | 컬럼의 "기본값"을 지정합니다.                                                           |
| `->first()`                           | 컬럼을 테이블에서 "처음" 위치에 배치합니다. (MariaDB / MySQL)                           |
| `->from($integer)`                    | 자동 증가 필드의 시작 값을 지정합니다. (MariaDB / MySQL / PostgreSQL)                   |
| `->invisible()`                       | 컬럼을 `SELECT *` 쿼리에서 "숨김" 처리합니다. (MariaDB / MySQL)                         |
| `->nullable($value = true)`           | 컬럼에 `NULL` 값 저장을 허용합니다.                                                     |
| `->storedAs($expression)`             | 저장된 계산 컬럼을 생성합니다. (MariaDB / MySQL / PostgreSQL / SQLite)                  |
| `->unsigned()`                        | `INTEGER` 컬럼을 `UNSIGNED`로 설정합니다. (MariaDB / MySQL)                             |
| `->useCurrent()`                      | `TIMESTAMP` 컬럼의 기본값을 `CURRENT_TIMESTAMP`로 설정합니다.                           |
| `->useCurrentOnUpdate()`              | 레코드가 수정될 때 `TIMESTAMP` 컬럼에 `CURRENT_TIMESTAMP`를 저장하도록 설정합니다. (MariaDB / MySQL) |
| `->virtualAs($expression)`            | 가상 생성 컬럼을 생성합니다. (MariaDB / MySQL / SQLite)                                 |
| `->generatedAs($expression)`          | 지정된 시퀀스 옵션으로 식별자 컬럼을 생성합니다. (PostgreSQL)                           |
| `->always()`                          | 식별자 컬럼의 입력 값보다 시퀀스 값이 우선하도록 설정합니다. (PostgreSQL)                |

</div>

<a name="default-expressions"></a>
#### 기본 표현식(Default Expressions)

`default` 수정자는 값 또는 `Illuminate\Database\Query\Expression` 인스턴스를 받을 수 있습니다. `Expression` 인스턴스를 사용하면 값이 따옴표로 감싸지지 않으므로 데이터베이스 전용 함수를 사용할 수 있습니다. 특히 JSON 컬럼에 기본값을 할당할 때 매우 유용합니다.

```php
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
> 기본 표현식 지원 여부는 데이터베이스 드라이버, 데이터베이스 버전, 필드 타입에 따라 다릅니다. 반드시 해당 데이터베이스 공식 문서를 참고하세요.

<a name="column-order"></a>
#### 컬럼 순서 지정

MariaDB 또는 MySQL 데이터베이스를 사용할 때, `after` 메서드로 기존 컬럼 뒤에 새로운 컬럼을 추가할 수 있습니다.

```php
$table->after('password', function (Blueprint $table) {
    $table->string('address_line1');
    $table->string('address_line2');
    $table->string('city');
});
```

<a name="modifying-columns"></a>
### 컬럼 수정하기

`change` 메서드를 사용하면 기존 컬럼의 타입과 속성을 변경할 수 있습니다. 예를 들어, `string` 컬럼의 크기를 늘리고 싶은 경우가 있을 수 있습니다. 아래 예시에서는 `name` 컬럼의 크기를 25에서 50으로 늘려봅니다. 이를 위해 새로운 컬럼 상태를 정의하고, 마지막에 `change` 메서드를 호출하면 됩니다.

```php
Schema::table('users', function (Blueprint $table) {
    $table->string('name', 50)->change();
});
```

컬럼을 수정할 때는, 해당 컬럼에서 유지하고 싶은 모든 수정자(modifier)를 명시적으로 포함시켜야 하며, 지정하지 않은 속성은 사라집니다. 예를 들어, `unsigned`, `default`, `comment` 속성을 유지하려면 각 수정자를 모두 명시해서 변경해야 합니다.

```php
Schema::table('users', function (Blueprint $table) {
    $table->integer('votes')->unsigned()->default(1)->comment('my comment')->change();
});
```

`change` 메서드는 컬럼의 인덱스를 변경하지 않습니다. 인덱스를 새로 추가하거나 제거하려면 인덱스 관련 수정자를 별도로 사용해야 합니다.

```php
// 인덱스 추가...
$table->bigIncrements('id')->primary()->change();

// 인덱스 제거...
$table->char('postal_code', 10)->unique(false)->change();
```

<a name="renaming-columns"></a>
### 컬럼 이름 변경하기

컬럼 이름을 변경하려면, 스키마 빌더가 제공하는 `renameColumn` 메서드를 사용합니다.

```php
Schema::table('users', function (Blueprint $table) {
    $table->renameColumn('from', 'to');
});
```

<a name="dropping-columns"></a>
### 컬럼 삭제하기

컬럼을 삭제하려면, 스키마 빌더의 `dropColumn` 메서드를 사용합니다.

```php
Schema::table('users', function (Blueprint $table) {
    $table->dropColumn('votes');
});
```

여러 컬럼을 한 번에 삭제하려면 `dropColumn` 메서드에 컬럼 이름 배열을 전달하면 됩니다.

```php
Schema::table('users', function (Blueprint $table) {
    $table->dropColumn(['votes', 'avatar', 'location']);
});
```

<a name="available-command-aliases"></a>
#### 사용 가능한 명령어 별칭

라라벨에서는 자주 사용되는 컬럼 타입을 삭제할 때 편리하게 사용할 수 있는 별도의 메서드들도 제공합니다. 주요 메서드는 아래 표와 같습니다.

<div class="overflow-auto">

| 명령어                                   | 설명                                                        |
| ---------------------------------------- | ----------------------------------------------------------- |
| `$table->dropMorphs('morphable');`       | `morphable_id`와 `morphable_type` 컬럼을 삭제합니다.         |
| `$table->dropRememberToken();`           | `remember_token` 컬럼을 삭제합니다.                          |
| `$table->dropSoftDeletes();`             | `deleted_at` 컬럼을 삭제합니다.                              |
| `$table->dropSoftDeletesTz();`           | `dropSoftDeletes()` 메서드의 별칭입니다.                      |
| `$table->dropTimestamps();`              | `created_at` 및 `updated_at` 컬럼을 삭제합니다.              |
| `$table->dropTimestampsTz();`            | `dropTimestamps()` 메서드의 별칭입니다.                       |

</div>

<a name="indexes"></a>
## 인덱스

<a name="creating-indexes"></a>
### 인덱스 생성하기

라라벨 스키마 빌더는 여러 유형의 인덱스를 지원합니다. 아래 예제는 새로운 `email` 컬럼을 만들고, 해당 컬럼 값이 유일하도록 지정하는 코드입니다. 인덱스를 만들기 위해 `unique` 메서드를 컬럼 정의에 체이닝할 수 있습니다.

```php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('users', function (Blueprint $table) {
    $table->string('email')->unique();
});
```

또는, 컬럼을 정의한 후에 인덱스를 따로 생성할 수도 있습니다. 이때는 스키마 빌더 블루프린트에서 `unique` 메서드를 호출하면 됩니다. 이 메서드는 인덱스를 생성할 컬럼 이름을 인수로 받습니다.

```php
$table->unique('email');
```

여러 컬럼을 배열로 전달해 복합(컴포지트) 인덱스를 생성할 수도 있습니다.

```php
$table->index(['account_id', 'created_at']);
```

인덱스를 생성할 때 라라벨은 테이블명, 컬럼명, 인덱스 타입을 조합해 자동으로 인덱스 이름을 만듭니다. 하지만, 두 번째 인자로 인덱스명을 직접 지정할 수도 있습니다.

```php
$table->unique('email', 'unique_email');
```

<a name="available-index-types"></a>
#### 사용 가능한 인덱스 타입

라라벨의 스키마 빌더 블루프린트 클래스는 라라벨에서 지원하는 각 인덱스 타입별로 메서드를 제공합니다. 각 인덱스 메서드는 두 번째 인자로 인덱스명을 받을 수 있습니다. 생략하면, 인덱스 이름은 테이블명, 컬럼명, 인덱스 타입을 결합해 자동 생성됩니다. 아래 표는 주요 인덱스 메서드를 정리한 것입니다.

<div class="overflow-auto">

| 명령어                                          | 설명                                                          |
| ----------------------------------------------- | ------------------------------------------------------------- |
| `$table->primary('id');`                        | 프라이머리 키 추가                                            |
| `$table->primary(['id', 'parent_id']);`         | 복합 키 추가                                                  |
| `$table->unique('email');`                      | 유니크 인덱스 추가                                            |
| `$table->index('state');`                       | 일반 인덱스 추가                                              |
| `$table->fullText('body');`                     | 전문 검색 인덱스 추가 (MariaDB / MySQL / PostgreSQL)           |
| `$table->fullText('body')->language('english');`| 지정 언어의 전문 검색 인덱스 추가 (PostgreSQL)                 |
| `$table->spatialIndex('location');`             | 공간 인덱스 추가 (SQLite 제외)                                 |

</div>

<a name="renaming-indexes"></a>
### 인덱스 이름 변경하기

인덱스의 이름을 변경하려면 스키마 빌더 블루프린트가 제공하는 `renameIndex` 메서드를 사용할 수 있습니다. 이 메서드는 현재 인덱스 이름을 첫 번째 인수, 변경할 새 이름을 두 번째 인수로 받습니다.

```php
$table->renameIndex('from', 'to')
```

<a name="dropping-indexes"></a>
### 인덱스 삭제하기

인덱스를 삭제하려면 해당 인덱스 이름을 직접 지정해야 합니다. 기본적으로 라라벨은 테이블명, 컬럼명, 인덱스 타입을 이용해 인덱스 이름을 자동 부여합니다. 아래는 삭제 예시입니다.

<div class="overflow-auto">

| 명령어                                               | 설명                                                      |
| ---------------------------------------------------- | --------------------------------------------------------- |
| `$table->dropPrimary('users_id_primary');`           | "users" 테이블에서 프라이머리 키 삭제                      |
| `$table->dropUnique('users_email_unique');`          | "users" 테이블에서 유니크 인덱스 삭제                     |
| `$table->dropIndex('geo_state_index');`              | "geo" 테이블에서 일반 인덱스 삭제                         |
| `$table->dropFullText('posts_body_fulltext');`       | "posts" 테이블에서 전문 검색 인덱스 삭제                  |
| `$table->dropSpatialIndex('geo_location_spatialindex');`| "geo" 테이블에서 공간 인덱스 삭제 (SQLite 제외)        |

</div>

컬럼 배열을 인덱스 삭제 메서드에 전달하면, 테이블명, 컬럼명, 인덱스 타입을 조합해 인덱스 이름이 생성됩니다.

```php
Schema::table('geo', function (Blueprint $table) {
    $table->dropIndex(['state']); // 'geo_state_index' 인덱스를 삭제
});
```

<a name="foreign-key-constraints"></a>
### 외래 키(Foreign Key) 제약조건

라라벨은 데이터베이스 수준에서 참조 무결성(Referential Integrity)을 강제할 수 있도록 외래 키 제약조건 생성도 지원합니다. 예를 들어, `posts` 테이블에 있는 `user_id` 컬럼이 `users` 테이블의 `id` 컬럼을 참조하도록 설정할 수 있습니다.

```php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('posts', function (Blueprint $table) {
    $table->unsignedBigInteger('user_id');

    $table->foreign('user_id')->references('id')->on('users');
});
```

이 방식은 코드를 길게 작성해야 하므로 라라벨에서는 더 간결한 메서드들도 제공합니다. 컬럼을 만들 때 `foreignId`와 `constrained`를 사용하면 위 예제를 아래처럼 단축할 수 있습니다.

```php
Schema::table('posts', function (Blueprint $table) {
    $table->foreignId('user_id')->constrained();
});
```

`foreignId`는 `UNSIGNED BIGINT` 컬럼을 생성하며, `constrained`는 컨벤션을 사용해 참조할 테이블 및 컬럼을 자동으로 추론합니다. 만약 테이블명이 라라벨의 기본 컨벤션과 다르다면, `constrained`에 직접 테이블명을 지정해줄 수 있습니다. 생성되는 인덱스 이름도 지정할 수 있습니다.

```php
Schema::table('posts', function (Blueprint $table) {
    $table->foreignId('user_id')->constrained(
        table: 'users', indexName: 'posts_user_id'
    );
});
```

외래 키 제약조건의 "on delete" 및 "on update" 동작을 직접 지정할 수도 있습니다.

```php
$table->foreignId('user_id')
    ->constrained()
    ->onUpdate('cascade')
    ->onDelete('cascade');
```

이러한 동작을 지정할 때 사용할 수 있는 더 직관적인 형태의 메서드도 있습니다.

<div class="overflow-auto">

| 메서드                                | 설명                                          |
| ------------------------------------- | --------------------------------------------- |
| `$table->cascadeOnUpdate();`          | 업데이트 시 함께 변경됩니다.                  |
| `$table->restrictOnUpdate();`         | 업데이트가 제한됩니다.                        |
| `$table->nullOnUpdate();`             | 업데이트 시 외래 키 값이 null로 설정됩니다.   |
| `$table->noActionOnUpdate();`         | 업데이트 시 별도의 동작 없음                  |
| `$table->cascadeOnDelete();`          | 삭제 시 함께 삭제됩니다.                      |
| `$table->restrictOnDelete();`         | 삭제가 제한됩니다.                            |
| `$table->nullOnDelete();`             | 삭제 시 외래 키 값이 null로 설정됩니다.       |
| `$table->noActionOnDelete();`         | 자식 레코드가 존재할 경우 삭제를 막습니다.    |

</div>

추가적인 [컬럼 수정자](#column-modifiers)는 반드시 `constrained` 메서드보다 먼저 체이닝해야 합니다.

```php
$table->foreignId('user_id')
    ->nullable()
    ->constrained();
```

<a name="dropping-foreign-keys"></a>
#### 외래 키 제약조건 삭제하기

외래 키 제약조건을 삭제하려면, 삭제할 제약조건의 이름을 `dropForeign` 메서드에 인수로 전달하면 됩니다. 외래 키 제약조건의 이름은 인덱스 이름 생성 규칙과 동일하게, 테이블명과 컬럼명 조합에 "\_foreign"이 붙습니다.

```php
$table->dropForeign('posts_user_id_foreign');
```

또는, 외래 키가 걸린 컬럼명을 배열로 전달할 수도 있습니다. 이 배열은 라라벨 컨벤션에 따라 제약조건 이름으로 변환됩니다.

```php
$table->dropForeign(['user_id']);
```

<a name="toggling-foreign-key-constraints"></a>
#### 외래 키 제약조건 활성화/비활성화

마이그레이션 내에서 다음 메서드들을 사용하여 외래 키 제약조건을 활성/비활성화할 수 있습니다.

```php
Schema::enableForeignKeyConstraints();

Schema::disableForeignKeyConstraints();

Schema::withoutForeignKeyConstraints(function () {
    // 이 클로저 내부에서는 제약조건이 비활성화됩니다...
});
```

> [!WARNING]
> SQLite는 기본적으로 외래 키 제약조건이 비활성화되어 있습니다. SQLite를 사용할 경우, 마이그레이션에서 외래 키 제약조건을 만들기 전에 [외래 키 지원 활성화](/docs/12.x/database#configuration)를 반드시 설정해야 합니다.

<a name="events"></a>
## 이벤트

편의를 위해, 각 마이그레이션 작업 실행 시마다 [이벤트](/docs/12.x/events)가 디스패치(dispatch)됩니다. 아래 모든 이벤트는 기본 `Illuminate\Database\Events\MigrationEvent` 클래스를 상속합니다.

<div class="overflow-auto">

| 클래스                                         | 설명                                           |
| -------------------------------------------- | ---------------------------------------------- |
| `Illuminate\Database\Events\MigrationsStarted`   | 여러 개의 마이그레이션 배치 실행 전             |
| `Illuminate\Database\Events\MigrationsEnded`     | 여러 개의 마이그레이션 배치 실행 완료 후         |
| `Illuminate\Database\Events\MigrationStarted`    | 단일 마이그레이션 실행 전                       |
| `Illuminate\Database\Events\MigrationEnded`      | 단일 마이그레이션 실행 완료 후                   |
| `Illuminate\Database\Events\NoPendingMigrations` | 실행할 마이그레이션이 없을 경우                  |
| `Illuminate\Database\Events\SchemaDumped`        | 데이터베이스 스키마 덤프가 완료됨               |
| `Illuminate\Database\Events\SchemaLoaded`        | 기존 데이터베이스 스키마 덤프가 로드됨           |

</div>