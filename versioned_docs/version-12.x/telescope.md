# 라라벨 텔레스코프 (Laravel Telescope)

- [소개](#introduction)
- [설치](#installation)
    - [로컬 전용 설치](#local-only-installation)
    - [설정](#configuration)
    - [데이터 정리(Pruning)](#data-pruning)
    - [대시보드 접근 권한 설정](#dashboard-authorization)
- [Telescope 업그레이드](#upgrading-telescope)
- [필터링](#filtering)
    - [엔트리 필터링](#filtering-entries)
    - [배치 필터링](#filtering-batches)
- [태그(Tag) 활용](#tagging)
- [사용 가능한 Watcher](#available-watchers)
    - [배치 Watcher](#batch-watcher)
    - [캐시 Watcher](#cache-watcher)
    - [명령어 Watcher](#command-watcher)
    - [Dump Watcher](#dump-watcher)
    - [이벤트 Watcher](#event-watcher)
    - [예외 Watcher](#exception-watcher)
    - [Gate Watcher](#gate-watcher)
    - [HTTP 클라이언트 Watcher](#http-client-watcher)
    - [Job Watcher](#job-watcher)
    - [로그 Watcher](#log-watcher)
    - [메일 Watcher](#mail-watcher)
    - [모델 Watcher](#model-watcher)
    - [알림 Watcher](#notification-watcher)
    - [쿼리 Watcher](#query-watcher)
    - [Redis Watcher](#redis-watcher)
    - [요청 Watcher](#request-watcher)
    - [스케줄 Watcher](#schedule-watcher)
    - [뷰 Watcher](#view-watcher)
- [사용자 아바타 표시](#displaying-user-avatars)

<a name="introduction"></a>
## 소개

[Laravel Telescope](https://github.com/laravel/telescope)는 로컬 라라벨 개발 환경에서 매우 유용하게 사용할 수 있는 도구입니다. Telescope를 사용하면 애플리케이션으로 들어오는 요청, 발생한 예외, 로그 기록, 데이터베이스 쿼리, 대기열 작업, 메일, 알림, 캐시 작업, 예약된 작업, 변수 덤프 등 다양한 정보를 한눈에 확인할 수 있습니다.

<img src="https://laravel.com/img/docs/telescope-example.png"/>

<a name="installation"></a>
## 설치

Composer 패키지 관리자를 사용하여 여러분의 라라벨 프로젝트에 Telescope를 설치할 수 있습니다.

```shell
composer require laravel/telescope
```

Telescope를 설치한 후, `telescope:install` 아티즌 명령어를 실행하여 Telescope의 에셋과 마이그레이션 파일을 배포합니다. 설치가 완료되면 `migrate` 명령어를 실행하여 Telescope가 데이터를 저장하는 데 필요한 테이블을 생성해야 합니다.

```shell
php artisan telescope:install

php artisan migrate
```

설치가 완료되면 `/telescope` 경로를 통해 Telescope 대시보드에 접근할 수 있습니다.

<a name="local-only-installation"></a>
### 로컬 전용 설치

Telescope를 오직 로컬 개발 환경에서만 사용하고자 한다면, 다음과 같이 `--dev` 플래그를 이용해 설치할 수 있습니다.

```shell
composer require laravel/telescope --dev

php artisan telescope:install

php artisan migrate
```

`telescope:install` 명령어를 실행한 후, `TelescopeServiceProvider` 서비스 프로바이더 등록을 애플리케이션의 `bootstrap/providers.php` 설정 파일에서 제거해야 합니다. 대신, `App\Providers\AppServiceProvider` 클래스의 `register` 메서드에서 Telescope의 서비스 프로바이더를 직접 등록하세요. 이때 현재 환경이 `local`인지 확인한 다음에만 등록하도록 해야 합니다.

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

그리고 Telescope 패키지가 [자동 패키지 발견](/docs/packages#package-discovery)에 포함되지 않도록, 아래와 같이 여러분의 `composer.json` 파일에 설정을 추가해야 합니다.

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

Telescope의 에셋을 배포한 후에는 `config/telescope.php`에서 주요 설정 파일을 확인할 수 있습니다. 이 파일을 통해 [Watcher 옵션](#available-watchers) 등 다양한 옵션을 설정할 수 있습니다. 각 설정에는 옵션의 목적에 대한 설명도 포함되어 있으니 꼭 꼼꼼히 살펴보시기 바랍니다.

필요하다면 아래와 같이 `enabled` 옵션을 통해 Telescope의 데이터 수집을 완전히 비활성화할 수 있습니다.

```php
'enabled' => env('TELESCOPE_ENABLED', true),
```

<a name="data-pruning"></a>
### 데이터 정리(Pruning)

데이터 정리를 하지 않으면 `telescope_entries` 테이블에 데이터가 빠르게 쌓일 수 있습니다. 이를 방지하기 위해 [스케줄러](/docs/scheduling)를 활용하여 `telescope:prune` 아티즌 명령어를 매일 실행하도록 예약하는 것이 좋습니다.

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('telescope:prune')->daily();
```

기본적으로 24시간이 지난 모든 엔트리는 자동으로 삭제됩니다. 만약 보관 기간을 조정하고 싶다면, 명령어 실행 시 `hours` 옵션을 사용할 수 있습니다. 아래 예시는 48시간이 지난 모든 레코드를 삭제합니다.

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('telescope:prune --hours=48')->daily();
```

<a name="dashboard-authorization"></a>
### 대시보드 접근 권한 설정

Telescope 대시보드는 `/telescope` 경로를 통해 접근할 수 있습니다. 기본적으로 `local` 환경에서만 접근이 허용됩니다. `app/Providers/TelescopeServiceProvider.php` 파일 안에는 [인가 게이트](/docs/authorization#gates) 정의가 포함되어 있으며, 이 게이트는 **비로컬 환경**에서의 Telescope 접근 권한을 제어합니다. 필요에 따라 이 게이트를 수정하고, Telescope 설치에 대한 접근 권한을 조정할 수 있습니다.

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
> 실제 프로덕션 환경에서는 반드시 `APP_ENV` 환경 변수를 `production`으로 설정해야 합니다. 그렇지 않으면 Telescope 대시보드가 외부에 공개될 수 있습니다.

<a name="upgrading-telescope"></a>
## Telescope 업그레이드

Telescope의 새로운 주요 버전으로 업그레이드할 때는 [업그레이드 가이드](https://github.com/laravel/telescope/blob/master/UPGRADE.md)를 꼭 꼼꼼히 확인해야 합니다.

또한, 최신 버전의 Telescope로 업그레이드할 때마다 에셋을 다시 배포해야 합니다.

```shell
php artisan telescope:publish
```

에셋을 항상 최신 상태로 유지하고, 이후의 업데이트에서 발생할 수 있는 문제를 예방하려면, 아래와 같이 `vendor:publish --tag=laravel-assets` 명령어를 애플리케이션의 `composer.json` 파일 내 `post-update-cmd` 스크립트에 추가하는 것이 좋습니다.

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

`App\Providers\TelescopeServiceProvider` 클래스 내에 정의된 `filter` 클로저를 통해 Telescope가 기록할 데이터를 세밀하게 필터링할 수 있습니다. 기본적으로 이 클로저는 `local` 환경에서 모든 데이터를 기록하며, 그 외 환경에서는 예외, 실패한 작업, 예약된 작업, 모니터링 태그가 지정된 데이터만 기록합니다.

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

`filter` 클로저가 개별 엔트리 데이터를 필터링한다면, `filterBatch` 메서드는 하나의 요청 혹은 콘솔 명령 전체에 대해 필터링할 수 있는 클로저를 등록합니다. 클로저가 `true`를 반환하면 해당 요청 또는 명령에서 발생한 모든 데이터가 Telescope에 기록됩니다.

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
## 태그(Tag) 활용

Telescope는 각 엔트리를 "태그"로 검색할 수 있는 기능을 제공합니다. 보통 Eloquent 모델 클래스명이나 인증된 사용자 ID 등이 엔트리에 자동으로 태그로 추가됩니다. 필요에 따라 엔트리에 커스텀 태그를 직접 지정하고 싶다면, `Telescope::tag` 메서드를 사용하세요. 이 메서드는 태그 배열을 반환하는 클로저를 인자로 받으며, 반환된 태그들은 Telescope가 자동으로 붙이는 태그와 합쳐집니다. 일반적으로 `App\Providers\TelescopeServiceProvider` 클래스의 `register` 메서드에서 호출하면 됩니다.

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
## 사용 가능한 Watcher

Telescope의 "Watcher" 기능은 요청이나 콘솔 명령이 실행될 때 애플리케이션의 다양한 데이터를 수집합니다. 어떤 Watcher를 사용할지 여부는 `config/telescope.php` 설정 파일에서 지정할 수 있습니다.

```php
'watchers' => [
    Watchers\CacheWatcher::class => true,
    Watchers\CommandWatcher::class => true,
    // ...
],
```

일부 Watcher는 추가 옵션을 통해 더 세밀하게 동작을 조정할 수 있습니다.

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
### 배치 Watcher

배치 Watcher는 큐에 등록된 [배치 작업](/docs/queues#job-batching)과 관련한 작업, 연결 정보 등을 기록합니다.

<a name="cache-watcher"></a>
### 캐시 Watcher

캐시 Watcher는 캐시 키의 적중(hit), 실패(miss), 업데이트, 삭제(forgotten) 기록 정보를 저장합니다.

<a name="command-watcher"></a>
### 명령어 Watcher

명령어 Watcher는 아티즌 명령어가 실행될 때마다 인수, 옵션, 종료 코드, 출력 결과 등을 기록합니다. 특정 명령어를 Watcher가 기록하지 않도록 하려면, `config/telescope.php` 파일의 `ignore` 옵션에 명령어를 등록할 수 있습니다.

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
### Dump Watcher

Dump Watcher는 코드에서 변수를 `dump` 함수로 출력하면 그 결과를 Telescope에서 기록하고 보여줍니다. 이 기능을 사용하기 위해서는 브라우저에서 Dump Watcher 탭이 열려 있어야만 실제로 변수 덤프가 기록됩니다. 그렇지 않으면 dump 호출 결과가 무시됩니다.

<a name="event-watcher"></a>
### 이벤트 Watcher

이벤트 Watcher는 애플리케이션에서 발생시킨 [이벤트](/docs/events)의 페이로드, 리스너, 브로드캐스트 데이터 등을 기록합니다. 라라벨 프레임워크 내부에서 발생하는 이벤트는 Watcher에서 자동으로 무시됩니다.

<a name="exception-watcher"></a>
### 예외 Watcher

예외 Watcher는 애플리케이션에서 발생하여 보고 가능한(reportable) 예외의 데이터와 스택 트레이스를 기록합니다.

<a name="gate-watcher"></a>
### Gate Watcher

Gate Watcher는 애플리케이션에서 [Gate 및 Policy](/docs/authorization) 인가 검사를 수행할 때 해당 데이터와 결과를 기록합니다. 기록에서 제외하고 싶은 특정 ability가 있다면, `config/telescope.php` 파일의 `ignore_abilities` 옵션에 추가할 수 있습니다.

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
### HTTP 클라이언트 Watcher

HTTP 클라이언트 Watcher는 애플리케이션에서 발생한 [HTTP 클라이언트 요청](/docs/http-client) 정보를 기록합니다.

<a name="job-watcher"></a>
### Job Watcher

Job Watcher는 애플리케이션에서 발생한 [큐 작업](/docs/queues)의 데이터 및 상태를 기록합니다.

<a name="log-watcher"></a>
### 로그 Watcher

로그 Watcher는 애플리케이션에서 기록된 [로그 데이터](/docs/logging)를 저장합니다.

기본적으로 Telescope는 `error` 레벨 이상의 로그만 기록합니다. 이 동작을 바꾸고 싶다면, `config/telescope.php`의 `level` 옵션을 변경하면 됩니다.

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
### 메일 Watcher

메일 Watcher를 통해 애플리케이션에서 보낸 [이메일](/docs/mail)과 해당 데이터의 브라우저 내 미리보기가 가능합니다. 또한 메일을 `.eml` 파일로 다운로드할 수도 있습니다.

<a name="model-watcher"></a>
### 모델 Watcher

모델 Watcher는 Eloquent [모델 이벤트](/docs/eloquent#events)가 발생할 때 모델의 변경 사항을 기록합니다. 어떤 이벤트를 기록할지는 `events` 옵션에서 직접 지정할 수 있습니다.

```php
'watchers' => [
    Watchers\ModelWatcher::class => [
        'enabled' => env('TELESCOPE_MODEL_WATCHER', true),
        'events' => ['eloquent.created*', 'eloquent.updated*'],
    ],
    // ...
],
```

특정 요청 동안 생성(hydrate)된 모델의 개수를 기록하고 싶다면 `hydrations` 옵션을 활성화하면 됩니다.

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
### 알림 Watcher

알림 Watcher는 애플리케이션에서 전송한 [알림](/docs/notifications) 전체를 기록합니다. 만약 알림이 이메일을 트리거하고 메일 Watcher가 활성화된 경우, 해당 이메일도 메일 Watcher 화면에서 함께 확인할 수 있습니다.

<a name="query-watcher"></a>
### 쿼리 Watcher

쿼리 Watcher는 모든 SQL 쿼리의 원문, 바인딩, 실행 시간을 기록합니다. 100밀리초보다 느린 쿼리는 자동으로 `slow` 태그가 추가됩니다. `slow` 옵션을 통해 느린 쿼리 임계값을 직접 지정할 수도 있습니다.

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
### Redis Watcher

Redis Watcher는 애플리케이션에서 수행한 모든 [Redis](/docs/redis) 명령을 기록합니다. Redis를 캐시 용도로 사용중이라면 캐시 관련 명령도 포함되어 기록됩니다.

<a name="request-watcher"></a>
### 요청 Watcher

요청 Watcher는 애플리케이션에서 처리하는 요청, 헤더, 세션, 응답 관련 데이터를 기록합니다. 기록할 응답 데이터의 크기는 `size_limit`(킬로바이트 단위) 옵션으로 제한할 수 있습니다.

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
### 스케줄 Watcher

스케줄 Watcher는 애플리케이션에서 실행한 [예약 작업](/docs/scheduling)의 명령어와 출력 결과를 기록합니다.

<a name="view-watcher"></a>
### 뷰 Watcher

뷰 Watcher는 [뷰](/docs/views)의 이름, 경로, 데이터, 뷰 컴포저 정보 등을 기록합니다.

<a name="displaying-user-avatars"></a>
## 사용자 아바타 표시

Telescope 대시보드는 각 엔트리가 저장될 당시 인증된 사용자의 아바타를 표시합니다. 기본적으로 Telescope는 Gravatar 웹 서비스를 이용해 아바타를 불러옵니다. 하지만 아바타 URL을 자신만의 규칙으로 커스터마이징하고 싶다면, `App\Providers\TelescopeServiceProvider` 클래스에 콜백 함수를 등록할 수 있습니다. 이 콜백은 사용자의 ID와 이메일을 받아서 그에 맞는 아바타 이미지의 URL을 반환해야 합니다.

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
