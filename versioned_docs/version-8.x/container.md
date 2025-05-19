# 서비스 컨테이너 (Service Container)

- [소개](#introduction)
    - [제로 구성(Zero Configuration) 해석](#zero-configuration-resolution)
    - [컨테이너를 언제 사용해야 하는가](#when-to-use-the-container)
- [바인딩](#binding)
    - [기본 바인딩](#binding-basics)
    - [인터페이스를 구현체와 바인딩하기](#binding-interfaces-to-implementations)
    - [컨텍스트별 바인딩](#contextual-binding)
    - [기본값 바인딩](#binding-primitives)
    - [타입 지정 가변 인자 바인딩](#binding-typed-variadics)
    - [태깅](#tagging)
    - [바인딩 확장](#extending-bindings)
- [해결(Resolving)](#resolving)
    - [`make` 메서드](#the-make-method)
    - [자동 주입](#automatic-injection)
- [메서드 호출 및 주입](#method-invocation-and-injection)
- [컨테이너 이벤트](#container-events)
- [PSR-11](#psr-11)

<a name="introduction"></a>
## 소개

라라벨의 서비스 컨테이너는 클래스 간의 의존성 관리를 단순화하고, 개발자가 의존성 주입을 쉽게 활용할 수 있게 도와주는 강력한 도구입니다. 의존성 주입(Dependency Injection)이란, 클래스가 필요로 하는 의존성을 생성자가 받거나, 경우에 따라 "세터" 메서드를 통해 "주입"받는다는 개념입니다.

간단한 예제를 살펴보겠습니다.

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

위 예제에서 `UserController`는 사용자 정보를 어떤 데이터 소스에서 가져와야 합니다. 이를 위해 사용자 정보를 제공하는 서비스를 **주입**받고 있습니다. 이제 `UserRepository`는 대개 [Eloquent](/docs/8.x/eloquent)를 사용하여 데이터베이스에서 사용자 정보를 가져올 것입니다. 하지만 이렇게 저장소 객체를 주입 받으면, 나중에 같은 인터페이스를 구현한 다른 저장소로 교체하거나, 테스트 시에는 `UserRepository`의 더미(가짜) 구현체를 손쉽게 주입할 수 있습니다.

라라벨 서비스 컨테이너의 원리를 깊이 있게 이해하면, 강력하고 확장성 있는 애플리케이션을 구축할 수 있을 뿐 아니라 라라벨 핵심 기능에도 직접 기여할 수 있습니다.

<a name="zero-configuration-resolution"></a>
### 제로 구성(Zero Configuration) 해석

클래스가 의존성이 없거나, 오직 구체 클래스(인터페이스가 아닌)만 의존한다면, 컨테이너에 별도의 설정이나 바인딩이 필요하지 않습니다. 예를 들어, 아래의 코드를 `routes/web.php` 파일에 추가할 수 있습니다.

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

이 예제에서 `/` 경로로 요청이 들어오면, 라라벨이 자동으로 `Service` 클래스를 해석하여 라우트에 주입합니다. 즉, 복잡한 설정 파일 없이도 의존성 주입의 강력함을 누릴 수 있습니다.

라라벨로 애플리케이션을 만들 때 작성하게 되는 많은 클래스들은, [컨트롤러](/docs/8.x/controllers), [이벤트 리스너](/docs/8.x/events), [미들웨어](/docs/8.x/middleware) 등에서 자동으로 컨테이너를 거쳐 의존성이 주입됩니다. 또한 [큐 작업](/docs/8.x/queues)의 `handle` 메서드에서도 타입힌트로 의존성을 받을 수 있습니다. 한 번 이 자동 의존성 주입의 편리함을 맛보면, 이제 컨테이너 없이는 개발할 수 없게 됩니다!

<a name="when-to-use-the-container"></a>
### 컨테이너를 언제 사용해야 하는가

제로 구성 해석 덕분에, 보통은 라우트·컨트롤러·이벤트 리스너 등에서 그냥 타입힌트만 해주면 애플리케이션 곳곳에서 컨테이너를 "직접" 다루지 않고도 의존성 주입을 사용할 수 있습니다. 예를 들어, 현재 요청(Request) 객체를 쉽게 받기 위해 라우트에 `Illuminate\Http\Request`를 타입힌트할 수 있습니다. 아래 코드는 컨테이너를 직접 등장시키지 않지만, 컨테이너가 뒤에서 이 의존성을 관리해줍니다.

```
use Illuminate\Http\Request;

Route::get('/', function (Request $request) {
    // ...
});
```

이처럼 자동 의존성 주입과 [파사드](/docs/8.x/facades)를 이용하면 **직접 바인딩이나 해석을 신경 쓰지 않아도** 라라벨 애플리케이션을 개발하는 일이 가능합니다.  
**그렇다면 언제 직접 컨테이너와 상호작용하는 것이 필요할까요?** 대표적으로 두 가지 상황이 있습니다.

첫 번째는, 어떤 클래스를 특정 인터페이스를 구현하도록 만들고, 그 인터페이스에 타입힌트할 때입니다. 이런 경우에는 반드시 [컨테이너에 이 인터페이스와 구현체를 바인딩](#binding-interfaces-to-implementations)해 주어야 합니다.  
두 번째는, [라라벨 패키지](/docs/8.x/packages)를 작성해 다른 라라벨 개발자와 공유하려는 경우로, 이 경우 패키지의 서비스를 컨테이너에 바인딩해야 할 수 있습니다.

<a name="binding"></a>
## 바인딩

<a name="binding-basics"></a>
### 기본 바인딩

<a name="simple-bindings"></a>
#### 단순 바인딩

대부분의 서비스 컨테이너 바인딩은 [서비스 프로바이더](/docs/8.x/providers) 내에서 등록하게 됩니다. 그래서 아래 예제들 역시 이 문맥을 기준으로 설명합니다.

서비스 프로바이더 내에서는 항상 `$this->app` 프로퍼티를 통해 컨테이너에 접근할 수 있습니다. `bind` 메서드를 사용해 바인딩하려는 클래스나 인터페이스의 이름과, 해당 클래스의 인스턴스를 반환하는 클로저를 등록할 수 있습니다.

```
use App\Services\Transistor;
use App\Services\PodcastParser;

$this->app->bind(Transistor::class, function ($app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

이때, 클로저의 인자로 컨테이너 자신이 전달됩니다. 이를 활용해서 해당 객체의 하위 의존성도 컨테이너를 통해 해석할 수 있습니다.

보통 서비스 프로바이더 내에서 컨테이너와 상호작용하지만, 프로바이더 바깥에서 직접 컨테이너를 사용하고 싶다면 `App` [파사드](/docs/8.x/facades)를 사용할 수 있습니다.

```
use App\Services\Transistor;
use Illuminate\Support\Facades\App;

App::bind(Transistor::class, function ($app) {
    // ...
});
```

> [!TIP]
> 클래스가 어떤 인터페이스에도 의존하지 않는다면 컨테이너에 바인딩할 필요가 없습니다. 컨테이너는 이런 객체는 리플렉션(reflection)으로 자동 해석할 수 있기 때문입니다.

<a name="binding-a-singleton"></a>
#### 싱글턴 바인딩

`singleton` 메서드는 컨테이너에 클래스나 인터페이스를 한 번만 해석해서, 이후에는 같은 인스턴스를 계속 반환하도록 바인딩합니다.

```
use App\Services\Transistor;
use App\Services\PodcastParser;

$this->app->singleton(Transistor::class, function ($app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

<a name="binding-scoped"></a>
#### Scoped 싱글턴 바인딩

`scoped` 메서드는 라라벨의 요청(Request)이나 작업(Job) 수명 주기 동안에만 한 번 해석되어 그 주기 안에서 같은 인스턴스를 재사용하게 만듭니다.  
이 메서드는 `singleton`과 비슷하지만, [Laravel Octane](/docs/8.x/octane) 워커가 새로운 요청을 처리하거나, [queue worker](/docs/8.x/queues)가 새 작업을 처리할 때마다 등록된 인스턴스가 리셋됩니다.

```
use App\Services\Transistor;
use App\Services\PodcastParser;

$this->app->scoped(Transistor::class, function ($app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

<a name="binding-instances"></a>
#### 인스턴스 바인딩

이미 만들어 둔 객체 인스턴스를 컨테이너에 바인딩하고 싶다면 `instance` 메서드를 사용할 수 있습니다. 이 인스턴스는 이후에도 동일하게 반환됩니다.

```
use App\Services\Transistor;
use App\Services\PodcastParser;

$service = new Transistor(new PodcastParser);

$this->app->instance(Transistor::class, $service);
```

<a name="binding-interfaces-to-implementations"></a>
### 인터페이스를 구현체와 바인딩하기

서비스 컨테이너의 강력한 기능 중 하나는, 인터페이스를 특정 구현체와 바인딩할 수 있다는 점입니다.  
예를 들어, `EventPusher`라는 인터페이스와, 이를 구현한 `RedisEventPusher`가 있다고 가정해봅니다. 다음처럼 구현체를 컨테이너에 바인딩할 수 있습니다.

```
use App\Contracts\EventPusher;
use App\Services\RedisEventPusher;

$this->app->bind(EventPusher::class, RedisEventPusher::class);
```

이 설정을 해두면, 컨테이너가 `EventPusher` 타입이 필요할 때마다 실제로는 `RedisEventPusher` 구현체가 주입됩니다. 이제 컨테이너에서 해석되는 모든 클래스(컨트롤러, 이벤트 리스너, 미들웨어 등)의 생성자에 인터페이스 타입힌트를 사용할 수 있습니다.

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
### 컨텍스트별 바인딩

한 프로젝트에서 같은 인터페이스를 사용하는 여러 클래스가, 서로 다른 구현체를 받아야 하는 경우가 있습니다.  
예를 들어, 두 개의 컨트롤러가 `Illuminate\Contracts\Filesystem\Filesystem` [컨트랙트](/docs/8.x/contracts)의 서로 다른 구현체에 의존해야 할 때, 라라벨은 이를 위한 간단하고 직관적인 API를 제공합니다.

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
### 기본값 바인딩

클래스가 의존성 객체 이외에도 정수형 등 단순(primitive) 값을 필요로 할 때도 있습니다.  
컨텍스트별 바인딩을 통해 원하는 값을 주입할 수 있습니다.

```
$this->app->when('App\Http\Controllers\UserController')
          ->needs('$variableName')
          ->give($value);
```

또한, 클래스가 [태그](#tagging)된 여러 인스턴스의 배열을 의존성으로 받을 수도 있습니다. 이때는 `giveTagged` 메서드를 사용해 해당 태그의 모든 바인딩을 한 번에 주입할 수 있습니다.

```
$this->app->when(ReportAggregator::class)
    ->needs('$reports')
    ->giveTagged('reports');
```

설정 파일의 값을 주입하려면 `giveConfig` 메서드를 사용할 수도 있습니다.

```
$this->app->when(ReportAggregator::class)
    ->needs('$timezone')
    ->giveConfig('app.timezone');
```

<a name="binding-typed-variadics"></a>
### 타입 지정 가변 인자 바인딩

간혹 하나의 클래스에서 가변 인자(variadic, ...$args)를 통해 여러 타입 객체 배열을 전달받을 수도 있습니다.

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

이런 의존성을 컨텍스트별 바인딩으로 해석하려면, `give` 메서드에 `Filter` 인스턴스 배열을 반환하는 클로저를 전달하면 됩니다.

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

더 간단하게, 클래스 이름 배열만 지정해도 컨테이너가 자동으로 인스턴스를 만들어 의존성으로 주입합니다.

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

가변 인자 의존성의 타입이 특정 클래스(`Report ...$reports`)일 때, `needs`와 `giveTagged`를 조합해 해당 [태그](#tagging)가 붙은 모든 바인딩을 간편하게 주입할 수 있습니다.

```
$this->app->when(ReportAggregator::class)
    ->needs(Report::class)
    ->giveTagged('reports');
```

<a name="tagging"></a>
### 태깅

특정 "분류"에 해당하는 바인딩들을 한 번에 모두 해석해야 할 때가 있습니다.  
예를 들어, 다양한 `Report` 인터페이스 구현체 배열을 받는 리포트 분석기를 만들 때, 먼저 각 구현체를 등록하고 이후 한꺼번에 태그를 붙일 수 있습니다.

```
$this->app->bind(CpuReport::class, function () {
    //
});

$this->app->bind(MemoryReport::class, function () {
    //
});

$this->app->tag([CpuReport::class, MemoryReport::class], 'reports');
```

이제 태그가 부여된 서비스들을 컨테이너의 `tagged` 메서드로 모두 불러올 수 있습니다.

```
$this->app->bind(ReportAnalyzer::class, function ($app) {
    return new ReportAnalyzer($app->tagged('reports'));
});
```

<a name="extending-bindings"></a>
### 바인딩 확장

`extend` 메서드는 이미 해석된 서비스를 수정하거나 데코레이터 패턴 등으로 감쌀 때 사용합니다.  
이 메서드는 하나의 인자를 받는데, 해당 인자는 서비스와 컨테이너 인스턴스를 매개변수로 받아 바뀐 서비스를 반환해야 합니다.

```
$this->app->extend(Service::class, function ($service, $app) {
    return new DecoratedService($service);
});
```

<a name="resolving"></a>
## 해석(Resolving)

<a name="the-make-method"></a>
### `make` 메서드

`make` 메서드를 사용해 컨테이너에서 클래스 인스턴스를 해석(생성)할 수 있습니다.  
`make`는 해석하려는 클래스나 인터페이스의 이름을 인자로 받습니다.

```
use App\Services\Transistor;

$transistor = $this->app->make(Transistor::class);
```

만약 해석하려는 클래스의 일부 의존성을 컨테이너에서 자동으로 해석할 수 없다면, `makeWith` 메서드로 직접 연관 배열 형태로 전달할 수 있습니다. 예를 들어, `Transistor` 서비스의 생성자에 `$id` 파라미터를 직접 넣어주고 싶다면 아래와 같이 할 수 있습니다.

```
use App\Services\Transistor;

$transistor = $this->app->makeWith(Transistor::class, ['id' => 1]);
```

서비스 프로바이더 바깥, 즉 `$app` 변수를 직접 쓸 수 없는 코드 위치에서는 `App` [파사드](/docs/8.x/facades)를 통해 인스턴스를 해석할 수 있습니다.

```
use App\Services\Transistor;
use Illuminate\Support\Facades\App;

$transistor = App::make(Transistor::class);
```

그리고, 만약 클래스 생성자에서 라라벨 컨테이너 자체를 주입받고 싶다면 `Illuminate\Container\Container` 클래스를 생성자에 타입힌트하면 됩니다.

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
### 자동 주입

또한 도메인 객체의 생성자(예: [컨트롤러](/docs/8.x/controllers), [이벤트 리스너](/docs/8.x/events), [미들웨어](/docs/8.x/middleware) 등)에서 의존성을 타입힌트하면, 대부분의 의존성이 자동으로 주입됩니다. [큐 작업](/docs/8.x/queues)의 `handle` 메서드도 마찬가지입니다. 실제로는 이런 방식으로 대부분의 객체를 컨테이너가 자동으로 해석하도록 구현하는 것이 가장 좋습니다.

예를 들어, 컨트롤러의 생성자에서 저장소(Repository)를 타입힌트로 명시하면, 이 저장소는 자동으로 해석되어 주입됩니다.

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

때로는 객체 인스턴스의 특정 메서드를 호출할 때, 해당 메서드에 필요한 의존성도 자동으로 주입 받으면서 호출하고 싶을 수 있습니다.  
아래와 같은 클래스를 예로 들어보겠습니다.

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

위의 `generate` 메서드를 컨테이너를 통해 호출하려면 아래와 같이 할 수 있습니다.

```
use App\UserReport;
use Illuminate\Support\Facades\App;

$report = App::call([new UserReport, 'generate']);
```

`call` 메서드는 실제로는 어떤 PHP 콜러블(callable)도 받을 수 있습니다.  
또한 다음과 같이, 클로저를 호출할 때도 자동으로 필요한 의존성이 주입됩니다.

```
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\App;

$result = App::call(function (UserRepository $repository) {
    // ...
});
```

<a name="container-events"></a>
## 컨테이너 이벤트

서비스 컨테이너는 객체를 해석(생성)할 때마다 "이벤트"를 발생시킵니다. 이 이벤트는 `resolving` 메서드를 사용해 감지할 수 있습니다.

```
use App\Services\Transistor;

$this->app->resolving(Transistor::class, function ($transistor, $app) {
    // "Transistor" 타입의 객체가 해석될 때마다 호출됩니다...
});

$this->app->resolving(function ($object, $app) {
    // 어떤 타입이든 객체가 해석될 때마다 호출됩니다...
});
```

이벤트 핸들러에는 실제 해석되는 객체 인스턴스가 전달되므로, 객체의 프로퍼티를 추가 설정하거나 꾸미는 등 다양한 후처리를 할 수 있습니다.

<a name="psr-11"></a>
## PSR-11

라라벨의 서비스 컨테이너는 [PSR-11](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-11-container.md) 표준 인터페이스를 구현하고 있습니다. 따라서 PSR-11 컨테이너 인터페이스를 타입힌트하여 라라벨의 컨테이너 인스턴스를 받을 수 있습니다.

```
use App\Services\Transistor;
use Psr\Container\ContainerInterface;

Route::get('/', function (ContainerInterface $container) {
    $service = $container->get(Transistor::class);

    //
});
```

만약 넘긴 식별자(identifier)를 해석할 수 없는 경우, 예외가 발생합니다. 이때 식별자가 한 번도 바인딩된 적이 없다면 `Psr\Container\NotFoundExceptionInterface` 예외가, 식별자는 존재하지만 정상적으로 해석할 수 없을 때는 `Psr\Container\ContainerExceptionInterface` 예외가 발생합니다.
