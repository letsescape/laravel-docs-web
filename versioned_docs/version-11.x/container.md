# 서비스 컨테이너 (Service Container)

- [소개](#introduction)
    - [제로 구성(Zero Configuration) 자동 해결](#zero-configuration-resolution)
    - [서비스 컨테이너를 언제 활용해야 하는가](#when-to-use-the-container)
- [바인딩](#binding)
    - [바인딩 기본](#binding-basics)
    - [인터페이스를 구현체에 바인딩하기](#binding-interfaces-to-implementations)
    - [컨텍스트 바인딩](#contextual-binding)
    - [컨텍스트 속성](#contextual-attributes)
    - [원시값 바인딩](#binding-primitives)
    - [타입 지정 가변 인자 바인딩](#binding-typed-variadics)
    - [태깅](#tagging)
    - [바인딩 확장하기](#extending-bindings)
- [해결(Resolving)](#resolving)
    - [`make` 메서드](#the-make-method)
    - [자동 의존성 주입](#automatic-injection)
- [메서드 호출과 의존성 주입](#method-invocation-and-injection)
- [컨테이너 이벤트](#container-events)
    - [리바인딩](#rebinding)
- [PSR-11](#psr-11)

<a name="introduction"></a>
## 소개

라라벨의 서비스 컨테이너는 클래스 간의 의존성 관리와 의존성 주입(dependency injection)을 위한 강력한 도구입니다. "의존성 주입"이란, 클래스가 필요로 하는 의존 객체를 직접 생성하지 않고, 생성자 또는 (경우에 따라) "세터(setter)" 메서드를 통해 외부에서 주입받는 방식을 의미합니다.

간단한 예시를 살펴보겠습니다.

```
<?php

namespace App\Http\Controllers;

use App\Services\AppleMusic;
use Illuminate\View\View;

class PodcastController extends Controller
{
    /**
     * 새로운 컨트롤러 인스턴스 생성.
     */
    public function __construct(
        protected AppleMusic $apple,
    ) {}

    /**
     * 주어진 팟캐스트에 대한 정보를 표시.
     */
    public function show(string $id): View
    {
        return view('podcasts.show', [
            'podcast' => $this->apple->findPodcast($id)
        ]);
    }
}
```

이 예제에서 `PodcastController`는 Apple Music과 같은 데이터 소스에서 팟캐스트를 가져와야 합니다. 이를 위해 팟캐스트 정보를 가져올 수 있는 서비스를 **주입**(inject)받습니다. 서비스를 주입받기 때문에, 애플리케이션을 테스트할 때 `AppleMusic` 서비스의 더미 구현(모킹)도 손쉽게 적용할 수 있습니다.

라라벨 서비스 컨테이너의 동작 원리를 깊이 있게 이해하는 것은 대규모 강력한 애플리케이션을 효율적으로 개발하거나 라라벨 코어에 기여하고자 할 때 반드시 필요합니다.

<a name="zero-configuration-resolution"></a>
### 제로 구성(Zero Configuration) 자동 해결

클래스에 별도의 의존성이 없거나, 오로지 구체 클래스만(인터페이스가 아닌) 의존하는 경우, 해당 클래스를 어떻게 해결할지 서비스 컨테이너에 별도의 설정을 할 필요가 없습니다. 예를 들어, `routes/web.php` 파일에 아래와 같은 코드를 작성할 수 있습니다.

```
<?php

class Service
{
    // ...
}

Route::get('/', function (Service $service) {
    die($service::class);
});
```

이 예제에서, 앱의 `/` 경로에 접근하면 자동으로 `Service` 클래스 인스턴스가 생성되어 해당 라우트의 핸들러에 주입됩니다. 이 방식은 매우 획기적입니다. 복잡한 설정 파일 작성에 신경 쓸 필요 없이, 개발 과정에서 자유롭게 의존성 주입의 장점을 누릴 수 있기 때문입니다.

다행히, 라라벨에서 작성하는 대부분의 클래스(예: [컨트롤러](/docs/11.x/controllers), [이벤트 리스너](/docs/11.x/events), [미들웨어](/docs/11.x/middleware) 등)는 서비스 컨테이너를 통해 자동으로 필요한 의존성을 주입받습니다. 또한, [큐 작업](/docs/11.x/queues)의 `handle` 메서드에서도 의존성을 타입 힌트하여 주입받을 수 있습니다. 의존성 주입의 자동화와 제로 구성 환경의 강력함을 경험하면, 다른 방식으로 개발하는 것이 매우 불편하게 느껴질 것입니다.

<a name="when-to-use-the-container"></a>
### 서비스 컨테이너를 언제 활용해야 하는가

제로 구성 자동 해결 덕분에, 라우트, 컨트롤러, 이벤트 리스너 등 다양한 곳에서 의존성을 타입 힌트해 주입받을 수 있습니다. 예를 들어, `Illuminate\Http\Request` 객체를 라우트 정의에서 타입 힌트하면 현재 요청 객체를 손쉽게 사용할 수 있습니다. 비록 컨테이너를 직접 다루는 코드는 없지만, 내부적으로는 서비스 컨테이너가 이 의존성들을 알아서 관리해줍니다.

```
use Illuminate\Http\Request;

Route::get('/', function (Request $request) {
    // ...
});
```

이처럼 자동 의존성 주입과 [파사드](/docs/11.x/facades)의 도움으로, 대부분의 라라벨 애플리케이션은 컨테이너에 바인딩하거나 직접 해결(resolve)하는 작업 없이 개발이 가능합니다. **그렇다면 언제 직접 서비스 컨테이너와 상호작용해야 할까요?** 대표적으로 아래 두 가지 상황이 있습니다.

첫째, 인터페이스를 구현한 클래스를 만들고, 라우트나 클래스 생성자에 그 인터페이스를 타입 힌트하고 싶을 때는 [컨테이너에 인터페이스가 어떤 구현체와 연결될지 직접 알려주어야](#binding-interfaces-to-implementations) 합니다. 둘째, [라라벨 패키지](/docs/11.x/packages)를 작성해 다른 개발자와 공유하고자 할 때에도, 패키지 서비스를 컨테이너에 바인딩하는 작업이 필요합니다.

<a name="binding"></a>
## 바인딩

<a name="binding-basics"></a>
### 바인딩 기본

<a name="simple-bindings"></a>
#### 단순 바인딩

대부분의 서비스 컨테이너 바인딩은 [서비스 프로바이더](/docs/11.x/providers) 내에서 등록합니다. 그래서 본문 예제들은 서비스 프로바이더 내에서 컨테이너를 사용하는 방법을 주로 보여줍니다.

서비스 프로바이더 안에서는 항상 `$this->app` 속성을 통해 컨테이너 인스턴스에 접근할 수 있습니다. `bind` 메서드로 바인딩을 등록할 수 있는데, 바인딩할 클래스 또는 인터페이스의 이름, 그리고 해당 클래스 인스턴스를 반환하는 클로저(익명 함수)를 순서대로 전달합니다.

```
use App\Services\Transistor;
use App\Services\PodcastParser;
use Illuminate\Contracts\Foundation\Application;

$this->app->bind(Transistor::class, function (Application $app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

위와 같이, 바인딩 생성자(클로저)에서 서비스 컨테이너 자신이 인자로 주어집니다. 이를 활용해, 인스턴스를 만들 때 필요한 추가 의존성을 컨테이너로부터 손쉽게 주입받을 수 있습니다.

언급했듯이, 대부분은 서비스 프로바이더 내부에서 컨테이너를 다루게 되지만, 필요하다면 서비스 프로바이더 외부에서도 `App` [파사드](/docs/11.x/facades)를 이용해 컨테이너를 사용할 수 있습니다.

```
use App\Services\Transistor;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\Facades\App;

App::bind(Transistor::class, function (Application $app) {
    // ...
});
```

`bindIf` 메서드를 사용하면, 주어진 타입에 대한 바인딩이 등록되어 있지 않을 때만 새로 바인딩을 등록할 수 있습니다.

```php
$this->app->bindIf(Transistor::class, function (Application $app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

> [!NOTE]  
> 어떤 클래스가 인터페이스에 의존하지 않는다면, 굳이 서비스 컨테이너에 바인딩할 필요는 없습니다. 컨테이너는 리플렉션(reflection, PHP의 클래스/메서드 내부 정보 조회 기능)을 이용하여 이러한 객체들을 자동으로 해결해 주기 때문입니다.

<a name="binding-a-singleton"></a>
#### 싱글턴 바인딩

`singleton` 메서드를 사용하면, 해당 클래스(또는 인터페이스)의 인스턴스를 컨테이너 내에 단 한 번만 생성(싱글턴)하고, 이후 반복적으로 동일 객체를 반환하게 할 수 있습니다.

```
use App\Services\Transistor;
use App\Services\PodcastParser;
use Illuminate\Contracts\Foundation\Application;

$this->app->singleton(Transistor::class, function (Application $app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

`singletonIf` 메서드를 사용하면, 해당 타입에 싱글턴 바인딩이 등록되어 있지 않을 때만 새로 싱글턴 바인딩을 적용할 수 있습니다.

```php
$this->app->singletonIf(Transistor::class, function (Application $app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

<a name="binding-scoped"></a>
#### 범위(Scoped) 싱글턴 바인딩

`scoped` 메서드를 사용하면, 주어진 라라벨 "라이프사이클"(예: 특정 HTTP 요청이나 큐 작업이 처리되는 시점) 동안만 하나의 인스턴스를 생성하고 재사용할 수 있습니다. 일반 싱글턴과 비슷하지만, [Laravel Octane](/docs/11.x/octane) 작업자(worker)가 새 요청을 처리하거나 [큐 작업자](/docs/11.x/queues)가 새 작업을 처리할 때마다 해당 인스턴스가 초기화(플러시)됩니다.

```
use App\Services\Transistor;
use App\Services\PodcastParser;
use Illuminate\Contracts\Foundation\Application;

$this->app->scoped(Transistor::class, function (Application $app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

`scopedIf` 메서드는 범위 바인딩이 미등록된 경우에만 바인딩을 적용합니다.

```
$this->app->scopedIf(Transistor::class, function (Application $app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

<a name="binding-instances"></a>
#### 인스턴스 직접 바인딩

이미 생성된 객체 인스턴스를 `instance` 메서드로 컨테이너에 직접 바인딩할 수도 있습니다. 이후 이 타입을 요청할 때마다 항상 주어진 객체를 반환해 줍니다.

```
use App\Services\Transistor;
use App\Services\PodcastParser;

$service = new Transistor(new PodcastParser);

$this->app->instance(Transistor::class, $service);
```

<a name="binding-interfaces-to-implementations"></a>
### 인터페이스를 구현체에 바인딩하기

서비스 컨테이너의 핵심 장점 중 하나는, 인터페이스를 특정 구현체에 바인딩할 수 있다는 것입니다. 예를 들어, `EventPusher` 인터페이스와 그 구현체인 `RedisEventPusher`가 있다고 가정해 보겠습니다. 아래와 같이 바인딩할 수 있습니다.

```
use App\Contracts\EventPusher;
use App\Services\RedisEventPusher;

$this->app->bind(EventPusher::class, RedisEventPusher::class);
```

위 코드는, `EventPusher` 인터페이스 의존성이 필요할 때마다 컨테이너가 `RedisEventPusher`를 주입하도록 합니다. 이제 컨테이너에 의해 생성되는 클래스(컨트롤러, 이벤트 리스너, 미들웨어 등)의 생성자에 인터페이스 타입힌트를 자유롭게 사용할 수 있습니다.

```
use App\Contracts\EventPusher;

/**
 * 새로운 클래스 인스턴스 생성.
 */
public function __construct(
    protected EventPusher $pusher,
) {}
```

<a name="contextual-binding"></a>
### 컨텍스트 바인딩

때로는 서로 다른 구현체가 필요한 두 클래스가 동일한 인터페이스를 사용해야 하는 경우가 있습니다. 예를 들어, 두 컨트롤러가 각각 다른 `Illuminate\Contracts\Filesystem\Filesystem` [컨트랙트](/docs/11.x/contracts) 구현체에 의존해야 하는 상황에서, 라라벨은 이를 위한 플루언트(체이닝) 방식의 API를 제공합니다.

```
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

컨텍스트 바인딩은 주로 구동 드라이버나 환경설정 값 등을 쉽게 주입할 때 자주 사용됩니다. 라라벨은 이처럼 드라이버 또는 설정 값을 직접 명시적으로 바인딩하지 않고 속성(Attribute) 방식으로 선언하여 간편하게 주입하는 여러 컨텍스트 속성도 제공합니다.

예를 들어, `Storage` 속성을 이용하면 특정 [스토리지 디스크](/docs/11.x/filesystem)를 바로 주입받을 수 있습니다.

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

`Storage` 외에도, `Auth`, `Cache`, `Config`, `DB`, `Log`, `RouteParameter`, [`Tag`](#tagging) 등 다양한 속성을 사용할 수 있습니다.

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

또한, 인증된 사용자를 라우트나 클래스에 자동으로 주입할 수 있도록 돕는 `CurrentUser` 속성도 제공됩니다.

```php
use App\Models\User;
use Illuminate\Container\Attributes\CurrentUser;

Route::get('/user', function (#[CurrentUser] User $user) {
    return $user;
})->middleware('auth');
```

<a name="defining-custom-attributes"></a>
#### 커스텀 속성 정의하기

컨테이너에 주입되는 값을 커스텀 속성(Attribute)으로 만들고 싶다면, `Illuminate\Contracts\Container\ContextualAttribute` 컨트랙트를 구현하세요. 컨테이너가 해당 속성의 `resolve` 메서드를 호출하여, 실제로 어떤 값을 주입해야 하는지 결정합니다. 아래는 라라벨에 내장된 `Config` 속성의 간단한 재구현 예시입니다.

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
     * 새로운 속성 인스턴스 생성.
     */
    public function __construct(public string $key, public mixed $default = null)
    {
    }

    /**
     * 설정 값을 해결.
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

클래스에 객체 의존성뿐 아니라, 정수와 같은 원시값(primitive)도 함께 주입해야 할 때가 있습니다. 컨텍스트 바인딩을 이용하면 원시값도 손쉽게 주입할 수 있습니다.

```
use App\Http\Controllers\UserController;

$this->app->when(UserController::class)
    ->needs('$variableName')
    ->give($value);
```

클래스가 [태그](#tagging)된 인스턴스들의 배열을 의존할 수도 있습니다. `giveTagged`를 사용하면 해당 태그의 모든 바인딩 인스턴스를 자동으로 배열로 주입할 수 있습니다.

```
$this->app->when(ReportAggregator::class)
    ->needs('$reports')
    ->giveTagged('reports');
```

애플리케이션 설정 파일의 값을 주입하려면 `giveConfig` 메서드를 사용할 수 있습니다.

```
$this->app->when(ReportAggregator::class)
    ->needs('$timezone')
    ->giveConfig('app.timezone');
```

<a name="binding-typed-variadics"></a>
### 타입 지정 가변 인자 바인딩

가끔 클래스가 가변 인자(variadic)로 타입 객체 배열을 받는 구조일 수 있습니다.

```
<?php

use App\Models\Filter;
use App\Services\Logger;

class Firewall
{
    /**
     * 필터 인스턴스 배열.
     *
     * @var array
     */
    protected $filters;

    /**
     * 새로운 클래스 인스턴스 생성.
     */
    public function __construct(
        protected Logger $logger,
        Filter ...$filters,
    ) {
        $this->filters = $filters;
    }
}
```

이 경우, 컨텍스트 바인딩에서 `give` 메서드에 원하는 `Filter` 객체들을 배열로 반환하도록 클로저를 넘기면 됩니다.

```
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

혹은, 더 간단하게 클래스명들의 배열만 지정해도 각 객체가 알아서 생성되어 주입됩니다.

```
$this->app->when(Firewall::class)
    ->needs(Filter::class)
    ->give([
        NullFilter::class,
        ProfanityFilter::class,
        TooLongFilter::class,
    ]);
```

<a name="variadic-tag-dependencies"></a>
#### 태그된 가변 인자 의존성

가변 인자(예: `Report ...$reports`)가 특정 클래스 타입으로 지정되어 있을 때, `needs`와 `giveTagged`를 조합해 해당 태그로 등록된 모든 바인딩을 쉽게 주입할 수 있습니다.

```
$this->app->when(ReportAggregator::class)
    ->needs(Report::class)
    ->giveTagged('reports');
```

<a name="tagging"></a>
### 태깅

때로는 여러 "종류"의 바인딩을 한꺼번에 해결해야 할 때가 있습니다. 예를 들어, 다양한 `Report` 인터페이스 구현체로 이루어진 배열을 주입하고 싶을 때, 먼저 각 `Report` 구현체를 바인딩하고, `tag` 메서드를 이용해 이들을 하나의 태그로 묶을 수 있습니다.

```
$this->app->bind(CpuReport::class, function () {
    // ...
});

$this->app->bind(MemoryReport::class, function () {
    // ...
});

$this->app->tag([CpuReport::class, MemoryReport::class], 'reports');
```

이제 서비스가 태그로 묶였다면, 컨테이너의 `tagged` 메서드로 해당 태그에 속한 모든 인스턴스를 한 번에 가져올 수 있습니다.

```
$this->app->bind(ReportAnalyzer::class, function (Application $app) {
    return new ReportAnalyzer($app->tagged('reports'));
});
```

<a name="extending-bindings"></a>
### 바인딩 확장하기

`extend` 메서드를 사용하면, 이미 바인딩된 서비스를 추가로 확장하거나(장식, 데코레이트), 생성 직후 추가 설정을 적용하는 등의 작업을 할 수 있습니다. 이 메서드는 두 개의 인자를 받으며, 첫 번째 인자는 확장할 서비스 클래스이고, 두 번째는 확장된 서비스를 반환하는 클로저입니다(이 클로저에는 기존 서비스 인스턴스와 컨테이너가 주입됨).

```
$this->app->extend(Service::class, function (Service $service, Application $app) {
    return new DecoratedService($service);
});
```

<a name="resolving"></a>
## 해결(Resolving)

<a name="the-make-method"></a>
### `make` 메서드

`make` 메서드를 사용하면, 컨테이너에서 원하는 클래스 인스턴스를 바로 가져올 수 있습니다. 이 메서드는 생성하고자 하는 클래스 또는 인터페이스명을 인수로 받습니다.

```
use App\Services\Transistor;

$transistor = $this->app->make(Transistor::class);
```

만약 생성자에 컨테이너로 해결할 수 없는 의존값이 필요하다면, `makeWith` 메서드를 써서 연관 배열 형태로 직접 값을 전달할 수 있습니다. 예를 들어 `Transistor` 서비스에 `$id`라는 인자를 직접 전달하는 방법은 다음과 같습니다.

```
use App\Services\Transistor;

$transistor = $this->app->makeWith(Transistor::class, ['id' => 1]);
```

`bound` 메서드를 사용해, 특정 클래스나 인터페이스가 컨테이너에 명시적으로 바인딩되어 있는지 확인할 수 있습니다.

```
if ($this->app->bound(Transistor::class)) {
    // ...
}
```

서비스 프로바이더 바깥, `$app` 변수에 접근할 수 없는 코드에서는 `App` [파사드](/docs/11.x/facades) 또는 `app` [헬퍼 함수](/docs/11.x/helpers#method-app)를 활용해 컨테이너에서 인스턴스를 가져올 수 있습니다.

```
use App\Services\Transistor;
use Illuminate\Support\Facades\App;

$transistor = App::make(Transistor::class);

$transistor = app(Transistor::class);
```

또한, 컨테이너 자체를 생성자에 주입받고 싶을 때는, `Illuminate\Container\Container` 클래스를 타입힌트하면 됩니다.

```
use Illuminate\Container\Container;

/**
 * 새로운 클래스 인스턴스 생성.
 */
public function __construct(
    protected Container $container,
) {}
```

<a name="automatic-injection"></a>
### 자동 의존성 주입

실제 개발 시에는, 주로 클래스 생성자에서 의존성을 타입힌트하면 자동으로 컨테이너가 주입해줍니다. 이 방식은 [컨트롤러](/docs/11.x/controllers), [이벤트 리스너](/docs/11.x/events), [미들웨어](/docs/11.x/middleware), 그리고 [큐 작업](/docs/11.x/queues)의 `handle` 메서드 등에서 널리 쓰입니다. 이처럼, 애플리케이션에 필요한 대부분의 객체는 컨테이너에 의해 자연스럽게 주입되고 생성됩니다.

예를 들어, 컨트롤러 생성자에서 앱에 정의된 서비스를 타입힌트하면, 해당 서비스 객체가 자동으로 생성 및 주입됩니다.

```
<?php

namespace App\Http\Controllers;

use App\Services\AppleMusic;

class PodcastController extends Controller
{
    /**
     * 새로운 컨트롤러 인스턴스 생성.
     */
    public function __construct(
        protected AppleMusic $apple,
    ) {}

    /**
     * 주어진 팟캐스트에 대한 정보 표시.
     */
    public function show(string $id): Podcast
    {
        return $this->apple->findPodcast($id);
    }
}
```

<a name="method-invocation-and-injection"></a>
## 메서드 호출과 의존성 주입

때때로, 객체 인스턴스의 특정 메서드를 호출할 때, 컨테이너가 자동으로 해당 메서드의 의존성도 주입해주기를 원할 수 있습니다. 아래 예시 클래스를 보세요.

```
<?php

namespace App;

use App\Services\AppleMusic;

class PodcastStats
{
    /**
     * 새로운 팟캐스트 통계 리포트 생성.
     */
    public function generate(AppleMusic $apple): array
    {
        return [
            // ...
        ];
    }
}
```

컨테이너의 `call` 메서드를 사용하면 아래와 같이 의존성을 자동 주입하고 메서드를 호출할 수 있습니다.

```
use App\PodcastStats;
use Illuminate\Support\Facades\App;

$stats = App::call([new PodcastStats, 'generate']);
```

`call` 메서드는 어떤 PHP 콜러블(callable)이든 받을 수 있습니다. 클로저(익명 함수)도 마찬가지로, 컨테이너가 자동으로 필요한 인자를 주입해줍니다.

```
use App\Services\AppleMusic;
use Illuminate\Support\Facades\App;

$result = App::call(function (AppleMusic $apple) {
    // ...
});
```

<a name="container-events"></a>
## 컨테이너 이벤트

서비스 컨테이너는 객체를 해결할 때마다 이벤트를 발생시킵니다. `resolving` 메서드로 이 이벤트를 청취(리스닝)할 수 있습니다.

```
use App\Services\Transistor;
use Illuminate\Contracts\Foundation\Application;

$this->app->resolving(Transistor::class, function (Transistor $transistor, Application $app) {
    // "Transistor" 타입 객체를 해결할 때 호출됨 ...
});

$this->app->resolving(function (mixed $object, Application $app) {
    // 모든 타입의 객체를 해결할 때마다 호출됨 ...
});
```

이처럼, 주입될 객체가 콜백 함수 인자로 전달되므로, 컨슈머에게 전달되기 전에 추가적인 속성 설정 등 원하는 동작을 진행할 수 있습니다.

<a name="rebinding"></a>
### 리바인딩(Rebinding)

`rebinding` 메서드는 이미 컨테이너에 등록된 서비스가 재등록/덮어쓰여질 때마다(즉, 바인딩이 변경될 때마다) 콜백을 실행할 수 있게 해줍니다. 주로 특정 바인딩이 업데이트될 때마다 의존성을 동적으로 갱신하거나 동작을 변경하고 싶을 때 활용됩니다.

```
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

// 새로 바인딩하면 rebinding 콜백이 동작합니다...
$this->app->bind(PodcastPublisher::class, TransistorPublisher::class);
```

<a name="psr-11"></a>
## PSR-11

라라벨의 서비스 컨테이너는 [PSR-11](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-11-container.md) 인터페이스를 구현합니다. 따라서, PSR-11의 컨테이너 인터페이스를 타입힌트하여 라라벨 컨테이너 인스턴스를 받아올 수 있습니다.

```
use App\Services\Transistor;
use Psr\Container\ContainerInterface;

Route::get('/', function (ContainerInterface $container) {
    $service = $container->get(Transistor::class);

    // ...
});
```

주어진 식별자(identifier)를 해결할 수 없는 경우 예외가 발생합니다. 식별자가 한 번도 바인딩된 적이 없다면 `Psr\Container\NotFoundExceptionInterface` 예외가 발생합니다. 식별자가 바인딩은 되어 있지만 해결이 불가능하면, `Psr\Container\ContainerExceptionInterface` 예외가 발생합니다.
