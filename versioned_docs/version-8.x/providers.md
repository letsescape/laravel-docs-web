# 서비스 프로바이더 (Service Providers)

- [소개](#introduction)
- [서비스 프로바이더 작성하기](#writing-service-providers)
    - [register 메서드](#the-register-method)
    - [boot 메서드](#the-boot-method)
- [프로바이더 등록하기](#registering-providers)
- [지연(Deferred) 프로바이더](#deferred-providers)

<a name="introduction"></a>
## 소개

서비스 프로바이더는 모든 라라벨 애플리케이션의 부트스트래핑(초기 설정)을 담당하는 중심 역할을 합니다. 여러분이 작성한 애플리케이션뿐 아니라, 라라벨의 모든 핵심 서비스들도 서비스 프로바이더를 통해 부트스트랩됩니다.

여기서 "부트스트랩(bootstrapped)"이란 무엇을 의미할까요? 일반적으로, 여기서는 각종 설정 등록, 즉 서비스 컨테이너 바인딩, 이벤트 리스너, 미들웨어, 라우트 등의 다양한 것들을 **등록**하는 과정을 의미합니다. 서비스 프로바이더는 애플리케이션을 구성하는 핵심적인 위치입니다.

`config/app.php` 파일을 열어보면 `providers` 배열이 있습니다. 이 배열에는 애플리케이션에서 로드될 서비스 프로바이더 클래스들이 나열되어 있습니다. 기본적으로 라라벨의 핵심 서비스 프로바이더들이 이 배열에 포함되어 있습니다. 이 프로바이더들은 메일러, 큐, 캐시 등 핵심 라라벨 컴포넌트들을 부트스트랩합니다. 이 중 상당수는 "지연(deferred) 프로바이더"로 분류되는데, 이는 해당 프로바이더가 매 요청마다 로드되는 것이 아니라, 그 서비스가 실제로 필요할 때만 로드된다는 뜻입니다.

이 세션에서는 나만의 서비스 프로바이더를 작성하고, 이를 라라벨 애플리케이션에 등록하는 방법을 알아봅니다.

> [!TIP]
> 라라벨이 요청을 어떻게 처리하고 내부적으로 어떻게 동작하는지 더 자세히 알고 싶다면, 라라벨 [요청 라이프사이클](/docs/8.x/lifecycle) 문서도 참고해보세요.

<a name="writing-service-providers"></a>
## 서비스 프로바이더 작성하기

모든 서비스 프로바이더는 `Illuminate\Support\ServiceProvider` 클래스를 상속합니다. 보통 서비스 프로바이더에는 `register`와 `boot` 두 개의 메서드가 포함됩니다. `register` 메서드 안에서는 **오직 [서비스 컨테이너](/docs/8.x/container)에 바인딩만** 해야 합니다. 이벤트 리스너나 라우트, 그 밖의 다른 기능들은 절대 이 메서드 안에서 등록하지 않아야 합니다.

Artisan CLI를 사용해서 새로운 프로바이더를 만들 수 있습니다. 아래 명령어를 사용하면 됩니다:

```
php artisan make:provider RiakServiceProvider
```

<a name="the-register-method"></a>
### register 메서드

앞서 설명했듯이, `register` 메서드에서는 오직 [서비스 컨테이너](/docs/8.x/container)에 바인딩 작업만 수행해야 합니다. 이 메서드에서 이벤트 리스너, 라우트, 그 외의 기능을 등록하려고 시도하면 안 됩니다. 그렇지 않으면, 아직 로드되지 않은 다른 서비스 프로바이더에서 제공하는 서비스가 예기치 않게 사용되어 문제가 발생할 수 있습니다.

아래는 기본적인 서비스 프로바이더 작성 예시입니다. 서비스 프로바이더의 모든 메서드 안에서는 항상 `$app` 프로퍼티에 접근할 수 있으며, 이를 통해 서비스 컨테이너를 사용할 수 있습니다:

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

이 서비스 프로바이더는 오직 `register` 메서드만 정의하며, 이 안에서 `App\Services\Riak\Connection`의 구현체를 서비스 컨테이너에 바인딩합니다. 라라벨의 서비스 컨테이너가 익숙하지 않다면, [서비스 컨테이너 문서](/docs/8.x/container)를 참고해주세요.

<a name="the-bindings-and-singletons-properties"></a>
#### `bindings` 및 `singletons` 프로퍼티

여러 개의 단순한 바인딩을 서비스 프로바이더에서 등록해야 한다면, 각각을 따로 코드로 작성하는 대신 `bindings`와 `singletons` 프로퍼티를 활용할 수 있습니다. 프레임워크가 서비스 프로바이더를 로드할 때 이 프로퍼티들을 자동으로 확인해서 바인딩을 등록합니다:

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
     * 등록할 모든 컨테이너 바인딩.
     *
     * @var array
     */
    public $bindings = [
        ServerProvider::class => DigitalOceanServerProvider::class,
    ];

    /**
     * 등록할 모든 컨테이너 싱글턴.
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

그렇다면 서비스 프로바이더 안에서 [뷰 컴포저](/docs/8.x/views#view-composers)와 같은 기능을 등록해야 할 때는 어떻게 할까요? 이런 경우에는 `boot` 메서드 안에서 처리해야 합니다. **이 메서드는 모든 다른 서비스 프로바이더가 등록된 이후에 실행되므로**, 프레임워크에서 등록된 다른 모든 서비스에 접근할 수 있습니다:

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
#### boot 메서드의 의존성 주입

서비스 프로바이더의 `boot` 메서드에는 의존성 주입을 사용할 수 있습니다. [서비스 컨테이너](/docs/8.x/container)가 필요로 하는 모든 의존성을 자동으로 주입해줍니다:

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
## 프로바이더 등록하기

모든 서비스 프로바이더는 `config/app.php` 설정 파일에 등록합니다. 이 파일 안의 `providers` 배열에 각 서비스 프로바이더 클래스의 이름을 나열할 수 있습니다. 기본적으로 라라벨의 핵심 서비스 프로바이더들이 이 배열에 포함되어 있습니다. 이 프로바이더들은 메일러, 큐, 캐시 등과 같은 핵심 라라벨 컴포넌트들을 부트스트랩합니다.

나만의 프로바이더를 등록하려면, 아래처럼 배열에 추가하세요:

```
'providers' => [
    // 기타 서비스 프로바이더

    App\Providers\ComposerServiceProvider::class,
],
```

<a name="deferred-providers"></a>
## 지연(Deferred) 프로바이더

프로바이더에서 **오직** [서비스 컨테이너](/docs/8.x/container) 바인딩만 등록하는 경우, 실제 바인딩이 필요해질 때까지 프로바이더의 로드를 지연시킬 수 있습니다. 이렇게 하면 파일 시스템에서 해당 프로바이더를 매 요청마다 불러올 필요가 없어, 애플리케이션의 성능이 향상됩니다.

라라벨은 지연 서비스 프로바이더가 제공하는 모든 서비스와 서비스 프로바이더 클래스 이름을 컴파일하여 저장합니다. 이후, 이 서비스들 중 하나를 실제로 사용하려고 할 때에만 라라벨이 서비스 프로바이더를 로드합니다.

프로바이더의 로드를 지연시키려면, `\Illuminate\Contracts\Support\DeferrableProvider` 인터페이스를 구현하고, `provides` 메서드를 정의하면 됩니다. `provides` 메서드는 이 프로바이더가 등록하는 서비스 컨테이너 바인딩 목록을 반환해야 합니다.

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
