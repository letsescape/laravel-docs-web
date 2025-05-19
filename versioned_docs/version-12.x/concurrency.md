# 동시성 (Concurrency)

- [소개](#introduction)
- [동시 작업 실행하기](#running-concurrent-tasks)
- [동시 작업 지연 처리](#deferring-concurrent-tasks)

<a name="introduction"></a>
## 소개

> [!WARNING]
> 라라벨의 `Concurrency` 파사드는 현재 커뮤니티 피드백을 수집 중인 베타 버전입니다.

여러분이 서로 의존하지 않는 느린 작업을 여러 개 실행해야 할 때가 있습니다. 이런 경우, 작업을 동시에 실행하면 애플리케이션의 성능을 크게 향상시킬 수 있습니다. 라라벨의 `Concurrency` 파사드는 이러한 동시 실행을 매우 간단하고 편리하게 처리할 수 있는 API를 제공합니다.

<a name="concurrency-compatibility"></a>
#### 동시성 호환성

라라벨 10.x에서 11.x로 애플리케이션을 업그레이드한 경우, 애플리케이션의 `config/app.php` 설정 파일 내 `providers` 배열에 `ConcurrencyServiceProvider`를 추가해야 할 수도 있습니다:

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
#### 동시성이 동작하는 방식

라라벨은 주어진 클로저를 직렬화(serialize)하여 내부적으로 숨겨진 아티즌 CLI 명령어로 전달한 뒤, 해당 명령어에서 클로저를 역직렬화(unserialize)하여 각각의 PHP 프로세스에서 실행합니다. 이후 실행 결과는 다시 직렬화되어 부모 프로세스로 전달됩니다.

`Concurrency` 파사드는 세 가지 드라이버를 지원합니다: 기본값인 `process`, 그리고 `fork`, `sync`입니다.

`fork` 드라이버는 기본값인 `process` 드라이버보다 더 나은 성능을 제공하지만, PHP의 CLI 환경에서만 사용할 수 있습니다. 웹 요청 도중에는 PHP가 fork를 지원하지 않기 때문입니다. `fork` 드라이버를 사용하려면 먼저 `spatie/fork` 패키지를 설치해야 합니다:

```shell
composer require spatie/fork
```

`sync` 드라이버는 주로 테스트 시에 모든 동시성을 비활성화하고, 클로저들을 부모 프로세스 내에서 순차적으로 실행하고 싶을 때 유용합니다.

<a name="running-concurrent-tasks"></a>
## 동시 작업 실행하기

동시 작업을 실행하려면, `Concurrency` 파사드의 `run` 메서드를 호출하면 됩니다. 이 `run` 메서드는 동시에 실행할 클로저 배열을 인수로 받습니다. 각각의 클로저는 별도의 자식 PHP 프로세스에서 동시에 실행됩니다:

```php
use Illuminate\Support\Facades\Concurrency;
use Illuminate\Support\Facades\DB;

[$userCount, $orderCount] = Concurrency::run([
    fn () => DB::table('users')->count(),
    fn () => DB::table('orders')->count(),
]);
```

특정 드라이버를 사용하고 싶다면 `driver` 메서드를 사용하면 됩니다:

```php
$results = Concurrency::driver('fork')->run(...);
```

기본 동시성 드라이버를 변경하려면, `config:publish` 아티즌 명령어를 통해 `concurrency` 설정 파일을 발행(publish)한 후, 해당 파일의 `default` 옵션을 수정하면 됩니다:

```shell
php artisan config:publish concurrency
```

<a name="deferring-concurrent-tasks"></a>
## 동시 작업 지연 처리

클로저 배열을 동시적으로 실행하되, 각 클로저가 반환하는 결과값에는 관심이 없을 때는 `defer` 메서드를 사용하는 것이 좋습니다. `defer` 메서드는 호출 시, 클로저들을 즉시 실행하는 것이 아니라, HTTP 응답이 사용자에게 전송된 이후에 동시적으로 실행되도록 처리합니다:

```php
use App\Services\Metrics;
use Illuminate\Support\Facades\Concurrency;

Concurrency::defer([
    fn () => Metrics::report('users'),
    fn () => Metrics::report('orders'),
]);
```
