# 서비스 컨테이너 (Service Container)

- [소개](#introduction)
    - [제로 구성(Zero Configuration) 해석](#zero-configuration-resolution)
    - [컨테이너를 언제 사용해야 하는가](#when-to-use-the-container)
- [바인딩](#binding)
    - [바인딩 기본](#binding-basics)
    - [인터페이스를 구현체에 바인딩하기](#binding-interfaces-to-implementations)
    - [컨텍스트에 따라 바인딩하기](#contextual-binding)
    - [프리미티브 값 바인딩하기](#binding-primitives)
    - [타입 지정 가변 인수 바인딩](#binding-typed-variadics)
    - [태깅](#tagging)
    - [바인딩 확장하기](#extending-bindings)
- [해결(Resolving)](#resolving)
    - [`make` 메서드](#the-make-method)
    - [자동 의존성 주입](#automatic-injection)
- [메서드 호출 및 주입](#method-invocation-and-injection)
- [컨테이너 이벤트](#container-events)
- [PSR-11](#psr-11)

<a name="introduction"></a>
## 소개

라라벨 서비스 컨테이너는 클래스 간의 의존성 관리와 의존성 주입(Dependency Injection)을 손쉽게 처리할 수 있도록 도와주는 강력한 도구입니다. 의존성 주입이란 간단히 말하면, 클래스가 필요로 하는 의존 객체를 생성자나, 경우에 따라 "setter" 메서드를 통해 "주입"받는 것을 의미합니다.

간단한 예제를 먼저 살펴보겠습니다.

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Repositories\UserRepository;
use App\Models\User;

class UserController extends Controller
{
    /**
     * The user repository implementation.
     *
     * @var UserRepository
     */
    protected $users;

    /**
     * Create a new controller instance.
     *
     * @param  UserRepository  $users
     * @return void
     */
    public function __construct(UserRepository $users)
    {
        $this->users = $users;
    }

    /**
     * Show the profile for the given user.
     *
     * @param  int  $id
     * @return Response
     */
    public function show($id)
    {
        $user = $this->users->find($id);

        return view('user.profile', ['user' => $user]);
    }
}
```

이 예제에서 `UserController`는 데이터 소스에서 사용자를 조회할 필요가 있습니다. 그러므로, 사용자를 조회할 수 있는 서비스를 **주입**합니다. 여기서 `UserRepository`는 [Eloquent](/docs/9.x/eloquent)를 사용해 데이터베이스에서 사용자 정보를 가져올 가능성이 높습니다. 하지만, 레포지토리가 주입되기 때문에, 실제 구현체를 쉽게 교체할 수 있습니다. 또한 테스트시 `UserRepository`의 더미 구현(mock)을 주입해 사용할 수도 있습니다.

라라벨 서비스 컨테이너를 깊이 이해하는 것은 강력하고 대규모 애플리케이션을 만드는 데 필수적이며, 라라벨 코어에 기여하고자 할 때도 반드시 필요한 부분입니다.

<a name="zero-configuration-resolution"></a>
### 제로 구성(Zero Configuration) 해석

클래스에 의존성이 전혀 없거나, 의존성이 모두 다른 구체 클래스(인터페이스가 아닌)로만 구성되어 있다면, 해당 클래스를 어떻게 해석해야 할지 컨테이너에 별도로 알려줄 필요가 없습니다. 예를 들어, 아래 코드처럼 `routes/web.php` 파일에 작성할 수 있습니다.

```
<?php

class Service
{
    //
}

Route::get('/', function (Service $service) {
    die(get_class($service));
});
```

이 예시에서 애플리케이션의 `/` 경로에 접근하면, `Service` 클래스가 자동으로 해석되어 해당 라우트 핸들러 함수에 주입됩니다. 이는 개발 방식에 큰 변화를 가져오는데, 별도의 복잡한 설정 파일을 신경쓰지 않고도 의존성 주입의 이점을 누리며 개발할 수 있기 때문입니다.

다행히도, 라라벨 애플리케이션을 만들 때 작성하는 많은 클래스(예: [컨트롤러](/docs/9.x/controllers), [이벤트 리스너](/docs/9.x/events), [미들웨어](/docs/9.x/middleware) 등)는 서비스 컨테이너를 통해 자동으로 의존성을 주입받게 됩니다. 추가로, [큐 작업(queued jobs)](/docs/9.x/queues)의 `handle` 메서드에도 타입 힌트를 통해 의존성을 명시할 수 있습니다. 자동화된, 그리고 설정이 필요 없는 의존성 주입을 사용해 보면, 이를 빼고 개발하는 것이 거의 불가능하게 느껴질 것입니다.

<a name="when-to-use-the-container"></a>
### 컨테이너를 언제 사용해야 하는가

제로 구성 해석(Zero Configuration Resolution) 덕분에, 실제로 대부분의 상황에서는 컨테이너에 직접 접근하지 않아도 라우트, 컨트롤러, 이벤트 리스너 등에서 타입 힌트만으로 의존성을 주입받을 수 있습니다. 예를 들어, 현재 요청 객체인 `Illuminate\Http\Request`를 라우트에 타입 힌트하여 쉽게 접근할 수 있습니다. 코드상에서 컨테이너와 명시적으로 상호작용하지 않아도, 컨테이너가 이러한 의존성 주입을 내부적으로 처리하고 있습니다.

```
use Illuminate\Http\Request;

Route::get('/', function (Request $request) {
    // ...
});
```

이처럼 자동 의존성 주입과 [파사드](/docs/9.x/facades) 덕분에, 직접적으로 바인딩하거나 해석(Resolve) 작업을 하지 않고도 라라벨 애플리케이션을 만들 수 있습니다.  
**그러면, 컨테이너와 직접 상호작용해야 하는 경우는 언제일까요?** 아래 두 가지 상황을 예로 들 수 있습니다.

첫째, 어떤 인터페이스를 구현하는 클래스를 작성하고, 그 인터페이스를 라우트나 클래스 생성자에 타입 힌트할 경우, [컨테이너에게 해당 인터페이스를 어떻게 해석해야 할지 알려줘야 합니다](#binding-interfaces-to-implementations).  
둘째, [라라벨 패키지](/docs/9.x/packages)를 작성해 다른 라라벨 개발자와 공유할 계획이 있을 경우, 여러분의 패키지 서비스들을 컨테이너에 바인딩해야 하는 상황이 올 수 있습니다.

<a name="binding"></a>
## 바인딩

<a name="binding-basics"></a>
### 바인딩 기본

<a name="simple-bindings"></a>
#### 단순 바인딩(Simple Bindings)

대부분의 서비스 컨테이너 바인딩은 [서비스 프로바이더](/docs/9.x/providers) 안에서 등록하게 됩니다. 아래 예제들 역시 이러한 맥락에서 컨테이너를 사용하는 방법을 보여줍니다.

서비스 프로바이더 내부에서는 항상 `$this->app` 프로퍼티를 통해 컨테이너 인스턴스에 접근할 수 있습니다. `bind` 메서드를 사용하여 등록할 클래스나 인터페이스 이름, 그리고 해당 인스턴스를 반환하는 클로저를 전달하여 바인딩을 할 수 있습니다.

```
use App\Services\Transistor;
use App\Services\PodcastParser;

$this->app->bind(Transistor::class, function ($app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

이 때, 해석기(resolver)로 컨테이너 자체가 인수로 전달되며, 이 컨테이너를 통해 우리가 만들고자 하는 객체의 하위 의존성(sub-dependency)도 해결할 수 있습니다.

앞서 언급했듯이, 서비스 프로바이더에서 컨테이너와 상호작용하는 것이 일반적이지만, 서비스 프로바이더 바깥에서 컨테이너에 직접 접근하고 싶을 때는 `App` [파사드](/docs/9.x/facades)를 사용할 수 있습니다.

```
use App\Services\Transistor;
use Illuminate\Support\Facades\App;

App::bind(Transistor::class, function ($app) {
    // ...
});
```

> [!NOTE]
> 클래스가 어떤 인터페이스도 의존하지 않는다면(즉, 구체 클래스만 의존한다면) 컨테이너에 별도로 바인딩해줄 필요가 없습니다. 컨테이너는 리플렉션(reflection)을 활용해 그러한 객체들은 자동으로 생성할 수 있습니다.

<a name="binding-a-singleton"></a>
#### 싱글턴(Singleton) 바인딩

`singleton` 메서드는 컨테이너에 클래스를 바인딩할 때 해당 인스턴스를 애플리케이션 전역에서 단 한 번만 생성해 사용하도록 만듭니다. 한번 싱글턴으로 바인딩된 이후에는, 이후 컨테이너에서 해당 타입을 요청할 때마다 동일한 인스턴스가 반환됩니다.

```
use App\Services\Transistor;
use App\Services\PodcastParser;

$this->app->singleton(Transistor::class, function ($app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

<a name="binding-scoped"></a>
#### 범위가 지정된 싱글턴(Scoped Singleton) 바인딩

`scoped` 메서드는, 주어진 라라벨 요청(Request) 혹은 작업(Job)의 생명주기 동안에만 단 한 번만 생성되는 싱글턴으로 클래스를 바인딩합니다. 이 방식은 `singleton`과 비슷하지만, `scoped`를 통해 등록하면 애플리케이션의 새로운 "라이프사이클"이 시작될 때마다 인스턴스가 초기화됩니다. 예를 들면, [라라벨 Octane](/docs/9.x/octane) 워커가 새로운 요청을 처리하거나, [큐 워커](/docs/9.x/queues)가 새로운 작업을 처리할 때마다 해당 인스턴스가 플러시됩니다.

```
use App\Services\Transistor;
use App\Services\PodcastParser;

$this->app->scoped(Transistor::class, function ($app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

<a name="binding-instances"></a>
#### 인스턴스 바인딩

이미 생성된 객체 인스턴스를 컨테이너에 바인딩하고 싶다면 `instance` 메서드를 사용할 수 있습니다. 이후 컨테이너에서는 이 인스턴스가 계속 반환됩니다.

```
use App\Services\Transistor;
use App\Services\PodcastParser;

$service = new Transistor(new PodcastParser);

$this->app->instance(Transistor::class, $service);
```

<a name="binding-interfaces-to-implementations"></a>
### 인터페이스를 구현체에 바인딩하기

서비스 컨테이너의 강력한 기능 중 하나는, 인터페이스를 특정 구현체(클래스)에 바인딩하는 능력입니다.  
예를 들어, `EventPusher`라는 인터페이스와 `RedisEventPusher` 구현체가 있다고 가정하겠습니다. 먼저 인터페이스에 대한 `RedisEventPusher` 구현체를 만들었다면, 아래처럼 서비스 컨테이너에 바인딩할 수 있습니다.

```
use App\Contracts\EventPusher;
use App\Services\RedisEventPusher;

$this->app->bind(EventPusher::class, RedisEventPusher::class);
```

위 코드는 "컨테이너는 `EventPusher`가 필요할 때 `RedisEventPusher`를 주입해라"라는 의미입니다. 이제 컨테이너에 의해 해석되는 클래스의 생성자에서 `EventPusher` 인터페이스를 타입 힌트하면, 실제로는 `RedisEventPusher` 인스턴스가 전달됩니다. 컨트롤러, 이벤트 리스너, 미들웨어 등 라라벨 내 다양한 클래스들은 항상 컨테이너를 통해 해석되므로 이 패턴이 매우 널리 적용됩니다.

```
use App\Contracts\EventPusher;

/**
 * Create a new class instance.
 *
 * @param  \App\Contracts\EventPusher  $pusher
 * @return void
 */
public function __construct(EventPusher $pusher)
{
    $this->pusher = $pusher;
}
```

<a name="contextual-binding"></a>
### 컨텍스트에 따라 바인딩하기

하나의 인터페이스를 두 클래스에서 사용하지만, 서로 다른 구현체를 주입하고 싶은 경우가 있습니다.  
예를 들어, 두 컨트롤러가 동일한 `Illuminate\Contracts\Filesystem\Filesystem` [contract](/docs/9.x/contracts)에 의존하지만, 각자 다른 구현체를 원할 수 있습니다.  
라라벨은 이 경우를 위한 직관적이고 유연한 플루언트 인터페이스를 제공합니다.

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

<a name="binding-primitives"></a>
### 프리미티브 값 바인딩하기

클래스가 일반적인 클래스 타입뿐만 아니라, 정수(integer)와 같은 프리미티브 값의 주입도 필요로 할 수 있습니다. 이럴 때도 컨텍스트 바인딩을 활용해서 원하는 값을 쉽게 주입할 수 있습니다.

```
use App\Http\Controllers\UserController;

$this->app->when(UserController::class)
          ->needs('$variableName')
          ->give($value);
```

또한, 어떤 클래스가 [태깅](#tagging)된 인스턴스 배열을 의존할 수 있습니다. `giveTagged` 메서드를 사용하면, 해당 태그로 바인딩된 모든 객체를 한 번에 주입할 수 있습니다.

```
$this->app->when(ReportAggregator::class)
    ->needs('$reports')
    ->giveTagged('reports');
```

만약 애플리케이션의 환경설정 파일에 지정된 값을 주입하고 싶다면, `giveConfig` 메서드를 사용할 수 있습니다.

```
$this->app->when(ReportAggregator::class)
    ->needs('$timezone')
    ->giveConfig('app.timezone');
```

<a name="binding-typed-variadics"></a>
### 타입 지정 가변 인수 바인딩

가끔 클래스 생성자에서 동일한 타입의 객체를 여러 개, 가변 인수(variadic)로 받을 때가 있습니다.

```
<?php

use App\Models\Filter;
use App\Services\Logger;

class Firewall
{
    /**
     * The logger instance.
     *
     * @var \App\Services\Logger
     */
    protected $logger;

    /**
     * The filter instances.
     *
     * @var array
     */
    protected $filters;

    /**
     * Create a new class instance.
     *
     * @param  \App\Services\Logger  $logger
     * @param  array  $filters
     * @return void
     */
    public function __construct(Logger $logger, Filter ...$filters)
    {
        $this->logger = $logger;
        $this->filters = $filters;
    }
}
```

컨텍스트 바인딩을 사용하면, 위와 같이 가변 인수로 받은 `Filter` 객체 배열을 `give` 메서드의 클로저에서 원하는 대로 반환해 의존성을 주입할 수 있습니다.

```
$this->app->when(Firewall::class)
          ->needs(Filter::class)
          ->give(function ($app) {
                return [
                    $app->make(NullFilter::class),
                    $app->make(ProfanityFilter::class),
                    $app->make(TooLongFilter::class),
                ];
          });
```

또는, 해당 타입이 필요할 때 컨테이너가 해석하도록 클래스명 배열만 넘겨줘도 됩니다.

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
#### 가변 인수 태그 의존성

클래스 생성자에 명시된 타입(`Report ...$reports`처럼)에 대해, 컨테이너에 등록된 [태그](#tagging)된 인스턴스들을 모두 주입하고 싶을 때는, `needs`와 `giveTagged` 메서드를 함께 사용하면 됩니다.

```
$this->app->when(ReportAggregator::class)
    ->needs(Report::class)
    ->giveTagged('reports');
```

<a name="tagging"></a>
### 태깅

때때로, 특정 "카테고리"에 해당하는 모든 바인딩을 한 번에 해석해야 할 때가 있습니다.  
예를 들어 `Report` 인터페이스를 구현한 다양한 리포트 구현체들을 배열로 받아 분석하는 `ReportAnalyzer`가 있다고 가정합시다. 각각의 `Report` 구현체를 등록한 후, `tag` 메서드로 태그를 달아줄 수 있습니다.

```
$this->app->bind(CpuReport::class, function () {
    //
});

$this->app->bind(MemoryReport::class, function () {
    //
});

$this->app->tag([CpuReport::class, MemoryReport::class], 'reports');
```

이렇게 서비스에 태그를 달아놓으면, 컨테이너의 `tagged` 메서드를 통해 해당 태그로 바인딩된 모든 객체를 한 번에 쉽게 가져올 수 있습니다.

```
$this->app->bind(ReportAnalyzer::class, function ($app) {
    return new ReportAnalyzer($app->tagged('reports'));
});
```

<a name="extending-bindings"></a>
### 바인딩 확장하기

`extend` 메서드를 사용하면, 이미 해석(Resolved)된 서비스의 동작을 수정하거나 기능을 덧붙일 수 있습니다. 예를 들어, 어떤 서비스가 해석될 때 추가로 데코레이터 패턴처럼 감싸거나 설정을 조절하고 싶을 때 사용할 수 있습니다.  
`extend` 메서드는 두 개의 인수(확장할 서비스 클래스, 변환 처리 클로저)를 받습니다. 클로저에는 (해석된 서비스, 컨테이너 인스턴스)가 전달됩니다.

```
$this->app->extend(Service::class, function ($service, $app) {
    return new DecoratedService($service);
});
```

<a name="resolving"></a>
## 해결(Resolving)

<a name="the-make-method"></a>
### `make` 메서드

`make` 메서드를 사용하면, 컨테이너에서 원하는 클래스 인스턴스를 해석(Resolve)해서 반환받을 수 있습니다.  
`make`는 생성하려는 클래스 또는 인터페이스 이름을 인수로 받습니다.

```
use App\Services\Transistor;

$transistor = $this->app->make(Transistor::class);
```

해석하려는 클래스의 일부 의존성이 컨테이너로부터는 해석될 수 없다면, 그 값만 따로 배열로 전달해 `makeWith` 메서드를 사용할 수 있습니다.  
예를 들어, `Transistor` 서비스의 생성자 인수로 `$id` 값을 수동으로 전달하고 싶을 때는 아래처럼 작성할 수 있습니다.

```
use App\Services\Transistor;

$transistor = $this->app->makeWith(Transistor::class, ['id' => 1]);
```

서비스 프로바이더 바깥 등 `$app` 변수에 접근할 수 없는 위치에서는 `App` [파사드](/docs/9.x/facades)나 `app` [헬퍼 함수](/docs/9.x/helpers#method-app)를 통해 클래스 인스턴스를 해석할 수 있습니다.

```
use App\Services\Transistor;
use Illuminate\Support\Facades\App;

$transistor = App::make(Transistor::class);

$transistor = app(Transistor::class);
```

컨테이너 자체를 해석 받아 사용해야 할 때, 생성자에서 `Illuminate\Container\Container` 클래스를 타입 힌트하면 컨테이너 인스턴스가 자동으로 주입됩니다.

```
use Illuminate\Container\Container;

/**
 * Create a new class instance.
 *
 * @param  \Illuminate\Container\Container  $container
 * @return void
 */
public function __construct(Container $container)
{
    $this->container = $container;
}
```

<a name="automatic-injection"></a>
### 자동 의존성 주입

또한 매우 중요하게, 컨테이너에서 해석되는 클래스(컨트롤러, 이벤트 리스너, 미들웨어 등)의 생성자에서 의존성을 타입 힌트하면, 자동으로 해당 의존성이 주입됩니다.  
[큐 작업(queued jobs)](/docs/9.x/queues)의 `handle` 메서드에 필요한 의존성을 타입 힌트로 명시하는 것도 가능합니다.  
실제 실무에서는 대부분의 객체가 이 방식으로 자동 해석되어 주입됩니다.

예를 들어, 컨트롤러의 생성자에서 애플리케이션에 정의된 레포지토리를 타입 힌트하면, 이 레포지토리 인스턴스가 자동으로 해석되어 주입됩니다.

```
<?php

namespace App\Http\Controllers;

use App\Repositories\UserRepository;

class UserController extends Controller
{
    /**
     * The user repository instance.
     *
     * @var \App\Repositories\UserRepository
     */
    protected $users;

    /**
     * Create a new controller instance.
     *
     * @param  \App\Repositories\UserRepository  $users
     * @return void
     */
    public function __construct(UserRepository $users)
    {
        $this->users = $users;
    }

    /**
     * Show the user with the given ID.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }
}
```

<a name="method-invocation-and-injection"></a>
## 메서드 호출 및 주입

때로는 어떤 객체 인스턴스의 특정 메서드를 호출하면서, 해당 메서드가 필요로 하는 의존성도 컨테이너가 자동 주입해주길 원할 때가 있습니다.  
아래 예시를 보겠습니다.

```
<?php

namespace App;

use App\Repositories\UserRepository;

class UserReport
{
    /**
     * Generate a new user report.
     *
     * @param  \App\Repositories\UserRepository  $repository
     * @return array
     */
    public function generate(UserRepository $repository)
    {
        // ...
    }
}
```

위 클래스의 `generate` 메서드를 컨테이너를 통해 아래처럼 호출할 수 있습니다.

```
use App\UserReport;
use Illuminate\Support\Facades\App;

$report = App::call([new UserReport, 'generate']);
```

`call` 메서드는 어떠한 PHP 콜러블도 사용할 수 있습니다.  
컨테이너의 `call` 메서드는 클로저(익명 함수)의 의존성도 자동 주입이 가능합니다.

```
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\App;

$result = App::call(function (UserRepository $repository) {
    // ...
});
```

<a name="container-events"></a>
## 컨테이너 이벤트

서비스 컨테이너는 객체가 해석될 때마다 이벤트를 발생시킵니다. 컨테이너의 `resolving` 메서드를 사용해 이 이벤트를 청취할 수 있습니다.

```
use App\Services\Transistor;

$this->app->resolving(Transistor::class, function ($transistor, $app) {
    // "Transistor" 타입 객체가 컨테이너에서 해석될 때마다 호출됩니다...
});

$this->app->resolving(function ($object, $app) {
    // 어떤 타입이든 객체가 해석될 때마다 호출됩니다...
});
```

이벤트 리스너로 전달된 객체를 활용해서, 객체가 실제로 사용되기 전에 프로퍼티를 추가로 설정하는 등의 작업을 할 수 있습니다.

<a name="psr-11"></a>
## PSR-11

라라벨의 서비스 컨테이너는 [PSR-11](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-11-container.md) 인터페이스를 구현하고 있습니다.  
따라서, PSR-11의 컨테이너 인터페이스를 타입 힌트로 받아 라라벨 컨테이너 인스턴스를 주입받을 수 있습니다.

```
use App\Services\Transistor;
use Psr\Container\ContainerInterface;

Route::get('/', function (ContainerInterface $container) {
    $service = $container->get(Transistor::class);

    //
});
```

해당 식별자를 컨테이너가 해석할 수 없는 경우에는 예외가 발생합니다.  
만약 바인딩된 적이 없는 식별자라면 `Psr\Container\NotFoundExceptionInterface` 타입의 예외가,  
바인딩은 되어 있지만 해석에 실패한 경우라면 `Psr\Container\ContainerExceptionInterface` 타입의 예외가 발생합니다.
