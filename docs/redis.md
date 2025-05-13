# Redis (Redis)

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

[Redis](https://redis.io)은 오픈 소스이며 고급 키-값(key-value) 저장소입니다. 키에 [문자열](https://redis.io/docs/data-types/strings/), [해시](https://redis.io/docs/data-types/hashes/), [리스트](https://redis.io/docs/data-types/lists/), [셋](https://redis.io/docs/data-types/sets/), [정렬된 셋](https://redis.io/docs/data-types/sorted-sets/)과 같은 다양한 데이터 구조를 저장할 수 있기 때문에, 일반적으로 데이터 구조 서버라고도 불립니다.

라라벨에서 Redis를 사용하기 전에, PECL을 이용해 [PhpRedis](https://github.com/phpredis/phpredis) PHP 확장 모듈을 설치하고 사용하는 것을 권장합니다. 이 확장 모듈은 "유저랜드" PHP 패키지에 비해 설치 과정이 다소 복잡하지만, Redis를 많이 사용하는 애플리케이션에서는 더 나은 성능을 제공할 수 있습니다. [Laravel Sail](/docs/sail)를 사용 중이라면, 이 확장 모듈은 애플리케이션의 Docker 컨테이너에 이미 설치되어 있습니다.

PhpRedis 확장 모듈을 설치할 수 없는 경우에는 Composer를 통해 `predis/predis` 패키지를 설치할 수도 있습니다. Predis는 PHP로 작성된 Redis 클라이언트이며, 별도의 확장 모듈 설치가 필요하지 않습니다.

```shell
composer require predis/predis:^2.0
```

<a name="configuration"></a>
## 설정

애플리케이션의 Redis 설정은 `config/database.php` 설정 파일에서 할 수 있습니다. 이 파일에는 애플리케이션이 사용하는 Redis 서버들을 포함하는 `redis` 배열이 있습니다.

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

설정 파일에 정의된 각 Redis 서버는 이름, 호스트, 포트가 필요합니다. 다만, Redis 연결을 나타내는 단일 URL을 지정하면 이름, 호스트, 포트 대신 URL만으로도 설정할 수 있습니다.

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
#### 연결 스킴(Scheme) 설정하기

기본적으로 Redis 클라이언트는 Redis 서버에 접속할 때 `tcp` 스킴을 사용합니다. 하지만, TLS/SSL 암호화를 사용하려면 Redis 서버의 설정 배열에 `scheme` 옵션을 추가로 지정하면 됩니다.

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

애플리케이션에서 여러 대의 Redis 서버 클러스터를 사용한다면, 설정 파일의 `redis`에 `clusters` 키를 만들어 클러스터 구성을 정의해야 합니다. 이 설정 키는 기본적으로 존재하지 않으므로, `config/database.php` 파일에 직접 추가해야 합니다.

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

기본적으로 라라벨은 `options.cluster` 설정 값이 `redis`로 지정돼 있기 때문에 네이티브 Redis 클러스터링을 사용합니다. Redis 클러스터링 기능은 장애 조치(failover)에 유연하게 대응할 수 있어서 권장되는 옵션입니다.

Predis를 사용할 때는 클라이언트 사이드 샤딩(client-side sharding)도 지원하지만, 이 방법은 장애 조치 기능이 없으므로, 기본 데이터 저장소에서 꺼낼 수 있는 임시 캐시 데이터에 주로 적합합니다.

네이티브 Redis 클러스터링 대신 클라이언트 사이드 샤딩을 사용하고 싶다면, `options.cluster` 설정 값을 삭제하면 됩니다.

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

Predis 패키지를 통해 Redis와 상호작용하고자 한다면, `REDIS_CLIENT` 환경 변수의 값을 반드시 `predis`로 지정해야 합니다.

```php
'redis' => [

    'client' => env('REDIS_CLIENT', 'predis'),

    // ...
],
```

기본 설정 외에도, Predis는 각 Redis 서버별로 추가 [연결 파라미터](https://github.com/nrk/predis/wiki/Connection-Parameters)를 지원합니다. 이 옵션들도 `config/database.php` 파일의 Redis 서버 설정에 추가할 수 있습니다.

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

기본적으로 라라벨은 Redis와 통신할 때 PhpRedis 확장 모듈을 사용합니다. 라라벨이 사용하는 Redis 클라이언트는 보통 `REDIS_CLIENT` 환경 변수 값을 반영하는 `redis.client` 설정 값으로 결정됩니다.

```php
'redis' => [

    'client' => env('REDIS_CLIENT', 'phpredis'),

    // ...
],
```

기본 옵션 외에도, PhpRedis는 다음과 같은 추가 연결 파라미터를 지원합니다: `name`, `persistent`, `persistent_id`, `prefix`, `read_timeout`, `retry_interval`, `max_retries`, `backoff_algorithm`, `backoff_base`, `backoff_cap`, `timeout`, `context` 등입니다. 이 중에 필요한 옵션을 `config/database.php` 설정 파일의 Redis 서버 설정에 추가할 수 있습니다.

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
#### Unix 소켓 연결

Redis 연결은 TCP 대신 Unix 소켓을 사용할 수도 있습니다. 같은 서버 내에서 애플리케이션과 Redis 인스턴스가 구동될 때, Unix 소켓을 사용하면 TCP 오버헤드를 줄여 성능을 향상시킬 수 있습니다. Redis를 Unix 소켓으로 사용하려면, `REDIS_HOST` 환경 변수에 Redis 소켓의 경로를, `REDIS_PORT` 환경 변수에는 `0`을 지정하면 됩니다.

```env
REDIS_HOST=/run/redis/redis.sock
REDIS_PORT=0
```

<a name="phpredis-serialization"></a>
#### PhpRedis 직렬화 및 압축

PhpRedis 확장 모듈은 여러 종류의 직렬화(serialize) 및 압축(compression) 알고리즘에 대한 설정도 지원합니다. 이런 알고리즘은 Redis 설정의 `options` 배열에서 지정할 수 있습니다.

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

현재 지원되는 직렬화 방식은 다음과 같습니다: `Redis::SERIALIZER_NONE`(기본값), `Redis::SERIALIZER_PHP`, `Redis::SERIALIZER_JSON`, `Redis::SERIALIZER_IGBINARY`, `Redis::SERIALIZER_MSGPACK`.

지원되는 압축 알고리즘은 다음과 같습니다: `Redis::COMPRESSION_NONE`(기본값), `Redis::COMPRESSION_LZF`, `Redis::COMPRESSION_ZSTD`, `Redis::COMPRESSION_LZ4`.

<a name="interacting-with-redis"></a>
## Redis와 상호작용하기

[Redis 파사드](/docs/facades)를 통해 다양한 메서드를 호출하여 Redis와 상호작용할 수 있습니다. Redis 파사드는 동적 메서드를 지원하기 때문에, 거의 모든 [Redis 명령어](https://redis.io/commands)를 파사드 메서드로 호출할 수 있으며, 이러한 명령어가 직접 Redis 서버로 전송됩니다. 예를 들어, Redis의 `GET` 명령어는 Redis 파사드의 `get` 메서드로 호출할 수 있습니다.

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

앞서 설명한 것과 같이, Redis의 명령어는 대부분 Redis 파사드에서 바로 호출할 수 있습니다. 라라벨은 매직 메서드(magic methods)를 활용해 명령어를 Redis 서버로 전달합니다. 명령어에 인수가 필요하다면 해당 인수도 함께 전달하면 됩니다.

```php
use Illuminate\Support\Facades\Redis;

Redis::set('name', 'Taylor');

$values = Redis::lrange('names', 5, 10);
```

또 다른 방법으로, `Redis` 파사드의 `command` 메서드를 사용해 명령어를 서버로 직접 전달할 수도 있습니다. 이 메서드는 첫 번째 인수로 명령어 이름을, 두 번째 인수로 값 배열을 받습니다.

```php
$values = Redis::command('lrange', ['name', 5, 10]);
```

<a name="using-multiple-redis-connections"></a>
#### 여러 Redis 연결 사용하기

`config/database.php` 설정 파일에서 여러 개의 Redis 연결/서버를 정의할 수 있습니다. Redis 파사드의 `connection` 메서드를 사용해 특정 Redis 연결에 접근할 수 있습니다.

```php
$redis = Redis::connection('connection-name');
```

기본 Redis 연결 인스턴스를 얻으려면 추가 인수 없이 `connection` 메서드를 호출하면 됩니다.

```php
$redis = Redis::connection();
```

<a name="transactions"></a>
### 트랜잭션

Redis 파사드의 `transaction` 메서드는 Redis의 `MULTI`, `EXEC` 명령어를 손쉽게 래핑(wrapping)하여 사용할 수 있게 해줍니다. `transaction` 메서드는 클로저(익명 함수)를 인수로 받으며, 이 클로저는 Redis 연결 인스턴스를 인수로 받아 사용할 수 있습니다. 클로저 안에서 실행하는 모든 Redis 명령어는 하나의 원자적(atomic) 트랜잭션으로 실행됩니다.

```php
use Redis;
use Illuminate\Support\Facades;

Facades\Redis::transaction(function (Redis $redis) {
    $redis->incr('user_visits', 1);
    $redis->incr('total_visits', 1);
});
```

> [!WARNING]
> Redis 트랜잭션을 정의할 때는, 트랜잭션 안에서 값을 조회(get)하는 작업을 할 수 없습니다. 트랜잭션은 하나의 원자적(atomic) 연산으로서, 클로저 내부 명령 실행이 모두 끝나야 실제로 실행됩니다.

#### Lua 스크립트

`eval` 메서드를 사용하면 여러 개의 Redis 명령어를 하나의 원자적 연산으로 실행할 수 있습니다. `eval` 메서드는 그 과정에서 Redis 키의 값을 직접 조회하거나 변경할 수도 있다는 점이 특징입니다. 이때 사용하는 Redis 스크립트는 [Lua 프로그래밍 언어](https://www.lua.org)로 작성합니다.

`eval` 메서드는 약간 복잡하게 느껴질 수 있지만, 기본적인 예시를 통해 알아보겠습니다. 먼저, 첫 번째 인수로는 Lua 스크립트(문자열)를 전달합니다. 두 번째로, 이 스크립트가 사용하는 키의 개수(정수)를 넘깁니다. 세 번째로는 그 키들의 이름을 전달합니다. 마지막으로, 스크립트 내부에서 사용할 추가 인수도 넘길 수 있습니다.

아래 예시에서는, 첫 번째 카운터를 증가시키고, 그 값이 5보다 크면 두 번째 카운터도 증가시킨 뒤, 첫 번째 카운터의 값을 반환합니다.

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
> Redis 스크립트에 대한 더 자세한 내용은 [Redis 문서](https://redis.io/commands/eval)를 참고하세요.

<a name="pipelining-commands"></a>
### 파이프라이닝 명령어

많은 수의 Redis 명령어를 한 번에 실행해야 할 때, 각 명령마다 서버에 네트워크 요청을 보내지 않고, `pipeline` 메서드를 사용할 수 있습니다. `pipeline` 메서드는 Redis 인스턴스를 인수로 받는 클로저를 인수로 갖습니다. 이 클로저 안에 여러 명령어를 작성하면, 이 모든 명령어가 한 번에 Redis 서버로 전송되어 네트워크 왕복 횟수를 최소화할 수 있습니다. 명령어 실행 순서는 작성한 순서와 동일하게 보장됩니다.

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

라라벨은 Redis의 `publish`, `subscribe` 명령어를 쉽게 사용할 수 있는 인터페이스를 제공합니다. 이 명령어들은 특정 "채널"에서 메시지를 수신하거나("구독") 메시지를 전송("발행")할 때 사용할 수 있습니다. 다른 애플리케이션이나 다른 언어로 작성된 서비스에서도 채널에 메시지를 발행할 수 있기 때문에, 여러 애플리케이션/프로세스 간의 간편한 통신이 가능합니다.

먼저, `subscribe` 메서드를 사용해 채널 리스너를 설정해보겠습니다. `subscribe` 메서드는 실행 후 오랫동안 실행되는 프로세스이기 때문에, 보통 [Artisan 명령어](/docs/artisan)에서 사용합니다.

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

이제 `publish` 메서드를 사용해 채널로 메시지를 발행할 수도 있습니다.

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

`psubscribe` 메서드를 이용하면 와일드카드 채널을 구독할 수 있습니다. 이를 사용하면 모든 채널의 메시지를 감지하거나 특정 패턴을 가진 여러 채널의 메시지를 한 번에 처리할 수 있습니다. 이때, 채널 이름은 클로저의 두 번째 인수로 전달됩니다.

```php
Redis::psubscribe(['*'], function (string $message, string $channel) {
    echo $message;
});

Redis::psubscribe(['users.*'], function (string $message, string $channel) {
    echo $message;
});
```
