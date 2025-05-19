# 큐 (Queues)

- [소개](#introduction)
    - [커넥션과 큐의 차이](#connections-vs-queues)
    - [드라이버 별 유의사항 및 사전 준비](#driver-prerequisites)
- [잡 생성하기](#creating-jobs)
    - [잡 클래스 생성](#generating-job-classes)
    - [클래스 구조](#class-structure)
    - [유일 잡(Unique Jobs)](#unique-jobs)
    - [암호화된 잡](#encrypted-jobs)
- [잡 미들웨어](#job-middleware)
    - [속도 제한(Rate Limiting)](#rate-limiting)
    - [잡 중첩 방지](#preventing-job-overlaps)
    - [예외 처리 시 제한(Throttling Exceptions)](#throttling-exceptions)
    - [잡 건너뛰기](#skipping-jobs)
- [잡 디스패치하기](#dispatching-jobs)
    - [지연 디스패치](#delayed-dispatching)
    - [동기 디스패치](#synchronous-dispatching)
    - [잡과 데이터베이스 트랜잭션](#jobs-and-database-transactions)
    - [잡 체이닝](#job-chaining)
    - [큐 및 커넥션 커스터마이징](#customizing-the-queue-and-connection)
    - [최대 시도 횟수 및 타임아웃 값 지정](#max-job-attempts-and-timeout)
    - [에러 처리](#error-handling)
- [잡 배치 작업(Job Batching)](#job-batching)
    - [배치 가능한 잡 정의하기](#defining-batchable-jobs)
    - [배치 디스패치](#dispatching-batches)
    - [체인과 배치](#chains-and-batches)
    - [배치에 잡 추가](#adding-jobs-to-batches)
    - [배치 확인](#inspecting-batches)
    - [배치 취소하기](#cancelling-batches)
    - [배치 실패 처리](#batch-failures)
    - [배치 데이터 정리(Pruning)](#pruning-batches)
    - [DynamoDB에 배치 저장하기](#storing-batches-in-dynamodb)
- [클로저 큐잉](#queueing-closures)
- [큐 워커 실행](#running-the-queue-worker)
    - [`queue:work` 명령어](#the-queue-work-command)
    - [큐 우선순위](#queue-priorities)
    - [큐 워커와 배포](#queue-workers-and-deployment)
    - [잡 만료 및 타임아웃](#job-expirations-and-timeouts)
- [Supervisor 설정](#supervisor-configuration)
- [실패한 잡 처리](#dealing-with-failed-jobs)
    - [실패한 잡 정리하기](#cleaning-up-after-failed-jobs)
    - [실패한 잡 재시도하기](#retrying-failed-jobs)
    - [누락된 모델 무시하기](#ignoring-missing-models)
    - [실패한 잡 데이터 정리(Pruning)](#pruning-failed-jobs)
    - [DynamoDB에 실패한 잡 저장하기](#storing-failed-jobs-in-dynamodb)
    - [실패한 잡 저장 비활성화](#disabling-failed-job-storage)
    - [실패한 잡 이벤트](#failed-job-events)
- [큐에서 잡 제거하기](#clearing-jobs-from-queues)
- [큐 모니터링](#monitoring-your-queues)
- [테스트](#testing)
    - [특정 잡만 페이크 처리](#faking-a-subset-of-jobs)
    - [잡 체인 테스트](#testing-job-chains)
    - [잡 배치 테스트](#testing-job-batches)
    - [잡/큐 상호작용 테스트](#testing-job-queue-interactions)
- [잡 이벤트](#job-events)

<a name="introduction"></a>
## 소개

웹 애플리케이션을 개발하다 보면, 예를 들어 업로드된 CSV 파일을 파싱해서 저장하는 작업처럼 일반적인 웹 요청 동안 처리하기에는 시간이 너무 오래 걸리는 작업이 발생할 수 있습니다. 다행히, 라라벨은 이런 작업을 백그라운드에서 실행되는 큐잉 잡(Queued Job)으로 손쉽게 만들어 처리할 수 있게 해줍니다. 시간 소모가 큰 작업을 큐로 옮기면, 애플리케이션이 웹 요청에 훨씬 빠르게 응답할 수 있게 되어 사용자 경험이 크게 개선됩니다.

라라벨 큐는 [Amazon SQS](https://aws.amazon.com/sqs/), [Redis](https://redis.io) 그리고 관계형 데이터베이스 등 다양한 큐 백엔드에서 사용할 수 있는 통합 큐잉 API를 제공합니다.

라라벨의 큐 관련 설정 옵션은 애플리케이션의 `config/queue.php` 설정 파일에 저장되어 있습니다. 이 파일에서는 프레임워크에 기본 포함된 데이터베이스, [Amazon SQS](https://aws.amazon.com/sqs/), [Redis](https://redis.io), [Beanstalkd](https://beanstalkd.github.io/) 등 각 큐 드라이버별로 커넥션 설정을 확인할 수 있습니다. 또한, 개발 환경에서 즉시 잡을 실행할 때 사용할 수 있는 동기(synchronous) 드라이버와, 큐에 저장된 잡을 모두 무시하는 `null` 큐 드라이버도 함께 제공됩니다.

> [!NOTE]
> 라라벨은 이제 Redis 기반 큐를 위한 아름다운 대시보드와 설정 시스템인 Horizon을 제공합니다. 자세한 내용은 [Horizon 공식 문서](/docs/12.x/horizon)를 참고하시기 바랍니다.

<a name="connections-vs-queues"></a>
### 커넥션과 큐의 차이

라라벨 큐를 본격적으로 활용하기 전에 "커넥션(connection)"과 "큐(queue)"의 차이를 명확하게 이해하는 것이 중요합니다. `config/queue.php`설정 파일 안의 `connections` 설정 배열을 보면, 이 옵션은 Amazon SQS, Beanstalk, Redis 등 백엔드 큐 서비스를 가리키는 커넥션들을 정의합니다. 하지만, 하나의 큐 커넥션에는 여러 개의 "큐"가 존재할 수 있는데, 이는 서로 다른 잡의 더미(스택)나 단위로 생각할 수 있습니다.

각 커넥션 설정 예시에는 반드시 `queue` 속성이 포함되어 있다는 점에 주목하세요. 이 속성은 해당 커넥션을 통해 디스패치되는 잡이 기본적으로 배치될 기본 큐를 지정합니다. 즉, 어떤 잡을 디스패치할 때 특정 큐를 명시적으로 지정하지 않으면, 해당 커넥션 설정의 `queue` 속성에 지정된 큐로 잡이 전달됩니다.

```php
use App\Jobs\ProcessPodcast;

// 이 잡은 기본 커넥션의 기본 큐로 전송됩니다...
ProcessPodcast::dispatch();

// 이 잡은 기본 커넥션의 "emails" 큐로 전송됩니다...
ProcessPodcast::dispatch()->onQueue('emails');
```

간단한 큐 하나만으로도 충분한 애플리케이션도 있겠지만, 잡을 여러 큐에 분산시켜서 각 잡의 우선순위나 처리 방식을 구분하고 싶을 때는 큐를 여러 개로 나누어 사용하는 것이 매우 유용합니다. 라라벨의 큐 워커는 어떤 큐를 우선적으로 처리할지 지정할 수 있기 때문입니다. 예를 들어, `high` 큐에 잡을 넣고, 이 큐에 높은 처리 우선순위를 설정할 수도 있습니다.

```shell
php artisan queue:work --queue=high,default
```

<a name="driver-prerequisites"></a>
### 드라이버 별 유의사항 및 사전 준비

<a name="database"></a>
#### 데이터베이스

`database` 큐 드라이버를 사용하려면, 잡을 저장할 데이터베이스 테이블이 필요합니다. 이 테이블은 일반적으로 라라벨의 기본 `0001_01_01_000002_create_jobs_table.php` [데이터베이스 마이그레이션](/docs/12.x/migrations)에 포함되어 있습니다. 만약 애플리케이션에 이 마이그레이션이 없다면, `make:queue-table` 아티즌 명령어를 사용해 직접 생성할 수 있습니다.

```shell
php artisan make:queue-table

php artisan migrate
```

<a name="redis"></a>
#### Redis

`redis` 큐 드라이버를 사용하기 위해서는 `config/database.php` 설정 파일에서 Redis 데이터베이스 커넥션을 먼저 설정해야 합니다.

> [!WARNING]
> `redis` 큐 드라이버는 Redis의 `serializer` 및 `compression` 옵션을 지원하지 않습니다.

**Redis 클러스터**

Redis 큐 커넥션에 Redis 클러스터를 사용하는 경우, 큐 이름에 [키 해시 태그](https://redis.io/docs/reference/cluster-spec/#hash-tags)를 포함해야 합니다. 이렇게 해야, 해당 큐에 대한 모든 Redis 키가 동일한 해시 슬롯에 배치됩니다.

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

**Blocking(차단 모드)**

Redis 큐를 사용할 때는 `block_for` 설정 옵션을 통해, 잡이 큐에 들어올 때까지 드라이버가 얼마나 대기해야 할지 지정할 수 있습니다. 이 옵션을 조정하면, 매번 새 잡이 있는지 Redis 데이터베이스를 계속 폴링(polling)하지 않아도 되어 효율적입니다. 예를 들어 값을 `5`로 설정하면, 잡이 큐에 생길 때까지 최대 5초 동안 대기합니다.

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
> `block_for`를 `0`으로 설정하면, 워커는 잡이 생길 때까지 무한히 대기합니다. 이렇게 되면 `SIGTERM` 같은 신호도 다음 잡이 처리될 때까지 인식하지 못하니 주의하세요.

<a name="other-driver-prerequisites"></a>
#### 그 외 드라이버 사전 준비

아래에 해당하는 큐 드라이버별로 추가적인 패키지 의존성이 필요합니다. 이 의존성들은 Composer 패키지 매니저를 통해 설치할 수 있습니다.

<div class="content-list" markdown="1">

- Amazon SQS: `aws/aws-sdk-php ~3.0`
- Beanstalkd: `pda/pheanstalk ~5.0`
- Redis: `predis/predis ~2.0` 또는 phpredis PHP 확장
- [MongoDB](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/queues/): `mongodb/laravel-mongodb`

</div>

<a name="creating-jobs"></a>
## 잡 생성하기

<a name="generating-job-classes"></a>
### 잡 클래스 생성

기본적으로, 애플리케이션의 큐잉 잡 클래스는 모두 `app/Jobs` 디렉터리에 저장됩니다. 만약 `app/Jobs` 디렉터리가 없다면, `make:job` 아티즌 명령어를 실행하면 자동으로 생성됩니다.

```shell
php artisan make:job ProcessPodcast
```

생성된 클래스는 `Illuminate\Contracts\Queue\ShouldQueue` 인터페이스를 구현하며, 라라벨에게 해당 잡을 비동기로 큐에 넣어 처리할 대기 잡(queued job)임을 알려줍니다.

> [!NOTE]
> 잡 스텁(stub)은 [스텁 퍼블리싱](/docs/12.x/artisan#stub-customization)을 이용해 커스터마이즈할 수 있습니다.

<a name="class-structure"></a>
### 클래스 구조

잡 클래스는 매우 단순하게 구성됩니다. 일반적으로 잡이 처리될 때 실행되는 `handle` 메서드만 포함합니다. 예를 들어, 팟캐스트 발행 서비스를 운영하면서 업로드된 팟캐스트 파일을 발행 전에 처리해야 한다고 가정해 보겠습니다.

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
     * 새 잡 인스턴스 생성
     */
    public function __construct(
        public Podcast $podcast,
    ) {}

    /**
     * 잡 실행
     */
    public function handle(AudioProcessor $processor): void
    {
        // 업로드된 팟캐스트 처리...
    }
}
```

위 예시에서 볼 수 있듯이, [Eloquent 모델](/docs/12.x/eloquent)을 잡 생성자에 직접 주입할 수 있습니다. 잡에 `Queueable` 트레이트를 사용하면, Eloquent 모델과 연관된 관계 데이터도 잡 실행 시점에 자동으로 직렬화 및 역직렬화됩니다.

큐에 잡을 넣을 때 Eloquent 모델을 전달하면, 모델의 식별자(ID)만 큐에 직렬화되어 저장됩니다. 실제로 잡을 실행할 때는 큐 시스템이 해당 식별자를 사용해 데이터베이스에서 전체 모델과 관계 데이터를 다시 가져옵니다. 이 방식 덕분에 큐 드라이버로 전송되는 잡 페이로드가 훨씬 작아집니다.

<a name="handle-method-dependency-injection"></a>
#### `handle` 메서드의 의존성 주입

잡의 `handle` 메서드는 큐에서 잡이 처리될 때 호출됩니다. 이때 `handle` 메서드에 타입힌트로 의존성을 선언하면, 라라벨 [서비스 컨테이너](/docs/12.x/container)가 알아서 필요한 의존성을 주입합니다.

의존성 주입 방식을 완전히 제어하고 싶다면, 컨테이너의 `bindMethod` 메서드를 활용할 수 있습니다. `bindMethod`는 콜백을 인자로 받아, 직접 원하는 방식으로 `handle` 메서드를 실행할 수 있게 해줍니다. 이 코드는 보통 `App\Providers\AppServiceProvider`의 `boot` 메서드에서 호출합니다.

```php
use App\Jobs\ProcessPodcast;
use App\Services\AudioProcessor;
use Illuminate\Contracts\Foundation\Application;

$this->app->bindMethod([ProcessPodcast::class, 'handle'], function (ProcessPodcast $job, Application $app) {
    return $job->handle($app->make(AudioProcessor::class));
});
```

> [!WARNING]
> 이미지 원본 데이터 등 이진 데이터를 큐잉 잡에 전달할 때는 반드시 `base64_encode` 함수를 사용해 인코딩 한 뒤 전달해야 합니다. 그렇지 않으면 잡이 JSON으로 올바르게 직렬화되지 않을 수 있습니다.

<a name="handling-relationships"></a>
#### 큐잉된 관계(Queued Relationships)

Eloquent 모델의 모든 로드된 연관 관계(relationship)도 잡과 함께 직렬화되기 때문에, 잡이 큐에 직렬화될 때 문자열이 너무 커질 수 있습니다. 또한, 큐에서 잡이 역직렬화되어 모델과 관계 데이터를 가져올 때는 원래 지정했던 제한(컨스트레인트) 없이 모든 연관 데이터가 다시 로드됩니다. 만약 특정 관계에서 일부 데이터만 활용하고 싶다면, 잡 안에서 다시 관계 제한을 걸어주어야 합니다.

또는, 직렬화 시점에 모델의 관계 데이터가 직렬화되지 않도록 하려면, 속성에 값을 할당할 때 `withoutRelations` 메서드를 사용하면 됩니다. 이 메서드는 로드된 관계 데이터가 없는 모델 인스턴스를 반환합니다.

```php
/**
 * 새 잡 인스턴스 생성
 */
public function __construct(
    Podcast $podcast,
) {
    $this->podcast = $podcast->withoutRelations();
}
```

PHP 생성자 프로퍼티 프로모션 기능을 사용할 때, Eloquent 모델의 관계 직렬화를 방지하려면 `WithoutRelations` 애트리뷰트를 사용할 수 있습니다.

```php
use Illuminate\Queue\Attributes\WithoutRelations;

/**
 * 새 잡 인스턴스 생성
 */
public function __construct(
    #[WithoutRelations]
    public Podcast $podcast,
) {}
```

잡이 단일 모델이 아니라 Eloquent 모델의 컬렉션이나 배열을 인자로 받는 경우, 큐에서 작업이 복원될 때 해당 컬렉션 안의 각 모델들은 관계 데이터가 복원되지 않습니다. 이는 다량의 모델을 다루는 작업에서 자원 사용량이 과도하게 늘어나는 것을 방지하기 위한 조치입니다.

<a name="unique-jobs"></a>
### 유일 잡(Unique Jobs)

> [!WARNING]
> 유일 잡 기능을 사용하려면 [락(lock)](/docs/12.x/cache#atomic-locks)을 지원하는 캐시 드라이버가 필요합니다. 현재 `memcached`, `redis`, `dynamodb`, `database`, `file`, `array` 캐시 드라이버에서 원자적 락을 지원합니다. 단, 유일 잡 제약 조건은 잡 배치(batch) 내의 잡에는 적용되지 않습니다.

특정 잡이 어느 시점에 오직 하나만 큐에 존재하도록 하고 싶을 때가 있습니다. 이런 경우, 잡 클래스에 `ShouldBeUnique` 인터페이스를 구현하면 됩니다. 이 인터페이스는 별도의 추가 메서드 구현이 필요하지 않습니다.

```php
<?php

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Contracts\Queue\ShouldBeUnique;

class UpdateSearchIndex implements ShouldQueue, ShouldBeUnique
{
    // ...
}
```

위 예시에서처럼 `UpdateSearchIndex` 잡은 항상 유일하게 동작합니다. 즉, 동일한 잡이 큐에 이미 존재하고 아직 처리 중이라면, 같은 잡은 새로 디스패치되지 않습니다.

경우에 따라, 잡의 고유성을 결정하는 "키"를 직접 지정하거나, 일정 시간까지 잡의 고유성을 유지할 수도 있습니다. 이를 위해 잡 클래스에 `uniqueId`와 `uniqueFor` 속성이나 메서드를 정의하면 됩니다.

```php
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
     * 잡의 고유 락이 해제되기까지의 시간(초 단위)
     *
     * @var int
     */
    public $uniqueFor = 3600;

    /**
     * 잡의 고유 ID 반환
     */
    public function uniqueId(): string
    {
        return $this->product->id;
    }
}
```

위 예시는 상품 ID를 기준으로 잡의 유일성을 판단합니다. 즉, 동일한 상품 ID로 같은 잡을 다시 디스패치해도, 기존 잡 처리가 끝나기 전까진 무시됩니다. 또한, 기존 잡이 한 시간 이내에 처리되지 않으면 고유 락이 해제되어 같은 키의 잡을 새로 디스패치할 수 있습니다.

> [!WARNING]
> 여러 웹 서버나 컨테이너에서 잡을 디스패치하는 경우, 모든 서버가 동일한 중앙 캐시 서버를 사용하도록 설정되어야만 라라벨이 정상적으로 잡의 유일성을 판단할 수 있습니다.

<a name="keeping-jobs-unique-until-processing-begins"></a>
#### 잡이 처리 시작 전까지 유일 상태 유지

기본적으로 유일 잡은 작업이 끝나거나 모든 재시도가 실패하면 "락(잠금)이 해제"됩니다. 그러나, 잡이 실제로 처리되기 직전까지만 유일 상태를 유지하고 싶을 때가 있습니다. 이런 경우, 잡 클래스에 `ShouldBeUnique` 대신 `ShouldBeUniqueUntilProcessing` 인터페이스를 구현하세요.

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
#### 유일 잡 락(Unique Job Locks)

내부적으로, `ShouldBeUnique` 잡이 디스패치되면 라라벨은 `uniqueId` 키로 [락](/docs/12.x/cache#atomic-locks)을 얻으려고 시도합니다. 만약 락을 획득하지 못하면 잡이 디스패치되지 않습니다. 이 락은 잡이 처리 완료되거나 모든 재시도가 실패하면 해제됩니다. 기본적으로 라라벨은 기본 캐시 드라이버를 사용해 락을 얻습니다. 그러나 다른 캐시 드라이버를 사용하고 싶다면, 잡 클래스에서 `uniqueVia` 메서드를 정의할 수 있습니다.

```php
use Illuminate\Contracts\Cache\Repository;
use Illuminate\Support\Facades\Cache;

class UpdateSearchIndex implements ShouldQueue, ShouldBeUnique
{
    // ...

    /**
     * 유일 잡 락에 사용할 캐시 드라이버 반환
     */
    public function uniqueVia(): Repository
    {
        return Cache::driver('redis');
    }
}
```

> [!NOTE]
> 단순히 동시에 실행되는 잡의 개수만 제한하고 싶다면, [WithoutOverlapping](/docs/12.x/queues#preventing-job-overlaps) 잡 미들웨어를 사용하는 것이 더 적합합니다.

<a name="encrypted-jobs"></a>
### 암호화된 잡

라라벨은 잡 데이터를 [암호화](/docs/12.x/encryption)하여 개인정보 및 데이터 무결성을 보호할 수 있도록 지원합니다. 잡 클래스에서 `ShouldBeEncrypted` 인터페이스만 추가하면, 라라벨이 잡을 큐에 넣을 때 자동으로 암호화합니다.

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
## 잡 미들웨어

잡 미들웨어를 사용하면 큐잉 잡 실행 과정에 맞춤 로직을 래핑할 수 있어, 잡 클래스 자체의 보일러플레이트 코드를 줄이고 재사용성도 높일 수 있습니다. 예를 들어, 아래 `handle` 메서드는 라라벨의 Redis 속도 제한(rate limit) 기능을 사용해 5초마다 한 번씩만 잡이 동작하도록 제한합니다.

```php
use Illuminate\Support\Facades\Redis;

/**
 * 잡 실행
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

이 코드 자체는 유효하지만, handle 메서드가 Redis 속도 제한 로직으로 인해 복잡해집니다. 또한, 이 패턴을 여러 잡에서 반복해서 직접 작성해야 한다는 단점이 있습니다.

이런 경우, handle 메서드에서 직접 제한 로직을 구현하는 대신, 제한을 담당하는 잡 미들웨어를 따로 만들어 사용할 수 있습니다. 라라벨은 잡 미들웨어의 기본 위치를 정해두진 않았으니, 원하는 디렉터리에 자유롭게 둘 수 있습니다. 아래 예시에서는 `app/Jobs/Middleware` 디렉터리에 미들웨어를 생성했습니다.

```php
<?php

namespace App\Jobs\Middleware;

use Closure;
use Illuminate\Support\Facades\Redis;

class RateLimited
{
    /**
     * 큐잉 잡 처리
     *
     * @param  \Closure(object): void  $next
     */
    public function handle(object $job, Closure $next): void
    {
        Redis::throttle('key')
            ->block(0)->allow(1)->every(5)
            ->then(function () use ($job, $next) {
                // 락 획득 성공...

                $next($job);
            }, function () use ($job) {
                // 락 획득 실패...

                $job->release(5);
            });
    }
}
```

보시다시피, [라우트 미들웨어](/docs/12.x/middleware)처럼 잡 미들웨어 역시 처리 대상 잡 객체와, 잡 처리를 계속 진행하도록 콜백 함수를 인자로 전달받습니다.

잡 미들웨어를 만들었으면, 잡 클래스의 `middleware` 메서드에서 해당 미들웨어를 반환하면 됩니다. 이 메서드는 `make:job` 아티즌 명령어로 생성한 잡에서는 기본으로 포함되어 있지 않으니, 직접 추가해야 합니다.

```php
use App\Jobs\Middleware\RateLimited;

/**
 * 잡이 통과해야 할 미들웨어 목록 반환
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [new RateLimited];
}
```

> [!NOTE]
> 잡 미들웨어는 큐형 이벤트 리스너, 메일러블, 알림 등에도 지정할 수 있습니다.

<a name="rate-limiting"></a>
### 속도 제한(Rate Limiting)

앞서 예시에서는 직접 잡 미들웨어를 작성했지만, 라라벨은 이미 잡의 실행 빈도를 제한할 수 있는 기본 속도 제한 미들웨어를 제공합니다. [라우트 속도 제한자](/docs/12.x/routing#defining-rate-limiters)와 마찬가지로, 잡 속도 제한자도 `RateLimiter` 파사드의 `for` 메서드로 정의할 수 있습니다.

예를 들어, 일반 사용자는 한 시간에 한 번만 백업 잡을 허용하면서, 프리미엄 고객에게는 이런 제한을 두지 않을 수 있습니다. 이를 위해 `AppServiceProvider`의 `boot` 메서드에 `RateLimiter`를 정의하면 됩니다.

```php
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

위 코드는 시간 단위로 제한하지만, `perMinute` 메서드를 사용해 분 단위로도 손쉽게 제한할 수 있습니다. 또한 `by` 메서드에는 원하는 값을 전달해 고객별로 별도의 제한을 둘 수 있습니다(일반적으로는 사용자 아이디로 구분).

```php
return Limit::perMinute(50)->by($job->user->id);
```

속도 제한자를 정의했다면, 이제 `Illuminate\Queue\Middleware\RateLimited` 미들웨어를 잡 클래스에 지정해서 사용할 수 있습니다. 잡이 제한을 초과하게 되면, 이 미들웨어가 자동으로 잡을 큐로 다시 리스케줄하며, 제한 시간에 따라 적절히 대기시킵니다.

```php
use Illuminate\Queue\Middleware\RateLimited;

/**
 * 잡이 통과해야 할 미들웨어 목록 반환
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [new RateLimited('backups')];
}
```

이처럼 제한으로 인해 잡을 다시 큐에 리스케줄하면, 잡의 전체 `시도 횟수(attempts)`도 함께 증가합니다. 따라서 잡 클래스의 `tries`, `maxExceptions` 속성을 상황에 맞게 조정하거나, [retryUntil 메서드](#time-based-attempts)를 사용해 잡 재시도 기간을 명확히 지정할 수도 있습니다.

또, `releaseAfter` 메서드를 사용하면, 잡이 다시 시도되기 전에 대기해야 할 시간을 초 단위로 직접 지정할 수 있습니다.

```php
/**
 * 잡이 통과해야 할 미들웨어 목록 반환
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new RateLimited('backups'))->releaseAfter(60)];
}
```

반면, 잡이 속도 제한에 걸렸을 때 다시 큐에 올리지 않고 아예 재시도를 막고 싶다면, `dontRelease` 메서드를 사용하세요.

```php
/**
 * 잡이 통과해야 할 미들웨어 목록 반환
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new RateLimited('backups'))->dontRelease()];
}
```

> [!NOTE]
> Redis를 사용중이라면, Redis에 특화되어 성능이 더 우수한 `Illuminate\Queue\Middleware\RateLimitedWithRedis` 미들웨어도 활용할 수 있습니다.

<a name="preventing-job-overlaps"></a>
### 잡 중첩 방지

라라벨에는 `Illuminate\Queue\Middleware\WithoutOverlapping` 미들웨어가 기본 제공되어, 임의의 키를 기준으로 같은 잡이 동시에 실행되는 것을 방지할 수 있습니다. 예를 들어, 한 번에 오직 하나의 잡만 특정 리소스를 수정해야 할 때 유용합니다.

예를 들어, 사용자 신용점수(credit score)를 갱신하는 큐잉 잡에서 동일한 사용자 ID로 중복 실행되는 잡을 방지하고 싶다면, 잡 클래스의 `middleware` 메서드에 `WithoutOverlapping` 미들웨어를 지정하세요.

```php
use Illuminate\Queue\Middleware\WithoutOverlapping;

/**
 * 잡이 통과해야 할 미들웨어 목록 반환
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [new WithoutOverlapping($this->user->id)];
}
```

같은 유형의 중첩 잡이 발생하면, 해당 잡은 다시 큐로 반환됩니다. 잡을 다시 시도하기 전 대기 시간을 초 단위로 지정할 수도 있습니다.

```php
/**
 * 잡이 통과해야 할 미들웨어 목록 반환
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new WithoutOverlapping($this->order->id))->releaseAfter(60)];
}
```

중첩된 잡이 재시도되지 않고 바로 삭제되길 원한다면, `dontRelease` 메서드를 사용하세요.

```php
/**
 * 잡이 통과해야 할 미들웨어 목록 반환
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new WithoutOverlapping($this->order->id))->dontRelease()];
}
```

`WithoutOverlapping` 미들웨어는 라라벨의 원자적 락 기능을 활용합니다. 간혹 예기치 않은 실패나 타임아웃 등으로 락이 해제되지 않는 경우가 있을 수 있으니, `expireAfter` 메서드로 락의 만료 시간을 지정할 수 있습니다. 아래 예시는 잡이 처리 시작 후 3분(180초)이 지나면 락을 자동으로 해제합니다.

```php
/**
 * 잡이 통과해야 할 미들웨어 목록 반환
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new WithoutOverlapping($this->order->id))->expireAfter(180)];
}
```

> [!WARNING]
> `WithoutOverlapping` 미들웨어 역시 [락](/docs/12.x/cache#atomic-locks)을 지원하는 캐시 드라이버가 필요합니다. 현재 `memcached`, `redis`, `dynamodb`, `database`, `file`, `array` 드라이버가 지원됩니다.

<a name="sharing-lock-keys"></a>

#### 작업 클래스 간 락 키(key) 공유

기본적으로 `WithoutOverlapping` 미들웨어는 동일한 클래스의 중첩 실행만을 막습니다. 따라서 서로 다른 두 작업 클래스가 동일한 락 키를 사용해도, 기본적으로는 중첩 실행이 방지되지 않습니다. 그러나 `shared` 메서드를 사용하면 라라벨이 이 락 키를 작업 클래스 간에도 적용하도록 지정할 수 있습니다.

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
### 예외 쓰로틀링(Throttling Exceptions)

라라벨에는 예외를 일정 횟수 이상 발생시키면 일시적으로 작업 실행을 지연시키는 `Illuminate\Queue\Middleware\ThrottlesExceptions` 미들웨어가 포함되어 있습니다. 작업에서 주어진 횟수만큼 예외가 발생하면, 지정한 시간 간격이 지날 때까지 해당 작업의 추가 실행이 모두 연기됩니다. 이 미들웨어는 외부 서비스와 상호작용할 때처럼, 불안정한 환경에서 유용하게 사용할 수 있습니다.

예를 들어, 외부 API와 통신하는 큐 작업이 있고, 해당 API에서 반복적으로 예외가 발생하는 상황을 생각해봅시다. 예외 쓰로틀링을 적용하고 싶을 때, 작업의 `middleware` 메서드에서 `ThrottlesExceptions` 미들웨어를 반환하면 됩니다. 일반적으로 이 미들웨어는 [시간 기반 재시도](#time-based-attempts)와 함께 사용하는 것이 권장됩니다.

```php
use DateTime;
use Illuminate\Queue\Middleware\ThrottlesExceptions;

/**
 * 작업이 통과해야 할 미들웨어를 반환합니다.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [new ThrottlesExceptions(10, 5 * 60)];
}

/**
 * 작업이 타임아웃되어야 할 시점을 반환합니다.
 */
public function retryUntil(): DateTime
{
    return now()->addMinutes(30);
}
```

이 미들웨어의 첫 번째 생성자 인자는 작업이 쓰로틀링(지연)되기 전까지 허용할 예외 발생 횟수이고, 두 번째 인자는 작업이 쓰로틀링된 이후 재시도를 시도하기까지 대기해야 하는 초 단위 시간입니다. 위의 예시에서, 만약 작업이 10번 연속으로 예외를 던지면, 작업은 5분 동안 중지됐다가, 30분 제한 시간 안에서 다시 시도됩니다.

작업이 예외를 던졌으나, 아직 임계 예외 횟수에 도달하지 않았다면, 작업은 일반적으로 즉시 재시도됩니다. 그러나 작업을 지연시키고 싶다면, 미들웨어에 `backoff` 메서드를 호출하여 지연 분을 지정할 수도 있습니다.

```php
use Illuminate\Queue\Middleware\ThrottlesExceptions;

/**
 * 작업이 통과해야 할 미들웨어를 반환합니다.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new ThrottlesExceptions(10, 5 * 60))->backoff(5)];
}
```

이 미들웨어는 내부적으로 라라벨의 캐시 시스템을 이용하여 속도 제한(rate limiting)을 구현하며, 작업의 클래스 이름이 캐시 "키(key)"로 사용됩니다. 만약 여러 작업이 동일한 외부 서비스를 이용하고, 이 작업들에 대해 동일한 쓰로틀링 "버킷"을 공유하고 싶다면, 미들웨어를 작업에 붙일 때 `by` 메서드로 키를 변경할 수 있습니다.

```php
use Illuminate\Queue\Middleware\ThrottlesExceptions;

/**
 * 작업이 통과해야 할 미들웨어를 반환합니다.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new ThrottlesExceptions(10, 10 * 60))->by('key')];
}
```

기본적으로 이 미들웨어는 발생하는 모든 예외에 대해 쓰로틀링을 적용합니다. 하지만 작업에 미들웨어를 지정할 때 `when` 메서드를 사용하면, 전달된 클로저가 `true`를 반환할 때만 예외를 쓰로틀링하도록 동작을 변경할 수 있습니다.

```php
use Illuminate\Http\Client\HttpClientException;
use Illuminate\Queue\Middleware\ThrottlesExceptions;

/**
 * 작업이 통과해야 할 미들웨어를 반환합니다.
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

`when` 메서드는 작업을 큐로 다시 반환하거나 예외를 던지지만, `deleteWhen` 메서드는 지정한 예외가 발생했을 때 작업을 완전히 삭제할 수 있습니다.

```php
use App\Exceptions\CustomerDeletedException;
use Illuminate\Queue\Middleware\ThrottlesExceptions;

/**
 * 작업이 통과해야 할 미들웨어를 반환합니다.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new ThrottlesExceptions(2, 10 * 60))->deleteWhen(CustomerDeletedException::class)];
}
```

만약 쓰로틀링된 예외를 애플리케이션의 예외 핸들러에도 보고하고 싶다면, 미들웨어 연결 시 `report` 메서드를 호출하면 됩니다. 선택적으로 `report`에 클로저를 인자로 넘길 수 있으며, 해당 클로저가 `true`를 반환하면 예외가 보고됩니다.

```php
use Illuminate\Http\Client\HttpClientException;
use Illuminate\Queue\Middleware\ThrottlesExceptions;

/**
 * 작업이 통과해야 할 미들웨어를 반환합니다.
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
> Redis를 사용하고 있다면, Redis에 최적화되어 있고 성능이 더 뛰어난 `Illuminate\Queue\Middleware\ThrottlesExceptionsWithRedis` 미들웨어를 사용할 수 있습니다.

<a name="skipping-jobs"></a>
### 작업 건너뛰기 (Skipping Jobs)

`Skip` 미들웨어를 사용하면, 작업의 내부 로직을 수정하지 않고도 작업을 건너뛰거나 삭제할 수 있습니다. `Skip::when` 메서드는 조건이 참이면 작업을 삭제하며, `Skip::unless`는 조건이 거짓인 경우 작업을 삭제합니다.

```php
use Illuminate\Queue\Middleware\Skip;

/**
 * 작업이 통과해야 할 미들웨어를 반환합니다.
 */
public function middleware(): array
{
    return [
        Skip::when($someCondition),
    ];
}
```

더 복잡한 조건 평가가 필요하다면, `when` 및 `unless` 메서드에 `Closure`를 전달할 수도 있습니다.

```php
use Illuminate\Queue\Middleware\Skip;

/**
 * 작업이 통과해야 할 미들웨어를 반환합니다.
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
## 작업 디스패치(Dispatching Jobs)

작업 클래스를 작성하고 나면, 작업 클래스에서 직접 `dispatch` 메서드를 호출해 작업을 디스패치할 수 있습니다. `dispatch`에 전달된 인수들은 작업 생성자(constructor)로 전달됩니다.

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
     * 새로운 팟캐스트 저장.
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

특정 조건일 때만 작업을 디스패치하려면, `dispatchIf` 및 `dispatchUnless` 메서드를 사용할 수 있습니다.

```php
ProcessPodcast::dispatchIf($accountActive, $podcast);

ProcessPodcast::dispatchUnless($accountSuspended, $podcast);
```

새로운 라라벨 애플리케이션에서는 `sync` 드라이버가 기본 큐 드라이버입니다. 이 드라이버는 작업을 요청의 포그라운드에서 즉시(동기적으로) 실행하기 때문에, 로컬 개발 중에는 매우 편리합니다. 실제로 작업을 백그라운드에서 처리하고 싶다면, 애플리케이션의 `config/queue.php` 설정 파일에서 다른 큐 드라이버를 지정하면 됩니다.

<a name="delayed-dispatching"></a>
### 지연 디스패치(Delayed Dispatching)

작업이 곧바로 큐 워커에 의해 처리되지 않도록 하려면, 작업 디스패치 시에 `delay` 메서드를 사용할 수 있습니다. 예를 들어, 작업이 디스패치된 후 10분이 지난 뒤부터 처리되게 하고 싶다고 해봅시다.

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
     * 새로운 팟캐스트 저장.
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

특정 작업에 기본 지연 시간이 설정되어 있는 경우도 있습니다. 만약 이 기본 지연을 무시하고 즉시 작업을 디스패치하고 싶다면, `withoutDelay` 메서드를 사용할 수 있습니다.

```php
ProcessPodcast::dispatch($podcast)->withoutDelay();
```

> [!WARNING]
> Amazon SQS 큐 서비스의 최대 지연 시간은 15분입니다.

<a name="dispatching-after-the-response-is-sent-to-browser"></a>
#### 클라이언트에 응답을 전송한 후 디스패치

또한, 웹 서버가 FastCGI를 사용할 때 `dispatchAfterResponse` 메서드를 이용하면 HTTP 응답을 사용자의 브라우저로 전송한 이후에 작업을 디스패치하도록 지연시킬 수 있습니다. 이 방식은 큐 작업이 실행되는 동안에도 사용자가 애플리케이션 이용을 바로 시작할 수 있게 합니다. 일반적으로 1초 이내에 실행되는 작업(예: 메일 보내기) 등에 적합합니다. 이 방식으로 디스패치된 작업은 현재 HTTP 요청 안에서 처리되므로, 별도의 큐 워커가 실행 중일 필요가 없습니다.

```php
use App\Jobs\SendNotification;

SendNotification::dispatchAfterResponse();
```

또한, 클로저를 `dispatch` 한 뒤에 `afterResponse` 메서드를 체이닝하여, 브라우저로 응답이 전달된 이후에 클로저가 실행되도록 할 수 있습니다.

```php
use App\Mail\WelcomeMessage;
use Illuminate\Support\Facades\Mail;

dispatch(function () {
    Mail::to('taylor@example.com')->send(new WelcomeMessage);
})->afterResponse();
```

<a name="synchronous-dispatching"></a>
### 동기적 디스패치(Synchronous Dispatching)

즉시(동기적으로) 작업을 디스패치하고자 한다면, `dispatchSync` 메서드를 사용할 수 있습니다. 이 메서드를 쓸 경우, 작업은 큐에 올라가지 않고, 현재 프로세스 내에서 바로 실행됩니다.

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
     * 새로운 팟캐스트 저장.
     */
    public function store(Request $request): RedirectResponse
    {
        $podcast = Podcast::create(/* ... */);

        // 팟캐스트 생성...

        ProcessPodcast::dispatchSync($podcast);

        return redirect('/podcasts');
    }
}
```

<a name="jobs-and-database-transactions"></a>
### 작업과 데이터베이스 트랜잭션(Jobs & Database Transactions)

데이터베이스 트랜잭션 내에서 작업을 디스패치해도 무방하지만, 작업이 실제로 제대로 실행될 수 있는지 신경을 써야 합니다. 만약 트랜잭션 내에서 작업을 디스패치할 때, 작업이 트랜잭션 커밋 전에 워커에 의해 실행될 수 있기 때문입니다. 이런 경우, 해당 트랜잭션 중에 모델이나 데이터베이스 레코드를 수정한 내용이 아직 DB에 반영되지 않았거나, 트랜잭션 내에서 생성된 모델 및 레코드가 DB에 존재하지 않을 수 있습니다.

다행히도, 라라벨은 이런 문제를 해결할 수 있는 몇 가지 방법을 제공합니다. 먼저, 큐 커넥션의 설정 배열에서 `after_commit` 옵션을 설정할 수 있습니다.

```php
'redis' => [
    'driver' => 'redis',
    // ...
    'after_commit' => true,
],
```

`after_commit` 옵션이 `true`라면, 트랜잭션 내에서 작업을 디스패치하더라도, 라라벨은 부모 데이터베이스 트랜잭션이 모두 커밋될 때까지 실제 작업 디스패치를 지연시킵니다. 물론, 열린 데이터베이스 트랜잭션이 없으면 작업은 곧바로 디스패치됩니다.

만약 트랜잭션이 예외로 인해 롤백되면, 해당 트랜잭션 중에 디스패치된 작업들도 모두 폐기(discard)됩니다.

> [!NOTE]
> `after_commit` 설정을 `true`로 지정하면, 큐로 처리되는 이벤트 리스너, 메일, 알림, 브로드캐스트 이벤트 역시 모든 데이터베이스 트랜잭션 커밋 이후에 디스패치됩니다.

<a name="specifying-commit-dispatch-behavior-inline"></a>
#### 커밋 후 디스패치 동작 개별 지정

큐 커넥션의 `after_commit` 옵션을 `true`로 설정하지 않은 경우에도, 특정 작업만 모든 열린 데이터베이스 트랜잭션이 커밋된 뒤에 디스패치되도록 지정할 수 있습니다. 이럴 때는 작업 디스패치 뒤에 `afterCommit` 메서드를 체이닝하면 됩니다.

```php
use App\Jobs\ProcessPodcast;

ProcessPodcast::dispatch($podcast)->afterCommit();
```

반대로 `after_commit` 설정이 이미 `true`라면, 특정 작업에 대해서만 트랜잭션 커밋을 기다리지 않고 즉시 디스패치할 수 있습니다. 이럴 때는 `beforeCommit` 메서드를 사용할 수 있습니다.

```php
ProcessPodcast::dispatch($podcast)->beforeCommit();
```

<a name="job-chaining"></a>
### 작업 체이닝(Job Chaining)

작업 체이닝을 이용하면, 하나의 작업이 성공적으로 실행된 이후 차례대로 실행되어야 할 여러 큐 작업들을 순서대로 지정할 수 있습니다. 만약 체인 중 하나가 실패하면, 그 뒤의 나머지 작업들은 실행되지 않습니다. 큐 작업 체인을 실행하려면 `Bus` 파사드의 `chain` 메서드를 사용합니다. 라라벨의 커맨드 버스(command bus)는 큐 작업 디스패치가 그 위에 구축된 하위 레벨 컴포넌트입니다.

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

작업 클래스 인스턴스뿐 아니라, 클로저도 체인에 포함시킬 수 있습니다.

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
> 체인 내의 작업에서 `$this->delete()` 메서드를 이용해 작업을 삭제하더라도, 체이닝된 작업의 실행은 막히지 않습니다. 체인 내에서 작업이 실패할 때만 나머지 작업 실행이 중단됩니다.

<a name="chain-connection-queue"></a>
#### 체인 연결 및 큐 지정

체이닝된 작업 전체를 어떤 큐 커넥션/큐에 올릴지 지정하고 싶다면, `onConnection` 및 `onQueue` 메서드를 사용할 수 있습니다. 이 메서드는 명시적으로 다른 커넥션 또는 큐가 지정되지 않은 한, 체인 내의 작업 전체에 적용됩니다.

```php
Bus::chain([
    new ProcessPodcast,
    new OptimizePodcast,
    new ReleasePodcast,
])->onConnection('redis')->onQueue('podcasts')->dispatch();
```

<a name="adding-jobs-to-the-chain"></a>
#### 체인에 작업 추가하기

때로는 체인 내부의 작업에서, 기존 체인 앞이나 뒤에 작업을 추가해야 할 수도 있습니다. 이런 경우, `prependToChain`과 `appendToChain` 메서드를 사용할 수 있습니다.

```php
/**
 * 작업 실행.
 */
public function handle(): void
{
    // ...

    // 현재 체인 앞에 추가하여, 현재 작업 이후 즉시 실행...
    $this->prependToChain(new TranscribePodcast);

    // 현재 체인 뒤에 추가하여, 체인 끝에서 실행...
    $this->appendToChain(new TranscribePodcast);
}
```

<a name="chain-failures"></a>
#### 체인 실패 처리

작업 체이닝 시, `catch` 메서드를 사용해 체인 중 하나의 작업이 실패했을 때 실행할 클로저를 지정할 수 있습니다. 전달된 콜백에는 작업 실패를 일으킨 `Throwable` 인스턴스가 전달됩니다.

```php
use Illuminate\Support\Facades\Bus;
use Throwable;

Bus::chain([
    new ProcessPodcast,
    new OptimizePodcast,
    new ReleasePodcast,
])->catch(function (Throwable $e) {
    // 체인 내부의 작업이 실패함...
})->dispatch();
```

> [!WARNING]
> 체인 콜백은 직렬화되어 이후에 큐에서 실행되기 때문에, 콜백 내부에서 `$this` 변수를 사용하는 것은 피해야 합니다.

<a name="customizing-the-queue-and-connection"></a>
### 큐 및 커넥션 커스터마이징

<a name="dispatching-to-a-particular-queue"></a>
#### 특정 큐로 디스패치하기

여러 큐로 작업을 분리(push)하면 작업을 용도별로 구분("카테고리"화)하거나, 각 큐마다 워커 수를 달리 배정하여 우선순위를 조정할 수 있습니다. 이 방법은 큐 설정 파일에 정의된 서로 다른 큐 "커넥션"으로 분리하는 것이 아니라, 하나의 커넥션 내부에서 큐 이름만 다르게 지정하는 것임에 유의하세요. 작업을 특정 큐로 보내려면, 디스패치 시 `onQueue` 메서드를 사용하면 됩니다.

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
     * 새로운 팟캐스트 저장.
     */
    public function store(Request $request): RedirectResponse
    {
        $podcast = Podcast::create(/* ... */);

        // 팟캐스트 생성...

        ProcessPodcast::dispatch($podcast)->onQueue('processing');

        return redirect('/podcasts');
    }
}
```

또는, 작업 클래스의 생성자 내부에서 `onQueue` 메서드를 호출해 해당 작업이 항상 특정 큐로 디스패치되도록 할 수 있습니다.

```php
<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ProcessPodcast implements ShouldQueue
{
    use Queueable;

    /**
     * 새 작업 인스턴스 생성.
     */
    public function __construct()
    {
        $this->onQueue('processing');
    }
}
```

<a name="dispatching-to-a-particular-connection"></a>
#### 특정 커넥션으로 디스패치하기

애플리케이션에서 여러 큐 커넥션을 운영한다면, 작업을 원하는 커넥션으로 디스패치할 때 `onConnection` 메서드를 쓸 수 있습니다.

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
     * 새로운 팟캐스트 저장.
     */
    public function store(Request $request): RedirectResponse
    {
        $podcast = Podcast::create(/* ... */);

        // 팟캐스트 생성...

        ProcessPodcast::dispatch($podcast)->onConnection('sqs');

        return redirect('/podcasts');
    }
}
```

`onConnection`과 `onQueue` 메서드는 체이닝해서, 작업의 커넥션과 큐를 동시에 지정할 수도 있습니다.

```php
ProcessPodcast::dispatch($podcast)
    ->onConnection('sqs')
    ->onQueue('processing');
```

마찬가지로, 작업 클래스의 생성자 내부에서 `onConnection` 메서드를 호출해 해당 작업이 항상 특정 커넥션으로 디스패치되도록 할 수도 있습니다.

```php
<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ProcessPodcast implements ShouldQueue
{
    use Queueable;

    /**
     * 새 작업 인스턴스 생성.
     */
    public function __construct()
    {
        $this->onConnection('sqs');
    }
}
```

<a name="max-job-attempts-and-timeout"></a>

### 최대 작업 시도 횟수 / 타임아웃 값 지정

<a name="max-attempts"></a>
#### 최대 시도 횟수

큐에 등록된 작업 중 에러가 발생하는 일이 있다면, 그 작업이 무한정 반복(재시도)되는 상황을 원하지 않으실 것입니다. 라라벨은 이러한 상황을 제어할 수 있도록, 작업의 최대 시도 횟수나 리트라이 가능한 기간을 여러 방법으로 지정할 수 있습니다.

가장 간단한 방법은 Artisan 명령어 라인에서 `--tries` 옵션을 사용하는 것입니다. 이 옵션을 지정하면 워커가 처리하는 모든 작업에 일괄 적용됩니다. 단, 개별 작업 클래스에 별도로 시도 횟수가 지정되어 있다면 해당 값이 우선 적용됩니다.

```shell
php artisan queue:work --tries=3
```

작업이 최대 시도 횟수를 초과하면, 해당 작업은 "실패"로 간주됩니다. 실패한 작업 처리 방법에 대해서는 [실패한 작업 문서](#dealing-with-failed-jobs)를 참고하시기 바랍니다. 만약 `queue:work` 명령어에 `--tries=0`을 지정하면, 해당 작업은 무한정 반복 재시도 됩니다.

더 세밀하게 제어하고 싶다면, 작업 클래스 자체에서 작업별로 최대 시도 횟수를 지정할 수도 있습니다. 작업에 최대 시도 횟수가 명시되어 있으면, 커맨드 라인에서 지정한 `--tries` 값보다 우선 적용됩니다.

```php
<?php

namespace App\Jobs;

class ProcessPodcast implements ShouldQueue
{
    /**
     * 작업이 시도될 수 있는 최대 횟수
     *
     * @var int
     */
    public $tries = 5;
}
```

특정 작업에 대해 동적으로 최대 시도 횟수를 제어하고 싶은 경우, 작업 클래스에 `tries` 메서드를 정의하면 됩니다.

```php
/**
 * 작업이 시도될 수 있는 최대 횟수 지정.
 */
public function tries(): int
{
    return 5;
}
```

<a name="time-based-attempts"></a>
#### 시간 기반 시도 제한

실패 처리 기준을 "몇 번 시도까지만"으로 제한하지 않고, "언제까지 시도 가능한가"와 같은 기간 기준으로 지정할 수도 있습니다. 즉, 지정한 시간 내에는 얼마든지 여러 번 재시도할 수 있도록 설정하는 방식입니다. 이를 위해 작업 클래스에 `retryUntil` 메서드를 추가하면 됩니다. 이 메서드는 반드시 `DateTime` 인스턴스를 반환해야 합니다.

```php
use DateTime;

/**
 * 작업이 언제까지 시도되어야 하는지 지정합니다.
 */
public function retryUntil(): DateTime
{
    return now()->addMinutes(10);
}
```

`retryUntil`과 `tries`가 모두 정의되어 있을 경우, 라라벨은 `retryUntil` 메서드를 우선 적용합니다.

> [!NOTE]
> [큐잉된 이벤트 리스너](/docs/12.x/events#queued-event-listeners)에도 `tries` 속성이나 `retryUntil` 메서드를 지정할 수 있습니다.

<a name="max-exceptions"></a>
#### 최대 예외 발생 횟수

작업을 여러 번 재시도하더라도, 특정 횟수 이상 처리 중 예외가 발생하면 그 작업을 실패로 처리하고 싶을 때가 있습니다. (예를 들어, `release` 메서드로 수동 릴리즈되는 경우가 아닌 경우입니다.) 이를 위해 작업 클래스에 `maxExceptions` 속성을 정의할 수 있습니다.

```php
<?php

namespace App\Jobs;

use Illuminate\Support\Facades\Redis;

class ProcessPodcast implements ShouldQueue
{
    /**
     * 작업이 시도될 수 있는 최대 횟수
     *
     * @var int
     */
    public $tries = 25;

    /**
     * 실패 처리 전 허용되는 최대 예외(처리되지 않은) 횟수
     *
     * @var int
     */
    public $maxExceptions = 3;

    /**
     * 작업 실행 부분
     */
    public function handle(): void
    {
        Redis::throttle('key')->allow(10)->every(60)->then(function () {
            // Lock 획득 성공: 팟캐스트 처리 ...
        }, function () {
            // Lock 획득 실패 ...
            return $this->release(10);
        });
    }
}
```

위 예시에서는 Redis 락을 획득하지 못할 경우 10초 간 릴리즈 후 최대 25번까지 재시도하게 됩니다. 단, 작업 처리 중에 처리되지 않은 예외가 3번 발생하면 작업은 실패로 처리됩니다.

<a name="timeout"></a>
#### 타임아웃

작업이 대략 얼마 정도 실행될지 예측이 가능하다면, 라라벨은 "타임아웃(timeout)" 값을 지정할 수 있는 기능을 제공합니다. 기본값은 60초입니다. 만약 타임아웃 값보다 더 오래 작업이 처리된다면, 해당 작업을 담당하는 워커는 에러와 함께 종료됩니다. 일반적으로 워커는 [서버에 설정된 프로세스 매니저](#supervisor-configuration)에 의해 자동으로 재시작됩니다.

작업의 최대 실행 시간을 Artisan 명령어에서 `--timeout` 옵션으로 지정할 수 있습니다.

```shell
php artisan queue:work --timeout=30
```

만약 작업이 타임아웃에 걸려 반복적으로 실패할 경우, 해당 작업은 실패로 분류됩니다.

작업 클래스에서 직접 최대 실행 시간(초)을 명시해 줄 수도 있습니다. 작업에 별도 타임아웃 값이 있다면, 커맨드 라인에서 지정한 타임아웃보다 이 값이 우선 적용됩니다.

```php
<?php

namespace App\Jobs;

class ProcessPodcast implements ShouldQueue
{
    /**
     * 작업이 타임아웃되기 전 최대 실행 가능 시간(초)
     *
     * @var int
     */
    public $timeout = 120;
}
```

소켓 또는 외부 HTTP 연결 등, IO 블로킹이 있는 프로세스는 라라벨이 지정한 타임아웃을 제대로 따르지 않을 수 있습니다. 따라서 이런 작업에서는 해당 기능의 API에서 타임아웃 옵션을 직접 지정하는 것이 중요합니다. 예를 들어 Guzzle을 사용할 때는 연결/요청 타임아웃 값을 명시해야 합니다.

> [!WARNING]
> 작업 타임아웃을 지정하려면 `pcntl` PHP 확장 모듈이 반드시 설치되어 있어야 합니다. 또한 각 작업의 "타임아웃" 값은 반드시 ["retry after"](#job-expiration) 값보다 짧게 설정해야 합니다. 그렇지 않으면, 작업이 완전히 종료되기 전에 다시 실행될 수 있습니다.

<a name="failing-on-timeout"></a>
#### 타임아웃 시 실패 처리

작업이 타임아웃될 때 [실패](#dealing-with-failed-jobs)로 처리되도록 하려면, 작업 클래스에서 `$failOnTimeout` 속성을 지정할 수 있습니다.

```php
/**
 * 타임아웃 발생 시 작업을 실패로 표시할지 여부
 *
 * @var bool
 */
public $failOnTimeout = true;
```

<a name="error-handling"></a>
### 에러 처리

작업 처리 중 예외가 발생하면, 라라벨은 해당 작업을 자동으로 큐에 다시 올려 재시도를 시도합니다. 이 작업은 지정된 최대 시도 횟수에 도달할 때까지 반복됩니다. 최대 시도 횟수는 `queue:work` Artisan 명령어에서 `--tries`로 지정하거나, 작업 클래스에서 별도로 지정할 수 있습니다. 큐 워커 실행에 관한 자세한 내용은 [아래에서 확인](#running-the-queue-worker)할 수 있습니다.

<a name="manually-releasing-a-job"></a>
#### 작업을 수동으로 릴리즈하기

특정 경우 작업을 즉시 실패 처리하지 않고, 나중에 다시 시도할 수 있도록 큐로 직접 반환할 수도 있습니다. 이 경우 `release` 메서드를 호출하면 됩니다.

```php
/**
 * 작업 실행 부분
 */
public function handle(): void
{
    // ...

    $this->release();
}
```

`release` 메서드는 기본적으로 해당 작업을 즉시 다시 큐에 등록하여 바로 처리하게 만듭니다. 만약 작업이 지정한 시간(초) 후에만 다시 처리되도록 하고 싶다면, `release` 메서드에 정수 값이나 날짜 인스턴스를 전달하면 됩니다.

```php
$this->release(10);

$this->release(now()->addSeconds(10));
```

<a name="manually-failing-a-job"></a>
#### 작업을 수동으로 실패 처리하기

가끔은 작업을 "실패" 상태로 수동 처리해야 할 때가 있습니다. 이 경우 `fail` 메서드를 호출하면 됩니다.

```php
/**
 * 작업 실행 부분
 */
public function handle(): void
{
    // ...

    $this->fail();
}
```

작업 처리 중 잡은 예외로 인해 실패 처리를 하고 싶다면, 해당 예외를 `fail` 메서드에 전달할 수 있습니다. 또는 에러 메시지를 문자열로 넘기면 자동으로 예외로 변환하여 처리할 수도 있습니다.

```php
$this->fail($exception);

$this->fail('Something went wrong.');
```

> [!NOTE]
> 실패한 작업 처리에 대한 자세한 내용은 [실패한 작업 관련 문서](#dealing-with-failed-jobs)를 참고하세요.

<a name="job-batching"></a>
## 작업 배치(Job Batching)

라라벨의 작업 배치 기능은 여러 개의 작업을 일괄 실행한 뒤, 모든 작업이 완료되었을 때 후속 처리를 간편하게 할 수 있도록 도와줍니다. 이 기능을 사용하기 전에, 각 작업 배치의 진행률 등 메타 정보를 저장할 데이터베이스 테이블을 만들어야 합니다. 아래의 Artisan 명령어로 필요한 마이그레이션을 생성할 수 있습니다.

```shell
php artisan make:queue-batches-table

php artisan migrate
```

<a name="defining-batchable-jobs"></a>
### 배치 처리 가능한 작업 정의하기

배치 처리 가능한 작업을 정의하려면, [일반적인 큐 작업](#creating-jobs)처럼 작업 클래스를 생성한 뒤, 해당 클래스에 `Illuminate\Bus\Batchable` 트레이트를 추가하면 됩니다. 이 트레이트는 현재 실행 중인 배치를 가져올 수 있는 `batch` 메서드를 제공합니다.

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
     * 작업 실행
     */
    public function handle(): void
    {
        if ($this->batch()->cancelled()) {
            // 배치가 취소되었는지 확인 ...

            return;
        }

        // CSV 파일의 일부를 임포트 ...
    }
}
```

<a name="dispatching-batches"></a>
### 작업 배치 디스패치하기

여러 작업을 한 번에 배치로 디스패치하려면 `Bus` 파사드의 `batch` 메서드를 사용합니다. 주로 배치는 완료 콜백과 결합하여 사용할 때 진가를 발휘합니다. 예를 들어, `then`, `catch`, `finally` 메서드를 사용해 배치 완료 시 실행할 콜백을 지정할 수 있습니다. 각각의 콜백에는 `Illuminate\Bus\Batch` 인스턴스가 전달됩니다. 아래 예시는 각 작업이 CSV의 일부 행을 처리하는 작업 배치를 큐잉하는 상황을 가정했습니다.

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
    // 배치가 생성되었지만 아직 작업이 추가되지 않은 상태 ...
})->progress(function (Batch $batch) {
    // 개별 작업이 성공적으로 완료됨 ...
})->then(function (Batch $batch) {
    // 모든 작업이 정상적으로 완료됨 ...
})->catch(function (Batch $batch, Throwable $e) {
    // 첫 번째 작업 실패 발생 ...
})->finally(function (Batch $batch) {
    // 배치 실행이 모두 끝난 상태 ...
})->dispatch();

return $batch->id;
```

배치의 ID는 `$batch->id` 속성으로 접근할 수 있습니다. 이 값은 [라라블 커맨드 버스](#inspecting-batches)에서 해당 배치 정보를 조회할 때 사용할 수 있습니다.

> [!WARNING]
> 배치 콜백은 직렬화되어 나중에 라라벨 큐에서 실행되므로, 콜백 내부에서는 `$this` 변수(즉 인스턴스의 상태)를 사용하면 안 됩니다. 또한, 배치 작업은 데이터베이스 트랜잭션 안에서 래핑되므로, 묵시적 커밋을 유발하는 데이터베이스 명령은 작업 내부에서 실행하지 않아야 합니다.

<a name="naming-batches"></a>
#### 배치 이름 지정하기

Laravel Horizon, Laravel Telescope와 같은 일부 도구는 배치에 이름이 지정되어 있을 때 더 보기 좋은 디버깅 정보를 표시해 줍니다. 배치의 이름을 지정하려면 배치 정의 시 `name` 메서드를 사용하면 됩니다.

```php
$batch = Bus::batch([
    // ...
])->then(function (Batch $batch) {
    // 모든 작업 성공 완료 ...
})->name('Import CSV')->dispatch();
```

<a name="batch-connection-queue"></a>
#### 배치의 연결(Connection) 및 큐(queue) 지정하기

배치로 등록된 작업들이 사용할 큐 커넥션과 큐 이름을 지정하려면 `onConnection`, `onQueue` 메서드를 사용하면 됩니다. 한 배치 내의 모든 작업은 동일한 커넥션과 큐에서 실행되어야 합니다.

```php
$batch = Bus::batch([
    // ...
])->then(function (Batch $batch) {
    // 모든 작업 성공 완료 ...
})->onConnection('redis')->onQueue('imports')->dispatch();
```

<a name="chains-and-batches"></a>
### 체인(Chaining)과 배치(Batching) 조합

배치 내에 [체인 작업](#job-chaining)을 정의할 때는 체인 작업들을 배열로 묶어 배치에 포함시키면 됩니다. 예를 들어, 두 개의 작업 체인을 동시에(병렬적으로) 실행하고, 두 체인이 모두 끝난 뒤 콜백을 호출하는 구조를 만들 수 있습니다.

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

반대로, [체인 작업](#job-chaining) 안에 여러 개의 배치를 넣을 수도 있습니다. 예를 들어 여러 에피소드의 발행 작업을 먼저 하나의 배치로 실행한 뒤, 해당 에피소드의 알림 전송 작업을 또 다른 배치로 처리할 수 있습니다.

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

경우에 따라, 이미 배치에 등록된 작업 내에서 새로운 작업을 해당 배치에 동적으로 추가해야 할 수 있습니다. 예를 들어 배치로 매우 많은(수천 개) 작업을 처리할 때, 웹 요청에서 한 번에 모두 디스패치하면 너무 오래 걸릴 수 있습니다. 이런 경우 "로더" 역할의 작업을 먼저 배치로 등록하고, 이 로더 작업이 배치 내에서 새로운 작업들을 계속 추가하도록 할 수 있습니다.

```php
$batch = Bus::batch([
    new LoadImportBatch,
    new LoadImportBatch,
    new LoadImportBatch,
])->then(function (Batch $batch) {
    // 모든 작업 성공 완료 ...
})->name('Import Contacts')->dispatch();
```

위 예시에서 `LoadImportBatch` 작업은 배치에 작업을 추가(hydrate)하는 역할입니다. 실제로는 작업 내부에서 아래처럼 `batch` 메서드로 배치 인스턴스를 얻어, 그 위에서 `add` 메서드를 호출하여 추가 작업을 등록합니다.

```php
use App\Jobs\ImportContacts;
use Illuminate\Support\Collection;

/**
 * 작업 실행
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
> 배치 내에 속한 작업에서만 해당 배치에 작업을 추가할 수 있습니다.

<a name="inspecting-batches"></a>
### 배치 정보 조회하기

배치 완료 콜백에 전달되는 `Illuminate\Bus\Batch` 인스턴스는 배치와 관련된 각종 속성과 메서드를 제공하여, 원하는 방법으로 배치 상태를 조회/조작할 수 있습니다.

```php
// 배치의 UUID
$batch->id;

// 배치의 이름(있을 경우)
$batch->name;

// 배치에 할당된 작업 수
$batch->totalJobs;

// 아직 큐에서 처리되지 않은 작업 수
$batch->pendingJobs;

// 실패한 작업 수
$batch->failedJobs;

// 지금까지 처리된 작업 수
$batch->processedJobs();

// 배치의 진행률 (0~100)
$batch->progress();

// 배치가 완료되었는지 여부
$batch->finished();

// 배치 실행 취소
$batch->cancel();

// 배치가 취소되었는지 여부
$batch->cancelled();
```

<a name="returning-batches-from-routes"></a>
#### 라우트에서 배치 정보 반환하기

모든 `Illuminate\Bus\Batch` 인스턴스는 JSON 직렬화가 가능하므로, 애플리케이션의 라우트에서 직접 반환하여 배치 진행률 등 정보를 손쉽게 API 응답으로 제공할 수 있습니다. 이를 통해 프론트엔드에서 실시간으로 배치 진행 상황을 확인할 수도 있습니다.

배치 ID로 정보를 조회하려면, `Bus` 파사드의 `findBatch` 메서드를 사용할 수 있습니다.

```php
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Route;

Route::get('/batch/{batchId}', function (string $batchId) {
    return Bus::findBatch($batchId);
});
```

<a name="cancelling-batches"></a>
### 배치 실행 취소하기

특정 배치의 실행을 중단(취소)하고 싶을 때, `Illuminate\Bus\Batch` 인스턴스의 `cancel` 메서드를 호출하면 됩니다.

```php
/**
 * 작업 실행
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

앞선 예시들에서 볼 수 있듯, 배치에 속한 작업을 처리할 때는 보통 배치가 취소되었는지 먼저 확인한 뒤 이후 실행을 결정하는 것이 좋습니다. 하지만, 좀 더 편리하게 하려면 [미들웨어](#job-middleware)인 `SkipIfBatchCancelled`를 해당 작업에 할당할 수도 있습니다. 이 미들웨어는 현재 작업이 소속된 배치가 이미 취소된 경우, 작업을 실행하지 않고 건너뛰도록 만들어 줍니다.

```php
use Illuminate\Queue\Middleware\SkipIfBatchCancelled;

/**
 * 작업이 통과해야 할 미들웨어 지정
 */
public function middleware(): array
{
    return [new SkipIfBatchCancelled];
}
```

<a name="batch-failures"></a>
### 배치 실패 처리

배치에 포함된 작업이 실패하면, 만약 `catch` 콜백이 할당되어 있다면 자동으로 호출됩니다. 이 콜백은 배치 내 첫 번째 실패 작업에 대해서만 호출됩니다.

<a name="allowing-failures"></a>
#### 실패 허용 설정

배치 내 작업이 실패할 경우, 라라벨은 기본적으로 해당 배치를 "취소" 상태로 표시합니다. 만약 작업 실패가 배치 전체의 취소로 이어지지 않게 하고 싶다면, 배치 디스패치 시 `allowFailures` 메서드를 사용해 이 동작을 비활성화할 수 있습니다.

```php
$batch = Bus::batch([
    // ...
])->then(function (Batch $batch) {
    // 모든 작업 성공 완료 ...
})->allowFailures()->dispatch();
```

<a name="retrying-failed-batch-jobs"></a>
#### 배치 내 실패 작업 재시도

라라벨은 특정 배치에 대해 실패한 모든 작업을 한 번에 재시도할 수 있도록, `queue:retry-batch` Artisan 명령어를 제공합니다. 이 명령어는 재시도할 배치의 UUID를 인자로 받습니다.

```shell
php artisan queue:retry-batch 32dbc76c-4f82-4749-b610-a639fe0099b5
```

<a name="pruning-batches"></a>
### 배치 레코드 정리(Pruning)

별도의 정리 작업이 없으면, `job_batches` 테이블에 레코드가 빠르게 쌓일 수 있습니다. 이를 방지하려면, [스케줄러](/docs/12.x/scheduling)에 `queue:prune-batches` Artisan 명령어를 등록해 매일 실행되도록 하세요.

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('queue:prune-batches')->daily();
```

기본적으로 24시간이 지난 완료된 모든 배치가 정리 대상입니다. 필요하다면 명령어 호출 시 `hours` 옵션을 사용해 보관 기간을 조정할 수 있습니다. 아래 예시는 48시간이 지난 모든 완료된 배치를 삭제합니다.

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('queue:prune-batches --hours=48')->daily();
```

`jobs_batches` 테이블에는 가끔 영영 완료되지 못한 배치(예: 일부 작업이 실패한 뒤, 재시도되지 않아 끝나지 않은 경우)의 레코드도 있을 수 있습니다. 이 경우 `queue:prune-batches` 명령어의 `unfinished` 옵션을 사용해 일정 시간이 지난 미완료 배치 레코드도 정리하도록 할 수 있습니다.

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('queue:prune-batches --hours=48 --unfinished=72')->daily();
```

마찬가지로, 취소된 배치의 레코드가 남아 있을 수 있는데, 이 경우 `cancelled` 옵션을 사용하면 일정 시간이 지난 취소된 배치도 정리할 수 있습니다.

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('queue:prune-batches --hours=48 --cancelled=72')->daily();
```

<a name="storing-batches-in-dynamodb"></a>

### DynamoDB에 배치 저장하기

라라벨은 배치 메타 정보를 [DynamoDB](https://aws.amazon.com/dynamodb)에 저장하는 것도 지원합니다. 다만, 모든 배치 레코드를 저장할 DynamoDB 테이블은 직접 생성해야 합니다.

일반적으로 이 테이블은 `job_batches`라는 이름을 사용하는 것이 좋지만, 애플리케이션의 `queue` 설정 파일 내 `queue.batching.table` 설정 값에 따라 실제 테이블 이름을 결정해야 합니다.

<a name="dynamodb-batch-table-configuration"></a>
#### DynamoDB 배치 테이블 설정

`job_batches` 테이블은 문자열 타입의 파티션 키(`application`)와 문자열 타입의 정렬 키(`id`)를 기본키로 가져야 합니다. `application` 키에는 애플리케이션의 `app` 설정 파일 내 `name` 설정 값이 할당됩니다. 애플리케이션 이름이 DynamoDB 테이블의 키 일부로 활용되기 때문에, 하나의 테이블에서 여러 라라벨 애플리케이션의 배치도 함께 저장할 수 있습니다.

또한, [자동 배치 정리 기능](#pruning-batches-in-dynamodb)을 사용하려면 테이블에 `ttl` 속성을 추가로 정의할 수 있습니다.

<a name="dynamodb-configuration"></a>
#### DynamoDB 설정

다음으로, 라라벨 애플리케이션이 Amazon DynamoDB와 통신할 수 있도록 AWS SDK를 설치해야 합니다.

```shell
composer require aws/aws-sdk-php
```

그리고 `queue.batching.driver` 설정 값을 `dynamodb`로 지정합니다. 추가로, `batching` 설정 배열 내에 `key`, `secret`, `region` 값을 정의해야 하며, 이 값들은 AWS 인증에 사용됩니다. `dynamodb` 드라이버를 사용할 때는 `queue.batching.database` 설정이 필요하지 않습니다.

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
#### DynamoDB에서 배치 정리(pruning)하기

[Amazon DynamoDB](https://aws.amazon.com/dynamodb)에 잡 배치 정보를 저장하는 경우, 관계형 데이터베이스에 저장된 배치를 정리할 때 사용하는 일반적인 명령어로는 정리가 되지 않습니다. 대신 [DynamoDB 자체의 TTL 기능](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html)을 이용해 오래된 배치 레코드를 자동으로 삭제할 수 있습니다.

DynamoDB 테이블에 `ttl` 속성을 정의했다면, 라라벨에 배치 레코드 정리 방식을 알려주는 설정값들을 지정해야 합니다. `queue.batching.ttl_attribute` 설정은 TTL 값을 저장할 속성명을 정의하며, `queue.batching.ttl` 설정은 마지막으로 레코드가 업데이트된 시점 이후, 몇 초가 지나면 레코드를 삭제해도 되는지(초 단위)를 지정합니다.

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

잡 클래스를 큐에 디스패치하는 대신, 클로저(함수)를 그대로 큐에 디스패치할 수도 있습니다. 복잡하지 않은 간단한 작업을 현재 요청 사이클 바깥에서 비동기로 실행하고 싶을 때에 매우 유용합니다. 클로저를 큐에 디스패치할 때는 함수의 코드가 암호화되어 서명되어 전송 중에 변조되지 않도록 보호됩니다.

```php
$podcast = App\Podcast::find(1);

dispatch(function () use ($podcast) {
    $podcast->publish();
});
```

큐에 대기 중인 클로저에 이름을 부여하고 싶다면, `name` 메서드를 사용할 수 있습니다. 이렇게 하면 큐 대시보드에서 이름이 보여지고, `queue:work` 명령어에서도 표시됩니다.

```php
dispatch(function () {
    // ...
})->name('Publish Podcast');
```

또한 `catch` 메서드를 사용하면, 큐에 등록된 클로저가 [설정된 재시도 횟수](#max-job-attempts-and-timeout)를 모두 소진하고도 성공하지 못했을 때 실행할 클로저를 지정할 수 있습니다.

```php
use Throwable;

dispatch(function () use ($podcast) {
    $podcast->publish();
})->catch(function (Throwable $e) {
    // 이 잡은 실패했습니다...
});
```

> [!WARNING]
> `catch` 콜백은 라라벨 큐에 의해 나중에 직렬화되어 실행되므로, `catch` 콜백 내에서는 `$this` 변수를 사용하지 않아야 합니다.

<a name="running-the-queue-worker"></a>
## 큐 워커 실행하기

<a name="the-queue-work-command"></a>
### `queue:work` 명령어

라라벨은 큐 워커를 시작하여 새로운 잡이 큐에 추가될 때마다 처리해주는 Artisan 명령어를 제공합니다. `queue:work` Artisan 명령어를 실행하면 워커가 시작됩니다. 이 명령어는 한 번 시작하면 수동으로 중지하거나 터미널을 닫기 전까지 계속 실행됩니다.

```shell
php artisan queue:work
```

> [!NOTE]
> `queue:work` 프로세스를 백그라운드에서 중단 없이 계속 실행시키려면, [Supervisor](#supervisor-configuration)와 같은 프로세스 모니터를 사용하여 워커가 멈추지 않게 관리해주는 것이 좋습니다.

`queue:work` 명령어 실행 시 `-v` 플래그를 추가하면, 처리된 잡의 ID가 출력 결과에 포함됩니다.

```shell
php artisan queue:work -v
```

큐 워커는 장시간 실행되는 프로세스이므로, 부팅된 애플리케이션 상태를 메모리에 저장합니다. 따라서 워커를 시작한 이후 코드 베이스의 변경을 자동으로 감지하지 못합니다. 따라서 배포 과정에서는 반드시 [큐 워커를 재시작](#queue-workers-and-deployment)해야 합니다. 또한, 애플리케이션에서 생성되거나 수정된 정적(static) 상태도 잡별로 자동으로 초기화되지 않습니다.

`queue:work` 명령어 대신 `queue:listen` 명령어를 사용할 수도 있습니다. `queue:listen` 명령어를 사용하면, 코드를 수정하거나 애플리케이션 상태를 초기화해야 할 때 워커를 수동으로 재시작할 필요가 없습니다. 다만 이 명령어는 `queue:work` 명령어보다 성능이 떨어집니다.

```shell
php artisan queue:listen
```

<a name="running-multiple-queue-workers"></a>
#### 여러 개의 큐 워커 실행

하나의 큐에 여러 워커를 할당해 동시에 잡을 처리하려면, `queue:work` 프로세스를 여러 개 실행하면 됩니다. 로컬에서는 터미널의 여러 탭을 통해, 또는 프로덕션에서는 프로세스 매니저의 설정을 변경해서 여러 프로세스를 띄울 수 있습니다. [Supervisor 사용 시](#supervisor-configuration)에는 `numprocs` 설정 값으로 관리할 수 있습니다.

<a name="specifying-the-connection-queue"></a>
#### 커넥션 및 큐 지정하기

워커가 사용할 큐 커넥션을 직접 지정할 수도 있습니다. `work` 명령어에 전달하는 커넥션 이름은 `config/queue.php` 파일에 정의된 것 중 하나여야 합니다.

```shell
php artisan queue:work redis
```

기본적으로 `queue:work` 명령은 지정한 커넥션의 기본 큐만 처리합니다. 하지만 특정 큐만 골라서 처리하도록 원한다면, 예를 들어 모든 이메일을 `redis` 커넥션의 `emails` 큐에서 처리하고 있을 때 다음과 같이 실행할 수 있습니다.

```shell
php artisan queue:work redis --queue=emails
```

<a name="processing-a-specified-number-of-jobs"></a>
#### 지정한 개수만큼 잡 처리하기

`--once` 옵션을 사용하면 워커가 큐에서 단 하나의 잡만 처리하도록 할 수 있습니다.

```shell
php artisan queue:work --once
```

`--max-jobs` 옵션은 워커가 지정한 개수만큼 잡을 처리한 후 종료하도록 만듭니다. 이 기능은 [Supervisor](#supervisor-configuration)와 함께 사용 시, 워커가 일정 작업량 뒤 자동으로 재시작되어 메모리 누수가 방지될 수 있습니다.

```shell
php artisan queue:work --max-jobs=1000
```

<a name="processing-all-queued-jobs-then-exiting"></a>
#### 큐에 있는 모든 잡 처리 후 종료

`--stop-when-empty` 옵션을 사용하면 큐에 남은 모든 잡을 처리한 후 깔끔하게 종료합니다. 이 옵션은 Laravel 큐를 Docker 컨테이너에서 처리할 때, 큐가 비면 컨테이너를 종료하도록 할 때 유용합니다.

```shell
php artisan queue:work --stop-when-empty
```

<a name="processing-jobs-for-a-given-number-of-seconds"></a>
#### 지정한 시간 동안 잡 처리하기

`--max-time` 옵션을 사용하면 워커가 지정한 초만큼 실행된 후 종료됩니다. 이 기능은 [Supervisor](#supervisor-configuration)와 함께 사용하여, 워커가 오랜 시간 실행된 후 자동으로 재시작되어 메모리 문제를 방지할 수 있습니다.

```shell
# 1시간 동안 잡을 처리한 뒤 종료...
php artisan queue:work --max-time=3600
```

<a name="worker-sleep-duration"></a>
#### 워커 대기 시간(sleep) 설정

큐에 잡이 남아 있을 때 워커는 지연 없이 계속 잡을 처리합니다. 하지만 `sleep` 옵션은 큐에 잡이 없을 때 워커가 얼마간 대기할지(초 단위)를 정합니다. 대기 중에는 새로운 잡을 처리하지 않습니다.

```shell
php artisan queue:work --sleep=3
```

<a name="maintenance-mode-queues"></a>
#### 유지보수 모드와 큐

애플리케이션이 [유지보수 모드](/docs/12.x/configuration#maintenance-mode)일 때 큐 작업은 중지됩니다. 유지보수 모드에서 벗어나면 다시 정상적으로 작업이 처리됩니다.

유지보수 모드 상태에서도 큐 워커가 잡을 처리하도록 하려면, `--force` 옵션을 사용할 수 있습니다.

```shell
php artisan queue:work --force
```

<a name="resource-considerations"></a>
#### 리소스 관리 관련 주의사항

데몬 큐 워커는 각 잡을 처리할 때마다 프레임워크를 재실행(재부팅)하지 않습니다. 따라서 리소스(특히 메모리 사용량이 큰 리소스)는 각 잡이 끝날 때 반드시 반납해야 합니다. 예를 들어 GD 라이브러리로 이미지 처리를 한다면, 처리 후에는 반드시 `imagedestroy`로 메모리를 해제해야 합니다.

<a name="queue-priorities"></a>
### 큐 우선순위 설정

큐를 처리하는 우선순위를 지정하고 싶을 때가 있습니다. 예를 들어, `config/queue.php`에서 `redis` 커넥션의 기본 `queue`를 `low`로 지정해두었더라도, 때로는 `high` 우선순위 큐에 잡을 추가할 수 있습니다.

```php
dispatch((new Job)->onQueue('high'));
```

`work` 명령어에 여러 큐 이름을 콤마로 구분해 전달하면, `high` 큐의 잡이 모두 처리된 다음에만 `low` 큐의 잡을 처리하게 만들 수 있습니다.

```shell
php artisan queue:work --queue=high,low
```

<a name="queue-workers-and-deployment"></a>
### 큐 워커와 배포

큐 워커는 장시간 실행되는 프로세스이기 때문에, 코드 변경을 자동으로 감지하지 않습니다. 따라서 큐를 사용하는 애플리케이션을 배포할 때는 워커를 재시작하는 것이 가장 간단한 방법입니다. `queue:restart` 명령어를 사용하면 모든 워커가 현재 진행 중인 작업이 끝난 후 깔끔하게 종료됩니다.

```shell
php artisan queue:restart
```

이 명령어를 실행하면 큐 워커들은 현재 작업을 마치는 대로 종료됩니다. 기존 잡이 유실되는 일 없이 안전하게 재시작할 수 있습니다. 이때 큐 워커가 종료되므로, [Supervisor](#supervisor-configuration) 등 프로세스 매니저를 반드시 사용해 자동으로 워커를 재시작하도록 해야 합니다.

> [!NOTE]
> 큐는 [캐시](/docs/12.x/cache)를 사용해 재시작 신호를 저장하므로, 이 기능을 사용하기 전 캐시 드라이버가 제대로 설정되어 있는지 반드시 확인해야 합니다.

<a name="job-expirations-and-timeouts"></a>
### 잡 만료 및 타임아웃

<a name="job-expiration"></a>
#### 잡 만료

`config/queue.php` 설정 파일에서 각 큐 커넥션은 `retry_after` 옵션을 가집니다. 이 값은 잡이 처리 중일 때, 몇 초 후에 재시도를 시도할지 결정합니다. 예를 들어 `retry_after` 값이 90이라면, 잡 실행이 90초 이상 소요되고 릴리즈(반환) 또는 삭제되지 않으면 다시 큐에 올라가게 됩니다. 보통 이 값은 여러분의 잡이 실제로 처리되는 데 걸릴 수 있는 최대 시간을 기준으로 설정해야 합니다.

> [!WARNING]
> `retry_after` 값을 가지지 않는 유일한 큐 커넥션은 Amazon SQS입니다. SQS는 AWS 콘솔 내 [기본 Visibility Timeout](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/AboutVT.html) 설정을 기준으로 잡을 재시도합니다.

<a name="worker-timeouts"></a>
#### 워커 타임아웃

`queue:work` Artisan 명령어는 `--timeout` 옵션을 지원합니다. 기본값은 60초입니다. 잡이 이 값보다 더 오래 실행될 경우 워커는 에러와 함께 종료됩니다. 보통 워커가 종료되면 [서버에 설정된 프로세스 매니저](#supervisor-configuration)가 자동으로 재시작해줍니다.

```shell
php artisan queue:work --timeout=60
```

`retry_after` 설정과 `--timeout` 옵션은 서로 다르지만, 두 옵션이 함께 작동해 잡의 유실을 방지하고, 하나의 잡이 두 번 처리되지 않도록 보장해줍니다.

> [!WARNING]
> `--timeout` 값은 반드시 `retry_after` 값보다 몇 초 이상 짧아야 합니다. 그래야 고장난(frozen) 잡을 워커가 재시도 전에 먼저 종료시킬 수 있습니다. 만약 `--timeout`이 `retry_after`보다 길다면, 잡이 두 번 처리될 위험이 있습니다.

<a name="supervisor-configuration"></a>
## Supervisor 구성

실서비스 환경에서는 `queue:work` 프로세스가 항상 실행 중이어야 하므로, 프로세스가 중단될 경우 감지해서 자동으로 재시작할 수 있는 방법이 필요합니다. `queue:work` 프로세스는 워커의 타임아웃 초과나 `queue:restart` 명령 실행 등 여러 이유로 종료될 수 있습니다.

따라서 프로세스 모니터를 직접 구성해, `queue:work` 프로세스가 종료되는 즉시 자동으로 재시작되도록 해야 합니다. 또한 프로세스 모니터를 사용하면 동시에 몇 개의 `queue:work` 프로세스를 운용할지도 명확하게 지정할 수 있습니다. Supervisor는 리눅스 환경에서 많이 쓰이는 프로세스 모니터이며, 아래에서 Supervisor 구성법을 살펴보겠습니다.

<a name="installing-supervisor"></a>
#### Supervisor 설치

Supervisor는 리눅스 운영체제용 프로세스 모니터로, `queue:work` 프로세스가 중단되면 자동으로 재기동됩니다. Ubuntu에서는 다음 명령어로 Supervisor를 설치할 수 있습니다.

```shell
sudo apt-get install supervisor
```

> [!NOTE]
> Supervisor 직접 구성과 관리가 부담스럽다면, 라라벨 큐 워커의 구동을 완전 자동화해주는 [Laravel Cloud](https://cloud.laravel.com) 같은 솔루션도 고려할 수 있습니다.

<a name="configuring-supervisor"></a>
#### Supervisor 설정

Supervisor 설정 파일은 일반적으로 `/etc/supervisor/conf.d` 디렉터리에 저장합니다. 이 폴더 안에 원하는 만큼의 설정 파일을 만들어, Supervisor가 어떤 프로세스를 어떻게 관리할지 지정할 수 있습니다. 예를 들어, 여러 `queue:work` 프로세스를 실행 및 모니터링하는 `laravel-worker.conf` 파일을 작성할 수 있습니다.

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

이 예시에서 `numprocs` 옵션은 Supervisor가 8개의 `queue:work` 프로세스를 실행하도록 지시합니다. 각각의 프로세스가 장애가 발생해도 Supervisor가 감시하며 자동으로 다시 시작합니다. 실제로 사용하려는 큐 커넥션과 워커 옵션에 맞게 `command` 항목을 변경해야 합니다.

> [!WARNING]
> `stopwaitsecs` 값이 가장 오래 실행되는 잡의 처리 시간보다 항상 길어야 합니다. 그렇지 않으면 Supervisor가 잡이 끝나기 전에 강제로 프로세스를 종료하는 일이 생길 수 있습니다.

<a name="starting-supervisor"></a>
#### Supervisor 실행

설정 파일 작성이 끝나면, 다음 명령어로 Supervisor 설정을 반영하고 프로세스를 시작할 수 있습니다.

```shell
sudo supervisorctl reread

sudo supervisorctl update

sudo supervisorctl start "laravel-worker:*"
```

Supervisor에 대해 더 자세히 알고 싶다면 [Supervisor 공식 문서](http://supervisord.org/index.html)를 참고하세요.

<a name="dealing-with-failed-jobs"></a>
## 실패한 잡 처리하기

때로는 큐에 등록된 잡이 실패할 수 있습니다. 걱정하지 마세요! 항상 모든 것이 계획대로 되는 것은 아니니까요. 라라벨은 [잡 처리 최대 시도 횟수](#max-job-attempts-and-timeout)를 손쉽게 지정할 수 있는 방법을 제공합니다. 비동기로 실행된 잡이 이 최대 횟수를 초과하면 `failed_jobs` 데이터베이스 테이블에의 레코드로 남게 됩니다. [동기적으로 디스패치된 잡](/docs/12.x/queues#synchronous-dispatching)이 실패하면 이 테이블에 저장되지 않고 즉시 애플리케이션에서 예외로 처리됩니다.

신규 라라벨 애플리케이션에는 보통 `failed_jobs` 테이블 생성을 위한 마이그레이션이 이미 포함되어 있습니다. 만약 해당 마이그레이션이 없다면, 아래 Artisan 명령어로 마이그레이션을 생성할 수 있습니다.

```shell
php artisan make:queue-failed-table

php artisan migrate
```

[큐 워커](#running-the-queue-worker) 프로세스를 실행할 때는 `queue:work` 명령어의 `--tries` 옵션으로 잡 시도 횟수를 지정할 수 있습니다. 별도의 값을 지정하지 않으면 잡당 기본 1회 또는 잡 클래스의 `$tries` 속성 값만큼 시도합니다.

```shell
php artisan queue:work redis --tries=3
```

`--backoff` 옵션은 잡이 예외로 인해 실패한 후, 몇 초 후에 다시 시도할지를 지정합니다. 기본적으로는 잡이 곧바로 다시 큐에 등록되어 재시도됩니다.

```shell
php artisan queue:work redis --tries=3 --backoff=3
```

더 세밀하게 잡별로 재시도 전에 대기할 초(sec)를 지정하고 싶다면, 잡 클래스에 `backoff` 속성을 추가할 수 있습니다.

```php
/**
 * 잡 재시도 전 대기할 초(second).
 *
 * @var int
 */
public $backoff = 3;
```

좀 더 복잡한 대기 로직이 필요하다면, 잡 클래스에 `backoff` 메서드를 추가할 수 있습니다.

```php
/**
 * 잡 재시도 전 대기할 초를 계산합니다.
 */
public function backoff(): int
{
    return 3;
}
```

`backoff` 메서드에서 배열을 반환해 "지수형"(backoff) 대기 시간도 설정할 수 있습니다. 예를 들어 아래 예시에서는 첫 번째 재시도는 1초, 두 번째는 5초, 세 번째와 이후에는 10초씩 대기합니다.

```php
/**
 * 잡 재시도 전 대기할 초를 계산합니다.
 *
 * @return array<int, int>
 */
public function backoff(): array
{
    return [1, 5, 10];
}
```

<a name="cleaning-up-after-failed-jobs"></a>
### 실패한 잡 후처리

특정 잡이 실패했을 때, 사용자에게 알림을 보내거나 일부 완료된 작업을 되돌려야 할 수 있습니다. 이때는 잡 클래스에 `failed` 메서드를 정의하면 됩니다. 잡이 실패한 원인인 `Throwable` 인스턴스가 인자로 전달됩니다.

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
     * 새로운 잡 인스턴스 생성자
     */
    public function __construct(
        public Podcast $podcast,
    ) {}

    /**
     * 실제 잡 처리 메서드
     */
    public function handle(AudioProcessor $processor): void
    {
        // 업로드된 팟캐스트 처리...
    }

    /**
     * 잡 실패 후처리 메서드
     */
    public function failed(?Throwable $exception): void
    {
        // 실패시 사용자 알림 전송 등...
    }
}
```

> [!WARNING]
> `failed` 메서드가 호출되기 전에 잡 인스턴스가 새로 생성되므로, `handle` 메서드에서 변경된 클래스 속성 값은 활용할 수 없습니다.

<a name="retrying-failed-jobs"></a>
### 실패한 잡 재시도

`failed_jobs` 테이블에 저장된 모든 실패 잡은 `queue:failed` Artisan 명령어로 확인할 수 있습니다.

```shell
php artisan queue:failed
```

`queue:failed` 명령어는 잡 ID, 커넥션, 큐, 실패 시간 등 정보를 보여줍니다. 잡 ID를 사용해 해당 실패 잡을 재시도할 수 있습니다. 예를 들어, ID가 `ce7bb17c-cdd8-41f0-a8ec-7b4fef4e5ece`인 잡을 재시도하려면 다음과 같이 실행합니다.

```shell
php artisan queue:retry ce7bb17c-cdd8-41f0-a8ec-7b4fef4e5ece
```

필요하다면 여러 개의 ID를 한 번에 전달해 여러 잡을 재시도할 수도 있습니다.

```shell
php artisan queue:retry ce7bb17c-cdd8-41f0-a8ec-7b4fef4e5ece 91401d2c-0784-4f43-824c-34f94a33c24d
```

특정 큐의 모든 실패 잡을 재시도하고 싶다면 다음과 같이 실행합니다.

```shell
php artisan queue:retry --queue=name
```

실패한 모든 잡을 재시도하려면, `queue:retry` 명령에서 ID 대신 `all`을 전달하면 됩니다.

```shell
php artisan queue:retry all
```

실패한 잡을 삭제하려면, `queue:forget` 명령을 사용합니다.

```shell
php artisan queue:forget 91401d2c-0784-4f43-824c-34f94a33c24d
```

> [!NOTE]
> [Horizon](/docs/12.x/horizon)을 사용하는 경우에는 `queue:forget` 대신 `horizon:forget` 명령을 사용해야 합니다.

`failed_jobs` 테이블에 저장된 모든 실패 잡을 삭제하려면 `queue:flush` 명령을 실행하면 됩니다.

```shell
php artisan queue:flush
```

<a name="ignoring-missing-models"></a>
### 누락된 모델 무시하기

잡에 Eloquent 모델을 주입하면, 큐에 등록할 때 자동으로 직렬화되고, 잡 처리 시 데이터베이스에서 다시 조회됩니다. 그런데 잡이 큐에서 대기 중인 동안 모델이 삭제된다면, 잡은 `ModelNotFoundException`으로 실패하게 됩니다.

이럴 때, 잡 클래스의 `deleteWhenMissingModels` 속성을 `true`로 설정하면 해당 모델이 없을 경우 잡을 조용히 삭제하고 예외는 발생시키지 않습니다.

```php
/**
 * 모델이 더이상 존재하지 않으면 잡을 삭제
 *
 * @var bool
 */
public $deleteWhenMissingModels = true;
```

<a name="pruning-failed-jobs"></a>
### 실패 잡 정리(pruning)

`queue:prune-failed` Artisan 명령어로 애플리케이션의 `failed_jobs` 테이블을 정리할 수 있습니다.

```shell
php artisan queue:prune-failed
```

기본적으로 24시간이 넘은 모든 실패 잡 레코드가 삭제됩니다. `--hours` 옵션을 추가하면 최근 N시간 내에 삽입된 레코드만 남기고 나머지는 삭제됩니다. 예를 들어, 다음 명령어는 48시간보다 오래된 실패 잡만 삭제합니다.

```shell
php artisan queue:prune-failed --hours=48
```

<a name="storing-failed-jobs-in-dynamodb"></a>
### DynamoDB에 실패 잡 저장하기

라라벨은 실패한 잡 기록을 관계형 데이터베이스 테이블이 아닌 [DynamoDB](https://aws.amazon.com/dynamodb)에 저장하도록 지원합니다. 단, 모든 실패 잡 레코드를 저장할 DynamoDB 테이블은 수동으로 생성해야 합니다. 일반적으로 테이블 이름은 `failed_jobs`로 하며, 실제 이름은 애플리케이션 `queue` 설정 파일의 `queue.failed.table` 설정 값에 따라 정해집니다.

`failed_jobs` 테이블은 문자열 파티션 키인 `application`과 문자열 정렬 키인 `uuid`를 기본 키로 사용합니다. `application` 키에는 애플리케이션의 `app` 설정 파일의 `name` 설정 값이 할당됩니다. 이처럼 테이블의 키에 애플리케이션 이름이 포함되므로, 여러 라라벨 애플리케이션에서 하나의 테이블을 공용으로 사용할 수 있습니다.

추가로, 라라벨 애플리케이션이 Amazon DynamoDB와 통신할 수 있도록 AWS SDK를 반드시 설치하세요.

```shell
composer require aws/aws-sdk-php
```

그 다음, `queue.failed.driver` 설정 값을 `dynamodb`로 지정합니다. 그리고 실패 잡 설정 배열에 `key`, `secret`, `region` 설정값을 추가해 주어야 합니다. 이 값들은 AWS 인증에 사용됩니다. `dynamodb` 드라이버에서는 `queue.failed.database` 설정이 필요하지 않습니다.

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
### 실패 잡 저장 비활성화

실패한 잡을 별도로 저장하지 않고 즉시 폐기하고 싶다면, `queue.failed.driver` 설정 값을 `null`로 지정하면 됩니다. 보통 환경변수 `QUEUE_FAILED_DRIVER`로 쉽게 지정할 수 있습니다.

```ini
QUEUE_FAILED_DRIVER=null
```

<a name="failed-job-events"></a>
### 실패 잡 이벤트

잡이 실패할 때마다 실행되는 이벤트 리스너를 등록하고 싶다면, `Queue` 파사드의 `failing` 메서드를 사용할 수 있습니다. 예를 들어, 라라벨에 포함된 `AppServiceProvider`의 `boot` 메서드에서 클로저를 이벤트에 연결할 수 있습니다.

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Queue;
use Illuminate\Support\ServiceProvider;
use Illuminate\Queue\Events\JobFailed;

class AppServiceProvider extends ServiceProvider
{
    /**
     * 어플리케이션 서비스 등록
     */
    public function register(): void
    {
        // ...
    }

    /**
     * 어플리케이션 서비스 부트스트랩
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

## 큐에서 작업 비우기

> [!NOTE]
> [Horizon](/docs/12.x/horizon)를 사용할 때는, `queue:clear` 명령어 대신 `horizon:clear` 명령어로 큐의 작업을 비워야 합니다.

기본 연결의 기본 큐에서 모든 작업을 삭제하려면, 다음과 같이 `queue:clear` 아티즌 명령어를 사용할 수 있습니다.

```shell
php artisan queue:clear
```

특정 연결과 큐에서 작업을 삭제하고 싶다면, `connection` 인수와 `queue` 옵션을 함께 지정할 수 있습니다.

```shell
php artisan queue:clear redis --queue=emails
```

> [!WARNING]
> 큐 작업 비우기 기능은 SQS, Redis, 데이터베이스 큐 드라이버에서만 사용할 수 있습니다. 또한 SQS의 메시지 삭제 과정은 최대 60초가 소요되므로, 큐를 비운 후 60초 이내에 SQS 큐로 전송된 작업도 함께 삭제될 수 있습니다.

<a name="monitoring-your-queues"></a>
## 큐 모니터링하기

큐에 갑자기 많은 작업이 몰릴 경우, 큐가 과부하되어 작업 완료까지 기다리는 시간이 길어질 수 있습니다. 이런 상황을 방지하고 싶다면, 큐의 작업 수가 지정한 임계값을 초과할 때 라라벨이 알림을 보내도록 설정할 수 있습니다.

우선, `queue:monitor` 명령어가 [매 분마다 실행](/docs/12.x/scheduling)되도록 예약해야 합니다. 이 명령어에는 모니터링할 큐 이름과 원하는 작업 수 임계값을 지정할 수 있습니다.

```shell
php artisan queue:monitor redis:default,redis:deployments --max=100
```

이 명령어를 예약만 해서는 큐가 과부하 상태임을 알리는 알림이 자동으로 전송되지는 않습니다. 명령어 실행 시, 지정한 임계값을 초과하는 작업 수를 가진 큐가 있으면 `Illuminate\Queue\Events\QueueBusy` 이벤트가 발생합니다. 이 이벤트를 `AppServiceProvider`에서 감지해, 알림을 본인이나 개발팀에게 보낼 수 있습니다.

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

작업을 디스패치(Dispatch)하는 코드를 테스트할 때는, 실제로 작업을 실행하지 않도록 라라벨에 지시하는 것이 유용할 수 있습니다. 작업의 코드 자체는 별도로 직접 테스트 가능하므로, 디스패처 코드만 분리해 검증할 수 있게 됩니다. 물론 작업을 직접 테스트하고 싶다면, 작업 인스턴스를 생성하고 `handle` 메서드를 호출하면 됩니다.

실제 큐에 작업이 들어가지 않도록 하려면 `Queue` 파사드의 `fake` 메서드를 사용할 수 있습니다. 이 메서드를 호출하면 이후에 큐에 작업이 들어갔는지 여부를 검증(assert)할 수 있습니다.

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

`assertPushed`나 `assertNotPushed` 메서드에 클로저(Closure)를 인수로 전달하면, 특정 조건을 만족하는 작업이 푸시되었는지 검증할 수 있습니다. 하나라도 해당 조건을 만족하는 작업이 있다면 해당 assert가 통과합니다.

```php
Queue::assertPushed(function (ShipOrder $job) use ($order) {
    return $job->order->id === $order->id;
});
```

<a name="faking-a-subset-of-jobs"></a>
### 일부 작업만 페이크하기

특정 작업만 큐에 넣지 않고 나머지 작업은 실제로 실행되게 하고 싶다면, `fake` 메서드에 페이크할 작업의 클래스명을 배열로 전달하면 됩니다.

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

반대로, 지정한 특정 작업만 실제로 실행되게 하고 나머지는 모두 페이크 처리하고 싶다면, `except` 메서드를 사용할 수 있습니다.

```php
Queue::fake()->except([
    ShipOrder::class,
]);
```

<a name="testing-job-chains"></a>
### 작업 체인 테스트

[작업 체인](/docs/12.x/queues#job-chaining)을 테스트하려면 `Bus` 파사드의 페이크 기능을 사용해야 합니다. `Bus` 파사드의 `assertChained` 메서드는 체인으로 연결된 작업들이 올바르게 디스패치되었는지 검증할 때 사용할 수 있습니다. 첫 번째 인수로 체인에 포함된 작업들을 배열로 넘겨줍니다.

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

위 예시처럼 체인 작업 배열에 작업들의 클래스명만 넣을 수 있습니다. 또는 실제 작업 인스턴스의 배열을 전달하는 것도 가능합니다. 이 경우 라라벨은 작업 인스턴스가 같은 클래스 및 속성 값을 갖는지까지 비교합니다.

```php
Bus::assertChained([
    new ShipOrder,
    new RecordShipment,
    new UpdateInventory,
]);
```

`assertDispatchedWithoutChain` 메서드는 해당 작업이 체인 없이 디스패치되었는지 확인할 때 사용합니다.

```php
Bus::assertDispatchedWithoutChain(ShipOrder::class);
```

<a name="testing-chain-modifications"></a>
#### 체인 수정 테스트

체인에 포함된 작업이 [기존 체인 앞이나 뒤에 작업을 추가](#adding-jobs-to-the-chain)했다면, 작업의 `assertHasChain` 메서드로 체인에 남아 있는 작업이 예상과 일치하는지 확인할 수 있습니다.

```php
$job = new ProcessPodcast;

$job->handle();

$job->assertHasChain([
    new TranscribePodcast,
    new OptimizePodcast,
    new ReleasePodcast,
]);
```

`assertDoesntHaveChain` 메서드는 해당 작업의 남아 있는 체인이 비어있는지 검증할 때 사용합니다.

```php
$job->assertDoesntHaveChain();
```

<a name="testing-chained-batches"></a>
#### 체인에 배치된 작업 테스트

작업 체인에 [여러 작업을 묶은 배치(batch)](#chains-and-batches)가 포함되어 있다면, 체인 검증 과정에서 `Bus::chainedBatch`를 사용해 기대하는 배치가 일치하는지 확인할 수 있습니다.

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

`Bus` 파사드의 `assertBatched` 메서드는 [작업 배치](/docs/12.x/queues#job-batching)가 디스패치되었는지 검증할 때 사용할 수 있습니다. 이 메서드에 전달된 클로저는 `Illuminate\Bus\PendingBatch` 인스턴스를 전달받아, 배치에 포함된 작업들을 검사할 수 있습니다.

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

`assertBatchCount` 메서드를 사용하면 원하는 개수의 배치가 디스패치되었는지 검증할 수 있습니다.

```php
Bus::assertBatchCount(3);
```

배치가 아예 디스패치되지 않았는지 확인하려면 `assertNothingBatched`를 사용할 수 있습니다.

```php
Bus::assertNothingBatched();
```

<a name="testing-job-batch-interaction"></a>
#### 작업과 배치 상호작용 테스트

특정 작업이 배치와 어떻게 상호작용하는지 테스트해야 할 경우도 있습니다. 예를 들어, 작업이 배치의 추가 작업 처리를 취소시켰는지 검증하려면, `withFakeBatch` 메서드를 이용해 해당 작업에 가짜 배치를 할당하면 됩니다. `withFakeBatch` 메서드는 작업 인스턴스와 페이크 배치를 튜플로 반환합니다.

```php
[$job, $batch] = (new ShipOrder)->withFakeBatch();

$job->handle();

$this->assertTrue($batch->cancelled());
$this->assertEmpty($batch->added);
```

<a name="testing-job-queue-interactions"></a>
### 작업과 큐 상호작용 테스트

가끔, 큐에 디스패치된 작업이 [스스로 다시 큐에 등록(release)](#manually-releasing-a-job)되었거나, 삭제되었는지 등의 행동을 테스트해야 할 때가 있습니다. 이런 상호작용을 검증하려면 작업을 인스턴스화한 후, `withFakeQueueInteractions` 메서드를 호출합니다.

작업의 큐 상호작용을 페이크한 뒤에는 `handle` 메서드를 실행하면 됩니다. 실행 후에는 `assertReleased`, `assertDeleted`, `assertNotDeleted`, `assertFailed`, `assertFailedWith`, `assertNotFailed` 등의 메서드로 큐 상호작용을 검증할 수 있습니다.

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
## 작업 이벤트

`Queue` [파사드](/docs/12.x/facades)의 `before`와 `after` 메서드를 사용하면 큐 작업이 처리되기 직전 혹은 직후에 실행할 콜백을 지정할 수 있습니다. 추가적인 로깅을 하거나, 대시보드 통계를 계산하는 용도로 활용할 수 있습니다. 일반적으로 이 메서드들은 [서비스 프로바이더](/docs/12.x/providers)의 `boot` 메서드 내에서 호출합니다. 예를 들어 라라벨 프로젝트에 기본 포함된 `AppServiceProvider`에서 사용할 수 있습니다.

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

`Queue` [파사드](/docs/12.x/facades)의 `looping` 메서드를 사용하면 워커가 큐에서 작업을 가져오기 전에 실행할 콜백을 지정할 수 있습니다. 예를 들어, 실패했던 이전 작업으로 인해 열린 트랜잭션이 남아 있다면 이를 롤백하도록 클로저를 등록할 수 있습니다.

```php
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;

Queue::looping(function () {
    while (DB::transactionLevel() > 0) {
        DB::rollBack();
    }
});
```