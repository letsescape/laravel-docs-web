# 라라벨 텔레스코프 (Laravel Telescope)

- [소개](#introduction)
- [설치](#installation)
    - [로컬 전용 설치](#local-only-installation)
    - [설정](#configuration)
    - [데이터 정리(Pruning)](#data-pruning)
    - [대시보드 접근 권한](#dashboard-authorization)
- [텔레스코프 업그레이드](#upgrading-telescope)
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

[Laravel Telescope](https://github.com/laravel/telescope)는 로컬 환경에서 라라벨 개발을 도와주는 훌륭한 도구입니다. 텔레스코프는 애플리케이션으로 들어오는 요청, 예외, 로그 기록, 데이터베이스 쿼리, 큐 잡, 메일, 알림, 캐시 동작, 예약 작업, 변수 덤프 등 다양한 정보를 실시간으로 확인할 수 있는 기능을 제공합니다.

<img src="https://laravel.com/img/docs/telescope-example.png" />

<a name="installation"></a>
## 설치

Composer 패키지 관리자를 사용하여 텔레스코프를 라라벨 프로젝트에 설치할 수 있습니다:

```shell
composer require laravel/telescope
```

설치가 완료되면, `telescope:install` 아티즌 명령어로 텔레스코프의 에셋을 배포합니다. 그리고 나서, 텔레스코프가 데이터를 저장하는 데 필요한 테이블을 생성하기 위해 `migrate` 명령어를 실행해야 합니다:

```shell
php artisan telescope:install

php artisan migrate
```

<a name="migration-customization"></a>
#### 마이그레이션 커스터마이징

기본적으로 제공되는 텔레스코프의 마이그레이션을 사용하지 않으려면, 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `register` 메서드에서 `Telescope::ignoreMigrations` 메서드를 호출해야 합니다. 기본 마이그레이션 파일을 내보내려면 다음 명령어를 사용할 수 있습니다: `php artisan vendor:publish --tag=telescope-migrations`

<a name="local-only-installation"></a>
### 로컬 전용 설치

로컬 개발에서만 텔레스코프를 사용하려면, `--dev` 플래그를 활용해 설치하는 것이 좋습니다:

```shell
composer require laravel/telescope --dev

php artisan telescope:install

php artisan migrate
```

`telescope:install` 실행 후, `config/app.php` 파일에서 `TelescopeServiceProvider` 서비스 프로바이더 등록을 제거해야 합니다. 대신, `App\Providers\AppServiceProvider` 클래스의 `register` 메서드에서 아래와 같이 직접 프로바이더를 등록해야 합니다. 이때 현재 환경이 `local`일 때만 프로바이더를 등록하도록 처리합니다:

```
/**
 * Register any application services.
 *
 * @return void
 */
public function register()
{
    if ($this->app->environment('local')) {
        $this->app->register(\Laravel\Telescope\TelescopeServiceProvider::class);
        $this->app->register(TelescopeServiceProvider::class);
    }
}
```

마지막으로, `composer.json` 파일 내의 `extra` 항목에 아래와 같이 추가하여 텔레스코프 패키지가 [자동으로 디스커버](/docs/9.x/packages#package-discovery) 되지 않도록 해야 합니다:

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

텔레스코프의 에셋을 배포한 후에는 주 설정 파일이 `config/telescope.php`에 위치하게 됩니다. 이 설정 파일에서는 [워처 옵션](#available-watchers) 등 다양한 옵션을 조정할 수 있습니다. 각 설정 항목에는 용도에 대한 설명이 충분히 포함되어 있으니, 자세히 살펴보시기 바랍니다.

원한다면 전체적으로 텔레스코프의 데이터 수집 기능을 `enabled` 옵션으로 비활성화할 수도 있습니다:

```
'enabled' => env('TELESCOPE_ENABLED', true),
```

<a name="data-pruning"></a>
### 데이터 정리(Pruning)

데이터를 정리하지 않으면 `telescope_entries` 테이블에 레코드가 빠르게 쌓일 수 있습니다. 이를 방지하기 위해 [스케줄링](/docs/9.x/scheduling) 기능을 이용하여 매일 `telescope:prune` 아티즌 명령어가 실행되도록 해야 합니다:

```
$schedule->command('telescope:prune')->daily();
```

기본적으로 24시간이 지난 모든 엔트리가 자동으로 삭제됩니다. 만약 더 긴 기간 데이터를 보관하고 싶다면, `hours` 옵션을 추가해서 유지 기간을 조정할 수 있습니다. 예를 들어, 아래와 같이 하면 48시간이 지난 데이터가 삭제됩니다:

```
$schedule->command('telescope:prune --hours=48')->daily();
```

<a name="dashboard-authorization"></a>
### 대시보드 접근 권한

텔레스코프 대시보드는 `/telescope` 경로에서 접근할 수 있습니다. 기본적으로는 `local` 환경에서만 접속할 수 있습니다. 운영 환경 등 **로컬이 아닌** 환경에서의 접근을 통제하는 [인가 게이트](/docs/9.x/authorization#gates) 정의가 `app/Providers/TelescopeServiceProvider.php` 파일에 포함되어 있습니다. 이 게이트를 원하는 대로 수정하여 텔레스코프 대시보드 접근을 제한할 수 있습니다:

```
/**
 * Register the Telescope gate.
 *
 * This gate determines who can access Telescope in non-local environments.
 *
 * @return void
 */
protected function gate()
{
    Gate::define('viewTelescope', function ($user) {
        return in_array($user->email, [
            'taylor@laravel.com',
        ]);
    });
}
```

> [!WARNING]
> 운영 환경에서는 `APP_ENV` 환경 변수를 반드시 `production`으로 설정해야 합니다. 그렇지 않으면 텔레스코프 대시보드가 외부에 공개될 수 있습니다.

<a name="upgrading-telescope"></a>
## 텔레스코프 업그레이드

Telescope의 새 주요 버전으로 업그레이드할 때에는 반드시 [업그레이드 가이드](https://github.com/laravel/telescope/blob/master/UPGRADE.md)를 꼼꼼하게 확인해야 합니다.

또한, 텔레스코프의 새 버전으로 업그레이드할 때마다 아래의 명령어로 관련 에셋을 항상 다시 배포해야 합니다:

```shell
php artisan telescope:publish
```

향후 업데이트 시 문제를 방지하고 에셋을 항상 최신 상태로 유지하기 위해, `composer.json`의 `post-update-cmd` 스크립트에 `vendor:publish --tag=laravel-assets` 명령어를 추가하는 것이 좋습니다:

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

`App\Providers\TelescopeServiceProvider` 클래스에서 정의된 `filter` 클로저를 사용하여 텔레스코프가 기록할 데이터를 세밀하게 제어할 수 있습니다. 기본적으로 이 클로저는 `local` 환경에서 모든 데이터를 기록하며, 그 외의 환경에서는 예외, 실패한 잡, 예약 작업, 모니터링된 태그가 포함된 데이터만 기록합니다:

```
use Laravel\Telescope\IncomingEntry;
use Laravel\Telescope\Telescope;

/**
 * Register any application services.
 *
 * @return void
 */
public function register()
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

`filter` 클로저가 개별 엔트리를 필터링하는 반면, `filterBatch` 메서드를 사용하면 하나의 요청 또는 콘솔 명령 전체에 대한 모든 데이터를 필터링할 수 있습니다. 클로저에서 `true`를 반환하면 해당 요청의 모든 엔트리가 텔레스코프에 기록됩니다:

```
use Illuminate\Support\Collection;
use Laravel\Telescope\Telescope;

/**
 * Register any application services.
 *
 * @return void
 */
public function register()
{
    $this->hideSensitiveRequestDetails();

    Telescope::filterBatch(function (Collection $entries) {
        if ($this->app->environment('local')) {
            return true;
        }

        return $entries->contains(function ($entry) {
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

텔레스코프는 "태그"를 통해 엔트리를 검색할 수 있도록 지원합니다. 보통 태그는 Eloquent 모델 클래스명이나 인증된 사용자 ID 등 텔레스코프가 자동으로 엔트리에 추가하는 값입니다. 가끔 직접 원하는 사용자 정의 태그를 추가하고 싶을 때에는 `Telescope::tag` 메서드를 사용하면 됩니다. `tag` 메서드는 태그 배열을 반환해야 하는 클로저를 인수로 받으며, 반환된 태그는 텔레스코프가 자동으로 붙이는 태그와 합쳐집니다. 일반적으로 `App\Providers\TelescopeServiceProvider` 클래스의 `register` 메서드 내에서 `tag`를 호출합니다:

```
use Laravel\Telescope\IncomingEntry;
use Laravel\Telescope\Telescope;

/**
 * Register any application services.
 *
 * @return void
 */
public function register()
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

텔레스코프의 "워처(watcher)"는 HTTP 요청 또는 콘솔 명령이 실행될 때 애플리케이션의 다양한 데이터를 수집합니다. 어떤 워처를 사용할지 `config/telescope.php` 설정 파일에서 자유롭게 조정할 수 있습니다:

```
'watchers' => [
    Watchers\CacheWatcher::class => true,
    Watchers\CommandWatcher::class => true,
    ...
],
```

몇몇 워처는 추가 옵션을 통해 세부 동작을 설정할 수도 있습니다:

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

배치 워처는 큐에 등록된 [배치](/docs/9.x/queues#job-batching)에 대한 정보(잡, 연결 정보 등)를 기록합니다.

<a name="cache-watcher"></a>
### 캐시 워처

캐시 워처는 캐시 키가 적중, 미스(hit, miss), 업데이트, 삭제(포가튼)될 때의 데이터를 기록합니다.

<a name="command-watcher"></a>
### 명령어 워처

명령어 워처는 Artisan 명령어가 실행될 때 인수, 옵션, 종료 코드, 출력 결과를 기록합니다. 특정 명령어를 기록 대상에서 제외하고 싶다면 `config/telescope.php` 파일의 `ignore` 옵션에 제외할 명령어 이름을 추가하면 됩니다:

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

덤프 워처는 변수 덤프를 기록하여 텔레스코프 대시보드에서 보여줍니다. 라라벨에서 전역 `dump` 함수를 사용해 변수를 덤프할 수 있습니다. 이때 덤프 워처 탭이 브라우저에서 열려 있어야만 데이터가 기록됩니다. 탭이 열려 있지 않으면 덤프는 무시됩니다.

<a name="event-watcher"></a>
### 이벤트 워처

이벤트 워처는 애플리케이션에서 발생하는 [이벤트](/docs/9.x/events)의 페이로드, 리스너, 브로드캐스트 데이터 등을 기록합니다. 라라벨 프레임워크의 내부 이벤트는 기록 대상에서 제외됩니다.

<a name="exception-watcher"></a>
### 예외 워처

예외 워처는 애플리케이션에서 발생하는 예외 중 보고 가능한 예외의 데이터와 스택 트레이스를 기록합니다.

<a name="gate-watcher"></a>
### Gate 워처

Gate 워처는 [게이트와 정책(gate, policy)](/docs/9.x/authorization) 확인 시의 데이터와 결과를 기록합니다. 특정 능력을 기록에서 제외하고 싶다면 `config/telescope.php`의 `ignore_abilities` 옵션을 활용하면 됩니다:

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

HTTP 클라이언트 워처는 애플리케이션에서 외부로 전송하는 [HTTP 클라이언트 요청](/docs/9.x/http-client)을 기록합니다.

<a name="job-watcher"></a>
### 잡 워처

잡 워처는 애플리케이션에서 발생하는 [잡](/docs/9.x/queues)의 데이터와 상태를 기록합니다.

<a name="log-watcher"></a>
### 로그 워처

로그 워처는 애플리케이션에서 작성된 [로그 데이터](/docs/9.x/logging)를 모두 기록합니다.

<a name="mail-watcher"></a>
### 메일 워처

메일 워처를 사용하면 애플리케이션에서 발송한 [이메일](/docs/9.x/mail) 미리보기를 브라우저에서 확인할 수 있으며, 이메일 관련 데이터도 함께 볼 수 있습니다. 또한 이메일을 `.eml` 파일로 다운로드할 수도 있습니다.

<a name="model-watcher"></a>
### 모델 워처

모델 워처는 Eloquent [모델 이벤트](/docs/9.x/eloquent#events)가 발생할 때마다 모델의 변경 내역을 기록합니다. 어떤 모델 이벤트를 기록할지 `events` 옵션으로 지정할 수 있습니다:

```
'watchers' => [
    Watchers\ModelWatcher::class => [
        'enabled' => env('TELESCOPE_MODEL_WATCHER', true),
        'events' => ['eloquent.created*', 'eloquent.updated*'],
    ],
    ...
],
```

요청 중에 하이드레이션된(Eloquent로부터 인스턴스화된) 모델 개수까지 기록하려면 `hydrations` 옵션을 활성화하면 됩니다:

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

알림 워처는 애플리케이션에서 발생하는 모든 [알림](/docs/9.x/notifications)을 기록합니다. 해당 알림이 이메일을 포함하고, 메일 워처도 활성화되어 있다면 이메일 미리보기도 메일 워처 화면에서 볼 수 있습니다.

<a name="query-watcher"></a>
### 쿼리 워처

쿼리 워처는 실행된 모든 쿼리의 원본 SQL, 바인딩 값, 실행 시간 정보를 기록합니다. 100밀리초보다 느린 쿼리는 자동으로 `slow` 태그가 붙습니다. 느린 쿼리의 기준 임계값은 `slow` 옵션으로 조정할 수 있습니다:

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

Redis 워처는 애플리케이션에서 실행하는 모든 [Redis](/docs/9.x/redis) 명령을 기록합니다. 만약 Redis를 캐시에 사용한다면 캐시 명령도 Redis 워처가 기록합니다.

<a name="request-watcher"></a>
### 요청 워처

요청 워처는 요청, 헤더, 세션, 응답 데이터 등 애플리케이션에서 처리되는 요청과 관련된 다양한 정보를 기록합니다. 기록할 응답 데이터의 크기는 `size_limit`(킬로바이트 단위) 옵션으로 제한할 수 있습니다:

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

스케줄 워처는 애플리케이션에서 실행되는 [예약 작업](/docs/9.x/scheduling)의 명령어와 출력 결과를 기록합니다.

<a name="view-watcher"></a>
### 뷰 워처

뷰 워처는 [뷰](/docs/9.x/views) 렌더링 시 사용된 뷰 이름, 경로, 데이터, "컴포저(composer)" 정보를 기록합니다.

<a name="displaying-user-avatars"></a>
## 사용자 아바타 표시

텔레스코프 대시보드는 각 엔트리가 기록될 당시 인증된 사용자의 아바타 이미지를 표시합니다. 기본적으로 텔레스코프는 Gravatar 웹 서비스를 이용해 아바타를 가져옵니다. 하지만, 필요하다면 `App\Providers\TelescopeServiceProvider` 클래스에 콜백을 등록해서 아바타 URL 방식을 커스터마이즈할 수 있습니다. 이 콜백은 사용자의 ID와 이메일을 받아 해당 아바타 이미지 URL을 반환해야 합니다:

```
use App\Models\User;
use Laravel\Telescope\Telescope;

/**
 * Register any application services.
 *
 * @return void
 */
public function register()
{
    // ...

    Telescope::avatar(function ($id, $email) {
        return '/avatars/'.User::find($id)->avatar_path;
    });
}
```
