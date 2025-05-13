# 동시성 (Concurrency)

- [소개](#introduction)
- [동시 작업 실행하기](#running-concurrent-tasks)
- [동시 작업 지연 실행](#deferring-concurrent-tasks)

<a name="introduction"></a>
## 소개

> [!WARNING]
> 라라벨의 `Concurrency` 파사드는 현재 커뮤니티 피드백을 모으는 베타 단계에 있습니다.

서로 의존성이 없는 여러 느린 작업을 실행해야 할 때가 있습니다. 이런 경우, 각 작업을 동시에 실행하면 애플리케이션의 성능이 크게 향상될 수 있습니다. 라라벨의 `Concurrency` 파사드는 클로저를 동시에 실행할 수 있도록 간편한 API를 제공합니다.

<a name="concurrency-compatibility"></a>
#### 동시성 호환성

라라벨 10.x 애플리케이션에서 라라벨 11.x로 업그레이드했다면, 애플리케이션의 `config/app.php` 설정 파일 내 `providers` 배열에 `ConcurrencyServiceProvider`를 추가해야 할 수 있습니다:

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

라라벨은 동시성을 제공하기 위해, 전달받은 클로저를 직렬화한 뒤, 내부적으로 숨겨진 Artisan CLI 명령어로 전달합니다. 이 Artisan 명령은 전달받은 클로저를 자기 프로세스 내에서 역직렬화하여 실행합니다. 클로저 실행이 끝나면, 반환값을 다시 부모 프로세스로 직렬화하여 돌려줍니다.

`Concurrency` 파사드는 총 세 가지 드라이버를 지원합니다: `process`(기본값), `fork`, `sync`.

`fork` 드라이버는 기본 드라이버인 `process`보다 더 뛰어난 성능을 제공합니다. 하지만, PHP가 웹 요청 중에는 포크를 지원하지 않으므로 PHP의 CLI 환경에서만 사용해야 합니다. `fork` 드라이버를 사용하려면 먼저 `spatie/fork` 패키지를 설치해야 합니다:

```shell
composer require spatie/fork
```

`sync` 드라이버는 모든 동시성 처리를 비활성화하고 전달받은 클로저를 부모 프로세스 내에서 차례로 실행하고 싶을 때, 주로 테스트 환경에서 유용하게 사용할 수 있습니다.

<a name="running-concurrent-tasks"></a>
## 동시 작업 실행하기

동시 작업을 실행하려면, `Concurrency` 파사드의 `run` 메서드를 호출하면 됩니다. 이 `run` 메서드는 동시에 실행할 클로저들의 배열을 인수로 받습니다. 각 클로저는 별도의 PHP 자식 프로세스에서 실행됩니다:

```php
use Illuminate\Support\Facades\Concurrency;
use Illuminate\Support\Facades\DB;

[$userCount, $orderCount] = Concurrency::run([
    fn () => DB::table('users')->count(),
    fn () => DB::table('orders')->count(),
]);
```

특정 드라이버를 사용하고 싶다면 `driver` 메서드를 사용할 수 있습니다:

```php
$results = Concurrency::driver('fork')->run(...);
```

또는 기본 동시성 드라이버를 아예 바꾸고자 한다면, `config:publish` Artisan 명령어로 `concurrency` 설정 파일을 배포(publish)한 뒤, 해당 파일에서 `default` 옵션 값을 원하는 것으로 수정하면 됩니다:

```shell
php artisan config:publish concurrency
```

<a name="deferring-concurrent-tasks"></a>
## 동시 작업 지연 실행

동시에 여러 클로저를 실행하되, 이 작업들의 실행 결과에는 관심이 없는 경우라면 `defer` 메서드의 사용을 고려해 보십시오. `defer` 메서드를 호출할 때는, 전달된 클로저들이 즉시 실행되지 않습니다. 대신, 사용자에게 HTTP 응답이 전송된 뒤에 클로저들이 동시에 실행됩니다:

```php
use App\Services\Metrics;
use Illuminate\Support\Facades\Concurrency;

Concurrency::defer([
    fn () => Metrics::report('users'),
    fn () => Metrics::report('orders'),
]);
```
