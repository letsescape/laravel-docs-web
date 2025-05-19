# 서비스 제공자 (Service Providers)

- [소개](#introduction)
- [서비스 제공자 작성하기](#writing-service-providers)
    - [Register 메서드](#the-register-method)
    - [Boot 메서드](#the-boot-method)
- [제공자 등록하기](#registering-providers)
- [지연 제공자](#deferred-providers)

<a name="introduction"></a>
## 소개

서비스 제공자(Service Provider)는 라라벨 애플리케이션의 모든 부트스트래핑(초기화 작업)의 중심이 되는 곳입니다. 여러분이 직접 만든 애플리케이션은 물론, 라라벨의 핵심 서비스들도 모두 서비스 제공자를 통해 부트스트랩됩니다.

그런데 여기서 "부트스트랩"이란 무엇을 의미할까요? 일반적으로, **각종 리소스 등록 작업**을 말합니다. 예를 들면, 서비스 컨테이너 바인딩 등록, 이벤트 리스너 등록, 미들웨어 및 라우트 등록 등 다양한 설정이 포함됩니다. 즉, 서비스 제공자는 애플리케이션의 설정을 모아두는 중심 장소입니다.

라라벨의 `config/app.php` 파일을 열어보면 `providers` 배열이 있습니다. 여기에 나열된 모든 서비스 제공자 클래스들은 애플리케이션이 실행될 때 함께 로드됩니다. 기본적으로 라라벨의 핵심 서비스 제공자들이 이 배열에 등록되어 있습니다. 이들 제공자는 메일러, 큐, 캐시 같은 라라벨의 핵심 기능들을 초기화합니다. 그리고 이 중 상당수는 "지연 제공자"로, 제공하는 서비스가 실제로 필요할 때만 로드됩니다. 즉, 매 요청마다 로딩되지 않고, 서비스가 요청될 때에만 필요한 서비스 제공자가 로드되어 성능을 높여줍니다.

이 안내서에서는 여러분만의 서비스 제공자를 작성하고, 라라벨 애플리케이션에 등록하는 방법을 배울 수 있습니다.

> [!NOTE]
> 라라벨이 요청을 어떻게 처리하는지, 내부적으로 어떻게 동작하는지 더 알고 싶다면 [요청 라이프사이클](/docs/9.x/lifecycle) 문서도 참고하시기 바랍니다.

<a name="writing-service-providers"></a>
## 서비스 제공자 작성하기

모든 서비스 제공자 클래스는 `Illuminate\Support\ServiceProvider` 클래스를 상속받아야 합니다. 그리고 대부분의 서비스 제공자에는 `register` 메서드와 `boot` 메서드가 존재합니다. **`register` 메서드 안에서는 반드시 [서비스 컨테이너](/docs/9.x/container)에 바인딩하는 작업만** 해야 하며, 이벤트 리스너나 라우트 등록, 그 외 다른 기능은 절대 이곳에 추가해서는 안 됩니다.

새로운 서비스 제공자는 Artisan CLI의 `make:provider` 명령어를 사용해 만들 수 있습니다.

```shell
php artisan make:provider RiakServiceProvider
```

<a name="the-register-method"></a>
### Register 메서드

앞서 언급했듯이, `register` 메서드에서는 오직 [서비스 컨테이너](/docs/9.x/container)에 필요한 바인딩만 등록해야 합니다. 여기서는 이벤트 리스너, 라우트, 기타 기능을 등록하면 안 됩니다. 만약 다른 서비스 제공자가 아직 로드되지 않은 상태에서 그 서비스를 사용하게 되면 문제를 일으킬 수 있기 때문입니다.

기본적인 서비스 제공자 예제를 살펴보겠습니다. 여러분이 작성하는 서비스 제공자 메서드 내에서는 항상 `$app` 속성에 접근할 수 있는데, 이를 통해 서비스 컨테이너를 사용할 수 있습니다.

```
<?php

namespace App\Providers;

use App\Services\Riak\Connection;
use Illuminate\Support\ServiceProvider;

class RiakServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->singleton(Connection::class, function ($app) {
            return new Connection(config('riak'));
        });
    }
}
```

위 서비스 제공자는 `register` 메서드만 정의하고, 이 메서드 안에서 `App\Services\Riak\Connection`을 서비스 컨테이너에 싱글턴으로 바인딩합니다. 라라벨의 서비스 컨테이너가 익숙하지 않다면 [관련 문서](/docs/9.x/container)도 참고해보세요.

<a name="the-bindings-and-singletons-properties"></a>
#### `bindings`와 `singletons` 속성

여러 개의 간단한 바인딩을 서비스 제공자에 등록하는 경우, 각각을 일일이 등록하는 대신, `bindings`와 `singletons` 속성을 활용할 수 있습니다. 프레임워크가 서비스 제공자를 로드할 때 이 속성들을 자동으로 확인해, 바인딩을 바로 등록해줍니다.

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

그렇다면 서비스 제공자에서 [뷰 컴포저](/docs/9.x/views#view-composers)를 등록하고 싶을 때는 어디에 작성할까요? 이 경우에는 `boot` 메서드에서 처리해야 합니다. **`boot` 메서드는 모든 다른 서비스 제공자가 등록된 후에 호출**되므로, 프레임워크에서 이미 등록된 다른 서비스들도 모두 사용할 수 있습니다.

```
<?php

namespace App\Providers;

use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class ComposerServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        View::composer('view', function () {
            //
        });
    }
}
```

<a name="boot-method-dependency-injection"></a>
#### Boot 메서드 의존성 주입

서비스 제공자의 `boot` 메서드에서 의존성 주입(Dependency Injection)을 활용할 수도 있습니다. [서비스 컨테이너](/docs/9.x/container)가 필요한 의존성을 자동으로 주입해줍니다.

```
use Illuminate\Contracts\Routing\ResponseFactory;

/**
 * Bootstrap any application services.
 *
 * @param  \Illuminate\Contracts\Routing\ResponseFactory  $response
 * @return void
 */
public function boot(ResponseFactory $response)
{
    $response->macro('serialized', function ($value) {
        //
    });
}
```

<a name="registering-providers"></a>
## 제공자 등록하기

모든 서비스 제공자는 `config/app.php` 설정 파일에 등록됩니다. 이 파일의 `providers` 배열에 서비스 제공자 클래스명을 추가하면 됩니다. 기본적으로 라라벨에서 제공하는 여러 핵심 서비스 제공자들이 이미 등록되어 있습니다. 이들은 메일러, 큐, 캐시 등 다양한 핵심 컴포넌트를 부트스트랩합니다.

직접 만든 제공자를 등록하려면 배열에 다음과 같이 추가하세요.

```
'providers' => [
    // Other Service Providers

    App\Providers\ComposerServiceProvider::class,
],
```

<a name="deferred-providers"></a>
## 지연 제공자

만약 서비스 제공자가 [서비스 컨테이너](/docs/9.x/container) 바인딩만 등록하는 역할이라면, 해당 서비스 제공자를 실제 바인딩이 필요해질 때까지 등록을 "지연(defer)"할 수 있습니다. 이렇게 하면 매 요청마다 파일 시스템에서 무조건 서비스 제공자를 불러오지 않으므로, 애플리케이션 성능이 향상됩니다.

라라벨은 지연 서비스 제공자가 제공하는 모든 서비스 목록과 서비스 제공자 클래스명을 미리 컴파일하여 저장합니다. 그리고 이러한 서비스가 실제로 필요한 시점에만 해당 제공자를 로드합니다.

제공자의 로딩을 지연(defer)하려면, `\Illuminate\Contracts\Support\DeferrableProvider` 인터페이스를 구현하고, `provides` 메서드를 정의해야 합니다. `provides` 메서드는 해당 제공자가 등록하는 서비스 컨테이너 바인딩 목록을 반환해야 합니다.

```
<?php

namespace App\Providers;

use App\Services\Riak\Connection;
use Illuminate\Contracts\Support\DeferrableProvider;
use Illuminate\Support\ServiceProvider;

class RiakServiceProvider extends ServiceProvider implements DeferrableProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->singleton(Connection::class, function ($app) {
            return new Connection($app['config']['riak']);
        });
    }

    /**
     * Get the services provided by the provider.
     *
     * @return array
     */
    public function provides()
    {
        return [Connection::class];
    }
}
```
