# HTTP 테스트 (HTTP Tests)

- [소개](#introduction)
- [요청 보내기](#making-requests)
    - [요청 헤더 커스터마이징](#customizing-request-headers)
    - [쿠키 사용](#cookies)
    - [세션 / 인증](#session-and-authentication)
    - [응답 디버깅](#debugging-responses)
    - [예외 처리](#exception-handling)
- [JSON API 테스트](#testing-json-apis)
    - [플루언트 JSON 테스트](#fluent-json-testing)
- [파일 업로드 테스트](#testing-file-uploads)
- [뷰 테스트](#testing-views)
    - [Blade 및 컴포넌트 렌더링](#rendering-blade-and-components)
- [사용 가능한 Assertion](#available-assertions)
    - [응답 Assertion](#response-assertions)
    - [인증 Assertion](#authentication-assertions)
    - [유효성 검증 Assertion](#validation-assertions)

<a name="introduction"></a>
## 소개

라라벨은 애플리케이션에 HTTP 요청을 보내고, 그 응답을 검사할 수 있도록 아주 직관적인 API를 제공합니다. 아래의 기능 테스트 예시를 참고해보세요.

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

`get` 메서드는 애플리케이션에 `GET` 요청을 보내고, `assertStatus` 메서드는 반환된 응답의 HTTP 상태 코드가 지정한 값과 일치하는지 확인합니다. 이처럼 간단한 assert 외에도, 라라벨은 응답의 헤더, 내용, JSON 구조 등을 검사할 수 있는 다양한 assertion 메서드를 제공합니다.

<a name="making-requests"></a>
## 요청 보내기

애플리케이션에 요청을 보내려면 테스트 내에서 `get`, `post`, `put`, `patch`, `delete` 메서드를 호출하면 됩니다. 이 메서드들은 실제로 외부와 통신하는 "진짜" HTTP 요청을 생성하지 않고, 내부적으로 네트워크 요청을 시뮬레이션해서 처리합니다.

테스트 요청 메서드는 `Illuminate\Http\Response` 인스턴스를 반환하지 않고, 대신 `Illuminate\Testing\TestResponse` 인스턴스를 반환합니다. 이 인스턴스는 [여러 가지 유용한 assertion](#available-assertions) 기능을 제공하며, 이를 활용해 애플리케이션의 응답을 편리하게 검사할 수 있습니다.

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

일반적으로, 각 테스트에서는 애플리케이션에 한 번만 요청을 보내는 것이 좋습니다. 하나의 테스트 메서드 내에서 여러 번 요청을 보내면 예상치 못한 동작이 발생할 수 있습니다.

> [!NOTE]
> 테스트를 실행할 때 CSRF 미들웨어는 자동으로 비활성화됩니다.

<a name="customizing-request-headers"></a>
### 요청 헤더 커스터마이징

`withHeaders` 메서드를 사용하면 요청이 애플리케이션에 전달되기 전에 원하는 헤더를 추가할 수 있습니다. 이 메서드를 통해 사용자 지정 헤더를 마음대로 추가해서 요청을 보낼 수 있습니다.

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
### 쿠키 사용

요청을 보내기 전에 `withCookie` 또는 `withCookies` 메서드를 이용해 쿠키 값을 지정할 수 있습니다. `withCookie`는 쿠키명과 값을 각각 전달하고, `withCookies`는 이름/값 쌍의 배열을 전달합니다.

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

라라벨은 HTTP 테스트를 할 때 세션에 접근하거나 조작할 수 있는 여러 보조 함수를 제공합니다. 먼저, `withSession` 메서드로 세션에 원하는 데이터를 배열 형태로 미리 담아둘 수 있습니다. 이렇게 하면 애플리케이션에 요청을 보내기 전에 세션에 데이터를 셋팅할 수 있어서 유용합니다.

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

라라벨 세션은 일반적으로 현재 인증된 사용자의 상태를 저장하는 용도로 사용됩니다. 그래서 `actingAs` 보조 메서드를 사용하면 특정 사용자를 현재 로그인한 사용자로 간단하게 인증할 수 있습니다. 예를 들어, [모델 팩토리](/docs/12.x/eloquent-factories)를 활용해 사용자를 생성하고 인증할 수 있습니다.

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

또한, `actingAs` 메서드의 두 번째 인수로 가드(guard) 이름을 전달하여, 어떤 가드로 사용자를 인증할지 지정할 수 있습니다. 테스트가 진행되는 동안 `actingAs`에 전달한 가드는 기본 가드로 사용됩니다.

```php
$this->actingAs($user, 'web')
```

<a name="debugging-responses"></a>
### 응답 디버깅

테스트 요청을 보낸 후, `dump`, `dumpHeaders`, `dumpSession` 메서드를 통해 응답의 내용, 헤더, 세션 데이터를 콘솔에 출력해 디버깅할 수 있습니다.

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

또는, `dd`, `ddHeaders`, `ddBody`, `ddJson`, `ddSession` 메서드로 응답 정보를 출력하고, 즉시 테스트 실행을 중단할 수도 있습니다.

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

특정 예외가 발생하는지 테스트하고 싶을 때가 있습니다. 이럴 때는 `Exceptions` 파사드를 활용해 예외 핸들러를 "가짜(faked)"로 만들 수 있습니다. 예외 핸들러를 가짜로 설정하면, 요청 처리 중 발생한 예외에 대해 `assertReported`와 `assertNotReported` 메서드를 사용해 예외 발생 여부를 검증할 수 있습니다.

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

`assertNotReported`와 `assertNothingReported` 메서드를 사용하면, 지정한 예외가 발생하지 않았는지 또는 아예 아무 예외도 발생하지 않았는지를 확인할 수 있습니다.

```php
Exceptions::assertNotReported(InvalidOrderException::class);

Exceptions::assertNothingReported();
```

`withoutExceptionHandling` 메서드를 요청 전에 호출하면 해당 요청에서 예외 핸들링을 완전히 비활성화할 수 있습니다.

```php
$response = $this->withoutExceptionHandling()->get('/');
```

또한, PHP 언어나 의존 라이브러리에서 지원 중단된 기능(Deprecated)을 사용 중인지 확인하고 싶을 때는, 요청 전에 `withoutDeprecationHandling` 메서드를 사용할 수 있습니다. 이 기능을 끄면, 지원 종료 경고가 예외로 변환되어 테스트가 실패하게 됩니다.

```php
$response = $this->withoutDeprecationHandling()->get('/');
```

`assertThrows` 메서드는 주어진 클로저 안에서 특정 타입의 예외가 발생하는지 검증할 때 사용할 수 있습니다.

```php
$this->assertThrows(
    fn () => (new ProcessOrder)->execute(),
    OrderInvalid::class
);
```

또한, 두 번째 인수에 클로저를 전달하면, 발생한 예외 객체를 직접 검사하고 assertion을 추가할 수 있습니다.

```php
$this->assertThrows(
    fn () => (new ProcessOrder)->execute(),
    fn (OrderInvalid $e) => $e->orderId() === 123;
);
```

`assertDoesntThrow` 메서드를 사용하면, 주어진 클로저 안에서 어떤 예외도 발생하지 않는지 테스트할 수 있습니다.

```php
$this->assertDoesntThrow(fn () => (new ProcessOrder)->execute());
```

<a name="testing-json-apis"></a>
## JSON API 테스트

라라벨은 JSON API 및 해당 응답을 테스트하기 위한 여러 가지 보조 함수도 제공합니다. 예를 들어, `json`, `getJson`, `postJson`, `putJson`, `patchJson`, `deleteJson`, `optionsJson` 메서드를 사용하면 다양한 HTTP 메서드로 JSON 요청을 쉽게 보낼 수 있습니다. 이 메서드들은 데이터와 헤더도 간단하게 함께 전달할 수 있습니다. 시작 예시로, `/api/user`에 `POST` 요청을 보내고, 기대하는 JSON 데이터가 반환되었는지 검증하는 테스트 코드를 작성해보겠습니다.

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

또한, JSON 응답 데이터는 배열 변수처럼 접근할 수 있으므로, JSON 응답에서 반환된 개별 값을 바로 검사할 수 있습니다.

```php tab=Pest
expect($response['created'])->toBeTrue();
```

```php tab=PHPUnit
$this->assertTrue($response['created']);
```

> [!NOTE]
> `assertJson` 메서드는 응답을 배열로 변환하여, 해당 배열이 애플리케이션에서 반환된 JSON 응답 내에 포함되어 있는지 확인합니다. 따라서 JSON 응답에 다른 속성이 더 있더라도, 지정한 조각(fragment)만 포함되어 있으면 테스트는 통과합니다.

<a name="verifying-exact-match"></a>
#### JSON 정확히 일치 여부 검사

앞에서 설명한 것처럼, `assertJson` 메서드는 JSON 응답에 지정한 일부 데이터가 포함되어 있는지 확인합니다. 만약 주어진 배열이 애플리케이션에서 반환된 JSON 내용과 **정확히 일치**하는지 확인하고 싶다면 `assertExactJson` 메서드를 사용해야 합니다.

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
#### JSON 경로(Path)에서 값 검증하기

JSON 응답에서 특정 경로(path)에 데이터가 존재하는지 확인하려면 `assertJsonPath` 메서드를 사용하세요.

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

`assertJsonPath` 메서드는 클로저도 인수로 받을 수 있으며, 동적으로 assertion의 통과 여부를 결정할 수 있습니다.

```php
$response->assertJsonPath('team.owner.name', fn (string $name) => strlen($name) >= 3);
```

<a name="fluent-json-testing"></a>

### 플루언트 JSON 테스트

라라벨은 애플리케이션의 JSON 응답을 플루언트하게(체이닝 방식으로) 테스트할 수 있는 편리한 방식을 제공합니다. 우선, `assertJson` 메서드에 클로저를 전달하면 됩니다. 이 클로저는 `Illuminate\Testing\Fluent\AssertableJson` 인스턴스를 인자로 받으며, 이를 통해 애플리케이션에서 반환된 JSON에 다양한 검증을 할 수 있습니다. JSON의 특정 속성에 대한 검증은 `where` 메서드를, 특정 속성이 JSON에서 누락되어 있는지 검증하려면 `missing` 메서드를 사용합니다.

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

위의 예제에서 체이닝 마지막에 `etc` 메서드를 호출한 것을 볼 수 있습니다. 이 메서드는 해당 JSON 객체에 명시적으로 검증하지 않은 추가 속성이 더 있을 수 있음을 라라벨에게 알립니다. 만약 `etc` 메서드를 사용하지 않으면, 검증하지 않은 속성이 JSON 객체에 존재할 경우 테스트가 실패합니다.

이러한 동작은 민감한 정보가 JSON 응답에 의도치 않게 포함되는 것을 방지하기 위한 것으로, 속성에 대해 명시적으로 assert를 하거나 또는 `etc` 메서드를 통해 추가 속성을 허용해야만 합니다.

하지만 주의할 점은, `etc` 메서드를 assert 체인에 포함하지 않아도, JSON 객체 내부에 중첩된 배열에 다른 추가 속성이 포함되는 것은 막지 못한다는 점입니다. `etc` 메서드는 호출된 해당 중첩 수준에서만 추가 속성이 없는지 보장합니다.

<a name="asserting-json-attribute-presence-and-absence"></a>
#### 속성의 존재/부재 확인

특정 속성이 존재하는지 혹은 누락되어 있는지 검증하려면 `has`와 `missing` 메서드를 사용하면 됩니다.

```php
$response->assertJson(fn (AssertableJson $json) =>
    $json->has('data')
        ->missing('message')
);
```

또한, `hasAll`과 `missingAll` 메서드를 사용하면 여러 속성의 존재 혹은 부재를 한 번에 확인할 수 있습니다.

```php
$response->assertJson(fn (AssertableJson $json) =>
    $json->hasAll(['status', 'data'])
        ->missingAll(['message', 'code'])
);
```

`hasAny` 메서드를 사용하면, 주어진 속성 중 하나 이상이 존재하는지를 판별할 수 있습니다.

```php
$response->assertJson(fn (AssertableJson $json) =>
    $json->has('status')
        ->hasAny('data', 'message', 'code')
);
```

<a name="asserting-against-json-collections"></a>
#### JSON 컬렉션 검증하기

여러 개의 항목(예: 다수의 사용자)을 담은 JSON 응답을 반환하는 라우트가 자주 있습니다.

```php
Route::get('/users', function () {
    return User::all();
});
```

이런 상황에서는, 플루언트 JSON 객체의 `has` 메서드를 사용해 응답에 포함된 사용자 수를 검증할 수 있습니다. 예를 들어, JSON 응답에 사용자 3명이 포함되어 있는지 확인한 후, `first` 메서드를 사용해 컬렉션의 첫 번째 사용자에 대한 검증을 수행할 수 있습니다. `first` 메서드는 클로저를 매개변수로 받아 컬렉션의 첫 번째 객체에 대해 추가적인 assert를 할 수 있게 합니다.

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
#### JSON 컬렉션에서의 범위 지정(assert 스코핑)

때로는 라라벨 애플리케이션의 라우트가 `meta`, `users`와 같이 이름 있는 키 아래에 JSON 컬렉션을 담아 반환하기도 합니다.

```php
Route::get('/users', function () {
    return [
        'meta' => [...],
        'users' => User::all(),
    ];
})
```

이런 라우트를 테스트할 때는, `has` 메서드로 컬렉션의 항목 수를 검증할 수 있으며, 추가적으로 `has` 메서드를 반복 사용하여 검증 범위(스코프)를 지정할 수 있습니다.

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

하지만 `users` 컬렉션에 대해 두 번의 `has` 호출을 하는 대신, 세 번째 인자인 클로저를 활용해서 한 번의 `has` 호출로 체이닝과 스코핑을 할 수 있습니다. 이 경우, 클로저는 컬렉션의 첫 번째 항목을 자동으로 받아서 해당 객체에 대한 assert 체인을 실행하게 됩니다.

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
#### JSON 타입 검증하기

때로는 JSON 응답 내 속성이 특정 타입인지(assert type)만을 검증하고 싶을 수 있습니다. `Illuminate\Testing\Fluent\AssertableJson` 클래스는 이를 위한 `whereType`과 `whereAllType` 메서드를 제공합니다.

```php
$response->assertJson(fn (AssertableJson $json) =>
    $json->whereType('id', 'integer')
        ->whereAllType([
            'users.0.name' => 'string',
            'meta' => 'array'
        ])
);
```

`|` 기호를 사용해 여러 타입을 지정할 수 있고, 또는 타입의 배열을 두 번째 인수로 전달할 수도 있습니다. 응답 값이 지정된 타입 중 하나와 일치하면 검증이 성공합니다.

```php
$response->assertJson(fn (AssertableJson $json) =>
    $json->whereType('name', 'string|null')
        ->whereType('id', ['string', 'integer'])
);
```

`whereType`과 `whereAllType` 메서드는 다음 타입을 인식합니다: `string`, `integer`, `double`, `boolean`, `array`, `null`.

<a name="testing-file-uploads"></a>
## 파일 업로드 테스트

`Illuminate\Http\UploadedFile` 클래스는 테스트용 가짜 파일이나 이미지를 생성할 수 있는 `fake` 메서드를 제공합니다. 이를 `Storage` 파사드의 `fake` 메서드와 함께 사용하면 파일 업로드 기능을 아주 쉽게 테스트할 수 있습니다. 예를 들어, 이 두 기능을 결합하면 프로필 이미지(아바타) 업로드 폼을 간단하게 테스트할 수 있습니다.

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

특정 파일이 존재하지 않아야 함을 검증하려면, `Storage` 파사드에서 제공하는 `assertMissing` 메서드를 사용할 수 있습니다.

```php
Storage::fake('avatars');

// ...

Storage::disk('avatars')->assertMissing('missing.jpg');
```

<a name="fake-file-customization"></a>
#### 가짜 파일 커스터마이즈

`UploadedFile` 클래스의 `fake` 메서드로 파일을 만들 때, 이미지의 가로(width), 세로(height), 크기(KB 단위)를 지정해서 애플리케이션의 유효성 검증 규칙을 더 효과적으로 테스트할 수 있습니다.

```php
UploadedFile::fake()->image('avatar.jpg', $width, $height)->size(100);
```

이미지뿐만 아니라 다른 형식의 파일도 `create` 메서드를 이용해 만들 수 있습니다.

```php
UploadedFile::fake()->create('document.pdf', $sizeInKilobytes);
```

필요하다면, 해당 파일의 MIME 타입을 명시적으로 지정하는 `$mimeType` 인수를 추가로 전달할 수 있습니다.

```php
UploadedFile::fake()->create(
    'document.pdf', $sizeInKilobytes, 'application/pdf'
);
```

<a name="testing-views"></a>
## 뷰(View) 테스트

라라벨에서는 실제 HTTP 요청을 시뮬레이션하지 않고도 뷰를 렌더링하고 테스트할 수 있습니다. 이를 위해서는 테스트 내에서 `view` 메서드를 호출하십시오. 이 메서드는 뷰 이름과(필요하다면) 데이터 배열을 인자로 받으며, 반환값으로 `Illuminate\Testing\TestView` 인스턴스를 제공합니다. 이 인스턴스는 뷰의 다양한 내용을 쉽게 검증할 수 있는 여러 메서드를 제공합니다.

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

`TestView` 클래스는 다음과 같은 assertion 메서드를 지원합니다: `assertSee`, `assertSeeInOrder`, `assertSeeText`, `assertSeeTextInOrder`, `assertDontSee`, `assertDontSeeText`.

필요하다면, `TestView` 인스턴스를 문자열로 캐스팅하여 렌더링된 뷰의 원본 내용을 얻을 수 있습니다.

```php
$contents = (string) $this->view('welcome');
```

<a name="sharing-errors"></a>
#### 에러 공유

일부 뷰는 [라라벨이 제공하는 전역 에러 백](/docs/12.x/validation#quick-displaying-the-validation-errors)에 공유된 에러 데이터에 의존할 수 있습니다. 에러 백에 에러 메시지를 할당하려면, `withViewErrors` 메서드를 사용할 수 있습니다.

```php
$view = $this->withViewErrors([
    'name' => ['Please provide a valid name.']
])->view('form');

$view->assertSee('Please provide a valid name.');
```

<a name="rendering-blade-and-components"></a>
### Blade 및 컴포넌트 렌더링

필요하다면, `blade` 메서드를 사용해 [Blade](/docs/12.x/blade) 문자열을 직접 평가하고 렌더링할 수 있습니다. `view` 메서드와 마찬가지로, `blade` 메서드 역시 `Illuminate\Testing\TestView` 인스턴스를 반환합니다.

```php
$view = $this->blade(
    '<x-component :name="$name" />',
    ['name' => 'Taylor']
);

$view->assertSee('Taylor');
```

[Blade 컴포넌트](/docs/12.x/blade#components)를 테스트하려면 `component` 메서드를 사용할 수 있습니다. 이 메서드는 `Illuminate\Testing\TestComponent` 인스턴스를 반환합니다.

```php
$view = $this->component(Profile::class, ['name' => 'Taylor']);

$view->assertSee('Taylor');
```

<a name="available-assertions"></a>
## 지원되는 Assertion 메서드

<a name="response-assertions"></a>
### 응답(Response) Assertion

라라벨의 `Illuminate\Testing\TestResponse` 클래스는 애플리케이션의 테스트 시 활용할 수 있는 다양한 커스텀 assertion 메서드를 제공합니다. 이러한 assertion들은 `json`, `get`, `post`, `put`, `delete`와 같은 테스트 메서드로 반환된 응답에서 사용할 수 있습니다.

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

응답이 400(Bad Request) HTTP 상태 코드인지 확인합니다.

```php
$response->assertBadRequest();
```

<a name="assert-accepted"></a>
#### assertAccepted

응답이 202(Accepted) HTTP 상태 코드인지 확인합니다.

```php
$response->assertAccepted();
```

<a name="assert-conflict"></a>
#### assertConflict

응답이 409(Conflict) HTTP 상태 코드인지 확인합니다.

```php
$response->assertConflict();
```

<a name="assert-cookie"></a>
#### assertCookie

응답에 지정한 쿠키가 포함되어 있는지 확인합니다.

```php
$response->assertCookie($cookieName, $value = null);
```

<a name="assert-cookie-expired"></a>
#### assertCookieExpired

응답에 지정한 쿠키가 포함되어 있고, 해당 쿠키가 만료됐는지 확인합니다.

```php
$response->assertCookieExpired($cookieName);
```

<a name="assert-cookie-not-expired"></a>
#### assertCookieNotExpired

응답에 지정한 쿠키가 포함되어 있고, 해당 쿠키가 만료되지 않았는지 확인합니다.

```php
$response->assertCookieNotExpired($cookieName);
```

<a name="assert-cookie-missing"></a>
#### assertCookieMissing

응답에 지정한 쿠키가 포함되어 있지 않은지 확인합니다.

```php
$response->assertCookieMissing($cookieName);
```

<a name="assert-created"></a>
#### assertCreated

응답이 201(Created) HTTP 상태 코드인지 확인합니다.

```php
$response->assertCreated();
```

<a name="assert-dont-see"></a>
#### assertDontSee

응답 내용(애플리케이션이 반환한 응답) 내에 특정 문자열이 포함되어 있지 않은지 확인합니다. 기본적으로 전달한 문자열을 자동으로 escape 하지만, 두 번째 인자에 `false`를 전달하면 escape를 하지 않습니다.

```php
$response->assertDontSee($value, $escape = true);
```

<a name="assert-dont-see-text"></a>
#### assertDontSeeText

응답 텍스트에 특정 문자열이 포함되어 있지 않은지 확인합니다. 이 메서드 또한 기본적으로 전달한 문자열을 escape 처리하지만, 두 번째 인자가 `false`이면 escape하지 않습니다. 이 메서드는 assertion 전에 응답 내용을 PHP의 `strip_tags` 함수로 처리합니다.

```php
$response->assertDontSeeText($value, $escape = true);
```

<a name="assert-download"></a>
#### assertDownload

응답이 "다운로드" 응답인지 확인합니다. 일반적으로 이 의미는 라우트가 `Response::download`, `BinaryFileResponse`, `Storage::download` 등 파일을 다운로드하는 응답을 반환했다는 의미입니다.

```php
$response->assertDownload();
```

필요하다면, 다운로드할 파일 이름이 특정 값이었는지까지 검증할 수 있습니다.

```php
$response->assertDownload('image.jpg');
```

<a name="assert-exact-json"></a>
#### assertExactJson

응답이 지정한 JSON 데이터와 완전히 일치하는 경우에만 성공합니다.

```php
$response->assertExactJson(array $data);
```

<a name="assert-exact-json-structure"></a>
#### assertExactJsonStructure

응답이 지정한 JSON 구조와 정확히 일치하는지 확인합니다.

```php
$response->assertExactJsonStructure(array $data);
```

이 메서드는 [assertJsonStructure](#assert-json-structure)보다 더 엄격한 버전입니다. `assertJsonStructure`와 달리, 응답에 기대한 JSON 구조에 명시되지 않은 다른 키가 있을 경우에도 테스트가 실패하게 됩니다.

<a name="assert-forbidden"></a>
#### assertForbidden

응답이 403(Forbidden) HTTP 상태 코드인지 확인합니다.

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

응답에 특정 헤더와 값이 포함되어 있는지 확인합니다.

```php
$response->assertHeader($headerName, $value = null);
```

<a name="assert-header-missing"></a>
#### assertHeaderMissing

응답에 특정 헤더가 없는지 확인합니다.

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

응답에 지정된 JSON 데이터가 포함되어 있는지 확인합니다.

```php
$response->assertJson(array $data, $strict = false);
```

`assertJson` 메서드는 응답을 배열로 변환하고, 애플리케이션이 반환한 JSON 응답 내에 주어진 배열 데이터가 존재하는지 검증합니다. 즉, JSON 응답에 추가적인 속성들이 있어도, 지정한 데이터 조각(fragment)이 포함되어 있으면 테스트는 통과합니다.

<a name="assert-json-count"></a>
#### assertJsonCount

응답의 JSON 데이터에서 지정한 키에 해당하는 배열의 아이템 개수가 기대값과 일치하는지 확인합니다.

```php
$response->assertJsonCount($count, $key = null);
```

<a name="assert-json-fragment"></a>
#### assertJsonFragment

응답에 지정한 JSON 데이터가 어디든 포함되어 있는지 확인합니다.

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

응답의 JSON 데이터가 배열인지 확인합니다.

```php
$response->assertJsonIsArray();
```

<a name="assert-json-is-object"></a>
#### assertJsonIsObject

응답의 JSON 데이터가 객체(object)인지 확인합니다.

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

응답에 지정한 JSON 데이터가 정확히 일치하는 형태로 포함되어 있지 않은지 확인합니다.

```php
$response->assertJsonMissingExact(array $data);
```

<a name="assert-json-missing-validation-errors"></a>
#### assertJsonMissingValidationErrors

응답의 JSON 데이터에서 지정한 키에 대한 유효성 검증 오류가 없는지 확인합니다.

```php
$response->assertJsonMissingValidationErrors($keys);
```

> [!NOTE]
> 보다 범용적인 [assertValid](#assert-valid) 메서드를 사용하여, JSON으로 반환된 유효성 검증 오류가 없고, 세션 스토리지에 오류가 플래시(flash)되지 않았음을 검증할 수도 있습니다.

<a name="assert-json-path"></a>
#### assertJsonPath

응답의 지정된 경로(path)에 지정한 데이터가 포함되어 있는지 확인합니다.

```php
$response->assertJsonPath($path, $expectedValue);
```

예를 들어, 애플리케이션에서 다음과 같은 JSON 응답을 반환하는 경우:

```json
{
    "user": {
        "name": "Steve Schoger"
    }
}
```

다음과 같이 `user` 객체의 `name` 속성이 기대값과 일치하는지 검사할 수 있습니다.

```php
$response->assertJsonPath('user.name', 'Steve Schoger');
```

<a name="assert-json-missing-path"></a>
#### assertJsonMissingPath

응답에 지정한 경로(path)가 존재하지 않는지 확인합니다.

```php
$response->assertJsonMissingPath($path);
```

예를 들어, 애플리케이션이 다음과 같은 JSON 응답을 반환할 경우:

```json
{
    "user": {
        "name": "Steve Schoger"
    }
}
```

이 때 `user` 객체에 `email` 속성이 존재하지 않음을 다음과 같이 확인할 수 있습니다.

```php
$response->assertJsonMissingPath('user.email');
```

<a name="assert-json-structure"></a>
#### assertJsonStructure

응답이 지정한 구조의 JSON 데이터인지 확인합니다.

```php
$response->assertJsonStructure(array $structure);
```

예를 들어, 애플리케이션이 다음과 같은 JSON 응답을 반환할 경우:

```json
{
    "user": {
        "name": "Steve Schoger"
    }
}
```

아래와 같이 JSON 구조가 기대와 일치하는지 검사할 수 있습니다.

```php
$response->assertJsonStructure([
    'user' => [
        'name',
    ]
]);
```

때로는, 애플리케이션이 배열 형태로 여러 객체를 반환하는 경우도 있습니다.

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

이런 상황에서는, 배열 내 모든 객체의 구조를 검증하기 위해 `*` 문자를 사용할 수 있습니다.

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

특정 키에 대해, 응답의 JSON 데이터 내에 유효성 검증 오류가 존재하는지 확인합니다. 이 메서드는 유효성 검증 오류가 JSON 구조로 반환되고, 세션에 플래시(flash)되지 않는 응답을 검증할 때 사용합니다.

```php
$response->assertJsonValidationErrors(array $data, $responseKey = 'errors');
```

> [!NOTE]
> 보다 범용적인 [assertInvalid](#assert-invalid) 메서드를 사용하여, 응답에 JSON으로 반환된 유효성 검증 오류가 있거나 오류가 세션 스토리지에 플래시되었는지 검증할 수도 있습니다.

<a name="assert-json-validation-error-for"></a>
#### assertJsonValidationErrorFor

특정 키에 대해, 응답의 JSON 데이터 내에 유효성 검증 오류가 존재하는지 확인합니다.

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

응답의 `Location` 헤더에 지정된 URI 값이 포함되어 있는지 확인합니다.

```php
$response->assertLocation($uri);
```

<a name="assert-content"></a>
#### assertContent

지정한 문자열이 응답 본문과 정확히 일치하는지 확인합니다.

```php
$response->assertContent($value);
```

<a name="assert-no-content"></a>
#### assertNoContent

응답이 지정된 HTTP 상태 코드이며, 본문이 없는지 확인합니다.

```php
$response->assertNoContent($status = 204);
```

<a name="assert-streamed"></a>
#### assertStreamed

응답이 스트리밍 응답인지 확인합니다.

```
$response->assertStreamed();
```

<a name="assert-streamed-content"></a>
#### assertStreamedContent

지정한 문자열이 스트리밍 응답의 내용과 일치하는지 확인합니다.

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

응답에 지정한 평문(암호화되지 않은) 쿠키가 있는지 확인합니다.

```php
$response->assertPlainCookie($cookieName, $value = null);
```

<a name="assert-redirect"></a>
#### assertRedirect

응답이 지정한 URI로의 리디렉션인지 확인합니다.

```php
$response->assertRedirect($uri = null);
```

<a name="assert-redirect-back"></a>
#### assertRedirectBack

응답이 이전 페이지로 리디렉션하고 있는지 확인합니다.

```php
$response->assertRedirectBack();
```

<a name="assert-redirect-contains"></a>
#### assertRedirectContains

응답이 지정한 문자열을 포함하는 URI로 리디렉션하는지 확인합니다.

```php
$response->assertRedirectContains($string);
```

<a name="assert-redirect-to-route"></a>
#### assertRedirectToRoute

응답이 지정한 [이름 있는 라우트](/docs/12.x/routing#named-routes)로의 리디렉션인지 확인합니다.

```php
$response->assertRedirectToRoute($name, $parameters = []);
```

<a name="assert-redirect-to-signed-route"></a>
#### assertRedirectToSignedRoute

응답이 지정한 [서명된 라우트](/docs/12.x/urls#signed-urls)로의 리디렉션인지 확인합니다.

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

지정한 문자열이 응답에 포함되어 있는지 확인합니다. 만약 두 번째 인자를 `false`로 전달하지 않으면, 이 어설션은 자동으로 해당 문자열을 escape 처리합니다.

```php
$response->assertSee($value, $escape = true);
```

<a name="assert-see-in-order"></a>
#### assertSeeInOrder

지정한 여러 문자열이 지정한 순서대로 응답에 나타나는지 확인합니다. 두 번째 인자를 `false`로 전달하지 않으면, 이 어설션은 문자열들을 자동으로 escape 처리합니다.

```php
$response->assertSeeInOrder(array $values, $escape = true);
```

<a name="assert-see-text"></a>
#### assertSeeText

지정한 문자열이 응답 텍스트(텍스트 콘텐츠)에 포함되어 있는지 확인합니다. 두 번째 인자를 `false`로 전달하지 않으면, 이 어설션은 자동으로 해당 문자열을 escape 처리합니다. 또한, 응답 본문은 어설션이 수행되기 전에 `strip_tags` PHP 함수로 처리됩니다.

```php
$response->assertSeeText($value, $escape = true);
```

<a name="assert-see-text-in-order"></a>
#### assertSeeTextInOrder

지정한 여러 문자열이 지정한 순서대로 응답 텍스트에 포함되어 있는지 확인합니다. 두 번째 인자를 `false`로 전달하지 않으면, 이 어설션은 문자열들을 자동으로 escape 처리합니다. 그리고, 응답 본문은 어설션 전에 `strip_tags` PHP 함수로 처리됩니다.

```php
$response->assertSeeTextInOrder(array $values, $escape = true);
```

<a name="assert-server-error"></a>
#### assertServerError

응답이 서버 에러(500 이상 600 미만)의 HTTP 상태 코드를 가지고 있는지 확인합니다.

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

필요하다면, `assertSessionHas` 메서드의 두 번째 인수로 클로저를 전달할 수 있습니다. 클로저가 `true`를 반환하면 어설션이 통과합니다.

```php
$response->assertSessionHas($key, function (User $value) {
    return $value->name === 'Taylor Otwell';
});
```

<a name="assert-session-has-input"></a>
#### assertSessionHasInput

세션의 [플래시된 입력값 배열](/docs/12.x/responses#redirecting-with-flashed-session-data)에 지정한 값이 포함되어 있는지 확인합니다.

```php
$response->assertSessionHasInput($key, $value = null);
```

필요에 따라, `assertSessionHasInput` 메서드의 두 번째 인수로 클로저를 넘겨줄 수 있습니다. 클로저가 `true`를 반환하면 어설션이 통과합니다.

```php
use Illuminate\Support\Facades\Crypt;

$response->assertSessionHasInput($key, function (string $value) {
    return Crypt::decryptString($value) === 'secret';
});
```

<a name="assert-session-has-all"></a>
#### assertSessionHasAll

세션에 지정한 키/값 쌍의 배열이 모두 포함되어 있는지 확인합니다.

```php
$response->assertSessionHasAll(array $data);
```

예를 들어, 애플리케이션의 세션에 `name`과 `status` 키가 포함되어 있다면, 둘 다 존재하며 값도 지정 값과 일치하는지 아래와 같이 테스트할 수 있습니다.

```php
$response->assertSessionHasAll([
    'name' => 'Taylor Otwell',
    'status' => 'active',
]);
```

<a name="assert-session-has-errors"></a>
#### assertSessionHasErrors

세션에 지정한 `$keys`에 대한 오류가 포함되어 있는지 확인합니다. `$keys`가 연관 배열(associative array)이면, 필드(키)별로 특정 오류 메시지(값)가 포함되어 있는지도 검증합니다. 이 메서드는 유효성 검증 오류가 JSON 구조로 반환되는 것이 아니라 세션에 플래시(flash)되는 라우트를 테스트할 때 사용해야 합니다.

```php
$response->assertSessionHasErrors(
    array $keys = [], $format = null, $errorBag = 'default'
);
```

예를 들어, 세션에 `name`과 `email` 필드의 유효성 검증 오류 메시지가 플래시되었는지 검증하려면 다음과 같이 사용할 수 있습니다.

```php
$response->assertSessionHasErrors(['name', 'email']);
```

또는, 특정 필드에 대해 특정 오류 메시지가 있는지 아래와 같이 확인할 수 있습니다.

```php
$response->assertSessionHasErrors([
    'name' => 'The given name was invalid.'
]);
```

> [!NOTE]
> 보다 범용적인 [assertInvalid](#assert-invalid) 메서드를 사용하여, 응답에 JSON으로 반환된 유효성 검증 오류가 있거나 오류가 세션 스토리지에 플래시되었는지 검증할 수도 있습니다.

<a name="assert-session-has-errors-in"></a>
#### assertSessionHasErrorsIn

지정한 [에러백(error bag)](/docs/12.x/validation#named-error-bags)에서 특정 `$keys`에 대한 오류가 세션에 포함되어 있는지 확인합니다. `$keys`가 연관 배열인 경우, 에러백 안의 각 필드(키)에 대해 특정 오류 메시지(값)를 확인합니다.

```php
$response->assertSessionHasErrorsIn($errorBag, $keys = [], $format = null);
```

<a name="assert-session-has-no-errors"></a>

#### assertSessionHasNoErrors

세션에 유효성 검증 에러가 없음을 확인합니다.

```php
$response->assertSessionHasNoErrors();
```

<a name="assert-session-doesnt-have-errors"></a>
#### assertSessionDoesntHaveErrors

지정한 키에 대해 세션에 유효성 검증 에러가 없음을 확인합니다.

```php
$response->assertSessionDoesntHaveErrors($keys = [], $format = null, $errorBag = 'default');
```

> [!NOTE]
> 더 일반적인 [assertValid](#assert-valid) 메서드를 사용하면, 응답에서 유효성 검증 에러가 JSON으로 반환되지 않았고 **그리고** 어떤 에러 메시지도 세션 스토리지에 flash 되지 않았음을 모두 확인할 수 있습니다.

<a name="assert-session-missing"></a>
#### assertSessionMissing

세션에 지정한 키가 존재하지 않음을 확인합니다.

```php
$response->assertSessionMissing($key);
```

<a name="assert-status"></a>
#### assertStatus

응답이 지정된 HTTP 상태 코드를 가지고 있는지 확인합니다.

```php
$response->assertStatus($code);
```

<a name="assert-successful"></a>
#### assertSuccessful

응답이 성공적인(HTTP 상태 코드가 200 이상 300 미만) 상태 코드임을 확인합니다.

```php
$response->assertSuccessful();
```

<a name="assert-too-many-requests"></a>
#### assertTooManyRequests

응답이 너무 많은 요청(HTTP 상태 코드 429)을 나타내는지 확인합니다.

```php
$response->assertTooManyRequests();
```

<a name="assert-unauthorized"></a>
#### assertUnauthorized

응답이 인증되지 않음(HTTP 상태 코드 401)을 나타내는지 확인합니다.

```php
$response->assertUnauthorized();
```

<a name="assert-unprocessable"></a>
#### assertUnprocessable

응답이 처리할 수 없는 엔티티(HTTP 상태 코드 422)임을 확인합니다.

```php
$response->assertUnprocessable();
```

<a name="assert-unsupported-media-type"></a>
#### assertUnsupportedMediaType

응답이 지원되지 않는 미디어 타입(HTTP 상태 코드 415)을 나타내는지 확인합니다.

```php
$response->assertUnsupportedMediaType();
```

<a name="assert-valid"></a>
#### assertValid

지정한 키에 대해 유효성 검증 에러가 없음을 확인합니다. 이 메서드는 유효성 검증 에러가 JSON 구조로 반환되거나, 세션에 flash된 경우 모두에 대해 사용할 수 있습니다.

```php
// 유효성 검증 에러가 하나도 없는지 확인합니다...
$response->assertValid();

// 지정한 키에 유효성 검증 에러가 없는지 확인합니다...
$response->assertValid(['name', 'email']);
```

<a name="assert-invalid"></a>
#### assertInvalid

지정한 키에 대해 유효성 검증 에러가 있음을 확인합니다. 이 메서드는 유효성 검증 에러가 JSON 구조로 반환되거나, 세션에 flash된 경우 모두에 대해 사용할 수 있습니다.

```php
$response->assertInvalid(['name', 'email']);
```

특정 키에 특정 유효성 검증 에러 메시지가 있는지 확인할 수도 있습니다. 이때 전체 메시지 또는 메시지의 일부분만도 지정할 수 있습니다.

```php
$response->assertInvalid([
    'name' => 'The name field is required.',
    'email' => 'valid email address',
]);
```

지정한 필드들만 유효성 검증 에러가 있는지 확인하고 싶다면 `assertOnlyInvalid` 메서드를 사용할 수 있습니다.

```php
$response->assertOnlyInvalid(['name', 'email']);
```

<a name="assert-view-has"></a>
#### assertViewHas

응답 뷰에 지정한 데이터가 포함되어 있는지 확인합니다.

```php
$response->assertViewHas($key, $value = null);
```

`assertViewHas` 메서드의 두 번째 인자로 클로저를 전달하면, 특정 뷰 데이터에 대해 검증 로직을 직접 작성할 수 있습니다.

```php
$response->assertViewHas('user', function (User $user) {
    return $user->name === 'Taylor';
});
```

또한, 뷰 데이터는 응답에서 배열 변수처럼 접근할 수 있어, 더욱 편리하게 확인할 수 있습니다.

```php tab=Pest
expect($response['name'])->toBe('Taylor');
```

```php tab=PHPUnit
$this->assertEquals('Taylor', $response['name']);
```

<a name="assert-view-has-all"></a>
#### assertViewHasAll

응답 뷰가 지정한 데이터 목록을 모두 포함하고 있는지 확인합니다.

```php
$response->assertViewHasAll(array $data);
```

이 메서드는 뷰에 지정한 키들이 존재하는지 단순히 확인할 때 사용할 수 있습니다.

```php
$response->assertViewHasAll([
    'name',
    'email',
]);
```

또는, 뷰 데이터가 특정한 값을 가지고 있는지도 확인할 수 있습니다.

```php
$response->assertViewHasAll([
    'name' => 'Taylor Otwell',
    'email' => 'taylor@example.com,',
]);
```

<a name="assert-view-is"></a>
#### assertViewIs

지정한 뷰가 라우트에 의해 반환되었는지 확인합니다.

```php
$response->assertViewIs($value);
```

<a name="assert-view-missing"></a>
#### assertViewMissing

응답으로 반환된 뷰에서 지정한 데이터 키가 존재하지 않음을 확인합니다.

```php
$response->assertViewMissing($key);
```

<a name="authentication-assertions"></a>
### 인증 관련 Assertion

라라벨은 애플리케이션의 기능 테스트에서 사용할 수 있는 다양한 인증 관련 assertion도 제공합니다. 이 메서드들은 `get`과 `post`와 같이 `Illuminate\Testing\TestResponse` 인스턴스에서 호출하는 것이 아니며, 테스트 클래스 자체에서 호출한다는 점에 유의하세요.

<a name="assert-authenticated"></a>
#### assertAuthenticated

사용자가 인증되었는지 확인합니다.

```php
$this->assertAuthenticated($guard = null);
```

<a name="assert-guest"></a>
#### assertGuest

사용자가 인증되어 있지 않은지(비회원 상태인지) 확인합니다.

```php
$this->assertGuest($guard = null);
```

<a name="assert-authenticated-as"></a>
#### assertAuthenticatedAs

특정 사용자가 인증되어 있는지 확인합니다.

```php
$this->assertAuthenticatedAs($user, $guard = null);
```

<a name="validation-assertions"></a>
## 유효성 검증 Assertion

라라벨은 요청에서 전달된 데이터가 올바른지, 혹은 잘못되었는지를 확인할 수 있도록 두 가지 주요 유효성 검증 assertion을 제공합니다.

<a name="validation-assert-valid"></a>
#### assertValid

지정한 키에 대해 유효성 검증 에러가 없음을 확인합니다. 이 메서드는 유효성 검증 에러가 JSON 구조로 반환되거나, 세션에 flash된 경우 모두에 대해 사용할 수 있습니다.

```php
// 유효성 검증 에러가 하나도 없는지 확인합니다...
$response->assertValid();

// 지정한 키에 유효성 검증 에러가 없는지 확인합니다...
$response->assertValid(['name', 'email']);
```

<a name="validation-assert-invalid"></a>
#### assertInvalid

지정한 키에 대해 유효성 검증 에러가 있음을 확인합니다. 이 메서드는 유효성 검증 에러가 JSON 구조로 반환되거나, 세션에 flash된 경우 모두에 대해 사용할 수 있습니다.

```php
$response->assertInvalid(['name', 'email']);
```

특정 키에 특정 유효성 검증 에러 메시지가 있는지 확인할 수도 있습니다. 이때 전체 메시지 또는 메시지의 일부분만도 지정할 수 있습니다.

```php
$response->assertInvalid([
    'name' => 'The name field is required.',
    'email' => 'valid email address',
]);
```