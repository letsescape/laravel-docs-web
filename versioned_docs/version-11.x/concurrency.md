# 동시성 (Concurrency)

- [소개](#introduction)
- [동시 작업 실행하기](#running-concurrent-tasks)
- [동시 작업 지연 실행하기](#deferring-concurrent-tasks)

<a name="introduction"></a>
## 소개

> [!WARNING]
> 라라벨의 `Concurrency` 파사드는 현재 베타 버전으로, 커뮤니티 피드백을 수집하는 중입니다.

여러 개의 느린 작업이 서로 의존하지 않는 경우, 이 작업들을 동시에 실행해서 성능을 크게 향상시킬 수 있습니다. 라라벨의 `Concurrency` 파사드는 클로저(익명 함수)를 동시에 실행할 수 있게 해주는 간편한 API를 제공합니다.

<a name="concurrency-compatibility"></a>
#### 동시성 호환성

라라벨 10.x에서 11.x로 업그레이드한 경우, 애플리케이션의 `config/app.php` 설정 파일 내 `providers` 배열에 `ConcurrencyServiceProvider`를 추가해야 할 수 있습니다:

```php
'providers' => ServiceProvider::defaultProviders()->merge([
    /*
     * Package Service Providers...
     */
    Illuminate\Concurrency\ConcurrencyServiceProvider::class, // [tl! add]

    /*
     * Application Service Providers...
     */
    App\Providers\AppServiceProvider::class,
    App\Providers\AuthServiceProvider::class,
    // App\Providers\BroadcastServiceProvider::class,
    App\Providers\EventServiceProvider::class,
    App\Providers\RouteServiceProvider::class,
])->toArray(),
```

<a name="how-it-works"></a>
#### 동작 방식

라라벨은 전달된 클로저를 직렬화하여 숨겨진 아티즌 명령어로 전달하고, 해당 명령어가 클로저를 역직렬화해 각각의 독립된 PHP 프로세스에서 실행합니다. 클로저의 실행이 끝나면, 그 결과 값을 다시 직렬화해 부모 프로세스로 전달합니다.

`Concurrency` 파사드는 세 가지 드라이버를 지원합니다: `process`(기본값), `fork`, `sync`.

`fork` 드라이버는 기본 `process` 드라이버보다 더 나은 성능을 제공하지만, PHP의 웹 요청 환경에서는 포킹을 지원하지 않으므로 CLI 환경에서만 사용할 수 있습니다. `fork` 드라이버를 사용하려면 `spatie/fork` 패키지를 먼저 설치해야 합니다.

```bash
composer require spatie/fork
```

`sync` 드라이버는 주로 테스트 상황에서 모든 동시성을 비활성화하고, 클로저들을 부모 프로세스에서 순차적으로 실행하고 싶을 때 유용합니다.

<a name="running-concurrent-tasks"></a>
## 동시 작업 실행하기

여러 작업을 동시에 실행하려면, `Concurrency` 파사드의 `run` 메서드를 사용하면 됩니다. `run` 메서드는 동시에 실행할 클로저들의 배열을 받아, 각각의 PHP 자식 프로세스에서 동시에 실행합니다:

```php
use Illuminate\Support\Facades\Concurrency;
use Illuminate\Support\Facades\DB;

[$userCount, $orderCount] = Concurrency::run([
    fn () => DB::table('users')->count(),
    fn () => DB::table('orders')->count(),
]);
```

특정 드라이버를 사용하려면 `driver` 메서드를 이용할 수 있습니다:

```php
$results = Concurrency::driver('fork')->run(...);
```

기본 동시성 드라이버를 변경하고 싶다면, `config:publish` 아티즌 명령어로 `concurrency` 설정 파일을 발행한 후, 해당 파일의 `default` 옵션을 수정하면 됩니다.

```bash
php artisan config:publish concurrency
```

<a name="deferring-concurrent-tasks"></a>
## 동시 작업 지연 실행하기

클로저 배열을 동시에 실행하되, 각 클로저의 반환값에는 관심이 없는 경우 `defer` 메서드를 사용할 수 있습니다. `defer` 메서드는 즉시 클로저를 실행하지 않고, HTTP 응답이 사용자에게 전달된 이후 클로저들을 동시에 실행합니다.

```php
use App\Services\Metrics;
use Illuminate\Support\Facades\Concurrency;

Concurrency::defer([
    fn () => Metrics::report('users'),
    fn () => Metrics::report('orders'),
]);
```