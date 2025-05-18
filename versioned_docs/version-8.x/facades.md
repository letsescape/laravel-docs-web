# 파사드 (Facades)

- [소개](#introduction)
- [파사드를 언제 사용해야 할까요?](#when-to-use-facades)
    - [파사드 vs. 의존성 주입](#facades-vs-dependency-injection)
    - [파사드 vs. 헬퍼 함수](#facades-vs-helper-functions)
- [파사드는 어떻게 동작하나요?](#how-facades-work)
- [실시간(Real-Time) 파사드](#real-time-facades)
- [파사드 클래스 레퍼런스](#facade-class-reference)

<a name="introduction"></a>
## 소개

라라벨 공식 문서 전반에 걸쳐, "파사드(facade)"를 통해 라라벨의 다양한 기능과 상호작용하는 코드 예제를 자주 보실 수 있습니다. 파사드는 애플리케이션의 [서비스 컨테이너](/docs/8.x/container)에서 사용할 수 있는 클래스에 대해 "정적(static)" 인터페이스를 제공합니다. 라라벨은 라라벨의 거의 모든 기능에 접근할 수 있는 다양한 파사드들을 기본으로 제공합니다.

라라벨 파사드는 서비스 컨테이너 내의 클래스들을 위한 "정적 프록시" 역할을 하며, 기존의 정적 메서드에 비해 더 테스트하기 쉽고, 유연성을 유지하면서도 간결하고 표현력 있는 문법을 제공합니다. 내부적으로 파사드가 어떻게 동작하는지 완전히 이해하지 못하더라도, 일단은 자연스럽게 사용하면서 라라벨의 학습을 이어가도 괜찮습니다.

라라벨에서 제공하는 모든 파사드는 `Illuminate\Support\Facades` 네임스페이스로 정의되어 있습니다. 따라서, 파사드는 다음과 같이 손쉽게 사용할 수 있습니다.

```
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;

Route::get('/cache', function () {
    return Cache::get('key');
});
```

라라벨 공식 문서 곳곳의 예제들은 프레임워크의 다양한 기능을 소개할 때 파사드를 활용하는 경우가 많습니다.

<a name="helper-functions"></a>
#### 헬퍼 함수

파사드를 보완하기 위해, 라라벨은 일반적으로 자주 쓰이는 라라벨 기능들과 쉽게 상호작용할 수 있게 도와주는 다양한 글로벌 "헬퍼 함수"도 제공합니다. 자주 사용되는 헬퍼 함수로는 `view`, `response`, `url`, `config` 등이 있으며, 그 외에도 다양한 함수가 존재합니다. 각각의 헬퍼 함수는 문서에서 해당 기능과 함께 설명되어 있지만, 전체 목록은 별도의 [헬퍼 함수 문서](/docs/8.x/helpers)에서 확인할 수 있습니다.

예를 들어, JSON 응답을 생성할 때 `Illuminate\Support\Facades\Response` 파사드를 사용하는 대신, 좀 더 간단하게 `response` 함수를 바로 사용할 수 있습니다. 헬퍼 함수는 전역에서 사용할 수 있으므로 클래스를 별도로 import하지 않아도 됩니다.

```
use Illuminate\Support\Facades\Response;

Route::get('/users', function () {
    return Response::json([
        // ...
    ]);
});

Route::get('/users', function () {
    return response()->json([
        // ...
    ]);
});
```

<a name="when-to-use-facades"></a>
## 파사드를 언제 사용해야 할까요?

파사드는 여러 강점을 가지고 있습니다. 우선 파사드는 간결하고 기억하기 쉬운 문법을 제공하므로, 긴 클래스명을 직접 주입하거나 별도로 설정할 필요 없이 라라벨의 다양한 기능을 바로 사용할 수 있게 해줍니다. 또한, PHP의 동적 메서드 특성을 활용하여 테스트하기도 쉽습니다.

하지만 파사드를 사용할 때 몇 가지 주의해야 할 점도 있습니다. 파사드 사용의 가장 큰 위험점은 클래스의 "역할 범위(scope)가 불필요하게 커질 수 있다"는 것입니다. 파사드는 사용이 편리하고 별도의 주입 없이도 쓸 수 있기 때문에, 한 클래스 안에 너무 많은 파사드를 계속해서 추가로 사용하게 되는 경우가 생길 수 있습니다. 반면, 의존성 주입을 사용할 경우에는 생성자에 주입받는 클래스가 많아질수록 시각적으로 '이 클래스가 너무 커지는구나'라는 피드백을 자연스럽게 받게 되어, 이러한 위험을 줄일 수 있습니다. 따라서, 파사드를 사용할 때는 클래스 크기와 책임이 너무 커지지 않도록 특별히 신경 써야 합니다. 만약 클래스가 너무 커지는 것 같다면, 더 작은 여러 클래스로 분리하는 것이 좋습니다.

<a name="facades-vs-dependency-injection"></a>
### 파사드 vs. 의존성 주입

의존성 주입이 제공하는 주요 장점 중 하나는 주입된 클래스의 구현체를 자유롭게 교체할 수 있다는 점입니다. 예를 들어, 테스트 시점에는 mock 객체나 stub을 주입해 메서드 호출 여부 등을 쉽게 검증할 수 있습니다.

일반적으로 진짜 정적 클래스 메서드는 mock이나 stub을 주입해서 테스트할 수 없습니다. 하지만, 라라벨의 파사드는 동적 메서드를 이용하여 서비스 컨테이너에서 객체를 꺼내 실제 인스턴스로 메서드를 위임하므로, 파사드 역시 주입된 클래스 인스턴스처럼 테스트할 수 있습니다. 예를 들어, 아래와 같은 라우트가 있을 때:

```
use Illuminate\Support\Facades\Cache;

Route::get('/cache', function () {
    return Cache::get('key');
});
```

라라벨의 파사드 테스트 기능을 이용해, `Cache::get` 메서드가 기대한 인수로 호출되었는지 다음과 같이 검증하는 테스트 코드를 작성할 수 있습니다.

```
use Illuminate\Support\Facades\Cache;

/**
 * A basic functional test example.
 *
 * @return void
 */
public function testBasicExample()
{
    Cache::shouldReceive('get')
         ->with('key')
         ->andReturn('value');

    $response = $this->get('/cache');

    $response->assertSee('value');
}
```

<a name="facades-vs-helper-functions"></a>
### 파사드 vs. 헬퍼 함수

파사드 외에도 라라벨은 뷰 생성, 이벤트 발생, 작업 디스패치, HTTP 응답 전송 등 다양한 작업을 쉽게 할 수 있는 "헬퍼 함수"도 포함하고 있습니다. 헬퍼 함수 대부분은 각자 대응되는 파사드와 동일한 역할을 수행합니다. 예를 들어, 아래 두 코드는 완전히 동일하게 동작합니다.

```
return Illuminate\Support\Facades\View::make('profile');

return view('profile');
```

실제로 파사드와 헬퍼 함수의 실질적인 차이는 전혀 없습니다. 헬퍼 함수를 사용할 때도 파사드와 동일하게 테스트 코드를 작성할 수 있습니다. 예를 들어, 다음과 같은 라우트가 있다고 가정해보겠습니다.

```
Route::get('/cache', function () {
    return cache('key');
});
```

실제로 `cache` 헬퍼 함수는 내부적으로 `Cache` 파사드를 감싼 클래스의 `get` 메서드를 호출합니다. 따라서, 헬퍼 함수를 사용하더라도 다음과 같이 해당 메서드가 기대한 인수로 호출되었는지 테스트할 수 있습니다.

```
use Illuminate\Support\Facades\Cache;

/**
 * A basic functional test example.
 *
 * @return void
 */
public function testBasicExample()
{
    Cache::shouldReceive('get')
         ->with('key')
         ->andReturn('value');

    $response = $this->get('/cache');

    $response->assertSee('value');
}
```

<a name="how-facades-work"></a>
## 파사드는 어떻게 동작하나요?

라라벨 애플리케이션에서 파사드는 서비스 컨테이너 내 객체에 접근하는 역할을 하는 클래스입니다. 이 작업을 가능하게 해주는 핵심 로직은 `Facade` 클래스 안에 구현되어 있습니다. 라라벨이 제공하는 모든 파사드 및 여러분이 직접 만드는 파사드는 모두 기본적으로 `Illuminate\Support\Facades\Facade` 클래스를 확장(extends)합니다.

`Facade` 기본 클래스는 PHP의 `__callStatic()` 매직 메서드를 활용하여, 파사드를 통해 호출된 모든 정적 메서드 호출을 서비스 컨테이너에서 꺼낸 객체로 위임(defer)합니다. 예를 들어, 아래 코드는 라라벨의 캐시 시스템을 호출합니다. 이 코드를 보면 `Cache` 클래스의 정적 `get` 메서드가 실행되는 것처럼 보이지만,

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Cache;

class UserController extends Controller
{
    /**
     * Show the profile for the given user.
     *
     * @param  int  $id
     * @return Response
     */
    public function showProfile($id)
    {
        $user = Cache::get('user:'.$id);

        return view('profile', ['user' => $user]);
    }
}
```

이 코드 상단에서 `Cache` 파사드를 "import"하고 있습니다. 이 파사드는 실제로는 `Illuminate\Contracts\Cache\Factory` 인터페이스의 구현체에 접근할 수 있도록 프록시 역할을 합니다. 파사드를 통해 호출된 모든 메서드는 라라벨의 캐시 서비스 인스턴스로 전달됩니다.

실제 `Illuminate\Support\Facades\Cache` 클래스를 살펴보면, 아래와 같이 정적 `get` 메서드가 정의되어 있지 않습니다.

```
class Cache extends Facade
{
    /**
     * Get the registered name of the component.
     *
     * @return string
     */
    protected static function getFacadeAccessor() { return 'cache'; }
}
```

대신, `Cache` 파사드는 기본 `Facade` 클래스를 확장하며, 오직 `getFacadeAccessor()` 메서드만을 정의합니다. 이 메서드는 서비스 컨테이너에 등록된 바인딩 이름을 반환하는 역할을 합니다. 사용자가 파사드를 통해 어떤 정적 메서드를 참조하면, 라라벨은 [서비스 컨테이너](/docs/8.x/container)에서 해당 바인딩(여기서는 `'cache'`)을 resolve하여 해당 객체의 메서드(여기서는 `get`)를 실제로 호출합니다.

<a name="real-time-facades"></a>
## 실시간(Real-Time) 파사드

실시간 파사드를 이용하면, 애플리케이션 안에 있는 어떤 클래스도 파사드처럼 사용할 수 있습니다. 먼저, 실시간 파사드를 사용하지 않은 일반적인 코드를 살펴보겠습니다. 예를 들어, `Podcast` 모델에 `publish` 메서드가 있다고 가정합니다. 그러나 팟캐스트를 게시하려면 `Publisher` 인스턴스를 메서드에 주입해야 합니다.

```
<?php

namespace App\Models;

use App\Contracts\Publisher;
use Illuminate\Database\Eloquent\Model;

class Podcast extends Model
{
    /**
     * Publish the podcast.
     *
     * @param  Publisher  $publisher
     * @return void
     */
    public function publish(Publisher $publisher)
    {
        $this->update(['publishing' => now()]);

        $publisher->publish($this);
    }
}
```

이렇게 퍼블리셔 구현체를 메서드에 주입하면, 각각의 호출에 대해 퍼블리셔 인스턴스를 직접 전달해줘야 하긴 하지만, 외부에서 mock 객체를 전달해 단위 테스트하기 쉬워집니다. 그러나 매번 인스턴스를 넘겨야 하는 번거로움이 존재합니다. 실시간 파사드를 이용하면, 이와 같은 테스트 용이성은 그대로 유지하면서도 퍼블리셔 인스턴스를 명시적으로 전달할 필요가 없게 됩니다. 실시간 파사드를 생성하려면 import하는 클래스의 네임스페이스에 `Facades`를 접두어로 붙이면 됩니다.

```
<?php

namespace App\Models;

use Facades\App\Contracts\Publisher;
use Illuminate\Database\Eloquent\Model;

class Podcast extends Model
{
    /**
     * Publish the podcast.
     *
     * @return void
     */
    public function publish()
    {
        $this->update(['publishing' => now()]);

        Publisher::publish($this);
    }
}
```

실시간 파사드를 사용하면, 퍼블리셔 구현체가 서비스 컨테이너에서 `Facades` 접두어 다음에 오는 인터페이스 또는 클래스 이름을 기반으로 resolve됩니다. 테스트 시에도 라라벨이 제공하는 내장 파사드 테스트 헬퍼를 그대로 사용할 수 있어, 다음과 같이 호출을 mock 처리할 수 있습니다.

```
<?php

namespace Tests\Feature;

use App\Models\Podcast;
use Facades\App\Contracts\Publisher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PodcastTest extends TestCase
{
    use RefreshDatabase;

    /**
     * A test example.
     *
     * @return void
     */
    public function test_podcast_can_be_published()
    {
        $podcast = Podcast::factory()->create();

        Publisher::shouldReceive('publish')->once()->with($podcast);

        $podcast->publish();
    }
}
```

<a name="facade-class-reference"></a>
## 파사드 클래스 레퍼런스

아래는 각 파사드와 그에 대응하는 실제 클래스, 그리고(해당되는 경우) 서비스 컨테이너 바인딩 키의 목록입니다. 특정 파사드의 루트 클래스가 궁금할 때 쉽고 빠르게 확인할 수 있습니다. [서비스 컨테이너 바인딩](/docs/8.x/container) 키도 함께 참고 가능합니다.

파사드  |  클래스  |  서비스 컨테이너 바인딩
------------- | ------------- | -------------
App  |  [Illuminate\Foundation\Application](https://laravel.com/api/8.x/Illuminate/Foundation/Application.html)  |  `app`
Artisan  |  [Illuminate\Contracts\Console\Kernel](https://laravel.com/api/8.x/Illuminate/Contracts/Console/Kernel.html)  |  `artisan`
Auth  |  [Illuminate\Auth\AuthManager](https://laravel.com/api/8.x/Illuminate/Auth/AuthManager.html)  |  `auth`
Auth (Instance)  |  [Illuminate\Contracts\Auth\Guard](https://laravel.com/api/8.x/Illuminate/Contracts/Auth/Guard.html)  |  `auth.driver`
Blade  |  [Illuminate\View\Compilers\BladeCompiler](https://laravel.com/api/8.x/Illuminate/View/Compilers/BladeCompiler.html)  |  `blade.compiler`
Broadcast  |  [Illuminate\Contracts\Broadcasting\Factory](https://laravel.com/api/8.x/Illuminate/Contracts/Broadcasting/Factory.html)  |  &nbsp;
Broadcast (Instance)  |  [Illuminate\Contracts\Broadcasting\Broadcaster](https://laravel.com/api/8.x/Illuminate/Contracts/Broadcasting/Broadcaster.html)  |  &nbsp;
Bus  |  [Illuminate\Contracts\Bus\Dispatcher](https://laravel.com/api/8.x/Illuminate/Contracts/Bus/Dispatcher.html)  |  &nbsp;
Cache  |  [Illuminate\Cache\CacheManager](https://laravel.com/api/8.x/Illuminate/Cache/CacheManager.html)  |  `cache`
Cache (Instance)  |  [Illuminate\Cache\Repository](https://laravel.com/api/8.x/Illuminate/Cache/Repository.html)  |  `cache.store`
Config  |  [Illuminate\Config\Repository](https://laravel.com/api/8.x/Illuminate/Config/Repository.html)  |  `config`
Cookie  |  [Illuminate\Cookie\CookieJar](https://laravel.com/api/8.x/Illuminate/Cookie/CookieJar.html)  |  `cookie`
Crypt  |  [Illuminate\Encryption\Encrypter](https://laravel.com/api/8.x/Illuminate/Encryption/Encrypter.html)  |  `encrypter`
Date  |  [Illuminate\Support\DateFactory](https://laravel.com/api/8.x/Illuminate/Support/DateFactory.html)  |  `date`
DB  |  [Illuminate\Database\DatabaseManager](https://laravel.com/api/8.x/Illuminate/Database/DatabaseManager.html)  |  `db`
DB (Instance)  |  [Illuminate\Database\Connection](https://laravel.com/api/8.x/Illuminate/Database/Connection.html)  |  `db.connection`
Event  |  [Illuminate\Events\Dispatcher](https://laravel.com/api/8.x/Illuminate/Events/Dispatcher.html)  |  `events`
File  |  [Illuminate\Filesystem\Filesystem](https://laravel.com/api/8.x/Illuminate/Filesystem/Filesystem.html)  |  `files`
Gate  |  [Illuminate\Contracts\Auth\Access\Gate](https://laravel.com/api/8.x/Illuminate/Contracts/Auth/Access/Gate.html)  |  &nbsp;
Hash  |  [Illuminate\Contracts\Hashing\Hasher](https://laravel.com/api/8.x/Illuminate/Contracts/Hashing/Hasher.html)  |  `hash`
Http  |  [Illuminate\Http\Client\Factory](https://laravel.com/api/8.x/Illuminate/Http/Client/Factory.html)  |  &nbsp;
Lang  |  [Illuminate\Translation\Translator](https://laravel.com/api/8.x/Illuminate/Translation/Translator.html)  |  `translator`
Log  |  [Illuminate\Log\LogManager](https://laravel.com/api/8.x/Illuminate/Log/LogManager.html)  |  `log`
Mail  |  [Illuminate\Mail\Mailer](https://laravel.com/api/8.x/Illuminate/Mail/Mailer.html)  |  `mailer`
Notification  |  [Illuminate\Notifications\ChannelManager](https://laravel.com/api/8.x/Illuminate/Notifications/ChannelManager.html)  |  &nbsp;
Password  |  [Illuminate\Auth\Passwords\PasswordBrokerManager](https://laravel.com/api/8.x/Illuminate/Auth/Passwords/PasswordBrokerManager.html)  |  `auth.password`
Password (Instance)  |  [Illuminate\Auth\Passwords\PasswordBroker](https://laravel.com/api/8.x/Illuminate/Auth/Passwords/PasswordBroker.html)  |  `auth.password.broker`
Queue  |  [Illuminate\Queue\QueueManager](https://laravel.com/api/8.x/Illuminate/Queue/QueueManager.html)  |  `queue`
Queue (Instance)  |  [Illuminate\Contracts\Queue\Queue](https://laravel.com/api/8.x/Illuminate/Contracts/Queue/Queue.html)  |  `queue.connection`
Queue (Base Class)  |  [Illuminate\Queue\Queue](https://laravel.com/api/8.x/Illuminate/Queue/Queue.html)  |  &nbsp;
Redirect  |  [Illuminate\Routing\Redirector](https://laravel.com/api/8.x/Illuminate/Routing/Redirector.html)  |  `redirect`
Redis  |  [Illuminate\Redis\RedisManager](https://laravel.com/api/8.x/Illuminate/Redis/RedisManager.html)  |  `redis`
Redis (Instance)  |  [Illuminate\Redis\Connections\Connection](https://laravel.com/api/8.x/Illuminate/Redis/Connections/Connection.html)  |  `redis.connection`
Request  |  [Illuminate\Http\Request](https://laravel.com/api/8.x/Illuminate/Http/Request.html)  |  `request`
Response  |  [Illuminate\Contracts\Routing\ResponseFactory](https://laravel.com/api/8.x/Illuminate/Contracts/Routing/ResponseFactory.html)  |  &nbsp;
Response (Instance)  |  [Illuminate\Http\Response](https://laravel.com/api/8.x/Illuminate/Http/Response.html)  |  &nbsp;
Route  |  [Illuminate\Routing\Router](https://laravel.com/api/8.x/Illuminate/Routing/Router.html)  |  `router`
Schema  |  [Illuminate\Database\Schema\Builder](https://laravel.com/api/8.x/Illuminate/Database/Schema/Builder.html)  |  &nbsp;
Session  |  [Illuminate\Session\SessionManager](https://laravel.com/api/8.x/Illuminate/Session/SessionManager.html)  |  `session`
Session (Instance)  |  [Illuminate\Session\Store](https://laravel.com/api/8.x/Illuminate/Session/Store.html)  |  `session.store`
Storage  |  [Illuminate\Filesystem\FilesystemManager](https://laravel.com/api/8.x/Illuminate/Filesystem/FilesystemManager.html)  |  `filesystem`
Storage (Instance)  |  [Illuminate\Contracts\Filesystem\Filesystem](https://laravel.com/api/8.x/Illuminate/Contracts/Filesystem/Filesystem.html)  |  `filesystem.disk`
URL  |  [Illuminate\Routing\UrlGenerator](https://laravel.com/api/8.x/Illuminate/Routing/UrlGenerator.html)  |  `url`
Validator  |  [Illuminate\Validation\Factory](https://laravel.com/api/8.x/Illuminate/Validation/Factory.html)  |  `validator`
Validator (Instance)  |  [Illuminate\Validation\Validator](https://laravel.com/api/8.x/Illuminate/Validation/Validator.html)  |  &nbsp;
View  |  [Illuminate\View\Factory](https://laravel.com/api/8.x/Illuminate/View/Factory.html)  |  `view`
View (Instance)  |  [Illuminate\View\View](https://laravel.com/api/8.x/Illuminate/View/View.html)  |  &nbsp;
