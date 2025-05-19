# 캐시 (Cache)

- [소개](#introduction)
- [설정](#configuration)
    - [드라이버 사전 준비 사항](#driver-prerequisites)
- [캐시 사용 방법](#cache-usage)
    - [캐시 인스턴스 얻기](#obtaining-a-cache-instance)
    - [캐시에서 항목 가져오기](#retrieving-items-from-the-cache)
    - [캐시에 항목 저장하기](#storing-items-in-the-cache)
    - [캐시에서 항목 제거하기](#removing-items-from-the-cache)
    - [캐시 헬퍼](#the-cache-helper)
- [캐시 태그](#cache-tags)
    - [태그가 지정된 캐시 항목 저장하기](#storing-tagged-cache-items)
    - [태그가 지정된 캐시 항목 접근하기](#accessing-tagged-cache-items)
    - [태그가 지정된 캐시 항목 제거하기](#removing-tagged-cache-items)
- [원자적 락(Atomic Locks)](#atomic-locks)
    - [드라이버 사전 준비 사항](#lock-driver-prerequisites)
    - [락 관리하기](#managing-locks)
    - [프로세스 간 락 관리하기](#managing-locks-across-processes)
- [커스텀 캐시 드라이버 추가하기](#adding-custom-cache-drivers)
    - [드라이버 작성하기](#writing-the-driver)
    - [드라이버 등록하기](#registering-the-driver)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

애플리케이션에서 수행되는 데이터 조회나 처리 작업 가운데 일부는 CPU를 많이 사용하거나, 완료까지 몇 초가 걸릴 수 있습니다. 이런 경우, 조회된 데이터를 일정 시간 동안 캐시에 저장하여 동일한 데이터에 대한 이후 요청이 훨씬 빠르게 처리되도록 하는 것이 일반적입니다. 캐시된 데이터는 대개 [Memcached](https://memcached.org)나 [Redis](https://redis.io)와 같은 매우 빠른 데이터 저장소에 보관합니다.

다행히 라라벨은 다양한 캐시 백엔드를 위한 표현력 있고 통합된 API를 제공하며, 이를 통해 매우 빠른 데이터 조회 속도를 활용하고 웹 애플리케이션의 성능을 높일 수 있습니다.

<a name="configuration"></a>
## 설정

애플리케이션의 캐시 설정 파일은 `config/cache.php`에 위치합니다. 이 파일에서는 어떤 캐시 드라이버를 애플리케이션 전반에서 기본으로 사용할지 지정할 수 있습니다. 라라벨은 기본적으로 [Memcached](https://memcached.org), [Redis](https://redis.io), [DynamoDB](https://aws.amazon.com/dynamodb), 그리고 관계형 데이터베이스와 같은 인기 있는 캐싱 백엔드를 지원합니다. 또한 파일 기반 캐시 드라이버도 제공되며, `array`와 "null" 드라이버는 자동화된 테스트에 유용한 간편한 캐시 백엔드를 제공합니다.

캐시 설정 파일엔 그 외에도 여러 옵션이 포함되어 있으니, 반드시 파일 내용을 꼼꼼히 확인해 주세요. 기본적으로 라라벨은 `file` 캐시 드라이버를 사용하도록 설정되어 있는데, 이는 직렬화된 캐시 객체를 서버의 파일 시스템에 저장합니다. 규모가 더 큰 애플리케이션의 경우 Memcached 또는 Redis와 같은 더 견고한 드라이버 사용을 권장합니다. 동일한 드라이버에 대해 여러 개의 캐시 구성을 설정할 수도 있습니다.

<a name="driver-prerequisites"></a>
### 드라이버 사전 준비 사항

<a name="prerequisites-database"></a>
#### 데이터베이스

`database` 캐시 드라이버를 사용할 때는 캐시 항목을 저장할 테이블을 먼저 준비해야 합니다. 아래는 해당 테이블의 예시 `Schema` 선언입니다:

```
Schema::create('cache', function ($table) {
    $table->string('key')->unique();
    $table->text('value');
    $table->integer('expiration');
});
```

> [!TIP]
> `php artisan cache:table` 아티즌 명령어를 활용하면 위 구조에 맞는 마이그레이션 파일을 자동 생성할 수 있습니다.

<a name="memcached"></a>
#### Memcached

Memcached 드라이버를 사용하려면 [Memcached PECL 패키지](https://pecl.php.net/package/memcached)가 설치되어 있어야 합니다. 모든 Memcached 서버는 `config/cache.php` 설정 파일에 명시할 수 있습니다. 해당 파일에는 시작용으로 사용할 수 있는 `memcached.servers` 항목이 이미 포함되어 있습니다:

```
'memcached' => [
    'servers' => [
        [
            'host' => env('MEMCACHED_HOST', '127.0.0.1'),
            'port' => env('MEMCACHED_PORT', 11211),
            'weight' => 100,
        ],
    ],
],
```

필요하다면 `host` 옵션에 UNIX 소켓 경로를 지정할 수도 있습니다. 이때 `port` 옵션은 `0`으로 설정해야 합니다:

```
'memcached' => [
    [
        'host' => '/var/run/memcached/memcached.sock',
        'port' => 0,
        'weight' => 100
    ],
],
```

<a name="redis"></a>
#### Redis

라라벨에서 Redis 캐시를 사용하기 전에, PECL을 통해 PhpRedis PHP 확장 모듈을 설치하거나 Composer를 이용해 `predis/predis` 패키지(~1.0)를 설치해야 합니다. [Laravel Sail](/docs/8.x/sail)은 이미 이 확장 모듈을 포함하고 있습니다. 또한 [Laravel Forge](https://forge.laravel.com)와 [Laravel Vapor](https://vapor.laravel.com)와 같은 공식 라라벨 배포 플랫폼에도 기본적으로 PhpRedis 확장 모듈이 설치되어 있습니다.

Redis 설정에 대한 자세한 내용은 [라라벨 문서의 Redis 페이지](/docs/8.x/redis#configuration)를 참고해 주세요.

<a name="dynamodb"></a>
#### DynamoDB

[DynamoDB](https://aws.amazon.com/dynamodb) 캐시 드라이버를 사용하기 전에, 모든 캐시 데이터를 저장할 DynamoDB 테이블을 반드시 생성해야 합니다. 일반적으로 이 테이블의 이름은 `cache`로 지정합니다. 단, 애플리케이션의 `cache` 설정 파일에서 `stores.dynamodb.table` 항목에 지정한 값을 따라야 합니다.

또한, 이 테이블에는 파티션 키로 사용할 문자열 컬럼이 필요하며, 이 컬럼명은 설정 파일의 `stores.dynamodb.attributes.key` 값과 일치해야 합니다. 기본값은 `key`입니다.

<a name="cache-usage"></a>
## 캐시 사용 방법

<a name="obtaining-a-cache-instance"></a>
### 캐시 인스턴스 얻기

캐시 저장소 인스턴스를 얻으려면, 이 문서 전체에서 사용하게 될 `Cache` 파사드를 사용하면 됩니다. `Cache` 파사드는 라라벨에서 제공하는 캐시 계약의 실제 구현체에 간단하고 효율적으로 접근할 수 있게 해줍니다:

```
<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Cache;

class UserController extends Controller
{
    /**
     * 애플리케이션의 모든 사용자 목록을 보여줍니다.
     *
     * @return Response
     */
    public function index()
    {
        $value = Cache::get('key');

        //
    }
}
```

<a name="accessing-multiple-cache-stores"></a>
#### 여러 캐시 저장소에 접근하기

`Cache` 파사드를 사용하면 `store` 메서드를 통해 여러 캐시 저장소에 접근할 수 있습니다. `store`에 전달하는 키 값은 `cache` 설정 파일의 `stores` 배열에 정의된 저장소 이름과 일치해야 합니다:

```
$value = Cache::store('file')->get('foo');

Cache::store('redis')->put('bar', 'baz', 600); // 10분
```

<a name="retrieving-items-from-the-cache"></a>
### 캐시에서 항목 가져오기

캐시에서 데이터를 가져올 때는 `Cache` 파사드의 `get` 메서드를 사용합니다. 해당 항목이 캐시에 존재하지 않으면 `null`이 반환됩니다. 두 번째 인수를 사용하면 해당 항목이 없을 때 반환받고 싶은 기본값을 지정할 수 있습니다:

```
$value = Cache::get('key');

$value = Cache::get('key', 'default');
```

기본값으로 클로저를 전달할 수도 있습니다. 지정한 항목이 캐시에 없을 때, 클로저의 반환값이 기본값으로 사용됩니다. 클로저를 사용하면 데이터베이스나 외부 서비스 등에서 기본값을 지연해서 조회할 수 있습니다:

```
$value = Cache::get('key', function () {
    return DB::table(...)->get();
});
```

<a name="checking-for-item-existence"></a>
#### 항목 존재 여부 확인하기

`has` 메서드를 사용하면 캐시에 해당 항목이 존재하는지 확인할 수 있습니다. 이 메서드는 항목이 존재하더라도 값이 `null`이면 `false`를 반환합니다:

```
if (Cache::has('key')) {
    //
}
```

<a name="incrementing-decrementing-values"></a>
#### 값 증가/감소시키기

`increment`와 `decrement` 메서드를 사용하면 캐시에 저장된 정수값을 손쉽게 증가 또는 감소시킬 수 있습니다. 두 메서드 모두 항목 값을 얼마나 증감할지 선택적으로 두 번째 인수로 전달할 수 있습니다:

```
Cache::increment('key');
Cache::increment('key', $amount);
Cache::decrement('key');
Cache::decrement('key', $amount);
```

<a name="retrieve-store"></a>
#### 가져오기 & 저장하기

캐시에서 항목을 조회하되, 없으면 기본값을 저장하고 싶을 때가 있습니다. 예를 들어, 모든 사용자를 캐시에서 조회하고, 없으면 데이터베이스에서 가져와 캐시에 저장하는 경우입니다. 이런 경우는 `Cache::remember` 메서드를 사용하면 쉽게 처리할 수 있습니다:

```
$value = Cache::remember('users', $seconds, function () {
    return DB::table('users')->get();
});
```

지정한 항목이 캐시에 없으면, `remember` 메서드에 전달한 클로저가 실행되어 그 반환값이 캐시에 저장됩니다.

항목을 영구적으로 저장하거나 없으면 가져오는 작업은 `rememberForever` 메서드로 할 수 있습니다:

```
$value = Cache::rememberForever('users', function () {
    return DB::table('users')->get();
});
```

<a name="retrieve-delete"></a>
#### 가져오기 & 삭제하기

캐시에서 항목을 가져오고 즉시 삭제하고 싶을 때는 `pull` 메서드를 사용할 수 있습니다. 캐시에 항목이 없으면 `null`을 반환합니다:

```
$value = Cache::pull('key');
```

<a name="storing-items-in-the-cache"></a>
### 캐시에 항목 저장하기

`Cache` 파사드의 `put` 메서드를 사용하면 캐시에 원하는 값을 저장할 수 있습니다:

```
Cache::put('key', 'value', $seconds = 10);
```

저장 시간을 지정하지 않으면, 해당 항목은 무기한 저장됩니다:

```
Cache::put('key', 'value');
```

정수형 초(for 만료시간) 대신 캐시 만료 시점을 나타내는 `DateTime` 인스턴스를 전달할 수도 있습니다:

```
Cache::put('key', 'value', now()->addMinutes(10));
```

<a name="store-if-not-present"></a>
#### 존재하지 않을 때만 저장하기

`add` 메서드는 해당 항목이 캐시에 없을 때만 추가합니다. 실제로 캐시에 값이 추가되면 `true`를 반환하며, 이미 존재하는 경우엔 `false`를 반환합니다. 이 동작은 원자적으로 이루어집니다:

```
Cache::add('key', 'value', $seconds);
```

<a name="storing-items-forever"></a>
#### 영구적으로 항목 저장하기

`forever` 메서드를 사용하면 항목을 만료 기간 없이 영구적으로 저장할 수 있습니다. 이 항목들은 만료되지 않으므로, `forget` 메서드를 사용해 수동으로 삭제해야 합니다:

```
Cache::forever('key', 'value');
```

> [!TIP]
> Memcached 드라이버를 사용할 때, "forever"로 저장된 항목도 캐시의 크기 제한에 도달하면 제거될 수 있습니다.

<a name="removing-items-from-the-cache"></a>
### 캐시에서 항목 제거하기

`forget` 메서드를 사용해 캐시 항목을 제거할 수 있습니다:

```
Cache::forget('key');
```

만료 시간을 0이나 음수로 지정하면 항목을 삭제할 수도 있습니다:

```
Cache::put('key', 'value', 0);

Cache::put('key', 'value', -5);
```

캐시 전체를 비우고 싶은 경우엔 `flush` 메서드를 사용합니다:

```
Cache::flush();
```

> [!NOTE]
> 캐시를 비우면 설정한 캐시 "prefix"와 상관없이 모든 캐시 항목이 삭제됩니다. 여러 애플리케이션이 캐시를 공유하는 환경이라면 이 점을 신중하게 고려해야 합니다.

<a name="the-cache-helper"></a>
### 캐시 헬퍼

`Cache` 파사드 외에도, 전역 `cache` 함수를 사용하여 캐시에 데이터를 저장하거나 조회할 수 있습니다. `cache` 함수에 하나의 문자열 인수만 전달하면, 해당 키의 값을 반환합니다:

```
$value = cache('key');
```

함수에 키-값 쌍의 배열과 만료시간을 함께 전달하면, 지정한 기간 동안 캐시에 저장됩니다:

```
cache(['key' => 'value'], $seconds);

cache(['key' => 'value'], now()->addMinutes(10));
```

아무 인수도 주지 않고 `cache` 함수를 호출하면, `Illuminate\Contracts\Cache\Factory` 구현체의 인스턴스를 반환하므로, 다양한 캐시 관련 메서드를 사용할 수 있습니다:

```
cache()->remember('users', $seconds, function () {
    return DB::table('users')->get();
});
```

> [!TIP]
> 전역 `cache` 함수 호출을 테스트할 때는, [파사드 테스트](/docs/8.x/mocking#mocking-facades)에서와 같이 `Cache::shouldReceive` 메서드를 활용할 수 있습니다.

<a name="cache-tags"></a>
## 캐시 태그

> [!NOTE]
> `file`, `dynamodb`, `database` 캐시 드라이버에서는 캐시 태그를 사용할 수 없습니다. 또, 여러 태그를 사용하면서 "forever"로 저장된 캐시에서도, 오래된 레코드를 자동으로 제거해 주는 Memcached와 같은 드라이버를 사용할 때 가장 좋은 성능을 기대할 수 있습니다.

<a name="storing-tagged-cache-items"></a>
### 태그가 지정된 캐시 항목 저장하기

캐시 태그를 활용하면 관련된 여러 캐시 항목에 동일한 태그를 부여하고, 특정 태그가 부여된 캐시 값만 한 번에 비울 수 있습니다. 태그가 적용된 캐시에 접근하려면 원하는 태그명을 배열로 전달하면 됩니다. 예를 들어, 아래처럼 태그를 사용해 값을 저장할 수 있습니다:

```
Cache::tags(['people', 'artists'])->put('John', $john, $seconds);

Cache::tags(['people', 'authors'])->put('Anne', $anne, $seconds);
```

<a name="accessing-tagged-cache-items"></a>
### 태그가 지정된 캐시 항목 접근하기

태그가 적용된 캐시 항목을 조회하려면, 동일한 순서의 태그 목록을 `tags` 메서드에 전달한 뒤, 조회할 키로 `get` 메서드를 호출하면 됩니다:

```
$john = Cache::tags(['people', 'artists'])->get('John');

$anne = Cache::tags(['people', 'authors'])->get('Anne');
```

<a name="removing-tagged-cache-items"></a>
### 태그가 지정된 캐시 항목 제거하기

특정 태그가 지정된 모든 캐시 항목을 한 번에 제거할 수 있습니다. 예를 들어, 아래 코드는 `people`, `authors` 또는 두 태그 모두가 지정된 모든 캐시를 비웁니다. 즉, `Anne`과 `John`이 모두 제거됩니다:

```
Cache::tags(['people', 'authors'])->flush();
```

반면, 아래 코드는 `authors` 태그가 붙은 값만 제거하므로 `Anne`만 삭제되고, `John`은 그대로 남아 있게 됩니다:

```
Cache::tags('authors')->flush();
```

<a name="atomic-locks"></a>
## 원자적 락(Atomic Locks)

> [!NOTE]
> 이 기능을 사용하려면, 애플리케이션의 기본 캐시 드라이버로 `memcached`, `redis`, `dynamodb`, `database`, `file`, `array` 중 하나를 설정해야 합니다. 또한 모든 서버가 동일한 중앙 캐시 서버와 통신해야 합니다.

<a name="lock-driver-prerequisites"></a>
### 드라이버 사전 준비 사항

<a name="atomic-locks-prerequisites-database"></a>
#### 데이터베이스

`database` 캐시 드라이버를 사용할 경우, 애플리케이션의 캐시 락 정보를 저장할 테이블을 미리 생성해야 합니다. 아래는 예시 `Schema` 선언입니다:

```
Schema::create('cache_locks', function ($table) {
    $table->string('key')->primary();
    $table->string('owner');
    $table->integer('expiration');
});
```

<a name="managing-locks"></a>
### 락 관리하기

원자적 락은 레이스 컨디션 걱정 없이 분산 락을 다룰 수 있도록 해줍니다. 예를 들어, [Laravel Forge](https://forge.laravel.com)에서는 한 번에 하나의 원격 작업만 서버에서 실행하도록 원자적 락을 사용합니다. 락은 `Cache::lock` 메서드를 활용해 생성 및 관리할 수 있습니다:

```
use Illuminate\Support\Facades\Cache;

$lock = Cache::lock('foo', 10);

if ($lock->get()) {
    // 락을 10초 동안 획득했습니다...

    $lock->release();
}
```

`get` 메서드에는 클로저도 전달할 수 있습니다. 클로저 실행 후 라라벨이 자동으로 락을 해제합니다:

```
Cache::lock('foo')->get(function () {
    // 락을 무기한 획득하고, 작업 완료 후 자동 해제됩니다...
});
```

락이 요청 시점에 사용 불가능하면, 라라벨에 일정 시간만큼 대기하라고 지시할 수 있습니다. 락을 해당 시간 내에 얻지 못하면 `Illuminate\Contracts\Cache\LockTimeoutException` 예외가 발생합니다:

```
use Illuminate\Contracts\Cache\LockTimeoutException;

$lock = Cache::lock('foo', 10);

try {
    $lock->block(5);

    // 최대 5초 대기 후 락 획득...
} catch (LockTimeoutException $e) {
    // 락을 얻지 못했습니다...
} finally {
    optional($lock)->release();
}
```

위 예시를 더 간소화하려면 `block` 메서드에 클로저를 전달하면 됩니다. 이 메서드로 라라벨이 지정된 시간 동안 락 획득을 시도하고, 클로저 실행 후 자동으로 락을 해제합니다:

```
Cache::lock('foo', 10)->block(5, function () {
    // 최대 5초 대기 후 락 획득...
});
```

<a name="managing-locks-across-processes"></a>
### 프로세스 간 락 관리하기

때로는 한 프로세스에서 락을 획득하고, 다른 프로세스에서 락을 해제해야 할 수 있습니다. 예를 들어, 웹 요청 중 락을 잡고, 해당 요청에서 발생하는 큐 작업이 끝날 때 락을 해제하는 경우입니다. 이때는 락의 범위가 지정된 "owner token"을 큐 작업에 전달해서, 작업 내에서 동일한 락을 다시 인스턴스화해 해제할 수 있습니다.

아래 예시에서는 락을 성공적으로 획득했을 때 큐 작업을 디스패치합니다. 또한 락의 owner 토큰을 작업에 전달합니다:

```
$podcast = Podcast::find($id);

$lock = Cache::lock('processing', 120);

if ($lock->get()) {
    ProcessPodcast::dispatch($podcast, $lock->owner());
}
```

`ProcessPodcast` 작업 내에서는 owner 토큰을 활용해 락을 복원하고 해제할 수 있습니다:

```
Cache::restoreLock('processing', $this->owner)->release();
```

현재 owner를 무시하고 강제로 락을 해제하고 싶다면 `forceRelease` 메서드를 사용할 수 있습니다:

```
Cache::lock('processing')->forceRelease();
```

<a name="adding-custom-cache-drivers"></a>
## 커스텀 캐시 드라이버 추가하기

<a name="writing-the-driver"></a>
### 드라이버 작성하기

커스텀 캐시 드라이버를 만들려면, 우선 `Illuminate\Contracts\Cache\Store` [계약](/docs/8.x/contracts)을 구현해야 합니다. 예를 들어 MongoDB 캐시 드라이버는 아래와 같이 구현할 수 있습니다:

```
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

각 메서드는 MongoDB 연결을 이용해 구현해야 합니다. 구체적인 구현 방법은 [라라벨 프레임워크 소스코드](https://github.com/laravel/framework)의 `Illuminate\Cache\MemcachedStore`를 참고해 볼 수 있습니다. 구현이 끝나면, `Cache` 파사드의 `extend` 메서드를 호출해 커스텀 드라이버 등록을 마무리합니다:

```
Cache::extend('mongo', function ($app) {
    return Cache::repository(new MongoStore);
});
```

> [!TIP]
> 커스텀 캐시 드라이버 코드를 어디에 둘지 고민된다면, `app` 디렉터리 내에 `Extensions` 네임스페이스를 만들어 둘 수 있습니다. 물론 라라벨의 애플리케이션 구조에는 정해진 틀이 없으므로, 자유롭게 구조를 조직해도 무방합니다.

<a name="registering-the-driver"></a>
### 드라이버 등록하기

커스텀 캐시 드라이버를 라라벨에 등록하려면, `Cache` 파사드의 `extend` 메서드를 사용해야 합니다. 다른 서비스 프로바이더가 자신의 `boot` 메서드에서 캐시 값을 읽을 수 있으므로, 커스텀 드라이버 등록은 `booting` 콜백 안에서 진행하는 것이 좋습니다. 이렇게 하면 애플리케이션의 서비스 프로바이더의 `boot` 메서드가 호출되기 직전에, 그리고 모든 서비스 프로바이더의 `register` 메서드가 호출된 직후에 드라이버가 등록됩니다. 아래처럼 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `register` 메서드에서 `booting` 콜백을 사용해 등록할 수 있습니다:

```
<?php

namespace App\Providers;

use App\Extensions\MongoStore;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\ServiceProvider;

class CacheServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->booting(function () {
             Cache::extend('mongo', function ($app) {
                 return Cache::repository(new MongoStore);
             });
         });
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        //
    }
}
```

`extend` 메서드의 첫 번째 인자는 드라이버 이름이며, 이는 `config/cache.php` 설정 파일의 `driver` 옵션과 일치해야 합니다. 두 번째 인자는 `Illuminate\Cache\Repository` 인스턴스를 반환해야 하는 클로저인데, 이 클로저에는 [서비스 컨테이너](/docs/8.x/container) 인스턴스인 `$app`이 전달됩니다.

드라이버 확장이 등록되면, `config/cache.php` 설정 파일의 `driver` 항목에 해당 확장 이름을 지정해주면 됩니다.

<a name="events"></a>
## 이벤트

각 캐시 동작 시마다 코드를 실행하려면, 캐시에서 발생하는 [이벤트](/docs/8.x/events)를 구독하면 됩니다. 보통 이 이벤트 리스너들은 애플리케이션의 `App\Providers\EventServiceProvider` 클래스에 등록합니다:

```
/**
 * The event listener mappings for the application.
 *
 * @var array
 */
protected $listen = [
    'Illuminate\Cache\Events\CacheHit' => [
        'App\Listeners\LogCacheHit',
    ],

    'Illuminate\Cache\Events\CacheMissed' => [
        'App\Listeners\LogCacheMissed',
    ],

    'Illuminate\Cache\Events\KeyForgotten' => [
        'App\Listeners\LogKeyForgotten',
    ],

    'Illuminate\Cache\Events\KeyWritten' => [
        'App\Listeners\LogKeyWritten',
    ],
];
```