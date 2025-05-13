# 캐시 (Cache)

- [소개](#introduction)
- [설정](#configuration)
    - [드라이버 선행 조건](#driver-prerequisites)
- [캐시 사용법](#cache-usage)
    - [캐시 인스턴스 얻기](#obtaining-a-cache-instance)
    - [캐시에서 항목 가져오기](#retrieving-items-from-the-cache)
    - [캐시에 항목 저장하기](#storing-items-in-the-cache)
    - [캐시에서 항목 삭제하기](#removing-items-from-the-cache)
    - [캐시 메모이제이션](#cache-memoization)
    - [캐시 헬퍼 함수](#the-cache-helper)
- [원자적 락(Atomic Locks)](#atomic-locks)
    - [락 관리하기](#managing-locks)
    - [프로세스 간 락 관리](#managing-locks-across-processes)
- [사용자 정의 캐시 드라이버 추가하기](#adding-custom-cache-drivers)
    - [드라이버 작성](#writing-the-driver)
    - [드라이버 등록](#registering-the-driver)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

애플리케이션에서 처리하는 데이터 조회 또는 데이터 처리 작업 중에는 CPU를 많이 사용하거나, 몇 초 이상 소요되는 작업이 있을 수 있습니다. 이런 경우, 결과 데이터를 일정 시간 동안 캐시에 저장해두면 동일한 데이터 요청이 다시 들어올 때 신속하게 반환할 수 있습니다. 캐시 데이터는 일반적으로 [Memcached](https://memcached.org) 나 [Redis](https://redis.io)처럼 매우 빠른 데이터 저장소에 보관합니다.

라라벨은 여러 가지 캐시 백엔드를 아우르는 직관적이고 통합된 API를 제공하여, 이러한 고속 데이터 조회 기능을 쉽게 활용하고 웹 애플리케이션의 속도를 크게 높일 수 있도록 지원합니다.

<a name="configuration"></a>
## 설정

애플리케이션의 캐시 설정 파일은 `config/cache.php`에 위치합니다. 이 파일에서는 애플리케이션 전반에서 기본적으로 사용할 캐시 저장소를 지정할 수 있습니다. 라라벨은 [Memcached](https://memcached.org), [Redis](https://redis.io), [DynamoDB](https://aws.amazon.com/dynamodb), 관계형 데이터베이스 등 널리 사용되는 캐시 백엔드를 기본으로 지원합니다. 또한 파일 기반 캐시 드라이버도 사용할 수 있으며, `array`와 `null` 캐시 드라이버는 자동화된 테스트에 유용한 간편한 백엔드를 제공합니다.

캐시 설정 파일에는 이 외에도 다양한 옵션이 있으니, 필요에 따라 확인하시기 바랍니다. 기본적으로 라라벨은 `database` 캐시 드라이버가 설정되어 있으며, 직렬화된 캐시 객체를 애플리케이션의 데이터베이스에 저장합니다.

<a name="driver-prerequisites"></a>
### 드라이버 선행 조건

<a name="prerequisites-database"></a>
#### 데이터베이스

`database` 캐시 드라이버를 사용할 때는 캐시 데이터를 저장할 데이터베이스 테이블이 필요합니다. 보통 이 테이블은 라라벨의 기본 마이그레이션 파일인 `0001_01_01_000001_create_cache_table.php`에 포함되어 있습니다. 만약 이 마이그레이션이 없다면, `make:cache-table` 아티즌 명령어를 사용해서 생성할 수 있습니다.

```shell
php artisan make:cache-table

php artisan migrate
```

<a name="memcached"></a>
#### Memcached

Memcached 드라이버를 사용하려면 [Memcached PECL 패키지](https://pecl.php.net/package/memcached)를 설치해야 합니다. 여러 Memcached 서버를 `config/cache.php` 설정 파일에 등록할 수 있습니다. 이 파일에는 이미 참고할 수 있는 `memcached.servers` 항목이 들어 있습니다.

```php
'memcached' => [
    // ...

    'servers' => [
        [
            'host' => env('MEMCACHED_HOST', '127.0.0.1'),
            'port' => env('MEMCACHED_PORT', 11211),
            'weight' => 100,
        ],
    ],
],
```

필요하다면, `host` 옵션 값을 UNIX 소켓 경로로 지정할 수도 있습니다. 이때는 `port` 옵션을 `0`으로 설정해야 합니다.

```php
'memcached' => [
    // ...

    'servers' => [
        [
            'host' => '/var/run/memcached/memcached.sock',
            'port' => 0,
            'weight' => 100
        ],
    ],
],
```

<a name="redis"></a>
#### Redis

라라벨에서 Redis 캐시를 사용하려면 PECL을 통해 PhpRedis PHP 확장 프로그램을 설치하거나, Composer를 통해 `predis/predis` 패키지(~2.0)를 설치해야 합니다. [Laravel Sail](/docs/sail)에는 이미 이 확장 프로그램이 포함되어 있습니다. 또한, [Laravel Cloud](https://cloud.laravel.com)나 [Laravel Forge](https://forge.laravel.com) 같은 공식 배포 플랫폼에는 기본적으로 PhpRedis 확장 프로그램이 설치되어 있습니다.

Redis 설정에 관한 더 많은 정보는 [라라벨 Redis 문서](/docs/redis#configuration)를 참고해 주세요.

<a name="dynamodb"></a>
#### DynamoDB

[DynamoDB](https://aws.amazon.com/dynamodb) 캐시 드라이버를 사용하기 전에는 캐시 데이터를 저장할 DynamoDB 테이블을 만들어야 합니다. 일반적으로 이 테이블의 이름은 `cache`로 지정하지만, `cache` 설정 파일 내 `stores.dynamodb.table` 값에 따라 다르게 사용할 수 있습니다. 또한 환경 변수 `DYNAMODB_CACHE_TABLE`로 테이블명을 지정할 수도 있습니다.

이 테이블에는 문자열 타입의 파티션 키가 있어야 하며, 이름은 애플리케이션의 `cache` 설정 파일 내 `stores.dynamodb.attributes.key`의 값과 일치해야 합니다. 기본적으로 파티션 키 이름은 `key`입니다.

DynamoDB는 만료된 항목을 자동으로 제거하지 않으므로, 테이블에서 [Time to Live(TTL)](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html) 기능을 활성화해야 합니다. 이때 TTL 속성 이름은 반드시 `expires_at`으로 설정해야 합니다.

다음으로, Laravel 애플리케이션이 DynamoDB에 연결할 수 있도록 AWS SDK를 설치해야 합니다.

```shell
composer require aws/aws-sdk-php
```

그리고 DynamoDB 캐시 저장소 옵션에 값이 할당되어 있는지도 확인해야 합니다. 보통 `AWS_ACCESS_KEY_ID`와 `AWS_SECRET_ACCESS_KEY` 같은 옵션은 애플리케이션의 `.env` 파일에서 정의합니다.

```php
'dynamodb' => [
    'driver' => 'dynamodb',
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    'table' => env('DYNAMODB_CACHE_TABLE', 'cache'),
    'endpoint' => env('DYNAMODB_ENDPOINT'),
],
```

<a name="mongodb"></a>
#### MongoDB

MongoDB를 사용하는 경우, 공식 `mongodb/laravel-mongodb` 패키지에서 제공하는 `mongodb` 캐시 드라이버를 사용할 수 있습니다. 이 드라이버는 `mongodb` 데이터베이스 연결 설정을 사용합니다. MongoDB는 TTL 인덱스를 지원하여, 만료된 캐시 항목을 자동으로 삭제할 수 있습니다.

MongoDB 설정에 관한 더 자세한 내용은 [Cache and Locks 공식 문서](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/cache/)를 참고하시기 바랍니다.

<a name="cache-usage"></a>
## 캐시 사용법

<a name="obtaining-a-cache-instance"></a>
### 캐시 인스턴스 얻기

캐시 저장소 인스턴스를 얻으려면 `Cache` 파사드를 사용할 수 있습니다. 본 문서에서는 모든 예제에 이 `Cache` 파사드를 사용합니다. `Cache` 파사드는 라라벨 캐시 계약의 실제 구현체에 간결하게 접근할 수 있도록 도와줍니다.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Cache;

class UserController extends Controller
{
    /**
     * 애플리케이션의 모든 사용자 목록을 보여줍니다.
     */
    public function index(): array
    {
        $value = Cache::get('key');

        return [
            // ...
        ];
    }
}
```

<a name="accessing-multiple-cache-stores"></a>
#### 여러 캐시 저장소에 접근하기

`Cache` 파사드의 `store` 메서드를 사용하면 여러 다른 캐시 저장소에 접근할 수 있습니다. `store` 메서드에 전달하는 키는 `cache` 설정 파일의 `stores` 배열에 정의된 저장소 이름과 일치해야 합니다.

```php
$value = Cache::store('file')->get('foo');

Cache::store('redis')->put('bar', 'baz', 600); // 10분간 저장
```

<a name="retrieving-items-from-the-cache"></a>
### 캐시에서 항목 가져오기

`Cache` 파사드의 `get` 메서드는 캐시에서 항목을 가져올 때 사용합니다. 만약 해당 항목이 캐시에 없다면 `null`이 반환됩니다. 존재하지 않는 항목일 때 반환할 기본값을 두 번째 인자로 지정할 수도 있습니다.

```php
$value = Cache::get('key');

$value = Cache::get('key', 'default');
```

기본값으로 클로저를 넘길 수도 있습니다. 만약 지정한 캐시 항목이 없다면, 이 클로저의 실행 결과가 반환됩니다. 클로저를 활용하면 데이터베이스나 외부 서비스에서 기본값을 가져오는 작업을 지연시킬 수 있습니다.

```php
$value = Cache::get('key', function () {
    return DB::table(/* ... */)->get();
});
```

<a name="determining-item-existence"></a>
#### 항목 존재 여부 판단

`has` 메서드를 사용하면 캐시에 해당 항목이 존재하는지 확인할 수 있습니다. 이 메서드는 항목이 존재하지만 그 값이 `null`이라면 역시 `false`를 반환합니다.

```php
if (Cache::has('key')) {
    // ...
}
```

<a name="incrementing-decrementing-values"></a>
#### 값 증가/감소 시키기

`increment`와 `decrement` 메서드는 캐시 내 정수형 항목 값의 증감에 사용합니다. 두 메서드 모두 증감할 값을 두 번째 인자로 받을 수 있습니다.

```php
// 값이 존재하지 않으면 초기화...
Cache::add('key', 0, now()->addHours(4));

// 값 증가 또는 감소...
Cache::increment('key');
Cache::increment('key', $amount);
Cache::decrement('key');
Cache::decrement('key', $amount);
```

<a name="retrieve-store"></a>
#### 조회 후 저장

가끔은 캐시에 있는 항목을 가져오며, 만약 해당 항목이 없으면 기본 값을 저장하고 싶을 때가 있습니다. 예를 들어, 모든 사용자를 캐시에서 가져오되, 없다면 데이터베이스에서 조회 후 캐시에 저장하는 방식입니다. 이럴 때는 `Cache::remember` 메서드를 사용할 수 있습니다.

```php
$value = Cache::remember('users', $seconds, function () {
    return DB::table('users')->get();
});
```

만약 캐시에 항목이 없으면, `remember`에 전달한 클로저가 실행되고 그 결과가 캐시에 저장됩니다.

항목을 영구적으로 저장하고 싶으면, `rememberForever` 메서드를 사용할 수 있습니다.

```php
$value = Cache::rememberForever('users', function () {
    return DB::table('users')->get();
});
```

<a name="swr"></a>
#### Stale While Revalidate

`Cache::remember`를 사용할 때, 만약 캐시 값이 만료됐다면 일부 사용자에게는 느린 응답이 발생할 수 있습니다. 특정 데이터에서는, 오래된 데이터를 잠시 제공하면서 백그라운드에서 값을 갱신하는 것이 유용할 수 있습니다. 이는 "stale-while-revalidate(갱신 전 오래된 값 허용)" 패턴이라고 하며, 라라벨에서는 `Cache::flexible` 메서드로 이 패턴을 구현할 수 있습니다.

`flexible` 메서드는 캐시 값을 “신선(fresh)”하게 간주할 기간과, “오래된(stale)” 데이터 기간을 배열로 지정합니다. 배열의 첫 번째 값은 신선 함의 기간(초), 두 번째 값은 오래된 데이터를 제공해도 되는 기간(초)입니다.

신선한 기간 내에 요청이 오면, 캐시를 바로 반환하고 재계산하지 않습니다. 오래된 데이터 기간에는 사용자가 오래된 값을 받고, 응답 후 [지연 함수](/docs/helpers#deferred-functions)를 등록해 백그라운드에서 캐시를 갱신합니다. 두 번째 값까지 지난 후에는, 캐시가 만료된 것으로 간주되어 새 값을 즉시 재계산합니다(따라서 이때 사용자 응답이 느려질 수 있습니다).

```php
$value = Cache::flexible('users', [5, 10], function () {
    return DB::table('users')->get();
});
```

<a name="retrieve-delete"></a>
#### 조회 후 삭제

캐시에서 항목을 조회한 뒤, 바로 삭제해야 한다면 `pull` 메서드를 사용할 수 있습니다. `get`처럼 항목이 존재하지 않으면 `null`을 반환합니다.

```php
$value = Cache::pull('key');

$value = Cache::pull('key', 'default');
```

<a name="storing-items-in-the-cache"></a>
### 캐시에 항목 저장하기

`Cache` 파사드의 `put` 메서드를 사용해 캐시에 값을 저장할 수 있습니다.

```php
Cache::put('key', 'value', $seconds = 10);
```

만약 저장 시간을 지정하지 않으면, 해당 항목은 만료되지 않고 무기한 저장됩니다.

```php
Cache::put('key', 'value');
```

초 단위 숫자(int)가 아닌, `DateTime` 인스턴스를 만료 시점으로 지정할 수도 있습니다.

```php
Cache::put('key', 'value', now()->addMinutes(10));
```

<a name="store-if-not-present"></a>
#### 항목이 없을 때만 저장

`add` 메서드는 지정한 키로 캐시에 항목이 없을 때만 값을 저장합니다. 실제로 값이 추가된다면 `true`, 아니라면 `false`를 반환합니다. 이 메서드는 원자적(atomic) 연산입니다.

```php
Cache::add('key', 'value', $seconds);
```

<a name="storing-items-forever"></a>
#### 영구적으로 항목 저장

`forever` 메서드를 이용하면 캐시 항목을 영구적으로 저장할 수 있습니다. 이런 항목은 만료되지 않으므로, 반드시 `forget` 메서드로 수동 삭제해야 합니다.

```php
Cache::forever('key', 'value');
```

> [!NOTE]
> Memcached 드라이버를 사용하는 경우, “영구적으로” 저장한 항목도 캐시 크기 제한을 넘으면 제거될 수 있습니다.

<a name="removing-items-from-the-cache"></a>
### 캐시에서 항목 삭제하기

`forget` 메서드를 사용하면 캐시에서 특정 항목을 삭제할 수 있습니다.

```php
Cache::forget('key');
```

또는 만료 시간을 0 또는 음수로 지정하면 해당 항목은 바로 삭제됩니다.

```php
Cache::put('key', 'value', 0);

Cache::put('key', 'value', -5);
```

`flush` 메서드를 사용하면 전체 캐시를 한 번에 비울 수 있습니다.

```php
Cache::flush();
```

> [!WARNING]
> 캐시를 플러시하면 설정한 캐시 "prefix"와 상관없이 저장된 모든 항목이 삭제됩니다. 여러 애플리케이션이 캐시를 공유하는 경우 캐시를 비울 때 각별히 주의해야 합니다.

<a name="cache-memoization"></a>
### 캐시 메모이제이션

라라벨의 `memo` 캐시 드라이버를 사용하면, 요청 또는 작업(Job) 한 번 실행 내에서 캐시 값을 메모리에 임시 저장할 수 있습니다. 이를 통해 같은 실행 중에 반복적으로 캐시를 조회할 때 데이터베이스 또는 외부 저장소를 재조회하지 않아 성능을 크게 높일 수 있습니다.

메모이제이션된 캐시를 사용하려면 `memo` 메서드를 호출합니다.

```php
use Illuminate\Support\Facades\Cache;

$value = Cache::memo()->get('key');
```

`memo` 메서드에는 캐시 저장소 이름을 선택적으로 지정할 수 있습니다. 지정하면 해당 캐시 저장소 위에 메모이제이션 드라이버가 덧씌워집니다.

```php
// 기본 캐시 저장소 사용
$value = Cache::memo()->get('key');

// Redis 캐시 저장소 사용
$value = Cache::memo('redis')->get('key');
```

어떤 키에 대해 최초 `get` 호출은 캐시 저장소에서 값을 불러오지만, 같은 실행 내 두 번째 이후 호출은 메모리에서 가져오므로, 저장소 조회가 발생하지 않습니다.

```php
// 실제 캐시 저장소를 조회
$value = Cache::memo()->get('key');

// 캐시 저장소를 재조회하지 않고, 메모이제이션된 값을 반환
$value = Cache::memo()->get('key');
```

캐시 값을 변경하는 메서드(`put`, `increment`, `remember` 등)를 호출하면, 메모이제이션된 값은 자동으로 초기화되고, 변경 작업은 실제 캐시 저장소에 위임됩니다.

```php
Cache::memo()->put('name', 'Taylor'); // 실제 캐시에 저장
Cache::memo()->get('name');           // 실제 캐시 조회
Cache::memo()->get('name');           // 메모리에서 반환, 캐시 불필요

Cache::memo()->put('name', 'Tim');    // 메모리 초기화, 새 값 저장
Cache::memo()->get('name');           // 다시 캐시 조회
```

<a name="the-cache-helper"></a>
### 캐시 헬퍼 함수

`Cache` 파사드 외에도, 전역 함수인 `cache`를 사용해 캐시 데이터를 쉽게 조회, 저장할 수 있습니다. 문자열 하나를 인자로 전달하면, 해당 키의 값을 반환합니다.

```php
$value = cache('key');
```

키/값 쌍 배열과 만료 시간을 함께 전달하면, 지정된 시간 동안 값을 캐시에 저장합니다.

```php
cache(['key' => 'value'], $seconds);

cache(['key' => 'value'], now()->addMinutes(10));
```

인자 없이 `cache` 함수를 호출하면, `Illuminate\Contracts\Cache\Factory` 인스턴스를 반환하므로, 다양한 캐시 메서드를 호출할 수 있습니다.

```php
cache()->remember('users', $seconds, function () {
    return DB::table('users')->get();
});
```

> [!NOTE]
> 전역 `cache` 함수를 테스트할 때는, [파사드 테스트](/docs/mocking#mocking-facades)와 마찬가지로 `Cache::shouldReceive` 메서드를 사용할 수 있습니다.

<a name="atomic-locks"></a>
## 원자적 락(Atomic Locks)

> [!WARNING]
> 이 기능을 사용하려면 애플리케이션의 기본 캐시 드라이버가 `memcached`, `redis`, `dynamodb`, `database`, `file`, `array` 중 하나여야 합니다. 또한, 모든 서버가 동일한 중앙 캐시 서버와 통신해야 합니다.

<a name="managing-locks"></a>
### 락 관리하기

원자적 락(atomic lock)을 사용하면 경쟁 조건(race condition) 걱정 없이 분산 락을 안전하게 다룰 수 있습니다. 예를 들어, [Laravel Cloud](https://cloud.laravel.com)는 원자적 락 기능을 활용하여 한 번에 하나의 원격 작업만 실행되도록 보장합니다. `Cache::lock` 메서드로 락을 생성하고 관리할 수 있습니다.

```php
use Illuminate\Support\Facades\Cache;

$lock = Cache::lock('foo', 10);

if ($lock->get()) {
    // 10초 동안 락 획득

    $lock->release();
}
```

`get` 메서드는 클로저를 인자로 받을 수도 있습니다. 클로저 실행 후 락은 자동으로 해제됩니다.

```php
Cache::lock('foo', 10)->get(function () {
    // 10초간 락을 획득하고, 작업 후 자동 해제
});
```

요청 시점에 락을 사용할 수 없는 경우, 일정 시간 동안 대기하도록 할 수도 있습니다. 제한 시간 안에 락 획득에 실패하면 `Illuminate\Contracts\Cache\LockTimeoutException` 예외가 발생합니다.

```php
use Illuminate\Contracts\Cache\LockTimeoutException;

$lock = Cache::lock('foo', 10);

try {
    $lock->block(5);

    // 최대 5초까지 대기 후 락 획득
} catch (LockTimeoutException $e) {
    // 락을 얻지 못했을 때
} finally {
    $lock->release();
}
```

위 예시는 `block` 메서드에 클로저를 전달하면 더 간결하게 작성할 수 있습니다. 이 방식에서는 지정한 시간 동안 락 획득을 시도하고, 클로저 실행 후 락을 자동 해제합니다.

```php
Cache::lock('foo', 10)->block(5, function () {
    // 최대 5초까지 대기 후 10초간 락을 획득
});
```

<a name="managing-locks-across-processes"></a>
### 프로세스 간 락 관리

경우에 따라 한 프로세스에서 락을 획득하고, 다른 프로세스에서 해제해야 할 수도 있습니다. 예를 들어, 웹 요청 중 락을 획득하고, 이 요청에서 트리거된 큐 작업(job)이 끝날 때 락을 해제해야 할 수 있습니다. 이 상황에서는 락의 "owner token(소유자 토큰)"을 큐 작업에 전달하여, 해당 토큰을 이용해 작업 내에서 락을 복원한 뒤 해제하면 됩니다.

아래 예시는 락을 정상 획득하면 큐 작업을 디스패치하고, 락의 소유자 토큰을 작업에 전달합니다.

```php
$podcast = Podcast::find($id);

$lock = Cache::lock('processing', 120);

if ($lock->get()) {
    ProcessPodcast::dispatch($podcast, $lock->owner());
}
```

큐 작업인 `ProcessPodcast` 내부에서는, owner 토큰을 이용하여 락을 복원한 뒤 해제할 수 있습니다.

```php
Cache::restoreLock('processing', $this->owner)->release();
```

락을 현재 소유자를 확인하지 않고 바로 해제하고 싶다면, `forceRelease` 메서드를 사용할 수 있습니다.

```php
Cache::lock('processing')->forceRelease();
```

<a name="adding-custom-cache-drivers"></a>
## 사용자 정의 캐시 드라이버 추가하기

<a name="writing-the-driver"></a>
### 드라이버 작성

사용자 정의 캐시 드라이버를 만들려면, `Illuminate\Contracts\Cache\Store` [계약(Contract)](/docs/contracts)를 구현해야 합니다. 예를 들어 MongoDB 기반 캐시 저장소는 다음과 같이 만들 수 있습니다.

```php
<?php

namespace App\Extensions;

use Illuminate\Contracts\Cache\Store;

class MongoStore implements Store
{
    public function get($key) {}
    public function many(array $keys) {}
    public function put($key, $value, $seconds) {}
    public function putMany(array $values, $seconds) {}
    public function increment($key, $value = 1) {}
    public function decrement($key, $value = 1) {}
    public function forever($key, $value) {}
    public function forget($key) {}
    public function flush() {}
    public function getPrefix() {}
}
```

각 메서드는 MongoDB 연결을 이용해 구현하면 됩니다. 각 메서드의 구현 방법은 [라라벨 프레임워크 소스코드](https://github.com/laravel/framework)의 `Illuminate\Cache\MemcachedStore`를 참조하세요. 구현이 끝나면, `Cache` 파사드의 `extend` 메서드를 호출해 사용자 드라이버를 등록합니다.

```php
Cache::extend('mongo', function (Application $app) {
    return Cache::repository(new MongoStore);
});
```

> [!NOTE]
> 사용자 정의 캐시 드라이버 코드를 어디에 둘지 고민된다면, `app` 폴더 내에 `Extensions` 네임스페이스를 만들어 구성할 수 있습니다. 라라벨은 폴더 구조가 엄격히 정해져 있지 않으니, 편한 방식으로 관리하면 됩니다.

<a name="registering-the-driver"></a>
### 드라이버 등록

사용자 정의 캐시 드라이버를 라라벨에 등록하려면, `Cache` 파사드의 `extend` 메서드를 사용합니다. 다른 서비스 프로바이더의 `boot` 메서드에서 캐시 값을 읽으려 할 수 있으므로, 드라이버 등록은 `booting` 콜백 안에서 진행하는 것이 안전합니다. 이렇게 하면 모든 서비스 프로바이더의 `register` 이후, 각 프로바이더의 `boot` 메서드 호출 직전에 확장 드라이버가 등록됩니다. 이 콜백은 보통 `App\Providers\AppServiceProvider` 클래스의 `register` 메서드 안에 등록합니다.

```php
<?php

namespace App\Providers;

use App\Extensions\MongoStore;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * 애플리케이션 서비스 등록
     */
    public function register(): void
    {
        $this->app->booting(function () {
             Cache::extend('mongo', function (Application $app) {
                 return Cache::repository(new MongoStore);
             });
         });
    }

    /**
     * 애플리케이션 서비스 부트스트랩
     */
    public function boot(): void
    {
        // ...
    }
}
```

`extend` 메서드의 첫 번째 인자는 드라이버 이름인데, 이는 `config/cache.php` 파일의 `driver` 옵션과 대응합니다. 두 번째 인자는 `Illuminate\Cache\Repository` 인스턴스를 반환하는 클로저이며, 클로저에는 [서비스 컨테이너](/docs/container) 인스턴스인 `$app`이 전달됩니다.

등록이 끝나면, 애플리케이션의 `CACHE_STORE` 환경 변수 또는 `config/cache.php` 파일의 `default` 옵션에 확장한 저장소 이름을 지정해주면 됩니다.

<a name="events"></a>
## 이벤트

캐시 작업이 발생할 때마다 특정 코드를 실행하고 싶으면, 캐시에서 발생하는 다양한 [이벤트](/docs/events)를 리스닝할 수 있습니다.

<div class="overflow-auto">

| 이벤트 이름                                   |
|----------------------------------------------|
| `Illuminate\Cache\Events\CacheFlushed`       |
| `Illuminate\Cache\Events\CacheFlushing`      |
| `Illuminate\Cache\Events\CacheHit`           |
| `Illuminate\Cache\Events\CacheMissed`        |
| `Illuminate\Cache\Events\ForgettingKey`      |
| `Illuminate\Cache\Events\KeyForgetFailed`    |
| `Illuminate\Cache\Events\KeyForgotten`       |
| `Illuminate\Cache\Events\KeyWriteFailed`     |
| `Illuminate\Cache\Events\KeyWritten`         |
| `Illuminate\Cache\Events\RetrievingKey`      |
| `Illuminate\Cache\Events\RetrievingManyKeys` |
| `Illuminate\Cache\Events\WritingKey`         |
| `Illuminate\Cache\Events\WritingManyKeys`    |

</div>

성능을 높이기 위해, 특정 캐시 저장소에 대해 애플리케이션의 `config/cache.php` 설정 파일에서 `events` 옵션을 `false`로 설정해 캐시 이벤트를 비활성화할 수 있습니다.

```php
'database' => [
    'driver' => 'database',
    // ...
    'events' => false,
],
```