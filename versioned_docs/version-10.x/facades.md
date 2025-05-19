# 파사드 (Facades)

- [소개](#introduction)
- [파사드를 언제 활용해야 하는가](#when-to-use-facades)
    - [파사드 vs. 의존성 주입](#facades-vs-dependency-injection)
    - [파사드 vs. 헬퍼 함수](#facades-vs-helper-functions)
- [파사드는 어떻게 동작하는가](#how-facades-work)
- [실시간 파사드(Real-Time Facades)](#real-time-facades)
- [파사드 클래스 레퍼런스](#facade-class-reference)

<a name="introduction"></a>
## 소개

라라벨 공식 문서 전반에서는 "파사드"를 통해 라라벨의 다양한 기능을 사용하는 코드 예제들이 자주 등장합니다. 파사드는 애플리케이션의 [서비스 컨테이너](/docs/10.x/container)에 등록된 클래스들에 대해 "정적" 인터페이스를 제공합니다. 라라벨은 거의 모든 주요 기능에 접근할 수 있도록 다양한 파사드를 기본 제공하고 있습니다.

라라벨의 파사드는 서비스 컨테이너에 바인딩된 실제 클래스들에 대한 "정적 프록시" 역할을 하며, 간결하고 표현력 있는 문법의 이점을 제공하는 동시에, 전통적인 정적 메서드 방식보다 테스트와 유연성을 더 높여줍니다. 만약 파사드가 어떻게 동작하는지 아직 완전히 이해하지 못해도 전혀 문제되지 않습니다. 일단은 자연스럽게 활용해가며 라라벨을 배워 나가면 됩니다.

라라벨의 모든 파사드는 `Illuminate\Support\Facades` 네임스페이스에 정의되어 있습니다. 따라서 다음과 같이 파사드를 쉽게 사용할 수 있습니다.

```
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;

Route::get('/cache', function () {
    return Cache::get('key');
});
```

라라벨 공식 문서의 다양한 예제에서 파사드를 활용하여 프레임워크의 여러 기능을 설명하고 있습니다.

<a name="helper-functions"></a>
#### 헬퍼 함수

파사드를 보완하기 위해 라라벨은 다양한 글로벌 "헬퍼 함수"도 제공합니다. 이 함수들은 라라벨의 주요 기능을 더욱 쉽게 사용할 수 있도록 도와줍니다. 자주 쓰이는 헬퍼 함수로는 `view`, `response`, `url`, `config` 등 여러 가지가 있습니다. 각 헬퍼 함수는 해당 기능과 연동되는 공식 문서에도 예제가 있으며, 모든 헬퍼 함수 목록은 별도의 [헬퍼 함수 문서](/docs/10.x/helpers)에서 확인할 수 있습니다.

예를 들어, `Illuminate\Support\Facades\Response` 파사드를 이용하여 JSON 응답을 생성하는 대신, 단순하게 `response` 함수를 사용할 수도 있습니다. 헬퍼 함수는 전역적으로 사용 가능하기 때문에, 별도의 클래스 임포트 없이도 바로 쓸 수 있습니다.

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
## 파사드를 언제 활용해야 하는가

파사드는 여러 가지 장점이 있습니다. 복잡한 클래스 이름을 일일이 기억하거나 주입/설정할 필요 없이 라라벨의 다양한 기능을 간결하고 읽기 쉬운 문법으로 사용할 수 있습니다. 그리고 PHP의 동적 메서드 방식을 활용한 덕분에 테스트하기도 쉽습니다.

하지만 파사드 사용 시 주의해야 할 점도 있습니다. 주된 위험 중 하나는 클래스의 "기능 범위가 점점 커지는 현상"입니다. 파사드가 너무 편하게 사용되다 보니, 한 클래스 안에서 점점 더 많은 파사드를 사용하게 되고, 클래스가 비대해지기 쉽습니다. 의존성 주입을 쓸 때는 생성자의 길이가 늘어나면서 클래스가 과도하게 커졌음을 쉽게 알 수 있고, 이를 통해 적절히 책임을 분리할 수 있습니다. 하지만 파사드는 이런 경고 신호가 없기 때문에, 클래스를 작성할 때 항상 클래스의 크기와 목적이 적당한지 특별히 신경 써야 합니다. 만약 한 클래스가 너무 복잡하다면, 여러 개의 작은 클래스로 분리해서 관리하는 것이 좋습니다.

<a name="facades-vs-dependency-injection"></a>
### 파사드 vs. 의존성 주입

의존성 주입의 가장 큰 장점 중 하나는 주입된 클래스의 구현체를 교체할 수 있다는 점입니다. 이는 주로 테스트할 때 유용하게 쓰입니다. 예를 들어, 테스트 중에는 실제 구현체 대신 mock(목 객체)이나 stub(스텁 객체)를 주입하여, 특정 메서드가 제대로 호출되는지 쉽게 검증할 수 있습니다.

일반적으로는 순수한 정적 클래스의 메서드는 mock이나 stub으로 대체할 수 없습니다. 하지만 파사드는 동적 메서드 호출을 서비스 컨테이너에서 객체를 해결해서 실행하기 때문에, 실제로 파사드도 의존성 주입한 객체와 동일한 방식으로 테스트 가능합니다. 예를 들어, 다음과 같은 라우트가 있다고 가정하면:

```
use Illuminate\Support\Facades\Cache;

Route::get('/cache', function () {
    return Cache::get('key');
});
```

라라벨의 파사드 테스트 헬퍼를 이용해서, 아래와 같이 `Cache::get` 메서드가 예상한 인수로 호출되었는지 테스트할 수 있습니다.

```
use Illuminate\Support\Facades\Cache;

/**
 * A basic functional test example.
 */
public function test_basic_example(): void
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

파사드 외에도, 라라벨은 뷰 생성, 이벤트 실행, 작업 디스패치, HTTP 응답 반환 등 다양한 기능을 처리하는 "헬퍼 함수"를 제공합니다. 이러한 헬퍼 함수 중 다수는 동일한 기능을 수행하는 파사드와 짝을 이루고 있습니다. 예를 들어, 아래 두 코드는 완전히 동일하게 동작합니다.

```
return Illuminate\Support\Facades\View::make('profile');

return view('profile');
```

실제로 파사드와 헬퍼 함수 간에는 실질적인 차이가 전혀 없습니다. 헬퍼 함수를 사용할 경우에도 파사드와 동일한 방식으로 테스트할 수 있습니다. 예를 들어, 아래와 같은 라우트가 있다고 할 때:

```
Route::get('/cache', function () {
    return cache('key');
});
```

`cache` 헬퍼 함수는 내부적으로 `Cache` 파사드의 실제 클래스에 있는 `get` 메서드를 호출합니다. 즉, 헬퍼 함수를 사용해도 다음과 같이 메서드 호출 여부를 테스트할 수 있습니다.

```
use Illuminate\Support\Facades\Cache;

/**
 * A basic functional test example.
 */
public function test_basic_example(): void
{
    Cache::shouldReceive('get')
         ->with('key')
         ->andReturn('value');

    $response = $this->get('/cache');

    $response->assertSee('value');
}
```

<a name="how-facades-work"></a>
## 파사드는 어떻게 동작하는가

라라벨 애플리케이션에서 파사드는 컨테이너에 등록된 객체에 접근하는 역할을 합니다. 이를 가능하게 하는 핵심은 `Facade` 클래스에 있습니다. 라라벨의 모든 기본 파사드 및 커스텀 파사드는 기본적으로 `Illuminate\Support\Facades\Facade` 클래스를 확장(extends)합니다.

`Facade` 기본 클래스는 PHP의 매직 메서드인 `__callStatic()`을 활용하여, 파사드를 통한 메서드 호출을 서비스 컨테이너에서 해결된 객체로 위임합니다. 아래 예제는 라라벨의 캐시(Cache) 시스템을 사용하는 코드입니다. 이 코드를 보면 마치 `Cache` 클래스에서 정적 메서드 `get`을 호출하는 것처럼 보이지만

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Cache;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * Show the profile for the given user.
     */
    public function showProfile(string $id): View
    {
        $user = Cache::get('user:'.$id);

        return view('profile', ['user' => $user]);
    }
}
```

파일 상단에서 `Cache` 파사드를 "import"해서 쓴 것을 확인할 수 있습니다. 이 파사드는 내부적으로 `Illuminate\Contracts\Cache\Factory` 인터페이스의 실제 구현체에 접근하기 위한 프록시 역할을 합니다. 파사드를 통해 호출된 모든 메서드는 실제 라라벨의 캐시 서비스 인스턴스로 전달됩니다.

`Illuminate\Support\Facades\Cache` 클래스를 살펴보면, `get`이라는 정적 메서드는 실제로 존재하지 않습니다.

```
class Cache extends Facade
{
    /**
     * Get the registered name of the component.
     */
    protected static function getFacadeAccessor(): string
    {
        return 'cache';
    }
}
```

대신, `Cache` 파사드는 기본 `Facade` 클래스를 확장하면서 `getFacadeAccessor()`라는 메서드를 정의합니다. 이 메서드는 서비스 컨테이너에서 바인딩된 컴포넌트의 이름을 반환하는 역할을 합니다. 사용자가 `Cache` 파사드에 정적 메서드 호출을 할 때마다, 라라벨은 [서비스 컨테이너](/docs/10.x/container)에서 `cache` 바인딩을 해결하고, 해당 객체에서 요청한 메서드(위 예제에서는 `get`)를 실제로 실행합니다.

<a name="real-time-facades"></a>
## 실시간 파사드(Real-Time Facades)

실시간 파사드(Real-Time Facades)를 활용하면 애플리케이션 내의 어떤 클래스라도 바로 파사드처럼 사용할 수 있습니다. 사용 방법을 이해하기 위해, 먼저 실시간 파사드 없이 작성된 코드를 살펴보겠습니다. 예를 들어, `Podcast` 모델에 `publish` 메서드가 있다고 가정합시다. 단, 팟캐스트를 발행하려면 `Publisher` 인스턴스를 주입받아야 합니다.

```
<?php

namespace App\Models;

use App\Contracts\Publisher;
use Illuminate\Database\Eloquent\Model;

class Podcast extends Model
{
    /**
     * Publish the podcast.
     */
    public function publish(Publisher $publisher): void
    {
        $this->update(['publishing' => now()]);

        $publisher->publish($this);
    }
}
```

이처럼 메서드에 퍼블리셔(Publisher) 구현체를 주입하면, 테스트 시 해당 퍼블리셔를 쉽게 mock 처리하여 단위 테스트가 편리합니다. 하지만 실제 메서드를 호출할 때마다 매번 퍼블리셔 인스턴스를 전달해야 한다는 번거로움이 있습니다. 실시간 파사드를 활용하면 동일한 테스트 가능성을 유지하면서도, 퍼블리셔 인스턴스를 명시적으로 넘길 필요가 없어집니다. 실시간 파사드를 쓰려면, 임포트 구문의 네임스페이스 앞에 `Facades`를 붙이면 됩니다.

```
<?php

namespace App\Models;

use App\Contracts\Publisher; // [tl! remove]
use Facades\App\Contracts\Publisher; // [tl! add]
use Illuminate\Database\Eloquent\Model;

class Podcast extends Model
{
    /**
     * Publish the podcast.
     */
    public function publish(Publisher $publisher): void // [tl! remove]
    public function publish(): void // [tl! add]
    {
        $this->update(['publishing' => now()]);

        $publisher->publish($this); // [tl! remove]
        Publisher::publish($this); // [tl! add]
    }
}
```

실시간 파사드를 사용하면, 인터페이스 또는 클래스명에서 `Facades` 접두사 이후에 나오는 이름을 기준으로 서비스 컨테이너에서 해당 구현체를 자동으로 해결해줍니다. 테스트에서는 라라벨의 내장 파사드 테스트 유틸리티를 그대로 활용해 메서드 호출 여부를 mock 처리할 수 있습니다.

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
     */
    public function test_podcast_can_be_published(): void
    {
        $podcast = Podcast::factory()->create();

        Publisher::shouldReceive('publish')->once()->with($podcast);

        $podcast->publish();
    }
}
```

<a name="facade-class-reference"></a>
## 파사드 클래스 레퍼런스

아래 표는 모든 파사드와 실제 구현 클래스, 그리고 해당되는 경우 서비스 컨테이너 바인딩 키를 정리한 것입니다. 원하는 파사드의 API 문서를 빠르게 찾을 때 유용하게 활용할 수 있습니다. [서비스 컨테이너 바인딩](/docs/10.x/container) 키도 함께 참고하십시오.

<div class="overflow-auto">

Facade  |  Class  |  Service Container Binding
------------- | ------------- | -------------
App  |  [Illuminate\Foundation\Application](https://laravel.com/api/10.x/Illuminate/Foundation/Application.html)  |  `app`
Artisan  |  [Illuminate\Contracts\Console\Kernel](https://laravel.com/api/10.x/Illuminate/Contracts/Console/Kernel.html)  |  `artisan`
Auth  |  [Illuminate\Auth\AuthManager](https://laravel.com/api/10.x/Illuminate/Auth/AuthManager.html)  |  `auth`
Auth (Instance)  |  [Illuminate\Contracts\Auth\Guard](https://laravel.com/api/10.x/Illuminate/Contracts/Auth/Guard.html)  |  `auth.driver`
Blade  |  [Illuminate\View\Compilers\BladeCompiler](https://laravel.com/api/10.x/Illuminate/View/Compilers/BladeCompiler.html)  |  `blade.compiler`
Broadcast  |  [Illuminate\Contracts\Broadcasting\Factory](https://laravel.com/api/10.x/Illuminate/Contracts/Broadcasting/Factory.html)  |  &nbsp;
Broadcast (Instance)  |  [Illuminate\Contracts\Broadcasting\Broadcaster](https://laravel.com/api/10.x/Illuminate/Contracts/Broadcasting/Broadcaster.html)  |  &nbsp;
Bus  |  [Illuminate\Contracts\Bus\Dispatcher](https://laravel.com/api/10.x/Illuminate/Contracts/Bus/Dispatcher.html)  |  &nbsp;
Cache  |  [Illuminate\Cache\CacheManager](https://laravel.com/api/10.x/Illuminate/Cache/CacheManager.html)  |  `cache`
Cache (Instance)  |  [Illuminate\Cache\Repository](https://laravel.com/api/10.x/Illuminate/Cache/Repository.html)  |  `cache.store`
Config  |  [Illuminate\Config\Repository](https://laravel.com/api/10.x/Illuminate/Config/Repository.html)  |  `config`
Cookie  |  [Illuminate\Cookie\CookieJar](https://laravel.com/api/10.x/Illuminate/Cookie/CookieJar.html)  |  `cookie`
Crypt  |  [Illuminate\Encryption\Encrypter](https://laravel.com/api/10.x/Illuminate/Encryption/Encrypter.html)  |  `encrypter`
Date  |  [Illuminate\Support\DateFactory](https://laravel.com/api/10.x/Illuminate/Support/DateFactory.html)  |  `date`
DB  |  [Illuminate\Database\DatabaseManager](https://laravel.com/api/10.x/Illuminate/Database/DatabaseManager.html)  |  `db`
DB (Instance)  |  [Illuminate\Database\Connection](https://laravel.com/api/10.x/Illuminate/Database/Connection.html)  |  `db.connection`
Event  |  [Illuminate\Events\Dispatcher](https://laravel.com/api/10.x/Illuminate/Events/Dispatcher.html)  |  `events`
File  |  [Illuminate\Filesystem\Filesystem](https://laravel.com/api/10.x/Illuminate/Filesystem/Filesystem.html)  |  `files`
Gate  |  [Illuminate\Contracts\Auth\Access\Gate](https://laravel.com/api/10.x/Illuminate/Contracts/Auth/Access/Gate.html)  |  &nbsp;
Hash  |  [Illuminate\Contracts\Hashing\Hasher](https://laravel.com/api/10.x/Illuminate/Contracts/Hashing/Hasher.html)  |  `hash`
Http  |  [Illuminate\Http\Client\Factory](https://laravel.com/api/10.x/Illuminate/Http/Client/Factory.html)  |  &nbsp;
Lang  |  [Illuminate\Translation\Translator](https://laravel.com/api/10.x/Illuminate/Translation/Translator.html)  |  `translator`
Log  |  [Illuminate\Log\LogManager](https://laravel.com/api/10.x/Illuminate/Log/LogManager.html)  |  `log`
Mail  |  [Illuminate\Mail\Mailer](https://laravel.com/api/10.x/Illuminate/Mail/Mailer.html)  |  `mailer`
Notification  |  [Illuminate\Notifications\ChannelManager](https://laravel.com/api/10.x/Illuminate/Notifications/ChannelManager.html)  |  &nbsp;
Password  |  [Illuminate\Auth\Passwords\PasswordBrokerManager](https://laravel.com/api/10.x/Illuminate/Auth/Passwords/PasswordBrokerManager.html)  |  `auth.password`
Password (Instance)  |  [Illuminate\Auth\Passwords\PasswordBroker](https://laravel.com/api/10.x/Illuminate/Auth/Passwords/PasswordBroker.html)  |  `auth.password.broker`
Pipeline (Instance)  |  [Illuminate\Pipeline\Pipeline](https://laravel.com/api/10.x/Illuminate/Pipeline/Pipeline.html)  |  &nbsp;
Process  |  [Illuminate\Process\Factory](https://laravel.com/api/10.x/Illuminate/Process/Factory.html)  |  &nbsp;
Queue  |  [Illuminate\Queue\QueueManager](https://laravel.com/api/10.x/Illuminate/Queue/QueueManager.html)  |  `queue`
Queue (Instance)  |  [Illuminate\Contracts\Queue\Queue](https://laravel.com/api/10.x/Illuminate/Contracts/Queue/Queue.html)  |  `queue.connection`
Queue (Base Class)  |  [Illuminate\Queue\Queue](https://laravel.com/api/10.x/Illuminate/Queue/Queue.html)  |  &nbsp;
RateLimiter  |  [Illuminate\Cache\RateLimiter](https://laravel.com/api/10.x/Illuminate/Cache/RateLimiter.html)  |  &nbsp;
Redirect  |  [Illuminate\Routing\Redirector](https://laravel.com/api/10.x/Illuminate/Routing/Redirector.html)  |  `redirect`
Redis  |  [Illuminate\Redis\RedisManager](https://laravel.com/api/10.x/Illuminate/Redis/RedisManager.html)  |  `redis`
Redis (Instance)  |  [Illuminate\Redis\Connections\Connection](https://laravel.com/api/10.x/Illuminate/Redis/Connections/Connection.html)  |  `redis.connection`
Request  |  [Illuminate\Http\Request](https://laravel.com/api/10.x/Illuminate/Http/Request.html)  |  `request`
Response  |  [Illuminate\Contracts\Routing\ResponseFactory](https://laravel.com/api/10.x/Illuminate/Contracts/Routing/ResponseFactory.html)  |  &nbsp;
Response (Instance)  |  [Illuminate\Http\Response](https://laravel.com/api/10.x/Illuminate/Http/Response.html)  |  &nbsp;
Route  |  [Illuminate\Routing\Router](https://laravel.com/api/10.x/Illuminate/Routing/Router.html)  |  `router`
Schema  |  [Illuminate\Database\Schema\Builder](https://laravel.com/api/10.x/Illuminate/Database/Schema/Builder.html)  |  &nbsp;
Session  |  [Illuminate\Session\SessionManager](https://laravel.com/api/10.x/Illuminate/Session/SessionManager.html)  |  `session`
Session (Instance)  |  [Illuminate\Session\Store](https://laravel.com/api/10.x/Illuminate/Session/Store.html)  |  `session.store`
Storage  |  [Illuminate\Filesystem\FilesystemManager](https://laravel.com/api/10.x/Illuminate/Filesystem/FilesystemManager.html)  |  `filesystem`
Storage (Instance)  |  [Illuminate\Contracts\Filesystem\Filesystem](https://laravel.com/api/10.x/Illuminate/Contracts/Filesystem/Filesystem.html)  |  `filesystem.disk`
URL  |  [Illuminate\Routing\UrlGenerator](https://laravel.com/api/10.x/Illuminate/Routing/UrlGenerator.html)  |  `url`
Validator  |  [Illuminate\Validation\Factory](https://laravel.com/api/10.x/Illuminate/Validation/Factory.html)  |  `validator`
Validator (Instance)  |  [Illuminate\Validation\Validator](https://laravel.com/api/10.x/Illuminate/Validation/Validator.html)  |  &nbsp;
View  |  [Illuminate\View\Factory](https://laravel.com/api/10.x/Illuminate/View/Factory.html)  |  `view`
View (Instance)  |  [Illuminate\View\View](https://laravel.com/api/10.x/Illuminate/View/View.html)  |  &nbsp;
Vite  |  [Illuminate\Foundation\Vite](https://laravel.com/api/10.x/Illuminate/Foundation/Vite.html)  |  &nbsp;

</div>
