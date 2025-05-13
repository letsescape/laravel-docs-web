# 파사드 (Facades)

- [소개](#introduction)
- [파사드를 사용할 경우](#when-to-use-facades)
    - [파사드 vs 의존성 주입](#facades-vs-dependency-injection)
    - [파사드 vs 헬퍼 함수](#facades-vs-helper-functions)
- [파사드는 어떻게 동작하나요](#how-facades-work)
- [실시간(Real-Time) 파사드](#real-time-facades)
- [파사드 클래스 레퍼런스](#facade-class-reference)

<a name="introduction"></a>
## 소개

라라벨 공식 문서 전반에서는 "파사드(Facades)"를 통해 라라벨의 다양한 기능을 사용하는 예제를 자주 볼 수 있습니다. 파사드는 애플리케이션의 [서비스 컨테이너](/docs/container)에 등록된 클래스에 "정적(static)" 인터페이스를 제공합니다. 라라벨은 거의 모든 프레임워크 기능에 접근할 수 있도록 다양한 파사드를 기본으로 제공합니다.

라라벨의 파사드는 서비스 컨테이너에 등록된 실제 클래스에 "정적 프록시"로 동작합니다. 덕분에 전통적인 정적 메서드보다 더 유연하고 테스트하기 쉬우면서도 간단하고 표현력 있는 문법을 사용할 수 있습니다. 파사드가 어떻게 동작하는지 완전히 이해하지 못해도 괜찮으니 일단 흐름을 따라가며 라라벨을 학습해도 무방합니다.

라라벨의 모든 파사드는 `Illuminate\Support\Facades` 네임스페이스에 정의되어 있습니다. 따라서 아래와 같이 쉽게 사용할 수 있습니다.

```php
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;

Route::get('/cache', function () {
    return Cache::get('key');
});
```

라라벨 공식 문서 전체에서 여러 예제들이 프레임워크의 다양한 기능을 설명할 때 파사드를 활용하고 있습니다.

<a name="helper-functions"></a>
#### 헬퍼 함수

파사드를 보완하기 위해 라라벨은 여러 가지 전역 "헬퍼 함수"도 제공합니다. 이 함수들은 라라벨의 주요 기능을 더욱 쉽게 활용할 수 있도록 해줍니다. 예를 들어 `view`, `response`, `url`, `config` 등과 같은 다양한 헬퍼 함수가 있으며, 각각의 기능과 함께 공식 문서에서 상세하게 다루고 있습니다. 모든 헬퍼 함수의 전체 목록은 [헬퍼 문서](/docs/helpers)에서 확인할 수 있습니다.

예를 들어, `Illuminate\Support\Facades\Response` 파사드 대신 `response` 함수를 이용하여 JSON 응답을 만들 수 있습니다. 헬퍼 함수는 전역적으로 사용할 수 있으므로 별도의 클래스 임포트 없이 바로 쓸 수 있습니다.

```php
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
## 파사드를 사용할 경우

파사드에는 여러 가지 장점이 있습니다. 복잡한 클래스명을 일일이 기억하거나 직접 주입하거나 설정하지 않아도, 짧고 기억하기 쉬운 문법으로 라라벨의 다양한 기능을 바로 사용할 수 있습니다. 또한 PHP의 동적 메서드 방식을 활용하기 때문에 테스트하기도 비교적 쉽습니다.

하지만 파사드를 사용할 때 주의해야 할 점도 있습니다. 파사드는 너무 쉽게 사용할 수 있기 때문에, 한 클래스에서 계속 파사드를 추가하다 보면 "클래스의 역할 범위(scope)가 점점 불어나기" 쉽습니다. 의존성 주입을 사용하면 생성자가 커짐에 따라 클래스가 너무 커졌음을 시각적으로 느낄 수 있어 경각심을 갖게 되지만, 파사드는 그렇지 않습니다. 따라서 파사드 사용 시 클래스가 너무 비대해지지 않도록 반드시 주의를 기울여야 하며, 만약 클래스가 커진다면 더 작은 여러 클래스로 분리하는 것도 고려해야 합니다.

<a name="facades-vs-dependency-injection"></a>
### 파사드 vs 의존성 주입

의존성 주입의 가장 큰 장점 중 하나는 주입된 클래스의 구현체를 쉽게 교체할 수 있다는 점입니다. 이 덕분에 테스트할 때 원하는 클래스를 임의로 주입하거나, 모조(mock) 또는 스텁(stub) 객체를 넣어서 해당 메서드가 정상적으로 호출되는지 확인할 수 있습니다.

보통 진짜 '정적(static)' 클래스 메서드는 모킹하거나 스텁으로 대체하기 어렵습니다. 그러나 파사드는 동적 메서드를 활용해 서비스 컨테이너에서 실제 객체를 받아와 실제 메서드로 위임하기 때문에, 의존성 주입한 클래스 인스턴스를 테스트하는 것과 동일하게 파사드를 테스트할 수 있습니다. 예를 들어, 다음 라우트에서:

```php
use Illuminate\Support\Facades\Cache;

Route::get('/cache', function () {
    return Cache::get('key');
});
```

라라벨의 파사드 테스트 메서드를 이용하면 아래와 같이 `Cache::get` 메서드가 기대한 인수로 호출되었는지 검증할 수 있습니다.

```php tab=Pest
use Illuminate\Support\Facades\Cache;

test('basic example', function () {
    Cache::shouldReceive('get')
        ->with('key')
        ->andReturn('value');

    $response = $this->get('/cache');

    $response->assertSee('value');
});
```

```php tab=PHPUnit
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
### 파사드 vs 헬퍼 함수

파사드 외에도, 라라벨에서는 뷰를 생성하거나, 이벤트를 발생시키거나, 작업을 디스패치(dispatch)하거나, HTTP 응답을 보내는 등 자주 쓰이는 기능을 쉽게 처리할 수 있는 "헬퍼" 함수들도 다양하게 내장되어 있습니다. 이 헬퍼 함수들 중 상당수는 특정 파사드와 같은 역할을 수행합니다. 예를 들어 아래 두 방식은 동일한 결과를 냅니다.

```php
return Illuminate\Support\Facades\View::make('profile');

return view('profile');
```

헬퍼 함수와 파사드는 실제 동작상 완전히 동일합니다. 헬퍼 함수를 사용할 때도 파사드와 똑같이 테스트할 수 있습니다. 예를 들어 다음과 같은 라우트가 있다고 가정해보겠습니다.

```php
Route::get('/cache', function () {
    return cache('key');
});
```

여기서 `cache` 헬퍼 함수는 내부적으로 `Cache` 파사드에서 사용되는 클래스의 `get` 메서드를 호출합니다. 즉, 헬퍼 함수를 사용할 때도 아래와 같이 동일하게 테스트할 수 있습니다.

```php
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
## 파사드는 어떻게 동작하나요

라라벨 애플리케이션에서 파사드는 컨테이너에 등록된 객체에 접근하는 데 사용되는 클래스입니다. 이러한 파사드의 핵심 역할은 모두 `Facade` 클래스에 구현되어 있습니다. 라라벨의 모든 파사드, 그리고 여러분이 만들 수 있는 커스텀 파사드는 기본적으로 `Illuminate\Support\Facades\Facade` 클래스를 상속받아 작성됩니다.

`Facade` 기본 클래스는 PHP의 `__callStatic()` 매직 메서드를 활용해, 파사드를 통한 모든 메서드를 실제로는 서비스 컨테이너에서 객체를 받아와서 처리하도록 위임합니다. 아래 예제에서는 라라벨의 캐시 시스템을 사용하는데, 이 소스만 봐서는 마치 `Cache` 클래스의 정적 메서드 `get`이 호출되는 것처럼 보입니다.

```php
<?php

namespace App\Http\Controllers;

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

파일 상단에서 `Cache` 파사드를 `import`한 것을 볼 수 있습니다. 이 파사드는 내부적으로 `Illuminate\Contracts\Cache\Factory` 인터페이스의 실제 구현체에 대한 접근을 돕는 프록시 역할을 합니다. 즉, 파사드를 통해 호출하는 모든 메서드는 실제 라라벨의 캐시 서비스 인스턴스에 위임되어 동작합니다.

`Illuminate\Support\Facades\Cache` 클래스를 살펴보면, 정적 메서드 `get`은 실제로 존재하지 않는다는 점을 알 수 있습니다.

```php
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

이처럼 `Cache` 파사드는 기본 `Facade` 클래스를 상속받아, `getFacadeAccessor()`라는 메서드를 재정의하고 있습니다. 이 메서드는 서비스 컨테이너에서 바인딩된 컴포넌트의 이름을 반환하는 역할을 합니다. 사용자가 `Cache` 파사드에서 어떤 정적 메서드를 호출하면, 라라벨은 서비스 컨테이너에서 해당 바인딩(여기서는 `cache`)을 가져와 해당 객체의 실제 메서드(여기서는 `get`)를 실행합니다. ([서비스 컨테이너](/docs/container) 문서 참고)

<a name="real-time-facades"></a>
## 실시간(Real-Time) 파사드

실시간 파사드(Real-Time Facades)를 활용하면, 여러분의 애플리케이션 내 모든 클래스를 파사드처럼 사용할 수 있습니다. 먼저 실시간 파사드를 사용하지 않았을 때의 예제를 살펴보겠습니다. 예를 들어, `Podcast` 모델에 `publish` 메서드가 필요하다고 합시다. 하지만 이 작업을 하려면 `Publisher` 인스턴스를 인자로 주입해야 합니다.

```php
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

이처럼 메서드에 publisher 구현체를 직접 인자로 주입하면, 테스트할 때 Publisher를 원하는 대로 모킹(Mock)할 수 있기 때문에 독립적으로 테스트가 쉬워집니다. 하지만 매번 publish를 호출할 때마다 Publisher 인스턴스를 넘겨줘야 하는 점은 번거로울 수 있습니다. 실시간 파사드 기능을 활용하면 테스트의 용이함을 유지하면서도 Publisher 인스턴스를 명시적으로 전달할 필요가 없게 만들 수 있습니다. 실시간 파사드는 임포트하는 클래스의 네임스페이스 앞에 `Facades`를 붙여서 사용할 수 있습니다.

```php
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

실시간 파사드를 사용하면, `Facades` 접두어 뒤에 나오는 인터페이스 또는 클래스 이름의 일부를 기준으로 해당 구현체가 서비스 컨테이너에서 자동으로 resolve(해결) 됩니다. 테스트 시에도, 라라벨의 내장 파사드 테스트 헬퍼를 그대로 이용해 메서드 호출을 쉽게 모킹할 수 있습니다.

```php tab=Pest
<?php

use App\Models\Podcast;
use Facades\App\Contracts\Publisher;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('podcast can be published', function () {
    $podcast = Podcast::factory()->create();

    Publisher::shouldReceive('publish')->once()->with($podcast);

    $podcast->publish();
});
```

```php tab=PHPUnit
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

아래 표는 라라벨에서 제공하는 모든 파사드와, 각각이 프록시하는 실제 클래스가 무엇인지 보여줍니다. 특정 파사드가 어떤 구현체와 연결되어 있으며 [서비스 컨테이너 바인딩](/docs/container) 키가 무엇인지도 확인할 수 있으니, 관심 있는 API 문서를 빠르게 찾아보고자 할 때 유용하게 쓰실 수 있습니다.

<div class="overflow-auto">

| 파사드 | 실제 클래스 | 서비스 컨테이너 바인딩 |
| --- | --- | --- |
| App | [Illuminate\Foundation\Application](https://api.laravel.com/docs/Illuminate/Foundation/Application.html) | `app` |
| Artisan | [Illuminate\Contracts\Console\Kernel](https://api.laravel.com/docs/Illuminate/Contracts/Console/Kernel.html) | `artisan` |
| Auth (Instance) | [Illuminate\Contracts\Auth\Guard](https://api.laravel.com/docs/Illuminate/Contracts/Auth/Guard.html) | `auth.driver` |
| Auth | [Illuminate\Auth\AuthManager](https://api.laravel.com/docs/Illuminate/Auth/AuthManager.html) | `auth` |
| Blade | [Illuminate\View\Compilers\BladeCompiler](https://api.laravel.com/docs/Illuminate/View/Compilers/BladeCompiler.html) | `blade.compiler` |
| Broadcast (Instance) | [Illuminate\Contracts\Broadcasting\Broadcaster](https://api.laravel.com/docs/Illuminate/Contracts/Broadcasting/Broadcaster.html) | &nbsp; |
| Broadcast | [Illuminate\Contracts\Broadcasting\Factory](https://api.laravel.com/docs/Illuminate/Contracts/Broadcasting/Factory.html) | &nbsp; |
| Bus | [Illuminate\Contracts\Bus\Dispatcher](https://api.laravel.com/docs/Illuminate/Contracts/Bus/Dispatcher.html) | &nbsp; |
| Cache (Instance) | [Illuminate\Cache\Repository](https://api.laravel.com/docs/Illuminate/Cache/Repository.html) | `cache.store` |
| Cache | [Illuminate\Cache\CacheManager](https://api.laravel.com/docs/Illuminate/Cache/CacheManager.html) | `cache` |
| Config | [Illuminate\Config\Repository](https://api.laravel.com/docs/Illuminate/Config/Repository.html) | `config` |
| Context | [Illuminate\Log\Context\Repository](https://api.laravel.com/docs/Illuminate/Log/Context/Repository.html) | &nbsp; |
| Cookie | [Illuminate\Cookie\CookieJar](https://api.laravel.com/docs/Illuminate/Cookie/CookieJar.html) | `cookie` |
| Crypt | [Illuminate\Encryption\Encrypter](https://api.laravel.com/docs/Illuminate/Encryption/Encrypter.html) | `encrypter` |
| Date | [Illuminate\Support\DateFactory](https://api.laravel.com/docs/Illuminate/Support/DateFactory.html) | `date` |
| DB (Instance) | [Illuminate\Database\Connection](https://api.laravel.com/docs/Illuminate/Database/Connection.html) | `db.connection` |
| DB | [Illuminate\Database\DatabaseManager](https://api.laravel.com/docs/Illuminate/Database/DatabaseManager.html) | `db` |
| Event | [Illuminate\Events\Dispatcher](https://api.laravel.com/docs/Illuminate/Events/Dispatcher.html) | `events` |
| Exceptions (Instance) | [Illuminate\Contracts\Debug\ExceptionHandler](https://api.laravel.com/docs/Illuminate/Contracts/Debug/ExceptionHandler.html) | &nbsp; |
| Exceptions | [Illuminate\Foundation\Exceptions\Handler](https://api.laravel.com/docs/Illuminate/Foundation/Exceptions/Handler.html) | &nbsp; |
| File | [Illuminate\Filesystem\Filesystem](https://api.laravel.com/docs/Illuminate/Filesystem/Filesystem.html) | `files` |
| Gate | [Illuminate\Contracts\Auth\Access\Gate](https://api.laravel.com/docs/Illuminate/Contracts/Auth/Access/Gate.html) | &nbsp; |
| Hash | [Illuminate\Contracts\Hashing\Hasher](https://api.laravel.com/docs/Illuminate/Contracts/Hashing/Hasher.html) | `hash` |
| Http | [Illuminate\Http\Client\Factory](https://api.laravel.com/docs/Illuminate/Http/Client/Factory.html) | &nbsp; |
| Lang | [Illuminate\Translation\Translator](https://api.laravel.com/docs/Illuminate/Translation/Translator.html) | `translator` |
| Log | [Illuminate\Log\LogManager](https://api.laravel.com/docs/Illuminate/Log/LogManager.html) | `log` |
| Mail | [Illuminate\Mail\Mailer](https://api.laravel.com/docs/Illuminate/Mail/Mailer.html) | `mailer` |
| Notification | [Illuminate\Notifications\ChannelManager](https://api.laravel.com/docs/Illuminate/Notifications/ChannelManager.html) | &nbsp; |
| Password (Instance) | [Illuminate\Auth\Passwords\PasswordBroker](https://api.laravel.com/docs/Illuminate/Auth/Passwords/PasswordBroker.html) | `auth.password.broker` |
| Password | [Illuminate\Auth\Passwords\PasswordBrokerManager](https://api.laravel.com/docs/Illuminate/Auth/Passwords/PasswordBrokerManager.html) | `auth.password` |
| Pipeline (Instance) | [Illuminate\Pipeline\Pipeline](https://api.laravel.com/docs/Illuminate/Pipeline/Pipeline.html) | &nbsp; |
| Process | [Illuminate\Process\Factory](https://api.laravel.com/docs/Illuminate/Process/Factory.html) | &nbsp; |
| Queue (Base Class) | [Illuminate\Queue\Queue](https://api.laravel.com/docs/Illuminate/Queue/Queue.html) | &nbsp; |
| Queue (Instance) | [Illuminate\Contracts\Queue\Queue](https://api.laravel.com/docs/Illuminate/Contracts/Queue/Queue.html) | `queue.connection` |
| Queue | [Illuminate\Queue\QueueManager](https://api.laravel.com/docs/Illuminate/Queue/QueueManager.html) | `queue` |
| RateLimiter | [Illuminate\Cache\RateLimiter](https://api.laravel.com/docs/Illuminate/Cache/RateLimiter.html) | &nbsp; |
| Redirect | [Illuminate\Routing\Redirector](https://api.laravel.com/docs/Illuminate/Routing/Redirector.html) | `redirect` |
| Redis (Instance) | [Illuminate\Redis\Connections\Connection](https://api.laravel.com/docs/Illuminate/Redis/Connections/Connection.html) | `redis.connection` |
| Redis | [Illuminate\Redis\RedisManager](https://api.laravel.com/docs/Illuminate/Redis/RedisManager.html) | `redis` |
| Request | [Illuminate\Http\Request](https://api.laravel.com/docs/Illuminate/Http/Request.html) | `request` |
| Response (Instance) | [Illuminate\Http\Response](https://api.laravel.com/docs/Illuminate/Http/Response.html) | &nbsp; |
| Response | [Illuminate\Contracts\Routing\ResponseFactory](https://api.laravel.com/docs/Illuminate/Contracts/Routing/ResponseFactory.html) | &nbsp; |
| Route | [Illuminate\Routing\Router](https://api.laravel.com/docs/Illuminate/Routing/Router.html) | `router` |
| Schedule | [Illuminate\Console\Scheduling\Schedule](https://api.laravel.com/docs/Illuminate/Console/Scheduling/Schedule.html) | &nbsp; |
| Schema | [Illuminate\Database\Schema\Builder](https://api.laravel.com/docs/Illuminate/Database/Schema/Builder.html) | &nbsp; |
| Session (Instance) | [Illuminate\Session\Store](https://api.laravel.com/docs/Illuminate/Session/Store.html) | `session.store` |
| Session | [Illuminate\Session\SessionManager](https://api.laravel.com/docs/Illuminate/Session/SessionManager.html) | `session` |
| Storage (Instance) | [Illuminate\Contracts\Filesystem\Filesystem](https://api.laravel.com/docs/Illuminate/Contracts/Filesystem/Filesystem.html) | `filesystem.disk` |
| Storage | [Illuminate\Filesystem\FilesystemManager](https://api.laravel.com/docs/Illuminate/Filesystem/FilesystemManager.html) | `filesystem` |
| URL | [Illuminate\Routing\UrlGenerator](https://api.laravel.com/docs/Illuminate/Routing/UrlGenerator.html) | `url` |
| Validator (Instance) | [Illuminate\Validation\Validator](https://api.laravel.com/docs/Illuminate/Validation/Validator.html) | &nbsp; |
| Validator | [Illuminate\Validation\Factory](https://api.laravel.com/docs/Illuminate/Validation/Factory.html) | `validator` |
| View (Instance) | [Illuminate\View\View](https://api.laravel.com/docs/Illuminate/View/View.html) | &nbsp; |
| View | [Illuminate\View\Factory](https://api.laravel.com/docs/Illuminate/View/Factory.html) | `view` |
| Vite | [Illuminate\Foundation\Vite](https://api.laravel.com/docs/Illuminate/Foundation/Vite.html) | &nbsp; |

</div>
