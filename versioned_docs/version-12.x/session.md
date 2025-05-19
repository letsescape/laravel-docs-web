# HTTP 세션 (HTTP Session)

- [소개](#introduction)
    - [설정](#configuration)
    - [드라이버 사전 준비 사항](#driver-prerequisites)
- [세션과 상호작용하기](#interacting-with-the-session)
    - [데이터 조회](#retrieving-data)
    - [데이터 저장](#storing-data)
    - [Flash 데이터](#flash-data)
    - [데이터 삭제](#deleting-data)
    - [세션 ID 재생성](#regenerating-the-session-id)
- [세션 블로킹](#session-blocking)
- [사용자 정의 세션 드라이버 추가](#adding-custom-session-drivers)
    - [드라이버 구현](#implementing-the-driver)
    - [드라이버 등록](#registering-the-driver)

<a name="introduction"></a>
## 소개

HTTP 기반 애플리케이션은 상태를 저장하지 않기 때문에, 세션은 여러 요청에 걸쳐 사용자 정보를 저장할 수 있는 방법을 제공합니다. 이러한 사용자 정보는 일반적으로 이후의 요청에서 접근할 수 있도록 영속적인 저장소(백엔드)에 저장됩니다.

라라벨은 다양한 세션 백엔드를 제공하며, 이를 일관된 통합 API로 사용할 수 있습니다. [Memcached](https://memcached.org), [Redis](https://redis.io), 데이터베이스 등과 같은 인기 있는 백엔드도 기본으로 지원합니다.

<a name="configuration"></a>
### 설정

애플리케이션의 세션 설정 파일은 `config/session.php`에 위치합니다. 이 파일에 있는 다양한 옵션들을 꼭 확인하십시오. 기본적으로 라라벨은 `database` 세션 드라이버를 사용하도록 설정되어 있습니다.

세션의 `driver` 설정 옵션은 각 요청마다 세션 데이터가 어디에 저장될지를 정의합니다. 라라벨은 여러 가지 드라이버를 제공합니다.

<div class="content-list" markdown="1">

- `file` - 세션이 `storage/framework/sessions`에 저장됩니다.
- `cookie` - 세션이 보안이 유지된 암호화된 쿠키에 저장됩니다.
- `database` - 세션이 관계형 데이터베이스에 저장됩니다.
- `memcached` / `redis` - 세션이 빠른 캐시 기반 저장소 중 하나에 저장됩니다.
- `dynamodb` - 세션이 AWS DynamoDB에 저장됩니다.
- `array` - 세션이 PHP 배열에 저장되며 영구적으로 저장되지 않습니다.

</div>

> [!NOTE]
> `array` 드라이버는 주로 [테스트](/docs/12.x/testing) 시에 사용하며, 세션에 저장한 데이터가 실제로 영구 저장되지 않습니다.

<a name="driver-prerequisites"></a>
### 드라이버 사전 준비 사항

<a name="database"></a>
#### 데이터베이스

`database` 세션 드라이버를 사용하려면, 세션 데이터를 저장할 데이터베이스 테이블이 필요합니다. 보통 라라벨의 기본 `0001_01_01_000000_create_users_table.php` [마이그레이션](/docs/12.x/migrations)에 포함되어 있습니다. 하지만 어떤 이유로든 `sessions` 테이블이 없는 경우, `make:session-table` Artisan 명령어를 사용해 마이그레이션 파일을 생성할 수 있습니다.

```shell
php artisan make:session-table

php artisan migrate
```

<a name="redis"></a>
#### Redis

라라벨에서 Redis 세션을 사용하려면, PECL을 통해 PhpRedis PHP 확장 프로그램을 설치하거나 Composer를 통해 `predis/predis` 패키지(~1.0)을 설치해야 합니다. Redis 설정에 관한 자세한 내용은 라라벨 [Redis 문서](/docs/12.x/redis#configuration)를 참고하십시오.

> [!NOTE]
> 세션 저장에 사용할 Redis 연결을 지정하려면 `SESSION_CONNECTION` 환경 변수나 `session.php` 설정 파일의 `connection` 옵션을 사용할 수 있습니다.

<a name="interacting-with-the-session"></a>
## 세션과 상호작용하기

<a name="retrieving-data"></a>
### 데이터 조회

라라벨에서 세션 데이터를 다루는 주요 방법은 전역 `session` 헬퍼와 `Request` 인스턴스를 사용하는 방식, 이렇게 두 가지가 있습니다. 먼저, `Request` 인스턴스를 통해 세션에 접근하는 방법을 살펴보겠습니다. 이 인스턴스는 라우트 클로저나 컨트롤러 메서드에서 타입 힌팅을 통해 받을 수 있습니다. 참고로, 컨트롤러 메서드의 의존성은 라라벨의 [서비스 컨테이너](/docs/12.x/container)에 의해 자동으로 주입됩니다.

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

세션에서 항목을 조회할 때, 두 번째 인수로 기본값을 전달할 수 있습니다. 만약 지정한 키가 세션에 존재하지 않으면 이 기본값이 반환됩니다. 기본값으로 클로저를 전달할 수도 있는데, 이 경우 요청한 키가 없을 때 해당 클로저가 실행되어 그 결과가 반환됩니다.

```php
$value = $request->session()->get('key', 'default');

$value = $request->session()->get('key', function () {
    return 'default';
});
```

<a name="the-global-session-helper"></a>
#### 전역 Session 헬퍼 사용

전역 PHP 함수인 `session`을 사용해 세션 데이터를 읽거나 저장할 수도 있습니다. 이 헬퍼에 문자열 하나를 전달하면 해당 세션 키의 값이 반환됩니다. 배열 형태로 키/값 쌍을 전달하면 그 값들이 세션에 저장됩니다.

```php
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
> HTTP 요청 인스턴스를 통해 세션을 사용하는 것과 전역 `session` 헬퍼를 사용하는 것에는 실질적인 차이가 거의 없습니다. 두 방식 모두 테스트 코드에서 `assertSessionHas` 메서드를 통해 [테스트할 수 있습니다](/docs/12.x/testing).

<a name="retrieving-all-session-data"></a>
#### 세션 데이터 전체 가져오기

세션의 모든 데이터를 한 번에 조회하고 싶다면 `all` 메서드를 사용할 수 있습니다.

```php
$data = $request->session()->all();
```

<a name="retrieving-a-portion-of-the-session-data"></a>
#### 세션 데이터의 일부만 조회하기

`only`와 `except` 메서드를 사용해 세션 데이터 중 일부만 선택적으로 조회할 수 있습니다.

```php
$data = $request->session()->only(['username', 'email']);

$data = $request->session()->except(['username', 'email']);
```

<a name="determining-if-an-item-exists-in-the-session"></a>
#### 세션에 항목이 존재하는지 확인하기

세션에 특정 항목이 존재하는지 확인하려면 `has` 메서드를 사용합니다. 이 메서드는 해당 항목이 존재하며 그 값이 `null`이 아니면 `true`를 반환합니다.

```php
if ($request->session()->has('users')) {
    // ...
}
```

값이 `null`이더라도 해당 키가 세션에 존재하는지 확인하려면 `exists` 메서드를 사용합니다.

```php
if ($request->session()->exists('users')) {
    // ...
}
```

세션에 항목이 존재하지 않는지 확인하고 싶을 때는 `missing` 메서드를 사용할 수 있습니다. 이 메서드는 항목이 없으면 `true`를 반환합니다.

```php
if ($request->session()->missing('users')) {
    // ...
}
```

<a name="storing-data"></a>
### 데이터 저장

세션에 데이터를 저장하려면 보통 `Request` 인스턴스의 `put` 메서드 또는 전역 `session` 헬퍼를 사용합니다.

```php
// Request 인스턴스를 통한 저장...
$request->session()->put('key', 'value');

// 전역 "session" 헬퍼를 통한 저장...
session(['key' => 'value']);
```

<a name="pushing-to-array-session-values"></a>
#### 배열 형태의 세션 값에 추가 저장하기

세션의 특정 키가 배열일 때, `push` 메서드를 사용하면 값 하나를 배열에 추가할 수 있습니다. 예를 들어, `user.teams` 키에 팀 이름의 배열이 저장되어 있으면, 다음과 같이 새로운 값을 추가할 수 있습니다.

```php
$request->session()->push('user.teams', 'developers');
```

<a name="retrieving-deleting-an-item"></a>
#### 값 조회와 동시에 삭제하기

`pull` 메서드는 세션에서 값을 가져오는 동시에 삭제해줍니다.

```php
$value = $request->session()->pull('key', 'default');
```

<a name="incrementing-and-decrementing-session-values"></a>
#### 세션 값의 증가/감소

세션에 정수 값이 저장되어 있고 이를 증가시키거나 감소시켜야 할 때는 `increment`와 `decrement` 메서드를 사용할 수 있습니다.

```php
$request->session()->increment('count');

$request->session()->increment('count', $incrementBy = 2);

$request->session()->decrement('count');

$request->session()->decrement('count', $decrementBy = 2);
```

<a name="flash-data"></a>
### Flash 데이터

간혹 세션에 특정 데이터를 바로 다음 요청에서만 사용할 목적으로 저장하고 싶을 때가 있습니다. 이럴 때는 `flash` 메서드를 사용합니다. 이 방식으로 저장한 데이터는 즉시 사용 가능하며 다음 HTTP 요청에서까지 유지됩니다. 그 이후에는 자동으로 삭제됩니다. 주로 짧은 안내 메시지 등을 전달하는 데 유용합니다.

```php
$request->session()->flash('status', 'Task was successful!');
```

Flash 데이터를 여러 요청에 걸쳐 유지해야 한다면, `reflash` 메서드를 사용해 Flash 데이터를 한 번 더 연장할 수 있습니다. 특정 Flash 데이터만 유지하고 싶다면 `keep` 메서드를 사용하면 됩니다.

```php
$request->session()->reflash();

$request->session()->keep(['username', 'email']);
```

Flash 데이터를 오직 현재 요청에서만 유지하려면, `now` 메서드를 사용할 수 있습니다.

```php
$request->session()->now('status', 'Task was successful!');
```

<a name="deleting-data"></a>
### 데이터 삭제

`forget` 메서드는 세션에서 특정 데이터를 삭제합니다. 세션의 모든 데이터를 한 번에 삭제하려면 `flush` 메서드를 사용할 수 있습니다.

```php
// 한 개의 키 삭제...
$request->session()->forget('name');

// 여러 개의 키 삭제...
$request->session()->forget(['name', 'status']);

$request->session()->flush();
```

<a name="regenerating-the-session-id"></a>
### 세션 ID 재생성

세션 ID를 재생성하는 것은 [세션 고정화(Session fixation)](https://owasp.org/www-community/attacks/Session_fixation) 공격으로부터 애플리케이션을 보호하는 데 자주 사용됩니다.

라라벨에서는 [애플리케이션 스타터 킷](/docs/12.x/starter-kits) 또는 [Laravel Fortify](/docs/12.x/fortify)를 사용할 경우, 인증 과정에서 세션 ID가 자동으로 재생성됩니다. 그러나 직접 세션 ID를 수동으로 재생성해야 한다면 `regenerate` 메서드를 사용할 수 있습니다.

```php
$request->session()->regenerate();
```

세션 ID를 재생성하면서 동시에 기존 세션의 모든 데이터를 삭제하고 싶다면, `invalidate` 메서드를 사용하면 됩니다.

```php
$request->session()->invalidate();
```

<a name="session-blocking"></a>
## 세션 블로킹

> [!WARNING]
> 세션 블로킹을 사용하려면, 애플리케이션이 [원자적 락](/docs/12.x/cache#atomic-locks)을 지원하는 캐시 드라이버를 사용해야 합니다. 현재 지원되는 캐시 드라이버는 `memcached`, `dynamodb`, `redis`, `mongodb`(공식 `mongodb/laravel-mongodb` 패키지 포함), `database`, `file`, `array` 입니다. 또한, `cookie` 세션 드라이버에서는 사용할 수 없습니다.

기본적으로 라라벨은 동일한 세션을 사용하는 여러 요청이 동시에 실행될 수 있도록 허용합니다. 예를 들어, 자바스크립트 HTTP 라이브러리로 두 개의 HTTP 요청을 동시에 보내면, 이 두 요청이 동시에 처리됩니다. 대부분의 애플리케이션에서는 이 방식이 문제가 되지 않지만, 서로 다른 엔드포인트에서 세션에 데이터를 동시에 쓸 때 극히 일부 경우에 세션 데이터 손실이 발생할 수 있습니다.

이런 문제를 예방하기 위해, 라라벨에서는 특정 세션에 대해 동시 요청 수를 제한하는 기능을 제공합니다. 시작하려면, 라우트 정의 끝에 `block` 메서드를 체이닝하면 됩니다. 아래 예시에서는 `/profile` 엔드포인트에 들어오는 요청이 세션 락을 획득하게 되고, 이 락이 유지되는 동안 같은 세션 ID로 `/profile`이나 `/order` 엔드포인트에 들어온 모든 요청은 첫 번째 요청이 처리될 때까지 대기하게 됩니다.

```php
Route::post('/profile', function () {
    // ...
})->block($lockSeconds = 10, $waitSeconds = 10);

Route::post('/order', function () {
    // ...
})->block($lockSeconds = 10, $waitSeconds = 10);
```

`block` 메서드는 두 개의 선택적 인수를 받습니다. 첫 번째 인수는 세션 락이 최대 몇 초 동안 유지될지를 지정합니다. 물론 요청이 그보다 빨리 끝나면 락도 바로 해제됩니다.

두 번째 인수는 요청이 락을 얻기 위해 최대 몇 초 동안 대기할지를 지정합니다. 정해진 시간 내에 락을 얻지 못하면 `Illuminate\Contracts\Cache\LockTimeoutException`이 발생합니다.

두 인수 모두 생략하면, 락은 기본으로 최대 10초 동안 유지되며, 요청은 락을 얻기 위해 최대 10초 동안 대기합니다.

```php
Route::post('/profile', function () {
    // ...
})->block();
```

<a name="adding-custom-session-drivers"></a>
## 사용자 정의 세션 드라이버 추가

<a name="implementing-the-driver"></a>
### 드라이버 구현

기존의 세션 드라이버가 애플리케이션에 맞지 않는 경우, 직접 세션 핸들러를 구현할 수 있습니다. 사용자 정의 세션 드라이버는 PHP의 내장 `SessionHandlerInterface`를 구현해야 합니다. 이 인터페이스에는 몇 가지 간단한 메서드만 포함되어 있습니다. 아래 몽고DB(MongoDB) 기반 스터브 예시를 참고하십시오.

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

라라벨에서는 확장 기능(extensions)을 위한 디렉터리가 기본 제공되지 않으므로, 원하는 위치에 코드를 저장해도 상관없습니다. 이 예제에서는 `Extensions` 디렉터리에 `MongoSessionHandler`를 배치했습니다.

각 메서드의 목적이 직관적으로 이해되지 않을 수 있으므로, 간단히 설명을 덧붙입니다.

<div class="content-list" markdown="1">

- `open` 메서드는 주로 파일 기반 세션 저장소에 사용됩니다. 라라벨에서 이미 `file` 세션 드라이버를 제공하므로 대부분 비워둬도 무방합니다.
- `close` 메서드 역시 `open`과 비슷하게 대개 무시해도 되며, 대부분의 드라이버에서 필요하지 않습니다.
- `read` 메서드는 주어진 `$sessionId`에 연관된 세션 데이터를 문자열로 반환해야 합니다. 라라벨이 내부적으로 직렬화/역직렬화를 처리하므로, 직접 별도의 인코딩 작업을 할 필요는 없습니다.
- `write` 메서드는 주어진 `$data` 문자열을 `$sessionId`와 함께 MongoDB 같은 영구 저장소에 저장해야 합니다. 역시 직접 직렬화 처리를 할 필요가 없습니다.
- `destroy` 메서드는 `$sessionId`와 연관된 데이터를 영구 저장소에서 삭제해야 합니다.
- `gc` 메서드는 지정된 `$lifetime`(UNIX 타임스탬프)보다 오래된 모든 세션 데이터를 삭제해야 합니다. Memcached, Redis처럼 자체 만료 기능이 있는 시스템에서는 비워둬도 됩니다.

</div>

<a name="registering-the-driver"></a>
### 드라이버 등록

드라이버 구현이 완료되면 라라벨에 등록할 수 있습니다. 라라벨의 세션 백엔드에 사용자 정의 드라이버를 추가하려면, `Session` [파사드](/docs/12.x/facades)에서 제공하는 `extend` 메서드를 사용하면 됩니다. 이 코드는 [서비스 프로바이더](/docs/12.x/providers)의 `boot` 메서드에서 실행해야 합니다. 기존의 `App\Providers\AppServiceProvider`에서 해도 되고, 별도의 프로바이더를 새로 만들어도 괜찮습니다.

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
            // SessionHandlerInterface 구현체 반환...
            return new MongoSessionHandler;
        });
    }
}
```

세션 드라이버가 등록되면, `SESSION_DRIVER` 환경 변수나 애플리케이션의 `config/session.php` 설정 파일에서 `mongo` 드라이버를 지정해 사용할 수 있습니다.

