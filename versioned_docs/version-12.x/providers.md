# 서비스 프로바이더 (Service Providers)

- [소개](#introduction)
- [서비스 프로바이더 작성하기](#writing-service-providers)
    - [register 메서드](#the-register-method)
    - [boot 메서드](#the-boot-method)
- [프로바이더 등록하기](#registering-providers)
- [지연(deferred) 프로바이더](#deferred-providers)

<a name="introduction"></a>
## 소개

서비스 프로바이더는 모든 라라벨 애플리케이션 부트스트래핑(초기화 작업)이 이루어지는 중심입니다. 여러분이 직접 만든 애플리케이션 역시, 라라벨이 제공하는 모든 핵심 서비스들도 모두 서비스 프로바이더를 통해 부트스트랩됩니다.

여기서 "부트스트랩(bootstrapped)"이란 무엇을 의미할까요? 보통 **등록(registering)** 작업을 의미하며, 서비스 컨테이너 바인딩, 이벤트 리스너, 미들웨어, 심지어 라우트까지 다양한 요소를 등록하는 일을 포함합니다. 서비스 프로바이더는 애플리케이션의 다양한 설정을 중앙에서 담당하는 역할을 합니다.

라라벨 내부에서도 메일러, 큐, 캐시 등 주요 서비스의 부트스트랩을 위해 수십 개의 서비스 프로바이더를 사용합니다. 이들 중 상당수는 "지연(deferred) 프로바이더"로, 모든 요청에서 항상 로딩되는 것이 아니라 실제로 해당 서비스가 필요할 때만 로딩됩니다.

사용자가 직접 정의한 모든 서비스 프로바이더는 `bootstrap/providers.php` 파일에 등록됩니다. 아래 문서에서는 서비스 프로바이더를 직접 작성하고, 라라벨 애플리케이션에 등록하는 방법을 배울 수 있습니다.

> [!NOTE]
> 라라벨이 요청을 어떻게 처리하고 내부적으로 동작하는지 더 깊이 알고 싶다면, [요청 라이프사이클](/docs/12.x/lifecycle) 문서를 참고해보세요.

<a name="writing-service-providers"></a>
## 서비스 프로바이더 작성하기

모든 서비스 프로바이더는 `Illuminate\Support\ServiceProvider` 클래스를 확장(extend)합니다. 대부분의 서비스 프로바이더에는 `register`와 `boot`라는 두 개의 메서드가 포함되어 있습니다. **`register` 메서드에서는 오직 [서비스 컨테이너](/docs/12.x/container)에 바인딩 작업만 수행해야 합니다.** 이 메서드 안에서 이벤트 리스너, 라우트, 그 외 다른 기능을 등록하면 안 됩니다.

Artisan CLI를 사용해 `make:provider` 명령어로 새 프로바이더를 손쉽게 만들 수 있습니다. 라라벨은 새로 만들어진 프로바이더를 애플리케이션의 `bootstrap/providers.php` 파일에 자동으로 등록해줍니다:

```shell
php artisan make:provider RiakServiceProvider
```

<a name="the-register-method"></a>
### register 메서드

앞서 언급한 것처럼, `register` 메서드에서는 오직 [서비스 컨테이너](/docs/12.x/container)에 바인딩만 해야 하며, 이벤트 리스너나 라우트 등 그 밖의 다른 요소를 이 메서드 안에서 등록하면 안 됩니다. 그렇지 않으면, 아직 로드되지 않은 다른 서비스 프로바이더에서 제공하는 서비스를 실수로 사용하게 되어 의도치 않은 오류가 발생할 수 있습니다.

다음은 기본적인 서비스 프로바이더 예시입니다. 서비스 프로바이더의 모든 메서드 안에서는 `$app` 속성(property)을 통해 서비스 컨테이너에 접근할 수 있습니다:

```php
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

이 서비스 프로바이더는 `register` 메서드만 정의하고 있으며, 이 메서드를 이용해 `App\Services\Riak\Connection`의 구현체를 서비스 컨테이너에 바인딩합니다. 아직 라라벨 서비스 컨테이너가 익숙하지 않다면, [관련 문서](/docs/12.x/container)를 참고해보세요.

<a name="the-bindings-and-singletons-properties"></a>
#### `bindings` 및 `singletons` 속성

만약 서비스 프로바이더에서 여러 개의 단순한 바인딩을 등록해야 한다면, 각각을 직접 등록하는 대신 `bindings`와 `singletons` 속성을 사용할 수 있습니다. 프레임워크가 이 서비스를 로드할 때 이 속성을 자동으로 확인하고 해당 바인딩들을 등록해줍니다:

```php
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

그렇다면 [뷰 컴포저(view composer)](/docs/12.x/views#view-composers)와 같은 요소를 서비스 프로바이더에서 등록하고 싶은 경우는 어떻게 해야 할까요? 이런 작업은 `boot` 메서드에서 처리해야 합니다. **이 메서드는 다른 모든 서비스 프로바이더의 등록이 끝난 후 호출되기 때문에**, 프레임워크에서 등록한 다른 모든 서비스에 자유롭게 접근할 수 있습니다:

```php
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
#### boot 메서드에서의 의존성 주입

서비스 프로바이더의 `boot` 메서드에 의존성을 타입힌트(type-hint)로 지정할 수 있습니다. [서비스 컨테이너](/docs/12.x/container)가 필요한 의존성을 자동으로 주입해줍니다:

```php
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

모든 서비스 프로바이더는 `bootstrap/providers.php` 설정 파일에 등록됩니다. 이 파일은 애플리케이션의 모든 서비스 프로바이더 클래스명을 배열로 반환합니다:

```php
<?php

return [
    App\Providers\AppServiceProvider::class,
];
```

`make:provider` Artisan 명령어를 사용하는 경우, 라라벨은 생성된 프로바이더를 자동으로 `bootstrap/providers.php` 파일에 추가해줍니다. 하지만 만약 수동으로 프로바이더 클래스를 만든 경우라면, 해당 파일의 배열에 직접 프로바이더 클래스를 추가해야 합니다:

```php
<?php

return [
    App\Providers\AppServiceProvider::class,
    App\Providers\ComposerServiceProvider::class, // [tl! add]
];
```

<a name="deferred-providers"></a>
## 지연(deferred) 프로바이더

만약 여러분의 프로바이더가 오직 [서비스 컨테이너](/docs/12.x/container)에 바인딩만 등록한다면, 해당 바인딩이 실제로 필요해질 때까지 등록을 지연(defer)할 수 있습니다. 이렇게 하면, 매 요청마다 파일 시스템에서 불필요하게 프로바이더를 로드하는 일이 없어 애플리케이션의 성능이 향상됩니다.

라라벨은 지연 서비스 프로바이더가 제공하는 모든 서비스 목록과 각 서비스의 프로바이더 클래스명을 컴파일해서 저장해둡니다. 그리고 실제로 특정 서비스를 resolve하려고 할 때에만 해당 서비스 프로바이더를 로드합니다.

프로바이더의 로딩을 지연하려면, `\Illuminate\Contracts\Support\DeferrableProvider` 인터페이스를 구현하고, `provides` 메서드를 정의해야 합니다. `provides` 메서드는 프로바이더가 등록한 서비스 컨테이너 바인딩 목록을 반환합니다:

```php
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
