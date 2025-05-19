# 큐 (Queues)

- [소개](#introduction)
    - [커넥션과 큐의 차이](#connections-vs-queues)
    - [드라이버별 참고 사항 및 사전 준비](#driver-prerequisites)
- [잡 생성하기](#creating-jobs)
    - [잡 클래스 생성](#generating-job-classes)
    - [클래스 구조](#class-structure)
    - [유니크 잡(Unique Jobs)](#unique-jobs)
- [잡 미들웨어](#job-middleware)
    - [속도 제한(Rate Limiting)](#rate-limiting)
    - [잡 중복 실행 방지](#preventing-job-overlaps)
    - [예외 제한(Throttling Exceptions)](#throttling-exceptions)
- [잡 디스패치(Dispatching)](#dispatching-jobs)
    - [지연 디스패치](#delayed-dispatching)
    - [동기 디스패치](#synchronous-dispatching)
    - [잡과 데이터베이스 트랜잭션](#jobs-and-database-transactions)
    - [잡 체이닝](#job-chaining)
    - [큐 및 커넥션 커스터마이즈](#customizing-the-queue-and-connection)
    - [최대 시도 횟수/타임아웃 값 지정](#max-job-attempts-and-timeout)
    - [에러 처리](#error-handling)
- [잡 배치 처리(Job Batching)](#job-batching)
    - [배치 가능한 잡 정의](#defining-batchable-jobs)
    - [배치 디스패치](#dispatching-batches)
    - [잡을 배치에 추가하기](#adding-jobs-to-batches)
    - [배치 조회](#inspecting-batches)
    - [배치 취소](#cancelling-batches)
    - [배치 실패](#batch-failures)
    - [배치 정리(Pruning)](#pruning-batches)
- [클로저 큐잉](#queueing-closures)
- [큐 워커 실행](#running-the-queue-worker)
    - [`queue:work` 명령어](#the-queue-work-command)
    - [큐 우선순위](#queue-priorities)
    - [큐 워커와 배포](#queue-workers-and-deployment)
    - [잡 만료 및 타임아웃](#job-expirations-and-timeouts)
- [Supervisor 설정](#supervisor-configuration)
- [실패한 잡 처리](#dealing-with-failed-jobs)
    - [실패 잡 후처리](#cleaning-up-after-failed-jobs)
    - [실패 잡 재시도](#retrying-failed-jobs)
    - [누락된 모델 무시](#ignoring-missing-models)
    - [실패 잡 정리(Pruning)](#pruning-failed-jobs)
    - [DynamoDB에 실패 잡 저장](#storing-failed-jobs-in-dynamodb)
    - [실패 잡 저장 비활성화](#disabling-failed-job-storage)
    - [실패 잡 이벤트](#failed-job-events)
- [큐에서 잡 삭제](#clearing-jobs-from-queues)
- [큐 모니터링](#monitoring-your-queues)
- [잡 이벤트](#job-events)

<a name="introduction"></a>
## 소개

웹 애플리케이션을 개발하다 보면, 업로드된 CSV 파일을 파싱하고 저장하는 작업처럼 일반적인 웹 요청 내에서 처리하기에는 시간이 오래 걸리는 작업이 있을 수 있습니다. 다행히 라라벨은 이러한 작업을 손쉽게 백그라운드에서 처리할 수 있는 큐 잡(queued job)으로 만들 수 있게 해줍니다. 시간이 많이 소요되는 작업을 큐로 분리하면, 애플리케이션은 웹 요청에 매우 빠르게 응답할 수 있어 사용자 경험을 크게 향상시킬 수 있습니다.

라라벨 큐는 [Amazon SQS](https://aws.amazon.com/sqs/), [Redis](https://redis.io) 또는 관계형 데이터베이스 등 다양한 큐 백엔드를 아우르는 통합된 큐 API를 제공합니다.

라라벨 큐 관련 설정 옵션은 애플리케이션의 `config/queue.php` 설정 파일에 저장되어 있습니다. 이 파일에는 데이터베이스, [Amazon SQS](https://aws.amazon.com/sqs/), [Redis](https://redis.io), [Beanstalkd](https://beanstalkd.github.io/) 드라이버 및 바로 실행되는 동기식 드라이버(로컬 개발 환경용), 그리고 큐에 추가된 잡을 단순히 무시하는 `null` 드라이버 등 프레임워크에 포함된 각 큐 드라이버의 커넥션 설정이 들어 있습니다.

> [!NOTE]
> 라라벨에서는 Redis 기반 큐를 관리할 수 있는 아름다운 대시보드 및 설정 도구인 Horizon을 제공합니다. 자세한 내용은 [Horizon 문서](/docs/9.x/horizon)를 참고하세요.

<a name="connections-vs-queues"></a>
### 커넥션과 큐의 차이

라라벨 큐를 사용하기 전에 "커넥션(connection)"과 "큐(queue)"의 차이를 이해하는 것이 중요합니다. `config/queue.php` 설정 파일의 `connections` 배열에서는 Amazon SQS, Beanstalk, Redis 등 백엔드 큐 서비스와의 커넥션을 정의합니다. 이때, 하나의 큐 커넥션에는 여러 개의 "큐"를 둘 수 있으며, 각각 다른 잡의 집합 또는 작업 목록처럼 생각할 수 있습니다.

각 커넥션 설정 예시에는 `queue` 속성이 포함되어 있습니다. 이는 해당 커넥션으로 디스패치되는 잡이 기본적으로 들어갈 큐를 의미합니다. 즉, 어떤 잡을 명시적으로 어느 큐에 넣을지 지정하지 않고 디스패치하면, 해당 커넥션 설정의 `queue` 속성에 지정된 큐에 잡이 추가됩니다.

```
use App\Jobs\ProcessPodcast;

// 이 잡은 기본 커넥션의 기본 큐로 전송됩니다...
ProcessPodcast::dispatch();

// 이 잡은 기본 커넥션의 "emails" 큐로 전송됩니다...
ProcessPodcast::dispatch()->onQueue('emails');
```

일부 애플리케이션은 굳이 여러 큐를 사용할 필요 없이 단순히 하나의 큐만 사용할 수도 있습니다. 하지만 잡을 우선순위에 따라 나누어 처리해야 하거나 잡의 성격별로 분리해 관리하고 싶을 때는 여러 큐로 분류하는 것이 매우 유용합니다. 라라벨 큐 워커는 어떤 큐를 우선적으로 처리할지 지정할 수 있기 때문입니다. 예를 들어, `high` 큐에 잡을 푸시한 경우, 다음과 같이 해당 큐에 높은 우선순위를 줄 수 있습니다.

```shell
php artisan queue:work --queue=high,default
```

<a name="driver-prerequisites"></a>
### 드라이버별 참고 사항 및 사전 준비

<a name="database"></a>
#### 데이터베이스

`database` 큐 드라이버를 사용하려면 잡을 저장할 데이터베이스 테이블이 필요합니다. 이 테이블 생성을 위한 마이그레이션 파일은 `queue:table` 아티즌 명령어로 생성할 수 있습니다. 마이그레이션 파일을 생성한 후, `migrate` 명령어로 데이터베이스를 실제로 마이그레이션해 주세요.

```shell
php artisan queue:table

php artisan migrate
```

마지막으로, 애플리케이션의 `.env` 파일에서 `QUEUE_CONNECTION` 변수를 `database`로 설정해 해당 드라이버를 사용하도록 지정하는 것을 잊지 마세요.

```
QUEUE_CONNECTION=database
```

<a name="redis"></a>
#### Redis

`redis` 큐 드라이버를 사용하려면, `config/database.php` 설정 파일에서 Redis 데이터베이스 커넥션을 설정해야 합니다.

**Redis 클러스터**

Redis 큐 커넥션이 Redis 클러스터를 사용하는 경우, 반드시 큐 이름에 [키 해시 태그(key hash tag)](https://redis.io/docs/reference/cluster-spec/#hash-tags)를 포함해야 합니다. 이렇게 하면 해당 큐에 사용되는 모든 Redis 키가 같은 해시 슬롯에 배치되어 클러스터 간 올바르게 동작합니다.

```
'redis' => [
    'driver' => 'redis',
    'connection' => 'default',
    'queue' => '{default}',
    'retry_after' => 90,
],
```

**블로킹(Blocking)**

Redis 큐를 사용할 때, `block_for` 설정 옵션을 통해 드라이버가 새로운 잡이 대기열에 들어오기까지 얼마나 오래 기다릴지(블로킹할지)를 지정할 수 있습니다. 이 값은 큐의 트래픽 상황에 맞춰 조절하면, 새로운 잡을 위해 Redis를 계속 폴링하는 것보다 더 효율적일 수 있습니다. 예를 들어, 값을 `5`로 지정하면 잡이 들어올 때까지 5초간 대기하게 됩니다.

```
'redis' => [
    'driver' => 'redis',
    'connection' => 'default',
    'queue' => 'default',
    'retry_after' => 90,
    'block_for' => 5,
],
```

> [!WARNING]
> `block_for` 값을 `0`으로 지정하면 작업자가 잡이 들어올 때까지 무한정 블로킹됩니다. 이 경우, 잡을 처리할 때까지 `SIGTERM`과 같은 시그널이 처리되지 않을 수 있으니 주의하세요.

<a name="other-driver-prerequisites"></a>
#### 기타 드라이버 사전 준비

아래의 큐 드라이버를 사용하려면 다음과 같은 의존성을 Composer 패키지 매니저로 설치해야 합니다.

<div class="content-list" markdown="1">

- Amazon SQS: `aws/aws-sdk-php ~3.0`
- Beanstalkd: `pda/pheanstalk ~4.0`
- Redis: `predis/predis ~1.0` 또는 phpredis PHP 확장

</div>

<a name="creating-jobs"></a>
## 잡 생성하기

<a name="generating-job-classes"></a>
### 잡 클래스 생성

기본적으로, 애플리케이션의 모든 큐 가능한 잡 클래스는 `app/Jobs` 디렉터리에 저장됩니다. 만약 `app/Jobs` 디렉터리가 없다면, `make:job` 아티즌 명령어를 실행할 때 자동으로 생성됩니다.

```shell
php artisan make:job ProcessPodcast
```

위 명령어로 생성되는 클래스는 `Illuminate\Contracts\Queue\ShouldQueue` 인터페이스를 구현합니다. 이로써 라라벨은 해당 잡이 큐에 넣어져 비동기로 실행되어야 함을 인식하게 됩니다.

> [!NOTE]
> 잡 클래스 생성에 사용되는 스텁(stub)은 [스텁 퍼블리싱](/docs/9.x/artisan#stub-customization)을 통해 커스터마이즈할 수 있습니다.

<a name="class-structure"></a>
### 클래스 구조

잡 클래스는 일반적으로 매우 간단하며, 큐에서 잡이 처리될 때 호출되는 `handle` 메서드만을 포함하고 있습니다. 먼저, 팟캐스트 퍼블리싱 서비스를 운영하며 업로드된 팟캐스트 파일을 공개 전에 처리해야 하는 상황을 예시로 살펴보겠습니다.

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
    public $podcast;

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

위 예시에서 보듯이, [Eloquent 모델](/docs/9.x/eloquent)을 큐 잡의 생성자에 직접 전달할 수 있습니다. `SerializesModels` 트레이트 덕분에, Eloquent 모델과 그 연관된 데이터(관계)가 큐에 잡이 들어가거나 꺼내질 때 자동으로 직렬화 및 역직렬화 처리됩니다.

큐 잡의 생성자에서 Eloquent 모델을 받는 경우, 모델의 식별자만이 큐에 직렬화되어 저장됩니다. 실제로 잡이 처리될 때에는 큐 시스템이 데이터베이스에서 해당 모델 인스턴스와 관계들을 다시 조회해옵니다. 이런 방식의 모델 직렬화는 잡 페이로드를 훨씬 작게 만들어줍니다.

<a name="handle-method-dependency-injection"></a>
#### `handle` 메서드 의존성 주입

`handle` 메서드는 큐가 잡을 처리할 때 호출됩니다. 이 메서드에 타입힌트로 의존성을 선언하면, 라라벨 [서비스 컨테이너](/docs/9.x/container)가 자동으로 주입해줍니다.

만약 컨테이너가 `handle` 메서드의 의존성을 주입하는 방식을 직접 제어하고 싶다면, 컨테이너의 `bindMethod` 메서드를 활용하면 됩니다. `bindMethod`는 콜백을 받아, 콜백 내에서 잡과 컨테이너를 원하는 방식으로 직접 처리할 수 있습니다. 이 코드는 보통 `App\Providers\AppServiceProvider`의 `boot` 메서드(예: [서비스 프로바이더](/docs/9.x/providers))에서 실행합니다.

```
use App\Jobs\ProcessPodcast;
use App\Services\AudioProcessor;

$this->app->bindMethod([ProcessPodcast::class, 'handle'], function ($job, $app) {
    return $job->handle($app->make(AudioProcessor::class));
});
```

> [!WARNING]
> 바이너리 데이터(예: 원시 이미지 파일 등)는 큐 잡에 전달하기 전에 반드시 `base64_encode` 함수를 이용해 인코딩해야 합니다. 그렇지 않으면 잡이 큐에 직렬화될 때 JSON 형태로 제대로 저장되지 않을 수 있습니다.

<a name="handling-relationships"></a>
#### 큐에서의 연관관계(relationships) 처리

로딩된 관계 데이터도 함께 직렬화되기 때문에, 경우에 따라 직렬화되는 잡 문자열이 너무 커질 수 있습니다. 이럴 때는 모델의 속성을 설정할 때 `withoutRelations` 메서드를 호출하면, 관계 정보 없이(즉, 해당 모델 인스턴스만 남도록) 모델이 반환됩니다.

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

또한, 잡이 역직렬화되어 모델의 연관관계가 DB에서 다시 조회될 때는 전체 관계 데이터가 모두 로드됩니다. 즉, 잡이 큐에 들어가기 전에 적용했던 특정 연관관계 필터(제약 조건)는 잡이 역직렬화될 때 더 이상 적용되지 않습니다. 따라서 특정 관계의 일부분만 사용하고 싶을 때는, 잡 클래스 내에서 직접 해당 관계에 대한 제약 조건을 다시 지정해야 합니다.

<a name="unique-jobs"></a>
### 유니크 잡(Unique Jobs)

> [!WARNING]
> 유니크 잡 기능은 [락을 지원하는 캐시 드라이버](/docs/9.x/cache#atomic-locks)가 필요합니다. 현재 `memcached`, `redis`, `dynamodb`, `database`, `file`, `array` 캐시 드라이버가 원자적(atomic) 락을 지원합니다. 또한, 유니크 잡 제한 기능은 배치 내의 잡에는 적용되지 않습니다.

특정 잡이 큐에 동시에 하나만 존재하도록 보장하고 싶을 때가 있습니다. 이럴 때는 잡 클래스에 `ShouldBeUnique` 인터페이스를 구현하면 됩니다. 추가 메서드 구현은 필요 없습니다.

```
<?php

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Contracts\Queue\ShouldBeUnique;

class UpdateSearchIndex implements ShouldQueue, ShouldBeUnique
{
    ...
}
```

위 예시의 `UpdateSearchIndex` 잡은 고유(유니크) 잡입니다. 즉, 동일한 잡이 아직 큐에 남아 있고 처리가 끝나지 않았다면, 새로이 잡이 디스패치되지 않습니다.

특정 "키"로 잡의 유니크함을 지정하고 싶거나, 유니크 상태 유지 기간을 따로 지정하고 싶을 때는, 잡 클래스에 `uniqueId` 및 `uniqueFor` 프로퍼티(또는 메서드)를 정의할 수 있습니다.

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
     * The number of seconds after which the job's unique lock will be released.
     *
     * @var int
     */
    public $uniqueFor = 3600;

    /**
     * The unique ID of the job.
     *
     * @return string
     */
    public function uniqueId()
    {
        return $this->product->id;
    }
}
```

위 예시에서 `UpdateSearchIndex` 잡은 상품 ID 기준으로 유니크합니다. 즉, 동일한 상품 ID가 주어진 상태로 잡이 다시 디스패치될 경우, 기존 잡이 끝나기 전까지는 새 잡이 무시됩니다. 또한 기존 잡이 1시간 내에 처리되지 않으면, 유니크 락이 해제되어 같은 상품 ID로도 새 잡을 큐에 집어넣을 수 있게 됩니다.

> [!WARNING]
> 여러 웹 서버나 컨테이너에서 잡을 디스패치하는 경우, 모든 서버에서 동일한 중앙 캐시 서버를 사용해야 라라벨이 정확하게 잡의 유니크 여부를 판단할 수 있습니다.

<a name="keeping-jobs-unique-until-processing-begins"></a>
#### 잡 처리 시작 시점까지 유니크 보장

유니크 잡은 기본적으로 잡이 처리 완료 시나 모든 재시도 기회가 소진된 후 "락이 해제(unlock)"됩니다. 하지만 잡이 실제로 처리되기 직전에 유니크 락을 해제하고 싶을 때는, `ShouldBeUnique` 대신 `ShouldBeUniqueUntilProcessing` 인터페이스를 구현하면 됩니다.

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
#### 유니크 잡 락

내부적으로, `ShouldBeUnique` 잡이 디스패치될 때 라라벨은 `uniqueId` 키로 [락](/docs/9.x/cache#atomic-locks)을 획득하려 시도합니다. 락 획득에 실패하면 잡은 디스패치되지 않습니다. 이 락은 잡이 정상적으로 처리 완료되거나 재시도 상한에 도달하면 해제됩니다. 기본적으로 라라벨은 디폴트로 지정된 캐시 드라이버를 사용해 락을 획득합니다. 하지만 다른 드라이버를 사용하고 싶다면 `uniqueVia` 메서드를 정의해 사용할 캐시 드라이버를 반환할 수 있습니다.

```
use Illuminate\Support\Facades\Cache;

class UpdateSearchIndex implements ShouldQueue, ShouldBeUnique
{
    ...

    /**
     * Get the cache driver for the unique job lock.
     *
     * @return \Illuminate\Contracts\Cache\Repository
     */
    public function uniqueVia()
    {
        return Cache::driver('redis');
    }
}
```

> [!NOTE]
> 잡의 동시 처리 제한만 필요하다면 [`WithoutOverlapping`](/docs/9.x/queues#preventing-job-overlaps) 잡 미들웨어를 사용하는 것이 더 간단합니다.

<a name="job-middleware"></a>
## 잡 미들웨어

잡 미들웨어를 이용하면 큐 잡 실행 전후로 공통 로직을 감싸서, 개별 잡 코드의 중복을 크게 줄일 수 있습니다. 예를 들어, 아래의 `handle` 메서드는 라라벨의 Redis 속도 제한 기능을 사용하여 5초에 한 번씩만 잡이 실행되도록 하고 있습니다.

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

위 코드는 동작은 하지만, `handle` 메서드에 Redis 속도 제한 관련 코드가 섞이면 코드가 복잡해집니다. 또한, 모든 잡마다 동일한 제한 로직을 복사해 넣어야 하는 불편함도 있습니다.

이렇게 직접 `handle` 메서드에 속도 제한 코드를 추가하는 대신, 전용 잡 미들웨어로 해당 로직을 분리할 수 있습니다. 라라벨은 잡 미들웨어의 기본 위치를 정해두지 않았으므로, 언제든 애플리케이션 내 원하는 위치(예: `app/Jobs/Middleware` 디렉터리 등)에 자유롭게 둘 수 있습니다.

```
<?php

namespace App\Jobs\Middleware;

use Illuminate\Support\Facades\Redis;

class RateLimited
{
    /**
     * Process the queued job.
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

위 예시처럼, [라우트 미들웨어](/docs/9.x/middleware)와 마찬가지로 잡 미들웨어도 처리 중인 잡 인스턴스와 다음 처리를 담당할 콜백을 인자로 받습니다.

미들웨어를 만든 뒤에는 잡 클래스의 `middleware` 메서드에서 해당 미들웨어를 반환하여 잡에 할당할 수 있습니다. 참고로, 이 메서드는 `make:job` 아티즌 명령어로 기본 생성되는 잡에는 포함되지 않으므로 직접 추가해야 합니다.

```
use App\Jobs\Middleware\RateLimited;

/**
 * Get the middleware the job should pass through.
 *
 * @return array
 */
public function middleware()
{
    return [new RateLimited];
}
```

> [!NOTE]
> 잡 미들웨어는 큐 가능한 이벤트 리스너, 메일, 알림 등에도 지정할 수 있습니다.

<a name="rate-limiting"></a>
### 속도 제한(Rate Limiting)

위에서 직접 속도 제한 잡 미들웨어를 만드는 방법을 설명했지만, 사실 라라벨에는 이미 잡의 실행 속도를 제한할 수 있는 내장 미들웨어가 제공됩니다. [라우트 속도 제한자](/docs/9.x/routing#defining-rate-limiters)처럼, 잡 속도 제한자도 `RateLimiter` 파사드의 `for` 메서드를 이용해 정의합니다.

예를 들어, 무료 사용자는 한 시간에 한 번만 백업이 가능하고, 프리미엄 고객에게는 아무 제한이 없도록 하고 싶다면, `AppServiceProvider`의 `boot` 메서드에서 아래처럼 작성하면 됩니다.

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

위 예시에서는 시간 기준으로 제한했지만, `perMinute` 메서드를 사용하면 분 기준으로도 손쉽게 제한할 수 있습니다. 또한, `by` 메서드에는 원하는 값을 넣어 제한 기준을 자유롭게 정할 수 있으며, 보통 고객 기준으로 구분 용도로 사용합니다.

```
return Limit::perMinute(50)->by($job->user->id);
```

속도 제한자를 정의했다면, 해당 잡에 `Illuminate\Queue\Middleware\RateLimited` 미들웨어를 지정해 사용할 수 있습니다. 만약 잡이 속도 제한을 초과하면, 이 미들웨어는 잡을 자동으로 큐에 다시 리릴리즈(release)하며, 제한 기간에 맞춰 적절히 지연시켜 처리합니다.

```
use Illuminate\Queue\Middleware\RateLimited;

/**
 * Get the middleware the job should pass through.
 *
 * @return array
 */
public function middleware()
{
    return [new RateLimited('backups')];
}
```

속도 제한 때문에 다시 큐로 리릴리즈시켜도 잡의 전체 시도 횟수(`attempts`)는 계속 누적됩니다. 따라서 잡 클래스의 `tries`(최대 시도 횟수), `maxExceptions` 등 속성을 상황에 맞게 꼭 조정해 주세요. 또는, [`retryUntil` 메서드](#time-based-attempts)를 사용해 잡 시도를 언제까지 계속할지 결정할 수도 있습니다.

속도 제한에 걸릴 때 잡이 리트라이(재시도)되지 않도록 하고 싶다면, `dontRelease` 메서드를 사용할 수 있습니다.

```
/**
 * Get the middleware the job should pass through.
 *
 * @return array
 */
public function middleware()
{
    return [(new RateLimited('backups'))->dontRelease()];
}
```

> [!NOTE]
> Redis를 사용한다면, 좀 더 최적화된 `Illuminate\Queue\Middleware\RateLimitedWithRedis` 미들웨어를 사용할 수 있습니다.

<a name="preventing-job-overlaps"></a>
### 잡 중복 실행 방지

라라벨에는 `Illuminate\Queue\Middleware\WithoutOverlapping` 미들웨어가 내장되어 있어, 임의의 키를 기준으로 잡이 중복 실행(겹치기)되는 것을 막을 수 있습니다. 예를 들어, 특정 사용자의 신용점수를 갱신하는 잡이 중복 실행되지 않도록 하고 싶다면, 잡의 `middleware` 메서드에서 다음과 같이 지정할 수 있습니다.

```
use Illuminate\Queue\Middleware\WithoutOverlapping;

/**
 * Get the middleware the job should pass through.
 *
 * @return array
 */
public function middleware()
{
    return [new WithoutOverlapping($this->user->id)];
}
```

동일한 유형, 동일한 키의 중복 잡은 다시 큐로 되돌려집니다. 그리고 일정 시간(초) 동안 대기 후 다시 시도하게 할 수도 있습니다.

```
/**
 * Get the middleware the job should pass through.
 *
 * @return array
 */
public function middleware()
{
    return [(new WithoutOverlapping($this->order->id))->releaseAfter(60)];
}
```

만약 중복된 잡을 즉시 삭제처리하고 재시도도 하지 않길 원한다면, `dontRelease` 메서드를 사용할 수 있습니다.

```
/**
 * Get the middleware the job should pass through.
 *
 * @return array
 */
public function middleware()
{
    return [(new WithoutOverlapping($this->order->id))->dontRelease()];
}
```

`WithoutOverlapping` 미들웨어는 라라벨의 원자적 락 기능을 기반으로 동작합니다. 때로는 의도치 않게 잡이 실패하거나 타임아웃되어 락이 자동으로 해제되지 않을 수도 있습니다. 이런 경우를 위해, `expireAfter` 메서드로 락 만료 시간을 직접 지정할 수 있습니다. 아래 예시는 잡이 실행된 뒤 3분 후에 락이 자동 해제되도록 설정한 예입니다.

```
/**
 * Get the middleware the job should pass through.
 *
 * @return array
 */
public function middleware()
{
    return [(new WithoutOverlapping($this->order->id))->expireAfter(180)];
}
```

> [!WARNING]
> `WithoutOverlapping` 미들웨어는 [락을 지원하는 캐시 드라이버](/docs/9.x/cache#atomic-locks)가 필요합니다. 현재 `memcached`, `redis`, `dynamodb`, `database`, `file`, `array` 캐시 드라이버가 원자적 락을 지원합니다.

<a name="sharing-lock-keys"></a>

#### 작업 클래스 간의 락 키 공유하기

기본적으로 `WithoutOverlapping` 미들웨어는 동일한 클래스의 중첩 실행만 방지합니다. 즉, 서로 다른 두 작업 클래스가 동일한 락 키를 사용하더라도 중첩 실행이 차단되지는 않습니다. 그러나 `shared` 메서드를 사용하면 라라벨이 여러 작업 클래스에 락 키를 공유하도록 설정할 수 있습니다.

```php
use Illuminate\Queue\Middleware\WithoutOverlapping;

class ProviderIsDown
{
    // ...


    public function middleware()
    {
        return [
            (new WithoutOverlapping("status:{$this->provider}"))->shared(),
        ];
    }
}

class ProviderIsUp
{
    // ...


    public function middleware()
    {
        return [
            (new WithoutOverlapping("status:{$this->provider}"))->shared(),
        ];
    }
}
```

<a name="throttling-exceptions"></a>
### 예외 제한(Throttle) 미들웨어

라라벨에는 `Illuminate\Queue\Middleware\ThrottlesExceptions` 미들웨어가 포함되어 있어 예외 발생을 제한(throttle)할 수 있습니다. 지정한 횟수만큼 예외가 발생하면, 설정된 시간 간격이 지난 후에만 해당 작업이 다시 시도됩니다. 이 미들웨어는 주로 불안정한 서드파티 서비스와 상호작용하는 작업에 유용하게 사용할 수 있습니다.

예를 들어, 서드파티 API와 통신하는 큐 작업이 예외를 발생시키기 시작했다고 가정해봅시다. 작업 클래스의 `middleware` 메서드에서 `ThrottlesExceptions` 미들웨어를 반환하면 예외 발생을 제한할 수 있습니다. 보통 이 미들웨어는 [시간 기반 재시도](#time-based-attempts)와 함께 사용하는 것이 좋습니다.

```
use Illuminate\Queue\Middleware\ThrottlesExceptions;

/**
 * 작업이 통과해야 할 미들웨어를 반환합니다.
 *
 * @return array
 */
public function middleware()
{
    return [new ThrottlesExceptions(10, 5)];
}

/**
 * 작업이 타임아웃 되어야 할 시각을 결정합니다.
 *
 * @return \DateTime
 */
public function retryUntil()
{
    return now()->addMinutes(5);
}
```

미들웨어의 첫 번째 생성자 인수는 작업이 예외를 발생시킬 수 있는 최대 횟수를 의미하고, 두 번째 인수는 제한(throttling)이 발동되었을 때 작업을 다시 시도하기까지 기다려야 할 분 단위 시간입니다. 위 예제에서는 5분 동안 10회의 예외가 발생하면, 이후 5분간 작업 처리를 대기시킨 뒤에 다시 시도합니다.

작업이 예외를 발생시켰으나 예외 한도에 도달하지 않은 경우, 기본적으로 즉시 재시도 됩니다. 그러나 해당 작업의 지연 시간(분 단위)을 미들웨어 연결 시 `backoff` 메서드를 호출해 지정할 수 있습니다.

```
use Illuminate\Queue\Middleware\ThrottlesExceptions;

/**
 * 작업이 통과해야 할 미들웨어를 반환합니다.
 *
 * @return array
 */
public function middleware()
{
    return [(new ThrottlesExceptions(10, 5))->backoff(5)];
}
```

이 미들웨어는 내부적으로 라라벨의 캐시 시스템을 활용하여 rate limit을 구현하며, 작업 클래스명이 캐시 "키"로 사용됩니다. 만약 여러 작업이 동일한 서드파티 서비스를 사용하고, 예외 제한 공유가 필요하다면 `by` 메서드를 사용해 키를 직접 지정할 수도 있습니다.

```
use Illuminate\Queue\Middleware\ThrottlesExceptions;

/**
 * 작업이 통과해야 할 미들웨어를 반환합니다.
 *
 * @return array
 */
public function middleware()
{
    return [(new ThrottlesExceptions(10, 10))->by('key')];
}
```

> [!NOTE]
> Redis를 사용 중이라면, Redis에 최적화된 `Illuminate\Queue\Middleware\ThrottlesExceptionsWithRedis` 미들웨어를 사용할 수 있습니다. 이 미들웨어는 기본 예외 제한 미들웨어보다 더 효율적입니다.

<a name="dispatching-jobs"></a>
## 작업(Job) 디스패치하기

작업 클래스를 작성했다면, 해당 클래스 자체의 `dispatch` 메서드를 통해 작업을 디스패치할 수 있습니다. `dispatch` 메서드에 전달한 인수들은 작업 클래스의 생성자로 전달됩니다.

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
     * 새로운 팟캐스트를 저장합니다.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $podcast = Podcast::create(/* ... */);

        // ...

        ProcessPodcast::dispatch($podcast);
    }
}
```

조건에 따라 작업을 디스패치하고 싶다면, `dispatchIf`와 `dispatchUnless` 메서드를 사용할 수 있습니다.

```
ProcessPodcast::dispatchIf($accountActive, $podcast);

ProcessPodcast::dispatchUnless($accountSuspended, $podcast);
```

새로운 라라벨 애플리케이션에서는 `sync` 드라이버가 기본 큐 드라이버로 사용됩니다. 이 드라이버는 작업을 현재 요청의 프로세스 내에서 동기적으로 실행하기 때문에, 로컬 개발 단계에서 편리합니다. 작업을 실제로 백그라운드에서 큐잉하여 처리하고 싶을 경우, 애플리케이션의 `config/queue.php` 설정 파일에서 다른 큐 드라이버를 지정해야 합니다.

<a name="delayed-dispatching"></a>
### 디스패치 지연시키기

작업이 즉시 큐 워커에 의해 처리되지 않도록 하려면, 작업을 디스패치할 때 `delay` 메서드를 사용할 수 있습니다. 예를 들어, 작업이 디스패치된 후 10분이 지나야 처리될 수 있도록 지정하려면 아래와 같이 작성합니다.

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
     * 새로운 팟캐스트를 저장합니다.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $podcast = Podcast::create(/* ... */);

        // ...

        ProcessPodcast::dispatch($podcast)
                    ->delay(now()->addMinutes(10));
    }
}
```

> [!WARNING]
> Amazon SQS 큐 서비스는 최대 지연 시간이 15분입니다.

<a name="dispatching-after-the-response-is-sent-to-browser"></a>
#### 브라우저에 응답이 전송된 후 작업 디스패치하기

또한, `dispatchAfterResponse` 메서드를 사용하면 웹 서버에서 FastCGI가 사용 중일 때, HTTP 응답이 사용자 브라우저로 전송된 후에 작업을 디스패치할 수 있습니다. 이렇게 하면 큐 작업이 실행 중이더라도 사용자는 즉시 애플리케이션을 사용할 수 있습니다. 이 방식은 이메일 전송처럼 1초 정도 소요되는 작업에만 사용하는 것이 좋습니다. 이렇게 디스패치된 작업은 현재 HTTP 요청 내에서 처리되므로, 큐 워커가 별도로 실행되고 있지 않아도 작업이 처리됩니다.

```
use App\Jobs\SendNotification;

SendNotification::dispatchAfterResponse();
```

클로저 형태로 작업을 디스패치하고, `dispatch` 헬퍼에 `afterResponse`를 체이닝해서 HTTP 응답 전송 이후 클로저가 실행되도록 할 수도 있습니다.

```
use App\Mail\WelcomeMessage;
use Illuminate\Support\Facades\Mail;

dispatch(function () {
    Mail::to('taylor@example.com')->send(new WelcomeMessage);
})->afterResponse();
```

<a name="synchronous-dispatching"></a>
### 동기(즉시) 작업 디스패치

작업을 즉시(동기적으로) 실행하고 싶다면 `dispatchSync` 메서드를 사용할 수 있습니다. 이 방법을 사용하면 작업이 큐에 쌓이지 않고, 현재 프로세스에서 즉시 실행됩니다.

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
     * 새로운 팟캐스트를 저장합니다.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $podcast = Podcast::create(/* ... */);

        // Create podcast...

        ProcessPodcast::dispatchSync($podcast);
    }
}
```

<a name="jobs-and-database-transactions"></a>
### 작업과 데이터베이스 트랜잭션

데이터베이스 트랜잭션 안에서 작업을 디스패치하는 것은 문제가 없지만, 작업이 실제로 정상적으로 실행될 수 있도록 특별히 주의해야 합니다. 트랜잭션 내부에서 작업을 디스패치하면, 트랜잭션 커밋 이전에 워커가 작업을 처리할 수도 있습니다. 이렇게 되면, 트랜잭션 내부에서 변경된 모델이나 데이터베이스 레코드가 아직 DB에 반영되지 않을 수 있습니다. 또한, 트랜잭션 내에서 생성한 모델이나 레코드는 아예 데이터베이스에 존재하지 않을 수도 있습니다.

이런 문제를 해결하기 위해 라라벨은 몇 가지 방법을 제공합니다. 먼저, 큐 연결 설정 배열에 `after_commit` 옵션을 설정할 수 있습니다.

```
'redis' => [
    'driver' => 'redis',
    // ...
    'after_commit' => true,
],
```

`after_commit` 옵션이 `true`로 설정되면, 데이터베이스 트랜잭션 내부에서 작업을 디스패치하더라도, 라라벨은 상위 트랜잭션이 커밋된 이후에 실제로 작업을 디스패치합니다. 물론, 트랜잭션이 열려 있지 않으면 작업은 즉시 디스패치됩니다.

트랜잭션 수행 중에 예외로 인해 롤백이 발생하면, 해당 트랜잭션 중 디스패치된 작업들은 모두 폐기됩니다.

> [!NOTE]
> `after_commit` 설정을 `true`로 지정하면, 큐에 등록된 이벤트 리스너, mailable, 알림(notification), 브로드캐스트 이벤트 등도 모든 데이터베이스 트랜잭션이 커밋된 후에 디스패치됩니다.

<a name="specifying-commit-dispatch-behavior-inline"></a>
#### 인라인으로 커밋 디스패치 동작 지정하기

큐 연결 설정에서 `after_commit`을 `true`로 지정하지 않더라도, 특정 작업을 모든 트랜잭션 커밋 이후에 디스패치하도록 별도로 지정할 수 있습니다. 이때는 디스패치 연산에 `afterCommit` 메서드를 체이닝하면 됩니다.

```
use App\Jobs\ProcessPodcast;

ProcessPodcast::dispatch($podcast)->afterCommit();
```

반대로, `after_commit`이 `true`로 설정되어 있더라도, 특정 작업만 바로(트랜잭션 커밋을 기다리지 않고) 디스패치하려면 `beforeCommit` 메서드를 사용합니다.

```
ProcessPodcast::dispatch($podcast)->beforeCommit();
```

<a name="job-chaining"></a>
### 작업 체이닝(Job Chaining)

작업 체이닝은 주 작업이 성공적으로 완료된 후, 순차적으로 실행할 여러 큐 작업 목록을 지정할 수 있는 기능입니다. 체인 중 하나가 실패하면, 나머지 작업은 더 이상 실행되지 않습니다. 체인 작업을 실행하려면, `Bus` 파사드가 제공하는 `chain` 메서드를 사용할 수 있습니다. 라라벨의 커맨드 버스(command bus)는 작업 디스패치를 기반으로 한 하위 레벨 컴포넌트입니다.

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

작업 클래스 인스턴스 뿐 아니라, 클로저도 체인에 포함할 수 있습니다.

```
Bus::chain([
    new ProcessPodcast,
    new OptimizePodcast,
    function () {
        Podcast::update(/* ... */);
    },
])->dispatch();
```

> [!WARNING]
> 작업 내부에서 `$this->delete()` 메서드로 작업을 삭제해도, 체이닝된 작업의 실행 자체는 방지되지 않습니다. 오직 체인 내의 한 작업이 실패할 때만 이후 작업들의 실행이 중단됩니다.

<a name="chain-connection-queue"></a>
#### 체인 작업의 연결 및 큐 지정

체인에 포함된 작업들이 사용할 연결(connection)과 큐(queue)를 지정하고 싶은 경우, `onConnection`과 `onQueue` 메서드를 사용할 수 있습니다. 이들 메서드를 사용하면 각 체인 작업 인스턴스에 별도의 연결이나 큐가 지정되어 있지 않을 때 기본값으로 사용됩니다.

```
Bus::chain([
    new ProcessPodcast,
    new OptimizePodcast,
    new ReleasePodcast,
])->onConnection('redis')->onQueue('podcasts')->dispatch();
```

<a name="chain-failures"></a>
#### 체인 작업 실패 처리

작업들을 체이닝할 때, 체인 내 작업 실패 시 실행할 콜백을 `catch` 메서드를 통해 지정할 수 있습니다. 전달된 콜백은 작업 실패 원인이 되는 `Throwable` 인스턴스를 인자로 받습니다.

```
use Illuminate\Support\Facades\Bus;
use Throwable;

Bus::chain([
    new ProcessPodcast,
    new OptimizePodcast,
    new ReleasePodcast,
])->catch(function (Throwable $e) {
    // 체인 내 작업 중 하나가 실패할 경우의 처리...
})->dispatch();
```

> [!WARNING]
> 체인 콜백은 라라벨 큐 시스템에 의해 직렬화되어 나중에 실행됩니다. 따라서 체인 콜백 내부에서는 `$this` 변수를 사용해서는 안 됩니다.

<a name="customizing-the-queue-and-connection"></a>
### 큐 및 연결 커스터마이징

<a name="dispatching-to-a-particular-queue"></a>
#### 특정 큐로 작업 디스패치하기

작업을 여러 큐에 분산(push)하면, 큐 작업을 분류하거나 상황에 따라 각 큐에 할당하는 워커(worker) 수를 조절해 처리 우선순위를 관리할 수 있습니다. 이 기능은 큐 구성파일에 지정된 "연결(connection)"을 가르는 것이 아니라, 특정 연결 내에서 큐(이름) 단위로 분리하는 것입니다. 작업을 특정 큐로 지정하려면, 디스패치 시 `onQueue` 메서드를 사용하면 됩니다.

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
     * 새로운 팟캐스트를 저장합니다.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $podcast = Podcast::create(/* ... */);

        // Create podcast...

        ProcessPodcast::dispatch($podcast)->onQueue('processing');
    }
}
```

또는, 작업 클래스의 생성자 내부에서 `onQueue` 메서드를 호출하여 큐를 지정할 수도 있습니다.

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
     * 새 작업 인스턴스를 생성합니다.
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
#### 특정 연결로 작업 디스패치하기

애플리케이션이 여러 큐 연결을 이용한다면, `onConnection` 메서드를 이용해 작업을 특정 연결로 보낼 수 있습니다.

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
     * 새로운 팟캐스트를 저장합니다.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $podcast = Podcast::create(/* ... */);

        // Create podcast...

        ProcessPodcast::dispatch($podcast)->onConnection('sqs');
    }
}
```

`onConnection`과 `onQueue` 메서드를 체이닝해서, 작업을 특정 연결과 특정 큐로 보낼 수도 있습니다.

```
ProcessPodcast::dispatch($podcast)
              ->onConnection('sqs')
              ->onQueue('processing');
```

또는, 작업 클래스 생성자에서 `onConnection` 메서드를 호출해서 연결을 지정할 수 있습니다.

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
     * 새 작업 인스턴스를 생성합니다.
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
### 작업 최대 시도 횟수 / 타임아웃 값 지정하기

<a name="max-attempts"></a>
#### 최대 시도 횟수(Max Attempts)

큐에 쌓인 작업 중 오류가 발생하는 경우, 해당 작업이 무한정 반복 재시도되는 것을 막고 싶을 것입니다. 라라벨에서는 작업이 시도될 최대 횟수, 또는 최대 허용 시간을 지정할 수 있는 여러 방법을 제공합니다.

먼저, Artizan 커맨드 라인에서 `--tries` 옵션을 지정하여 모든 작업의 최대 재시도 횟수를 정할 수 있습니다. 이 설정은 작업 자체에 개별 설정이 없을 때 워커 전체에 적용됩니다.

```shell
php artisan queue:work --tries=3
```

작업이 최대 시도 횟수를 초과하면 "실패한 작업"으로 간주됩니다. 실패한 작업 처리에 대한 자세한 내용은 [실패한 작업 문서](#dealing-with-failed-jobs)를 참고하세요. 만약 `queue:work` 명령에 `--tries=0`을 지정하면, 해당 작업은 무한정 재시도됩니다.

보다 세밀한 제어가 필요하다면, 작업 클래스 자체에 최대 시도 횟수를 지정할 수 있습니다. 클래스에 설정된 값이 있다면, 커맨드 라인에서 지정한 `--tries` 값보다 클래스가 우선 적용됩니다.

```
<?php

namespace App\Jobs;

class ProcessPodcast implements ShouldQueue
{
    /**
     * 이 작업이 시도될 최대 횟수입니다.
     *
     * @var int
     */
    public $tries = 5;
}
```

<a name="time-based-attempts"></a>
#### 시간 기반 시도 제한(Time Based Attempts)

작업의 최대 시도 횟수를 지정하는 대신, 일정 시각 이후에는 더 이상 해당 작업을 시도하지 않도록 설정할 수도 있습니다. 즉, 주어진 시간 내에서는 몇 번이든 재시도되지만, 그 시간이 지나면 더 이상 재시도되지 않습니다. 이를 위해 작업 클래스에 `retryUntil` 메서드를 추가하고, 이 메서드가 `DateTime` 인스턴스를 반환하도록 합니다.

```
/**
 * 작업이 타임아웃 되어야 할 시각을 결정합니다.
 *
 * @return \DateTime
 */
public function retryUntil()
{
    return now()->addMinutes(10);
}
```

> [!NOTE]
> [큐잉된 이벤트 리스너](/docs/9.x/events#queued-event-listeners)에도 `tries` 속성 또는 `retryUntil` 메서드를 정의할 수 있습니다.

<a name="max-exceptions"></a>
#### 최대 예외(Max Exceptions)

때로는 작업이 여러 번 시도되더라도, 직접적으로 `release` 메서드로 released 된 경우가 아닌, 처리 중 발생한 일정 개수 이하의 미처리 예외만 허용하고 싶을 수 있습니다. 이렇게 설정하려면, 작업 클래스에 `maxExceptions` 속성을 정의하면 됩니다.

```
<?php

namespace App\Jobs;

use Illuminate\Support\Facades\Redis;

class ProcessPodcast implements ShouldQueue
{
    /**
     * 이 작업이 시도될 최대 횟수입니다.
     *
     * @var int
     */
    public $tries = 25;

    /**
     * 실패로 간주하기 전에 허용할 수 있는 미처리 예외 최대 개수입니다.
     *
     * @var int
     */
    public $maxExceptions = 3;

    /**
     * 작업을 실행합니다.
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

이 예제에서는 Redis 락을 얻지 못하면 작업이 10초간 릴리즈되고, 최대 25번까지 계속 재시도됩니다. 하지만 미처리 예외가 세 번 발생하면, 해당 작업은 실패 처리됩니다.

<a name="timeout"></a>

#### 타임아웃

> [!WARNING]
> 작업의 타임아웃을 지정하려면 `pcntl` PHP 확장 모듈이 설치되어 있어야 합니다.

대부분의 경우, 대기열에 넣은 작업이 얼마나 걸릴지 대략적으로 알고 있습니다. 이런 이유로 라라벨에서는 "타임아웃" 값을 지정할 수 있도록 지원합니다. 기본 타임아웃 값은 60초입니다. 만약 한 작업이 이 타임아웃 값(초 단위)보다 오래 실행된다면, 해당 작업을 실행하던 워커가 오류와 함께 종료됩니다. 일반적으로 이때 워커는 [서버에 설정된 프로세스 매니저](#supervisor-configuration)에 의해 자동으로 다시 시작됩니다.

작업이 실행될 수 있는 최대 초 단위 시간은 Artisan 명령어에서 `--timeout` 옵션을 사용하여 지정할 수 있습니다.

```shell
php artisan queue:work --timeout=30
```

작업이 타임아웃으로 인해 최대 시도 횟수를 초과하면, 실패한 것으로 표시됩니다.

또한 작업 클래스 자체에 작업이 실행될 수 있는 최대 초 단위 시간을 지정할 수도 있습니다. 작업 클래스에 타임아웃 설정이 되어 있다면, 해당 설정이 커맨드라인에서 지정한 타임아웃보다 우선 적용됩니다.

```
<?php

namespace App\Jobs;

class ProcessPodcast implements ShouldQueue
{
    /**
     * 작업이 타임아웃되기 전까지 실행 가능한 시간(초)입니다.
     *
     * @var int
     */
    public $timeout = 120;
}
```

때때로 소켓, 외부 HTTP 연결 등 I/O 블로킹이 발생하는 프로세스는 여러분이 지정한 타임아웃 설정을 따르지 않을 수 있습니다. 따라서 이런 기능을 사용할 때는 해당 API에서도 별도로 타임아웃 값을 지정하도록 항상 권장합니다. 예를 들어, Guzzle을 사용할 때는 반드시 연결 및 요청 타임아웃 값을 명시하세요.

<a name="failing-on-timeout"></a>
#### 타임아웃 시 작업을 실패로 처리하기

타임아웃이 발생할 경우 작업을 [실패](#dealing-with-failed-jobs)로 표시하고 싶다면, 작업 클래스에서 `$failOnTimeout` 속성을 정의할 수 있습니다.

```php
/**
 * 타임아웃 발생 시 작업을 실패로 표시할지 여부를 지정합니다.
 *
 * @var bool
 */
public $failOnTimeout = true;
```

<a name="error-handling"></a>
### 에러 핸들링

작업이 처리되는 도중 예외가 발생하면, 해당 작업은 자동으로 다시 대기열에 반환되어 재시도하게 됩니다. 이 작업은 애플리케이션에서 허용한 최대 시도 횟수에 도달할 때까지 반복됩니다. 최대 시도 횟수는 `queue:work` Artisan 명령어의 `--tries` 옵션으로 지정할 수 있습니다. 또는 개별 작업 클래스에서도 최대 시도 횟수를 지정할 수 있습니다. 자세한 내용은 [아래의 큐 워커 실행 관련 설명](#running-the-queue-worker)에서 확인할 수 있습니다.

<a name="manually-releasing-a-job"></a>
#### 작업을 수동으로 다시 대기열에 반환하기

경우에 따라 작업을 직접 다시 대기열에 반환해서 나중에 다시 시도할 수 있도록 하고 싶을 때가 있습니다. 이럴 때는 작업 내에서 `release` 메서드를 호출하면 됩니다.

```
/**
 * 작업 실행.
 *
 * @return void
 */
public function handle()
{
    // ...

    $this->release();
}
```

기본적으로 `release` 메서드는 작업을 즉시 대기열에 반환합니다. 하지만, 정수 값을 인자로 넘기면 해당 초 수만큼 대기한 후에 작업이 다시 처리되도록 할 수 있습니다.

```
$this->release(10);
```

<a name="manually-failing-a-job"></a>
#### 작업을 수동으로 실패 처리하기

때로는 작업을 직접 "실패"로 표시해야 할 수도 있습니다. 이럴 때에는 `fail` 메서드를 호출하면 됩니다.

```
/**
 * 작업 실행.
 *
 * @return void
 */
public function handle()
{
    // ...

    $this->fail();
}
```

try-catch문에서 예외를 잡았기 때문에 작업을 실패로 처리하고 싶다면, 예외 객체를 `fail` 메서드에 전달하면 됩니다. 또는 문자열 형태의 에러 메시지를 넘기면, 자동으로 예외로 변환해서 처리합니다.

```
$this->fail($exception);

$this->fail('Something went wrong.');
```

> [!NOTE]
> 실패한 작업에 대한 더 자세한 내용은 [작업 실패 처리 문서](#dealing-with-failed-jobs)를 참고하세요.

<a name="job-batching"></a>
## 작업 배치 처리

라라벨의 작업 배치 처리 기능을 사용하면 다수의 작업을 한 번에 실행한 후, 배치가 모두 완료되었을 때 후속 작업을 정의할 수 있습니다. 먼저, 각 작업 배치의 완료 비율 등 메타정보를 저장할 데이터베이스 테이블을 만들어야 합니다. 이 마이그레이션은 `queue:batches-table` Artisan 명령어로 생성할 수 있습니다.

```shell
php artisan queue:batches-table

php artisan migrate
```

<a name="defining-batchable-jobs"></a>
### 배치 처리 가능한 작업 정의하기

배치 처리 가능한 작업을 정의하려면, [일반적인 대기열 작업](#creating-jobs)을 생성한 뒤, 작업 클래스에 `Illuminate\Bus\Batchable` 트레이트를 추가하면 됩니다. 이 트레이트는 해당 작업이 속한 현재 배치를 가져올 수 있는 `batch` 메서드를 제공합니다.

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
     * 작업 실행.
     *
     * @return void
     */
    public function handle()
    {
        if ($this->batch()->cancelled()) {
            // 배치가 취소되었는지 확인...

            return;
        }

        // CSV 파일 일부를 가져오기...
    }
}
```

<a name="dispatching-batches"></a>
### 배치 작업 디스패치하기

여러 개의 작업을 배치로 디스패치하려면, `Bus` 파사드의 `batch` 메서드를 사용하면 됩니다. 배치 기능은 주로 완료 시 실행되는 콜백과 함께 사용될 때 유용합니다. 따라서, `then`, `catch`, `finally` 메서드를 사용해 각각 배치 완료 시점에 실행할 콜백을 지정할 수 있습니다. 이 콜백들에는 각각 `Illuminate\Bus\Batch` 인스턴스가 전달됩니다. 아래 예시에서는 CSV 파일의 각 일부를 처리하는 작업을 배치로 대기열에 넣고 있습니다.

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
    // 모든 작업이 성공적으로 완료됨...
})->catch(function (Batch $batch, Throwable $e) {
    // 최초의 작업 실패 발생...
})->finally(function (Batch $batch) {
    // 배치가 모두 실행 완료됨...
})->dispatch();

return $batch->id;
```

배치의 ID는 `$batch->id` 속성을 통해 액세스할 수 있으며, 이 값을 이용해 [라라벨 커맨드 버스에서 상태를 조회](#inspecting-batches)할 수 있습니다.

> [!WARNING]
> 배치 콜백은 직렬화되어 큐에서 나중에 실행됩니다. 따라서 콜백 내에서는 `$this` 변수를 사용하면 안 됩니다.

<a name="naming-batches"></a>
#### 배치 이름 지정하기

Laravel Horizon, Laravel Telescope 등 일부 도구에서는 배치에 이름이 지정되어 있을 경우 디버깅 정보를 좀 더 보기 좋게 표시해줍니다. 배치에 임의의 이름을 지정하려면, 배치 정의 과정에서 `name` 메서드를 호출하면 됩니다.

```
$batch = Bus::batch([
    // ...
])->then(function (Batch $batch) {
    // 모든 작업이 성공적으로 완료됨...
})->name('Import CSV')->dispatch();
```

<a name="batch-connection-queue"></a>
#### 배치의 커넥션 및 큐 지정하기

배치로 처리되는 작업에 사용할 커넥션과 큐를 지정하고 싶을 때는 `onConnection` 및 `onQueue` 메서드를 사용할 수 있습니다. 주의할 점은, 배치 내의 모든 작업이 동일한 커넥션과 큐 내에서 실행되어야 한다는 것입니다.

```
$batch = Bus::batch([
    // ...
])->then(function (Batch $batch) {
    // 모든 작업이 성공적으로 완료됨...
})->onConnection('redis')->onQueue('imports')->dispatch();
```

<a name="chains-within-batches"></a>
#### 배치 내에서 작업 체이닝하기

배치 안에 [체이닝된 작업들](#job-chaining)을 배열 형태로 넣으면, 체이닝된 작업 그룹을 병렬로 실행하고, 두 체인 그룹이 모두 완료되면 콜백이 실행됩니다.

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
### 배치에 작업 추가하기

경우에 따라 배치에 속한 작업 실행 도중, 추가 작업을 배치에 동적으로 등록해야 할 때가 있습니다. 예를 들어 웹 요청 내에서 수천 개의 작업을 한 번에 배치로 추가하는 대신, "로더" 작업에서 필요한 만큼 점진적으로 추가하는 방식이 유용할 수 있습니다.

```
$batch = Bus::batch([
    new LoadImportBatch,
    new LoadImportBatch,
    new LoadImportBatch,
])->then(function (Batch $batch) {
    // 모든 작업이 성공적으로 완료됨...
})->name('Import Contacts')->dispatch();
```

이 예시에서는 `LoadImportBatch` 작업을 통해 추가 작업들을 배치에 동적으로 등록합니다. 이를 위해 작업의 `batch` 메서드로 가져온 배치 인스턴스에서 `add` 메서드를 사용할 수 있습니다.

```
use App\Jobs\ImportContacts;
use Illuminate\Support\Collection;

/**
 * 작업 실행.
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

> [!WARNING]
> 같은 배치에 속한 작업 내에서만 배치에 작업을 추가할 수 있습니다.

<a name="inspecting-batches"></a>
### 배치 조회하기

배치 완료 콜백에 전달되는 `Illuminate\Bus\Batch` 인스턴스에는 해당 배치 작업들을 조회하거나 상태를 파악하는 데 도움이 되는 여러 속성과 메서드가 제공됩니다.

```
// 배치의 UUID...
$batch->id;

// 배치 이름(지정된 경우)...
$batch->name;

// 배치에 할당된 작업 개수...
$batch->totalJobs;

// 대기열에서 아직 처리되지 않은 작업 개수...
$batch->pendingJobs;

// 실패한 작업 개수...
$batch->failedJobs;

// 지금까지 처리된 작업 개수...
$batch->processedJobs();

// 배치의 진행률(0~100)...
$batch->progress();

// 배치 실행이 끝났는지 여부...
$batch->finished();

// 배치 실행 취소...
$batch->cancel();

// 배치가 취소되었는지 여부...
$batch->cancelled();
```

<a name="returning-batches-from-routes"></a>
#### 라우트에서 배치 정보 반환하기

모든 `Illuminate\Bus\Batch` 인스턴스는 JSON 직렬화가 가능합니다. 즉, 애플리케이션 라우트에서 직접 반환하면 배치의 진행률 등 다양한 정보를 포함한 JSON 데이터를 얻을 수 있습니다. 이로 인해 UI에서 실시간으로 배치 진행 상황을 쉽게 표시할 수 있습니다.

배치 ID로 배치 정보를 조회하려면, `Bus` 파사드의 `findBatch` 메서드를 사용할 수 있습니다.

```
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Route;

Route::get('/batch/{batchId}', function (string $batchId) {
    return Bus::findBatch($batchId);
});
```

<a name="cancelling-batches"></a>
### 배치 실행 취소하기

필요에 따라 특정 배치의 실행을 즉시 취소할 수도 있습니다. 이를 위해 `Illuminate\Bus\Batch` 인스턴스의 `cancel` 메서드를 호출하면 됩니다.

```
/**
 * 작업 실행.
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

위와 같은 예시들에서 보았다시피, 배치에 속한 작업은 일반적으로 실행을 계속하기 전에 배치가 취소 상태인지 확인하는 것이 좋습니다. 그러나, 더 편리하게 사용하기 위해서는 작업에 `SkipIfBatchCancelled` [미들웨어](#job-middleware)를 지정할 수 있습니다. 이 미들웨어는 배치가 취소되었으면 해당 작업 자체를 처리하지 않습니다.

```
use Illuminate\Queue\Middleware\SkipIfBatchCancelled;

/**
 * 작업이 거쳐야 할 미들웨어 반환.
 *
 * @return array
 */
public function middleware()
{
    return [new SkipIfBatchCancelled];
}
```

<a name="batch-failures"></a>
### 배치 실패 처리

배치에 포함된 작업이 실패하면, `catch` 콜백(설정되어 있다면)이 실행됩니다. 이 콜백은 배치 내 최초로 실패한 작업에 대해서만 호출됩니다.

<a name="allowing-failures"></a>
#### 배치 실패 허용하기

배치 내 작업이 하나라도 실패하면, 라라벨에서는 해당 배치를 자동으로 "취소됨" 상태로 표시합니다. 하지만, 원하는 경우 작업 일부가 실패하더라도 배치를 자동으로 취소하지 않도록 설정할 수 있습니다. 이를 위해서는 배치 디스패치 시 `allowFailures` 메서드를 호출하면 됩니다.

```
$batch = Bus::batch([
    // ...
])->then(function (Batch $batch) {
    // 모든 작업이 성공적으로 완료됨...
})->allowFailures()->dispatch();
```

<a name="retrying-failed-batch-jobs"></a>
#### 실패한 배치 작업 재시도하기

편의를 위해 라라벨에서는 실패한 배치 작업들을 한 번에 다시 시도하는 `queue:retry-batch` Artisan 명령어를 제공합니다. 이 명령어는 재시도할 배치의 UUID를 인자로 받습니다.

```shell
php artisan queue:retry-batch 32dbc76c-4f82-4749-b610-a639fe0099b5
```

<a name="pruning-batches"></a>
### 오래된 배치 정리(Pruning)

배치 정리를 하지 않으면 `job_batches` 테이블에는 레코드가 빠르게 쌓일 수 있습니다. 이를 방지하려면 [스케줄러](/docs/9.x/scheduling)에서 `queue:prune-batches` Artisan 명령을 매일 실행하도록 설정하는 것이 좋습니다.

```
$schedule->command('queue:prune-batches')->daily();
```

기본적으로 24시간이 지난 완료된 모든 배치가 정리 대상이 됩니다. 만약 배치 데이터를 더 오래 보관하고 싶다면, 명령 실행 시 `hours` 옵션을 사용할 수 있습니다. 예를 들어 48시간이 지난 배치는 다음과 같이 삭제할 수 있습니다.

```
$schedule->command('queue:prune-batches --hours=48')->daily();
```

또한, 작업 실패 등으로 인해 정상적으로 완료되지 못하고 재시도가 이루어지지 않은 배치에 대해서도 정리가 필요할 수 있습니다. 이때는 `unfinished` 옵션을 추가로 지정할 수 있습니다.

```
$schedule->command('queue:prune-batches --hours=48 --unfinished=72')->daily();
```

마찬가지로, 취소된 배치가 누적될 수 있으므로 `cancelled` 옵션을 이용해 취소된 배치를 정리할 수도 있습니다.

```
$schedule->command('queue:prune-batches --hours=48 --cancelled=72')->daily();
```

<a name="queueing-closures"></a>
## 클로저를 대기열에 넣기

작업 클래스를 큐에 디스패치하는 대신, 간단하게 클로저(익명 함수) 자체를 대기열에 보낼 수도 있습니다. 이는 요청 처리와 별도로 실행되어야 하는 간단한 작업을 빠르게 처리할 때 유용합니다. 클로저를 대기열에 보낼 경우, 클로저의 코드는 암호학적으로 서명되며 전송 중에 변조가 불가능하도록 처리됩니다.

```
$podcast = App\Podcast::find(1);

dispatch(function () use ($podcast) {
    $podcast->publish();
});
```

`catch` 메서드를 활용하면 대기열에 들어간 클로저가 모든 [설정된 재시도 시도](#max-job-attempts-and-timeout) 이후에도 성공적으로 완료되지 못한 경우 실행할 콜백을 지정할 수 있습니다.

```
use Throwable;

dispatch(function () use ($podcast) {
    $podcast->publish();
})->catch(function (Throwable $e) {
    // 이 작업이 실패함...
});
```

> [!WARNING]
> `catch` 콜백은 큐에서 직렬화된 후 나중에 실행되므로, `catch` 콜백 내부에서는 `$this` 변수를 사용해서는 안 됩니다.

<a name="running-the-queue-worker"></a>
## 큐 워커 실행하기

<a name="the-queue-work-command"></a>
### `queue:work` 명령어

라라벨은 새로운 작업이 큐에 쌓일 때 이를 처리하는 큐 워커를 구동하는 Artisan 명령어를 제공합니다. `queue:work` Artisan 명령을 실행하면 큐 워커가 시작됩니다. 워커가 한번 시작되면, 수동으로 중지하거나 터미널을 닫기 전까지 계속 실행됩니다.

```shell
php artisan queue:work
```

> [!NOTE]
> `queue:work` 프로세스를 백그라운드에서 영구적으로 실행시키기 위해서는 [Supervisor](#supervisor-configuration)와 같은 프로세스 모니터링 도구를 사용하는 것이 좋습니다.

`queue:work`를 실행할 때 `-v` 플래그를 추가하면 처리된 작업의 ID가 출력에 표시됩니다.

```shell
php artisan queue:work -v
```

큐 워커는 장시간 실행되는 프로세스이며, 부팅된 애플리케이션 상태를 메모리에 유지합니다. 이 때문에, 워커를 시작한 후 코드베이스가 변경되어도 이를 자동으로 감지하지 못합니다. 따라서 배포 시에는 꼭 [큐 워커를 재시작](#queue-workers-and-deployment)하시기 바랍니다. 또한, 애플리케이션에서 정적으로 생성하거나 수정한 상태는 작업마다 자동으로 초기화되지 않으니 유의하세요.

또한, `queue:listen` 명령어를 사용할 수도 있습니다. 이 명령어를 사용하면 워커 프로세스를 재시작할 필요 없이 코드를 새로 적용하거나 상태를 리셋할 수 있지만, 이 방식은 `queue:work`에 비해 비효율적이라는 점을 참고하세요.

```shell
php artisan queue:listen
```

<a name="running-multiple-queue-workers"></a>
#### 여러 큐 워커 동시 실행하기

여러 워커가 동시에 큐를 처리하도록 하려면 단순히 여러 개의 `queue:work` 프로세스를 시작하면 됩니다. 이는 터미널의 여러 탭을 이용해 로컬에서 직접 실행하거나, 운영 환경에서는 프로세스 매니저 설정을 통해 구성할 수 있습니다. [Supervisor를 사용할 때](#supervisor-configuration)는 `numprocs` 설정을 활용하면 됩니다.

<a name="specifying-the-connection-queue"></a>
#### 커넥션 및 큐 지정하기

워커가 사용할 큐 커넥션을 명시적으로 지정할 수도 있습니다. `work` 명령에 넘기는 커넥션 이름은 `config/queue.php` 설정 파일에 정의된 커넥션 중 하나여야 합니다.

```shell
php artisan queue:work redis
```

`queue:work` 명령은 기본적으로 주어진 커넥션에서 "기본 큐"에 등록된 작업만 처리합니다. 하지만, 특정 큐 이름만 지정해서 워커가 특정 큐의 작업만 처리하도록 더 세부적으로 제어할 수도 있습니다. 예를 들어, 모든 이메일을 `redis` 커넥션의 `emails` 큐로 처리하고 있다면, 해당 워커가 이 큐에 할당된 작업만 처리하도록 다음과 같이 명령어를 실행할 수 있습니다.

```shell
php artisan queue:work redis --queue=emails
```

<a name="processing-a-specified-number-of-jobs"></a>
#### 지정된 수 만큼의 작업만 처리하기

워커가 대기열에서 단 한 건의 작업만 처리하게 하려면 `--once` 옵션을 사용할 수 있습니다.

```shell
php artisan queue:work --once
```

`--max-jobs` 옵션을 사용하면 워커가 지정된 개수의 작업만 처리한 후 종료하도록 할 수 있습니다. 이 옵션은 [Supervisor](#supervisor-configuration)와 같이 워커가 메모리 누수를 방지하기 위해 일정 작업 수 이후 자동 재시작되도록 할 때 유용합니다.

```shell
php artisan queue:work --max-jobs=1000
```

<a name="processing-all-queued-jobs-then-exiting"></a>
#### 큐에 남아있는 모든 작업을 처리한 후 종료하기

`--stop-when-empty` 옵션을 사용하면 워커가 대기열에 있는 모든 작업을 다 처리한 후 정상적으로 종료하게 할 수 있습니다. 이는 작업이 모두 소진되면 컨테이너를 종료해야 하는 Docker 환경에서 유용하게 활용할 수 있습니다.

```shell
php artisan queue:work --stop-when-empty
```

<a name="processing-jobs-for-a-given-number-of-seconds"></a>
#### 지정된 초 동안만 작업 처리하기

`--max-time` 옵션을 사용하면 워커가 지정된 초 동안만 작업을 처리한 후 종료하도록 할 수 있습니다. 이 옵션은 [Supervisor](#supervisor-configuration)와 함께 사용하여 워커가 일정 시간이 지나면 자동으로 재시작되도록 설정할 때 활용할 수 있습니다.

```shell
# 한 시간 동안 작업을 처리한 뒤 종료
php artisan queue:work --max-time=3600
```

<a name="worker-sleep-duration"></a>
#### 워커의 대기(Sleep) 시간 설정

대기열에 작업이 있을 때는 워커가 지체 없이 작업을 계속 처리합니다. 반면, 대기열에 아무 작업이 없을 때 워커가 "잠들어" 있는 시간을 `sleep` 옵션으로 지정할 수 있습니다. 이 상태에서는 새로운 작업이 등록되어도 워커가 깨어날 때까지 바로 처리하지 않습니다.

```shell
php artisan queue:work --sleep=3
```

<a name="resource-considerations"></a>
#### 리소스 사용 시 주의사항

데몬 형태로 동작하는 큐 워커는 각 작업 전후에 프레임워크를 재시작하지 않습니다. 따라서, 무거운 리소스(예: GD 라이브러리로 이미지 처리 등)는 작업이 끝날 때마다 적절히 해제해야 합니다. 예를 들어, 이미지 처리 후에는 꼭 `imagedestroy`를 호출해 메모리 누수를 막아야 합니다.

<a name="queue-priorities"></a>
### 큐 우선순위

때로는 여러 대기열의 작업 처리 우선순위를 지정하고 싶을 수 있습니다. 예를 들어, `config/queue.php`에서 `redis` 커넥션의 기본 큐를 `low`로 지정할 수 있습니다. 하지만 특정 작업을 `high` 우선순위 큐로 보내고 싶다면 아래와 같이 할 수 있습니다.

```
dispatch((new Job)->onQueue('high'));
```

그리고 워커를 실행할 때, `high` 큐의 모든 작업을 먼저 처리한 뒤 `low` 큐 작업을 처리하려면, 큐 이름을 콤마(,)로 구분한 목록으로 넘겨주면 됩니다.

```shell
php artisan queue:work --queue=high,low
```

<a name="queue-workers-and-deployment"></a>

### 큐 워커 및 배포

큐 워커는 장시간 실행되는 프로세스이기 때문에, 코드를 변경하더라도 워커를 재시작하지 않으면 변경 사항을 인지하지 못합니다. 따라서 큐 워커를 사용하는 애플리케이션을 배포할 때 가장 간단한 방법은 배포 과정에서 워커를 재시작하는 것입니다. `queue:restart` 명령어를 사용하면 모든 워커를 정상적으로(현재 처리 중인 작업을 끝낸 뒤) 재시작할 수 있습니다.

```shell
php artisan queue:restart
```

이 명령어는 모든 큐 워커에게 현재 작업을 마친 뒤 정상적으로 종료하라고 지시합니다. 이때 기존 작업이 유실되지 않습니다. `queue:restart` 명령어가 실행되면 워커가 종료되므로, [Supervisor](#supervisor-configuration)와 같은 프로세스 매니저를 사용해 워커가 자동으로 재시작되도록 설정하는 것이 좋습니다.

> [!NOTE]
> 큐는 [캐시](/docs/9.x/cache)를 이용해 재시작 신호를 저장하므로, 이 기능을 사용하기 전에 애플리케이션에 적절한 캐시 드라이버가 올바르게 구성되어 있는지 확인해야 합니다.

<a name="job-expirations-and-timeouts"></a>
### 작업 만료 및 타임아웃

<a name="job-expiration"></a>
#### 작업 만료

`config/queue.php` 설정 파일에서 각 큐 연결은 `retry_after` 옵션을 정의합니다. 이 옵션은 처리 중인 작업이 일정 시간(초) 동안 완료되지 않을 경우, 몇 초 후에 작업을 다시 시도할지 지정합니다. 예를 들어, `retry_after` 값을 `90`으로 설정하면, 작업이 90초 내에 완료되거나 삭제되지 않은 경우 큐에 다시 올려집니다. 일반적으로 `retry_after` 값은 여러분의 작업이 정상적으로 처리될 수 있는 최대 시간보다 약간 더 길게 설정하는 것이 좋습니다.

> [!WARNING]
> Amazon SQS 큐 연결만은 `retry_after` 값을 갖지 않습니다. SQS의 경우 [기본 가시성 타임아웃](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/AboutVT.html)이 AWS 콘솔에서 관리되며, 이 값에 따라 작업이 다시 시도됩니다.

<a name="worker-timeouts"></a>
#### 워커 타임아웃

`queue:work` 아티즌 명령어는 `--timeout` 옵션을 제공합니다. 기본값은 60초입니다. 만약 작업이 이 값보다 더 오래 처리된다면, 해당 작업을 처리 중인 워커는 에러와 함께 종료됩니다. 워커가 종료되면 [서버에 구성된 프로세스 매니저](#supervisor-configuration)가 워커를 자동으로 재시작하는 것이 일반적입니다.

```shell
php artisan queue:work --timeout=60
```

`retry_after` 설정값과 `--timeout` CLI 옵션 값은 서로 다르지만, 함께 작동하여 작업이 유실되지 않도록 하고, 한 작업이 중복 처리되지 않도록 보장합니다.

> [!WARNING]
> `--timeout` 값은 항상 `retry_after` 값보다 몇 초 정도 더 짧게 설정해야 합니다. 이렇게 해야 워커가 얼어 붙은(frozen) 작업을 재시도 이전에 항상 종료하게 됩니다. 만약 `--timeout` 값이 `retry_after` 보다 길다면, 한 작업이 두 번 처리될 위험이 있습니다.

<a name="supervisor-configuration"></a>
## Supervisor 구성

운영 환경에서는 `queue:work` 프로세스를 계속 실행 상태로 유지해야 합니다. `queue:work` 프로세스는 워커 타임아웃이 초과되거나, `queue:restart` 명령어가 실행되는 등 여러 가지 이유로 중단될 수 있습니다.

이럴 때, 프로세스 모니터링 도구를 사용해 `queue:work` 프로세스가 중지된 것을 감지하고, 자동으로 재시작해주어야 합니다. 또한 프로세스 모니터는 동시에 몇 개의 `queue:work` 프로세스를 실행할지 설정할 수도 있습니다. Supervisor는 일반적으로 리눅스 환경에서 사용되는 대표적인 프로세스 모니터이며, 아래에서 구성 방법을 안내합니다.

<a name="installing-supervisor"></a>
#### Supervisor 설치하기

Supervisor는 리눅스 운영체제용 프로세스 모니터로, `queue:work` 프로세스가 중단되었을 때 자동으로 재시작해줍니다. Ubuntu에서 Supervisor를 설치하려면 다음 명령어를 사용합니다.

```shell
sudo apt-get install supervisor
```

> [!NOTE]
> Supervisor를 직접 설치하고 관리하는 것이 부담스럽다면, [Laravel Forge](https://forge.laravel.com)를 고려해보세요. Forge는 운영 환경의 라라벨 프로젝트에 Supervisor를 자동으로 설치하고 구성해줍니다.

<a name="configuring-supervisor"></a>
#### Supervisor 구성하기

Supervisor의 설정 파일은 보통 `/etc/supervisor/conf.d` 디렉터리에 저장되어 있습니다. 이 디렉터리 안에 원하는만큼 설정 파일을 생성해, 어떠한 프로세스를 모니터링할지 Supervisor에 지시할 수 있습니다. 예를 들어, `laravel-worker.conf` 파일을 생성해 `queue:work` 프로세스를 시작하고, 모니터하는 설정을 만들 수 있습니다.

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

이 예시에서 `numprocs` 지시자는 Supervisor가 총 8개의 `queue:work` 프로세스를 실행하고, 모두 모니터링하며 장애 발생 시 재시작하도록 지시합니다. 실제 사용 시에는 `command` 지시자의 값(큐 연결 및 워커 옵션 등)을 여러분의 환경에 맞게 변경해야 합니다.

> [!WARNING]
> `stopwaitsecs` 값을 실제로 가장 오래 걸리는 작업 처리 시간보다 크게 설정해야 합니다. 그렇지 않으면 Supervisor가 작업이 끝나기도 전에 강제로 종료시킬 수 있습니다.

<a name="starting-supervisor"></a>
#### Supervisor 시작하기

설정 파일을 생성한 후에는 다음 명령어로 Supervisor 설정을 갱신한 뒤, 프로세스를 시작할 수 있습니다.

```shell
sudo supervisorctl reread

sudo supervisorctl update

sudo supervisorctl start laravel-worker:*
```

Supervisor에 대한 더 자세한 정보는 [Supervisor 공식 문서](http://supervisord.org/index.html)를 참고하세요.

<a name="dealing-with-failed-jobs"></a>
## 실패한 작업 처리하기

큐에 저장된 작업이 실패하는 경우가 발생할 수 있습니다. 걱정하지 마세요, 모든 일이 항상 계획대로 되는 것은 아니니까요! 라라벨은 [작업 재시도 최대 횟수 지정](#max-job-attempts-and-timeout) 기능을 포함하고 있습니다. 비동기 작업이 지정된 재시도 횟수(시도 횟수)를 초과하면, 해당 작업은 `failed_jobs` 데이터베이스 테이블에 저장됩니다. [동기식으로 디스패치한 작업](/docs/9.x/queues#synchronous-dispatching)이 실패한 경우에는 이 테이블에 저장되지 않으며, 예외가 곧바로 애플리케이션에서 처리됩니다.

신규 라라벨 프로젝트에는 `failed_jobs` 테이블 생성을 위한 마이그레이션이 기본적으로 포함되어 있습니다. 하지만 사용 중인 애플리케이션에 이 테이블이 없다면, `queue:failed-table` 명령으로 마이그레이션을 만들 수 있습니다.

```shell
php artisan queue:failed-table

php artisan migrate
```

[큐 워커](#running-the-queue-worker) 프로세스를 실행할 때, `queue:work` 명령어의 `--tries` 옵션으로 각 작업의 최대 시도 횟수를 지정할 수 있습니다. 만약 `--tries` 옵션을 지정하지 않으면, 작업은 기본적으로 한 번만 실행되거나, 작업 클래스의 `$tries` 속성에 정의된 횟수만큼만 시도됩니다.

```shell
php artisan queue:work redis --tries=3
```

`--backoff` 옵션을 사용하면, 예외가 발생한 작업에 대해 몇 초 후 다시 시도할지 시간을 정할 수 있습니다. 기본적으로는 작업이 곧바로 다시 큐에 올라 다음 시도를 하게 됩니다.

```shell
php artisan queue:work redis --tries=3 --backoff=3
```

특정 작업 클래스에서 작업마다 예외 발생 후 재시도까지 대기할 시간을 지정하려면, 작업 클래스에 `backoff` 속성을 정의할 수 있습니다.

```
/**
 * 작업을 재시도할 때까지 대기할 시간(초)입니다.
 *
 * @var int
 */
public $backoff = 3;
```

더 복잡한 로직이 필요한 경우, 작업 클래스에 `backoff` 메서드를 정의해 사용할 수 있습니다.

```
/**
* 작업을 재시도하기까지 대기할 시간을 계산합니다.
*
* @return int
*/
public function backoff()
{
    return 3;
}
```

여러 번의 재시도에 대해 "지수(backoff) 분할"과 같은 방식으로 대기 시간을 지정하려면, `backoff` 메서드에서 배열을 반환하면 됩니다. 아래 예시에서는 첫 번째 재시도 시 1초, 두 번째는 5초, 세 번째는 10초 동안 기다린 뒤 다시 시도합니다.

```
/**
* 작업을 재시도하기까지 대기할 시간을 계산합니다.
*
* @return array
*/
public function backoff()
{
    return [1, 5, 10];
}
```

<a name="cleaning-up-after-failed-jobs"></a>
### 실패한 작업 처리 후 정리

작업이 실패한 경우, 사용자에게 알림을 보내거나, 작업이 부분적으로 완료된 상태를 되돌리는 처리를 하고 싶을 수 있습니다. 이를 위해, 작업 클래스에 `failed` 메서드를 정의할 수 있습니다. 이 `failed` 메서드에는 실패 원인이 담긴 `Throwable` 인스턴스가 전달됩니다.

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
     * The podcast instance.
     *
     * @var \App\Podcast
     */
    public $podcast;

    /**
     * Create a new job instance.
     *
     * @param  \App\Models\Podcast  $podcast
     * @return void
     */
    public function __construct(Podcast $podcast)
    {
        $this->podcast = $podcast;
    }

    /**
     * Execute the job.
     *
     * @param  \App\Services\AudioProcessor  $processor
     * @return void
     */
    public function handle(AudioProcessor $processor)
    {
        // Process uploaded podcast...
    }

    /**
     * Handle a job failure.
     *
     * @param  \Throwable  $exception
     * @return void
     */
    public function failed(Throwable $exception)
    {
        // Send user notification of failure, etc...
    }
}
```

> [!WARNING]
> `failed` 메서드가 호출되기 전에 작업의 새 인스턴스가 생성되므로, `handle` 메서드에서 수정한 클래스 속성 값은 사라진다는 점에 주의하세요.

<a name="retrying-failed-jobs"></a>
### 실패한 작업 재시도

`failed_jobs` 데이터베이스 테이블에 저장된 모든 실패한 작업을 확인하려면, `queue:failed` 아티즌 명령어를 사용하면 됩니다.

```shell
php artisan queue:failed
```

`queue:failed` 명령은 각 작업의 ID, 연결, 큐, 실패 시각 등 다양한 정보를 보여줍니다. 표시된 작업 ID를 사용해 해당 실패한 작업을 다시 재시도할 수 있습니다. 예를 들어, ID가 `ce7bb17c-cdd8-41f0-a8ec-7b4fef4e5ece`인 실패 작업을 다시 시도하려면 아래와 같이 실행합니다.

```shell
php artisan queue:retry ce7bb17c-cdd8-41f0-a8ec-7b4fef4e5ece
```

필요에 따라 여러 개의 ID를 한 번에 입력해 여러 작업을 동시에 재시도할 수도 있습니다.

```shell
php artisan queue:retry ce7bb17c-cdd8-41f0-a8ec-7b4fef4e5ece 91401d2c-0784-4f43-824c-34f94a33c24d
```

특정 큐에 속한 실패한 모든 작업을 다시 시도하려면 아래와 같이 실행합니다.

```shell
php artisan queue:retry --queue=name
```

실패한 모든 작업을 한 번에 다시 시도하려면 `queue:retry` 명령에 `all`을 인자로 전달합니다.

```shell
php artisan queue:retry all
```

특정 실패 작업을 삭제하려면 `queue:forget` 명령어를 사용하면 됩니다.

```shell
php artisan queue:forget 91401d2c-0784-4f43-824c-34f94a33c24d
```

> [!NOTE]
> [Horizon](/docs/9.x/horizon)을 사용할 때는, `queue:forget` 명령어 대신 `horizon:forget` 명령을 사용해 실패한 작업을 삭제해야 합니다.

`failed_jobs` 테이블에서 모든 실패한 작업을 삭제하려면 `queue:flush` 명령어를 사용할 수 있습니다.

```shell
php artisan queue:flush
```

<a name="ignoring-missing-models"></a>
### 누락된 모델 무시

Eloquent 모델을 작업에 주입하면, 해당 모델은 직렬화된 후 큐에 저장되고, 작업 처리 시 데이터베이스에서 다시 조회됩니다. 하지만, 작업이 대기 중일 때 모델이 삭제된 경우에는 작업이 `ModelNotFoundException` 예외와 함께 실패할 수 있습니다.

실행 도중 누락된 모델이 발생한 작업을 예외 없이 조용히 삭제하려면, 작업 클래스에 `deleteWhenMissingModels` 속성을 `true`로 지정하세요. 이 속성이 설정되면 라라벨은 예외를 발생시키지 않고 해당 작업을 조용히 버립니다.

```
/**
 * 작업에 필요한 모델이 더 이상 존재하지 않을 경우 작업을 삭제합니다.
 *
 * @var bool
 */
public $deleteWhenMissingModels = true;
```

<a name="pruning-failed-jobs"></a>
### 실패한 작업 레코드 정리(Prune)

애플리케이션의 `failed_jobs` 테이블에서 오래된 기록을 삭제하려면 `queue:prune-failed` 아티즌 명령을 사용할 수 있습니다.

```shell
php artisan queue:prune-failed
```

기본적으로 24시간이 지난 모든 실패 작업 기록이 삭제됩니다. `--hours` 옵션을 추가하면 최근 N시간 동안 추가된 실패 기록만 남기고 나머지는 삭제합니다. 아래 명령은 48시간보다 오래된 모든 실패 작업 기록을 삭제합니다.

```shell
php artisan queue:prune-failed --hours=48
```

<a name="storing-failed-jobs-in-dynamodb"></a>
### DynamoDB에 실패한 작업 저장

라라벨에서는 관계형 데이터베이스 대신 [DynamoDB](https://aws.amazon.com/dynamodb)에 실패한 작업을 저장할 수도 있습니다. 이 경우, 모든 실패 기록을 저장할 DynamoDB 테이블을 먼저 생성해야 합니다. 이 테이블의 이름은 보통 `failed_jobs`로 지정하지만, 애플리케이션의 `queue` 설정 파일 내 `queue.failed.table` 설정값에 맞추면 됩니다.

`failed_jobs` 테이블에는 `application`이라는 문자열 파티션 기본 키와, `uuid`라는 문자열 정렬 기본 키를 생성해야 합니다. `application` 키에는 애플리케이션의 이름(설정 파일 `app.name`에 정의된 값)이 저장됩니다. 이처럼 애플리케이션 이름이 키의 일부이기 때문에 동일한 테이블을 여러 라라벨 애플리케이션에서 함께 사용할 수 있습니다.

또한, AWS SDK가 필요하므로 아래 명령어로 패키지를 설치해야 합니다.

```shell
composer require aws/aws-sdk-php
```

이후 `queue.failed.driver` 설정값을 `dynamodb`로 지정하세요. 추가로 인증을 위한 `key`, `secret`, `region` 설정을 배열에 포함해주어야 하며, 이 옵션들은 AWS 인증에 사용됩니다. `dynamodb` 드라이버를 사용할 경우, `queue.failed.database` 옵션은 필요 없습니다.

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

실패한 작업을 저장하지 않고 즉시 버리도록 하려면, `queue.failed.driver` 설정값을 `null`로 지정하면 됩니다. 일반적으로는 `QUEUE_FAILED_DRIVER` 환경변수로 이를 설정할 수 있습니다.

```ini
QUEUE_FAILED_DRIVER=null
```

<a name="failed-job-events"></a>
### 실패한 작업 이벤트

작업이 실패할 때마다 실행되는 이벤트 리스너를 등록하려면, `Queue` 파사드의 `failing` 메서드를 사용할 수 있습니다. 예를 들어, 라라벨에서 기본으로 제공하는 `AppServiceProvider`의 `boot` 메서드에서 아래와 같이 클로저를 이벤트에 연결할 수 있습니다.

```
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Queue;
use Illuminate\Support\ServiceProvider;
use Illuminate\Queue\Events\JobFailed;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
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
## 큐에서 작업 삭제하기

> [!NOTE]
> [Horizon](/docs/9.x/horizon)을 사용할 때는, 큐의 작업을 삭제하려면 `queue:clear` 명령이 아닌 `horizon:clear` 명령을 사용해야 합니다.

기본 연결의 기본 큐에서 모든 작업을 삭제하려면, `queue:clear` 아티즌 명령어를 사용할 수 있습니다.

```shell
php artisan queue:clear
```

특정 연결과 큐에서 작업을 삭제하려면 `connection` 인수와 `queue` 옵션을 함께 지정할 수 있습니다.

```shell
php artisan queue:clear redis --queue=emails
```

> [!WARNING]
> 큐의 작업 삭제 기능은 SQS, Redis, 데이터베이스 큐 드라이버에서만 사용할 수 있습니다. 또한 SQS의 경우 메시지 삭제까지 최대 60초가 걸리므로, 이 명령 실행 후 최대 60초 동안 SQS 큐에 전송되는 작업도 함께 삭제될 수 있습니다.

<a name="monitoring-your-queues"></a>
## 큐 모니터링

큐에 갑작스럽게 많은 작업이 쌓이면 처리가 느려질 수 있고, 작업 대기 시간이 길어질 수 있습니다. 필요하다면, 라라벨에서 지정한 임계치 이상의 작업이 큐에 쌓였을 때 알림을 받을 수 있습니다.

이를 위해 우선, [스케줄러에 매분 실행]( /docs/9.x/scheduling )되도록 `queue:monitor` 명령어를 등록해야 합니다. 이 명령어는 모니터링할 큐의 이름과, 최대 작업 개수 임계치를 옵션으로 받습니다.

```shell
php artisan queue:monitor redis:default,redis:deployments --max=100
```

이 명령어를 스케줄링하는 것만으로는 알림을 받을 수 없습니다. 명령어가 큐의 작업 개수가 임계치를 초과한 큐를 발견하면 `Illuminate\Queue\Events\QueueBusy` 이벤트를 발생시킵니다. 이 이벤트를 여러분 애플리케이션의 `EventServiceProvider`에서 감지하고, 개발자나 팀에 알림을 보낼 수 있습니다.

```php
use App\Notifications\QueueHasLongWaitTime;
use Illuminate\Queue\Events\QueueBusy;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;

/**
 * Register any other events for your application.
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
## 작업 이벤트(Job Events)

`Queue` [파사드](/docs/9.x/facades)의 `before` 및 `after` 메서드를 사용하면, 큐 작업이 처리되기 전 또는 후에 실행할 콜백 함수를 지정할 수 있습니다. 이를 통해 작업 전후에 추가 로그를 남기거나 대시보드 통계를 갱신하는 등의 확장 처리를 구현할 수 있습니다. 일반적으로는 [서비스 프로바이더](/docs/9.x/providers)의 `boot` 메서드에서 이 메서드들을 호출하는 것이 좋습니다. 예를 들어, 라라벨에서 기본 제공하는 `AppServiceProvider`에서 다음과 같이 사용할 수 있습니다.

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
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
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

또한, `Queue` [파사드](/docs/9.x/facades)의 `looping` 메서드를 사용하면, 워커가 큐에서 작업을 가져오기 직전에 실행되는 콜백을 등록할 수 있습니다. 예를 들어, 이전 작업이 실패한 뒤 열린 데이터베이스 트랜잭션을 롤백하는 클로저를 아래처럼 등록할 수 있습니다.

```
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;

Queue::looping(function () {
    while (DB::transactionLevel() > 0) {
        DB::rollBack();
    }
});
```