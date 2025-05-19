# 파사드 (Facades)

- [소개](#introduction)
- [파사드를 언제 사용해야 하는가](#when-to-use-facades)
    - [파사드 vs 의존성 주입](#facades-vs-dependency-injection)
    - [파사드 vs 헬퍼 함수](#facades-vs-helper-functions)
- [파사드는 어떻게 동작하는가](#how-facades-work)
- [실시간 파사드(Real-Time Facades)](#real-time-facades)
- [파사드 클래스 참고 자료](#facade-class-reference)

<a name="introduction"></a>
## 소개

라라벨 공식 문서 전반에서 라라벨의 다양한 기능을 "파사드(Facade)"를 통해 사용하는 코드 예시를 자주 보실 수 있습니다. 파사드는 애플리케이션의 [서비스 컨테이너](/docs/12.x/container)에 등록된 클래스에 "정적" 인터페이스를 제공합니다. 라라벨은 거의 모든 주요 기능에 접근할 수 있도록 여러 파사드를 기본으로 제공합니다.

라라벨의 파사드는 서비스 컨테이너 내 실제 클래스에 대한 "정적 프록시" 역할을 하며, 기존의 정적 메서드보다 훨씬 테스트하기 쉽고 유연하면서도 간결하고 표현력 있는 문법을 지원합니다. 파사드가 어떻게 동작하는지 완전히 이해하지 못하셔도 걱정하지 마시고, 일단 라라벨 사용을 이어가시면 됩니다.

라라벨의 모든 파사드는 `Illuminate\Support\Facades` 네임스페이스에 정의되어 있습니다. 따라서 파사드는 아래와 같이 쉽게 사용할 수 있습니다.

```php
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;

Route::get('/cache', function () {
    return Cache::get('key');
});
```

라라벨 공식 문서의 다양한 예제에서 파사드를 통해 프레임워크의 기능을 소개하고 있습니다.

<a name="helper-functions"></a>
#### 헬퍼 함수

파사드와 더불어, 라라벨은 공통적인 기능을 더 쉽게 사용할 수 있도록 여러 전역 "헬퍼 함수"도 제공합니다. 예를 들어, 자주 쓰이는 헬퍼 함수로는 `view`, `response`, `url`, `config` 등이 있습니다. 각 헬퍼 함수의 자세한 설명은 해당 기능의 문서에 포함되어 있으며, 전체 목록은 [헬퍼 함수 문서](/docs/12.x/helpers)에서 확인할 수 있습니다.

예를 들어, JSON 응답을 생성하기 위해 굳이 `Illuminate\Support\Facades\Response` 파사드를 사용할 필요 없이, `response` 헬퍼 함수를 바로 사용할 수 있습니다. 헬퍼 함수는 전역적으로 사용할 수 있으므로 클래스를 따로 임포트하지 않아도 됩니다.

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
## 파사드를 언제 사용해야 하는가

파사드는 여러 장점이 있습니다. 긴 클래스명을 일일이 기억하거나 직접 주입/설정할 필요 없이, 라라벨의 주요 기능을 매우 간결하고 기억하기 쉬운 문법으로 사용할 수 있습니다. 또한 파사드는 PHP의 동적 메서드 특성을 이용하기 때문에, 테스트가 용이하다는 점도 큰 장점입니다.

하지만 파사드를 사용할 때는 주의할 점도 있습니다. 파사드는 너무 쉽게 쓸 수 있기 때문에, 한 클래스에서 파사드를 무분별하게 많이 사용하여 클래스의 책임 범위(스코프)가 지나치게 커지는 "스코프 크리프(scope creep)" 현상이 일어날 수 있습니다. 반면에 의존성 주입을 이용하면 생성자의 인자(파라미터)가 많아질 때 자연스럽게 클래스가 너무 비대해지고 있다는 점을 시각적으로 파악할 수 있습니다. 따라서 파사드를 쓸 때는 해당 클래스가 너무 커지지 않도록 특별히 신경 써야 하며, 너무 커진다면 여러 작은 클래스로 분리하는 것이 좋습니다.

<a name="facades-vs-dependency-injection"></a>
### 파사드 vs 의존성 주입

의존성 주입의 중요한 장점 중 하나는 주입받은 클래스의 구현체를 쉽게 교체할 수 있다는 점입니다. 특히 테스트 시에는 목(mock)이나 스텁(stub)을 주입하여, 해당 객체의 다양한 메서드 호출 여부를 검증할 수 있습니다.

보통 정적 클래스의 메서드는 목이나 스텁으로 대체해서 테스트하기 어렵지만, 파사드는 동적 메서드 프록시를 이용해 서비스 컨테이너에서 실제 객체를 꺼내 메서드를 호출하기 때문에, 실제로는 인스턴스 주입과 동일하게 테스트할 수 있습니다. 예를 들어, 다음과 같은 라우트가 있을 때:

```php
use Illuminate\Support\Facades\Cache;

Route::get('/cache', function () {
    return Cache::get('key');
});
```

라라벨의 파사드 테스트 메서드를 이용하여, `Cache::get` 메서드가 우리가 기대한 인수로 호출되었는지 다음과 같이 테스트할 수 있습니다.

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

파사드 외에도, 라라벨은 뷰 생성, 이벤트 발생, 작업(Job) 디스패치, HTTP 응답 전송 등 자주 쓰이는 작업을 위한 다양한 "헬퍼 함수"를 제공합니다. 이 헬퍼 함수들 중 상당수는 관련된 파사드와 동일한 기능을 수행합니다. 예를 들어, 아래처럼 파사드와 헬퍼 함수 사용 모두 같은 결과를 냅니다.

```php
return Illuminate\Support\Facades\View::make('profile');

return view('profile');
```

실제로 파사드와 헬퍼 함수 사이에는 실질적인 차이가 전혀 없습니다. 헬퍼 함수를 사용할 때도, 파사드를 사용할 때와 똑같이 테스트할 수 있습니다. 예를 들어, 다음과 같은 라우트를 작성했다고 가정해보겠습니다.

```php
Route::get('/cache', function () {
    return cache('key');
});
```

여기서 `cache` 헬퍼 함수는 내부적으로 `Cache` 파사드가 사용하는 클래스의 `get` 메서드를 호출합니다. 따라서 헬퍼 함수를 사용했더라도, 아래와 같이 동일하게 테스트할 수 있습니다.

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
## 파사드는 어떻게 동작하는가

라라벨 애플리케이션에서 파사드는 서비스 컨테이너에 등록된 객체에 접근할 수 있게 해주는 클래스입니다. 이를 가능하게 하는 핵심 로직은 `Facade` 클래스에 구현되어 있습니다. 라라벨이 제공하는 파사드나 직접 만드는 사용자 정의 파사드는 모두 기본 `Illuminate\Support\Facades\Facade` 클래스를 상속받아 사용합니다.

`Facade` 기본 클래스는 `__callStatic()` 매직 메서드를 활용하여, 파사드에서 호출된 메서드를 컨테이너에서 꺼낸 실제 객체로 위임(defer)합니다. 아래의 예를 보면, 라라벨의 캐시 시스템을 호출하고 있습니다. 겉으로 보기에는 `Cache` 클래스에서 정적 메서드인 `get`이 호출되는 것처럼 보입니다.

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

파일 상단에서 `Cache` 파사드를 임포트하고 있다는 점을 주목해 주세요. 이 파사드는 실제로는 `Illuminate\Contracts\Cache\Factory` 인터페이스의 구현 클래스에 접근하는 프록시 역할을 합니다. 즉, 파사드를 통해 호출하는 모든 메서드는 실제로 라라벨의 캐시 서비스 인스턴스로 전달됩니다.

실제로 `Illuminate\Support\Facades\Cache` 클래스를 확인해보면, 아래처럼 정적 메서드 `get`이 정의되어 있지 않은 것을 볼 수 있습니다.

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

이처럼, 파사드는 기본 `Facade` 클래스를 상속받고, `getFacadeAccessor()` 메서드만 구현합니다. 이 메서드는 서비스 컨테이너에 등록된 바인딩의 키 값을 반환하는 역할을 합니다. 사용자가 `Cache` 파사드에서 어떤 정적 메서드를 호출하면, 라라벨은 [서비스 컨테이너](/docs/12.x/container)에서 해당 바인딩(여기선 `'cache'`)을 꺼내와 요청한 메서드를 그 객체에 호출합니다.

<a name="real-time-facades"></a>
## 실시간 파사드(Real-Time Facades)

실시간 파사드를 활용하면, 애플리케이션 내의 어떤 클래스든 파사드처럼 사용할 수 있습니다. 먼저 실시간 파사드를 사용하지 않은 예제를 살펴보겠습니다. 예를 들어, `Podcast` 모델에 `publish` 메서드가 있고, 이를 실행하려면 `Publisher` 인스턴스를 주입해야 한다고 가정해봅니다.

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

이처럼 퍼블리셔 구현체를 메서드에 주입하게 되면, 테스트 시 퍼블리셔를 손쉽게 목(mock) 처리할 수 있어 독립적으로 테스트하기에 좋습니다. 다만, `publish` 메서드를 호출할 때마다 퍼블리셔 인스턴스를 항상 전달해야 합니다. 실시간 파사드를 사용하면 실제로 퍼블리셔 인스턴스를 명시적으로 전달하지 않아도 동일한 테스트가능성을 유지할 수 있습니다. 실시간 파사드 사용을 위해서는 임포트한 클래스 네임스페이스 앞에 `Facades`를 접두어로 붙이면 됩니다.

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

실시간 파사드를 사용할 경우, `Facades` 접두어 뒤에 오는 인터페이스 또는 클래스 명칭을 기준으로 퍼블리셔 구현체가 서비스 컨테이너에서 자동으로 해결됩니다. 테스트 시에도 라라벨의 내장 파사드 테스트 헬퍼를 이용하여 이 메서드 호출을 쉽게 목(mock) 처리할 수 있습니다.

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
## 파사드 클래스 참고 자료

아래는 각 파사드와 그에 대응하는 실제 클래스, 그리고 해당되는 경우 [서비스 컨테이너 바인딩](/docs/12.x/container) 키를 정리한 표입니다. 파사드 루트의 API 문서를 빠르게 찾아보고 싶을 때 유용하게 활용할 수 있습니다.

<div class="overflow-auto">

| 파사드 | 실제 클래스 | 서비스 컨테이너 바인딩 키 |
| --- | --- | --- |
| App | [Illuminate\Foundation\Application](https://api.laravel.com/docs/12.x/Illuminate/Foundation/Application.html) | `app` |
| Artisan | [Illuminate\Contracts\Console\Kernel](https://api.laravel.com/docs/12.x/Illuminate/Contracts/Console/Kernel.html) | `artisan` |
| Auth (인스턴스) | [Illuminate\Contracts\Auth\Guard](https://api.laravel.com/docs/12.x/Illuminate/Contracts/Auth/Guard.html) | `auth.driver` |
| Auth | [Illuminate\Auth\AuthManager](https://api.laravel.com/docs/12.x/Illuminate/Auth/AuthManager.html) | `auth` |
| Blade | [Illuminate\View\Compilers\BladeCompiler](https://api.laravel.com/docs/12.x/Illuminate/View/Compilers/BladeCompiler.html) | `blade.compiler` |
| Broadcast (인스턴스) | [Illuminate\Contracts\Broadcasting\Broadcaster](https://api.laravel.com/docs/12.x/Illuminate/Contracts/Broadcasting/Broadcaster.html) | &nbsp; |
| Broadcast | [Illuminate\Contracts\Broadcasting\Factory](https://api.laravel.com/docs/12.x/Illuminate/Contracts/Broadcasting/Factory.html) | &nbsp; |
| Bus | [Illuminate\Contracts\Bus\Dispatcher](https://api.laravel.com/docs/12.x/Illuminate/Contracts/Bus/Dispatcher.html) | &nbsp; |
| Cache (인스턴스) | [Illuminate\Cache\Repository](https://api.laravel.com/docs/12.x/Illuminate/Cache/Repository.html) | `cache.store` |
| Cache | [Illuminate\Cache\CacheManager](https://api.laravel.com/docs/12.x/Illuminate/Cache/CacheManager.html) | `cache` |
| Config | [Illuminate\Config\Repository](https://api.laravel.com/docs/12.x/Illuminate/Config/Repository.html) | `config` |
| Context | [Illuminate\Log\Context\Repository](https://api.laravel.com/docs/12.x/Illuminate/Log/Context/Repository.html) | &nbsp; |
| Cookie | [Illuminate\Cookie\CookieJar](https://api.laravel.com/docs/12.x/Illuminate/Cookie/CookieJar.html) | `cookie` |
| Crypt | [Illuminate\Encryption\Encrypter](https://api.laravel.com/docs/12.x/Illuminate/Encryption/Encrypter.html) | `encrypter` |
| Date | [Illuminate\Support\DateFactory](https://api.laravel.com/docs/12.x/Illuminate/Support/DateFactory.html) | `date` |
| DB (인스턴스) | [Illuminate\Database\Connection](https://api.laravel.com/docs/12.x/Illuminate/Database/Connection.html) | `db.connection` |
| DB | [Illuminate\Database\DatabaseManager](https://api.laravel.com/docs/12.x/Illuminate/Database/DatabaseManager.html) | `db` |
| Event | [Illuminate\Events\Dispatcher](https://api.laravel.com/docs/12.x/Illuminate/Events/Dispatcher.html) | `events` |
| Exceptions (인스턴스) | [Illuminate\Contracts\Debug\ExceptionHandler](https://api.laravel.com/docs/12.x/Illuminate/Contracts/Debug/ExceptionHandler.html) | &nbsp; |
| Exceptions | [Illuminate\Foundation\Exceptions\Handler](https://api.laravel.com/docs/12.x/Illuminate/Foundation/Exceptions/Handler.html) | &nbsp; |
| File | [Illuminate\Filesystem\Filesystem](https://api.laravel.com/docs/12.x/Illuminate/Filesystem/Filesystem.html) | `files` |
| Gate | [Illuminate\Contracts\Auth\Access\Gate](https://api.laravel.com/docs/12.x/Illuminate/Contracts/Auth/Access/Gate.html) | &nbsp; |
| Hash | [Illuminate\Contracts\Hashing\Hasher](https://api.laravel.com/docs/12.x/Illuminate/Contracts/Hashing/Hasher.html) | `hash` |
| Http | [Illuminate\Http\Client\Factory](https://api.laravel.com/docs/12.x/Illuminate/Http/Client/Factory.html) | &nbsp; |
| Lang | [Illuminate\Translation\Translator](https://api.laravel.com/docs/12.x/Illuminate/Translation/Translator.html) | `translator` |
| Log | [Illuminate\Log\LogManager](https://api.laravel.com/docs/12.x/Illuminate/Log/LogManager.html) | `log` |
| Mail | [Illuminate\Mail\Mailer](https://api.laravel.com/docs/12.x/Illuminate/Mail/Mailer.html) | `mailer` |
| Notification | [Illuminate\Notifications\ChannelManager](https://api.laravel.com/docs/12.x/Illuminate/Notifications/ChannelManager.html) | &nbsp; |
| Password (인스턴스) | [Illuminate\Auth\Passwords\PasswordBroker](https://api.laravel.com/docs/12.x/Illuminate/Auth/Passwords/PasswordBroker.html) | `auth.password.broker` |
| Password | [Illuminate\Auth\Passwords\PasswordBrokerManager](https://api.laravel.com/docs/12.x/Illuminate/Auth/Passwords/PasswordBrokerManager.html) | `auth.password` |
| Pipeline (인스턴스) | [Illuminate\Pipeline\Pipeline](https://api.laravel.com/docs/12.x/Illuminate/Pipeline/Pipeline.html) | &nbsp; |
| Process | [Illuminate\Process\Factory](https://api.laravel.com/docs/12.x/Illuminate/Process/Factory.html) | &nbsp; |
| Queue (기본 클래스) | [Illuminate\Queue\Queue](https://api.laravel.com/docs/12.x/Illuminate/Queue/Queue.html) | &nbsp; |
| Queue (인스턴스) | [Illuminate\Contracts\Queue\Queue](https://api.laravel.com/docs/12.x/Illuminate/Contracts/Queue/Queue.html) | `queue.connection` |
| Queue | [Illuminate\Queue\QueueManager](https://api.laravel.com/docs/12.x/Illuminate/Queue/QueueManager.html) | `queue` |
| RateLimiter | [Illuminate\Cache\RateLimiter](https://api.laravel.com/docs/12.x/Illuminate/Cache/RateLimiter.html) | &nbsp; |
| Redirect | [Illuminate\Routing\Redirector](https://api.laravel.com/docs/12.x/Illuminate/Routing/Redirector.html) | `redirect` |
| Redis (인스턴스) | [Illuminate\Redis\Connections\Connection](https://api.laravel.com/docs/12.x/Illuminate/Redis/Connections/Connection.html) | `redis.connection` |
| Redis | [Illuminate\Redis\RedisManager](https://api.laravel.com/docs/12.x/Illuminate/Redis/RedisManager.html) | `redis` |
| Request | [Illuminate\Http\Request](https://api.laravel.com/docs/12.x/Illuminate/Http/Request.html) | `request` |
| Response (인스턴스) | [Illuminate\Http\Response](https://api.laravel.com/docs/12.x/Illuminate/Http/Response.html) | &nbsp; |
| Response | [Illuminate\Contracts\Routing\ResponseFactory](https://api.laravel.com/docs/12.x/Illuminate/Contracts/Routing/ResponseFactory.html) | &nbsp; |
| Route | [Illuminate\Routing\Router](https://api.laravel.com/docs/12.x/Illuminate/Routing/Router.html) | `router` |
| Schedule | [Illuminate\Console\Scheduling\Schedule](https://api.laravel.com/docs/12.x/Illuminate/Console/Scheduling/Schedule.html) | &nbsp; |
| Schema | [Illuminate\Database\Schema\Builder](https://api.laravel.com/docs/12.x/Illuminate/Database/Schema/Builder.html) | &nbsp; |
| Session (인스턴스) | [Illuminate\Session\Store](https://api.laravel.com/docs/12.x/Illuminate/Session/Store.html) | `session.store` |
| Session | [Illuminate\Session\SessionManager](https://api.laravel.com/docs/12.x/Illuminate/Session/SessionManager.html) | `session` |
| Storage (인스턴스) | [Illuminate\Contracts\Filesystem\Filesystem](https://api.laravel.com/docs/12.x/Illuminate/Contracts/Filesystem/Filesystem.html) | `filesystem.disk` |
| Storage | [Illuminate\Filesystem\FilesystemManager](https://api.laravel.com/docs/12.x/Illuminate/Filesystem/FilesystemManager.html) | `filesystem` |
| URL | [Illuminate\Routing\UrlGenerator](https://api.laravel.com/docs/12.x/Illuminate/Routing/UrlGenerator.html) | `url` |
| Validator (인스턴스) | [Illuminate\Validation\Validator](https://api.laravel.com/docs/12.x/Illuminate/Validation/Validator.html) | &nbsp; |
| Validator | [Illuminate\Validation\Factory](https://api.laravel.com/docs/12.x/Illuminate/Validation/Factory.html) | `validator` |
| View (인스턴스) | [Illuminate\View\View](https://api.laravel.com/docs/12.x/Illuminate/View/View.html) | &nbsp; |
| View | [Illuminate\View\Factory](https://api.laravel.com/docs/12.x/Illuminate/View/Factory.html) | `view` |
| Vite | [Illuminate\Foundation\Vite](https://api.laravel.com/docs/12.x/Illuminate/Foundation/Vite.html) | &nbsp; |

</div>
