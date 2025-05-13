# 라라벨 펄스 (Laravel Pulse)

- [소개](#introduction)
- [설치](#installation)
    - [설정](#configuration)
- [대시보드](#dashboard)
    - [인가](#dashboard-authorization)
    - [사용자 정의](#dashboard-customization)
    - [사용자 조회](#dashboard-resolving-users)
    - [카드](#dashboard-cards)
- [엔트리 수집](#capturing-entries)
    - [레코더](#recorders)
    - [필터링](#filtering)
- [성능](#performance)
    - [다른 데이터베이스 사용하기](#using-a-different-database)
    - [Redis 인제스트](#ingest)
    - [샘플링](#sampling)
    - [트리밍](#trimming)
    - [펄스 예외 처리](#pulse-exceptions)
- [커스텀 카드](#custom-cards)
    - [카드 컴포넌트](#custom-card-components)
    - [스타일링](#custom-card-styling)
    - [데이터 수집 및 집계](#custom-card-data)

<a name="introduction"></a>
## 소개

[Laravel Pulse](https://github.com/laravel/pulse)는 여러분의 애플리케이션 성능 및 사용 현황을 한눈에 파악할 수 있도록 도와줍니다. Pulse를 통해 느린 작업 및 엔드포인트와 같은 병목 현상이나, 가장 활발한 사용자 등을 추적할 수 있습니다.

개별 이벤트의 상세한 디버깅이 필요하다면 [Laravel Telescope](/docs/telescope)도 참고하시기 바랍니다.

<a name="installation"></a>
## 설치

> [!WARNING]
> Pulse의 공식 스토리지 구현은 현재 MySQL, MariaDB, 또는 PostgreSQL 데이터베이스만 지원합니다. 만약 다른 데이터베이스 엔진을 사용 중이라면, Pulse 데이터를 위한 별도의 MySQL, MariaDB, 또는 PostgreSQL 데이터베이스가 추가로 필요합니다.

Pulse는 Composer 패키지 매니저로 설치할 수 있습니다.

```shell
composer require laravel/pulse
```

이후, `vendor:publish` 아티즌 명령어를 사용해 Pulse 설정 파일과 마이그레이션 파일을 배포해야 합니다.

```shell
php artisan vendor:publish --provider="Laravel\Pulse\PulseServiceProvider"
```

마지막으로, Pulse 데이터 저장에 필요한 테이블을 생성하려면 `migrate` 명령어를 실행하세요.

```shell
php artisan migrate
```

Pulse 데이터베이스 마이그레이션을 완료하면 `/pulse` 경로로 Pulse 대시보드에 접근할 수 있습니다.

> [!NOTE]
> Pulse 데이터를 애플리케이션 기본 데이터베이스에 저장하고 싶지 않다면, [전용 데이터베이스 커넥션을 지정](#using-a-different-database)할 수 있습니다.

<a name="configuration"></a>
### 설정

Pulse의 다양한 설정은 환경 변수로 제어할 수 있습니다. 사용 가능한 옵션을 확인하거나, 새 레코더를 등록하거나, 고급 옵션을 설정하려면 `config/pulse.php` 설정 파일을 배포하세요.

```shell
php artisan vendor:publish --tag=pulse-config
```

<a name="dashboard"></a>
## 대시보드

<a name="dashboard-authorization"></a>
### 인가

Pulse 대시보드는 `/pulse` 경로를 통해 접근할 수 있습니다. 기본적으로 `local` 환경에서만 대시보드에 접근할 수 있으므로, 운영 환경에서는 `'viewPulse'` 인가 게이트를 커스터마이즈하여 적절히 권한을 부여해야 합니다. 해당 설정은 `app/Providers/AppServiceProvider.php` 파일에서 할 수 있습니다.

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
### 사용자 정의

Pulse 대시보드의 카드와 레이아웃은 대시보드 뷰 파일을 배포하여 구성할 수 있습니다. 해당 뷰 파일은 `resources/views/vendor/pulse/dashboard.blade.php`로 배포됩니다.

```shell
php artisan vendor:publish --tag=pulse-dashboard
```

대시보드는 [Livewire](https://livewire.laravel.com/)를 기반으로 하며, 자바스크립트 에셋을 다시 빌드하지 않아도 카드 및 레이아웃을 자유롭게 커스터마이즈할 수 있습니다.

이 파일 내에서 `<x-pulse>` 컴포넌트는 대시보드를 렌더링하고 카드들을 위한 그리드 레이아웃을 제공합니다. 대시보드를 화면 전체 너비로 확장하고 싶다면 `full-width` prop을 추가하면 됩니다.

```blade
<x-pulse full-width>
    ...
</x-pulse>
```

기본적으로 `<x-pulse>` 컴포넌트는 12컬럼 그리드를 생성하지만, `cols` prop을 통해 원하는 컬럼 수로 변경할 수 있습니다.

```blade
<x-pulse cols="16">
    ...
</x-pulse>
```

각 카드는 `cols`와 `rows` prop을 받아 공간과 위치를 조정할 수 있습니다.

```blade
<livewire:pulse.usage cols="4" rows="2" />
```

대부분의 카드들은 `expand` prop을 지정해 카드 전체 내용을 스크롤 없이 표시할 수도 있습니다.

```blade
<livewire:pulse.slow-queries expand />
```

<a name="dashboard-resolving-users"></a>
### 사용자 조회

사용자 정보를 표시하는 카드(예: Application Usage 카드)에서는 기본적으로 사용자 ID만 저장합니다. 대시보드 렌더링 시 Pulse가 기본 `Authenticatable` 모델에서 `name`, `email` 필드를 조회하며, Gravatar 웹 서비스를 통해 아바타를 표시합니다.

필드 및 아바타 커스터마이즈가 필요하다면 애플리케이션의 `App\Providers\AppServiceProvider` 클래스 내에서 `Pulse::user` 메서드를 호출하면 됩니다.

`user` 메서드는 클로저를 받아, 표시할 `Authenticatable` 모델을 인자로 받고, 사용자에 대한 `name`, `extra`, `avatar` 정보를 포함하는 배열을 반환해야 합니다.

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
> 인증된 사용자를 어떻게 수집하고 불러올지 완전히 커스터마이즈하려면, `Laravel\Pulse\Contracts\ResolvesUsers` 인터페이스를 구현한 클래스를 만들어 [서비스 컨테이너](/docs/container#binding-a-singleton)에 바인딩하면 됩니다.

<a name="dashboard-cards"></a>
### 카드

<a name="servers-card"></a>
#### 서버

`<livewire:pulse.servers />` 카드는 `pulse:check` 명령어가 실행 중인 모든 서버의 시스템 리소스 사용량을 표시합니다. 시스템 리소스 리포팅에 대한 자세한 내용은 [서버 레코더](#servers-recorder) 문서를 참고하십시오.

인프라에서 서버를 교체한 경우, 일정 시간이 지난 뒤 Pulse 대시보드에서 비활성 서버 표시를 중지하고 싶을 수 있습니다. 이럴 때는 `ignore-after` prop을 사용하세요. 이 prop은 비활성 서버를 대시보드에서 자동으로 제거할 시간(초 또는 "1 hour", "3 days and 1 hour" 형태의 문자열 등)을 지정할 수 있습니다.

```blade
<livewire:pulse.servers ignore-after="3 hours" />
```

<a name="application-usage-card"></a>
#### 애플리케이션 사용량

`<livewire:pulse.usage />` 카드는 애플리케이션에서 요청을 보내거나 작업을 디스패치하거나 느린 요청을 경험하는 상위 10명의 사용자 목록을 보여줍니다.

화면에 모든 사용량 지표를 한 번에 보고 싶다면, 카드를 여러 번 포함하고 각각 `type` 속성을 지정하면 됩니다.

```blade
<livewire:pulse.usage type="requests" />
<livewire:pulse.usage type="slow_requests" />
<livewire:pulse.usage type="jobs" />
```

Pulse가 사용자 정보를 조회하고 표시하는 방식을 커스터마이즈하는 방법은 [사용자 조회](#dashboard-resolving-users) 문서를 참고하세요.

> [!NOTE]
> 애플리케이션에 요청이 많거나 작업이 많이 디스패치된다면, [샘플링](#sampling)을 활성화하는 것이 좋습니다. 자세한 내용은 [사용자 요청 레코더](#user-requests-recorder), [사용자 작업 레코더](#user-jobs-recorder), [느린 작업 레코더](#slow-jobs-recorder) 문서를 참고하세요.

<a name="exceptions-card"></a>
#### 예외

`<livewire:pulse.exceptions />` 카드는 애플리케이션에서 발생하는 예외 빈도와 최근 발생 내역을 보여줍니다. 기본적으로 예외 클래스와 발생 위치를 기준으로 예외를 그룹화합니다. 자세한 내용은 [예외 레코더](#exceptions-recorder) 문서를 참고하세요.

<a name="queues-card"></a>
#### 큐

`<livewire:pulse.queues />` 카드는 큐에 들어간 작업, 처리 중인 작업, 처리 완료된 작업, 릴리즈된 작업, 실패한 작업 등 애플리케이션 큐의 처리량을 보여줍니다. 자세한 내용은 [큐 레코더](#queues-recorder) 문서를 참고하세요.

<a name="slow-requests-card"></a>
#### 느린 요청

`<livewire:pulse.slow-requests />` 카드는 기본 임계값(기본값 1,000ms)을 초과하는 느린 애플리케이션 요청을 보여줍니다. 자세한 내용은 [느린 요청 레코더](#slow-requests-recorder) 문서를 참고하세요.

<a name="slow-jobs-card"></a>
#### 느린 작업

`<livewire:pulse.slow-jobs />` 카드는 설정된 임계값(기본값 1,000ms)을 초과하는 큐 작업을 보여줍니다. 자세한 내용은 [느린 작업 레코더](#slow-jobs-recorder)를 참고하세요.

<a name="slow-queries-card"></a>
#### 느린 쿼리

`<livewire:pulse.slow-queries />` 카드는 설정된 임계값(기본값 1,000ms)을 초과하는 데이터베이스 쿼리를 보여줍니다.

기본적으로 느린 쿼리는 SQL 쿼리(바인딩 제외)와 발생 위치를 기준으로 그룹화되지만, 위치를 수집하지 않고 SQL 쿼리만으로 그룹화할 수도 있습니다.

매우 긴 SQL 쿼리로 인해 구문 하이라이트 성능 문제가 발생한다면, `without-highlighting` prop을 추가해 하이라이팅을 비활성화할 수 있습니다.

```blade
<livewire:pulse.slow-queries without-highlighting />
```

자세한 내용은 [느린 쿼리 레코더](#slow-queries-recorder) 문서를 참고하세요.

<a name="slow-outgoing-requests-card"></a>
#### 느린 외부 요청

`<livewire:pulse.slow-outgoing-requests />` 카드는 라라벨의 [HTTP 클라이언트](/docs/http-client)로 외부로 전송되는 요청 중, 1,000ms 이상의 임계값을 초과하는 요청을 보여줍니다.

기본적으로 전체 URL 기준으로 엔트리가 그룹화됩니다. 하지만, 정규식을 활용해 유사한 외부 요청을 정규화하거나 그룹화할 수도 있습니다. 자세한 내용은 [느린 외부 요청 레코더](#slow-outgoing-requests-recorder) 문서를 참고하세요.

<a name="cache-card"></a>
#### 캐시

`<livewire:pulse.cache />` 카드는 전체 앱 및 개별 키별로 캐시 적중률과 미스 통계를 보여줍니다.

엔트리는 기본적으로 키 기준으로 그룹화되지만, 정규식으로 비슷한 키를 그룹화할 수도 있습니다. 자세한 내용은 [캐시 상호작용 레코더](#cache-interactions-recorder) 문서를 참고하세요.

<a name="capturing-entries"></a>
## 엔트리 수집

대부분의 Pulse 레코더는 라라벨에서 발생하는 프레임워크 이벤트를 자동으로 캡처하여 엔트리를 저장합니다. 하지만 [서버 레코더](#servers-recorder) 및 일부 서드파티 카드는 정보를 정기적으로 폴링해야 합니다. 이러한 카드를 쓰려면 모든 애플리케이션 서버에서 `pulse:check` 데몬을 실행해야 합니다.

```php
php artisan pulse:check
```

> [!NOTE]
> `pulse:check` 프로세스를 백그라운드에서 영구적으로 실행하려면 Supervisor와 같은 프로세스 모니터를 사용해 명령이 중단 없이 계속 실행되도록 해야 합니다.

`pulse:check` 명령은 장시간 실행되므로, 코드베이스가 변경되어도 재시작하지 않으면 반영되지 않습니다. 배포 시에는 `pulse:restart` 명령을 호출해 해당 명령을 안전하게 재시작해야 합니다.

```shell
php artisan pulse:restart
```

> [!NOTE]
> Pulse는 재시작 신호를 [캐시](/docs/cache)에 저장하므로, 이 기능을 사용하려면 애플리케이션에 적절한 캐시 드라이버가 구성되어 있는지 확인해야 합니다.

<a name="recorders"></a>
### 레코더

레코더는 애플리케이션에서 발생하는 엔트리를 수집해 Pulse 데이터베이스에 기록하는 역할을 합니다. 레코더는 [Pulse 설정 파일](#configuration)의 `recorders` 섹션에서 등록 및 설정할 수 있습니다.

<a name="cache-interactions-recorder"></a>
#### 캐시 상호작용

`CacheInteractions` 레코더는 애플리케이션에서 발생하는 [캐시](/docs/cache) 적중 및 미스 정보를 [캐시 카드](#cache-card)에 표시할 수 있도록 저장합니다.

필요하다면 [샘플링 비율](#sampling)이나 무시할 키 패턴을 조정할 수 있습니다.

또한, 유사한 키를 하나의 엔트리로 그룹화할 수도 있습니다. 예를 들어, 동일한 정보 타입을 캐시하지만 고유 ID가 다른 키에서 ID만 제거해 그룹화가 가능합니다. 그룹은 정규식을 사용한 find & replace 방식으로 설정할 수 있습니다. 다음은 설정 파일에 포함된 예시입니다.

```php
Recorders\CacheInteractions::class => [
    // ...
    'groups' => [
        // '/:\d+/' => ':*',
    ],
],
```

처음 일치하는 패턴이 적용되며, 일치하는 게 없으면 키가 그대로 캡처됩니다.

<a name="exceptions-recorder"></a>
#### 예외

`Exceptions` 레코더는 애플리케이션에서 발생한 리포트 가능한 예외 정보를 [예외 카드](#exceptions-card)에 표시할 수 있도록 캡처합니다.

옵션으로 [샘플링 비율](#sampling), 무시할 예외 패턴, 예외가 발생한 위치의 캡처 여부를 설정할 수 있습니다. 위치 정보는 대시보드에 표시되어 문제 발생 원인 추적에 도움이 되지만, 동일 예외가 여러 위치에서 발생했다면 각각 별도로 표시됩니다.

<a name="queues-recorder"></a>
#### 큐

`Queues` 레코더는 애플리케이션의 큐 상태 정보를 [큐 카드](#queues-card)에 표시할 수 있도록 캡처합니다.

샘플링 비율 및 무시할 작업 패턴을 옵션으로 조정할 수 있습니다.

<a name="slow-jobs-recorder"></a>
#### 느린 작업

`SlowJobs` 레코더는 애플리케이션 내 느린 작업 정보를 [느린 작업 카드](#slow-jobs-recorder)에 표시할 수 있도록 캡처합니다.

느린 작업 임계값, [샘플링 비율](#sampling), 무시할 작업 패턴을 설정할 수 있습니다.

특정 작업이 다른 작업보다 오래 걸리는 것이 예상된다면 작업별 임계값을 별도로 설정할 수 있습니다.

```php
Recorders\SlowJobs::class => [
    // ...
    'threshold' => [
        '#^App\\Jobs\\GenerateYearlyReports$#' => 5000,
        'default' => env('PULSE_SLOW_JOBS_THRESHOLD', 1000),
    ],
],
```

작업의 클래스명이 정규식 패턴에 맞지 않으면 `'default'` 값이 사용됩니다.

<a name="slow-outgoing-requests-recorder"></a>
#### 느린 외부 요청

`SlowOutgoingRequests` 레코더는 라라벨의 [HTTP 클라이언트](/docs/http-client)로 외부로 전송한 요청 중, 설정된 임계값을 초과한 요청을 [느린 외부 요청 카드](#slow-outgoing-requests-card)에 표시할 수 있도록 캡처합니다.

느린 외부 요청 임계값, [샘플링 비율](#sampling), 무시할 URL 패턴을 설정할 수 있습니다.

특정 외부 요청이 다른 요청보다 오래 걸리는 것이 예상된다면 요청별 임계값도 별도로 설정할 수 있습니다.

```php
Recorders\SlowOutgoingRequests::class => [
    // ...
    'threshold' => [
        '#backup.zip$#' => 5000,
        'default' => env('PULSE_SLOW_OUTGOING_REQUESTS_THRESHOLD', 1000),
    ],
],
```

요청의 URL이 패턴에 맞지 않으면 `'default'` 값이 사용됩니다.

또한, 유사한 URL을 그룹화할 수도 있습니다. 예를 들어, 고유 ID를 URL 경로에서 제거하거나 도메인 단위로 그룹화할 수 있습니다. 그룹화는 정규식을 사용해 find & replace로 설정하며, 설정 파일에 여러 예시가 들어 있습니다.

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

가장 먼저 일치하는 패턴이 적용되며, 없으면 URL은 그대로 캡처됩니다.

<a name="slow-queries-recorder"></a>
#### 느린 쿼리

`SlowQueries` 레코더는 설정한 임계값을 초과하는 데이터베이스 쿼리를 [느린 쿼리 카드](#slow-queries-card)에 표시할 수 있도록 캡처합니다.

느린 쿼리 임계값, [샘플링 비율](#sampling), 무시할 쿼리 패턴, 쿼리 위치 정보 수집 여부 등을 설정할 수 있습니다. 쿼리 위치 정보는 대시보드에 표시되어 쿼리의 발생 원인을 추적할 때 유용하지만, 동일 쿼리가 여러 위치에서 발생하면 각각 별도로 나타납니다.

특정 쿼리만 별도로 임계값을 설정하고 싶을 때는 아래처럼 할 수 있습니다.

```php
Recorders\SlowQueries::class => [
    // ...
    'threshold' => [
        '#^insert into `yearly_reports`#' => 5000,
        'default' => env('PULSE_SLOW_QUERIES_THRESHOLD', 1000),
    ],
],
```

SQL이 정규식 패턴에 맞지 않으면 `'default'` 값이 사용됩니다.

<a name="slow-requests-recorder"></a>
#### 느린 요청

`Requests` 레코더는 애플리케이션에 들어오는 요청 정보를 [느린 요청 카드](#slow-requests-card), [애플리케이션 사용량 카드](#application-usage-card)에 표시할 수 있도록 캡처합니다.

느린 라우트 임계값, [샘플링 비율](#sampling), 무시할 경로 패턴을 옵션으로 조정할 수 있습니다.

특정 요청이 오래 걸리는 것이 예상될 때는 아래와 같이 요청별 임계값을 지정할 수 있습니다.

```php
Recorders\SlowRequests::class => [
    // ...
    'threshold' => [
        '#^/admin/#' => 5000,
        'default' => env('PULSE_SLOW_REQUESTS_THRESHOLD', 1000),
    ],
],
```

요청 URL이 패턴에 맞지 않으면 `'default'` 값이 사용됩니다.

<a name="servers-recorder"></a>
#### 서버

`Servers` 레코더는 CPU, 메모리, 저장소 등 서버 자원 사용량을 [서버 카드](#servers-card)에 표시할 수 있도록 캡처합니다. 이 레코더는 [pulse:check 명령](#capturing-entries)이 모든 관측 대상 서버에서 실행 중이어야 합니다.

각 서버는 고유한 이름을 가져야 하며, 기본적으로는 PHP의 `gethostname` 값이 사용됩니다. 커스터마이즈가 필요하다면 `PULSE_SERVER_NAME` 환경 변수를 설정하세요.

```env
PULSE_SERVER_NAME=load-balancer
```

Pulse 설정 파일에서 모니터링할 디렉토리도 사용자 정의할 수 있습니다.

<a name="user-jobs-recorder"></a>
#### 사용자 작업

`UserJobs` 레코더는 작업을 디스패치하는 사용자 정보를 [애플리케이션 사용량 카드](#application-usage-card)에 표시할 수 있도록 캡처합니다.

[샘플링 비율](#sampling), 무시할 작업 패턴을 옵션으로 조정할 수 있습니다.

<a name="user-requests-recorder"></a>
#### 사용자 요청

`UserRequests` 레코더는 애플리케이션에 요청을 보낸 사용자 정보를 [애플리케이션 사용량 카드](#application-usage-card)에 표시할 수 있도록 캡처합니다.

[샘플링 비율](#sampling), 무시할 URL 패턴을 옵션으로 조정할 수 있습니다.

<a name="filtering"></a>
### 필터링

앞서 본 것처럼, 여러 [레코더](#recorders)에서 설정을 통해 요청 URL 등 엔트리의 값을 기준으로 "무시" 처리가 가능합니다. 하지만, 때로는 현재 인증된 사용자 등 다른 조건으로 기록을 걸러내고 싶을 수 있습니다. 이런 경우 Pulse의 `filter` 메서드에 클로저를 전달하여 레코드를 필터링할 수 있습니다. 일반적으로 `AppServiceProvider`의 `boot` 메서드 내에서 `filter`를 호출하는 것이 좋습니다.

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

Pulse는 별도의 인프라를 추가로 구축하지 않고도 기존 애플리케이션에 바로 적용할 수 있도록 설계되었습니다. 그러나 트래픽이 많은 애플리케이션에서는 Pulse가 성능에 미치는 영향을 줄이는 방법이 여러 가지 있습니다.

<a name="using-a-different-database"></a>
### 다른 데이터베이스 사용하기

대규모 트래픽 애플리케이션의 경우, 애플리케이션 주 데이터베이스에 영향을 주지 않도록 Pulse용 전용 데이터베이스 커넥션을 사용하는 것이 좋습니다.

Pulse에서 사용할 [데이터베이스 커넥션](/docs/database#configuration)은 `PULSE_DB_CONNECTION` 환경 변수로 지정할 수 있습니다.

```env
PULSE_DB_CONNECTION=pulse
```

<a name="ingest"></a>
### Redis 인제스트

> [!WARNING]
> Redis 인제스트 기능을 사용하려면 Redis 6.2 이상과 `phpredis` 또는 `predis`가 구성된 상태여야 합니다.

기본적으로 Pulse는 [설정된 데이터베이스 커넥션](#using-a-different-database)에 엔트리를 직접 저장합니다(HTTP 응답 전송이나 작업 처리 후). 하지만, Redis 인제스트 드라이버를 사용하면 엔트리를 Redis 스트림에 전송할 수 있습니다. 이 기능은 `PULSE_INGEST_DRIVER` 환경 변수로 활성화할 수 있습니다.

```ini
PULSE_INGEST_DRIVER=redis
```

Pulse는 기본적으로 [기본 Redis 커넥션](/docs/redis#configuration)을 사용하지만, `PULSE_REDIS_CONNECTION` 환경 변수로 커넥션을 지정할 수도 있습니다.

```ini
PULSE_REDIS_CONNECTION=pulse
```

Redis 인제스트를 사용할 때는, `pulse:work` 명령어를 실행하여 스트림을 모니터링하고, Redis에서 Pulse의 데이터베이스 테이블로 엔트리를 옮겨야 합니다.

```php
php artisan pulse:work
```

> [!NOTE]
> `pulse:work` 프로세스를 백그라운드에서 영구적으로 실행하려면 Supervisor와 같은 프로세스 모니터를 사용해 Pulse 워커가 중단 없이 실행되도록 해야 합니다.

`pulse:work` 명령도 장기간 실행되므로, 코드베이스가 변경되어도 재시작하지 않으면 반영되지 않습니다. 배포 시에는 반드시 `pulse:restart` 명령으로 안전하게 재시작해야 합니다.

```shell
php artisan pulse:restart
```

> [!NOTE]
> Pulse는 재시작 신호를 [캐시](/docs/cache)에 저장하므로, 이 기능을 사용하려면 애플리케이션에 적절한 캐시 드라이버가 구성되어 있는지 확인해야 합니다.

<a name="sampling"></a>
### 샘플링

기본적으로 Pulse는 애플리케이션에서 발생하는 모든 관련 이벤트를 캡처합니다. 고트래픽 환경에서는 긴 기간 동안의 대시보드 집계를 위해 수백만 행의 데이터가 필요해질 수 있습니다.

이럴 때는 일부 데이터 레코더에서 "샘플링"을 적용할 수 있습니다. 예를 들어, [사용자 요청 레코더](#user-requests-recorder)에서 샘플 비율을 `0.1`로 설정하면 전체 요청 중 약 10%만 기록합니다. 대시보드에는 값이 `~` 기호와 함께 근사치로 표시됩니다.

특정 지표의 수집 엔트리가 많을수록, 정확도를 크게 해치지 않고 더 낮은 샘플 비율을 쓸 수 있습니다.

<a name="trimming"></a>
### 트리밍

Pulse는 대시보드 윈도우에서 벗어난 엔트리를 자동으로 삭제(트리밍)합니다. 트리밍은 데이터 유입 시 로터리 방식(lottery system)으로 동작하며, Pulse [설정 파일](#configuration)에서 동작을 조정할 수 있습니다.

<a name="pulse-exceptions"></a>
### 펄스 예외 처리

Pulse 데이터 캡처 중 데이터베이스 연결 실패 등 예외가 발생하면, Pulse는 애플리케이션에 영향을 주지 않으려 조용히 동작을 중단합니다.

이러한 예외 처리 방식을 커스터마이즈하고 싶다면, `handleExceptionsUsing` 메서드에 클로저를 전달해 추가 처리를 할 수 있습니다.

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

Pulse는 여러분의 애플리케이션 상황에 맞춰 커스텀 카드를 직접 만들어 데이터를 표시할 수 있도록 해줍니다. Pulse는 [Livewire](https://livewire.laravel.com)를 사용하므로, 커스텀 카드를 만들기 전에 [공식 문서](https://livewire.laravel.com/docs)를 참고하는 것이 좋습니다.

<a name="custom-card-components"></a>
### 카드 컴포넌트

Pulse에서 커스텀 카드를 만들려면, 기본적으로 `Card` Livewire 컴포넌트를 확장하고, 대응하는 뷰 파일을 정의해야 합니다.

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

Livewire의 [lazy loading](https://livewire.laravel.com/docs/lazy) 기능을 사용할 때, `Card` 컴포넌트는 `cols`와 `rows` 속성을 반영하는 플레이스홀더를 자동으로 제공합니다.

Pulse 카드의 뷰 파일에서는 Pulse가 제공하는 Blade 컴포넌트를 사용해 일관되고 보기 좋은 UI를 만들 수 있습니다.

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

`$cols`, `$rows`, `$class`, `$expand` 변수는 각각의 Blade 컴포넌트로 전달해, 카드 레이아웃이 대시보드에서 자유롭게 변경되도록 해야 합니다. 또한, `wire:poll.5s=""` 속성을 추가해 카드가 자동 갱신되도록 만들 수 있습니다.

Livewire 컴포넌트와 템플릿을 정의했다면, [대시보드 뷰](#dashboard-customization)에 아래처럼 카드를 추가할 수 있습니다.

```blade
<x-pulse>
    ...

    <livewire:pulse.top-sellers cols="4" />
</x-pulse>
```

> [!NOTE]
> 카드가 패키지로 포함된 경우, `Livewire::component` 메서드를 통해 컴포넌트를 등록해야 합니다.

<a name="custom-card-styling"></a>
### 스타일링

카드에 추가 스타일이 필요할 경우, Pulse에서 제공하는 클래스 및 컴포넌트 외에 다음과 같은 방식으로 커스텀 CSS를 적용할 수 있습니다.

<a name="custom-card-styling-vite"></a>
#### 라라벨 Vite 연동

커스텀 카드가 애플리케이션 코드베이스 내에 위치해 있고, 라라벨의 [Vite 연동](/docs/vite)을 사용한다면, `vite.config.js` 파일에서 해당 카드의 CSS 엔트리포인트를 추가할 수 있습니다.

```js
laravel({
    input: [
        'resources/css/pulse/top-sellers.css',
        // ...
    ],
}),
```

그 후, [대시보드 뷰](#dashboard-customization)에서 `@vite` Blade 지시어를 사용해 해당 CSS를 로드합니다.

```blade
<x-pulse>
    @vite('resources/css/pulse/top-sellers.css')

    ...
</x-pulse>
```

<a name="custom-card-styling-css"></a>
#### CSS 파일 직접 삽입

패키지에 포함된 Pulse 카드 등, 그 외 경우에는 Livewire 컴포넌트에 `css` 메서드를 정의하여 추가 스타일시트 파일 경로를 반환하게 할 수 있습니다.

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

이 카드가 대시보드에 포함될 때, Pulse는 자동으로 해당 파일 내 스타일을 `<style>` 태그로 포함시킵니다. 별도로 `public` 디렉터리에 퍼블리시할 필요가 없습니다.

<a name="custom-card-styling-tailwind"></a>
#### Tailwind CSS

Tailwind CSS를 사용할 때는, 불필요한 CSS 로딩이나 Pulse의 Tailwind 클래스와의 충돌을 방지하기 위해 별도의 Tailwind 설정 파일을 만드는 것이 좋습니다.

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

이후 CSS 엔트리포인트 파일에서 해당 설정 파일을 지정하세요.

```css
@config "../../tailwind.top-sellers.config.js";
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Tailwind의 [important 선택자 전략](https://tailwindcss.com/docs/configuration#selector-strategy)에 맞춰 카드 뷰에 `id`나 `class` 속성을 지정해야 합니다.

```blade
<x-pulse::card id="top-sellers" :cols="$cols" :rows="$rows" class="$class">
    ...
</x-pulse::card>
```

<a name="custom-card-data"></a>
### 데이터 수집 및 집계

커스텀 카드는 어디서든 데이터를 가져오는 것이 가능하지만, Pulse의 강력하고 효율적인 데이터 기록 및 집계 시스템을 활용하는 것이 좋습니다.

<a name="custom-card-data-capture"></a>
#### 엔트리 기록

Pulse에서는 `Pulse::record` 메서드로 "엔트리"를 기록할 수 있습니다.

```php
use Laravel\Pulse\Facades\Pulse;

Pulse::record('user_sale', $user->id, $sale->amount)
    ->sum()
    ->count();
```

`record` 메서드의 첫 번째 인자는 기록하려는 엔트리의 `type`, 두 번째 인자는 집계시 그룹화에 사용할 `key`입니다. 대부분의 집계 방식에서는 하나 이상의 집계할 값을 지정해야 하며, 위 예시에서는 `$sale->amount`가 이에 해당합니다. `.sum()`, `.count()`와 같은 집계 메서드를 체이닝해 미리 집계된 값(버킷)을 효율적으로 저장할 수 있습니다.

사용 가능한 집계 메서드는 아래와 같습니다.

* `avg`
* `count`
* `max`
* `min`
* `sum`

> [!NOTE]
> 패키지에서 인증된 사용자 ID로 집계 데이터를 수집할 때는, 애플리케이션의 [사용자 조회 커스터마이즈](#dashboard-resolving-users)를 반영하기 위해 반드시 `Pulse::resolveAuthenticatedUserId()` 메서드를 사용하세요.

<a name="custom-card-data-retrieval"></a>
#### 집계 데이터 조회

Pulse의 `Card` Livewire 컴포넌트를 확장할 때는, 대시보드에서 보는 기간 동안의 집계 데이터를 `aggregate` 메서드로 조회할 수 있습니다.

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

`aggregate` 메서드는 PHP `stdClass` 객체의 컬렉션을 반환합니다. 각 객체에는 앞서 저장했던 `key`와, 요청한 집계 값(예: `sum`, `count`)이 포함됩니다.

```blade
@foreach ($topSellers as $seller)
    {{ $seller->key }}
    {{ $seller->sum }}
    {{ $seller->count }}
@endforeach
```

Pulse는 주로 미리 집계된 버킷에서 데이터를 읽어오므로, `Pulse::record` 메서드에서 미리 해당 집계를 활성화시켜 두어야 합니다. 가장 오래된 버킷은 대시보드 기간과 일부 겹치지 않을 수 있으므로, Pulse가 해당 엔트리만 추가 집계해 전체 기간의 정확한 값을 반환합니다.

특정 타입에 대한 전체 합계를 조회하려면 `aggregateTotal` 메서드를 사용하면 됩니다. 예를 들어, 아래 코드는 사용자별이 아니라 전체 판매 합계를 가져옵니다.

```php
$total = $this->aggregateTotal('user_sale', 'sum');
```

<a name="custom-card-displaying-users"></a>
#### 사용자 표시

key로 사용자 ID를 저장한 집계 데이터와 함께 작업할 때는, `Pulse::resolveUsers` 메서드로 해당 ID 목록을 사용자 레코드로 변환할 수 있습니다.

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

`find` 메서드는 `name`, `extra`, `avatar` 키가 포함된 객체를 반환하므로, 이 값을 `<x-pulse::user-card>` Blade 컴포넌트에 바로 전달할 수 있습니다.

```blade
<x-pulse::user-card :user="{{ $seller->user }}" :stats="{{ $seller->sum }}" />
```

<a name="custom-recorders"></a>
#### 커스텀 레코더

패키지 저자는 데이터 수집을 설정 가능한 커스텀 레코더 클래스를 제공할 수 있습니다.

레코더는 애플리케이션의 `config/pulse.php` 설정 파일 내 `recorders` 섹션에 등록됩니다.

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

레코더는 `$listen` 속성에 이벤트를 지정해 자동으로 해당 이벤트를 구독하고, Pulse가 레코더의 `record` 메서드를 호출하도록 할 수 있습니다.

```php
<?php

namespace Acme\Recorders;

use Acme\Events\Deployment;
use Illuminate\Support\Facades\Config;
use Laravel\Pulse\Facades\Pulse;

class Deployments
{
    /**
     * The events to listen for.
     *
     * @var array<int, class-string>
     */
    public array $listen = [
        Deployment::class,
    ];

    /**
     * Record the deployment.
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
