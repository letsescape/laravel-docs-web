# 업그레이드 안내서 (Upgrade Guide)

- [10.x에서 11.0으로 업그레이드하기](#upgrade-11.0)

<a name="high-impact-changes"></a>
## 영향도가 큰 변경 사항

<div class="content-list" markdown="1">

- [의존성 업데이트](#updating-dependencies)
- [애플리케이션 구조](#application-structure)
- [부동 소수점 타입](#floating-point-types)
- [컬럼 수정](#modifying-columns)
- [SQLite 최소 버전](#sqlite-minimum-version)
- [Sanctum 업데이트](#updating-sanctum)

</div>

<a name="medium-impact-changes"></a>
## 영향도가 중간인 변경 사항

<div class="content-list" markdown="1">

- [Carbon 3](#carbon-3)
- [비밀번호 재해시(재해싱)](#password-rehashing)
- [초 단위 Rate Limiting](#per-second-rate-limiting)
- [Spatie Once 패키지](#spatie-once-package)

</div>

<a name="low-impact-changes"></a>
## 영향도가 낮은 변경 사항

<div class="content-list" markdown="1">

- [Doctrine DBAL 제거](#doctrine-dbal-removal)
- [Eloquent 모델 `casts` 메서드](#eloquent-model-casts-method)
- [공간(Spatial) 타입](#spatial-types)
- [`Enumerable` 계약(Contract)](#the-enumerable-contract)
- [`UserProvider` 계약(Contract)](#the-user-provider-contract)
- [`Authenticatable` 계약(Contract)](#the-authenticatable-contract)

</div>

<a name="upgrade-11.0"></a>
## 10.x에서 11.0으로 업그레이드하기

<a name="estimated-upgrade-time-??-minutes"></a>
#### 예상 업그레이드 소요 시간: 15분

> [!NOTE]  
> 가능한 모든 호환성 깨짐(breaking change) 사항을 문서화하려고 노력했으나, 일부 변경 사항은 프레임워크의 잘 사용하지 않는 부분에서만 적용될 수 있습니다. 실제로 전체 변경 사항 중 일부만이 여러분의 애플리케이션에 영향을 줄 수 있습니다. 시간을 아끼고 싶다면, [Laravel Shift](https://laravelshift.com/)를 사용하여 애플리케이션 업그레이드를 자동화할 수 있습니다.

<a name="updating-dependencies"></a>
### 의존성 업데이트

**영향도: 높음**

#### PHP 8.2.0 필수

이제 라라벨은 PHP 8.2.0 이상이 필요합니다.

#### curl 7.34.0 필수

라라벨의 HTTP 클라이언트는 curl 7.34.0 이상을 필요로 합니다.

#### Composer 의존성

애플리케이션의 `composer.json` 파일 내 다음 의존성들을 업데이트하세요:

<div class="content-list" markdown="1">

- `laravel/framework`를 `^11.0`으로
- `nunomaduro/collision`을 `^8.1`로
- `laravel/breeze`를 `^2.0`으로 (설치된 경우)
- `laravel/cashier`를 `^15.0`으로 (설치된 경우)
- `laravel/dusk`를 `^8.0`으로 (설치된 경우)
- `laravel/jetstream`을 `^5.0`으로 (설치된 경우)
- `laravel/octane`을 `^2.3`으로 (설치된 경우)
- `laravel/passport`를 `^12.0`으로 (설치된 경우)
- `laravel/sanctum`을 `^4.0`으로 (설치된 경우)
- `laravel/scout`를 `^10.0`으로 (설치된 경우)
- `laravel/spark-stripe`를 `^5.0`으로 (설치된 경우)
- `laravel/telescope`를 `^5.0`으로 (설치된 경우)
- `livewire/livewire`를 `^3.4`로 (설치된 경우)
- `inertiajs/inertia-laravel`을 `^1.0`으로 (설치된 경우)

</div>

애플리케이션에서 Laravel Cashier Stripe, Passport, Sanctum, Spark Stripe, Telescope 중 하나라도 사용하고 있다면, 해당 패키지들의 migration을 애플리케이션으로 퍼블리시해야 합니다. 이제 Cashier Stripe, Passport, Sanctum, Spark Stripe, Telescope는 **자체 migrations 디렉토리에서 migration을 자동으로 로드하지 않습니다.** 따라서, 아래 명령어로 migration 파일을 퍼블리시하세요:

```bash
php artisan vendor:publish --tag=cashier-migrations
php artisan vendor:publish --tag=passport-migrations
php artisan vendor:publish --tag=sanctum-migrations
php artisan vendor:publish --tag=spark-migrations
php artisan vendor:publish --tag=telescope-migrations
```

추가로, 각 패키지의 업그레이드 가이드를 꼭 확인하시어 추가적인 호환성 깨짐(breaking change) 사항을 숙지하시기 바랍니다:

- [Laravel Cashier Stripe](#cashier-stripe)
- [Laravel Passport](#passport)
- [Laravel Sanctum](#sanctum)
- [Laravel Spark Stripe](#spark-stripe)
- [Laravel Telescope](#telescope)

라라벨 설치 도구(Laravel installer)를 별도로 설치한 경우, 아래 명령어로 Composer를 통해 installer도 업데이트하세요:

```bash
composer global require laravel/installer:^5.6
```

마지막으로, 이전에 애플리케이션에 `doctrine/dbal` Composer 의존성을 추가했다면 이제 제거해도 됩니다. 라라벨은 더 이상 이 패키지에 의존하지 않습니다.

<a name="application-structure"></a>
### 애플리케이션 구조

Laravel 11은 더 적은 수의 기본 파일을 갖는 새로운 기본 애플리케이션 구조를 도입했습니다. 즉, 새로 생성되는 라라벨 애플리케이션에서는 서비스 프로바이더, 미들웨어, 설정 파일의 기본 제공 개수가 줄었습니다.

다만, 기존 Laravel 10 애플리케이션이 11로 업그레이드할 때 애플리케이션 구조를 Laravel 11의 새로운 방식으로 변경하는 것은 **권장하지 않습니다.** Laravel 11은 기존 Laravel 10 구조도 지원하도록 신중히 설계되었습니다.

<a name="authentication"></a>
### 인증(Authentication)

<a name="password-rehashing"></a>
#### 비밀번호 재해시(재해싱)

**영향도: 낮음**

Laravel 11에서는 해시 알고리즘의 "작업 계수(work factor)"가 마지막으로 비밀번호를 해싱한 이후로 변경된 경우, 인증 중에 사용자의 비밀번호를 자동으로 다시 해싱(재해싱)합니다.

일반적으로 이 기능은 애플리케이션의 동작에 방해가 되지 않지만, 만약 `User` 모델에서 "password" 컬럼명이 `password`가 아니라 다른 이름이라면, 해당 필드명을 모델의 `authPasswordName` 속성(property)으로 명시해야 합니다:

```
protected $authPasswordName = 'custom_password_field';
```

또는, 비밀번호 재해싱 기능 자체를 비활성화하고 싶다면, `config/hashing.php` 설정 파일에 `rehash_on_login` 옵션을 추가하면 됩니다:

```
'rehash_on_login' => false,
```

<a name="the-user-provider-contract"></a>
#### `UserProvider` 계약(Contract)

**영향도: 낮음**

`Illuminate\Contracts\Auth\UserProvider` 계약(Contract)에 새로운 `rehashPasswordIfRequired` 메서드가 추가되었습니다. 이 메서드는 해시 알고리즘의 작업 계수가 변경되었을 때 사용자의 비밀번호를 다시 해시(재해싱)하고 저장하는 역할을 담당합니다.

여러분의 애플리케이션이나 패키지에서 이 인터페이스를 직접 구현하고 있다면, 반드시 새로운 `rehashPasswordIfRequired` 메서드를 구현에 추가해야 합니다. 참고 구현은 `Illuminate\Auth\EloquentUserProvider` 클래스에서 확인할 수 있습니다:

```php
public function rehashPasswordIfRequired(Authenticatable $user, array $credentials, bool $force = false);
```

<a name="the-authenticatable-contract"></a>
#### `Authenticatable` 계약(Contract)

**영향도: 낮음**

`Illuminate\Contracts\Auth\Authenticatable` 계약(Contract)에 `getAuthPasswordName` 메서드가 새로 추가되었습니다. 이 메서드는 인증 가능한 엔티티의 비밀번호 컬럼명을 반환하는 역할을 합니다.

여러분의 애플리케이션 또는 패키지에서 이 인터페이스를 직접 구현하고 있다면, 다음과 같이 이 메서드를 정의해야 합니다:

```php
public function getAuthPasswordName()
{
    return 'password';
}
```

라라벨이 기본으로 제공하는 `User` 모델에는 이미 이 메서드가 적용되어 있으니, 별도의 구현이 필요하지 않습니다.

<a name="the-authentication-exception-class"></a>
#### `AuthenticationException` 클래스

**영향도: 매우 낮음**

`Illuminate\Auth\AuthenticationException` 클래스의 `redirectTo` 메서드는 이제 첫 번째 인수로 `Illuminate\Http\Request` 인스턴스를 필요로 합니다. 이 예외를 직접 캐치해서 `redirectTo` 메서드를 호출하고 있다면, 코드를 다음과 같이 수정해야 합니다:

```php
if ($e instanceof AuthenticationException) {
    $path = $e->redirectTo($request);
}
```

<a name="email-verification-notification-on-registration"></a>
#### 회원가입 시 이메일 인증 알림

**영향도: 매우 낮음**

`SendEmailVerificationNotification` 리스너는 이제 애플리케이션의 `EventServiceProvider`에서 이미 등록되어 있지 않은 경우, `Registered` 이벤트에 자동 등록됩니다. 만약 여러분의 `EventServiceProvider`는 이 리스너를 등록하지 않고, 라라벨이 자동으로 등록하는 것도 원하지 않는다면, `EventServiceProvider`에 빈 `configureEmailVerification` 메서드를 정의하세요:

```php
protected function configureEmailVerification()
{
    // ...
}
```

<a name="cache"></a>
### 캐시(Cache)

<a name="cache-key-prefixes"></a>
#### 캐시 키 접두어(Prefix)

**영향도: 매우 낮음**

기존에는 DynamoDB, Memcached, Redis 캐시 저장소에 대해 캐시 키 접두어를 정의하면, 라라벨이 자동으로 접두어 끝에 `:`(콜론)을 붙였습니다. 하지만 Laravel 11부터는 접두어 끝에 `:`가 자동으로 붙지 않습니다. 이전과 같은 접두어 방식을 유지하려면, 캐시 키 접두어에 직접 `:`를 추가하면 됩니다.

<a name="collections"></a>
### 컬렉션(Collections)

<a name="the-enumerable-contract"></a>
#### `Enumerable` 계약(Contract)

**영향도: 낮음**

`Illuminate\Support\Enumerable` 계약(Contract)의 `dump` 메서드는 이제 가변 인수(variadic)인 `...$args`를 받도록 변경되었습니다. 이 인터페이스를 직접 구현하고 있다면, 다음과 같이 메서드 시그니처를 수정해야 합니다:

```php
public function dump(...$args);
```

<a name="database"></a>
### 데이터베이스(Database)

<a name="sqlite-minimum-version"></a>
#### SQLite 3.26.0 이상 필수

**영향도: 높음**

애플리케이션에서 SQLite 데이터베이스를 사용 중이라면, SQLite 3.26.0 이상이 반드시 필요합니다.

<a name="eloquent-model-casts-method"></a>
#### Eloquent 모델의 `casts` 메서드

**영향도: 낮음**

Eloquent의 기본 모델 클래스에 이제 속성 캐스팅을 지원하기 위한 `casts` 메서드가 추가되었습니다. 만약 여러분 애플리케이션의 모델 중에서 `casts`라는 이름으로 연관관계를 정의하고 있었다면, 이 변경으로 인해 충돌이 발생할 수 있습니다.

<a name="modifying-columns"></a>
#### 컬럼 수정

**영향도: 높음**

컬럼을 수정할 때, 이제 변경 이후에도 유지하고 싶은 모든 수정자(modifier)를 명시적으로 컬럼 정의에 포함해야 합니다. 누락된 속성은 사라집니다. 예를 들어, `unsigned`, `default`, `comment`와 같은 속성을 유지하고자 한다면, 컬럼을 변경할 때 반드시 각각의 수정자를 다시 호출해 주어야 합니다. 즉, 이전 마이그레이션에서 할당했던 속성들도 변경 시점에 모두 명시적으로 지정해야 합니다.

예를 들어, `unsigned`, `default`, `comment`가 모두 적용된 `votes` 컬럼을 이전 마이그레이션에서 생성했다고 가정해 보겠습니다:

```php
Schema::create('users', function (Blueprint $table) {
    $table->integer('votes')->unsigned()->default(1)->comment('The vote count');
});
```

이후, `votes` 컬럼을 `nullable`로 변경하고자 할 때:

```php
Schema::table('users', function (Blueprint $table) {
    $table->integer('votes')->nullable()->change();
});
```

Laravel 10에서는 위 마이그레이션이 기존의 `unsigned`, `default`, `comment` 속성을 그대로 유지하였으나, Laravel 11에서는 해당 속성들이 사라집니다. 따라서 다음과 같이 모든 속성을 명시해주어야 합니다:

```php
Schema::table('users', function (Blueprint $table) {
    $table->integer('votes')
        ->unsigned()
        ->default(1)
        ->comment('The vote count')
        ->nullable()
        ->change();
});
```

`change` 메서드는 컬럼의 인덱스에는 영향을 주지 않습니다. 따라서, 컬럼을 수정할 때 인덱스를 명시적으로 추가하거나 제거하고 싶다면 추가적인 인덱스 수정자를 chain 할 수 있습니다:

```php
// 인덱스 추가...
$table->bigIncrements('id')->primary()->change();

// 인덱스 제거...
$table->char('postal_code', 10)->unique(false)->change();
```

기존 "change" 마이그레이션들을 모두 업데이트하여 컬럼의 기존 속성을 유지하는 것이 번거롭다면, [마이그레이션 스쿼시 기능](/docs/11.x/migrations#squashing-migrations)을 사용하세요:

```bash
php artisan schema:dump
```

마이그레이션이 스쿼시(squash)된 후, 라라벨은 애플리케이션의 스키마 파일을 이용해 데이터베이스를 "마이그레이션" 한 다음, 남아 있는 마이그레이션만 실행합니다.

<a name="floating-point-types"></a>
#### 부동 소수점 타입(Floating-Point Types)

**영향도: 높음**

`double` 및 `float` 마이그레이션 컬럼 타입이 모든 데이터베이스에서 일관되게 동작하도록 재작성되었습니다.

`double` 컬럼 타입은 이제 표준 SQL 문법에 따라 전체 자릿수(전체 숫자 개수)와 소수점 자릿수(places) 없이 `DOUBLE` 타입 컬럼을 만듭니다. 따라서 `$total`, `$places` 인수를 제거할 수 있습니다:

```php
$table->double('amount');
```

`float` 컬럼 타입은 마찬가지로 전체 자릿수와 소수점 자릿수 지정 없이 `FLOAT` 타입 컬럼을 만듭니다. 단, 선택적으로 `$precision` 인수를 지정해 4바이트 단정밀도/8바이트 배정밀도(precision) 컬럼 저장 방식을 조정할 수 있습니다. 이때 데이터베이스 문서를 참고하여 적절한 값을 넣으세요:

```php
$table->float('amount', precision: 53);
```

`unsignedDecimal`, `unsignedDouble`, `unsignedFloat` 메서드는 삭제되었습니다. 해당 컬럼 타입들의 unsigned 속성은 MySQL에서 폐지되었고, 다른 데이터베이스에도 표준이 아니었기 때문입니다. 만약 여전히 unsigned 속성이 필요하다면, 컬럼 정의에 `unsigned` 메서드를 chain 하세요:

```php
$table->decimal('amount', total: 8, places: 2)->unsigned();
$table->double('amount')->unsigned();
$table->float('amount', precision: 53)->unsigned();
```

<a name="dedicated-mariadb-driver"></a>
#### 독립 MariaDB 드라이버

**영향도: 매우 낮음**

MariaDB 데이터베이스에 연결할 때 항상 MySQL 드라이버만 사용해왔지만, Laravel 11에서는 MariaDB 전용 드라이버가 추가되었습니다.

MariaDB 데이터베이스와 연결할 경우, 앞으로는 `mariadb` 드라이버를 새롭게 연결 설정에 지정하여, 향후 MariaDB 고유 기능을 활용할 수 있습니다:

```
'driver' => 'mariadb',
'url' => env('DB_URL'),
'host' => env('DB_HOST', '127.0.0.1'),
'port' => env('DB_PORT', '3306'),
// ...
```

현재 이 MariaDB 드라이버는 기존 MySQL 드라이버와 동일하게 동작하지만, 한 가지 예외가 있습니다: `uuid` 스키마 빌더 메서드는 기존의 `char(36)` 대신 MariaDB에서 네이티브 UUID 컬럼을 생성합니다.

기존 migration에서 `uuid` 메서드를 사용했고, 새 MariaDB 드라이버로 변경한다면, 호환성 문제를 피하기 위해 migration에서 `uuid` 대신 `char` 사용을 권장합니다:

```php
Schema::table('users', function (Blueprint $table) {
    $table->char('uuid', 36);

    // ...
});
```

<a name="spatial-types"></a>
#### 공간(Spatial) 타입

**영향도: 낮음**

데이터베이스 마이그레이션의 공간 컬럼 타입이 모든 데이터베이스에서 일관되게 동작하도록 개선되었습니다. 기존의 `point`, `lineString`, `polygon`, `geometryCollection`, `multiPoint`, `multiLineString`, `multiPolygon`, `multiPolygonZ` 등은 migration에서 제거하고, 대신 `geometry`나 `geography` 메서드를 사용하세요:

```php
$table->geometry('shapes');
$table->geography('coordinates');
```

특정 컬럼에 저장되는 값 타입이나 공간 참조 시스템 식별자(SRID)를 MySQL, MariaDB, PostgreSQL에서 명확하게 제한하고 싶으면, `subtype`과 `srid`를 추가 인수로 넘기세요:

```php
$table->geometry('dimension', subtype: 'polygon', srid: 0);
$table->geography('latitude', subtype: 'point', srid: 4326);
```

PostgreSQL 문법의 `isGeometry`, `projection` 컬럼 수정자는 이번 변경에 따라 제거되었습니다.

<a name="doctrine-dbal-removal"></a>
#### Doctrine DBAL 제거

**영향도: 낮음**

아래의 Doctrine DBAL 관련 클래스 및 메서드가 삭제되었습니다. 이제 라라벨은 더 이상 이 패키지에 의존하지 않으며, 다양한 컬럼 타입 생성/변경을 위한 커스텀 Doctrine 타입 등록도 더는 필요하지 않습니다:

<div class="content-list" markdown="1">

- `Illuminate\Database\Schema\Builder::$alwaysUsesNativeSchemaOperationsIfPossible` 클래스 프로퍼티
- `Illuminate\Database\Schema\Builder::useNativeSchemaOperationsIfPossible()` 메서드
- `Illuminate\Database\Connection::usingNativeSchemaOperations()` 메서드
- `Illuminate\Database\Connection::isDoctrineAvailable()` 메서드
- `Illuminate\Database\Connection::getDoctrineConnection()` 메서드
- `Illuminate\Database\Connection::getDoctrineSchemaManager()` 메서드
- `Illuminate\Database\Connection::getDoctrineColumn()` 메서드
- `Illuminate\Database\Connection::registerDoctrineType()` 메서드
- `Illuminate\Database\DatabaseManager::registerDoctrineType()` 메서드
- `Illuminate\Database\PDO` 디렉터리
- `Illuminate\Database\DBAL\TimestampType` 클래스
- `Illuminate\Database\Schema\Grammars\ChangeColumn` 클래스
- `Illuminate\Database\Schema\Grammars\RenameColumn` 클래스
- `Illuminate\Database\Schema\Grammars\Grammar::getDoctrineTableDiff()` 메서드

</div>

또한, 애플리케이션 설정 파일 `database` 내 `dbal.types`로 Doctrine 타입을 등록하던 것도 더는 필요하지 않습니다.

이전까지 Doctrine DBAL을 사용해 데이터베이스 및 테이블 정보를 확인했다면, 이제는 라라벨의 새로운 네이티브 스키마 메서드들(`Schema::getTables()`, `Schema::getColumns()`, `Schema::getIndexes()`, `Schema::getForeignKeys()` 등)을 사용하면 됩니다.

<a name="deprecated-schema-methods"></a>
#### Deprecated Schema 메서드

**영향도: 매우 낮음**

이전의 Doctrine 기반 `Schema::getAllTables()`, `Schema::getAllViews()`, `Schema::getAllTypes()` 메서드가 삭제되었습니다. 이제 라라벨의 네이티브 `Schema::getTables()`, `Schema::getViews()`, `Schema::getTypes()` 메서드를 대신 사용하세요.

PostgreSQL, SQL Server를 사용할 땐 새로운 스키마 메서드들은 세 부분으로 된 참조(예: `database.schema.table`)를 허용하지 않습니다. 따라서, 데이터베이스를 선언하려면 `connection()`을 사용해야 합니다:

```php
Schema::connection('database')->hasTable('schema.table');
```

<a name="get-column-types"></a>
#### 스키마 빌더 `getColumnType()` 메서드

**영향도: 매우 낮음**

이제 `Schema::getColumnType()` 메서드는 해당 컬럼의 실제 타입(actual type)만 반환하며, 더 이상 Doctrine DBAL 기준의 타입을 반환하지 않습니다.

<a name="database-connection-interface"></a>
#### 데이터베이스 연결 인터페이스

**영향도: 매우 낮음**

`Illuminate\Database\ConnectionInterface` 인터페이스에 새로운 `scalar` 메서드가 추가되었습니다. 이 인터페이스를 직접 구현하고 있다면, 반드시 `scalar` 메서드를 추가하세요:

```php
public function scalar($query, $bindings = [], $useReadPdo = true);
```

<a name="dates"></a>
### 날짜(Dates)

<a name="carbon-3"></a>
#### Carbon 3

**영향도: 중간**

라라벨 11은 Carbon 2, Carbon 3을 모두 지원합니다. Carbon은 라라벨 및 생태계 전반에 폭넓게 사용되는 날짜 조작 라이브러리입니다. Carbon 3으로 업그레이드할 경우, `diffIn*` 계열 메서드가 이제 부동 소수점 값을 반환하고, 시간 방향을 뜻하는 음수 값이 반환될 수 있습니다. 이는 Carbon 2와 비교해 중요한 변화입니다. 자세한 사항은 Carbon의 [변경 내역](https://github.com/briannesbitt/Carbon/releases/tag/3.0.0)과 [공식 문서](https://carbon.nesbot.com/docs/#api-carbon-3)를 참고하세요.

<a name="mail"></a>
### 메일(Mail)

<a name="the-mailer-contract"></a>
#### `Mailer` 계약(Contract)

**영향도: 매우 낮음**

`Illuminate\Contracts\Mail\Mailer` 계약(Contract)에 `sendNow` 메서드가 새롭게 추가되었습니다. 이 계약을 직접 구현하는 애플리케이션 또는 패키지라면, 반드시 해당 메서드를 추가하세요:

```php
public function sendNow($mailable, array $data = [], $callback = null);
```

<a name="packages"></a>
### 패키지(Packages)

<a name="publishing-service-providers"></a>
#### 서비스 프로바이더를 애플리케이션에 퍼블리시

**영향도: 매우 낮음**

패키지에서 수동으로 서비스 프로바이더를 애플리케이션의 `app/Providers` 디렉터리에 퍼블리시하고, 직접 `config/app.php` 파일을 수정해서 서비스 프로바이더를 등록했다면, 앞으로는 새롭게 추가된 `ServiceProvider::addProviderToBootstrapFile` 메서드를 사용해야 합니다.

이 메서드는 퍼블리시한 서비스 프로바이더를 자동으로 애플리케이션의 `bootstrap/providers.php` 파일에 추가합니다. 즉, Laravel 11 이상에서는 `config/app.php`에서 더는 `providers` 배열을 사용하지 않습니다.

```php
use Illuminate\Support\ServiceProvider;

ServiceProvider::addProviderToBootstrapFile(Provider::class);
```

<a name="queues"></a>
### 큐(Queues)

<a name="the-batch-repository-interface"></a>
#### `BatchRepository` 인터페이스

**영향도: 매우 낮음**

`Illuminate\Bus\BatchRepository` 인터페이스에 새로운 `rollBack` 메서드가 추가되었습니다. 자체적으로 이 인터페이스를 구현하는 패키지, 애플리케이션은 이 메서드를 추가해야 합니다:

```php
public function rollBack();
```

<a name="synchronous-jobs-in-database-transactions"></a>
#### 데이터베이스 트랜잭션 내 동기(즉시) 실행 잡

**영향도: 매우 낮음**

이전에는 동기 큐 잡(sync 큐 드라이버 사용)이 `after_commit` 큐 연결 옵션이나 잡의 `afterCommit` 메서드와 관계없이 항상 즉시 실행되었습니다.

Laravel 11에서는 동기 큐 잡도 이제 "after commit" 큐 연결 설정 또는 잡의 지정에 따라, 트랜잭션 커밋 후에 실행됩니다.

<a name="rate-limiting"></a>
### 라이트 리미팅(Rate Limiting)

<a name="per-second-rate-limiting"></a>
#### 초 단위 Rate Limiting

**영향도: 중간**

Laravel 11은 분(minute) 단위에만 국한된 것이 아니라, 초(second) 단위 Rate Limiting을 지원합니다. 이에 따르는 다양한 호환성 깨짐(breaking change) 상황이 있으니 주의가 필요합니다.

`GlobalLimit` 클래스 생성자는 이제 분 대신 초 단위 값을 받습니다. 이 클래스는 문서화되지 않았으며 일반적으로 직접 사용할 일은 거의 없습니다:

```php
new GlobalLimit($attempts, 2 * 60);
```

`Limit` 클래스 생성자도 분(minute) 대신 초(second) 단위 값을 받습니다. 공식 문서에서 안내하는 대부분의 사용법(`Limit::perMinute`, `Limit::perSecond` 등의 static 생성자)에는 변화가 없지만, 클래스를 수동으로 직접 생성한다면 초 단위(second) 값을 넘기도록 코드를 변경해야 합니다:

```php
new Limit($key, $attempts, 2 * 60);
```

`Limit` 클래스의 `decayMinutes` 속성명은 `decaySeconds`로 변경되었으며, 이제 분이 아니라 초 단위를 가집니다.

`Illuminate\Queue\Middleware\ThrottlesExceptions` 및 `Illuminate\Queue\Middleware\ThrottlesExceptionsWithRedis` 클래스의 생성자도 이제 분이 아니라 초 단위 값을 받습니다:

```php
new ThrottlesExceptions($attempts, 2 * 60);
new ThrottlesExceptionsWithRedis($attempts, 2 * 60);
```

<a name="cashier-stripe"></a>
### Cashier Stripe

<a name="updating-cashier-stripe"></a>
#### Cashier Stripe 업그레이드

**영향도: 높음**

라라벨 11은 더 이상 Cashier Stripe 14.x를 지원하지 않습니다. 애플리케이션의 `composer.json` 파일에서 Cashier Stripe 의존성을 반드시 `^15.0`으로 업데이트해야 합니다.

Cashier Stripe 15.0은 더 이상 자체 마이그레이션 디렉터리에서 migration을 자동 로드하지 않습니다. 대신 다음 명령어로 migration을 애플리케이션에 퍼블리시해야 합니다:

```shell
php artisan vendor:publish --tag=cashier-migrations
```

추가로, 자세한 호환성 깨짐(breaking change) 정보는 [Cashier Stripe 업그레이드 가이드](https://github.com/laravel/cashier-stripe/blob/15.x/UPGRADE.md)를 참고하세요.

<a name="spark-stripe"></a>
### Spark (Stripe)

<a name="updating-spark-stripe"></a>
#### Spark Stripe 업그레이드

**영향도: 높음**

라라벨 11은 더 이상 Laravel Spark Stripe 4.x를 지원하지 않습니다. 따라서, Spark Stripe 의존성을 반드시 `^5.0`으로 업데이트해야 합니다.

Spark Stripe 5.0은 자체 마이그레이션 디렉터리에서 migration을 자동으로 로드하지 않습니다. 다음 명령어로 마이그레이션을 직접 애플리케이션에 퍼블리시하세요:

```shell
php artisan vendor:publish --tag=spark-migrations
```

추가 정보는 [Spark Stripe 업그레이드 가이드](https://spark.laravel.com/docs/spark-stripe/upgrade.html)를 참고하세요.

<a name="passport"></a>
### Passport

<a name="updating-telescope"></a>
#### Passport 업그레이드

**영향도: 높음**

라라벨 11은 더 이상 Laravel Passport 11.x를 지원하지 않습니다. 반드시 Passport 의존성을 `^12.0`으로 업데이트하세요.

Passport 12.0부터는 자체 마이그레이션 디렉터리에서 migration을 자동으로 로드하지 않습니다. 다음 명령어로 migration을 퍼블리시해야 합니다:

```shell
php artisan vendor:publish --tag=passport-migrations
```

또한, Password Grant 타입이 기본적으로 비활성화되었습니다. 이를 활성화하려면 `AppServiceProvider`의 `boot` 메서드에서 `enablePasswordGrant` 메서드를 호출하면 됩니다:

```
public function boot(): void
{
    Passport::enablePasswordGrant();
}
```

<a name="sanctum"></a>
### Sanctum

<a name="updating-sanctum"></a>
#### Sanctum 업그레이드

**영향도: 높음**

라라벨 11은 더 이상 Laravel Sanctum 3.x를 지원하지 않습니다. 반드시 `composer.json`에서 Sanctum 의존성을 `^4.0`으로 업데이트해야 합니다.

Sanctum 4.0은 자체 마이그레이션 디렉터리에서 migration을 더 이상 자동으로 로드하지 않습니다. 다음 명령어로 migration을 퍼블리시하세요:

```shell
php artisan vendor:publish --tag=sanctum-migrations
```

그런 다음, 애플리케이션의 `config/sanctum.php` 설정 파일에서 `authenticate_session`, `encrypt_cookies`, `validate_csrf_token` 미들웨어 참조를 아래처럼 업데이트해야 합니다:

```
'middleware' => [
    'authenticate_session' => Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
    'encrypt_cookies' => Illuminate\Cookie\Middleware\EncryptCookies::class,
    'validate_csrf_token' => Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,
],
```

<a name="telescope"></a>
### Telescope

<a name="updating-telescope"></a>
#### Telescope 업그레이드

**영향도: 높음**

라라벨 11은 더 이상 Laravel Telescope 4.x를 지원하지 않습니다. 반드시 Telescope 의존성을 `^5.0`으로 업데이트해야 합니다.

Telescope 5.0 역시 자체 마이그레이션 디렉터리에서 migration을 더 이상 자동으로 로드하지 않습니다. 다음 명령어로 migration을 퍼블리시하세요:

```shell
php artisan vendor:publish --tag=telescope-migrations
```

<a name="spatie-once-package"></a>
### Spatie Once 패키지

**영향도: 중간**

라라벨 11에는 특정 클로저가 한 번만 실행되도록 보장하는 자체 [`once` 함수](/docs/11.x/helpers#method-once)가 추가되었습니다. 따라서 기존에 `spatie/once` 패키지에 의존하고 있었다면, 충돌을 방지하기 위해 `composer.json`에서 해당 의존성을 제거하시기 바랍니다.

<a name="miscellaneous"></a>
### 기타 변경 사항

`laravel/laravel` [GitHub 저장소](https://github.com/laravel/laravel)를 참고하여, 변경된 파일 목록을 확인하시길 권장합니다. 대부분의 변경은 필수가 아니지만, 애플리케이션과 최신 상태를 맞추고 싶다면 변경된 파일을 참고해볼 수 있습니다. 일부 변경 사항은 이 업그레이드 안내서에서 설명하지만, 설정 파일이나 주석 등의 기타 수정은 포함되어 있지 않으니, [GitHub 비교 도구](https://github.com/laravel/laravel/compare/10.x...11.x)를 활용해 중요한 업데이트를 직접 확인하세요.
