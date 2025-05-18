# 업그레이드 가이드 (Upgrade Guide)

- [7.x에서 8.0으로 업그레이드하기](#upgrade-8.0)

<a name="high-impact-changes"></a>
## 핵심 영향 변경사항

<div class="content-list" markdown="1">

- [모델 팩토리](#model-factories)
- [큐 `retryAfter` 메서드](#queue-retry-after-method)
- [큐 `timeoutAt` 프로퍼티](#queue-timeout-at-property)
- [큐 `allOnQueue` 및 `allOnConnection`](#queue-allOnQueue-allOnConnection)
- [페이지네이션 기본값](#pagination-defaults)
- [시더 & 팩토리 네임스페이스](#seeder-factory-namespaces)

</div>

<a name="medium-impact-changes"></a>
## 중간 영향 변경사항

<div class="content-list" markdown="1">

- [PHP 7.3.0 필요](#php-7.3.0-required)
- [실패한 작업 테이블의 배치 지원](#failed-jobs-table-batch-support)
- [유지 관리 모드 업데이트](#maintenance-mode-updates)
- [`php artisan down --message` 옵션](#artisan-down-message)
- [`assertExactJson` 메서드](#assert-exact-json-method)

</div>

<a name="upgrade-8.0"></a>
## 7.x에서 8.0으로 업그레이드하기

<a name="estimated-upgrade-time-15-minutes"></a>
#### 예상 소요 시간: 15분

> [!NOTE]
> 모든 잠재적인 하위 호환성 깨짐(breaking change) 사항을 문서화하려고 노력했으나, 일부 사항은 라라벨의 잘 사용되지 않는 영역에 해당하므로 실제로 여러분의 애플리케이션에 영향을 주는 변경사항은 일부일 수 있습니다.

<a name="php-7.3.0-required"></a>
### PHP 7.3.0 필요

**영향 가능성: 중간**

라라벨 8.0에서 최소 지원 PHP 버전이 7.3.0으로 상향되었습니다.

<a name="updating-dependencies"></a>
### 의존성 업데이트

`composer.json` 파일에서 아래 의존성들의 버전을 업데이트해야 합니다.

<div class="content-list" markdown="1">

- `guzzlehttp/guzzle`를 `^7.0.1`로
- `facade/ignition`을 `^2.3.6`로
- `laravel/framework`를 `^8.0`로
- `laravel/ui`를 `^3.0`로
- `nunomaduro/collision`을 `^5.0`로
- `phpunit/phpunit`을 `^9.0`로

</div>

라라벨 8을 지원하기 위해 주요 1st-party 패키지들도 새로운 메이저 릴리스를 제공합니다. 해당 패키지를 사용 중이라면, 업그레이드 전에 개별 업그레이드 가이드를 꼭 참고하시기 바랍니다.

<div class="content-list" markdown="1">

- [Horizon v5.0](https://github.com/laravel/horizon/blob/master/UPGRADE.md)
- [Passport v10.0](https://github.com/laravel/passport/blob/master/UPGRADE.md)
- [Socialite v5.0](https://github.com/laravel/socialite/blob/master/UPGRADE.md)
- [Telescope v4.0](https://github.com/laravel/telescope/blob/master/UPGRADE.md)

</div>

또한, 라라벨 인스톨러도 `composer create-project` 및 Laravel Jetstream을 지원하도록 업데이트되었습니다. 4.0 미만의 인스톨러는 2020년 10월 이후 동작하지 않으므로, 글로벌 인스톨러를 반드시 `^4.0` 버전 이상으로 업그레이드하시기 바랍니다.

마지막으로, 애플리케이션에서 사용하는 다른 서드파티 패키지들도 라라벨 8과 호환되는 버전을 사용하는지 반드시 확인하세요.

<a name="collections"></a>
### 컬렉션

<a name="the-isset-method"></a>
#### `isset` 메서드

**영향 가능성: 낮음**

일반적인 PHP 동작과의 일관성을 위해, `Illuminate\Support\Collection`의 `offsetExists` 메서드는 이제 `array_key_exists` 대신 `isset`을 사용하도록 변경되었습니다. 이로 인해 값이 `null`인 컬렉션 아이템을 다룰 때 동작이 달라질 수 있습니다.

```
$collection = collect([null]);

// Laravel 7.x - true
isset($collection[0]);

// Laravel 8.x - false
isset($collection[0]);
```

<a name="database"></a>
### 데이터베이스

<a name="seeder-factory-namespaces"></a>
#### 시더 & 팩토리 네임스페이스

**영향 가능성: 높음**

시더(Seeder)와 팩토리(Factory) 클래스가 이제 네임스페이스를 갖게 되었습니다. 이에 따라, 시더 클래스에는 `Database\Seeders` 네임스페이스를 추가해야 합니다. 또한, 기존의 `database/seeds` 디렉토리는 `database/seeders`로 이름을 변경해야 합니다.

```
<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * 애플리케이션의 데이터베이스를 시딩합니다.
     *
     * @return void
     */
    public function run()
    {
        ...
    }
}
```

`laravel/legacy-factories` 패키지를 사용하는 경우 팩토리 클래스는 변경할 필요가 없습니다. 그러나 팩토리를 업그레이드할 경우, 해당 클래스에 `Database\Factories` 네임스페이스를 추가해야 합니다.

그리고 `composer.json` 파일의 `autoload` 섹션에서 `classmap` 블록을 삭제하고, 새 네임스페이스 기반 디렉토리 매핑을 추가해야 합니다.

```
"autoload": {
    "psr-4": {
        "App\\": "app/",
        "Database\\Factories\\": "database/factories/",
        "Database\\Seeders\\": "database/seeders/"
    }
},
```

<a name="eloquent"></a>
### Eloquent

<a name="model-factories"></a>
#### 모델 팩토리

**영향 가능성: 높음**

라라벨의 [모델 팩토리](/docs/8.x/database-testing#defining-model-factories) 기능이 클래스 기반으로 완전히 재작성되어, 라라벨 7.x 스타일 팩토리와는 호환되지 않습니다. 업그레이드를 쉽게 하도록, 기존 팩토리를 계속 사용할 수 있는 `laravel/legacy-factories` 패키지가 제공됩니다. Composer로 아래와 같이 설치하세요:

```
composer require laravel/legacy-factories
```

<a name="the-castable-interface"></a>
#### `Castable` 인터페이스

**영향 가능성: 낮음**

`Castable` 인터페이스의 `castUsing` 메서드는 이제 인수로 배열을 받도록 변경되었습니다. 해당 인터페이스를 직접 구현한다면, 아래와 같이 구현을 수정해야 합니다.

```
public static function castUsing(array $arguments);
```

<a name="increment-decrement-events"></a>
#### Increment / Decrement 이벤트

**영향 가능성: 낮음**

이제 Eloquent 모델 인스턴스에서 `increment`나 `decrement` 메서드를 실행할 경우, 올바른 "update" 및 "save" 관련 모델 이벤트가 디스패치됩니다.

<a name="events"></a>
### 이벤트

<a name="the-event-service-provider-class"></a>
#### `EventServiceProvider` 클래스

**영향 가능성: 낮음**

`App\Providers\EventServiceProvider` 클래스에 `register` 메서드가 구현되어 있다면, 이 메서드의 가장 처음에 반드시 `parent::register`를 호출해야 합니다. 그렇지 않을 경우 애플리케이션의 이벤트가 등록되지 않습니다.

<a name="the-dispatcher-contract"></a>
#### `Dispatcher` 인터페이스

**영향 가능성: 낮음**

`Illuminate\Contracts\Events\Dispatcher` 인터페이스의 `listen` 메서드는 `$listener` 인수를 선택적으로 받도록 변경되었습니다. 이 변경은 리플렉션을 통한 이벤트 타입 자동 감지를 지원하기 위한 것입니다. 해당 인터페이스를 직접 구현할 경우, 아래와 같이 수정해야 합니다.

```
public function listen($events, $listener = null);
```

<a name="framework"></a>
### 프레임워크

<a name="maintenance-mode-updates"></a>
#### 유지 관리 모드 업데이트

**영향 가능성: 선택적**

라라벨의 [유지 관리 모드](/docs/8.x/configuration#maintenance-mode)가 8.x에서 개선되었습니다. 유지 관리 모드 템플릿을 미리 렌더(pre-render)하는 기능이 추가되어, 유지 관리 도중 사용자에게 오류가 노출될 가능성이 줄어듭니다. 이를 위해서는 아래 코드 라인을 `public/index.php` 파일 내 `LARAVEL_START` 상수 정의문 바로 아래에 추가해야 합니다.

```
define('LARAVEL_START', microtime(true));

if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}
```

<a name="artisan-down-message"></a>
#### `php artisan down --message` 옵션

**영향 가능성: 중간**

`php artisan down` 명령어의 `--message` 옵션이 제거되었습니다. 대신, [원하는 메시지가 포함된 유지 관리 모드를 뷰로 미리 렌더](/docs/8.x/configuration#maintenance-mode)하는 방법을 참고하세요.

<a name="php-artisan-serve-no-reload-option"></a>
#### `php artisan serve --no-reload` 옵션

**영향 가능성: 낮음**

`php artisan serve` 명령어에 `--no-reload` 옵션이 추가되었습니다. 이 옵션을 사용하면 환경 파일이 변경되어도 내장 서버가 재시작되지 않습니다. 주로 CI 환경에서 Laravel Dusk 테스트를 실행할 때 유용합니다.

<a name="manager-app-property"></a>
#### Manager의 `$app` 프로퍼티

**영향 가능성: 낮음**

`Illuminate\Support\Manager` 클래스의 예전 `$app` 프로퍼티가 완전히 제거되었습니다. 이 프로퍼티를 사용 중이었다면, 대신 `$container` 프로퍼티를 사용해야 합니다.

<a name="the-elixir-helper"></a>
#### `elixir` 헬퍼

**영향 가능성: 낮음**

더 이상 사용되지 않는 `elixir` 헬퍼가 제거되었습니다. 이 메서드를 여전히 사용 중이라면, [Laravel Mix](https://github.com/JeffreyWay/laravel-mix)로 업그레이드하는 것을 권장합니다.

<a name="mail"></a>
### 메일

<a name="the-sendnow-method"></a>
#### `sendNow` 메서드

**영향 가능성: 낮음**

이전부터 사용이 중단된 `sendNow` 메서드가 삭제되었습니다. 앞으로는 `send` 메서드를 사용하시기 바랍니다.

<a name="pagination"></a>
### 페이지네이션

<a name="pagination-defaults"></a>
#### 페이지네이션 기본값

**영향 가능성: 높음**

페이지네이터의 기본 스타일이 [Tailwind CSS 프레임워크](https://tailwindcss.com)로 변경되었습니다. 만약 기존처럼 Bootstrap 스타일을 계속 쓰고 싶다면, 애플리케이션의 `AppServiceProvider` 클래스의 `boot` 메서드에 아래 메서드 호출을 추가하세요.

```
use Illuminate\Pagination\Paginator;

Paginator::useBootstrap();
```

<a name="queue"></a>
### 큐

<a name="queue-retry-after-method"></a>
#### `retryAfter` 메서드

**영향 가능성: 높음**

라라벨의 기능들과 일관성을 맞추기 위해, 큐잉된 작업·메일러·알림·리스너에서 사용하던 `retryAfter` 메서드와 프로퍼티가 `backoff`로 이름이 변경되었습니다. 관련 클래스에서 해당 이름을 모두 수정해야 합니다.

<a name="queue-timeout-at-property"></a>
#### `timeoutAt` 프로퍼티

**영향 가능성: 높음**

큐에 등록된 작업, 알림, 리스너에서 사용하던 `timeoutAt` 프로퍼티가 `retryUntil`로 이름이 변경되었습니다. 해당 클래스의 프로퍼티 이름을 수정해 주세요.

<a name="queue-allOnQueue-allOnConnection"></a>
#### `allOnQueue()` / `allOnConnection()` 메서드

**영향 가능성: 높음**

작업 체이닝에서 사용되던 `allOnQueue()` 및 `allOnConnection()` 메서드는 제거되었습니다. 대신, `onQueue()`와 `onConnection()` 메서드를 사용해야 하며, 이들은 `dispatch` 메서드 호출 전에 사용해야 합니다.

```
ProcessPodcast::withChain([
    new OptimizePodcast,
    new ReleasePodcast
])->onConnection('redis')->onQueue('podcasts')->dispatch();
```

이 변경은 `withChain` 메서드를 사용할 때만 해당합니다. 전역 `dispatch()` 헬퍼를 쓸 때는 기존의 `allOnQueue()`, `allOnConnection()`이 여전히 사용 가능합니다.

<a name="failed-jobs-table-batch-support"></a>
#### 실패한 작업 테이블의 배치 지원

**영향 가능성: 선택적**

[작업 배치](/docs/8.x/queues#job-batching) 기능을 사용할 계획이라면, `failed_jobs` 데이터베이스 테이블을 아래와 같이 업데이트해야 합니다. 우선, 테이블에 새로운 `uuid` 컬럼을 추가하세요.

```
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('failed_jobs', function (Blueprint $table) {
    $table->string('uuid')->after('id')->nullable()->unique();
});
```

그리고 `queue` 설정 파일의 `failed.driver` 옵션을 `database-uuids`로 변경하세요.

또한, 기존 실패한 작업에 대해서도 UUID를 부여하려면 아래 코드를 참고하세요.

```
DB::table('failed_jobs')->whereNull('uuid')->cursor()->each(function ($job) {
    DB::table('failed_jobs')
        ->where('id', $job->id)
        ->update(['uuid' => (string) Illuminate\Support\Str::uuid()]);
});
```

<a name="routing"></a>
### 라우팅

<a name="automatic-controller-namespace-prefixing"></a>
#### 컨트롤러 네임스페이스 자동 접두(prefix) 지정

**영향 가능성: 선택적**

라라벨 이전 버전에서는 `RouteServiceProvider` 클래스에 `$namespace` 프로퍼티가 `App\Http\Controllers`로 지정되어 있었으며, 이 값이 컨트롤러 라우트 선언 및 URL 생성 시 자동으로 접두사로 붙었습니다.

라라벨 8에서는 이 프로퍼티의 기본값이 `null`이 되었습니다. 이제 표준 PHP 콜러블(callable) 문법을 사용하여 라우트를 선언할 수 있으며, 이는 여러 IDE에서 컨트롤러 클래스를 쉽게 찾아갈 수 있는 장점이 있습니다.

```
use App\Http\Controllers\UserController;

// PHP 콜러블 문법 사용 예시...
Route::get('/users', [UserController::class, 'index']);

// 문자열 문법 사용 예시...
Route::get('/users', 'App\Http\Controllers\UserController@index');
```

기본적으로, 업그레이드한 애플리케이션에는 기존의 `$namespace` 프로퍼티가 그대로 유지되어 큰 영향이 없지만, 신규 라라벨 프로젝트를 생성해 업그레이드할 경우에는 호환성 문제(구현의 변경점)를 만날 수 있습니다.

기존 방식대로 자동 접두 네임스페이스를 계속 사용하려면 `RouteServiceProvider`의 `$namespace` 값을 지정하고, `boot` 메서드에서 라우트 등록 시 아래 예시처럼 `$namespace`를 적용하면 됩니다.

```
class RouteServiceProvider extends ServiceProvider
{
    /**
     * 애플리케이션의 "home" 라우트 경로입니다.
     *
     * 이 값은 로그인 후 라라벨 인증에서 리다이렉션할 때 사용됩니다.
     *
     * @var string
     */
    public const HOME = '/home';

    /**
     * 지정될 경우, 이 네임스페이스가 컨트롤러 라우트에 자동으로 적용됩니다.
     *
     * 또한 URL 생성기의 루트 네임스페이스로도 쓰입니다.
     *
     * @var string
     */
    protected $namespace = 'App\Http\Controllers';

    /**
     * 라우트 모델 바인딩, 패턴 필터 등 정의.
     *
     * @return void
     */
    public function boot()
    {
        $this->configureRateLimiting();

        $this->routes(function () {
            Route::middleware('web')
                ->namespace($this->namespace)
                ->group(base_path('routes/web.php'));

            Route::prefix('api')
                ->middleware('api')
                ->namespace($this->namespace)
                ->group(base_path('routes/api.php'));
        });
    }

    /**
     * 애플리케이션을 위한 rate limiter 구성.
     *
     * @return void
     */
    protected function configureRateLimiting()
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by(optional($request->user())->id ?: $request->ip());
        });
    }
}
```

<a name="scheduling"></a>
### 스케줄링

<a name="the-cron-expression-library"></a>
#### `cron-expression` 라이브러리

**영향 가능성: 낮음**

라라벨에서 사용하는 `dragonmantank/cron-expression` 패키지의 의존성이 `2.x`에서 `3.x`로 상향되었습니다. 라라벨 내부 동작에는 영향을 주지 않으나 해당 라이브러리와 직접 상호작용 중이라면 [변경 내역](https://github.com/dragonmantank/cron-expression/blob/master/CHANGELOG.md)을 꼭 확인하세요.

<a name="session"></a>
### 세션

<a name="the-session-contract"></a>
#### `Session` 인터페이스

**영향 가능성: 낮음**

`Illuminate\Contracts\Session\Session` 인터페이스에 새로운 `pull` 메서드가 추가되었습니다. 이 인터페이스를 직접 구현한다면 아래 선언을 참고하여 구현을 추가해야 합니다.

```
/**
 * 주어진 키의 값을 가져오고 즉시 삭제합니다.
 *
 * @param  string  $key
 * @param  mixed  $default
 * @return mixed
 */
public function pull($key, $default = null);
```

<a name="testing"></a>
### 테스트

<a name="decode-response-json-method"></a>
#### `decodeResponseJson` 메서드

**영향 가능성: 낮음**

`Illuminate\Testing\TestResponse` 클래스의 `decodeResponseJson` 메서드는 더 이상 인수를 받을 수 없습니다. 대신 `json` 메서드 사용을 권장합니다.

<a name="assert-exact-json-method"></a>
#### `assertExactJson` 메서드

**영향 가능성: 중간**

`assertExactJson` 메서드는 비교하는 배열의 숫자 키(key)까지 순서가 동일해야만 통과됩니다. 만약 순서가 달라도 상관없는 비교를 원한다면 `assertSimilarJson` 메서드를 사용하면 됩니다.

<a name="validation"></a>
### 유효성 검증

<a name="database-rule-connections"></a>
### 데이터베이스 Rule 연결

**영향 가능성: 낮음**

`unique` 및 `exists` 유효성 검증 규칙이 쿼리 실행 시, Eloquent 모델의 `getConnectionName` 메서드로 지정된 연결명을 이제 올바르게 참조합니다.

<a name="miscellaneous"></a>
### 기타

`laravel/laravel` [GitHub 저장소](https://github.com/laravel/laravel)에서 변경된 파일 역시 확인해보길 권장합니다. 많은 변경사항이 필수로 적용되진 않지만, 애플리케이션의 상태를 최신으로 유지하고 싶을 수 있습니다. 이 가이드에서 다루지 않는 설정 파일이나 주석, 기타 변경점도 있으니, [GitHub 비교 도구](https://github.com/laravel/laravel/compare/7.x...8.x)로 직접 비교하며 필요한 사항을 반영하는 것이 좋습니다.

