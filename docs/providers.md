# 서비스 프로바이더 (Service Providers)

- [소개](#introduction)
- [서비스 프로바이더 작성하기](#writing-service-providers)
    - [Register 메서드](#the-register-method)
    - [Boot 메서드](#the-boot-method)
- [프로바이더 등록하기](#registering-providers)
- [지연 로딩(Deferred) 프로바이더](#deferred-providers)

<a name="introduction"></a>
## 소개

서비스 프로바이더는 모든 라라벨 애플리케이션의 부트스트래핑(초기 설정 및 실행 준비)의 중심입니다. 여러분이 작성한 애플리케이션은 물론, 라라벨의 핵심 서비스들도 모두 서비스 프로바이더를 통해 부트스트랩됩니다.

그렇다면 여기서 "부트스트랩(bootstrapped)"된다는 의미는 무엇일까요? 일반적으로, **서비스 컨테이너에 바인딩 등록하기**, 이벤트 리스너, 미들웨어, 라우트 등 다양한 요소를 등록하는 작업을 포함합니다. 서비스 프로바이더는 애플리케이션의 설정과 구성을 모아서 관리하는 역할을 합니다.

라라벨은 메일러, 큐, 캐시 등 다양한 핵심 서비스를 부트스트랩하기 위해 내부적으로 수십 개의 서비스 프로바이더를 사용합니다. 이 중 상당수는 "지연 로딩(Deferred)" 프로바이더로, 실제로 해당 서비스가 필요할 때만 로딩됩니다. 즉, 모든 요청에서 매번 로드되지 않으므로 성능 향상에 도움이 됩니다.

여러분이 정의한 사용자 서비스 프로바이더는 모두 `bootstrap/providers.php` 파일에 등록됩니다. 아래의 문서에서는 서비스 프로바이더를 직접 작성하고 라라벨 애플리케이션에 등록하는 방법을 다룹니다.

> [!NOTE]
> 라라벨이 요청을 어떻게 처리하고 내부적으로 동작하는지 더 깊이 알고 싶다면, 라라벨 [요청 생명주기](/docs/lifecycle) 문서를 참고하시기 바랍니다.

<a name="writing-service-providers"></a>
## 서비스 프로바이더 작성하기

모든 서비스 프로바이더는 `Illuminate\Support\ServiceProvider` 클래스를 확장(extends)합니다. 대부분의 서비스 프로바이더에는 `register`와 `boot` 두 가지 메서드가 포함되어 있습니다. `register` 메서드 안에서는 **반드시 [서비스 컨테이너](/docs/container)에 필요한 항목만 바인딩**해야 합니다. 이벤트 리스너, 라우트, 그 외의 다른 기능 등록을 이 메서드 안에서 시도해서는 안 됩니다.

아티즌 CLI를 사용해 `make:provider` 명령어로 새 프로바이더를 쉽게 생성할 수 있습니다. 이때 라라벨은 생성한 프로바이더를 자동으로 애플리케이션의 `bootstrap/providers.php` 파일에 등록해줍니다.

```shell
php artisan make:provider RiakServiceProvider
```

<a name="the-register-method"></a>
### Register 메서드

앞서 설명한 것처럼, `register` 메서드 안에서는 반드시 [서비스 컨테이너](/docs/container)에 바인딩만 등록해야 합니다. 이벤트 리스너나 라우트, 기타 기능을 이곳에서 등록하면 안 됩니다. 그렇지 않으면, 아직 로드되지 않은 서비스 프로바이더에서 제공하는 기능을 실수로 사용하게 되어 의도치 않은 에러가 발생할 수 있습니다.

아래는 기본적인 서비스 프로바이더의 예시입니다. 서비스 프로바이더의 모든 메서드에서는 `$app` 속성(서비스 컨테이너에 접근할 수 있는 속성)을 사용할 수 있습니다.

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

이 서비스 프로바이더는 `register` 메서드만 정의하며, 여기서 `App\Services\Riak\Connection`에 대한 구현체를 서비스 컨테이너에 바인딩합니다. 라라벨의 서비스 컨테이너에 대해 더 익숙하지 않다면, [관련 문서](/docs/container)를 참고하세요.

<a name="the-bindings-and-singletons-properties"></a>
#### `bindings`와 `singletons` 속성

서비스 프로바이더에서 여러 개의 간단한 바인딩을 등록해야 할 때는, 각각을 일일이 코드로 바인딩하는 대신 `bindings`와 `singletons` 속성을 사용할 수 있습니다. 서비스 프로바이더가 로드될 때, 프레임워크가 자동으로 이 속성들을 확인하고 해당 바인딩을 등록해줍니다.

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
     * 등록할 모든 컨테이너 바인딩.
     *
     * @var array
     */
    public $bindings = [
        ServerProvider::class => DigitalOceanServerProvider::class,
    ];

    /**
     * 등록할 모든 컨테이너 싱글톤.
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

만약 서비스 프로바이더에서 [뷰 컴포저](/docs/views#view-composers)와 같은 기능을 등록해야 한다면, 이러한 작업은 `boot` 메서드에서 처리해야 합니다. **`boot` 메서드는 다른 모든 서비스 프로바이더가 등록된 후에 호출**되므로, 프레임워크에 이미 등록된 모든 서비스에 접근할 수 있습니다.

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
#### Boot 메서드의 의존성 주입

서비스 프로바이더의 `boot` 메서드에 필요한 의존성을 타입 힌트로 선언할 수 있습니다. [서비스 컨테이너](/docs/container)가 자동으로 해당 의존성을 주입해줍니다.

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

모든 서비스 프로바이더는 `bootstrap/providers.php` 설정 파일에 등록합니다. 이 파일은 애플리케이션에서 사용할 서비스 프로바이더 클래스 이름을 배열형태로 반환합니다.

```php
<?php

return [
    App\Providers\AppServiceProvider::class,
];
```

`make:provider` 아티즌 명령어를 사용하면, 라라벨이 새로 생성한 프로바이더를 `bootstrap/providers.php` 파일에 자동으로 추가해줍니다. 하지만, 만약 직접 프로바이더 클래스를 생성했다면, 이 배열에 수동으로 추가해야 합니다.

```php
<?php

return [
    App\Providers\AppServiceProvider::class,
    App\Providers\ComposerServiceProvider::class, // [tl! add]
];
```

<a name="deferred-providers"></a>
## 지연 로딩(Deferred) 프로바이더

만약 여러분의 프로바이더가 **오직** [서비스 컨테이너](/docs/container)에 바인딩만 등록한다면, 실제로 해당 바인딩이 필요할 때까지 등록을 지연시키는 옵션을 선택할 수 있습니다. 이렇게 하면 애플리케이션의 성능이 향상되는데, 그 이유는 서비스가 실제로 필요할 때만 파일 시스템에서 로드되기 때문입니다.

라라벨은 지연 로딩되는 서비스 프로바이더가 제공하는 모든 서비스의 목록을 컴파일하고 보관합니다. 그리고 실제로 이 서비스 중 하나를 resolve(해결)하려 할 때만, 프로바이더를 로드합니다.

프로바이더의 로딩을 지연하려면, `\Illuminate\Contracts\Support\DeferrableProvider` 인터페이스를 구현하고, `provides` 메서드를 정의해야 합니다. `provides` 메서드는 프로바이더가 서비스 컨테이너에 등록하는 바인딩 목록을 반환해야 합니다.

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
