# Redis (Redis)

- [소개](#introduction)
- [설정](#configuration)
    - [클러스터](#clusters)
    - [Predis](#predis)
    - [PhpRedis](#phpredis)
- [Redis와 상호작용하기](#interacting-with-redis)
    - [트랜잭션](#transactions)
    - [명령어 파이프라인 처리](#pipelining-commands)
- [Pub / Sub](#pubsub)

<a name="introduction"></a>
## 소개

[Redis](https://redis.io)는 오픈 소스의 고급 키-값 저장소입니다. 키에는 [문자열](https://redis.io/docs/data-types/strings/), [해시](https://redis.io/docs/data-types/hashes/), [리스트](https://redis.io/docs/data-types/lists/), [집합](https://redis.io/docs/data-types/sets/), [정렬된 집합](https://redis.io/docs/data-types/sorted-sets/) 등 다양한 형태의 데이터 구조를 저장할 수 있기 때문에, 종종 데이터 구조 서버라고도 불립니다.

라라벨에서 Redis를 사용하기 전에, PECL을 통해 [PhpRedis](https://github.com/phpredis/phpredis) PHP 확장 모듈을 설치하고 사용하는 것을 권장합니다. 이 확장 모듈은 "유저랜드" PHP 패키지보다 설치가 다소 복잡할 수 있지만, Redis를 많이 사용하는 애플리케이션의 경우 더 나은 성능을 기대할 수 있습니다. [Laravel Sail](/docs/10.x/sail)을 사용하는 경우, 해당 확장 모듈은 이미 애플리케이션의 Docker 컨테이너에 설치되어 있습니다.

PhpRedis 확장 모듈을 설치할 수 없는 경우, Composer를 통해 `predis/predis` 패키지를 설치해 사용할 수 있습니다. Predis는 PHP로만 작성된 Redis 클라이언트이며 추가 확장 모듈 없이 사용 가능합니다.

```shell
composer require predis/predis
```

<a name="configuration"></a>
## 설정

애플리케이션의 Redis 설정은 `config/database.php` 설정 파일에서 할 수 있습니다. 이 파일 안에는 애플리케이션에서 사용하는 Redis 서버들을 담고 있는 `redis` 배열이 있습니다.

```
'redis' => [

    'client' => env('REDIS_CLIENT', 'phpredis'),

    'default' => [
        'host' => env('REDIS_HOST', '127.0.0.1'),
        'password' => env('REDIS_PASSWORD'),
        'port' => env('REDIS_PORT', 6379),
        'database' => env('REDIS_DB', 0),
    ],

    'cache' => [
        'host' => env('REDIS_HOST', '127.0.0.1'),
        'password' => env('REDIS_PASSWORD'),
        'port' => env('REDIS_PORT', 6379),
        'database' => env('REDIS_CACHE_DB', 1),
    ],

],
```

설정 파일에 정의된 각 Redis 서버는 이름, 호스트(host), 포트(port)를 반드시 지정해야 합니다. 단, 하나의 URL로 Redis 연결을 표현하면 이름, 호스트, 포트 대신 사용할 수 있습니다.

```
'redis' => [

    'client' => env('REDIS_CLIENT', 'phpredis'),

    'default' => [
        'url' => 'tcp://127.0.0.1:6379?database=0',
    ],

    'cache' => [
        'url' => 'tls://user:password@127.0.0.1:6380?database=1',
    ],

],
```

<a name="configuring-the-connection-scheme"></a>
#### 연결 방식(scheme) 설정하기

기본적으로 Redis 클라이언트는 Redis 서버에 연결할 때 `tcp` 방식을 사용합니다. 그러나 Redis 서버 설정 배열에 `scheme` 옵션을 지정하면 TLS / SSL 암호화를 사용할 수 있습니다.

```
'redis' => [

    'client' => env('REDIS_CLIENT', 'phpredis'),

    'default' => [
        'scheme' => 'tls',
        'host' => env('REDIS_HOST', '127.0.0.1'),
        'password' => env('REDIS_PASSWORD'),
        'port' => env('REDIS_PORT', 6379),
        'database' => env('REDIS_DB', 0),
    ],

],
```

<a name="clusters"></a>
### 클러스터

애플리케이션에서 여러 Redis 서버로 구성된 클러스터를 사용하는 경우, Redis 설정에서 `clusters` 키를 만들어 해당 클러스터를 정의해야 합니다. 이 설정 키는 기본적으로 존재하지 않으므로, 애플리케이션의 `config/database.php` 파일에 직접 추가해야 합니다.

```
'redis' => [

    'client' => env('REDIS_CLIENT', 'phpredis'),

    'clusters' => [
        'default' => [
            [
                'host' => env('REDIS_HOST', 'localhost'),
                'password' => env('REDIS_PASSWORD'),
                'port' => env('REDIS_PORT', 6379),
                'database' => 0,
            ],
        ],
    ],

],
```

기본적으로 클러스터는 노드들 간에 클라이언트 측 샤딩을 수행하여 여러 노드에 데이터를 분산 저장하고, 더 많은 RAM을 사용할 수 있게 해줍니다. 다만, 클라이언트 측 샤딩은 장애 조치(failover)를 지원하지 않으므로, 주로 다른 주요 데이터 저장소에서 가져올 수 있는 임시(캐시용) 데이터에 적합합니다.

클라이언트 측 샤딩 대신 Redis의 네이티브 클러스터링을 사용하고 싶다면, `options.cluster` 설정 값을 `redis`로 지정하면 됩니다. 이 설정은 애플리케이션의 `config/database.php` 파일에서 할 수 있습니다.

```
'redis' => [

    'client' => env('REDIS_CLIENT', 'phpredis'),

    'options' => [
        'cluster' => env('REDIS_CLUSTER', 'redis'),
    ],

    'clusters' => [
        // ...
    ],

],
```

<a name="predis"></a>
### Predis

Predis 패키지를 통해 Redis와 상호작용하고 싶다면, `REDIS_CLIENT` 환경 변수의 값을 `predis`로 설정해야 합니다.

```
'redis' => [

    'client' => env('REDIS_CLIENT', 'predis'),

    // ...
],
```

기본적인 `host`, `port`, `database`, `password` 외에, Predis는 각 Redis 서버별로 추가적인 [연결 매개변수](https://github.com/nrk/predis/wiki/Connection-Parameters)도 지원합니다. 이러한 설정이 필요하다면, `config/database.php`의 Redis 서버 설정에 옵션을 추가하면 됩니다.

```
'default' => [
    'host' => env('REDIS_HOST', 'localhost'),
    'password' => env('REDIS_PASSWORD'),
    'port' => env('REDIS_PORT', 6379),
    'database' => 0,
    'read_write_timeout' => 60,
],
```

<a name="the-redis-facade-alias"></a>
#### Redis 파사드 별칭(Alias) 설정

라라벨의 `config/app.php` 파일에는 프레임워크에서 등록할 클래스 별칭들을 정의하는 `aliases` 배열이 있습니다. 기본적으로 PhpRedis 확장 모듈의 `Redis` 클래스와 충돌할 수 있기 때문에 `Redis` 별칭은 포함되어 있지 않습니다. 만약 Predis 클라이언트를 사용 중이며, `Redis` 별칭을 추가하고 싶다면, 다음과 같이 `config/app.php`의 `aliases` 배열에 추가할 수 있습니다.

```
'aliases' => Facade::defaultAliases()->merge([
    'Redis' => Illuminate\Support\Facades\Redis::class,
])->toArray(),
```

<a name="phpredis"></a>
### PhpRedis

기본적으로 라라벨은 Redis와의 통신에 PhpRedis 확장 모듈을 사용합니다. 라라벨이 사용할 Redis 클라이언트는 `redis.client` 설정값에 의해 결정되며, 보통 `REDIS_CLIENT` 환경 변수 값을 따릅니다.

```
'redis' => [

    'client' => env('REDIS_CLIENT', 'phpredis'),

    // 나머지 Redis 설정...
],
```

기본적인 `scheme`, `host`, `port`, `database`, `password` 외에도, PhpRedis는 다음과 같은 추가 연결 파라미터를 지원합니다: `name`, `persistent`, `persistent_id`, `prefix`, `read_timeout`, `retry_interval`, `timeout`, `context`. 이 중 필요한 옵션을 `config/database.php`의 Redis 서버 설정에 추가해 사용할 수 있습니다.

```
'default' => [
    'host' => env('REDIS_HOST', 'localhost'),
    'password' => env('REDIS_PASSWORD'),
    'port' => env('REDIS_PORT', 6379),
    'database' => 0,
    'read_timeout' => 60,
    'context' => [
        // 'auth' => ['username', 'secret'],
        // 'stream' => ['verify_peer' => false],
    ],
],
```

<a name="phpredis-serialization"></a>
#### PhpRedis 직렬화 및 압축 설정

PhpRedis 확장 모듈은 다양한 직렬화(serializer) 및 압축 알고리즘을 사용할 수 있습니다. 이러한 옵션은 Redis 설정의 `options` 배열에서 지정할 수 있습니다.

```
'redis' => [

    'client' => env('REDIS_CLIENT', 'phpredis'),

    'options' => [
        'serializer' => Redis::SERIALIZER_MSGPACK,
        'compression' => Redis::COMPRESSION_LZ4,
    ],

    // 나머지 Redis 설정...
],
```

지원되는 직렬화 방식은 다음과 같습니다: `Redis::SERIALIZER_NONE`(기본값), `Redis::SERIALIZER_PHP`, `Redis::SERIALIZER_JSON`, `Redis::SERIALIZER_IGBINARY`, `Redis::SERIALIZER_MSGPACK`.

지원되는 압축 알고리즘은 다음과 같습니다: `Redis::COMPRESSION_NONE`(기본값), `Redis::COMPRESSION_LZF`, `Redis::COMPRESSION_ZSTD`, `Redis::COMPRESSION_LZ4`.

<a name="interacting-with-redis"></a>
## Redis와 상호작용하기

`Redis` [파사드](/docs/10.x/facades)를 통해 Redis와 상호작용할 수 있습니다. `Redis` 파사드는 동적(매직) 메서드를 지원하므로, [Redis의 모든 명령어](https://redis.io/commands)를 파사드를 통해 호출하면 해당 명령이 Redis로 그대로 전달됩니다. 아래 예시는 `Redis` 파사드의 `get` 메서드를 호출하여 Redis의 `GET` 명령을 사용하는 방법입니다.

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

위에서 설명했듯이, Redis 파사드에서는 Redis의 모든 명령어를 호출할 수 있습니다. 라라벨은 매직 메서드를 활용해 각 명령을 Redis 서버로 전달합니다. 만약 Redis 명령어가 인수를 필요로 한다면, 해당 메서드의 인수로 값을 넘겨주면 됩니다.

```
use Illuminate\Support\Facades\Redis;

Redis::set('name', 'Taylor');

$values = Redis::lrange('names', 5, 10);
```

또는, `Redis` 파사드의 `command` 메서드를 사용하여 명령어를 전달할 수도 있습니다. 이 메서드는 첫 번째 인수로 명령어 이름, 두 번째 인수로 값의 배열을 받습니다.

```
$values = Redis::command('lrange', ['name', 5, 10]);
```

<a name="using-multiple-redis-connections"></a>
#### 여러 Redis 연결 사용하기

애플리케이션의 `config/database.php` 파일에서는 여러 개의 Redis 연결(서버)을 정의할 수 있습니다. 특정 Redis 연결을 사용하려면, `Redis` 파사드의 `connection` 메서드를 이용하면 됩니다.

```
$redis = Redis::connection('connection-name');
```

기본 Redis 연결 인스턴스를 얻으려면, 추가 인수 없이 `connection` 메서드를 호출하면 됩니다.

```
$redis = Redis::connection();
```

<a name="transactions"></a>
### 트랜잭션

`Redis` 파사드의 `transaction` 메서드는 Redis의 `MULTI` 및 `EXEC` 명령을 간편하게 사용할 수 있는 래퍼(wrapper) 기능을 제공합니다. 이 메서드는 클로저를 인수로 받으며, 클로저는 Redis 연결 인스턴스를 전달받아 여러 명령어를 호출할 수 있습니다. 클로저 내부에서 실행된 모든 명령어는 하나의 원자적 트랜잭션으로 실행됩니다.

```
use Redis;
use Illuminate\Support\Facades;

Facades\Redis::transaction(function (Redis $redis) {
    $redis->incr('user_visits', 1);
    $redis->incr('total_visits', 1);
});
```

> [!WARNING]
> Redis 트랜잭션을 정의할 때는 트랜잭션 내에서 Redis로부터 값을 조회할 수 없습니다. 트랜잭션은 원자적으로 수행되는 단일 작업이며, 클로저 내부의 모든 명령이 실행된 후에 한 번에 처리됩니다.

#### Lua 스크립트

`eval` 메서드는 여러 Redis 명령을 한 번에, 원자적으로 실행할 수 있는 또 다른 방법을 제공합니다. 특히, `eval` 메서드를 사용하면 명령 실행 중에 Redis 키 값을 읽거나 조작할 수 있습니다. Redis 스크립트는 [Lua 프로그래밍 언어](https://www.lua.org)로 작성됩니다.

`eval` 메서드는 처음에는 다소 어려워 보일 수 있지만, 기본 예시를 통해 쉽게 접근할 수 있습니다. 이 메서드는 여러 인수를 받습니다. 첫 번째 인수로는 Lua 스크립트(문자열), 두 번째로는 스크립트가 접근할 키의 개수(정수), 그 다음은 해당 키의 이름들을 전달해야 합니다. 추가로 스크립트 내부에서 사용할 기타 인수도 넘길 수 있습니다.

아래 예시에서는 첫 번째 카운터를 증가시키고, 그 값이 5보다 크면 두 번째 카운터도 증가시키고, 마지막에 첫 번째 카운터 값을 반환합니다.

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
> Redis 스크립팅에 대한 자세한 내용은 [Redis 공식 문서](https://redis.io/commands/eval)에서 확인하실 수 있습니다.

<a name="pipelining-commands"></a>
### 명령어 파이프라인 처리

여러 개의 Redis 명령을 한 번에 전송해야 할 때는, 각각의 명령마다 Redis 서버와 통신하지 않고 `pipeline` 메서드를 이용해 효율적으로 처리할 수 있습니다. `pipeline` 메서드는 클로저를 인수로 받으며, 클로저 안에서 Redis 인스턴스를 사용해 여러 명령어를 호출할 수 있습니다. 이 명령들은 네트워크를 한 번만 거쳐 Redis 서버에 전달되고, 명령이 실행되는 순서도 보장됩니다.

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

라라벨은 Redis의 `publish`와 `subscribe` 명령을 간편하게 사용할 수 있는 인터페이스를 제공합니다. 이를 통해 특정 "채널"에서 메시지를 구독(listen)하거나, 메시지를 발행(publish)할 수 있습니다. 이를 활용해 다른 애플리케이션이나 타 프로그래밍 언어와도 손쉽게 통신이 가능합니다.

먼저, `subscribe` 메서드를 이용해 채널 리스너를 설정해봅니다. `subscribe`는 장시간 실행되는 프로세스이므로, [Artisan 명령어](/docs/10.x/artisan) 안에 구현하는 것이 일반적입니다.

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

이제, `publish` 메서드를 통해 해당 채널에 메시지를 보낼 수 있습니다.

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
#### 와일드카드 구독 활용

`psubscribe` 메서드를 사용하면 와일드카드가 포함된 채널에도 구독할 수 있습니다. 이 방법은 모든 채널의 메시지를 한 번에 수신해야 할 때 유용합니다. 채널 이름은 클로저의 두 번째 인수로 전달됩니다.

```
Redis::psubscribe(['*'], function (string $message, string $channel) {
    echo $message;
});

Redis::psubscribe(['users.*'], function (string $message, string $channel) {
    echo $message;
});
```
