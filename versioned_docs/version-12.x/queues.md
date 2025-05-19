# 큐(Queues) (Queues)

- [소개](#introduction)
    - [커넥션과 큐의 차이](#connections-vs-queues)
    - [드라이버별 안내 및 사전 준비 사항](#driver-prerequisites)
- [작업 생성하기](#creating-jobs)
    - [작업 클래스 생성하기](#generating-job-classes)
    - [클래스 구조](#class-structure)
    - [고유 작업(Unique Jobs)](#unique-jobs)
    - [암호화된 작업](#encrypted-jobs)
- [작업 미들웨어](#job-middleware)
    - [속도 제한(Rate Limiting)](#rate-limiting)
    - [작업 중복 방지](#preventing-job-overlaps)
    - [예외 발생시 지연(Throttling Exceptions)](#throttling-exceptions)
    - [작업 건너뛰기](#skipping-jobs)
- [작업 디스패치](#dispatching-jobs)
    - [지연 디스패치](#delayed-dispatching)
    - [동기식 디스패치](#synchronous-dispatching)
    - [작업 및 데이터베이스 트랜잭션](#jobs-and-database-transactions)
    - [작업 체이닝](#job-chaining)
    - [큐 및 커넥션 커스터마이징](#customizing-the-queue-and-connection)
    - [최대 시도 횟수/타임아웃 값 지정](#max-job-attempts-and-timeout)
    - [에러 처리](#error-handling)
- [작업 배치 처리](#job-batching)
    - [배치 가능한 작업 정의](#defining-batchable-jobs)
    - [배치 디스패치](#dispatching-batches)
    - [체인과 배치](#chains-and-batches)
    - [배치에 작업 추가하기](#adding-jobs-to-batches)
    - [배치 확인하기](#inspecting-batches)
    - [배치 취소하기](#cancelling-batches)
    - [배치 실패](#batch-failures)
    - [배치 정리하기](#pruning-batches)
    - [DynamoDB에 배치 저장하기](#storing-batches-in-dynamodb)
- [클로저 큐잉(Queueing Closures)](#queueing-closures)
- [큐 워커 실행하기](#running-the-queue-worker)
    - [`queue:work` 명령어](#the-queue-work-command)
    - [큐 우선순위](#queue-priorities)
    - [큐 워커 및 배포](#queue-workers-and-deployment)
    - [작업 만료 및 타임아웃](#job-expirations-and-timeouts)
- [Supervisor 구성](#supervisor-configuration)
- [실패한 작업 처리하기](#dealing-with-failed-jobs)
    - [실패한 작업 후처리](#cleaning-up-after-failed-jobs)
    - [실패한 작업 재시도](#retrying-failed-jobs)
    - [존재하지 않는 모델 무시](#ignoring-missing-models)
    - [실패한 작업 정리하기](#pruning-failed-jobs)
    - [DynamoDB에 실패한 작업 저장하기](#storing-failed-jobs-in-dynamodb)
    - [실패한 작업 저장 비활성화](#disabling-failed-job-storage)
    - [실패한 작업 이벤트](#failed-job-events)
- [큐에서 작업 비우기](#clearing-jobs-from-queues)
- [큐 모니터링](#monitoring-your-queues)
- [테스트하기](#testing)
    - [일부 작업만 가짜 처리하기](#faking-a-subset-of-jobs)
    - [작업 체인 테스트](#testing-job-chains)
    - [작업 배치 테스트](#testing-job-batches)
    - [작업/큐 상호작용 테스트](#testing-job-queue-interactions)
- [작업 이벤트](#job-events)

<a name="introduction"></a>
## 소개

웹 애플리케이션을 개발하다 보면, 예를 들어 업로드된 CSV 파일을 파싱하고 저장하는 작업처럼 일반적인 웹 요청 처리 시간 내에 끝내기 어려운 작업이 있을 수 있습니다. 다행히 라라벨에서는 손쉽게 백그라운드에서 처리할 수 있는 큐 작업(queued job)을 만들 수 있습니다. 시간이 많이 소요되는 작업을 큐로 옮기면 애플리케이션의 웹 요청 응답 속도가 크게 빨라지고, 사용자의 경험도 향상됩니다.

라라벨 큐는 [Amazon SQS](https://aws.amazon.com/sqs/), [Redis](https://redis.io), 관계형 데이터베이스 등 다양한 큐 백엔드에서 일관된 큐 API를 제공합니다.

큐와 관련된 라라벨의 설정값들은 애플리케이션의 `config/queue.php` 설정 파일에 저장되어 있습니다. 이 파일에서는 데이터베이스, [Amazon SQS](https://aws.amazon.com/sqs/), [Redis](https://redis.io), [Beanstalkd](https://beanstalkd.github.io/) 등 프레임워크에 포함된 다양한 큐 드라이버에 대한 커넥션 설정을 찾을 수 있습니다. 또한, 바로 실행되는 동기식 드라이버(로컬 개발 시 주로 사용)도 포함되어 있습니다. 큐 작업을 단순히 폐기하는 `null` 드라이버도 제공합니다.

> [!NOTE]
> 라라벨은 이제 Redis 기반 큐의 관리와 모니터링을 위한 아름다운 대시보드이자 설정 시스템인 Horizon을 제공합니다. 자세한 내용은 [Horizon 공식 문서](/docs/horizon)를 참고하세요.

<a name="connections-vs-queues"></a>
### 커넥션과 큐의 차이

라라벨 큐를 사용하기 전에, "커넥션(connection)"과 "큐(queue)"의 차이를 이해하는 것이 중요합니다. `config/queue.php` 설정 파일에는 `connections`라는 설정 배열이 있습니다. 이 옵션은 Amazon SQS, Beanstalk, Redis 등과 같은 백엔드 큐 서비스와의 커넥션을 정의합니다. 단, 하나의 큐 커넥션 아래에도 여러 개의 “큐”가 존재할 수 있으며, 각각을 별도의 작업 스택이나 작업 그룹처럼 생각할 수 있습니다.

`queue` 설정 파일의 각 커넥션 예제에는 `queue`라는 속성이 포함되어 있습니다. 이 속성은 해당 커넥션에서 작업을 디스패치할 때 사용할 기본 큐를 의미합니다. 즉, 작업을 디스패치할 때 특정 큐를 명시하지 않으면 이 속성에 정의된 큐 이름에 작업이 들어가게 됩니다:

```php
use App\Jobs\ProcessPodcast;

// 이 작업은 기본 커넥션의 기본 큐에 전송됩니다...
ProcessPodcast::dispatch();

// 이 작업은 기본 커넥션의 "emails" 큐에 전송됩니다...
ProcessPodcast::dispatch()->onQueue('emails');
```

어떤 애플리케이션에서는 여러 큐를 쓸 필요 없이 하나의 간단한 큐만 사용해도 충분할 수 있습니다. 하지만 여러 큐에 작업을 분산시키면, 작업을 우선순위별로 처리하거나 구분하여 작업 처리를 제어할 수 있기 때문에 더욱 유용합니다. 라라벨 큐 워커는 어떤 큐를 어떤 순서로 처리할지 직접 지정할 수 있습니다. 예를 들어 `high` 큐에 작업을 추가하고, 해당 큐의 작업을 우선적으로 처리하도록 워커를 실행하는 것도 가능합니다:

```shell
php artisan queue:work --queue=high,default
```

<a name="driver-prerequisites"></a>
### 드라이버별 안내 및 사전 준비 사항

<a name="database"></a>
#### 데이터베이스

`database` 큐 드라이버를 사용하려면, 작업을 저장할 테이블이 필요합니다. 이 테이블은 일반적으로 라라벨이 기본 제공하는 `0001_01_01_000002_create_jobs_table.php` [데이터베이스 마이그레이션](/docs/migrations)에 포함되어 있습니다. 만약 애플리케이션에 해당 마이그레이션이 없다면, `make:queue-table` 아티즌 명령어로 생성할 수 있습니다:

```shell
php artisan make:queue-table

php artisan migrate
```

<a name="redis"></a>
#### Redis

`redis` 큐 드라이버를 사용하려면, `config/database.php` 설정 파일에서 Redis 데이터베이스 커넥션을 설정해 주어야 합니다.

> [!WARNING]
> `redis` 큐 드라이버는 Redis의 `serializer` 및 `compression` 옵션을 지원하지 않습니다.

**Redis 클러스터**

Redis 큐 커넥션이 Redis 클러스터를 사용하는 경우, 큐 이름에 [키 해시 태그](https://redis.io/docs/reference/cluster-spec/#hash-tags)를 포함해야 합니다. 이는 한 큐에 대한 모든 Redis 키가 동일한 해시 슬롯에 배치되도록 하는 필수 사항입니다:

```php
'redis' => [
    'driver' => 'redis',
    'connection' => env('REDIS_QUEUE_CONNECTION', 'default'),
    'queue' => env('REDIS_QUEUE', '{default}'),
    'retry_after' => env('REDIS_QUEUE_RETRY_AFTER', 90),
    'block_for' => null,
    'after_commit' => false,
],
```

**블로킹(Blocking)**

Redis 큐를 사용할 때는 `block_for` 설정 옵션을 사용해, 드라이버가 새 작업을 기다릴 때 얼마 동안 대기할지 지정할 수 있습니다. 이 값은 워커 루프를 반복하며 Redis에서 새 작업이 생겼는지 재확인할 때까지 대기하는 시간을 의미합니다.

큐의 작업량에 맞추어 이 값을 조절하면, 계속해서 Redis 데이터베이스를 폴링하는 것보다 효율적으로 작동할 수 있습니다. 예를 들어, 이 값을 `5`로 설정하면 드라이버가 작업이 들어올 때까지 최대 5초간 대기하게 됩니다:

```php
'redis' => [
    'driver' => 'redis',
    'connection' => env('REDIS_QUEUE_CONNECTION', 'default'),
    'queue' => env('REDIS_QUEUE', 'default'),
    'retry_after' => env('REDIS_QUEUE_RETRY_AFTER', 90),
    'block_for' => 5,
    'after_commit' => false,
],
```

> [!WARNING]
> `block_for` 값을 `0`으로 설정하면, 큐 워커는 작업이 들어올 때까지 무한정 대기(블로킹)하게 됩니다. 이 경우, `SIGTERM`과 같은 신호도 다음 작업이 처리될 때까지 무시될 수 있으니 주의하세요.

<a name="other-driver-prerequisites"></a>
#### 기타 드라이버 사전 준비 사항

아래 큐 드라이버를 사용하려면 다음과 같은 의존성 패키지가 필요합니다. 이 패키지들은 Composer 패키지 관리자를 통해 설치할 수 있습니다:

<div class="content-list" markdown="1">

- Amazon SQS: `aws/aws-sdk-php ~3.0`
- Beanstalkd: `pda/pheanstalk ~5.0`
- Redis: `predis/predis ~2.0` 또는 phpredis PHP 확장
- [MongoDB](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/queues/): `mongodb/laravel-mongodb`

</div>

<a name="creating-jobs"></a>
## 작업 생성하기

<a name="generating-job-classes"></a>
### 작업 클래스 생성하기

기본적으로, 애플리케이션에서 큐에 보낼 수 있는 모든 작업(job)은 `app/Jobs` 디렉토리에 저장됩니다. 만약 `app/Jobs` 디렉토리가 없다면, `make:job` 아티즌 명령어를 실행할 때 자동으로 생성됩니다:

```shell
php artisan make:job ProcessPodcast
```

생성된 클래스는 `Illuminate\Contracts\Queue\ShouldQueue` 인터페이스를 구현하게 되며, 라라벨에게 이 작업이 큐에 올라가 비동기로 실행되어야 함을 알립니다.

> [!NOTE]
> 작업의 기본 스텁(stub: 생성될 때 사용되는 기본 틀)은 [스텁 공개 기능](/docs/artisan#stub-customization)을 이용해 커스터마이즈할 수 있습니다.

<a name="class-structure"></a>
### 클래스 구조

작업 클래스는 매우 간단합니다. 보통 큐에서 해당 작업이 처리될 때 호출되는 `handle` 메서드 하나만 가지고 있습니다. 예시로 팟캐스트 퍼블리싱 서비스를 운영하며, 업로드된 팟캐스트 파일을 공개 전에 처리하는 작업 클래스를 살펴보겠습니다:

```php
<?php

namespace App\Jobs;

use App\Models\Podcast;
use App\Services\AudioProcessor;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ProcessPodcast implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Podcast $podcast,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(AudioProcessor $processor): void
    {
        // Process uploaded podcast...
    }
}
```

이 예제에서는 [Eloquent 모델](/docs/eloquent)을 작업 클래스의 생성자에 직접 전달할 수 있음을 볼 수 있습니다. 이는 작업 클래스가 `Queueable` 트레이트를 사용하고 있기 때문이며, 이로 인해 Eloquent 모델과 로딩된 관계까지도 큐 작업으로 직렬화(serialize) 및 역직렬화(unserialize)됩니다.

만약 큐 작업의 생성자에 Eloquent 모델이 전달된 경우, 큐에 직렬화될 때는 모델 식별자만 저장됩니다. 큐 작업 실제 실행 시, 큐 시스템이 모델과 모델의 관계 데이터를 데이터베이스에서 다시 조회해 사용합니다. 이 방식은 큐에 전송되는 작업 데이터(payload) 크기를 현저히 줄일 수 있습니다.

<a name="handle-method-dependency-injection"></a>
#### `handle` 메서드 의존성 주입

`handle` 메서드는 큐에서 작업이 처리될 때 호출됩니다. 이때 handle 메서드에서 타입 힌트로 의존성을 선언할 수 있습니다. 라라벨의 [서비스 컨테이너](/docs/container)가 이 의존성 주입을 자동으로 처리해줍니다.

서비스 컨테이너의 의존성 주입 방식을 완전히 제어하고 싶을 때는 컨테이너의 `bindMethod` 메서드를 사용할 수 있습니다. 이 메서드는 작업과 컨테이너를 받는 콜백을 전달받아, 그 안에서 원하는 방식대로 handle 메서드 호출이 가능합니다. 보통 이것은 `App\Providers\AppServiceProvider` [서비스 프로바이더](/docs/providers)의 `boot` 메서드 등에서 호출합니다:

```php
use App\Jobs\ProcessPodcast;
use App\Services\AudioProcessor;
use Illuminate\Contracts\Foundation\Application;

$this->app->bindMethod([ProcessPodcast::class, 'handle'], function (ProcessPodcast $job, Application $app) {
    return $job->handle($app->make(AudioProcessor::class));
});
```

> [!WARNING]
> 바이너리 데이터(예: 이미지 원본 데이터 등)는 큐 작업에 전달하기 전에 반드시 `base64_encode` 함수를 통해 인코딩해야 합니다. 그렇지 않으면 작업이 큐에 저장될 때 JSON 직렬화가 제대로 되지 않을 수 있습니다.

<a name="handling-relationships"></a>
#### 큐잉된 관계 데이터(Queued Relationships)

큐 작업이 실행될 때 Eloquent 모델의 로딩된 관계 데이터도 함께 직렬화됩니다. 이로 인해 직렬화된 작업 문자열이 매우 커질 때가 있습니다. 또한, 작업이 역직렬화되어 모델의 관계가 다시 조회될 때는 모든 데이터를 완전히 가져오게 됩니다. 큐 작업 직렬화 시 제한을 두었던 관계(relationship)의 제약 조건은 역직렬화 시 적용되지 않으니 주의해야 합니다. 만약 특정 관계의 일부만 사용하려면, 작업 클래스 내에서 해당 관계를 다시 제한하여 조회해야 합니다.

또는 관계 데이터 직렬화를 아예 방지하고 싶으면, 모델의 값을 지정할 때 `withoutRelations` 메서드를 사용하면 됩니다. 이 메서드는 관계가 제거된 모델 인스턴스를 반환합니다:

```php
/**
 * Create a new job instance.
 */
public function __construct(
    Podcast $podcast,
) {
    $this->podcast = $podcast->withoutRelations();
}
```

PHP의 생성자 속성 프로모션(Constructor Property Promotion)을 사용할 경우, Eloquent 모델의 관계 직렬화를 방지하려면 `WithoutRelations` 어트리뷰트를 사용할 수 있습니다:

```php
use Illuminate\Queue\Attributes\WithoutRelations;

/**
 * Create a new job instance.
 */
public function __construct(
    #[WithoutRelations]
    public Podcast $podcast,
) {}
```

그리고 단일 모델이 아니라 컬렉션이나 배열로 Eloquent 모델들을 작업에 전달할 때는, 각 모델의 관계는 역직렬화 및 실행 과정에서 복원되지 않습니다. 이는 다수의 모델과 관련된 큐 작업에서 과도한 리소스 소비를 방지하기 위함입니다.

<a name="unique-jobs"></a>
### 고유 작업(Unique Jobs)

> [!WARNING]
> 고유 작업은 [락(locks)](/docs/cache#atomic-locks)을 지원하는 캐시 드라이버가 필요합니다. 현재 `memcached`, `redis`, `dynamodb`, `database`, `file`, `array` 캐시 드라이버가 원자적 락(atomic lock)을 지원합니다. 참고로, 고유 작업 제약은 작업 배치(batch) 내의 작업에는 적용되지 않습니다.

특정 작업이 한 번에 하나만 큐에 올라가 있기를 바라는 경우도 있습니다. 이럴 때는 작업 클래스에 `ShouldBeUnique` 인터페이스를 구현하면 됩니다. 별도의 추가 메서드 구현은 필요하지 않습니다:

```php
<?php

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Contracts\Queue\ShouldBeUnique;

class UpdateSearchIndex implements ShouldQueue, ShouldBeUnique
{
    // ...
}
```

위 예시에서 `UpdateSearchIndex` 작업은 고유 작업이므로, 동일한 작업이 아직 큐에서 처리되지 않았다면 새로운 작업은 큐에 올라가지 않습니다.

특정 "키"로 작업 고유성을 정의하거나, 고유 상태 유지 기간(타임아웃)을 지정하고 싶다면, 클래스에 `uniqueId` 및 `uniqueFor` 속성이나 메서드를 정의할 수 있습니다:

```php
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
     * Get the unique ID for the job.
     */
    public function uniqueId(): string
    {
        return $this->product->id;
    }
}
```

위 예제에서, `UpdateSearchIndex` 작업은 상품 ID를 기준으로 고유함을 보장합니다. 따라서 동일한 상품 ID로 이미 큐에 작업이 올라가 있는 경우, 그 작업이 처리가 완료되기 전에는 새로 디스패치된 작업은 무시됩니다. 그리고 만약 기존 작업이 1시간 내에 처리되지 않았다면, 고유 락이 해제되어 같은 키의 작업이 다시 큐에 올라갈 수 있습니다.

> [!WARNING]
> 여러 웹 서버나 컨테이너에서 작업을 디스패치한다면, 모든 서버가 같은 중앙 캐시 서버를 사용하고 있는지 꼭 확인해야 라라벨이 작업의 고유성을 제대로 판단할 수 있습니다.

<a name="keeping-jobs-unique-until-processing-begins"></a>
#### 작업 실행 시작 전까지 고유성 유지하기

기본적으로, 고유 작업은 작업 처리 완료 또는 모든 재시도 기회가 실패할 때 락이 해제(“unlock”)됩니다. 하지만, 작업이 처리되기 바로 전에 락을 해제하고 싶은 상황도 있을 수 있습니다. 이럴 때는 작업 클래스에 `ShouldBeUnique` 대신 `ShouldBeUniqueUntilProcessing` 계약(Contract)을 구현합니다:

```php
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
#### 고유 작업 락(Unique Job Locks)

내부적으로 `ShouldBeUnique` 작업이 디스패치될 때, 라라벨은 `uniqueId` 키로 [락(locks)](/docs/cache#atomic-locks)를 획득하려 시도합니다. 락 획득에 실패하면 해당 작업은 큐에 올라가지 않습니다. 락은 작업 처리 완료 또는 모든 재시도 실패 시 해제됩니다. 기본적으로 라라벨은 기본 캐시 드라이버를 이용해 이 락을 관리합니다. 하지만 락 획득에 사용할 캐시 드라이버를 변경하고 싶을 때는, 반환값으로 원하는 캐시 드라이버를 지정하는 `uniqueVia` 메서드를 정의하면 됩니다:

```php
use Illuminate\Contracts\Cache\Repository;
use Illuminate\Support\Facades\Cache;

class UpdateSearchIndex implements ShouldQueue, ShouldBeUnique
{
    // ...

    /**
     * Get the cache driver for the unique job lock.
     */
    public function uniqueVia(): Repository
    {
        return Cache::driver('redis');
    }
}
```

> [!NOTE]
> 작업의 동시 실행 제약이 필요하다면, [WithoutOverlapping](/docs/queues#preventing-job-overlaps) 작업 미들웨어를 사용하는 것이 더 적합합니다.

<a name="encrypted-jobs"></a>
### 암호화된 작업

라라벨은 [암호화](/docs/encryption)를 통해 작업 데이터의 기밀성과 무결성을 보장할 수 있도록 지원합니다. 시작하려면 작업 클래스에 `ShouldBeEncrypted` 인터페이스를 추가하면 됩니다. 이 인터페이스가 추가된 클래스는, 라라벨이 자동으로 작업 데이터를 큐에 올리기 전에 암호화합니다:

```php
<?php

use Illuminate\Contracts\Queue\ShouldBeEncrypted;
use Illuminate\Contracts\Queue\ShouldQueue;

class UpdateSearchIndex implements ShouldQueue, ShouldBeEncrypted
{
    // ...
}
```

<a name="job-middleware"></a>
## 작업 미들웨어

작업 미들웨어(Job Middleware)를 활용하면, 큐 작업 실행 전후로 커스텀 로직을 감쌀 수 있어 각 작업 클래스 내에 반복되는 코드(보일러플레이트)를 줄여줍니다. 예를 들어, 라라벨의 Redis 속도 제한 기능을 사용해 5초마다 하나의 작업만 처리할 수 있도록 하려는 경우 아래와 같이 구성할 수 있습니다:

```php
use Illuminate\Support\Facades\Redis;

/**
 * Execute the job.
 */
public function handle(): void
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

이 코드는 동작에는 문제가 없지만, handle 메서드가 Redis 속도 제한 로직으로 인해 복잡해지고, 다른 작업에서도 동일한 제한을 걸고 싶으면 해당 코드를 반복해서 사용해야 합니다.

handle 메서드 내에서 속도 제한을 직접 처리하는 대신, 별도의 작업 미들웨어에서 이 역할을 맡길 수 있습니다. 라라벨에서 작업 미들웨어의 위치는 정해져 있지 않으니, 프로젝트 내 원하는 곳에 생성하면 됩니다. 예시에서는 `app/Jobs/Middleware` 디렉토리에 미들웨어를 둔다고 가정합니다:

```php
<?php

namespace App\Jobs\Middleware;

use Closure;
use Illuminate\Support\Facades\Redis;

class RateLimited
{
    /**
     * Process the queued job.
     *
     * @param  \Closure(object): void  $next
     */
    public function handle(object $job, Closure $next): void
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

보시는 것처럼, [라우트 미들웨어](/docs/middleware)처럼 작업 미들웨어도 처리 중인 작업 객체와, 작업 처리를 계속 진행할 콜백을 인자로 받습니다.

작업 미들웨어를 만든 뒤에는, 작업 클래스의 `middleware` 메서드에서 반환값 배열에 추가하면 해당 작업에서 쓸 수 있습니다. 이 메서드는 `make:job` 아티즌 명령어로 생성된 작업에는 기본적으로 존재하지 않으니, 직접 추가해야 합니다:

```php
use App\Jobs\Middleware\RateLimited;

/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [new RateLimited];
}
```

> [!NOTE]
> 작업 미들웨어는 큐에 올라가는 이벤트 리스너, 메일러블, 알림(Notification)에도 지정할 수 있습니다.

<a name="rate-limiting"></a>
### 속도 제한(Rate Limiting)

직접 미들웨어로 속도 제한을 구현하는 대신, 라라벨이 기본 제공하는 속도 제한 미들웨어를 활용할 수도 있습니다. [라우트 속도 제한자](/docs/routing#defining-rate-limiters)처럼, 작업 속도 제한자도 `RateLimiter` 파사드의 `for` 메서드를 이용해 정의할 수 있습니다.

예를 들어, 일반 사용자는 한 시간에 한 번만 데이터 백업을 허용하고, 프리미엄 고객에게는 제한을 두지 않으려는 경우 아래와 같이 구현할 수 있습니다. 이 코드는 보통 `AppServiceProvider`의 `boot` 메서드에서 작성합니다:

```php
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    RateLimiter::for('backups', function (object $job) {
        return $job->user->vipCustomer()
            ? Limit::none()
            : Limit::perHour(1)->by($job->user->id);
    });
}
```

위 예시에서는 한 시간 기준 속도 제한을 설정했지만, `perMinute` 메서드를 사용해 분 단위로도 제한할 수 있습니다. 또한, `by` 메서드에는 원하는 모든 값을 전달할 수 있지만, 대부분 고객별로 제한을 구분하는 데 사용합니다:

```php
return Limit::perMinute(50)->by($job->user->id);
```

속도 제한자를 정의한 뒤에는, `Illuminate\Queue\Middleware\RateLimited` 미들웨어를 작업에 지정해 활용할 수 있습니다. 작업이 속도 제한을 넘길 때마다, 이 미들웨어는 대기 시간에 따라 적절히 지연시켜 다시 큐에 작업을 추가합니다.

```php
use Illuminate\Queue\Middleware\RateLimited;

/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [new RateLimited('backups')];
}
```

속도 제한에 의해 큐에 다시 올라가는 작업도 총 `attempts`(시도 횟수)가 증가하게 됩니다. 그러므로 작업 클래스의 `tries`와 `maxExceptions` 속성을 적절히 설정하거나, [retryUntil 메서드](#time-based-attempts)를 활용해 작업의 유효 기간을 조절해야 할 수 있습니다.

`releaseAfter` 메서드를 사용하면, 작업이 얼마나 대기한 후 다시 시도되어야 하는지도 직접 지정할 수 있습니다:

```php
/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new RateLimited('backups'))->releaseAfter(60)];
}
```

속도 제한을 초과할 때 작업이 아예 재시도되지 않게 하려면 `dontRelease` 메서드를 사용할 수 있습니다:

```php
/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new RateLimited('backups'))->dontRelease()];
}
```

> [!NOTE]
> Redis를 사용 중이라면, Redis에 최적화된 `Illuminate\Queue\Middleware\RateLimitedWithRedis` 미들웨어를 사용할 수 있습니다. 이 미들웨어는 일반 속도 제한 미들웨어보다 더 효율적입니다.

<a name="preventing-job-overlaps"></a>
### 작업 중복 방지

라라벨은 `Illuminate\Queue\Middleware\WithoutOverlapping` 미들웨어를 통해 임의의 키 기준으로 작업 중복 실행을 방지할 수 있습니다. 하나의 자원을 동시에 여러 작업이 수정하지 못하게 하고 싶을 때 유용합니다.

예를 들어, 큐 작업이 특정 사용자의 신용 점수를 수정한다고 할 때, 같은 사용자 ID에 대해 여러 작업이 동시에 실행되는 것을 막고 싶다면, 작업 클래스의 `middleware` 메서드에서 `WithoutOverlapping` 미들웨어를 반환하면 됩니다:

```php
use Illuminate\Queue\Middleware\WithoutOverlapping;

/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [new WithoutOverlapping($this->user->id)];
}
```

같은 유형의 중첩 작업(overlapping job)은 큐에 다시 반환됩니다. 또한, 몇 초 뒤에 다시 시도할지 설정할 수 있습니다:

```php
/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new WithoutOverlapping($this->order->id))->releaseAfter(60)];
}
```

중첩 작업이 즉시 삭제되어 재시도되지 않게 하려면 `dontRelease` 메서드를 사용합니다:

```php
/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new WithoutOverlapping($this->order->id))->dontRelease()];
}
```

`WithoutOverlapping` 미들웨어는 라라벨의 원자적 락(atomic lock) 기능을 기반으로 동작합니다. 때로는 작업이 비정상적으로 실패하거나 타임아웃되어 락이 해제되지 않을 수도 있으니, `expireAfter` 메서드로 락 만료 시간을 명시적으로 정의할 수 있습니다. 아래 예시에서는 작업 시작 후 3분이 지나면 락이 자동으로 해제되도록 지정합니다:

```php
/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new WithoutOverlapping($this->order->id))->expireAfter(180)];
}
```

> [!WARNING]
> `WithoutOverlapping` 미들웨어는 [락(locks)](/docs/cache#atomic-locks)를 지원하는 캐시 드라이버가 필요합니다. 현재 `memcached`, `redis`, `dynamodb`, `database`, `file`, `array` 드라이버가 원자적 락을 지원합니다.

<a name="sharing-lock-keys"></a>

#### 여러 잡 클래스 간의 Lock Key 공유

기본적으로 `WithoutOverlapping` 미들웨어는 같은 클래스의 잡만 중복 실행을 방지합니다. 따라서 두 개의 서로 다른 잡 클래스가 같은 lock key를 사용하더라도, 중복 실행을 막을 수 없습니다. 하지만, `shared` 메서드를 사용하면 라라벨이 이 key를 여러 잡 클래스에 걸쳐 적용하도록 지정할 수 있습니다.

```php
use Illuminate\Queue\Middleware\WithoutOverlapping;

class ProviderIsDown
{
    // ...

    public function middleware(): array
    {
        return [
            (new WithoutOverlapping("status:{$this->provider}"))->shared(),
        ];
    }
}

class ProviderIsUp
{
    // ...

    public function middleware(): array
    {
        return [
            (new WithoutOverlapping("status:{$this->provider}"))->shared(),
        ];
    }
}
```

<a name="throttling-exceptions"></a>
### 예외 트래픽 제한하기(Throttling Exceptions)

라라벨에는 예외 발생 횟수를 제한할 수 있는 `Illuminate\Queue\Middleware\ThrottlesExceptions` 미들웨어가 포함되어 있습니다. 잡이 지정된 횟수만큼 예외를 발생시키면, 이후에는 지정된 시간 동안 잡의 실행이 모두 지연됩니다. 불안정한 외부 서비스와 상호작용하는 잡에서 이 미들웨어가 특히 유용합니다.

예를 들어, 외부 API와 연동하는 잡이 예외를 발생시키기 시작했다고 가정해봅시다. 예외 트래픽을 제한하기 위해, 잡의 `middleware` 메서드에서 `ThrottlesExceptions` 미들웨어를 반환할 수 있습니다. 이 미들웨어는 [시간 기반 재시도](#time-based-attempts) 기능이 있는 잡과 함께 사용하는 것이 일반적입니다.

```php
use DateTime;
use Illuminate\Queue\Middleware\ThrottlesExceptions;

/**
 * 잡이 거쳐야 할 미들웨어를 반환합니다.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [new ThrottlesExceptions(10, 5 * 60)];
}

/**
 * 잡의 타임아웃 시각을 결정합니다.
 */
public function retryUntil(): DateTime
{
    return now()->addMinutes(30);
}
```

이 미들웨어의 첫 번째 생성자 인자는 트래픽 제한(Throttling)이 적용되기 전까지 잡이 발생시킬 수 있는 예외 횟수입니다. 두 번째 인자는 예외가 설정한 횟수만큼 발생하여 제한이 걸린 후, 잡을 다시 시도하기까지 대기할 시간(초)입니다. 위 코드 예시에서 잡이 연속적으로 10번 예외를 던지면, 5분을 기다렸다가(최대 30분 제한) 다시 실행됩니다.

잡에서 예외가 발생했으나 아직 제한치를 넘지 않은 경우, 잡은 바로 재시도되는 것이 기본 동작입니다. 하지만, 미들웨어에 `backoff` 메서드를 연결하면 잡이 재시도 되기 전 지연시킬 분(minute) 수를 지정할 수 있습니다.

```php
use Illuminate\Queue\Middleware\ThrottlesExceptions;

/**
 * 잡이 거쳐야 할 미들웨어를 반환합니다.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new ThrottlesExceptions(10, 5 * 60))->backoff(5)];
}
```

이 미들웨어는 내부적으로 라라벨의 캐시 시스템을 사용하여 레이트 리미팅을 구현하며, 잡의 클래스명을 캐시 "key"로 사용합니다. 여러 잡이 동일한 외부 서비스를 활용하고, 이 잡들이 같은 트래픽 제한 "버킷"을 공유하길 원한다면 미들웨어에 `by` 메서드를 연결하여 key를 오버라이드할 수 있습니다.

```php
use Illuminate\Queue\Middleware\ThrottlesExceptions;

/**
 * 잡이 거쳐야 할 미들웨어를 반환합니다.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new ThrottlesExceptions(10, 10 * 60))->by('key')];
}
```

기본적으로 이 미들웨어는 모든 예외를 제한 대상으로 처리합니다. 만약 제한할 예외의 종류를 제어하고 싶다면, 미들웨어에 `when` 메서드를 연결할 수 있습니다. 클로저에서 `true`가 반환되는 경우에만 해당 예외가 제한됩니다.

```php
use Illuminate\Http\Client\HttpClientException;
use Illuminate\Queue\Middleware\ThrottlesExceptions;

/**
 * 잡이 거쳐야 할 미들웨어를 반환합니다.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new ThrottlesExceptions(10, 10 * 60))->when(
        fn (Throwable $throwable) => $throwable instanceof HttpClientException
    )];
}
```

트래픽 제한에 걸린 예외를 애플리케이션의 예외 핸들러에 보고하고 싶다면, 미들웨어에 `report` 메서드를 연결하면 됩니다. 옵션으로 클로저를 전달할 수 있으며, 클로저가 `true`를 반환하는 경우에만 예외가 보고됩니다.

```php
use Illuminate\Http\Client\HttpClientException;
use Illuminate\Queue\Middleware\ThrottlesExceptions;

/**
 * 잡이 거쳐야 할 미들웨어를 반환합니다.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new ThrottlesExceptions(10, 10 * 60))->report(
        fn (Throwable $throwable) => $throwable instanceof HttpClientException
    )];
}
```

> [!NOTE]
> Redis를 사용하는 경우, `Illuminate\Queue\Middleware\ThrottlesExceptionsWithRedis` 미들웨어를 사용할 수 있습니다. 이 미들웨어는 Redis에 최적화되어 있어, 기본 예외 제한 미들웨어보다 더 효율적으로 동작합니다.

<a name="skipping-jobs"></a>
### 잡 생략(스킵)하기

`Skip` 미들웨어를 사용하면 잡의 로직을 수정하지 않고도 잡을 생략(삭제)할 수 있습니다. `Skip::when` 메서드는 주어진 조건이 `true`일 때, 잡을 삭제합니다. 반대로 `Skip::unless` 메서드는 조건이 `false`일 때, 잡을 삭제합니다.

```php
use Illuminate\Queue\Middleware\Skip;

/**
 * 잡이 거쳐야 할 미들웨어를 반환합니다.
 */
public function middleware(): array
{
    return [
        Skip::when($someCondition),
    ];
}
```

좀 더 복잡한 조건을 원하는 경우, `when`과 `unless` 메서드에 `Closure`를 전달해서 사용할 수도 있습니다.

```php
use Illuminate\Queue\Middleware\Skip;

/**
 * 잡이 거쳐야 할 미들웨어를 반환합니다.
 */
public function middleware(): array
{
    return [
        Skip::when(function (): bool {
            return $this->shouldSkip();
        }),
    ];
}
```

<a name="dispatching-jobs"></a>
## 잡 디스패치(Dispatching Jobs)

잡 클래스를 작성했다면, 이제 잡 클래스 자체의 `dispatch` 메서드를 사용하여 잡을 디스패치(큐에 등록)할 수 있습니다. `dispatch` 메서드에 전달된 인수는 잡의 생성자로 전달됩니다.

```php
<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessPodcast;
use App\Models\Podcast;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PodcastController extends Controller
{
    /**
     * 새로운 팟캐스트를 저장합니다.
     */
    public function store(Request $request): RedirectResponse
    {
        $podcast = Podcast::create(/* ... */);

        // ...

        ProcessPodcast::dispatch($podcast);

        return redirect('/podcasts');
    }
}
```

조건에 따라 잡을 디스패치하고 싶다면 `dispatchIf` 및 `dispatchUnless` 메서드를 사용할 수 있습니다.

```php
ProcessPodcast::dispatchIf($accountActive, $podcast);

ProcessPodcast::dispatchUnless($accountSuspended, $podcast);
```

새로운 라라벨 애플리케이션에서는 기본 큐 드라이버로 `sync` 드라이버가 설정되어 있습니다. 이 드라이버는 잡을 현재 요청의 전경(foreground)에서 동기적으로 실행하기 때문에 로컬 개발 단계에서는 편리합니다. 실제로 잡을 백그라운드에서 처리하고 싶다면, 애플리케이션의 `config/queue.php` 설정 파일에서 다른 큐 드라이버를 지정해야 합니다.

<a name="delayed-dispatching"></a>
### 지연된 디스패치 (Delayed Dispatching)

잡을 바로 실행하지 않고 일정 시간 뒤에 처리하고 싶다면, 잡을 디스패치할 때 `delay` 메서드를 사용할 수 있습니다. 예를 들어, 특정 잡이 디스패치된 후 10분이 지난 뒤에만 처리되도록 하려면 다음과 같이 작성할 수 있습니다.

```php
<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessPodcast;
use App\Models\Podcast;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PodcastController extends Controller
{
    /**
     * 새로운 팟캐스트를 저장합니다.
     */
    public function store(Request $request): RedirectResponse
    {
        $podcast = Podcast::create(/* ... */);

        // ...

        ProcessPodcast::dispatch($podcast)
            ->delay(now()->addMinutes(10));

        return redirect('/podcasts');
    }
}
```

경우에 따라 잡에 기본 지연 시간이 설정될 수 있습니다. 만약 이 지연을 무시하고 즉시 잡을 실행하고 싶다면 `withoutDelay` 메서드를 사용할 수 있습니다.

```php
ProcessPodcast::dispatch($podcast)->withoutDelay();
```

> [!WARNING]
> Amazon SQS 큐 서비스는 최대 지연 시간이 15분으로 제한되어 있습니다.

<a name="dispatching-after-the-response-is-sent-to-browser"></a>
#### HTTP 응답 전송 후 잡 디스패치

또한, `dispatchAfterResponse` 메서드를 사용하면 웹 서버가 FastCGI를 사용하고 있을 때, HTTP 응답이 사용자 브라우저에 전송된 후에 잡을 큐에 등록할 수 있습니다. 덕분에 잡이 실행되는 동안에도 사용자가 애플리케이션을 바로 이용할 수 있습니다. 이 방식은 이메일 전송처럼 1초 이내에 끝나는 작업에 사용하는 것이 좋습니다. 이런 방식으로 디스패치된 잡은 현재 HTTP 요청에서 처리되므로 별도의 큐 워커가 실행되고 있을 필요가 없습니다.

```php
use App\Jobs\SendNotification;

SendNotification::dispatchAfterResponse();
```

또한 `dispatch` 헬퍼로 클로저를 디스패치하고, `afterResponse` 메서드를 연결하여, HTTP 응답이 브라우저로 전송된 후 클로저를 실행할 수도 있습니다.

```php
use App\Mail\WelcomeMessage;
use Illuminate\Support\Facades\Mail;

dispatch(function () {
    Mail::to('taylor@example.com')->send(new WelcomeMessage);
})->afterResponse();
```

<a name="synchronous-dispatching"></a>
### 동기식 디스패치 (Synchronous Dispatching)

잡을 즉시(동기적으로) 실행하고 싶다면 `dispatchSync` 메서드를 사용할 수 있습니다. 이 메서드를 사용하면 잡은 큐에 쌓이지 않고, 현재 프로세스 안에서 바로 실행됩니다.

```php
<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessPodcast;
use App\Models\Podcast;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PodcastController extends Controller
{
    /**
     * 새로운 팟캐스트를 저장합니다.
     */
    public function store(Request $request): RedirectResponse
    {
        $podcast = Podcast::create(/* ... */);

        // Create podcast...

        ProcessPodcast::dispatchSync($podcast);

        return redirect('/podcasts');
    }
}
```

<a name="jobs-and-database-transactions"></a>
### 잡과 데이터베이스 트랜잭션

데이터베이스 트랜잭션 내부에서 잡을 디스패치해도 문제가 되지는 않지만, 잡이 실제로 정상적으로 실행될 수 있을지 신경 써야 합니다. 트랜잭션 내에서 잡을 디스패치하면, 잡이 워커에 의해 처리되는 시점에 부모 트랜잭션이 아직 커밋되지 않았을 수도 있습니다. 이런 경우, 트랜잭션 중에 모델이나 데이터베이스 레코드에 수정한 내용이 DB에 반영되지 않았을 수 있습니다. 심지어 트랜잭션 내에서 새로 생성한 모델이나 레코드가 아직 데이터베이스에 없을 수도 있습니다.

다행히 라라벨은 이 문제를 해결할 방법들을 제공합니다. 우선, 큐 커넥션의 설정 배열에서 `after_commit` 옵션을 설정할 수 있습니다.

```php
'redis' => [
    'driver' => 'redis',
    // ...
    'after_commit' => true,
],
```

`after_commit` 옵션이 `true`일 때, 트랜잭션 내부에서 잡을 디스패치하면 라라벨은 부모 트랜잭션이 모두 커밋될 때까지 잡의 실제 디스패치를 대기합니다. 물론, 열려 있는 트랜잭션이 없다면 잡은 곧바로 디스패치됩니다.

트랜잭션 중 예외로 인해 롤백되는 경우, 그 트랜잭션에서 디스패치된 잡들도 함께 무시(버림)됩니다.

> [!NOTE]
> `after_commit` 설정을 `true`로 하면, 큐로 등록되는 이벤트 리스너, 메일, 알림, 브로드캐스트 이벤트 등도 모두 열린 트랜잭션의 커밋 이후에 디스패치됩니다.

<a name="specifying-commit-dispatch-behavior-inline"></a>
#### 특정 잡만 커밋 이후에 디스패치 혹은 즉시 디스패치하도록 지정

큐 커넥션의 설정에서 `after_commit` 옵션을 true로 하지 않아도, 개별 잡이 열린 모든 트랜잭션 커밋 이후에 디스패치되도록 지정할 수 있습니다. 이를 위해서는 디스패치 시 `afterCommit` 메서드를 체이닝 하면 됩니다.

```php
use App\Jobs\ProcessPodcast;

ProcessPodcast::dispatch($podcast)->afterCommit();
```

반대로 큐 커넥션 설정에서 이미 `after_commit`이 `true`로 되어 있더라도, 개별 잡만 커밋을 기다리지 않고 바로 디스패치되길 원한다면 `beforeCommit` 메서드를 사용할 수 있습니다.

```php
ProcessPodcast::dispatch($podcast)->beforeCommit();
```

<a name="job-chaining"></a>
### 잡 체이닝 (Job Chaining)

잡 체이닝을 사용하면, 한 잡이 성공적으로 실행된 뒤에 순차적으로 실행할 잡 리스트를 지정할 수 있습니다. 체인 내 잡 중 하나가 실패하면, 이후 잡은 실행되지 않습니다. 체이닝 잡을 실행하려면, `Bus` 파사드에서 제공하는 `chain` 메서드를 사용할 수 있습니다. 라라벨의 커맨드 버스는 잡 디스패치의 기반이 되는 하위 레벨 컴포넌트입니다.

```php
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

잡 클래스 인스턴스뿐만 아니라 클로저도 체인에 추가할 수 있습니다.

```php
Bus::chain([
    new ProcessPodcast,
    new OptimizePodcast,
    function () {
        Podcast::update(/* ... */);
    },
])->dispatch();
```

> [!WARNING]
> 잡 내부에서 `$this->delete()` 메서드로 잡을 삭제해도, 체이닝된 이후 잡의 실행을 막지 못합니다. 체인 실행은 오직 체인 내 잡이 실패할 경우에만 중단됩니다.

<a name="chain-connection-queue"></a>
#### 체인 내 잡의 연결 및 큐 지정

체이닝된 잡이 사용할 커넥션과 큐를 지정하려면, `onConnection` 및 `onQueue` 메서드를 사용하면 됩니다. 이 메서드는 개별 잡에서 커넥션/큐를 따로 지정하지 않는 한, 체인 내 잡의 큐 커넥션 및 큐 이름을 지정합니다.

```php
Bus::chain([
    new ProcessPodcast,
    new OptimizePodcast,
    new ReleasePodcast,
])->onConnection('redis')->onQueue('podcasts')->dispatch();
```

<a name="adding-jobs-to-the-chain"></a>
#### 체인에 잡 추가하기

때때로, 체인에 속한 잡 내에서 기존 체인 앞이나 뒤에 잡을 추가해야 할 수 있습니다. 이럴 때는 `prependToChain`(체인 앞에 추가)과 `appendToChain`(체인 뒤에 추가) 메서드를 사용할 수 있습니다.

```php
/**
 * 잡 실행.
 */
public function handle(): void
{
    // ...

    // 현재 체인 앞에 추가, 현재 잡이 끝난 직후 실행...
    $this->prependToChain(new TranscribePodcast);

    // 현재 체인 끝에 추가, 체인 마지막에 실행...
    $this->appendToChain(new TranscribePodcast);
}
```

<a name="chain-failures"></a>
#### 체인 잡 실패 처리

잡 체이닝 시, 체인 내에서 실패가 발생하면 실행할 콜백을 `catch` 메서드로 지정할 수 있습니다. 전달되는 콜백은 잡 실패의 원인이 된 `Throwable` 인스턴스를 인자로 받습니다.

```php
use Illuminate\Support\Facades\Bus;
use Throwable;

Bus::chain([
    new ProcessPodcast,
    new OptimizePodcast,
    new ReleasePodcast,
])->catch(function (Throwable $e) {
    // 체인 내의 어떤 잡이 실패함...
})->dispatch();
```

> [!WARNING]
> 체인 콜백은 직렬화되어 나중에 큐 워커에 의해 실행되므로, 콜백 내부에서 `$this` 변수를 사용해서는 안 됩니다.

<a name="customizing-the-queue-and-connection"></a>
### 큐 및 커넥션 커스터마이징

<a name="dispatching-to-a-particular-queue"></a>
#### 특정 큐로 디스패치하기

잡을 서로 다른 큐로 푸시(push)하면, 잡을 구분하여 관리하거나 특정 큐에 더 많은 워커를 할당해 우선순위를 조정할 수 있습니다. 주의할 점은, 여러 큐로 푸시해도 "커넥션(Connections)"이 아니라, 하나의 커넥션 내에서 여러 개의 큐로 분류한다는 점입니다. 큐를 지정하려면 잡을 디스패치할 때 `onQueue` 메서드를 사용하세요.

```php
<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessPodcast;
use App\Models\Podcast;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PodcastController extends Controller
{
    /**
     * 새로운 팟캐스트를 저장합니다.
     */
    public function store(Request $request): RedirectResponse
    {
        $podcast = Podcast::create(/* ... */);

        // Create podcast...

        ProcessPodcast::dispatch($podcast)->onQueue('processing');

        return redirect('/podcasts');
    }
}
```

또한, 잡의 생성자 내에서 `onQueue` 메서드를 호출해 잡의 큐를 미리 지정할 수도 있습니다.

```php
<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ProcessPodcast implements ShouldQueue
{
    use Queueable;

    /**
     * 새로운 잡 인스턴스를 생성합니다.
     */
    public function __construct()
    {
        $this->onQueue('processing');
    }
}
```

<a name="dispatching-to-a-particular-connection"></a>
#### 특정 커넥션으로 디스패치하기

애플리케이션에서 여러 큐 커넥션을 사용 중이라면, `onConnection` 메서드로 잡이 푸시될 커넥션을 지정할 수 있습니다.

```php
<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessPodcast;
use App\Models\Podcast;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PodcastController extends Controller
{
    /**
     * 새로운 팟캐스트를 저장합니다.
     */
    public function store(Request $request): RedirectResponse
    {
        $podcast = Podcast::create(/* ... */);

        // Create podcast...

        ProcessPodcast::dispatch($podcast)->onConnection('sqs');

        return redirect('/podcasts');
    }
}
```

`onConnection`과 `onQueue` 메서드를 함께 연결하여, 특정 잡의 커넥션과 큐를 동시에 지정할 수도 있습니다.

```php
ProcessPodcast::dispatch($podcast)
    ->onConnection('sqs')
    ->onQueue('processing');
```

마찬가지로, 잡의 생성자에서 `onConnection` 메서드를 호출해 미리 커넥션을 지정할 수 있습니다.

```php
<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ProcessPodcast implements ShouldQueue
{
    use Queueable;

    /**
     * 새로운 잡 인스턴스를 생성합니다.
     */
    public function __construct()
    {
        $this->onConnection('sqs');
    }
}
```

<a name="max-job-attempts-and-timeout"></a>

### 최대 작업 시도 횟수 및 타임아웃 값 지정

<a name="max-attempts"></a>
#### 최대 시도 횟수

큐에 포함된 작업 중 하나에서 오류가 발생하는 경우, 해당 작업이 무한정 재시도되는 상황을 원하지 않을 수 있습니다. 이를 위해 라라벨은 작업이 시도될 수 있는 최대 횟수나 최대 기간을 지정할 수 있는 다양한 방법을 제공합니다.

가장 간단한 방법은 Artisan 명령어 라인에서 `--tries` 옵션을 사용하는 것입니다. 이 옵션을 사용하면 워커가 처리하는 모든 작업에 대해 최대 시도 횟수가 적용되며, 단, 개별 작업에서 별도로 시도 횟수를 지정한 경우에는 그 값이 우선 적용됩니다.

```shell
php artisan queue:work --tries=3
```

작업이 지정된 최대 시도 횟수를 초과할 경우, 해당 작업은 "실패"한 작업으로 간주됩니다. 실패한 작업 처리에 대한 자세한 내용은 [실패한 작업 문서](#dealing-with-failed-jobs)를 참고하세요. 만약 `queue:work` 명령어에 `--tries=0`을 지정하면, 해당 작업은 제한 없이 무한정 재시도됩니다.

좀 더 세밀하게 개별 작업마다 최대 시도 횟수를 지정하려면 작업 클래스 내에서 직접 값을 지정할 수 있습니다. 작업에서 최대 시도 횟수를 지정하면, 명령어의 `--tries` 값보다 작업 내에 선언한 값이 우선 적용됩니다.

```php
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

만약 특정 작업의 최대 시도 횟수를 동적으로 제어하고 싶다면, 작업 클래스에 `tries` 메서드를 정의하세요.

```php
/**
 * Determine number of times the job may be attempted.
 */
public function tries(): int
{
    return 5;
}
```

<a name="time-based-attempts"></a>
#### 시간 기반 시도 제한

작업이 실패하기 전까지 시도할 회수 대신, 일정 시간 이후에는 더 이상 시도하지 않도록 지정할 수도 있습니다. 이렇게 하면 주어진 시간 내에 원하는 회수만큼 얼마든지 재시도할 수 있습니다. 작업의 시도 만료 시간을 지정하려면, 작업 클래스에 `retryUntil` 메서드를 추가하고, 이 메서드는 `DateTime` 인스턴스를 반환해야 합니다.

```php
use DateTime;

/**
 * Determine the time at which the job should timeout.
 */
public function retryUntil(): DateTime
{
    return now()->addMinutes(10);
}
```

> [!NOTE]
> [큐잉된 이벤트 리스너](/docs/events#queued-event-listeners)에도 `tries` 속성이나 `retryUntil` 메서드를 정의할 수 있습니다.

<a name="max-exceptions"></a>
#### 최대 예외 횟수

작업을 여러 번 시도하도록 설정하더라도, 일정 횟수 이상의 미처리 예외가 발생할 경우에는 작업을 실패로 처리하고 싶을 수 있습니다(명시적으로 `release` 메서드로 재시도하는 경우는 제외). 이를 위해 작업 클래스에 `maxExceptions` 속성을 정의할 수 있습니다.

```php
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
     */
    public function handle(): void
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

위 예시에서, 애플리케이션이 Redis 락을 획득하지 못할 경우 10초 동안 작업이 릴리즈 되며, 최대 25회까지 재시도합니다. 하지만, 작업 수행 중 3회 미만의 미처리 예외가 발생하면 해당 작업은 실패로 간주됩니다.

<a name="timeout"></a>
#### 타임아웃

대부분의 경우, 큐 작업이 얼마나 오랫동안 실행될지 어느 정도 예측이 가능합니다. 라라벨에서는 "타임아웃" 값을 지정할 수 있는데, 기본값은 60초입니다. 만약 작업이 타임아웃 값(초 단위)보다 더 오래 실행되면, 해당 작업을 처리하는 워커는 에러와 함께 종료됩니다. 보통 워커는 [서버에 설정된 프로세스 매니저](#supervisor-configuration)에 의해 자동으로 재시작됩니다.

작업이 실행될 수 있는 최대 시간을 지정하기 위해서 Artisan 명령어의 `--timeout` 옵션을 사용할 수 있습니다.

```shell
php artisan queue:work --timeout=30
```

타임아웃이 반복적으로 누적되어 작업이 최대 시도 횟수를 초과하면 해당 작업은 실패로 기록됩니다.

각 작업 클래스 내부에서 작업이 허용되는 최대 실행 시간을 지정할 수도 있습니다. 이 경우 작업 클래스에 지정한 값이 커맨드 라인에서 지정한 타임아웃보다 우선 적용됩니다.

```php
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

때로는 소켓이나 외부 HTTP 연결 등 IO 블로킹 프로세스는 지정한 타임아웃을 무시할 수 있습니다. 그러므로 이런 기능을 사용할 때는 해당 API 자체에 타임아웃을 별도로 명시하는 것이 좋습니다. 예를 들어 Guzzle을 사용할 때는 항상 연결 및 요청 타임아웃을 직접 지정해야 합니다.

> [!WARNING]
> 작업 타임아웃을 지정하려면 반드시 `pcntl` PHP 확장 모듈이 설치되어 있어야 합니다. 또한, 작업의 "timeout" 값은 항상 ["retry after"](#job-expiration) 값보다 작게 지정해야 합니다. 그렇지 않으면, 작업이 실제로 종료되거나 타임아웃 되기 전에 재시도될 수 있습니다.

<a name="failing-on-timeout"></a>
#### 타임아웃 시 작업 실패 처리

작업이 [타임아웃](#dealing-with-failed-jobs)되었을 때 해당 작업을 "실패"로 표시하고 싶다면, 작업 클래스에 `$failOnTimeout` 속성을 정의하세요.

```php
/**
 * Indicate if the job should be marked as failed on timeout.
 *
 * @var bool
 */
public $failOnTimeout = true;
```

<a name="error-handling"></a>
### 오류 처리

작업 처리 중에 예외가 발생하면, 해당 작업은 자동으로 큐에 다시 릴리즈되어 재시도됩니다. 작업은 애플리케이션에서 허용한 최대 시도 횟수까지 계속 릴리즈되며, 최대 시도 횟수는 `queue:work` Artisan 명령어의 `--tries` 옵션 또는 개별 작업 클래스 내 설정에 의해 결정됩니다. 큐 워커 실행에 관한 자세한 내용은 [아래에서 확인할 수 있습니다](#running-the-queue-worker).

<a name="manually-releasing-a-job"></a>
#### 작업 수동 릴리즈

때로는 특정 작업을 나중에 다시 시도하게끔 수동으로 큐에 릴리즈해야 할 수도 있습니다. 이 경우 작업에서 `release` 메서드를 호출하면 됩니다.

```php
/**
 * Execute the job.
 */
public function handle(): void
{
    // ...

    $this->release();
}
```

기본적으로 `release` 메서드는 작업을 즉시 다시 큐에 릴리즈합니다. 하지만, 정수(초 단위)나 날짜 인스턴스를 `release` 메서드에 전달하면 일정 시간이 지난 후에만 해당 작업이 다시 처리될 수 있도록 지정할 수 있습니다.

```php
$this->release(10);

$this->release(now()->addSeconds(10));
```

<a name="manually-failing-a-job"></a>
#### 작업 수동 실패 처리

경우에 따라 작업을 직접 "실패"로 표시할 필요가 있을 수 있습니다. 이럴 때는 `fail` 메서드를 호출하면 됩니다.

```php
/**
 * Execute the job.
 */
public function handle(): void
{
    // ...

    $this->fail();
}
```

예외를 수신하였고, 해당 예외로 인해 작업을 실패로 처리하고 싶다면 예외 객체를 `fail` 메서드에 전달하세요. 또는 간편하게 문자열 형태의 에러 메시지를 전달하면, 라라벨이 자동으로 예외로 변환해줍니다.

```php
$this->fail($exception);

$this->fail('Something went wrong.');
```

> [!NOTE]
> 실패한 작업에 대한 자세한 내용은 [작업 실패 처리 문서](#dealing-with-failed-jobs)를 참고하세요.

<a name="job-batching"></a>
## 작업 배치 처리

라라벨의 작업 배치(batch) 기능을 이용하면 여러 개의 작업 묶음을 손쉽게 실행하고, 해당 작업들이 모두 완료된 후 추가 작업을 실행할 수도 있습니다. 시작에 앞서, 작업 배치에 대한 메타 정보를 포함할 테이블을 생성하는 마이그레이션 파일을 만들어야 합니다. 이 마이그레이션은 `make:queue-batches-table` Artisan 명령어로 생성할 수 있습니다.

```shell
php artisan make:queue-batches-table

php artisan migrate
```

<a name="defining-batchable-jobs"></a>
### 배치 처리 가능한 작업 정의

배치 처리가 가능한 작업을 정의하려면, 일반적으로 [큐잉 작업 생성](#creating-jobs)과 동일하지만 `Illuminate\Bus\Batchable` 트레잇을 작업 클래스에 추가해야 합니다. 이 트레잇을 사용하면 현재 배치 인스턴스를 반환하는 `batch` 메서드를 사용할 수 있습니다.

```php
<?php

namespace App\Jobs;

use Illuminate\Bus\Batchable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ImportCsv implements ShouldQueue
{
    use Batchable, Queueable;

    /**
     * Execute the job.
     */
    public function handle(): void
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
### 배치 작업 디스패치

여러 작업을 한 번에 배치로 디스패치하려면 `Bus` 파사드의 `batch` 메서드를 사용하세요. 배치는 주로 완료 콜백과 함께 사용할 때 유용합니다. 따라서 `then`, `catch`, `finally` 메서드를 활용해 콜백을 정의할 수 있습니다. 이 콜백들은 항상 `Illuminate\Bus\Batch` 인스턴스를 인자로 전달받습니다. 다음은 CSV 파일의 일부 행을 각 작업이 처리하도록 여러 작업을 일괄 큐잉한다고 가정한 예시입니다.

```php
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
])->before(function (Batch $batch) {
    // The batch has been created but no jobs have been added...
})->progress(function (Batch $batch) {
    // A single job has completed successfully...
})->then(function (Batch $batch) {
    // All jobs completed successfully...
})->catch(function (Batch $batch, Throwable $e) {
    // First batch job failure detected...
})->finally(function (Batch $batch) {
    // The batch has finished executing...
})->dispatch();

return $batch->id;
```

배치의 ID는 `$batch->id` 속성을 통해 접근할 수 있으며, [라라벨 버스에서 배치 정보를 조회할 때](#inspecting-batches) 사용할 수 있습니다.

> [!WARNING]
> 배치 콜백은 직렬화되어 큐에서 나중에 실행되므로, 콜백 내부에서 `$this` 변수를 사용해서는 안 됩니다. 또한, 배치 작업들은 데이터베이스 트랜잭션으로 래핑되어 있기 때문에, 암묵적으로 커밋을 발생시키는 데이터베이스 명령문을 실행해서는 안 됩니다.

<a name="naming-batches"></a>
#### 배치 이름 지정

Laravel Horizon, Laravel Telescope 등의 도구에서는 배치에 이름이 할당되어 있을 경우 좀 더 직관적인 디버그 정보를 제공할 수 있습니다. 배치에 임의의 이름을 할당하려면 `name` 메서드를 사용하세요.

```php
$batch = Bus::batch([
    // ...
])->then(function (Batch $batch) {
    // All jobs completed successfully...
})->name('Import CSV')->dispatch();
```

<a name="batch-connection-queue"></a>
#### 배치 커넥션 및 큐 지정

배치 작업에 사용할 커넥션과 큐를 지정하려면 `onConnection`과 `onQueue` 메서드를 사용할 수 있습니다. 배치에 포함된 모든 작업은 동일한 커넥션과 큐에서 실행되어야 합니다.

```php
$batch = Bus::batch([
    // ...
])->then(function (Batch $batch) {
    // All jobs completed successfully...
})->onConnection('redis')->onQueue('imports')->dispatch();
```

<a name="chains-and-batches"></a>
### 체인과 배치 조합

[체이닝된 작업](#job-chaining) 집합을 배열로 배치에 포함시켜 병렬로 실행할 수 있습니다. 예를 들어, 두 개의 작업 체인을 병렬 실행한 후, 두 체인 모두 처리 완료시 콜백을 실행할 수 있습니다.

```php
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

반대로, [체인](#job-chaining) 내부에 여러 개의 배치를 실행하도록 정의할 수도 있습니다. 예를 들어, 여러 팟캐스트를 발행하는 배치를 먼저 실행하고, 이후에 발행 알림을 보내는 작업 배치를 실행할 수 있습니다.

```php
use App\Jobs\FlushPodcastCache;
use App\Jobs\ReleasePodcast;
use App\Jobs\SendPodcastReleaseNotification;
use Illuminate\Support\Facades\Bus;

Bus::chain([
    new FlushPodcastCache,
    Bus::batch([
        new ReleasePodcast(1),
        new ReleasePodcast(2),
    ]),
    Bus::batch([
        new SendPodcastReleaseNotification(1),
        new SendPodcastReleaseNotification(2),
    ]),
])->dispatch();
```

<a name="adding-jobs-to-batches"></a>
### 배치에 작업 추가하기

경우에 따라 기존 배치 작업 내부에서 새로운 작업을 추가해야 할 때도 있습니다. 이 방식은 수천 개의 작업을 웹 요청 중에 모두 큐잉하기에는 부담이 클 때 유용합니다. 그래서 먼저 "로더(loader)" 작업들만 일괄 배치로 디스패치한 뒤, 이러한 작업들이 추가 작업들을 배치에 채워 넣는 구조를 사용할 수 있습니다.

```php
$batch = Bus::batch([
    new LoadImportBatch,
    new LoadImportBatch,
    new LoadImportBatch,
])->then(function (Batch $batch) {
    // All jobs completed successfully...
})->name('Import Contacts')->dispatch();
```

위 예제에서는 `LoadImportBatch` 작업이 추가적인 작업을 같은 배치에 등록합니다. 이를 위해, 작업 내에서 `batch` 메서드를 통해 배치 인스턴스에 접근한 뒤, `add` 메서드를 사용할 수 있습니다.

```php
use App\Jobs\ImportContacts;
use Illuminate\Support\Collection;

/**
 * Execute the job.
 */
public function handle(): void
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
> 동일한 배치에 속한 작업 내부에서만 해당 배치에 작업을 추가할 수 있습니다.

<a name="inspecting-batches"></a>
### 배치 정보 조회

배치 완료 콜백에 전달되는 `Illuminate\Bus\Batch` 인스턴스에는 다양한 속성과 메서드가 제공되어, 배치의 상태를 조회하고 상호작용할 수 있습니다.

```php
// The UUID of the batch...
$batch->id;

// The name of the batch (if applicable)...
$batch->name;

// The number of jobs assigned to the batch...
$batch->totalJobs;

// The number of jobs that have not been processed by the queue...
$batch->pendingJobs;

// The number of jobs that have failed...
$batch->failedJobs;

// The number of jobs that have been processed thus far...
$batch->processedJobs();

// The completion percentage of the batch (0-100)...
$batch->progress();

// Indicates if the batch has finished executing...
$batch->finished();

// Cancel the execution of the batch...
$batch->cancel();

// Indicates if the batch has been cancelled...
$batch->cancelled();
```

<a name="returning-batches-from-routes"></a>
#### 라우트에서 배치 객체 반환

모든 `Illuminate\Bus\Batch` 인스턴스는 JSON으로 직렬화할 수 있으므로, 라라벨 애플리케이션의 라우트에서 직접 반환하여 진행 상황 등 배치 정보를 JSON 페이로드 형태로 바로 받아볼 수 있습니다. 이를 활용하면 애플리케이션 UI에서 배치 처리 진행 상황을 간편하게 표시할 수 있습니다.

특정 ID의 배치를 조회하려면, `Bus` 파사드의 `findBatch` 메서드를 사용하세요.

```php
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Route;

Route::get('/batch/{batchId}', function (string $batchId) {
    return Bus::findBatch($batchId);
});
```

<a name="cancelling-batches"></a>
### 배치 취소

특정 배치의 실행을 중단해야 할 때도 있습니다. 이럴 때는 `Illuminate\Bus\Batch` 인스턴스의 `cancel` 메서드를 호출하면 됩니다.

```php
/**
 * Execute the job.
 */
public function handle(): void
{
    if ($this->user->exceedsImportLimit()) {
        return $this->batch()->cancel();
    }

    if ($this->batch()->cancelled()) {
        return;
    }
}
```

위와 같이, 일반적으로 배치에 속한 각 작업은 실행 전에 해당 배치가 취소되었는지 확인하는 절차를 거쳐야 합니다. 번거롭다면, [미들웨어](#job-middleware) 중 `SkipIfBatchCancelled`를 작업에 지정할 수 있습니다. 이 미들웨어는 배치가 취소된 경우 해당 작업이 처리되지 않도록 자동으로 건너뜁니다.

```php
use Illuminate\Queue\Middleware\SkipIfBatchCancelled;

/**
 * Get the middleware the job should pass through.
 */
public function middleware(): array
{
    return [new SkipIfBatchCancelled];
}
```

<a name="batch-failures"></a>
### 배치 실패

배치에 속한 작업이 실패하면, `catch` 콜백(정의된 경우)이 호출됩니다. 단, 이 콜백은 해당 배치에서 "처음으로 실패한 작업"에 대해서만 호출됩니다.

<a name="allowing-failures"></a>
#### 실패 허용

배치 내 작업이 실패하면, 라라벨은 기본적으로 해당 배치를 자동으로 "취소됨" 상태로 표시합니다. 만약 이러한 동작을 비활성화하여, 개별 작업의 실패가 배치 전체를 자동으로 취소 처리하지 않도록 하려면, 배치 디스패치 시 `allowFailures` 메서드를 호출하세요.

```php
$batch = Bus::batch([
    // ...
])->then(function (Batch $batch) {
    // All jobs completed successfully...
})->allowFailures()->dispatch();
```

<a name="retrying-failed-batch-jobs"></a>
#### 실패한 배치 작업 재시도

편의상, 라라벨은 `queue:retry-batch` Artisan 명령어를 제공하여, 지정한 배치의 실패한 모든 작업을 손쉽게 재시도할 수 있게 합니다. `queue:retry-batch` 명령어는 실패한 작업을 재시도하고자 하는 배치의 UUID 값을 인수로 받습니다.

```shell
php artisan queue:retry-batch 32dbc76c-4f82-4749-b610-a639fe0099b5
```

<a name="pruning-batches"></a>
### 배치 데이터 정리(Pruning)

정리 작업을 하지 않으면 `job_batches` 테이블에 배치 이력이 매우 빠르게 누적될 수 있습니다. 이를 방지하려면, `queue:prune-batches` Artisan 명령어를 [스케줄러](/docs/scheduling)에 등록하여 매일 자동 실행되도록 하세요.

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('queue:prune-batches')->daily();
```

기본적으로, 처리 완료 후 24시간이 지난 모든 배치가 자동으로 삭제됩니다. 보관 기간을 조정하려면, 명령어 실행 시 `hours` 옵션을 사용할 수 있습니다. 예를 들어, 다음 명령어는 48시간 이전에 완료된 배치를 모두 삭제합니다.

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('queue:prune-batches --hours=48')->daily();
```

경우에 따라 `jobs_batches` 테이블에는 작업이 모두 성공적으로 완료되지 못한, 즉 실패 후 재시도가 성공적으로 끝나지 않은 배치들이 남을 수 있습니다. 이처럼 미완료 배치 레코드도 `unfinished` 옵션으로 정리할 수 있습니다.

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('queue:prune-batches --hours=48 --unfinished=72')->daily();
```

마찬가지로, 취소된 배치에 대한 레코드도 남을 수 있습니다. 이러한 경우에는 `cancelled` 옵션으로 취소된 배치 레코드를 정리할 수 있습니다.

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('queue:prune-batches --hours=48 --cancelled=72')->daily();
```

<a name="storing-batches-in-dynamodb"></a>

### 배치 정보의 DynamoDB 저장

라라벨은 관계형 데이터베이스 대신 [DynamoDB](https://aws.amazon.com/dynamodb)에 배치 메타 정보를 저장하는 것도 지원합니다. 단, 모든 배치 레코드를 저장할 DynamoDB 테이블을 직접 생성해야 합니다.

일반적으로 이 테이블의 이름은 `job_batches`이어야 하지만, 애플리케이션의 `queue` 설정 파일 내 `queue.batching.table` 설정 값에 맞게 테이블 이름을 지정해야 합니다.

<a name="dynamodb-batch-table-configuration"></a>
#### DynamoDB 배치 테이블 구성

`job_batches` 테이블에는 문자열 타입의 기본 파티션 키 `application`과 문자열 타입의 기본 정렬 키 `id`가 필요합니다. 이 중 `application` 키에는 애플리케이션의 `app` 설정 파일에서 정의한 `name` 설정값이 들어갑니다. 애플리케이션 이름이 DynamoDB 테이블의 키 일부로 활용되기 때문에, 여러 라라벨 애플리케이션의 작업 배치를 하나의 테이블에 저장할 수 있습니다.

또한, [자동 배치 정리](#pruning-batches-in-dynamodb) 기능을 활용하려면 테이블에 `ttl` 속성을 추가할 수 있습니다.

<a name="dynamodb-configuration"></a>
#### DynamoDB 설정

이제 라라벨 애플리케이션이 Amazon DynamoDB와 통신할 수 있도록 AWS SDK를 설치해야 합니다:

```shell
composer require aws/aws-sdk-php
```

그 다음, `queue.batching.driver` 설정 값을 `dynamodb`로 지정합니다. 그리고 `batching` 설정 배열에 `key`, `secret`, `region` 값을 정의해야 합니다. 이 옵션들은 AWS 인증에 사용됩니다. `dynamodb` 드라이버를 사용할 때는 `queue.batching.database` 설정 옵션이 필요하지 않습니다:

```php
'batching' => [
    'driver' => env('QUEUE_BATCHING_DRIVER', 'dynamodb'),
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    'table' => 'job_batches',
],
```

<a name="pruning-batches-in-dynamodb"></a>
#### DynamoDB에서 배치 자동 정리

[Amazon DynamoDB](https://aws.amazon.com/dynamodb)에 작업 배치 정보를 저장할 때, 관계형 데이터베이스에 저장한 배치를 정리할 때 사용하는 일반적인 명령어는 사용할 수 없습니다. 대신, [DynamoDB의 기본 TTL(Time-To-Live) 기능](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html)을 활용하여 오래된 배치 레코드를 자동으로 삭제할 수 있습니다.

테이블 생성 시 `ttl` 속성을 추가했다면, 라라벨에서 배치 레코드가 어떻게 정리될지 설정할 수 있습니다. `queue.batching.ttl_attribute` 설정 값에는 TTL이 저장되는 속성 이름을, `queue.batching.ttl` 값에는 레코드가 마지막으로 업데이트된 이후 삭제되기까지의 시간(초 단위)을 지정합니다:

```php
'batching' => [
    'driver' => env('QUEUE_FAILED_DRIVER', 'dynamodb'),
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    'table' => 'job_batches',
    'ttl_attribute' => 'ttl',
    'ttl' => 60 * 60 * 24 * 7, // 7일...
],
```

<a name="queueing-closures"></a>
## 클로저(Closure) 큐잉

작업 클래스 대신 클로저(익명 함수)를 큐에 보낼 수도 있습니다. 이는 현재 요청 사이클과 별도로 빠르고 간단한 작업을 실행해야 할 때 유용합니다. 클로저를 큐에 보낼 경우, 클로저의 코드 내용은 암호학적으로 서명되어 전송 중에 수정될 수 없습니다:

```php
$podcast = App\Podcast::find(1);

dispatch(function () use ($podcast) {
    $podcast->publish();
});
```

큐에 들어가는 클로저에 이름을 부여해 큐 대시보드에 표시하거나 `queue:work` 명령어에서 볼 수 있도록 하려면 `name` 메서드를 사용할 수 있습니다:

```php
dispatch(function () {
    // ...
})->name('Publish Podcast');
```

`catch` 메서드를 사용하면, 큐에 등록된 클로저가 [설정된 재시도 횟수](#max-job-attempts-and-timeout)를 모두 소진하고도 실패할 경우 실행할 클로저를 지정할 수 있습니다:

```php
use Throwable;

dispatch(function () use ($podcast) {
    $podcast->publish();
})->catch(function (Throwable $e) {
    // 이 작업은 실패했습니다...
});
```

> [!WARNING]
> `catch` 콜백 함수는 직렬화되어 라라벨 큐가 추후 실행하므로, `catch` 콜백 내부에서는 `$this` 변수를 사용하면 안 됩니다.

<a name="running-the-queue-worker"></a>
## 큐 워커 실행하기

<a name="the-queue-work-command"></a>
### `queue:work` 명령어

라라벨에는 큐 워커를 시작하여 큐에 작업이 추가되는 즉시 처리를 시작하는 Artisan 명령어가 내장되어 있습니다. `queue:work` Artisan 명령어를 사용하여 워커를 실행할 수 있습니다. 이 명령어는 시작되면 수동으로 중지하거나 터미널을 닫을 때까지 계속 실행됩니다:

```shell
php artisan queue:work
```

> [!NOTE]
> `queue:work` 프로세스를 백그라운드에서 항상 실행되게 하려면, [Supervisor](#supervisor-configuration)와 같은 프로세스 관리자를 이용해 워커가 자동으로 재시작되도록 구성해야 합니다.

작업 처리 시 ID를 출력에 포함하고 싶다면 `-v` 옵션을 사용해 보세요:

```shell
php artisan queue:work -v
```

큐 워커는 장시간 살아있는 프로세스이며, 부팅 시의 애플리케이션 상태를 메모리에 저장합니다. 따라서 워커가 시작된 후 코드가 변경되어도 이를 즉시 반영하지 않습니다. 배포 과정에서는 반드시 [큐 워커를 재시작](#queue-workers-and-deployment)해야 합니다. 또한 애플리케이션에서 생성하거나 수정한 모든 정적 상태(static state)는 작업 간 자동으로 초기화되지 않는다는 점을 주의하세요.

또한 `queue:listen` 명령어로 워커를 실행할 수도 있습니다. `queue:listen`을 사용하면 코드를 업데이트하거나 애플리케이션 상태를 초기화하고 싶을 때 수동으로 워커를 재시작할 필요가 없습니다. 단, 이 명령어는 `queue:work` 명령어보다 성능이 떨어집니다:

```shell
php artisan queue:listen
```

<a name="running-multiple-queue-workers"></a>
#### 여러 큐 워커 실행

여러 워커를 큐에 할당하여 작업을 병렬로 처리하고 싶다면, 단순히 여러 개의 `queue:work` 프로세스를 실행하면 됩니다. 로컬에서는 터미널의 여러 탭을 사용할 수 있고, 운영 환경에서는 프로세스 관리자의 설정을 이용하세요. [Supervisor 사용 시](#supervisor-configuration)에는 `numprocs` 설정 값을 활용합니다.

<a name="specifying-the-connection-queue"></a>
#### 커넥션(Connection) 및 큐 지정

워커가 사용할 큐 커넥션을 명시적으로 지정할 수 있습니다. 커넥션 이름은 `config/queue.php` 설정 파일에 정의된 커넥션 중 하나여야 합니다:

```shell
php artisan queue:work redis
```

기본적으로 `queue:work` 명령어는 해당 커넥션의 기본 큐에 대해서만 작업을 처리합니다. 특정 큐만 처리하도록 워커를 더 세밀하게 설정할 수 있습니다. 예를 들어, 모든 이메일을 `redis` 커넥션의 `emails` 큐에서 처리하고 있다면, 아래와 같이 해당 큐만 처리하는 워커를 실행할 수 있습니다:

```shell
php artisan queue:work redis --queue=emails
```

<a name="processing-a-specified-number-of-jobs"></a>
#### 지정한 개수만큼 작업 처리

`--once` 옵션을 사용하면, 워커가 큐에서 한 건의 작업만 처리하도록 할 수 있습니다:

```shell
php artisan queue:work --once
```

`--max-jobs` 옵션을 사용하면, 지정한 개수의 작업을 처리한 후 워커가 종료됩니다. 이 옵션은 [Supervisor](#supervisor-configuration)와 함께 사용하면, 워커가 일정량의 작업을 처리한 후 자동으로 재시작되어 누적된 메모리를 해제하는 데 도움이 됩니다:

```shell
php artisan queue:work --max-jobs=1000
```

<a name="processing-all-queued-jobs-then-exiting"></a>
#### 큐에 쌓인 모든 작업 처리 후 종료

`--stop-when-empty` 옵션을 사용하면, 워커가 남아 있는 모든 작업을 처리한 후 정상적으로 종료되도록 할 수 있습니다. 이 옵션은 Docker 컨테이너 안에서 라라벨 큐를 처리하고, 큐가 빌 때 컨테이너를 종료하려는 경우에 유용합니다:

```shell
php artisan queue:work --stop-when-empty
```

<a name="processing-jobs-for-a-given-number-of-seconds"></a>
#### 지정한 시간(초) 동안 작업 처리

`--max-time` 옵션을 사용하면, 워커가 지정한 시간(초) 동안 작업을 처리한 뒤 자동으로 종료됩니다. 이 옵션은 [Supervisor](#supervisor-configuration)와 함께 사용해, 워커가 일정 시간마다 자동으로 재시작되어 메모리를 해제할 수 있습니다:

```shell
# 한 시간 동안만 작업 처리 후 종료
php artisan queue:work --max-time=3600
```

<a name="worker-sleep-duration"></a>
#### 워커의 대기(sleep) 시간

큐에 작업이 있으면 워커는 지연 없이 계속해서 작업을 처리합니다. 하지만 대기 중인 작업이 없는 경우, `sleep` 옵션에 지정한 시간(초)만큼 워커가 "잠들게" 할 수 있습니다. 워커가 잠든 동안에는 새로운 작업을 처리하지 않습니다:

```shell
php artisan queue:work --sleep=3
```

<a name="maintenance-mode-queues"></a>
#### 유지보수 모드와 큐

애플리케이션이 [유지보수 모드](/docs/configuration#maintenance-mode)일 때는 큐 작업이 처리되지 않습니다. 유지보수 모드 해제 후에는 평소처럼 큐 작업이 처리됩니다.

유지보수 모드일 때도 강제로 큐 워커가 작업을 처리하게 하려면, `--force` 옵션을 사용할 수 있습니다:

```shell
php artisan queue:work --force
```

<a name="resource-considerations"></a>
#### 리소스 관련 주의사항

데몬 형태의 큐 워커는 각 작업을 처리하기 전 프레임워크를 "리부트"하지 않습니다. 따라서 무거운 리소스는 매 작업 완료 후 해제해 주어야 합니다. 예를 들어 GD 라이브러리로 이미지 작업을 했다면, 작업이 끝난 후 `imagedestroy`로 메모리를 해제해야 합니다.

<a name="queue-priorities"></a>
### 큐 우선순위 지정

경우에 따라 큐 처리 순서를 우선순위별로 조정하고 싶을 수 있습니다. 예를 들어, `config/queue.php` 설정 파일에서 `redis` 커넥션의 기본 `queue`를 `low`로 설정했다 하더라도, 때로는 다음과 같이 `high` 우선순위 큐로 작업을 보낼 수 있습니다:

```php
dispatch((new Job)->onQueue('high'));
```

`high` 큐에 있는 작업을 모두 처리한 후에야 `low` 큐의 작업을 처리하게 하려면, `work` 명령어에 큐 이름을 콤마로 구분하여 전달합니다:

```shell
php artisan queue:work --queue=high,low
```

<a name="queue-workers-and-deployment"></a>
### 배포 시 큐 워커 관리

큐 워커는 장기간 동작하는 프로세스이므로, 코드가 변경되어도 워커가 자동으로 이를 감지하지 않습니다. 따라서 큐 워커를 사용하는 애플리케이션을 배포할 때는 워커를 반드시 재시작해야 합니다. 모든 워커를 정상적으로 재시작하려면 아래 명령어를 사용하세요:

```shell
php artisan queue:restart
```

이 명령어는 모든 큐 워커에게 현재 작업을 마치면 정상적으로 종료하라는 신호를 보냅니다. 기존 작업이 손실되는 일은 없습니다. `queue:restart` 명령어 실행 시 큐 워커가 종료되므로, [Supervisor](#supervisor-configuration)와 같은 프로세스 관리자를 통해 워커가 자동으로 재시작되게 해야 합니다.

> [!NOTE]
> 큐는 [캐시](/docs/cache)에 재시작 신호를 저장하므로, 이 기능을 사용하기 전에 애플리케이션에 적절한 캐시 드라이버가 설정되었는지 확인하세요.

<a name="job-expirations-and-timeouts"></a>
### 작업 만료 및 타임아웃

<a name="job-expiration"></a>
#### 작업 만료

`config/queue.php` 설정 파일에서 각 큐 커넥션에는 `retry_after` 옵션이 있습니다. 이 옵션은 작업 처리 중 일정 시간이 초과될 경우, 해당 작업을 언제 다시 큐에 제출할지 지정합니다. 예를 들어, `retry_after` 값이 `90`이면, 작업이 90초 동안 처리되고도 해결(삭제)되지 않으면 다시 큐에 돌아갑니다. 이 값은 작업이 정상적으로 완료될 때까지 허용할 최대 시간을 기준으로 정해야 합니다.

> [!WARNING]
> `retry_after` 값이 없는 유일한 큐 커넥션은 Amazon SQS입니다. SQS는 [기본 가시성 제한 시간](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/AboutVT.html)(Default Visibility Timeout)에 따라 자동으로 작업을 재시도합니다.

<a name="worker-timeouts"></a>
#### 워커 타임아웃

`queue:work` Artisan 명령어는 기본적으로 60초인 `--timeout` 옵션을 제공합니다. 작업 처리 시간이 지정한 타임아웃(초)보다 오래 걸리면, 해당 작업을 처리하던 워커가 에러와 함께 종료됩니다. 일반적으로 [서버에 설정된 프로세스 관리자](#supervisor-configuration)가 워커를 자동으로 재시작합니다:

```shell
php artisan queue:work --timeout=60
```

`retry_after` 설정 옵션과 `--timeout` CLI 옵션은 각각 다르지만, 함께 동작해 작업 손실 방지 및 중복 작업 방지를 보장합니다.

> [!WARNING]
> `--timeout` 값은 항상 `retry_after` 값보다 몇 초 이상 작아야 합니다. 그래야 멈춘 작업을 처리하던 워커가 먼저 종료되고, 그 후에야 해당 작업이 재시도됩니다. 만약 `--timeout` 값이 `retry_after`보다 길면, 동일 작업이 중복 처리될 수 있습니다.

<a name="supervisor-configuration"></a>
## Supervisor 설정

운영 환경에서는 `queue:work` 프로세스가 항상 실행되도록 관리해야 합니다. 워커 프로세스가 시간이 초과되거나 `queue:restart` 명령어 실행 등 여러 이유로 종료될 수 있기 때문입니다.

이러한 이유로, `queue:work` 프로세스가 종료될 때 이를 감지하고 자동으로 재시작할 수 있는 프로세스 관리자를 설정해야 합니다. 추가로, 프로세스 관리자는 동시에 몇 개의 `queue:work` 프로세스를 실행할 것인지도 지정할 수 있습니다. Supervisor는 리눅스 환경에서 널리 사용되는 프로세스 관리자이며, 다음 항목에서 Supervisor 설정 방법을 다룹니다.

<a name="installing-supervisor"></a>
#### Supervisor 설치

Supervisor는 리눅스 운영체제용 프로세스 관리자로, `queue:work` 프로세스가 실패 시 자동으로 재시작해줍니다. Ubuntu에서 Supervisor를 설치하려면 다음 명령어를 사용하세요:

```shell
sudo apt-get install supervisor
```

> [!NOTE]
> Supervisor 설정과 관리를 직접 하기가 부담스럽다면, [Laravel Cloud](https://cloud.laravel.com)와 같은 완전 관리형 라라벨 큐 워커 플랫폼을 이용하는 것도 좋은 방법입니다.

<a name="configuring-supervisor"></a>
#### Supervisor 구성

Supervisor 설정 파일은 일반적으로 `/etc/supervisor/conf.d` 디렉토리에 저장됩니다. 이 디렉토리에 여러 개의 설정 파일을 만들어, Supervisor가 각 프로세스를 어떻게 관리할지 지시할 수 있습니다. 예를 들어, `laravel-worker.conf` 파일을 만들어 여러 개의 `queue:work` 프로세스를 관리할 수 있습니다:

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

이 예제에서, `numprocs` 지시문은 Supervisor가 8개의 `queue:work` 프로세스를 실행 및 모니터링하도록 지정합니다. 또한, 명령어( command ) 부분은 자신이 사용할 큐 커넥션과 워커 옵션에 맞게 수정해야 합니다.

> [!WARNING]
> `stopwaitsecs` 값이 가장 오래 걸리는 작업의 실행 시간보다 커야 합니다. 그렇지 않으면 Supervisor가 작업 완료 전에 프로세스를 강제 종료할 수 있습니다.

<a name="starting-supervisor"></a>
#### Supervisor 시작하기

설정 파일을 만들었으면, 아래 명령어로 Supervisor 설정을 갱신하고 프로세스를 시작할 수 있습니다:

```shell
sudo supervisorctl reread

sudo supervisorctl update

sudo supervisorctl start "laravel-worker:*"
```

Supervisor에 대한 자세한 설명은 [Supervisor 공식 문서](http://supervisord.org/index.html)를 참고하세요.

<a name="dealing-with-failed-jobs"></a>
## 실패한 작업(잡) 처리

큐에 등록한 작업이 실패하는 경우도 있을 수 있습니다. 걱정하지 마세요! 라라벨은 [작업 재시도 최대 횟수 지정](#max-job-attempts-and-timeout) 및 관리 방법을 제공합니다. 비동기 작업이 지정한 시도 횟수를 초과하면, 해당 작업은 `failed_jobs` 데이터베이스 테이블에 저장됩니다. [동기식으로 디스패치된 작업](/docs/queues#synchronous-dispatching)이 실패할 경우에는 이 테이블에 저장되지 않고, 예외가 즉시 애플리케이션에서 처리됩니다.

신규 라라벨 애플리케이션에는 `failed_jobs` 테이블 생성을 위한 마이그레이션이 이미 포함되어 있습니다. 만약 없다면 `make:queue-failed-table` 명령어로 마이그레이션을 생성할 수 있습니다:

```shell
php artisan make:queue-failed-table

php artisan migrate
```

[큐 워커](#running-the-queue-worker) 프로세스를 실행할 때, `queue:work` 명령어에 `--tries` 옵션으로 작업 시도 최대 횟수를 지정할 수 있습니다. 값을 명시하지 않으면 각 작업 클래스의 `$tries` 속성값, 또는 기본값(1회)이 적용됩니다:

```shell
php artisan queue:work redis --tries=3
```

`--backoff` 옵션을 사용하면, 예외가 발생한 작업을 다시 시도하기 전 라라벨이 얼마큼 대기할지(초 단위) 지정할 수 있습니다. 기본적으로, 작업은 즉시 다시 큐로 반환되어 재시도됩니다:

```shell
php artisan queue:work redis --tries=3 --backoff=3
```

작업별로 예외 후 재시도 대기(백오프) 시간을 지정하려면, 작업 클래스에 `backoff` 속성을 정의할 수 있습니다:

```php
/**
 * 이 작업을 재시도하기 전 대기할 시간(초 단위)
 *
 * @var int
 */
public $backoff = 3;
```

더 복잡한 로직이 필요하다면, `backoff` 메서드를 정의할 수도 있습니다:

```php
/**
 * 이 작업을 재시도하기 전 대기할 시간(초 단위)을 계산합니다.
 */
public function backoff(): int
{
    return 3;
}
```

"지수형" 백오프(exponential backoff)도 쉽게 설정 가능합니다. `backoff` 메서드에서 값 배열을 반환하면, 첫 재시도는 1초 후, 두 번째 재시도는 5초 후, 세 번째 재시도는 10초 후, 그 이후 재시도는 10초 후마다 이루어집니다:

```php
/**
 * 이 작업을 재시도하기 전 대기할 시간(초 단위) 배열을 반환합니다.
 *
 * @return array<int, int>
 */
public function backoff(): array
{
    return [1, 5, 10];
}
```

<a name="cleaning-up-after-failed-jobs"></a>
### 실패한 작업 후 정리

특정 작업이 실패하면, 사용자에게 알림을 전송하거나, 작업 중 일부만 완료된 상태를 되돌리고 싶을 수 있습니다. 이를 위해 작업 클래스에 `failed` 메서드를 정의하면, 작업 실패 시 예외 객체(`Throwable` 인스턴스)가 이 메서드로 전달됩니다:

```php
<?php

namespace App\Jobs;

use App\Models\Podcast;
use App\Services\AudioProcessor;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Throwable;

class ProcessPodcast implements ShouldQueue
{
    use Queueable;

    /**
     * 새로운 작업 인스턴스 생성자
     */
    public function __construct(
        public Podcast $podcast,
    ) {}

    /**
     * 작업 처리
     */
    public function handle(AudioProcessor $processor): void
    {
        // 업로드된 팟캐스트 처리...
    }

    /**
     * 작업 실패 처리
     */
    public function failed(?Throwable $exception): void
    {
        // 사용자에게 실패 알림 전송 등...
    }
}
```

> [!WARNING]
> `failed` 메서드 호출 전, 새로운 작업 인스턴스가 생성됩니다. 따라서 `handle` 메서드 내부에서 수정된 클래스 속성 값은 사라집니다.

<a name="retrying-failed-jobs"></a>
### 실패한 작업 재시도

`failed_jobs` 데이터베이스 테이블에 저장된 모든 실패한 작업을 조회하려면 `queue:failed` Artisan 명령어를 사용할 수 있습니다:

```shell
php artisan queue:failed
```

`queue:failed` 명령어는 작업 ID, 커넥션, 큐, 실패 시간 등 여러 정보를 출력합니다. 작업 ID를 사용해 실패한 작업을 재시도할 수 있습니다. 예를 들어, ID가 `ce7bb17c-cdd8-41f0-a8ec-7b4fef4e5ece`인 작업을 재시도하려면 아래와 같이 실행하세요:

```shell
php artisan queue:retry ce7bb17c-cdd8-41f0-a8ec-7b4fef4e5ece
```

여러 개의 ID를 동시에 지정하여 재시도할 수도 있습니다:

```shell
php artisan queue:retry ce7bb17c-cdd8-41f0-a8ec-7b4fef4e5ece 91401d2c-0784-4f43-824c-34f94a33c24d
```

특정 큐의 실패 작업만 재시도할 수도 있습니다:

```shell
php artisan queue:retry --queue=name
```

모든 실패한 작업을 한 번에 재시도하려면 `all`을 인자로 건네면 됩니다:

```shell
php artisan queue:retry all
```

실패한 작업을 삭제하려면 `queue:forget` 명령어를 사용할 수 있습니다:

```shell
php artisan queue:forget 91401d2c-0784-4f43-824c-34f94a33c24d
```

> [!NOTE]
> [Horizon](/docs/horizon)를 사용하는 경우, 실패한 작업을 삭제할 때는 `queue:forget` 대신 `horizon:forget` 명령어를 사용해야 합니다.

`failed_jobs` 테이블의 모든 실패한 작업을 삭제하려면 `queue:flush` 명령어를 사용하세요:

```shell
php artisan queue:flush
```

<a name="ignoring-missing-models"></a>
### 사라진 모델 무시

작업에 Eloquent 모델을 주입하면, 작업이 큐에 들어갈 때 모델이 직렬화되어 저장되고, 작업 처리 시 데이터베이스에서 다시 조회됩니다. 하지만 작업 대기 중 해당 모델이 삭제되면, 작업 처리 시 `ModelNotFoundException` 예외가 발생할 수 있습니다.

이 경우, 작업 클래스의 `deleteWhenMissingModels` 속성을 `true`로 설정하면, 라라벨이 예외를 발생시키지 않고 조용히 해당 작업을 삭제합니다:

```php
/**
 * 모델이 더 이상 존재하지 않을 때 작업 삭제
 *
 * @var bool
 */
public $deleteWhenMissingModels = true;
```

<a name="pruning-failed-jobs"></a>
### 실패한 작업 정리(Pruning)

애플리케이션의 `failed_jobs` 테이블에 기록된 데이터를 아래 Artisan 명령어로 정리할 수 있습니다:

```shell
php artisan queue:prune-failed
```

기본적으로, 24시간이 지난 모든 실패 작업 레코드는 정리(삭제)됩니다. `--hours` 옵션을 지정하면, 최근 N시간 이내에 생성된 레코드만 남기고 그 이전의 기록은 삭제합니다. 예를 들어, 아래 명령어는 48시간이 지난 모든 실패 작업을 삭제합니다:

```shell
php artisan queue:prune-failed --hours=48
```

<a name="storing-failed-jobs-in-dynamodb"></a>
### 실패한 작업을 DynamoDB에 저장

라라벨은 [DynamoDB](https://aws.amazon.com/dynamodb)에 실패한 작업을 저장하는 기능도 지원합니다. 단, DynamoDB 테이블은 직접 생성해야 합니다. 일반적으로 테이블 이름은 `failed_jobs`이나, 테이블 이름은 애플리케이션의 `queue` 설정 파일에서 `queue.failed.table` 값에 따라 지정해야 합니다.

`failed_jobs` 테이블에는 문자열 타입의 기본 파티션 키 `application`과 문자열 타입의 기본 정렬 키 `uuid`가 필요합니다. `application` 키는 애플리케이션의 `app` 설정 파일에서 지정한 `name` 설정값을 포함합니다. 이처럼 애플리케이션 이름이 DynamoDB 키의 일부이므로, 여러 라라벨 애플리케이션의 실패한 작업을 하나의 테이블에 저장할 수 있습니다.

또한 AWS SDK가 설치되어 있어야, 라라벨 애플리케이션이 Amazon DynamoDB와 통신할 수 있습니다:

```shell
composer require aws/aws-sdk-php
```

그 다음, `queue.failed.driver` 설정 값을 `dynamodb`로 지정합니다. 그리고 실패한 작업 설정 배열에 `key`, `secret`, `region`을 정의해야 합니다. 이 옵션들은 AWS 인증에 사용됩니다. `dynamodb` 드라이버를 사용하는 경우, `queue.failed.database` 설정은 필요하지 않습니다:

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

`queue.failed.driver` 설정 값을 `null`로 지정하면, 실패한 작업을 데이터베이스에 저장하지 않고 바로 버리도록 라라벨에게 지시할 수 있습니다. 이는 일반적으로 `QUEUE_FAILED_DRIVER` 환경 변수로 설정합니다:

```ini
QUEUE_FAILED_DRIVER=null
```

<a name="failed-job-events"></a>
### 실패한 작업 이벤트

작업이 실패했을 때 실행되는 이벤트 리스너를 등록하려면, `Queue` 파사드의 `failing` 메서드를 사용할 수 있습니다. 예를 들어, 라라벨의 `AppServiceProvider` 클래스의 `boot` 메서드에서 클로저를 등록할 수 있습니다:

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Queue;
use Illuminate\Support\ServiceProvider;
use Illuminate\Queue\Events\JobFailed;

class AppServiceProvider extends ServiceProvider
{
    /**
     * 애플리케이션 서비스 등록
     */
    public function register(): void
    {
        // ...
    }

    /**
     * 애플리케이션 서비스 부트스트랩
     */
    public function boot(): void
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
> [Horizon](/docs/horizon)을 사용할 경우, `queue:clear` 명령어 대신 `horizon:clear` 명령어를 사용하여 큐에서 작업을 삭제해야 합니다.

기본 연결의 기본 큐에서 모든 작업을 삭제하려면, `queue:clear` 아티즌 명령어를 사용할 수 있습니다.

```shell
php artisan queue:clear
```

특정 연결 및 큐에서 작업을 삭제하려면 `connection` 인수와 `queue` 옵션을 함께 지정할 수도 있습니다.

```shell
php artisan queue:clear redis --queue=emails
```

> [!WARNING]
> 큐에서 작업을 삭제하는 기능은 SQS, Redis, 데이터베이스(queue) 드라이버에서만 사용할 수 있습니다. 또한, SQS의 메시지 삭제 과정은 최대 60초가 소요될 수 있으므로, 큐를 지운 후 60초 이내에 SQS 큐로 전송된 작업들도 함께 삭제될 수 있습니다.

<a name="monitoring-your-queues"></a>
## 큐 모니터링하기

큐에 갑자기 많은 작업이 몰리면 큐가 과부하에 걸릴 수 있으며, 이로 인해 작업 처리 대기 시간이 길어질 수 있습니다. 필요하다면 라라벨이 큐의 작업 수가 특정 임계값을 초과했을 때 알림을 보낼 수 있습니다.

시작하려면, `queue:monitor` 명령어를 [1분마다 실행되도록 예약](/docs/scheduling)해야 합니다. 이 명령어는 모니터링하려는 큐 이름들과, 원하는 작업 개수 임계값을 인자로 받습니다.

```shell
php artisan queue:monitor redis:default,redis:deployments --max=100
```

이 명령어를 예약하는 것만으로는 큐가 과부하 상태일 때 알림을 자동으로 받을 수 없습니다. 명령어가 임계값을 초과한 큐를 감지하면 `Illuminate\Queue\Events\QueueBusy` 이벤트가 발생합니다. 애플리케이션의 `AppServiceProvider`에서 이 이벤트를 감지하여 직접 알림을 보내도록 설정할 수 있습니다.

```php
use App\Notifications\QueueHasLongWaitTime;
use Illuminate\Queue\Events\QueueBusy;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;

/**
 * Bootstrap any application services.
 */
public function boot(): void
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

<a name="testing"></a>
## 테스트

작업을 디스패치(dispatch)하는 코드를 테스트할 때, 실제로 작업을 실행하지 않고 작업 자체의 코드와 이를 디스패치하는 코드를 독립적으로 테스트하고 싶을 수 있습니다. 작업 자체를 테스트하려면, 테스트 내에서 작업 인스턴스를 생성하고 `handle` 메서드를 직접 호출하면 됩니다.

큐에 작업이 실제로 푸시되는 것을 방지하려면 `Queue` 파사드의 `fake` 메서드를 사용할 수 있습니다. 이 메서드를 호출한 뒤에는, 애플리케이션이 큐에 어떤 작업을 시도했는지 다양한 assert 메서드를 통해 검증할 수 있습니다.

```php tab=Pest
<?php

use App\Jobs\AnotherJob;
use App\Jobs\FinalJob;
use App\Jobs\ShipOrder;
use Illuminate\Support\Facades\Queue;

test('orders can be shipped', function () {
    Queue::fake();

    // Perform order shipping...

    // Assert that no jobs were pushed...
    Queue::assertNothingPushed();

    // Assert a job was pushed to a given queue...
    Queue::assertPushedOn('queue-name', ShipOrder::class);

    // Assert a job was pushed twice...
    Queue::assertPushed(ShipOrder::class, 2);

    // Assert a job was not pushed...
    Queue::assertNotPushed(AnotherJob::class);

    // Assert that a Closure was pushed to the queue...
    Queue::assertClosurePushed();

    // Assert the total number of jobs that were pushed...
    Queue::assertCount(3);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use App\Jobs\AnotherJob;
use App\Jobs\FinalJob;
use App\Jobs\ShipOrder;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_orders_can_be_shipped(): void
    {
        Queue::fake();

        // Perform order shipping...

        // Assert that no jobs were pushed...
        Queue::assertNothingPushed();

        // Assert a job was pushed to a given queue...
        Queue::assertPushedOn('queue-name', ShipOrder::class);

        // Assert a job was pushed twice...
        Queue::assertPushed(ShipOrder::class, 2);

        // Assert a job was not pushed...
        Queue::assertNotPushed(AnotherJob::class);

        // Assert that a Closure was pushed to the queue...
        Queue::assertClosurePushed();

        // Assert the total number of jobs that were pushed...
        Queue::assertCount(3);
    }
}
```

`assertPushed` 또는 `assertNotPushed` 메서드에 클로저를 전달하여, 특정 "진실 테스트"를 통과하는 작업이 큐에 푸시되었는지 판단할 수 있습니다. 적어도 하나의 작업이 해당 테스트를 통과하면, assert는 성공합니다.

```php
Queue::assertPushed(function (ShipOrder $job) use ($order) {
    return $job->order->id === $order->id;
});
```

<a name="faking-a-subset-of-jobs"></a>
### 일부 작업만 Fake 처리하기

특정 작업만 fake로 처리하고, 나머지 작업은 실제로 실행되게 하고 싶다면, fake 처리할 작업들의 클래스명을 `fake` 메서드에 배열로 전달하면 됩니다.

```php tab=Pest
test('orders can be shipped', function () {
    Queue::fake([
        ShipOrder::class,
    ]);

    // Perform order shipping...

    // Assert a job was pushed twice...
    Queue::assertPushed(ShipOrder::class, 2);
});
```

```php tab=PHPUnit
public function test_orders_can_be_shipped(): void
{
    Queue::fake([
        ShipOrder::class,
    ]);

    // Perform order shipping...

    // Assert a job was pushed twice...
    Queue::assertPushed(ShipOrder::class, 2);
}
```

특정 작업을 제외한 나머지 모든 작업을 fake 처리하고 싶을 때는, `except` 메서드를 사용합니다.

```php
Queue::fake()->except([
    ShipOrder::class,
]);
```

<a name="testing-job-chains"></a>
### 작업 체인 테스트하기

작업 체인을 테스트할 때는 `Bus` 파사드의 fake 기능을 사용해야 합니다. `Bus` 파사드의 `assertChained` 메서드를 사용해서 [작업 체인](/docs/queues#job-chaining)이 정상적으로 디스패치 되었는지 검증할 수 있습니다. 첫 번째 인자로는 체인의 작업을 배열 형태로 넘깁니다.

```php
use App\Jobs\RecordShipment;
use App\Jobs\ShipOrder;
use App\Jobs\UpdateInventory;
use Illuminate\Support\Facades\Bus;

Bus::fake();

// ...

Bus::assertChained([
    ShipOrder::class,
    RecordShipment::class,
    UpdateInventory::class
]);
```

위 예시처럼, 체인 작업 배열에는 클래스명을 나열할 수도 있고, 실제 작업 인스턴스 배열을 넘길 수도 있습니다. 작업 인스턴스 배열을 사용하면, 라라벨은 실제로 애플리케이션에서 체인된 작업 클래스와 속성 값이 동일한지까지 검사합니다.

```php
Bus::assertChained([
    new ShipOrder,
    new RecordShipment,
    new UpdateInventory,
]);
```

`assertDispatchedWithoutChain` 메서드를 사용하면, 체인 없이 디스패치된 작업 여부를 검증할 수 있습니다.

```php
Bus::assertDispatchedWithoutChain(ShipOrder::class);
```

<a name="testing-chain-modifications"></a>
#### 작업 체인 변경 테스트

체인에 포함된 작업이 [기존 체인 앞이나 뒤에 작업을 추가](#adding-jobs-to-the-chain)하는 경우, 작업의 `assertHasChain` 메서드로 남아 있는 작업 체인 배열이 예상과 일치하는지 검증할 수 있습니다.

```php
$job = new ProcessPodcast;

$job->handle();

$job->assertHasChain([
    new TranscribePodcast,
    new OptimizePodcast,
    new ReleasePodcast,
]);
```

`assertDoesntHaveChain` 메서드는 작업의 남은 체인이 비어 있는지 검증할 때 사용할 수 있습니다.

```php
$job->assertDoesntHaveChain();
```

<a name="testing-chained-batches"></a>
#### 체인 내 배치(batch) 테스트

작업 체인에 [작업 배치](#chains-and-batches)가 포함되어 있다면, 체인 검증 코드 안에 `Bus::chainedBatch` 정의를 삽입하여, 체인된 배치가 예상과 일치하는지 검증할 수 있습니다.

```php
use App\Jobs\ShipOrder;
use App\Jobs\UpdateInventory;
use Illuminate\Bus\PendingBatch;
use Illuminate\Support\Facades\Bus;

Bus::assertChained([
    new ShipOrder,
    Bus::chainedBatch(function (PendingBatch $batch) {
        return $batch->jobs->count() === 3;
    }),
    new UpdateInventory,
]);
```

<a name="testing-job-batches"></a>
### 작업 배치 테스트

[작업 배치](/docs/queues#job-batching)가 제대로 디스패치 되었는지 검증하려면, `Bus` 파사드의 `assertBatched` 메서드를 사용할 수 있습니다. 이 메서드에 넘기는 클로저는 `Illuminate\Bus\PendingBatch` 인스턴스를 전달받게 되며, 이 인스턴스를 통해 배치 내의 작업들을 검사할 수 있습니다.

```php
use Illuminate\Bus\PendingBatch;
use Illuminate\Support\Facades\Bus;

Bus::fake();

// ...

Bus::assertBatched(function (PendingBatch $batch) {
    return $batch->name == 'import-csv' &&
           $batch->jobs->count() === 10;
});
```

`assertBatchCount` 메서드는 지정한 갯수만큼 배치가 디스패치되었는지를 검증합니다.

```php
Bus::assertBatchCount(3);
```

`assertNothingBatched`를 사용하면 어떤 배치도 디스패치되지 않았는지 검증할 수 있습니다.

```php
Bus::assertNothingBatched();
```

<a name="testing-job-batch-interaction"></a>
#### 작업과 배치의 상호작용 테스트

가끔씩, 특정 작업이 소속된 배치와 어떻게 상호작용하는지도 테스트해야 할 수 있습니다. 예를 들어, 한 작업이 배치의 추가 처리를 취소했는지 테스트하려면, `withFakeBatch` 메서드로 작업에 fake 배치를 할당합니다. 이 메서드는 작업 인스턴스와 fake 배치가 포함된 튜플을 반환합니다.

```php
[$job, $batch] = (new ShipOrder)->withFakeBatch();

$job->handle();

$this->assertTrue($batch->cancelled());
$this->assertEmpty($batch->added);
```

<a name="testing-job-queue-interactions"></a>
### 작업과 큐의 상호작용 테스트

때때로 큐에 올라간 작업이 [자기 자신을 다시 큐에 반환하는지](#manually-releasing-a-job), 또는 자기 자신을 제대로 삭제했는지 등도 테스트하고자 할 수 있습니다. 이런 큐 상호작용을 테스트하려면, 작업 인스턴스를 생성하고 `withFakeQueueInteractions` 메서드를 호출합니다.

작업의 큐 상호작용이 fake 처리된 상태에서 `handle` 메서드를 실행한 뒤, `assertReleased`, `assertDeleted`, `assertNotDeleted`, `assertFailed`, `assertFailedWith`, `assertNotFailed` 메서드들을 사용하여 큐 상호작용에 대한 다양한 검증을 할 수 있습니다.

```php
use App\Exceptions\CorruptedAudioException;
use App\Jobs\ProcessPodcast;

$job = (new ProcessPodcast)->withFakeQueueInteractions();

$job->handle();

$job->assertReleased(delay: 30);
$job->assertDeleted();
$job->assertNotDeleted();
$job->assertFailed();
$job->assertFailedWith(CorruptedAudioException::class);
$job->assertNotFailed();
```

<a name="job-events"></a>
## 작업 이벤트 (Job Events)

`Queue` [파사드](/docs/facades)의 `before` 및 `after` 메서드를 사용하면, 큐에 등록된 작업이 처리되기 전, 그리고 후에 실행할 콜백을 지정할 수 있습니다. 이 콜백을 활용해 추가 로그를 남기거나 대시보드용 통계를 남기는 등 다양한 처리를 할 수 있습니다. 일반적으로 이 메서드들은 [서비스 프로바이더](/docs/providers)의 `boot` 메서드에서 호출합니다. 예를 들어, 라라벨의 기본 `AppServiceProvider`에서 다음과 같이 사용할 수 있습니다.

```php
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
     */
    public function register(): void
    {
        // ...
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
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

`Queue` [파사드](/docs/facades)의 `looping` 메서드를 사용하면, 워커가 큐에서 새 작업을 가져오기 전에 실행할 콜백을 지정할 수 있습니다. 예를 들어, 실패한 이전 작업으로 인해 열려 있을 수 있는 트랜잭션을 롤백하는 클로저를 등록할 때 유용하게 사용할 수 있습니다.

```php
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;

Queue::looping(function () {
    while (DB::transactionLevel() > 0) {
        DB::rollBack();
    }
});
```