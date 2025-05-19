# 파사드 (Facades)

- [소개](#introduction)
- [파사드를 언제 사용할 것인가](#when-to-use-facades)
    - [파사드와 의존성 주입](#facades-vs-dependency-injection)
    - [파사드와 헬퍼 함수](#facades-vs-helper-functions)
- [파사드가 동작하는 방식](#how-facades-work)
- [실시간(Real-Time) 파사드](#real-time-facades)
- [파사드 클래스 레퍼런스](#facade-class-reference)

<a name="introduction"></a>
## 소개

라라벨 공식 문서 전반에 걸쳐, 라라벨의 다양한 기능을 "파사드(facade)"를 통해 사용하는 코드 예제를 자주 보게 됩니다. 파사드는 애플리케이션의 [서비스 컨테이너](/docs/9.x/container)에서 사용할 수 있는 클래스에 "정적(static)" 인터페이스를 제공합니다. 라라벨은 거의 모든 핵심 기능에 접근할 수 있도록 다양한 파사드를 기본으로 제공하고 있습니다.

라라벨 파사드는 서비스 컨테이너 내부 클래스에 대한 "정적 프록시" 역할을 하며, 전통적인 정적 메서드에 비해 테스트 가능성과 유연성은 그대로 유지하면서 더욱 간결하고 표현력 있는 문법을 사용할 수 있게 해줍니다. 파사드가 정확히 어떻게 작동하는지 아직 완전히 이해하지 못해도 괜찮으니 우선 계속 라라벨을 학습해 나가시기 바랍니다.

라라벨의 모든 파사드는 `Illuminate\Support\Facades` 네임스페이스에 정의되어 있습니다. 파사드는 아래처럼 쉽게 사용할 수 있습니다.

```
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;

Route::get('/cache', function () {
    return Cache::get('key');
});
```

라라벨 공식 문서에서는 프레임워크의 다양한 기능을 보여주기 위해 파사드를 활용한 예시가 자주 사용됩니다.

<a name="helper-functions"></a>
#### 헬퍼 함수

파사드와 더불어, 라라벨은 주요 기능을 더 쉽게 사용할 수 있도록 다양한 전역 "헬퍼 함수"도 제공합니다. 자주 사용되는 헬퍼 함수로는 `view`, `response`, `url`, `config` 등이 있습니다. 각 헬퍼 함수는 관련 기능 문서에서 개별적으로 설명되어 있지만, 전체 목록은 별도의 [헬퍼 함수 공식 문서](/docs/9.x/helpers)에서 확인할 수 있습니다.

예를 들어, JSON 응답을 만들 때 굳이 `Illuminate\Support\Facades\Response` 파사드를 사용할 필요 없이 `response` 헬퍼 함수를 바로 사용할 수 있습니다. 헬퍼 함수는 전역적으로 사용할 수 있기 때문에, 별도로 클래스를 임포트하거나 준비할 필요도 없습니다.

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
## 파사드를 언제 사용할 것인가

파사드는 다양한 장점을 가지고 있습니다. 가장 큰 장점 중 하나는 복잡한 클래스명을 일일이 기억하거나 직접 등록/주입하지 않아도 라라벨의 기능을 빠르고 간결하게 사용할 수 있다는 점입니다. 또한 PHP의 동적 메서드(dynamic method) 활용 방식 덕분에 테스트도 더욱 용이합니다.

하지만 파사드 사용 시 주의점도 있습니다. 파사드를 너무 간편하게 쓸 수 있기 때문에, 별다른 의존성 주입 없이도 손쉽게 다양한 파사드를 한 클래스에 잔뜩 넣게 되는 "책임 범위(scope)" 확장 문제가 발생할 수 있습니다. 반면 의존성 주입을 사용할 때는 생성자가 길어지는 등 시각적으로 클래스가 지나치게 커지고 있음을 쉽게 감지할 수 있습니다. 따라서 파사드를 사용할 때도 하나의 클래스가 너무 많은 역할을 하지는 않는지 주의 깊게 점검하고, 클래스가 너무 커진다면 작은 단위로 나누는 것이 좋습니다.

<a name="facades-vs-dependency-injection"></a>
### 파사드와 의존성 주입

의존성 주입(Dependency Injection)의 가장 큰 장점 중 하나는, 주입받는 클래스의 구현을 쉽게 교체할 수 있다는 점입니다. 특히 테스트 환경에서는, 실제 클래스 대신 목(mock)이나 스텁(stub) 객체를 주입해 해당 메서드가 올바르게 호출되는지 검증하기 쉬워집니다.

전통적인 정적(static) 클래스 메서드는 목(mock)이나 스텁을 사용해 테스트하기 어렵지만, 파사드는 서비스 컨테이너에서 객체를 동적으로 꺼내 메서드를 위임하기 때문에, 실제 주입받은 클래스 인스턴스를 테스트하듯이 파사드 역시 동일하게 테스트 가능합니다. 예를 들어, 아래와 같은 경로(Route)가 있다고 가정해봅시다.

```
use Illuminate\Support\Facades\Cache;

Route::get('/cache', function () {
    return Cache::get('key');
});
```

라라벨이 제공하는 파사드 테스트 메서드를 활용하면, `Cache::get` 메서드가 우리가 기대한 인수로 호출되는지 아래와 같이 쉽게 검증할 수 있습니다.

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
### 파사드와 헬퍼 함수

파사드 외에도, 라라벨은 뷰 생성, 이벤트 발생, 작업 디스패치, HTTP 응답 전송 등 주요 기능을 수행하는 다양한 "헬퍼 함수"도 내장하고 있습니다. 이 중 상당수 헬퍼 함수는 대응되는 파사드와 같은 동작을 합니다. 예를 들어, 아래 두 코드는 같은 역할을 합니다.

```
return Illuminate\Support\Facades\View::make('profile');

return view('profile');
```

파사드와 헬퍼 함수는 실질적으로 차이가 없습니다. 헬퍼 함수를 사용하더라도, 테스트에서는 파사드와 똑같이 테스트할 수 있습니다. 예를 들어, 아래 라우트(Route)에서는:

```
Route::get('/cache', function () {
    return cache('key');
});
```

`cache` 헬퍼 함수는 내부적으로 `Cache` 파사드가 감싸고 있는 클래스의 `get` 메서드를 호출하게 됩니다. 따라서 헬퍼 함수를 사용하더라도, 기대한 인수로 메서드가 호출되는지 아래처럼 테스트할 수 있습니다.

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
## 파사드가 동작하는 방식

라라벨 애플리케이션에서, 파사드는 컨테이너에 등록된 객체에 접근할 수 있도록 하는 클래스입니다. 이 동작을 가능하게 하는 핵심은 `Facade` 클래스에 있습니다. 라라벨의 모든 파사드, 그리고 여러분이 만드는 커스텀 파사드는 기본적으로 `Illuminate\Support\Facades\Facade` 클래스를 상속합니다.

`Facade` 기본 클래스는 PHP의 매직 메서드인 `__callStatic()`을 활용하여, 파사드에 호출된 모든 메서드 요청을 서비스 컨테이너에서 꺼낸 실제 객체로 위임합니다. 아래 예시 코드를 보면, 라라벨의 캐시 시스템에 메서드를 호출하는 코드가 있습니다. 언뜻 보기에는 `Cache` 클래스에서 정적 메서드로 `get`을 바로 호출하는 것처럼 보입니다.

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

파일 상단에 `Cache` 파사드를 임포트(import)하는 부분을 확인할 수 있습니다. 이 파사드는 사실 `Illuminate\Contracts\Cache\Factory` 인터페이스의 구현체에 접근하기 위한 프록시 역할을 합니다. 파사드를 통해 호출하는 모든 메서드는 라라벨 캐시 서비스의 실제 인스턴스로 전달되어 실행됩니다.

실제로 `Illuminate\Support\Facades\Cache` 클래스를 살펴보면, `get`이라는 정적 메서드는 존재하지 않습니다.

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

여기서 주목할 점은 `Cache` 파사드가 기본 `Facade` 클래스를 확장하고, `getFacadeAccessor()`라는 메서드를 구현하고 있다는 것입니다. 이 메서드는 서비스 컨테이너에 등록된 바인딩 이름을 반환합니다. 사용자가 `Cache` 파사드의 어떤 메서드든 호출하면, 라라벨은 서비스 컨테이너에서 `'cache'` 바인딩을 찾아 해당 객체의(여기서는 `get`) 메서드를 실행하게 됩니다. 보다 자세한 작동 원리는 [서비스 컨테이너 공식 문서](/docs/9.x/container)에서 확인할 수 있습니다.

<a name="real-time-facades"></a>
## 실시간(Real-Time) 파사드

실시간(Real-Time) 파사드를 이용하면, 여러분 애플리케이션 내의 어느 클래스든 마치 파사드처럼 사용할 수 있습니다. 우선 아래에 실시간 파사드를 사용하지 않은 기존 코드 예시를 살펴보겠습니다. 예를 들어, `Podcast` 모델에 `publish`라는 메서드가 있다고 가정합시다. 이 때 실제로 팟캐스트를 발행(publish)하려면 `Publisher` 인스턴스를 의존성 주입해야 합니다.

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

Publisher 구현체를 메서드에 주입하면 해당 메서드를 별도로 격리해서(test isolation) 테스트할 때 매우 유용합니다. 왜냐하면 Publisher를 mock 객체로 주입해 자유롭게 동작을 제어할 수 있기 때문입니다. 하지만 이 방식의 단점은 publish 메서드를 호출할 때마다 항상 Publisher 인스턴스를 인수로 넘겨줘야 한다는 점입니다. 실시간 파사드를 사용하면, 테스트 용이성(testability)은 그대로 유지하면서도 Publisher 인스턴스를 명시적으로 전달할 필요가 없어집니다. 실시간 파사드로 만들고 싶다면 임포트(import) 문에서 네임스페이스 앞에 `Facades`를 붙이면 됩니다.

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

실시간 파사드를 사용하면, Publisher 구현체는 클래스 또는 인터페이스 명에서 `Facades` 접두사 뒤에 오는 이름 부분을 바탕으로 서비스 컨테이너에서 자동으로 해결(resolved)됩니다. 또한 테스트할 때도 라라벨이 제공하는 파사드용 테스트 헬퍼를 사용해서 간단하게 mock 처리를 할 수 있습니다.

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

아래 표는 모든 기본 파사드와 해당 파사드가 감싸고 있는 실제 클래스, 그리고 해당되는 경우 서비스 컨테이너 바인딩 키를 정리한 것입니다. 각 파사드가 어떤 기능을 담당하고 있는지, 그리고 API 문서를 빠르게 찾아보는 데 참고할 수 있습니다. [서비스 컨테이너 바인딩](/docs/9.x/container) 키도 함께 안내되어 있습니다.

| 파사드 | 클래스 | 서비스 컨테이너 바인딩 |
|-------------|-------------|-------------|
| App  |  [Illuminate\Foundation\Application](https://laravel.com/api/9.x/Illuminate/Foundation/Application.html)  |  `app` |
| Artisan  |  [Illuminate\Contracts\Console\Kernel](https://laravel.com/api/9.x/Illuminate/Contracts/Console/Kernel.html)  |  `artisan` |
| Auth  |  [Illuminate\Auth\AuthManager](https://laravel.com/api/9.x/Illuminate/Auth/AuthManager.html)  |  `auth` |
| Auth (Instance)  |  [Illuminate\Contracts\Auth\Guard](https://laravel.com/api/9.x/Illuminate/Contracts/Auth/Guard.html)  |  `auth.driver` |
| Blade  |  [Illuminate\View\Compilers\BladeCompiler](https://laravel.com/api/9.x/Illuminate/View/Compilers/BladeCompiler.html)  |  `blade.compiler` |
| Broadcast  |  [Illuminate\Contracts\Broadcasting\Factory](https://laravel.com/api/9.x/Illuminate/Contracts/Broadcasting/Factory.html)  |  &nbsp; |
| Broadcast (Instance)  |  [Illuminate\Contracts\Broadcasting\Broadcaster](https://laravel.com/api/9.x/Illuminate/Contracts/Broadcasting/Broadcaster.html)  |  &nbsp; |
| Bus  |  [Illuminate\Contracts\Bus\Dispatcher](https://laravel.com/api/9.x/Illuminate/Contracts/Bus/Dispatcher.html)  |  &nbsp; |
| Cache  |  [Illuminate\Cache\CacheManager](https://laravel.com/api/9.x/Illuminate/Cache/CacheManager.html)  |  `cache` |
| Cache (Instance)  |  [Illuminate\Cache\Repository](https://laravel.com/api/9.x/Illuminate/Cache/Repository.html)  |  `cache.store` |
| Config  |  [Illuminate\Config\Repository](https://laravel.com/api/9.x/Illuminate/Config/Repository.html)  |  `config` |
| Cookie  |  [Illuminate\Cookie\CookieJar](https://laravel.com/api/9.x/Illuminate/Cookie/CookieJar.html)  |  `cookie` |
| Crypt  |  [Illuminate\Encryption\Encrypter](https://laravel.com/api/9.x/Illuminate/Encryption/Encrypter.html)  |  `encrypter` |
| Date  |  [Illuminate\Support\DateFactory](https://laravel.com/api/9.x/Illuminate/Support/DateFactory.html)  |  `date` |
| DB  |  [Illuminate\Database\DatabaseManager](https://laravel.com/api/9.x/Illuminate/Database/DatabaseManager.html)  |  `db` |
| DB (Instance)  |  [Illuminate\Database\Connection](https://laravel.com/api/9.x/Illuminate/Database/Connection.html)  |  `db.connection` |
| Event  |  [Illuminate\Events\Dispatcher](https://laravel.com/api/9.x/Illuminate/Events/Dispatcher.html)  |  `events` |
| File  |  [Illuminate\Filesystem\Filesystem](https://laravel.com/api/9.x/Illuminate/Filesystem/Filesystem.html)  |  `files` |
| Gate  |  [Illuminate\Contracts\Auth\Access\Gate](https://laravel.com/api/9.x/Illuminate/Contracts/Auth/Access/Gate.html)  |  &nbsp; |
| Hash  |  [Illuminate\Contracts\Hashing\Hasher](https://laravel.com/api/9.x/Illuminate/Contracts/Hashing/Hasher.html)  |  `hash` |
| Http  |  [Illuminate\Http\Client\Factory](https://laravel.com/api/9.x/Illuminate/Http/Client/Factory.html)  |  &nbsp; |
| Lang  |  [Illuminate\Translation\Translator](https://laravel.com/api/9.x/Illuminate/Translation/Translator.html)  |  `translator` |
| Log  |  [Illuminate\Log\LogManager](https://laravel.com/api/9.x/Illuminate/Log/LogManager.html)  |  `log` |
| Mail  |  [Illuminate\Mail\Mailer](https://laravel.com/api/9.x/Illuminate/Mail/Mailer.html)  |  `mailer` |
| Notification  |  [Illuminate\Notifications\ChannelManager](https://laravel.com/api/9.x/Illuminate/Notifications/ChannelManager.html)  |  &nbsp; |
| Password  |  [Illuminate\Auth\Passwords\PasswordBrokerManager](https://laravel.com/api/9.x/Illuminate/Auth/Passwords/PasswordBrokerManager.html)  |  `auth.password` |
| Password (Instance)  |  [Illuminate\Auth\Passwords\PasswordBroker](https://laravel.com/api/9.x/Illuminate/Auth/Passwords/PasswordBroker.html)  |  `auth.password.broker` |
| Queue  |  [Illuminate\Queue\QueueManager](https://laravel.com/api/9.x/Illuminate/Queue/QueueManager.html)  |  `queue` |
| Queue (Instance)  |  [Illuminate\Contracts\Queue\Queue](https://laravel.com/api/9.x/Illuminate/Contracts/Queue/Queue.html)  |  `queue.connection` |
| Queue (Base Class)  |  [Illuminate\Queue\Queue](https://laravel.com/api/9.x/Illuminate/Queue/Queue.html)  |  &nbsp; |
| Redirect  |  [Illuminate\Routing\Redirector](https://laravel.com/api/9.x/Illuminate/Routing/Redirector.html)  |  `redirect` |
| Redis  |  [Illuminate\Redis\RedisManager](https://laravel.com/api/9.x/Illuminate/Redis/RedisManager.html)  |  `redis` |
| Redis (Instance)  |  [Illuminate\Redis\Connections\Connection](https://laravel.com/api/9.x/Illuminate/Redis/Connections/Connection.html)  |  `redis.connection` |
| Request  |  [Illuminate\Http\Request](https://laravel.com/api/9.x/Illuminate/Http/Request.html)  |  `request` |
| Response  |  [Illuminate\Contracts\Routing\ResponseFactory](https://laravel.com/api/9.x/Illuminate/Contracts/Routing/ResponseFactory.html)  |  &nbsp; |
| Response (Instance)  |  [Illuminate\Http\Response](https://laravel.com/api/9.x/Illuminate/Http/Response.html)  |  &nbsp; |
| Route  |  [Illuminate\Routing\Router](https://laravel.com/api/9.x/Illuminate/Routing/Router.html)  |  `router` |
| Schema  |  [Illuminate\Database\Schema\Builder](https://laravel.com/api/9.x/Illuminate/Database/Schema/Builder.html)  |  &nbsp; |
| Session  |  [Illuminate\Session\SessionManager](https://laravel.com/api/9.x/Illuminate/Session/SessionManager.html)  |  `session` |
| Session (Instance)  |  [Illuminate\Session\Store](https://laravel.com/api/9.x/Illuminate/Session/Store.html)  |  `session.store` |
| Storage  |  [Illuminate\Filesystem\FilesystemManager](https://laravel.com/api/9.x/Illuminate/Filesystem/FilesystemManager.html)  |  `filesystem` |
| Storage (Instance)  |  [Illuminate\Contracts\Filesystem\Filesystem](https://laravel.com/api/9.x/Illuminate/Contracts/Filesystem/Filesystem.html)  |  `filesystem.disk` |
| URL  |  [Illuminate\Routing\UrlGenerator](https://laravel.com/api/9.x/Illuminate/Routing/UrlGenerator.html)  |  `url` |
| Validator  |  [Illuminate\Validation\Factory](https://laravel.com/api/9.x/Illuminate/Validation/Factory.html)  |  `validator` |
| Validator (Instance)  |  [Illuminate\Validation\Validator](https://laravel.com/api/9.x/Illuminate/Validation/Validator.html)  |  &nbsp; |
| View  |  [Illuminate\View\Factory](https://laravel.com/api/9.x/Illuminate/View/Factory.html)  |  `view` |
| View (Instance)  |  [Illuminate\View\View](https://laravel.com/api/9.x/Illuminate/View/View.html)  |  &nbsp; |
| Vite  |  [Illuminate\Foundation\Vite](https://laravel.com/api/9.x/Illuminate/Foundation/Vite.html)  |  &nbsp; |