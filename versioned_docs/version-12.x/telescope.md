# 라라벨 텔레스코프 (Laravel Telescope)

- [소개](#introduction)
- [설치](#installation)
    - [로컬 전용 설치](#local-only-installation)
    - [설정](#configuration)
    - [데이터 정리](#data-pruning)
    - [대시보드 접근 권한](#dashboard-authorization)
- [Telescope 업그레이드](#upgrading-telescope)
- [필터링](#filtering)
    - [엔트리 필터링](#filtering-entries)
    - [배치 필터링](#filtering-batches)
- [태깅](#tagging)
- [사용 가능한 워처 목록](#available-watchers)
    - [배치 워처](#batch-watcher)
    - [캐시 워처](#cache-watcher)
    - [명령어 워처](#command-watcher)
    - [덤프 워처](#dump-watcher)
    - [이벤트 워처](#event-watcher)
    - [예외 워처](#exception-watcher)
    - [Gate 워처](#gate-watcher)
    - [HTTP 클라이언트 워처](#http-client-watcher)
    - [잡 워처](#job-watcher)
    - [로그 워처](#log-watcher)
    - [메일 워처](#mail-watcher)
    - [모델 워처](#model-watcher)
    - [알림 워처](#notification-watcher)
    - [쿼리 워처](#query-watcher)
    - [Redis 워처](#redis-watcher)
    - [요청 워처](#request-watcher)
    - [스케줄 워처](#schedule-watcher)
    - [뷰 워처](#view-watcher)
- [사용자 아바타 표시](#displaying-user-avatars)

<a name="introduction"></a>
## 소개

[Laravel Telescope](https://github.com/laravel/telescope)는 로컬 라라벨 개발 환경에 매우 유용한 도구입니다. Telescope는 애플리케이션으로 들어오는 요청, 예외, 로그 엔트리, 데이터베이스 쿼리, 큐 작업, 메일, 알림, 캐시 작업, 스케줄된 작업, 변수 덤프 등 다양한 정보를 직관적으로 확인할 수 있게 해 줍니다.

<img src="https://laravel.com/img/docs/telescope-example.png" />

<a name="installation"></a>
## 설치

Composer 패키지 관리자를 사용해 Telescope를 프로젝트에 설치할 수 있습니다.

```shell
composer require laravel/telescope
```

Telescope 설치 후, `telescope:install` Artisan 명령어를 사용하여 에셋 및 마이그레이션 파일을 배포해야 합니다. 이후 Telescope에서 사용할 데이터 저장용 테이블을 생성하기 위해 `migrate` 명령어도 실행해야 합니다.

```shell
php artisan telescope:install

php artisan migrate
```

설치가 완료되면 `/telescope` 경로로 Telescope 대시보드에 접속할 수 있습니다.

<a name="local-only-installation"></a>
### 로컬 전용 설치

Telescope를 오직 로컬 개발 과정에서만 사용할 예정이라면, `--dev` 플래그를 사용하여 설치할 수 있습니다.

```shell
composer require laravel/telescope --dev

php artisan telescope:install

php artisan migrate
```

`telescope:install` 실행 이후에는, 애플리케이션의 `bootstrap/providers.php` 파일에서 `TelescopeServiceProvider` 서비스 프로바이더 등록을 제거해야 합니다. 대신, `App\Providers\AppServiceProvider` 클래스의 `register` 메서드에서 Telescope의 서비스 프로바이더를 수동으로 등록하는 것이 좋습니다. 아래 예시처럼 현재 환경이 `local`일 때만 등록하는 방식으로 구현하는 것이 일반적입니다.

```php
/**
 * Register any application services.
 */
public function register(): void
{
    if ($this->app->environment('local') && class_exists(\Laravel\Telescope\TelescopeServiceProvider::class)) {
        $this->app->register(\Laravel\Telescope\TelescopeServiceProvider::class);
        $this->app->register(TelescopeServiceProvider::class);
    }
}
```

마지막으로 `composer.json` 파일에서 다음 설정을 추가하여 Telescope가 [자동 패키지 디스커버리](/docs/12.x/packages#package-discovery)에 포함되지 않도록 해야 합니다.

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

Telescope의 에셋을 배포하고 나면, 주요 설정 파일이 `config/telescope.php` 위치에 생성됩니다. 이 파일에서 [워처 옵션](#available-watchers) 등 다양한 설정을 조정할 수 있습니다. 각 옵션에는 용도에 대한 설명이 포함되어 있으니 꼭 한번씩 확인해 보시기 바랍니다.

필요하다면 `enabled` 설정 값을 통해 Telescope의 데이터 수집 기능 전체를 비활성화할 수도 있습니다.

```php
'enabled' => env('TELESCOPE_ENABLED', true),
```

<a name="data-pruning"></a>
### 데이터 정리

데이터 정리(pruning)를 설정하지 않으면 `telescope_entries` 테이블에 레코드가 빠른 속도로 쌓이게 됩니다. 이를 방지하기 위해 매일 `telescope:prune` Artisan 명령어를 [스케줄](/docs/12.x/scheduling)하는 것이 좋습니다.

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('telescope:prune')->daily();
```

기본적으로 24시간이 지난 엔트리가 모두 삭제됩니다. 추가적으로 데이터 보존 기간을 세밀하게 조정하고 싶을 때는 명령어에 `hours` 옵션을 붙여 사용할 수 있습니다. 아래 예시는 48시간이 지난 레코드를 삭제합니다.

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('telescope:prune --hours=48')->daily();
```

<a name="dashboard-authorization"></a>
### 대시보드 접근 권한

Telescope 대시보드는 `/telescope` 경로에서 접근할 수 있습니다. 기본적으로는 오직 `local` 환경에서만 접근할 수 있습니다. `app/Providers/TelescopeServiceProvider.php` 파일에서는 [인가 게이트(gate)](/docs/12.x/authorization#gates) 정의가 제공됩니다. 이 게이트는 **local이 아닌 환경**에서 Telescope 접근을 제어합니다. 필요에 따라 이 게이트의 내용을 수정해 접근 대상을 제한할 수 있습니다.

```php
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
> 실제 운영(Production) 환경에서는 반드시 `APP_ENV` 환경 변수를 `production`으로 설정해야 합니다. 그렇지 않으면 Telescope 페이지가 외부에 공개될 수 있으니 주의해야 합니다.

<a name="upgrading-telescope"></a>
## Telescope 업그레이드

Telescope의 새 메이저 버전으로 업그레이드할 때는 [업그레이드 가이드](https://github.com/laravel/telescope/blob/master/UPGRADE.md)를 꼼꼼히 확인해야 합니다.

또한, Telescope의 버전을 올릴 때마다 에셋을 재배포하는 것이 좋습니다.

```shell
php artisan telescope:publish
```

향후 업데이트 시 에셋이 항상 최신 상태를 유지하도록, `composer.json`의 `post-update-cmd` 스크립트에 `vendor:publish --tag=laravel-assets` 명령을 추가해 두는 것도 권장합니다.

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

`App\Providers\TelescopeServiceProvider` 클래스에 정의된 `filter` 클로저를 활용해 Telescope가 기록할 데이터를 세밀하게 제어할 수 있습니다. 기본 설정에서는 `local` 환경에서는 모든 데이터를 기록하고, 그 밖의 환경에서는 예외, 실패한 잡, 예약 작업, 모니터링된 태그가 있는 데이터 등을 저장합니다.

```php
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

`filter` 클로저는 개별 엔트리 단위로 필터링을 할 때 사용하지만, 단일 요청이나 콘솔 명령 전체에 대해 한 번에 필터링을 하고 싶다면 `filterBatch` 메서드를 사용할 수 있습니다. 클로저가 `true`를 반환하면 해당 요청/명령어의 모든 엔트리가 기록됩니다.

```php
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
## 태깅

Telescope는 엔트리에 "태그(tag)"를 부여하여 검색을 쉽게 해줍니다. 기본적으로 Eloquent 모델 클래스 이름이나 인증된 사용자 ID 등이 자동으로 태그로 추가됩니다. 필요하다면 직접 원하는 태그를 추가할 수도 있습니다. 이를 위해 `Telescope::tag` 메서드를 사용하면 됩니다. `tag` 메서드는 태그 배열을 반환하는 클로저를 인자로 받으며, 이 클로저에서 반환한 태그는 자동 태그와 합쳐집니다. 주로 `App\Providers\TelescopeServiceProvider` 클래스의 `register` 메서드 안에서 사용합니다.

```php
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

Telescope의 "워처"는 요청이나 콘솔 명령어 실행 시마다 다양한 애플리케이션 데이터를 수집합니다. 활성화할 워처 목록은 `config/telescope.php` 파일에서 직접 설정할 수 있습니다.

```php
'watchers' => [
    Watchers\CacheWatcher::class => true,
    Watchers\CommandWatcher::class => true,
    // ...
],
```

몇몇 워처는 추가적으로 세부 옵션 설정이 가능합니다.

```php
'watchers' => [
    Watchers\QueryWatcher::class => [
        'enabled' => env('TELESCOPE_QUERY_WATCHER', true),
        'slow' => 100,
    ],
    // ...
],
```

<a name="batch-watcher"></a>
### 배치 워처

배치 워처는 [배치 작업](/docs/12.x/queues#job-batching)에 대한 정보(잡, 연결 정보 등)를 기록합니다.

<a name="cache-watcher"></a>
### 캐시 워처

캐시 워처는 캐시 키가 히트(hit), 미스(miss), 업데이트, 삭제(forgotten)되는 모든 상황을 기록합니다.

<a name="command-watcher"></a>
### 명령어 워처

명령어 워처는 Artisan 명령어가 실행될 때마다 인수, 옵션, 종료 코드, 출력 데이터를 기록합니다. 특정 명령어는 워처에 기록하지 않도록 `config/telescope.php` 파일의 `ignore` 옵션으로 제외할 수 있습니다.

```php
'watchers' => [
    Watchers\CommandWatcher::class => [
        'enabled' => env('TELESCOPE_COMMAND_WATCHER', true),
        'ignore' => ['key:generate'],
    ],
    // ...
],
```

<a name="dump-watcher"></a>
### 덤프 워처

덤프 워처는 Telescope 내에서 변수 덤프 결과를 기록하고 보여줍니다. 라라벨에서 전역 `dump` 함수를 사용할 때, 브라우저에서 덤프 탭이 열려 있어야만 데이터가 기록되며, 탭이 열려 있지 않으면 워처가 해당 덤프를 무시합니다.

<a name="event-watcher"></a>
### 이벤트 워처

이벤트 워처는 애플리케이션에서 발생하는 [이벤트](/docs/12.x/events)의 페이로드, 리스너, 브로드캐스트 데이터 등을 기록합니다. 라라벨 프레임워크 내부 이벤트는 제외됩니다.

<a name="exception-watcher"></a>
### 예외 워처

예외 워처는 애플리케이션에서 발생하는 보고 가능한 예외에 대해 데이터와 스택 트레이스를 기록합니다.

<a name="gate-watcher"></a>
### Gate 워처

Gate 워처는 애플리케이션의 [gate 및 정책](/docs/12.x/authorization) 검사 결과와 데이터를 기록합니다. 특정 권한(ability)에 대해 기록을 원하지 않을 경우 `ignore_abilities` 옵션을 설정할 수 있습니다.

```php
'watchers' => [
    Watchers\GateWatcher::class => [
        'enabled' => env('TELESCOPE_GATE_WATCHER', true),
        'ignore_abilities' => ['viewNova'],
    ],
    // ...
],
```

<a name="http-client-watcher"></a>
### HTTP 클라이언트 워처

HTTP 클라이언트 워처는 애플리케이션에서 발생하는 모든 [HTTP 클라이언트 요청](/docs/12.x/http-client)에 대한 정보를 기록합니다.

<a name="job-watcher"></a>
### 잡 워처

잡 워처는 애플리케이션에서 발생하는 [잡](/docs/12.x/queues)의 데이터와 상태를 기록합니다.

<a name="log-watcher"></a>
### 로그 워처

로그 워처는 애플리케이션에서 작성된 [로그 데이터](/docs/12.x/logging)를 기록합니다.

기본적으로 Telescope는 `error` 레벨 이상의 로그만 기록합니다. 필요하다면 `config/telescope.php` 설정 파일의 `level` 옵션을 변경하여 기록 대상을 조정할 수 있습니다.

```php
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

메일 워처는 애플리케이션에서 발송된 [이메일](/docs/12.x/mail)의 데이터와 함께 브라우저 내 미리보기를 제공합니다. 또한 이메일을 `.eml` 파일로 다운로드할 수도 있습니다.

<a name="model-watcher"></a>
### 모델 워처

모델 워처는 Eloquent [모델 이벤트](/docs/12.x/eloquent#events)가 발생할 때마다 해당 모델의 변경 사항을 기록합니다. 워처의 `events` 옵션으로 어떤 모델 이벤트를 기록할지 제어할 수 있습니다.

```php
'watchers' => [
    Watchers\ModelWatcher::class => [
        'enabled' => env('TELESCOPE_MODEL_WATCHER', true),
        'events' => ['eloquent.created*', 'eloquent.updated*'],
    ],
    // ...
],
```

특정 요청 동안 하이드레이트(hydrate)된 모델 개수를 기록하려면 `hydrations` 옵션을 켤 수 있습니다.

```php
'watchers' => [
    Watchers\ModelWatcher::class => [
        'enabled' => env('TELESCOPE_MODEL_WATCHER', true),
        'events' => ['eloquent.created*', 'eloquent.updated*'],
        'hydrations' => true,
    ],
    // ...
],
```

<a name="notification-watcher"></a>
### 알림 워처

알림 워처는 애플리케이션에서 발송된 모든 [알림](/docs/12.x/notifications)을 기록합니다. 알림이 이메일을 포함하고 메일 워처가 활성화되어 있을 때는, 해당 이메일도 메일 워처 화면에서 둘러볼 수 있습니다.

<a name="query-watcher"></a>
### 쿼리 워처

쿼리 워처는 애플리케이션에서 실행된 모든 쿼리의 순수 SQL, 바인딩, 실행 시간을 기록합니다. 100밀리초를 초과하는 쿼리는 자동으로 `slow`라는 태그가 붙습니다. 임계값은 워처의 `slow` 옵션으로 조정할 수 있습니다.

```php
'watchers' => [
    Watchers\QueryWatcher::class => [
        'enabled' => env('TELESCOPE_QUERY_WATCHER', true),
        'slow' => 50,
    ],
    // ...
],
```

<a name="redis-watcher"></a>
### Redis 워처

Redis 워처는 애플리케이션에서 실행된 모든 [Redis](/docs/12.x/redis) 명령어를 기록합니다. 캐시로 Redis를 사용할 경우, 캐시 관련 명령도 함께 기록됩니다.

<a name="request-watcher"></a>
### 요청 워처

요청 워처는 애플리케이션에서 처리한 모든 요청의 요청 데이터, 헤더, 세션, 응답 정보를 기록합니다. 특히 응답 데이터의 기록 용량은 `size_limit`(단위 KB) 옵션을 통해 제한할 수 있습니다.

```php
'watchers' => [
    Watchers\RequestWatcher::class => [
        'enabled' => env('TELESCOPE_REQUEST_WATCHER', true),
        'size_limit' => env('TELESCOPE_RESPONSE_SIZE_LIMIT', 64),
    ],
    // ...
],
```

<a name="schedule-watcher"></a>
### 스케줄 워처

스케줄 워처는 애플리케이션에서 실행한 [스케줄된 작업](/docs/12.x/scheduling)의 명령어와 출력을 기록합니다.

<a name="view-watcher"></a>
### 뷰 워처

뷰 워처는 [뷰](/docs/12.x/views) 렌더링 시 사용된 뷰 이름, 경로, 데이터, 컴포저(composer) 정보를 기록합니다.

<a name="displaying-user-avatars"></a>
## 사용자 아바타 표시

Telescope 대시보드는 각 엔트리가 저장될 당시 인증된 사용자의 아바타를 표시합니다. 기본적으로 Telescope는 Gravatar 웹 서비스를 활용해 아바타 이미지를 가져옵니다. 하지만 사용자의 ID와 이메일을 받아 아바타 이미지 URL을 반환하는 콜백을 `App\Providers\TelescopeServiceProvider` 클래스에 등록함으로써 아바타 경로를 자유롭게 커스터마이즈할 수 있습니다.

```php
use App\Models\User;
use Laravel\Telescope\Telescope;

/**
 * Register any application services.
 */
public function register(): void
{
    // ...

    Telescope::avatar(function (?string $id, ?string $email) {
        return ! is_null($id)
            ? '/avatars/'.User::find($id)->avatar_path
            : '/generic-avatar.jpg';
    });
}
```
