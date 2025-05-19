# 캐시 (Cache)

- [소개](#introduction)
- [설정](#configuration)
    - [드라이버 사전 조건](#driver-prerequisites)
- [캐시 사용법](#cache-usage)
    - [캐시 인스턴스 가져오기](#obtaining-a-cache-instance)
    - [캐시에서 항목 가져오기](#retrieving-items-from-the-cache)
    - [캐시에 항목 저장하기](#storing-items-in-the-cache)
    - [캐시에서 항목 삭제하기](#removing-items-from-the-cache)
    - [캐시 헬퍼](#the-cache-helper)
- [캐시 태그](#cache-tags)
    - [태그된 캐시 항목 저장](#storing-tagged-cache-items)
    - [태그된 캐시 항목 접근](#accessing-tagged-cache-items)
    - [태그된 캐시 항목 삭제](#removing-tagged-cache-items)
- [원자적 락](#atomic-locks)
    - [드라이버 사전 조건](#lock-driver-prerequisites)
    - [락 관리](#managing-locks)
    - [프로세스 간 락 관리](#managing-locks-across-processes)
- [커스텀 캐시 드라이버 추가](#adding-custom-cache-drivers)
    - [드라이버 작성하기](#writing-the-driver)
    - [드라이버 등록하기](#registering-the-driver)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

애플리케이션에서 수행하는 데이터 조회나 처리 작업 중 일부는 CPU를 많이 사용하거나, 몇 초 이상 걸릴 수 있습니다. 이런 경우, 한 번 조회한 데이터를 일정 시간 동안 캐시에 저장해서, 같은 데이터에 대한 이후 요청에서는 빠르게 가져올 수 있도록 하는 것이 일반적입니다. 캐시된 데이터는 보통 [Memcached](https://memcached.org)나 [Redis](https://redis.io)와 같은 매우 빠른 데이터 저장소에 보관됩니다.

라라벨은 다양한 캐시 백엔드를 위한 쉽고 통합된 API를 제공하여, 이런 고성능 데이터 저장소의 빠른 조회 속도를 쉽게 활용하고 웹 애플리케이션을 더욱 빠르게 만들 수 있습니다.

<a name="configuration"></a>
## 설정

애플리케이션의 캐시 설정 파일은 `config/cache.php`에 위치합니다. 이 파일에서, 애플리케이션 전반에서 기본으로 사용할 캐시 드라이버를 지정할 수 있습니다. 라라벨은 [Memcached](https://memcached.org), [Redis](https://redis.io), [DynamoDB](https://aws.amazon.com/dynamodb), 관계형 데이터베이스 등과 같은 널리 쓰이는 캐싱 백엔드를 기본적으로 지원합니다. 또한 파일 기반 캐시 드라이버도 사용할 수 있으며, `array`와 "null" 캐시 드라이버는 자동화된 테스트 환경에서 유용하게 쓸 수 있는 편리한 백엔드입니다.

캐시 설정 파일에는 이 외에도 다양한 옵션들이 포함되어 있으니, 파일 내용을 꼭 확인해 보시기 바랍니다. 기본적으로 라라벨은 `file` 캐시 드라이버를 사용하도록 설정되어 있으며, 이는 직렬화된 캐시 객체를 서버 파일 시스템에 저장합니다. 대규모 애플리케이션에서는 Memcached나 Redis와 같은 더욱 강력한 드라이버 사용을 권장합니다. 또한 동일한 드라이버에 대해 여러 개의 캐시 구성을 분리해서 사용할 수도 있습니다.

<a name="driver-prerequisites"></a>
### 드라이버 사전 조건

<a name="prerequisites-database"></a>
#### 데이터베이스

`database` 캐시 드라이버를 사용할 때는, 캐시 항목을 저장할 테이블을 직접 만들어야 합니다. 아래는 테이블을 위한 예시 `Schema` 선언 예시입니다.

```
Schema::create('cache', function ($table) {
    $table->string('key')->unique();
    $table->text('value');
    $table->integer('expiration');
});
```

> [!NOTE]
> 올바른 스키마로 마이그레이션 파일을 생성하려면 `php artisan cache:table` Artisan 명령어를 사용할 수도 있습니다.

<a name="memcached"></a>
#### Memcached

Memcached 드라이버를 이용하려면 [Memcached PECL 패키지](https://pecl.php.net/package/memcached)를 설치해야 합니다. 모든 Memcached 서버 정보를 `config/cache.php` 설정 파일에 나열할 수 있습니다. 기본적으로 이 파일에는 시작용 `memcached.servers` 항목이 포함되어 있습니다.

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

필요에 따라, `host` 옵션에 UNIX 소켓 경로를 지정할 수도 있습니다. 이 경우에는, `port` 옵션을 `0`으로 설정해야 합니다.

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

라라벨에서 Redis 캐시를 사용하려면, PECL을 통해 PhpRedis PHP 확장 모듈을 설치하거나, Composer를 이용해 `predis/predis` 패키지(~1.0)를 설치해야 합니다. [Laravel Sail](/docs/9.x/sail)은 이미 이 확장 모듈을 포함하고 있습니다. 또한, [Laravel Forge](https://forge.laravel.com) 및 [Laravel Vapor](https://vapor.laravel.com)와 같은 공식 라라벨 배포 플랫폼도 PhpRedis 확장을 기본적으로 설치하고 있습니다.

Redis 구성에 대한 더 자세한 내용은 [라라벨 공식 Redis 문서](/docs/9.x/redis#configuration)를 참고하세요.

<a name="dynamodb"></a>
#### DynamoDB

[DynamoDB](https://aws.amazon.com/dynamodb) 캐시 드라이버를 사용하기 전에는, 모든 캐시 데이터를 저장할 DynamoDB 테이블을 먼저 생성해야 합니다. 일반적으로 이 테이블의 이름은 `cache`로 지정하지만, 애플리케이션의 `cache` 설정 파일 내 `stores.dynamodb.table` 설정 값에 따라 이름을 지정하면 됩니다.

또한, 이 테이블에는 `cache` 설정 파일의 `stores.dynamodb.attributes.key` 설정값에 해당하는 이름의 문자열 파티션 키가 하나 있어야 합니다. 기본적으로 파티션 키는 `key`라는 이름이어야 합니다.

<a name="cache-usage"></a>
## 캐시 사용법

<a name="obtaining-a-cache-instance"></a>
### 캐시 인스턴스 가져오기

캐시 저장소 인스턴스를 얻으려면, 이 문서 전반에서 사용할 `Cache` 파사드를 활용하면 됩니다. `Cache` 파사드는 라라벨 캐시 컨트랙트의 실제 구현체에 간결하게 접근할 수 있도록 해줍니다.

```
<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Cache;

class UserController extends Controller
{
    /**
     * 애플리케이션의 전체 사용자 목록을 보여줍니다.
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

`Cache` 파사드를 이용해, `store` 메서드를 통해 다양한 캐시 저장소에 접근할 수 있습니다. 이때 전달하는 키는 `cache` 설정 파일의 `stores` 배열에 정의된 저장소 이름과 일치해야 합니다.

```
$value = Cache::store('file')->get('foo');

Cache::store('redis')->put('bar', 'baz', 600); // 10분
```

<a name="retrieving-items-from-the-cache"></a>
### 캐시에서 항목 가져오기

`Cache` 파사드의 `get` 메서드는 캐시에서 항목을 조회할 때 사용합니다. 캐시에 해당 항목이 없으면 `null`이 반환됩니다. 항목이 없을 경우 반환할 기본값을 두 번째 인자로 지정할 수도 있습니다.

```
$value = Cache::get('key');

$value = Cache::get('key', 'default');
```

기본값으로 클로저를 전달할 수도 있습니다. 만약 지정한 키가 캐시에 없다면, 이 클로저가 실행된 결과가 반환됩니다. 클로저를 사용하면, 기본값을 데이터베이스나 외부 서비스에서 가져올 필요가 있을 때, 해당 작업을 실제로 필요한 경우에만 수행할 수 있습니다.

```
$value = Cache::get('key', function () {
    return DB::table(/* ... */)->get();
});
```

<a name="checking-for-item-existence"></a>
#### 항목 존재 여부 확인

`has` 메서드는 캐시에 항목이 존재하는지 확인할 때 사용할 수 있습니다. 이 메서드는 항목이 존재하지만 값이 `null`인 경우에도 `false`를 반환합니다.

```
if (Cache::has('key')) {
    //
}
```

<a name="incrementing-decrementing-values"></a>
#### 값 증가/감소

`increment`와 `decrement` 메서드를 사용하면, 캐시에 저장된 정수형 값에 대해 값을 증감시킬 수 있습니다. 두 메서드 모두 증가/감소할 값(정수)을 두 번째 인자로 전달할 수 있습니다.

```
Cache::increment('key');
Cache::increment('key', $amount);
Cache::decrement('key');
Cache::decrement('key', $amount);
```

<a name="retrieve-store"></a>
#### 조회 또는 저장

캐시에서 항목을 조회하면서, 만약 없다면 기본값을 저장하고 싶을 때도 있습니다. 예를 들어 모든 사용자를 캐시에서 가져오거나, 없다면 데이터베이스에서 읽어서 캐시에 저장하는 경우입니다. 이럴 때는 `Cache::remember` 메서드를 사용할 수 있습니다.

```
$value = Cache::remember('users', $seconds, function () {
    return DB::table('users')->get();
});
```

캐시에 항목이 없으면, `remember` 메서드에 전달한 클로저가 실행되고 그 결과가 캐시에 저장됩니다.

항목을 영구적으로 저장하거나 조회하려면 `rememberForever` 메서드를 사용할 수 있습니다.

```
$value = Cache::rememberForever('users', function () {
    return DB::table('users')->get();
});
```

<a name="retrieve-delete"></a>
#### 조회 후 삭제

캐시에서 항목을 조회한 후, 바로 삭제하고 싶다면 `pull` 메서드를 사용할 수 있습니다. `get`과 마찬가지로, 항목이 없으면 `null`이 반환됩니다.

```
$value = Cache::pull('key');
```

<a name="storing-items-in-the-cache"></a>
### 캐시에 항목 저장하기

캐시에 항목을 저장하려면, `Cache` 파사드의 `put` 메서드를 사용할 수 있습니다.

```
Cache::put('key', 'value', $seconds = 10);
```

저장 시간을 지정하지 않으면, 해당 항목은 무기한 저장됩니다.

```
Cache::put('key', 'value');
```

저장 시간을 정수 (초) 대신 `DateTime` 인스턴스로 전달하여, 만료 시점을 지정할 수도 있습니다.

```
Cache::put('key', 'value', now()->addMinutes(10));
```

<a name="store-if-not-present"></a>
#### 없을 때만 저장

`add` 메서드는 캐시에 해당 키가 존재하지 않을 때만 항목을 저장합니다. 실제로 저장된다면 `true`를, 이미 존재해서 저장되지 않으면 `false`를 반환합니다. `add`는 원자적(atomic) 연산입니다.

```
Cache::add('key', 'value', $seconds);
```

<a name="storing-items-forever"></a>
#### 항목을 영구히 저장하기

`forever` 메서드를 이용하면 항목을 영구히 캐시에 저장할 수 있습니다. 이렇게 저장된 항목은 만료되지 않으므로, 필요하다면 `forget` 메서드로 직접 삭제해야 합니다.

```
Cache::forever('key', 'value');
```

> [!NOTE]
> Memcached 드라이버를 사용할 경우, "영구" 저장된 항목도 캐시 용량이 가득 차면 삭제될 수 있습니다.

<a name="removing-items-from-the-cache"></a>
### 캐시에서 항목 삭제하기

`forget` 메서드를 이용해 캐시에서 특정 항목을 삭제할 수 있습니다.

```
Cache::forget('key');
```

만료 시간을 0 또는 음수로 지정하여 항목을 삭제하는 것도 가능합니다.

```
Cache::put('key', 'value', 0);

Cache::put('key', 'value', -5);
```

캐시에 저장된 모든 항목을 한 번에 지우려면 `flush` 메서드를 사용하세요.

```
Cache::flush();
```

> [!WARNING]
> 캐시를 플러시(전체 삭제)하면 설정한 캐시 "prefix"와 관계없이 모든 항목이 삭제됩니다. 여러 애플리케이션에서 동일한 캐시 서버를 공유하는 경우, 플러시 사용 시 주의해야 합니다.

<a name="the-cache-helper"></a>
### 캐시 헬퍼

`Cache` 파사드 외에도, 글로벌 `cache` 함수를 통해 데이터를 캐시로 저장하거나 조회할 수 있습니다. 이 함수에 문자열 하나만 전달하면, 해당 키의 값을 반환합니다.

```
$value = cache('key');
```

키/값 쌍의 배열과 만료 시간을 함께 제공하면, 지정한 기간 동안 값을 캐시에 저장합니다.

```
cache(['key' => 'value'], $seconds);

cache(['key' => 'value'], now()->addMinutes(10));
```

인자를 전달하지 않고 `cache` 함수를 호출하면, `Illuminate\Contracts\Cache\Factory` 구현체 인스턴스를 반환하여 다양한 캐싱 메서드를 사용할 수 있습니다.

```
cache()->remember('users', $seconds, function () {
    return DB::table('users')->get();
});
```

> [!NOTE]
> 글로벌 `cache` 함수 호출을 테스트할 때는, [파사드 테스트](/docs/9.x/mocking#mocking-facades)와 마찬가지로 `Cache::shouldReceive` 메서드를 사용할 수 있습니다.

<a name="cache-tags"></a>
## 캐시 태그

> [!WARNING]
> 캐시 태그는 `file`, `dynamodb`, `database` 캐시 드라이버에서는 지원되지 않습니다. 또한, 여러 개의 태그와 "영구" 저장을 동시에 사용할 때는, 오래된 데이터를 자동으로 정리할 수 있는 `memcached`와 같은 드라이버를 사용하는 것이 가장 좋습니다.

<a name="storing-tagged-cache-items"></a>
### 태그된 캐시 항목 저장

캐시 태그 기능을 이용하면, 관련 항목에 태그를 달고, 해당 태그가 붙은 모든 항목을 한 번에 삭제할 수 있습니다. 태그명 배열을 순서대로 전달하면 태그가 적용된 캐시에 접근할 수 있습니다. 예를 들어, 태그를 적용해 값을 저장하는 방법은 아래와 같습니다.

```
Cache::tags(['people', 'artists'])->put('John', $john, $seconds);

Cache::tags(['people', 'authors'])->put('Anne', $anne, $seconds);
```

<a name="accessing-tagged-cache-items"></a>
### 태그된 캐시 항목 접근

태그를 이용해 저장한 항목은, 저장할 때 사용한 태그를 함께 제공해야만 조회할 수 있습니다. 아래 예시처럼, 동일한 순서의 태그 배열을 `tags` 메서드에 전달한 후, 원하는 키로 `get`을 호출하세요.

```
$john = Cache::tags(['people', 'artists'])->get('John');

$anne = Cache::tags(['people', 'authors'])->get('Anne');
```

<a name="removing-tagged-cache-items"></a>
### 태그된 캐시 항목 삭제

특정 태그나 태그 목록이 지정된 모든 캐시 항목을 한 번에 삭제할 수 있습니다. 예를 들어, 아래 코드는 `people`, `authors` 중 하나라도 포함된 모든 캐시를 삭제합니다. 따라서, `Anne`과 `John` 모두 캐시에서 삭제됩니다.

```
Cache::tags(['people', 'authors'])->flush();
```

반면, 아래 코드는 `authors` 태그가 붙은 항목만 삭제합니다. 즉, `Anne`만 삭제되고 `John`은 남게 됩니다.

```
Cache::tags('authors')->flush();
```

<a name="atomic-locks"></a>
## 원자적 락

> [!WARNING]
> 이 기능을 사용하려면, 애플리케이션의 기본 캐시 드라이버가 `memcached`, `redis`, `dynamodb`, `database`, `file`, 또는 `array` 중 하나여야 합니다. 추가로, 모든 서버가 중앙의 같은 캐시 서버와 통신해야 합니다.

<a name="lock-driver-prerequisites"></a>
### 드라이버 사전 조건

<a name="atomic-locks-prerequisites-database"></a>
#### 데이터베이스

`database` 캐시 드라이버로 원자적 락을 사용하려면, 애플리케이션의 락 정보를 저장할 테이블을 별도로 생성해야 합니다. 아래는 예시 `Schema` 선언입니다.

```
Schema::create('cache_locks', function ($table) {
    $table->string('key')->primary();
    $table->string('owner');
    $table->integer('expiration');
});
```

<a name="managing-locks"></a>
### 락 관리

원자적 락을 사용하면, 경쟁 상태(race condition)를 걱정할 필요 없이 분산 락을 안전하게 제어할 수 있습니다. 예를 들어, [Laravel Forge](https://forge.laravel.com)에서는 한 번에 하나의 원격 작업만 서버에서 실행되도록 원자적 락을 사용합니다. 락은 `Cache::lock` 메서드로 만들고 제어할 수 있습니다.

```
use Illuminate\Support\Facades\Cache;

$lock = Cache::lock('foo', 10);

if ($lock->get()) {
    // 10초 동안 락이 획득됨...

    $lock->release();
}
```

`get` 메서드에는 클로저도 전달할 수 있습니다. 클로저 실행이 끝나면 라라벨이 자동으로 락을 해제합니다.

```
Cache::lock('foo', 10)->get(function () {
    // 10초 동안 락이 획득되었다가 자동 해제됨...
});
```

락을 요청할 때 즉시 얻을 수 없다면, 라라벨에 특정 시간(초) 동안 기다려 달라고 요청할 수 있습니다. 이 시간 내에 락을 획득하지 못하면 `Illuminate\Contracts\Cache\LockTimeoutException`이 발생합니다.

```
use Illuminate\Contracts\Cache\LockTimeoutException;

$lock = Cache::lock('foo', 10);

try {
    $lock->block(5);

    // 최대 5초 동안 기다린 후 락 획득...
} catch (LockTimeoutException $e) {
    // 락을 획득하지 못함...
} finally {
    optional($lock)->release();
}
```

위 예시는 `block` 메서드에 클로저를 넘겨 더 간단하게 구현할 수 있습니다. 클로저가 실행되면 락이 자동으로 해제됩니다.

```
Cache::lock('foo', 10)->block(5, function () {
    // 최대 5초 기다린 후 락 획득 및 자동 해제...
});
```

<a name="managing-locks-across-processes"></a>
### 프로세스 간 락 관리

경우에 따라 한 프로세스에서 락을 획득하고, 다른 프로세스에서 락을 해제하고 싶을 수도 있습니다. 예를 들어, 웹 요청 도중 락을 획득하고, 해당 요청에 의해 트리거된 큐 작업(잡)의 마지막에서 락을 해제하기를 원할 수 있습니다. 이럴 때는 락의 범위(owner) 토큰을 잡(job)으로 전달한 후, 해당 토큰을 이용해 락을 다시 생성해 해제하면 됩니다.

아래 예시에서는, 락을 성공적으로 획득하면 큐 작업을 디스패치합니다. 그리고 락의 소유자 토큰을 큐 작업으로 전달합니다.

```
$podcast = Podcast::find($id);

$lock = Cache::lock('processing', 120);

if ($lock->get()) {
    ProcessPodcast::dispatch($podcast, $lock->owner());
}
```

애플리케이션의 `ProcessPodcast` 잡에서는 소유자 토큰으로 락을 복원해 해제할 수 있습니다.

```
Cache::restoreLock('processing', $this->owner)->release();
```

현재 락의 소유자를 고려하지 않고 강제로 락을 해제하려면 `forceRelease` 메서드를 사용할 수 있습니다.

```
Cache::lock('processing')->forceRelease();
```

<a name="adding-custom-cache-drivers"></a>
## 커스텀 캐시 드라이버 추가

<a name="writing-the-driver"></a>
### 드라이버 작성하기

커스텀 캐시 드라이버를 만들려면 먼저 `Illuminate\Contracts\Cache\Store` [컨트랙트](/docs/9.x/contracts)를 구현해야 합니다. 예를 들어, MongoDB용 캐시 구현은 다음과 같을 수 있습니다.

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

이제 각 메서드를 MongoDB 연결로 구현하면 됩니다. 각 메서드의 실제 예제 구현 방법은 [라라벨 프레임워크 소스코드의 `Illuminate\Cache\MemcachedStore`](https://github.com/laravel/framework)를 참고하시면 됩니다. 구현이 완료되면, `Cache` 파사드의 `extend` 메서드를 이용해 커스텀 드라이버를 등록할 수 있습니다.

```
Cache::extend('mongo', function ($app) {
    return Cache::repository(new MongoStore);
});
```

> [!NOTE]
> 커스텀 캐시 드라이버 코드를 어디에 두어야 할지 궁금하다면, `app` 디렉터리 내에 `Extensions` 네임스페이스를 만드는 것도 하나의 방법입니다. 다만, 라라벨의 애플리케이션 구조는 엄격하지 않으므로, 원하는 방식으로 자유롭게 구성하셔도 무방합니다.

<a name="registering-the-driver"></a>
### 드라이버 등록하기

라라벨에 커스텀 캐시 드라이버를 등록할 때는, `Cache` 파사드의 `extend` 메서드를 사용합니다. 다른 서비스 프로바이더들이 자신의 `boot` 메서드에서 캐시 값 읽기 작업을 시도할 수 있으므로, 커스텀 드라이버는 `booting` 콜백 내에서 등록하는 것이 중요합니다. `booting` 콜백을 사용하면, 애플리케이션의 모든 서비스 프로바이더의 `register` 메서드가 호출된 이후, 그리고 `boot` 메서드가 호출되기 직전에 커스텀 드라이버가 등록되도록 할 수 있습니다. 콜백은 주로 `App\Providers\AppServiceProvider` 클래스의 `register` 메서드에서 등록합니다.

```
<?php

namespace App\Providers;

use App\Extensions\MongoStore;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\ServiceProvider;

class CacheServiceProvider extends ServiceProvider
{
    /**
     * 애플리케이션 서비스 등록
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
     * 애플리케이션 서비스 부트스트랩
     *
     * @return void
     */
    public function boot()
    {
        //
    }
}
```

`extend` 메서드의 첫 번째 인자는 드라이버의 이름입니다. 이는 `config/cache.php` 설정 파일의 `driver` 옵션에 지정하는 이름과 일치해야 합니다. 두 번째 인자는 `Illuminate\Cache\Repository` 인스턴스를 반환하는 클로저이며, 이 클로저는 [서비스 컨테이너](/docs/9.x/container) 인스턴스인 `$app`을 파라미터로 전달받습니다.

드라이버 확장 기능을 등록한 후에는, `config/cache.php` 파일의 `driver` 값을 해당 확장 드라이버 이름으로 변경해야 합니다.

<a name="events"></a>
## 이벤트

모든 캐시 동작마다 특정 코드를 실행하려면, 캐시에서 발생하는 [이벤트](/docs/9.x/events)를 리스닝할 수 있습니다. 보통 이런 이벤트 리스너는 애플리케이션의 `App\Providers\EventServiceProvider` 클래스에 작성합니다.
```

use App\Listeners\LogCacheHit;
use App\Listeners\LogCacheMissed;
use App\Listeners\LogKeyForgotten;
use App\Listeners\LogKeyWritten;
use Illuminate\Cache\Events\CacheHit;
use Illuminate\Cache\Events\CacheMissed;
use Illuminate\Cache\Events\KeyForgotten;
use Illuminate\Cache\Events\KeyWritten;

/**
 * 애플리케이션의 이벤트 리스너 매핑
 *
 * @var array
 */
protected $listen = [
    CacheHit::class => [
        LogCacheHit::class,
    ],

    CacheMissed::class => [
        LogCacheMissed::class,
    ],

    KeyForgotten::class => [
        LogKeyForgotten::class,
    ],

    KeyWritten::class => [
        LogKeyWritten::class,
    ],
];
```