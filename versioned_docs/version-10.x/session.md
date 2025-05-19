# HTTP 세션 (HTTP Session)

- [소개](#introduction)
    - [설정](#configuration)
    - [드라이버 사전 준비사항](#driver-prerequisites)
- [세션과 상호작용하기](#interacting-with-the-session)
    - [데이터 조회하기](#retrieving-data)
    - [데이터 저장하기](#storing-data)
    - [Flash 데이터](#flash-data)
    - [데이터 삭제하기](#deleting-data)
    - [세션 ID 재발급](#regenerating-the-session-id)
- [세션 블로킹](#session-blocking)
- [사용자 정의 세션 드라이버 추가하기](#adding-custom-session-drivers)
    - [드라이버 구현하기](#implementing-the-driver)
    - [드라이버 등록하기](#registering-the-driver)

<a name="introduction"></a>
## 소개

HTTP 기반 애플리케이션은 본질적으로 상태를 저장하지 않기 때문에, 세션은 여러 요청에 걸쳐 사용자에 대한 정보를 저장하는 방법을 제공합니다. 이렇게 저장된 사용자 정보는 일반적으로 영속적인 저장소(백엔드)에 저장되어, 이후의 요청에서도 접근할 수 있습니다.

라라벨은 다양한 세션 백엔드를 지원하며, 이를 일관성 있고 직관적인 API로 사용할 수 있습니다. [Memcached](https://memcached.org), [Redis](https://redis.io), 데이터베이스 등 여러 인기 있는 백엔드를 기본적으로 지원합니다.

<a name="configuration"></a>
### 설정

애플리케이션의 세션 설정 파일은 `config/session.php`에 위치합니다. 이 파일에 제공되는 다양한 옵션들을 꼭 확인해 보시기 바랍니다. 라라벨은 기본적으로 `file` 세션 드라이버가 설정되어 있는데, 이 방식은 많은 애플리케이션에서 무리 없이 사용할 수 있습니다. 만약 애플리케이션이 여러 웹 서버에 걸쳐 로드밸런싱될 경우, 모든 서버에서 접근할 수 있는 Redis나 데이터베이스와 같은 중앙 집중식 저장소를 사용하는 것이 좋습니다.

세션 `driver` 설정 옵션은 각 요청마다 세션 데이터가 어디에 저장될지를 정의합니다. 라라벨은 기본적으로 여러 훌륭한 드라이버를 제공합니다.

<div class="content-list" markdown="1">

- `file` - 세션이 `storage/framework/sessions` 디렉터리에 저장됩니다.
- `cookie` - 세션이 보안처리되고 암호화된 쿠키에 저장됩니다.
- `database` - 세션이 관계형 데이터베이스에 저장됩니다.
- `memcached` / `redis` - 세션이 속도가 빠른 캐시 기반 저장소 중 하나에 저장됩니다.
- `dynamodb` - 세션이 AWS DynamoDB에 저장됩니다.
- `array` - 세션이 PHP 배열에 저장되며, 영구적으로 저장되지 않습니다.

</div>

> [!NOTE]
> array 드라이버는 주로 [테스트](/docs/10.x/testing) 시에 사용되며, 세션에 저장되는 데이터가 영구적으로 유지되지 않게 합니다.

<a name="driver-prerequisites"></a>
### 드라이버 사전 준비사항

<a name="database"></a>
#### 데이터베이스

`database` 세션 드라이버를 사용할 경우, 세션 정보를 저장할 테이블을 생성해야 합니다. 아래는 해당 테이블에 대한 예시적인 `Schema` 선언입니다.

```
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::create('sessions', function (Blueprint $table) {
    $table->string('id')->primary();
    $table->foreignId('user_id')->nullable()->index();
    $table->string('ip_address', 45)->nullable();
    $table->text('user_agent')->nullable();
    $table->text('payload');
    $table->integer('last_activity')->index();
});
```

`session:table` 아티즌 명령어를 사용하면 이 마이그레이션을 생성할 수 있습니다. 데이터베이스 마이그레이션에 대한 더 자세한 정보는 [마이그레이션 문서](/docs/10.x/migrations)를 참고하십시오.

```shell
php artisan session:table

php artisan migrate
```

<a name="redis"></a>
#### Redis

라라벨에서 Redis 세션을 사용하려면, PECL을 통해 PhpRedis PHP 확장 모듈을 설치하거나, Composer를 통해 `predis/predis` 패키지(~1.0)를 설치해야 합니다. Redis 설정에 대한 더 자세한 내용은 라라벨의 [Redis 문서](/docs/10.x/redis#configuration)를 참고하세요.

> [!NOTE]
> `session` 설정 파일에서 `connection` 옵션을 사용하여 세션에서 사용할 Redis 연결을 지정할 수 있습니다.

<a name="interacting-with-the-session"></a>
## 세션과 상호작용하기

<a name="retrieving-data"></a>
### 데이터 조회하기

라라벨에서 세션 데이터를 다루는 대표적인 방법은 전역 `session` 헬퍼와 `Request` 인스턴스를 사용하는 방식, 두 가지가 있습니다. 먼저, `Request` 인스턴스를 통해 세션에 접근하는 방법을 살펴보면, 이 인스턴스는 라우트 클로저나 컨트롤러 메서드의 타입힌트로 전달받을 수 있습니다. 참고로, 컨트롤러 메서드의 의존성은 라라벨 [서비스 컨테이너](/docs/10.x/container)에 의해 자동으로 주입됩니다.

```
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * 주어진 사용자의 프로필을 보여줍니다.
     */
    public function show(Request $request, string $id): View
    {
        $value = $request->session()->get('key');

        // ...

        $user = $this->users->find($id);

        return view('user.profile', ['user' => $user]);
    }
}
```

세션에서 항목을 조회할 때, `get` 메서드의 두 번째 인수로 기본값을 지정할 수 있습니다. 요청한 키가 세션에 존재하지 않을 경우 이 기본값이 반환됩니다. 또한, 기본값으로 클로저를 전달하면 해당 키가 없을 때 클로저가 실행되어 그 결과가 반환됩니다.

```
$value = $request->session()->get('key', 'default');

$value = $request->session()->get('key', function () {
    return 'default';
});
```

<a name="the-global-session-helper"></a>
#### 전역 Session 헬퍼

세션에 데이터를 저장하거나 조회할 때, 전역 `session` PHP 함수를 사용할 수도 있습니다. 이 헬퍼에 문자열 하나를 전달하면 해당 세션 키의 값을 반환합니다. 배열 형태로 key/value 쌍을 전달하면, 해당 값들이 세션에 저장됩니다.

```
Route::get('/home', function () {
    // 세션에서 데이터 조회...
    $value = session('key');

    // 기본값 지정...
    $value = session('key', 'default');

    // 세션에 데이터 저장...
    session(['key' => 'value']);
});
```

> [!NOTE]
> HTTP 요청 인스턴스를 통한 세션 사용과 전역 `session` 헬퍼를 사용하는 것 사이에는 실질적인 차이가 거의 없습니다. 두 방식 모두 테스트 케이스에서 `assertSessionHas` 메서드를 이용해 [테스트](/docs/10.x/testing)할 수 있습니다.

<a name="retrieving-all-session-data"></a>
#### 모든 세션 데이터 조회하기

세션에 저장된 모든 데이터를 한번에 조회하려면 `all` 메서드를 사용할 수 있습니다.

```
$data = $request->session()->all();
```

<a name="retrieving-a-portion-of-the-session-data"></a>
#### 세션 데이터의 일부만 조회하기

`only`와 `except` 메서드를 사용하면, 세션 데이터 중 일부 키만 골라서 조회할 수 있습니다.

```
$data = $request->session()->only(['username', 'email']);

$data = $request->session()->except(['username', 'email']);
```

<a name="determining-if-an-item-exists-in-the-session"></a>
#### 세션에 항목이 존재하는지 확인하기

세션에 특정 항목이 존재하는지 확인하려면 `has` 메서드를 사용할 수 있습니다. 이 메서드는 해당 항목이 존재하고 값이 `null`이 아니면 `true`를 반환합니다.

```
if ($request->session()->has('users')) {
    // ...
}
```

해당 항목이 존재하는지만 확인하고 싶을 때(값이 `null`이어도 상관없을 때)는 `exists` 메서드를 사용하세요.

```
if ($request->session()->exists('users')) {
    // ...
}
```

세션에 해당 항목이 없는지 확인하려면 `missing` 메서드를 사용할 수 있습니다. 이 메서드는 항목이 없을 때 `true`를 반환합니다.

```
if ($request->session()->missing('users')) {
    // ...
}
```

<a name="storing-data"></a>
### 데이터 저장하기

세션에 데이터를 저장하려면 일반적으로 요청 인스턴스의 `put` 메서드나 전역 `session` 헬퍼를 사용합니다.

```
// 요청 인스턴스를 통해...
$request->session()->put('key', 'value');

// 전역 "session" 헬퍼를 통해...
session(['key' => 'value']);
```

<a name="pushing-to-array-session-values"></a>
#### 배열 세션값에 값 추가하기

`push` 메서드를 사용하면 세션의 배열 값에 새 값을 추가할 수 있습니다. 예를 들어, `user.teams` 키에 팀 이름들의 배열이 들어있다고 할 때, 다음과 같이 새로운 팀을 추가할 수 있습니다.

```
$request->session()->push('user.teams', 'developers');
```

<a name="retrieving-deleting-an-item"></a>
#### 항목 조회와 동시에 삭제하기

`pull` 메서드는 세션에서 항목을 조회하고, 해당 항목을 곧바로 삭제합니다.

```
$value = $request->session()->pull('key', 'default');
```

<a name="incrementing-and-decrementing-session-values"></a>
#### 세션 값 증가/감소시키기

세션 데이터에 정수형 값이 들어있고, 해당 값을 증가시키거나 감소시키고 싶을 때는 `increment`, `decrement` 메서드를 사용할 수 있습니다.

```
$request->session()->increment('count');

$request->session()->increment('count', $incrementBy = 2);

$request->session()->decrement('count');

$request->session()->decrement('count', $decrementBy = 2);
```

<a name="flash-data"></a>
### Flash 데이터

특정 데이터를 다음 요청에서만 일시적으로 사용하고 싶을 때 `flash` 메서드를 사용하면 됩니다. 이 방식으로 저장된 데이터는 즉시 그리고 바로 이어지는 다음 HTTP 요청에서만 사용할 수 있고, 그 이후에는 자동으로 삭제됩니다. Flash 데이터는 주로 단기적인 상태 메시지 등에 유용합니다.

```
$request->session()->flash('status', 'Task was successful!');
```

만약 Flash 데이터를 여러 번의 요청에 걸쳐서 유지하고 싶다면, `reflash` 메서드를 사용해 모든 Flash 데이터를 한 번 더 연장할 수 있습니다. 또는, `keep` 메서드로 특정 Flash 데이터만 유지할 수도 있습니다.

```
$request->session()->reflash();

$request->session()->keep(['username', 'email']);
```

Flash 데이터를 현재 요청에서만 유지하고 싶다면, `now` 메서드를 사용할 수 있습니다.

```
$request->session()->now('status', 'Task was successful!');
```

<a name="deleting-data"></a>
### 데이터 삭제하기

`forget` 메서드는 세션에서 특정 데이터를 제거합니다. 모든 데이터를 전부 제거하고 싶다면 `flush` 메서드를 사용하세요.

```
// 단일 키 삭제...
$request->session()->forget('name');

// 여러 키 삭제...
$request->session()->forget(['name', 'status']);

$request->session()->flush();
```

<a name="regenerating-the-session-id"></a>
### 세션 ID 재발급

세션 ID를 재발급하는 것은 [세션 고정화(session fixation)](https://owasp.org/www-community/attacks/Session_fixation) 공격으로부터 애플리케이션을 보호하기 위해 자주 사용됩니다.

라라벨의 [스타터 키트](/docs/10.x/starter-kits) 또는 [Laravel Fortify](/docs/10.x/fortify)를 사용한다면, 인증 중에 라라벨이 자동으로 세션 ID를 재발급합니다. 그러나, 수동으로 세션 ID를 재생성해야 할 때는 `regenerate` 메서드를 사용할 수 있습니다.

```
$request->session()->regenerate();
```

세션 ID를 재발급하면서 세션 내 모든 데이터도 한 번에 삭제하고 싶다면, `invalidate` 메서드를 사용하면 됩니다.

```
$request->session()->invalidate();
```

<a name="session-blocking"></a>
## 세션 블로킹

> [!WARNING]
> 세션 블로킹을 사용하려면, 애플리케이션이 [원자적 잠금(atomic locks)](/docs/10.x/cache#atomic-locks)을 지원하는 캐시 드라이버를 사용해야 합니다. 현재 지원되는 캐시 드라이버는 `memcached`, `dynamodb`, `redis`, `database`, `file`, `array` 입니다. 단, `cookie` 세션 드라이버는 사용할 수 없습니다.

기본적으로 라라벨은 동일한 세션을 사용하는 요청들이 동시에 실행되도록 허용합니다. 예를 들어, 자바스크립트 HTTP 라이브러리를 사용하여 두 개의 HTTP 요청을 동시에 보내면, 두 요청이 동시에 처리됩니다. 대부분의 애플리케이션에서는 큰 문제가 없지만, 서로 다른 엔드포인트로 동시에 요청이 들어와 모두 세션에 데이터를 기록할 경우, 세션 데이터가 유실될 위험이 있습니다.

이런 상황을 방지하기 위해, 라라벨은 특정 세션에 대해 동시 요청 수를 제한할 수 있는 기능을 제공합니다. 시작은 route 정의에 `block` 메서드를 체이닝하는 것부터 할 수 있습니다. 아래 예시에서, `/profile` 엔드포인트로 들어온 요청은 세션 락을 획득합니다. 이 락이 유지되는 동안 같은 세션 ID를 공유하는 `/profile`이나 `/order` 엔드포인트로 들어온 추가 요청들은 첫 번째 요청이 끝날 때까지 대기하게 됩니다.

```
Route::post('/profile', function () {
    // ...
})->block($lockSeconds = 10, $waitSeconds = 10)

Route::post('/order', function () {
    // ...
})->block($lockSeconds = 10, $waitSeconds = 10)
```

`block` 메서드는 두 개의 선택적 인수를 받을 수 있습니다. 첫 번째 인수는 세션 락이 최대로 유지되어야 하는 시간을 초 단위로 지정합니다. 물론, 요청이 이 시간보다 먼저 종료되면 락도 그 시점에 해제됩니다.

두 번째 인수는 세션 락을 얻기 위해 요청이 대기할 최대 시간을 초 단위로 지정합니다. 만약 해당 시간 내에 세션 락을 얻지 못하면 `Illuminate\Contracts\Cache\LockTimeoutException` 예외가 발생합니다.

이 두 인수를 모두 생략하면, 기본으로 락은 최대 10초 동안 유지되고, 요청은 락 획득을 위해 최대 10초까지 대기합니다.

```
Route::post('/profile', function () {
    // ...
})->block()
```

<a name="adding-custom-session-drivers"></a>
## 사용자 정의 세션 드라이버 추가하기

<a name="implementing-the-driver"></a>
### 드라이버 구현하기

기존의 세션 드라이버가 애플리케이션의 요구에 맞지 않는다면, 직접 세션 핸들러를 작성할 수도 있습니다. 사용자 정의 세션 드라이버는 PHP 내장 `SessionHandlerInterface`를 구현해야 합니다. 이 인터페이스는 몇 가지 간단한 메서드로 이루어져 있습니다. 아래는 MongoDB에 적용한 예제 기본 구조입니다.

```
<?php

namespace App\Extensions;

class MongoSessionHandler implements \SessionHandlerInterface
{
    public function open($savePath, $sessionName) {}
    public function close() {}
    public function read($sessionId) {}
    public function write($sessionId, $data) {}
    public function destroy($sessionId) {}
    public function gc($lifetime) {}
}
```

> [!NOTE]
> 라라벨은 커스텀 확장 기능을 위한 폴더를 따로 제공하지 않습니다. 예제에서는 `Extensions` 디렉터리를 생성하여 `MongoSessionHandler`를 보관하고 있습니다. 이처럼, 자유롭게 원하는 경로에 파일을 생성하면 됩니다.

각 메서드의 역할이 직관적으로 와닿지 않을 수 있으니, 간단히 설명하겠습니다.

<div class="content-list" markdown="1">

- `open` 메서드는 주로 파일 기반 세션 저장소에서 사용됩니다. 라라벨이 이미 `file` 세션 드라이버를 제공하기 때문에, 대부분의 경우 이 부분은 비워도 무방합니다.
- `close` 메서드는 `open`과 비슷하게 대개 무시할 수 있습니다. 대부분의 드라이버에서 코드 작성이 필요하지 않습니다.
- `read` 메서드는 주어진 `$sessionId`와 연결된 세션 데이터를 문자열 형태로 반환해야 합니다. 데이터 직렬화 등 부가적인 처리는 할 필요가 없습니다. 라라벨이 알아서 처리해줍니다.
- `write` 메서드는 `$sessionId`와 연결된 `$data` 문자열을 MongoDB나 다른 영구 저장소에 기록해야 합니다. 여기서도 별도의 직렬화 처리는 필요 없습니다. 이미 라라벨이 처리합니다.
- `destroy` 메서드는 주어진 `$sessionId`와 연관된 데이터를 영구 저장소에서 제거해야 합니다.
- `gc`(garbage collection) 메서드는 주어진 `$lifetime` UNIX 타임스탬프보다 오래된 모든 세션 데이터를 삭제해야 합니다. Memcached나 Redis처럼 자동으로 만료되는 시스템의 경우, 이 메서드는 비워둬도 괜찮습니다.

</div>

<a name="registering-the-driver"></a>
### 드라이버 등록하기

드라이버를 구현했다면, 이제 라라벨에 해당 드라이버를 등록할 차례입니다. 라라벨의 세션 백엔드에 드라이버를 추가할 때는, `Session` [파사드](/docs/10.x/facades)가 제공하는 `extend` 메서드를 사용합니다. 이 메서드는 [서비스 프로바이더](/docs/10.x/providers)의 `boot` 메서드 안에서 호출하는 것이 좋습니다. 기본적으로 제공되는 `App\Providers\AppServiceProvider`에서 작성해도 되고, 완전히 새로운 프로바이더를 만들어도 무방합니다.

```
<?php

namespace App\Providers;

use App\Extensions\MongoSessionHandler;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\ServiceProvider;

class SessionServiceProvider extends ServiceProvider
{
    /**
     * 애플리케이션 서비스를 등록합니다.
     */
    public function register(): void
    {
        // ...
    }

    /**
     * 애플리케이션 서비스를 부트스트랩합니다.
     */
    public function boot(): void
    {
        Session::extend('mongo', function (Application $app) {
            // SessionHandlerInterface를 구현한 인스턴스를 반환합니다...
            return new MongoSessionHandler;
        });
    }
}
```

드라이버를 등록한 이후에는, `config/session.php` 설정 파일에서 `mongo` 드라이버를 사용할 수 있습니다.
