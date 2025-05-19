# 서비스 컨테이너 (Service Container)

- [소개](#introduction)
    - [제로 설정 자동 해석](#zero-configuration-resolution)
    - [컨테이너를 언제 사용해야 할까?](#when-to-use-the-container)
- [바인딩](#binding)
    - [바인딩 기초](#binding-basics)
    - [인터페이스를 구현체에 바인딩하기](#binding-interfaces-to-implementations)
    - [컨텍스트 바인딩](#contextual-binding)
    - [컨텍스트 속성](#contextual-attributes)
    - [원시값 바인딩](#binding-primitives)
    - [타입이 지정된 가변 인자 바인딩](#binding-typed-variadics)
    - [태깅](#tagging)
    - [바인딩 확장](#extending-bindings)
- [해결(Resolving)](#resolving)
    - [`make` 메서드](#the-make-method)
    - [자동 주입](#automatic-injection)
- [메서드 호출과 주입](#method-invocation-and-injection)
- [컨테이너 이벤트](#container-events)
    - [리바인딩(Rebinding)](#rebinding)
- [PSR-11](#psr-11)

<a name="introduction"></a>
## 소개

라라벨의 서비스 컨테이너는 클래스 간의 의존성 관리와 의존성 주입을 손쉽게 처리할 수 있게 해주는 강력한 도구입니다. 의존성 주입(Dependency Injection)이란 용어는 다소 어려울 수 있지만, 핵심적으로는 "필요한 클래스(객체)를 생성자나 일부 경우에는 '세터(setter)' 메서드를 통해 클래스에 '주입'해주는 것"입니다.

간단한 예시를 살펴보겠습니다.

```php
<?php

namespace App\Http\Controllers;

use App\Services\AppleMusic;
use Illuminate\View\View;

class PodcastController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct(
        protected AppleMusic $apple,
    ) {}

    /**
     * Show information about the given podcast.
     */
    public function show(string $id): View
    {
        return view('podcasts.show', [
            'podcast' => $this->apple->findPodcast($id)
        ]);
    }
}
```

위 예시에서 `PodcastController`는 Apple Music과 같은 데이터 소스에서 팟캐스트 정보를 가져올 필요가 있습니다. 이런 경우에는 팟캐스트를 가져오는 역할을 가진 서비스를 **주입**받아 사용합니다. 서비스를 주입받음으로써, 실제 동작 환경에서는 실제 `AppleMusic` 서비스를 사용하고, 테스트 환경에서는 `AppleMusic`의 가짜(모의) 구현을 쉽게 만들어 주입할 수 있게 됩니다.

라라벨의 서비스 컨테이너를 잘 이해하는 것은 규모가 큰 강력한 애플리케이션을 만들거나 라라벨의 코어 자체에 기여할 때 반드시 필요한 역량입니다.

<a name="zero-configuration-resolution"></a>
### 제로 설정 자동 해석

클래스에 의존성이 없거나, 의존성이 모두 일반 구체 클래스(인터페이스가 아님)일 경우에는, 컨테이너에 해당 클래스를 어떻게 해석해야 할지 별도로 알려줄 필요가 없습니다. 예를 들어, `routes/web.php` 파일에 아래와 같은 코드를 작성할 수 있습니다.

```php
<?php

class Service
{
    // ...
}

Route::get('/', function (Service $service) {
    dd($service::class);
});
```

위 예제에서 앱의 `/` 경로에 접근하면, `Service` 클래스가 자동으로 해석되어 해당 라우트 핸들러에 주입됩니다. 이 기능은 개발에 큰 변화를 가져다줍니다. 즉, 복잡한 설정 파일에 신경쓰지 않고도 의존성 주입의 장점을 마음껏 누릴 수 있으니, 개발이 매우 빠르고 유연해집니다.

라라벨 애플리케이션을 개발할 때 여러분이 작성하는 대부분의 클래스(예: [컨트롤러](/docs/controllers), [이벤트 리스너](/docs/events), [미들웨어](/docs/middleware) 등)는 컨테이너를 통해 자동으로 의존성을 주입받습니다. 또한 [큐 작업](/docs/queues)의 `handle` 메서드에서도 의존성을 타입힌트로 지정해 주입받을 수 있습니다. 한 번 이 자동 의존성 주입의 편의성을 경험하면, 이제는 의존성 주입 없는 개발은 상상할 수 없을 정도입니다.

<a name="when-to-use-the-container"></a>
### 컨테이너를 언제 사용해야 할까?

제로 설정 자동 해석 덕분에, 라우트, 컨트롤러, 이벤트 리스너 등에서 의존성을 타입힌트로 지정하기만 하면 대부분의 경우 직접 컨테이너를 조작할 필요가 없습니다. 예를 들어 현재 요청(`Illuminate\Http\Request` 객체)이 필요하면 라우트 정의에서 아래와 같이 타입힌트만 해주면 됩니다. 컨테이너가 내부적으로 알아서 이 객체를 주입해줍니다.

```php
use Illuminate\Http\Request;

Route::get('/', function (Request $request) {
    // ...
});
```

실제로는 자동 의존성 주입과 [파사드](/docs/facades) 덕분에, 대부분의 라라벨 애플리케이션을 작성할 때 컨테이너 바인딩이나 해석을 직접 신경 쓰지 않아도 됩니다.  
**그렇다면 언제 직접 컨테이너와 상호작용해야 할까요?** 대표적인 두 가지 상황이 있습니다.

첫째, 어떤 인터페이스를 구현한 클래스를 만들고, 해당 인터페이스를 라우트나 생성자에서 타입힌트로 지정하려는 경우입니다. 이때는 [컨테이너에 어떤 구현체를 사용할지 알려줘야 합니다](#binding-interfaces-to-implementations).

둘째, 다른 개발자들과 공유할 예정인 [라라벨 패키지](/docs/packages)를 만들 때, 패키지의 서비스를 컨테이너에 바인딩해야 할 수 있습니다.

<a name="binding"></a>
## 바인딩

<a name="binding-basics"></a>
### 바인딩 기초

<a name="simple-bindings"></a>
#### 간단한 바인딩

대부분의 서비스 컨테이너 바인딩은 [서비스 프로바이더](/docs/providers)에서 등록합니다. 그래서 이 문서의 예시들도 주로 서비스 프로바이더에서 컨테이너를 사용하는 방법을 보여줍니다.

서비스 프로바이더 내부에서는 항상 `$this->app` 프로퍼티를 통해 컨테이너에 접근할 수 있습니다. `bind` 메서드를 사용해서 바인딩을 등록할 수 있는데, 바인딩하려는 클래스 또는 인터페이스 이름과 해당 클래스를 생성해 반환하는 클로저를 전달합니다.

```php
use App\Services\Transistor;
use App\Services\PodcastParser;
use Illuminate\Contracts\Foundation\Application;

$this->app->bind(Transistor::class, function (Application $app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

위 예시에서처럼, 클로저의 인자로 컨테이너 자체가 주입되므로, 해당 객체의 하위 의존성도 컨테이너를 이용해 쉽게 해결할 수 있습니다.

앞서 언급했듯이 일반적으로 서비스 프로바이더 내에서 컨테이너를 사용하는 경우가 많지만, 서비스 프로바이더 외부에서도 [파사드](/docs/facades)를 통해 컨테이너에 접근할 수 있습니다.

```php
use App\Services\Transistor;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\Facades\App;

App::bind(Transistor::class, function (Application $app) {
    // ...
});
```

이미 동일한 타입의 바인딩이 등록되어 있지 않은 경우에만 바인딩을 추가하고 싶다면 `bindIf` 메서드를 사용할 수 있습니다.

```php
$this->app->bindIf(Transistor::class, function (Application $app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

더 편리하게, 등록하려는 클래스/인터페이스 명을 생략하고, 클로저의 반환 타입에서 바인딩 타입을 추론하도록 할 수도 있습니다.

```php
App::bind(function (Application $app): Transistor {
    return new Transistor($app->make(PodcastParser::class));
});
```

> [!NOTE]
> 클래스가 인터페이스에 의존하지 않는다면 굳이 컨테이너에 바인딩할 필요가 없습니다. 컨테이너는 자동으로 이 객체를 리플렉션을 이용해 생성할 수 있기 때문입니다.

<a name="binding-a-singleton"></a>
#### 싱글톤 바인딩

`singleton` 메서드는, 클래스나 인터페이스를 컨테이너에 한 번만 해석되어 재사용되는 싱글톤 객체로 바인딩합니다. 해당 싱글톤 바인딩이 한 번 해결되고 나면 이후에는 동일 객체 인스턴스가 계속 반환됩니다.

```php
use App\Services\Transistor;
use App\Services\PodcastParser;
use Illuminate\Contracts\Foundation\Application;

$this->app->singleton(Transistor::class, function (Application $app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

특정 타입에 대해 아직 바인딩이 등록되어 있지 않은 경우에만 싱글톤 등록을 하고 싶을 때는 `singletonIf` 메서드를 사용할 수 있습니다.

```php
$this->app->singletonIf(Transistor::class, function (Application $app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

<a name="binding-scoped"></a>
#### 스코프드(Scoped) 싱글톤 바인딩

`scoped` 메서드는, 라라벨의 특정 요청 또는 작업(job) 생명주기 내에서 한 번만 해결되는 객체를 바인딩합니다. 즉, 일반적인 싱글톤과 비슷하지만, `scoped`로 등록된 객체는 [Laravel Octane](/docs/octane) 워커가 새로운 요청을 처리하거나, 라라벨 [큐 워커](/docs/queues)가 새로운 작업을 맡을 때마다 인스턴스가 초기화(플러시)됩니다.

```php
use App\Services\Transistor;
use App\Services\PodcastParser;
use Illuminate\Contracts\Foundation\Application;

$this->app->scoped(Transistor::class, function (Application $app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

마찬가지로, 아직 동일 바인딩이 없을 때만 스코프드 바인딩을 등록하고 싶다면 `scopedIf` 메서드를 사용하면 됩니다.

```php
$this->app->scopedIf(Transistor::class, function (Application $app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

<a name="binding-instances"></a>
#### 인스턴스 바인딩

이미 생성된 객체 인스턴스를 컨테이너에 직접 바인딩할 수도 있습니다. `instance` 메서드로 바인딩한 경우, 항상 같은 객체 인스턴스가 반환됩니다.

```php
use App\Services\Transistor;
use App\Services\PodcastParser;

$service = new Transistor(new PodcastParser);

$this->app->instance(Transistor::class, $service);
```

<a name="binding-interfaces-to-implementations"></a>
### 인터페이스를 구현체에 바인딩하기

서비스 컨테이너의 매우 강력한 기능 중 하나는, 인터페이스와 특정 구현체를 연결(bind)하는 것입니다. 예를 들어 `EventPusher`라는 인터페이스와 `RedisEventPusher`라는 구현체가 있다면, 아래와 같이 바인딩할 수 있습니다.

```php
use App\Contracts\EventPusher;
use App\Services\RedisEventPusher;

$this->app->bind(EventPusher::class, RedisEventPusher::class);
```

이렇게 하면, 컨테이너는 `EventPusher` 인터페이스가 필요할 때 `RedisEventPusher`를 대신 주입해줍니다. 이제 컨테이너가 해석하는 클래스의 생성자에서 인터페이스를 타입힌트로 명시할 수 있습니다. 컨트롤러, 이벤트 리스너, 미들웨어 등 라라벨의 다양한 클래스들은 항상 컨테이너를 통해 해석됩니다.

```php
use App\Contracts\EventPusher;

/**
 * Create a new class instance.
 */
public function __construct(
    protected EventPusher $pusher,
) {}
```

<a name="contextual-binding"></a>
### 컨텍스트 바인딩

때때로 동일한 인터페이스를 사용하는 두 클래스가 있지만, 각 클래스마다 서로 다른 구현체를 주입하고 싶을 수 있습니다. 예를 들어, 두 컨트롤러가 각각 다른 `Illuminate\Contracts\Filesystem\Filesystem` [컨트랙트](/docs/contracts) 구현을 필요로 할 수 있습니다. 라라벨은 이러한 경우를 위한 간단하고 유연한 인터페이스를 제공합니다.

```php
use App\Http\Controllers\PhotoController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\VideoController;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Support\Facades\Storage;

$this->app->when(PhotoController::class)
    ->needs(Filesystem::class)
    ->give(function () {
        return Storage::disk('local');
    });

$this->app->when([VideoController::class, UploadController::class])
    ->needs(Filesystem::class)
    ->give(function () {
        return Storage::disk('s3');
    });
```

<a name="contextual-attributes"></a>
### 컨텍스트 속성

컨텍스트 바인딩은 주로 드라이버나 설정 값을 주입할 때 많이 사용되므로, 라라벨에서는 이러한 값들을 속성(attribute)을 활용해 더 쉽게 주입할 수 있도록 다양한 컨텍스트 바인딩 속성을 제공합니다.

예를 들어, `Storage` 속성(attribute)을 사용하면, 특정 [스토리지 디스크](/docs/filesystem)를 쉽게 주입할 수 있습니다.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Container\Attributes\Storage;
use Illuminate\Contracts\Filesystem\Filesystem;

class PhotoController extends Controller
{
    public function __construct(
        #[Storage('local')] protected Filesystem $filesystem
    )
    {
        // ...
    }
}
```

`Storage` 속성 외에도, Laravel에는 `Auth`, `Cache`, `Config`, `DB`, `Log`, `RouteParameter`, 그리고 [Tag](#tagging) 속성들이 제공됩니다.

```php
<?php

namespace App\Http\Controllers;

use App\Models\Photo;
use Illuminate\Container\Attributes\Auth;
use Illuminate\Container\Attributes\Cache;
use Illuminate\Container\Attributes\Config;
use Illuminate\Container\Attributes\DB;
use Illuminate\Container\Attributes\Log;
use Illuminate\Container\Attributes\RouteParameter;
use Illuminate\Container\Attributes\Tag;
use Illuminate\Contracts\Auth\Guard;
use Illuminate\Contracts\Cache\Repository;
use Illuminate\Database\Connection;
use Psr\Log\LoggerInterface;

class PhotoController extends Controller
{
    public function __construct(
        #[Auth('web')] protected Guard $auth,
        #[Cache('redis')] protected Repository $cache,
        #[Config('app.timezone')] protected string $timezone,
        #[DB('mysql')] protected Connection $connection,
        #[Log('daily')] protected LoggerInterface $log,
        #[RouteParameter('photo')] protected Photo $photo,
        #[Tag('reports')] protected iterable $reports,
    )
    {
        // ...
    }
}
```

또한, 현재 인증된 사용자를 주입해주는 `CurrentUser` 속성도 제공합니다.

```php
use App\Models\User;
use Illuminate\Container\Attributes\CurrentUser;

Route::get('/user', function (#[CurrentUser] User $user) {
    return $user;
})->middleware('auth');
```

<a name="defining-custom-attributes"></a>
#### 커스텀 속성 만들기

여러분만의 컨텍스트 속성을 만들고 싶다면 `Illuminate\Contracts\Container\ContextualAttribute` 컨트랙트를 구현하면 됩니다. 컨테이너는 해당 속성의 `resolve` 메서드를 호출하여 실제로 주입할 값을 결정합니다. 아래는 라라벨의 기본 `Config` 속성을 직접 다시 구현한 예시입니다.

```php
<?php

namespace App\Attributes;

use Attribute;
use Illuminate\Contracts\Container\Container;
use Illuminate\Contracts\Container\ContextualAttribute;

#[Attribute(Attribute::TARGET_PARAMETER)]
class Config implements ContextualAttribute
{
    /**
     * Create a new attribute instance.
     */
    public function __construct(public string $key, public mixed $default = null)
    {
    }

    /**
     * Resolve the configuration value.
     *
     * @param  self  $attribute
     * @param  \Illuminate\Contracts\Container\Container  $container
     * @return mixed
     */
    public static function resolve(self $attribute, Container $container)
    {
        return $container->make('config')->get($attribute->key, $attribute->default);
    }
}
```

<a name="binding-primitives"></a>
### 원시값 바인딩

클래스가 객체 의존성뿐만 아니라 숫자(int) 등과 같은 원시값을 주입받아야 할 때도 있습니다. 이런 경우에도 컨텍스트 바인딩을 활용해 손쉽게 값을 주입할 수 있습니다.

```php
use App\Http\Controllers\UserController;

$this->app->when(UserController::class)
    ->needs('$variableName')
    ->give($value);
```

어떤 클래스가 [태깅](#tagging)된 여러 인스턴스 배열을 의존성으로 가질 경우, `giveTagged` 메서드를 이용해 해당 태그의 모든 바인딩을 배열로 주입할 수 있습니다.

```php
$this->app->when(ReportAggregator::class)
    ->needs('$reports')
    ->giveTagged('reports');
```

설정 파일의 값을 주입하고 싶을 때는 `giveConfig` 메서드를 사용할 수 있습니다.

```php
$this->app->when(ReportAggregator::class)
    ->needs('$timezone')
    ->giveConfig('app.timezone');
```

<a name="binding-typed-variadics"></a>
### 타입이 지정된 가변 인자 바인딩

가끔은 클래스가 가변 인자(variadic) 생성자를 통해 타입이 명시된 객체 배열을 받을 수 있습니다.

```php
<?php

use App\Models\Filter;
use App\Services\Logger;

class Firewall
{
    /**
     * The filter instances.
     *
     * @var array
     */
    protected $filters;

    /**
     * Create a new class instance.
     */
    public function __construct(
        protected Logger $logger,
        Filter ...$filters,
    ) {
        $this->filters = $filters;
    }
}
```

이 경우, 컨텍스트 바인딩에서 `give` 메서드에 클로저를 넘겨 `Filter` 인스턴스 배열을 반환하면 해당 의존성이 해결됩니다.

```php
$this->app->when(Firewall::class)
    ->needs(Filter::class)
    ->give(function (Application $app) {
          return [
              $app->make(NullFilter::class),
              $app->make(ProfanityFilter::class),
              $app->make(TooLongFilter::class),
          ];
    });
```

더 간단하게, 클래스명 배열을 전달하면 컨테이너가 자동으로 각 클래스를 해석해 주입해줍니다.

```php
$this->app->when(Firewall::class)
    ->needs(Filter::class)
    ->give([
        NullFilter::class,
        ProfanityFilter::class,
        TooLongFilter::class,
    ]);
```

<a name="variadic-tag-dependencies"></a>
#### 가변 인자 태그 의존성

클래스가 특정 타입(`Report ...$reports`)으로 가변 인자 의존성을 가질 때, `needs`와 `giveTagged`를 함께 사용하면 해당 [태그](#tagging)의 모든 컨테이너 바인딩을 주입할 수 있습니다.

```php
$this->app->when(ReportAggregator::class)
    ->needs(Report::class)
    ->giveTagged('reports');
```

<a name="tagging"></a>
### 태깅

어떤 "카테고리"에 속하는 모든 바인딩을 한 번에 해석해야 할 일이 있을 수 있습니다.  
예를 들어, 여러 `Report` 인터페이스 구현을 여러 개 받아서 분석하는 리포트 분석기를 만들고 싶다면, 각 구현체를 바인딩하고 `tag` 메서드를 이용해 태그로 묶을 수 있습니다.

```php
$this->app->bind(CpuReport::class, function () {
    // ...
});

$this->app->bind(MemoryReport::class, function () {
    // ...
});

$this->app->tag([CpuReport::class, MemoryReport::class], 'reports');
```

이렇게 태깅된 서비스들은 `tagged` 메서드로 한 번에 모두 불러올 수 있습니다.

```php
$this->app->bind(ReportAnalyzer::class, function (Application $app) {
    return new ReportAnalyzer($app->tagged('reports'));
});
```

<a name="extending-bindings"></a>
### 바인딩 확장

`extend` 메서드를 사용하면 이미 해석된 서비스를 추가적으로 수정하거나 데코레이터 패턴처럼 감쌀 수 있습니다.  
이 메서드는 두 개의 인자를 받으며, 첫 번째는 확장할 서비스 클래스, 두 번째는 해당 서비스를 변형하여 반환하는 클로저입니다. 클로저에는 현재 해석된 서비스와 컨테이너 인스턴스가 전달됩니다.

```php
$this->app->extend(Service::class, function (Service $service, Application $app) {
    return new DecoratedService($service);
});
```

<a name="resolving"></a>
## 해결(Resolving)

<a name="the-make-method"></a>
### `make` 메서드

컨테이너에서 클래스 인스턴스를 해석하려면 `make` 메서드를 사용합니다. `make`는 해석하고자 하는 클래스나 인터페이스의 이름을 인자로 받습니다.

```php
use App\Services\Transistor;

$transistor = $this->app->make(Transistor::class);
```

클래스 의존성 중 컨테이너로 해결할 수 없는 값이 있다면, `makeWith` 메서드에 연관 배열로 전달해 직접 주입할 수 있습니다. 예를 들어 `Transistor` 서비스에 `$id` 값이 필요하다면 이렇게 할 수 있습니다.

```php
use App\Services\Transistor;

$transistor = $this->app->makeWith(Transistor::class, ['id' => 1]);
```

특정 클래스나 인터페이스가 컨테이너에 명시적으로 바인딩되어 있는지 확인하려면 `bound` 메서드를 사용할 수 있습니다.

```php
if ($this->app->bound(Transistor::class)) {
    // ...
}
```

서비스 프로바이더 외부 등 `$app` 변수에 접근할 수 없는 곳에서는 `App` [파사드](/docs/facades)나 `app` [헬퍼](/docs/helpers#method-app)를 사용해 인스턴스를 해석할 수 있습니다.

```php
use App\Services\Transistor;
use Illuminate\Support\Facades\App;

$transistor = App::make(Transistor::class);

$transistor = app(Transistor::class);
```

컨테이너 자체를 클래스의 생성자에서 주입받고 싶다면, `Illuminate\Container\Container` 클래스를 타입힌트로 명시하면 됩니다.

```php
use Illuminate\Container\Container;

/**
 * Create a new class instance.
 */
public function __construct(
    protected Container $container,
) {}
```

<a name="automatic-injection"></a>
### 자동 주입

그 외에도, 일반적으로 많이 사용하는 방식은 컨테이너가 해석하는 클래스(예: [컨트롤러](/docs/controllers), [이벤트 리스너](/docs/events), [미들웨어](/docs/middleware) 등)의 생성자에서 의존성을 타입힌트로 명시하는 것입니다. [큐 작업](/docs/queues)의 `handle` 메서드에서도 동일하게 활용할 수 있습니다.  
이 방법이 가장 실무에서 많이 쓰이며, 대부분의 객체를 이런 식으로 컨테이너에 의존해 작성하면 됩니다.

예를 들어, 아래처럼 애플리케이션에서 정의한 서비스를 컨트롤러의 생성자에서 타입힌트로 명시하면, 서비스가 자동으로 해석되어 클래스에 주입됩니다.

```php
<?php

namespace App\Http\Controllers;

use App\Services\AppleMusic;

class PodcastController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct(
        protected AppleMusic $apple,
    ) {}

    /**
     * Show information about the given podcast.
     */
    public function show(string $id): Podcast
    {
        return $this->apple->findPodcast($id);
    }
}
```

<a name="method-invocation-and-injection"></a>
## 메서드 호출과 주입

객체 인스턴스의 특정 메서드를 호출할 때, 그 메서드가 요구하는 의존성도 컨테이너가 자동으로 주입해주길 원할 때가 있습니다.  
아래와 같은 클래스를 예로 들어보겠습니다.

```php
<?php

namespace App;

use App\Services\AppleMusic;

class PodcastStats
{
    /**
     * Generate a new podcast stats report.
     */
    public function generate(AppleMusic $apple): array
    {
        return [
            // ...
        ];
    }
}
```

컨테이너의 `call` 메서드를 사용하면, 아래와 같이 `generate` 메서드를 호출하면서 의존성을 자동 주입받을 수 있습니다.

```php
use App\PodcastStats;
use Illuminate\Support\Facades\App;

$stats = App::call([new PodcastStats, 'generate']);
```

`call` 메서드는 어떤 PHP 콜러블(callback)도 인자로 받을 수 있습니다. 또한, 클로저도 동일하게 의존성 자동 주입과 함께 사용할 수 있습니다.

```php
use App\Services\AppleMusic;
use Illuminate\Support\Facades\App;

$result = App::call(function (AppleMusic $apple) {
    // ...
});
```

<a name="container-events"></a>
## 컨테이너 이벤트

서비스 컨테이너는 객체를 해석할 때마다 이벤트를 발생시킵니다. `resolving` 메서드를 통해 이 이벤트를 청취(listen)할 수 있습니다.

```php
use App\Services\Transistor;
use Illuminate\Contracts\Foundation\Application;

$this->app->resolving(Transistor::class, function (Transistor $transistor, Application $app) {
    // 컨테이너가 "Transistor" 타입 객체를 해석할 때 호출됩니다...
});

$this->app->resolving(function (mixed $object, Application $app) {
    // 컨테이너가 모든 타입의 객체를 해석할 때 호출됩니다...
});
```

이벤트 콜백에는 해석된 객체가 전달되므로, 해당 객체를 소비자에게 전달하기 전에 추가 속성 등을 설정할 수 있습니다.

<a name="rebinding"></a>
### 리바인딩(Rebinding)

`rebinding` 메서드를 사용하면, 서비스가 컨테이너에 다시 바인딩(등록되었거나, 기존 바인딩이 덮어써졌을 때)될 때마다 콜백을 실행할 수 있습니다.  
이 기능은 특정 바인딩이 업데이트될 때마다 종속성이나 동작을 갱신(수정)해야 할 때 유용합니다.

```php
use App\Contracts\PodcastPublisher;
use App\Services\SpotifyPublisher;
use App\Services\TransistorPublisher;
use Illuminate\Contracts\Foundation\Application;

$this->app->bind(PodcastPublisher::class, SpotifyPublisher::class);

$this->app->rebinding(
    PodcastPublisher::class,
    function (Application $app, PodcastPublisher $newInstance) {
        //
    },
);

// 새로운 바인딩이 등록되면 rebinding 클로저가 실행됩니다...
$this->app->bind(PodcastPublisher::class, TransistorPublisher::class);
```

<a name="psr-11"></a>
## PSR-11

라라벨의 서비스 컨테이너는 [PSR-11](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-11-container.md) 인터페이스를 구현합니다.  
따라서, PSR-11 컨테이너 인터페이스를 타입힌트로 명시해도 라라벨 컨테이너 인스턴스를 받을 수 있습니다.

```php
use App\Services\Transistor;
use Psr\Container\ContainerInterface;

Route::get('/', function (ContainerInterface $container) {
    $service = $container->get(Transistor::class);

    // ...
});
```

주어진 식별자를 해석할 수 없는 경우 예외가 발생합니다.  
식별자가 아예 바인딩된 적이 없다면 `Psr\Container\NotFoundExceptionInterface` 예외가,  
식별자가 바인딩되어 있지만 해석(인스턴스화)에 실패했다면 `Psr\Container\ContainerExceptionInterface` 예외가 던져집니다.
