# 큐 (Queues)

- [소개](#introduction)
    - [커넥션과 큐의 차이](#connections-vs-queues)
    - [드라이버 참고사항 및 사전 준비](#driver-prerequisites)
- [잡 생성하기](#creating-jobs)
    - [잡 클래스 생성](#generating-job-classes)
    - [클래스 구조](#class-structure)
    - [유니크 잡](#unique-jobs)
- [잡 미들웨어](#job-middleware)
    - [요청 제한(속도 제한)](#rate-limiting)
    - [잡 중복 방지](#preventing-job-overlaps)
    - [예외 처리 제한(스로틀링)](#throttling-exceptions)
- [잡 디스패치하기](#dispatching-jobs)
    - [지연 디스패치](#delayed-dispatching)
    - [동기식 디스패치](#synchronous-dispatching)
    - [잡과 데이터베이스 트랜잭션](#jobs-and-database-transactions)
    - [잡 체이닝](#job-chaining)
    - [큐 및 커넥션 커스터마이징](#customizing-the-queue-and-connection)
    - [최대 시도 횟수/타임아웃 지정](#max-job-attempts-and-timeout)
    - [에러 핸들링](#error-handling)
- [잡 배치 작업](#job-batching)
    - [배치 가능한 잡 정의](#defining-batchable-jobs)
    - [배치 디스패치](#dispatching-batches)
    - [잡을 배치에 추가하기](#adding-jobs-to-batches)
    - [배치 조회](#inspecting-batches)
    - [배치 취소](#cancelling-batches)
    - [배치 실패](#batch-failures)
    - [배치 정리(Pruning)](#pruning-batches)
- [클로저 큐잉하기](#queueing-closures)
- [큐 워커 실행](#running-the-queue-worker)
    - [`queue:work` 명령어](#the-queue-work-command)
    - [큐 우선순위](#queue-priorities)
    - [큐 워커와 배포](#queue-workers-and-deployment)
    - [잡 만료 및 타임아웃](#job-expirations-and-timeouts)
- [Supervisor 설정](#supervisor-configuration)
- [실패한 잡 처리](#dealing-with-failed-jobs)
    - [실패 후 리소스 정리](#cleaning-up-after-failed-jobs)
    - [실패 잡 재시도](#retrying-failed-jobs)
    - [누락된 모델 무시](#ignoring-missing-models)
    - [실패 잡 정리](#pruning-failed-jobs)
    - [실패 잡을 DynamoDB에 저장](#storing-failed-jobs-in-dynamodb)
    - [실패 잡 저장 비활성화](#disabling-failed-job-storage)
    - [실패 잡 이벤트](#failed-job-events)
- [큐에서 잡 제거](#clearing-jobs-from-queues)
- [큐 모니터링](#monitoring-your-queues)
- [잡 이벤트](#job-events)

<a name="introduction"></a>
## 소개

웹 애플리케이션을 개발하다 보면, 업로드된 CSV 파일을 파싱하고 저장하는 작업처럼 일반적인 웹 요청 동안 처리하기에는 시간이 너무 오래 걸리는 작업이 있을 수 있습니다. 이런 경우 라라벨에서는 별도의 대기열(큐)에 작업을 등록하고, 백그라운드에서 처리할 수 있는 잡(Queued Job)을 쉽게 만들 수 있습니다. 시간이 오래 걸리는 작업을 큐로 옮기면, 애플리케이션이 웹 요청에 훨씬 빠르게 응답할 수 있어서 사용자 경험을 크게 개선할 수 있습니다.

라라벨 큐 시스템은 [Amazon SQS](https://aws.amazon.com/sqs/), [Redis](https://redis.io), 관계형 데이터베이스 등 다양한 큐 백엔드에 대해 일관된 큐 API를 제공합니다.

라라벨의 큐 설정 옵션은 애플리케이션의 `config/queue.php` 설정 파일에 저장되어 있습니다. 이 파일에서는 데이터베이스, [Amazon SQS](https://aws.amazon.com/sqs/), [Redis](https://redis.io), [Beanstalkd](https://beanstalkd.github.io/) 등 프레임워크에 포함된 각 큐 드라이버에 대한 커넥션 설정을 확인할 수 있습니다. 또한, 로컬 개발 환경에서 즉시 잡을 실행할 수 있게 해주는 동기식(synchronous) 드라이버도 포함되어 있습니다. 큐에 등록된 잡을 폐기(discard)하는 `null` 큐 드라이버 역시 사용할 수 있습니다.

> [!TIP]
> 라라벨은 이제 Horizon이라는 아름다운 대시보드 및 구성 시스템도 제공합니다. Redis 기반 큐를 직관적으로 관리할 수 있으니, 자세한 내용은 [Horizon 공식 문서](/docs/8.x/horizon)를 참고하세요.

<a name="connections-vs-queues"></a>
### 커넥션과 큐의 차이

라라벨 큐를 사용하기 전에 "커넥션(connection)"과 "큐(queue)"의 차이점을 이해하는 것이 중요합니다. `config/queue.php` 설정 파일에는 `connections`라는 설정 배열이 있습니다. 이 옵션은 Amazon SQS, Beanstalk, Redis 등의 백엔드 큐 서비스에 대한 커넥션을 정의합니다. 한편, 각각의 큐 커넥션에는 여러 개의 "큐"를 둘 수 있습니다. 여기서 "큐"는 각각 별도의 잡 작업 스택이나 대기열로 생각할 수 있습니다.

`queue` 설정 파일의 각 커넥션 설정 예시에는 `queue` 속성이 포함되어 있습니다. 이 속성은 해당 커넥션에 잡이 디스패치될 때 기본적으로 사용할 큐를 지정합니다. 즉, 잡을 명시적으로 어떤 큐로 보낼지 지정하지 않은 경우, 커넥션 설정의 `queue` 속성에 정의된 큐로 들어갑니다.

```
use App\Jobs\ProcessPodcast;

// 이 잡은 기본 커넥션의 기본 큐로 전달됩니다...
ProcessPodcast::dispatch();

// 이 잡은 기본 커넥션의 "emails" 큐로 전달됩니다...
ProcessPodcast::dispatch()->onQueue('emails');
```

많은 애플리케이션에서는 복잡한 큐 구성이 필요하지 않아 단일 큐만 사용하는 경우도 있지만, 잡을 여러 큐에 분산시켜 우선순위별로 작업을 처리하고 싶을 때도 있습니다. 라라벨 큐 워커에서는 처리할 큐의 우선순위를 지정할 수 있기 때문입니다. 예를 들어, `high`라는 큐에 우선적으로 중요한 작업을 올리고, 워커를 다음과 같이 실행하면 해당 큐를 우선적으로 처리하게 할 수 있습니다.

```
php artisan queue:work --queue=high,default
```

<a name="driver-prerequisites"></a>
### 드라이버 참고사항 및 사전 준비

<a name="database"></a>
#### 데이터베이스

`database` 큐 드라이버를 사용하려면, 작업(잡)을 저장할 데이터베이스 테이블이 필요합니다. 테이블 생성을 위한 마이그레이션 파일을 만들려면 `queue:table` 아티즌 명령어를 실행하세요. 마이그레이션을 생성한 뒤에는 마이그레이션을 실제로 반영해야 합니다.

```
php artisan queue:table

php artisan migrate
```

마지막으로, 애플리케이션의 `.env` 파일에서 `QUEUE_CONNECTION` 변수를 `database`로 설정해주어야 합니다.

```
QUEUE_CONNECTION=database
```

<a name="redis"></a>
#### Redis

`redis` 큐 드라이버를 사용하려면, 먼저 `config/database.php` 설정 파일에 Redis 데이터베이스 커넥션을 구성해야 합니다.

**Redis 클러스터**

Redis 큐 커넥션에서 Redis 클러스터를 사용하는 경우, 큐 이름에 [키 해시 태그(key hash tag)](https://redis.io/topics/cluster-spec#keys-hash-tags)를 반드시 포함해야 합니다. 이렇게 해야 같은 큐에 대한 모든 Redis 키가 동일한 해시 슬롯에 저장됩니다.

```
'redis' => [
    'driver' => 'redis',
    'connection' => 'default',
    'queue' => '{default}',
    'retry_after' => 90,
],
```

**Blocking(블로킹)**

Redis 큐를 사용할 때는 `block_for` 설정 옵션으로, 워커가 잡이 큐에 도착할 때까지 최대 얼마 동안 대기할지 지정할 수 있습니다. 이 값은 워커가 반복적으로 Redis를 계속 폴링(polling)하는 대신, 한 번 대기한 뒤 다시 조회하도록 해 큐의 부하를 효율적으로 조정할 수 있습니다.

예를 들어, 이 값을 `5`로 설정하면 잡이 도착할 때까지 최대 5초간 대기하도록 지정할 수 있습니다.

```
'redis' => [
    'driver' => 'redis',
    'connection' => 'default',
    'queue' => 'default',
    'retry_after' => 90,
    'block_for' => 5,
],
```

> [!NOTE]
> `block_for`를 `0`으로 설정하면 워커는 잡이 도착할 때까지 무한정 대기합니다. 이 경우 `SIGTERM` 같은 신호가 바로 처리되지 않고, 다음 잡이 처리된 후에야 적용될 수 있습니다.

<a name="other-driver-prerequisites"></a>
#### 기타 드라이버 사전 준비

아래와 같이 각 큐 드라이버 별로 필요한 의존성 패키지가 있습니다. 이 패키지들은 Composer를 통해 설치할 수 있습니다.

<div class="content-list" markdown="1">

- Amazon SQS: `aws/aws-sdk-php ~3.0`
- Beanstalkd: `pda/pheanstalk ~4.0`
- Redis: `predis/predis ~1.0` 또는 phpredis PHP 확장

</div>

<a name="creating-jobs"></a>
## 잡 생성하기

<a name="generating-job-classes"></a>
### 잡 클래스 생성

기본적으로 애플리케이션의 모든 큐잉 가능한 잡(job) 클래스는 `app/Jobs` 디렉터리에 보관됩니다. 만약 해당 디렉터리가 없다면, `make:job` 아티즌 명령어를 실행할 때 자동으로 생성됩니다.

```
php artisan make:job ProcessPodcast
```

이렇게 생성된 클래스는 `Illuminate\Contracts\Queue\ShouldQueue` 인터페이스를 구현하고 있으며, 라라벨에게 이 잡이 큐에 등록되어 비동기 처리되어야 함을 알립니다.

> [!TIP]
> 잡 스텁 파일은 [스텁 배포](/docs/8.x/artisan#stub-customization) 기능을 이용해 커스터마이즈할 수 있습니다.

<a name="class-structure"></a>
### 클래스 구조

잡 클래스 구조는 매우 간단하며, 일반적으로 큐에서 처리될 때 호출되는 `handle` 메서드 하나만 포함하는 경우가 많습니다. 샘플 잡 클래스를 예로 살펴보겠습니다. 이 예시에서는 팟캐스트 발행 서비스를 운영 중이고, 업로드된 팟캐스트 파일을 게시 전에 처리해야 한다고 가정합니다.

```
<?php

namespace App\Jobs;

use App\Models\Podcast;
use App\Services\AudioProcessor;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessPodcast implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The podcast instance.
     *
     * @var \App\Models\Podcast
     */
    protected $podcast;

    /**
     * Create a new job instance.
     *
     * @param  App\Models\Podcast  $podcast
     * @return void
     */
    public function __construct(Podcast $podcast)
    {
        $this->podcast = $podcast;
    }

    /**
     * Execute the job.
     *
     * @param  App\Services\AudioProcessor  $processor
     * @return void
     */
    public function handle(AudioProcessor $processor)
    {
        // Process uploaded podcast...
    }
}
```

예시에서 볼 수 있듯, [Eloquent 모델](/docs/8.x/eloquent)을 큐 잡의 생성자에 바로 전달할 수 있습니다. 잡 클래스가 `SerializesModels` 트레이트를 사용하고 있기 때문에, Eloquent 모델과 로드된 연관관계도 안전하게 직렬화/역직렬화되어 큐에서 처리됩니다.

만약 큐 잡 생성자에 Eloquent 모델을 전달하는 경우, 모델의 식별자(identifier)만 직렬화되어 큐에 저장됩니다. 실제로 잡이 실행될 때는 큐 시스템이 데이터베이스에서 전체 모델 인스턴스와 그 연관관계를 다시 가져와 재조립합니다. 이 방식의 모델 직렬화 덕분에 큐 드라이버로 전송되는 잡 페이로드 크기가 현저히 줄어듭니다.

<a name="handle-method-dependency-injection"></a>
#### `handle` 메서드 의존성 주입

`handle` 메서드는 잡이 큐에서 처리될 때 실행됩니다. `handle` 메서드의 인수에 타입힌트로 의존성을 선언하면, 라라벨 [서비스 컨테이너](/docs/8.x/container)에서 자동으로 해당 의존성을 주입해줍니다.

만약 컨테이너가 `handle` 메서드에 의존성을 주입하는 방식을 직접 제어하고 싶다면, 컨테이너의 `bindMethod` 메서드를 사용할 수 있습니다. `bindMethod`는 잡과 컨테이너를 받아 임의의 방식으로 `handle`을 호출하는 콜백을 등록합니다. 이 코드는 일반적으로 `App\Providers\AppServiceProvider` 내의 `boot` 메서드에서 작성합니다.

```
use App\Jobs\ProcessPodcast;
use App\Services\AudioProcessor;

$this->app->bindMethod([ProcessPodcast::class, 'handle'], function ($job, $app) {
    return $job->handle($app->make(AudioProcessor::class));
});
```

> [!NOTE]
> 바이너리 데이터(예: 원본 이미지 데이터 등)는 큐 잡에 전달하기 전에 반드시 `base64_encode` 함수를 통해 인코딩하세요. 그렇지 않으면 잡이 큐에 등록될 때 JSON 직렬화가 제대로 되지 않을 수 있습니다.

<a name="handling-relationships"></a>
#### 큐 잡과 연관관계

로드된 연관관계 역시 직렬화되기 때문에, 직렬화된 잡 문자열이 예상보다 커질 수 있습니다. 만약 연관관계를 직렬화하지 않으려면, 모델의 속성값을 지정할 때 `withoutRelations` 메서드를 호출하면 됩니다. 이 메서드를 사용하면 로드된 연관관계 없이 깔끔한 모델 인스턴스를 반환받을 수 있습니다.

```
/**
 * Create a new job instance.
 *
 * @param  \App\Models\Podcast  $podcast
 * @return void
 */
public function __construct(Podcast $podcast)
{
    $this->podcast = $podcast->withoutRelations();
}
```

또한, 큐 잡이 역직렬화되어 모델 연관관계가 데이터베이스에서 다시 조회될 때, 모든 연관관계가 전체적으로 새로 로드됩니다. 즉, 큐잉 당시 모델에 적용했던 관계 제한 조건은 더 이상 적용되지 않습니다. 만약 특정 연관관계의 일부만 사용하고 싶다면, 큐 잡 내에서 원하는 제약 조건을 다시 추가해주어야 합니다.

<a name="unique-jobs"></a>
### 유니크 잡

> [!NOTE]
> 유니크 잡은 [락(lock)](/docs/8.x/cache#atomic-locks)을 지원하는 캐시 드라이버가 필요합니다. 현재 `memcached`, `redis`, `dynamodb`, `database`, `file`, `array` 캐시 드라이버는 원자적 락을 지원합니다. 단, 유니크 잡 제약은 배치 작업(batches) 내 잡에는 적용되지 않습니다.

특정한 잡이 한 시점에 큐에 하나만 존재하도록 보장하고 싶을 때가 있습니다. 이럴 때는 잡 클래스에서 `ShouldBeUnique` 인터페이스를 구현하면 됩니다. 이 인터페이스를 구현할 때는 추가로 메서드를 정의할 필요가 없습니다.

```
<?php

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Contracts\Queue\ShouldBeUnique;

class UpdateSearchIndex implements ShouldQueue, ShouldBeUnique
{
    ...
}
```

위 예시에서 `UpdateSearchIndex` 잡은 유니크 잡입니다. 즉, 동일한 잡 인스턴스가 큐에서 아직 처리 중이라면 또다시 큐에 등록되지 않습니다.

특정 "키(key)"를 기준으로 잡을 유니크하게 하거나, 잡이 유니크 상태를 유지할 최대 시간을 직접 지정하고 싶을 때도 있습니다. 이럴 때는 잡 클래스에 `uniqueId` 및 `uniqueFor` 속성이나 메서드를 정의하면 됩니다.

```
<?php

use App\Models\Product;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Contracts\Queue\ShouldBeUnique;

class UpdateSearchIndex implements ShouldQueue, ShouldBeUnique
{
    /**
     * The product instance.
     *
     * @var \App\Product
     */
    public $product;

    /**
     * 잡의 유니크 락이 해제되기까지의 시간(초).
     *
     * @var int
     */
    public $uniqueFor = 3600;

    /**
     * 잡의 유니크 ID 반환.
     *
     * @return string
     */
    public function uniqueId()
    {
        return $this->product->id;
    }
}
```

위 예시에서 `UpdateSearchIndex` 잡은 상품 ID 별로 유니크합니다. 동일한 상품 ID로 잡을 연속 디스패치하면, 이전 잡이 완료되기 전에는 무시됩니다. 그리고 한 시간(3600초) 이내에 잡 처리가 완료되지 않으면, 유니크 락이 해제되어 동일 키의 잡을 다시 큐에 등록할 수 있습니다.

<a name="keeping-jobs-unique-until-processing-begins"></a>
#### 잡을 처리 시작 전까지 유니크하게 유지하기

기본적으로 유니크 잡은 처리가 완료되거나 모든 재시도 횟수가 실패한 후에 "락"이 해제됩니다. 하지만, 잡을 실제로 처리하기 직전에 바로 언락이 필요할 때가 있습니다. 이럴 때는 `ShouldBeUnique` 대신 `ShouldBeUniqueUntilProcessing` 인터페이스를 구현하세요.

```
<?php

use App\Models\Product;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Contracts\Queue\ShouldBeUniqueUntilProcessing;

class UpdateSearchIndex implements ShouldQueue, ShouldBeUniqueUntilProcessing
{
    // ...
}
```

<a name="unique-job-locks"></a>
#### 유니크 잡의 락

내부적으로 `ShouldBeUnique` 잡이 디스패치될 때는 라라벨이 `uniqueId` 키를 사용하여 [락](/docs/8.x/cache#atomic-locks)을 획득하려 시도합니다. 락 획득에 실패하면 잡은 큐에 등록되지 않습니다. 이 락은 잡이 완료되거나 모든 재시도 횟수에 실패했을 때 해제됩니다. 기본적으로 라라벨은 기본 캐시 드라이버를 사용하여 락을 얻습니다. 다른 캐시 드라이버를 사용하고 싶다면, 잡 클래스에 `uniqueVia` 메서드를 정의하면 됩니다.

```
use Illuminate\Support\Facades\Cache;

class UpdateSearchIndex implements ShouldQueue, ShouldBeUnique
{
    ...

    /**
     * 유니크 잡 락에 사용할 캐시 드라이버 반환.
     *
     * @return \Illuminate\Contracts\Cache\Repository
     */
    public function uniqueVia()
    {
        return Cache::driver('redis');
    }
}
```

> [!TIP]
> 잡의 동시 실행 수만 제한이 필요하다면, [`WithoutOverlapping`](/docs/8.x/queues#preventing-job-overlaps) 잡 미들웨어를 사용하는 것이 더 적합합니다.

<a name="job-middleware"></a>
## 잡 미들웨어

잡 미들웨어를 활용하면 잡 실행 전후에 커스텀 로직을 삽입할 수 있어서, 각각의 잡 클래스에서 반복적인(보일러플레이트) 코드를 줄일 수 있습니다. 예를 들어, 아래와 같이 라라벨의 Redis 요청 제한(레이트 리밋) 기능을 활용하여 5초에 한 번만 잡을 처리하는 `handle` 메서드를 만들 수 있습니다.

```
use Illuminate\Support\Facades\Redis;

/**
 * Execute the job.
 *
 * @return void
 */
public function handle()
{
    Redis::throttle('key')->block(0)->allow(1)->every(5)->then(function () {
        info('Lock obtained...');

        // Handle job...
    }, function () {
        // Could not obtain lock...

        return $this->release(5);
    });
}
```

이 코드는 동작에는 문제가 없지만, `handle` 메서드가 Redis 레이트 리밋 관련 코드로 복잡해지고, 만약 여러 잡에서 이 코드가 필요하다면 중복 작성해야 할 수도 있습니다.

대신에, 레이트 리밋 로직을 별도 잡 미들웨어로 분리할 수 있습니다. 라라벨에서는 잡 미들웨어를 둘 특별한 위치가 정해져 있지 않기 때문에, 자유롭게 원하는 곳에 둘 수 있습니다. 예시에서는 `app/Jobs/Middleware` 디렉터리에 미들웨어를 생성하겠습니다.

```
<?php

namespace App\Jobs\Middleware;

use Illuminate\Support\Facades\Redis;

class RateLimited
{
    /**
     * 큐 잡 처리
     *
     * @param  mixed  $job
     * @param  callable  $next
     * @return mixed
     */
    public function handle($job, $next)
    {
        Redis::throttle('key')
                ->block(0)->allow(1)->every(5)
                ->then(function () use ($job, $next) {
                    // Lock obtained...

                    $next($job);
                }, function () use ($job) {
                    // Could not obtain lock...

                    $job->release(5);
                });
    }
}
```

위와 같이 [라우트 미들웨어](/docs/8.x/middleware)처럼, 잡 미들웨어도 처리할 잡 객체와 이후에 실행할 콜백을 전달받아 로직을 추가로 삽입할 수 있습니다.

잡 미들웨어를 만들었으면, 잡 클래스의 `middleware` 메서드를 통해 연결할 수 있습니다. 이 메서드는 기본적으로 `make:job` 아티즌 명령어로 잡을 만들 때 포함되어 있지 않으므로, 직접 작성해주어야 합니다.

```
use App\Jobs\Middleware\RateLimited;

/**
 * 잡이 통과해야 할 미들웨어 반환
 *
 * @return array
 */
public function middleware()
{
    return [new RateLimited];
}
```

> [!TIP]
> 잡 미들웨어는 큐 이벤트 리스너, 메일러블, 알림(Notification) 등에도 연결할 수 있습니다.

<a name="rate-limiting"></a>
### 요청 제한(속도 제한, Rate Limiting)

앞서 직접 레이트 리밋 잡 미들웨어를 만드는 법을 살펴봤지만, 사실 라라벨에는 기본으로 사용할 수 있는 레이트 리밋 미들웨어가 있습니다. [라우트 레이트 리미터](/docs/8.x/routing#defining-rate-limiters)처럼, 잡 레이트 리미터도 `RateLimiter` 파사드의 `for` 메서드를 사용해서 정의할 수 있습니다.

예를 들어, 일반 사용자는 시간당 한 번만 백업 작업을 허용하지만, 프리미엄 고객에게는 제한을 두지 않으려 할 경우 `AppServiceProvider`의 `boot` 메서드에서 다음과 같이 레이트 리미터를 등록할 수 있습니다.

```
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;

/**
 * Bootstrap any application services.
 *
 * @return void
 */
public function boot()
{
    RateLimiter::for('backups', function ($job) {
        return $job->user->vipCustomer()
                    ? Limit::none()
                    : Limit::perHour(1)->by($job->user->id);
    });
}
```

위 코드에서는 시간 단위로 레이트 리밋을 설정했지만, `perMinute` 메서드를 사용해 분 단위로 제한하거나, `by` 메서드에 임의의 값을 전달하여 고객별로 세분화하는 것도 가능합니다.

```
return Limit::perMinute(50)->by($job->user->id);
```

레이트 리밋을 정의한 후에는, `Illuminate\Queue\Middleware\RateLimited` 미들웨어를 잡의 `middleware` 메서드에 추가하면 됩니다. 레이트 리밋을 초과할 때마다 이 미들웨어는 잡을 다시 큐에 돌려보내고, 레이트 리밋 시간만큼 적절한 지연(delay)을 추가합니다.

```
use Illuminate\Queue\Middleware\RateLimited;

/**
 * 잡이 통과해야 할 미들웨어 반환
 *
 * @return array
 */
public function middleware()
{
    return [new RateLimited('backups')];
}
```

레이트 리밋되어 다시 큐에 등록될 때도 잡의 전체 `attempts`(시도) 횟수는 계속 증가합니다. 따라서, 잡 클래스의 `tries`, `maxExceptions` 속성 값을 적절히 조정하거나, [`retryUntil` 메서드](#time-based-attempts)로 잡을 더 이상 시도하지 않을 시간 조건을 정하는 것이 좋습니다.

만약 레이트 제한 시 잡을 다시 큐에 보내고 싶지 않다면, `dontRelease` 메서드를 사용할 수 있습니다.

```
/**
 * 잡이 통과해야 할 미들웨어 반환
 *
 * @return array
 */
public function middleware()
{
    return [(new RateLimited('backups'))->dontRelease()];
}
```

> [!TIP]
> Redis를 사용할 경우, 기본 레이트 리밋 미들웨어보다 성능이 최적화된 `Illuminate\Queue\Middleware\RateLimitedWithRedis` 미들웨어를 사용할 수 있습니다.

<a name="preventing-job-overlaps"></a>
### 잡 중복 방지 (Job Overlap 방지)

라라벨에는 `Illuminate\Queue\Middleware\WithoutOverlapping` 미들웨어가 내장되어 있습니다. 이 미들웨어는 임의의 키 기준으로 잡의 중복 실행을 방지할 수 있습니다. 예를 들어, 한 번에 하나의 잡만 특정 리소스를 수정하도록 하고 싶을 때 사용하면 좋습니다.

예를 들어, 사용자의 신용 점수를 업데이트하는 잡에서 동일한 사용자 ID로 중복 실행되는 잡을 방지하고 싶을 때는, 아래와 같이 `middleware` 메서드에서 `WithoutOverlapping` 미들웨어를 반환하면 됩니다.

```
use Illuminate\Queue\Middleware\WithoutOverlapping;

/**
 * 잡이 통과해야 할 미들웨어 반환
 *
 * @return array
 */
public function middleware()
{
    return [new WithoutOverlapping($this->user->id)];
}
```

중복되는 잡은 다시 큐에 돌려보내집니다. 이때, 재시도 전까지 대기할 시간을 초 단위로 지정할 수도 있습니다.

```
/**
 * 잡이 통과해야 할 미들웨어 반환
 *
 * @return array
 */
public function middleware()
{
    return [(new WithoutOverlapping($this->order->id))->releaseAfter(60)];
}
```

즉시 중복 잡을 삭제해서 더 이상 재시도하지 않게 하려면 `dontRelease` 메서드를 사용할 수 있습니다.

```
/**
 * 잡이 통과해야 할 미들웨어 반환
 *
 * @return array
 */
public function middleware()
{
    return [(new WithoutOverlapping($this->order->id))->dontRelease()];
}
```

`WithoutOverlapping` 미들웨어는 라라벨의 원자적 락(atomic lock) 기능으로 동작합니다. 드물게 잡이 비정상적으로 실패하거나 타임아웃이 발생해 락이 해제되지 않을 수도 있습니다. 이런 경우를 대비해, `expireAfter` 메서드로 락의 만료 시간을 초 단위로 명시할 수 있습니다. 아래 예시는 잡 처리가 시작된 후 3분(180초)이 지나면 락이 해제되도록 합니다.

```
/**
 * 잡이 통과해야 할 미들웨어 반환
 *
 * @return array
 */
public function middleware()
{
    return [(new WithoutOverlapping($this->order->id))->expireAfter(180)];
}
```

> [!NOTE]
> `WithoutOverlapping` 미들웨어는 [락(lock)](/docs/8.x/cache#atomic-locks)을 지원하는 캐시 드라이버가 필요합니다. 현재 `memcached`, `redis`, `dynamodb`, `database`, `file`, `array` 캐시 드라이버가 원자적 락을 지원합니다.

<a name="throttling-exceptions"></a>

### 예외 제한(Throttling Exceptions)

라라벨에는 예외 발생을 제한(throttle)할 수 있는 `Illuminate\Queue\Middleware\ThrottlesExceptions` 미들웨어가 포함되어 있습니다. 이 미들웨어를 사용하면, 작업(job)이 설정된 횟수만큼 예외를 던진 후에는 지정한 시간 간격이 지나기 전까지 해당 작업의 추가 실행 시도를 지연시킬 수 있습니다. 이 기능은 주로 불안정한 외부 서비스와 연동하는 작업에서 유용하게 활용할 수 있습니다.

예를 들어, 써드파티 API와 연동하는 큐 작업이 예외를 발생시키기 시작했다고 가정해봅니다. 예외 제한을 위해서는 해당 작업의 `middleware` 메서드에서 `ThrottlesExceptions` 미들웨어를 반환하면 됩니다. 일반적으로 이 미들웨어는 [시간 기반 시도](#time-based-attempts)를 구현한 작업과 함께 사용하는 것이 좋습니다.

```
use Illuminate\Queue\Middleware\ThrottlesExceptions;

/**
 * Get the middleware the job should pass through.
 *
 * @return array
 */
public function middleware()
{
    return [new ThrottlesExceptions(10, 5)];
}

/**
 * Determine the time at which the job should timeout.
 *
 * @return \DateTime
 */
public function retryUntil()
{
    return now()->addMinutes(5);
}
```

이 미들웨어의 첫 번째 생성자 인자는, 작업이 제한(throttle)되기 전까지 허용되는 예외 발생 횟수이고, 두 번째 인자는 작업이 제한된 후 다시 시도될 때까지 기다릴 시간(분)입니다. 위의 예시에서는 5분 이내에 10번 예외가 발생하면, 5분 동안 실행이 지연된 후 다시 시도하게 됩니다.

작업이 예외를 던졌으나 예외 임계값에 아직 도달하지 않았다면, 기본적으로 해당 작업은 즉시 재시도됩니다. 그러나 미들웨어를 등록할 때 `backoff` 메서드를 호출하면, 재시도까지 지연할 시간(분)을 별도로 지정할 수 있습니다.

```
use Illuminate\Queue\Middleware\ThrottlesExceptions;

/**
 * Get the middleware the job should pass through.
 *
 * @return array
 */
public function middleware()
{
    return [(new ThrottlesExceptions(10, 5))->backoff(5)];
}
```

내부적으로 이 미들웨어는 라라벨의 캐시 시스템을 이용해 레이트 리미팅을 구현합니다. 이때 작업 클래스명이 캐시 "키"로 사용됩니다. 만약 동일한 써드파티 서비스와 여러 작업이 연동되며, 이들 작업이 예외 제한 "버킷"을 공유하도록 하려면, 미들웨어를 등록할 때 `by` 메서드를 호출해 키를 직접 지정할 수 있습니다.

```
use Illuminate\Queue\Middleware\ThrottlesExceptions;

/**
 * Get the middleware the job should pass through.
 *
 * @return array
 */
public function middleware()
{
    return [(new ThrottlesExceptions(10, 10))->by('key')];
}
```

> [!TIP]
> Redis를 사용한다면, 기본 예외 제한 미들웨어보다 Redis에 최적화되어 더 효율적인 `Illuminate\Queue\Middleware\ThrottlesExceptionsWithRedis` 미들웨어를 사용할 수 있습니다.

<a name="dispatching-jobs"></a>
## 작업 디스패치(Dispatching Jobs)

작업 클래스를 작성했다면, 해당 클래스의 `dispatch` 메서드를 사용해 큐에 작업을 등록할 수 있습니다. `dispatch` 메서드에 전달한 인수들은 작업 클래스의 생성자에 전달됩니다.

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessPodcast;
use App\Models\Podcast;
use Illuminate\Http\Request;

class PodcastController extends Controller
{
    /**
     * Store a new podcast.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $podcast = Podcast::create(...);

        // ...

        ProcessPodcast::dispatch($podcast);
    }
}
```

조건부로 작업을 디스패치하고 싶다면 `dispatchIf` 혹은 `dispatchUnless` 메서드를 사용할 수 있습니다.

```
ProcessPodcast::dispatchIf($accountActive, $podcast);

ProcessPodcast::dispatchUnless($accountSuspended, $podcast);
```

<a name="delayed-dispatching"></a>
### 작업 지연 디스패치(Delayed Dispatching)

작업이 바로 큐 워커에 의해 처리되지 않고 일정 시간 뒤부터 처리 가능하게 하고 싶다면, 작업을 디스패치할 때 `delay` 메서드를 사용할 수 있습니다. 예를 들어, 작업을 디스패치한 후 10분이 지난 뒤에 처리되도록 할 수 있습니다.

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessPodcast;
use App\Models\Podcast;
use Illuminate\Http\Request;

class PodcastController extends Controller
{
    /**
     * Store a new podcast.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $podcast = Podcast::create(...);

        // ...

        ProcessPodcast::dispatch($podcast)
                    ->delay(now()->addMinutes(10));
    }
}
```

> [!NOTE]
> Amazon SQS 큐 서비스에서 사용할 수 있는 최대 지연 시간은 15분입니다.

<a name="dispatching-after-the-response-is-sent-to-browser"></a>
#### HTTP 응답 전송 후 작업 디스패치

또한, `dispatchAfterResponse` 메서드를 사용해 사용자의 브라우저로 HTTP 응답이 전송된 후에 작업을 디스패치할 수도 있습니다. 이렇게 하면 큐에 등록된 작업이 아직 실행 중일 때도 사용자는 애플리케이션을 바로 사용할 수 있습니다. 이 방식은 대략 1초 정도 소요되며, 이메일 발송처럼 간단한 작업에만 사용하는 것이 좋습니다. 이 방식으로 디스패치된 작업은 현재 HTTP 요청이 완료된 이후 실행되므로 별도의 큐 워커가 동작 중일 필요가 없습니다.

```
use App\Jobs\SendNotification;

SendNotification::dispatchAfterResponse();
```

또한, 클로저를 `dispatch`로 큐에 등록하고, `afterResponse` 메서드를 체이닝하면 HTTP 응답 전송 이후에 클로저를 실행할 수 있습니다.

```
use App\Mail\WelcomeMessage;
use Illuminate\Support\Facades\Mail;

dispatch(function () {
    Mail::to('taylor@example.com')->send(new WelcomeMessage);
})->afterResponse();
```

<a name="synchronous-dispatching"></a>
### 동기식 작업 디스패치(Synchronous Dispatching)

작업을 큐에 등록하지 않고 즉시(동기식으로) 실행하고 싶다면, `dispatchSync` 메서드를 사용할 수 있습니다. 이 메서드를 사용하면 작업이 즉시 처리되고, 별도의 큐에 쌓이지 않습니다.

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessPodcast;
use App\Models\Podcast;
use Illuminate\Http\Request;

class PodcastController extends Controller
{
    /**
     * Store a new podcast.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $podcast = Podcast::create(...);

        // Create podcast...

        ProcessPodcast::dispatchSync($podcast);
    }
}
```

<a name="jobs-and-database-transactions"></a>
### 작업과 데이터베이스 트랜잭션(Jobs & Database Transactions)

데이터베이스 트랜잭션 내에서 작업을 디스패치하는 것은 문제가 없습니다. 다만, 작업이 실제로 성공적으로 실행될 수 있도록 몇 가지 주의해야 할 점이 있습니다. 트랜잭션 내에서 작업을 디스패치할 때, 워커가 트랜잭션 커밋보다 먼저 작업을 처리할 수 있습니다. 이런 경우, 트랜잭션 내부에서 변경된 모델이나 데이터베이스 레코드는 아직 반영되지 않았거나 존재하지 않을 수 있습니다.

다행히, 라라벨은 이러한 문제를 해결할 여러 방법을 제공합니다. 첫 번째로, 큐 커넥션 설정 배열에서 `after_commit` 옵션을 설정할 수 있습니다.

```
'redis' => [
    'driver' => 'redis',
    // ...
    'after_commit' => true,
],
```

`after_commit` 옵션이 `true`라면, 데이터베이스 트랜잭션 내에서 작업을 디스패치하더라도, 모든 트랜잭션이 커밋된 후에 큐에 등록됩니다. 트랜잭션이 없다면, 작업은 즉시 등록됩니다.

트랜잭션 진행 중 발생한 예외로 인해 롤백된다면, 해당 트랜잭션 중에 등록된 작업들도 폐기됩니다.

> [!TIP]
> `after_commit` 설정 값을 `true`로 지정하면, 큐에 등록되는 이벤트 리스너, 메일, 알림, 브로드캐스트 이벤트도 모두 열린 데이터베이스 트랜잭션 커밋 후에 등록됩니다.

<a name="specifying-commit-dispatch-behavior-inline"></a>
#### 인라인 커밋 디스패치 동작 지정

큐 커넥션의 `after_commit` 설정값을 `true`로 지정하지 않은 경우에도, 특정 작업만 데이터베이스 트랜잭션 커밋 이후에 실행되도록 할 수 있습니다. 이를 위해 `dispatch` 작업 시 `afterCommit` 메서드를 체이닝해 호출하면 됩니다.

```
use App\Jobs\ProcessPodcast;

ProcessPodcast::dispatch($podcast)->afterCommit();
```

반대로, `after_commit` 설정이 이미 `true`라면, 특정 작업을 커밋을 기다리지 않고 즉시 실행하려면 `beforeCommit` 메서드를 사용할 수 있습니다.

```
ProcessPodcast::dispatch($podcast)->beforeCommit();
```

<a name="job-chaining"></a>
### 작업 체이닝(Job Chaining)

작업 체이닝을 이용하면, 하나의 주요 작업이 성공적으로 실행된 후 이어서 순차적으로 처리할 큐 작업 목록을 지정할 수 있습니다. 체인 내 작업 중 하나라도 실패하면, 그 이후 작업은 실행되지 않습니다. 작업 체인을 실행하려면, `Bus` 파사드에서 제공하는 `chain` 메서드를 사용합니다. 참고로 라라벨의 커맨드 버스(command bus)는 큐 작업 디스패칭의 기반이 되는 저수준 컴포넌트입니다.

```
use App\Jobs\OptimizePodcast;
use App\Jobs\ProcessPodcast;
use App\Jobs\ReleasePodcast;
use Illuminate\Support\Facades\Bus;

Bus::chain([
    new ProcessPodcast,
    new OptimizePodcast,
    new ReleasePodcast,
])->dispatch();
```

작업 클래스 인스턴스뿐만 아니라 클로저도 체이닝할 수 있습니다.

```
Bus::chain([
    new ProcessPodcast,
    new OptimizePodcast,
    function () {
        Podcast::update(...);
    },
])->dispatch();
```

> [!NOTE]
> 작업 내에서 `$this->delete()` 메서드로 큐에서 작업을 삭제해도, 체인 처리에는 영향을 주지 않습니다. 체이닝이 중단되는 유일한 경우는 체인 내 작업이 실패했을 때입니다.

<a name="chain-connection-queue"></a>
#### 체인 연결/큐 지정

체인에 포함된 작업들이 사용할 연결(connection)과 큐(queue)를 지정하려면 `onConnection` 및 `onQueue` 메서드를 사용할 수 있습니다. 이 메서드들은 작업에 별도로 지정된 값이 없다면, 지정한 연결과 큐 설정을 사용합니다.

```
Bus::chain([
    new ProcessPodcast,
    new OptimizePodcast,
    new ReleasePodcast,
])->onConnection('redis')->onQueue('podcasts')->dispatch();
```

<a name="chain-failures"></a>
#### 체인 실패 처리

작업 체이닝 시 `catch` 메서드를 사용하면 체인 내 작업이 실패했을 때 실행될 클로저를 지정할 수 있습니다. 이 콜백에는 해당 작업 실패의 원인이 되는 `Throwable` 객체가 전달됩니다.

```
use Illuminate\Support\Facades\Bus;
use Throwable;

Bus::chain([
    new ProcessPodcast,
    new OptimizePodcast,
    new ReleasePodcast,
])->catch(function (Throwable $e) {
    // 체인 내 작업이 실패한 경우...
})->dispatch();
```

<a name="customizing-the-queue-and-connection"></a>
### 큐 및 커넥션 커스터마이징

<a name="dispatching-to-a-particular-queue"></a>
#### 특정 큐에 작업 보내기

작업을 서로 다른 큐에 등록하면, 작업을 카테고리별로 분류하고 각 큐에 워커를 여러 개 할당하는 등 우선순위를 다르게 둘 수 있습니다. 이 기능은 큐 설정 파일에서 정의한 "커넥션"이 아닌, 하나의 커넥션 내부에서 큐를 구분하는 점에 유의하세요. 특정 큐로 작업을 보내려면 `onQueue` 메서드를 사용합니다.

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessPodcast;
use App\Models\Podcast;
use Illuminate\Http\Request;

class PodcastController extends Controller
{
    /**
     * Store a new podcast.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $podcast = Podcast::create(...);

        // Create podcast...

        ProcessPodcast::dispatch($podcast)->onQueue('processing');
    }
}
```

또는, 작업 클래스 생성자에서 `onQueue` 메서드를 호출하여 큐를 지정할 수도 있습니다.

```
<?php

namespace App\Jobs;

 use Illuminate\Bus\Queueable;
 use Illuminate\Contracts\Queue\ShouldQueue;
 use Illuminate\Foundation\Bus\Dispatchable;
 use Illuminate\Queue\InteractsWithQueue;
 use Illuminate\Queue\SerializesModels;

class ProcessPodcast implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->onQueue('processing');
    }
}
```

<a name="dispatching-to-a-particular-connection"></a>
#### 특정 큐 커넥션에 작업 보내기

애플리케이션이 여러 큐 커넥션을 사용하는 경우, 작업을 어느 커넥션에 보낼지 `onConnection` 메서드로 지정할 수 있습니다.

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessPodcast;
use App\Models\Podcast;
use Illuminate\Http\Request;

class PodcastController extends Controller
{
    /**
     * Store a new podcast.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $podcast = Podcast::create(...);

        // Create podcast...

        ProcessPodcast::dispatch($podcast)->onConnection('sqs');
    }
}
```

`onConnection`과 `onQueue`를 함께 사용해서, 작업이 등록될 커넥션과 큐를 동시에 지정할 수 있습니다.

```
ProcessPodcast::dispatch($podcast)
              ->onConnection('sqs')
              ->onQueue('processing');
```

또는, 작업 클래스 생성자에서 `onConnection` 메서드를 호출해 지정할 수도 있습니다.

```
<?php

namespace App\Jobs;

 use Illuminate\Bus\Queueable;
 use Illuminate\Contracts\Queue\ShouldQueue;
 use Illuminate\Foundation\Bus\Dispatchable;
 use Illuminate\Queue\InteractsWithQueue;
 use Illuminate\Queue\SerializesModels;

class ProcessPodcast implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->onConnection('sqs');
    }
}
```

<a name="max-job-attempts-and-timeout"></a>
### 작업의 최대 재시도 횟수 및 타임아웃 설정

<a name="max-attempts"></a>
#### 최대 재시도 횟수(Max Attempts)

큐에 등록된 작업이 반복적으로 에러가 발생할 경우, 무한히 재시도 하지 않도록 최대 시도 횟수를 정할 수 있습니다. 라라벨은 작업별 또는 전체 워커 단위로 최대 시도 횟수를 지정할 수 있는 여러 방법을 제공합니다.

가장 간단한 방법은, Artisan 명령어 실행 시 `--tries` 옵션을 사용하는 것입니다. 워커에서 처리되는 모든 작업에 기본 적용되지만, 개별 작업 클래스에서 더 구체적인 최대 시도 횟수를 지정하면 해당 작업이 우선 적용됩니다.

```
php artisan queue:work --tries=3
```

작업이 최대 재시도 횟수를 초과하면 "실패한 작업"으로 간주됩니다. 실패한 작업 처리에 대한 내용은 [실패한 작업 문서](#dealing-with-failed-jobs)를 참고하세요.

보다 세밀하게 작업별 최대 시도 횟수를 지정하려면 작업 클래스 내에 최대 횟수를 정의하면 됩니다. 작업 클래스에서 지정된 값이 있으면, CLI에서 지정한 `--tries`보다 우선 적용됩니다.

```
<?php

namespace App\Jobs;

class ProcessPodcast implements ShouldQueue
{
    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 5;
}
```

<a name="time-based-attempts"></a>
#### 시간 기반 시도(Time Based Attempts)

작업이 실패하기 전까지 최대 시도 횟수 대신, 더 이상 작업을 시도하지 않을 시간을 설정할 수도 있습니다. 이를 통해, 정해진 시간 동안 얼마든지 작업을 재시도할 수 있습니다. 재시도 종료 시간을 지정하려면, 작업 클래스에 `retryUntil` 메서드를 추가하고, `DateTime` 객체를 반환해야 합니다.

```
/**
 * Determine the time at which the job should timeout.
 *
 * @return \DateTime
 */
public function retryUntil()
{
    return now()->addMinutes(10);
}
```

> [!TIP]
> [큐 기반 이벤트 리스너](/docs/8.x/events#queued-event-listeners)에서도 `tries` 속성이나 `retryUntil` 메서드를 정의할 수 있습니다.

<a name="max-exceptions"></a>
#### 최대 예외 횟수(Max Exceptions)

때로는 작업을 여러 번 시도할 수 있도록 하되, `release` 메서드를 통한 단순 릴리즈가 아닌, 처리되지 않은 예외가 일정 횟수 이상 발생하면 작업을 실패로 처리하고 싶을 수 있습니다. 이런 경우, 작업 클래스에 `maxExceptions` 속성을 지정하면 됩니다.

```
<?php

namespace App\Jobs;

use Illuminate\Support\Facades\Redis;

class ProcessPodcast implements ShouldQueue
{
    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 25;

    /**
     * The maximum number of unhandled exceptions to allow before failing.
     *
     * @var int
     */
    public $maxExceptions = 3;

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        Redis::throttle('key')->allow(10)->every(60)->then(function () {
            // Lock obtained, process the podcast...
        }, function () {
            // Unable to obtain lock...
            return $this->release(10);
        });
    }
}
```

이 예시에서, 만약 Redis 락을 얻지 못하면 작업을 10초 동안 릴리즈하고, 최대 25회까지 계속 재시도합니다. 그러나 처리되지 않은 예외가 3번 발생하는 경우 작업은 실패하게 됩니다.

<a name="timeout"></a>
#### 타임아웃(Timeout)

> [!NOTE]
> 작업 타임아웃을 적용하려면 PHP `pcntl` 확장(extension)이 설치되어 있어야 합니다.

큐 작업이 대략 어느 정도 시간이 걸릴지 예측이 가능하다면, "타임아웃" 값을 지정하여 작업이 너무 오래 실행되는 경우 워커가 에러와 함께 종료되도록 설정할 수 있습니다. 보통 워커는 [서버의 프로세스 관리자 설정](#supervisor-configuration)에 의해 자동으로 재시작됩니다.

큐 작업이 실행될 수 있는 최대 초(second)는, 아티즌 CLI에서 `--timeout` 옵션으로 지정할 수 있습니다.

```
php artisan queue:work --timeout=30
```

작업이 계속 타임아웃으로 인해 최대 시도 횟수를 초과하게 되면, 해당 작업은 실패 처리됩니다.

작업 클래스 자체에 최대 실행 시간을 초 단위로 지정할 수도 있습니다. 이 경우 작업 클래스에 설정한 값이, 커맨드라인에서 지정한 Timeout 옵션보다 우선해서 적용됩니다.

```
<?php

namespace App\Jobs;

class ProcessPodcast implements ShouldQueue
{
    /**
     * The number of seconds the job can run before timing out.
     *
     * @var int
     */
    public $timeout = 120;
}
```

소켓 통신이나 외부 HTTP 연결 등 IO 블로킹 동작에서는, 지정한 타임아웃이 제대로 동작하지 않을 수도 있습니다. 따라서 이런 작업에는 해당 API 자체에서 타임아웃 옵션을 반드시 설정해야 합니다. 예를 들어, Guzzle을 사용할 경우 연결 및 요청 타임아웃 값을 명시적으로 지정해야 합니다.

<a name="failing-on-timeout"></a>

#### 타임아웃 시 실패 처리

작업이 [실패 처리](#dealing-with-failed-jobs)되어야 할 타임아웃 상황을 명시하고 싶다면, 작업 클래스에 `$failOnTimeout` 속성을 정의하면 됩니다.

```php
/**
 * Indicate if the job should be marked as failed on timeout.
 *
 * @var bool
 */
public $failOnTimeout = true;
```

<a name="error-handling"></a>
### 에러 처리

작업 처리 중 예외가 발생하면, 해당 작업은 자동으로 큐로 다시 반환되어 재시도하게 됩니다. 이 작업은 애플리케이션에서 허용한 최대 시도 횟수에 도달할 때까지 계속 반복됩니다. 최대 시도 횟수는 `queue:work` 아티즌 명령어에서 사용하는 `--tries` 옵션으로 설정하거나, 작업 클래스에서 직접 지정할 수도 있습니다. 큐 워커 실행에 대한 더 자세한 정보는 [아래에서 확인](#running-the-queue-worker)할 수 있습니다.

<a name="manually-releasing-a-job"></a>
#### 작업을 수동으로 재시도 큐에 반환하기

작업을 나중에 다시 시도할 수 있도록 수동으로 큐에 반환해야 하는 경우가 있습니다. 이때는 `release` 메서드를 호출하면 됩니다.

```
/**
 * Execute the job.
 *
 * @return void
 */
public function handle()
{
    // ...

    $this->release();
}
```

기본적으로 `release` 메서드는 해당 작업을 즉시 다시 큐에 올립니다. 다만, 정수를 인자로 전달하면 지정한 초(sec)만큼 대기했다가 처리를 재시도합니다.

```
$this->release(10);
```

<a name="manually-failing-a-job"></a>
#### 작업을 수동으로 실패 처리하기

특정 경우에는 작업을 직접 "실패"로 표시해야 할 수도 있습니다. 이를 위해 `fail` 메서드를 호출할 수 있습니다.

```
/**
 * Execute the job.
 *
 * @return void
 */
public function handle()
{
    // ...

    $this->fail();
}
```

예외가 발생해 작업을 실패시키고자 한다면, 해당 예외를 `fail` 메서드에 전달할 수 있습니다.

```
$this->fail($exception);
```

> [!TIP]
> 작업 실패 처리에 대한 더 자세한 내용은 [작업 실패 처리 문서](#dealing-with-failed-jobs)를 참고하시기 바랍니다.

<a name="job-batching"></a>
## 작업 일괄 처리 (Job Batching)

라라벨의 작업 일괄 처리(job batching) 기능을 사용하면 여러 작업을 한 번에 실행하고, 일괄 작업이 모두 끝난 후 특정 동작을 수행할 수 있습니다. 시작하기 전에, 작업 일괄 처리에 대한 메타 정보를 저장할 데이터베이스 테이블을 생성하는 마이그레이션을 작성해야 합니다. 아래 아티즌 명령어를 사용해 마이그레이션 파일을 생성할 수 있습니다.

```
php artisan queue:batches-table

php artisan migrate
```

<a name="defining-batchable-jobs"></a>
### 일괄 처리 가능한 작업 정의하기

일괄 처리에 포함될 작업은 일반적으로 [큐 작업 생성](#creating-jobs) 방식과 동일하게 생성하되, 작업 클래스에 `Illuminate\Bus\Batchable` 트레이트를 추가해야 합니다. 이 트레이트는 작업이 속한 현재 일괄(batch) 객체를 확인할 수 있는 `batch` 메서드를 제공합니다.

```
<?php

namespace App\Jobs;

use Illuminate\Bus\Batchable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ImportCsv implements ShouldQueue
{
    use Batchable, Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        if ($this->batch()->cancelled()) {
            // Determine if the batch has been cancelled...

            return;
        }

        // Import a portion of the CSV file...
    }
}
```

<a name="dispatching-batches"></a>
### 일괄 작업 디스패치하기

여러 작업을 일괄 처리로 디스패치하려면 `Bus` 파사드의 `batch` 메서드를 사용하면 됩니다. 일괄 처리는 완료 콜백과 함께 사용하는 것이 실무에서 유용하므로, `then`, `catch`, `finally` 메서드를 통해 일괄 처리 완료 시점에 실행할 콜백을 정의할 수 있습니다. 각 콜백에는 `Illuminate\Bus\Batch` 인스턴스가 전달됩니다. 아래 예시에서는, 하나의 CSV 파일에서 다양하게 행을 나누어 처리하는 여러 작업들을 일괄로 큐에 등록하는 상황입니다.

```
use App\Jobs\ImportCsv;
use Illuminate\Bus\Batch;
use Illuminate\Support\Facades\Bus;
use Throwable;

$batch = Bus::batch([
    new ImportCsv(1, 100),
    new ImportCsv(101, 200),
    new ImportCsv(201, 300),
    new ImportCsv(301, 400),
    new ImportCsv(401, 500),
])->then(function (Batch $batch) {
    // All jobs completed successfully...
})->catch(function (Batch $batch, Throwable $e) {
    // First batch job failure detected...
})->finally(function (Batch $batch) {
    // The batch has finished executing...
})->dispatch();

return $batch->id;
```

`$batch->id` 속성을 통하여 일괄 처리의 ID를 확인할 수 있으며, 이 ID를 이용해 [라라벨 커맨드 버스에서 일괄 처리 상태를 조회](#inspecting-batches)할 수 있습니다.

> [!NOTE]
> 일괄 처리 콜백(then, catch, finally 등)은 시리얼라이징되어 나중에 큐에서 실행되므로, 콜백 내에서는 `$this` 변수를 사용하지 말아야 합니다.

<a name="naming-batches"></a>
#### 일괄 처리 이름 지정하기

Laravel Horizon, Laravel Telescope와 같은 일부 도구들은 일괄 처리에 이름을 지정하면 디버깅 및 관리가 더 편리해집니다. 일괄 작업 정의 시 `name` 메서드를 사용해 임의의 이름을 지정할 수 있습니다.

```
$batch = Bus::batch([
    // ...
])->then(function (Batch $batch) {
    // All jobs completed successfully...
})->name('Import CSV')->dispatch();
```

<a name="batch-connection-queue"></a>
#### 일괄 처리 연결 및 큐 지정

일괄 처리에 사용될 큐 연결(connection)과 큐(queue)를 지정하려면 `onConnection`과 `onQueue` 메서드를 사용하세요. 일괄 처리에 속한 모든 작업은 동일한 연결과 큐에서 실행되어야 합니다.

```
$batch = Bus::batch([
    // ...
])->then(function (Batch $batch) {
    // All jobs completed successfully...
})->onConnection('redis')->onQueue('imports')->dispatch();
```

<a name="chains-within-batches"></a>
#### 일괄 처리 내 체인(Chained) 작업 정의

배치 안에 [체인 작업](#job-chaining)을 묶어 넣고 싶다면, 각 체인 작업들을 배열에 담아 일괄 처리 배열에 넣으면 됩니다. 아래 예시는 두 개의 체인 작업을 병렬로 실행하고, 두 체인 모두 완료되면 콜백이 실행됩니다.

```
use App\Jobs\ReleasePodcast;
use App\Jobs\SendPodcastReleaseNotification;
use Illuminate\Bus\Batch;
use Illuminate\Support\Facades\Bus;

Bus::batch([
    [
        new ReleasePodcast(1),
        new SendPodcastReleaseNotification(1),
    ],
    [
        new ReleasePodcast(2),
        new SendPodcastReleaseNotification(2),
    ],
])->then(function (Batch $batch) {
    // ...
})->dispatch();
```

<a name="adding-jobs-to-batches"></a>
### 일괄 처리에 작업 동적으로 추가하기

때때로, 일괄 처리 중 추가로 작업을 더 넣어야 하는 경우가 있습니다. 매우 많은(예: 수천 개) 작업을 한 번에 디스패치하기 어렵거나, 웹 요청 중에 처리가 너무 오래 걸릴 수 있기 때문입니다. 이런 경우에는 "로더" 작업 몇 개로 처음 배치를 시작한 뒤, 그 작업 안에서 추가 작업을 일괄 처리에 실시간으로 주입(hydrate)하게 할 수 있습니다.

```
$batch = Bus::batch([
    new LoadImportBatch,
    new LoadImportBatch,
    new LoadImportBatch,
])->then(function (Batch $batch) {
    // All jobs completed successfully...
})->name('Import Contacts')->dispatch();
```

이 예시에서 `LoadImportBatch` 작업은 실행 중에 추가 작업들을 일괄 처리에 주입하는 역할을 합니다. 이를 위해서는, 작업의 `batch` 메서드를 통해 얻을 수 있는 일괄 처리 인스턴스의 `add` 메서드를 활용합니다.

```
use App\Jobs\ImportContacts;
use Illuminate\Support\Collection;

/**
 * Execute the job.
 *
 * @return void
 */
public function handle()
{
    if ($this->batch()->cancelled()) {
        return;
    }

    $this->batch()->add(Collection::times(1000, function () {
        return new ImportContacts;
    }));
}
```

> [!NOTE]
> 같은 일괄 처리에 소속된 작업 내에서만 다른 작업을 해당 배치에 추가할 수 있습니다.

<a name="inspecting-batches"></a>
### 일괄 처리 상태 조회

일괄 처리 완료 콜백에서 전달받은 `Illuminate\Bus\Batch` 인스턴스에는, 해당 배치의 상태를 확인하거나 작업과 상호작용할 수 있는 다양한 속성과 메서드가 존재합니다.

```
// 일괄 처리의 UUID...
$batch->id;

// 일괄 처리 이름(명명한 경우)...
$batch->name;

// 일괄 처리에 할당된 작업 개수...
$batch->totalJobs;

// 아직 큐에서 처리되지 않은 작업 개수...
$batch->pendingJobs;

// 실패한 작업 개수...
$batch->failedJobs;

// 현재까지 처리된 작업 개수...
$batch->processedJobs();

// 일괄 처리의 완료 비율 (0-100)...
$batch->progress();

// 일괄 처리가 모두 끝났는지 여부...
$batch->finished();

// 일괄 처리 실행 취소...
$batch->cancel();

// 일괄 처리가 취소되었는지 여부...
$batch->cancelled();
```

<a name="returning-batches-from-routes"></a>
#### 라우트에서 일괄 처리 정보 반환하기

모든 `Illuminate\Bus\Batch` 인스턴스는 JSON 직렬화가 가능하므로, 특정 일괄 처리에 대한 정보를 라라벨 라우트에서 바로 반환해 애플리케이션 UI에 진행 상황을 표시할 수 있습니다.

일괄 처리 ID로 배치 정보를 가져오려면 `Bus` 파사드의 `findBatch` 메서드를 사용하세요.

```
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Route;

Route::get('/batch/{batchId}', function (string $batchId) {
    return Bus::findBatch($batchId);
});
```

<a name="cancelling-batches"></a>
### 일괄 처리 취소

특정 일괄 처리의 실행을 취소해야 할 때, `Illuminate\Bus\Batch` 인스턴스의 `cancel` 메서드를 호출하면 됩니다.

```
/**
 * Execute the job.
 *
 * @return void
 */
public function handle()
{
    if ($this->user->exceedsImportLimit()) {
        return $this->batch()->cancel();
    }

    if ($this->batch()->cancelled()) {
        return;
    }
}
```

앞선 예시들처럼, 일괄 처리에 포함된 작업에서는 `handle` 메서드 초반에 배치가 취소되었는지 꼭 확인하는 것이 좋습니다.

```
/**
 * Execute the job.
 *
 * @return void
 */
public function handle()
{
    if ($this->batch()->cancelled()) {
        return;
    }

    // Continue processing...
}
```

<a name="batch-failures"></a>
### 일괄 처리 오류(실패)

일괄 처리에 포함된 작업이 실패하면, (설정되어 있다면) `catch` 콜백이 호출됩니다. 이 콜백은 일괄 처리에서 처음 실패한 작업에 한해 호출됩니다.

<a name="allowing-failures"></a>
#### 작업 실패 허용 모드

기본적으로 일괄 처리 중 작업이 실패하면, 라라벨은 해당 배치를 "취소됨"으로 자동 표시합니다. 이런 동작을 비활성화하여, 일부 작업 실패 시에도 일괄 처리가 자동으로 취소되지 않도록 하려면, 배치 디스패치 시 `allowFailures` 메서드를 호출하면 됩니다.

```
$batch = Bus::batch([
    // ...
])->then(function (Batch $batch) {
    // All jobs completed successfully...
})->allowFailures()->dispatch();
```

<a name="retrying-failed-batch-jobs"></a>
#### 일괄 처리 내 실패 작업 재시도

라라벨은 배치 내에서 실패한 모든 작업을 손쉽게 재시도할 수 있도록 `queue:retry-batch` 아티즌 명령어를 제공합니다. 이 명령어는 재시도하고자 하는 배치의 UUID를 인자로 받습니다.

```bash
php artisan queue:retry-batch 32dbc76c-4f82-4749-b610-a639fe0099b5
```

<a name="pruning-batches"></a>
### 일괄 처리 데이터 정리(Pruning)

정리 작업 없이 두면 `job_batches` 테이블에 레코드가 빠르게 쌓일 수 있습니다. 이를 방지하려면, `queue:prune-batches` 아티즌 명령어를 [스케줄러](/docs/8.x/scheduling) 등을 사용해 하루 한 번 실행되도록 예약하세요.

```
$schedule->command('queue:prune-batches')->daily();
```

기본적으로, 24시간 이상 경과한 완료된 일괄 처리 데이터는 모두 정리됩니다. 정리 주기를 직접 지정하려면 `hours` 옵션을 추가하세요. 아래 예시는, 48시간이 지난 모든 완료된 배치를 삭제합니다.

```
$schedule->command('queue:prune-batches --hours=48')->daily();
```

또한, 실패한 작업을 재시도하지 않아 미완료 상태로 남아있는 배치 레코드가 쌓일 수 있는데, 이 경우 `unfinished` 옵션을 추가해 미완료 배치 데이터도 정리할 수 있습니다.

```
$schedule->command('queue:prune-batches --hours=48 --unfinished=72')->daily();
```

<a name="queueing-closures"></a>
## 클로저 작업 큐잉

작업 클래스를 만들지 않고도, 클로저를 큐에 직접 디스패치할 수 있습니다. 간단하고 빠르게 처리할 작업을 요청 처리와 별도로 실행하고자 할 때 유용합니다. 클로저를 큐잉하면, 코드 내용이 암호화 서명되어 전송 중 절대 변조되지 않습니다.

```
$podcast = App\Podcast::find(1);

dispatch(function () use ($podcast) {
    $podcast->publish();
});
```

`catch` 메서드를 활용하면, 큐잉된 클로저가 [설정된 최대 재시도 횟수](#max-job-attempts-and-timeout)까지 시도한 후에도 실패한 경우 실행할 클로저를 지정할 수 있습니다.

```
use Throwable;

dispatch(function () use ($podcast) {
    $podcast->publish();
})->catch(function (Throwable $e) {
    // 이 작업이 실패했습니다...
});
```

<a name="running-the-queue-worker"></a>
## 큐 워커 실행

<a name="the-queue-work-command"></a>
### `queue:work` 명령어

라라벨에는 큐 워커를 시작해 새 작업이 큐에 들어올 때마다 바로 처리하도록 해주는 아티즌 명령어가 제공됩니다. `queue:work` 명령어를 사용하여 워커를 실행할 수 있습니다. 이 명령어를 실행한 후에는 수동으로 중지하거나 터미널 창을 닫을 때까지 워커가 계속 동작합니다.

```
php artisan queue:work
```

> [!TIP]
> `queue:work` 프로세스를 항상 백그라운드에서 계속 실행하려면 [Supervisor](#supervisor-configuration)와 같은 프로세스 모니터를 사용하는 것이 좋습니다. 이를 통해 워커가 중단되지 않고 안정적으로 운영될 수 있습니다.

큐 워커는 애플리케이션을 메모리에 올려둔 채로 장기간 실행되는 프로세스입니다. 따라서 워커 시작 이후 코드가 변경되어도 이를 감지하지 못합니다. 배포 과정에서 반드시 [큐 워커 재시작](#queue-workers-and-deployment)을 해주어야 하며, 이와 함께 워커 간에 생성되거나 변경된 static 상태도 자동으로 초기화되지 않으니 주의하세요.

또 다른 방법으로 `queue:listen` 명령어를 사용할 수도 있습니다. 이 명령어를 사용하면 코드가 변경된 이후나 애플리케이션 상태를 리셋해야 할 때 워커를 따로 재시작하지 않아도 됩니다. 그러나 `queue:work`에 비해 효율성이 많이 떨어짐에 유의해야 합니다.

```
php artisan queue:listen
```

<a name="running-multiple-queue-workers"></a>
#### 여러 개의 큐 워커 실행

여러 워커를 큐에 할당해 동시에 작업을 처리하려면 `queue:work` 프로세스를 여러 개 동시 실행하면 됩니다. 로컬에서는 터미널을 여러 개 띄우거나, 운영 환경에서는 프로세스 관리자 설정으로 관리할 수 있습니다. [Supervisor 사용 시](#supervisor-configuration)에는 `numprocs` 설정을 참고하세요.

<a name="specifying-the-connection-queue"></a>
#### 연결 및 큐 직접 지정

큐 워커가 사용할 큐 연결(connection)을 직접 지정할 수도 있습니다. 이때 사용되는 연결명은 반드시 `config/queue.php` 설정 파일에서 정의되어 있어야 합니다.

```
php artisan queue:work redis
```

기본적으로 `queue:work` 명령어는 지정된 연결의 기본 큐의 작업만 처리합니다. 특정 큐만 선택해 처리하고 싶다면, 큐 워커를 더 세밀하게 제어할 수 있습니다. 예를 들어, 이메일 관련 작업이 `redis` 연결의 `emails` 큐에만 저장되어 있다면 아래 명령어로 해당 큐만 처리하는 워커를 띄울 수 있습니다.

```
php artisan queue:work redis --queue=emails
```

<a name="processing-a-specified-number-of-jobs"></a>
#### 지정한 개수의 작업만 처리

`--once` 옵션을 사용하면 워커가 한 건의 작업만 처리하고 종료하도록 할 수 있습니다.

```
php artisan queue:work --once
```

`--max-jobs` 옵션은 지정한 수만큼 작업을 처리한 후 워커를 종료하도록 합니다. 이 기능은 [Supervisor](#supervisor-configuration)와 함께 사용하면, 워커가 일정량의 작업을 소화한 뒤 자동으로 재시작되어 누적된 메모리를 해제할 수 있다는 장점이 있습니다.

```
php artisan queue:work --max-jobs=1000
```

<a name="processing-all-queued-jobs-then-exiting"></a>
#### 큐에 남아있는 모든 작업 처리 후 종료

`--stop-when-empty` 옵션을 사용하면 큐에 남은 모든 작업을 처리한 뒤 워커가 자연스럽게 종료됩니다. 예를 들어, Docker 컨테이너 안에서 라라벨 큐를 처리하고, 큐가 모두 비워지면 컨테이너를 종료하고자 할 때 유용합니다.

```
php artisan queue:work --stop-when-empty
```

<a name="processing-jobs-for-a-given-number-of-seconds"></a>
#### 지정한 시간 동안만 작업 처리

`--max-time` 옵션은 지정한 초(seconds) 만큼만 작업을 처리하고 워커를 종료합니다. 이 기능 역시 [Supervisor](#supervisor-configuration)와 혼합 사용 시, 오랜 기간 워커가 종료되지 않고 메모리가 누적되는 상황을 방지할 수 있습니다.

```
// 1시간 동안만 작업 처리 후 종료...
php artisan queue:work --max-time=3600
```

<a name="worker-sleep-duration"></a>
#### 워커 대기(sleep) 시간 설정

큐에 처리할 작업이 남아있을 때는 워커가 지체 없이 계속 처리하지만, 새 작업이 없으면 `sleep` 옵션에 지정한 시간(초) 동안 대기하게 됩니다. 대기 중에는 작업을 처리하지 않고, 대기 시간 종료 후 큐에 새 작업이 있으면 다시 처리합니다.

```
php artisan queue:work --sleep=3
```

<a name="resource-considerations"></a>
#### 리소스 관리 주의사항

데몬 방식 큐 워커는 각 작업 처리 전마다 프레임워크를 재시작하지 않습니다. 따라서, 작업 처리 후에는 반드시 무거운 리소스(예: GD 라이브러리를 사용한 이미지 조작)의 점유 메모리를 직접 해제해주어야 합니다. (예: 이미지 처리 후 `imagedestroy` 사용 등)

<a name="queue-priorities"></a>
### 큐 우선순위

가끔 큐 처리의 우선순위를 지정하고 싶을 수도 있습니다. 예를 들어, `config/queue.php` 설정에서 `redis` 연결의 기본 큐를 `low`로 지정해놓고, 매우 우선 처리해야 하는 작업은 다음과 같이 `high`라는 별도 큐로 보낼 수 있습니다.

```
dispatch((new Job)->onQueue('high'));
```

`high` 큐의 작업이 모두 처리된 후에만 `low` 큐 작업을 처리하고 싶다면, 큐 이름들을 쉼표로 구분해서 `work` 명령어에 지정하면 됩니다.

```
php artisan queue:work --queue=high,low
```

<a name="queue-workers-and-deployment"></a>
### 큐 워커와 배포(Deployment)

큐 워커는 장시간 실행되는 프로세스이므로, 코드에 변경이 생겨도 워커를 재시작하지 않으면 새로운 변경을 감지하지 못합니다. 따라서, 큐 워커를 사용하는 애플리케이션을 배포할 때는 워커를 함께 재시작해야 합니다. `queue:restart` 명령어를 실행하면 실행 중인 모든 워커에 현재 처리 중인 작업을 끝낸 후 종료하라는 신호를 보냅니다.

```
php artisan queue:restart
```

이 명령어는 실행 중인 모든 큐 워커에게 안전하게 현재 작업만 마치면 종료하도록 지시하므로, 작업 유실 없이 코드 변경을 반영할 수 있습니다. 큐 워커 종료 후 자동 재시작이 필요하므로, [Supervisor](#supervisor-configuration) 같은 프로세스 매니저를 꼭 함께 운영해야 합니다.

> [!TIP]
> 큐 시스템은 [캐시](/docs/8.x/cache)를 사용해 재시작 신호를 저장하므로, 애플리케이션에 반드시 적절한 캐시 드라이버가 설정되어 있는지 확인하세요.

<a name="job-expirations-and-timeouts"></a>
### 작업 만료 및 타임아웃

<a name="job-expiration"></a>
#### 작업 만료

`config/queue.php` 설정 파일의 각 큐 연결에는 `retry_after` 옵션이 있습니다. 이 옵션은 작업이 처리 중일 때, 몇 초가 지나면 재시도를 시작할지 결정합니다. 예를 들어 `retry_after`가 90으로 설정되어 있다면, 90초 동안 작업이 완료되지 않으면 해당 작업이 다시 큐로 반환됩니다. 보통 이 값은 작업이 원활하게 처리되는 최대 시간(초)으로 설정하는 것이 좋습니다.

> [!NOTE]
> Amazon SQS 큐 연결만은 `retry_after` 값이 없습니다. SQS는 [기본 가시성 제한(Default Visibility Timeout)](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/AboutVT.html) 값에 따라 동작하며, 이는 AWS 콘솔에서 관리할 수 있습니다.

<a name="worker-timeouts"></a>
#### 워커 타임아웃

`queue:work` 아티즌 명령어는 `--timeout` 옵션을 제공합니다. 지정한 시간(초) 이상 작업 처리가 진행되면 워커가 오류와 함께 종료됩니다. 일반적으로, [서버에 구성한 프로세스 매니저](#supervisor-configuration)가 워커를 자동 재시작하게 됩니다.

```bash
php artisan queue:work --timeout=60
```

`retry_after` 설정값과 `--timeout` CLI 옵션은 서로 다른 목적이지만, 하나는 작업 손실 방지(재시도), 다른 하나는 작업 단일성 보장(중복 방지)을 위해 함께 작동합니다.

> [!NOTE]
> `--timeout` 값은 항상 `retry_after` 값보다 몇 초 이상 짧게 설정해야 안전합니다. 그래야 워커가 멈춰있는 작업을 항상 재시도 전에 강제 종료할 수 있습니다. 만약 `--timeout`이 `retry_after`보다 길 경우, 작업이 중복 실행될 위험이 있습니다.

<a name="supervisor-configuration"></a>
## Supervisor 설정

운영 환경에서는 `queue:work` 프로세스를 항상 실행되도록 관리해야 합니다. `queue:work` 프로세스는 워커 타임아웃이 초과되거나, `queue:restart` 명령이 실행되는 등 다양한 이유로 종료될 수 있습니다.

따라서, 프로세스가 종료되었을 때 이를 감지해서 자동으로 재시작해주는 프로세스 모니터링 툴이 필요합니다. 뿐만 아니라, 프로세스 모니터를 이용하면 동시에 여러 개의 `queue:work` 프로세스를 원하는 만큼 실행할 수도 있습니다. Supervisor는 리눅스 환경에서 가장 널리 사용되는 프로세스 모니터이며, 아래 문서에서 Supervisor 설정 방법에 대해 살펴보겠습니다.

<a name="installing-supervisor"></a>

#### Supervisor 설치하기

Supervisor는 리눅스 운영체제용 프로세스 모니터링 툴로, `queue:work` 프로세스가 실패하면 자동으로 재시작해줍니다. Ubuntu에서 Supervisor를 설치하려면 다음 명령어를 사용합니다.

```
sudo apt-get install supervisor
```

> [!TIP]
> Supervisor 설치와 관리를 직접 하는 것이 부담스럽다면, [Laravel Forge](https://forge.laravel.com) 서비스를 고려해보세요. Forge를 사용하면 Laravel 프로덕션 프로젝트에 Supervisor를 자동으로 설치하고 설정해줍니다.

<a name="configuring-supervisor"></a>
#### Supervisor 설정하기

Supervisor 설정 파일은 보통 `/etc/supervisor/conf.d` 디렉터리에 저장됩니다. 이 디렉터리 안에, 감시할 프로세스에 대한 Supervisor 설정 파일을 원하는 만큼 생성할 수 있습니다. 예를 들어, `queue:work` 프로세스를 시작하고 감시하는 `laravel-worker.conf` 파일을 아래와 같이 작성할 수 있습니다.

```ini
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /home/forge/app.com/artisan queue:work sqs --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=forge
numprocs=8
redirect_stderr=true
stdout_logfile=/home/forge/app.com/worker.log
stopwaitsecs=3600
```

이 예시에서 `numprocs` 지시어는 Supervisor에게 8개의 `queue:work` 프로세스를 실행하고 모두 감시하도록 지시합니다. 만약 프로세스가 실패하면 Supervisor가 즉시 재시작합니다. 실제로 사용할 큐 연결 설정과 워커 옵션에 맞게 `command` 옵션을 변경해주어야 합니다.

> [!NOTE]
> `stopwaitsecs`의 값이 가장 오래 실행되는 작업의 소요 시간(초)보다 커야 합니다. 그렇지 않으면 Supervisor가 작업이 끝나기 전에 프로세스를 종료할 수 있습니다.

<a name="starting-supervisor"></a>
#### Supervisor 시작하기

설정 파일을 만들었으면, 아래 명령어로 Supervisor 설정을 갱신하고, 프로세스를 시작할 수 있습니다.

```bash
sudo supervisorctl reread

sudo supervisorctl update

sudo supervisorctl start laravel-worker:*
```

Supervisor에 대한 더 자세한 내용은 [Supervisor 공식 문서](http://supervisord.org/index.html)를 참고하세요.

<a name="dealing-with-failed-jobs"></a>
## 실패한 작업 처리하기

가끔 큐잉된 작업이 실패할 수도 있습니다. 걱정하지 마세요. 언제나 모든 일이 계획대로 되는 것은 아니니까요! Laravel은 [작업이 시도할 최대 횟수](#max-job-attempts-and-timeout)를 지정하는 편리한 방법을 제공합니다. 이 횟수를 초과해서 작업이 계속 실패하면, 해당 작업은 `failed_jobs` 데이터베이스 테이블에 기록됩니다. 이 테이블이 아직 없다면 직접 만들어야 합니다. `failed_jobs` 테이블을 위한 마이그레이션을 생성하려면 `queue:failed-table` 명령을 사용하세요.

```
php artisan queue:failed-table

php artisan migrate
```

[queue worker](#running-the-queue-worker) 프로세스를 실행할 때, `queue:work` 명령어의 `--tries` 옵션을 사용해 한 작업당 최대 시도 횟수를 지정할 수 있습니다. 만약 `--tries` 옵션을 직접 설정하지 않으면, 작업은 한 번만 시도되거나 작업 클래스의 `$tries` 속성에 지정된 만큼만 시도됩니다.

```
php artisan queue:work redis --tries=3
```

`--backoff` 옵션을 사용하면, 예외가 발생한 작업을 재시도하기 전에 Laravel이 기다릴 시간을 초 단위로 지정할 수 있습니다. 기본값은 작업이 예외 발생 즉시 다시 큐에 올려서 즉시 재시도합니다.

```
php artisan queue:work redis --tries=3 --backoff=3
```

작업별로 예외 발생 시 재시도 전 대기 시간을 각기 다르게 지정하고 싶다면, 작업 클래스에 `backoff` 속성을 정의할 수 있습니다.

```
/**
 * 작업을 재시도하기 전에 기다릴 시간(초)
 *
 * @var int
 */
public $backoff = 3;
```

좀 더 복잡한 재시도 간격이 필요하다면, 작업 클래스에 `backoff` 메서드를 정의해 동적으로 대기 시간을 반환할 수 있습니다.

```
/**
* 작업을 재시도하기 전에 기다릴 시간을 계산합니다.
*
* @return int
*/
public function backoff()
{
    return 3;
}
```

"지수 형태"의 재시도 대기 시간을 지정하려면, `backoff` 메서드가 대기 시간 배열을 반환하게 만들면 됩니다. 아래 예시에서 첫 번째 재시도는 1초, 두 번째는 5초, 세 번째는 10초 대기 후 시도합니다.

```
/**
* 작업을 재시도하기 전에 기다릴 시간(초)을 배열로 반환합니다.
*
* @return array
*/
public function backoff()
{
    return [1, 5, 10];
}
```

<a name="cleaning-up-after-failed-jobs"></a>
### 실패한 작업 후 처리

특정 작업이 실패할 경우, 사용자에게 알림을 전송하거나, 작업이 일부만 완료한 경우 취소 또는 롤백 같은 추가 처리가 필요할 수 있습니다. 이런 경우 작업 클래스에 `failed` 메서드를 정의할 수 있습니다. 작업이 실패한 원인이 담긴 `Throwable` 인스턴스가 `failed` 메서드에 전달됩니다.

```
<?php

namespace App\Jobs;

use App\Models\Podcast;
use App\Services\AudioProcessor;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

class ProcessPodcast implements ShouldQueue
{
    use InteractsWithQueue, Queueable, SerializesModels;

    /**
     * 팟캐스트 인스턴스
     *
     * @var \App\Podcast
     */
    protected $podcast;

    /**
     * 새 작업 인스턴스를 생성합니다.
     *
     * @param  \App\Models\Podcast  $podcast
     * @return void
     */
    public function __construct(Podcast $podcast)
    {
        $this->podcast = $podcast;
    }

    /**
     * 작업 실행 메서드
     *
     * @param  \App\Services\AudioProcessor  $processor
     * @return void
     */
    public function handle(AudioProcessor $processor)
    {
        // 업로드된 팟캐스트 처리 작업...
    }

    /**
     * 작업 실패 시 실행 메서드
     *
     * @param  \Throwable  $exception
     * @return void
     */
    public function failed(Throwable $exception)
    {
        // 실패 알림 전송 등 처리...
    }
}
```

> [!NOTE]
> `failed` 메서드를 호출하기 전에 작업 인스턴스가 새로 생성되기 때문에, `handle` 메서드에서 변경한 클래스 속성 값은 사라집니다.

<a name="retrying-failed-jobs"></a>
### 실패한 작업 재시도하기

`failed_jobs` 데이터베이스 테이블에 기록된 모든 실패한 작업을 조회하려면, `queue:failed` 아티즌 명령어를 사용할 수 있습니다.

```
php artisan queue:failed
```

`queue:failed` 명령은 작업 ID, 연결명, 큐명, 실패 시간 등 다양한 정보를 보여줍니다. 여기에서 확인한 작업 ID를 사용해, 해당 작업을 개별적으로 재시도할 수 있습니다. 예를 들어, ID가 `ce7bb17c-cdd8-41f0-a8ec-7b4fef4e5ece`인 실패한 작업을 재시도하려면 다음과 같이 명령어를 입력합니다.

```
php artisan queue:retry ce7bb17c-cdd8-41f0-a8ec-7b4fef4e5ece
```

필요하다면 ID 여러 개를 동시에 인자로 넘겨 여러 작업을 한꺼번에 재시도할 수도 있습니다.

```
php artisan queue:retry ce7bb17c-cdd8-41f0-a8ec-7b4fef4e5ece 91401d2c-0784-4f43-824c-34f94a33c24d
```

특정 큐의 모든 실패한 작업만을 재시도하려면 다음과 같이 하면 됩니다.

```
php artisan queue:retry --queue=name
```

모든 실패한 작업을 재시도하려면, ID 대신 `all`을 넘겨 실행하세요.

```
php artisan queue:retry all
```

실패한 작업을 삭제하려면, `queue:forget` 명령을 사용할 수 있습니다.

```
php artisan queue:forget 91401d2c-0784-4f43-824c-34f94a33c24d
```

> [!TIP]
> [Horizon](/docs/8.x/horizon)을 사용하는 경우, `queue:forget` 대신 `horizon:forget` 명령어로 실패한 작업을 삭제하세요.

`failed_jobs` 테이블에 있는 모든 실패한 작업을 한꺼번에 삭제하려면, `queue:flush` 명령을 실행하세요.

```
php artisan queue:flush
```

<a name="ignoring-missing-models"></a>
### 존재하지 않는 모델 무시하기

Eloquent 모델 인스턴스를 작업에 주입하는 경우, 작업이 큐에 올라갈 땐 모델이 직렬화되고, 작업이 처리될 때 데이터베이스에서 다시 조회됩니다. 하지만 만약 작업이 대기 중인 사이 모델이 삭제되었다면, 이 작업은 `ModelNotFoundException`으로 실패하게 됩니다.

이런 경우, 작업 클래스의 `deleteWhenMissingModels` 속성을 `true`로 설정하면, 존재하지 않는 모델이 걸린 작업을 자동으로 조용히 삭제할 수 있습니다. 해당 작업은 예외를 발생시키지 않고 자동으로 폐기됩니다.

```
/**
 * 관련 모델이 존재하지 않을 경우 작업을 삭제합니다.
 *
 * @var bool
 */
public $deleteWhenMissingModels = true;
```

<a name="pruning-failed-jobs"></a>
### 실패한 작업 정리하기

`queue:prune-failed` 아티즌 명령어를 사용해 애플리케이션의 `failed_jobs` 테이블에 있는 모든 레코드를 삭제할 수 있습니다.

```
php artisan queue:prune-failed
```

명령어에 `--hours` 옵션을 추가하면, 최근 N시간 이내에 입력된 실패 작업만 남기고 그 이전 데이터만 삭제할 수 있습니다. 예를 들어, 아래 명령은 48시간 이전에 기록된 모든 실패 작업을 삭제합니다.

```
php artisan queue:prune-failed --hours=48
```

<a name="storing-failed-jobs-in-dynamodb"></a>
### 실패한 작업을 DynamoDB에 저장하기

Laravel은 실패한 작업 기록을 관계형 데이터베이스 테이블 대신 [DynamoDB](https://aws.amazon.com/dynamodb)에 저장하는 것도 지원합니다. 이를 위해서는 실패한 작업 레코드를 저장할 DynamoDB 테이블을 미리 생성해야 합니다. 이 테이블의 기본값 추천 이름은 `failed_jobs`이지만, 실제로는 애플리케이션 설정 파일 내 `queue.failed.table` 값에 맞게 지정하면 됩니다.

`failed_jobs` 테이블은 문자열 타입의 기본 파티션 키 `application`과 문자열 타입의 기본 소트 키 `uuid`를 가져야 합니다. `application` 값에는 애플리케이션 설정 파일의 `name` 값이 들어갑니다. 따라서 여러 Laravel 애플리케이션의 실패 작업을 한 테이블에 구분하여 저장할 수 있습니다.

또한, Laravel 애플리케이션이 Amazon DynamoDB와 통신할 수 있도록 AWS SDK를 설치해야 합니다.

```nothing
composer require aws/aws-sdk-php
```

그 다음, 설정 파일에서 `queue.failed.driver` 옵션을 `dynamodb`로 지정해야 합니다. 추가로, 실패 작업 설정 배열에 `key`, `secret`, `region` 값을 지정해야 하며, 이는 AWS 인증에 사용됩니다. `dynamodb` 드라이버를 사용할 때는 `queue.failed.database` 옵션을 설정할 필요가 없습니다.

```php
'failed' => [
    'driver' => env('QUEUE_FAILED_DRIVER', 'dynamodb'),
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    'table' => 'failed_jobs',
],
```

<a name="disabling-failed-job-storage"></a>
### 실패한 작업 저장 비활성화

실패한 작업을 저장하지 않고 바로 폐기하고 싶다면, 설정에서 `queue.failed.driver` 값에 `null`을 지정하면 됩니다. 일반적으로는 환경 변수 `QUEUE_FAILED_DRIVER`로 설정할 수 있습니다.

```
QUEUE_FAILED_DRIVER=null
```

<a name="failed-job-events"></a>
### 실패한 작업 이벤트 수신

작업이 실패했을 때 호출되는 이벤트 리스너를 등록하려면, `Queue` 파사드의 `failing` 메서드를 사용할 수 있습니다. 예를 들어, Laravel에 포함된 `AppServiceProvider`의 `boot` 메서드에서 아래처럼 이벤트 리스너를 등록할 수 있습니다.

```
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Queue;
use Illuminate\Support\ServiceProvider;
use Illuminate\Queue\Events\JobFailed;

class AppServiceProvider extends ServiceProvider
{
    /**
     * 애플리케이션 서비스 등록
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * 애플리케이션 서비스 부트스트랩
     *
     * @return void
     */
    public function boot()
    {
        Queue::failing(function (JobFailed $event) {
            // $event->connectionName
            // $event->job
            // $event->exception
        });
    }
}
```

<a name="clearing-jobs-from-queues"></a>
## 큐에서 작업 모두 지우기

> [!TIP]
> [Horizon](/docs/8.x/horizon)을 사용하는 경우, 작업을 비울 때는 `queue:clear` 대신 `horizon:clear` 명령을 사용하세요.

기본 연결의 기본 큐에서 모든 작업을 삭제하려면 `queue:clear` 아티즌 명령어를 사용합니다.

```
php artisan queue:clear
```

특정 연결 및 큐의 작업만 삭제하고 싶다면, 인수로 `connection`을, 옵션으로 `queue`를 지정할 수 있습니다.

```
php artisan queue:clear redis --queue=emails
```

> [!NOTE]
> 큐에서 작업 모두 삭제하기 기능은 SQS, Redis, 데이터베이스 큐 드라이버에서만 사용할 수 있습니다. 또한 SQS의 메시지 삭제 과정은 최대 60초가 걸릴 수 있어, 명령 실행 후 60초간 SQS 큐에 들어온 작업도 함께 삭제될 수 있습니다.

<a name="monitoring-your-queues"></a>
## 큐 모니터링하기

큐에 갑자기 많은 작업이 밀려오면, 큐가 과부하되어 작업이 완료되기까지 오래 기다릴 수 있습니다. Laravel은 큐에 쌓인 작업이 특정 임계값을 넘을 경우 알림을 받을 수 있도록 지원합니다.

먼저, [매 분마다 실행](/docs/8.x/scheduling)되도록 `queue:monitor` 명령어를 스케줄링해야 합니다. 이 명령은 모니터링할 큐 이름과 원하는 작업 수 임계값을 인자로 받습니다.

```bash
php artisan queue:monitor redis:default,redis:deployments --max=100
```

이 명령만 단독으로 스케줄하면 알림이 자동 발송되지는 않습니다. 큐의 작업 수가 임계값을 넘을 때마다 `Illuminate\Queue\Events\QueueBusy` 이벤트가 발생합니다. 이 이벤트를 앱의 `EventServiceProvider`에서 수신하여 원하는 대로(예: 개발팀에게 알림 발송) 처리할 수 있습니다.

```php
use App\Notifications\QueueHasLongWaitTime;
use Illuminate\Queue\Events\QueueBusy;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;

/**
 * 애플리케이션용 기타 이벤트 등록
 *
 * @return void
 */
public function boot()
{
    Event::listen(function (QueueBusy $event) {
        Notification::route('mail', 'dev@example.com')
                ->notify(new QueueHasLongWaitTime(
                    $event->connection,
                    $event->queue,
                    $event->size
                ));
    });
}
```

<a name="job-events"></a>
## 작업 이벤트

`Queue` [파사드](/docs/8.x/facades)의 `before`, `after` 메서드를 이용해, 큐잉된 작업이 실행되기 전후에 호출할 콜백을 지정할 수 있습니다. 이 방법을 사용하면 추가적인 로그를 남기거나, 대시보드 통계를 위한 값을 증가시키는 등 다양한 부가 처리를 쉽게 할 수 있습니다. 보통 이러한 코드는 [서비스 프로바이더](/docs/8.x/providers)의 `boot` 메서드에서 호출하는 것이 좋습니다. 아래 예시처럼, Laravel에 포함된 `AppServiceProvider`를 사용할 수 있습니다.

```
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Queue;
use Illuminate\Support\ServiceProvider;
use Illuminate\Queue\Events\JobProcessed;
use Illuminate\Queue\Events\JobProcessing;

class AppServiceProvider extends ServiceProvider
{
    /**
     * 애플리케이션 서비스 등록
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * 애플리케이션 서비스 부트스트랩
     *
     * @return void
     */
    public function boot()
    {
        Queue::before(function (JobProcessing $event) {
            // $event->connectionName
            // $event->job
            // $event->job->payload()
        });

        Queue::after(function (JobProcessed $event) {
            // $event->connectionName
            // $event->job
            // $event->job->payload()
        });
    }
}
```

`Queue` [파사드](/docs/8.x/facades)의 `looping` 메서드를 사용하면 워커가 큐에서 작업을 가져오기 전에 실행할 콜백을 지정할 수도 있습니다. 예를 들어, 이전 작업 실패로 열린 트랜잭션이 남아 있다면 이 콜백에서 롤백 처리를 할 수 있습니다.

```
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;

Queue::looping(function () {
    while (DB::transactionLevel() > 0) {
        DB::rollBack();
    }
});
```