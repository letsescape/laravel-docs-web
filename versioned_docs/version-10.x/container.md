# 서비스 컨테이너 (Service Container)

- [소개](#introduction)
    - [제로 설정(Zero Configuration) 해석](#zero-configuration-resolution)
    - [컨테이너를 언제 사용해야 하나?](#when-to-use-the-container)
- [바인딩](#binding)
    - [바인딩 기초](#binding-basics)
    - [인터페이스를 구현체에 바인딩하기](#binding-interfaces-to-implementations)
    - [상황별 바인딩](#contextual-binding)
    - [원시값 바인딩](#binding-primitives)
    - [타입이 지정된 가변 인수 바인딩](#binding-typed-variadics)
    - [태그 사용하기](#tagging)
    - [바인딩 확장](#extending-bindings)
- [해결(Resolving)](#resolving)
    - [`make` 메서드](#the-make-method)
    - [자동 주입](#automatic-injection)
- [메서드 호출 및 주입](#method-invocation-and-injection)
- [컨테이너 이벤트](#container-events)
- [PSR-11](#psr-11)

<a name="introduction"></a>
## 소개

라라벨 서비스 컨테이너는 클래스 의존성을 관리하고, 의존성 주입을 수행하는 데 강력한 도구입니다. 여기서 의존성 주입이란, 클래스가 필요로 하는 객체(의존성)를 생성자 또는 경우에 따라 "setter" 메서드를 통해 클래스 내부로 "주입"하는 기법을 의미합니다.

간단한 예제를 살펴보겠습니다.

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Repositories\UserRepository;
use App\Models\User;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * 새로운 컨트롤러 인스턴스를 생성합니다.
     */
    public function __construct(
        protected UserRepository $users,
    ) {}

    /**
     * 주어진 사용자의 프로필을 보여줍니다.
     */
    public function show(string $id): View
    {
        $user = $this->users->find($id);

        return view('user.profile', ['user' => $user]);
    }
}
```

위 예시에서 `UserController`는 데이터 소스에서 사용자 정보를 조회해야 합니다. 이를 위해 사용자 정보를 가져올 수 있는 서비스를 **주입**합니다. 이때 `UserRepository`는 일반적으로 [Eloquent](/docs/10.x/eloquent)를 사용해 데이터베이스에서 사용자 정보를 추출합니다. 하지만 리포지토리를 주입했기 때문에 언제든지 다른 구현체로 쉽게 대체할 수 있습니다. 또한 애플리케이션 테스트 시에는 `UserRepository`의 더미 구현(모의 객체, mock)을 만들어 사용할 수도 있습니다.

라라벨 서비스 컨테이너를 깊이 있게 이해하는 것은 강력하고 대규모의 애플리케이션을 만들 때뿐만 아니라, 라라벨 핵심(코어)에 기여할 때에도 필수적인 지식입니다.

<a name="zero-configuration-resolution"></a>
### 제로 설정(Zero Configuration) 해석

클래스가 의존성 없이 단독으로 존재하거나, 또는 다른 구체 클래스(인터페이스가 아닌)만을 의존할 경우에는, 컨테이너에 해당 클래스를 어떻게 해석해야 할지 별도의 안내가 필요하지 않습니다. 예를 들어, 아래와 같은 코드를 `routes/web.php` 파일에 작성할 수 있습니다.

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

이 예제에서, 애플리케이션의 `/` 라우트를 요청하면 `Service` 클래스가 자동으로 해석되어 라우트 핸들러에 주입됩니다. 이 기능은 개발 방식에 혁신적 변화를 가져옵니다. 즉, 복잡한 설정 파일을 신경 쓸 필요 없이, 의존성 주입의 강점을 즉시 활용할 수 있습니다.

실제로, 라라벨 애플리케이션에서 작성하는 컨트롤러([controllers](/docs/10.x/controllers)), 이벤트 리스너([event listeners](/docs/10.x/events)), 미들웨어([middleware](/docs/10.x/middleware)) 등 대부분의 클래스들은 자동으로 컨테이너를 통해 필요한 의존성을 전달받습니다. 또한 [큐에 등록한 작업](/docs/10.x/queues)의 `handle` 메서드에서도 의존성을 타입힌트로 명확하게 지정할 수 있습니다. 자동이면서도 별도 설정 없는 의존성 주입의 강력함을 한 번 경험하면, 이 기능 없이 개발하기가 어려워질 것입니다.

<a name="when-to-use-the-container"></a>
### 컨테이너를 언제 사용해야 하나?

제로 설정 해석 덕분에, 여러분은 라우트, 컨트롤러, 이벤트 리스너 등 곳곳에 의존성을 타입힌트로 지정하기만 해도, 컨테이너와 직접적으로 상호작용하지 않고도 많은 기능을 쓸 수 있습니다. 예를 들어, 라우트에서 현재 요청 정보를 간편하게 사용하기 위해 `Illuminate\Http\Request` 객체를 타입힌트로 지정할 수 있습니다. 이렇게 작성해도 우리가 직접 컨테이너를 다루는 코드는 없지만, 실제로는 컨테이너가 내부적으로 이러한 의존성의 주입을 처리합니다.

```
use Illuminate\Http\Request;

Route::get('/', function (Request $request) {
    // ...
});
```

실제로, 자동 의존성 주입과 [파사드](/docs/10.x/facades)의 조합 덕분에, 라라벨 애플리케이션을 개발하면서 **직접** 컨테이너에서 바인딩하거나 해석(resolving)하지 않고도 대부분의 요구를 충족할 수 있습니다. **그렇다면 언제 직접 컨테이너에 접근해야 할까요?** 대표적으로 두 가지 상황을 살펴보겠습니다.

첫 번째는, 어떤 클래스가 인터페이스를 구현하고 있고, 해당 인터페이스를 라우트나 생성자에서 타입힌트로 사용하고 싶을 때입니다. 이 경우에는 [인터페이스를 구현체에 바인딩하는 방법](#binding-interfaces-to-implementations)을 컨테이너에 명시해야 합니다. 두 번째는, [라라벨 패키지](/docs/10.x/packages)를 작성하여 다른 개발자와 공유하고자 할 때입니다. 이럴 때는 패키지에서 제공하는 서비스들을 컨테이너에 바인딩해 주어야 합니다.

<a name="binding"></a>
## 바인딩

<a name="binding-basics"></a>
### 바인딩 기초

<a name="simple-bindings"></a>
#### 단순 바인딩

대부분의 서비스 컨테이너 바인딩은 [서비스 프로바이더](/docs/10.x/providers) 내부에 등록됩니다. 아래의 예제들도 이러한 컨텍스트(서비스 프로바이더)에서 컨테이너를 사용하는 방법을 보여줍니다.

서비스 프로바이더 내부에서, 언제든 `$this->app` 속성을 통해 컨테이너에 접근할 수 있습니다. 바인딩을 등록하려면, `bind` 메서드를 사용해 등록할 클래스나 인터페이스 이름과 해당 클래스의 인스턴스를 반환하는 클로저를 전달하면 됩니다.

```
use App\Services\Transistor;
use App\Services\PodcastParser;
use Illuminate\Contracts\Foundation\Application;

$this->app->bind(Transistor::class, function (Application $app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

여기서 주의할 점은, 위의 클로저에서 컨테이너 자신을 인자(`$app`)로 받아온다는 점입니다. 이를 통해 우리가 만들 객체의 하위 의존성도 컨테이너를 사용해 해석할 수 있습니다.

앞서 말했듯, 일반적으로 서비스 프로바이더 내부에서 컨테이너를 다루게 되지만, 서비스 프로바이더 외부에서도 컨테이너와 상호작용하고 싶다면 `App` [파사드](/docs/10.x/facades)를 사용할 수 있습니다.

```
use App\Services\Transistor;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\Facades\App;

App::bind(Transistor::class, function (Application $app) {
    // ...
});
```

이미 동일한 타입에 대한 바인딩이 없다면, `bindIf` 메서드를 사용하여 조건부로 바인딩할 수도 있습니다.

```php
$this->app->bindIf(Transistor::class, function (Application $app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

> [!NOTE]
> 어떤 클래스가 인터페이스에 의존하지 않는다면, 컨테이너에 별도 바인딩을 등록할 필요가 없습니다. 컨테이너는 반사(reflection)를 이용해 이런 객체는 자동으로 해석할 수 있기 때문입니다.

<a name="binding-a-singleton"></a>
#### 싱글톤 바인딩

`singleton` 메서드는 하나의 클래스나 인터페이스를 컨테이너에 **단 한 번만** 해석하여 바인딩하는 방법입니다. 싱글톤 바인딩이 한 번 해석되면, 이후에는 언제나 동일한 객체 인스턴스를 반환합니다.

```
use App\Services\Transistor;
use App\Services\PodcastParser;
use Illuminate\Contracts\Foundation\Application;

$this->app->singleton(Transistor::class, function (Application $app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

이미 바인딩이 존재하지 않을 때만 싱글톤 바인딩을 등록하려면 `singletonIf` 메서드를 사용할 수 있습니다.

```php
$this->app->singletonIf(Transistor::class, function (Application $app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

<a name="binding-scoped"></a>
#### 범위 지정 싱글톤 바인딩

`scoped` 메서드는 주어진 라라벨 요청 또는 작업(job) 라이프사이클 내에서 **한 번만** 해석되어야 하는 클래스나 인터페이스를 바인딩합니다. 이 방식은 `singleton`과 매우 비슷하지만, `scoped`로 등록한 인스턴스는 새로운 "라이프사이클"이 시작될 때마다(예: [Laravel Octane](/docs/10.x/octane) 워커가 새로운 요청을 처리하거나, [큐 워커](/docs/10.x/queues)가 새 작업을 처리할 때) 초기화됩니다.

```
use App\Services\Transistor;
use App\Services\PodcastParser;
use Illuminate\Contracts\Foundation\Application;

$this->app->scoped(Transistor::class, function (Application $app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

<a name="binding-instances"></a>
#### 인스턴스 바인딩

기존에 생성해 둔 객체 인스턴스를 컨테이너에 등록하고 싶다면 `instance` 메서드를 사용할 수 있습니다. 이렇게 등록된 인스턴스는 이후 컨테이너에서 항상 동일한 객체가 반환됩니다.

```
use App\Services\Transistor;
use App\Services\PodcastParser;

$service = new Transistor(new PodcastParser);

$this->app->instance(Transistor::class, $service);
```

<a name="binding-interfaces-to-implementations"></a>
### 인터페이스를 구현체에 바인딩하기

서비스 컨테이너의 가장 강력한 기능 중 하나는, 특정 인터페이스를 원하는 구현체에 바인딩할 수 있다는 점입니다. 예를 들어, `EventPusher`라는 인터페이스와 이를 구현한 `RedisEventPusher` 클래스가 있다고 가정해 봅시다. 구현체를 준비했다면, 컨테이너에 다음과 같이 등록할 수 있습니다.

```
use App\Contracts\EventPusher;
use App\Services\RedisEventPusher;

$this->app->bind(EventPusher::class, RedisEventPusher::class);
```

이 코드는 컨테이너에게 `EventPusher` 인터페이스가 필요할 때마다 `RedisEventPusher`를 주입하라고 알려줍니다. 이제 컨테이너가 해석하는 클래스의 생성자에 `EventPusher` 인터페이스를 타입힌트로 명시하면 됩니다. 앞서 언급한 대로, 컨트롤러, 이벤트 리스너, 미들웨어 등 라라벨 안에서 다양한 클래스들이 컨테이너를 통해 생성됩니다.

```
use App\Contracts\EventPusher;

/**
 * 새로운 클래스 인스턴스를 생성합니다.
 */
public function __construct(
    protected EventPusher $pusher
) {}
```

<a name="contextual-binding"></a>
### 상황별 바인딩

두 개 이상의 클래스가 동일한 인터페이스를 사용하지만, 각각 다른 구현체를 주입하고 싶을 때가 있습니다. 예를 들어, 두 컨트롤러가 `Illuminate\Contracts\Filesystem\Filesystem` [컨트랙트](/docs/10.x/contracts)에 의존하지만, 각기 다른 파일 시스템 드라이버(예: local vs s3)를 쓰고 싶을 수 있습니다. 라라벨에서는 이를 위한 간단한 유창한(fluid) 인터페이스를 제공합니다.

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
### 원시값 바인딩

클래스가 몇몇은 클래스(객체), 몇몇은 정수와 같은 원시값을 주입받아야 할 때가 있습니다. 이 경우에도 상황별 바인딩을 이용해 필요한 값을 주입할 수 있습니다.

```
use App\Http\Controllers\UserController;

$this->app->when(UserController::class)
          ->needs('$variableName')
          ->give($value);
```

때로는 클래스가 [태그](#tagging)된 인스턴스의 배열을 필요로 할 수도 있습니다. `giveTagged` 메서드를 사용하면 해당 태그로 바인딩된 모든 인스턴스를 쉽게 주입할 수 있습니다.

```
$this->app->when(ReportAggregator::class)
    ->needs('$reports')
    ->giveTagged('reports');
```

애플리케이션의 설정 파일 값이 필요하다면 `giveConfig` 메서드를 사용할 수 있습니다.

```
$this->app->when(ReportAggregator::class)
    ->needs('$timezone')
    ->giveConfig('app.timezone');
```

<a name="binding-typed-variadics"></a>
### 타입이 지정된 가변 인수 바인딩

때로는 생성자에서 동일한 타입의 객체를 여러 개(가변 인수) 받아야 할 때가 있습니다.

```
<?php

use App\Models\Filter;
use App\Services\Logger;

class Firewall
{
    /**
     * 필터 인스턴스 목록.
     *
     * @var array
     */
    protected $filters;

    /**
     * 새로운 클래스 인스턴스를 생성합니다.
     */
    public function __construct(
        protected Logger $logger,
        Filter ...$filters,
    ) {
        $this->filters = $filters;
    }
}
```

상황별 바인딩을 사용하면 클로저가 여러 `Filter` 인스턴스를 반환하도록 하여 의존성을 해석할 수 있습니다.

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

좀 더 간편하게, 클래스명 배열로 지정하면 해당하는 클래스가 필요할 때마다 컨테이너가 해석해 주입합니다.

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
#### 가변 태그 의존성

클래스가 가변 인수 형태로 특정 클래스 타입(예: `Report ...$reports`)의 객체를 필요로 할 때, `needs`와 `giveTagged` 메서드를 조합하면 해당 [태그](#tagging)로 등록된 모든 인스턴스를 한번에 주입할 수 있습니다.

```
$this->app->when(ReportAggregator::class)
    ->needs(Report::class)
    ->giveTagged('reports');
```

<a name="tagging"></a>
### 태그 사용하기

때때로 특정 "범주"에 속하는 모든 바인딩을 한 번에 해석해야 할 때가 있습니다. 예를 들어, 다양한 `Report` 인터페이스 구현체를 배열로 받아서 동작하는 보고서 분석기를 만든다고 가정합시다. 먼저 여러 개의 `Report` 구현체를 바인딩한 뒤, 다음과 같이 각각에 태그를 지정할 수 있습니다.

```
$this->app->bind(CpuReport::class, function () {
    // ...
});

$this->app->bind(MemoryReport::class, function () {
    // ...
});

$this->app->tag([CpuReport::class, MemoryReport::class], 'reports');
```

이렇게 태그가 지정된 서비스들은 컨테이너의 `tagged` 메서드를 이용해 한 번에 모두 해석할 수 있습니다.

```
$this->app->bind(ReportAnalyzer::class, function (Application $app) {
    return new ReportAnalyzer($app->tagged('reports'));
});
```

<a name="extending-bindings"></a>
### 바인딩 확장

`extend` 메서드를 사용하면, 이미 해석된 서비스를 수정(데코레이션, 설정 등)할 수 있습니다. 서비스가 해석되는 시점에 추가적인 코드를 실행하고 싶을 때 사용합니다. `extend`는 두 개의 인자를 받는데, 첫 번째는 확장할 서비스 클래스, 두 번째는 수정된 서비스를 반환하는 클로저입니다. 이 클로저에는 현재 해석 중인 서비스와 컨테이너 인스턴스가 전달됩니다.

```
$this->app->extend(Service::class, function (Service $service, Application $app) {
    return new DecoratedService($service);
});
```

<a name="resolving"></a>
## 해결(Resolving)

<a name="the-make-method"></a>
### `make` 메서드

컨테이너에서 클래스를 해석(인스턴스 생성)하려면 `make` 메서드를 사용할 수 있습니다. 이 메서드는 해석하려는 클래스나 인터페이스의 이름을 인수로 받습니다.

```
use App\Services\Transistor;

$transistor = $this->app->make(Transistor::class);
```

클래스 의존성 중 일부가 컨테이너에서 자동으로 해석될 수 없는 경우, `makeWith` 메서드로 연관 배열 형태로 직접 값을 전달할 수 있습니다. 아래는 `Transistor` 서비스의 생성자에 필요한 `$id` 값을 직접 지정하는 예시입니다.

```
use App\Services\Transistor;

$transistor = $this->app->makeWith(Transistor::class, ['id' => 1]);
```

`bound` 메서드를 사용하면 컨테이너에 해당 클래스나 인터페이스가 명시적으로 바인딩되어 있는지 확인할 수 있습니다.

```
if ($this->app->bound(Transistor::class)) {
    // ...
}
```

서비스 프로바이더 외부, 즉 `$app` 변수에 접근할 수 없는 위치에서 컨테이너를 이용하고 싶다면, `App` [파사드](/docs/10.x/facades)나 `app` [헬퍼 함수](/docs/10.x/helpers#method-app)를 사용할 수 있습니다.

```
use App\Services\Transistor;
use Illuminate\Support\Facades\App;

$transistor = App::make(Transistor::class);

$transistor = app(Transistor::class);
```

컨테이너 자체(라라벨 컨테이너 인스턴스)를 다른 클래스에 주입하고 싶다면, 생성자에서 `Illuminate\Container\Container` 클래스를 타입힌트로 지정하면 됩니다.

```
use Illuminate\Container\Container;

/**
 * 새로운 클래스 인스턴스를 생성합니다.
 */
public function __construct(
    protected Container $container
) {}
```

<a name="automatic-injection"></a>
### 자동 주입

또는, 더 중요한 것은 컨테이너가 해석하는 클래스의 생성자에 필요한 의존성을 바로 타입힌트로 지정하는 것입니다. 이는 [컨트롤러](/docs/10.x/controllers), [이벤트 리스너](/docs/10.x/events), [미들웨어](/docs/10.x/middleware) 등 거의 모든 객체에서 사용할 수 있습니다. 또한 [큐 작업](/docs/10.x/queues)의 `handle` 메서드에서도 의존성을 타입힌트로 받을 수 있습니다. 실제로, 여러분이 정의하는 대부분의 객체는 이렇게 자동으로 컨테이너에 의해 해석되어야 합니다.

예를 들어, 컨트롤러의 생성자에서 애플리케이션이 정의한 리포지토리를 타입힌트로 지정하면, 저장소 객체가 자동으로 해석되어 주입됩니다.

```
<?php

namespace App\Http\Controllers;

use App\Repositories\UserRepository;
use App\Models\User;

class UserController extends Controller
{
    /**
     * 새로운 컨트롤러 인스턴스를 생성합니다.
     */
    public function __construct(
        protected UserRepository $users,
    ) {}

    /**
     * 주어진 ID의 사용자를 반환합니다.
     */
    public function show(string $id): User
    {
        $user = $this->users->findOrFail($id);

        return $user;
    }
}
```

<a name="method-invocation-and-injection"></a>
## 메서드 호출 및 주입

때로는 객체 인스턴스의 메서드를 호출할 때, 해당 메서드에 필요한 의존성을 컨테이너가 자동으로 주입해주길 원할 수 있습니다. 예를 들어, 다음과 같은 클래스를 보겠습니다.

```
<?php

namespace App;

use App\Repositories\UserRepository;

class UserReport
{
    /**
     * 새로운 사용자 보고서를 생성합니다.
     */
    public function generate(UserRepository $repository): array
    {
        return [
            // ...
        ];
    }
}
```

컨테이너를 통해 `generate` 메서드를 다음과 같이 호출할 수 있습니다.

```
use App\UserReport;
use Illuminate\Support\Facades\App;

$report = App::call([new UserReport, 'generate']);
```

`call` 메서드는 PHP에서 사용할 수 있는 어떤 콜러블(callable)도 받을 수 있습니다. 컨테이너의 `call` 메서드를 사용하면, 클로저를 호출하면서도 컨테이너가 자동으로 의존성을 주입하게 할 수 있습니다.

```
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\App;

$result = App::call(function (UserRepository $repository) {
    // ...
});
```

<a name="container-events"></a>
## 컨테이너 이벤트

서비스 컨테이너는 객체를 해석할 때마다 이벤트를 발생시킵니다. 이 이벤트는 `resolving` 메서드를 사용해 감지할 수 있습니다.

```
use App\Services\Transistor;
use Illuminate\Contracts\Foundation\Application;

$this->app->resolving(Transistor::class, function (Transistor $transistor, Application $app) {
    // "Transistor" 타입의 객체가 해석될 때 호출됩니다...
});

$this->app->resolving(function (mixed $object, Application $app) {
    // 어떤 타입이든 객체가 해석될 때 호출됩니다...
});
```

이처럼, 해석된 객체가 콜백에 전달되기 때문에, 해당 객체에 추가적인 속성을 지정한 후 실제로 소비(사용)되기 전에 설정을 더 해줄 수 있습니다.

<a name="psr-11"></a>
## PSR-11

라라벨의 서비스 컨테이너는 [PSR-11](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-11-container.md) 인터페이스를 구현합니다. 따라서 PSR-11 컨테이너 인터페이스를 타입힌트로 지정해 라라벨 컨테이너 인스턴스를 얻을 수 있습니다.

```
use App\Services\Transistor;
use Psr\Container\ContainerInterface;

Route::get('/', function (ContainerInterface $container) {
    $service = $container->get(Transistor::class);

    // ...
});
```

해당 식별자를 해석할 수 없을 때는 예외가 던져집니다. 만약 식별자가 한 번도 바인딩된 적이 없다면, 예외는 `Psr\Container\NotFoundExceptionInterface`의 인스턴스가 됩니다. 한 번은 바인딩됐지만 해석할 수 없는 경우엔 `Psr\Container\ContainerExceptionInterface` 예외가 던져집니다.
