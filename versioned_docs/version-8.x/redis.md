# 레디스 (Redis)

- [소개](#introduction)
- [설정](#configuration)
    - [클러스터](#clusters)
    - [Predis](#predis)
    - [phpredis](#phpredis)
- [Redis와 상호작용하기](#interacting-with-redis)
    - [트랜잭션](#transactions)
    - [파이프라인 명령어 실행](#pipelining-commands)
- [Pub / Sub](#pubsub)

<a name="introduction"></a>
## 소개

[Redis](https://redis.io)는 오픈 소스 고급 키-값 저장소입니다. Redis는 물론 키-값 저장 방식이지만, 각 키 안에 [문자열](https://redis.io/topics/data-types#strings), [해시](https://redis.io/topics/data-types#hashes), [리스트](https://redis.io/topics/data-types#lists), [셋](https://redis.io/topics/data-types#sets), [정렬된 셋](https://redis.io/topics/data-types#sorted-sets) 등 다양한 데이터 구조를 저장할 수 있어 종종 데이터 구조 서버라고도 불립니다.

라라벨에서 Redis를 사용하기 전에, [phpredis](https://github.com/phpredis/phpredis) PHP 확장 모듈을 PECL을 통해 설치해 사용하는 것을 권장합니다. phpredis 확장은 "user-land" PHP 패키지들과 비교할 때 설치가 조금 더 복잡할 수 있지만, Redis를 많이 사용하는 애플리케이션의 경우 더 나은 성능을 기대할 수 있습니다. [Laravel Sail](/docs/8.x/sail)을 사용 중이라면, 이 확장은 이미 애플리케이션의 Docker 컨테이너에 설치되어 있습니다.

phpredis 확장 설치가 불가능하다면, Composer를 통해 `predis/predis` 패키지를 설치해 사용할 수 있습니다. Predis는 PHP로만 작성된 Redis 클라이언트로, 별도의 PHP 확장 없이 사용할 수 있습니다:

```bash
composer require predis/predis
```

<a name="configuration"></a>
## 설정

애플리케이션의 Redis 설정은 `config/database.php` 파일에서 할 수 있습니다. 이 파일 안에는 애플리케이션에서 사용하는 Redis 서버를 정의하는 `redis` 배열이 포함되어 있습니다:

```
'redis' => [

    'client' => env('REDIS_CLIENT', 'phpredis'),

    'default' => [
        'host' => env('REDIS_HOST', '127.0.0.1'),
        'password' => env('REDIS_PASSWORD', null),
        'port' => env('REDIS_PORT', 6379),
        'database' => env('REDIS_DB', 0),
    ],

    'cache' => [
        'host' => env('REDIS_HOST', '127.0.0.1'),
        'password' => env('REDIS_PASSWORD', null),
        'port' => env('REDIS_PORT', 6379),
        'database' => env('REDIS_CACHE_DB', 1),
    ],

],
```

설정 파일에 정의된 각 Redis 서버는 반드시 이름, 호스트, 포트 정보를 가져야 하며, 또는 Redis 커넥션을 나타내는 단일 URL을 지정할 수도 있습니다:

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
#### 커넥션 스킴 설정

기본적으로 Redis 클라이언트는 Redis 서버에 연결할 때 `tcp` 스킴을 사용합니다. 하지만 `scheme` 설정 옵션을 Redis 서버 설정 배열에 지정하여 TLS / SSL 암호화를 사용할 수 있습니다:

```
'redis' => [

    'client' => env('REDIS_CLIENT', 'phpredis'),

    'default' => [
        'scheme' => 'tls',
        'host' => env('REDIS_HOST', '127.0.0.1'),
        'password' => env('REDIS_PASSWORD', null),
        'port' => env('REDIS_PORT', 6379),
        'database' => env('REDIS_DB', 0),
    ],

],
```

<a name="clusters"></a>
### 클러스터

애플리케이션에서 여러 대의 Redis 서버 클러스터를 사용할 경우, Redis 설정의 `clusters` 키에 이 서버들을 정의해야 합니다. 이 설정 키는 기본적으로 존재하지 않으므로, 애플리케이션의 `config/database.php` 파일에 직접 추가해야 합니다:

```
'redis' => [

    'client' => env('REDIS_CLIENT', 'phpredis'),

    'clusters' => [
        'default' => [
            [
                'host' => env('REDIS_HOST', 'localhost'),
                'password' => env('REDIS_PASSWORD', null),
                'port' => env('REDIS_PORT', 6379),
                'database' => 0,
            ],
        ],
    ],

],
```

기본적으로 클러스터 기능은 클라이언트 측 샤딩(client-side sharding)을 사용하여 여러 노드에 데이터를 분산 저장하며, 이를 통해 대용량 RAM 자원을 활용할 수 있습니다. 단, 클라이언트 샤딩 방식은 장애 조치(failover)를 지원하지 않으므로, 주로 다른 주요 데이터 저장소에서 읽어올 수 있는 캐시 데이터에 적합합니다.

클라이언트 샤딩 대신 Redis의 기본 클러스터링 기능을 사용하려면, `config/database.php` 파일의 `options.cluster` 값에 `redis`를 설정하세요:

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

Predis 패키지를 사용해 Redis와 상호작용하고 싶다면, `REDIS_CLIENT` 환경 변수 값을 `predis`로 설정해야 합니다:

```
'redis' => [

    'client' => env('REDIS_CLIENT', 'predis'),

    // ...
],
```

기본적인 `host`, `port`, `database`, `password` 서버 설정 외에도 Predis는 각 Redis 서버별로 [추가 커넥션 파라미터](https://github.com/nrk/predis/wiki/Connection-Parameters)를 지원합니다. 추가 설정 옵션이 필요할 경우, 애플리케이션의 `config/database.php` 파일 Redis 서버 설정에 옵션을 추가하면 됩니다:

```
'default' => [
    'host' => env('REDIS_HOST', 'localhost'),
    'password' => env('REDIS_PASSWORD', null),
    'port' => env('REDIS_PORT', 6379),
    'database' => 0,
    'read_write_timeout' => 60,
],
```

<a name="the-redis-facade-alias"></a>
#### Redis 파사드 별칭

라라벨의 `config/app.php` 파일의 `aliases` 배열에는 프레임워크에서 등록된 모든 클래스 별칭이 정의되어 있습니다. 편의를 위해 라라벨에서 제공하는 [파사드](/docs/8.x/facades)마다 별칭이 기본 포함되어 있으나, `Redis` 별칭은 phpredis 확장에서 제공하는 `Redis` 클래스와의 충돌을 피하기 위해 비활성화되어 있습니다. Predis 클라이언트를 사용하는 경우, 이 별칭을 활성화하려면 `config/app.php` 파일에서 주석을 해제하면 됩니다.

<a name="phpredis"></a>
### phpredis

라라벨은 기본적으로 phpredis 확장을 사용해 Redis와 통신합니다. 어떤 클라이언트를 사용할지는 보통 `REDIS_CLIENT` 환경 변수 값을 반영하는 `redis.client` 설정 옵션에 의해 결정됩니다:

```
'redis' => [

    'client' => env('REDIS_CLIENT', 'phpredis'),

    // 나머지 Redis 설정...
],
```

기본적인 `scheme`, `host`, `port`, `database`, `password` 외에, phpredis는 `name`, `persistent`, `persistent_id`, `prefix`, `read_timeout`, `retry_interval`, `timeout`, `context` 등의 추가 커넥션 파라미터도 지원합니다. 이 옵션들은 `config/database.php` 파일에 아래와 같이 추가할 수 있습니다:

```
'default' => [
    'host' => env('REDIS_HOST', 'localhost'),
    'password' => env('REDIS_PASSWORD', null),
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
#### phpredis 직렬화 & 압축

phpredis 확장은 다양한 직렬화(Serialization) 및 압축(Compression) 알고리즘을 설정할 수 있습니다. 이 알고리즘들은 Redis 설정의 `options` 배열에서 지정할 수 있습니다:

```
use Redis;

'redis' => [

    'client' => env('REDIS_CLIENT', 'phpredis'),

    'options' => [
        'serializer' => Redis::SERIALIZER_MSGPACK,
        'compression' => Redis::COMPRESSION_LZ4,
    ],

    // 나머지 Redis 설정...
],
```

현재 지원하는 직렬화 알고리즘은 다음과 같습니다: `Redis::SERIALIZER_NONE`(기본값), `Redis::SERIALIZER_PHP`, `Redis::SERIALIZER_JSON`, `Redis::SERIALIZER_IGBINARY`, `Redis::SERIALIZER_MSGPACK`.

지원되는 압축 알고리즘: `Redis::COMPRESSION_NONE`(기본값), `Redis::COMPRESSION_LZF`, `Redis::COMPRESSION_ZSTD`, `Redis::COMPRESSION_LZ4` 등이 있습니다.

<a name="interacting-with-redis"></a>
## Redis와 상호작용하기

`Redis` [파사드](/docs/8.x/facades)를 통해 다양한 방식으로 Redis와 상호작용할 수 있습니다. `Redis` 파사드는 동적으로 메서드를 지원하므로, [Redis 명령어](https://redis.io/commands)라면 어떤 것이든 파사드를 통해 직접 실행할 수 있습니다. 아래 예시에서는 Redis의 `GET` 명령 대신 `Redis` 파사드의 `get` 메서드를 호출하는 방식을 보여줍니다:

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Redis;

class UserController extends Controller
{
    /**
     * Show the profile for the given user.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return view('user.profile', [
            'user' => Redis::get('user:profile:'.$id)
        ]);
    }
}
```

앞서 설명한 대로, `Redis` 파사드에서는 Redis의 어떤 명령어든 호출할 수 있습니다. 라라벨은 매직 메서드를 이용해 명령어를 자동으로 Redis 서버에 전달해줍니다. Redis 명령어가 인수(Arguments)를 필요로 한다면, 해당 인수를 파사드의 대응 메서드에 직접 전달하면 됩니다:

```
use Illuminate\Support\Facades\Redis;

Redis::set('name', 'Taylor');

$values = Redis::lrange('names', 5, 10);
```

또한, 파사드의 `command` 메서드를 사용하면 명령어 이름을 첫 번째 인수로, 값들을 배열로 두 번째 인수에 전달하는 방식도 있습니다:

```
$values = Redis::command('lrange', ['name', 5, 10]);
```

<a name="using-multiple-redis-connections"></a>
#### 여러 Redis 커넥션 사용하기

애플리케이션의 `config/database.php` 파일에서 다양한 Redis 커넥션(서버)들을 정의할 수 있습니다. 특정 Redis 커넥션에 연결하려면 `Redis` 파사드의 `connection` 메서드를 사용합니다:

```
$redis = Redis::connection('connection-name');
```

기본 Redis 커넥션 인스턴스를 얻으려면 추가 인수 없이 `connection` 메서드를 호출하세요:

```
$redis = Redis::connection();
```

<a name="transactions"></a>
### 트랜잭션

`Redis` 파사드의 `transaction` 메서드는 Redis의 기본 `MULTI` 및 `EXEC` 명령어를 쉽게 다룰 수 있도록 래핑해줍니다. `transaction` 메서드에는 하나의 클로저(익명 함수)를 인수로 전달하며, 이 클로저는 Redis 커넥션 인스턴스를 받아 원하는 명령어를 자유롭게 호출할 수 있습니다. 클로저 내부에서 실행된 모든 Redis 명령어는 하나의 원자적 트랜잭션으로 실행됩니다:

```
use Illuminate\Support\Facades\Redis;

Redis::transaction(function ($redis) {
    $redis->incr('user_visits', 1);
    $redis->incr('total_visits', 1);
});
```

> [!NOTE]
> Redis 트랜잭션을 정의할 때, 트랜잭션 중에는 Redis 커넥션에서 값을 조회할 수 없습니다. 트랜잭션은 완전히 하나의 원자적 연산으로 처리되며, 클로저 내부 명령이 모두 실행된 후에야 적용됩니다.

#### Lua 스크립트

여러 Redis 명령어를 원자적으로 실행하는 또 다른 방법으로는 `eval` 메서드를 사용하는 것이 있습니다. `eval` 메서드는 실행 중에 Redis 키 값을 조회하거나 수정하는 등 유연한 처리가 가능하다는 이점이 있습니다. Redis 스크립트는 [Lua 프로그래밍 언어](https://www.lua.org)로 작성합니다.

`eval` 메서드는 다소 복잡해 보일 수 있지만, 간단한 예제로 살펴보면 어렵지 않습니다. 이 메서드는 여러 인수를 요구합니다. 첫 번째로는 Lua 스크립트(문자열), 두 번째로는 스크립트에서 사용하는 키의 수(정수), 세 번째로는 키 이름들, 그리고 마지막으로 스크립트 내부에서 액세스할 추가 인수들을 전달할 수 있습니다.

아래 예시는 첫 번째 카운터를 증가시키고, 새 값을 확인한 후 만약 그 값이 5보다 크면 두 번째 카운터도 증가시킵니다. 마지막에는 첫 번째 카운터의 값을 반환합니다:

```
$value = Redis::eval(<<<'LUA'
    local counter = redis.call("incr", KEYS[1])

    if counter > 5 then
        redis.call("incr", KEYS[2])
    end

    return counter
LUA, 2, 'first-counter', 'second-counter');
```

> [!NOTE]
> Redis 스크립팅에 대해 더 자세히 알고 싶다면 [Redis 공식 문서](https://redis.io/commands/eval)를 참고하세요.

<a name="pipelining-commands"></a>
### 파이프라인 명령어 실행

여러 개의 Redis 명령어를 한 번에 실행해야 할 때가 있습니다. 이때 각 명령어마다 서버와 통신하는 대신, `pipeline` 메서드를 사용하면 한 번에 여러 명령을 전송해 성능을 높일 수 있습니다. `pipeline` 메서드는 하나의 클로저를 받으며, 이 클로저 내에서 모든 명령어를 발행하면 해당 명령어들이 서버로 한 번에 전송되어 통신 횟수가 줄어듭니다. 명령어는 요청한 순서대로 실행됩니다:

```
use Illuminate\Support\Facades\Redis;

Redis::pipeline(function ($pipe) {
    for ($i = 0; $i < 1000; $i++) {
        $pipe->set("key:$i", $i);
    }
});
```

<a name="pubsub"></a>
## Pub / Sub

라라벨은 Redis의 `publish`와 `subscribe` 명령어를 편리하게 사용할 수 있도록 기능을 제공합니다. 이 명령어들은 특정 "채널"에서 메시지를 수신할 수 있게 해주며, 다른 애플리케이션이나 다른 프로그래밍 언어를 통해 해당 채널로 메시지를 전송할 수도 있어 여러 애플리케이션, 프로세스 간의 손쉬운 통신이 가능합니다.

먼저 `subscribe` 메서드를 통해 채널 리스너(listener)를 설정해보겠습니다. 이 메서드는 장시간 실행되는 프로세스이므로, [Artisan 명령어](/docs/8.x/artisan) 안에 배치하는 것이 좋습니다:

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
     *
     * @return mixed
     */
    public function handle()
    {
        Redis::subscribe(['test-channel'], function ($message) {
            echo $message;
        });
    }
}
```

이제 `publish` 메서드를 이용해 채널에 메시지를 보낼 수 있습니다:

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
#### 와일드카드 구독

`psubscribe` 메서드를 사용하면 와일드카드 채널에도 구독할 수 있습니다. 이 기능은 모든 채널의 메시지를 받고 싶을 때 유용합니다. 구독된 채널 이름은 클로저의 두 번째 인수로 전달됩니다:

```
Redis::psubscribe(['*'], function ($message, $channel) {
    echo $message;
});

Redis::psubscribe(['users.*'], function ($message, $channel) {
    echo $message;
});
```
