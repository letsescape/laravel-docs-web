# 컨트랙트 (Contracts)

- [소개](#introduction)
    - [컨트랙트와 파사드 비교](#contracts-vs-facades)
- [컨트랙트를 사용해야 할 때](#when-to-use-contracts)
- [컨트랙트 사용 방법](#how-to-use-contracts)
- [컨트랙트 레퍼런스](#contract-reference)

<a name="introduction"></a>
## 소개

라라벨의 "컨트랙트(contract)"는 프레임워크가 제공하는 핵심 서비스들의 동작을 정의한 일련의 인터페이스입니다. 예를 들어, `Illuminate\Contracts\Queue\Queue` 컨트랙트는 작업(Job) 큐잉에 필요한 메서드를 정의하고, `Illuminate\Contracts\Mail\Mailer` 컨트랙트는 이메일을 발송하는 데 필요한 메서드를 정의합니다.

각 컨트랙트마다 라라벨에서 직접 제공하는 구현체가 존재합니다. 예를 들어, 라라벨은 다양한 드라이버를 지원하는 큐 시스템과 [SwiftMailer](https://swiftmailer.symfony.com/)를 기반으로 하는 메일 구현체를 제공합니다.

라라벨의 모든 컨트랙트는 [전용 GitHub 저장소](https://github.com/illuminate/contracts)에 별도로 관리됩니다. 이 저장소를 통해 제공하는 모든 컨트랙트를 한눈에 참고할 수 있으며, 라라벨 서비스와 연동하는 패키지를 개발할 때 독립적으로 사용할 수 있는 분리된 패키지로 활용할 수 있습니다.

<a name="contracts-vs-facades"></a>
### 컨트랙트와 파사드 비교

라라벨의 [파사드](/docs/8.x/facades)와 헬퍼 함수들은 라라벨의 서비스를 쉽게 사용할 수 있도록 해 줍니다. 즉, 서비스 컨테이너에서 컨트랙트를 직접 타입 힌트하거나 resolve(해결)하지 않아도 된다는 장점이 있습니다. 대부분의 경우, 각 파사드는 해당하는 컨트랙트가 존재합니다.

파사드는 클래스를 정의할 때 생성자에 별도의 의존성을 주입하지 않고도 사용할 수 있는 반면, 컨트랙트를 사용하면 클래스에 명확하게 의존성을 선언할 수 있습니다. 일부 개발자들은 이런 방식으로 의존성을 명확하게 드러내는 것을 선호해 컨트랙트를 사용하고, 다른 개발자들은 파사드의 간편함을 선호하기도 합니다. **일반적으로 대부분의 애플리케이션은 개발 과정에서 파사드를 문제 없이 사용할 수 있습니다.**

<a name="when-to-use-contracts"></a>
## 컨트랙트를 사용해야 할 때

컨트랙트와 파사드 중 어떤 것을 사용할지는 개발자 개개인 또는 개발팀의 취향에 따라 달라질 수 있습니다. 두 방법 모두로 강력하고 테스트 가능한 라라벨 애플리케이션을 만들 수 있습니다. 그리고 컨트랙트와 파사드는 상호 배타적인 관계가 아니므로, 애플리케이션의 일부는 파사드를, 또 다른 일부는 컨트랙트에 의존하게 할 수 있습니다. 클래스의 역할과 책임만 명확하게 유지한다면, 컨트랙트와 파사드 중 무엇을 사용하든 실제로 큰 차이를 느끼기 어렵습니다.

일반적으로 대부분의 애플리케이션은 개발 중에 파사드를 사용하는 것이 무리 없이 가능합니다. 다만, 여러 PHP 프레임워크와 연동되는 패키지를 개발할 경우에는 `illuminate/contracts` 패키지 하나만 의존성에 추가해 라라벨 서비스와의 연동 부분만 컨트랙트로 명세하는 것이 좋습니다. 이렇게 하면, 패키지의 `composer.json` 파일에 라라벨의 구체적인 구현체까지 꼭 추가하지 않아도 됩니다.

<a name="how-to-use-contracts"></a>
## 컨트랙트 사용 방법

그렇다면, 컨트랙트의 구현체는 어떻게 가져올 수 있을까요? 실제로는 매우 간단합니다.

라라벨의 다양한 클래스(컨트롤러, 이벤트 리스너, 미들웨어, 큐 작업, 라우트 클로저 등)는 모두 [서비스 컨테이너](/docs/8.x/container)를 통해 resolve(해결)됩니다. 따라서 컨트랙트의 구현체를 사용하려면, 해당 클래스의 생성자에서 해당 인터페이스를 타입 힌트(명시적으로 작성)하면 됩니다.

예를 들어, 아래 이벤트 리스너 예시를 살펴보세요.

```
<?php

namespace App\Listeners;

use App\Events\OrderWasPlaced;
use App\Models\User;
use Illuminate\Contracts\Redis\Factory;

class CacheOrderInformation
{
    /**
     * The Redis factory implementation.
     *
     * @var \Illuminate\Contracts\Redis\Factory
     */
    protected $redis;

    /**
     * Create a new event handler instance.
     *
     * @param  \Illuminate\Contracts\Redis\Factory  $redis
     * @return void
     */
    public function __construct(Factory $redis)
    {
        $this->redis = $redis;
    }

    /**
     * Handle the event.
     *
     * @param  \App\Events\OrderWasPlaced  $event
     * @return void
     */
    public function handle(OrderWasPlaced $event)
    {
        //
    }
}
```

이벤트 리스너가 resolve(해결)될 때, 서비스 컨테이너가 클래스 생성자의 타입 힌트를 자동으로 읽어들여 적절한 값(여기서는 Redis 팩토리 구현 객체)을 주입해 줍니다. 서비스 컨테이너에 리소스를 등록하는 자세한 방법은 [컨테이너 문서](/docs/8.x/container)를 참고하세요.

<a name="contract-reference"></a>
## 컨트랙트 레퍼런스

아래 표는 라라벨에서 제공하는 모든 컨트랙트와, 각 컨트랙트와 대응되는 파사드(facade)를 빠르게 참고할 수 있도록 정리한 것입니다.

Contract  |  대응되는 파사드(Facade)
------------- | -------------
[Illuminate\Contracts\Auth\Access\Authorizable](https://github.com/illuminate/contracts/blob/8.x/Auth/Access/Authorizable.php) | &nbsp;
[Illuminate\Contracts\Auth\Access\Gate](https://github.com/illuminate/contracts/blob/8.x/Auth/Access/Gate.php) | `Gate`
[Illuminate\Contracts\Auth\Authenticatable](https://github.com/illuminate/contracts/blob/8.x/Auth/Authenticatable.php) | &nbsp;
[Illuminate\Contracts\Auth\CanResetPassword](https://github.com/illuminate/contracts/blob/8.x/Auth/CanResetPassword.php) | &nbsp;
[Illuminate\Contracts\Auth\Factory](https://github.com/illuminate/contracts/blob/8.x/Auth/Factory.php) | `Auth`
[Illuminate\Contracts\Auth\Guard](https://github.com/illuminate/contracts/blob/8.x/Auth/Guard.php) | `Auth::guard()`
[Illuminate\Contracts\Auth\PasswordBroker](https://github.com/illuminate/contracts/blob/8.x/Auth/PasswordBroker.php) | `Password::broker()`
[Illuminate\Contracts\Auth\PasswordBrokerFactory](https://github.com/illuminate/contracts/blob/8.x/Auth/PasswordBrokerFactory.php) | `Password`
[Illuminate\Contracts\Auth\StatefulGuard](https://github.com/illuminate/contracts/blob/8.x/Auth/StatefulGuard.php) | &nbsp;
[Illuminate\Contracts\Auth\SupportsBasicAuth](https://github.com/illuminate/contracts/blob/8.x/Auth/SupportsBasicAuth.php) | &nbsp;
[Illuminate\Contracts\Auth\UserProvider](https://github.com/illuminate/contracts/blob/8.x/Auth/UserProvider.php) | &nbsp;
[Illuminate\Contracts\Bus\Dispatcher](https://github.com/illuminate/contracts/blob/8.x/Bus/Dispatcher.php) | `Bus`
[Illuminate\Contracts\Bus\QueueingDispatcher](https://github.com/illuminate/contracts/blob/8.x/Bus/QueueingDispatcher.php) | `Bus::dispatchToQueue()`
[Illuminate\Contracts\Broadcasting\Factory](https://github.com/illuminate/contracts/blob/8.x/Broadcasting/Factory.php) | `Broadcast`
[Illuminate\Contracts\Broadcasting\Broadcaster](https://github.com/illuminate/contracts/blob/8.x/Broadcasting/Broadcaster.php)  | `Broadcast::connection()`
[Illuminate\Contracts\Broadcasting\ShouldBroadcast](https://github.com/illuminate/contracts/blob/8.x/Broadcasting/ShouldBroadcast.php) | &nbsp;
[Illuminate\Contracts\Broadcasting\ShouldBroadcastNow](https://github.com/illuminate/contracts/blob/8.x/Broadcasting/ShouldBroadcastNow.php) | &nbsp;
[Illuminate\Contracts\Cache\Factory](https://github.com/illuminate/contracts/blob/8.x/Cache/Factory.php) | `Cache`
[Illuminate\Contracts\Cache\Lock](https://github.com/illuminate/contracts/blob/8.x/Cache/Lock.php) | &nbsp;
[Illuminate\Contracts\Cache\LockProvider](https://github.com/illuminate/contracts/blob/8.x/Cache/LockProvider.php) | &nbsp;
[Illuminate\Contracts\Cache\Repository](https://github.com/illuminate/contracts/blob/8.x/Cache/Repository.php) | `Cache::driver()`
[Illuminate\Contracts\Cache\Store](https://github.com/illuminate/contracts/blob/8.x/Cache/Store.php) | &nbsp;
[Illuminate\Contracts\Config\Repository](https://github.com/illuminate/contracts/blob/8.x/Config/Repository.php) | `Config`
[Illuminate\Contracts\Console\Application](https://github.com/illuminate/contracts/blob/8.x/Console/Application.php) | &nbsp;
[Illuminate\Contracts\Console\Kernel](https://github.com/illuminate/contracts/blob/8.x/Console/Kernel.php) | `Artisan`
[Illuminate\Contracts\Container\Container](https://github.com/illuminate/contracts/blob/8.x/Container/Container.php) | `App`
[Illuminate\Contracts\Cookie\Factory](https://github.com/illuminate/contracts/blob/8.x/Cookie/Factory.php) | `Cookie`
[Illuminate\Contracts\Cookie\QueueingFactory](https://github.com/illuminate/contracts/blob/8.x/Cookie/QueueingFactory.php) | `Cookie::queue()`
[Illuminate\Contracts\Database\ModelIdentifier](https://github.com/illuminate/contracts/blob/8.x/Database/ModelIdentifier.php) | &nbsp;
[Illuminate\Contracts\Debug\ExceptionHandler](https://github.com/illuminate/contracts/blob/8.x/Debug/ExceptionHandler.php) | &nbsp;
[Illuminate\Contracts\Encryption\Encrypter](https://github.com/illuminate/contracts/blob/8.x/Encryption/Encrypter.php) | `Crypt`
[Illuminate\Contracts\Events\Dispatcher](https://github.com/illuminate/contracts/blob/8.x/Events/Dispatcher.php) | `Event`
[Illuminate\Contracts\Filesystem\Cloud](https://github.com/illuminate/contracts/blob/8.x/Filesystem/Cloud.php) | `Storage::cloud()`
[Illuminate\Contracts\Filesystem\Factory](https://github.com/illuminate/contracts/blob/8.x/Filesystem/Factory.php) | `Storage`
[Illuminate\Contracts\Filesystem\Filesystem](https://github.com/illuminate/contracts/blob/8.x/Filesystem/Filesystem.php) | `Storage::disk()`
[Illuminate\Contracts\Foundation\Application](https://github.com/illuminate/contracts/blob/8.x/Foundation/Application.php) | `App`
[Illuminate\Contracts\Hashing\Hasher](https://github.com/illuminate/contracts/blob/8.x/Hashing/Hasher.php) | `Hash`
[Illuminate\Contracts\Http\Kernel](https://github.com/illuminate/contracts/blob/8.x/Http/Kernel.php) | &nbsp;
[Illuminate\Contracts\Mail\MailQueue](https://github.com/illuminate/contracts/blob/8.x/Mail/MailQueue.php) | `Mail::queue()`
[Illuminate\Contracts\Mail\Mailable](https://github.com/illuminate/contracts/blob/8.x/Mail/Mailable.php) | &nbsp;
[Illuminate\Contracts\Mail\Mailer](https://github.com/illuminate/contracts/blob/8.x/Mail/Mailer.php) | `Mail`
[Illuminate\Contracts\Notifications\Dispatcher](https://github.com/illuminate/contracts/blob/8.x/Notifications/Dispatcher.php) | `Notification`
[Illuminate\Contracts\Notifications\Factory](https://github.com/illuminate/contracts/blob/8.x/Notifications/Factory.php) | `Notification`
[Illuminate\Contracts\Pagination\LengthAwarePaginator](https://github.com/illuminate/contracts/blob/8.x/Pagination/LengthAwarePaginator.php) | &nbsp;
[Illuminate\Contracts\Pagination\Paginator](https://github.com/illuminate/contracts/blob/8.x/Pagination/Paginator.php) | &nbsp;
[Illuminate\Contracts\Pipeline\Hub](https://github.com/illuminate/contracts/blob/8.x/Pipeline/Hub.php) | &nbsp;
[Illuminate\Contracts\Pipeline\Pipeline](https://github.com/illuminate/contracts/blob/8.x/Pipeline/Pipeline.php) | &nbsp;
[Illuminate\Contracts\Queue\EntityResolver](https://github.com/illuminate/contracts/blob/8.x/Queue/EntityResolver.php) | &nbsp;
[Illuminate\Contracts\Queue\Factory](https://github.com/illuminate/contracts/blob/8.x/Queue/Factory.php) | `Queue`
[Illuminate\Contracts\Queue\Job](https://github.com/illuminate/contracts/blob/8.x/Queue/Job.php) | &nbsp;
[Illuminate\Contracts\Queue\Monitor](https://github.com/illuminate/contracts/blob/8.x/Queue/Monitor.php) | `Queue`
[Illuminate\Contracts\Queue\Queue](https://github.com/illuminate/contracts/blob/8.x/Queue/Queue.php) | `Queue::connection()`
[Illuminate\Contracts\Queue\QueueableCollection](https://github.com/illuminate/contracts/blob/8.x/Queue/QueueableCollection.php) | &nbsp;
[Illuminate\Contracts\Queue\QueueableEntity](https://github.com/illuminate/contracts/blob/8.x/Queue/QueueableEntity.php) | &nbsp;
[Illuminate\Contracts\Queue\ShouldQueue](https://github.com/illuminate/contracts/blob/8.x/Queue/ShouldQueue.php) | &nbsp;
[Illuminate\Contracts\Redis\Factory](https://github.com/illuminate/contracts/blob/8.x/Redis/Factory.php) | `Redis`
[Illuminate\Contracts\Routing\BindingRegistrar](https://github.com/illuminate/contracts/blob/8.x/Routing/BindingRegistrar.php) | `Route`
[Illuminate\Contracts\Routing\Registrar](https://github.com/illuminate/contracts/blob/8.x/Routing/Registrar.php) | `Route`
[Illuminate\Contracts\Routing\ResponseFactory](https://github.com/illuminate/contracts/blob/8.x/Routing/ResponseFactory.php) | `Response`
[Illuminate\Contracts\Routing\UrlGenerator](https://github.com/illuminate/contracts/blob/8.x/Routing/UrlGenerator.php) | `URL`
[Illuminate\Contracts\Routing\UrlRoutable](https://github.com/illuminate/contracts/blob/8.x/Routing/UrlRoutable.php) | &nbsp;
[Illuminate\Contracts\Session\Session](https://github.com/illuminate/contracts/blob/8.x/Session/Session.php) | `Session::driver()`
[Illuminate\Contracts\Support\Arrayable](https://github.com/illuminate/contracts/blob/8.x/Support/Arrayable.php) | &nbsp;
[Illuminate\Contracts\Support\Htmlable](https://github.com/illuminate/contracts/blob/8.x/Support/Htmlable.php) | &nbsp;
[Illuminate\Contracts\Support\Jsonable](https://github.com/illuminate/contracts/blob/8.x/Support/Jsonable.php) | &nbsp;
[Illuminate\Contracts\Support\MessageBag](https://github.com/illuminate/contracts/blob/8.x/Support/MessageBag.php) | &nbsp;
[Illuminate\Contracts\Support\MessageProvider](https://github.com/illuminate/contracts/blob/8.x/Support/MessageProvider.php) | &nbsp;
[Illuminate\Contracts\Support\Renderable](https://github.com/illuminate/contracts/blob/8.x/Support/Renderable.php) | &nbsp;
[Illuminate\Contracts\Support\Responsable](https://github.com/illuminate/contracts/blob/8.x/Support/Responsable.php) | &nbsp;
[Illuminate\Contracts\Translation\Loader](https://github.com/illuminate/contracts/blob/8.x/Translation/Loader.php) | &nbsp;
[Illuminate\Contracts\Translation\Translator](https://github.com/illuminate/contracts/blob/8.x/Translation/Translator.php) | `Lang`
[Illuminate\Contracts\Validation\Factory](https://github.com/illuminate/contracts/blob/8.x/Validation/Factory.php) | `Validator`
[Illuminate\Contracts\Validation\ImplicitRule](https://github.com/illuminate/contracts/blob/8.x/Validation/ImplicitRule.php) | &nbsp;
[Illuminate\Contracts\Validation\Rule](https://github.com/illuminate/contracts/blob/8.x/Validation/Rule.php) | &nbsp;
[Illuminate\Contracts\Validation\ValidatesWhenResolved](https://github.com/illuminate/contracts/blob/8.x/Validation/ValidatesWhenResolved.php) | &nbsp;
[Illuminate\Contracts\Validation\Validator](https://github.com/illuminate/contracts/blob/8.x/Validation/Validator.php) | `Validator::make()`
[Illuminate\Contracts\View\Engine](https://github.com/illuminate/contracts/blob/8.x/View/Engine.php) | &nbsp;
[Illuminate\Contracts\View\Factory](https://github.com/illuminate/contracts/blob/8.x/View/Factory.php) | `View`
[Illuminate\Contracts\View\View](https://github.com/illuminate/contracts/blob/8.x/View/View.php) | `View::make()`