# 계약 (Contracts)

- [소개](#introduction)
    - [계약과 파사드의 차이](#contracts-vs-facades)
- [계약을 사용해야 할 때](#when-to-use-contracts)
- [계약의 사용 방법](#how-to-use-contracts)
- [계약 참조표](#contract-reference)

<a name="introduction"></a>
## 소개

라라벨의 "계약(contracts)"은 프레임워크에서 제공하는 핵심 서비스의 동작 방식을 정의한 일련의 인터페이스입니다. 예를 들어, `Illuminate\Contracts\Queue\Queue` 계약은 작업을 큐에 넣기 위해 필요한 메서드를 정의하고 있으며, `Illuminate\Contracts\Mail\Mailer` 계약은 이메일을 전송하는 데 필요한 메서드를 명시하고 있습니다.

각 계약에는 프레임워크에서 제공하는 대응되는 실제 구현이 존재합니다. 예를 들어, 라라벨은 다양한 드라이버를 지원하는 큐 시스템 구현을 제공하며, 메일 전송 구현은 [Symfony Mailer](https://symfony.com/doc/6.0/mailer.html)를 기반으로 만들어졌습니다.

라라벨의 모든 계약은 [별도의 GitHub 저장소](https://github.com/illuminate/contracts)에 보관되어 있습니다. 이 저장소를 참고하면 제공되는 모든 계약의 목록을 한눈에 확인할 수 있으며, 라라벨 서비스와 연동하는 패키지를 만들 때 활용할 수 있는, 프레임워크 자체와는 분리된 형태의 패키지로도 사용할 수 있습니다.

<a name="contracts-vs-facades"></a>
### 계약과 파사드의 차이

라라벨의 [파사드](/docs/10.x/facades)와 도우미 함수(helper)는 서비스 컨테이너에서 계약을 타입힌트 하거나 직접 해결하지 않고도 라라벨의 서비스 기능을 간단하게 사용할 수 있는 편리한 방법을 제공합니다. 대부분의 경우, 각 파사드에는 동일한 기능을 제공하는 계약이 대응되어 있습니다.

파사드는 클래스의 생성자에서 별도로 요구하거나 선언할 필요 없이 바로 사용할 수 있지만, 계약을 이용하면 클래스의 생성자에서 명시적으로 해당 의존성을 정의할 수 있습니다. 어떤 개발자는 이렇게 명시적으로 의존성을 드러내는 방식을 선호해 계약을 사용하는 반면, 다른 개발자는 파사드의 편리함을 더 선호하기도 합니다. **일반적으로 대부분의 애플리케이션에서는 개발 과정에서 별다른 문제 없이 파사드를 사용할 수 있습니다.**

<a name="when-to-use-contracts"></a>
## 계약을 사용해야 할 때

계약과 파사드 중 무엇을 사용할지는 여러분 자신 또는 팀의 개발 스타일에 따라 결정할 수 있습니다. 계약과 파사드 어느 쪽이든 라라벨 애플리케이션을 충분히 견고하고 테스트하기 쉽게 만들 수 있습니다. 계약과 파사드는 상호 배타적이지 않으며, 애플리케이션 내 어떤 부분에서는 파사드를, 다른 부분에서는 계약을 사용할 수도 있습니다. 클래스들의 책임만 명확히 분리하고 있다면, 계약과 파사드 사용 사이에서 실제로 느껴지는 차이는 거의 없습니다.

일반적으로, 대부분의 애플리케이션에서는 개발 과정에서 파사드를 자유롭게 사용해도 괜찮습니다. 만약 여러 PHP 프레임워크와 연동되는 패키지를 제작하고 있다면, `illuminate/contracts` 패키지를 사용하면 라라벨의 구체적인 구현체를 패키지의 `composer.json`에 직접 의존하지 않고도 라라벨 서비스와 연동할 수 있습니다.

<a name="how-to-use-contracts"></a>
## 계약의 사용 방법

그렇다면, 실제로 계약의 구현체를 어떻게 얻을 수 있을까요? 방법은 매우 간단합니다.

라라벨에서는 여러 유형의 클래스(컨트롤러, 이벤트 리스너, 미들웨어, 큐 처리 작업, 라우트 클로저 등)가 [서비스 컨테이너](/docs/10.x/container)를 통해 해결(resolved)됩니다. 따라서, 클래스의 생성자에서 인터페이스(계약)를 "타입힌트" 하면, 해당 계약의 구현체가 자동으로 주입되어 사용 가능합니다.

예를 들어, 아래의 이벤트 리스너 예시를 살펴보세요.

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

이벤트 리스너가 서비스 컨테이너에 의해 해결될 때, 컨테이너는 클래스 생성자에 선언된 타입힌트를 읽고, 적절한 값을 자동으로 주입합니다. 서비스 컨테이너에 다양한 항목을 등록하는 방법 등 더 자세한 내용은 [서비스 컨테이너 문서](/docs/10.x/container)를 참고하세요.

<a name="contract-reference"></a>
## 계약 참조표

아래 표는 라라벨에서 제공하는 모든 계약과 이에 대응하는 주요 파사드의 빠른 참조 목록입니다.

| 계약(Contract)                                                                                                                                       | 대응되는 파사드            |
|------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------|
| [Illuminate\Contracts\Auth\Access\Authorizable](https://github.com/illuminate/contracts/blob/10.x/Auth/Access/Authorizable.php)                 |  &nbsp;                  |
| [Illuminate\Contracts\Auth\Access\Gate](https://github.com/illuminate/contracts/blob/10.x/Auth/Access/Gate.php)                                 | `Gate`                   |
| [Illuminate\Contracts\Auth\Authenticatable](https://github.com/illuminate/contracts/blob/10.x/Auth/Authenticatable.php)                         |  &nbsp;                  |
| [Illuminate\Contracts\Auth\CanResetPassword](https://github.com/illuminate/contracts/blob/10.x/Auth/CanResetPassword.php)                       | &nbsp;                   |
| [Illuminate\Contracts\Auth\Factory](https://github.com/illuminate/contracts/blob/10.x/Auth/Factory.php)                                         | `Auth`                   |
| [Illuminate\Contracts\Auth\Guard](https://github.com/illuminate/contracts/blob/10.x/Auth/Guard.php)                                             | `Auth::guard()`          |
| [Illuminate\Contracts\Auth\PasswordBroker](https://github.com/illuminate/contracts/blob/10.x/Auth/PasswordBroker.php)                           | `Password::broker()`     |
| [Illuminate\Contracts\Auth\PasswordBrokerFactory](https://github.com/illuminate/contracts/blob/10.x/Auth/PasswordBrokerFactory.php)             | `Password`               |
| [Illuminate\Contracts\Auth\StatefulGuard](https://github.com/illuminate/contracts/blob/10.x/Auth/StatefulGuard.php)                             | &nbsp;                   |
| [Illuminate\Contracts\Auth\SupportsBasicAuth](https://github.com/illuminate/contracts/blob/10.x/Auth/SupportsBasicAuth.php)                     | &nbsp;                   |
| [Illuminate\Contracts\Auth\UserProvider](https://github.com/illuminate/contracts/blob/10.x/Auth/UserProvider.php)                               | &nbsp;                   |
| [Illuminate\Contracts\Bus\Dispatcher](https://github.com/illuminate/contracts/blob/10.x/Bus/Dispatcher.php)                                     | `Bus`                    |
| [Illuminate\Contracts\Bus\QueueingDispatcher](https://github.com/illuminate/contracts/blob/10.x/Bus/QueueingDispatcher.php)                     | `Bus::dispatchToQueue()` |
| [Illuminate\Contracts\Broadcasting\Factory](https://github.com/illuminate/contracts/blob/10.x/Broadcasting/Factory.php)                         | `Broadcast`              |
| [Illuminate\Contracts\Broadcasting\Broadcaster](https://github.com/illuminate/contracts/blob/10.x/Broadcasting/Broadcaster.php)                 | `Broadcast::connection()`|
| [Illuminate\Contracts\Broadcasting\ShouldBroadcast](https://github.com/illuminate/contracts/blob/10.x/Broadcasting/ShouldBroadcast.php)         | &nbsp;                   |
| [Illuminate\Contracts\Broadcasting\ShouldBroadcastNow](https://github.com/illuminate/contracts/blob/10.x/Broadcasting/ShouldBroadcastNow.php)   | &nbsp;                   |
| [Illuminate\Contracts\Cache\Factory](https://github.com/illuminate/contracts/blob/10.x/Cache/Factory.php)                                       | `Cache`                  |
| [Illuminate\Contracts\Cache\Lock](https://github.com/illuminate/contracts/blob/10.x/Cache/Lock.php)                                             | &nbsp;                   |
| [Illuminate\Contracts\Cache\LockProvider](https://github.com/illuminate/contracts/blob/10.x/Cache/LockProvider.php)                             | &nbsp;                   |
| [Illuminate\Contracts\Cache\Repository](https://github.com/illuminate/contracts/blob/10.x/Cache/Repository.php)                                 | `Cache::driver()`        |
| [Illuminate\Contracts\Cache\Store](https://github.com/illuminate/contracts/blob/10.x/Cache/Store.php)                                           | &nbsp;                   |
| [Illuminate\Contracts\Config\Repository](https://github.com/illuminate/contracts/blob/10.x/Config/Repository.php)                               | `Config`                 |
| [Illuminate\Contracts\Console\Application](https://github.com/illuminate/contracts/blob/10.x/Console/Application.php)                           | &nbsp;                   |
| [Illuminate\Contracts\Console\Kernel](https://github.com/illuminate/contracts/blob/10.x/Console/Kernel.php)                                     | `Artisan`                |
| [Illuminate\Contracts\Container\Container](https://github.com/illuminate/contracts/blob/10.x/Container/Container.php)                           | `App`                    |
| [Illuminate\Contracts\Cookie\Factory](https://github.com/illuminate/contracts/blob/10.x/Cookie/Factory.php)                                     | `Cookie`                 |
| [Illuminate\Contracts\Cookie\QueueingFactory](https://github.com/illuminate/contracts/blob/10.x/Cookie/QueueingFactory.php)                     | `Cookie::queue()`        |
| [Illuminate\Contracts\Database\ModelIdentifier](https://github.com/illuminate/contracts/blob/10.x/Database/ModelIdentifier.php)                 | &nbsp;                   |
| [Illuminate\Contracts\Debug\ExceptionHandler](https://github.com/illuminate/contracts/blob/10.x/Debug/ExceptionHandler.php)                     | &nbsp;                   |
| [Illuminate\Contracts\Encryption\Encrypter](https://github.com/illuminate/contracts/blob/10.x/Encryption/Encrypter.php)                         | `Crypt`                  |
| [Illuminate\Contracts\Events\Dispatcher](https://github.com/illuminate/contracts/blob/10.x/Events/Dispatcher.php)                               | `Event`                  |
| [Illuminate\Contracts\Filesystem\Cloud](https://github.com/illuminate/contracts/blob/10.x/Filesystem/Cloud.php)                                 | `Storage::cloud()`       |
| [Illuminate\Contracts\Filesystem\Factory](https://github.com/illuminate/contracts/blob/10.x/Filesystem/Factory.php)                             | `Storage`                |
| [Illuminate\Contracts\Filesystem\Filesystem](https://github.com/illuminate/contracts/blob/10.x/Filesystem/Filesystem.php)                       | `Storage::disk()`        |
| [Illuminate\Contracts\Foundation\Application](https://github.com/illuminate/contracts/blob/10.x/Foundation/Application.php)                     | `App`                    |
| [Illuminate\Contracts\Hashing\Hasher](https://github.com/illuminate/contracts/blob/10.x/Hashing/Hasher.php)                                     | `Hash`                   |
| [Illuminate\Contracts\Http\Kernel](https://github.com/illuminate/contracts/blob/10.x/Http/Kernel.php)                                           | &nbsp;                   |
| [Illuminate\Contracts\Mail\MailQueue](https://github.com/illuminate/contracts/blob/10.x/Mail/MailQueue.php)                                     | `Mail::queue()`          |
| [Illuminate\Contracts\Mail\Mailable](https://github.com/illuminate/contracts/blob/10.x/Mail/Mailable.php)                                       | &nbsp;                   |
| [Illuminate\Contracts\Mail\Mailer](https://github.com/illuminate/contracts/blob/10.x/Mail/Mailer.php)                                           | `Mail`                   |
| [Illuminate\Contracts\Notifications\Dispatcher](https://github.com/illuminate/contracts/blob/10.x/Notifications/Dispatcher.php)                 | `Notification`           |
| [Illuminate\Contracts\Notifications\Factory](https://github.com/illuminate/contracts/blob/10.x/Notifications/Factory.php)                       | `Notification`           |
| [Illuminate\Contracts\Pagination\LengthAwarePaginator](https://github.com/illuminate/contracts/blob/10.x/Pagination/LengthAwarePaginator.php)   | &nbsp;                   |
| [Illuminate\Contracts\Pagination\Paginator](https://github.com/illuminate/contracts/blob/10.x/Pagination/Paginator.php)                         | &nbsp;                   |
| [Illuminate\Contracts\Pipeline\Hub](https://github.com/illuminate/contracts/blob/10.x/Pipeline/Hub.php)                                         | &nbsp;                   |
| [Illuminate\Contracts\Pipeline\Pipeline](https://github.com/illuminate/contracts/blob/10.x/Pipeline/Pipeline.php)                               | `Pipeline`               |
| [Illuminate\Contracts\Queue\EntityResolver](https://github.com/illuminate/contracts/blob/10.x/Queue/EntityResolver.php)                         | &nbsp;                   |
| [Illuminate\Contracts\Queue\Factory](https://github.com/illuminate/contracts/blob/10.x/Queue/Factory.php)                                       | `Queue`                  |
| [Illuminate\Contracts\Queue\Job](https://github.com/illuminate/contracts/blob/10.x/Queue/Job.php)                                               | &nbsp;                   |
| [Illuminate\Contracts\Queue\Monitor](https://github.com/illuminate/contracts/blob/10.x/Queue/Monitor.php)                                       | `Queue`                  |
| [Illuminate\Contracts\Queue\Queue](https://github.com/illuminate/contracts/blob/10.x/Queue/Queue.php)                                           | `Queue::connection()`    |
| [Illuminate\Contracts\Queue\QueueableCollection](https://github.com/illuminate/contracts/blob/10.x/Queue/QueueableCollection.php)               | &nbsp;                   |
| [Illuminate\Contracts\Queue\QueueableEntity](https://github.com/illuminate/contracts/blob/10.x/Queue/QueueableEntity.php)                       | &nbsp;                   |
| [Illuminate\Contracts\Queue\ShouldQueue](https://github.com/illuminate/contracts/blob/10.x/Queue/ShouldQueue.php)                               | &nbsp;                   |
| [Illuminate\Contracts\Redis\Factory](https://github.com/illuminate/contracts/blob/10.x/Redis/Factory.php)                                       | `Redis`                  |
| [Illuminate\Contracts\Routing\BindingRegistrar](https://github.com/illuminate/contracts/blob/10.x/Routing/BindingRegistrar.php)                 | `Route`                  |
| [Illuminate\Contracts\Routing\Registrar](https://github.com/illuminate/contracts/blob/10.x/Routing/Registrar.php)                               | `Route`                  |
| [Illuminate\Contracts\Routing\ResponseFactory](https://github.com/illuminate/contracts/blob/10.x/Routing/ResponseFactory.php)                   | `Response`               |
| [Illuminate\Contracts\Routing\UrlGenerator](https://github.com/illuminate/contracts/blob/10.x/Routing/UrlGenerator.php)                         | `URL`                    |
| [Illuminate\Contracts\Routing\UrlRoutable](https://github.com/illuminate/contracts/blob/10.x/Routing/UrlRoutable.php)                           | &nbsp;                   |
| [Illuminate\Contracts\Session\Session](https://github.com/illuminate/contracts/blob/10.x/Session/Session.php)                                   | `Session::driver()`      |
| [Illuminate\Contracts\Support\Arrayable](https://github.com/illuminate/contracts/blob/10.x/Support/Arrayable.php)                               | &nbsp;                   |
| [Illuminate\Contracts\Support\Htmlable](https://github.com/illuminate/contracts/blob/10.x/Support/Htmlable.php)                                 | &nbsp;                   |
| [Illuminate\Contracts\Support\Jsonable](https://github.com/illuminate/contracts/blob/10.x/Support/Jsonable.php)                                 | &nbsp;                   |
| [Illuminate\Contracts\Support\MessageBag](https://github.com/illuminate/contracts/blob/10.x/Support/MessageBag.php)                             | &nbsp;                   |
| [Illuminate\Contracts\Support\MessageProvider](https://github.com/illuminate/contracts/blob/10.x/Support/MessageProvider.php)                   | &nbsp;                   |
| [Illuminate\Contracts\Support\Renderable](https://github.com/illuminate/contracts/blob/10.x/Support/Renderable.php)                             | &nbsp;                   |
| [Illuminate\Contracts\Support\Responsable](https://github.com/illuminate/contracts/blob/10.x/Support/Responsable.php)                           | &nbsp;                   |
| [Illuminate\Contracts\Translation\Loader](https://github.com/illuminate/contracts/blob/10.x/Translation/Loader.php)                             | &nbsp;                   |
| [Illuminate\Contracts\Translation\Translator](https://github.com/illuminate/contracts/blob/10.x/Translation/Translator.php)                     | `Lang`                   |
| [Illuminate\Contracts\Validation\Factory](https://github.com/illuminate/contracts/blob/10.x/Validation/Factory.php)                             | `Validator`              |
| [Illuminate\Contracts\Validation\ImplicitRule](https://github.com/illuminate/contracts/blob/10.x/Validation/ImplicitRule.php)                   | &nbsp;                   |
| [Illuminate\Contracts\Validation\Rule](https://github.com/illuminate/contracts/blob/10.x/Validation/Rule.php)                                   | &nbsp;                   |
| [Illuminate\Contracts\Validation\ValidatesWhenResolved](https://github.com/illuminate/contracts/blob/10.x/Validation/ValidatesWhenResolved.php) | &nbsp;                   |
| [Illuminate\Contracts\Validation\Validator](https://github.com/illuminate/contracts/blob/10.x/Validation/Validator.php)                         | `Validator::make()`      |
| [Illuminate\Contracts\View\Engine](https://github.com/illuminate/contracts/blob/10.x/View/Engine.php)                                           | &nbsp;                   |
| [Illuminate\Contracts\View\Factory](https://github.com/illuminate/contracts/blob/10.x/View/Factory.php)                                         | `View`                   |
| [Illuminate\Contracts\View\View](https://github.com/illuminate/contracts/blob/10.x/View/View.php)                                               | `View::make()`           |