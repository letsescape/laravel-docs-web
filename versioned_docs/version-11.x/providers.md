# 서비스 프로바이더 (Service Providers)

- [소개](#introduction)
- [서비스 프로바이더 작성하기](#writing-service-providers)
    - [Register 메서드](#the-register-method)
    - [Boot 메서드](#the-boot-method)
- [프로바이더 등록하기](#registering-providers)
- [지연(Deferred) 프로바이더](#deferred-providers)

<a name="introduction"></a>
## 소개

서비스 프로바이더는 라라벨 애플리케이션이 부트스트랩(초기화)되는 중심 역할을 담당합니다. 여러분이 작성한 애플리케이션은 물론, 라라벨의 모든 핵심 서비스들도 서비스 프로바이더를 통해 부트스트랩됩니다.

여기서 "부트스트랩"이란 정확히 무엇일까요? 일반적으로 서비스 컨테이너 바인딩, 이벤트 리스너, 미들웨어, 라우트 등록 등 다양한 설정 작업을 의미합니다. 서비스 프로바이더는 이러한 애플리케이션 구성을 한 곳에서 담당하는 역할을 합니다.

라라벨 내부에서는 메일러, 큐, 캐시 등과 같은 핵심 서비스를 부트스트랩하기 위해 수십 개의 서비스 프로바이더를 사용합니다. 이 중 다수는 "지연 프로바이더"로 동작하는데, 이러한 프로바이더는 제공하는 서비스가 실제로 필요할 때만 로드되고, 모든 요청 시마다 로드되는 것은 아닙니다.

사용자가 직접 정의한 모든 서비스 프로바이더는 `bootstrap/providers.php` 파일에 등록됩니다. 아래 설명에서는 직접 서비스 프로바이더를 작성하고 이를 라라벨 애플리케이션에 등록하는 방법을 알아봅니다.

> [!NOTE]  
> 라라벨이 요청을 처리하는 방식과 내부 동작 원리를 더 깊이 이해하고 싶다면, 라라벨 [요청 생명주기](/docs/11.x/lifecycle) 문서를 참고해 보시기 바랍니다.

<a name="writing-service-providers"></a>
## 서비스 프로바이더 작성하기

모든 서비스 프로바이더 클래스는 `Illuminate\Support\ServiceProvider` 클래스를 상속합니다. 대부분의 서비스 프로바이더에는 `register` 메서드와 `boot` 메서드가 포함되어 있습니다. 이 중 `register` 메서드에서는 **반드시 [서비스 컨테이너](/docs/11.x/container)에 바인딩만** 수행해야 합니다. 이벤트 리스너, 라우트, 그 외 기능은 `register` 메서드에서 등록해서는 안 됩니다.

Artisan CLI를 사용하여 `make:provider` 명령어로 새로운 프로바이더를 생성할 수 있습니다. 라라벨은 이 명령어로 생성된 프로바이더를 자동으로 애플리케이션의 `bootstrap/providers.php` 파일에 등록합니다.

```shell
php artisan make:provider RiakServiceProvider
```

<a name="the-register-method"></a>
### Register 메서드

앞서 언급한 대로, `register` 메서드에서는 오직 [서비스 컨테이너](/docs/11.x/container)에 바인딩만 해야 하며, 이벤트 리스너나 라우트, 그 외 기타 기능을 등록해서는 안 됩니다. 그렇지 않으면, 아직 로드되지 않은 서비스 프로바이더에서 제공하는 서비스를 실수로 사용하게 될 수 있습니다.

아래는 기본적인 서비스 프로바이더 예시입니다. 서비스 프로바이더의 어떤 메서드에서든 `$app` 프로퍼티에 접근할 수 있으며, 이 프로퍼티는 서비스 컨테이너에 대한 접근을 제공합니다.

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

이 서비스 프로바이더는 오직 `register` 메서드만 정의하며, 해당 메서드를 사용하여 서비스 컨테이너에 `App\Services\Riak\Connection` 클래스에 대한 구현을 등록합니다. 라라벨의 서비스 컨테이너에 대해 잘 모르신다면, [관련 문서](/docs/11.x/container)를 참고하시기 바랍니다.

<a name="the-bindings-and-singletons-properties"></a>
#### `bindings` 및 `singletons` 프로퍼티

서비스 프로바이더에서 여러 개의 간단한 바인딩을 등록해야 하는 경우, 각 바인딩을 일일이 메서드로 작성하는 대신 `bindings` 및 `singletons` 프로퍼티를 사용할 수 있습니다. 프레임워크가 서비스 프로바이더를 로드할 때 이 프로퍼티들을 자동으로 확인하고, 지정된 바인딩을 등록합니다.

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
### Boot 메서드

서비스 프로바이더에서 [뷰 컴포저](/docs/11.x/views#view-composers)와 같은 기능을 등록하고 싶다면, 이는 반드시 `boot` 메서드에서 처리해야 합니다. **이 메서드는 모든 다른 서비스 프로바이더의 등록(=register)이 완료된 후 호출**되므로, 프레임워크가 등록한 모든 서비스에 접근할 수 있습니다.

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
#### Boot 메서드 의존성 주입

서비스 프로바이더의 `boot` 메서드에서 의존성 주입도 사용할 수 있습니다. [서비스 컨테이너](/docs/11.x/container)가 자동으로 필요한 의존성을 주입해 줍니다.

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

모든 서비스 프로바이더는 `bootstrap/providers.php` 설정 파일에 등록됩니다. 이 파일은 애플리케이션에서 사용되는 서비스 프로바이더 클래스명을 배열로 반환합니다.

```
<?php

return [
    App\Providers\AppServiceProvider::class,
];
```

`make:provider` 아티즌 명령어를 실행하면, 라라벨이 자동으로 생성된 프로바이더를 `bootstrap/providers.php` 파일에 추가해줍니다. 하지만 직접 클래스를 만들었을 경우에는 추가로 프로바이더 클래스를 이 배열에 수동으로 등록해야 합니다.

```
<?php

return [
    App\Providers\AppServiceProvider::class,
    App\Providers\ComposerServiceProvider::class, // [tl! add]
];
```

<a name="deferred-providers"></a>
## 지연(Deferred) 프로바이더

여러분이 작성한 프로바이더가 오로지 [서비스 컨테이너](/docs/11.x/container) 바인딩만 등록한다면, 실제로 해당 바인딩이 필요할 때까지 로드를 "지연"시킬 수 있습니다. 이러한 지연 로딩 방식은 프로바이더가 매번 파일 시스템에서 로드되지 않기 때문에 애플리케이션 성능을 향상시킬 수 있습니다.

라라벨은 지연 프로바이더가 제공하는 서비스 목록과 해당 서비스 프로바이더 클래스명을 컴파일하여 저장합니다. 그리고 이 서비스들 중 하나를 애플리케이션이 해결(resolve)하려 할 때 실제로 해당 서비스 프로바이더를 로드합니다.

프로바이더의 로딩을 지연시키려면, `\Illuminate\Contracts\Support\DeferrableProvider` 인터페이스를 구현하고, `provides` 메서드를 정의해야 합니다. 이 `provides` 메서드는 해당 프로바이더에서 등록하는 서비스 컨테이너 바인딩의 목록을 반환해야 합니다.

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
