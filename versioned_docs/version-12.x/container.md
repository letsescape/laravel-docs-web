# 서비스 컨테이너 (Service Container)

- [소개](#introduction)
    - [제로 설정 해석](#zero-configuration-resolution)
    - [컨테이너를 언제 활용해야 할까요](#when-to-use-the-container)
- [바인딩](#binding)
    - [바인딩 기본](#binding-basics)
    - [인터페이스를 구현체에 바인딩하기](#binding-interfaces-to-implementations)
    - [컨텍스트별 바인딩](#contextual-binding)
    - [컨텍스트 속성](#contextual-attributes)
    - [기본형 바인딩](#binding-primitives)
    - [타입이 지정된 가변 인자 바인딩](#binding-typed-variadics)
    - [태깅(Tagging)](#tagging)
    - [바인딩 확장(Extending)](#extending-bindings)
- [해결(Resolving)](#resolving)
    - [`make` 메서드](#the-make-method)
    - [자동 주입(Automatic Injection)](#automatic-injection)
- [메서드 호출과 주입](#method-invocation-and-injection)
- [컨테이너 이벤트](#container-events)
    - [리바인딩(Rebinding)](#rebinding)
- [PSR-11](#psr-11)

<a name="introduction"></a>
## 소개

라라벨의 서비스 컨테이너는 클래스 간의 의존성 관리를 위한 강력한 도구로, 의존성 주입(Dependency Injection)을 매우 쉽게 구현할 수 있습니다. 의존성 주입이란, 클래스가 필요로 하는 의존 객체를 생성자 또는 경우에 따라 "setter" 메서드를 통해 "주입"받는다는 뜻입니다.

간단한 예제를 살펴보겠습니다:

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

위 예제에서 `PodcastController`는 Apple Music 등과 같은 데이터 소스에서 팟캐스트를 가져와야 합니다. 따라서 팟캐스트 정보를 조회하는 서비스를 **주입**받아 사용합니다. 이렇게 서비스를 주입받으면, 애플리케이션 테스트 시 `AppleMusic` 서비스를 "모킹(mock)"하거나 임시 구현체로 대체하는 것도 매우 쉬워집니다.

라라벨의 서비스 컨테이너를 깊이 이해하는 것은 대규모 애플리케이션을 구축하거나 라라벨 코어에 기여할 때도 필수적입니다.

<a name="zero-configuration-resolution"></a>
### 제로 설정 해석

클래스가 별도의 의존성이 없거나, 인터페이스가 아닌 구체 클래스만을 의존한다면, 컨테이너에 별도의 바인딩을 명시하지 않아도 해당 클래스를 자동으로 해석할 수 있습니다. 예를 들어, 아래 코드를 `routes/web.php`에 작성할 수 있습니다:

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

이 예제에서 애플리케이션의 `/` 경로에 접속하면, `Service` 클래스가 자동으로 해석되어 해당 라우트의 함수에 주입됩니다. 이는 애플리케이션 개발에 있어서 의존성 주입의 강력함을 물리적으로 느낄 수 있으며, 더 이상 복잡한 설정 파일에 신경 쓸 필요가 없다는 의미이기도 합니다.

다행히도, 라라벨 애플리케이션을 개발할 때 만드는 많은 클래스들(예: [컨트롤러](/docs/12.x/controllers), [이벤트 리스너](/docs/12.x/events), [미들웨어](/docs/12.x/middleware) 등)은 별다른 설정 없이 서비스 컨테이너를 통해 필요한 의존성을 자동으로 주입받게 됩니다. 추가로, [큐 작업](/docs/12.x/queues)의 `handle` 메서드에도 의존성을 타입힌트로 지정해 주입받을 수 있습니다. 이렇게 자동, 무설정 의존성 주입이 주는 개발 편의성을 경험하면, 없이는 개발이 불가능할 정도가 됩니다.

<a name="when-to-use-the-container"></a>
### 컨테이너를 언제 활용해야 할까요

제로 설정 해석 덕분에, 여러분은 라우트, 컨트롤러, 이벤트 리스너 등에서 의존성을 타입힌트만으로 지정해 사용할 수 있습니다. 예를 들어, 아래와 같이 라우트에서 `Illuminate\Http\Request`를 타입힌트로 지정하면 현재 요청 객체를 쉽게 사용할 수 있습니다. 코드에서는 서비스 컨테이너를 직접 다루지 않지만, 컨테이너가 이러한 의존성 주입을 백그라운드에서 처리합니다.

```php
use Illuminate\Http\Request;

Route::get('/', function (Request $request) {
    // ...
});
```

따라서, 자동 의존성 주입과 [파사드](/docs/12.x/facades) 덕분에 대부분의 라라벨 애플리케이션은 컨테이너를 직접 바인딩하거나 해석(resolving)하지 않아도 개발이 가능합니다.  
**그렇다면 언제 컨테이너에 직접 접근하고 수동으로 바인딩을 해야 할까요?** 대표적으로 아래 두 가지 상황이 있습니다.

첫 번째, 클래스가 어떤 인터페이스를 구현하고 있고, 라우트나 클래스 생성자에서 해당 인터페이스를 타입힌트하려는 경우입니다. 이때는 [인터페이스와 구현체의 바인딩 방법](#binding-interfaces-to-implementations)을 컨테이너에 알려야 합니다.  
두 번째, [라라벨 패키지](/docs/12.x/packages)를 개발해서 다른 라라벨 개발자들과 공유하려는 경우, 패키지에서 제공하는 서비스를 컨테이너에 바인딩해야 할 수 있습니다.

<a name="binding"></a>
## 바인딩

<a name="binding-basics"></a>
### 바인딩 기본

<a name="simple-bindings"></a>
#### 단순 바인딩

대부분의 서비스 컨테이너 바인딩은 [서비스 프로바이더](/docs/12.x/providers) 내부에서 등록합니다. 그래서 아래 예제들도 서비스 프로바이더에서 컨테이너를 활용하는 방식을 보여줍니다.

서비스 프로바이더에서는 항상 `$this->app` 속성을 통해 컨테이너 인스턴스에 접근할 수 있습니다. 클래스나 인터페이스 이름, 그리고 해당 클래스를 반환하는 클로저를 `bind` 메서드에 전달해 바인딩을 등록할 수 있습니다.

```php
use App\Services\Transistor;
use App\Services\PodcastParser;
use Illuminate\Contracts\Foundation\Application;

$this->app->bind(Transistor::class, function (Application $app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

위 예제처럼, 리졸버(클로저)의 인자로 컨테이너 인스턴스가 전달됩니다. 이를 사용해 객체를 만드는 과정에서 필요한 하위 의존성도 쉽게 해결할 수 있습니다.

이처럼 컨테이너와 주로 서비스 프로바이더에서 상호작용하지만, 서비스 프로바이더 외부에서 컨테이너와 상호작용하고 싶다면 `App` [파사드](/docs/12.x/facades)를 사용할 수 있습니다.

```php
use App\Services\Transistor;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\Facades\App;

App::bind(Transistor::class, function (Application $app) {
    // ...
});
```

`bindIf` 메서드는 해당 타입에 이미 바인딩된 경우가 없을 때만 새로 바인딩을 등록합니다.

```php
$this->app->bindIf(Transistor::class, function (Application $app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

또한 편의상, 바인딩하려는 클래스 혹은 인터페이스 이름을 따로 지정하지 않고, `bind` 메서드에 반환 타입이 명시된 클로저만 전달해도 라라벨이 타입을 자동 추론해 바인딩할 수 있습니다.

```php
App::bind(function (Application $app): Transistor {
    return new Transistor($app->make(PodcastParser::class));
});
```

> [!NOTE]
> 의존성이 없는 클래스라면 굳이 컨테이너에 바인딩하지 않아도 됩니다. 이런 객체들은 컨테이너가 리플렉션(reflection)을 활용해 자동으로 생성할 수 있기 때문입니다.

<a name="binding-a-singleton"></a>
#### 싱글톤 바인딩

`singleton` 메서드는 컨테이너에 한 번만 인스턴스를 생성해서 그 이후부터 항상 같은 객체를 반환하는 방식으로 클래스나 인터페이스를 바인딩합니다.

```php
use App\Services\Transistor;
use App\Services\PodcastParser;
use Illuminate\Contracts\Foundation\Application;

$this->app->singleton(Transistor::class, function (Application $app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

`singletonIf` 메서드는 해당 타입에 이미 싱글톤 바인딩이 없을 때만 싱글톤으로 바인딩합니다.

```php
$this->app->singletonIf(Transistor::class, function (Application $app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

<a name="binding-scoped"></a>
#### 스코프 싱글톤 바인딩

`scoped` 메서드는 라라벨의 하나의 요청(Request) 또는 작업(Job) 라이프사이클 내에서만 한 번 해석되는 싱글톤을 바인딩합니다. 즉, `singleton`과 비슷하지만, [Laravel Octane](/docs/12.x/octane) 워커가 새 요청을 처리하거나, [큐 작업자](/docs/12.x/queues)가 새 작업을 처리할 때 스코프 싱글톤 인스턴스는 새로 초기화됩니다.

```php
use App\Services\Transistor;
use App\Services\PodcastParser;
use Illuminate\Contracts\Foundation\Application;

$this->app->scoped(Transistor::class, function (Application $app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

`scopedIf` 메서드는 해당 타입에 이미 스코프 싱글톤 바인딩이 없을 때만 등록합니다.

```php
$this->app->scopedIf(Transistor::class, function (Application $app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

<a name="binding-instances"></a>
#### 인스턴스 바인딩

이미 생성된 객체 인스턴스를 `instance` 메서드를 사용해 컨테이너에 등록할 수도 있습니다. 이렇게 등록된 인스턴스는 이후 해당 타입을 요청할 때마다 항상 같은 인스턴스만 반환됩니다.

```php
use App\Services\Transistor;
use App\Services\PodcastParser;

$service = new Transistor(new PodcastParser);

$this->app->instance(Transistor::class, $service);
```

<a name="binding-interfaces-to-implementations"></a>
### 인터페이스를 구현체에 바인딩하기

서비스 컨테이너의 중요한 기능 중 하나는, 특정 인터페이스를 구현한 구체 클래스를 바인딩하는 기능입니다. 예를 들어, `EventPusher` 인터페이스와 그 구현체인 `RedisEventPusher` 가 있다고 가정해보겠습니다. 아래처럼 해당 구현체를 컨테이너에 바인딩할 수 있습니다.

```php
use App\Contracts\EventPusher;
use App\Services\RedisEventPusher;

$this->app->bind(EventPusher::class, RedisEventPusher::class);
```

이렇게 하면 컨테이너는 `EventPusher`가 필요할 때마다 `RedisEventPusher`를 대신 주입합니다. 이제 컨테이너로 해석되는 클래스(컨트롤러, 이벤트 리스너, 미들웨어 등)의 생성자에 인터페이스를 타입힌트로 지정할 수 있습니다.

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
### 컨텍스트별 바인딩

때로 두 개 이상의 클래스가 동일한 인터페이스를 사용하지만, 각각 다른 구현체를 주입받아야 하는 경우가 있습니다. 예를 들어, 두 컨트롤러가 각각 다른 타입의 `Illuminate\Contracts\Filesystem\Filesystem` [컨트랙트](/docs/12.x/contracts)를 필요로 할 수 있습니다. 이럴 때, 라라벨의 간단한 유창한 인터페이스로 컨텍스트에 따라 다른 바인딩을 지정할 수 있습니다.

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

컨텍스트별 바인딩은 드라이버 구현체나 설정 값을 주입할 때 많이 사용됩니다. 라라벨은 이런 상황에서 컨텍스트 바인딩을 서비스 프로바이더에서 일일이 등록하지 않고도 속성(attribute) 문법을 이용해 값을 주입하는 여러 속성을 제공합니다.

예를 들어, [스토리지 디스크](/docs/12.x/filesystem)를 주입할 때 `Storage` 속성을 활용할 수 있습니다.

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

이 외에도 `Auth`, `Cache`, `Config`, `DB`, `Log`, `RouteParameter`, 그리고 [Tag](#tagging) 속성(attribute)이 지원됩니다.

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

또한, 라라벨은 현 인증 유저를 라우트 혹은 클래스에 주입하는 `CurrentUser` 속성도 제공합니다.

```php
use App\Models\User;
use Illuminate\Container\Attributes\CurrentUser;

Route::get('/user', function (#[CurrentUser] User $user) {
    return $user;
})->middleware('auth');
```

<a name="defining-custom-attributes"></a>
#### 커스텀 속성 정의하기

직접 컨텍스트 속성을 만들고 싶다면 `Illuminate\Contracts\Container\ContextualAttribute` 컨트랙트를 구현하면 됩니다. 컨테이너는 속성의 `resolve` 메서드를 호출해 주입할 값을 결정합니다. 아래는 라라벨의 내장 `Config` 속성을 직접 구현한 예시입니다.

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
### 기본형 바인딩

클래스에 객체 타입 의존성과 함께, 정수 등과 같은 기본형(primitive) 값도 주입해야 할 때가 있습니다. 이런 경우 컨텍스트 바인딩을 사용하여 값을 쉽게 지정할 수 있습니다.

```php
use App\Http\Controllers\UserController;

$this->app->when(UserController::class)
    ->needs('$variableName')
    ->give($value);
```

또, 클래스가 [태깅](#tagging)된 인스턴스의 배열을 필요로 할 수 있습니다. `giveTagged` 메서드를 사용하면 특정 태그가 붙은 컨테이너 바인딩들을 한 번에 배열로 주입할 수 있습니다.

```php
$this->app->when(ReportAggregator::class)
    ->needs('$reports')
    ->giveTagged('reports');
```

설정 파일에서 값을 주입해야 한다면 `giveConfig` 메서드를 사용할 수 있습니다.

```php
$this->app->when(ReportAggregator::class)
    ->needs('$timezone')
    ->giveConfig('app.timezone');
```

<a name="binding-typed-variadics"></a>
### 타입이 지정된 가변 인자 바인딩

간혹 생성자 인자로 객체의 배열을 가변 인자(variadic) 형태로 받을 때가 있습니다.

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

이런 경우, 컨텍스트 바인딩에서 `give` 메서드에 `Filter` 인스턴스의 배열을 반환하는 클로저를 제공하면 의존성 배열을 주입할 수 있습니다.

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

자동화를 위해, 클래스명 배열을 직접 넘겨서도 바인딩할 수 있습니다.

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
#### 태그 기반 가변 인자 의존성

클래스가 타입힌트된 가변 인자(`Report ...$reports`)를 필요로 하는 경우, `needs`와 `giveTagged` 메서드를 이용하면 해당 태그가 붙은 컨테이너 바인딩 전체를 배열로 주입할 수 있습니다.

```php
$this->app->when(ReportAggregator::class)
    ->needs(Report::class)
    ->giveTagged('reports');
```

<a name="tagging"></a>
### 태깅(Tagging)

때로는 한 종류의 바인딩들 전체를 한 번에 해석하고 싶을 때가 있습니다. 예를 들어, 다양한 `Report` 인터페이스 구현체들을 한 배열로 받아서 분석하는 리포트 애널라이저를 만든다고 할 때, 아래처럼 태깅해 둘 수 있습니다.

```php
$this->app->bind(CpuReport::class, function () {
    // ...
});

$this->app->bind(MemoryReport::class, function () {
    // ...
});

$this->app->tag([CpuReport::class, MemoryReport::class], 'reports');
```

이 후, 태그가 붙은 서비스들만 한 번에 컨테이너로부터 배열로 받아올 수 있습니다.

```php
$this->app->bind(ReportAnalyzer::class, function (Application $app) {
    return new ReportAnalyzer($app->tagged('reports'));
});
```

<a name="extending-bindings"></a>
### 바인딩 확장(Extending)

`extend` 메서드를 통해 이미 해석된 서비스를 수정할 수 있습니다. 서비스가 해석될 때 추가적인 코드를 실행하거나, 데코레이터 패턴 등으로 감싸서 반환하도록 할 수 있습니다.  
`extend`는 두 개의 인자를 받습니다. 확장할 서비스 클래스와, 수정된 서비스를 반환하는 클로저(서비스와 컨테이너 인스턴스를 파라미터로 받음)입니다.

```php
$this->app->extend(Service::class, function (Service $service, Application $app) {
    return new DecoratedService($service);
});
```

<a name="resolving"></a>
## 해결(Resolving)

<a name="the-make-method"></a>
### `make` 메서드

컨테이너의 `make` 메서드를 사용하면 원하는 클래스 인스턴스를 쉽게 해석해서 사용할 수 있습니다.  
`make`는 인자로 클래스를 받습니다.

```php
use App\Services\Transistor;

$transistor = $this->app->make(Transistor::class);
```

만약 클래스의 일부 생성자 인자가 서비스 컨테이너로 해석할 수 없는 값이라면, `makeWith` 메서드에 연관 배열로 직접 전달해줄 수도 있습니다.  
예를 들어, `Transistor` 서비스에 `$id` 인자를 수동 주입할 수 있습니다.

```php
use App\Services\Transistor;

$transistor = $this->app->makeWith(Transistor::class, ['id' => 1]);
```

`bound` 메서드를 사용하면, 클래스나 인터페이스가 컨테이너에 명시적으로 바인딩되어있는지 확인할 수 있습니다.

```php
if ($this->app->bound(Transistor::class)) {
    // ...
}
```

서비스 프로바이더 외부 등에서 `$app` 변수가 없는 경우에는, `App` [파사드](/docs/12.x/facades)나 `app` [헬퍼](/docs/12.x/helpers#method-app)를 사용해서 의존성을 해석할 수 있습니다:

```php
use App\Services\Transistor;
use Illuminate\Support\Facades\App;

$transistor = App::make(Transistor::class);

$transistor = app(Transistor::class);
```

컨테이너 인스턴스 그 자체를 클래스의 의존성으로 주입받고 싶을 때는, 생성자에서 `Illuminate\Container\Container` 타입힌트를 사용하면 됩니다.

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
### 자동 주입(Automatic Injection)

대부분의 경우, 컨테이너가 해석하는 클래스(예: [컨트롤러](/docs/12.x/controllers), [이벤트 리스너](/docs/12.x/events), [미들웨어](/docs/12.x/middleware) 등)의 생성자에 의존성을 타입힌트로 지정하면 자동으로 주입됩니다. [큐 작업](/docs/12.x/queues)의 `handle` 메서드에도 타입힌트로 의존성을 받을 수 있습니다. 실제로 대부분의 객체 의존성은 이렇게 자동으로 해석되어 주입됩니다.

예를 들어, 컨트롤러의 생성자에서 직접 만든 서비스를 타입힌트하면, 해당 서비스가 자동으로 컨테이너에서 해석되어 주입됩니다.

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

때때로 객체 인스턴스의 메서드를 호출할 때, 그 메서드의 의존성도 컨테이너가 자동으로 주입해주길 바랄 수 있습니다. 예를 들면 아래와 같은 클래스가 있다고 가정해보겠습니다.

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

아래와 같이 컨테이너의 `call` 메서드를 활용하면, 해당 메서드가 필요로 하는 의존성을 자동으로 주입하면서 메서드를 호출할 수 있습니다.

```php
use App\PodcastStats;
use Illuminate\Support\Facades\App;

$stats = App::call([new PodcastStats, 'generate']);
```

`call` 메서드는 모든 PHP 콜러블(callable)을 받아들일 수 있습니다. 컨테이너의 `call`은 클로저에도 동일하게, 필요한 의존성을 자동 주입해 실행할 수 있습니다.

```php
use App\Services\AppleMusic;
use Illuminate\Support\Facades\App;

$result = App::call(function (AppleMusic $apple) {
    // ...
});
```

<a name="container-events"></a>
## 컨테이너 이벤트

서비스 컨테이너는 객체를 해석할 때마다 내부적으로 이벤트를 발생합니다. 특정 클래스가 해석될 때 이 이벤트를 듣고 후속 처리를 하고 싶다면 `resolving` 메서드를 사용할 수 있습니다.

```php
use App\Services\Transistor;
use Illuminate\Contracts\Foundation\Application;

$this->app->resolving(Transistor::class, function (Transistor $transistor, Application $app) {
    // "Transistor" 타입이 해석될 때마다 호출됩니다...
});

$this->app->resolving(function (mixed $object, Application $app) {
    // 모든 종류의 객체가 해석될 때마다 호출됩니다...
});
```

이때, 해석되는 객체가 콜백의 첫 번째 인자로 전달되어, 사용 목적에 맞게 추가 속성을 지정하거나 후처리를 할 수 있습니다.

<a name="rebinding"></a>
### 리바인딩(Rebinding)

`rebinding` 메서드는 특정 서비스가 컨테이너에 다시 바인딩(재등록 또는 덮어쓰기)될 때마다 실행되는 콜백을 등록합니다. 바인딩이 변경될 때마다 의존성 갱신이나 추가 처리가 필요할 경우에 유용하게 사용할 수 있습니다.

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

// 아래에서 새로운 바인딩을 등록하면 rebinding 콜백이 실행됩니다.
$this->app->bind(PodcastPublisher::class, TransistorPublisher::class);
```

<a name="psr-11"></a>
## PSR-11

라라벨의 서비스 컨테이너는 [PSR-11](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-11-container.md) 인터페이스를 구현하고 있습니다. 따라서 PSR-11의 컨테이너 인터페이스를 타입힌트로 지정해 라라벨 컨테이너 인스턴스를 받아올 수 있습니다.

```php
use App\Services\Transistor;
use Psr\Container\ContainerInterface;

Route::get('/', function (ContainerInterface $container) {
    $service = $container->get(Transistor::class);

    // ...
});
```

만약 해당 식별자가 해석될 수 없다면 예외가 발생합니다.  
등록된 적이 없다면 `Psr\Container\NotFoundExceptionInterface` 타입의 예외가,
등록은 되어 있지만 제대로 해석하지 못했을 경우에는 `Psr\Container\ContainerExceptionInterface` 타입의 예외가 던져집니다.
