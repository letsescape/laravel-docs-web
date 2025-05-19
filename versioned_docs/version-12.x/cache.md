# 캐시 (Cache)

- [소개](#introduction)
- [설정](#configuration)
    - [드라이버 사전 준비](#driver-prerequisites)
- [캐시 사용법](#cache-usage)
    - [캐시 인스턴스 얻기](#obtaining-a-cache-instance)
    - [캐시에서 항목 가져오기](#retrieving-items-from-the-cache)
    - [캐시에 항목 저장하기](#storing-items-in-the-cache)
    - [캐시에서 항목 삭제하기](#removing-items-from-the-cache)
    - [캐시 메모이제이션](#cache-memoization)
    - [Cache 헬퍼](#the-cache-helper)
- [원자적 락](#atomic-locks)
    - [락 관리하기](#managing-locks)
    - [프로세스 간 락 관리하기](#managing-locks-across-processes)
- [커스텀 캐시 드라이버 추가하기](#adding-custom-cache-drivers)
    - [드라이버 작성하기](#writing-the-driver)
    - [드라이버 등록하기](#registering-the-driver)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

애플리케이션에서 데이터를 가져오거나 처리하는 작업 중에는 CPU를 많이 사용하거나 완료하는 데 몇 초가 걸리는 경우도 있습니다. 이런 상황에서 동일한 데이터에 대한 이후 요청마다 빠르게 응답하기 위해, 가져온 데이터를 일정 시간 동안 캐싱(임시 저장)하는 것이 일반적입니다. 이렇게 캐싱된 데이터는 대부분 [Memcached](https://memcached.org)나 [Redis](https://redis.io)처럼 매우 빠른 데이터 저장소에 저장됩니다.

라라벨은 다양한 캐시 백엔드에서 동일하게 사용할 수 있는 명확하고 일관된 API를 제공합니다. 이를 통해 빠른 데이터 조회 성능을 적극 활용하면서, 웹 애플리케이션의 속도를 높일 수 있습니다.

<a name="configuration"></a>
## 설정

애플리케이션의 캐시 설정 파일은 `config/cache.php`에 위치합니다. 이 파일에서 기본적으로 사용할 캐시 저장소를 지정할 수 있습니다. 라라벨은 [Memcached](https://memcached.org), [Redis](https://redis.io), [DynamoDB](https://aws.amazon.com/dynamodb), 그리고 관계형 데이터베이스와 같은 인기 있는 캐싱 백엔드를 기본으로 지원합니다. 또한 파일 기반 캐시 드라이버는 물론, 자동화된 테스트에 유용한 `array`(배열) 및 `null` 캐시 드라이버도 사용할 수 있습니다.

캐시 설정 파일에는 이 외에도 다양한 옵션이 있으며, 필요에 따라 살펴볼 수 있습니다. 기본적으로 라라벨은 `database` 캐시 드라이버가 설정되어 있는데, 이는 직렬화된 캐시 객체를 애플리케이션의 데이터베이스에 저장합니다.

<a name="driver-prerequisites"></a>
### 드라이버 사전 준비

<a name="prerequisites-database"></a>
#### 데이터베이스

`database` 캐시 드라이버를 사용할 경우, 캐시 데이터를 저장할 수 있는 데이터베이스 테이블이 필요합니다. 대개 라라벨에 기본 포함되어 있는 `0001_01_01_000001_create_cache_table.php` [데이터베이스 마이그레이션](/docs/12.x/migrations)을 사용합니다. 만약 애플리케이션에 이 마이그레이션이 없다면, `make:cache-table` 아티즌 명령어로 마이그레이션 파일을 생성할 수 있습니다.

```shell
php artisan make:cache-table

php artisan migrate
```

<a name="memcached"></a>
#### Memcached

Memcached 드라이버를 사용하려면 [Memcached PECL 패키지](https://pecl.php.net/package/memcached)를 설치해야 합니다. 모든 Memcached 서버 리스트는 `config/cache.php` 설정 파일에 기입할 수 있습니다. 이 파일에는 시작할 때 참고할 수 있도록 `memcached.servers` 항목이 이미 포함되어 있습니다.

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

필요하다면 `host` 옵션에 UNIX 소켓 경로를 지정할 수도 있습니다. 이 경우에는 `port` 옵션을 반드시 `0`으로 설정해야 합니다.

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

라라벨에서 Redis 캐시를 사용하려면, PECL을 통해 PhpRedis PHP 확장 모듈을 설치하거나 Composer로 `predis/predis` 패키지(~2.0)를 설치해야 합니다. [Laravel Sail](/docs/12.x/sail)에는 이미 이 확장 모듈이 포함되어 있습니다. 또한 [Laravel Cloud](https://cloud.laravel.com), [Laravel Forge](https://forge.laravel.com) 같은 공식 라라벨 플랫폼에는 기본적으로 PhpRedis가 설치되어 있습니다.

Redis 설정 방법에 대한 더 자세한 내용은 [라라벨 Redis 문서](/docs/12.x/redis#configuration)를 참고하세요.

<a name="dynamodb"></a>
#### DynamoDB

[DynamoDB](https://aws.amazon.com/dynamodb) 캐시 드라이버를 사용하기 전에, 모든 캐시 데이터를 저장할 DynamoDB 테이블을 먼저 생성해야 합니다. 일반적으로 이 테이블의 이름은 `cache`로 지정하지만, `cache` 설정 파일에서 `stores.dynamodb.table` 설정값에 맞춰 이름을 정해야 합니다. 테이블 이름은 `DYNAMODB_CACHE_TABLE` 환경 변수로도 지정할 수 있습니다.

이 테이블에는 또한 문자열 파티션 키(Partition Key)를 하나 두어야 하며, 이 키의 이름은 애플리케이션의 `cache` 설정 파일에서 `stores.dynamodb.attributes.key`에 지정된 값과 같아야 합니다. 기본적으로는 이 키의 이름이 `key`입니다.

대부분의 경우, DynamoDB는 만료된 항목을 테이블에서 자동으로 제거하지 않습니다. 따라서, 테이블에서 [TTL(Time to Live)](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html) 기능을 활성화해야 합니다. TTL 속성 이름은 `expires_at`으로 설정하는 것이 좋습니다.

다음으로, 애플리케이션에서 DynamoDB와 통신할 수 있도록 AWS SDK를 설치해야 합니다.

```shell
composer require aws/aws-sdk-php
```

또한 DynamoDB 캐시 저장소 구성 옵션에 값을 지정해야 합니다. 일반적으로 `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`와 같은 값들은 애플리케이션의 `.env` 설정 파일에 추가합니다.

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

MongoDB를 사용하는 경우, 공식 `mongodb/laravel-mongodb` 패키지가 `mongodb` 캐시 드라이버를 제공하며, 이를 `mongodb` 데이터베이스 연결과 함께 설정할 수 있습니다. MongoDB는 TTL 인덱스를 지원하기 때문에, 만료된 캐시 항목을 자동으로 정리할 수 있습니다.

MongoDB 설정에 대한 더 자세한 정보는 MongoDB [Cache and Locks 문서](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/cache/)를 참고하세요.

<a name="cache-usage"></a>
## 캐시 사용법

<a name="obtaining-a-cache-instance"></a>
### 캐시 인스턴스 얻기

캐시 저장소 인스턴스를 얻으려면 `Cache` 파사드를 사용할 수 있습니다. 이 문서 전체에서 `Cache` 파사드를 예제로 사용합니다. `Cache` 파사드는 라라벨의 캐시 컨트랙트 구현체에 간단하게 접근할 수 있도록 도와줍니다.

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
#### 여러 캐시 저장소 접근

`Cache` 파사드의 `store` 메서드를 사용하면, 여러 캐시 저장소에 접근할 수 있습니다. `store` 메서드에 전달하는 키는 `cache` 설정 파일의 `stores` 배열에 정의된 저장소 이름과 일치해야 합니다.

```php
$value = Cache::store('file')->get('foo');

Cache::store('redis')->put('bar', 'baz', 600); // 10분
```

<a name="retrieving-items-from-the-cache"></a>
### 캐시에서 항목 가져오기

`Cache` 파사드의 `get` 메서드는 캐시에서 항목을 가져올 때 사용합니다. 만약 해당 항목이 캐시에 없다면, `null`이 반환됩니다. 필요하다면, `get` 메서드의 두 번째 인자로 항목이 없을 때 반환할 기본값을 지정할 수 있습니다.

```php
$value = Cache::get('key');

$value = Cache::get('key', 'default');
```

기본값을 지연 평가하고 싶다면, 클로저(익명 함수)를 기본값으로 전달할 수도 있습니다. 이렇게 하면 해당 항목이 없을 때만 클로저가 실행되어, 데이터베이스 등 외부 저장소에서 기본값을 가져올 수 있습니다.

```php
$value = Cache::get('key', function () {
    return DB::table(/* ... */)->get();
});
```

<a name="determining-item-existence"></a>
#### 항목 존재 여부 확인

해당 항목이 캐시에 존재하는지 확인하려면 `has` 메서드를 사용하면 됩니다. 이 메서드는 캐시에 존재하지만 값이 `null`인 경우에도 `false`를 반환합니다.

```php
if (Cache::has('key')) {
    // ...
}
```

<a name="incrementing-decrementing-values"></a>
#### 값 증가/감소시키기

`increment` 및 `decrement` 메서드를 이용해 캐시에 저장된 정수 값을 증가시키거나 감소시킬 수 있습니다. 두 메서드는 각각 증가/감소시킬 양을 두 번째 인자로 받을 수 있습니다.

```php
// 값이 존재하지 않으면 0으로 초기화...
Cache::add('key', 0, now()->addHours(4));

// 값 증가/감소시키기...
Cache::increment('key');
Cache::increment('key', $amount);
Cache::decrement('key');
Cache::decrement('key', $amount);
```

<a name="retrieve-store"></a>
#### 조회 후 저장

캐시에서 항목을 조회하고, 만약 없으면 기본값을 저장하고 싶을 때가 있습니다. 예를 들어, 사용자 목록 전체를 캐시에서 가져오되, 캐시에 없으면 데이터베이스에서 가져와 넣고 싶을 때 사용할 수 있습니다. 이런 경우에는 `Cache::remember` 메서드를 사용합니다.

```php
$value = Cache::remember('users', $seconds, function () {
    return DB::table('users')->get();
});
```

캐시에 항목이 없다면, 전달된 클로저가 실행되고 그 결과가 캐시에 저장됩니다.

항목을 영구적으로 저장하고자 한다면, `rememberForever` 메서드를 사용할 수 있습니다.

```php
$value = Cache::rememberForever('users', function () {
    return DB::table('users')->get();
});
```

<a name="swr"></a>
#### Stale While Revalidate

`Cache::remember` 메서드를 사용할 때, 캐시가 만료된 순간 일부 사용자에게 응답 속도가 느려질 수 있습니다. 데이터 타입에 따라서는 캐시된 값이 만료된 경우에도 일시적으로 이전(부분적으로 만료된) 데이터를 제공한 뒤, 백그라운드에서 캐시를 갱신하는 것이 더 유용할 수 있습니다. 이렇게 하면 캐시 값이 갱신되는 동안 일부 사용자가 느린 응답을 겪는 것을 막을 수 있습니다. 이러한 패턴을 "stale-while-revalidate"라고 하며, 라라벨에서는 `Cache::flexible` 메서드로 구현할 수 있습니다.

`flexible` 메서드는 캐시 값을 얼마나 오랫동안 “신선(fresh)”하게 유지할지, 그리고 언제부터 “stale(부분 만료)”한 값으로 간주할지 지정하는 배열을 인자로 받습니다. 배열의 첫 번째 값은 캐시가 신선하게 유지되는 초, 두 번째 값은 cache가 stale로 간주되어 새로운 값 계산이 필요해지기 전까지의 초를 의미합니다.

첫 번째 값 이내에 요청이 오면 캐시를 즉시 반환하며, 두 번째 값 사이(신선 기간 이후, 만료 전)에는 사용자에게 stale 값을 제공하되, 응답 이후 백그라운드에서 캐시를 갱신합니다. 두 번째 값 이후에는 캐시가 만료된 것으로 간주하여 즉시 새 값을 계산하고(사용자 응답이 느려질 수 있음), 새로운 값으로 갱신합니다.

```php
$value = Cache::flexible('users', [5, 10], function () {
    return DB::table('users')->get();
});
```

<a name="retrieve-delete"></a>
#### 조회 후 삭제

캐시의 항목을 조회한 뒤 바로 삭제하고 싶을 때는 `pull` 메서드를 사용합니다. `get`과 마찬가지로, 항목이 없으면 `null`을 반환합니다.

```php
$value = Cache::pull('key');

$value = Cache::pull('key', 'default');
```

<a name="storing-items-in-the-cache"></a>
### 캐시에 항목 저장하기

`Cache` 파사드의 `put` 메서드를 사용하여 항목을 캐시에 저장할 수 있습니다.

```php
Cache::put('key', 'value', $seconds = 10);
```

유효 기간(저장 시간)을 지정하지 않으면, 해당 항목은 무제한(영구적으로) 캐시에 저장됩니다.

```php
Cache::put('key', 'value');
```

초 단위 대신, 저장 만료 시점을 지정하는 `DateTime` 인스턴스를 전달할 수도 있습니다.

```php
Cache::put('key', 'value', now()->addMinutes(10));
```

<a name="store-if-not-present"></a>
#### 존재하지 않을 때만 저장

`add` 메서드는 캐시에 해당 키의 항목이 없을 때만 저장합니다. 실제로 캐시에 추가될 경우 `true`, 이미 존재해 추가되지 않을 경우에는 `false`를 반환합니다. 이 메서드는 원자적(atomic)으로 동작합니다.

```php
Cache::add('key', 'value', $seconds);
```

<a name="storing-items-forever"></a>
#### 항목을 영구 저장하기

`forever` 메서드를 사용하면 캐시가 만료되지 않도록 항목을 영구적으로 저장할 수 있습니다. 이 경우 수동으로 `forget` 메서드를 이용해 캐시를 삭제해야 합니다.

```php
Cache::forever('key', 'value');
```

> [!NOTE]
> Memcached 드라이버를 사용하는 경우, 영구 보관된 항목일지라도 캐시 용량이 가득 차면 삭제될 수 있습니다.

<a name="removing-items-from-the-cache"></a>
### 캐시에서 항목 삭제하기

캐시에서 항목을 삭제하려면 `forget` 메서드를 사용합니다.

```php
Cache::forget('key');
```

또는, 만료 시간을 0 또는 음수로 지정해서 항목을 삭제하는 것도 가능합니다.

```php
Cache::put('key', 'value', 0);

Cache::put('key', 'value', -5);
```

전체 캐시를 한 번에 비우려면 `flush` 메서드를 사용하세요.

```php
Cache::flush();
```

> [!WARNING]
> 캐시를 flush(전체 삭제)할 경우, 설정된 캐시 "prefix"(접두어)는 무시되고 모든 항목이 삭제됩니다. 여러 애플리케이션이 동일한 캐시 저장소를 공유하는 환경이라면, 이 명령어는 특히 주의해서 사용해야 합니다.

<a name="cache-memoization"></a>
### 캐시 메모이제이션

라라벨의 `memo` 캐시 드라이버를 사용하면, 한 번 요청 또는 작업 실행 중에 이미 조회한 캐시 값을 메모리(서버 메모리) 내에서 임시로 저장할 수 있습니다. 이렇게 하면 동일한 실행 과정에서 반복적으로 캐시 저장소에 접근하지 않아 성능이 크게 향상됩니다.

메모이제이션 캐시를 사용하려면 `memo` 메서드를 호출하면 됩니다.

```php
use Illuminate\Support\Facades\Cache;

$value = Cache::memo()->get('key');
```

`memo` 메서드에는 캐시 저장소의 이름을 인자로 전달할 수도 있으며, 지정된 저장소 위에 메모이제이션 기능이 덧씌워집니다.

```php
// 기본 캐시 저장소를 사용...
$value = Cache::memo()->get('key');

// Redis 캐시 저장소를 사용...
$value = Cache::memo('redis')->get('key');
```

동일한 키로 첫 번째 `get` 호출 시에는 실제 캐시 저장소에 접근하지만, 같은 요청(혹은 작업 실행) 중에 두 번째 이후 호출은 메모이제이션된 값(메모리에 저장된 값)을 반환합니다.

```php
// 캐시에 접근합니다...
$value = Cache::memo()->get('key');

// 캐시에 접근하지 않고, 메모이제이션된 값을 반환합니다...
$value = Cache::memo()->get('key');
```

`put`, `increment`, `remember` 등 캐시 값을 변경하는 메서드를 호출할 때는 자동으로 메모이제이션된 값이 잊혀지고, 실제 저장소에 값을 반영합니다.

```php
Cache::memo()->put('name', 'Taylor'); // 실제 캐시에 저장...
Cache::memo()->get('name');           // 실제 캐시에 접근...
Cache::memo()->get('name');           // 메모이제이션된 값을 반환...

Cache::memo()->put('name', 'Tim');    // 메모이제이션 값을 잊고 새 값을 저장...
Cache::memo()->get('name');           // 다시 캐시에 접근...
```

<a name="the-cache-helper"></a>
### Cache 헬퍼

`Cache` 파사드 외에도, 전역 `cache` 함수를 통해서도 데이터를 저장하거나 가져올 수 있습니다. `cache` 함수에 단 하나의 문자열 인자를 전달하면, 해당 키의 값을 반환합니다.

```php
$value = cache('key');
```

키/값 쌍의 배열과 만료 시간을 함께 전달하면, 지정한 기간 동안 값을 캐시에 저장합니다.

```php
cache(['key' => 'value'], $seconds);

cache(['key' => 'value'], now()->addMinutes(10));
```

아무 인자도 없이 `cache` 함수를 호출하면, `Illuminate\Contracts\Cache\Factory` 인스턴스가 반환되어, 다양한 캐시 관련 메서드를 호출할 수 있습니다.

```php
cache()->remember('users', $seconds, function () {
    return DB::table('users')->get();
});
```

> [!NOTE]
> 전역 `cache` 함수 호출을 테스트할 때는, [파사드 테스트](/docs/12.x/mocking#mocking-facades)에서와 같이 `Cache::shouldReceive` 메서드를 사용할 수 있습니다.

<a name="atomic-locks"></a>
## 원자적 락

> [!WARNING]
> 이 기능을 사용하려면, 애플리케이션의 기본 캐시 드라이버로 `memcached`, `redis`, `dynamodb`, `database`, `file`, 또는 `array` 중 하나가 설정되어 있어야 합니다. 또한, 모든 서버가 동일한 중앙 캐시 서버와 통신해야 합니다.

<a name="managing-locks"></a>
### 락 관리하기

원자적(atomic) 락은 분산 환경에서 경쟁 조건(race condition) 걱정 없이 락을 제어할 수 있게 해줍니다. 예를 들어, [Laravel Cloud](https://cloud.laravel.com)에서는 한 서버에 동시에 하나의 원격 작업만 실행하도록 락을 사용합니다. 락은 `Cache::lock` 메서드로 생성하고 관리할 수 있습니다.

```php
use Illuminate\Support\Facades\Cache;

$lock = Cache::lock('foo', 10);

if ($lock->get()) {
    // 10초 동안 락이 획득됨...

    $lock->release();
}
```

`get` 메서드는 클로저도 인자로 받을 수 있습니다. 클로저가 실행된 후, 라라벨이 락을 자동으로 해제합니다.

```php
Cache::lock('foo', 10)->get(function () {
    // 10초 동안 락을 획득하고, 이후 자동으로 해제됩니다...
});
```

락이 바로 획득되지 않을 경우, 라라벨이 정해진 시간만큼 대기하도록 할 수 있습니다. 이 기간 내에 락을 획득하지 못하면 `Illuminate\Contracts\Cache\LockTimeoutException` 예외가 발생합니다.

```php
use Illuminate\Contracts\Cache\LockTimeoutException;

$lock = Cache::lock('foo', 10);

try {
    $lock->block(5);

    // 최대 5초 대기 후 락 획득...
} catch (LockTimeoutException $e) {
    // 락을 획득하지 못했습니다...
} finally {
    $lock->release();
}
```

위 예시는 `block` 메서드에 클로저를 전달하여 조금 더 간결하게 표현할 수도 있습니다. 이 경우 라라벨은 지정된 시간 동안 락을 획득하려 시도하고, 얻은 다음에는 클로저 실행 후 자동으로 락을 해제합니다.

```php
Cache::lock('foo', 10)->block(5, function () {
    // 최대 5초 대기 후 10초간 락을 획득, 이후 자동 해제...
});
```

<a name="managing-locks-across-processes"></a>
### 프로세스 간 락 관리하기

가끔은 한 프로세스에서 락을 획득하고, 다른 프로세스에서 락을 해제하고 싶을 수도 있습니다. 예를 들어, 웹 요청 중에 락을 획득하고, 그 요청에 의해 트리거되는 큐 작업의 마지막에 락을 해제하는 경우가 있을 수 있습니다. 이때는 락의 "owner token"(소유자 토큰)을 큐 작업에 전달하면, 해당 토큰으로 락을 다시 복원하고 해제할 수 있습니다.

아래 예시는 락을 성공적으로 획득하면 큐 작업을 dispatch하고, 락의 owner 토큰을 작업에 함께 전달합니다.

```php
$podcast = Podcast::find($id);

$lock = Cache::lock('processing', 120);

if ($lock->get()) {
    ProcessPodcast::dispatch($podcast, $lock->owner());
}
```

이제 큐 작업(`ProcessPodcast` 클래스) 내에서 owner 토큰으로 락을 복원하고 해제하면 됩니다.

```php
Cache::restoreLock('processing', $this->owner)->release();
```

현재 소유자를 무시하고 락을 강제로 해제하고 싶다면, `forceRelease` 메서드를 사용할 수 있습니다.

```php
Cache::lock('processing')->forceRelease();
```

<a name="adding-custom-cache-drivers"></a>
## 커스텀 캐시 드라이버 추가하기

<a name="writing-the-driver"></a>
### 드라이버 작성하기

커스텀 캐시 드라이버를 만들기 위해서는 먼저 `Illuminate\Contracts\Cache\Store` [컨트랙트](/docs/12.x/contracts)를 구현해야 합니다. MongoDB 캐시 구현 예시는 다음과 같이 구성할 수 있습니다.

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

각 메서드는 MongoDB 연결을 사용해 구현하면 됩니다. 각 메서드를 어떻게 구현할지에 대해서는, [라라벨 프레임워크 소스코드](https://github.com/laravel/framework)에 있는 `Illuminate\Cache\MemcachedStore` 클래스를 참고할 수 있습니다. 구현이 완료되면, `Cache` 파사드의 `extend` 메서드를 호출해서 커스텀 드라이버 등록을 마칠 수 있습니다.

```php
Cache::extend('mongo', function (Application $app) {
    return Cache::repository(new MongoStore);
});
```

> [!NOTE]
> 커스텀 캐시 드라이버 코드를 어디에 두는 것이 좋을지 궁금하다면, `app` 디렉토리 하위에 `Extensions` 네임스페이스를 만들어 구현할 수 있습니다. 하지만 라라벨은 고정된 애플리케이션 구조가 있는 프레임워크가 아니므로 필요에 따라 코드를 자유롭게 구성할 수 있습니다.

<a name="registering-the-driver"></a>
### 드라이버 등록하기

라라벨에 커스텀 캐시 드라이버를 등록하려면, `Cache` 파사드의 `extend` 메서드를 사용합니다. 다른 서비스 프로바이더의 `boot` 메서드에서 캐시를 사용할 수 있으므로, 드라이버 등록 코드는 `boot`보다 앞서 실행되어야 합니다. 이를 위해 `booting` 콜백을 사용해서, 서비스 프로바이더들의 `boot`가 호출되기 직전에 드라이버가 등록되도록 할 수 있습니다. `App\Providers\AppServiceProvider` 클래스의 `register` 메서드 내부에 `booting` 콜백을 등록하세요.

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

`extend` 메서드의 첫 번째 인자는 드라이버의 이름이며, 이는 `config/cache.php`의 `driver` 옵션 값으로 사용됩니다. 두 번째 인자는 반드시 `Illuminate\Cache\Repository` 인스턴스를 반환해야 하는 클로저입니다. 이 클로저에는 서비스 컨테이너의 `$app` 인스턴스가 전달됩니다. ([서비스 컨테이너](/docs/12.x/container) 참고)

확장 기능을 등록했다면, 애플리케이션의 `config/cache.php` 또는 `CACHE_STORE` 환경 변수에서 기본 캐시 저장소를 커스텀 확장 이름으로 바꿔주어야 합니다.

<a name="events"></a>
## 이벤트

모든 캐시 작업 시마다 특정 코드를 실행하고 싶다면, 라라벨 캐시에서 발생하는 다양한 [이벤트](/docs/12.x/events)를 리스닝하여 활용할 수 있습니다.

<div class="overflow-auto">

| 이벤트 이름                                 |
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

성능 향상을 위해, 특정 캐시 저장소에 대해 `config/cache.php` 설정 파일에서 `events` 옵션을 `false`로 지정하면 캐시 이벤트를 비활성화할 수 있습니다.

```php
'database' => [
    'driver' => 'database',
    // ...
    'events' => false,
],
```