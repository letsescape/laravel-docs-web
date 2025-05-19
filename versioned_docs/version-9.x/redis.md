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

[Redis](https://redis.io)는 오픈 소스의 고급 키-값 저장소입니다. 키에 [문자열(string)](https://redis.io/topics/data-types#strings), [해시(hashes)](https://redis.io/topics/data-types#hashes), [리스트(lists)](https://redis.io/topics/data-types#lists), [셋(sets)](https://redis.io/topics/data-types#sets), [정렬된 셋(sorted sets)](https://redis.io/topics/data-types#sorted-sets) 등 다양한 데이터 구조를 저장할 수 있어서 종종 데이터 구조 서버라고도 불립니다.

라라벨에서 Redis를 사용하려면 [phpredis](https://github.com/phpredis/phpredis) PHP 확장 프로그램을 PECL을 통해 설치해서 사용하는 것을 권장합니다. 이 확장 프로그램은 일반 사용자용 PHP 패키지에 비해 설치가 다소 복잡하지만, Redis를 많이 활용하는 애플리케이션에서는 더 나은 성능을 기대할 수 있습니다. 만약 [Laravel Sail](/docs/9.x/sail)을 사용한다면, 해당 확장 프로그램이 이미 애플리케이션의 Docker 컨테이너에 설치되어 있습니다.

phpredis 확장 프로그램을 설치할 수 없는 경우, Composer를 통해 `predis/predis` 패키지를 설치하여 사용할 수 있습니다. Predis는 PHP로만 작성된 Redis 클라이언트로, 별도의 추가 확장 프로그램이 필요하지 않습니다:

```shell
composer require predis/predis
```

<a name="configuration"></a>
## 설정

애플리케이션의 Redis 설정은 `config/database.php` 설정 파일에서 관리할 수 있습니다. 이 파일에는 애플리케이션에서 사용할 Redis 서버 정보를 담고 있는 `redis` 배열이 있습니다:

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

설정 파일에서 정의하는 각 Redis 서버에는 이름, 호스트, 포트 정보가 필요합니다. 대신, Redis 연결을 하나의 URL로 표현하고자 할 때는 해당 정보를 명시하지 않아도 됩니다:

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

기본적으로 Redis 클라이언트는 Redis 서버와 연결할 때 `tcp` 방식을 사용합니다. 하지만, `scheme` 설정 옵션을 지정해서 TLS/SSL 암호화 연결도 사용할 수 있습니다. 이 옵션은 각 Redis 서버의 설정 배열에 포함시킵니다:

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

애플리케이션에서 여러 대의 Redis 서버로 클러스터를 구성하여 사용한다면, Redis 설정에서 `clusters` 키를 작성하여 클러스터를 정의해야 합니다. 이 설정 키는 기본적으로 존재하지 않으므로, 애플리케이션의 `config/database.php` 파일 내에 직접 추가해야 합니다:

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

기본적으로 클러스터는 클라이언트-사이드 샤딩(Client-side Sharding)을 이용해서 여러 노드에 데이터를 분산 저장하여, 많은 RAM을 사용할 수 있도록 해줍니다. 그러나 클라이언트-사이드 샤딩은 장애 발생 시 자동 복구(Failover)를 지원하지 않기 때문에, 다른 주 데이터 저장소와 연동되는 임시 캐시 데이터 저장용으로 주로 사용됩니다.

클라이언트-사이드 샤딩이 아닌, Redis의 네이티브 클러스터링 기능을 사용하려면, `options.cluster` 설정 값을 `redis`로 변경해야 합니다. 이 설정도 애플리케이션의 `config/database.php` 파일에 추가해야 합니다:

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

애플리케이션에서 Predis 패키지를 이용해 Redis와 상호작용하려면, `REDIS_CLIENT` 환경 변수 값에 `predis`를 설정해야 합니다:

```
'redis' => [

    'client' => env('REDIS_CLIENT', 'predis'),

    // ...
],
```

Predis는 기본 `host`, `port`, `database`, `password` 외에도, 각 Redis 서버별로 추가적인 [연결 파라미터](https://github.com/nrk/predis/wiki/Connection-Parameters)를 지원합니다. 이 추가 설정 옵션들은 애플리케이션의 `config/database.php` 파일에서 각 Redis 서버 설정에 추가할 수 있습니다:

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
#### Redis 퍼사드(Facade) 별칭

라라벨의 `config/app.php` 설정 파일에는 프레임워크에서 등록할 클래스 별칭(alias)들이 정의된 `aliases` 배열이 있습니다. 기본적으로 `Redis` 별칭은 phpredis 확장 프로그램이 제공하는 `Redis` 클래스명과 충돌할 수 있어서 포함되어 있지 않습니다. Predis 클라이언트를 사용하고 별칭을 추가하고 싶다면, `config/app.php`의 `aliases` 배열에 아래와 같이 추가하면 됩니다:

```
'aliases' => Facade::defaultAliases()->merge([
    'Redis' => Illuminate\Support\Facades\Redis::class,
])->toArray(),
```

<a name="phpredis"></a>
### phpredis

기본적으로 라라벨은 phpredis 확장 프로그램을 통해 Redis와 통신합니다. 실제로 라라벨이 어떤 클라이언트로 Redis와 통신할지는 `redis.client` 설정 값에 따라 결정되며, 이 값은 보통 `REDIS_CLIENT` 환경 변수와 연동됩니다:

```
'redis' => [

    'client' => env('REDIS_CLIENT', 'phpredis'),

    // 나머지 Redis 설정...
],
```

phpredis는 기본 `scheme`, `host`, `port`, `database`, `password` 외에도 다음과 같은 추가 연결 파라미터를 지원합니다: `name`, `persistent`, `persistent_id`, `prefix`, `read_timeout`, `retry_interval`, `timeout`, `context`. 이 중 필요한 옵션을 `config/database.php` 설정 파일 내 Redis 서버 설정에 자유롭게 추가할 수 있습니다:

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
#### phpredis 직렬화 및 압축

phpredis 확장 프로그램은 다양한 직렬화(Serialization) 및 압축(Compression) 알고리즘을 지원하며, 이는 Redis 설정의 `options` 배열에서 지정할 수 있습니다:

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

지원되는 직렬화 알고리즘은 다음과 같습니다: `Redis::SERIALIZER_NONE`(기본값), `Redis::SERIALIZER_PHP`, `Redis::SERIALIZER_JSON`, `Redis::SERIALIZER_IGBINARY`, `Redis::SERIALIZER_MSGPACK`.

지원되는 압축 알고리즘은 다음과 같습니다: `Redis::COMPRESSION_NONE`(기본값), `Redis::COMPRESSION_LZF`, `Redis::COMPRESSION_ZSTD`, `Redis::COMPRESSION_LZ4`.

<a name="interacting-with-redis"></a>
## Redis와 상호작용하기

[퍼사드](/docs/9.x/facades)인 `Redis`를 통해 다양한 Redis 메서드를 호출하여 Redis와 직접 상호작용할 수 있습니다. `Redis` 퍼사드는 다이나믹 메서드를 지원하므로, 어떤 [Redis 명령어](https://redis.io/commands)든 그대로 퍼사드에 호출하면 해당 명령어가 Redis 서버로 전달됩니다. 아래 예시에서는 Redis의 `GET` 명령어를 `Redis` 퍼사드의 `get` 메서드로 호출하는 방법을 보여줍니다:

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

위에서 설명한 것처럼, `Redis` 퍼사드를 통해 어떤 Redis 명령어도 호출할 수 있습니다. 라라벨은 매직 메서드(magic method)를 사용해서 명령어를 Redis 서버로 전달합니다. 만약 Redis 명령어에 인수가 필요한 경우, 해당 인수들을 퍼사드의 해당 메서드에 그대로 전달하면 됩니다:

```
use Illuminate\Support\Facades\Redis;

Redis::set('name', 'Taylor');

$values = Redis::lrange('names', 5, 10);
```

또 다른 방법으로, `Redis` 퍼사드의 `command` 메서드를 활용해 서버로 명령어를 직접 전달할 수도 있습니다. 이 방법은 첫 번째 인자로 명령어 이름, 두 번째 인자로 값들의 배열을 받습니다:

```
$values = Redis::command('lrange', ['name', 5, 10]);
```

<a name="using-multiple-redis-connections"></a>
#### 여러 Redis 연결 사용하기

애플리케이션의 `config/database.php` 설정 파일에서는 여러 개의 Redis 연결(서버)을 정의할 수 있습니다. 특정 Redis 연결을 사용하려면, `Redis` 퍼사드의 `connection` 메서드를 이용하면 됩니다:

```
$redis = Redis::connection('connection-name');
```

기본 Redis 연결 인스턴스를 얻고 싶다면 인자 없이 `connection` 메서드를 호출하면 됩니다:

```
$redis = Redis::connection();
```

<a name="transactions"></a>
### 트랜잭션

`Redis` 퍼사드의 `transaction` 메서드는 Redis의 기본 `MULTI`와 `EXEC` 명령어를 래핑해서 편리하게 트랜잭션을 사용할 수 있도록 지원합니다. `transaction` 메서드는 클로저(closure)를 인자로 받는데, 이 클로저는 Redis 연결 인스턴스를 전달받으며, 이 인스턴스에 원하는 Redis 명령어를 자유롭게 사용할 수 있습니다. 클로저 내에서 실행된 모든 Redis 명령어는 하나의 원자적(atomic) 트랜잭션으로 실행됩니다.

```
use Illuminate\Support\Facades\Redis;

Redis::transaction(function ($redis) {
    $redis->incr('user_visits', 1);
    $redis->incr('total_visits', 1);
});
```

> [!WARNING]
> Redis 트랜잭션을 정의할 때는 명령어 실행 중간에 Redis로부터 값을 조회할 수 없습니다. 트랜잭션은 하나의 원자적 연산으로 처리되므로, 클로저가 모든 명령어를 실행한 뒤에야 실제로 실행됩니다.

#### Lua 스크립트

`eval` 메서드를 사용하면 여러 Redis 명령어를 하나의 원자적 작업으로 처리할 수 있는 또 다른 방법을 제공합니다. 특히, `eval` 메서드는 해당 작업 중에 Redis의 키 값을 조회하거나 조작할 수 있는 장점이 있습니다. Redis 스크립트는 [Lua 프로그래밍 언어](https://www.lua.org)로 작성합니다.

`eval` 메서드는 여러 인수를 받습니다. 먼저, 실행할 Lua 스크립트 문자열을 전달해야 합니다. 두 번째는 스크립트가 참조하는 키의 개수(정수)를 지정합니다. 세 번째로는 그 키 이름(들)을 나열합니다. 추가적으로 스크립트 내부에서 사용할 수 있는 기타 인수들도 뒤에 전달할 수 있습니다.

아래 예시는 카운터 값을 증가시키고, 그 값이 5보다 크면 두 번째 카운터를 추가로 증가시키며, 마지막으로 첫 번째 카운터 값을 반환합니다:

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
> Redis 스크립팅에 관한 더 자세한 내용은 [Redis 공식 문서](https://redis.io/commands/eval)를 참고하시기 바랍니다.

<a name="pipelining-commands"></a>
### 파이프라인 명령어 실행

한 번에 수십 개의 Redis 명령어를 실행해야 할 때, 각 명령어마다 서버에 네트워크 요청을 반복적으로 보내는 대신 `pipeline` 메서드를 사용하면 효율적으로 처리할 수 있습니다. `pipeline`은 하나의 인자(클로저)를 받으며, 이 클로저는 Redis 인스턴스를 전달받습니다. 모든 명령어는 이 인스턴스에 대해 실행되고, 명령어들은 한꺼번에 Redis 서버로 전송되어 반복적인 네트워크 왕복을 줄일 수 있습니다. 명령어는 발행된 순서대로 실행됩니다:

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

라라벨은 Redis의 `publish`와 `subscribe` 명령어를 손쉽게 사용할 수 있는 인터페이스를 제공합니다. 이 명령어들을 사용하면 특정 "채널"에서 메시지를 실시간으로 주고받을 수 있습니다. 다른 애플리케이션이나 심지어 다른 프로그래밍 언어로도 자유롭게 채널에 메시지를 발행(publish)할 수 있기 때문에, 여러 애플리케이션과 프로세스 간의 통신이 매우 쉽습니다.

먼저, `subscribe` 메서드를 활용해 채널 리스너(listener)를 설정해봅니다. `subscribe` 메서드는 프로그램이 계속 실행되는 장기 실행 프로세스이기 때문에 [Artisan 명령어](/docs/9.x/artisan) 안에 구현하는 것이 보통입니다:

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

이제 `publish` 메서드를 사용해서 해당 채널에 메시지를 발행할 수 있습니다:

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
#### 와일드카드(전체 수신) 구독

`psubscribe` 메서드를 이용하면 와일드카드 패턴을 사용해 여러 채널의 모든 메시지를 구독할 수 있습니다. 이렇게 하면 모든 채널, 혹은 특정 패턴의 채널 메시지를 한 번에 수신할 수 있습니다. 클로저에는 두 번째 인자로 채널 이름이 전달됩니다.

```
Redis::psubscribe(['*'], function ($message, $channel) {
    echo $message;
});

Redis::psubscribe(['users.*'], function ($message, $channel) {
    echo $message;
});
```
