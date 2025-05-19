# 컨트랙트 (Contracts)

- [소개](#introduction)
    - [컨트랙트와 파사드의 차이](#contracts-vs-facades)
- [컨트랙트를 언제 사용해야 할까요?](#when-to-use-contracts)
- [컨트랙트 사용 방법](#how-to-use-contracts)
- [컨트랙트 참고표](#contract-reference)

<a name="introduction"></a>
## 소개

라라벨의 "컨트랙트(contracts)"는 프레임워크가 제공하는 핵심 서비스의 동작을 명확히 정의한 일련의 인터페이스 집합입니다. 예를 들어, `Illuminate\Contracts\Queue\Queue` 컨트랙트는 작업 큐잉 시스템에 필요한 메서드를 정의하고, `Illuminate\Contracts\Mail\Mailer` 컨트랙트는 이메일 전송에 필요한 메서드를 명시합니다.

각 컨트랙트는 라라벨 프레임워크에서 그에 상응하는 구체 구현을 제공합니다. 예를 들어, 라라벨은 다양한 드라이버를 지원하는 큐 시스템 구현을 제공하고, [Symfony Mailer](https://symfony.com/doc/7.0/mailer.html)가 내부적으로 동작하는 메일러 구현도 포함하고 있습니다.

라라벨의 모든 컨트랙트는 [별도의 GitHub 저장소](https://github.com/illuminate/contracts)에 존재합니다. 이 저장소는 어떤 컨트랙트들이 있는지 빠르게 참고할 수 있을 뿐만 아니라, 라라벨 서비스와 연동되는 패키지를 개발할 때 사용할 수 있는, 독립적이고 결합도가 낮은 패키지로 제공됩니다.

<a name="contracts-vs-facades"></a>
### 컨트랙트와 파사드의 차이

라라벨의 [파사드](/docs/11.x/facades)와 헬퍼 함수는 라라벨의 서비스를 간편하게 사용할 수 있도록 하며, 서비스 컨테이너에서 컨트랙트를 타입힌트하고 resolve(해결)할 필요가 없습니다. 대부분의 경우, 각 파사드에는 그에 대응하는 컨트랙트가 존재합니다.

파사드는 클래스의 생성자에서 명시적으로 의존성을 선언하지 않아도 사용할 수 있다는 점이 컨트랙트와 다릅니다. 반면, 컨트랙트를 사용하면 클래스의 의존성을 명확하게 타입힌트로 정의할 수 있습니다. 일부 개발자는 이처럼 의존성을 명확히 하는 방식을 선호하며, 그래서 컨트랙트를 이용하기도 합니다. 반면, 다른 개발자는 파사드가 주는 편리함을 즐깁니다. **일반적으로, 대부분의 애플리케이션은 개발 중에 파사드를 사용해도 전혀 문제가 없습니다.**

<a name="when-to-use-contracts"></a>
## 컨트랙트를 언제 사용해야 할까요?

컨트랙트와 파사드 중 어떤 것을 사용할지 결정하는 것은 개발자 개인 또는 팀의 취향에 달려 있습니다. 두 방식 모두 견고하고 테스트 가능한 라라벨 애플리케이션을 만드는 데 사용할 수 있습니다. 컨트랙트와 파사드는 서로 배타적인 것이 아니므로, 애플리케이션의 일부에서는 파사드를, 다른 부분에서는 컨트랙트에 의존하는 방식이 가능합니다. 클래스의 책임만 잘 분리한다면, 컨트랙트와 파사드 사용에 따른 실제 차이는 거의 없습니다.

일반적으로 대부분의 애플리케이션은 개발 단계에서 파사드를 사용해도 괜찮습니다. 만약 여러 PHP 프레임워크와 연동되는 패키지를 개발한다면, `illuminate/contracts` 패키지를 통해 라라벨의 구체적인 구현체를 패키지의 `composer.json`에 의존하지 않고 서비스 연동을 정의할 수 있습니다.

<a name="how-to-use-contracts"></a>
## 컨트랙트 사용 방법

그렇다면, 컨트랙트의 구현체는 어떻게 얻을 수 있을까요? 사실 매우 간단합니다.

라라벨에서는 컨트롤러, 이벤트 리스너, 미들웨어, 큐 작업, 그리고 라우트 클로저 등 다양한 유형의 클래스가 [서비스 컨테이너](/docs/11.x/container)를 통해 resolve(해결)됩니다. 따라서, 클래스가 resolve될 때 생성자의 타입힌트에 컨트랙트 인터페이스를 선언하기만 하면, 컨테이너가 알아서 해당 구현체를 주입해 줍니다.

예를 들어, 아래와 같은 이벤트 리스너를 살펴보겠습니다.

```
<?php

namespace App\Listeners;

use App\Events\OrderWasPlaced;
use App\Models\User;
use Illuminate\Contracts\Redis\Factory;

class CacheOrderInformation
{
    /**
     * Create a new event handler instance.
     */
    public function __construct(
        protected Factory $redis,
    ) {}

    /**
     * Handle the event.
     */
    public function handle(OrderWasPlaced $event): void
    {
        // ...
    }
}
```

이벤트 리스너가 resolve될 때, 서비스 컨테이너는 클래스 생성자의 타입힌트를 읽고 적절한 인스턴스를 자동으로 주입합니다. 서비스 컨테이너에 등록하는 방법 등 더 자세한 내용은 [서비스 컨테이너 문서](/docs/11.x/container)를 참고하시기 바랍니다.

<a name="contract-reference"></a>
## 컨트랙트 참고표

아래 표는 라라벨의 모든 컨트랙트와 그에 대응하는 파사드를 빠르게 조회할 수 있도록 정리한 것입니다.

<div class="overflow-auto">

| 컨트랙트 | 대응 파사드 |
| --- | --- |
| [Illuminate\Contracts\Auth\Access\Authorizable](https://github.com/illuminate/contracts/blob/11.x/Auth/Access/Authorizable.php) | &nbsp; |
| [Illuminate\Contracts\Auth\Access\Gate](https://github.com/illuminate/contracts/blob/11.x/Auth/Access/Gate.php) | `Gate` |
| [Illuminate\Contracts\Auth\Authenticatable](https://github.com/illuminate/contracts/blob/11.x/Auth/Authenticatable.php) | &nbsp; |
| [Illuminate\Contracts\Auth\CanResetPassword](https://github.com/illuminate/contracts/blob/11.x/Auth/CanResetPassword.php) | &nbsp; |
| [Illuminate\Contracts\Auth\Factory](https://github.com/illuminate/contracts/blob/11.x/Auth/Factory.php) | `Auth` |
| [Illuminate\Contracts\Auth\Guard](https://github.com/illuminate/contracts/blob/11.x/Auth/Guard.php) | `Auth::guard()` |
| [Illuminate\Contracts\Auth\PasswordBroker](https://github.com/illuminate/contracts/blob/11.x/Auth/PasswordBroker.php) | `Password::broker()` |
| [Illuminate\Contracts\Auth\PasswordBrokerFactory](https://github.com/illuminate/contracts/blob/11.x/Auth/PasswordBrokerFactory.php) | `Password` |
| [Illuminate\Contracts\Auth\StatefulGuard](https://github.com/illuminate/contracts/blob/11.x/Auth/StatefulGuard.php) | &nbsp; |
| [Illuminate\Contracts\Auth\SupportsBasicAuth](https://github.com/illuminate/contracts/blob/11.x/Auth/SupportsBasicAuth.php) | &nbsp; |
| [Illuminate\Contracts\Auth\UserProvider](https://github.com/illuminate/contracts/blob/11.x/Auth/UserProvider.php) | &nbsp; |
| [Illuminate\Contracts\Broadcasting\Broadcaster](https://github.com/illuminate/contracts/blob/11.x/Broadcasting/Broadcaster.php) | `Broadcast::connection()` |
| [Illuminate\Contracts\Broadcasting\Factory](https://github.com/illuminate/contracts/blob/11.x/Broadcasting/Factory.php) | `Broadcast` |
| [Illuminate\Contracts\Broadcasting\ShouldBroadcast](https://github.com/illuminate/contracts/blob/11.x/Broadcasting/ShouldBroadcast.php) | &nbsp; |
| [Illuminate\Contracts\Broadcasting\ShouldBroadcastNow](https://github.com/illuminate/contracts/blob/11.x/Broadcasting/ShouldBroadcastNow.php) | &nbsp; |
| [Illuminate\Contracts\Bus\Dispatcher](https://github.com/illuminate/contracts/blob/11.x/Bus/Dispatcher.php) | `Bus` |
| [Illuminate\Contracts\Bus\QueueingDispatcher](https://github.com/illuminate/contracts/blob/11.x/Bus/QueueingDispatcher.php) | `Bus::dispatchToQueue()` |
| [Illuminate\Contracts\Cache\Factory](https://github.com/illuminate/contracts/blob/11.x/Cache/Factory.php) | `Cache` |
| [Illuminate\Contracts\Cache\Lock](https://github.com/illuminate/contracts/blob/11.x/Cache/Lock.php) | &nbsp; |
| [Illuminate\Contracts\Cache\LockProvider](https://github.com/illuminate/contracts/blob/11.x/Cache/LockProvider.php) | &nbsp; |
| [Illuminate\Contracts\Cache\Repository](https://github.com/illuminate/contracts/blob/11.x/Cache/Repository.php) | `Cache::driver()` |
| [Illuminate\Contracts\Cache\Store](https://github.com/illuminate/contracts/blob/11.x/Cache/Store.php) | &nbsp; |
| [Illuminate\Contracts\Config\Repository](https://github.com/illuminate/contracts/blob/11.x/Config/Repository.php) | `Config` |
| [Illuminate\Contracts\Console\Application](https://github.com/illuminate/contracts/blob/11.x/Console/Application.php) | &nbsp; |
| [Illuminate\Contracts\Console\Kernel](https://github.com/illuminate/contracts/blob/11.x/Console/Kernel.php) | `Artisan` |
| [Illuminate\Contracts\Container\Container](https://github.com/illuminate/contracts/blob/11.x/Container/Container.php) | `App` |
| [Illuminate\Contracts\Cookie\Factory](https://github.com/illuminate/contracts/blob/11.x/Cookie/Factory.php) | `Cookie` |
| [Illuminate\Contracts\Cookie\QueueingFactory](https://github.com/illuminate/contracts/blob/11.x/Cookie/QueueingFactory.php) | `Cookie::queue()` |
| [Illuminate\Contracts\Database\ModelIdentifier](https://github.com/illuminate/contracts/blob/11.x/Database/ModelIdentifier.php) | &nbsp; |
| [Illuminate\Contracts\Debug\ExceptionHandler](https://github.com/illuminate/contracts/blob/11.x/Debug/ExceptionHandler.php) | &nbsp; |
| [Illuminate\Contracts\Encryption\Encrypter](https://github.com/illuminate/contracts/blob/11.x/Encryption/Encrypter.php) | `Crypt` |
| [Illuminate\Contracts\Events\Dispatcher](https://github.com/illuminate/contracts/blob/11.x/Events/Dispatcher.php) | `Event` |
| [Illuminate\Contracts\Filesystem\Cloud](https://github.com/illuminate/contracts/blob/11.x/Filesystem/Cloud.php) | `Storage::cloud()` |
| [Illuminate\Contracts\Filesystem\Factory](https://github.com/illuminate/contracts/blob/11.x/Filesystem/Factory.php) | `Storage` |
| [Illuminate\Contracts\Filesystem\Filesystem](https://github.com/illuminate/contracts/blob/11.x/Filesystem/Filesystem.php) | `Storage::disk()` |
| [Illuminate\Contracts\Foundation\Application](https://github.com/illuminate/contracts/blob/11.x/Foundation/Application.php) | `App` |
| [Illuminate\Contracts\Hashing\Hasher](https://github.com/illuminate/contracts/blob/11.x/Hashing/Hasher.php) | `Hash` |
| [Illuminate\Contracts\Http\Kernel](https://github.com/illuminate/contracts/blob/11.x/Http/Kernel.php) | &nbsp; |
| [Illuminate\Contracts\Mail\Mailable](https://github.com/illuminate/contracts/blob/11.x/Mail/Mailable.php) | &nbsp; |
| [Illuminate\Contracts\Mail\Mailer](https://github.com/illuminate/contracts/blob/11.x/Mail/Mailer.php) | `Mail` |
| [Illuminate\Contracts\Mail\MailQueue](https://github.com/illuminate/contracts/blob/11.x/Mail/MailQueue.php) | `Mail::queue()` |
| [Illuminate\Contracts\Notifications\Dispatcher](https://github.com/illuminate/contracts/blob/11.x/Notifications/Dispatcher.php) | `Notification`|
| [Illuminate\Contracts\Notifications\Factory](https://github.com/illuminate/contracts/blob/11.x/Notifications/Factory.php) | `Notification` |
| [Illuminate\Contracts\Pagination\LengthAwarePaginator](https://github.com/illuminate/contracts/blob/11.x/Pagination/LengthAwarePaginator.php) | &nbsp; |
| [Illuminate\Contracts\Pagination\Paginator](https://github.com/illuminate/contracts/blob/11.x/Pagination/Paginator.php) | &nbsp; |
| [Illuminate\Contracts\Pipeline\Hub](https://github.com/illuminate/contracts/blob/11.x/Pipeline/Hub.php) | &nbsp; |
| [Illuminate\Contracts\Pipeline\Pipeline](https://github.com/illuminate/contracts/blob/11.x/Pipeline/Pipeline.php) | `Pipeline` |
| [Illuminate\Contracts\Queue\EntityResolver](https://github.com/illuminate/contracts/blob/11.x/Queue/EntityResolver.php) | &nbsp; |
| [Illuminate\Contracts\Queue\Factory](https://github.com/illuminate/contracts/blob/11.x/Queue/Factory.php) | `Queue` |
| [Illuminate\Contracts\Queue\Job](https://github.com/illuminate/contracts/blob/11.x/Queue/Job.php) | &nbsp; |
| [Illuminate\Contracts\Queue\Monitor](https://github.com/illuminate/contracts/blob/11.x/Queue/Monitor.php) | `Queue` |
| [Illuminate\Contracts\Queue\Queue](https://github.com/illuminate/contracts/blob/11.x/Queue/Queue.php) | `Queue::connection()` |
| [Illuminate\Contracts\Queue\QueueableCollection](https://github.com/illuminate/contracts/blob/11.x/Queue/QueueableCollection.php) | &nbsp; |
| [Illuminate\Contracts\Queue\QueueableEntity](https://github.com/illuminate/contracts/blob/11.x/Queue/QueueableEntity.php) | &nbsp; |
| [Illuminate\Contracts\Queue\ShouldQueue](https://github.com/illuminate/contracts/blob/11.x/Queue/ShouldQueue.php) | &nbsp; |
| [Illuminate\Contracts\Redis\Factory](https://github.com/illuminate/contracts/blob/11.x/Redis/Factory.php) | `Redis` |
| [Illuminate\Contracts\Routing\BindingRegistrar](https://github.com/illuminate/contracts/blob/11.x/Routing/BindingRegistrar.php) | `Route` |
| [Illuminate\Contracts\Routing\Registrar](https://github.com/illuminate/contracts/blob/11.x/Routing/Registrar.php) | `Route` |
| [Illuminate\Contracts\Routing\ResponseFactory](https://github.com/illuminate/contracts/blob/11.x/Routing/ResponseFactory.php) | `Response` |
| [Illuminate\Contracts\Routing\UrlGenerator](https://github.com/illuminate/contracts/blob/11.x/Routing/UrlGenerator.php) | `URL` |
| [Illuminate\Contracts\Routing\UrlRoutable](https://github.com/illuminate/contracts/blob/11.x/Routing/UrlRoutable.php) | &nbsp; |
| [Illuminate\Contracts\Session\Session](https://github.com/illuminate/contracts/blob/11.x/Session/Session.php) | `Session::driver()` |
| [Illuminate\Contracts\Support\Arrayable](https://github.com/illuminate/contracts/blob/11.x/Support/Arrayable.php) | &nbsp; |
| [Illuminate\Contracts\Support\Htmlable](https://github.com/illuminate/contracts/blob/11.x/Support/Htmlable.php) | &nbsp; |
| [Illuminate\Contracts\Support\Jsonable](https://github.com/illuminate/contracts/blob/11.x/Support/Jsonable.php) | &nbsp; |
| [Illuminate\Contracts\Support\MessageBag](https://github.com/illuminate/contracts/blob/11.x/Support/MessageBag.php) | &nbsp; |
| [Illuminate\Contracts\Support\MessageProvider](https://github.com/illuminate/contracts/blob/11.x/Support/MessageProvider.php) | &nbsp; |
| [Illuminate\Contracts\Support\Renderable](https://github.com/illuminate/contracts/blob/11.x/Support/Renderable.php) | &nbsp; |
| [Illuminate\Contracts\Support\Responsable](https://github.com/illuminate/contracts/blob/11.x/Support/Responsable.php) | &nbsp; |
| [Illuminate\Contracts\Translation\Loader](https://github.com/illuminate/contracts/blob/11.x/Translation/Loader.php) | &nbsp; |
| [Illuminate\Contracts\Translation\Translator](https://github.com/illuminate/contracts/blob/11.x/Translation/Translator.php) | `Lang` |
| [Illuminate\Contracts\Validation\Factory](https://github.com/illuminate/contracts/blob/11.x/Validation/Factory.php) | `Validator` |
| [Illuminate\Contracts\Validation\ValidatesWhenResolved](https://github.com/illuminate/contracts/blob/11.x/Validation/ValidatesWhenResolved.php) | &nbsp; |
| [Illuminate\Contracts\Validation\ValidationRule](https://github.com/illuminate/contracts/blob/11.x/Validation/ValidationRule.php) | &nbsp; |
| [Illuminate\Contracts\Validation\Validator](https://github.com/illuminate/contracts/blob/11.x/Validation/Validator.php) | `Validator::make()` |
| [Illuminate\Contracts\View\Engine](https://github.com/illuminate/contracts/blob/11.x/View/Engine.php) | &nbsp; |
| [Illuminate\Contracts\View\Factory](https://github.com/illuminate/contracts/blob/11.x/View/Factory.php) | `View` |
| [Illuminate\Contracts\View\View](https://github.com/illuminate/contracts/blob/11.x/View/View.php) | `View::make()` |

</div>
