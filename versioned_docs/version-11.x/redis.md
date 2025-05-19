# 레디스 (Redis)

- [소개](#introduction)
- [설정](#configuration)
    - [클러스터](#clusters)
    - [Predis](#predis)
    - [PhpRedis](#phpredis)
- [Redis와 상호작용하기](#interacting-with-redis)
    - [트랜잭션](#transactions)
    - [파이프라인 명령어](#pipelining-commands)
- [Pub / Sub](#pubsub)

<a name="introduction"></a>
## 소개

[Redis](https://redis.io)는 오픈 소스의 고급 키-값 저장소입니다. 종종 데이터 구조 서버라고 불리기도 하는데, 이는 키에 [문자열](https://redis.io/docs/data-types/strings/), [해시](https://redis.io/docs/data-types/hashes/), [리스트](https://redis.io/docs/data-types/lists/), [셋](https://redis.io/docs/data-types/sets/), [정렬된 셋](https://redis.io/docs/data-types/sorted-sets/) 등 다양한 데이터 구조를 저장할 수 있기 때문입니다.

라라벨에서 Redis를 사용하기 전에, PECL을 통해 [PhpRedis](https://github.com/phpredis/phpredis) PHP 확장 프로그램을 설치하여 사용하는 것을 권장합니다. 이 확장은 "user-land" PHP 패키지에 비해 설치 과정이 다소 복잡하지만, Redis를 자주 사용하는 애플리케이션에서는 더 나은 성능을 기대할 수 있습니다. [Laravel Sail](/docs/11.x/sail)을 사용하고 있다면, 해당 확장 프로그램이 이미 애플리케이션의 Docker 컨테이너에 설치되어 있습니다.

PhpRedis 확장 프로그램을 설치할 수 없는 경우, Composer를 통해 `predis/predis` 패키지를 설치해서 사용할 수도 있습니다. Predis는 전적으로 PHP로 작성된 Redis 클라이언트로, 별도의 추가 확장 프로그램 없이 작동합니다:

```shell
composer require predis/predis:^2.0
```

<a name="configuration"></a>
## 설정

애플리케이션의 Redis 설정은 `config/database.php` 설정 파일을 통해 관리할 수 있습니다. 이 파일 안에서 `redis` 배열을 확인할 수 있는데, 이 배열에는 애플리케이션에서 사용하는 Redis 서버 정보가 정의되어 있습니다:

```
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

설정 파일에 정의된 각 Redis 서버는 반드시 이름, 호스트, 포트를 지정해야 합니다. 단, Redis 연결을 나타내는 단일 URL을 사용한다면 이러한 설정을 생략할 수 있습니다:

```
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
#### 연결 스킴(scheme) 설정

기본적으로 Redis 클라이언트는 Redis 서버에 연결할 때 `tcp` 스킴을 사용합니다. 하지만, Redis 서버 설정 배열에서 `scheme` 옵션을 지정하면 TLS / SSL 암호화 연결을 사용할 수 있습니다:

```
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

애플리케이션에서 여러 대의 Redis 서버 클러스터를 사용해야 할 경우, Redis 설정에서 `clusters` 키를 만들고 해당 클러스터 정보를 정의해야 합니다. 이 설정 키는 기본적으로 존재하지 않으므로, 애플리케이션의 `config/database.php` 파일에 수동으로 추가해야 합니다:

```
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

기본적으로 라라벨은 `options.cluster` 설정 값이 `redis`로 지정되어 있기 때문에 네이티브 Redis 클러스터 기능을 사용합니다. Redis 클러스터는 장애 발생 시에도 안정적으로 페일오버(failover)를 처리해주는 좋은 기본 옵션입니다.

Predis를 사용할 때는 클라이언트 사이드 샤딩(client-side sharding)도 지원합니다. 하지만 클라이언트 사이드 샤딩은 페일오버를 처리하지 않으므로, 주로 다른 기본 데이터 저장소에서 쉽게 가져올 수 있는 임시 캐시 데이터 저장에 적합합니다.

네이티브 Redis 클러스터가 아닌 클라이언트 사이드 샤딩을 사용하고 싶다면, 애플리케이션의 `config/database.php`에서 `options.cluster` 설정 값을 제거하면 됩니다:

```
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

애플리케이션에서 Predis 패키지를 통해 Redis와 통신하려면, 반드시 `REDIS_CLIENT` 환경 변수의 값을 `predis`로 지정해야 합니다:

```
'redis' => [

    'client' => env('REDIS_CLIENT', 'predis'),

    // ...
],
```

기본 설정 옵션 외에도, Predis는 각 Redis 서버에 대해 추가 [연결 파라미터](https://github.com/nrk/predis/wiki/Connection-Parameters)를 지원합니다. 이러한 추가 옵션을 사용하려면 애플리케이션의 `config/database.php` 설정 파일의 Redis 서버 설정에 옵션을 추가하면 됩니다:

```
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

라라벨에서는 기본적으로 PhpRedis 확장 프로그램을 사용해서 Redis와 통신합니다. 어떤 클라이언트를 사용할지는 `redis.client` 설정 값(주로 `REDIS_CLIENT` 환경 변수에 반영됨)에 의해 결정됩니다:

```
'redis' => [

    'client' => env('REDIS_CLIENT', 'phpredis'),

    // ...
],
```

기본 설정 옵션 외에도, PhpRedis는 다음과 같은 추가 연결 파라미터를 지원합니다: `name`, `persistent`, `persistent_id`, `prefix`, `read_timeout`, `retry_interval`, `max_retries`, `backoff_algorithm`, `backoff_base`, `backoff_cap`, `timeout`, `context` 등이 있습니다. 이 옵션들은 `config/database.php`의 Redis 서버 설정에 자유롭게 추가할 수 있습니다:

```
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

<a name="phpredis-serialization"></a>
#### PhpRedis 직렬화(Serialization) 및 압축(Compression)

PhpRedis 확장은 여러 종류의 직렬화 및 압축 알고리즘도 설정할 수 있습니다. 이 알고리즘들은 Redis 설정의 `options` 배열에서 지정할 수 있습니다:

```
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

현재 지원되는 직렬화 기법에는 다음이 포함됩니다: `Redis::SERIALIZER_NONE`(기본값), `Redis::SERIALIZER_PHP`, `Redis::SERIALIZER_JSON`, `Redis::SERIALIZER_IGBINARY`, `Redis::SERIALIZER_MSGPACK`.

지원되는 압축 알고리즘은 다음과 같습니다: `Redis::COMPRESSION_NONE`(기본값), `Redis::COMPRESSION_LZF`, `Redis::COMPRESSION_ZSTD`, `Redis::COMPRESSION_LZ4`.

<a name="interacting-with-redis"></a>
## Redis와 상호작용하기

`Redis` [파사드](/docs/11.x/facades)를 통해 다양한 Redis 명령어를 호출해 Redis와 직접 상호작용할 수 있습니다. `Redis` 파사드는 동적 메서드를 지원하므로, [Redis 명령어](https://redis.io/commands)라면 무엇이든 파사드에 호출하면 해당 명령어가 그대로 Redis에 전달됩니다. 아래 예시에서는 `Redis` 파사드의 `get` 메서드로 Redis의 `GET` 명령어를 호출합니다:

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
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

위에서 설명했듯이, `Redis` 파사드를 통해 어떤 Redis 명령어든 호출할 수 있습니다. 라라벨은 매직 메서드를 이용해 해당 명령어를 Redis 서버로 전달합니다. 만약 명령어에 인수를 넘겨야 한다면, 해당 인수들을 파사드의 해당 메서드에 전달하면 됩니다:

```
use Illuminate\Support\Facades\Redis;

Redis::set('name', 'Taylor');

$values = Redis::lrange('names', 5, 10);
```

또는, `Redis` 파사드의 `command` 메서드를 이용해 명령어를 전달할 수도 있습니다. 이 메서드는 첫 번째 인수에 명령어 이름, 두 번째 인수에 값들의 배열을 받습니다:

```
$values = Redis::command('lrange', ['name', 5, 10]);
```

<a name="using-multiple-redis-connections"></a>
#### 여러 Redis 연결 사용하기

애플리케이션의 `config/database.php` 설정 파일에서 여러 개의 Redis 연결(서버)을 정의할 수 있습니다. 특정 Redis 연결에 접근하려면, `Redis` 파사드의 `connection` 메서드를 사용합니다:

```
$redis = Redis::connection('connection-name');
```

기본 Redis 연결 인스턴스를 가져오고 싶다면, `connection` 메서드에 인수 없이 호출하면 됩니다:

```
$redis = Redis::connection();
```

<a name="transactions"></a>
### 트랜잭션

`Redis` 파사드의 `transaction` 메서드는 Redis의 기본 `MULTI` 및 `EXEC` 명령어를 쉽고 간단하게 감싸 제공합니다. 이 메서드는 클로저를 유일한 인수로 받는데, 이 클로저에 Redis 연결 인스턴스가 전달되며 클로저 안에서 원하는 만큼 명령어를 쓸 수 있습니다. 클로저 내에서 실행된 모든 Redis 명령어는 하나의 단일 원자적 트랜잭션으로 실행됩니다.

```
use Redis;
use Illuminate\Support\Facades;

Facades\Redis::transaction(function (Redis $redis) {
    $redis->incr('user_visits', 1);
    $redis->incr('total_visits', 1);
});
```

> [!WARNING]  
> Redis 트랜잭션을 정의할 때는, 트랜잭션 내에서 Redis로부터 값을 읽어올 수 없습니다. 트랜잭션은 하나의 원자적 연산으로 실행되며, 클로저 안의 모든 명령어가 실행 완료된 후에야 실제로 수행됩니다.

#### Lua 스크립트

`eval` 메서드는 여러 개의 Redis 명령을 하나의 원자적 작업으로 실행하는 또 다른 방법입니다. `eval` 메서드의 장점은 해당 연산 중에 Redis 키의 값을 읽고 검사할 수 있다는 점입니다. Redis 스크립트는 [Lua 프로그래밍 언어](https://www.lua.org)로 작성됩니다.

처음에는 `eval` 메서드 사용이 다소 낯설게 느껴질 수 있지만, 기본적인 예시를 통해 쉽게 익숙해질 수 있습니다. `eval` 메서드는 몇 가지 인수를 받습니다. 우선, 첫 번째로 Lua 스크립트(문자열)를 넘깁니다. 두 번째로, 스크립트에서 사용할 키의 개수(정수)를 지정합니다. 세 번째에는 해당 키들의 이름을 나열하고, 마지막으로 스크립트 내부에서 사용해야 할 추가 인수가 있다면 함께 전달할 수 있습니다.

아래 예시에서는 첫 번째 카운터를 증가시킨 후, 해당 값이 5를 초과하면 두 번째 카운터도 증가시킵니다. 마지막으로 첫 번째 카운터의 값을 반환합니다:

```
$value = Redis::eval(<<<'LUA'
    local counter = redis.call("incr", KEYS[1])

    if counter > 5 then
        redis.call("incr", KEYS[2])
    end

    return counter
LUA, 2, 'first-counter', 'second-counter');
```

> [!WARNING]  
> Redis 스크립팅에 대한 보다 자세한 정보는 [Redis 공식 문서](https://redis.io/commands/eval)를 참고하시기 바랍니다.

<a name="pipelining-commands"></a>
### 파이프라인 명령어

여러 개의 Redis 명령어를 한 번에 실행해야 할 때가 있습니다. 이럴 때 매 명령마다 Redis 서버로 네트워크 요청을 보내는 대신, `pipeline` 메서드를 사용해 모두 한 번에 전송할 수 있습니다. 이 메서드는 Redis 인스턴스를 전달받는 클로저를 인수로 받으며, 이 인스턴스에 대해 모든 명령을 발행하면 명령어들은 순서대로 서버에 한 번에 전송되어 네트워크 이동 횟수를 줄여줍니다. 실행 순서는 발행한 순서대로 그대로 보장됩니다.

```
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

라라벨은 Redis의 `publish`와 `subscribe` 명령을 손쉽게 사용할 수 있는 인터페이스를 제공합니다. 이 명령어들을 이용하면 특정 "채널"에서 메시지를 구독하거나, 메시지를 발행할 수 있습니다. 해당 채널로는 다른 애플리케이션이나 다른 언어에서도 메시지를 발행할 수 있어, 애플리케이션과 프로세스 간의 손쉬운 통신을 구현할 수 있습니다.

먼저, `subscribe` 메서드를 사용해 채널 구독자를 설정해보겠습니다. 이 메서드는 [Artisan 명령어](/docs/11.x/artisan) 안에서 실행하는 것이 좋은데, 구독을 시작하면 프로세스가 장시간 동작하기 때문입니다:

```
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

이제 `publish` 메서드를 사용해 해당 채널에 메시지를 발행할 수 있습니다:

```
use Illuminate\Support\Facades\Redis;

Route::get('/publish', function () {
    // ...

    Redis::publish('test-channel', json_encode([
        'name' => 'Adam Wathan'
    ]));
});
```

<a name="wildcard-subscriptions"></a>
#### 와일드카드(wildcard) 구독

`psubscribe` 메서드를 사용하면 와일드카드 채널 패턴에 구독할 수 있어, 모든 채널의 메시지 혹은 특정 패턴에 해당하는 채널의 메시지를 수신할 수 있습니다. 이 경우, 콜백 함수의 두 번째 인수로 채널 이름이 전달됩니다:

```
Redis::psubscribe(['*'], function (string $message, string $channel) {
    echo $message;
});

Redis::psubscribe(['users.*'], function (string $message, string $channel) {
    echo $message;
});
```
