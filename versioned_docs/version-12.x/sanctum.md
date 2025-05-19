# 라라벨 Sanctum (Laravel Sanctum)

- [소개](#introduction)
    - [동작 방식](#how-it-works)
- [설치](#installation)
- [설정](#configuration)
    - [기본 모델 오버라이드하기](#overriding-default-models)
- [API 토큰 인증](#api-token-authentication)
    - [API 토큰 발급](#issuing-api-tokens)
    - [토큰 기능(Abilities)](#token-abilities)
    - [라우트 보호하기](#protecting-routes)
    - [토큰 폐기(무효화)](#revoking-tokens)
    - [토큰 만료](#token-expiration)
- [SPA 인증](#spa-authentication)
    - [설정](#spa-configuration)
    - [인증하기](#spa-authenticating)
    - [SPA 라우트 보호하기](#protecting-spa-routes)
    - [프라이빗 브로드캐스트 채널 인가](#authorizing-private-broadcast-channels)
- [모바일 애플리케이션 인증](#mobile-application-authentication)
    - [API 토큰 발급](#issuing-mobile-api-tokens)
    - [모바일 API 라우트 보호하기](#protecting-mobile-api-routes)
    - [모바일 API 토큰 폐기](#revoking-mobile-api-tokens)
- [테스트](#testing)

<a name="introduction"></a>
## 소개

[Laravel Sanctum](https://github.com/laravel/sanctum)은 SPA(싱글 페이지 애플리케이션), 모바일 애플리케이션, 그리고 단순한 토큰 기반 API를 위한 경량 인증 시스템을 제공합니다. Sanctum을 사용하면 각 사용자가 자신의 계정에서 여러 개의 API 토큰을 생성할 수 있습니다. 이 토큰에는 토큰이 허용된 작업을 명시하는 "기능(abilities)" 또는 "스코프"를 부여할 수 있습니다.

<a name="how-it-works"></a>
### 동작 방식

Laravel Sanctum은 서로 다른 두 가지 문제를 해결하기 위해 만들어졌습니다. 라이브러리의 세부 설명에 들어가기 전, 이 두 가지 목적에 대해 먼저 살펴보겠습니다.

<a name="how-it-works-api-tokens"></a>
#### API 토큰

먼저, Sanctum은 OAuth보다 복잡하지 않게, 사용자에게 API 토큰을 발급할 수 있는 간단한 패키지입니다. 이 기능은 GitHub 등에서 제공하는 "개인 액세스 토큰"에서 영감을 받았습니다. 예를 들어, 애플리케이션의 "계정 설정" 화면에서 사용자가 자신의 API 토큰을 생성할 수 있도록 하는 경우, Sanctum을 이용해 토큰을 생성하고 관리할 수 있습니다. 이런 형태의 토큰은 일반적으로 아주 오랜 유효기간(수년)을 가지지만, 사용자가 직접 언제든지 수동으로 폐기할 수 있습니다.

Laravel Sanctum은 사용자 API 토큰을 하나의 데이터베이스 테이블에 저장하며, HTTP 요청의 `Authorization` 헤더에 유효한 API 토큰이 포함되어 있으면 이를 인증합니다.

<a name="how-it-works-spa-authentication"></a>
#### SPA 인증

두 번째로, Sanctum은 SPA(싱글 페이지 애플리케이션)에서 라라벨 기반 API와 통신할 때 간단하게 인증할 수 있도록 설계되었습니다. SPA는 라라벨 애플리케이션과 같은 저장소에 함께 존재할 수도 있고, 혹은 Next.js, Nuxt 등과 같이 완전히 별도의 저장소에 작성될 수도 있습니다.

이 기능을 사용할 때 Sanctum은 별도의 토큰을 사용하지 않습니다. 대신, Sanctum은 라라벨에 기본 내장된 쿠키 기반 세션 인증 서비스를 사용합니다. 보통 라라벨의 `web` 인증 가드를 활용하여 동작합니다. 이 방식은 CSRF 보호, 세션 인증, 인증 정보가 XSS를 통해 유출되는 것을 막는 장점을 제공합니다.

Sanctum은 오직 여러분의 SPA 프론트엔드에서 들어오는 요청에 한해서만 쿠키를 이용한 인증을 시도합니다. Sanctum은 들어오는 HTTP 요청을 확인할 때 먼저 인증 쿠키가 있는지 확인하고, 쿠키가 없으면 `Authorization` 헤더에 유효한 API 토큰이 있는지 검사합니다.

> [!NOTE]
> Sanctum의 기능 중 하나만 써도 전혀 문제가 없습니다. API 토큰 인증만 사용할 수도 있고, SPA 인증만 사용할 수도 있습니다. Sanctum을 도입했다고 해서 반드시 두 가지 모두를 사용해야 하는 것은 아닙니다.

<a name="installation"></a>
## 설치

`install:api` 아티즌 명령어를 이용해 Laravel Sanctum을 설치할 수 있습니다.

```shell
php artisan install:api
```

이후, Sanctum을 사용해 SPA를 인증하려는 경우, 본 문서의 [SPA 인증](#spa-authentication) 섹션을 참고하시기 바랍니다.

<a name="configuration"></a>
## 설정

<a name="overriding-default-models"></a>
### 기본 모델 오버라이드하기

일반적으로는 필요하지 않지만, 내장된 `PersonalAccessToken` 모델을 확장하여 사용할 수 있습니다.

```php
use Laravel\Sanctum\PersonalAccessToken as SanctumPersonalAccessToken;

class PersonalAccessToken extends SanctumPersonalAccessToken
{
    // ...
}
```

그런 다음, Sanctum이 여러분의 커스텀 모델을 사용하도록 `usePersonalAccessTokenModel` 메서드를 호출해 설정할 수 있습니다. 이 메서드는 보통 애플리케이션의 `AppServiceProvider` 파일의 `boot` 메서드에서 호출합니다.

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
> 자체적으로 개발한 1st party SPA를 인증하는 데는 API 토큰을 사용하지 않아야 합니다. 대신 Sanctum의 내장된 [SPA 인증 기능](#spa-authentication)을 사용하세요.

<a name="issuing-api-tokens"></a>
### API 토큰 발급

Sanctum을 사용하면, 애플리케이션에서 API 요청을 인증하는 데 사용할 수 있는 API 토큰(개인 접근 토큰)을 발급할 수 있습니다. API 토큰을 사용하는 요청을 보낼 때는 토큰을 `Bearer` 토큰 형태로 `Authorization` 헤더에 포함해야 합니다.

사용자에게 토큰을 발급하려면, User 모델에 `Laravel\Sanctum\HasApiTokens` 트레잇을 적용해야 합니다.

```php
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
}
```

토큰을 발급하려면 `createToken` 메서드를 사용하면 됩니다. 이 메서드는 `Laravel\Sanctum\NewAccessToken` 인스턴스를 반환합니다. API 토큰은 DB에 저장될 때 SHA-256 방식으로 해싱되지만, 반환 객체의 `plainTextToken` 프로퍼티를 통해 평문 토큰 값을 바로 확인할 수 있습니다. 토큰은 생성 직후 사용자에게 즉시 보여주어야 합니다.

```php
use Illuminate\Http\Request;

Route::post('/tokens/create', function (Request $request) {
    $token = $request->user()->createToken($request->token_name);

    return ['token' => $token->plainTextToken];
});
```

사용자의 모든 토큰은 `HasApiTokens` 트레잇에서 제공되는 `tokens` Eloquent 관계로 접근할 수 있습니다.

```php
foreach ($user->tokens as $token) {
    // ...
}
```

<a name="token-abilities"></a>
### 토큰 기능(Abilities)

Sanctum에서는 토큰에 "기능(ability)"을 부여할 수 있습니다. 토큰의 기능은 OAuth의 "스코프"와 비슷한 역할을 합니다. `createToken` 메서드의 두 번째 인수로 문자열 배열을 전달하여 기능(abilities)을 지정할 수 있습니다.

```php
return $user->createToken('token-name', ['server:update'])->plainTextToken;
```

Sanctum을 통해 인증된 요청을 처리할 때, 토큰이 특정 기능을 가지고 있는지 `tokenCan` 또는 `tokenCant` 메서드로 확인할 수 있습니다.

```php
if ($user->tokenCan('server:update')) {
    // ...
}

if ($user->tokenCant('server:update')) {
    // ...
}
```

<a name="token-ability-middleware"></a>
#### 토큰 기능 미들웨어

Sanctum은 전달받은 요청이 "특정 기능"이 부여된 토큰으로 인증되었는지 검사하기 위해 사용할 수 있는 두 가지 미들웨어를 제공합니다. 우선, 애플리케이션의 `bootstrap/app.php` 파일에 다음과 같이 미들웨어 별칭을 등록하세요.

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

`abilities` 미들웨어는 요청의 토큰이 지정한 모든 기능(abilities)을 가지고 있는지 확인할 때 사용합니다.

```php
Route::get('/orders', function () {
    // 토큰에 "check-status"와 "place-orders" 기능이 모두 있어야 함...
})->middleware(['auth:sanctum', 'abilities:check-status,place-orders']);
```

`ability` 미들웨어는 요청의 토큰이 지정한 기능 중 하나라도 가지고 있으면 허용합니다.

```php
Route::get('/orders', function () {
    // 토큰에 "check-status" 또는 "place-orders" 중 하나의 기능이 있으면 허용...
})->middleware(['auth:sanctum', 'ability:check-status,place-orders']);
```

<a name="first-party-ui-initiated-requests"></a>
#### 1st-Party UI에서 발생한 요청

편의상, 만약 인증된 요청이 자체 SPA UI에서 발생했고, Sanctum의 내장 [SPA 인증](#spa-authentication)을 사용한다면, `tokenCan` 메서드는 언제나 `true`를 반환합니다.

하지만 이것이 곧 사용자가 모든 동작을 할 수 있어야 한다는 뜻은 아닙니다. 일반적으로, 애플리케이션의 [인가 정책(authorization policy)](/docs/authorization#creating-policies)에서 토큰이 필요한 권한을 가졌는지, 그리고 현재 사용자 인스턴스가 실제로 해당 행위를 할 자격이 있는지를 함께 검사해야 합니다.

예를 들어, 서버를 관리하는 애플리케이션이라고 할 때, 아래와 같이 토큰이 서버 업데이트 기능을 가지는지, 해당 서버가 사용자 소유인지 모두 검사할 수 있습니다.

```php
return $request->user()->id === $server->user_id &&
       $request->user()->tokenCan('server:update')
```

SPA에서의 요청에 대해 항상 `tokenCan`이 `true`를 반환하는 것이 다소 이상하게 느껴질 수 있지만, 이 방식으로 구현하면 항상 토큰이 있다고 가정하고 `tokenCan`을 쉽게 검사할 수 있습니다. 덕분에 인가 정책 내에서 요청이 UI에서 발생했는지, 외부에서 발생했는지 걱정 없이 항상 동일하게 `tokenCan`를 사용할 수 있습니다.

<a name="protecting-routes"></a>
### 라우트 보호하기

모든 요청이 인증을 반드시 거치도록 하려면 `routes/web.php` 또는 `routes/api.php`의 보호하려는 라우트에서 `sanctum` 인증 가드를 지정해야 합니다. 이 가드는 요청이 상태 유지(session/cookie 기반) 방식인지, 아니면 3rd-party의 유효한 API 토큰이 헤더에 포함되어 있는지 모두 체크합니다.

특히, `routes/web.php`에서도 `sanctum` 가드를 사용하라고 안내하는 이유는, Sanctum이 첫 단계에서 라라벨의 세션 쿠키를 통한 인증을 시도하기 때문입니다. 쿠키가 없다면 Authorization 헤더의 토큰으로 인증을 시도합니다. 또한, Sanctum을 통해 인증받으면 인증된 사용자 인스턴스에서 언제든 `tokenCan`을 호출할 수 있습니다.

```php
use Illuminate\Http\Request;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
```

<a name="revoking-tokens"></a>
### 토큰 폐기(무효화)

토큰을 폐기(무효화)하려면, `Laravel\Sanctum\HasApiTokens` 트레잇에서 제공하는 `tokens` 관계를 사용해서 데이터베이스에서 삭제하면 됩니다.

```php
// 모든 토큰 폐기
$user->tokens()->delete();

// 현재 요청을 인증한 토큰만 폐기
$request->user()->currentAccessToken()->delete();

// 특정 토큰만 폐기
$user->tokens()->where('id', $tokenId)->delete();
```

<a name="token-expiration"></a>
### 토큰 만료

Sanctum 토큰은 기본적으로 만료되지 않으며, [토큰을 폐기](#revoking-tokens)해야만 무효화됩니다. 만약 토큰에 만료시간을 지정하고 싶다면, 애플리케이션의 `sanctum` 설정 파일에서 `expiration` 옵션 값을 설정하세요. 이 값은 토큰이 발급된 후 만료되기까지의 시간(분)을 의미합니다.

```php
'expiration' => 525600,
```

토큰마다 만료시간을 독립적으로 지정하고 싶을 때는, `createToken` 메서드의 세 번째 인수로 만료시간을 전달하면 됩니다.

```php
return $user->createToken(
    'token-name', ['*'], now()->addWeek()
)->plainTextToken;
```

만약 토큰 만료를 설정했다면, 만료된 토큰들을 주기적으로 DB에서 정리하는 작업도 설정하는 것이 좋습니다. Sanctum은 이를 위해 `sanctum:prune-expired` 아티즌 명령어를 제공합니다. 예를 들어, 만료된 지 24시간 이상 지난 토큰을 매일 삭제하는 작업을 예약할 수 있습니다.

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('sanctum:prune-expired --hours=24')->daily();
```

<a name="spa-authentication"></a>
## SPA 인증

Sanctum은 라라벨 기반 API와 통신하는 SPA(싱글 페이지 애플리케이션) 인증을 간편하게 처리할 수 있도록 도와줍니다. SPA는 라라벨 애플리케이션과 동일한 저장소에 있거나, 별도의 저장소일 수도 있습니다.

이 기능을 사용할 때 Sanctum은 별도의 토큰을 사용하지 않습니다. 대신, 라라벨의 기본 쿠키 기반 세션 인증 서비스가 활용됩니다. 이 방식은 CSRF 보호, 세션 인증, 인증 정보의 XSS 유출 방지 등 여러 이점이 있습니다.

> [!WARNING]
> 인증이 제대로 작동하려면 SPA와 API가 반드시 동일한 최상위 도메인을 공유해야 합니다. 단, 서로 다른 서브도메인에 위치하는 것은 허용됩니다. 또한 요청을 보낼 때 반드시 `Accept: application/json` 헤더와, `Referer` 또는 `Origin` 헤더도 함께 전송해야 합니다.

<a name="spa-configuration"></a>
### 설정

<a name="configuring-your-first-party-domains"></a>
#### 1st-Party 도메인 구성

먼저, SPA가 요청을 보내는 도메인을 설정해야 합니다. 이는 `sanctum` 설정 파일의 `stateful` 옵션에서 지정할 수 있습니다. 이 설정은 해당 도메인에서 들어오는 요청에 대해 라라벨 세션 쿠키를 사용하는 ‘상태 유지’ 인증 여부를 결정합니다.

첫 번째 파티 도메인 설정에 도움이 되도록 Sanctum에서 제공하는 두 가지 헬퍼 함수를 설정에 포함할 수 있습니다. `Sanctum::currentApplicationUrlWithPort()`는 `.env` 파일의 `APP_URL` 값을 반환하고, `Sanctum::currentRequestHost()`는 stateful 도메인 리스트에 플레이스홀더로 추가해 실행 시 현재 요청의 호스트로 대체합니다. 이로써 같은 도메인에서 오는 모든 요청이 상태 유지로 취급됩니다.

> [!WARNING]
> 포트 번호가 포함된 URL(예: `127.0.0.1:8000`)로 애플리케이션에 접근한다면, 반드시 포트 번호까지 포함시켜야 합니다.

<a name="sanctum-middleware"></a>
#### Sanctum 미들웨어

다음으로, SPA로부터의 요청은 라라벨 세션 쿠키를 통한 인증을 허용하는 반면, 외부나 모바일 앱에서는 API 토큰 인증이 동시에 허용되도록 해야 합니다. 이를 쉽게 구현하려면, `bootstrap/app.php`에 `statefulApi` 미들웨어 메서드를 호출하면 됩니다.

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->statefulApi();
})
```

<a name="cors-and-cookies"></a>
#### CORS와 쿠키 설정

다른 서브도메인에서 실행되는 SPA에서 인증이 제대로 작동하지 않는다면, 대부분 CORS(교차 출처 리소스 공유) 또는 세션 쿠키 설정이 올바르지 않은 경우가 많습니다.

`config/cors.php` 파일은 기본적으로 배포되지 않습니다. 라라벨의 CORS 옵션을 커스터마이즈해야 한다면, `config:publish` 아티즌 명령어를 통해 전체 cors 설정 파일을 배포할 수 있습니다.

```shell
php artisan config:publish cors
```

이후, CORS 설정에서 반드시 응답 헤더에 `Access-Control-Allow-Credentials: True`가 포함되도록 해주어야 합니다. 이는 `config/cors.php`의 `supports_credentials` 옵션을 `true`로 설정하면 됩니다.

그리고, Axios를 사용한다면, 전역 `axios` 인스턴스에서 `withCredentials`와 `withXSRFToken` 옵션을 반드시 활성화해야 합니다. 일반적으로 `resources/js/bootstrap.js` 파일에서 설정합니다. 다른 HTTP 클라이언트를 사용한다면 해당 클라이언트에서도 동일하게 설정해야 합니다.

```js
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;
```

마지막으로, 세션 쿠키의 도메인 설정이 모든 서브도메인을 지원하도록 `config/session.php`의 domain 값을 꼭 점(`.`)으로 시작하도록 지정해야 합니다.

```php
'domain' => '.domain.com',
```

<a name="spa-authenticating"></a>
### 인증하기

<a name="csrf-protection"></a>
#### CSRF 보호

여러분의 SPA에서 인증을 시작하려면, 먼저 SPA의 로그인 페이지가 `/sanctum/csrf-cookie` 엔드포인트에 요청을 보내어 CSRF 보호를 초기화해야 합니다.

```js
axios.get('/sanctum/csrf-cookie').then(response => {
    // 로그인 작업...
});
```

이 요청이 처리되면, 라라벨이 현재 CSRF 토큰이 포함된 `XSRF-TOKEN` 쿠키를 클라이언트에게 설정해줍니다. 이후에는 이 토큰을 URL 디코딩해서 요청의 `X-XSRF-TOKEN` 헤더로 같이 전달해야 하며, Axios나 Angular HttpClient 같은 일부 라이브러리는 이 과정을 자동으로 처리해 줍니다. 직접 HTTP 요청을 만드는 경우에는 반드시 수동으로 `XSRF-TOKEN` 쿠키 값을 URL 디코드해 `X-XSRF-TOKEN` 헤더로 전달해야 합니다.

<a name="logging-in"></a>
#### 로그인

CSRF 보호가 초기화되면, 이제 라라벨 애플리케이션의 `/login` 라우트로 `POST` 요청을 보낼 수 있습니다. 이 `/login` 라우트는 [직접 구현](/docs/authentication#authenticating-users)하거나, [Laravel Fortify](/docs/fortify)와 같은 헤드리스 인증 패키지를 사용할 수도 있습니다.

로그인에 성공하면 세션 쿠키가 브라우저에 발급되고, 이후의 모든 요청에서는 세션 쿠키로 자동 인증이 됩니다. 또한, 앞서 `/sanctum/csrf-cookie` 경로로 이미 요청을 보냈으므로, 이후 모든 요청에는 CSRF 보호가 자동으로 적용됩니다(단, JavaScript HTTP 클라이언트에서 `XSRF-TOKEN` 쿠키값을 `X-XSRF-TOKEN` 헤더로 전송해야 함).

사용자의 세션이 비활성 상태로 만료될 경우, 다음 요청부터는 401 또는 419 HTTP 오류가 발생할 수 있습니다. 이 때는 사용자를 SPA의 로그인 페이지로 리디렉션하면 됩니다.

> [!WARNING]
> `/login` 엔드포인트는 직접 구현해도 되지만, 반드시 라라벨의 표준 [세션 기반 인증 서비스](/docs/authentication#authenticating-users)를 사용해 인증을 처리해야 합니다. 대부분의 경우, `web` 인증 가드를 사용하면 충분합니다.

<a name="protecting-spa-routes"></a>
### SPA 라우트 보호하기

모든 요청이 인증을 거치도록 만들려면, `routes/api.php`의 API 라우트에 `sanctum` 인증 가드를 지정해야 합니다. 이렇게 하면 SPA에서의 상태유지 인증, 혹은 3rd-party의 API 토큰이 (Authorization 헤더에) 있는지 모두 검사하게 됩니다.

```php
use Illuminate\Http\Request;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
```

<a name="authorizing-private-broadcast-channels"></a>
### 프라이빗 브로드캐스트 채널 인가

SPA에서 [프라이빗/프레즌스 브로드캐스트 채널](/docs/broadcasting#authorizing-channels)에 인증이 필요하다면, 애플리케이션의 `bootstrap/app.php` 파일에서 `withRouting` 메서드의 `channels` 항목을 제거하세요. 그리고 다음과 같이 `withBroadcasting` 메서드를 대신 사용하여, 브로드캐스팅 라우트에 올바른 미들웨어를 지정해야 합니다.

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

그리고 Pusher의 인증 요청이 정상동작하도록, [Laravel Echo](/docs/broadcasting#client-side-installation) 초기화 시 별도의 커스텀 Pusher `authorizer`를 제공해야 합니다. 이렇게 하면 [cross-domain 요청을 제대로 구성한 axios 인스턴스](#cors-and-cookies)로 Pusher 인증을 처리할 수 있습니다.

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

Sanctum 토큰을 활용해 모바일 애플리케이션이 API에 요청할 때 인증을 처리할 수 있습니다. 모바일 앱 인증 방식은 3rd-party API 인증과 거의 비슷하지만, 토큰 발급 방식에 약간의 차이가 있습니다.

<a name="issuing-mobile-api-tokens"></a>
### API 토큰 발급

먼저, 사용자의 이메일/아이디, 비밀번호, 디바이스 이름을 인수로 받아 새로운 Sanctum 토큰을 반환하는 라우트를 만들어야 합니다. 이때 디바이스 이름은 아무 값이나 지정할 수 있으나, 보통 "누노의 iPhone 12"와 같이 사용자가 인식할 수 있는 이름이면 충분합니다.

일반적으로 모바일 앱의 로그인 화면에서 이 API 엔드포인트로 요청을 보내고, 엔드포인트는 발급된 평문 API 토큰을 반환합니다. 이 토큰을 모바일 디바이스에 저장해 놓았다가, 이후 모든 API 요청에 사용하면 됩니다.

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

모바일 애플리케이션에서 이 토큰을 사용할 때는 `Authorization` 헤더에 `Bearer` 토큰 형태로 포함하여 API 요청을 보내면 됩니다.

> [!NOTE]
> 모바일 애플리케이션에 토큰을 발급할 때도 [토큰 기능(abilities)](#token-abilities)을 별도로 지정할 수 있습니다.

<a name="protecting-mobile-api-routes"></a>
### 모바일 API 라우트 보호하기

앞서 설명한 것과 마찬가지로, 모든 요청이 인증을 반드시 거치도록 하려면 라우트에 `sanctum` 인증 가드를 추가하면 됩니다.

```php
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
```

<a name="revoking-mobile-api-tokens"></a>
### 모바일 API 토큰 폐기

웹 애플리케이션의 "계정 설정" UI에 모바일 디바이스별로 발급한 API 토큰 목록과 "폐기" 버튼을 제공할 수 있습니다. 사용자가 "폐기" 버튼을 클릭하면 해당 토큰을 데이터베이스에서 삭제하면 됩니다. 단, 사용자의 API 토큰 목록은 `Laravel\Sanctum\HasApiTokens` 트레잇의 `tokens` 관계로 접근할 수 있습니다.

```php
// 모든 토큰 폐기
$user->tokens()->delete();

// 특정 토큰만 폐기
$user->tokens()->where('id', $tokenId)->delete();
```

<a name="testing"></a>
## 테스트

테스트 중에는 `Sanctum::actingAs` 메서드를 사용해 테스트용 사용자를 인증시키고, 해당 토큰에 부여할 기능(abilities)도 지정할 수 있습니다.

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

모든 기능(abilities)을 토큰에 부여하고 싶다면, `actingAs` 메서드에 `*`를 능력 목록에 포함하면 됩니다.

```php
Sanctum::actingAs(
    User::factory()->create(),
    ['*']
);
```