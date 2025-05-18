# 라라벨 펄스 (Laravel Pulse)

- [소개](#introduction)
- [설치](#installation)
    - [환경설정](#configuration)
- [대시보드](#dashboard)
    - [인가](#dashboard-authorization)
    - [커스터마이즈](#dashboard-customization)
    - [사용자 정보 해석](#dashboard-resolving-users)
    - [카드](#dashboard-cards)
- [엔트리 캡처](#capturing-entries)
    - [레코더](#recorders)
    - [필터링](#filtering)
- [성능 최적화](#performance)
    - [별도 데이터베이스 사용](#using-a-different-database)
    - [Redis Ingest](#ingest)
    - [샘플링](#sampling)
    - [트리밍](#trimming)
    - [Pulse 예외 처리](#pulse-exceptions)
- [커스텀 카드](#custom-cards)
    - [카드 컴포넌트](#custom-card-components)
    - [스타일링](#custom-card-styling)
    - [데이터 캡처 및 집계](#custom-card-data)

<a name="introduction"></a>
## 소개

[라라벨 Pulse](https://github.com/laravel/pulse)는 애플리케이션의 성능과 사용 현황을 한눈에 파악할 수 있는 인사이트를 제공합니다. Pulse를 이용하면 느린 작업이나 엔드포인트와 같은 병목 지점을 추적하거나, 가장 활발하게 활동하는 사용자를 확인하는 등 다양한 모니터링이 가능합니다.

개별 이벤트에 대한 심도 깊은 디버깅이 필요하다면 [라라벨 Telescope](/docs/10.x/telescope)를 참고하시기 바랍니다.

<a name="installation"></a>
## 설치

> [!WARNING]
> Pulse의 기본 저장소 구현은 현재 MySQL 또는 PostgreSQL 데이터베이스가 필요합니다. 다른 데이터베이스 엔진을 사용 중이라면, Pulse 데이터를 위한 별도의 MySQL 또는 PostgreSQL 데이터베이스가 필요합니다.

Pulse는 현재 베타 단계이므로, 베타 패키지 릴리스 설치를 허용하도록 애플리케이션의 `composer.json` 파일을 다음과 같이 조정해야 할 수 있습니다.

```json
"minimum-stability": "beta",
"prefer-stable": true
```

그 후 Composer 패키지 관리자를 사용해서 Pulse를 라라벨 프로젝트에 설치할 수 있습니다.

```sh
composer require laravel/pulse
```

다음으로, `vendor:publish` Artisan 명령어를 통해 Pulse 환경설정 파일과 마이그레이션 파일을 퍼블리시해야 합니다.

```shell
php artisan vendor:publish --provider="Laravel\Pulse\PulseServiceProvider"
```

마지막으로, Pulse 데이터를 저장하는 데 사용되는 테이블을 생성하기 위해 `migrate` 명령어를 실행해야 합니다.

```shell
php artisan migrate
```

Pulse용 데이터베이스 마이그레이션을 실행했다면 `/pulse` 경로를 통해 Pulse 대시보드에 접근할 수 있습니다.

> [!NOTE]
> Pulse 데이터를 애플리케이션의 기본 데이터베이스가 아닌 별도의 저장소에 저장하고 싶다면, [전용 데이터베이스 연결을 지정](#using-a-different-database)할 수 있습니다.

<a name="configuration"></a>
### 환경설정

Pulse에서 제공하는 많은 설정 옵션은 환경 변수로 제어할 수 있습니다. 사용 가능한 옵션을 확인하거나 새로운 레코더를 등록하거나 고급 옵션을 설정하려면, `config/pulse.php` 환경설정 파일을 퍼블리시하면 됩니다.

```sh
php artisan vendor:publish --tag=pulse-config
```

<a name="dashboard"></a>
## 대시보드

<a name="dashboard-authorization"></a>
### 인가

Pulse 대시보드는 `/pulse` 경로를 통해 접근할 수 있습니다. 기본적으로는 `local` 환경에서만 접근이 허용되어 있으니, 운영 환경에서 사용하려면 `'viewPulse'` 인가 게이트를 커스터마이즈해야 합니다. 이 작업은 애플리케이션의 `app/Providers/AuthServiceProvider.php` 파일에서 다음과 같이 할 수 있습니다.

```php
use App\Models\User;
use Illuminate\Support\Facades\Gate;

/**
 * Register any authentication / authorization services.
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

Pulse 대시보드의 카드와 레이아웃은 대시보드 뷰를 퍼블리시하여 직접 변경할 수 있습니다. 이 뷰 파일은 `resources/views/vendor/pulse/dashboard.blade.php` 경로에 생성됩니다.

```sh
php artisan vendor:publish --tag=pulse-dashboard
```

대시보드는 [Livewire](https://livewire.laravel.com/)로 동작하며, JavaScript 자산을 다시 빌드하지 않고도 카드와 레이아웃을 자유롭게 커스터마이즈할 수 있습니다.

해당 파일에서 `<x-pulse>` 컴포넌트가 대시보드 렌더링을 담당하며, 카드에 대한 그리드 레이아웃을 제공합니다. 대시보드 영역을 화면 전체 너비로 확장하고 싶다면 `full-width` prop을 추가하면 됩니다.

```blade
<x-pulse full-width>
    ...
</x-pulse>
```

기본적으로 `<x-pulse>` 컴포넌트는 12 컬럼의 그리드를 생성하지만, `cols` prop을 사용해 컬럼 수를 조정할 수 있습니다.

```blade
<x-pulse cols="16">
    ...
</x-pulse>
```

각 카드에서는 `cols`와 `rows` prop을 받아 카드의 크기와 위치를 제어할 수 있습니다.

```blade
<livewire:pulse.usage cols="4" rows="2" />
```

대부분의 카드는 `expand` prop을 지원하여, 스크롤 없이 전체 카드를 표시할 수 있도록 할 수 있습니다.

```blade
<livewire:pulse.slow-queries expand />
```

<a name="dashboard-resolving-users"></a>
### 사용자 정보 해석

사용자 정보를 보여주는 카드(예: "애플리케이션 사용 현황" 카드)에서는 Pulse가 기본적으로 사용자 ID만 기록합니다. 대시보드를 렌더링할 때는 기본 `Authenticatable` 모델에서 `name`과 `email` 필드를 조회하여 Gravatar 웹서비스를 활용해 아바타를 표시합니다.

필드나 아바타 경로를 직접 커스터마이즈하려면, 애플리케이션의 `App\Providers\AppServiceProvider` 클래스에서 `Pulse::user` 메서드를 사용하여 설정할 수 있습니다.

`user` 메서드는 클로저를 인자로 받으며, 표시할 `Authenticatable` 모델을 받아 `name`, `extra`, `avatar` 정보를 가진 배열을 반환해야 합니다.

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
> 인증된 사용자가 캡처/조회되는 방식을 완전히 커스터마이즈하려면, `Laravel\Pulse\Contracts\ResolvesUsers` 인터페이스를 구현하고 라라벨의 [서비스 컨테이너](/docs/10.x/container#binding-a-singleton)에 바인딩하면 됩니다.

<a name="dashboard-cards"></a>
### 카드

<a name="servers-card"></a>
#### 서버

`<livewire:pulse.servers />` 카드는 `pulse:check` 명령어를 실행하는 모든 서버의 시스템 리소스 사용량을 표시합니다. 시스템 리소스 리포팅에 대한 자세한 내용은 [서버 레코더](#servers-recorder) 문서를 참고하세요.

<a name="application-usage-card"></a>
#### 애플리케이션 사용 현황

`<livewire:pulse.usage />` 카드는 애플리케이션에 요청을 보내거나, 작업을 디스패치하거나, 느린 요청을 경험하고 있는 상위 10명의 사용자를 보여줍니다.

화면에서 여러 사용량 메트릭을 동시에 보고 싶다면 카드를 여러 번 지정하면서 `type` 속성을 다르게 설정하여 사용할 수 있습니다.

```blade
<livewire:pulse.usage type="requests" />
<livewire:pulse.usage type="slow_requests" />
<livewire:pulse.usage type="jobs" />
```

Pulse가 사용자 정보를 어떻게 조회 및 표시하는지 커스터마이즈하는 방법은 [사용자 정보 해석](#dashboard-resolving-users) 문서를 참고하세요.

> [!NOTE]
> 애플리케이션에 많은 요청이 들어오거나 작업이 다수 발생하는 경우, [샘플링](#sampling) 기능을 활성화하는 것이 좋습니다. 자세한 내용은 [사용자 요청 레코더](#user-requests-recorder), [사용자 작업 레코더](#user-jobs-recorder), [느린 작업 레코더](#slow-jobs-recorder) 문서를 참고하세요.

<a name="exceptions-card"></a>
#### 예외

`<livewire:pulse.exceptions />` 카드는 애플리케이션에서 발생한 예외의 빈도와 최근 발생 시점을 시각화합니다. 기본적으로 예외는 예외 클래스와 발생 위치 기준으로 그룹화됩니다. 자세한 내용은 [예외 레코더](#exceptions-recorder) 문서를 참고하세요.

<a name="queues-card"></a>
#### 큐

`<livewire:pulse.queues />` 카드는 애플리케이션의 큐 처리량(대기 중, 처리 중, 완료, 릴리즈, 실패 작업 수 등)을 시각화합니다. 자세한 내용은 [큐 레코더](#queues-recorder) 문서를 참고하세요.

<a name="slow-requests-card"></a>
#### 느린 요청

`<livewire:pulse.slow-requests />` 카드는 설정된 임계치를 초과하는(기본값 1,000ms) 애플리케이션으로 들어오는 요청들을 보여줍니다. 자세한 내용은 [느린 요청 레코더](#slow-requests-recorder) 문서를 참고하세요.

<a name="slow-jobs-card"></a>
#### 느린 작업

`<livewire:pulse.slow-jobs />` 카드는 설정된 임계치를 초과하는(기본값 1,000ms) 큐 작업을 보여줍니다. 자세한 내용은 [느린 작업 레코더](#slow-jobs-recorder) 문서를 참고하세요.

<a name="slow-queries-card"></a>
#### 느린 쿼리

`<livewire:pulse.slow-queries />` 카드는 설정된 임계치(기본 1,000ms)를 초과하는 데이터베이스 쿼리를 보여줍니다.

기본적으로 느린 쿼리는 SQL 구문(바인딩 제외)과 쿼리가 발생한 위치를 기준으로 그룹화되지만, 쿼리 위치를 캡처하지 않도록 설정하여 SQL 쿼리만으로 그룹화할 수도 있습니다.

자세한 내용은 [느린 쿼리 레코더](#slow-queries-recorder) 문서를 참고하세요.

<a name="slow-outgoing-requests-card"></a>
#### 느린 외부 요청

`<livewire:pulse.slow-outgoing-requests />` 카드는 라라벨의 [HTTP 클라이언트](/docs/10.x/http-client)로 전송된 외부 요청 중, 설정된 임계치(기본 1,000ms)를 초과하는 요청을 보여줍니다.

기본적으로 전체 URL 기준으로 그룹화됩니다. 그러나 필요하다면 정규식을 사용해 유사한 외부 요청을 그룹화하거나 정규화할 수 있습니다. 자세한 내용은 [느린 외부 요청 레코더](#slow-outgoing-requests-recorder) 문서를 참고하세요.

<a name="cache-card"></a>
#### 캐시

`<livewire:pulse.cache />` 카드는 애플리케이션의 캐시 히트/미스 통계를 전역 및 각 키별로 보여줍니다.

기본적으로 키별로 그룹화되지만, 정규식을 이용해 유사한 키끼리 그룹화하거나 정규화할 수 있습니다. 자세한 내용은 [캐시 상호작용 레코더](#cache-interactions-recorder) 문서를 참고하세요.

<a name="capturing-entries"></a>
## 엔트리 캡처

대부분의 Pulse 레코더는 라라벨에서 발생하는 프레임워크 이벤트를 기반으로 자동으로 엔트리를 수집합니다. 그러나 [서버 레코더](#servers-recorder) 및 일부 서드파티 카드는 주기적으로 상태를 폴링해야 합니다. 이러한 카드를 사용하려면 각 애플리케이션 서버에서 `pulse:check` 데몬 프로세스를 실행해야 합니다.

```php
php artisan pulse:check
```

> [!NOTE]
> `pulse:check` 프로세스를 항상 백그라운드에서 실행하려면 Supervisor와 같은 프로세스 모니터를 사용하여 명령어가 멈추지 않도록 해야 합니다.

`pulse:check` 명령은 장시간 실행되는 프로세스이므로, 코드가 변경되면 명령어를 재시작해야만 변경 내용을 반영합니다. 따라서 배포 과정 중에 `pulse:restart` 명령어로 안전하게 재시작해야 합니다.

```sh
php artisan pulse:restart
```

> [!NOTE]
> Pulse는 [캐시](/docs/10.x/cache)를 사용해 재시작 신호를 저장하므로, 이 기능을 사용하기 전에 캐시 드라이버가 정상적으로 설정되어 있는지 확인해야 합니다.

<a name="recorders"></a>
### 레코더

레코더는 애플리케이션에서 발생하는 엔트리를 캡처하여 Pulse 데이터베이스에 기록하는 역할을 합니다. 레코더는 [Pulse 환경설정 파일](#configuration)의 `recorders` 항목에 등록하고 설정합니다.

<a name="cache-interactions-recorder"></a>
#### 캐시 상호작용

`CacheInteractions` 레코더는 애플리케이션에서 발생하는 [캐시](/docs/10.x/cache) 히트 및 미스 정보를 수집하여 [캐시 카드](#cache-card)에 표시합니다.

[샘플률](#sampling) 및 무시할 키 패턴을 옵션으로 설정할 수 있습니다.

또한, 비슷한 키를 한 엔트리로 그룹화할 수 있습니다. 예를 들어, 동일한 정보 유형을 캐싱하는 키에서 고유 ID 부분만 제거하고 싶을 수 있습니다. 그룹화는 정규식을 사용하여 키의 일부를 "찾아-바꾸기" 방식으로 구성합니다. 설정 파일에는 예시가 포함되어 있습니다.

```php
Recorders\CacheInteractions::class => [
    // ...
    'groups' => [
        // '/:\d+/' => ':*',
    ],
],
```

가장 먼저 매칭되는 패턴이 사용됩니다. 어떤 패턴도 매칭되지 않으면 해당 키는 그대로 캡처됩니다.

<a name="exceptions-recorder"></a>
#### 예외

`Exceptions` 레코더는 애플리케이션에서 발생하는 보고 가능한 예외 정보를 수집하여 [예외 카드](#exceptions-card)에 표시합니다.

[샘플률](#sampling), 무시할 예외 패턴, 예외 발생 위치 캡처 여부 등을 옵션으로 설정할 수 있습니다. 위치를 캡처할 경우 Pulse 대시보드에서 예외의 발생 원인을 추적하는 데 도움이 됩니다. 단, 동일 예외가 여러 위치에서 발생한다면 각각의 고유 위치마다 별도로 표시됩니다.

<a name="queues-recorder"></a>
#### 큐

`Queues` 레코더는 애플리케이션의 큐 정보를 수집하여 [큐 카드](#queues-card)에 표시합니다.

[샘플률](#sampling) 및 무시할 작업(job) 패턴을 옵션으로 설정할 수 있습니다.

<a name="slow-jobs-recorder"></a>
#### 느린 작업

`SlowJobs` 레코더는 애플리케이션에서 발생한 느린 작업 정보를 수집하여 [느린 작업 카드](#slow-jobs-recorder)에 표시합니다.

느린 작업 임계치, [샘플률](#sampling), 무시할 작업 패턴을 옵션으로 설정할 수 있습니다.

<a name="slow-outgoing-requests-recorder"></a>
#### 느린 외부 요청

`SlowOutgoingRequests` 레코더는 라라벨의 [HTTP 클라이언트](/docs/10.x/http-client)를 이용해 전송된 외부 HTTP 요청 중, 임계치를 초과하는 요청 정보를 수집하여 [느린 외부 요청 카드](#slow-outgoing-requests-card)에 표시합니다.

느린 외부 요청 임계치, [샘플률](#sampling), 무시할 URL 패턴을 옵션으로 설정할 수 있습니다.

또한 유사한 URL을 하나의 엔트리로 그룹화하는 것도 가능합니다. 예를 들어, URL 내의 고유 ID 부분만 제거하거나 도메인별로만 그룹화할 수 있습니다. 그룹화는 정규식을 사용하여 처리하며, 설정 파일에 여러 예시가 포함되어 있습니다.

```php
Recorders\OutgoingRequests::class => [
    // ...
    'groups' => [
        // '#^https://api\.github\.com/repos/.*$#' => 'api.github.com/repos/*',
        // '#^https?://([^/]*).*$#' => '\1',
        // '#/\d+#' => '/*',
    ],
],
```

가장 먼저 매칭되는 패턴이 적용됩니다. 매칭되는 패턴이 없다면 URL은 그대로 캡처됩니다.

<a name="slow-queries-recorder"></a>
#### 느린 쿼리

`SlowQueries` 레코더는 임계치를 초과한 데이터베이스 쿼리 정보를 수집하여 [느린 쿼리 카드](#slow-queries-card)에 표시합니다.

느린 쿼리 임계치, [샘플률](#sampling), 무시할 쿼리 패턴, 쿼리 위치 캡처 여부 등을 설정할 수 있습니다. 위치 정보는 쿼리의 발생 원인을 추적하는 데 도움이 됩니다. 단, 동일 쿼리가 여러 위치에서 실행된다면, 각 위치별로 여러 번 표시됩니다.

<a name="slow-requests-recorder"></a>
#### 느린 요청

`Requests` 레코더는 애플리케이션에 들어온 요청 정보를 수집하여 [느린 요청 카드](#slow-requests-card), [애플리케이션 사용 현황 카드](#application-usage-card)에 표시합니다.

느린 라우트 임계치, [샘플률](#sampling), 무시할 경로 등을 옵션으로 설정할 수 있습니다.

<a name="servers-recorder"></a>
#### 서버

`Servers` 레코더는 애플리케이션이 동작하는 서버의 CPU, 메모리, 저장소 사용량을 수집하여 [서버 카드](#servers-card)에 표시합니다. 이 레코더는 [pulse:check 명령어 실행](#capturing-entries)이 필요합니다.

각 서버마다 고유한 이름이 지정되어야 하며, 기본적으로는 PHP의 `gethostname` 함수 값을 사용합니다. 이름을 직접 지정하려면 `PULSE_SERVER_NAME` 환경변수를 설정하면 됩니다.

```env
PULSE_SERVER_NAME=load-balancer
```

Pulse 설정 파일에서 모니터링할 디렉터리도 커스터마이즈할 수 있습니다.

<a name="user-jobs-recorder"></a>
#### 사용자 작업

`UserJobs` 레코더는 애플리케이션에서 사용자가 디스패치한 작업 정보를 수집하여 [애플리케이션 사용 현황 카드](#application-usage-card)에 표시합니다.

[샘플률](#sampling), 무시할 작업 패턴을 옵션으로 설정할 수 있습니다.

<a name="user-requests-recorder"></a>
#### 사용자 요청

`UserRequests` 레코더는 애플리케이션에 요청을 보낸 사용자 정보를 수집하여 [애플리케이션 사용 현황 카드](#application-usage-card)에 표시합니다.

[샘플률](#sampling), 무시할 작업 패턴을 옵션으로 설정할 수 있습니다.

<a name="filtering"></a>
### 필터링

앞서 본 것처럼, 많은 [레코더](#recorders)는 설정을 통해 특정 값(예: 요청 URL 등)에 따라 캡처를 "무시"할 수 있게 해줍니다. 하지만, 때때로 인증된 사용자 등 추가적인 조건으로 기록을 필터링하고 싶을 수 있습니다. 이럴 때는 Pulse의 `filter` 메서드에 클로저를 전달하여 구현할 수 있습니다. 일반적으로 애플리케이션의 `AppServiceProvider`의 `boot` 메서드에서 필터를 등록합니다.

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
## 성능 최적화

Pulse는 별도의 인프라 환경 없이 기존 애플리케이션에 쉽게 도입할 수 있도록 설계되었습니다. 하지만, 트래픽이 많은 서비스에서는 Pulse가 애플리케이션 성능에 미치는 영향을 줄이는 다양한 방법이 제공됩니다.

<a name="using-a-different-database"></a>
### 별도 데이터베이스 사용

트래픽이 많은 애플리케이션에서는 Pulse 전용 데이터베이스 연결을 사용하여 애플리케이션 데이터베이스에 미치는 영향을 최소화할 수 있습니다.

Pulse가 사용하는 [데이터베이스 연결](/docs/10.x/database#configuration)은 `PULSE_DB_CONNECTION` 환경 변수를 통해 지정할 수 있습니다.

```env
PULSE_DB_CONNECTION=pulse
```

<a name="ingest"></a>
### Redis Ingest

> [!WARNING]
> Redis Ingest 기능을 사용하려면 Redis 6.2 이상과 `phpredis` 또는 `predis`가 Redis 클라이언트 드라이버로 설정되어 있어야 합니다.

기본적으로 Pulse는 [설정된 데이터베이스 연결](#using-a-different-database)에 엔트리를 바로 저장합니다. HTTP 응답이 클라이언트에 전송된 후나 작업이 처리된 후에 저장이 이루어집니다. 하지만 Pulse의 Redis ingest 드라이버를 사용하면, 엔트리를 Redis 스트림으로 전송할 수도 있습니다. 이를 사용하려면 `PULSE_INGEST_DRIVER` 환경 변수를 다음과 같이 설정합니다.

```
PULSE_INGEST_DRIVER=redis
```

기본적으로 Pulse는 [기본 Redis 연결](/docs/10.x/redis#configuration)을 사용하지만, `PULSE_REDIS_CONNECTION` 환경변수를 통해 커스터마이즈할 수 있습니다.

```
PULSE_REDIS_CONNECTION=pulse
```

Redis ingest를 사용할 때는, 스트림을 모니터링하고 Redis에서 Pulse 데이터베이스로 엔트리를 이동시키는 `pulse:work` 명령어를 실행해야 합니다.

```php
php artisan pulse:work
```

> [!NOTE]
> `pulse:work` 프로세스를 항상 백그라운드에서 실행하려면 Supervisor와 같은 프로세스 모니터를 사용하여 Pulse 워커가 멈추지 않도록 관리해야 합니다.

`pulse:work` 역시 장시간 실행되는 프로세스이므로, 코드가 변경되면 명령어를 재시작해야만 변경 사항이 반영됩니다. 배포 과정에서 `pulse:restart` 명령어로 안전하게 재시작해 주세요.

```sh
php artisan pulse:restart
```

> [!NOTE]
> Pulse는 [캐시](/docs/10.x/cache)를 사용해 재시작 신호를 저장하므로, 이 기능을 사용하기 전에 캐시 드라이버가 정상적으로 설정되어 있는지 확인해야 합니다.

<a name="sampling"></a>
### 샘플링

Pulse는 기본적으로 애플리케이션에서 발생하는 모든 관련 이벤트를 빠짐없이 수집합니다. 트래픽이 많은 환경에서는 이로 인해 대시보드에서 수백만 개의 데이터베이스 행을 집계해야 할 수도 있습니다.

이럴 경우 특정 Pulse 레코더에 대해 "샘플링" 기능을 사용할 수 있습니다. 예를 들어, [`User Requests`](#user-requests-recorder) 레코더의 샘플률을 `0.1`로 설정하면 전체 요청 중 약 10%만 저장합니다. 대시보드에는 값이 비슷하게 보정(확대)되어 표시되고, `~` 기호가 붙어 근사값임을 보여줍니다.

일반적으로 특정 메트릭에 대해 기록된 엔트리가 많을수록, 샘플률을 낮춰도 큰 정확도 손실 없이 활용할 수 있습니다.

<a name="trimming"></a>
### 트리밍

Pulse는 대시보드에서 조회하지 않는 기간 데이터는 자동으로 삭제(트리밍)합니다. 트리밍은 데이터를 수집할 때마다 추첨 방식(lottery system)으로 이루어지며, Pulse [환경설정 파일](#configuration)에서 조정할 수 있습니다.

<a name="pulse-exceptions"></a>
### Pulse 예외 처리

Pulse 데이터 캡처 과정에서(예: 저장소 데이터베이스 연결 실패 등) 예외가 발생하면, Pulse는 애플리케이션에 영향을 주지 않도록 조용히(에러 없이) 실행을 중단합니다.

예외 처리 방식을 직접 정의하고 싶다면, `handleExceptionsUsing` 메서드에 클로저를 전달해 맞춤 처리가 가능합니다.

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

Pulse는 애플리케이션 특성에 맞는 데이터를 표시하기 위해 커스텀 카드를 만들 수 있습니다. Pulse는 [Livewire](https://livewire.laravel.com)를 활용하므로, 커스텀 카드를 처음 만들기 전 Livewire의 [공식 문서](https://livewire.laravel.com/docs)를 반드시 참고하는 것이 좋습니다.

<a name="custom-card-components"></a>
### 카드 컴포넌트

Laravel Pulse에서 커스텀 카드를 만들려면, 우선 기본 `Card` Livewire 컴포넌트를 확장한 뒤 뷰 파일을 정의해야 합니다.

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

Livewire의 [lazy loading](https://livewire.laravel.com/docs/lazy)을 사용하면, `Card` 컴포넌트가 `cols`, `rows` 속성에 맞춰서 플레이스홀더를 자동으로 제공합니다.

Pulse 카드용 뷰에서 Pulse의 Blade 컴포넌트를 적극적으로 활용하면 일관된 시각적 스타일을 유지할 수 있습니다.

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

카드 레이아웃을 대시보드에서 유연하게 조정할 수 있도록, `$cols`, `$rows`, `$class`, `$expand` 변수를 Blade 컴포넌트에 넘겨야 합니다. 카드가 자동으로 갱신되길 원한다면 `wire:poll.5s=""` 속성도 추천합니다.

Livewire 컴포넌트와 템플릿을 정의하고 나면, [대시보드 뷰](#dashboard-customization)에서 원하는 위치에 카드를 추가할 수 있습니다.

```blade
<x-pulse>
    ...

    <livewire:pulse.top-sellers cols="4" />
</x-pulse>
```

> [!NOTE]
> 카드가 패키지 형태로 제공된다면, Livewire의 `Livewire::component` 메서드로 컴포넌트를 등록할 필요가 있습니다.

<a name="custom-card-styling"></a>
### 스타일링

카드에 Pulse에서 제공하는 기본 스타일 외에 추가 CSS가 필요하다면, 여러 방법으로 커스텀 CSS를 적용할 수 있습니다.

<a name="custom-card-styling-vite"></a>
#### 라라벨 Vite 연동

커스텀 카드가 애플리케이션 코드에 있는 경우, 라라벨의 [Vite 통합](/docs/10.x/vite)을 이용해 카드 전용 CSS 엔트리포인트를 `vite.config.js`에 추가할 수 있습니다.

```js
laravel({
    input: [
        'resources/css/pulse/top-sellers.css',
        // ...
    ],
}),
```

이후 [대시보드 뷰](#dashboard-customization)에서 `@vite` Blade 디렉티브로 카드용 CSS를 로딩합니다.

```blade
<x-pulse>
    @vite('resources/css/pulse/top-sellers.css')

    ...
</x-pulse>
```

<a name="custom-card-styling-css"></a>
#### CSS 파일 직접 지정

패키지 형태의 카드 등 다른 경우에는 Livewire 컴포넌트에 `css` 메서드를 추가하여 직접 CSS 파일 경로를 지정할 수 있습니다.

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

이 카드가 대시보드에 포함될 때, Pulse는 해당 CSS 파일의 내용을 `<style>` 태그로 삽입해 별도로 `public` 디렉터리에 파일을 퍼블리시할 필요가 없습니다.

<a name="custom-card-styling-tailwind"></a>
#### Tailwind CSS

Tailwind CSS를 사용할 때는, 불필요한 CSS 로딩이나 Pulse의 Tailwind 클래스와의 충돌을 방지하기 위해 별도의 Tailwind 설정 파일을 만들어야 합니다.

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

그리고 CSS 엔트리포인트에서 해당 Tailwind 설정 파일을 지정합니다.

```css
@config "../../tailwind.top-sellers.config.js";
@tailwind base;
@tailwind components;
@tailwind utilities;
```

또한 카드 뷰에서는 Tailwind의 [`important` 선택자 전략](https://tailwindcss.com/docs/configuration#selector-strategy)에서 지정한 선택자와 동일한 `id` 또는 `class` 속성을 포함해야 합니다.

```blade
<x-pulse::card id="top-sellers" :cols="$cols" :rows="$rows" class="$class">
    ...
</x-pulse::card>
```

<a name="custom-card-data"></a>
### 데이터 캡처 및 집계

커스텀 카드는 어디서든 데이터를 조회하고 표시할 수 있지만, Pulse의 강력하고 효율적인 데이터 기록 및 집계 시스템도 활용할 수 있습니다.

<a name="custom-card-data-capture"></a>
#### 엔트리 캡처

Pulse에서는 `Pulse::record` 메서드를 통해 "엔트리"를 직접 기록할 수 있습니다.

```php
use Laravel\Pulse\Facades\Pulse;

Pulse::record('user_sale', $user->id, $sale->amount)
    ->sum()
    ->count();
```

`record` 메서드의 첫 번째 인자는 엔트리의 `type`, 두 번째는 집계 기준이 되는 `key`(예: 사용자 ID)입니다. 대부분의 집계 메서드는 집계에 사용할 `value`도 필요합니다. 위 예시에서는 `$sale->amount`가 집계 대상입니다. 이후 하나 이상의 집계 메서드(`sum`, `count` 등)를 호출해 Pulse가 효율적으로 재사용할 수 있도록 "버킷" 단위로 사전 집계된 값을 저장합니다.

사용 가능한 집계 메서드는 다음과 같습니다.

* `avg`
* `count`
* `max`
* `min`
* `sum`

> [!NOTE]
> 인증된 사용자 ID를 기록하는 카드 패키지를 만들 때는, 애플리케이션의 [사용자 해석 커스터마이즈](#dashboard-resolving-users) 설정도 반영하는 `Pulse::resolveAuthenticatedUserId()` 메서드를 사용하는 것이 좋습니다.

<a name="custom-card-data-retrieval"></a>
#### 집계 데이터 조회

Pulse의 `Card` Livewire 컴포넌트를 확장하면, 대시보드에서 조회 중인 기간에 대한 집계 데이터를 `aggregate` 메서드로 손쉽게 조회할 수 있습니다.

```php
class TopSellers extends Card
{
    public function render()
    {
        return view('livewire.pulse.top-sellers', [
            'topSellers' => $this->aggregate('user_sale', ['sum', 'count']);
        ]);
    }
}
```

`aggregate` 메서드는 PHP `stdClass` 객체 컬렉션을 반환합니다. 각 객체는 이전에 지정한 `key` 속성과, 요청한 각 집계값이 키로 포함되어 있습니다.

```
@foreach ($topSellers as $seller)
    {{ $seller->key }}
    {{ $seller->sum }}
    {{ $seller->count }}
@endforeach
```

Pulse는 대부분의 데이터를 미리 집계해둔 버킷에서 불러오므로, 집계 대상이 되는 값이 사전에 `Pulse::record`로 수집되어 있어야 합니다. 가장 오래된 버킷은 조회 범위를 일부 벗어날 수 있으므로, Pulse가 자동으로 오래된 엔트리를 합산해 전체 기간에 대한 정확한 값을 제공합니다.

특정 타입에 대한 전체 합계를 빠르게 조회하려면 `aggregateTotal` 메서드를 사용할 수 있습니다. 예를 들어, 아래는 모든 사용자 판매액의 합계를 집계합니다.

```php
$total = $this->aggregateTotal('user_sale', 'sum');
```

<a name="custom-card-displaying-users"></a>
#### 사용자 정보 표시

집계 데이터에서 `key`에 사용자 ID를 사용했다면, `Pulse::resolveUsers` 메서드로 해당 키 값을 실제 사용자 레코드로 변환할 수 있습니다.

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

`find` 메서드는 `name`, `extra`, `avatar` 키를 가진 객체를 반환하며, 이 객체들을 `<x-pulse::user-card>` Blade 컴포넌트에 바로 전달해 표시할 수 있습니다.

```blade
<x-pulse::user-card :user="{{ $seller->user }}" :stats="{{ $seller->sum }}" />
```

<a name="custom-recorders"></a>
#### 커스텀 레코더

패키지 작성자는 데이터 캡처를 위한 별도의 레코더 클래스를 직접 제공할 수 있습니다.

레코더는 애플리케이션의 `config/pulse.php` 환경설정 파일의 `recorders` 항목에 등록합니다.

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

레코더에서 `$listen` 속성을 지정하면, Pulse가 자동으로 해당 이벤트 리스너를 등록하고, 이벤트가 발생할 때 `record` 메서드를 호출합니다.

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
     * @var list<class-string>
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
