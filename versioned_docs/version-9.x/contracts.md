# 컨트랙트 (Contracts)

- [소개](#introduction)
    - [컨트랙트와 파사드의 비교](#contracts-vs-facades)
- [컨트랙트를 언제 사용해야 할까](#when-to-use-contracts)
- [컨트랙트 사용 방법](#how-to-use-contracts)
- [컨트랙트 레퍼런스](#contract-reference)

<a name="introduction"></a>
## 소개

라라벨의 "컨트랙트(contracts)"는 프레임워크가 제공하는 핵심 서비스의 동작을 정의한 일련의 인터페이스입니다. 예를 들어, `Illuminate\Contracts\Queue\Queue` 컨트랙트는 작업을 큐잉하기 위해 필요한 메서드들을 정의하고, `Illuminate\Contracts\Mail\Mailer` 컨트랙트는 이메일을 전송하는 데 필요한 메서드들을 정의합니다.

각 컨트랙트에는 프레임워크에서 제공하는 대응하는 구현체가 존재합니다. 예를 들어, 라라벨은 여러 종류의 드라이버로 동작하는 큐 시스템의 구현체와, [Symfony Mailer](https://symfony.com/doc/6.0/mailer.html)를 기반으로 한 메일러 구현체를 제공합니다.

모든 라라벨 컨트랙트는 [별도의 GitHub 저장소](https://github.com/illuminate/contracts)에서 관리되고 있습니다. 이 저장소는 사용 가능한 모든 컨트랙트를 빠르게 참조할 수 있을 뿐만 아니라, 라라벨 서비스와 연동하는 패키지를 만들 때 독립적으로 활용할 수 있는 패키지 역할도 합니다.

<a name="contracts-vs-facades"></a>
### 컨트랙트와 파사드의 비교

라라벨의 [파사드](/docs/9.x/facades)와 다양한 헬퍼 함수들은 서비스 컨테이너에서 컨트랙트를 타입힌트하고 주입받지 않아도 라라벨의 서비스를 간편하게 활용할 수 있도록 해줍니다. 대부분의 경우, 각 파사드는 동일한 역할을 하는 컨트랙트와 1:1로 대응합니다.

파사드는 클래스의 생성자에서 익스플리싯하게 요구하지 않아도 되지만, 컨트랙트는 의존성을 명확하게 선언할 수 있습니다. 일부 개발자는 이런 방식으로 의존성을 명시적으로 정의하는 걸 선호해서 컨트랙트 사용을 더 좋아하고, 어떤 개발자는 파사드의 편의성을 선호하기도 합니다. **일반적으로, 대부분의 애플리케이션은 개발 중에 파사드를 문제없이 사용할 수 있습니다.**

<a name="when-to-use-contracts"></a>
## 컨트랙트를 언제 사용해야 할까

컨트랙트와 파사드 중 어떤 것을 사용할지는 여러분이나 팀의 취향에 따라 결정하면 됩니다. 둘 다 사용해서 견고하고 테스트 가능한 라라벨 애플리케이션을 충분히 만들 수 있습니다. 게다가 컨트랙트와 파사드는 서로 독립적인 관계가 아닌, 상황에 따라 일부 코드는 파사드를, 다른 코드는 컨트랙트를 사용할 수도 있습니다. 클래스의 역할만 명확하게 분리한다면 두 방식 모두 실질적으로 큰 차이를 느끼기 어렵습니다.

일반적으로는 개발 과정에서 파사드만 사용해도 문제가 없지만, 만약 여러 PHP 프레임워크와 연동되는 패키지를 만들고 있다면 `illuminate/contracts` 패키지를 통해 구현체를 직접 의존하지 않고 라라벨 서비스와 통합할 수 있습니다. 이를 통해 패키지의 `composer.json` 파일에 라라벨의 구체적인 구현체를 명시하지 않고도 연동할 수 있습니다.

<a name="how-to-use-contracts"></a>
## 컨트랙트 사용 방법

컨트랙트의 구현체는 어떻게 받아올 수 있을까요? 실제로 꽤 간단합니다.

라라벨의 많은 클래스 타입(컨트롤러, 이벤트 리스너, 미들웨어, 큐 작업, 라우트 클로저 등)은 모두 [서비스 컨테이너](/docs/9.x/container)에서 자동으로 인스턴스화됩니다. 즉, 컨트랙트의 구현체를 사용하고 싶다면, 해당 클래스의 생성자에 인터페이스를 타입힌트만 하면 됩니다.

예를 들어 다음과 같은 이벤트 리스너를 살펴봅시다:

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

이벤트 리스너가 서비스 컨테이너에 의해 해석될 때, 생성자에 명시된 타입힌트를 읽어서 적절한 객체를 주입합니다. 서비스 컨테이너에 객체를 등록하는 방법 등 더 자세한 내용은 [해당 문서](/docs/9.x/container)를 참고하세요.

<a name="contract-reference"></a>
## 컨트랙트 레퍼런스

아래 표는 라라벨의 모든 컨트랙트와 이에 해당하는 파사드를 빠르게 참고할 수 있게 정리한 자료입니다:

| 컨트랙트                                                                                                                                                | 대응 파사드                |
|--------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------|
| [Illuminate\Contracts\Auth\Access\Authorizable](https://github.com/illuminate/contracts/blob/9.x/Auth/Access/Authorizable.php)                 |  &nbsp;                   |
| [Illuminate\Contracts\Auth\Access\Gate](https://github.com/illuminate/contracts/blob/9.x/Auth/Access/Gate.php)                                 | `Gate`                    |
| [Illuminate\Contracts\Auth\Authenticatable](https://github.com/illuminate/contracts/blob/9.x/Auth/Authenticatable.php)                         |  &nbsp;                   |
| [Illuminate\Contracts\Auth\CanResetPassword](https://github.com/illuminate/contracts/blob/9.x/Auth/CanResetPassword.php)                       | &nbsp;                    |
| [Illuminate\Contracts\Auth\Factory](https://github.com/illuminate/contracts/blob/9.x/Auth/Factory.php)                                         | `Auth`                    |
| [Illuminate\Contracts\Auth\Guard](https://github.com/illuminate/contracts/blob/9.x/Auth/Guard.php)                                             | `Auth::guard()`           |
| [Illuminate\Contracts\Auth\PasswordBroker](https://github.com/illuminate/contracts/blob/9.x/Auth/PasswordBroker.php)                           | `Password::broker()`      |
| [Illuminate\Contracts\Auth\PasswordBrokerFactory](https://github.com/illuminate/contracts/blob/9.x/Auth/PasswordBrokerFactory.php)             | `Password`                |
| [Illuminate\Contracts\Auth\StatefulGuard](https://github.com/illuminate/contracts/blob/9.x/Auth/StatefulGuard.php)                             | &nbsp;                    |
| [Illuminate\Contracts\Auth\SupportsBasicAuth](https://github.com/illuminate/contracts/blob/9.x/Auth/SupportsBasicAuth.php)                     | &nbsp;                    |
| [Illuminate\Contracts\Auth\UserProvider](https://github.com/illuminate/contracts/blob/9.x/Auth/UserProvider.php)                               | &nbsp;                    |
| [Illuminate\Contracts\Bus\Dispatcher](https://github.com/illuminate/contracts/blob/9.x/Bus/Dispatcher.php)                                     | `Bus`                     |
| [Illuminate\Contracts\Bus\QueueingDispatcher](https://github.com/illuminate/contracts/blob/9.x/Bus/QueueingDispatcher.php)                     | `Bus::dispatchToQueue()`  |
| [Illuminate\Contracts\Broadcasting\Factory](https://github.com/illuminate/contracts/blob/9.x/Broadcasting/Factory.php)                         | `Broadcast`               |
| [Illuminate\Contracts\Broadcasting\Broadcaster](https://github.com/illuminate/contracts/blob/9.x/Broadcasting/Broadcaster.php)                 | `Broadcast::connection()` |
| [Illuminate\Contracts\Broadcasting\ShouldBroadcast](https://github.com/illuminate/contracts/blob/9.x/Broadcasting/ShouldBroadcast.php)         | &nbsp;                    |
| [Illuminate\Contracts\Broadcasting\ShouldBroadcastNow](https://github.com/illuminate/contracts/blob/9.x/Broadcasting/ShouldBroadcastNow.php)   | &nbsp;                    |
| [Illuminate\Contracts\Cache\Factory](https://github.com/illuminate/contracts/blob/9.x/Cache/Factory.php)                                       | `Cache`                   |
| [Illuminate\Contracts\Cache\Lock](https://github.com/illuminate/contracts/blob/9.x/Cache/Lock.php)                                             | &nbsp;                    |
| [Illuminate\Contracts\Cache\LockProvider](https://github.com/illuminate/contracts/blob/9.x/Cache/LockProvider.php)                             | &nbsp;                    |
| [Illuminate\Contracts\Cache\Repository](https://github.com/illuminate/contracts/blob/9.x/Cache/Repository.php)                                 | `Cache::driver()`         |
| [Illuminate\Contracts\Cache\Store](https://github.com/illuminate/contracts/blob/9.x/Cache/Store.php)                                           | &nbsp;                    |
| [Illuminate\Contracts\Config\Repository](https://github.com/illuminate/contracts/blob/9.x/Config/Repository.php)                               | `Config`                  |
| [Illuminate\Contracts\Console\Application](https://github.com/illuminate/contracts/blob/9.x/Console/Application.php)                           | &nbsp;                    |
| [Illuminate\Contracts\Console\Kernel](https://github.com/illuminate/contracts/blob/9.x/Console/Kernel.php)                                     | `Artisan`                 |
| [Illuminate\Contracts\Container\Container](https://github.com/illuminate/contracts/blob/9.x/Container/Container.php)                           | `App`                     |
| [Illuminate\Contracts\Cookie\Factory](https://github.com/illuminate/contracts/blob/9.x/Cookie/Factory.php)                                     | `Cookie`                  |
| [Illuminate\Contracts\Cookie\QueueingFactory](https://github.com/illuminate/contracts/blob/9.x/Cookie/QueueingFactory.php)                     | `Cookie::queue()`         |
| [Illuminate\Contracts\Database\ModelIdentifier](https://github.com/illuminate/contracts/blob/9.x/Database/ModelIdentifier.php)                 | &nbsp;                    |
| [Illuminate\Contracts\Debug\ExceptionHandler](https://github.com/illuminate/contracts/blob/9.x/Debug/ExceptionHandler.php)                     | &nbsp;                    |
| [Illuminate\Contracts\Encryption\Encrypter](https://github.com/illuminate/contracts/blob/9.x/Encryption/Encrypter.php)                         | `Crypt`                   |
| [Illuminate\Contracts\Events\Dispatcher](https://github.com/illuminate/contracts/blob/9.x/Events/Dispatcher.php)                               | `Event`                   |
| [Illuminate\Contracts\Filesystem\Cloud](https://github.com/illuminate/contracts/blob/9.x/Filesystem/Cloud.php)                                 | `Storage::cloud()`        |
| [Illuminate\Contracts\Filesystem\Factory](https://github.com/illuminate/contracts/blob/9.x/Filesystem/Factory.php)                             | `Storage`                 |
| [Illuminate\Contracts\Filesystem\Filesystem](https://github.com/illuminate/contracts/blob/9.x/Filesystem/Filesystem.php)                       | `Storage::disk()`         |
| [Illuminate\Contracts\Foundation\Application](https://github.com/illuminate/contracts/blob/9.x/Foundation/Application.php)                     | `App`                     |
| [Illuminate\Contracts\Hashing\Hasher](https://github.com/illuminate/contracts/blob/9.x/Hashing/Hasher.php)                                     | `Hash`                    |
| [Illuminate\Contracts\Http\Kernel](https://github.com/illuminate/contracts/blob/9.x/Http/Kernel.php)                                           | &nbsp;                    |
| [Illuminate\Contracts\Mail\MailQueue](https://github.com/illuminate/contracts/blob/9.x/Mail/MailQueue.php)                                     | `Mail::queue()`           |
| [Illuminate\Contracts\Mail\Mailable](https://github.com/illuminate/contracts/blob/9.x/Mail/Mailable.php)                                       | &nbsp;                    |
| [Illuminate\Contracts\Mail\Mailer](https://github.com/illuminate/contracts/blob/9.x/Mail/Mailer.php)                                           | `Mail`                    |
| [Illuminate\Contracts\Notifications\Dispatcher](https://github.com/illuminate/contracts/blob/9.x/Notifications/Dispatcher.php)                 | `Notification`            |
| [Illuminate\Contracts\Notifications\Factory](https://github.com/illuminate/contracts/blob/9.x/Notifications/Factory.php)                       | `Notification`            |
| [Illuminate\Contracts\Pagination\LengthAwarePaginator](https://github.com/illuminate/contracts/blob/9.x/Pagination/LengthAwarePaginator.php)   | &nbsp;                    |
| [Illuminate\Contracts\Pagination\Paginator](https://github.com/illuminate/contracts/blob/9.x/Pagination/Paginator.php)                         | &nbsp;                    |
| [Illuminate\Contracts\Pipeline\Hub](https://github.com/illuminate/contracts/blob/9.x/Pipeline/Hub.php)                                         | &nbsp;                    |
| [Illuminate\Contracts\Pipeline\Pipeline](https://github.com/illuminate/contracts/blob/9.x/Pipeline/Pipeline.php)                               | &nbsp;                    |
| [Illuminate\Contracts\Queue\EntityResolver](https://github.com/illuminate/contracts/blob/9.x/Queue/EntityResolver.php)                         | &nbsp;                    |
| [Illuminate\Contracts\Queue\Factory](https://github.com/illuminate/contracts/blob/9.x/Queue/Factory.php)                                       | `Queue`                   |
| [Illuminate\Contracts\Queue\Job](https://github.com/illuminate/contracts/blob/9.x/Queue/Job.php)                                               | &nbsp;                    |
| [Illuminate\Contracts\Queue\Monitor](https://github.com/illuminate/contracts/blob/9.x/Queue/Monitor.php)                                       | `Queue`                   |
| [Illuminate\Contracts\Queue\Queue](https://github.com/illuminate/contracts/blob/9.x/Queue/Queue.php)                                           | `Queue::connection()`     |
| [Illuminate\Contracts\Queue\QueueableCollection](https://github.com/illuminate/contracts/blob/9.x/Queue/QueueableCollection.php)               | &nbsp;                    |
| [Illuminate\Contracts\Queue\QueueableEntity](https://github.com/illuminate/contracts/blob/9.x/Queue/QueueableEntity.php)                       | &nbsp;                    |
| [Illuminate\Contracts\Queue\ShouldQueue](https://github.com/illuminate/contracts/blob/9.x/Queue/ShouldQueue.php)                               | &nbsp;                    |
| [Illuminate\Contracts\Redis\Factory](https://github.com/illuminate/contracts/blob/9.x/Redis/Factory.php)                                       | `Redis`                   |
| [Illuminate\Contracts\Routing\BindingRegistrar](https://github.com/illuminate/contracts/blob/9.x/Routing/BindingRegistrar.php)                 | `Route`                   |
| [Illuminate\Contracts\Routing\Registrar](https://github.com/illuminate/contracts/blob/9.x/Routing/Registrar.php)                               | `Route`                   |
| [Illuminate\Contracts\Routing\ResponseFactory](https://github.com/illuminate/contracts/blob/9.x/Routing/ResponseFactory.php)                   | `Response`                |
| [Illuminate\Contracts\Routing\UrlGenerator](https://github.com/illuminate/contracts/blob/9.x/Routing/UrlGenerator.php)                         | `URL`                     |
| [Illuminate\Contracts\Routing\UrlRoutable](https://github.com/illuminate/contracts/blob/9.x/Routing/UrlRoutable.php)                           | &nbsp;                    |
| [Illuminate\Contracts\Session\Session](https://github.com/illuminate/contracts/blob/9.x/Session/Session.php)                                   | `Session::driver()`       |
| [Illuminate\Contracts\Support\Arrayable](https://github.com/illuminate/contracts/blob/9.x/Support/Arrayable.php)                               | &nbsp;                    |
| [Illuminate\Contracts\Support\Htmlable](https://github.com/illuminate/contracts/blob/9.x/Support/Htmlable.php)                                 | &nbsp;                    |
| [Illuminate\Contracts\Support\Jsonable](https://github.com/illuminate/contracts/blob/9.x/Support/Jsonable.php)                                 | &nbsp;                    |
| [Illuminate\Contracts\Support\MessageBag](https://github.com/illuminate/contracts/blob/9.x/Support/MessageBag.php)                             | &nbsp;                    |
| [Illuminate\Contracts\Support\MessageProvider](https://github.com/illuminate/contracts/blob/9.x/Support/MessageProvider.php)                   | &nbsp;                    |
| [Illuminate\Contracts\Support\Renderable](https://github.com/illuminate/contracts/blob/9.x/Support/Renderable.php)                             | &nbsp;                    |
| [Illuminate\Contracts\Support\Responsable](https://github.com/illuminate/contracts/blob/9.x/Support/Responsable.php)                           | &nbsp;                    |
| [Illuminate\Contracts\Translation\Loader](https://github.com/illuminate/contracts/blob/9.x/Translation/Loader.php)                             | &nbsp;                    |
| [Illuminate\Contracts\Translation\Translator](https://github.com/illuminate/contracts/blob/9.x/Translation/Translator.php)                     | `Lang`                    |
| [Illuminate\Contracts\Validation\Factory](https://github.com/illuminate/contracts/blob/9.x/Validation/Factory.php)                             | `Validator`               |
| [Illuminate\Contracts\Validation\ImplicitRule](https://github.com/illuminate/contracts/blob/9.x/Validation/ImplicitRule.php)                   | &nbsp;                    |
| [Illuminate\Contracts\Validation\Rule](https://github.com/illuminate/contracts/blob/9.x/Validation/Rule.php)                                   | &nbsp;                    |
| [Illuminate\Contracts\Validation\ValidatesWhenResolved](https://github.com/illuminate/contracts/blob/9.x/Validation/ValidatesWhenResolved.php) | &nbsp;                    |
| [Illuminate\Contracts\Validation\Validator](https://github.com/illuminate/contracts/blob/9.x/Validation/Validator.php)                         | `Validator::make()`       |
| [Illuminate\Contracts\View\Engine](https://github.com/illuminate/contracts/blob/9.x/View/Engine.php)                                           | &nbsp;                    |
| [Illuminate\Contracts\View\Factory](https://github.com/illuminate/contracts/blob/9.x/View/Factory.php)                                         | `View`                    |
| [Illuminate\Contracts\View\View](https://github.com/illuminate/contracts/blob/9.x/View/View.php)                                               | `View::make()`            |
