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
    - [외래 키 제약](#foreign-key-constraints)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

마이그레이션은 데이터베이스의 버전 관리와 비슷합니다. 이를 통해 팀원들이 애플리케이션의 데이터베이스 스키마 정의를 작성하고 공유할 수 있습니다. 만약 소스 컨트롤에서 작업을 가져온 후에, 다른 개발자에게 수동으로 새로운 컬럼을 데이터베이스에 추가하라고 알려야 했던 경험이 있다면, 바로 그 문제를 데이터베이스 마이그레이션이 해결해 줍니다.

라라벨의 `Schema` [파사드](/docs/facades)는 라라벨이 지원하는 모든 데이터베이스 시스템에서 테이블을 생성하고 수정할 수 있도록 데이터베이스에 종속되지 않는(agnostic) 기능을 제공합니다. 일반적으로, 마이그레이션에서는 이 파사드를 사용하여 데이터베이스 테이블과 컬럼을 생성하거나 변경합니다.

<a name="generating-migrations"></a>
## 마이그레이션 생성

`make:migration` [Artisan 명령어](/docs/artisan)를 사용하여 데이터베이스 마이그레이션을 생성할 수 있습니다. 새로 생성된 마이그레이션은 `database/migrations` 디렉터리에 위치하게 됩니다. 각 마이그레이션 파일 이름에는 실행 순서를 결정할 수 있도록 타임스탬프가 포함됩니다.

```shell
php artisan make:migration create_flights_table
```

라라벨은 마이그레이션의 이름을 바탕으로 어떤 테이블을 생성할지, 그리고 실제로 테이블을 생성하는 작업인지 예측하려고 시도합니다. 마이그레이션 이름에서 테이블 이름을 추론할 수 있다면, 해당 테이블명을 미리 지정한 상태로 마이그레이션 파일을 생성합니다. 그렇지 않은 경우에는 마이그레이션 파일에서 직접 테이블을 지정해주면 됩니다.

생성된 마이그레이션의 저장 경로를 직접 지정하고 싶다면, `make:migration` 명령어 실행 시 `--path` 옵션을 사용할 수 있습니다. 이 옵션에 지정하는 경로는 애플리케이션의 기본 경로를 기준으로 상대 경로여야 합니다.

> [!NOTE]
> 마이그레이션 스텁은 [스텁 공개](/docs/artisan#stub-customization) 기능을 사용하여 커스터마이즈할 수 있습니다.

<a name="squashing-migrations"></a>
### 마이그레이션 합치기

애플리케이션을 개발하다 보면, 점점 더 많은 마이그레이션 파일이 쌓이게 됩니다. 이렇게 되면 `database/migrations` 디렉터리에 수백 개의 마이그레이션 파일이 존재하게 되어 관리가 번거로워질 수 있습니다. 이런 경우, 여러 마이그레이션을 하나의 SQL 파일로 "합치기"(squash) 할 수 있습니다. 이를 시작하려면 `schema:dump` 명령어를 실행합니다.

```shell
php artisan schema:dump

# 현재 데이터베이스 스키마를 덤프하고 기존 모든 마이그레이션을 정리(prune)합니다...
php artisan schema:dump --prune
```

이 명령어를 실행하면, 라라벨은 애플리케이션의 `database/schema` 디렉터리에 "스키마" 파일을 생성합니다. 이 파일의 이름은 데이터베이스 연결명과 일치합니다. 이제 데이터베이스 마이그레이션을 시도할 때, 만약 실행된 마이그레이션이 없는 경우, 라라벨은 사용 중인 데이터베이스 연결의 스키마 파일에 작성된 SQL 명령문을 먼저 실행합니다. 그 후, 스키마 덤프에 이미 포함되지 않은 나머지 마이그레이션만 추가로 실행합니다.

애플리케이션의 테스트 환경에서 평소 로컬 개발에 사용하는 데이터베이스와 다른 연결을 사용한다면, 해당 연결로도 스키마 파일을 덤프하여 테스트 환경에서도 정상적으로 데이터베이스를 구축할 수 있도록 하십시오. 일반적으로 로컬 개발에서 사용하던 데이터베이스를 덤프한 후, 아래와 같이 추가로 실행하면 됩니다.

```shell
php artisan schema:dump
php artisan schema:dump --database=testing --prune
```

생성된 데이터베이스 스키마 파일은 반드시 소스 컨트롤에 커밋해야 합니다. 이렇게 하면 새로운 팀원이 빠르게 애플리케이션의 초기 데이터베이스 구조를 만들 수 있습니다.

> [!WARNING]
> 마이그레이션 합치기 기능은 MariaDB, MySQL, PostgreSQL, SQLite 데이터베이스에서만 사용할 수 있으며, 데이터베이스의 커맨드라인 클라이언트를 이용합니다.

<a name="migration-structure"></a>
## 마이그레이션 구조

하나의 마이그레이션 클래스에는 `up`과 `down` 두 개의 메서드가 포함됩니다. `up` 메서드는 데이터베이스에 새로운 테이블, 컬럼, 또는 인덱스를 추가할 때 사용하며, `down` 메서드는 `up`에서 수행한 작업을 되돌리는 역할을 합니다.

이 두 메서드 안에서, 라라벨 스키마 빌더를 사용해 테이블을 직관적으로 생성하거나 수정할 수 있습니다. `Schema` 빌더에서 사용할 수 있는 모든 메서드는 [문서](#creating-tables)에서 더 자세히 확인할 수 있습니다. 예를 들어, 다음은 `flights` 테이블을 생성하는 마이그레이션입니다.

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
#### 마이그레이션 연결 지정

마이그레이션이 애플리케이션의 기본 데이터베이스 연결이 아닌 다른 연결을 사용해야 한다면, 마이그레이션 클래스의 `$connection` 속성을 지정하면 됩니다.

```php
/**
 * 마이그레이션에서 사용할 데이터베이스 연결명.
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

마이그레이션이 아직 활성화되지 않은 기능을 지원하기 위한 것이라서, 당장 실행하지 않고 싶을 때가 있습니다. 이런 경우, 마이그레이션 클래스에 `shouldRun` 메서드를 정의할 수 있습니다. 이 메서드가 `false`를 반환하면 해당 마이그레이션은 건너뜁니다.

```php
use App\Models\Flights;
use Laravel\Pennant\Feature;

/**
 * 이 마이그레이션을 실행할지 여부를 결정합니다.
 */
public function shouldRun(): bool
{
    return Feature::active(Flights::class);
}
```

<a name="running-migrations"></a>
## 마이그레이션 실행

아직 실행하지 않은 모든 마이그레이션을 실행하려면, `migrate` Artisan 명령어를 실행합니다.

```shell
php artisan migrate
```

지금까지 실행된 마이그레이션 목록을 보고 싶다면, `migrate:status` Artisan 명령어를 사용하세요.

```shell
php artisan migrate:status
```

실제로 마이그레이션을 실행하지 않고, 어떤 SQL 명령문이 실행될 예정인지 확인하려면, `migrate` 명령어에 `--pretend` 플래그를 추가하세요.

```shell
php artisan migrate --pretend
```

#### 마이그레이션 실행 고립(Isolating Migration Execution)

여러 서버에 애플리케이션을 배포하면서, 배포 과정의 일부로 마이그레이션을 실행한다면, 두 서버에서 동시에 마이그레이션이 실행되는 상황을 피하고 싶을 것입니다. 이를 방지하려면 `migrate` 명령어 실행 시 `isolated` 옵션을 사용할 수 있습니다.

`isolated` 옵션을 지정하면, 라라벨이 애플리케이션의 캐시 드라이버를 이용해 원자적(atomic) 락을 획득한 뒤에야 마이그레이션을 실행합니다. 락이 유지되는 동안 다른 마이그레이션 실행 시도는 실제로 실행되지 않으며, 그렇더라도 명령어는 성공적으로 종료됩니다.

```shell
php artisan migrate --isolated
```

> [!WARNING]
> 이 기능을 사용하려면 기본 캐시 드라이버로 `memcached`, `redis`, `dynamodb`, `database`, `file`, `array` 중 하나를 사용해야 합니다. 또한 모든 서버가 동일한 중앙 캐시 서버와 통신하고 있어야 합니다.

<a name="forcing-migrations-to-run-in-production"></a>
#### 프로덕션 환경에서 강제로 마이그레이션 실행

일부 마이그레이션 작업은 데이터가 손실될 수도 있는 파괴적인(destructive) 작업입니다. 이런 명령어가 프로덕션 데이터베이스에서 실수로 실행되지 않도록, 실행 전 반드시 확인 메시지가 출력됩니다. 프롬프트 없이 강제로 실행하려면 `--force` 플래그를 사용하세요.

```shell
php artisan migrate --force
```

<a name="rolling-back-migrations"></a>
### 마이그레이션 롤백

가장 최근에 실행했던 마이그레이션(마지막 "배치")을 롤백하려면, `rollback` Artisan 명령어를 사용합니다. 한 번의 배치에는 여러 개의 마이그레이션 파일이 포함될 수 있습니다.

```shell
php artisan migrate:rollback
```

`rollback` 명령어에 `step` 옵션을 함께 지정하면, 롤백할 마이그레이션 개수를 제한할 수 있습니다. 예를 들어, 다음 명령어는 최근 5개의 마이그레이션만 롤백합니다.

```shell
php artisan migrate:rollback --step=5
```

또한 `batch` 옵션을 지정하면, 특정 "배치"에 포함된 모든 마이그레이션을 롤백할 수 있습니다. 예를 들어, 아래 명령어는 3번째 배치의 모든 마이그레이션을 롤백합니다.

```shell
php artisan migrate:rollback --batch=3
```

마이그레이션을 실제로 실행하지 않고 어떤 SQL문이 실행될지 확인만 하고 싶다면, `migrate:rollback` 명령어에 `--pretend` 플래그를 추가하면 됩니다.

```shell
php artisan migrate:rollback --pretend
```

`migrate:reset` 명령어는 애플리케이션의 모든 마이그레이션을 한 번에 롤백합니다.

```shell
php artisan migrate:reset
```

<a name="roll-back-migrate-using-a-single-command"></a>
#### 롤백과 마이그레이션을 한 번에 실행

`migrate:refresh` 명령어는 모든 마이그레이션을 롤백한 후 다시 `migrate` 명령어를 실행합니다. 즉, 데이터베이스 전체를 다시 생성하는 효과가 있습니다.

```shell
php artisan migrate:refresh

# 데이터베이스를 리프레시하고, 모든 시드(seeds)를 실행합니다...
php artisan migrate:refresh --seed
```

`refresh` 명령어에 `step` 옵션을 주면, 최근 몇 개의 마이그레이션만 롤백 후 재실행할 수 있습니다. 예를 들어, 아래는 최근 5개의 마이그레이션만 대상으로 합니다.

```shell
php artisan migrate:refresh --step=5
```

<a name="drop-all-tables-migrate"></a>
#### 모든 테이블 삭제 후 재마이그레이션

`migrate:fresh` 명령어는 데이터베이스의 모든 테이블을 삭제한 후, 다시 `migrate` 명령어를 실행합니다.

```shell
php artisan migrate:fresh

php artisan migrate:fresh --seed
```

기본적으로, `migrate:fresh` 명령어는 기본 데이터베이스 연결의 테이블만 삭제합니다. 다른 연결의 데이터베이스에 적용하려면 `--database` 옵션으로 연결명을 지정하세요. 이 연결명은 애플리케이션의 `database` [설정 파일](/docs/configuration)에 정의되어 있어야 합니다.

```shell
php artisan migrate:fresh --database=admin
```

> [!WARNING]
> `migrate:fresh` 명령어는 접두사와 상관없이 모든 데이터베이스 테이블을 삭제합니다. 여러 애플리케이션이 공유하는 데이터베이스에서는 이 명령어 사용에 특히 주의해야 합니다.

<a name="tables"></a>
## 테이블

<a name="creating-tables"></a>
### 테이블 생성

새로운 데이터베이스 테이블을 생성하려면, `Schema` 파사드의 `create` 메서드를 사용합니다. `create` 메서드는 두 개의 인수를 받습니다. 첫 번째는 테이블명, 두 번째는 새로운 테이블을 정의하는 데 사용할 수 있는 `Blueprint` 객체를 인자로 받는 클로저입니다.

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

테이블 생성 시, [컬럼 메서드](#creating-columns) 중 어떤 것이든 사용하여 테이블의 컬럼을 정의할 수 있습니다.

<a name="determining-table-column-existence"></a>
#### 테이블/컬럼 존재 여부 확인

`hasTable`, `hasColumn`, `hasIndex` 메서드를 사용하면 테이블, 컬럼, 인덱스의 존재 여부를 확인할 수 있습니다.

```php
if (Schema::hasTable('users')) {
    // "users" 테이블이 존재합니다...
}

if (Schema::hasColumn('users', 'email')) {
    // "users" 테이블이 존재하고 "email" 컬럼도 있습니다...
}

if (Schema::hasIndex('users', ['email'], 'unique')) {
    // "users" 테이블에 "email" 컬럼에 대한 유니크 인덱스가 있습니다...
}
```

<a name="database-connection-table-options"></a>
#### 데이터베이스 연결 및 테이블 옵션

기본 데이터베이스 연결이 아닌 다른 연결에서 스키마 작업을 하려면, `connection` 메서드를 사용하세요.

```php
Schema::connection('sqlite')->create('users', function (Blueprint $table) {
    $table->id();
});
```

이 외에도, 테이블 생성 시 몇 가지 속성과 메서드를 추가로 사용해 세부 옵션을 지정할 수 있습니다. MariaDB 또는 MySQL에서 테이블의 스토리지 엔진을 지정하려면 `engine` 속성을 사용할 수 있습니다.

```php
Schema::create('users', function (Blueprint $table) {
    $table->engine('InnoDB');

    // ...
});
```

MariaDB 또는 MySQL에서 테이블의 문자셋(charset)과 콜레이션(collation)을 지정하려면 `charset` 및 `collation` 속성을 사용할 수 있습니다.

```php
Schema::create('users', function (Blueprint $table) {
    $table->charset('utf8mb4');
    $table->collation('utf8mb4_unicode_ci');

    // ...
});
```

`temporary` 메서드를 사용하면 해당 테이블을 "임시" 테이블로 지정할 수 있습니다. 임시 테이블은 현재 연결의 데이터베이스 세션에만 보이며, 연결이 끊기면 자동으로 삭제됩니다.

```php
Schema::create('calculations', function (Blueprint $table) {
    $table->temporary();

    // ...
});
```

테이블에 "주석"을 추가하고 싶다면, 테이블 인스턴스에 `comment` 메서드를 호출하세요. 테이블 주석 기능은 현재 MariaDB, MySQL, PostgreSQL에서만 지원됩니다.

```php
Schema::create('calculations', function (Blueprint $table) {
    $table->comment('Business calculations');

    // ...
});
```

<a name="updating-tables"></a>
### 테이블 수정

기존 테이블을 수정하려면, `Schema` 파사드의 `table` 메서드를 사용하면 됩니다. `create` 메서드와 마찬가지로, 이 메서드는 첫 번째 인자로 테이블명, 두 번째 인자로 `Blueprint` 인스턴스를 전달받는 클로저를 받습니다. 이 클로저에서 컬럼이나 인덱스를 추가할 수 있습니다.

```php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('users', function (Blueprint $table) {
    $table->integer('votes');
});
```

<a name="renaming-and-dropping-tables"></a>
### 테이블 이름 변경 및 삭제

기존 데이터베이스 테이블의 이름을 변경하려면 `rename` 메서드를 사용하세요.

```php
use Illuminate\Support\Facades\Schema;

Schema::rename($from, $to);
```

기존 테이블을 삭제하려면 `drop` 또는 `dropIfExists` 메서드를 사용할 수 있습니다.

```php
Schema::drop('users');

Schema::dropIfExists('users');
```

<a name="renaming-tables-with-foreign-keys"></a>
#### 외래 키가 있는 테이블 이름 변경

테이블의 이름을 변경하기 전에, 해당 테이블의 외래 키 제약 조건이 마이그레이션 파일에서 명시적으로 이름이 지정되어 있는지 반드시 확인해야 합니다. 그렇지 않으면, 외래 키 제약 이름이 이전 테이블명을 참조하게 됩니다.

<a name="columns"></a>
## 컬럼

<a name="creating-columns"></a>
### 컬럼 생성

기존 테이블에 컬럼을 추가하려면 `Schema` 파사드의 `table` 메서드를 사용합니다. 이 메서드는 `create` 메서드와 동일하게 첫 번째 인자로 테이블명, 두 번째 인자로는 컬럼 추가에 사용할 수 있는 `Illuminate\Database\Schema\Blueprint` 인스턴스를 전달합니다.

```php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('users', function (Blueprint $table) {
    $table->integer('votes');
});
```

<a name="available-column-types"></a>
### 사용 가능한 컬럼 타입

스키마 빌더의 블루프린트는 데이터베이스 테이블에 추가할 수 있는 다양한 컬럼 타입에 해당하는 여러 메서드를 제공합니다. 사용 가능한 각 메서드는 아래 표에 정리되어 있습니다.

<a name="booleans-method-list"></a>
#### 불린 타입

<div class="collection-method-list" markdown="1">

[boolean](#column-method-boolean)

</div>

<a name="strings-and-texts-method-list"></a>
#### 문자열 & 텍스트 타입

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
#### 날짜 & 시간 타입

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

#### 관계(Relationship) 타입

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

`bigInteger` 메서드는 `BIGINT` 타입과 동일한 컬럼을 생성합니다.

```php
$table->bigInteger('votes');
```

<a name="column-method-binary"></a>
#### `binary()`

`binary` 메서드는 `BLOB` 타입과 동일한 컬럼을 생성합니다.

```php
$table->binary('photo');
```

MySQL, MariaDB, SQL Server를 사용할 때는 `length`(길이)와 `fixed`(고정 길이) 인수를 전달하여 `VARBINARY` 또는 `BINARY` 타입의 컬럼을 생성할 수 있습니다.

```php
$table->binary('data', length: 16); // VARBINARY(16)

$table->binary('data', length: 16, fixed: true); // BINARY(16)
```

<a name="column-method-boolean"></a>
#### `boolean()`

`boolean` 메서드는 `BOOLEAN` 타입과 동일한 컬럼을 생성합니다.

```php
$table->boolean('confirmed');
```

<a name="column-method-char"></a>
#### `char()`

`char` 메서드는 지정한 길이의 `CHAR` 타입 컬럼을 생성합니다.

```php
$table->char('name', length: 100);
```

<a name="column-method-dateTimeTz"></a>
#### `dateTimeTz()`

`dateTimeTz` 메서드는 선택적으로 소수 초 정밀도가 지정된, 타임존 정보를 포함하는 `DATETIME` 타입 컬럼을 생성합니다.

```php
$table->dateTimeTz('created_at', precision: 0);
```

<a name="column-method-dateTime"></a>
#### `dateTime()`

`dateTime` 메서드는 선택적으로 소수 초 정밀도가 지정된 `DATETIME` 타입의 컬럼을 생성합니다.

```php
$table->dateTime('created_at', precision: 0);
```

<a name="column-method-date"></a>
#### `date()`

`date` 메서드는 `DATE` 타입과 동일한 컬럼을 생성합니다.

```php
$table->date('created_at');
```

<a name="column-method-decimal"></a>
#### `decimal()`

`decimal` 메서드는 주어진 정밀도(전체 자릿수)와 소수점 이하 자릿수로 `DECIMAL` 타입의 컬럼을 생성합니다.

```php
$table->decimal('amount', total: 8, places: 2);
```

<a name="column-method-double"></a>
#### `double()`

`double` 메서드는 `DOUBLE` 타입과 동일한 컬럼을 생성합니다.

```php
$table->double('amount');
```

<a name="column-method-enum"></a>
#### `enum()`

`enum` 메서드는 지정한 유효 값 목록을 갖는 `ENUM` 타입의 컬럼을 생성합니다.

```php
$table->enum('difficulty', ['easy', 'hard']);
```

<a name="column-method-float"></a>
#### `float()`

`float` 메서드는 지정한 정밀도의 `FLOAT` 타입 컬럼을 생성합니다.

```php
$table->float('amount', precision: 53);
```

<a name="column-method-foreignId"></a>
#### `foreignId()`

`foreignId` 메서드는 `UNSIGNED BIGINT` 타입과 동일한 컬럼을 생성합니다.

```php
$table->foreignId('user_id');
```

<a name="column-method-foreignIdFor"></a>
#### `foreignIdFor()`

`foreignIdFor` 메서드는 주어진 모델 클래스에 대해 `{column}_id` 형태의 컬럼을 추가합니다. 컬럼 타입은 모델의 키 타입에 따라 `UNSIGNED BIGINT`, `CHAR(36)`, 또는 `CHAR(26)`이 사용됩니다.

```php
$table->foreignIdFor(User::class);
```

<a name="column-method-foreignUlid"></a>
#### `foreignUlid()`

`foreignUlid` 메서드는 `ULID` 타입과 동일한 컬럼을 생성합니다.

```php
$table->foreignUlid('user_id');
```

<a name="column-method-foreignUuid"></a>
#### `foreignUuid()`

`foreignUuid` 메서드는 `UUID` 타입과 동일한 컬럼을 생성합니다.

```php
$table->foreignUuid('user_id');
```

<a name="column-method-geography"></a>
#### `geography()`

`geography` 메서드는 주어진 공간 타입(subtype)과 SRID(공간 참조 시스템 식별자)로 `GEOGRAPHY` 타입 컬럼을 생성합니다.

```php
$table->geography('coordinates', subtype: 'point', srid: 4326);
```

> [!NOTE]
> 공간 유형(spatial type)에 대한 지원 여부는 사용하는 데이터베이스 드라이버에 따라 다릅니다. 각 데이터베이스의 공식 문서를 참고하시기 바랍니다. 애플리케이션에서 PostgreSQL을 사용하는 경우, `geography` 메서드를 사용하기 전에 [PostGIS](https://postgis.net) 확장 기능을 반드시 설치해야 합니다.

<a name="column-method-geometry"></a>
#### `geometry()`

`geometry` 메서드는 주어진 공간 타입(subtype)과 SRID로 `GEOMETRY` 타입 컬럼을 생성합니다.

```php
$table->geometry('positions', subtype: 'point', srid: 0);
```

> [!NOTE]
> 공간 유형(spatial type)에 대한 지원 여부는 사용하는 데이터베이스 드라이버에 따라 다릅니다. 각 데이터베이스의 공식 문서를 참고하시기 바랍니다. 애플리케이션에서 PostgreSQL을 사용하는 경우, `geometry` 메서드를 사용하기 전에 [PostGIS](https://postgis.net) 확장 기능을 반드시 설치해야 합니다.

<a name="column-method-id"></a>
#### `id()`

`id` 메서드는 `bigIncrements` 메서드의 별칭입니다. 기본적으로 `id` 컬럼이 생성되지만, 다른 이름으로 컬럼을 만들고 싶다면 컬럼명을 지정할 수도 있습니다.

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

`integer` 메서드는 `INTEGER` 타입과 동일한 컬럼을 생성합니다.

```php
$table->integer('votes');
```

<a name="column-method-ipAddress"></a>
#### `ipAddress()`

`ipAddress` 메서드는 `VARCHAR` 타입과 동일한 컬럼을 생성합니다.

```php
$table->ipAddress('visitor');
```

PostgreSQL을 사용할 경우 `INET` 타입 컬럼이 생성됩니다.

<a name="column-method-json"></a>
#### `json()`

`json` 메서드는 `JSON` 타입과 동일한 컬럼을 생성합니다.

```php
$table->json('options');
```

SQLite를 사용할 경우 `TEXT` 컬럼이 생성됩니다.

<a name="column-method-jsonb"></a>
#### `jsonb()`

`jsonb` 메서드는 `JSONB` 타입과 동일한 컬럼을 생성합니다.

```php
$table->jsonb('options');
```

SQLite를 사용할 경우 `TEXT` 컬럼이 생성됩니다.

<a name="column-method-longText"></a>
#### `longText()`

`longText` 메서드는 `LONGTEXT` 타입과 동일한 컬럼을 생성합니다.

```php
$table->longText('description');
```

MySQL이나 MariaDB를 사용할 때 컬럼에 `binary` 문자셋을 적용하면 `LONGBLOB` 타입과 동일한 컬럼을 생성할 수 있습니다.

```php
$table->longText('data')->charset('binary'); // LONGBLOB
```

<a name="column-method-macAddress"></a>
#### `macAddress()`

`macAddress` 메서드는 MAC 주소 값을 저장하기에 적합한 컬럼을 생성합니다. PostgreSQL 등 일부 데이터베이스 시스템은 이 용도에 맞는 전용 타입을 제공하고, 그 외에는 문자열 타입 컬럼이 사용됩니다.

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

`mediumInteger` 메서드는 `MEDIUMINT` 타입과 동일한 컬럼을 생성합니다.

```php
$table->mediumInteger('votes');
```

<a name="column-method-mediumText"></a>
#### `mediumText()`

`mediumText` 메서드는 `MEDIUMTEXT` 타입과 동일한 컬럼을 생성합니다.

```php
$table->mediumText('description');
```

MySQL이나 MariaDB를 사용할 때 컬럼에 `binary` 문자셋을 적용하면 `MEDIUMBLOB` 타입과 동일한 컬럼을 생성할 수 있습니다.

```php
$table->mediumText('data')->charset('binary'); // MEDIUMBLOB
```

<a name="column-method-morphs"></a>
#### `morphs()`

`morphs` 메서드는 `{column}_id` 타입의 컬럼과 `{column}_type` `VARCHAR` 타입의 컬럼을 한 번에 추가해 주는 편의 메서드입니다. `{column}_id` 컬럼은 모델 키 타입에 따라 `UNSIGNED BIGINT`, `CHAR(36)`, 또는 `CHAR(26)`이 지정됩니다.

이 메서드는 다형성 [Eloquent 관계](/docs/eloquent-relationships)에서 필요한 컬럼을 만들 때 사용합니다. 예를 들어, 아래와 같이 작성하면 `taggable_id`와 `taggable_type` 컬럼이 생성됩니다.

```php
$table->morphs('taggable');
```

<a name="column-method-nullableMorphs"></a>
#### `nullableMorphs()`

이 메서드는 [morphs](#column-method-morphs) 메서드와 거의 동일하지만, 생성되는 컬럼이 "nullable" 속성을 갖게 됩니다.

```php
$table->nullableMorphs('taggable');
```

<a name="column-method-nullableUlidMorphs"></a>
#### `nullableUlidMorphs()`

이 메서드는 [ulidMorphs](#column-method-ulidMorphs)와 유사하지만, 생성되는 컬럼이 "nullable" 속성을 갖게 됩니다.

```php
$table->nullableUlidMorphs('taggable');
```

<a name="column-method-nullableUuidMorphs"></a>
#### `nullableUuidMorphs()`

이 메서드는 [uuidMorphs](#column-method-uuidMorphs)와 유사하지만, 생성되는 컬럼이 "nullable" 속성을 갖게 됩니다.

```php
$table->nullableUuidMorphs('taggable');
```

<a name="column-method-rememberToken"></a>
#### `rememberToken()`

`rememberToken` 메서드는 현재 "remember me" [인증 토큰](/docs/authentication#remembering-users)를 저장하기 위한, nullable한 `VARCHAR(100)` 타입 컬럼을 생성합니다.

```php
$table->rememberToken();
```

<a name="column-method-set"></a>
#### `set()`

`set` 메서드는 주어진 유효 값 목록을 갖는 `SET` 타입의 컬럼을 생성합니다.

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

`smallInteger` 메서드는 `SMALLINT` 타입과 동일한 컬럼을 생성합니다.

```php
$table->smallInteger('votes');
```

<a name="column-method-softDeletesTz"></a>
#### `softDeletesTz()`

`softDeletesTz` 메서드는 nullable한 `deleted_at` `TIMESTAMP`(타임존 포함, 선택적 소수 초 정밀도 설정 가능) 컬럼을 추가합니다. 이 컬럼은 Eloquent의 "소프트 삭제" 기능에 필요한 `deleted_at` 타임스탬프를 저장하는 데 사용합니다.

```php
$table->softDeletesTz('deleted_at', precision: 0);
```

<a name="column-method-softDeletes"></a>
#### `softDeletes()`

`softDeletes` 메서드는 nullable한 `deleted_at` `TIMESTAMP`(선택적 소수 초 정밀도 설정 가능) 컬럼을 추가합니다. 이 컬럼은 Eloquent의 "소프트 삭제" 기능에 필요한 `deleted_at` 타임스탬프를 저장하는 데 사용합니다.

```php
$table->softDeletes('deleted_at', precision: 0);
```

<a name="column-method-string"></a>
#### `string()`

`string` 메서드는 지정한 길이의 `VARCHAR` 타입 컬럼을 생성합니다.

```php
$table->string('name', length: 100);
```

<a name="column-method-text"></a>
#### `text()`

`text` 메서드는 `TEXT` 타입과 동일한 컬럼을 생성합니다.

```php
$table->text('description');
```

MySQL이나 MariaDB를 사용할 때 컬럼에 `binary` 문자셋을 적용하면 `BLOB` 타입과 동일한 컬럼을 생성할 수 있습니다.

```php
$table->text('data')->charset('binary'); // BLOB
```

<a name="column-method-timeTz"></a>
#### `timeTz()`

`timeTz` 메서드는 선택적으로 소수 초 정밀도가 지정된, 타임존 정보를 포함하는 `TIME` 타입 컬럼을 생성합니다.

```php
$table->timeTz('sunrise', precision: 0);
```

<a name="column-method-time"></a>
#### `time()`

`time` 메서드는 선택적으로 소수 초 정밀도가 지정된 `TIME` 타입 컬럼을 생성합니다.

```php
$table->time('sunrise', precision: 0);
```

<a name="column-method-timestampTz"></a>
#### `timestampTz()`

`timestampTz` 메서드는 선택적으로 소수 초 정밀도가 지정된, 타임존 정보를 포함하는 `TIMESTAMP` 타입 컬럼을 생성합니다.

```php
$table->timestampTz('added_at', precision: 0);
```

<a name="column-method-timestamp"></a>
#### `timestamp()`

`timestamp` 메서드는 선택적으로 소수 초 정밀도가 지정된 `TIMESTAMP` 타입 컬럼을 생성합니다.

```php
$table->timestamp('added_at', precision: 0);
```

<a name="column-method-timestampsTz"></a>
#### `timestampsTz()`

`timestampsTz` 메서드는 `created_at`과 `updated_at`에 해당하는, 타임존 정보를 포함하는 `TIMESTAMP` 타입 컬럼을 각각 생성합니다. 소수 초 정밀도도 선택적으로 지정할 수 있습니다.

```php
$table->timestampsTz(precision: 0);
```

<a name="column-method-timestamps"></a>
#### `timestamps()`

`timestamps` 메서드는 `created_at`과 `updated_at`에 해당하는 `TIMESTAMP` 타입 컬럼을 각각 생성합니다. 소수 초 정밀도도 선택적으로 지정할 수 있습니다.

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

`tinyInteger` 메서드는 `TINYINT` 타입과 동일한 컬럼을 생성합니다.

```php
$table->tinyInteger('votes');
```

<a name="column-method-tinyText"></a>
#### `tinyText()`

`tinyText` 메서드는 `TINYTEXT` 타입과 동일한 컬럼을 생성합니다.

```php
$table->tinyText('notes');
```

MySQL이나 MariaDB를 사용할 때 컬럼에 `binary` 문자셋을 적용하면 `TINYBLOB` 타입과 동일한 컬럼을 생성할 수 있습니다.

```php
$table->tinyText('data')->charset('binary'); // TINYBLOB
```

<a name="column-method-unsignedBigInteger"></a>
#### `unsignedBigInteger()`

`unsignedBigInteger` 메서드는 `UNSIGNED BIGINT` 타입과 동일한 컬럼을 생성합니다.

```php
$table->unsignedBigInteger('votes');
```

<a name="column-method-unsignedInteger"></a>
#### `unsignedInteger()`

`unsignedInteger` 메서드는 `UNSIGNED INTEGER` 타입과 동일한 컬럼을 생성합니다.

```php
$table->unsignedInteger('votes');
```

<a name="column-method-unsignedMediumInteger"></a>
#### `unsignedMediumInteger()`

`unsignedMediumInteger` 메서드는 `UNSIGNED MEDIUMINT` 타입과 동일한 컬럼을 생성합니다.

```php
$table->unsignedMediumInteger('votes');
```

<a name="column-method-unsignedSmallInteger"></a>
#### `unsignedSmallInteger()`

`unsignedSmallInteger` 메서드는 `UNSIGNED SMALLINT` 타입과 동일한 컬럼을 생성합니다.

```php
$table->unsignedSmallInteger('votes');
```

<a name="column-method-unsignedTinyInteger"></a>
#### `unsignedTinyInteger()`

`unsignedTinyInteger` 메서드는 `UNSIGNED TINYINT` 타입과 동일한 컬럼을 생성합니다.

```php
$table->unsignedTinyInteger('votes');
```

<a name="column-method-ulidMorphs"></a>
#### `ulidMorphs()`

`ulidMorphs` 메서드는 `{column}_id`에 `CHAR(26)` 타입, `{column}_type`에 `VARCHAR` 타입의 컬럼을 추가해 주는 편의 메서드입니다.

이 메서드는 ULID 식별자를 사용하는 다형성 [Eloquent 관계](/docs/eloquent-relationships)에서 필요한 컬럼을 정의할 때 사용합니다. 아래의 예시에서는 `taggable_id`와 `taggable_type` 컬럼이 생성됩니다.

```php
$table->ulidMorphs('taggable');
```

<a name="column-method-uuidMorphs"></a>
#### `uuidMorphs()`

`uuidMorphs` 메서드는 `{column}_id`에 `CHAR(36)` 타입, `{column}_type`에 `VARCHAR` 타입의 컬럼을 추가해 주는 편의 메서드입니다.

이 메서드는 UUID 식별자를 사용하는 다형성 [Eloquent 관계](/docs/eloquent-relationships)에서 필요한 컬럼을 정의할 때 사용합니다. 아래의 예시에서는 `taggable_id`와 `taggable_type` 컬럼이 생성됩니다.

```php
$table->uuidMorphs('taggable');
```

<a name="column-method-ulid"></a>

#### `ulid()`

`ulid` 메서드는 `ULID`에 해당하는 컬럼을 생성합니다.

```php
$table->ulid('id');
```

<a name="column-method-uuid"></a>
#### `uuid()`

`uuid` 메서드는 `UUID`에 해당하는 컬럼을 생성합니다.

```php
$table->uuid('id');
```

<a name="column-method-vector"></a>
#### `vector()`

`vector` 메서드는 `vector`에 해당하는 컬럼을 생성합니다.

```php
$table->vector('embedding', dimensions: 100);
```

<a name="column-method-year"></a>
#### `year()`

`year` 메서드는 `YEAR`에 해당하는 컬럼을 생성합니다.

```php
$table->year('birth_year');
```

<a name="column-modifiers"></a>
### 컬럼 수정자(Modifiers)

위에서 소개한 컬럼 타입 외에도, 데이터베이스 테이블에 컬럼을 추가할 때 사용할 수 있는 여러 "수정자(modifier)"들이 있습니다. 예를 들어, 컬럼이 `nullable`(널값 허용)하도록 만들려면 `nullable` 메서드를 사용할 수 있습니다.

```php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('users', function (Blueprint $table) {
    $table->string('email')->nullable();
});
```

다음 표는 사용 가능한 모든 컬럼 수정자를 정리한 것입니다. 이 목록에는 [인덱스 관련 수정자](#creating-indexes)는 포함되어 있지 않습니다.

<div class="overflow-auto">

| 수정자                                 | 설명                                                                                       |
| ----------------------------------- | ---------------------------------------------------------------------------------------- |
| `->after('column')`                 | 다른 컬럼 "뒤에" 컬럼을 배치합니다 (MariaDB / MySQL).                                      |
| `->autoIncrement()`                 | `INTEGER` 컬럼을 자동 증가(기본키)로 설정합니다.                                           |
| `->charset('utf8mb4')`              | 해당 컬럼의 문자셋을 지정합니다 (MariaDB / MySQL).                                         |
| `->collation('utf8mb4_unicode_ci')` | 컬럼의 정렬 방식을 지정합니다.                                                             |
| `->comment('my comment')`           | 컬럼에 코멘트를 추가합니다 (MariaDB / MySQL / PostgreSQL).                                 |
| `->default($value)`                 | 컬럼의 "기본값"을 지정합니다.                                                             |
| `->first()`                         | 테이블에서 이 컬럼을 "첫 번째"에 배치합니다 (MariaDB / MySQL).                             |
| `->from($integer)`                  | 자동 증가 필드의 시작 값을 지정합니다 (MariaDB / MySQL / PostgreSQL).                      |
| `->invisible()`                     | `SELECT *` 쿼리에서 이 컬럼을 "invisible"(보이지 않게) 처리합니다 (MariaDB / MySQL).       |
| `->nullable($value = true)`         | 이 컬럼에 `NULL` 값을 삽입하는 것을 허용합니다.                                            |
| `->storedAs($expression)`           | 스토어드 생성 컬럼을 생성합니다 (MariaDB / MySQL / PostgreSQL / SQLite).                   |
| `->unsigned()`                      | `INTEGER` 컬럼을 `UNSIGNED`로 설정합니다 (MariaDB / MySQL).                                |
| `->useCurrent()`                    | `TIMESTAMP` 컬럼의 기본값을 `CURRENT_TIMESTAMP`로 지정합니다.                              |
| `->useCurrentOnUpdate()`            | 레코드가 수정될 때 `TIMESTAMP` 컬럼에 `CURRENT_TIMESTAMP`를 사용합니다 (MariaDB / MySQL).  |
| `->virtualAs($expression)`          | 가상 생성 컬럼을 생성합니다 (MariaDB / MySQL / SQLite).                                    |
| `->generatedAs($expression)`        | 지정된 시퀀스 옵션으로 identity 컬럼을 생성합니다 (PostgreSQL).                            |
| `->always()`                        | identity 컬럼 입력 시, 시퀀스 값의 우선순위를 정의합니다 (PostgreSQL).                      |

</div>

<a name="default-expressions"></a>
#### 기본값 표현식(Default Expressions)

`default` 수정자는 값이나 `Illuminate\Database\Query\Expression` 인스턴스를 받을 수 있습니다. `Expression` 인스턴스를 사용하면 값이 따옴표로 감싸지지 않고, 데이터베이스별 함수를 활용할 수 있습니다. 이는 예를 들어 JSON 컬럼에 기본값을 할당해야 할 때 특히 유용합니다.

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
> 기본값 표현식의 지원 여부는 데이터베이스 드라이버, 데이터베이스 버전, 필드 타입에 따라 달라집니다. 반드시 사용 중인 데이터베이스의 문서를 확인하십시오.

<a name="column-order"></a>
#### 컬럼 순서

MariaDB나 MySQL 데이터베이스 사용 시, `after` 메서드를 사용해 기존 컬럼 뒤에 새로운 컬럼을 추가할 수 있습니다.

```php
$table->after('password', function (Blueprint $table) {
    $table->string('address_line1');
    $table->string('address_line2');
    $table->string('city');
});
```

<a name="modifying-columns"></a>
### 컬럼 수정하기

`change` 메서드를 사용하면 기존 컬럼의 타입 및 속성을 수정할 수 있습니다. 예를 들어, `string` 컬럼의 크기를 늘리고자 할 때 활용 가능합니다. 아래 예시처럼 `name` 컬럼의 길이를 25에서 50으로 늘려보겠습니다. 이를 위해, 변경할 컬럼의 새 상태를 정의한 후 `change` 메서드를 호출합니다.

```php
Schema::table('users', function (Blueprint $table) {
    $table->string('name', 50)->change();
});
```

컬럼을 수정할 때는, 변경 후에도 유지하고 싶은 모든 수정자를 명시적으로 포함해야 합니다. 누락된 속성은 사라지게 됩니다. 예를 들어, `unsigned`, `default`, `comment` 속성을 유지하려면, 컬럼을 변경할 때 각각의 수정자를 꼭 다시 호출해야 합니다.

```php
Schema::table('users', function (Blueprint $table) {
    $table->integer('votes')->unsigned()->default(1)->comment('my comment')->change();
});
```

`change` 메서드는 컬럼의 인덱스에는 영향을 주지 않습니다. 따라서, 컬럼을 수정할 때 인덱스를 추가하거나 삭제하려면 인덱스 관련 수정자를 명시적으로 사용해야 합니다.

```php
// 인덱스 추가...
$table->bigIncrements('id')->primary()->change();

// 인덱스 삭제...
$table->char('postal_code', 10)->unique(false)->change();
```

<a name="renaming-columns"></a>
### 컬럼 이름 변경하기

컬럼의 이름을 바꾸려면, 스키마 빌더에서 제공하는 `renameColumn` 메서드를 사용할 수 있습니다.

```php
Schema::table('users', function (Blueprint $table) {
    $table->renameColumn('from', 'to');
});
```

<a name="dropping-columns"></a>
### 컬럼 삭제하기

컬럼을 삭제하려면 스키마 빌더에서 `dropColumn` 메서드를 사용합니다.

```php
Schema::table('users', function (Blueprint $table) {
    $table->dropColumn('votes');
});
```

여러 컬럼을 한 번에 삭제하려면 `dropColumn` 메서드에 컬럼명 배열을 넘겨주면 됩니다.

```php
Schema::table('users', function (Blueprint $table) {
    $table->dropColumn(['votes', 'avatar', 'location']);
});
```

<a name="available-command-aliases"></a>
#### 사용 가능한 명령어 별칭

라라벨은 자주 사용하는 컬럼 삭제 작업을 위한 여러 편의 메서드도 제공합니다. 아래 표를 참고하세요.

<div class="overflow-auto">

| 명령어                                      | 설명                                                     |
| ------------------------------------------ | ------------------------------------------------------ |
| `$table->dropMorphs('morphable');`         | `morphable_id`와 `morphable_type` 컬럼을 삭제합니다.     |
| `$table->dropRememberToken();`             | `remember_token` 컬럼을 삭제합니다.                     |
| `$table->dropSoftDeletes();`               | `deleted_at` 컬럼을 삭제합니다.                         |
| `$table->dropSoftDeletesTz();`             | `dropSoftDeletes()` 메서드의 별칭입니다.                |
| `$table->dropTimestamps();`                | `created_at` 및 `updated_at` 컬럼을 삭제합니다.         |
| `$table->dropTimestampsTz();`              | `dropTimestamps()` 메서드의 별칭입니다.                 |

</div>

<a name="indexes"></a>
## 인덱스(Indexes)

<a name="creating-indexes"></a>
### 인덱스 생성하기

라라벨의 스키마 빌더는 여러 종류의 인덱스를 지원합니다. 아래 예시는 새로운 `email` 컬럼을 추가하고 이 값이 유일하도록 만듭니다. 인덱스를 만들기 위해 컬럼 정의에 `unique` 메서드를 바로 체이닝할 수 있습니다.

```php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('users', function (Blueprint $table) {
    $table->string('email')->unique();
});
```

또는, 컬럼을 정의한 후에 인덱스를 따로 생성할 수도 있습니다. 이 경우에는 스키마 빌더 블루프린트에서 `unique` 메서드에 인덱스를 걸 컬럼명을 지정하면 됩니다.

```php
$table->unique('email');
```

인덱스 메서드에 컬럼 배열을 넘기면 복합(합성) 인덱스도 만들 수 있습니다.

```php
$table->index(['account_id', 'created_at']);
```

인덱스를 만들 때, 라라벨은 테이블명, 컬럼명, 인덱스 타입에 따라 자동으로 인덱스 이름을 생성합니다. 직접 인덱스 이름을 지정하려면 두 번째 인자로 이름을 전달할 수 있습니다.

```php
$table->unique('email', 'unique_email');
```

<a name="available-index-types"></a>
#### 사용 가능한 인덱스 타입

라라벨의 스키마 빌더 블루프린트 클래스는 라라벨에서 지원하는 각 인덱스 타입에 맞는 메서드를 제공합니다. 각 인덱스 메서드는 선택적으로 두 번째 인자로 인덱스 이름을 지정할 수 있습니다. 생략하면 테이블명, 컬럼명, 인덱스 타입을 조합한 이름이 자동 생성됩니다. 아래 표에서 지원하는 인덱스 메서드를 확인할 수 있습니다.

<div class="overflow-auto">

| 명령어                                         | 설명                                                                |
| -------------------------------------------- | ----------------------------------------------------------------- |
| `$table->primary('id');`                     | 기본(primary) 키를 추가합니다.                                       |
| `$table->primary(['id', 'parent_id']);`      | 합성(primary) 키를 추가합니다.                                       |
| `$table->unique('email');`                   | 고유(유니크) 인덱스를 추가합니다.                                    |
| `$table->index('state');`                    | 일반 인덱스를 추가합니다.                                            |
| `$table->fullText('body');`                  | 전체 텍스트(FullText) 인덱스를 추가합니다 (MariaDB / MySQL / PostgreSQL).|
| `$table->fullText('body')->language('english');` | 지정 언어로 전체텍스트 인덱스 생성 (PostgreSQL).                    |
| `$table->spatialIndex('location');`          | 공간(Spatial) 인덱스를 추가합니다 (SQLite 제외).                     |

</div>

<a name="renaming-indexes"></a>
### 인덱스 이름 변경하기

인덱스의 이름을 바꾸려면, 스키마 빌더 블루프린트의 `renameIndex` 메서드를 사용하면 됩니다. 첫 번째 인자로 현재 인덱스명, 두 번째 인자로 원하는 새 인덱스명을 전달합니다.

```php
$table->renameIndex('from', 'to')
```

<a name="dropping-indexes"></a>
### 인덱스 삭제하기

인덱스를 삭제할 때는 인덱스의 이름을 반드시 지정해야 합니다. 라라벨은 기본적으로 테이블명, 인덱싱된 컬럼명, 인덱스 타입 정보를 조합해 인덱스명을 자동 지정합니다. 아래에 몇 가지 예시를 소개합니다.

<div class="overflow-auto">

| 명령어                                                  | 설명                                                        |
| ------------------------------------------------------ | --------------------------------------------------------- |
| `$table->dropPrimary('users_id_primary');`             | "users" 테이블에서 기본키를 삭제합니다.                      |
| `$table->dropUnique('users_email_unique');`            | "users" 테이블에서 유니크 인덱스를 삭제합니다.                |
| `$table->dropIndex('geo_state_index');`                | "geo" 테이블에서 일반 인덱스를 삭제합니다.                    |
| `$table->dropFullText('posts_body_fulltext');`         | "posts" 테이블에서 전체 텍스트 인덱스를 삭제합니다.            |
| `$table->dropSpatialIndex('geo_location_spatialindex');` | "geo" 테이블에서 공간 인덱스를 삭제합니다 (SQLite 제외).     |

</div>

한편, 컬럼 배열을 전달하여 인덱스 삭제 메서드를 호출하면, 해당 배열을 기반으로 라라벨이 내부적으로 인덱스명을 생성해 삭제하게 됩니다.

```php
Schema::table('geo', function (Blueprint $table) {
    $table->dropIndex(['state']); // 'geo_state_index' 인덱스를 삭제
});
```

<a name="foreign-key-constraints"></a>
### 외래키 제약조건(Foreign Key Constraints)

라라벨은 외래키 제약조건을 생성하는 것도 지원하며, 이를 통해 데이터베이스 레벨에서 참조 무결성을 보장할 수 있습니다. 예를 들어, `posts` 테이블에 `user_id` 컬럼을 추가해서 `users` 테이블의 `id` 컬럼을 참조하도록 정의할 수 있습니다.

```php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('posts', function (Blueprint $table) {
    $table->unsignedBigInteger('user_id');

    $table->foreign('user_id')->references('id')->on('users');
});
```

이 문법은 조금 장황하므로, 라라벨에서는 규칙(convention)을 활용한 더 간단한 메서드를 제공해 개발 경험을 개선합니다. `foreignId` 메서드와 `constrained` 메서드를 사용하면 위 예제를 아래처럼 더 간단하게 작성할 수 있습니다.

```php
Schema::table('posts', function (Blueprint $table) {
    $table->foreignId('user_id')->constrained();
});
```

`foreignId` 메서드는 `UNSIGNED BIGINT`에 해당하는 컬럼을 생성하고, `constrained` 메서드는 규칙에 따라 참조 테이블과 컬럼을 자동으로 지정합니다. 만약 테이블명이 라라벨 규칙과 다르다면 `constrained` 메서드에 직접 지정할 수 있고, 생성될 인덱스 이름도 명시적으로 전달할 수 있습니다.

```php
Schema::table('posts', function (Blueprint $table) {
    $table->foreignId('user_id')->constrained(
        table: 'users', indexName: 'posts_user_id'
    );
});
```

또한, 외래키의 `"on delete"`, `"on update"` 속성에 대한 동작도 지정할 수 있습니다.

```php
$table->foreignId('user_id')
    ->constrained()
    ->onUpdate('cascade')
    ->onDelete('cascade');
```

이런 동작에 대해 좀 더 간결하게 표현할 수 있는 보조 메서드도 제공됩니다.

<div class="overflow-auto">

| 메서드                         | 설명                                                    |
| ----------------------------- | ----------------------------------------------------- |
| `$table->cascadeOnUpdate();`  | 업데이트 시, 연쇄적으로 반영(cascade)합니다.            |
| `$table->restrictOnUpdate();` | 업데이트를 제한합니다.                                 |
| `$table->nullOnUpdate();`     | 업데이트 시, 외래키 값을 null로 설정합니다.              |
| `$table->noActionOnUpdate();` | 업데이트 시 아무런 동작을 하지 않습니다.                |
| `$table->cascadeOnDelete();`  | 삭제 시, 연쇄적으로 반영(cascade)합니다.                |
| `$table->restrictOnDelete();` | 삭제를 제한합니다.                                     |
| `$table->nullOnDelete();`     | 삭제 시, 외래키 값을 null로 설정합니다.                 |
| `$table->noActionOnDelete();` | 자식 레코드가 존재할 때 삭제를 막습니다.                |

</div>

추가적인 [컬럼 수정자](#column-modifiers)는 반드시 `constrained` 메서드 호출 이전에 체이닝해야 합니다.

```php
$table->foreignId('user_id')
    ->nullable()
    ->constrained();
```

<a name="dropping-foreign-keys"></a>
#### 외래키 삭제하기

외래키를 삭제하려면, 삭제할 외래키 제약조건명을 인자로 넘겨 `dropForeign` 메서드를 사용합니다. 외래키 명명 규칙 역시 인덱스와 동일하게, 테이블명과 컬럼명을 기반으로 "\_foreign"을 붙입니다.

```php
$table->dropForeign('posts_user_id_foreign');
```

또는, 외래키가 있는 컬럼명을 배열로 전달하면 라라벨이 내부 규칙을 따르며 제약조건명을 생성해 삭제합니다.

```php
$table->dropForeign(['user_id']);
```

<a name="toggling-foreign-key-constraints"></a>
#### 외래키 제약조건 활성/비활성화

마이그레이션 내에서 아래 메서드를 사용해 외래키 제약조건을 활성화하거나 비활성화할 수 있습니다.

```php
Schema::enableForeignKeyConstraints();

Schema::disableForeignKeyConstraints();

Schema::withoutForeignKeyConstraints(function () {
    // 이 클로저 내부에서는 제약조건이 비활성화됩니다...
});
```

> [!WARNING]
> SQLite에서는 기본적으로 외래키 제약조건이 비활성화되어 있습니다. SQLite를 사용한다면, 마이그레이션에서 외래키를 적용하기 전에 반드시 [데이터베이스 설정에서 외래키 지원을 활성화](/docs/database#configuration)해야 합니다.

<a name="events"></a>
## 이벤트(Events)

편의를 위해, 각 마이그레이션 작업은 [이벤트](/docs/events)를 디스패치합니다. 아래의 각 이벤트들은 기본 클래스인 `Illuminate\Database\Events\MigrationEvent`를 상속합니다.

<div class="overflow-auto">

| 클래스                                            | 설명                                               |
| ------------------------------------------------ | ------------------------------------------------ |
| `Illuminate\Database\Events\MigrationsStarted`   | 마이그레이션 일괄 실행이 시작되기 직전입니다.         |
| `Illuminate\Database\Events\MigrationsEnded`     | 마이그레이션 일괄 실행이 모두 끝났을 때입니다.         |
| `Illuminate\Database\Events\MigrationStarted`    | 단일 마이그레이션이 실행되기 직전입니다.              |
| `Illuminate\Database\Events\MigrationEnded`      | 단일 마이그레이션 실행이 완료되었을 때입니다.          |
| `Illuminate\Database\Events\NoPendingMigrations` | 실행할 대기 중인 마이그레이션이 없을 때 발생합니다.     |
| `Illuminate\Database\Events\SchemaDumped`        | 데이터베이스 스키마 덤프가 완료되었을 때 발생합니다.    |
| `Illuminate\Database\Events\SchemaLoaded`        | 기존 데이터베이스 스키마 덤프가 로드되었을 때 발생합니다. |

</div>