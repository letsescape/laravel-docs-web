# HTTP 테스트 (HTTP Tests)

- [소개](#introduction)
- [요청 보내기](#making-requests)
    - [요청 헤더 커스터마이징](#customizing-request-headers)
    - [쿠키](#cookies)
    - [세션 / 인증](#session-and-authentication)
    - [응답 디버깅](#debugging-responses)
    - [예외 처리](#exception-handling)
- [JSON API 테스트](#testing-json-apis)
    - [플루언트 JSON 테스트](#fluent-json-testing)
- [파일 업로드 테스트](#testing-file-uploads)
- [뷰 테스트](#testing-views)
    - [Blade와 컴포넌트 렌더링](#rendering-blade-and-components)
- [사용 가능한 Assertion](#available-assertions)
    - [응답 Assertion](#response-assertions)
    - [인증 Assertion](#authentication-assertions)
    - [유효성 검증 Assertion](#validation-assertions)

<a name="introduction"></a>
## 소개

라라벨은 애플리케이션에 HTTP 요청을 보내고 그 응답을 확인할 수 있는 매우 직관적인 API를 제공합니다. 예를 들어, 아래에 정의된 기능 테스트를 참고해보세요.

```php tab=Pest
<?php

test('the application returns a successful response', function () {
    $response = $this->get('/');

    $response->assertStatus(200);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }
}
```

`get` 메서드는 애플리케이션에 `GET` 요청을 보내고, `assertStatus` 메서드는 반환된 응답의 HTTP 상태 코드가 주어진 값인지 확인합니다. 이처럼 간단한 assert를 제공할 뿐만 아니라, 라라벨에서는 응답 헤더, 본문 콘텐츠, JSON 구조 등 다양한 항목을 검사할 수 있는 여러 assertion도 함께 제공합니다.

<a name="making-requests"></a>
## 요청 보내기

테스트에서 애플리케이션에 요청을 보내려면 `get`, `post`, `put`, `patch`, `delete` 메서드 중 하나를 사용할 수 있습니다. 이 메서드들은 실제로 "진짜" HTTP 요청을 애플리케이션에 보내는 것이 아니라, 내부적으로 전체 네트워크 요청을 시뮬레이션합니다.

이러한 테스트 요청 메서드는 `Illuminate\Http\Response` 인스턴스를 반환하는 대신, [다양한 유용한 assertion](#available-assertions)을 사용할 수 있는 `Illuminate\Testing\TestResponse` 인스턴스를 반환합니다. 이를 통해 애플리케이션의 응답을 쉽고 다양하게 검사할 수 있습니다.

```php tab=Pest
<?php

test('basic request', function () {
    $response = $this->get('/');

    $response->assertStatus(200);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_a_basic_request(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }
}
```

일반적으로 각각의 테스트는 하나의 요청만 애플리케이션에 보내는 것이 좋습니다. 하나의 테스트 메서드 내에서 여러 요청을 실행하면 예기치 않은 동작이 발생할 수 있습니다.

> [!NOTE]
> 편의를 위해, 테스트 실행 시에는 CSRF 미들웨어가 자동으로 비활성화됩니다.

<a name="customizing-request-headers"></a>
### 요청 헤더 커스터마이징

요청을 보내기 전에 `withHeaders` 메서드를 이용해 요청의 헤더를 원하는 대로 커스터마이즈할 수 있습니다. 이 메서드는 원하는 커스텀 헤더를 요청에 쉽게 추가할 수 있도록 해줍니다.

```php tab=Pest
<?php

test('interacting with headers', function () {
    $response = $this->withHeaders([
        'X-Header' => 'Value',
    ])->post('/user', ['name' => 'Sally']);

    $response->assertStatus(201);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic functional test example.
     */
    public function test_interacting_with_headers(): void
    {
        $response = $this->withHeaders([
            'X-Header' => 'Value',
        ])->post('/user', ['name' => 'Sally']);

        $response->assertStatus(201);
    }
}
```

<a name="cookies"></a>
### 쿠키

요청을 보내기 전에 쿠키 값을 설정하려면 `withCookie` 또는 `withCookies` 메서드를 사용할 수 있습니다. `withCookie`는 쿠키 이름과 값을 각각 별도의 인수로 받고, `withCookies`는 이름/값 쌍의 배열을 인수로 받습니다.

```php tab=Pest
<?php

test('interacting with cookies', function () {
    $response = $this->withCookie('color', 'blue')->get('/');

    $response = $this->withCookies([
        'color' => 'blue',
        'name' => 'Taylor',
    ])->get('/');

    //
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_interacting_with_cookies(): void
    {
        $response = $this->withCookie('color', 'blue')->get('/');

        $response = $this->withCookies([
            'color' => 'blue',
            'name' => 'Taylor',
        ])->get('/');

        //
    }
}
```

<a name="session-and-authentication"></a>
### 세션 / 인증

라라벨은 HTTP 테스트 중 세션을 다룰 수 있도록 여러 헬퍼 메서드를 제공합니다. 먼저, `withSession` 메서드를 이용하면 세션 데이터에 배열 형태로 값을 미리 지정할 수 있습니다. 이는 애플리케이션에 요청을 보내기 전에 세션에 데이터를 채워넣을 때 유용합니다.

```php tab=Pest
<?php

test('interacting with the session', function () {
    $response = $this->withSession(['banned' => false])->get('/');

    //
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_interacting_with_the_session(): void
    {
        $response = $this->withSession(['banned' => false])->get('/');

        //
    }
}
```

라라벨의 세션은 일반적으로 현재 인증된 사용자의 상태 유지를 위해 사용됩니다. 그래서 `actingAs` 헬퍼 메서드를 이용하면 특정 사용자를 현재 사용자로 간단히 인증할 수 있습니다. 예를 들어, [모델 팩토리](/docs/eloquent-factories)를 이용해 사용자를 생성 후 인증할 수 있습니다.

```php tab=Pest
<?php

use App\Models\User;

test('an action that requires authentication', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->withSession(['banned' => false])
        ->get('/');

    //
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_an_action_that_requires_authentication(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->withSession(['banned' => false])
            ->get('/');

        //
    }
}
```

또한, `actingAs` 메서드의 두 번째 인수로 인증에 사용할 가드(guard) 이름을 지정할 수도 있습니다. `actingAs`에 지정한 가드는 테스트가 실행되는 동안 기본 가드로 사용됩니다.

```php
$this->actingAs($user, 'web')
```

<a name="debugging-responses"></a>
### 응답 디버깅

테스트 요청 후 응답의 내용을 확인하거나 디버깅할 때는 `dump`, `dumpHeaders`, `dumpSession` 메서드를 사용할 수 있습니다.

```php tab=Pest
<?php

test('basic test', function () {
    $response = $this->get('/');

    $response->dumpHeaders();

    $response->dumpSession();

    $response->dump();
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_basic_test(): void
    {
        $response = $this->get('/');

        $response->dumpHeaders();

        $response->dumpSession();

        $response->dump();
    }
}
```

또는, 응답에 대한 정보를 출력하고 즉시 실행을 중단하려면 `dd`, `ddHeaders`, `ddBody`, `ddJson`, `ddSession` 메서드를 사용할 수 있습니다.

```php tab=Pest
<?php

test('basic test', function () {
    $response = $this->get('/');

    $response->dd();
    $response->ddHeaders();
    $response->ddBody();
    $response->ddJson();
    $response->ddSession();
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_basic_test(): void
    {
        $response = $this->get('/');

        $response->dd();
        $response->ddHeaders();
        $response->ddBody();
        $response->ddJson();
        $response->ddSession();
    }
}
```

<a name="exception-handling"></a>
### 예외 처리

가끔은 애플리케이션이 특정 예외를 발생시키는지 테스트해야 할 때가 있습니다. 이럴 때는 `Exceptions` 파사드를 이용해서 예외 핸들러를 "가짜(fake)"로 만들 수 있습니다. 예외 핸들러가 가짜로 설정된 후에는, 해당 요청 중에 발생한 예외에 대해 `assertReported`와 `assertNotReported` 메서드를 이용해 assert를 수행할 수 있습니다.

```php tab=Pest
<?php

use App\Exceptions\InvalidOrderException;
use Illuminate\Support\Facades\Exceptions;

test('exception is thrown', function () {
    Exceptions::fake();

    $response = $this->get('/order/1');

    // Assert an exception was thrown...
    Exceptions::assertReported(InvalidOrderException::class);

    // Assert against the exception...
    Exceptions::assertReported(function (InvalidOrderException $e) {
        return $e->getMessage() === 'The order was invalid.';
    });
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use App\Exceptions\InvalidOrderException;
use Illuminate\Support\Facades\Exceptions;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_exception_is_thrown(): void
    {
        Exceptions::fake();

        $response = $this->get('/');

        // Assert an exception was thrown...
        Exceptions::assertReported(InvalidOrderException::class);

        // Assert against the exception...
        Exceptions::assertReported(function (InvalidOrderException $e) {
            return $e->getMessage() === 'The order was invalid.';
        });
    }
}
```

`assertNotReported`와 `assertNothingReported` 메서드는 해당 요청 동안 특정 예외가 발생하지 않았거나, 어떠한 예외도 발생하지 않았는지 assert하는 데 사용할 수 있습니다.

```php
Exceptions::assertNotReported(InvalidOrderException::class);

Exceptions::assertNothingReported();
```

특정 요청에 대해 예외 처리를 완전히 비활성화하려면, 요청을 보내기 전에 `withoutExceptionHandling` 메서드를 호출하면 됩니다.

```php
$response = $this->withoutExceptionHandling()->get('/');
```

또한, 애플리케이션이 PHP나 사용하는 라이브러리에서 더 이상 사용되지 않는(deprecated) 기능을 이용하지 않는지 확인하고자 한다면, 요청 전에 `withoutDeprecationHandling` 메서드를 호출할 수 있습니다. deprecation 핸들링을 비활성화하면, deprecation 경고가 예외로 변환되어 테스트가 실패하게 됩니다.

```php
$response = $this->withoutDeprecationHandling()->get('/');
```

`assertThrows` 메서드는 특정 클로저 내부에서 지정한 예외 타입이 실제 발생하는지 assert할 때 사용할 수 있습니다.

```php
$this->assertThrows(
    fn () => (new ProcessOrder)->execute(),
    OrderInvalid::class
);
```

만약 실제 발생한 예외로 추가적인 검사(assert)를 하고 싶다면, `assertThrows` 메서드의 두 번째 인수로 클로저를 전달할 수 있습니다.

```php
$this->assertThrows(
    fn () => (new ProcessOrder)->execute(),
    fn (OrderInvalid $e) => $e->orderId() === 123;
);
```

`assertDoesntThrow` 메서드는 주어진 클로저 내 코드에서 어떠한 예외도 발생하지 않았는지 assert하는 데 사용할 수 있습니다.

```php
$this->assertDoesntThrow(fn () => (new ProcessOrder)->execute());
```

<a name="testing-json-apis"></a>
## JSON API 테스트

라라벨은 JSON API와 그 응답을 테스트할 수 있는 여러 헬퍼도 제공합니다. 예를 들어, 다양한 HTTP 메서드에 맞춰 `json`, `getJson`, `postJson`, `putJson`, `patchJson`, `deleteJson`, `optionsJson` 메서드를 이용해 JSON 요청을 쉽게 보낼 수 있습니다. 데이터와 헤더 역시 쉽게 전달할 수 있습니다. 먼저, `/api/user` 엔드포인트에 `POST` 요청을 보내고, 예상한 JSON 데이터가 반환되었는지 확인하는 테스트를 작성해보겠습니다.

```php tab=Pest
<?php

test('making an api request', function () {
    $response = $this->postJson('/api/user', ['name' => 'Sally']);

    $response
        ->assertStatus(201)
        ->assertJson([
            'created' => true,
        ]);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic functional test example.
     */
    public function test_making_an_api_request(): void
    {
        $response = $this->postJson('/api/user', ['name' => 'Sally']);

        $response
            ->assertStatus(201)
            ->assertJson([
                'created' => true,
            ]);
    }
}
```

그리고 JSON 응답 데이터를 배열 변수처럼 바로 접근할 수 있기 때문에, JSON 응답 내 개별 값을 쉽게 검사할 수 있습니다.

```php tab=Pest
expect($response['created'])->toBeTrue();
```

```php tab=PHPUnit
$this->assertTrue($response['created']);
```

> [!NOTE]
> `assertJson` 메서드는 응답을 배열로 변환한 뒤, 주어진 배열이 애플리케이션에서 반환된 JSON 응답 내에 존재하는지 검사합니다. 즉, JSON 응답에 다른 속성이 있더라도, 해당 단편(fragment)이 포함되어 있기만 하면 이 테스트는 통과합니다.

<a name="verifying-exact-match"></a>
#### 정확한 JSON 일치 확인

앞에서 살펴본 것처럼, `assertJson` 메서드는 JSON 응답 내에 특정한 JSON 단편(fragment)이 존재하는지만 확인합니다. 만약 지정한 배열이 애플리케이션이 반환하는 JSON과 **정확히 일치**하는지 검사하고 싶다면, `assertExactJson` 메서드를 사용해야 합니다.

```php tab=Pest
<?php

test('asserting an exact json match', function () {
    $response = $this->postJson('/user', ['name' => 'Sally']);

    $response
        ->assertStatus(201)
        ->assertExactJson([
            'created' => true,
        ]);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic functional test example.
     */
    public function test_asserting_an_exact_json_match(): void
    {
        $response = $this->postJson('/user', ['name' => 'Sally']);

        $response
            ->assertStatus(201)
            ->assertExactJson([
                'created' => true,
            ]);
    }
}
```

<a name="verifying-json-paths"></a>
#### JSON 경로 기반 값 확인

JSON 응답에서 지정한 경로에 특정 데이터가 존재하는지 확인하려면, `assertJsonPath` 메서드를 사용하면 됩니다.

```php tab=Pest
<?php

test('asserting a json path value', function () {
    $response = $this->postJson('/user', ['name' => 'Sally']);

    $response
        ->assertStatus(201)
        ->assertJsonPath('team.owner.name', 'Darian');
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic functional test example.
     */
    public function test_asserting_a_json_paths_value(): void
    {
        $response = $this->postJson('/user', ['name' => 'Sally']);

        $response
            ->assertStatus(201)
            ->assertJsonPath('team.owner.name', 'Darian');
    }
}
```

`assertJsonPath` 메서드는 클로저도 받을 수 있어서, Assertion 성공 여부를 동적으로 판단할 수도 있습니다.

```php
$response->assertJsonPath('team.owner.name', fn (string $name) => strlen($name) >= 3);
```

<a name="fluent-json-testing"></a>

### 유연한(Fluent) JSON 테스트

라라벨은 애플리케이션의 JSON 응답을 유연하게 테스트할 수 있는 아름다운 방법도 제공합니다. 먼저, `assertJson` 메서드에 클로저를 전달해 시작할 수 있습니다. 이 클로저는 `Illuminate\Testing\Fluent\AssertableJson` 인스턴스를 인자로 받아, 반환된 JSON에 대해 다양한 assert(확인)를 할 수 있게 해줍니다. JSON의 특정 속성(attribute)에 대해 검증하려면 `where` 메서드를, 특정 속성이 JSON에 없는지 확인하려면 `missing` 메서드를 사용합니다.

```php tab=Pest
use Illuminate\Testing\Fluent\AssertableJson;

test('fluent json', function () {
    $response = $this->getJson('/users/1');

    $response
        ->assertJson(fn (AssertableJson $json) =>
            $json->where('id', 1)
                ->where('name', 'Victoria Faith')
                ->where('email', fn (string $email) => str($email)->is('victoria@gmail.com'))
                ->whereNot('status', 'pending')
                ->missing('password')
                ->etc()
        );
});
```

```php tab=PHPUnit
use Illuminate\Testing\Fluent\AssertableJson;

/**
 * A basic functional test example.
 */
public function test_fluent_json(): void
{
    $response = $this->getJson('/users/1');

    $response
        ->assertJson(fn (AssertableJson $json) =>
            $json->where('id', 1)
                ->where('name', 'Victoria Faith')
                ->where('email', fn (string $email) => str($email)->is('victoria@gmail.com'))
                ->whereNot('status', 'pending')
                ->missing('password')
                ->etc()
        );
}
```

#### `etc` 메서드 이해하기

위 예제에서 assertion 체인의 마지막에 `etc` 메서드를 호출한 것을 볼 수 있습니다. 이 메서드는 JSON 객체에 추가적인 속성이 있을 수 있음을 라라벨에 알려줍니다. 만약 `etc` 메서드를 사용하지 않는다면, 명시적으로 검증하지 않은 다른 속성이 JSON 객체에 존재할 경우 테스트가 실패합니다.

이러한 동작의 의도는, JSON 응답에 민감한 정보가 의도치 않게 노출되지 않도록, 속성에 대해 명시적으로 검증하거나 `etc` 메서드를 통해 별도의 속성 허용을 강제하기 위한 것입니다.

단, `etc` 메서드가 assertion 체인에 포함되어 있지 않다고 해서, 추가적인 속성이 중첩 배열 내부에 추가되지 않았음을 보장하는 것은 아닙니다. `etc` 메서드는 해당 중첩 레벨에 한해서만 추가 속성이 없는지를 확인합니다.

<a name="asserting-json-attribute-presence-and-absence"></a>
#### JSON 속성의 존재/부재 검증

특정 속성이 존재하는지 또는 없는지 검증하려면, `has` 및 `missing` 메서드를 사용할 수 있습니다.

```php
$response->assertJson(fn (AssertableJson $json) =>
    $json->has('data')
        ->missing('message')
);
```

또한, `hasAll`과 `missingAll` 메서드를 사용하면 여러 속성의 존재 또는 부재를 한 번에 검증할 수 있습니다.

```php
$response->assertJson(fn (AssertableJson $json) =>
    $json->hasAll(['status', 'data'])
        ->missingAll(['message', 'code'])
);
```

주어진 여러 속성 중 최소한 하나라도 존재하는지 확인하기 위해서는 `hasAny` 메서드를 사용할 수 있습니다.

```php
$response->assertJson(fn (AssertableJson $json) =>
    $json->has('status')
        ->hasAny('data', 'message', 'code')
);
```

<a name="asserting-against-json-collections"></a>
#### JSON 컬렉션에 대한 검증

보통 라우트가 여러 항목(예: 여러 사용자)을 포함하는 JSON 응답을 반환할 때가 있습니다.

```php
Route::get('/users', function () {
    return User::all();
});
```

이러한 경우, 유연한 JSON 객체의 `has` 메서드를 사용해 응답 내에 포함된 사용자들을 검증할 수 있습니다. 예를 들어, JSON 응답에 3명의 사용자가 포함되어 있는지 확인한 후, `first` 메서드를 이용하여 컬렉션의 첫 번째 사용자에 대해 추가로 검증해볼 수 있습니다. `first` 메서드는 또 다른 assertable JSON 인스턴스를 클로저로 받아, 해당 객체에 대해 검증을 수행할 수 있게 해줍니다.

```php
$response
    ->assertJson(fn (AssertableJson $json) =>
        $json->has(3)
            ->first(fn (AssertableJson $json) =>
                $json->where('id', 1)
                    ->where('name', 'Victoria Faith')
                    ->where('email', fn (string $email) => str($email)->is('victoria@gmail.com'))
                    ->missing('password')
                    ->etc()
            )
    );
```

<a name="scoping-json-collection-assertions"></a>
#### JSON 컬렉션 검증 범위 지정하기

경우에 따라 라라벨 라우트가 이름이 지정된 키에 할당된 JSON 컬렉션을 반환할 수 있습니다.

```php
Route::get('/users', function () {
    return [
        'meta' => [...],
        'users' => User::all(),
    ];
})
```

이런 라우트를 테스트할 때는, `has` 메서드를 사용해 컬렉션 내 항목의 개수를 검증할 수 있습니다. 또한, `has` 메서드를 이용하여 assertion 체인을 특정 범위로 지정할 수도 있습니다.

```php
$response
    ->assertJson(fn (AssertableJson $json) =>
        $json->has('meta')
            ->has('users', 3)
            ->has('users.0', fn (AssertableJson $json) =>
                $json->where('id', 1)
                    ->where('name', 'Victoria Faith')
                    ->where('email', fn (string $email) => str($email)->is('victoria@gmail.com'))
                    ->missing('password')
                    ->etc()
            )
    );
```

하지만, `users` 컬렉션에 대해 두 번의 `has` 호출 대신, 세 번째 인자로 클로저를 전달해 한 번만 호출할 수도 있습니다. 이 경우, 클로저는 자동으로 컬렉션의 첫 번째 항목에 범위가 지정됩니다.

```php
$response
    ->assertJson(fn (AssertableJson $json) =>
        $json->has('meta')
            ->has('users', 3, fn (AssertableJson $json) =>
                $json->where('id', 1)
                    ->where('name', 'Victoria Faith')
                    ->where('email', fn (string $email) => str($email)->is('victoria@gmail.com'))
                    ->missing('password')
                    ->etc()
            )
    );
```

<a name="asserting-json-types"></a>
#### JSON 속성 타입 검증

JSON 응답의 속성이 특정 타입인지 검증만 하고 싶을 수도 있습니다. 이를 위해 `Illuminate\Testing\Fluent\AssertableJson` 클래스는 `whereType` 및 `whereAllType` 메서드를 제공합니다.

```php
$response->assertJson(fn (AssertableJson $json) =>
    $json->whereType('id', 'integer')
        ->whereAllType([
            'users.0.name' => 'string',
            'meta' => 'array'
        ])
);
```

여러 타입을 사용하려면 `|` 문자를 사용하거나, 두 번째 인자에 타입 배열을 전달하면 됩니다. 응답 값이 지정한 타입 중 하나라도 일치하면 검증이 성공합니다.

```php
$response->assertJson(fn (AssertableJson $json) =>
    $json->whereType('name', 'string|null')
        ->whereType('id', ['string', 'integer'])
);
```

`whereType` 및 `whereAllType` 메서드가 인식하는 타입은 다음과 같습니다: `string`, `integer`, `double`, `boolean`, `array`, `null`.

<a name="testing-file-uploads"></a>
## 파일 업로드 테스트

`Illuminate\Http\UploadedFile` 클래스의 `fake` 메서드를 사용하면 테스트용 가짜 파일이나 이미지를 쉽게 생성할 수 있습니다. 여기에 `Storage` 파사드의 `fake` 메서드를 조합하면 파일 업로드 테스트가 훨씬 간편해집니다. 예를 들어, 이 두 기능을 함께 활용하여 아바타 업로드 폼을 손쉽게 테스트할 수 있습니다.

```php tab=Pest
<?php

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('avatars can be uploaded', function () {
    Storage::fake('avatars');

    $file = UploadedFile::fake()->image('avatar.jpg');

    $response = $this->post('/avatar', [
        'avatar' => $file,
    ]);

    Storage::disk('avatars')->assertExists($file->hashName());
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_avatars_can_be_uploaded(): void
    {
        Storage::fake('avatars');

        $file = UploadedFile::fake()->image('avatar.jpg');

        $response = $this->post('/avatar', [
            'avatar' => $file,
        ]);

        Storage::disk('avatars')->assertExists($file->hashName());
    }
}
```

특정 파일이 존재하지 않는지 검증하고 싶을 때는, `Storage` 파사드에서 제공하는 `assertMissing` 메서드를 사용할 수 있습니다.

```php
Storage::fake('avatars');

// ...

Storage::disk('avatars')->assertMissing('missing.jpg');
```

<a name="fake-file-customization"></a>
#### 가짜 파일 커스터마이징

`UploadedFile` 클래스의 `fake` 메서드로 파일을 만들 때, 이미지의 가로, 세로 크기와 파일 용량(킬로바이트 단위)을 지정하여 애플리케이션의 파일 유효성 검증 규칙을 좀 더 세밀하게 테스트할 수도 있습니다.

```php
UploadedFile::fake()->image('avatar.jpg', $width, $height)->size(100);
```

이미지뿐만 아니라, `create` 메서드를 사용하면 다른 유형의 파일도 생성할 수 있습니다.

```php
UploadedFile::fake()->create('document.pdf', $sizeInKilobytes);
```

필요하다면, 메서드에 `$mimeType` 인자를 전달해, 반환될 파일의 MIME 타입을 명시적으로 지정할 수도 있습니다.

```php
UploadedFile::fake()->create(
    'document.pdf', $sizeInKilobytes, 'application/pdf'
);
```

<a name="testing-views"></a>
## 뷰(View) 테스트

라라벨에서는 애플리케이션으로 HTTP 요청을 모방해서 보내지 않고도 뷰를 직접 렌더링해 볼 수 있습니다. 이를 위해 테스트 내에서 `view` 메서드를 호출하세요. 이 메서드는 뷰 이름과, 선택적으로 뷰에 전달할 데이터를 배열로 받을 수 있습니다. 반환값은 `Illuminate\Testing\TestView` 인스턴스로, 뷰의 내용을 편리하게 검증할 수 있는 여러 메서드를 제공합니다.

```php tab=Pest
<?php

test('a welcome view can be rendered', function () {
    $view = $this->view('welcome', ['name' => 'Taylor']);

    $view->assertSee('Taylor');
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_a_welcome_view_can_be_rendered(): void
    {
        $view = $this->view('welcome', ['name' => 'Taylor']);

        $view->assertSee('Taylor');
    }
}
```

`TestView` 클래스는 다음과 같은 assertion 메서드를 제공합니다: `assertSee`, `assertSeeInOrder`, `assertSeeText`, `assertSeeTextInOrder`, `assertDontSee`, `assertDontSeeText`.

필요하다면, `TestView` 인스턴스를 문자열로 캐스팅하여 렌더링된 원본 뷰 내용을 가져올 수 있습니다.

```php
$contents = (string) $this->view('welcome');
```

<a name="sharing-errors"></a>
#### 에러(Error) 공유하기

일부 뷰에서는 라라벨이 전역으로 제공하는 [에러 백(error bag)](/docs/validation#quick-displaying-the-validation-errors)과 함께 동작해야 할 때가 있습니다. 이러한 에러 메시지로 에러 백을 채우려면, `withViewErrors` 메서드를 사용할 수 있습니다.

```php
$view = $this->withViewErrors([
    'name' => ['Please provide a valid name.']
])->view('form');

$view->assertSee('Please provide a valid name.');
```

<a name="rendering-blade-and-components"></a>
### Blade와 컴포넌트 렌더링

필요하다면, `blade` 메서드를 사용해 [Blade](/docs/blade) 원본 문자열을 직접 평가하고 렌더링할 수 있습니다. `view` 메서드와 마찬가지로, `blade` 메서드 역시 `Illuminate\Testing\TestView` 인스턴스를 반환합니다.

```php
$view = $this->blade(
    '<x-component :name="$name" />',
    ['name' => 'Taylor']
);

$view->assertSee('Taylor');
```

[Blade 컴포넌트](/docs/blade#components)를 평가하고 렌더링하려면, `component` 메서드를 사용할 수 있습니다. 이 메서드는 `Illuminate\Testing\TestComponent` 인스턴스를 반환합니다.

```php
$view = $this->component(Profile::class, ['name' => 'Taylor']);

$view->assertSee('Taylor');
```

<a name="available-assertions"></a>
## 사용 가능한 Assertion 목록

<a name="response-assertions"></a>
### 응답(Response) Assertion

라라벨의 `Illuminate\Testing\TestResponse` 클래스는 애플리케이션 테스트 시 사용할 수 있는 다양한 커스텀 assertion 메서드를 제공합니다. 이 assertion들은 `json`, `get`, `post`, `put`, `delete` 등의 테스트 메서드로부터 반환된 응답 객체에서 사용할 수 있습니다.



<div class="collection-method-list" markdown="1">

[assertAccepted](#assert-accepted)
[assertBadRequest](#assert-bad-request)
[assertConflict](#assert-conflict)
[assertCookie](#assert-cookie)
[assertCookieExpired](#assert-cookie-expired)
[assertCookieNotExpired](#assert-cookie-not-expired)
[assertCookieMissing](#assert-cookie-missing)
[assertCreated](#assert-created)
[assertDontSee](#assert-dont-see)
[assertDontSeeText](#assert-dont-see-text)
[assertDownload](#assert-download)
[assertExactJson](#assert-exact-json)
[assertExactJsonStructure](#assert-exact-json-structure)
[assertForbidden](#assert-forbidden)
[assertFound](#assert-found)
[assertGone](#assert-gone)
[assertHeader](#assert-header)
[assertHeaderMissing](#assert-header-missing)
[assertInternalServerError](#assert-internal-server-error)
[assertJson](#assert-json)
[assertJsonCount](#assert-json-count)
[assertJsonFragment](#assert-json-fragment)
[assertJsonIsArray](#assert-json-is-array)
[assertJsonIsObject](#assert-json-is-object)
[assertJsonMissing](#assert-json-missing)
[assertJsonMissingExact](#assert-json-missing-exact)
[assertJsonMissingValidationErrors](#assert-json-missing-validation-errors)
[assertJsonPath](#assert-json-path)
[assertJsonMissingPath](#assert-json-missing-path)
[assertJsonStructure](#assert-json-structure)
[assertJsonValidationErrors](#assert-json-validation-errors)
[assertJsonValidationErrorFor](#assert-json-validation-error-for)
[assertLocation](#assert-location)
[assertMethodNotAllowed](#assert-method-not-allowed)
[assertMovedPermanently](#assert-moved-permanently)
[assertContent](#assert-content)
[assertNoContent](#assert-no-content)
[assertStreamed](#assert-streamed)
[assertStreamedContent](#assert-streamed-content)
[assertNotFound](#assert-not-found)
[assertOk](#assert-ok)
[assertPaymentRequired](#assert-payment-required)
[assertPlainCookie](#assert-plain-cookie)
[assertRedirect](#assert-redirect)
[assertRedirectBack](#assert-redirect-back)
[assertRedirectContains](#assert-redirect-contains)
[assertRedirectToRoute](#assert-redirect-to-route)
[assertRedirectToSignedRoute](#assert-redirect-to-signed-route)
[assertRequestTimeout](#assert-request-timeout)
[assertSee](#assert-see)
[assertSeeInOrder](#assert-see-in-order)
[assertSeeText](#assert-see-text)
[assertSeeTextInOrder](#assert-see-text-in-order)
[assertServerError](#assert-server-error)
[assertServiceUnavailable](#assert-service-unavailable)
[assertSessionHas](#assert-session-has)
[assertSessionHasInput](#assert-session-has-input)
[assertSessionHasAll](#assert-session-has-all)
[assertSessionHasErrors](#assert-session-has-errors)
[assertSessionHasErrorsIn](#assert-session-has-errors-in)
[assertSessionHasNoErrors](#assert-session-has-no-errors)
[assertSessionDoesntHaveErrors](#assert-session-doesnt-have-errors)
[assertSessionMissing](#assert-session-missing)
[assertStatus](#assert-status)
[assertSuccessful](#assert-successful)
[assertTooManyRequests](#assert-too-many-requests)
[assertUnauthorized](#assert-unauthorized)
[assertUnprocessable](#assert-unprocessable)
[assertUnsupportedMediaType](#assert-unsupported-media-type)
[assertValid](#assert-valid)
[assertInvalid](#assert-invalid)
[assertViewHas](#assert-view-has)
[assertViewHasAll](#assert-view-has-all)
[assertViewIs](#assert-view-is)
[assertViewMissing](#assert-view-missing)

</div>

<a name="assert-bad-request"></a>
#### assertBadRequest

응답의 HTTP 상태 코드가 bad request(400)임을 검증합니다.

```php
$response->assertBadRequest();
```

<a name="assert-accepted"></a>
#### assertAccepted

응답의 HTTP 상태 코드가 accepted(202)임을 검증합니다.

```php
$response->assertAccepted();
```

<a name="assert-conflict"></a>
#### assertConflict

응답의 HTTP 상태 코드가 conflict(409)임을 검증합니다.

```php
$response->assertConflict();
```

<a name="assert-cookie"></a>
#### assertCookie

응답에 지정한 쿠키가 포함되어 있는지 검증합니다.

```php
$response->assertCookie($cookieName, $value = null);
```

<a name="assert-cookie-expired"></a>
#### assertCookieExpired

응답에 지정한 쿠키가 존재하고, 만료되었는지 검증합니다.

```php
$response->assertCookieExpired($cookieName);
```

<a name="assert-cookie-not-expired"></a>
#### assertCookieNotExpired

응답에 지정한 쿠키가 존재하고, 만료되지 않았는지 검증합니다.

```php
$response->assertCookieNotExpired($cookieName);
```

<a name="assert-cookie-missing"></a>
#### assertCookieMissing

응답에 지정한 쿠키가 포함되어 있지 않은지 검증합니다.

```php
$response->assertCookieMissing($cookieName);
```

<a name="assert-created"></a>
#### assertCreated

응답의 HTTP 상태 코드가 201임을 검증합니다.

```php
$response->assertCreated();
```

<a name="assert-dont-see"></a>
#### assertDontSee

응답 내에 주어진 문자열이 포함되어 있지 않은지 검증합니다. 두 번째 인자에 `false`를 전달하지 않는 한, 지정한 문자열은 자동으로 escape 처리됩니다.

```php
$response->assertDontSee($value, $escape = true);
```

<a name="assert-dont-see-text"></a>
#### assertDontSeeText

응답 텍스트에 주어진 문자열이 포함되어 있지 않은지 검증합니다. 두 번째 인자에 `false`를 전달하지 않는 한, 지정한 문자열은 자동으로 escape 처리됩니다. 이 메서드는 assertion 전에 응답의 내용을 PHP의 `strip_tags` 함수로 처리합니다.

```php
$response->assertDontSeeText($value, $escape = true);
```

<a name="assert-download"></a>
#### assertDownload

응답이 "다운로드"임을 검증합니다. 일반적으로 해당 라우트가 `Response::download` 응답, `BinaryFileResponse`, 또는 `Storage::download` 응답을 반환한 경우에 해당합니다.

```php
$response->assertDownload();
```

원한다면, 다운로드되는 파일이 지정한 파일명과 일치하는지 추가로 검증할 수 있습니다.

```php
$response->assertDownload('image.jpg');
```

<a name="assert-exact-json"></a>
#### assertExactJson

응답이 지정한 JSON 데이터를 정확히 동일하게 포함하고 있는지 검증합니다.

```php
$response->assertExactJson(array $data);
```

<a name="assert-exact-json-structure"></a>
#### assertExactJsonStructure

응답이 지정한 JSON 구조와 정확히 일치하는지 검증합니다.

```php
$response->assertExactJsonStructure(array $data);
```

이 메서드는 [assertJsonStructure](#assert-json-structure)보다 더 엄격한 방식입니다. `assertJsonStructure`와 달리, 응답에 예상 JSON 구조에 명시적으로 포함되지 않은 키가 하나라도 있는 경우 테스트는 실패합니다.

<a name="assert-forbidden"></a>
#### assertForbidden

응답의 HTTP 상태 코드가 forbidden(403)임을 검증합니다.

```php
$response->assertForbidden();
```

<a name="assert-found"></a>

#### assertFound

응답이 found(302) HTTP 상태 코드를 가지고 있는지 확인합니다.

```php
$response->assertFound();
```

<a name="assert-gone"></a>
#### assertGone

응답이 gone(410) HTTP 상태 코드를 가지고 있는지 확인합니다.

```php
$response->assertGone();
```

<a name="assert-header"></a>
#### assertHeader

응답에 지정한 헤더와 값이 존재하는지 확인합니다.

```php
$response->assertHeader($headerName, $value = null);
```

<a name="assert-header-missing"></a>
#### assertHeaderMissing

응답에 지정한 헤더가 존재하지 않는지 확인합니다.

```php
$response->assertHeaderMissing($headerName);
```

<a name="assert-internal-server-error"></a>
#### assertInternalServerError

응답이 "Internal Server Error"(500) HTTP 상태 코드를 가지고 있는지 확인합니다.

```php
$response->assertInternalServerError();
```

<a name="assert-json"></a>
#### assertJson

응답이 지정한 JSON 데이터를 포함하는지 확인합니다.

```php
$response->assertJson(array $data, $strict = false);
```

`assertJson` 메서드는 응답을 배열로 변환하여, 지정한 배열이 애플리케이션에서 반환한 JSON 응답 내에 존재하는지 확인합니다. JSON 응답에 다른 속성이 더 포함되어 있더라도 지정한 일부 데이터만 포함되어 있으면 이 테스트는 통과합니다.

<a name="assert-json-count"></a>
#### assertJsonCount

응답 JSON에서 지정한 키에 해당하는 배열의 항목 수가 예상한 값과 같은지 확인합니다.

```php
$response->assertJsonCount($count, $key = null);
```

<a name="assert-json-fragment"></a>
#### assertJsonFragment

응답이 지정한 JSON 조각을 어디서든 포함하고 있는지 확인합니다.

```php
Route::get('/users', function () {
    return [
        'users' => [
            [
                'name' => 'Taylor Otwell',
            ],
        ],
    ];
});

$response->assertJsonFragment(['name' => 'Taylor Otwell']);
```

<a name="assert-json-is-array"></a>
#### assertJsonIsArray

응답 JSON이 배열인지 확인합니다.

```php
$response->assertJsonIsArray();
```

<a name="assert-json-is-object"></a>
#### assertJsonIsObject

응답 JSON이 객체인지 확인합니다.

```php
$response->assertJsonIsObject();
```

<a name="assert-json-missing"></a>
#### assertJsonMissing

응답에 지정한 JSON 데이터가 포함되어 있지 않은지 확인합니다.

```php
$response->assertJsonMissing(array $data);
```

<a name="assert-json-missing-exact"></a>
#### assertJsonMissingExact

응답에 지정한 정확한 JSON 데이터가 포함되어 있지 않은지 확인합니다.

```php
$response->assertJsonMissingExact(array $data);
```

<a name="assert-json-missing-validation-errors"></a>
#### assertJsonMissingValidationErrors

응답에 지정한 키의 JSON 유효성 검증 에러가 존재하지 않는지 확인합니다.

```php
$response->assertJsonMissingValidationErrors($keys);
```

> [!NOTE]
> 더 일반적인 [assertValid](#assert-valid) 메서드를 사용하면, 응답에 JSON으로 반환된 유효성 검증 에러가 없고, 동시에 세션 저장소로 플래시된 에러도 없는지 확인할 수 있습니다.

<a name="assert-json-path"></a>
#### assertJsonPath

응답의 지정한 경로에 주어진 데이터가 존재하는지 확인합니다.

```php
$response->assertJsonPath($path, $expectedValue);
```

예를 들어, 애플리케이션에서 아래와 같이 JSON 응답이 반환된 경우:

```json
{
    "user": {
        "name": "Steve Schoger"
    }
}
```

`user` 객체의 `name` 속성이 특정 값과 일치하는지 다음과 같이 확인할 수 있습니다.

```php
$response->assertJsonPath('user.name', 'Steve Schoger');
```

<a name="assert-json-missing-path"></a>
#### assertJsonMissingPath

응답에 지정한 경로가 존재하지 않는지 확인합니다.

```php
$response->assertJsonMissingPath($path);
```

예를 들어, 애플리케이션에서 아래와 같이 JSON 응답이 반환된 경우:

```json
{
    "user": {
        "name": "Steve Schoger"
    }
}
```

`user` 객체에 `email` 속성이 포함되어 있지 않은지 아래와 같이 확인할 수 있습니다.

```php
$response->assertJsonMissingPath('user.email');
```

<a name="assert-json-structure"></a>
#### assertJsonStructure

응답이 지정한 JSON 구조를 가지고 있는지 확인합니다.

```php
$response->assertJsonStructure(array $structure);
```

예를 들어, 애플리케이션에서 반환된 JSON 응답이 다음과 같은 데이터를 포함하는 경우:

```json
{
    "user": {
        "name": "Steve Schoger"
    }
}
```

아래와 같이 JSON 구조를 검증할 수 있습니다.

```php
$response->assertJsonStructure([
    'user' => [
        'name',
    ]
]);
```

때로는, 애플리케이션이 반환하는 JSON 응답에 객체 배열이 포함되어 있을 수도 있습니다.

```json
{
    "user": [
        {
            "name": "Steve Schoger",
            "age": 55,
            "location": "Earth"
        },
        {
            "name": "Mary Schoger",
            "age": 60,
            "location": "Earth"
        }
    ]
}
```

이러한 경우에는, `*` 문자를 사용해 배열 내 모든 객체의 구조를 아래와 같이 검증할 수 있습니다.

```php
$response->assertJsonStructure([
    'user' => [
        '*' => [
             'name',
             'age',
             'location'
        ]
    ]
]);
```

<a name="assert-json-validation-errors"></a>
#### assertJsonValidationErrors

응답에 주어진 키에 대해 JSON 유효성 검증 에러가 포함되어 있는지 확인합니다. 이 메서드는 유효성 검증 에러가 세션에 플래시되는 대신 JSON 구조로 반환되는 응답을 검증할 때 사용해야 합니다.

```php
$response->assertJsonValidationErrors(array $data, $responseKey = 'errors');
```

> [!NOTE]
> 더 일반적인 [assertInvalid](#assert-invalid) 메서드를 사용하면, JSON으로 반환된 유효성 검증 에러뿐 아니라 세션으로 플래시된 에러도 검증할 수 있습니다.

<a name="assert-json-validation-error-for"></a>
#### assertJsonValidationErrorFor

지정한 키에 대해 응답이 JSON 유효성 검증 에러를 가지고 있는지 확인합니다.

```php
$response->assertJsonValidationErrorFor(string $key, $responseKey = 'errors');
```

<a name="assert-method-not-allowed"></a>
#### assertMethodNotAllowed

응답이 method not allowed(405) HTTP 상태 코드를 가지고 있는지 확인합니다.

```php
$response->assertMethodNotAllowed();
```

<a name="assert-moved-permanently"></a>
#### assertMovedPermanently

응답이 moved permanently(301) HTTP 상태 코드를 가지고 있는지 확인합니다.

```php
$response->assertMovedPermanently();
```

<a name="assert-location"></a>
#### assertLocation

응답의 `Location` 헤더에 지정한 URI 값이 있는지 확인합니다.

```php
$response->assertLocation($uri);
```

<a name="assert-content"></a>
#### assertContent

지정한 문자열이 응답 본문과 일치하는지 확인합니다.

```php
$response->assertContent($value);
```

<a name="assert-no-content"></a>
#### assertNoContent

응답이 지정한 HTTP 상태 코드와 함께 콘텐츠가 없는지 확인합니다.

```php
$response->assertNoContent($status = 204);
```

<a name="assert-streamed"></a>
#### assertStreamed

응답이 스트리밍(Streaming) 방식의 응답인지 확인합니다.

```
$response->assertStreamed();
```

<a name="assert-streamed-content"></a>
#### assertStreamedContent

지정한 문자열이 스트리밍 응답의 콘텐츠와 일치하는지 확인합니다.

```php
$response->assertStreamedContent($value);
```

<a name="assert-not-found"></a>
#### assertNotFound

응답이 not found(404) HTTP 상태 코드를 가지고 있는지 확인합니다.

```php
$response->assertNotFound();
```

<a name="assert-ok"></a>
#### assertOk

응답이 200 HTTP 상태 코드를 가지고 있는지 확인합니다.

```php
$response->assertOk();
```

<a name="assert-payment-required"></a>
#### assertPaymentRequired

응답이 payment required(402) HTTP 상태 코드를 가지고 있는지 확인합니다.

```php
$response->assertPaymentRequired();
```

<a name="assert-plain-cookie"></a>
#### assertPlainCookie

응답이 지정한 평문(암호화되지 않은) 쿠키를 포함하고 있는지 확인합니다.

```php
$response->assertPlainCookie($cookieName, $value = null);
```

<a name="assert-redirect"></a>
#### assertRedirect

응답이 지정한 URI로의 리다이렉트인지 확인합니다.

```php
$response->assertRedirect($uri = null);
```

<a name="assert-redirect-back"></a>
#### assertRedirectBack

응답이 이전 페이지로 리다이렉트인지 여부를 확인합니다.

```php
$response->assertRedirectBack();
```

<a name="assert-redirect-contains"></a>
#### assertRedirectContains

응답이 지정한 문자열을 포함한 URI로 리다이렉트되는지 여부를 확인합니다.

```php
$response->assertRedirectContains($string);
```

<a name="assert-redirect-to-route"></a>
#### assertRedirectToRoute

응답이 지정한 [이름이 지정된 라우트](/docs/routing#named-routes)로 리다이렉트인지 확인합니다.

```php
$response->assertRedirectToRoute($name, $parameters = []);
```

<a name="assert-redirect-to-signed-route"></a>
#### assertRedirectToSignedRoute

응답이 지정한 [서명된 라우트](/docs/urls#signed-urls)로 리다이렉트인지 확인합니다.

```php
$response->assertRedirectToSignedRoute($name = null, $parameters = []);
```

<a name="assert-request-timeout"></a>
#### assertRequestTimeout

응답이 request timeout(408) HTTP 상태 코드를 가지고 있는지 확인합니다.

```php
$response->assertRequestTimeout();
```

<a name="assert-see"></a>
#### assertSee

응답 내용에 지정한 문자열이 포함되어 있는지 확인합니다. 두 번째 인수로 `false`를 전달하지 않는 한, 이 assert는 자동으로 문자열을 escape 처리합니다.

```php
$response->assertSee($value, $escape = true);
```

<a name="assert-see-in-order"></a>
#### assertSeeInOrder

지정한 여러 문자열이 응답에 순서대로 포함되어 있는지 확인합니다. 두 번째 인수로 `false`를 전달하지 않는 한, 이 assert는 자동으로 문자열들을 escape 처리합니다.

```php
$response->assertSeeInOrder(array $values, $escape = true);
```

<a name="assert-see-text"></a>
#### assertSeeText

응답 텍스트에 지정한 문자열이 포함되어 있는지 확인합니다. 두 번째 인수로 `false`를 전달하지 않는 한, 이 assert는 자동으로 문자열을 escape 처리합니다. 응답 내용은 assert 수행 전에 `strip_tags` PHP 함수에 전달됩니다.

```php
$response->assertSeeText($value, $escape = true);
```

<a name="assert-see-text-in-order"></a>
#### assertSeeTextInOrder

응답 텍스트에 지정한 여러 문자열이 순서대로 포함되어 있는지 확인합니다. 두 번째 인수로 `false`를 전달하지 않는 한, 이 assert는 자동으로 문자열들을 escape 처리합니다. 응답 내용은 assert 수행 전에 `strip_tags` PHP 함수에 전달됩니다.

```php
$response->assertSeeTextInOrder(array $values, $escape = true);
```

<a name="assert-server-error"></a>
#### assertServerError

응답이 서버 에러(500 이상 600 미만) HTTP 상태 코드를 가지고 있는지 확인합니다.

```php
$response->assertServerError();
```

<a name="assert-service-unavailable"></a>
#### assertServiceUnavailable

응답이 "Service Unavailable"(503) HTTP 상태 코드를 가지고 있는지 확인합니다.

```php
$response->assertServiceUnavailable();
```

<a name="assert-session-has"></a>
#### assertSessionHas

세션에 지정한 데이터가 포함되어 있는지 확인합니다.

```php
$response->assertSessionHas($key, $value = null);
```

필요한 경우, `assertSessionHas` 메서드의 두 번째 인수로 클로저를 전달할 수 있습니다. 클로저가 `true`를 반환하면 assert가 통과합니다.

```php
$response->assertSessionHas($key, function (User $value) {
    return $value->name === 'Taylor Otwell';
});
```

<a name="assert-session-has-input"></a>
#### assertSessionHasInput

세션의 [flashed input 배열](/docs/responses#redirecting-with-flashed-session-data)에 지정한 값이 포함되어 있는지 확인합니다.

```php
$response->assertSessionHasInput($key, $value = null);
```

필요하다면, 두 번째 인수에 클로저를 전달할 수 있습니다. 클로저가 `true`를 반환하면 assert가 통과합니다.

```php
use Illuminate\Support\Facades\Crypt;

$response->assertSessionHasInput($key, function (string $value) {
    return Crypt::decryptString($value) === 'secret';
});
```

<a name="assert-session-has-all"></a>
#### assertSessionHasAll

세션에 지정한 키/값 쌍 배열이 모두 포함되어 있는지 확인합니다.

```php
$response->assertSessionHasAll(array $data);
```

예를 들어, 애플리케이션의 세션에 `name`과 `status` 키가 포함되어 있는 경우, 아래와 같이 두 값이 모두 존재하고 기대하는 값을 가지고 있는지 검증할 수 있습니다.

```php
$response->assertSessionHasAll([
    'name' => 'Taylor Otwell',
    'status' => 'active',
]);
```

<a name="assert-session-has-errors"></a>
#### assertSessionHasErrors

세션에 지정한 `$keys`에 대한 에러가 존재하는지 확인합니다. `$keys`가 연관 배열일 경우, 각 필드(키)에 특정 에러 메시지(값)가 세션에 존재하는지도 검증합니다. 이 메서드는 유효성 검증 에러가 JSON 구조로 반환되는 대신 세션에 플래시되는 라우트를 테스트할 때 사용해야 합니다.

```php
$response->assertSessionHasErrors(
    array $keys = [], $format = null, $errorBag = 'default'
);
```

예를 들어, 세션에 `name`과 `email` 필드의 유효성 검증 에러 메시지가 플래시되어 있는지 확인하려면 아래와 같이 할 수 있습니다.

```php
$response->assertSessionHasErrors(['name', 'email']);
```

또는, 특정 필드에 대해 특정 유효성 검증 에러 메시지가 있는지 검증하려면 아래와 같이 할 수 있습니다.

```php
$response->assertSessionHasErrors([
    'name' => 'The given name was invalid.'
]);
```

> [!NOTE]
> 더 일반적인 [assertInvalid](#assert-invalid) 메서드를 사용하면, JSON으로 반환된 유효성 검증 에러뿐 아니라 세션에 플래시된 에러도 검증할 수 있습니다.

<a name="assert-session-has-errors-in"></a>
#### assertSessionHasErrorsIn

특정 [에러 백(error bag)](/docs/validation#named-error-bags) 내에서 지정한 `$keys`에 대한 에러가 존재하는지 확인합니다. `$keys`가 연관 배열일 경우, 각 필드(키)에 대해 해당 에러 백 안에 특정 에러 메시지(값)가 존재하는지도 검증합니다.

```php
$response->assertSessionHasErrorsIn($errorBag, $keys = [], $format = null);
```

<a name="assert-session-has-no-errors"></a>

#### assertSessionHasNoErrors

세션에 유효성 검증 오류가 없는지 확인합니다.

```php
$response->assertSessionHasNoErrors();
```

<a name="assert-session-doesnt-have-errors"></a>
#### assertSessionDoesntHaveErrors

지정한 키에 대해 세션에 유효성 검증 오류가 없는지 확인합니다.

```php
$response->assertSessionDoesntHaveErrors($keys = [], $format = null, $errorBag = 'default');
```

> [!NOTE]
> 더 포괄적인 [assertValid](#assert-valid) 메서드를 사용하면, 응답에 유효성 검증 오류가 JSON으로 반환되지 않았고, 또한 세션 스토리지에 오류가 플래시되지 않았는지도 함께 확인할 수 있습니다.

<a name="assert-session-missing"></a>
#### assertSessionMissing

세션에 지정한 키가 포함되어 있지 않은지 확인합니다.

```php
$response->assertSessionMissing($key);
```

<a name="assert-status"></a>
#### assertStatus

응답이 지정한 HTTP 상태 코드를 가지고 있는지 확인합니다.

```php
$response->assertStatus($code);
```

<a name="assert-successful"></a>
#### assertSuccessful

응답이 성공(HTTP 상태 코드가 200 이상 300 미만) 상태 코드인지 확인합니다.

```php
$response->assertSuccessful();
```

<a name="assert-too-many-requests"></a>
#### assertTooManyRequests

응답의 HTTP 상태 코드가 너무 많은 요청(429)인지 확인합니다.

```php
$response->assertTooManyRequests();
```

<a name="assert-unauthorized"></a>
#### assertUnauthorized

응답의 HTTP 상태 코드가 인증되지 않음(401)인지 확인합니다.

```php
$response->assertUnauthorized();
```

<a name="assert-unprocessable"></a>
#### assertUnprocessable

응답의 HTTP 상태 코드가 처리 불가 엔터티(422)인지 확인합니다.

```php
$response->assertUnprocessable();
```

<a name="assert-unsupported-media-type"></a>
#### assertUnsupportedMediaType

응답의 HTTP 상태 코드가 지원되지 않는 미디어 타입(415)인지 확인합니다.

```php
$response->assertUnsupportedMediaType();
```

<a name="assert-valid"></a>
#### assertValid

지정한 키에 대해 응답에 유효성 검증 오류가 없는지 확인합니다. 이 메서드는 유효성 검증 오류가 JSON 구조로 반환되었거나, 세션에 플래시된 경우 모두에 대해 사용할 수 있습니다.

```php
// 유효성 검증 오류가 전혀 없는지 확인...
$response->assertValid();

// 지정한 키에 유효성 검증 오류가 없는지 확인...
$response->assertValid(['name', 'email']);
```

<a name="assert-invalid"></a>
#### assertInvalid

응답에 지정한 키의 유효성 검증 오류가 존재하는지 확인합니다. 이 메서드는 유효성 검증 오류가 JSON 구조로 반환되었거나, 세션에 플래시된 경우 모두에 대해 사용할 수 있습니다.

```php
$response->assertInvalid(['name', 'email']);
```

특정 키에 대해 특정 유효성 검증 오류 메시지가 있는지까지 검증할 수 있습니다. 이때 전체 메시지는 물론, 메시지의 일부분만 제공해도 됩니다.

```php
$response->assertInvalid([
    'name' => 'The name field is required.',
    'email' => 'valid email address',
]);
```

지정한 필드만 유효성 검증 오류가 있는지 확인하려면, `assertOnlyInvalid` 메서드를 사용할 수 있습니다.

```php
$response->assertOnlyInvalid(['name', 'email']);
```

<a name="assert-view-has"></a>
#### assertViewHas

응답 뷰에 특정 데이터가 포함되어 있는지 확인합니다.

```php
$response->assertViewHas($key, $value = null);
```

`assertViewHas` 메서드의 두 번째 인자로 클로저를 전달하면, 해당 뷰 데이터에 대해 좀 더 세밀하게 검사하고 추가적인 assert를 작성할 수 있습니다.

```php
$response->assertViewHas('user', function (User $user) {
    return $user->name === 'Taylor';
});
```

또한, 뷰 데이터를 응답의 배열 변수로 접근할 수 있으므로, 이를 편리하게 검사할 수도 있습니다.

```php tab=Pest
expect($response['name'])->toBe('Taylor');
```

```php tab=PHPUnit
$this->assertEquals('Taylor', $response['name']);
```

<a name="assert-view-has-all"></a>
#### assertViewHasAll

응답 뷰에 지정한 데이터 목록이 포함되어 있는지 확인합니다.

```php
$response->assertViewHasAll(array $data);
```

이 메서드는 뷰에 지정한 키가 모두 존재하는지 간단히 확인할 때 사용할 수 있습니다.

```php
$response->assertViewHasAll([
    'name',
    'email',
]);
```

또는, 뷰 데이터가 존재하면서 특정 값인지까지 함께 확인할 수도 있습니다.

```php
$response->assertViewHasAll([
    'name' => 'Taylor Otwell',
    'email' => 'taylor@example.com,',
]);
```

<a name="assert-view-is"></a>
#### assertViewIs

지정한 뷰가 해당 라우트에서 반환되었는지 확인합니다.

```php
$response->assertViewIs($value);
```

<a name="assert-view-missing"></a>
#### assertViewMissing

응답에서 반환된 뷰에 특정 데이터 키가 전달되지 않았는지 확인합니다.

```php
$response->assertViewMissing($key);
```

<a name="authentication-assertions"></a>
### 인증 관련 어서션

라라벨은 애플리케이션의 기능 테스트에서 사용할 수 있는 다양한 인증 관련 어서션도 제공합니다. 이 메서드들은 `get`, `post` 등의 메서드가 반환하는 `Illuminate\Testing\TestResponse` 인스턴스가 아니라, 테스트 클래스 자체에서 호출해야 합니다.

<a name="assert-authenticated"></a>
#### assertAuthenticated

사용자가 인증되었는지 확인합니다.

```php
$this->assertAuthenticated($guard = null);
```

<a name="assert-guest"></a>
#### assertGuest

사용자가 인증되지 않았는지(게스트 상태) 확인합니다.

```php
$this->assertGuest($guard = null);
```

<a name="assert-authenticated-as"></a>
#### assertAuthenticatedAs

지정한 사용자가 인증되었는지 확인합니다.

```php
$this->assertAuthenticatedAs($user, $guard = null);
```

<a name="validation-assertions"></a>
## 유효성 검증 어서션

라라벨은 요청에 제공된 데이터가 유효했는지 또는 유효하지 않았는지 확인할 수 있도록, 두 가지 주요 유효성 검증 어서션을 제공합니다.

<a name="validation-assert-valid"></a>
#### assertValid

지정한 키에 대해 응답에 유효성 검증 오류가 없는지 확인합니다. 이 메서드는 유효성 검증 오류가 JSON 구조로 반환되었거나, 세션에 플래시된 경우 모두에 대해 사용할 수 있습니다.

```php
// 유효성 검증 오류가 전혀 없는지 확인...
$response->assertValid();

// 지정한 키에 유효성 검증 오류가 없는지 확인...
$response->assertValid(['name', 'email']);
```

<a name="validation-assert-invalid"></a>
#### assertInvalid

응답에 지정한 키의 유효성 검증 오류가 존재하는지 확인합니다. 이 메서드는 유효성 검증 오류가 JSON 구조로 반환되었거나, 세션에 플래시된 경우 모두에 대해 사용할 수 있습니다.

```php
$response->assertInvalid(['name', 'email']);
```

특정 키에 대해 특정 유효성 검증 오류 메시지가 있는지까지 검증할 수 있습니다. 이때 전체 메시지는 물론, 메시지의 일부분만 제공해도 됩니다.

```php
$response->assertInvalid([
    'name' => 'The name field is required.',
    'email' => 'valid email address',
]);
```