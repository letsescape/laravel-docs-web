# 라라벨 텔레스코프 (Laravel Telescope)

- [소개](#introduction)
- [설치](#installation)
    - [로컬 전용 설치](#local-only-installation)
    - [설정](#configuration)
    - [데이터 정리(Pruning)](#data-pruning)
    - [대시보드 권한 제어](#dashboard-authorization)
- [Telescope 업그레이드](#upgrading-telescope)
- [필터링](#filtering)
    - [엔트리 필터링](#filtering-entries)
    - [배치 필터링](#filtering-batches)
- [태그(Tag) 지정](#tagging)
- [사용 가능한 워처 목록](#available-watchers)
    - [배치 워처](#batch-watcher)
    - [캐시 워처](#cache-watcher)
    - [명령어 워처](#command-watcher)
    - [덤프 워처](#dump-watcher)
    - [이벤트 워처](#event-watcher)
    - [예외 워처](#exception-watcher)
    - [게이트 워처](#gate-watcher)
    - [HTTP 클라이언트 워처](#http-client-watcher)
    - [잡 워처](#job-watcher)
    - [로그 워처](#log-watcher)
    - [메일 워처](#mail-watcher)
    - [모델 워처](#model-watcher)
    - [알림 워처](#notification-watcher)
    - [쿼리 워처](#query-watcher)
    - [Redis 워처](#redis-watcher)
    - [리퀘스트 워처](#request-watcher)
    - [스케쥴 워처](#schedule-watcher)
    - [뷰 워처](#view-watcher)
- [사용자 아바타 표시](#displaying-user-avatars)

<a name="introduction"></a>
## 소개

[Laravel Telescope](https://github.com/laravel/telescope)는 로컬 라라벨 개발 환경에서 매우 유용하게 사용할 수 있는 도구입니다. Telescope는 애플리케이션에 들어오는 요청, 예외, 로그, 데이터베이스 쿼리, 큐 잡, 메일, 알림, 캐시 작업, 예약 작업, 변수 덤프 등 다양한 정보를 한눈에 볼 수 있도록 도와줍니다.

<img src="https://laravel.com/img/docs/telescope-example.png" />

<a name="installation"></a>
## 설치

Telescope를 라라벨 프로젝트에 설치하려면 Composer 패키지 매니저를 사용합니다.

```shell
composer require laravel/telescope
```

설치가 완료되면, `telescope:install` 아티즌 명령어를 사용해 Telescope의 에셋을 퍼블리시(publish)하세요. 그 후, Telescope의 데이터 저장에 필요한 테이블을 생성하기 위해 `migrate` 명령어를 실행해야 합니다.

```shell
php artisan telescope:install

php artisan migrate
```

마지막으로, `/telescope` 경로를 통해 Telescope 대시보드에 접근할 수 있습니다.

<a name="migration-customization"></a>
#### 마이그레이션 커스터마이즈

Telescope의 기본 마이그레이션을 사용하지 않으려면, 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `register` 메서드에서 `Telescope::ignoreMigrations` 메서드를 호출해 주세요. 필요하다면, 아래 명령어로 Telescope의 기본 마이그레이션을 퍼블리시할 수 있습니다.  
`php artisan vendor:publish --tag=telescope-migrations`

<a name="local-only-installation"></a>
### 로컬 전용 설치

Telescope를 오직 로컬 개발 지원 용도로만 사용할 예정이라면, `--dev` 플래그를 이용해 설치할 수 있습니다.

```shell
composer require laravel/telescope --dev

php artisan telescope:install

php artisan migrate
```

`telescope:install`을 실행한 이후, 애플리케이션의 `config/app.php` 설정 파일에서 `TelescopeServiceProvider` 서비스 프로바이더 등록을 제거해야 합니다. 대신, `App\Providers\AppServiceProvider` 클래스의 `register` 메서드에서 직접 Telescope의 서비스 프로바이더를 등록해 주세요. 이때 현재 환경이 `local`인지 확인한 후 프로바이더를 등록하도록 하면 됩니다.

```
/**
 * Register any application services.
 */
public function register(): void
{
    if ($this->app->environment('local')) {
        $this->app->register(\Laravel\Telescope\TelescopeServiceProvider::class);
        $this->app->register(TelescopeServiceProvider::class);
    }
}
```

또한, 아래와 같이 `composer.json` 파일에 설정을 추가해 Telescope 패키지가 [자동으로 디스커버](/docs/10.x/packages#package-discovery)되는 것을 방지해야 합니다.

```json
"extra": {
    "laravel": {
        "dont-discover": [
            "laravel/telescope"
        ]
    }
},
```

<a name="configuration"></a>
### 설정

Telescope의 에셋을 퍼블리시하면, 주요 설정 파일이 `config/telescope.php`에 생성됩니다. 이 설정 파일에서는 [워처 옵션](#available-watchers) 등 여러 가지 옵션을 설정할 수 있습니다. 각 설정 항목마다 목적에 대한 설명이 있으니, 파일을 꼼꼼히 살펴보는 것이 좋습니다.

원한다면 다음과 같이 `enabled` 옵션을 통해 Telescope의 데이터 수집 전체를 비활성화할 수도 있습니다.

```
'enabled' => env('TELESCOPE_ENABLED', true),
```

<a name="data-pruning"></a>
### 데이터 정리(Pruning)

데이터를 정리(pruning)하지 않으면, `telescope_entries` 테이블에 레코드가 금방 쌓일 수 있습니다. 이를 방지하려면 [스케줄링](/docs/10.x/scheduling) 기능을 사용해 `telescope:prune` 아티즌 명령어를 매일 실행하도록 해야 합니다.

```
$schedule->command('telescope:prune')->daily();
```

기본적으로 24시간이 지난 모든 엔트리는 삭제됩니다. 명령어 실행 시 `hours` 옵션을 사용하면 데이터를 보관할 시간을 조정할 수 있습니다. 예를 들어, 아래 명령어는 48시간이 지난 모든 레코드를 삭제합니다.

```
$schedule->command('telescope:prune --hours=48')->daily();
```

<a name="dashboard-authorization"></a>
### 대시보드 권한 제어

Telescope 대시보드는 `/telescope` 경로를 통해 접근할 수 있습니다. 기본적으로는 `local` 환경에서만 접근이 허용됩니다. 그리고 `app/Providers/TelescopeServiceProvider.php` 파일에는 [인가 게이트](/docs/10.x/authorization#gates) 정의가 있습니다. 이 게이트는 **로컬 환경이 아닌 경우** Telescope 접근을 통제합니다. Telescope 인스톨에 대한 접근 권한을 제한하고 싶다면, 아래와 같이 게이트를 자유롭게 수정할 수 있습니다.

```
use App\Models\User;

/**
 * Register the Telescope gate.
 *
 * This gate determines who can access Telescope in non-local environments.
 */
protected function gate(): void
{
    Gate::define('viewTelescope', function (User $user) {
        return in_array($user->email, [
            'taylor@laravel.com',
        ]);
    });
}
```

> [!WARNING]
> 프로덕션 환경에서는 반드시 `APP_ENV` 환경 변수를 `production`으로 설정해야 합니다. 그렇지 않으면 Telescope가 외부에 공개될 수 있습니다.

<a name="upgrading-telescope"></a>
## Telescope 업그레이드

Telescope의 새로운 메이저 버전으로 업그레이드할 때는, 반드시 [업그레이드 가이드](https://github.com/laravel/telescope/blob/master/UPGRADE.md)를 꼼꼼히 확인해야 합니다.

또한, Telescope를 어떤 새 버전으로 업그레이드하는 경우든, Telescope의 에셋을 다시 퍼블리시하는 것이 좋습니다.

```shell
php artisan telescope:publish
```

향후 업데이트 시 문제를 방지하고 항상 에셋을 최신 상태로 유지하려면, 애플리케이션의 `composer.json` 파일의 `post-update-cmd` 스크립트에 아래 명령어를 추가해 둘 수 있습니다.

```json
{
    "scripts": {
        "post-update-cmd": [
            "@php artisan vendor:publish --tag=laravel-assets --ansi --force"
        ]
    }
}
```

<a name="filtering"></a>
## 필터링

<a name="filtering-entries"></a>
### 엔트리 필터링

`App\Providers\TelescopeServiceProvider` 클래스 안에서 정의된 `filter` 클로저를 통해, Telescope가 기록하는 데이터를 원하는 대로 필터링할 수 있습니다. 기본적으로 이 클로저는 `local` 환경에서는 모든 데이터를 기록하며, 그 외 환경에서는 예외, 실패한 잡, 예약 작업, 그리고 모니터링 태그가 붙은 데이터만을 기록합니다.

```
use Laravel\Telescope\IncomingEntry;
use Laravel\Telescope\Telescope;

/**
 * Register any application services.
 */
public function register(): void
{
    $this->hideSensitiveRequestDetails();

    Telescope::filter(function (IncomingEntry $entry) {
        if ($this->app->environment('local')) {
            return true;
        }

        return $entry->isReportableException() ||
            $entry->isFailedJob() ||
            $entry->isScheduledTask() ||
            $entry->isSlowQuery() ||
            $entry->hasMonitoredTag();
    });
}
```

<a name="filtering-batches"></a>
### 배치 필터링

`filter` 클로저가 데이터의 각 엔트리를 필터링하는 역할을 한다면, `filterBatch` 메서드는 하나의 요청 또는 콘솔 명령에 대한 전체 데이터를 필터링할 때 사용합니다. 이 클로저가 `true`를 반환하면, 해당 요청과 관련된 모든 엔트리가 Telescope에 기록됩니다.

```
use Illuminate\Support\Collection;
use Laravel\Telescope\IncomingEntry;
use Laravel\Telescope\Telescope;

/**
 * Register any application services.
 */
public function register(): void
{
    $this->hideSensitiveRequestDetails();

    Telescope::filterBatch(function (Collection $entries) {
        if ($this->app->environment('local')) {
            return true;
        }

        return $entries->contains(function (IncomingEntry $entry) {
            return $entry->isReportableException() ||
                $entry->isFailedJob() ||
                $entry->isScheduledTask() ||
                $entry->isSlowQuery() ||
                $entry->hasMonitoredTag();
            });
    });
}
```

<a name="tagging"></a>
## 태그(Tag) 지정

Telescope에서는 엔트리를 "태그(tag)"로 분류해 검색할 수 있습니다. 태그는 보통 Eloquent 모델 클래스 명, 인증된 사용자 ID 등 Telescope가 자동으로 엔트리에 추가해 주는 값입니다. 필요하다면 직접 원하는 태그를 추가할 수도 있습니다. 이를 위해 `Telescope::tag` 메서드를 사용하며, 이 메서드는 태그 배열을 반환하는 클로저를 인수로 받습니다. 클로저가 반환한 태그는 Telescope가 자동으로 추가하는 태그와 합쳐집니다. 보통은 `App\Providers\TelescopeServiceProvider` 클래스의 `register` 메서드 안에서 `tag` 메서드를 호출하면 됩니다.

```
use Laravel\Telescope\IncomingEntry;
use Laravel\Telescope\Telescope;

/**
 * Register any application services.
 */
public function register(): void
{
    $this->hideSensitiveRequestDetails();

    Telescope::tag(function (IncomingEntry $entry) {
        return $entry->type === 'request'
                    ? ['status:'.$entry->content['response_status']]
                    : [];
    });
 }
```

<a name="available-watchers"></a>
## 사용 가능한 워처 목록

Telescope의 "워처(watcher)"는 요청이나 콘솔 명령이 실행될 때 애플리케이션의 다양한 데이터를 수집합니다. `config/telescope.php` 설정 파일에서 어떤 워처를 활성화할지 커스터마이징할 수 있습니다.

```
'watchers' => [
    Watchers\CacheWatcher::class => true,
    Watchers\CommandWatcher::class => true,
    ...
],
```

일부 워처는 추가적인 설정 옵션도 제공됩니다.

```
'watchers' => [
    Watchers\QueryWatcher::class => [
        'enabled' => env('TELESCOPE_QUERY_WATCHER', true),
        'slow' => 100,
    ],
    ...
],
```

<a name="batch-watcher"></a>
### 배치 워처

배치 워처는 큐 [배치 작업](/docs/10.x/queues#job-batching)에 대한 정보(잡, 연결 정보 등)를 기록합니다.

<a name="cache-watcher"></a>
### 캐시 워처

캐시 워처는 캐시 키가 조회(hit)되거나, 존재하지 않아 miss됐을 때, 업데이트 또는 삭제가 일어났을 때 데이터를 기록합니다.

<a name="command-watcher"></a>
### 명령어 워처

명령어 워처는 Artisan 명령어가 실행될 때 인수, 옵션, 종료 코드, 출력값 등을 기록합니다. 특정 명령어의 기록을 제외하려면, `config/telescope.php` 파일의 `ignore` 옵션에 명령어명을 입력하면 됩니다.

```
'watchers' => [
    Watchers\CommandWatcher::class => [
        'enabled' => env('TELESCOPE_COMMAND_WATCHER', true),
        'ignore' => ['key:generate'],
    ],
    ...
],
```

<a name="dump-watcher"></a>
### 덤프 워처

덤프 워처는 Telescope에서 변수 덤프 결과를 기록하여 보여줍니다. 라라벨에서는 전역 `dump` 함수로 변수를 덤프할 수 있습니다. 단, 덤프 워처 탭이 브라우저에서 열려 있어야만 덤프가 기록되며, 그렇지 않으면 기록에서 제외됩니다.

<a name="event-watcher"></a>
### 이벤트 워처

이벤트 워처는 애플리케이션에서 디스패치된 모든 [이벤트](/docs/10.x/events)의 페이로드, 리스너, 브로드캐스트 데이터를 기록합니다. 라라벨 프레임워크의 내부 이벤트는 Event 워처가 기록하지 않습니다.

<a name="exception-watcher"></a>
### 예외 워처

예외 워처는 애플리케이션에서 발생하여 보고 가능한(reportable) 예외의 데이터와 스택 트레이스를 기록합니다.

<a name="gate-watcher"></a>
### 게이트 워처

게이트 워처는 애플리케이션에서 실행된 [게이트(gate) 및 정책(policy)](/docs/10.x/authorization) 체크의 데이터와 결과를 저장합니다. 특정 인가 능력(ability)의 기록을 제외하려면, `config/telescope.php` 파일의 `ignore_abilities` 옵션에 해당 인가 능력명을 적어주면 됩니다.

```
'watchers' => [
    Watchers\GateWatcher::class => [
        'enabled' => env('TELESCOPE_GATE_WATCHER', true),
        'ignore_abilities' => ['viewNova'],
    ],
    ...
],
```

<a name="http-client-watcher"></a>
### HTTP 클라이언트 워처

HTTP 클라이언트 워처는 애플리케이션에서 발생하는 [HTTP 클라이언트 요청](/docs/10.x/http-client)을 기록합니다.

<a name="job-watcher"></a>
### 잡 워처

잡 워처는 애플리케이션에서 디스패치되는 모든 [잡(jobs)](/docs/10.x/queues)의 데이터와 상태를 기록합니다.

<a name="log-watcher"></a>
### 로그 워처

로그 워처는 애플리케이션에서 기록한 [로그 데이터](/docs/10.x/logging)를 저장합니다.

기본적으로 Telescope는 `error` 레벨 이상의 로그만 기록합니다. 기록할 로그 레벨을 변경하려면, `config/telescope.php`의 `level` 옵션을 수정하면 됩니다.

```
'watchers' => [
    Watchers\LogWatcher::class => [
        'enabled' => env('TELESCOPE_LOG_WATCHER', true),
        'level' => 'debug',
    ],

    // ...
],
```

<a name="mail-watcher"></a>
### 메일 워처

메일 워처는 애플리케이션에서 전송한 [이메일](/docs/10.x/mail)에 대한 브라우저 미리보기와 관련 데이터를 표시해줍니다. 이메일을 `.eml` 파일로 다운로드할 수도 있습니다.

<a name="model-watcher"></a>
### 모델 워처

모델 워처는 Eloquent [모델 이벤트](/docs/10.x/eloquent#events)가 발생할 때마다 모델 변경 사항을 기록합니다. 기록할 모델 이벤트는 워처의 `events` 옵션에서 지정할 수 있습니다.

```
'watchers' => [
    Watchers\ModelWatcher::class => [
        'enabled' => env('TELESCOPE_MODEL_WATCHER', true),
        'events' => ['eloquent.created*', 'eloquent.updated*'],
    ],
    ...
],
```

특정 요청 중에 하이드레이트(조회)된 모델의 개수를 기록하고 싶다면, `hydrations` 옵션을 활성화할 수 있습니다.

```
'watchers' => [
    Watchers\ModelWatcher::class => [
        'enabled' => env('TELESCOPE_MODEL_WATCHER', true),
        'events' => ['eloquent.created*', 'eloquent.updated*'],
        'hydrations' => true,
    ],
    ...
],
```

<a name="notification-watcher"></a>
### 알림 워처

알림 워처는 애플리케이션에서 전송되는 모든 [알림](/docs/10.x/notifications)을 기록합니다. 만약 알림이 이메일을 트리거하고 메일 워처를 활성화했다면, 해당 이메일도 메일 워처 화면에서 미리보기로 확인할 수 있습니다.

<a name="query-watcher"></a>
### 쿼리 워처

쿼리 워처는 애플리케이션에서 실행되는 모든 쿼리에 대해 실행된 SQL, 바인딩, 실행 시간을 기록합니다. 100밀리초를 초과하는 쿼리는 기본적으로 `slow` 태그가 붙습니다. 워처의 `slow` 옵션을 통해 느린 쿼리 기준값을 조정할 수 있습니다.

```
'watchers' => [
    Watchers\QueryWatcher::class => [
        'enabled' => env('TELESCOPE_QUERY_WATCHER', true),
        'slow' => 50,
    ],
    ...
],
```

<a name="redis-watcher"></a>
### Redis 워처

Redis 워처는 애플리케이션에서 실행된 모든 [Redis](/docs/10.x/redis) 명령을 기록합니다. Redis를 캐시로 사용하는 경우, 캐시 명령도 함께 기록됩니다.

<a name="request-watcher"></a>
### 리퀘스트 워처

리퀘스트 워처는 애플리케이션이 처리한 각 요청의 요청 정보, 헤더, 세션, 응답 데이터를 기록합니다. 기록할 응답 데이터의 크기는 `size_limit`(킬로바이트 단위) 옵션으로 제한할 수 있습니다.

```
'watchers' => [
    Watchers\RequestWatcher::class => [
        'enabled' => env('TELESCOPE_REQUEST_WATCHER', true),
        'size_limit' => env('TELESCOPE_RESPONSE_SIZE_LIMIT', 64),
    ],
    ...
],
```

<a name="schedule-watcher"></a>
### 스케쥴 워처

스케쥴 워처는 애플리케이션에서 실행된 [예약 작업](/docs/10.x/scheduling)의 명령어와 출력 값을 기록합니다.

<a name="view-watcher"></a>
### 뷰 워처

뷰 워처는 [뷰](/docs/10.x/views) 렌더링 시 사용된 뷰 이름, 경로, 데이터, 그리고 "composer" 정보를 기록합니다.

<a name="displaying-user-avatars"></a>
## 사용자 아바타 표시

Telescope 대시보드에서는 각 엔트리가 저장될 당시 인증된 사용자의 아바타 이미지를 표시합니다. 기본적으로 Telescope는 Gravatar 웹 서비스를 통해 아바타를 가져옵니다. 하지만, 아바타 URL을 커스터마이징하려면 `App\Providers\TelescopeServiceProvider` 클래스에 콜백을 등록하면 됩니다. 콜백은 사용자 ID와 이메일을 받아서, 해당 사용자의 아바타 이미지 URL을 반환해야 합니다.

```
use App\Models\User;
use Laravel\Telescope\Telescope;

/**
 * Register any application services.
 */
public function register(): void
{
    // ...

    Telescope::avatar(function (string $id, string $email) {
        return '/avatars/'.User::find($id)->avatar_path;
    });
}
```