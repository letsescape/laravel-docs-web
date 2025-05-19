# 레디스 (Redis)

- [소개](#introduction)
- [설정](#configuration)
    - [클러스터](#clusters)
    - [Predis](#predis)
    - [PhpRedis](#phpredis)
- [Redis와 상호작용하기](#interacting-with-redis)
    - [트랜잭션](#transactions)
    - [파이프라이닝 명령어](#pipelining-commands)
- [Pub / Sub](#pubsub)

<a name="introduction"></a>
## 소개

[Redis](https://redis.io)은 오픈 소스이며, 고급 키-값 저장소입니다. 키에 [문자열](https://redis.io/docs/data-types/strings/), [해시](https://redis.io/docs/data-types/hashes/), [리스트](https://redis.io/docs/data-types/lists/), [셋](https://redis.io/docs/data-types/sets/), [정렬된 셋](https://redis.io/docs/data-types/sorted-sets/) 등 다양한 데이터 구조를 저장할 수 있기 때문에 데이터 구조 서버로도 자주 불립니다.

라라벨에서 Redis를 사용하기 전에, PECL을 통해 [PhpRedis](https://github.com/phpredis/phpredis) PHP 확장 모듈을 설치하여 사용하는 것을 권장합니다. 이 확장 모듈은 일반적인 PHP 패키지(소위 "user-land" 패키지)에 비해 설치가 다소 복잡할 수 있으나, Redis를 많이 사용하는 애플리케이션에서 더 나은 성능을 제공할 수 있습니다. 만약 [Laravel Sail](/docs/12.x/sail)을 사용한다면, 이 확장 모듈은 이미 애플리케이션의 Docker 컨테이너에 사전 설치되어 있습니다.

만약 PhpRedis 확장 모듈을 설치할 수 없는 경우에는 Composer를 통해 `predis/predis` 패키지를 설치하여 사용할 수 있습니다. Predis는 PHP로만 작성된 Redis 클라이언트로, 별도의 확장 모듈 설치가 필요하지 않습니다.

```shell
composer require predis/predis:^2.0
```

<a name="configuration"></a>
## 설정

애플리케이션의 Redis 설정은 `config/database.php` 설정 파일에서 구성할 수 있습니다. 이 파일 안의 `redis` 배열에는 애플리케이션에서 사용할 Redis 서버들의 정보가 들어 있습니다.

```php
'redis' => [

    'client' => env('REDIS_CLIENT', 'phpredis'),

    'options' => [
        'cluster' => env('REDIS_CLUSTER', 'redis'),
        'prefix' => env('REDIS_PREFIX', Str::slug(env('APP_NAME', 'laravel'), '_').'_database_'),
    ],

    'default' => [
        'url' => env('REDIS_URL'),
        'host' => env('REDIS_HOST', '127.0.0.1'),
        'username' => env('REDIS_USERNAME'),
        'password' => env('REDIS_PASSWORD'),
        'port' => env('REDIS_PORT', '6379'),
        'database' => env('REDIS_DB', '0'),
    ],

    'cache' => [
        'url' => env('REDIS_URL'),
        'host' => env('REDIS_HOST', '127.0.0.1'),
        'username' => env('REDIS_USERNAME'),
        'password' => env('REDIS_PASSWORD'),
        'port' => env('REDIS_PORT', '6379'),
        'database' => env('REDIS_CACHE_DB', '1'),
    ],

],
```

설정 파일에 정의된 각 Redis 서버는 이름, 호스트, 포트가 필요합니다. 단, Redis 연결 정보를 하나의 URL로만 지정한 경우에는 예외입니다.

```php
'redis' => [

    'client' => env('REDIS_CLIENT', 'phpredis'),

    'options' => [
        'cluster' => env('REDIS_CLUSTER', 'redis'),
        'prefix' => env('REDIS_PREFIX', Str::slug(env('APP_NAME', 'laravel'), '_').'_database_'),
    ],

    'default' => [
        'url' => 'tcp://127.0.0.1:6379?database=0',
    ],

    'cache' => [
        'url' => 'tls://user:password@127.0.0.1:6380?database=1',
    ],

],
```

<a name="configuring-the-connection-scheme"></a>
#### 연결 스킴 구성하기

기본적으로 Redis 클라이언트는 Redis 서버에 연결할 때 `tcp` 스킴을 사용합니다. 하지만, Redis 서버 설정 배열에 `scheme` 옵션을 지정하여 TLS/SSL 암호화를 적용할 수도 있습니다.

```php
'default' => [
    'scheme' => 'tls',
    'url' => env('REDIS_URL'),
    'host' => env('REDIS_HOST', '127.0.0.1'),
    'username' => env('REDIS_USERNAME'),
    'password' => env('REDIS_PASSWORD'),
    'port' => env('REDIS_PORT', '6379'),
    'database' => env('REDIS_DB', '0'),
],
```

<a name="clusters"></a>
### 클러스터

애플리케이션에서 여러 대의 Redis 서버로 이루어진 클러스터를 사용할 경우, Redis 설정 파일의 `clusters` 키에 클러스터 정보를 정의해야 합니다. 이 설정 키는 기본적으로 존재하지 않으므로, `config/database.php` 파일에 직접 추가해야 합니다.

```php
'redis' => [

    'client' => env('REDIS_CLIENT', 'phpredis'),

    'options' => [
        'cluster' => env('REDIS_CLUSTER', 'redis'),
        'prefix' => env('REDIS_PREFIX', Str::slug(env('APP_NAME', 'laravel'), '_').'_database_'),
    ],

    'clusters' => [
        'default' => [
            [
                'url' => env('REDIS_URL'),
                'host' => env('REDIS_HOST', '127.0.0.1'),
                'username' => env('REDIS_USERNAME'),
                'password' => env('REDIS_PASSWORD'),
                'port' => env('REDIS_PORT', '6379'),
                'database' => env('REDIS_DB', '0'),
            ],
        ],
    ],

    // ...
],
```

기본적으로 라라벨은 `options.cluster` 설정 값이 `redis`로 되어 있기 때문에 네이티브 Redis 클러스터링을 사용합니다. Redis 클러스터링 기능은 장애 발생 시 자동으로 failover(장애 조치)를 처리해 주기 때문에 우수한 기본 옵션입니다.

Predis 사용 시에는 클라이언트 측 샤딩(client-side sharding)도 지원합니다. 하지만 클라이언트 측 샤딩은 장애 조치(failover) 기능이 없으므로, 다른 주요 데이터 저장소에서 언제든 다시 가져올 수 있는 캐시 데이터를 처리할 때 주로 적합합니다.

네이티브 Redis 클러스터링 대신 클라이언트 측 샤딩을 사용하려면, 애플리케이션의 `config/database.php` 설정 파일에서 `options.cluster` 값을 제거하면 됩니다.

```php
'redis' => [

    'client' => env('REDIS_CLIENT', 'phpredis'),

    'clusters' => [
        // ...
    ],

    // ...
],
```

<a name="predis"></a>
### Predis

애플리케이션에서 Predis 패키지를 통해 Redis와 상호작용하고 싶다면, `REDIS_CLIENT` 환경 변수의 값을 `predis`로 설정해야 합니다.

```php
'redis' => [

    'client' => env('REDIS_CLIENT', 'predis'),

    // ...
],
```

기본 설정 옵션 외에도, Predis는 각 Redis 서버마다 추가적인 [연결 파라미터](https://github.com/nrk/predis/wiki/Connection-Parameters)를 지원합니다. 이러한 옵션을 사용하려면, 설정 파일의 해당 Redis 서버 설정에 옵션을 추가하면 됩니다.

```php
'default' => [
    'url' => env('REDIS_URL'),
    'host' => env('REDIS_HOST', '127.0.0.1'),
    'username' => env('REDIS_USERNAME'),
    'password' => env('REDIS_PASSWORD'),
    'port' => env('REDIS_PORT', '6379'),
    'database' => env('REDIS_DB', '0'),
    'read_write_timeout' => 60,
],
```

<a name="phpredis"></a>
### PhpRedis

라라벨은 기본적으로 PhpRedis 확장 모듈을 통해 Redis와 통신합니다. 실제로 어떤 Redis 클라이언트를 사용할지는 `redis.client` 설정 값에 따라 결정되며, 보통 이는 `REDIS_CLIENT` 환경 변수 값을 반영합니다.

```php
'redis' => [

    'client' => env('REDIS_CLIENT', 'phpredis'),

    // ...
],
```

기본 옵션 외에도, PhpRedis는 다음과 같은 추가 연결 파라미터를 지원합니다. `name`, `persistent`, `persistent_id`, `prefix`, `read_timeout`, `retry_interval`, `max_retries`, `backoff_algorithm`, `backoff_base`, `backoff_cap`, `timeout`, `context` 등입니다. 필요에 따라 `config/database.php` 설정 파일에 아래와 같이 추가할 수 있습니다.

```php
'default' => [
    'url' => env('REDIS_URL'),
    'host' => env('REDIS_HOST', '127.0.0.1'),
    'username' => env('REDIS_USERNAME'),
    'password' => env('REDIS_PASSWORD'),
    'port' => env('REDIS_PORT', '6379'),
    'database' => env('REDIS_DB', '0'),
    'read_timeout' => 60,
    'context' => [
        // 'auth' => ['username', 'secret'],
        // 'stream' => ['verify_peer' => false],
    ],
],
```

<a name="unix-socket-connections"></a>
#### 유닉스 소켓 연결

Redis는 TCP 대신 유닉스 소켓을 이용하여 연결할 수도 있습니다. 이 방법은 애플리케이션과 같은 서버에 Redis 인스턴스가 있을 때 TCP 오버헤드를 줄여 성능을 높일 수 있습니다. 유닉스 소켓 연결을 위해서는 `REDIS_HOST` 환경 변수에 Redis 소켓의 경로를, `REDIS_PORT` 환경 변수에는 `0`을 입력하면 됩니다.

```env
REDIS_HOST=/run/redis/redis.sock
REDIS_PORT=0
```

<a name="phpredis-serialization"></a>
#### PhpRedis 직렬화 및 압축

PhpRedis 확장은 여러 종류의 직렬화 및 압축 알고리즘을 지원합니다. 이 옵션들은 Redis 설정의 `options` 배열에서 지정할 수 있습니다.

```php
'redis' => [

    'client' => env('REDIS_CLIENT', 'phpredis'),

    'options' => [
        'cluster' => env('REDIS_CLUSTER', 'redis'),
        'prefix' => env('REDIS_PREFIX', Str::slug(env('APP_NAME', 'laravel'), '_').'_database_'),
        'serializer' => Redis::SERIALIZER_MSGPACK,
        'compression' => Redis::COMPRESSION_LZ4,
    ],

    // ...
],
```

현재 지원하는 직렬화 알고리즘은 다음과 같습니다. `Redis::SERIALIZER_NONE`(기본값), `Redis::SERIALIZER_PHP`, `Redis::SERIALIZER_JSON`, `Redis::SERIALIZER_IGBINARY`, `Redis::SERIALIZER_MSGPACK`

지원하는 압축 알고리즘은 다음과 같습니다. `Redis::COMPRESSION_NONE`(기본값), `Redis::COMPRESSION_LZF`, `Redis::COMPRESSION_ZSTD`, `Redis::COMPRESSION_LZ4`

<a name="interacting-with-redis"></a>
## Redis와 상호작용하기

`Redis` [파사드](/docs/12.x/facades)의 다양한 메서드를 호출하여 Redis와 상호작용할 수 있습니다. `Redis` 파사드는 동적 메서드 호출 방식을 지원하므로, [Redis 명령어](https://redis.io/commands)라면 어떤 것이든 파사드에서 직접 호출할 수 있으며, 해당 명령어가 바로 Redis에 전달됩니다. 예를 들어, `Redis` 파사드에서 `get` 메서드를 사용하면 Redis의 `GET` 명령을 실행할 수 있습니다.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Redis;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * Show the profile for the given user.
     */
    public function show(string $id): View
    {
        return view('user.profile', [
            'user' => Redis::get('user:profile:'.$id)
        ]);
    }
}
```

위에서 설명한 것처럼, `Redis` 파사드에서는 Redis의 모든 명령어를 호출할 수 있습니다. 라라벨은 매직 메서드를 이용해 렌퍼런스된 명령어를 Redis 서버에 전달합니다. Redis 명령어에 인수가 필요한 경우, 해당 인수들을 파사드의 대응 메서드에 전달하면 됩니다.

```php
use Illuminate\Support\Facades\Redis;

Redis::set('name', 'Taylor');

$values = Redis::lrange('names', 5, 10);
```

또한, 명령어 이름과 인수 배열을 인자로 받아 Redis 서버로 직접 명령을 전달하는 `Redis` 파사드의 `command` 메서드를 사용할 수도 있습니다.

```php
$values = Redis::command('lrange', ['name', 5, 10]);
```

<a name="using-multiple-redis-connections"></a>
#### 여러 Redis 연결 사용하기

애플리케이션의 `config/database.php` 설정 파일에서는 여러 개의 Redis 연결(서버)을 정의할 수 있습니다. `Redis` 파사드의 `connection` 메서드를 이용하면, 특정 이름의 Redis 연결을 가져올 수 있습니다.

```php
$redis = Redis::connection('connection-name');
```

기본 Redis 연결 인스턴스를 가져오려면 `connection` 메서드에 인수를 넘기지 않으면 됩니다.

```php
$redis = Redis::connection();
```

<a name="transactions"></a>
### 트랜잭션

`Redis` 파사드의 `transaction` 메서드는 Redis의 기본 `MULTI` 및 `EXEC` 명령을 간편하게 래핑한 메서드입니다. 이 메서드는 하나의 인수로 클로저(익명 함수)를 받습니다. 이 클로저에는 Redis 연결 인스턴스가 전달되며, 클로저 안에서 Redis 인스턴스에 여러 명령을 실행할 수 있습니다. 클로저 안에서 실행된 모든 Redis 명령은 하나의 원자적 트랜잭션으로 처리됩니다.

```php
use Redis;
use Illuminate\Support\Facades;

Facades\Redis::transaction(function (Redis $redis) {
    $redis->incr('user_visits', 1);
    $redis->incr('total_visits', 1);
});
```

> [!WARNING]
> Redis 트랜잭션을 정의할 때, 트랜잭션 내부에서는 Redis로부터 값을 조회할 수 없습니다. 트랜잭션 내의 모든 작업은 클로저가 완전히 실행된 후 원자적으로 한 번에 처리되기 때문입니다.

#### Lua 스크립트

`eval` 메서드를 사용하면 여러 Redis 명령을 하나의 원자적 작업으로 처리할 수 있습니다. 이 방식은 트랜잭션과 비슷하지만, Lua 스크립트를 사용하여 작업 도중 Redis의 키 값을 직접 읽고 조작할 수 있다는 장점이 있습니다. Redis 스크립트는 [Lua 프로그래밍 언어](https://www.lua.org)로 작성됩니다.

`eval` 메서드는 여러 개의 인수를 받습니다. 첫째로, Lua 스크립트(문자열)를 첫 번째 인수로 넘깁니다. 둘째로, 스크립트와 상호작용하는 키의 개수(정수)를 전달합니다. 셋째로, 사용할 키의 이름들을 넘기고, 마지막으로 스크립트 내에서 사용할 기타 추가 인수도 전달할 수 있습니다.

아래 예시에서는 카운터를 증가시키고(increment), 새 값이 5보다 크면 두 번째 카운터도 증가시킵니다. 마지막으로 첫 번째 카운터의 값을 반환합니다.

```php
$value = Redis::eval(<<<'LUA'
    local counter = redis.call("incr", KEYS[1])

    if counter > 5 then
        redis.call("incr", KEYS[2])
    end

    return counter
LUA, 2, 'first-counter', 'second-counter');
```

> [!WARNING]
> Redis 스크립팅과 관련하여 더 자세한 내용은 [Redis 공식 문서](https://redis.io/commands/eval)를 참고하시기 바랍니다.

<a name="pipelining-commands"></a>
### 파이프라이닝 명령어

경우에 따라 Redis 명령어를 수십 번 이상 실행해야 할 때가 있습니다. 이때, 명령어마다 네트워크를 왕복하는 대신 `pipeline` 메서드를 사용할 수 있습니다. 이 메서드는 Redis 인스턴스를 인수로 받는 클로저를 하나 전달받으며, 이 인스턴스에 여러 명령어를 기록하면, 해당 명령어들이 한 번에 Redis 서버로 전송되어 네트워크 왕복 횟수를 최소화할 수 있습니다. 여러 명령어는 입력한 순서대로 실행됩니다.

```php
use Redis;
use Illuminate\Support\Facades;

Facades\Redis::pipeline(function (Redis $pipe) {
    for ($i = 0; $i < 1000; $i++) {
        $pipe->set("key:$i", $i);
    }
});
```

<a name="pubsub"></a>
## Pub / Sub

라라벨은 Redis의 `publish`와 `subscribe` 명령을 사용할 수 있는 편리한 인터페이스를 제공합니다. 이 명령어들은 특정 "채널"에 메시지를 발행하거나, 해당 채널에서 메시지를 수신(구독)할 수 있도록 해줍니다. 다른 애플리케이션이나 다른 프로그래밍 언어로 메시지를 발행할 수도 있기 때문에, 여러 애플리케이션과 프로세스 간에 손쉽게 통신이 가능합니다.

먼저, `subscribe` 메서드를 사용해 채널 리스너를 설정해보겠습니다. 이 메서드는 장시간 실행되는 프로세스이기 때문에, [Artisan 명령어](/docs/12.x/artisan) 안에서 호출하는 것이 좋습니다.

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Redis;

class RedisSubscribe extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'redis:subscribe';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Subscribe to a Redis channel';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        Redis::subscribe(['test-channel'], function (string $message) {
            echo $message;
        });
    }
}
```

이제 `publish` 메서드를 사용해서 해당 채널로 메시지를 보낼 수 있습니다.

```php
use Illuminate\Support\Facades\Redis;

Route::get('/publish', function () {
    // ...

    Redis::publish('test-channel', json_encode([
        'name' => 'Adam Wathan'
    ]));
});
```

<a name="wildcard-subscriptions"></a>
#### 와일드카드 구독

`psubscribe` 메서드를 사용하면 와일드카드로 여러 채널을 한 번에 구독할 수 있습니다. 이 방법은 모든 채널의 메시지를 수신하거나, 특정 패턴의 채널 메시지를 모두 받고자 할 때 유용합니다. 전달된 클로저에 채널 이름이 두 번째 인수로 함께 넘어갑니다.

```php
Redis::psubscribe(['*'], function (string $message, string $channel) {
    echo $message;
});

Redis::psubscribe(['users.*'], function (string $message, string $channel) {
    echo $message;
});
```
