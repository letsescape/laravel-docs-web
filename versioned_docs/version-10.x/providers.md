# 서비스 프로바이더 (Service Providers)

- [소개](#introduction)
- [서비스 프로바이더 작성하기](#writing-service-providers)
    - [register 메서드](#the-register-method)
    - [boot 메서드](#the-boot-method)
- [프로바이더 등록하기](#registering-providers)
- [지연 로딩 프로바이더](#deferred-providers)

<a name="introduction"></a>
## 소개

서비스 프로바이더는 모든 라라벨 애플리케이션의 부트스트랩을 담당하는 핵심 위치입니다. 여러분이 직접 작성한 애플리케이션뿐만 아니라 라라벨의 핵심 서비스들도 모두 서비스 프로바이더를 통해 부트스트랩됩니다.

여기서 "부트스트랩"이란 무엇을 의미할까요? 일반적으로 **각종 등록 작업**을 의미합니다. 서비스 컨테이너 바인딩, 이벤트 리스너, 미들웨어, 라우트 등 다양한 요소들을 등록하는 일을 포함합니다. 서비스 프로바이더는 애플리케이션을 설정하는 중앙 역할을 담당합니다.

라라벨의 `config/app.php` 파일을 열어보면 `providers` 배열이 있습니다. 이 배열에는 애플리케이션에서 로드될 모든 서비스 프로바이더 클래스가 나열되어 있습니다. 기본적으로 라라벨의 핵심 서비스 프로바이더들이 이 배열에 포함되어 있으며, 이들 프로바이더는 메일러, 큐, 캐시 등 주요 라라벨 컴포넌트들을 부트스트랩합니다. 이 중 다수는 "지연 로딩(deferred)" 프로바이더로, 제공하는 서비스가 실제로 필요할 때에만 로드됩니다. 즉, 모든 요청에서 항상 로드되는 것은 아닙니다.

이 가이드에서는 서비스 프로바이더를 직접 작성하는 방법과 이를 라라벨 애플리케이션에 등록하는 방법을 설명합니다.

> [!NOTE]
> 라라벨의 요청 처리 방식과 내부 동작 원리를 더 자세히 알고 싶으시면 [라라벨 요청 수명주기](/docs/10.x/lifecycle)에 대한 문서를 참고해 보세요.

<a name="writing-service-providers"></a>
## 서비스 프로바이더 작성하기

모든 서비스 프로바이더는 `Illuminate\Support\ServiceProvider` 클래스를 확장합니다. 대부분의 서비스 프로바이더는 `register`와 `boot`라는 두 가지 메서드를 포함합니다. `register` 메서드 내에서는 **오직 [서비스 컨테이너](/docs/10.x/container)에 바인딩하는 작업만** 수행해야 합니다. 이 메서드 안에서 이벤트 리스너, 라우트, 기타 기능을 등록하려고 해서는 안 됩니다.

Artisan CLI를 사용해 새로운 프로바이더를 다음과 같이 생성할 수 있습니다.

```shell
php artisan make:provider RiakServiceProvider
```

<a name="the-register-method"></a>
### register 메서드

앞서 언급한 것처럼, `register` 메서드 내에서는 오직 [서비스 컨테이너](/docs/10.x/container)에 바인딩하는 작업만 해야 합니다. 이곳에서 이벤트 리스너, 라우트 등 다른 기능을 등록하면 안 되며, 만약 그렇게 하면 아직 로드되지 않은 서비스 프로바이더의 서비스가 의도치 않게 사용될 수 있습니다.

기본적인 서비스 프로바이더 예시를 살펴보겠습니다. 서비스 프로바이더의 어떤 메서드에서도 `$app` 속성을 통해 서비스 컨테이너에 접근할 수 있습니다.

```
<?php

namespace App\Providers;

use App\Services\Riak\Connection;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\ServiceProvider;

class RiakServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(Connection::class, function (Application $app) {
            return new Connection(config('riak'));
        });
    }
}
```

이 서비스 프로바이더는 `register` 메서드만 정의하며, 이 메서드에서 `App\Services\Riak\Connection`의 구현체를 서비스 컨테이너에 등록합니다. 라라벨의 서비스 컨테이너가 익숙하지 않으시다면, [관련 문서](/docs/10.x/container)를 참고해 주세요.

<a name="the-bindings-and-singletons-properties"></a>
#### `bindings` 및 `singletons` 속성

서비스 프로바이더에서 여러 개의 간단한 바인딩을 등록해야 하는 경우, 각각을 직접 등록하는 대신 `bindings`와 `singletons` 속성을 활용할 수 있습니다. 프레임워크가 해당 서비스 프로바이더를 로드할 때, 이 속성들을 자동으로 확인하고 바인딩을 등록합니다.

```
<?php

namespace App\Providers;

use App\Contracts\DowntimeNotifier;
use App\Contracts\ServerProvider;
use App\Services\DigitalOceanServerProvider;
use App\Services\PingdomDowntimeNotifier;
use App\Services\ServerToolsProvider;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * All of the container bindings that should be registered.
     *
     * @var array
     */
    public $bindings = [
        ServerProvider::class => DigitalOceanServerProvider::class,
    ];

    /**
     * All of the container singletons that should be registered.
     *
     * @var array
     */
    public $singletons = [
        DowntimeNotifier::class => PingdomDowntimeNotifier::class,
        ServerProvider::class => ServerToolsProvider::class,
    ];
}
```

<a name="the-boot-method"></a>
### boot 메서드

서비스 프로바이더 내에서 [뷰 컴포저](/docs/10.x/views#view-composers)를 등록하고 싶을 때는 어떻게 해야 할까요? 이 경우에는 `boot` 메서드 안에서 처리해야 합니다. **`boot` 메서드는 모든 다른 서비스 프로바이더가 등록된 후에 호출**되므로, 프레임워크에 의해 등록된 모든 서비스에 접근할 수 있습니다.

```
<?php

namespace App\Providers;

use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class ComposerServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        View::composer('view', function () {
            // ...
        });
    }
}
```

<a name="boot-method-dependency-injection"></a>
#### boot 메서드의 의존성 주입

서비스 프로바이더의 `boot` 메서드에 의존성을 타입힌트로 선언하면, [서비스 컨테이너](/docs/10.x/container)가 필요한 의존성을 자동으로 주입해 줍니다.

```
use Illuminate\Contracts\Routing\ResponseFactory;

/**
 * Bootstrap any application services.
 */
public function boot(ResponseFactory $response): void
{
    $response->macro('serialized', function (mixed $value) {
        // ...
    });
}
```

<a name="registering-providers"></a>
## 프로바이더 등록하기

모든 서비스 프로바이더는 `config/app.php` 설정 파일에서 등록합니다. 이 파일에는 `providers` 배열이 있으며, 여기에 서비스 프로바이더 클래스 이름을 나열할 수 있습니다. 기본적으로 라라벨의 주요 서비스 프로바이더들이 이 배열에 이미 등록되어 있습니다. 기본 프로바이더들은 메일러, 큐, 캐시 등 라라벨의 주요 컴포넌트들을 부트스트랩합니다.

여러분이 작성한 프로바이더를 등록하려면, 배열에 추가하면 됩니다.

```
'providers' => ServiceProvider::defaultProviders()->merge([
    // 기타 서비스 프로바이더

    App\Providers\ComposerServiceProvider::class,
])->toArray(),
```

<a name="deferred-providers"></a>
## 지연 로딩 프로바이더

여러분의 프로바이더가 [서비스 컨테이너](/docs/10.x/container)에 바인딩만을 등록하는 역할만 한다면, 실제로 그 바인딩이 필요할 때까지 프로바이더의 등록을 **지연**할 수 있습니다. 이러한 프로바이더의 로딩을 지연시키면, 모든 요청마다 파일시스템에서 프로바이더를 읽지 않아도 되므로 애플리케이션의 성능이 향상됩니다.

라라벨은 지연 로딩 서비스 프로바이더가 제공하는 모든 서비스의 목록과, 해당 프로바이더 클래스 이름을 컴파일해 저장합니다. 그리고 이 서비스들 중 하나라도 필요할 때에만 프로바이더를 실제로 로드합니다.

프로바이더의 로딩을 지연시키려면, `\Illuminate\Contracts\Support\DeferrableProvider` 인터페이스를 구현하고, `provides` 메서드를 정의해야 합니다. `provides` 메서드는 프로바이더가 등록하는 서비스 컨테이너 바인딩(들)을 배열로 반환합니다.

```
<?php

namespace App\Providers;

use App\Services\Riak\Connection;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Contracts\Support\DeferrableProvider;
use Illuminate\Support\ServiceProvider;

class RiakServiceProvider extends ServiceProvider implements DeferrableProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(Connection::class, function (Application $app) {
            return new Connection($app['config']['riak']);
        });
    }

    /**
     * Get the services provided by the provider.
     *
     * @return array<int, string>
     */
    public function provides(): array
    {
        return [Connection::class];
    }
}
```
