# 라라벨 펄스 (Laravel Pulse)

- [소개](#introduction)
- [설치](#installation)
    - [환경설정](#configuration)
- [대시보드](#dashboard)
    - [인가](#dashboard-authorization)
    - [커스터마이징](#dashboard-customization)
    - [사용자 정보 해석하기](#dashboard-resolving-users)
    - [카드](#dashboard-cards)
- [엔트리 수집](#capturing-entries)
    - [레코더](#recorders)
    - [필터링](#filtering)
- [성능](#performance)
    - [다른 데이터베이스 사용하기](#using-a-different-database)
    - [Redis 입력(Ingest)](#ingest)
    - [샘플링](#sampling)
    - [트리밍](#trimming)
    - [Pulse 예외 처리](#pulse-exceptions)
- [커스텀 카드 만들기](#custom-cards)
    - [카드 컴포넌트](#custom-card-components)
    - [스타일링](#custom-card-styling)
    - [데이터 수집 및 집계](#custom-card-data)

<a name="introduction"></a>
## 소개

[Laravel Pulse](https://github.com/laravel/pulse)는 여러분의 애플리케이션의 성능과 사용 현황을 한눈에 파악할 수 있도록 도와주는 툴입니다. Pulse를 사용하면 느린 작업이나 엔드포인트 등 병목 현상을 추적하고, 가장 활발하게 활동하는 사용자를 파악하는 등 다양한 인사이트를 얻을 수 있습니다.

개별 이벤트의 심층 디버깅이 필요하다면 [Laravel Telescope](/docs/11.x/telescope)를 참고해 보시기 바랍니다.

<a name="installation"></a>
## 설치

> [!WARNING]  
> Pulse의 공식 스토리지 구현은 현재 MySQL, MariaDB, PostgreSQL 데이터베이스만 지원합니다. 만약 다른 데이터베이스 엔진을 사용하고 있다면, Pulse 데이터를 위한 별도의 MySQL, MariaDB 또는 PostgreSQL 데이터베이스가 필요합니다.

Composer 패키지 관리자를 사용해서 Pulse를 설치할 수 있습니다.

```sh
composer require laravel/pulse
```

다음으로, `vendor:publish` 아티즌 명령어를 통해 Pulse의 환경설정 및 마이그레이션 파일을 게시해야 합니다.

```shell
php artisan vendor:publish --provider="Laravel\Pulse\PulseServiceProvider"
```

마지막으로, Pulse 데이터를 저장하는 데 필요한 테이블을 생성하기 위해 `migrate` 명령어를 실행해야 합니다.

```shell
php artisan migrate
```

Pulse의 데이터베이스 마이그레이션이 모두 적용되면 `/pulse` 경로를 통해 Pulse 대시보드에 접근할 수 있습니다.

> [!NOTE]  
> Pulse 데이터를 애플리케이션의 기본 데이터베이스가 아닌 별도의 데이터베이스에 저장하고 싶다면, [전용 데이터베이스 연결을 지정](#using-a-different-database)할 수 있습니다.

<a name="configuration"></a>
### 환경설정

Pulse의 다양한 환경설정 옵션은 환경 변수로 제어할 수 있습니다. 사용 가능한 옵션을 확인하거나, 새로운 레코더를 등록하거나, 고급 옵션을 설정하려면 `config/pulse.php` 환경설정 파일을 게시해야 합니다.

```sh
php artisan vendor:publish --tag=pulse-config
```

<a name="dashboard"></a>
## 대시보드

<a name="dashboard-authorization"></a>
### 인가

Pulse 대시보드는 `/pulse` 경로에서 접근할 수 있습니다. 기본적으로 `local` 환경에서만 접근이 가능하므로, 운영 환경에서는 `'viewPulse'` 인가 게이트를 커스터마이징하여 인가 설정을 추가해야 합니다. 이 작업은 애플리케이션의 `app/Providers/AppServiceProvider.php` 파일에서 진행할 수 있습니다.

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
### 커스터마이징

Pulse 대시보드의 카드와 레이아웃은 대시보드 뷰 파일을 게시하여 구성할 수 있습니다. 대시보드 뷰는 `resources/views/vendor/pulse/dashboard.blade.php`로 복사됩니다.

```sh
php artisan vendor:publish --tag=pulse-dashboard
```

Pulse 대시보드는 [Livewire](https://livewire.laravel.com/)를 기반으로 하며, JavaScript 자산을 다시 빌드하지 않고도 카드와 레이아웃을 쉽게 커스터마이징할 수 있습니다.

이 뷰 파일에서 `<x-pulse>` 컴포넌트가 대시보드의 렌더링을 담당하며, 카드들을 위한 그리드 레이아웃을 제공합니다. 만약 대시보드를 화면 전체 너비로 표시하고 싶다면, 이 컴포넌트에 `full-width` 속성을 추가하면 됩니다.

```blade
<x-pulse full-width>
    ...
</x-pulse>
```

기본적으로 `<x-pulse>` 컴포넌트는 12컬럼 그리드를 사용하지만, `cols` 속성을 통해 원하는 컬럼 수로 변경할 수 있습니다.

```blade
<x-pulse cols="16">
    ...
</x-pulse>
```

각 카드는 공간과 위치를 제어할 수 있도록 `cols`와 `rows` 속성을 받을 수 있습니다.

```blade
<livewire:pulse.usage cols="4" rows="2" />
```

대부분의 카드에서는 스크롤 대신 카드 전체 내용을 한 번에 보여주고 싶을 때 `expand` 속성을 사용할 수 있습니다.

```blade
<livewire:pulse.slow-queries expand />
```

<a name="dashboard-resolving-users"></a>
### 사용자 정보 해석하기

사용자 정보를 표시하는 카드(예: 애플리케이션 사용량 카드)의 경우, Pulse는 사용자의 ID만 저장합니다. 대시보드에서 Pulse는 기본 `Authenticatable` 모델에서 `name`과 `email` 필드를 가져와 보여주며, 아바타는 Gravatar 웹 서비스를 통해 표시합니다.

필드와 아바타 이미지는 애플리케이션의 `App\Providers\AppServiceProvider` 클래스에서 `Pulse::user` 메서드를 호출하여 커스터마이즈할 수 있습니다.

`user` 메서드는 표시할 `Authenticatable` 모델을 인자로 받는 클로저를 인수로 받고, `name`, `extra`, `avatar` 정보를 담은 배열을 반환해야 합니다.

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
> 인증된 사용자 정보를 어떻게 수집하고 가져올지 완전히 커스터마이즈하고 싶다면, `Laravel\Pulse\Contracts\ResolvesUsers` 인터페이스를 구현해서 라라벨의 [서비스 컨테이너](/docs/11.x/container#binding-a-singleton)에 바인딩할 수 있습니다.

<a name="dashboard-cards"></a>
### 카드

<a name="servers-card"></a>
#### 서버

`<livewire:pulse.servers />` 카드는 `pulse:check` 명령어를 실행 중인 모든 서버의 시스템 리소스 사용량을 보여줍니다. 시스템 리소스 보고에 관한 자세한 내용은 [servers recorder](#servers-recorder) 문서를 참고하세요.

인프라에서 서버를 교체한 경우, 일정 시간이 지난 후 Pulse 대시보드에서 비활성 서버의 표시를 중지하고 싶을 수도 있습니다. 이럴 때는 `ignore-after` 속성을 사용하면 되며, 이 속성에는 비활성 서버를 대시보드에서 제거할 시간(초 단위) 또는 `1 hour`, `3 days and 1 hour`처럼 상대적인 시간 문자열도 사용할 수 있습니다.

```blade
<livewire:pulse.servers ignore-after="3 hours" />
```

<a name="application-usage-card"></a>
#### 애플리케이션 사용량

`<livewire:pulse.usage />` 카드는 애플리케이션에 요청을 보내거나, 작업을 디스패치하거나, 느린 요청을 경험한 최상위 10명의 사용자 정보를 보여줍니다.

대시보드에서 모든 사용 패턴을 한 번에 확인하고 싶다면, 카드를 여러 번 포함하고 각 카드에 `type` 속성을 지정할 수 있습니다.

```blade
<livewire:pulse.usage type="requests" />
<livewire:pulse.usage type="slow_requests" />
<livewire:pulse.usage type="jobs" />
```

Pulse가 사용자 정보를 어떻게 조회하고 표시하는지 커스터마이즈하는 방법은 [사용자 정보 해석하기](#dashboard-resolving-users) 섹션을 참고해 주세요.

> [!NOTE]  
> 애플리케이션에 요청이나 작업이 많다면, [샘플링](#sampling) 기능을 함께 사용하는 것이 좋습니다. 자세한 내용은 [user requests recorder](#user-requests-recorder), [user jobs recorder](#user-jobs-recorder), [slow jobs recorder](#slow-jobs-recorder) 문서를 확인하세요.

<a name="exceptions-card"></a>
#### 예외

`<livewire:pulse.exceptions />` 카드는 애플리케이션에서 발생한 예외의 빈도와 최근 발생 내역을 보여줍니다. 기본적으로 예외는 예외 클래스와 발생 위치를 기준으로 그룹화됩니다. 더 자세한 내용은 [exceptions recorder](#exceptions-recorder) 문서를 참고하세요.

<a name="queues-card"></a>
#### 큐

`<livewire:pulse.queues />` 카드는 애플리케이션에서 큐된 작업의 처리량, 즉 대기중, 처리중, 완료됨, 반려됨, 실패된 작업 수를 보여줍니다. 자세한 정보는 [queues recorder](#queues-recorder) 문서를 참고하세요.

<a name="slow-requests-card"></a>
#### 느린 요청

`<livewire:pulse.slow-requests />` 카드는 기본 임계값(기본 1,000ms)을 초과하는 모든 들어오는 요청을 표시합니다. 자세한 내용은 [slow requests recorder](#slow-requests-recorder) 문서를 참고하세요.

<a name="slow-jobs-card"></a>
#### 느린 작업

`<livewire:pulse.slow-jobs />` 카드는 대기열에 추가된 작업 중에서 설정된 임계값(기본 1,000ms)을 초과한 작업을 보여줍니다. 자세한 내용은 [slow jobs recorder](#slow-jobs-recorder) 문서를 참고하세요.

<a name="slow-queries-card"></a>
#### 느린 쿼리

`<livewire:pulse.slow-queries />` 카드는 애플리케이션에서 임계값(기본 1,000ms)을 초과한 데이터베이스 쿼리를 표시합니다.

기본적으로 느린 쿼리는 SQL 구문(바인딩 제외)과 발생 위치를 기준으로 그룹화되지만, 만약 발생 위치 캡처 없이 SQL 쿼리만으로 그룹화하고 싶다면, 해당 옵션을 끌 수 있습니다.

매우 큰 SQL 쿼리에 문법 하이라이팅이 적용되어서 렌더링 성능에 영향을 준다면, `without-highlighting` 속성을 추가하여 하이라이팅을 비활성화할 수 있습니다.

```blade
<livewire:pulse.slow-queries without-highlighting />
```

자세한 내용은 [slow queries recorder](#slow-queries-recorder) 문서를 참고하세요.

<a name="slow-outgoing-requests-card"></a>
#### 느린 외부 요청

`<livewire:pulse.slow-outgoing-requests />` 카드는 라라벨의 [HTTP 클라이언트](/docs/11.x/http-client)로 보낸 요청 중 설정된 임계값(기본 1,000ms)을 초과한 아웃바운드(외부) 요청을 보여줍니다.

기본적으로 엔트리는 전체 URL을 기준으로 그룹화됩니다. 다만, 정규식을 이용해 유사한 외부 요청을 정규화하거나 그룹화할 수도 있습니다. 자세한 내용은 [slow outgoing requests recorder](#slow-outgoing-requests-recorder) 문서를 참고하세요.

<a name="cache-card"></a>
#### 캐시

`<livewire:pulse.cache />` 카드는 애플리케이션 전체 및 개별 키별 캐시 적중/미적중 통계를 보여줍니다.

기본적으로 엔트리는 키(key)별로 그룹화되지만, 정규식을 활용해서 유사한 키를 그룹화할 수도 있습니다. 자세한 내용은 [cache interactions recorder](#cache-interactions-recorder) 문서를 참고하세요.

<a name="capturing-entries"></a>
## 엔트리 수집

대부분의 Pulse 레코더는 라라벨에서 발생한 프레임워크 이벤트를 자동으로 감지하여 엔트리를 수집합니다. 그러나 [servers recorder](#servers-recorder)와 일부 써드파티 카드는 정기적으로 정보를 폴링해야 합니다. 이런 카드를 사용하려면 각 애플리케이션 서버에서 `pulse:check` 데몬을 실행해야 합니다.

```php
php artisan pulse:check
```

> [!NOTE]  
> `pulse:check` 프로세스를 백그라운드에서 항상 실행 상태로 유지하려면, Supervisor 같은 프로세스 모니터를 활용해 명령어가 중단되지 않도록 설정해야 합니다.

`pulse:check` 명령어는 장기 실행 프로세스이므로, 코드 변경 사항을 인식하지 못합니다. 배포 과정에서 `pulse:restart` 명령어를 호출하여 해당 프로세스를 정상적으로 재시작해 주어야 합니다.

```sh
php artisan pulse:restart
```

> [!NOTE]  
> Pulse는 [캐시](/docs/11.x/cache)를 사용하여 재시작 신호를 저장하므로, 이 기능을 사용하기 전에 애플리케이션에 캐시 드라이버가 올바르게 설정되어 있는지 반드시 확인하세요.

<a name="recorders"></a>
### 레코더

레코더는 Pulse 데이터베이스에 기록할 엔트리를 애플리케이션에서 수집하는 역할을 합니다. 레코더는 [Pulse 환경설정 파일](#configuration)의 `recorders` 섹션에서 등록 및 설정할 수 있습니다.

<a name="cache-interactions-recorder"></a>
#### 캐시 상호작용

`CacheInteractions` 레코더는 애플리케이션에서 발생한 [캐시](/docs/11.x/cache) 적중 및 미적중 정보를 [캐시 카드](#cache-card)에 표시하기 위해 수집합니다.

샘플링 비율([sample rate](#sampling))과 무시할 키 패턴을 선택적으로 설정할 수 있습니다.

또한, 비슷한 키를 그룹화해서 하나의 엔트리로 표시하도록 그룹 설정을 할 수 있습니다. 예를 들어, 동일한 종류의 데이터를 캐싱하더라도 고유 ID 때문에 여러 키가 생성된다면, 정규식을 사용하여 키의 일부를 치환해 같은 키로 그룹화할 수 있습니다. 설정 파일에 예시가 포함되어 있습니다.

```php
Recorders\CacheInteractions::class => [
    // ...
    'groups' => [
        // '/:\d+/' => ':*',
    ],
],
```

처음 매칭되는 패턴이 사용됩니다. 만약 어떤 패턴도 매칭되지 않으면, 키는 그대로 저장됩니다.

<a name="exceptions-recorder"></a>
#### 예외

`Exceptions` 레코더는 애플리케이션에서 발생한 신고 가능한 예외 정보를 [예외 카드](#exceptions-card)에 표시하기 위해 수집합니다.

샘플링 비율([sample rate](#sampling))과 무시할 예외 패턴을 선택적으로 조정할 수 있습니다. 또한 예외가 발생한 위치를 캡처할지 여부도 설정할 수 있습니다. 캡처된 위치 정보는 Pulse 대시보드에서 예외의 근원지 추적에 도움이 되지만, 동일한 예외가 여러 위치에서 발생할 경우 각각 개별적으로 표시될 수 있습니다.

<a name="queues-recorder"></a>
#### 큐

`Queues` 레코더는 애플리케이션의 큐 정보를 [큐 카드](#queues-card)에 표시하기 위해 수집합니다.

샘플링 비율([sample rate](#sampling))과 무시할 작업 패턴을 선택적으로 조정할 수 있습니다.

<a name="slow-jobs-recorder"></a>
#### 느린 작업

`SlowJobs` 레코더는 애플리케이션에서 발생한 느린 작업 정보를 [느린 작업 카드](#slow-jobs-recorder)에 표시하기 위해 수집합니다.

느린 작업 임계값, 샘플링 비율([sample rate](#sampling)), 무시할 작업 패턴을 각각 조정할 수 있습니다.

특정 작업들이 일반적인 작업보다 오래 걸리는 것이 예상된다면, 작업별로 임계값을 개별 설정할 수 있습니다.

```php
Recorders\SlowJobs::class => [
    // ...
    'threshold' => [
        '#^App\\Jobs\\GenerateYearlyReports$#' => 5000,
        'default' => env('PULSE_SLOW_JOBS_THRESHOLD', 1000),
    ],
],
```

작업 클래스명이 어떤 정규식 패턴에도 매칭되지 않으면 `default` 값이 적용됩니다.

<a name="slow-outgoing-requests-recorder"></a>
#### 느린 외부 요청

`SlowOutgoingRequests` 레코더는 라라벨 [HTTP 클라이언트](/docs/11.x/http-client)를 사용해 임계값을 초과하는 외부 HTTP 요청 정보를 [느린 외부 요청 카드](#slow-outgoing-requests-card)에 표시하기 위해 수집합니다.

느린 외부 요청 임계값, 샘플링 비율([sample rate](#sampling)), 무시할 URL 패턴을 각각 조정할 수 있습니다.

특정 외부 요청이 일반 요청보다 더 오래 걸릴 것으로 예상된다면, 요청별로 임계값을 개별 설정할 수 있습니다.

```php
Recorders\SlowOutgoingRequests::class => [
    // ...
    'threshold' => [
        '#backup.zip$#' => 5000,
        'default' => env('PULSE_SLOW_OUTGOING_REQUESTS_THRESHOLD', 1000),
    ],
],
```

요청 URL이 어떠한 정규식 패턴에도 매칭되지 않으면 `default` 값이 사용됩니다.

또한, URL 경로나 도메인별로 비슷한 요청을 하나의 엔트리로 그룹화할 수 있습니다. 예를 들어, 고유 ID가 포함된 URL 경로나 도메인 단위로 그룹화할 수 있으며, 정규식을 사용해 URL의 일부를 치환하는 방식으로 구성할 수 있습니다. 설정 파일에 여러 예시가 포함되어 있습니다.

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

처음 매칭되는 패턴이 적용되며, 어느 패턴에도 매칭되지 않으면 URL이 그대로 저장됩니다.

<a name="slow-queries-recorder"></a>
#### 느린 쿼리

`SlowQueries` 레코더는 애플리케이션에서 임계값을 초과한 모든 데이터베이스 쿼리를 [느린 쿼리 카드](#slow-queries-card)에 표시하기 위해 수집합니다.

느린 쿼리 임계값, 샘플링 비율([sample rate](#sampling)), 무시할 쿼리 패턴을 각각 선택적으로 조정할 수 있습니다. 또한 쿼리 위치를 캡처할지 여부도 설정할 수 있습니다. 캡처된 위치 정보는 쿼리 발생 위치를 추적하는 데 도움이 되지만, 동일 쿼리가 여러 위치에서 발생하면 각각 개별적으로 표시될 수 있습니다.

특정 쿼리가 일반 쿼리보다 더 오래 걸릴 것으로 예상된다면, 쿼리별로 임계값을 개별적으로 설정할 수 있습니다.

```php
Recorders\SlowQueries::class => [
    // ...
    'threshold' => [
        '#^insert into `yearly_reports`#' => 5000,
        'default' => env('PULSE_SLOW_QUERIES_THRESHOLD', 1000),
    ],
],
```

쿼리 SQL이 어떤 정규식 패턴에도 매칭되지 않으면 `default` 값이 적용됩니다.

<a name="slow-requests-recorder"></a>
#### 느린 요청

`Requests` 레코더는 애플리케이션에 들어온 요청 정보를 [느린 요청 카드](#slow-requests-card)와 [애플리케이션 사용량 카드](#application-usage-card)에 표시하기 위해 수집합니다.

느린 라우트 임계값, 샘플링 비율([sample rate](#sampling)), 무시할 경로를 각각 조정할 수 있습니다.

특정 요청이 일반 요청보다 오래 걸릴 것으로 예상된다면, 요청별로 임계값을 개별적으로 설정할 수 있습니다.

```php
Recorders\SlowRequests::class => [
    // ...
    'threshold' => [
        '#^/admin/#' => 5000,
        'default' => env('PULSE_SLOW_REQUESTS_THRESHOLD', 1000),
    ],
],
```

요청 URL이 어떤 정규식 패턴에도 매칭되지 않으면 `default` 값이 적용됩니다.

<a name="servers-recorder"></a>
#### 서버

`Servers` 레코더는 애플리케이션 서버의 CPU, 메모리, 저장 공간 사용량을 [서버 카드](#servers-card)에 표시하기 위해 수집합니다. 이 레코더는 각 모니터링 대상 서버에서 [`pulse:check` 명령어](#capturing-entries)가 실행 중이어야 합니다.

보고하는 각 서버는 고유 이름을 가져야 하며, 기본적으로 PHP의 `gethostname` 함수 값을 사용합니다. 직접 커스터마이즈하고 싶을 경우 `PULSE_SERVER_NAME` 환경변수를 설정할 수 있습니다.

```env
PULSE_SERVER_NAME=load-balancer
```

Pulse 환경설정 파일에서는 모니터링할 디렉토리도 추가로 커스터마이즈할 수 있습니다.

<a name="user-jobs-recorder"></a>
#### 사용자 작업

`UserJobs` 레코더는 애플리케이션에서 작업을 디스패치한 사용자 정보를 [애플리케이션 사용량 카드](#application-usage-card)에 표시하기 위해 수집합니다.

샘플링 비율([sample rate](#sampling))과 무시할 작업 패턴을 각각 조정할 수 있습니다.

<a name="user-requests-recorder"></a>
#### 사용자 요청

`UserRequests` 레코더는 애플리케이션에 요청을 보낸 사용자 정보를 [애플리케이션 사용량 카드](#application-usage-card)에 표시하기 위해 수집합니다.

샘플링 비율([sample rate](#sampling))과 무시할 URL 패턴을 각각 조정할 수 있습니다.

<a name="filtering"></a>
### 필터링

지금까지 살펴본 것처럼, 상당수 [레코더](#recorders)는 구성 옵션을 통해 특정 값(예: 요청 URL 등)을 기준으로 들어오는 엔트리를 무시하도록 설정할 수 있습니다. 그러나 때로는 현재 인증된 사용자 등 다른 조건으로 레코드를 필터링하고 싶을 수도 있습니다. 이런 경우 Pulse의 `filter` 메서드에 클로저를 전달하면 됩니다. 일반적으로 `filter` 메서드는 애플리케이션의 `AppServiceProvider` 클래스의 `boot` 메서드 안에서 호출하는 것이 좋습니다.

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

Pulse는 별도의 인프라를 추가 도입하지 않고 기존 애플리케이션에 바로 도입하여 사용할 수 있도록 설계되었습니다. 다만, 높은 트래픽의 애플리케이션에서는 Pulse가 성능에 미치는 영향을 최소화할 수 있는 여러 방법이 준비되어 있습니다.

<a name="using-a-different-database"></a>
### 다른 데이터베이스 사용하기

고트래픽 애플리케이션의 경우, Pulse 전용 데이터베이스 연결을 사용해서 애플리케이션의 기본 데이터베이스에 부담을 주지 않도록 할 수 있습니다.

Pulse가 사용할 [데이터베이스 연결](/docs/11.x/database#configuration)은 `PULSE_DB_CONNECTION` 환경변수를 설정하여 지정할 수 있습니다.

```env
PULSE_DB_CONNECTION=pulse
```

<a name="ingest"></a>
### Redis 입력(Ingest)

> [!WARNING]  
> Redis 입력 기능을 사용하려면 Redis 6.2 이상과 `phpredis` 또는 `predis`가 라라벨에서 설정된 Redis 클라이언트 드라이버로 필요합니다.

Pulse는 기본적으로 [설정된 데이터베이스 연결](#using-a-different-database)에 HTTP 응답 전송 후나 작업이 처리된 후 직접 엔트리를 저장합니다. 그러나, Pulse의 Redis ingest 드라이버를 사용하면 엔트리를 Redis 스트림에 먼저 보낼 수 있습니다. 이 기능은 환경 변수 `PULSE_INGEST_DRIVER`를 설정하여 활성화할 수 있습니다.

```
PULSE_INGEST_DRIVER=redis
```

기본적으로 Pulse는 [Redis 연결](/docs/11.x/redis#configuration)도 기본 연결을 사용하지만, `PULSE_REDIS_CONNECTION` 환경변수로 별도 지정할 수 있습니다.

```
PULSE_REDIS_CONNECTION=pulse
```

Redis ingest를 사용할 때는 스트림을 모니터링하고 Redis에서 Pulse 데이터베이스 테이블로 엔트리를 이동시키는 `pulse:work` 명령어를 실행해야 합니다.

```php
php artisan pulse:work
```

> [!NOTE]  
> `pulse:work` 프로세스를 백그라운드에서 항상 실행 상태로 유지하려면, Supervisor 등 프로세스 모니터링 툴을 통해 Pulse worker가 중단되지 않도록 관리해야 합니다.

`pulse:work` 역시 장기 실행 프로세스이므로, 코드 변경을 인식하지 못합니다. 배포할 때마다 `pulse:restart` 명령어를 호출해 해당 프로세스를 정상적으로 재시작해야 합니다.

```sh
php artisan pulse:restart
```

> [!NOTE]  
> Pulse는 [캐시](/docs/11.x/cache)를 사용해서 재시작 신호를 저장하므로, 이 기능 사용 전 애플리케이션에 캐시 드라이버가 제대로 설정되어 있는지 반드시 확인해야 합니다.

<a name="sampling"></a>
### 샘플링

기본적으로 Pulse는 애플리케이션 내 발생하는 모든 관련 이벤트를 빠짐없이 기록합니다. 하지만 고트래픽 환경에서는, 특히 대시보드에서 긴 기간 동안 집계할 경우 수백만 건의 데이터베이스 행을 다뤄야 할 수 있습니다.

이럴 때, Pulse의 일부 데이터 레코더에 "샘플링"을 활성화해 필요한 데이터만 일정 비율로 수집할 수 있습니다. 예를 들어, [`User Requests`](#user-requests-recorder) 레코더의 샘플 비율을 `0.1`로 설정하면, 실제 요청의 약 10%만 기록하게 됩니다. 대시보드에서 해당 값들은 대략치임을 의미하는 `~` 표시와 함께 업스케일되어 보여집니다.

일반적으로, 특정 지표에 대해 수집된 데이터가 많을수록 샘플 비율을 더욱 낮추더라도 정확성에 큰 영향이 없습니다.

<a name="trimming"></a>
### 트리밍

Pulse는 대시보드에서 표시되는 기간을 벗어난 데이터 엔트리를 자동으로 정리합니다. 이 트리밍 작업은 데이터가 유입될 때마다 복권 기반(lottery) 방식으로 수행되며, Pulse [환경설정 파일](#configuration)에서 해당 방식을 커스터마이즈할 수 있습니다.

<a name="pulse-exceptions"></a>
### Pulse 예외 처리

만약 Pulse 데이터 수집 중 스토리지 데이터베이스 연결 실패 등이 발생하여 예외가 던져지면, Pulse는 애플리케이션에 영향을 끼치지 않도록 해당 오류를 조용히 무시합니다.

이러한 예외 처리를 커스터마이즈하고 싶다면 `handleExceptionsUsing` 메서드에 클로저를 전달할 수 있습니다.

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
## 커스텀 카드 만들기

Pulse는 여러분의 애플리케이션에 맞는 데이터를 표시할 수 있도록 커스텀 카드를 제작할 수 있습니다. Pulse는 [Livewire](https://livewire.laravel.com)를 사용하므로, 직접 커스텀 카드를 만들기 전에 [Livewire 문서](https://livewire.laravel.com/docs)를 참고하시는 것이 좋습니다.

<a name="custom-card-components"></a>
### 카드 컴포넌트

라라벨 Pulse에서 커스텀 카드를 만들려면 우선 기본 `Card` Livewire 컴포넌트를 확장하고, 뷰 파일을 정의해야 합니다.

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

Livewire의 [lazy loading](https://livewire.laravel.com/docs/lazy) 기능을 사용할 때, `Card` 컴포넌트는 `cols` 및 `rows` 속성 값을 반영하는 플레이스홀더도 자동으로 제공합니다.

Pulse 카드의 뷰 파일을 작성할 때는 Pulse에서 제공하는 Blade 컴포넌트를 활용하면 일관된 스타일과 사용자 경험을 쉽게 구현할 수 있습니다.

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

`$cols`, `$rows`, `$class`, `$expand`와 같은 변수는 각각 Blade 컴포넌트에 전달하여 카드 레이아웃을 대시보드 뷰에서 커스터마이징할 수 있게 해야 합니다. 또한, 카드가 주기적으로 자동 업데이트되도록 `wire:poll.5s=""` 속성을 뷰에 포함하는 것도 추천드립니다.

Livewire 컴포넌트와 템플릿을 정의한 뒤에는, [대시보드 뷰](#dashboard-customization) 내에서 아래와 같이 카드를 포함할 수 있습니다.

```blade
<x-pulse>
    ...

    <livewire:pulse.top-sellers cols="4" />
</x-pulse>
```

> [!NOTE]  
> 만약 카드가 패키지에서 제공된다면, `Livewire::component` 메서드로 컴포넌트를 Livewire에 등록해야 합니다.

<a name="custom-card-styling"></a>

### 스타일링

여러분의 카드가 Pulse에서 제공하는 클래스 및 컴포넌트 이상의 추가 스타일링이 필요하다면, 카드에 커스텀 CSS를 적용하는 몇 가지 방법이 있습니다.

<a name="custom-card-styling-vite"></a>
#### 라라벨 Vite 통합

커스텀 카드가 애플리케이션 코드베이스 내에 위치해 있고, 라라벨의 [Vite 통합](/docs/11.x/vite)을 사용 중이라면, 카드 전용 CSS 엔트리포인트를 추가하도록 `vite.config.js` 파일을 수정할 수 있습니다.

```js
laravel({
    input: [
        'resources/css/pulse/top-sellers.css',
        // ...
    ],
}),
```

이제 [대시보드 뷰](#dashboard-customization)에서 `@vite` Blade 디렉티브를 사용해 카드의 CSS 엔트리포인트를 명시할 수 있습니다.

```blade
<x-pulse>
    @vite('resources/css/pulse/top-sellers.css')

    ...
</x-pulse>
```

<a name="custom-card-styling-css"></a>
#### CSS 파일

Pulse 카드가 패키지 내에 포함되어 있는 등 다른 사용 사례의 경우, Livewire 컴포넌트에서 CSS 파일 경로를 반환하는 `css` 메서드를 정의해 Pulse가 추가 스타일시트를 로드하도록 할 수 있습니다.

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

이 카드가 대시보드에 포함될 경우, Pulse는 해당 파일의 내용을 `<style>` 태그 내에 자동으로 포함하므로, 별도로 `public` 디렉터리에 퍼블리시할 필요가 없습니다.

<a name="custom-card-styling-tailwind"></a>
#### Tailwind CSS

Tailwind CSS를 사용할 때는 불필요한 CSS가 로딩되거나 Pulse의 Tailwind 클래스와 충돌이 발생하지 않도록, 전용 Tailwind 구성 파일을 생성하는 것이 좋습니다.

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

이제 CSS 엔트리포인트 파일에서 해당 구성 파일을 지정할 수 있습니다.

```css
@config "../../tailwind.top-sellers.config.js";
@tailwind base;
@tailwind components;
@tailwind utilities;
```

그리고 카드 뷰 파일에서 Tailwind의 [`important` 선택자 전략](https://tailwindcss.com/docs/configuration#selector-strategy)에 전달한 셀렉터와 일치하는 `id` 혹은 `class` 속성을 추가해야 합니다.

```blade
<x-pulse::card id="top-sellers" :cols="$cols" :rows="$rows" class="$class">
    ...
</x-pulse::card>
```

<a name="custom-card-data"></a>
### 데이터 수집과 집계

커스텀 카드는 원하는 곳 어디에서든 데이터를 불러오고 출력할 수 있습니다. 하지만 Pulse의 강력하고 효율적인 데이터 기록 및 집계 시스템을 활용할 수도 있습니다.

<a name="custom-card-data-capture"></a>
#### 엔트리 기록하기

Pulse에서는 `Pulse::record` 메서드를 사용해서 "엔트리"를 기록할 수 있습니다.

```php
use Laravel\Pulse\Facades\Pulse;

Pulse::record('user_sale', $user->id, $sale->amount)
    ->sum()
    ->count();
```

`record` 메서드의 첫 번째 인수는 기록할 엔트리의 `type`이며, 두 번째 인수는 집계된 데이터가 그룹화될 기준이 되는 `key`입니다. 대부분의 집계 메서드에서는 함께 집계할 `value`를 명시적으로 지정해야 합니다. 위 예제에서 집계될 값은 `$sale->amount`입니다. 이후 하나 이상의 집계 메서드(`sum` 등)를 연달아 호출해 Pulse가 효율적인 집계 저장소인 "버킷"에 미리 집계된 값을 기록하도록 할 수 있습니다.

사용 가능한 집계 메서드는 다음과 같습니다.

* `avg`
* `count`
* `max`
* `min`
* `sum`

> [!NOTE]  
> 현재 인증된 사용자 ID를 기록하는 카드 패키지를 만들 때는 `Pulse::resolveAuthenticatedUserId()` 메서드를 사용하는 것이 좋습니다. 이 메서드는 애플리케이션에서 [사용자 리졸버를 커스터마이즈](#dashboard-resolving-users)한 경우에도 정상적으로 동작합니다.

<a name="custom-card-data-retrieval"></a>
#### 집계 데이터 조회하기

Pulse의 `Card` Livewire 컴포넌트를 확장하는 경우, 대시보드에서 보고 있는 기간에 대한 집계 데이터를 `aggregate` 메서드로 조회할 수 있습니다.

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

`aggregate` 메서드는 PHP의 `stdClass` 객체로 구성된 컬렉션을 반환합니다. 각 객체에는 앞서 기록한 `key` 속성과, 지정한 집계별로 키가 추가됩니다.

```
@foreach ($topSellers as $seller)
    {{ $seller->key }}
    {{ $seller->sum }}
    {{ $seller->count }}
@endforeach
```

Pulse는 주로 미리 집계해둔 버킷 데이터에서 값을 조회하므로, 집계 값을 반드시 사전에 `Pulse::record`로 기록해 두어야 합니다. 가장 오래된 집계 버킷 일부는 기간을 벗어날 수 있으므로 Pulse는 기간 전체에 대한 정확한 값을 위해 가장 오래된 엔트리들을 추가로 집계해서 누락 없이 처리합니다. 이렇게 하면 매번 전체 기간의 데이터를 집계하지 않고도 정확한 집계값을 빠르게 제공할 수 있습니다.

특정 타입의 전체 합계를 조회하려면 `aggregateTotal` 메서드를 사용하세요. 예를 들어, 아래와 같이 하면 전체 사용자 판매 합계를 그룹 없이 가져올 수 있습니다.

```php
$total = $this->aggregateTotal('user_sale', 'sum');
```

<a name="custom-card-displaying-users"></a>
#### 사용자 정보 표시하기

key로 사용자 ID를 기록한 집계값이 있을 때는, `Pulse::resolveUsers` 메서드로 해당 key들을 실제 사용자 레코드로 변환할 수 있습니다.

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

`find` 메서드는 `name`, `extra`, `avatar` 키를 포함하는 객체를 반환합니다. 이 객체는 `<x-pulse::user-card>` Blade 컴포넌트에 바로 전달하여 사용자 정보를 표시할 수 있습니다.

```blade
<x-pulse::user-card :user="{{ $seller->user }}" :stats="{{ $seller->sum }}" />
```

<a name="custom-recorders"></a>
#### 커스텀 레코더

패키지 제작자는 레코더 클래스를 제공하여 사용자가 데이터 기록 방식을 구성할 수 있도록 할 수 있습니다.

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

레코더는 `$listen` 속성을 지정해 이벤트를 감지할 수 있습니다. Pulse가 자동으로 해당 리스너를 등록하고, 레코더의 `record` 메서드를 호출합니다.

```php
<?php

namespace Acme\Recorders;

use Acme\Events\Deployment;
use Illuminate\Support\Facades\Config;
use Laravel\Pulse\Facades\Pulse;

class Deployments
{
    /**
     * 감지할 이벤트 목록.
     *
     * @var array<int, class-string>
     */
    public array $listen = [
        Deployment::class,
    ];

    /**
     * 배포 이벤트 기록.
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