# 라라벨 펄스 (Laravel Pulse)

- [소개](#introduction)
- [설치](#installation)
    - [설정](#configuration)
- [대시보드](#dashboard)
    - [인가](#dashboard-authorization)
    - [커스터마이즈](#dashboard-customization)
    - [사용자 정보 매핑](#dashboard-resolving-users)
    - [카드](#dashboard-cards)
- [엔트리 수집](#capturing-entries)
    - [레코더](#recorders)
    - [필터링](#filtering)
- [성능](#performance)
    - [다른 데이터베이스 사용](#using-a-different-database)
    - [Redis Ingest](#ingest)
    - [샘플링](#sampling)
    - [데이터 트리밍](#trimming)
    - [Pulse 예외 처리](#pulse-exceptions)
- [커스텀 카드](#custom-cards)
    - [카드 컴포넌트](#custom-card-components)
    - [스타일링](#custom-card-styling)
    - [데이터 수집 및 집계](#custom-card-data)

<a name="introduction"></a>
## 소개

[Laravel Pulse](https://github.com/laravel/pulse)는 애플리케이션의 성능 및 사용 현황을 한눈에 파악할 수 있도록 도와줍니다. Pulse를 사용하면 느린 작업이나 엔드포인트 같은 병목 현상을 추적하거나, 가장 활발한 사용자를 쉽게 찾을 수 있습니다.

개별 이벤트에 대한 더 깊은 디버깅이 필요하다면 [Laravel Telescope](/docs/12.x/telescope)도 참고하시기 바랍니다.

<a name="installation"></a>
## 설치

> [!WARNING]
> Pulse의 공식 스토리지 구현체는 현재 MySQL, MariaDB, PostgreSQL 데이터베이스가 필요합니다. 이외의 데이터베이스 엔진을 사용한다면, Pulse 데이터 저장을 위해 별도의 MySQL, MariaDB, PostgreSQL 데이터베이스가 필요합니다.

Composer 패키지 매니저를 이용해 Pulse를 설치할 수 있습니다.

```shell
composer require laravel/pulse
```

이후, `vendor:publish` Artisan 명령어를 사용하여 Pulse 설정 파일과 마이그레이션 파일을 퍼블리시해야 합니다.

```shell
php artisan vendor:publish --provider="Laravel\Pulse\PulseServiceProvider"
```

마지막으로, Pulse 데이터를 저장하기 위한 테이블을 생성하려면 `migrate` 명령어를 실행해야 합니다.

```shell
php artisan migrate
```

Pulse의 데이터베이스 마이그레이션이 모두 완료되면, `/pulse` 경로를 통해 Pulse 대시보드에 접근할 수 있습니다.

> [!NOTE]
> Pulse 데이터를 애플리케이션의 기본 데이터베이스에 저장하고 싶지 않다면, [전용 데이터베이스 커넥션을 지정](#using-a-different-database)할 수 있습니다.

<a name="configuration"></a>
### 설정

Pulse의 다양한 설정 옵션은 환경 변수(env)로 제어할 수 있습니다. 사용 가능한 옵션 목록을 확인하거나 새로운 레코더를 등록하거나, 고급 옵션을 구성하려면 `config/pulse.php` 설정 파일을 퍼블리시해야 합니다.

```shell
php artisan vendor:publish --tag=pulse-config
```

<a name="dashboard"></a>
## 대시보드

<a name="dashboard-authorization"></a>
### 인가

Pulse 대시보드는 `/pulse` 경로에서 접근할 수 있습니다. 기본적으로는 `local` 환경에서만 접근이 허용되며, 운영 환경(production)에서는 `'viewPulse'` 인가 게이트를 커스터마이즈하여 접근 권한을 부여해야 합니다. 이 작업은 애플리케이션의 `app/Providers/AppServiceProvider.php` 파일에서 설정할 수 있습니다.

```php
use App\Models\User;
use Illuminate\Support\Facades\Gate;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Gate::define('viewPulse', function (User $user) {
        return $user->isAdmin();
    });

    // ...
}
```

<a name="dashboard-customization"></a>
### 커스터마이즈

Pulse 대시보드의 카드 및 레이아웃은 대시보드 뷰를 퍼블리시하여 설정할 수 있습니다. 해당 뷰는 `resources/views/vendor/pulse/dashboard.blade.php` 경로에 퍼블리시됩니다.

```shell
php artisan vendor:publish --tag=pulse-dashboard
```

대시보드는 [Livewire](https://livewire.laravel.com/)로 구현되어 있어, 별도의 JavaScript 에셋 빌드 없이 카드와 레이아웃을 원하는 대로 커스터마이즈할 수 있습니다.

이 뷰 파일 안에서 `<x-pulse>` 컴포넌트가 대시보드 렌더링을 담당하며, 카드의 그리드 레이아웃을 제공합니다. 대시보드를 화면 전체 폭에 걸쳐 표시하고 싶다면, 컴포넌트에 `full-width` 속성을 추가할 수 있습니다.

```blade
<x-pulse full-width>
    ...
</x-pulse>
```

기본적으로 `<x-pulse>` 컴포넌트는 12열 그리드를 생성하지만, `cols` 속성을 이용해 그리드 열 수를 조정할 수 있습니다.

```blade
<x-pulse cols="16">
    ...
</x-pulse>
```

각 카드는 `cols`, `rows` 속성을 받아서 위치와 크기를 조정할 수 있습니다.

```blade
<livewire:pulse.usage cols="4" rows="2" />
```

대부분의 카드에서는 `expand` 속성을 지정하면 스크롤 없이 전체 카드를 확장해서 보여줄 수 있습니다.

```blade
<livewire:pulse.slow-queries expand />
```

<a name="dashboard-resolving-users"></a>
### 사용자 정보 매핑

애플리케이션 사용량 카드 등에서 사용자 정보를 보여줄 때, Pulse는 사용자 ID만을 기록합니다. 대시보드에서는 기본 `Authenticatable` 모델의 `name`과 `email` 필드를 활용해 이름 및 이메일을 매핑하고, Gravatar 서비스를 이용해 아바타를 표시합니다.

원하는 경우 `App\Providers\AppServiceProvider` 클래스에서 `Pulse::user` 메서드를 호출해 표시하는 필드와 아바타를 커스터마이즈할 수 있습니다.

`user` 메서드는 대시보드에 표시할 `Authenticatable` 모델을 받아, `name`, `extra`, `avatar` 정보를 담은 배열을 반환하는 클로저를 받습니다.

```php
use Laravel\Pulse\Facades\Pulse;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Pulse::user(fn ($user) => [
        'name' => $user->name,
        'extra' => $user->email,
        'avatar' => $user->avatar_url,
    ]);

    // ...
}
```

> [!NOTE]
> 인증된 사용자를 어떻게 수집하고 반환할지 완전히 커스터마이즈하려면, `Laravel\Pulse\Contracts\ResolvesUsers` 계약(Contract)를 구현하고, 라라벨의 [서비스 컨테이너](/docs/12.x/container#binding-a-singleton)에 바인딩해서 사용할 수 있습니다.

<a name="dashboard-cards"></a>
### 카드

<a name="servers-card"></a>
#### 서버

`<livewire:pulse.servers />` 카드는 `pulse:check` 명령어가 실행 중인 모든 서버의 시스템 리소스 사용량(서버별 CPU/메모리/디스크 상태 등)을 보여줍니다. 시스템 리소스 보고 기능에 대한 자세한 내용은 [서버 레코더](#servers-recorder) 문서를 참고하세요.

인프라에서 서버를 교체했다면, 비활성 서버가 대시보드에 계속 표시되지 않도록 숨길 수 있습니다. 이럴 때는 `ignore-after` 속성에 비활성 서버를 숨길 기준 시간을 초 단위로 지정하거나, `1 hour`, `3 days and 1 hour`처럼 상대적인 시간 형식의 문자열로도 지정할 수 있습니다.

```blade
<livewire:pulse.servers ignore-after="3 hours" />
```

<a name="application-usage-card"></a>
#### 애플리케이션 사용량

`<livewire:pulse.usage />` 카드는 애플리케이션에서 요청을 발생시키거나 작업을 디스패치(dispatch)한, 또는 느린 요청을 경험한 상위 10명의 사용자를 표시합니다.

화면에 모든 사용량 지표를 한 번에 보고 싶다면, 해당 카드를 여러 번 포함시키고 각 인스턴스마다 `type` 속성을 명시할 수 있습니다.

```blade
<livewire:pulse.usage type="requests" />
<livewire:pulse.usage type="slow_requests" />
<livewire:pulse.usage type="jobs" />
```

Pulse가 사용자 정보를 어떻게 조회·표시하는지 커스터마이즈하는 법은 [사용자 정보 매핑 관련 문서](#dashboard-resolving-users)를 참고하세요.

> [!NOTE]
> 애플리케이션에 요청이 많거나 작업(Job)이 많이 디스패치되는 환경이라면, [샘플링](#sampling) 기능을 활성화하는 것이 좋습니다. 자세한 내용은 [사용자 요청 레코더](#user-requests-recorder), [사용자 작업 레코더](#user-jobs-recorder), [느린 작업 레코더](#slow-jobs-recorder) 문서를 참고하세요.

<a name="exceptions-card"></a>
#### 예외

`<livewire:pulse.exceptions />` 카드는 애플리케이션에서 발생한 예외의 빈도와 최근 발생 시점을 보여줍니다. 기본적으로 예외는 예외 클래스 및 발생 위치별로 그룹화됩니다. 보다 자세한 내용은 [예외 레코더](#exceptions-recorder) 문서를 참고하세요.

<a name="queues-card"></a>
#### 큐

`<livewire:pulse.queues />` 카드는 애플리케이션의 큐(queue) 처리량을 보여줍니다. 대기 중인 작업, 처리 중인 작업, 처리 완료된 작업, 다시 시도된 작업, 실패한 작업의 개수가 카드에 표시됩니다. 자세한 설정 방법은 [큐 레코더](#queues-recorder) 문서를 참고하세요.

<a name="slow-requests-card"></a>
#### 느린 요청

`<livewire:pulse.slow-requests />` 카드는 기본 임계값(1,000ms)을 초과하는 애플리케이션의 모든 요청을 표시합니다. 자세한 내용은 [느린 요청 레코더](#slow-requests-recorder) 문서를 참고하세요.

<a name="slow-jobs-card"></a>
#### 느린 작업

`<livewire:pulse.slow-jobs />` 카드는 큐에 등록된 작업 중 기본 임계값(1,000ms)을 초과한 작업을 보여줍니다. 자세한 정보는 [느린 작업 레코더](#slow-jobs-recorder) 문서를 참고하세요.

<a name="slow-queries-card"></a>
#### 느린 쿼리

`<livewire:pulse.slow-queries />` 카드는 애플리케이션의 데이터베이스 쿼리 중 기본 임계값(1,000ms)을 넘는 쿼리를 표시합니다.

기본적으로 느린 쿼리는 SQL 쿼리(바인딩 제외)와 발생 위치를 기준으로 그룹화되나, 원한다면 위치 정보를 끄고 SQL 쿼리 기준으로만 그룹화할 수도 있습니다.

아주 긴 SQL 쿼리로 인해 구문 하이라이팅 기능이 렌더링 성능에 영향을 줄 경우, `without-highlighting` 속성을 추가해 하이라이팅을 비활성화할 수 있습니다.

```blade
<livewire:pulse.slow-queries without-highlighting />
```

자세한 사항은 [느린 쿼리 레코더](#slow-queries-recorder) 문서를 참고하세요.

<a name="slow-outgoing-requests-card"></a>
#### 느린 외부 요청

`<livewire:pulse.slow-outgoing-requests />` 카드는 라라벨의 [HTTP 클라이언트](/docs/12.x/http-client)를 사용해 외부로 보낸 요청 중, 기본 임계값(1,000ms)을 초과하는 요청을 표시합니다.

기본적으로는 전체 URL 기준으로 그룹화되지만, 정규식을 이용해 비슷한 외부 요청을 정규화(normarlize)하거나 그룹화하는 것도 가능합니다. 자세한 내용은 [느린 외부 요청 레코더](#slow-outgoing-requests-recorder) 문서를 참고하세요.

<a name="cache-card"></a>
#### 캐시

`<livewire:pulse.cache />` 카드는 애플리케이션의 캐시 적중(hit) 및 실패(miss) 통계를 전체 및 각 키 별로 보여줍니다.

기본적으로는 키 단위로 그룹화되지만, 정규식을 활용해 유사한 키끼리 그룹으로 묶을 수도 있습니다. 자세한 내용은 [캐시 상호작용 레코더](#cache-interactions-recorder) 문서를 참고하세요.

<a name="capturing-entries"></a>
## 엔트리 수집

대부분의 Pulse 레코더는 라라벨에서 발생하는 프레임워크 이벤트를 기반으로 엔트리를 자동으로 수집합니다. 하지만 [서버 레코더](#servers-recorder)나 일부 써드파티 카드 등은 주기적으로 정보를 직접 수집해야 합니다. 이 카드들을 사용하려면 각 애플리케이션 서버에서 `pulse:check` 데몬을 실행해야 합니다.

```php
php artisan pulse:check
```

> [!NOTE]
> `pulse:check` 프로세스를 항상 백그라운드에서 실행하고 싶다면, Supervisor와 같은 프로세스 모니터를 활용해 명령이 중단없이 계속 실행되도록 설정해야 합니다.

`pulse:check` 명령은 장시간 동작하는 프로세스이기 때문에, 코드베이스가 변경되어도 자동으로 반영되지 않습니다. 따라서, 배포 과정에서 `pulse:restart` 명령을 호출해 프로세스를 안전하게 재시작해야 합니다.

```shell
php artisan pulse:restart
```

> [!NOTE]
> Pulse는 [캐시](/docs/12.x/cache)를 이용해 재시작 신호를 저장하므로, 이 기능을 사용하려면 애플리케이션에 적절한 캐시 드라이버가 설정되어 있는지 확인하세요.

<a name="recorders"></a>
### 레코더

레코더는 애플리케이션에서 Pulse 데이터베이스로 기록될 엔트리를 수집하는 역할을 합니다. 레코더는 [Pulse 설정 파일](#configuration)의 `recorders` 항목에서 등록 및 설정할 수 있습니다.

<a name="cache-interactions-recorder"></a>
#### 캐시 상호작용

`CacheInteractions` 레코더는 애플리케이션의 [캐시](/docs/12.x/cache) 적중(hit) 및 실패(miss) 정보를 수집해 [캐시 카드](#cache-card)에 표시합니다.

[샘플링 비율](#sampling) 및 무시할 키 패턴을 옵션으로 조절할 수 있습니다.

또한 유사한 키를 하나의 엔트리로 합칠 수 있도록 키 그룹화를 설정할 수 있습니다. 예를 들어, 동일한 유형의 정보를 캐싱하지만 키에 고유 ID가 포함되어 있을 때 이 ID를 제거해서 그룹화할 수 있습니다. 그룹은 정규식을 활용한 "찾아 바꾸기(find and replace)" 방식으로 설정하며, 예시는 설정 파일에 포함되어 있습니다.

```php
Recorders\CacheInteractions::class => [
    // ...
    'groups' => [
        // '/:\d+/' => ':*',
    ],
],
```

정의된 패턴 중 처음으로 매칭되는 것이 사용됩니다. 매칭되는 패턴이 없다면 키는 있는 그대로 기록됩니다.

<a name="exceptions-recorder"></a>
#### 예외

`Exceptions` 레코더는 애플리케이션에서 발생한 예외 중 보고 가능한(reportable) 예외 정보를 수집해 [예외 카드](#exceptions-card)에 표시합니다.

옵션으로 [샘플링 비율](#sampling)과 무시할 예외 패턴을 조절할 수 있고, 예외가 발생한 위치 정보를 수집할지 여부도 설정할 수 있습니다. 위치 정보를 수집하면 Pulse 대시보드에서 예외 발생 위치를 추적할 수 있어 원인 파악이 쉬워집니다. 단, 동일한 예외가 여러 위치에서 발생하면 각 위치마다 별도로 표시될 수 있습니다.

<a name="queues-recorder"></a>
#### 큐

`Queues` 레코더는 애플리케이션의 큐 관련 정보를 수집해 [큐 카드](#queues-card)에 표시합니다.

[샘플링 비율](#sampling) 및 무시할 작업 패턴을 옵션으로 조절할 수 있습니다.

<a name="slow-jobs-recorder"></a>
#### 느린 작업

`SlowJobs` 레코더는 애플리케이션 내에서 느리게 실행되는 작업(Job) 정보를 수집해 [느린 작업 카드](#slow-jobs-recorder)에 표시합니다.

느린 작업의 임계값, [샘플링 비율](#sampling), 무시할 작업 패턴을 옵션으로 조절할 수 있습니다.

특정 작업은 더 오래 걸릴 수 있다는 것을 예상한다면, 작업별 임계값을 개별적으로 지정할 수 있습니다.

```php
Recorders\SlowJobs::class => [
    // ...
    'threshold' => [
        '#^App\\Jobs\\GenerateYearlyReports$#' => 5000,
        'default' => env('PULSE_SLOW_JOBS_THRESHOLD', 1000),
    ],
],
```

정규식 패턴이 작업의 클래스명과 일치하지 않으면 `'default'` 값이 적용됩니다.

<a name="slow-outgoing-requests-recorder"></a>
#### 느린 외부 요청

`SlowOutgoingRequests` 레코더는 라라벨의 [HTTP 클라이언트](/docs/12.x/http-client)를 통해 외부로 송신되는 HTTP 요청 중, 임계값을 초과한 요청 정보를 수집해 [느린 외부 요청 카드](#slow-outgoing-requests-card)에 표시합니다.

느린 외부 요청의 임계값, [샘플링 비율](#sampling), 무시할 URL 패턴을 옵션으로 조절할 수 있습니다.

특정 요청은 더 오래 걸릴 수 있다는 것을 예상한다면, 요청별 임계값도 지정할 수 있습니다.

```php
Recorders\SlowOutgoingRequests::class => [
    // ...
    'threshold' => [
        '#backup.zip$#' => 5000,
        'default' => env('PULSE_SLOW_OUTGOING_REQUESTS_THRESHOLD', 1000),
    ],
],
```

정규식 패턴이 요청의 URL과 매칭되지 않으면 `'default'` 값이 적용됩니다.

또한, 유사한 URL을 하나의 엔트리로 합칠 수 있도록 URL 그룹화를 설정할 수도 있습니다. 예를 들어, URL 경로에서 고유 ID를 제거하거나 도메인 단위로 그룹화가 가능합니다. 그룹은 정규식을 이용해 "찾아 바꾸기" 방식으로 설정할 수 있으며, 설정 파일에 예시가 포함되어 있습니다.

```php
Recorders\SlowOutgoingRequests::class => [
    // ...
    'groups' => [
        // '#^https://api\.github\.com/repos/.*$#' => 'api.github.com/repos/*',
        // '#^https?://([^/]*).*$#' => '\1',
        // '#/\d+#' => '/*',
    ],
],
```

첫 번째로 매칭되는 패턴이 적용되며, 매칭되는 것이 없다면 URL은 있는 그대로 기록됩니다.

<a name="slow-queries-recorder"></a>
#### 느린 쿼리

`SlowQueries` 레코더는 애플리케이션의 데이터베이스 쿼리 중 임계값을 초과하는 쿼리 정보를 수집해 [느린 쿼리 카드](#slow-queries-card)에 표시합니다.

느린 쿼리 임계값, [샘플링 비율](#sampling), 무시할 쿼리 패턴을 옵션으로 조절할 수 있습니다. 쿼리 위치를 수집할지 설정할 수 있으며, 수집하는 경우 Pulse 대시보드에서 쿼리의 발생 위치를 추적할 수 있습니다. 동일 쿼리가 여러 위치에서 발생한다면 각 위치별로 별도 표시될 수 있습니다.

특정 쿼리는 상대적으로 오래 걸릴 수 있으므로, 쿼리별로 임계값을 설정할 수도 있습니다.

```php
Recorders\SlowQueries::class => [
    // ...
    'threshold' => [
        '#^insert into `yearly_reports`#' => 5000,
        'default' => env('PULSE_SLOW_QUERIES_THRESHOLD', 1000),
    ],
],
```

정규식 패턴이 쿼리 SQL에 맞지 않으면 `'default'` 값이 사용됩니다.

<a name="slow-requests-recorder"></a>
#### 느린 요청

`Requests` 레코더는 애플리케이션에 들어온 요청 정보를 수집해 [느린 요청 카드](#slow-requests-card) 및 [애플리케이션 사용량 카드](#application-usage-card)에 표시합니다.

느린 라우트 임계값, [샘플링 비율](#sampling), 무시할 경로를 옵션으로 조절할 수 있습니다.

특정 요청은 더 오래 걸릴 수 있다는 것을 예상한다면, 요청별 임계값을 개별 지정할 수도 있습니다.

```php
Recorders\SlowRequests::class => [
    // ...
    'threshold' => [
        '#^/admin/#' => 5000,
        'default' => env('PULSE_SLOW_REQUESTS_THRESHOLD', 1000),
    ],
],
```

정규식 패턴이 요청 URL과 매칭되지 않으면 `'default'` 값이 사용됩니다.

<a name="servers-recorder"></a>
#### 서버

`Servers` 레코더는 애플리케이션을 구동하는 서버의 CPU, 메모리, 저장소 사용 정보를 수집해 [서버 카드](#servers-card)에 표시합니다. 이 레코더는 각 모니터링 대상 서버에서 [pulse:check 명령어](#capturing-entries)가 실행되고 있어야 합니다.

각 리포팅 서버는 고유한 이름을 가져야 하며, 기본적으로 Pulse는 PHP의 `gethostname` 함수가 반환하는 값을 사용합니다. 원한다면 `PULSE_SERVER_NAME` 환경 변수로 서버 이름을 직접 지정할 수 있습니다.

```env
PULSE_SERVER_NAME=load-balancer
```

Pulse 설정 파일을 통해 모니터링할 디렉터리 경로도 커스터마이즈할 수 있습니다.

<a name="user-jobs-recorder"></a>
#### 사용자 작업

`UserJobs` 레코더는 애플리케이션에서 작업을 디스패치하는 사용자의 정보를 수집해 [애플리케이션 사용량 카드](#application-usage-card)에 표시합니다.

[샘플링 비율](#sampling)과 무시할 작업 패턴을 옵션으로 조절할 수 있습니다.

<a name="user-requests-recorder"></a>
#### 사용자 요청

`UserRequests` 레코더는 애플리케이션에 요청을 발생시킨 사용자의 정보를 수집해 [애플리케이션 사용량 카드](#application-usage-card)에 표시합니다.

[샘플링 비율](#sampling) 및 무시할 URL 패턴을 옵션으로 조절할 수 있습니다.

<a name="filtering"></a>
### 필터링

[레코더](#recorders) 대부분은 설정을 통해 요청 URL 등 특정 값에 따라 엔트리를 "무시"할 수 있도록 옵션을 제공합니다. 하지만 때로는 현재 인증된 사용자 등, 다른 조건에 따라 기록을 필터링해야 할 수도 있습니다. 이럴 때는 Pulse의 `filter` 메서드에 클로저를 전달해 필터링을 적용할 수 있습니다. 일반적으로, `filter` 메서드는 애플리케이션의 `AppServiceProvider` 클래스의 `boot` 메서드에서 사용합니다.

```php
use Illuminate\Support\Facades\Auth;
use Laravel\Pulse\Entry;
use Laravel\Pulse\Facades\Pulse;
use Laravel\Pulse\Value;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Pulse::filter(function (Entry|Value $entry) {
        return Auth::user()->isNotAdmin();
    });

    // ...
}
```

<a name="performance"></a>
## 성능

Pulse는 별다른 추가 인프라 없이 기존 애플리케이션에 바로 적용할 수 있도록 설계되었습니다. 그러나 트래픽이 많은 대규모 애플리케이션에서는 Pulse가 성능에 미치는 영향을 최소화하기 위해 여러 방법을 활용할 수 있습니다.

<a name="using-a-different-database"></a>
### 다른 데이터베이스 사용

트래픽이 많은 서비스라면 Pulse 용도로 별도의 데이터베이스 커넥션을 사용하는 게 메인 데이터베이스에 영향을 최소화하는 데 도움이 됩니다.

Pulse에서 사용할 [데이터베이스 커넥션](/docs/12.x/database#configuration)은 `PULSE_DB_CONNECTION` 환경 변수로 지정할 수 있습니다.

```env
PULSE_DB_CONNECTION=pulse
```

<a name="ingest"></a>
### Redis Ingest

> [!WARNING]
> Redis Ingest 기능은 Redis 6.2 이상과 애플리케이션에 설정된 Redis 클라이언트 드라이버로 `phpredis` 또는 `predis`가 필요합니다.

기본적으로 Pulse는 클라이언트에서 HTTP 응답을 받은 후나 작업이 처리된 후 [설정된 데이터베이스 커넥션](#using-a-different-database)으로 직접 엔트리를 저장합니다. 그러나 Pulse의 Redis ingest 드라이버를 이용하면, 데이터베이스 대신 엔트리를 Redis 스트림으로 전송할 수도 있습니다. 이 기능은 `PULSE_INGEST_DRIVER` 환경 변수를 설정하여 활성화할 수 있습니다.

```ini
PULSE_INGEST_DRIVER=redis
```

Pulse는 기본적으로 [기본 Redis 커넥션](/docs/12.x/redis#configuration)을 사용하지만, 필요에 따라 `PULSE_REDIS_CONNECTION` 환경 변수로 별도의 커넥션을 지정할 수 있습니다.

```ini
PULSE_REDIS_CONNECTION=pulse
```

Redis ingest 모드를 사용할 때는 `pulse:work` 명령어를 실행해 Redis 스트림을 모니터링하고, 엔트리를 Pulse 데이터베이스 테이블로 이동시켜야 합니다.

```php
php artisan pulse:work
```

> [!NOTE]
> `pulse:work` 프로세스를 항상 백그라운드에서 실행하려면 Supervisor 같은 프로세스 모니터를 이용하여 Pulse 워커가 중단 없이 동작하도록 설정해야 합니다.

`pulse:work` 명령 역시 장기 실행 프로세스이므로, 코드베이스에 변경이 생기면 재시작해야 코드가 반영됩니다. 따라서 배포 시에는 `pulse:restart` 명령을 호출해 안전하게 프로세스를 재가동해야 합니다.

```shell
php artisan pulse:restart
```

> [!NOTE]
> Pulse는 [캐시](/docs/12.x/cache)를 사용해 재시작 신호를 저장하므로, 이 기능을 사용하려면 애플리케이션에 적절한 캐시 드라이버가 정상적으로 설정되어 있어야 합니다.

<a name="sampling"></a>
### 샘플링

Pulse는 기본적으로 발생하는 모든 관련 이벤트를 빠짐없이 수집합니다. 트래픽이 많은 서비스의 경우, 이로 인해 대시보드에서 수백만 개의 데이터베이스 행을 계속 집계해야 할 수도 있습니다.

이럴 때는 일부 Pulse 데이터 레코더에 "샘플링" 기능을 활성화할 수 있습니다. 예를 들어, [사용자 요청](#user-requests-recorder) 레코더의 샘플링 비율을 `0.1`로 설정하면 전체 요청의 약 10%만 기록하게 됩니다. 이 경우 대시보드에 출력되는 값은 `~` 표시와 함께 근사치로 표시됩니다.

특정 메트릭에 데이터가 충분히 많이 쌓여 있다면, 샘플링 비율을 더 낮춰도 정확도 손실이 크지 않습니다.

<a name="trimming"></a>
### 데이터 트리밍

Pulse는 대시보드에서 더이상 보이지 않는 과거 엔트리를 자동으로 트리밍(삭제)합니다. 트리밍은 데이터 입력(ingest) 시 로터리(lottery) 방식을 적용해 동작하며, Pulse [설정 파일](#configuration)에서 커스터마이즈할 수 있습니다.

<a name="pulse-exceptions"></a>
### Pulse 예외 처리

Pulse 데이터 수집 중, 예를 들어 저장소 데이터베이스 연결이 실패하는 등 예외가 발생하면, 애플리케이션에 영향을 주지 않기 위해 Pulse에서는 자동으로 그 예외가 무시됩니다.

이 예외 처리 방식을 직접 지정하고 싶다면, Pulse의 `handleExceptionsUsing` 메서드에 클로저를 전달하면 됩니다.

```php
use Laravel\Pulse\Facades\Pulse;
use Illuminate\Support\Facades\Log;

Pulse::handleExceptionsUsing(function ($e) {
    Log::debug('An exception happened in Pulse', [
        'message' => $e->getMessage(),
        'stack' => $e->getTraceAsString(),
    ]);
});
```

<a name="custom-cards"></a>
## 커스텀 카드

Pulse는 애플리케이션에 특화된 데이터를 표시할 수 있도록 커스텀 카드를 만들 수 있는 기능을 지원합니다. Pulse는 [Livewire](https://livewire.laravel.com)를 사용하므로, 처음 커스텀 카드를 개발하기 전에 [Livewire 공식 문서](https://livewire.laravel.com/docs)를 참고하는 것이 좋습니다.

<a name="custom-card-components"></a>
### 카드 컴포넌트

라라벨 Pulse에서 커스텀 카드를 만들려면, 우선 기본 `Card` Livewire 컴포넌트를 상속해서 뷰를 정의해야 합니다.

```php
namespace App\Livewire\Pulse;

use Laravel\Pulse\Livewire\Card;
use Livewire\Attributes\Lazy;

#[Lazy]
class TopSellers extends Card
{
    public function render()
    {
        return view('livewire.pulse.top-sellers');
    }
}
```

Livewire의 [레이지 로딩(lazy loading)](https://livewire.laravel.com/docs/lazy) 기능을 사용하면, `Card` 컴포넌트가 자동으로 `cols` 및 `rows` 속성을 적용한 플레이스홀더를 제공합니다.

커스텀 Pulse 카드의 뷰를 작성할 때는 Pulse에서 제공하는 Blade 컴포넌트를 활용해 일관된 UI 스타일을 유지할 수 있습니다.

```blade
<x-pulse::card :cols="$cols" :rows="$rows" :class="$class" wire:poll.5s="">
    <x-pulse::card-header name="Top Sellers">
        <x-slot:icon>
            ...
        </x-slot:icon>
    </x-pulse::card-header>

    <x-pulse::scroll :expand="$expand">
        ...
    </x-pulse::scroll>
</x-pulse::card>
```

`$cols`, `$rows`, `$class`, `$expand`와 같은 변수는 각각의 Blade 컴포넌트로 넘겨야 대시보드 뷰에서 카드 레이아웃을 커스터마이즈할 수 있습니다. 또한 뷰에 `wire:poll.5s=""` 속성을 지정하면 카드가 자동으로 주기적으로 업데이트됩니다.

Livewire 컴포넌트와 템플릿까지 정의했다면, [대시보드 뷰](#dashboard-customization) 내에 직접 해당 카드를 포함시킬 수 있습니다.

```blade
<x-pulse>
    ...

    <livewire:pulse.top-sellers cols="4" />
</x-pulse>
```

> [!NOTE]
> 해당 카드가 별도의 패키지에 포함되어 있다면, 반드시 `Livewire::component` 메서드를 이용해 Livewire에 컴포넌트를 등록해야 합니다.

<a name="custom-card-styling"></a>

### 스타일링

카드에 Pulse에 포함된 클래스와 컴포넌트 이상의 추가 스타일링이 필요하다면, 여러 가지 방법으로 카드에 사용자 지정 CSS를 추가할 수 있습니다.

<a name="custom-card-styling-vite"></a>
#### 라라벨 Vite 통합

사용자 지정 카드가 애플리케이션 코드베이스 내에 있고, 라라벨의 [Vite 통합](/docs/12.x/vite)을 사용 중이라면, 카드 전용 CSS 진입점을 `vite.config.js` 파일에 추가할 수 있습니다.

```js
laravel({
    input: [
        'resources/css/pulse/top-sellers.css',
        // ...
    ],
}),
```

이후 [대시보드 뷰](#dashboard-customization)에서 `@vite` Blade 디렉티브를 이용하여, 해당 카드의 CSS 진입점을 지정해 사용할 수 있습니다.

```blade
<x-pulse>
    @vite('resources/css/pulse/top-sellers.css')

    ...
</x-pulse>
```

<a name="custom-card-styling-css"></a>
#### CSS 파일

Pulse 카드를 패키지 내에 포함하는 등 다른 용도인 경우, Livewire 컴포넌트에 `css` 메서드를 정의해 CSS 파일 경로를 반환하여 Pulse가 추가 스타일시트를 불러오도록 할 수 있습니다.

```php
class TopSellers extends Card
{
    // ...

    protected function css()
    {
        return __DIR__.'/../../dist/top-sellers.css';
    }
}
```

이 카드가 대시보드에 추가되면, Pulse는 해당 파일의 내용을 `<style>` 태그 내부에 자동으로 포함하므로, `public` 디렉터리로 별도 배포할 필요가 없습니다.

<a name="custom-card-styling-tailwind"></a>
#### Tailwind CSS

Tailwind CSS를 사용할 때는 불필요한 CSS 로딩이나 Pulse의 Tailwind 클래스와의 충돌을 피하기 위해 별도의 Tailwind 설정 파일을 생성하는 것이 좋습니다.

```js
export default {
    darkMode: 'class',
    important: '#top-sellers',
    content: [
        './resources/views/livewire/pulse/top-sellers.blade.php',
    ],
    corePlugins: {
        preflight: false,
    },
};
```

그리고 CSS 진입점에서 이 설정 파일을 지정할 수 있습니다.

```css
@config "../../tailwind.top-sellers.config.js";
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Tailwind의 [important selector strategy](https://tailwindcss.com/docs/configuration#selector-strategy)에서 지정한 선택자와 일치하도록, 카드 뷰에 `id`나 `class` 속성을 추가해야 합니다.

```blade
<x-pulse::card id="top-sellers" :cols="$cols" :rows="$rows" class="$class">
    ...
</x-pulse::card>
```

<a name="custom-card-data"></a>
### 데이터 캡처 및 집계

사용자 지정 카드는 어디서든 데이터를 가져와 표시할 수 있습니다. 그러나 Pulse의 강력하고 효율적인 데이터 기록 및 집계 시스템을 활용하는 것이 유용할 수 있습니다.

<a name="custom-card-data-capture"></a>
#### 엔트리(Entry) 기록하기

Pulse에서는 `Pulse::record` 메서드를 이용해 "엔트리(entry)"를 기록할 수 있습니다.

```php
use Laravel\Pulse\Facades\Pulse;

Pulse::record('user_sale', $user->id, $sale->amount)
    ->sum()
    ->count();
```

`record` 메서드의 첫 번째 인자는 기록할 엔트리의 `type` 이고, 두 번째 인자는 집계 데이터가 어떻게 그룹화될지 결정하는 `key`입니다. 대부분의 집계 메서드에서는 더불어 집계할 `value`도 지정해야 합니다. 위 예제의 경우, `$sale->amount`가 집계될 값입니다. 그 다음에는 하나 이상의 집계 메서드(`sum` 등)를 호출하여, Pulse가 데이터의 사전 집계 값을 "버킷"에 저장하여 이후 효율적으로 불러올 수 있게 합니다.

사용 가능한 집계 메서드는 다음과 같습니다.

* `avg`
* `count`
* `max`
* `min`
* `sum`

> [!NOTE]
> 현재 인증된 사용자 ID를 기록하는 카드 패키지를 개발할 때는, 애플리케이션에서 적용한 [사용자 리졸버 커스터마이징](#dashboard-resolving-users)에 맞추어 `Pulse::resolveAuthenticatedUserId()` 메서드를 사용해야 합니다.

<a name="custom-card-data-retrieval"></a>
#### 집계 데이터 조회하기

Pulse의 `Card` Livewire 컴포넌트를 확장할 경우, 대시보드에서 확인 중인 기간에 대한 집계 데이터를 `aggregate` 메서드로 조회할 수 있습니다.

```php
class TopSellers extends Card
{
    public function render()
    {
        return view('livewire.pulse.top-sellers', [
            'topSellers' => $this->aggregate('user_sale', ['sum', 'count'])
        ]);
    }
}
```

`aggregate` 메서드는 PHP의 `stdClass` 객체로 이루어진 컬렉션을 반환합니다. 각 객체에는 이전에 기록한 `key` 속성과, 요청한 각 집계 메서드에 해당하는 키가 포함됩니다.

```blade
@foreach ($topSellers as $seller)
    {{ $seller->key }}
    {{ $seller->sum }}
    {{ $seller->count }}
@endforeach
```

Pulse는 주로 사전 집계된 버킷에서 데이터를 조회합니다. 따라서 지정한 집계는 반드시 미리 `Pulse::record` 메서드로 캡처해야 합니다. 가장 오래된 버킷은 집계 기간에서 일부 벗어날 수 있으므로, Pulse는 해당 부분을 보정하기 위해 오래된 엔트리만 추가 집계하여, 매 폴링마다 전체 기간을 완전히 집계할 필요 없이 집계 결과의 정확도를 높입니다.

특정 타입에 대해 그룹 없이 집계된 전체 값을 조회하고 싶다면, `aggregateTotal` 메서드를 사용할 수 있습니다. 아래 예시는 모든 사용자 판매의 합계를 가져오는 방법입니다.

```php
$total = $this->aggregateTotal('user_sale', 'sum');
```

<a name="custom-card-displaying-users"></a>
#### 사용자 정보 표시

키로써 사용자 ID를 기록하는 집계의 경우, `Pulse::resolveUsers` 메서드로 해당 키를 실제 사용자 레코드로 변환할 수 있습니다.

```php
$aggregates = $this->aggregate('user_sale', ['sum', 'count']);

$users = Pulse::resolveUsers($aggregates->pluck('key'));

return view('livewire.pulse.top-sellers', [
    'sellers' => $aggregates->map(fn ($aggregate) => (object) [
        'user' => $users->find($aggregate->key),
        'sum' => $aggregate->sum,
        'count' => $aggregate->count,
    ])
]);
```

`find` 메서드는 `name`, `extra`, `avatar` 키를 가진 객체를 반환합니다. 이 객체는 `<x-pulse::user-card>` Blade 컴포넌트에 직접 전달할 수 있습니다.

```blade
<x-pulse::user-card :user="{{ $seller->user }}" :stats="{{ $seller->sum }}" />
```

<a name="custom-recorders"></a>
#### 사용자 지정 기록기(Recorder)

패키지 개발자는 데이터 캡처를 사용자가 구성할 수 있도록 Recorder 클래스를 제공할 수 있습니다.

Recorder는 애플리케이션의 `config/pulse.php` 설정 파일의 `recorders` 섹션에 등록합니다.

```php
[
    // ...
    'recorders' => [
        Acme\Recorders\Deployments::class => [
            // ...
        ],

        // ...
    ],
]
```

Recorder는 `$listen` 속성을 지정하여 이벤트를 감지할 수 있습니다. Pulse는 리스너를 자동 등록하고 Recorder의 `record` 메서드를 호출합니다.

```php
<?php

namespace Acme\Recorders;

use Acme\Events\Deployment;
use Illuminate\Support\Facades\Config;
use Laravel\Pulse\Facades\Pulse;

class Deployments
{
    /**
     * 리스닝할 이벤트 목록.
     *
     * @var array<int, class-string>
     */
    public array $listen = [
        Deployment::class,
    ];

    /**
     * 배포 내역 기록.
     */
    public function record(Deployment $event): void
    {
        $config = Config::get('pulse.recorders.'.static::class);

        Pulse::record(
            // ...
        );
    }
}
```