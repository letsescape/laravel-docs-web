# 라라벨 텔레스코프 (Laravel Telescope)

- [소개](#introduction)
- [설치](#installation)
    - [로컬 전용 설치](#local-only-installation)
    - [설정](#configuration)
    - [데이터 정리(삭제)](#data-pruning)
    - [대시보드 접근 권한](#dashboard-authorization)
- [텔레스코프 업그레이드](#upgrading-telescope)
- [필터링](#filtering)
    - [엔트리 필터링](#filtering-entries)
    - [배치 단위 필터링](#filtering-batches)
- [태깅(태그 붙이기)](#tagging)
- [사용 가능한 워처](#available-watchers)
    - [배치 워처](#batch-watcher)
    - [캐시 워처](#cache-watcher)
    - [커맨드 워처](#command-watcher)
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
    - [요청 워처](#request-watcher)
    - [스케줄 워처](#schedule-watcher)
    - [뷰 워처](#view-watcher)
- [사용자 아바타 표시](#displaying-user-avatars)

<a name="introduction"></a>
## 소개

[Laravel Telescope](https://github.com/laravel/telescope)는 로컬 환경에서 라라벨 애플리케이션을 개발할 때 뛰어난 동반자가 되어줍니다. Telescope는 애플리케이션에 들어오는 요청, 예외, 로그 엔트리, 데이터베이스 쿼리, 큐에 등록된 잡, 메일, 알림, 캐시 작업, 예약된 작업, 변수 덤프 등 다양한 정보를 자세하게 확인할 수 있게 도와줍니다.

<img src="https://laravel.com/img/docs/telescope-example.png" />

<a name="installation"></a>
## 설치

Telescope를 라라벨 프로젝트에 설치하려면 Composer 패키지 매니저를 사용할 수 있습니다:

```shell
composer require laravel/telescope
```

Telescope를 설치한 뒤, `telescope:install` 아티즌 명령어로 에셋 및 마이그레이션을 게시합니다. 이후, Telescope가 데이터를 저장하는 데 필요한 테이블을 생성하기 위해 `migrate` 명령어도 실행해야 합니다:

```shell
php artisan telescope:install

php artisan migrate
```

마지막으로, `/telescope` 경로로 접속해 Telescope 대시보드에 접근할 수 있습니다.

<a name="local-only-installation"></a>
### 로컬 전용 설치

Telescope를 개발용 로컬 환경에서만 사용할 계획이라면, 설치 시 `--dev` 플래그를 사용할 수 있습니다:

```shell
composer require laravel/telescope --dev

php artisan telescope:install

php artisan migrate
```

`telescope:install` 명령을 실행한 후에는, 애플리케이션의 `bootstrap/providers.php` 설정 파일에 등록된 `TelescopeServiceProvider` 서비스 프로바이더를 제거하는 것이 좋습니다. 대신, Telescope의 서비스 프로바이더를 `App\Providers\AppServiceProvider` 클래스의 `register` 메서드에서 직접 등록하십시오. 아래와 같이 현재 환경이 `local`일 때만 프로바이더를 등록하도록 작성합니다:

```
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

또한, Telescope 패키지가 [자동 패키지 발견](/docs/11.x/packages#package-discovery)에 포함되지 않도록 `composer.json` 파일에 다음 내용을 추가하여 auto-discover 기능을 비활성화해야 합니다:

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

Telescope의 에셋을 게시한 후, 기본 설정 파일은 `config/telescope.php`에 위치하게 됩니다. 이 설정 파일에서는 [워처 옵션](#available-watchers) 등 다양한 설정을 변경할 수 있습니다. 각 옵션에는 해당 기능의 목적에 대한 설명이 포함되어 있으므로, 꼭 내용을 꼼꼼히 살펴보시는 것이 좋습니다.

필요에 따라 Telescope의 데이터 수집 자체를 `enabled` 설정 옵션을 사용해 완전히 비활성화할 수도 있습니다:

```
'enabled' => env('TELESCOPE_ENABLED', true),
```

<a name="data-pruning"></a>
### 데이터 정리(삭제)

데이터 정리를 하지 않으면 `telescope_entries` 테이블에 기록이 빠르게 쌓일 수 있습니다. 이를 방지하려면, [스케줄링](/docs/11.x/scheduling) 기능을 활용해 `telescope:prune` 아티즌 명령어를 매일 실행하도록 예약할 것을 권장합니다.

```
use Illuminate\Support\Facades\Schedule;

Schedule::command('telescope:prune')->daily();
```

기본적으로 24시간이 지난 엔트리는 모두 삭제됩니다. 명령어 실행 시 `hours` 옵션을 사용해 데이터 보관 기간을 조정할 수도 있습니다. 예를 들어 아래와 같이 48시간 이상 된 데이터를 삭제하는 것도 가능합니다:

```
use Illuminate\Support\Facades\Schedule;

Schedule::command('telescope:prune --hours=48')->daily();
```

<a name="dashboard-authorization"></a>
### 대시보드 접근 권한

Telescope 대시보드는 `/telescope` 경로에서 접근할 수 있습니다. 기본적으로 `local` 환경에서만 대시보드에 접속할 수 있습니다. `app/Providers/TelescopeServiceProvider.php` 파일에는 [인가 게이트](/docs/11.x/authorization#gates) 정의가 포함되어 있으며, 이 게이트는 **non-local**(로컬 이외) 환경에서의 Telescope 접근 권한을 제어합니다. 필요에 따라 아래와 같이 접근 조건을 변경하여 Telescope 설치본에 대한 접근을 제한할 수 있습니다:

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
> 실제 운영 환경에서는 반드시 `APP_ENV` 환경 변수 값을 `production`으로 변경해야 합니다. 그렇지 않으면, Telescope 대시보드가 외부에 공개될 수 있습니다.

<a name="upgrading-telescope"></a>
## 텔레스코프 업그레이드

Telescope의 메이저 버전으로 업그레이드할 때는, 반드시 [업그레이드 가이드](https://github.com/laravel/telescope/blob/master/UPGRADE.md)를 꼼꼼히 확인하셔야 합니다.

또한, Telescope를 어떤 새 버전으로 업그레이드할 때마다 Telescope의 에셋을 다시 게시해주는 것이 좋습니다:

```shell
php artisan telescope:publish
```

에셋을 항상 최신으로 유지하고, 향후 업데이트 시 발생할 수 있는 문제를 예방하려면, 애플리케이션 `composer.json` 파일의 `post-update-cmd` 스크립트에 아래 명령어를 추가할 것을 추천합니다:

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

Telescope가 기록하는 데이터를 `App\Providers\TelescopeServiceProvider` 클래스에 정의한 `filter` 클로저를 통해 필터링할 수 있습니다. 기본적으로 이 클로저는 `local` 환경에서는 모든 데이터를 기록하고, 그 외 환경에서는 예외, 실패한 잡, 예약된 작업, 느린 쿼리, 모니터링 태그가 추가된 데이터만 기록합니다:

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
### 배치 단위 필터링

`filter` 클로저가 개별 엔트리를 필터링하는 반면, `filterBatch` 메서드를 사용하면 하나의 요청 또는 콘솔 명령 단위로 전체 데이터를 필터링하는 클로저를 등록할 수 있습니다. 이 클로저가 `true`를 반환하면, 해당 배치의 모든 엔트리가 기록됩니다:

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
## 태깅(태그 붙이기)

Telescope는 엔트리에 "태그(tag)"를 붙여 검색할 수 있도록 지원합니다. 보통 태그는 Eloquent 모델의 클래스명이나 인증된 사용자 ID 등으로 자동 추가됩니다. 때에 따라서 직접 원하는 커스텀 태그를 엔트리에 붙이고 싶다면, `Telescope::tag` 메서드를 사용할 수 있습니다. 이 메서드는 태그 배열을 반환하는 클로저를 인수로 받으며, 반환된 태그는 Telescope가 자동으로 추가하는 태그와 합쳐서 저장됩니다. 주로 `App\Providers\TelescopeServiceProvider` 클래스의 `register` 메서드에서 호출하면 좋습니다:

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
## 사용 가능한 워처

Telescope의 "워처(Watcher)"는 웹 요청이나 콘솔 명령 실행 시 발생하는 애플리케이션 데이터를 수집하는 역할을 합니다. 어떤 워처를 활성화할 것인지는 `config/telescope.php` 설정 파일에서 지정할 수 있습니다:

```
'watchers' => [
    Watchers\CacheWatcher::class => true,
    Watchers\CommandWatcher::class => true,
    ...
],
```

일부 워처는 추가적인 옵션 설정도 가능합니다:

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

배치 워처는 큐에 등록된 [배치 작업](/docs/11.x/queues#job-batching)에 대한 정보(잡, 연결 정보 등)를 기록합니다.

<a name="cache-watcher"></a>
### 캐시 워처

캐시 워처는 캐시 키의 조회(hit), 미스(miss), 갱신, 삭제 등이 발생할 때 데이터를 기록합니다.

<a name="command-watcher"></a>
### 커맨드 워처

커맨드 워처는 아티즌 명령어가 실행될 때 넘겨진 인수, 옵션, 종료 코드, 실행 결과 출력 등의 정보를 기록합니다. 특정 명령어를 워처로부터 제외하고 싶을 경우, `config/telescope.php` 파일 내 `ignore` 옵션에 명령어명을 지정하면 됩니다:

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

덤프 워처는 변수 덤프 값을 Telescope 내에서 기록하고 보여줍니다. 라라벨에서 `dump` 글로벌 함수를 사용해 변수를 덤프할 수 있습니다. 단, 덤프 워처 탭이 브라우저에서 열려 있어야만 덤프 데이터가 기록되며, 그렇지 않은 경우 워처는 덤프를 무시합니다.

<a name="event-watcher"></a>
### 이벤트 워처

이벤트 워처는 애플리케이션에서 발생한 [이벤트](/docs/11.x/events)의 페이로드, 리스너, 브로드캐스트 데이터 등을 기록합니다. 라라벨 프레임워크 내부 이벤트는 기본적으로 무시됩니다.

<a name="exception-watcher"></a>
### 예외 워처

예외 워처는 애플리케이션에서 발생한 보고 가능한 예외와 관련된 데이터, 스택 트레이스를 기록합니다.

<a name="gate-watcher"></a>
### 게이트 워처

게이트 워처는 애플리케이션에서 [게이트 및 정책](/docs/11.x/authorization) 검사가 수행될 때의 데이터와 결과를 기록합니다. 특정 권한(ability)을 레코딩 대상에서 제외하려면, `config/telescope.php` 파일의 `ignore_abilities` 옵션에 해당 권한명을 지정할 수 있습니다:

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

HTTP 클라이언트 워처는 애플리케이션에서 발생한 [HTTP 클라이언트 요청](/docs/11.x/http-client) 내역을 기록합니다.

<a name="job-watcher"></a>
### 잡 워처

잡 워처는 애플리케이션에서 큐에 전달된 [잡](/docs/11.x/queues)의 데이터와 상태를 기록합니다.

<a name="log-watcher"></a>
### 로그 워처

로그 워처는 애플리케이션에서 기록한 [로그 데이터](/docs/11.x/logging)를 수집합니다.

기본적으로 Telescope는 `error` 레벨 이상의 로그만 기록합니다. 이 동작을 바꾸고 싶다면, `config/telescope.php` 설정 파일 내 `level` 옵션을 수정하면 됩니다:

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

메일 워처는 애플리케이션이 보낸 [이메일](/docs/11.x/mail)의 미리보기(브라우저에서 확인 가능) 및 관련 데이터를 보여줍니다. 또한, 이메일을 `.eml` 파일로 다운로드 받을 수도 있습니다.

<a name="model-watcher"></a>
### 모델 워처

모델 워처는 Eloquent [모델 이벤트](/docs/11.x/eloquent#events)가 발생할 때 모델 변경 내역을 기록합니다. 기록할 모델 이벤트는 워처의 `events` 옵션을 통해 지정할 수 있습니다:

```
'watchers' => [
    Watchers\ModelWatcher::class => [
        'enabled' => env('TELESCOPE_MODEL_WATCHER', true),
        'events' => ['eloquent.created*', 'eloquent.updated*'],
    ],
    ...
],
```

특정 요청 중에 하이드레이트(hydrate)된 모델 수까지 기록하려면 `hydrations` 옵션을 활성화하세요:

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

알림 워처는 애플리케이션에서 보낸 모든 [알림](/docs/11.x/notifications)을 기록합니다. 만약 알림이 이메일을 트리거하면서 메일 워처가 활성화되어 있다면, 해당 이메일도 메일 워처 화면에서 미리보기로 볼 수 있습니다.

<a name="query-watcher"></a>
### 쿼리 워처

쿼리 워처는 애플리케이션에서 실행된 모든 쿼리의 원본 SQL, 바인딩, 실행 시간 등을 기록합니다. 기본적으로 100밀리초를 초과하는 쿼리는 `slow` 태그가 붙습니다. 느린 쿼리 임계값은 워처의 `slow` 옵션으로 조정할 수 있습니다:

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

Redis 워처는 애플리케이션에서 실행한 모든 [Redis](/docs/11.x/redis) 명령을 기록합니다. 캐시 스토리지로 Redis를 사용하는 경우, 캐시 관련 명령도 이 워처에 기록됩니다.

<a name="request-watcher"></a>
### 요청 워처

요청 워처는 애플리케이션에서 처리된 요청, 헤더, 세션, 응답 데이터 등을 기록합니다. 기록되는 응답 데이터의 크기는 `size_limit` 옵션(단위: KB)으로 제한할 수 있습니다:

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
### 스케줄 워처

스케줄 워처는 애플리케이션이 실행하는 [예약 작업(스케줄)](/docs/11.x/scheduling)의 명령과 출력값을 기록합니다.

<a name="view-watcher"></a>
### 뷰 워처

뷰 워처는 뷰의 [이름](/docs/11.x/views), 경로, 뷰 데이터, 렌더링 시 사용된 "컴포저" 정보를 기록합니다.

<a name="displaying-user-avatars"></a>
## 사용자 아바타 표시

Telescope 대시보드는 각 엔트리가 저장될 당시 인증된 사용자의 아바타 이미지를 표시합니다. 기본적으로 Gravatar 웹 서비스를 통해 아바타를 가져오지만, 원하는 경우 `App\Providers\TelescopeServiceProvider` 클래스에서 콜백을 등록해 아바타 URL을 직접 지정할 수 있습니다. 콜백에는 사용자 ID와 이메일이 전달되며, 해당 사용자의 아바타 이미지 URL을 반환하면 됩니다:

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