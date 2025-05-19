# HTTP 테스트 (HTTP Tests)

- [소개](#introduction)
- [요청 보내기](#making-requests)
    - [요청 헤더 커스터마이징](#customizing-request-headers)
    - [쿠키](#cookies)
    - [세션 / 인증](#session-and-authentication)
    - [응답 디버깅](#debugging-responses)
    - [예외 처리](#exception-handling)
- [JSON API 테스트하기](#testing-json-apis)
    - [유연한(Fluent) JSON 테스트](#fluent-json-testing)
- [파일 업로드 테스트하기](#testing-file-uploads)
- [뷰 테스트하기](#testing-views)
    - [Blade 및 컴포넌트 렌더링](#rendering-blade-and-components)
- [사용 가능한 assertion](#available-assertions)
    - [응답 assertion](#response-assertions)
    - [인증 assertion](#authentication-assertions)
    - [유효성 검증 assertion](#validation-assertions)

<a name="introduction"></a>
## 소개

라라벨은 애플리케이션에 HTTP 요청을 보내고, 그 응답을 확인할 수 있는 매우 직관적인 API를 제공합니다. 예를 들어 아래에 정의된 기능 테스트(feature test)를 살펴보십시오:

```php
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

위 예시에서 `get` 메서드는 지정한 경로에 `GET` 요청을 보내며, `assertStatus` 메서드는 반환된 응답이 지정한 HTTP 상태 코드를 반환하는지 확인합니다. 이러한 간단한 assertion을 비롯해 라라벨은 응답 헤더, 컨텐츠, JSON 구조 등 다양한 항목을 검사하는 assertion 메서드들을 제공합니다.

<a name="making-requests"></a>
## 요청 보내기

테스트 내에서 애플리케이션에 요청을 보내려면, `get`, `post`, `put`, `patch`, `delete` 등의 메서드를 사용할 수 있습니다. 이 메서드들은 실제로 "진짜" HTTP 요청을 애플리케이션에 보내지는 않습니다. 대신, 네트워크 요청이 내부적으로 시뮬레이션됩니다.

테스트 요청 메서드는 `Illuminate\Http\Response` 인스턴스 대신, [다양한 유용한 assertion](#available-assertions)을 제공하는 `Illuminate\Testing\TestResponse` 인스턴스를 반환합니다. 이를 통해 애플리케이션의 응답을 검사할 수 있습니다:

```
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

일반적으로 각 테스트는 한 번만 애플리케이션에 요청을 보내도록 작성하는 것이 좋습니다. 하나의 테스트 메서드 안에서 여러 번 요청을 보내면 예기치 않은 동작이 발생할 수 있습니다.

> [!NOTE]
> 테스트를 실행할 때, CSRF 미들웨어는 자동으로 비활성화됩니다.

<a name="customizing-request-headers"></a>
### 요청 헤더 커스터마이징

요청을 애플리케이션에 보내기 전에 `withHeaders` 메서드를 사용하여 요청 헤더를 자유롭게 커스터마이즈할 수 있습니다. 이 메서드를 이용하면 원하는 커스텀 헤더를 요청에 추가할 수 있습니다:

```
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

요청을 보내기 전에 `withCookie` 또는 `withCookies` 메서드를 사용해 쿠키 값을 설정할 수 있습니다. `withCookie`는 쿠키 이름과 값 두 개의 인수를 받고, `withCookies`는 이름/값 쌍의 배열을 받습니다:

```
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
    }
}
```

<a name="session-and-authentication"></a>
### 세션 / 인증

라라벨은 HTTP 테스트 중 세션과 상호작용할 수 있는 여러 가지 헬퍼를 제공합니다. 먼저, `withSession` 메서드를 사용하면 세션 데이터를 배열 형태로 미리 지정할 수 있습니다. 이는 애플리케이션에 요청을 보내기 전에 특정 데이터로 세션을 채우고 싶을 때 유용합니다:

```
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_interacting_with_the_session(): void
    {
        $response = $this->withSession(['banned' => false])->get('/');
    }
}
```

라라벨의 세션은 일반적으로 현재 인증된 사용자의 상태를 유지하는 데 사용됩니다. 이를 위해 `actingAs` 헬퍼 메서드를 사용하면 지정한 사용자를 쉽게 현재 사용자로 인증할 수 있습니다. 예를 들어, [모델 팩토리](/docs/10.x/eloquent-factories)를 사용해 사용자를 생성하고 인증할 수 있습니다:

```
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
    }
}
```

또한, `actingAs` 메서드의 두 번째 인수로 가드(guard) 이름을 전달하여 어떤 가드로 인증할 것인지 지정할 수도 있습니다. 테스트가 실행되는 동안 지정한 가드가 기본 가드로 설정됩니다:

```
$this->actingAs($user, 'web')
```

<a name="debugging-responses"></a>
### 응답 디버깅

애플리케이션에 테스트 요청을 보내고 나면, `dump`, `dumpHeaders`, `dumpSession` 메서드를 써서 응답 내용을 자세히 확인하고 디버깅할 수 있습니다:

```
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

또한, 실행 도중 바로 응답 정보를 출력하고 테스트 실행을 중단하려면 `dd`, `ddHeaders`, `ddSession` 메서드를 사용할 수 있습니다:

```
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

애플리케이션이 특정 예외를 던지는지 테스트하고 싶을 때가 있습니다. 이때 라라벨의 예외 핸들러가 예외를 잡아 HTTP 응답으로 변환하지 않도록 하려면, 요청을 보내기 전에 `withoutExceptionHandling` 메서드를 호출하면 됩니다:

```
$response = $this->withoutExceptionHandling()->get('/');
```

또한, 애플리케이션이나 사용하는 라이브러리가 PHP에서 더 이상 권장되지 않는(deprecated) 기능을 사용하는지 검사하고 싶을 때는, 요청 전에 `withoutDeprecationHandling` 메서드를 사용할 수 있습니다. deprecation handling이 비활성화되면, deprecated 경고가 예외로 변환되어 테스트가 실패하게 됩니다:

```
$response = $this->withoutDeprecationHandling()->get('/');
```

`assertThrows` 메서드는 지정한 클로저 안에서 특정 타입의 예외가 발생하는지 확인할 수 있게 해줍니다:

```php
$this->assertThrows(
    fn () => (new ProcessOrder)->execute(),
    OrderInvalid::class
);
```

<a name="testing-json-apis"></a>
## JSON API 테스트하기

라라벨은 JSON API와 그 응답을 테스트할 수 있는 다양한 헬퍼도 제공합니다. `json`, `getJson`, `postJson`, `putJson`, `patchJson`, `deleteJson`, `optionsJson` 등의 메서드를 통해 다양한 HTTP 메서드로 JSON 요청을 쉽게 보낼 수 있습니다. 데이터와 헤더도 쉽게 전달할 수 있습니다. 예시로, `/api/user`로 `POST` 요청을 보내고 예상하는 JSON 데이터가 반환되는지 테스트하는 코드를 살펴보겠습니다:

```
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

또한, JSON 응답 데이터는 배열과 동일하게 변수처럼 접근할 수 있으므로, 반환된 JSON 응답의 특정 값들을 편리하게 검사할 수 있습니다:

```
$this->assertTrue($response['created']);
```

> [!NOTE]
> `assertJson` 메서드는 응답을 배열로 변환한 뒤 `PHPUnit::assertArraySubset` 을 이용하여, 지정한 배열이 응답 JSON에 존재하는지만 검증합니다. 즉, 응답 JSON에 다른 속성들이 있어도 우리 테스트에서 명시한 부분이 포함되어 있으면 테스트는 통과합니다.

<a name="verifying-exact-match"></a>
#### JSON이 정확히 일치하는지 검증하기

앞서 설명한 것처럼, `assertJson` 메서드는 JSON의 일부(fragment)가 응답에 포함돼 있는지 확인합니다. 반면, 애플리케이션이 반환하는 JSON이 **지정한 배열과 정확히 일치**하는지 검증하려면 `assertExactJson` 메서드를 사용해야 합니다:

```
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
#### JSON 경로에 대한 assertion

JSON 응답이 지정한 경로에 특정 데이터를 포함하는지 확인하려면 `assertJsonPath` 메서드를 사용할 수 있습니다:

```
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

또한, `assertJsonPath` 메서드는 클로저도 인수로 받을 수 있어서, 그 안에서 assertion이 동적으로 통과해야 할 조건을 지정할 수 있습니다:

```
$response->assertJsonPath('team.owner.name', fn (string $name) => strlen($name) >= 3);
```

<a name="fluent-json-testing"></a>
### 유연한(Fluent) JSON 테스트

라라벨은 JSON 응답을 보다 유연하게 테스트할 수 있는 아름다운 방식도 제공합니다. 시작하려면, `assertJson` 메서드에 클로저를 전달하세요. 이 클로저는 `Illuminate\Testing\Fluent\AssertableJson` 인스턴스를 받아, 반환된 JSON에 대한 assertion을 작성할 수 있게 해줍니다. 예를 들어, `where` 메서드는 특정 JSON 속성에 대한 assertion, `missing` 메서드는 특정 속성이 없는지 assertion을 작성할 때 사용할 수 있습니다:

```
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

#### `etc` 메서드의 동작 이해하기

위 예시에서 assertion 체인의 마지막에 `etc` 메서드를 호출한 것을 볼 수 있습니다. 이 메서드는 JSON 오브젝트에 다른 속성들이 추가로 존재할 수 있음을 라라벨에 알려주는 역할을 합니다. 만약 `etc` 메서드를 사용하지 않으면, assertion을 작성한 속성 이외의 다른 속성이 JSON 오브젝트에 존재할 경우 테스트가 실패하게 됩니다.

이 방식의 의도는, 중요한 정보(특히 민감한 정보)가 실수로 JSON 응답에 노출되는 일을 막기 위함입니다. assertion을 명시적으로 작성하거나, 또는 `etc` 메서드를 사용해 추가 속성의 존재를 명시적으로 허용해야 합니다.

단, assertion 체인에서 `etc`를 포함하지 않는다고 해서 중첩 배열 내부에 추가 속성이 추가되지 않았다는 뜻은 아닙니다. `etc` 메서드는 호출된 깊이의 nesting 레벨에만 추가 속성의 존재 여부를 확인합니다.

<a name="asserting-json-attribute-presence-and-absence"></a>
#### 속성 존재/부재 검사

특정 JSON 속성이 존재하는지 혹은 없는지 assertion을 작성하고 싶다면, `has`와 `missing` 메서드를 사용할 수 있습니다:

```
$response->assertJson(fn (AssertableJson $json) =>
    $json->has('data')
         ->missing('message')
);
```

또한, `hasAll`과 `missingAll` 메서드를 사용하면 여러 속성의 존재 또는 부재를 한 번에 검사할 수 있습니다:

```
$response->assertJson(fn (AssertableJson $json) =>
    $json->hasAll(['status', 'data'])
         ->missingAll(['message', 'code'])
);
```

주어진 속성 리스트 중 하나 이상이 존재하는지 확인하려면 `hasAny` 메서드를 사용할 수 있습니다:

```
$response->assertJson(fn (AssertableJson $json) =>
    $json->has('status')
         ->hasAny('data', 'message', 'code')
);
```

<a name="asserting-against-json-collections"></a>
#### JSON 컬렉션에 대한 assertion

라우트가 여러 항목(예: 여러 사용자)을 포함한 JSON 응답을 반환하는 경우가 종종 있습니다:

```
Route::get('/users', function () {
    return User::all();
});
```

이처럼 여러 항목을 포함하는 JSON 응답에서는, 유연한 JSON 객체의 `has` 메서드를 이용해 응답에 사용자가 몇 명 포함됐는지 assertion을 작성할 수 있습니다. 예를 들어, JSON 응답에 3명의 사용자가 있고, 이 중 첫 번째 사용자의 상태를 `first` 메서드로 자세히 검사하는 코드를 볼 수 있습니다. `first` 메서드는 클로저를 받아, 그 안에서 첫 번째 JSON 객체에 대한 assertion을 추가할 수 있습니다:

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
#### JSON 컬렉션 assertion 범위 지정하기

애플리케이션의 라우트가 네임드 키로 할당된 JSON 컬렉션을 반환하는 경우도 있습니다:

```
Route::get('/users', function () {
    return [
        'meta' => [...],
        'users' => User::all(),
    ];
})
```

이런 경우, `has` 메서드를 사용해 users 컬렉션의 항목 수를 assertion할 수 있을 뿐 아니라, assertion 체인의 범위를 지정할 수도 있습니다:

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

하지만, `users` 컬렉션에 대해 두 번의 `has` 호출을 하는 대신, 단 한 번의 호출에서 세 번째 인수로 클로저를 전달해도 됩니다. 이때 클로저는 자동으로 컬렉션의 첫 번째 항목에 대해 실행되고, 그 범위로 assertion이 지정됩니다:

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

응답 JSON의 속성 값이 특정 타입인지 assertion만 하고 싶은 경우도 있을 수 있습니다. 이를 위해 `Illuminate\Testing\Fluent\AssertableJson` 클래스에서 `whereType`과 `whereAllType` 메서드를 제공합니다:

```
$response->assertJson(fn (AssertableJson $json) =>
    $json->whereType('id', 'integer')
         ->whereAllType([
            'users.0.name' => 'string',
            'meta' => 'array'
        ])
);
```

`|` 문자나, 타입의 배열을 두 번째 인수로 넘겨 여러 타입 중 하나라도 만족하면 assertion을 통과하도록 할 수 있습니다:

```
$response->assertJson(fn (AssertableJson $json) =>
    $json->whereType('name', 'string|null')
         ->whereType('id', ['string', 'integer'])
);
```

`whereType` 및 `whereAllType` 메서드가 인식하는 타입은 다음과 같습니다: `string`, `integer`, `double`, `boolean`, `array`, `null`.

<a name="testing-file-uploads"></a>
## 파일 업로드 테스트하기

`Illuminate\Http\UploadedFile` 클래스는 더미 파일이나 이미지를 테스트용으로 생성할 수 있는 `fake` 메서드를 제공합니다. 여기에 `Storage` 파사드의 `fake` 메서드를 조합하면 파일 업로드 테스트가 매우 간단해집니다. 예를 들어, 두 메서드를 활용하면 아바타 업로드 폼을 쉽게 테스트할 수 있습니다:

```
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

특정 파일이 존재하지 않아야 하는지 assertion을 작성할 경우, `Storage` 파사드에서 제공하는 `assertMissing` 메서드를 사용할 수 있습니다:

```
Storage::fake('avatars');

// ...

Storage::disk('avatars')->assertMissing('missing.jpg');
```

<a name="fake-file-customization"></a>

#### 가짜 파일 커스터마이즈

`UploadedFile` 클래스에서 제공하는 `fake` 메서드를 사용해 파일을 생성할 때, 이미지의 너비와 높이, 그리고 크기(킬로바이트 단위)를 지정하여 애플리케이션의 유효성 검증 규칙을 더 세밀하게 테스트할 수 있습니다.

```
UploadedFile::fake()->image('avatar.jpg', $width, $height)->size(100);
```

이미지 외에도, `create` 메서드를 사용해 원하는 유형의 파일을 생성할 수 있습니다.

```
UploadedFile::fake()->create('document.pdf', $sizeInKilobytes);
```

필요하다면, 해당 파일에 반환될 MIME 타입을 명시적으로 지정하기 위해 `$mimeType` 인수를 메서드에 전달할 수 있습니다.

```
UploadedFile::fake()->create(
    'document.pdf', $sizeInKilobytes, 'application/pdf'
);
```

<a name="testing-views"></a>
## 뷰 테스트하기

라라벨은 실제 HTTP 요청을 보내지 않고도 뷰를 렌더링하여 테스트할 수 있게 해줍니다. 이를 위해 테스트 코드 안에서 `view` 메서드를 호출하면 됩니다. `view` 메서드는 뷰 이름과 선택적으로 데이터를 담은 배열을 인수로 받으며, 반환값으로 `Illuminate\Testing\TestView` 클래스의 인스턴스를 제공합니다. 이 객체는 뷰 내용에 대해 여러 assert 메서드를 편리하게 사용할 수 있게 해줍니다.

```
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

필요하다면, `TestView` 인스턴스를 문자열로 캐스팅(cast)해서 렌더링된 뷰의 실제 내용을 가져올 수도 있습니다.

```
$contents = (string) $this->view('welcome');
```

<a name="sharing-errors"></a>
#### 에러 공유하기

일부 뷰는 [라라벨에서 제공하는 전역 에러 백(error bag)](/docs/10.x/validation#quick-displaying-the-validation-errors)에 공유된 에러에 의존할 수 있습니다. 에러 메시지로 에러 백을 채우려면 `withViewErrors` 메서드를 사용할 수 있습니다.

```
$view = $this->withViewErrors([
    'name' => ['Please provide a valid name.']
])->view('form');

$view->assertSee('Please provide a valid name.');
```

<a name="rendering-blade-and-components"></a>
### Blade와 컴포넌트 렌더링

필요하다면, `blade` 메서드를 사용해 [Blade](/docs/10.x/blade)의 원시 문자열을 평가(evaluate)하고 렌더링할 수 있습니다. `view` 메서드와 마찬가지로, `blade` 메서드는 `Illuminate\Testing\TestView` 인스턴스를 반환합니다.

```
$view = $this->blade(
    '<x-component :name="$name" />',
    ['name' => 'Taylor']
);

$view->assertSee('Taylor');
```

[Blade 컴포넌트](/docs/10.x/blade#components)를 평가하고 렌더링하려면 `component` 메서드를 사용할 수 있습니다. 이 메서드는 `Illuminate\Testing\TestComponent` 인스턴스를 반환합니다.

```
$view = $this->component(Profile::class, ['name' => 'Taylor']);

$view->assertSee('Taylor');
```

<a name="available-assertions"></a>
## 사용 가능한 Assertion 목록

<a name="response-assertions"></a>
### 응답 어서션(Response Assertions)

라라벨의 `Illuminate\Testing\TestResponse` 클래스는 애플리케이션 테스트 중에 활용할 수 있는 다양한 커스텀 어서션 메서드를 제공합니다. 이 어서션들은 테스트에서 반환되는 `json`, `get`, `post`, `put`, `delete` 등의 응답(Response) 객체에서 사용할 수 있습니다.


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

응답이 HTTP 상태 코드 400(Bad Request)임을 어서트합니다.

```
$response->assertBadRequest();
```

<a name="assert-accepted"></a>
#### assertAccepted

응답이 HTTP 상태 코드 202(Accepted)임을 어서트합니다.

```
$response->assertAccepted();
```

<a name="assert-conflict"></a>
#### assertConflict

응답이 HTTP 상태 코드 409(Conflict)임을 어서트합니다.

```
$response->assertConflict();
```

<a name="assert-cookie"></a>
#### assertCookie

응답에 지정한 쿠키가 포함되어 있는지 어서트합니다.

```
$response->assertCookie($cookieName, $value = null);
```

<a name="assert-cookie-expired"></a>
#### assertCookieExpired

응답에 지정한 쿠키가 포함되어 있고, 해당 쿠키가 만료되었는지 어서트합니다.

```
$response->assertCookieExpired($cookieName);
```

<a name="assert-cookie-not-expired"></a>
#### assertCookieNotExpired

응답에 지정한 쿠키가 포함되어 있고, 아직 만료되지 않았는지 어서트합니다.

```
$response->assertCookieNotExpired($cookieName);
```

<a name="assert-cookie-missing"></a>
#### assertCookieMissing

응답에 지정한 쿠키가 존재하지 않는지 어서트합니다.

```
$response->assertCookieMissing($cookieName);
```

<a name="assert-created"></a>
#### assertCreated

응답이 HTTP 상태 코드 201(Created)임을 어서트합니다.

```
$response->assertCreated();
```

<a name="assert-dont-see"></a>
#### assertDontSee

응답에 지정한 문자열이 포함되지 않았는지를 어서트합니다. 두 번째 인수로 `false`를 전달하지 않는 한, 전달한 문자열은 자동으로 이스케이프됩니다.

```
$response->assertDontSee($value, $escaped = true);
```

<a name="assert-dont-see-text"></a>
#### assertDontSeeText

응답 텍스트에 지정한 문자열이 포함되지 않았는지를 어서트합니다. 두 번째 인수로 `false`를 전달하지 않는 한, 전달한 문자열은 자동으로 이스케이프됩니다. 이 메서드는 어서트 실행 전 응답 내용을 `strip_tags` PHP 함수로 처리합니다.

```
$response->assertDontSeeText($value, $escaped = true);
```

<a name="assert-download"></a>
#### assertDownload

응답이 "다운로드"임을 어서트합니다. 일반적으로 이 어서션은 라우트에서 `Response::download`, `BinaryFileResponse`, 또는 `Storage::download` 응답이 반환된 경우에 사용됩니다.

```
$response->assertDownload();
```

원한다면, 다운로드되는 파일의 파일명이 특정 값인지도 함께 어서트할 수 있습니다.

```
$response->assertDownload('image.jpg');
```

<a name="assert-exact-json"></a>
#### assertExactJson

응답이 전달한 JSON 데이터와 정확히 일치하는지 어서트합니다.

```
$response->assertExactJson(array $data);
```

<a name="assert-forbidden"></a>
#### assertForbidden

응답이 HTTP 상태 코드 403(Forbidden)임을 어서트합니다.

```
$response->assertForbidden();
```

<a name="assert-found"></a>
#### assertFound

응답이 HTTP 상태 코드 302(Found)임을 어서트합니다.

```
$response->assertFound();
```

<a name="assert-gone"></a>
#### assertGone

응답이 HTTP 상태 코드 410(Gone)임을 어서트합니다.

```
$response->assertGone();
```

<a name="assert-header"></a>
#### assertHeader

응답에 지정한 헤더와 값이 존재하는지 어서트합니다.

```
$response->assertHeader($headerName, $value = null);
```

<a name="assert-header-missing"></a>
#### assertHeaderMissing

응답에 지정한 헤더가 존재하지 않는지 어서트합니다.

```
$response->assertHeaderMissing($headerName);
```

<a name="assert-internal-server-error"></a>
#### assertInternalServerError

응답이 "내부 서버 오류"(HTTP 상태 코드 500)임을 어서트합니다.

```
$response->assertInternalServerError();
```

<a name="assert-json"></a>
#### assertJson

응답에 지정한 JSON 데이터가 포함되어 있는지 어서트합니다.

```
$response->assertJson(array $data, $strict = false);
```

`assertJson` 메서드는 응답을 배열로 변환한 뒤, `PHPUnit::assertArraySubset`을 이용해 지정한 배열이 애플리케이션이 반환한 JSON 응답 내에 존재하는지 확인합니다. 즉, 응답 JSON에 다른 속성이 더 있어도 전달한 일부 데이터(프래그먼트)가 포함되어 있다면 어서션이 통과합니다.

<a name="assert-json-count"></a>
#### assertJsonCount

응답 JSON에서 지정한 키에 해당하는 배열이 기대한 개수만큼의 아이템을 가지고 있는지 어서트합니다.

```
$response->assertJsonCount($count, $key = null);
```

<a name="assert-json-fragment"></a>
#### assertJsonFragment

응답 데이터에 지정한 JSON 데이터(조각, fragment)가 어느 곳에든 포함되어 있는지 어서트합니다.

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

응답 JSON이 배열인지 어서트합니다.

```
$response->assertJsonIsArray();
```

<a name="assert-json-is-object"></a>
#### assertJsonIsObject

응답 JSON이 객체인지 어서트합니다.

```
$response->assertJsonIsObject();
```

<a name="assert-json-missing"></a>
#### assertJsonMissing

응답 데이터에 지정한 JSON 데이터가 포함되어 있지 않은지 어서트합니다.

```
$response->assertJsonMissing(array $data);
```

<a name="assert-json-missing-exact"></a>
#### assertJsonMissingExact

응답 데이터에 정확히 일치하는 JSON 데이터가 없는지 어서트합니다.

```
$response->assertJsonMissingExact(array $data);
```

<a name="assert-json-missing-validation-errors"></a>
#### assertJsonMissingValidationErrors

지정한 키의 JSON 유효성 검증 에러가 응답에 없는지 어서트합니다.

```
$response->assertJsonMissingValidationErrors($keys);
```

> [!NOTE]
> 더 범용적인 [assertValid](#assert-valid) 메서드를 사용하면, 응답에 유효성 검증 에러가 JSON으로 반환되지 않았음을 **그리고** 세션 저장소로 플래시된 에러가 없음을 확인할 수 있습니다.

<a name="assert-json-path"></a>
#### assertJsonPath

응답 데이터에서 주어진 경로(path)에 지정한 값이 존재하는지 어서트합니다.

```
$response->assertJsonPath($path, $expectedValue);
```

예를 들어, 다음과 같은 JSON 응답을 애플리케이션이 반환했다면:

```json
{
    "user": {
        "name": "Steve Schoger"
    }
}
```

아래와 같이 `user` 객체의 `name` 속성이 기대한 값과 일치하는지 어서트할 수 있습니다.

```
$response->assertJsonPath('user.name', 'Steve Schoger');
```

<a name="assert-json-missing-path"></a>
#### assertJsonMissingPath

응답 데이터에 주어진 경로(path)가 없는지 어서트합니다.

```
$response->assertJsonMissingPath($path);
```

예를 들어, 다음과 같은 JSON 응답을 애플리케이션이 반환했다면:

```json
{
    "user": {
        "name": "Steve Schoger"
    }
}
```

아래와 같이 `user` 객체에 `email` 속성이 없는지를 어서트할 수 있습니다.

```
$response->assertJsonMissingPath('user.email');
```

<a name="assert-json-structure"></a>
#### assertJsonStructure

응답 데이터가 지정한 JSON 구조를 가지고 있는지 어서트합니다.

```
$response->assertJsonStructure(array $structure);
```

예를 들어, 애플리케이션이 다음과 같은 JSON 데이터를 반환했다면:

```json
{
    "user": {
        "name": "Steve Schoger"
    }
}
```

아래와 같이 JSON 구조가 기대에 부합하는지 어서트할 수 있습니다.

```
$response->assertJsonStructure([
    'user' => [
        'name',
    ]
]);
```

때때로, 애플리케이션이 반환하는 JSON 응답에는 객체 배열이 있을 수 있습니다.

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

이럴 때는, 배열 내 모든 객체의 구조를 한 번에 어서트 하기 위해 `*` 문자를 사용할 수 있습니다.

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

지정한 키에 대한 JSON 유효성 검증 에러가 응답에 존재하는지 어서트합니다. 이 메서드는 유효성 검증 에러가 세션이 아니라 JSON 구조로 반환되는 응답을 어서트할 때 사용해야 합니다.

```
$response->assertJsonValidationErrors(array $data, $responseKey = 'errors');
```

> [!NOTE]
> 더 범용적인 [assertInvalid](#assert-invalid) 메서드를 사용하면, 유효성 검증 에러가 JSON으로 반환되었거나, 세션에 플래시된 경우 모두 어서트할 수 있습니다.

<a name="assert-json-validation-error-for"></a>
#### assertJsonValidationErrorFor

지정한 키에 대한 JSON 유효성 검증 에러가 응답에 존재하는지 어서트합니다.

```
$response->assertJsonValidationErrorFor(string $key, $responseKey = 'errors');
```

<a name="assert-method-not-allowed"></a>

#### assertMethodNotAllowed

응답이 메서드가 허용되지 않음(405) HTTP 상태 코드를 가지고 있는지 확인합니다.

```
$response->assertMethodNotAllowed();
```

<a name="assert-moved-permanently"></a>
#### assertMovedPermanently

응답이 영구적으로 이동됨(301) HTTP 상태 코드를 가지고 있는지 확인합니다.

```
$response->assertMovedPermanently();
```

<a name="assert-location"></a>
#### assertLocation

응답의 `Location` 헤더에 지정한 URI 값이 있는지 확인합니다.

```
$response->assertLocation($uri);

```
<a name="assert-content"></a>
#### assertContent

응답 내용이 지정한 문자열과 일치하는지 확인합니다.

```
$response->assertContent($value);
```

<a name="assert-no-content"></a>
#### assertNoContent

응답이 지정한 HTTP 상태 코드와 함께 내용이 없는지 확인합니다.

```
$response->assertNoContent($status = 204);
```

<a name="assert-streamed-content"></a>
#### assertStreamedContent

스트림 형식의 응답 내용이 지정한 문자열과 일치하는지 확인합니다.

```
$response->assertStreamedContent($value);
```

<a name="assert-not-found"></a>
#### assertNotFound

응답이 찾을 수 없음(404) HTTP 상태 코드를 가지고 있는지 확인합니다.

```
$response->assertNotFound();
```

<a name="assert-ok"></a>
#### assertOk

응답이 200 HTTP 상태 코드를 가지고 있는지 확인합니다.

```
$response->assertOk();
```

<a name="assert-payment-required"></a>
#### assertPaymentRequired

응답이 결제 필요(402) HTTP 상태 코드를 가지고 있는지 확인합니다.

```
$response->assertPaymentRequired();
```

<a name="assert-plain-cookie"></a>
#### assertPlainCookie

응답에 지정한 평문 쿠키가 존재하는지 확인합니다.

```
$response->assertPlainCookie($cookieName, $value = null);
```

<a name="assert-redirect"></a>
#### assertRedirect

응답이 지정한 URI로 리다이렉트되는지 확인합니다.

```
$response->assertRedirect($uri = null);
```

<a name="assert-redirect-contains"></a>
#### assertRedirectContains

응답이 지정한 문자열을 포함하는 URI로 리다이렉트되는지 확인합니다.

```
$response->assertRedirectContains($string);
```

<a name="assert-redirect-to-route"></a>
#### assertRedirectToRoute

응답이 지정한 [이름 있는 라우트](/docs/10.x/routing#named-routes)로 리다이렉트되는지 확인합니다.

```
$response->assertRedirectToRoute($name, $parameters = []);
```

<a name="assert-redirect-to-signed-route"></a>
#### assertRedirectToSignedRoute

응답이 지정한 [서명된 라우트](/docs/10.x/urls#signed-urls)로 리다이렉트되는지 확인합니다.

```
$response->assertRedirectToSignedRoute($name = null, $parameters = []);
```

<a name="assert-request-timeout"></a>
#### assertRequestTimeout

응답이 요청 시간 초과(408) HTTP 상태 코드를 가지고 있는지 확인합니다.

```
$response->assertRequestTimeout();
```

<a name="assert-see"></a>
#### assertSee

응답 내에 지정한 문자열이 포함되어 있는지 확인합니다. 이 검증은 두 번째 인수로 `false`를 전달하지 않는 한, 지정한 문자열을 자동으로 이스케이프 처리합니다.

```
$response->assertSee($value, $escaped = true);
```

<a name="assert-see-in-order"></a>
#### assertSeeInOrder

응답 내에 주어진 문자열들이 지정한 순서대로 포함되어 있는지 확인합니다. 이 검증은 두 번째 인수로 `false`를 전달하지 않는 한, 지정한 문자열들을 자동으로 이스케이프 처리합니다.

```
$response->assertSeeInOrder(array $values, $escaped = true);
```

<a name="assert-see-text"></a>
#### assertSeeText

응답의 텍스트 내에 지정한 문자열이 포함되어 있는지 확인합니다. 이 검증은 두 번째 인수로 `false`를 전달하지 않는 한, 지정한 문자열을 자동으로 이스케이프 처리합니다. 응답 내용은 검증 전에 PHP의 `strip_tags` 함수로 전달되어 HTML 태그가 제거됩니다.

```
$response->assertSeeText($value, $escaped = true);
```

<a name="assert-see-text-in-order"></a>
#### assertSeeTextInOrder

응답의 텍스트 내에 주어진 문자열들이 지정한 순서대로 포함되어 있는지 확인합니다. 이 검증은 두 번째 인수로 `false`를 전달하지 않는 한, 지정한 문자열들을 자동으로 이스케이프 처리합니다. 응답 내용은 검증 전에 PHP의 `strip_tags` 함수로 전달되어 HTML 태그가 제거됩니다.

```
$response->assertSeeTextInOrder(array $values, $escaped = true);
```

<a name="assert-server-error"></a>
#### assertServerError

응답이 서버 오류(500번대) HTTP 상태 코드를 가지고 있는지 확인합니다(500 이상, 600 미만).

```
$response->assertServerError();
```

<a name="assert-server-unavailable"></a>
#### assertServiceUnavailable

응답이 "서비스를 이용할 수 없음"(503) HTTP 상태 코드를 가지고 있는지 확인합니다.

```
$response->assertServiceUnavailable();
```

<a name="assert-session-has"></a>
#### assertSessionHas

세션이 지정한 데이터 항목을 포함하는지 확인합니다.

```
$response->assertSessionHas($key, $value = null);
```

필요하다면, `assertSessionHas` 메서드의 두 번째 인수에 클로저를 전달할 수 있습니다. 클로저가 `true`를 반환하면 검증에 성공합니다.

```
$response->assertSessionHas($key, function (User $value) {
    return $value->name === 'Taylor Otwell';
});
```

<a name="assert-session-has-input"></a>
#### assertSessionHasInput

세션의 [플래시 입력 배열](/docs/10.x/responses#redirecting-with-flashed-session-data)에 지정된 값이 있는지 확인합니다.

```
$response->assertSessionHasInput($key, $value = null);
```

필요하다면, `assertSessionHasInput` 메서드의 두 번째 인수에 클로저를 전달할 수 있습니다. 클로저가 `true`를 반환하면 검증에 성공합니다.

```
use Illuminate\Support\Facades\Crypt;

$response->assertSessionHasInput($key, function (string $value) {
    return Crypt::decryptString($value) === 'secret';
});
```

<a name="assert-session-has-all"></a>
#### assertSessionHasAll

세션에 지정한 키/값 쌍의 배열이 모두 존재하는지 확인합니다.

```
$response->assertSessionHasAll(array $data);
```

예를 들어, 애플리케이션의 세션에 `name`과 `status` 키가 포함되어 있다면, 두 값이 모두 지정한 값과 일치하는지도 다음과 같이 확인할 수 있습니다.

```
$response->assertSessionHasAll([
    'name' => 'Taylor Otwell',
    'status' => 'active',
]);
```

<a name="assert-session-has-errors"></a>
#### assertSessionHasErrors

세션에 주어진 `$keys`에 대한 에러가 포함되어 있는지 확인합니다. `$keys`가 연관 배열인 경우에는, 각 필드(키)에 대해 세션에 특정 에러 메시지(값)가 있는지도 확인합니다. 이 메서드는 유효성 검증 오류가 JSON 구조로 반환되지 않고 세션에 플래시되는 라우트를 테스트할 때 사용해야 합니다.

```
$response->assertSessionHasErrors(
    array $keys = [], $format = null, $errorBag = 'default'
);
```

예를 들어, `name`과 `email` 필드에 유효성 검증 에러 메시지가 세션에 플래시되었는지 확인하려면 아래와 같이 사용할 수 있습니다.

```
$response->assertSessionHasErrors(['name', 'email']);
```

또는, 주어진 필드에 특정 유효성 검증 에러 메시지가 있는지도 확인할 수 있습니다.

```
$response->assertSessionHasErrors([
    'name' => 'The given name was invalid.'
]);
```

> [!NOTE]
> 보다 일반적인 [assertInvalid](#assert-invalid) 메서드를 사용하면, 응답에 유효성 검증 오류가 JSON으로 반환된 경우 **또는** 오류가 세션에 플래시된 경우 모두 검사할 수 있습니다.

<a name="assert-session-has-errors-in"></a>
#### assertSessionHasErrorsIn

특정 [에러백](/docs/10.x/validation#named-error-bags) 내에 해당 `$keys`에 대한 에러가 포함되어 있는지 확인합니다. `$keys`가 연관 배열인 경우에는, 해당 에러백에 각 필드(키)별로 특정 에러 메시지(값)가 있는지 검증합니다.

```
$response->assertSessionHasErrorsIn($errorBag, $keys = [], $format = null);
```

<a name="assert-session-has-no-errors"></a>
#### assertSessionHasNoErrors

세션에 유효성 검증 에러가 없는지 확인합니다.

```
$response->assertSessionHasNoErrors();
```

<a name="assert-session-doesnt-have-errors"></a>
#### assertSessionDoesntHaveErrors

지정한 키에 대해 세션에 유효성 검증 에러가 없는지 확인합니다.

```
$response->assertSessionDoesntHaveErrors($keys = [], $format = null, $errorBag = 'default');
```

> [!NOTE]
> 보다 일반적인 [assertValid](#assert-valid) 메서드는, 응답에 유효성 검증 오류가 JSON으로 반환된 경우 **그리고** 오류가 세션에 플래시되지 않은 경우 모두 검사할 때 사용할 수 있습니다.

<a name="assert-session-missing"></a>
#### assertSessionMissing

세션에 지정한 키가 없는지 확인합니다.

```
$response->assertSessionMissing($key);
```

<a name="assert-status"></a>
#### assertStatus

응답이 지정한 HTTP 상태 코드를 가지고 있는지 확인합니다.

```
$response->assertStatus($code);
```

<a name="assert-successful"></a>
#### assertSuccessful

응답이 성공(200 이상 300 미만)인 HTTP 상태 코드를 가지고 있는지 확인합니다.

```
$response->assertSuccessful();
```

<a name="assert-too-many-requests"></a>
#### assertTooManyRequests

응답이 너무 많은 요청(429) HTTP 상태 코드를 가지고 있는지 확인합니다.

```
$response->assertTooManyRequests();
```

<a name="assert-unauthorized"></a>
#### assertUnauthorized

응답이 인증되지 않음(401) HTTP 상태 코드를 가지고 있는지 확인합니다.

```
$response->assertUnauthorized();
```

<a name="assert-unprocessable"></a>
#### assertUnprocessable

응답이 처리할 수 없음(422) HTTP 상태 코드를 가지고 있는지 확인합니다.

```
$response->assertUnprocessable();
```

<a name="assert-unsupported-media-type"></a>
#### assertUnsupportedMediaType

응답이 지원되지 않는 미디어 타입(415) HTTP 상태 코드를 가지고 있는지 확인합니다.

```
$response->assertUnsupportedMediaType();
```

<a name="assert-valid"></a>
#### assertValid

응답에 주어진 키들에 대한 유효성 검증 오류가 없는지 확인합니다. 이 메서드는 유효성 검증 에러가 JSON 구조로 반환되었거나, 세션에 플래시된 경우 모두에 대해 사용할 수 있습니다.

```
// 유효성 검증 오류가 없는지 확인...
$response->assertValid();

// 지정한 키에 대해 검증 오류가 없는지 확인...
$response->assertValid(['name', 'email']);
```

<a name="assert-invalid"></a>
#### assertInvalid

응답에 지정한 키들에 대한 유효성 검증 오류가 있는지 확인합니다. 이 메서드는 유효성 검증 에러가 JSON 구조로 반환되었거나, 세션에 플래시된 경우 모두에 대해 사용할 수 있습니다.

```
$response->assertInvalid(['name', 'email']);
```

또한, 특정 키에 대해 특정 유효성 검증 에러 메시지가 있는지도 검증할 수 있습니다. 이때 전체 메시지를 지정하거나, 메시지의 일부만 지정해도 됩니다.

```
$response->assertInvalid([
    'name' => 'The name field is required.',
    'email' => 'valid email address',
]);
```

<a name="assert-view-has"></a>
#### assertViewHas

응답 뷰에 지정한 데이터 항목이 포함되어 있는지 확인합니다.

```
$response->assertViewHas($key, $value = null);
```

`assertViewHas` 메서드의 두 번째 인수에 클로저를 전달하면, 특정 뷰 데이터에 대해 직접 검사 및 검증을 할 수 있습니다.

```
$response->assertViewHas('user', function (User $user) {
    return $user->name === 'Taylor';
});
```

또한, 뷰 데이터를 응답 객체의 배열 변수처럼 접근하여 손쉽게 검사할 수 있습니다.

```
$this->assertEquals('Taylor', $response['name']);
```

<a name="assert-view-has-all"></a>
#### assertViewHasAll

응답 뷰에 지정한 데이터 목록이 포함되어 있는지 확인합니다.

```
$response->assertViewHasAll(array $data);
```

이 메서드는 뷰에 지정한 키가 모두 존재하는지만 간단히 확인할 수도 있고,

```
$response->assertViewHasAll([
    'name',
    'email',
]);
```

또는 뷰 데이터가 특정 값과 일치하는지까지 확인할 수도 있습니다.

```
$response->assertViewHasAll([
    'name' => 'Taylor Otwell',
    'email' => 'taylor@example.com,',
]);
```

<a name="assert-view-is"></a>
#### assertViewIs

지정한 뷰가 라우트의 응답으로 반환되었는지 확인합니다.

```
$response->assertViewIs($value);
```

<a name="assert-view-missing"></a>
#### assertViewMissing

내 애플리케이션의 응답에서 반환된 뷰에 지정한 데이터 키가 존재하지 않는지 확인합니다.

```
$response->assertViewMissing($key);
```

<a name="authentication-assertions"></a>
### 인증 관련 검증

라라벨은 애플리케이션의 기능 테스트에서 사용할 수 있는 다양한 인증 관련 검증 메서드도 제공합니다. 이 메서드들은 `get`이나 `post` 같은 메서드가 반환하는 `Illuminate\Testing\TestResponse` 인스턴스가 아닌, 테스트 클래스 자체에서 호출해야 합니다.

<a name="assert-authenticated"></a>
#### assertAuthenticated

사용자가 인증되었는지 확인합니다.

```
$this->assertAuthenticated($guard = null);
```

<a name="assert-guest"></a>
#### assertGuest

사용자가 인증되지 않았는지(게스트 상태인지) 확인합니다.

```
$this->assertGuest($guard = null);
```

<a name="assert-authenticated-as"></a>
#### assertAuthenticatedAs

특정 사용자가 인증되었는지 확인합니다.

```
$this->assertAuthenticatedAs($user, $guard = null);
```

<a name="validation-assertions"></a>
## 유효성 검증 관련 검증

라라벨은 요청에서 전달된 데이터가 유효했는지 또는 유효하지 않았는지 확인할 수 있는 주요 유효성 검증 관련 검증 메서드를 두 가지 제공합니다.

<a name="validation-assert-valid"></a>
#### assertValid

응답에 주어진 키들에 대한 유효성 검증 오류가 없는지 확인합니다. 이 메서드는 유효성 검증 오류가 JSON 구조로 반환된 경우나, 오류가 세션에 플래시된 경우 모두에 대해 사용할 수 있습니다.

```
// 유효성 검증 오류가 없는지 확인...
$response->assertValid();

// 지정한 키에 대해 검증 오류가 없는지 확인...
$response->assertValid(['name', 'email']);
```

<a name="validation-assert-invalid"></a>
#### assertInvalid

응답에 지정한 키들에 대한 유효성 검증 오류가 있는지 확인합니다. 이 메서드는 유효성 검증 오류가 JSON 구조로 반환된 경우나, 오류가 세션에 플래시된 경우 모두에 대해 사용할 수 있습니다.

```
$response->assertInvalid(['name', 'email']);
```

또한, 특정 키에 대해 특정 유효성 검증 에러 메시지가 있는지도 검증할 수 있습니다. 전체 메시지를 제공하거나, 메시지의 일부분만 제공해도 됩니다.

```
$response->assertInvalid([
    'name' => 'The name field is required.',
    'email' => 'valid email address',
]);
```