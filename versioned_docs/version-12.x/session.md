# HTTP 세션 (HTTP Session)

- [소개](#introduction)
    - [설정](#configuration)
    - [드라이버 사전 준비사항](#driver-prerequisites)
- [세션과 상호작용하기](#interacting-with-the-session)
    - [데이터 조회](#retrieving-data)
    - [데이터 저장](#storing-data)
    - [Flash 데이터](#flash-data)
    - [데이터 삭제](#deleting-data)
    - [세션 ID 재생성](#regenerating-the-session-id)
- [세션 차단](#session-blocking)
- [커스텀 세션 드라이버 추가](#adding-custom-session-drivers)
    - [드라이버 구현](#implementing-the-driver)
    - [드라이버 등록](#registering-the-driver)

<a name="introduction"></a>
## 소개

HTTP 기반 애플리케이션은 상태를 유지하지 않으므로, 세션은 여러 HTTP 요청에 걸쳐 사용자 정보를 저장하는 방법을 제공합니다. 이런 사용자 정보는 일반적으로 이후 요청에서도 접근할 수 있도록 영속적인 저장소(백엔드)에 저장됩니다.

라라벨에서는 다양한 세션 백엔드를 사용할 수 있으며, 이들은 모두 일관된 API를 통해 간편하게 접근할 수 있습니다. [Memcached](https://memcached.org), [Redis](https://redis.io), 데이터베이스와 같은 유명한 백엔드도 기본적으로 지원됩니다.

<a name="configuration"></a>
### 설정

애플리케이션의 세션 설정 파일은 `config/session.php`에 위치합니다. 이 파일에서 제공되는 다양한 옵션을 꼭 확인해 보시기 바랍니다. 기본적으로 라라벨은 `database` 세션 드라이버를 사용하도록 설정되어 있습니다.

세션의 `driver` 설정 옵션은 각 요청에 대해 세션 데이터가 어디에 저장될지 지정합니다. 라라벨이 지원하는 드라이버는 다음과 같습니다.

<div class="content-list" markdown="1">

- `file` - 세션이 `storage/framework/sessions`에 저장됩니다.
- `cookie` - 세션이 보안이 유지되고 암호화된 쿠키에 저장됩니다.
- `database` - 세션이 관계형 데이터베이스에 저장됩니다.
- `memcached` / `redis` - 세션이 빠른 캐시 기반 저장소에 저장됩니다.
- `dynamodb` - 세션이 AWS DynamoDB에 저장됩니다.
- `array` - 세션이 PHP 배열에 저장되며, 영구적으로 보존되지 않습니다.

</div>

> [!NOTE]
> `array` 드라이버는 주로 [테스트](/docs/testing) 시에 사용되며, 세션에 저장된 데이터가 영구적으로 보존되지 않습니다.

<a name="driver-prerequisites"></a>
### 드라이버 사전 준비사항

<a name="database"></a>
#### 데이터베이스

`database` 세션 드라이버를 사용할 경우, 세션 데이터를 담을 데이터베이스 테이블이 필요합니다. 보통 이 테이블은 라라벨의 기본 제공 migration 파일인 `0001_01_01_000000_create_users_table.php` [데이터베이스 마이그레이션](/docs/migrations)에 포함되어 있습니다. 만약 `sessions` 테이블이 없다면, 아래와 같이 `make:session-table` Artisan 명령어로 migration 파일을 생성할 수 있습니다.

```shell
php artisan make:session-table

php artisan migrate
```

<a name="redis"></a>
#### Redis

라라벨에서 Redis 세션을 사용하려면, PECL을 통해 PhpRedis PHP 확장(extension)을 설치하거나, Composer로 `predis/predis` 패키지(~1.0)를 설치해야 합니다. Redis 설정에 대한 추가 정보는 라라벨 [Redis 문서](/docs/redis#configuration)를 참고하세요.

> [!NOTE]
> 세션 저장에 사용할 Redis 커넥션은 `SESSION_CONNECTION` 환경 변수 또는 `session.php` 설정 파일의 `connection` 옵션을 사용해 지정할 수 있습니다.

<a name="interacting-with-the-session"></a>
## 세션과 상호작용하기

<a name="retrieving-data"></a>
### 데이터 조회

라라벨에서 세션 데이터에 접근하는 방법은 크게 두 가지가 있습니다. 하나는 전역 `session` 헬퍼를 사용하는 방법이고, 또 하나는 `Request` 인스턴스를 이용하는 방법입니다. 먼저, 라우트 클로저나 컨트롤러 메서드에서 type-hint를 통해 DI되는 `Request` 인스턴스에서 세션에 접근하는 방법을 살펴보겠습니다. 참고로 컨트롤러 메서드의 의존성은 라라벨 [서비스 컨테이너](/docs/container)를 통해 자동으로 주입됩니다.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * Show the profile for the given user.
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

세션에서 값을 조회할 때, `get` 메서드의 두 번째 인수로 기본값을 지정할 수 있습니다. 지정한 키가 세션에 존재하지 않으면 이 기본값이 반환됩니다. 기본값에 클로저를 전달하는 경우, 해당 키가 없을 때 이 클로저가 실행되어 그 반환값이 기본값으로 사용됩니다.

```php
$value = $request->session()->get('key', 'default');

$value = $request->session()->get('key', function () {
    return 'default';
});
```

<a name="the-global-session-helper"></a>
#### 전역 Session 헬퍼

세션 데이터를 조회하거나 저장할 때 전역 `session` PHP 함수를 사용할 수도 있습니다. 이 헬퍼에 하나의 문자열 인자만 전달하면 해당 세션 키의 값을 반환합니다. 여러 개의 키-값 쌍이 들어 있는 배열을 인자로 전달하면, 해당 값들이 세션에 저장됩니다.

```php
Route::get('/home', function () {
    // 세션에서 특정 데이터 조회
    $value = session('key');

    // 기본값을 지정해서 조회
    $value = session('key', 'default');

    // 세션에 데이터 저장
    session(['key' => 'value']);
});
```

> [!NOTE]
> HTTP 요청 인스턴스를 통해 세션을 사용하는 것과 전역 `session` 헬퍼를 사용하는 것에는 실질적인 차이가 거의 없습니다. 두 방식 모두 모든 테스트에서 제공되는 `assertSessionHas` 메서드를 사용해 [테스트 가능](/docs/testing)합니다.

<a name="retrieving-all-session-data"></a>
#### 세션의 모든 데이터 조회

세션에 저장된 모든 데이터를 한 번에 가져오려면 `all` 메서드를 사용하면 됩니다.

```php
$data = $request->session()->all();
```

<a name="retrieving-a-portion-of-the-session-data"></a>
#### 세션 데이터의 일부만 조회

`only`와 `except` 메서드를 사용하면 세션 데이터의 일부만 선택적으로 조회할 수 있습니다.

```php
$data = $request->session()->only(['username', 'email']);

$data = $request->session()->except(['username', 'email']);
```

<a name="determining-if-an-item-exists-in-the-session"></a>
#### 세션에 항목이 존재하는지 확인하기

세션에 특정 항목이 존재하는지 확인하려면 `has` 메서드를 사용할 수 있습니다. 이 메서드는 해당 항목이 존재하고 값이 `null`이 아닌 경우에 `true`를 반환합니다.

```php
if ($request->session()->has('users')) {
    // ...
}
```

항목이 존재하는지 여부만 확인(값이 `null`이어도 존재 여부를 확인)하려면 `exists` 메서드를 사용할 수 있습니다.

```php
if ($request->session()->exists('users')) {
    // ...
}
```

세션에 항목이 존재하지 않는지를 확인하려면 `missing` 메서드를 사용하면 됩니다. 이 메서드는 해당 항목이 없을 때 `true`를 반환합니다.

```php
if ($request->session()->missing('users')) {
    // ...
}
```

<a name="storing-data"></a>
### 데이터 저장

세션에 데이터를 저장하려면 주로 요청 인스턴스의 `put` 메서드나 전역 `session` 헬퍼를 사용합니다.

```php
// 요청 인스턴스 사용
$request->session()->put('key', 'value');

// 전역 session 헬퍼 사용
session(['key' => 'value']);
```

<a name="pushing-to-array-session-values"></a>
#### 세션 배열 값에 값 추가하기

`push` 메서드를 이용하면 배열 형태로 저장된 세션 값에 새 항목을 추가할 수 있습니다. 예를 들어, `user.teams` 키 아래에 팀 이름 배열이 있다면, 아래처럼 새로운 값을 추가할 수 있습니다.

```php
$request->session()->push('user.teams', 'developers');
```

<a name="retrieving-deleting-an-item"></a>
#### 항목 조회 후 삭제하기

`pull` 메서드를 사용하면 세션에서 항목을 조회함과 동시에 삭제할 수 있습니다.

```php
$value = $request->session()->pull('key', 'default');
```

<a name="incrementing-and-decrementing-session-values"></a>
#### 세션 값 증가/감소시키기

세션 데이터에 정수가 저장되어 있고, 값을 증가(increment)하거나 감소(decrement)하고 싶다면 아래와 같은 메서드를 사용할 수 있습니다.

```php
$request->session()->increment('count');

$request->session()->increment('count', $incrementBy = 2);

$request->session()->decrement('count');

$request->session()->decrement('count', $decrementBy = 2);
```

<a name="flash-data"></a>
### Flash 데이터

때때로 다음 요청에서만 사용할 일회성 데이터를 세션에 저장하고 싶을 때가 있습니다. 이런 경우 `flash` 메서드를 사용하면 됩니다. 이 방법으로 저장한 데이터는 현재와 그 다음 HTTP 요청에서만 사용할 수 있으며, 그 다음 요청이 끝나면 자동으로 삭제됩니다. flash 데이터는 일시적인 상태 메시지 저장에 주로 활용됩니다.

```php
$request->session()->flash('status', 'Task was successful!');
```

flash 데이터를 여러 요청에 걸쳐 유지하려면 `reflash` 메서드를, 특정 flash 데이터만 연장하려면 `keep` 메서드를 사용할 수 있습니다.

```php
$request->session()->reflash();

$request->session()->keep(['username', 'email']);
```

flash 데이터를 현재 요청에서만 유지하고 싶다면, `now` 메서드를 사용할 수 있습니다.

```php
$request->session()->now('status', 'Task was successful!');
```

<a name="deleting-data"></a>
### 데이터 삭제

`forget` 메서드는 세션에 저장된 특정 데이터를 삭제합니다. 세션의 모든 데이터를 한 번에 삭제하려면 `flush` 메서드를 사용하세요.

```php
// 단일 키 제거
$request->session()->forget('name');

// 여러 키 제거
$request->session()->forget(['name', 'status']);

$request->session()->flush();
```

<a name="regenerating-the-session-id"></a>
### 세션 ID 재생성

세션 ID를 재생성하는 것은 악의적인 사용자가 애플리케이션에서 [세션 고정(session fixation)](https://owasp.org/www-community/attacks/Session_fixation) 공격을 악용하지 못하도록 하기 위해 자주 사용됩니다.

라라벨의 [애플리케이션 스타터 키트](/docs/starter-kits)나 [Laravel Fortify](/docs/fortify)를 사용하는 경우, 인증 시점에 자동으로 세션 ID가 재생성됩니다. 만약 직접 세션 ID를 재생성해야 할 경우, `regenerate` 메서드를 사용할 수 있습니다.

```php
$request->session()->regenerate();
```

세션 ID도 함께 재생성하면서 세션 데이터를 모두 초기화(삭제)하려면, `invalidate` 메서드를 사용하세요.

```php
$request->session()->invalidate();
```

<a name="session-blocking"></a>
## 세션 차단

> [!WARNING]
> 세션 차단 기능을 사용하려면, [원자적 락(atomic locks)](/docs/cache#atomic-locks)를 지원하는 캐시 드라이버를 사용해야 합니다. 현재 지원되는 드라이버로는 `memcached`, `dynamodb`, `redis`, `mongodb`(공식 `mongodb/laravel-mongodb` 패키지에서 제공), `database`, `file`, `array` 드라이버 등이 있습니다. 또한 `cookie` 세션 드라이버는 사용할 수 없습니다.

기본적으로, 라라벨은 동일한 세션을 사용하는 여러 요청이 동시에(concurrently) 실행될 수 있습니다. 예를 들어 JavaScript HTTP 라이브러리로 두 개의 요청을 동시에 보낼 경우, 이 두 요청이 동시에 실행됩니다. 대부분의 애플리케이션에서는 문제가 없지만, 서로 다른 엔드포인트에 동시에 요청을 보내 양쪽 모두 세션 데이터를 기록하는 드문 경우에는 세션 데이터 손실이 발생할 수 있습니다.

이런 문제를 방지하기 위해, 라라벨에서는 하나의 세션에 대해 동시 요청을 제한하는 기능을 제공합니다. 가장 간단하게는, 라우트 정의에 `block` 메서드를 체이닝하면 사용할 수 있습니다. 예를 들어, `/profile` 엔드포인트로 들어온 요청이 세션 락을 획득하게 되면, 해당 세션 ID를 공유하는 `/profile` 또는 `/order` 엔드포인트의 다른 요청들은 첫 번째 요청이 끝날 때까지 대기하게 됩니다.

```php
Route::post('/profile', function () {
    // ...
})->block($lockSeconds = 10, $waitSeconds = 10);

Route::post('/order', function () {
    // ...
})->block($lockSeconds = 10, $waitSeconds = 10);
```

`block` 메서드는 두 개의 선택적 인수를 받을 수 있습니다. 첫 번째 인수는 세션 락이 유지되어야 하는 최대 초(seconds)입니다. 요청이 인수보다 빨리 끝나면, 락은 즉시 해제됩니다.

두 번째 인수는 요청이 세션 락을 얻기 위해 대기해야 하는 최대 초(seconds)입니다. 제한 시간 내에 락을 얻지 못하면 `Illuminate\Contracts\Cache\LockTimeoutException` 예외가 발생합니다.

두 인수 모두 생략하면, 기본적으로 락은 최대 10초 동안 유지되며, 락을 얻기 위해 요청은 최대 10초까지 대기합니다.

```php
Route::post('/profile', function () {
    // ...
})->block();
```

<a name="adding-custom-session-drivers"></a>
## 커스텀 세션 드라이버 추가

<a name="implementing-the-driver"></a>
### 드라이버 구현

기본 제공되는 세션 드라이버로 원하는 요구사항을 만족할 수 없다면, 직접 세션 핸들러를 구현할 수도 있습니다. 커스텀 세션 드라이버는 PHP의 기본 제공 인터페이스인 `SessionHandlerInterface`를 구현하면 됩니다. 이 인터페이스는 몇 가지 간단한 메서드로 구성되어 있습니다. 아래는 MongoDB를 대상으로 하여 기본 형태만 정의한 예시입니다.

```php
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

라라벨에서는 커스텀 확장 코드를 위한 기본 디렉터리를 제공하지 않으므로 파일을 원하는 위치에 자유롭게 둘 수 있습니다. 이 예시에서는 `Extensions` 디렉터리를 만들어 `MongoSessionHandler`를 두었습니다.

이 메서드들의 역할이 바로 와닿지 않을 수 있으니, 각 메서드의 목적을 간단히 설명합니다.

<div class="content-list" markdown="1">

- `open` 메서드는 주로 파일 기반 세션 저장소에서 사용됩니다. 라라벨에는 이미 `file` 세션 드라이버가 포함되어 있어, 대부분의 경우 이 메서드는 비워둬도 됩니다.
- `close` 메서드도 마찬가지로 대부분의 드라이버에서는 필요 없습니다.
- `read` 메서드는 주어진 `$sessionId`에 해당하는 세션 데이터를 문자열로 반환해야 합니다. 세션 데이터 직렬화 등은 드라이버에서 처리할 필요가 없으며, 라라벨이 알아서 처리해줍니다.
- `write` 메서드는 지정된 `$sessionId`에 해당하는 `$data`(문자열)를 예를 들어 MongoDB와 같은 영속적 저장소에 기록하면 됩니다. 이때도 직렬화 등은 직접 할 필요가 없습니다.
- `destroy` 메서드는 `$sessionId`에 해당하는 세션 데이터를 저장소에서 삭제해야 합니다.
- `gc`(garbage collection) 메서드는 지정된 `$lifetime`(UNIX 타임스탬프)보다 오래된 모든 세션 데이터를 삭제해야 합니다. Memcached나 Redis처럼 자동 만료 기능이 제공되는 경우, 이 메서드는 비워두어도 됩니다.

</div>

<a name="registering-the-driver"></a>
### 드라이버 등록

드라이버가 준비되면, 이제 라라벨에 등록해야 합니다. 세션 백엔드에 추가적인 드라이버를 등록하려면, `Session` [파사드](/docs/facades)가 제공하는 `extend` 메서드를 사용하면 됩니다. `extend`는 [서비스 프로바이더](/docs/providers)의 `boot` 메서드 안에서 호출하는 것이 좋습니다. 기존의 `App\Providers\AppServiceProvider`를 사용해도 되고, 별도의 프로바이더를 만들어도 됩니다.

```php
<?php

namespace App\Providers;

use App\Extensions\MongoSessionHandler;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\ServiceProvider;

class SessionServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // ...
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Session::extend('mongo', function (Application $app) {
            // SessionHandlerInterface의 구현 인스턴스를 반환
            return new MongoSessionHandler;
        });
    }
}
```

세션 드라이버 등록이 끝나면, `SESSION_DRIVER` 환경 변수 또는 애플리케이션의 `config/session.php` 설정 파일에서 드라이버 이름을 `mongo`로 지정해 사용할 수 있습니다.
