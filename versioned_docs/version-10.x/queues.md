# 큐 (Queues)

- [소개](#introduction)
    - [커넥션과 큐의 차이](#connections-vs-queues)
    - [드라이버별 참고 사항과 선행 조건](#driver-prerequisites)
- [잡 생성](#creating-jobs)
    - [잡 클래스 생성](#generating-job-classes)
    - [클래스 구조](#class-structure)
    - [유니크 잡](#unique-jobs)
    - [암호화된 잡](#encrypted-jobs)
- [잡 미들웨어](#job-middleware)
    - [속도 제한](#rate-limiting)
    - [잡 중복 처리 방지](#preventing-job-overlaps)
    - [Throttle 예외 처리](#throttling-exceptions)
- [잡 디스패치](#dispatching-jobs)
    - [지연 디스패치](#delayed-dispatching)
    - [동기식 디스패치](#synchronous-dispatching)
    - [잡과 데이터베이스 트랜잭션](#jobs-and-database-transactions)
    - [잡 체이닝](#job-chaining)
    - [큐와 커넥션 커스터마이징](#customizing-the-queue-and-connection)
    - [최대 시도 횟수 / 타임아웃 값 지정](#max-job-attempts-and-timeout)
    - [에러 처리](#error-handling)
- [잡 배치 처리](#job-batching)
    - [배치 가능한 잡 정의](#defining-batchable-jobs)
    - [배치 디스패치](#dispatching-batches)
    - [체인과 배치](#chains-and-batches)
    - [배치에 잡 추가](#adding-jobs-to-batches)
    - [배치 확인](#inspecting-batches)
    - [배치 취소](#cancelling-batches)
    - [배치 실패 처리](#batch-failures)
    - [배치 정리](#pruning-batches)
    - [DynamoDB에 배치 저장](#storing-batches-in-dynamodb)
- [클로저 큐잉](#queueing-closures)
- [큐 워커 실행](#running-the-queue-worker)
    - [`queue:work` 명령어](#the-queue-work-command)
    - [큐 우선순위 지정](#queue-priorities)
    - [큐 워커 및 배포](#queue-workers-and-deployment)
    - [잡 만료와 타임아웃](#job-expirations-and-timeouts)
- [Supervisor 설정](#supervisor-configuration)
- [실패한 잡 처리](#dealing-with-failed-jobs)
    - [실패한 잡 정리](#cleaning-up-after-failed-jobs)
    - [실패한 잡 재시도](#retrying-failed-jobs)
    - [없는 모델 무시](#ignoring-missing-models)
    - [실패한 잡 정리](#pruning-failed-jobs)
    - [DynamoDB에 실패한 잡 저장](#storing-failed-jobs-in-dynamodb)
    - [실패한 잡 저장 비활성화](#disabling-failed-job-storage)
    - [실패한 잡 이벤트](#failed-job-events)
- [큐에서 잡 삭제](#clearing-jobs-from-queues)
- [큐 모니터링](#monitoring-your-queues)
- [테스트](#testing)
    - [잡 일부 페이크 처리](#faking-a-subset-of-jobs)
    - [잡 체인 테스트](#testing-job-chains)
    - [잡 배치 테스트](#testing-job-batches)
- [잡 이벤트](#job-events)

<a name="introduction"></a>
## 소개

웹 애플리케이션을 개발할 때, 업로드된 CSV 파일을 파싱하고 저장하는 것과 같이 일반적인 웹 요청 처리 시간 내에 끝내기 어려운 작업이 있을 수 있습니다. 라라벨에서는 이러한 작업을 쉽게 큐에 넣어 백그라운드에서 처리할 수 있습니다. 시간 소모가 큰 작업을 큐로 분리함으로써, 애플리케이션은 웹 요청에 매우 빠르게 응답하고 사용자에게 더 좋은 경험을 제공할 수 있습니다.

라라벨 큐 시스템은 [Amazon SQS](https://aws.amazon.com/sqs/), [Redis](https://redis.io) 또는 관계형 데이터베이스와 같은 다양한 큐 백엔드를 통합하는 일관된 큐 API를 제공합니다.

큐 관련 설정은 애플리케이션의 `config/queue.php` 파일에 저장되어 있습니다. 이 파일에는 데이터베이스, [Amazon SQS](https://aws.amazon.com/sqs/), [Redis](https://redis.io), [Beanstalkd](https://beanstalkd.github.io/) 드라이버를 비롯하여, 바로 잡을 실행하는 동기(synchronous) 드라이버, 그리고 큐에 추가된 잡을 모두 무시하는 `null` 드라이버 등 프레임워크에 포함된 각 큐 드라이버의 커넥션 설정이 포함되어 있습니다. 동기 드라이버는 로컬 개발 환경에서 사용하기에 적합합니다.

> [!NOTE]
> 라라벨은 Redis 기반 큐를 시각적으로 관리할 수 있는 아름다운 대시보드, Horizon을 제공합니다. 자세한 내용은 [Horizon 공식 문서](/docs/10.x/horizon)를 참고하세요.

<a name="connections-vs-queues"></a>
### 커넥션과 큐의 차이

라라벨 큐를 사용하기 전에 "커넥션(connection)"과 "큐(queue)"의 차이를 이해하는 것이 중요합니다. `config/queue.php` 파일의 `connections` 옵션은 Amazon SQS, Beanstalk, Redis 같은 백엔드 큐 서비스에 연결하는 설정입니다. 하나의 큐 커넥션은 여러 개의 "큐"를 가질 수 있는데, 이는 쉽게 말해 큐에 쌓이는 작업의 그룹 또는 스택이라고 생각할 수 있습니다.

각 커넥션 설정 예시에는 `queue`라는 속성이 포함되어 있습니다. 이 속성은 해당 커넥션을 통해 보낼 때 디스패치 될 기본 큐를 의미합니다. 즉, 잡을 디스패치할 때 어떤 큐를 사용할지 명시하지 않으면, 해당 커넥션의 설정에서 지정한 기본 `queue`로 잡이 들어가게 됩니다.

```
use App\Jobs\ProcessPodcast;

// 이 잡은 기본 커넥션의 기본 큐로 전송됩니다...
ProcessPodcast::dispatch();

// 이 잡은 기본 커넥션의 "emails" 큐로 전송됩니다...
ProcessPodcast::dispatch()->onQueue('emails');
```

어떤 애플리케이션에서는 여러 큐로 잡을 분산시킬 필요 없이 하나의 단순한 큐만 사용할 수도 있습니다. 하지만 여러 큐를 사용하면 잡 처리의 우선순위 설정이나 분리 등에 매우 유용합니다. 라라벨의 큐 워커는 어떤 큐를 어떤 순서로 처리할지 지정할 수 있기 때문입니다. 예를 들어, `high`라는 이름의 큐에 잡을 넣고, 우선순위가 높은 큐를 우선적으로 처리하도록 워커를 실행할 수 있습니다.

```shell
php artisan queue:work --queue=high,default
```

<a name="driver-prerequisites"></a>
### 드라이버별 참고 사항과 선행 조건

<a name="database"></a>
#### 데이터베이스

`database` 큐 드라이버를 사용하려면, 잡이 저장될 데이터베이스 테이블이 필요합니다. 테이블 생성을 위한 마이그레이션을 만들려면 `queue:table` Artisan 명령어를 실행하세요. 마이그레이션 파일이 생성되면, `migrate` 명령어로 데이터베이스를 마이그레이트합니다.

```shell
php artisan queue:table

php artisan migrate
```

마지막으로, `.env` 파일의 `QUEUE_CONNECTION` 변수를 `database`로 설정해서 애플리케이션이 이 드라이버를 사용하도록 지정하세요.

```
QUEUE_CONNECTION=database
```

<a name="redis"></a>
#### Redis

`redis` 큐 드라이버를 사용하려면 먼저 `config/database.php` 설정 파일에서 Redis 데이터베이스 커넥션을 구성해야 합니다.

> [!NOTE]
> `redis` 큐 드라이버에서는 `serializer`와 `compression` 옵션이 지원되지 않습니다.

**Redis 클러스터**

만약 Redis 큐 커넥션으로 Redis 클러스터를 사용하고 있다면, 큐 이름에 반드시 [키 해시 태그(key hash tag)](https://redis.io/docs/reference/cluster-spec/#hash-tags)를 포함해야 합니다. 큐별로 사용되는 모든 Redis 키가 동일한 해시 슬롯에 저장되도록 하기 위해서입니다.

```
'redis' => [
    'driver' => 'redis',
    'connection' => 'default',
    'queue' => '{default}',
    'retry_after' => 90,
],
```

**블로킹(Blocking)**

Redis 큐를 사용할 때, `block_for` 설정 옵션을 통해 잡이 제공될 때까지 워커가 얼마 동안 대기할지 지정할 수 있습니다. 이 값에 따라 Redis 데이터베이스를 계속 polling하는 것보다 리소스를 효율적으로 사용할 수 있습니다. 예를 들어, 해당 값을 `5`로 지정하면, 잡이 뽑힐 때까지 5초간 대기하도록 설정할 수 있습니다.

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
> `block_for`를 `0`으로 설정하면, 잡이 제공될 때까지 큐 워커가 무한정 대기합니다. 이 경우 `SIGTERM`과 같이 워커를 종료시키는 신호도 다음 잡이 처리되기 전까지는 처리되지 않습니다.

<a name="other-driver-prerequisites"></a>
#### 기타 드라이버 선행 조건

아래 열거된 큐 드라이버를 사용하려면 다음과 같은 의존 패키지를 설치해야 합니다. 이들은 Composer 패키지 매니저를 통해 설치할 수 있습니다.

<div class="content-list" markdown="1">

- Amazon SQS: `aws/aws-sdk-php ~3.0`
- Beanstalkd: `pda/pheanstalk ~4.0`
- Redis: `predis/predis ~1.0` 또는 phpredis PHP 확장(extension)

</div>

<a name="creating-jobs"></a>
## 잡 생성

<a name="generating-job-classes"></a>
### 잡 클래스 생성

기본적으로, 애플리케이션의 큐에 넣을 수 있는 잡 클래스는 모두 `app/Jobs` 디렉터리에 저장됩니다. 만약 이 디렉터리가 없다면, `make:job` Artisan 명령어를 실행할 때 자동으로 생성됩니다.

```shell
php artisan make:job ProcessPodcast
```

생성된 클래스는 `Illuminate\Contracts\Queue\ShouldQueue` 인터페이스를 구현하고 있어, 라라벨이 이 잡을 큐에 넣어 비동기적으로 실행해야 함을 인식하게 됩니다.

> [!NOTE]
> 잡 스텁(stub)은 [스텁 공개(Stub Publishing)](/docs/10.x/artisan#stub-customization) 기능을 이용해서 커스터마이징할 수 있습니다.

<a name="class-structure"></a>
### 클래스 구조

잡 클래스의 구조는 매우 단순합니다. 보통 큐에서 실행될 때 호출되는 `handle` 메서드만 포함하고 있습니다. 예시로, 팟캐스트 퍼블리싱 서비스를 운영하면서, 업로드된 팟캐스트 파일을 게시 전에 처리하는 작업을 잡 클래스로 만든다고 가정해보겠습니다.

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
     * 잡 인스턴스 생성자.
     */
    public function __construct(
        public Podcast $podcast,
    ) {}

    /**
     * 잡 실행 메서드.
     */
    public function handle(AudioProcessor $processor): void
    {
        // 업로드된 팟캐스트를 처리합니다...
    }
}
```

이 예시에서 보듯이, [Eloquent 모델](/docs/10.x/eloquent)을 직접 잡의 생성자에 주입할 수 있습니다. 잡에서 사용하는 `SerializesModels` 트레이트 덕분에, Eloquent 모델과 이미 로드된 연관관계들도 잡이 처리될 때 적절하게 직렬화(serialization) 및 역직렬화(unserialization)됩니다.

잡 생성자의 인수로 Eloquent 모델을 전달하는 경우, 큐에는 모델의 식별자(identifier)만 직렬화되어 저장됩니다. 잡이 실제로 실행될 때, 큐 시스템은 데이터베이스에서 전체 모델 인스턴스 및 연관관계까지 다시 불러오게 됩니다. 이 방식 덕분에 잡 페이로드(payload)가 훨씬 작아지고, 큐 드라이버로 전송하는 데이터도 최소화할 수 있습니다.

<a name="handle-method-dependency-injection"></a>
#### `handle` 메서드 의존성 주입

`handle` 메서드는 큐에서 잡이 실행될 때 호출됩니다. 여기서 의존성을 타입힌트로 선언하면, 라라벨의 [서비스 컨테이너](/docs/10.x/container)가 자동으로 주입해줍니다.

서비스 컨테이너가 `handle` 메서드에 의존성을 주입하는 방식을 직접 제어하고 싶다면, 컨테이너의 `bindMethod` 메서드를 사용할 수 있습니다. 이 메서드는 잡과 컨테이너를 콜백으로 받아 원하는 방식으로 `handle`을 호출할 수 있습니다. 보통 이 코드는 `App\Providers\AppServiceProvider`의 `boot` 메서드에서 작성하면 좋습니다.

```
use App\Jobs\ProcessPodcast;
use App\Services\AudioProcessor;
use Illuminate\Contracts\Foundation\Application;

$this->app->bindMethod([ProcessPodcast::class, 'handle'], function (ProcessPodcast $job, Application $app) {
    return $job->handle($app->make(AudioProcessor::class));
});
```

> [!NOTE]
> 바이너리 데이터(예: 이미지 원본 데이터 등)는 큐에 전달하기 전에 반드시 `base64_encode`로 인코딩하세요. 그렇지 않으면 큐 등록 시 JSON으로 직렬화할 때 제대로 처리되지 않을 수 있습니다.

<a name="handling-relationships"></a>
#### 큐잉된 연관관계(Queued Relationships)

큐잉되는 잡에서 Eloquent 모델의 연관관계도 함께 직렬화되기 때문에, 잡의 페이로드 크기가 매우 커질 수 있습니다. 또한 잡이 역직렬화되어 연관관계를 다시 불러올 때, 연관된 모든 데이터가 전체 조회됩니다. 잡을 큐에 등록할 당시 특정 조건을 걸었던 연관관계 제약은 잡 처리 시점에는 적용되지 않으니, 만약 연관관계의 일부만 처리하고 싶다면 잡 내에서 해당 관계를 다시 제약해주어야 합니다.

또는 연관관계 데이터가 잡에 함께 직렬화되는 것을 방지하려면, 모델을 속성으로 설정할 때 `withoutRelations` 메서드를 호출하면 됩니다. 이 메서드를 사용하면 이미 로드된 연관관계가 없는 새 모델 인스턴스를 반환합니다.

```
/**
 * 잡 인스턴스 생성자.
 */
public function __construct(Podcast $podcast)
{
    $this->podcast = $podcast->withoutRelations();
}
```

PHP 생성자 프로퍼티 프로모션(Constructor Property Promotion)을 사용할 때, 해당 모델에 연관관계가 직렬화되지 않도록 지정하려면 `WithoutRelations` 속성(Attribute)을 사용할 수 있습니다.

```
use Illuminate\Queue\Attributes\WithoutRelations;

/**
 * 잡 인스턴스 생성자.
 */
public function __construct(
    #[WithoutRelations]
    public Podcast $podcast
) {
}
```

잡이 한 개의 모델이 아니라 여러 개의 Eloquent 모델이 들어간 컬렉션이나 배열을 받을 경우, 이 컬렉션 안의 각 모델에 대해서는 연관관계가 복원되지 않습니다. 이는 대량의 모델 처리에서 과도한 리소스 사용을 방지하기 위함입니다.

<a name="unique-jobs"></a>
### 유니크 잡(Unique Jobs)

> [!NOTE]
> 유니크 잡은 [락(lock) 지원](/docs/10.x/cache#atomic-locks)이 가능한 캐시 드라이버가 필요합니다. 현재 `memcached`, `redis`, `dynamodb`, `database`, `file`, `array` 캐시 드라이버만이 아토믹 락을 지원합니다. 참고로, 유니크 잡 제약은 배치(batch)로 실행되는 잡에는 적용되지 않습니다.

특정 잡이 큐에 동시에 한 번만 올라가도록(동일한 잡이 중복 실행되지 않도록) 만들고 싶을 때가 있습니다. 이를 위해 잡 클래스에 `ShouldBeUnique` 인터페이스를 구현하면 됩니다. 이 인터페이스를 구현하는 것 외에 별도의 메서드를 추가할 필요는 없습니다.

```
<?php

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Contracts\Queue\ShouldBeUnique;

class UpdateSearchIndex implements ShouldQueue, ShouldBeUnique
{
    ...
}
```

위 예시에서처럼, `UpdateSearchIndex` 잡은 유니크 잡이 됩니다. 이미 동일한 잡이 큐에 올라가 아직 처리 중이라면, 같은 잡이 중복으로 디스패치되지 않습니다.

특정 "키" 값을 기준으로 잡의 유니크 여부를 지정하거나, 잡이 유니크 상태로 유지되어야 할 최대 시간을 정하고 싶을 때는 잡 클래스에 `uniqueId` 및 `uniqueFor` 속성 또는 메서드를 추가하면 됩니다.

```
<?php

use App\Models\Product;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Contracts\Queue\ShouldBeUnique;

class UpdateSearchIndex implements ShouldQueue, ShouldBeUnique
{
    /**
     * 상품 인스턴스
     *
     * @var \App\Product
     */
    public $product;

    /**
     * 잡의 유니크 락이 해제될 때까지의 시간(초 단위)
     *
     * @var int
     */
    public $uniqueFor = 3600;

    /**
     * 잡의 유니크 키 반환
     */
    public function uniqueId(): string
    {
        return $this->product->id;
    }
}
```

위 코드처럼, `UpdateSearchIndex` 잡은 상품 ID 기준으로 유니크하게 동작합니다. 즉, 같은 상품 ID로 여러 번 잡을 디스패치하더라도, 기존 잡이 먼저 끝나기 전에는 새로운 잡이 등록되지 않습니다. 그리고 만약 기존 잡이 1시간 내에 처리되지 않으면(3600초가 지나면) 유니크 락이 해제되어 같은 상품 ID의 잡을 다시 큐에 넣을 수 있게 됩니다.

> [!NOTE]
> 애플리케이션이 여러 웹 서버나 컨테이너에서 잡을 디스패치한다면, 모든 서버가 동일한 중앙 캐시 서버를 사용해야 라라벨이 정확히 잡의 유니크 여부를 판단할 수 있습니다.

<a name="keeping-jobs-unique-until-processing-begins"></a>
#### 잡 처리 시작 전까지 유니크한 상태 유지

기본적으로 유니크 잡은 잡이 처리 완료되거나, 모든 재시도 기회가 소진될 때 유니크 락이 풀립니다. 하지만 잡이 실제 처리 직전에 바로 락을 해제하고 싶다면, `ShouldBeUnique` 대신 `ShouldBeUniqueUntilProcessing` 인터페이스를 구현해주면 됩니다.

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
#### 유니크 잡 락(Unique Job Locks)

내부적으로 `ShouldBeUnique` 잡이 디스패치되면, 라라벨은 `uniqueId`를 키로 [락(lock)](/docs/10.x/cache#atomic-locks)을 시도합니다. 락 획득에 실패하면 잡이 디스패치되지 않습니다. 이 락은 잡 처리 완료 또는 모든 재시도 실패 시 해제됩니다. 기본적으로 라라벨은 디폴트 캐시 드라이버를 사용하지만, 다른 드라이버로 락을 획득하고 싶다면 `uniqueVia` 메서드를 추가해 원하는 캐시 드라이버를 지정할 수 있습니다.

```
use Illuminate\Contracts\Cache\Repository;
use Illuminate\Support\Facades\Cache;

class UpdateSearchIndex implements ShouldQueue, ShouldBeUnique
{
    ...

    /**
     * 유니크 잡 락에 사용할 캐시 드라이버 반환
     */
    public function uniqueVia(): Repository
    {
        return Cache::driver('redis');
    }
}
```

> [!NOTE]
> 단순히 한 번에 처리되는 잡의 개수만 제한하면 된다면, [`WithoutOverlapping`](/docs/10.x/queues#preventing-job-overlaps) 잡 미들웨어를 사용하는 것이 더 적합합니다.

<a name="encrypted-jobs"></a>
### 암호화된 잡(Encrypted Jobs)

라라벨은 [암호화](/docs/10.x/encryption) 기능을 통해 잡 데이터의 보안과 무결성을 보장할 수 있습니다. 사용 방법은 간단합니다. 잡 클래스에 `ShouldBeEncrypted` 인터페이스만 추가하면, 라라벨이 잡을 큐에 올리기 전에 자동으로 암호화합니다.

```
<?php

use Illuminate\Contracts\Queue\ShouldBeEncrypted;
use Illuminate\Contracts\Queue\ShouldQueue;

class UpdateSearchIndex implements ShouldQueue, ShouldBeEncrypted
{
    // ...
}
```

<a name="job-middleware"></a>
## 잡 미들웨어

잡 미들웨어를 사용하면 큐 잡 실행 전후에 커스텀 로직을 감쌀 수 있어, 잡 클래스 자체에서는 반복되는 코드(보일러플레이트)를 줄일 수 있습니다. 예를 들어, 라라벨의 Redis 기반 속도 제한 기능을 이용해서, 5초마다 단일 잡만 처리하도록 `handle` 메서드에서 아래와 같이 작성할 수 있습니다.

```
use Illuminate\Support\Facades\Redis;

/**
 * 잡 실행 메서드
 */
public function handle(): void
{
    Redis::throttle('key')->block(0)->allow(1)->every(5)->then(function () {
        info('Lock obtained...');

        // 잡 처리...
    }, function () {
        // 락 획득 실패...

        return $this->release(5);
    });
}
```

이 방식도 가능하지만, `handle` 메서드에 Redis 속도 제한 코드가 섞여 잡 코드가 복잡하고, 같은 로직이 다른 여러 잡에 반복적으로 들어가야 할 수 있습니다.

이런 경우 `handle` 메서드에서 처리하지 않고, 속도 제한을 전담하는 잡 미들웨어를 만들어서 붙일 수 있습니다. 잡 미들웨어는 특별히 지정된 위치가 없으므로, 애플리케이션의 원하는 위치(예: `app/Jobs/Middleware`)에 둘 수 있습니다.

```
<?php

namespace App\Jobs\Middleware;

use Closure;
use Illuminate\Support\Facades\Redis;

class RateLimited
{
    /**
     * 큐잉된 잡 실행 처리.
     *
     * @param  \Closure(object): void  $next
     */
    public function handle(object $job, Closure $next): void
    {
        Redis::throttle('key')
                ->block(0)->allow(1)->every(5)
                ->then(function () use ($job, $next) {
                    // 락 획득...

                    $next($job);
                }, function () use ($job) {
                    // 락 획득 실패...

                    $job->release(5);
                });
    }
}
```

이 예시에서는 [라우트 미들웨어](/docs/10.x/middleware)와 마찬가지로, 잡 미들웨어도 처리할 잡과, 이후 처리를 위한 콜백을 전달받습니다.

잡 미들웨어를 만든 뒤, 잡 클래스의 `middleware` 메서드에서 해당 미들웨어를 반환하도록 추가할 수 있습니다. `make:job` 명령어로 생성된 기본 잡에는 이 메서드가 없으므로, 필요에 따라 직접 추가해야 합니다.

```
use App\Jobs\Middleware\RateLimited;

/**
 * 잡이 통과해야 할 미들웨어 반환
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [new RateLimited];
}
```

> [!NOTE]
> 잡 미들웨어는 큐잉 가능한 이벤트 리스너, 메일러블, 알림(Notification) 등에도 사용할 수 있습니다.

<a name="rate-limiting"></a>
### 속도 제한(Rate Limiting)

직접 커스텀 잡 미들웨어를 만드는 방법 이외에도, 라라벨은 이미 사용할 수 있는 기본 속도 제한 미들웨어를 제공합니다. [라우트 속도 제한자](/docs/10.x/routing#defining-rate-limiters)와 마찬가지로, 잡도 `RateLimiter` 파사드의 `for` 메서드를 이용해 제한을 정의할 수 있습니다.

예를 들어, 사용자들은 한 시간에 한 번씩만 데이터를 백업할 수 있도록 제한하면서, 프리미엄 회원은 제한 없이 사용할 수 있다면 아래와 같이 `AppServiceProvider`의 `boot` 메서드에 `RateLimiter`를 정의할 수 있습니다.

```
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;

/**
 * 애플리케이션 서비스 부트스트랩
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

위처럼 시간 단위(`perHour`) 외에, 분 단위로도(`perMinute`) 쉽게 지정할 수 있습니다. 또한 `by`에 원하는 값을 넘길 수 있는데, 보통 고객별로 제한을 분리할 때 자주 사용됩니다.

```
return Limit::perMinute(50)->by($job->user->id);
```

이런 방식으로 제한을 정의한 뒤, 잡에서는 `Illuminate\Queue\Middleware\RateLimited` 미들웨어를 붙여 사용하면 됩니다. 잡이 제한을 초과하면, 이 미들웨어는 제한 기간(delay)만큼 잡을 다시 큐로 돌려보냅니다.

```
use Illuminate\Queue\Middleware\RateLimited;

/**
 * 잡이 통과해야 할 미들웨어 반환
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [new RateLimited('backups')];
}
```

속도 제한으로 인해 잡이 큐로 다시 돌아가도, 잡의 전체 `attempts`(시도 횟수)는 계속 증가합니다. 따라서 잡 클래스의 `tries`나 `maxExceptions` 속성값을 조정하거나, [`retryUntil` 메서드](#time-based-attempts)를 사용해 잡의 최대 시도 제한 시간을 직접 지정해줄 수도 있습니다.

잡이 속도 제한에 걸릴 때 재시도를 원하지 않는 경우에는 `dontRelease` 메서드를 사용할 수 있습니다.

```
/**
 * 잡이 통과해야 할 미들웨어 반환
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new RateLimited('backups'))->dontRelease()];
}
```

> [!NOTE]
> Redis를 사용 중이라면, `Illuminate\Queue\Middleware\RateLimitedWithRedis` 미들웨어를 쓸 수 있으며, 이 미들웨어는 기본 미들웨어보다 Redis 환경에 더 최적화되어 효율적으로 동작합니다.

<a name="preventing-job-overlaps"></a>
### 잡 중복 처리 방지(Preventing Job Overlaps)

라라벨에는 임의의 키 값을 기준으로 잡이 동시에 중복 실행되는 것을 막는 `Illuminate\Queue\Middleware\WithoutOverlapping` 미들웨어가 포함되어 있습니다. 예를 들어, 특정 리소스(예: 사용자 신용점수)를 동시에 여러 잡이 수정하지 못하도록 하고 싶을 때 유용합니다.

예를 들어, 사용자 ID별 신용점수 업데이트 잡이 중첩 실행되지 않도록 하려면 잡의 `middleware` 메서드에서 아래와 같이 반환합니다.

```
use Illuminate\Queue\Middleware\WithoutOverlapping;

/**
 * 잡이 통과해야 할 미들웨어 반환
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [new WithoutOverlapping($this->user->id)];
}
```

동일 키의 중첩 잡이 있으면 큐로 다시 release됩니다. release된 잡이 다시 시도되기 전까지 대기할 시간을 명시하고 싶다면 `releaseAfter`를 사용할 수 있습니다.

```
/**
 * 잡이 통과해야 할 미들웨어 반환
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new WithoutOverlapping($this->order->id))->releaseAfter(60)];
}
```

즉시 해당 잡을 삭제해서 재시도가 아예 이뤄지지 않길 원하면, `dontRelease` 메서드를 사용할 수 있습니다.

```
/**
 * 잡이 통과해야 할 미들웨어 반환
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new WithoutOverlapping($this->order->id))->dontRelease()];
}
```

`WithoutOverlapping` 미들웨어는 라라벨의 아토믹 락 기능을 기반으로 동작합니다. 때로는 잡이 예기치 않게 실패하거나, 타임아웃되어도 락이 풀리지 않는 경우가 있으니, 락이 생성된 후 일정 시간이 지나면 강제로 락을 해제하도록 `expireAfter`로 만료 시간을 지정할 수 있습니다. 예시로 아래 코드는 잡이 시작된 후 3분(180초)이 지나면 락을 해제하도록 설정합니다.

```
/**
 * 잡이 통과해야 할 미들웨어 반환
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new WithoutOverlapping($this->order->id))->expireAfter(180)];
}
```

> [!NOTE]
> `WithoutOverlapping` 미들웨어는 [락 지원](/docs/10.x/cache#atomic-locks)이 가능한 캐시 드라이버가 필요합니다. 현재 `memcached`, `redis`, `dynamodb`, `database`, `file`, `array` 드라이버가 아토믹 락을 지원합니다.

<a name="sharing-lock-keys"></a>

#### 작업 클래스 간 Lock 키 공유

기본적으로 `WithoutOverlapping` 미들웨어는 동일한 클래스의 중복 실행만을 방지합니다. 따라서 두 개의 다른 작업 클래스가 같은 lock 키를 사용하더라도 중복 실행이 방지되지는 않습니다. 그러나 라라벨에서 `shared` 메서드를 사용하면 lock 키를 여러 작업 클래스에 걸쳐서 적용할 수 있습니다.

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
### 예외 제한(Throttling Exceptions)

라라벨에서는 예외 발생을 제한(throttle)할 수 있도록 `Illuminate\Queue\Middleware\ThrottlesExceptions` 미들웨어를 제공합니다. 이 미들웨어를 사용하면, 지정된 횟수만큼 예외가 발생한 후에는 남은 시도들이 특정 시간 간격이 지날 때까지 지연됩니다. 이 방식은 불안정한 외부 서비스와 통신하는 경우에 특히 유용합니다.

예를 들어, 외부 API와 연동할 때 예외가 빈번하게 발생하는 작업이 있다고 가정해봅시다. 예외 제한을 적용하려면, 작업의 `middleware` 메서드에서 `ThrottlesExceptions` 미들웨어를 반환하면 됩니다. 보통 이 미들웨어는 [시간 기반 재시도](#time-based-attempts)와 함께 사용하는 것이 일반적입니다.

```
use DateTime;
use Illuminate\Queue\Middleware\ThrottlesExceptions;

/**
 * 작업에서 사용할 미들웨어를 반환합니다.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [new ThrottlesExceptions(10, 5)];
}

/**
 * 작업이 언제까지 재시도되어야 하는지 결정합니다.
 */
public function retryUntil(): DateTime
{
    return now()->addMinutes(5);
}
```

이 미들웨어의 첫 번째 생성자 인수는 작업이 제한되기 전에 발생할 수 있는 최대 예외 횟수이고, 두 번째 인수는 제한된 이후 다시 재시도를 시도하기 전에 대기해야 할 분(minute) 단위 시간입니다. 위 코드 예시의 경우, 5분 이내에 예외가 10번 발생하면 5분 후에 다시 작업이 실행됩니다.

작업에서 예외가 발생하더라도, 예외 임계치에 도달하지 않은 경우에는 기본적으로 작업이 즉시 재시도됩니다. 하지만 미들웨어를 작업에 연결할 때 `backoff` 메서드로 해당 작업의 지연 시간을 분(minute) 단위로 지정할 수도 있습니다.

```
use Illuminate\Queue\Middleware\ThrottlesExceptions;

/**
 * 작업에서 사용할 미들웨어를 반환합니다.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new ThrottlesExceptions(10, 5))->backoff(5)];
}
```

이 미들웨어는 내부적으로 라라벨 캐시 시스템을 활용하여 속도 제한(rate limiting)을 구현하며, 작업의 클래스명이 캐시 "키"로 사용됩니다. 만약 여러 작업이 동일한 외부 서비스와 연동되어 공통 제한값을 공유해야 한다면, `by` 메서드를 사용해 키를 지정할 수 있습니다.

```
use Illuminate\Queue\Middleware\ThrottlesExceptions;

/**
 * 작업에서 사용할 미들웨어를 반환합니다.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new ThrottlesExceptions(10, 10))->by('key')];
}
```

> [!NOTE]
> Redis를 사용한다면, `Illuminate\Queue\Middleware\ThrottlesExceptionsWithRedis` 미들웨어를 사용할 수 있습니다. 이 미들웨어는 Redis에 최적화되어 있으며, 기본 예외 제한 미들웨어보다 효율적입니다.

<a name="dispatching-jobs"></a>
## 작업 디스패치(Dispatching Jobs)

작업 클래스를 작성했다면, 해당 작업 클래스의 `dispatch` 메서드를 사용하여 작업을 디스패치할 수 있습니다. `dispatch` 메서드에 전달된 인수는 작업의 생성자에 인자로 넘어갑니다.

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessPodcast;
use App\Models\Podcast;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PodcastController extends Controller
{
    /**
     * 새 팟캐스트를 저장합니다.
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

조건에 따라 작업을 디스패치하고 싶다면, `dispatchIf` 와 `dispatchUnless` 메서드를 사용할 수 있습니다.

```
ProcessPodcast::dispatchIf($accountActive, $podcast);

ProcessPodcast::dispatchUnless($accountSuspended, $podcast);
```

신규 라라벨 애플리케이션에서는 `sync` 드라이버가 기본 큐 드라이버로 설정되어 있습니다. 이 드라이버는 작업을 현재 요청의 전경(동기)에서 실행하며, 로컬 개발 환경에서는 간편하게 활용할 수 있습니다. 실제로 작업을 백그라운드에서 큐잉(비동기 처리)하려면, 애플리케이션의 `config/queue.php` 설정 파일에서 다른 큐 드라이버를 지정해야 합니다.

<a name="delayed-dispatching"></a>
### 지연 디스패치(Delayed Dispatching)

작업을 큐워커가 즉시 처리하지 못하도록 예약하고 싶다면, 작업 디스패치 시 `delay` 메서드를 사용할 수 있습니다. 예를 들어, 작업이 디스패치된 시점으로부터 10분이 지난 후에 큐워커가 작업을 처리하도록 지정해보겠습니다.

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessPodcast;
use App\Models\Podcast;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PodcastController extends Controller
{
    /**
     * 새 팟캐스트를 저장합니다.
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

> [!NOTE]
> Amazon SQS 큐 서비스의 최대 지연 시간은 15분입니다.

<a name="dispatching-after-the-response-is-sent-to-browser"></a>
#### 클라이언트 응답 후 작업 디스패치

또는, `dispatchAfterResponse` 메서드를 사용하면 웹 서버가 FastCGI 환경일 때 HTTP 응답이 사용자 브라우저로 전송된 이후에 작업이 큐에 들어가게 할 수 있습니다. 이렇게 하면 큐 작업이 남아 있더라도 사용자는 즉시 애플리케이션을 사용할 수 있습니다. 주로 1초 내외로 끝나는 이메일 발송 등 경량 작업에 이 방식을 사용하는 것이 권장됩니다. 이 방식은 현재 HTTP 요청 내에서 작업이 실행되므로, 별도의 큐워커가 실행 중일 필요가 없습니다.

```
use App\Jobs\SendNotification;

SendNotification::dispatchAfterResponse();
```

또한 closure(클로저)도 디스패치할 수 있으며, `dispatch` 헬퍼 함수 뒤에 `afterResponse`를 체이닝하여, HTTP 응답이 브라우저로 전송된 뒤 실행할 수도 있습니다.

```
use App\Mail\WelcomeMessage;
use Illuminate\Support\Facades\Mail;

dispatch(function () {
    Mail::to('taylor@example.com')->send(new WelcomeMessage);
})->afterResponse();
```

<a name="synchronous-dispatching"></a>
### 동기 디스패치(Synchronous Dispatching)

작업을 즉시(동기적으로) 실행해야 한다면 `dispatchSync` 메서드를 사용할 수 있습니다. 이 메서드를 사용하면 작업이 큐에 저장되지 않고, 바로 현재 프로세스에서 즉시 실행됩니다.

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessPodcast;
use App\Models\Podcast;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PodcastController extends Controller
{
    /**
     * 새 팟캐스트를 저장합니다.
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
### 작업과 데이터베이스 트랜잭션(Jobs & Database Transactions)

데이터베이스 트랜잭션 내에서 작업을 디스패치해도 전혀 문제가 없으나, 작업이 실제로 성공적으로 실행될 수 있도록 특별히 주의해야 합니다. 데이터베이스 트랜잭션 중에 작업이 디스패치되면, 해당 작업이 부모 트랜잭션이 커밋되기 전에 워커에 의해 실행될 수도 있습니다. 이런 경우, 트랜잭션 중에 수정된 모델 또는 데이터베이스 레코드가 실제 데이터베이스에 반영되지 않았을 수도 있으며, 새로 생성된 모델/레코드 또한 데이터베이스에 존재하지 않을 수 있습니다.

다행히도 라라벨에서는 이 문제를 해결하기 위한 몇 가지 방법을 제공합니다. 첫 번째로, 큐 연결 설정 배열에서 `after_commit` 옵션을 사용할 수 있습니다.

```
'redis' => [
    'driver' => 'redis',
    // ...
    'after_commit' => true,
],
```

`after_commit` 옵션을 `true`로 설정하면 데이터베이스 트랜잭션 내에서 작업을 디스패치할 수 있습니다. 이 경우 라라벨은 트랜잭션이 모두 커밋될 때까지 대기한 뒤 실제로 작업을 디스패치하게 됩니다. 물론 현재 열려있는 트랜잭션이 없다면, 작업은 즉시 디스패치됩니다.

만약 트랜잭션 도중 예외가 발생해 롤백된다면, 해당 트랜잭션 내에서 디스패치된 작업들은 모두 폐기됩니다.

> [!NOTE]
> `after_commit` 설정값이 `true`일 때는 큐 이벤트 리스너, 메일 발송, 알림, 브로드캐스트 이벤트 또한 모든 데이터베이스 트랜잭션이 커밋된 후에 디스패치됩니다.

<a name="specifying-commit-dispatch-behavior-inline"></a>
#### 커밋 시점 디스패치 동작을 인라인으로 지정하기

큐 연결 설정에서 `after_commit` 옵션을 `true`로 하지 않은 경우에도, 개별 작업마다 모든 데이터베이스 트랜잭션 커밋 이후에 디스패치하도록 지정할 수 있습니다. 이를 위해 디스패치 작업에 `afterCommit` 메서드를 체이닝하면 됩니다.

```
use App\Jobs\ProcessPodcast;

ProcessPodcast::dispatch($podcast)->afterCommit();
```

반대로, `after_commit` 설정값이 `true`일 때, 특정 작업을 트랜잭션 커밋을 기다리지 않고 즉시 디스패치하고 싶다면, `beforeCommit` 메서드를 체이닝하면 됩니다.

```
ProcessPodcast::dispatch($podcast)->beforeCommit();
```

<a name="job-chaining"></a>
### 작업 체이닝(Job Chaining)

작업 체이닝을 사용하면, 최초 작업이 성공적으로 실행된 후에 이어서 순차적으로 실행해야 하는 작업들을 리스트로 지정할 수 있습니다. 체인에 포함된 작업 중 하나라도 실패하면 나머지 작업들은 더 이상 실행되지 않습니다. 작업 체인을 실행할 때는 `Bus` 파사드의 `chain` 메서드를 사용합니다. 라라벨의 커맨드 버스(Command Bus)는 큐 작업 디스패치가 그 위에 구현된 하위 레벨 컴포넌트입니다.

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

작업 클래스 인스턴스 뿐만 아니라 클로저(closure)도 체이닝하여 사용할 수 있습니다.

```
Bus::chain([
    new ProcessPodcast,
    new OptimizePodcast,
    function () {
        Podcast::update(/* ... */);
    },
])->dispatch();
```

> [!NOTE]
> 작업 내에서 `$this->delete()` 메서드로 작업을 삭제해도 체이닝된 작업의 실행에는 영향을 주지 않습니다. 체인된 작업 중 하나가 실패하는 경우에만 체인 실행이 중단됩니다.

<a name="chain-connection-queue"></a>
#### 체인 작업의 연결(커넥션) 및 큐 지정

체이닝된 작업들에 대해 사용될 연결(connection)과 큐(queue)를 지정하고 싶으면, `onConnection` 및 `onQueue` 메서드를 사용할 수 있습니다. 이 메서드들을 사용하면 각 체인 작업에서 별도로 연결이나 큐를 지정하지 않는 한, 지정한 연결명 및 큐명이 체인 전체에 적용됩니다.

```
Bus::chain([
    new ProcessPodcast,
    new OptimizePodcast,
    new ReleasePodcast,
])->onConnection('redis')->onQueue('podcasts')->dispatch();
```

<a name="chain-failures"></a>
#### 체인 실패 처리

작업 체이닝 시, 체인 내의 작업에 실패가 발생했을 때 호출할 클로저를 `catch` 메서드를 이용해 지정할 수 있습니다. 지정한 콜백에는 실패 원인이 되는 `Throwable` 인스턴스가 전달됩니다.

```
use Illuminate\Support\Facades\Bus;
use Throwable;

Bus::chain([
    new ProcessPodcast,
    new OptimizePodcast,
    new ReleasePodcast,
])->catch(function (Throwable $e) {
    // 체인 내에서 작업이 실패했을 때 처리할 내용...
})->dispatch();
```

> [!NOTE]
> 체인 콜백은 큐에 직렬화되어 나중에 라라벨 큐워커에 의해 실행되므로, 체인 콜백 내에서는 `$this` 변수를 사용해서는 안 됩니다.

<a name="customizing-the-queue-and-connection"></a>
### 큐와 연결(커넥션) 커스터마이징

<a name="dispatching-to-a-particular-queue"></a>
#### 특정 큐로 디스패치하기

작업을 여러 큐로 분배해서 "분류"하거나, 각 큐에 할당할 워커 수로 우선순위를 다르게 둘 수 있습니다. 이 방법은 큐 설정 파일에 정의된 서로 다른 큐 "연결(connection)"로 작업을 분배하는 것이 아니라, 한 연결 내에서 서로 다른 큐 이름을 지정하는 방식입니다. 특정 큐로 보내려면 작업 디스패치 시 `onQueue` 메서드를 사용합니다.

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessPodcast;
use App\Models\Podcast;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PodcastController extends Controller
{
    /**
     * 새 팟캐스트를 저장합니다.
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

다른 방법으로, 작업 클래스의 생성자에서 `onQueue` 메서드를 호출하여 해당 작업이 사용할 큐를 지정할 수도 있습니다.

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
     */
    public function __construct()
    {
        $this->onQueue('processing');
    }
}
```

<a name="dispatching-to-a-particular-connection"></a>
#### 특정 연결(커넥션)로 디스패치하기

애플리케이션이 여러 큐 연결을 사용한다면, `onConnection` 메서드로 작업을 어느 연결에 보낼지 지정할 수 있습니다.

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessPodcast;
use App\Models\Podcast;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PodcastController extends Controller
{
    /**
     * 새 팟캐스트를 저장합니다.
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

또한, `onConnection`과 `onQueue` 메서드를 체이닝하여 특정 연결 및 큐 정보를 함께 지정할 수도 있습니다.

```
ProcessPodcast::dispatch($podcast)
              ->onConnection('sqs')
              ->onQueue('processing');
```

마찬가지로, 작업 생성자 내부에서 `onConnection` 메서드를 호출해 연결 정보를 지정할 수도 있습니다.

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
#### 최대 재시도(시도) 횟수 제한

큐 작업에서 오류가 반복적으로 발생할 경우, 무한히 시도되지 않도록 제한하는 것이 좋습니다. 라라벨에서는 작업이 재시도되는 횟수나 총 실행 기간을 다양한 방법으로 지정할 수 있습니다.

가장 간단하게는, Artisan CLI에서 `--tries` 옵션을 사용하여 워커가 처리하는 모든 작업의 최대 시도 횟수를 지정할 수 있습니다. 단, 작업 자체에서 개별 재시도 횟수를 지정했다면 해당 값이 우선합니다.

```shell
php artisan queue:work --tries=3
```

작업이 최대 시도 횟수를 초과하면 "실패한 작업"으로 간주됩니다. 실패한 작업 처리 방법에 대해 더 알고 싶다면 [실패한 작업 관련 문서](#dealing-with-failed-jobs)를 참고하십시오. 만약 `queue:work` 명령에 `--tries=0`을 지정하면, 작업은 무한히 반복 재시도됩니다.

보다 개별적으로 각 작업 클래스에 최대 시도 횟수를 지정할 수도 있습니다. 클래스에 시도 횟수를 명시하면 CLI 옵션보다 우선적으로 적용됩니다.

```
<?php

namespace App\Jobs;

class ProcessPodcast implements ShouldQueue
{
    /**
     * 이 작업이 시도될 수 있는 최대 횟수입니다.
     *
     * @var int
     */
    public $tries = 5;
}
```

특정 작업의 최대 시도 횟수를 동적으로 제어하려면, `tries` 메서드를 정의하면 됩니다.

```
/**
 * 이 작업이 시도될 수 있는 최대 횟수를 반환합니다.
 */
public function tries(): int
{
    return 5;
}
```

<a name="time-based-attempts"></a>
#### 시간 기반 재시도(Time Based Attempts)

작업이 실패할 때마다 최대 횟수 대신, 일정 시간까지만 재시도하도록 지정할 수도 있습니다. 이를 위해 작업 클래스에 `retryUntil` 메서드를 추가하면 됩니다. 이 메서드는 `DateTime` 인스턴스를 반환해야 합니다.

```
use DateTime;

/**
 * 작업의 타임아웃 시점을 반환합니다.
 */
public function retryUntil(): DateTime
{
    return now()->addMinutes(10);
}
```

> [!NOTE]
> [큐 이벤트 리스너](/docs/10.x/events#queued-event-listeners)에서도 `tries` 속성이나 `retryUntil` 메서드를 지정할 수 있습니다.

<a name="max-exceptions"></a>
#### 최대 예외 발생 횟수 제한

작업이 여러 번 재시도되도록 하고 싶지만, 단순히 `release` 메서드로 재시도한 것이 아니라 처리 과정에서 미처리된(unhandled) 예외가 일정 횟수 이상 발생했다면 실패로 처리하고 싶을 때도 있습니다. 이럴 때는 작업 클래스에 `maxExceptions` 속성을 지정하면 됩니다.

```
<?php

namespace App\Jobs;

use Illuminate\Support\Facades\Redis;

class ProcessPodcast implements ShouldQueue
{
    /**
     * 이 작업이 시도될 수 있는 최대 횟수입니다.
     *
     * @var int
     */
    public $tries = 25;

    /**
     * 최대 허용할 미처리 예외 횟수입니다.
     *
     * @var int
     */
    public $maxExceptions = 3;

    /**
     * 작업 실행.
     */
    public function handle(): void
    {
        Redis::throttle('key')->allow(10)->every(60)->then(function () {
            // Lock을 얻었으니 팟캐스트를 처리합니다...
        }, function () {
            // Lock을 얻지 못한 경우...
            return $this->release(10);
        });
    }
}
```

이 예제에서는, 애플리케이션이 Redis Lock을 획득하지 못하면 10초 후에 작업을 다시 시도하게 하고, 최대 25회까지 계속 됩니다. 하지만 작업에서 3회 미처리 예외가 발생하면 해당 작업은 실패로 처리됩니다.

<a name="timeout"></a>

#### 타임아웃

대부분의 경우, 큐에 등록된 작업이 얼마나 오래 걸릴지 대략적으로 예상할 수 있습니다. 이런 이유로 라라벨에서는 "타임아웃" 값을 지정할 수 있습니다. 기본적으로 타임아웃 값은 60초입니다. 작업이 타임아웃 값으로 지정된 시간보다 더 오래 실행될 경우, 해당 작업을 처리하던 워커는 오류와 함께 종료됩니다. 일반적으로 워커는 [서버에 구성된 프로세스 매니저](#supervisor-configuration)에 의해 자동으로 재시작됩니다.

작업이 실행될 수 있는 최대 시간을 Artisan 명령어에서 `--timeout` 옵션을 사용해 지정할 수 있습니다.

```shell
php artisan queue:work --timeout=30
```

작업이 타임아웃으로 인해 최대 시도 횟수를 초과하게 되면, 해당 작업은 실패 상태로 표시됩니다.

또한 작업 클래스 자체에 작업이 허용되는 최대 실행 시간을 지정할 수도 있습니다. 작업 클래스에서 직접 타임아웃을 지정한 경우, 이 값이 명령줄에서 지정한 타임아웃 값보다 우선 적용됩니다.

```
<?php

namespace App\Jobs;

class ProcessPodcast implements ShouldQueue
{
    /**
     * 작업이 타임아웃되기 전에 실행할 수 있는 시간(초)입니다.
     *
     * @var int
     */
    public $timeout = 120;
}
```

때때로, 소켓이나 외부 HTTP 연결 등 I/O 블로킹 프로세스는 지정한 타임아웃을 제대로 준수하지 않을 수 있습니다. 이런 경우 해당 기능이 제공하는 API에서도 별도로 타임아웃을 지정하는 것이 좋습니다. 예를 들어, Guzzle을 사용할 때는 반드시 연결 및 요청 타임아웃 값을 지정해야 합니다.

> [!WARNING]
> 작업 타임아웃을 지정하려면 `pcntl` PHP 확장 모듈이 반드시 설치되어 있어야 합니다. 또한, 작업의 "타임아웃" 값은 ["retry after"](#job-expiration) 값보다 반드시 작아야 합니다. 그렇지 않으면, 작업이 실제로 실행을 끝내거나 타임아웃 전에 다시 시도될 수 있습니다.

<a name="failing-on-timeout"></a>
#### 타임아웃 시 작업 실패 처리

타임아웃이 발생했을 때 작업이 [실패](#dealing-with-failed-jobs)로 표시되도록 하려면, 작업 클래스에 `$failOnTimeout` 속성을 정의하면 됩니다.

```php
/**
 * 타임아웃 발생 시 작업을 실패로 표시할지 여부를 지정합니다.
 *
 * @var bool
 */
public $failOnTimeout = true;
```

<a name="error-handling"></a>
### 오류 처리

작업 실행 중 예외가 발생하면, 해당 작업은 자동으로 큐에 다시 반환되어 재시도됩니다. 작업은 애플리케이션에서 허용된 최대 시도 횟수를 초과할 때까지 계속 반환되고 다시 시도됩니다. 최대 시도 횟수는 `queue:work` Artisan 명령어에서 사용하는 `--tries` 옵션으로 지정할 수 있습니다. 혹은, 작업 클래스에서 직접 최대 시도 횟수를 지정할 수도 있습니다. 큐 워커 실행 방법에 대한 자세한 내용은 [아래 설명](#running-the-queue-worker)을 참고하세요.

<a name="manually-releasing-a-job"></a>
#### 작업을 수동으로 재시도 큐에 반환하기

때로는 작업을 수동으로 큐로 다시 반환하여, 나중에 다시 시도할 수 있게 하고 싶을 때가 있습니다. 이 작업은 `release` 메서드를 호출하여 수행할 수 있습니다.

```
/**
 * 작업을 실행합니다.
 */
public function handle(): void
{
    // ...

    $this->release();
}
```

기본적으로 `release` 메서드는 작업을 즉시 처리할 수 있도록 큐에 다시 반환합니다. 하지만 정수나 날짜 인스턴스를 `release` 메서드에 전달하면 해당 시간(초)만큼 지난 뒤에 작업이 처리되도록 설정할 수도 있습니다.

```
$this->release(10);

$this->release(now()->addSeconds(10));
```

<a name="manually-failing-a-job"></a>
#### 작업을 수동으로 실패 처리하기

가끔은 작업을 "실패" 상태로 직접 표시해야 할 수도 있습니다. 이 경우, `fail` 메서드를 호출하면 됩니다.

```
/**
 * 작업을 실행합니다.
 */
public function handle(): void
{
    // ...

    $this->fail();
}
```

예외를 포착하여 해당 예외로 인해 작업을 실패로 표시하고 싶다면, 예외를 `fail` 메서드에 전달하면 됩니다. 또는, 편의상 에러 메시지 문자열을 전달하면 자동으로 예외로 변환되어 처리됩니다.

```
$this->fail($exception);

$this->fail('Something went wrong.');
```

> [!NOTE]
> 실패한 작업에 대한 보다 자세한 내용은 [작업 실패 처리 문서](#dealing-with-failed-jobs)를 참고하세요.

<a name="job-batching"></a>
## 작업 배치

라라벨의 작업 배치 기능을 이용하면 여러 작업을 하나의 배치로 묶어 실행하고, 배치가 모두 완료된 후 특정 동작을 수행할 수 있습니다. 먼저, 각 작업 배치에 대한 완료율 등의 메타 정보를 저장할 데이터베이스 테이블을 만드는 마이그레이션을 생성해야 합니다. 이 마이그레이션은 `queue:batches-table` Artisan 명령어로 생성할 수 있습니다.

```shell
php artisan queue:batches-table

php artisan migrate
```

<a name="defining-batchable-jobs"></a>
### 배치 가능한 작업 정의하기

배치 가능한 작업을 정의하려면 [큐에 등록 가능한 작업](#creating-jobs)을 기존과 동일하게 생성하되, 작업 클래스에 `Illuminate\Bus\Batchable` 트레이트를 추가하면 됩니다. 이 트레이트는 현재 실행되고 있는 배치 객체를 반환하는 `batch` 메서드를 제공합니다.

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
     * 작업을 실행합니다.
     */
    public function handle(): void
    {
        if ($this->batch()->cancelled()) {
            // 배치가 취소되었는지 확인...

            return;
        }

        // CSV 파일의 일부분을 가져옵니다...
    }
}
```

<a name="dispatching-batches"></a>
### 작업 배치 디스패치하기

여러 개의 작업을 배치로 디스패치하려면, `Bus` 파사드의 `batch` 메서드를 사용하면 됩니다. 배치는 대개 완료 콜백과 함께 사용될 때 가장 유용하므로, `then`, `catch`, `finally` 메서드를 사용해 배치의 완료 시점에 실행할 콜백을 정의할 수 있습니다. 각각의 콜백에는 `Illuminate\Bus\Batch` 인스턴스가 전달됩니다. 예를 들어, 각각 CSV 파일의 행을 처리하는 작업을 여러 개 묶어서 배치로 큐에 등록할 수 있습니다.

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
])->before(function (Batch $batch) {
    // 배치가 생성되었으나 아직 작업이 추가되지 않은 경우...
})->progress(function (Batch $batch) {
    // 단일 작업이 성공적으로 실행된 경우...
})->then(function (Batch $batch) {
    // 모든 작업이 성공적으로 완료된 경우...
})->catch(function (Batch $batch, Throwable $e) {
    // 첫 번째 배치 작업 실패 발생 시...
})->finally(function (Batch $batch) {
    // 배치가 모두 실행을 마침...
})->dispatch();

return $batch->id;
```

배치의 ID는 `$batch->id` 속성을 통해 접근할 수 있으며, [라라벨 커맨드 버스에서 배치 정보 조회](#inspecting-batches)를 위해 활용할 수 있습니다.

> [!WARNING]
> 배치 콜백은 라라벨 큐에 의해 직렬화되어 나중에 실행되므로, 콜백 내부에서 `$this` 변수는 사용하면 안 됩니다.

<a name="naming-batches"></a>
#### 배치 이름 지정

Laravel Horizon, Laravel Telescope 등 일부 도구에서는 배치에 이름을 할당하면 보다 이해하기 쉬운 디버그 정보를 제공할 수 있습니다. 배치에 임의의 이름을 할당하려면, 배치를 정의할 때 `name` 메서드를 호출하면 됩니다.

```
$batch = Bus::batch([
    // ...
])->then(function (Batch $batch) {
    // 모든 작업이 성공적으로 완료된 경우...
})->name('Import CSV')->dispatch();
```

<a name="batch-connection-queue"></a>
#### 배치의 커넥션 및 큐 지정

배치에 포함된 작업이 사용할 커넥션(연결)과 큐를 지정하고 싶다면, `onConnection` 및 `onQueue` 메서드를 사용할 수 있습니다. 배치의 모든 작업은 반드시 동일한 커넥션과 큐 내에서 실행되어야 합니다.

```
$batch = Bus::batch([
    // ...
])->then(function (Batch $batch) {
    // 모든 작업이 성공적으로 완료된 경우...
})->onConnection('redis')->onQueue('imports')->dispatch();
```

<a name="chains-and-batches"></a>
### 체인과 배치 결합

배치 내에 [체인 처리 작업](#job-chaining)을 정의하려면, 체인 작업들을 배열로 감싸서 배치 배열에 포함하면 됩니다. 예를 들어, 두 개의 작업 체인을 병렬로 실행하고, 두 체인이 모두 완료됐을 때 콜백을 실행할 수 있습니다.

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

반대로, [체인](#job-chaining) 내에 여러 배치 작업을 수행하도록 할 수도 있습니다. 예를 들어, 먼저 여러 팟캐스트를 릴리즈하는 배치 작업을 실행하고, 그 이후에 릴리즈 알림을 보내는 배치 작업을 실행할 수 있습니다.

```
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

때로는, 배치 작업 안에서 추가적인 작업을 해당 배치에 동적으로 추가해야 할 때가 있습니다. 수천 개의 작업을 한 번에 배치에 등록하면 웹 요청에서 시간이 오래 소요될 수 있으므로, 이럴 때 초기 "로더" 작업만 배치로 생성하고, 로더 작업이 실제 많은 작업을 배치에 추가하는 패턴을 사용할 수 있습니다.

```
$batch = Bus::batch([
    new LoadImportBatch,
    new LoadImportBatch,
    new LoadImportBatch,
])->then(function (Batch $batch) {
    // 모든 작업이 성공적으로 완료된 경우...
})->name('Import Contacts')->dispatch();
```

위 예시에서 `LoadImportBatch` 작업을 사용해 추가 작업을 배치에 넣는 역할을 합니다. 이를 위해, 작업의 `batch` 메서드로 배치 인스턴스에 접근해서 `add` 메서드를 호출할 수 있습니다.

```
use App\Jobs\ImportContacts;
use Illuminate\Support\Collection;

/**
 * 작업을 실행합니다.
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
> 작업이 동일한 배치에 속할 때에만, 배치 내에서 작업을 추가할 수 있습니다.

<a name="inspecting-batches"></a>
### 배치 정보 조회

배치 완료 콜백에 전달되는 `Illuminate\Bus\Batch` 인스턴스는 다양한 속성과 메서드를 제공하므로, 배치 작업을 조회하고 다양한 정보를 쉽게 확인할 수 있습니다.

```
// 배치의 UUID...
$batch->id;

// 배치 이름(지정된 경우)...
$batch->name;

// 배치에 할당된 작업 수...
$batch->totalJobs;

// 아직 큐에서 처리되지 않은 작업 수...
$batch->pendingJobs;

// 실패한 작업 수...
$batch->failedJobs;

// 지금까지 처리된 작업 수...
$batch->processedJobs();

// 배치 완료율(0 ~ 100)...
$batch->progress();

// 배치가 모두 실행을 마쳤는지 여부...
$batch->finished();

// 배치 실행 취소...
$batch->cancel();

// 배치가 취소되었는지 여부...
$batch->cancelled();
```

<a name="returning-batches-from-routes"></a>
#### 라우트에서 배치 정보 반환하기

모든 `Illuminate\Bus\Batch` 인스턴스는 JSON 직렬화가 가능하므로, 애플리케이션의 라우트에서 바로 반환해 배치 완료율 등 배치에 관한 정보를 포함하는 JSON 데이터를 받을 수 있습니다. 이를 활용하면, 애플리케이션 UI에서 배치의 진행 상황을 쉽게 보여줄 수 있습니다.

배치 ID로 배치를 조회하려면, `Bus` 파사드의 `findBatch` 메서드를 사용하면 됩니다.

```
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Route;

Route::get('/batch/{batchId}', function (string $batchId) {
    return Bus::findBatch($batchId);
});
```

<a name="cancelling-batches"></a>
### 배치 취소

특정 배치의 실행을 중단하고 싶을 때는, `Illuminate\Bus\Batch` 인스턴스의 `cancel` 메서드를 호출하면 됩니다.

```
/**
 * 작업을 실행합니다.
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

이전 예시에서 볼 수 있듯이, 배치로 실행되는 작업은 대개 계속 실행하기 전에 자신이 속한 배치가 취소되었는지 확인해야 합니다. 그러나 보다 편리하게 작업에 `SkipIfBatchCancelled` [미들웨어](#job-middleware)를 지정하면, 해당 배치가 취소된 경우 작업이 아예 실행되지 않게 할 수 있습니다.

```
use Illuminate\Queue\Middleware\SkipIfBatchCancelled;

/**
 * 작업이 통과해야 할 미들웨어를 반환합니다.
 */
public function middleware(): array
{
    return [new SkipIfBatchCancelled];
}
```

<a name="batch-failures"></a>
### 배치 실패 처리

배치로 실행되는 작업이 실패하면, `catch` 콜백(설정되어 있으면)이 호출됩니다. 이 콜백은 배치 내부의 첫 번째 실패 작업에 대해서만 호출됩니다.

<a name="allowing-failures"></a>
#### 작업 실패 허용

배치 내에서 작업 하나가 실패하면, 라라벨은 기본적으로 그 배치를 "취소됨"으로 표시합니다. 이런 동작을 원하지 않는 경우, 즉 작업 실패가 배치를 자동으로 취소 표시하지 않도록 하려면, 배치 디스패치 시 `allowFailures` 메서드를 호출하면 됩니다.

```
$batch = Bus::batch([
    // ...
])->then(function (Batch $batch) {
    // 모든 작업이 성공적으로 완료된 경우...
})->allowFailures()->dispatch();
```

<a name="retrying-failed-batch-jobs"></a>
#### 배치 내 실패한 작업 재시도

보다 편리하게, 라라벨에서는 주어진 배치 내 실패한 모든 작업을 쉽게 재시도할 수 있도록 `queue:retry-batch` Artisan 명령어를 제공합니다. `queue:retry-batch` 명령은 재시도할 배치의 UUID를 인자로 받습니다.

```shell
php artisan queue:retry-batch 32dbc76c-4f82-4749-b610-a639fe0099b5
```

<a name="pruning-batches"></a>
### 배치 데이터 정리(Pruning)

배치를 정리하지 않으면 `job_batches` 테이블에 많은 레코드가 빠르게 쌓일 수 있습니다. 이를 방지하려면, `queue:prune-batches` Artisan 명령어를 [스케줄링](/docs/10.x/scheduling) 하여 매일 실행하도록 해야 합니다.

```
$schedule->command('queue:prune-batches')->daily();
```

기본적으로 24시간이 지난 완료된 배치가 모두 정리(Prune)됩니다. 명령어 실행 시 `hours` 옵션을 사용하면 배치 데이터를 얼마 동안 유지할지 지정할 수 있습니다. 예를 들어, 48시간이 지난 배치를 모두 삭제하려면 다음과 같이 하면 됩니다.

```
$schedule->command('queue:prune-batches --hours=48')->daily();
```

가끔, 작업 실패 후 성공적으로 재시도되지 않은 배치 등 완료되지 않은 배치 레코드가 `jobs_batches` 테이블에 쌓일 수 있습니다. `queue:prune-batches` 명령에 `unfinished` 옵션을 사용해 이러한 미완료 배치도 정리할 수 있습니다.

```
$schedule->command('queue:prune-batches --hours=48 --unfinished=72')->daily();
```

마찬가지로, 취소된 배치의 레코드 역시 `jobs_batches` 테이블에 계속 쌓일 수 있는데, `cancelled` 옵션을 사용해 해당 레코드를 정리할 수도 있습니다.

```
$schedule->command('queue:prune-batches --hours=48 --cancelled=72')->daily();
```

<a name="storing-batches-in-dynamodb"></a>
### 배치를 DynamoDB에 저장하기

라라벨은 배치 메타 정보를 [DynamoDB](https://aws.amazon.com/dynamodb)에 저장하는 것도 지원합니다. 단, DynamoDB에는 직접 배치 레코드를 저장할 테이블을 만들어야 합니다.

일반적으로 테이블 이름은 `job_batches`로 설정하지만, 실제로는 애플리케이션의 `queue` 설정 파일 내에 있는 `queue.batching.table` 설정 값에 맞춰야 합니다.

<a name="dynamodb-batch-table-configuration"></a>
#### DynamoDB 배치 테이블 설정

`job_batches` 테이블에는 문자열 타입의 파티션 키인 `application` 및 문자열 타입의 정렬 키인 `id`가 있어야 합니다. `application` 키에는 애플리케이션의 `app` 설정 파일에 정의된 이름이 들어갑니다. 애플리케이션 이름이 DynamoDB 테이블 키에 포함되어 있으므로 여러 라라벨 애플리케이션이 같은 테이블을 사용할 수도 있습니다.

또한 자동으로 배치 레코드를 정리하도록 하려면, 테이블에 `ttl` 속성(attribute)을 추가할 수 있습니다. ([자동 배치 정리](#pruning-batches-in-dynamodb) 참고)

<a name="dynamodb-configuration"></a>
#### DynamoDB 설정

먼저, 라라벨 애플리케이션이 Amazon DynamoDB와 통신할 수 있도록 AWS SDK를 설치해야 합니다.

```shell
composer require aws/aws-sdk-php
```

그런 다음, `queue.batching.driver` 설정 항목의 값을 `dynamodb`로 지정합니다. 그리고 `batching` 설정 배열 안에 `key`, `secret`, `region` 옵션들을 정의해야 하며, 이 값들은 AWS 인증에 사용됩니다. `dynamodb` 드라이버를 사용할 때는 `queue.batching.database` 설정은 필요하지 않습니다.

```php
'batching' => [
    'driver' => env('QUEUE_FAILED_DRIVER', 'dynamodb'),
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    'table' => 'job_batches',
],
```

<a name="pruning-batches-in-dynamodb"></a>
#### DynamoDB의 배치 데이터 자동 정리

[DynamoDB](https://aws.amazon.com/dynamodb)에 작업 배치 정보를 저장하는 경우, 기존 관계형 데이터베이스에서 사용하는 배치 정리 명령어는 사용할 수 없습니다. 대신, [DynamoDB의 고유 TTL 기능](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html)을 활용해, 옛날 배치 레코드를 자동으로 삭제할 수 있습니다.

DynamoDB 테이블을 생성할 때 `ttl` 속성을 추가했다면, 라라벨 설정에서 해당 속성이 TTL임을 지정하고, TTL(삭제까지의 시간, 초 단위)도 설정할 수 있습니다. `queue.batching.ttl_attribute` 값에 TTL을 저장할 속성명을 넣고, `queue.batching.ttl` 값에 마지막 업데이트 후 몇 초 뒤에 레코드를 삭제할지 지정합니다.

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
## 클로저를 큐에 등록하기

작업 클래스 대신 클로저(익명 함수)를 큐에 등록할 수도 있습니다. 이는 현재의 요청 사이클 외부에서 빠르고 간단하게 실행되어야 하는 작업에 매우 좋습니다. 클로저를 큐로 디스패치하면, 클로저 코드 내용이 암호학적으로 서명되어 전송 과정에서 위조될 수 없습니다.

```
$podcast = App\Podcast::find(1);

dispatch(function () use ($podcast) {
    $podcast->publish();
});
```

`catch` 메서드를 사용해, 큐에 등록된 클로저가 [설정된 최대 재시도 횟수](#max-job-attempts-and-timeout)까지 모두 실행되어도 성공하지 못했을 경우 실행할 클로저를 지정할 수 있습니다.

```
use Throwable;

dispatch(function () use ($podcast) {
    $podcast->publish();
})->catch(function (Throwable $e) {
    // 이 작업이 실패했습니다...
});
```

> [!WARNING]
> `catch` 콜백은 라라벨 큐에 의해 직렬화되어 나중에 실행되므로, 해당 콜백 내부에서는 `$this` 변수를 사용해서는 안 됩니다.

<a name="running-the-queue-worker"></a>
## 큐 워커 실행하기

<a name="the-queue-work-command"></a>
### `queue:work` 명령어

라라벨에는 큐 워커를 시작하고 큐에 새로 추가되는 작업을 처리하는 Artisan 명령어가 포함되어 있습니다. `queue:work` Artisan 명령어로 워커를 실행할 수 있습니다. 이 명령어를 실행하면, 직접 중단시키거나 터미널을 닫기 전까지 계속 워커가 실행됩니다.

```shell
php artisan queue:work
```

> [!NOTE]
> `queue:work` 프로세스를 항상 백그라운드에서 실행 유지하려면, [Supervisor](#supervisor-configuration)와 같은 프로세스 모니터를 사용해 워커가 멈추지 않도록 구성해야 합니다.

실행 중인 작업 ID를 명령어 출력에 포함하려면 `-v` 플래그를 추가해서 명령어를 실행할 수 있습니다.

```shell
php artisan queue:work -v
```

큐 워커는 장시간 실행되는 프로세스이기 때문에, 애플리케이션이 부팅된 상태를 메모리에 보관합니다. 이로 인해 워커 실행 이후 소스 코드가 변경되어도 이를 감지하지 못합니다. 따라서 배포 과정에서 반드시 [큐 워커를 재시작](#queue-workers-and-deployment)해야 합니다. 또한, 애플리케이션에서 생성하거나 수정한 정적 상태는 작업 간에 자동으로 리셋되지 않음을 명심하세요.

또는 `queue:listen` 명령어를 사용할 수도 있습니다. `queue:listen`을 사용하면, 코드 변경이나 애플리케이션 상태를 초기화하고 싶을 때 워커를 수동으로 재시작할 필요가 없습니다. 하지만, 이 명령어는 `queue:work` 명령에 비해 성능이 많이 떨어집니다.

```shell
php artisan queue:listen
```

<a name="running-multiple-queue-workers"></a>

#### 여러 큐 워커 실행하기

큐에 여러 워커를 할당하여 동시에 작업을 처리하려면, 여러 개의 `queue:work` 프로세스를 실행하면 됩니다. 이는 로컬 개발 환경에서 터미널의 여러 탭을 통해 실행할 수도 있고, 운영 환경에서는 프로세스 관리자의 설정을 통해 실행할 수도 있습니다. [Supervisor를 사용할 경우](#supervisor-configuration)에는 `numprocs` 설정 값을 사용할 수 있습니다.

<a name="specifying-the-connection-queue"></a>
#### 커넥션과 큐 지정하기

워커가 사용할 큐 커넥션을 명시적으로 지정할 수도 있습니다. `work` 명령어에 전달하는 커넥션 이름은 `config/queue.php` 설정 파일에 정의된 커넥션 중 하나여야 합니다:

```shell
php artisan queue:work redis
```

기본적으로 `queue:work` 명령어는 해당 커넥션의 기본 큐에 있는 작업만 처리합니다. 하지만, 특정 커넥션에 대해 특정 큐만 처리하도록 워커를 더 세부적으로 설정할 수도 있습니다. 예를 들어, 모든 이메일 작업을 `redis` 큐 커넥션의 `emails` 큐에서 처리한다면, 다음 명령어로 해당 큐만 처리하는 워커를 실행할 수 있습니다:

```shell
php artisan queue:work redis --queue=emails
```

<a name="processing-a-specified-number-of-jobs"></a>
#### 지정한 개수만큼 작업 처리하기

`--once` 옵션을 사용하면 워커가 큐에서 단 하나의 작업만 처리하도록 지시할 수 있습니다.

```shell
php artisan queue:work --once
```

`--max-jobs` 옵션을 사용하면 워커가 지정한 개수의 작업을 처리한 뒤 종료하도록 할 수 있습니다. 이 옵션은 [Supervisor](#supervisor-configuration)와 함께 사용하여, 워커가 지정된 개수만큼 작업을 처리하고 메모리를 해제한 후 자동으로 재시작되도록 할 때 유용합니다.

```shell
php artisan queue:work --max-jobs=1000
```

<a name="processing-all-queued-jobs-then-exiting"></a>
#### 큐에 쌓인 모든 작업 처리 후 종료하기

`--stop-when-empty` 옵션을 사용하면 워커가 큐의 모든 작업을 처리한 뒤 정상적으로 종료하도록 할 수 있습니다. 이 옵션은 Docker 컨테이너 안에서 라라벨 큐를 처리하고, 큐가 비워지면 컨테이너를 종료하고자 할 때 유용합니다.

```shell
php artisan queue:work --stop-when-empty
```

<a name="processing-jobs-for-a-given-number-of-seconds"></a>
#### 지정한 시간 동안만 작업 처리하기

`--max-time` 옵션을 사용하면 워커가 지정한 초(sec)만큼 작업을 처리한 뒤 종료하도록 할 수 있습니다. 이 옵션은 [Supervisor](#supervisor-configuration)와 함께 사용하여, 워커가 일정 시간 동안 작업을 처리한 후 메모리를 해제하고 자동 재시작되도록 할 때 활용할 수 있습니다.

```shell
# 1시간(3600초) 동안만 작업을 처리하고 종료합니다...
php artisan queue:work --max-time=3600
```

<a name="worker-sleep-duration"></a>
#### 워커 슬립(sleep) 시간 설정

큐에 작업이 남아 있을 때, 워커는 지연 없이 계속 작업을 처리합니다. 하지만, `sleep` 옵션은 처리할 작업이 없을 때 워커가 "잠자기" 상태가 되는 시간을 지정합니다. 슬립하는 동안에는 새로운 작업이 있어도 워커가 즉시 처리하지 않습니다.

```shell
php artisan queue:work --sleep=3
```

<a name="maintenance-mode-queues"></a>
#### 유지보수 모드와 큐

애플리케이션이 [유지보수 모드](/docs/10.x/configuration#maintenance-mode)일 때는 큐에 쌓인 작업이 처리되지 않습니다. 애플리케이션이 유지보수 모드에서 벗어나면, 큐 작업은 정상적으로 다시 처리됩니다.

유지보수 모드에서도 큐 워커가 작업을 계속 처리하게 하려면 `--force` 옵션을 사용할 수 있습니다.

```shell
php artisan queue:work --force
```

<a name="resource-considerations"></a>
#### 리소스 관리 시 주의사항

데몬 형태의 큐 워커는 각 작업을 처리하기 전에 프레임워크를 "재시작"하지 않습니다. 따라서, 각 작업이 끝난 후 무거운 리소스를 반드시 해제해야 합니다. 예를 들어 GD 라이브러리로 이미지를 처리한 경우, 이미지 작업이 끝나면 `imagedestroy`를 사용해 메모리를 반드시 해제해야 합니다.

<a name="queue-priorities"></a>
### 큐 우선순위 관리

때때로, 큐 작업의 처리 우선순위를 직접 조정하고 싶을 수 있습니다. 예를 들어, `config/queue.php` 설정 파일에서 `redis` 커넥션의 기본 `queue` 값을 `low`로 지정할 수 있습니다. 하지만, 경우에 따라 높은 우선순위의 큐(예: `high`)에 작업을 푸시하고 싶다면 다음과 같이 할 수 있습니다.

```
dispatch((new Job)->onQueue('high'));
```

`high` 큐의 작업을 모두 처리한 후에야 `low` 큐로 넘어가도록 하려면, 큐 이름을 콤마(,)로 구분하여 `work` 명령어에 넘겨주면 됩니다.

```shell
php artisan queue:work --queue=high,low
```

<a name="queue-workers-and-deployment"></a>
### 큐 워커와 배포(Deployment)

큐 워커는 장시간 실행되는 프로세스이기 때문에, 코드가 변경되어도 워커는 이를 즉시 감지하지 못합니다. 따라서 큐 워커를 사용하는 애플리케이션을 배포할 때 가장 간단한 방법은, 배포 과정에서 워커를 재시작하는 것입니다. 아래 `queue:restart` 명령어로 모든 워커를 정상적으로 재시작시킬 수 있습니다.

```shell
php artisan queue:restart
```

이 명령어는 각 워커가 현재 처리 중인 작업을 끝마치면 정상적으로 종료하도록 지시하므로, 기존 작업이 유실되지 않습니다. 그리고 워커가 `queue:restart` 명령 실행 시 종료되므로, 반드시 [Supervisor](#supervisor-configuration)와 같은 프로세스 관리자가 운영 중이어야 큐 워커가 자동으로 재시작됩니다.

> [!NOTE]
> 큐는 [캐시](/docs/10.x/cache)를 활용하여 재시작 신호를 저장하므로, 이 기능을 사용하기 전에 애플리케이션에서 캐시 드라이버가 정상적으로 설정되어 있는지 반드시 확인해야 합니다.

<a name="job-expirations-and-timeouts"></a>
### 작업 만료 및 타임아웃

<a name="job-expiration"></a>
#### 작업 만료(Job Expiration)

`config/queue.php` 설정 파일의 각 큐 커넥션에는 `retry_after` 옵션이 있습니다. 이 옵션은 워커가 작업을 처리 중일 때, 몇 초가 경과하면 해당 작업을 재시도 큐에 올릴지 결정합니다. 예를 들어 `retry_after` 값이 `90`으로 설정되어 있다면, 90초 동안 작업이 정상적으로 완료(삭제되거나 해제)되지 않으면, 그 작업은 다시 큐로 반환됩니다. 일반적으로, `retry_after` 값은 해당 작업이 적절히 처리될 수 있는 최대 시간(초)으로 설정하면 됩니다.

> [!WARNING]
> `retry_after` 값을 사용하지 않는 유일한 큐 커넥션은 Amazon SQS입니다. SQS의 경우, [기본 가시성 타임아웃(Default Visibility Timeout)](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/AboutVT.html)이 AWS 콘솔에서 관리되며, 이에 따라 작업이 재시도됩니다.

<a name="worker-timeouts"></a>
#### 워커 타임아웃

`queue:work` 아티즌 명령어에는 `--timeout` 옵션이 있습니다. 기본 값은 60초입니다. 만약 하나의 작업 처리가 타임아웃 값(초) 이상 소요된다면, 해당 작업을 처리하던 워커는 에러와 함께 종료됩니다. 일반적으로 워커는 [서버에 설정된 프로세스 관리자](#supervisor-configuration)에 의해 즉시 재시작됩니다.

```shell
php artisan queue:work --timeout=60
```

`retry_after` 설정값과 `--timeout` CLI 옵션은 다르지만, 함께 동작하여 작업이 유실되지 않고 반드시 한 번만 성공적으로 처리되도록 보장합니다.

> [!WARNING]
> `--timeout` 값은 항상 `retry_after` 설정값보다 몇 초 이상 작게 설정해야 합니다. 그래야 "중단된 작업(frozen job)"을 처리 중인 워커가 항상 작업이 재시도 되기 전에 종료될 수 있습니다. 만약 `--timeout` 옵션이 `retry_after` 설정값보다 크다면, 하나의 작업이 여러 번 처리(transact)될 수 있습니다.

<a name="supervisor-configuration"></a>
## Supervisor 설정

운영 환경에서는 `queue:work` 프로세스가 항상 실행되도록 관리해야 합니다. `queue:work` 프로세스는 워커 타임아웃 초과, `queue:restart` 명령 실행 등 여러 이유로 중단될 수 있습니다.

이러한 이유로, 프로세스 모니터를 설정해서 `queue:work` 프로세스가 중단되었을 때 즉시 감지하고 자동으로 재시작되도록 해야 합니다. 프로세스 모니터는 동시에 몇 개의 `queue:work` 프로세스를 실행할지도 지정할 수 있습니다. Supervisor는 리눅스 환경에서 흔히 사용하는 프로세스 모니터이며, 아래에서 Supervisor 설정 방법을 안내합니다.

<a name="installing-supervisor"></a>
#### Supervisor 설치

Supervisor는 리눅스 운영체제를 위한 프로세스 모니터로, 만약 `queue:work` 프로세스가 실패하면 자동으로 워커를 재시작합니다. Ubuntu에 Supervisor를 설치하려면 아래 명령어를 사용합니다.

```shell
sudo apt-get install supervisor
```

> [!NOTE]
> Supervisor의 직접적인 설정과 관리가 부담스럽다면, [Laravel Forge](https://forge.laravel.com)를 사용하는 것도 고려하세요. Forge는 운영 환경의 라라벨 프로젝트에 Supervisor를 자동으로 설치 및 설정해줍니다.

<a name="configuring-supervisor"></a>
#### Supervisor 설정하기

Supervisor 설정 파일은 보통 `/etc/supervisor/conf.d` 디렉터리에 저장됩니다. 이 디렉터리 안에 여러 개의 설정 파일을 만들 수 있고, 각각의 파일에서 프로세스의 모니터링 방식 등을 설정합니다. 예를 들어, `laravel-worker.conf`라는 파일을 만들어 `queue:work` 프로세스를 실행하도록 할 수 있습니다.

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

이 예시에서 `numprocs` 설정은 Supervisor가 8개의 `queue:work` 프로세스를 실행하고 모니터링하도록 하며, 실패 시 자동으로 재시작합니다. 자신의 환경에 맞는 큐 커넥션과 워커 옵션에 맞춰 `command` 항목을 변경해야 합니다.

> [!WARNING]
> `stopwaitsecs` 값이 가장 오래 실행될 작업의 예상 소요 시간보다 크게 설정되어 있는지 꼭 확인해야 합니다. 그렇지 않으면 Supervisor가 작업이 끝나기도 전에 해당 프로세스를 종료할 수 있습니다.

<a name="starting-supervisor"></a>
#### Supervisor 시작하기

설정 파일을 만들었다면, 아래 명령어들로 Supervisor 설정을 갱신하고 프로세스를 시작할 수 있습니다.

```shell
sudo supervisorctl reread

sudo supervisorctl update

sudo supervisorctl start "laravel-worker:*"
```

Supervisor에 대한 자세한 내용은 [Supervisor 공식 문서](http://supervisord.org/index.html)를 참고하세요.

<a name="dealing-with-failed-jobs"></a>
## 실패한 작업 관리

큐에 쌓인 작업이 실패할 수도 있습니다. 너무 걱정하지 마세요! 항상 계획대로만 되는 것은 아니니까요. 라라벨은 [작업의 시도 횟수 한도](#max-job-attempts-and-timeout)를 설정할 수 있는 편리한 방식을 제공합니다. 비동기로 처리된 작업의 시도 횟수가 한도를 초과하면, 해당 작업은 `failed_jobs` 데이터베이스 테이블에 기록됩니다. 한편, [동기적으로 처리된 작업](/docs/10.x/queues#synchronous-dispatching)이 실패했다면 이 테이블에는 저장되지 않고 예외가 즉시 애플리케이션에 의해 처리됩니다.

새로운 라라벨 애플리케이션에는 보통 `failed_jobs` 테이블 생성을 위한 마이그레이션이 이미 포함되어 있습니다. 만약 애플리케이션에 해당 테이블의 마이그레이션이 없다면, `queue:failed-table` 명령어로 마이그레이션을 생성할 수 있습니다.

```shell
php artisan queue:failed-table

php artisan migrate
```

[큐 워커](#running-the-queue-worker) 프로세스를 실행할 때, `queue:work` 명령어의 `--tries` 옵션을 사용하여 각 작업의 최대 시도 횟수를 지정할 수 있습니다. 별도의 값을 지정하지 않으면, 각 작업은 기본적으로 한 번만 시도되거나, 작업 클래스의 `$tries` 속성 값만큼 시도됩니다.

```shell
php artisan queue:work redis --tries=3
```

`--backoff` 옵션을 사용하면, 예외가 발생한 후 재시도를 하기 전까지 라라벨이 얼마 동안 대기할지 초 단위로 지정할 수 있습니다. 별도로 설정하지 않으면, 작업은 즉시 다시 큐로 반환됩니다.

```shell
php artisan queue:work redis --tries=3 --backoff=3
```

특정 작업 클래스별로 예외 발생 시 대기 시간을 지정하려면, 작업 클래스에 `backoff` 속성을 정의해 주세요.

```
/**
 * 작업 재시도 전 대기 시간(초).
 *
 * @var int
 */
public $backoff = 3;
```

작업별로 더 복잡한 대기 시간(backoff) 로직이 필요하다면, `backoff` 메서드를 작업 클래스에 정의할 수 있습니다.

```
/**
* 작업 재시도 전 대기 시간(초)을 계산합니다.
*/
public function backoff(): int
{
    return 3;
}
```

`backoff` 메서드에서 배열을 반환하여 "지수적(exponential)" 재시도 대기를 쉽게 구성할 수도 있습니다. 예를 들면, 첫 번째 재시도는 1초, 두 번째 재시도는 5초, 세 번째는 10초, 네 번째부터는 10초씩 대기하게 할 수 있습니다.

```
/**
* 작업 재시도 전 대기 시간(초) 배열을 반환합니다.
*
* @return array<int, int>
*/
public function backoff(): array
{
    return [1, 5, 10];
}
```

<a name="cleaning-up-after-failed-jobs"></a>
### 실패한 작업 후 정리 작업

특정 작업이 실패한 경우, 사용자에게 알림을 보내거나 혹시 부분적으로 처리된 작업을 되돌리고 싶을 수 있습니다. 이 기능은 작업 클래스에 `failed` 메서드를 정의해서 구현할 수 있습니다. 실패의 원인이 된 `Throwable` 인스턴스가 `failed` 메서드에 전달됩니다.

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
     * 새 작업 인스턴스 생성자.
     */
    public function __construct(
        public Podcast $podcast,
    ) {}

    /**
     * 작업 실행.
     */
    public function handle(AudioProcessor $processor): void
    {
        // 업로드된 팟캐스트 처리 작업...
    }

    /**
     * 작업 실패 시 처리.
     */
    public function failed(?Throwable $exception): void
    {
        // 사용자에게 실패 알림 보내기 등...
    }
}
```

> [!WARNING]
> `failed` 메서드가 호출되기 전, 해당 작업의 새 인스턴스가 생성되므로, `handle` 메서드 내에서 수정된 클래스 속성들의 값은 유지되지 않습니다.

<a name="retrying-failed-jobs"></a>
### 실패한 작업 재시도

`failed_jobs` 데이터베이스 테이블에 쌓인 모든 실패 작업을 조회하려면 `queue:failed` 아티즌 명령어를 사용할 수 있습니다.

```shell
php artisan queue:failed
```

`queue:failed` 명령어는 작업 ID, 커넥션, 큐, 실패 시각 등 작업에 대한 다양한 정보를 리스트로 보여줍니다. 작업 ID를 사용하여 실패한 특정 작업을 재시도할 수 있습니다. 예를 들어, ID가 `ce7bb17c-cdd8-41f0-a8ec-7b4fef4e5ece`인 작업을 재시도하려면 다음과 같이 합니다.

```shell
php artisan queue:retry ce7bb17c-cdd8-41f0-a8ec-7b4fef4e5ece
```

필요하다면 여러 개의 ID를 한 번에 전달해 재시도할 수도 있습니다.

```shell
php artisan queue:retry ce7bb17c-cdd8-41f0-a8ec-7b4fef4e5ece 91401d2c-0784-4f43-824c-34f94a33c24d
```

특정 큐의 실패 작업만 모두 재시도하고 싶으면 아래와 같이 할 수 있습니다.

```shell
php artisan queue:retry --queue=name
```

모든 실패 작업을 한 번에 재시도하려면 `queue:retry` 명령어에 `all`을 전달하면 됩니다.

```shell
php artisan queue:retry all
```

특정 실패 작업을 삭제하려면 `queue:forget` 명령어를 사용합니다.

```shell
php artisan queue:forget 91401d2c-0784-4f43-824c-34f94a33c24d
```

> [!NOTE]
> [Horizon](/docs/10.x/horizon)을 사용하는 경우, 실패한 작업을 삭제할 때는 `queue:forget` 대신 `horizon:forget` 명령어를 사용해야 합니다.

`failed_jobs` 테이블의 모든 실패 작업을 삭제하려면 `queue:flush` 명령어를 사용하세요.

```shell
php artisan queue:flush
```

<a name="ignoring-missing-models"></a>
### 누락된 모델 무시하기

Eloquent 모델을 작업에 주입할 때, 모델은 큐에 들어가기 전에 자동으로 직렬화(serialization)되고, 작업이 처리될 때 데이터베이스에서 다시 조회됩니다. 하지만 작업이 큐에서 대기하는 중에 해당 모델이 삭제됐다면, 해당 작업은 `ModelNotFoundException` 예외와 함께 실패하게 됩니다.

이와 같은 경우, 작업 클래스의 `deleteWhenMissingModels` 속성을 `true`로 설정해두면, 누락된 모델이 있을 때 예외를 발생시키지 않고 조용히 작업을 삭제합니다.

```
/**
 * 모델이 더 이상 존재하지 않으면 작업을 삭제합니다.
 *
 * @var bool
 */
public $deleteWhenMissingModels = true;
```

<a name="pruning-failed-jobs"></a>
### 실패 작업 정리(pruning)

애플리케이션의 `failed_jobs` 테이블에 쌓여 있는 실패 작업 기록을 `queue:prune-failed` 아티즌 명령어로 손쉽게 정리할 수 있습니다.

```shell
php artisan queue:prune-failed
```

기본적으로는 24시간 이상 지난 모든 실패 작업 레코드가 삭제됩니다. `--hours` 옵션을 제공하면 최근 N시간 내에 삽입된 기록은 남기고, 그 이전의 실패 기록만 삭제할 수 있습니다. 예를 들어, 아래 명령어는 48시간 이상 된 실패 작업만 삭제합니다.

```shell
php artisan queue:prune-failed --hours=48
```

<a name="storing-failed-jobs-in-dynamodb"></a>
### 실패 작업을 DynamoDB에 저장하기

라라벨은 실패한 작업 기록을 관계형 데이터베이스 대신 [DynamoDB](https://aws.amazon.com/dynamodb)에 저장하는 기능도 제공합니다. 다만, 직접 DynamoDB 테이블을 생성해야 하며, 테이블 이름은 보통 `failed_jobs`로 설정하면 됩니다(필요하다면 애플리케이션의 `queue` 설정 파일에서 `queue.failed.table` 값에 맞춰 테이블명을 정해도 됩니다).

`failed_jobs` 테이블에는 문자열 타입의 파티션 키 `application`과 문자열 타입의 정렬 키 `uuid`가 필요합니다. `application` 값은 애플리케이션의 `app` 설정 파일에서 지정한 `name` 값이 저장됩니다. 이렇게 하면 한 DynamoDB 테이블에 여러 라라벨 애플리케이션의 실패 작업을 저장할 수 있습니다.

또한, 라라벨 애플리케이션이 Amazon DynamoDB와 통신할 수 있도록 AWS SDK를 설치해야 합니다.

```shell
composer require aws/aws-sdk-php
```

그 다음, `queue.failed.driver` 설정 값을 `dynamodb`로 지정하세요. 또한, 실패한 작업 설정 배열에 `key`, `secret`, `region` 값을 반드시 지정해야 하며, 이 값들은 AWS 인증에 사용됩니다. `dynamodb` 드라이버를 사용할 경우 `queue.failed.database` 설정은 필요하지 않습니다.

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
### 실패 작업 저장 비활성화

`queue.failed.driver` 설정 값을 `null`로 지정하면, 라라벨이 실패한 작업을 저장하지 않고 바로 폐기하도록 할 수 있습니다. 일반적으로는 `QUEUE_FAILED_DRIVER` 환경 변수로 지정합니다.

```ini
QUEUE_FAILED_DRIVER=null
```

<a name="failed-job-events"></a>
### 실패 작업 이벤트

작업이 실패할 때 특정 이벤트 리스너를 등록하고 싶다면, `Queue` 파사드의 `failing` 메서드를 사용할 수 있습니다. 예를 들어, 라라벨에 포함된 `AppServiceProvider`의 `boot` 메서드에서 아래와 같이 클로저를 이벤트에 연결할 수 있습니다.

```
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Queue;
use Illuminate\Support\ServiceProvider;
use Illuminate\Queue\Events\JobFailed;

class AppServiceProvider extends ServiceProvider
{
    /**
     * 애플리케이션 서비스 등록.
     */
    public function register(): void
    {
        // ...
    }

    /**
     * 애플리케이션 서비스 부트스트랩.
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
## 큐에서 작업 비우기(Clearing)

> [!NOTE]
> [Horizon](/docs/10.x/horizon)을 사용할 경우, `queue:clear` 명령어 대신 `horizon:clear`를 사용해 큐를 비워야 합니다.

기본 커넥션의 기본 큐에 남아 있는 모든 작업을 삭제하려면, 아래와 같이 `queue:clear` 아티즌 명령어를 실행합니다.

```shell
php artisan queue:clear
```

특정 커넥션이나 큐의 작업만 삭제하려면, `connection` 인수와 `queue` 옵션을 함께 사용할 수 있습니다.

```shell
php artisan queue:clear redis --queue=emails
```

> [!WARNING]
> 큐 비우기는 SQS, Redis, 데이터베이스 큐 드라이버에서만 지원됩니다. 또, SQS에서는 메시지 삭제에 최대 60초가 걸리므로, 큐를 비운 후 60초 이내에 SQS에 전송된 작업도 함께 삭제될 수 있습니다.

<a name="monitoring-your-queues"></a>
## 큐 모니터링

만약 큐에 갑자기 작업이 급격히 쌓인다면, 큐가 과부하 되어 작업 지연이 길어질 수 있습니다. 이런 경우, 라라벨은 큐 작업 수가 지정한 임계값을 초과하면 알람을 보낼 수 있습니다.

먼저 [스케줄러](/docs/10.x/scheduling)로 `queue:monitor` 명령이 1분마다 실행되도록 예약하세요. 이 명령어는 모니터할 큐 이름들과 작업 수 임계값을 옵션으로 받습니다.

```shell
php artisan queue:monitor redis:default,redis:deployments --max=100
```

이 명령어를 스케줄링하는 것만으로는 알림이 자동 발송되지는 않습니다. 명령어가 큐 작업 수가 임계값을 넘는 큐를 감지하면, `Illuminate\Queue\Events\QueueBusy` 이벤트가 발생합니다. 이 이벤트를 `EventServiceProvider`에서 감지하여 직접 알림을 보낼 수 있습니다.

```php
use App\Notifications\QueueHasLongWaitTime;
use Illuminate\Queue\Events\QueueBusy;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;

/**
 * 애플리케이션의 기타 이벤트 등록.
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

작업을 디스패치(dispatch)하는 코드를 테스트할 때, 실제로 작업이 실행되지 않도록 하고 싶을 수 있습니다. 작업의 코드 자체는 별도로 테스트할 수 있으므로, 여기에서는 디스패치 코드가 큐에 작업을 푸시하는지만 검증하면 됩니다. 작업 자체 테스트는 작업 인스턴스를 직접 생성해 `handle` 메서드를 호출해서 진행할 수 있습니다.

작업이 실제로 큐에 푸시되지 않게 하려면, `Queue` 파사드의 `fake` 메서드를 사용하세요. 이 메서드 호출 이후, 애플리케이션이 큐에 작업을 푸시했는지 여부를 다양한 방식으로 검증(assert)할 수 있습니다.

```
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

        // 주문 발송 관련 동작 수행...

        // 어떤 작업도 푸시되지 않았는지 검증...
        Queue::assertNothingPushed();

        // 특정 큐에 작업이 푸시되었는지 검증...
        Queue::assertPushedOn('queue-name', ShipOrder::class);

        // 작업이 두 번 푸시되었는지 검증...
        Queue::assertPushed(ShipOrder::class, 2);

        // 특정 작업이 푸시되지 않았는지 검증...
        Queue::assertNotPushed(AnotherJob::class);

        // 클로저가 큐에 푸시되었는지 검증...
        Queue::assertClosurePushed();

        // 전체 푸시된 작업 수 검증...
        Queue::assertCount(3);
    }
}
```

`assertPushed`, `assertNotPushed` 메서드에 클로저를 전달하여, 원하는 조건을 만족하는 작업이 실제 푸시되었는지 검증할 수도 있습니다. 클로저가 true를 반환하는 작업이 하나라도 있으면 테스트가 통과합니다.

```
Queue::assertPushed(function (ShipOrder $job) use ($order) {
    return $job->order->id === $order->id;
});
```

<a name="faking-a-subset-of-jobs"></a>

### 일부 잡만 테스트로 대체하기

일부 잡만 테스트로 대체(Fake)하고, 나머지 잡은 정상적으로 실행되도록 하고 싶다면, `fake` 메서드에 테스트로 대체할 잡의 클래스명을 배열로 전달하면 됩니다.

```
public function test_orders_can_be_shipped(): void
{
    Queue::fake([
        ShipOrder::class,
    ]);

    // 주문 배송 수행...

    // 잡이 두 번 큐에 추가되었는지 확인...
    Queue::assertPushed(ShipOrder::class, 2);
}
```

특정 잡만 제외하고 나머지 모든 잡을 테스트로 대체하고 싶다면, `except` 메서드를 사용할 수 있습니다.

```
Queue::fake()->except([
    ShipOrder::class,
]);
```

<a name="testing-job-chains"></a>
### 잡 체인 테스트하기

잡 체인을 테스트하려면, `Bus` 파사드의 테스트 대체(Fake) 기능을 활용해야 합니다. `Bus` 파사드의 `assertChained` 메서드를 이용하면 [잡 체인](/docs/10.x/queues#job-chaining)이 정상적으로 디스패치 되었는지 확인할 수 있습니다. `assertChained` 메서드는 첫 번째 인수로 체인에 포함된 잡들의 배열을 받습니다.

```
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

위의 예시처럼, 체인 배열에는 각 잡의 클래스명을 나열할 수 있습니다. 하지만 실제 잡 인스턴스의 배열을 전달할 수도 있습니다. 이 경우 라라벨은 체인으로 디스패치된 잡의 클래스와 속성(property) 값이 동일한지도 함께 검사합니다.

```
Bus::assertChained([
    new ShipOrder,
    new RecordShipment,
    new UpdateInventory,
]);
```

`assertDispatchedWithoutChain` 메서드를 사용하면, 체인 없이 큐에 추가된 잡이 있는지도 검사할 수 있습니다.

```
Bus::assertDispatchedWithoutChain(ShipOrder::class);
```

<a name="testing-chained-batches"></a>
#### 체인에 포함된 배치 테스트하기

잡 체인에 [잡 배치](#chains-and-batches)가 포함되어 있다면, 체인 검증 안에서 `Bus::chainedBatch` 정의를 삽입하여 해당 배치가 조건을 만족하는지 검사할 수 있습니다.

```
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
### 잡 배치 테스트하기

`Bus` 파사드의 `assertBatched` 메서드를 이용하면, [잡 배치](/docs/10.x/queues#job-batching)가 정상적으로 디스패치 되었는지 확인할 수 있습니다. 이때 전달한 클로저는 `Illuminate\Bus\PendingBatch` 인스턴스를 받아, 그 안의 잡들을 확인할 수 있습니다.

```
use Illuminate\Bus\PendingBatch;
use Illuminate\Support\Facades\Bus;

Bus::fake();

// ...

Bus::assertBatched(function (PendingBatch $batch) {
    return $batch->name == 'import-csv' &&
           $batch->jobs->count() === 10;
});
```

`assertBatchCount` 메서드를 이용하면, 여러 개의 배치 작업이 의도한 횟수만큼 디스패치됐는지 확인할 수 있습니다.

```
Bus::assertBatchCount(3);
```

디스패치된 배치가 하나도 없는지 검사하려면 `assertNothingBatched`를 사용할 수 있습니다.

```
Bus::assertNothingBatched();
```

<a name="testing-job-batch-interaction"></a>
#### 잡과 배치 간 상호작용 테스트

때로는 개별 잡이 자신과 연결된 배치 객체와 어떻게 상호작용하는지 테스트해야 할 수도 있습니다. 예를 들어, 잡이 자신의 배치 처리 과정을 중단(취소)했는지 등을 체크하는 경우가 있습니다. 이럴 땐 `withFakeBatch` 메서드로 잡에 가짜 배치를 할당할 수 있으며, 반환값은 잡 인스턴스와 가짜 배치 객체가 들어있는 튜플입니다.

```
[$job, $batch] = (new ShipOrder)->withFakeBatch();

$job->handle();

$this->assertTrue($batch->cancelled());
$this->assertEmpty($batch->added);
```

<a name="job-events"></a>
## 잡 이벤트

`Queue` [파사드](/docs/10.x/facades)의 `before` 및 `after` 메서드를 사용하면, 큐에 의해 처리되기 전후에 실행할 콜백을 정의할 수 있습니다. 이런 콜백은 로그 추가, 대시보드 통계 증가 등 목적에 활용할 수 있습니다. 보통 이런 메서드는 [서비스 프로바이더](/docs/10.x/providers)의 `boot` 메서드에서 호출하는 것이 좋습니다. 예를 들어, 라라벨에 기본 포함되어 있는 `AppServiceProvider`에서 사용할 수 있습니다.

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
     * 애플리케이션 서비스를 등록합니다.
     */
    public function register(): void
    {
        // ...
    }

    /**
     * 애플리케이션 서비스를 부트스트랩합니다.
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

또한, `Queue` [파사드](/docs/10.x/facades)의 `looping` 메서드를 이용하면 워커가 큐에서 잡을 가져오기 시도 전마다 실행되는 콜백을 등록할 수 있습니다. 예를 들어, 이전에 실패한 잡으로 인해 열려있는 트랜잭션이 있다면, 이를 롤백하는 클로저를 등록할 수 있습니다.

```
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;

Queue::looping(function () {
    while (DB::transactionLevel() > 0) {
        DB::rollBack();
    }
});
```