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
    - [Blade 및 컴포넌트 렌더링](#rendering-blade-and-components)
- [사용 가능한 assertion](#available-assertions)
    - [응답 assertion](#response-assertions)
    - [인증 assertion](#authentication-assertions)
    - [유효성 검증 assertion](#validation-assertions)

<a name="introduction"></a>
## 소개

라라벨은 애플리케이션에 HTTP 요청을 보내고 응답을 검사하는 데 매우 직관적인 API를 제공합니다. 예를 들어, 아래에 정의된 기능 테스트(feature test) 코드를 살펴보면 다음과 같습니다.

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

`get` 메서드는 애플리케이션에 `GET` 요청을 보내고, `assertStatus` 메서드는 반환된 응답의 HTTP 상태 코드가 주어진 값과 일치하는지 검증합니다. 이처럼 단순한 assertion 외에도, 라라벨에는 응답의 헤더, 본문, JSON 구조 등을 검사할 수 있는 다양한 assertion이 준비되어 있습니다.

<a name="making-requests"></a>
## 요청 보내기

애플리케이션에 요청을 보내려면, 테스트 안에서 `get`, `post`, `put`, `patch`, `delete` 등의 메서드를 사용할 수 있습니다. 이러한 메서드는 실제로 "진짜" HTTP 네트워크 요청을 보내는 것이 아니라, 내부적으로 네트워크 요청을 시뮬레이션합니다.

테스트 요청 메서드는 `Illuminate\Http\Response` 인스턴스를 반환하는 대신, `Illuminate\Testing\TestResponse` 인스턴스를 반환합니다. 이 객체를 사용하면 [다양한 유용한 assertion](#available-assertions) 메서드를 통해 애플리케이션의 응답을 검사할 수 있습니다.

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

일반적으로, 각 테스트는 애플리케이션에 한 번만 요청하는 것이 좋습니다. 하나의 테스트 메서드에서 여러 번 요청을 보내면 예기치 않은 동작이 발생할 수 있습니다.

> [!NOTE]  
> 편의를 위해 테스트를 실행할 때는 CSRF 미들웨어가 자동으로 비활성화됩니다.

<a name="customizing-request-headers"></a>
### 요청 헤더 커스터마이징

요청을 보내기 전에 `withHeaders` 메서드를 사용하여 원하는 헤더를 추가할 수 있습니다. 이를 통해 요청에 임의의 커스텀 헤더를 손쉽게 지정할 수 있습니다.

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

요청을 보내기 전에 `withCookie` 또는 `withCookies` 메서드로 쿠키 값을 지정할 수 있습니다.  
- `withCookie` 메서드는 쿠키 이름과 값을 각각 인수로 받고,  
- `withCookies` 메서드는 이름/값 쌍의 배열을 받습니다.

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

라라벨은 HTTP 테스트 시 세션을 다루기 위한 다양한 helper를 제공합니다. 먼저, `withSession` 메서드를 사용해서 세션 데이터를 배열 형태로 미리 설정할 수 있습니다.  
이 방법은 요청을 보내기 전에 세션에 원하는 데이터를 사전 등록할 때 유용하게 사용할 수 있습니다.

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

라라벨의 세션은 주로 현재 인증된 사용자에 대한 상태를 유지하는 데 사용됩니다.  
따라서 `actingAs` helper 메서드를 사용하면 지정한 사용자를 현재 사용자로 손쉽게 인증할 수 있습니다.  
예를 들어, [모델 팩토리](/docs/11.x/eloquent-factories)를 사용해 사용자를 생성하고 인증할 수 있습니다.

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

또한, `actingAs` 메서드의 두 번째 인수로 가드(guard) 이름을 전달해, 어떤 가드를 사용해 인증할지 지정할 수도 있습니다.  
이렇게 지정한 가드는 테스트가 진행되는 동안 기본 가드로 적용됩니다.

```
$this->actingAs($user, 'web')
```

<a name="debugging-responses"></a>
### 응답 디버깅

테스트 요청을 보낸 후 `dump`, `dumpHeaders`, `dumpSession` 메서드를 사용해 응답 내용을 확인하거나 디버깅할 수 있습니다.

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

또한, `dd`, `ddHeaders`, `ddSession`, `ddJson` 메서드를 사용하면 응답에 대한 정보를 출력하고 즉시 테스트 실행을 중단할 수 있습니다.

```php tab=Pest
<?php

test('basic test', function () {
    $response = $this->get('/');

    $response->ddHeaders();
    $response->ddSession();
    $response->ddJson();
    $response->dd();
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

        $response->ddHeaders();

        $response->ddSession();

        $response->dd();
    }
}
```

<a name="exception-handling"></a>
### 예외 처리

특정 예외가 발생하는지 테스트해야 할 때가 있습니다. 이 경우 `Exceptions` 파사드(facade)를 통해 예외 핸들러를 "페이크(fake)"로 설정할 수 있습니다. 예외 핸들러를 페이크로 만든 뒤에는, 요청 중 발생한 예외에 대해 `assertReported` 및 `assertNotReported` 메서드를 활용해 assertion을 수행할 수 있습니다.

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

`assertNotReported` 및 `assertNothingReported` 메서드는 지정한 예외가 요청 도중 발생하지 않았는지, 또는 어떤 예외도 발생하지 않았는지 검증할 때 사용할 수 있습니다.

```php
Exceptions::assertNotReported(InvalidOrderException::class);

Exceptions::assertNothingReported();
```

요청 전에 `withoutExceptionHandling` 메서드를 호출하면 해당 요청에 대해 예외 처리를 완전히 비활성화할 수 있습니다.

```
$response = $this->withoutExceptionHandling()->get('/');
```

또한, 애플리케이션이 PHP나 사용하는 라이브러리에서 더 이상 권장하지 않는(Deprecated) 기능을 사용하고 있지 않은지 확인하려면, 요청 전에 `withoutDeprecationHandling` 메서드를 호출할 수 있습니다.  
이 설정이 활성화되면 deprecated 관련 경고가 예외로 처리되어, 테스트가 실패하게 됩니다.

```
$response = $this->withoutDeprecationHandling()->get('/');
```

`assertThrows` 메서드는 주어진 클로저 내부의 코드가 특정 타입의 예외를 발생시키는지 검증할 때 사용할 수 있습니다.

```php
$this->assertThrows(
    fn () => (new ProcessOrder)->execute(),
    OrderInvalid::class
);
```

예외가 발생하는지 뿐만 아니라, 발생한 예외 객체 자체를 받아 검증하고 싶다면 두 번째 인자로 클로저를 전달할 수 있습니다.

```php
$this->assertThrows(
    fn () => (new ProcessOrder)->execute(),
    fn (OrderInvalid $e) => $e->orderId() === 123;
);
```

<a name="testing-json-apis"></a>
## JSON API 테스트

라라벨은 JSON API 및 응답을 테스트하기 위한 여러 helper도 제공합니다. 예를 들어, `json`, `getJson`, `postJson`, `putJson`, `patchJson`, `deleteJson`, `optionsJson` 메서드를 사용해 다양한 HTTP 메서드 방식으로 JSON 요청을 보낼 수 있습니다.  
또한 데이터와 헤더도 이 메서드들에 쉽게 전달할 수 있습니다.  
먼저, `/api/user` 엔드포인트로 `POST` 요청을 보내고, 기대하는 JSON 데이터가 반환되는지 assertion하는 테스트를 작성해 보겠습니다.

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

또한, JSON 응답 데이터는 배열 변수를 통해 쉽게 접근할 수 있어서, 반환된 개별 값들을 직접 확인하기 편리합니다.

```php tab=Pest
expect($response['created'])->toBeTrue();
```

```php tab=PHPUnit
$this->assertTrue($response['created']);
```

> [!NOTE]  
> `assertJson` 메서드는 응답을 배열로 변환하여, 특정 배열 조각이 실제 JSON 응답에 **포함되어 있는지** 확인합니다. 즉, JSON 응답에 다른 속성이 같이 있더라도 해당 조각만 있으면 테스트는 통과합니다.

<a name="verifying-exact-match"></a>
#### JSON이 정확하게 일치하는지 검증하기

앞에서 설명한 것처럼, `assertJson` 메서드는 JSON 안에 지정한 배열 조각이 존재하는지만을 확인합니다.  
반면, **반환된 JSON 전체가** 주어진 배열과 정확히 일치하는지 확인하려면 `assertExactJson` 메서드를 사용해야 합니다.

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
#### JSON 경로(path)에 대한 검증

JSON 응답에서 특정 경로에 원하는 값이 존재하는지 확인하려면 `assertJsonPath` 메서드를 사용할 수 있습니다.

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

또한, `assertJsonPath` 메서드에는 클로저를 인수로도 전달할 수 있어서, 동적으로 assertion 성공 여부를 평가할 수도 있습니다.

```
$response->assertJsonPath('team.owner.name', fn (string $name) => strlen($name) >= 3);
```

<a name="fluent-json-testing"></a>

### 유연한 JSON 테스트

라라벨은 애플리케이션의 JSON 응답을 유연하게 테스트할 수 있는 깔끔한 방법도 제공합니다. 사용을 시작하려면, `assertJson` 메서드에 클로저를 전달하면 됩니다. 이 클로저는 `Illuminate\Testing\Fluent\AssertableJson` 인스턴스를 인자로 받아, 애플리케이션이 반환한 JSON에 대해 다양한 assertion(확인)을 할 수 있게 해줍니다. JSON의 특정 속성(attribute)에 대해 assertion을 하려면 `where` 메서드를, 특정 속성이 없는지 확인하려면 `missing` 메서드를 사용할 수 있습니다.

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

위 예제에서 assertion 체인의 마지막에 `etc` 메서드가 사용된 것을 볼 수 있습니다. 이 메서드는 라라벨에 "해당 JSON 객체에 다른 속성이 추가로 있을 수 있음"을 알립니다. 만약 `etc` 메서드를 사용하지 않으면, 여러분이 assertion을 하지 않은 추가 속성이 JSON 객체에 존재할 경우 테스트가 실패하게 됩니다.

이렇게 동작하는 의도는, JSON 응답에서 민감한 정보를 실수로 노출하지 않도록 보호하기 위함입니다. 즉, 해당 속성에 대해 명시적으로 assertion을 하거나, 아니면 `etc` 메서드를 통해 추가 속성을 명확히 허용하라는 의도입니다.

다만, assertion 체인에서 `etc` 메서드를 생략했다고 해서, JSON 객체 내부에 중첩된 배열에 추가 속성이 생기는 것을 막아주지는 않습니다. `etc` 메서드는 오직 그 메서드를 호출한 현재 중첩 수준에서만 추가 속성이 없는지를 보장합니다.

<a name="asserting-json-attribute-presence-and-absence"></a>
#### JSON 속성의 존재 및 부재 확인

특정 속성의 존재 여부를 확인하려면 `has` 메서드, 속성이 없는지 확인하려면 `missing` 메서드를 사용할 수 있습니다.

```
$response->assertJson(fn (AssertableJson $json) =>
    $json->has('data')
        ->missing('message')
);
```

또한, `hasAll` 및 `missingAll` 메서드를 사용하면 여러 속성의 존재 여부 또는 부재를 한 번에 확인할 수 있습니다.

```
$response->assertJson(fn (AssertableJson $json) =>
    $json->hasAll(['status', 'data'])
        ->missingAll(['message', 'code'])
);
```

여러 속성 중 하나라도 존재하는지 확인하려면 `hasAny` 메서드를 사용할 수 있습니다.

```
$response->assertJson(fn (AssertableJson $json) =>
    $json->has('status')
        ->hasAny('data', 'message', 'code')
);
```

<a name="asserting-against-json-collections"></a>
#### JSON 컬렉션에 대한 Assertion

라우트가 여러 항목(예: 여러 사용자)을 포함하는 JSON 응답을 반환하는 경우가 많습니다.

```
Route::get('/users', function () {
    return User::all();
});
```

이런 경우, 유연한 JSON 객체의 `has` 메서드를 사용하여 응답에 포함된 사용자에 대해 assertion을 할 수 있습니다. 예를 들어, JSON 응답에 3명의 사용자가 포함되어 있는지 확인한 뒤, 컬렉션에서 첫 번째 사용자에 대해 `first` 메서드를 사용해 assertion을 할 수 있습니다. `first` 메서드는 클로저를 인자로 받아, JSON 컬렉션 내 첫 번째 객체에 대한 assertion이 가능하게 합니다.

```
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
#### JSON 컬렉션 Assertion의 범위 지정

애플리케이션의 라우트가 명명된 키를 가진 JSON 컬렉션을 반환하는 경우도 있습니다.

```
Route::get('/users', function () {
    return [
        'meta' => [...],
        'users' => User::all(),
    ];
})
```

이런 라우트를 테스트할 때는 `has` 메서드를 통해 컬렉션의 항목 수를 확인할 수 있고, 여러 assertion 체인을 범위 지정해 사용할 수도 있습니다.

```
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

하지만 위처럼 `users` 컬렉션에 대한 assertion을 위해 `has` 메서드를 두 번 나눠 호출하는 대신, 한 번의 호출에서 세 번째 인자로 클로저를 전달할 수도 있습니다. 이렇게 하면, 해당 클로저는 컬렉션의 첫 번째 항목에 자동으로 범위가 지정되어 실행됩니다.

```
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
#### JSON 타입 검증

JSON 응답 내 속성의 타입이 특정 타입인지 확인하고 싶을 때가 있습니다. `Illuminate\Testing\Fluent\AssertableJson` 클래스는 이러한 용도로 `whereType` 및 `whereAllType` 메서드를 제공합니다.

```
$response->assertJson(fn (AssertableJson $json) =>
    $json->whereType('id', 'integer')
        ->whereAllType([
            'users.0.name' => 'string',
            'meta' => 'array'
        ])
);
```

여러 타입을 지정하려면 `|` 문자를 사용하거나, `whereType` 메서드의 두 번째 인자로 타입의 배열을 전달할 수 있습니다. 응답 값이 지정한 타입 중 하나에 해당하면 assertion이 성공합니다.

```
$response->assertJson(fn (AssertableJson $json) =>
    $json->whereType('name', 'string|null')
        ->whereType('id', ['string', 'integer'])
);
```

`whereType`과 `whereAllType` 메서드는 다음 타입을 인식할 수 있습니다: `string`, `integer`, `double`, `boolean`, `array`, `null`.

<a name="testing-file-uploads"></a>
## 파일 업로드 테스트

`Illuminate\Http\UploadedFile` 클래스의 `fake` 메서드는 테스트용 가짜 파일이나 이미지를 생성할 수 있게 해줍니다. 여기에 `Storage` 파사드의 `fake` 메서드를 함께 사용하면 파일 업로드 테스트가 더욱 간편해집니다. 예를 들어, 이 두 기능을 조합해 아바타 업로드 폼을 손쉽게 테스트할 수 있습니다.

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

특정 파일이 존재하지 않는지 assertion을 하고 싶다면, `Storage` 파사드에서 제공하는 `assertMissing` 메서드를 사용할 수 있습니다.

```
Storage::fake('avatars');

// ...

Storage::disk('avatars')->assertMissing('missing.jpg');
```

<a name="fake-file-customization"></a>
#### 가짜 파일 커스터마이즈

`UploadedFile` 클래스가 제공하는 `fake` 메서드를 사용해 파일을 만들 때, 이미지의 가로/세로 크기나 용량(킬로바이트 단위)을 지정할 수 있어, 애플리케이션의 유효성 검증 규칙을 더 정밀하게 테스트할 수 있습니다.

```
UploadedFile::fake()->image('avatar.jpg', $width, $height)->size(100);
```

이미지 생성뿐 아니라, `create` 메서드를 이용해 다른 타입의 파일도 생성할 수 있습니다.

```
UploadedFile::fake()->create('document.pdf', $sizeInKilobytes);
```

필요하다면 메서드에 `$mimeType` 인수를 전달하여 반환될 파일의 MIME 타입을 명시적으로 지정할 수도 있습니다.

```
UploadedFile::fake()->create(
    'document.pdf', $sizeInKilobytes, 'application/pdf'
);
```

<a name="testing-views"></a>
## 뷰(View) 테스트

라라벨은 애플리케이션에 대한 HTTP 요청을 시뮬레이션하지 않고도 뷰를 렌더링하여 테스트할 수 있습니다. 이를 위해 테스트 내에서 `view` 메서드를 사용할 수 있습니다. `view` 메서드는 뷰 이름과 선택적으로 데이터를 담은 배열을 인자로 받으며, 반환값은 `Illuminate\Testing\TestView` 인스턴스가 됩니다. 이 객체는 뷰의 내용을 편리하게 검사할 수 있는 여러 assertion 메서드를 제공합니다.

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

`TestView` 클래스는 `assertSee`, `assertSeeInOrder`, `assertSeeText`, `assertSeeTextInOrder`, `assertDontSee`, `assertDontSeeText` 등의 assertion 메서드를 제공합니다.

필요하다면, `TestView` 인스턴스를 문자열로 캐스팅해 렌더링된 뷰의 원본 내용을 얻을 수 있습니다.

```
$contents = (string) $this->view('welcome');
```

<a name="sharing-errors"></a>
#### 오류(Errors) 공유하기

일부 뷰는 라라벨에서 제공하는 [글로벌 오류 백(global error bag)](/docs/11.x/validation#quick-displaying-the-validation-errors)에 등록된 오류에 의존할 수 있습니다. 오류 메시지로 error bag을 채우려면 `withViewErrors` 메서드를 사용할 수 있습니다.

```
$view = $this->withViewErrors([
    'name' => ['Please provide a valid name.']
])->view('form');

$view->assertSee('Please provide a valid name.');
```

<a name="rendering-blade-and-components"></a>
### Blade 및 컴포넌트 렌더링

필요하다면 `blade` 메서드를 사용해 [Blade](/docs/11.x/blade)의 원시 문자열 자체를 평가 및 렌더링할 수 있습니다. `view` 메서드와 마찬가지로, `blade` 메서드도 `Illuminate\Testing\TestView` 인스턴스를 반환합니다.

```
$view = $this->blade(
    '<x-component :name="$name" />',
    ['name' => 'Taylor']
);

$view->assertSee('Taylor');
```

[Blade 컴포넌트](/docs/11.x/blade#components)를 평가 및 렌더링하려면 `component` 메서드를 사용합니다. 이 메서드는 `Illuminate\Testing\TestComponent` 인스턴스를 반환합니다.

```
$view = $this->component(Profile::class, ['name' => 'Taylor']);

$view->assertSee('Taylor');
```

<a name="available-assertions"></a>
## 지원되는 Assertion(검증 메서드) 목록

<a name="response-assertions"></a>
### 응답(Response) 관련 Assertion

라라벨의 `Illuminate\Testing\TestResponse` 클래스는 애플리케이션을 테스트할 때 활용할 수 있는 다양한 커스텀 assertion(검증) 메서드를 제공합니다. 이 assertion들은 `json`, `get`, `post`, `put`, `delete` 테스트 메서드가 반환하는 response에서 사용할 수 있습니다.



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
[assertRedirectContains](#assert-redirect-contains)
[assertRedirectToRoute](#assert-redirect-to-route)
[assertRedirectToSignedRoute](#assert-redirect-to-signed-route)
[assertRequestTimeout](#assert-request-timeout)
[assertSee](#assert-see)
[assertSeeInOrder](#assert-see-in-order)
[assertSeeText](#assert-see-text)
[assertSeeTextInOrder](#assert-see-text-in-order)
[assertServerError](#assert-server-error)
[assertServiceUnavailable](#assert-server-unavailable)
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

응답의 HTTP 상태 코드가 Bad Request(400)인지 assertion 합니다.

```
$response->assertBadRequest();
```

<a name="assert-accepted"></a>
#### assertAccepted

응답의 HTTP 상태 코드가 Accepted(202)인지 assertion 합니다.

```
$response->assertAccepted();
```

<a name="assert-conflict"></a>
#### assertConflict

응답의 HTTP 상태 코드가 Conflict(409)인지 assertion 합니다.

```
$response->assertConflict();
```

<a name="assert-cookie"></a>
#### assertCookie

응답이 지정된 쿠키를 포함하고 있는지 assertion 합니다.

```
$response->assertCookie($cookieName, $value = null);
```

<a name="assert-cookie-expired"></a>
#### assertCookieExpired

응답이 지정된 쿠키를 포함하고 있고, 해당 쿠키가 만료되었는지 assertion 합니다.

```
$response->assertCookieExpired($cookieName);
```

<a name="assert-cookie-not-expired"></a>
#### assertCookieNotExpired

응답이 지정된 쿠키를 포함하고 있고, 해당 쿠키가 만료되지 않았는지 assertion 합니다.

```
$response->assertCookieNotExpired($cookieName);
```

<a name="assert-cookie-missing"></a>
#### assertCookieMissing

응답에 지정된 쿠키가 포함되어 있지 않은지 assertion 합니다.

```
$response->assertCookieMissing($cookieName);
```

<a name="assert-created"></a>
#### assertCreated

응답의 HTTP 상태 코드가 201(Created)인지 assertion 합니다.

```
$response->assertCreated();
```

<a name="assert-dont-see"></a>
#### assertDontSee

애플리케이션이 반환한 응답에 지정된 문자열이 포함되어 있지 않은지 assertion 합니다. 이 assertion은 두 번째 인자로 `false`를 전달하지 않는 한 전달된 문자열을 자동으로 이스케이프(escape)합니다.

```
$response->assertDontSee($value, $escaped = true);
```

<a name="assert-dont-see-text"></a>
#### assertDontSeeText

응답 텍스트에 지정된 문자열이 포함되어 있지 않은지 assertion 합니다. 이 assertion 역시 두 번째 인자로 `false`를 전달하지 않는 한 이스케이프 처리가 적용됩니다. 이 메서드는 assertion을 하기 전에 응답 내용을 PHP의 `strip_tags` 함수로 처리합니다.

```
$response->assertDontSeeText($value, $escaped = true);
```

<a name="assert-download"></a>
#### assertDownload

응답이 "다운로드"로 반환되었는지 assertion 합니다. 일반적으로 라우트에서 반환되는 응답이 `Response::download`, `BinaryFileResponse`, 또는 `Storage::download`일 때 사용합니다.

```
$response->assertDownload();
```

필요하다면, 다운로드 파일의 이름이 지정한 파일명인지 assertion할 수 있습니다.

```
$response->assertDownload('image.jpg');
```

<a name="assert-exact-json"></a>
#### assertExactJson

응답이 정확히 일치하는 JSON 데이터를 포함하고 있는지 assertion 합니다.

```
$response->assertExactJson(array $data);
```

<a name="assert-exact-json-structure"></a>
#### assertExactJsonStructure

응답이 정확히 일치하는 JSON 구조를 가지고 있는지 assertion 합니다.

```
$response->assertExactJsonStructure(array $data);
```

이 메서드는 [assertJsonStructure](#assert-json-structure)보다 더욱 엄격하게 동작합니다. 즉, 예상 JSON 구조에 명시적으로 포함되지 않은 키가 응답에 존재하면 테스트가 실패합니다.

<a name="assert-forbidden"></a>
#### assertForbidden

응답의 HTTP 상태 코드가 Forbidden(403)인지 assertion 합니다.

```
$response->assertForbidden();
```

<a name="assert-found"></a>

#### assertFound

응답이 found(302) HTTP 상태 코드를 반환하는지 확인합니다.

```
$response->assertFound();
```

<a name="assert-gone"></a>
#### assertGone

응답이 gone(410) HTTP 상태 코드를 반환하는지 확인합니다.

```
$response->assertGone();
```

<a name="assert-header"></a>
#### assertHeader

지정한 헤더와 값이 응답에 존재하는지 확인합니다.

```
$response->assertHeader($headerName, $value = null);
```

<a name="assert-header-missing"></a>
#### assertHeaderMissing

지정한 헤더가 응답에 존재하지 않는지 확인합니다.

```
$response->assertHeaderMissing($headerName);
```

<a name="assert-internal-server-error"></a>
#### assertInternalServerError

응답이 "Internal Server Error"(500) HTTP 상태 코드를 반환하는지 확인합니다.

```
$response->assertInternalServerError();
```

<a name="assert-json"></a>
#### assertJson

응답에 지정한 JSON 데이터가 포함되어 있는지 확인합니다.

```
$response->assertJson(array $data, $strict = false);
```

`assertJson` 메서드는 응답을 배열로 변환하여, 애플리케이션이 반환한 JSON 응답 내에 주어진 배열이 존재하는지 확인합니다. 따라서 JSON 응답에 다른 속성이 함께 있더라도 지정한 일부만 포함되어 있으면 테스트는 통과합니다.

<a name="assert-json-count"></a>
#### assertJsonCount

응답 JSON에서, 지정한 키에 배열로 기대하는 개수의 항목이 있는지 확인합니다.

```
$response->assertJsonCount($count, $key = null);
```

<a name="assert-json-fragment"></a>
#### assertJsonFragment

응답에 지정한 JSON 데이터(조각)가 어디든 포함되어 있는지 확인합니다.

```
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

응답 JSON이 배열 형식인지 확인합니다.

```
$response->assertJsonIsArray();
```

<a name="assert-json-is-object"></a>
#### assertJsonIsObject

응답 JSON이 객체 형식인지 확인합니다.

```
$response->assertJsonIsObject();
```

<a name="assert-json-missing"></a>
#### assertJsonMissing

응답에 지정한 JSON 데이터가 포함되어 있지 않은지 확인합니다.

```
$response->assertJsonMissing(array $data);
```

<a name="assert-json-missing-exact"></a>
#### assertJsonMissingExact

응답에 지정한 JSON 데이터가 정확히 존재하지 않는지 확인합니다.

```
$response->assertJsonMissingExact(array $data);
```

<a name="assert-json-missing-validation-errors"></a>
#### assertJsonMissingValidationErrors

응답에 지정한 키에 대한 JSON 유효성 검증 오류가 없는지 확인합니다.

```
$response->assertJsonMissingValidationErrors($keys);
```

> [!NOTE]  
> 보다 범용적인 [assertValid](#assert-valid) 메서드를 사용하면, 응답에 JSON으로 반환된 유효성 검증 오류가 없으며, 세션에도 오류가 저장되지 않았는지 확인할 수 있습니다.

<a name="assert-json-path"></a>
#### assertJsonPath

응답에서 지정한 경로(path)에 기대하는 데이터가 있는지 확인합니다.

```
$response->assertJsonPath($path, $expectedValue);
```

예를 들어, 애플리케이션에서 아래와 같은 JSON 응답이 반환된 경우:

```json
{
    "user": {
        "name": "Steve Schoger"
    }
}
```

`user` 객체의 `name` 속성이 기대하는 값과 일치하는지 다음과 같이 테스트할 수 있습니다.

```
$response->assertJsonPath('user.name', 'Steve Schoger');
```

<a name="assert-json-missing-path"></a>
#### assertJsonMissingPath

응답에 지정한 경로(path)가 존재하지 않는지 확인합니다.

```
$response->assertJsonMissingPath($path);
```

예를 들어, 애플리케이션에서 아래와 같은 JSON 응답이 반환된 경우:

```json
{
    "user": {
        "name": "Steve Schoger"
    }
}
```

`user` 객체에 `email` 속성이 없는지 다음과 같이 테스트할 수 있습니다.

```
$response->assertJsonMissingPath('user.email');
```

<a name="assert-json-structure"></a>
#### assertJsonStructure

응답에 지정한 JSON 구조가 포함되어 있는지 확인합니다.

```
$response->assertJsonStructure(array $structure);
```

예를 들어, 애플리케이션에서 반환하는 JSON 응답이 아래와 같을 때:

```json
{
    "user": {
        "name": "Steve Schoger"
    }
}
```

다음과 같이 JSON 구조가 기대한 대로인지 확인할 수 있습니다.

```
$response->assertJsonStructure([
    'user' => [
        'name',
    ]
]);
```

때때로, 애플리케이션이 반환하는 JSON 응답이 객체 배열일 수도 있습니다.

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

이처럼 배열 내 모든 객체의 구조를 검증하고 싶을 때는 `*` 문자를 사용할 수 있습니다.

```
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

지정한 키에 대해 JSON 형식의 유효성 검증 오류가 응답에 포함되어 있는지 확인합니다. 이 메서드는 유효성 검증 오류가 세션이 아닌 JSON 구조로 반환되는 응답을 확인할 때 사용해야 합니다.

```
$response->assertJsonValidationErrors(array $data, $responseKey = 'errors');
```

> [!NOTE]  
> 보다 범용적인 [assertInvalid](#assert-invalid) 메서드를 사용하면, 응답에 JSON으로 유효성 검증 오류가 있거나, 세션에 오류가 저장된 경우 모두 검증할 수 있습니다.

<a name="assert-json-validation-error-for"></a>
#### assertJsonValidationErrorFor

지정한 키에 대해 JSON 형식의 유효성 검증 오류가 있는지 확인합니다.

```
$response->assertJsonValidationErrorFor(string $key, $responseKey = 'errors');
```

<a name="assert-method-not-allowed"></a>
#### assertMethodNotAllowed

응답이 method not allowed(405) HTTP 상태 코드를 반환하는지 확인합니다.

```
$response->assertMethodNotAllowed();
```

<a name="assert-moved-permanently"></a>
#### assertMovedPermanently

응답이 moved permanently(301) HTTP 상태 코드를 반환하는지 확인합니다.

```
$response->assertMovedPermanently();
```

<a name="assert-location"></a>
#### assertLocation

응답의 `Location` 헤더에 지정한 URI 값이 포함되어 있는지 확인합니다.

```
$response->assertLocation($uri);
```

<a name="assert-content"></a>
#### assertContent

응답 본문이 지정한 문자열과 일치하는지 확인합니다.

```
$response->assertContent($value);
```

<a name="assert-no-content"></a>
#### assertNoContent

응답이 지정한 HTTP 상태 코드와 함께 내용이 없는지(no content) 확인합니다.

```
$response->assertNoContent($status = 204);
```

<a name="assert-streamed"></a>
#### assertStreamed

응답이 스트리밍 형태인지 확인합니다.

```
$response->assertStreamed();
```

<a name="assert-streamed-content"></a>
#### assertStreamedContent

스트리밍 응답의 본문이 지정한 문자열과 일치하는지 확인합니다.

```
$response->assertStreamedContent($value);
```

<a name="assert-not-found"></a>
#### assertNotFound

응답이 not found(404) HTTP 상태 코드를 반환하는지 확인합니다.

```
$response->assertNotFound();
```

<a name="assert-ok"></a>
#### assertOk

응답이 200 HTTP 상태 코드를 반환하는지 확인합니다.

```
$response->assertOk();
```

<a name="assert-payment-required"></a>
#### assertPaymentRequired

응답이 payment required(402) HTTP 상태 코드를 반환하는지 확인합니다.

```
$response->assertPaymentRequired();
```

<a name="assert-plain-cookie"></a>
#### assertPlainCookie

응답에 지정한 암호화되지 않은 쿠키가 포함되어 있는지 확인합니다.

```
$response->assertPlainCookie($cookieName, $value = null);
```

<a name="assert-redirect"></a>
#### assertRedirect

응답이 지정한 URI로 리디렉션되는지 확인합니다.

```
$response->assertRedirect($uri = null);
```

<a name="assert-redirect-contains"></a>
#### assertRedirectContains

응답이 지정한 문자열을 포함하는 URI로 리디렉션 중인지 확인합니다.

```
$response->assertRedirectContains($string);
```

<a name="assert-redirect-to-route"></a>
#### assertRedirectToRoute

응답이 지정한 [네임드 라우트](/docs/11.x/routing#named-routes)로 리디렉션되는지 확인합니다.

```
$response->assertRedirectToRoute($name, $parameters = []);
```

<a name="assert-redirect-to-signed-route"></a>
#### assertRedirectToSignedRoute

응답이 지정한 [서명된 라우트](/docs/11.x/urls#signed-urls)로 리디렉션되는지 확인합니다.

```
$response->assertRedirectToSignedRoute($name = null, $parameters = []);
```

<a name="assert-request-timeout"></a>
#### assertRequestTimeout

응답이 request timeout(408) HTTP 상태 코드를 반환하는지 확인합니다.

```
$response->assertRequestTimeout();
```

<a name="assert-see"></a>
#### assertSee

응답에 지정한 문자열이 포함되어 있는지 확인합니다. 두 번째 인자로 `false`를 전달하지 않는 한, 해당 문자열은 자동으로 이스케이프 처리됩니다.

```
$response->assertSee($value, $escaped = true);
```

<a name="assert-see-in-order"></a>
#### assertSeeInOrder

응답 내에서 지정한 여러 문자열이 순서대로 포함되어 있는지 확인합니다. 두 번째 인자로 `false`를 전달하지 않는 한, 각각의 문자열은 자동으로 이스케이프 처리됩니다.

```
$response->assertSeeInOrder(array $values, $escaped = true);
```

<a name="assert-see-text"></a>
#### assertSeeText

응답 본문 텍스트에 지정한 문자열이 포함되어 있는지 확인합니다. 두 번째 인자로 `false`를 전달하지 않는 한, 해당 문자열은 자동으로 이스케이프 처리됩니다. 응답 본문은 assert를 수행하기 전에 `strip_tags` PHP 함수로 전처리됩니다.

```
$response->assertSeeText($value, $escaped = true);
```

<a name="assert-see-text-in-order"></a>
#### assertSeeTextInOrder

응답 본문 텍스트 내에서 지정한 여러 문자열이 순서대로 포함되어 있는지 확인합니다. 두 번째 인자로 `false`를 전달하지 않는 한, 각각의 문자열은 자동으로 이스케이프 처리됩니다. 응답 본문은 assert를 수행하기 전에 `strip_tags` PHP 함수로 전처리됩니다.

```
$response->assertSeeTextInOrder(array $values, $escaped = true);
```

<a name="assert-server-error"></a>
#### assertServerError

응답이 서버 오류(500 이상 600 미만) HTTP 상태 코드를 반환하는지 확인합니다.

```
$response->assertServerError();
```

<a name="assert-server-unavailable"></a>
#### assertServiceUnavailable

응답이 "Service Unavailable"(503) HTTP 상태 코드를 반환하는지 확인합니다.

```
$response->assertServiceUnavailable();
```

<a name="assert-session-has"></a>
#### assertSessionHas

세션에 지정한 데이터가 존재하는지 확인합니다.

```
$response->assertSessionHas($key, $value = null);
```

필요하다면, 두 번째 인자로 클로저를 전달할 수 있습니다. 클로저가 `true`를 반환하면 검증에 통과합니다.

```
$response->assertSessionHas($key, function (User $value) {
    return $value->name === 'Taylor Otwell';
});
```

<a name="assert-session-has-input"></a>
#### assertSessionHasInput

세션의 [플래시된 입력값 배열](/docs/11.x/responses#redirecting-with-flashed-session-data)에 지정한 값이 있는지 확인합니다.

```
$response->assertSessionHasInput($key, $value = null);
```

필요하다면, 두 번째 인자로 클로저를 전달할 수 있습니다. 클로저가 `true`를 반환하면 검증에 통과합니다.

```
use Illuminate\Support\Facades\Crypt;

$response->assertSessionHasInput($key, function (string $value) {
    return Crypt::decryptString($value) === 'secret';
});
```

<a name="assert-session-has-all"></a>
#### assertSessionHasAll

세션이 지정된 키-값 쌍의 배열을 모두 포함하고 있는지 확인합니다.

```
$response->assertSessionHasAll(array $data);
```

예를 들어, 애플리케이션의 세션에 `name`과 `status` 키가 포함되어 있으면, 둘 다 지정한 값을 갖는지 다음과 같이 확인할 수 있습니다.

```
$response->assertSessionHasAll([
    'name' => 'Taylor Otwell',
    'status' => 'active',
]);
```

<a name="assert-session-has-errors"></a>
#### assertSessionHasErrors

세션에 지정한 `$keys`(들)에 대해 오류가 있는지 확인합니다. `$keys`가 연관 배열(associative array)인 경우, 각 필드(키)에 대해 특정 오류 메시지(값)가 존재하는지 검증합니다. 이 메서드는 유효성 검증 오류가 JSON 구조가 아닌 세션으로 플래시될 때 테스트에 사용해야 합니다.

```
$response->assertSessionHasErrors(
    array $keys = [], $format = null, $errorBag = 'default'
);
```

예를 들어, `name`과 `email` 필드에 유효성 검증 오류 메시지가 세션에 플래시되었는지 확인하려면 아래처럼 사용할 수 있습니다.

```
$response->assertSessionHasErrors(['name', 'email']);
```

또는, 특정 필드에 대해 특정 유효성 검증 오류 메시지가 존재하는지도 확인할 수 있습니다.

```
$response->assertSessionHasErrors([
    'name' => 'The given name was invalid.'
]);
```

> [!NOTE]  
> 보다 범용적인 [assertInvalid](#assert-invalid) 메서드를 사용하면, 응답에 JSON으로 유효성 검증 오류가 있거나, 세션에 오류가 저장된 경우 모두 검증할 수 있습니다.

<a name="assert-session-has-errors-in"></a>
#### assertSessionHasErrorsIn

특정 [에러 백](error bag)에서, 지정한 `$keys`가 오류를 포함하고 있는지 확인합니다. `$keys`가 연관 배열이면, 에러 백 안에서 각 필드(키)에 대해 특정 오류 메시지(값)가 존재하는지 검증합니다.

```
$response->assertSessionHasErrorsIn($errorBag, $keys = [], $format = null);
```

<a name="assert-session-has-no-errors"></a>
#### assertSessionHasNoErrors

세션에 유효성 검증 오류가 전혀 없는지 확인합니다.

```
$response->assertSessionHasNoErrors();
```

<a name="assert-session-doesnt-have-errors"></a>

#### assertSessionDoesntHaveErrors

세션에 지정한 키의 유효성 검증 에러가 없음을 확인합니다.

```
$response->assertSessionDoesntHaveErrors($keys = [], $format = null, $errorBag = 'default');
```

> [!NOTE]  
> 보다 범용적인 [assertValid](#assert-valid) 메서드를 사용하면, 응답에 유효성 검증 에러가 JSON 형태로 반환되지 않았는지 **그리고** 세션에 에러가 플래시되지 않았는지까지 모두 확인할 수 있습니다.

<a name="assert-session-missing"></a>
#### assertSessionMissing

세션에 지정한 키가 존재하지 않음을 확인합니다.

```
$response->assertSessionMissing($key);
```

<a name="assert-status"></a>
#### assertStatus

응답이 지정한 HTTP 상태 코드를 가지는지 확인합니다.

```
$response->assertStatus($code);
```

<a name="assert-successful"></a>
#### assertSuccessful

응답이 성공(HTTP 상태 코드 200 이상 300 미만) 상태임을 확인합니다.

```
$response->assertSuccessful();
```

<a name="assert-too-many-requests"></a>
#### assertTooManyRequests

응답이 '요청이 너무 많음'(429) HTTP 상태 코드임을 확인합니다.

```
$response->assertTooManyRequests();
```

<a name="assert-unauthorized"></a>
#### assertUnauthorized

응답이 인증되지 않음(401) HTTP 상태 코드임을 확인합니다.

```
$response->assertUnauthorized();
```

<a name="assert-unprocessable"></a>
#### assertUnprocessable

응답이 처리할 수 없음(422) HTTP 상태 코드임을 확인합니다.

```
$response->assertUnprocessable();
```

<a name="assert-unsupported-media-type"></a>
#### assertUnsupportedMediaType

응답이 지원되지 않는 미디어 타입(415) HTTP 상태 코드임을 확인합니다.

```
$response->assertUnsupportedMediaType();
```

<a name="assert-valid"></a>
#### assertValid

응답에 지정한 키에 대한 유효성 검증 에러가 없음을 확인합니다. 이 메서드는 유효성 검증 에러가 JSON 구조로 반환된 경우나, 세션에 플래시된 경우 모두에 사용할 수 있습니다.

```
// 유효성 검증 에러가 전혀 없는지 확인...
$response->assertValid();

// 지정한 키에 유효성 검증 에러가 없는지 확인...
$response->assertValid(['name', 'email']);
```

<a name="assert-invalid"></a>
#### assertInvalid

응답에 지정한 키에 대해 유효성 검증 에러가 있음을 확인합니다. 이 메서드는 유효성 검증 에러가 JSON 구조로 반환된 경우나, 세션에 플래시된 경우 모두에 사용할 수 있습니다.

```
$response->assertInvalid(['name', 'email']);
```

또한, 특정 키가 어떤 유효성 검증 에러 메시지를 가지는지도 함께 확인할 수 있습니다. 이때 전체 메시지를 제공하거나, 메시지의 일부분만 제공해도 됩니다.

```
$response->assertInvalid([
    'name' => 'The name field is required.',
    'email' => 'valid email address',
]);
```

<a name="assert-view-has"></a>
#### assertViewHas

응답 뷰에 지정한 데이터가 포함되어 있는지 확인합니다.

```
$response->assertViewHas($key, $value = null);
```

`assertViewHas` 메서드의 두 번째 인자로 클로저를 전달하면, 해당 뷰 데이터 값을 검사하고 추가적인 검증을 할 수 있습니다.

```
$response->assertViewHas('user', function (User $user) {
    return $user->name === 'Taylor';
});
```

또한, 뷰 데이터는 응답에서 배열 변수로 접근할 수 있으므로 좀 더 간편하게 값을 확인할 수 있습니다.

```php tab=Pest
expect($response['name'])->toBe('Taylor');
```

```php tab=PHPUnit
$this->assertEquals('Taylor', $response['name']);
```

<a name="assert-view-has-all"></a>
#### assertViewHasAll

응답 뷰에 지정한 데이터 목록이 모두 포함되어 있는지 확인합니다.

```
$response->assertViewHasAll(array $data);
```

이 메서드를 사용하면, 뷰에 지정한 키들이 포함되어 있는지만 간단히 확인할 수 있습니다.

```
$response->assertViewHasAll([
    'name',
    'email',
]);
```

또는, 뷰 데이터가 포함될 뿐 아니라 특정 값까지 일치하는지도 확인할 수 있습니다.

```
$response->assertViewHasAll([
    'name' => 'Taylor Otwell',
    'email' => 'taylor@example.com,',
]);
```

<a name="assert-view-is"></a>
#### assertViewIs

라우트가 반환한 뷰가 지정한 뷰명과 일치하는지 확인합니다.

```
$response->assertViewIs($value);
```

<a name="assert-view-missing"></a>
#### assertViewMissing

애플리케이션의 응답에서 반환된 뷰에 지정한 데이터 키가 전달되지 않았음을 확인합니다.

```
$response->assertViewMissing($key);
```

<a name="authentication-assertions"></a>
### 인증 관련 Assertion

라라벨은 애플리케이션의 기능 테스트에서 사용할 수 있는 다양한 인증 관련 assertion도 제공합니다. 이 메서드들은 `get`, `post`와 같이 `Illuminate\Testing\TestResponse` 인스턴스가 반환되는 메서드가 아니라, 테스트 클래스 자체에서 호출된다는 점에 유의하세요.

<a name="assert-authenticated"></a>
#### assertAuthenticated

사용자가 인증된 상태임을 확인합니다.

```
$this->assertAuthenticated($guard = null);
```

<a name="assert-guest"></a>
#### assertGuest

사용자가 인증되지 않은 상태(게스트)임을 확인합니다.

```
$this->assertGuest($guard = null);
```

<a name="assert-authenticated-as"></a>
#### assertAuthenticatedAs

특정 사용자가 인증된 상태임을 확인합니다.

```
$this->assertAuthenticatedAs($user, $guard = null);
```

<a name="validation-assertions"></a>
## 유효성 검증 Assertion

라라벨에서는 요청에 포함된 데이터가 유효하거나 유효하지 않은지 확인하기 위한 두 가지 주요 유효성 검증 관련 assertion을 제공합니다.

<a name="validation-assert-valid"></a>
#### assertValid

응답에 지정한 키에 대한 유효성 검증 에러가 없음을 확인합니다. 이 메서드는 유효성 검증 에러가 JSON 구조로 반환된 경우나, 세션에 플래시된 경우 모두에 사용할 수 있습니다.

```
// 유효성 검증 에러가 전혀 없는지 확인...
$response->assertValid();

// 지정한 키에 유효성 검증 에러가 없는지 확인...
$response->assertValid(['name', 'email']);
```

<a name="validation-assert-invalid"></a>
#### assertInvalid

응답에 지정한 키에 대해 유효성 검증 에러가 있음을 확인합니다. 이 메서드는 유효성 검증 에러가 JSON 구조로 반환된 경우나, 세션에 플래시된 경우 모두에 사용할 수 있습니다.

```
$response->assertInvalid(['name', 'email']);
```

또한, 특정 키가 어떤 유효성 검증 에러 메시지를 가지는지도 함께 확인할 수 있습니다. 이때 전체 메시지를 제공하거나, 메시지의 일부분만 제공해도 됩니다.

```
$response->assertInvalid([
    'name' => 'The name field is required.',
    'email' => 'valid email address',
]);
```