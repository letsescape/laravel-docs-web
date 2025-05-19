# 라라벨 생텀 (Laravel Sanctum)

- [소개](#introduction)
    - [동작 방식](#how-it-works)
- [설치](#installation)
- [설정](#configuration)
    - [기본 모델 오버라이드](#overriding-default-models)
- [API 토큰 인증](#api-token-authentication)
    - [API 토큰 발급](#issuing-api-tokens)
    - [토큰 능력(Abilities)](#token-abilities)
    - [라우트 보호](#protecting-routes)
    - [토큰 폐기(삭제)](#revoking-tokens)
    - [토큰 만료](#token-expiration)
- [SPA 인증](#spa-authentication)
    - [설정](#spa-configuration)
    - [인증 처리](#spa-authenticating)
    - [라우트 보호](#protecting-spa-routes)
    - [프라이빗 브로드캐스트 채널 인가](#authorizing-private-broadcast-channels)
- [모바일 애플리케이션 인증](#mobile-application-authentication)
    - [API 토큰 발급](#issuing-mobile-api-tokens)
    - [라우트 보호](#protecting-mobile-api-routes)
    - [토큰 폐기(삭제)](#revoking-mobile-api-tokens)
- [테스트](#testing)

<a name="introduction"></a>
## 소개

[라라벨 Sanctum](https://github.com/laravel/sanctum)은 SPA(싱글 페이지 애플리케이션), 모바일 애플리케이션, 그리고 간단한 토큰 기반 API를 위한 매우 가벼운 인증 시스템을 제공합니다. Sanctum을 사용하면 애플리케이션의 각 사용자가 자신의 계정에 대해 여러 개의 API 토큰을 생성할 수 있습니다. 각 토큰에는 토큰이 수행할 수 있는 작업을 지정하는 능력(Abilities) 또는 스코프(Scopes)를 부여할 수 있습니다.

<a name="how-it-works"></a>
### 동작 방식

라라벨 Sanctum은 두 가지 개별적인 문제를 해결하기 위해 만들어졌습니다. 본격적으로 라이브러리를 살펴보기 전에 각각을 먼저 알아보겠습니다.

<a name="how-it-works-api-tokens"></a>
#### API 토큰

먼저, Sanctum은 OAuth의 복잡함 없이 사용자에게 API 토큰을 발급할 수 있는 간단한 패키지입니다. 이 기능은 GitHub를 비롯한 다양한 애플리케이션이 제공하는 "개인 접근 토큰(Personal Access Token)"에서 영감을 얻은 것입니다. 예를 들어, 애플리케이션의 "계정 설정" 화면에 사용자가 자신의 계정에 대해 API 토큰을 생성할 수 있는 화면이 있다고 가정해봅시다. Sanctum을 사용하면 이러한 토큰을 쉽게 생성 및 관리할 수 있습니다. 이러한 토큰은 일반적으로 매우 긴 만료 시간(수년)을 가지지만, 사용자가 언제든 수동으로 폐기(삭제)할 수 있습니다.

라라벨 Sanctum은 사용자 API 토큰을 하나의 데이터베이스 테이블에 저장하며, 들어오는 HTTP 요청의 `Authorization` 헤더에 유효한 API 토큰이 포함되어 있는지 확인하여 인증을 처리합니다.

<a name="how-it-works-spa-authentication"></a>
#### SPA 인증

두 번째로, Sanctum은 라라벨 기반 API와 통신해야 하는 SPA(싱글 페이지 애플리케이션)를 간편하게 인증할 수 있는 방법을 제공합니다. 이런 SPA는 라라벨 애플리케이션과 같은 저장소(repository)에 있을 수도 있고, Next.js, Nuxt와 같이 완전히 별도의 저장소일 수도 있습니다.

이 기능에서는 어떠한 종류의 토큰도 사용하지 않습니다. Sanctum은 라라벨의 기본 쿠키 기반 세션 인증 서비스를 활용합니다. 보통 Sanctum은 라라벨의 `web` 인증 가드를 사용해 이 작업을 수행합니다. 이 방식은 CSRF 보호, 세션 인증, 그리고 XSS를 통한 인증 자격 증명의 노출을 방지하는 이점을 제공합니다.

Sanctum은 들어오는 요청이 자신의 SPA 프론트엔드에서 시작된 경우에만 쿠키 기반 인증을 시도합니다. 들어오는 HTTP 요청을 확인할 때, 인증 쿠키가 있는지 먼저 체크하고, 쿠키가 없으면 `Authorization` 헤더에서 유효한 API 토큰을 검사합니다.

> [!NOTE]  
> Sanctum을 API 토큰 인증 또는 SPA 인증 중 하나만을 위해서만 사용하는 것도 전혀 문제되지 않습니다. 두 기능을 반드시 모두 사용할 필요는 없습니다.

<a name="installation"></a>
## 설치

`install:api` Artisan 명령어를 사용하여 라라벨 Sanctum을 설치할 수 있습니다:

```shell
php artisan install:api
```

이후 SPA 인증에 Sanctum을 사용할 계획이라면, 이 문서의 [SPA 인증](#spa-authentication) 섹션을 참고하시기 바랍니다.

<a name="configuration"></a>
## 설정

<a name="overriding-default-models"></a>
### 기본 모델 오버라이드

일반적으로 필요하지는 않지만, Sanctum이 내부적으로 사용하는 `PersonalAccessToken` 모델을 자유롭게 확장해서 사용할 수 있습니다:

```
use Laravel\Sanctum\PersonalAccessToken as SanctumPersonalAccessToken;

class PersonalAccessToken extends SanctumPersonalAccessToken
{
    // ...
}
```

그다음, Sanctum이 여러분의 커스텀 모델을 사용하도록 `Sanctum`에서 제공하는 `usePersonalAccessTokenModel` 메서드를 호출하면 됩니다. 이 메서드는 애플리케이션의 `AppServiceProvider` 파일의 `boot` 메서드에서 호출하는 것이 일반적입니다:

```
use App\Models\Sanctum\PersonalAccessToken;
use Laravel\Sanctum\Sanctum;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Sanctum::usePersonalAccessTokenModel(PersonalAccessToken::class);
}
```

<a name="api-token-authentication"></a>
## API 토큰 인증

> [!NOTE]  
> 자신의 SPA 인증에는 API 토큰을 사용하지 마십시오. 대신 Sanctum의 내장 [SPA 인증 기능](#spa-authentication)을 사용하세요.

<a name="issuing-api-tokens"></a>
### API 토큰 발급

Sanctum을 사용하면 API 요청을 인증할 수 있도록 API 토큰/개인 접근 토큰을 발급할 수 있습니다. API 토큰을 사용할 때는 토큰을 `Bearer` 토큰 형식으로 `Authorization` 헤더에 포함시켜 요청해야 합니다.

사용자에게 토큰을 발급하려면, User 모델에서 `Laravel\Sanctum\HasApiTokens` 트레이트를 사용해야 합니다:

```
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
}
```

토큰을 발급하려면, `createToken` 메서드를 사용하면 됩니다. 이 메서드는 `Laravel\Sanctum\NewAccessToken` 인스턴스를 반환합니다. 토큰은 데이터베이스에 저장되기 전에 SHA-256 해시로 암호화되지만, `NewAccessToken` 인스턴스의 `plainTextToken` 속성을 사용하여 토큰의 평문 값을 바로 확인할 수 있습니다. 토큰이 생성된 직후, 이 값을 반드시 사용자에게 보여주어야 합니다:

```
use Illuminate\Http\Request;

Route::post('/tokens/create', function (Request $request) {
    $token = $request->user()->createToken($request->token_name);

    return ['token' => $token->plainTextToken];
});
```

`HasApiTokens` 트레이트에서 제공하는 `tokens` Eloquent 연관관계를 통해 사용자의 모든 토큰에 접근할 수 있습니다:

```
foreach ($user->tokens as $token) {
    // ...
}
```

<a name="token-abilities"></a>
### 토큰 능력(Abilities)

Sanctum을 사용하면 토큰에 "능력(Ability)"을 부여할 수 있습니다. 능력은 OAuth의 "스코프"와 유사한 역할을 합니다. `createToken` 메서드의 두 번째 인자로 문자열 배열을 전달하여 토큰에 여러 능력을 부여할 수 있습니다:

```
return $user->createToken('token-name', ['server:update'])->plainTextToken;
```

Sanctum으로 인증된 들어오는 요청을 처리할 때, `tokenCan` 또는 `tokenCant` 메서드를 사용하여 토큰이 특정 능력을 가지고 있는지 확인할 수 있습니다:

```
if ($user->tokenCan('server:update')) {
    // ...
}

if ($user->tokenCant('server:update')) {
    // ...
}
```

<a name="token-ability-middleware"></a>
#### 토큰 능력 미들웨어

Sanctum에는 토큰에 특정 능력이 있는지 확인하기 위한 두 가지 미들웨어가 포함되어 있습니다. 우선, 애플리케이션의 `bootstrap/app.php` 파일에 다음과 같이 미들웨어 별칭을 정의해야 합니다:

```
use Laravel\Sanctum\Http\Middleware\CheckAbilities;
use Laravel\Sanctum\Http\Middleware\CheckForAnyAbility;

->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'abilities' => CheckAbilities::class,
        'ability' => CheckForAnyAbility::class,
    ]);
})
```

`abilities` 미들웨어를 라우트에 할당하면, 들어오는 요청의 토큰에 나열된 모든 능력이 있는지 확인합니다:

```
Route::get('/orders', function () {
    // 토큰에 "check-status"와 "place-orders" 능력이 모두 있어야 활성화...
})->middleware(['auth:sanctum', 'abilities:check-status,place-orders']);
```

`ability` 미들웨어는 라우트에 할당하면, 들어오는 요청의 토큰에 **하나라도** 나열된 능력이 있으면 통과합니다:

```
Route::get('/orders', function () {
    // 토큰에 "check-status" 또는 "place-orders" 능력이 있으면 활성화...
})->middleware(['auth:sanctum', 'ability:check-status,place-orders']);
```

<a name="first-party-ui-initiated-requests"></a>
#### 자체 UI(First-Party UI)에서 발생한 요청

편의상, Sanctum의 내장 [SPA 인증](#spa-authentication)을 사용할 때, 자체 SPA에서 발생한 인증된 요청의 경우 `tokenCan` 메서드는 항상 `true`를 반환합니다.

하지만, 이 값이 항상 해당 사용자가 실제로 그 작업을 할 수 있다는 뜻은 아닙니다. 보통 애플리케이션의 [인가 정책(Authorization Policy)](/docs/11.x/authorization#creating-policies)가 토큰이 해당 능력을 가졌는지뿐 아니라, 사용자 자신이 해당 작업을 수행할 자격이 있는지까지도 같이 확인하게 됩니다.

예를 들어, 서버를 관리하는 애플리케이션이라면, 토큰이 서버를 업데이트하도록 인가받았는지 **그리고** 해당 서버가 사용자 소유인지 확인하는 식입니다:

```php
return $request->user()->id === $server->user_id &&
       $request->user()->tokenCan('server:update')
```

처음에는, UI에서 발생한 요청에 대해 `tokenCan`이 무조건 `true`를 반환하는 것이 다소 이상하게 느껴질 수 있지만, 이 방식은 항상 API 토큰이 존재한다고 가정하고 인증 정책 내에서 `tokenCan` 메서드를 일관되게 사용할 수 있게 해 줍니다. 이 덕분에 해당 요청이 UI에서 발생했는지, 아니면 API의 서드파티 소비자에서 발생했는지에 관계없이 언제나 `tokenCan`을 불러올 수 있습니다.

<a name="protecting-routes"></a>
### 라우트 보호

모든 들어오는 요청에 인증을 강제하려면, `routes/web.php` 또는 `routes/api.php` 라우트 파일의 보호하려는 라우트에 `sanctum` 인증 가드를 붙이세요. 이 가드는 들어오는 요청이 상태를 가진 쿠키 기반 인증(세션)인지, 아니면 서드파티 요청으로 토큰 헤더가 포함된 요청인지를 확인하여 인증합니다.

왜 `routes/web.php`에도 `sanctum` 가드를 붙여서 인증을 권장하는지 궁금할 수 있습니다. Sanctum은 우선, 일반적인 라라벨 세션 인증 쿠키로 요청을 인증하려 시도합니다. 만약 쿠키가 없다면 요청의 `Authorization` 헤더 토큰을 확인합니다. 이처럼 모든 요청을 Sanctum으로 인증 처리하면, 현재 인증된 사용자 인스턴스에서 항상 `tokenCan` 메서드를 호출할 수 있다는 장점이 있습니다:

```
use Illuminate\Http\Request;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
```

<a name="revoking-tokens"></a>
### 토큰 폐기(삭제)

토큰을 폐기(삭제)하려면, `Laravel\Sanctum\HasApiTokens` 트레이트에서 제공하는 `tokens` 관계를 통해 데이터베이스에서 토큰을 삭제하면 됩니다:

```
// 모든 토큰 폐기...
$user->tokens()->delete();

// 현재 요청에서 인증에 사용된 토큰만 폐기...
$request->user()->currentAccessToken()->delete();

// 특정 토큰만 폐기...
$user->tokens()->where('id', $tokenId)->delete();
```

<a name="token-expiration"></a>
### 토큰 만료

기본적으로, Sanctum 토큰은 만료되지 않으며, [토큰 폐기](#revoking-tokens)를 통해서만 무효화 가능합니다. 하지만, 애플리케이션의 API 토큰에 만료 시간을 설정하고 싶다면, `sanctum` 설정 파일의 `expiration` 옵션에서 설정할 수 있습니다. 이 옵션은 토큰이 발급된 후 얼마나 많은 분(minutes)이 지나면 만료 처리할지 정합니다:

```php
'expiration' => 525600,
```

각 토큰의 만료 시간을 개별적으로 지정하고 싶다면, `createToken` 메서드의 세 번째 인자로 만료 시간을 전달할 수 있습니다:

```php
return $user->createToken(
    'token-name', ['*'], now()->addWeek()
)->plainTextToken;
```

애플리케이션에서 토큰 만료 시간을 설정한 경우, 만료된 토큰을 정기적으로 삭제(정리)하기 위한 [작업 스케줄링](/docs/11.x/scheduling)을 적용할 수 있습니다. Sanctum에서는 토큰 정리를 위한 `sanctum:prune-expired` Artisan 명령어를 제공합니다. 예를 들어, 만료된 지 24시간 이상 지난 토큰을 매일 삭제하는 작업을 이렇게 등록할 수 있습니다:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('sanctum:prune-expired --hours=24')->daily();
```

<a name="spa-authentication"></a>
## SPA 인증

Sanctum은 라라벨 기반 API와 통신해야 하는 SPA(싱글 페이지 애플리케이션)를 간편하게 인증할 수 있는 방법도 제공합니다. 이런 SPA는 라라벨 애플리케이션과 같은 저장소에 있거나, 완전히 별도의 저장소에 있을 수도 있습니다.

이 기능에서는 어떠한 종류의 토큰도 사용하지 않고, 라라벨의 내장 쿠키 기반 세션 인증 서비스를 사용합니다. 이 방식은 CSRF 보호, 세션 인증, 그리고 XSS로 인한 인증 정보 노출 방지 등 여러 장점을 제공합니다.

> [!WARNING]  
> SPA와 API가 인증을 정상적으로 하려면 반드시 같은 최상위 도메인(top-level domain)을 공유해야 합니다. 둘이 서로 다른 서브도메인에 위치하는 것은 괜찮습니다. 또한 요청 시 `Accept: application/json` 헤더와 `Referer` 또는 `Origin` 헤더를 반드시 포함시켜야 합니다.

<a name="spa-configuration"></a>
### 설정

<a name="configuring-your-first-party-domains"></a>
#### 자신의 퍼스트파티 도메인(First-Party Domains) 설정

먼저, SPA가 어느 도메인에서 요청을 보낼 것인지 설정해야 합니다. 이는 `sanctum` 설정 파일의 `stateful` 옵션으로 관리할 수 있습니다. 이 설정은 어떤 도메인에서 라라벨 세션 쿠키를 유지하고, "상태를 가진" 인증 요청을 보낼지 결정합니다.

> [!WARNING]  
> 애플리케이션에 포트 번호(`127.0.0.1:8000` 등)가 포함된 URL로 접근한다면, `stateful`에 도메인 추가 시 반드시 해당 포트 번호까지 포함해야 합니다.

<a name="sanctum-middleware"></a>
#### Sanctum 미들웨어

다음으로, 라라벨에게 SPA에서 들어오는 요청은 세션 쿠키를 사용한 인증이 가능함을 알려주면서, 동시에 서드파티 혹은 모바일 애플리케이션의 요청은 API 토큰 인증이 가능하도록 설정할 수 있습니다. 이는 애플리케이션의 `bootstrap/app.php` 파일에서 `statefulApi` 미들웨어 메서드를 호출하면 쉽게 할 수 있습니다:

```
->withMiddleware(function (Middleware $middleware) {
    $middleware->statefulApi();
})
```

<a name="cors-and-cookies"></a>
#### CORS와 쿠키 설정

별도의 서브도메인에서 동작하는 SPA에서 인증 문제가 발생한다면, CORS(교차 출처 리소스 공유) 또는 세션 쿠키 설정이 잘못되었을 가능성이 높습니다.

`config/cors.php` 설정 파일은 기본적으로 퍼블리시되어 있지 않으므로, 라라벨의 CORS 옵션을 커스터마이징하려면 `config:publish` Artisan 명령어로 전체 CORS 설정 파일을 퍼블리시해야 합니다:

```bash
php artisan config:publish cors
```

이후, 애플리케이션의 CORS 설정에서 `Access-Control-Allow-Credentials` 헤더가 반드시 `True` 값을 반환하도록 설정해야 합니다. 이를 위해서는 애플리케이션의 `config/cors.php` 파일에서 `supports_credentials`를 `true`로 지정합니다.

또한, 애플리케이션의 글로벌 `axios` 인스턴스에서 `withCredentials`와 `withXSRFToken` 옵션을 활성화해야 합니다. 보통 이는 `resources/js/bootstrap.js` 파일 등에서 설정하게 됩니다. 프론트엔드에서 axios 대신 다른 HTTP 클라이언트를 사용한다면, 해당 라이브러리의 동일한 설정을 반드시 적용하세요:

```js
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;
```

마지막으로, 애플리케이션 세션 쿠키의 도메인 설정이 루트 도메인의 모든 서브도메인을 포괄할 수 있도록 설정되어야 합니다. 이를 위해 `config/session.php` 파일에서 도메인 앞에 점(`.`)을 붙여 지정하세요:

```
'domain' => '.domain.com',
```

<a name="spa-authenticating"></a>
### 인증 처리

<a name="csrf-protection"></a>
#### CSRF 보호

SPA에서 인증을 시도하기 전, SPA의 "로그인" 페이지에서 먼저 `/sanctum/csrf-cookie` 엔드포인트에 요청을 보내 CSRF 보호를 초기화해야 합니다:

```js
axios.get('/sanctum/csrf-cookie').then(response => {
    // Login...
});
```

이 요청을 통해 라라벨은 현재의 CSRF 토큰이 담긴 `XSRF-TOKEN` 쿠키를 세팅합니다. 이 토큰은 URL 디코딩 처리 후, 이후 요청에서 `X-XSRF-TOKEN` 헤더로 전달되어야 하며, axios나 Angular HttpClient와 같은 일부 HTTP 클라이언트 라이브러리는 이를 자동으로 처리합니다. 만약 사용하는 JavaScript HTTP 라이브러리가 자동으로 헤더를 추가하지 않는다면, 직접 쿠키에서 `XSRF-TOKEN` 값을 읽어와 `X-XSRF-TOKEN` 헤더에 셋팅해야 합니다.

<a name="logging-in"></a>
#### 로그인 처리

CSRF 보호가 초기화된 이후, SPA에서 라라벨 애플리케이션의 `/login` 라우트에 `POST` 요청을 보내 인증을 진행해야 합니다. 이 `/login` 라우트는 [직접 구현](/docs/11.x/authentication#authenticating-users)하거나, [라라벨 Fortify](/docs/11.x/fortify) 같은 헤드리스 인증 패키지를 사용할 수 있습니다.

로그인 요청이 성공적으로 완료되면, 세션 쿠키를 통해 이후 모든 요청이 자동으로 인증 처리됩니다. 또한 이미 `/sanctum/csrf-cookie` 요청을 보냈기 때문에, 자바스크립트 HTTP 클라이언트가 `XSRF-TOKEN` 쿠키 값을 `X-XSRF-TOKEN` 헤더로 전송해주는 한, CSRF 보호도 문제없이 적용됩니다.

만약 사용자의 세션이 비활성 상태로 인해 만료된다면, 이후 요청 시 401 또는 419 HTTP 오류 응답을 받을 수도 있습니다. 이 경우 SPA의 로그인 페이지로 사용자를 리다이렉트하면 됩니다.

> [!WARNING]  
> `/login` 엔드포인트는 직접 구현해도 상관없으나, 반드시 라라벨이 제공하는 표준 [세션 기반 인증 서비스](/docs/11.x/authentication#authenticating-users)를 활용해 사용자를 인증해야 합니다. 일반적으로는 `web` 인증 가드(guard)를 사용하게 됩니다.

<a name="protecting-spa-routes"></a>
### 라우트 보호

모든 들어오는 요청에 인증을 강제하려면, `routes/api.php` 파일에서 API 라우트에 `sanctum` 인증 가드를 붙이세요. 이 가드는 SPA에서 오는 상태를 가진(stateful) 인증 요청과, 서드파티 토큰 헤더 요청을 모두 적절히 인증해줍니다:

```
use Illuminate\Http\Request;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
```

<a name="authorizing-private-broadcast-channels"></a>
### 프라이빗 브로드캐스트 채널 인가

SPA에서 [프라이빗/프레즌스 브로드캐스트 채널](/docs/11.x/broadcasting#authorizing-channels)을 인증하려면, 애플리케이션의 `bootstrap/app.php` 파일의 `withRouting` 메서드에서 `channels` 항목을 제거하세요. 대신, 브로드캐스팅 라우트에 올바른 미들웨어를 지정할 수 있도록 `withBroadcasting` 메서드를 호출해야 합니다:

```
return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        // ...
    )
    ->withBroadcasting(
        __DIR__.'/../routes/channels.php',
        ['prefix' => 'api', 'middleware' => ['api', 'auth:sanctum']],
    )
```

그리고 Pusher의 인가 요청(authorization request)이 성공하도록, [Laravel Echo](/docs/11.x/broadcasting#client-side-installation) 초기화 시 `axios`를 [CORS 및 쿠키가 올바르게 설정된](#cors-and-cookies) 인스턴스로 지정하는 커스텀 Pusher `authorizer`를 등록해야 합니다:

```js
window.Echo = new Echo({
    broadcaster: "pusher",
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    encrypted: true,
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    authorizer: (channel, options) => {
        return {
            authorize: (socketId, callback) => {
                axios.post('/api/broadcasting/auth', {
                    socket_id: socketId,
                    channel_name: channel.name
                })
                .then(response => {
                    callback(false, response.data);
                })
                .catch(error => {
                    callback(true, error);
                });
            }
        };
    },
})
```

<a name="mobile-application-authentication"></a>
## 모바일 애플리케이션 인증

모바일 애플리케이션에서도 Sanctum 토큰을 사용하여 API 요청을 인증할 수 있습니다. 모바일 애플리케이션의 인증 요청 처리 방식은 서드파티 API 요청 인증과 유사하지만, 토큰 발급 방법에 약간 차이가 있습니다.

<a name="issuing-mobile-api-tokens"></a>
### API 토큰 발급

먼저, 사용자의 이메일/사용자명, 비밀번호, 디바이스 이름을 받아 새로운 Sanctum 토큰과 교환해주는 라우트를 생성합니다. 이때 "디바이스 이름"은 정보용으로, 어떤 값이든 자유롭게 지정할 수 있습니다. 보통 사용자가 알 수 있는 기기명을 사용하는 것이 좋습니다(예: "Nuno의 iPhone 12").

보통 모바일 앱의 "로그인" 화면에서 해당 엔드포인트에 요청을 보냅니다. 성공 시 평문 API 토큰이 반환되며, 모바일 기기에 저장한 뒤 이후 추가 API 요청에 활용하게 됩니다:

```
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

Route::post('/sanctum/token', function (Request $request) {
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
        'device_name' => 'required',
    ]);

    $user = User::where('email', $request->email)->first();

    if (! $user || ! Hash::check($request->password, $user->password)) {
        throw ValidationException::withMessages([
            'email' => ['The provided credentials are incorrect.'],
        ]);
    }

    return $user->createToken($request->device_name)->plainTextToken;
});
```

모바일 애플리케이션이 발급받은 토큰을 사용하여 API 요청을 보낼 때는, `Authorization` 헤더에 `Bearer` 토큰 형식으로 토큰을 포함해야 합니다.

> [!NOTE]  
> 모바일 애플리케이션 토큰을 발급할 때도 [토큰 능력(Ability)](#token-abilities)을 자유롭게 지정할 수 있습니다.

<a name="protecting-mobile-api-routes"></a>
### 라우트 보호

앞서 설명한 대로, 모든 들어오는 요청을 인증하려면 라우트에 `sanctum` 인증 가드를 붙이시면 됩니다:

```
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
```

<a name="revoking-mobile-api-tokens"></a>
### 토큰 폐기(삭제)

사용자가 모바일 기기에 발급된 API 토큰을 폐기할 수 있도록, 웹 애플리케이션의 "계정 설정" 화면에 토큰 이름과 함께 "폐기" 버튼을 표시할 수 있습니다. 사용자가 "폐기" 버튼을 누르면 데이터베이스에서 해당 토큰을 삭제하면 됩니다. 사용자의 API 토큰 목록은 `Laravel\Sanctum\HasApiTokens` 트레이트의 `tokens` 관계를 통해 접근할 수 있습니다:

```
// 모든 토큰 폐기...
$user->tokens()->delete();

// 특정 토큰만 폐기...
$user->tokens()->where('id', $tokenId)->delete();
```

<a name="testing"></a>
## 테스트

테스트 시, `Sanctum::actingAs` 메서드를 사용하면 특정 사용자를 인증하고 해당 토큰에 부여할 능력(Abilities)도 지정할 수 있습니다:

```php tab=Pest
use App\Models\User;
use Laravel\Sanctum\Sanctum;

test('task list can be retrieved', function () {
    Sanctum::actingAs(
        User::factory()->create(),
        ['view-tasks']
    );

    $response = $this->get('/api/task');

    $response->assertOk();
});
```

```php tab=PHPUnit
use App\Models\User;
use Laravel\Sanctum\Sanctum;

public function test_task_list_can_be_retrieved(): void
{
    Sanctum::actingAs(
        User::factory()->create(),
        ['view-tasks']
    );

    $response = $this->get('/api/task');

    $response->assertOk();
}
```

토큰에 모든 능력을 부여하고 싶다면, `actingAs` 메서드의 능력 리스트에 `*`를 포함시키면 됩니다:

```
Sanctum::actingAs(
    User::factory()->create(),
    ['*']
);
```
