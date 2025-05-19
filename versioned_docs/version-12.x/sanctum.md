# 라라벨 생텀 (Laravel Sanctum)

- [소개](#introduction)
    - [동작 방식](#how-it-works)
- [설치](#installation)
- [설정](#configuration)
    - [기본 모델 오버라이드](#overriding-default-models)
- [API 토큰 인증](#api-token-authentication)
    - [API 토큰 발급](#issuing-api-tokens)
    - [토큰 권한(Abilities)](#token-abilities)
    - [라우트 보호](#protecting-routes)
    - [토큰 폐기(Revoke)](#revoking-tokens)
    - [토큰 만료](#token-expiration)
- [SPA 인증](#spa-authentication)
    - [설정](#spa-configuration)
    - [인증하기](#spa-authenticating)
    - [라우트 보호](#protecting-spa-routes)
    - [프라이빗 브로드캐스트 채널 권한 부여](#authorizing-private-broadcast-channels)
- [모바일 애플리케이션 인증](#mobile-application-authentication)
    - [API 토큰 발급](#issuing-mobile-api-tokens)
    - [라우트 보호](#protecting-mobile-api-routes)
    - [토큰 폐기(Revoke)](#revoking-mobile-api-tokens)
- [테스트](#testing)

<a name="introduction"></a>
## 소개

[Laravel Sanctum](https://github.com/laravel/sanctum)은 SPA(싱글 페이지 애플리케이션), 모바일 애플리케이션, 그리고 간단한 토큰 기반 API를 위한 매우 가볍고 간단한 인증 시스템을 제공합니다. Sanctum을 사용하면 애플리케이션의 각 사용자가 자신의 계정에 대해 여러 개의 API 토큰을 생성할 수 있습니다. 이 토큰들에는 각각 특정한 작업만 수행할 수 있도록 허용하는 권한(ability) 또는 scope를 지정할 수 있습니다.

<a name="how-it-works"></a>
### 동작 방식

Laravel Sanctum은 서로 다른 두 가지 문제를 해결하기 위해 만들어졌습니다. 각 문제에 대해 먼저 살펴본 후, 라이브러리의 세부 동작을 설명합니다.

<a name="how-it-works-api-tokens"></a>
#### API 토큰

첫 번째로, Sanctum은 OAuth와 같은 복잡한 절차 없이 사용자의 API 토큰을 발급할 수 있는 간단한 패키지입니다. 이 기능은 GitHub 등 여러 애플리케이션에서 제공하는 "개인 접근 토큰(Personal Access Token)"에서 영감을 받았습니다. 예를 들어, 애플리케이션의 "계정 설정" 화면에서 사용자가 자신의 계정에 대한 API 토큰을 생성할 수 있는 인터페이스를 제공한다고 가정해보겠습니다. 이러한 토큰의 생성과 관리를 Sanctum으로 할 수 있습니다. 이 토큰들은 보통 매우 긴 만료 기간(수년 이상)을 가지지만, 사용자가 필요할 때 직접 폐기(revoke)할 수 있습니다.

Laravel Sanctum은 사용자 API 토큰을 하나의 데이터베이스 테이블에 저장하며, 클라이언트로부터 전송되는 HTTP 요청을 `Authorization` 헤더에 담긴 유효한 API 토큰을 기반으로 인증합니다.

<a name="how-it-works-spa-authentication"></a>
#### SPA 인증

두 번째로, Sanctum은 라라벨 기반 API와 통신하는 싱글 페이지 애플리케이션(SPA)을 간편하게 인증할 수 있는 방법을 제공합니다. 이러한 SPA는 라라벨 애플리케이션과 동일한 저장소(repository)에 있을 수도 있고, Next.js나 Nuxt로 작성되어 완전히 별도의 저장소에 있을 수도 있습니다.

이 기능에서는 어떤 종류의 토큰도 사용하지 않습니다. 대신, Sanctum은 라라벨이 기본적으로 지원하는 쿠키 기반 세션 인증을 활용합니다. 일반적으로 Sanctum은 라라벨의 `web` 인증 가드(auth guard)를 사용하여 이를 수행합니다. 이를 통해 CSRF 보호, 세션 인증, 그리고 XSS를 통한 인증 자격 증명 유출 방지 등의 이점을 얻을 수 있습니다.

Sanctum은 오로지 SPA 프론트엔드에서 온 요청에만 쿠키 기반 인증을 시도합니다. 들어오는 HTTP 요청을 살필 때, 먼저 인증용 쿠키가 있는지 확인한 뒤, 없으면 `Authorization` 헤더에 유효한 API 토큰이 있는지 확인합니다.

> [!NOTE]
> Sanctum의 기능 중 한 쪽만 사용할 수도 있습니다. 즉, API 토큰 인증 또는 SPA 인증 중 한 가지만 사용해도 무방합니다. 두 가지 기능을 모두 사용할 필요는 없습니다.

<a name="installation"></a>
## 설치

Laravel Sanctum은 `install:api` Artisan 명령어를 통해 설치할 수 있습니다.

```shell
php artisan install:api
```

이후, SPA 인증에 Sanctum을 활용하려면 이 문서의 [SPA 인증](#spa-authentication) 섹션을 참고하시기 바랍니다.

<a name="configuration"></a>
## 설정

<a name="overriding-default-models"></a>
### 기본 모델 오버라이드

일반적으로 필요하지는 않지만, Sanctum이 내부적으로 사용하는 `PersonalAccessToken` 모델을 자유롭게 확장할 수 있습니다.

```php
use Laravel\Sanctum\PersonalAccessToken as SanctumPersonalAccessToken;

class PersonalAccessToken extends SanctumPersonalAccessToken
{
    // ...
}
```

그런 다음, Sanctum의 `usePersonalAccessTokenModel` 메서드를 이용해 확장한 모델을 적용할 수 있습니다. 보통 애플리케이션의 `AppServiceProvider` 파일의 `boot` 메서드에서 호출합니다.

```php
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
> 자체적으로 개발한 SPA의 인증에는 API 토큰을 사용하지 마시고, Sanctum의 [SPA 인증 기능](#spa-authentication)을 사용하는 것이 좋습니다.

<a name="issuing-api-tokens"></a>
### API 토큰 발급

Sanctum을 사용하면 API 요청에 인증용으로 사용할 수 있는 API 토큰, 즉 개인 접근 토큰을 발급할 수 있습니다. 토큰을 사용하는 요청을 보낼 때는 반드시 `Authorization` 헤더에 토큰을 `Bearer` 형식으로 포함해야 합니다.

사용자에게 토큰을 발급하기 위해서는, User 모델에서 `Laravel\Sanctum\HasApiTokens` 트레이트를 사용해야 합니다.

```php
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
}
```

토큰을 발급하려면 `createToken` 메서드를 사용합니다. 이 메서드는 `Laravel\Sanctum\NewAccessToken` 인스턴스를 반환합니다. API 토큰은 데이터베이스에 저장되기 전에 SHA-256으로 해시 처리되므로, 생성된 후에는 `NewAccessToken` 인스턴스의 `plainTextToken` 프로퍼티를 통해 일반 텍스트 토큰 값을 얻어 사용자에게 바로 보여줘야 합니다.

```php
use Illuminate\Http\Request;

Route::post('/tokens/create', function (Request $request) {
    $token = $request->user()->createToken($request->token_name);

    return ['token' => $token->plainTextToken];
});
```

`HasApiTokens` 트레이트에서 제공하는 `tokens` Eloquent 연관관계를 통해 사용자의 모든 토큰 목록에 접근할 수 있습니다.

```php
foreach ($user->tokens as $token) {
    // ...
}
```

<a name="token-abilities"></a>
### 토큰 권한(Abilities)

Sanctum에서는 토큰별로 특정 "권한(Ability)"을 부여할 수 있습니다. 권한은 OAuth의 "scope"와 비슷한 기능을 하며, `createToken` 메서드의 두 번째 인수로 문자열 배열 형식으로 전달할 수 있습니다.

```php
return $user->createToken('token-name', ['server:update'])->plainTextToken;
```

Sanctum으로 인증된 요청을 처리하는 도중, `tokenCan` 또는 `tokenCant` 메서드를 통해 해당 요청에 사용된 토큰이 특정 권한을 가지고 있는지 확인할 수 있습니다.

```php
if ($user->tokenCan('server:update')) {
    // ...
}

if ($user->tokenCant('server:update')) {
    // ...
}
```

<a name="token-ability-middleware"></a>
#### 토큰 권한 미들웨어

Sanctum은 특정 권한이 부여된 토큰으로 요청이 들어왔는지 확인해주는 두 가지 미들웨어를 제공합니다. 우선, `bootstrap/app.php` 파일에 아래와 같이 미들웨어 별칭(alias)을 정의해야 합니다.

```php
use Laravel\Sanctum\Http\Middleware\CheckAbilities;
use Laravel\Sanctum\Http\Middleware\CheckForAnyAbility;

->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'abilities' => CheckAbilities::class,
        'ability' => CheckForAnyAbility::class,
    ]);
})
```

`abilities` 미들웨어는 요청 토큰에 지정한 모든 권한이 포함되어 있는지 확인합니다.

```php
Route::get('/orders', function () {
    // "check-status"와 "place-orders" 두 권한 모두가 토큰에 있어야 함...
})->middleware(['auth:sanctum', 'abilities:check-status,place-orders']);
```

`ability` 미들웨어는 지정된 권한 중 하나라도 토큰에 있으면 요청을 통과시킵니다.

```php
Route::get('/orders', function () {
    // "check-status" 또는 "place-orders" 중 하나 이상 권한이 있으면 허용...
})->middleware(['auth:sanctum', 'ability:check-status,place-orders']);
```

<a name="first-party-ui-initiated-requests"></a>
#### 1st-party UI에서 발생한 요청

편의를 위해, 1st-party SPA에 대해 Sanctum의 내장 [SPA 인증](#spa-authentication)을 사용 중인 경우 `tokenCan` 메서드는 항상 `true`를 반환합니다.

그러나 이것이 사용자가 해당 작업을 실제로 할 수 있음을 의미하지는 않습니다. 실제로는 애플리케이션의 [인가 정책(authorization policy)](/docs/12.x/authorization#creating-policies)에서 사용자가 권한을 갖는지, 그리고 사용자 인스턴스 자체가 해당 작업을 해도 되는지도 함께 확인해야 합니다.

예를 들어, 서버 관리 애플리케이션에서는 토큰이 서버를 업데이트할 권한을 갖고 있는지, 서버가 사용자 본인 소유인지 모두 검사할 수 있습니다.

```php
return $request->user()->id === $server->user_id &&
       $request->user()->tokenCan('server:update')
```

처음에는 1st-party UI 요청에 대해 `tokenCan`이 무조건 `true`를 반환하는 것이 이상하게 느껴질 수 있습니다. 하지만 이렇게 하면 항상 API 토큰이 있다고 가정하고 인가 정책에서 `tokenCan` 메서드를 호출할 수 있으므로, UI에서 발생한 요청이든 API의 3rd-party 소비자 요청이든 별도로 구분할 필요 없이 일관된 방식으로 코드를 작성할 수 있다는 장점이 있습니다.

<a name="protecting-routes"></a>
### 라우트 보호

모든 들어오는 요청이 인증이 필요한 라우트를 보호하려면, `routes/web.php` 또는 `routes/api.php` 등의 라우트 파일에서 해당 라우트에 `sanctum` 인증 가드를 적용해야 합니다. 이 가드는 들어오는 요청이 상태를 가진(쿠키 기반) 세션 인증 요청인지, 아니면 3rd-party에서 온 유효한 API 토큰이 있는 요청인지 확인합니다.

왜 `routes/web.php` 파일의 라우트에도 `sanctum` 가드로 인증을 걸라고 소개할까요? Sanctum은 먼저 일반적인 라라벨 세션 인증 쿠키가 있는지 확인하고, 없다면 요청의 `Authorization` 헤더에서 토큰을 확인합니다. 즉, 모든 요청에 대해 Sanctum으로 인증을 처리하면 항상 현재 인증된 사용자 인스턴스에서 `tokenCan` 메서드 등 다양한 인증 관련 메서드를 활용할 수 있습니다.

```php
use Illuminate\Http\Request;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
```

<a name="revoking-tokens"></a>
### 토큰 폐기(Revoke)

토큰을 폐기(무효화)하려면, `Laravel\Sanctum\HasApiTokens` 트레이트가 제공하는 `tokens` 관계를 통해 데이터베이스에서 토큰을 삭제하면 됩니다.

```php
// 모든 토큰 폐기...
$user->tokens()->delete();

// 현재 요청에 사용된 토큰만 폐기...
$request->user()->currentAccessToken()->delete();

// 특정 토큰만 폐기...
$user->tokens()->where('id', $tokenId)->delete();
```

<a name="token-expiration"></a>
### 토큰 만료

기본적으로 Sanctum 토큰은 만료되지 않으며, [토큰 폐기](#revoking-tokens)로만 무효화됩니다. 만약 애플리케이션의 API 토큰 만료 시간을 따로 지정하고 싶다면, 애플리케이션의 `sanctum` 설정 파일의 `expiration` 옵션을 통해 분 단위로 설정할 수 있습니다.

```php
'expiration' => 525600,
```

토큰마다 독립적으로 만료 시간을 적용하려면, `createToken` 메서드의 세 번째 인수로 만료 시간을 넘겨주면 됩니다.

```php
return $user->createToken(
    'token-name', ['*'], now()->addWeek()
)->plainTextToken;
```

토큰 만료 기능을 사용한다면, [스케줄러 작업](/docs/12.x/scheduling)으로 만료된 토큰을 정리하는 것도 권장합니다. Sanctum은 만료된 토큰을 삭제해주는 `sanctum:prune-expired` Artisan 명령어를 제공합니다. 예를 들어, 최소 24시간 이상 만료된 토큰을 매일 삭제하도록 예약 작업을 만들 수 있습니다.

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('sanctum:prune-expired --hours=24')->daily();
```

<a name="spa-authentication"></a>
## SPA 인증

Sanctum은 또한 라라벨 기반 API와 통신하는 싱글 페이지 애플리케이션(SPA)을 인증하는 매우 간단한 방법을 제공합니다. 이 SPA는 라라벨 애플리케이션과 동일한 저장소에 있거나, 완전히 별도의 저장소에 있을 수도 있습니다.

이 기능에서는 토큰을 전혀 사용하지 않습니다. 대신 라라벨의 쿠키 기반 세션 인증 서비스를 이용합니다. 이 방식은 CSRF 보호와 세션 인증이 가능할 뿐 아니라, XSS를 통한 인증 정보 유출도 막아줍니다.

> [!WARNING]
> SPA와 API는 반드시 동일한 최상위 도메인을 사용해야 합니다. 서로 다른 서브도메인에 위치하는 것은 괜찮습니다. 또한, 요청마다 `Accept: application/json` 헤더와 함께 `Referer` 또는 `Origin` 헤더를 반드시 보내야 합니다.

<a name="spa-configuration"></a>
### 설정

<a name="configuring-your-first-party-domains"></a>
#### 1st-party 도메인 설정

우선, SPA가 어떤 도메인에서 API 요청을 보낼지 설정해야 합니다. `sanctum` 설정 파일의 `stateful` 옵션을 사용하면 됩니다. 이 옵션에서 지정한 도메인에 대해서만 라라벨 세션 쿠키를 활용한 "상태 유지(stateful)" 인증이 적용됩니다.

첫 번째로, Sanctum은 `stateful` 도메인 구성을 돕기 위한 헬퍼 함수를 제공합니다. `Sanctum::currentApplicationUrlWithPort()`는 `APP_URL` 환경 변수의 현재 애플리케이션 URL을, `Sanctum::currentRequestHost()`는 현재 요청 호스트에 맞게 런타임에 자동 대체되는 플레이스홀더를 반환합니다. 이를 설정에 활용하면 동일 도메인 요청을 자동으로 처리할 수 있습니다.

> [!WARNING]
> 만약 127.0.0.1:8000 같은 URL(포트 포함)로 애플리케이션에 접근한다면 반드시 도메인과 포트까지 일치시켜야 합니다.

<a name="sanctum-middleware"></a>
#### Sanctum 미들웨어

다음으로, 라라벨에게 SPA에서 오는 요청은 세션 쿠키 인증을 사용할 수 있도록 하면서, 여전히 3rd-party 또는 모바일 애플리케이션에서는 API 토큰 인증도 허용할 수 있도록 설정해야 합니다. 이는 `bootstrap/app.php` 파일에서 `statefulApi` 미들웨어 메서드를 호출하는 것으로 쉽게 해결됩니다.

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->statefulApi();
})
```

<a name="cors-and-cookies"></a>
#### CORS와 쿠키 설정

서로 다른 서브도메인에서 실행 중인 SPA와의 인증이 잘 되지 않는다면, CORS(교차 출처 리소스 공유)나 세션 쿠키 설정이 잘못되었을 가능성이 높습니다.

`config/cors.php` 설정 파일은 기본적으로 프로젝트에 생성되어 있지 않습니다. CORS 옵션을 커스터마이즈하려면, `config:publish` 아티즌 명령어로 전체 `cors` 설정 파일을 생성할 수 있습니다.

```shell
php artisan config:publish cors
```

이제, `config/cors.php` 파일의 `supports_credentials` 옵션을 `true`로 설정하여 반드시 `Access-Control-Allow-Credentials: True` 헤더가 응답에 포함되도록 하세요.

그리고, 프론트엔드에서 사용되는 전역 `axios` 인스턴스의 `withCredentials`와 `withXSRFToken` 옵션을 활성화해야 합니다. 일반적으로 `resources/js/bootstrap.js` 파일에서 설정합니다. 만약 axios가 아닌 다른 HTTP 클라이언트를 사용한다면, 해당 클라이언트에서도 위와 동일한 옵션을 적용해야 합니다.

```js
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;
```

마지막으로, 세션 쿠키가 루트 도메인 전체, 그리고 모든 서브도메인에서도 유효하도록 세션 쿠키 도메인 설정을 변경해야 합니다. 이를 위해 애플리케이션의 `config/session.php` 파일에서 도메인 앞에 `.`(점)을 추가합니다.

```php
'domain' => '.domain.com',
```

<a name="spa-authenticating"></a>
### 인증하기

<a name="csrf-protection"></a>
#### CSRF 보호

SPA에서 인증을 시작하려면, SPA의 "로그인" 페이지에서 먼저 `/sanctum/csrf-cookie` 엔드포인트에 요청을 보내 애플리케이션의 CSRF 보호를 초기화해야 합니다.

```js
axios.get('/sanctum/csrf-cookie').then(response => {
    // 로그인 처리...
});
```

이 요청에 대해, 라라벨은 현재 CSRF 토큰이 담긴 `XSRF-TOKEN` 쿠키를 발급합니다. 이 토큰은 URL 디코딩 후, 이후 요청마다 `X-XSRF-TOKEN` 헤더에 포함되어야 합니다. 일부 HTTP 클라이언트(axios, Angular HttpClient 등)는 이를 자동으로 처리해줍니다. 만약 사용하는 JavaScript HTTP 라이브러리가 직접 헤더를 설정해주지 않는다면, 반드시 수동으로 `X-XSRF-TOKEN` 헤더에 디코딩된 쿠키 값을 직접 넣어야 합니다.

<a name="logging-in"></a>
#### 로그인 처리

CSRF 보호가 완료되었다면, 이제 라라벨 애플리케이션의 `/login` 라우트로 `POST` 요청을 보내 로그인을 처리합니다. 이 `/login` 라우트는 [직접 구현](/docs/12.x/authentication#authenticating-users)해도 되고, [Laravel Fortify](/docs/12.x/fortify)와 같은 헤드리스 인증 패키지를 이용해도 됩니다.

로그인이 성공하면, 클라이언트는 라라벨 애플리케이션에서 발급한 세션 쿠키로 인증됩니다. 추가로, `/sanctum/csrf-cookie`로 이미 CSRF 보호가 이루어졌으므로, JavaScript HTTP 클라이언트가 `XSRF-TOKEN` 쿠키의 값을 올바르게 `X-XSRF-TOKEN` 헤더에 포함한다면 자동으로 CSRF 보호도 함께 적용됩니다.

물론, 사용자의 세션이 비활성 등으로 만료되면 이후 요청에서 401 또는 419 HTTP 오류가 발생할 수 있습니다. 이런 경우에는 SPA의 로그인 페이지로 사용자를 리다이렉트하면 됩니다.

> [!WARNING]
> `/login` 엔드포인트를 직접 구현할 수 있지만, 반드시 표준 [세션 기반 인증 서비스](/docs/12.x/authentication#authenticating-users)를 사용해야 합니다. 일반적으로는 `web` 인증 가드를 이용하는 것이 권장됩니다.

<a name="protecting-spa-routes"></a>
### 라우트 보호

모든 들어오는 요청에 대해 인증을 요구하려면, `routes/api.php` 파일의 API 라우트에 `sanctum` 인증 가드를 적용하세요. 이 가드는 SPA에서 온 상태 기반 인증 요청이나, 3rd-party가 보낸 API 토큰을 모두 지원합니다.

```php
use Illuminate\Http\Request;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
```

<a name="authorizing-private-broadcast-channels"></a>
### 프라이빗 브로드캐스트 채널 권한 부여

SPA에서 [프라이빗/프레즌스 브로드캐스트 채널](/docs/12.x/broadcasting#authorizing-channels)에 인증하려면, 먼저 애플리케이션의 `bootstrap/app.php` 파일에서 `withRouting` 메서드의 `channels` 엔트리를 제거해야 합니다. 대신, 아래와 같이 `withBroadcasting` 메서드를 호출하여 브로드캐스팅 라우트에 적절한 미들웨어를 설정합니다.

```php
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

또한, Pusher 인증 요청이 올바르게 동작하려면 [Laravel Echo](/docs/12.x/broadcasting#client-side-installation)를 초기화할 때 커스텀 Pusher `authorizer`를 제공해야 합니다. 이렇게 하면 [CORS와 쿠키 설정](#cors-and-cookies)을 적용한 axios 인스턴스를 활용하도록 Pusher를 설정할 수 있습니다.

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

Sanctum 토큰을 이용해 모바일 애플리케이션의 API 요청도 인증할 수 있습니다. 모바일 애플리케이션의 인증 절차는 3rd-party API 요청을 인증하는 과정과 유사하지만, 토큰 발급 방식에 작은 차이가 있습니다.

<a name="issuing-mobile-api-tokens"></a>
### API 토큰 발급

먼저, 사용자의 이메일 또는 사용자명, 비밀번호, 그리고 디바이스 이름을 받아 새로운 Sanctum 토큰을 발급하는 라우트를 만듭니다. 여기서 "디바이스 이름"은 토큰 식별 목적으로 실제 휴대폰 기기명 등 사용자가 알아보기 쉬운 값이면 됩니다. (예: "Nuno's iPhone 12" 등)

일반적으로 모바일 애플리케이션의 "로그인" 화면에서 이 엔드포인트로 요청을 보내면, 평문 API 토큰을 응답으로 받고, 이 토큰은 모바일 기기에 저장되어 추가적인 API 요청에 사용됩니다.

```php
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

모바일 애플리케이션에서 토큰을 이용해 API 요청을 보낼 때는 반드시 `Authorization` 헤더에 `Bearer` 토큰 형태로 포함해야 합니다.

> [!NOTE]
> 모바일 애플리케이션을 위한 토큰을 발급할 때도, 필요하다면 [토큰 권한(Abilities)](#token-abilities)을 함께 지정할 수 있습니다.

<a name="protecting-mobile-api-routes"></a>
### 라우트 보호

앞서 설명한 대로, `sanctum` 인증 가드를 라우트에 적용하면 모든 요청에 대해 인증이 강제됩니다.

```php
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
```

<a name="revoking-mobile-api-tokens"></a>
### 토큰 폐기(Revoke)

사용자가 모바일 기기에 발급된 API 토큰을 폐기할 수 있도록, 웹 애플리케이션의 "계정 설정" 화면에 토큰 목록과 "폐기" 버튼을 띄울 수 있습니다. 사용자가 해당 버튼을 클릭하면 데이터베이스에서 해당 토큰을 삭제하면 됩니다. 사용자의 API 토큰은 `Laravel\Sanctum\HasApiTokens` 트레이트가 제공하는 `tokens` 관계를 통해 접근할 수 있습니다.

```php
// 모든 토큰 폐기...
$user->tokens()->delete();

// 특정 토큰 폐기...
$user->tokens()->where('id', $tokenId)->delete();
```

<a name="testing"></a>
## 테스트

테스트에서, `Sanctum::actingAs` 메서드를 통해 사용자를 인증하고 해당 토큰에 부여할 권한도 지정할 수 있습니다.

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

토큰에 모든 권한을 부여하고 싶을 경우, `actingAs` 메서드의 권한 배열에 `*` 를 포함시키면 됩니다.

```php
Sanctum::actingAs(
    User::factory()->create(),
    ['*']
);
```
